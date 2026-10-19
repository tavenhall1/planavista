"""Turning the sample household's plan into check-offs (spec 7.6, 8.2, 8.4, 8.8)."""
from __future__ import annotations

from datetime import date

from custom_components.planavista.chores.occurrences import parse_key

from .chores_sample import SCENE, at, keys, once, plan, repeats, sample_engine


def _view(engine, member, now=SCENE):  # noqa: ANN001, ANN202
    day = engine.today(now)
    return {i.occ.key: engine.item_view(i, day) for i in engine.items(now).get(member, [])}


def test_tuesday_afternoon_for_everyone() -> None:
    engine = sample_engine()
    assert keys(engine, "alex", SCENE) == [
        "fix_the_gate_latch|alex|once|0",
        "kitchen_cleanup|alex|day:2026-10-13|0",
        "finance_and_budget|alex|week:2026-10-12|0",
        "change_the_furnace_filter|alex|rep:2026-10-01|0",
    ]
    assert keys(engine, "blair", SCENE) == [
        "clean_the_bathroom|blair|week:2026-10-12|0",
        "laundry|blair|week:2026-10-12|0",
    ]
    assert keys(engine, "casey", SCENE) == [
        "cat_care|casey|day:2026-10-13|0",
        "clean_out_the_garage|casey|once|0",
        "clean_out_the_garage|casey|once|1",
        "cat_care|casey|day:2026-10-13|1",
        "take_out_the_trash|casey|week:2026-10-12|0",
        "clean_the_bathroom|casey|week:2026-10-12|0",
        "yard_work|casey|week:2026-10-12|0",
    ]
    assert keys(engine, "dana", SCENE) == [
        "make_your_bed|dana|day:2026-10-13|0",
        "feed_the_fish|dana|day:2026-10-13|0",
        "tidy_toys|dana|day:2026-10-13|0",
        "set_the_table|dana|day:2026-10-13|0",
    ]


def test_items_without_a_band_sit_in_the_current_band() -> None:
    engine = sample_engine()
    dana = _view(engine, "dana")
    assert dana["tidy_toys|dana|day:2026-10-13|0"]["band"] is None
    # At 4:10 PM the current band is the afternoon, so Tidy toys comes after Feed the fish.
    assert list(dana).index("tidy_toys|dana|day:2026-10-13|0") == 2


def test_cat_care_twice_a_day_rotates_through_its_bands() -> None:
    casey = _view(sample_engine(), "casey")
    assert casey["cat_care|casey|day:2026-10-13|0"]["band"] == "morning"
    assert casey["cat_care|casey|day:2026-10-13|1"]["band"] == "evening"
    assert casey["cat_care|casey|day:2026-10-13|0"]["credit_minutes"] == 15.0
    assert casey["cat_care|casey|day:2026-10-13|0"]["stars"] == 1


def test_weekly_chores_on_picked_days_show_on_their_day() -> None:
    casey = _view(sample_engine(), "casey")
    trash = casey["take_out_the_trash|casey|week:2026-10-12|0"]
    assert (trash["section"], trash["band"], trash["planned"], trash["counted"]) == ("today", "evening", "2026-10-13", True)
    assert trash["due"] == "2026-10-19T03:00:00-05:00"  # Make it up: due when the week ends
    assert (trash["credit_minutes"], trash["stars"]) == (15.0, 1)


def test_a_pinned_weekly_chore_moves_to_this_week_after_its_day() -> None:
    laundry = _view(sample_engine(), "blair")["laundry|blair|week:2026-10-12|0"]
    assert (laundry["section"], laundry["from"], laundry["counted"]) == ("week", "2026-10-12", False)
    assert (laundry["credit_minutes"], laundry["stars"]) == (60.0, 4)


def test_strict_days_never_move_a_chore() -> None:
    engine = sample_engine(settings={"missed": "strict"})
    assert keys(engine, "blair", SCENE) == ["clean_the_bathroom|blair|week:2026-10-12|0"]
    trash = _view(engine, "casey")["take_out_the_trash|casey|week:2026-10-12|0"]
    assert trash["due"] == "2026-10-14T03:00:00-05:00"


def test_split_time_gives_each_person_their_share() -> None:
    engine = sample_engine(activities=[
        plan("clean_the_bathroom", "Clean the bathroom", ["blair", "casey"], 3, "week",
             split="shared", shares={"blair": 2, "casey": 1}),
    ])
    assert _view(engine, "blair")["clean_the_bathroom|blair|week:2026-10-12|0"]["credit_minutes"] == 120.0
    assert _view(engine, "casey")["clean_the_bathroom|casey|week:2026-10-12|0"]["credit_minutes"] == 60.0


