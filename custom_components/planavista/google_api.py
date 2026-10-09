"""Google Calendar API helpers — direct API calls with attendee support."""
from __future__ import annotations

import logging
import time
import urllib.parse

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)


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


async def async_get_google_token(hass: HomeAssistant, entity_id: str) -> str | None:
    """Get a valid Google OAuth access token for the account owning entity_id."""
    registry = er.async_get(hass)
    entity_entry = registry.async_get(entity_id)
    if not entity_entry or not entity_entry.config_entry_id:
        return None

    google_entry = hass.config_entries.async_get_entry(entity_entry.config_entry_id)
    if not google_entry or google_entry.domain != "google":
        return None

    token_data = google_entry.data.get("token", {})

    # Refresh token if expired (with 60s buffer)
    expires_at = token_data.get("expires_at", 0)
    if time.time() >= expires_at - 60:
        try:
            from homeassistant.helpers.config_entry_oauth2_flow import (
                async_get_config_entry_implementation,
                OAuth2Session,
            )
            implementation = await async_get_config_entry_implementation(
                hass, google_entry
            )
            session = OAuth2Session(hass, google_entry, implementation)
            await session.async_ensure_token_valid()
            # Re-read token after refresh
            token_data = google_entry.data.get("token", {})
        except Exception as err:
            _LOGGER.warning("PlanaVista: failed to refresh Google token: %s", err)
            # Try with existing token anyway

    return token_data.get("access_token")


async def async_google_create_event(
    hass: HomeAssistant,
    access_token: str,
    calendar_id: str,
    event_data: dict,
    attendee_emails: list[str],
) -> dict:
    """Create event via Google Calendar API with attendees."""
    http_session = async_get_clientsession(hass)

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

    encoded_id = urllib.parse.quote(calendar_id, safe="")
    url = (
        f"https://www.googleapis.com/calendar/v3/calendars/"
        f"{encoded_id}/events?sendUpdates=all"
    )

    async with http_session.post(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=body,
    ) as resp:
        if resp.status not in (200, 201):
            text = await resp.text()
            raise Exception(f"Google Calendar API error {resp.status}: {text}")
        return await resp.json()
