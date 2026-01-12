"""Sensor platform for PlanaVista integration."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SENSOR_PREFIX
from . import PlanaVistaCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up PlanaVista sensors from a config entry."""
    coordinator: PlanaVistaCoordinator = hass.data[DOMAIN][entry.entry_id]

    entities: list[SensorEntity] = [
        PlanaVistaConfigSensor(coordinator, entry),
        PlanaVistaUpcomingEventsSensor(coordinator, entry),
    ]

    async_add_entities(entities)


class PlanaVistaConfigSensor(CoordinatorEntity, SensorEntity):
    """Sensor that exposes the PlanaVista configuration."""

    def __init__(self, coordinator: PlanaVistaCoordinator, entry: ConfigEntry) -> None:
        """Initialize the config sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_name = f"{SENSOR_PREFIX}_config"
        self._attr_unique_id = f"{entry.entry_id}_config"
        self._attr_icon = "mdi:calendar-multiple"

    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return "configured"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "calendars": self.coordinator.data.get("calendars", []) if self.coordinator.data else [],
            "display": self.coordinator.display_config,
            "version": self._entry.version,
        }


class PlanaVistaUpcomingEventsSensor(CoordinatorEntity, SensorEntity):
    """Sensor that shows upcoming events count."""

    def __init__(self, coordinator: PlanaVistaCoordinator, entry: ConfigEntry) -> None:
        """Initialize the upcoming events sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_name = f"{SENSOR_PREFIX}_upcoming_events"
        self._attr_unique_id = f"{entry.entry_id}_upcoming_events"
        self._attr_icon = "mdi:calendar-clock"

    @property
    def state(self) -> int:
        """Return the count of upcoming events."""
        if not self.coordinator.data:
            return 0

        upcoming_count = 0
        for calendar in self.coordinator.data.get("calendars", []):
            if calendar.get("visible", True) and calendar.get("state") == "on":
                upcoming_count += 1

        return upcoming_count

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if not self.coordinator.data:
            return {}

        events = []
        for calendar in self.coordinator.data.get("calendars", []):
            if calendar.get("visible", True):
                attrs = calendar.get("attributes", {})
                if attrs.get("message"):
                    events.append({
                        "calendar": calendar.get("display_name"),
                        "title": attrs.get("message"),
                        "start": attrs.get("start_time"),
                        "end": attrs.get("end_time"),
                        "color": calendar.get("color"),
                    })

        return {
            "events": events,
            "last_updated": datetime.now().isoformat(),
        }
