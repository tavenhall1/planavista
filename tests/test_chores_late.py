"""Late records: the pure rules (missed-and-urgency spec sections 1 to 3)."""
from __future__ import annotations

from datetime import date, datetime, timedelta

import pytest

from custom_components.planavista.chores import late
from custom_components.planavista.chores.engine import ChoresEngine
from custom_components.planavista.chores.occurrences import Occurrence
from custom_components.planavista.chores.periods import Clock

from .chores_sample import TZ, at, keys, plan, sample_engine

CLOCK = Clock(TZ)
TODAY = date(2026, 10, 14)


def _occ(chore: str, member: str, period: str, n: int, window: str, due: datetime | None) -> Occurrence:
    day = date.fromisoformat(period.split(":")[1]) if ":" in period else TODAY
    return Occurrence(
        key=f"{chore}|{member}|{period}|{n}", chore=chore, owner=member, member=member, period=period, n=n,
        appears=day, planned=None, due=due, band=None, credit_minutes=10.0, stars=1, window=window,
    )


def _bed(day: date) -> Occurrence:
    return _occ("make_your_bed", "dana", f"day:{day.isoformat()}", 0, "day", CLOCK.day_end(day))


def _laundry(n: int, week: date = date(2026, 10, 12)) -> Occurrence:
    return _occ("laundry", "blair", f"week:{week.isoformat()}", n, "week", CLOCK.day_end(week + timedelta(days=6)))


def _flag(records, *, late_row: bool = True, scheduled=lambda d: True, away=lambda d: False) -> dict:
    return late.missed_flag(records, late=late_row, scheduled=scheduled, away=away, clock=CLOCK)


def test_late_record_marks_missed() -> None:
    record = late.late_record(_bed(date(2026, 10, 12)), date(2026, 10, 12))
    assert record["missed"] is True
    assert record["since"] == "2026-10-12"
    assert record["key"] == "make_your_bed|dana|day:2026-10-12|0"
    assert record["due"] == CLOCK.day_end(date(2026, 10, 12)).isoformat()
    assert record["window"] == "day" and record["member"] == "dana"
    assert late.is_late(record)
    assert not late.is_late({"key": "x"})


def test_answering_takes_any_credited_copy_after_since() -> None:
    record = late.late_record(_bed(date(2026, 10, 12)), date(2026, 10, 12))

    def done(day: int, *, member: str = "dana", state: str = "done", chore: str = "make_your_bed") -> dict:
        return {"chore": chore, "member": member, "state": state, "at": f"2026-10-{day:02d}T08:00:00-05:00"}

    def day_of(stamp: object) -> date:
        return date.fromisoformat(str(stamp)[:10])

    def answer(*rows: dict) -> dict | None:
        return late.answering(record, rows, "dana", day_of)

    # Only a day after the missed one: that day's check-offs were for that day's copies.
    assert answer(done(12)) is None
    next_day = done(13)
    assert answer(next_day) is next_day
    later = done(14, state="pending")
    assert answer(next_day, later) is later
    assert answer(done(11)) is None
    assert answer(done(13, member="blair")) is None
    assert answer(done(13, state="sent_back")) is None
    assert answer(done(13, state="undone")) is None
    assert answer(done(13, chore="feed_the_fish")) is None


def test_count_is_periods_not_records() -> None:
    records = [late.late_record(_laundry(n), date(2026, 10, 18)) for n in (0, 1)]
    flag = _flag(records)
    assert flag["count"] == 1 and flag["unit"] == "week"
    assert flag["periods"] == ["2026-10-12"]
    assert flag["late"] is True
    assert _flag(records, late_row=False)["late"] is False


