"""Turning the plan into check-offs (spec sections 7.6, 8.2, 8.4, and 8.8).

An occurrence is one thing to check off: a chore, for one member, in one
period, number n. Its key, `{chore}|{member}|{period}|{n}`, is deterministic,
so every client names the same occurrence the same way. Plan, Once, and
Repeats chores are three generators of the one Occurrence shape. Whether an
occurrence is done comes from the log, not from here. Nothing here imports
Home Assistant.
"""
from __future__ import annotations

from collections.abc import Callable, Iterator, Mapping
from dataclasses import dataclass, replace
from datetime import date, datetime, timedelta
from typing import Any

from .model import on_board, stars_for
from .periods import WEEKDAY_CODES, Clock, parse_clock, period_id
from .recurrence import instances, parse_rule


@dataclass(frozen=True)
class Occurrence:
    """One check-off. `owner` is the assignee in the key; `member` is who has it now."""

    key: str
    chore: str
    owner: str
    member: str
    period: str
    n: int
    appears: date
    planned: date | None
    due: datetime | None
    band: str | None
    credit_minutes: float
    stars: int
    window: str
    dated: bool = False
    excused: bool = False


def occurrence_key(chore: str, member: str, period: str, n: int) -> str:
    """`{chore}|{member}|{period}|{n}` (spec 7.6)."""
    return f"{chore}|{member}|{period}|{n}"


def parse_key(key: object) -> tuple[str, str, str, int] | None:
    """(chore, member, period, n) from a key, or None when it isn't one."""
    if not isinstance(key, str):
        return None
    parts = key.split("|")
    if len(parts) != 4 or not parts[3].isdigit():
        return None
    return parts[0], parts[1], parts[2], int(parts[3])


