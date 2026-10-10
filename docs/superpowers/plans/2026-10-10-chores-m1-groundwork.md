# Milestone 1, Groundwork: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare PlanaVista for modules with no visible change to the calendar: per-card calendar state, a shell that hosts registered modules (the calendar first), setup and Settings pages that come from registries, and a codebase with no em dashes plus a CI check that keeps it that way.

**Architecture:** The card element becomes a thin shell (header, setup and Settings host, theme) that renders the active module's element from a module registry. The calendar's toolbar, views, and event dialogs move into `pv-calendar-module`, which owns a per-card `CalendarStore` and hands it to its popup and dialog. The wizard's pages come from page registries that the shell and the calendar module fill. Logic that can be tested without a browser (registries, display resolution, calendar derivation, the initial view) lives in modules that import no Lit elements, covered by vitest in Node.

**Tech Stack:** TypeScript 5.7 (strict), Lit 3 (`lit/static-html.js`), Rollup 4, vitest 5 (Node environment), Python 3.14 and pytest (in Docker through `scripts/test-backend.sh`), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 1, with sections 6.3, 6.4, and 11.7.

## Global Constraints

- No em dashes in any tracked text file: not the character U+2014, not its HTML entities (named, decimal, or hex), and not the backslash-u escape. `python scripts/check_copy.py` must pass at the end of Task 2 and stay passing. Write new code, comments, docs, and commit messages without them.
- The calendar must look and behave exactly as before: the same header, toolbar, views, dialogs, setup steps (Preferences, Calendars, Theme), Settings tabs, theme previews, and card options (`entity`, `view`, `default_view`, `calendars`, `hide_weather`, `hide_header`, `weather_entity`, `time_format`, `first_day`, `theme`). The only copy changes are the em-dash rewrites in Task 2.
- `custom:planavista-calendar-card` and `planavista-calendar-card-editor` keep working. `custom:planavista-card` is an alias of the same card.
- Register every custom element through `defineElement` or `defineElementAlias` in `src/utils/define.ts`.
- Lit conventions: `experimentalDecorators`, `useDefineForClassFields: false`, `@property` and `@state`, `pv-` prefix for internal tags.
- vitest runs in Node with no DOM. Logic that needs tests goes in modules that don't import Lit elements.
- No backend behavior changes. Python files change only in comments and one log message.
- Don't commit `custom_components/planavista/frontend/dist/` until Task 9. Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or release in this plan. The milestone demo and the owner's go-ahead come first. Pushing the milestone branch for CI is allowed.
- The module element and its ancestors must not set `transform`, `filter`, `contain`, or `backdrop-filter`. The event popup and the create dialog use `position: fixed` overlays that must keep covering the whole viewport.
- Paths below are relative to the repository root unless a step says to `cd` first. Frontend commands run in `custom_components/planavista/frontend`.

## Review Focus

1. **Two PlanaVista cards on one dashboard** each keep their own view, date, and calendar filter (today they overwrite each other). Pinned by Task 3's independence test and Task 9's two-card check.
2. **Card YAML options still apply after the split:** `view` or `default_view` sets the first view, the saved default view applies when the card sets none, `calendars` narrows the calendars, and `hide_header` and `hide_weather` hide the header and the weather. Pinned by Task 5's tests and Task 9's checks.
3. **A tablet that sleeps through midnight, or a dashboard the user leaves and comes back to,** still moves to the new day: the per-card store restarts its timer and checks the date when its element reconnects. Pinned by Task 3's reconnect test.
4. **A stale browser page that already holds an older bundle** doesn't break the new one: `planavista-card`, `pv-calendar-module`, and every moved element register through the guard, and the alias registers even when an older bundle took the old name. Pinned by Task 7's alias tests.
5. **The copy check** catches every spelling of the em dash without flagging itself or its own tests, and skips the generated bundle and binary files. Pinned by Task 1's tests.

---

### Task 0: Capture the baseline (controller)

The coordinating agent does this with the Chrome DevTools MCP. Nothing is committed.

**Files:** screenshots in the session scratchpad, under `m1-baseline/`.

- [ ] **Step 1: Deploy the current bundle to the dev Home Assistant**

```bash
scripts/dev-ha.sh status
scripts/dev-ha.sh deploy-frontend
```

Expected: the container is running and the deploy copies `dist/planavista-cards.js`.

- [ ] **Step 2: Screenshot the calendar as it is today**

In a fresh isolated context (`isolatedContext: "m1-baseline"`), open `http://127.0.0.1:8124/wall-calendar/planavista` and hard-reload. At 1280 × 800, screenshot:

- the Day, Week, Month, and Agenda views
- the Calendars filter dropdown open
- the "+ New" dialog
- an event's popup
- Settings, each tab (Preferences, Calendars, Theme)

At 800 × 1280 and at 390 × 844, screenshot the Week view.

Record any console errors with `list_console_messages` (expected: none from PlanaVista).

- [ ] **Step 3: Close every page this task opened** (`close_page`).

---

### Task 1: The copy check

**Files:**
- Create: `scripts/check_copy.py`
- Create: `tests/test_check_copy.py`
- Modify: `.github/workflows/validate.yml`
- Modify: `.github/workflows/frontend.yml`

**Interfaces:**
- Produces: `scripts/check_copy.py` with `EM_DASH_FORMS: tuple[str, ...]`, `is_checked_path(path: str) -> bool`, `find_em_dashes(text: str) -> list[tuple[int, str]]`, and `main(argv: list[str] | None = None) -> int`.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_check_copy.py`:

```python
"""Tests for scripts/check_copy.py, the rule that tracked files have no em dashes."""
from __future__ import annotations

import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "scripts" / "check_copy.py"
_spec = importlib.util.spec_from_file_location("check_copy", SCRIPT)
assert _spec is not None and _spec.loader is not None
check_copy = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(check_copy)

# Built at runtime, so this file never contains the forms it tests.
DASH = chr(0x2014)
NAMED = "&" + "mdash;"
DECIMAL = "&#" + "8212;"
HEX = "&#x" + "2014;"
ESCAPE = "\\" + "u2014"


def test_finds_every_spelling_with_line_numbers() -> None:
    text = "\n".join(
        [
            "plain line",
            f"Save failed {DASH} try again",
            f"Nothing else is sent {NAMED} not your location",
            f"decimal {DECIMAL} here",
            f"hex {HEX.upper()} here",
            f"escape {ESCAPE} here",
        ]
    )
    assert [number for number, _ in check_copy.find_em_dashes(text)] == [2, 3, 4, 5, 6]


def test_ignores_en_dashes_hyphens_and_the_words_em_dash() -> None:
    text = "4" + chr(0x2013) + "6 digits, a well-known word, and the words em dash"
    assert check_copy.find_em_dashes(text) == []


def test_checks_text_files_but_not_the_bundle_or_binaries() -> None:
    assert check_copy.is_checked_path("README.md")
    assert check_copy.is_checked_path("custom_components/planavista/frontend/src/main.ts")
    assert check_copy.is_checked_path("custom_components/planavista/strings.json")
    assert check_copy.is_checked_path("assets/diagram.svg")
    assert not check_copy.is_checked_path(
        "custom_components/planavista/frontend/dist/planavista-cards.js"
    )
    assert not check_copy.is_checked_path("assets/logo.png")
    assert not check_copy.is_checked_path("custom_components/planavista/brand/icon.png")


def test_the_script_and_this_test_pass_their_own_check() -> None:
    for path in (SCRIPT, Path(__file__)):
        assert check_copy.find_em_dashes(path.read_text(encoding="utf-8")) == [], path
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `scripts/test-backend.sh tests/test_check_copy.py -v`
Expected: an error while collecting `tests/test_check_copy.py` (`FileNotFoundError` for `scripts/check_copy.py`).

- [ ] **Step 3: Write the script**

Create `scripts/check_copy.py`:

```python
"""Fail when a tracked text file contains an em dash.

PlanaVista's copy rule: no em dashes in product copy, docs, or code.
Use a comma, a colon, parentheses, or two sentences instead.

    python scripts/check_copy.py          check every tracked file
    python scripts/check_copy.py FILE...  check only these files

Exits 0 when clean and 1 when anything was found.
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# Spelled with chr() and concatenation so this file passes its own check.
EM_DASH_FORMS: tuple[str, ...] = (
    chr(0x2014),  # the character itself
    "&" + "mdash;",  # HTML named entity
    "&#" + "8212;",  # HTML decimal entity
    "&#x" + "2014;",  # HTML hex entity
    "\\" + "u2014",  # JavaScript, JSON, and Python escape
)
_PATTERN = re.compile(
    "|".join(re.escape(form) for form in EM_DASH_FORMS), re.IGNORECASE
)

# Generated and binary files are not checked.
_SKIPPED_PREFIXES = ("custom_components/planavista/frontend/dist/",)
_SKIPPED_SUFFIXES = (
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".otf", ".zip", ".gz",
)


def is_checked_path(path: str) -> bool:
    """Return True for the tracked text files the rule covers."""
    normalized = path.replace("\\", "/")
    if normalized.startswith(_SKIPPED_PREFIXES):
        return False
    return not normalized.lower().endswith(_SKIPPED_SUFFIXES)


def find_em_dashes(text: str) -> list[tuple[int, str]]:
    """Return (line number, line) for every line with an em dash in any spelling."""
    return [
        (number, line)
        for number, line in enumerate(text.splitlines(), start=1)
        if _PATTERN.search(line)
    ]


def _tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "-z"], cwd=REPO, check=True, capture_output=True
    )
    return [name for name in result.stdout.decode("utf-8").split("\0") if name]


def main(argv: list[str] | None = None) -> int:
    """Print every offending line and return the exit status."""
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:] if argv is None else argv
    paths = args or [path for path in _tracked_files() if is_checked_path(path)]
    found = 0
    for path in paths:
        try:
            text = (REPO / path).read_text(encoding="utf-8")
        except (UnicodeDecodeError, FileNotFoundError):
            continue
        for number, line in find_em_dashes(text):
            print(f"{path}:{number}: {line.strip()}")
            found += 1
    if found:
        print(
            f"\n{found} em dash(es) found. "
            "Use a comma, a colon, parentheses, or two sentences."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `scripts/test-backend.sh tests/test_check_copy.py -v`
Expected: 4 passed.

- [ ] **Step 5: Run the check on the repository**

Run: `python scripts/check_copy.py; echo "exit $?"`
Expected: about 183 findings across 28 files and `exit 1`. Task 2 fixes them.

- [ ] **Step 6: Run CI on feature branches and add the copy job**

In `.github/workflows/validate.yml`, change the push branches to:

```yaml
    branches: [main, "fix/**", "feat/**"]