def test_in_a_row_skips_unscheduled_and_away_days() -> None:
    records = [late.late_record(_bed(date(2026, 10, d)), date(2026, 10, d)) for d in (12, 14)]
    tuesday = date(2026, 10, 13)
    flag = _flag(records, scheduled=lambda d: d != tuesday)
    assert (flag["count"], flag["unit"], flag["in_a_row"]) == (2, "day", True)
    assert flag["periods"] == ["2026-10-12", "2026-10-14"]
    assert _flag(records, away=lambda d: d == tuesday)["in_a_row"] is True
    excused = _flag(records)
    assert excused["in_a_row"] is False
    assert late.missed_words(excused, TODAY) == "Missed 2 times"


def test_strict_picked_day_counts_by_its_day() -> None:
    tuesday, thursday = date(2026, 10, 13), date(2026, 10, 15)
    records = [
        late.late_record(_occ("laundry", "blair", "week:2026-10-12", n, "week", CLOCK.day_end(day)), day)
        for n, day in ((0, tuesday), (1, thursday))
    ]
    flag = _flag(records)
    assert (flag["count"], flag["unit"]) == (2, "day")
    assert flag["periods"] == ["2026-10-13", "2026-10-15"]


def test_missed_words() -> None:
    def words(flag: dict) -> str:
        return late.missed_words(flag, TODAY)

    yesterday = _flag([late.late_record(_bed(date(2026, 10, 13)), date(2026, 10, 13))])
    assert words(yesterday) == "Missed yesterday"
    run = _flag([late.late_record(_bed(date(2026, 10, d)), date(2026, 10, d)) for d in (11, 12, 13)])
    assert words(run) == "Missed 3 days in a row"
    last_week = _flag([late.late_record(_laundry(0, date(2026, 10, 5)), date(2026, 10, 11))])
    assert words(last_week) == "Missed last week"
    weeks = _flag([late.late_record(_laundry(0, w), w + timedelta(days=6)) for w in (date(2026, 9, 28), date(2026, 10, 5))])
    assert words(weeks) == "Missed 2 weeks in a row"
    month = {"count": 1, "unit": "month", "in_a_row": True, "periods": ["2026-09-01"], "late": True}
    assert words(month) == "Missed last month"
    months = {"count": 2, "unit": "month", "in_a_row": True, "periods": ["2026-08-01", "2026-09-01"], "late": True}
    assert words(months) == "Missed 2 months in a row"
    once = {"count": 1, "unit": "time", "in_a_row": False, "periods": ["2026-10-13"], "late": True}
    assert words(once) == "Missed Tue"
    times = {"count": 3, "unit": "time", "in_a_row": False, "periods": ["2026-10-01"], "late": True}
    assert words(times) == "Missed 3 times"
    gaps = _flag([late.late_record(_bed(date(2026, 10, d)), date(2026, 10, d)) for d in (8, 10, 13)])
    assert words(gaps) == "Missed 3 times"


def test_once_chore_counts_as_time() -> None:
    occ = _occ("garage", "alex", "once", 0, "once", CLOCK.day_end(date(2026, 10, 13)))
    flag = _flag([late.late_record(occ, date(2026, 10, 13))])
    assert (flag["count"], flag["unit"], flag["in_a_row"]) == (1, "time", False)
    assert flag["periods"] == ["2026-10-13"]


# The engine: late records made, answered, and tidied (spec section 1) ------------------------

MONDAY = at(10, 12, 9)
BED = "make_your_bed|dana|day:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"


def _record(engine: ChoresEngine, key: str) -> dict | None:
    return next((c for c in engine.log["carried"] if c["key"] == key), None)


def _summary(engine: ChoresEngine, member: str, period: str) -> dict:
    return next(s for s in engine.log["summaries"] if s["member"] == member and s["period"] == period)


def _answer(engine: ChoresEngine, key: str) -> dict | None:
    return engine._late_answer(_record(engine, key), engine._index())


