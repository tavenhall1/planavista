"""Tests for the PlanaVista coordinator and sensors."""
from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.calendar import CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
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


def _rows(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    state = hass.states.get("sensor.planavista_config")
    return {row["entity_id"]: row for row in state.attributes["calendars"]}


async def test_a_calendar_whose_events_cant_be_read_is_marked(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """A calendar neither route can read is marked for the card (spec 11.6), and the next good read drops it."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    async def broken(*args: Any, **kwargs: Any) -> list[CalendarEvent]:
        raise HomeAssistantError("token expired")

    # Both the direct read and the calendar.get_events fallback reach the entity, so both fail.
    with patch.object(setup_calendars["calendar.test_blair"], "async_get_events", side_effect=broken):
        await coordinator.async_refresh()
        await hass.async_block_till_done()

    rows = _rows(hass)
    assert rows["calendar.test_blair"]["fetch_failed"] is True
    assert "fetch_failed" not in rows["calendar.test_alex"]

    await coordinator.async_refresh()
    await hass.async_block_till_done()
    assert "fetch_failed" not in _rows(hass)["calendar.test_blair"]


async def test_a_saved_mark_never_outlives_a_good_read(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """A row saved while it was marked (a save from the Calendars page) loses the mark at the next good read."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data
    coordinator.async_set_calendars([{**row, "fetch_failed": True} for row in coordinator.calendars])

    await coordinator.async_refresh()
    await hass.async_block_till_done()

    assert not any("fetch_failed" in row for row in _rows(hass).values())
