"""Appearance settings in the config entry (spec 12.4) and the first entry migration (spec 7.8)."""
from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

import pytest
import voluptuous as vol
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from custom_components.planavista.appearance import (
    APPEARANCE_KEYS,
    appearance_settings,
    legacy_theme,
    migrate_display,
    with_legacy_theme,
)
from custom_components.planavista.const import DOMAIN
from custom_components.planavista.services import DISPLAY_SCHEMA

from .conftest import DEFAULT_ENTRY_DATA, FakeCalendar, ws_command

CASES: list[dict[str, Any]] = json.loads(
    (Path(__file__).parent / "fixtures" / "appearance_cases.json").read_text(encoding="utf-8")
)["cases"]
NAMES = [case["name"] for case in CASES]


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_settings_come_from_the_new_keys_or_from_1_1_0s(case: dict[str, Any]) -> None:
    """The same table the card reads (core/appearance.ts)."""
    assert appearance_settings(case["display"]) == case["settings"]


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_1_1_0_reads_back_the_look_in_use(case: dict[str, Any]) -> None:
    assert legacy_theme(case["settings"]) == (case["legacy"]["theme"], case["legacy"]["theme_overrides"])


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_the_migration_adds_keys_beside_1_1_0s_and_can_run_twice(case: dict[str, Any]) -> None:
    once = migrate_display(case["display"])
    assert migrate_display(once) == once
    assert {key: once[key] for key in case["display"]} == case["display"]
    assert set(APPEARANCE_KEYS) <= set(once)


def test_a_save_keeps_colors_that_1_1_0s_keys_only_implied() -> None:
    """Switching an unmigrated display to Dark keeps its light accent."""
    display = with_legacy_theme(
        {"theme": "planavista", "theme_overrides": {"accent": "#F94144"}, "appearance": "dark"}
    )
    assert display["colors_light"] == {"accent": "#F94144"}
    assert display["theme"] == "dark"
    assert "theme_overrides" not in display
    assert with_legacy_theme(display) == display


def test_the_schema_accepts_appearance_settings() -> None:
    display = {
        "appearance": "automatic",
        "appearance_switch": "schedule",
        "light_from": "06:30",
        "dark_from": "20:15",
        "theme_pair": "vibrant",
        "colors_light": {"accent": "#277DA1", "header": "plain"},
        "colors_dark": {"header": "gradient_teal", "now_color": "#F87171"},
        "shape": {"corner_style": "pill", "avatar_border": "white"},
        "motion": "reduced",
    }
    assert DISPLAY_SCHEMA(display) == display
    assert DISPLAY_SCHEMA({"appearance": None}) == {"appearance": None}


@pytest.mark.parametrize(
    "bad",
    [
        {"appearance": "dim"},
        {"appearance_switch": "moon"},
        {"light_from": "7am"},
        {"dark_from": "24:00"},
        {"theme_pair": "neon"},
        {"colors_light": {"accent": "red"}},
        {"colors_dark": {"header": "neon"}},
        {"shape": {"corner_style": "round"}},
        {"motion": "wild"},
    ],
)
def test_the_schema_refuses_values_it_does_not_know(bad: dict[str, Any]) -> None:
    with pytest.raises(vol.Invalid):
        DISPLAY_SCHEMA(bad)


async def test_switching_to_dark_on_a_screen_writes_deep_dark_for_1_1_0(
    hass: HomeAssistant,
    hass_ws_client: Any,
    household: Any,
    mock_config_entry: MockConfigEntry,
) -> None:
    """The card saves one key; the backend writes the rest and 1.1.0's keys."""
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"appearance": "dark"}})
    assert reply["success"]
    display = mock_config_entry.data["display"]
    assert display["appearance"] == "dark"
    assert display["theme_pair"] == "planavista"
    assert display["theme"] == "dark"
    assert display["time_format"] == DEFAULT_ENTRY_DATA["display"]["time_format"]
    assert set(APPEARANCE_KEYS) <= set(display)


@pytest.fixture
def legacy_entry(hass: HomeAssistant) -> MockConfigEntry:
    """An entry as 1.1.0 saved it: Deep Dark with an accent of its own."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["display"].update(theme="dark", theme_overrides={"accent": "#277DA1"}, future_setting="kept")
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=data, version=1, minor_version=1)
    entry.add_to_hass(hass)
    return entry


async def test_a_1_1_0_entry_gets_its_appearance_keys(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar], legacy_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_setup(legacy_entry.entry_id)
    await hass.async_block_till_done()

    assert legacy_entry.minor_version == 2
    display = legacy_entry.data["display"]
    # 1.1.0 can still read it.
    assert display["theme"] == "dark"
    assert display["theme_overrides"] == {"accent": "#277DA1"}
    assert display["future_setting"] == "kept"
    # The accent moves to the version it was made for.
    assert display["appearance"] == "dark"
    assert display["theme_pair"] == "planavista"
    assert display["colors_dark"] == {"accent": "#277DA1"}
    assert display["colors_light"] == {}


async def test_an_entry_from_a_newer_release_loads_as_it_is(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]
) -> None:
    """Stepping back one release keeps a newer minor version's data (spec 7.8)."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["display"]["setting_from_later"] = True
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=data, version=1, minor_version=3)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.LOADED
    assert entry.minor_version == 3
    assert entry.data == data


async def test_an_entry_from_a_newer_major_version_does_not_load(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN, title="PlanaVista", data=deepcopy(DEFAULT_ENTRY_DATA), version=2, minor_version=1
    )
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.MIGRATION_ERROR
