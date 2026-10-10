"""WebSocket commands for people, shared screens, setup progress, and settings.

Every command asks household/permissions.py (spec section 9.5): a PIN is
needed wherever the Home Assistant account doesn't identify one person.
The PIN commands (planavista/pin/*) are at the end of this file.
"""
from __future__ import annotations

import time
from typing import Any

import voluptuous as vol

from homeassistant.auth.models import User
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..const import CONF_CALENDARS, CONF_DISPLAY, CONF_ONBOARDING_COMPLETE, DOMAIN
from ..services import CALENDAR_CONFIG_SCHEMA, DISPLAY_SCHEMA, async_store_config
from .members import (
    MemberError,
    add_member,
    check_parent_pins,
    ordered,
    parents_with_pins,
    public_member,
    remove_member,
    reorder_members,
    update_member,
)
from .permissions import Account, SessionView, parent_level
from .store import DATA_HOUSEHOLD, Household

# What the card shows when a change breaks a rule (spec 11.7: say what to do).
ERROR_MESSAGES = {
    "name_required": "Add a name.",
    "name_too_long": "Use a name of 40 letters or fewer.",
    "name_taken": "Someone already has that name.",
    "color_taken": "Someone already has that color.",
    "invalid_color": "Pick one of the colors shown.",
    "person_taken": "That Home Assistant person already belongs to someone.",
    "invalid_person": "Pick a Home Assistant person.",
    "invalid_picture": "Pick an initial, an emoji, or their photo.",
    "invalid_age_group": "Pick an age group.",
    "invalid_my_day": "Pick a My day style.",
    "invalid_needs_ok_for": "Pick when they need an OK.",
    "invalid_stars": "Stars are on or off.",
    "invalid_parent": "Parent is on or off.",
    "too_many": "A household can have up to 20 people.",
    "unknown_member": "That person was removed on another screen.",
    "changed": "This changed on another screen.",
    "invalid_order": "The list changed on another screen. Try again.",
    "last_parent_pin": "A shared screen needs at least one parent with a PIN.",
    "needs_parent_pin": "Set a PIN for a parent first, so someone can open Settings here.",
}

MEMBER_FIELDS = vol.Schema(
    {
        vol.Optional("name"): str,
        vol.Optional("color"): str,
        vol.Optional("picture"): dict,
        vol.Optional("age_group"): str,
        vol.Optional("parent"): bool,
        vol.Optional("person"): vol.Any(None, str),
        vol.Optional("my_day"): str,
        vol.Optional("needs_ok_for"): str,
        vol.Optional("stars"): bool,
    }
)


def _monotonic() -> float:
    """The session clock (tests replace it)."""
    return time.monotonic()


@callback
def _account(hass: HomeAssistant, household: Household, user: User) -> Account:
    """What kind of account `user` is: linked through a person to a member, or not."""
    member = None
    for state in hass.states.async_all("person"):
        if state.attributes.get("user_id") == user.id:
            member = next(
                (m for m in household.members if m.get("person") == state.entity_id), None
            )
            break
    return Account(
        user_id=user.id,
        is_admin=user.is_admin,
        shared=user.id in household.shared_users,
        member_id=member["id"] if member else None,
        member_is_parent=bool(member and member.get("parent")),
    )


@callback
def _session(
    household: Household, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> SessionView | None:
    """The command's session when it names a live one on this connection (counts as activity)."""
    session = household.sessions.get(msg.get("session"), connection, _monotonic(), touch=True)
    return SessionView(session.member_id, session.parent) if session else None


@callback
def _household(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> Household | None:
    household = hass.data.get(DATA_HOUSEHOLD)
    if household is None:
        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
    return household


@callback
def _refuse(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], account: Account
) -> None:
    if account.screen_rules:
        connection.send_error(
            msg["id"], "parent_mode_required", "A parent's PIN is needed on this screen."
        )
    else:
        connection.send_error(msg["id"], "not_allowed", "Only a parent can do this.")


@callback
def _parent(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    needs_file: bool = True,
) -> tuple[Household, str] | None:
    """The household and who acts as a parent, or None after saying why not."""
    household = _household(hass, connection, msg)
    if household is None:
        return None
    account = _account(hass, household, connection.user)
    by = parent_level(account, _session(household, connection, msg))
    if by is None:
        _refuse(connection, msg, account)
        return None
    if needs_file and not household.available:
        connection.send_error(
            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
        )
        return None
    return household, by


@callback
def _member_error(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], err: MemberError
) -> None:
    connection.send_error(
        msg["id"], err.code, ERROR_MESSAGES.get(err.code, "That change can't be saved.")
    )


