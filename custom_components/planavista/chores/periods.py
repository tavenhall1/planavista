"""Chore days, chore weeks, months, and time-of-day bands (spec section 8.1).

A chore day runs from `day_starts` (3:00 AM) to the next day's `day_starts`, in
Home Assistant's time zone. Boundaries are local wall-clock times made with
zoneinfo, never "add 24 hours", so days around daylight saving changes are 23
or 25 hours long. A chore week starts on the calendar's first-day setting; a
change of that setting takes effect at the next week boundary, so no week is
split. Nothing here imports Home Assistant.

Python compares and subtracts two datetimes that share a tzinfo by their wall
clocks, not as instants, so everything here compares instants in UTC.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import UTC, date, datetime, time, timedelta, tzinfo
import re
from typing import Any

WEEKDAY_CODES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
FIRST_DAYS = {"monday": 0, "sunday": 6}
BANDS = ("morning", "afternoon", "evening")
AFTERNOON_FROM = time(12, 0)
EVENING_FROM = time(17, 0)

_CLOCK = re.compile(r"([01][0-9]|2[0-3]):([0-5][0-9])")


def parse_clock(text: object) -> time | None:
    """A 24-hour "HH:MM" time, or None when the text isn't one."""
    if not isinstance(text, str):
        return None
    match = _CLOCK.fullmatch(text)
    return time(int(match[1]), int(match[2])) if match else None


def period_id(kind: str, day: date) -> str:
    """`day:YYYY-MM-DD`, `week:YYYY-MM-DD`, or `rep:YYYY-MM-DD` (spec 7.6)."""
    return f"{kind}:{day.isoformat()}"


def _rule_start(day: date, first_day: str) -> date:
    return day - timedelta(days=(day.weekday() - FIRST_DAYS[first_day]) % 7)


@dataclass(frozen=True)
class WeekRule:
    """Which day weeks start on, and since when.

    Before `since`, weeks follow `before`. The first week from `since` may be
    short, because it ends at the next week start under `first_day`.
    """

    first_day: str = "monday"
    before: str | None = None
    since: date | None = None
    # Older changes, oldest first: each (until, first_day) covers the days before `until` (round 15: a second
    # change kept only itself, and re-read every earlier week by the newer rule).
    earlier: tuple[tuple[date, str], ...] = ()

    def _segments(self) -> tuple[tuple[date, str], ...]:
        last = ((self.since, self.before),) if self.since is not None and self.before else ()
        return self.earlier + last

    def first_day_on(self, day: date) -> str:
        """The first-day setting that weeks follow on `day`."""
        for until, first_day in self._segments():
            if day < until:
                return first_day
        return self.first_day

    def _bounds(self, day: date) -> tuple[date | None, date | None]:
        low = high = None
        for until, _first_day in self._segments():
            if until <= day:
                low = until
            elif high is None:
                high = until
        return low, high

    def start(self, day: date) -> date:
        """The first chore day of the week holding `day`."""
        low, _high = self._bounds(day)
        start = _rule_start(day, self.first_day_on(day))
        return low if low is not None and start < low else start

    def end(self, day: date) -> date:
        """The first chore day after the week holding `day`."""
        _low, high = self._bounds(day)
        end = _rule_start(day, self.first_day_on(day)) + timedelta(days=7)
        return high if high is not None and end > high else end

    @classmethod
    def _of(cls, segments: list[tuple[date, str]], first_day: str) -> WeekRule:
        if not segments:
            return cls(first_day)
        until, before = segments[-1]
        return cls(first_day, before=before, since=until, earlier=tuple(segments[:-1]))

    def changed_to(self, first_day: str, today: date) -> WeekRule:
        """The rule after the setting changes on `today`: from the next week boundary on.

        Boundaries already passed stay; a change still ahead is replaced (or undone).
        """
        passed = [s for s in self._segments() if s[0] <= today]
        base = self._of(passed, self.first_day_on(today))
        if first_day == base.first_day:
            return base
        return self._of([*passed, (base.end(today), base.first_day)], first_day)

    def as_dict(self) -> dict[str, Any]:
        """How the log stores the rule (`earlier` only when there were two changes or more)."""
        stored: dict[str, Any] = {
            "first_day": self.first_day,
            "before": self.before,
            "since": self.since.isoformat() if self.since else None,
        }
        if self.earlier:
            stored["earlier"] = [{"until": until.isoformat(), "first_day": day} for until, day in self.earlier]
        return stored

    @classmethod
    def from_dict(cls, data: object) -> WeekRule:
        """Read a stored rule; anything unreadable starts weeks on Monday."""
        if not isinstance(data, dict) or data.get("first_day") not in FIRST_DAYS:
            return cls()
        before = data.get("before") if data.get("before") in FIRST_DAYS else None
        try:
            since = date.fromisoformat(data["since"]) if data.get("since") else None
        except (TypeError, ValueError):
            since = None
        earlier: list[tuple[date, str]] = []
        for entry in data.get("earlier") or []:
            try:
                if isinstance(entry, dict) and entry.get("first_day") in FIRST_DAYS:
                    earlier.append((date.fromisoformat(entry["until"]), entry["first_day"]))
            except (KeyError, TypeError, ValueError):
                continue
        return cls(data["first_day"], before if since else None, since if before else None, tuple(sorted(earlier)))


@dataclass(frozen=True)
class Clock:
    """Turns instants into chore days and back, in one time zone."""

    tz: tzinfo
    day_starts: time = time(3, 0)
    weeks: WeekRule = WeekRule()

    def with_weeks(self, weeks: WeekRule) -> Clock:
        """The same clock with another week rule."""
        return replace(self, weeks=weeks)

    def day_start(self, day: date) -> datetime:
        """When chore day `day` begins (a local wall-clock time)."""
        return datetime.combine(day, self.day_starts, tzinfo=self.tz)

    def day_end(self, day: date) -> datetime:
        """When chore day `day` ends: the next day's start."""
        return self.day_start(day + timedelta(days=1))

    def chore_date(self, at: datetime) -> date:
        """The chore day an instant falls in."""
        local = at.astimezone(self.tz).date()
        if at.astimezone(UTC) < self.day_start(local).astimezone(UTC):
            return local - timedelta(days=1)
        return local

    def due_day(self, due: datetime) -> date:
        """The chore day something due at `due` belongs to (the day that ends there)."""
        return self.chore_date(due - timedelta(microseconds=1))

    def week_start(self, day: date) -> date:
        """The first chore day of the chore week holding `day`."""
        return self.weeks.start(day)

    def week_end(self, day: date) -> date:
        """The first chore day after that week."""
        return self.weeks.end(day)

    @staticmethod
    def month_start(day: date) -> date:
        """The first day of the month holding `day`."""
        return day.replace(day=1)

    @staticmethod
    def month_end(day: date) -> date:
        """The first day of the next month."""
        return (day.replace(day=28) + timedelta(days=4)).replace(day=1)

    def band(self, at: datetime) -> str:
        """Morning until 12:00 PM, afternoon until 5:00 PM, evening after that (and past midnight)."""
        moment = at.astimezone(self.tz).time()
        if self.day_starts <= moment < AFTERNOON_FROM:
            return "morning"
        if AFTERNOON_FROM <= moment < EVENING_FROM:
            return "afternoon"
        return "evening"
