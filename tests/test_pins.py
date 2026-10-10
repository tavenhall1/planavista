"""Tests for the PIN commands: unlocking, pauses, sessions, and that PINs never leak."""
from __future__ import annotations

from datetime import timedelta
import json
import logging
from typing import Any

from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.const import MATCH_ALL
from homeassistant.core import Event, HomeAssistant, callback

from custom_components.planavista.household import websocket as household_ws

from .conftest import set_pin, ws_client_for, ws_command

PIN = "482613"


@pytest.fixture
async def kitchen(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> Any:
    """The wall tablet's connection; its account is a shared screen and Blair has a PIN."""
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "blair", PIN)
    return await ws_client_for(hass, hass_ws_client, accounts["kitchen"])


async def _unlock(client: Any, member_id: str, pin: str) -> dict[str, Any]:
    reply = await ws_command(client, {"type": "planavista/pin/unlock", "member_id": member_id, "pin": pin})
    return reply["result"]


async def test_a_parent_pin_starts_parent_mode_on_a_shared_screen(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    denied = await ws_command(kitchen, {"type": "planavista/household/settings/save", "shuffle_keypad": True})
    assert denied["error"]["code"] == "parent_mode_required"
    result = await _unlock(kitchen, "blair", PIN)
    assert (result["ok"], result["parent"], result["member_id"], result["expires_in"]) == (True, True, "blair", 120)
    allowed = await ws_command(
        kitchen,
        {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": result["session"]},
    )
    assert allowed["success"]
    assert household.data["security"]["shuffle_keypad"] is True


async def test_wrong_pins_pause_after_five_tries(
    hass: HomeAssistant, household: Any, kitchen: Any, freezer: FrozenDateTimeFactory
) -> None:
    replies = [await _unlock(kitchen, "blair", "000000") for _ in range(6)]
    assert [r["reason"] for r in replies] == ["wrong_pin"] * 4 + ["paused", "paused"]
    assert [r["tries_left"] for r in replies[:4]] == [4, 3, 2, 1]
    assert replies[4]["retry_after"] == 30
    freezer.tick(timedelta(seconds=31))
    for _ in range(5):
        reply = await _unlock(kitchen, "blair", "000000")
    assert (reply["reason"], reply["retry_after"]) == ("paused", 60)
    freezer.tick(timedelta(seconds=61))
    assert (await _unlock(kitchen, "blair", PIN))["ok"] is True
    record = household.pins["blair"]
    assert (record["failures"], record["lockouts"], record["locked_until"]) == (0, 0, None)


async def test_parallel_tries_cannot_skip_the_pause(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    for _ in range(8):
        await kitchen.send_json_auto_id(
            {"type": "planavista/pin/unlock", "member_id": "blair", "pin": "000000"}
        )
    reasons = [(await kitchen.receive_json())["result"]["reason"] for _ in range(8)]
    assert sorted(reasons) == ["paused"] * 4 + ["wrong_pin"] * 4
    assert household.pins["blair"]["lockouts"] == 1


async def test_a_session_belongs_to_its_connection(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    other = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    reply = await ws_command(
        other, {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": token}
    )
    assert reply["error"]["code"] == "parent_mode_required"


async def test_closing_the_connection_ends_its_sessions(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    await _unlock(kitchen, "blair", PIN)
    assert len(household.sessions) == 1
    await kitchen.close()
    await hass.async_block_till_done()
    assert len(household.sessions) == 0


async def test_a_session_ends_after_two_quiet_minutes(
    hass: HomeAssistant, household: Any, kitchen: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    clock = [1000.0]
    monkeypatch.setattr(household_ws, "_monotonic", lambda: clock[0])
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    clock[0] += 119
    assert (await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token}))["result"] == {"expires_in": 120}
    clock[0] += 119
    saved = await ws_command(
        kitchen, {"type": "planavista/household/settings/save", "shuffle_keypad": False, "session": token}
    )
    assert saved["success"]
    clock[0] += 121
    reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
    assert reply["error"]["code"] == "session_ended"


async def test_lock_ends_parent_mode(hass: HomeAssistant, household: Any, kitchen: Any) -> None:
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    assert (await ws_command(kitchen, {"type": "planavista/pin/lock", "session": token}))["success"]
    reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
    assert reply["error"]["code"] == "session_ended"
    assert (await ws_command(kitchen, {"type": "planavista/pin/lock", "session": token}))["success"]


async def test_a_members_own_session_changes_only_their_pin(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    await set_pin(hass, household, "casey", "1357")
    result = await _unlock(kitchen, "casey", "1357")
    assert result["parent"] is False
    token = result["session"]
    changed = await ws_command(
        kitchen, {"type": "planavista/pin/set", "member_id": "casey", "pin": "2468", "session": token}
    )
    assert changed["success"]
    for fields in (
        {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468", "session": token},
        {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": token},
    ):
        assert (await ws_command(kitchen, fields))["error"]["code"] == "parent_mode_required"


async def test_your_own_login_sets_your_own_pin(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    assert (await ws_command(casey, {"type": "planavista/pin/set", "member_id": "casey", "pin": "2468"}))["success"]
    denied = await ws_command(casey, {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468"})
    assert denied["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    assert (await ws_command(alex, {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468"}))["success"]


@pytest.mark.parametrize("pin", ["48a613", "481", "4826131", 482613, ["4826"], None])
async def test_bad_pins_are_refused_without_repeating_them(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    caplog: pytest.LogCaptureFixture,
    pin: Any,
) -> None:
    # Home Assistant's own WebSocket debug log prints every message it receives
    # (plan ruling); everything else stays captured.
    caplog.set_level(logging.INFO, logger="homeassistant.components.websocket_api")
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/pin/set", "member_id": "dana", "pin": pin})
    error = reply["error"]
    assert (error["code"], error["message"]) == ("invalid_pin", "PINs are 4 to 6 digits.")
    # Short values could match a line number in the log, so only long ones are looked for.
    if isinstance(pin, (str, int)) and len(str(pin)) >= 6:
        assert str(pin) not in caplog.text
    assert "dana" not in household.pins


async def test_the_last_parent_pin_stays_while_a_screen_is_shared(
    hass: HomeAssistant, hass_ws_client: Any, household: Any, kitchen: Any
) -> None:
    admin = await hass_ws_client(hass)
    denied = await ws_command(admin, {"type": "planavista/pin/clear", "member_id": "blair"})
    assert denied["error"]["code"] == "last_parent_pin"
    await set_pin(hass, household, "alex", "1357")
    assert (await ws_command(admin, {"type": "planavista/pin/clear", "member_id": "blair"}))["success"]
    assert "blair" not in household.pins


async def test_a_parent_can_clear_a_pause(
    hass: HomeAssistant, hass_ws_client: Any, household: Any, kitchen: Any
) -> None:
    for _ in range(5):
        await _unlock(kitchen, "blair", "000000")
    denied = await ws_command(kitchen, {"type": "planavista/pin/clear_lockout", "member_id": "blair"})
    assert denied["error"]["code"] == "parent_mode_required"
    admin = await hass_ws_client(hass)
    assert (await ws_command(admin, {"type": "planavista/pin/clear_lockout", "member_id": "blair"}))["success"]
    assert (await _unlock(kitchen, "blair", PIN))["ok"] is True


async def test_unlocking_someone_without_a_pin(hass: HomeAssistant, household: Any, kitchen: Any) -> None:
    assert await _unlock(kitchen, "dana", "1234") == {"ok": False, "reason": "no_pin"}
    assert await _unlock(kitchen, "nobody", "1234") == {"ok": False, "reason": "no_pin"}


async def test_a_new_pin_ends_the_members_other_sessions(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    here = (await _unlock(kitchen, "blair", PIN))["session"]
    second = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    there = (await _unlock(second, "blair", PIN))["session"]
    changed = await ws_command(
        kitchen, {"type": "planavista/pin/set", "member_id": "blair", "pin": "1357", "session": here}
    )
    assert changed["success"]
    assert (await ws_command(kitchen, {"type": "planavista/pin/touch", "session": here}))["success"]
    reply = await ws_command(second, {"type": "planavista/pin/touch", "session": there})
    assert reply["error"]["code"] == "session_ended"


async def test_a_pin_never_leaks(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    caplog: pytest.LogCaptureFixture,
    hass_storage: dict[str, Any],
) -> None:
    """Set a known PIN, run every flow, and look for it where it must never be (spec 9.8)."""
    # Home Assistant's own WebSocket debug log prints every message it receives,
    # access tokens included (plan ruling). Everything of PlanaVista's logs at debug.
    caplog.set_level(logging.INFO, logger="homeassistant.components.websocket_api")
    caplog.set_level(logging.DEBUG, logger="custom_components.planavista")
    events: list[Event] = []

    @callback
    def remember(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(MATCH_ALL, remember)
    household.shared_users.append(accounts["kitchen"].id)
    admin = await hass_ws_client(hass)
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    seen: list[dict[str, Any]] = []
    await ws_command(admin, {"type": "planavista/household/subscribe"}, seen)

    steps = [
        (admin, {"type": "planavista/pin/set", "member_id": "blair", "pin": PIN}),
        (kitchen, {"type": "planavista/pin/unlock", "member_id": "blair", "pin": "135791"}),
        (kitchen, {"type": "planavista/pin/unlock", "member_id": "blair", "pin": PIN}),
        (admin, {"type": "planavista/pin/set", "member_id": "alex", "pin": PIN}),
        (admin, {"type": "planavista/pin/set", "member_id": "casey", "pin": "48a613"}),
        (admin, {"type": "planavista/pin/clear", "member_id": "alex"}),
    ]
    replies = [await ws_command(client, fields, seen) for client, fields in steps]
    await hass.async_block_till_done()
    # Every flow ran, so finding nothing below means something.
    assert [reply["success"] for reply in replies] == [True, True, True, True, False, True]
    assert replies[1]["result"]["reason"] == "wrong_pin"
    assert replies[2]["result"]["ok"] is True
    assert replies[4]["error"]["code"] == "invalid_pin"
    assert "blair" in household.pins and "alex" not in household.pins

    haystacks = {
        "logs": caplog.text,
        "storage": json.dumps(hass_storage, default=str),
        "events": json.dumps([event.as_dict() for event in events], default=str),
        "states": json.dumps([state.as_dict() for state in hass.states.async_all()], default=str),
        "replies": json.dumps(seen, default=str),
    }
    for where, text in haystacks.items():
        for secret in (PIN, "135791", "48a613"):
            assert secret not in text, f"{secret} found in {where}"
