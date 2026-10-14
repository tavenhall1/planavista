"""PlanaVista's own dashboard (the owner, 2026-10-14, option A).

When PlanaVista is added it makes a "PlanaVista" dashboard: one panel view
holding the card, in the sidebar at once. It is registered the way Home
Assistant registers its own storage dashboards (a LovelaceStorage in
LOVELACE_DATA and a built-in lovelace panel), so it is a real dashboard (edit
it, add views, use kiosk mode) that PlanaVista shows or hides. Its layout lives
in .storage/lovelace.planavista_own; PlanaVista's own Store holds whether it
shows and where (docs/superpowers/specs/2026-10-14-onboarding-design.md).
"""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, websocket_api
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.lovelace.dashboard import LovelaceStorage
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

_LOGGER = logging.getLogger(__name__)

STORE_KEY = "planavista.dashboard"
STORE_VERSION = 1
# Its own storage name, so a dashboard of the household's at /planavista keeps its own layout file.
DASHBOARD_ID = "planavista_own"
URL_PATHS = ("planavista", "planavista-home")
TITLE = "PlanaVista"
ICON = "mdi:calendar-heart"
DEFAULT_LAYOUT: dict[str, Any] = {
    "views": [{"title": "PlanaVista", "path": "home", "type": "panel", "cards": [{"type": "custom:planavista-card"}]}],
}
DATA_DASHBOARD = "planavista_dashboard"


class Dashboard:
    """Whether PlanaVista's dashboard shows, where, and its registration."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self.shown = False
        self.url_path: str | None = None
        self._registered: str | None = None
        self._loaded = False

    @property
    def available(self) -> bool:
        """Home Assistant's dashboards are loaded, so one can be made."""
        return self.hass.data.get(LOVELACE_DATA) is not None

    def view(self) -> dict[str, Any]:
        return {"shown": self.shown, "url_path": self.url_path, "available": self.available}

    async def async_start(self, offered: bool) -> None:
        """At entry setup: the first setup of a new entry shows it; after that, as it was left."""
        if not self._loaded:
            data = await self._store.async_load()
            self._loaded = True
            if data is None:
                self.shown = offered
                await self._async_save()
            else:
                self.shown = bool(data.get("shown"))
                url = data.get("url_path")
                self.url_path = url if isinstance(url, str) and url in URL_PATHS else None
        if self.shown:
            await self._async_register()

    async def async_set(self, shown: bool) -> None:
        self.shown = shown
        if shown:
            await self._async_register()
        else:
            self.async_unregister()
        await self._async_save()

    @callback
    def async_unregister(self) -> None:
        """Out of the sidebar; the layout file stays."""
        url = self._registered
        if url is None:
            return
        self._registered = None
        frontend.async_remove_panel(self.hass, url, warn_if_unknown=False)
        lovelace = self.hass.data.get(LOVELACE_DATA)
        if lovelace is not None:
            lovelace.dashboards.pop(url, None)

    async def async_remove(self) -> None:
        """PlanaVista was removed: the dashboard and its layout go too."""
        self.async_unregister()
        await LovelaceStorage(self.hass, self._item(self.url_path or URL_PATHS[0])).async_delete()
        await self._store.async_remove()
        self._loaded = False

    def _free(self, url: str) -> bool:
        lovelace = self.hass.data[LOVELACE_DATA]
        return url not in lovelace.dashboards and not frontend.async_panel_exists(self.hass, url)

    def _item(self, url: str) -> dict[str, Any]:
        return {
            "id": DASHBOARD_ID, "url_path": url, "title": TITLE, "icon": ICON,
            "mode": "storage", "require_admin": False, "show_in_sidebar": True,
        }

    async def _async_register(self) -> None:
        if self._registered is not None or not self.available:
            return
        url = self.url_path if self.url_path and self._free(self.url_path) else next((u for u in URL_PATHS if self._free(u)), None)
        if url is None:
            _LOGGER.warning("PlanaVista's dashboard wasn't added: /%s and /%s are taken", *URL_PATHS)
            return
        store = LovelaceStorage(self.hass, self._item(url))
        self.hass.data[LOVELACE_DATA].dashboards[url] = store
        frontend.async_register_built_in_panel(
            self.hass, "lovelace", sidebar_title=TITLE, sidebar_icon=ICON, frontend_url_path=url,
            config={"mode": "storage"}, require_admin=False,
        )
        self._registered = url
        if self.url_path != url:
            self.url_path = url
            await self._async_save()
        if (await store.async_get_info()).get("mode") == "auto-gen":
            await store.async_save(DEFAULT_LAYOUT)

    async def _async_save(self) -> None:
        await self._store.async_save({"shown": self.shown, "url_path": self.url_path})


def dashboard_for(hass: HomeAssistant) -> Dashboard:
    """The one Dashboard for this Home Assistant."""
    found = hass.data.get(DATA_DASHBOARD)
    if found is None:
        found = hass.data[DATA_DASHBOARD] = Dashboard(hass)
    return found


@websocket_api.websocket_command({vol.Required("type"): "planavista/dashboard/get"})
@websocket_api.async_response
async def ws_dashboard_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Whether PlanaVista's dashboard shows in the sidebar, and where."""
    connection.send_result(msg["id"], dashboard_for(hass).view())


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "planavista/dashboard/set", vol.Required("shown"): bool})
@websocket_api.async_response
async def ws_dashboard_set(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Show or hide PlanaVista's dashboard (admins: it changes Home Assistant's sidebar)."""
    dashboard = dashboard_for(hass)
    await dashboard.async_set(msg["shown"])
    connection.send_result(msg["id"], dashboard.view())


@callback
def async_setup_dashboard_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_dashboard_get)
    websocket_api.async_register_command(hass, ws_dashboard_set)
