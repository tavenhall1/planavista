"""The sample household's chores (spec section 4), shared by the chores tests.

The scene is Tuesday, October 13, 2026, at 4:10 PM in America/Chicago, with
weeks starting on Monday.
"""
from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
import itertools
from typing import Any
from zoneinfo import ZoneInfo

from custom_components.planavista.chores.engine import ChoresEngine
from custom_components.planavista.chores.model import (
    build_activity,
    default_log,
    default_plan,
    default_rewards,
)

TZ = ZoneInfo("America/Chicago")
# The household has used chores, and these chores, since June.
IN_USE_SINCE = "2026-06-01"
CREATED = "2026-06-01T19:05:00-05:00"


def at(month: int, day: int, hour: int = 16, minute: int = 10, *, year: int = 2026) -> datetime:
    """A local time in the sample household's time zone."""
    return datetime(year, month, day, hour, minute, tzinfo=TZ)


SCENE = at(10, 13)

MEMBERS: list[dict[str, Any]] = [
    {"id": "alex", "name": "Alex", "parent": True, "age_group": "adult", "needs_ok_for": "none", "stars": False, "order": 0},
    {"id": "blair", "name": "Blair", "parent": True, "age_group": "adult", "needs_ok_for": "none", "stars": False, "order": 1},
    {"id": "casey", "name": "Casey", "parent": False, "age_group": "teen", "needs_ok_for": "marked", "stars": True, "order": 2},
    {"id": "dana", "name": "Dana", "parent": False, "age_group": "young_child", "needs_ok_for": "all", "stars": True, "order": 3},
]


def plan(
    chore_id: str, name: str, assignees: list[str], hours: float, per: str, **fields: Any
) -> dict[str, Any]:
    """A Plan chore."""
    return {"id": chore_id, "name": name, "schedule": "plan", "assignees": assignees,
            "minimum": {"hours": hours, "per": per}, **fields}


def once(chore_id: str, name: str, assignees: list[str], **fields: Any) -> dict[str, Any]:
    """A Once chore; `fields` go into `once` unless they are chore fields."""
    chore = {k: fields.pop(k) for k in ("needs_ok", "stars", "icon") if k in fields}
    return {"id": chore_id, "name": name, "schedule": "once", "assignees": assignees, "once": fields, **chore}


def repeats(
    chore_id: str, name: str, assignees: list[str], rrule: str, start: str, window: str, minutes: int, **fields: Any
) -> dict[str, Any]:
    """A Repeats chore."""
    return {"id": chore_id, "name": name, "schedule": "repeats", "assignees": assignees,
            "repeats": {"rrule": rrule, "start": start, "window": window, "estimate_minutes": minutes}, **fields}


def sample_activities() -> list[dict[str, Any]]:
    """The sample chores, in plan order."""
    return [
        plan("kitchen_cleanup", "Kitchen cleanup", ["alex"], 0.5, "day", time_of_day=["evening"], category="kitchen"),
        plan("cat_care", "Cat care", ["casey"], 0.5, "day", time_of_day=["morning", "evening"], times=2),
        plan("make_your_bed", "Make your bed", ["dana"], 5 / 60, "day", time_of_day=["morning"], category="personal"),
        plan("feed_the_fish", "Feed the fish", ["dana"], 5 / 60, "day", time_of_day=["afternoon"]),
        plan("set_the_table", "Set the table", ["dana"], 10 / 60, "day", time_of_day=["evening"], category="kitchen"),
        plan("tidy_toys", "Tidy toys", ["dana"], 0.25, "day", needs_ok=True),
        plan("laundry", "Laundry", ["blair"], 2, "week", days=["mon", "thu"], label="2 loads"),
        plan("clean_the_bathroom", "Clean the bathroom", ["blair", "casey"], 2, "week",
             split="shared", shares={"blair": 1, "casey": 1}, needs_ok=True, category="cleaning"),
        plan("take_out_the_trash", "Take out the trash", ["casey"], 0.5, "week",
             days=["tue", "fri"], time_of_day=["evening"]),
        plan("yard_work", "Yard work", ["casey"], 1, "week"),
        plan("groceries", "Groceries", ["alex"], 1.5, "week", days=["sat"]),
        plan("finance_and_budget", "Finance and budget", ["alex"], 1, "week", category="work"),
        repeats("change_the_furnace_filter", "Change the furnace filter", ["alex"],
                "FREQ=MONTHLY;BYMONTHDAY=1", "2026-10-01", "period", 15),
        repeats("rake_the_leaves", "Rake the leaves", ["casey"],
                "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", "2026-10-17", "day", 60),
        once("fix_the_gate_latch", "Fix the gate latch", ["alex"], by="2026-10-16", estimate_minutes=30),
        once("clean_out_the_garage", "Clean out the garage", ["casey"], by="2026-10-18",
             sessions=2, estimate_minutes=240, needs_ok=True),
    ]


def built(raw: dict[str, Any], members: list[dict[str, Any]] = MEMBERS) -> dict[str, Any]:
    """A raw chore checked by the model, as the plan stores it."""
    activity = build_activity(None, raw, {m["id"] for m in members})
    activity.update(id=raw["id"], rev=1, created={"by": "alex", "source": "tablet", "at": CREATED})
    return activity


def counter_ids() -> Callable[[], str]:
    """Ids id0001, id0002, ... so records are easy to read in a failing test."""
    numbers = itertools.count(1)
    return lambda: f"id{next(numbers):04d}"


def sample_engine(
    now: datetime = SCENE,
    *,
    activities: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
    settings: dict[str, Any] | None = None,
    in_use_since: str | None = IN_USE_SINCE,
) -> ChoresEngine:
    """An engine with the sample household and chores, started on the morning of `now`'s chore day.

    Chores count from `in_use_since`; None means they were turned on just now.
    """
    members = [dict(m) for m in (members or MEMBERS)]
    document = default_plan()
    document["settings"].update(settings or {})
    document["activities"] = [built(a, members) for a in (sample_activities() if activities is None else activities)]
    engine = ChoresEngine(document, default_log(), default_rewards(), members, tz=TZ, new_id=counter_ids())
    engine.set_first_day("monday", now)
    engine.start(now)
    if in_use_since is not None:
        engine.log["active_from"] = in_use_since
    return engine


def keys(engine: ChoresEngine, member: str, now: datetime, section: str | None = None) -> list[str]:
    """A member's occurrence keys on `now`'s chore day, optionally in one section."""
    return [i.occ.key for i in engine.items(now).get(member, []) if section is None or i.section == section]
