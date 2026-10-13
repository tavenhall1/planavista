"""Kiosk mode (milestone 9): the household's setting, the view, and who may step out of it."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.household.kiosk import (
    KIOSK_TOP_BARS,
    default_kiosk,
    exit_refusal,
    normalize_kiosk,
)

from .conftest import ws_client_for, ws_command


def test_the_setting_starts_off_with_the_top_bar_hidden() -> None:
    assert default_kiosk() == {"enabled": False, "top_bar": "hidden"}
    assert KIOSK_TOP_BARS == ("hidden", "tabs")


def test_normalizing_fills_in_and_keeps_what_it_doesnt_know() -> None:
    assert normalize_kiosk(None) == default_kiosk()
    assert normalize_kiosk("on") == default_kiosk()
    assert normalize_kiosk({"enabled": True}) == {"enabled": True, "top_bar": "hidden"}
    assert normalize_kiosk({"enabled": "yes", "top_bar": "menu"}) == default_kiosk()
    # A later version's field survives a save by this one (rollback-safe, spec 7.8).
    assert normalize_kiosk({"enabled": True, "top_bar": "tabs", "later": 1}) == {
        "enabled": True, "top_bar": "tabs", "later": 1,
    }


@pytest.mark.parametrize(
    ("enabled", "shared", "parent_session", "parent_is_admin", "refusal"),
    [
        (True, True, True, True, None),
        (False, True, True, True, "kiosk_off"),
        (True, False, True, True, "not_shared"),
        (True, True, False, True, "parent_mode_required"),
        (True, True, True, False, "not_admin"),
    ],
)
def test_only_an_admin_parent_steps_out_on_a_shared_screen_in_kiosk_mode(
    enabled: bool, shared: bool, parent_session: bool, parent_is_admin: bool, refusal: str | None
) -> None:
    assert (
        exit_refusal(enabled=enabled, shared=shared, parent_session=parent_session, parent_is_admin=parent_is_admin)
        == refusal
    )


async def _view(client: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    assert (await client.receive_json())["success"]
    return (await client.receive_json())["event"]


async def test_the_view_says_whether_kiosk_mode_is_on(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    view = await _view(await hass_ws_client(hass))
    assert view["security"]["kiosk"] == {"enabled": False, "top_bar": "hidden"}
    household.data["security"]["kiosk"] = {"enabled": True, "top_bar": "tabs"}
    view = await _view(await hass_ws_client(hass))
    assert view["security"]["kiosk"] == {"enabled": True, "top_bar": "tabs"}


async def test_a_parent_turns_kiosk_mode_on_and_picks_the_top_bar(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
    reply = await ws_command(
        client, {"type": "planavista/household/settings/save", "kiosk_enabled": True, "kiosk_top_bar": "tabs"}
    )
    assert reply["success"]
    assert household.data["security"]["kiosk"] == {"enabled": True, "top_bar": "tabs"}
    reply = await ws_command(client, {"type": "planavista/household/settings/save", "kiosk_enabled": False})
    assert reply["success"]
    assert household.data["security"]["kiosk"] == {"enabled": False, "top_bar": "tabs"}
    for bad in ({"kiosk_enabled": "yes"}, {"kiosk_top_bar": "menu"}):
        refused = await ws_command(client, {"type": "planavista/household/settings/save", **bad})
        assert not refused["success"], bad


async def test_a_member_cant_change_kiosk_mode(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(client, {"type": "planavista/household/settings/save", "kiosk_enabled": True})
    assert not refused["success"]
    assert household.data["security"]["kiosk"]["enabled"] is False
