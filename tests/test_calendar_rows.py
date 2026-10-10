"""Calendar rows keep every key on their way to the card, including member_id."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = [
        {**deepcopy(CONFIGURED_CALENDARS[0]), "member_id": None, "added_by_a_later_card": "kept"}
    ]
    data["onboarding_complete"] = True
    return data


async def test_sensor_rows_keep_every_key(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    row = hass.states.get("sensor.planavista_config").attributes["calendars"][0]
    assert row["added_by_a_later_card"] == "kept"
    assert row["member_id"] is None
    assert row["display_name"] == "Alex"
    assert "state" in row and "attributes" in row
