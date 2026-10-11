"""The chores runtime: day boundaries on time and after an outage, damaged files, saving (spec 8.9, 15.3)."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import issue_registry as ir
from homeassistant.util.file import WriteError

from custom_components.planavista.chores.engine import ChoresEngine
from custom_components.planavista.chores.model import default_log, default_rewards
from custom_components.planavista.chores.runtime import DATA_CHORES
from custom_components.planavista.chores.store import normalize_plan
from custom_components.planavista.const import DOMAIN

from .chores_sample import MEMBERS, SCENE, TZ, at, built, sample_activities
from .conftest import FakeCalendar, ws_command


async def _complete(chores: Any, chore: str) -> None:
    """Casey checks off their oldest open chore of this kind, as an automation."""
    await chores.async_run(lambda e, now: e.complete(now, chore=chore, member="casey", by="automation", source="automation"))


async def test_the_day_rolls_over_at_3_am(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    freezer.move_to("2026-10-14T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.engine.log["last_day"] == "2026-10-13"
    assert hass.states.get("event.dana_chores").attributes["event_type"] == "missed"
    assert hass.states.get("sensor.casey_chores_left").state == "2"  # Wednesday: Cat care twice


def _seed(hass_storage: dict[str, Any], *, log: dict[str, Any] | None = None, skip: str | None = None, plan_version: int = 1) -> None:
    household = {
        "members": [dict(m, rev=1, color=color, color_dark=None, picture={"initial": True}, person=None, my_day="list")
                    for m, color in zip(MEMBERS, ("#F94144", "#277DA1", "#43AA8B", "#F9C74F"), strict=True)],
        "security": {"pins": {}, "shared_users": [], "shuffle_keypad": False},
        "modules": {"chores": {"enabled": True, "set_up_at": "2026-10-10T19:02:11-05:00"}},
        "setup": {"completed": True, "step": None},
        "migrations": {"people_from_calendars": True},
    }
    plan = {"settings": {"missed": "make_up", "day_starts": "03:00", "auto_approve": "day_end",
                         "minutes_per_star": 15, "evening_check": "19:00", "sound": False},
            "activities": [built(a) for a in sample_activities()]}
    files = {
        "planavista.household": (1, household),
        "planavista.chores_plan": (plan_version, plan),
        "planavista.chores_log": (1, log or default_log()),
        "planavista.chores_rewards": (1, default_rewards()),
    }
    for key, (version, data) in files.items():
        if key != skip:
            hass_storage[key] = {"version": version, "minor_version": 1, "key": key, "data": deepcopy(data)}


@pytest.fixture
async def chicago(hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]) -> None:
    """Home Assistant in the sample household's time zone, calendars loaded."""
    await hass.config.async_update(time_zone="America/Chicago")


async def _start(hass: HomeAssistant, entry: MockConfigEntry) -> Any:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return hass.data[DATA_CHORES]


