"""Kiosk mode (milestone 9): the household's setting, the view, and who may step out of it."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.household.kiosk import (
    KIOSK_TOP_BARS,
    default_kiosk,
    exit_refusal,
    may_change_kiosk,
    normalize_kiosk,
)

from .conftest import set_pin, ws_client_for, ws_command


def test_the_setting_starts_off_with_the_top_bar_hidden() -> None:
    assert default_kiosk() == {"enabled": False, "top_bar": "hidden"}
    assert KIOSK_TOP_BARS == ("hidden", "tabs")


def test_normalizing_fills_in_and_keeps_what_it_doesnt_know() -> None:
    assert normalize_kiosk(None) == default_kiosk()
    assert normalize_kiosk("on") == default_kiosk()
    assert normalize_kiosk({"enabled": True}) == {"enabled": True, "top_bar": "hidden"}
    assert normalize_kiosk({"enabled": "yes", "top_bar": "menu"}) == default_kiosk()
    # A later version's field survives a save by this one (rollback-safe, spec 7.8).
    assert normalize_kiosk({"enabled": True, "top_bar": "tabs", "later": 1}) == {
        "enabled": True, "top_bar": "tabs", "later": 1,
    }


@pytest.mark.parametrize(
    ("enabled", "shared", "parent_session", "parent_is_admin", "refusal"),
    [
        (True, True, True, True, None),
        (False, True, True, True, "kiosk_off"),
        (True, False, True, True, "not_shared"),
        (True, True, False, True, "parent_mode_required"),
        (True, True, True, False, "not_admin"),
    ],
)
def test_only_an_admin_parent_steps_out_on_a_shared_screen_in_kiosk_mode(
    enabled: bool, shared: bool, parent_session: bool, parent_is_admin: bool, refusal: str | None
) -> None:
    assert (
        exit_refusal(enabled=enabled, shared=shared, parent_session=parent_session, parent_is_admin=parent_is_admin)
        == refusal
    )


@pytest.mark.parametrize(
    ("shared", "account_admin", "session_parent_admin", "allowed"),
    [
        (False, True, False, True),  # an admin's own login
        (True, False, True, True),  # the tablet, with an admin parent's PIN
        (True, True, False, False),  # a shared admin login still needs an admin parent's PIN
        (True, False, False, False),  # the tablet, with a parent who isn't an admin
        (False, False, False, False),  # a parent's own login that isn't an admin
    ],
)
def test_who_may_change_kiosk_mode(shared: bool, account_admin: bool, session_parent_admin: bool, allowed: bool) -> None:
    assert may_change_kiosk(shared=shared, account_admin=account_admin, session_parent_admin=session_parent_admin) is allowed


async def _view(client: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    assert (await client.receive_json())["success"]
    return (await client.receive_json())["event"]


async def test_the_view_says_whether_kiosk_mode_is_on(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    view = await _view(await hass_ws_client(hass))
    assert view["security"]["kiosk"] == {"enabled": False, "top_bar": "hidden"}
    household.data["security"]["kiosk"] = {"enabled": True, "top_bar": "tabs"}
    view = await _view(await hass_ws_client(hass))
    assert view["security"]["kiosk"] == {"enabled": True, "top_bar": "tabs"}


async def test_a_parent_turns_kiosk_mode_on_and_picks_the_top_bar(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    reply = await ws_command(
        client, {"type": "planavista/household/settings/save", "kiosk_enabled": True, "kiosk_top_bar": "tabs"}
    )
    assert reply["success"]
    assert household.data["security"]["kiosk"] == {"enabled": True, "top_bar": "tabs"}
    reply = await ws_command(client, {"type": "planavista/household/settings/save", "kiosk_enabled": False})
    assert reply["success"]
    assert household.data["security"]["kiosk"] == {"enabled": False, "top_bar": "tabs"}
    for bad in ({"kiosk_enabled": "yes"}, {"kiosk_top_bar": "menu"}):
        refused = await ws_command(client, {"type": "planavista/household/settings/save", **bad})
        assert not refused["success"], bad


async def test_a_member_cant_change_kiosk_mode(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(client, {"type": "planavista/household/settings/save", "kiosk_enabled": True})
    assert not refused["success"]
    assert household.data["security"]["kiosk"]["enabled"] is False


PIN = "482613"
CASEY_PIN = "731946"


@pytest.fixture
async def kitchen(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> Any:
    """The wall tablet in kiosk mode; Blair (a parent) and Casey (a teen) have PINs."""
    household.shared_users.append(accounts["kitchen"].id)
    household.data["security"]["kiosk"] = {"enabled": True, "top_bar": "hidden"}
    await set_pin(hass, household, "blair", PIN)
    await set_pin(hass, household, "casey", CASEY_PIN)
    return await ws_client_for(hass, hass_ws_client, accounts["kitchen"])


def _blair_is(hass: HomeAssistant, user: MockUser | None) -> None:
    """Link Blair's person to a login (an admin's, in these tests), or to none."""
    attributes: dict[str, Any] = {"friendly_name": "Blair"}
    if user is not None:
        attributes["user_id"] = user.id
    hass.states.async_set("person.blair", "home", attributes)


async def _unlock(client: Any, member_id: str, pin: str) -> dict[str, Any]:
    reply = await ws_command(client, {"type": "planavista/pin/unlock", "member_id": member_id, "pin": pin})
    return reply["result"]


async def _exit(client: Any, session: str | None) -> dict[str, Any]:
    fields: dict[str, Any] = {"type": "planavista/kiosk/exit"}
    if session is not None:
        fields["session"] = session
    return await ws_command(client, fields)


async def test_unlock_says_whether_this_parent_is_an_admin(
    hass: HomeAssistant, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    """The answer is about the parent, not the moment, so a switch turned on later still offers Exit (review)."""
    # Blair's person has no login, so she isn't an admin.
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is False
    _blair_is(hass, accounts["admin"])
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is True
    # A teen's PIN never is a parent's.
    assert (await _unlock(kitchen, "casey", CASEY_PIN))["admin_parent"] is False
    # Kiosk mode off doesn't change who the parent is.
    household.data["security"]["kiosk"]["enabled"] = False
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is True


async def test_admin_parent_needs_an_active_admin_login_behind_the_person(
    hass: HomeAssistant, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    from homeassistant.auth.const import GROUP_ID_ADMIN

    admins = await hass.auth.async_get_group(GROUP_ID_ADMIN)
    # A login that isn't an admin.
    _blair_is(hass, accounts["alex"])
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is False
    # An admin login that has been turned off.
    retired = MockUser(name="Retired", is_active=False, groups=[admins]).add_to_hass(hass)
    _blair_is(hass, retired)
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is False
    # A login that was removed.
    hass.states.async_set("person.blair", "home", {"friendly_name": "Blair", "user_id": "no-such-user"})
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is False
    # A person that no longer exists.
    hass.states.async_remove("person.blair")
    assert (await _unlock(kitchen, "blair", PIN))["admin_parent"] is False


async def test_a_parent_who_unlocked_before_kiosk_mode_was_on_can_exit_once_it_is(
    hass: HomeAssistant, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    """Seen in review: turning the switch on in parent mode left no Exit until a new PIN."""
    household.data["security"]["kiosk"]["enabled"] = False
    _blair_is(hass, accounts["admin"])
    session = (await _unlock(kitchen, "blair", PIN))["session"]
    household.data["security"]["kiosk"]["enabled"] = True
    reply = await _exit(kitchen, session)
    assert reply["success"], reply


async def test_a_parent_who_is_an_admin_exits_kiosk_mode_with_a_live_session(
    hass: HomeAssistant, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    _blair_is(hass, accounts["admin"])
    session = (await _unlock(kitchen, "blair", PIN))["session"]
    reply = await _exit(kitchen, session)
    assert reply["success"], reply
    assert reply["result"] == {}


async def test_exiting_is_refused_with_a_reason_the_card_can_say(
    hass: HomeAssistant,
    hass_ws_client: Any,
    hass_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    kitchen: Any,
) -> None:
    # No PIN yet.
    assert (await _exit(kitchen, None))["error"]["code"] == "pin_required"
    # A parent who isn't an admin.
    blair = (await _unlock(kitchen, "blair", PIN))["session"]
    assert (await _exit(kitchen, blair))["error"]["code"] == "not_admin"
    # A teen's session.
    casey = (await _unlock(kitchen, "casey", CASEY_PIN))["session"]
    assert (await _exit(kitchen, casey))["error"]["code"] == "parent_mode_required"
    # A session made on another connection doesn't count here.
    _blair_is(hass, accounts["admin"])
    blair = (await _unlock(kitchen, "blair", PIN))["session"]
    other = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    assert (await _exit(other, blair))["error"]["code"] == "pin_required"
    # Kiosk mode off.
    household.data["security"]["kiosk"]["enabled"] = False
    assert (await _exit(kitchen, blair))["error"]["code"] == "kiosk_off"
    # An account that isn't a shared screen (the admin's own login, with Blair's PIN there).
    household.data["security"]["kiosk"]["enabled"] = True
    admin = await hass_ws_client(hass)
    session = (await _unlock(admin, "blair", PIN))["session"]
    assert (await _exit(admin, session))["error"]["code"] == "not_shared"


async def test_diagnostics_show_the_kiosk_setting_and_its_refusals(
    hass: HomeAssistant, hass_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any,
    mock_config_entry: Any,
) -> None:
    from homeassistant.setup import async_setup_component
    from pytest_homeassistant_custom_component.components.diagnostics import get_diagnostics_for_config_entry

    assert await async_setup_component(hass, "diagnostics", {})
    session = (await _unlock(kitchen, "blair", PIN))["session"]
    await _exit(kitchen, session)
    result = await get_diagnostics_for_config_entry(hass, hass_client, mock_config_entry)
    assert result["household"]["kiosk"] == {"enabled": True, "top_bar": "hidden"}
    assert ("planavista/kiosk/exit", "not_admin") in [(r["command"], r["reason"]) for r in result["recent_refusals"]]


async def test_a_parent_who_isnt_an_admin_cant_change_kiosk_mode(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    """The owner's rule: a parent without admin can't exit kiosk mode, so can't turn it off either (review)."""
    blair = (await _unlock(kitchen, "blair", PIN))["session"]
    for change in ({"kiosk_enabled": False}, {"kiosk_top_bar": "tabs"}):
        refused = await ws_command(kitchen, {"type": "planavista/household/settings/save", "session": blair, **change})
        assert refused["error"]["code"] == "not_admin", change
    assert household.data["security"]["kiosk"] == {"enabled": True, "top_bar": "hidden"}
    # Her other settings still save.
    allowed = await ws_command(kitchen, {"type": "planavista/household/settings/save", "session": blair, "shuffle_keypad": True})
    assert allowed["success"]
    # A parent's own login that isn't an admin.
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    refused = await ws_command(alex, {"type": "planavista/household/settings/save", "kiosk_enabled": False})
    assert refused["error"]["code"] == "not_admin"


async def test_an_admin_or_a_parent_who_is_one_changes_kiosk_mode(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    _blair_is(hass, accounts["admin"])
    blair = (await _unlock(kitchen, "blair", PIN))["session"]
    reply = await ws_command(kitchen, {"type": "planavista/household/settings/save", "session": blair, "kiosk_top_bar": "tabs"})
    assert reply["success"], reply
    admin = await hass_ws_client(hass)
    reply = await ws_command(admin, {"type": "planavista/household/settings/save", "kiosk_enabled": False})
    assert reply["success"], reply
    assert household.data["security"]["kiosk"] == {"enabled": False, "top_bar": "tabs"}