@pytest.mark.parametrize("policy", ["make_up", "strict"])
def test_make_it_up_miss_leaves_a_late_record(policy: str) -> None:
    engine = sample_engine(MONDAY, settings={"missed": policy})
    out = engine.catch_up(at(10, 13, 9))
    record = _record(engine, BED)
    assert record is not None
    assert record["missed"] is True and record["since"] == "2026-10-12"
    assert record == late.late_record(engine._past_occurrence(BED), date(2026, 10, 12))
    assert BED in _summary(engine, "dana", "day:2026-10-12")["missed"]
    assert BED in [e.data["occurrence"] for e in out.events if e.type == "missed"]
    # Served as the missed flag on today's copy: no overdue row, no row of its own.
    assert keys(engine, "dana", at(10, 13, 9), "overdue") == []
    assert BED not in keys(engine, "dana", at(10, 13, 9))
    assert [c["key"] for c in engine.log["carried"]].count(BED) == 1


def test_carry_it_over_makes_no_late_records() -> None:
    engine = sample_engine(MONDAY, settings={"missed": "carry_over"})
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is not None
    assert not any("missed" in c for c in engine.log["carried"])
    item = engine.find_item(BED, at(10, 14, 9))
    assert (item.section, item.counted) == ("overdue", True)


@pytest.mark.parametrize("policy", ["make_up", "strict"])
def test_late_send_back_leaves_a_late_record(policy: str) -> None:
    engine = sample_engine(settings={"auto_approve": "never", "missed": policy})
    engine.complete(at(10, 13, 16), key=FISH, by="dana", source="tablet")
    [request] = [r for r in engine.open_requests() if r["occurrence"] == FISH]
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, FISH) is None  # waiting for approval at its day's end: not missed
    out = engine.review(at(10, 14, 10), request_id=request["id"], allow=False, by="blair")
    assert [e.data["occurrence"] for e in out.events if e.type == "missed"] == [FISH]
    record = _record(engine, FISH)
    assert record is not None and record["missed"] is True and record["since"] == "2026-10-13"
    assert [c["key"] for c in engine.log["carried"]].count(FISH) == 1


def test_late_send_back_under_carry_it_over_carries_as_before() -> None:
    engine = sample_engine(settings={"auto_approve": "never", "missed": "carry_over"})
    engine.complete(at(10, 13, 16), key=FISH, by="dana", source="tablet")
    [request] = [r for r in engine.open_requests() if r["occurrence"] == FISH]
    engine.catch_up(at(10, 14, 9))
    engine.review(at(10, 14, 10), request_id=request["id"], allow=False, by="blair")
    record = _record(engine, FISH)
    assert record is not None and "missed" not in record


