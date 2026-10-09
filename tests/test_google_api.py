"""Tests for the Google Calendar helpers: timeouts, token refresh, and fallbacks."""
from __future__ import annotations

import asyncio
from copy import deepcopy
import logging
import re
import time
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import aiohttp
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import AiohttpClientMocker
from pytest_homeassistant_custom_component.typing import WebSocketGenerator

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.google_api import (
    async_get_google_token,
    get_google_calendar_id,
)

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar

GOOGLE_IDS = {
    "calendar.test_alex": "alex@example.com",
    "calendar.test_blair": "blair@example.com",
}
EVENTS_URL = re.compile(r"^https://www\.googleapis\.com/calendar/v3/calendars/[^/]+/events")
EVENT_URL = re.compile(r"^https://www\.googleapis\.com/calendar/v3/calendars/[^/]+/events/")
SHORT_TIMEOUT = 0.05


async def _hang(*args: Any) -> None:
    """Never answer within the (patched) timeout."""
    await asyncio.sleep(10)


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    data["onboarding_complete"] = True
    return data


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


@pytest.fixture
def google_lookups() -> Any:
    """Treat Alex and Blair as Google calendars with a valid token."""
    with (
        patch(
            "custom_components.planavista.services.get_google_calendar_id",
            side_effect=lambda hass, entity_id: GOOGLE_IDS.get(entity_id),
        ),
        patch(
            "custom_components.planavista.services.async_get_google_token",
            AsyncMock(return_value="test-token"),
        ),
        patch(
            "custom_components.planavista.google_api.GOOGLE_API_TIMEOUT_SECONDS",
            SHORT_TIMEOUT,
        ),
    ):
        yield


def _add_google_calendar(hass: HomeAssistant, expires_at: float) -> MockConfigEntry:
    """Register calendar.family_google as a Google calendar of parent@example.com."""
    google_entry = MockConfigEntry(
        domain="google",
        unique_id="parent@example.com",
        data={
            "auth_implementation": "google",
            "token": {
                "access_token": "current-token",
                "refresh_token": "refresh-token",
                "expires_at": expires_at,
                "token_type": "Bearer",
            },
        },
    )
    google_entry.add_to_hass(hass)
    er.async_get(hass).async_get_or_create(
        "calendar",
        "google",
        "parent@example.com-kids@example.com",
        config_entry=google_entry,
        suggested_object_id="family_google",
    )
    return google_entry


async def test_google_calendar_id_strips_account_prefix(hass: HomeAssistant) -> None:
    """The calendar id is the unique_id without the account prefix."""
    _add_google_calendar(hass, expires_at=time.time() + 3600)

    assert get_google_calendar_id(hass, "calendar.family_google") == "kids@example.com"
    assert get_google_calendar_id(hass, "calendar.not_google") is None


async def test_valid_token_is_used_without_refresh(hass: HomeAssistant) -> None:
    """A token that has not expired is returned as is."""
    _add_google_calendar(hass, expires_at=time.time() + 3600)
    implementation = MagicMock()
    implementation.async_refresh_token = AsyncMock()

    with patch(
        "custom_components.planavista.google_api.async_get_config_entry_implementation",
        AsyncMock(return_value=implementation),
    ):
        token = await async_get_google_token(hass, "calendar.family_google")

    assert token == "current-token"
    implementation.async_refresh_token.assert_not_called()


@pytest.mark.parametrize(
    "refresh_error",
    [aiohttp.ClientError("token endpoint unreachable"), _hang],
    ids=["client_error", "timeout"],
)
async def test_failed_token_refresh_returns_none(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture, refresh_error: Any
) -> None:
    """An expired token that cannot be refreshed is not used; the failure is logged."""
    _add_google_calendar(hass, expires_at=time.time() - 60)
    implementation = MagicMock()
    implementation.async_refresh_token = AsyncMock(side_effect=refresh_error)

    with (
        patch(
            "custom_components.planavista.google_api.async_get_config_entry_implementation",
            AsyncMock(return_value=implementation),
        ),
        patch(
            "custom_components.planavista.google_api.GOOGLE_API_TIMEOUT_SECONDS",
            SHORT_TIMEOUT,
        ),
        caplog.at_level(logging.WARNING),
    ):
        token = await async_get_google_token(hass, "calendar.family_google")

    assert token is None
    assert "Could not get a Google access token for calendar.family_google" in caplog.text


