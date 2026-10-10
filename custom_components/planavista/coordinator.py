"""Data coordinator for PlanaVista."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import (
    CALLBACK_TYPE,
    CoreState,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    CONF_CALENDARS,
    DOMAIN,
    EVENT_RANGE_FUTURE_DAYS,
    EVENT_RANGE_PAST_DAYS,
    UPDATE_INTERVAL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)

# Calendars usually appear in a burst after a restart: refresh on the first
# one, then at most once per second while the rest arrive.
CALENDAR_REFRESH_COOLDOWN_SECONDS = 1.0


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


class PlanaVistaCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching PlanaVista data."""

    config_entry: PlanaVistaConfigEntry

    def __init__(self, hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL_SECONDS),
        )
        self.calendars: list[dict[str, Any]] = list(entry.data.get(CONF_CALENDARS, []))
        self._unsub_calendar_tracking: CALLBACK_TYPE | None = None
        self._calendar_refresh = Debouncer(
            hass,
            _LOGGER,
            cooldown=CALENDAR_REFRESH_COOLDOWN_SECONDS,
            immediate=True,
            function=self.async_refresh,
        )

    @callback
    def async_start_tracking(self) -> None:
        """Refresh as soon as a configured calendar appears or HA finishes starting.

        After a restart, calendar entities are often added after PlanaVista
        loads. Without this the card stays empty until the next poll.
        """
        self._async_track_calendars()
        self.config_entry.async_on_unload(self._async_stop_tracking)
        self.config_entry.async_on_unload(self._calendar_refresh.async_shutdown)
        if self.hass.state is not CoreState.running:
            self.config_entry.async_on_unload(
                async_at_started(self.hass, self._async_handle_started)
            )

    @callback
    def _async_track_calendars(self) -> None:
        """Subscribe to state changes of the configured calendar entities."""
        self._async_stop_tracking()
        entity_ids = [cal["entity_id"] for cal in self.calendars if cal.get("entity_id")]
        if entity_ids:
            self._unsub_calendar_tracking = async_track_state_change_event(
                self.hass, entity_ids, self._async_handle_calendar_state
            )

    @callback
    def _async_stop_tracking(self) -> None:
        """Drop the calendar state subscription."""
        if self._unsub_calendar_tracking is not None:
            self._unsub_calendar_tracking()
            self._unsub_calendar_tracking = None

    @callback
    def _async_handle_calendar_state(self, event: Event[EventStateChangedData]) -> None:
        """Refresh when a configured calendar appears or becomes available.

        Ordinary on/off changes are ignored, and a calendar that never
        appears produces no events, so this cannot loop.
        """
        new_state = event.data["new_state"]
        old_state = event.data["old_state"]
        if new_state is None or new_state.state == STATE_UNAVAILABLE:
            return
        if old_state is not None and old_state.state != STATE_UNAVAILABLE:
            return
        self._calendar_refresh.async_schedule_call()

    @callback
    def _async_handle_started(self, hass: HomeAssistant) -> None:
        """Refresh once Home Assistant has finished starting."""
        self._calendar_refresh.async_schedule_call()

    async def _async_update_data(self) -> dict[str, Any]:
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

                    # Spread the saved row first so keys the card adds (member_id,
                    # and whatever later releases add) reach the card unchanged.
                    calendar_data = {
                        **calendar_config,
                        "entity_id": entity_id,
                        "display_name": display_name,
                        "color": color,
                        "color_light": color_light,
                        "icon": calendar_config.get("icon", "mdi:calendar"),
                        "person_entity": calendar_config.get("person_entity", ""),
                        "member_id": calendar_config.get("member_id"),
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
        # Approach 1: Direct entity access: gives us CalendarEvent objects with uid
        try:
            entity_comp = self.hass.data.get(DATA_COMPONENT)
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

        # Approach 2: Fallback: calendar.get_events service (may omit uid)
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

    @callback
    def async_set_calendars(self, calendars: list[dict[str, Any]]) -> None:
        """Replace the configured calendars; the next refresh uses them."""
        self.calendars = list(calendars)
        self._async_track_calendars()

    @property
    def display_config(self) -> dict[str, Any]:
        """Return display configuration."""
        return self.config_entry.data.get("display", {})

    @property
    def calendar_configs(self) -> list[dict[str, Any]]:
        """Return calendar configurations."""
        return self.calendars


type PlanaVistaConfigEntry = ConfigEntry[PlanaVistaCoordinator]


async def async_apply_config(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, new_data: dict[str, Any]
) -> None:
    """Persist new settings and apply them to the running coordinator.

    The save_config service and the options flow both change settings through
    this function. The entry is never reloaded, so the sensors stay in place.
    """
    hass.config_entries.async_update_entry(entry, data=new_data)
    if entry.state is ConfigEntryState.LOADED:
        coordinator = entry.runtime_data
        coordinator.async_set_calendars(new_data.get(CONF_CALENDARS, []))
        await coordinator.async_refresh()
