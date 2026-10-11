"""The chores Store files: the plan, the log, and rewards (spec sections 7.1 and 7.8).

Each starts at version 1, minor version 1. Loading keeps every field it
doesn't know and drops only records too damaged to use. Home Assistant moves
a damaged file aside and returns nothing, and a file from a newer major
version raises UnsupportedStorageVersionError; the runtime decides what each
means for the household.
"""
from __future__ import annotations

from collections.abc import Mapping
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import DOMAIN
from .model import DEFAULT_SETTINGS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_MINOR_VERSION = 1
STORE_KEYS = {
    "plan": f"{DOMAIN}.chores_plan",
    "log": f"{DOMAIN}.chores_log",
    "rewards": f"{DOMAIN}.chores_rewards",
}

# Records missing any of these are too damaged to use and are dropped on load.
_REQUIRED: dict[str, tuple[str, ...]] = {
    "completions": ("id", "occurrence", "chore", "member", "done_by", "at", "state", "credit_minutes", "stars"),
    "overrides": ("occurrence", "at"),
    "requests": ("id", "kind", "occurrence", "chore", "member", "state", "at"),
    "carried": ("key", "chore", "owner", "member", "period", "n", "credit_minutes", "stars", "since"),
    "summaries": ("member", "period"),
    "rewards": ("id", "name", "cost"),
    "ledger": ("member", "delta"),
    "redemptions": ("id", "member", "reward", "cost", "state", "at"),
}


class ChoresStore(Store[dict[str, Any]]):
    """A Store that remembers whether its last write failed.

    Home Assistant logs a failed write (a full disk, say) and carries on; the
    runtime turns this flag into a repair issue and a "Couldn't save".
    """

    write_failed = False

    async def _async_write_data(self, data: dict) -> None:
        try:
            await super()._async_write_data(data)
        except Exception:
            self.write_failed = True
            raise
        self.write_failed = False


def _records(value: object, name: str) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    required = _REQUIRED[name]
    return [dict(r) for r in value if isinstance(r, Mapping) and all(k in r for k in required)]


def normalize_plan(data: object) -> dict[str, Any]:
    """The stored plan with missing parts filled in. Nothing unknown is dropped."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    settings = doc.get("settings")
    doc["settings"] = {**DEFAULT_SETTINGS, **(dict(settings) if isinstance(settings, Mapping) else {})}
    activities = doc.get("activities")
    doc["activities"] = (
        [
            dict(a) for a in activities
            if isinstance(a, Mapping) and isinstance(a.get("id"), str) and isinstance(a.get("name"), str)
            and a.get("schedule") in ("plan", "once", "repeats")
        ]
        if isinstance(activities, list)
        else []
    )
    return doc


def normalize_log(data: object) -> dict[str, Any]:
    """The stored log with missing parts filled in."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    for name in ("completions", "overrides", "requests", "carried", "summaries"):
        doc[name] = _records(doc.get(name), name)
    if not isinstance(doc.get("totals"), Mapping):
        doc["totals"] = {}
    for name in ("last_day", "last_boundary", "active_from"):
        if not isinstance(doc.get(name), str):
            doc[name] = None
    for name in ("weeks", "policy"):
        if not isinstance(doc.get(name), Mapping):
            doc[name] = None
    return doc


def normalize_rewards(data: object) -> dict[str, Any]:
    """The stored rewards with missing parts filled in."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    for name in ("rewards", "ledger", "redemptions"):
        doc[name] = _records(doc.get(name), name)
    return doc


NORMALIZERS = {"plan": normalize_plan, "log": normalize_log, "rewards": normalize_rewards}


class ChoresStores:
    """The three chores Store files."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Make the Stores; nothing is read yet."""
        self.files: dict[str, ChoresStore] = {
            name: ChoresStore(
                hass,
                STORAGE_VERSION,
                key,
                minor_version=STORAGE_MINOR_VERSION,
                private=True,
                atomic_writes=True,
            )
            for name, key in STORE_KEYS.items()
        }

    async def async_load(self) -> dict[str, Any | None]:
        """Each file's data, or None for a file that is missing or was moved aside.

        UnsupportedStorageVersionError (a newer major version) propagates.
        """
        return {name: await store.async_load() for name, store in self.files.items()}

    async def async_save(self, name: str, data: dict[str, Any]) -> bool:
        """Write one file now; False when the write failed."""
        store = self.files[name]
        await store.async_save(data)
        return not store.write_failed

    @property
    def write_failed(self) -> bool:
        """Whether any file's last write failed."""
        return any(store.write_failed for store in self.files.values())
