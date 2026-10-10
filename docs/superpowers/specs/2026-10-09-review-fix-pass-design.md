# Review Fix Pass: Design

**Date:** 2026-10-09
**Status:** Approved
**Scope:** Correctness, robustness, privacy, and test/CI foundations ahead of the chores module. No new end-user features except the location-lookup setting.

## Why

A full backend and frontend review (2026-10-09) found defects that lose user data (editing an all-day event can delete it), break core flows on current Home Assistant (the options flow crashes), and degrade the wall display (blank after restart, whole-card re-render every second). Two were reproduced on the dev instance: all-day events rendering a day early, and an empty card for up to 60 s after a restart. The project has no tests or CI.

## Goals

1. Fix every Critical and High review finding listed below.
2. Make location lookup opt-in, explained in the setup wizard.
3. Add backend tests, frontend unit tests, and CI so these bugs stay fixed.
4. Keep every public interface stable: service names, WebSocket command types, card type, entity IDs, and the `sensor.planavista_config` attribute shape.

## Non-goals (deferred, tracked in CLAUDE.md)

Dialog accessibility (ARIA, focus traps, keyboard navigation); unifying the two meanings of "shared event"; splitting the large frontend files; the household-member model (chores); the provider abstraction.

## A. Backend (Python)

| # | Problem | Required behavior |
|---|---|---|
| A1 | The options flow assigns the read-only `self.config_entry` and crashes on open. The custom reload listener calls unload/setup directly, which leaves the sensors gone; the `_suppress_reload` flag can get stuck. | The options flow opens and saves. Exactly one supported path applies configuration changes (no hand-rolled unload/setup, no suppress flag, no update listener combined with reload helpers). Sensors survive every settings change. |
| A2 | Services, WebSocket commands, and frontend registration happen per config entry and are never removed. A second entry is allowed but unsupported. | Registered once in `async_setup` (`CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)`). Manifest has `"single_config_entry": true`. Per-entry state lives in `entry.runtime_data`. |
| A3 | The coordinator skips calendar entities that don't exist yet, so the card is empty until the next 60 s poll after a restart. | When a configured calendar entity appears (or HA finishes starting), the coordinator refreshes immediately. A permanently missing entity doesn't cause a refresh loop. |
| A4 | `save_config` and the event services/commands accept anything from any user. Malformed `calendars` data is persisted and breaks every poll. Event commands accept any calendar entity. | Voluptuous schemas validate `save_config` (calendars list of dicts with a required `entity_id` that matches `calendar.*`; `display` dict; `onboarding_complete` bool). `save_config` requires an admin. Event services and commands accept only calendars configured in PlanaVista, stay available to non-admin users (kiosk tablets), and raise `ServiceValidationError` / `HomeAssistantError` instead of bare `Exception`. |
| A5 | The upcoming-events sensor writes the full 7-day event list plus a naive timestamp to the recorder every minute. | Large attributes are excluded from the recorder; timestamps are timezone-aware. |
| A6 | Google Calendar API calls have no timeout and swallow OAuth errors. | Every Google request has a timeout; failures raise or log clearly and fall back as today. |
| A7 | The static path publishes the whole `frontend/` folder (sources, and `node_modules` where present). The script URL has no cache-busting. | Only `frontend/dist` is served. The script URL carries `?v=<integration version>-<bundle hash>`. |
| A8 | `services.yaml` documents services that don't exist. `hacs.json` claims HA 2024.1.0 and contains invalid keys. The manifest lists an unused `lovelace` dependency and lacks `after_dependencies`. | `services.yaml` documents exactly the registered services. `hacs.json` has `name`, `render_readme`, `homeassistant: "2026.3.0"` (local brand icons need 2026.3). The manifest drops `lovelace` and adds `after_dependencies: ["calendar", "google"]`. hassfest passes. |

## B. Frontend (TypeScript)

| # | Problem | Required behavior |
|---|---|---|
| B1 | Date-only event strings (`"2026-10-09"`) go through `new Date()` as UTC midnight, so all-day events show a day early west of UTC (about 28 call sites). | A single `parseEventDate()` helper parses date-only strings as **local** midnight and datetimes normally. Every event-date parse goes through it. |
| B2 | The create/edit dialog sends end_date == start_date for all-day events (rejected), prefills a day early, collapses multi-day events to one day, and turns timed events that start at midnight into all-day events. Edit = delete + recreate, so a failed recreate loses the event. | All-day end dates are exclusive (start + duration, minimum 1 day). Editing preserves the original start/end dates and the all-day/timed kind unless the user changes them. If recreate fails after delete, the original event is restored (recreated) and the user sees an error. |
| B3 | Overnight timed events draw as 15-minute slivers in Day view. The date doesn't roll over after the tablet sleeps. Month-view event taps also open the day. Swipe changes date on diagonal scrolls. Weather forecast subscriptions can leak. | Overnight events draw the portion that falls in the viewed day. Rollover compares calendar dates and re-checks on `visibilitychange`. Event taps stop propagation. Swipe requires a mostly horizontal gesture with a single touch. Forecast subscription is a shared helper that never loses its unsubscribe handle. |
| B4 | The whole card re-renders every second (the clock) and on every HA state change. | The clock is its own component that owns its timer. The card re-renders only when PlanaVista's sensor/config or its own state changes. Derived event arrays are memoized; `hiddenCalendars` is replaced, not mutated. |
| B5 | A stale page holding another bundle makes the new bundle crash on its first `customElements.define`. | Every element registers through a guard that skips names already defined. |
| B6 | Location autocomplete sends each keystroke plus the home coordinates to OpenStreetMap's Nominatim, against the "100% local" principle and Nominatim's usage policy (which forbids client-side autocomplete). | New display setting `location_autocomplete` (boolean, **default off**). The setup wizard and the settings panel explain the trade-off: off keeps everything local (location is plain text); on sends the typed address text, and nothing else (no home coordinates), to the Photon geocoder (`photon.komoot.io`, OpenStreetMap data, built for search-as-you-type), at most once per 350 ms pause and only for 3+ characters. Only the newest response is applied. Nominatim is no longer called. |

## C. Tests, CI, verification

- **Frontend unit tests:** vitest with `TZ=America/Chicago` forced, covering `parseEventDate`, all-day ranges, event positioning, rollover, and the dialog's date math. The B1/B2 bugs are reproduced as failing tests first.
- **Backend tests:** `pytest-homeassistant-custom-component` pinned to HA 2026.9.x, run in a `python:3.14` Docker container (HA 2026.9.4 requires Python >= 3.14.2) through `scripts/test-backend.sh` (WSL's Python is too old). They cover config flow + single-entry abort, options flow open/save, settings change keeps sensors, `save_config` validation and admin requirement, event-service entity restriction, the startup race, and the coordinator with a mocked calendar.
- **CI (GitHub Actions):** hassfest, HACS validation (brands check ignored; local `brand/` icons apply on 2026.3+), backend tests, and frontend tests + build, with a check that the committed `dist` matches the build.
- **Live verification:** on the dev HA, the two reproduced bugs are gone and the integration icon is served from `brand/`. On production, after a HACS update, `/api/brands/integration/planavista/icon.png` matches the repo icon.

## Delivery

Work on branch `fix/review-pass`, merge locally into `main`, push. No GitHub PR (PR refs pin commits permanently). Commit messages describe only the change. `CLAUDE.md` Known Issues is updated as items are fixed.
