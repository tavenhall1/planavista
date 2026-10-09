"""Tests for PlanaVista setup and unload."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.coordinator import PlanaVistaCoordinator

SERVICES = ("save_config", "delete_event", "create_event_with_attendees")
WS_COMMANDS = ("planavista/get_event_organizer", "planavista/update_event")


async def test_services_registered_by_async_setup(hass: HomeAssistant) -> None:
    """Services and WebSocket commands exist as soon as the integration loads."""
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()

    for service in SERVICES:
        assert hass.services.has_service(DOMAIN, service)
    for command in WS_COMMANDS:
        assert command in hass.data[websocket_api.DOMAIN]


async def test_entry_setup_unload_and_setup_again(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """The coordinator lives in runtime_data, and services outlive an unload."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.state is ConfigEntryState.LOADED
    assert isinstance(mock_config_entry.runtime_data, PlanaVistaCoordinator)
    assert hass.states.get("sensor.planavista_config").state == "configured"

    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.NOT_LOADED
    for service in SERVICES:
        assert hass.services.has_service(DOMAIN, service)

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.LOADED
    assert hass.states.get("sensor.planavista_config").state == "configured"
