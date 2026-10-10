# Review Fix Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every Critical/High finding from the 2026-10-09 review, make location autocomplete an explained opt-in setting, and add backend tests, frontend tests and CI so the fixes stay fixed.

**Architecture:** Backend changes consolidate registration in `async_setup`, apply settings in place (no reload listener), validate all service input, and refresh as soon as calendars appear. Frontend changes route every event-date parse through one helper, move form date math into a pure tested module, isolate the clock, and guard element registration. Each part is independently testable: Part A with pytest in Docker, Part B with vitest in `America/Chicago`, Part C in CI and on the dev/production Home Assistant.

**Tech Stack:** Home Assistant 2026.9.4 custom integration (Python 3.14, voluptuous, DataUpdateCoordinator), pytest-homeassistant-custom-component, LitElement 3 + TypeScript 5.9 + Rollup 4, vitest, GitHub Actions (hassfest, hacs/action), Docker Desktop.

**Spec:** `docs/superpowers/specs/2026-10-09-review-fix-pass-design.md`

## Global Constraints

- Home Assistant 2026.9.4 on dev and production; `hacs.json` minimum `"homeassistant": "2026.3.0"` (local `brand/` icons need 2026.3).
- Backend tests: Python 3.14 (HA 2026.9.4 requires >= 3.14.2) in Docker (`python:3.14-slim`) through `scripts/test-backend.sh`; `pytest-homeassistant-custom-component==0.13.367` (requires `homeassistant==2026.9.4`) plus `home-assistant-frontend==20260826.7`.
- Frontend tests: vitest with `TZ=America/Chicago` forced for every run.
- Public interfaces unchanged: services `planavista.save_config`, `planavista.delete_event`, `planavista.create_event_with_attendees`; WebSocket `planavista/get_event_organizer`, `planavista/update_event` (same fields and response keys); card `custom:planavista-calendar-card`; `sensor.planavista_config` and `sensor.planavista_upcoming_events` attribute shapes.
- One new display key: `location_autocomplete` (boolean, default `false`).
- Location autocomplete provider: Photon `https://photon.komoot.io/api/`; typed text only, 350 ms debounce, minimum 3 characters, newest response wins; Nominatim is removed.
- `save_config` requires an admin; event services/commands stay available to non-admin users but only for calendars configured in PlanaVista.
- Work on branch `fix/review-pass`; merge locally into `main`; never open a GitHub PR.
- Don't commit `frontend/dist/planavista-cards.js` until the release task (Task R2).
- Commit messages describe only what the change does. Never mention prior names, renames, migrations, or repo moves.
- Every commit message ends with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX`
- Git Bash: `export MSYS_NO_PATHCONV=1` before any `docker exec`/`docker run` that passes container paths.
- Create/edit/delete testing happens only on the dev HA (`http://127.0.0.1:8124`, calendars `calendar.test_alex|test_blair|test_casey`). Production is read-only for this plan, except the user's HACS update in Task R4.
- Update `CLAUDE.md` → Known Issues as items are fixed (local-only file; no commit).

## Review Focus

Inputs the spec implies but no feature test would naturally exercise. Each line has a pinned test in the task that owns the code:
1. **A timed event whose UTC offset differs from the tablet's time zone** (e.g. `2026-10-09T10:00:00-04:00` viewed in Chicago) must show at 9:00 on Oct 9. Pinned in Task B1.
2. **US fall-back day 2026-11-01:** an all-day event and a 01:30→03:00 timed event both land on Nov 1 with correct duration. Pinned in Task B1.
3. **Editing one instance of a recurring event** must pass its `recurrence_id` and never delete the series. Pinned in Task B5.
4. **A configured calendar that never comes back** (its integration was removed) must leave the other calendars working, with no refresh loop and no error spam. Pinned in Task A5.
5. **A non-admin kiosk user** can create/edit/delete events on configured calendars, but `save_config` is refused with a clear error. Pinned in Task A4.

## Before Task A1

```bash
cd "$(git rev-parse --show-toplevel)"
git checkout main && git pull --ff-only
git checkout -b fix/review-pass
```

---

## Part A: Backend (Python)

### Task A1: Backend test harness and single config entry

**Files:**
- Create: `requirements_test.txt`
- Create: `pyproject.toml`
- Create: `scripts/test-backend.sh`
- Create: `tests/__init__.py`
- Create: `tests/conftest.py`
- Modify: `custom_components/planavista/manifest.json:11-12`
- Modify: `custom_components/planavista/strings.json:9-11`
- Modify: `custom_components/planavista/translations/en.json:9-11`
- Test: `tests/test_config_flow.py`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `scripts/test-backend.sh [pytest args...]`: runs pytest in a `python:3.14-slim` container; the virtualenv is cached in the Docker volume `planavista-test-venv` and rebuilt only when `requirements_test.txt` changes.
  - `tests/conftest.py`: `DEFAULT_ENTRY_DATA: dict[str, Any]`; fixtures `config_entry_data() -> dict[str, Any]` (override per module), `mock_config_entry(hass, config_entry_data) -> MockConfigEntry` (added to hass, not set up); autouse `auto_enable_custom_integrations`.
  - Manifest key `"single_config_entry": true`; abort reason `single_instance_allowed` in strings.

Background the engineer needs:
- Home Assistant 2026.9.4 requires Python >= 3.14.2 (PyPI metadata of `homeassistant==2026.9.4`), so the container image is `python:3.14-slim`, not 3.13. The dev HA container itself runs Python 3.14.
- `pytest-homeassistant-custom-component==0.13.367` is the release whose `requires_dist` pins `homeassistant==2026.9.4` (0.13.363 to 0.13.367 track 2026.9.0 to 2026.9.4; 0.13.368 moves to 2026.10.0b0).
- PlanaVista depends on the `frontend` component, which imports `hass_frontend`. The test plugin does not install it, so `home-assistant-frontend==20260826.7` (the version pinned in HA 2026.9.4's `homeassistant/package_constraints.txt`) is listed too. Without it every setup fails with `No module named 'hass_frontend'`.
- HA mounts its own `testing_config/custom_components` package during setup; whichever `custom_components` package is imported first wins. `tests/conftest.py` therefore imports `custom_components.planavista.const` at module level. Do not add `custom_components/__init__.py`.

- [ ] **Step 1: Write the failing test**

Create `requirements_test.txt`:

```text
# Backend test dependencies (run through scripts/test-backend.sh).
# pytest-homeassistant-custom-component 0.13.367 pins homeassistant==2026.9.4.
# The integration depends on the frontend component, so the frontend package
# that Home Assistant 2026.9.4 pins is installed too.
pytest-homeassistant-custom-component==0.13.367
home-assistant-frontend==20260826.7
```

Create `pyproject.toml` (repo root):

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
testpaths = ["tests"]
pythonpath = ["."]
```

Create `scripts/test-backend.sh` (`.gitattributes` already forces `*.sh` to LF):

```bash
#!/usr/bin/env bash
# Run the backend tests in a Python 3.14 container.
#
#   scripts/test-backend.sh                               run every test
#   scripts/test-backend.sh tests/test_config_flow.py -v  any pytest arguments
#
# Home Assistant 2026.9 needs Python 3.14, so the tests run in Docker rather
# than on the host. The virtualenv lives in the planavista-test-venv volume and
# is rebuilt only when requirements_test.txt changes, so repeat runs are fast.
# Reset it with: docker volume rm planavista-test-venv
set -euo pipefail
export MSYS_NO_PATHCONV=1

IMAGE="${PLANAVISTA_TEST_IMAGE:-python:3.14-slim}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Docker Desktop on Windows needs D:/path, not Git Bash's /d/path.
if command -v cygpath >/dev/null 2>&1; then
  REPO="$(cygpath -m "$REPO")"
fi

docker run --rm \
  -v "$REPO:/work" \
  -v planavista-test-venv:/venv \
  -w /work \
  -e PYTHONDONTWRITEBYTECODE=1 \
  "$IMAGE" \
  bash -c '
    set -e
    [ -x /venv/bin/python ] || python -m venv /venv
    want="$(sha256sum requirements_test.txt | cut -d" " -f1)"
    if [ "$(cat /venv/.requirements 2>/dev/null)" != "$want" ]; then
      /venv/bin/pip install -q --disable-pip-version-check -r requirements_test.txt
      echo "$want" > /venv/.requirements
    fi
    exec /venv/bin/pytest -p no:cacheprovider "$@"
  ' pytest "$@"
```

Make it executable: `git update-index --chmod=+x scripts/test-backend.sh` after `git add` in Step 5 (Windows does not keep the bit otherwise).

Create `tests/__init__.py`:

```python
"""Tests for the PlanaVista integration."""
```

Create `tests/conftest.py`:

```python
"""Shared fixtures for the PlanaVista tests."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant

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


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: None) -> None:
    """Let Home Assistant load custom_components/planavista in every test."""


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Return the data for the PlanaVista config entry (override per test module)."""
    return deepcopy(DEFAULT_ENTRY_DATA)


@pytest.fixture
def mock_config_entry(
    hass: HomeAssistant, config_entry_data: dict[str, Any]
) -> MockConfigEntry:
    """Add a PlanaVista config entry to hass without setting it up."""
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=config_entry_data)
    entry.add_to_hass(hass)
    return entry
```

Create `tests/test_config_flow.py`:

```python
"""Tests for the PlanaVista config flow."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.planavista.const import DOMAIN

from .conftest import DEFAULT_ENTRY_DATA


async def test_user_step_creates_entry(hass: HomeAssistant) -> None:
    """The welcome step creates the entry with empty calendars and default display settings."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "PlanaVista"
    assert result["data"] == DEFAULT_ENTRY_DATA
    assert hass.states.get("sensor.planavista_config") is not None
    assert hass.states.get("sensor.planavista_upcoming_events") is not None


async def test_second_entry_is_refused(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """Only one PlanaVista entry may exist."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_config_flow.py -v`

The first run builds the virtualenv (about a minute); later runs start in about 3 s.

Expected: `test_user_step_creates_entry PASSED` (this guards the existing flow) and `test_second_entry_is_refused FAILED` with `assert <FlowResultType.FORM: 'form'> is <FlowResultType.ABORT: 'abort'>`, because a second flow still shows the welcome form.

- [ ] **Step 3: Write minimal implementation**

In `custom_components/planavista/manifest.json`, add `single_config_entry` between `requirements` and `version` (hassfest wants domain, name, then alphabetical keys):

```json
  "requirements": [],
  "single_config_entry": true,
  "version": "1.0.0"
```

In both `custom_components/planavista/strings.json` and `custom_components/planavista/translations/en.json`, replace the `config.abort` block (lines 9-11):

```json
    "abort": {
      "already_configured": "PlanaVista is already configured."
    }
```

with:

```json
    "abort": {
      "already_configured": "PlanaVista is already configured.",
      "single_instance_allowed": "PlanaVista is already set up. Only one instance is supported."
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh tests/test_config_flow.py -v`

Expected: `2 passed`.

- [ ] **Step 5: Commit**

```bash
git add requirements_test.txt pyproject.toml scripts/test-backend.sh tests/__init__.py tests/conftest.py tests/test_config_flow.py custom_components/planavista/manifest.json custom_components/planavista/strings.json custom_components/planavista/translations/en.json
git update-index --chmod=+x scripts/test-backend.sh
git commit -F - <<'EOF'
test: add backend test harness and allow a single config entry

Run the backend tests with pytest-homeassistant-custom-component pinned to
Home Assistant 2026.9.4, inside a Python 3.14 container. Mark the
integration as single_config_entry so a second setup is refused.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A2: Register services, WebSocket commands, and the card once; keep the coordinator in runtime_data

**Files:**
- Create: `custom_components/planavista/coordinator.py`
- Create: `custom_components/planavista/google_api.py`
- Create: `custom_components/planavista/services.py`
- Modify: `custom_components/planavista/__init__.py:1-854` (replace the whole file)
- Modify: `custom_components/planavista/sensor.py:8-15, 20-26`
- Modify: `custom_components/planavista/const.py:85-88`
- Modify: `tests/conftest.py` (replace the whole file)
- Test: `tests/test_init.py`, `tests/test_coordinator.py`

**Interfaces:**
- Consumes: `tests/conftest.py` fixtures from Task A1.
- Produces:
  - `custom_components/planavista/coordinator.py`: `class PlanaVistaCoordinator(DataUpdateCoordinator[dict[str, Any]])` with `__init__(hass, entry)`, attribute `calendars: list[dict[str, Any]]`, properties `display_config`, `calendar_configs`; `type PlanaVistaConfigEntry = ConfigEntry[PlanaVistaCoordinator]`; `_normalize_color(value) -> str`.
  - `custom_components/planavista/google_api.py`: `get_google_calendar_id(hass, entity_id) -> str | None`, `async_get_google_token(hass, entity_id) -> str | None`, `async_google_create_event(hass, access_token, calendar_id, event_data, attendee_emails) -> dict` (bodies moved unchanged from `__init__.py`, minus the leading underscore).
  - `custom_components/planavista/services.py`: `async_setup_services(hass) -> None` (callback) registering `planavista.save_config`, `planavista.delete_event`, `planavista.create_event_with_attendees`, and WS commands `planavista/get_event_organizer`, `planavista/update_event`; handlers `_async_save_config(call)`, `_async_delete_event(call)`, `_async_create_event_with_attendees(call)`, `_async_create_event_via_ha(hass, entity_id, event_data)`, `ws_get_event_organizer`, `ws_update_event`.
  - `custom_components/planavista/__init__.py`: `CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)`, `async_setup(hass, config) -> bool`, `async_setup_entry(hass, entry) -> bool` (sets `entry.runtime_data`), `async_unload_entry`, `async_register_frontend(hass)`, and a temporary `async_reload_entry` that Task A3 deletes.
  - `const.py`: `SERVICE_SAVE_CONFIG`, `SERVICE_DELETE_EVENT`, `SERVICE_CREATE_EVENT_WITH_ATTENDEES` (replacing the unused `SERVICE_ADD_EVENT`, `SERVICE_SET_CALENDAR_VISIBILITY`, `SERVICE_REFRESH_CALENDARS`).
  - `tests/conftest.py`: `CONFIGURED_CALENDARS` (Alex and Blair), `class FakeCalendar(CalendarEntity)` with a public `events: list[CalendarEvent]`, `async_load_calendars(hass, calendars) -> None`, fixtures `fake_calendars() -> dict[str, FakeCalendar]` (keys `calendar.test_alex`, `calendar.test_blair`, `calendar.test_casey`) and `setup_calendars(hass, fake_calendars)`.

This task is mostly a move. Handler bodies stay as they are, except: closures become module-level functions that read `hass` from `call.hass`; `hass.data.get(CALENDAR_DOMAIN)` becomes the typed key `hass.data.get(DATA_COMPONENT)` (same object); the coordinator passes `config_entry=entry` explicitly; `save_config` reads the coordinator from `entry.runtime_data`. Behavior changes come in later tasks.

- [ ] **Step 1: Write the failing test**

Replace `tests/conftest.py` with:

```python
"""Shared fixtures for the PlanaVista tests."""
from __future__ import annotations

from copy import deepcopy
import datetime
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    setup_test_component_platform,
)

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
def mock_config_entry(
    hass: HomeAssistant, config_entry_data: dict[str, Any]
) -> MockConfigEntry:
    """Add a PlanaVista config entry to hass without setting it up."""
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=config_entry_data)
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
```

`FakeCalendar.event` returns `None` on purpose: a real event would make `CalendarEntity` schedule state timers that outlive the test and fail it as a lingering timer.

Create `tests/test_init.py`:

```python
"""Tests for PlanaVista setup and unload."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.coordinator import PlanaVistaCoordinator

SERVICES = ("save_config", "delete_event", "create_event_with_attendees")
WS_COMMANDS = ("planavista/get_event_organizer", "planavista/update_event")


async def test_services_registered_by_async_setup(hass: HomeAssistant) -> None:
    """Services and WebSocket commands exist as soon as the integration loads."""
    assert await async_setup_component(hass, DOMAIN, {})
    await hass.async_block_till_done()

    for service in SERVICES:
        assert hass.services.has_service(DOMAIN, service)
    for command in WS_COMMANDS:
        assert command in hass.data[websocket_api.DOMAIN]


async def test_entry_setup_unload_and_setup_again(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """The coordinator lives in runtime_data, and services outlive an unload."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    assert mock_config_entry.state is ConfigEntryState.LOADED
    assert isinstance(mock_config_entry.runtime_data, PlanaVistaCoordinator)
    assert hass.states.get("sensor.planavista_config").state == "configured"

    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.NOT_LOADED
    for service in SERVICES:
        assert hass.services.has_service(DOMAIN, service)

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert mock_config_entry.state is ConfigEntryState.LOADED
    assert hass.states.get("sensor.planavista_config").state == "configured"
```

Create `tests/test_coordinator.py` (it already passes on the current code; it guards the coordinator move):

```python
"""Tests for the PlanaVista coordinator and sensors."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.calendar import CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    return data


async def test_sensor_exposes_calendars_and_events(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Events from configured calendars reach the config sensor with calendar metadata."""
    now = dt_util.now()
    tomorrow = (now + timedelta(days=1)).date()
    setup_calendars["calendar.test_alex"].events.append(
        CalendarEvent(
            uid="alex-1",
            summary="Swim practice",
            start=now + timedelta(hours=1),
            end=now + timedelta(hours=2),
        )
    )
    setup_calendars["calendar.test_blair"].events.append(
        CalendarEvent(
            uid="blair-1",
            summary="Field trip",
            start=tomorrow,
            end=tomorrow + timedelta(days=1),
        )
    )
    setup_calendars["calendar.test_casey"].events.append(
        CalendarEvent(
            uid="casey-1",
            summary="Not configured",
            start=now + timedelta(hours=3),
            end=now + timedelta(hours=4),
        )
    )

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get("sensor.planavista_config")
    assert [c["entity_id"] for c in state.attributes["calendars"]] == [
        "calendar.test_alex",
        "calendar.test_blair",
    ]
    events = {event["uid"]: event for event in state.attributes["events"]}
    assert set(events) == {"alex-1", "blair-1"}
    assert events["alex-1"]["calendar_entity_id"] == "calendar.test_alex"
    assert events["alex-1"]["calendar_name"] == "Alex"
    assert events["alex-1"]["calendar_color"] == "#F94144"
    assert events["blair-1"]["start"] == tomorrow.isoformat()
    assert events["blair-1"]["end"] == (tomorrow + timedelta(days=1)).isoformat()
    assert state.attributes["display"] == DEFAULT_ENTRY_DATA["display"]
    assert state.attributes["onboarding_complete"] is False

    assert hass.states.get("sensor.planavista_upcoming_events").state == "2"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_init.py tests/test_coordinator.py -v`

Expected: collection error `ModuleNotFoundError: No module named 'custom_components.planavista.coordinator'` in `tests/test_init.py`.

- [ ] **Step 3: Write minimal implementation**

In `custom_components/planavista/const.py`, replace lines 85-88:

```python
# Services
SERVICE_ADD_EVENT: Final = "add_event"
SERVICE_SET_CALENDAR_VISIBILITY: Final = "set_calendar_visibility"
SERVICE_REFRESH_CALENDARS: Final = "refresh_calendars"
```

with:

```python
# Services
SERVICE_SAVE_CONFIG: Final = "save_config"
SERVICE_DELETE_EVENT: Final = "delete_event"
SERVICE_CREATE_EVENT_WITH_ATTENDEES: Final = "create_event_with_attendees"
```

Create `custom_components/planavista/coordinator.py` (the class body is `__init__.py:675-854` moved verbatim, plus the explicit `config_entry=entry` and the typed `DATA_COMPONENT` lookup):

```python
"""Data coordinator for PlanaVista."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.calendar import DOMAIN as CALENDAR_DOMAIN
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .const import (
    CONF_CALENDARS,
    DOMAIN,
    EVENT_RANGE_FUTURE_DAYS,
    EVENT_RANGE_PAST_DAYS,
    UPDATE_INTERVAL_SECONDS,
)

_LOGGER = logging.getLogger(__name__)


def _normalize_color(color_value) -> str:
    """Normalize color to hex string format.

    Handles both hex strings and RGB arrays from ColorRGBSelector.
    """
    if isinstance(color_value, str):
        return color_value
    if isinstance(color_value, (list, tuple)) and len(color_value) >= 3:
        r, g, b = color_value[:3]
        return f"#{int(r):02x}{int(g):02x}{int(b):02x}"
    return "#4A90E2"


class PlanaVistaCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Class to manage fetching PlanaVista data."""

    config_entry: PlanaVistaConfigEntry

    def __init__(self, hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL_SECONDS),
        )
        self.calendars: list[dict[str, Any]] = list(entry.data.get(CONF_CALENDARS, []))

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from calendars."""
        try:
            data = {
                "calendars": [],
                "events": [],
                "upcoming_events": [],
                "conflicts": [],
            }

            # Calculate time range for event fetching
            now = dt_util.now()
            start_time = now - timedelta(days=EVENT_RANGE_PAST_DAYS)
            end_time = now + timedelta(days=EVENT_RANGE_FUTURE_DAYS)

            # Fetch events from each configured calendar
            for calendar_config in self.calendars:
                entity_id = calendar_config.get("entity_id")

                if not entity_id:
                    continue

                calendar_state = self.hass.states.get(entity_id)

                if calendar_state:
                    color = _normalize_color(calendar_config.get("color", "#4A90E2"))
                    display_name = calendar_config.get("display_name", "Unknown")

                    color_light = calendar_config.get("color_light", "")

                    calendar_data = {
                        "entity_id": entity_id,
                        "display_name": display_name,
                        "color": color,
                        "color_light": color_light,
                        "icon": calendar_config.get("icon", "mdi:calendar"),
                        "person_entity": calendar_config.get("person_entity", ""),
                        "visible": calendar_config.get("visible", True),
                        "state": calendar_state.state,
                        "attributes": dict(calendar_state.attributes),
                    }
                    data["calendars"].append(calendar_data)

                    # Fetch events from calendar entity
                    try:
                        events = await self._fetch_calendar_events(
                            entity_id, start_time, end_time
                        )
                        for event in events:
                            event["calendar_entity_id"] = entity_id
                            event["calendar_name"] = display_name
                            event["calendar_color"] = color
                            event["calendar_color_light"] = color_light
                            data["events"].append(event)
                    except Exception as err:
                        _LOGGER.warning(
                            "Failed to fetch events from %s: %s", entity_id, err
                        )

            # Sort events by start time
            data["events"].sort(key=lambda e: e.get("start", ""))

            # Get upcoming events (next 7 days)
            upcoming_cutoff = now + timedelta(days=7)
            data["upcoming_events"] = [
                e for e in data["events"]
                if e.get("start", "") >= now.isoformat()
                and e.get("start", "") <= upcoming_cutoff.isoformat()
            ]

            return data

        except Exception as err:
            raise UpdateFailed(f"Error fetching calendar data: {err}") from err

    async def _fetch_calendar_events(
        self, entity_id: str, start: datetime, end: datetime
    ) -> list[dict]:
        """Fetch events from a calendar entity.

        Tries direct entity access first (returns CalendarEvent objects with uid),
        then falls back to the calendar.get_events service (which may omit uid).
        """
        # Approach 1: Direct entity access: gives us CalendarEvent objects with uid
        try:
            entity_comp = self.hass.data.get(DATA_COMPONENT)
            if entity_comp and hasattr(entity_comp, "get_entity"):
                entity = entity_comp.get_entity(entity_id)
                if entity and hasattr(entity, "async_get_events"):
                    raw_events = await entity.async_get_events(self.hass, start, end)
                    events = []
                    for ev in raw_events:
                        d = {
                            "summary": ev.summary or "",
                            "description": ev.description or "",
                            "location": ev.location or "",
                            "uid": ev.uid or "",
                            "recurrence_id": ev.recurrence_id or "",
                        }
                        if hasattr(ev.start, "isoformat"):
                            d["start"] = ev.start.isoformat()
                        else:
                            d["start"] = str(ev.start)
                        if hasattr(ev.end, "isoformat"):
                            d["end"] = ev.end.isoformat()
                        else:
                            d["end"] = str(ev.end)
                        events.append(d)
                    _LOGGER.debug(
                        "PlanaVista: fetched %d events from %s via direct entity (uid available: %s)",
                        len(events),
                        entity_id,
                        any(e.get("uid") for e in events),
                    )
                    return events
        except Exception as err:
            _LOGGER.debug(
                "PlanaVista: direct entity access failed for %s, falling back to service: %s",
                entity_id, err,
            )

        # Approach 2: Fallback: calendar.get_events service (may omit uid)
        try:
            response = await self.hass.services.async_call(
                CALENDAR_DOMAIN,
                "get_events",
                {
                    "entity_id": entity_id,
                    "start_date_time": start.isoformat(),
                    "end_date_time": end.isoformat(),
                },
                blocking=True,
                return_response=True,
            )

            if response and entity_id in response:
                events = response[entity_id].get("events", [])
                for event in events:
                    if "start" in event and hasattr(event["start"], "isoformat"):
                        event["start"] = event["start"].isoformat()
                    if "end" in event and hasattr(event["end"], "isoformat"):
                        event["end"] = event["end"].isoformat()
                    event.setdefault("description", "")
                    event.setdefault("location", "")
                    event.setdefault("recurrence_id", "")
                _LOGGER.debug(
                    "PlanaVista: fetched %d events from %s via service (uid available: %s)",
                    len(events),
                    entity_id,
                    any(e.get("uid") for e in events),
                )
                return events
            return []
        except Exception as err:
            _LOGGER.debug("Error fetching events from %s: %s", entity_id, err)
            return []

    @property
    def display_config(self) -> dict[str, Any]:
        """Return display configuration."""
        return self.config_entry.data.get("display", {})

    @property
    def calendar_configs(self) -> list[dict[str, Any]]:
        """Return calendar configurations."""
        return self.calendars


type PlanaVistaConfigEntry = ConfigEntry[PlanaVistaCoordinator]
```

Create `custom_components/planavista/google_api.py` (`__init__.py:317-426` moved verbatim, renamed `_get_google_calendar_id` → `get_google_calendar_id`, `_ensure_google_token` → `async_get_google_token`, `_google_api_create_event` → `async_google_create_event`):

```python
"""Google Calendar API helpers: direct API calls with attendee support."""
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
```

Create `custom_components/planavista/services.py` (the three closures from `__init__.py:61-238` become module-level handlers; `_create_event_via_ha` and both WebSocket commands, `__init__.py:429-672`, move verbatim with the renamed Google helpers):

```python
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
from .coordinator import PlanaVistaCoordinator
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

    # Suppress the background reload that async_update_entry triggers
    # (the update listener would otherwise destroy the coordinator we're about to update)
    coord: PlanaVistaCoordinator | None = getattr(config_entry, "runtime_data", None)
    if coord:
        coord._suppress_reload = True

    # Persist to config entry storage
    hass.config_entries.async_update_entry(config_entry, data=new_data)

    # Update coordinator in-memory and refresh data immediately
    if coord:
        coord.calendars = new_data.get(CONF_CALENDARS, [])
        await coord.async_refresh()

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
        "PlanaVista: create_event_with_attendees called, "
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
```

Replace `custom_components/planavista/__init__.py` entirely with:

```python
"""The PlanaVista integration."""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .services import async_setup_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

# Frontend resource URL - single bundled output from LitElement/TypeScript build
FRONTEND_SCRIPTS = [
    "/planavista_panel/dist/planavista-cards.js",
]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services, WebSocket commands, and the card bundle once."""
    async_setup_services(hass)
    await async_register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for config changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Register the frontend resources."""
    # Get the path to the frontend directory
    frontend_path = Path(__file__).parent / "frontend"

    # Register static path to serve the JS files using the new async API
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/planavista_panel",
            path=str(frontend_path),
            cache_headers=False,
        )
    ])

    # Add all JS files to the frontend (order matters - base must load first)
    for script_url in FRONTEND_SCRIPTS:
        add_extra_js_url(hass, script_url)

    _LOGGER.info("PlanaVista v1.0 frontend registered (single bundle)")


async def async_unload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> None:
    """Reload config entry when options change."""
    # Skip reload when save_config already handled the update in-memory
    coord = getattr(entry, "runtime_data", None)
    if coord and getattr(coord, "_suppress_reload", False):
        coord._suppress_reload = False
        _LOGGER.debug("Skipping reload, save_config already applied changes")
        return
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
```

In `custom_components/planavista/sensor.py`, replace lines 8-15:

```python
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SENSOR_PREFIX
from . import PlanaVistaCoordinator
```

with:

```python
from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import SENSOR_PREFIX
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
```

and replace lines 20-26:

```python
async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up PlanaVista sensors from a config entry."""
    coordinator: PlanaVistaCoordinator = hass.data[DOMAIN][entry.entry_id]
```

with:

```python
async def async_setup_entry(
    hass: HomeAssistant,
    entry: PlanaVistaConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up PlanaVista sensors from a config entry."""
    coordinator = entry.runtime_data
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `5 passed` (test_config_flow 2, test_init 2, test_coordinator 1).

Live check on the dev HA:

```bash
scripts/dev-ha.sh deploy
scripts/dev-ha.sh logs 50
python scripts/ha.py ws '{"type": "get_services"}' | grep -E '"(save_config|delete_event|create_event_with_attendees)"'
```

Expected: no PlanaVista tracebacks in the log; the three service names are listed.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/__init__.py custom_components/planavista/coordinator.py custom_components/planavista/google_api.py custom_components/planavista/services.py custom_components/planavista/sensor.py custom_components/planavista/const.py tests/conftest.py tests/test_init.py tests/test_coordinator.py
git commit -F - <<'EOF'
refactor: register services and the card once in async_setup

Services, WebSocket commands, and the card bundle are registered once
when the integration loads instead of on every entry setup. The
coordinator lives in entry.runtime_data. The coordinator, the Google
Calendar helpers, and the service handlers move into their own modules.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A3: Options flow opens and saves; one in-place path applies settings

**Files:**
- Modify: `custom_components/planavista/coordinator.py:10-11, 212, 223` (imports; new method before `display_config`; new function at the end)
- Modify: `custom_components/planavista/__init__.py:43-48, 72-86`
- Modify: `custom_components/planavista/services.py:22, 64-76`
- Modify: `custom_components/planavista/config_flow.py:41, 185-191, 197-201, 240-247, 303-317, 430-437, 489-503`
- Test: `tests/test_options_flow.py`

**Interfaces:**
- Consumes: `PlanaVistaCoordinator`, `PlanaVistaConfigEntry` (Task A2).
- Produces:
  - `PlanaVistaCoordinator.async_set_calendars(calendars: list[dict[str, Any]]) -> None` (callback).
  - `coordinator.async_apply_config(hass, entry: PlanaVistaConfigEntry, new_data: dict[str, Any]) -> None`: persists `new_data` with `async_update_entry` and, when the entry is loaded, updates the coordinator's calendars and awaits `async_refresh()`. It is the only way settings change; there is no update listener and no reload.
  - `PlanaVistaOptionsFlow()` takes no constructor arguments.

Why: `OptionsFlow.config_entry` is a read-only property in HA 2026.9 (`homeassistant/config_entries.py:4026`), so assigning it raises `AttributeError` and the flow crashes on open. The update listener re-ran `async_setup_entry` by hand, which left the sensors unloaded. HA warns that combining an update listener with reload helpers breaks in 2026.12, so the listener goes away entirely and both the options flow and `save_config` call `async_apply_config`. The display step also merges into the existing display dict so `theme_overrides` and `location_autocomplete` (set by the card) survive.

- [ ] **Step 1: Write the failing test**

Create `tests/test_options_flow.py`:

