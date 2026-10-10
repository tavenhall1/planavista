"""Tests for PlanaVista services and WebSocket commands: validation and permissions."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser
from pytest_homeassistant_custom_component.typing import WebSocketGenerator
import voluptuous as vol

from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.components.calendar import CalendarEvent
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from custom_components.planavista.const import DOMAIN

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair; Casey stays unconfigured."""
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
async def regular_user(hass: HomeAssistant, local_auth: Any) -> MockUser:
    """A non-admin user, like the account a wall tablet signs in with."""
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    return MockUser(groups=[group]).add_to_hass(hass)


def _timed_event(**extra: Any) -> dict[str, Any]:
    start = dt_util.now().replace(microsecond=0) + timedelta(hours=1)
    return {
        "summary": "Dentist",
        "start_date_time": start.isoformat(),
        "end_date_time": (start + timedelta(hours=1)).isoformat(),
        **extra,
    }


async def test_save_config_requires_admin(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, regular_user: MockUser
) -> None:
    """A non-admin user cannot change PlanaVista's settings."""
    before = dict(loaded_entry.data)

    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            DOMAIN,
            "save_config",
            {"onboarding_complete": False},
            blocking=True,
            context=Context(user_id=regular_user.id),
        )

    assert dict(loaded_entry.data) == before


async def test_save_config_keeps_new_and_unknown_display_keys(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, hass_admin_user: MockUser
) -> None:
    """An admin can save; location_autocomplete, theme_overrides and future keys persist."""
    display = {
        **DEFAULT_ENTRY_DATA["display"],
        "location_autocomplete": True,
        "theme_overrides": {"accent": "#277DA1", "corner_style": "pill"},
        "future_setting": "kept",
    }

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"display": display, "calendars": [CONFIGURED_CALENDARS[0]]},
        blocking=True,
        context=Context(user_id=hass_admin_user.id),
    )
    await hass.async_block_till_done()

    assert loaded_entry.data["display"] == display
    assert loaded_entry.data["calendars"] == [CONFIGURED_CALENDARS[0]]
    state = hass.states.get("sensor.planavista_config")
    assert state.attributes["display"]["location_autocomplete"] is True


async def test_save_config_accepts_the_wizard_payload(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, hass_admin_user: MockUser
) -> None:
    """The exact shape the onboarding wizard sends is accepted and reaches the sensor."""
    calendars = [
        {
            "entity_id": "calendar.test_alex",
            "display_name": "Alex",
            "color": "#fb8072",
            "color_light": "#fde0dd",
            "icon": "mdi:account",
            "person_entity": "",
            "visible": True,
        },
        {
            "entity_id": "calendar.test_blair",
            "display_name": "Blair",
            "color": "#80b1d3",
            "color_light": "#dbe9f4",
            "icon": "mdi:account",
            "person_entity": "",
            "visible": False,
        },
    ]
    display = {
        "time_format": "24h",
        "weather_entity": "",
        "first_day": "sunday",
        "default_view": "agenda",
        "theme": "midnight",
        "theme_overrides": {"accent": "#277DA1", "corner_style": "pill"},
        "location_autocomplete": False,
    }

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"calendars": calendars, "display": display, "onboarding_complete": True},
        blocking=True,
        context=Context(user_id=hass_admin_user.id),
    )
    await hass.async_block_till_done()

    assert loaded_entry.data["calendars"] == calendars
    assert loaded_entry.data["display"] == display
    assert loaded_entry.data["onboarding_complete"] is True
    attrs = hass.states.get("sensor.planavista_config").attributes
    # The sensor adds live state to each calendar; every saved field must come through unchanged
    assert [{k: cal[k] for k in expected} for cal, expected in zip(attrs["calendars"], calendars)] == calendars
    assert attrs["display"] == display
    assert attrs["onboarding_complete"] is True


async def test_save_config_gives_a_newly_linked_calendar_its_person(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, hass_admin_user: MockUser
) -> None:
    """Linking a calendar to a person adds that person to the household."""
    from custom_components.planavista.household.store import DATA_HOUSEHOLD

    hass.states.async_set("person.casey", "home", {"friendly_name": "Casey"})
    calendars = deepcopy(CONFIGURED_CALENDARS)
    calendars[1]["person_entity"] = "person.casey"
    calendars[0]["member_id"] = "nobody_by_this_id"

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"calendars": calendars},
        blocking=True,
        context=Context(user_id=hass_admin_user.id),
    )

    rows = loaded_entry.data["calendars"]
    assert [row["member_id"] for row in rows] == [None, "casey"]
    casey = hass.data[DATA_HOUSEHOLD].member("casey")
    assert casey["person"] == "person.casey" and casey["parent"] is False


@pytest.mark.parametrize(
    "payload",
    [
        {"calendars": [{"display_name": "No entity id"}]},
        {"calendars": [{"entity_id": "sensor.not_a_calendar"}]},
        {"calendars": "calendar.test_alex"},
        {"display": "dark"},
        {"display": {"time_format": "13h"}},
        {"display": {"location_autocomplete": "sometimes"}},
        {"onboarding_complete": "maybe"},
        {"unexpected": True},
    ],
)
async def test_save_config_rejects_malformed_data(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, payload: dict[str, Any]
) -> None:
    """Malformed settings are refused before anything is stored."""
    before = dict(loaded_entry.data)

    with pytest.raises(vol.Invalid):
        await hass.services.async_call(DOMAIN, "save_config", payload, blocking=True)

    assert dict(loaded_entry.data) == before


