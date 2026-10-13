"""Kiosk mode (milestone 9): the household's setting, and who may step out of it.

On shared family screens the card hides Home Assistant's sidebar and header
(the top bar entirely, or all but its tabs). A parent whose own Home
Assistant login is an admin may step out while in parent mode. These rules
are pure; the WebSocket layer works out the facts.
"""
from __future__ import annotations

from collections.abc import Mapping
from typing import Any

KIOSK_TOP_BARS = ("hidden", "tabs")


def default_kiosk() -> dict[str, Any]:
    """Off, and when it's turned on, Home Assistant's top bar is hidden too."""
    return {"enabled": False, "top_bar": "hidden"}


def normalize_kiosk(value: object) -> dict[str, Any]:
    """The stored setting with missing or unknown values reset. Unknown fields are kept."""
    kiosk: dict[str, Any] = dict(value) if isinstance(value, Mapping) else {}
    if not isinstance(kiosk.get("enabled"), bool):
        kiosk["enabled"] = False
    if kiosk.get("top_bar") not in KIOSK_TOP_BARS:
        kiosk["top_bar"] = "hidden"
    return kiosk


def exit_refusal(*, enabled: bool, shared: bool, parent_session: bool, parent_is_admin: bool) -> str | None:
    """Why stepping out of kiosk mode is refused, or None when it may go ahead (spec D3)."""
    if not enabled:
        return "kiosk_off"
    if not shared:
        return "not_shared"
    if not parent_session:
        return "parent_mode_required"
    if not parent_is_admin:
        return "not_admin"
    return None
