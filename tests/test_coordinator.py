"""Tests for the PlanaVista coordinator and sensors."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.calendar import CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    return data


async def test_sensor_exposes_calendars_and_events(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Events from configured calendars reach the config sensor with calendar metadata."""
    now = dt_util.now()
    tomorrow = (now + timedelta(days=1)).date()
    setup_calendars["calendar.test_alex"].events.append(
        CalendarEvent(
            uid="alex-1",
            summary="Swim practice",
            start=now + timedelta(hours=1),
            end=now + timedelta(hours=2),
        )
    )
    setup_calendars["calendar.test_blair"].events.append(
        CalendarEvent(
            uid="blair-1",
            summary="Field trip",
            start=tomorrow,
            end=tomorrow + timedelta(days=1),
        )
    )
    setup_calendars["calendar.test_casey"].events.append(
        CalendarEvent(
            uid="casey-1",
            summary="Not configured",
            start=now + timedelta(hours=3),
            end=now + timedelta(hours=4),
        )
    )

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get("sensor.planavista_config")
    assert [c["entity_id"] for c in state.attributes["calendars"]] == [
        "calendar.test_alex",
        "calendar.test_blair",
    ]
    events = {event["uid"]: event for event in state.attributes["events"]}
    assert set(events) == {"alex-1", "blair-1"}
    assert events["alex-1"]["calendar_entity_id"] == "calendar.test_alex"
    assert events["alex-1"]["calendar_name"] == "Alex"
    assert events["alex-1"]["calendar_color"] == "#F94144"
    assert events["blair-1"]["start"] == tomorrow.isoformat()
    assert events["blair-1"]["end"] == (tomorrow + timedelta(days=1)).isoformat()
    assert state.attributes["display"] == DEFAULT_ENTRY_DATA["display"]
    assert state.attributes["onboarding_complete"] is False

    assert hass.states.get("sensor.planavista_upcoming_events").state == "2"
