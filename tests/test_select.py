"""select.planavista_appearance, part of the public surface (spec 10.2, 10.8)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er

from .conftest import FakeCalendar, ws_command

ENTITY_ID = "select.planavista_appearance"


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


async def _choose(hass: HomeAssistant, option: str) -> None:
    await hass.services.async_call(
        "select", "select_option", {"entity_id": ENTITY_ID, "option": option}, blocking=True
    )
    await hass.async_block_till_done()


async def test_the_select_is_pinned(hass: HomeAssistant, loaded_entry: MockConfigEntry) -> None:
    """Changing anything here is a deliberate act (spec 10.8)."""
    state = hass.states.get(ENTITY_ID)
    assert state is not None
    assert state.state == "light"
    assert state.attributes["options"] == ["light", "dark", "automatic"]
    assert state.attributes["friendly_name"] == "PlanaVista appearance"
    registry_entry = er.async_get(hass).async_get(ENTITY_ID)
    assert registry_entry is not None
    assert registry_entry.unique_id == f"{loaded_entry.entry_id}_appearance"


async def test_choosing_dark_saves_it_for_every_screen(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    await _choose(hass, "dark")

    display = loaded_entry.data["display"]
    assert display["appearance"] == "dark"
    assert display["theme"] == "dark"  # 1.1.0 reads Deep Dark
    assert hass.states.get(ENTITY_ID).state == "dark"
    assert hass.states.get("sensor.planavista_config").attributes["display"]["appearance"] == "dark"


async def test_the_select_follows_a_save_from_the_card(
    hass: HomeAssistant, hass_ws_client: Any, household: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"appearance": "automatic"}})
    assert reply["success"]
    await hass.async_block_till_done()

    assert hass.states.get(ENTITY_ID).state == "automatic"


async def test_an_option_it_does_not_offer_is_refused(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    with pytest.raises(ServiceValidationError):
        await _choose(hass, "sepia")
    assert hass.states.get(ENTITY_ID).state == "light"
