# Milestone 3, The New Look: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The card takes on the shell design language: it lays itself out for its own size with a glance header and a bar (at the top in landscape, along the bottom in portrait and on phones), every theme gets a light and a dark version with an Automatic mode that changes at sunset and sunrise (or on a schedule, or with Home Assistant), the change plays as a sweep or a reveal from the finger, headings use a rounded face, and sheets move with springs; the calendar works in all of it, and `select.planavista_appearance` lets automations pick Light, Dark, or Automatic. Release 1.2.0 follows the owner's go-ahead.

**Architecture:** The appearance settings are new display keys in the config entry (minor version 2), with 1.1.0's `theme` and `theme_overrides` kept and rewritten by the backend from the new keys on every save, so a rollback still shows the look in use. Pure TypeScript modules decide everything that can be decided without a browser (colors in OKLCH and the measured `contrastText()`, the token tables of the three theme pairs, Light or Dark at any moment, which change to play, springs, the hold gesture, the calendar's portrait rules), each tested in Node; thin shell pieces apply them: an appearance controller on the card, a page-level view-transition runner, one forecast subscription per card, a glance header and a bar, and sheets that rise and follow the finger. The calendar module keeps its views and gets `layout`, `mode`, and `shape` from the shell, which now owns which view is showing.

**Tech Stack:** Python 3.14, Home Assistant 2026.9.4 (config entry migration, `select` platform), pytest with pytest-homeassistant-custom-component 0.13.367 (Docker, `scripts/test-backend.sh`); TypeScript 5.7 (strict), Lit 3, Rollup 4, vitest 5 (Node environment); the View Transitions API and the Web Animations API with CSS `linear()` easing; Nunito as a variable Latin-subset woff2 from `@fontsource-variable/nunito` 5.3.0 (SIL Open Font License 1.1).

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 3, with sections 3, 6.2 to 6.6, 7.8, 10.1, 10.2, 10.8, 11 (all), 12 (all), 14.1, 14.5, 14.7 (Look), 15.4, and 16.

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data (spec 7.8): the config entry becomes version 1, minor version 2. The migration only adds keys, keeps every key it doesn't know, and is safe to run twice. `async_migrate_entry` returns success for an entry with a newer minor version of major version 1. `display.theme` and `display.theme_overrides` always hold values 1.1.0 can read.
- The new display keys and their values, exactly: `appearance` (`light`, `dark`, `automatic`), `appearance_switch` (`sun`, `schedule`, `home_assistant`), `light_from` and `dark_from` (24-hour `HH:MM`, defaults `07:00` and `21:00`), `theme_pair` (`planavista`, `minimal`, `vibrant`), `colors_light` and `colors_dark` (`accent`, `background`, `header`, `now_color`; `header` is `plain`, a 1.1.0 header preset key, or `#RRGGBB`), `shape` (`corner_style`, `shadow_depth`, `event_style`, `avatar_border`), and `motion` (`device`, `full`, `reduced`). The card never sends `null` for one of them; empty colors are `{}`.
- Public surface (spec 10.8): `select.planavista_appearance` with options `light`, `dark`, `automatic`; nothing else in the public surface changes. The `save_config` action still replaces the display wholesale.
- Local only (spec 3.7): no web fonts and no CDNs. The heading face ships in `frontend/dist/fonts/` beside its license.
- Motion (spec 11.5): only transform, opacity, stroke offsets, and the day and night change's mask and clip-path animate. Reduced motion keeps the meaning and follows PlanaVista's Motion setting (Follow the device, Full, Reduced) over the device's.
- Layout (spec 12.1): from the card's own box (`layout` attribute: phone, portrait, landscape). Reference sizes 800 × 1280, 1280 × 800, and 390 × 844.
- Copy (spec 11.7): sentence case; one name per thing; every sub-screen has a back control naming its parent ("‹ Appearance"); destructive actions are confirmed by name; errors say what happened and what to do next.
- Accessibility (spec 11.8): touch targets at least 48 px; sheets are dialogs with a focus trap, Escape to close, and focus returned to where it came from; every control that changes the look works from the keyboard.
- Lit conventions: `experimentalDecorators`, `useDefineForClassFields: false`, `@property` and `@state`, `pv-` prefix; register every element through `defineElement` in `src/utils/define.ts`.
- vitest runs in Node with no DOM. Logic that needs tests lives in modules that import no Lit elements. Elements are checked on the dev Home Assistant.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, fixtures, docs, and screenshots.
- Don't commit `custom_components/planavista/frontend/dist/planavista-cards.js` until Task 14 (`dist/fonts/` is committed in Task 7). Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or release in this plan. Pushing the milestone branch for CI is allowed.
- Backend tests: `bash scripts/test-backend.sh` (from the repository root). Frontend checks: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`.
- Paths are relative to the repository root unless a step says otherwise; frontend paths (`src/...`, `test/...`) are relative to `custom_components/planavista/frontend/`.

## Review Focus

1. **A 1.1.0 household on Deep Dark with its own colors upgrades.** It opens as PlanaVista in Dark with those colors on the dark version, `select.planavista_appearance` says Dark, and stepping back to 1.1.0 shows Deep Dark with the same colors. Pinned by Task 1's fixture, migration, and write-back tests, Task 2's select tests, and Task 15's upgrade check.
2. **A wall tablet asleep at sunset, or a page loaded after sunset.** It wakes up or loads already dark with no two-second replay, and a timer that a sleeping tab held back doesn't play a late sweep after waking. Pinned by Task 5's `transitionKind` tests (first draw, hidden page), Task 10's wake rule, and Task 15's checks.
3. **Someone touching the screen at sunset, or with a sheet open.** The automatic change waits until nobody has touched the card for 10 seconds and no sheet, Settings, or event dialog is open, then plays; it never freezes a tap mid-gesture. Pinned by Task 5's `mayAutoSwitch` tests and Task 10's quiet-moment check on the dev Home Assistant.
4. **A portrait tablet turned or typed on.** The on-screen keyboard never flips the layout or moves the bar, and turning the tablet keeps the view and the time at the top of the Day view. Pinned by milestone 2's keyboard-rule tests, Task 11's `rescaleScroll` test, and Task 15's rotation check.
5. **Colors chosen by hand that stop reading in the other mode** (a dark accent on the dark background, a now line on a custom dark background, a mid-gray header). Matched colors always reach 3:1 for lines and controls and 4.5:1 for text, and a chosen color that doesn't is flagged with a fix that works. Pinned by Task 3's and Task 4's contrast tests and Task 13's `contrastIssues` tests.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others. Every pure module, every frontend test, the controllers, and the transition runner in Tasks 3 to 13 were run or type-checked in a scratch project before this plan was written (117 tests, `tsc` clean), as was `appearance.py` against the shared fixture.

- **Ruling: the appearance settings are separate display keys (spec 7.8 adds fields), not one object,** because Settings saves merge display keys, so the select entity, the Appearance page, and Customize each send only what they change and can't overwrite one another. Cost if wrong: key renames before release 1.3.0 pins more of the surface.
- **Ruling: every save that touches an appearance key writes all of them, then rewrites `theme` and `theme_overrides` from them** (`with_legacy_theme`): PlanaVista Dark reads back as Deep Dark with its dark colors, Minimal and Vibrant read back as themselves, and Automatic reads back as its light version. Writing every key first keeps colors that 1.1.0's keys only implied (found while prototyping: switching an unmigrated display to Dark otherwise dropped its light accent). Cost if wrong: an admin script that sends both old and new keys sees the new ones win.
- **Ruling: readers derive any missing new key from 1.1.0's keys with one rule,** in `appearance.py` and `core/appearance.ts`, both checked against `tests/fixtures/appearance_cases.json` (spec 16's shared-table pattern), so a display replaced by the `save_config` action, or an entry created at minor version 2, still shows the right look. Cost if wrong: two implementations of one table.
- **Ruling: new installs start in Light,** as 1.1.0 did; setup's Look step offers Automatic as its first choice. Cost if wrong: a household that wants Automatic taps it once.
- **Ruling: `select.planavista_appearance` follows the existing sensors' naming (no device, name "PlanaVista appearance"),** which gives it that entity ID; the Household device of spec 10.1 arrives with chores entities, and the entity keeps its ID if it moves there. The select stays available when a calendar refresh fails, since it doesn't depend on calendars. Cost if wrong: one device assignment in milestone 4.
- **Ruling: a change of mode that didn't start with a tap on this screen counts as automatic** (the select, another screen, a schedule time, sunset): it waits for a quiet moment and sweeps. Only a tap here reveals from the finger. Cost if wrong: a movie-night automation's Dark waits for 10 quiet seconds.
- **Ruling: only Light and Dark changes play a transition;** a theme or color change applies at once, as 1.1.0's previews did. Cost if wrong: theme changes look abrupt next to mode changes.
- **Ruling: `contrastText()` measures against the near-black it draws (`#1A1B1E`), so it crosses over at a relative luminance of about 0.2;** the spec's "about 0.179" is the crossover for pure black. White text goes on `#6366F1`, dark text on `#F94144` and `#43AA8B` (1.1.0 gave both white). Cost if wrong: one constant.
- **Ruling: the shell owns which view each module shows** (data down, events up): the bar draws the module's views from the registry (`views`, `initialView`), the card keeps the choice, and the calendar asks for a change with `pv-view-change` (a day tapped in Month opens Day). Cost if wrong: a module with views the bar can't show changes the contract.
- **Ruling: `hide_header` hides the glance header (clock, date, weather) but keeps the bar,** which now holds the views and the gear. Cost if wrong: a dashboard that hid the header gets the bar back.
- **Ruling: one daily-forecast subscription per card, in the shell,** feeds the portrait header's high and low and the Week and Agenda views; after a reconnect it subscribes again itself and tries for about a minute (1 s doubling, six tries) before using the entity's own forecast attribute. A subscribe that fails on a live connection falls back at once, as today. This is milestone 2's ruling 28 carried in. Cost if wrong: a forecast that comes back later than a minute after a restart waits for the next reload.
- **Ruling: in portrait the Day view fits about 14 hours by sizing its hours from its own height (48 to 80 px an hour);** landscape and phones keep 80 px. Month cells show as many events as fit (three before they are measured, as in 1.1.0). Week shows four days across in landscape, two in portrait, one on a phone. Cost if wrong: tuning numbers.
- **Ruling: the calendar views' viewport media queries stay where they still work at the reference sizes** (full-screen cards, where the viewport is the card); the new portrait and phone behaviors key on the card's `layout`, and milestone 7 finishes the move (spec 12.1: "over time"). Cost if wrong: a narrow card on a wide screen uses wide-screen type inside the views.
- **Ruling: on phones the Day view keeps everyone's columns,** because the calendar's sideways swipe is the date swipe; one person at a time with a swipe is the board's phone rule (milestone 5). The phone filter chips choose who shows. Cost if wrong: a crowded phone Day view.
- **Ruling: the portrait header doesn't shrink as the calendar scrolls** (its views scroll inside themselves); shrinking with many people belongs to the board (milestone 5). Cost if wrong: none.
- **Ruling: the hold gesture is built and unit-tested now** (spec 17.3 row 3 lists it) and first used by the board in milestone 5. Cost if wrong: an unused module for two milestones.
- **Ruling: the Avatar border choices are Their color, White, and Custom** (spec 12.4). 1.1.0's "Light" (the pale version of each color) reads as White, and White writes back as Light for 1.1.0. Cost if wrong: a household that liked the pale border picks Custom.
- **Ruling: a card's own `theme` option keeps its 1.1.0 meaning:** `light` and `dark` fix that card to PlanaVista Light or Dark; `planavista`, `minimal`, `vibrant` (or `modern`) pick the theme and follow the household's Light, Dark, or Automatic. Cost if wrong: none for existing dashboards.
- **Ruling: customizations belong to the look in use and carry over when the theme changes,** as 1.1.0's did; Customize is titled with the current theme ("Customize PlanaVista"). Cost if wrong: per-theme colors later need a key per theme.
- **Ruling: the heading face is served as a file next to the bundle with its license,** copied once from the pinned npm package by `npm run fonts`, and the stack puts `ui-rounded` and SF Pro Rounded first, so Apple devices never download it. Cost if wrong: 39 KB on other devices.
- **Ruling: only the shell's sheets (the PIN sheet and notices, including those inside Settings) get the new motion now;** the event dialogs become sheets in milestone 7 (spec 17.3 row 7). Cost if wrong: two sheet styles until 1.4.0.
- **Ruling: the contrast guard judges the accent and the now line against cards (3:1), a solid header's text (4.5:1), and text on a custom background's cards (4.5:1), and only for colors the household chose;** 1.1.0's gradient presets keep their white text. Cost if wrong: an unflagged combination.
- **Ruling: the Appearance page and Customize share one set of changes per card (`AppearanceEdits`, kept in the card's drafts like milestone 2's person drafts),** which the card draws at once and drops again if their save fails. This also settles two milestone 2 deferred minors for Appearance: a tapped value that failed to save no longer stays on screen, and a preview no longer outlives a failed save. Cost if wrong: none.
- **Ruling: Lit elements are specified by a contract (properties, events, copy, layout) instead of full source,** while every piece of logic they use, the controllers, the transition runner, and every test are given in full. Elements are checked on the dev Home Assistant in each task and in Task 15. Cost if wrong: an executor has more freedom in render code than in logic.

---

### Task 0: Branch, baseline, and the dev Home Assistant (controller)

The coordinating agent does this. Nothing is committed except this plan.

**Files:** screenshots under `m3-baseline/` in the session scratchpad.

- [ ] **Step 1: Branch from main and check the dev Home Assistant**

```bash
git checkout main && git pull --ff-only
git checkout -b feat/chores-m3-new-look
bash scripts/dev-ha.sh status
python scripts/ha.py api GET /api/
```

Expected: on `feat/chores-m3-new-look` from `904f657`; the container is up; `"message": "API running."`. If the API drops connections while the container is up, run `docker restart planavista-dev-ha` and `bash scripts/dev-ha.sh wait`.

- [ ] **Step 2: Deploy main's card and record the baseline**

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../..
bash scripts/dev-ha.sh deploy
python scripts/ha.py api GET /api/states/sensor.planavista_config | tail -n +2 > "$SCRATCH/m3-baseline/config.json"
```

(`$SCRATCH` is the session scratchpad.) In a fresh isolated browser context signed in as Dev, screenshot Day, Week, Month, and Agenda at 1280 × 800, 800 × 1280, and 390 × 844 into `m3-baseline/`, then close every page. Discard the build output (`git checkout -- custom_components/planavista/frontend/dist/`).

- [ ] **Step 3: Commit the plan**

```bash
git add docs/superpowers/plans/2026-10-10-chores-m3-new-look.md
git commit -F - <<'EOF'
docs: plan milestone 3, the new look

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 1: Appearance settings in the config entry, and the first entry migration

