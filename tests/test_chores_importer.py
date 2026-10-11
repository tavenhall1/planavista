"""Importing a Household Hours plan, and exporting and restoring a PlanaVista household (spec 7.9, 14.6, 15.5)."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from custom_components.planavista.chores.importer import (
    FORMAT_HOUSEHOLD,
    FORMAT_PLAN,
    ImportProblem,
    export_household,
    plan_import,
    preview,
    read_file,
)
from custom_components.planavista.household.members import add_member

from .chores_sample import MEMBERS, built, sample_activities

PLAN_TEXT = (Path(__file__).parent / "fixtures" / "household_hours_sample.json").read_text("utf-8")
SCHEMA = json.loads((Path(__file__).parent.parent / "docs" / "schemas" / "planavista.household.v1.json").read_text("utf-8"))


def _household(*names: str) -> list[dict[str, Any]]:
    members: list[dict[str, Any]] = []
    roles = {"Alex": {"parent": True}, "Blair": {"parent": True}, "Casey": {"age_group": "teen"},
             "Dana": {"age_group": "young_child"}}
    for name in names:
        members, _ = add_member(members, {"name": name, **roles[name]})
    return members


def _problem(text: str) -> ImportProblem:
    with pytest.raises(ImportProblem) as err:
        read_file(text)
    return err.value


# Reading a file ---------------------------------------------------------------------------------


@pytest.mark.parametrize("text", ["", "plan.txt", "[1, 2]", '{"schema": "something-else/v1"}', '{"schema": "household-hours/v0"}'])
def test_a_file_that_isnt_a_plan_says_so(text: str) -> None:
    problem = _problem(text)
    assert problem.code == "unknown_file"
    assert problem.message == "This doesn't look like a Household Hours or PlanaVista file."


def test_a_plan_from_a_newer_planner_says_what_to_do() -> None:
    assert _problem('{"schema": "household-hours/v2"}').message == (
        "This plan was made with a newer Household Hours (version 2). Export it as version 1, or update PlanaVista."
    )
    assert _problem('{"format": "planavista.household/v3"}').message == (
        "This file was made with a newer PlanaVista (file version 3). Update PlanaVista to read it."
    )


def test_problems_are_listed_by_item_and_nothing_is_read() -> None:
    text = json.dumps({"schema": FORMAT_PLAN, "people": [{"id": "x"}], "activities": [
        {"id": "a1", "name": "", "minHours": 1},
        {"id": "a2", "name": "Vacuum", "minHours": 0},
        {"id": "a3", "name": "Dishes", "minHours": 30, "per": "day"},
    ]})
    problem = _problem(text)
    assert problem.code == "invalid_file"
    assert problem.problems == [
        {"item": "Person 1", "code": "name_required"},
        {"item": "Activity 1", "code": "name_required"},
        {"item": "Vacuum", "code": "invalid_hours"},
        {"item": "Dishes", "code": "invalid_hours"},
    ]


def test_a_plan_brings_bedtimes_and_sleep_and_keeps_sleep_off_the_list() -> None:
    parsed = read_file(PLAN_TEXT)
    assert (parsed["format"], parsed["exported"], parsed["source"]) == (FORMAT_PLAN, "2026-10-03", "Household Hours planner")
    people = {p["name"]: p for p in parsed["people"]}
    assert people["Dana"]["bedtime"] == {"weeknight": "19:30", "weekend": "20:00"}
    assert {name: p["sleep_hours"] for name, p in people.items()} == {"Alex": 7.5, "Blair": 8.0, "Casey": 9.0, "Dana": 10.5}
    assert people["Casey"]["color"] == "#43AA8B"
    assert "Sleep" not in {a["record"]["name"] for a in parsed["activities"]}
    assert len(parsed["activities"]) == 23


def test_each_activity_becomes_a_plan_chore() -> None:
    records = {a["record"]["name"]: a["record"] for a in read_file(PLAN_TEXT)["activities"]}
    laundry = records["Laundry"]
    assert (laundry["assignees"], laundry["split"], laundry["minimum"]) == (["p_blair"], "each", {"hours": 2.0, "per": "week"})
    assert laundry["days"] == ["mon", "thu"]  # the planner counts days from Sunday
    assert (laundry["type"], laundry["locked"], laundry["agreed"]) == ("need", True, True)
    assert laundry["import_ref"] == {"format": FORMAT_PLAN, "id": "a06"}
    bathroom = records["Clean the bathroom"]
    assert (bathroom["split"], bathroom["shares"], bathroom["minimum"]["hours"]) == ("shared", {"p_blair": 1.0, "p_casey": 1.0}, 2.0)
    family_dinner = records["Family dinner"]
    assert (family_dinner["split"], len(family_dinner["assignees"])) == ("each", 4)
    assert records["Take out the trash"]["days"] == ["tue", "fri"]
    assert records["Cat care"]["times"] == 2  # morning and evening are a check-off each
    assert records["Wash the car"]["assignees"] == []


def test_categories_decide_whats_on_the_board_and_set_times_are_plan_only() -> None:
    records = {a["record"]["name"]: a["record"] for a in read_file(PLAN_TEXT)["activities"]}
    assert records["Vacuum"]["on_board"] is True
    assert records["Homework"]["on_board"] is False
    assert (records["Organize the closet"]["category"], records["Organize the closet"]["on_board"]) == ("other", False)
    soccer = records["Soccer practice"]
    assert (soccer["set_time"], soccer["on_board"], soccer["days"]) == ("17:30", False, ["tue", "thu"])


def test_shares_that_dont_add_up_are_what_people_owe() -> None:
    entry = next(a for a in read_file(PLAN_TEXT)["activities"] if a["ref"] == "a16")
    assert entry["record"]["minimum"] == {"hours": 0.75, "per": "week"}
    assert entry["planned_hours"] == 0.5


# The preview ------------------------------------------------------------------------------------


def _sample_preview(members: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    members = members if members is not None else _household("Alex", "Blair", "Casey")
    activities = [built(a) for a in sample_activities()]
    return preview(read_file(PLAN_TEXT), members, activities, [])


def test_the_preview_matches_people_by_name_and_finds_new_ones() -> None:
    people = {p["name"]: p for p in _sample_preview()["people"]}
    assert (people["Alex"]["match"], people["Alex"]["match_name"]) == ("alex", "Alex")
    assert people["Dana"]["match"] is None
    assert people["Dana"]["sleep_hours"] == 10.5


def test_the_preview_sorts_activities_and_says_what_needs_a_look() -> None:
    result = _sample_preview()
    assert result["file"] == {
        "format": FORMAT_PLAN, "label": "Household Hours plan, version 1", "exported": "2026-10-03",
        "source": "Household Hours planner",
    }
    kinds: dict[str, list[str]] = {}
    for item in result["activities"]:
        kinds.setdefault(item["kind"], []).append(item["name"])
    assert kinds["set_time"] == ["Soccer practice", "Piano lesson"]
    assert "Homework" in kinds["plan_only"] and "Vacuum" in kinds["board"]
    updates = next(look for look in result["needs_a_look"] if look["kind"] == "updates")
    assert updates["names"] == [
        "Kitchen cleanup", "Set the table", "Laundry", "Clean the bathroom", "Tidy toys", "Take out the trash",
        "Cat care", "Yard work", "Groceries",
    ]
    assert {"kind": "unassigned", "ref": "a15", "name": "Wash the car"} in result["needs_a_look"]
    shares = next(look for look in result["needs_a_look"] if look["kind"] == "shares")
    assert (shares["name"], shares["hours"], shares["planned"]) == ("Water the plants", 0.75, 0.5)
    laundry = next(i for i in result["activities"] if i["name"] == "Laundry")
    assert (laundry["match"], laundry["on_board"]) == ("laundry", True)


def test_a_chore_already_on_the_board_keeps_its_switch() -> None:
    activities = [built(a) for a in sample_activities()]
    for activity in activities:
        if activity["id"] == "yard_work":
            activity["on_board"] = False
    result = preview(read_file(PLAN_TEXT), _household("Alex", "Blair", "Casey", "Dana"), activities, [])
    yard = next(i for i in result["activities"] if i["name"] == "Yard work")
    assert (yard["kind"], yard["on_board"]) == ("plan_only", False)


# What an import saves ---------------------------------------------------------------------------


def _plan(choices: dict[str, Any] | None = None, members: list[dict[str, Any]] | None = None,
          activities: list[dict[str, Any]] | None = None, text: str = PLAN_TEXT) -> dict[str, Any]:
    members = members if members is not None else _household("Alex", "Blair", "Casey")
    return plan_import(
        read_file(text), choices if choices is not None else {"people": {"p_dana": {"age_group": "young_child"}}},
        members, activities if activities is not None else [], [], {},
    )


def test_a_new_person_needs_an_age_group_before_anything_is_saved() -> None:
    with pytest.raises(ImportProblem) as err:
        _plan({})
    assert err.value.problems == [{"item": "Dana", "code": "age_group_required"}]


def test_an_import_adds_people_and_updates_bedtimes_and_sleep() -> None:
    result = _plan()
    (dana,) = result["members_add"]
    assert (dana["id"], dana["age_group"], dana["parent"], dana["color"]) == ("dana", "young_child", False, "#F94144")
    assert (dana["bedtime"], dana["sleep_hours"], dana["my_day"]) == ({"weeknight": "19:30", "weekend": "20:00"}, 10.5, "pictures")
    assert result["members_update"]["casey"] == {"bedtime": {"weeknight": "22:00", "weekend": "23:00"}, "sleep_hours": 9.0}
    assert result["summary"]["people_added"] == ["Dana"]


def test_chores_name_people_by_their_ids_and_keep_the_planners_fields() -> None:
    result = _plan()
    added = {a["name"]: a for a in result["activities_add"]}
    assert len(added) == 23 and result["activities_update"] == {}
    bathroom = added["Clean the bathroom"]
    assert (bathroom["id"], bathroom["assignees"], bathroom["shares"]) == (
        "clean_the_bathroom", ["blair", "casey"], {"blair": 1.0, "casey": 1.0},
    )
    assert added["Set the table"]["assignees"] == ["dana"]
    assert (added["Laundry"]["locked"], added["Laundry"]["import_ref"]) == (True, {"format": FORMAT_PLAN, "id": "a06"})
    assert added["Wash the car"]["assignees"] == []


def test_the_parents_switches_and_picks_decide() -> None:
    result = _plan({
        "people": {"p_dana": {"age_group": "young_child"}},
        "on_board": {"a17": True, "a08": False},
        "assignees": {"a15": ["p_casey", "p_alex"]},
    })
    added = {a["name"]: a for a in result["activities_add"]}
    assert (added["Homework"]["on_board"], added["Vacuum"]["on_board"]) == (True, False)
    assert added["Wash the car"]["assignees"] == ["casey", "alex"]


def test_rematching_someone_the_plan_calls_by_another_name() -> None:
    text = PLAN_TEXT.replace('"name": "Casey"', '"name": "Cassie"')
    assert preview(read_file(text), _household("Alex", "Blair", "Casey"), [], [])["people"][2]["match"] is None
    result = _plan({"people": {"p_casey": {"match": "casey"}, "p_dana": {"age_group": "young_child"}}}, text=text)
    assert [m["name"] for m in result["members_add"]] == ["Dana"]
    assert result["members_update"]["casey"]["sleep_hours"] == 9.0
    with pytest.raises(ImportProblem) as err:
        _plan({"people": {"p_dana": {"match": "alex"}}})
    assert err.value.problems == [{"item": "Dana", "code": "matched_twice", "other": "Alex"}]


def test_importing_again_updates_instead_of_duplicating() -> None:
    first = _plan(members=_household("Alex", "Blair", "Casey", "Dana"))
    again = _plan(members=_household("Alex", "Blair", "Casey", "Dana"), activities=first["activities_add"])
    assert again["activities_add"] == []
    assert len(again["activities_update"]) == 23
    laundry = again["activities_update"]["laundry"]
    assert laundry["changes"]["minimum"] == {"hours": 2.0, "per": "week"}
    assert laundry["extra"] == {"type": "need", "locked": True, "agreed": True, "import_ref": {"format": FORMAT_PLAN, "id": "a06"}}
    assert "icon" not in laundry["changes"] and "times" not in laundry["changes"]


def test_a_plan_matches_existing_chores_by_name_and_updates_only_the_plans_fields() -> None:
    activities = [built(a) for a in sample_activities()]
    result = _plan(members=_household("Alex", "Blair", "Casey", "Dana"), activities=activities)
    trash = result["activities_update"]["take_out_the_trash"]["changes"]
    assert trash["minimum"] == {"hours": 0.5, "per": "week"} and trash["schedule"] == "plan"
    assert "needs_ok" not in trash and "label" not in trash
    assert "rake_the_leaves" not in result["activities_update"]
    assert result["summary"]["activities_updated"] == 9


# Export and restore -----------------------------------------------------------------------------


def _export(members: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    members = [dict(m, rev=3) for m in (members or MEMBERS)]
    members[2].update(person="person.casey", phones=["notify.mobile_app_caseys_phone"], bedtime={"weeknight": "22:00", "weekend": "23:00"})
    activities = [dict(built(a), assigned_since={"casey": "2026-06-01T00:00:00-05:00"}) for a in sample_activities()]
    plan = {"settings": {"missed": "strict", "day_starts": "03:00", "auto_approve": "day_end", "minutes_per_star": 10,
                         "evening_check": "19:00", "sound": False}, "activities": activities}
    rewards = {"rewards": [{"id": "movie_night_pick", "name": "Movie night pick", "icon": "🎬", "cost": 40,
                            "needs_ok": True, "who": ["casey", "dana"]}],
               "ledger": [{"id": "x", "member": "casey", "delta": 4}], "redemptions": []}
    calendars = [{"entity_id": "calendar.casey", "member_id": "casey"}, {"entity_id": "calendar.family"}]
    return export_household(members, calendars, plan, rewards, version="1.3.0", exported="2026-10-13T16:10:00-05:00")


def test_an_export_has_people_chores_rewards_and_rules_and_nothing_private() -> None:
    exported = _export()
    assert (exported["format"], exported["source"]) == (FORMAT_HOUSEHOLD, "PlanaVista 1.3.0")
    casey = exported["members"][2]
    assert casey["links"] == {"person": "person.casey", "calendars": ["calendar.casey"], "phones": ["notify.mobile_app_caseys_phone"]}
    assert "rev" not in casey and "person" not in casey and "phones" not in casey
    assert all("rev" not in a and "assigned_since" not in a for a in exported["chores"]["activities"])
    assert exported["chores"]["settings"]["missed"] == "strict"
    assert exported["rewards"] == [{"id": "movie_night_pick", "name": "Movie night pick", "icon": "🎬", "cost": 40,
                                    "needs_ok": True, "who": ["casey", "dana"]}]
    text = json.dumps(exported)
    assert "ledger" not in text and "pin" not in text.lower()


def test_the_published_schema_names_every_exported_field() -> None:
    exported = _export()
    member_fields = set(SCHEMA["$defs"]["member"]["properties"])
    assert set(SCHEMA["properties"]) >= set(exported)
    for member in exported["members"]:
        assert set(member) <= member_fields
    assert set(SCHEMA["$defs"]["reward"]["properties"]) >= set(exported["rewards"][0])


def test_a_restore_brings_a_household_back_with_its_ids() -> None:
    parsed = read_file(json.dumps(_export()))
    look = preview(parsed, [], [], [])
    assert [p["match"] for p in look["people"]] == [None, None, None, None]
    assert look["settings"] is True
    result = plan_import(parsed, {}, [], [], [], {}, persons={"person.casey"}, calendars={"calendar.casey"})
    assert [m["id"] for m in result["members_add"]] == ["alex", "blair", "casey", "dana"]
    casey = result["members_add"][2]
    assert (casey["person"], casey["phones"], casey["age_group"]) == ("person.casey", ["notify.mobile_app_caseys_phone"], "teen")
    assert result["calendars"] == {"calendar.casey": "casey"}
    ids = [a["id"] for a in result["activities_add"]]
    assert "take_out_the_trash" in ids and "rake_the_leaves" in ids
    assert result["activities_add"][0]["created"]["at"] == "2026-06-01T19:05:00-05:00"
    assert result["rewards_add"][0]["id"] == "movie_night_pick"
    assert result["settings"]["missed"] == "strict"


def test_a_restore_onto_a_household_updates_what_is_there() -> None:
    parsed = read_file(json.dumps(_export()))
    members = [dict(m) for m in MEMBERS]
    for m, color in zip(members, ("#277DA1", "#F3722C", "#43AA8B", "#F94144")):
        m["color"] = color
    activities = [built(a) for a in sample_activities()]
    result = plan_import(parsed, {}, members, activities, [], {}, persons=set(), calendars=set())
    assert result["members_add"] == [] and set(result["members_update"]) == {"alex", "blair", "casey", "dana"}
    assert "person" not in result["members_update"]["casey"]  # a person Home Assistant doesn't have keeps the link there is
    assert result["activities_add"] == [] and len(result["activities_update"]) == 16