def test_answered_record_is_dropped_only_once_approved() -> None:
    engine = sample_engine(MONDAY, settings={"auto_approve": "never"})
    engine.catch_up(at(10, 13, 9))
    assert _answer(engine, BED) is None
    # Today's bed, waiting for approval, answers yesterday's miss.
    today = engine.complete(at(10, 13, 9), key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    assert today.result == "pending"
    answer = _answer(engine, BED)
    assert answer is not None and answer["id"] == today.data["completion"]
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is not None  # still waiting: kept
    engine.review(at(10, 14, 10), request_id=today.data["completion"], allow=True, by="blair")
    assert _record(engine, BED) is not None  # approved: kept until the day's tidy
    engine.catch_up(at(10, 15, 9))
    assert _record(engine, BED) is None
    # Other misses stay.
    assert _record(engine, "feed_the_fish|dana|day:2026-10-12|0") is not None


def test_a_send_back_unanswers_it() -> None:
    engine = sample_engine(MONDAY, settings={"auto_approve": "never"})
    engine.catch_up(at(10, 13, 9))
    today = engine.complete(at(10, 13, 9), key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.review(at(10, 13, 10), request_id=today.data["completion"], allow=False, by="blair")
    assert _answer(engine, BED) is None
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is not None and _answer(engine, BED) is None


def test_answers_come_only_from_the_same_chore_and_member() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    engine.complete(at(10, 13, 9), key="feed_the_fish|dana|day:2026-10-13|0", by="dana", source="tablet", approve=True)
    assert _answer(engine, BED) is None
    engine.complete(at(10, 13, 9, 30), key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet", approve=True)
    assert _answer(engine, BED)["occurrence"] == "make_your_bed|dana|day:2026-10-13|0"
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is None
    assert _record(engine, "feed_the_fish|dana|day:2026-10-12|0") is None  # today's fish answered it too


def test_undo_brings_the_callout_back() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    today = "make_your_bed|dana|day:2026-10-13|0"
    engine.complete(at(10, 13, 9), key=today, by="dana", source="tablet", approve=True)
    assert _answer(engine, BED) is not None
    engine.undo(at(10, 13, 9, 5), key=today, by="dana", source="tablet")
    assert _answer(engine, BED) is None
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is not None and _answer(engine, BED) is None


def test_a_late_excuse_drops_it() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    engine.excuse_missed(at(10, 13, 10), key=BED, by="blair")
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is None


def test_a_hand_off_of_a_later_copy_leaves_the_record_with_who_missed_it() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    today = "make_your_bed|dana|day:2026-10-13|0"
    engine.log["overrides"].append({"occurrence": today, "assignee": "casey", "at": at(10, 13, 9).isoformat()})
    engine.complete(at(10, 13, 9, 5), key=today, by="casey", source="tablet", approve=True)
    assert _answer(engine, BED) is None  # Casey's check-off is Casey's, not Dana's answer
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, BED) is not None


def test_once_chore_with_a_late_record_is_not_finished() -> None:
    gate = "fix_the_gate_latch|alex|once|0"
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    record = _record(engine, gate)
    assert record is not None and record["missed"] is True and record["since"] == "2026-10-16"
    assert engine.activity("fix_the_gate_latch")["finished_at"] is None
    engine.catch_up(at(10, 18, 9))
    assert engine.activity("fix_the_gate_latch")["finished_at"] is None
    # Answered (as task 3's late row will be): finished at the rollover that drops it.
    engine.log["completions"].append({
        "id": "late1", "occurrence": gate, "chore": "fix_the_gate_latch", "member": "alex", "done_by": "alex",
        "by": "alex", "at": at(10, 18, 10).isoformat(), "source": "tablet", "user": None, "state": "done",
        "review": None, "credit_minutes": record["credit_minutes"], "stars": 0,
    })
    engine.catch_up(at(10, 19, 9))
    assert _record(engine, gate) is None
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-19T03:00:00-05:00"


def test_once_chore_cleared_by_an_excuse_finishes() -> None:
    gate = "fix_the_gate_latch|alex|once|0"
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    engine.excuse_missed(at(10, 17, 10), key=gate, by="blair")
    engine.catch_up(at(10, 18, 9))
    assert _record(engine, gate) is None
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-18T03:00:00-05:00"


def test_a_morning_check_off_does_not_answer_the_evening_miss() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(at(10, 12, 8), key="cat_care|casey|day:2026-10-12|0", by="casey", source="tablet", approve=True)
    engine.catch_up(at(10, 13, 9))
    evening = "cat_care|casey|day:2026-10-12|1"
    assert _record(engine, evening) is not None and _answer(engine, evening) is None
    assert _record(engine, "cat_care|casey|day:2026-10-12|0") is None
    engine.catch_up(at(10, 14, 9))
    assert _record(engine, evening) is not None


def test_one_load_done_on_the_weeks_last_day_leaves_the_other_load_missed() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(at(10, 18, 10), key="laundry|blair|week:2026-10-12|1", by="blair", source="tablet", approve=True)
    engine.catch_up(at(10, 19, 9))
    monday = "laundry|blair|week:2026-10-12|0"
    record = _record(engine, monday)
    assert record is not None and record["since"] == "2026-10-18"
    assert _answer(engine, monday) is None
    engine.catch_up(at(10, 20, 9))
    assert _record(engine, monday) is not None


def test_late_records_go_with_the_logs_retention() -> None:
    bed = plan("bed", "Make your bed", ["dana"], 5 / 60, "day")
    engine = sample_engine(at(7, 1, 9), activities=[bed])
    engine.catch_up(at(10, 1, 9))  # the last boundary is 10/1 3 AM; 90 days before it is 7/3 3 AM
    since = sorted(c["since"] for c in engine.log["carried"] if c["chore"] == "bed")
    assert since[0] == "2026-07-03" and since[-1] == "2026-09-30"
    assert len(since) == len(set(since))


# Serving them: the flag, the late row, and the feed (spec sections 1 and 2) --------------------

WEDNESDAY = at(10, 14, 9)
GATE = "fix_the_gate_latch|alex|once|0"
WED_BED = "make_your_bed|dana|day:2026-10-14|0"


def _item(engine: ChoresEngine, member: str, key: str, now: datetime):
    return next((i for i in engine.items(now).get(member, []) if i.occ.key == key), None)


def _missed_rows(engine: ChoresEngine, member: str, now: datetime) -> list:
    return [i for i in engine.items(now).get(member, []) if i.section == "missed"]


def _chore_stars(engine: ChoresEngine, member: str) -> int:
    return sum(1 for e in engine.rewards["ledger"] if e["member"] == member and e["reason"] == "chore")


def test_flag_rides_on_todays_copy() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(WEDNESDAY)
    bed = _item(engine, "dana", WED_BED, WEDNESDAY)
    assert bed.missed == {
        "count": 2, "unit": "day", "in_a_row": True, "periods": ["2026-10-12", "2026-10-13"], "late": False,
    }
    assert (bed.section, bed.counted) == ("today", True)
    assert _missed_rows(engine, "dana", WEDNESDAY) == []
    assert engine.item_view(bed, WEDNESDAY.date())["missed"] == bed.missed
    # Two records, one flag: a callout per chore per person.
    assert [c["key"] for c in engine.log["carried"] if c["chore"] == "make_your_bed"] == [
        BED, "make_your_bed|dana|day:2026-10-13|0",
    ]


def test_one_checkoff_clears_every_record() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(WEDNESDAY)
    stars = _chore_stars(engine, "dana")
    out = engine.complete(at(10, 14, 9, 30), key=WED_BED, by="dana", source="tablet", approve=True)
    assert out.result == "done"
    assert _chore_stars(engine, "dana") == stars + 1
    later = at(10, 14, 9, 31)
    bed = _item(engine, "dana", WED_BED, later)
    assert (bed.status, bed.missed) == ("done", None)
    assert not any(i.occ.chore == "make_your_bed" and i.missed for i in engine.items(later)["dana"])
    assert _missed_rows(engine, "dana", later) == []
    # Both misses go at the tidy once the answer stands; the misses stay in the record.
    engine.catch_up(at(10, 15, 9))
    assert [c for c in engine.log["carried"] if c["chore"] == "make_your_bed"] == []
    assert BED in _summary(engine, "dana", "day:2026-10-12")["missed"]


def test_late_row_when_no_current_copy() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    [row] = _missed_rows(engine, "alex", at(10, 17, 9))
    assert (row.occ.key, row.status, row.counted, row.overdue_since) == (GATE, "open", False, date(2026, 10, 16))
    assert row.missed == {"count": 1, "unit": "time", "in_a_row": False, "periods": ["2026-10-16"], "late": True}
    view = engine.item_view(row, date(2026, 10, 17))
    assert (view["section"], view["counted"], view["missed"]["late"]) == ("missed", False, True)


def test_a_late_row_is_checked_off_by_its_own_key_and_undone() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    due_before = engine.board(at(10, 17, 9))["members"]["alex"]["today"]["due"]
    out = engine.complete(at(10, 17, 10), key=GATE, by="alex", source="tablet")
    assert out.result == "done"
    [row] = _missed_rows(engine, "alex", at(10, 17, 10, 1))
    assert (row.occ.key, row.status, row.counted, row.missed) == (GATE, "done", False, None)
    assert engine.activity("fix_the_gate_latch")["finished_at"] is not None
    board = engine.board(at(10, 17, 10, 1))["members"]["alex"]
    assert board["today"]["due"] == due_before  # done late, it still isn't part of the ring
    assert [i["key"] for i in board["items"]].count(GATE) == 1
    engine.undo(at(10, 17, 10, 5), key=GATE, by="alex", source="tablet")
    [row] = _missed_rows(engine, "alex", at(10, 17, 10, 6))
    assert (row.status, row.missed["late"]) == ("open", True)
    assert engine.activity("fix_the_gate_latch")["finished_at"] is None
    # Done again and the day ends: nothing counted it, and the chore finishes at the tidy.
    engine.complete(at(10, 17, 11), key=GATE, by="alex", source="tablet")
    engine.catch_up(at(10, 18, 9))
    saturday = _summary(engine, "alex", "day:2026-10-17")
    assert GATE not in saturday["keys"] and GATE not in saturday["open"]
    assert _record(engine, GATE) is None
    assert _missed_rows(engine, "alex", at(10, 18, 9)) == []
    assert engine.activity("fix_the_gate_latch")["finished_at"] is not None


def test_late_rows_are_not_counted() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(WEDNESDAY)
    fresh = sample_engine(WEDNESDAY)  # the same Wednesday with nothing missed before it
    assert (
        engine.board(WEDNESDAY)["members"]["dana"]["today"]["due"]
        == fresh.board(WEDNESDAY)["members"]["dana"]["today"]["due"]
    )
    engine.catch_up(at(10, 16, 9))
    thursday = _summary(engine, "dana", "day:2026-10-15")
    assert BED not in thursday["keys"] and BED not in thursday["open"]
    assert BED not in thursday["missed"]
    # A one-time chore's late row, done in the week it was missed: its week still says missed.
    gate = sample_engine()
    gate.catch_up(at(10, 17, 9))
    gate.complete(at(10, 17, 10), key=GATE, by="alex", source="tablet")
    gate.catch_up(at(10, 19, 9))
    week = _summary(gate, "alex", "week:2026-10-12")
    assert GATE in week["missed"]
    assert week["keys"][GATE][0] == "open"


@pytest.mark.parametrize("how", ["away", "excused"])
def test_excused_or_away_copy_leaves_a_late_row(how: str) -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    tuesday = "make_your_bed|dana|day:2026-10-13|0"
    if how == "away":
        engine.member("dana")["away"] = [{"from": "2026-10-13", "to": "2026-10-13", "note": None}]
    else:
        engine.excuse(at(10, 13, 9), chore="make_your_bed", member="dana", by="blair", key=tuesday)
    copy = _item(engine, "dana", tuesday, at(10, 13, 9))
    assert (copy.status, copy.missed) == (how, None)
    rows = [i for i in _missed_rows(engine, "dana", at(10, 13, 9)) if i.occ.chore == "make_your_bed"]
    assert [(i.occ.key, i.status, i.missed["late"]) for i in rows] == [(BED, "open", True)]


def test_a_late_record_whose_day_is_later_marked_away_is_not_served() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 13, 9))
    engine.member("dana")["away"] = [{"from": "2026-10-12", "to": "2026-10-12", "note": None}]
    assert _item(engine, "dana", "make_your_bed|dana|day:2026-10-13|0", at(10, 13, 9)).missed is None
    assert _missed_rows(engine, "dana", at(10, 13, 9)) == []


