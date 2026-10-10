"""Services and WebSocket commands for PlanaVista."""
from __future__ import annotations

from collections.abc import Iterable, Mapping
import logging
from typing import Any

import voluptuous as vol

from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.components import websocket_api
from homeassistant.components.calendar import (
    DOMAIN as CALENDAR_DOMAIN,
    CalendarEntityFeature,
)
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.core import Context, HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import (
    HomeAssistantError,
    ServiceValidationError,
    Unauthorized,
    UnknownUser,
)
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.service import async_register_admin_service

from .appearance import (
    APPEARANCE,
    APPEARANCE_KEYS,
    APPEARANCE_SWITCH,
    CLOCK_PATTERN,
    COLORS_DARK,
    COLORS_LIGHT,
    DARK_FROM,
    HEADER_PRESETS,
    LIGHT_FROM,
    MODES,
    MOTION,
    MOTIONS,
    PAIRS,
    SHAPE,
    SWITCHES,
    THEME_PAIR,
    with_legacy_theme,
)
from .const import (
    CALENDAR_VIEWS,
    CONF_CALENDARS,
    CONF_COLOR,
    CONF_COLOR_LIGHT,
    CONF_DEFAULT_VIEW,
    CONF_DISPLAY,
    CONF_DISPLAY_NAME,
    CONF_FIRST_DAY,
    CONF_ICON,
    CONF_LOCATION_AUTOCOMPLETE,
    CONF_ONBOARDING_COMPLETE,
    CONF_PERSON_ENTITY,
    CONF_THEME,
    CONF_THEME_OVERRIDES,
    CONF_TIME_FORMAT,
    CONF_VISIBLE,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    FIRST_DAY_MONDAY,
    FIRST_DAY_SUNDAY,
    SERVICE_CREATE_EVENT_WITH_ATTENDEES,
    SERVICE_DELETE_EVENT,
    SERVICE_SAVE_CONFIG,
    TIME_FORMAT_12H,
    TIME_FORMAT_24H,
)
from .coordinator import PlanaVistaConfigEntry, async_apply_config
from .google_api import (
    GoogleApiError,
    async_get_google_token,
    async_google_create_event,
    async_google_find_event,
    async_google_patch_event,
    get_google_calendar_id,
)
from .household.members import link_calendars
from .household.store import DATA_HOUSEHOLD, async_person_info

_LOGGER = logging.getLogger(__name__)

CALENDAR_ENTITY_ID = cv.entity_domain(CALENDAR_DOMAIN)

# Calendars and display settings are replaced wholesale by save_config. Keys
# the card adds later are kept (extra=ALLOW_EXTRA) so the card can evolve
# without a backend release.
CALENDAR_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): CALENDAR_ENTITY_ID,
        vol.Optional(CONF_DISPLAY_NAME): cv.string,
        vol.Optional(CONF_COLOR): cv.string,
        vol.Optional(CONF_COLOR_LIGHT): cv.string,
        vol.Optional(CONF_ICON): cv.string,
        vol.Optional(CONF_PERSON_ENTITY): vol.Any(None, cv.string),
        vol.Optional("member_id"): vol.Any(None, cv.string),
        vol.Optional(CONF_VISIBLE): cv.boolean,
    },
    extra=vol.ALLOW_EXTRA,
)

_HEX_COLOR = vol.Match(r"^#[0-9A-Fa-f]{6}$")

# One version's colors (spec 12.4). Later releases may add keys (spec 7.8).
THEME_COLORS_SCHEMA = vol.Schema(
    {
        vol.Optional("accent"): _HEX_COLOR,
        vol.Optional("background"): _HEX_COLOR,
        vol.Optional("header"): vol.Any("plain", vol.In(HEADER_PRESETS), _HEX_COLOR),
        vol.Optional("now_color"): _HEX_COLOR,
    },
    extra=vol.ALLOW_EXTRA,
)

# Shape settings, shared by both versions. "light" is 1.1.0's spelling of "white".
THEME_SHAPE_SCHEMA = vol.Schema(
    {
        vol.Optional("corner_style"): vol.In(["sharp", "rounded", "pill"]),
        vol.Optional("shadow_depth"): vol.In(["none", "subtle", "bold"]),
        vol.Optional("event_style"): vol.In(["stripes", "solid"]),
        vol.Optional("avatar_border"): vol.Any(vol.In(["primary", "white", "light"]), _HEX_COLOR),
    },
    extra=vol.ALLOW_EXTRA,
)