def test_each_does_it_all_gives_everyone_the_full_time() -> None:
    engine = sample_engine(activities=[plan("tidy", "Tidy up", ["casey", "dana"], 0.5, "day")])
    assert _view(engine, "casey")["tidy|casey|day:2026-10-13|0"]["credit_minutes"] == 30.0
    assert _view(engine, "dana")["tidy|dana|day:2026-10-13|0"]["credit_minutes"] == 30.0


def test_floating_weekly_times() -> None:
    engine = sample_engine(activities=[plan("vacuum", "Vacuum", ["blair"], 1, "week", times=3)])
    assert keys(engine, "blair", SCENE) == [f"vacuum|blair|week:2026-10-12|{n}" for n in range(3)]
    assert _view(engine, "blair")["vacuum|blair|week:2026-10-12|0"]["credit_minutes"] == 20.0


def test_once_chores() -> None:
    engine = sample_engine(activities=[
        once("on_friday", "Wash the car", ["alex"], on="2026-10-16", estimate_minutes=45),
        once("any_time", "Clean the closet", ["alex"], estimate_minutes=60),
    ])
    assert keys(engine, "alex", SCENE) == ["any_time|alex|once|0"]
    friday = at(10, 16, 9)
    assert keys(engine, "alex", friday, "today") == ["on_friday|alex|once|0"]
    assert keys(engine, "alex", at(10, 17, 9)) == ["any_time|alex|once|0"]
    closet = _view(engine, "alex")["any_time|alex|once|0"]
    assert (closet["section"], closet["due"], closet["counted"]) == ("week", None, False)


def test_a_dated_once_chore_shows_in_today_every_day_and_counts_on_its_day() -> None:
    engine = sample_engine()
    latch = _view(engine, "alex")["fix_the_gate_latch|alex|once|0"]
    assert (latch["section"], latch["dated"], latch["counted"], latch["due_day"]) == ("today", True, False, "2026-10-16")
    friday = _view(engine, "alex", at(10, 16, 9))["fix_the_gate_latch|alex|once|0"]
    assert friday["counted"] is True
    assert "fix_the_gate_latch|alex|once|0" not in keys(engine, "alex", at(10, 17, 9))


def test_a_once_chore_by_a_time() -> None:
    engine = sample_engine(activities=[
        once("forms", "Sign the school forms", ["alex"], by="2026-10-14", by_time="08:00", estimate_minutes=10),
    ])
    forms = _view(engine, "alex")["forms|alex|once|0"]
    assert forms["due"] == "2026-10-14T08:00:00-05:00"
    assert forms["due_day"] == "2026-10-14"


def test_repeats_on_their_day_then_this_week() -> None:
    engine = sample_engine()
    saturday = at(10, 17, 10)
    rake = _view(engine, "casey", saturday)["rake_the_leaves|casey|rep:2026-10-17|0"]
    assert (rake["section"], rake["planned"], rake["credit_minutes"], rake["stars"]) == ("today", "2026-10-17", 60.0, 4)
    sunday = _view(engine, "casey", at(10, 18, 10))["rake_the_leaves|casey|rep:2026-10-17|0"]
    assert (sunday["section"], sunday["from"]) == ("week", "2026-10-17")
    # The rule ends on November 30: no instance after the 28th.
    assert [k for k in keys(engine, "casey", at(12, 5, 10)) if k.startswith("rake")] == []


def test_a_monthly_chore_shows_all_month() -> None:
    engine = sample_engine()
    for moment in (at(10, 1, 9), SCENE, at(10, 31, 20)):
        filters = [k for k in keys(engine, "alex", moment) if k.startswith("change_the_furnace_filter")]
        assert filters == ["change_the_furnace_filter|alex|rep:2026-10-01|0"]
    november = _view(engine, "alex", at(11, 2, 9))
    assert "change_the_furnace_filter|alex|rep:2026-11-01|0" in november
    assert november["change_the_furnace_filter|alex|rep:2026-11-01|0"]["window"] == "month"


def test_a_weekly_repeat_with_a_week_window() -> None:
    engine = sample_engine(activities=[
        repeats("mop", "Mop the floors", ["blair"], "FREQ=WEEKLY;INTERVAL=2;BYDAY=WE", "2026-10-14", "period", 30),
    ])
    # Nothing shows before the chore starts on Wednesday; then it shows until the week ends.
    assert keys(engine, "blair", SCENE) == []
    assert keys(engine, "blair", at(10, 14, 9)) == ["mop|blair|rep:2026-10-14|0"]
    assert keys(engine, "blair", at(10, 18, 9)) == ["mop|blair|rep:2026-10-14|0"]
    assert keys(engine, "blair", at(10, 20, 9)) == []
    assert keys(engine, "blair", at(10, 26, 9)) == ["mop|blair|rep:2026-10-28|0"]


