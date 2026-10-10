"""The household Store, the loaded household, and keeping calendars linked."""
from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping
import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError, UnsupportedStorageVersionError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.storage import Store
from homeassistant.util.hass_dict import HassKey

from ..const import CONF_CALENDARS, CONF_ONBOARDING_COMPLETE, DOMAIN
from ..coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .members import clear_missing_persons, link_calendars
from .security import SessionManager

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = f"{DOMAIN}.household"
STORAGE_VERSION = 1
STORAGE_MINOR_VERSION = 1
ISSUE_NEWER_VERSION = "household_newer_version"
MIGRATION_PEOPLE = "people_from_calendars"


def default_document() -> dict[str, Any]:
    """A household with nobody in it yet."""
    return {
        "members": [],
        "security": {"pins": {}, "shared_users": [], "shuffle_keypad": False},
        "modules": {},
        "setup": {"completed": False, "step": None},
        "migrations": {},
    }


def normalize(data: object) -> dict[str, Any]:
    """The stored document with missing parts filled in. Nothing unknown is dropped."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    members = doc.get("members")
    doc["members"] = (
        [dict(m) for m in members if isinstance(m, Mapping) and isinstance(m.get("id"), str)]
        if isinstance(members, list)
        else []
    )
    security = dict(doc["security"]) if isinstance(doc.get("security"), Mapping) else {}
    if not isinstance(security.get("pins"), Mapping):
        security["pins"] = {}
    if not isinstance(security.get("shared_users"), list):
        security["shared_users"] = []
    if not isinstance(security.get("shuffle_keypad"), bool):
        security["shuffle_keypad"] = False
    doc["security"] = security
    setup = dict(doc["setup"]) if isinstance(doc.get("setup"), Mapping) else {}
    if not isinstance(setup.get("completed"), bool):
        setup["completed"] = False
    if not isinstance(setup.get("step"), str):
        setup["step"] = None
    doc["setup"] = setup
    for key in ("modules", "migrations"):
        if not isinstance(doc.get(key), Mapping):
            doc[key] = {}
    return doc


class Household:
    """The household document, plus what lives only in memory: sessions and listeners."""

    def __init__(self, store: Store[dict[str, Any]] | None, data: dict[str, Any]) -> None:
        """Wrap a loaded document; no store means a newer version wrote it."""
        self._store = store
        self.data = data
        self.sessions = SessionManager()
        self._listeners: list[Callable[[], None]] = []
        self._pin_locks: dict[str, asyncio.Lock] = {}

    @property
    def available(self) -> bool:
        """False when the file came from a newer PlanaVista and must not be changed."""
        return self._store is not None

    @property
    def members(self) -> list[dict[str, Any]]:
        """Everyone, in stored order (sort with members.ordered for board order)."""
        return self.data["members"]

    @members.setter
    def members(self, value: list[dict[str, Any]]) -> None:
        self.data["members"] = value

    def member(self, member_id: str) -> dict[str, Any] | None:
        """The member with this id, if there is one."""
        return next((m for m in self.members if m["id"] == member_id), None)

    @property
    def pins(self) -> dict[str, dict[str, Any]]:
        """PIN records by member id."""
        return self.data["security"]["pins"]

    @property
    def shared_users(self) -> list[str]:
        """Home Assistant user ids marked as shared family screens."""
        return self.data["security"]["shared_users"]

    def pin_lock(self, member_id: str) -> asyncio.Lock:
        """One PIN check at a time per member, so parallel tries can't skip a pause."""
        return self._pin_locks.setdefault(member_id, asyncio.Lock())

    async def async_save(self) -> None:
        """Save now (people and PINs change rarely) and tell every subscriber."""
        if self._store is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN, translation_key="household_unavailable"
            )
        await self._store.async_save(self.data)
        self.async_notify()

    @callback
    def async_listen(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Call `listener` after every change; returns a function that stops it."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    @callback
    def async_notify(self) -> None:
        """Tell every subscriber that something changed."""
        for listener in list(self._listeners):
            listener()


DATA_HOUSEHOLD: HassKey[Household] = HassKey(f"{DOMAIN}_household")


async def async_get_household(hass: HomeAssistant) -> Household:
    """The household, loaded once per Home Assistant run."""
    if (household := hass.data.get(DATA_HOUSEHOLD)) is not None:
        return household
    store: Store[dict[str, Any]] = Store(
        hass,
        STORAGE_VERSION,
        STORAGE_KEY,
        minor_version=STORAGE_MINOR_VERSION,
        private=True,
        atomic_writes=True,
    )
    try:
        data = await store.async_load()
    except UnsupportedStorageVersionError:
        _LOGGER.error(
            "The household file was saved by a newer version of PlanaVista; "
            "update PlanaVista to change people and PINs"
        )
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_NEWER_VERSION,
            is_fixable=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key=ISSUE_NEWER_VERSION,
        )
        household = Household(None, default_document())
    else:
        household = Household(store, normalize(data))
    hass.data[DATA_HOUSEHOLD] = household
    return household


async def async_person_info(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """Home Assistant people by entity id: name, linked user, and whether that user is an admin."""
    admins = {user.id for user in await hass.auth.async_get_users() if user.is_admin}
    return {
        state.entity_id: {
            "name": state.name,
            "user_id": state.attributes.get("user_id"),
            "admin": state.attributes.get("user_id") in admins,
        }
        for state in hass.states.async_all("person")
    }


async def async_link_calendars(
    hass: HomeAssistant,
    household: Household,
    entry: PlanaVistaConfigEntry,
    *,
    create_people: bool,
) -> None:
    """Give calendars their members and save whatever changed.

    With `create_people`, people linked to calendars who aren't members yet
    become members (the one-time migration). Otherwise calendars only join
    people who already are.
    """
    if not household.available:
        return
    calendars = list(entry.data.get(CONF_CALENDARS, []))
    create_for = (
        {cal["person_entity"] for cal in calendars if cal.get("person_entity")}
        if create_people
        else set()
    )
    rows, members = link_calendars(
        calendars, household.members, await async_person_info(hass), create_for
    )
    if members != household.members:
        household.members = members
        await household.async_save()
    if rows != calendars:
        hass.config_entries.async_update_entry(entry, data={**entry.data, CONF_CALENDARS: rows})
        coordinator: PlanaVistaCoordinator | None = getattr(entry, "runtime_data", None)
        if coordinator is not None:
            coordinator.async_set_calendars(rows)
            await coordinator.async_refresh()


async def async_start_household(
    hass: HomeAssistant, household: Household, entry: PlanaVistaConfigEntry
) -> None:
    """Once Home Assistant has started: tidy people links, then link calendars.

    The first time, people linked to calendars become members, and an install
    that finished setup before households existed is marked as set up.
    """
    if not household.available:
        return
    if "person" in hass.config.components:
        members = clear_missing_persons(household.members, await async_person_info(hass))
        if members != household.members:
            household.members = members
            await household.async_save()
    first_time = not household.data["migrations"].get(MIGRATION_PEOPLE)
    await async_link_calendars(hass, household, entry, create_people=first_time)
    if first_time:
        household.data["migrations"][MIGRATION_PEOPLE] = True
        if entry.data.get(CONF_ONBOARDING_COMPLETE, True) is not False:
            household.data["setup"]["completed"] = True
        await household.async_save()
