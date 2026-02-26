"""The PlanaVista integration."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path

from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    UPDATE_INTERVAL_SECONDS,
    CONF_CALENDARS,
    EVENT_RANGE_PAST_DAYS,
    EVENT_RANGE_FUTURE_DAYS,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

# Frontend resource URL - single bundled output from LitElement/TypeScript build
FRONTEND_SCRIPTS = [
    "/planavista_panel/dist/planavista-cards.js",
]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    _LOGGER.info("Setting up PlanaVista integration")

    # Register frontend resources (only once per HA instance)
    await async_register_frontend(hass)

    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for config changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    # Register frontend wizard service
    async def async_save_config(call) -> None:
        """Save config submitted by the frontend onboarding wizard."""
        call_data = call.data
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            _LOGGER.error("save_config: no PlanaVista config entry found")
            return
        config_entry = entries[0]
        new_data = dict(config_entry.data)

        if "calendars" in call_data:
            new_data[CONF_CALENDARS] = list(call_data["calendars"])
        if "display" in call_data:
            new_data["display"] = dict(call_data["display"])
        if "onboarding_complete" in call_data:
            new_data["onboarding_complete"] = bool(call_data["onboarding_complete"])

        # Suppress the background reload that async_update_entry triggers
        # (the update listener would otherwise destroy the coordinator we're about to update)
        coord = hass.data[DOMAIN].get(config_entry.entry_id)
        if coord:
            coord._suppress_reload = True

        # Persist to config entry storage
        hass.config_entries.async_update_entry(config_entry, data=new_data)

        # Update coordinator in-memory and refresh data immediately
        if coord:
            coord.calendars = new_data.get(CONF_CALENDARS, [])
            await coord.async_refresh()

        _LOGGER.info(
            "PlanaVista config saved via save_config service (calendars=%d, onboarding=%s)",
            len(new_data.get(CONF_CALENDARS, [])),
            new_data.get("onboarding_complete"),
        )

    hass.services.async_register(DOMAIN, "save_config", async_save_config)

    return True


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend resources."""
    # Check if already registered to avoid duplicate registration
    if DOMAIN in hass.data and hass.data[DOMAIN].get("frontend_registered"):
        return

    # Get the path to the frontend directory
    frontend_path = Path(__file__).parent / "frontend"

    # Register static path to serve the JS files using the new async API
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/planavista_panel",
            path=str(frontend_path),
            cache_headers=False,
        )
    ])

    # Add all JS files to the frontend (order matters - base must load first)
    for script_url in FRONTEND_SCRIPTS:
        add_extra_js_url(hass, script_url)

    # Mark as registered
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["frontend_registered"] = True

    _LOGGER.info("PlanaVista v1.0 frontend registered (single bundle)")


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading PlanaVista integration")

    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    # Skip reload when save_config already handled the update in-memory
    coord = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if coord and getattr(coord, "_suppress_reload", False):
        coord._suppress_reload = False
        _LOGGER.debug("Skipping reload — save_config already applied changes")
        return
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


