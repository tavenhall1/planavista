"""Tests for refreshing when calendars appear after PlanaVista has loaded."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_UNAVAILABLE
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import (
    CONFIGURED_CALENDARS,
    DEFAULT_ENTRY_DATA,
    FakeCalendar,
    async_load_calendars,
)

NEVER_ADDED = {
    "entity_id": "calendar.never_added",
    "display_name": "Gone",
    "color": "#90BE6D",
    "color_light": "#D8E8CC",
    "icon": "mdi:account",
    "person_entity": "",
    "visible": True,
}


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex, Blair, and a calendar entity that never exists."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = [*deepcopy(CONFIGURED_CALENDARS), dict(NEVER_ADDED)]
    data["onboarding_complete"] = True
    return data


def _calendar_ids(hass: HomeAssistant) -> list[str]:
    state = hass.states.get("sensor.planavista_config")
    return [calendar["entity_id"] for calendar in state.attributes["calendars"]]


async def test_refresh_when_configured_calendars_appear(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    fake_calendars: dict[str, FakeCalendar],
) -> None:
    """Calendars added after PlanaVista loads show up without waiting for the poll."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert _calendar_ids(hass) == []

    await async_load_calendars(hass, fake_calendars)
    # The first calendar refreshes at once and the rest within the 1 s cooldown,
    # far inside the 60 s poll interval.
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=2))
    await hass.async_block_till_done()

    assert _calendar_ids(hass) == ["calendar.test_alex", "calendar.test_blair"]


async def test_missing_calendar_does_not_cause_refreshes(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """A configured calendar that never appears, and ordinary state flips, never refresh."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.states.async_set("sensor.unrelated", "1")
        hass.states.async_set("calendar.test_alex", "on")
        hass.states.async_set("calendar.test_alex", "off")
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=30))
        await hass.async_block_till_done()
        assert update.await_count == 0

        # A configured calendar coming back from unavailable refreshes once.
        hass.states.async_set("calendar.test_blair", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_blair", "off")
        await hass.async_block_till_done()
        assert update.await_count == 1

        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=45))
        await hass.async_block_till_done()
        assert update.await_count == 1


async def test_refreshes_once_when_home_assistant_has_started(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Loading during startup refreshes once when startup finishes, then stays quiet."""
    hass.set_state(CoreState.not_running)
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.set_state(CoreState.running)
        hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
        await hass.async_block_till_done()
        assert update.await_count == 1

        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=30))
        await hass.async_block_till_done()
        assert update.await_count == 1


async def test_tracking_follows_saved_calendars(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """After save_config changes the calendar list, only the new list triggers refreshes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    await hass.services.async_call(
        "planavista",
        "save_config",
        {"calendars": [CONFIGURED_CALENDARS[0]]},
        blocking=True,
    )
    await hass.async_block_till_done()

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.states.async_set("calendar.test_blair", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_blair", "off")
        await hass.async_block_till_done()
        assert update.await_count == 0

        hass.states.async_set("calendar.test_alex", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_alex", "off")
        await hass.async_block_till_done()
        assert update.await_count == 1