def test_hand_off_keeps_the_callout_with_the_misser() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(at(10, 19, 9))
    monday = "laundry|blair|week:2026-10-19|0"
    flagged = _item(engine, "blair", monday, at(10, 19, 9))
    assert flagged.missed == {"count": 1, "unit": "week", "in_a_row": True, "periods": ["2026-10-12"], "late": False}
    engine.override(at(10, 19, 9), key=monday, by="alex", assignee="alex")
    later = at(10, 19, 9, 1)
    [row] = [i for i in _missed_rows(engine, "blair", later) if i.occ.chore == "laundry"]
    assert (row.occ.key, row.occ.member, row.missed["late"], row.missed["count"]) == (
        "laundry|blair|week:2026-10-12|0", "blair", True, 1,
    )
    handed = _item(engine, "alex", monday, later)
    assert handed is not None and handed.missed is None
    assert [i for i in _missed_rows(engine, "alex", later) if i.occ.chore == "laundry"] == []


def test_an_assignee_override_on_the_late_key_moves_it() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    engine.override(at(10, 17, 9), key=GATE, by="alex", assignee="blair")
    later = at(10, 17, 9, 1)
    assert _missed_rows(engine, "alex", later) == []
    [row] = _missed_rows(engine, "blair", later)
    assert (row.occ.key, row.occ.member, row.missed["late"]) == (GATE, "blair", True)
    # Only the new holder's check-off answers it.
    engine.complete(at(10, 17, 10), key=GATE, by="blair", source="tablet")
    assert _answer(engine, GATE) is not None


