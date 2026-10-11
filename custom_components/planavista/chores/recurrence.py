"""Repeating chores: the RRULE subset PlanaVista supports (spec section 7.3).

A standard RFC 5545 RRULE, the format Home Assistant calendars use, limited to
FREQ=DAILY, WEEKLY, or MONTHLY with INTERVAL, BYDAY (weekly), BYMONTHDAY
(monthly, one day), and COUNT or UNTIL. Anything else is refused with a
message that says what to change. Nothing here imports Home Assistant.

Instances follow python-dateutil's reading of the RFC, which the tests compare
against: the start date is an instance only when it fits the rule, weeks start
on Monday (WKST=MO), and a month without the day (the 31st in April) has no
instance. Chores repeat on dates, so an UNTIL with a time keeps only its date.
"""
from __future__ import annotations

from collections.abc import Iterator
import calendar
from dataclasses import dataclass
from datetime import date, timedelta
import re

FREQUENCIES = ("DAILY", "WEEKLY", "MONTHLY")
WEEKDAYS = ("MO", "TU", "WE", "TH", "FR", "SA", "SU")
MAX_INTERVAL = 99
MAX_COUNT = 999

_UNTIL = re.compile(r"(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?")
_NUMBER = re.compile(r"[0-9]{1,4}")


class RecurrenceError(ValueError):
    """A rule outside the supported subset. The message says what to change."""


@dataclass(frozen=True)
class Rule:
    """One parsed rule. `byday` holds weekdays with 0 for Monday."""

    freq: str
    interval: int = 1
    byday: tuple[int, ...] = ()
    bymonthday: int | None = None
    count: int | None = None
    until: date | None = None

    def __str__(self) -> str:
        """The rule as canonical RRULE text, the way PlanaVista stores it."""
        parts = [f"FREQ={self.freq}"]
        if self.interval != 1:
            parts.append(f"INTERVAL={self.interval}")
        if self.byday:
            parts.append("BYDAY=" + ",".join(WEEKDAYS[day] for day in self.byday))
        if self.bymonthday is not None:
            parts.append(f"BYMONTHDAY={self.bymonthday}")
        if self.count is not None:
            parts.append(f"COUNT={self.count}")
        if self.until is not None:
            parts.append(f"UNTIL={self.until:%Y%m%d}")
        return ";".join(parts)


def _number(value: str, name: str, low: int, high: int) -> int:
    if not _NUMBER.fullmatch(value) or not low <= int(value) <= high:
        raise RecurrenceError(f"{name} must be a whole number from {low} to {high}.")
    return int(value)


def parse_rule(text: object) -> Rule:
    """Read RRULE text (with or without the "RRULE:" prefix) or say what is wrong."""
    if not isinstance(text, str) or not text.strip():
        raise RecurrenceError("Add a repeating rule.")
    body = text.strip()
    if body[:6].upper() == "RRULE:":
        body = body[6:]
    parts: dict[str, str] = {}
    for part in body.split(";"):
        if not part.strip():
            continue
        name, sep, value = part.partition("=")
        name, value = name.strip().upper(), value.strip().upper()
        if not sep or not name or not value:
            raise RecurrenceError(f"{part.strip()} isn't a rule part like FREQ=WEEKLY.")
        if name in parts:
            raise RecurrenceError(f"{name} appears twice.")
        parts[name] = value

    freq = parts.pop("FREQ", None)
    if freq is None:
        raise RecurrenceError("The rule needs FREQ (DAILY, WEEKLY, or MONTHLY).")
    if freq not in FREQUENCIES:
        raise RecurrenceError("Chores repeat daily, weekly, or monthly.")
    interval = _number(parts.pop("INTERVAL", "1"), "INTERVAL", 1, MAX_INTERVAL)

    byday: tuple[int, ...] = ()
    if "BYDAY" in parts:
        if freq != "WEEKLY":
            raise RecurrenceError("Only weekly chores pick days of the week (BYDAY).")
        days = parts.pop("BYDAY").split(",")
        if any(day not in WEEKDAYS for day in days):
            raise RecurrenceError("BYDAY lists days such as MO,TH, without numbers in front.")
        if len(set(days)) != len(days):
            raise RecurrenceError("BYDAY lists a day twice.")
        byday = tuple(sorted(WEEKDAYS.index(day) for day in days))

    bymonthday: int | None = None
    if "BYMONTHDAY" in parts:
        if freq != "MONTHLY":
            raise RecurrenceError("Only monthly chores pick a day of the month (BYMONTHDAY).")
        value = parts.pop("BYMONTHDAY")
        if "," in value:
            raise RecurrenceError("A monthly chore repeats on one day of the month.")
        bymonthday = _number(value, "BYMONTHDAY", 1, 31)

    count: int | None = None
    if "COUNT" in parts:
        count = _number(parts.pop("COUNT"), "COUNT", 1, MAX_COUNT)
    until: date | None = None
    if "UNTIL" in parts:
        if count is not None:
            raise RecurrenceError("Use COUNT or UNTIL, not both.")
        match = _UNTIL.fullmatch(parts.pop("UNTIL"))
        try:
            if match is None:
                raise ValueError
            until = date(int(match[1]), int(match[2]), int(match[3]))
        except ValueError:
            raise RecurrenceError("UNTIL is a date such as 20261130.") from None

    if parts:
        name = sorted(parts)[0]
        raise RecurrenceError(f"PlanaVista doesn't support {name} in a repeating chore.")
    return Rule(freq, interval, byday, bymonthday, count, until)