DISPLAY_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_TIME_FORMAT): vol.In([TIME_FORMAT_12H, TIME_FORMAT_24H]),
        vol.Optional(CONF_WEATHER_ENTITY): vol.Any(None, "", cv.entity_domain("weather")),
        vol.Optional(CONF_FIRST_DAY): vol.In([FIRST_DAY_MONDAY, FIRST_DAY_SUNDAY]),
        vol.Optional(CONF_DEFAULT_VIEW): vol.In(CALENDAR_VIEWS),
        vol.Optional(CONF_THEME): cv.string,
        vol.Optional(CONF_THEME_OVERRIDES): vol.Any(None, dict),
        vol.Optional(CONF_LOCATION_AUTOCOMPLETE): cv.boolean,
        vol.Optional(APPEARANCE): vol.Any(None, vol.In(MODES)),
        vol.Optional(APPEARANCE_SWITCH): vol.Any(None, vol.In(SWITCHES)),
        vol.Optional(LIGHT_FROM): vol.Any(None, vol.Match(CLOCK_PATTERN)),
        vol.Optional(DARK_FROM): vol.Any(None, vol.Match(CLOCK_PATTERN)),
        vol.Optional(THEME_PAIR): vol.Any(None, vol.In(PAIRS)),
        vol.Optional(COLORS_LIGHT): vol.Any(None, THEME_COLORS_SCHEMA),
        vol.Optional(COLORS_DARK): vol.Any(None, THEME_COLORS_SCHEMA),
        vol.Optional(SHAPE): vol.Any(None, THEME_SHAPE_SCHEMA),
        vol.Optional(MOTION): vol.Any(None, vol.In(MOTIONS)),
    },
    extra=vol.ALLOW_EXTRA,
)

SAVE_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_CALENDARS): [CALENDAR_CONFIG_SCHEMA],
        vol.Optional(CONF_DISPLAY): DISPLAY_SCHEMA,
        vol.Optional(CONF_ONBOARDING_COMPLETE): cv.boolean,
    }
)

DELETE_EVENT_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): CALENDAR_ENTITY_ID,
        vol.Required("uid"): cv.string,
        vol.Optional("recurrence_id"): vol.Any(None, cv.string),
    }
)