```python
"""Tests for the options flow and for applying settings in place."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.planavista.const import DOMAIN

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar

NEW_DISPLAY = {
    "time_format": "24h",
    "weather_entity": "",
    "first_day": "sunday",
    "default_view": "month",
    "theme": "dark",
}


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex and Blair, with a theme override set by the card."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    data["display"]["theme_overrides"] = {"accent": "#277DA1"}
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


def _calendar_ids(hass: HomeAssistant) -> list[str]:
    state = hass.states.get("sensor.planavista_config")
    return [calendar["entity_id"] for calendar in state.attributes["calendars"]]


async def test_options_flow_opens(hass: HomeAssistant, loaded_entry: MockConfigEntry) -> None:
    """Opening the options flow shows the menu instead of crashing."""
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)

    assert result["type"] is FlowResultType.MENU
    assert result["step_id"] == "init"
    assert set(result["menu_options"]) == {"manage_calendars", "edit_calendar", "display"}


async def test_display_options_apply_in_place(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Saving display options updates the sensor without reloading the entry."""
    coordinator = loaded_entry.runtime_data

    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "display"}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], NEW_DISPLAY
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert loaded_entry.state is ConfigEntryState.LOADED
    assert loaded_entry.runtime_data is coordinator
    assert loaded_entry.update_listeners == []
    display = hass.states.get("sensor.planavista_config").attributes["display"]
    assert display == {**NEW_DISPLAY, "theme_overrides": {"accent": "#277DA1"}}
    assert hass.states.get("sensor.planavista_upcoming_events") is not None


async def test_manage_calendars_removes_a_calendar(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Unticking a calendar removes it from the entry and the sensor."""
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "manage_calendars"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"calendars": ["calendar.test_alex"]}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert [c["entity_id"] for c in loaded_entry.data["calendars"]] == [
        "calendar.test_alex"
    ]
    assert _calendar_ids(hass) == ["calendar.test_alex"]


async def test_save_config_applies_in_place_and_options_still_work(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """save_config updates the running coordinator; later settings changes still apply."""
    coordinator = loaded_entry.runtime_data

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"calendars": [CONFIGURED_CALENDARS[1]], "display": NEW_DISPLAY},
        blocking=True,
    )
    await hass.async_block_till_done()

    assert loaded_entry.runtime_data is coordinator
    assert _calendar_ids(hass) == ["calendar.test_blair"]
    assert hass.states.get("sensor.planavista_config").attributes["display"] == NEW_DISPLAY

    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "display"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {**NEW_DISPLAY, "time_format": "12h"}
    )
    await hass.async_block_till_done()

    assert loaded_entry.state is ConfigEntryState.LOADED
    state = hass.states.get("sensor.planavista_config")
    assert state.attributes["display"]["time_format"] == "12h"
    assert _calendar_ids(hass) == ["calendar.test_blair"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_options_flow.py -v`

Expected: all 4 tests FAIL with `AttributeError: property 'config_entry' of 'PlanaVistaOptionsFlow' object has no setter`.

- [ ] **Step 3: Write minimal implementation**

Line numbers below refer to each file as it is before this task; apply the edits from the bottom of a file upward, or match on the quoted text.

`custom_components/planavista/coordinator.py`: replace lines 10-11:

```python
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
```

with:

```python
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
```

Insert before `    @property\n    def display_config` (line 212):

```python
    @callback
    def async_set_calendars(self, calendars: list[dict[str, Any]]) -> None:
        """Replace the configured calendars; the next refresh uses them."""
        self.calendars = list(calendars)

```

Append after the last line (`type PlanaVistaConfigEntry = ConfigEntry[PlanaVistaCoordinator]`, line 223):

```python


async def async_apply_config(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, new_data: dict[str, Any]
) -> None:
    """Persist new settings and apply them to the running coordinator.

    The save_config service and the options flow both change settings through
    this function. The entry is never reloaded, so the sensors stay in place.
    """
    hass.config_entries.async_update_entry(entry, data=new_data)
    if entry.state is ConfigEntryState.LOADED:
        coordinator = entry.runtime_data
        coordinator.async_set_calendars(new_data.get(CONF_CALENDARS, []))
        await coordinator.async_refresh()
```

`custom_components/planavista/__init__.py`: replace lines 43-48:

```python
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register update listener for config changes
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True
```

with:

```python
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True
```

and delete the whole `async_reload_entry` function (lines 75-86, including the two blank lines before it), so the file ends with:

```python
async def async_unload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
```

`custom_components/planavista/services.py`: replace line 22:

```python
from .coordinator import PlanaVistaCoordinator
```

with:

```python
from .coordinator import async_apply_config
```

and replace lines 64-76:

```python
    # Suppress the background reload that async_update_entry triggers
    # (the update listener would otherwise destroy the coordinator we're about to update)
    coord: PlanaVistaCoordinator | None = getattr(config_entry, "runtime_data", None)
    if coord:
        coord._suppress_reload = True

    # Persist to config entry storage
    hass.config_entries.async_update_entry(config_entry, data=new_data)

    # Update coordinator in-memory and refresh data immediately
    if coord:
        coord.calendars = new_data.get(CONF_CALENDARS, [])
        await coord.async_refresh()
```

with:

```python
    await async_apply_config(hass, config_entry, new_data)
```

`custom_components/planavista/config_flow.py`:

1. After the `from .const import (...)` block (closing `)` on line 41) add:

```python
from .coordinator import async_apply_config
```

2. Lines 185-191, `async_get_options_flow` returns the flow without the entry:

```python
    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> PlanaVistaOptionsFlow:
        """Get the options flow for this handler."""
        return PlanaVistaOptionsFlow()
```

3. Lines 197-201, replace `__init__` with:

```python
    def __init__(self) -> None:
        """Initialize options flow."""
        self._calendars_to_add: list[str] = []
        self._calendar_to_edit: str | None = None
```

4. Lines 240-247 (`async_step_manage_calendars`), replace

```python
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            self.hass.config_entries.async_update_entry(
                self.config_entry, data=new_data
            )

            return self.async_create_entry(title="", data={})
```

with:

```python
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            await async_apply_config(self.hass, self.config_entry, new_data)

            return self.async_create_entry(title="", data={})
```

5. Lines 303-317 (`async_step_add_calendar`), replace

```python
                new_data = dict(self.config_entry.data)
                new_data[CONF_CALENDARS] = current_calendars
                self.hass.config_entries.async_update_entry(
                    self.config_entry, data=new_data
                )
                return await self.async_step_add_calendar()

            # All done
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = current_calendars
            self.hass.config_entries.async_update_entry(
                self.config_entry, data=new_data
            )
            return self.async_create_entry(title="", data={})
```

with:

```python
                new_data = dict(self.config_entry.data)
                new_data[CONF_CALENDARS] = current_calendars
                await async_apply_config(self.hass, self.config_entry, new_data)
                return await self.async_step_add_calendar()

            # All done
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = current_calendars
            await async_apply_config(self.hass, self.config_entry, new_data)
            return self.async_create_entry(title="", data={})
```

6. Lines 430-437 (`async_step_edit_calendar_details`), replace

```python
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            self.hass.config_entries.async_update_entry(
                self.config_entry, data=new_data
            )

            return self.async_create_entry(title="", data={})
```

with:

```python
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            await async_apply_config(self.hass, self.config_entry, new_data)

            return self.async_create_entry(title="", data={})
```

7. Lines 489-503 (`async_step_display`), replace

```python
        if user_input is not None:
            # Update the config entry
            new_data = dict(self.config_entry.data)
            new_data["display"] = {
                CONF_TIME_FORMAT: user_input[CONF_TIME_FORMAT],
                CONF_WEATHER_ENTITY: user_input.get(CONF_WEATHER_ENTITY, ""),
                CONF_FIRST_DAY: user_input[CONF_FIRST_DAY],
                CONF_DEFAULT_VIEW: user_input[CONF_DEFAULT_VIEW],
                CONF_THEME: user_input[CONF_THEME],
            }

            self.hass.config_entries.async_update_entry(
                self.config_entry, data=new_data
            )
            return self.async_create_entry(title="", data={})
```

with:

```python
        if user_input is not None:
            # Keep display keys this form doesn't edit (theme_overrides,
            # location_autocomplete, and any the card adds later).
            new_data = dict(self.config_entry.data)
            new_data["display"] = {
                **self.config_entry.data.get("display", {}),
                CONF_TIME_FORMAT: user_input[CONF_TIME_FORMAT],
                CONF_WEATHER_ENTITY: user_input.get(CONF_WEATHER_ENTITY, ""),
                CONF_FIRST_DAY: user_input[CONF_FIRST_DAY],
                CONF_DEFAULT_VIEW: user_input[CONF_DEFAULT_VIEW],
                CONF_THEME: user_input[CONF_THEME],
            }

            await async_apply_config(self.hass, self.config_entry, new_data)
            return self.async_create_entry(title="", data={})
```

After this, `grep -n "async_update_entry\|_suppress_reload\|add_update_listener" custom_components/planavista/*.py` prints only the call inside `async_apply_config`.

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `9 passed`.

Live check on the dev HA (the options flow opens, then the open flow is discarded):

```bash
scripts/dev-ha.sh deploy
python scripts/ha.py api GET "/api/config/config_entries/entry?domain=planavista"
python scripts/ha.py api POST /api/config/config_entries/options/flow '{"handler": "<entry_id from the previous output>"}'
python scripts/ha.py api DELETE /api/config/config_entries/options/flow/<flow_id from the previous output>
```

Expected: the POST returns `HTTP 200` with `"type": "menu"` and `"step_id": "init"` (before this task it returned HTTP 500); the DELETE returns `HTTP 200`.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/coordinator.py custom_components/planavista/__init__.py custom_components/planavista/services.py custom_components/planavista/config_flow.py tests/test_options_flow.py
git commit -F - <<'EOF'
fix: open the options flow and apply settings without reloading

The options flow no longer assigns the read-only config_entry, so it opens
again. Settings from the options flow and from save_config go through one
function that stores them and refreshes the running coordinator; the
update listener and its hand-rolled unload/setup are gone, so the sensors
stay in place. The display step keeps keys it does not edit.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A4: Service schemas, admin-only save_config, configured-calendar restriction, HA exception types

**Files:**
- Modify: `custom_components/planavista/services.py` (replace the whole file)
- Modify: `custom_components/planavista/const.py:24`
- Modify: `custom_components/planavista/strings.json:72-77`
- Modify: `custom_components/planavista/translations/en.json:72-77`
- Test: `tests/test_services.py`

**Interfaces:**
- Consumes: `async_apply_config`, `PlanaVistaConfigEntry` (Task A3); `get_google_calendar_id`, `async_get_google_token`, `async_google_create_event` (Task A2).
- Produces:
  - `const.py`: `CONF_DISPLAY = "display"`, `CONF_ONBOARDING_COMPLETE = "onboarding_complete"`, `CONF_THEME_OVERRIDES = "theme_overrides"`, `CONF_LOCATION_AUTOCOMPLETE = "location_autocomplete"`.
  - `services.py` schemas: `CALENDAR_CONFIG_SCHEMA`, `DISPLAY_SCHEMA` (both `extra=vol.ALLOW_EXTRA`), `SAVE_CONFIG_SCHEMA`, `DELETE_EVENT_SCHEMA`, `CREATE_EVENT_SCHEMA` (Task A9 reads their keys).
  - Helpers: `_async_get_loaded_entry(hass) -> PlanaVistaConfigEntry`, `_async_configured_calendar_ids(hass) -> set[str]`, `_async_check_configured(hass, entity_ids)`, `async _async_check_control(hass, context, entity_ids)`, `_async_ws_check_calendars(hass, connection, msg, entity_ids) -> bool`.
  - `_async_create_event_via_ha(hass, entity_id, event_data, context)` gains a `context` parameter.
  - Error contract: invalid service data raises `vol.Invalid`; `save_config` by a non-admin raises `Unauthorized`; an unconfigured calendar raises `ServiceValidationError(translation_key="calendar_not_configured", translation_placeholders={"entity_id": ...})`; no loaded entry raises `ServiceValidationError(translation_key="not_loaded")`; WebSocket commands answer error code `not_configured`.

Notes:
- `save_config` is registered with `homeassistant.helpers.service.async_register_admin_service`, which raises `Unauthorized` for non-admin users and allows calls without a user (automations).
- Event services stay open to non-admin users (wall tablets). They do require entity control permission, exactly as `calendar.create_event` does, so read-only users are refused. The HA fallback now calls `calendar.create_event` with the caller's context.
- The schemas tolerate unknown keys in each calendar and in `display`, and accept `theme_overrides` (dict) and `location_autocomplete` (boolean), so the card can add settings without a backend release. Unknown top-level keys are rejected.
- The calendar component is still reached through `hass.data[DATA_COMPONENT]` for delete; HA has no delete service, and its own `calendar/event/delete` WebSocket handler does the same. The feature check now uses `CalendarEntityFeature.DELETE_EVENT` instead of `hasattr`.
- Over REST, HA 2026.9 turns `ServiceValidationError` into HTTP 500; the card calls services over WebSocket, where it arrives as `service_validation_error` with the translated message.

- [ ] **Step 1: Write the failing test**

Create `tests/test_services.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_services.py -v`

Expected: `18 failed, 5 passed`. Failures include `test_save_config_requires_admin` (`DID NOT RAISE <class 'homeassistant.exceptions.Unauthorized'>`), all 8 `test_save_config_rejects_malformed_data` cases, `test_save_config_without_entry`, the 3 `test_event_services_reject_unconfigured_calendar` cases, `test_read_only_user_cannot_delete_event`, `test_event_services_validate_fields[delete_event-data0]`, and the 3 `test_ws_commands_reject_unconfigured_calendar` cases. The 5 passing tests (regular users can still delete and create, display keys persist, two create-schema cases) guard behavior that must not change.

- [ ] **Step 3: Write minimal implementation**

`custom_components/planavista/const.py`: after line 24 (`CONF_COLOR_LIGHT: Final = "color_light"`) add:

```python
CONF_DISPLAY: Final = "display"
CONF_ONBOARDING_COMPLETE: Final = "onboarding_complete"
CONF_THEME_OVERRIDES: Final = "theme_overrides"
CONF_LOCATION_AUTOCOMPLETE: Final = "location_autocomplete"
```

In both `custom_components/planavista/strings.json` and `custom_components/planavista/translations/en.json`, replace the end of the file (lines 72-77):

```json
    "abort": {
      "no_calendars": "No calendars configured. Please add calendars first.",
      "calendar_not_found": "Calendar not found. It may have been removed."
    }
  }
}
```

with:

```json
    "abort": {
      "no_calendars": "No calendars configured. Please add calendars first.",
      "calendar_not_found": "Calendar not found. It may have been removed."
    }
  },
  "exceptions": {
    "not_loaded": {
      "message": "PlanaVista is not set up yet."
    },
    "calendar_not_configured": {
      "message": "{entity_id} is not a calendar configured in PlanaVista."
    },
    "calendar_unavailable": {
      "message": "Calendar {entity_id} is not available right now."
    },
    "delete_not_supported": {
      "message": "Calendar {entity_id} does not support deleting events."
    }
  }
}
```

Replace `custom_components/planavista/services.py` entirely with (the Google request code inside the two WebSocket commands is unchanged here; Task A7 replaces it):

```python
"""Services and WebSocket commands for PlanaVista."""
from __future__ import annotations

from collections.abc import Iterable
import logging
from typing import Any
import urllib.parse

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
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.service import async_register_admin_service

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
    async_get_google_token,
    async_google_create_event,
    get_google_calendar_id,
)

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
        vol.Optional(CONF_VISIBLE): cv.boolean,
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


async def _async_save_config(call: ServiceCall) -> None:
    """Save the settings submitted by the card's setup wizard (admin only)."""
    hass = call.hass
    entry = _async_get_loaded_entry(hass)
    new_data = dict(entry.data)

    if CONF_CALENDARS in call.data:
        new_data[CONF_CALENDARS] = [dict(cal) for cal in call.data[CONF_CALENDARS]]
    if CONF_DISPLAY in call.data:
        new_data[CONF_DISPLAY] = dict(call.data[CONF_DISPLAY])
    if CONF_ONBOARDING_COMPLETE in call.data:
        new_data[CONF_ONBOARDING_COMPLETE] = call.data[CONF_ONBOARDING_COMPLETE]

    await async_apply_config(hass, entry, new_data)

    _LOGGER.info(
        "PlanaVista config saved via save_config service (calendars=%d, onboarding=%s)",
        len(new_data.get(CONF_CALENDARS, [])),
        new_data.get(CONF_ONBOARDING_COMPLETE),
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
        "PlanaVista: create_event_with_attendees called, "
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
            for cal_eid in sorted(_async_configured_calendar_ids(hass)):
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `32 passed`.

Live check on the dev HA (the card uses WebSocket `call_service`):

```bash
scripts/dev-ha.sh deploy
python scripts/ha.py ws '{"type": "call_service", "domain": "planavista", "service": "delete_event", "service_data": {"entity_id": "calendar.not_configured", "uid": "x"}}'
python scripts/ha.py ws '{"type": "call_service", "domain": "planavista", "service": "save_config", "service_data": {"calendars": [{"entity_id": "sensor.not_a_calendar"}]}}'
python scripts/ha.py api GET /api/states/sensor.planavista_config
```

Expected: the first reply has `"success": false`, `"code": "service_validation_error"`, `"translation_key": "calendar_not_configured"`; the second has `"code": "invalid_format"`; the sensor still lists the dev calendars (nothing was stored).

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/services.py custom_components/planavista/const.py custom_components/planavista/strings.json custom_components/planavista/translations/en.json tests/test_services.py
git commit -F - <<'EOF'
fix: validate service input and limit event changes to configured calendars

save_config validates its data with voluptuous schemas and requires an
administrator. The event services and WebSocket commands accept only
calendars configured in PlanaVista, keep working for non-admin users with
control permission, and raise ServiceValidationError or HomeAssistantError
with translated messages instead of bare exceptions.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A5: Refresh as soon as configured calendars appear after a restart

**Files:**
- Modify: `custom_components/planavista/coordinator.py:10-12, 23, 53, 213-215`
- Modify: `custom_components/planavista/__init__.py:40-41`
- Test: `tests/test_startup.py`

**Interfaces:**
- Consumes: `async_set_calendars`, `async_apply_config` (Task A3); `async_load_calendars`, `FakeCalendar` (Task A2).
- Produces:
  - `coordinator.CALENDAR_REFRESH_COOLDOWN_SECONDS = 1.0`.
  - `PlanaVistaCoordinator.async_start_tracking() -> None` (callback; call once after the first refresh). It subscribes with `async_track_state_change_event` to the configured calendar entity ids, registers unsubscribe and debouncer shutdown with `config_entry.async_on_unload`, and, when HA is not yet running, schedules one refresh via `async_at_started`.
  - `async_set_calendars()` now re-subscribes to the new calendar list.
  - Private: `_calendar_refresh: Debouncer` (immediate, 1 s cooldown, function `async_refresh`), `_async_track_calendars()`, `_async_stop_tracking()`, `_async_handle_calendar_state(event)`, `_async_handle_started(hass)`.

Why it cannot loop: a refresh is requested only when a configured calendar's state goes from missing or `unavailable` to anything else. A calendar that never appears produces no state events, ordinary on/off changes are ignored, and refreshing writes only the PlanaVista sensors, which are not tracked. The startup hook fires once.

Why a dedicated debouncer: the coordinator's own `async_request_refresh` debouncer has a 10 s cooldown, so after the first calendar appears the others would wait 10 s. Calendars arrive in a burst after a restart; the 1 s cooldown refreshes on the first and picks up the rest a second later.

- [ ] **Step 1: Write the failing test**

Create `tests/test_startup.py`:

```python
"""Tests for refreshing when calendars appear after PlanaVista has loaded."""
from __future__ import annotations

from copy import deepcopy
from datetime import timedelta
from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_UNAVAILABLE
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import (
    CONFIGURED_CALENDARS,
    DEFAULT_ENTRY_DATA,
    FakeCalendar,
    async_load_calendars,
)

NEVER_ADDED = {
    "entity_id": "calendar.never_added",
    "display_name": "Gone",
    "color": "#90BE6D",
    "color_light": "#D8E8CC",
    "icon": "mdi:account",
    "person_entity": "",
    "visible": True,
}


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """Configure Alex, Blair, and a calendar entity that never exists."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = [*deepcopy(CONFIGURED_CALENDARS), dict(NEVER_ADDED)]
    data["onboarding_complete"] = True
    return data


def _calendar_ids(hass: HomeAssistant) -> list[str]:
    state = hass.states.get("sensor.planavista_config")
    return [calendar["entity_id"] for calendar in state.attributes["calendars"]]


async def test_refresh_when_configured_calendars_appear(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    fake_calendars: dict[str, FakeCalendar],
) -> None:
    """Calendars added after PlanaVista loads show up without waiting for the poll."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert _calendar_ids(hass) == []

    await async_load_calendars(hass, fake_calendars)
    # The first calendar refreshes at once and the rest within the 1 s cooldown,
    # far inside the 60 s poll interval.
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=2))
    await hass.async_block_till_done()

    assert _calendar_ids(hass) == ["calendar.test_alex", "calendar.test_blair"]


async def test_missing_calendar_does_not_cause_refreshes(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """A configured calendar that never appears, and ordinary state flips, never refresh."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.states.async_set("sensor.unrelated", "1")
        hass.states.async_set("calendar.test_alex", "on")
        hass.states.async_set("calendar.test_alex", "off")
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=30))
        await hass.async_block_till_done()
        assert update.await_count == 0

        # A configured calendar coming back from unavailable refreshes once.
        hass.states.async_set("calendar.test_blair", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_blair", "off")
        await hass.async_block_till_done()
        assert update.await_count == 1

        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=45))
        await hass.async_block_till_done()
        assert update.await_count == 1


async def test_refreshes_once_when_home_assistant_has_started(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Loading during startup refreshes once when startup finishes, then stays quiet."""
    hass.set_state(CoreState.not_running)
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.set_state(CoreState.running)
        hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
        await hass.async_block_till_done()
        assert update.await_count == 1

        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=30))
        await hass.async_block_till_done()
        assert update.await_count == 1


async def test_tracking_follows_saved_calendars(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """After save_config changes the calendar list, only the new list triggers refreshes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = mock_config_entry.runtime_data

    await hass.services.async_call(
        "planavista",
        "save_config",
        {"calendars": [CONFIGURED_CALENDARS[0]]},
        blocking=True,
    )
    await hass.async_block_till_done()

    with patch.object(
        coordinator, "_async_update_data", wraps=coordinator._async_update_data
    ) as update:
        hass.states.async_set("calendar.test_blair", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_blair", "off")
        await hass.async_block_till_done()
        assert update.await_count == 0

        hass.states.async_set("calendar.test_alex", STATE_UNAVAILABLE)
        hass.states.async_set("calendar.test_alex", "off")
        await hass.async_block_till_done()
        assert update.await_count == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_startup.py -v`

Expected: `4 failed`. `test_refresh_when_configured_calendars_appear` fails with `assert [] == ['calendar.test_alex', 'calendar.test_blair']`; the other three fail with `assert 0 == 1` on `update.await_count`. (`test_missing_calendar_does_not_cause_refreshes` gets past its first `== 0` assertion; the failure is the missing refresh when Blair comes back.)

- [ ] **Step 3: Write minimal implementation**

Line numbers below refer to each file as it is before this task; apply the edits from the bottom of a file upward, or match on the quoted text.

`custom_components/planavista/coordinator.py`: replace lines 10-12:

```python
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
```

with:

```python
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import (
    CALLBACK_TYPE,
    CoreState,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
```

After line 23 (`_LOGGER = logging.getLogger(__name__)`) add:

```python

# Calendars usually appear in a burst after a restart: refresh on the first
# one, then at most once per second while the rest arrive.
CALENDAR_REFRESH_COOLDOWN_SECONDS = 1.0
```

Replace line 53 (the last line of `__init__`):

```python
        self.calendars: list[dict[str, Any]] = list(entry.data.get(CONF_CALENDARS, []))
```

with:

```python
        self.calendars: list[dict[str, Any]] = list(entry.data.get(CONF_CALENDARS, []))
        self._unsub_calendar_tracking: CALLBACK_TYPE | None = None
        self._calendar_refresh = Debouncer(
            hass,
            _LOGGER,
            cooldown=CALENDAR_REFRESH_COOLDOWN_SECONDS,
            immediate=True,
            function=self.async_refresh,
        )

    @callback
    def async_start_tracking(self) -> None:
        """Refresh as soon as a configured calendar appears or HA finishes starting.

        After a restart, calendar entities are often added after PlanaVista
        loads. Without this the card stays empty until the next poll.
        """
        self._async_track_calendars()
        self.config_entry.async_on_unload(self._async_stop_tracking)
        self.config_entry.async_on_unload(self._calendar_refresh.async_shutdown)
        if self.hass.state is not CoreState.running:
            self.config_entry.async_on_unload(
                async_at_started(self.hass, self._async_handle_started)
            )

    @callback
    def _async_track_calendars(self) -> None:
        """Subscribe to state changes of the configured calendar entities."""
        self._async_stop_tracking()
        entity_ids = [cal["entity_id"] for cal in self.calendars if cal.get("entity_id")]
        if entity_ids:
            self._unsub_calendar_tracking = async_track_state_change_event(
                self.hass, entity_ids, self._async_handle_calendar_state
            )

    @callback
    def _async_stop_tracking(self) -> None:
        """Drop the calendar state subscription."""
        if self._unsub_calendar_tracking is not None:
            self._unsub_calendar_tracking()
            self._unsub_calendar_tracking = None

    @callback
    def _async_handle_calendar_state(self, event: Event[EventStateChangedData]) -> None:
        """Refresh when a configured calendar appears or becomes available.

        Ordinary on/off changes are ignored, and a calendar that never
        appears produces no events, so this cannot loop.
        """
        new_state = event.data["new_state"]
        old_state = event.data["old_state"]
        if new_state is None or new_state.state == STATE_UNAVAILABLE:
            return
        if old_state is not None and old_state.state != STATE_UNAVAILABLE:
            return
        self._calendar_refresh.async_schedule_call()

    @callback
    def _async_handle_started(self, hass: HomeAssistant) -> None:
        """Refresh once Home Assistant has finished starting."""
        self._calendar_refresh.async_schedule_call()
```

Replace `async_set_calendars` (lines 213-215 before the insertion above; search for it):

```python
    def async_set_calendars(self, calendars: list[dict[str, Any]]) -> None:
        """Replace the configured calendars; the next refresh uses them."""
        self.calendars = list(calendars)
```

with:

```python
    def async_set_calendars(self, calendars: list[dict[str, Any]]) -> None:
        """Replace the configured calendars; the next refresh uses them."""
        self.calendars = list(calendars)
        self._async_track_calendars()
```

`custom_components/planavista/__init__.py`: replace lines 40-41:

```python
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
```

with:

```python
    await coordinator.async_config_entry_first_refresh()
    coordinator.async_start_tracking()
    entry.runtime_data = coordinator
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `36 passed`.

Live check on the dev HA (the restart race reproduced in CLAUDE.md):

```bash
scripts/dev-ha.sh deploy
docker restart planavista-dev-ha >/dev/null && scripts/dev-ha.sh wait
python - <<'EOF'
import sys, time
sys.path.insert(0, "scripts")
import ha
url, token = ha.target(False)
start = time.time()
while time.time() - start < 10:
    status, state = ha.http("GET", f"{url}/api/states/sensor.planavista_config", token)
    if status == 200:
        attrs = state["attributes"]
        print(f"{time.time() - start:.1f}s: {len(attrs['calendars'])} calendars, {len(attrs['events'])} events")
        if attrs["calendars"]:
            break
    time.sleep(1)
EOF
```

Expected: within about 5 s of HA answering, `3 calendars` (Test Alex, Blair, Casey) and their events. Before this task the same check printed `0 calendars` for 30 s or more.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/coordinator.py custom_components/planavista/__init__.py tests/test_startup.py
git commit -F - <<'EOF'
fix: refresh as soon as configured calendars appear after a restart

The coordinator watches the configured calendar entities and refreshes
when one appears or comes back from unavailable, and once when Home
Assistant finishes starting. A calendar that never appears causes no
refreshes. The subscription follows calendar list changes.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A6: Keep the upcoming-events list out of the recorder; timezone-aware timestamp

**Files:**
- Modify: `custom_components/planavista/sensor.py:4-6, 12, 70-98`
- Test: `tests/test_sensor.py`

**Interfaces:**
- Consumes: `sensor.planavista_upcoming_events` and `sensor.planavista_config` (unchanged entity ids and attribute names).
- Produces: `PlanaVistaUpcomingEventsSensor._unrecorded_attributes = frozenset({"events", "last_updated"})`; `last_updated` is `dt_util.now().isoformat()` (with a UTC offset).

The test reads `State.state_info["unrecorded_attributes"]`, the exact set the recorder strips (set by `Entity.async_internal_added_to_hass` in HA 2026.9), so no recorder database is needed.

- [ ] **Step 1: Write the failing test**

Create `tests/test_sensor.py`:

```python
"""Tests for what the PlanaVista sensors send to the recorder."""
from __future__ import annotations

from datetime import datetime, timedelta

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.calendar import CalendarEvent
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import FakeCalendar


async def test_sensors_keep_large_attributes_out_of_the_recorder(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """Event lists and the refresh timestamp are live-only attributes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    config_state = hass.states.get("sensor.planavista_config")
    assert {"events", "calendars"} <= config_state.state_info["unrecorded_attributes"]

    upcoming = hass.states.get("sensor.planavista_upcoming_events")
    assert {"events", "last_updated"} <= upcoming.state_info["unrecorded_attributes"]


async def test_upcoming_events_timestamp_is_timezone_aware(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    """last_updated carries a UTC offset."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    state = hass.states.get("sensor.planavista_upcoming_events")
    last_updated = datetime.fromisoformat(state.attributes["last_updated"])
    assert last_updated.tzinfo is not None
    assert abs(last_updated - dt_util.now()) < timedelta(minutes=1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_sensor.py -v`

Expected: `2 failed`: `assert {'events', 'last_updated'} <= frozenset(...)` ("Extra items in the left set") and `assert None is not None` for `last_updated.tzinfo`.

- [ ] **Step 3: Write minimal implementation**

In `custom_components/planavista/sensor.py`, replace lines 4-6:

```python
import logging
from datetime import datetime
from typing import Any
```

with:

```python
import logging
from typing import Any
```

After line 12 (`from homeassistant.helpers.update_coordinator import CoordinatorEntity`) add:

```python
from homeassistant.util import dt as dt_util
```

Replace lines 70-98 (the whole `PlanaVistaUpcomingEventsSensor` class) with:

```python
class PlanaVistaUpcomingEventsSensor(CoordinatorEntity, SensorEntity):
    """Sensor that shows upcoming events count."""

    # The 7-day event list is large and the timestamp changes on every
    # refresh. Neither is useful in history, so the recorder skips both.
    _unrecorded_attributes = frozenset({"events", "last_updated"})

    def __init__(self, coordinator: PlanaVistaCoordinator, entry: ConfigEntry) -> None:
        """Initialize the upcoming events sensor."""
        super().__init__(coordinator)
        self._entry = entry
        self._attr_name = f"{SENSOR_PREFIX}_upcoming_events"
        self._attr_unique_id = f"{entry.entry_id}_upcoming_events"
        self._attr_icon = "mdi:calendar-clock"

    @property
    def state(self) -> int:
        """Return the count of upcoming events."""
        if not self.coordinator.data:
            return 0
        return len(self.coordinator.data.get("upcoming_events", []))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        data = self.coordinator.data or {}
        return {
            "events": data.get("upcoming_events", []),
            "last_updated": dt_util.now().isoformat(),
        }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `38 passed`.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/sensor.py tests/test_sensor.py
git commit -F - <<'EOF'
fix: keep upcoming-event lists out of the recorder

The upcoming-events sensor no longer records its event list and refresh
timestamp, and the timestamp now carries a UTC offset.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A7: Time out every Google Calendar request and fall back cleanly

**Files:**
- Modify: `custom_components/planavista/google_api.py` (replace the whole file)
- Modify: `custom_components/planavista/const.py:83-84`
- Modify: `custom_components/planavista/services.py:4-7, 26, 57-61, 351-355, 419-647`
- Test: `tests/test_google_api.py`

**Interfaces:**
- Consumes: `_async_ws_check_calendars`, `_async_configured_calendar_ids` (Task A4).
- Produces:
  - `const.GOOGLE_API_TIMEOUT_SECONDS = 15`.
  - `google_api.GoogleApiError(HomeAssistantError)` with attribute `status: int | None` (HTTP status, `None` for network errors and timeouts).
  - `async_get_google_token(hass, entity_id) -> str | None`: returns `None` (and logs a warning starting `Could not get a Google access token for <entity_id>`) when the token cannot be refreshed, instead of returning the expired token.
  - `async_google_create_event(...)` raises `GoogleApiError` instead of `Exception`.
  - New: `async_google_find_event(hass, access_token, calendar_id, ical_uid) -> dict | None`, `async_google_patch_event(hass, access_token, calendar_id, event_id, body) -> dict`.
  - WebSocket error codes are unchanged: `lookup_failed` (HTTP error), `lookup_error` (network error or timeout), `not_found`, `patch_failed` (HTTP error), `patch_error` (network error or timeout); response shapes `{"organizer_entity_id": ...}` and `{"success": True, "event_id": ...}` are unchanged.

Each request (including the body read) and each token refresh runs inside `asyncio.timeout(GOOGLE_API_TIMEOUT_SECONDS)` and catches `aiohttp.ClientError`, `TimeoutError` (the same class as `asyncio.TimeoutError` on Python 3.11+), and `ValueError` (bad JSON) explicitly. `asyncio.timeout` is used rather than `aiohttp.ClientTimeout` because it also bounds the token refresh and because the test mocker ignores `ClientTimeout`, so only an `asyncio.timeout` can be proven by a test. Token refresh failures in HA 2026.9 arrive as `OAuth2TokenRequestError` (a `ClientResponseError`, so a `ClientError`), `ImplementationUnavailableError` (`HomeAssistantError`), or `ValueError("Implementation not available")`; all are caught. Using `OAuth2Session.token` after `async_ensure_token_valid()` replaces the hand-rolled `expires_at` check.

- [ ] **Step 1: Write the failing test**

Create `tests/test_google_api.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_google_api.py -v`

Expected: `3 failed, 1 passed, 11 errors`. The errors and failures are `AttributeError: <module 'custom_components.planavista.google_api' ...> does not have the attribute 'GOOGLE_API_TIMEOUT_SECONDS'` (or `'async_get_config_entry_implementation'`); `test_google_calendar_id_strips_account_prefix` passes and guards the existing id mapping.

- [ ] **Step 3: Write minimal implementation**

Line numbers below refer to each file as it is before this task; apply the edits from the bottom of a file upward, or match on the quoted text.

`custom_components/planavista/const.py`: replace lines 83-84:

```python
# Update intervals
UPDATE_INTERVAL_SECONDS: Final = 60
```

with:

```python
# Update intervals
UPDATE_INTERVAL_SECONDS: Final = 60

# Upper bound for each Google Calendar API request (and token refresh)
GOOGLE_API_TIMEOUT_SECONDS: Final = 15
```

Replace `custom_components/planavista/google_api.py` entirely with:

```python
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
```

`custom_components/planavista/services.py`:

1. Lines 4-7, drop `urllib.parse`:

```python
from collections.abc import Iterable
import logging
from typing import Any
```

2. Delete line 26: `from homeassistant.helpers.aiohttp_client import async_get_clientsession`

3. Replace the Google import (lines 57-61) with:

```python
from .google_api import (
    GoogleApiError,
    async_get_google_token,
    async_google_create_event,
    async_google_find_event,
    async_google_patch_event,
    get_google_calendar_id,
)
```

4. In `_async_create_event_with_attendees`, replace lines 351-355:

```python
            except Exception as err:
                _LOGGER.error(
                    "PlanaVista: Google API create FAILED for calendar '%s': %s",
                    primary_cal_id, err,
                )
```

with:

```python
            except GoogleApiError as err:
                _LOGGER.warning(
                    "Google Calendar could not create the event on %s; "
                    "creating a separate event on each calendar instead: %s",
                    primary_cal_id, err,
                )
```

5. Replace everything from the `@websocket_api.websocket_command(` decorator of `ws_get_event_organizer` (line 419) to the end of the file (line 647) with:

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `53 passed` (the timeout cases finish in about 0.05 s each because the tests patch the timeout).

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/google_api.py custom_components/planavista/const.py custom_components/planavista/services.py tests/test_google_api.py
git commit -F - <<'EOF'
fix: time out Google Calendar requests and fall back cleanly

Every Google Calendar request and token refresh has a 15-second timeout.
Network errors, timeouts, and HTTP errors raise GoogleApiError: event
creation falls back to one event per calendar, organizer lookups answer
None, and updates return the existing error codes. A token that cannot be
refreshed is no longer used.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A8: Serve only frontend/dist with a cache-busting script URL

**Files:**
- Modify: `custom_components/planavista/__init__.py:4-5, 12-14, 24-27, 48-66`
- Modify: `custom_components/planavista/const.py:89-90`
- Test: `tests/test_frontend.py`

**Interfaces:**
- Consumes: `async_register_frontend(hass)` (called from `async_setup`, Task A2).
- Produces:
  - `const.FRONTEND_URL_PATH = "/planavista_panel/dist"`, `const.FRONTEND_BUNDLE = "planavista-cards.js"`.
  - `__init__.FRONTEND_DIST: Path` (`frontend/dist`), `_bundle_hash(bundle: Path) -> str` (first 8 hex digits of SHA-256; runs in the executor).
  - Script URL `/planavista_panel/dist/planavista-cards.js?v=<manifest version>-<hash>`, for example `?v=1.0.0-b2d0b2c9`.

The URL path keeps today's `/planavista_panel/dist/planavista-cards.js`, so a stale page or a manually added Lovelace resource still loads the card; only `frontend/dist` is published now, so `src/`, `package.json`, and `node_modules/` return 404. Nothing in `frontend/src` references the URL (checked with `grep -rn planavista_panel`). The version comes from the manifest through `async_get_integration`, so it cannot drift from `const.VERSION`. `cache_headers` stays `False`, which keeps `scripts/dev-ha.sh deploy-frontend` plus a hard refresh working without an HA restart.

- [ ] **Step 1: Write the failing test**

Create `tests/test_frontend.py`:

```python
"""Tests for how the card bundle is served."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.typing import ClientSessionGenerator

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant

INTEGRATION_DIR = Path(__file__).parent.parent / "custom_components" / "planavista"
BUNDLE = INTEGRATION_DIR / "frontend" / "dist" / "planavista-cards.js"


def _expected_url() -> str:
    version = json.loads((INTEGRATION_DIR / "manifest.json").read_text())["version"]
    digest = hashlib.sha256(BUNDLE.read_bytes()).hexdigest()[:8]
    return f"/planavista_panel/dist/planavista-cards.js?v={version}-{digest}"


async def test_bundle_url_carries_version_and_hash(
    hass: HomeAssistant, mock_config_entry: MockConfigEntry
) -> None:
    """The card script URL changes whenever the version or the bundle changes."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()

    expected = await hass.async_add_executor_job(_expected_url)
    urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert expected in urls
    assert "/planavista_panel/dist/planavista-cards.js" not in urls


async def test_only_the_bundle_folder_is_served(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    hass_client_no_auth: ClientSessionGenerator,
) -> None:
    """Sources and build files next to dist/ are not published."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_client_no_auth()

    response = await client.get("/planavista_panel/dist/planavista-cards.js")
    assert response.status == 200

    for path in (
        "/planavista_panel/package.json",
        "/planavista_panel/rollup.config.mjs",
        "/planavista_panel/src/main.ts",
    ):
        response = await client.get(path)
        assert response.status == 404, path
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_frontend.py -v`

Expected: `2 failed`: `assert '/planavista_panel/dist/planavista-cards.js?v=1.0.0-<hash>' in frozenset({'/planavista_panel/dist/planavista-cards.js'})` and `AssertionError: /planavista_panel/package.json` (`assert 200 == 404`).

- [ ] **Step 3: Write minimal implementation**

Line numbers below refer to each file as it is before this task; apply the edits from the bottom of a file upward, or match on the quoted text.

`custom_components/planavista/const.py`: after line 90 (`SENSOR_PREFIX: Final = "planavista"`) add:

```python

# Card bundle: frontend/dist is served at FRONTEND_URL_PATH
FRONTEND_URL_PATH: Final = "/planavista_panel/dist"
FRONTEND_BUNDLE: Final = "planavista-cards.js"
```

`custom_components/planavista/__init__.py`:

1. Lines 4-5 become:

```python
import hashlib
import logging
from pathlib import Path
```

2. Lines 12-14 become:

```python
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .const import DOMAIN, FRONTEND_BUNDLE, FRONTEND_URL_PATH
```

3. Replace lines 24-27:

```python
# Frontend resource URL - single bundled output from LitElement/TypeScript build
FRONTEND_SCRIPTS = [
    "/planavista_panel/dist/planavista-cards.js",
]
```

with:

```python
# Only the built bundle is published; sources next to it stay private.
FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
```

4. Replace `async_register_frontend` (lines 48-66) with:

```python
def _bundle_hash(bundle: Path) -> str:
    """Return the first 8 hex digits of the bundle's SHA-256."""
    return hashlib.sha256(bundle.read_bytes()).hexdigest()[:8]


async def async_register_frontend(hass: HomeAssistant) -> None:
    """Serve frontend/dist and load the card with a cache-busting URL.

    The ?v= query changes whenever the integration version or the bundle
    changes, so browsers fetch the new card after an update.
    """
    integration = await async_get_integration(hass, DOMAIN)
    bundle_hash = await hass.async_add_executor_job(
        _bundle_hash, FRONTEND_DIST / FRONTEND_BUNDLE
    )

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=FRONTEND_URL_PATH,
                path=str(FRONTEND_DIST),
                cache_headers=False,
            )
        ]
    )

    script_url = (
        f"{FRONTEND_URL_PATH}/{FRONTEND_BUNDLE}?v={integration.version}-{bundle_hash}"
    )
    add_extra_js_url(hass, script_url)
    _LOGGER.debug("PlanaVista card registered at %s", script_url)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `55 passed`.

