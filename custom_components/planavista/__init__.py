"""The PlanaVista integration."""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .const import DOMAIN, FRONTEND_BUNDLE, FRONTEND_URL_PATH
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .household.store import async_get_household, async_start_household
from .household.websocket import async_setup_household_websocket
from .services import async_setup_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

# Only the built bundle is published; sources next to it stay private.
FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services, WebSocket commands, and the card bundle once."""
    async_setup_services(hass)
    async_setup_household_websocket(hass)
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    coordinator.async_start_tracking()
    entry.runtime_data = coordinator

    # People and calendars are linked once Home Assistant has started, when
    # every person entity exists.
    household = await async_get_household(hass)

    async def _async_start_household(_hass: HomeAssistant) -> None:
        await async_start_household(hass, household, entry)

    entry.async_on_unload(async_at_started(hass, _async_start_household))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


def _bundle_hash(bundle: Path) -> str:
    """Return the first 8 hex digits of the bundle's SHA-256."""
    return hashlib.sha256(bundle.read_bytes()).hexdigest()[:8]


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve frontend/dist and load the card with a cache-busting URL.

    The ?v= query changes whenever the integration version or the bundle
    changes, so browsers fetch the new card after an update.
    """
    integration = await async_get_integration(hass, DOMAIN)
    bundle_hash = await hass.async_add_executor_job(
        _bundle_hash, FRONTEND_DIST / FRONTEND_BUNDLE
    )

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=FRONTEND_URL_PATH,
                path=str(FRONTEND_DIST),
                cache_headers=False,
            )
        ]
    )

    script_url = (
        f"{FRONTEND_URL_PATH}/{FRONTEND_BUNDLE}?v={integration.version}-{bundle_hash}"
    )
    add_extra_js_url(hass, script_url)
    _LOGGER.debug("PlanaVista card registered at %s", script_url)


async def async_unload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
