"""Late records: the pure rules (missed-and-urgency spec sections 1 to 3)."""
from __future__ import annotations

from datetime import date, datetime, timedelta

import pytest

from custom_components.planavista.chores import late
from custom_components.planavista.chores.engine import ChoresEngine
from custom_components.planavista.chores.occurrences import Occurrence
from custom_components.planavista.chores.periods import Clock

from .chores_sample import TZ, at, keys, sample_engine

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


def test_answering_takes_any_credited_copy_since() -> None:
    record = late.late_record(_bed(date(2026, 10, 12)), date(2026, 10, 12))

    def done(day: int, *, member: str = "dana", state: str = "done", chore: str = "make_your_bed") -> dict:
        return {"chore": chore, "member": member, "state": state, "at": f"2026-10-{day:02d}T08:00:00-05:00"}

    def day_of(stamp: object) -> date:
        return date.fromisoformat(str(stamp)[:10])

    def answer(*rows: dict) -> dict | None:
        return late.answering(record, rows, "dana", day_of)

    on_since = done(12)
    assert answer(on_since) is on_since
    later = done(14, state="pending")
    assert answer(on_since, later) is later
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
    # Until the board serves them (task 3), late records change nothing it shows.
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