@callback
def _view(hass: HomeAssistant, household: Household, user: User) -> dict[str, Any]:
    """What one account sees: people (never PIN data), its own kind, and setup progress."""
    account = _account(hass, household, user)
    return {
        "available": household.available,
        "members": [
            public_member(m, household.pins.get(m["id"])) for m in ordered(household.members)
        ],
        "account": {
            "user_id": user.id,
            "name": user.name,
            "is_admin": user.is_admin,
            "shared": account.shared,
            "kind": account.kind,
            "member_id": account.member_id,
            "parent_level": parent_level(account, None) is not None,
        },
        "security": {
            "shuffle_keypad": household.data["security"]["shuffle_keypad"],
            "shared_screens": len(household.shared_users),
        },
        "modules": household.data["modules"],
        "setup": household.data["setup"],
    }


@websocket_api.websocket_command({vol.Required("type"): "planavista/household/subscribe"})
@callback
def ws_household_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send the household now and after every change, until unsubscribed."""
    household = _household(hass, connection, msg)
    if household is None:
        return

    @callback
    def forward() -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], _view(hass, household, connection.user))
        )

    connection.subscriptions[msg["id"]] = household.async_listen(forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/save",
        vol.Optional("member_id"): str,
        vol.Optional("rev"): int,
        vol.Required("member"): MEMBER_FIELDS,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add someone, or change them (with the revision the editor started from)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    try:
        if "member_id" in msg:
            members, member = update_member(
                household.members, msg["member_id"], msg["member"], msg.get("rev")
            )
        else:
            members, member = add_member(household.members, msg["member"])
        check_parent_pins(
            household.members,
            members,
            household.pins,
            household.pins,
            bool(household.shared_users),
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.members = members
    if not member["parent"]:
        household.sessions.end_parent_mode(member["id"])
    await household.async_save()
    connection.send_result(
        msg["id"], {"member": public_member(member, household.pins.get(member["id"]))}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/delete",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove someone. Their calendars stay and belong to no one."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    member_id = msg["member_id"]
    pins = {key: value for key, value in household.pins.items() if key != member_id}
    try:
        members = remove_member(household.members, member_id)
        check_parent_pins(
            household.members, members, household.pins, pins, bool(household.shared_users)
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.members = members
    household.data["security"]["pins"] = pins
    household.sessions.end_member(member_id)
    await household.async_save()

    entry = next(iter(hass.config_entries.async_loaded_entries(DOMAIN)), None)
    calendars = entry.data.get(CONF_CALENDARS, []) if entry else []
    if any(cal.get("member_id") == member_id for cal in calendars):
        await async_store_config(
            hass,
            {
                CONF_CALENDARS: [
                    {**cal, "member_id": None} if cal.get("member_id") == member_id else cal
                    for cal in calendars
                ]
            },
        )
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/reorder",
        vol.Required("order"): [str],
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_reorder(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Put people in a new order (the order on the board and in PIN prompts)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    try:
        household.members = reorder_members(household.members, msg["order"])
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/shared_screen",
        vol.Required("shared"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_shared_screen(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Mark or unmark the account this screen signs in with as a shared family screen."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    users = [user_id for user_id in household.shared_users if user_id != connection.user.id]
    if msg["shared"]:
        if not parents_with_pins(household.members, household.pins):
            connection.send_error(
                msg["id"], "needs_parent_pin", ERROR_MESSAGES["needs_parent_pin"]
            )
            return
        users.append(connection.user.id)
    household.data["security"]["shared_users"] = users
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/settings/save",
        vol.Optional("shuffle_keypad"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_settings_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Household-wide PIN settings (today, Shuffle the keypad)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    if "shuffle_keypad" in msg:
        household.data["security"]["shuffle_keypad"] = msg["shuffle_keypad"]
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/setup/save",
        vol.Optional("step"): vol.Any(None, str),
        vol.Optional("completed"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_setup_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Where first-run setup picks up, and whether it is finished."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    for key in ("step", "completed"):
        if key in msg:
            household.data["setup"][key] = msg[key]
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/config/save",
        vol.Optional("session"): str,
        vol.Optional(CONF_CALENDARS): [CALENDAR_CONFIG_SCHEMA],
        vol.Optional(CONF_DISPLAY): DISPLAY_SCHEMA,
        vol.Optional(CONF_ONBOARDING_COMPLETE): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The parent-mode counterpart of the admin-only save_config action (spec 6.5)."""
    if _parent(hass, connection, msg, needs_file=False) is None:
        return
    changes = {
        key: msg[key]
        for key in (CONF_CALENDARS, CONF_DISPLAY, CONF_ONBOARDING_COMPLETE)
        if key in msg
    }
    await async_store_config(hass, changes)
    connection.send_result(msg["id"])


HOUSEHOLD_COMMANDS = (
    ws_household_subscribe,
    ws_member_save,
    ws_member_delete,
    ws_member_reorder,
    ws_shared_screen,
    ws_settings_save,
    ws_setup_save,
    ws_config_save,
)


@callback
def async_setup_household_websocket(hass: HomeAssistant) -> None:
    """Register the household commands (once per Home Assistant start)."""
    for command in HOUSEHOLD_COMMANDS:
        websocket_api.async_register_command(hass, command)