```

and add this job after `backend-tests`:

```yaml
  copy:
    name: Copy check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.14"
      - run: python scripts/check_copy.py
```

In `.github/workflows/frontend.yml`, change the push branches to:

```yaml
    branches: [main, "fix/**", "feat/**"]
```

- [ ] **Step 7: Commit**

```bash
git add scripts/check_copy.py tests/test_check_copy.py .github/workflows/validate.yml .github/workflows/frontend.yml
git commit -F - <<'EOF'
ci: check tracked files for em dashes and run CI on feat branches

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 2: Remove every em dash

**Files:** every file `python scripts/check_copy.py` lists (28 files at the time of writing): `DESIGN_SYSTEM.md`, `README.md`, `CONTRIBUTING.md`, `docs/plans/2026-02-26-week-view-redesign.md`, `docs/plans/2026-02-26-week-view-redesign-plan.md`, `docs/plans/2026-02-27-provider-abstraction-design.md`, `docs/superpowers/plans/2026-10-09-review-fix-pass.md`, `docs/superpowers/specs/2026-10-09-review-fix-pass-design.md`, `custom_components/planavista/coordinator.py`, `custom_components/planavista/config_flow.py`, `custom_components/planavista/google_api.py`, `custom_components/planavista/services.py`, `custom_components/planavista/frontend/.gitignore`, and the TypeScript files under `custom_components/planavista/frontend/src/`.

**Interfaces:** none. Copy-only change.

- [ ] **Step 1: Rewrite the strings people see**

These are the user-facing strings. Replace each whole string with the new text shown:

| File | String | New text |
|---|---|---|
| `custom_components/planavista/frontend/src/components/event-popup.ts` | the delete error for events without a unique ID | `'Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.'` |
| `custom_components/planavista/frontend/src/components/onboarding-wizard.ts` | the Settings save failure | `'Save failed. Please try again.'` |
| `custom_components/planavista/frontend/src/components/onboarding-wizard.ts` | the setup save failure | `'Setup failed. Please try again.'` |
| `custom_components/planavista/frontend/src/components/onboarding-wizard.ts` | the Photon hint's last sentence (the dash is written as the named HTML entity) | `Nothing else is sent: not your home location or any calendar details.` |
| `custom_components/planavista/frontend/src/components/onboarding-wizard.ts` | the dialog's `aria-label` | `` aria-label="${isSettings ? 'PlanaVista Settings' : 'PlanaVista Setup'}: ${pageLabels[this._page]}" `` |
| `custom_components/planavista/services.py` | the `create_event_with_attendees` log message | replace the dash and the space before it with a colon, so the message reads `"PlanaVista: create_event_with_attendees called: "` followed by the rest unchanged |

- [ ] **Step 2: Rewrite everything else**

For every other line the check lists:

- Prose and list items: use a comma, a colon, parentheses, or two sentences, whichever keeps the meaning. Don't just delete the dash.
- Headings and titles of the form "A, dash, B": use "A: B" (for example, the fix-pass spec's title becomes `# Review Fix Pass: Design`).
- Code, CSS, and HTML comments, and `.gitignore` comments: use a colon, a comma, or a period.

- [ ] **Step 3: Confirm the repository is clean**

Run: `python scripts/check_copy.py; echo "exit $?"`
Expected: no output except `exit 0`.

- [ ] **Step 4: Confirm nothing else changed**

```bash
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npx vitest run
cd ../../.. && scripts/test-backend.sh -q
```

Expected: `tsc` prints nothing, vitest reports 14 files and 107 tests passed, and every backend test passes.

- [ ] **Step 5: Commit**

```bash
git add -u -- ':!custom_components/planavista/frontend/dist'
git commit -F - <<'EOF'
docs: replace em dashes with plain punctuation

Rewrites the four user-facing strings, the setup dialog's label, one log
message, and every comment and doc line that used one.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 3: Per-card calendar state

Today one page-wide singleton holds the view, date, filters, selection, and dialogs, so two cards on one dashboard overwrite each other. Each card gets its own store instead.

**Files:**
- Move: `src/state/state-manager.ts` to `src/modules/calendar/calendar-store.ts`
- Move: `test/state-manager.test.ts` to `test/calendar-store.test.ts`
- Modify: `src/cards/planavista-calendar-card.ts`
- Modify: `src/components/event-popup.ts`
- Modify: `src/components/event-create-dialog.ts`

**Interfaces:**
- Produces, in `src/modules/calendar/calendar-store.ts`:
  - `class CalendarStore`: the old state manager's public fields and methods, unchanged (`hiddenCalendars`, `currentView`, `currentDate`, `selectedEvent`, `dialogOpen`, `createPrefill`, `isLoading`, `subscribe`, `unsubscribe`, `toggleCalendar`, `setView`, `navigateDate`, `setDate`, `selectEvent`, `openCreateDialog`, `openEditDialog`, `closeDialog`, `doCreateEvent`, `doDeleteEvent`, `doEditEvent`, `checkRollover`, `startAutoAdvance`, `stopAutoAdvance`), plus `get autoAdvancing(): boolean`. Its constructor is public and no longer starts the timer.
  - `class CalendarStoreController implements ReactiveController`: `constructor(host: ReactiveControllerHost)`, `readonly store: CalendarStore`.
  - `class StoreSubscriber implements ReactiveController`: `constructor(host: ReactiveControllerHost, getStore: () => CalendarStore | undefined)`.
- Consumers: the card owns a `CalendarStoreController`. `pv-event-popup` and `pv-event-create-dialog` get a `store: CalendarStore` property from it.

- [ ] **Step 1: Move the files**

```bash
cd custom_components/planavista/frontend
mkdir -p src/modules/calendar
git mv src/state/state-manager.ts src/modules/calendar/calendar-store.ts
git mv test/state-manager.test.ts test/calendar-store.test.ts
rmdir src/state
```

- [ ] **Step 2: Write the failing tests**

In `test/calendar-store.test.ts`:

1. Replace the store import with `import { CalendarStore, CalendarStoreController, StoreSubscriber } from '../src/modules/calendar/calendar-store';`.
2. Replace the `host` object and the `const state = new PlanaVistaController(host).state;` line with:

```ts
const makeHost = () => ({
  addController: vi.fn(),
  removeController: vi.fn(),
  requestUpdate: vi.fn(),
  updateComplete: Promise.resolve(true),
});

const state = new CalendarStore();
```

3. Keep every existing `describe` block as it is, and append:

```ts
describe('one store per card', () => {
  it('keeps each card\'s view, date, and filters apart', () => {
    const dayCard = new CalendarStore();
    const weekCard = new CalendarStore();
    const before = weekCard.currentDate.getTime();
    dayCard.setView('month');
    dayCard.setDate(new Date(2027, 0, 15));
    dayCard.toggleCalendar('calendar.test_alex');
    expect(weekCard.currentView).toBe('day');
    expect(weekCard.currentDate.getTime()).toBe(before);
    expect(weekCard.hiddenCalendars.has('calendar.test_alex')).toBe(false);
  });

  it('does not start a timer until an element connects', () => {
    expect(new CalendarStore().autoAdvancing).toBe(false);
  });
});

describe('CalendarStoreController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the day-change timer only while its element is connected', () => {
    const ctl = new CalendarStoreController(makeHost());
    ctl.hostConnected();
    expect(ctl.store.autoAdvancing).toBe(true);
    ctl.hostDisconnected();
    expect(ctl.store.autoAdvancing).toBe(false);
  });

  it('moves to the new day when its element reconnects after midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 9, 23, 0)); // Friday night
    const ctl = new CalendarStoreController(makeHost());
    ctl.hostConnected();
    ctl.hostDisconnected(); // the user leaves the dashboard
    vi.setSystemTime(new Date(2026, 9, 10, 7, 30)); // and comes back Saturday morning
    ctl.hostConnected();
    expect(ctl.store.currentDate.getDate()).toBe(10);
    ctl.hostDisconnected();
  });

  it('re-renders its element when the store changes', () => {
    const host = makeHost();
    const ctl = new CalendarStoreController(host);
    ctl.hostConnected();
    ctl.store.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    ctl.hostDisconnected();
  });
});

