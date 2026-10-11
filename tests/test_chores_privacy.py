"""Diagnostics without names, PINs, or user ids, and PINs that never leak through chores (spec 15.6, 9.8)."""
from __future__ import annotations

import json
import logging
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser
from pytest_homeassistant_custom_component.components.diagnostics import get_diagnostics_for_config_entry

from homeassistant.const import MATCH_ALL
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN

from .conftest import set_pin, ws_client_for, ws_command

PIN = "482613"


async def test_diagnostics_replace_names_and_leave_out_pins_and_users(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_client: Any
) -> None:
    assert await async_setup_component(hass, "diagnostics", {})
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", PIN)
    await hass.services.async_call(DOMAIN, "complete_chore", {"member": "casey", "chore": "yard_work"}, blocking=True)
    result = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
    assert [m["member"] for m in result["household"]["members"]] == ["Member 1", "Member 2", "Member 3", "Member 4"]
    assert result["household"]["members"][2]["has_pin"] is True
    assert result["chores"]["state"] == "ok"
    assert result["chores"]["completions"] == 1
    assert result["chores"]["stores"]["log"] == {"version": 1, "minor_version": 1}
    text = json.dumps(result)
    for secret in ("Alex", "Blair", "Casey", "Dana", PIN, '"hash"', '"salt"', "person.", accounts["kitchen"].id, accounts["casey"].id):
        assert secret not in text, secret


async def test_a_pin_never_leaks_through_chores(
    hass: HomeAssistant,
    chores: Any,
    accounts: dict[str, MockUser],
    hass_ws_client: Any,
    hass_client: Any,
    hass_storage: dict[str, Any],
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger="homeassistant.components.websocket_api")
    caplog.set_level(logging.DEBUG, logger="custom_components.planavista")
    events: list[Event] = []

    @callback
    def remember(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(MATCH_ALL, remember)
    assert await async_setup_component(hass, "diagnostics", {})
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", PIN)
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    wrong = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": "000000"})
    assert wrong["result"]["ok"] is False
    unlocked = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": PIN})
    session = unlocked["result"]["session"]
    for command in (
        {"type": "planavista/chores/complete", "occurrence": "take_out_the_trash|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/undo", "occurrence": "take_out_the_trash|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/request", "kind": "skip", "occurrence": "yard_work|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/override", "occurrence": "yard_work|casey|week:2026-10-12|0", "planned_day": "2026-10-17"},
        {"type": "planavista/chores/complete", "occurrence": "cat_care|casey|day:2026-10-13|1"},
    ):
        reply = await ws_command(kitchen, {**command, "session": session})
        assert reply["success"], reply
    await hass.services.async_call(DOMAIN, "complete_chore", {"member": "dana", "chore": "feed_the_fish"}, blocking=True)
    await hass.services.async_call(
        "todo", "update_item", {"item": "Make your bed", "status": "completed"},
        target={"entity_id": "todo.dana_chores"}, blocking=True, context=Context(user_id=accounts["kitchen"].id),
    )
    diagnostics = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
    await chores.async_flush()
    await hass.async_block_till_done()
    places = {
        "logs": caplog.text,
        "events": json.dumps([{"type": e.event_type, "data": e.data} for e in events], default=str),
        "states": json.dumps([s.as_dict() for s in hass.states.async_all()], default=str),
        "diagnostics": json.dumps(diagnostics),
        "chores files": json.dumps({k: v for k, v in hass_storage.items() if k.startswith("planavista.chores")}),
    }
    for place, text in places.items():
        assert PIN not in text, place
