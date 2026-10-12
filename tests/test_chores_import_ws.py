"""Import, restore, and export through the card's commands and the export_household action (spec 7.9, 10.4, 10.7)."""
from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.planavista.chores.runtime import STATE_NEEDS_A_LOOK
from custom_components.planavista.const import DOMAIN

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, ws_client_for, ws_command

PLAN_TEXT = (Path(__file__).parent / "fixtures" / "household_hours_sample.json").read_text("utf-8")


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """PlanaVista shows Alex's and Blair's calendars."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    return data


async def _alex(hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser]) -> Any:
    return await ws_client_for(hass, hass_ws_client, accounts["alex"])


async def test_the_preview_is_a_parents_and_says_where_things_go(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/import/preview", "text": PLAN_TEXT})
    assert refused["error"]["code"] == "not_allowed"
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/preview", "text": PLAN_TEXT})
    result = reply["result"]["preview"]
    assert result["file"]["label"] == "Household Hours plan, version 1"
    assert [p["match"] for p in result["people"]] == ["alex", "blair", "casey", "dana"]
    assert result["fills_in"] is False
    assert chores.engine.activity("vacuum") is None  # nothing saved


async def test_a_file_that_cant_be_read_says_why(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/preview", "text": "plan.txt"})
    assert reply["result"]["problem"] == {
        "code": "unknown_file", "message": "This doesn't look like a Household Hours or PlanaVista file.", "problems": [],
    }
    broken = json.dumps({"schema": "household-hours/v1", "people": [], "activities": [{"name": "Vacuum", "minHours": 0}]})
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": broken})
    assert reply["result"]["problem"]["problems"] == ["Vacuum: set how long it takes."]


async def test_importing_a_plan_adds_and_updates_chores_and_peoples_sleep(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT, "choices": {
        "on_board": {"a17": True}, "assignees": {"a15": ["p_casey"]},
    }})
    summary = reply["result"]["summary"]
    assert (summary["activities_added"], summary["activities_updated"], summary["people_added"]) == (14, 9, [])
    engine = chores.engine
    vacuum = engine.activity("vacuum")
    assert (vacuum["assignees"], vacuum["created"]["by"], vacuum["import_ref"]["id"]) == (["blair"], "alex", "a08")
    assert engine.activity("homework")["on_board"] is True
    assert engine.activity("wash_the_car")["assignees"] == ["casey"]
    laundry = engine.activity("laundry")
    assert (laundry["label"], laundry["import_ref"], laundry["rev"]) == ("2 loads", {"format": "household-hours/v1", "id": "a06"}, 2)
    assert chores.household.member("dana")["sleep_hours"] == 10.5
    assert chores.household.member("casey")["bedtime"] == {"weeknight": "22:00", "weekend": "23:00"}
    again = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert again["result"]["summary"]["activities_added"] == 0


async def test_a_new_person_without_an_age_group_stops_the_import(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    plan = json.loads(PLAN_TEXT)
    plan["people"].append({"id": "p_jordan", "name": "Jordan", "bedWk": "21:00", "bedWe": "22:00"})
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(plan)})
    assert reply["result"]["problem"]["problems"] == ["Pick an age group for Jordan."]
    assert chores.household.member("jordan") is None
    assert chores.engine.activity("vacuum") is None
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(plan),
                                    "choices": {"people": {"p_jordan": {"age_group": "older_child"}}}})
    assert reply["result"]["summary"]["people_added"] == ["Jordan"]
    assert chores.household.member("jordan")["age_group"] == "older_child"


async def test_importing_chores_turns_chores_on(
    hass: HomeAssistant, household: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    from custom_components.planavista.chores.runtime import DATA_CHORES

    runtime = hass.data[DATA_CHORES]
    assert runtime.enabled is False
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert reply["result"]["summary"]["activities_added"] == 23
    assert runtime.enabled is True
    assert runtime.engine.activity("cat_care")["times"] == 2


async def test_export_then_restore_brings_chores_back_after_they_need_a_look(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    exported = await ws_command(alex, {"type": "planavista/export"})
    file, name = exported["result"]["file"], exported["result"]["name"]
    assert name == "planavista-household-2026-10-13.json"
    assert file["format"] == "planavista.household/v1" and len(file["chores"]["activities"]) == 16
    assert "pin" not in json.dumps(file).lower()
    chores.problem = STATE_NEEDS_A_LOOK
    chores.engine.plan["activities"] = []
    looked = await ws_command(alex, {"type": "planavista/import/preview", "text": json.dumps(file)})
    assert looked["result"]["preview"]["fills_in"] is True
    plan_text = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert plan_text["error"]["code"] == "chores_need_a_look"
    restored = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    assert restored["result"]["summary"]["activities_added"] == 16
    assert chores.state == "ok"
    assert chores.engine.activity("take_out_the_trash")["assignees"] == ["casey"]


async def test_a_restore_links_calendars_planavista_shows(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any, mock_config_entry: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    file = (await ws_command(alex, {"type": "planavista/export"}))["result"]["file"]
    file["members"][1]["links"]["calendars"] = ["calendar.test_blair", "calendar.not_shown"]
    await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    rows = {row["entity_id"]: row.get("member_id") for row in mock_config_entry.data["calendars"]}
    assert rows["calendar.test_blair"] == "blair"


async def test_export_is_a_parents_on_the_card(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/export"})
    assert refused["error"]["code"] == "not_allowed"


async def test_the_export_action_is_for_admins_and_automations(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    response = await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True)
    assert response["format"] == "planavista.household/v1"
    assert [m["name"] for m in response["members"]] == ["Alex", "Blair", "Casey", "Dana"]
    admin = await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True,
                                           context=Context(user_id=accounts["admin"].id))
    assert admin["source"].startswith("PlanaVista ")
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True,
                                       context=Context(user_id=accounts["alex"].id))
    assert err.value.translation_key == "not_allowed"


async def test_a_restore_with_problems_while_chores_need_a_look_changes_nothing(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    file = (await ws_command(alex, {"type": "planavista/export"}))["result"]["file"]
    chores.engine.award_stars(chores.now(), member="casey", stars=3, reason="Helped out", by="alex")
    ledger = list(chores.engine.rewards["ledger"])
    chores.problem, chores.missing = STATE_NEEDS_A_LOOK, frozenset({"log"})
    file["members"][2]["bedtime"] = {"weeknight": "late", "weekend": "late"}
    out = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    assert out["result"]["problem"]["message"] == "This file has problems, so nothing was imported."
    assert chores.state == STATE_NEEDS_A_LOOK
    assert len(chores.engine.plan["activities"]) == 16
    assert chores.engine.rewards["ledger"] == ledger


async def test_a_restore_while_chores_need_a_look_keeps_what_could_be_read(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    file = (await ws_command(alex, {"type": "planavista/export"}))["result"]["file"]
    chores.engine.award_stars(chores.now(), member="casey", stars=3, reason="Helped out", by="alex")
    ledger = list(chores.engine.rewards["ledger"])
    active_from = chores.engine.log["active_from"]
    chores.problem, chores.missing = STATE_NEEDS_A_LOOK, frozenset({"plan"})
    chores.engine.plan["activities"] = []  # the plan came back empty; the log and the rewards could be read
    looked = await ws_command(alex, {"type": "planavista/import/preview", "text": json.dumps(file)})
    assert looked["result"]["preview"]["fills_in"] is True
    restored = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    assert restored["result"]["summary"]["activities_added"] == 16
    assert chores.state == "ok"
    assert chores.engine.rewards["ledger"] == ledger
    assert chores.engine.log["active_from"] == active_from


async def test_a_restore_may_swap_two_peoples_colors(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    file = (await ws_command(alex, {"type": "planavista/export"}))["result"]["file"]
    colors = {m["name"]: m["color"] for m in file["members"]}
    file["members"][0]["color"], file["members"][1]["color"] = colors["Blair"], colors["Alex"]
    jordan = {**deepcopy(file["members"][3]), "id": "jordan", "name": "Jordan", "color": colors["Casey"]}
    jordan["links"] = {"person": None, "calendars": [], "phones": []}
    file["members"][2]["color"] = "#F9C74F"
    file["members"].append(jordan)
    out = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    assert "summary" in out["result"], out
    now = {m["name"]: m["color"] for m in chores.household.members}
    assert (now["Alex"], now["Blair"], now["Casey"], now["Jordan"]) == (colors["Blair"], colors["Alex"], "#F9C74F", colors["Casey"])
