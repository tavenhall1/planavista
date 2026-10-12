"""The last 20 commands PlanaVista refused, for diagnostics (milestone 8).

A report like "Undo did nothing" can then be traced: each entry is the time,
the command, and the reason's code. Never a name, a member, a user id, or a
PIN.
"""
from __future__ import annotations

from collections import deque
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey

from .const import DOMAIN

DATA_REFUSALS: HassKey[deque[dict[str, str]]] = HassKey(f"{DOMAIN}_refusals")
KEPT = 20


@callback
def send_refusal(connection: websocket_api.ActiveConnection, msg: dict[str, Any], code: str, text: str) -> None:
    """Refuse the command, and note it."""
    note_refusal(connection.hass, str(msg.get("type", "")), code)
    connection.send_error(msg["id"], code, text)


@callback
def note_refusal(hass: HomeAssistant, command: str, code: str) -> None:
    """Remember a refusal: when, which command, and why (its code)."""
    log = hass.data.setdefault(DATA_REFUSALS, deque(maxlen=KEPT))
    log.append({"at": dt_util.now().isoformat(timespec="seconds"), "command": command, "reason": code})


def recent_refusals(hass: HomeAssistant) -> list[dict[str, str]]:
    """Oldest first."""
    return list(hass.data.get(DATA_REFUSALS, ()))
