"""Chore records and their rules, and the stars formula (spec 7.3, 7.5, 8.3, 15.5)."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from custom_components.planavista.chores.model import (
    DEFAULT_SETTINGS,
    ChoreError,
    build_activity,
    build_reward,
    build_settings,
    make_id,
    on_board,
    stars_for,
)

MEMBERS = {"alex", "blair", "casey", "dana"}
STARS = json.loads((Path(__file__).parent / "fixtures" / "chores_stars.json").read_text("utf-8"))


@pytest.mark.parametrize("case", STARS["cases"])
def test_stars_follow_the_shared_table(case: dict[str, Any]) -> None:
    assert stars_for(case["minutes"], case["minutes_per_star"], case.get("override")) == case["stars"]


def test_ids_are_slugs_with_a_number_on_a_collision() -> None:
    assert make_id("Clean the Bathroom!", []) == "clean_the_bathroom"
    assert make_id("Clean the bathroom", ["clean_the_bathroom"]) == "clean_the_bathroom_2"
    assert make_id("Café run", []) == "cafe_run"


def _plan(**fields: Any) -> dict[str, Any]:
    return {"name": "Clean the bathroom", "schedule": "plan", "assignees": ["blair", "casey"],
            "minimum": {"hours": 2, "per": "week"}, **fields}


def test_a_plan_chore_gets_its_defaults() -> None:
    activity = build_activity(None, _plan(), MEMBERS)
    assert activity["split"] == "each"
    assert activity["shares"] is None
    assert activity["days"] == [] and activity["time_of_day"] == [] and activity["times"] == 1
    assert (activity["on_board"], activity["needs_ok"], activity["stars"], activity["category"]) == (True, False, None, "other")
    assert activity["finished_at"] is None


def test_days_and_bands_are_kept_in_calendar_order() -> None:
    activity = build_activity(None, _plan(days=["thu", "mon"], time_of_day=["evening", "morning"]), MEMBERS)
    assert activity["days"] == ["mon", "thu"]
    assert activity["time_of_day"] == ["morning", "evening"]


def test_shared_time_must_add_up() -> None:
    ok = build_activity(None, _plan(split="shared", shares={"blair": 1.5, "casey": 0.5}), MEMBERS)
    assert ok["shares"] == {"blair": 1.5, "casey": 0.5}
    for shares in ({"blair": 1, "casey": 0.5}, {"blair": 2}, {"blair": 1, "casey": 1, "dana": 0}):
        with pytest.raises(ChoreError) as err:
            build_activity(None, _plan(split="shared", shares=shares), MEMBERS)
        assert err.value.code == "shares_mismatch"


@pytest.mark.parametrize(
    ("changes", "code"),
    [
        ({"name": "  "}, "name_required"),
        ({"name": "x" * 61}, "name_too_long"),
        ({"schedule": "sometimes"}, "invalid_schedule"),
        ({"assignees": ["erin"]}, "unknown_member"),
        ({"assignees": ["casey", "casey"]}, "invalid_assignees"),
        ({"minimum": {"hours": 0, "per": "week"}}, "invalid_minimum"),
        ({"minimum": {"hours": 1, "per": "month"}}, "invalid_minimum"),
        ({"days": ["mon", "funday"]}, "invalid_days"),
        ({"time_of_day": ["night"]}, "invalid_bands"),
        ({"times": 0}, "invalid_times"),
        ({"set_time": "5:30 PM"}, "invalid_set_time"),
        ({"stars": -1}, "invalid_stars"),
        ({"category": "chores"}, "invalid_category"),
        ({"icon": ""}, "invalid_icon"),
        ({"on_board": "yes"}, "invalid_on_board"),
    ],
)
def test_broken_rules_are_named(changes: dict[str, Any], code: str) -> None:
    with pytest.raises(ChoreError) as err:
        build_activity(None, _plan(**changes), MEMBERS)
    assert err.value.code == code


def test_a_change_keeps_fields_this_version_does_not_edit() -> None:
    stored = build_activity(None, _plan(), MEMBERS) | {
        "id": "clean_the_bathroom", "type": "need", "locked": True, "agreed": True,
        "import_ref": {"format": "household-hours/v1", "id": "a12"}, "future_field": 1,
    }
    changed = build_activity(stored, {"name": "Bathroom"}, MEMBERS)
    assert changed["name"] == "Bathroom"
    for key in ("id", "type", "locked", "agreed", "import_ref", "future_field"):
        assert changed[key] == stored[key]


def test_once_chores() -> None:
    once = build_activity(None, {"name": "Fix the gate latch", "schedule": "once", "assignees": ["alex"],
                                 "once": {"by": "2026-10-16", "estimate_minutes": 30}}, MEMBERS)
    assert once["once"] == {"on": None, "by": "2026-10-16", "by_time": None, "sessions": 1, "estimate_minutes": 30}
    for bad, detail in (
        ({"on": "2026-10-16", "by": "2026-10-17"}, "Pick a day or a date to finish by, not both."),
        ({"by_time": "17:00"}, "A time to finish by needs a date."),
    ):
        with pytest.raises(ChoreError) as err:
            build_activity(None, {"name": "x", "schedule": "once", "assignees": [], "once": bad}, MEMBERS)
        assert (err.value.code, err.value.detail) == ("invalid_once", detail)


def test_repeats_chores_store_the_canonical_rule() -> None:
    raw = {"name": "Rake the leaves", "schedule": "repeats", "assignees": ["casey"],
           "repeats": {"rrule": "freq=weekly;byday=sa;until=20261130", "start": "2026-10-17", "estimate_minutes": 60}}
    activity = build_activity(None, raw, MEMBERS)
    assert activity["repeats"] == {"rrule": "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", "start": "2026-10-17",
                                   "window": "day", "estimate_minutes": 60}


@pytest.mark.parametrize(
    ("repeats", "detail"),
    [
        ({"rrule": "FREQ=YEARLY", "start": "2026-10-17"}, "Chores repeat daily, weekly, or monthly."),
        ({"rrule": "FREQ=WEEKLY"}, "Add the day it starts."),
        ({"rrule": "FREQ=DAILY", "start": "2026-10-17", "window": "period"}, "A daily chore is done on its day."),
        ({"rrule": "FREQ=MONTHLY;INTERVAL=12;BYMONTHDAY=31", "start": "2026-04-01"},
         "This rule never repeats. Pick another day."),
    ],
)
def test_repeats_outside_the_subset_are_refused_with_a_reason(repeats: dict[str, Any], detail: str) -> None:
    with pytest.raises(ChoreError) as err:
        build_activity(None, {"name": "x", "schedule": "repeats", "assignees": [], "repeats": repeats}, MEMBERS)
    assert (err.value.code, err.value.detail) == ("invalid_repeats", detail)


def test_what_reaches_the_board() -> None:
    assert on_board(build_activity(None, _plan(), MEMBERS))
    assert not on_board(build_activity(None, _plan(assignees=[]), MEMBERS))
    assert not on_board(build_activity(None, _plan(on_board=False), MEMBERS))
    assert not on_board(build_activity(None, _plan(set_time="17:30"), MEMBERS))
    assert not on_board(build_activity(None, _plan(), MEMBERS) | {"finished_at": "2026-10-13T16:00:00-05:00"})


def test_settings() -> None:
    assert build_settings({}, {}) == DEFAULT_SETTINGS
    assert build_settings(DEFAULT_SETTINGS, {"missed": "strict", "evening_check": None})["missed"] == "strict"
    for changes, code in (
        ({"missed": "never"}, "invalid_missed"),
        ({"day_starts": "07:00"}, "invalid_day_starts"),
        ({"day_starts": "3:00"}, "invalid_day_starts"),
        ({"auto_approve": "always"}, "invalid_auto_approve"),
        ({"minutes_per_star": 0}, "invalid_minutes_per_star"),
        ({"evening_check": "7 PM"}, "invalid_evening_check"),
        ({"sound": 1}, "invalid_sound"),
    ):
        with pytest.raises(ChoreError) as err:
            build_settings(DEFAULT_SETTINGS, changes)
        assert err.value.code == code


def test_rewards() -> None:
    reward = build_reward(None, {"name": "Movie night pick", "icon": "🎬", "cost": 40, "who": ["casey", "dana"]}, MEMBERS)
    assert reward == {"name": "Movie night pick", "icon": "🎬", "cost": 40, "needs_ok": True, "who": ["casey", "dana"]}
    for changes, code in (({"cost": 0}, "invalid_cost"), ({"who": ["erin"]}, "unknown_member"), ({"name": ""}, "name_required")):
        with pytest.raises(ChoreError) as err:
            build_reward(None, {"name": "Movie night pick", "cost": 40, **changes}, MEMBERS)
        assert err.value.code == code
