"""The PlanaVista integration."""
from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    DOMAIN,
    UPDATE_INTERVAL_SECONDS,
    CONF_CALENDARS,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    _LOGGER.info("Setting up PlanaVista integration")

    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for config changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading PlanaVista integration")

    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


class PlanaVistaCoordinator(DataUpdateCoordinator):
    """Class to manage fetching PlanaVista data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL_SECONDS),
        )
        self.entry = entry
        self.calendars = entry.data.get(CONF_CALENDARS, [])

    async def _async_update_data(self):
        """Fetch data from calendars."""
        try:
            data = {
                "calendars": [],
                "upcoming_events": [],
                "conflicts": [],
            }

            # Fetch events from each configured calendar
            for calendar_config in self.calendars:
                entity_id = calendar_config.get("entity_id")

                if not entity_id:
                    continue

                calendar_state = self.hass.states.get(entity_id)

                if calendar_state:
                    calendar_data = {
                        "entity_id": entity_id,
                        "display_name": calendar_config.get("display_name", "Unknown"),
                        "color": calendar_config.get("color", "#4A90E2"),
                        "icon": calendar_config.get("icon", "mdi:calendar"),
                        "visible": calendar_config.get("visible", True),
                        "state": calendar_state.state,
                        "attributes": dict(calendar_state.attributes),
                    }
                    data["calendars"].append(calendar_data)

            return data

        except Exception as err:
            raise UpdateFailed(f"Error fetching calendar data: {err}") from err

    @property
    def display_config(self):
        """Return display configuration."""
        return self.entry.data.get("display", {})

    @property
    def calendar_configs(self):
        """Return calendar configurations."""
        return self.calendars
