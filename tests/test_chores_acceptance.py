"""Spec section 8.16's worked examples, end to end through actions and to-do lists.

The engine versions are in test_chores_examples.py; the outage is also checked
at startup in test_chores_runtime.py. Approval from a phone notification's
button arrives with phone notifications (milestone 6), so example 2 approves
through the action from Alex's own account here.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser, async_fire_time_changed

from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.core import Context, HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


async def test_1_frigate(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    """A zone sensor sees Casey take the trash out; an automation completes the chore."""
    freezer.move_to("2026-10-13T19:40:00-05:00")
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "off")
    assert await async_setup_component(hass, "automation", {"automation": {
        "triggers": [{"trigger": "state", "entity_id": "binary_sensor.curb_trash_bin_occupancy", "to": "on"}],
        "actions": [{"action": "planavista.complete_chore", "data": {"member": "person.casey", "chore": "take_out_the_trash"}}],
    }})
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "on")
    await hass.async_block_till_done()
    event = hass.states.get("event.casey_chores")
    assert (event.attributes["event_type"], event.attributes["occurrence"], event.attributes["state"]) == ("completed", TRASH, "done")
    assert (event.attributes["source"], event.attributes["stars"]) == ("automation", 1)
    assert hass.states.get("sensor.casey_stars").state == "1"
    # 4. Repeat delivery: the automation fires again within a minute.
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "off")
    freezer.tick(timedelta(seconds=30))
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "on")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.casey_stars").state == "1"
    assert len([c for c in chores.engine.log["completions"] if c["occurrence"] == TRASH]) == 1


async def test_4_repeat_delivery_answers_already_done(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    data = {"member": "person.casey", "chore": "take_out_the_trash"}
    first = await hass.services.async_call(DOMAIN, "complete_chore", data, blocking=True, return_response=True)
    freezer.tick(timedelta(seconds=40))
    second = await hass.services.async_call(DOMAIN, "complete_chore", data, blocking=True, return_response=True)
    assert (first["result"], second["result"]) == ("done", "already_done")
    assert hass.states.get("sensor.casey_stars").state == "1"


async def test_2_approval(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    """Dana checks Feed the fish on the family screen; it waits for OK until Alex approves."""
    chores.household.shared_users.append(accounts["kitchen"].id)
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", {"item": "Feed the fish", "status": "completed"},
        target={"entity_id": "todo.dana_chores"}, blocking=True, context=Context(user_id=accounts["kitchen"].id),
    )
    await hass.async_block_till_done()
    assert hass.states.get("sensor.household_approvals_waiting").state == "1"
    assert hass.states.get("sensor.dana_stars").state == "0"
    result = await hass.services.async_call(
        DOMAIN, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, blocking=True,
        return_response=True, context=Context(user_id=accounts["alex"].id),
    )
    await hass.async_block_till_done()
    assert result == {"result": "approved"}
    event = hass.states.get("event.dana_chores")
    assert (event.attributes["event_type"], event.attributes["stars"]) == ("approved", 1)
    assert hass.states.get("sensor.dana_stars").state == "1"
    completion = chores.engine.log["completions"][-1]
    assert (completion["state"], completion["source"], completion["review"]["by"]) == ("done", "tablet", "alex")


@pytest.mark.parametrize("chores_start", ["2026-10-12T09:00:00-05:00"])
async def test_3_make_it_up(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], freezer: Any) -> None:
    """Blair misses Monday's laundry; Tuesday it shows "From Mon"; done, it counts for the week."""
    monday = "laundry|blair|week:2026-10-12|0"
    freezer.move_to("2026-10-13T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.engine.log["last_day"] == "2026-10-12"
    today = await hass.services.async_call(DOMAIN, "get_chores", {"member": "blair"}, blocking=True, return_response=True)
    laundry = next(i for i in today["items"] if i["key"] == monday)
    assert (laundry["section"], laundry["from"], laundry["status"]) == ("week", "2026-10-12", "open")
    items = await hass.services.async_call(
        TODO_DOMAIN, "get_items", {}, target={"entity_id": "todo.blair_chores"}, blocking=True, return_response=True
    )
    assert next(i for i in items["todo.blair_chores"]["items"] if i["uid"] == monday)["description"] == "From Mon"
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", {"item": monday, "status": "completed"},
        target={"entity_id": "todo.blair_chores"}, blocking=True, context=Context(user_id=accounts["alex"].id),
    )
    freezer.move_to("2026-10-19T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    week = next(s for s in chores.engine.log["summaries"] if s["member"] == "blair" and s["period"] == "week:2026-10-12")
    assert monday not in week["missed"]
    assert "laundry|blair|week:2026-10-12|1" in week["missed"]  # Thursday's load was never done
