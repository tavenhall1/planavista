"""The day boundary: auto-approve, missed policies, summaries, catching up, streaks (spec 8.9 to 8.14)."""
from __future__ import annotations

from datetime import date
from zoneinfo import ZoneInfo

from custom_components.planavista.chores.engine import ChoresEngine

from .chores_sample import at, keys, plan, sample_engine

MONDAY = at(10, 12, 9)
DANA_DAILY = ("make_your_bed", "feed_the_fish", "tidy_toys", "set_the_table")


def _summary(engine: ChoresEngine, member: str, period: str) -> dict:
    return next(s for s in engine.log["summaries"] if s["member"] == member and s["period"] == period)


def _dana_does_everything(engine: ChoresEngine, day: date) -> None:
    now = at(day.month, day.day, 18)
    for chore in DANA_DAILY:
        engine.complete(now, key=f"{chore}|dana|day:{day.isoformat()}|0", by="dana", source="tablet", approve=True)


def test_make_it_up_moves_a_missed_pinned_chore_to_this_week() -> None:
    engine = sample_engine(MONDAY)
    out = engine.catch_up(at(10, 13, 9))
    missed = [e.data["occurrence"] for e in out.events if e.type == "missed"]
    assert "laundry|blair|week:2026-10-12|0" not in missed
    item = engine.find_item("laundry|blair|week:2026-10-12|0", at(10, 13, 9))
    assert (item.section, item.moved_from) == ("week", date(2026, 10, 12))
    assert engine.description(item, date(2026, 10, 13)) == "From Mon"


def test_strict_days_miss_it_at_the_end_of_its_day() -> None:
    engine = sample_engine(MONDAY, settings={"missed": "strict"})
    out = engine.catch_up(at(10, 13, 9))
    missed = {e.data["occurrence"]: e for e in out.events if e.type == "missed"}
    assert missed["laundry|blair|week:2026-10-12|0"].data == {
        "chore": "laundry", "chore_name": "Laundry", "occurrence": "laundry|blair|week:2026-10-12|0",
        "member": "blair", "done_by": None, "source": None, "stars": 0, "state": "missed",
    }
    assert "laundry|blair|week:2026-10-12|0" not in keys(engine, "blair", at(10, 13, 9))
    assert "laundry|blair|week:2026-10-12|0" in _summary(engine, "blair", "day:2026-10-12")["missed"]


def test_carry_it_over_keeps_it_overdue_until_done() -> None:
    engine = sample_engine(MONDAY, settings={"missed": "carry_over"})
    out = engine.catch_up(at(10, 13, 9))
    assert [e for e in out.events if e.type == "missed"] == []
    bed = "make_your_bed|dana|day:2026-10-12|0"
    item = engine.find_item(bed, at(10, 13, 9))
    assert (item.section, item.overdue_since, item.counted) == ("overdue", date(2026, 10, 12), True)
    assert engine.description(item, date(2026, 10, 13)) == "Overdue since Mon"
    assert _summary(engine, "dana", "day:2026-10-12")["carried"] == [
        "make_your_bed|dana|day:2026-10-12|0", "feed_the_fish|dana|day:2026-10-12|0",
        "set_the_table|dana|day:2026-10-12|0", "tidy_toys|dana|day:2026-10-12|0",
    ]
    # The oldest open one comes first, and doing it late still counts.
    assert engine.open_item("make_your_bed", "dana", at(10, 13, 9)).occ.key == bed
    assert engine.complete(at(10, 13, 9), chore="make_your_bed", member="dana", by="dana", source="tablet").data["occurrence"] == bed
    engine.catch_up(at(10, 14, 9))
    assert bed not in {c["key"] for c in engine.log["carried"]}
    assert "feed_the_fish|dana|day:2026-10-12|0" in {c["key"] for c in engine.log["carried"]}


def test_a_new_missed_policy_starts_at_the_next_day_boundary() -> None:
    engine = sample_engine(at(10, 13, 9))
    engine.save_settings(at(10, 13, 9), {"missed": "strict"})
    assert engine.log["policy"] == {"before": "make_up", "since": "2026-10-14"}
    assert engine.policy_on(date(2026, 10, 13)) == "make_up"
    out = engine.catch_up(at(10, 14, 9))
    assert "take_out_the_trash|casey|week:2026-10-12|0" not in [e.data["occurrence"] for e in out.events]
    assert engine.find_item("take_out_the_trash|casey|week:2026-10-12|0", at(10, 14, 9)).moved_from == date(2026, 10, 13)
    thursday = engine.find_item("laundry|blair|week:2026-10-12|1", at(10, 15, 9))
    assert thursday.occ.due.isoformat() == "2026-10-16T03:00:00-05:00"


