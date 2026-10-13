"""binary_sensor.<member>_chores_done: on when everything due today is done (spec 10.2)."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..coordinator import PlanaVistaConfigEntry
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime


class ChoresDoneBinarySensor(ChoresEntity, BinarySensorEntity):
    """On when today's ring is closed: done or waiting for approval (nothing due counts as done)."""

    _attr_icon = "mdi:check-circle-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's sensor."""
        super().__init__(runtime, entry_id, member_id, "chores_done")

    @property
    def is_on(self) -> bool | None:
        """Everything due today is done."""
        view = self.view
        if view is None:
            return None
        today = view["today"]
        return today["done"] + today["pending"] >= today["due"]


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add a done sensor for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.BINARY_SENSOR,
        async_add_entities,
        lambda member_id: [ChoresDoneBinarySensor(runtime, entry.entry_id, member_id)],
    )
