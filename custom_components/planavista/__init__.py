"""The PlanaVista integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .services import async_setup_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

# Frontend resource URL - single bundled output from LitElement/TypeScript build
FRONTEND_SCRIPTS = [
    "/planavista_panel/dist/planavista-cards.js",
]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services, WebSocket commands, and the card bundle once."""
    async_setup_services(hass)
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend resources."""
    # Get the path to the frontend directory
    frontend_path = Path(__file__).parent / "frontend"

    # Register static path to serve the JS files using the new async API
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/planavista_panel",
            path=str(frontend_path),
            cache_headers=False,
        )
    ])

    # Add all JS files to the frontend (order matters - base must load first)
    for script_url in FRONTEND_SCRIPTS:
        add_extra_js_url(hass, script_url)

    _LOGGER.info("PlanaVista v1.0 frontend registered (single bundle)")


async def async_unload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