def _months_later(year: int, month: int, months: int) -> tuple[int, int]:
    index = year * 12 + (month - 1) + months
    return index // 12, index % 12 + 1


def _candidates(rule: Rule, start: date, last: date, skip_to: date | None) -> Iterator[date]:
    """Dates that fit the rule from `start` through `last`, in order (COUNT and UNTIL not applied).

    `skip_to` jumps ahead to near that date; only rules without COUNT use it,
    because COUNT needs every instance from the start. Each frequency stops
    once a whole period lies after `last`, so a month that never has the day
    (the 31st, every April) can't loop forever.
    """
    if rule.freq == "DAILY":
        step = 0
        if skip_to is not None and skip_to > start:
            step = (skip_to - start).days // rule.interval
        while (candidate := start + timedelta(days=step * rule.interval)) <= last:
            yield candidate
            step += 1
    elif rule.freq == "WEEKLY":
        days = rule.byday or (start.weekday(),)
        first_monday = start - timedelta(days=start.weekday())
        week = 0
        if skip_to is not None and skip_to > start:
            weeks = (skip_to - first_monday).days // 7
            week = weeks // rule.interval * rule.interval
        while (monday := first_monday + timedelta(weeks=week)) <= last:
            for day in days:
                candidate = monday + timedelta(days=day)
                if candidate >= start:
                    yield candidate
            week += rule.interval
    else:
        day_of_month = rule.bymonthday or start.day
        months = 0
        if skip_to is not None and skip_to > start:
            between = (skip_to.year - start.year) * 12 + skip_to.month - start.month
            months = max(0, between) // rule.interval * rule.interval
        while date(*_months_later(start.year, start.month, months), 1) <= last:
            year, month = _months_later(start.year, start.month, months)
            if day_of_month <= calendar.monthrange(year, month)[1]:
                candidate = date(year, month, day_of_month)
                if candidate >= start:
                    yield candidate
            months += rule.interval


def instances(rule: Rule, start: date, last: date, first: date | None = None) -> Iterator[date]:
    """Instance dates from `first` (default `start`) through `last`, both inclusive."""
    first = first or start
    skip_to = first if rule.count is None else None
    produced = 0
    for candidate in _candidates(rule, start, last, skip_to):
        if candidate > last or (rule.until is not None and candidate > rule.until):
            return
        if rule.count is not None:
            produced += 1
            if produced > rule.count:
                return
        if candidate >= first:
            yield candidate


def last_instance(rule: Rule, start: date) -> date | None:
    """The final instance of a rule that ends (COUNT or UNTIL), or None when it never ends."""
    if rule.count is None and rule.until is None:
        return None
    last: date | None = None
    for candidate in instances(rule, start, rule.until or date.max - timedelta(days=400)):
        last = candidate
    return last
