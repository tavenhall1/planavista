"""Late records: the pure rules (missed-and-urgency spec sections 1 to 3)."""
from __future__ import annotations

from datetime import date, datetime, timedelta

from custom_components.planavista.chores import late
from custom_components.planavista.chores.occurrences import Occurrence
from custom_components.planavista.chores.periods import Clock

from .chores_sample import TZ

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
