"""The screensaver (milestone 11): the household's setting, the view, and each shared screen's entities."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.household.screensaver import (
    MOTION_DOMAINS,
    SCREEN_DOMAINS,
    default_screensaver,
    entity_refusal,
    follow_shared,
    normalize_screensaver,
    screensaver_diagnostics,
)

from .conftest import ws_client_for, ws_command

SAVE = "planavista/household/settings/save"


def test_the_setting_starts_off_after_five_minutes() -> None:
    assert default_screensaver() == {"enabled": False, "after_minutes": 5, "night": None, "screens": {}}


def test_normalizing_fills_in_and_keeps_what_it_doesnt_know() -> None:
    assert normalize_screensaver(None) == default_screensaver()
    kept = normalize_screensaver({
        "enabled": "yes", "after_minutes": 7, "night": {"from": "25:00", "to": "06:30"}, "later": 1,
        "screens": {
            "u1": {"name": "Kitchen", "screen": "camera.door", "motion": "binary_sensor.kitchen", "x": 2},
            "u2": "bad", 3: {},
        },
    })
    assert kept["enabled"] is False and kept["after_minutes"] == 5 and kept["night"] is None and kept["later"] == 1
    assert kept["screens"] == {"u1": {"name": "Kitchen", "screen": None, "motion": "binary_sensor.kitchen", "x": 2}}
    assert normalize_screensaver({"after_minutes": True})["after_minutes"] == 5
    assert normalize_screensaver({"night": {"from": "22:30", "to": "06:15"}})["night"] == {"from": "22:30", "to": "06:15"}


@pytest.mark.parametrize(("entity", "screen", "motion"), [
    (None, None, None),
    ("light.kitchen_screen", None, "invalid_entity"),
    ("switch.planar", None, "invalid_entity"),
    ("input_boolean.screen", None, None),
    ("number.brightness", None, "invalid_entity"),
    ("input_number.brightness", None, "invalid_entity"),
    ("binary_sensor.motion", "invalid_entity", None),
    ("camera.planar", "invalid_entity", "invalid_entity"),
    ("Light.Bad Name", "invalid_entity", "invalid_entity"),
])
def test_which_entities_a_screen_may_use(entity: str | None, screen: str | None, motion: str | None) -> None:
    assert entity_refusal(entity, SCREEN_DOMAINS) == screen
    assert entity_refusal(entity, MOTION_DOMAINS) == motion


def test_entries_follow_the_shared_screens_and_the_last_one_turns_it_off() -> None:
    saver = {**default_screensaver(), "enabled": True}
    follow_shared(saver, ["u1", "u2"], {"u1": "Kitchen", "u2": None})
    assert saver["screens"] == {
        "u1": {"name": "Kitchen", "screen": None, "motion": None},
        "u2": {"name": None, "screen": None, "motion": None},
    }
    saver["screens"]["u1"]["screen"] = "light.kitchen_screen"
    follow_shared(saver, ["u1"], {})
    assert list(saver["screens"]) == ["u1"] and saver["screens"]["u1"]["screen"] == "light.kitchen_screen"
    assert saver["enabled"] is True
    follow_shared(saver, [], {})
    assert saver["screens"] == {} and saver["enabled"] is False


def test_diagnostics_name_only_the_kinds_of_entity() -> None:
    saver = normalize_screensaver({"enabled": True, "screens": {"u1": {"name": "Kitchen", "screen": "light.kitchen_screen"}}})
    assert screensaver_diagnostics(saver) == {
        "enabled": True, "after_minutes": 5, "night": None, "screens": [{"screen": "light", "motion": None}],
    }


async def _view(client: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    assert (await client.receive_json())["success"]
    return (await client.receive_json())["event"]


@pytest.fixture
def kitchen_shared(accounts: dict[str, MockUser], household: Any) -> str:
    """The wall tablet's account is a shared screen."""
    household.shared_users.append(accounts["kitchen"].id)
    follow_shared(household.data["security"]["screensaver"], household.shared_users, {accounts["kitchen"].id: "Kitchen"})
    return accounts["kitchen"].id


