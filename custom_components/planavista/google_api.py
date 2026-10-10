"""Google Calendar API helpers: direct API calls with attendee support.

Every request is bounded by GOOGLE_API_TIMEOUT_SECONDS. Failures raise
GoogleApiError so callers can fall back to Home Assistant's calendar services.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any
import urllib.parse

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.config_entry_oauth2_flow import (
    OAuth2Session,
    async_get_config_entry_implementation,
)

from .const import GOOGLE_API_TIMEOUT_SECONDS

_LOGGER = logging.getLogger(__name__)

GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars"


class GoogleApiError(HomeAssistantError):
    """A Google Calendar API request failed or timed out."""

    def __init__(self, message: str, status: int | None = None) -> None:
        """Store the HTTP status (None for network errors and timeouts)."""
        super().__init__(message)
        self.status = status


def _describe(err: BaseException) -> str:
    """Return a readable description; TimeoutError has an empty message."""
    return str(err) or type(err).__name__


def get_google_calendar_id(hass: HomeAssistant, entity_id: str) -> str | None:
    """Get Google Calendar ID (email) for an entity, or None if not Google.

    HA's Google Calendar integration stores entity unique_id as
    "{account_email}-{calendar_id}".  For primary calendars both parts are
    the same email, e.g. "alice@gmail.com-alice@gmail.com".  We need to
    strip the account prefix so the Google API gets just the calendar ID.
    """
    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)
    if entry and entry.platform == "google" and entry.config_entry_id:
        config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
        if config_entry and config_entry.unique_id:
            prefix = config_entry.unique_id + "-"
            if entry.unique_id and entry.unique_id.startswith(prefix):
                return entry.unique_id[len(prefix):]
        # Fallback: return raw unique_id
        return entry.unique_id
    return None


def _google_entry(hass: HomeAssistant, entity_id: str) -> ConfigEntry | None:
    """Return the Google config entry that owns entity_id, if any."""
    entity_entry = er.async_get(hass).async_get(entity_id)
    if not entity_entry or not entity_entry.config_entry_id:
        return None
    google_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not google_entry or google_entry.domain != "google":
        return None
    return google_entry


async def async_get_google_token(hass: HomeAssistant, entity_id: str) -> str | None:
    """Return a valid access token for the Google account that owns entity_id.

    An expired token is refreshed first. Returns None, and logs why, when the
    entity is not a Google calendar or the token cannot be refreshed; callers
    then fall back to Home Assistant's calendar services.
    """
    google_entry = _google_entry(hass, entity_id)
    if google_entry is None:
        return None

    try:
        implementation = await async_get_config_entry_implementation(hass, google_entry)
        session = OAuth2Session(hass, google_entry, implementation)
        async with asyncio.timeout(GOOGLE_API_TIMEOUT_SECONDS):
            await session.async_ensure_token_valid()
    except (aiohttp.ClientError, TimeoutError, HomeAssistantError, ValueError) as err:
        _LOGGER.warning(
            "Could not get a Google access token for %s: %s", entity_id, _describe(err)
        )
        return None

    return session.token.get("access_token")


async def _async_request(
    hass: HomeAssistant,
    method: str,
    url: str,
    access_token: str,
    json_body: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Send one Google Calendar API request, bounded by the timeout."""
    session = async_get_clientsession(hass)
    try:
        async with asyncio.timeout(GOOGLE_API_TIMEOUT_SECONDS):
            async with session.request(
                method,
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                json=json_body,
            ) as resp:
                if resp.status not in (200, 201):
                    text = await resp.text()
                    raise GoogleApiError(
                        f"Google Calendar API error {resp.status}: {text[:300]}",
                        resp.status,
                    )
                return await resp.json()
    except (aiohttp.ClientError, TimeoutError, ValueError) as err:
        raise GoogleApiError(
            f"Google Calendar request failed: {_describe(err)}"
        ) from err


def _calendar_url(calendar_id: str) -> str:
    return f"{GOOGLE_CALENDAR_API}/{urllib.parse.quote(calendar_id, safe='')}/events"


async def async_google_create_event(
    hass: HomeAssistant,
    access_token: str,
    calendar_id: str,
    event_data: dict,
    attendee_emails: list[str],
) -> dict:
    """Create event via Google Calendar API with attendees."""
    body: dict = {
        "summary": event_data.get("summary", ""),
    }
    if event_data.get("description"):
        body["description"] = event_data["description"]
    if event_data.get("location"):
        body["location"] = event_data["location"]

    tz = str(hass.config.time_zone) if hass.config.time_zone else "UTC"

    if event_data.get("start_date"):
        body["start"] = {"date": event_data["start_date"]}
        body["end"] = {"date": event_data["end_date"]}
    else:
        body["start"] = {
            "dateTime": event_data["start_date_time"],
            "timeZone": tz,
        }
        body["end"] = {
            "dateTime": event_data["end_date_time"],
            "timeZone": tz,
        }

    if attendee_emails:
        body["attendees"] = [{"email": email} for email in attendee_emails]

    url = f"{_calendar_url(calendar_id)}?sendUpdates=all"
    return await _async_request(hass, "POST", url, access_token, body)


async def async_google_find_event(
    hass: HomeAssistant, access_token: str, calendar_id: str, ical_uid: str
) -> dict[str, Any] | None:
    """Return the Google event with this iCal UID, or None if there is none."""
    url = (
        f"{_calendar_url(calendar_id)}"
        f"?iCalUID={urllib.parse.quote(ical_uid, safe='')}&maxResults=1"
    )
    data = await _async_request(hass, "GET", url, access_token)
    items = data.get("items") or []
    return items[0] if items else None


async def async_google_patch_event(
    hass: HomeAssistant,
    access_token: str,
    calendar_id: str,
    event_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """Update a Google event in place and notify its attendees."""
    url = (
        f"{_calendar_url(calendar_id)}/"
        f"{urllib.parse.quote(event_id, safe='')}?sendUpdates=all"
    )
    return await _async_request(hass, "PATCH", url, access_token, body)
