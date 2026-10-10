# Provider Abstraction Layer: Design Document

**Date:** 2026-02-27
**Status:** Approved
**Scope:** Phase 1, Abstraction + Google adapter (Path 1: piggyback on HA integrations)

---

## Problem

PlanaVista's deep Google Calendar features (attendees, PATCH edits, organizer detection) are implemented as inline code in `__init__.py` with hardcoded `platform == "google"` checks and `googleapis.com` URLs. This makes it impossible to add support for other calendar providers without duplicating logic, and obscures the boundary between generic HA calendar operations and provider-specific API calls.

## Goals

1. Extract all provider-specific code behind a clean abstract interface
2. Make adding a new provider a single-file task with no changes to routing code
3. Preserve all existing behavior: no functional changes
4. Keep the frontend completely provider-agnostic (it already is)
5. Document the extension process so future providers have a clear blueprint

## Non-Goals (deferred to later phases)

- Implementing a second provider (Outlook, CalDAV, etc.)
- PlanaVista-native calendar entities (Path 2, PlanaVista owns OAuth and creates `calendar.*` entities)
- Availability/free-busy checking across providers

---

## Architecture

### Hybrid Model

PlanaVista supports two paths to deep calendar integration:

**Path 1 (this phase):** PlanaVista detects existing HA calendar integrations (e.g., HA's Google Calendar) and piggybacks on their OAuth tokens to make enhanced API calls.

**Path 2 (future):** Users configure API credentials directly in PlanaVista. PlanaVista creates `calendar.*` entities that HA and other integrations can consume. Same provider interface, different token source.

Both paths use the same provider abstraction. The difference is internal to each adapter's `detect()` and `get_token()` methods.

### Cross-Provider Invites

The system uses an organizer-centric model that mirrors how email-based calendaring (iCal/RFC 5545) works:

1. The organizer's provider adapter handles create/edit/delete via its API
2. Attendees on other providers receive invites via standard iCal email (sent by the organizer's provider)
3. PlanaVista refreshes data from HA to reflect changes on all calendars

Example: Google organizer invites Outlook attendee → Google API creates the event with the Outlook user's email → Google sends iCal invite → Outlook processes it natively → HA's next poll picks up the event on both calendars.

The provider interface includes symmetric hook points for attendee-side operations (future use), but the organizer's adapter does the heavy lifting.

---

## File Structure

```
custom_components/planavista/
  providers/
    __init__.py    # Provider registry + resolve_provider()
    base.py        # CalendarProvider abstract base class
    google.py      # Google Calendar adapter (extracted from __init__.py)
  __init__.py      # Thin router: delegates to providers via registry
```

---

## Provider Interface

```python
# providers/base.py

from abc import ABC, abstractmethod
from homeassistant.core import HomeAssistant


class CalendarProvider(ABC):
    """Abstract base class for calendar provider adapters.

    Each provider implements detection, authentication, and the five
    calendar operations that go beyond standard HA services.
    """

    @staticmethod
    @abstractmethod
    def detect(hass: HomeAssistant, entity_id: str) -> bool:
        """Return True if this entity belongs to this provider.

        Called during provider resolution. Should check the entity
        registry platform field (e.g., "google", "microsoft").
        """

    @abstractmethod
    async def get_calendar_id(
        self, hass: HomeAssistant, entity_id: str
    ) -> str | None:
        """Extract the provider-specific calendar ID.

        For Google, this is the calendar email address.
        For Outlook, this could be the calendar UPN or Graph ID.
        Returns None if the ID cannot be determined.
        """

    @abstractmethod
    async def get_token(
        self, hass: HomeAssistant, entity_id: str
    ) -> str | None:
        """Obtain a valid API access token for this entity's account.

        Handles token refresh if needed. Returns None if authentication
        fails, which signals the caller to fall back to generic HA services.
        """

    @abstractmethod
    async def create_event_with_attendees(
        self,
        hass: HomeAssistant,
        organizer_id: str,
        attendee_ids: list[str],
        event_data: dict,
    ) -> dict:
        """Create an event on the organizer's calendar and invite attendees.

        The adapter should:
        1. Resolve attendee entity IDs to provider-specific identifiers (emails)
        2. Create the event via the provider's API with attendees attached
        3. Return fallback_ids for any attendees it couldn't invite via API
           (those will be created as separate events via generic HA services)

        Returns: {"success": bool, "fallback_ids": [str]}
        """

    @abstractmethod
    async def get_event_organizer(
        self, hass: HomeAssistant, entity_id: str, ical_uid: str
    ) -> str | None:
        """Look up the true organizer of a shared event.

        Queries the provider's API using the iCal UID to find who
        created the event. Returns the organizer's entity_id if it
        maps to a known PlanaVista calendar, or None.
        """

    @abstractmethod
    async def update_event(
        self,
        hass: HomeAssistant,
        entity_id: str,
        ical_uid: str,
        changes: dict,
        attendee_ids: list[str] | None = None,
    ) -> bool:
        """Update an event in-place via the provider's API.

        Uses PATCH (or equivalent) to preserve event links and attendee
        relationships. Returns True on success, False to signal the caller
        to fall back to delete+recreate.
        """
```

---

## Provider Registry

```python
# providers/__init__.py

from .base import CalendarProvider
from .google import GoogleCalendarProvider

PROVIDERS: dict[str, CalendarProvider] = {
    "google": GoogleCalendarProvider(),
}


def resolve_provider(hass, entity_id: str) -> CalendarProvider | None:
    """Find the provider adapter for a calendar entity.

    Iterates registered providers and returns the first one whose
    detect() returns True. Returns None for entities without a
    provider adapter (handled via generic HA services).
    """
    for provider in PROVIDERS.values():
        if provider.detect(hass, entity_id):
            return provider
    return None
```

---

## Google Adapter

`providers/google.py` is a direct extraction of existing code from `__init__.py`:

| Current function | Becomes |
|---|---|
| `_get_google_calendar_id()` | `GoogleCalendarProvider.get_calendar_id()` |
| `_ensure_google_token()` | `GoogleCalendarProvider.get_token()` |
| `_google_api_create_event()` + attendee mapping from `async_create_event_with_attendees()` | `GoogleCalendarProvider.create_event_with_attendees()` |
| API call logic from `ws_get_event_organizer()` | `GoogleCalendarProvider.get_event_organizer()` |
| PATCH logic from `ws_update_event()` | `GoogleCalendarProvider.update_event()` |

`detect()` checks `entity_registry.async_get(entity_id).platform == "google"`.

No behavioral changes. Same API calls, same error handling, same fallback signals.

---

## Routing in `__init__.py`

The main integration file becomes a thin router. Each service/WebSocket handler follows the same pattern:

```
resolve provider → if found, delegate → if not (or failure), fall back to generic HA services
```

**Event creation with attendees:**
```python
async def async_create_event_with_attendees(call):
    organizer_entity = call.data["organizer"]
    provider = resolve_provider(hass, organizer_entity)

    if provider:
        result = await provider.create_event_with_attendees(
            hass, organizer_entity, attendee_entities, event_data
        )
        for fallback_id in result.get("fallback_ids", []):
            await _create_event_via_ha(hass, fallback_id, event_data)
    else:
        for entity_id in all_entities:
            await _create_event_via_ha(hass, entity_id, event_data)
```

**Organizer detection:**
```python
async def ws_get_event_organizer(hass, connection, msg):
    provider = resolve_provider(hass, msg["entity_id"])
    organizer = None
    if provider:
        organizer = await provider.get_event_organizer(
            hass, msg["entity_id"], msg["uid"]
        )
    connection.send_result(msg["id"], {"organizer": organizer})
```

**Event update:**
```python
async def ws_update_event(hass, connection, msg):
    provider = resolve_provider(hass, msg["entity_id"])
    success = False
    if provider:
        success = await provider.update_event(
            hass, msg["entity_id"], msg["uid"],
            msg["changes"], msg.get("attendees")
        )
    connection.send_result(msg["id"], {"success": success})
```

`_create_event_via_ha()` stays in `__init__.py` as the universal generic fallback.

**Frontend: zero changes.** Service names (`planavista.create_event_with_attendees`) and WebSocket commands (`planavista/get_event_organizer`, `planavista/update_event`) remain identical.

---

## Adding a New Provider

To add support for a new calendar provider (e.g., Microsoft Outlook):

### Step 1: Create the adapter

Create `providers/outlook.py` implementing `CalendarProvider`:

```python
from .base import CalendarProvider

class OutlookCalendarProvider(CalendarProvider):

    @staticmethod
    def detect(hass, entity_id) -> bool:
        er = hass.helpers.entity_registry.async_get(hass)
        entry = er.async_get(entity_id)
        return entry is not None and entry.platform == "microsoft"

    async def get_calendar_id(self, hass, entity_id) -> str | None:
        # Extract Outlook calendar ID from HA entity's unique_id
        ...

    async def get_token(self, hass, entity_id) -> str | None:
        # Obtain Microsoft Graph API token from HA's config entry
        ...

    async def create_event_with_attendees(self, hass, organizer_id, attendee_ids, event_data) -> dict:
        # POST to Microsoft Graph API /me/calendars/{id}/events
        # Include attendees array in Outlook's format
        # Return fallback_ids for non-Outlook attendees
        ...

    async def get_event_organizer(self, hass, entity_id, ical_uid) -> str | None:
        # Query Graph API for event organizer
        ...

    async def update_event(self, hass, entity_id, ical_uid, changes, attendee_ids) -> bool:
        # PATCH via Graph API /me/events/{id}
        ...
```

### Step 2: Register it

In `providers/__init__.py`:

```python
from .outlook import OutlookCalendarProvider

PROVIDERS: dict[str, CalendarProvider] = {
    "google": GoogleCalendarProvider(),
    "microsoft": OutlookCalendarProvider(),
}
```

### Step 3: Done

No changes to `__init__.py` routing, no changes to the frontend. `resolve_provider()` automatically picks up the new adapter.

### Cross-provider behavior

When a Google organizer invites an Outlook attendee:
- `resolve_provider(organizer)` returns `GoogleCalendarProvider`
- `create_event_with_attendees()` creates the event via Google API
- Google resolves the Outlook user's email and sends an iCal invite
- Outlook processes the invite natively
- HA's next coordinator refresh picks up the event on both calendars

When an Outlook organizer invites a Google attendee, the same flow runs in reverse through `OutlookCalendarProvider`.

---

## Path 2: PlanaVista-Native Entities (Future)

When PlanaVista owns the OAuth credentials and creates `calendar.*` entities directly:

1. Add a config flow step for API credential entry (OAuth2 redirect or service account key)
2. Implement `CalendarEntity` subclass that syncs with the provider's API
3. Create a provider adapter whose `detect()` matches PlanaVista-created entities and whose `get_token()` reads from PlanaVista's own config entry
4. Register alongside the piggyback adapter: both can coexist

The provider interface does not change. The only difference is where credentials live.
