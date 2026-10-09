"""Services and WebSocket commands for PlanaVista."""
from __future__ import annotations

import logging
import urllib.parse

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_CALENDARS,
    DOMAIN,
    SERVICE_CREATE_EVENT_WITH_ATTENDEES,
    SERVICE_DELETE_EVENT,
    SERVICE_SAVE_CONFIG,
)
from .coordinator import async_apply_config
from .google_api import (
    async_get_google_token,
    async_google_create_event,
    get_google_calendar_id,
)

_LOGGER = logging.getLogger(__name__)


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register PlanaVista services and WebSocket commands (once per HA start)."""
    hass.services.async_register(DOMAIN, SERVICE_SAVE_CONFIG, _async_save_config)
    hass.services.async_register(DOMAIN, SERVICE_DELETE_EVENT, _async_delete_event)
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_EVENT_WITH_ATTENDEES,
        _async_create_event_with_attendees,
    )
    websocket_api.async_register_command(hass, ws_get_event_organizer)
    websocket_api.async_register_command(hass, ws_update_event)


async def _async_save_config(call: ServiceCall) -> None:
    """Save config submitted by the frontend onboarding wizard."""
    hass = call.hass
    call_data = call.data
    entries = hass.config_entries.async_entries(DOMAIN)
    if not entries:
        _LOGGER.error("save_config: no PlanaVista config entry found")
        return
    config_entry = entries[0]
    new_data = dict(config_entry.data)

    if "calendars" in call_data:
        new_data[CONF_CALENDARS] = list(call_data["calendars"])
    if "display" in call_data:
        new_data["display"] = dict(call_data["display"])
    if "onboarding_complete" in call_data:
        new_data["onboarding_complete"] = bool(call_data["onboarding_complete"])

    await async_apply_config(hass, config_entry, new_data)

    _LOGGER.info(
        "PlanaVista config saved via save_config service (calendars=%d, onboarding=%s)",
        len(new_data.get(CONF_CALENDARS, [])),
        new_data.get("onboarding_complete"),
    )


async def _async_delete_event(call: ServiceCall) -> None:
    """Delete a calendar event by UID via direct entity access."""
    hass = call.hass
    entity_id = call.data.get("entity_id")
    uid = call.data.get("uid")
    recurrence_id = call.data.get("recurrence_id", "")

    if not entity_id or not uid:
        _LOGGER.error("planavista.delete_event: entity_id and uid are required")
        return

    entity_comp = hass.data.get(DATA_COMPONENT)
    if not entity_comp or not hasattr(entity_comp, "get_entity"):
        raise Exception("Calendar platform not available")

    entity = entity_comp.get_entity(entity_id)
    if not entity:
        raise Exception(f"Calendar entity {entity_id} not found")

    if not hasattr(entity, "async_delete_event"):
        raise Exception(f"Calendar {entity_id} does not support event deletion")

    kwargs = {"uid": uid}
    if recurrence_id:
        kwargs["recurrence_id"] = recurrence_id
    await entity.async_delete_event(**kwargs)
    _LOGGER.info("PlanaVista: deleted event uid=%s from %s", uid, entity_id)


async def _async_create_event_with_attendees(call: ServiceCall) -> None:
    """Create a calendar event with attendees via Google Calendar API.

    For Google Calendar entities, calls the API directly so attendees
    receive proper invitations and the event is linked across calendars.
    Falls back to creating separate events for non-Google calendars.
    """
    hass = call.hass
    entity_id = call.data.get("entity_id")
    attendee_entity_ids = call.data.get("attendee_entity_ids", [])

    if not entity_id:
        raise Exception("entity_id is required")

    _LOGGER.debug(
        "PlanaVista: create_event_with_attendees called — "
        "organizer=%s, attendees=%s",
        entity_id, attendee_entity_ids,
    )

    event_data = {
        "summary": call.data.get("summary", ""),
        "description": call.data.get("description", ""),
        "location": call.data.get("location", ""),
        "start_date_time": call.data.get("start_date_time"),
        "end_date_time": call.data.get("end_date_time"),
        "start_date": call.data.get("start_date"),
        "end_date": call.data.get("end_date"),
    }

    # Check if organizer's calendar is Google
    primary_cal_id = get_google_calendar_id(hass, entity_id)
    _LOGGER.debug(
        "PlanaVista: organizer entity %s → Google Calendar ID: %s",
        entity_id, primary_cal_id,
    )

    if primary_cal_id:
        access_token = await async_get_google_token(hass, entity_id)
        _LOGGER.debug(
            "PlanaVista: OAuth token for %s: %s",
            entity_id, "obtained" if access_token else "FAILED",
        )

        if access_token:
            # Map attendee entity IDs to Google Calendar IDs (emails)
            attendee_emails = []
            non_google_attendees = []

            # Include organizer's own email so they appear as attendee
            attendee_emails.append(primary_cal_id)

            for att_id in attendee_entity_ids:
                cal_id = get_google_calendar_id(hass, att_id)
                _LOGGER.debug(
                    "PlanaVista: attendee %s → Google Calendar ID: %s",
                    att_id, cal_id,
                )
                if cal_id:
                    attendee_emails.append(cal_id)
                else:
                    non_google_attendees.append(att_id)

            _LOGGER.debug(
                "PlanaVista: creating event on calendar '%s' with attendees: %s",
                primary_cal_id, attendee_emails,
            )

            try:
                result = await async_google_create_event(
                    hass,
                    access_token,
                    primary_cal_id,
                    event_data,
                    attendee_emails,
                )
                _LOGGER.debug(
                    "PlanaVista: Google API event '%s' created (id=%s)",
                    event_data.get("summary"),
                    result.get("id", "?"),
                )

                # For non-Google attendees, fall back to separate events
                for att_id in non_google_attendees:
                    await _async_create_event_via_ha(hass, att_id, event_data)

                return
            except Exception as err:
                _LOGGER.error(
                    "PlanaVista: Google API create FAILED for calendar '%s': %s",
                    primary_cal_id, err,
                )
    else:
        _LOGGER.debug(
            "PlanaVista: entity %s is not a Google Calendar entity, using fallback",
            entity_id,
        )

    # Fallback: create separate events via HA service
    _LOGGER.debug(
        "PlanaVista: creating separate events via HA service (no attendee linking)"
    )
    await _async_create_event_via_ha(hass, entity_id, event_data)
    for att_id in attendee_entity_ids:
        await _async_create_event_via_ha(hass, att_id, event_data)


async def _async_create_event_via_ha(
    hass: HomeAssistant, entity_id: str, event_data: dict
) -> None:
    """Fallback: create event using HA's calendar.create_event service."""
    service_data: dict = {"summary": event_data.get("summary", "")}
    if event_data.get("start_date_time"):
        service_data["start_date_time"] = event_data["start_date_time"]
    if event_data.get("end_date_time"):
        service_data["end_date_time"] = event_data["end_date_time"]
    if event_data.get("start_date"):
        service_data["start_date"] = event_data["start_date"]
    if event_data.get("end_date"):
        service_data["end_date"] = event_data["end_date"]
    if event_data.get("description"):
        service_data["description"] = event_data["description"]
    if event_data.get("location"):
        service_data["location"] = event_data["location"]

    await hass.services.async_call(
        CALENDAR_DOMAIN,
        "create_event",
        service_data,
        target={"entity_id": entity_id},
        blocking=True,
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/get_event_organizer",
        vol.Required("entity_id"): str,
        vol.Required("uid"): str,
    }
)
@websocket_api.async_response
async def ws_get_event_organizer(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Look up the organizer of a calendar event via Google Calendar API."""
    entity_id = msg["entity_id"]
    uid = msg["uid"]

    cal_id = get_google_calendar_id(hass, entity_id)
    if not cal_id:
        connection.send_result(msg["id"], {"organizer_entity_id": None})
        return

    access_token = await async_get_google_token(hass, entity_id)
    if not access_token:
        connection.send_result(msg["id"], {"organizer_entity_id": None})
        return

    http_session = async_get_clientsession(hass)
    encoded_id = urllib.parse.quote(cal_id, safe="")
    encoded_uid = urllib.parse.quote(uid, safe="")
    url = (
        f"https://www.googleapis.com/calendar/v3/calendars/"
        f"{encoded_id}/events?iCalUID={encoded_uid}&maxResults=1"
    )

    try:
        async with http_session.get(
            url,
            headers={"Authorization": f"Bearer {access_token}"},
        ) as resp:
            if resp.status != 200:
                _LOGGER.debug(
                    "PlanaVista: organizer lookup failed (HTTP %s) for uid=%s",
                    resp.status, uid,
                )
                connection.send_result(msg["id"], {"organizer_entity_id": None})
                return

            data = await resp.json()
            items = data.get("items", [])
            if not items:
                connection.send_result(msg["id"], {"organizer_entity_id": None})
                return

            organizer_email = items[0].get("organizer", {}).get("email", "")
            if not organizer_email:
                connection.send_result(msg["id"], {"organizer_entity_id": None})
                return

            # Map organizer email → PlanaVista calendar entity_id
            entries = hass.config_entries.async_entries(DOMAIN)
            if entries:
                calendars = entries[0].data.get(CONF_CALENDARS, [])
                for cal_config in calendars:
                    cal_eid = cal_config.get("entity_id", "")
                    google_id = get_google_calendar_id(hass, cal_eid)
                    if google_id and google_id.lower() == organizer_email.lower():
                        connection.send_result(msg["id"], {
                            "organizer_entity_id": cal_eid,
                        })
                        return

            connection.send_result(msg["id"], {"organizer_entity_id": None})

    except Exception as err:
        _LOGGER.warning("PlanaVista: organizer lookup failed: %s", err)
        connection.send_result(msg["id"], {"organizer_entity_id": None})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/update_event",
        vol.Required("entity_id"): str,
        vol.Required("uid"): str,
        vol.Optional("summary"): str,
        vol.Optional("description"): str,
        vol.Optional("location"): str,
        vol.Optional("start_date_time"): str,
        vol.Optional("end_date_time"): str,
        vol.Optional("start_date"): str,
        vol.Optional("end_date"): str,
        vol.Optional("attendee_entity_ids"): [str],
    }
)
@websocket_api.async_response
async def ws_update_event(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Update a calendar event in-place via Google Calendar API PATCH.

    Preserves the event ID and attendee linking, unlike delete + recreate.
    """
    entity_id = msg["entity_id"]
    uid = msg["uid"]

    cal_id = get_google_calendar_id(hass, entity_id)
    if not cal_id:
        connection.send_error(msg["id"], "not_google", "Entity is not a Google Calendar")
        return

    access_token = await async_get_google_token(hass, entity_id)
    if not access_token:
        connection.send_error(msg["id"], "no_token", "Could not obtain Google OAuth token")
        return

    http_session = async_get_clientsession(hass)
    encoded_cal = urllib.parse.quote(cal_id, safe="")
    encoded_uid = urllib.parse.quote(uid, safe="")

    # Step 1: Find the Google event ID from the iCal UID
    list_url = (
        f"https://www.googleapis.com/calendar/v3/calendars/"
        f"{encoded_cal}/events?iCalUID={encoded_uid}&maxResults=1"
    )

    try:
        async with http_session.get(
            list_url,
            headers={"Authorization": f"Bearer {access_token}"},
        ) as resp:
            if resp.status != 200:
                text = await resp.text()
                connection.send_error(
                    msg["id"], "lookup_failed",
                    f"Failed to look up event: HTTP {resp.status}: {text}",
                )
                return
            data = await resp.json()
            items = data.get("items", [])
            if not items:
                connection.send_error(msg["id"], "not_found", "Event not found")
                return
            event_id = items[0]["id"]
    except Exception as err:
        connection.send_error(msg["id"], "lookup_error", str(err))
        return

    # Step 2: Build PATCH body
    body: dict = {}
    if "summary" in msg:
        body["summary"] = msg["summary"]
    if "description" in msg:
        body["description"] = msg["description"]
    if "location" in msg:
        body["location"] = msg["location"]

    tz = str(hass.config.time_zone) if hass.config.time_zone else "UTC"

    if msg.get("start_date"):
        body["start"] = {"date": msg["start_date"]}
        body["end"] = {"date": msg["end_date"]}
    elif msg.get("start_date_time"):
        body["start"] = {"dateTime": msg["start_date_time"], "timeZone": tz}
        body["end"] = {"dateTime": msg["end_date_time"], "timeZone": tz}

    if "attendee_entity_ids" in msg:
        attendee_emails = []
        # Include organizer's own email
        attendee_emails.append(cal_id)
        for att_id in msg["attendee_entity_ids"]:
            att_cal_id = get_google_calendar_id(hass, att_id)
            if att_cal_id:
                attendee_emails.append(att_cal_id)
        # Deduplicate while preserving order
        seen = set()
        unique_emails = []
        for email in attendee_emails:
            lower = email.lower()
            if lower not in seen:
                seen.add(lower)
                unique_emails.append(email)
        body["attendees"] = [{"email": email} for email in unique_emails]

    # Step 3: PATCH the event
    encoded_event = urllib.parse.quote(event_id, safe="")
    patch_url = (
        f"https://www.googleapis.com/calendar/v3/calendars/"
        f"{encoded_cal}/events/{encoded_event}?sendUpdates=all"
    )

    try:
        async with http_session.patch(
            patch_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=body,
        ) as resp:
            if resp.status not in (200, 201):
                text = await resp.text()
                connection.send_error(
                    msg["id"], "patch_failed",
                    f"Google Calendar API PATCH error {resp.status}: {text}",
                )
                return
            result = await resp.json()
            _LOGGER.info(
                "PlanaVista: updated event uid=%s (id=%s) on calendar %s",
                uid, event_id, cal_id,
            )
            connection.send_result(msg["id"], {"success": True, "event_id": result.get("id")})
    except Exception as err:
        _LOGGER.error("PlanaVista: update_event PATCH failed: %s", err)
        connection.send_error(msg["id"], "patch_error", str(err))