async def test_save_config_without_entry(hass: HomeAssistant) -> None:
    """save_config explains that PlanaVista is not set up."""
    assert await async_setup_component(hass, DOMAIN, {})

    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, "save_config", {"onboarding_complete": True}, blocking=True
        )

    assert err.value.translation_key == "not_loaded"


async def test_regular_user_can_delete_event(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    regular_user: MockUser,
) -> None:
    """Non-admin users (wall tablets) can delete events on configured calendars."""
    now = dt_util.now()
    setup_calendars["calendar.test_alex"].events.append(
        CalendarEvent(
            uid="alex-1",
            summary="Swim practice",
            start=now + timedelta(hours=1),
            end=now + timedelta(hours=2),
        )
    )

    await hass.services.async_call(
        DOMAIN,
        "delete_event",
        {"entity_id": "calendar.test_alex", "uid": "alex-1", "recurrence_id": ""},
        blocking=True,
        context=Context(user_id=regular_user.id),
    )

    assert setup_calendars["calendar.test_alex"].events == []


async def test_regular_user_can_create_event_with_attendees(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    regular_user: MockUser,
) -> None:
    """Non-Google calendars get one event each, created as the calling user."""
    await hass.services.async_call(
        DOMAIN,
        "create_event_with_attendees",
        _timed_event(
            entity_id="calendar.test_alex",
            attendee_entity_ids=["calendar.test_blair"],
            location="Main St",
        ),
        blocking=True,
        context=Context(user_id=regular_user.id),
    )

    for entity_id in ("calendar.test_alex", "calendar.test_blair"):
        events = setup_calendars[entity_id].events
        assert [(ev.summary, ev.location) for ev in events] == [("Dentist", "Main St")]
    assert setup_calendars["calendar.test_casey"].events == []


@pytest.mark.parametrize(
    ("service", "data"),
    [
        ("delete_event", {"entity_id": "calendar.test_casey", "uid": "casey-1"}),
        ("create_event_with_attendees", _timed_event(entity_id="calendar.test_casey")),
        (
            "create_event_with_attendees",
            _timed_event(
                entity_id="calendar.test_alex",
                attendee_entity_ids=["calendar.test_casey"],
            ),
        ),
    ],
)
async def test_event_services_reject_unconfigured_calendar(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    service: str,
    data: dict[str, Any],
) -> None:
    """Calendars that are not configured in PlanaVista are refused."""
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(DOMAIN, service, data, blocking=True)

    assert err.value.translation_key == "calendar_not_configured"
    assert err.value.translation_placeholders == {"entity_id": "calendar.test_casey"}
    for calendar in setup_calendars.values():
        assert calendar.events == []


async def test_read_only_user_cannot_delete_event(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    setup_calendars: dict[str, FakeCalendar],
    hass_read_only_user: MockUser,
) -> None:
    """Users without control permission cannot delete events."""
    now = dt_util.now()
    event = CalendarEvent(
        uid="alex-1",
        summary="Swim practice",
        start=now + timedelta(hours=1),
        end=now + timedelta(hours=2),
    )
    setup_calendars["calendar.test_alex"].events.append(event)

    with pytest.raises(Unauthorized):
        await hass.services.async_call(
            DOMAIN,
            "delete_event",
            {"entity_id": "calendar.test_alex", "uid": "alex-1"},
            blocking=True,
            context=Context(user_id=hass_read_only_user.id),
        )

    assert setup_calendars["calendar.test_alex"].events == [event]


@pytest.mark.parametrize(
    ("service", "data"),
    [
        ("delete_event", {"entity_id": "calendar.test_alex"}),
        ("create_event_with_attendees", {"entity_id": "calendar.test_alex", "summary": "No times"}),
        (
            "create_event_with_attendees",
            {
                "entity_id": "calendar.test_alex",
                "summary": "Half a range",
                "start_date": "2026-10-09",
            },
        ),
    ],
)
async def test_event_services_validate_fields(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    service: str,
    data: dict[str, Any],
) -> None:
    """Missing or half-specified fields are refused by the schema."""
    with pytest.raises(vol.Invalid):
        await hass.services.async_call(DOMAIN, service, data, blocking=True)


@pytest.mark.parametrize(
    "message",
    [
        {"type": "planavista/get_event_organizer", "entity_id": "calendar.test_casey", "uid": "x"},
        {"type": "planavista/update_event", "entity_id": "calendar.test_casey", "uid": "x"},
        {
            "type": "planavista/update_event",
            "entity_id": "calendar.test_alex",
            "uid": "x",
            "attendee_entity_ids": ["calendar.test_casey"],
        },
    ],
)
async def test_ws_commands_reject_unconfigured_calendar(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    hass_ws_client: WebSocketGenerator,
    message: dict[str, Any],
) -> None:
    """WebSocket commands only act on calendars configured in PlanaVista."""
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(message)
    response = await client.receive_json()

    assert response["success"] is False
    assert response["error"]["code"] == "not_configured"
