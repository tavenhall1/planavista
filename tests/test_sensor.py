"""Tests for what the PlanaVista sensors send to the recorder."""
from __future__ import annotations

from datetime import datetime, timedelta

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import FakeCalendar


async def test_sensors_keep_large_attributes_out_of_the_recorder(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Event lists and the refresh timestamp are live-only attributes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    config_state = hass.states.get("sensor.planavista_config")
    assert {"events", "calendars"} <= config_state.state_info["unrecorded_attributes"]

    upcoming = hass.states.get("sensor.planavista_upcoming_events")
    assert {"events", "last_updated"} <= upcoming.state_info["unrecorded_attributes"]


async def test_upcoming_events_timestamp_is_timezone_aware(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """last_updated carries a UTC offset."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get("sensor.planavista_upcoming_events")
    last_updated = datetime.fromisoformat(state.attributes["last_updated"])
    assert last_updated.tzinfo is not None
    assert abs(last_updated - dt_util.now()) < timedelta(minutes=1)