**Files:**
- Create: `custom_components/planavista/appearance.py`
- Create: `tests/fixtures/appearance_cases.json` (shared with the card's tests in Task 5)
- Create: `tests/test_appearance.py`
- Modify: `custom_components/planavista/services.py` (display schema, `async_store_config`)
- Modify: `custom_components/planavista/config_flow.py` (`MINOR_VERSION`, the options flow's theme list)
- Modify: `custom_components/planavista/__init__.py` (`async_migrate_entry`)
- Modify: `tests/conftest.py` (entries at minor version 2 unless a module says otherwise)
- Modify: `tests/test_upgrade.py` (its entries come from 1.1.0), `tests/test_options_flow.py` (the theme list now moves the appearance too)

**Interfaces:**
- Consumes: `async_store_config(hass, changes, *, merge_display=False, entry=None)` and `DISPLAY_SCHEMA` from milestone 2.
- Produces (`appearance.py`, no Home Assistant imports):
  - key constants `APPEARANCE`, `APPEARANCE_SWITCH`, `LIGHT_FROM`, `DARK_FROM`, `THEME_PAIR`, `COLORS_LIGHT`, `COLORS_DARK`, `SHAPE`, `MOTION`, and `APPEARANCE_KEYS` (all nine, in that order);
  - value tuples `MODES`, `SWITCHES`, `PAIRS`, `MOTIONS`, `HEADER_PRESETS`, `SHAPE_KEYS`, and `CLOCK_PATTERN`;
  - `appearance_settings(display: Mapping) -> dict` (every key, derived from 1.1.0's keys where missing);
  - `theme_choice(theme: str) -> dict` (`{theme_pair, appearance}` for a 1.1.0 theme name);
  - `legacy_theme(settings) -> tuple[str, dict]`;
  - `with_legacy_theme(display) -> dict`;
  - `migrate_display(display) -> dict`.
- Produces (`services.py`): `THEME_COLORS_SCHEMA`, `THEME_SHAPE_SCHEMA`. `DISPLAY_SCHEMA` validates the nine keys, each also accepting `None`. `async_store_config` runs `with_legacy_theme` whenever the display changes include an appearance key.
- Produces: `PlanaVistaConfigFlow.MINOR_VERSION = 2`; `async_migrate_entry(hass, entry) -> bool` in `__init__.py`; a `config_entry_minor_version` fixture in `tests/conftest.py` (default 2).

- [ ] **Step 1: Write the shared fixture**

Create `tests/fixtures/appearance_cases.json`:

```json
{
  "description": "Appearance settings derived from a saved display (spec 12.4). appearance.py and the card's core/appearance.ts both read this file, so the two can't drift apart. 'legacy' is what the backend writes back for 1.1.0.",
  "cases": [
    {
      "name": "a 1.1.0 install on Clean Light",
      "display": {"theme": "planavista", "time_format": "12h"},
      "settings": {"appearance": "light", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "planavista", "colors_light": {}, "colors_dark": {}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "planavista", "theme_overrides": {}}
    },
    {
      "name": "Deep Dark with customizations moves them to the dark version",
      "display": {"theme": "dark", "theme_overrides": {"accent": "#277DA1", "background": "#0F1420", "header_style": "custom", "header_custom": "#171D2B", "corner_style": "pill"}},
      "settings": {"appearance": "dark", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "planavista", "colors_light": {}, "colors_dark": {"accent": "#277DA1", "background": "#0F1420", "header": "#171D2B"}, "shape": {"corner_style": "pill"}, "motion": "device"},
      "legacy": {"theme": "dark", "theme_overrides": {"accent": "#277DA1", "background": "#0F1420", "header_style": "custom", "header_custom": "#171D2B", "corner_style": "pill"}}
    },
    {
      "name": "Vibrant with a header preset and the pale avatar border",
      "display": {"theme": "modern", "theme_overrides": {"header_style": "gradient_teal", "avatar_border": "light", "event_style": "solid"}},
      "settings": {"appearance": "light", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "vibrant", "colors_light": {"header": "gradient_teal"}, "colors_dark": {}, "shape": {"avatar_border": "white", "event_style": "solid"}, "motion": "device"},
      "legacy": {"theme": "modern", "theme_overrides": {"header_style": "gradient_teal", "avatar_border": "light", "event_style": "solid"}}
    },
    {
      "name": "Minimal",
      "display": {"theme": "minimal"},
      "settings": {"appearance": "light", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "minimal", "colors_light": {}, "colors_dark": {}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "minimal", "theme_overrides": {}}
    },
    {
      "name": "the new keys win over 1.1.0's",
      "display": {"theme": "planavista", "theme_overrides": {"accent": "#F94144"}, "appearance": "automatic", "appearance_switch": "schedule", "light_from": "06:30", "dark_from": "20:15", "theme_pair": "minimal", "colors_light": {"accent": "#43AA8B"}, "colors_dark": {}, "shape": {"shadow_depth": "none"}, "motion": "reduced"},
      "settings": {"appearance": "automatic", "appearance_switch": "schedule", "light_from": "06:30", "dark_from": "20:15", "theme_pair": "minimal", "colors_light": {"accent": "#43AA8B"}, "colors_dark": {}, "shape": {"shadow_depth": "none"}, "motion": "reduced"},
      "legacy": {"theme": "minimal", "theme_overrides": {"accent": "#43AA8B", "shadow_depth": "none"}}
    },
    {
      "name": "PlanaVista dark reads back as Deep Dark with its dark colors",
      "display": {"theme": "planavista", "appearance": "dark", "theme_pair": "planavista", "colors_light": {"accent": "#F94144"}, "colors_dark": {"now_color": "#F87171"}},
      "settings": {"appearance": "dark", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "planavista", "colors_light": {"accent": "#F94144"}, "colors_dark": {"now_color": "#F87171"}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "dark", "theme_overrides": {"now_color": "#F87171"}}
    },
    {
      "name": "values PlanaVista doesn't know fall back",
      "display": {"theme": "sepia", "appearance": "dim", "appearance_switch": "moon", "light_from": "7am", "dark_from": "25:00", "theme_pair": "neon", "motion": "wild"},
      "settings": {"appearance": "light", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "planavista", "colors_light": {}, "colors_dark": {}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "planavista", "theme_overrides": {}}
    },
    {
      "name": "Vibrant dark reads back as Vibrant",
      "display": {"appearance": "dark", "theme_pair": "vibrant"},
      "settings": {"appearance": "dark", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "vibrant", "colors_light": {}, "colors_dark": {}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "modern", "theme_overrides": {}}
    },
    {
      "name": "a plain header has no 1.1.0 equivalent",
      "display": {"theme": "dark", "appearance": "dark", "theme_pair": "planavista", "colors_dark": {"header": "plain"}},
      "settings": {"appearance": "dark", "appearance_switch": "sun", "light_from": "07:00", "dark_from": "21:00", "theme_pair": "planavista", "colors_light": {}, "colors_dark": {"header": "plain"}, "shape": {}, "motion": "device"},
      "legacy": {"theme": "dark", "theme_overrides": {}}
    }
  ]
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/test_appearance.py`:

```python
"""Appearance settings in the config entry (spec 12.4) and the first entry migration (spec 7.8)."""
from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

import pytest
import voluptuous as vol
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from custom_components.planavista.appearance import (
    APPEARANCE_KEYS,
    appearance_settings,
    legacy_theme,
    migrate_display,
    with_legacy_theme,
)
from custom_components.planavista.const import DOMAIN
from custom_components.planavista.services import DISPLAY_SCHEMA

from .conftest import DEFAULT_ENTRY_DATA, FakeCalendar, ws_command

CASES: list[dict[str, Any]] = json.loads(
    (Path(__file__).parent / "fixtures" / "appearance_cases.json").read_text(encoding="utf-8")
)["cases"]
NAMES = [case["name"] for case in CASES]


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_settings_come_from_the_new_keys_or_from_1_1_0s(case: dict[str, Any]) -> None:
    """The same table the card reads (core/appearance.ts)."""
    assert appearance_settings(case["display"]) == case["settings"]


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_1_1_0_reads_back_the_look_in_use(case: dict[str, Any]) -> None:
    assert legacy_theme(case["settings"]) == (case["legacy"]["theme"], case["legacy"]["theme_overrides"])


@pytest.mark.parametrize("case", CASES, ids=NAMES)
def test_the_migration_adds_keys_beside_1_1_0s_and_can_run_twice(case: dict[str, Any]) -> None:
    once = migrate_display(case["display"])
    assert migrate_display(once) == once
    assert {key: once[key] for key in case["display"]} == case["display"]
    assert set(APPEARANCE_KEYS) <= set(once)


def test_a_save_keeps_colors_that_1_1_0s_keys_only_implied() -> None:
    """Switching an unmigrated display to Dark keeps its light accent."""
    display = with_legacy_theme(
        {"theme": "planavista", "theme_overrides": {"accent": "#F94144"}, "appearance": "dark"}
    )
    assert display["colors_light"] == {"accent": "#F94144"}
    assert display["theme"] == "dark"
    assert "theme_overrides" not in display
    assert with_legacy_theme(display) == display


def test_the_schema_accepts_appearance_settings() -> None:
    display = {
        "appearance": "automatic",
        "appearance_switch": "schedule",
        "light_from": "06:30",
        "dark_from": "20:15",
        "theme_pair": "vibrant",
        "colors_light": {"accent": "#277DA1", "header": "plain"},
        "colors_dark": {"header": "gradient_teal", "now_color": "#F87171"},
        "shape": {"corner_style": "pill", "avatar_border": "white"},
        "motion": "reduced",
    }
    assert DISPLAY_SCHEMA(display) == display
    assert DISPLAY_SCHEMA({"appearance": None}) == {"appearance": None}


@pytest.mark.parametrize(
    "bad",
    [
        {"appearance": "dim"},
        {"appearance_switch": "moon"},
        {"light_from": "7am"},
        {"dark_from": "24:00"},
        {"theme_pair": "neon"},
        {"colors_light": {"accent": "red"}},
        {"colors_dark": {"header": "neon"}},
        {"shape": {"corner_style": "round"}},
        {"motion": "wild"},
    ],
)
def test_the_schema_refuses_values_it_does_not_know(bad: dict[str, Any]) -> None:
    with pytest.raises(vol.Invalid):
        DISPLAY_SCHEMA(bad)


async def test_switching_to_dark_on_a_screen_writes_deep_dark_for_1_1_0(
    hass: HomeAssistant,
    hass_ws_client: Any,
    household: Any,
    mock_config_entry: MockConfigEntry,
) -> None:
    """The card saves one key; the backend writes the rest and 1.1.0's keys."""
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"appearance": "dark"}})
    assert reply["success"]
    display = mock_config_entry.data["display"]
    assert display["appearance"] == "dark"
    assert display["theme_pair"] == "planavista"
    assert display["theme"] == "dark"
    assert display["time_format"] == DEFAULT_ENTRY_DATA["display"]["time_format"]
    assert set(APPEARANCE_KEYS) <= set(display)


@pytest.fixture
def legacy_entry(hass: HomeAssistant) -> MockConfigEntry:
    """An entry as 1.1.0 saved it: Deep Dark with an accent of its own."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["display"].update(theme="dark", theme_overrides={"accent": "#277DA1"}, future_setting="kept")
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=data, version=1, minor_version=1)
    entry.add_to_hass(hass)
    return entry


async def test_a_1_1_0_entry_gets_its_appearance_keys(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar], legacy_entry: MockConfigEntry
) -> None:
    assert await hass.config_entries.async_setup(legacy_entry.entry_id)
    await hass.async_block_till_done()

    assert legacy_entry.minor_version == 2
    display = legacy_entry.data["display"]
    # 1.1.0 can still read it.
    assert display["theme"] == "dark"
    assert display["theme_overrides"] == {"accent": "#277DA1"}
    assert display["future_setting"] == "kept"
    # The accent moves to the version it was made for.
    assert display["appearance"] == "dark"
    assert display["theme_pair"] == "planavista"
    assert display["colors_dark"] == {"accent": "#277DA1"}
    assert display["colors_light"] == {}


async def test_an_entry_from_a_newer_release_loads_as_it_is(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]
) -> None:
    """Stepping back one release keeps a newer minor version's data (spec 7.8)."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["display"]["setting_from_later"] = True
    entry = MockConfigEntry(domain=DOMAIN, title="PlanaVista", data=data, version=1, minor_version=3)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.state is ConfigEntryState.LOADED
    assert entry.minor_version == 3
    assert entry.data == data


async def test_an_entry_from_a_newer_major_version_does_not_load(
    hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]
) -> None:
    entry = MockConfigEntry(
        domain=DOMAIN, title="PlanaVista", data=deepcopy(DEFAULT_ENTRY_DATA), version=2, minor_version=1
    )
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    assert entry.state is ConfigEntryState.MIGRATION_ERROR
```

Run: `bash scripts/test-backend.sh tests/test_appearance.py -q`
Expected: collection fails with `ModuleNotFoundError: No module named 'custom_components.planavista.appearance'`.

- [ ] **Step 3: Create `custom_components/planavista/appearance.py`**

```python
"""Appearance: Light, Dark, or Automatic, theme pairs, and their colors (spec 12.4).

The settings are display keys in the config entry. The keys 1.1.0 knew,
theme and theme_overrides, stay with values 1.1.0 can read, so a rollback
still renders the look in use (spec 7.8): readers derive the new keys from
them while a new key is missing, and every save that changes the new keys
writes them back. The card's core/appearance.ts derives the same way; both
are checked against tests/fixtures/appearance_cases.json. Nothing here
imports Home Assistant.
"""

from __future__ import annotations

from collections.abc import Mapping
import re
from typing import Any

APPEARANCE = "appearance"
APPEARANCE_SWITCH = "appearance_switch"
LIGHT_FROM = "light_from"
DARK_FROM = "dark_from"
THEME_PAIR = "theme_pair"
COLORS_LIGHT = "colors_light"
COLORS_DARK = "colors_dark"
SHAPE = "shape"
MOTION = "motion"

APPEARANCE_KEYS = (
    APPEARANCE,
    APPEARANCE_SWITCH,
    LIGHT_FROM,
    DARK_FROM,
    THEME_PAIR,
    COLORS_LIGHT,
    COLORS_DARK,
    SHAPE,
    MOTION,
)

MODES = ("light", "dark", "automatic")
SWITCHES = ("sun", "schedule", "home_assistant")
PAIRS = ("planavista", "minimal", "vibrant")
MOTIONS = ("device", "full", "reduced")
HEADER_PRESETS = (
    "gradient_purple",
    "gradient_teal",
    "gradient_sunset",
    "solid_accent",
    "solid_dark",
)
SHAPE_KEYS = ("corner_style", "shadow_depth", "event_style", "avatar_border")

CLOCK_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"
_CLOCK = re.compile(CLOCK_PATTERN)

# 1.1.0's theme keys and the theme and mode each one becomes.
_LEGACY_THEMES: dict[str, tuple[str, str]] = {
    "planavista": ("planavista", "light"),
    "light": ("planavista", "light"),
    "dark": ("planavista", "dark"),
    "minimal": ("minimal", "light"),
    "modern": ("vibrant", "light"),
    "vibrant": ("vibrant", "light"),
}


def _pick(value: Any, allowed: tuple[str, ...], fallback: str) -> str:
    return value if value in allowed else fallback


def _clock(value: Any, fallback: str) -> str:
    return value if isinstance(value, str) and _CLOCK.match(value) else fallback


def _record(value: Any) -> dict[str, Any] | None:
    return dict(value) if isinstance(value, Mapping) else None


def _legacy_colors(overrides: Mapping[str, Any]) -> dict[str, Any]:
    colors = {key: overrides[key] for key in ("accent", "background", "now_color") if overrides.get(key)}
    style = overrides.get("header_style")
    if style == "custom":
        if overrides.get("header_custom"):
            colors["header"] = overrides["header_custom"]
    elif style:
        colors["header"] = style
    return colors


def _legacy_shape(overrides: Mapping[str, Any]) -> dict[str, Any]:
    shape = {key: overrides[key] for key in SHAPE_KEYS if overrides.get(key)}
    if shape.get("avatar_border") == "light":
        shape["avatar_border"] = "white"
    return shape


def appearance_settings(display: Mapping[str, Any]) -> dict[str, Any]:
    """Every appearance setting: the new keys, or what 1.1.0's keys mean."""
    legacy = display.get("theme") or "planavista"
    pair, mode = _LEGACY_THEMES.get(legacy, _LEGACY_THEMES["planavista"])
    overrides = _record(display.get("theme_overrides")) or {}
    colors = _legacy_colors(overrides)
    light = _record(display.get(COLORS_LIGHT))
    dark = _record(display.get(COLORS_DARK))
    shape = _record(display.get(SHAPE))
    return {
        APPEARANCE: _pick(display.get(APPEARANCE), MODES, mode),
        APPEARANCE_SWITCH: _pick(display.get(APPEARANCE_SWITCH), SWITCHES, "sun"),
        LIGHT_FROM: _clock(display.get(LIGHT_FROM), "07:00"),
        DARK_FROM: _clock(display.get(DARK_FROM), "21:00"),
        THEME_PAIR: _pick(display.get(THEME_PAIR), PAIRS, pair),
        COLORS_LIGHT: light if light is not None else ({} if legacy == "dark" else colors),
        COLORS_DARK: dark if dark is not None else (colors if legacy == "dark" else {}),
        SHAPE: shape if shape is not None else _legacy_shape(overrides),
        MOTION: _pick(display.get(MOTION), MOTIONS, "device"),
    }


def theme_choice(theme: str) -> dict[str, str]:
    """The theme and mode a 1.1.0 theme name picks (the options flow's theme list)."""
    pair, mode = _LEGACY_THEMES.get(theme, _LEGACY_THEMES["planavista"])
    return {THEME_PAIR: pair, APPEARANCE: mode}


def legacy_theme(settings: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    """The theme and theme_overrides 1.1.0 needs to show this look."""
    pair = settings[THEME_PAIR]
    if pair == "planavista":
        theme = "dark" if settings[APPEARANCE] == "dark" else "planavista"
    elif pair == "minimal":
        theme = "minimal"
    else:
        theme = "modern"
    colors = settings[COLORS_DARK] if theme == "dark" else settings[COLORS_LIGHT]
    overrides: dict[str, Any] = {
        key: colors[key] for key in ("accent", "background", "now_color") if colors.get(key)
    }
    header = colors.get("header")
    if header in HEADER_PRESETS:
        overrides["header_style"] = header
    elif isinstance(header, str) and header.startswith("#"):
        overrides["header_style"] = "custom"
        overrides["header_custom"] = header
    for key in SHAPE_KEYS:
        if settings[SHAPE].get(key):
            overrides[key] = settings[SHAPE][key]
    if overrides.get("avatar_border") == "white":
        overrides["avatar_border"] = "light"
    return theme, overrides


def with_legacy_theme(display: Mapping[str, Any]) -> dict[str, Any]:
    """The display with every appearance key written, and theme and theme_overrides rewritten from them.

    Writing every key first keeps colors that were only implied by 1.1.0's
    keys: a display saved before the migration, then switched to Dark,
    keeps its light colors.
    """
    settings = appearance_settings(display)
    result = {**display, **settings}
    theme, overrides = legacy_theme(settings)
    result["theme"] = theme
    if overrides:
        result["theme_overrides"] = overrides
    else:
        result.pop("theme_overrides", None)
    return result


def migrate_display(display: Mapping[str, Any]) -> dict[str, Any]:
    """Config entry minor version 2: write the new keys beside 1.1.0's. Safe to run twice."""
    settings = appearance_settings(display)
    return {**display, **{key: settings[key] for key in APPEARANCE_KEYS if key not in display}}
```

- [ ] **Step 4: Validate the new keys and write 1.1.0's back on save**

In `custom_components/planavista/services.py`, import from `.appearance`:

```python
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
```

Above `DISPLAY_SCHEMA`, add:

```python
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
```

and add these entries to `DISPLAY_SCHEMA` after `CONF_LOCATION_AUTOCOMPLETE` (a card save removes a setting with `None`, so each accepts it):

```python
        vol.Optional(APPEARANCE): vol.Any(None, vol.In(MODES)),
        vol.Optional(APPEARANCE_SWITCH): vol.Any(None, vol.In(SWITCHES)),
        vol.Optional(LIGHT_FROM): vol.Any(None, vol.Match(CLOCK_PATTERN)),
        vol.Optional(DARK_FROM): vol.Any(None, vol.Match(CLOCK_PATTERN)),
        vol.Optional(THEME_PAIR): vol.Any(None, vol.In(PAIRS)),
        vol.Optional(COLORS_LIGHT): vol.Any(None, THEME_COLORS_SCHEMA),
        vol.Optional(COLORS_DARK): vol.Any(None, THEME_COLORS_SCHEMA),
        vol.Optional(SHAPE): vol.Any(None, THEME_SHAPE_SCHEMA),
        vol.Optional(MOTION): vol.Any(None, vol.In(MOTIONS)),
```

In `async_store_config`, replace the display block with:

```python
    if CONF_DISPLAY in changes:
        display = dict(changes[CONF_DISPLAY])
        if merge_display:
            merged = {**entry.data.get(CONF_DISPLAY, {}), **display}
            display = {key: value for key, value in merged.items() if value is not None}
        if any(key in changes[CONF_DISPLAY] for key in APPEARANCE_KEYS):
            # 1.1.0's theme keys follow the new ones, so a rollback shows this look (spec 7.8).
            display = with_legacy_theme(display)
        new_data[CONF_DISPLAY] = display
```

Add one sentence to its docstring: "A save that changes an appearance setting writes every appearance key and rewrites 1.1.0's theme and theme_overrides from them."

- [ ] **Step 5: The migration and the options flow**

In `custom_components/planavista/config_flow.py`, give `PlanaVistaConfigFlow` a minor version under `VERSION = 1`:

```python
    VERSION = 1
    # 2: appearance settings beside 1.1.0's theme keys (spec 12.4); see async_migrate_entry.
    MINOR_VERSION = 2
```

Import `from .appearance import appearance_settings, theme_choice, with_legacy_theme`. In `PlanaVistaOptionsFlow.async_step_display`, replace the `if user_input is not None:` block with:

```python
        if user_input is not None:
            # Keep display keys this form doesn't edit (theme_overrides,
            # location_autocomplete, the appearance settings, and any later ones).
            old_display = self.config_entry.data.get("display", {})
            display = {
                **old_display,
                CONF_TIME_FORMAT: user_input[CONF_TIME_FORMAT],
                CONF_WEATHER_ENTITY: user_input.get(CONF_WEATHER_ENTITY, ""),
                CONF_FIRST_DAY: user_input[CONF_FIRST_DAY],
                CONF_DEFAULT_VIEW: user_input[CONF_DEFAULT_VIEW],
                CONF_THEME: user_input[CONF_THEME],
            }
            if user_input[CONF_THEME] != old_display.get(CONF_THEME):
                # The 1.1.0 theme list picks a theme and Light or Dark; colors
                # stay with the version they were made for.
                display = with_legacy_theme(
                    {**display, **appearance_settings(old_display), **theme_choice(user_input[CONF_THEME])}
                )
            new_data = dict(self.config_entry.data)
            new_data["display"] = display

            await async_apply_config(self.hass, self.config_entry, new_data)
            return self.async_create_entry(title="", data={})
```

In `custom_components/planavista/__init__.py`, import `CONF_DISPLAY` from `.const` and `migrate_display` from `.appearance`, and add after `async_setup_entry`:

```python
async def async_migrate_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Bring an entry from an older release up to date (spec 7.8).

    Minor version 2 writes the appearance settings beside 1.1.0's theme
    keys. An entry from a newer release with the same major version (a step
    back in HACS) loads as it is.
    """
    if entry.version > 1:
        return False
    if entry.minor_version < 2:
        data = dict(entry.data)
        data[CONF_DISPLAY] = migrate_display(data.get(CONF_DISPLAY, {}))
        hass.config_entries.async_update_entry(entry, data=data, minor_version=2)
    return True
```

- [ ] **Step 6: Test entries at this release's version, and 1.1.0's in the upgrade tests**

In `tests/conftest.py`, add a fixture and use it in `mock_config_entry`:

```python
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
```

In `tests/test_upgrade.py`, add after the `config_entry_data` fixture:

```python
@pytest.fixture
def config_entry_minor_version() -> int:
    """These entries come from 1.1.0."""
    return 1
```

and at the end of `test_upgrade_keeps_the_calendars_and_adds_their_people`, after the existing `theme == "dark"` assertion:

```python
    # Deep Dark becomes PlanaVista in Dark (spec 12.4), and 1.1.0 still reads Deep Dark.
    assert mock_config_entry.minor_version == 2
    display = mock_config_entry.data["display"]
    assert (display["theme_pair"], display["appearance"]) == ("planavista", "dark")
```

In `tests/test_options_flow.py`, the theme list now moves the appearance too. In `test_display_options_apply_in_place`, replace the display assertion with:

```python
    display = hass.states.get("sensor.planavista_config").attributes["display"]
    # Deep Dark is PlanaVista in Dark; the accent stays with the light version it was made for.
    assert display == {
        **NEW_DISPLAY,
        "appearance": "dark",
        "appearance_switch": "sun",
        "light_from": "07:00",
        "dark_from": "21:00",
        "theme_pair": "planavista",
        "colors_light": {"accent": "#277DA1"},
        "colors_dark": {},
        "shape": {},
        "motion": "device",
    }
```

and add a test after it:

```python
async def test_display_options_keep_automatic_when_the_theme_stays(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Saving the form without changing the theme leaves Automatic alone."""
    hass.config_entries.async_update_entry(
        loaded_entry, data={**loaded_entry.data, "display": {**loaded_entry.data["display"], "appearance": "automatic"}}
    )
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"next_step_id": "display"})
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {**NEW_DISPLAY, "theme": loaded_entry.data["display"]["theme"]}
    )
    await hass.async_block_till_done()

    assert loaded_entry.data["display"]["appearance"] == "automatic"
```

- [ ] **Step 7: Run the tests**

Run: `bash scripts/test-backend.sh -q`
Expected: every test passes, including the 42 in `tests/test_appearance.py` (9 fixture cases three ways, the write-back, the schema, 9 refusals, the card save, and 3 migrations) and the new options-flow test. A test elsewhere that compares a whole display after an appearance save gets the materialized keys in its expected value, with a ledgered ruling.

- [ ] **Step 8: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/appearance.py custom_components/planavista/services.py custom_components/planavista/config_flow.py custom_components/planavista/__init__.py tests/fixtures/appearance_cases.json tests/test_appearance.py tests/conftest.py tests/test_upgrade.py tests/test_options_flow.py
git commit -F - <<'EOF'
feat: keep appearance settings beside 1.1.0's theme keys

Light, Dark, or Automatic, when Automatic switches, the theme, its light
and dark colors, the shared shape settings, and Motion are saved as
display settings. Every save that changes one rewrites 1.1.0's theme and
customizations from them, so stepping back a release still shows the
look in use. Entries from 1.1.0 get the new settings on upgrade, Deep
Dark becoming PlanaVista in Dark with its colors.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 2: `select.planavista_appearance`

**Files:**
- Create: `custom_components/planavista/select.py`
- Create: `tests/test_select.py`
- Modify: `custom_components/planavista/__init__.py` (`PLATFORMS`), `custom_components/planavista/strings.json` and `custom_components/planavista/translations/en.json` (identical; a test checks)

**Interfaces:**
- Consumes: Task 1's `APPEARANCE`, `MODES`, `appearance_settings`; `async_store_config(..., merge_display=True)`; the coordinator's `display_config`.
- Produces: the entity `select.planavista_appearance` (unique ID `{entry_id}_appearance`, name "PlanaVista appearance", options `light`, `dark`, `automatic`), always available.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_select.py`:

```python
"""select.planavista_appearance, part of the public surface (spec 10.2, 10.8)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import entity_registry as er

from .conftest import FakeCalendar, ws_command

ENTITY_ID = "select.planavista_appearance"


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


async def _choose(hass: HomeAssistant, option: str) -> None:
    await hass.services.async_call(
        "select", "select_option", {"entity_id": ENTITY_ID, "option": option}, blocking=True
    )
    await hass.async_block_till_done()


async def test_the_select_is_pinned(hass: HomeAssistant, loaded_entry: MockConfigEntry) -> None:
    """Changing anything here is a deliberate act (spec 10.8)."""
    state = hass.states.get(ENTITY_ID)
    assert state is not None
    assert state.state == "light"
    assert state.attributes["options"] == ["light", "dark", "automatic"]
    assert state.attributes["friendly_name"] == "PlanaVista appearance"
    registry_entry = er.async_get(hass).async_get(ENTITY_ID)
    assert registry_entry is not None
    assert registry_entry.unique_id == f"{loaded_entry.entry_id}_appearance"


async def test_choosing_dark_saves_it_for_every_screen(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    await _choose(hass, "dark")

    display = loaded_entry.data["display"]
    assert display["appearance"] == "dark"
    assert display["theme"] == "dark"  # 1.1.0 reads Deep Dark
    assert hass.states.get(ENTITY_ID).state == "dark"
    assert hass.states.get("sensor.planavista_config").attributes["display"]["appearance"] == "dark"


async def test_the_select_follows_a_save_from_the_card(
    hass: HomeAssistant, hass_ws_client: Any, household: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"appearance": "automatic"}})
    assert reply["success"]
    await hass.async_block_till_done()

    assert hass.states.get(ENTITY_ID).state == "automatic"


async def test_an_option_it_does_not_offer_is_refused(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    with pytest.raises(ServiceValidationError):
        await _choose(hass, "sepia")
    assert hass.states.get(ENTITY_ID).state == "light"
```

Run: `bash scripts/test-backend.sh tests/test_select.py -q`
Expected: 4 failed (`state is None` / no `select.planavista_appearance`).

- [ ] **Step 2: Create the platform**

Create `custom_components/planavista/select.py`:

```python
"""select.planavista_appearance: Light, Dark, or Automatic for every screen (spec 10.2, 12.4)."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .appearance import APPEARANCE, MODES, appearance_settings
from .const import CONF_DISPLAY
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .services import async_store_config


async def async_setup_entry(
    hass: HomeAssistant,
    entry: PlanaVistaConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the appearance select."""
    async_add_entities([PlanaVistaAppearanceSelect(entry.runtime_data, entry)])


class PlanaVistaAppearanceSelect(CoordinatorEntity[PlanaVistaCoordinator], SelectEntity):
    """The household's appearance; an automation can pick Dark for movie night."""

    _attr_translation_key = "appearance"
    _attr_icon = "mdi:theme-light-dark"
    _attr_options = list(MODES)

    def __init__(self, coordinator: PlanaVistaCoordinator, entry: PlanaVistaConfigEntry) -> None:
        """Name it like the other PlanaVista entities, so its ID is select.planavista_appearance."""
        super().__init__(coordinator)
        self.entity_id = "select.planavista_appearance"
        self._attr_name = "PlanaVista appearance"
        self._attr_unique_id = f"{entry.entry_id}_appearance"

    @property
    def available(self) -> bool:
        """The appearance doesn't depend on calendars, so a failed refresh doesn't hide it."""
        return True

    @property
    def current_option(self) -> str:
        """Light, dark, or automatic, as the card reads it."""
        return appearance_settings(self.coordinator.display_config)[APPEARANCE]

    async def async_select_option(self, option: str) -> None:
        """Save the choice the way the card's Appearance page does."""
        await async_store_config(self.hass, {CONF_DISPLAY: {APPEARANCE: option}}, merge_display=True)
```

In `custom_components/planavista/__init__.py`: `PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.SELECT]`.

In both `strings.json` and `translations/en.json`, add a top-level `entity` section after `exceptions`:

```json
  "entity": {
    "select": {
      "appearance": {
        "name": "Appearance",
        "state": {
          "light": "Light",
          "dark": "Dark",
          "automatic": "Automatic"
        }
      }
    }
  },
```

- [ ] **Step 3: Run the tests**

Run: `bash scripts/test-backend.sh -q`
Expected: all pass, the 4 new ones included. hassfest runs in CI (the Validate workflow) and accepts the `entity` section.

- [ ] **Step 4: Check it on the dev Home Assistant**

```bash
bash scripts/dev-ha.sh deploy
python scripts/ha.py api GET /api/states/select.planavista_appearance
python scripts/ha.py api POST /api/services/select/select_option '{"entity_id": "select.planavista_appearance", "option": "dark"}'
python scripts/ha.py api GET /api/states/sensor.planavista_config
python scripts/ha.py api POST /api/services/select/select_option '{"entity_id": "select.planavista_appearance", "option": "light"}'
```

Expected: the state is `light`, then `dark` with `display.appearance` and `display.theme` both `dark` in the sensor, then back to `light` (theme `planavista`). The dev entry migrated to minor version 2 on the restart (`python scripts/ha.py ws '{"type": "config_entries/get", "domain": "planavista"}'` shows it).

- [ ] **Step 5: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/select.py custom_components/planavista/__init__.py custom_components/planavista/strings.json custom_components/planavista/translations/en.json tests/test_select.py
git commit -F - <<'EOF'
feat: add select.planavista_appearance

Automations and voice assistants can set Light, Dark, or Automatic for
every screen in the house, for example Dark for movie night.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 3: Colors measured in OKLCH, and the `contrastText()` fix

**Files:**
- Create: `src/core/color.ts`, `test/color.test.ts`
- Modify: `src/styles/themes.ts` (its own `contrastText` goes), `src/modules/calendar/components/pv-event-chip.ts`, `src/modules/calendar/components/view-day.ts`, `src/core/pv-member-avatar.ts` (import `contrastText` from `core/color`)

**Interfaces:**
- Produces (`src/core/color.ts`): `interface Oklch { l; c; h }`, `WHITE = '#FFFFFF'`, `NEAR_BLACK = '#1A1B1E'`, `parseHex(hex) -> [r, g, b] | null`, `toHex(r, g, b) -> '#RRGGBB'`, `relativeLuminance(hex)`, `contrastRatio(a, b)`, `contrastText(bg) -> WHITE | NEAR_BLACK`, `toOklch(hex) -> Oklch`, `fromOklch(Oklch) -> hex` (chroma shrinks to fit sRGB), `matchedInk(hex)`, `matchedSurface(hex)`, `darkTint(hex)`, `shiftLightness(hex, delta)`, `adjustForContrast(fg, bg, min) -> hex | null`.

- [ ] **Step 1: Write the failing test**

Create `test/color.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  NEAR_BLACK,
  WHITE,
  adjustForContrast,
  contrastRatio,
  contrastText,
  darkTint,
  fromOklch,
  matchedInk,
  matchedSurface,
  parseHex,
  toOklch,
} from '../src/core/color';

// The calendar's color presets (const.py COLOR_PRESETS), the people in the
// approved mockups, the light accent, and the light now line.
const PRESETS = ['#F94144', '#F3722C', '#F8961E', '#F9844A', '#F9C74F', '#90BE6D', '#43AA8B', '#4D908E', '#577590', '#277DA1'];
const PEOPLE = ['#4A90D9', '#9B8EC4', '#6BA368', '#D4728C'];
const DARK_CARD = '#1B1C1F';
const DARK_INK = '#E9E9E6';

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe('parseHex', () => {
  it('reads #RRGGBB and #RGB in either case, and nothing else', () => {
    expect(parseHex('#5B5BD6')).toEqual([91, 91, 214]);
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('var(--pv-accent)')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('runs from 1 to 21 and is the same both ways', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#5B5BD6', '#5B5BD6')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#777777'), 10);
  });
});

describe('contrastText', () => {
  it('picks whichever of white and near-black measures more contrast', () => {
    expect(contrastText('#FFFFFF')).toBe(NEAR_BLACK);
    expect(contrastText('#000000')).toBe(WHITE);
    expect(contrastText('#6366F1')).toBe(WHITE);
    expect(contrastText('#277DA1')).toBe(WHITE);
    expect(contrastText('#F9C74F')).toBe(NEAR_BLACK);
  });

  it('puts dark text on colors that 1.1.0 gave white text', () => {
    // 1.1.0 switched at a luminance of 0.4; these measure about 0.24 and 0.32.
    expect(contrastText('#F94144')).toBe(NEAR_BLACK);
    expect(contrastText('#43AA8B')).toBe(NEAR_BLACK);
  });

  it('crosses over at a relative luminance of about 0.2', () => {
    expect(contrastText('#7C7C7C')).toBe(WHITE); // 0.2016
    expect(contrastText('#7E7E7E')).toBe(NEAR_BLACK); // 0.2086
  });

  it('gives white for anything that is not a hex color, as 1.1.0 did', () => {
    expect(contrastText('var(--pv-accent)')).toBe(WHITE);
  });
});

describe('OKLCH', () => {
  it('measures the light accent', () => {
    const { l, c, h } = toOklch('#5B5BD6');
    expect(l).toBeCloseTo(0.5403, 3);
    expect(c).toBeCloseTo(0.1841, 3);
    expect(h).toBeCloseTo(278.3, 0);
  });

  it('round-trips every color preset exactly', () => {
    for (const hex of PRESETS) expect(fromOklch(toOklch(hex))).toBe(hex);
  });

  it('keeps out-of-gamut colors in sRGB by giving up chroma, not lightness', () => {
    const vivid = fromOklch({ l: 0.75, c: 0.4, h: 145 });
    expect(parseHex(vivid)).not.toBeNull();
    expect(toOklch(vivid).l).toBeCloseTo(0.75, 2);
  });
});

describe('matched dark colors', () => {
  it('keep their hue, brighten, and read on the dark card', () => {
    for (const hex of [...PRESETS, ...PEOPLE, '#5B5BD6', '#E5484D']) {
      const ink = matchedInk(hex);
      expect(hueDistance(toOklch(ink).h, toOklch(hex).h), hex).toBeLessThan(1.5);
      expect(toOklch(ink).l, hex).toBeGreaterThan(Math.min(0.9, toOklch(hex).l + 0.07) - 0.005);
      expect(contrastRatio(ink, DARK_CARD), hex).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('come close to the approved dark people colors', () => {
    expect(toOklch(matchedInk('#4A90D9')).l).toBeCloseTo(toOklch('#62A3EA').l, 1);
    expect(toOklch(matchedInk('#6BA368')).l).toBeCloseTo(toOklch('#80BB7C').l, 1);
  });

  it('give each person a quiet dark tint that dark text reads well on', () => {
    for (const hex of [...PRESETS, ...PEOPLE]) {
      const tint = darkTint(hex);
      expect(toOklch(tint).l, hex).toBeCloseTo(0.255, 2);
      expect(hueDistance(toOklch(tint).h, toOklch(hex).h), hex).toBeLessThan(3);
      expect(contrastRatio(DARK_INK, tint), hex).toBeGreaterThanOrEqual(12);
    }
  });

  it('turn a light background into a dark one of the same hue', () => {
    const surface = matchedSurface('#FFF4E6');
    expect(toOklch(surface).l).toBeCloseTo(0.19, 2);
    expect(contrastRatio(DARK_INK, surface)).toBeGreaterThanOrEqual(12);
  });
});

describe('adjustForContrast', () => {
  it('leaves a color that already reads', () => {
    expect(adjustForContrast('#5b5bd6', '#FFFFFF', 3)).toBe('#5B5BD6');
  });

  it('brightens a color on a dark background just enough', () => {
    const fixed = adjustForContrast('#3B3BB0', DARK_CARD, 3)!;
    expect(contrastRatio(fixed, DARK_CARD)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(fixed, DARK_CARD)).toBeLessThan(3.1);
    expect(hueDistance(toOklch(fixed).h, toOklch('#3B3BB0').h)).toBeLessThan(3);
  });

  it('darkens a color on a light background just enough', () => {
    const fixed = adjustForContrast('#F9C74F', '#FFFFFF', 3)!;
    expect(contrastRatio(fixed, '#FFFFFF')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(fixed, '#FFFFFF')).toBeLessThan(3.1);
  });

  it('gives null when no lightness gets there, or for something that is not a color', () => {
    expect(adjustForContrast('#808080', '#7F7F7F', 22)).toBeNull();
    expect(adjustForContrast('red', '#FFFFFF', 3)).toBeNull();
  });
});
```

Run: `npm test -- color`
Expected: `Failed to resolve import "../src/core/color"`.

- [ ] **Step 2: Create `src/core/color.ts`**

```ts
/**
 * Colors are measured, not eyeballed (spec 11.3). OKLCH derives dark
 * versions and tints that keep a color's hue; WCAG relative luminance
 * measures contrast.
 */

export interface Oklch {
  /** Lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma, 0 (gray) to about 0.37. */
  c: number;
  /** Hue in degrees, 0 to 360. */
  h: number;
}

export const WHITE = '#FFFFFF';
export const NEAR_BLACK = '#1A1B1E';

/** '#RGB' or '#RRGGBB' (either case) as 0 to 255 channels; null when it isn't a hex color. */
export function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? match[1].split('').map(d => d + d).join('') : match[1];
  return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
}

/** 0 to 255 channels as '#RRGGBB' (rounded and clamped). */
export function toHex(r: number, g: number, b: number): string {
  const part = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function toLinear(channel: number): number {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function fromLinear(v: number): number {
  return (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255;
}

/** WCAG relative luminance: 0 for black, 1 for white; 0 for anything that isn't a hex color. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * White or near-black text, whichever measures more contrast on `bg`
 * (spec 11.3). The two cross at a relative luminance of about 0.2, where
 * 1.1.0 switched at 0.4 and put white text on colors that read better dark.
 */
export function contrastText(bg: string): string {
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, NEAR_BLACK) ? WHITE : NEAR_BLACK;
}

/** A hex color in OKLCH (Björn Ottosson's OKLab, in polar form). */
export function toOklch(hex: string): Oklch {
  const [r, g, b] = (parseHex(hex) ?? [0, 0, 0]).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  const h = c < 1e-6 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l3 = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m3 = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s3 = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
}

function inGamut(rgb: number[]): boolean {
  return rgb.every(v => v >= -1e-4 && v <= 1 + 1e-4);
}

/** The sRGB color for an OKLCH color; chroma shrinks until it fits, keeping lightness and hue. */
export function fromOklch(color: Oklch): string {
  const l = Math.min(1, Math.max(0, color.l));
  let c = Math.max(0, color.c);
  if (!inGamut(oklchToLinear({ l, c, h: color.h }))) {
    let low = 0;
    let high = c;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) low = mid;
      else high = mid;
    }
    c = low;
  }
  const [r, g, b] = oklchToLinear({ l, c, h: color.h }).map(v => fromLinear(Math.min(1, Math.max(0, v))));
  return toHex(r, g, b);
}

/**
 * The dark version of a color drawn on dark surfaces: an accent, a
 * person's color, the now line. Same hue, a little brighter (spec 12.4).
 */
export function matchedInk(hex: string): string {
  const { l, c, h } = toOklch(hex);
  return fromOklch({ l: Math.min(0.9, Math.max(l + 0.07, 0.69)), c, h });
}

/** The dark version of a background: its hue, nearly no color, as dark as the dark themes. */
export function matchedSurface(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.19, c: Math.min(c, 0.02), h });
}

/** The pale fill behind a person's events in dark mode: their hue, low and quiet. */
export function darkTint(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.255, c: Math.min(c, 0.037), h });
}

/** `hex` moved in OKLCH lightness by `delta` (positive is lighter), hue and chroma kept. */
export function shiftLightness(hex: string, delta: number): string {
  const color = toOklch(hex);
  return fromOklch({ ...color, l: color.l + delta });
}

/**
 * The color nearest to `fg` that has at least `min` contrast on `bg`: the
 * same hue, lightness moved away from the background only as far as needed
 * (the contrast guard's one-tap fix, spec 12.4). `fg` itself (as #RRGGBB)
 * when it already passes; null when no lightness gets there.
 */
export function adjustForContrast(fg: string, bg: string, min: number): string | null {
  const rgb = parseHex(fg);
  if (!rgb) return null;
  if (contrastRatio(fg, bg) >= min) return toHex(...rgb);
  const start = toOklch(fg);
  const target = toOklch(bg).l < 0.5 ? 1 : 0;
  const at = (t: number) => fromOklch({ ...start, l: start.l + (target - start.l) * t });
  if (contrastRatio(at(1), bg) < min) return null;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (contrastRatio(at(mid), bg) >= min) high = mid;
    else low = mid;
  }
  return at(high);
}
```

Run: `npm test -- color`
Expected: `17 passed`.

- [ ] **Step 3: One `contrastText()` for the whole card**

In `src/styles/themes.ts`, delete the `contrastText` function (and its doc comment) and add at the top:

```ts
import { contrastText } from '../core/color';