@dataclass(frozen=True)
class Generator:
    """Everything generating occurrences needs besides the plan itself."""

    clock: Clock
    minutes_per_star: int
    policy_on: Callable[[date], str]

    def _occurrence(
        self,
        activity: Mapping[str, Any],
        member: str,
        period: str,
        n: int,
        *,
        appears: date,
        planned: date | None,
        due: datetime | None,
        band: str | None,
        minutes: float,
        window: str,
        dated: bool = False,
    ) -> Occurrence:
        credit = round(minutes, 2)
        return Occurrence(
            key=occurrence_key(activity["id"], member, period, n),
            chore=activity["id"],
            owner=member,
            member=member,
            period=period,
            n=n,
            appears=appears,
            planned=planned,
            due=due,
            band=band,
            credit_minutes=credit,
            stars=stars_for(credit, self.minutes_per_star, activity.get("stars")),
            window=window,
            dated=dated,
        )

    # Plan chores (spec 8.2): per day, per week on picked days, or per week floating.

    @staticmethod
    def _share_minutes(activity: Mapping[str, Any], member: str) -> float:
        if activity.get("split") == "shared" and activity.get("shares"):
            return float(activity["shares"].get(member, 0)) * 60
        return float(activity["minimum"]["hours"]) * 60

    @staticmethod
    def _band(activity: Mapping[str, Any], n: int) -> str | None:
        bands = activity.get("time_of_day") or []
        return bands[n % len(bands)] if bands else None

    def _plan_day(self, activity: Mapping[str, Any], member: str, day: date) -> list[Occurrence]:
        days = activity.get("days") or []
        if days and WEEKDAY_CODES[day.weekday()] not in days:
            return []
        times = int(activity.get("times", 1))
        each = self._share_minutes(activity, member) / times
        return [
            self._occurrence(
                activity, member, period_id("day", day), n,
                appears=day, planned=day, due=self.clock.day_end(day),
                band=self._band(activity, n), minutes=each, window="day",
            )
            for n in range(times)
        ]

    def _plan_week(self, activity: Mapping[str, Any], member: str, week: date) -> list[Occurrence]:
        clock = self.clock
        end = clock.week_end(week)
        times = int(activity.get("times", 1))
        share = self._share_minutes(activity, member)
        period = period_id("week", week)
        week_due = clock.day_start(end)
        days = activity.get("days") or []
        if not days:
            return [
                self._occurrence(
                    activity, member, period, n,
                    appears=week, planned=None, due=week_due,
                    band=self._band(activity, n), minutes=share / times, window="week",
                )
                for n in range(times)
            ]
        picked = [
            week + timedelta(days=offset)
            for offset in range((end - week).days)
            if WEEKDAY_CODES[(week + timedelta(days=offset)).weekday()] in days
        ]
        each = share / (len(days) * times)
        result = []
        for index, day in enumerate(picked):
            strict = self.policy_on(day) == "strict"
            for t in range(times):
                result.append(
                    self._occurrence(
                        activity, member, period, index * times + t,
                        appears=day, planned=day,
                        due=clock.day_end(day) if strict else week_due,
                        band=self._band(activity, t), minutes=each, window="week",
                    )
                )
        return result

    # Once chores: one occurrence per session per assignee, period `once`.

    def _once(self, activity: Mapping[str, Any], member: str) -> list[Occurrence]:
        once = activity["once"]
        sessions = int(once.get("sessions", 1))
        each = float(once.get("estimate_minutes", 15)) / sessions
        created = _created_day(activity, self.clock)
        if once.get("on"):
            day = date.fromisoformat(once["on"])
            timing = {"appears": day, "planned": day, "due": self.clock.day_end(day), "dated": False}
        elif once.get("by"):
            by = date.fromisoformat(once["by"])
            at = parse_clock(once.get("by_time"))
            due = (
                datetime.combine(by, at, tzinfo=self.clock.tz)
                if at is not None
                else self.clock.day_end(by)
            )
            timing = {"appears": created, "planned": None, "due": due, "dated": True}
        else:
            timing = {"appears": created, "planned": None, "due": None, "dated": False}
        return [
            self._occurrence(
                activity, member, "once", n, band=None, minutes=each, window="once", **timing
            )
            for n in range(sessions)
        ]

    # Repeats chores: one occurrence per instance per assignee, period `rep:<date>`.

    def _repeat(self, activity: Mapping[str, Any], member: str, instance: date) -> Occurrence:
        repeats = activity["repeats"]
        clock = self.clock
        minutes = float(repeats.get("estimate_minutes", 15))
        period = period_id("rep", instance)
        if repeats.get("window") == "period":
            start = date.fromisoformat(repeats["start"])
            if parse_rule(repeats["rrule"]).freq == "MONTHLY":
                first, end, window = clock.month_start(instance), clock.month_end(instance), "month"
            else:
                first, end, window = clock.week_start(instance), clock.week_end(instance), "week"
            return self._occurrence(
                activity, member, period, 0,
                appears=max(first, start), planned=None, due=clock.day_start(end),
                band=None, minutes=minutes, window=window,
            )
        strict = self.policy_on(instance) == "strict"
        due = clock.day_end(instance) if strict else clock.day_start(clock.week_end(instance))
        return self._occurrence(
            activity, member, period, 0,
            appears=instance, planned=instance, due=due, band=None, minutes=minutes, window="day",
        )

    def _repeat_instances(self, activity: Mapping[str, Any], first: date, last: date) -> list[date]:
        repeats = activity["repeats"]
        start = date.fromisoformat(repeats["start"])
        if last < start:
            return []
        return list(instances(parse_rule(repeats["rrule"]), start, last, first=max(first, start)))

    # Which periods matter on a chore day, and every occurrence of one period.

    def periods_on(self, activity: Mapping[str, Any], day: date) -> Iterator[tuple[str, date | None]]:
        """The (kind, start) periods whose occurrences may show on `day`."""
        schedule = activity.get("schedule")
        clock = self.clock
        if schedule == "plan":
            if activity["minimum"]["per"] == "day":
                yield "day", day
            else:
                yield "week", clock.week_start(day)
        elif schedule == "once":
            yield "once", None
        elif schedule == "repeats":
            repeats = activity["repeats"]
            if repeats.get("window") == "period":
                if parse_rule(repeats["rrule"]).freq == "MONTHLY":
                    first, last = clock.month_start(day), clock.month_end(day) - timedelta(days=1)
                else:
                    first, last = clock.week_start(day), clock.week_end(day) - timedelta(days=1)
            else:
                first, last = clock.week_start(day), day
            for instance in self._repeat_instances(activity, first, last):
                yield "rep", instance

    def period_occurrences(
        self, activity: Mapping[str, Any], member: str, kind: str, start: date | None
    ) -> list[Occurrence]:
        """Every occurrence of one period for one assignee (before overrides)."""
        schedule = activity.get("schedule")
        per = activity.get("minimum", {}).get("per") if schedule == "plan" else None
        if kind == "day" and start is not None and per == "day":
            return self._plan_day(activity, member, start)
        if kind == "week" and start is not None and per == "week":
            return self._plan_week(activity, member, start)
        if kind == "once" and schedule == "once":
            return self._once(activity, member)
        if kind == "rep" and start is not None and schedule == "repeats":
            return [self._repeat(activity, member, start)]
        return []

    def from_key(self, activity: Mapping[str, Any], key: str) -> Occurrence | None:
        """Regenerate one occurrence by its key, when the plan still makes it."""
        parsed = parse_key(key)
        if parsed is None or parsed[0] != activity.get("id"):
            return None
        _chore, member, period, n = parsed
        if member not in activity.get("assignees", []) or not on_board(activity):
            return None
        kind, _, start_text = period.partition(":")
        try:
            start = date.fromisoformat(start_text) if start_text else None
        except ValueError:
            return None
        if (
            kind == "rep"
            and start is not None
            and activity.get("schedule") == "repeats"
            and start not in self._repeat_instances(activity, start, start)
        ):
            return None
        if kind == "week" and start is not None and self.clock.week_start(start) != start:
            return None
        return next(
            (occ for occ in self.period_occurrences(activity, member, kind, start) if occ.key == key),
            None,
        )


