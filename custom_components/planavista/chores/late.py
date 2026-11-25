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
from .status import short_day

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
        return "day", due_day or start or since or date.min
    if window == "week":
        if due_day is not None and due_day != clock.week_end(due_day) - timedelta(days=1):
            return "day", due_day  # a Strict picked day, due at the end of its own day
        return "week", start or (clock.week_start(anchor) if anchor else date.min)
    if window == "month":
        base = start or anchor
        return "month", Clock.month_start(base) if base else date.min
    return "time", anchor or date.min


def missed_flag(
    records: list[Mapping[str, Any]], *, late: bool, scheduled: Callable[[date], bool],
    away: Callable[[date], bool], clock: Clock,
) -> dict[str, Any]:
    """`{count, unit, in_a_row, periods, late}` for one chore and member's late records."""
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
        in_a_row = all(step(a) == b for a, b in zip(days, days[1:]))
    return {
        "count": len(days), "unit": unit, "in_a_row": in_a_row,
        "periods": [day.isoformat() for day in days], "late": late,
    }


def missed_words(flag: Mapping[str, Any], today: date) -> str:
    """The callout's words (spec section 3)."""
    count, unit = flag["count"], flag["unit"]
    first = date.fromisoformat(flag["periods"][0])
    if count == 1:
        if unit == "week":
            return "Missed last week"
        if unit == "month":
            return "Missed last month"
        if unit == "day" and first == today - timedelta(days=1):
            return "Missed yesterday"
        return f"Missed {short_day(first, today)}"
    if flag.get("in_a_row") and unit in ("day", "week", "month"):
        return f"Missed {count} {unit}s in a row"
    return f"Missed {count} times"