export { contrastText };
```

The local `luminance()` helper stays for the old override engine until Task 13 removes the file. In `pv-event-chip.ts` and `view-day.ts`, change `import { contrastText } from '../../../styles/themes';` to `import { contrastText } from '../../../core/color';`; in `src/core/pv-member-avatar.ts`, change `'../styles/themes'` to `'./color'`.

- [ ] **Step 4: Run the checks**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; `234 passed` (217 + 17).

- [ ] **Step 5: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/color.ts test/color.test.ts src/styles/themes.ts src/modules/calendar/components/pv-event-chip.ts src/modules/calendar/components/view-day.ts src/core/pv-member-avatar.ts
git commit -F - <<'EOF'
feat(frontend): measure colors, and put the readable text on every color

Text on a color is now white or near-black by measured contrast, so
warm and green calendar colors get dark letters where white was hard to
read. Colors can be derived in OKLCH, keeping their hue, for the dark
versions to come.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 4: Themes in pairs: PlanaVista, Minimal, and Vibrant, light and dark

**Files:**
- Create: `src/styles/theme-pairs.ts`, `test/theme-pairs.test.ts`

The old engine in `src/styles/themes.ts` keeps working until Task 10 switches the card over and Task 13 deletes it.

**Interfaces:**
- Consumes: Task 3's color functions.
- Produces (`src/styles/theme-pairs.ts`):
  - types `ThemePair` (`'planavista' | 'minimal' | 'vibrant'`), `Mode` (`'light' | 'dark'`), `ThemeColors { accent?, background?, header?, now_color? }`, `ThemeShape { corner_style?, shadow_depth?, event_style?, avatar_border? }`, `Look { pair, light: ThemeColors, dark: ThemeColors, shape }`, `Tokens`;
  - constants `FONT_BODY`, `FONT_HEADING`, `CORNER_PRESETS`, `SHADOW_PRESETS`, `HEADER_PRESETS` (each with `light` and `dark`), `THEMES` (every pair's two token tables);
  - `themeTokens(look, mode) -> Tokens`, `personColors(color, colorLight, mode) -> { color, colorLight }`, `applyTokens(element, tokens)`.
- The token names: every `--pv-*` property 1.1.0 had, plus `--pv-accent-ink` (accent text and marks on surfaces), `--pv-accent-tint` and `--pv-accent-tint-ink`, `--pv-track`, `--pv-chip`, `--pv-seg`, `--pv-seg-on`, `--pv-warn-bg`, `--pv-warn-ink`, `--pv-bad-bg`, `--pv-bad-ink`, `--pv-star`, `--pv-danger`, `--pv-header-muted`, `--pv-font-heading`, and the `color-scheme` property. `--pv-accent` is the filled accent (buttons, the active tab) with `--pv-accent-text` on it.

- [ ] **Step 1: Write the failing test**

Create `test/theme-pairs.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, matchedInk, matchedSurface, toOklch } from '../src/core/color';
import { Look, Mode, ThemePair, applyTokens, personColors, themeTokens } from '../src/styles/theme-pairs';

