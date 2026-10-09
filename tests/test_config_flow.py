"""Tests for the PlanaVista config flow."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.planavista.const import DOMAIN

from .conftest import DEFAULT_ENTRY_DATA


async def test_user_step_creates_entry(hass: HomeAssistant) -> None:
    """The welcome step creates the entry with empty calendars and default display settings."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "PlanaVista"
    assert result["data"] == DEFAULT_ENTRY_DATA
    assert hass.states.get("sensor.planavista_config") is not None
    assert hass.states.get("sensor.planavista_upcoming_events") is not None


async def test_second_entry_is_refused(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """Only one PlanaVista entry may exist."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"
