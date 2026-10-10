"""Tests for the household Store: first start, unknown fields, and newer versions."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.household.store import (
    DATA_HOUSEHOLD,
    ISSUE_NEWER_VERSION,
    STORAGE_KEY,
    default_document,
    normalize,
)

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """An install that finished setup before households existed."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    data["onboarding_complete"] = True
    return data


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


def test_normalize_fills_gaps_and_keeps_unknown_fields() -> None:
    doc = normalize(
        {
            "members": [{"id": "dana", "name": "Dana", "future": 1}, {"no": "id"}],
            "security": {"pins": {}, "later": True},
            "chores_hint": "x",
        }
    )
    assert doc["members"] == [{"id": "dana", "name": "Dana", "future": 1}]
    assert doc["security"] == {
        "pins": {},
        "later": True,
        "shared_users": [],
        "shuffle_keypad": False,
    }
    assert doc["chores_hint"] == "x"
    assert doc["setup"] == {"completed": False, "step": None}
    assert normalize(None) == default_document()
    assert normalize("garbage") == default_document()


async def test_first_start_marks_an_existing_install_as_set_up(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    await _setup(hass, mock_config_entry)
    household = hass.data[DATA_HOUSEHOLD]
    assert household.available
    assert household.data["setup"]["completed"] is True
    assert household.data["migrations"] == {"people_from_calendars": True}
    stored = hass_storage[STORAGE_KEY]
    assert (stored["version"], stored["minor_version"]) == (1, 1)


async def test_fields_from_a_newer_minor_version_survive_a_save(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "minor_version": 2,
        "key": STORAGE_KEY,
        "data": {
            "members": [
                {
                    "id": "dana",
                    "name": "Dana",
                    "color": "#F94144",
                    "color_dark": None,
                    "age_group": "young_child",
                    "parent": False,
                    "person": None,
                    "picture": {"emoji": "\U0001f996"},
                    "my_day": "pictures",
                    "needs_ok_for": "all",
                    "stars": True,
                    "order": 0,
                    "rev": 1,
                    "from_a_newer_version": {"x": 1},
                }
            ],
            "security": {"pins": {}, "shared_users": [], "shuffle_keypad": True, "later": [1]},
            "modules": {"chores": {"enabled": True}},
            "setup": {"completed": True, "step": None},
            "migrations": {"people_from_calendars": True},
            "rewards_hint": "kept",
        },
    }
    await _setup(hass, mock_config_entry)
    household = hass.data[DATA_HOUSEHOLD]
    household.data["security"]["shuffle_keypad"] = False
    await household.async_save()
    await hass.async_block_till_done()

    saved = hass_storage[STORAGE_KEY]["data"]
    assert saved["members"][0]["from_a_newer_version"] == {"x": 1}
    assert saved["security"]["later"] == [1]
    assert saved["modules"] == {"chores": {"enabled": True}}
    assert saved["rewards_hint"] == "kept"


async def test_a_file_from_a_newer_major_version_leaves_the_calendar_working(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 2,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {"members": []},
    }
    await _setup(hass, mock_config_entry)
    assert not hass.data[DATA_HOUSEHOLD].available
    assert hass.states.get("sensor.planavista_config").state == "configured"
    issue = ir.async_get(hass).async_get_issue(DOMAIN, ISSUE_NEWER_VERSION)
    assert issue is not None and issue.severity == ir.IssueSeverity.ERROR
    assert hass_storage[STORAGE_KEY]["version"] == 2
