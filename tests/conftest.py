"""Shared fixtures for the PlanaVista tests."""
from __future__ import annotations

from copy import deepcopy
import datetime
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import (
    CLIENT_ID,
    MockConfigEntry,
    MockUser,
    setup_test_component_platform,
)

from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.components.calendar import (
    DOMAIN as CALENDAR_DOMAIN,
    CalendarEntity,
    CalendarEntityFeature,
    CalendarEvent,
)
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

# Import the integration before any test runs. Home Assistant mounts its own
# testing_config/custom_components package during setup, and whichever
# `custom_components` package is imported first is the one the loader scans.
from custom_components.planavista.const import DOMAIN

DEFAULT_ENTRY_DATA: dict[str, Any] = {
    "calendars": [],
    "display": {
        "time_format": "12h",
        "weather_entity": "",
        "first_day": "monday",
        "default_view": "week",
        "theme": "planavista",
    },
    "onboarding_complete": False,
}

# Calendars configured in PlanaVista. calendar.test_casey exists in Home
# Assistant but is deliberately left out of the PlanaVista configuration.
CONFIGURED_CALENDARS: list[dict[str, Any]] = [
    {
        "entity_id": "calendar.test_alex",
        "display_name": "Alex",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_blair",
        "display_name": "Blair",
        "color": "#277DA1",
        "color_light": "#B3D2DE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
]


class FakeCalendar(CalendarEntity):
    """In-memory calendar entity that supports creating and deleting events."""

    _attr_supported_features = (
        CalendarEntityFeature.CREATE_EVENT | CalendarEntityFeature.DELETE_EVENT
    )

    def __init__(self, name: str) -> None:
        """Create an empty calendar; the entity id is derived from the name."""
        self._attr_name = name
        self.events: list[CalendarEvent] = []

    @property
    def event(self) -> CalendarEvent | None:
        """Report no current event, so the entity schedules no state timers."""
        return None

    async def async_get_events(
        self,
        hass: HomeAssistant,
        start_date: datetime.datetime,
        end_date: datetime.datetime,
    ) -> list[CalendarEvent]:
        """Return events that overlap the window."""
        return [
            ev
            for ev in self.events
            if ev.start_datetime_local < end_date and ev.end_datetime_local > start_date
        ]

    async def async_create_event(self, **kwargs: Any) -> None:
        """Store a new event."""
        self.events.append(
            CalendarEvent(
                uid=f"{self.entity_id}-{len(self.events) + 1}",
                summary=kwargs["summary"],
                start=kwargs["dtstart"],
                end=kwargs["dtend"],
                description=kwargs.get("description"),
                location=kwargs.get("location"),
            )
        )

    async def async_delete_event(
        self,
        uid: str,
        recurrence_id: str | None = None,
        recurrence_range: str | None = None,
    ) -> None:
        """Remove an event by uid."""
        self.events = [ev for ev in self.events if ev.uid != uid]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Let Home Assistant load custom_components/planavista in every test."""


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Return the data for the PlanaVista config entry (override per test module)."""
    return deepcopy(DEFAULT_ENTRY_DATA)


@pytest.fixture
def config_entry_minor_version() -> int:
    """The entry's minor version: this release's (a test module overrides it to test an upgrade)."""
    return 2


@pytest.fixture
def mock_config_entry(
    hass: HomeAssistant, config_entry_data: dict[str, Any], config_entry_minor_version: int
) -> MockConfigEntry:
    """Add a PlanaVista config entry to hass without setting it up."""
    entry = MockConfigEntry(
        domain=DOMAIN, title="PlanaVista", data=config_entry_data, minor_version=config_entry_minor_version
    )
    entry.add_to_hass(hass)
    return entry


@pytest.fixture
def fake_calendars() -> dict[str, FakeCalendar]:
    """Return the fake calendars keyed by the entity id they will get."""
    return {
        "calendar.test_alex": FakeCalendar("Test Alex"),
        "calendar.test_blair": FakeCalendar("Test Blair"),
        "calendar.test_casey": FakeCalendar("Test Casey"),
    }


async def async_load_calendars(
    hass: HomeAssistant, calendars: dict[str, FakeCalendar]
) -> None:
    """Load the calendar component with the given fake calendars."""
    setup_test_component_platform(hass, CALENDAR_DOMAIN, list(calendars.values()))
    assert await async_setup_component(
        hass, CALENDAR_DOMAIN, {CALENDAR_DOMAIN: {"platform": "test"}}
    )
    await hass.async_block_till_done()


@pytest.fixture
async def setup_calendars(
    hass: HomeAssistant, fake_calendars: dict[str, FakeCalendar]
) -> dict[str, FakeCalendar]:
    """Load the calendar component with the fake calendars before the test runs."""
    await async_load_calendars(hass, fake_calendars)
    return fake_calendars


@pytest.fixture
async def accounts(
    hass: HomeAssistant, hass_admin_user: MockUser, local_auth: Any
) -> dict[str, MockUser]:
    """The sample household's Home Assistant accounts.

    admin is linked to no one. alex and casey are their own logins, linked
    through their people. kitchen is the wall tablet. guest is linked to no
    one and isn't an admin. Blair has a person but no login.
    """
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    users = {"admin": hass_admin_user}
    for name in ("alex", "casey", "kitchen", "guest"):
        users[name] = MockUser(name=name.title(), groups=[group]).add_to_hass(hass)
    hass.states.async_set(
        "person.alex", "home", {"friendly_name": "Alex", "user_id": users["alex"].id}
    )
    hass.states.async_set(
        "person.casey", "home", {"friendly_name": "Casey", "user_id": users["casey"].id}
    )
    hass.states.async_set("person.blair", "not_home", {"friendly_name": "Blair"})
    return users


@pytest.fixture
async def household(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    accounts: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> Any:
    """PlanaVista with the sample household: parents Alex and Blair, Casey (teen), Dana (6)."""
    from custom_components.planavista.household.members import add_member
    from custom_components.planavista.household.store import DATA_HOUSEHOLD

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    household = hass.data[DATA_HOUSEHOLD]
    members: list[dict[str, Any]] = []
    for changes in (
        {"name": "Alex", "parent": True, "person": "person.alex"},
        {"name": "Blair", "parent": True, "person": "person.blair"},
        {"name": "Casey", "age_group": "teen", "person": "person.casey"},
        {"name": "Dana", "age_group": "young_child"},
    ):
        members, _ = add_member(members, changes)
    household.members = members
    await household.async_save()
    return household


async def set_pin(hass: HomeAssistant, household: Any, member_id: str, pin: str) -> None:
    """Give a member a PIN without going through the card."""
    from custom_components.planavista.household.security import hash_pin

    household.pins[member_id] = await hass.async_add_executor_job(hash_pin, pin)
    await household.async_save()


async def ws_client_for(hass: HomeAssistant, hass_ws_client: Any, user: MockUser) -> Any:
    """A WebSocket client signed in as `user`."""
    refresh_token = await hass.auth.async_create_refresh_token(user, CLIENT_ID)
    return await hass_ws_client(hass, hass.auth.async_create_access_token(refresh_token))


async def ws_command(
    client: Any, fields: dict[str, Any], seen: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    """Send a command and return its result, skipping (and keeping) subscription events."""
    message = dict(fields)
    await client.send_json_auto_id(message)
    while True:
        reply = await client.receive_json()
        if seen is not None:
            seen.append(reply)
        if reply.get("id") == message["id"] and reply.get("type") == "result":
            return reply