describe('StoreSubscriber', () => {
  it('follows the store its element was given, and stops when disconnected', () => {
    const host = makeHost();
    let store = new CalendarStore();
    const sub = new StoreSubscriber(host, () => store);
    sub.hostConnected();

    store.setView('month');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);

    const old = store;
    store = new CalendarStore();
    sub.hostUpdate();
    old.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(1);
    store.setView('week');
    expect(host.requestUpdate).toHaveBeenCalledTimes(2);

    sub.hostDisconnected();
    store.setView('agenda');
    expect(host.requestUpdate).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 3: Run the tests and confirm they fail**

Run: `npx vitest run test/calendar-store.test.ts`
Expected: FAIL, because `CalendarStore`, `CalendarStoreController`, and `StoreSubscriber` are not exported.

- [ ] **Step 4: Rewrite the store**

In `src/modules/calendar/calendar-store.ts`:

1. Fix the import paths for the new location: `'../types'` becomes `'../../types'`, `'../utils/ha-utils'` becomes `'../../utils/ha-utils'`, `'../utils/date-utils'` becomes `'../../utils/date-utils'`, and `'../utils/event-form'` becomes `'../../utils/event-form'`.
2. Rename the class to `export class CalendarStore`, update its doc comment to say every card owns one, and delete `private static _instance`, the private constructor, and `static getInstance()`. The class gets the default public constructor.
3. Add this getter above `startAutoAdvance`:

```ts
  /** True while the day-change timer runs (between start and stop). */
  get autoAdvancing(): boolean {
    return this._autoAdvanceTimer !== null;
  }
```

4. Replace `startAutoAdvance` with:

```ts
  startAutoAdvance(): void {
    if (this._autoAdvanceTimer) return;
    // Catch up on a day that changed while the timer was stopped.
    this.checkRollover();
    this._autoAdvanceTimer = setInterval(() => this.checkRollover(), 60000);
    // Timers are throttled or paused while a tablet sleeps; check as soon as it wakes.
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }
```

5. Replace the `PlanaVistaController` class at the end of the file with:

```ts
/**
 * Gives one element its own CalendarStore, re-renders it when the store
 * changes, and runs the store's day-change timer while it is connected.
 *
 * Usage:
 *   private _pv = new CalendarStoreController(this);
 *   // this._pv.store.currentView, this._pv.store.setView('week')
 */
export class CalendarStoreController implements ReactiveController {
  readonly store = new CalendarStore();

  constructor(private readonly host: ReactiveControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {
    this.store.subscribe(this.host);
    this.store.startAutoAdvance();
  }

  hostDisconnected(): void {
    this.store.unsubscribe(this.host);
    this.store.stopAutoAdvance();
  }
}

/**
 * Re-renders a child element (the event popup or dialog) whenever the store
 * its parent handed it changes, and follows the parent to a new store.
 */
export class StoreSubscriber implements ReactiveController {
  private _store: CalendarStore | undefined;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly getStore: () => CalendarStore | undefined,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this._sync();
  }

  hostUpdate(): void {
    this._sync();
  }

  hostDisconnected(): void {
    this._store?.unsubscribe(this.host);
    this._store = undefined;
  }

  private _sync(): void {
    const next = this.getStore();
    if (next === this._store) return;
    this._store?.unsubscribe(this.host);
    next?.subscribe(this.host);
    this._store = next;
  }
}
```

Every other field and method stays exactly as it was.

- [ ] **Step 5: Run the store tests and confirm they pass**

Run: `npx vitest run test/calendar-store.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Give the card its own store**

In `src/cards/planavista-calendar-card.ts`:

- Replace `import { PlanaVistaController } from '../state/state-manager';` with `import { CalendarStoreController } from '../modules/calendar/calendar-store';`.
- Replace `private _pv = new PlanaVistaController(this);` with `private _pv = new CalendarStoreController(this);`.
- Run `sed -i 's/this\._pv\.state/this._pv.store/g' src/cards/planavista-calendar-card.ts`.
- In `render()`, add `.store=${this._pv.store}` as the first property binding of both `<pv-event-popup>` and `<pv-event-create-dialog>`.

- [ ] **Step 7: Hand the store to the popup and the dialog**

In both `src/components/event-popup.ts` and `src/components/event-create-dialog.ts`:

- Replace `import { PlanaVistaController } from '../state/state-manager';` with `import { CalendarStore, StoreSubscriber } from '../modules/calendar/calendar-store';`.
- Replace `private _pv = new PlanaVistaController(this);` with:

```ts
  /** The calendar state of the card that opened this. */
  @property({ attribute: false }) store!: CalendarStore;
  /** Re-renders when that store changes (the controller registers itself with this element). */
  private _storeSubscription = new StoreSubscriber(this, () => this.store);
```

- Run `sed -i 's/this\._pv\.state\./this.store./g'` on the file.
- Make sure `property` is imported from `lit/decorators.js` (add it if it isn't).

- [ ] **Step 8: Type-check and run every test**

Run: `npx tsc --noEmit -p . && npx vitest run`
Expected: `tsc` prints nothing; 14 files and 113 tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A src/modules src/state src/cards src/components test
git commit -F - <<'EOF'
fix(frontend): give each card its own calendar state

The view, date, calendar filter, and dialogs lived in one page-wide
singleton, so two cards on a dashboard overwrote each other. Each card
now owns a CalendarStore, runs its day-change timer while connected, and
catches up on a missed midnight when it reconnects.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 4: Module and page registries

**Files:**
- Create: `src/core/module-registry.ts`
- Create: `src/core/page-registry.ts`
- Test: `test/module-registry.test.ts`
- Test: `test/page-registry.test.ts`

**Interfaces:**
- Produces, in `src/core/module-registry.ts`:
  - `interface ModuleContext { config: PlanaVistaCardConfig | undefined; data: PlanaVistaData | null }`
  - `interface ModuleDefinition { id: string; label: string; icon: string; tag: string; order: number; watchedEntities(ctx: ModuleContext): string[] }`
  - `class ModuleRegistry { register(def: ModuleDefinition): void; get(id: string): ModuleDefinition | undefined; list(): ModuleDefinition[] }`
  - `interface ResolvedModules { shown: ModuleDefinition[]; initial: ModuleDefinition | undefined }`
  - `function resolveModules(registered: ModuleDefinition[], options: { modules?: unknown; module?: unknown }): ResolvedModules`
  - `const moduleRegistry: ModuleRegistry`
- Produces, in `src/core/page-registry.ts`:
  - `interface WizardPage<C> { id: string; label: string; order: number; applies?: (ctx: C) => boolean }`
  - `interface WizardContext { mode: 'onboarding' | 'settings' }`
  - `class PageRegistry<C> { register(page: WizardPage<C>): void; pages(ctx: C): WizardPage<C>[] }`
  - `const setupSteps: PageRegistry<WizardContext>` and `const settingsPages: PageRegistry<WizardContext>`

- [ ] **Step 1: Write the failing tests**

Create `test/module-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ModuleRegistry, resolveModules, type ModuleDefinition } from '../src/core/module-registry';

const mod = (id: string, order: number): ModuleDefinition => ({
  id, label: id, icon: 'mdi:puzzle', tag: `pv-${id}-module`, order, watchedEntities: () => [],
});
const calendar = mod('calendar', 10);
const chores = mod('chores', 20);
const lists = mod('lists', 30);
const all = [calendar, chores, lists];

describe('ModuleRegistry', () => {
  it('lists modules by order, and registering an id again replaces it', () => {
    const registry = new ModuleRegistry();
    registry.register(chores);
    registry.register(calendar);
    registry.register({ ...chores, label: 'Chores 2' });
    expect(registry.list().map(m => m.id)).toEqual(['calendar', 'chores']);
    expect(registry.get('chores')?.label).toBe('Chores 2');
    expect(registry.get('lists')).toBeUndefined();
  });

  it('breaks order ties by id', () => {
    const registry = new ModuleRegistry();
    registry.register(mod('b', 5));
    registry.register(mod('a', 5));
    expect(registry.list().map(m => m.id)).toEqual(['a', 'b']);
  });
});

describe('resolveModules', () => {
  it('shows every module and opens the first when the card sets nothing', () => {
    const { shown, initial } = resolveModules(all, {});
    expect(shown.map(m => m.id)).toEqual(['calendar', 'chores', 'lists']);
    expect(initial?.id).toBe('calendar');
  });

  it('shows only the modules the card lists, in the card\'s order', () => {
    expect(resolveModules(all, { modules: ['chores', 'calendar'] }).shown.map(m => m.id)).toEqual(['chores', 'calendar']);
  });

  it('ignores unknown ids and repeats, and shows everything when nothing valid is listed', () => {
    expect(resolveModules(all, { modules: ['chores', 'garden', 'chores'] }).shown.map(m => m.id)).toEqual(['chores']);
    expect(resolveModules(all, { modules: ['garden'] }).shown).toHaveLength(3);
    expect(resolveModules(all, { modules: 'chores' }).shown).toHaveLength(3);
  });

  it('opens the module the card names when it is shown', () => {
    expect(resolveModules(all, { module: 'chores' }).initial?.id).toBe('chores');
    expect(resolveModules(all, { modules: ['calendar'], module: 'chores' }).initial?.id).toBe('calendar');
    expect(resolveModules(all, { module: 7 }).initial?.id).toBe('calendar');
  });

  it('has nothing to show when no modules are registered', () => {
    expect(resolveModules([], {})).toEqual({ shown: [], initial: undefined });
  });
});
```

Create `test/page-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';

type Ctx = { mode: 'onboarding' | 'settings' };

describe('PageRegistry', () => {
  it('returns pages in order and skips the ones that do not apply', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'theme', label: 'Theme', order: 900 });
    registry.register({ id: 'preferences', label: 'Preferences', order: 100 });
    registry.register({ id: 'calendars', label: 'Calendars', order: 200, applies: ctx => ctx.mode === 'onboarding' });
    expect(registry.pages({ mode: 'onboarding' }).map(p => p.id)).toEqual(['preferences', 'calendars', 'theme']);
    expect(registry.pages({ mode: 'settings' }).map(p => p.id)).toEqual(['preferences', 'theme']);
  });

  it('replaces a page registered again under the same id', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'theme', label: 'Theme', order: 900 });
    registry.register({ id: 'theme', label: 'Look', order: 50 });
    expect(registry.pages({ mode: 'settings' })).toEqual([{ id: 'theme', label: 'Look', order: 50 }]);
  });

  it('breaks order ties by id so the list is stable', () => {
    const registry = new PageRegistry<Ctx>();
    registry.register({ id: 'b', label: 'B', order: 1 });
    registry.register({ id: 'a', label: 'A', order: 1 });
    expect(registry.pages({ mode: 'settings' }).map(p => p.id)).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run test/module-registry.test.ts test/page-registry.test.ts`
Expected: FAIL, because `src/core/module-registry` and `src/core/page-registry` don't exist.

- [ ] **Step 3: Write the registries**

Create `src/core/module-registry.ts`:

```ts
import type { PlanaVistaCardConfig, PlanaVistaData } from '../types';

/** What the shell knows when it asks a module a question. */
export interface ModuleContext {
  config: PlanaVistaCardConfig | undefined;
  data: PlanaVistaData | null;
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
  /** Entities whose state changes should re-render this module. */
  watchedEntities(ctx: ModuleContext): string[];
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

Create `src/core/page-registry.ts`:

```ts
/** A step of the setup wizard or a tab of Settings. */
export interface WizardPage<C> {
  id: string;
  label: string;
  /** Position among pages; lower comes first. */
  order: number;
  /** Leave out to always show the page. */
  applies?: (ctx: C) => boolean;
}

/** What the wizard knows when it asks which pages apply. */
export interface WizardContext {
  mode: 'onboarding' | 'settings';
}

/** An ordered list of pages that modules contribute. Registering an id again replaces it. */
export class PageRegistry<C> {
  private readonly _pages = new Map<string, WizardPage<C>>();

  register(page: WizardPage<C>): void {
    this._pages.set(page.id, page);
  }

  pages(ctx: C): WizardPage<C>[] {
    return [...this._pages.values()]
      .filter(page => !page.applies || page.applies(ctx))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  }
}

/** Steps of first-run setup. */
export const setupSteps = new PageRegistry<WizardContext>();

/** Tabs of Settings. */
export const settingsPages = new PageRegistry<WizardContext>();
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run test/module-registry.test.ts test/page-registry.test.ts`
Expected: PASS (7 and 3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/core test/module-registry.test.ts test/page-registry.test.ts
git commit -F - <<'EOF'
feat(frontend): add module and page registries

Modules register an element and the entities they watch; the card
options `modules` and `module` choose which ones a card shows and opens
on. Setup steps and Settings pages become ordered lists with conditions.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 5: Display settings and calendar data as tested functions

The card works these out inside one memoized method today. As plain functions, the shell and the calendar module can share them, and tests can pin the card options.

**Files:**
- Create: `src/core/display.ts`
- Create: `src/modules/calendar/calendar-derive.ts`
- Test: `test/display.test.ts`
- Test: `test/calendar-derive.test.ts`
- Modify: `src/cards/planavista-calendar-card.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Produces, in `src/core/display.ts`: `resolveDisplay(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): DisplayConfig`.
- Produces, in `src/modules/calendar/calendar-derive.ts`:
  - `interface SharedParticipant { entity_id: string; calendar_name: string; calendar_color: string; person_entity: string }`
  - `interface CalendarDerived { calendars: CalendarConfig[]; visibleEvents: CalendarEvent[]; sharedEventMap: Map<string, SharedParticipant[]> }`
  - `selectCalendars(data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined): CalendarConfig[]`
  - `deriveCalendarData(data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined, hidden: Set<string>): CalendarDerived`
  - `calendarWatchedEntities(calendars: CalendarConfig[]): string[]`
  - `initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined`
- Produces, in `src/types.ts`: `PlanaVistaCardConfig` gains `modules?: string[]` and `module?: string`.

- [ ] **Step 1: Write the failing tests**

Create `test/display.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveDisplay } from '../src/core/display';
import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';

const saved = (display: Partial<DisplayConfig>): PlanaVistaData => ({
  calendars: [],
  events: [],
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light', ...display },
});
const card = (extra: Partial<PlanaVistaCardConfig> = {}): PlanaVistaCardConfig => ({ type: 'custom:planavista-card', ...extra });

describe('resolveDisplay', () => {
  it('uses defaults when neither the card nor the saved settings set anything', () => {
    expect(resolveDisplay(undefined, null)).toEqual({
      time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light',
      theme_overrides: undefined, location_autocomplete: false,
    });
  });

  it('uses the saved settings', () => {
    const data = saved({
      time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark',
      location_autocomplete: true, theme_overrides: { accent: '#5B5BD6' },
    });
    expect(resolveDisplay(card(), data)).toEqual({
      time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark',
      theme_overrides: { accent: '#5B5BD6' }, location_autocomplete: true,
    });
  });

  it('lets the card YAML win over the saved settings', () => {
    const data = saved({ time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark' });
    const config = card({ time_format: '12h', weather_entity: 'weather.cabin', first_day: 'sunday', default_view: 'agenda', theme: 'minimal' });
    expect(resolveDisplay(config, data)).toMatchObject({
      time_format: '12h', weather_entity: 'weather.cabin', first_day: 'sunday', default_view: 'agenda', theme: 'minimal',
    });
  });

  it('treats the card\'s view as its default view when default_view is not set', () => {
    expect(resolveDisplay(card({ view: 'day' }), saved({ default_view: 'month' })).default_view).toBe('day');
  });
});
```

Create `test/calendar-derive.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  calendarWatchedEntities, deriveCalendarData, initialView, selectCalendars,
} from '../src/modules/calendar/calendar-derive';
import type { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';

const cal = (entity_id: string, person_entity = '', visible = true): CalendarConfig => ({
  entity_id, display_name: entity_id.split('.')[1], color: '#F94144', color_light: '#FDBDBE',
  icon: 'mdi:calendar', person_entity, visible,
});
const ev = (calendar_entity_id: string, uid?: string): CalendarEvent => ({
  summary: 'Dinner', start: '2026-10-13T18:00:00-05:00', end: '2026-10-13T19:00:00-05:00', uid,
  calendar_entity_id, calendar_name: calendar_entity_id.split('.')[1], calendar_color: '#F94144', calendar_color_light: '#FDBDBE',
});
const data = (calendars: CalendarConfig[], events: CalendarEvent[] = [], display: Partial<DisplayConfig> = {}): PlanaVistaData => ({
  calendars, events,
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light', ...display },
});
const card = (extra: Partial<PlanaVistaCardConfig> = {}): PlanaVistaCardConfig => ({ type: 'custom:planavista-card', ...extra });

describe('selectCalendars', () => {
  const all = [cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair'), cal('calendar.test_casey', 'person.casey', false)];

  it('leaves out calendars hidden in Settings', () => {
    expect(selectCalendars(data(all), card()).map(c => c.entity_id)).toEqual(['calendar.test_alex', 'calendar.test_blair']);
  });

  it('narrows to the card\'s calendars list, and an empty list shows them all', () => {
    expect(selectCalendars(data(all), card({ calendars: ['calendar.test_blair'] })).map(c => c.entity_id)).toEqual(['calendar.test_blair']);
    expect(selectCalendars(data(all), card({ calendars: [] })).map(c => c.entity_id)).toEqual(['calendar.test_alex', 'calendar.test_blair']);
  });

  it('returns nothing before data arrives', () => {
    expect(selectCalendars(null, card())).toEqual([]);
  });
});

describe('deriveCalendarData', () => {
  it('drops events from calendars the filter hides', () => {
    const d = data([cal('calendar.test_alex'), cal('calendar.test_blair')], [ev('calendar.test_alex', 'a'), ev('calendar.test_blair', 'b')]);
    expect(deriveCalendarData(d, card(), new Set(['calendar.test_blair'])).visibleEvents.map(e => e.uid)).toEqual(['a']);
  });

  it('groups shared events by uid, once per calendar, and skips events without a uid', () => {
    const d = data([cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair')], [
      ev('calendar.test_alex', 'dinner'), ev('calendar.test_blair', 'dinner'), ev('calendar.test_alex', 'dinner'), ev('calendar.test_alex'),
    ]);
    const map = deriveCalendarData(d, card(), new Set()).sharedEventMap;
    expect([...map.keys()]).toEqual(['dinner']);
    expect(map.get('dinner')!.map(p => [p.entity_id, p.person_entity])).toEqual([
      ['calendar.test_alex', 'person.alex'], ['calendar.test_blair', ''],
    ]);
  });
});

describe('calendarWatchedEntities', () => {
  it('lists the people linked to the calendars', () => {
    expect(calendarWatchedEntities([cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair')])).toEqual(['person.alex']);
  });
});

describe('initialView', () => {
  const savedMonth = data([], [], { default_view: 'month' });

  it('prefers the card\'s view, then its default_view, then the saved default view', () => {
    expect(initialView(card({ view: 'day', default_view: 'agenda' }), savedMonth)).toBe('day');
    expect(initialView(card({ default_view: 'agenda' }), savedMonth)).toBe('agenda');
    expect(initialView(card(), savedMonth)).toBe('month');
  });

  it('has no view before data arrives when the card sets none', () => {
    expect(initialView(card(), null)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run test/display.test.ts test/calendar-derive.test.ts`
Expected: FAIL, because `src/core/display` and `src/modules/calendar/calendar-derive` don't exist.

- [ ] **Step 3: Write the functions**

Create `src/core/display.ts`:

```ts
import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../types';

/** Display settings for one card: its YAML wins, then the saved settings, then defaults. */
export function resolveDisplay(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): DisplayConfig {
  const saved = data?.display;
  return {
    time_format: config?.time_format || saved?.time_format || '12h',
    weather_entity: config?.weather_entity || saved?.weather_entity || '',
    first_day: config?.first_day || saved?.first_day || 'sunday',
    default_view: config?.default_view || config?.view || saved?.default_view || 'week',
    theme: config?.theme || saved?.theme || 'light',
    theme_overrides: saved?.theme_overrides,
    location_autocomplete: saved?.location_autocomplete === true,
  };
}
```

Create `src/modules/calendar/calendar-derive.ts`:

```ts
import type { CalendarConfig, CalendarEvent, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import { filterVisibleEvents } from '../../utils/event-utils';

/** A calendar that shares an event (same UID), for Day-view participant avatars. */
export interface SharedParticipant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
  person_entity: string;
}

/** What the calendar views need from the PlanaVista data. */
export interface CalendarDerived {
  calendars: CalendarConfig[];
  visibleEvents: CalendarEvent[];
  sharedEventMap: Map<string, SharedParticipant[]>;
}

/** Calendars this card shows: visible in Settings, narrowed by the card's `calendars` list. */
export function selectCalendars(data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined): CalendarConfig[] {
  const all = (data?.calendars || []).filter(c => c.visible !== false);
  const cardFilter = config?.calendars;
  return Array.isArray(cardFilter) && cardFilter.length > 0
    ? all.filter(c => cardFilter.includes(c.entity_id))
    : all;
}

/** The calendars, the events the filter leaves visible, and the shared-event map. */
export function deriveCalendarData(
  data: PlanaVistaData | null,
  config: PlanaVistaCardConfig | undefined,
  hidden: Set<string>,
): CalendarDerived {
  const calendars = selectCalendars(data, config);
  const events = data?.events || [];

  // Group all events by UID to find shared events (Day-view participant avatars).
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

  return { calendars, visibleEvents: filterVisibleEvents(events, hidden), sharedEventMap };
}

/** People whose avatars the calendar shows; their state changes re-render it. */
export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
  return calendars.map(c => c.person_entity).filter(id => !!id);
}

/** The view a card opens on: its `view` or `default_view`, else the saved default view. */
export function initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined {
  return config?.view || config?.default_view || data?.display?.default_view || undefined;
}
```

In `src/types.ts`, add to `PlanaVistaCardConfig` after `first_day?`:

```ts
  /** Modules this card shows, in order (default: every module). */
  modules?: string[];
  /** Module the card opens on (default: the first one shown). */
  module?: string;
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run test/display.test.ts test/calendar-derive.test.ts`
Expected: PASS (4 and 8 tests).

- [ ] **Step 5: Use them in the card**

In `src/cards/planavista-calendar-card.ts`:

- Delete the `SharedParticipant` interface and change `CardDerived` to:

```ts
/** What render() derives from the config sensor (see _derive). */
interface CardDerived extends CalendarDerived {
  data: PlanaVistaData | null;
  display: DisplayConfig;
}
```

- Replace the whole `_derive` property with:

```ts
  private _derive = memoizeOne((
    _sensorState: unknown,
    config: PlanaVistaCardConfig | undefined,
    hidden: Set<string>,
  ): CardDerived => {
    const data = this.hass ? getPlanaVistaData(this.hass, config?.entity) : null;
    return { data, display: resolveDisplay(config, data), ...deriveCalendarData(data, config, hidden) };
  });
```

- In `_watchedEntityIds`, replace the `for (const cal of calendars)` loop with `ids.push(...calendarWatchedEntities(calendars));`.
- Add `import { resolveDisplay } from '../core/display';` and `import { CalendarDerived, calendarWatchedEntities, deriveCalendarData } from '../modules/calendar/calendar-derive';`, and remove the unused `filterVisibleEvents` import.

- [ ] **Step 6: Type-check and run every test**

Run: `npx tsc --noEmit -p . && npx vitest run`
Expected: `tsc` prints nothing; 18 files and 135 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/core/display.ts src/modules/calendar/calendar-derive.ts src/types.ts src/cards/planavista-calendar-card.ts test/display.test.ts test/calendar-derive.test.ts
git commit -F - <<'EOF'
refactor(frontend): derive display settings and calendar data in tested functions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 6: Move files into shell, core, and modules/calendar

A pure move: no code changes except import paths.

**Files:**

| From (under `src/`) | To (under `src/`) |
|---|---|
| `components/view-day.ts`, `view-week.ts`, `view-month.ts`, `view-agenda.ts`, `event-popup.ts`, `event-create-dialog.ts`, `pv-event-chip.ts` | `modules/calendar/components/` (same names) |
| `utils/event-utils.ts`, `event-form.ts`, `location-search.ts` | `modules/calendar/utils/` (same names) |
| `components/onboarding-wizard.ts`, `components/pv-clock.ts` | `shell/` (same names) |
| `components/color-swatch-picker.ts` | `core/color-swatch-picker.ts` |
| `cards/planavista-calendar-card-editor.ts` | `shell/planavista-card-editor.ts` |
| `cards/planavista-calendar-card.ts` | `shell/planavista-card.ts` |

Tests that import moved files are updated too.

**Interfaces:** none change.

- [ ] **Step 1: Move the files**

```bash
cd custom_components/planavista/frontend/src
mkdir -p shell core modules/calendar/components modules/calendar/utils
for f in view-day view-week view-month view-agenda event-popup event-create-dialog pv-event-chip; do
  git mv "components/$f.ts" "modules/calendar/components/$f.ts"
done
for f in event-utils event-form location-search; do
  git mv "utils/$f.ts" "modules/calendar/utils/$f.ts"
done
git mv components/onboarding-wizard.ts shell/onboarding-wizard.ts
git mv components/pv-clock.ts shell/pv-clock.ts
git mv components/color-swatch-picker.ts core/color-swatch-picker.ts
git mv cards/planavista-calendar-card-editor.ts shell/planavista-card-editor.ts
git mv cards/planavista-calendar-card.ts shell/planavista-card.ts
rmdir components cards
```

- [ ] **Step 2: Fix the import paths**

```bash
# Calendar components now sit three levels below src.
for f in modules/calendar/components/*.ts; do
  sed -i -E \
    -e "s#'\.\./(styles/[a-z-]+)'#'../../../\1'#g" \
    -e "s#'\.\./types'#'../../../types'#g" \
    -e "s#'\.\./utils/(define|date-utils|ha-utils|weather-icons|weather-subscription|gestures|render-cache)'#'../../../utils/\1'#g" \
    -e "s#'\.\./modules/calendar/calendar-store'#'../calendar-store'#g" \
    "$f"
done
# Calendar utils.
for f in modules/calendar/utils/*.ts; do
  sed -i -E -e "s#'\.\./types'#'../../../types'#g" -e "s#'\./date-utils'#'../../../utils/date-utils'#g" "$f"
done
sed -i -e "s#'\.\./\.\./utils/event-form'#'./utils/event-form'#" modules/calendar/calendar-store.ts
sed -i -e "s#'\.\./\.\./utils/event-utils'#'./utils/event-utils'#" modules/calendar/calendar-derive.ts
sed -i -e "s#'\./color-swatch-picker'#'../core/color-swatch-picker'#" shell/onboarding-wizard.ts
sed -i -E \
  -e "s#'\./planavista-calendar-card-editor'#'./planavista-card-editor'#" \
  -e "s#'\.\./components/(view-day|view-week|view-month|view-agenda|event-popup|event-create-dialog)'#'../modules/calendar/components/\1'#g" \
  -e "s#'\.\./components/(onboarding-wizard|pv-clock)'#'./\1'#g" \
  -e "s#'\.\./utils/event-utils'#'../modules/calendar/utils/event-utils'#g" \
  shell/planavista-card.ts
sed -i -E \
  -e "s#'\./components/color-swatch-picker'#'./core/color-swatch-picker'#" \
  -e "s#'\./components/onboarding-wizard'#'./shell/onboarding-wizard'#" \
  -e "s#'\./components/pv-event-chip'#'./modules/calendar/components/pv-event-chip'#" \
  -e "s#'\./cards/planavista-calendar-card'#'./shell/planavista-card'#" \
  main.ts
cd ..
sed -i -E "s#'\.\./src/utils/(event-utils|event-form|location-search)'#'../src/modules/calendar/utils/\1'#g" test/*.ts
```

- [ ] **Step 3: Type-check and run every test**

Run: `npx tsc --noEmit -p . && npx vitest run`
Expected: `tsc` prints nothing; 18 files and 135 tests pass. If `tsc` reports a missing module, fix that one import by the table above and run it again.

- [ ] **Step 4: Confirm only paths changed**

Run: `git diff --cached -M --stat | tail -3; git diff -M --stat | tail -3`
Expected: every moved file shows as a rename, and the edits are import lines only (`git diff -M` shows nothing but `import` changes).

- [ ] **Step 5: Commit**

```bash
git add -A src test
git commit -F - <<'EOF'
refactor(frontend): move files into shell, core, and modules/calendar

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 7: Split the card into the shell and the calendar module

**Files:**
- Create: `src/modules/calendar/calendar-module.ts`
- Create: `src/modules/calendar/definition.ts`
- Create: `src/modules/calendar/index.ts`
- Modify: `src/shell/planavista-card.ts`
- Modify: `src/utils/define.ts`
- Modify: `src/main.ts`
- Test: `test/define.test.ts`
- Test: `test/calendar-definition.test.ts`

**Interfaces:**
- Consumes: `CalendarStoreController` (Task 3); `ModuleDefinition`, `ModuleRegistry`, `moduleRegistry`, `resolveModules`, `ResolvedModules` (Task 4); `resolveDisplay`, `CalendarDerived`, `deriveCalendarData`, `selectCalendars`, `calendarWatchedEntities`, `initialView` (Task 5).
- Produces:
  - `defineElementAlias(tag: string, base: CustomElementConstructor): boolean` in `src/utils/define.ts`.
  - `calendarModule: ModuleDefinition` and `registerCalendarModule(modules?: ModuleRegistry): void` in `src/modules/calendar/definition.ts`.
  - `<pv-calendar-module>`: properties `hass`, `cardConfig`, `data`, `display`, `previewOverrides`, `canOpenSettings`; fires `pv-open-settings` (bubbles, composed).
  - `PlanaVistaCard`, registered as `planavista-calendar-card` and as the alias `planavista-card`.

- [ ] **Step 1: Write the failing tests**

In `test/define.test.ts`, change the import to `import { defineElement, defineElementAlias } from '../src/utils/define';` and append:

```ts
describe('defineElementAlias', () => {
  it('registers the alias as a subclass, even when an older bundle took the original name', () => {
    const registry = new FakeRegistry();
    registry.define('planavista-calendar-card', OldChip);
    vi.stubGlobal('customElements', registry);
    const Card = class {} as unknown as CustomElementConstructor;
    expect(defineElement('planavista-calendar-card', Card)).toBe(false);
    expect(defineElementAlias('planavista-card', Card)).toBe(true);
    expect(Object.getPrototypeOf(registry.get('planavista-card'))).toBe(Card);
  });

  it('skips an alias that another bundle already defined', () => {
    const registry = new FakeRegistry();
    registry.define('planavista-card', OldChip);
    vi.stubGlobal('customElements', registry);
    expect(defineElementAlias('planavista-card', NewChip)).toBe(false);
    expect(registry.get('planavista-card')).toBe(OldChip);
  });
});
```

Create `test/calendar-definition.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from '../src/core/module-registry';
import { calendarModule, registerCalendarModule } from '../src/modules/calendar/definition';
import type { CalendarConfig, PlanaVistaData } from '../src/types';

const cal = (entity_id: string, person_entity = '', visible = true): CalendarConfig => ({
  entity_id, display_name: entity_id.split('.')[1], color: '#F94144', color_light: '#FDBDBE',
  icon: 'mdi:calendar', person_entity, visible,
});
const data: PlanaVistaData = {
  calendars: [cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair'), cal('calendar.test_casey', 'person.casey', false)],
  events: [],
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light' },
};

describe('the calendar module', () => {
  it('is rendered by pv-calendar-module', () => {
    expect(calendarModule.id).toBe('calendar');
    expect(calendarModule.tag).toBe('pv-calendar-module');
  });

  it('watches the people linked to the calendars this card shows', () => {
    expect(calendarModule.watchedEntities({ config: undefined, data })).toEqual(['person.alex']);
    expect(calendarModule.watchedEntities({ config: { type: 'custom:planavista-card', calendars: ['calendar.test_blair'] }, data })).toEqual([]);
    expect(calendarModule.watchedEntities({ config: undefined, data: null })).toEqual([]);
  });

  it('registers itself', () => {
    const modules = new ModuleRegistry();
    registerCalendarModule(modules);
    expect(modules.list().map(m => m.id)).toEqual(['calendar']);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run test/define.test.ts test/calendar-definition.test.ts`
Expected: FAIL, because `defineElementAlias` is not exported and `src/modules/calendar/definition` doesn't exist.

- [ ] **Step 3: Write the alias helper and the module definition**

Append to `src/utils/define.ts`:

```ts

/**
 * Register `tag` as another name for `base`. The browser registers a class
 * under one name only, so the alias is an empty subclass.
 *
 * Returns true when this call registered the alias.
 */
export function defineElementAlias(tag: string, base: CustomElementConstructor): boolean {
  return defineElement(tag, class extends base {});
}
```

Create `src/modules/calendar/definition.ts`:

```ts
import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { calendarWatchedEntities, selectCalendars } from './calendar-derive';

/** The calendar module, as the shell sees it. */
export const calendarModule: ModuleDefinition = {
  id: 'calendar',
  label: 'Calendar',
  icon: 'mdi:calendar-month',
  tag: 'pv-calendar-module',
  order: 10,
  watchedEntities: ({ config, data }) => calendarWatchedEntities(selectCalendars(data, config)),
};

/** Add the calendar to the module registry. */
export function registerCalendarModule(modules: ModuleRegistry = moduleRegistry): void {
  modules.register(calendarModule);
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run test/define.test.ts test/calendar-definition.test.ts`
Expected: PASS (4 and 3 tests).

- [ ] **Step 5: Create the calendar module element**

Create `src/modules/calendar/calendar-module.ts`. The class below holds everything the card did below its header. The CSS is moved from the card, not rewritten: after the `:host` rule, paste these rules from the old card (`src/shell/planavista-card.ts` as committed in Task 6), in their original order and text:

- the TOOLBAR section: `.pvc-toolbar` through `.pvc-view-tab:hover:not(.active)`, including `@keyframes pvc-dropdown-in`;
- `.pvc-body` and `.pvc-body > *`;
- the `.pvc-refresh-btn` and `.pvc-settings-btn` rules and `@keyframes pvc-spin`;
- `.pvc-cal-strip` and every `.pvc-cal-chip` rule;
- from each `@media` block, the rules for `.pvc-toolbar`, `.pvc-filter-wrap`, `.pvc-filter-btn`, `.pvc-filter-badge`, `.pvc-filter-avatar`, `.pvc-filter-name`, `.pvc-cal-strip` (with its `::-webkit-scrollbar`), `.pvc-controls`, `.pvc-new-btn`, `.pvc-today-btn`, `.pvc-nav-btn`, `.pvc-view-tab`, and `.pvc-settings-btn`, each wrapped in the same `@media` condition.

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ThemeOverrides } from '../../types';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../../styles/shared';
import { getPersonAvatar, getPersonName } from '../../utils/ha-utils';
import { swipeDirection } from '../../utils/gestures';
import { memoizeOne } from '../../utils/render-cache';
import { CalendarStoreController } from './calendar-store';
import { CalendarDerived, deriveCalendarData, initialView } from './calendar-derive';

import './components/view-day';
import './components/view-week';
import './components/view-month';
import './components/view-agenda';
import './components/event-popup';
import './components/event-create-dialog';

const DEFAULT_ENTITY = 'sensor.planavista_config';

/**
 * pv-calendar-module: the calendar's toolbar, its four views, and the event
 * popup and dialog. The shell renders it inside the card and hands it the
 * card config, the PlanaVista data, and the resolved display settings.
 *
 * @fires pv-open-settings - when the gear is tapped
 */
export class PvCalendarModule extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) cardConfig?: PlanaVistaCardConfig;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  @property({ attribute: false }) display!: DisplayConfig;
  /** Theme overrides being previewed in Settings; they win over the saved ones. */
  @property({ attribute: false }) previewOverrides: ThemeOverrides | null = null;
  /** Shows the gear (Home Assistant admins only, as before). */
  @property({ type: Boolean }) canOpenSettings = false;

  /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
  @state() private _tick = Math.floor(Date.now() / 60000);
  @state() private _filterOpen = false;
  @state() private _refreshing = false;

  private _pv = new CalendarStoreController(this);
  private _viewInitialized = false;
  private _tickTimer: ReturnType<typeof setTimeout> | null = null;
  /** Where the current one-finger touch began; null when there's no swipe in progress. */
  private _touchStart: { x: number; y: number } | null = null;
  private _filterCloseHandler = (e: MouseEvent) => this._onFilterClickOutside(e);

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      /* Toolbar, body, and button rules moved from the card: see the list above. */
    `,
  ];

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

  protected willUpdate(changed: PropertyValues): void {
    // The card's own view (YAML `view` or `default_view`) applies whenever the card config changes.
    if (changed.has('cardConfig')) {
      const cardView = this.cardConfig?.view || this.cardConfig?.default_view;
      if (cardView) this._pv.store.setView(cardView);
    }
    // The first time data arrives, a card without its own view opens on the saved default view.
    if (!this._viewInitialized && this.data) {
      const view = initialView(this.cardConfig, this.data);
      if (view) this._pv.store.setView(view);
      this._viewInitialized = true;
    }
  }

  /** Cached until the data, the card config, or the calendar filter changes. */
  private _derive = memoizeOne((
    data: PlanaVistaData | null,
    config: PlanaVistaCardConfig | undefined,
    hidden: Set<string>,
  ): CalendarDerived => deriveCalendarData(data, config, hidden));

  private _derived(): CalendarDerived {
    return this._derive(this.data, this.cardConfig, this._pv.store.hiddenCalendars);
  }

  render() {
    if (!this.hass || !this.display) return nothing;
    const { calendars, visibleEvents } = this._derived();
    const store = this._pv.store;
    const display = this.display;

    return html`
      ${this._renderToolbar(calendars, store.currentView)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${this._renderView(store.currentView, visibleEvents, calendars, display)}
      </div>

      ${store.selectedEvent ? html`
        <pv-event-popup
          .store=${store}
          .hass=${this.hass}
          .event=${store.selectedEvent}
          .timeFormat=${display?.time_format || '12h'}
        ></pv-event-popup>
      ` : nothing}

      ${store.dialogOpen ? html`
        <pv-event-create-dialog
          .store=${store}
          .hass=${this.hass}
          .calendars=${calendars}
          .open=${true}
          .mode=${store.dialogOpen}
          .prefill=${store.createPrefill}
          .timeFormat=${display?.time_format || '12h'}
          .locationAutocomplete=${display.location_autocomplete === true}
        ></pv-event-create-dialog>
      ` : nothing}
    `;
  }

  private _openSettings() {
    this.dispatchEvent(new CustomEvent('pv-open-settings', { bubbles: true, composed: true }));
  }

  private async _refreshCalendars() {
    if (this._refreshing) return;
    this._refreshing = true;
    try {
      // Force HA to re-fetch each configured calendar entity, then the PlanaVista coordinator.
      for (const cal of this.data?.calendars || []) {
        if (cal.entity_id) {
          await this.hass.callService('homeassistant', 'update_entity', { entity_id: cal.entity_id });
        }
      }
      await this.hass.callService('homeassistant', 'update_entity', { entity_id: this.cardConfig?.entity || DEFAULT_ENTITY });
    } catch {
      // Refresh is best-effort
    }
    // Keep spinner for at least 800ms so the animation completes
    setTimeout(() => { this._refreshing = false; }, 800);
  }
}

defineElement('pv-calendar-module', PvCalendarModule);
```

Then copy these methods from the old card into the class, above `_openSettings`, with exactly these edits. The old card is `src/shell/planavista-card.ts` as committed in Task 6, which stays readable with `git show HEAD:custom_components/planavista/frontend/src/shell/planavista-card.ts` after Step 6 replaces the file:

- `_renderToolbar(calendars, currentView)`: unchanged, except the gear button's condition becomes `${this.canOpenSettings ? html`...` : nothing}` (its markup stays the same and its click handler stays `this._openSettings`).
- `_toggleFilterDropdown`, `_onFilterClickOutside`: unchanged.
- `_renderView(view, events, calendars, display)`: unchanged, except `this._previewOverrides` becomes `this.previewOverrides`.
- `_onEventClick(e)`: unchanged, except `const pvData = getPlanaVistaData(this.hass); const allEvents = pvData?.events || [];` becomes `const allEvents = this.data?.events || [];`.
- `_onCreateEvent`, `_onDayClick`, `_onTouchStart`, `_onTouchEnd`, `_onTouchCancel`: unchanged.

`CalendarConfig` and `CalendarEvent` stay imported for those methods' signatures.

- [ ] **Step 6: Turn the card into the shell**

Replace `src/shell/planavista-card.ts` with the shell. Its CSS is what stays from the card, in its original order and text:

- `:host`, `pv-clock`, `ha-card`;
- the HEADER section: `.pvc-header`, `.pvc-weather` (with `:hover` and `:active`), `.pvc-weather-info`, `.pvc-weather-temp`, `.pvc-weather-condition`, `.pvc-header-date`, `.pvc-header-time`, `.pvc-time-display`, `.pvc-time-ampm`;
- `.pvc-empty`, `.pvc-setup-pending` (with `:focus-visible`), `.pvc-setup-icon`, `.pvc-setup-title`, `.pvc-setup-hint`, `.pvc-no-weather`;
- `.pvc-settings-overlay` and `@keyframes pv-fadeIn`;
- from each `@media` block, the rules for `.pvc-header`, `.pvc-weather`, `.pvc-weather-icon`, `.pvc-weather-temp`, `.pvc-weather-condition`, `.pvc-header-date`, `.pvc-header-time`, `.pvc-time-display`, and `.pvc-time-ampm`, each wrapped in the same `@media` condition (the `max-height: 500px` block stays whole).

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement, defineElementAlias } from '../utils/define';
import { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ThemeOverrides, WeatherCondition } from '../types';
import { resolveTheme, clearThemeCache, applyThemeWithOverrides } from '../styles/themes';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { getPlanaVistaData } from '../utils/ha-utils';
import { weatherIcon } from '../utils/weather-icons';
import { memoizeOne, statesChanged } from '../utils/render-cache';
import { resolveDisplay } from '../core/display';
import { ModuleDefinition, ResolvedModules, moduleRegistry, resolveModules } from '../core/module-registry';

// The card editor, the setup and Settings wizard, and the header clock.
import './planavista-card-editor';
import './onboarding-wizard';
import './pv-clock';

const DEFAULT_ENTITY = 'sensor.planavista_config';

/**
 * The PlanaVista card: a shell that shows the header, runs setup and
 * Settings, applies the theme, and hosts the modules registered in
 * core/module-registry (today, the calendar).
 */
export class PlanaVistaCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: PlanaVistaCardConfig;
  @state() private _wizardOpen = false;
  @state() private _onboardingDone = false;
  @state() private _settingsOpen = false;
  @state() private _previewOverrides: ThemeOverrides | null = null;

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      /* Header, setup, and Settings-overlay rules kept from the card: see the list above. */
    `,
  ];

  /**
   * Home Assistant sets a new `hass` on every state change in the house.
   * Re-render for it only when an entity this card or its modules show has changed.
   */
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.size === 1 && changedProps.has('hass')) {
      const prev = changedProps.get('hass') as HomeAssistant | undefined;
      return statesChanged(prev, this.hass, this._watchedEntityIds());
    }
    return true;
  }

  private _entityId(): string {
    return this._config?.entity || DEFAULT_ENTITY;
  }

  /** The config sensor's data, cached until the sensor's state object changes. */
  private _dataFor = memoizeOne((_sensorState: unknown, entityId: string): PlanaVistaData | null =>
    this.hass ? getPlanaVistaData(this.hass, entityId) : null);

  private _data(): PlanaVistaData | null {
    const entityId = this._entityId();
    return this._dataFor(this.hass?.states?.[entityId], entityId);
  }

  private _displayFor = memoizeOne((config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): DisplayConfig =>
    resolveDisplay(config, data));

  private _display(): DisplayConfig {
    return this._displayFor(this._config, this._data());
  }

  private _modulesFor = memoizeOne((config: PlanaVistaCardConfig | undefined): ResolvedModules =>
    resolveModules(moduleRegistry.list(), config ?? {}));

  private _modules(): ResolvedModules {
    return this._modulesFor(this._config);
  }

  /** The config sensor, the weather entity, and whatever the shown modules watch. */
  private _watchedEntityIds(): string[] {
    const data = this._data();
    const ids = [this._entityId()];
    const weather = this._display().weather_entity;
    if (weather) ids.push(weather);
    for (const mod of this._modules().shown) {
      ids.push(...mod.watchedEntities({ config: this._config, data }));
    }
    return ids;
  }

  setConfig(config: PlanaVistaCardConfig) {
    this._config = { entity: DEFAULT_ENTITY, ...config };
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    // While settings panel is open, the wizard owns theme via theme-preview events.
    // Only apply saved theme from sensor when settings are closed.
    if (this._settingsOpen) return;
    if (changedProps.has('hass') || changedProps.has('_config') || changedProps.has('_settingsOpen')) {
      this._applySavedTheme();
    }
  }

  private _applySavedTheme() {
    const data = this._data();
    const theme = resolveTheme(this._config?.theme, data?.display?.theme);
    applyThemeWithOverrides(this, theme, data?.display?.theme_overrides || null);
  }

  private _onOnboardingComplete() {
    this._wizardOpen = false;
    this._onboardingDone = true;
    // Force theme application from newly saved config
    clearThemeCache(this);
  }

  private _openSettings() {
    this._settingsOpen = true;
  }

  private _onSettingsSave() {
    this._settingsOpen = false;
    this._previewOverrides = null;
    // _settingsOpen is now false so updated() will apply the newly saved theme on next hass cycle.
    clearThemeCache(this);
  }

  private _onSettingsClose() {
    this._settingsOpen = false;
    this._previewOverrides = null;
    // Revert to saved theme immediately (undo any preview changes)
    clearThemeCache(this);
    this._applySavedTheme();
  }

  private _onThemePreview(e: CustomEvent<{ theme: string; overrides: ThemeOverrides | null }>) {
    const { theme, overrides } = e.detail;
    const resolved = resolveTheme(theme);
    clearThemeCache(this);
    applyThemeWithOverrides(this, resolved, overrides);
    // Modules read the previewed avatar border and event style from here.
    this._previewOverrides = overrides;
  }

  private _getWeatherEntity() {
    const weatherId = this._display().weather_entity;
    return weatherId ? this.hass?.states?.[weatherId] : null;
  }

  private _showWeatherDetails() {
    const entityId = this._display().weather_entity;
    if (entityId) {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    if (!this._config || !this.hass) return nothing;

    const data = this._data();
    if (!data) {
      return html`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;
    }

    // Onboarding: the setup card and wizard block, moved unchanged from the card.

    const display = this._display();
    const active = this._modules().initial;

    return html`
      <ha-card>
        ${this._config.hide_header ? nothing : this._renderHeader(display)}
        ${active ? this._renderModule(active, data, display) : nothing}
        ${this._settingsOpen ? html`
          <div class="pvc-settings-overlay">
            <pv-onboarding-wizard
              .hass=${this.hass}
              mode="settings"
              .config=${data}
              @settings-save=${this._onSettingsSave}
              @settings-close=${this._onSettingsClose}
              @theme-preview=${this._onThemePreview}
            ></pv-onboarding-wizard>
          </div>
        ` : nothing}
      </ha-card>
    `;
  }

  /** Render a module through its registered element. */
  private _renderModule(mod: ModuleDefinition, data: PlanaVistaData, display: DisplayConfig) {
    const tag = unsafeStatic(mod.tag);
    return staticHtml`
      <${tag}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${data}
        .display=${display}
        .previewOverrides=${this._previewOverrides}
        .canOpenSettings=${!!(this.hass as any).user?.is_admin}
        @pv-open-settings=${this._openSettings}
      ></${tag}>
    `;
  }

  static getConfigElement() {
    return document.createElement('planavista-calendar-card-editor');
  }

  static getStubConfig() {
    return { entity: DEFAULT_ENTITY };
  }

  getCardSize(): number {
    return 10;
  }
}

defineElement('planavista-calendar-card', PlanaVistaCard);
defineElementAlias('planavista-card', PlanaVistaCard);
```

Then, from the old card (`git show HEAD:custom_components/planavista/frontend/src/shell/planavista-card.ts`):

- Paste the onboarding block from the old `render()` (from `// Onboarding` through the closing brace of `if (data.onboarding_complete === false && !this._onboardingDone) { ... }`) where the shell's `render()` has the `// Onboarding:` comment, and replace that comment with the old one.
- Move `_renderHeader(display)` and `_getTempUnit(weather)` into the class above `static getConfigElement()`, unchanged.
- Delete everything else (it now lives in the calendar module).

- [ ] **Step 7: Register the module and update the entry point**

Create `src/modules/calendar/index.ts`:

```ts
// The calendar module: its elements, and its entry in the module registry.
import './components/pv-event-chip';
import './calendar-module';
import { registerCalendarModule } from './definition';

registerCalendarModule();
```

Replace the imports and the card-picker block at the top of `src/main.ts` (keep the `console.info` banner) with:

```ts
// PlanaVista: the single entry point. Modules register themselves first,
// then the card that hosts them.
import './modules/calendar';
import './shell/planavista-card';
import { version } from '../package.json';

// Register the card with the HA card picker (once, even if another copy of the bundle ran first).
// New dashboards get the neutral name; `custom:planavista-calendar-card` keeps working.
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'planavista-card' || card.type === 'planavista-calendar-card')) {
  window.customCards.push({
    type: 'planavista-card',
    name: 'PlanaVista',
    description: 'All-in-one calendar with clock, weather, toggles, and views',
    preview: true,
  });
}
```

- [ ] **Step 8: Check that no CSS rule was lost**

```bash
python - <<'EOF'
import re, subprocess
old = subprocess.run(["git", "show", "HEAD:custom_components/planavista/frontend/src/shell/planavista-card.ts"],
                     capture_output=True, text=True, check=True).stdout
new = open("src/shell/planavista-card.ts", encoding="utf-8").read() + open("src/modules/calendar/calendar-module.ts", encoding="utf-8").read()
selectors = lambda s: set(re.findall(r"\.pvc-[a-z-]+", s))
print("missing:", sorted(selectors(old) - selectors(new)))
EOF
```

Expected: `missing: []`.

- [ ] **Step 9: Type-check, test, build, and smoke-test**

```bash
npx tsc --noEmit -p . && npx vitest run && npm run build
../../../scripts/dev-ha.sh deploy-frontend
```

Expected: `tsc` prints nothing; 19 files and 140 tests pass; the build succeeds. Then, in a fresh isolated browser context, load `http://127.0.0.1:8124/wall-calendar/planavista`, confirm the calendar renders with its header and toolbar, switch through the four views, open and close the "+ New" dialog, and check the console for errors (expected: none). Close the page. Restore the bundle: `git checkout -- dist`.

- [ ] **Step 10: Commit**

```bash
git add -A src test
git commit -F - <<'EOF'
refactor(frontend): split the card into a shell and the calendar module

The card keeps the header, setup, Settings, and theme, and renders the
modules registered in core/module-registry. The calendar's toolbar,
views, and dialogs move into pv-calendar-module, which owns the card's
calendar state. Adds the planavista-card alias and the `modules` and
`module` card options.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 8: Setup steps and Settings tabs from the registries

**Files:**
- Create: `src/shell/definition.ts`
- Modify: `src/modules/calendar/definition.ts`
- Modify: `src/shell/planavista-card.ts`
- Modify: `src/shell/onboarding-wizard.ts`
- Test: `test/wizard-pages.test.ts`

**Interfaces:**
- Consumes: `PageRegistry`, `WizardPage`, `WizardContext`, `setupSteps`, `settingsPages` (Task 4); `registerCalendarModule` (Task 7).
- Produces:
  - `shellPages: WizardPage<WizardContext>[]` and `registerShellPages(steps?: PageRegistry<WizardContext>, settings?: PageRegistry<WizardContext>): void` in `src/shell/definition.ts`.
  - `calendarPages: WizardPage<WizardContext>[]`, and `registerCalendarModule(modules?, steps?, settings?)` now also registers the pages.

- [ ] **Step 1: Write the failing test**

Create `test/wizard-pages.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from '../src/core/module-registry';
import { PageRegistry, type WizardContext } from '../src/core/page-registry';
import { registerCalendarModule } from '../src/modules/calendar/definition';
import { registerShellPages } from '../src/shell/definition';

describe('setup steps and Settings tabs', () => {
  it('are Preferences, Calendars, and Theme, in that order, as before', () => {
    const steps = new PageRegistry<WizardContext>();
    const settings = new PageRegistry<WizardContext>();
    registerShellPages(steps, settings);
    registerCalendarModule(new ModuleRegistry(), steps, settings);
    expect(steps.pages({ mode: 'onboarding' }).map(p => p.label)).toEqual(['Preferences', 'Calendars', 'Theme']);
    expect(settings.pages({ mode: 'settings' }).map(p => p.label)).toEqual(['Preferences', 'Calendars', 'Theme']);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run test/wizard-pages.test.ts`
Expected: FAIL, because `src/shell/definition` doesn't exist.

- [ ] **Step 3: Register the pages**

Create `src/shell/definition.ts`:

```ts
import { PageRegistry, WizardContext, WizardPage, settingsPages, setupSteps } from '../core/page-registry';

/** Pages the shell itself contributes to setup and Settings. */
export const shellPages: WizardPage<WizardContext>[] = [
  { id: 'theme', label: 'Theme', order: 900 },
];

/** Add the shell's pages to setup and Settings. */
export function registerShellPages(
  steps: PageRegistry<WizardContext> = setupSteps,
  settings: PageRegistry<WizardContext> = settingsPages,
): void {
  for (const page of shellPages) {
    steps.register(page);
    settings.register(page);
  }
}
```

Replace `src/modules/calendar/definition.ts` with:

```ts
import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { PageRegistry, WizardContext, WizardPage, settingsPages, setupSteps } from '../../core/page-registry';
import { calendarWatchedEntities, selectCalendars } from './calendar-derive';

/** The calendar module, as the shell sees it. */
export const calendarModule: ModuleDefinition = {
  id: 'calendar',
  label: 'Calendar',
  icon: 'mdi:calendar-month',
  tag: 'pv-calendar-module',
  order: 10,
  watchedEntities: ({ config, data }) => calendarWatchedEntities(selectCalendars(data, config)),
};

/** The calendar's pages in setup and Settings. */
export const calendarPages: WizardPage<WizardContext>[] = [
  { id: 'preferences', label: 'Preferences', order: 100 },
  { id: 'calendars', label: 'Calendars', order: 200 },
];

/** Add the calendar to the module registry, and its pages to setup and Settings. */
export function registerCalendarModule(
  modules: ModuleRegistry = moduleRegistry,
  steps: PageRegistry<WizardContext> = setupSteps,
  settings: PageRegistry<WizardContext> = settingsPages,
): void {
  modules.register(calendarModule);
  for (const page of calendarPages) {
    steps.register(page);
    settings.register(page);
  }
}
```

In `src/shell/planavista-card.ts`, add `import { registerShellPages } from './definition';` with the other imports, and add `registerShellPages();` on the line before `defineElement('planavista-calendar-card', PlanaVistaCard);`.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run test/wizard-pages.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Drive the wizard from the registries**

In `src/shell/onboarding-wizard.ts`:

1. Add `import { setupSteps, settingsPages, WizardContext, WizardPage } from '../core/page-registry';`.
2. Update the class doc comment's first paragraph to: "A full-screen onboarding wizard that guides the user through the setup steps registered in core/page-registry (today: Preferences, Calendars, Theme). On completion, it calls the planavista.save_config service and fires an 'onboarding-complete' event."
3. Rename `_renderPage0` to `_renderPreferences`, `_renderPage1` to `_renderCalendars`, and `_renderPage2` to `_renderTheme`, and rename the state section comments to "Preferences page", "Calendars page", and "Theme page".
4. Add these methods above `_goBack`:

```ts
  /** This mode's pages, in order: the setup steps, or the Settings tabs. */
  private _pages(): WizardPage<WizardContext>[] {
    const registry = this.mode === 'settings' ? settingsPages : setupSteps;
    return registry.pages({ mode: this.mode });
  }

  private _renderPageContent(page: WizardPage<WizardContext> | undefined) {
    switch (page?.id) {
      case 'preferences': return this._renderPreferences();
      case 'calendars': return this._renderCalendars();
      case 'theme': return this._renderTheme();
      default: return nothing;
    }
  }
```

5. In `_goNext`, replace `if (this._page < 2) {` with `if (this._page < this._pages().length - 1) {`.
6. Replace `_renderProgressDots()` with:

```ts
  private _renderProgressDots(pages: WizardPage<WizardContext>[]) {
    return html`
      <div class="progress-dots" aria-label="Step ${this._page + 1} of ${pages.length}">
        ${pages.map((_, i) => html`
          <div
            class="dot ${i === this._page ? 'dot--active' : ''}"
            aria-current="${i === this._page ? 'step' : 'false'}"
          ></div>
        `)}
      </div>
    `;
  }
```

7. In `render()`:
   - Replace `const pageLabels = ['Preferences', 'Calendars', 'Theme'];` and `const isLast = this._page === 2;` with:

```ts
    const pages = this._pages();
    const page = pages[Math.min(this._page, pages.length - 1)];
    const isLast = this._page >= pages.length - 1;
```

   - In the dialog's `aria-label`, replace `${pageLabels[this._page]}` with `${page?.label ?? ''}`.
   - Replace the Settings tabs' `${pageLabels.map((label, i) => html`...${label}...`)}` with `${pages.map((p, i) => html`...${p.label}...`)}`, keeping the button markup.
   - Replace `${this._renderProgressDots()}` with `${this._renderProgressDots(pages)}`.
   - Replace the three `${this._page === 0 ? this._renderPage0() : ''}` lines with `${this._renderPageContent(page)}`.

- [ ] **Step 6: Type-check, test, and smoke-test the wizard**

```bash
npx tsc --noEmit -p . && npx vitest run && npm run build
../../../scripts/dev-ha.sh deploy-frontend
```

Expected: `tsc` prints nothing; 20 files and 141 tests pass. In a fresh isolated browser context, open Settings: the tabs read Preferences, Calendars, Theme and each shows its page; Close discards changes. Close the page. Restore the bundle: `git checkout -- dist`.

- [ ] **Step 7: Commit**

```bash
git add -A src test
git commit -F - <<'EOF'
refactor(frontend): build setup steps and Settings tabs from the page registries

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 9: Verify the milestone and prepare the release (controller)

**Files:**
- Modify: `hacs.json`
- Modify: `custom_components/planavista/frontend/dist/planavista-cards.js` (rebuilt)
- Modify (local only, never committed): `CLAUDE.md`

- [ ] **Step 1: Run every check**

```bash
python scripts/check_copy.py && echo copy-ok
cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npx vitest run && cd ../../..
scripts/test-backend.sh -q
```

Expected: `copy-ok`; `tsc` prints nothing; 20 files and 141 tests pass; every backend test passes (including the 4 copy-check tests).

- [ ] **Step 2: Build and deploy**

```bash
cd custom_components/planavista/frontend && npm run build && ls -l dist/planavista-cards.js && cd ../../..
scripts/dev-ha.sh deploy-frontend
```

Expected: the build succeeds and the bundle is within 15% of today's size (about 245 KB).

- [ ] **Step 3: Compare against the baseline**

In a fresh isolated context (`m1-verify`), take the same screenshots as Task 0 and compare each pair. Expected: identical, except the copy rewritten in Task 2. Check the console (expected: no PlanaVista errors). Also check that swiping still changes the date (emulate touch at 800 × 1280 if needed) and that Settings' Theme tab still previews a theme live and reverts on Close.

- [ ] **Step 4: Check two cards, the alias, and the options**

On the dev Home Assistant only, create a temporary dashboard `m1-check` (WebSocket `lovelace/dashboards/create` with `url_path: m1-check`, `mode: storage`, `title: M1 check`) and save this view to it with `lovelace/config/save`:

```yaml
views:
  - title: Check
    type: panel
    cards:
      - type: vertical-stack
        cards:
          - type: custom:planavista-card
            view: week
          - type: custom:planavista-calendar-card
            view: day
            hide_weather: true
          - type: custom:planavista-card
            modules: [calendar]
            module: calendar
            calendars: [calendar.test_alex]
```

Expected: the alias card renders; switching the first card to Month leaves the second on Day; the second card shows no weather; the third shows only Alex's calendar; after navigating to another dashboard and back, each card keeps its view. Then delete the dashboard (`lovelace/dashboards/delete`) and close every page you opened.

- [ ] **Step 5: Prepare HACS to install releases only**

Change `hacs.json` to:

```json
{
  "name": "PlanaVista",
  "render_readme": true,
  "homeassistant": "2026.3.0",
  "hide_default_branch": true
}
```

This must not reach `main` before the 1.1.0 release exists. The merge happens only after the owner's go-ahead, after the release is published.

- [ ] **Step 6: Update CLAUDE.md (local only)**

Update the Repository Structure tree and the Frontend section for `shell/`, `core/`, and `modules/calendar/`, the `planavista-card` alias, the `modules` and `module` options, per-card `CalendarStore`, the page registries, and `scripts/check_copy.py`. Don't stage it.

- [ ] **Step 7: Commit the bundle and the HACS setting**

```bash
git add custom_components/planavista/frontend/dist/planavista-cards.js hacs.json
git commit -F - <<'EOF'
build: rebuild bundle, and offer only releases in HACS

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

- [ ] **Step 8: Push the branch and watch CI**

```bash
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m1-groundwork
gh run list --branch feat/chores-m1-groundwork --limit 5
```

Expected: Validate (hassfest, HACS, backend tests, copy check) and Frontend (type-check, tests, build, committed bundle matches) both pass. Watch with `gh run watch <id>`; fix and push again on failure.

- [ ] **Step 9: Review the whole branch**

Use superpowers:requesting-code-review for `main...feat/chores-m1-groundwork`. Fix what it confirms, then repeat Steps 1 and 8.

- [ ] **Step 10: Demo and wait**

Show the owner what changed and what to look at (the calendar looks the same; two cards on one dashboard now keep their own view; the `planavista-card` alias; the copy check in CI), with screenshots. Wait for the go-ahead. After it: publish the 1.1.0 release from `main` (`gh release create v1.1.0 --target main --title "1.1.0" --notes-file <notes>`), then merge the branch into `main`.
