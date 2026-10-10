"""Tests for the household WebSocket commands, for every kind of account (spec 9.5)."""
from __future__ import annotations

from copy import deepcopy
import json
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.household.store import DATA_HOUSEHOLD, STORAGE_KEY

from .conftest import CONFIGURED_CALENDARS, FakeCalendar, set_pin, ws_client_for, ws_command


async def _client(hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], who: str) -> Any:
    if who == "admin":
        return await hass_ws_client(hass)
    return await ws_client_for(hass, hass_ws_client, accounts[who])


async def _first_view(client: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    assert (await client.receive_json())["success"]
    return (await client.receive_json())["event"]


@pytest.mark.parametrize(
    ("who", "kind", "parent_level"),
    [
        ("admin", "admin", True),
        ("alex", "parent", True),
        ("casey", "member", False),
        ("guest", "other", False),
        ("kitchen", "shared", False),
    ],
)
async def test_subscribe_describes_the_account(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    who: str,
    kind: str,
    parent_level: bool,
) -> None:
    household.shared_users.append(accounts["kitchen"].id)
    view = await _first_view(await _client(hass, hass_ws_client, accounts, who))
    assert view["account"]["kind"] == kind
    assert view["account"]["parent_level"] is parent_level
    assert view["available"] is True
    assert [m["id"] for m in view["members"]] == ["alex", "blair", "casey", "dana"]
    assert view["security"] == {"shuffle_keypad": False, "shared_screens": 1}


async def test_subscribe_never_sends_pin_data(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    await set_pin(hass, household, "alex", "482613")
    view = await _first_view(await hass_ws_client(hass))
    alex = view["members"][0]
    assert (alex["has_pin"], alex["pin_length"], alex["locked_until"]) == (True, 6, None)
    text = json.dumps(view)
    assert '"hash"' not in text and '"salt"' not in text and "482613" not in text


async def test_subscribe_pushes_every_change(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    await _first_view(client)
    seen: list[dict[str, Any]] = []
    reply = await ws_command(
        client,
        {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
        seen,
    )
    assert reply["success"]
    if len(seen) == 1:
        seen.append(await client.receive_json())
    events = [m["event"] for m in seen if m["type"] == "event"]
    assert [m["id"] for m in events[-1]["members"]] == ["alex", "blair", "casey", "dana", "erin"]


PARENT_COMMANDS = [
    {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
    {"type": "planavista/household/member/reorder", "order": ["dana", "casey", "blair", "alex"]},
    {"type": "planavista/household/settings/save", "shuffle_keypad": True},
    {"type": "planavista/household/setup/save", "step": "calendars"},
    {"type": "planavista/config/save", "display": {"time_format": "24h"}},
]


@pytest.mark.parametrize("command", PARENT_COMMANDS, ids=lambda c: c["type"].split("/", 1)[1])
@pytest.mark.parametrize(
    ("who", "error"),
    [
        ("admin", None),
        ("alex", None),
        ("casey", "not_allowed"),
        ("guest", "parent_mode_required"),
        ("kitchen", "parent_mode_required"),
    ],
)
async def test_parent_commands_follow_the_account_rules(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    command: dict[str, Any],
    who: str,
    error: str | None,
) -> None:
    household.shared_users.append(accounts["kitchen"].id)
    reply = await ws_command(await _client(hass, hass_ws_client, accounts, who), command)
    if error is None:
        assert reply["success"], reply
    else:
        assert not reply["success"]
        assert reply["error"]["code"] == error


async def test_member_rules_come_back_as_error_codes(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    alex = household.member("alex")
    cases = [
        ({"member": {"name": "alex"}}, "name_taken"),
        ({"member": {"name": "Erin", "color": alex["color"]}}, "color_taken"),
        ({"member": {"name": "Erin", "person": "person.alex"}}, "person_taken"),
        ({"member_id": "nobody", "member": {"name": "X"}}, "unknown_member"),
        ({"member_id": "casey", "rev": 99, "member": {"name": "Casey B"}}, "changed"),
    ]
    for fields, code in cases:
        reply = await ws_command(client, {"type": "planavista/household/member/save", **fields})
        assert reply["error"]["code"] == code, fields
        assert reply["error"]["message"]


async def test_member_save_returns_the_public_member(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    added = await ws_command(
        client,
        {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
    )
    erin = added["result"]["member"]
    assert (erin["id"], erin["rev"], erin["has_pin"], erin["my_day"]) == ("erin", 1, False, "timeline")
    renamed = await ws_command(
        client,
        {
            "type": "planavista/household/member/save",
            "member_id": "erin",
            "rev": 1,
            "member": {"name": "Erin Lee"},
        },
    )
    assert renamed["result"]["member"]["rev"] == 2
    assert household.member("erin")["name"] == "Erin Lee"


async def test_removing_someone_frees_their_calendars_for_good(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    mock_config_entry: MockConfigEntry,
) -> None:
    client = await hass_ws_client(hass)
    calendars = [
        {
            **deepcopy(CONFIGURED_CALENDARS[0]),
            "entity_id": "calendar.test_casey",
            "display_name": "Casey",
            "person_entity": "person.casey",
        },
        {**deepcopy(CONFIGURED_CALENDARS[1]), "member_id": "dana"},
    ]
    assert (await ws_command(client, {"type": "planavista/config/save", "calendars": calendars}))["success"]
    assert [c["member_id"] for c in mock_config_entry.data["calendars"]] == ["casey", "dana"]

    for member_id in ("casey", "dana"):
        reply = await ws_command(
            client, {"type": "planavista/household/member/delete", "member_id": member_id}
        )
        assert reply["success"], reply
    rows = mock_config_entry.data["calendars"]
    assert [c["member_id"] for c in rows] == [None, None]
    assert rows[0]["person_entity"] == "person.casey"

    # A restart doesn't bring Casey back, although her calendar keeps her person.
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    hass.data.pop(DATA_HOUSEHOLD)
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DATA_HOUSEHOLD].member("casey") is None
    assert mock_config_entry.data["calendars"][0]["member_id"] is None


async def test_reorder_needs_everyone_once(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    order = ["dana", "casey", "blair", "alex"]
    assert (await ws_command(client, {"type": "planavista/household/member/reorder", "order": order}))["success"]
    view = await _first_view(client)
    assert [m["id"] for m in view["members"]] == order
    reply = await ws_command(
        client, {"type": "planavista/household/member/reorder", "order": ["dana", "casey"]}
    )
    assert reply["error"]["code"] == "invalid_order"


async def test_marking_a_shared_screen_needs_a_parent_pin(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/household/shared_screen", "shared": True})
    assert reply["error"]["code"] == "needs_parent_pin"

    await set_pin(hass, household, "blair", "4826")
    assert (await ws_command(client, {"type": "planavista/household/shared_screen", "shared": True}))["success"]
    assert household.shared_users == [accounts["admin"].id]
    # The admin's own status no longer counts on this account (spec 9.5).
    reply = await ws_command(client, {"type": "planavista/household/settings/save", "shuffle_keypad": True})
    assert reply["error"]["code"] == "parent_mode_required"


async def test_config_save_merges_display_settings(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    mock_config_entry: MockConfigEntry,
) -> None:
    """Each page saves only what it changed, so one page can't undo another's save (spec 14.1)."""
    client = await hass_ws_client(hass)
    before = dict(mock_config_entry.data["display"])
    theme = {"theme": "dark", "theme_overrides": {"accent": "#277DA1"}}
    assert (await ws_command(client, {"type": "planavista/config/save", "display": theme}))["success"]
    assert (await ws_command(client, {"type": "planavista/config/save", "display": {"time_format": "24h"}}))["success"]
    assert mock_config_entry.data["display"] == {**before, **theme, "time_format": "24h"}

    # null removes a setting, as clearing a theme's customizations does.
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"theme_overrides": None}})
    assert reply["success"]
    assert mock_config_entry.data["display"] == {**before, "theme": "dark", "time_format": "24h"}


async def test_config_save_still_works_when_the_household_file_is_newer(
    hass: HomeAssistant,
    hass_ws_client: Any,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {"version": 2, "minor_version": 1, "key": STORAGE_KEY, "data": {}}
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    before = dict(mock_config_entry.data["display"])

    saved = await ws_command(client, {"type": "planavista/config/save", "display": {"time_format": "24h"}})
    assert saved["success"]
    assert mock_config_entry.data["display"] == {**before, "time_format": "24h"}
    refused = await ws_command(
        client, {"type": "planavista/household/member/save", "member": {"name": "Erin"}}
    )
    assert refused["error"]["code"] == "unavailable"


async def test_commands_before_planavista_is_set_up(
    hass: HomeAssistant, hass_ws_client: Any
) -> None:
    assert await async_setup_component(hass, DOMAIN, {})
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/household/subscribe"})
    assert reply["error"]["code"] == "not_loaded"
