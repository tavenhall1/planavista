"""Chore days, weeks, and bands, including days around daylight saving changes (spec 8.1)."""
from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.planavista.chores.periods import Clock, WeekRule, parse_clock

TZ = ZoneInfo("America/Chicago")
CLOCK = Clock(TZ)


def at(month: int, day: int, hour: int, minute: int) -> datetime:
    """A local time in 2026, in the sample household's time zone."""
    return datetime(2026, month, day, hour, minute, tzinfo=TZ)


def test_a_chore_day_runs_from_3_am_to_3_am() -> None:
    assert CLOCK.day_start(date(2026, 10, 13)) == at(10, 13, 3, 0)
    assert CLOCK.day_end(date(2026, 10, 13)) == at(10, 14, 3, 0)
    assert CLOCK.chore_date(at(10, 14, 2, 59)) == date(2026, 10, 13)
    assert CLOCK.chore_date(at(10, 14, 3, 0)) == date(2026, 10, 14)
    assert CLOCK.due_day(at(10, 14, 3, 0)) == date(2026, 10, 13)


def test_days_around_daylight_saving_changes_are_23_and_25_hours() -> None:
    def length(day: date) -> timedelta:
        return CLOCK.day_end(day).astimezone(UTC) - CLOCK.day_start(day).astimezone(UTC)

    spring, autumn = length(date(2026, 3, 7)), length(date(2026, 10, 31))
    assert spring == timedelta(hours=23)
    assert autumn == timedelta(hours=25)
    # Both boundaries are 3:00 AM on the wall clock.
    assert CLOCK.day_end(date(2026, 10, 31)).astimezone(TZ).hour == 3
    assert CLOCK.day_end(date(2026, 3, 7)).astimezone(TZ).hour == 3


def test_an_instant_in_another_zone_lands_on_the_local_chore_day() -> None:
    utc = datetime(2026, 10, 14, 7, 30, tzinfo=ZoneInfo("UTC"))  # 2:30 AM in Chicago
    assert CLOCK.chore_date(utc) == date(2026, 10, 13)


def test_a_day_start_in_a_skipped_hour_still_has_one_boundary() -> None:
    clock = Clock(TZ, time(2, 30))
    start = clock.day_start(date(2026, 3, 8))  # 2:30 AM doesn't exist that night
    assert clock.chore_date(start) == date(2026, 3, 8)
    assert clock.chore_date(start - timedelta(minutes=1)) == date(2026, 3, 7)


@pytest.mark.parametrize(
    ("moment", "band"),
    [((10, 13, 3, 0), "morning"), ((10, 13, 11, 59), "morning"), ((10, 13, 12, 0), "afternoon"),
     ((10, 13, 16, 59), "afternoon"), ((10, 13, 17, 0), "evening"), ((10, 14, 1, 30), "evening")],
)
def test_bands(moment: tuple[int, int, int, int], band: str) -> None:
    assert CLOCK.band(at(*moment)) == band


def test_weeks_start_on_the_first_day_setting() -> None:
    assert CLOCK.week_start(date(2026, 10, 13)) == date(2026, 10, 12)
    assert CLOCK.week_end(date(2026, 10, 13)) == date(2026, 10, 19)
    sunday = Clock(TZ, weeks=WeekRule("sunday"))
    assert sunday.week_start(date(2026, 10, 13)) == date(2026, 10, 11)


def test_changing_the_first_day_waits_for_the_next_week_boundary() -> None:
    rule = WeekRule("monday").changed_to("sunday", date(2026, 10, 13))
    assert rule == WeekRule("sunday", before="monday", since=date(2026, 10, 19))
    # This week isn't split.
    assert (rule.start(date(2026, 10, 16)), rule.end(date(2026, 10, 16))) == (date(2026, 10, 12), date(2026, 10, 19))
    # The first week under Sunday starts at the old boundary and ends at the first Sunday.
    assert (rule.start(date(2026, 10, 20)), rule.end(date(2026, 10, 20))) == (date(2026, 10, 19), date(2026, 10, 25))
    assert (rule.start(date(2026, 10, 27)), rule.end(date(2026, 10, 27))) == (date(2026, 10, 25), date(2026, 11, 1))


def test_changing_back_before_it_takes_effect_cancels_the_change() -> None:
    pending = WeekRule("monday").changed_to("sunday", date(2026, 10, 13))
    assert pending.changed_to("monday", date(2026, 10, 14)) == WeekRule("monday")
    assert WeekRule("monday").changed_to("monday", date(2026, 10, 14)) == WeekRule("monday")


def test_a_second_change_of_the_first_day_keeps_the_weeks_already_lived() -> None:
    """Round 15 (r15a I2): the second change re-read every earlier week by the newer rule."""
    rule = WeekRule("monday").changed_to("sunday", date(2026, 10, 21)).changed_to("monday", date(2026, 10, 28))
    assert rule.start(date(2026, 10, 25)) == date(2026, 10, 19)  # still the Monday week
    assert rule.start(date(2026, 10, 27)) == date(2026, 10, 26)  # the short Sunday week
    assert rule.end(date(2026, 10, 27)) == date(2026, 11, 1)
    assert rule.start(date(2026, 11, 3)) == date(2026, 11, 2)  # Mondays again
    assert WeekRule.from_dict(rule.as_dict()) == rule


def test_a_week_rule_survives_the_log() -> None:
    rule = WeekRule("sunday", before="monday", since=date(2026, 10, 19))
    assert WeekRule.from_dict(rule.as_dict()) == rule
    assert WeekRule.from_dict({"first_day": "tuesday"}) == WeekRule()
    assert WeekRule.from_dict(None) == WeekRule()


def test_month_bounds() -> None:
    assert Clock.month_start(date(2026, 10, 13)) == date(2026, 10, 1)
    assert Clock.month_end(date(2026, 12, 31)) == date(2027, 1, 1)


def test_clock_times() -> None:
    assert parse_clock("03:00") == time(3, 0)
    assert parse_clock("3:00") is None
    assert parse_clock("24:00") is None
    assert parse_clock(None) is None
