"""The chore plan's records, their rules, and the stars formula (spec 7.3, 7.5, 8.3).

Records are plain dicts, like household members: a field written by a newer
release is kept as it is when this one saves (spec 7.8). `build_activity`,
`build_settings`, and `build_reward` return a record after a change, checked
against the rules, or raise ChoreError naming the broken rule. Nothing here
imports Home Assistant.
"""
from __future__ import annotations

from collections.abc import Collection, Iterable, Mapping
from datetime import date, timedelta
from fractions import Fraction
import math
from typing import Any

from ..household.members import slug
from .periods import BANDS, WEEKDAY_CODES, parse_clock
from .recurrence import RecurrenceError, instances, parse_rule

SCHEDULES = ("plan", "once", "repeats")
CATEGORIES = ("kitchen", "cleaning", "home", "personal", "school", "work", "family", "sleep", "other")
MISSED_POLICIES = ("make_up", "strict", "carry_over")
AUTO_APPROVE = ("day_end", "never")
SPLITS = ("shared", "each")
PERIODS = ("day", "week")
WINDOWS = ("day", "period")
SOURCES = ("tablet", "phone", "voice", "automation", "notification")

DEFAULT_SETTINGS: dict[str, Any] = {
    "missed": "make_up",
    "day_starts": "03:00",
    "auto_approve": "day_end",
    "minutes_per_star": 15,
    "evening_check": "19:00",
    "sound": False,
}

# Fields a chore save may change. Anything else on a stored chore is kept.
ACTIVITY_FIELDS = (
    "name", "icon", "category", "schedule", "assignees", "on_board", "needs_ok", "needs_ok_always", "stars",
    "label", "minimum", "split", "shares", "days", "time_of_day", "times", "set_time", "once", "repeats",
)
REWARD_FIELDS = ("name", "icon", "cost", "needs_ok", "who")

NAME_MAX_LENGTH = 60
LABEL_MAX_LENGTH = 30
ICON_MAX_LENGTH = 40
MAX_TIMES = 12
MAX_SESSIONS = 20
MAX_ESTIMATE_MINUTES = 24 * 60
MAX_HOURS = 168
MAX_STARS = 100
MAX_ACTIVITIES = 300
MAX_REWARDS = 100
MAX_COST = 10_000
# A repeating chore must land at least once this soon after it starts.
FIRST_INSTANCE_WITHIN = timedelta(days=5 * 366)


class ChoreError(ValueError):
    """A change that breaks a chore rule. `code` names the rule; `detail` says more."""

    def __init__(self, code: str, detail: str | None = None) -> None:
        """Remember which rule was broken."""
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


def round_half_up(value: Fraction) -> int:
    """Round to the nearest whole number, halves up (2.5 is 3)."""
    return math.floor(value + Fraction(1, 2))


def stars_for(credit_minutes: float, minutes_per_star: int, override: int | None = None) -> int:
    """Stars per check-off (spec 8.3): the chore's own number, else 1 per `minutes_per_star`, at least 1."""
    if override is not None:
        return int(override)
    return max(1, round_half_up(Fraction(str(credit_minutes)) / int(minutes_per_star)))


def make_id(name: str, taken: Iterable[str]) -> str:
    """A new id made from the name, with _2, _3, ... on a collision (spec 7.6)."""
    used = set(taken)
    base = slug(name)
    if base not in used:
        return base
    number = 2
    while f"{base}_{number}" in used:
        number += 1
    return f"{base}_{number}"


def _date(value: object, code: str) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        raise ChoreError(code) from None


