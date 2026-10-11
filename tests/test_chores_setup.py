"""First-run setup remembers how the household started (spec 14.7), so the steps that follow apply and setup resumes."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .conftest import ws_command


async def test_setup_remembers_how_the_household_started(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    for start in ("common", "restore", "calendar", None):
        reply = await ws_command(client, {"type": "planavista/household/setup/save", "start": start, "step": "chores"})
        assert reply["success"], reply
        assert household.data["setup"]["start"] == start
    refused = await ws_command(client, {"type": "planavista/household/setup/save", "start": "everything"})
    assert not refused["success"]
    assert household.data["setup"]["step"] == "chores"


async def test_the_household_view_carries_the_start(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await ws_command(client, {"type": "planavista/household/setup/save", "start": "plan"})
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    seen: list[dict[str, Any]] = []
    while not any(m.get("type") == "event" for m in seen):
        seen.append(await client.receive_json())
    view = next(m for m in seen if m.get("type") == "event")["event"]
    assert view["setup"]["start"] == "plan"
