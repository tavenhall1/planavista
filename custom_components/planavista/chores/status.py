"""What an item's status says in words, for to-do descriptions (spec 10.3, 11.4).

It reads an item as the card and the actions see it (`ChoresEngine.item_view`),
so the card's status map and these words are checked against one table:
tests/fixtures/chores_status.json. Nothing here imports Home Assistant.
"""
from __future__ import annotations

from collections.abc import Mapping
from datetime import date
from typing import Any

WEEKDAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
MONTH_NAMES = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


def short_day(day: date, today: date) -> str:
    """"Mon" within a week of today, otherwise "Oct 3"."""
    if abs((day - today).days) <= 6:
        return WEEKDAY_NAMES[day.weekday()]
    return f"{MONTH_NAMES[day.month - 1]} {day.day}"


def _day(value: Any) -> date | None:
    return date.fromisoformat(value) if isinstance(value, str) and value else None


def describe(view: Mapping[str, Any], today: date) -> str | None:
    """The to-do item's description: what the status map would say about it."""
    status = view.get("status")
    if status == "pending":
        return "Waiting for a parent's OK"
    if status == "sent_back":
        return f"Sent back: {view['note']}" if view.get("note") else "Sent back"
    if status == "done":
        return None
    if (since := _day(view.get("overdue_since"))) is not None:
        return f"Overdue since {short_day(since, today)}"
    if (moved := _day(view.get("from"))) is not None:
        return f"From {short_day(moved, today)}"
    if view.get("dated") and (due := _day(view.get("due_day"))) is not None:
        return f"Due {short_day(due, today)}"
    if view.get("section") == "week":
        return "This month" if view.get("window") == "month" else "This week"
    return None