def test_due_times_follow_daylight_saving_changes() -> None:
    engine = sample_engine(activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    halloween = _view(engine, "casey", at(10, 31, 9))["cat_care|casey|day:2026-10-31|0"]
    assert halloween["due"] == "2026-11-01T03:00:00-06:00"


def test_planning_a_day_only_moves_where_it_shows() -> None:
    engine = sample_engine()
    yard = "yard_work|casey|week:2026-10-12|0"
    engine.override(SCENE, key=yard, by="casey", planned_day=date(2026, 10, 17))
    assert yard not in keys(engine, "casey", SCENE)
    saturday = _view(engine, "casey", at(10, 17, 9))[yard]
    assert (saturday["section"], saturday["counted"]) == ("today", True)
    sunday = _view(engine, "casey", at(10, 18, 9))[yard]
    assert (sunday["section"], sunday["from"], sunday["due"]) == ("week", "2026-10-17", "2026-10-19T03:00:00-05:00")


def test_more_time_keeps_a_chore_on_the_board_into_next_week() -> None:
    engine = sample_engine()
    yard = "yard_work|casey|week:2026-10-12|0"
    engine.override(SCENE, key=yard, by="blair", due=date(2026, 10, 25))
    monday = _view(engine, "casey", at(10, 19, 9))
    assert monday[yard]["due"] == "2026-10-26T03:00:00-05:00"
    assert "yard_work|casey|week:2026-10-19|0" in monday


def test_handing_a_chore_to_someone_else() -> None:
    engine = sample_engine()
    trash = "take_out_the_trash|casey|week:2026-10-12|0"
    engine.override(SCENE, key=trash, by="alex", assignee="blair")
    assert trash not in keys(engine, "casey", SCENE)
    handed = _view(engine, "blair")[trash]
    assert (handed["member"], handed["owner"]) == ("blair", "casey")


def test_an_excused_chore_is_not_due() -> None:
    engine = sample_engine()
    bed = "make_your_bed|dana|day:2026-10-13|0"
    engine.override(SCENE, key=bed, by="blair", excused=True, note="Sick day")
    assert _view(engine, "dana")[bed]["status"] == "excused"
    assert engine.board(SCENE)["members"]["dana"]["today"]["due"] == 3


def test_away_days_have_nothing_due() -> None:
    members = [dict(m) for m in sample_engine().members]
    for member in members:
        if member["id"] == "dana":
            member["away"] = [{"from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}]
    engine = sample_engine(members=members)
    statuses = {v["status"] for v in _view(engine, "dana").values()}
    assert statuses == {"away"}
    assert engine.board(SCENE)["members"]["dana"]["today"]["due"] == 0
    assert engine.board(SCENE)["members"]["dana"]["away"]["note"] == "At Grandma's"


def test_keys_name_the_same_occurrence_everywhere() -> None:
    engine = sample_engine()
    gen = engine.generator()
    for found in engine.items(SCENE).values():
        for item in found:
            assert gen.from_key(engine.activity(item.occ.chore), item.occ.key).key == item.occ.key
    assert parse_key("cat_care|casey|day:2026-10-13|1") == ("cat_care", "casey", "day:2026-10-13", 1)
    assert parse_key("cat_care|casey") is None
    # Keys the plan doesn't make are refused.
    assert gen.from_key(engine.activity("cat_care"), "cat_care|casey|day:2026-10-13|2") is None
    assert gen.from_key(engine.activity("cat_care"), "cat_care|dana|day:2026-10-13|0") is None
    assert gen.from_key(engine.activity("laundry"), "laundry|blair|week:2026-10-13|0") is None
    assert gen.from_key(engine.activity("rake_the_leaves"), "rake_the_leaves|casey|rep:2026-10-18|0") is None


def test_plan_only_and_unassigned_chores_never_reach_the_board() -> None:
    engine = sample_engine(activities=[
        plan("homework", "Homework", ["casey"], 1, "day", on_board=False),
        plan("soccer", "Soccer practice", ["casey"], 1.5, "week", set_time="17:30"),
        plan("wash_the_car", "Wash the car", [], 1, "week"),
    ])
    assert keys(engine, "casey", SCENE) == []
    assert engine.needs_a_look() == [{"kind": "unassigned", "chore": "wash_the_car", "name": "Wash the car"}]


def test_a_chore_added_mid_week_starts_with_the_days_still_to_come() -> None:
    # A weekly chore with no set days counts that same week, due when it ends (the owner, 2026-10-19: a plan
    # imported on a Monday showed none of its weekly chores until the next week, so the board looked empty).
    engine = sample_engine(at(10, 14, 9), activities=[])  # Wednesday
    for chore in (
        {"name": "Laundry", "schedule": "plan", "assignees": ["blair"], "minimum": {"hours": 2, "per": "week"},
         "days": ["mon", "thu"]},
        {"name": "Feed the fish", "schedule": "plan", "assignees": ["dana"], "minimum": {"hours": 5 / 60, "per": "day"}},
        {"name": "Yard work", "schedule": "plan", "assignees": ["casey"], "minimum": {"hours": 1, "per": "week"}},
    ):
        engine.save_activity(at(10, 14, 16), chore, by="alex", source="tablet")
    wednesday = at(10, 14, 16, 30)
    assert keys(engine, "blair", wednesday) == []  # Monday's load came before the chore did
    assert keys(engine, "dana", wednesday) == ["feed_the_fish|dana|day:2026-10-14|0"]  # today's counts
    assert keys(engine, "casey", wednesday) == ["yard_work|casey|week:2026-10-12|0"]  # owed by the week's end
    assert keys(engine, "dana", at(10, 13, 16)) == []
    assert keys(engine, "blair", at(10, 15, 9)) == ["laundry|blair|week:2026-10-12|1"]
    engine.catch_up(at(10, 19, 9))
    week = {s["member"]: s for s in engine.log["summaries"] if s["period"] == "week:2026-10-12"}
    assert week["blair"]["missed"] == ["laundry|blair|week:2026-10-12|1"]
    assert week["dana"]["due"] == 5  # Wednesday to Sunday
    assert week["casey"]["due"] == 1
    assert week["casey"]["missed"] == ["yard_work|casey|week:2026-10-12|0"]
    assert keys(engine, "casey", at(10, 19, 16)) == ["yard_work|casey|week:2026-10-19|0"]


def test_someone_added_to_a_weekly_chore_mid_week_owes_it_that_week() -> None:
    engine = sample_engine(at(10, 12, 9), activities=[])  # Monday
    yard = {"name": "Yard work", "schedule": "plan", "assignees": ["casey"], "minimum": {"hours": 1, "per": "week"}}
    engine.save_activity(at(10, 12, 9), yard, by="alex", source="tablet")
    engine.save_activity(at(10, 14, 16), {**yard, "assignees": ["casey", "dana"]}, by="alex", source="tablet",
                         activity_id="yard_work")
    assert keys(engine, "dana", at(10, 14, 17)) == ["yard_work|dana|week:2026-10-12|0"]


def test_a_weekly_chore_with_no_set_days_added_on_the_first_day_counts_that_week() -> None:
    engine = sample_engine(at(10, 12, 9), activities=[])  # Monday
    engine.save_activity(
        at(10, 12, 20),
        {"name": "Yard work", "schedule": "plan", "assignees": ["casey"], "minimum": {"hours": 1, "per": "week"}},
        by="alex", source="tablet",
    )
    assert keys(engine, "casey", at(10, 12, 21)) == ["yard_work|casey|week:2026-10-12|0"]


def test_a_repeating_chore_owes_nothing_from_before_it_was_added() -> None:
    engine = sample_engine(at(10, 14, 9), activities=[])  # Wednesday
    for chore in (
        {"name": "Water the plants", "schedule": "repeats", "assignees": ["casey"],
         "repeats": {"rrule": "FREQ=WEEKLY;BYDAY=MO,FR", "start": "2026-09-07", "window": "day"}},
        {"name": "Change the filter", "schedule": "repeats", "assignees": ["alex"],
         "repeats": {"rrule": "FREQ=MONTHLY;BYMONTHDAY=1", "start": "2026-09-01", "window": "period"}},
    ):
        engine.save_activity(at(10, 14, 16), chore, by="alex", source="tablet")
    assert keys(engine, "casey", at(10, 14, 17)) == []  # Monday's watering came before the chore did
    assert keys(engine, "casey", at(10, 16, 9)) == ["water_the_plants|casey|rep:2026-10-16|0"]
    # A month's any-time chore counts like a week's: October's filter is owed by the month's end.
    assert keys(engine, "alex", at(10, 14, 17)) == ["change_the_filter|alex|rep:2026-10-01|0"]
    assert keys(engine, "alex", at(11, 2, 9)) == ["change_the_filter|alex|rep:2026-11-01|0"]