Live check on the dev HA (`deploy` copies `frontend/src` into the container too, so the 404 is meaningful):

```bash
scripts/dev-ha.sh deploy
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8124/planavista_panel/dist/planavista-cards.js
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8124/planavista_panel/src/main.ts
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8124/planavista_panel/package.json
curl -s http://127.0.0.1:8124/ | grep -o '/planavista_panel/[^"]*' | sort -u
```

Expected: `200`, `404`, `404`, then `/planavista_panel/dist/planavista-cards.js?v=1.0.0-` followed by 8 hex digits. Hard-refresh `http://127.0.0.1:8124/wall-calendar/planavista` and confirm the card renders.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/__init__.py custom_components/planavista/const.py tests/test_frontend.py
git commit -F - <<'EOF'
fix: serve only the built card bundle with a versioned URL

The static path now publishes frontend/dist only, at the same URL as
before. The script URL carries the integration version and a hash of the
bundle, so browsers load the new card after an update.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task A9: Metadata that matches the code (services.yaml, manifest, hacs.json, translations) and CI validation

**Files:**
- Modify: `custom_components/planavista/services.yaml:1-181` (replace the whole file)
- Modify: `custom_components/planavista/manifest.json:1-14` (replace the whole file)
- Modify: `hacs.json:1-7` (replace the whole file)
- Modify: `custom_components/planavista/translations/en.json:27` (make it identical to `strings.json`)
- Create: `.github/workflows/validate.yml`
- Modify (local only, gitignored): `CLAUDE.md`
- Test: `tests/test_metadata.py`

**Interfaces:**
- Consumes: `SAVE_CONFIG_SCHEMA`, `DELETE_EVENT_SCHEMA`, `CREATE_EVENT_SCHEMA` (Task A4).
- Produces: `services.yaml` documenting exactly `save_config`, `delete_event`, `create_event_with_attendees` with the schema field names; manifest without `lovelace` and with `"after_dependencies": ["calendar", "google"]`; `hacs.json` with only `name`, `render_readme`, `homeassistant: "2026.3.0"`; CI workflow `Validate` with jobs `hassfest`, `hacs`, `backend-tests`.

Notes:
- `after_dependencies` makes HA set up `calendar` and `google` first when they are configured, which shortens the startup race further; it never forces them to load.
- hassfest (`ghcr.io/home-assistant/hassfest`) already passes on today's tree and passes after this task; for custom integrations it reads `translations/en.json`, so the two translation files must stay identical (the test enforces it). `en.json` line 27 currently lacks the sentence about removing calendars that `strings.json` has.
- The frontend plan adds its own CI job; keep it in a separate workflow file or append a job to `validate.yml`.

- [ ] **Step 1: Write the failing test**

Create `tests/test_metadata.py`:

```python
"""Tests that the metadata files describe what the integration really does."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import voluptuous as vol
import yaml

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.services import (
    CREATE_EVENT_SCHEMA,
    DELETE_EVENT_SCHEMA,
    SAVE_CONFIG_SCHEMA,
)

REPO = Path(__file__).parent.parent
INTEGRATION_DIR = REPO / "custom_components" / "planavista"


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _schema_fields(schema: Any) -> set[str]:
    """Return the field names of a service schema (unwrapping vol.All)."""
    if isinstance(schema, vol.All):
        schema = schema.validators[0]
    return {str(key) for key in schema.schema}


async def test_services_yaml_documents_exactly_the_registered_services(
    hass: HomeAssistant,
) -> None:
    """Every registered service is documented with its real fields, and nothing else."""
    assert await async_setup_component(hass, DOMAIN, {})
    documented = await hass.async_add_executor_job(
        lambda: yaml.safe_load((INTEGRATION_DIR / "services.yaml").read_text("utf-8"))
    )

    assert set(documented) == set(hass.services.async_services_for_domain(DOMAIN))
    for service, schema in (
        ("save_config", SAVE_CONFIG_SCHEMA),
        ("delete_event", DELETE_EVENT_SCHEMA),
        ("create_event_with_attendees", CREATE_EVENT_SCHEMA),
    ):
        assert set(documented[service]["fields"]) == _schema_fields(schema), service


def test_english_translations_match_strings() -> None:
    """translations/en.json is what Home Assistant shows; it must equal strings.json."""
    assert _read_json(INTEGRATION_DIR / "translations" / "en.json") == _read_json(
        INTEGRATION_DIR / "strings.json"
    )


def test_manifest() -> None:
    """One entry only, no unused dependencies, and calendar sources load first."""
    manifest = _read_json(INTEGRATION_DIR / "manifest.json")

    assert manifest["single_config_entry"] is True
    assert manifest["dependencies"] == ["frontend", "http"]
    assert manifest["after_dependencies"] == ["calendar", "google"]
    # hassfest: domain and name first, then alphabetical.
    rest = [key for key in manifest if key not in ("domain", "name")]
    assert list(manifest) == ["domain", "name", *sorted(rest)]


def test_hacs_json() -> None:
    """Only keys HACS accepts, and the oldest Home Assistant that has local brand icons."""
    assert _read_json(REPO / "hacs.json") == {
        "name": "PlanaVista",
        "render_readme": True,
        "homeassistant": "2026.3.0",
    }
```

- [ ] **Step 2: Run test to verify it fails**

Run: `scripts/test-backend.sh tests/test_metadata.py -v`

Expected: `4 failed`: extra services `add_event`, `set_calendar_visibility`, `refresh_calendars` in services.yaml; `translations/en.json` differs from `strings.json` under `options`; `dependencies` contains `lovelace`; `hacs.json` has `domains` and `iot_class`.

- [ ] **Step 3: Write minimal implementation**

Replace `custom_components/planavista/services.yaml` with:

```yaml
# Services for PlanaVista

delete_event:
  name: Delete event
  description: Delete an event from a calendar that PlanaVista shows.
  fields:
    entity_id:
      name: Calendar
      description: Calendar that holds the event. It must be configured in PlanaVista.
      required: true
      selector:
        entity:
          domain: calendar
    uid:
      name: Event UID
      description: Unique ID of the event to delete.
      required: true
      selector:
        text:
    recurrence_id:
      name: Recurrence ID
      description: Which occurrence to delete when the event repeats.
      required: false
      selector:
        text:

create_event_with_attendees:
  name: Create event with attendees
  description: >
    Create an event on a PlanaVista calendar and add other PlanaVista calendars
    as attendees. When the organizer is a Google calendar, the event is created
    once through the Google Calendar API so attendees receive invitations.
    Otherwise each calendar gets its own copy of the event.
  fields:
    entity_id:
      name: Organizer calendar
      description: Calendar that owns the event. It must be configured in PlanaVista.
      required: true
      selector:
        entity:
          domain: calendar
    attendee_entity_ids:
      name: Attendee calendars
      description: Other PlanaVista calendars to add to the event.
      required: false
      selector:
        entity:
          domain: calendar
          multiple: true
    summary:
      name: Title
      description: Event title.
      required: true
      selector:
        text:
    start_date_time:
      name: Start time
      description: Start of a timed event (ISO 8601). Use with End time.
      required: false
      example: "2026-10-20T15:00:00"
      selector:
        text:
    end_date_time:
      name: End time
      description: End of a timed event (ISO 8601).
      required: false
      example: "2026-10-20T16:00:00"
      selector:
        text:
    start_date:
      name: Start date
      description: First day of an all-day event (YYYY-MM-DD). Use with End date.
      required: false
      example: "2026-10-20"
      selector:
        text:
    end_date:
      name: End date
      description: Day after the last day of an all-day event (YYYY-MM-DD, exclusive).
      required: false
      example: "2026-10-21"
      selector:
        text:
    description:
      name: Description
      description: Event notes.
      required: false
      selector:
        text:
          multiline: true
    location:
      name: Location
      description: Event location.
      required: false
      selector:
        text:

save_config:
  name: Save settings
  description: >
    Save the settings chosen in the card's setup wizard. Only administrators
    can call this service.
  fields:
    calendars:
      name: Calendars
      description: >
        Calendars to show, replacing the current list. Each item needs an
        entity_id (calendar.*) and may set display_name, color, color_light,
        icon, person_entity, and visible.
      required: false
      selector:
        object:
    display:
      name: Display settings
      description: >
        Display settings, replacing the current ones: time_format, weather_entity,
        first_day, default_view, theme, theme_overrides, and location_autocomplete.
      required: false
      selector:
        object:
    onboarding_complete:
      name: Setup complete
      description: Whether the card's setup wizard has finished.
      required: false
      selector:
        boolean:
```

Replace `custom_components/planavista/manifest.json` with:

```json
{
  "domain": "planavista",
  "name": "PlanaVista",
  "after_dependencies": ["calendar", "google"],
  "codeowners": ["@tavenhall1"],
  "config_flow": true,
  "dependencies": ["frontend", "http"],
  "documentation": "https://github.com/tavenhall1/planavista",
  "integration_type": "hub",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/tavenhall1/planavista/issues",
  "requirements": [],
  "single_config_entry": true,
  "version": "1.0.0"
}
```

Replace `hacs.json` with:

```json
{
  "name": "PlanaVista",
  "render_readme": true,
  "homeassistant": "2026.3.0"
}
```

Make the English translations identical to the source strings:

```bash
cp custom_components/planavista/strings.json custom_components/planavista/translations/en.json
```

Create `.github/workflows/validate.yml`:

```yaml
name: Validate

on:
  push:
    branches: [main, "fix/**"]
  workflow_dispatch:
  schedule:
    # Weekly, so a new Home Assistant release that breaks validation shows up.
    - cron: "0 6 * * 1"

permissions:
  contents: read

jobs:
  hassfest:
    name: hassfest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: home-assistant/actions/hassfest@master

  hacs:
    name: HACS validation
    runs-on: ubuntu-latest
    steps:
      - uses: hacs/action@main
        with:
          category: integration
          # Brand icons ship in custom_components/planavista/brand/ (Home Assistant 2026.3+).
          ignore: brands

  backend-tests:
    name: Backend tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.14"
          cache: pip
          cache-dependency-path: requirements_test.txt
      - run: pip install -r requirements_test.txt
      - run: pytest -q
```

Update `CLAUDE.md` (gitignored, so it is not committed):
- In **Known Issues**, delete these bullets, now fixed: the **Critical** options-flow/reload bullet; the **High ✔** "blank for up to 60 s" bullet; the **High** `save_config`/services/recorder bullet; the **Metadata** `hacs.json` bullet. Replace the "No tests and no CI" bullet with: `Backend tests: scripts/test-backend.sh (pytest-homeassistant-custom-component 0.13.367 = HA 2026.9.4, Python 3.14 in Docker; venv cached in the planavista-test-venv volume). CI: .github/workflows/validate.yml (hassfest, HACS, backend tests).`
- In **Repository Structure**, under `custom_components/planavista/`, add `coordinator.py` (coordinator, `async_apply_config`, calendar tracking), `services.py` (service and WebSocket handlers, schemas), and `google_api.py` (Google Calendar requests with timeouts); at the root add `tests/`, `requirements_test.txt`, `pyproject.toml`, `scripts/test-backend.sh`, `.github/workflows/validate.yml`.
- In **Architecture → Integration Setup**, replace the responsibilities list with: `async_setup` registers services, WebSocket commands, and the card bundle once; `async_setup_entry` stores the coordinator in `entry.runtime_data`; every settings change goes through `coordinator.async_apply_config` (no update listener, no reload).
- In **Architecture → Frontend**, replace "Registration happens in `async_setup_entry`" with "Registration happens in `async_setup`", and the served URL with `/planavista_panel/dist/planavista-cards.js?v=<version>-<bundle hash>` (only `frontend/dist` is served).
- In **Architecture → Configuration Flow**, delete "**Currently crashes on open** (see Known Issues)".

- [ ] **Step 4: Run test to verify it passes**

Run: `scripts/test-backend.sh -v`

Expected: `59 passed`.

Then run hassfest exactly as CI does (from the repo root, in Git Bash):

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "$(cygpath -m "$PWD"):/github/workspace" ghcr.io/home-assistant/hassfest
```

Expected: ends with `Integrations: 1` and `Invalid integrations: 0`.

Live check that the integration icon comes from `brand/` on the dev HA:

```bash
scripts/dev-ha.sh deploy
TOKEN=$(python -c "import json, pathlib; print(json.loads((pathlib.Path.home() / '.planavista-dev' / 'credentials.json').read_text())['token'])")
curl -s -H "Authorization: Bearer $TOKEN" -o "$TEMP/planavista-icon.png" -w '%{http_code}\n' http://127.0.0.1:8124/api/brands/integration/planavista/icon.png
cmp "$TEMP/planavista-icon.png" custom_components/planavista/brand/icon.png && echo "icon matches"
```

Expected: `200` and `icon matches`.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/services.yaml custom_components/planavista/manifest.json hacs.json custom_components/planavista/translations/en.json .github/workflows/validate.yml tests/test_metadata.py
git commit -F - <<'EOF'
chore: document only real services, correct HACS metadata, and validate in CI

services.yaml now describes exactly the registered services and their
fields. hacs.json keeps only valid keys and requires Home Assistant
2026.3.0 for local brand icons. The manifest drops the unused lovelace
dependency and loads after calendar and google. A workflow runs hassfest,
HACS validation, and the backend tests.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

---

## Part B: Frontend (TypeScript)

### Task B1: Frontend test harness and `parseEventDate`

Line numbers in every "Modify" entry refer to the files as they are before this plan; earlier tasks shift them, so locate each edit by the quoted code.

**Files:**
- Create: `custom_components/planavista/frontend/vitest.config.ts`
- Create: `custom_components/planavista/frontend/test/setup.ts`
- Modify: `custom_components/planavista/frontend/package.json:9-27` (script + devDependency; `package-lock.json` is regenerated by npm)
- Modify: `custom_components/planavista/frontend/src/utils/date-utils.ts:1-8`
- Modify: `CONTRIBUTING.md:41,56-66`
- Test: `custom_components/planavista/frontend/test/date-utils.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `isDateOnly(value: string): boolean`, `parseEventDate(value: string): Date` (date-only → local midnight; anything else → `new Date(value)`), `formatTime(value: string, format?: '12h' | '24h'): string` now parses through `parseEventDate`; `npm test` runs `vitest run` with `TZ=America/Chicago`.

- [ ] **Step 1: Write the failing test**

Install vitest (pinned, exact) and add the test script:

```bash
cd custom_components/planavista/frontend && npm install --save-dev --save-exact vitest@5.0.3
```

Edit `package.json` `scripts` (lines 9-13) so it reads:

```json
  "scripts": {
    "start": "rollup -c --watch",
    "build": "rollup -c",
    "test": "vitest run",
    "format": "prettier --write \"src/**/*.ts\""
  },
```

`devDependencies` must now end with `"vitest": "5.0.3"` (npm writes it; confirm there is no `^`).

Create `custom_components/planavista/frontend/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

// Run every test in the dev Home Assistant's zone (UTC-5/-6 with DST) so
// date bugs that only appear west of UTC reproduce on any machine. Forked
// workers inherit this; test/setup.ts sets it again inside each worker.
process.env.TZ = 'America/Chicago';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    setupFiles: ['./test/setup.ts'],
  },
});
```

Create `custom_components/planavista/frontend/test/setup.ts`:

```ts
// Node applies a runtime change to process.env.TZ immediately, so this pins
// the zone for every test file regardless of how the worker was started.
process.env.TZ = 'America/Chicago';
```

Create `custom_components/planavista/frontend/test/date-utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatTime, isDateOnly, parseEventDate } from '../src/utils/date-utils';

describe('test environment', () => {
  it('runs in America/Chicago', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Chicago');
    expect(new Date(2026, 9, 9).getTimezoneOffset()).toBe(300); // CDT, UTC-5
  });
});

describe('isDateOnly', () => {
  it('accepts YYYY-MM-DD only', () => {
    expect(isDateOnly('2026-10-09')).toBe(true);
    expect(isDateOnly('2026-10-09T00:00:00-05:00')).toBe(false);
    expect(isDateOnly('2026-10-09T10:00:00')).toBe(false);
    expect(isDateOnly('')).toBe(false);
  });
});

describe('parseEventDate', () => {
  it('maps an all-day date to local midnight of that day', () => {
    const d = parseEventDate('2026-10-09');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 9]);
    expect([d.getHours(), d.getMinutes()]).toEqual([0, 0]);
  });

  it('parses datetimes with an offset as that instant', () => {
    const d = parseEventDate('2026-10-09T10:00:00-04:00');
    expect(d.toISOString()).toBe('2026-10-09T14:00:00.000Z');
    expect([d.getDate(), d.getHours()]).toEqual([9, 9]); // 9:00 AM in Chicago
  });

  it('keeps the all-day date on the US fall-back day', () => {
    const d = parseEventDate('2026-11-01');
    expect([d.getMonth(), d.getDate(), d.getHours()]).toEqual([10, 1, 0]);
  });
});

describe('formatTime', () => {
  it('shows a timed event from another zone in local time', () => {
    expect(formatTime('2026-10-09T10:00:00-04:00', '12h')).toBe('9:00 AM');
    expect(formatTime('2026-10-09T10:00:00-04:00', '24h')).toBe('09:00');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/date-utils.test.ts
```

Expected: `Tests 4 failed | 2 passed (6)`. The two passing tests are "runs in America/Chicago" (proves the TZ pin works) and `formatTime`; the four failures are `TypeError: isDateOnly is not a function` / `TypeError: parseEventDate is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `src/utils/date-utils.ts` replace lines 1-8:

```ts
import { ViewType } from '../types';

/**
 * Format a time string from ISO datetime.
 */
export function formatTime(isoString: string, format: '12h' | '24h' = '12h'): string {
  const date = new Date(isoString);
```

with:

```ts
import { ViewType } from '../types';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True for a date-only value ("2026-10-09"), the form Home Assistant uses for
 * all-day event starts and (exclusive) ends.
 */
export function isDateOnly(value: string): boolean {
  return DATE_ONLY.test(value);
}

/**
 * Parse an event start/end string. Date-only values become LOCAL midnight of
 * that day (`new Date("2026-10-09")` would be UTC midnight, which is the
 * previous evening west of UTC). Datetimes, with or without an offset, parse
 * normally. Every event-date parse in the card goes through this.
 */
export function parseEventDate(value: string): Date {
  if (isDateOnly(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

/**
 * Format the local time of an event start/end string.
 */
export function formatTime(value: string, format: '12h' | '24h' = '12h'): string {
  const date = parseEventDate(value);
```

(The rest of `formatTime` is unchanged.)

Document the test command. In `CONTRIBUTING.md` replace line 41:

```markdown
- Ensure frontend builds without errors (`cd custom_components/planavista/frontend && npm run build`)
```

with:

```markdown
- Ensure the frontend builds and its tests pass (`cd custom_components/planavista/frontend && npm run build && npm test`)
```

In the Quick Start block (lines 56-60) add a line after `npm run start    # Watch mode with rebuilds`:

```bash
npm test         # Unit tests (vitest, always run in America/Chicago time)
```

and under "### Testing Changes" (after line 66) add:

```markdown
- **Frontend unit tests**: `npm test` in `custom_components/planavista/frontend`. Tests live in `frontend/test/*.test.ts` and always run with `TZ=America/Chicago` (set in `vitest.config.ts` and `test/setup.ts`), so date bugs that only appear west of UTC reproduce on every machine.
```

Also add `npm test` to the "Frontend (TypeScript/LitElement) Changes" section of the local, untracked `CLAUDE.md` (it is gitignored; do not stage it).

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/date-utils.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 6 passed (6)` twice, and `tsc` prints nothing.

- [ ] **Step 5: Commit**

From the repo root:

```bash
git add custom_components/planavista/frontend/package.json custom_components/planavista/frontend/package-lock.json custom_components/planavista/frontend/vitest.config.ts custom_components/planavista/frontend/test/setup.ts custom_components/planavista/frontend/test/date-utils.test.ts custom_components/planavista/frontend/src/utils/date-utils.ts CONTRIBUTING.md
git commit -F - <<'EOF'
fix(frontend): parse date-only event dates as local midnight

Add parseEventDate()/isDateOnly() so "2026-10-09" means local Oct 9
instead of UTC midnight, and route formatTime through it. Add vitest
(npm test) with the time zone pinned to America/Chicago.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B2: Event utilities use local-day parsing

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/event-utils.ts:1-2,57-123,156-166,179-180,223-225,233-234`
- Test: `custom_components/planavista/frontend/test/event-utils.test.ts`

**Interfaces:**
- Consumes: `isDateOnly`, `parseEventDate`, `getDateKey` from `src/utils/date-utils.ts` (Task B1)
- Produces: `compareEventsForDisplay(a: CalendarEvent, b: CalendarEvent): number` (all-day first, then by start instant); `getEventsForDateRange<T extends CalendarEvent>(events: T[], start: Date, end: Date): T[]` (now generic); `isMultiDayEvent` respects exclusive ends; `groupEventsByDate`, `isEventPast`, `isAllDayEvent`, `detectOverlaps` parse via `parseEventDate`.

Event-date parse sites replaced in this task (17 of the 28): `event-utils.ts:61` (`isEventPast`), `:72`, `:73` (`isAllDayEvent`), `:81`, `:82` (`isMultiDayEvent`), `:92`, `:93`, `:119` ×2 (`groupEventsByDate`), `:162`, `:163` (`getEventsForDateRange`), `:179`, `:180` (`getEventPosition`), `:224` ×2, `:233`, `:234` (`detectOverlaps`).

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/event-utils.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  compareEventsForDisplay,
  detectOverlaps,
  getEventsForDateRange,
  groupEventsByDate,
  isAllDayEvent,
  isEventPast,
  isMultiDayEvent,
} from '../src/utils/event-utils';

function ev(summary: string, start: string, end: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    summary,
    start,
    end,
    calendar_entity_id: 'calendar.test_alex',
    calendar_name: 'Alex',
    calendar_color: '#4A7FB5',
    calendar_color_light: '',
    ...extra,
  };
}

/** Local-day range [00:00, 23:59:59.999] like the views build. */
function day(y: number, m: number, d: number): [Date, Date] {
  return [new Date(y, m - 1, d, 0, 0, 0, 0), new Date(y, m - 1, d, 23, 59, 59, 999)];
}

const allDay = ev('All-day test', '2026-10-09', '2026-10-10');
const weekendTrip = ev('Weekend trip', '2026-10-10', '2026-10-13');

afterEach(() => {
  vi.useRealTimers();
});

describe('all-day events (date-only, exclusive end)', () => {
  it('are recognised as all-day', () => {
    expect(isAllDayEvent(allDay)).toBe(true);
    expect(isAllDayEvent(ev('Dentist', '2026-10-09T15:00:00-05:00', '2026-10-09T16:00:00-05:00'))).toBe(false);
  });

  it('land only on their own day', () => {
    expect([...groupEventsByDate([allDay]).keys()]).toEqual(['2026-10-09']);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 9))).toHaveLength(1);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 8))).toHaveLength(0);
    expect(getEventsForDateRange([allDay], ...day(2026, 10, 10))).toHaveLength(0);
  });

  it('span start..end-1 for multi-day events', () => {
    expect([...groupEventsByDate([weekendTrip]).keys()]).toEqual(['2026-10-10', '2026-10-11', '2026-10-12']);
    expect(getEventsForDateRange([weekendTrip], ...day(2026, 10, 13))).toHaveLength(0);
    expect(isMultiDayEvent(weekendTrip)).toBe(true);
    expect(isMultiDayEvent(allDay)).toBe(false); // the end date is exclusive
  });

  it('are not past until their last day is over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 20, 0)); // Fri Oct 9, 8 PM local
    expect(isEventPast(allDay)).toBe(false);
    vi.setSystemTime(new Date(2026, 9, 10, 0, 1));
    expect(isEventPast(allDay)).toBe(true);
  });
});