def test_catching_up_after_an_outage_runs_each_boundary_in_order() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(at(10, 12, 22), key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    out = engine.catch_up(at(10, 14, 9))  # off from Monday 11 PM to Wednesday 9 AM
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-13", "2026-10-14T03:00:00-05:00")
    assert out.events[0].type == "approved"
    assert out.events[0].data["occurrence"] == "feed_the_fish|dana|day:2026-10-12|0"
    fish = next(c for c in engine.log["completions"] if c["occurrence"] == "feed_the_fish|dana|day:2026-10-12|0")
    assert fish["review"] == {"by": "auto", "at": "2026-10-13T03:00:00-05:00", "note": None, "source": "auto"}
    missed_days = [e.data["occurrence"].split("|")[2] for e in out.events if e.type == "missed"]
    assert missed_days == sorted(missed_days)
    assert {"day:2026-10-12", "day:2026-10-13"} <= set(missed_days)
    periods = [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"]
    assert periods == ["day:2026-10-12", "day:2026-10-13"]
    # Nothing runs twice, even if the clock jumps back.
    assert engine.catch_up(at(10, 14, 9)).events == []
    assert engine.catch_up(at(10, 13, 9)).events == []
    assert len(engine.log["summaries"]) == 8


def test_a_25_hour_day_rolls_over_once_at_3_am() -> None:
    engine = sample_engine(at(10, 31, 9), activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    engine.catch_up(at(11, 1, 2, 30))  # 2:30 AM: the clocks fell back at 2:00, still Saturday's chore day
    assert engine.log["last_day"] == "2026-10-30"
    engine.catch_up(at(11, 1, 3, 0))
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-31", "2026-11-01T03:00:00-06:00")
    assert engine.next_boundary(at(11, 1, 9)).isoformat() == "2026-11-02T03:00:00-06:00"


def test_a_23_hour_day_rolls_over_once_at_3_am() -> None:
    engine = sample_engine(at(3, 7, 9), activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    engine.catch_up(at(3, 8, 3, 0))
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-03-07", "2026-03-08T03:00:00-05:00")


def test_a_time_zone_change_moves_the_next_boundary() -> None:
    engine = sample_engine(MONDAY)
    engine.set_time_zone(ZoneInfo("America/Los_Angeles"))
    assert engine.next_boundary(MONDAY).isoformat() == "2026-10-13T03:00:00-07:00"


def test_a_new_first_day_starts_at_the_next_week() -> None:
    engine = sample_engine(at(10, 13, 9))
    assert engine.set_first_day("sunday", at(10, 13, 9)) is True
    assert engine.clock.week_start(date(2026, 10, 16)) == date(2026, 10, 12)
    assert engine.clock.week_start(date(2026, 10, 20)) == date(2026, 10, 19)
    assert engine.clock.week_start(date(2026, 10, 27)) == date(2026, 10, 25)
    assert engine.set_first_day("sunday", at(10, 13, 10)) is False


def test_waiting_for_ok_stays_when_auto_approve_is_off() -> None:
    engine = sample_engine(MONDAY, settings={"auto_approve": "never"})
    engine.complete(MONDAY, key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    assert [r["kind"] for r in engine.open_requests()] == ["completion"]
    assert engine.balance("dana") == 0


def test_summaries_record_the_day() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(MONDAY, key="make_your_bed|dana|day:2026-10-12|0", by="dana", source="tablet")
    engine.complete(MONDAY, key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(10, 13, 9))
    summary = _summary(engine, "dana", "day:2026-10-12")
    assert summary | {"missed": None, "chores": None} == {
        "member": "dana", "period": "day:2026-10-12", "due": 4, "done": 2, "pending": 0,
        "minutes_due": 35.0, "minutes_done": 10.0, "minutes_pending": 0.0, "missed": None,
        "carried": [], "excused": [], "away": False, "closed": False, "chores": None,
    }
    # The check-off still waiting at the end of the day was approved before the summary.
    assert summary["missed"] == ["set_the_table|dana|day:2026-10-12|0", "tidy_toys|dana|day:2026-10-12|0"]
    assert summary["chores"]["make_your_bed"] == {"due": 1, "done": 1}


def test_streaks_count_closed_days_and_skip_away_and_empty_ones() -> None:
    engine = sample_engine(at(10, 5, 9))
    for day in (5, 6):
        _dana_does_everything(engine, date(2026, 10, day))
    engine.set_members([
        {**m, "away": [{"from": "2026-10-07", "to": "2026-10-07", "note": None}]} if m["id"] == "dana" else m
        for m in engine.members
    ])
    _dana_does_everything(engine, date(2026, 10, 8))
    engine.catch_up(at(10, 9, 9))
    assert engine.streak("dana", at(10, 9, 9)) == 3  # Mon, Tue, (away Wed), Thu
    _dana_does_everything(engine, date(2026, 10, 9))
    assert engine.streak("dana", at(10, 9, 20)) == 4  # today counts once everything is done
    engine.catch_up(at(10, 11, 9))  # Saturday was missed
    assert engine.streak("dana", at(10, 11, 9)) == 0
    assert engine.chore_streak("dana", "make_your_bed", at(10, 10, 9)) == 4


def test_a_member_with_nothing_due_keeps_their_streak() -> None:
    engine = sample_engine(at(10, 5, 9), activities=[plan("bed", "Make your bed", ["dana"], 5 / 60, "day", days=["mon", "wed"])])
    engine.complete(at(10, 5, 9), key="bed|dana|day:2026-10-05|0", by="dana", source="tablet", approve=True)
    engine.complete(at(10, 7, 9), key="bed|dana|day:2026-10-07|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(10, 8, 9))
    assert engine.streak("dana", at(10, 8, 9)) == 2


def test_week_streaks_count_finished_weeks() -> None:
    engine = sample_engine(at(10, 5, 9), activities=[plan("yard", "Yard work", ["casey"], 1, "week")])
    engine.complete(at(10, 6, 9), key="yard|casey|week:2026-10-05|0", by="casey", source="tablet")
    engine.catch_up(at(10, 13, 9))
    assert _summary(engine, "casey", "week:2026-10-05")["closed"] is True
    assert engine.week_streak("casey", at(10, 13, 9)) == 1
    engine.catch_up(at(10, 20, 9))
    assert engine.week_streak("casey", at(10, 20, 9)) == 0


def test_progress_today_this_week_and_shared_time() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 8), key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet")
    engine.complete(at(10, 13, 9), key="clean_the_bathroom|casey|week:2026-10-12|0", by="casey", source="tablet")
    board = engine.board(at(10, 13, 16, 10))
    casey = board["members"]["casey"]
    assert casey["today"] == {"due": 3, "done": 1, "pending": 0, "minutes_due": 45.0, "minutes_done": 15.0, "minutes_pending": 0.0}
    week = casey["week"]
    assert (week["minutes_done"], week["minutes_pending"]) == (15.0, 60.0)
    assert week["percent"] == round(100 * 75 / week["minutes_due"])
    assert casey["contribution"] == {"minutes": 75.0, "shared_minutes": 60.0}
    assert board["household"] == {"due": 8, "done": 1, "pending": 0}
    assert board["week"] == {"start": "2026-10-12", "end": "2026-10-19", "days_left": 6}


def test_old_records_are_pruned_and_summaries_kept() -> None:
    engine = sample_engine(at(7, 1, 9), activities=[plan("bed", "Make your bed", ["dana"], 5 / 60, "day")])
    engine.complete(at(7, 1, 9), key="bed|dana|day:2026-07-01|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(9, 28, 9))
    assert len(engine.log["completions"]) == 1
    engine.catch_up(at(10, 1, 9))
    assert engine.log["completions"] == []
    assert any(s["period"] == "day:2026-07-01" for s in engine.log["summaries"])
    assert engine.balance("dana") == 1


def test_a_dated_once_chore_finishes_when_it_is_missed() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-17T03:00:00-05:00"


def test_carried_over_once_chores_wait_until_done() -> None:
    engine = sample_engine(settings={"missed": "carry_over"})
    engine.catch_up(at(10, 17, 9))
    assert engine.activity("fix_the_gate_latch")["finished_at"] is None
    item = engine.find_item("fix_the_gate_latch|alex|once|0", at(10, 17, 9))
    assert (item.section, item.overdue_since) == ("overdue", date(2026, 10, 16))
    engine.complete(at(10, 17, 10), key="fix_the_gate_latch|alex|once|0", by="alex", source="tablet")
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-17T10:10:00-05:00"


def test_a_repeating_chore_finishes_after_its_last_week() -> None:
    engine = sample_engine()
    engine.catch_up(at(11, 29, 9))
    assert engine.activity("rake_the_leaves")["finished_at"] is None
    engine.catch_up(at(11, 30, 9))
    assert engine.activity("rake_the_leaves")["finished_at"] == "2026-11-30T03:00:00-06:00"


def test_weeks_off_are_caught_up_once_each(  # Review Focus 2
) -> None:
    engine = sample_engine(at(9, 1, 9))
    out = engine.catch_up(at(10, 13, 9))  # Home Assistant was off for six weeks
    assert engine.log["last_day"] == "2026-10-12"
    days = [s["period"] for s in engine.log["summaries"] if s["member"] == "dana" and s["period"].startswith("day:")]
    assert len(days) == len(set(days)) == 42
    missed = [e.data["occurrence"] for e in out.events if e.type == "missed"]
    assert len(missed) == len(set(missed))
    assert engine.catch_up(at(10, 13, 9)).events == []


def test_an_earlier_day_start_ends_the_day_at_once_and_only_once(  # Review Focus 4
) -> None:
    engine = sample_engine(at(10, 13, 2, 30))  # 2:30 AM Tuesday is still Monday's chore day
    assert engine.today(at(10, 13, 2, 30)) == date(2026, 10, 12)
    engine.save_settings(at(10, 13, 2, 30), {"day_starts": "02:00"})
    assert engine.today(at(10, 13, 2, 30)) == date(2026, 10, 13)
    engine.catch_up(at(10, 13, 2, 30))
    assert engine.log["last_day"] == "2026-10-12"
    engine.save_settings(at(10, 13, 2, 40), {"day_starts": "04:00"})
    engine.catch_up(at(10, 13, 4, 30))
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12"]
