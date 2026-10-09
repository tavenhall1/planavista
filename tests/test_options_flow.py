"""Tests for the options flow and for applying settings in place."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.planavista.const import DOMAIN

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar

NEW_DISPLAY = {
    "time_format": "24h",
    "weather_entity": "",
    "first_day": "sunday",
    "default_view": "month",
    "theme": "dark",
}


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair, with a theme override set by the card."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    data["display"]["theme_overrides"] = {"accent": "#277DA1"}
    data["onboarding_complete"] = True
    return data


@pytest.fixture
async def loaded_entry(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> MockConfigEntry:
    """Set up PlanaVista with the fake calendars loaded."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    return mock_config_entry


def _calendar_ids(hass: HomeAssistant) -> list[str]:
    state = hass.states.get("sensor.planavista_config")
    return [calendar["entity_id"] for calendar in state.attributes["calendars"]]


async def test_options_flow_opens(hass: HomeAssistant, loaded_entry: MockConfigEntry) -> None:
    """Opening the options flow shows the menu instead of crashing."""
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)

    assert result["type"] is FlowResultType.MENU
    assert result["step_id"] == "init"
    assert set(result["menu_options"]) == {"manage_calendars", "edit_calendar", "display"}


async def test_display_options_apply_in_place(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Saving display options updates the sensor without reloading the entry."""
    coordinator = loaded_entry.runtime_data

    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "display"}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], NEW_DISPLAY
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert loaded_entry.state is ConfigEntryState.LOADED
    assert loaded_entry.runtime_data is coordinator
    assert loaded_entry.update_listeners == []
    display = hass.states.get("sensor.planavista_config").attributes["display"]
    assert display == {**NEW_DISPLAY, "theme_overrides": {"accent": "#277DA1"}}
    assert hass.states.get("sensor.planavista_upcoming_events") is not None


async def test_manage_calendars_removes_a_calendar(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Unticking a calendar removes it from the entry and the sensor."""
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "manage_calendars"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"calendars": ["calendar.test_alex"]}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert [c["entity_id"] for c in loaded_entry.data["calendars"]] == [
        "calendar.test_alex"
    ]
    assert _calendar_ids(hass) == ["calendar.test_alex"]


async def test_save_config_applies_in_place_and_options_still_work(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """save_config updates the running coordinator; later settings changes still apply."""
    coordinator = loaded_entry.runtime_data

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"calendars": [CONFIGURED_CALENDARS[1]], "display": NEW_DISPLAY},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert loaded_entry.runtime_data is coordinator
    assert _calendar_ids(hass) == ["calendar.test_blair"]
    assert hass.states.get("sensor.planavista_config").attributes["display"] == NEW_DISPLAY

    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "display"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {**NEW_DISPLAY, "time_format": "12h"}
    )
    await hass.async_block_till_done()

    assert loaded_entry.state is ConfigEntryState.LOADED
    state = hass.states.get("sensor.planavista_config")
    assert state.attributes["display"]["time_format"] == "12h"
    assert _calendar_ids(hass) == ["calendar.test_blair"]