describe('timed events with an offset that differs from the browser zone', () => {
  // 10:00 in UTC-4 is 9:00 in Chicago (UTC-5 in October).
  const eastern = ev('Call', '2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00');
  // 23:30-00:30 in UTC-4 is 22:30-23:30 in Chicago: still Oct 9 only.
  const lateEastern = ev('Late call', '2026-10-09T23:30:00-04:00', '2026-10-10T00:30:00-04:00');

  it('are placed on the local day', () => {
    expect([...groupEventsByDate([eastern]).keys()]).toEqual(['2026-10-09']);
    expect([...groupEventsByDate([lateEastern]).keys()]).toEqual(['2026-10-09']);
    expect(getEventsForDateRange([lateEastern], ...day(2026, 10, 10))).toHaveLength(0);
  });

  it('overlap by instant, not by string', () => {
    const chicago = ev('Standup', '2026-10-09T09:30:00-05:00', '2026-10-09T10:00:00-05:00');
    const placed = detectOverlaps([chicago, eastern]);
    expect(placed.map(p => p.summary)).toEqual(['Call', 'Standup']); // 9:00 before 9:30
    expect(placed.every(p => p.totalColumns === 2)).toBe(true);
  });
});

describe('compareEventsForDisplay', () => {
  it('puts all-day events first, then orders by actual start instant', () => {
    const call = ev('Call', '2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'); // 9:00 local
    const standup = ev('Standup', '2026-10-09T09:30:00-05:00', '2026-10-09T10:00:00-05:00'); // 9:30 local
    const sorted = [standup, call, allDay].sort(compareEventsForDisplay);
    expect(sorted.map(e => e.summary)).toEqual(['All-day test', 'Call', 'Standup']);
  });

  it('orders each day group in groupEventsByDate', () => {
    const late = ev('Late', '2026-10-09T18:00:00-05:00', '2026-10-09T19:00:00-05:00');
    const early = ev('Early', '2026-10-09T08:00:00-05:00', '2026-10-09T09:00:00-05:00');
    const group = groupEventsByDate([late, early, allDay]).get('2026-10-09')!;
    expect(group.map(e => e.summary)).toEqual(['All-day test', 'Early', 'Late']);
  });
});