def _normalize_color(color_value) -> str:
    """Normalize color to hex string format.

    Handles both hex strings and RGB arrays from ColorRGBSelector.
    """
    if isinstance(color_value, str):
        return color_value
    if isinstance(color_value, (list, tuple)) and len(color_value) >= 3:
        r, g, b = color_value[:3]
        return f"#{int(r):02x}{int(g):02x}{int(b):02x}"
    return "#4A90E2"


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
                "events": [],
                "upcoming_events": [],
                "conflicts": [],
            }

            # Calculate time range for event fetching
            now = dt_util.now()
            start_time = now - timedelta(days=EVENT_RANGE_PAST_DAYS)
            end_time = now + timedelta(days=EVENT_RANGE_FUTURE_DAYS)

            # Fetch events from each configured calendar
            for calendar_config in self.calendars:
                entity_id = calendar_config.get("entity_id")

                if not entity_id:
                    continue

                calendar_state = self.hass.states.get(entity_id)

                if calendar_state:
                    color = _normalize_color(calendar_config.get("color", "#4A90E2"))
                    display_name = calendar_config.get("display_name", "Unknown")

                    color_light = calendar_config.get("color_light", "")

                    calendar_data = {
                        "entity_id": entity_id,
                        "display_name": display_name,
                        "color": color,
                        "color_light": color_light,
                        "icon": calendar_config.get("icon", "mdi:calendar"),
                        "person_entity": calendar_config.get("person_entity", ""),
                        "visible": calendar_config.get("visible", True),
                        "state": calendar_state.state,
                        "attributes": dict(calendar_state.attributes),
                    }
                    data["calendars"].append(calendar_data)

                    # Fetch events from calendar entity
                    try:
                        events = await self._fetch_calendar_events(
                            entity_id, start_time, end_time
                        )
                        for event in events:
                            event["calendar_entity_id"] = entity_id
                            event["calendar_name"] = display_name
                            event["calendar_color"] = color
                            event["calendar_color_light"] = color_light
                            data["events"].append(event)
                    except Exception as err:
                        _LOGGER.warning(
                            "Failed to fetch events from %s: %s", entity_id, err
                        )

            # Sort events by start time
            data["events"].sort(key=lambda e: e.get("start", ""))

            # Get upcoming events (next 7 days)
            upcoming_cutoff = now + timedelta(days=7)
            data["upcoming_events"] = [
                e for e in data["events"]
                if e.get("start", "") >= now.isoformat()
                and e.get("start", "") <= upcoming_cutoff.isoformat()
            ]

            return data

        except Exception as err:
            raise UpdateFailed(f"Error fetching calendar data: {err}") from err

    async def _fetch_calendar_events(
        self, entity_id: str, start: datetime, end: datetime
    ) -> list[dict]:
        """Fetch events from a calendar entity.

        Tries direct entity access first (returns CalendarEvent objects with uid),
        then falls back to the calendar.get_events service (which may omit uid).
        """
        # Approach 1: Direct entity access — gives us CalendarEvent objects with uid
        try:
            entity_comp = self.hass.data.get(CALENDAR_DOMAIN)
            if entity_comp and hasattr(entity_comp, "get_entity"):
                entity = entity_comp.get_entity(entity_id)
                if entity and hasattr(entity, "async_get_events"):
                    raw_events = await entity.async_get_events(self.hass, start, end)
                    events = []
                    for ev in raw_events:
                        d = {
                            "summary": ev.summary or "",
                            "description": ev.description or "",
                            "location": ev.location or "",
                            "uid": ev.uid or "",
                            "recurrence_id": ev.recurrence_id or "",
                        }
                        if hasattr(ev.start, "isoformat"):
                            d["start"] = ev.start.isoformat()
                        else:
                            d["start"] = str(ev.start)
                        if hasattr(ev.end, "isoformat"):
                            d["end"] = ev.end.isoformat()
                        else:
                            d["end"] = str(ev.end)
                        events.append(d)
                    _LOGGER.debug(
                        "PlanaVista: fetched %d events from %s via direct entity (uid available: %s)",
                        len(events),
                        entity_id,
                        any(e.get("uid") for e in events),
                    )
                    return events
        except Exception as err:
            _LOGGER.debug(
                "PlanaVista: direct entity access failed for %s, falling back to service: %s",
                entity_id, err,
            )

        # Approach 2: Fallback — calendar.get_events service (may omit uid)
        try:
            response = await self.hass.services.async_call(
                CALENDAR_DOMAIN,
                "get_events",
                {
                    "entity_id": entity_id,
                    "start_date_time": start.isoformat(),
                    "end_date_time": end.isoformat(),
                },
                blocking=True,
                return_response=True,
            )

            if response and entity_id in response:
                events = response[entity_id].get("events", [])
                for event in events:
                    if "start" in event and hasattr(event["start"], "isoformat"):
                        event["start"] = event["start"].isoformat()
                    if "end" in event and hasattr(event["end"], "isoformat"):
                        event["end"] = event["end"].isoformat()
                    event.setdefault("description", "")
                    event.setdefault("location", "")
                    event.setdefault("recurrence_id", "")
                _LOGGER.debug(
                    "PlanaVista: fetched %d events from %s via service (uid available: %s)",
                    len(events),
                    entity_id,
                    any(e.get("uid") for e in events),
                )
                return events
            return []
        except Exception as err:
            _LOGGER.debug("Error fetching events from %s: %s", entity_id, err)
            return []

    @property
    def display_config(self):
        """Return display configuration."""
        return self.entry.data.get("display", {})

    @property
    def calendar_configs(self):
        """Return calendar configurations."""
        return self.calendars