def test_board_counts_missed_total() -> None:
    engine = sample_engine(MONDAY)
    engine.catch_up(WEDNESDAY)
    board = engine.board(WEDNESDAY)
    flagged = [i for m in board["members"].values() for i in m["items"] if i["missed"] is not None]
    assert board["missed_total"] == len(flagged) > 0
    assert all("missed" in i for m in board["members"].values() for i in m["items"])
    engine.complete(at(10, 14, 9, 30), key=WED_BED, by="dana", source="tablet", approve=True)
    assert engine.board(at(10, 14, 9, 31))["missed_total"] == len(flagged) - 1


def test_a_miss_again_after_more_time_refreshes_since() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    assert _record(engine, GATE)["since"] == "2026-10-16"
    engine.override(at(10, 17, 9), key=GATE, by="blair", due=date(2026, 10, 18))
    copy = _item(engine, "alex", GATE, at(10, 17, 9, 1))
    assert (copy.section, copy.missed["late"]) == ("today", False)
    engine.catch_up(at(10, 19, 9))
    records = [c for c in engine.log["carried"] if c["key"] == GATE]
    assert len(records) == 1 and records[0]["since"] == "2026-10-18"
    [row] = [i for i in _missed_rows(engine, "alex", at(10, 19, 9)) if i.occ.key == GATE]
    assert row.missed["periods"] == ["2026-10-18"]


