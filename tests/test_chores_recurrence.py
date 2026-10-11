"""The RRULE subset for repeating chores, checked against python-dateutil (spec 7.3, 16)."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import json
from pathlib import Path
import random
from typing import Any

from dateutil import rrule as du
import pytest

from custom_components.planavista.chores.recurrence import (
    RecurrenceError,
    Rule,
    instances,
    last_instance,
    parse_rule,
)

DU_FREQ = {"DAILY": du.DAILY, "WEEKLY": du.WEEKLY, "MONTHLY": du.MONTHLY}


def _dates(rule: str, start: date, last: date) -> list[date]:
    return list(instances(parse_rule(rule), start, last))


def test_a_rule_reads_back_in_canonical_form() -> None:
    rule = parse_rule("rrule:freq=weekly;byday=th,mo;interval=2;until=20261130T000000Z")
    assert rule == Rule("WEEKLY", 2, (0, 3), None, None, date(2026, 11, 30))
    assert str(rule) == "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH;UNTIL=20261130"
    assert str(parse_rule(str(rule))) == str(rule)


@pytest.mark.parametrize(
    ("text", "message"),
    [
        ("", "Add a repeating rule."),
        ("BYDAY=MO", "The rule needs FREQ (DAILY, WEEKLY, or MONTHLY)."),
        ("FREQ=YEARLY", "Chores repeat daily, weekly, or monthly."),
        ("FREQ=HOURLY", "Chores repeat daily, weekly, or monthly."),
        ("FREQ=DAILY;INTERVAL=0", "INTERVAL must be a whole number from 1 to 99."),
        ("FREQ=DAILY;BYDAY=MO", "Only weekly chores pick days of the week (BYDAY)."),
        ("FREQ=MONTHLY;BYDAY=2TU", "Only weekly chores pick days of the week (BYDAY)."),
        ("FREQ=WEEKLY;BYDAY=1MO", "BYDAY lists days such as MO,TH, without numbers in front."),
        ("FREQ=WEEKLY;BYDAY=MO,MO", "BYDAY lists a day twice."),
        ("FREQ=WEEKLY;BYMONTHDAY=3", "Only monthly chores pick a day of the month (BYMONTHDAY)."),
        ("FREQ=MONTHLY;BYMONTHDAY=1,15", "A monthly chore repeats on one day of the month."),
        ("FREQ=MONTHLY;BYMONTHDAY=-1", "BYMONTHDAY must be a whole number from 1 to 31."),
        ("FREQ=DAILY;COUNT=3;UNTIL=20261130", "Use COUNT or UNTIL, not both."),
        ("FREQ=DAILY;UNTIL=2026-11-30", "UNTIL is a date such as 20261130."),
        ("FREQ=DAILY;UNTIL=20260230", "UNTIL is a date such as 20261130."),
        ("FREQ=WEEKLY;WKST=SU", "PlanaVista doesn't support WKST in a repeating chore."),
        ("FREQ=MONTHLY;BYSETPOS=1", "PlanaVista doesn't support BYSETPOS in a repeating chore."),
        ("FREQ=DAILY;FREQ=WEEKLY", "FREQ appears twice."),
        ("FREQ", "FREQ isn't a rule part like FREQ=WEEKLY."),
    ],
)
def test_rules_outside_the_subset_say_what_to_change(text: str, message: str) -> None:
    with pytest.raises(RecurrenceError) as err:
        parse_rule(text)
    assert str(err.value) == message


# RFC 5545 section 3.8.5.3 examples that fall inside the subset (DTSTART 1997-09-02, a Tuesday).
RFC_START = date(1997, 9, 2)


def test_rfc_daily_for_10_occurrences() -> None:
    assert _dates("FREQ=DAILY;COUNT=10", RFC_START, date(1998, 1, 1)) == [
        RFC_START + timedelta(days=n) for n in range(10)
    ]


def test_rfc_every_10_days_5_occurrences() -> None:
    assert _dates("FREQ=DAILY;INTERVAL=10;COUNT=5", RFC_START, date(1998, 1, 1)) == [
        date(1997, 9, 2), date(1997, 9, 12), date(1997, 9, 22), date(1997, 10, 2), date(1997, 10, 12)
    ]


def test_rfc_weekly_for_10_occurrences() -> None:
    assert _dates("FREQ=WEEKLY;COUNT=10", RFC_START, date(1998, 1, 1)) == [
        RFC_START + timedelta(weeks=n) for n in range(10)
    ]


def test_rfc_weekly_on_tuesday_and_thursday_for_five_weeks() -> None:
    assert _dates("FREQ=WEEKLY;COUNT=10;BYDAY=TU,TH", RFC_START, date(1998, 1, 1)) == [
        date(1997, 9, d) for d in (2, 4, 9, 11, 16, 18, 23, 25, 30)
    ] + [date(1997, 10, 2)]


def test_rfc_every_other_week_on_monday_wednesday_and_friday() -> None:
    # The RFC's UNTIL=19971224T000000Z ends before 9 AM on December 24; chores keep
    # only dates, so the same list comes from the date before.
    got = _dates("FREQ=WEEKLY;INTERVAL=2;UNTIL=19971223;BYDAY=MO,WE,FR", date(1997, 9, 1), date(1998, 1, 1))
    expected = {9: (1, 3, 5, 15, 17, 19, 29), 10: (1, 3, 13, 15, 17, 27, 29, 31), 11: (10, 12, 14, 24, 26, 28), 12: (8, 10, 12, 22)}
    assert got == [date(1997, month, day) for month, days in expected.items() for day in days]


def test_a_month_without_the_day_is_skipped() -> None:
    assert _dates("FREQ=MONTHLY;BYMONTHDAY=31", date(2026, 1, 31), date(2026, 7, 31)) == [
        date(2026, 1, 31), date(2026, 3, 31), date(2026, 5, 31), date(2026, 7, 31)
    ]


def test_a_rule_that_never_lands_ends_instead_of_looping() -> None:
    assert _dates("FREQ=MONTHLY;INTERVAL=12;BYMONTHDAY=31", date(2026, 4, 1), date(2040, 1, 1)) == []


def test_instances_can_start_part_way_through() -> None:
    rule = parse_rule("FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130")
    assert list(instances(rule, date(2026, 10, 17), date(2026, 12, 31), first=date(2026, 11, 1))) == [
        date(2026, 11, 7), date(2026, 11, 14), date(2026, 11, 21), date(2026, 11, 28)
    ]


def test_last_instance() -> None:
    assert last_instance(parse_rule("FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130"), date(2026, 10, 17)) == date(2026, 11, 28)
    assert last_instance(parse_rule("FREQ=MONTHLY;COUNT=3"), date(2026, 10, 1)) == date(2026, 12, 1)
    assert last_instance(parse_rule("FREQ=DAILY"), date(2026, 10, 1)) is None


def _random_rule(rng: random.Random) -> str:
    freq = rng.choice(("DAILY", "WEEKLY", "MONTHLY"))
    parts = [f"FREQ={freq}"]
    if rng.random() < 0.6:
        parts.append(f"INTERVAL={rng.randint(1, 4)}")
    if freq == "WEEKLY" and rng.random() < 0.7:
        days = rng.sample(("MO", "TU", "WE", "TH", "FR", "SA", "SU"), rng.randint(1, 4))
        parts.append("BYDAY=" + ",".join(days))
    if freq == "MONTHLY" and rng.random() < 0.6:
        parts.append(f"BYMONTHDAY={rng.randint(1, 31)}")
    end = rng.random()
    if end < 0.35:
        parts.append(f"COUNT={rng.randint(1, 40)}")
    elif end < 0.7:
        parts.append(f"UNTIL={date(2026, 1, 1) + timedelta(days=rng.randint(0, 900)):%Y%m%d}")
    return ";".join(parts)


def _dateutil(rule: Rule, start: date, last: date) -> list[date]:
    kwargs: dict = {"dtstart": datetime.combine(start, datetime.min.time()), "interval": rule.interval, "wkst": du.MO}
    if rule.byday:
        kwargs["byweekday"] = rule.byday
    if rule.bymonthday is not None:
        kwargs["bymonthday"] = rule.bymonthday
    if rule.count is not None:
        kwargs["count"] = rule.count
    if rule.until is not None:
        kwargs["until"] = datetime.combine(rule.until, datetime.min.time())
    return [
        moment.date()
        for moment in du.rrule(DU_FREQ[rule.freq], **kwargs).between(
            datetime.combine(start, datetime.min.time()),
            datetime.combine(last, datetime.min.time()),
            inc=True,
        )
    ]


@pytest.mark.parametrize("seed", range(300))
def test_matches_dateutil(seed: int) -> None:
    rng = random.Random(seed)
    text = _random_rule(rng)
    start = date(2025, 6, 1) + timedelta(days=rng.randint(0, 500))
    last = start + timedelta(days=rng.randint(30, 1000))
    rule = parse_rule(text)
    assert list(instances(rule, start, last)) == _dateutil(rule, start, last), text


@pytest.mark.parametrize("seed", range(100))
def test_skipping_ahead_matches_starting_from_the_beginning(seed: int) -> None:
    rng = random.Random(1000 + seed)
    rule = parse_rule(_random_rule(rng))
    start = date(2025, 6, 1) + timedelta(days=rng.randint(0, 300))
    first = start + timedelta(days=rng.randint(0, 400))
    last = first + timedelta(days=rng.randint(0, 120))
    assert list(instances(rule, start, last, first=first)) == [
        day for day in instances(rule, start, last) if day >= first
    ]


CASES = json.loads((Path(__file__).parent / "fixtures" / "recurrence_cases.json").read_text("utf-8"))


@pytest.mark.parametrize("case", CASES["cases"], ids=lambda case: case["name"])
def test_the_shared_table_of_rules(case: dict[str, Any]) -> None:
    """The chore editor's picker reads the same table (test/recurrence.test.ts)."""
    rule = parse_rule(case["rrule"])
    found = list(instances(rule, date.fromisoformat(case["start"]), date(2030, 1, 1)))
    assert [d.isoformat() for d in found] == case["dates"]