describe('timed events ending exactly at midnight', () => {
  it('do not spill onto the next day', () => {
    const e = ev('Movie', '2026-10-09T22:00:00-05:00', '2026-10-10T00:00:00-05:00');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-10-09']);
    expect(isMultiDayEvent(e)).toBe(false);
  });

  it('still cover every day an overnight event touches', () => {
    const shift = ev('Overnight shift', '2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect([...groupEventsByDate([shift]).keys()]).toEqual(['2026-10-09', '2026-10-10']);
    expect(isMultiDayEvent(shift)).toBe(true);
  });
});

describe('US fall-back day (2026-11-01)', () => {
  it('keeps an all-day event on Nov 1 only', () => {
    const e = ev('Fall back', '2026-11-01', '2026-11-02');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-11-01']);
    expect(getEventsForDateRange([e], ...day(2026, 11, 1))).toHaveLength(1);
    expect(getEventsForDateRange([e], ...day(2026, 11, 2))).toHaveLength(0);
  });

  it('keeps a 01:30 CDT -> 03:00 CST event on Nov 1 with real elapsed time', () => {
    const e = ev('Night shift', '2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00');
    expect([...groupEventsByDate([e]).keys()]).toEqual(['2026-11-01']);
    expect(isMultiDayEvent(e)).toBe(false);
    expect(isAllDayEvent(e)).toBe(false);
    const [o] = detectOverlaps([e]);
    expect(o.totalColumns).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-utils.test.ts
```

Expected: `Tests 7 failed | 5 passed (12)`. Failures: "land only on their own day" (All-day test grouped under `2026-10-08`), "span start..end-1 …", "are not past until their last day is over", both `compareEventsForDisplay` tests (`compareEventsForDisplay is not a function` / wrong group), "do not spill onto the next day", "keeps an all-day event on Nov 1 only" (grouped under `2026-10-31`).

- [ ] **Step 3: Write minimal implementation**

In `src/utils/event-utils.ts`:

1. Line 2: replace `import { getDateKey } from './date-utils';` with
   `import { getDateKey, isDateOnly, parseEventDate } from './date-utils';`

2. Replace lines 57-123 (from the `/**` above `isEventPast` through the closing `}` of `groupEventsByDate`) with:

```ts
/**
 * Check if an event has already ended.
 */
export function isEventPast(event: CalendarEvent): boolean {
  return parseEventDate(event.end) < new Date();
}

/**
 * Check if an event is all-day: a date-only start (how Home Assistant sends
 * all-day events), or a timed event running from one local midnight to a
 * later one.
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  if (isDateOnly(event.start)) return true;
  const s = parseEventDate(event.start);
  const e = parseEventDate(event.end);
  return s.getHours() === 0 && s.getMinutes() === 0 &&
    e.getHours() === 0 && e.getMinutes() === 0 &&
    getDateKey(s) !== getDateKey(e);
}

/**
 * The last moment an event covers. Ends are exclusive: an all-day end is the
 * next day's date and a timed event ending at 00:00 doesn't touch that day.
 */
function lastMoment(event: CalendarEvent, start: Date): Date {
  return new Date(Math.max(parseEventDate(event.end).getTime() - 1, start.getTime()));
}

/**
 * Check if an event spans multiple days.
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  const start = parseEventDate(event.start);
  return getDateKey(start) !== getDateKey(lastMoment(event, start));
}

/**
 * Display order: all-day events first, then by actual start instant
 * (start strings can carry different UTC offsets, so never compare them as text).
 */
export function compareEventsForDisplay(a: CalendarEvent, b: CalendarEvent): number {
  const aAllDay = isAllDayEvent(a);
  const bAllDay = isAllDayEvent(b);
  if (aAllDay !== bAllDay) return aAllDay ? -1 : 1;
  return parseEventDate(a.start).getTime() - parseEventDate(b.start).getTime();
}

/**
 * Group events by local date key, adding multi-day events to every day they cover.
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const start = parseEventDate(event.start);
    const lastKey = getDateKey(lastMoment(event, start));
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    // Bounded so malformed data can never spin forever.
    for (let i = 0; i < 1000; i++) {
      const key = getDateKey(current);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
      if (key === lastKey) break;
      current.setDate(current.getDate() + 1);
    }
  }
  for (const [, groupEvents] of groups) {
    groupEvents.sort(compareEventsForDisplay);
  }
  return groups;
}
```

3. Replace `getEventsForDateRange` (lines 156-166) with the generic version:

```ts
export function getEventsForDateRange<T extends CalendarEvent>(
  events: T[],
  start: Date,
  end: Date
): T[] {
  return events.filter(event => {
    const eventStart = parseEventDate(event.start);
    const eventEnd = parseEventDate(event.end);
    return eventStart < end && eventEnd > start;
  });
}
```

4. In `getEventPosition` (lines 179-180) replace
   `const start = new Date(event.start);` / `const end = new Date(event.end);` with
   `const start = parseEventDate(event.start);` / `const end = parseEventDate(event.end);`
   (Task B8 rewrites the rest of this function.)

5. In `detectOverlaps`, line 224: `(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()` →
   `(a, b) => parseEventDate(a.start).getTime() - parseEventDate(b.start).getTime()`;
   lines 233-234: `start: new Date(e.start).getTime(),` / `end: new Date(e.end).getTime(),` →
   `start: parseEventDate(e.start).getTime(),` / `end: parseEventDate(e.end).getTime(),`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-utils.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 12 passed (12)`; full suite `Tests 18 passed (18)`; `tsc` silent. Then confirm no raw event parses remain in this file:

```bash
cd custom_components/planavista/frontend && grep -n "new Date(\(e\|a\|b\|event\)\.\(start\|end\))" src/utils/event-utils.ts
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-utils.ts custom_components/planavista/frontend/test/event-utils.test.ts
git commit -F - <<'EOF'
fix(frontend): place all-day events on their own local day

Event grouping, range filtering, past checks, overlap layout and
sorting now parse starts/ends with parseEventDate. All-day and
midnight-ending events honour their exclusive end, and events are
ordered by start instant rather than by string.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B3: Views, chip and popup use the shared date parsing

UI wiring only (the helpers are unit-tested in Tasks B1-2), so this task verifies on the dev HA instead of with a new unit test.

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/pv-event-chip.ts:5,213-216`
- Modify: `custom_components/planavista/frontend/src/components/event-popup.ts:8,247`
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts:7-13,336-347`
- Modify: `custom_components/planavista/frontend/src/components/view-agenda.ts:12-18,280-287`

**Interfaces:**
- Consumes: `parseEventDate` (Task B1); `isAllDayEvent`, `compareEventsForDisplay`, generic `getEventsForDateRange` (Task B2)
- Produces: nothing new

Event-date parse sites replaced here (7 of the 28, plus one string compare): `pv-event-chip.ts:215` ×2, `event-popup.ts:247`, `view-week.ts:338`, `:339`, `:346` ×2, and the `a.start.localeCompare(b.start)` sort at `view-agenda.ts:286`. Of the other sites, `date-utils.ts:7` (`formatTime`) was fixed in Task B1, the 17 in `event-utils.ts` in Task B2, and `event-create-dialog.ts:563`, `:575` and `:1242` are replaced in Task B6.

- [ ] **Step 1: Implement**

`src/components/pv-event-chip.ts`:
- Line 5: `import { SharedEvent, buildStripeGradient, getOrganizerCalendar, isEventPast } from '../utils/event-utils';` →
  `import { SharedEvent, buildStripeGradient, getOrganizerCalendar, isAllDayEvent, isEventPast } from '../utils/event-utils';`
- Lines 213-216:

```ts
    // Time display
    const isAllDay = !event.start.includes('T') ||
      (new Date(event.end).getTime() - new Date(event.start).getTime() >= 86400000 &&
       event.start.includes('T00:00') && event.end.includes('T00:00'));
```

become:

```ts
    // Time display
    const isAllDay = isAllDayEvent(event);
```

`src/components/event-popup.ts`:
- Line 8: `import { formatTime, formatDate } from '../utils/date-utils';` → `import { formatTime, formatDate, parseEventDate } from '../utils/date-utils';`
- Line 247: `const startDate = new Date(event.start);` → `const startDate = parseEventDate(event.start);`

`src/components/view-week.ts`:
- Lines 7-13, replace `isAllDayEvent,` with `compareEventsForDisplay,` so the import reads:

```ts
import {
  compareEventsForDisplay,
  getEventsForDateRange,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
```

- Lines 336-347:

```ts
    // Get events for this day, sort all-day first then by start time
    const dayEvents = allEvents.filter(e => {
      const s = new Date(e.start);
      const en = new Date(e.end);
      return s < dayEnd && en > dayStart;
    }).sort((a, b) => {
      const aAll = isAllDayEvent(a);
      const bAll = isAllDayEvent(b);
      if (aAll && !bAll) return -1;
      if (!aAll && bAll) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
```

become:

```ts
    // Get events for this day, sort all-day first then by start time
    const dayEvents = getEventsForDateRange(allEvents, dayStart, dayEnd).sort(compareEventsForDisplay);
```

`src/components/view-agenda.ts`:
- Lines 12-18, replace `isAllDayEvent,` with `compareEventsForDisplay,`:

```ts
import {
  compareEventsForDisplay,
  groupEventsByDate,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
```

- Lines 280-287:

```ts
    // Sort: all-day first, then by start time
    const sorted = [...events].sort((a, b) => {
      const aAllDay = isAllDayEvent(a);
      const bAllDay = isAllDayEvent(b);
      if (aAllDay && !bAllDay) return -1;
      if (!aAllDay && bAllDay) return 1;
      return a.start.localeCompare(b.start);
    });
```

become:

```ts
    // Sort: all-day first, then by start time
    const sorted = [...events].sort(compareEventsForDisplay);
```

- [ ] **Step 2: Verify (type check, tests, build, dev HA)**

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test && grep -rn "new Date(\(e\|ev\|event\|a\|b\)\.\(start\|end\))\|\.start\.localeCompare\|start\.includes('T" src/components src/utils
```

Expected: `tsc` silent, `Tests 18 passed (18)`, and the grep prints only `src/components/event-create-dialog.ts:567` (fixed in Task B6).

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

(The rebuilt `dist/planavista-cards.js` is not staged in this task; the release task rebuilds and commits it.)

Chrome DevTools MCP: `new_page` with `url: "http://127.0.0.1:8124/wall-calendar/planavista"` and `isolatedContext: "planavista-dev"` (if that page is already open, `navigate_page` with `type: "reload"`, `ignoreCache: true`). Then `evaluate_script` on that page:

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  const readWeek = async (date) => {
    card._pv.state.setView('week');
    card._pv.state.setDate(date);
    await card.updateComplete;
    const week = card.shadowRoot.querySelector('pv-view-week');
    await week.updateComplete;
    return [...week.shadowRoot.querySelectorAll('.day-card')].map(dc => ({
      day: dc.querySelector('.day-name').textContent.trim(),
      events: [...dc.querySelectorAll('pv-event-chip')].map(c => c.event.summary),
    }));
  };
  const first = await readWeek(new Date(2026, 9, 9));
  const second = await readWeek(new Date(2026, 9, 11));
  const ev = card.hass.states['sensor.planavista_config'].attributes.events.find(e => e.summary === 'All-day test');
  card._pv.state.selectEvent(ev);
  await card.updateComplete;
  const popup = card.shadowRoot.querySelector('pv-event-popup');
  await popup.updateComplete;
  const popupDate = popup.shadowRoot.querySelector('.detail-text div').textContent.trim();
  card._pv.state.selectEvent(null);
  return { first, second, popupDate };
}
```

Expected (week starts Sunday): in `first`, `Thu 8` has no `All-day test`; `Fri 9` is `["All-day test", "Dentist", "Overnight shift"]`; `Sat 10` is `["Weekend trip", "Overnight shift", "Soccer practice"]`. In `second`, `Sun 11` is `["Weekend trip"]`, `Mon 12` is `["Weekend trip", "Team standup"]`, `Tue 13` is `[]`. `popupDate` is `"Friday, October 9, 2026"`. Take a screenshot of the week of Oct 4-10 for the record.

- [ ] **Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/pv-event-chip.ts custom_components/planavista/frontend/src/components/event-popup.ts custom_components/planavista/frontend/src/components/view-week.ts custom_components/planavista/frontend/src/components/view-agenda.ts
git commit -F - <<'EOF'
fix(frontend): show all-day events on the right day in every view

The week view, agenda, event chip and event popup now use the shared
event-date helpers, so date-only events no longer shift a day early and
events are sorted by start instant.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B4: Event form date math module

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/event-form.ts`
- Modify: `custom_components/planavista/frontend/src/utils/date-utils.ts:143` (insert `calendarDaysBetween` above the `/**` of `navigateDate`)
- Test: `custom_components/planavista/frontend/test/event-form.test.ts`

**Interfaces:**
- Consumes: `isDateOnly`, `parseEventDate` (Task B1), `getDateKey` (existing)
- Produces (all exported from `src/utils/event-form.ts`):
  - `interface EventFormDates { date: string; allDay: boolean; startTime: string; endTime: string; spanDays: number; endDayOffset: number }`
  - `type EventDatePayload = { start_date: string; end_date: string } | { start_date_time: string; end_date_time: string }`
  - `interface EventTextFields { summary: string; description?: string; location?: string }`
  - `toTimeString(d: Date): string`, `toLocalIsoString(d: Date): string`, `shiftDateKey(date: string, days: number): string`
  - `formDatesFromEvent(start: string, end?: string): EventFormDates`
  - `defaultFormDates(now: Date): EventFormDates`
  - `formEndDate(f: EventFormDates): string` (last covered day, YYYY-MM-DD)
  - `validateFormDates(f: EventFormDates): string | null`
  - `buildDatePayload(f: EventFormDates): EventDatePayload`
  - `withStartTime(f: EventFormDates, startTime: string): EventFormDates`
  - `buildEventBase(f: EventFormDates, text: EventTextFields): Omit<CreateEventData, 'entity_id'>`
  - In `date-utils.ts`: `calendarDaysBetween(a: Date, b: Date): number`

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/event-form.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calendarDaysBetween, parseEventDate } from '../src/utils/date-utils';
import {
  buildDatePayload,
  buildEventBase,
  defaultFormDates,
  formDatesFromEvent,
  formEndDate,
  toLocalIsoString,
  validateFormDates,
  withStartTime,
  type EventFormDates,
} from '../src/utils/event-form';

describe('calendarDaysBetween', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    expect(calendarDaysBetween(parseEventDate('2026-10-10'), parseEventDate('2026-10-13'))).toBe(3);
    // Nov 1 2026 is 25 hours long in Chicago.
    expect(calendarDaysBetween(parseEventDate('2026-11-01'), parseEventDate('2026-11-02'))).toBe(1);
    // Mar 8 2026 is 23 hours long.
    expect(calendarDaysBetween(parseEventDate('2026-03-08'), parseEventDate('2026-03-09'))).toBe(1);
  });
});

describe('formDatesFromEvent (prefill)', () => {
  it('prefills an all-day event on its own date', () => {
    const f = formDatesFromEvent('2026-10-09', '2026-10-10');
    expect(f).toMatchObject({ date: '2026-10-09', allDay: true, spanDays: 1 });
  });

  it('keeps the length of a multi-day all-day event', () => {
    const f = formDatesFromEvent('2026-10-10', '2026-10-13');
    expect(f).toMatchObject({ date: '2026-10-10', allDay: true, spanDays: 3 });
    expect(formEndDate(f)).toBe('2026-10-12'); // last day shown to the user
  });

  it('keeps a timed event that starts at midnight timed', () => {
    const f = formDatesFromEvent('2026-10-09T00:00:00-05:00', '2026-10-09T01:00:00-05:00');
    expect(f).toMatchObject({ date: '2026-10-09', allDay: false, startTime: '00:00', endTime: '01:00', endDayOffset: 0 });
  });

  it('shows a timed event from another zone in local time', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00');
    expect(f).toMatchObject({ date: '2026-10-09', startTime: '09:00', endTime: '10:00', endDayOffset: 0 });
  });

  it('keeps the end day of an overnight event', () => {
    const f = formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect(f).toMatchObject({ date: '2026-10-09', startTime: '22:00', endTime: '06:00', endDayOffset: 1 });
    expect(formEndDate(f)).toBe('2026-10-10');
  });

  it('handles the US fall-back day', () => {
    expect(formDatesFromEvent('2026-11-01', '2026-11-02')).toMatchObject({ date: '2026-11-01', spanDays: 1 });
    const f = formDatesFromEvent('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00');
    expect(f).toMatchObject({ date: '2026-11-01', startTime: '01:30', endTime: '03:00', endDayOffset: 0 });
  });
});

describe('buildDatePayload', () => {
  it('sends an exclusive all-day end (start + 1 day)', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09', '2026-10-10'))).toEqual({
      start_date: '2026-10-09',
      end_date: '2026-10-10',
    });
  });

  it('round-trips a multi-day all-day event unchanged', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-10', '2026-10-13'))).toEqual({
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });

  it('moves a multi-day all-day event without shrinking it', () => {
    const moved: EventFormDates = { ...formDatesFromEvent('2026-10-10', '2026-10-13'), date: '2026-10-30' };
    expect(buildDatePayload(moved)).toEqual({ start_date: '2026-10-30', end_date: '2026-11-02' });
  });

  it('never sends an all-day end equal to the start', () => {
    const f: EventFormDates = { ...formDatesFromEvent('2026-10-09', '2026-10-10'), spanDays: 0 };
    expect(buildDatePayload(f)).toEqual({ start_date: '2026-10-09', end_date: '2026-10-10' });
  });

  it('sends timed events with the local UTC offset', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'))).toEqual({
      start_date_time: '2026-10-09T09:00:00-05:00',
      end_date_time: '2026-10-09T10:00:00-05:00',
    });
  });

  it('round-trips an overnight event', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00'))).toEqual({
      start_date_time: '2026-10-09T22:00:00-05:00',
      end_date_time: '2026-10-10T06:00:00-05:00',
    });
  });

  it('keeps a midnight-start event timed', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-10-09T00:00:00-05:00', '2026-10-09T01:00:00-05:00'))).toEqual({
      start_date_time: '2026-10-09T00:00:00-05:00',
      end_date_time: '2026-10-09T01:00:00-05:00',
    });
  });

  it('gets the fall-back day right', () => {
    expect(buildDatePayload(formDatesFromEvent('2026-11-01', '2026-11-02'))).toEqual({
      start_date: '2026-11-01',
      end_date: '2026-11-02',
    });
    const p = buildDatePayload(formDatesFromEvent('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00'));
    if (!('start_date_time' in p)) throw new Error('expected a timed payload');
    // 01:30 happens twice that night; either reading is a valid local 01:30.
    expect(p.start_date_time.startsWith('2026-11-01T01:30:00-0')).toBe(true);
    expect(p.end_date_time).toBe('2026-11-01T03:00:00-06:00');
    expect(parseEventDate(p.end_date_time).getTime()).toBeGreaterThan(parseEventDate(p.start_date_time).getTime());
  });
});

describe('toLocalIsoString', () => {
  it('formats with the zone offset in effect on that date', () => {
    expect(toLocalIsoString(new Date(2026, 9, 9, 9, 5, 7))).toBe('2026-10-09T09:05:07-05:00');
    expect(toLocalIsoString(new Date(2026, 11, 25, 18, 0))).toBe('2026-12-25T18:00:00-06:00');
  });
});

describe('validateFormDates', () => {
  it('rejects a same-day end at or before the start', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    expect(validateFormDates({ ...f, endTime: '10:00' })).toBe('End time must be after start time');
    expect(validateFormDates(f)).toBeNull();
  });

  it('accepts an overnight end', () => {
    expect(validateFormDates(formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00'))).toBeNull();
  });

  it('accepts all-day events without times', () => {
    expect(validateFormDates(formDatesFromEvent('2026-10-09', '2026-10-10'))).toBeNull();
  });
});

describe('withStartTime', () => {
  it('pushes a same-day end an hour past a later start', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    expect(withStartTime(f, '14:15')).toMatchObject({ startTime: '14:15', endTime: '15:15', endDayOffset: 0 });
  });

  it('rolls the end into the next day after 23:00', () => {
    const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
    const g = withStartTime(f, '23:30');
    expect(g).toMatchObject({ startTime: '23:30', endTime: '00:30', endDayOffset: 1 });
    expect(validateFormDates(g)).toBeNull();
  });

  it('leaves an overnight end alone', () => {
    const f = formDatesFromEvent('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');
    expect(withStartTime(f, '21:00')).toMatchObject({ startTime: '21:00', endTime: '06:00', endDayOffset: 1 });
  });
});

describe('defaultFormDates', () => {
  it('starts at the next quarter hour and lasts an hour', () => {
    expect(defaultFormDates(new Date(2026, 9, 9, 14, 7))).toMatchObject({
      date: '2026-10-09', allDay: false, startTime: '14:15', endTime: '15:15', endDayOffset: 0,
    });
  });

  it('rolls late-night defaults into the right days', () => {
    expect(defaultFormDates(new Date(2026, 9, 9, 23, 20))).toMatchObject({
      date: '2026-10-09', startTime: '23:30', endTime: '00:30', endDayOffset: 1,
    });
    expect(defaultFormDates(new Date(2026, 9, 9, 23, 50))).toMatchObject({
      date: '2026-10-10', startTime: '00:00', endTime: '01:00', endDayOffset: 0,
    });
  });
});

describe('buildEventBase', () => {
  it('trims text and omits empty optional fields', () => {
    const base = buildEventBase(formDatesFromEvent('2026-10-09', '2026-10-10'), {
      summary: '  Field trip ',
      description: '   ',
      location: ' Museum ',
    });
    expect(base).toEqual({ summary: 'Field trip', start_date: '2026-10-09', end_date: '2026-10-10', location: 'Museum' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-form.test.ts
```

Expected: the file fails to load with `Error: Cannot find module '../src/utils/event-form'` (`Tests no tests`).

- [ ] **Step 3: Write minimal implementation**

In `src/utils/date-utils.ts`, insert above the `/**` that starts `* Navigate a date by offset based on view type.` (line 143):

```ts
/**
 * Whole calendar days from a to b (by local date, so DST days count as one).
 */
export function calendarDaysBetween(a: Date, b: Date): number {
  const dayA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const dayB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((dayB - dayA) / 86400000);
}

```

Create `custom_components/planavista/frontend/src/utils/event-form.ts`:

```ts
import { CreateEventData } from '../types';
import { calendarDaysBetween, getDateKey, isDateOnly, parseEventDate } from './date-utils';

/**
 * Pure date math for the create/edit dialog. Everything here takes and
 * returns plain values so it can be unit-tested without the DOM.
 */

/** The date/time part of the dialog. */
export interface EventFormDates {
  /** Start date, YYYY-MM-DD (local). */
  date: string;
  allDay: boolean;
  /** HH:MM, 24-hour (timed events). */
  startTime: string;
  /** HH:MM, 24-hour (timed events). */
  endTime: string;
  /** All-day length in days (at least 1). The end date sent is date + spanDays (exclusive). */
  spanDays: number;
  /** Timed events: calendar days from the start date to the end date (0 = same day). */
  endDayOffset: number;
}

/** Date fields of a create/update payload. */
export type EventDatePayload =
  | { start_date: string; end_date: string }
  | { start_date_time: string; end_date_time: string };

/** Text fields of the dialog. */
export interface EventTextFields {
  summary: string;
  description?: string;
  location?: string;
}

const TIME_RE = /^\d{2}:\d{2}$/;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** "HH:MM" for a Date's local wall-clock time. */
export function toTimeString(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO 8601 with the local UTC offset in effect at that moment, e.g. 2026-10-09T09:00:00-05:00. */
export function toLocalIsoString(d: Date): string {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return `${getDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Shift a YYYY-MM-DD date by whole calendar days. */
export function shiftDateKey(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return getDateKey(new Date(y, m - 1, d + days));
}

/** Local date (YYYY-MM-DD) + time (HH:MM) as a Date. */
function localDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/**
 * Prefill from an event's start/end as the backend sends them: date-only for
 * all-day events (exclusive end), ISO datetimes otherwise. The all-day/timed
 * kind comes from the string format only, so a timed event that starts at
 * midnight stays timed.
 */
export function formDatesFromEvent(start: string, end?: string): EventFormDates {
  const s = parseEventDate(start);
  if (isDateOnly(start)) {
    const e = end ? parseEventDate(end) : s;
    return {
      date: getDateKey(s),
      allDay: true,
      startTime: '09:00',
      endTime: '10:00',
      spanDays: Math.max(1, calendarDaysBetween(s, e)),
      endDayOffset: 0,
    };
  }
  const e = end ? parseEventDate(end) : new Date(s.getTime() + 3600000);
  return {
    date: getDateKey(s),
    allDay: false,
    startTime: toTimeString(s),
    endTime: toTimeString(e),
    spanDays: 1,
    endDayOffset: Math.max(0, calendarDaysBetween(s, e)),
  };
}

/** Defaults for a new event: the next quarter hour, one hour long. */
export function defaultFormDates(now: Date): EventFormDates {
  const start = new Date(now);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date(start.getTime() + 3600000);
  return {
    date: getDateKey(start),
    allDay: false,
    startTime: toTimeString(start),
    endTime: toTimeString(end),
    spanDays: 1,
    endDayOffset: calendarDaysBetween(start, end),
  };
}

/** Last calendar day the event covers (YYYY-MM-DD), for the "Ends ..." hint. */
export function formEndDate(f: EventFormDates): string {
  return f.allDay
    ? shiftDateKey(f.date, Math.max(1, f.spanDays) - 1)
    : shiftDateKey(f.date, f.endDayOffset);
}

/** Error text for invalid dates, or null when the form can be saved. */
export function validateFormDates(f: EventFormDates): string | null {
  if (!isDateOnly(f.date)) return 'Please pick a date';
  if (f.allDay) return null;
  if (!TIME_RE.test(f.startTime) || !TIME_RE.test(f.endTime)) return 'Please pick a start and end time';
  const start = localDateTime(f.date, f.startTime);
  const end = localDateTime(shiftDateKey(f.date, f.endDayOffset), f.endTime);
  return end > start ? null : 'End time must be after start time';
}

/**
 * Service date fields. All-day ends are exclusive (start + span, at least one
 * day). Timed values carry the local UTC offset so DST days and a browser in
 * another zone than Home Assistant stay unambiguous.
 */
export function buildDatePayload(f: EventFormDates): EventDatePayload {
  if (f.allDay) {
    return { start_date: f.date, end_date: shiftDateKey(f.date, Math.max(1, Math.round(f.spanDays))) };
  }
  return {
    start_date_time: toLocalIsoString(localDateTime(f.date, f.startTime)),
    end_date_time: toLocalIsoString(localDateTime(shiftDateKey(f.date, f.endDayOffset), f.endTime)),
  };
}

/**
 * Apply a new start time. A same-day end that would no longer be after the
 * start moves to an hour after it (into the next day after 23:00); an
 * overnight end is left alone.
 */
export function withStartTime(f: EventFormDates, startTime: string): EventFormDates {
  const next: EventFormDates = { ...f, startTime };
  if (f.endDayOffset === 0 && f.endTime <= startTime) {
    const [h, m] = startTime.split(':').map(Number);
    next.endTime = `${pad((h + 1) % 24)}:${pad(m)}`;
    next.endDayOffset = h + 1 >= 24 ? 1 : 0;
  }
  return next;
}

/** Create payload without entity_id: trimmed text plus dates; empty optional text is omitted. */
export function buildEventBase(f: EventFormDates, text: EventTextFields): Omit<CreateEventData, 'entity_id'> {
  const base: Omit<CreateEventData, 'entity_id'> = { summary: text.summary.trim(), ...buildDatePayload(f) };
  const description = text.description?.trim();
  const location = text.location?.trim();
  if (description) base.description = description;
  if (location) base.location = location;
  return base;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-form.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 25 passed (25)`; full suite `Tests 43 passed (43)`; `tsc` silent.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-form.ts custom_components/planavista/frontend/src/utils/date-utils.ts custom_components/planavista/frontend/test/event-form.test.ts
git commit -F - <<'EOF'
feat(frontend): add tested date math for the event dialog

New utils/event-form.ts turns event start/end strings into dialog
state and back: exclusive all-day ends (start + span, at least one
day), multi-day and overnight lengths preserved, midnight-start timed
events stay timed, and timed payloads carry the local UTC offset.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B5: Editing restores the original event when the recreate fails

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/event-form.ts` (Task B4 file: import line + append)
- Modify: `custom_components/planavista/frontend/src/state/state-manager.ts:5,155-184`
- Modify: `custom_components/planavista/frontend/src/components/event-create-dialog.ts:4-6,1176-1186,1298-1316,1330-1342,1380-1383`
- Test: `custom_components/planavista/frontend/test/event-edit.test.ts`
- Test: `custom_components/planavista/frontend/test/state-manager.test.ts`

**Interfaces:**
- Consumes: `isDateOnly` (Task B1); `buildEventBase`, `formDatesFromEvent` (Task B4)
- Produces:
  - `buildDeleteData(event: Pick<CalendarEvent, 'calendar_entity_id' | 'uid' | 'recurrence_id'>, entityId?: string): DeleteEventData` (throws when `uid` is missing; includes `recurrence_id` only when non-empty; never `recurrence_range`)
  - `buildRestoreData(event: CalendarEvent, entityId?: string): CreateEventData`
  - `interface EditPlan { deleteData: DeleteEventData; createData: CreateEventData; restoreData: CreateEventData }`
  - `planEdit(original: CalendarEvent, entityId: string, base: Omit<CreateEventData, 'entity_id'>): EditPlan`
  - `class EditRestoreError extends Error { readonly restored: boolean }`
  - `runEditWithRestore(steps: { remove: () => Promise<unknown>; create: () => Promise<unknown>; restore: () => Promise<unknown> }): Promise<void>`
  - `PlanaVistaStateManager.doEditEvent(hass, oldEvent: DeleteEventData, newEvent: CreateEventData, restore: CreateEventData): Promise<void>` (new 4th argument)

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/event-edit.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  EditRestoreError,
  buildDeleteData,
  buildEventBase,
  buildRestoreData,
  formDatesFromEvent,
  planEdit,
  runEditWithRestore,
} from '../src/utils/event-form';

const weeklyLesson: CalendarEvent = {
  summary: 'Piano lesson',
  start: '2026-10-13T16:00:00-05:00',
  end: '2026-10-13T17:00:00-05:00',
  description: 'Bring book 2',
  location: 'Music room',
  uid: 'lesson-series-uid',
  recurrence_id: '20261013T210000Z',
  calendar_entity_id: 'calendar.test_casey',
  calendar_name: 'Casey',
  calendar_color: '#E07A5F',
  calendar_color_light: '',
};

const weekendTrip: CalendarEvent = {
  summary: 'Weekend trip',
  start: '2026-10-10',
  end: '2026-10-13',
  uid: 'trip-uid',
  recurrence_id: '',
  calendar_entity_id: 'calendar.test_blair',
  calendar_name: 'Blair',
  calendar_color: '#81B29A',
  calendar_color_light: '',
};

describe('buildDeleteData', () => {
  it('deletes only the edited instance of a recurring event', () => {
    expect(buildDeleteData(weeklyLesson)).toEqual({
      entity_id: 'calendar.test_casey',
      uid: 'lesson-series-uid',
      recurrence_id: '20261013T210000Z',
    });
    // No recurrence_range: THISANDFUTURE would remove the rest of the series.
    expect(buildDeleteData(weeklyLesson)).not.toHaveProperty('recurrence_range');
  });

  it('omits an empty recurrence_id', () => {
    expect(buildDeleteData(weekendTrip)).toEqual({ entity_id: 'calendar.test_blair', uid: 'trip-uid' });
  });

  it('can target another calendar copy of a shared event', () => {
    expect(buildDeleteData(weeklyLesson, 'calendar.test_alex').entity_id).toBe('calendar.test_alex');
  });

  it('refuses events without a uid', () => {
    expect(() => buildDeleteData({ ...weekendTrip, uid: undefined })).toThrow('no unique ID');
  });
});

describe('buildRestoreData', () => {
  it('recreates a timed event exactly as the backend reported it', () => {
    expect(buildRestoreData(weeklyLesson)).toEqual({
      entity_id: 'calendar.test_casey',
      summary: 'Piano lesson',
      start_date_time: '2026-10-13T16:00:00-05:00',
      end_date_time: '2026-10-13T17:00:00-05:00',
      description: 'Bring book 2',
      location: 'Music room',
    });
  });

  it('recreates an all-day event with its exclusive end date', () => {
    expect(buildRestoreData(weekendTrip)).toEqual({
      entity_id: 'calendar.test_blair',
      summary: 'Weekend trip',
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });
});

describe('planEdit', () => {
  it('edits one instance of a recurring event without touching the series', () => {
    const base = buildEventBase(formDatesFromEvent(weeklyLesson.start, weeklyLesson.end), {
      summary: 'Piano lesson (moved room)',
      location: 'Library',
    });
    const plan = planEdit(weeklyLesson, 'calendar.test_casey', base);
    expect(plan.deleteData).toEqual({
      entity_id: 'calendar.test_casey',
      uid: 'lesson-series-uid',
      recurrence_id: '20261013T210000Z',
    });
    expect(plan.createData).toEqual({
      entity_id: 'calendar.test_casey',
      summary: 'Piano lesson (moved room)',
      start_date_time: '2026-10-13T16:00:00-05:00',
      end_date_time: '2026-10-13T17:00:00-05:00',
      location: 'Library',
    });
    expect(plan.createData).not.toHaveProperty('uid');
    expect(plan.createData).not.toHaveProperty('recurrence_id');
    expect(plan.restoreData.summary).toBe('Piano lesson');
  });

  it('keeps a multi-day all-day event the same length when only the title changes', () => {
    const base = buildEventBase(formDatesFromEvent(weekendTrip.start, weekendTrip.end), { summary: 'Lake trip' });
    expect(planEdit(weekendTrip, 'calendar.test_blair', base).createData).toEqual({
      entity_id: 'calendar.test_blair',
      summary: 'Lake trip',
      start_date: '2026-10-10',
      end_date: '2026-10-13',
    });
  });
});

describe('runEditWithRestore', () => {
  it('deletes then creates', async () => {
    const calls: string[] = [];
    await runEditWithRestore({
      remove: async () => { calls.push('remove'); },
      create: async () => { calls.push('create'); },
      restore: async () => { calls.push('restore'); },
    });
    expect(calls).toEqual(['remove', 'create']);
  });

  it('puts the original back when the new event cannot be created', async () => {
    const restore = vi.fn(async () => {});
    const run = runEditWithRestore({
      remove: async () => {},
      create: async () => { throw { code: 'invalid_format', message: 'End must be after start' }; },
      restore,
    });
    await expect(run).rejects.toBeInstanceOf(EditRestoreError);
    await expect(run).rejects.toThrow("Your changes couldn't be saved (End must be after start). The original event was restored.");
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('says so when the original cannot be put back either', async () => {
    const run = runEditWithRestore({
      remove: async () => {},
      create: async () => { throw new Error('create failed'); },
      restore: async () => { throw new Error('restore failed'); },
    });
    await expect(run).rejects.toThrow(/couldn't be put back \(restore failed\)/);
  });

  it('creates nothing when the delete fails', async () => {
    const create = vi.fn(async () => {});
    const restore = vi.fn(async () => {});
    await expect(runEditWithRestore({
      remove: async () => { throw new Error('delete failed'); },
      create,
      restore,
    })).rejects.toThrow('delete failed');
    expect(create).not.toHaveBeenCalled();
    expect(restore).not.toHaveBeenCalled();
  });
});
```

Create `custom_components/planavista/frontend/test/state-manager.test.ts` (Tasks B9 and 12 append to it):

```ts
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/utils/ha-utils', () => ({
  createEvent: vi.fn(),
  deleteEvent: vi.fn(),
  refreshPlanaVista: vi.fn(async () => {}),
}));

import type { HomeAssistant } from 'custom-card-helpers';
import type { CreateEventData, DeleteEventData } from '../src/types';
import { createEvent, deleteEvent } from '../src/utils/ha-utils';
import { PlanaVistaController } from '../src/state/state-manager';

const host = {
  addController: () => {},
  removeController: () => {},
  requestUpdate: () => {},
  updateComplete: Promise.resolve(true),
};
const state = new PlanaVistaController(host).state;
const hass = {} as HomeAssistant;

afterAll(() => {
  state.stopAutoAdvance();
});

describe('doEditEvent', () => {
  const del: DeleteEventData = { entity_id: 'calendar.test_alex', uid: 'u1', recurrence_id: '20261009T200000Z' };
  const next: CreateEventData = {
    entity_id: 'calendar.test_alex', summary: 'Dentist', start_date_time: '2026-10-09T16:00:00-05:00', end_date_time: '2026-10-09T17:00:00-05:00',
  };
  const original: CreateEventData = {
    entity_id: 'calendar.test_alex', summary: 'Dentist', start_date_time: '2026-10-09T15:00:00-05:00', end_date_time: '2026-10-09T16:00:00-05:00',
  };

  beforeEach(() => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(deleteEvent).mockReset();
    vi.mocked(deleteEvent).mockResolvedValue(undefined);
  });

  it('deletes the instance and creates the edited event', async () => {
    vi.mocked(createEvent).mockResolvedValue(undefined);
    await state.doEditEvent(hass, del, next, original);
    expect(deleteEvent).toHaveBeenCalledWith(hass, del);
    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(createEvent).toHaveBeenCalledWith(hass, next);
  });

  it('restores the original event when the recreate fails', async () => {
    vi.mocked(createEvent)
      .mockRejectedValueOnce(new Error('Invalid end time'))
      .mockResolvedValueOnce(undefined);
    await expect(state.doEditEvent(hass, del, next, original)).rejects.toThrow('The original event was restored.');
    expect(createEvent).toHaveBeenNthCalledWith(2, hass, original);
    expect(state.isLoading).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-edit.test.ts test/state-manager.test.ts
```

Expected: `Tests 13 failed | 1 passed (14)`: every `event-edit` test fails with `TypeError: buildDeleteData is not a function` (or `buildRestoreData`/`planEdit`/`runEditWithRestore`), and "restores the original event when the recreate fails" fails because the old `doEditEvent` throws "The original event was deleted but the replacement could not be created" and never calls `createEvent` a second time.

- [ ] **Step 3: Write minimal implementation**

`src/utils/event-form.ts`: change the first line to

```ts
import { CalendarEvent, CreateEventData, DeleteEventData } from '../types';
```

and append:

```ts

// ---------------------------------------------------------------------------
// Editing = delete + recreate
// ---------------------------------------------------------------------------

/**
 * Delete payload for one calendar's copy of an event. A recurring instance
 * carries its recurrence_id (and never a recurrence_range), so only that
 * instance is removed, never the whole series.
 */
export function buildDeleteData(
  event: Pick<CalendarEvent, 'calendar_entity_id' | 'uid' | 'recurrence_id'>,
  entityId: string = event.calendar_entity_id,
): DeleteEventData {
  if (!event.uid) {
    throw new Error('This event has no unique ID, so it can only be changed in its calendar app.');
  }
  const data: DeleteEventData = { entity_id: entityId, uid: event.uid };
  if (event.recurrence_id) data.recurrence_id = event.recurrence_id;
  return data;
}

/**
 * Create payload that puts an event back exactly as the backend reported it
 * (date-only all-day dates with their exclusive end, or the original ISO
 * datetimes). A restored recurring instance comes back as a single event.
 */
export function buildRestoreData(event: CalendarEvent, entityId: string = event.calendar_entity_id): CreateEventData {
  const data: CreateEventData = isDateOnly(event.start)
    ? { entity_id: entityId, summary: event.summary, start_date: event.start, end_date: event.end }
    : { entity_id: entityId, summary: event.summary, start_date_time: event.start, end_date_time: event.end };
  if (event.description) data.description = event.description;
  if (event.location) data.location = event.location;
  return data;
}

/** The three payloads an edit needs. */
export interface EditPlan {
  deleteData: DeleteEventData;
  createData: CreateEventData;
  restoreData: CreateEventData;
}

/** Plan editing `original` on one calendar: delete it, create `base`, restore on failure. */
export function planEdit(
  original: CalendarEvent,
  entityId: string,
  base: Omit<CreateEventData, 'entity_id'>,
): EditPlan {
  return {
    deleteData: buildDeleteData(original, entityId),
    createData: { ...base, entity_id: entityId },
    restoreData: buildRestoreData(original, entityId),
  };
}

/** Thrown when an edit failed after the delete; the message says whether the original came back. */
export class EditRestoreError extends Error {
  constructor(message: string, readonly restored: boolean) {
    super(message);
    this.name = 'EditRestoreError';
  }
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}

/**
 * Run delete -> create. If create fails after the delete succeeded, run
 * restore and throw an EditRestoreError saying whether the original came back.
 * A failed delete is rethrown before anything is created.
 */
export async function runEditWithRestore(steps: {
  remove: () => Promise<unknown>;
  create: () => Promise<unknown>;
  restore: () => Promise<unknown>;
}): Promise<void> {
  await steps.remove();
  try {
    await steps.create();
  } catch (createErr) {
    const reason = errorText(createErr);
    try {
      await steps.restore();
    } catch (restoreErr) {
      throw new EditRestoreError(
        `Your changes couldn't be saved (${reason}), and the original event couldn't be put back ` +
        `(${errorText(restoreErr)}). Please re-create it in your calendar app.`,
        false,
      );
    }
    throw new EditRestoreError(`Your changes couldn't be saved (${reason}). The original event was restored.`, true);
  }
}
```

`src/state/state-manager.ts`:
- After line 5 (`import { navigateDate } from '../utils/date-utils';`) add
  `import { runEditWithRestore } from '../utils/event-form';`
- Replace `doEditEvent` (lines 155-184) with:

```ts
  /**
   * Edit = delete + recreate. If the recreate fails, `restore` (the original
   * event's payload) is created again and the thrown error says so.
   */
  async doEditEvent(
    hass: HomeAssistant,
    oldEvent: DeleteEventData,
    newEvent: CreateEventData,
    restore: CreateEventData,
  ): Promise<void> {
    this.isLoading = true;
    this._notify();
    try {
      await runEditWithRestore({
        remove: () => deleteEvent(hass, oldEvent),
        create: () => createEvent(hass, newEvent),
        restore: () => createEvent(hass, restore),
      });
      await refreshPlanaVista(hass);
      this.selectedEvent = null;
      this.closeDialog();
    } catch (err) {
      console.error('PlanaVista: Failed to edit event', err);
      // Show whatever is on the calendar now (the restored original, if any).
      await refreshPlanaVista(hass).catch(() => undefined);
      throw err;
    } finally {
      this.isLoading = false;
      this._notify();
    }
  }
```

`src/components/event-create-dialog.ts` (the two `doEditEvent` callers and the add-guests path, so no edit path can lose the event):
- Lines 4-6 become:

```ts
import { CalendarConfig, CalendarEvent, CreateEventData } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { createEvent, createEventWithAttendees, deleteEvent, updateEvent, refreshPlanaVista, getEventOrganizer } from '../utils/ha-utils';
import { EditRestoreError, buildDeleteData, buildRestoreData, planEdit, runEditWithRestore } from '../utils/event-form';
```

- In `_editFallback`, lines 1176-1184:

```ts
    if (primaryEntityId && kept.includes(primaryEntityId) && uid) {
      const deleteData: DeleteEventData = {
        entity_id: primaryEntityId,
        uid,
        recurrence_id: recurrenceId,
      };
      const createData: CreateEventData = { ...baseData, entity_id: primaryEntityId } as CreateEventData;
      await this._pv.state.doEditEvent(this.hass, deleteData, createData);
    } else if
```

become:

```ts
    if (primaryEntityId && kept.includes(primaryEntityId) && uid) {
      const plan = planEdit(this.prefill as CalendarEvent, primaryEntityId, baseData);
      await this._pv.state.doEditEvent(this.hass, plan.deleteData, plan.createData, plan.restoreData);
    } else if
```

- In `_save`, lines 1298-1316:

```ts
        } else if (selected.size > 1 && uid) {
          // Was single-calendar, now adding guests: delete old + create with attendees
          const primaryEntityId = this.prefill?.calendar_entity_id;
          if (primaryEntityId) {
            await deleteEvent(this.hass, {
              entity_id: primaryEntityId,
              uid,
              recurrence_id: this.prefill?.recurrence_id,
            });
          }

          const primaryId = organizerEntity || [...selected][0];
          const attendeeIds = [...selected].filter(id => id !== primaryId);
          await createEventWithAttendees(this.hass, {
            ...baseData,
            entity_id: primaryId,
            attendee_entity_ids: attendeeIds,
          } as CreateEventData & { attendee_entity_ids: string[] });
```

become:

```ts
        } else if (selected.size > 1 && uid) {
          // Was single-calendar, now adding guests: delete old + create with
          // attendees, putting the original back if the create fails
          const original = this.prefill as CalendarEvent;
          const primaryEntityId = original.calendar_entity_id;
          const primaryId = organizerEntity || [...selected][0];
          const attendeeIds = [...selected].filter(id => id !== primaryId);
          await runEditWithRestore({
            remove: () => deleteEvent(this.hass, buildDeleteData(original, primaryEntityId)),
            create: () => createEventWithAttendees(this.hass, {
              ...baseData,
              entity_id: primaryId,
              attendee_entity_ids: attendeeIds,
            } as CreateEventData & { attendee_entity_ids: string[] }),
            restore: () => createEvent(this.hass, buildRestoreData(original, primaryEntityId)),
          });
```

(the delayed-refresh block that follows, from `// Delayed refresh for Google propagation`, is unchanged).

- Lines 1331-1341:

```ts
          // Single-calendar event staying single: simple delete+recreate
          const primaryEntityId = this.prefill?.calendar_entity_id;
          if (primaryEntityId && uid) {
            const deleteData: DeleteEventData = {
              entity_id: primaryEntityId,
              uid,
              recurrence_id: this.prefill?.recurrence_id,
            };
            const createData: CreateEventData = { ...baseData, entity_id: primaryEntityId } as CreateEventData;
            await this._pv.state.doEditEvent(this.hass, deleteData, createData);
          }
```

become (a missing uid now surfaces as an error instead of leaving the dialog stuck on "Saving..."):

```ts
          // Single-calendar event staying single: delete + recreate; the
          // state manager restores the original if the recreate fails
          const primaryEntityId = this.prefill?.calendar_entity_id || '';
          const plan = planEdit(this.prefill as CalendarEvent, primaryEntityId, baseData);
          await this._pv.state.doEditEvent(this.hass, plan.deleteData, plan.createData, plan.restoreData);
```

- Lines 1380-1383:

```ts
    } catch (err: any) {
      this._error = `Failed to save event: ${err?.message || 'Unknown error'}`;
      this._saving = false;
    }
```

become:

```ts
    } catch (err: any) {
      this._error = err instanceof EditRestoreError
        ? err.message
        : `Failed to save event: ${err?.message || 'Unknown error'}`;
      this._saving = false;
    }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-edit.test.ts test/state-manager.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 14 passed (14)`; full suite `Tests 57 passed (57)`; `tsc` silent (it would report `Expected 4 arguments, but got 3` if a `doEditEvent` caller were missed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-form.ts custom_components/planavista/frontend/src/state/state-manager.ts custom_components/planavista/frontend/src/components/event-create-dialog.ts custom_components/planavista/frontend/test/event-edit.test.ts custom_components/planavista/frontend/test/state-manager.test.ts
git commit -F - <<'EOF'
fix(frontend): restore the original event when an edit fails

Editing is delete + recreate. If the recreate fails, the original event
is created again from its reported start/end and the dialog says
whether that worked. Deletes of a recurring instance always carry its
recurrence_id, so an edit never removes the whole series.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B6: Dialog uses the tested date math

UI wiring of Task B4's module (already unit-tested), verified on the dev HA.

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/event-create-dialog.ts:7 (import added in Task B5),27,190,562-580,601-614,617-623,713-716,946-954,1226-1251`

**Interfaces:**
- Consumes: `EventFormDates`, `buildEventBase`, `defaultFormDates`, `formDatesFromEvent`, `formEndDate`, `validateFormDates`, `withStartTime` (Task B4); `EditRestoreError`, `buildDeleteData`, `buildRestoreData`, `planEdit`, `runEditWithRestore` (Task B5)
- Produces: dialog private state `_spanDays: number`, `_endDayOffset: number`; private getter `_formDates: EventFormDates`; private `_applyDates(f: EventFormDates)`; private `_renderEndsHint()`

Event-date parse sites replaced here (the last 3 of the 28): `event-create-dialog.ts:563` (`new Date(this.prefill.start)`), `:575` (`new Date(this.prefill.end)`), and `:1242` (`new Date(this._date)`, the all-day end bug that sent `end_date == start_date`).

- [ ] **Step 1: Implement**

In `src/components/event-create-dialog.ts`:

1. Replace the Task B5 import `import { EditRestoreError, buildDeleteData, buildRestoreData, planEdit, runEditWithRestore } from '../utils/event-form';` with:

```ts
import {
  EditRestoreError,
  EventFormDates,
  buildDeleteData,
  buildEventBase,
  buildRestoreData,
  defaultFormDates,
  formDatesFromEvent,
  formEndDate,
  planEdit,
  runEditWithRestore,
  validateFormDates,
  withStartTime,
} from '../utils/event-form';
```

2. After line 27 (`@state() private _allDay = false;`) add:

```ts
  /** All-day length in days; kept from the edited event so it isn't collapsed to one day. */
  @state() private _spanDays = 1;
  /** Timed events: days from the start date to the end date (1 for an overnight event). */
  @state() private _endDayOffset = 0;
```

3. In `_initForm`, lines 562-580:

```ts
      if (this.prefill.start) {
        const start = new Date(this.prefill.start);
        this._date = this._toDateStr(start);
        this._pickerYear = start.getFullYear();
        this._pickerMonth = start.getMonth();
        if (!this.prefill.start.includes('T') || (start.getHours() === 0 && start.getMinutes() === 0)) {
          this._allDay = true;
          this._startTime = '';
          this._endTime = '';
        } else {
          this._allDay = false;
          this._startTime = this._toTimeStr(start);
          if (this.prefill.end) {
            this._endTime = this._toTimeStr(new Date(this.prefill.end));
          }
        }
      } else {
```

become:

```ts
      if (this.prefill.start) {
        this._applyDates(formDatesFromEvent(this.prefill.start, this.prefill.end));
      } else {
```

4. In `_setDefaults`, lines 601-614:

```ts
    this._organizerEntityId = '';
    const now = new Date();
    this._date = this._toDateStr(now);
    this._pickerYear = now.getFullYear();
    this._pickerMonth = now.getMonth();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    this._startTime = this._toTimeStr(now);
    const end = new Date(now);
    end.setHours(end.getHours() + 1);
    this._endTime = this._toTimeStr(end);
    this._allDay = false;
    this._description = '';
```

become:

```ts
    this._organizerEntityId = '';
    this._applyDates(defaultFormDates(new Date()));
    this._description = '';
```

5. Replace lines 617-623 (`_toDateStr` and `_toTimeStr`) with:

```ts
  /** The form's date/time state as plain values for utils/event-form. */
  private get _formDates(): EventFormDates {
    return {
      date: this._date,
      allDay: this._allDay,
      startTime: this._startTime,
      endTime: this._endTime,
      spanDays: this._spanDays,
      endDayOffset: this._endDayOffset,
    };
  }

  private _applyDates(f: EventFormDates) {
    this._date = f.date;
    this._allDay = f.allDay;
    this._startTime = f.startTime;
    this._endTime = f.endTime;
    this._spanDays = f.spanDays;
    this._endDayOffset = f.endDayOffset;
    const [y, m] = f.date.split('-').map(Number);
    this._pickerYear = y;
    this._pickerMonth = m - 1;
  }

  private _toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** "Through Mon, Oct 12 (3 days)" / "Ends Sat, Oct 10" for events that run past the start date. */
  private _renderEndsHint() {
    const f = this._formDates;
    const multiDay = f.allDay ? f.spanDays > 1 : f.endDayOffset > 0;
    if (!multiDay) return nothing;
    const [y, m, d] = formEndDate(f).split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return html`<div class="ends-hint">${f.allDay ? `Through ${label} (${f.spanDays} days)` : `Ends ${label}`}</div>`;
  }
```

6. In `render()`, lines 713-716, add the hint under the date picker:

```ts
              <div class="form-field">
                <label class="pv-label">Date</label>
                ${this._renderDatePicker()}
                ${this._renderEndsHint()}
              </div>
```

7. In `_selectTime`, lines 946-954:

```ts
    if (this._activeTimePicker === 'start') {
      this._startTime = time;
      // Auto-advance end time to 1 hour later if end is at or before start
      if (this._endTime <= time) {
        const [h, m] = time.split(':').map(Number);
        const endH = (h + 1) % 24;
        this._endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } else {
```

become:

```ts
    if (this._activeTimePicker === 'start') {
      // Moves a same-day end to an hour after the new start when needed
      const next = withStartTime(this._formDates, time);
      this._startTime = next.startTime;
      this._endTime = next.endTime;
      this._endDayOffset = next.endDayOffset;
    } else {
```

8. In `_save`, lines 1226-1251:

```ts
    if (!this._allDay && this._endTime <= this._startTime) {
      this._error = 'End time must be after start time';
      return;
    }

    this._error = '';
    this._saving = true;

    try {
      // Build the base event data (without entity_id, we'll set per-calendar)
      const baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string } = {
        summary: this._title.trim(),
      };

      if (this._allDay) {
        baseData.start_date = this._date;
        const end = new Date(this._date);
        end.setDate(end.getDate() + 1);
        baseData.end_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      } else {
        baseData.start_date_time = `${this._date}T${this._startTime}:00`;
        baseData.end_date_time = `${this._date}T${this._endTime}:00`;
      }

      if (this._description.trim()) baseData.description = this._description.trim();
      if (this._location.trim()) baseData.location = this._location.trim();
```

become:

```ts
    const dateError = validateFormDates(this._formDates);
    if (dateError) {
      this._error = dateError;
      return;
    }

    this._error = '';
    this._saving = true;

    try {
      // Base event data (without entity_id, set per calendar). All-day ends
      // are exclusive; an edited event keeps its original length.
      const baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string } = buildEventBase(this._formDates, {
        summary: this._title,
        description: this._description,
        location: this._location,
      });
```

9. In the component CSS, just before `.error-msg {` (line 190) add:

```css
      .ends-hint {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
        padding-top: 0.25rem;
      }

```

- [ ] **Step 2: Verify (type check, tests, build, dev HA)**

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test && grep -n "new Date(this\.\(prefill\|_date\)\|includes('T" src/components/event-create-dialog.ts
```

Expected: `tsc` silent, `Tests 57 passed (57)`, grep prints nothing.

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` with `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or `navigate_page` `type: "reload"`, `ignoreCache: true` if open). Then `evaluate_script` (edits two seeded events with no real change, then creates and deletes an all-day event; dev HA writes are fine):

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const card = findDeep('planavista-calendar-card');
  const events = () => card.hass.states['sensor.planavista_config'].attributes.events;
  const openDialog = async (open) => {
    open();
    await card.updateComplete;
    const dlg = card.shadowRoot.querySelector('pv-event-create-dialog');
    await dlg.updateComplete;
    return dlg;
  };
  const readForm = dlg => ({
    date: dlg.shadowRoot.querySelector('.date-display').textContent.trim(),
    hint: dlg.shadowRoot.querySelector('.ends-hint')?.textContent.trim() ?? null,
    allDay: dlg.shadowRoot.querySelector('.pv-toggle').getAttribute('aria-checked'),
  });
  const save = async (dlg, title) => {
    const input = dlg.shadowRoot.querySelector('#title-input');
    input.value = title;
    input.dispatchEvent(new Event('input'));
    dlg.shadowRoot.querySelector('.pv-dialog-footer .pv-btn-primary').click();
    await sleep(4000);
    return dlg.shadowRoot.querySelector('.error-msg')?.textContent.trim() ?? null;
  };

  const trip = events().find(e => e.summary === 'Weekend trip');
  let dlg = await openDialog(() => card._pv.state.openEditDialog(trip));
  const tripForm = readForm(dlg);
  const tripError = await save(dlg, 'Weekend trip');
  const tripAfter = events().filter(e => e.summary === 'Weekend trip').map(e => [e.start, e.end]);

  const shift = events().find(e => e.summary === 'Overnight shift');
  dlg = await openDialog(() => card._pv.state.openEditDialog(shift));
  const shiftForm = readForm(dlg);
  const shiftError = await save(dlg, 'Overnight shift');
  const shiftAfter = events().filter(e => e.summary === 'Overnight shift').map(e => [e.start, e.end]);

  dlg = await openDialog(() => card._pv.state.openCreateDialog({ start: '2026-10-14', end: '2026-10-15' }));
  const createError = await save(dlg, 'Plan check all-day');
  const created = events().find(e => e.summary === 'Plan check all-day');
  if (created) {
    await card.hass.callService('planavista', 'delete_event', { entity_id: created.calendar_entity_id, uid: created.uid });
  }
  return { tripForm, tripError, tripAfter, shiftForm, shiftError, shiftAfter, createError, created: created && [created.start, created.end] };
}
```

Expected:
- `tripForm` = `{ date: "Sat, October 10, 2026", hint: "Through Mon, Oct 12 (3 days)", allDay: "true" }`, `tripError` `null`, `tripAfter` `[["2026-10-10", "2026-10-13"]]` (before this task the edit collapsed it to one day).
- `shiftForm` = `{ date: "Fri, October 9, 2026", hint: "Ends Sat, Oct 10", allDay: "false" }`, `shiftError` `null`, `shiftAfter` `[["2026-10-09T22:00:00-05:00", "2026-10-10T06:00:00-05:00"]]` (before: "End time must be after start time").
- `createError` `null`, `created` `["2026-10-14", "2026-10-15"]` (before: the create was rejected because `end_date` equalled `start_date`).

Confirm `scripts/dev-ha.sh logs 20` shows no new PlanaVista errors.

- [ ] **Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/event-create-dialog.ts
git commit -F - <<'EOF'
fix(frontend): keep event dates and lengths intact in the event dialog

The create/edit dialog prefills and saves through utils/event-form:
all-day events send an exclusive end date, multi-day and overnight
events keep their length (shown as an "Ends"/"Through" hint), timed
events that start at midnight stay timed, and a late start time rolls
the end into the next day.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B7: Guarded custom-element registration

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/define.ts`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts:2,25,1426`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card-editor.ts:2,12,74`
- Modify: `custom_components/planavista/frontend/src/components/color-swatch-picker.ts:2,41,335`
- Modify: `custom_components/planavista/frontend/src/components/event-create-dialog.ts:2,11,1385`
- Modify: `custom_components/planavista/frontend/src/components/event-popup.ts:2,11,452`
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts:2,31,1724`
- Modify: `custom_components/planavista/frontend/src/components/pv-event-chip.ts:2,11,266`
- Modify: `custom_components/planavista/frontend/src/components/view-agenda.ts:2,30,415`
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts:2,23,747`
- Modify: `custom_components/planavista/frontend/src/components/view-month.ts:2,18,264`
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts:2,24,406`
- Modify: `custom_components/planavista/frontend/src/main.ts:11-20`
- Test: `custom_components/planavista/frontend/test/define.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `defineElement(tag: string, ctor: CustomElementConstructor): boolean` in `src/utils/define.ts` (true when it registered, false when the name was already taken). Every element (and `pv-clock` in Task B13) registers through it; tag names are unchanged.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/define.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineElement } from '../src/utils/define';

/** Minimal stand-in for window.customElements, which throws on a second define like the real one. */
class FakeRegistry {
  private readonly _defs = new Map<string, CustomElementConstructor>();
  get(name: string): CustomElementConstructor | undefined {
    return this._defs.get(name);
  }
  define(name: string, ctor: CustomElementConstructor): void {
    if (this._defs.has(name)) {
      throw new DOMException(`the name "${name}" has already been used with this registry`, 'NotSupportedError');
    }
    this._defs.set(name, ctor);
  }
}

const OldChip = class {} as unknown as CustomElementConstructor;
const NewChip = class {} as unknown as CustomElementConstructor;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('defineElement', () => {
  it('registers a new tag', () => {
    const registry = new FakeRegistry();
    vi.stubGlobal('customElements', registry);
    expect(defineElement('pv-event-chip', NewChip)).toBe(true);
    expect(registry.get('pv-event-chip')).toBe(NewChip);
  });

  it('skips a tag another bundle already defined instead of throwing', () => {
    const registry = new FakeRegistry();
    registry.define('pv-event-chip', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(() => defineElement('pv-event-chip', NewChip)).not.toThrow();
    expect(defineElement('pv-event-chip', NewChip)).toBe(false);
    expect(registry.get('pv-event-chip')).toBe(OldChip);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/define.test.ts
```

Expected: `Error: Cannot find module '../src/utils/define'` (`Tests no tests`).

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/planavista/frontend/src/utils/define.ts`:

```ts
/**
 * Register a custom element unless the name is already taken.
 *
 * A browser tab can still hold an older PlanaVista bundle (HA keeps pages
 * alive for days on wall tablets). customElements.define throws on a name
 * that's already registered, which would abort this bundle before the card
 * registers. Skipping keeps the page working; a reload picks up the new code.
 *
 * Returns true when this call registered the element.
 */
export function defineElement(tag: string, ctor: CustomElementConstructor): boolean {
  if (customElements.get(tag)) return false;
  customElements.define(tag, ctor);
  return true;
}
```

Then make the same three edits in each of the 11 element files below: (a) drop `customElement, ` from the `lit/decorators.js` import (line 2) and add `import { defineElement } from '../utils/define';` on the next line; (b) delete the `@customElement('<tag>')` line; (c) after the class's closing `}` add a blank line and `defineElement('<tag>', <Class>);` (before `declare global` where the file has one).

| File | Line 2 becomes | Delete line | Add after class end (line) |
|---|---|---|---|
| `cards/planavista-calendar-card.ts` | `import { property, state } from 'lit/decorators.js';` | 25 `@customElement('planavista-calendar-card')` | 1426: `defineElement('planavista-calendar-card', PlanaVistaCalendarCard);` |
| `cards/planavista-calendar-card-editor.ts` | `import { property } from 'lit/decorators.js';` | 12 `@customElement('planavista-calendar-card-editor')` | 74: `defineElement('planavista-calendar-card-editor', PlanaVistaCalendarCardEditor);` |
| `components/color-swatch-picker.ts` | `import { property, state, query } from 'lit/decorators.js';` | 41 `@customElement('pv-color-swatch-picker')` | 335: `defineElement('pv-color-swatch-picker', PvColorSwatchPicker);` |
| `components/event-create-dialog.ts` | `import { property, state, query } from 'lit/decorators.js';` | 11 `@customElement('pv-event-create-dialog')` | 1385: `defineElement('pv-event-create-dialog', PVEventCreateDialog);` |
| `components/event-popup.ts` | `import { property, state } from 'lit/decorators.js';` | 11 `@customElement('pv-event-popup')` | 452: `defineElement('pv-event-popup', PVEventPopup);` |
| `components/onboarding-wizard.ts` | `import { property, state } from 'lit/decorators.js';` | 31 `@customElement('pv-onboarding-wizard')` | 1724: `defineElement('pv-onboarding-wizard', PvOnboardingWizard);` |
| `components/pv-event-chip.ts` | `import { property } from 'lit/decorators.js';` | 11 `@customElement('pv-event-chip')` | 266: `defineElement('pv-event-chip', PVEventChip);` |
| `components/view-agenda.ts` | `import { property, state } from 'lit/decorators.js';` | 30 `@customElement('pv-view-agenda')` | 415: `defineElement('pv-view-agenda', PVViewAgenda);` |
| `components/view-day.ts` | `import { property } from 'lit/decorators.js';` | 23 `@customElement('pv-view-day')` | 747: `defineElement('pv-view-day', PVViewDay);` |
| `components/view-month.ts` | `import { property } from 'lit/decorators.js';` | 18 `@customElement('pv-view-month')` | 264: `defineElement('pv-view-month', PVViewMonth);` |
| `components/view-week.ts` | `import { property, state } from 'lit/decorators.js';` | 24 `@customElement('pv-view-week')` | 406: `defineElement('pv-view-week', PVViewWeek);` |

For example `components/view-month.ts` ends up as:

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
// ... unchanged ...
export class PVViewMonth extends LitElement {
  // ... unchanged ...
}

defineElement('pv-view-month', PVViewMonth);
```

and `components/color-swatch-picker.ts` ends with:

```ts
}

defineElement('pv-color-swatch-picker', PvColorSwatchPicker);

declare global {
  interface HTMLElementTagNameMap {
    'pv-color-swatch-picker': PvColorSwatchPicker;
  }
}
```

In `src/main.ts` replace lines 11-20:

```ts
// Register card with the HA card picker
window.customCards = window.customCards || [];
window.customCards.push(
  {
    type: 'planavista-calendar-card',
    name: 'PlanaVista',
    description: 'All-in-one calendar with clock, weather, toggles, and views',
    preview: true,
  },
);
```

with:

```ts
// Register card with the HA card picker (once, even if another copy of the bundle ran first)
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'planavista-calendar-card')) {
  window.customCards.push({
    type: 'planavista-calendar-card',
    name: 'PlanaVista',
    description: 'All-in-one calendar with clock, weather, toggles, and views',
    preview: true,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/define.test.ts && npm test && npx tsc --noEmit -p . && grep -rn "customElement\b\|@customElement" src; grep -rc "defineElement('" src | grep -v ":0"
```

Expected: `Tests 2 passed (2)`; full suite `Tests 59 passed (59)`; `tsc` silent; the first grep prints nothing; the second lists the 11 element files with `1` each.

Live check:

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script` (loads a second copy of the bundle into the same page, which is what a stale tab does):

```js
async () => {
  const url = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('planavista-cards.js'));
  const dup = new URL(url);
  dup.searchParams.set('dup', String(Date.now()));
  let error = null;
  try {
    await import(dup.href);
  } catch (e) {
    error = String(e);
  }
  return {
    url,
    error,
    chipDefined: !!customElements.get('pv-event-chip'),
    pickerEntries: (window.customCards || []).filter(c => c.type === 'planavista-calendar-card').length,
  };
}
```

Expected: `error: null` (before this task: `NotSupportedError: ... the name "pv-..." has already been used with this registry`), `chipDefined: true`, `pickerEntries: 1`. A screenshot shows the card still rendering.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/define.ts custom_components/planavista/frontend/test/define.test.ts custom_components/planavista/frontend/src/main.ts   custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card-editor.ts   custom_components/planavista/frontend/src/components/color-swatch-picker.ts custom_components/planavista/frontend/src/components/event-create-dialog.ts   custom_components/planavista/frontend/src/components/event-popup.ts custom_components/planavista/frontend/src/components/onboarding-wizard.ts   custom_components/planavista/frontend/src/components/pv-event-chip.ts custom_components/planavista/frontend/src/components/view-agenda.ts   custom_components/planavista/frontend/src/components/view-day.ts custom_components/planavista/frontend/src/components/view-month.ts   custom_components/planavista/frontend/src/components/view-week.ts
git commit -F - <<'EOF'
fix(frontend): skip element names that are already registered

Every element now registers through defineElement(), which skips a
name another copy of the bundle already defined instead of throwing,
and the card-picker entry is added only once. A stale tab no longer
breaks the newly loaded card.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B8: Overnight events draw their full portion in Day view

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/event-utils.ts:168-215` (`getEventPosition`)
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts:688`
- Test: `custom_components/planavista/frontend/test/event-position.test.ts`

**Interfaces:**
- Consumes: `parseEventDate` (Task B1)
- Produces: `getEventPosition(event: CalendarEvent, dayStartHour?: number, dayEndHour?: number, viewDate?: Date): { top: number; height: number }` clips to the viewed day (defaults to the event's start day) using wall-clock minutes.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/event-position.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../src/types';
import { getEventPosition } from '../src/utils/event-utils';

function ev(start: string, end: string): CalendarEvent {
  return {
    summary: 'Event',
    start,
    end,
    calendar_entity_id: 'calendar.test_casey',
    calendar_name: 'Casey',
    calendar_color: '#E07A5F',
    calendar_color_light: '',
  };
}

const pct = (minutes: number) => (minutes / 1440) * 100;

describe('getEventPosition (Day view, 0-24h grid)', () => {
  const shift = ev('2026-10-09T22:00:00-05:00', '2026-10-10T06:00:00-05:00');

  it('draws the evening part of an overnight event on its first day', () => {
    const pos = getEventPosition(shift, 0, 24, new Date(2026, 9, 9));
    expect(pos.top).toBeCloseTo(pct(22 * 60));
    expect(pos.height).toBeCloseTo(pct(2 * 60)); // 22:00-24:00, not a 15-minute sliver
  });

  it('draws the morning part of an overnight event on the next day', () => {
    const pos = getEventPosition(shift, 0, 24, new Date(2026, 9, 10, 15, 30)); // any time that day
    expect(pos.top).toBeCloseTo(0);
    expect(pos.height).toBeCloseTo(pct(6 * 60));
  });

  it('fills the whole grid on a middle day of a multi-day timed event', () => {
    const trip = ev('2026-10-09T18:00:00-05:00', '2026-10-11T09:00:00-05:00');
    const pos = getEventPosition(trip, 0, 24, new Date(2026, 9, 10));
    expect(pos.top).toBeCloseTo(0);
    expect(pos.height).toBeCloseTo(100);
  });

  it('places an event from another zone at its local time', () => {
    const pos = getEventPosition(ev('2026-10-09T10:00:00-04:00', '2026-10-09T11:00:00-04:00'), 0, 24, new Date(2026, 9, 9));
    expect(pos.top).toBeCloseTo(pct(9 * 60)); // 9:00 AM Chicago
    expect(pos.height).toBeCloseTo(pct(60));
  });

  it('uses wall-clock positions on the fall-back day', () => {
    // 01:30 CDT -> 03:00 CST is 2.5 h elapsed but spans 01:30-03:00 on the clock face.
    const pos = getEventPosition(ev('2026-11-01T01:30:00-05:00', '2026-11-01T03:00:00-06:00'), 0, 24, new Date(2026, 10, 1));
    expect(pos.top).toBeCloseTo(pct(90));
    expect(pos.height).toBeCloseTo(pct(90));
  });

  it('keeps a 15-minute minimum height', () => {
    const pos = getEventPosition(ev('2026-10-09T09:00:00-05:00', '2026-10-09T09:05:00-05:00'), 0, 24, new Date(2026, 9, 9));
    expect(pos.height).toBeCloseTo(pct(15));
  });

  it('falls back to the start day when no view date is given', () => {
    const pos = getEventPosition(shift);
    expect(pos.top).toBeCloseTo(pct(22 * 60));
    expect(pos.height).toBeCloseTo(pct(2 * 60));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-position.test.ts
```

Expected: `Tests 3 failed | 4 passed (7)`: "draws the evening part …" and "falls back to the start day …" get a height of ~1.04 (15 min) instead of ~8.33, and "fills the whole grid …" gets ~1.04 instead of 100 (the clamp to 24:00 reads back as hour 0).

- [ ] **Step 3: Write minimal implementation**

In `src/utils/event-utils.ts` replace the whole `getEventPosition` block (lines 168-215, from its `/**` to its closing `}`) with:

```ts
/**
 * Calculate event position as percentages for time-grid views.
 * Returns top (%) and height (%) relative to the day grid.
 *
 * Only the part of the event inside the viewed day is drawn: an overnight
 * event shows 22:00-24:00 on its first day and 00:00-06:00 on the next.
 * `viewDate` is the day being shown (defaults to the event's start day).
 * Positions are wall-clock, matching the hour labels, so DST days still line up.
 */
export function getEventPosition(
  event: CalendarEvent,
  dayStartHour: number = 0,
  dayEndHour: number = 24,
  viewDate?: Date
): { top: number; height: number } {
  const start = parseEventDate(event.start);
  const end = parseEventDate(event.end);
  const totalMinutes = (dayEndHour - dayStartHour) * 60;

  const day = viewDate ?? start;
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), dayStartHour);
  // Hour 24 rolls over to 00:00 of the next day.
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), dayEndHour);

  const gridMinutes = (d: Date): number => {
    if (d <= dayStart) return 0;
    if (d >= dayEnd) return totalMinutes;
    return (d.getHours() - dayStartHour) * 60 + d.getMinutes();
  };

  const startMins = gridMinutes(start);
  const endMins = gridMinutes(end);
  const durationMinutes = Math.max(endMins - startMins, 15); // minimum 15 min visual height

  return {
    top: (startMins / totalMinutes) * 100,
    height: (durationMinutes / totalMinutes) * 100,
  };
}
```

In `src/components/view-day.ts` line 688 replace

```ts
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR);
```

with

```ts
          // Clip to the viewed day so overnight events draw their full portion
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR, this.currentDate);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/event-position.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 7 passed (7)`; full suite `Tests 66 passed (66)`; `tsc` silent.

Live check:

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script`:

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  card._pv.state.setView('day');
  const read = async (date) => {
    card._pv.state.setDate(date);
    await card.updateComplete;
    const view = card.shadowRoot.querySelector('pv-view-day');
    await view.updateComplete;
    return [...view.shadowRoot.querySelectorAll('.positioned-event')].map(e => ({
      title: e.querySelector('.event-title').textContent.trim(),
      top: e.style.top,
      height: e.style.height,
    }));
  };
  return { fri: await read(new Date(2026, 9, 9)), sat: await read(new Date(2026, 9, 10)) };
}
```

Expected: in `fri`, "Overnight shift" has `top` ≈ `91.6667%` and `height` ≈ `8.33333%` (before: `1.04167%`), "Dentist" `top` 62.5%; in `sat`, "Overnight shift" has `top: "0%"`, `height: "25%"`. Take a screenshot of Fri Oct 9 in Day view scrolled to the evening.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-utils.ts custom_components/planavista/frontend/src/components/view-day.ts custom_components/planavista/frontend/test/event-position.test.ts
git commit -F - <<'EOF'
fix(frontend): draw overnight events across both days in Day view

getEventPosition clips an event to the viewed day using wall-clock
minutes, so an overnight shift shows 22:00-24:00 on its first day and
the morning part on the next instead of a 15-minute sliver.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B9: Date rollover after the tablet sleeps

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/date-utils.ts` (insert `rolloverDate` above `calendarDaysBetween` from Task B4)
- Modify: `custom_components/planavista/frontend/src/state/state-manager.ts:5,23-25,190-217`
- Test: `custom_components/planavista/frontend/test/rollover.test.ts`
- Test: `custom_components/planavista/frontend/test/state-manager.test.ts` (append)

**Interfaces:**
- Consumes: `getDateKey` (existing), `test/state-manager.test.ts` harness (Task B5)
- Produces: `rolloverDate(viewed: Date, lastTodayKey: string, now: Date): Date | null` in `date-utils.ts`; `PlanaVistaStateManager.checkRollover(now?: Date): void` (public); `startAutoAdvance()` also listens for `visibilitychange`, `stopAutoAdvance()` removes it.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/rollover.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getDateKey, rolloverDate } from '../src/utils/date-utils';

describe('rolloverDate', () => {
  const fri = new Date(2026, 9, 9, 12, 0);

  it('does nothing while the local date is unchanged', () => {
    expect(rolloverDate(fri, '2026-10-09', new Date(2026, 9, 9, 23, 59))).toBeNull();
  });

  it('follows today across midnight', () => {
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 10, 0, 0, 30));
    expect(next && getDateKey(next)).toBe('2026-10-10');
  });

  it('catches up after the tablet slept through midnight', () => {
    // The old check only advanced if "one minute ago" was still the viewed day.
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 10, 7, 45));
    expect(next && getDateKey(next)).toBe('2026-10-10');
  });

  it('catches up across several days', () => {
    const next = rolloverDate(fri, '2026-10-09', new Date(2026, 9, 12, 7, 0));
    expect(next && getDateKey(next)).toBe('2026-10-12');
  });

  it('leaves a day the user navigated to alone', () => {
    const tue = new Date(2026, 9, 13);
    expect(rolloverDate(tue, '2026-10-09', new Date(2026, 9, 10, 0, 1))).toBeNull();
  });
});
```

Append to `custom_components/planavista/frontend/test/state-manager.test.ts`:

```ts

describe('date rollover', () => {
  it('moves the viewed day to the new today, including after a long sleep', () => {
    state.checkRollover(new Date(2026, 9, 9, 8, 0)); // sync "today" to Fri Oct 9
    state.setDate(new Date(2026, 9, 9, 8, 0));
    state.checkRollover(new Date(2026, 9, 10, 7, 45)); // first check after waking Saturday
    expect(state.currentDate.getDate()).toBe(10);
  });

  it('keeps a day the user navigated to', () => {
    state.checkRollover(new Date(2026, 9, 10, 8, 0)); // today is Sat Oct 10
    state.setDate(new Date(2026, 9, 14));
    state.checkRollover(new Date(2026, 9, 11, 0, 1));
    expect(state.currentDate.getDate()).toBe(14);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/rollover.test.ts test/state-manager.test.ts
```

Expected: `Tests 7 failed | 2 passed (9)`: `TypeError: rolloverDate is not a function` (5) and `TypeError: state.checkRollover is not a function` (2).

- [ ] **Step 3: Write minimal implementation**

In `src/utils/date-utils.ts`, insert above the `/**` of `calendarDaysBetween`:

```ts
/**
 * Midnight rollover for a wall display. `lastTodayKey` is the local date key
 * of "today" at the previous check. If the date has changed since then and
 * the view was showing that day, return `now` so the view follows today;
 * otherwise null. Comparing date keys (not "a minute ago") means a tablet
 * that slept through midnight still catches up on its first check.
 */
export function rolloverDate(viewed: Date, lastTodayKey: string, now: Date): Date | null {
  if (getDateKey(now) === lastTodayKey) return null;
  return getDateKey(viewed) === lastTodayKey ? new Date(now) : null;
}

```

In `src/state/state-manager.ts`:
- Line 5: `import { navigateDate } from '../utils/date-utils';` → `import { getDateKey, navigateDate, rolloverDate } from '../utils/date-utils';`
- Lines 23-25 (`// Subscribers` block) become:

```ts
  // Subscribers
  private _hosts = new Set<ReactiveControllerHost>();
  private _autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
  /** Local date key of "today" at the last rollover check. */
  private _todayKey = getDateKey(new Date());
  private _onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') this.checkRollover();
  };
```

- Replace `startAutoAdvance()` and `stopAutoAdvance()` (lines 190-217, through the class's closing `}`) with:

```ts
  /**
   * Follow "today" across midnight: if the local date changed since the last
   * check and the view was on that day, move it to the new today.
   */
  checkRollover(now: Date = new Date()): void {
    const next = rolloverDate(this.currentDate, this._todayKey, now);
    this._todayKey = getDateKey(now);
    if (next) {
      this.currentDate = next;
      this._notify();
    }
  }

  startAutoAdvance(): void {
    if (this._autoAdvanceTimer) return;
    this._todayKey = getDateKey(new Date());
    this._autoAdvanceTimer = setInterval(() => this.checkRollover(), 60000);
    // Timers are throttled or paused while a tablet sleeps; check as soon as it wakes.
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }

  stopAutoAdvance(): void {
    if (this._autoAdvanceTimer) {
      clearInterval(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/rollover.test.ts test/state-manager.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 9 passed (9)`; full suite `Tests 73 passed (73)`; `tsc` silent.

Live check (simulates waking on a new day):

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` (foreground, not `background`, so the page is visible) `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script`:

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  const st = card._pv.state;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  st._todayKey = key(yesterday); // pretend the last check happened yesterday
  st.setDate(yesterday);
  document.dispatchEvent(new Event('visibilitychange'));
  await card.updateComplete;
  return { visibility: document.visibilityState, viewed: key(st.currentDate), today: key(new Date()) };
}
```

Expected: `visibility: "visible"` and `viewed === today`.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/date-utils.ts custom_components/planavista/frontend/src/state/state-manager.ts custom_components/planavista/frontend/test/rollover.test.ts custom_components/planavista/frontend/test/state-manager.test.ts
git commit -F - <<'EOF'
fix(frontend): follow today after the display sleeps past midnight

The midnight check compares local date keys against the last check
instead of "one minute ago", and also runs when the page becomes
visible again, so a wall tablet that slept overnight shows today.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B10: Swipe needs a horizontal one-finger gesture; month taps open the event

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/gestures.ts`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts:11,39,991-992,1398-1407`
- Modify: `custom_components/planavista/frontend/src/components/view-month.ts:235-237`
- Test: `custom_components/planavista/frontend/test/gestures.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SWIPE_MIN_PX = 50`, `swipeDirection(dx: number, dy: number): 'prev' | 'next' | null`; card private `_touchStart: { x: number; y: number } | null`, `_onTouchCancel()`.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/gestures.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { swipeDirection } from '../src/utils/gestures';

describe('swipeDirection', () => {
  it('reads a clear horizontal swipe', () => {
    expect(swipeDirection(120, 10)).toBe('prev'); // finger moved right
    expect(swipeDirection(-120, -10)).toBe('next'); // finger moved left
  });

  it('needs more than 50 px of horizontal travel', () => {
    expect(swipeDirection(50, 0)).toBeNull();
    expect(swipeDirection(51, 0)).toBe('prev');
  });

  it('ignores diagonal and vertical scrolls', () => {
    expect(swipeDirection(80, 60)).toBeNull();
    expect(swipeDirection(-100, 50)).toBeNull(); // exactly 2:1 is not enough
    expect(swipeDirection(-101, 50)).toBe('next');
    expect(swipeDirection(5, 300)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/gestures.test.ts
```

Expected: `Error: Cannot find module '../src/utils/gestures'` (`Tests no tests`).

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/planavista/frontend/src/utils/gestures.ts`:

```ts
/** Minimum horizontal travel, in px, for a swipe to change the date. */
export const SWIPE_MIN_PX = 50;

/**
 * Classify a finished one-finger gesture by how far it moved. A swipe must
 * travel more than 50 px sideways and more than twice as far sideways as up
 * or down, so diagonal scrolls don't change the date. Moving the finger right
 * goes to the previous period, left to the next.
 */
export function swipeDirection(dx: number, dy: number): 'prev' | 'next' | null {
  if (Math.abs(dx) <= SWIPE_MIN_PX) return null;
  if (Math.abs(dx) <= 2 * Math.abs(dy)) return null;
  return dx > 0 ? 'prev' : 'next';
}
```

In `src/cards/planavista-calendar-card.ts`:
- After line 11 (`import { weatherIcon } from '../utils/weather-icons';`) add `import { swipeDirection } from '../utils/gestures';`
- Line 39 `private _touchStartX = 0;` becomes:

```ts
  /** Where the current one-finger touch began; null when there's no swipe in progress. */
  private _touchStart: { x: number; y: number } | null = null;
```

- In `render()`, lines 991-992 gain a cancel handler:

```ts
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @touchcancel=${this._onTouchCancel}
```

- Replace `_onTouchStart`/`_onTouchEnd` (lines 1398-1407) with:

```ts
  private _onTouchStart(e: TouchEvent) {
    // Only a single finger can swipe; a second finger (pinch, two-finger scroll) cancels.
    this._touchStart = e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : null;
  }

  private _onTouchEnd(e: TouchEvent) {
    const start = this._touchStart;
    this._touchStart = null;
    if (!start || e.touches.length > 0 || e.changedTouches.length !== 1) return;
    const end = e.changedTouches[0];
    const direction = swipeDirection(end.clientX - start.x, end.clientY - start.y);
    if (direction) this._pv.state.navigateDate(direction);
  }

  private _onTouchCancel() {
    this._touchStart = null;
  }
```

In `src/components/view-month.ts`, the chip's native click must not reach the day cell (whose `@click` switches to Day view). Lines 235-237:

```ts
              .tick=${this.tick}
              @event-click=${(ev: CustomEvent) => { ev.stopPropagation(); this._onEventClick(ev.detail.event); }}
            ></pv-event-chip>
```

become:

```ts
              .tick=${this.tick}
              @event-click=${(ev: CustomEvent) => { ev.stopPropagation(); this._onEventClick(ev.detail.event); }}
              @click=${(ev: Event) => ev.stopPropagation()}
            ></pv-event-chip>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/gestures.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 3 passed (3)`; full suite `Tests 76 passed (76)`; `tsc` silent.

Live check:

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script`:

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  const st = card._pv.state;

  // Month view: tapping an event opens it and stays in Month view.
  st.setView('month');
  st.setDate(new Date(2026, 9, 9));
  await card.updateComplete;
  const month = card.shadowRoot.querySelector('pv-view-month');
  await month.updateComplete;
  const chip = [...month.shadowRoot.querySelectorAll('pv-event-chip')].find(c => c.event.summary === 'Dentist');
  chip.shadowRoot.querySelector('.chip').click();
  await card.updateComplete;
  const monthTap = { view: st.currentView, selected: st.selectedEvent?.summary ?? null };
  st.selectEvent(null);

  // Swipes in Day view.
  st.setView('day');
  st.setDate(new Date(2026, 9, 9));
  await card.updateComplete;
  const body = card.shadowRoot.querySelector('.pvc-body');
  const touch = (x, y) => new Touch({ identifier: 1, target: body, clientX: x, clientY: y });
  const swipe = (x0, y0, x1, y1) => {
    body.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(x0, y0)], changedTouches: [touch(x0, y0)], bubbles: true, composed: true }));
    body.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch(x1, y1)], bubbles: true, composed: true }));
    return st.currentDate.getDate();
  };
  const diagonal = swipe(300, 300, 380, 360);
  const left = swipe(300, 300, 180, 310);
  return { monthTap, diagonal, left };
}
```

Expected: `monthTap` = `{ view: "month", selected: "Dentist" }` (before: `view: "day"`); `diagonal: 9` (before: 8); `left: 10`.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/gestures.ts custom_components/planavista/frontend/test/gestures.test.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts custom_components/planavista/frontend/src/components/view-month.ts
git commit -F - <<'EOF'
fix(frontend): ignore diagonal swipes and keep month taps on the event

A swipe now needs one finger and a mostly horizontal move (more than
50 px and twice the vertical travel). Tapping an event in Month view
opens it without also switching to that day.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B11: Shared weather forecast subscription

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/weather-subscription.ts`
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts:14-22,37-45,240-305,316`
- Modify: `custom_components/planavista/frontend/src/components/view-agenda.ts:19-28,43-51,256,331-394`
- Test: `custom_components/planavista/frontend/test/weather-subscription.test.ts`

**Interfaces:**
- Consumes: `getDateKey`, `parseEventDate` (Task B1)
- Produces (from `src/utils/weather-subscription.ts`): `interface ForecastEntry { datetime: string; condition: string; temperature: number; templow?: number }`, `interface DayForecast { condition: string; tempHigh: number; tempLow: number }`, `interface ForecastConnection { subscribeMessage(callback, message): Promise<() => void | Promise<void>> }`, `class ForecastSubscription { constructor(onForecast: (f: ForecastEntry[]) => void); update(connection: ForecastConnection | undefined, entityId: string, legacyForecast?: ForecastEntry[]): void; stop(): void }`, `buildForecastMap(forecast: ForecastEntry[]): Map<string, DayForecast>`.

The two remaining non-event date parses (`view-week.ts:296` and `view-agenda.ts:385`, forecast `datetime`) move into `buildForecastMap` and go through `parseEventDate`.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/weather-subscription.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import {
  ForecastSubscription,
  buildForecastMap,
  type ForecastConnection,
  type ForecastEntry,
} from '../src/utils/weather-subscription';

/** A connection whose subscribe calls resolve only when the test says so. */
function fakeConnection() {
  const pending: Array<{
    message: Record<string, unknown>;
    callback: (msg: { forecast?: ForecastEntry[] }) => void;
    resolve: (unsub: () => void) => void;
    reject: (err: unknown) => void;
    unsub: ReturnType<typeof vi.fn>;
  }> = [];
  const connection: ForecastConnection = {
    subscribeMessage: (callback, message) =>
      new Promise((resolve, reject) => {
        pending.push({ message, callback, resolve, reject, unsub: vi.fn() });
      }),
  };
  return { connection, pending };
}

const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

const sunny: ForecastEntry[] = [{ datetime: '2026-10-09T12:00:00-05:00', condition: 'sunny', temperature: 72, templow: 55 }];

describe('ForecastSubscription', () => {
  it('subscribes once per entity even while the first subscribe is in flight', async () => {
    const { connection, pending } = fakeConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(connection, 'weather.home');
    sub.update(connection, 'weather.home'); // hass changed again before the subscribe resolved
    expect(pending).toHaveLength(1);
    expect(pending[0].message).toEqual({ type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: 'weather.home' });
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, 'weather.home');
    expect(pending).toHaveLength(1);
  });

  it('delivers forecasts and unsubscribes on stop', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    pending[0].callback({ forecast: sunny });
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
    sub.stop();
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes a subscription that resolves after stop (no leak)', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    sub.stop(); // view disconnected before the server answered
    pending[0].resolve(pending[0].unsub);
    await flush();
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    pending[0].callback({ forecast: sunny });
    expect(onForecast).not.toHaveBeenCalledWith(sunny);
  });

  it('replaces the subscription when the entity changes', async () => {
    const { connection, pending } = fakeConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, 'weather.cabin');
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    expect(pending).toHaveLength(2);
    expect(pending[1].message.entity_id).toBe('weather.cabin');
  });

  it('falls back to the legacy forecast attribute when subscribing fails', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home', sunny);
    pending[0].reject(new Error('unknown command'));
    await flush();
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
    sub.update(connection, 'weather.home', sunny); // next hass update: no retry storm
    expect(pending).toHaveLength(1);
  });

  it('stops and clears the forecast when the entity is removed', async () => {
    const { connection, pending } = fakeConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(connection, 'weather.home');
    pending[0].resolve(pending[0].unsub);
    await flush();
    sub.update(connection, '');
    expect(pending[0].unsub).toHaveBeenCalledTimes(1);
    expect(onForecast).toHaveBeenLastCalledWith([]);
  });
});

describe('buildForecastMap', () => {
  it('keys forecasts by local date', () => {
    const map = buildForecastMap([
      { datetime: '2026-10-09T12:00:00-05:00', condition: 'sunny', temperature: 72, templow: 55 },
      { datetime: '2026-10-10', condition: 'rainy', temperature: 61 },
    ]);
    expect(map.get('2026-10-09')).toEqual({ condition: 'sunny', tempHigh: 72, tempLow: 55 });
    expect(map.get('2026-10-10')).toEqual({ condition: 'rainy', tempHigh: 61, tempLow: 61 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/weather-subscription.test.ts
```

Expected: `Error: Cannot find module '../src/utils/weather-subscription'` (`Tests no tests`).

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/planavista/frontend/src/utils/weather-subscription.ts`:

```ts
import { getDateKey, parseEventDate } from './date-utils';

/** One entry of a weather/subscribe_forecast message. */
export interface ForecastEntry {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
}

/** A day's forecast as the views show it. */
export interface DayForecast {
  condition: string;
  tempHigh: number;
  tempLow: number;
}

type Unsubscribe = () => void | Promise<void>;

/** The part of hass.connection this helper uses. */
export interface ForecastConnection {
  subscribeMessage(
    callback: (msg: { forecast?: ForecastEntry[] }) => void,
    message: Record<string, unknown>,
  ): Promise<Unsubscribe>;
}

function safeUnsubscribe(unsub: Unsubscribe): void {
  try {
    const result = unsub();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => undefined);
    }
  } catch {
    // The connection may already be gone; nothing left to clean up.
  }
}

/**
 * Daily forecast subscription shared by the Week and Agenda views.
 *
 * Holds at most one live subscription and never loses its unsubscribe
 * handle: repeated update() calls for the same entity while a subscribe is
 * still in flight don't start another one, and a subscribe that resolves
 * after stop() (or after the entity changed) is unsubscribed immediately.
 */
export class ForecastSubscription {
  /** Entity subscribed to, being subscribed to, or that fell back to its legacy attribute; '' when stopped. */
  private _entityId = '';
  private _unsub: Unsubscribe | null = null;
  /** Incremented on every stop/replace; stale callbacks compare against it. */
  private _generation = 0;

  constructor(private readonly _onForecast: (forecast: ForecastEntry[]) => void) {}

  /**
   * Subscribe to `entityId`'s daily forecast; a no-op when already handling
   * that entity (subscribed, subscribing, or fallen back). An empty entity or
   * missing connection stops any subscription and clears the forecast.
   * `legacyForecast` (the entity's old `forecast` attribute) is used if the
   * subscribe command fails.
   */
  update(connection: ForecastConnection | undefined, entityId: string, legacyForecast?: ForecastEntry[]): void {
    if (!entityId || !connection) {
      const wasActive = this._entityId !== '';
      this.stop();
      if (wasActive) this._onForecast([]);
      return;
    }
    if (entityId === this._entityId) return;
    this.stop();
    this._entityId = entityId;
    const generation = this._generation;
    connection
      .subscribeMessage(
        msg => {
          if (generation === this._generation) this._onForecast(msg?.forecast || []);
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: entityId },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub); // stopped or replaced while in flight
          return;
        }
        this._unsub = unsub;
      })
      .catch(() => {
        if (generation === this._generation) this._onForecast(legacyForecast || []);
      });
  }

  /** Drop the subscription (including one still in flight). */
  stop(): void {
    this._generation++;
    this._entityId = '';
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
  }
}

/** Forecast entries keyed by local date (YYYY-MM-DD). */
export function buildForecastMap(forecast: ForecastEntry[]): Map<string, DayForecast> {
  const map = new Map<string, DayForecast>();
  for (const fc of forecast) {
    if (!fc.datetime) continue;
    map.set(getDateKey(parseEventDate(fc.datetime)), {
      condition: fc.condition || '',
      tempHigh: fc.temperature ?? 0,
      tempLow: fc.templow ?? fc.temperature ?? 0,
    });
  }
  return map;
}
```

Apply the same edits to `src/components/view-week.ts` and `src/components/view-agenda.ts`:

1. After `import { weatherIcon } from '../utils/weather-icons';` (week line 14, agenda line 19) add:

```ts
import { DayForecast, ForecastConnection, ForecastEntry, ForecastSubscription, buildForecastMap } from '../utils/weather-subscription';
```

2. Delete the local `interface DayForecast { condition: string; tempHigh: number; tempLow: number; }` block and its trailing blank line (week lines 18-22, agenda lines 24-28).

3. Replace the forecast state and handles (week lines 37-45, agenda lines 43-51; in the agenda keep `@state() private _daysLoaded = DAYS_PER_PAGE;` above it):

```ts
  @state() private _forecast: Array<{
    datetime: string;
    condition: string;
    temperature: number;
    templow?: number;
  }> = [];

  private _weatherUnsub?: () => void;
  private _subscribedEntity = '';
```

with:

```ts
  @state() private _forecast: ForecastEntry[] = [];

  private _forecastSub = new ForecastSubscription(forecast => { this._forecast = forecast; });
```

4. Replace the methods `updated`, `disconnectedCallback`, `_unsubWeather`, `_subscribeWeather` and `_getForecastMap` (week lines 240-305, agenda lines 331-394; everything from `  updated(changed: PropertyValues) {` through the `}` closing `_getForecastMap`) with:

```ts
  connectedCallback() {
    super.connectedCallback();
    // A re-attached view gets no property change, so re-subscribe here.
    if (this.hasUpdated) this._syncForecast();
  }

  updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('weatherEntity') || changed.has('hass')) {
      this._syncForecast();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._forecastSub.stop();
  }

  private _syncForecast() {
    this._forecastSub.update(
      this.hass?.connection as unknown as ForecastConnection | undefined,
      this.weatherEntity,
      this.hass?.states?.[this.weatherEntity]?.attributes?.forecast,
    );
  }
```

5. In `render()`: week line 316 `const forecasts = this._getForecastMap();` → `const forecasts = buildForecastMap(this._forecast);`; agenda line 256 `const forecast = this._getForecastMap();` → `const forecast = buildForecastMap(this._forecast);`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/weather-subscription.test.ts && npm test && npx tsc --noEmit -p . && grep -n "_weatherUnsub\|_subscribeWeather\|_getForecastMap" src/components/*.ts
```

Expected: `Tests 7 passed (7)`; full suite `Tests 83 passed (83)`; `tsc` silent; grep prints nothing.

Live check (needs a weather entity; the dev HA has none, so add Met.no there once):

```bash
python scripts/ha.py flow met '{"name": "Plan Check", "latitude": 41.8781, "longitude": -87.6298, "elevation": 181}'
python scripts/ha.py api GET /api/states | grep '"entity_id": "weather\.'
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

The flow must print `type=create_entry`; the grep shows the new entity id (use it below in place of `weather.plan_check` if it differs). Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script` (sets the weather entity through the card's YAML override in this page only, counts live forecast subscriptions while flipping views):

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const weatherId = 'weather.plan_check';
  const card = findDeep('planavista-calendar-card');
  const conn = document.querySelector('home-assistant').hass.connection;
  const orig = conn.subscribeMessage.bind(conn);
  let active = 0;
  conn.subscribeMessage = async (cb, msg, opts) => {
    const unsub = await orig(cb, msg, opts);
    if (msg.type !== 'weather/subscribe_forecast') return unsub;
    active++;
    return async () => { active--; return unsub(); };
  };
  card.setConfig({ ...card._config, weather_entity: weatherId });
  card._pv.state.setDate(new Date());
  for (let i = 0; i < 5; i++) {
    card._pv.state.setView('week');
    await sleep(150);
    card._pv.state.setView('agenda');
    await sleep(150);
  }
  card._pv.state.setView('week');
  await sleep(2000);
  const week = card.shadowRoot.querySelector('pv-view-week');
  const forecastDays = week.shadowRoot.querySelectorAll('.day-weather').length;
  const whileWeek = active;
  card._pv.state.setView('day');
  await sleep(1500);
  const afterDay = active;
  conn.subscribeMessage = orig;
  return { forecastDays, whileWeek, afterDay };
}
```

Expected: `forecastDays` ≥ 1 (today's week shows forecast icons), `whileWeek: 1`, `afterDay: 0`. Reload the page afterwards to drop the in-page config override.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/weather-subscription.ts custom_components/planavista/frontend/test/weather-subscription.test.ts custom_components/planavista/frontend/src/components/view-week.ts custom_components/planavista/frontend/src/components/view-agenda.ts
git commit -F - <<'EOF'
fix(frontend): never leak weather forecast subscriptions

Week and Agenda share one ForecastSubscription helper. It subscribes
once per entity, unsubscribes a subscription that resolves after the
view went away, and does not retry a failed subscribe on every state
change. Forecast days are keyed with parseEventDate.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B12: Immutable `hiddenCalendars` and render-cache helpers

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/render-cache.ts`
- Modify: `custom_components/planavista/frontend/src/state/state-manager.ts:60-67`
- Test: `custom_components/planavista/frontend/test/render-cache.test.ts`
- Test: `custom_components/planavista/frontend/test/state-manager.test.ts` (append)

**Interfaces:**
- Consumes: `test/state-manager.test.ts` harness (Task B5)
- Produces: `memoizeOne<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R` (identity-compares every argument); `statesChanged(prev: { states: Record<string, unknown> } | null | undefined, next: same, entityIds: readonly string[]): boolean`; `toggleCalendar()` assigns a new `Set` to `hiddenCalendars`.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/render-cache.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { memoizeOne, statesChanged } from '../src/utils/render-cache';

describe('memoizeOne', () => {
  it('reuses the last result while every argument is identical', () => {
    const fn = vi.fn((a: object, b: Set<string>) => ({ a, size: b.size }));
    const memo = memoizeOne(fn);
    const state = {};
    const hidden = new Set<string>();
    const first = memo(state, hidden);
    expect(memo(state, hidden)).toBe(first);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('recomputes when any argument changes identity', () => {
    const fn = vi.fn((a: object, b: Set<string>) => ({ a, size: b.size }));
    const memo = memoizeOne(fn);
    const state = {};
    const first = memo(state, new Set());
    const second = memo(state, new Set(['calendar.test_alex']));
    expect(second).not.toBe(first);
    expect(second.size).toBe(1);
    expect(memo({}, new Set())).not.toBe(second);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('statesChanged', () => {
  const config = { state: 'configured' };
  const weather = { state: 'sunny' };
  const sun = { state: 'above_horizon' };

  it('ignores changes to entities the card does not show', () => {
    const before = { states: { 'sensor.planavista_config': config, 'weather.home': weather, 'sun.sun': sun } };
    const after = { states: { ...before.states, 'sun.sun': { state: 'below_horizon' } } };
    expect(statesChanged(before, after, ['sensor.planavista_config', 'weather.home'])).toBe(false);
  });

  it('notices a new config sensor or weather state object', () => {
    const before = { states: { 'sensor.planavista_config': config, 'weather.home': weather } };
    expect(statesChanged(before, { states: { ...before.states, 'sensor.planavista_config': { ...config } } }, ['sensor.planavista_config'])).toBe(true);
    expect(statesChanged(before, { states: { ...before.states, 'weather.home': { state: 'rainy' } } }, ['sensor.planavista_config', 'weather.home'])).toBe(true);
  });

  it('treats the first hass as a change', () => {
    expect(statesChanged(undefined, { states: {} }, ['sensor.planavista_config'])).toBe(true);
  });
});
```

Append to `custom_components/planavista/frontend/test/state-manager.test.ts`:

```ts

describe('hiddenCalendars', () => {
  it('is replaced, not mutated, on toggle', () => {
    const before = state.hiddenCalendars;
    state.toggleCalendar('calendar.test_alex');
    const hidden = state.hiddenCalendars;
    expect(hidden).not.toBe(before);
    expect(before.has('calendar.test_alex')).toBe(false);
    expect(hidden.has('calendar.test_alex')).toBe(true);

    state.toggleCalendar('calendar.test_alex');
    expect(state.hiddenCalendars).not.toBe(hidden);
    expect(hidden.has('calendar.test_alex')).toBe(true);
    expect(state.hiddenCalendars.has('calendar.test_alex')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/render-cache.test.ts test/state-manager.test.ts
```

Expected: `render-cache.test.ts` fails to load (`Cannot find module '../src/utils/render-cache'`), and "is replaced, not mutated, on toggle" fails with `expected Set{ 'calendar.test_alex' } not to be Set{ 'calendar.test_alex' } // Object.is equality` (`Tests 1 failed | 4 passed (5)`).

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/planavista/frontend/src/utils/render-cache.ts`:

```ts
/**
 * Helpers that keep the card from re-rendering (and recomputing) when nothing
 * it shows has changed.
 */

/**
 * Cache the last call: while every argument is identical (===) to the
 * previous call's, return the previous result without calling `fn`.
 */
export function memoizeOne<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  let lastArgs: A | null = null;
  let lastResult!: R;
  return (...args: A): R => {
    if (lastArgs && lastArgs.length === args.length && args.every((arg, i) => arg === lastArgs![i])) {
      return lastResult;
    }
    lastResult = fn(...args);
    lastArgs = args;
    return lastResult;
  };
}

type StatesHolder = { states: Record<string, unknown> } | null | undefined;

/**
 * True when any of `entityIds` has a different state object in `next` than
 * in `prev`. Home Assistant replaces a state object only when that entity
 * changes, so identity is enough. A missing `prev` (first hass) counts as a change.
 */
export function statesChanged(prev: StatesHolder, next: StatesHolder, entityIds: readonly string[]): boolean {
  if (!prev || !next) return prev !== next;
  return entityIds.some(id => prev.states[id] !== next.states[id]);
}
```

In `src/state/state-manager.ts` replace `toggleCalendar` (lines 60-67):

```ts
  toggleCalendar(entityId: string): void {
    if (this.hiddenCalendars.has(entityId)) {
      this.hiddenCalendars.delete(entityId);
    } else {
      this.hiddenCalendars.add(entityId);
    }
    this._notify();
  }
```

with:

```ts
  /** Replaces the Set (never mutates it) so memoized views see a new identity. */
  toggleCalendar(entityId: string): void {
    const next = new Set(this.hiddenCalendars);
    if (next.has(entityId)) {
      next.delete(entityId);
    } else {
      next.add(entityId);
    }
    this.hiddenCalendars = next;
    this._notify();
  }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/render-cache.test.ts test/state-manager.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 10 passed (10)`; full suite `Tests 89 passed (89)`; `tsc` silent.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/render-cache.ts custom_components/planavista/frontend/test/render-cache.test.ts custom_components/planavista/frontend/src/state/state-manager.ts custom_components/planavista/frontend/test/state-manager.test.ts
git commit -F - <<'EOF'
refactor(frontend): replace hiddenCalendars on toggle; add render cache helpers

Toggling a calendar assigns a new Set instead of mutating the shared
one, so identity checks see the change. Add memoizeOne() and
statesChanged() for the card's render gating.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B13: `pv-clock` owns the timer; the card re-renders only for its own data

**Files:**
- Create: `custom_components/planavista/frontend/src/components/pv-clock.ts`
- Modify: `custom_components/planavista/frontend/src/utils/date-utils.ts:14-15` (insert `formatClockParts` above the `/**` of `formatDate`)
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts:4,8,11 (import added in Task B10),23,29,38,56,754-768,805-850,932,977-984,1039-1088,1252-1318`
- Test: `custom_components/planavista/frontend/test/clock.test.ts`

**Interfaces:**
- Consumes: `defineElement` (Task B7), `memoizeOne`, `statesChanged` (Task B12), `swipeDirection` import already in the card (Task B10)
- Produces: `formatClockParts(now: Date, format: '12h' | '24h'): { time: string; ampm: string; date: string }`; element `<pv-clock .timeFormat>` (light DOM, renders `.pvc-header-date` and `.pvc-header-time`); card internals `_tick: number` (minute counter passed to views as `.tick`), `_derive` (memoized on sensor state object, card config, `hiddenCalendars`) returning `CardDerived { data, calendars, display, visibleEvents, sharedEventMap }`, `shouldUpdate()` gate, `_watchedEntityIds(): string[]`.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/clock.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatClockParts } from '../src/utils/date-utils';

describe('formatClockParts', () => {
  it('formats a 12-hour clock', () => {
    expect(formatClockParts(new Date(2026, 9, 9, 15, 4), '12h')).toEqual({
      time: '3:04', ampm: 'PM', date: 'Friday, October 9',
    });
    expect(formatClockParts(new Date(2026, 9, 10, 0, 0), '12h')).toMatchObject({ time: '12:00', ampm: 'AM' });
  });

  it('formats a 24-hour clock without AM/PM', () => {
    expect(formatClockParts(new Date(2026, 9, 9, 15, 4), '24h')).toEqual({
      time: '15:04', ampm: '', date: 'Friday, October 9',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/clock.test.ts
```

Expected: `Tests 2 failed (2)` with `TypeError: formatClockParts is not a function`.

- [ ] **Step 3: Write minimal implementation**

In `src/utils/date-utils.ts`, insert above the `/**` that starts `* Format a date for display.`:

```ts
/**
 * Header clock text: the time (without AM/PM), the AM/PM marker ('' for
 * 24-hour), and the long date.
 */
export function formatClockParts(
  now: Date,
  format: '12h' | '24h',
): { time: string; ampm: string; date: string } {
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if (format === '24h') {
    return { time: `${now.getHours()}:${minutes}`, ampm: '', date };
  }
  return { time: `${now.getHours() % 12 || 12}:${minutes}`, ampm: now.getHours() >= 12 ? 'PM' : 'AM', date };
}

```

Create `custom_components/planavista/frontend/src/components/pv-clock.ts`:

```ts
import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { formatClockParts } from '../utils/date-utils';

/**
 * Header date and time. Owns its 1-second timer and re-renders only when the
 * minute changes, so the card itself no longer re-renders every second.
 *
 * Renders into light DOM (no shadow root) so the card's header styles and
 * breakpoints (.pvc-header-date, .pvc-header-time, ...) still apply; the card
 * gives the host `display: contents` so both parts stay header flex items.
 */
export class PVClock extends LitElement {
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';

  /** Minutes since the epoch; changing it is what triggers a render. */
  @state() private _minute = Math.floor(Date.now() / 60000);

  private _timer: ReturnType<typeof setInterval> | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._minute = Math.floor(Date.now() / 60000);
    this._timer = setInterval(() => {
      const minute = Math.floor(Date.now() / 60000);
      if (minute !== this._minute) this._minute = minute;
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  render() {
    const { time, ampm, date } = formatClockParts(new Date(), this.timeFormat);
    return html`
      <div class="pvc-header-date">${date}</div>
      <div class="pvc-header-time">
        <span class="pvc-time-display">${time}</span>${ampm ? html`<span class="pvc-time-ampm">${ampm}</span>` : nothing}
      </div>
    `;
  }
}

defineElement('pv-clock', PVClock);
```

In `src/cards/planavista-calendar-card.ts`:

1. Line 4: add `PlanaVistaData` to the types import:

```ts
import { CalendarEvent, CalendarConfig, DisplayConfig, WeatherCondition, PlanaVistaCardConfig, PlanaVistaData, ThemeOverrides } from '../types';
```

2. Delete line 8 `import { formatDate } from '../utils/date-utils';` (unused).

3. After the Task B10 import `import { swipeDirection } from '../utils/gestures';` add:

```ts
import { memoizeOne, statesChanged } from '../utils/render-cache';
```

4. After line 23 `import '../components/onboarding-wizard';` add:

```ts
import '../components/pv-clock';

/** A calendar that shares an event (same UID), for Day-view participant avatars. */
interface SharedParticipant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
  person_entity: string;
}

/** What render() derives from the config sensor (see _derive). */
interface CardDerived {
  data: PlanaVistaData | null;
  calendars: CalendarConfig[];
  display: DisplayConfig;
  visibleEvents: CalendarEvent[];
  sharedEventMap: Map<string, SharedParticipant[]>;
}
```

5. Line 29 `@state() private _currentTime = new Date();` becomes:

```ts
  /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
  @state() private _tick = Math.floor(Date.now() / 60000);
```

6. Line 38 `private _clockTimer: ReturnType<typeof setInterval> | null = null;` becomes `private _tickTimer: ReturnType<typeof setTimeout> | null = null;`

7. In the styles, before `ha-card {` (line 56) add:

```css
      pv-clock {
        display: contents;
      }

```

8. Replace `connectedCallback`/`disconnectedCallback` (lines 754-768) with:

```ts
  connectedCallback() {
    super.connectedCallback();
    this._tick = Math.floor(Date.now() / 60000);
    this._scheduleTick();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tickTimer) {
      clearTimeout(this._tickTimer);
      this._tickTimer = null;
    }
    document.removeEventListener('click', this._filterCloseHandler);
  }

  /** Bump `_tick` just after each minute boundary (the header clock has its own timer). */
  private _scheduleTick() {
    if (this._tickTimer) clearTimeout(this._tickTimer);
    this._tickTimer = setTimeout(() => {
      this._tick = Math.floor(Date.now() / 60000);
      this._scheduleTick();
    }, 60000 - (Date.now() % 60000) + 50);
  }

  /**
   * Home Assistant sets a new `hass` on every state change in the house.
   * Re-render for it only when an entity this card shows has changed.
   */
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.size === 1 && changedProps.has('hass')) {
      const prev = changedProps.get('hass') as HomeAssistant | undefined;
      return statesChanged(prev, this.hass, this._watchedEntityIds());
    }
    return true;
  }

  /** The config sensor, the weather entity, and the people whose avatars are shown. */
  private _watchedEntityIds(): string[] {
    const { calendars, display } = this._derived();
    const ids = [this._config?.entity || 'sensor.planavista_config'];
    if (display.weather_entity) ids.push(display.weather_entity);
    for (const cal of calendars) {
      if (cal.person_entity) ids.push(cal.person_entity);
    }
    return ids;
  }
```

9. Replace lines 805-850 (`_getData`, `_getWeatherEntity`, `_getWeatherEntityId`, `_resolveDisplay`, `_getVisibleCalendars`) with:

```ts
  /**
   * Everything render() derives from the config sensor. Cached until the
   * sensor's state object, the card config, or hiddenCalendars changes, so
   * views get the same arrays (and skip re-rendering) when nothing changed.
   */
  private _derive = memoizeOne((
    _sensorState: unknown,
    config: PlanaVistaCardConfig | undefined,
    hidden: Set<string>,
  ): CardDerived => {
    const data = this.hass ? getPlanaVistaData(this.hass, config?.entity) : null;

    // Card YAML wins, then the sensor's display config, then defaults.
    const global = data?.display;
    const display: DisplayConfig = {
      time_format: config?.time_format || global?.time_format || '12h',
      weather_entity: config?.weather_entity || global?.weather_entity || '',
      first_day: config?.first_day || global?.first_day || 'sunday',
      default_view: config?.default_view || config?.view || global?.default_view || 'week',
      theme: config?.theme || global?.theme || 'light',
      theme_overrides: global?.theme_overrides,
    };

    // A card-level `calendars` list (entity_ids) narrows the visible calendars.
    const all = (data?.calendars || []).filter((c: CalendarConfig) => c.visible !== false);
    const cardFilter = config?.calendars;
    const calendars = Array.isArray(cardFilter) && cardFilter.length > 0
      ? all.filter((c: CalendarConfig) => cardFilter.includes(c.entity_id))
      : all;

    // Group all events by UID to find shared events (Day-view participant avatars).
    const events = data?.events || [];
    const sharedEventMap = new Map<string, SharedParticipant[]>();
    for (const ev of events) {
      const uid = ev.uid;
      if (!uid) continue;
      if (!sharedEventMap.has(uid)) sharedEventMap.set(uid, []);
      const arr = sharedEventMap.get(uid)!;
      const eid = ev.calendar_entity_id;
      // Deduplicate by calendar entity (recurring events share UIDs)
      if (!arr.some(p => p.entity_id === eid)) {
        const cal = calendars.find(c => c.entity_id === eid);
        arr.push({
          entity_id: eid,
          calendar_name: ev.calendar_name || cal?.display_name || '',
          calendar_color: ev.calendar_color || cal?.color || '',
          person_entity: cal?.person_entity || '',
        });
      }
    }

    return { data, calendars, display, visibleEvents: filterVisibleEvents(events, hidden), sharedEventMap };
  });

  private _derived(): CardDerived {
    const entity = this._config?.entity || 'sensor.planavista_config';
    return this._derive(this.hass?.states?.[entity], this._config, this._pv.state.hiddenCalendars);
  }

  private _getData() {
    return this._derived().data;
  }

  private _getWeatherEntityId(): string | null {
    return this._derived().display.weather_entity || null;
  }

  private _getWeatherEntity() {
    const weatherId = this._getWeatherEntityId();
    return weatherId ? this.hass?.states?.[weatherId] : null;
  }
```

10. In `render()`: line 932 `const data = this._getData();` → `const { data, calendars, display, visibleEvents } = this._derived();`, and lines 977-984:

```ts
    const pvState = this._pv.state;
    const currentView = pvState.currentView;
    const currentDate = pvState.currentDate;
    const calendars = this._getVisibleCalendars();
    const events = data.events || [];
    const display = this._resolveDisplay();
    const hideHeader = !!(this._config as PlanaVistaCardConfig)?.hide_header;
    const visibleEvents = filterVisibleEvents(events, pvState.hiddenCalendars);
```

become:

```ts
    const pvState = this._pv.state;
    const currentView = pvState.currentView;
    const hideHeader = !!(this._config as PlanaVistaCardConfig)?.hide_header;
```

11. `_renderHeader` (lines 1039-1088): change the signature to `private _renderHeader(display: DisplayConfig) {`, delete everything from `const timeFormat = display?.time_format || '12h';` through the `dateStr` block (lines 1042-1062), keep the weather markup unchanged, and replace the two lines

```ts
        <div class="pvc-header-date">${dateStr}</div>

        <div class="pvc-header-time">${timeHtml}</div>
```

with

```ts
        <pv-clock .timeFormat=${display.time_format || '12h'}></pv-clock>
```

The method then reads:

```ts
  private _renderHeader(display: DisplayConfig) {
    const hideWeather = !!(this._config as PlanaVistaCardConfig)?.hide_weather;
    const weather = hideWeather ? null : this._getWeatherEntity();

    return html`
      <div class="pvc-header">
        ${weather ? html`
          <div class="pvc-weather" @click=${this._showWeatherDetails}
               title="Click for weather details">
            <div class="pvc-weather-icon">
              ${weatherIcon((weather.state || 'cloudy') as WeatherCondition, 48)}
            </div>
            <div class="pvc-weather-info">
              <span class="pvc-weather-temp">
                ${Math.round(weather.attributes.temperature ?? 0)}°${this._getTempUnit(weather)}
              </span>
              <span class="pvc-weather-condition">
                ${(weather.state || '').replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        ` : html`<div class="pvc-no-weather"></div>`}

        <pv-clock .timeFormat=${display.time_format || '12h'}></pv-clock>
      </div>
    `;
  }
```

12. In `_renderView`, the `case 'day'` block (lines 1252-1274, the `sharedEventMap` loop plus `const tick = …`) becomes:

```ts
      case 'day': {
        const { sharedEventMap } = this._derived();
        const tick = this._tick;
        return html`<pv-view-day
```

and in the `week`, `month` and `agenda` cases (lines 1289, 1304, 1318) `const tick = Math.floor(this._currentTime.getTime() / 60000);` becomes `const tick = this._tick;`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/clock.test.ts && npm test && npx tsc --noEmit -p . && grep -n "_currentTime\|_resolveDisplay\|_getVisibleCalendars" src/cards/planavista-calendar-card.ts
```

Expected: `Tests 2 passed (2)`; full suite `Tests 91 passed (91)`; `tsc` silent; grep prints nothing.

Live check:

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script` (counts card renders over 5 s while an unrelated entity changes every second, then checks a calendar toggle still re-renders):

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const card = findDeep('planavista-calendar-card');
  const token = document.querySelector('home-assistant').hass.auth.data.access_token;
  const probe = (method, body) => fetch('/api/states/sensor.plan_check_probe', {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  let updates = 0;
  const orig = card.update;
  card.update = function (changed) { updates++; return orig.call(this, changed); };
  for (let i = 0; i < 5; i++) {
    await probe('POST', { state: String(i) });
    await sleep(1000);
  }
  card.update = orig;
  await probe('DELETE');

  const st = card._pv.state;
  st.setView('week');
  st.setDate(new Date(2026, 9, 9));
  await card.updateComplete;
  const fridayCount = async () => {
    const week = card.shadowRoot.querySelector('pv-view-week');
    await week.updateComplete;
    const fri = [...week.shadowRoot.querySelectorAll('.day-card')].find(dc => dc.querySelector('.day-name').textContent.includes('Fri 9'));
    return fri.querySelectorAll('pv-event-chip').length;
  };
  const before = await fridayCount();
  st.toggleCalendar('calendar.test_alex');
  await card.updateComplete;
  const hiddenAlex = await fridayCount();
  st.toggleCalendar('calendar.test_alex');
  await card.updateComplete;

  const clock = card.shadowRoot.querySelector('pv-clock');
  return {
    updates,
    clockText: clock.textContent.replace(/\s+/g, ' ').trim(),
    clockHasShadowRoot: !!clock.shadowRoot,
    before,
    hiddenAlex,
  };
}
```

Expected: `updates` is 0 or 1 (1 only if a minute boundary passed; before this task it was 5 or more), `clockText` like `"Friday, October 9 3:04 PM"` matching the current time, `clockHasShadowRoot: false`, `before: 3`, `hiddenAlex: 1`. Take a screenshot at 1440 px wide and at 400 px wide and confirm the header layout is unchanged (weather/blank left, date centred, time right; date only on the narrow layout).

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/components/pv-clock.ts custom_components/planavista/frontend/src/utils/date-utils.ts custom_components/planavista/frontend/test/clock.test.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -F - <<'EOF'
perf(frontend): stop re-rendering the whole card every second

The header clock is its own pv-clock element with its own timer and
renders only when the minute changes. The card re-renders for a new
hass only when the config sensor, the weather entity or a shown
person changed, and caches the derived calendars and event arrays.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B14: Photon location search helper

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/location-search.ts`
- Test: `custom_components/planavista/frontend/test/location-search.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces (from `src/utils/location-search.ts`): `PHOTON_API`, `LOCATION_DEBOUNCE_MS = 350`, `LOCATION_MIN_CHARS = 3`, `interface PhotonProperties`, `buildPhotonUrl(text: string): string`, `formatPhotonFeature(p: PhotonProperties): string`, `parsePhotonResponse(body: unknown): string[]`, `interface LocationSearchOptions { onResults(s: string[]): void; onLoading(l: boolean): void; fetchFn?: typeof fetch }`, `class LocationSearch { constructor(opts: LocationSearchOptions); input(text: string, enabled: boolean): void; cancel(): void }`.

- [ ] **Step 1: Write the failing test**

Create `custom_components/planavista/frontend/test/location-search.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LocationSearch,
  buildPhotonUrl,
  formatPhotonFeature,
  parsePhotonResponse,
} from '../src/utils/location-search';

type FetchCall = { url: string; init: RequestInit; resolve: (body: unknown) => void; reject: (err: unknown) => void };

/** fetch stand-in whose responses the test releases one by one. */
function fakeFetch() {
  const calls: FetchCall[] = [];
  const fn = vi.fn((url: string, init: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      calls.push({
        url,
        init,
        resolve: body => resolve({ ok: true, status: 200, json: async () => body } as Response),
        reject,
      });
    }),
  );
  return { fn, calls };
}

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

function photon(...names: string[]) {
  return { type: 'FeatureCollection', features: names.map(name => ({ type: 'Feature', properties: { name } })) };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildPhotonUrl', () => {
  it('sends only the typed text', () => {
    expect(buildPhotonUrl('1600 Penn Ave')).toBe('https://photon.komoot.io/api/?q=1600%20Penn%20Ave&limit=5&lang=en');
    expect(buildPhotonUrl('Café & Bar')).toBe('https://photon.komoot.io/api/?q=Caf%C3%A9%20%26%20Bar&limit=5&lang=en');
  });
});

describe('formatPhotonFeature', () => {
  it('joins the non-empty address parts', () => {
    expect(formatPhotonFeature({
      name: 'Lincoln Park Zoo',
      housenumber: '2001',
      street: 'North Clark Street',
      city: 'Chicago',
      state: 'Illinois',
      postcode: '60614',
      country: 'United States',
    })).toBe('Lincoln Park Zoo, 2001 North Clark Street, Chicago, Illinois, 60614, United States');
  });

  it('skips missing and repeated parts', () => {
    expect(formatPhotonFeature({ name: 'Springfield', state: 'Illinois', country: 'United States' }))
      .toBe('Springfield, Illinois, United States');
    expect(formatPhotonFeature({ street: 'Main Street', city: 'Main Street', country: '' })).toBe('Main Street');
    expect(formatPhotonFeature({})).toBe('');
  });
});

describe('parsePhotonResponse', () => {
  it('returns up to five unique, non-empty suggestions', () => {
    const body = photon('A', 'B', 'A', '', 'C', 'D', 'E', 'F');
    expect(parsePhotonResponse(body)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(parsePhotonResponse(null)).toEqual([]);
    expect(parsePhotonResponse({ features: 'nope' })).toEqual([]);
  });
});

describe('LocationSearch', () => {
  function setup() {
    const { fn, calls } = fakeFetch();
    const onResults = vi.fn();
    const onLoading = vi.fn();
    const search = new LocationSearch({ fetchFn: fn as unknown as typeof fetch, onResults, onLoading });
    return { fn, calls, onResults, onLoading, search };
  }

  it('makes no network request when the setting is off', async () => {
    const { fn, search, onResults } = setup();
    search.input('1600 Pennsylvania Avenue', false);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).not.toHaveBeenCalled();
    expect(onResults).toHaveBeenLastCalledWith([]);
  });

  it('waits for 3 characters', async () => {
    const { fn, search } = setup();
    search.input('Ch', true);
    await vi.advanceTimersByTimeAsync(2000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('waits for a 350 ms pause and sends one request for the last text', async () => {
    const { fn, calls, search } = setup();
    search.input('Chi', true);
    await vi.advanceTimersByTimeAsync(200);
    search.input('Chic', true);
    await vi.advanceTimersByTimeAsync(200);
    search.input('Chicago', true);
    await vi.advanceTimersByTimeAsync(349);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(calls[0].url).toBe('https://photon.komoot.io/api/?q=Chicago&limit=5&lang=en');
    expect(calls[0].url).not.toMatch(/lat|lon/);
    expect(calls[0].init).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
  });

  it('applies only the newest response', async () => {
    const { calls, search, onResults } = setup();
    search.input('Spring', true);
    await vi.advanceTimersByTimeAsync(350);
    search.input('Springfield', true);
    await vi.advanceTimersByTimeAsync(350);
    expect(calls).toHaveLength(2);
    expect(calls[0].init.signal?.aborted).toBe(true);

    calls[1].resolve(photon('Springfield, Illinois'));
    await flush();
    calls[0].resolve(photon('Spring Grove'));
    await flush();
    expect(onResults).toHaveBeenLastCalledWith(['Springfield, Illinois']);
    expect(onResults).not.toHaveBeenCalledWith(['Spring Grove']);
  });

  it('clears suggestions when the request fails', async () => {
    const { calls, search, onResults, onLoading } = setup();
    search.input('Chicago', true);
    await vi.advanceTimersByTimeAsync(350);
    calls[0].reject(new TypeError('Failed to fetch'));
    await flush();
    expect(onResults).toHaveBeenLastCalledWith([]);
    expect(onLoading).toHaveBeenLastCalledWith(false);
  });

  it('cancel() drops a pending search', async () => {
    const { fn, search } = setup();
    search.input('Chicago', true);
    search.cancel();
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd custom_components/planavista/frontend && npx vitest run test/location-search.test.ts
```

Expected: `Error: Cannot find module '../src/utils/location-search'` (`Tests no tests`).

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/planavista/frontend/src/utils/location-search.ts`:

```ts
/**
 * Opt-in address suggestions for the event dialog (display setting
 * `location_autocomplete`, off by default).
 *
 * When on, the text typed into the Location field, and nothing else, is sent
 * to Photon (photon.komoot.io), an OpenStreetMap geocoder built for
 * search-as-you-type: at most once per 350 ms pause, only for 3+ characters,
 * without cookies or a Referer. Only the newest response is applied.
 */

export const PHOTON_API = 'https://photon.komoot.io/api/';
export const LOCATION_DEBOUNCE_MS = 350;
export const LOCATION_MIN_CHARS = 3;
const MAX_SUGGESTIONS = 5;

/** The Photon feature properties PlanaVista shows. */
export interface PhotonProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

/** Photon search URL for the typed text. */
export function buildPhotonUrl(text: string): string {
  return `${PHOTON_API}?q=${encodeURIComponent(text)}&limit=${MAX_SUGGESTIONS}&lang=en`;
}

/**
 * One-line address: name, house number + street, city, state, postcode,
 * country. Empty parts are skipped, and so are repeats (a city result's name
 * is usually also its city).
 */
export function formatPhotonFeature(p: PhotonProperties): string {
  const streetLine = [p.housenumber, p.street].filter(Boolean).join(' ');
  const parts: string[] = [];
  for (const part of [p.name, streetLine, p.city, p.state, p.postcode, p.country]) {
    const text = (part || '').trim();
    if (text && !parts.some(existing => existing.toLowerCase() === text.toLowerCase())) parts.push(text);
  }
  return parts.join(', ');
}

/** Unique display strings from a Photon GeoJSON response (at most five). */
export function parsePhotonResponse(body: unknown): string[] {
  const features = (body as { features?: unknown } | null)?.features;
  if (!Array.isArray(features)) return [];
  const out: string[] = [];
  for (const feature of features) {
    const label = formatPhotonFeature((feature as { properties?: PhotonProperties })?.properties || {});
    if (label && !out.includes(label)) out.push(label);
    if (out.length === MAX_SUGGESTIONS) break;
  }
  return out;
}

export interface LocationSearchOptions {
  onResults: (suggestions: string[]) => void;
  onLoading: (loading: boolean) => void;
  /** Injected in tests; defaults to window.fetch. */
  fetchFn?: typeof fetch;
}

/** Debounced, newest-wins Photon lookup for one input field. */
export class LocationSearch {
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _abort: AbortController | null = null;
  /** Bumped by every input/cancel; a response for an older value is dropped. */
  private _seq = 0;
  private readonly _fetch: typeof fetch;

  constructor(private readonly _opts: LocationSearchOptions) {
    this._fetch = _opts.fetchFn ?? ((input, init) => fetch(input, init));
  }

  /** Call on every change to the field. With `enabled` false nothing is ever sent. */
  input(text: string, enabled: boolean): void {
    this.cancel();
    const query = text.trim();
    if (!enabled || query.length < LOCATION_MIN_CHARS) {
      this._opts.onResults([]);
      this._opts.onLoading(false);
      return;
    }
    this._opts.onLoading(true);
    const seq = this._seq;
    this._timer = setTimeout(() => {
      this._timer = null;
      void this._run(query, seq);
    }, LOCATION_DEBOUNCE_MS);
  }

  /** Drop any pending or in-flight search (dialog closed, suggestion picked). */
  cancel(): void {
    this._seq++;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._abort) {
      this._abort.abort();
      this._abort = null;
    }
  }

  private async _run(query: string, seq: number): Promise<void> {
    const controller = new AbortController();
    this._abort = controller;
    try {
      const resp = await this._fetch(buildPhotonUrl(query), {
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      if (!resp.ok) throw new Error(`Photon HTTP ${resp.status}`);
      const body = await resp.json();
      if (seq === this._seq) this._opts.onResults(parsePhotonResponse(body));
    } catch {
      if (seq === this._seq) this._opts.onResults([]);
    } finally {
      if (seq === this._seq) {
        this._abort = null;
        this._opts.onLoading(false);
      }
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd custom_components/planavista/frontend && npx vitest run test/location-search.test.ts && npm test && npx tsc --noEmit -p .
```

Expected: `Tests 10 passed (10)`; full suite `Tests 101 passed (101)`; `tsc` silent.

- [ ] **Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/location-search.ts custom_components/planavista/frontend/test/location-search.test.ts
git commit -F - <<'EOF'
feat(frontend): add an opt-in Photon address lookup helper

LocationSearch sends only the typed text to photon.komoot.io, at most
once per 350 ms pause and only for 3+ characters, without cookies or a
referrer, and applies only the newest response. It never touches the
network while disabled.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B15: "Address suggestions" setting in the setup wizard and settings panel

UI only (no logic to unit-test); verified on the dev HA. Depends on the backend accepting `display.location_autocomplete` (boolean) in `planavista.save_config`.

**Files:**
- Modify: `custom_components/planavista/frontend/src/types.ts:128-135`
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts:44,91,199,223,362-368,1097-1099`

**Interfaces:**
- Consumes: nothing new
- Produces: `DisplayConfig.location_autocomplete?: boolean` (absent = off); the wizard saves `display.location_autocomplete` (always a boolean) via `planavista.save_config`.

- [ ] **Step 1: Implement**

`src/types.ts`, in `DisplayConfig` (lines 128-135) after `theme_overrides?: ThemeOverrides;` add:

```ts
  /** Address suggestions in the event dialog (sends typed text to Photon). Off when absent. */
  location_autocomplete?: boolean;
```

`src/components/onboarding-wizard.ts`:

1. After line 44 (`@state() private _defaultView: 'day' | 'week' | 'month' | 'agenda' = 'week';`) add:

```ts
  @state() private _locationAutocomplete = false;
```

2. In `_initFromConfig`, after line 91 (`this._defaultView = display.default_view || 'week';`) add:

```ts
    this._locationAutocomplete = display.location_autocomplete === true;
```

3. In `_finish`, after line 199 (`default_view: this._defaultView,`) add:

```ts
          location_autocomplete: this._locationAutocomplete,
```

4. Before `private _cancel() {` (line 223) add:

```ts
  private _toggleLocationAutocomplete() {
    this._locationAutocomplete = !this._locationAutocomplete;
  }

```

5. At the end of `_renderPage0` (Preferences, shown in both the setup wizard and the settings panel's Preferences tab), lines 362-368:

```ts
                <span class="view-label">${v.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `;
```

become:

```ts
                <span class="view-label">${v.label}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Address suggestions (location autocomplete) -->
        <div class="field-group">
          <div class="toggle-row">
            <span class="pv-label" id="address-suggestions-label">Address suggestions</span>
            <div
              class="pv-toggle ${this._locationAutocomplete ? 'active' : ''}"
              role="switch"
              tabindex="0"
              aria-checked="${this._locationAutocomplete}"
              aria-labelledby="address-suggestions-label"
              @click=${this._toggleLocationAutocomplete}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this._toggleLocationAutocomplete();
                }
              }}
            ></div>
          </div>
          <p class="field-hint">
            <strong>Off (recommended):</strong> PlanaVista stays 100% local. Locations are plain
            text and nothing leaves your home network.
          </p>
          <p class="field-hint">
            <strong>On:</strong> as you type a location, the text you've typed is sent to Photon
            (photon.komoot.io), a free OpenStreetMap-based service, to suggest addresses. Nothing
            else is sent: not your home location or any calendar details.
          </p>
        </div>
      </div>
    `;
```

6. In the styles, after the `.field-group { margin-bottom: 1.5rem; }` rule (lines 1097-1099) add:

```css

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .toggle-row .pv-label {
        margin-bottom: 0;
      }

      .toggle-row .pv-toggle {
        flex-shrink: 0;
      }

      .field-hint {
        font-size: 0.8125rem;
        line-height: 1.5;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0 0 0.375rem;
        max-width: 60ch;
      }

      .field-hint strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 600;
      }
```

- [ ] **Step 2: Verify (type check, tests, build, dev HA)**

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test && npm run build && cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Expected: `tsc` silent, `Tests 101 passed (101)`, build succeeds.

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`), then `evaluate_script` (opens Settings, which starts on the Preferences tab, sets the toggle and saves):

```js
async () => {
  const on = true;
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  card._settingsOpen = true;
  await card.updateComplete;
  const wiz = card.shadowRoot.querySelector('pv-onboarding-wizard');
  await wiz.updateComplete;
  const page = wiz.shadowRoot.querySelector('.page-content').textContent.replace(/\s+/g, ' ');
  const toggle = wiz.shadowRoot.querySelector('[aria-labelledby="address-suggestions-label"]');
  const initial = toggle.getAttribute('aria-checked');
  if ((initial === 'true') !== on) toggle.click();
  await wiz.updateComplete;
  const checked = toggle.getAttribute('aria-checked');
  wiz.shadowRoot.querySelector('.next-btn').click();
  await new Promise(r => setTimeout(r, 2000));
  return {
    initial,
    checked,
    copy: page.includes('Address suggestions') && page.includes('Off (recommended)') && page.includes('photon.komoot.io'),
    settingsClosed: card._settingsOpen === false,
  };
}
```

Expected: `initial: "false"` (default off), `checked: "true"`, `copy: true`, `settingsClosed: true`. Then confirm the saved value:

```bash
python scripts/ha.py api GET /api/states/sensor.planavista_config | grep -n location_autocomplete
```

Expected: `"location_autocomplete": true`. Run the same script again with `const on = false;` and confirm the sensor shows `"location_autocomplete": false` (leave it off). Take a screenshot of the Preferences tab showing the toggle and both explanations.

- [ ] **Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/types.ts custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -F - <<'EOF'
feat(frontend): add an "Address suggestions" setting, off by default

The setup wizard and settings panel get a toggle that explains the
trade-off: off keeps PlanaVista fully local; on sends only the typed
location text to Photon (photon.komoot.io). Saved as
display.location_autocomplete.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

### Task B16: Location field follows the setting; Nominatim removed

UI wiring of Task B14's tested helper; verified on the dev HA.

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/event-create-dialog.ts:7,18,43-49,517,532-533,989-1116,1156-1161`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts` (Task B13 `_derive` display object; dialog template lines 1009-1016)

**Interfaces:**
- Consumes: `LocationSearch` (Task B14); `DisplayConfig.location_autocomplete` (Task B15); `_derive` (Task B13)
- Produces: dialog property `locationAutocomplete: boolean` (default false); card passes `.locationAutocomplete=${display.location_autocomplete === true}`.

- [ ] **Step 1: Implement**

`src/components/event-create-dialog.ts`:

1. After line 7 (`import { baseStyles, buttonStyles, formStyles, dialogStyles, animationStyles } from '../styles/shared';`) add:

```ts
import { LocationSearch } from '../utils/location-search';
```

2. After line 18 (`@property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';`) add:

```ts
  /** Display setting `location_autocomplete`: when false the Location field never touches the network. */
  @property({ attribute: false }) locationAutocomplete = false;
```

3. Lines 43-49:

```ts
  // Location autocomplete state
  @state() private _locationSuggestions: Array<{ display_name: string }> = [];
  @state() private _locationLoading = false;
  @state() private _locationFocused = false;

  private _locationDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _pv = new PlanaVistaController(this);
```

become:

```ts
  // Location autocomplete state (only used when locationAutocomplete is on)
  @state() private _locationSuggestions: string[] = [];
  @state() private _locationLoading = false;
  @state() private _locationFocused = false;

  private _locationSearch = new LocationSearch({
    onResults: suggestions => { this._locationSuggestions = suggestions; },
    onLoading: loading => { this._locationLoading = loading; },
  });
  private _pv = new PlanaVistaController(this);
```

4. Before `updated(changedProps: PropertyValues) {` (line 517) add:

```ts
  disconnectedCallback() {
    super.disconnectedCallback();
    this._locationSearch.cancel();
  }

```

5. In `_initForm`, lines 532-533:

```ts
    this._locationSuggestions = [];
    this._locationFocused = false;
```

become:

```ts
    this._locationSearch.cancel();
    this._locationSuggestions = [];
    this._locationLoading = false;
    this._locationFocused = false;
```

6. Replace the whole location section, lines 989-1116 (from the `// ====` banner above `// LOCATION AUTOCOMPLETE (fixed position, HA location bias)` through the end of `_selectLocation`, i.e. `_renderLocationField`, `_renderLocationDropdown`, `_onLocationInput`, `_searchLocation` with the Nominatim URL and home coordinates, `_haversine`, `_selectLocation`), with:

```ts
  // ==================================================================
  // LOCATION (plain text; opt-in Photon suggestions, see utils/location-search)
  // ==================================================================

  private _renderLocationField() {
    return html`
      <div class="location-wrap">
        <input
          class="pv-input location-input"
          type="text"
          placeholder=${this.locationAutocomplete ? 'Search for a place or address...' : 'Add a location'}
          .value=${this._location}
          @input=${this._onLocationInput}
          @focus=${() => this._locationFocused = true}
          @blur=${() => { setTimeout(() => { this._locationFocused = false; }, 250); }}
        />
      </div>
    `;
  }

  private _renderLocationDropdown() {
    if (!this.locationAutocomplete || !this._locationFocused ||
        (!this._locationSuggestions.length && !this._locationLoading)) {
      return nothing;
    }

    // Calculate position from the location input
    const input = this._locationInput;
    if (!input) return nothing;
    const rect = input.getBoundingClientRect();

    return html`
      <div
        class="location-suggestions-fixed"
        style="top: ${rect.bottom}px; left: ${rect.left}px; width: ${rect.width}px;"
      >
        ${this._locationLoading ? html`
          <div class="location-loading">Searching...</div>
        ` : nothing}
        ${this._locationSuggestions.map(s => html`
          <div class="location-suggestion" @mousedown=${() => this._selectLocation(s)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${s}</span>
          </div>
        `)}
        ${this._locationSuggestions.length > 0 ? html`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        ` : nothing}
      </div>
    `;
  }

  private _onLocationInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this._location = value;
    // Sends nothing unless the location_autocomplete setting is on.
    this._locationSearch.input(value, this.locationAutocomplete);
  }

  private _selectLocation(name: string) {
    this._locationSearch.cancel();
    this._location = name;
    this._locationSuggestions = [];
    this._locationLoading = false;
    this._locationFocused = false;
  }

```

7. In `_close` (lines 1156-1161), after `this._activeTimePicker = null;` add `this._locationSearch.cancel();`:

```ts
  private _close() {
    this._datePickerOpen = false;
    this._activeTimePicker = null;
    this._locationSearch.cancel();
    this._locationSuggestions = [];
    this._pv.state.closeDialog();
  }
```

`src/cards/planavista-calendar-card.ts`:

1. In `_derive` (Task B13), the `display` object gains the setting after `theme_overrides: global?.theme_overrides,`:

```ts
      location_autocomplete: global?.location_autocomplete === true,
```

2. In the dialog template (lines 1009-1016) add the property after `.timeFormat=…`:

```ts
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${calendars}
            .open=${true}
            .mode=${pvState.dialogOpen}
            .prefill=${pvState.createPrefill}
            .timeFormat=${display?.time_format || '12h'}
            .locationAutocomplete=${display.location_autocomplete === true}
          ></pv-event-create-dialog>
```

- [ ] **Step 2: Verify (type check, tests, build, dev HA)**

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test && grep -rn -i "nominatim\|haversine\|latitude\|longitude" src; npm run build && grep -c -i nominatim dist/planavista-cards.js; cd ../../.. && scripts/dev-ha.sh deploy-frontend
```

Expected: `tsc` silent, `Tests 101 passed (101)`, the source grep prints nothing, the dist count is `0`.

Chrome DevTools MCP: `new_page` `url: "http://127.0.0.1:8124/wall-calendar/planavista"`, `isolatedContext: "planavista-dev"` (or reload with `ignoreCache: true`). With the setting off (Task B15 left it off), `evaluate_script`:

```js
async () => {
  const findDeep = (sel, root = document) => {
    const hit = root.querySelector(sel);
    if (hit) return hit;
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) {
        const found = findDeep(sel, el.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  };
  const card = findDeep('planavista-calendar-card');
  card._pv.state.openCreateDialog();
  await card.updateComplete;
  const dlg = card.shadowRoot.querySelector('pv-event-create-dialog');
  await dlg.updateComplete;
  dlg.shadowRoot.querySelector('.show-more-btn').click();
  await dlg.updateComplete;
  const input = dlg.shadowRoot.querySelector('.location-input');
  input.focus();
  input.value = '1600 Pennsylvania';
  input.dispatchEvent(new Event('input'));
  await new Promise(r => setTimeout(r, 1500));
  const result = {
    enabled: dlg.locationAutocomplete,
    placeholder: input.placeholder,
    suggestions: dlg._locationSuggestions.length,
  };
  card._pv.state.closeDialog();
  return result;
}
```

Expected: `{ enabled: false, placeholder: "Add a location", suggestions: 0 }`, and `list_network_requests` with `resourceTypes: ["fetch", "xhr"]` shows no request to `photon.komoot.io` or `nominatim.openstreetmap.org`.

Turn the setting on by running the Task B15 settings script with `const on = true;`, reload the page, then run the dialog script above again. Expected: `{ enabled: true, placeholder: "Search for a place or address...", suggestions: ≥ 1 }`, and `list_network_requests` (`resourceTypes: ["fetch"]`) shows exactly one `GET https://photon.komoot.io/api/?q=1600%20Pennsylvania&limit=5&lang=en` (no `lat`/`lon`, no request to Nominatim). Screenshot the open suggestion list with the "Suggestions by Photon · © OpenStreetMap contributors" line. Finally run the Task B15 script with `const on = false;` so the dev HA is back to the default.

- [ ] **Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/event-create-dialog.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -F - <<'EOF'
feat(frontend): make location suggestions opt-in and use Photon

The Location field is plain text unless "Address suggestions" is on.
When on, the dialog uses the Photon lookup helper (typed text only,
debounced, newest response wins). The Nominatim lookup and its use of
the home coordinates are removed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
```

---

## Part C: CI, release, and verification

### Task R1: Frontend CI workflow and first CI run

**Files:**
- Create: `.github/workflows/frontend.yml`

**Interfaces:**
- Consumes: `.github/workflows/validate.yml` (workflow `Validate`: jobs `hassfest`, `hacs`, `backend-tests`, from Task A9); the `npm test` script and `vitest.config.ts` (Task B1); `npm run build` producing `custom_components/planavista/frontend/dist/planavista-cards.js`.
- Produces: workflow `Frontend` (type check, unit tests, build, committed-bundle check) on push to `main` and `fix/**` and on manual dispatch.

- [ ] **Step 1: Write the frontend workflow**

```yaml
# .github/workflows/frontend.yml
name: Frontend

on:
  push:
    branches: [main, "fix/**"]
  workflow_dispatch:

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: custom_components/planavista/frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: custom_components/planavista/frontend/package-lock.json
      - run: npm ci
      - run: npx tsc --noEmit -p .
      - run: npm test
      - run: npm run build
      - name: Committed bundle matches the build
        run: git diff --exit-code -- dist/planavista-cards.js
```

- [ ] **Step 2: Grant the token the `workflow` scope (user action, one time)**

The `gh` token lacks the `workflow` scope, so GitHub rejects pushes that add `.github/workflows/` files (Task A9 committed `validate.yml` locally; nothing is pushed until this task). Ask the user to run this in the Claude Code prompt (it opens a browser for approval):

```
! gh auth refresh -h github.com -s workflow
```

Verify: `gh auth status 2>&1 | grep -i scopes` lists `workflow`.

- [ ] **Step 3: Commit and push the branch to run CI**

```bash
cd "$(git rev-parse --show-toplevel)"
git add .github/workflows/frontend.yml
git commit -F - <<'EOF'
ci: type-check, test and build the frontend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin fix/review-pass
```

- [ ] **Step 4: Watch the runs**

```bash
gh run list --branch fix/review-pass --limit 4
gh run watch $(gh run list --branch fix/review-pass --workflow Validate --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
gh run watch $(gh run list --branch fix/review-pass --workflow Frontend --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

Expected: `Validate` is all green (`hassfest`, `hacs`, `backend-tests`). `Frontend` passes type check, tests, and build, and fails **only** at "Committed bundle matches the build", because `dist` isn't rebuilt until Task R2. If anything else fails, fix it in this task: add the fix, commit with a `ci:`/`fix:` message, push, and re-watch.

### Task R2: Release build (1.1.0)

**Files:**
- Modify: `custom_components/planavista/manifest.json` (`"version": "1.1.0"`)
- Modify: `custom_components/planavista/const.py` (`VERSION` constant, if present, to `"1.1.0"`)
- Modify: `custom_components/planavista/frontend/package.json` and `package-lock.json` (`"version": "1.1.0"`)
- Modify: `custom_components/planavista/frontend/dist/planavista-cards.js` (rebuilt)

**Interfaces:**
- Consumes: everything in Parts A and B; the cache-busting script URL from Task A8 (it embeds the manifest version and bundle hash, so browsers fetch the new bundle).
- Produces: a committed bundle that matches `npm run build`, at version 1.1.0.

- [ ] **Step 1: Bump the version**

```bash
cd "$(git rev-parse --show-toplevel)"
python - <<'EOF'
import json, pathlib, re
m = pathlib.Path("custom_components/planavista/manifest.json")
d = json.loads(m.read_text(encoding="utf-8")); d["version"] = "1.1.0"
m.write_text(json.dumps(d, indent=2) + "\n", encoding="utf-8")
c = pathlib.Path("custom_components/planavista/const.py")
t = c.read_text(encoding="utf-8")
t2 = re.sub(r'^(VERSION(?::\s*Final)?\s*=\s*)"[^"]*"', r'\g<1>"1.1.0"', t, flags=re.M)
if t2 != t: c.write_text(t2, encoding="utf-8"); print("const.py VERSION -> 1.1.0")
EOF
cd custom_components/planavista/frontend && npm version 1.1.0 --no-git-tag-version
```

- [ ] **Step 2: Run every test suite and the type check**

```bash
cd "$(git rev-parse --show-toplevel)"/custom_components/planavista/frontend
npx tsc --noEmit -p . && npm test && npm run build
cd "$(git rev-parse --show-toplevel)" && scripts/test-backend.sh
```

Expected: tsc clean, all vitest tests pass, the build prints `created dist/planavista-cards.js`, and all pytest tests pass.

- [ ] **Step 3: Confirm the build is reproducible**

```bash
cd "$(git rev-parse --show-toplevel)"/custom_components/planavista/frontend
cp dist/planavista-cards.js "$TMPDIR/b1.js" && npm run build >/dev/null && cmp "$TMPDIR/b1.js" dist/planavista-cards.js && echo reproducible
grep -c -i "nominatim" dist/planavista-cards.js || true
```

Expected: `reproducible`, and a Nominatim count of `0`.

- [ ] **Step 4: Commit**

```bash
cd "$(git rev-parse --show-toplevel)"
git add custom_components/planavista/manifest.json custom_components/planavista/const.py custom_components/planavista/frontend/package.json custom_components/planavista/frontend/package-lock.json custom_components/planavista/frontend/dist/planavista-cards.js
git commit -F - <<'EOF'
build: release 1.1.0 bundle

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0184LyhaSTcLkrdEYxZfLaTX
EOF
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push
```

Then re-watch both workflows as in Task R1, Step 4. Expected: **all jobs green**, including "Committed bundle matches the build".

### Task R3: End-to-end verification on the dev HA

**Files:** none (verification only; findings that need code go back to the owning task as a new commit)

**Interfaces:**
- Consumes: the 1.1.0 build; `scripts/dev-ha.sh`, `scripts/ha.py`; Chrome DevTools MCP (isolated context) at `http://127.0.0.1:8124/wall-calendar/planavista`.

- [ ] **Step 1: Deploy and confirm a clean start**

```bash
cd "$(git rev-parse --show-toplevel)" && export MSYS_NO_PATHCONV=1
scripts/dev-ha.sh deploy && scripts/dev-ha.sh logs 40
```

Expected: no `ERROR` or traceback lines mentioning `planavista`.

- [ ] **Step 2: Restart race is fixed**

```bash
docker restart planavista-dev-ha >/dev/null && scripts/dev-ha.sh wait && sleep 5
python scripts/ha.py api GET /api/states/sensor.planavista_config | python -c "import json,sys; t=sys.stdin.read(); a=json.loads(t[t.index('{'):])['attributes']; print('calendars', len(a['calendars']), 'events', len(a['events']))"
```

Expected: `calendars 3 events 6` (or more), within 5 s of HA answering. Previously this showed 0 for up to 60 s.

- [ ] **Step 3: Options flow opens and saves**

```bash
ENTRY=$(python scripts/ha.py api GET /api/config/config_entries/entry | python -c "import json,sys; t=sys.stdin.read(); print([e['entry_id'] for e in json.loads(t[t.index('['):]) if e['domain']=='planavista'][0])")
python scripts/ha.py api POST /api/config/config_entries/options/flow "{\"handler\": \"$ENTRY\"}"
```

Expected: HTTP 200 with `"type": "menu"` or `"type": "form"`. Previously this raised an error. Then read the sensor again: it still shows 3 calendars.

- [ ] **Step 4: All-day events land on the right day**

In the Chrome DevTools MCP (isolated context), open `http://127.0.0.1:8124/wall-calendar/planavista`, hard-reload, set week view, and take a screenshot. Expected: "All-day test" appears **only on Fri 9**; "Weekend trip" starts on **Sat 10**; "Overnight shift" spans Fri→Sat; "Dentist" is on Fri at 3 PM. Previously "All-day test" also appeared on Thu 8 and "Weekend trip" started on Fri 9.

- [ ] **Step 5: Edit an all-day event without losing it**

In the browser, open "All-day test" → Edit → change the title to "All-day test (edited)" → Save. Then:

```bash
python scripts/ha.py api GET /api/states/sensor.planavista_config | python -c "import json,sys; t=sys.stdin.read(); ev=json.loads(t[t.index('{'):])['attributes']['events']; print([ (e['summary'], e['start'], e['end']) for e in ev if 'All-day' in e['summary']])"
```

Expected: `[('All-day test (edited)', '2026-10-09', '2026-10-10')]`.

- [ ] **Step 6: Location autocomplete is off by default and sends nothing**

In the browser, open "+ New" and type `1600 Pennsylvania` in Location, then wait 1 s. Check network requests with the DevTools MCP (`list_network_requests`). Expected: **no request** to `photon.komoot.io` or `nominatim`. Turn the setting on in the settings panel and repeat: exactly one request to `photon.komoot.io/api/?q=1600%20Pennsylvania...` after the typing pause, carrying no `lat`/`lon` parameters, and suggestions appear.

- [ ] **Step 7: Integration icon**

```bash
python - <<'EOF'
import json, pathlib, urllib.request
c = json.loads((pathlib.Path.home()/".planavista-dev/credentials.json").read_text())
for n in ("icon.png", "icon@2x.png"):
    r = urllib.request.urlopen(urllib.request.Request(f"{c['url']}/api/brands/integration/planavista/{n}", headers={"Authorization": f"Bearer {c['token']}"}), timeout=20)
    print(n, r.read() == pathlib.Path(f"custom_components/planavista/brand/{n}").read_bytes())
EOF
```

Expected: `icon.png True` and `icon@2x.png True`.

- [ ] **Step 8: Record results**

Update `CLAUDE.md` → Known Issues: strike through each fixed item with "(fixed in 1.1.0)", and keep the deferred items (accessibility, shared-event semantics, file splits) listed. No commit, since CLAUDE.md is local-only.

### Task R4: Ship to `main` and verify production

**Files:** none

**Interfaces:**
- Consumes: green CI on `fix/review-pass` (Task R2), a passing dev verification (Task R3).

- [ ] **Step 1: Merge locally and push**

```bash
cd "$(git rev-parse --show-toplevel)"
git checkout main && git pull --ff-only
git merge --ff-only fix/review-pass
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin main
git push origin --delete fix/review-pass
git branch -d fix/review-pass
gh run watch $(gh run list --branch main --workflow Frontend --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

Expected: fast-forward merge, both workflows green on `main`, and the remote branch deleted. (If `--ff-only` fails because `main` moved, rebase `fix/review-pass` onto `main`, re-run Task R2 Step 2, then retry.)

- [ ] **Step 2: User updates production through HACS (user action)**

Ask the user to do the following on the family HA:
1. HACS → PlanaVista → ⋮ → **Update information**, then **Download**/**Update**.
2. Restart Home Assistant.
3. Hard-refresh the wall tablet and any open dashboards (Companion app: Settings → Companion app → Troubleshooting → Reset frontend cache).

- [ ] **Step 3: Verify production read-only**

```bash
cd "$(git rev-parse --show-toplevel)"
python scripts/ha.py --prod api GET /api/states/update.planavista_update | python -c "import json,sys; t=sys.stdin.read(); a=json.loads(t[t.index('{'):])['attributes']; print('installed', a.get('installed_version'), 'latest', a.get('latest_version'))"
git rev-parse --short=7 HEAD
python scripts/ha.py --prod api GET /api/states/sensor.planavista_config | python -c "import json,sys; t=sys.stdin.read(); a=json.loads(t[t.index('{'):])['attributes']; print('calendars', len(a['calendars']), 'events', len(a['events']), 'autocomplete', a['display'].get('location_autocomplete'))"
python scripts/ha.py --prod ws '{"type": "system_log/list"}' | python -c "import json,sys; r=json.load(sys.stdin)['result']; bad=[e for e in r if 'planavista' in (e.get('name','')+' '.join(e.get('message',[]))).lower()]; print('planavista log entries:', len(bad)); [print(' ', e['level'], e['message'][0][:160]) for e in bad]"
python - <<'EOF'
import pathlib, urllib.request, winreg
def env(n):
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as k: return winreg.QueryValueEx(k, n)[0]
url, tok = env("HA_URL").rstrip("/"), env("HA_TOKEN")
served = urllib.request.urlopen(urllib.request.Request(f"{url}/api/brands/integration/planavista/icon.png", headers={"Authorization": f"Bearer {tok}"}), timeout=20).read()
print("production icon is the new icon:", served == pathlib.Path("custom_components/planavista/brand/icon.png").read_bytes())
EOF
```

Expected: `installed` equals `latest`, and both equal the short `HEAD` SHA; calendars match the family's configuration, and the event count is above 0; `autocomplete None` or `False` (off by default); `planavista log entries: 0`; `production icon is the new icon: True`. Ask the user to confirm on the wall tablet that all-day events sit on the correct day.

- [ ] **Step 4: Close out**

Update memory `project_launch_followups.md` (fix pass shipped, version, date), mark the CLAUDE.md priority "Fix pass" done, and tell the user the next step is the local folder rename followed by the chores design in a fresh session.