def _created_day(activity: Mapping[str, Any], clock: Clock) -> date:
    created = activity.get("created")
    at = created.get("at") if isinstance(created, Mapping) else None
    try:
        return clock.chore_date(datetime.fromisoformat(at)) if at else date.min
    except (TypeError, ValueError):
        return date.min


def visible_on(occ: Occurrence, day: date, clock: Clock) -> bool:
    """Whether `occ` shows on chore day `day`: from when it appears until the day it is due."""
    if occ.appears > day:
        return False
    return occ.due is None or day <= clock.due_day(occ.due)


def with_overrides(
    occ: Occurrence, overrides: Mapping[str, Any], members: set[str], clock: Clock
) -> Occurrence:
    """Apply a parent's or a member's per-occurrence changes (spec 8.8).

    `planned_day` only moves where it shows; `due` moves when it is due;
    `assignee` hands it to someone else; `excused` means it isn't due.
    """
    changes: dict[str, Any] = {}
    if (planned := overrides.get("planned_day")) is not None:
        day = date.fromisoformat(planned)
        changes.update(planned=day, appears=max(occ.appears, day), dated=False)
    if (due := overrides.get("due")) is not None:
        changes["due"] = clock.day_end(date.fromisoformat(due))
    if (assignee := overrides.get("assignee")) is not None and assignee in members:
        changes["member"] = assignee
    if overrides.get("excused"):
        changes["excused"] = True
    return replace(occ, **changes) if changes else occ


def section_on(occ: Occurrence, day: date) -> tuple[str, date | None]:
    """Where an occurrence shows on `day`: (today or week, the day it moved from)."""
    if occ.dated or occ.planned == day:
        return "today", None
    if occ.planned is not None and occ.planned < day:
        return "week", occ.planned
    return "week", None


def counted_on(occ: Occurrence, day: date, clock: Clock) -> bool:
    """Whether `occ` is part of `day`'s ring: shown in Today and due by then, or planned for it."""
    section, _moved = section_on(occ, day)
    if section != "today":
        return False
    if occ.dated:
        return occ.due is not None and clock.due_day(occ.due) == day
    return True
