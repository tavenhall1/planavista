"""Late records: what a missed chore leaves behind, and how it is told (missed-and-urgency spec 1 to 3).

Pure: nothing here imports Home Assistant or the engine. A late record is `_carry`'s shape plus
`missed: True`; the engine serves it as the "Missed" callout and drops it once an answering
check-off stands.
"""
from __future__ import annotations

from collections.abc import Callable, Iterable, Mapping
from datetime import date, datetime, timedelta
from typing import Any

from .occurrences import Occurrence
from .periods import Clock
from .status import MONTH_NAMES, short_day

MONTH_WORDS = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)

CREDITED = ("done", "pending")  # the engine's credited states (engine.CREDITED; kept here to stay import-free)


def late_record(occ: Occurrence, day: date) -> dict[str, Any]:
    """The carried record's shape plus `missed` and `since` (the day it was missed)."""
    return {
        "key": occ.key, "chore": occ.chore, "owner": occ.owner, "member": occ.member,
        "period": occ.period, "n": occ.n, "due": occ.due.isoformat() if occ.due else None,
        "band": occ.band, "credit_minutes": occ.credit_minutes, "stars": occ.stars,
        "window": occ.window, "since": day.isoformat(), "missed": True,
    }


def is_late(record: Mapping[str, Any]) -> bool:
    """Whether a carried entry is a late record."""
    return record.get("missed") is True


def answering(
    record: Mapping[str, Any], completions: Iterable[Mapping[str, Any]], member: str,
    day_of: Callable[[object], date],
) -> Mapping[str, Any] | None:
    """The latest credited check-off of the record's chore by `member` on a chore day after its `since` day.

    Only after: the missed day ended at the rollover that made the record, and a check-off made on
    it was for that day's copies (cat care's morning, the week's other load), not for the miss.
    """
    since = date.fromisoformat(record["since"])
    found: Mapping[str, Any] | None = None
    for completion in completions:
        if (
            completion.get("state") in CREDITED
            and completion.get("chore") == record["chore"]
            and completion.get("member") == member
            and day_of(completion.get("at")) > since
        ):
            found = completion
    return found


def _unit_and_start(record: Mapping[str, Any], clock: Clock) -> tuple[str, date]:
    """(unit, the missed period's start day) of one record."""
    kind, _, text = str(record.get("period") or "").partition(":")
    try:
        start: date | None = date.fromisoformat(text)
    except ValueError:
        start = None
    due_text = record.get("due")
    due_day = clock.due_day(datetime.fromisoformat(due_text)) if isinstance(due_text, str) and due_text else None
    since = date.fromisoformat(record["since"]) if record.get("since") else None
    anchor = due_day or since or start
    window = record.get("window")
    if kind == "day" and start is not None:
        return "day", start
    if window == "day":
        day = due_day or start or since or date.min
        if kind == "rep" and due_day is not None and due_day == clock.week_end(due_day) - timedelta(days=1):
            # A day's Repeats under Make it up is due as its week ends: a missed week (final review A-I4b).
            return "week", clock.week_start(due_day)
        return "day", day
    if window == "week":
        if due_day is not None and due_day != clock.week_end(due_day) - timedelta(days=1):
            return "day", due_day  # a Strict picked day, due at the end of its own day
        base = start or anchor
        # A Repeats chore's period is its instance's day: the week is the one holding it (final review A-I4a).
        return "week", clock.week_start(base) if base else date.min
    if window == "month":
        base = start or anchor
        return "month", Clock.month_start(base) if base else date.min
    return "time", anchor or date.min


def _owed_in(
    start: date, end: date, period_scheduled: Callable[[date], bool], away: Callable[[date], bool]
) -> bool:
    """Whether a week or month between two misses was owed: scheduled, and the person not away all of it."""
    if not period_scheduled(start):
        return False
    return not all(away(start + timedelta(days=i)) for i in range((end - start).days))


def missed_flag(
    records: list[Mapping[str, Any]], *, late: bool, scheduled: Callable[[date], bool],
    away: Callable[[date], bool], clock: Clock, period_scheduled: Callable[[date], bool] | None = None,
) -> dict[str, Any]:
    """`{count, unit, in_a_row, periods, late, keys}` for one chore and member's late records.

    `scheduled(day)` says whether the chore was planned on a day, `period_scheduled(start)` whether
    anything of it was owed in the week or month starting then: a day, week, or month the chore
    wasn't owed, or the person was away all of, doesn't break a run.
    """
    starts: dict[date, str] = {}
    for record in records:
        unit, start = _unit_and_start(record, clock)
        starts[start] = unit
    days = sorted(starts)
    unit = starts[days[-1]]
    in_a_row = False
    if unit == "day":
        have = set(days)
        in_a_row = all(
            day in have or not scheduled(day) or away(day)
            for day in (days[0] + timedelta(days=i) for i in range((days[-1] - days[0]).days + 1))
        )
    elif unit in ("week", "month"):
        step = clock.week_end if unit == "week" else Clock.month_end
        owed = period_scheduled or (lambda start: True)
        in_a_row = True
        for a, b in zip(days, days[1:]):
            between = step(a)
            while between < b and not _owed_in(between, step(between), owed, away):
                between = step(between)
            if between != b:
                in_a_row = False
                break
    return {
        "count": len(days), "unit": unit, "in_a_row": in_a_row,
        "periods": [day.isoformat() for day in days], "late": late,
        "keys": [record["key"] for record in records],
    }


def period_words(unit: str, first: date, today: date) -> str:
    """One missed week or month: "last week" or "last month" just after it, else which it was.

    The week just before this one began 7 to 13 days ago (final review A-I4c); the card's
    status map says the same (tests/fixtures/chores_status.json).
    """
    if unit == "week":
        if 7 <= (today - first).days < 14:
            return "last week"
        return f"the week of {MONTH_NAMES[first.month - 1]} {first.day}"
    before = today.replace(day=1) - timedelta(days=1)
    if (first.year, first.month) == (before.year, before.month):
        return "last month"
    return f"in {MONTH_WORDS[first.month - 1]}"


def missed_words(flag: Mapping[str, Any], today: date) -> str:
    """The callout's words (spec section 3)."""
    count, unit = flag["count"], flag["unit"]
    first = date.fromisoformat(flag["periods"][0])
    if count == 1:
        if unit in ("week", "month"):
            return f"Missed {period_words(unit, first, today)}"
        if unit == "day" and first == today - timedelta(days=1):
            return "Missed yesterday"
        return f"Missed {short_day(first, today)}"
    if flag.get("in_a_row") and unit in ("day", "week", "month"):
        return f"Missed {count} {unit}s in a row"
    return f"Missed {count} times"
