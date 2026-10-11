"""What chores entities share: their devices, names, and when they are available (spec 10.1)."""
from __future__ import annotations

from typing import Any

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from ..const import DOMAIN, NAME
from .runtime import HOUSEHOLD_DEVICE, ChoresRuntime, chores_unique_id, member_device_id


def household_device() -> DeviceInfo:
    """The Household device: household-wide entities, and the appearance select."""
    return DeviceInfo(
        identifiers={(DOMAIN, HOUSEHOLD_DEVICE)},
        name="Household",
        manufacturer=NAME,
        model="Household",
    )


def member_device(member_id: str, name: str) -> DeviceInfo:
    """A member's device: automation authors pick "Casey" and find everything of theirs."""
    return DeviceInfo(
        identifiers={(DOMAIN, member_device_id(member_id))},
        name=name,
        manufacturer=NAME,
        model="Household member",
    )


class ChoresEntity(Entity):
    """A chores entity of one member, or of the household when `member_id` is None."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str | None, key: str) -> None:
        """Name it by its key; the device gives the member's or the household's name."""
        self.runtime = runtime
        self.member_id = member_id
        self._attr_unique_id = chores_unique_id(entry_id, member_id or HOUSEHOLD_DEVICE, key)
        self._attr_translation_key = key
        if member_id is None:
            self._attr_device_info = household_device()
        else:
            member = runtime.household.member(member_id) or {}
            self._attr_device_info = member_device(member_id, member.get("name", member_id))

    @property
    def available(self) -> bool:
        """Unavailable while chores need a look, and once the member is gone."""
        if not self.runtime.available:
            return False
        return self.member_id is None or self.runtime.household.member(self.member_id) is not None

    @property
    def view(self) -> dict[str, Any] | None:
        """This member's part of today's board."""
        if self.member_id is None or not self.available:
            return None
        return self.runtime.member_view(self.member_id)

    async def async_added_to_hass(self) -> None:
        """Write the state again whenever chores change."""
        self.async_on_remove(self.runtime.async_listen_entities(self._handle_update))

    def _handle_update(self) -> None:
        self.async_write_ha_state()