def test_a_weekly_check_off_sent_back_after_its_week_leaves_a_late_record() -> None:
    from .chores_sample import MEMBERS

    members = [dict(m, parent=False, needs_ok_for="all") if m["id"] == "blair" else dict(m) for m in MEMBERS]
    engine = sample_engine(MONDAY, members=members, settings={"auto_approve": "never"})
    loads = ["laundry|blair|week:2026-10-12|0", "laundry|blair|week:2026-10-12|1"]
    engine.complete(at(10, 12, 10), key=loads[0], by="blair", source="tablet")
    engine.catch_up(at(10, 15, 9))
    engine.complete(at(10, 15, 10), key=loads[1], by="blair", source="tablet")
    engine.catch_up(at(10, 19, 9))
    assert not any(c["chore"] == "laundry" for c in engine.log["carried"])  # waiting at the week's end: not missed
    pending = next(c for c in engine.log["completions"] if c["occurrence"] == loads[1])
    out = engine.review(at(10, 19, 10), request_id=pending["id"], allow=False, by="alex")
    assert [e.data["occurrence"] for e in out.events if e.type == "missed"] == [loads[1]]
    record = _record(engine, loads[1])
    assert record is not None and record["missed"] is True and record["since"] == "2026-10-18"
    assert _record(engine, loads[0]) is None
    flagged = _item(engine, "blair", "laundry|blair|week:2026-10-19|0", at(10, 19, 10, 1))
    assert flagged.missed == {"count": 1, "unit": "week", "in_a_row": True, "periods": ["2026-10-12"], "late": False}