async def test_an_outage_is_caught_up_at_startup(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    """Off from Monday 11 PM to Wednesday 9 AM (spec 8.16 example 5)."""
    log = default_log() | {"last_day": "2026-10-11", "last_boundary": "2026-10-12T03:00:00-05:00",
                           "weeks": {"first_day": "monday", "before": None, "since": None}}
    log["completions"] = [{
        "id": "01JAAAAAAAAAAAAAAAAAAAAAAA", "occurrence": "feed_the_fish|dana|day:2026-10-12|0", "chore": "feed_the_fish",
        "member": "dana", "done_by": "dana", "by": "dana", "at": "2026-10-12T21:00:00-05:00", "source": "tablet",
        "user": None, "state": "pending", "review": None, "credit_minutes": 5.0, "stars": 1,
    }]
    _seed(hass_storage, log=log)
    freezer.move_to("2026-10-14T09:00:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    engine = runtime.engine
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-13", "2026-10-14T03:00:00-05:00")
    assert engine.log["completions"][0]["review"]["by"] == "auto"
    assert engine.balance("dana") == 1
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12", "day:2026-10-13"]
    assert hass.states.get("sensor.dana_stars").state == "1"


async def test_a_missing_file_holds_chores_for_a_parent(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    _seed(hass_storage, skip="planavista.chores_log")
    freezer.move_to("2026-10-13T16:10:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    assert runtime.state == "needs_a_look"
    assert hass.states.get("sensor.casey_chores_left").state == STATE_UNAVAILABLE
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_data_missing") is not None
    with pytest.raises(ServiceValidationError) as err:
        await runtime.async_run(lambda e, now: e.complete(now, chore="yard_work", member="casey", by="admin", source="tablet"))
    assert err.value.translation_key == "chores_unavailable"
    await hass.async_block_till_done()
    assert "planavista.chores_log" not in hass_storage
    await runtime.async_start_over()
    await hass.async_block_till_done()
    assert runtime.state == "ok"
    assert runtime.engine.plan["activities"] == []
    assert hass_storage["planavista.chores_log"]["data"]["completions"] == []
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_data_missing") is None
    assert hass.states.get("sensor.casey_chores_left").state == "0"


async def test_files_from_a_newer_planavista_keep_chores_off(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry
) -> None:
    _seed(hass_storage, plan_version=2)
    runtime = await _start(hass, mock_config_entry)
    assert runtime.state == "newer"
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_newer_version") is not None
    assert hass_storage["planavista.chores_plan"]["version"] == 2
    assert hass.states.get("sensor.casey_chores_left").state == STATE_UNAVAILABLE
    with pytest.raises(ServiceValidationError):
        await runtime.async_set_enabled(True)


async def test_unknown_fields_survive_a_save(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    _seed(hass_storage)
    hass_storage["planavista.chores_plan"]["data"]["future_field"] = {"kept": True}
    hass_storage["planavista.chores_plan"]["data"]["activities"][0]["future_field"] = 1
    freezer.move_to("2026-10-13T16:10:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    await runtime.async_run(lambda e, now: e.save_activity(
        now, {"name": "Wash the car", "schedule": "once", "assignees": ["alex"], "once": {}}, by="admin", source="tablet"
    ))
    await hass.async_block_till_done()
    saved = hass_storage["planavista.chores_plan"]["data"]
    assert saved["future_field"] == {"kept": True}
    assert saved["activities"][0]["future_field"] == 1


async def test_a_failed_write_raises_a_repair_and_tells_the_card(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    with patch("homeassistant.helpers.storage.Store._async_write_data", side_effect=WriteError("disk full")):
        await _complete(chores, "yard_work")
        freezer.tick(2)
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    assert chores.save_failed is True
    assert chores.feed()["save_failed"] is True
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_save_failed") is not None
    await _complete(chores, "take_out_the_trash")
    freezer.tick(2)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.save_failed is False
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_save_failed") is None


async def test_a_failed_write_is_tried_again_every_few_minutes(
    hass: HomeAssistant, chores: Any, freezer: Any, hass_storage: dict[str, Any]
) -> None:
    with patch("homeassistant.helpers.storage.Store._async_write_data", side_effect=WriteError("disk full")):
        await chores.async_run(lambda e, now: e.save_settings(now, {"sound": True}))
    assert chores.save_failed is True
    freezer.tick(timedelta(minutes=5))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert hass_storage["planavista.chores_plan"]["data"]["settings"]["sound"] is True
    assert chores.save_failed is False
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_save_failed") is None


async def test_a_failed_log_write_is_tried_again_before_the_entry_unloads(
    hass: HomeAssistant, chores: Any, freezer: Any, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry
) -> None:
    with patch("homeassistant.helpers.storage.Store._async_write_data", side_effect=WriteError("disk full")):
        await _complete(chores, "yard_work")
        freezer.tick(2)
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    assert chores.save_failed is True
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    saved = hass_storage["planavista.chores_log"]["data"]["completions"]
    assert [c["occurrence"] for c in saved] == ["yard_work|casey|week:2026-10-12|0"]


def test_chores_of_a_kind_from_a_newer_release_are_kept_and_left_alone() -> None:
    plan = normalize_plan({"activities": [
        {"id": "dish_rotation", "name": "Dish rotation", "schedule": "rotation", "assignees": ["casey"]},
    ]})
    assert [a["id"] for a in plan["activities"]] == ["dish_rotation"]  # a step back keeps them (spec 7.8)
    engine = ChoresEngine(plan, default_log(), default_rewards(), MEMBERS, tz=TZ)
    engine.start(SCENE)
    assert engine.items(SCENE) == {}
    assert engine.board(SCENE)["members"]["casey"]["items"] == []
    engine.week_view(SCENE)
    engine.catch_up(at(10, 20, 9))
    assert engine.activity("dish_rotation") is not None


async def test_a_check_off_works_out_the_day_only_a_few_times(hass: HomeAssistant, chores: Any) -> None:  # Review Focus 1
    runs = 0
    items_on = ChoresEngine._items_on

    def counted(self: ChoresEngine, day: Any, index: Any) -> Any:
        nonlocal runs
        runs += 1
        return items_on(self, day, index)

    with patch.object(ChoresEngine, "_items_on", counted):
        await hass.services.async_call(DOMAIN, "complete_chore", {"member": "casey", "chore": "yard_work"},
                                       blocking=True, return_response=True)
        await hass.async_block_till_done()
    assert hass.states.get("todo.casey_chores").state == "6"  # every list and sensor read the change (7 open before)
    assert runs <= 9  # the check-off, today once, and the week's other days


async def test_check_offs_are_saved_before_the_entry_unloads(
    hass: HomeAssistant, chores: Any, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry
) -> None:
    await _complete(chores, "yard_work")
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    saved = hass_storage["planavista.chores_log"]["data"]["completions"]
    assert [c["occurrence"] for c in saved] == ["yard_work|casey|week:2026-10-12|0"]


async def test_the_calendars_first_day_moves_chore_weeks_from_the_next_week(
    hass: HomeAssistant, chores: Any, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"first_day": "sunday"}})
    assert reply["success"]
    await hass.async_block_till_done()
    assert chores.engine.log["weeks"] == {"first_day": "sunday", "before": "monday", "since": "2026-10-19"}


async def test_a_new_time_zone_moves_the_next_boundary(hass: HomeAssistant, chores: Any) -> None:
    await hass.config.async_update(time_zone="America/Los_Angeles")
    await hass.async_block_till_done()
    assert chores.engine.next_boundary(chores.now()).isoformat() == "2026-10-14T03:00:00-07:00"
