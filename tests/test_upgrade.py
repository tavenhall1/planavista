"""Upgrading a 1.1.0 calendar-only install: nothing changes except Settings' new home."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser

from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant

from custom_components.planavista.household.store import DATA_HOUSEHOLD, STORAGE_KEY

from .conftest import DEFAULT_ENTRY_DATA, FakeCalendar

# Calendars as 1.1.0 saved them: Alex's and Casey's are linked to their people.
CALENDARS_1_1_0: list[dict[str, Any]] = [
    {
        "entity_id": "calendar.test_alex",
        "display_name": "Alex",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:account",
        "person_entity": "person.alex",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_blair",
        "display_name": "Blair",
        "color": "#277DA1",
        "color_light": "#B3D2DE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_casey",
        "display_name": "Casey",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:calendar",
        "person_entity": "person.casey",
        "visible": False,
    },
]


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CALENDARS_1_1_0)
    data["display"]["theme"] = "dark"
    data["onboarding_complete"] = True
    return data


@pytest.fixture
def config_entry_minor_version() -> int:
    """These entries come from 1.1.0."""
    return 1


@pytest.fixture
async def people(
    hass: HomeAssistant, hass_admin_user: MockUser, local_auth: Any
) -> dict[str, MockUser]:
    """Alex signs in as an admin; Casey has an ordinary account."""
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    casey = MockUser(name="Casey", groups=[group]).add_to_hass(hass)
    hass.states.async_set(
        "person.alex", "home", {"friendly_name": "Alex", "user_id": hass_admin_user.id}
    )
    hass.states.async_set(
        "person.casey", "home", {"friendly_name": "Casey", "user_id": casey.id}
    )
    return {"alex": hass_admin_user, "casey": casey}


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_upgrade_keeps_the_calendars_and_adds_their_people(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> None:
    await _setup(hass, mock_config_entry)

    rows = mock_config_entry.data["calendars"]
    for old, new in zip(CALENDARS_1_1_0, rows, strict=True):
        assert {key: new[key] for key in old} == old
    assert [row.get("member_id") for row in rows] == ["alex", None, "casey"]
    assert "member_id" not in rows[1]
    assert mock_config_entry.data["display"]["theme"] == "dark"
    assert mock_config_entry.data["onboarding_complete"] is True
    # Deep Dark becomes PlanaVista in Dark (spec 12.4), and 1.1.0 still reads Deep Dark.
    assert mock_config_entry.minor_version == 2
    display = mock_config_entry.data["display"]
    assert (display["theme_pair"], display["appearance"]) == ("planavista", "dark")

    members = {m["id"]: m for m in hass.data[DATA_HOUSEHOLD].members}
    assert set(members) == {"alex", "casey"}
    assert members["alex"]["parent"] is True
    assert members["casey"]["parent"] is False
    assert members["alex"]["color"] == "#F94144"
    assert members["casey"]["color"] != "#F94144"

    sensor_rows = hass.states.get("sensor.planavista_config").attributes["calendars"]
    assert [row["member_id"] for row in sensor_rows] == ["alex", None, "casey"]
    assert sensor_rows[2]["visible"] is False
    assert sensor_rows[2]["icon"] == "mdi:calendar"


async def test_a_restart_changes_nothing(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    await _setup(hass, mock_config_entry)
    members = deepcopy(hass.data[DATA_HOUSEHOLD].members)
    calendars = deepcopy(mock_config_entry.data["calendars"])

    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    hass.data.pop(DATA_HOUSEHOLD)
    await _setup(hass, mock_config_entry)

    assert hass.data[DATA_HOUSEHOLD].members == members
    assert mock_config_entry.data["calendars"] == calendars
    assert hass_storage[STORAGE_KEY]["data"]["members"] == members


async def test_people_are_added_once_home_assistant_has_started(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> None:
    hass.set_state(CoreState.not_running)
    await _setup(hass, mock_config_entry)
    assert hass.data[DATA_HOUSEHOLD].members == []

    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()
    assert {m["id"] for m in hass.data[DATA_HOUSEHOLD].members} == {"alex", "casey"}


async def test_links_to_deleted_people_are_cleared(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "members": [
                {
                    "id": "blair",
                    "name": "Blair",
                    "color": "#277DA1",
                    "color_dark": None,
                    "age_group": "adult",
                    "parent": True,
                    "person": "person.blair",
                    "picture": {"person": True},
                    "my_day": "timeline",
                    "needs_ok_for": "none",
                    "stars": False,
                    "order": 0,
                    "rev": 1,
                }
            ],
            "migrations": {"people_from_calendars": True},
        },
    }
    hass.config.components.add("person")
    await _setup(hass, mock_config_entry)

    blair = hass.data[DATA_HOUSEHOLD].member("blair")
    assert blair["person"] is None
    assert blair["picture"] == {"initial": True}
