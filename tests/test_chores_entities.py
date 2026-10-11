"""Chores in Home Assistant: devices, entities, and turning chores on and off (spec 10.1, 10.2)."""
from __future__ import annotations

from typing import Any

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from custom_components.planavista.chores.runtime import DATA_CHORES
from custom_components.planavista.const import DOMAIN

MEMBERS = ("alex", "blair", "casey", "dana")
MEMBER_ENTITIES = (
    "todo.{}_chores",
    "sensor.{}_chores_left",
    "sensor.{}_chores_this_week",
    "sensor.{}_chore_time",
    "sensor.{}_stars",
    "sensor.{}_streak",
    "binary_sensor.{}_chores_done",
    "event.{}_chores",
)
HOUSEHOLD_ENTITIES = ("sensor.household_chores_left", "sensor.household_approvals_waiting")


async def _complete(hass: HomeAssistant, chores: Any, member: str, chore: str) -> None:
    """Check off a member's oldest open chore, as an automation."""
    await chores.async_run(lambda e, now: e.complete(now, chore=chore, member=member, by="automation", source="automation"))
    await hass.async_block_till_done()


def _chores_entities(hass: HomeAssistant) -> set[str]:
    return {
        e.entity_id for e in er.async_get(hass).entities.values()
        if e.platform == DOMAIN and "_chores_" in e.unique_id
    }


async def test_a_calendar_only_household_gets_nothing_from_chores(hass: HomeAssistant, household: Any) -> None:
    assert _chores_entities(hass) == set()
    assert "todo" not in hass.config.components
    devices = dr.async_entries_for_config_entry(dr.async_get(hass), next(iter(hass.config_entries.async_entries(DOMAIN))).entry_id)
    assert [d.name for d in devices] == ["Household"]
    assert hass.data[DATA_CHORES].state == "off"


async def test_turning_chores_on_makes_a_device_and_entities_for_everyone(hass: HomeAssistant, chores: Any) -> None:
    expected = {template.format(m) for m in MEMBERS for template in MEMBER_ENTITIES} | set(HOUSEHOLD_ENTITIES)
    assert _chores_entities(hass) == expected
    for entity_id in expected:
        assert hass.states.get(entity_id) is not None, entity_id
    dev_reg = dr.async_get(hass)
    casey = dev_reg.async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id)
    assert (casey.name, casey.manufacturer, casey.model) == ("Casey", "PlanaVista", "Household member")
    ent_reg = er.async_get(hass)
    assert {e.entity_id for e in er.async_entries_for_device(ent_reg, casey.id)} == {t.format("casey") for t in MEMBER_ENTITIES}
    household = dev_reg.async_get_device_by_identifier((DOMAIN, "household"), chores.entry.entry_id)
    assert {e.entity_id for e in er.async_entries_for_device(ent_reg, household.id)} == {
        *HOUSEHOLD_ENTITIES, "select.planavista_appearance",
    }


async def test_casey_at_tuesday_afternoon(hass: HomeAssistant, chores: Any) -> None:
    left = hass.states.get("sensor.casey_chores_left")
    assert left.state == "3"
    assert left.attributes["items"] == ["Cat care", "Cat care", "Take out the trash"]
    assert left.attributes["friendly_name"] == "Casey Chores left"
    week = hass.states.get("sensor.casey_chores_this_week")
    assert (week.state, week.attributes["unit_of_measurement"]) == ("0", "%")
    time = hass.states.get("sensor.casey_chore_time")
    assert (time.state, time.attributes["unit_of_measurement"]) == ("0.0", "min")
    assert (time.attributes["device_class"], time.attributes["state_class"]) == ("duration", "total")
    assert hass.states.get("sensor.casey_stars").state == "0"
    assert hass.states.get("sensor.casey_streak").state == "0"
    assert hass.states.get("binary_sensor.casey_chores_done").state == "off"
    assert hass.states.get("todo.casey_chores").state == "7"
    assert hass.states.get("sensor.household_chores_left").state == "8"
    assert hass.states.get("sensor.household_approvals_waiting").state == "0"
    event = hass.states.get("event.casey_chores")
    assert event.attributes["event_types"] == ["completed", "approved", "sent_back", "undone", "missed", "redeemed"]


async def test_a_check_off_updates_every_projection(hass: HomeAssistant, chores: Any) -> None:
    await _complete(hass, chores, "casey", "take_out_the_trash")
    assert hass.states.get("sensor.casey_chores_left").state == "2"
    assert hass.states.get("sensor.casey_stars").state == "1"
    assert hass.states.get("sensor.casey_chore_time").state == "15.0"
    event = hass.states.get("event.casey_chores")
    assert event.attributes["event_type"] == "completed"
    assert {k: event.attributes[k] for k in ("chore", "chore_name", "occurrence", "member", "done_by", "source", "stars", "state")} == {
        "chore": "take_out_the_trash", "chore_name": "Take out the trash",
        "occurrence": "take_out_the_trash|casey|week:2026-10-12|0", "member": "casey", "done_by": "casey",
        "source": "automation", "stars": 1, "state": "done",
    }


async def test_waiting_for_ok_shows_on_the_household_sensor(hass: HomeAssistant, chores: Any) -> None:
    await _complete(hass, chores, "dana", "feed_the_fish")
    waiting = hass.states.get("sensor.household_approvals_waiting")
    assert waiting.state == "1"
    assert waiting.attributes["completion"] == 1
    assert hass.states.get("binary_sensor.dana_chores_done").state == "off"


async def test_turning_chores_off_removes_them_and_keeps_the_data(
    hass: HomeAssistant, chores: Any, mock_config_entry: MockConfigEntry
) -> None:
    await _complete(hass, chores, "casey", "take_out_the_trash")
    await chores.async_set_enabled(False)
    await hass.async_block_till_done()
    assert _chores_entities(hass) == set()
    assert hass.states.get("todo.casey_chores") is None
    devices = dr.async_entries_for_config_entry(dr.async_get(hass), mock_config_entry.entry_id)
    assert [d.name for d in devices] == ["Household"]
    assert hass.states.get("select.planavista_appearance") is not None
    await chores.async_set_enabled(True)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.casey_stars").state == "1"


async def test_people_joining_renaming_and_leaving(hass: HomeAssistant, chores: Any) -> None:
    from custom_components.planavista.household.members import add_member, remove_member, update_member

    household = chores.household
    household.members, _ = add_member(household.members, {"name": "Erin", "age_group": "older_child"})
    await household.async_save()
    await hass.async_block_till_done()
    assert hass.states.get("todo.erin_chores") is not None

    household.members, _ = update_member(household.members, "casey", {"name": "Casey Jo"}, None)
    await household.async_save()
    await hass.async_block_till_done()
    device = dr.async_get(hass).async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id)
    assert device.name == "Casey Jo"
    assert hass.states.get("sensor.casey_stars") is not None

    household.members = remove_member(household.members, "casey")
    await household.async_save()
    await hass.async_block_till_done()
    assert dr.async_get(hass).async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id) is None
    assert hass.states.get("todo.casey_chores") is None
    assert chores.engine.activity("yard_work")["assignees"] == []
    assert chores.engine.activity("clean_the_bathroom")["assignees"] == ["blair"]
