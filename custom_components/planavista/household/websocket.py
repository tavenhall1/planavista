"""WebSocket commands for people, shared screens, setup progress, and settings.

Every command asks household/permissions.py (spec section 9.5): a PIN is
needed wherever the Home Assistant account doesn't identify one person.
The PIN commands (planavista/pin/*) are at the end of this file.
"""
from __future__ import annotations

from functools import partial
import math
import time
from typing import Any

import voluptuous as vol

from homeassistant.auth.models import User
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

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
from .permissions import Account, SessionView, may_manage_pin, parent_level
from .security import (
    SESSION_IDLE_SECONDS,
    after_failure,
    after_success,
    hash_pin,
    pause_remaining,
    tries_left,
    valid_pin,
    verify_pin,
)
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
    """The parent-mode counterpart of the admin-only save_config action (spec 6.5).

    Display settings merge into the saved ones (a None value removes one).
    """
    if _parent(hass, connection, msg, needs_file=False) is None:
        return
    changes = {
        key: msg[key]
        for key in (CONF_CALENDARS, CONF_DISPLAY, CONF_ONBOARDING_COMPLETE)
        if key in msg
    }
    await async_store_config(hass, changes, merge_display=True)
    connection.send_result(msg["id"])


# PIN fields accept any value; the handler checks the format with a fixed
# message, so Home Assistant's error logging can never quote a PIN.
INVALID_PIN = "PINs are 4 to 6 digits."


@callback
def _pin_manager(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> tuple[Household, str | None] | None:
    """The household and this command's session token, when the account may manage the PIN."""
    household = _household(hass, connection, msg)
    if household is None:
        return None
    if household.member(msg["member_id"]) is None:
        connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
        return None
    account = _account(hass, household, connection.user)
    session = _session(household, connection, msg)
    if may_manage_pin(account, session, msg["member_id"]) is None:
        _refuse(connection, msg, account)
        return None
    if not household.available:
        connection.send_error(
            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
        )
        return None
    return household, msg.get("session") if session else None


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/unlock",
        vol.Required("member_id"): str,
        vol.Required("pin"): object,
    }
)
@websocket_api.async_response
async def ws_pin_unlock(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Check a PIN and start parent mode (a parent) or the member's own session."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    member_id = msg["member_id"]
    member = household.member(member_id)
    # One check at a time per member: parallel tries must not skip a pause.
    async with household.pin_lock(member_id):
        record = household.pins.get(member_id) if member else None
        if record is None:
            connection.send_result(msg["id"], {"ok": False, "reason": "no_pin"})
            return
        now = dt_util.utcnow()
        if (wait := pause_remaining(record, now)) > 0:
            connection.send_result(
                msg["id"], {"ok": False, "reason": "paused", "retry_after": math.ceil(wait)}
            )
            return
        pin = msg["pin"] if isinstance(msg["pin"], str) else ""
        if not await hass.async_add_executor_job(verify_pin, pin, record):
            record = after_failure(record, now)
            household.pins[member_id] = record
            await household.async_save()
            wait = pause_remaining(record, now)
            connection.send_result(
                msg["id"],
                {
                    "ok": False,
                    "reason": "paused" if wait else "wrong_pin",
                    "tries_left": tries_left(record),
                    "retry_after": math.ceil(wait) if wait else None,
                },
            )
            return
        if record.get("failures") or record.get("lockouts"):
            household.pins[member_id] = after_success(record)
            await household.async_save()
    session = household.sessions.start(
        member_id, bool(member.get("parent")), connection, _monotonic()
    )
    connection.subscriptions[("planavista_session", session.token)] = partial(
        household.sessions.end, session.token
    )
    connection.send_result(
        msg["id"],
        {
            "ok": True,
            "session": session.token,
            "member_id": member_id,
            "parent": session.parent,
            "expires_in": SESSION_IDLE_SECONDS,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/set",
        vol.Required("member_id"): str,
        vol.Required("pin"): object,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Set or change a PIN. The member's other sessions end; this one stays."""
    context = _pin_manager(hass, connection, msg)
    if context is None:
        return
    household, token = context
    if not valid_pin(msg["pin"]):
        connection.send_error(msg["id"], "invalid_pin", INVALID_PIN)
        return
    household.pins[msg["member_id"]] = await hass.async_add_executor_job(hash_pin, msg["pin"])
    household.sessions.end_member(msg["member_id"], keep=token)
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/clear",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_clear(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove a PIN, unless shared screens would be left with no parent PIN."""
    context = _pin_manager(hass, connection, msg)
    if context is None:
        return
    household, token = context
    member_id = msg["member_id"]
    pins = {key: value for key, value in household.pins.items() if key != member_id}
    try:
        check_parent_pins(
            household.members, household.members, household.pins, pins, bool(household.shared_users)
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.data["security"]["pins"] = pins
    household.sessions.end_member(member_id, keep=token)
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/clear_lockout",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_clear_lockout(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """A parent ends a pause after too many wrong tries (spec 9.6)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    if (record := household.pins.get(msg["member_id"])) is not None:
        household.pins[msg["member_id"]] = after_success(record)
        await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "planavista/pin/lock", vol.Required("session"): str}
)
@callback
def ws_pin_lock(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """End a session now (Lock, or the page was hidden)."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    if household.sessions.get(msg["session"], connection, _monotonic()) is not None:
        household.sessions.end(msg["session"])
        connection.subscriptions.pop(("planavista_session", msg["session"]), None)
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "planavista/pin/touch", vol.Required("session"): str}
)
@callback
def ws_pin_touch(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Someone is using the screen: keep the session open."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    if household.sessions.get(msg["session"], connection, _monotonic(), touch=True) is None:
        connection.send_error(msg["id"], "session_ended", "The PIN session ended.")
        return
    connection.send_result(msg["id"], {"expires_in": SESSION_IDLE_SECONDS})


HOUSEHOLD_COMMANDS = (
    ws_household_subscribe,
    ws_member_save,
    ws_member_delete,
    ws_member_reorder,
    ws_shared_screen,
    ws_settings_save,
    ws_setup_save,
    ws_config_save,
    ws_pin_unlock,
    ws_pin_set,
    ws_pin_clear,
    ws_pin_clear_lockout,
    ws_pin_lock,
    ws_pin_touch,
)


@callback
def async_setup_household_websocket(hass: HomeAssistant) -> None:
    """Register the household commands (once per Home Assistant start)."""
    for command in HOUSEHOLD_COMMANDS:
        websocket_api.async_register_command(hass, command)
