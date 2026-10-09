"""Shared fixtures for the PlanaVista tests."""
from __future__ import annotations

from copy import deepcopy
import datetime
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    setup_test_component_platform,
)

from homeassistant.components.calendar import (
    DOMAIN as CALENDAR_DOMAIN,
    CalendarEntity,
    CalendarEntityFeature,
    CalendarEvent,
)
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

# Import the integration before any test runs. Home Assistant mounts its own
# testing_config/custom_components package during setup, and whichever
# `custom_components` package is imported first is the one the loader scans.
from custom_components.planavista.const import DOMAIN

DEFAULT_ENTRY_DATA: dict[str, Any] = {
    "calendars": [],
    "display": {
        "time_format": "12h",
        "weather_entity": "",
        "first_day": "monday",
        "default_view": "week",
        "theme": "planavista",
    },
    "onboarding_complete": False,
}

# Calendars configured in PlanaVista. calendar.test_casey exists in Home
# Assistant but is deliberately left out of the PlanaVista configuration.
CONFIGURED_CALENDARS: list[dict[str, Any]] = [
    {
        "entity_id": "calendar.test_alex",
        "display_name": "Alex",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_blair",
        "display_name": "Blair",
        "color": "#277DA1",
        "color_light": "#B3D2DE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
]


class FakeCalendar(CalendarEntity):
    """In-memory calendar entity that supports creating and deleting events."""

    _attr_supported_features = (
        CalendarEntityFeature.CREATE_EVENT | CalendarEntityFeature.DELETE_EVENT
    )

    def __init__(self, name: str) -> None:
        """Create an empty calendar; the entity id is derived from the name."""
        self._attr_name = name
        self.events: list[CalendarEvent] = []

    @property
    def event(self) -> CalendarEvent | None:
        """Report no current event, so the entity schedules no state timers."""
        return None

    async def async_get_events(
        self,
        hass: HomeAssistant,
        start_date: datetime.datetime,
        end_date: datetime.datetime,
    ) -> list[CalendarEvent]:
        """Return events that overlap the window."""
        return [
            ev
            for ev in self.events
            if ev.start_datetime_local < end_date and ev.end_datetime_local > start_date
        ]

    async def async_create_event(self, **kwargs: Any) -> None:
        """Store a new event."""
        self.events.append(
            CalendarEvent(
                uid=f"{self.entity_id}-{len(self.events) + 1}",
                summary=kwargs["summary"],
                start=kwargs["dtstart"],
                end=kwargs["dtend"],
                description=kwargs.get("description"),
                location=kwargs.get("location"),
            )
        )

    async def async_delete_event(
        self,
        uid: str,
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Remove an event by uid."""
        self.events = [ev for ev in self.events if ev.uid != uid]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Let Home Assistant load custom_components/planavista in every test."""


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Return the data for the PlanaVista config entry (override per test module)."""
    return deepcopy(DEFAULT_ENTRY_DATA)


@pytest.fixture
def mock_config_entry(
    hass: HomeAssistant, config_entry_data: dict[str, Any]
) -> MockConfigEntry:
    """Add a PlanaVista config entry to hass without setting it up."""
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=config_entry_data)
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
def fake_calendars() -> dict[str, FakeCalendar]:
    """Return the fake calendars keyed by the entity id they will get."""
    return {
        "calendar.test_alex": FakeCalendar("Test Alex"),
        "calendar.test_blair": FakeCalendar("Test Blair"),
        "calendar.test_casey": FakeCalendar("Test Casey"),
    }


async def async_load_calendars(
    hass: HomeAssistant, calendars: dict[str, FakeCalendar]
) -> None:
    """Load the calendar component with the given fake calendars."""
    setup_test_component_platform(hass, CALENDAR_DOMAIN, list(calendars.values()))
    assert await async_setup_component(
        hass, CALENDAR_DOMAIN, {CALENDAR_DOMAIN: {"platform": "test"}}
    )
    await hass.async_block_till_done()


@pytest.fixture
async def setup_calendars(
    hass: HomeAssistant, fake_calendars: dict[str, FakeCalendar]
) -> dict[str, FakeCalendar]:
    """Load the calendar component with the fake calendars before the test runs."""
    await async_load_calendars(hass, fake_calendars)
    return fake_calendars