const PLAIN: Look = { pair: 'planavista', light: {}, dark: {}, shape: {} };
const look = (changes: Partial<Look>): Look => ({ ...PLAIN, ...changes });
const PAIRS: ThemePair[] = ['planavista', 'minimal', 'vibrant'];
const MODES: Mode[] = ['light', 'dark'];

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe('themeTokens: the approved versions', () => {
  it('PlanaVista light is warm white with an indigo accent and a plain header', () => {
    const t = themeTokens(PLAIN, 'light');
    expect(t['--pv-bg']).toBe('#F8F8F6');
    expect(t['--pv-card-bg']).toBe('#FFFFFF');
    expect(t['--pv-text']).toBe('#1A1B1E');
    expect(t['--pv-accent']).toBe('#5B5BD6');
    expect(t['--pv-header-gradient']).toBe('#FFFFFF');
    expect(t['--pv-header-text']).toBe('#1A1B1E');
    expect(t['color-scheme']).toBe('light');
  });

  it('PlanaVista dark gets lighter as surfaces come forward, with no shadows', () => {
    const t = themeTokens(PLAIN, 'dark');
    expect(t['--pv-bg']).toBe('#111214');
    expect(t['--pv-card-bg']).toBe('#1B1C1F');
    expect(t['--pv-card-bg-elevated']).toBe('#25272B');
    expect(t['--pv-accent']).toBe('#6262DE');
    expect(t['--pv-accent-ink']).toBe('#8E8EF2');
    expect(t['--pv-shadow']).toBe('none');
    expect(t['color-scheme']).toBe('dark');
  });

  it('Minimal dark fills its accent with near-white and dark letters', () => {
    const t = themeTokens(look({ pair: 'minimal' }), 'dark');
    expect(t['--pv-accent']).toBe('#EDEDED');
    expect(t['--pv-accent-text']).toBe('#111214');
  });

  it('Vibrant keeps its gradient header in both versions', () => {
    expect(themeTokens(look({ pair: 'vibrant' }), 'light')['--pv-header-gradient']).toContain('#7C3AED');
    expect(themeTokens(look({ pair: 'vibrant' }), 'dark')['--pv-header-gradient']).toContain('#4C1D95');
  });

  it.each(PAIRS.flatMap(pair => MODES.map(mode => [pair, mode] as const)))('%s %s reads (spec 11.8)', (pair, mode) => {
    const t = themeTokens(look({ pair }), mode);
    const card = t['--pv-card-bg'];
    expect(contrastRatio(t['--pv-text'], card)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(t['--pv-text-secondary'], card)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-text-muted'], card)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t['--pv-accent-text'], t['--pv-accent'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-accent-ink'], card)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t['--pv-accent-tint-ink'], t['--pv-accent-tint'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-now-color'], card)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(t['--pv-warn-ink'], t['--pv-warn-bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(t['--pv-bad-ink'], t['--pv-bad-bg'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#FFFFFF', t['--pv-danger'])).toBeGreaterThanOrEqual(4.5);
    if (t['--pv-header-gradient'].startsWith('#')) {
      expect(contrastRatio(t['--pv-header-text'], t['--pv-header-gradient'])).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('themeTokens: customizing', () => {
  it('a light accent gets a Matched dark accent of the same hue', () => {
    const t = themeTokens(look({ light: { accent: '#277DA1' } }), 'dark');
    expect(t['--pv-accent']).toBe(matchedInk('#277DA1'));
    expect(hueDistance(toOklch(t['--pv-accent']).h, toOklch('#277DA1').h)).toBeLessThan(1.5);
    expect(contrastRatio(t['--pv-accent-text'], t['--pv-accent'])).toBeGreaterThanOrEqual(4.5);
  });

  it('a dark color set by hand wins over the Matched one', () => {
    const t = themeTokens(look({ light: { accent: '#277DA1' }, dark: { accent: '#8E8EF2' } }), 'dark');
    expect(t['--pv-accent']).toBe('#8E8EF2');
  });

  it('a custom light background gets a dark one of its hue, and the text turns light', () => {
    const t = themeTokens(look({ light: { background: '#FFF4E6' } }), 'dark');
    expect(t['--pv-bg']).toBe(matchedSurface('#FFF4E6'));
    expect(t['--pv-text']).toBe('#E9E9E6');
    expect(t['--pv-header-gradient']).toBe(t['--pv-card-bg']);
    expect(contrastRatio(t['--pv-text'], t['--pv-card-bg'])).toBeGreaterThanOrEqual(7);
  });

  it('a dark background picked for the light version still gets light text', () => {
    const t = themeTokens(look({ light: { background: '#202124' } }), 'light');
    expect(t['--pv-text']).toBe('#E9E9E6');
    expect(t['color-scheme']).toBe('dark');
  });

  it('headers can be plain, a preset, or a color, and dark versions follow', () => {
    expect(themeTokens(look({ light: { header: 'gradient_teal' } }), 'light')['--pv-header-text']).toBe('#FFFFFF');
    expect(themeTokens(look({ light: { header: 'gradient_teal' } }), 'dark')['--pv-header-gradient']).toContain('#115E59');
    const solid = themeTokens(look({ light: { header: '#F9C74F' } }), 'light');
    expect(solid['--pv-header-gradient']).toBe('#F9C74F');
    expect(solid['--pv-header-text']).toBe('#1A1B1E');
    const night = themeTokens(look({ light: { header: '#F9C74F' } }), 'dark');
    expect(toOklch(night['--pv-header-gradient']).l).toBeLessThanOrEqual(0.405);
    expect(themeTokens(look({ pair: 'vibrant', light: { header: 'plain' } }), 'light')['--pv-header-gradient']).toBe('#FFFFFF');
  });

  it('the now line follows its light color in dark mode unless set by hand', () => {
    expect(themeTokens(look({ light: { now_color: '#E5484D' } }), 'dark')['--pv-now-color']).toBe(matchedInk('#E5484D'));
    expect(themeTokens(look({ dark: { now_color: '#FFFFFF' } }), 'dark')['--pv-now-color']).toBe('#FFFFFF');
  });

  it('shape settings apply to both versions', () => {
    for (const mode of MODES) {
      const t = themeTokens(look({ shape: { corner_style: 'pill', shadow_depth: 'bold', avatar_border: 'white' } }), mode);
      expect(t['--pv-radius']).toBe('20px');
      expect(t['--pv-shadow']).toContain('rgba(0, 0, 0, 0.15)');
      expect(t['--pv-avatar-border']).toBe('#FFFFFF');
    }
  });
});

describe('personColors', () => {
  it('keeps a person colors in light mode and derives both in dark mode', () => {
    expect(personColors('#F94144', '#FDBDBE', 'light')).toEqual({ color: '#F94144', colorLight: '#FDBDBE' });
    const dark = personColors('#F94144', '#FDBDBE', 'dark');
    expect(dark.color).toBe(matchedInk('#F94144'));
    expect(toOklch(dark.colorLight).l).toBeCloseTo(0.255, 2);
  });
});

describe('applyTokens', () => {
  function fakeElement() {
    const style = new Map<string, string>();
    const element = {
      style: {
        setProperty: (name: string, value: string) => style.set(name, value),
        removeProperty: (name: string) => style.delete(name),
      },
    } as unknown as HTMLElement;
    return { element, style };
  }

  it('sets tokens and removes ones that are gone', () => {
    const { element, style } = fakeElement();
    applyTokens(element, { '--pv-bg': '#000000', '--pv-avatar-border': '#FFFFFF' });
    applyTokens(element, { '--pv-bg': '#FFFFFF' });
    expect(style.get('--pv-bg')).toBe('#FFFFFF');
    expect(style.has('--pv-avatar-border')).toBe(false);
  });
});
```

Run: `npm test -- theme-pairs`
Expected: `Failed to resolve import "../src/styles/theme-pairs"`.

- [ ] **Step 2: Create `src/styles/theme-pairs.ts`**

The light and dark tables are the approved day-night mockup's tokens (spec 12.4, `day-night.html`), with Vibrant's dark accent set to `#7C4DEB` so white text on it measures 5.1:1.

```ts
import {
  adjustForContrast,
  contrastText,
  darkTint,
  fromOklch,
  matchedInk,
  matchedSurface,
  parseHex,
  shiftLightness,
  toOklch,
} from '../core/color';


/** The three themes; each has a light and a dark version (spec 12.4). */
export type ThemePair = 'planavista' | 'minimal' | 'vibrant';
export type Mode = 'light' | 'dark';

/** A version's own colors; a missing one is the theme's (light) or Matched (dark). */
export interface ThemeColors {
  accent?: string;
  background?: string;
  /** 'plain', a header preset key, or #RRGGBB. */
  header?: string;
  now_color?: string;
}

/** Shape settings, shared by both versions. */
export interface ThemeShape {
  corner_style?: string;
  shadow_depth?: string;
  event_style?: 'stripes' | 'solid';
  /** 'primary' (their color), 'white', or #RRGGBB; 1.1.0's 'light' reads as 'white'. */
  avatar_border?: string;
}

/** Everything that decides how the card looks, apart from the mode. */
export interface Look {
  pair: ThemePair;
  light: ThemeColors;
  dark: ThemeColors;
  shape: ThemeShape;
}

export type Tokens = Record<string, string>;

export const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";
/** Rounded headings and numbers: SF Pro Rounded on Apple devices, the bundled face elsewhere (spec 11.2). */
export const FONT_HEADING = "ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', " + FONT_BODY;

export const CORNER_PRESETS: Record<string, { radius: string; radiusLg: string; radiusSm: string }> = {
  sharp: { radius: '4px', radiusLg: '6px', radiusSm: '2px' },
  rounded: { radius: '12px', radiusLg: '16px', radiusSm: '8px' },
  pill: { radius: '20px', radiusLg: '24px', radiusSm: '14px' },
};

export const SHADOW_PRESETS: Record<string, { shadow: string; shadowLg: string; shadowXl: string }> = {
  none: { shadow: 'none', shadowLg: 'none', shadowXl: 'none' },
  subtle: {
    shadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    shadowLg: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
    shadowXl: '0 20px 40px rgba(0, 0, 0, 0.12)',
  },
  bold: {
    shadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 24px 48px rgba(0, 0, 0, 0.24)',
  },
};

/** Header presets from 1.1.0, light and dark. solid_accent follows the accent. */
export const HEADER_PRESETS: Record<string, { light: string; dark: string }> = {
  gradient_purple: {
    light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    dark: 'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
  },
  gradient_teal: {
    light: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
    dark: 'linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)',
  },
  gradient_sunset: {
    light: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    dark: 'linear-gradient(135deg, #92400E 0%, #991B1B 100%)',
  },
  solid_accent: { light: '', dark: '' },
  solid_dark: { light: '#1A1B1E', dark: '#0B0C0D' },
};

const PLANAVISTA_LIGHT: Tokens = {
  'color-scheme': 'light',
  '--pv-bg': '#F8F8F6',
  '--pv-card-bg': '#FFFFFF',
  '--pv-card-bg-elevated': '#FFFFFF',
  '--pv-text': '#1A1B1E',
  '--pv-text-secondary': '#5F6670',
  '--pv-text-muted': '#8E949C',
  '--pv-border': '#E7E7E3',
  '--pv-border-subtle': '#F1F1EE',
  '--pv-track': '#ECECE8',
  '--pv-chip': '#F1F1EE',
  '--pv-seg': '#ECECE8',
  '--pv-seg-on': '#FFFFFF',
  '--pv-accent': '#5B5BD6',
  '--pv-accent-text': '#FFFFFF',
  '--pv-accent-ink': '#5B5BD6',
  '--pv-accent-tint': '#EEEEFC',
  '--pv-accent-tint-ink': '#3B3BB0',
  '--pv-warn-bg': '#FDF1DC',
  '--pv-warn-ink': '#8A5A00',
  '--pv-bad-bg': '#FBE4E4',
  '--pv-bad-ink': '#A12828',
  '--pv-star': '#8A6A00',
  '--pv-danger': '#C62828',
  '--pv-today-bg': 'rgba(91, 91, 214, 0.06)',
  '--pv-now-color': '#E5484D',
  '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
  '--pv-shadow': SHADOW_PRESETS.subtle.shadow,
  '--pv-shadow-lg': SHADOW_PRESETS.subtle.shadowLg,
  '--pv-shadow-xl': SHADOW_PRESETS.subtle.shadowXl,
  '--pv-radius': '12px',
  '--pv-radius-lg': '16px',
  '--pv-radius-sm': '8px',
  '--pv-transition': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '--pv-font-family': FONT_BODY,
  '--pv-font-heading': FONT_HEADING,
  '--pv-header-gradient': '#FFFFFF',
  '--pv-header-text': '#1A1B1E',
  '--pv-header-muted': '#5F6670',
  '--pv-backdrop': 'rgba(0, 0, 0, 0.3)',
};

const PLANAVISTA_DARK: Tokens = {
  ...PLANAVISTA_LIGHT,
  'color-scheme': 'dark',
  '--pv-bg': '#111214',
  '--pv-card-bg': '#1B1C1F',
  '--pv-card-bg-elevated': '#25272B',
  '--pv-text': '#E9E9E6',
  '--pv-text-secondary': '#A3A7AE',
  '--pv-text-muted': '#6F747C',
  '--pv-border': '#2B2D31',
  '--pv-border-subtle': '#232528',
  '--pv-track': '#2C2E32',
  '--pv-chip': '#25272B',
  '--pv-seg': '#25272B',
  '--pv-seg-on': '#3A3C42',
  '--pv-accent': '#6262DE',
  '--pv-accent-text': '#FFFFFF',
  '--pv-accent-ink': '#8E8EF2',
  '--pv-accent-tint': '#25254A',
  '--pv-accent-tint-ink': '#C5C5FF',
  '--pv-warn-bg': '#382A0F',
  '--pv-warn-ink': '#F0C066',
  '--pv-bad-bg': '#3B1C1F',
  '--pv-bad-ink': '#F3A5A5',
  '--pv-star': '#EFC75E',
  '--pv-danger': '#B93838',
  '--pv-today-bg': 'rgba(142, 142, 242, 0.08)',
  '--pv-now-color': '#FE6062',
  '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
  '--pv-shadow': 'none',
  '--pv-shadow-lg': 'none',
  '--pv-shadow-xl': 'none',
  '--pv-header-gradient': '#1B1C1F',
  '--pv-header-text': '#E9E9E6',
  '--pv-header-muted': '#A3A7AE',
  '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
};

/** Each theme's two versions, exactly as approved (spec 12.4). */
export const THEMES: Record<ThemePair, Record<Mode, Tokens>> = {
  planavista: { light: PLANAVISTA_LIGHT, dark: PLANAVISTA_DARK },
  minimal: {
    light: {
      ...PLANAVISTA_LIGHT,
      '--pv-bg': '#FFFFFF',
      '--pv-border': '#ECEEF1',
      '--pv-border-subtle': '#F5F6F8',
      '--pv-track': '#F1F2F4',
      '--pv-chip': '#F3F4F6',
      '--pv-seg': '#F1F2F4',
      '--pv-accent': '#111827',
      '--pv-accent-ink': '#111827',
      '--pv-accent-tint': '#F3F4F6',
      '--pv-accent-tint-ink': '#111827',
      '--pv-today-bg': 'rgba(17, 24, 39, 0.03)',
      '--pv-shadow': '0 0 0 1px rgba(0, 0, 0, 0.05)',
      '--pv-shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.05)',
      '--pv-shadow-xl': '0 8px 24px rgba(0, 0, 0, 0.08)',
      '--pv-radius': '8px',
      '--pv-radius-lg': '12px',
      '--pv-radius-sm': '6px',
      '--pv-transition': '150ms ease',
    },
    dark: {
      ...PLANAVISTA_DARK,
      '--pv-bg': '#000000',
      '--pv-card-bg': '#0E0E10',
      '--pv-card-bg-elevated': '#18181B',
      '--pv-text': '#EDEDED',
      '--pv-text-secondary': '#A1A1AA',
      '--pv-text-muted': '#71717A',
      '--pv-border': '#1F2023',
      '--pv-border-subtle': '#161618',
      '--pv-track': '#1F2023',
      '--pv-chip': '#18181B',
      '--pv-seg': '#18181B',
      '--pv-seg-on': '#2A2A2E',
      '--pv-accent': '#EDEDED',
      '--pv-accent-text': '#111214',
      '--pv-accent-ink': '#EDEDED',
      '--pv-accent-tint': '#1F1F23',
      '--pv-accent-tint-ink': '#EDEDED',
      '--pv-today-bg': 'rgba(237, 237, 237, 0.05)',
      '--pv-radius': '8px',
      '--pv-radius-lg': '12px',
      '--pv-radius-sm': '6px',
      '--pv-transition': '150ms ease',
      '--pv-header-gradient': '#0E0E10',
      '--pv-header-text': '#EDEDED',
      '--pv-header-muted': '#A1A1AA',
    },
  },
  vibrant: {
    light: {
      ...PLANAVISTA_LIGHT,
      '--pv-bg': '#FAF8FF',
      '--pv-border': '#ECE6FB',
      '--pv-border-subtle': '#F4F0FD',
      '--pv-accent': '#7C3AED',
      '--pv-accent-ink': '#7C3AED',
      '--pv-accent-tint': '#F1EAFE',
      '--pv-accent-tint-ink': '#5B21B6',
      '--pv-today-bg': 'rgba(124, 58, 237, 0.06)',
      '--pv-now-color': '#F43F5E',
      '--pv-shadow': '0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)',
      '--pv-shadow-lg': '0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)',
      '--pv-shadow-xl': '0 20px 40px rgba(124, 58, 237, 0.2)',
      '--pv-radius': '14px',
      '--pv-radius-lg': '20px',
      '--pv-radius-sm': '10px',
      '--pv-transition': '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--pv-header-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      '--pv-header-text': '#FFFFFF',
      '--pv-header-muted': 'rgba(255, 255, 255, 0.85)',
      '--pv-backdrop': 'rgba(124, 58, 237, 0.2)',
    },
    dark: {
      ...PLANAVISTA_DARK,
      '--pv-bg': '#150E22',
      '--pv-card-bg': '#20172F',
      '--pv-card-bg-elevated': '#2A1F3D',
      '--pv-border': '#2E2442',
      '--pv-border-subtle': '#251B36',
      '--pv-track': '#2E2442',
      '--pv-chip': '#2A1F3D',
      '--pv-seg': '#2A1F3D',
      '--pv-seg-on': '#3A2D52',
      '--pv-accent': '#7C4DEB',
      '--pv-accent-ink': '#B79BFA',
      '--pv-accent-tint': '#2E2050',
      '--pv-accent-tint-ink': '#D9C9FF',
      '--pv-today-bg': 'rgba(183, 155, 250, 0.08)',
      '--pv-radius': '14px',
      '--pv-radius-lg': '20px',
      '--pv-radius-sm': '10px',
      '--pv-transition': '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--pv-header-gradient': 'linear-gradient(135deg, #4C1D95 0%, #831843 100%)',
      '--pv-header-text': '#FFFFFF',
      '--pv-header-muted': 'rgba(255, 255, 255, 0.85)',
    },
  },
};

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex) ?? [0, 0, 0];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The pale accent fill in light mode. */
function lightTint(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.955, c: Math.min(c, 0.02), h });
}

/** Text on the accent's tint. */
function tintInk(hex: string, mode: Mode): string {
  const { c, h } = toOklch(hex);
  return mode === 'light' ? fromOklch({ l: 0.43, c, h }) : fromOklch({ l: 0.84, c: Math.min(c, 0.09), h });
}

/** Surfaces, lines, and text for a custom background, light or dark by its own lightness. */
function surfaceTokens(bg: string): Tokens {
  if (toOklch(bg).l >= 0.6) {
    const card = toOklch(bg).l >= 0.9 ? '#FFFFFF' : shiftLightness(bg, 0.04);
    return {
      'color-scheme': 'light',
      '--pv-bg': bg,
      '--pv-card-bg': card,
      '--pv-card-bg-elevated': card,
      '--pv-text': '#1A1B1E',
      '--pv-text-secondary': '#5F6670',
      '--pv-text-muted': '#8E949C',
      '--pv-border': shiftLightness(bg, -0.07),
      '--pv-border-subtle': shiftLightness(bg, -0.035),
      '--pv-track': shiftLightness(bg, -0.06),
      '--pv-chip': shiftLightness(bg, -0.04),
      '--pv-seg': shiftLightness(bg, -0.06),
      '--pv-seg-on': card,
      '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
      '--pv-backdrop': 'rgba(0, 0, 0, 0.3)',
    };
  }
  return {
    'color-scheme': 'dark',
    '--pv-bg': bg,
    '--pv-card-bg': shiftLightness(bg, 0.045),
    '--pv-card-bg-elevated': shiftLightness(bg, 0.075),
    '--pv-text': '#E9E9E6',
    '--pv-text-secondary': '#A3A7AE',
    '--pv-text-muted': '#6F747C',
    '--pv-border': shiftLightness(bg, 0.115),
    '--pv-border-subtle': shiftLightness(bg, 0.07),
    '--pv-track': shiftLightness(bg, 0.12),
    '--pv-chip': shiftLightness(bg, 0.075),
    '--pv-seg': shiftLightness(bg, 0.075),
    '--pv-seg-on': shiftLightness(bg, 0.16),
    '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
    '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
  };
}

/** Accent tokens for one version from that version's accent color. */
function accentTokens(hex: string, card: string, mode: Mode): Tokens {
  return {
    '--pv-accent': hex,
    '--pv-accent-text': contrastText(hex),
    '--pv-accent-ink': adjustForContrast(hex, card, 3) ?? hex,
    '--pv-accent-tint': mode === 'light' ? lightTint(hex) : darkTint(hex),
    '--pv-accent-tint-ink': tintInk(hex, mode),
    '--pv-today-bg': rgba(hex, mode === 'light' ? 0.06 : 0.1),
  };
}

/** A solid header color's dark version: its hue, deep enough for white text. */
function matchedHeader(hex: string): string {
  const { l, c, h } = toOklch(hex);
  return fromOklch({ l: Math.min(l, 0.4), c: c * 0.8, h });
}

function headerTokens(header: string, tokens: Tokens, mode: Mode): Tokens {
  if (header === 'plain') {
    return {
      '--pv-header-gradient': tokens['--pv-card-bg'],
      '--pv-header-text': tokens['--pv-text'],
      '--pv-header-muted': tokens['--pv-text-secondary'],
    };
  }
  const preset = HEADER_PRESETS[header];
  const fill = header === 'solid_accent' ? tokens['--pv-accent'] : preset ? preset[mode] : header;
  // 1.1.0's gradients and dark header were drawn for white text; solid colors are measured.
  const text = preset && header !== 'solid_accent' ? '#FFFFFF' : contrastText(fill);
  return {
    '--pv-header-gradient': fill,
    '--pv-header-text': text,
    '--pv-header-muted': text === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 27, 30, 0.7)',
  };
}

/**
 * The CSS custom properties for a look in one mode: the theme's version,
 * then this version's own colors. In dark mode a color set only for light
 * is Matched: derived from the light one in OKLCH (spec 12.4).
 */
export function themeTokens(look: Look, mode: Mode): Tokens {
  const tokens: Tokens = { ...(THEMES[look.pair] ?? THEMES.planavista)[mode] };
  const own = mode === 'light' ? look.light : look.dark;
  const light = look.light;

  const background = own.background ?? (mode === 'dark' && light.background ? matchedSurface(light.background) : undefined);
  if (background && parseHex(background)) Object.assign(tokens, surfaceTokens(background));

  const accent = own.accent ?? (mode === 'dark' && light.accent ? matchedInk(light.accent) : undefined);
  if (accent && parseHex(accent)) Object.assign(tokens, accentTokens(accent, tokens['--pv-card-bg'], mode));

  const header = own.header ?? (mode === 'dark' && light.header
    ? (light.header.startsWith('#') ? matchedHeader(light.header) : light.header)
    : undefined);
  if (header) Object.assign(tokens, headerTokens(header, tokens, mode));
  else if (background && tokens['--pv-header-gradient'] === THEMES[look.pair]?.[mode]['--pv-card-bg']) {
    // A plain header follows a custom background's card color.
    Object.assign(tokens, headerTokens('plain', tokens, mode));
  }

  const now = own.now_color ?? (mode === 'dark' && light.now_color ? matchedInk(light.now_color) : undefined);
  if (now && parseHex(now)) tokens['--pv-now-color'] = now;

  const corners = CORNER_PRESETS[look.shape.corner_style ?? ''];
  if (corners) {
    tokens['--pv-radius'] = corners.radius;
    tokens['--pv-radius-lg'] = corners.radiusLg;
    tokens['--pv-radius-sm'] = corners.radiusSm;
  }
  const shadows = SHADOW_PRESETS[look.shape.shadow_depth ?? ''];
  if (shadows) {
    tokens['--pv-shadow'] = shadows.shadow;
    tokens['--pv-shadow-lg'] = shadows.shadowLg;
    tokens['--pv-shadow-xl'] = shadows.shadowXl;
  }
  const border = look.shape.avatar_border;
  if (border === 'white' || border === 'light') tokens['--pv-avatar-border'] = '#FFFFFF';
  else if (border && parseHex(border)) tokens['--pv-avatar-border'] = border;
  return tokens;
}

/** A person's color and the fill behind their events, for one mode. */
export function personColors(color: string, colorLight: string | undefined, mode: Mode): { color: string; colorLight: string } {
  if (mode === 'light' || !parseHex(color)) return { color, colorLight: colorLight || color };
  return { color: matchedInk(color), colorLight: darkTint(color) };
}

const _applied = new WeakMap<HTMLElement, { key: string; names: string[] }>();

/**
 * Set the tokens on an element, removing any it set before that are gone
 * now (an avatar border turned off). Applying the same tokens again does nothing.
 */
export function applyTokens(element: HTMLElement, tokens: Tokens): void {
  const key = JSON.stringify(tokens);
  const last = _applied.get(element);
  if (last?.key === key) return;
  for (const name of last?.names ?? []) {
    if (!(name in tokens)) element.style.removeProperty(name);
  }
  for (const [name, value] of Object.entries(tokens)) element.style.setProperty(name, value);
  _applied.set(element, { key, names: Object.keys(tokens) });
}
```

Run: `npm test -- theme-pairs`
Expected: `19 passed`.

- [ ] **Step 3: Run the checks**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; `253 passed`.

- [ ] **Step 4: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/styles/theme-pairs.ts test/theme-pairs.test.ts
git commit -F - <<'EOF'
feat(frontend): give every theme a light and a dark version

PlanaVista (Clean Light and Deep Dark together), Minimal, and Vibrant
each have both versions. Colors chosen for the light version get a
matching dark one of the same hue, and every version is checked to read.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 5: Light or Dark at any moment, and the changes Appearance makes

**Files:**
- Create: `src/core/appearance.ts`, `test/appearance.test.ts` (reads Task 1's `tests/fixtures/appearance_cases.json`)
- Create: `src/core/appearance-edits.ts`, `test/appearance-edits.test.ts`

**Interfaces:**
- Consumes: Task 4's `Look`, `Mode`, `ThemeColors`, `ThemePair`, `ThemeShape` (types only); Task 1's fixture.
- Produces (`src/core/appearance.ts`):
  - types `AppearanceMode`, `AppearanceSwitch`, `MotionSetting`, `AppearanceSettings` (the nine keys), `SunState { state; next_rising?; next_setting? }`, `ModeContext { now; sun?; haDark? }`, `ResolvedMode { mode; next: Date | null; sunMissing }`, `TransitionKind` (`'none' | 'fade' | 'dusk' | 'dawn' | 'reveal'`), `TransitionContext`;
  - constants `MODES`, `SWITCHES`, `PAIRS`, `MOTIONS`, the label maps `MODE_LABELS`, `PAIR_LABELS`, `SWITCH_LABELS`, `MOTION_LABELS`, and `QUIET_MS = 10_000`;
  - functions `appearanceSettings(display)`, `withCardTheme(settings, cardTheme)`, `lookOf(settings) -> Look`, `nextAt(now, minutes)`, `scheduleMode(settings, now)`, `resolveMode(settings, ctx)`, `clockText(date, format)`, `sunSummary(sun, now, format)`, `appearanceSummary(settings)`, `mayAutoSwitch(now, lastInteraction, overlayOpen)`, `transitionKind(ctx)`.
- Produces (`src/core/appearance-edits.ts`): `AppearanceChange = Partial<AppearanceSettings>`, `SendAppearance`, `TapPoint { x; y }`, constants `SAVE_DELAY_MS = 400`, `SETTLE_MS = 5000`, `TAP_MS = 3000`, `sameValue(a, b)`, and `class AppearanceEdits(changed?)` with `current(saved)`, `reconcile(saved)`, `set(changes, send, onError, point?)`, `takeTap(now?)`, `flush()`, and `subscribe(listener) -> () => void` (a page showing the settings re-renders when they change, a dropped change included).

- [ ] **Step 1: Write the failing tests**

Create `test/appearance.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AppearanceSettings,
  appearanceSettings,
  appearanceSummary,
  clockText,
  mayAutoSwitch,
  resolveMode,
  sunSummary,
  transitionKind,
  withCardTheme,
} from '../src/core/appearance';

// Shared with the backend's tests/test_appearance.py.
const FIXTURE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/appearance_cases.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ name: string; display: Record<string, unknown>; settings: AppearanceSettings }>;
};

const DEFAULTS = appearanceSettings({});
const auto = (changes: Partial<AppearanceSettings>): AppearanceSettings => ({ ...DEFAULTS, appearance: 'automatic', ...changes });
// Tuesday, October 13, 2026, America/Chicago (UTC-5 until November 1).
const at = (h: number, m = 0, day = 13, month = 9) => new Date(2026, month, day, h, m);
const DAY = { state: 'above_horizon', next_setting: '2026-10-13T23:31:00+00:00', next_rising: '2026-10-14T12:12:00+00:00' };
const NIGHT = { state: 'below_horizon', next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-14T23:30:00+00:00' };

describe('appearanceSettings', () => {
  it.each(FIXTURE.cases.map(c => [c.name, c] as const))('%s', (_name, c) => {
    expect(appearanceSettings(c.display)).toEqual(c.settings);
  });

  it('starts a display with nothing saved on PlanaVista Light', () => {
    expect(appearanceSettings(undefined)).toEqual(appearanceSettings({ theme: 'planavista' }));
    expect(DEFAULTS.appearance).toBe('light');
  });
});

describe('withCardTheme', () => {
  it('keeps 1.1.0 card themes: light and dark fix the mode, names pick the theme', () => {
    const household = auto({ theme_pair: 'minimal' });
    expect(withCardTheme(household, 'dark')).toMatchObject({ theme_pair: 'planavista', appearance: 'dark' });
    expect(withCardTheme(household, 'light')).toMatchObject({ theme_pair: 'planavista', appearance: 'light' });
    expect(withCardTheme(household, 'modern')).toMatchObject({ theme_pair: 'vibrant', appearance: 'automatic' });
    expect(withCardTheme(household, 'planavista')).toMatchObject({ theme_pair: 'planavista', appearance: 'automatic' });
    expect(withCardTheme(household, undefined)).toBe(household);
    expect(withCardTheme(household, 'sepia')).toBe(household);
  });
});

describe('resolveMode', () => {
  it('shows Light and Dark as they are', () => {
    expect(resolveMode({ ...DEFAULTS, appearance: 'dark' }, { now: at(12) })).toEqual({ mode: 'dark', next: null, sunMissing: false });
  });

  it('follows the sun: light until sunset, dark until sunrise', () => {
    expect(resolveMode(auto({}), { now: at(16, 10), sun: DAY })).toEqual({
      mode: 'light', next: new Date('2026-10-13T23:31:00Z'), sunMissing: false,
    });
    expect(resolveMode(auto({}), { now: at(19), sun: NIGHT })).toEqual({
      mode: 'dark', next: new Date('2026-10-14T12:12:00Z'), sunMissing: false,
    });
  });

  it('uses the schedule times when Home Assistant has no sun (spec 15.4)', () => {
    expect(resolveMode(auto({}), { now: at(22), sun: null })).toMatchObject({ mode: 'dark', sunMissing: true });
    expect(resolveMode(auto({}), { now: at(22), sun: { state: 'unavailable' } })).toMatchObject({ mode: 'dark', sunMissing: true });
  });

  it('follows the schedule, either way round midnight', () => {
    const schedule = auto({ appearance_switch: 'schedule', light_from: '07:00', dark_from: '21:00' });
    expect(resolveMode(schedule, { now: at(6, 59) })).toEqual({ mode: 'dark', next: at(7), sunMissing: false });
    expect(resolveMode(schedule, { now: at(7) })).toEqual({ mode: 'light', next: at(21), sunMissing: false });
    expect(resolveMode(schedule, { now: at(21, 30) })).toEqual({ mode: 'dark', next: at(7, 0, 14), sunMissing: false });
    const night = auto({ appearance_switch: 'schedule', light_from: '19:00', dark_from: '06:00' });
    expect(resolveMode(night, { now: at(5) }).mode).toBe('light');
    expect(resolveMode(night, { now: at(12) }).mode).toBe('dark');
    expect(resolveMode(auto({ appearance_switch: 'schedule', light_from: '08:00', dark_from: '08:00' }), { now: at(3) }))
      .toEqual({ mode: 'light', next: null, sunMissing: false });
  });

  it('finds the next schedule time across the end of daylight saving time', () => {
    const schedule = auto({ appearance_switch: 'schedule' });
    const next = resolveMode(schedule, { now: at(22, 0, 31) }).next!;
    expect([next.getMonth(), next.getDate(), next.getHours(), next.getMinutes()]).toEqual([10, 1, 7, 0]);
  });

  it('matches this screen Home Assistant theme', () => {
    const match = auto({ appearance_switch: 'home_assistant' });
    expect(resolveMode(match, { now: at(12), haDark: true }).mode).toBe('dark');
    expect(resolveMode(match, { now: at(12), haDark: false }).mode).toBe('light');
  });
});

describe('words', () => {
  it('writes times without the browser narrow spaces', () => {
    expect(clockText(at(18, 31), '12h')).toBe('6:31 PM');
    expect(clockText(at(0, 5), '12h')).toBe('12:05 AM');
    expect(clockText(at(0, 5), '24h')).toBe('00:05');
  });

  it('says when the next sunset and sunrise come', () => {
    expect(sunSummary(DAY, at(16, 10), '12h')).toBe('Dark at 6:31 PM tonight, light again at 7:12 AM.');
    expect(sunSummary(NIGHT, at(19), '12h')).toBe('Light at 7:12 AM, dark again at 6:30 PM.');
    expect(sunSummary(null, at(19), '12h')).toBeNull();
  });

  it('sums up the Appearance row', () => {
    expect(appearanceSummary(auto({ theme_pair: 'minimal' }))).toBe('Automatic · Minimal');
  });
});

describe('mayAutoSwitch', () => {
  it('waits for ten quiet seconds and no open sheet', () => {
    expect(mayAutoSwitch(19_999, 10_000, false)).toBe(false);
    expect(mayAutoSwitch(20_000, 10_000, false)).toBe(true);
    expect(mayAutoSwitch(60_000, 10_000, true)).toBe(false);
  });
});

describe('transitionKind', () => {
  const base = { from: 'light' as const, to: 'dark' as const, byHand: false, hidden: false, reducedMotion: false, supported: true };
  it('lets night fall, day rise, and a tap spread from the finger', () => {
    expect(transitionKind(base)).toBe('dusk');
    expect(transitionKind({ ...base, from: 'dark', to: 'light' })).toBe('dawn');
    expect(transitionKind({ ...base, byHand: true })).toBe('reveal');
  });

  it('fades with reduced motion, and just switches when nobody could watch it', () => {
    expect(transitionKind({ ...base, reducedMotion: true, byHand: true })).toBe('fade');
    expect(transitionKind({ ...base, from: null })).toBe('none');
    expect(transitionKind({ ...base, hidden: true })).toBe('none');
    expect(transitionKind({ ...base, supported: false })).toBe('none');
    expect(transitionKind({ ...base, to: 'light' })).toBe('none');
  });
});
```

Create `test/appearance-edits.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appearanceSettings } from '../src/core/appearance';
import { AppearanceEdits, SAVE_DELAY_MS, SETTLE_MS, sameValue } from '../src/core/appearance-edits';

const SAVED = appearanceSettings({});

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('sameValue', () => {
  it('compares objects whatever their key order', () => {
    expect(sameValue({ accent: '#111111', header: 'plain' }, { header: 'plain', accent: '#111111' })).toBe(true);
    expect(sameValue({ accent: '#111111' }, { accent: '#222222' })).toBe(false);
    expect(sameValue('dark', 'dark')).toBe(true);
  });
});

describe('AppearanceEdits', () => {
  it('shows a tap at once and saves the taps together after a quiet moment', async () => {
    const changed = vi.fn();
    const send = vi.fn().mockResolvedValue(undefined);
    const edits = new AppearanceEdits(changed);
    edits.set({ appearance: 'dark' }, send, () => {});
    edits.set({ theme_pair: 'minimal' }, send, () => {});
    expect(edits.current(SAVED)).toMatchObject({ appearance: 'dark', theme_pair: 'minimal' });
    expect(changed).toHaveBeenCalledTimes(2);
    expect(send).not.toHaveBeenCalled();
    vi.advanceTimersByTime(SAVE_DELAY_MS);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ appearance: 'dark', theme_pair: 'minimal' });
  });

  it('keeps showing a change until Home Assistant shows it back', async () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {});
    edits.flush();
    await settle();
    edits.reconcile(SAVED); // the old value is still in the sensor
    expect(edits.current(SAVED).appearance).toBe('dark');
    edits.reconcile({ ...SAVED, appearance: 'dark' });
    expect(edits.current(SAVED).appearance).toBe('light');
  });

  it('lets go of a saved change after a few seconds if it never shows back', async () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {});
    edits.flush();
    await settle();
    vi.advanceTimersByTime(SETTLE_MS);
    expect(edits.current(SAVED).appearance).toBe('light');
  });

  it('drops a change whose save failed, and says so', async () => {
    const onError = vi.fn();
    const edits = new AppearanceEdits();
    edits.set({ motion: 'reduced' }, vi.fn().mockRejectedValue(new Error('offline')), onError);
    edits.flush();
    await settle();
    expect(edits.current(SAVED).motion).toBe('device');
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('keeps a newer change when an older save of the same setting fails', async () => {
    let fail: (err: unknown) => void = () => {};
    const send = vi.fn().mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }))
      .mockResolvedValue(undefined);
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, send, () => {});
    edits.flush();
    edits.set({ appearance: 'automatic' }, send, () => {});
    fail(new Error('offline'));
    await settle();
    expect(edits.current(SAVED).appearance).toBe('automatic');
  });

  it('remembers where the finger was for a few seconds, once', () => {
    const edits = new AppearanceEdits();
    edits.set({ appearance: 'dark' }, vi.fn().mockResolvedValue(undefined), () => {}, { x: 40, y: 300 });
    expect(edits.takeTap()).toEqual({ x: 40, y: 300 });
    expect(edits.takeTap()).toBeNull();
    edits.set({ appearance: 'light' }, vi.fn().mockResolvedValue(undefined), () => {}, { x: 1, y: 2 });
    expect(edits.takeTap(Date.now() + 5000)).toBeNull();
  });

  it('tells the pages showing the settings, until they stop listening', async () => {
    const page = vi.fn();
    const edits = new AppearanceEdits();
    const stop = edits.subscribe(page);
    edits.set({ appearance: 'dark' }, vi.fn().mockRejectedValue(new Error('offline')), () => {});
    expect(page).toHaveBeenCalledTimes(1);
    edits.flush();
    await settle();
    expect(page).toHaveBeenCalledTimes(2); // the failed change was dropped
    stop();
    edits.set({ appearance: 'light' }, vi.fn().mockResolvedValue(undefined), () => {});
    expect(page).toHaveBeenCalledTimes(2);
  });
});
```

Run: `npm test -- appearance`
Expected: both files fail to resolve `../src/core/appearance` and `../src/core/appearance-edits`.

- [ ] **Step 2: Create `src/core/appearance.ts`**

```ts
import type { Look, Mode, ThemeColors, ThemePair, ThemeShape } from '../styles/theme-pairs';

/** Light, Dark, or Automatic (spec 12.4); the household's choice. */
export type AppearanceMode = 'light' | 'dark' | 'automatic';
/** When Automatic switches. */
export type AppearanceSwitch = 'sun' | 'schedule' | 'home_assistant';
/** PlanaVista's Motion setting (spec 11.5). */
export type MotionSetting = 'device' | 'full' | 'reduced';

/** Every appearance setting, as the display keys save them. */
export interface AppearanceSettings {
  appearance: AppearanceMode;
  appearance_switch: AppearanceSwitch;
  /** "HH:MM", 24-hour. */
  light_from: string;
  dark_from: string;
  theme_pair: ThemePair;
  colors_light: ThemeColors;
  colors_dark: ThemeColors;
  shape: ThemeShape;
  motion: MotionSetting;
}

export const MODES: AppearanceMode[] = ['light', 'dark', 'automatic'];
export const SWITCHES: AppearanceSwitch[] = ['sun', 'schedule', 'home_assistant'];
export const PAIRS: ThemePair[] = ['planavista', 'minimal', 'vibrant'];
export const MOTIONS: MotionSetting[] = ['device', 'full', 'reduced'];

export const MODE_LABELS: Record<AppearanceMode, string> = { light: 'Light', dark: 'Dark', automatic: 'Automatic' };
export const PAIR_LABELS: Record<ThemePair, string> = { planavista: 'PlanaVista', minimal: 'Minimal', vibrant: 'Vibrant' };
export const SWITCH_LABELS: Record<AppearanceSwitch, string> = {
  sun: 'At sunset and sunrise',
  schedule: 'On a schedule',
  home_assistant: 'Match Home Assistant',
};
export const MOTION_LABELS: Record<MotionSetting, string> = { device: 'Follow the device', full: 'Full', reduced: 'Reduced' };

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 1.1.0's theme keys and the theme and mode each becomes (spec 12.4). */
const LEGACY_THEMES: Record<string, [ThemePair, 'light' | 'dark']> = {
  planavista: ['planavista', 'light'],
  light: ['planavista', 'light'],
  dark: ['planavista', 'dark'],
  minimal: ['minimal', 'light'],
  modern: ['vibrant', 'light'],
  vibrant: ['vibrant', 'light'],
};

type Display = Record<string, unknown>;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clock(value: unknown, fallback: string): string {
  return typeof value === 'string' && CLOCK.test(value) ? value : fallback;
}

function record(value: unknown): Record<string, string> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as Record<string, string>) } : null;
}

function legacyColors(overrides: Record<string, string>): ThemeColors {
  const colors: ThemeColors = {};
  for (const key of ['accent', 'background', 'now_color'] as const) {
    if (overrides[key]) colors[key] = overrides[key];
  }
  const style = overrides.header_style;
  if (style === 'custom') {
    if (overrides.header_custom) colors.header = overrides.header_custom;
  } else if (style) {
    colors.header = style;
  }
  return colors;
}

function legacyShape(overrides: Record<string, string>): ThemeShape {
  const shape: Record<string, string> = {};
  for (const key of ['corner_style', 'shadow_depth', 'event_style', 'avatar_border']) {
    if (overrides[key]) shape[key] = overrides[key];
  }
  if (shape.avatar_border === 'light') shape.avatar_border = 'white';
  return shape as ThemeShape;
}

/**
 * The appearance settings from a saved display: the new keys, or where one
 * is missing, what 1.1.0's theme and theme_overrides mean. The same rule as
 * appearance_settings in appearance.py (tests/fixtures/appearance_cases.json).
 */
export function appearanceSettings(display: Display | undefined | null): AppearanceSettings {
  const d = display ?? {};
  const legacy = typeof d.theme === 'string' && d.theme ? d.theme : 'planavista';
  const [pair, mode] = LEGACY_THEMES[legacy] ?? LEGACY_THEMES.planavista;
  const overrides = record(d.theme_overrides) ?? {};
  const colors = legacyColors(overrides);
  const light = record(d.colors_light);
  const dark = record(d.colors_dark);
  const shape = record(d.shape);
  return {
    appearance: pick(d.appearance, MODES, mode),
    appearance_switch: pick(d.appearance_switch, SWITCHES, 'sun'),
    light_from: clock(d.light_from, '07:00'),
    dark_from: clock(d.dark_from, '21:00'),
    theme_pair: pick(d.theme_pair, PAIRS, pair),
    colors_light: light ?? (legacy === 'dark' ? {} : colors),
    colors_dark: dark ?? (legacy === 'dark' ? colors : {}),
    shape: (shape as ThemeShape | null) ?? legacyShape(overrides),
    motion: pick(d.motion, MOTIONS, 'device'),
  };
}

/**
 * A card's own `theme` option keeps its 1.1.0 meaning: `light` and `dark`
 * fix the card to PlanaVista Light or Dark; a theme name picks the theme
 * and follows the household's Light, Dark, or Automatic.
 */
export function withCardTheme(settings: AppearanceSettings, cardTheme: string | undefined): AppearanceSettings {
  switch (cardTheme) {
    case 'light':
    case 'dark':
      return { ...settings, theme_pair: 'planavista', appearance: cardTheme };
    case 'planavista':
    case 'minimal':
      return { ...settings, theme_pair: cardTheme };
    case 'vibrant':
    case 'modern':
      return { ...settings, theme_pair: 'vibrant' };
    default:
      return settings;
  }
}

/** The theme and colors to draw, apart from the mode. */
export function lookOf(settings: AppearanceSettings): Look {
  return { pair: settings.theme_pair, light: settings.colors_light, dark: settings.colors_dark, shape: settings.shape };
}

/** sun.sun as the card sees it: its state and the next sunrise and sunset. */
export interface SunState {
  state: string;
  next_rising?: string;
  next_setting?: string;
}

export interface ModeContext {
  now: Date;
  /** hass.states['sun.sun'] (state and attributes), or null when Home Assistant has none. */
  sun?: SunState | null;
  /** This screen's Home Assistant dark mode (hass.themes.darkMode). */
  haDark?: boolean;
}

export interface ResolvedMode {
  mode: Mode;
  /** When the mode changes next by itself (a sunrise, sunset, or schedule time); null when it won't. */
  next: Date | null;
  /** Automatic follows the sun, but Home Assistant has no sun.sun, so the schedule decides (spec 15.4). */
  sunMissing: boolean;
}

function minutesOf(value: string): number {
  const match = CLOCK.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

/** The first moment after `now` that is `minutes` past local midnight (today or tomorrow). */
export function nextAt(now: Date, minutes: number): Date {
  const next = new Date(now);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
    next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  }
  return next;
}

/** On a schedule: light from one time, dark from the other, either way round midnight. */
export function scheduleMode(settings: AppearanceSettings, now: Date): { mode: Mode; next: Date | null } {
  const light = minutesOf(settings.light_from);
  const dark = minutesOf(settings.dark_from);
  if (light === dark) return { mode: 'light', next: null };
  const t = now.getHours() * 60 + now.getMinutes();
  const isLight = light < dark ? t >= light && t < dark : t >= light || t < dark;
  return { mode: isLight ? 'light' : 'dark', next: nextAt(now, isLight ? dark : light) };
}

function sunDate(value: string | undefined, now: Date): Date | null {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) && date.getTime() > now.getTime() ? date : null;
}

/** Light or dark right now, and when that changes next (spec 12.4). */
export function resolveMode(settings: AppearanceSettings, ctx: ModeContext): ResolvedMode {
  if (settings.appearance !== 'automatic') return { mode: settings.appearance, next: null, sunMissing: false };
  if (settings.appearance_switch === 'home_assistant') {
    return { mode: ctx.haDark ? 'dark' : 'light', next: null, sunMissing: false };
  }
  if (settings.appearance_switch === 'sun') {
    const sun = ctx.sun;
    if (sun && (sun.state === 'above_horizon' || sun.state === 'below_horizon')) {
      const dark = sun.state === 'below_horizon';
      return { mode: dark ? 'dark' : 'light', next: sunDate(dark ? sun.next_rising : sun.next_setting, ctx.now), sunMissing: false };
    }
    return { ...scheduleMode(settings, ctx.now), sunMissing: true };
  }
  return { ...scheduleMode(settings, ctx.now), sunMissing: false };
}

/** "6:31 PM" or "18:31" (spaces only, whatever the browser's ICU does). */
export function clockText(date: Date, format: '12h' | '24h'): string {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (format === '24h') return `${String(date.getHours()).padStart(2, '0')}:${minutes}`;
  return `${date.getHours() % 12 || 12}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * The line under "At sunset and sunrise": "Dark at 6:31 PM tonight, light
 * again at 7:12 AM." (or the other way round after sunset). Null without
 * the sun's times.
 */
export function sunSummary(sun: SunState | null | undefined, now: Date, format: '12h' | '24h'): string | null {
  if (!sun) return null;
  const rising = sunDate(sun.next_rising, now);
  const setting = sunDate(sun.next_setting, now);
  if (!rising || !setting) return null;
  if (sun.state === 'below_horizon') {
    return `Light at ${clockText(rising, format)}, dark again at ${clockText(setting, format)}.`;
  }
  const tonight = sameDay(setting, now) ? ' tonight' : '';
  return `Dark at ${clockText(setting, format)}${tonight}, light again at ${clockText(rising, format)}.`;
}

/** The Appearance row in Settings: "Automatic · PlanaVista". */
export function appearanceSummary(settings: AppearanceSettings): string {
  return `${MODE_LABELS[settings.appearance]} · ${PAIR_LABELS[settings.theme_pair]}`;
}

/** An automatic change waits until nobody has touched the screen for this long (spec 12.4). */
export const QUIET_MS = 10_000;

/** May an automatic change play now? Not mid-touch, and not while a sheet is open. */
export function mayAutoSwitch(now: number, lastInteraction: number, overlayOpen: boolean): boolean {
  return !overlayOpen && now - lastInteraction >= QUIET_MS;
}

export type TransitionKind = 'none' | 'fade' | 'dusk' | 'dawn' | 'reveal';

export interface TransitionContext {
  /** The mode on screen; null before the first one is drawn. */
  from: Mode | null;
  to: Mode;
  /** Tapped on this screen (a change from anywhere else counts as automatic). */
  byHand: boolean;
  /** The page is hidden (a sleeping tablet). */
  hidden: boolean;
  reducedMotion: boolean;
  /** The browser has View Transitions. */
  supported: boolean;
}

/**
 * How the change between light and dark looks (spec 12.4): night falls
 * from the top, day rises from the bottom, a tap spreads from the finger,
 * reduced motion fades, and a first draw, a hidden page, or a browser
 * without View Transitions just switches.
 */
export function transitionKind(c: TransitionContext): TransitionKind {
  if (c.from === null || c.from === c.to || c.hidden || !c.supported) return 'none';
  if (c.reducedMotion) return 'fade';
  if (c.byHand) return 'reveal';
  return c.to === 'dark' ? 'dusk' : 'dawn';
}
```

- [ ] **Step 3: Create `src/core/appearance-edits.ts`**

```ts
import type { AppearanceSettings } from './appearance';

export type AppearanceChange = Partial<AppearanceSettings>;
export type SendAppearance = (changes: AppearanceChange) => Promise<unknown>;

/** Quiet time after the last tap before the changes are saved. */
export const SAVE_DELAY_MS = 400;
/** How long a saved change keeps showing while Home Assistant's copy catches up. */
export const SETTLE_MS = 5000;
/** A tap this recent turns the next light or dark change into a reveal from the finger. */
export const TAP_MS = 3000;

export interface TapPoint {
  x: number;
  y: number;
}

/** Equal values, objects compared key by key whatever their order. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  return ka.length === kb.length && ka.every(k => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/**
 * Appearance changes made in Settings or setup that Home Assistant hasn't
 * shown back yet (spec 14.1: Appearance applies as you tap). The card draws
 * current(saved), so a change shows at once and doesn't flicker back while
 * its save travels; a failed save drops it again. One per card, shared by
 * the Appearance page, Customize, and setup's Look step through the card's
 * drafts.
 */
export class AppearanceEdits {
  private _pending: AppearanceChange = {};
  private _unsent: AppearanceChange = {};
  private _timer: ReturnType<typeof setTimeout> | undefined;
  private _send: SendAppearance | null = null;
  private _onError: ((err: unknown) => void) | null = null;
  private _tap: (TapPoint & { at: number }) | null = null;
  private readonly _listeners = new Set<() => void>();

  /** `changed` runs whenever current() may differ (the card re-renders). */
  constructor(private readonly _changed: () => void = () => {}) {}

  /** Also tell `listener` whenever current() may differ (a page showing the settings); returns a function that stops. */
  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _notify(): void {
    this._changed();
    for (const listener of this._listeners) listener();
  }

  /** The settings to draw: the saved ones with the changes still on their way. */
  current(saved: AppearanceSettings): AppearanceSettings {
    return { ...saved, ...this._pending };
  }

  /** Forget changes the saved settings show now. */
  reconcile(saved: AppearanceSettings): void {
    for (const key of Object.keys(this._pending) as Array<keyof AppearanceSettings>) {
      if (!(key in this._unsent) && sameValue(saved[key], this._pending[key])) delete this._pending[key];
    }
  }

  /** A tap changed these settings; they save after a quiet moment. `point` is where the finger was. */
  set(changes: AppearanceChange, send: SendAppearance, onError: (err: unknown) => void, point?: TapPoint): void {
    Object.assign(this._pending, changes);
    Object.assign(this._unsent, changes);
    this._send = send;
    this._onError = onError;
    if (point) this._tap = { ...point, at: Date.now() };
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), SAVE_DELAY_MS);
    this._notify();
  }

  /** The finger's point when a tap happened in the last few seconds, once. */
  takeTap(now = Date.now()): TapPoint | null {
    const tap = this._tap;
    this._tap = null;
    return tap && now - tap.at <= TAP_MS ? { x: tap.x, y: tap.y } : null;
  }

  /** Save what's waiting now (a page closing). */
  flush(): void {
    clearTimeout(this._timer);
    this._timer = undefined;
    const changes = this._unsent;
    const send = this._send;
    if (!send || Object.keys(changes).length === 0) return;
    this._unsent = {};
    const onError = this._onError;
    const drop = () => {
      for (const key of Object.keys(changes) as Array<keyof AppearanceSettings>) {
        // A newer change to the same setting stays.
        if (!(key in this._unsent) && sameValue(this._pending[key], changes[key])) delete this._pending[key];
      }
      this._notify();
    };
    send(changes).then(
      () => setTimeout(drop, SETTLE_MS),
      err => {
        drop();
        onError?.(err);
      },
    );
  }
}
```

Run: `npm test -- appearance`
Expected: `31 passed` (23 and 8).

- [ ] **Step 4: Run the checks**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; `284 passed`.

- [ ] **Step 5: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/appearance.ts test/appearance.test.ts src/core/appearance-edits.ts test/appearance-edits.test.ts
git commit -F - <<'EOF'
feat(frontend): work out light or dark from the sun, a schedule, or Home Assistant

The card reads the appearance settings the same way the backend does,
decides light or dark for any moment and when that changes next, and
chooses how the change looks: night falling, day rising, a reveal from
the finger, a fade, or just a switch for a screen nobody is watching.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 6: Motion helpers: springs, the hold gesture, and dragging a sheet

**Files:**
- Create: `src/core/motion.ts`, `src/core/hold.ts`, `src/core/sheet-drag.ts`, `test/motion.test.ts`

These follow the approved motion prototype (`motion-hold.html`, spec 11.5). The hold gesture is first used by the board in milestone 5; the sheets use the rest in Task 12.

**Interfaces:**
- Produces (`src/core/motion.ts`): `interface Spring { easing; duration }`, `spring(response, damping, samples = 50)`, presets `SMOOTH` (639 ms), `BOUNCY` (900 ms), `GENTLE` (733 ms), `supportsLinearEasing()`, `springEasing(spring, linear?)`, types `MotionSetting` (`'device' | 'full' | 'reduced'`) and `Motion` (`'full' | 'reduced'`), `resolveMotion(setting, deviceReduced) -> Motion`.
- Produces (`src/core/hold.ts`): `HOLD_MS = 550`, `MOVE_CANCEL_PX = 12`, `TAP_MS = 200`, `interface HoldCallbacks { progress(fill); complete(); rewind(fill); tap() }`, `class HoldGesture(callbacks, holdMs?)` with `holding`, `down(x, y, t)`, `frame(t)`, `move(x, y)`, `up(t)`, `cancel()`, `key(key) -> boolean`.
- Produces (`src/core/sheet-drag.ts`): `DISMISS_PX = 90`, `DISMISS_SPEED = 0.6`, `sheetDragOffset(dy)`, `sheetDragOutcome(dy, ms) -> 'close' | 'settle'`.

- [ ] **Step 1: Write the failing test**

Create `test/motion.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { BOUNCY, GENTLE, SMOOTH, resolveMotion, spring, springEasing } from '../src/core/motion';
import { HOLD_MS, HoldGesture } from '../src/core/hold';
import { sheetDragOffset, sheetDragOutcome } from '../src/core/sheet-drag';

function points(easing: string): number[] {
  return easing.slice('linear('.length, -1).split(',').map(Number);
}

describe('spring', () => {
  it('samples the spring into linear() easing that starts at 0 and ends at 1', () => {
    const p = points(SMOOTH.easing);
    expect(p).toHaveLength(51);
    expect(p[0]).toBe(0);
    expect(p[50]).toBe(1);
  });

  it('settles in the approved times', () => {
    expect(SMOOTH.duration).toBe(639);
    expect(BOUNCY.duration).toBe(900);
    expect(GENTLE.duration).toBe(733);
  });

  it('overshoots when bouncy and barely when smooth', () => {
    expect(Math.max(...points(BOUNCY.easing))).toBeGreaterThan(1.1);
    expect(Math.max(...points(SMOOTH.easing))).toBeLessThan(1.01);
  });

  it('survives a damping of 1 or more', () => {
    expect(points(spring(0.5, 1).easing).every(Number.isFinite)).toBe(true);
  });

  it('falls back to a curve of the same length without linear()', () => {
    expect(springEasing(SMOOTH, false)).toEqual({ easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', duration: 639 });
    expect(springEasing(SMOOTH, true)).toBe(SMOOTH);
  });
});

describe('resolveMotion', () => {
  it('lets PlanaVista overrule the device, or follow it', () => {
    expect(resolveMotion('reduced', false)).toBe('reduced');
    expect(resolveMotion('full', true)).toBe('full');
    expect(resolveMotion('device', true)).toBe('reduced');
    expect(resolveMotion('device', false)).toBe('full');
    expect(resolveMotion(undefined, false)).toBe('full');
  });
});

describe('HoldGesture', () => {
  function gesture() {
    const calls = { progress: vi.fn(), complete: vi.fn(), rewind: vi.fn(), tap: vi.fn() };
    return { calls, hold: new HoldGesture(calls) };
  }

  it('fills over 550 ms and completes once', () => {
    const { calls, hold } = gesture();
    hold.down(10, 10, 1000);
    hold.frame(1000 + HOLD_MS / 2);
    expect(calls.progress).toHaveBeenLastCalledWith(0.5);
    hold.frame(1000 + HOLD_MS);
    hold.frame(1000 + HOLD_MS + 16);
    expect(calls.complete).toHaveBeenCalledTimes(1);
    expect(hold.holding).toBe(false);
  });

  it('rewinds when let go early, from the fill it reached', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.frame(275);
    hold.up(300);
    expect(calls.rewind).toHaveBeenCalledWith(0.5);
    expect(calls.complete).not.toHaveBeenCalled();
    expect(calls.tap).not.toHaveBeenCalled();
  });

  it('treats a quick press as a tap', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.up(150);
    expect(calls.tap).toHaveBeenCalledTimes(1);
  });

  it('hands a move of more than 12 px back to the page, without a tap', () => {
    const { calls, hold } = gesture();
    hold.down(0, 0, 0);
    hold.move(12, 0);
    expect(hold.holding).toBe(true);
    hold.move(9, 9);
    expect(hold.holding).toBe(false);
    expect(calls.rewind).toHaveBeenCalledTimes(1);
    hold.up(50);
    expect(calls.tap).not.toHaveBeenCalled();
  });

  it('completes at once from the keyboard', () => {
    const { calls, hold } = gesture();
    expect(hold.key('Tab')).toBe(false);
    expect(hold.key(' ')).toBe(true);
    expect(calls.complete).toHaveBeenCalledTimes(1);
  });
});

describe('sheet drag', () => {
  it('follows the finger down only', () => {
    expect(sheetDragOffset(40)).toBe(40);
    expect(sheetDragOffset(-30)).toBe(0);
  });

  it('closes when dragged past 90 px or flicked, and settles otherwise', () => {
    expect(sheetDragOutcome(91, 1000)).toBe('close');
    expect(sheetDragOutcome(40, 50)).toBe('close');
    expect(sheetDragOutcome(60, 400)).toBe('settle');
    expect(sheetDragOutcome(-200, 50)).toBe('settle');
  });
});
```

Run: `npm test -- motion`
Expected: `Failed to resolve import "../src/core/motion"`.

- [ ] **Step 2: Create `src/core/motion.ts`**

```ts
/** Motion is part of the product (spec 11.5): springs, not timers. */

export interface Spring {
  /** CSS linear() easing, for element.animate() or a transition. */
  easing: string;
  /** Milliseconds until the spring settles within 0.1 percent. */
  duration: number;
}

/**
 * A damped spring sampled into CSS linear() easing, with SwiftUI's
 * parameters: `response` is the period in seconds and `damping` the damping
 * ratio (below 1 it overshoots). The curve ends exactly at 1.
 */
export function spring(response: number, damping: number, samples = 50): Spring {
  const z = Math.min(0.999, Math.max(0.05, damping));
  const w = (2 * Math.PI) / response;
  const wd = w * Math.sqrt(1 - z * z);
  const settle = Math.log(1000) / (z * w);
  const points: string[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (settle * i) / samples;
    const value = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    points.push(value.toFixed(4));
  }
  points.push('1');
  return { easing: `linear(${points.join(', ')})`, duration: Math.round(settle * 1000) };
}

/** Glides (sheets, rows moving to Done). */
export const SMOOTH = spring(0.5, 0.86);
/** Pops (a check, a badge). */
export const BOUNCY = spring(0.45, 0.55);
/** Large moves (a ring filling). */
export const GENTLE = spring(0.6, 0.9);

/** For browsers without linear(): the same length on a smooth curve. */
const FALLBACK_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** Whether this browser draws CSS linear() easing. */
export function supportsLinearEasing(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timing-function', 'linear(0, 1)');
}

/** A spring this browser can draw. */
export function springEasing(s: Spring, linear = supportsLinearEasing()): Spring {
  return linear ? s : { easing: FALLBACK_EASING, duration: s.duration };
}

export type MotionSetting = 'device' | 'full' | 'reduced';
export type Motion = 'full' | 'reduced';

/**
 * Full or reduced motion: PlanaVista's Motion setting, or the device's when
 * it says Follow the device (spec 11.5; kiosk tablets often hide theirs).
 */
export function resolveMotion(setting: MotionSetting | undefined, deviceReduced: boolean): Motion {
  if (setting === 'full' || setting === 'reduced') return setting;
  return deviceReduced ? 'reduced' : 'full';
}
```

- [ ] **Step 3: Create `src/core/hold.ts`**

```ts
/**
 * Hold to complete (spec 11.5): the ring fills at a steady rate over 550 ms
 * while the finger stays down, and rewinds on an early release or a move of
 * more than 12 px, which hands an intended scroll back to the page. A quick
 * press is a tap. Space or Enter completes at once. The element supplies
 * pointer events, animation frames, and pointer capture; this decides.
 */

export const HOLD_MS = 550;
export const MOVE_CANCEL_PX = 12;
export const TAP_MS = 200;

export interface HoldCallbacks {
  /** Fill reached, 0 to 1, each frame while held. */
  progress(fill: number): void;
  /** Held the whole way (or Space or Enter). */
  complete(): void;
  /** Let go early or moved: rewind from the fill reached. */
  rewind(fill: number): void;
  /** A quick press that didn't move. */
  tap(): void;
}

export class HoldGesture {
  private _start: { x: number; y: number; t: number } | null = null;
  private _fill = 0;

  constructor(
    private readonly _callbacks: HoldCallbacks,
    private readonly _holdMs = HOLD_MS,
  ) {}

  /** A finger is down and the hold hasn't finished. */
  get holding(): boolean {
    return this._start !== null;
  }

  down(x: number, y: number, t: number): void {
    this._start = { x, y, t };
    this._fill = 0;
    this._callbacks.progress(0);
  }

  /** An animation frame at time `t` (the same clock as `down`). */
  frame(t: number): void {
    if (!this._start) return;
    this._fill = Math.min(1, Math.max(0, (t - this._start.t) / this._holdMs));
    this._callbacks.progress(this._fill);
    if (this._fill >= 1) {
      this._start = null;
      this._callbacks.complete();
    }
  }

  move(x: number, y: number): void {
    if (!this._start) return;
    if (Math.hypot(x - this._start.x, y - this._start.y) > MOVE_CANCEL_PX) this._stop(false);
  }

  up(t: number): void {
    if (!this._start) return;
    this._stop(t - this._start.t < TAP_MS);
  }

  /** The browser took the pointer (a scroll began, or the page lost focus). */
  cancel(): void {
    if (this._start) this._stop(false);
  }

  /** A key on the focused circle; true when it completed. */
  key(key: string): boolean {
    if (key !== ' ' && key !== 'Enter') return false;
    this._start = null;
    this._fill = 1;
    this._callbacks.progress(1);
    this._callbacks.complete();
    return true;
  }

  private _stop(tap: boolean): void {
    this._start = null;
    this._callbacks.rewind(this._fill);
    if (tap) this._callbacks.tap();
  }
}
```

- [ ] **Step 4: Create `src/core/sheet-drag.ts`**

```ts
/** Dragging a sheet down to close it (spec 12.3), as in the approved motion prototype. */

export const DISMISS_PX = 90;
/** Pixels per millisecond: a flick closes even a short drag. */
export const DISMISS_SPEED = 0.6;

/** How far the panel follows the finger: down only. */
export function sheetDragOffset(dy: number): number {
  return Math.max(0, dy);
}

/** On release: close when dragged far enough or flicked, otherwise settle back. */
export function sheetDragOutcome(dy: number, ms: number): 'close' | 'settle' {
  const distance = sheetDragOffset(dy);
  return distance > DISMISS_PX || distance / Math.max(1, ms) > DISMISS_SPEED ? 'close' : 'settle';
}
```

Run: `npm test -- motion`
Expected: `13 passed`.

- [ ] **Step 5: Run the checks and commit**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; `297 passed`.

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/motion.ts src/core/hold.ts src/core/sheet-drag.ts test/motion.test.ts
git commit -F - <<'EOF'
feat(frontend): add springs, the hold gesture, and the sheet drag rule

Springs are sampled into CSS easing with SwiftUI's parameters. Hold to
complete fills over 550 ms and hands a moving finger back to the page,
and a sheet closes when dragged far enough or flicked.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 7: The heading face, and styles that live on the page

**Files:**
- Modify: `package.json` (the pinned font package and an `npm run fonts` script; `package-lock.json` follows)
- Create: `scripts/copy-fonts.mjs` (under the frontend folder), `dist/fonts/nunito-latin-wght.woff2`, `dist/fonts/OFL.txt`
- Create: `src/shell/page-styles.ts`, `test/page-styles.test.ts`
- Modify: `src/styles/shared.ts`, `src/styles/settings.ts`, `src/styles/sheet.ts`, `src/styles/themes.ts` (the body stack loses Inter), `src/shell/planavista-card.ts` (declares the face on the page)
- Modify: `tests/test_frontend.py` (the face and its license are served)

Spec 11.2: headings and numbers use a rounded face, `ui-rounded` (SF Pro Rounded) on Apple devices and the bundled Nunito everywhere else; body text uses the system stack; no web fonts. The shell (header, bar, Settings, setup, sheets) uses it from this milestone; the calendar's own headings follow in milestone 7 (spec 17.3 row 7).

**Interfaces:**
- Consumes: Task 4's `FONT_BODY`, `FONT_HEADING`; Task 5's `TransitionKind` (type).
- Produces (`src/shell/page-styles.ts`): `HEADING_FONT = 'PlanaVista Rounded'`, `HEADING_FONT_FILE = 'fonts/nunito-latin-wght.woff2'`, `assetUrl(bundleUrl, path)`, `fontFaceCss(url)`, `ensurePageStyles(doc?, bundleUrl?)`, `setTransitionStyles(css, doc?)`, `transitionCss(names, kind)` (Task 10 uses the last two).

- [ ] **Step 1: Write the failing tests**

Create `test/page-styles.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HEADING_FONT, assetUrl, fontFaceCss, transitionCss } from '../src/shell/page-styles';

describe('page styles', () => {
  it('serve the font next to the bundle with the bundle query', () => {
    expect(assetUrl('http://ha.local:8123/planavista_panel/dist/planavista-cards.js?v=1.2.0-ab12cd34', 'fonts/nunito-latin-wght.woff2'))
      .toBe('http://ha.local:8123/planavista_panel/dist/fonts/nunito-latin-wght.woff2?v=1.2.0-ab12cd34');
  });

  it('declare the heading face with its weights', () => {
    const css = fontFaceCss('http://x/fonts/f.woff2');
    expect(css).toContain(`font-family:'${HEADING_FONT}'`);
    expect(css).toContain('font-weight:200 1000');
    expect(css).toContain('font-display:swap');
  });

  it('sweep with a mask 210 percent tall whose edge stays on screen', () => {
    const css = transitionCss(['planavista-1', 'planavista-2'], 'dusk');
    expect(css).toContain('html[data-pv-vt]::view-transition-old(planavista-1)');
    expect(css).toContain('html[data-pv-vt]::view-transition-old(planavista-2)');
    expect(css).toContain('transparent 47.6%,#000 52.4%');
    expect(css).toContain('mask-size:100% 210%');
    expect(css).toContain('to bottom');
    expect(transitionCss(['planavista-1'], 'dawn')).toContain('to top');
    expect(transitionCss(['planavista-1'], 'reveal')).toContain('::view-transition-new(planavista-1){z-index:2}');
    expect(transitionCss(['planavista-1'], 'none')).toBe('');
    expect(transitionCss([], 'dusk')).toBe('');
  });
});
```

Add to `tests/test_frontend.py`:

```python
async def test_the_heading_face_is_served_with_its_license(
    hass: HomeAssistant,
    mock_config_entry: MockConfigEntry,
    hass_client_no_auth: ClientSessionGenerator,
) -> None:
    """The rounded face ships next to the bundle, its license beside it (spec 11.2)."""
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_client_no_auth()

    font = await client.get("/planavista_panel/dist/fonts/nunito-latin-wght.woff2")
    assert font.status == 200
    assert (await font.read())[:4] == b"wOF2"
    license_text = await (await client.get("/planavista_panel/dist/fonts/OFL.txt")).text()
    assert "SIL OPEN FONT LICENSE Version 1.1" in license_text
```

Run: `npm test -- page-styles` and `bash scripts/test-backend.sh tests/test_frontend.py -q`
Expected: the vitest file fails to resolve `../src/shell/page-styles`; the new backend test fails with status 404.

- [ ] **Step 2: Bring in the font**

```bash
npm install --save-dev --save-exact @fontsource-variable/nunito@5.3.0
```

Create `scripts/copy-fonts.mjs`:

```js
// Copies the heading face and its license from the pinned npm package into
// dist/fonts (spec 11.2: a locally bundled rounded face, no web fonts). Run
// `npm run fonts` after changing the package version, and commit the result.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', '@fontsource-variable', 'nunito');
const target = join(root, 'dist', 'fonts');
mkdirSync(target, { recursive: true });
copyFileSync(join(source, 'files', 'nunito-latin-wght-normal.woff2'), join(target, 'nunito-latin-wght.woff2'));
copyFileSync(join(source, 'LICENSE'), join(target, 'OFL.txt'));
console.log('Copied Nunito (SIL Open Font License 1.1) to dist/fonts');
```

In `package.json`, add `"fonts": "node scripts/copy-fonts.mjs"` to `scripts`. Then:

```bash
npm run fonts
sha256sum dist/fonts/nunito-latin-wght.woff2
```

Expected: `Copied Nunito ...`; the hash is `ba344451eab25b217a165363b1982048a5e5830a0daf36577973955a04cac793` (39,128 bytes, one weight axis from 200 to 1000, 292 Latin glyphs).

- [ ] **Step 3: Create `src/shell/page-styles.ts`**

```ts
import type { TransitionKind } from '../core/appearance';

/** The bundled heading face's family name (spec 11.2). */
export const HEADING_FONT = 'PlanaVista Rounded';
export const HEADING_FONT_FILE = 'fonts/nunito-latin-wght.woff2';

/**
 * A file served next to the bundle, with the bundle's own query so a new
 * release fetches it again (Home Assistant serves frontend/dist without
 * cache headers, and the query changes with every bundle).
 */
export function assetUrl(bundleUrl: string, path: string): string {
  const base = new URL(bundleUrl);
  const url = new URL(path, base);
  url.search = base.search;
  return url.href;
}

/**
 * The heading face. It has to be declared on the page: browsers ignore
 * @font-face inside shadow roots. Nothing downloads it until text uses it,
 * and Apple devices use SF Pro Rounded first.
 */
export function fontFaceCss(url: string): string {
  return `@font-face{font-family:'${HEADING_FONT}';src:url('${url}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`;
}

const FONT_STYLE_ID = 'planavista-page-styles';
const TRANSITION_STYLE_ID = 'planavista-transition-styles';

/** Declare the heading face on the page, once for every card. */
export function ensurePageStyles(doc: Document = document, bundleUrl: string = import.meta.url): void {
  if (doc.getElementById(FONT_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = fontFaceCss(assetUrl(bundleUrl, HEADING_FONT_FILE));
  doc.head.appendChild(style);
}

/** Put the rules for the change about to run on the page; '' takes them away. */
export function setTransitionStyles(css: string, doc: Document = document): void {
  let style = doc.getElementById(TRANSITION_STYLE_ID) as HTMLStyleElement | null;
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = doc.createElement('style');
    style.id = TRANSITION_STYLE_ID;
    doc.head.appendChild(style);
  }
  style.textContent = css;
}

/** The sweep's edge: a mask 210 percent tall, its edge between 47.6 and 52.4 percent (spec 12.4). */
const SWEEP_MASK = (direction: 'bottom' | 'top') =>
  `linear-gradient(to ${direction},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`;

/**
 * Page-level rules for one day and night change of these cards. Shadow DOM
 * can't style the transition's pseudo-elements, so they live on the page,
 * scoped by the html[data-pv-vt] attribute that exists only while the
 * change runs. The animations themselves are started from script.
 */
export function transitionCss(names: string[], kind: TransitionKind): string {
  if (names.length === 0 || kind === 'none') return '';
  const each = (pseudo: string) => names.map(name => `html[data-pv-vt]::view-transition-${pseudo}(${name})`).join(',');
  const rules = [
    'html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}',
    `${each('group')}{animation:none}`,
    `${each('old')},${each('new')}{animation:none;mix-blend-mode:normal}`,
  ];
  if (kind === 'dusk' || kind === 'dawn') {
    const mask = SWEEP_MASK(kind === 'dusk' ? 'bottom' : 'top');
    const position = kind === 'dusk' ? '0% 100%' : '0% 0%';
    rules.push(
      `${each('old')}{z-index:2;-webkit-mask-image:${mask};mask-image:${mask};-webkit-mask-size:100% 210%;mask-size:100% 210%;` +
        `-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${position};mask-position:${position}}`,
    );
  }
  if (kind === 'reveal') rules.push(`${each('new')}{z-index:2}`);
  return rules.join('\n');
}
```

Run: `npm test -- page-styles`
Expected: `3 passed`.

- [ ] **Step 4: Use the faces**

- `src/styles/shared.ts`: `baseStyles` uses `font-family: var(--pv-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif);` (no Inter). In `typographyStyles`, `.pv-display`, `.pv-heading-1`, and `.pv-heading-2` get `font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);`, and `.pv-display` gets `font-variant-numeric: tabular-nums;`.
- `src/styles/settings.ts` and `src/styles/sheet.ts`: every heading rule (the page and step headings, the sheet `.heading`) gets the same `font-family: var(--pv-font-heading, ...)` with weight 800 for page headings and 700 for sheet headings.
- `src/shell/settings/pv-settings.ts` and `src/shell/setup/pv-setup.ts`: their `.title`, `.page-heading`, `.group-label`, and step heading rules use `var(--pv-font-heading, ...)`.
- `src/styles/themes.ts`: each theme's `--pv-font-family` becomes `FONT_BODY` (imported from `./theme-pairs`), and each gets `'--pv-font-heading': FONT_HEADING`, so the old engine draws the new faces until Task 10 replaces it.
- `src/shell/planavista-card.ts`: import `ensurePageStyles` from `./page-styles` and call it in `connectedCallback()` (after `super.connectedCallback()`).

- [ ] **Step 5: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build` and `bash scripts/test-backend.sh -q`
Expected: no type errors; `300 passed`; the build succeeds; every backend test passes.

`bash scripts/dev-ha.sh deploy-frontend`, then in a fresh isolated context as Dev, open Settings: the Settings title and page headings are drawn in Nunito (Chrome on Windows has no `ui-rounded`), the network panel shows `fonts/nunito-latin-wght.woff2?v=...` with status 200, and `document.fonts.check("800 20px 'PlanaVista Rounded'")` is true in the console. Close every page. Discard the bundle (`git checkout -- dist/planavista-cards.js`).

- [ ] **Step 6: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add package.json package-lock.json scripts/copy-fonts.mjs dist/fonts/nunito-latin-wght.woff2 dist/fonts/OFL.txt src/shell/page-styles.ts test/page-styles.test.ts src/styles/shared.ts src/styles/settings.ts src/styles/sheet.ts src/styles/themes.ts src/shell/settings/pv-settings.ts src/shell/setup/pv-setup.ts src/shell/planavista-card.ts ../../../tests/test_frontend.py
git commit -F - <<'EOF'
feat(frontend): bundle a rounded heading face

Headings and numbers use SF Pro Rounded on Apple devices and Nunito,
served with the card under the SIL Open Font License, everywhere else.
Body text uses each device's own font; nothing loads from the web.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 8: One forecast per card that survives a Home Assistant restart

**Files:**
- Create: `src/utils/subscriptions.ts`
- Modify: `src/utils/weather-subscription.ts` (follows reconnects; `todayHighLow`), `src/core/household-client.ts` (shares the helpers)
- Modify: `test/weather-subscription.test.ts`
- Create: `src/shell/forecast-controller.ts`
- Modify: `src/modules/calendar/components/view-week.ts`, `src/modules/calendar/components/view-agenda.ts`, `src/modules/calendar/calendar-module.ts`, `src/shell/planavista-card.ts`

Milestone 2's ruling 28: the weather forecast had 1.1.0's reconnect weakness (after a restart, the socket library resubscribes before the weather integration answers, and drops the failure, so a kiosk's forecast goes stale until a reload). The new header needs today's high and low as well, so the card gets one forecast subscription, in the shell, that handles reconnects the way milestone 2's household subscription does.

**Interfaces:**
- Produces (`src/utils/subscriptions.ts`): `type Unsubscribe`, `safeUnsubscribe(unsub)`, `retryDelayMs(attempt)` (moved here from `household-client.ts`, which re-exports `retryDelayMs`).
- Produces (`src/utils/weather-subscription.ts`): `ForecastConnection` gains `options?` on `subscribeMessage` and optional `addEventListener` and `removeEventListener`; `RECONNECT_TRIES = 6`; `ForecastSubscription` as before plus reconnects; `todayHighLow(forecast, now) -> { high: number; low: number | null } | null`; `buildForecastMap` unchanged; `safeUnsubscribe` still exported.
- Produces (`src/shell/forecast-controller.ts`): `class ForecastController(host, entity: () => string)` with `.forecast: ForecastEntry[]`.
- Changes: `pv-view-week` and `pv-view-agenda` take `.forecast: ForecastEntry[]` instead of `.weatherEntity` and subscribe to nothing; `pv-calendar-module` takes `.forecast` and hands it on.

- [ ] **Step 1: Write the failing tests**

In `test/weather-subscription.test.ts`, add `todayHighLow,` to the import from `../src/utils/weather-subscription`, and append:

```ts
/** A connection that can reconnect, like hass.connection. */
function reconnectingConnection() {
  const fake = fakeConnection();
  const options: Array<Record<string, unknown> | undefined> = [];
  const listeners: Array<() => void> = [];
  const subscribe = fake.connection.subscribeMessage;
  const connection: ForecastConnection = {
    subscribeMessage: (callback, message, opts) => {
      options.push(opts);
      return subscribe(callback, message);
    },
    addEventListener: (_event, listener) => listeners.push(listener),
    removeEventListener: (_event, listener) => listeners.splice(listeners.indexOf(listener), 1),
  };
  return { ...fake, connection, options, listeners, reconnect: () => [...listeners].forEach(l => l()) };
}

describe('ForecastSubscription after a reconnect', () => {
  it('subscribes again itself, since the socket library would drop a failed resubscribe', async () => {
    const fake = reconnectingConnection();
    const onForecast = vi.fn();
    const sub = new ForecastSubscription(onForecast);
    sub.update(fake.connection, 'weather.home');
    expect(fake.options[0]).toEqual({ resubscribe: false });
    fake.pending[0].resolve(fake.pending[0].unsub);
    await flush();
    fake.reconnect();
    expect(fake.pending).toHaveLength(2);
    expect(fake.pending[0].unsub).not.toHaveBeenCalled(); // its id may belong to a new command now
    fake.pending[1].resolve(fake.pending[1].unsub);
    await flush();
    fake.pending[0].callback({ forecast: [] });
    fake.pending[1].callback({ forecast: sunny });
    expect(onForecast).toHaveBeenCalledTimes(1);
    expect(onForecast).toHaveBeenLastCalledWith(sunny);
  });

  it('tries for about a minute while the weather comes back, then uses the entity forecast', async () => {
    vi.useFakeTimers();
    try {
      const fake = reconnectingConnection();
      const onForecast = vi.fn();
      const sub = new ForecastSubscription(onForecast);
      sub.update(fake.connection, 'weather.home', sunny);
      fake.pending[0].resolve(fake.pending[0].unsub);
      await flush();
      fake.reconnect();
      for (const wait of [1000, 2000, 4000, 8000, 16000, 30000]) {
        fake.pending[fake.pending.length - 1].reject(new Error('not ready'));
        await flush();
        expect(onForecast).not.toHaveBeenCalled();
        vi.advanceTimersByTime(wait);
      }
      expect(fake.pending).toHaveLength(8);
      fake.pending[7].reject(new Error('still not ready'));
      await flush();
      expect(onForecast).toHaveBeenLastCalledWith(sunny);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stops following reconnects when stopped', async () => {
    const fake = reconnectingConnection();
    const sub = new ForecastSubscription(() => {});
    sub.update(fake.connection, 'weather.home');
    sub.stop();
    expect(fake.listeners).toHaveLength(0);
  });
});

describe('todayHighLow', () => {
  it('reads today from the daily forecast', () => {
    const forecast: ForecastEntry[] = [
      { datetime: '2026-10-13T05:00:00+00:00', condition: 'sunny', temperature: 71.6, templow: 54.6 },
      { datetime: '2026-10-14T05:00:00+00:00', condition: 'rainy', temperature: 60, templow: 50 },
    ];
    expect(todayHighLow(forecast, new Date(2026, 9, 13, 16, 10))).toEqual({ high: 72, low: 55 });
    expect(todayHighLow([{ datetime: '2026-10-13T05:00:00+00:00', condition: 'sunny', temperature: 70 }], new Date(2026, 9, 13, 9))).toEqual({ high: 70, low: null });
    expect(todayHighLow(forecast, new Date(2026, 9, 20, 9))).toBeNull();
  });
});
```

Run: `npm test -- weather-subscription`
Expected: the new tests fail (`todayHighLow is not a function`; the reconnect tests see one subscribe where they expect two).

- [ ] **Step 2: Share the subscription helpers**

Create `src/utils/subscriptions.ts`:

```ts
/** Helpers shared by the card's WebSocket subscriptions. */

export type Unsubscribe = () => void | Promise<void>;

/** Unsubscribe without throwing, even when the connection is already gone. */
export function safeUnsubscribe(unsub: Unsubscribe): void {
  try {
    const result = unsub();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => undefined);
    }
  } catch {
    // The connection may already be gone; nothing left to clean up.
  }
}

const RETRY_FIRST_MS = 1000;
const RETRY_MAX_MS = 30_000;

/** How long to wait before try `attempt` + 1 after a failed subscribe: 1 s, doubling, at most 30 s. */
export function retryDelayMs(attempt: number): number {
  return Math.min(RETRY_MAX_MS, RETRY_FIRST_MS * 2 ** attempt);
}
```

In `src/core/household-client.ts`, delete `RETRY_FIRST_MS`, `RETRY_MAX_MS`, the local `retryDelayMs`, and the local `Unsubscribe` type; import them instead and keep `retryDelayMs` exported for its tests:

```ts
import { Unsubscribe, retryDelayMs, safeUnsubscribe } from '../utils/subscriptions';

export { retryDelayMs };
```

- [ ] **Step 3: Follow reconnects**

Replace `src/utils/weather-subscription.ts` with:

```ts
import { getDateKey, parseEventDate } from './date-utils';
import { Unsubscribe, retryDelayMs, safeUnsubscribe } from './subscriptions';

export { safeUnsubscribe } from './subscriptions';

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

/** The part of hass.connection this helper uses. */
export interface ForecastConnection {
  subscribeMessage(
    callback: (msg: { forecast?: ForecastEntry[] }) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<Unsubscribe>;
  addEventListener?(event: 'ready', listener: () => void): void;
  removeEventListener?(event: 'ready', listener: () => void): void;
}

/** Tries after a reconnect before falling back to the entity's own forecast: about a minute. */
export const RECONNECT_TRIES = 6;

/**
 * The daily forecast for the card's weather entity (the header's high and
 * low, and the Week and Agenda views), one subscription per card.
 *
 * Holds at most one live subscription and never loses its unsubscribe
 * handle: repeated update() calls for the same entity while a subscribe is
 * still in flight don't start another one, and a subscribe that resolves
 * after stop() (or after the entity changed) is unsubscribed immediately.
 * After Home Assistant restarts, the socket comes back before the weather
 * integration does and the socket library drops a resubscribe that fails,
 * so this subscribes again after every reconnect and tries for about a
 * minute; a subscribe that fails otherwise falls back to the entity's
 * forecast attribute at once.
 */
export class ForecastSubscription {
  /** Entity subscribed to, being subscribed to, or that fell back to its legacy attribute; '' when stopped. */
  private _entityId = '';
  private _connection: ForecastConnection | undefined;
  private _legacy: ForecastEntry[] | undefined;
  private _unsub: Unsubscribe | null = null;
  /** Incremented on every stop, replace, and reconnect; stale callbacks compare against it. */
  private _generation = 0;
  private _retry: ReturnType<typeof setTimeout> | undefined;
  private _attempt = 0;

  constructor(private readonly _onForecast: (forecast: ForecastEntry[]) => void) {}

  /**
   * Subscribe to `entityId`'s daily forecast; a no-op when already handling
   * that entity on this connection. An empty entity or a missing connection
   * stops any subscription and clears the forecast. `legacyForecast` (the
   * entity's old `forecast` attribute) is used when subscribing fails.
   */
  update(connection: ForecastConnection | undefined, entityId: string, legacyForecast?: ForecastEntry[]): void {
    this._legacy = legacyForecast;
    if (!entityId || !connection) {
      const wasActive = this._entityId !== '';
      this.stop();
      if (wasActive) this._onForecast([]);
      return;
    }
    if (entityId === this._entityId && connection === this._connection) return;
    this.stop();
    this._entityId = entityId;
    this._connection = connection;
    connection.addEventListener?.('ready', this._onReady);
    this._subscribe(false);
  }

  /** Drop the subscription (including one still in flight) and stop following reconnects. */
  stop(): void {
    this._generation++;
    this._cancelRetry();
    this._connection?.removeEventListener?.('ready', this._onReady);
    this._connection = undefined;
    this._entityId = '';
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
  }

  /** The socket was made again: Home Assistant forgot the subscription with the old one. */
  private _onReady = (): void => {
    if (!this._connection || !this._entityId) return;
    this._generation++;
    // Not unsubscribed: command ids start again after a reconnect.
    this._unsub = null;
    this._cancelRetry();
    this._subscribe(true);
  };

  private _subscribe(afterReconnect: boolean): void {
    const connection = this._connection;
    if (!connection) return;
    const generation = this._generation;
    connection
      .subscribeMessage(
        msg => {
          if (generation === this._generation) this._onForecast(msg?.forecast || []);
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: this._entityId },
        { resubscribe: false },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub); // stopped or replaced while in flight
          return;
        }
        this._unsub = unsub;
        this._attempt = 0;
      })
      .catch(() => {
        if (generation !== this._generation) return;
        if (afterReconnect && this._attempt < RECONNECT_TRIES) {
          this._retry = setTimeout(() => {
            this._retry = undefined;
            if (generation === this._generation) this._subscribe(true);
          }, retryDelayMs(this._attempt++));
          return;
        }
        this._onForecast(this._legacy || []);
      });
  }

  private _cancelRetry(): void {
    if (this._retry !== undefined) clearTimeout(this._retry);
    this._retry = undefined;
    this._attempt = 0;
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

/** Today's high and low for the portrait header; null when the forecast has no entry for today. */
export function todayHighLow(forecast: ForecastEntry[], now: Date): { high: number; low: number | null } | null {
  const today = getDateKey(now);
  const entry = forecast.find(fc => fc.datetime && getDateKey(parseEventDate(fc.datetime)) === today);
  if (!entry || typeof entry.temperature !== 'number') return null;
  return { high: Math.round(entry.temperature), low: typeof entry.templow === 'number' ? Math.round(entry.templow) : null };
}
```

Run: `npm test -- weather-subscription household-client`
Expected: every test passes, the seven earlier forecast tests and milestone 2's household tests included.

- [ ] **Step 4: The card's forecast**

Create `src/shell/forecast-controller.ts`:

```ts
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ForecastConnection, ForecastEntry, ForecastSubscription } from '../utils/weather-subscription';

interface ForecastHass {
  connection?: unknown;
  states?: Record<string, { attributes?: Record<string, unknown> } | undefined>;
}

type Host = ReactiveControllerHost & HTMLElement & { hass?: ForecastHass };

/**
 * One daily forecast per card (spec 12.2: the portrait header's high and
 * low; and the Week and Agenda views), following reconnects.
 */
export class ForecastController implements ReactiveController {
  forecast: ForecastEntry[] = [];

  private readonly _subscription = new ForecastSubscription(forecast => {
    this.forecast = forecast;
    this._host.requestUpdate();
  });

  constructor(
    private readonly _host: Host,
    /** The weather entity the card shows ('' for none). */
    private readonly _entity: () => string,
  ) {
    _host.addController(this);
  }

  hostConnected(): void {
    this._follow();
  }

  hostUpdate(): void {
    this._follow();
  }

  hostDisconnected(): void {
    this._subscription.stop();
    this.forecast = [];
  }

  private _follow(): void {
    const entity = this._entity();
    const hass = this._host.hass;
    this._subscription.update(
      hass?.connection as ForecastConnection | undefined,
      entity,
      hass?.states?.[entity]?.attributes?.forecast as ForecastEntry[] | undefined,
    );
  }
}
```

- `src/shell/planavista-card.ts`: add `private _forecast = new ForecastController(this, () => this._display().weather_entity);` (the header's weather can be hidden with `hide_weather`, but Week and Agenda still show the forecast, as in 1.1.0), and pass `.forecast=${this._forecast.forecast}` to the module element in `_renderModule`.
- `src/modules/calendar/calendar-module.ts`: add `@property({ attribute: false }) forecast: ForecastEntry[] = [];` and pass `.forecast=${this.forecast}` to `pv-view-week` and `pv-view-agenda` in place of `.weatherEntity`.
- `src/modules/calendar/components/view-week.ts` and `view-agenda.ts`: replace `@property({ attribute: false }) weatherEntity` with `@property({ attribute: false }) forecast: ForecastEntry[] = [];`; delete `_forecast`, `_forecastSub`, the subscribe code in `updated()`, and the `stop()` in `disconnectedCallback()` (remove a method left empty); `buildForecastMap(this.forecast)` replaces `buildForecastMap(this._forecast)`. A view with no forecast shows no weather, as before.

- [ ] **Step 5: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `304 passed`; the build succeeds.

`bash scripts/dev-ha.sh deploy-frontend` and set a weather entity in Calendar options. In a fresh isolated context, Week and Agenda show their daily weather; a recorded `WebSocket.prototype.send` shows one `weather/subscribe_forecast` for the card (with `"resubscribe"` absent from the message, since it's a library option) where 1.1.0 sent one per view. Restart Home Assistant (`docker restart planavista-dev-ha`) with the page open: within a minute after it is back, the card sends `weather/subscribe_forecast` again and Week's weather is current. Close every page. Discard the bundle.

- [ ] **Step 6: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/utils/subscriptions.ts src/utils/weather-subscription.ts src/core/household-client.ts test/weather-subscription.test.ts src/shell/forecast-controller.ts src/shell/planavista-card.ts src/modules/calendar/calendar-module.ts src/modules/calendar/components/view-week.ts src/modules/calendar/components/view-agenda.ts
git commit -F - <<'EOF'
fix(frontend): keep the forecast current after Home Assistant restarts

Each card now has one forecast subscription instead of one per view. It
subscribes again after a reconnect and keeps trying for about a minute
while the weather integration starts, where the forecast used to go
stale until the page was reloaded. The header can show today's high and
low from it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 9: The glance header and the bar

**Files:**
- Modify: `src/core/module-registry.ts`, `test/module-registry.test.ts`
- Modify: `src/modules/calendar/definition.ts`, `test/calendar-definition.test.ts`
- Create: `src/shell/pv-glance-header.ts`, `src/shell/pv-nav-bar.ts`
- Delete: `src/shell/pv-clock.ts` (the header keeps its own clock; `formatClockParts` and its test stay)
- Modify: `src/shell/planavista-card.ts`, `src/modules/calendar/calendar-module.ts`

Spec 12.2: in landscape one band across the top (weather, the date and time, then the module switcher, the module's views, and the gear); in portrait a lock-screen header (a big clock, the date, the weather with its high and low) with the switcher, views, and gear in a bar along the bottom; on a phone a compact header and the bar at the bottom. Switching modules never moves the controls. Glance chips and "Waiting for OK" come with chores.

**Interfaces:**
- Consumes: Task 8's `ForecastController` and `todayHighLow`; milestone 2's `LayoutController`; `formatClockParts`, `weatherIcon`.
- Produces (`src/core/module-registry.ts`): `interface ModuleView { id; label }`; `ModuleDefinition` gains `views: ModuleView[]` and `initialView?(ctx): string | undefined`; `initialModuleView(mod, ctx) -> string`.
- Produces: `pv-glance-header` and `pv-nav-bar` (contracts below). `pv-nav-bar` fires `pv-module-select` `{ id }`, `pv-view-select` `{ id }`, and `pv-open-settings`.
- Changes: `pv-calendar-module` takes `.view` (the shell's choice) and a reflected `layout` attribute, fires `pv-view-change` `{ view }` when it wants another view (a day tapped in Month), and no longer takes `canOpenSettings`.

- [ ] **Step 1: Write the failing tests**

In `test/module-registry.test.ts`, import `initialModuleView` from `../src/core/module-registry`, add `views: [],` to the object `mod()` returns, and append:

```ts
describe('initialModuleView', () => {
  const calendar = {
    views: [{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }],
    initialView: ({ config }: { config: { view?: string } | undefined }) => config?.view,
  };

  it('opens on the view a module asks for when it offers it, else its first', () => {
    expect(initialModuleView(calendar, { config: { type: 'custom:planavista-card', view: 'week' }, data: null })).toBe('week');
    expect(initialModuleView(calendar, { config: { type: 'custom:planavista-card', view: 'year' as never }, data: null })).toBe('day');
    expect(initialModuleView(calendar, { config: undefined, data: null })).toBe('day');
    expect(initialModuleView({ views: [] }, { config: undefined, data: null })).toBe('');
  });
});
```

In `test/calendar-definition.test.ts`, import `initialModuleView` from `../src/core/module-registry` and add to `describe('the calendar module')`:

```ts
  it('offers its four views and opens on the one the card or Settings names', () => {
    expect(calendarModule.views.map(v => v.label)).toEqual(['Day', 'Week', 'Month', 'Agenda']);
    expect(initialModuleView(calendarModule, { config: undefined, data })).toBe('week');
    expect(initialModuleView(calendarModule, { config: { type: 'custom:planavista-card', view: 'month' }, data })).toBe('month');
    // As 1.1.0 did with no saved default view.
    expect(initialModuleView(calendarModule, { config: undefined, data: null })).toBe('day');
  });
```

Run: `npm test -- module-registry calendar-definition`
Expected: both new tests fail (`initialModuleView is not a function`).

- [ ] **Step 2: Views in the registry**

Replace `src/core/module-registry.ts` with:

```ts
import type { PlanaVistaCardConfig, PlanaVistaData } from '../types';

/** What the shell knows when it asks a module a question. */
export interface ModuleContext {
  config: PlanaVistaCardConfig | undefined;
  data: PlanaVistaData | null;
}

/** A view a module offers in the bar (the calendar's Day, Week, Month, Agenda). */
export interface ModuleView {
  id: string;
  label: string;
}

/** A feature area the card hosts (Calendar today; Chores and Lists later). */
export interface ModuleDefinition {
  /** Stable id, used by the card options `modules` and `module`. */
  id: string;
  /** Name in the module switcher. */
  label: string;
  /** mdi icon for the module switcher. */
  icon: string;
  /** Custom element that renders the module. */
  tag: string;
  /** Position among modules; lower comes first. */
  order: number;
  /** The views the bar offers, in order (spec 12.2). */
  views: ModuleView[];
  /** The view to open on, when the card's options or saved settings name one. */
  initialView?(ctx: ModuleContext): string | undefined;
  /** Entities whose state changes should re-render this module. */
  watchedEntities(ctx: ModuleContext): string[];
}

/** The view a module opens on: the one it asks for when it offers it, else its first. */
export function initialModuleView(mod: Pick<ModuleDefinition, 'views' | 'initialView'>, ctx: ModuleContext): string {
  const wanted = mod.initialView?.(ctx);
  return mod.views.some(view => view.id === wanted) ? (wanted as string) : mod.views[0]?.id ?? '';
}

function byOrderThenId(a: { order: number; id: string }, b: { order: number; id: string }): number {
  return a.order - b.order || a.id.localeCompare(b.id);
}

/** The modules this bundle contains. Registering an id again replaces it. */
export class ModuleRegistry {
  private readonly _modules = new Map<string, ModuleDefinition>();

  register(def: ModuleDefinition): void {
    this._modules.set(def.id, def);
  }

  get(id: string): ModuleDefinition | undefined {
    return this._modules.get(id);
  }

  list(): ModuleDefinition[] {
    return [...this._modules.values()].sort(byOrderThenId);
  }
}

export interface ResolvedModules {
  /** The modules this card shows, in display order. */
  shown: ModuleDefinition[];
  /** The module the card opens on. */
  initial: ModuleDefinition | undefined;
}

/**
 * Apply the card options to the registered modules. `modules` (a list of
 * ids) picks and orders them; unknown ids and repeats are ignored, and if
 * nothing valid is listed every module is shown. `module` names the one the
 * card opens on, if it is shown.
 */
export function resolveModules(
  registered: ModuleDefinition[],
  options: { modules?: unknown; module?: unknown },
): ResolvedModules {
  let shown = registered;
  if (Array.isArray(options.modules)) {
    const picked: ModuleDefinition[] = [];
    for (const id of options.modules) {
      const found = typeof id === 'string' ? registered.find(m => m.id === id) : undefined;
      if (found && !picked.includes(found)) picked.push(found);
    }
    if (picked.length > 0) shown = picked;
  }
  const named = typeof options.module === 'string' ? shown.find(m => m.id === options.module) : undefined;
  return { shown, initial: named ?? shown[0] };
}

/** The bundle's registry. Each module registers itself when it is imported. */
export const moduleRegistry = new ModuleRegistry();
```

In `src/modules/calendar/definition.ts`, import `initialView` from `./calendar-derive` and give `calendarModule`:

```ts
  views: [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'agenda', label: 'Agenda' },
  ],
  initialView: ({ config, data }) => initialView(config, data),
```

Run: `npm test -- module-registry calendar-definition`
Expected: all pass.

- [ ] **Step 3: Create `pv-glance-header`**

`src/shell/pv-glance-header.ts`, an element with its own shadow root:

| Property | Meaning |
|---|---|
| `layout: Layout` (reflected) | phone, portrait, or landscape |
| `timeFormat: '12h' \| '24h'` | as the display settings say |
| `weather` | the weather entity's state object, or null (no entity, or `hide_weather`) |
| `weatherEntity: string` | for the details dialog |
| `today: { high: number; low: number \| null } \| null` | `todayHighLow(forecast, now)` |

- It owns a 1 second timer that re-renders only when the minute changes (as `pv-clock` did), with `formatClockParts`. Times and temperatures use tabular figures.
- Text uses `var(--pv-header-text)`, secondary text `var(--pv-header-muted)`, the background `var(--pv-header-gradient)`. A hairline under it: `1px solid color-mix(in srgb, var(--pv-header-text) 10%, transparent)`. Headings and numbers use `var(--pv-font-heading)`. The card is a size container (`container-type: inline-size`), so sizes use `cqi`.
- **Landscape:** one row of three columns (`grid-template-columns: 1fr auto 1fr`): the weather (icon 32 px, the temperature in weight 700, the condition in small secondary text) at the left; the long date centered (weight 800, `clamp(18px, 1.6cqi, 26px)`); the time at the right (weight 600, `clamp(24px, 2.2cqi, 40px)`, AM/PM at 55 percent size). Padding 12 px 20 px.
- **Portrait:** the time large at the left (weight 700, `clamp(40px, 6cqi, 60px)`, AM/PM at 40 percent size) with the date under it (weight 800, `clamp(16px, 2.2cqi, 22px)`); at the right the weather icon (40 px), the temperature (weight 800, `clamp(24px, 3.5cqi, 34px)`), and under it "High 72° · Low 55°" ("High 72°" with no low; nothing without a forecast). Padding 16 px 20px 12px.
- **Phone:** one compact row: the time (weight 700, 22 px) and the short date ("Tue, Oct 13") at the left, the weather icon (24 px) and temperature at the right. Padding 8 px 14 px.
- The weather is a button (`aria-label="Weather details"`, at least 48 px tall) that fires `hass-more-info` with `{ entityId: weatherEntity }` (bubbles, composed). Without weather its place stays empty and the date and time keep theirs.

- [ ] **Step 4: Create `pv-nav-bar`**

`src/shell/pv-nav-bar.ts`:

| Property | Meaning |
|---|---|
| `layout: Layout` (reflected) | phone, portrait, or landscape |
| `modules: Array<{ id; label; icon }>` | the modules this card shows |
| `activeModule: string` | the module on screen |
| `views: ModuleView[]` | the active module's views |
| `activeView: string` | the view on screen |
| `canOpenSettings: boolean` | shows the gear |

- From the left: the module switcher, a segmented control drawn with `--pv-seg` and `--pv-seg-on`, shown only with two or more modules (spec 6.3; with Calendar alone it never shows), firing `pv-module-select` `{ id }`; a flexible space; the active module's views as buttons with `aria-pressed`, the active one filled with `--pv-accent` and `--pv-accent-text` and the rest in `--pv-text-secondary`, firing `pv-view-select` `{ id }`; the gear (`aria-label="Settings"`, an `mdi:cog` icon in a 40 px rounded square with a `--pv-border` outline) firing `pv-open-settings` (bubbles, composed) when `canOpenSettings`.
- Every control is at least 48 px tall to the touch, even where the drawn pill is 36 px.
- **Landscape:** under the header, with a hairline below, padding 6 px 20px 10px. **Portrait and phone:** along the bottom edge with a hairline above and `padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px))`. Background `var(--pv-card-bg)`.
- **Phone:** the view buttons scroll sideways if they don't fit (`overflow-x: auto`, no scrollbar); the gear stays at the right.

- [ ] **Step 5: The card draws the header, the module, and the bar**

In `src/shell/planavista-card.ts`:
- Import `./pv-glance-header`, `./pv-nav-bar`, `initialModuleView` (from `../core/module-registry`), and `todayHighLow` (from `../utils/weather-subscription`); remove the `./pv-clock` import, `_renderHeader`, `_getTempUnit` (the header formats temperatures as `Math.round(temperature)°`, as 1.1.0 did), and every `.pvc-header*`, `.pvc-weather*`, `.pvc-time*`, and `.pvc-no-weather` rule with the media queries that only they used. Delete `src/shell/pv-clock.ts`.
- Add `@state() private _views: Record<string, string> = {};` and `@state() private _moduleId: string | null = null;`. `setConfig` sets both back to their start (`{}` and null), so the card's own `view` and `module` options apply whenever the config changes. The active module is `this._modules().shown.find(m => m.id === this._moduleId) ?? this._modules().initial`.
- In `willUpdate`, once there is data and `_views` has no entry for the active module, set it to `initialModuleView(module, { config, data })` (the view a card opens on is chosen once, as in 1.1.0).
- The render order inside `ha-card` becomes the parent strip, `pv-glance-header` (left out when `hide_header` is set), the module element (with the class `pv-module`), then `pv-nav-bar`. Styles: `ha-card { container-type: inline-size; }`; `.pv-module { order: 3; flex: 1 1 auto; min-height: 0; }`; `pv-glance-header { order: 1; }`; `pv-nav-bar { order: 4; }`; `:host([layout='landscape']) pv-nav-bar { order: 2; }`. The bar is the same element in every layout and the module never moves in the DOM, so turning a tablet keeps the module's state (spec 12.1).
- The header gets `layout`, `.timeFormat`, `.weather` (null when `hide_weather` or no entity), `.weatherEntity`, and `.today=${todayHighLow(this._forecast.forecast, new Date())}`. The bar gets the shown modules, the active module and its views, `this._views[module.id]`, and `.canOpenSettings=${this._access() !== 'none'}`.
- `pv-view-select` and the module's `pv-view-change` set `this._views = { ...this._views, [module.id]: id }`; `pv-module-select` sets `_moduleId`; the bar's `pv-open-settings` calls `_openSettings`, whose `event.composedPath()[0]` is now the gear itself, so focus goes back to the gear when a sheet closes.
- `_renderModule` passes `.view=${this._views[mod.id]}` and `layout=${this._layout.layout}`, and no longer `.canOpenSettings` or `@pv-open-settings`.

- [ ] **Step 6: The calendar takes its view from the shell**

In `src/modules/calendar/calendar-module.ts`:
- Add `@property({ attribute: false }) view: ViewType | undefined;` and `@property({ type: String, reflect: true }) layout: Layout = 'landscape';`; remove `canOpenSettings`, `_viewInitialized`, and the card-config and initial-view code in `willUpdate`, which becomes: `if (changed.has('view') && this.view) this._pv.store.setView(this.view);`.
- `_onDayClick` keeps `this._pv.store.setDate(e.detail.date)` and replaces `setView('day')` with `this.dispatchEvent(new CustomEvent('pv-view-change', { detail: { view: 'day' }, bubbles: true, composed: true }));`.
- The toolbar drops the view tabs and the gear (with `_openSettings`, `.pvc-view-tab*`, `.pvc-settings-btn`) and keeps the Calendars filter, + New, ‹ Today ›, and refresh as the module's own row. Its two phone media queries (`max-width: 479px` and `480px to 767px`) become `:host([layout='phone'])` rules: on a phone the inline person chips show and the Calendars dropdown hides; elsewhere the dropdown shows. Its 1024 px and 1440 px scale-ups stay (see the plan ruling on media queries).

- [ ] **Step 7: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `306 passed`; the build succeeds.

`bash scripts/dev-ha.sh deploy-frontend`, then in a fresh isolated context as Dev:
- 1280 × 800: the header (weather, date, time) and the bar (Day, Week, Month, Agenda, the gear) across the top, the calendar's own row under them; tapping Month then a day opens Day with Day pressed in the bar.
- 800 × 1280: the big clock header at the top and the bar along the bottom; the views work.
- 390 × 844: the compact header, the bar at the bottom, the person chips in the calendar's row.
- A card with `hide_header: true` keeps the bar.
- As Kitchen, the gear asks for a PIN; Cancel returns focus to the gear (Tab moves on from it).
Close every page. Discard the bundle.

- [ ] **Step 8: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/module-registry.ts test/module-registry.test.ts src/modules/calendar/definition.ts test/calendar-definition.test.ts src/shell/pv-glance-header.ts src/shell/pv-nav-bar.ts src/shell/planavista-card.ts src/modules/calendar/calendar-module.ts
git rm src/shell/pv-clock.ts
git commit -F - <<'EOF'
feat(frontend): add the glance header and the bar

The card shows a header and a bar of its own: across the top in
landscape, and in portrait and on phones a big clock at the top and the
views and Settings along the bottom, where hands already are. Modules
offer their views to the bar, so switching modules won't move the
controls.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 10: Day and night on the card

**Files:**
- Create: `src/core/appearance-deps.ts`, `test/appearance-deps.test.ts`
- Create: `src/shell/view-transition.ts`, `src/shell/appearance-controller.ts`
- Modify: `src/shell/planavista-card.ts`, `src/modules/calendar/calendar-module.ts`, `src/shell/setup/pv-setup.ts`

The card stops using the old theme engine here: the appearance controller draws the theme pairs, works out the mode, and plays the change (spec 12.4). The old theme picker stays in Settings until Task 13 rebuilds Appearance; meanwhile its choices save but don't preview.

**Interfaces:**
- Consumes: Tasks 4 to 7 (`themeTokens`, `applyTokens`, `appearanceSettings`, `withCardTheme`, `resolveMode`, `mayAutoSwitch`, `transitionKind`, `AppearanceEdits`, `resolveMotion`, `SMOOTH`, `springEasing`, `transitionCss`, `setTransitionStyles`).
- Produces (`src/core/appearance-deps.ts`): `sunOf(states) -> SunState | null`, `appearanceDependencies(settings) -> { entities: string[]; haDarkMode: boolean }`.
- Produces (`src/shell/view-transition.ts`): `viewTransitionsSupported(doc?)`, `runAppearanceChange(kind, element, apply, point?) -> Promise<void>`.
- Produces (`src/shell/appearance-controller.ts`): `interface AppearanceSource { display; cardTheme; sun; haDark; overlayOpen }`, `class AppearanceController(host, edits, source, settled)` with `.mode`, `.motion`, `.settings`, `.look`, `.sunMissing`. It sets the card's `appearance` and `motion` attributes and the `--pv-motion` custom property.
- Produces: the card keeps one `AppearanceEdits` in its drafts under the key `'appearance'` (Task 13's pages use it), and `pv-setup` passes `.drafts` to its steps.
- Changes: `pv-calendar-module` takes `.mode: Mode` and `.shape: ThemeShape` (its avatar border and event style), drops `previewOverrides`, and fires `pv-overlay-change` `{ open }` (bubbles, composed) when its event popup or dialog opens or closes.

- [ ] **Step 1: Write the failing test**

Create `test/appearance-deps.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { appearanceSettings } from '../src/core/appearance';
import { appearanceDependencies, sunOf } from '../src/core/appearance-deps';

describe('sunOf', () => {
  it('reads the state and the next sunrise and sunset', () => {
    expect(sunOf({
      'sun.sun': { state: 'above_horizon', attributes: { next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-13T23:31:00+00:00', elevation: 20 } },
    })).toEqual({ state: 'above_horizon', next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-13T23:31:00+00:00' });
  });

  it('gives null without a sun, and ignores times that are not text', () => {
    expect(sunOf(undefined)).toBeNull();
    expect(sunOf({})).toBeNull();
    expect(sunOf({ 'sun.sun': { state: 'below_horizon', attributes: { next_rising: 5 } } }))
      .toEqual({ state: 'below_horizon', next_rising: undefined, next_setting: undefined });
  });
});

describe('appearanceDependencies', () => {
  const settings = appearanceSettings({});

  it('watches the sun only when Automatic follows it, and the theme only when it matches Home Assistant', () => {
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'sun' }))
      .toEqual({ entities: ['sun.sun'], haDarkMode: false });
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'home_assistant' }))
      .toEqual({ entities: [], haDarkMode: true });
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'schedule' }))
      .toEqual({ entities: [], haDarkMode: false });
    expect(appearanceDependencies({ ...settings, appearance: 'dark' })).toEqual({ entities: [], haDarkMode: false });
  });
});
```

Run: `npm test -- appearance-deps`
Expected: `Failed to resolve import "../src/core/appearance-deps"`.

- [ ] **Step 2: Create `src/core/appearance-deps.ts`**

```ts
import type { AppearanceSettings, SunState } from './appearance';

type States = Record<string, { state: string; attributes?: Record<string, unknown> } | undefined>;

/** sun.sun as the appearance reads it from hass.states; null when Home Assistant has no sun. */
export function sunOf(states: States | undefined): SunState | null {
  const sun = states?.['sun.sun'];
  if (!sun) return null;
  const text = (key: string) => {
    const value = sun.attributes?.[key];
    return typeof value === 'string' ? value : undefined;
  };
  return { state: sun.state, next_rising: text('next_rising'), next_setting: text('next_setting') };
}

/**
 * What else has to re-render the card for its appearance: sun.sun when
 * Automatic follows the sun, and this screen's Home Assistant dark mode
 * when it matches Home Assistant.
 */
export function appearanceDependencies(settings: AppearanceSettings): { entities: string[]; haDarkMode: boolean } {
  const automatic = settings.appearance === 'automatic';
  return {
    entities: automatic && settings.appearance_switch === 'sun' ? ['sun.sun'] : [],
    haDarkMode: automatic && settings.appearance_switch === 'home_assistant',
  };
}
```

Run: `npm test -- appearance-deps`
Expected: `3 passed`.

- [ ] **Step 3: Create the transition runner**

Create `src/shell/view-transition.ts`. Shadow DOM can't style the transition's pseudo-elements, so the rules go on the page (Task 7's `transitionCss`), and each card gets a unique `view-transition-name` only while its own change runs (spec 12.4):

```ts
import type { TransitionKind } from '../core/appearance';
import type { TapPoint } from '../core/appearance-edits';
import { SMOOTH, springEasing } from '../core/motion';
import { setTransitionStyles, transitionCss } from './page-styles';

/** About two seconds for night to fall or day to rise; a quick fade with reduced motion (spec 12.4). */
const SWEEP_MS = 2000;
const SWEEP_EASING = 'cubic-bezier(.45,0,.25,1)';
const FADE_MS = 250;

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}
type StartViewTransition = (update: () => Promise<void>) => ViewTransitionLike;

interface Change {
  element: HTMLElement;
  apply: () => Promise<void>;
  point?: TapPoint;
}

let waiting: { kind: TransitionKind; changes: Change[] } | null = null;
let running = false;
let count = 0;

/** The browser has View Transitions (Chrome and Edge 111, Safari 18). */
export function viewTransitionsSupported(doc: Document = document): boolean {
  return typeof (doc as unknown as { startViewTransition?: unknown }).startViewTransition === 'function';
}

/**
 * Change a card between light and dark (spec 12.4): `apply` draws the new
 * mode. Cards that change at the same moment (every card on a dashboard at
 * sunset) share one transition; a change that arrives while one runs just
 * switches. Without View Transitions, or for kind 'none', it just switches.
 */
export function runAppearanceChange(
  kind: TransitionKind,
  element: HTMLElement,
  apply: () => Promise<void>,
  point?: TapPoint,
): Promise<void> {
  if (kind === 'none' || running || !viewTransitionsSupported()) return apply();
  return new Promise<void>((resolve, reject) => {
    const change: Change = { element, apply: () => apply().then(resolve, reject), point };
    if (waiting && waiting.kind === kind) {
      waiting.changes.push(change);
    } else if (waiting) {
      void change.apply();
    } else {
      waiting = { kind, changes: [change] };
      // After this task, so every card that changes now joins in.
      setTimeout(() => void start(), 0);
    }
  });
}

async function start(): Promise<void> {
  const batch = waiting;
  waiting = null;
  if (!batch) return;
  running = true;
  const root = document.documentElement;
  const names = batch.changes.map(change => {
    const name = `planavista-${++count}`;
    change.element.style.setProperty('view-transition-name', name);
    return name;
  });
  setTransitionStyles(transitionCss(names, batch.kind));
  root.dataset.pvVt = batch.kind;
  const applyAll = () => Promise.all(batch.changes.map(change => change.apply())).then(() => undefined);
  try {
    const startTransition = (document as unknown as { startViewTransition: StartViewTransition }).startViewTransition.bind(document);
    let transition: ViewTransitionLike;
    try {
      transition = startTransition(applyAll);
    } catch {
      await applyAll();
      return;
    }
    try {
      await transition.ready;
      animate(batch.kind, names, batch.changes);
    } catch {
      // The browser skipped the animation; the change itself still happened.
    }
    await transition.finished.catch(() => undefined);
  } finally {
    for (const change of batch.changes) change.element.style.removeProperty('view-transition-name');
    delete root.dataset.pvVt;
    setTransitionStyles('');
    running = false;
  }
}

function animate(kind: TransitionKind, names: string[], changes: Change[]): void {
  const root = document.documentElement;
  names.forEach((name, i) => {
    const oldImage = `::view-transition-old(${name})`;
    const newImage = `::view-transition-new(${name})`;
    if (kind === 'dusk' || kind === 'dawn') {
      // Night falls from the top; day rises from the bottom.
      const [from, to] = kind === 'dusk' ? ['0% 100%', '0% 0%'] : ['0% 0%', '0% 100%'];
      root.animate(
        { maskPosition: [from, to], webkitMaskPosition: [from, to] },
        { duration: SWEEP_MS, easing: SWEEP_EASING, fill: 'both', pseudoElement: oldImage },
      );
    } else if (kind === 'reveal') {
      // The new look spreads out from the finger.
      const rect = changes[i].element.getBoundingClientRect();
      const point = changes[i].point ?? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const cx = point.x - rect.left;
      const cy = point.y - rect.top;
      const radius = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
      const spring = springEasing(SMOOTH);
      root.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
        { duration: spring.duration, easing: spring.easing, fill: 'both', pseudoElement: newImage },
      );
    } else {
      root.animate({ opacity: [1, 0] }, { duration: FADE_MS, easing: 'ease', fill: 'both', pseudoElement: oldImage });
      root.animate({ opacity: [0, 1] }, { duration: FADE_MS, easing: 'ease', fill: 'both', pseudoElement: newImage });
    }
  });
}
```

- [ ] **Step 4: Create the appearance controller**

Create `src/shell/appearance-controller.ts`:

```ts
import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  AppearanceSettings,
  QUIET_MS,
  SunState,
  appearanceSettings,
  lookOf,
  mayAutoSwitch,
  resolveMode,
  transitionKind,
  withCardTheme,
} from '../core/appearance';
import { AppearanceEdits } from '../core/appearance-edits';
import { Motion, resolveMotion } from '../core/motion';
import { Look, Mode, applyTokens, themeTokens } from '../styles/theme-pairs';
import { runAppearanceChange, viewTransitionsSupported } from './view-transition';

/** What the controller reads from its card on every update. */
export interface AppearanceSource {
  display: Record<string, unknown> | undefined;
  /** The card's own `theme` option. */
  cardTheme: string | undefined;
  sun: SunState | null;
  /** This screen's Home Assistant dark mode. */
  haDark: boolean;
  /** A sheet, Settings, setup, or a module's dialog is open. */
  overlayOpen: boolean;
}

type Host = ReactiveControllerHost & HTMLElement;

/** Look again at least this often, so a sunset or a schedule time is never missed. */
const RECHECK_MS = 60_000;

/**
 * Day and night for one card (spec 12.4). It works out Light or Dark from
 * the household's settings and the sun, the schedule, or this screen's Home
 * Assistant theme; draws the theme's tokens on the card; and plays the
 * change: never mid-touch or under an open sheet, never for a screen that
 * was asleep, and from the finger when tapped here. It also sets Full or
 * Reduced motion as --pv-motion (spec 11.5).
 */
export class AppearanceController implements ReactiveController {
  /** The mode on screen. */
  mode: Mode = 'light';
  motion: Motion = 'full';
  settings: AppearanceSettings = appearanceSettings(undefined);
  look: Look = lookOf(this.settings);
  /** Automatic follows the sun, but Home Assistant has no sun.sun (spec 15.4). */
  sunMissing = false;

  private _shown: Mode | null = null;
  private _lastInteraction = 0;
  private _quietUntil = Number.POSITIVE_INFINITY;
  private _timer: ReturnType<typeof setTimeout> | undefined;
  private _changing = false;
  private _wake = false;
  private _reduced: MediaQueryList | undefined;

  constructor(
    private readonly _host: Host,
    private readonly _edits: AppearanceEdits,
    private readonly _source: () => AppearanceSource,
    /** Resolves once the card and its module have drawn the new mode. */
    private readonly _settled: () => Promise<unknown>,
  ) {
    _host.addController(this);
  }

  hostConnected(): void {
    this._host.addEventListener('pointerdown', this._onInteraction, true);
    this._host.addEventListener('keydown', this._onInteraction, true);
    document.addEventListener('visibilitychange', this._onVisibility);
    this._reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    this._reduced?.addEventListener('change', this._onReducedChange);
  }

  hostDisconnected(): void {
    this._host.removeEventListener('pointerdown', this._onInteraction, true);
    this._host.removeEventListener('keydown', this._onInteraction, true);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._reduced?.removeEventListener('change', this._onReducedChange);
    clearTimeout(this._timer);
    // A card that comes back draws at once, without a change to play.
    this._shown = null;
  }

  hostUpdate(): void {
    const source = this._source();
    const saved = appearanceSettings(source.display);
    this._edits.reconcile(saved);
    const settings = withCardTheme(this._edits.current(saved), source.cardTheme);
    const resolved = resolveMode(settings, { now: new Date(), sun: source.sun, haDark: source.haDark });
    this.settings = settings;
    this.look = lookOf(settings);
    this.sunMissing = resolved.sunMissing;
    this.motion = resolveMotion(settings.motion, !!this._reduced?.matches);
    this._show(resolved.mode, source.overlayOpen);
    this._schedule(resolved.next);
  }

  private _show(target: Mode, overlayOpen: boolean): void {
    const wake = this._wake;
    this._wake = false;
    this._quietUntil = Number.POSITIVE_INFINITY;
    if (this._changing) return; // the change in progress draws, then looks again
    if (this._shown === null || target === this._shown) {
      this._paint(target);
      return;
    }
    const point = this._edits.takeTap();
    const hidden = document.visibilityState === 'hidden';
    if (!point && !hidden && !wake && !mayAutoSwitch(Date.now(), this._lastInteraction, overlayOpen)) {
      // An automatic change waits for a quiet moment with no sheet open.
      this._quietUntil = this._lastInteraction + QUIET_MS;
      this._paint(this._shown);
      return;
    }
    const kind = wake
      ? 'none'
      : transitionKind({
          from: this._shown,
          to: target,
          byHand: point !== null,
          hidden,
          reducedMotion: this.motion === 'reduced',
          supported: viewTransitionsSupported(),
        });
    this._changing = true;
    void runAppearanceChange(
      kind,
      this._host,
      async () => {
        this._paint(target);
        this._host.requestUpdate();
        await this._settled();
      },
      point ?? undefined,
    ).finally(() => {
      this._changing = false;
      this._host.requestUpdate();
    });
  }

  /** Draw the look in `mode` on the card. */
  private _paint(mode: Mode): void {
    this.mode = mode;
    this._shown = mode;
    applyTokens(this._host, { ...themeTokens(this.look, mode), '--pv-motion': this.motion });
    this._host.setAttribute('appearance', mode);
    this._host.setAttribute('motion', this.motion);
  }

  /** Look again at the next change, the end of a quiet moment, or in a minute. */
  private _schedule(next: Date | null): void {
    clearTimeout(this._timer);
    const now = Date.now();
    const at = Math.min(now + RECHECK_MS, next ? next.getTime() + 1000 : Number.POSITIVE_INFINITY, this._quietUntil + 50);
    this._timer = setTimeout(() => this._host.requestUpdate(), Math.max(0, at - now));
  }

  private _onInteraction = (): void => {
    this._lastInteraction = Date.now();
  };

  /** A screen waking from sleep switches at once, with no change to play (spec 12.4). */
  private _onVisibility = (): void => {
    if (document.visibilityState !== 'visible') return;
    this._wake = true;
    this._host.requestUpdate();
  };

  private _onReducedChange = (): void => {
    this._host.requestUpdate();
  };
}
```

- [ ] **Step 5: The card draws the appearance**

In `src/shell/planavista-card.ts`:
- Import `AppearanceEdits`, `AppearanceController`, `sunOf`, and `appearanceDependencies`. Add, after `_drafts`:

```ts
  /** Appearance changes on their way to Home Assistant; Settings and setup share them (Task 13). */
  private _appearanceEdits = new AppearanceEdits(() => this.requestUpdate());
  @state() private _moduleOverlay = false;
  private _appearance = new AppearanceController(
    this,
    this._appearanceEdits,
    () => ({
      display: this._data()?.display as Record<string, unknown> | undefined,
      cardTheme: this._config?.theme,
      sun: sunOf(this.hass?.states as never),
      haDark: !!(this.hass as unknown as { themes?: { darkMode?: boolean } })?.themes?.darkMode,
      overlayOpen: !!this._sheet || this._settingsOpen || this._wizardOpen || this._moduleOverlay,
    }),
    async () => {
      await this.updateComplete;
      await (this.renderRoot.querySelector('.pv-module') as { updateComplete?: Promise<unknown> } | null)?.updateComplete;
    },
  );
```

  and in the constructor (add one: `constructor() { super(); this._drafts.set('appearance', this._appearanceEdits); }`).
- `shouldUpdate`: a `hass`-only change also re-renders when `appearanceDependencies(this._appearance.settings).haDarkMode` is true and `prev?.themes?.darkMode` differs from the new one; `_watchedEntityIds()` adds `appearanceDependencies(this._appearance.settings).entities` (sun.sun while Automatic follows the sun).
- Remove the old engine's use: `_applySavedTheme`, `_onThemePreview`, `_previewOverrides`, `_previewed`, every `clearThemeCache` and `applyThemeWithOverrides` call, the theme block in `updated()`, and the `@theme-preview` listeners on `pv-settings` and `pv-setup`. `_onSettingsClose` closes Settings and forgets how it was opened, nothing more; the `styles/themes` import goes.
- `_renderModule` passes `.mode=${this._appearance.mode}` and `.shape=${this._appearance.look.shape}`, and listens for `pv-overlay-change` (`this._moduleOverlay = e.detail.open`).
- `pv-setup` gets `.drafts=${this._drafts}`. In `src/shell/setup/pv-setup.ts`, add `@property({ attribute: false }) drafts = new Map<string, unknown>();` and pass `.drafts=${this.drafts}` to every step element, as `pv-settings` does.

- [ ] **Step 6: The calendar follows the mode and the shape**

In `src/modules/calendar/calendar-module.ts`:
- Add `@property({ attribute: false }) mode: Mode = 'light';` and `@property({ attribute: false }) shape: ThemeShape = {};`; remove `previewOverrides`.
- In `_renderView`: `const avatarBorder = this.shape.avatar_border || 'primary';` and `const showStripes = (this.shape.event_style || 'stripes') === 'stripes';`. (`pv-view-day` already draws a named color as the border; `white` arrives as the color white.)
- In `updated()`, fire `pv-overlay-change` with `{ open: !!(store.selectedEvent || store.dialogOpen) }` (bubbles, composed) whenever that value differs from the last one fired, and with `{ open: false }` from `disconnectedCallback()` if the last one was open.

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `309 passed`; the build succeeds.

- [ ] **Step 7: Spike: does Home Assistant's page let the card take part in a view transition?**

The card lives inside Home Assistant's shadow roots. Check that Chrome captures it by its `view-transition-name`:

```bash
bash scripts/dev-ha.sh deploy-frontend
```

In a fresh isolated context as Dev at 1280 × 800 on the Wall Calendar dashboard, run in the page:

```js
const hass = document.querySelector('home-assistant').hass;
await hass.callService('select', 'select_option', { entity_id: 'select.planavista_appearance', option: 'dark' });
await new Promise(r => setTimeout(r, 400));
({ kind: document.documentElement.dataset.pvVt, pseudo: document.getAnimations().map(a => a.effect?.pseudoElement).filter(Boolean) });
```

Expected: `kind` is `dusk` and `pseudo` lists `::view-transition-old(planavista-1)` (the sweep is running on the card); two seconds later the card is dark (`appearance="dark"` on the card element). Screenshot mid-sweep if the timing allows.

If the pseudo-element list is empty (the card wasn't captured), switch `start()` in `view-transition.ts` to the page itself: don't set `view-transition-name` on cards, call `transitionCss(['root'], kind)`, and animate `::view-transition-old(root)` and `::view-transition-new(root)`; since only the cards change, only they visibly sweep. Ledger the result either way as a ruling.

Set the select back to `light` and check that the dawn sweep plays.

- [ ] **Step 8: Never mid-touch, and asleep screens just switch**

In the same context:
- Tap the card (a click on an empty part of the calendar), then within a second set Dark through `hass.callService` as above: `document.documentElement.dataset.pvVt` stays unset for about 10 seconds, then the sweep plays.
- Open an event's popup and set Light: nothing changes while it's open; closing it and waiting 10 seconds plays the dawn sweep.
- Open a second tab and select it, set Dark from the first tab's console in a third context or with `python scripts/ha.py api POST /api/services/select/select_option '{"entity_id": "select.planavista_appearance", "option": "dark"}'`, then select the card's tab again: the card is already dark and `dataset.pvVt` is unset (no replay).
- Reload the page while Dark: it loads dark with no sweep.
- In Chrome's rendering panel, emulate `prefers-reduced-motion: reduce`, then switch: a quick fade.
Close every page and set the select back to `light`. Discard the bundle.

- [ ] **Step 9: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/appearance-deps.ts test/appearance-deps.test.ts src/shell/view-transition.ts src/shell/appearance-controller.ts src/shell/planavista-card.ts src/modules/calendar/calendar-module.ts src/shell/setup/pv-setup.ts
git commit -F - <<'EOF'
feat(frontend): switch between light and dark, at sunset or by hand

The card draws its theme's light or dark version and changes between
them on its own: at sunset and sunrise, on a schedule, or with Home
Assistant's own theme. Night falls from the top of the screen and day
rises from the bottom, never in the middle of a touch or under an open
sheet; a screen that was asleep wakes up already changed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 11: The calendar in portrait, on phones, and at night

**Files:**
- Create: `src/modules/calendar/layout-rules.ts`, `test/layout-rules.test.ts`
- Create: `src/modules/calendar/mode-colors.ts`, `test/mode-colors.test.ts`
- Modify: `src/modules/calendar/calendar-module.ts`, `src/modules/calendar/components/view-day.ts`, `view-month.ts`, `view-week.ts`, `view-agenda.ts`

Spec 12.2 and 12.3: in portrait the Day view shows about 14 hours instead of about 8, Month's taller cells show more events, Week keeps days across (four in landscape, two in portrait, one on a phone), and Agenda is already a portrait shape. Spec 12.4: dark is designed, not inverted; people's colors keep their hue and brighten a little, the letters on them turn dark, and tints have dark versions.

**Interfaces:**
- Consumes: Task 4's `personColors` and `Mode`; Task 10's `.mode` on the module; milestone 2's `Layout`.
- Produces (`src/modules/calendar/layout-rules.ts`): `HOUR_PX = 80`, `dayHourHeight(layout, viewHeight)`, `rescaleScroll(scrollTop, fromHourPx, toHourPx)`, `monthCellEvents(count, cellHeight) -> { shown; more }`.
- Produces (`src/modules/calendar/mode-colors.ts`): `withModeColors(data, mode) -> PlanaVistaData | null` (the same object in light mode).
- Changes: every calendar view takes a reflected `layout` attribute from the module.

- [ ] **Step 1: Write the failing tests**

Create `test/layout-rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { dayHourHeight, monthCellEvents, rescaleScroll } from '../src/modules/calendar/layout-rules';

describe('Day view hours', () => {
  it('keep 80 px in landscape and on phones', () => {
    expect(dayHourHeight('landscape', 600)).toBe(80);
    expect(dayHourHeight('phone', 640)).toBe(80);
  });

  it('fit about 14 hours in portrait, between 48 and 80 px each', () => {
    expect(dayHourHeight('portrait', 1030)).toBe(73);
    expect(dayHourHeight('portrait', 500)).toBe(48);
    expect(dayHourHeight('portrait', 1400)).toBe(80);
    expect(dayHourHeight('portrait', 0)).toBe(80);
  });

  it('keep the same time at the top when the hours change size', () => {
    expect(rescaleScroll(800, 80, 73)).toBe(730);
    expect(rescaleScroll(800, 0, 73)).toBe(800);
  });
});

describe('Month cells', () => {
  it('show three events and "+N more" before they are measured, as 1.1.0 did', () => {
    expect(monthCellEvents(5, 0)).toEqual({ shown: 3, more: 2 });
    expect(monthCellEvents(2, 0)).toEqual({ shown: 2, more: 0 });
  });

  it('show as many as fit, keeping a line for "+N more"', () => {
    expect(monthCellEvents(3, 100)).toEqual({ shown: 3, more: 0 });
    expect(monthCellEvents(5, 100)).toEqual({ shown: 2, more: 3 });
    expect(monthCellEvents(5, 166)).toEqual({ shown: 5, more: 0 });
    expect(monthCellEvents(9, 166)).toEqual({ shown: 5, more: 4 });
    expect(monthCellEvents(4, 30)).toEqual({ shown: 1, more: 3 });
  });
});
```

Create `test/mode-colors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { matchedInk, toOklch } from '../src/core/color';
import { withModeColors } from '../src/modules/calendar/mode-colors';
import type { PlanaVistaData } from '../src/types';

const data = {
  calendars: [{ entity_id: 'calendar.test_alex', display_name: 'Alex', color: '#F94144', color_light: '#FDBDBE', icon: '', person_entity: '', visible: true }],
  events: [{ summary: 'Dentist', start: '', end: '', calendar_entity_id: 'calendar.test_alex', calendar_name: 'Alex', calendar_color: '#F94144', calendar_color_light: '#FDBDBE' }],
  display: {},
} as unknown as PlanaVistaData;

describe('withModeColors', () => {
  it('hands back the same data in light mode', () => {
    expect(withModeColors(data, 'light')).toBe(data);
    expect(withModeColors(null, 'dark')).toBeNull();
  });

  it('brightens people and darkens their tints in dark mode', () => {
    const dark = withModeColors(data, 'dark')!;
    expect(dark.calendars[0].color).toBe(matchedInk('#F94144'));
    expect(toOklch(dark.calendars[0].color_light).l).toBeCloseTo(0.255, 2);
    expect(dark.events[0].calendar_color).toBe(dark.calendars[0].color);
    expect(dark.events[0].calendar_color_light).toBe(dark.calendars[0].color_light);
    expect(data.calendars[0].color).toBe('#F94144');
  });
});
```

Run: `npm test -- layout-rules mode-colors`
Expected: both fail to resolve their modules.

- [ ] **Step 2: Create the rules**

Create `src/modules/calendar/layout-rules.ts`:

```ts
import type { Layout } from '../../core/layout';

/** The Day view's hour height in landscape and on phones, as in 1.1.0. */
export const HOUR_PX = 80;
const PORTRAIT_HOURS = 14;
const MIN_HOUR_PX = 48;

/**
 * The Day view's hour height. In portrait the view fits about 14 hours
 * instead of about 8 (spec 12.2), between 48 and 80 px an hour.
 */
export function dayHourHeight(layout: Layout, viewHeight: number): number {
  if (layout !== 'portrait' || !(viewHeight > 0)) return HOUR_PX;
  return Math.max(MIN_HOUR_PX, Math.min(HOUR_PX, Math.floor(viewHeight / PORTRAIT_HOURS)));
}

/** The scroll position that keeps the same time at the top when the hour height changes (rotating keeps your place). */
export function rescaleScroll(scrollTop: number, fromHourPx: number, toHourPx: number): number {
  return fromHourPx > 0 ? Math.round((scrollTop * toHourPx) / fromHourPx) : scrollTop;
}

/** A Month cell's day number, an event row, and the "+N more" line, in px. */
const NUMBER_PX = 28;
const ROW_PX = 21;
const MORE_PX = 14;
/** Before the grid is measured, as in 1.1.0. */
const UNMEASURED = 3;

/**
 * How many of a day's events a Month cell shows, and how many go behind
 * "+N more": as many as fit, so taller portrait cells show more (spec 12.3).
 */
export function monthCellEvents(count: number, cellHeight: number): { shown: number; more: number } {
  if (!(cellHeight > 0)) {
    const shown = Math.min(count, UNMEASURED);
    return { shown, more: count - shown };
  }
  const room = cellHeight - NUMBER_PX;
  if (count <= Math.floor(room / ROW_PX)) return { shown: count, more: 0 };
  const shown = Math.min(count, Math.max(1, Math.floor((room - MORE_PX) / ROW_PX)));
  return { shown, more: count - shown };
}
```

Create `src/modules/calendar/mode-colors.ts`:

```ts
import type { PlanaVistaData } from '../../types';
import { Mode, personColors } from '../../styles/theme-pairs';

/**
 * The data with each person's colors for the mode: as saved in light, and
 * in dark their color brightened and their events on a dark tint (spec 12.4).
 * Light mode hands back the same object, so nothing downstream recomputes.
 */
export function withModeColors(data: PlanaVistaData | null, mode: Mode): PlanaVistaData | null {
  if (!data || mode === 'light') return data;
  const cache = new Map<string, { color: string; colorLight: string }>();
  const colors = (color: string, light: string | undefined) => {
    const key = `${color}|${light ?? ''}`;
    let found = cache.get(key);
    if (!found) {
      found = personColors(color, light, mode);
      cache.set(key, found);
    }
    return found;
  };
  return {
    ...data,
    calendars: (data.calendars || []).map(cal => {
      const { color, colorLight } = colors(cal.color, cal.color_light);
      return { ...cal, color, color_light: colorLight };
    }),
    events: (data.events || []).map(event => {
      const { color, colorLight } = colors(event.calendar_color, event.calendar_color_light);
      return { ...event, calendar_color: color, calendar_color_light: colorLight };
    }),
  };
}
```

Run: `npm test -- layout-rules mode-colors`
Expected: `7 passed`.

- [ ] **Step 3: The module hands on the mode's colors and the layout**

In `src/modules/calendar/calendar-module.ts`:
- `_derive` takes the mode: `memoizeOne((data, config, hidden, mode: Mode) => deriveCalendarData(withModeColors(data, mode), config, hidden))`, called with `this.mode`. `_onEventClick` reads its shared-event siblings from `withModeColors(this.data, this.mode)?.events` so the popup's colors match.
- Each view element gets `layout=${this.layout}`.

- [ ] **Step 4: The Day view fits its hours to portrait**

In `src/modules/calendar/components/view-day.ts`:
- Replace `const HOUR_HEIGHT = 80;` with an import of `HOUR_PX`, `dayHourHeight`, and `rescaleScroll` from `../layout-rules`; add `@property({ type: String, reflect: true }) layout: Layout = 'landscape';` and `@state() private _hourPx = HOUR_PX;`.
- `.time-grid`'s height becomes `calc(24 * var(--pv-hour-px, 80px))`, and `.day-container` gets `style="--pv-hour-px: ${this._hourPx}px"`. Event positions are already percentages of the grid, so they follow.
- Observe `.time-grid-wrapper` with a `ResizeObserver` that calls `_fitHours()`. The wrapper is missing while no calendar is visible, so check in `updated()` and observe it whenever it is a new element; call `_fitHours()` too when `layout` changes; disconnect the observer in `disconnectedCallback`. `_fitHours()`: `const next = dayHourHeight(this.layout, wrapper.clientHeight)`; when it differs from `_hourPx`, work out `rescaleScroll(wrapper.scrollTop, this._hourPx, next)`, set `_hourPx`, and after the update set `wrapper.scrollTop` to it, so the same time stays at the top (rotating keeps your place, spec 12.1).

- [ ] **Step 5: Month fits its events, and Week its columns**

- `view-month.ts`: add the reflected `layout` property and `@state() private _cellHeight = 0;`, set from a `ResizeObserver` on `.month-grid` (`clientHeight / 6`). In `_renderDayCell`, `const { shown, more } = monthCellEvents(dayEvents.length, this._cellHeight);` replaces `MAX_VISIBLE_EVENTS` (delete the constant): `dayEvents.slice(0, shown)`, and "+{more} more" when `more > 0`.
- `view-week.ts`: add the reflected `layout` property. Remove the `grid-template-columns` declarations from its `max-width: 1023px` and `max-width: 767px` media queries (their other rules stay) and add `:host([layout='landscape']) .day-grid { grid-template-columns: repeat(4, 1fr); }`, `:host([layout='portrait']) .day-grid { grid-template-columns: repeat(2, 1fr); }`, and `:host([layout='phone']) .day-grid { grid-template-columns: 1fr; }`.
- `view-agenda.ts`: add the reflected `layout` property (nothing depends on it yet).

- [ ] **Step 6: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `316 passed`; the build succeeds.

`bash scripts/dev-ha.sh deploy-frontend`. In a fresh isolated context as Dev, with the dev events seeded for this week:
- 800 × 1280, Day: about 7 AM to 9 PM in view at once; Month: cells show more events than at 1280 × 800; Week: two days across.
- 390 × 844: Week one day across; Day keeps everyone's columns; the chips choose who shows.
- At 1280 × 800 on Day scrolled to the afternoon, resize to 800 × 1280: the afternoon is still at the top.
- Set the select to Dark (`python scripts/ha.py api POST /api/services/select/select_option '{"entity_id": "select.planavista_appearance", "option": "dark"}'`): every view, the event popup, and the New event dialog in Dark at all three sizes. People's colors are brighter, events sit on dark tints with light text, all-day chips have dark letters, and nothing is white-on-white or black-on-black. Screenshot each into `m3-verify/` in the scratchpad. Set it back to Light.
Close every page. Discard the bundle.

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/modules/calendar/layout-rules.ts test/layout-rules.test.ts src/modules/calendar/mode-colors.ts test/mode-colors.test.ts src/modules/calendar/calendar-module.ts src/modules/calendar/components/view-day.ts src/modules/calendar/components/view-month.ts src/modules/calendar/components/view-week.ts src/modules/calendar/components/view-agenda.ts
git commit -F - <<'EOF'
feat(frontend): fit the calendar to portrait, phones, and dark mode

In portrait the Day view shows about fourteen hours at once, Month shows
as many events as its taller days hold, and Week shows two days across.
Turning the tablet keeps the same time in view. At night people's colors
brighten a little and their events sit on dark tints.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 12: Sheets that rise, follow the finger, and settle

**Files:**
- Create: `src/shell/sheet-motion.ts`
- Modify: `src/styles/sheet.ts`, `src/shell/pv-notice-sheet.ts`, `src/shell/pv-pin-sheet.ts`

Spec 12.3: in portrait and on phones sheets rise from the bottom, only as tall as their content, with drag to dismiss; in landscape they are centered cards. Spec 11.5: springs, not timers; reduced motion becomes quick fades. Every notice in Settings (Remove PIN, a person's prompts) uses `pv-notice-sheet`, so it moves the same way; the motion comes from the card's `--pv-motion`, which reaches into every shadow root.

**Interfaces:**
- Consumes: Task 6's `SMOOTH`, `BOUNCY`, `springEasing`, `sheetDragOffset`, `sheetDragOutcome`; Task 10's `--pv-motion`.
- Produces (`src/shell/sheet-motion.ts`): `motionOf(element) -> Motion`, `class SheetMotion(host)` with `open(panel, backdrop)`, `close(panel, backdrop) -> Promise<void>`, `attachDrag(zone, panel, onClose) -> () => void`.
- Changes: both sheets fire their closing events (`pv-sheet-action`, `pv-sheet-close`, `pv-unlocked`) after their exit animation, not before.

- [ ] **Step 1: Create `src/shell/sheet-motion.ts`**

```ts
import type { Layout } from '../core/layout';
import { BOUNCY, Motion, SMOOTH, springEasing } from '../core/motion';
import { sheetDragOffset, sheetDragOutcome } from '../core/sheet-drag';

/**
 * Full or reduced motion where an element is drawn. The card sets
 * --pv-motion (spec 11.5), and custom properties reach into every shadow
 * root, so a sheet inside a Settings page reads it too.
 */
export function motionOf(element: Element): Motion {
  const value = getComputedStyle(element).getPropertyValue('--pv-motion').trim();
  if (value === 'reduced' || value === 'full') return value;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}

const QUICK_MS = 150;

/**
 * A sheet's entrance, exit, and drag to dismiss (spec 12.3) with the
 * approved springs: in portrait and on phones it rises from the bottom and
 * follows a finger down; in landscape it pops in as a centered card.
 */
export class SheetMotion {
  constructor(private readonly _host: HTMLElement & { layout: Layout }) {}

  private get _rises(): boolean {
    return this._host.layout !== 'landscape';
  }

  open(panel: HTMLElement, backdrop: HTMLElement): void {
    backdrop.animate({ opacity: [0, 1] }, { duration: 200, easing: 'ease-out' });
    if (motionOf(this._host) === 'reduced') {
      panel.animate({ opacity: [0, 1] }, { duration: QUICK_MS, easing: 'ease-out' });
      return;
    }
    const spring = springEasing(SMOOTH);
    panel.animate(
      this._rises ? { transform: ['translateY(105%)', 'translateY(0)'] } : { transform: ['scale(0.96)', 'scale(1)'], opacity: [0, 1] },
      { duration: spring.duration, easing: spring.easing },
    );
  }

  /** Animate out; resolves once the sheet has left, so it closes only then. */
  async close(panel: HTMLElement, backdrop: HTMLElement): Promise<void> {
    const reduced = motionOf(this._host) === 'reduced';
    const now = getComputedStyle(panel).transform;
    const from = now && now !== 'none' ? now : 'translateY(0)';
    const out = reduced
      ? panel.animate({ opacity: [1, 0] }, { duration: QUICK_MS, easing: 'ease-in', fill: 'forwards' })
      : panel.animate(
          this._rises ? { transform: [from, 'translateY(105%)'] } : { transform: ['scale(1)', 'scale(0.96)'], opacity: [1, 0] },
          { duration: this._rises ? 240 : 160, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
        );
    backdrop.animate({ opacity: [1, 0] }, { duration: reduced ? QUICK_MS : 200, easing: 'ease-in', fill: 'forwards' });
    await out.finished.catch(() => undefined);
  }

  /** Let a finger drag the panel down by `zone`; `onClose` when it should close. Returns a function that stops listening. */
  attachDrag(zone: HTMLElement, panel: HTMLElement, onClose: () => void): () => void {
    let start: { y: number; t: number } | null = null;
    let dy = 0;
    const down = (e: PointerEvent) => {
      if (!this._rises) return;
      start = { y: e.clientY, t: performance.now() };
      dy = 0;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture is a nicety; the drag still works without it.
      }
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      dy = sheetDragOffset(e.clientY - start.y);
      panel.style.transform = `translateY(${dy}px)`;
    };
    const up = () => {
      if (!start) return;
      const outcome = sheetDragOutcome(dy, performance.now() - start.t);
      start = null;
      if (outcome === 'close') {
        onClose();
        return;
      }
      const settle = motionOf(this._host) === 'reduced' ? { duration: 120, easing: 'ease-out' } : springEasing(BOUNCY);
      panel.style.transform = '';
      panel.animate({ transform: [`translateY(${dy}px)`, 'translateY(0)'] }, { duration: settle.duration, easing: settle.easing });
    };
    zone.addEventListener('pointerdown', down);
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', up);
    return () => {
      zone.removeEventListener('pointerdown', down);
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerup', up);
      zone.removeEventListener('pointercancel', up);
    };
  }
}
```

- [ ] **Step 2: Sheets draw a grab handle and stop animating in CSS**

In `src/styles/sheet.ts`, delete the `@media (prefers-reduced-motion: no-preference)` block and both `@keyframes` (script animates now), and add:

```css
  /* The band a finger drags down to close the sheet (portrait and phone). */
  .grab-zone {
    display: none;
    margin: -12px -20px 4px;
    padding: 10px 0 14px;
    touch-action: none;
    cursor: grab;
  }

  :host(:not([layout='landscape'])) .grab-zone {
    display: block;
  }

  .grab {
    width: 36px;
    height: 5px;
    margin: 0 auto;
    border-radius: 3px;
    background: var(--pv-border, #E7E7E3);
  }

  .panel {
    will-change: transform;
  }
```

- [ ] **Step 3: The notice sheet and the PIN sheet move**

In both `src/shell/pv-notice-sheet.ts` and `src/shell/pv-pin-sheet.ts`:
- Add `private _sheetMotion = new SheetMotion(this);`, `private _detachDrag: (() => void) | null = null;`, and `private _closing = false;`.
- The panel's first child is `<div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>`.
- In `firstUpdated`, after focusing as today: `this._sheetMotion.open(panel, backdrop)` and `this._detachDrag = this._sheetMotion.attachDrag(zone, panel, () => this._leave(cancelDetail))`, where the cancel detail is `{ id: 'cancel' }` for notices and the plain `pv-sheet-close` for the PIN sheet. `disconnectedCallback` calls `this._detachDrag?.()`.
- One way out: `private async _leave(fire: () => void)` returns at once if `_closing`, else sets it, awaits `this._sheetMotion.close(panel, backdrop)`, then calls `fire()`. Every button, Escape, a tap on the backdrop, a drag past the line, and (PIN sheet) a correct PIN go through it; the PIN sheet's `pv-unlocked` fires after the sheet has left.
- `pv-pin-sheet`: its two `prefers-reduced-motion` media queries for the wrong-PIN shake become `:host([reduced]) .boxes.shake { animation: pv-fade 300ms ease-in-out; }` and `:host(:not([reduced])) .boxes.shake { animation: pv-shake 300ms ease-in-out; }`, with the `reduced` attribute set in `connectedCallback()` from `motionOf(this) === 'reduced'`.

- [ ] **Step 4: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `316 passed`; the build succeeds.

`bash scripts/dev-ha.sh deploy-frontend`. In a fresh isolated context signed in as Kitchen:
- 800 × 1280: the gear's PIN sheet rises from the bottom on a gentle spring; dragging its handle down 40 px and letting go settles it back with a small bounce; dragging past 90 px, or a quick flick, closes it, and focus returns to the gear; Cancel slides it down before it's gone.
- 1280 × 800: it pops in as a centered card and Escape closes it with a short exit.
- In parent mode, Settings, PINs and parent mode, Remove PIN: the notice moves the same way.
- With `python scripts/ha.py ws '{"type": "planavista/config/save", "display": {"motion": "reduced"}}'` (as the dev admin): the sheets fade in and out, and a wrong PIN fades instead of shaking. Set `motion` back to `device` the same way.
Close every page. Discard the bundle.

- [ ] **Step 5: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/shell/sheet-motion.ts src/styles/sheet.ts src/shell/pv-notice-sheet.ts src/shell/pv-pin-sheet.ts
git commit -F - <<'EOF'
feat(frontend): let sheets rise on a spring and close with a drag

In portrait and on phones the PIN sheet and every notice rise from the
bottom and follow a finger down to close; in landscape they pop in as a
card. Each leaves before it closes, and Reduced motion turns it all into
quick fades.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 13: Appearance and Customize in Settings, and the Look step

**Files:**
- Create: `src/core/contrast-guard.ts`, `test/contrast-guard.test.ts`
- Create: `src/shell/settings/pv-appearance-editor.ts`, `src/shell/settings/pv-settings-customize.ts`
- Modify: `src/shell/settings/appearance-page.ts`, `src/shell/setup/look-step.ts`, `src/shell/definition.ts`
- Delete: `src/shell/settings/theme-picker.ts`, `src/styles/themes.ts`; `themeDisplayChange` in `src/core/display.ts` and its two tests in `test/display.test.ts`

Spec 12.4 and 14.5: Appearance offers Light, Dark, and Automatic as small pictures of the card (Automatic split corner to corner), when Automatic switches, the three themes showing both halves, Customize with a Light and a Dark swatch for each color (Dark starts as Matched), a flag with a one-tap fix for a color that would be hard to read, the shared shape settings, Reset, and Motion. It applies as you tap (spec 14.1). Setup's Look step is the same editor without Customize and Motion (spec 14.7).

**Interfaces:**
- Consumes: Task 4 (`themeTokens`, `HEADER_PRESETS`), Task 5 (`appearanceSettings`, `lookOf`, `sunSummary`, `appearanceSummary`, the label maps, `AppearanceEdits`), Task 10 (`sunOf`; the card's drafts entry `'appearance'`), milestone 2's `PUSH_PAGE`, `PAGE_ERROR`, `saveErrorMessage`, `errorCode`, `pv-color-swatch-picker`, and `pv-notice-sheet`.
- Produces (`src/core/contrast-guard.ts`): `type ColorKey`, `interface ContrastIssue { mode; key; message; fix }`, `contrastIssues(look) -> ContrastIssue[]`.
- Produces: `pv-appearance-editor` (`hass`, `data`, `api`, `layout`, `mode: 'settings' | 'setup'`, `drafts`) and `pv-settings-customize` (the same, pushed from Appearance).

- [ ] **Step 1: Write the failing test**

Create `test/contrast-guard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/core/color';
import { contrastIssues } from '../src/core/contrast-guard';
import { Look, themeTokens } from '../src/styles/theme-pairs';

const look = (changes: Partial<Look>): Look => ({ pair: 'planavista', light: {}, dark: {}, shape: {}, ...changes });

describe('contrastIssues', () => {
  it('finds nothing in the themes as they come', () => {
    expect(contrastIssues(look({}))).toEqual([]);
    expect(contrastIssues(look({ pair: 'minimal' }))).toEqual([]);
    expect(contrastIssues(look({ pair: 'vibrant' }))).toEqual([]);
  });

  it('flags a dark now line on the dark background, with a fix that reads', () => {
    const issues = contrastIssues(look({ dark: { now_color: '#30343F' } }));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ mode: 'dark', key: 'now_color', message: 'The dark now line is hard to see on this background.' });
    expect(contrastRatio(issues[0].fix, themeTokens(look({}), 'dark')['--pv-card-bg'])).toBeGreaterThanOrEqual(3);
  });

  it('flags a pale accent only where it is pale', () => {
    const issues = contrastIssues(look({ light: { accent: '#F9C74F' } }));
    expect(issues.map(i => [i.mode, i.key])).toEqual([['light', 'accent']]);
    expect(contrastRatio(issues[0].fix, '#FFFFFF')).toBeGreaterThanOrEqual(3);
  });

  it('flags a header and a background whose text is hard to read, and the fixes work', () => {
    const issues = contrastIssues(look({ light: { header: '#7F7F7F', background: '#7F7F7F' } }));
    expect(issues.map(i => i.key).sort()).toEqual(['background', 'header']);
    const fixed = Object.fromEntries(issues.map(i => [i.key, i.fix]));
    expect(contrastIssues(look({ light: fixed }))).toEqual([]);
  });

  it('leaves gradient headers alone', () => {
    expect(contrastIssues(look({ light: { header: 'gradient_teal' } }))).toEqual([]);
  });
});
```

Run: `npm test -- contrast-guard`
Expected: `Failed to resolve import "../src/core/contrast-guard"`.

- [ ] **Step 2: Create `src/core/contrast-guard.ts`**

```ts
import { adjustForContrast, contrastRatio, parseHex } from './color';
import { Look, Mode, ThemeColors, Tokens, themeTokens } from '../styles/theme-pairs';

export type ColorKey = keyof ThemeColors;

/** A color the household set that would be hard to read, and its one-tap fix (spec 12.4). */
export interface ContrastIssue {
  mode: Mode;
  key: ColorKey;
  message: string;
  /** The color to save for this version (a Matched dark color becomes one set by hand). */
  fix: string;
}

interface Rule {
  /** WCAG's 3:1 for lines and controls, 4.5:1 for text. */
  min: number;
  message(mode: Mode): string;
  /** The contrast to judge; null when there's nothing to judge (a gradient header). */
  ratio(t: Tokens): number | null;
  /** The color that moves, adjusted to reach `target`. */
  fix(t: Tokens, target: number): string | null;
}

const RULES: Record<ColorKey, Rule> = {
  background: {
    min: 4.5,
    message: mode => `Text is hard to read on the ${mode} background.`,
    ratio: t => contrastRatio(t['--pv-text'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-bg'], t['--pv-text'], target),
  },
  accent: {
    min: 3,
    message: mode => `The ${mode} accent is hard to see on this background.`,
    ratio: t => contrastRatio(t['--pv-accent'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-accent'], t['--pv-card-bg'], target),
  },
  header: {
    min: 4.5,
    message: mode => `Text on the ${mode} header is hard to read.`,
    // Gradients and 1.1.0's presets were drawn for their text.
    ratio: t => (parseHex(t['--pv-header-gradient']) ? contrastRatio(t['--pv-header-text'], t['--pv-header-gradient']) : null),
    fix: (t, target) => adjustForContrast(t['--pv-header-gradient'], t['--pv-header-text'], target),
  },
  now_color: {
    min: 3,
    message: mode => `The ${mode} now line is hard to see on this background.`,
    ratio: t => contrastRatio(t['--pv-now-color'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-now-color'], t['--pv-card-bg'], target),
  },
};

const KEYS = Object.keys(RULES) as ColorKey[];

function fails(rule: Rule, t: Tokens): boolean {
  const ratio = rule.ratio(t);
  return ratio !== null && ratio < rule.min;
}

function withColor(look: Look, mode: Mode, key: ColorKey, value: string): Look {
  return { ...look, [mode]: { ...look[mode], [key]: value } };
}

/** The colors this version shows that the household chose: set by hand, or Matched from a light one they set. */
function chosen(look: Look, mode: Mode): ColorKey[] {
  const own = mode === 'light' ? look.light : look.dark;
  return KEYS.filter(key => own[key] !== undefined || (mode === 'dark' && look.light[key] !== undefined));
}

/** Every color the household chose that would be hard to read, light version first, each with a fix that works. */
export function contrastIssues(look: Look): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const mode of ['light', 'dark'] as Mode[]) {
    const tokens = themeTokens(look, mode);
    for (const key of chosen(look, mode)) {
      const rule = RULES[key];
      if (!fails(rule, tokens)) continue;
      // Ask for a little more each time until the whole look passes (cards sit slightly off the background).
      for (const extra of [0, 0.5, 1, 1.5, 2, 3]) {
        const fix = rule.fix(tokens, rule.min + extra);
        if (fix && !fails(rule, themeTokens(withColor(look, mode, key, fix), mode))) {
          issues.push({ mode, key, message: rule.message(mode), fix });
          break;
        }
      }
    }
  }
  return issues;
}
```

Run: `npm test -- contrast-guard`
Expected: `5 passed`.

- [ ] **Step 3: Create `pv-appearance-editor`**

`src/shell/settings/pv-appearance-editor.ts`, with `settingsPageStyles`, `buttonStyles`, and `formStyles`:
- **Changes.** `const edits = this.drafts.get('appearance') as AppearanceEdits`; what it shows is `edits.current(appearanceSettings(this.data.display))`. Every control calls `edits.set(changes, c => this.api.saveConfig({ display: c }), err => this._error(err), point)`, where `point` is the pointer's `clientX`/`clientY` for a tap (the center of the control for a key press), and `_error` fires `PAGE_ERROR` with `saveErrorMessage(errorCode(err))`. `connectedCallback` subscribes to the edits (`edits.subscribe(() => this.requestUpdate())`), and `disconnectedCallback` stops listening and calls `edits.flush()`, so the page also shows a change dropped after a failed save. Colors and shape always go as whole objects, never `null`.
- **Light, Dark, Automatic** (`role="radiogroup"`, `aria-label="Appearance"`): three 112 × 76 px pictures of the card drawn in CSS from `themeTokens(lookOf(current), 'light')` and `'dark'` (a header strip, a bar, three columns with a colored top line each); Automatic shows the light picture with the dark one clipped over it corner to corner (`clip-path: polygon(100% 0, 100% 100%, 0 100%)`). Labels under them; the chosen one has a `--pv-accent` ring and a check badge. Each is `role="radio"` with `aria-checked`, at least 48 px tall to the touch; Left and Right move the choice.
- **When to switch** (only while Automatic): three radio rows.
  - "At sunset and sunrise", with `sunSummary(sunOf(hass.states), new Date(), timeFormat)` under it, or "Uses your home's location in Home Assistant." while that's null. Without `sun.sun`: "Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is." (spec 15.4).
  - "On a schedule"; once chosen, two time fields, "Light from" and "Dark from" (`<input type="time">`, 48 px tall), each saving `light_from` or `dark_from` on change.
  - "Match Home Assistant", with "Each screen follows its own Home Assistant theme setting. Handy for phones."
- **Theme** (a radiogroup): PlanaVista, Minimal, and Vibrant, each a card showing its light half at the left and its dark half at the right, drawn from `themeTokens({ ...lookOf(current), pair }, mode)`, with its name. Under them: "Every theme has a light and a dark version. Automatic moves between them."
- **Customize** (Settings only): a row "Customize {PAIR_LABELS[pair]}" with "Light and dark colors, corners, shadows" and a chevron; it fires `PUSH_PAGE` with `{ tag: 'pv-settings-customize', title: 'Customize {theme}', back: 'Appearance' }`.
- **Motion** (Settings only): a segmented control "Follow the device", "Full", "Reduced" (`motion`), with "Reduced swaps movement for quick fades. Follow the device uses this screen's own setting."
- In landscape the pictures and theme cards sit in rows; in portrait and on phones the theme cards stack.

- [ ] **Step 4: Create `pv-settings-customize`**

`src/shell/settings/pv-settings-customize.ts`, sharing the same `AppearanceEdits`:
- It subscribes to the edits and flushes them the same way as the editor.
- **Colors.** A table with the columns Light and Dark and the rows Accent, Background, Header, and Now line. Each cell is a 48 px swatch button showing the color in effect for that version (from `themeTokens(look, mode)`: `--pv-accent`, `--pv-bg`, `--pv-header-gradient`, `--pv-now-color`) and a caption: "Original" for a light color left as the theme's, "Matched" for a dark color left to follow the light one, the preset's name for a header preset ("Plain", "Purple", "Teal", "Sunset", "Accent", "Dark"), and the hex code otherwise.
- Tapping a cell opens an editor under its row (one at a time, the cell `aria-expanded`): `pv-color-swatch-picker` for Accent, Background, and Now line; the header presets as chips plus the swatch picker for Header; and in each an "Original" (light) or "Matched" (dark) chip that removes that version's color. A choice saves `colors_light` or `colors_dark` as the whole object with that key set or deleted.
- **Hard to read.** Above the table, for each `contrastIssues(lookOf(current))`: "⚠ {message}" and a "Fix it" button (48 px) that saves `issue.fix` as that version's color (a Matched dark color becomes one set by hand). The list is a polite live region.
- **Shape, for both versions:** Corners (Sharp, Rounded, Pill), Shadows (None, Subtle, Bold), Events (Stripes, Solid), and Avatar border (Their color, White, Custom with a color field), each saving `shape` as the whole object.
- Under the table: "Dark colors follow your light ones until you change them. Matched means PlanaVista picks a dark color that goes with your light one; choose Matched again to go back."
- **Reset {theme} to its original colors** opens `pv-notice-sheet`: heading "Reset {theme} to its original colors?", body "Your light and dark colors go back to the theme's own. Corners, shadows, and the other shape settings stay.", actions Cancel and Reset (destructive). Reset saves `colors_light: {}` and `colors_dark: {}`.

- [ ] **Step 5: Wire the pages and remove the old engine**

- `appearance-page.ts` renders `<pv-appearance-editor mode="settings">` and `look-step.ts` `<pv-appearance-editor mode="setup">`, each passing `hass`, `data`, `api`, `layout`, and `.drafts`; both declare `@property({ attribute: false }) drafts`. `look-step.ts` keeps its heading from the registry.
- `shell/definition.ts`: the Appearance row's summary is `appearanceSummary(appearanceSettings(data.display))` ("Automatic · PlanaVista"); delete `THEME_NAMES`.
- Delete `theme-picker.ts` and `src/styles/themes.ts` (`grep -rn "styles/themes'\|theme-picker" src test` finds nothing afterwards), and `themeDisplayChange` with its two tests.

- [ ] **Step 6: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `319 passed` (316, plus 5, less the 2 `themeDisplayChange` tests); the build succeeds.

`bash scripts/dev-ha.sh deploy-frontend`. In a fresh isolated context as Dev:
- 1280 × 800, Settings, Appearance: tap Dark; the dark look spreads out from the finger in about half a second, and the row in the list says "Dark · PlanaVista". Tap Automatic, then On a schedule, and set Dark from a minute from now; close Settings and leave the screen alone: the sweep plays at that minute.
- Customize: pick a dark accent such as `#3B3BB0` for Dark; "⚠ The dark accent is hard to see on this background." appears with Fix it, which brightens it. Change Background's light color and check that Dark's says Matched and follows. Reset asks first and keeps the shape.
- 800 × 1280: the same pages stack with "‹ Settings" and "‹ Appearance".
- With the keyboard only: Tab reaches every picture, theme, row, and swatch, and Space or Enter chooses.
- Setup: set `onboarding_complete` false as in milestone 2's Task 12, open setup, and check that Look shows Light, Dark, Automatic, and the themes (no Customize, no Motion), and that a choice there shows at once; set it back.
Close every page. Set the appearance back to Light with no customizations. Discard the bundle.

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/contrast-guard.ts test/contrast-guard.test.ts src/shell/settings/pv-appearance-editor.ts src/shell/settings/pv-settings-customize.ts src/shell/settings/appearance-page.ts src/shell/setup/look-step.ts src/shell/definition.ts src/core/display.ts test/display.test.ts
git rm src/shell/settings/theme-picker.ts src/styles/themes.ts
git commit -F - <<'EOF'
feat(frontend): rebuild Appearance with light, dark, and automatic

Settings shows Light, Dark, and Automatic as pictures of the card,
when Automatic switches, and each theme with both of its halves.
Customize sets a light and a dark color for each part, flags any color
that would be hard to read with a one-tap fix, and keeps the shape
settings shared. Motion can follow the device or be set here.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 14: The design system, the README, and version 1.2.0

**Files:**
- Modify: `DESIGN_SYSTEM.md` (rewritten), `README.md`
- Modify: `custom_components/planavista/manifest.json`, `custom_components/planavista/const.py` (`VERSION`), `custom_components/planavista/frontend/package.json` and `package-lock.json`
- Modify: `custom_components/planavista/frontend/dist/planavista-cards.js` (the bundle, committed for HACS)

- [ ] **Step 1: Rewrite `DESIGN_SYSTEM.md`**

The design system describes the shell design language every module follows (spec 11 and 12). Keep what still holds from today's file (the event block rules, the Day view's person lanes, shared events in Week, the weather widget, card-level overrides) and replace the rest. Sections, in order:

1. **Principles:** warm, calm, encouraging, readable across a kitchen (spec 11.1); the signature is closing rings and rounded headings, and everything else stays quiet; the design directives are guidance, not limits (spec 3.5).
2. **Layout:** the card measures itself (the phone, portrait, and landscape table, the 0.95 to 1.05 dead band, the keyboard rule); the header and bar in each layout; sheets in two shapes; rotating keeps your place; the reference sizes. This replaces the width and height breakpoint tables, with a note that the calendar views' remaining viewport queries move over in milestone 7.
3. **Type:** rounded headings and numbers (`ui-rounded` and SF Pro Rounded on Apple devices, Nunito bundled elsewhere, no web fonts), system body text, tabular figures for clocks and counters; the correction that Inter was never bundled.
4. **Color:** every color has one job (member color, indigo, amber, red); color is never alone; chroma shrinks as area grows; neutrals do most of the work; the member palette; `contrastText()` by measured contrast (crossing at a relative luminance of about 0.2 against near-black `#1A1B1E`); the token list from `styles/theme-pairs.ts` with what each is for (`--pv-accent` filled, `--pv-accent-ink` for text and marks, the tints, the warn and bad pairs).
5. **Day and night:** Light, Dark, and Automatic (sun, schedule, Match Home Assistant); the transitions (night falls from the top, day rises from the bottom, a reveal from the finger, a fade with reduced motion, no change for a hidden page or a first load); never mid-touch; dark is designed, not inverted; themes in pairs; Matched colors and the contrast guard's thresholds (3:1 for lines and controls, 4.5:1 for text); `select.planavista_appearance`.
6. **Status map:** spec 11.4's table as it stands.
7. **Motion:** it tracks the finger (the 550 ms hold, the 12 px rule); springs with SwiftUI's parameters and the three presets with their settle times (639, 900, and 733 ms); every animation answers "what just happened?"; celebrations are earned; haptics and sound; reduced motion keeps the meaning and follows the Motion setting; only transform, opacity, and stroke offsets animate; the keyboard equivalent.
8. **States:** skeletons, not spinners; optimistic check-offs; designed empty and error states.
9. **Copy:** sentence case; one name per thing; no em dashes (the CI copy check); destructive actions confirmed by name; back controls name their parent; errors say what to do next.
10. **Accessibility:** 48 px targets, ring labels, sheets as dialogs, a keyboard path for every hold, reduced motion.
11. **Components:** the glance header, the bar, sheets, event blocks, the Day view's person lanes, Week's shared events, the weather widget, card-level overrides (today's content, brought up to date).
12. **Design changelog:** an entry for 2026-10-10, "Changed: the new look (1.2.0)", listing the header and bar, day and night with theme pairs, the rounded face, the contrastText fix, and sheet motion.

No em dashes; `python scripts/check_copy.py` passes.

- [ ] **Step 2: The README**

In `README.md`:
- A section **Appearance** after "People, PINs, and Settings": Light, Dark, and Automatic (at sunset and sunrise, on a schedule, or following each screen's Home Assistant theme); the three themes and their two versions; Customize, Matched dark colors, and the hard-to-read flag; Motion.
- A section **Automations**: `select.planavista_appearance`, with an example automation that turns the card Dark when a movie starts:

```yaml
triggers:
  - trigger: state
    entity_id: media_player.living_room_tv
    to: playing
actions:
  - action: select.select_option
    target:
      entity_id: select.planavista_appearance
    data:
      option: dark
```

- In the card options: `planavista-card` as the card's other name for new dashboards, the `modules` and `module` options, and that `hide_header` now hides the clock and weather header while the bar with the views and Settings stays.
- A short **Layouts** note: the card lays itself out for its own size, with the bar along the bottom in portrait and on phones.

- [ ] **Step 3: Version 1.2.0 and the bundle**

```bash
cd custom_components/planavista/frontend
npm version 1.2.0 --no-git-tag-version
cd ../../..
```

Set `"version": "1.2.0"` in `custom_components/planavista/manifest.json` and `VERSION: Final = "1.2.0"` in `const.py`. Then:

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test && npm run build && cd ../../..
bash scripts/test-backend.sh -q
python scripts/check_copy.py
```

Expected: no type errors; `319 passed`; the build succeeds; every backend test passes (the version test sees 1.2.0 in both files).

- [ ] **Step 4: Commit**

```bash
git add DESIGN_SYSTEM.md README.md custom_components/planavista/manifest.json custom_components/planavista/const.py custom_components/planavista/frontend/package.json custom_components/planavista/frontend/package-lock.json custom_components/planavista/frontend/dist/planavista-cards.js
git commit -F - <<'EOF'
docs: describe the new look, and build 1.2.0

The design system now covers layout by the card's own size, day and
night, the rounded face, color jobs and contrast, the status map,
motion, states, copy, and accessibility. The README describes
Appearance, select.planavista_appearance, and the card's layouts.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 15: Verify on the dev Home Assistant, review, and demo (controller)

- [ ] **Step 1: The upgrade, as a 1.1.0 household on Deep Dark would get it**

Put 1.1.0's appearance back on the dev entry and let the migration run again:

```bash
bash scripts/dev-ha.sh stop
MSYS_NO_PATHCONV=1 docker run --rm -v planavista-dev-config:/config python:3.14-alpine python -c "
import json; p='/config/.storage/core.config_entries'; d=json.load(open(p))
e=[x for x in d['data']['entries'] if x['domain']=='planavista'][0]
keys=['appearance','appearance_switch','light_from','dark_from','theme_pair','colors_light','colors_dark','shape','motion']
e['minor_version']=1; disp=e['data']['display']
[disp.pop(k, None) for k in keys]
disp.update(theme='dark', theme_overrides={'accent': '#277DA1', 'corner_style': 'pill'})
json.dump(d, open(p, 'w'), indent=2)"
bash scripts/dev-ha.sh start && bash scripts/dev-ha.sh wait
python scripts/ha.py api GET /api/states/select.planavista_appearance
python scripts/ha.py api GET /api/states/sensor.planavista_config
```

(Use the dev Home Assistant's real volume name from `docker inspect planavista-dev-ha` if it differs.) Expected: the select says `dark`; the display has `theme_pair: planavista`, `appearance: dark`, `colors_dark: {accent: #277DA1}`, `shape: {corner_style: pill}`, and still `theme: dark` with the same `theme_overrides` for 1.1.0. In the browser the card is PlanaVista in Dark with the blue accent and pill corners. Then set Light with no customizations again.

- [ ] **Step 2: Every view, every size, light and dark**

In fresh isolated contexts as Dev: Day, Week, Month, and Agenda at 1280 × 800, 800 × 1280, and 390 × 844, each in Light and in Dark (the select), screenshots into `m3-verify/`. Compare the light landscape shots with Task 0's baseline: the differences are the new header and bar, the new colors and faces, and nothing broken (every event, avatar, and control still there). Then with reduced motion emulated, and with the keyboard only (Tab through the bar, a view, Settings, Appearance, Customize). Check each account kind still works: Dev and Alex open Settings, Casey has no gear, Kitchen asks for a PIN in the rising sheet. Close every page.

- [ ] **Step 3: The bundle, CI, and the branch**

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../..
git status --short
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m3-new-look
```

Expected: the rebuilt bundle matches the committed one (no change shown); CI (Validate and Frontend) passes on the branch.

- [ ] **Step 4: The final review and the fix pass**

Run the executing-plans final review: `review-package` for `main..HEAD`, a fresh reviewer on the most capable model with this plan, the spec, the Review Focus above, and the ledger's `Ruling:` lines. Re-grade, fix Critical and Important findings test-first in one pass, ledger the minors, rebuild the bundle if the frontend changed, push, and wait for CI.

- [ ] **Step 5: The demo**

Screenshots for the owner, as before-and-after where it helps: the calendar in landscape and portrait in Light and Dark, a phone, Appearance and Customize (with a hard-to-read flag), the PIN sheet rising in portrait, and the sweep part way through if a shot catches it. Draft the 1.2.0 release notes in the scratchpad (no em dashes, nothing about earlier names or moves). Then the demo message: what's in it, what they're looking at, the finishing menu, "Rulings I made", and "Deferred minors". Wait for the go-ahead before any merge or release; after it, release 1.2.0 from main as the release process in CLAUDE.md says.
