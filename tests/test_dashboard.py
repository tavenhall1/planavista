"""PlanaVista's own dashboard (the owner, 2026-10-14, option A): made when PlanaVista is added.

docs/superpowers/specs/2026-10-14-onboarding-design.md.
"""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser

from homeassistant.components import frontend
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.dashboard import DASHBOARD_ID, DEFAULT_LAYOUT, STORE_KEY

from .conftest import ws_client_for, ws_command


@pytest.fixture
async def lovelace(hass: HomeAssistant) -> None:
    """Home Assistant's dashboards, as every install has them."""
    assert await async_setup_component(hass, "lovelace", {})
    await hass.async_block_till_done()


def _panel(hass: HomeAssistant, url: str) -> Any:
    return hass.data.get(frontend.DATA_PANELS, {}).get(url)


async def _layout(hass: HomeAssistant, url: str) -> dict[str, Any]:
    return await hass.data[LOVELACE_DATA].dashboards[url].async_load(False)


async def _add_planavista(hass: HomeAssistant) -> MockConfigEntry:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_USER})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    await hass.async_block_till_done()
    return hass.config_entries.async_get_entry(result["result"].entry_id)


async def test_adding_planavista_puts_its_dashboard_in_the_sidebar(hass: HomeAssistant, lovelace: None) -> None:
    entry = await _add_planavista(hass)
    assert entry.data["dashboard_offer"] is True
    panel = _panel(hass, "planavista")
    assert panel is not None
    assert (panel.component_name, panel.sidebar_title, panel.require_admin, panel.show_in_sidebar) == ("lovelace", "PlanaVista", False, True)
    assert await _layout(hass, "planavista") == DEFAULT_LAYOUT
    assert DEFAULT_LAYOUT["views"][0]["type"] == "panel"
    assert DEFAULT_LAYOUT["views"][0]["cards"] == [{"type": "custom:planavista-card"}]


async def test_an_install_from_before_stays_as_it_was(
    hass: HomeAssistant, lovelace: None, mock_config_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert _panel(hass, "planavista") is None


async def test_a_taken_address_moves_it_over_and_nothing_is_overwritten(hass: HomeAssistant, lovelace: None) -> None:
    frontend.async_register_built_in_panel(hass, "iframe", "Someone else's", frontend_url_path="planavista")
    await _add_planavista(hass)
    assert _panel(hass, "planavista").component_name == "iframe"
    assert _panel(hass, "planavista-home").sidebar_title == "PlanaVista"


async def test_hide_show_and_a_restart_keep_the_layout(hass: HomeAssistant, lovelace: None, hass_ws_client: Any) -> None:
    entry = await _add_planavista(hass)
    edited = {"views": [{"title": "Kitchen", "path": "kitchen", "type": "panel", "cards": [{"type": "custom:planavista-card", "module": "chores"}]}]}
    await hass.data[LOVELACE_DATA].dashboards["planavista"].async_save(edited)
    client = await hass_ws_client(hass)
    hidden = await ws_command(client, {"type": "planavista/dashboard/set", "shown": False})
    assert hidden["result"] == {"shown": False, "url_path": "planavista", "available": True}
    assert _panel(hass, "planavista") is None
    shown = await ws_command(client, {"type": "planavista/dashboard/set", "shown": True})
    assert shown["result"]["shown"] is True
    assert await _layout(hass, "planavista") == edited
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert _panel(hass, "planavista") is not None
    assert await _layout(hass, "planavista") == edited
    got = await ws_command(client, {"type": "planavista/dashboard/get"})
    assert got["result"] == {"shown": True, "url_path": "planavista", "available": True}


async def test_an_install_from_before_can_add_it(
    hass: HomeAssistant, lovelace: None, mock_config_entry: MockConfigEntry, hass_ws_client: Any
) -> None:
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    assert (await ws_command(client, {"type": "planavista/dashboard/get"}))["result"]["shown"] is False
    await ws_command(client, {"type": "planavista/dashboard/set", "shown": True})
    assert await _layout(hass, "planavista") == DEFAULT_LAYOUT


async def test_only_an_admin_changes_it(
    hass: HomeAssistant, lovelace: None, accounts: dict[str, MockUser], hass_ws_client: Any, mock_config_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    refused = await ws_command(alex, {"type": "planavista/dashboard/set", "shown": True})
    assert refused["success"] is False
    assert _panel(hass, "planavista") is None


async def test_removing_planavista_removes_its_dashboard(hass: HomeAssistant, lovelace: None, hass_storage: dict[str, Any]) -> None:
    entry = await _add_planavista(hass)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    assert _panel(hass, "planavista") is None
    assert "planavista" not in hass.data[LOVELACE_DATA].dashboards
    assert f"lovelace.{DASHBOARD_ID}" not in hass_storage
    assert STORE_KEY not in hass_storage