CREATE_EVENT_SCHEMA = vol.All(
    vol.Schema(
        {
            vol.Required("entity_id"): CALENDAR_ENTITY_ID,
            vol.Optional("attendee_entity_ids", default=list): vol.All(
                cv.ensure_list, [CALENDAR_ENTITY_ID]
            ),
            vol.Required("summary"): cv.string,
            vol.Optional("description"): cv.string,
            vol.Optional("location"): cv.string,
            vol.Inclusive("start_date_time", "datetime"): cv.string,
            vol.Inclusive("end_date_time", "datetime"): cv.string,
            vol.Inclusive("start_date", "date"): cv.string,
            vol.Inclusive("end_date", "date"): cv.string,
        }
    ),
    cv.has_at_least_one_key("start_date_time", "start_date"),
)


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register PlanaVista services and WebSocket commands (once per HA start)."""
    async_register_admin_service(
        hass, DOMAIN, SERVICE_SAVE_CONFIG, _async_save_config, SAVE_CONFIG_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_DELETE_EVENT, _async_delete_event, DELETE_EVENT_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_EVENT_WITH_ATTENDEES,
        _async_create_event_with_attendees,
        CREATE_EVENT_SCHEMA,
    )
    websocket_api.async_register_command(hass, ws_get_event_organizer)
    websocket_api.async_register_command(hass, ws_update_event)


@callback
def _async_get_loaded_entry(hass: HomeAssistant) -> PlanaVistaConfigEntry:
    """Return the loaded PlanaVista entry or explain that there is none."""
    entries: list[PlanaVistaConfigEntry] = hass.config_entries.async_loaded_entries(
        DOMAIN
    )
    if not entries:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="not_loaded"
        )
    return entries[0]


@callback
def _async_configured_calendar_ids(hass: HomeAssistant) -> set[str]:
    """Return the calendar entity ids configured in PlanaVista."""
    return {
        calendar["entity_id"]
        for entry in hass.config_entries.async_loaded_entries(DOMAIN)
        for calendar in entry.data.get(CONF_CALENDARS, [])
        if calendar.get("entity_id")
    }


@callback
def _async_check_configured(hass: HomeAssistant, entity_ids: Iterable[str]) -> None:
    """Refuse calendars that PlanaVista is not configured to show."""
    configured = _async_configured_calendar_ids(hass)
    for entity_id in entity_ids:
        if entity_id not in configured:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="calendar_not_configured",
                translation_placeholders={"entity_id": entity_id},
            )


async def _async_check_control(
    hass: HomeAssistant, context: Context, entity_ids: Iterable[str]
) -> None:
    """Require control permission on each calendar, as calendar services do.

    Calls without a user (automations, scripts) are allowed. Admin and
    regular users have control permission; read-only users do not.
    """
    if context.user_id is None:
        return
    user = await hass.auth.async_get_user(context.user_id)
    if user is None:
        raise UnknownUser(context=context, permission=POLICY_CONTROL)
    for entity_id in entity_ids:
        if not user.permissions.check_entity(entity_id, POLICY_CONTROL):
            raise Unauthorized(
                context=context, entity_id=entity_id, permission=POLICY_CONTROL
            )


async def async_store_config(
    hass: HomeAssistant,
    changes: Mapping[str, Any],
    *,
    merge_display: bool = False,
    entry: PlanaVistaConfigEntry | None = None,
) -> None:
    """Save calendars, display settings, and onboarding_complete.

    The save_config action, the card's planavista/config/save, and the
    options flow (which names its `entry`, loaded or not) all come here.
    The action replaces the display settings; the card merges them
    (`merge_display`), so each Settings page sends only what it changed and
    one page's save can't undo another's. A None value removes a setting.
    A save that changes an appearance setting writes every appearance key and
    rewrites 1.1.0's theme and theme_overrides from them.
    A calendar newly linked to a Home Assistant person joins that person's
    member, who is added when needed (spec section 7.2).
    """
    if entry is None:
        entry = _async_get_loaded_entry(hass)
    new_data = dict(entry.data)
    if CONF_CALENDARS in changes:
        new_data[CONF_CALENDARS] = [dict(cal) for cal in changes[CONF_CALENDARS]]
    if CONF_DISPLAY in changes:
        display = dict(changes[CONF_DISPLAY])
        if merge_display:
            merged = {**entry.data.get(CONF_DISPLAY, {}), **display}
            display = {key: value for key, value in merged.items() if value is not None}
        if any(key in changes[CONF_DISPLAY] for key in APPEARANCE_KEYS):
            # 1.1.0's theme keys follow the new ones, so a rollback shows this look (spec 7.8).
            display = with_legacy_theme(display)
        new_data[CONF_DISPLAY] = display
    if CONF_ONBOARDING_COMPLETE in changes:
        new_data[CONF_ONBOARDING_COMPLETE] = changes[CONF_ONBOARDING_COMPLETE]

    household = hass.data.get(DATA_HOUSEHOLD)
    if household is not None and household.available and CONF_CALENDARS in changes:
        linked_before = {
            cal.get("entity_id"): cal.get("person_entity")
            for cal in entry.data.get(CONF_CALENDARS, [])
        }
        newly_linked = {
            cal["person_entity"]
            for cal in new_data[CONF_CALENDARS]
            if cal.get("person_entity")
            and linked_before.get(cal.get("entity_id")) != cal["person_entity"]
        }
        rows, members = link_calendars(
            new_data[CONF_CALENDARS],
            household.members,
            await async_person_info(hass),
            newly_linked,
        )
        new_data[CONF_CALENDARS] = rows
        if members != household.members:
            household.members = members
            await household.async_save()

    await async_apply_config(hass, entry, new_data)


async def _async_save_config(call: ServiceCall) -> None:
    """Save the settings sent by an admin or an automation."""
    await async_store_config(call.hass, call.data)
    entry = _async_get_loaded_entry(call.hass)
    _LOGGER.info(
        "PlanaVista config saved via save_config service (calendars=%d, onboarding=%s)",
        len(entry.data.get(CONF_CALENDARS, [])),
        entry.data.get(CONF_ONBOARDING_COMPLETE),
    )


async def _async_delete_event(call: ServiceCall) -> None:
    """Delete a calendar event by UID via direct entity access."""
    hass = call.hass
    entity_id: str = call.data["entity_id"]
    uid: str = call.data["uid"]
    recurrence_id: str | None = call.data.get("recurrence_id") or None

    _async_check_configured(hass, [entity_id])
    await _async_check_control(hass, call.context, [entity_id])

    component = hass.data.get(DATA_COMPONENT)
    entity = component.get_entity(entity_id) if component else None
    if entity is None:
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="calendar_unavailable",
            translation_placeholders={"entity_id": entity_id},
        )
    if not (entity.supported_features or 0) & CalendarEntityFeature.DELETE_EVENT:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="delete_not_supported",
            translation_placeholders={"entity_id": entity_id},
        )

    kwargs: dict[str, Any] = {"uid": uid}
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
    entity_id: str = call.data["entity_id"]
    attendee_entity_ids: list[str] = call.data["attendee_entity_ids"]

    _async_check_configured(hass, [entity_id, *attendee_entity_ids])
    await _async_check_control(hass, call.context, [entity_id, *attendee_entity_ids])

    _LOGGER.debug(
        "PlanaVista: create_event_with_attendees called: "
        "organizer=%s, attendees=%s",
        entity_id, attendee_entity_ids,
    )

    event_data = {
        "summary": call.data["summary"],
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
                    await _async_create_event_via_ha(
                        hass, att_id, event_data, call.context
                    )

                return
            except GoogleApiError as err:
                if err.status is None:
                    # A timeout or network error: Google may still have created the
                    # event, so creating copies could duplicate it.
                    raise HomeAssistantError(
                        translation_domain=DOMAIN,
                        translation_key="create_outcome_unknown",
                    ) from err
                _LOGGER.warning(
                    "Google Calendar could not create the event on %s; "
                    "creating a separate event on each calendar instead: %s",
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
    await _async_create_event_via_ha(hass, entity_id, event_data, call.context)
    for att_id in attendee_entity_ids:
        await _async_create_event_via_ha(hass, att_id, event_data, call.context)


async def _async_create_event_via_ha(
    hass: HomeAssistant, entity_id: str, event_data: dict, context: Context
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
        context=context,
    )


@callback
def _async_ws_check_calendars(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    entity_ids: list[str],
) -> bool:
    """Send an error and return False unless every calendar is configured."""
    configured = _async_configured_calendar_ids(hass)
    for entity_id in entity_ids:
        if entity_id not in configured:
            connection.send_error(
                msg["id"],
                "not_configured",
                f"{entity_id} is not a calendar configured in PlanaVista",
            )
            return False
    return True


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

    if not _async_ws_check_calendars(hass, connection, msg, [entity_id]):
        return

    cal_id = get_google_calendar_id(hass, entity_id)
    if not cal_id:
        connection.send_result(msg["id"], {"organizer_entity_id": None})
        return

    access_token = await async_get_google_token(hass, entity_id)
    if not access_token:
        connection.send_result(msg["id"], {"organizer_entity_id": None})
        return

    try:
        event = await async_google_find_event(hass, access_token, cal_id, uid)
    except GoogleApiError as err:
        _LOGGER.debug("Organizer lookup for uid=%s failed: %s", uid, err)
        connection.send_result(msg["id"], {"organizer_entity_id": None})
        return

    organizer_email = ((event or {}).get("organizer") or {}).get("email", "")
    if organizer_email:
        # Map organizer email → PlanaVista calendar entity_id
        for cal_eid in sorted(_async_configured_calendar_ids(hass)):
            google_id = get_google_calendar_id(hass, cal_eid)
            if google_id and google_id.lower() == organizer_email.lower():
                connection.send_result(msg["id"], {"organizer_entity_id": cal_eid})
                return

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
    attendee_entity_ids: list[str] = msg.get("attendee_entity_ids", [])

    if not _async_ws_check_calendars(
        hass, connection, msg, [entity_id, *attendee_entity_ids]
    ):
        return
    for checked_id in (entity_id, *attendee_entity_ids):
        if not connection.user.permissions.check_entity(checked_id, POLICY_CONTROL):
            raise Unauthorized(
                context=connection.context(msg),
                entity_id=checked_id,
                permission=POLICY_CONTROL,
            )

    cal_id = get_google_calendar_id(hass, entity_id)
    if not cal_id:
        connection.send_error(msg["id"], "not_google", "Entity is not a Google Calendar")
        return

    access_token = await async_get_google_token(hass, entity_id)
    if not access_token:
        connection.send_error(msg["id"], "no_token", "Could not obtain Google OAuth token")
        return

    # Step 1: Find the Google event ID from the iCal UID
    try:
        event = await async_google_find_event(hass, access_token, cal_id, uid)
    except GoogleApiError as err:
        connection.send_error(
            msg["id"],
            "lookup_failed" if err.status else "lookup_error",
            f"Failed to look up event: {err}",
        )
        return
    if event is None:
        connection.send_error(msg["id"], "not_found", "Event not found")
        return
    event_id = event["id"]

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
    try:
        result = await async_google_patch_event(
            hass, access_token, cal_id, event_id, body
        )
    except GoogleApiError as err:
        _LOGGER.error("PlanaVista: update_event PATCH failed: %s", err)
        connection.send_error(
            msg["id"], "patch_failed" if err.status else "patch_error", str(err)
        )
        return

    _LOGGER.info(
        "PlanaVista: updated event uid=%s (id=%s) on calendar %s",
        uid, event_id, cal_id,
    )
    connection.send_result(msg["id"], {"success": True, "event_id": result.get("id")})