async def test_the_view_lists_each_shared_screen(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen_shared: str
) -> None:
    view = await _view(await hass_ws_client(hass))
    assert view["security"]["screensaver"] == {
        "enabled": False, "after_minutes": 5, "night": None,
        "screens": [{"user_id": kitchen_shared, "name": "Kitchen", "screen": None, "motion": None}],
    }


async def test_a_parent_turns_it_on_and_sets_its_times_and_entities(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen_shared: str
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    reply = await ws_command(client, {
        "type": SAVE, "screensaver_enabled": True, "screensaver_after": 10,
        "screensaver_night": {"from": "22:30", "to": "06:15"},
        "screensaver_screen": {"user": kitchen_shared, "screen": "light.kitchen_screen", "motion": "binary_sensor.kitchen_motion"},
    })
    assert reply["success"], reply
    saver = household.data["security"]["screensaver"]
    assert (saver["enabled"], saver["after_minutes"], saver["night"]) == (True, 10, {"from": "22:30", "to": "06:15"})
    assert saver["screens"][kitchen_shared] == {
        "name": "Kitchen", "screen": "light.kitchen_screen", "motion": "binary_sensor.kitchen_motion",
    }
    reply = await ws_command(client, {"type": SAVE, "screensaver_night": None, "screensaver_screen": {"user": kitchen_shared, "motion": None}})
    assert reply["success"]
    assert saver["night"] is None and saver["screens"][kitchen_shared]["screen"] == "light.kitchen_screen"
    assert saver["screens"][kitchen_shared]["motion"] is None
    for bad in ({"screensaver_after": 7}, {"screensaver_enabled": "yes"}, {"screensaver_night": {"from": "9pm", "to": "06:00"}}):
        refused = await ws_command(client, {"type": SAVE, **bad})
        assert not refused["success"], bad


@pytest.mark.parametrize(("pick", "code"), [
    ({"user": "someone", "screen": None}, "not_shared"),
    ({"screen": "camera.planar"}, "invalid_entity"),
    ({"motion": "light.kitchen"}, "invalid_entity"),
])
async def test_refusals_say_why(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen_shared: str,
    pick: dict[str, Any], code: str,
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    refused = await ws_command(client, {"type": SAVE, "screensaver_screen": {"user": kitchen_shared, **pick}})
    assert not refused["success"] and refused["error"]["code"] == code
    assert household.data["security"]["screensaver"]["screens"][kitchen_shared]["screen"] is None


async def test_it_needs_a_shared_screen(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    refused = await ws_command(client, {"type": SAVE, "screensaver_enabled": True})
    assert not refused["success"] and refused["error"]["code"] == "no_shared_screen"
    assert household.data["security"]["screensaver"]["enabled"] is False


async def test_a_member_cant_change_it(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen_shared: str
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(client, {"type": SAVE, "screensaver_enabled": True})
    assert not refused["success"]
    assert household.data["security"]["screensaver"]["enabled"] is False


async def test_unmarking_the_last_shared_screen_turns_it_off(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen_shared: str
) -> None:
    household.data["security"]["screensaver"]["enabled"] = True
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    session = None  # the admin's own login is parent level
    reply = await ws_command(client, {"type": SAVE, "screensaver_after": 15})
    assert reply["success"], session
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    from .conftest import set_pin
    await set_pin(hass, household, "blair", "482613")
    unlock = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "blair", "pin": "482613"})
    reply = await ws_command(kitchen, {"type": "planavista/household/shared_screen", "shared": False, "session": unlock["result"]["session"]})
    assert reply["success"], reply
    saver = household.data["security"]["screensaver"]
    assert saver["screens"] == {} and saver["enabled"] is False
