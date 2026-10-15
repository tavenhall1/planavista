"""The screensaver (milestone 11): the household's setting for its shared screens.

When nobody has touched a shared screen for a while, the card shows a living
sky with the time and today. Each shared account may name a Home Assistant
entity that dims or turns off its screen, and one that senses motion in front
of it. These rules are pure; the WebSocket layer works out the facts.
"""
from __future__ import annotations

from collections.abc import Mapping
import re
from typing import Any

AFTER_CHOICES = (2, 5, 10, 15, 30)
SCREEN_DOMAINS = ("light", "switch", "input_boolean", "number", "input_number")
MOTION_DOMAINS = ("binary_sensor", "input_boolean")

_CLOCK = re.compile(r"([01]\d|2[0-3]):[0-5]\d")
_ENTITY = re.compile(r"[a-z_]+\.[a-z0-9_]+")


def default_screensaver() -> dict[str, Any]:
    """Off; on after 5 minutes; night from Sleep times; no screen's entities picked."""
    return {"enabled": False, "after_minutes": 5, "night": None, "screens": {}}


def _night(value: object) -> dict[str, str] | None:
    if not isinstance(value, Mapping):
        return None
    start, end = value.get("from"), value.get("to")
    if isinstance(start, str) and isinstance(end, str) and _CLOCK.fullmatch(start) and _CLOCK.fullmatch(end):
        return {"from": start, "to": end}
    return None


def _entity(value: object, domains: tuple[str, ...]) -> str | None:
    if isinstance(value, str) and _ENTITY.fullmatch(value) and value.split(".", 1)[0] in domains:
        return value
    return None


def _screen(value: Mapping[str, Any]) -> dict[str, Any]:
    entry = dict(value)
    entry["name"] = entry["name"] if isinstance(entry.get("name"), str) else None
    entry["screen"] = _entity(entry.get("screen"), SCREEN_DOMAINS)
    entry["motion"] = _entity(entry.get("motion"), MOTION_DOMAINS)
    return entry


def normalize_screensaver(value: object) -> dict[str, Any]:
    """The stored setting with missing or unknown values reset. Unknown fields are kept."""
    saver: dict[str, Any] = dict(value) if isinstance(value, Mapping) else {}
    if not isinstance(saver.get("enabled"), bool):
        saver["enabled"] = False
    if saver.get("after_minutes") not in AFTER_CHOICES or isinstance(saver.get("after_minutes"), bool):
        saver["after_minutes"] = 5
    saver["night"] = _night(saver.get("night"))
    screens = saver.get("screens")
    saver["screens"] = (
        {user: _screen(entry) for user, entry in screens.items() if isinstance(user, str) and isinstance(entry, Mapping)}
        if isinstance(screens, Mapping)
        else {}
    )
    return saver


def entity_refusal(entity_id: object, domains: tuple[str, ...]) -> str | None:
    """Why an entity can't be this screen's Screen or Motion, or None (none picked is fine)."""
    if entity_id is None:
        return None
    return None if _entity(entity_id, domains) else "invalid_entity"


def follow_shared(saver: dict[str, Any], shared_users: list[str], names: Mapping[str, str | None]) -> None:
    """Keep one entry per shared account: new ones get their name, unmarked ones go (spec 3.1).

    With no shared screen left, the screensaver turns off, since it only runs on one.
    """
    screens = saver["screens"]
    for user in list(screens):
        if user not in shared_users:
            del screens[user]
    for user in shared_users:
        entry = screens.setdefault(user, {"name": None, "screen": None, "motion": None})
        if names.get(user):
            entry["name"] = names[user]
    if not shared_users:
        saver["enabled"] = False


def screensaver_view(saver: Mapping[str, Any], shared_users: list[str]) -> dict[str, Any]:
    """What the card sees: the setting, and each shared account's entities in the order they were marked."""
    screens = saver.get("screens") or {}
    return {
        "enabled": saver["enabled"],
        "after_minutes": saver["after_minutes"],
        "night": saver["night"],
        "screens": [
            {"user_id": user, "name": (screens.get(user) or {}).get("name"),
             "screen": (screens.get(user) or {}).get("screen"), "motion": (screens.get(user) or {}).get("motion")}
            for user in shared_users
        ],
    }


def screensaver_diagnostics(saver: Mapping[str, Any]) -> dict[str, Any]:
    """The setting without account ids, names, or entity ids: only which kinds of entity are picked."""
    def domain(entity_id: object) -> str | None:
        return entity_id.split(".", 1)[0] if isinstance(entity_id, str) else None

    return {
        "enabled": saver["enabled"],
        "after_minutes": saver["after_minutes"],
        "night": saver["night"],
        "screens": [
            {"screen": domain(entry.get("screen")), "motion": domain(entry.get("motion"))}
            for entry in (saver.get("screens") or {}).values()
        ],
    }