async def test_create_falls_back_when_google_times_out(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    google_lookups: None,
    aioclient_mock: AiohttpClientMocker,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """A Google request that times out falls back to one event per calendar."""
    aioclient_mock.post(EVENTS_URL, side_effect=_hang)

    await hass.services.async_call(
        DOMAIN,
        "create_event_with_attendees",
        {
            "entity_id": "calendar.test_alex",
            "attendee_entity_ids": ["calendar.test_blair"],
            "summary": "Recital",
            "start_date": "2026-10-20",
            "end_date": "2026-10-21",
        },
        blocking=True,
    )

    assert aioclient_mock.call_count == 1
    for entity_id in ("calendar.test_alex", "calendar.test_blair"):
        assert [ev.summary for ev in setup_calendars[entity_id].events] == ["Recital"]
    assert "Google Calendar request failed" in caplog.text


async def test_create_uses_google_with_attendees(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    google_lookups: None,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """When Google answers, one linked event is created with both attendees."""
    aioclient_mock.post(EVENTS_URL, json={"id": "google-event-1"})

    await hass.services.async_call(
        DOMAIN,
        "create_event_with_attendees",
        {
            "entity_id": "calendar.test_alex",
            "attendee_entity_ids": ["calendar.test_blair"],
            "summary": "Recital",
            "start_date": "2026-10-20",
            "end_date": "2026-10-21",
        },
        blocking=True,
    )

    assert aioclient_mock.call_count == 1
    _method, _url, body, headers = aioclient_mock.mock_calls[0]
    assert headers["Authorization"] == "Bearer test-token"
    assert body["start"] == {"date": "2026-10-20"}
    assert body["attendees"] == [
        {"email": "alex@example.com"},
        {"email": "blair@example.com"},
    ]
    assert setup_calendars["calendar.test_alex"].events == []


@pytest.mark.parametrize(
    ("lookup", "patch_response", "expected_code"),
    [
        ({"status": 500, "text": "backend error"}, None, "lookup_failed"),
        ({"exc": aiohttp.ClientConnectionError("reset")}, None, "lookup_error"),
        ({"json": {"items": []}}, None, "not_found"),
        ({"json": {"items": [{"id": "evt-1"}]}}, {"side_effect": _hang}, "patch_error"),
        ({"json": {"items": [{"id": "evt-1"}]}}, {"status": 403, "text": "nope"}, "patch_failed"),
    ],
    ids=["lookup_http_error", "lookup_network_error", "not_found", "patch_timeout", "patch_http_error"],
)
async def test_update_event_reports_google_failures(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    google_lookups: None,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
    lookup: dict[str, Any],
    patch_response: dict[str, Any] | None,
    expected_code: str,
) -> None:
    """Every Google failure becomes a WebSocket error instead of a hang."""
    aioclient_mock.get(EVENTS_URL, **lookup)
    if patch_response is not None:
        aioclient_mock.patch(EVENT_URL, **patch_response)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "planavista/update_event",
            "entity_id": "calendar.test_alex",
            "uid": "ical-uid-1",
            "summary": "Recital (moved)",
        }
    )
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == expected_code


async def test_update_event_patches_with_attendees(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    google_lookups: None,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
) -> None:
    """A successful update returns the event id and sends the attendee list."""
    aioclient_mock.get(EVENTS_URL, json={"items": [{"id": "evt-1"}]})
    aioclient_mock.patch(EVENT_URL, json={"id": "evt-1"})
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "planavista/update_event",
            "entity_id": "calendar.test_alex",
            "uid": "ical-uid-1",
            "start_date": "2026-10-20",
            "end_date": "2026-10-22",
            "attendee_entity_ids": ["calendar.test_alex", "calendar.test_blair"],
        }
    )
    response = await client.receive_json()

    assert response["success"] is True
    assert response["result"] == {"success": True, "event_id": "evt-1"}
    _method, url, body, _headers = aioclient_mock.mock_calls[1]
    assert "evt-1" in str(url)
    assert body["start"] == {"date": "2026-10-20"}
    assert body["attendees"] == [
        {"email": "alex@example.com"},
        {"email": "blair@example.com"},
    ]


@pytest.mark.parametrize(
    ("lookup", "expected"),
    [
        ({"json": {"items": [{"organizer": {"email": "Blair@example.com"}}]}}, "calendar.test_blair"),
        ({"json": {"items": []}}, None),
        ({"side_effect": _hang}, None),
    ],
    ids=["organizer_found", "no_event", "timeout"],
)
async def test_get_event_organizer(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    google_lookups: None,
    aioclient_mock: AiohttpClientMocker,
    hass_ws_client: WebSocketGenerator,
    lookup: dict[str, Any],
    expected: str | None,
) -> None:
    """The organizer maps to a configured calendar; failures answer None."""
    aioclient_mock.get(EVENTS_URL, **lookup)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "planavista/get_event_organizer",
            "entity_id": "calendar.test_alex",
            "uid": "ical-uid-1",
        }
    )
    response = await client.receive_json()

    assert response["success"] is True
    assert response["result"] == {"organizer_entity_id": expected}