def _whole(value: object, code: str, low: int, high: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise ChoreError(code)
    return value


def _hours(value: object, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 < value <= MAX_HOURS:
        raise ChoreError(code)
    return float(value)


def _name(value: object) -> str:
    name = value.strip() if isinstance(value, str) else ""
    if not name:
        raise ChoreError("name_required")
    if len(name) > NAME_MAX_LENGTH:
        raise ChoreError("name_too_long")
    return name


def _icon(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or not 0 < len(value.strip()) <= ICON_MAX_LENGTH:
        raise ChoreError("invalid_icon")
    return value.strip()


def _codes(value: object, allowed: tuple[str, ...], code: str) -> list[str]:
    if not isinstance(value, list) or any(v not in allowed for v in value) or len(set(value)) != len(value):
        raise ChoreError(code)
    return sorted(value, key=allowed.index)


def _plan_fields(activity: dict[str, Any]) -> None:
    minimum = activity.get("minimum")
    if not isinstance(minimum, Mapping) or minimum.get("per") not in PERIODS:
        raise ChoreError("invalid_minimum")
    activity["minimum"] = {**minimum, "hours": _hours(minimum.get("hours"), "invalid_minimum")}
    activity.setdefault("split", "each")
    if activity["split"] not in SPLITS:
        raise ChoreError("invalid_split")
    if activity["split"] == "shared":
        shares = activity.get("shares")
        if not isinstance(shares, Mapping) or set(shares) != set(activity["assignees"]):
            raise ChoreError("shares_mismatch")
        hours = {member: _hours(value, "shares_mismatch") for member, value in shares.items()}
        if abs(sum(hours.values()) - activity["minimum"]["hours"]) > 0.01:
            raise ChoreError("shares_mismatch")
        activity["shares"] = hours
    else:
        activity["shares"] = None
    activity["days"] = _codes(activity.get("days", []), WEEKDAY_CODES, "invalid_days")
    activity["time_of_day"] = _codes(activity.get("time_of_day", []), BANDS, "invalid_bands")
    activity["times"] = _whole(activity.get("times", 1), "invalid_times", 1, MAX_TIMES)
    set_time = activity.get("set_time")
    if set_time is not None and parse_clock(set_time) is None:
        raise ChoreError("invalid_set_time")
    activity["set_time"] = set_time


def _once_fields(activity: dict[str, Any]) -> None:
    once = activity.get("once")
    if not isinstance(once, Mapping):
        raise ChoreError("invalid_once")
    on = _date(once.get("on"), "invalid_once")
    by = _date(once.get("by"), "invalid_once")
    by_time = once.get("by_time")
    if on is not None and by is not None:
        raise ChoreError("invalid_once", "Pick a day or a date to finish by, not both.")
    if by_time is not None and (by is None or parse_clock(by_time) is None):
        raise ChoreError("invalid_once", "A time to finish by needs a date.")
    activity["once"] = {
        **once,
        "on": on.isoformat() if on else None,
        "by": by.isoformat() if by else None,
        "by_time": by_time,
        "sessions": _whole(once.get("sessions", 1), "invalid_sessions", 1, MAX_SESSIONS),
        "estimate_minutes": _whole(once.get("estimate_minutes", 15), "invalid_estimate", 1, MAX_ESTIMATE_MINUTES),
    }


def _repeats_fields(activity: dict[str, Any]) -> None:
    repeats = activity.get("repeats")
    if not isinstance(repeats, Mapping):
        raise ChoreError("invalid_repeats", "Add how it repeats.")
    try:
        rule = parse_rule(repeats.get("rrule"))
    except RecurrenceError as err:
        raise ChoreError("invalid_repeats", str(err)) from None
    start = _date(repeats.get("start"), "invalid_repeats")
    if start is None:
        raise ChoreError("invalid_repeats", "Add the day it starts.")
    window = repeats.get("window", "day")
    if window not in WINDOWS:
        raise ChoreError("invalid_repeats", "Each time is on its day or any time that week or month.")
    if window == "period" and rule.freq == "DAILY":
        raise ChoreError("invalid_repeats", "A daily chore is done on its day.")
    if next(instances(rule, start, start + FIRST_INSTANCE_WITHIN), None) is None:
        raise ChoreError("invalid_repeats", "This rule never repeats. Pick another day.")
    activity["repeats"] = {
        **repeats,
        "rrule": str(rule),
        "start": start.isoformat(),
        "window": window,
        "estimate_minutes": _whole(
            repeats.get("estimate_minutes", 15), "invalid_estimate", 1, MAX_ESTIMATE_MINUTES
        ),
    }


def build_activity(
    existing: Mapping[str, Any] | None,
    changes: Mapping[str, Any],
    member_ids: Collection[str],
) -> dict[str, Any]:
    """The chore after `changes`, checked against the rules (spec 7.3, 15.5).

    `existing` is the stored chore, or None for a new one. Stored fields this
    version doesn't edit are kept (planner fields, import_ref, created).
    """
    activity: dict[str, Any] = dict(existing) if existing else {}
    for key in ACTIVITY_FIELDS:
        if key in changes:
            activity[key] = changes[key]
    activity["name"] = _name(activity.get("name"))
    activity["icon"] = _icon(activity.get("icon"))
    activity.setdefault("category", "other")
    if activity["category"] not in CATEGORIES:
        raise ChoreError("invalid_category")
    if activity.get("schedule") not in SCHEDULES:
        raise ChoreError("invalid_schedule")
    assignees = activity.get("assignees", [])
    if not isinstance(assignees, list) or len(set(assignees)) != len(assignees):
        raise ChoreError("invalid_assignees")
    if any(member not in member_ids for member in assignees):
        raise ChoreError("unknown_member")
    activity["assignees"] = list(assignees)
    for flag, default in (("on_board", True), ("needs_ok", False)):
        activity.setdefault(flag, default)
        if not isinstance(activity[flag], bool):
            raise ChoreError(f"invalid_{flag}")
    # Added by someone who isn't a parent: every check-off waits for a parent (spec 10.3).
    if not isinstance(activity.get("needs_ok_always", False), bool):
        raise ChoreError("invalid_needs_ok")
    if activity.get("stars") is not None:
        activity["stars"] = _whole(activity["stars"], "invalid_stars", 0, MAX_STARS)
    else:
        activity["stars"] = None
    label = activity.get("label")
    if label is not None and (not isinstance(label, str) or len(label.strip()) > LABEL_MAX_LENGTH):
        raise ChoreError("invalid_label")
    activity["label"] = label.strip() or None if isinstance(label, str) else None
    {"plan": _plan_fields, "once": _once_fields, "repeats": _repeats_fields}[activity["schedule"]](activity)
    activity.setdefault("finished_at", None)
    return activity


def on_board(activity: Mapping[str, Any]) -> bool:
    """Whether a chore produces check-offs: on the board, with someone assigned (spec 7.3)."""
    if not activity.get("on_board", True) or not activity.get("assignees"):
        return False
    if activity.get("schedule") == "plan" and activity.get("set_time"):
        return False
    return not activity.get("finished_at")


def build_settings(existing: Mapping[str, Any], changes: Mapping[str, Any]) -> dict[str, Any]:
    """Rules and Reminders after `changes` (spec 7.3, 14.5)."""
    settings = {**DEFAULT_SETTINGS, **existing}
    for key in DEFAULT_SETTINGS:
        if key in changes:
            settings[key] = changes[key]
    if settings["missed"] not in MISSED_POLICIES:
        raise ChoreError("invalid_missed")
    day_starts = parse_clock(settings["day_starts"])
    if day_starts is None or day_starts.hour > 6 or (day_starts.hour == 6 and day_starts.minute):
        raise ChoreError("invalid_day_starts")
    if settings["auto_approve"] not in AUTO_APPROVE:
        raise ChoreError("invalid_auto_approve")
    settings["minutes_per_star"] = _whole(settings["minutes_per_star"], "invalid_minutes_per_star", 1, 240)
    if settings["evening_check"] is not None and parse_clock(settings["evening_check"]) is None:
        raise ChoreError("invalid_evening_check")
    if not isinstance(settings["sound"], bool):
        raise ChoreError("invalid_sound")
    return settings


def build_reward(
    existing: Mapping[str, Any] | None,
    changes: Mapping[str, Any],
    member_ids: Collection[str],
) -> dict[str, Any]:
    """A reward after `changes` (spec 7.5, 8.15). An empty `who` means everyone who earns stars."""
    reward: dict[str, Any] = dict(existing) if existing else {}
    for key in REWARD_FIELDS:
        if key in changes:
            reward[key] = changes[key]
    reward["name"] = _name(reward.get("name"))
    reward["icon"] = _icon(reward.get("icon"))
    reward["cost"] = _whole(reward.get("cost"), "invalid_cost", 1, MAX_COST)
    reward.setdefault("needs_ok", True)
    if not isinstance(reward["needs_ok"], bool):
        raise ChoreError("invalid_needs_ok")
    who = reward.get("who", [])
    if not isinstance(who, list) or len(set(who)) != len(who):
        raise ChoreError("invalid_who")
    if any(member not in member_ids for member in who):
        raise ChoreError("unknown_member")
    reward["who"] = list(who)
    return reward


def default_plan() -> dict[str, Any]:
    """A plan with the default rules and no chores yet."""
    return {"settings": dict(DEFAULT_SETTINGS), "activities": []}


def default_log() -> dict[str, Any]:
    """A log with nothing done yet."""
    return {
        "last_day": None,
        "last_boundary": None,
        "active_from": None,
        "weeks": None,
        "policy": None,
        "completions": [],
        "overrides": [],
        "requests": [],
        "carried": [],
        "summaries": [],
        "totals": {},
    }


def default_rewards() -> dict[str, Any]:
    """No rewards, no stars."""
    return {"rewards": [], "ledger": [], "redemptions": [], "surprises": {}}
