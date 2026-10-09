"""Shared fixtures for the PlanaVista tests."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant

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
