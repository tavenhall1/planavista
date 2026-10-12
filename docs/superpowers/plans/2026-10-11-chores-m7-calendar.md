# Milestone 7, The Calendar Takes On the Rest: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The calendar and Chores read as one product: an event's details and New event and Edit event become sheets (spring entrance, drag to dismiss, focus traps, Escape, focus returned); the calendar takes the rounded headings, the status map, designed loading, empty, and error states, and the copy rules; view changes use the springs; and two carried items land: the calendar's sizes follow the card's width (DESIGN_SYSTEM 2.1) and the portrait header shrinks to one line while the content scrolls (spec 12.2). The branch also carries release 1.4.0's version and docs, published only after the go-ahead.

**Architecture:** Two shared pieces make the sheets: `core/sheet-presence.ts` (pure) keeps a sheet mounted while it leaves after the state lets go of it, and `shell/sheet-controller.ts` gives a sheet its life (open on a spring, drag, Escape with a hook for pickers and steps, the focus trap, leave then report). The calendar module mirrors its store into one presence per sheet, keys each mount, and returns focus to the element that opened a sheet. Pure modules carry the unit tests: `event-words.ts` (when, status, the delete question, errors, the form's signature), `calendar-states.ts` (which screen, which banners), `view-words.ts` (names and notes), `core/view-motion.ts` (which change and its keyframes), and `core/content-scroll.ts` (when the header shrinks). Elements only render; their behavior is checked on the dev Home Assistant. One backend change: the coordinator marks a calendar whose events couldn't be read (`fetch_failed`).

**Tech Stack:** TypeScript 5.7 with Lit 3, Rollup, vitest 5 (node environment, `TZ=America/Chicago`); Python 3.14 and Home Assistant 2026.9.4, tested with pytest-homeassistant-custom-component 0.13.367 in Docker (`scripts/test-backend.sh`).

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 7, with sections 11.2 (type), 11.4 (status map), 11.5 (motion: "event dialogs become sheets, ... view changes use the same springs"), 11.6 (states), 11.7 (copy), 11.8 (accessibility), 12.1 (the card measures itself), 12.2 (the portrait header shrinking as the content scrolls), and 12.3 (sheets).

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data (spec 7.8): the coordinator adds an optional `fetch_failed` to a calendar row; nothing is renamed or removed, and 1.3.0's card ignores the field.
- Public surface (spec 10.8): no entity, action, or WebSocket changes. The card's element names stay (`planavista-card`, `planavista-calendar-card`, `pv-event-popup`, `pv-event-create-dialog`).
- Copy (spec 11.7): sentence case, one name per thing (New event; Who), destructive actions confirmed by name without quotes, errors that say what happened and what to do next, no raw error text on screen.
- Touch targets are at least 48 px, even where the drawn control is smaller; every sheet is a dialog with a focus trap, Escape, and focus returned (spec 11.8).
- Motion (spec 11.5): only transform, opacity, and stroke offsets animate; reduced motion keeps the meaning with a quick fade; springs come from `core/motion.ts`.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, and docs.
- Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or publish a release in this plan. Pushing the milestone branch for CI is allowed. Release 1.4.0 follows the user's go-ahead.
- Frontend: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`; the bundle (`npm run build`) is committed in Task 9 and must match the source. Backend: `bash scripts/test-backend.sh` (from the repository root).
- Paths are relative to the repository root.

## Review Focus

1. **A sheet closed two ways at once, or reopened mid-exit** (a save finishing while the person presses Escape, or another event tapped during the 240 ms exit). The sheet leaves once, the store ends clean, the overlay signal stays open until the sheet is gone, and focus lands on a connected element. Pinned by Task 1's `nextPresence` tests and the module's keyed mounts in Tasks 2 and 3, checked on the dev Home Assistant.
2. **Typing in the editor, then dismissing it.** Escape, a tap outside, or a drag ask "Discard this event?" or "Discard your changes?"; Keep editing keeps every field; Cancel discards straight away; Escape closes an open picker before the sheet. Pinned by Task 3's `formSignature` tests and the dev Home Assistant walkthrough.
3. **Home Assistant starting, PlanaVista's data unavailable, or one calendar unreachable.** A skeleton, "Can't load the calendar", or a banner naming the calendar; a hidden calendar's outage isn't announced; nothing reads "No calendars yet" just because the sensor lost its attributes. Pinned by Task 4's `screenOf` and `bannersOf` tests and the coordinator's `fetch_failed` test.
4. **A narrow card on a wide screen, or a wall display's wide card.** The calendar's sizes follow the card, and the sheets still cover the whole screen. Pinned by Task 6's `calendar-sizes` tests and measured on the dev Home Assistant at 800 and 1444 px wide.
5. **Changes nobody made, and reduced motion.** A midnight rollover or a wake doesn't glide, the Day view scrolling itself to now doesn't shrink the header, and reduced motion fades. Pinned by Task 7's `viewChange` and `viewMotion` tests and Task 8's `shouldReport` and `compactHeader` tests.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others. Every module and every test in Tasks 1 to 9 was built and run in a scratch branch before this plan was written (1050 backend tests and 790 frontend tests at the end, each task's tests run at its own commit), and each screen was checked on the dev Home Assistant at 1280 by 800, 800 by 1280, and 390 by 844, in light and dark, from the keyboard as well as by touch.

1. **Ruling: the element names stay** (`pv-event-popup` for an event's details, `pv-event-create-dialog` for New event and Edit event); what they draw and how they move changes. Cost if wrong: none.
2. **Ruling: one `SheetController` serves the new sheets; the chores sheets keep their working code.** Cost if wrong: two ways to write a sheet until one is unified.
3. **Ruling: Edit opens the editor over the details sheet, and Cancel goes back to the details; saving closes both.** Cost if wrong: none.
4. **Ruling: Escape steps back: an open picker first, then the sheet; in the details sheet, the delete question first.** Cost if wrong: none.
5. **Ruling: the discard question comes only from Escape, a tap outside, or a drag, and only when a field changed; Cancel discards straight away.** Cost if wrong: a parent who taps Cancel by mistake retypes the event.
6. **Ruling: status badges show in Agenda and in the event sheet only** (Day, Week, and Month keep the now line and dim what's past). In N min starts 15 minutes ahead, in amber; Now is neutral; Day N of M is counted on each Agenda card's own day. Cost if wrong: none.
7. **Ruling: Who replaces Calendars and Participants in the editor** (people's names are on the chips). Cost if wrong: none.
8. **Ruling: the toolbar says New event** (one name per thing: never + New, + Add, Add event, or Create event); the editor's button says Add, or Save when editing, as the chore editor does. Cost if wrong: none.
9. **Ruling: Week and Agenda drop the "N events" line; an empty day says "Nothing planned"; each day's add is a 48 px + named "New event on Monday, October 12".** Cost if wrong: a glance no longer shows a day's count in words.
10. **Ruling: the calendar's width breakpoints become container queries on one frame (`.pvc-frame`) that the sheets sit outside of; window-height queries stay media queries** (the card fills the window's height). Chrome 152 doesn't trap fixed descendants in a container, but other kiosk browsers might, so the sheets never sit inside one. Cost if wrong: a browser without container queries (before 2023) keeps the base sizes.
11. **Ruling: the portrait header shrinks past 24 px of scroll and grows back under 8 px; any scroller reports and the last report wins; a scroller reports only after a person's touch, wheel, or key on it (or at the top).** The Day view scrolling itself to now doesn't count. Cost if wrong: two scrolled panels can disagree for a moment.
12. **Ruling: view-change motion is an entrance only, and a step to another day, week, or month glides only when a person moved the calendar in the last second** (the arrows, Today, a swipe, a day tapped in Month). Cost if wrong: a simpler glide than iOS's; a midnight rollover just switches.
13. **Ruling: the calendar counts as loading while Home Assistant is starting (`hass.config.state` isn't RUNNING) and as unavailable once it runs and the config sensor still has no data;** the card's missing-sensor message tells "Home Assistant is starting" from "PlanaVista isn't set up yet". Cost if wrong: a start that hangs shows a skeleton until it runs.
14. **Ruling: errors drop Home Assistant's raw words** ("Failed to save event: ...", "(End must be after start)"), which go to the browser's log instead; people get what happened and what to do next. Cost if wrong: a person reporting a bug can't read the cause off the screen.
15. **Ruling: Agenda starts on the day shown,** so Previous, Next, and Today move it a week at a time; it still shows 14 days, with Show more days. Cost if wrong: none.
16. **Ruling: Month's compact chips and "+N more" stay small; the whole cell is the day's 48 px target** (it opens the day). Cost if wrong: opening one event from Month needs a careful tap.
17. **Ruling: event chips and the Day view's events and all-day chips become keyboard buttons** (role button, Tab-reachable, Enter or Space opens them), so focus has somewhere to return to. Cost if wrong: none.
18. **Ruling: the event sheet hides Edit and Delete for an event with no uid, or on a calendar whose `supported_features` can't do them, and says it can only be changed in its calendar's own app;** unknown features count as yes. Cost if wrong: a calendar that reports its features wrongly hides a working Edit.
19. **Ruling: Delete for everyone keeps the sheet open and names the calendars it couldn't reach,** instead of closing as if it worked. Cost if wrong: none.
20. **Ruling: the banner's and the unavailable state's Try again refresh the calendars** (update_entity, as the toolbar's refresh does). Cost if wrong: none.
21. **Ruling: the coordinator marks `fetch_failed` on a calendar whose events couldn't be read,** an added field (1.3.0's card ignores it) that the next good read drops. Cost if wrong: none.
22. **Ruling: the calendar's Settings pages follow the copy rules** (Name, Home Assistant person, Time format, First day of the week, Weather, Default view, 12-hour and 24-hour, None), and the Calendars page's empty text points to Settings, Devices and services instead of "re-run setup". Cost if wrong: none.
23. **Ruling: the status badges, designed states, banners, and bones move from `chores-styles.ts` to `styles/status.ts`,** shared by both modules and the card. Cost if wrong: none.
24. **Ruling: the All day switch's off track uses the muted text color (about 3:1 on the card),** the M3 deferred minor. Cost if wrong: none.
25. **Ruling: the old overlay styles (`dialogStyles`) and the unused window-width helpers (`styles/responsive.ts`) are removed.** Cost if wrong: none; nothing imports them.
26. **Ruling: the portrait header starts tall again when the view, module, or layout changes.** Cost if wrong: none.
27. **Ruling: chores' views get the same view-change springs** (Board, Week, My day, Rewards; Week's weeks slide). Cost if wrong: none.
28. **Ruling: the event sheet focuses its first action on open (Edit), and the editor focuses its title,** as the chores sheets do. Cost if wrong: a stray Enter opens Edit.

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/chores-m7-calendar` (main is at `7df7fa5`, milestone 6 merged and released as 1.3.0).
- [ ] **Step 2: Baseline.** `bash scripts/test-backend.sh -q` Expected: `1049 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `731 passed`.
- [ ] **Step 3: Commit this plan.** `git add docs/superpowers/plans/2026-10-11-chores-m7-calendar.md && git commit` with the message `docs: plan milestone 7, the calendar takes on the rest` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m7-calendar`.

---

### Task 1: A sheet that stays while it leaves, and one controller for its life

Spec 11.8 (sheets are dialogs with a focus trap, Escape, and focus returned) and 12.3 (sheets in two shapes); DESIGN_SYSTEM 2.4 (a sheet leaves before it reports why it closed).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/sheet-presence.ts`, `custom_components/planavista/frontend/src/shell/sheet-controller.ts`
- Modify: `custom_components/planavista/frontend/src/core/focus.ts`, `custom_components/planavista/frontend/src/shell/sheet-motion.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/sheet-presence.test.ts`, `custom_components/planavista/frontend/test/focus.test.ts`

**Interfaces:**
- Produces: `deepActiveElement(root = document): HTMLElement | null` in `core/focus.ts` (moved from the chores module); `Presence<T> { value: T | null; leaving: boolean }`, `GONE`, `nextPresence(prev, wanted)` in `core/sheet-presence.ts`; `SheetMotion.springBack(panel)`; `SheetController(host, { initialFocus?, escape?, mayDismiss? })` with `dismiss()`, `close()`, `onKeydown`, `closing`, firing `pv-sheet-close` once it has left.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/sheet-presence.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { GONE, Presence, nextPresence } from '../src/core/sheet-presence';

const dentist = { summary: 'Dentist' };
const standup = { summary: 'Team standup' };

describe('nextPresence', () => {
  it('mounts a sheet when something wants it', () => {
    expect(nextPresence(GONE as Presence<typeof dentist>, dentist)).toEqual({ value: dentist, leaving: false });
  });

  it('keeps the same presence while the same thing is wanted, so nothing redraws', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    expect(nextPresence(shown, dentist)).toBe(shown);
  });

  it('keeps the sheet mounted while it leaves once nothing wants it', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    const leaving = nextPresence(shown, null);
    expect(leaving).toEqual({ value: dentist, leaving: true });
    expect(nextPresence(leaving, null)).toBe(leaving);
  });

  it('shows the new choice when another is wanted, even mid-exit', () => {
    const shown: Presence<typeof dentist> = { value: dentist, leaving: false };
    expect(nextPresence(shown, standup)).toEqual({ value: standup, leaving: false });
    expect(nextPresence({ value: dentist, leaving: true }, dentist)).toEqual({ value: dentist, leaving: false });
  });

  it('stays gone when nothing was showing', () => {
    expect(nextPresence(GONE as Presence<typeof dentist>, null)).toBe(GONE);
  });
});
```

`custom_components/planavista/frontend/test/focus.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/focus.test.ts b/custom_components/planavista/frontend/test/focus.test.ts
index 6e5ae9d..0a59f15 100644
--- a/custom_components/planavista/frontend/test/focus.test.ts
+++ b/custom_components/planavista/frontend/test/focus.test.ts
@@ -1,5 +1,18 @@
 import { describe, expect, it } from 'vitest';
-import { wrapFocusIndex } from '../src/core/focus';
+import { deepActiveElement, wrapFocusIndex } from '../src/core/focus';
+
+describe('deepActiveElement', () => {
+  it('follows focus into shadow roots to the control that has it', () => {
+    const button = { focus() {}, shadowRoot: null };
+    const sheet = { shadowRoot: { activeElement: button } };
+    const card = { shadowRoot: { activeElement: sheet } };
+    expect(deepActiveElement({ activeElement: card as unknown as Element })).toBe(button);
+  });
+
+  it('says nothing when nothing has focus', () => {
+    expect(deepActiveElement({ activeElement: null })).toBeNull();
+  });
+});
 
 describe('wrapFocusIndex', () => {
   it('wraps Tab and Shift+Tab around the ends of a dialog', () => {
```

- [ ] **Step 2: Run them.** `cd custom_components/planavista/frontend && npx vitest run test/sheet-presence.test.ts test/focus.test.ts` Expected: FAIL: `sheet-presence` can't be found, and `deepActiveElement` isn't exported from `core/focus.ts`.

- [ ] **Step 3: The focus helper moves to core.**

`custom_components/planavista/frontend/src/core/focus.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/focus.ts b/custom_components/planavista/frontend/src/core/focus.ts
index cf13518..e8dad0f 100644
--- a/custom_components/planavista/frontend/src/core/focus.ts
+++ b/custom_components/planavista/frontend/src/core/focus.ts
@@ -9,6 +9,18 @@ export function wrapFocusIndex(current: number, count: number, backwards: boolea
   return backwards ? (current - 1 + count) % count : (current + 1) % count;
 }
 
+/** Where focus is kept: the document, or a shadow root. */
+interface FocusHolder {
+  activeElement: Element | null;
+}
+
+/** The element with focus, looking inside shadow roots (the card's controls live in several). */
+export function deepActiveElement(root: FocusHolder = document): HTMLElement | null {
+  let active: Element | null = root.activeElement;
+  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
+  return active && typeof (active as HTMLElement).focus === 'function' ? (active as HTMLElement) : null;
+}
+
 /** Keep Tab inside a dialog rendered in `root` (spec 11.8). */
 export function trapTab(root: ShadowRoot, event: KeyboardEvent): void {
   if (event.key !== 'Tab') return;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 7270edd..3362394 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -11,6 +11,7 @@ import type { Session } from '../../core/session';
 import type { Toast } from '../../core/pv-toast';
 import { memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
 import { OPEN_SETTINGS } from '../../core/page-host';
+import { deepActiveElement } from '../../core/focus';
 import type { SettingsTarget } from '../../core/settings-registry';
 import type { Mode } from '../../styles/theme-pairs';
 import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../../types';
@@ -63,13 +64,6 @@ type ChoresSheet =
   | { kind: 'day'; member: string; date: string; day: DayView | null; failed: boolean }
   | { kind: 'quick_add'; busy: boolean };
 
-/** The element with focus, looking inside shadow roots (the card's controls live in several). */
-function deepActiveElement(): HTMLElement | null {
-  let active: Element | null = document.activeElement;
-  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
-  return active instanceof HTMLElement ? active : null;
-}
-
 /** What the last check-off toast can take back or hand to someone else. */
 interface LastCheckoff {
   row: RowModel;
```

- [ ] **Step 4: Sheet presence.**

`custom_components/planavista/frontend/src/core/sheet-presence.ts` (new):

```ts
/**
 * A sheet stays on screen while it leaves (DESIGN_SYSTEM 2.4: a sheet leaves
 * before it reports why it closed). A module keeps one Presence per sheet
 * and steps it whenever the state that wants the sheet changes, so a sheet
 * the state lets go of (an event saved, a delete done) still plays its exit.
 */
export interface Presence<T> {
  /** What the sheet shows; null while it isn't mounted. */
  value: T | null;
  /** True once nothing wants it any more: it is playing its exit. */
  leaving: boolean;
}

/** No sheet. */
export const GONE: Presence<never> = Object.freeze({ value: null, leaving: false });

/** The next presence, given what should show now (null for nothing). */
export function nextPresence<T>(prev: Presence<T>, wanted: T | null): Presence<T> {
  if (wanted !== null) return prev.value === wanted && !prev.leaving ? prev : { value: wanted, leaving: false };
  if (prev.value === null || prev.leaving) return prev;
  return { value: prev.value, leaving: true };
}
```

- [ ] **Step 5: A drag that doesn't close springs back through one method, and the controller.**

`custom_components/planavista/frontend/src/shell/sheet-motion.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/sheet-motion.ts b/custom_components/planavista/frontend/src/shell/sheet-motion.ts
index 55aafce..b171879 100644
--- a/custom_components/planavista/frontend/src/shell/sheet-motion.ts
+++ b/custom_components/planavista/frontend/src/shell/sheet-motion.ts
@@ -46,6 +46,14 @@ export class SheetMotion {
     await out.finished.catch(() => undefined);
   }
 
+  /** Back to rest after a drag that didn't close it (too short, or the sheet asks first). */
+  springBack(panel: HTMLElement): void {
+    const from = panel.style.transform || 'translateY(0)';
+    panel.style.transform = '';
+    const settle = motionOf(this._host) === 'reduced' ? { duration: 120, easing: 'ease-out' } : springEasing(BOUNCY);
+    panel.animate({ transform: [from, 'translateY(0)'] }, { duration: settle.duration, easing: settle.easing });
+  }
+
   /** Let a finger drag the panel down by `zone`; `onClose` when it should close. Returns a function that stops listening. */
   attachDrag(zone: HTMLElement, panel: HTMLElement, onClose: () => void): () => void {
     let start: { y: number; t: number } | null = null;
@@ -73,9 +81,7 @@ export class SheetMotion {
         onClose();
         return;
       }
-      const settle = motionOf(this._host) === 'reduced' ? { duration: 120, easing: 'ease-out' } : springEasing(BOUNCY);
-      panel.style.transform = '';
-      panel.animate({ transform: [`translateY(${dy}px)`, 'translateY(0)'] }, { duration: settle.duration, easing: settle.easing });
+      this.springBack(panel);
     };
     zone.addEventListener('pointerdown', down);
     zone.addEventListener('pointermove', move);
```

`custom_components/planavista/frontend/src/shell/sheet-controller.ts` (new):

```ts
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Layout } from '../core/layout';
import { trapTab } from '../core/focus';
import { SheetMotion } from './sheet-motion';

type SheetHost = ReactiveControllerHost & HTMLElement & { layout: Layout };

export interface SheetOptions {
  /** The control to focus once the sheet is open (else its first action). */
  initialFocus?: () => HTMLElement | null;
  /** Takes Escape first (a picker to close, a step to go back); true when it did. */
  escape?: () => boolean;
  /** Asked before Escape, a tap outside, or a drag closes the sheet; false keeps it open. */
  mayDismiss?: () => boolean;
}

/**
 * A sheet's life (spec 11.8, 12.3): it rises from the bottom (or pops in as
 * a card in landscape) on a spring, follows a finger down, keeps Tab inside,
 * closes on Escape, and leaves before it fires pv-sheet-close. The host
 * renders .backdrop, a .panel with role dialog, and a .grab-zone, binds
 * onKeydown to the panel and dismiss() to the backdrop.
 */
export class SheetController implements ReactiveController {
  private readonly _motion: SheetMotion;
  private _opened = false;
  private _closing = false;
  private _detach: (() => void) | null = null;

  constructor(private readonly _host: SheetHost, private readonly _options: SheetOptions = {}) {
    this._motion = new SheetMotion(_host);
    _host.addController(this);
  }

  /** True once the sheet has started to leave. */
  get closing(): boolean {
    return this._closing;
  }

  hostUpdated(): void {
    if (this._opened) return;
    const parts = this._parts();
    if (!parts) return;
    this._opened = true;
    this._motion.open(parts.panel, parts.backdrop);
    this._detach = this._motion.attachDrag(parts.zone, parts.panel, () => this.dismiss());
    (this._options.initialFocus?.() ?? parts.panel.querySelector<HTMLElement>('.actions button'))?.focus();
  }

  hostDisconnected(): void {
    this._detach?.();
    this._detach = null;
  }

  /** Escape, a tap outside, or a drag: it closes unless the sheet asks first. */
  dismiss(): void {
    if (this._closing) return;
    if (this._options.mayDismiss && !this._options.mayDismiss()) {
      const parts = this._parts();
      if (parts) this._motion.springBack(parts.panel);
      return;
    }
    void this.close();
  }

  /** Leave, then say so (a sheet replaced meanwhile says nothing). */
  async close(): Promise<void> {
    if (this._closing) return;
    const parts = this._parts();
    if (!parts) return;
    this._closing = true;
    await this._motion.close(parts.panel, parts.backdrop);
    if (!this._host.isConnected) return;
    this._host.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this._options.escape?.()) return;
      this.dismiss();
      return;
    }
    if (this._host.shadowRoot) trapTab(this._host.shadowRoot, event);
  };

  private _parts(): { panel: HTMLElement; backdrop: HTMLElement; zone: HTMLElement } | null {
    const root = this._host.shadowRoot;
    const panel = root?.querySelector<HTMLElement>('.panel');
    const backdrop = root?.querySelector<HTMLElement>('.backdrop');
    const zone = root?.querySelector<HTMLElement>('.grab-zone');
    return panel && backdrop && zone ? { panel, backdrop, zone } : null;
  }
}
```

- [ ] **Step 6: Run the task's tests.** `npx vitest run test/sheet-presence.test.ts test/focus.test.ts` Expected: PASS, `8 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `738 passed`.

- [ ] **Step 7: Commit.** `git add` the files above; message:

```text
feat(card): a sheet stays on screen while it leaves, with one controller for its life

Sheet presence keeps a sheet mounted while it plays its exit after the
state that wanted it lets go, and the sheet controller gives new sheets
the spring entrance, drag to dismiss, Escape, the focus trap, and the
rule that a sheet leaves before it says it closed. The focus helper
that finds the focused control inside shadow roots moves to core so
both modules can return focus to where a sheet came from.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 2: An event's details open as a sheet

Spec 11.4 (the status map), 11.5 ("event dialogs become sheets"), 11.7 (destructive actions confirmed by name), 11.8, and 12.3.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/calendar/event-words.ts`, `custom_components/planavista/frontend/src/styles/status.ts`
- Rewrite: `custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/chores-styles.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`
- Test: `custom_components/planavista/frontend/test/event-words.test.ts`

**Interfaces:**
- Consumes: Task 1's `SheetController`, `nextPresence`, `GONE`, `deepActiveElement`.
- Produces: `longDate`, `eventWhen(event, timeFormat, now) -> { date, time }`, `eventStatus(event, now) -> StatusBadge | null`, `namesList`, `eventName`, `deleteQuestion(event, sharedNames) -> { heading, body, shared }`, `deleteFailedText(event, failedNames, everyone)`, `calendarCan(features) -> { delete, edit }` in `event-words.ts`; `statusStyles` in `styles/status.ts` (badges, `.state`, `.banner`, `.bone`); `pv-event-popup` takes `layout`, `calendars`, `leaving`, `now` and fires `pv-sheet-close`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/event-words.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, longDate, namesList,
} from '../src/modules/calendar/event-words';

const NOW = new Date(2026, 9, 12, 8, 50); // Mon Oct 12, 8:50 AM

function event(start: string, end: string, summary = 'Team standup'): CalendarEvent {
  return { summary, start, end, calendar_entity_id: 'calendar.test_blair', calendar_name: 'Blair', calendar_color: '#F3722C' } as CalendarEvent;
}

describe('longDate', () => {
  it('names the weekday and month, and the year only when it is not this one', () => {
    expect(longDate(new Date(2026, 9, 12), NOW)).toBe('Monday, October 12');
    expect(longDate(new Date(2027, 0, 4), NOW)).toBe('Monday, January 4, 2027');
  });
});

describe('eventWhen', () => {
  it('gives a timed event its day and its times', () => {
    expect(eventWhen(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00'), '12h', NOW))
      .toEqual({ date: 'Monday, October 12', time: '9:00 AM – 9:30 AM' });
  });

  it('keeps an event that ends at midnight on its own day', () => {
    expect(eventWhen(event('2026-10-12T23:00:00-05:00', '2026-10-13T00:00:00-05:00'), '12h', NOW).time).toBe('11:00 PM – 12:00 AM');
  });

  it('names the day a timed event ends on when it runs overnight', () => {
    expect(eventWhen(event('2026-10-12T21:00:00-05:00', '2026-10-13T07:00:00-05:00'), '12h', NOW).time)
      .toBe('9:00 PM – Tue, Oct 13, 7:00 AM');
  });

  it('says All day, and through which day for a longer one', () => {
    expect(eventWhen(event('2026-10-12', '2026-10-13'), '12h', NOW)).toEqual({ date: 'Monday, October 12', time: 'All day' });
    expect(eventWhen(event('2026-10-12', '2026-10-15'), '12h', NOW).time).toBe('All day, through Wednesday, October 14');
  });

  it('uses the 24-hour clock when the household does', () => {
    expect(eventWhen(event('2026-10-12T14:00:00-05:00', '2026-10-12T15:30:00-05:00'), '24h', NOW).time).toBe('14:00 – 15:30');
  });
});

describe('eventStatus', () => {
  const standup = event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00');

  it('says In N min in amber for the last 15 minutes before it starts', () => {
    expect(eventStatus(standup, NOW)).toEqual({ words: 'In 10 min', tone: 'time' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 8, 59, 30))).toEqual({ words: 'In 1 min', tone: 'time' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 8, 44))).toBeNull();
  });

  it('says Now while it runs, and nothing once it has ended', () => {
    expect(eventStatus(standup, new Date(2026, 9, 12, 9, 0))).toEqual({ words: 'Now', tone: 'neutral' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 9, 30))).toBeNull();
  });

  it('counts the days through a multi-day all-day event', () => {
    const trip = event('2026-10-11', '2026-10-14', 'Weekend trip');
    expect(eventStatus(trip, NOW)).toEqual({ words: 'Day 2 of 3', tone: 'neutral' });
    expect(eventStatus(trip, new Date(2026, 9, 14, 9))).toBeNull();
    expect(eventStatus(event('2026-10-12', '2026-10-13'), NOW)).toBeNull();
  });
});

describe('names in sentences', () => {
  it('joins names the way people write them', () => {
    expect(namesList(['Alex'])).toBe('Alex');
    expect(namesList(['Alex', 'Blair'])).toBe('Alex and Blair');
    expect(namesList(['Alex', 'Blair', 'Casey'])).toBe('Alex, Blair, and Casey');
  });

  it('calls an event with no title "this event"', () => {
    expect(eventName({ summary: '  ' })).toBe('this event');
  });
});

describe('deleteQuestion', () => {
  it('asks by name, without quotes (spec 11.7)', () => {
    expect(deleteQuestion(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00', 'Dentist'), [])).toEqual({
      heading: 'Delete Dentist?', body: '', shared: false,
    });
  });

  it("says whose calendars a shared event is on", () => {
    expect(deleteQuestion(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00'), ['Blair', 'Casey'])).toEqual({
      heading: 'Delete Team standup?', body: "It's on Blair's and Casey's calendars.", shared: true,
    });
  });
});

describe('deleteFailedText', () => {
  const standup = event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00');

  it('says what happened and what to do next', () => {
    expect(deleteFailedText(standup, [], false)).toBe("Couldn't delete Team standup. Check that Home Assistant is reachable, then try again.");
  });

  it('names the calendars a delete for everyone missed', () => {
    expect(deleteFailedText(standup, ['Casey'], true)).toBe("Couldn't delete Team standup from Casey's calendar. Try again in a moment.");
    expect(deleteFailedText(standup, ['Blair', 'Casey'], true)).toBe("Couldn't delete Team standup from Blair's and Casey's calendars. Try again in a moment.");
  });
});

describe('calendarCan', () => {
  it("reads what a calendar lets PlanaVista change from its supported features", () => {
    expect(calendarCan(7)).toEqual({ delete: true, edit: true });
    expect(calendarCan(3)).toEqual({ delete: true, edit: true });
    expect(calendarCan(0)).toEqual({ delete: false, edit: false });
    expect(calendarCan(undefined)).toEqual({ delete: true, edit: true });
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/event-words.test.ts` Expected: FAIL: `../src/modules/calendar/event-words` can't be found.

- [ ] **Step 3: The event sheet's words.**

`custom_components/planavista/frontend/src/modules/calendar/event-words.ts` (new):

```ts
import type { CalendarEvent } from '../../types';
import type { StatusBadge } from '../../core/status-map';
import { formatTime, getDateKey, parseEventDate } from '../../utils/date-utils';
import { isAllDayEvent } from './utils/event-utils';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SOON_MINUTES = 15;

/** "Monday, October 12", with the year when it isn't this year. */
export function longDate(date: Date, now: Date): string {
  const words = `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
  return date.getFullYear() === now.getFullYear() ? words : `${words}, ${date.getFullYear()}`;
}

/** "Tue, Oct 13". */
function shortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()].slice(0, 3)}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

/** The last day an all-day event covers (its end date is exclusive). */
function lastAllDay(event: CalendarEvent): Date {
  const start = parseEventDate(event.start);
  const end = parseEventDate(event.end);
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  return last < start ? start : last;
}

/** A timed event that ends on a later day than it starts (an end at midnight belongs to the start day). */
function endsAnotherDay(start: Date, end: Date): boolean {
  const lastMoment = new Date(Math.max(end.getTime() - 1, start.getTime()));
  return getDateKey(lastMoment) !== getDateKey(start);
}

/**
 * When an event happens, as the event sheet says it (spec 11.7):
 * "Monday, October 12" over "9:00 AM – 9:30 AM", "All day", or
 * "All day, through Wednesday, October 14".
 */
export function eventWhen(event: CalendarEvent, timeFormat: '12h' | '24h', now: Date): { date: string; time: string } {
  const start = parseEventDate(event.start);
  const date = longDate(start, now);
  if (isAllDayEvent(event)) {
    const last = lastAllDay(event);
    return { date, time: getDateKey(last) === getDateKey(start) ? 'All day' : `All day, through ${longDate(last, now)}` };
  }
  const end = parseEventDate(event.end);
  const from = formatTime(event.start, timeFormat);
  const to = formatTime(event.end, timeFormat);
  return { date, time: endsAnotherDay(start, end) ? `${from} – ${shortDate(end)}, ${to}` : `${from} – ${to}` };
}

/**
 * The status map's calendar rows (DESIGN_SYSTEM 6): Now while it runs, In
 * N min in amber for the last 15 minutes before it starts (time pressure),
 * and Day N of M through a multi-day all-day event.
 */
export function eventStatus(event: CalendarEvent, now: Date): StatusBadge | null {
  const start = parseEventDate(event.start);
  if (isAllDayEvent(event)) {
    const last = lastAllDay(event);
    const days = Math.round((last.getTime() - start.getTime()) / 86_400_000) + 1;
    if (days < 2) return null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = Math.round((today.getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86_400_000) + 1;
    return day >= 1 && day <= days ? { words: `Day ${day} of ${days}`, tone: 'neutral' } : null;
  }
  const end = parseEventDate(event.end);
  if (now >= start && now < end) return { words: 'Now', tone: 'neutral' };
  const minutes = (start.getTime() - now.getTime()) / 60_000;
  if (minutes > 0 && minutes <= SOON_MINUTES) return { words: `In ${Math.ceil(minutes)} min`, tone: 'time' };
  return null;
}

/** "Alex", "Alex and Blair", "Alex, Blair, and Casey". */
export function namesList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** The event's name in a sentence ("Delete Dentist?"), or "this event" when it has none. */
export function eventName(event: Pick<CalendarEvent, 'summary'>): string {
  return event.summary?.trim() || 'this event';
}

export interface DeleteQuestion {
  heading: string;
  body: string;
  /** A shared event offers Delete for everyone and Remove someone instead of Delete. */
  shared: boolean;
}

/** The confirmation a delete asks, by name (spec 11.7). */
export function deleteQuestion(event: CalendarEvent, sharedNames: string[]): DeleteQuestion {
  const name = eventName(event);
  const heading = `Delete ${name}?`;
  if (sharedNames.length > 1) {
    return { heading, body: `It's on ${namesList(sharedNames.map(n => `${n}'s`))} calendars.`, shared: true };
  }
  return { heading, body: '', shared: false };
}

/** What a failed delete says: what happened and what to do next. */
export function deleteFailedText(event: CalendarEvent, failedNames: string[], everyone: boolean): string {
  const name = eventName(event);
  if (!everyone || failedNames.length === 0) return `Couldn't delete ${name}. Check that Home Assistant is reachable, then try again.`;
  const whose = failedNames.length === 1 ? `${failedNames[0]}'s calendar` : `${namesList(failedNames.map(n => `${n}'s`))} calendars`;
  return `Couldn't delete ${name} from ${whose}. Try again in a moment.`;
}

/** Bits of a calendar's supported_features (Home Assistant CalendarEntityFeature). */
const CREATE = 1;
const DELETE = 2;
const UPDATE = 4;

/** What PlanaVista can change on a calendar, from its entity's supported_features. Unknown means yes (older data). */
export function calendarCan(features: unknown): { delete: boolean; edit: boolean } {
  if (typeof features !== 'number') return { delete: true, edit: true };
  return {
    delete: (features & DELETE) !== 0,
    edit: (features & UPDATE) !== 0 || ((features & CREATE) !== 0 && (features & DELETE) !== 0),
  };
}
```

- [ ] **Step 4: The status styles every module shares** (moved out of `chores-styles.ts`).

`custom_components/planavista/frontend/src/styles/status.ts` (new):

```ts
import { css } from 'lit';

/**
 * What every module's screens share (spec 11.3, 11.4, 11.6): status badges
 * in the status map's color jobs, designed states, banners, and the
 * neutral skeleton (no spinners).
 */
export const statusStyles = css`
  /* Status badges: words always, color confirms (spec 11.3). */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    max-width: 100%;
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background: var(--pv-chip, #F1F1EE);
    color: var(--pv-text-secondary, #5F6670);
  }

  .badge.act {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .badge.time {
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
  }

  .badge.bad {
    background: var(--pv-bad-bg, #FBE4E4);
    color: var(--pv-bad-ink, #A12828);
  }

  .badge.muted {
    background: transparent;
    color: var(--pv-text-muted, #8E949C);
    padding-left: 0;
    padding-right: 0;
  }

  /* Designed states (spec 13.1). */
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 260px;
    padding: 32px 24px;
    text-align: center;
  }

  .state .art {
    font-size: 40px;
    line-height: 1;
  }

  .state h2 {
    margin: 6px 0 0;
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-size: 1.25rem;
    font-weight: 800;
  }

  .state p {
    margin: 0;
    max-width: 420px;
    color: var(--pv-text-secondary, #5F6670);
    line-height: 1.5;
  }

  .state .buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  .banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 12px 0;
    padding: 8px 8px 8px 14px;
    border-radius: 12px;
    background: var(--pv-warn-bg, #FDF1DC);
    color: var(--pv-warn-ink, #8A5A00);
    font-size: 0.9375rem;
  }

  .banner.info {
    background: var(--pv-accent-tint, #EEEEFC);
    color: var(--pv-accent-tint-ink, #3B3BB0);
  }

  .banner .text {
    flex: 1 1 auto;
  }

  .banner button {
    min-height: 40px;
  }

  /* Skeletons stay neutral: a tint of the text color, never a brand fill (spec 11.6). */
  .bone {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    border-radius: 8px;
  }

  .bone.round {
    border-radius: 50%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .bone {
      animation: pv-bone 1.6s ease-in-out infinite;
    }
  }

  @keyframes pv-bone {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`;
```

`custom_components/planavista/frontend/src/modules/chores/chores-styles.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-styles.ts b/custom_components/planavista/frontend/src/modules/chores/chores-styles.ts
index 91c23e7..c5198c8 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-styles.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-styles.ts
@@ -1,11 +1,14 @@
 import { css } from 'lit';
+import { statusStyles } from '../../styles/status';
 
 /**
- * Styles every chores screen shares: badges in the status map's color jobs
- * (spec 11.3, 11.4), section headings, designed states (spec 11.6), and the
- * neutral skeleton (no spinners).
+ * Styles every chores screen shares: the status styles every module uses
+ * (badges, designed states, banners, the skeleton), section headings, and
+ * the rounded face for headings and numbers.
  */
 export const choresStyles = css`
+  ${statusStyles}
+
   :host {
     --pv-chores-gap: 12px;
     font-family: var(--pv-font-family, system-ui, sans-serif);
@@ -23,47 +26,6 @@ export const choresStyles = css`
     font-variant-numeric: tabular-nums;
   }
 
-  /* Status badges: words always, color confirms (spec 11.3). */
-  .badge {
-    display: inline-flex;
-    align-items: center;
-    gap: 4px;
-    flex-shrink: 0;
-    max-width: 100%;
-    padding: 3px 8px;
-    border-radius: 8px;
-    font-size: 0.8125rem;
-    font-weight: 700;
-    line-height: 1.2;
-    white-space: nowrap;
-    overflow: hidden;
-    text-overflow: ellipsis;
-    background: var(--pv-chip, #F1F1EE);
-    color: var(--pv-text-secondary, #5F6670);
-  }
-
-  .badge.act {
-    background: var(--pv-accent-tint, #EEEEFC);
-    color: var(--pv-accent-tint-ink, #3B3BB0);
-  }
-
-  .badge.time {
-    background: var(--pv-warn-bg, #FDF1DC);
-    color: var(--pv-warn-ink, #8A5A00);
-  }
-
-  .badge.bad {
-    background: var(--pv-bad-bg, #FBE4E4);
-    color: var(--pv-bad-ink, #A12828);
-  }
-
-  .badge.muted {
-    background: transparent;
-    color: var(--pv-text-muted, #8E949C);
-    padding-left: 0;
-    padding-right: 0;
-  }
-
   .section-head {
     display: flex;
     align-items: baseline;
@@ -86,91 +48,6 @@ export const choresStyles = css`
     white-space: nowrap;
   }
 
-  /* Designed states (spec 13.1). */
-  .state {
-    display: flex;
-    flex-direction: column;
-    align-items: center;
-    justify-content: center;
-    gap: 8px;
-    min-height: 260px;
-    padding: 32px 24px;
-    text-align: center;
-  }
-
-  .state .art {
-    font-size: 40px;
-    line-height: 1;
-  }
-
-  .state h2 {
-    margin: 6px 0 0;
-    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
-    font-size: 1.25rem;
-    font-weight: 800;
-  }
-
-  .state p {
-    margin: 0;
-    max-width: 420px;
-    color: var(--pv-text-secondary, #5F6670);
-    line-height: 1.5;
-  }
-
-  .state .buttons {
-    display: flex;
-    gap: 10px;
-    flex-wrap: wrap;
-    justify-content: center;
-    margin-top: 10px;
-  }
-
-  .banner {
-    display: flex;
-    align-items: center;
-    gap: 10px;
-    margin: 10px 12px 0;
-    padding: 8px 8px 8px 14px;
-    border-radius: 12px;
-    background: var(--pv-warn-bg, #FDF1DC);
-    color: var(--pv-warn-ink, #8A5A00);
-    font-size: 0.9375rem;
-  }
-
-  .banner.info {
-    background: var(--pv-accent-tint, #EEEEFC);
-    color: var(--pv-accent-tint-ink, #3B3BB0);
-  }
-
-  .banner .text {
-    flex: 1 1 auto;
-  }
-
-  .banner button {
-    min-height: 40px;
-  }
-
-  /* Skeletons stay neutral: a tint of the text color, never a brand fill (spec 11.6). */
-  .bone {
-    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
-    border-radius: 8px;
-  }
-
-  .bone.round {
-    border-radius: 50%;
-  }
-
-  @media (prefers-reduced-motion: no-preference) {
-    .bone {
-      animation: pv-bone 1.6s ease-in-out infinite;
-    }
-  }
-
-  @keyframes pv-bone {
-    0%, 100% { opacity: 1; }
-    50% { opacity: 0.55; }
-  }
-
   .sr {
     position: absolute;
     width: 1px;
```

- [ ] **Step 5: The details sheet.** Replace `event-popup.ts` with:

`custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig, CalendarEvent } from '../../../types';
import type { Layout } from '../../../core/layout';
import { CalendarStore, StoreSubscriber } from '../calendar-store';
import { deleteEvent, refreshPlanaVista, getEventOrganizer } from '../../../utils/ha-utils';
import { buttonStyles } from '../../../styles/shared';
import { sheetStyles } from '../../../styles/sheet';
import { statusStyles } from '../../../styles/status';
import { contrastText } from '../../../core/color';
import { SheetController } from '../../../shell/sheet-controller';
import type { NoticeAction } from '../../../shell/pv-notice-sheet';
import '../../../shell/pv-notice-sheet';
import { calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen } from '../event-words';

interface Participant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
}

function participantsOf(event: CalendarEvent): Participant[] {
  return ((event as { shared_calendars?: Participant[] }).shared_calendars ?? []);
}

/**
 * pv-event-popup: an event's details as a sheet (spec 11.5, 11.8, 12.3): it
 * rises from the bottom in portrait and on phones and pops in as a card in
 * landscape, keeps Tab inside, closes on Escape, a tap outside, a drag, or
 * Done, and asks by name before a delete.
 *
 * @fires pv-sheet-close - once it has left (Done, Escape, outside, a drag, or `leaving`)
 */
export class PVEventPopup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) event: CalendarEvent | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** The calendars shown, for what each one lets PlanaVista change. */
  @property({ attribute: false }) calendars: CalendarConfig[] = [];
  /** Set once nothing wants the sheet (a delete done, an edit saved): it plays its exit. */
  @property({ type: Boolean }) leaving = false;
  /** Now, to the minute, for the Now and In N min badges. */
  @property({ attribute: false }) now: Date = new Date();

  /** The calendar state of the card that opened this. */
  @property({ attribute: false }) store!: CalendarStore;

  @state() private _asking = false;
  @state() private _deleting = false;
  @state() private _error = '';
  @state() private _organizerEntityId: string | null = null;

  /** Re-renders when that store changes (the controller registers itself with this element). */
  private _storeSubscription = new StoreSubscriber(this, () => this.store);
  private _sheet = new SheetController(this);
  private _lastOrganizerUid = '';

  static styles = [
    buttonStyles,
    sheetStyles,
    statusStyles,
    css`
      .heading {
        text-align: left;
        font-weight: 800;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .who {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 6px 0 0;
        color: var(--pv-text-secondary, #5F6670);
        font-weight: 600;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .person {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 700;
      }

      .person .tag {
        font-size: 0.75rem;
        font-weight: 600;
        opacity: 0.85;
      }

      .status {
        margin-top: 10px;
      }

      .rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0 4px;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        line-height: 1.4;
      }

      .row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary, #5F6670);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .row .sub {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .row .notes {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .note {
        margin: 12px 0 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .error {
        margin: 12px 0 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .pair {
        display: flex;
        gap: 10px;
      }

      .pair button {
        flex: 1 1 0;
      }

      .danger {
        color: var(--pv-bad-ink, #A12828);
      }
    `,
  ];

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('leaving') && this.leaving) void this._sheet.close();
    if (changed.has('event') && this.event) {
      const shared = participantsOf(this.event);
      const uid = this.event.uid || '';
      if (shared.length > 1 && uid && uid !== this._lastOrganizerUid) {
        this._lastOrganizerUid = uid;
        this._organizerEntityId = null;
        void this._fetchOrganizer(this.event.calendar_entity_id, uid);
      } else if (shared.length <= 1) {
        this._organizerEntityId = null;
        this._lastOrganizerUid = '';
      }
    }
  }

  private async _fetchOrganizer(entityId: string, uid: string) {
    this._organizerEntityId = await getEventOrganizer(this.hass, entityId, uid);
  }

  render() {
    const event = this.event;
    if (!event) return nothing;
    const shared = participantsOf(event);
    const when = eventWhen(event, this.timeFormat, this.now);
    const status = eventStatus(event, this.now);
    const calendar = this.calendars.find(c => c.entity_id === event.calendar_entity_id);
    const can = calendarCan(calendar?.attributes?.supported_features);
    const changeable = !!event.uid;
    const question = deleteQuestion(event, shared.length > 1 ? shared.map(p => p.calendar_name) : []);

    return html`
      <div class="backdrop" @click=${() => this._sheet.dismiss()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="event-title" @keydown=${this._sheet.onKeydown}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="event-title">${event.summary?.trim() || 'Untitled event'}</h2>
        ${shared.length > 1 ? html`
          <div class="people">
            ${shared.map(p => html`
              <span class="person" style="background: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}">
                ${p.calendar_name}
                ${p.entity_id === this._organizerEntityId ? html`<span class="tag">Organizer</span>` : nothing}
              </span>
            `)}
          </div>
        ` : html`
          <div class="who"><span class="dot" style="background: ${event.calendar_color}"></span>${event.calendar_name}</div>
        `}
        ${status ? html`<div class="status"><span class="badge ${status.tone}">${status.words}</span></div>` : nothing}

        <div class="rows">
          <div class="row">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            <div><div>${when.date}</div><div class="sub">${when.time}</div></div>
          </div>
          ${event.location ? html`
            <div class="row"><ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${event.location}</div></div>
          ` : nothing}
          ${event.description ? html`
            <div class="row"><ha-icon icon="mdi:text"></ha-icon><div class="notes">${event.description}</div></div>
          ` : nothing}
        </div>

        ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
        ${!changeable || (!can.edit && !can.delete) ? html`
          <p class="note">This event can only be changed in its calendar's own app.</p>
        ` : nothing}

        <div class="actions">
          ${changeable && (can.edit || can.delete) ? html`
            <div class="pair">
              ${can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
              ${can.delete ? html`
                <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${this._deleting}
                  @click=${() => { this._asking = true; }}>${this._deleting ? 'Deleting…' : 'Delete'}</button>
              ` : nothing}
            </div>
          ` : nothing}
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this._sheet.close()}>Done</button>
        </div>
      </div>
      ${this._asking ? html`
        <pv-notice-sheet
          .layout=${this.layout}
          .heading=${question.heading}
          .body=${question.body}
          .actions=${this._deleteActions(question.shared)}
          @pv-sheet-action=${this._onDeleteChoice}
        ></pv-notice-sheet>
      ` : nothing}
    `;
  }

  private _deleteActions(shared: boolean): NoticeAction[] {
    return shared
      ? [
          { id: 'everyone', label: 'Delete for everyone', kind: 'destructive' },
          { id: 'remove', label: 'Remove someone', kind: 'secondary' },
          { id: 'cancel', label: 'Cancel', kind: 'secondary' },
        ]
      : [
          { id: 'delete', label: 'Delete', kind: 'destructive' },
          { id: 'cancel', label: 'Cancel', kind: 'secondary' },
        ];
  }

  private _onDeleteChoice = (e: CustomEvent<{ id: string }>): void => {
    this._asking = false;
    const id = e.detail.id;
    if (id === 'delete' || id === 'everyone') void this._delete(id === 'everyone');
    else if (id === 'remove' && this.event) this.store.openEditDialog(this.event, { removeGuests: true });
    else void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.danger')?.focus());
  };

  private _edit() {
    if (this.event) this.store.openEditDialog(this.event);
  }

  private async _delete(everyone: boolean) {
    const event = this.event;
    if (!event?.uid) return;
    this._deleting = true;
    this._error = '';
    const shared = participantsOf(event);
    try {
      if (everyone && shared.length > 1) {
        // Each person's copy goes separately; any that stay are named.
        const failed: string[] = [];
        for (const participant of shared) {
          try {
            await deleteEvent(this.hass, { entity_id: participant.entity_id, uid: event.uid, recurrence_id: event.recurrence_id });
          } catch (err) {
            console.warn(`[PlanaVista] Couldn't delete from ${participant.entity_id}:`, err);
            failed.push(participant.calendar_name);
          }
        }
        await refreshPlanaVista(this.hass).catch(() => undefined);
        if (failed.length) {
          this._error = deleteFailedText(event, failed, true);
          this._deleting = false;
          return;
        }
        this.store.selectEvent(null);
        return;
      }
      await this.store.doDeleteEvent(this.hass, {
        entity_id: event.calendar_entity_id,
        uid: event.uid,
        recurrence_id: event.recurrence_id,
      });
    } catch (err) {
      console.error('PlanaVista: Delete failed', err);
      this._error = deleteFailedText(event, [], false);
      this._deleting = false;
    }
  }
}

defineElement('pv-event-popup', PVEventPopup);
```

- [ ] **Step 6: The module mounts it through a presence, keyed per opening, and returns focus to the event.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 8955ebc..07dec56 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -1,5 +1,6 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
 import { property, state } from 'lit/decorators.js';
+import { keyed } from 'lit/directives/keyed.js';
 import { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
@@ -15,6 +16,8 @@ import { CalendarDerived, deriveCalendarData, eventForPopup } from './calendar-d
 import { withModeColors } from './mode-colors';
 import { contrastText } from '../../core/color';
 import type { ModuleService } from '../../core/module-registry';
+import { GONE, Presence, nextPresence } from '../../core/sheet-presence';
+import { deepActiveElement } from '../../core/focus';
 
 import './components/view-day';
 import './components/view-week';
@@ -63,6 +66,12 @@ export class PvCalendarModule extends LitElement {
   private _progressOf = (memberId: string) => this.services?.chores?.memberProgress?.(memberId) ?? null;
   /** What pv-overlay-change last said, so the card hears each change once. */
   private _overlayOpen = false;
+  /** The event sheet: mounted while the store wants it and while it leaves. */
+  private _details: Presence<CalendarEvent> = GONE;
+  /** Bumped for each new details sheet, so one reopened mid-exit starts fresh. */
+  private _detailsMount = 0;
+  /** What had focus when the details sheet opened; it gets focus back when the sheet has left (spec 11.8). */
+  private _detailsOpener: HTMLElement | null = null;
   private _tickTimer: ReturnType<typeof setTimeout> | null = null;
   /** Where the current one-finger touch began; null when there's no swipe in progress. */
   private _touchStart: { x: number; y: number } | null = null;
@@ -513,7 +522,7 @@ export class PvCalendarModule extends LitElement {
   protected updated(changed: PropertyValues): void {
     super.updated(changed);
     const store = this._pv.store;
-    const open = !!(store.selectedEvent || store.dialogOpen);
+    const open = !!(this._details.value || store.dialogOpen);
     if (open !== this._overlayOpen) {
       this._overlayOpen = open;
       this._fireOverlay(open);
@@ -536,8 +545,29 @@ export class PvCalendarModule extends LitElement {
   protected willUpdate(changed: PropertyValues): void {
     // The shell owns which view shows (the bar); the store follows it.
     if (changed.has('view') && this.view) this._pv.store.setView(this.view);
+    const details = nextPresence(this._details, this._pv.store.selectedEvent);
+    if (details.value && (!this._details.value || this._details.leaving)) {
+      this._detailsMount += 1;
+      this._detailsOpener = deepActiveElement();
+    }
+    this._details = details;
   }
 
+  /** Now, to the minute the views last moved to. */
+  private _now = memoizeOne((tick: number) => new Date(tick * 60000));
+
+  /** The details sheet left: the store lets go too, and focus goes back to the event that opened it. */
+  private _onDetailsClosed = (): void => {
+    this._details = GONE;
+    if (this._pv.store.selectedEvent) this._pv.store.selectEvent(null);
+    this.requestUpdate();
+    const opener = this._detailsOpener;
+    this._detailsOpener = null;
+    requestAnimationFrame(() => {
+      if (opener?.isConnected) opener.focus();
+    });
+  };
+
   /** Cached until the data, the card config, the calendar filter, or the mode changes. */
   private _derive = memoizeOne((
     data: PlanaVistaData | null,
@@ -569,14 +599,19 @@ export class PvCalendarModule extends LitElement {
         ${this._renderView(store.currentView, visibleEvents, calendars, display)}
       </div>
 
-      ${store.selectedEvent ? html`
+      ${this._details.value ? keyed(this._detailsMount, html`
         <pv-event-popup
+          layout=${this.layout}
           .store=${store}
           .hass=${this.hass}
-          .event=${store.selectedEvent}
+          .event=${this._details.value}
+          .leaving=${this._details.leaving}
+          .calendars=${calendars}
+          .now=${this._now(this._tick)}
           .timeFormat=${display?.time_format || '12h'}
+          @pv-sheet-close=${this._onDetailsClosed}
         ></pv-event-popup>
-      ` : nothing}
+      `) : nothing}
 
       ${store.dialogOpen ? html`
         <pv-event-create-dialog
```

- [ ] **Step 7: Events become keyboard buttons, and one tap opens one sheet in Week and Agenda** (they now stop the chip's own `event-click` before sending theirs, as Month does).

`custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
index 8bb9885..406842d 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
@@ -47,6 +47,11 @@ export class PVEventChip extends LitElement {
         transform: scale(0.98);
       }
 
+      .chip:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: 1px;
+      }
+
       .chip-body {
         flex: 1;
         min-width: 0;
@@ -211,7 +216,10 @@ export class PVEventChip extends LitElement {
       <div
         class="${chipClass}"
         style="${bgStyle}; --chip-border-color: ${borderColor}; --chip-text: ${textColor}"
+        role="button"
+        tabindex="0"
         @click=${this._onClick}
+        @keydown=${this._onKey}
       >
         <div class="chip-body">
           <div class="${titleClass}">${event.summary}</div>
@@ -248,6 +256,13 @@ export class PVEventChip extends LitElement {
     `;
   }
 
+  /** Enter or Space opens the event, as a tap does (spec 11.8). */
+  private _onKey(e: KeyboardEvent) {
+    if (e.key !== 'Enter' && e.key !== ' ') return;
+    e.preventDefault();
+    this._onClick();
+  }
+
   private _onClick() {
     this.dispatchEvent(new CustomEvent('event-click', {
       detail: { event: this.event },
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 5ff6423..c0e0e0d 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -111,6 +111,12 @@ export class PVViewDay extends LitElement {
         padding: 0 0.5rem;
       }
 
+      .all-day-chip:focus-visible,
+      .positioned-event:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: 1px;
+      }
+
       .all-day-chip {
         display: inline-flex;
         align-items: center;
@@ -658,7 +664,10 @@ export class PVViewDay extends LitElement {
                 <div
                   class="all-day-chip${isEventPast(e) ? ' past' : ''}"
                   style="background: ${e.calendar_color}; color: ${contrastText(e.calendar_color)}"
+                  role="button"
+                  tabindex="0"
                   @click=${() => this._onEventClick(e)}
+                  @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, e)}
                 >${e.summary}</div>
               `)}
             </div>
@@ -835,7 +844,10 @@ export class PVViewDay extends LitElement {
                 --event-color-light: ${event.calendar_color_light || ''};
                 --event-text: ${contrastText(event.calendar_color_light || event.calendar_color)};
               "
+              role="button"
+              tabindex="0"
               @click=${() => this._onEventClick(event)}
+              @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, event)}
             >
               <div class="event-title">${event.summary}</div>
               <div class="event-time">${formatTime(event.start, this.timeFormat)}</div>
@@ -863,6 +875,13 @@ export class PVViewDay extends LitElement {
     `;
   }
 
+  /** Enter or Space opens an event, as a tap does (spec 11.8). */
+  private _onEventKey(ev: KeyboardEvent, event: CalendarEvent) {
+    if (ev.key !== 'Enter' && ev.key !== ' ') return;
+    ev.preventDefault();
+    this._onEventClick(event);
+  }
+
   private _onEventClick(event: CalendarEvent) {
     this.dispatchEvent(new CustomEvent('event-click', {
       detail: { event },
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
index bdae1f7..6bd5e26 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
@@ -289,7 +289,7 @@ export class PVViewWeek extends LitElement {
                 .timeFormat=${this.timeFormat}
                 .showStripes=${this.showStripes}
                 .tick=${this.tick}
-                @event-click=${(e: CustomEvent) => this._onEventClick(e.detail.event)}
+                @event-click=${(e: CustomEvent) => { e.stopPropagation(); this._onEventClick(e.detail.event); }}
               ></pv-event-chip>
             `)}
           </div>
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
index 2889548..b111b48 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
@@ -302,7 +302,7 @@ export class PVViewAgenda extends LitElement {
                   .timeFormat=${this.timeFormat}
                   .showStripes=${this.showStripes}
                   .tick=${this.tick}
-                  @event-click=${(e: CustomEvent) => this._onEventClick(e.detail.event)}
+                  @event-click=${(e: CustomEvent) => { e.stopPropagation(); this._onEventClick(e.detail.event); }}
                 ></pv-event-chip>
               `)
             : html`<div class="empty-day">No events</div>`
```

- [ ] **Step 8: Run the task's tests.** `npx vitest run test/event-words.test.ts` Expected: PASS, `16 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `754 passed`.

- [ ] **Step 9: Check it on the dev Home Assistant** (`npm run build`, then `bash scripts/dev-ha.sh deploy-frontend` from the repository root, and hard-refresh) at 800 by 1280: tapping an event raises the sheet from the bottom; Escape closes it and focus returns to the chip; Enter on a focused chip opens it; Tab cycles Edit, Delete, Done; Delete asks "Delete Team standup?" with "It's on Blair's and Casey's calendars."; Escape there goes back to the sheet with Delete focused.

- [ ] **Step 10: Commit.** `git add` the files above; message:

```text
feat(calendar): an event's details open as a sheet

Tapping an event raises a sheet like the chores sheets: from the bottom
in portrait and on phones, as a card in landscape. It has the title in
the rounded face, who it's for, a status badge (Now, In 10 min, Day 2 of
3), when and where, Edit and Delete, and Done. Escape, a tap outside,
or a drag closes it, Tab stays inside, and focus goes back to the event
that opened it. A delete asks by name ("Delete Team standup?"), and a
delete for everyone names the calendars it couldn't reach instead of
closing as if it worked. Events can be opened from the keyboard, one tap
opens one sheet in Week and Agenda, and an event on a calendar
PlanaVista can't change says so. The status badges' styles move to a
shared file for every module.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 3: New event and Edit event open as a sheet

Spec 11.5, 11.7 (errors in plain words; one name per thing), 11.8 (48 px targets; every control reachable from the keyboard), and 12.3; the M3 deferred minor about the All day switch's faint track.

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/event-words.ts`, `custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`, `custom_components/planavista/frontend/src/styles/shared.ts`
- Test: `custom_components/planavista/frontend/test/event-words.test.ts`, `custom_components/planavista/frontend/test/event-edit.test.ts`, `custom_components/planavista/frontend/test/event-form.test.ts`, `custom_components/planavista/frontend/test/calendar-store.test.ts`

**Interfaces:**
- Consumes: Task 1's `SheetController` (`escape`, `mayDismiss`), `nextPresence`; Task 2's `eventName`.
- Produces: `FormFields`, `formSignature(fields) -> string`, `saveFailedText(title, editing)` in `event-words.ts`; `pv-event-create-dialog` takes `layout` and `leaving` and fires `pv-sheet-close`; the plain-word messages from `validateFormDates`, `buildDeleteData`, and `runEditWithRestore` (Home Assistant's reason goes to `console.warn`).

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/event-words.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-words.test.ts b/custom_components/planavista/frontend/test/event-words.test.ts
index 8b25633..c98b28c 100644
--- a/custom_components/planavista/frontend/test/event-words.test.ts
+++ b/custom_components/planavista/frontend/test/event-words.test.ts
@@ -1,7 +1,7 @@
 import { describe, expect, it } from 'vitest';
 import type { CalendarEvent } from '../src/types';
 import {
-  calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, longDate, namesList,
+  calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, formSignature, longDate, namesList, saveFailedText,
 } from '../src/modules/calendar/event-words';
 
 const NOW = new Date(2026, 9, 12, 8, 50); // Mon Oct 12, 8:50 AM
@@ -111,3 +111,30 @@ describe('calendarCan', () => {
     expect(calendarCan(undefined)).toEqual({ delete: true, edit: true });
   });
 });
+
+describe('formSignature', () => {
+  const fields = {
+    title: 'Dentist', calendars: ['calendar.test_alex', 'calendar.test_blair'], date: '2026-10-12', allDay: false,
+    startTime: '09:00', endTime: '10:00', spanDays: 1, endDayOffset: 0, description: '', location: '',
+  };
+
+  it('stays the same when nothing changed, whatever order people were picked in', () => {
+    expect(formSignature({ ...fields, calendars: ['calendar.test_blair', 'calendar.test_alex'], title: 'Dentist ' })).toBe(formSignature(fields));
+  });
+
+  it('changes with anything a person would lose', () => {
+    const base = formSignature(fields);
+    expect(formSignature({ ...fields, title: 'Dentist at 4' })).not.toBe(base);
+    expect(formSignature({ ...fields, calendars: ['calendar.test_alex'] })).not.toBe(base);
+    expect(formSignature({ ...fields, startTime: '09:30' })).not.toBe(base);
+    expect(formSignature({ ...fields, allDay: true })).not.toBe(base);
+    expect(formSignature({ ...fields, location: 'Main St' })).not.toBe(base);
+  });
+});
+
+describe('saveFailedText', () => {
+  it('says what happened and what to do next', () => {
+    expect(saveFailedText('Dentist', true)).toBe("Couldn't save Dentist. Check that Home Assistant is reachable, then try again.");
+    expect(saveFailedText('', false)).toBe("Couldn't add this event. Check that Home Assistant is reachable, then try again.");
+  });
+});
```

`custom_components/planavista/frontend/test/event-edit.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-edit.test.ts b/custom_components/planavista/frontend/test/event-edit.test.ts
index 898d375..8d98ea1 100644
--- a/custom_components/planavista/frontend/test/event-edit.test.ts
+++ b/custom_components/planavista/frontend/test/event-edit.test.ts
@@ -56,7 +56,7 @@ describe('buildDeleteData', () => {
   });
 
   it('refuses events without a uid', () => {
-    expect(() => buildDeleteData({ ...weekendTrip, uid: undefined })).toThrow('no unique ID');
+    expect(() => buildDeleteData({ ...weekendTrip, uid: undefined })).toThrow("its calendar's own app");
   });
 });
 
@@ -128,7 +128,8 @@ describe('runEditWithRestore', () => {
     expect(calls).toEqual(['remove', 'create']);
   });
 
-  it('puts the original back when the new event cannot be created', async () => {
+  it('puts the original back when the new event cannot be created, keeping the reason for the log', async () => {
+    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
     const restore = vi.fn(async () => {});
     const run = runEditWithRestore({
       remove: async () => {},
@@ -136,17 +137,22 @@ describe('runEditWithRestore', () => {
       restore,
     });
     await expect(run).rejects.toBeInstanceOf(EditRestoreError);
-    await expect(run).rejects.toThrow("Your changes couldn't be saved (End must be after start). The original event was restored.");
+    await expect(run).rejects.toThrow("Your changes couldn't be saved, so the event is back as it was. Try again in a moment.");
     expect(restore).toHaveBeenCalledTimes(1);
+    expect(warn).toHaveBeenCalledWith(expect.stringContaining('End must be after start'));
+    warn.mockRestore();
   });
 
   it('says so when the original cannot be put back either', async () => {
+    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
     const run = runEditWithRestore({
       remove: async () => {},
       create: async () => { throw new Error('create failed'); },
       restore: async () => { throw new Error('restore failed'); },
     });
-    await expect(run).rejects.toThrow(/couldn't be put back \(restore failed\)/);
+    await expect(run).rejects.toThrow("Your changes couldn't be saved, and the event couldn't be put back. Add it again in its calendar's own app.");
+    expect(warn).toHaveBeenCalledWith(expect.stringContaining('restore failed'));
+    warn.mockRestore();
   });
 
   it('creates nothing when the delete fails', async () => {
```

`custom_components/planavista/frontend/test/event-form.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-form.test.ts b/custom_components/planavista/frontend/test/event-form.test.ts
index a34b5bd..4d50485 100644
--- a/custom_components/planavista/frontend/test/event-form.test.ts
+++ b/custom_components/planavista/frontend/test/event-form.test.ts
@@ -128,7 +128,7 @@ describe('toLocalIsoString', () => {
 describe('validateFormDates', () => {
   it('rejects a same-day end at or before the start', () => {
     const f = formDatesFromEvent('2026-10-09T10:00:00-05:00', '2026-10-09T11:00:00-05:00');
-    expect(validateFormDates({ ...f, endTime: '10:00' })).toBe('End time must be after start time');
+    expect(validateFormDates({ ...f, endTime: '10:00' })).toBe('Make it end after it starts.');
     expect(validateFormDates(f)).toBeNull();
   });
 
```

`custom_components/planavista/frontend/test/calendar-store.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/calendar-store.test.ts b/custom_components/planavista/frontend/test/calendar-store.test.ts
index de7b408..3a0f2c6 100644
--- a/custom_components/planavista/frontend/test/calendar-store.test.ts
+++ b/custom_components/planavista/frontend/test/calendar-store.test.ts
@@ -54,10 +54,11 @@ describe('doEditEvent', () => {
 
   it('restores the original event when the recreate fails', async () => {
     const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
+    vi.spyOn(console, 'warn').mockImplementation(() => {});
     vi.mocked(createEvent)
       .mockRejectedValueOnce(new Error('Invalid end time'))
       .mockResolvedValueOnce(undefined);
-    await expect(state.doEditEvent(hass, del, next, original)).rejects.toThrow('The original event was restored.');
+    await expect(state.doEditEvent(hass, del, next, original)).rejects.toThrow('so the event is back as it was');
     expect(createEvent).toHaveBeenNthCalledWith(2, hass, original);
     expect(state.isLoading).toBe(false);
     expect(errorSpy).toHaveBeenCalledWith('PlanaVista: Failed to edit event', expect.anything());
```

- [ ] **Step 2: Run them.** `npx vitest run test/event-words.test.ts test/event-edit.test.ts test/event-form.test.ts test/calendar-store.test.ts` Expected: FAIL: `formSignature` and `saveFailedText` aren't exported, and the form's messages are the old ones ("End time must be after start time", "(End must be after start)").

- [ ] **Step 3: The form's signature and the save error.**

`custom_components/planavista/frontend/src/modules/calendar/event-words.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
index 32afd2d..0f9f531 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
@@ -122,3 +122,38 @@ export function calendarCan(features: unknown): { delete: boolean; edit: boolean
     edit: (features & UPDATE) !== 0 || ((features & CREATE) !== 0 && (features & DELETE) !== 0),
   };
 }
+
+export interface FormFields {
+  title: string;
+  calendars: Iterable<string>;
+  date: string;
+  allDay: boolean;
+  startTime: string;
+  endTime: string;
+  spanDays: number;
+  endDayOffset: number;
+  description: string;
+  location: string;
+}
+
+/**
+ * What the editor's fields say, to tell whether anything changed before a
+ * tap outside, Escape, or a drag throws it away. The order people were
+ * picked in doesn't matter, and nor do spaces at either end.
+ */
+export function formSignature(f: FormFields): string {
+  return JSON.stringify([
+    f.title.trim(),
+    [...f.calendars].sort(),
+    f.date,
+    f.allDay,
+    f.allDay ? f.spanDays : [f.startTime, f.endTime, f.endDayOffset],
+    f.description.trim(),
+    f.location.trim(),
+  ]);
+}
+
+/** What a failed save says: what happened and what to do next. */
+export function saveFailedText(title: string, editing: boolean): string {
+  return `Couldn't ${editing ? 'save' : 'add'} ${eventName({ summary: title })}. Check that Home Assistant is reachable, then try again.`;
+}
```

- [ ] **Step 4: The form's messages in plain words.**

`custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
index 31b185c..f470174 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
@@ -120,12 +120,12 @@ export function formEndDate(f: EventFormDates): string {
 
 /** Error text for invalid dates, or null when the form can be saved. */
 export function validateFormDates(f: EventFormDates): string | null {
-  if (!isDateOnly(f.date)) return 'Please pick a date';
+  if (!isDateOnly(f.date)) return 'Pick a date.';
   if (f.allDay) return null;
-  if (!TIME_RE.test(f.startTime) || !TIME_RE.test(f.endTime)) return 'Please pick a start and end time';
+  if (!TIME_RE.test(f.startTime) || !TIME_RE.test(f.endTime)) return 'Pick when it starts and ends.';
   const start = localDateTime(f.date, f.startTime);
   const end = localDateTime(shiftDateKey(f.date, f.endDayOffset), f.endTime);
-  return end > start ? null : 'End time must be after start time';
+  return end > start ? null : 'Make it end after it starts.';
 }
 
 /**
@@ -197,7 +197,7 @@ export function buildDeleteData(
   entityId: string = event.calendar_entity_id,
 ): DeleteEventData {
   if (!event.uid) {
-    throw new Error('This event has no unique ID, so it can only be changed in its calendar app.');
+    throw new Error("This event can only be changed in its calendar's own app.");
   }
   const data: DeleteEventData = { entity_id: entityId, uid: event.uid };
   if (event.recurrence_id) data.recurrence_id = event.recurrence_id;
@@ -266,16 +266,18 @@ export async function runEditWithRestore(steps: {
   try {
     await steps.create();
   } catch (createErr) {
+    // Home Assistant's own words go to the log; people get plain ones (spec 11.7).
     const reason = errorText(createErr);
     try {
       await steps.restore();
     } catch (restoreErr) {
+      console.warn(`[PlanaVista] The edit failed (${reason}) and the original couldn't be put back (${errorText(restoreErr)})`);
       throw new EditRestoreError(
-        `Your changes couldn't be saved (${reason}), and the original event couldn't be put back ` +
-        `(${errorText(restoreErr)}). Please re-create it in your calendar app.`,
+        "Your changes couldn't be saved, and the event couldn't be put back. Add it again in its calendar's own app.",
         false,
       );
     }
-    throw new EditRestoreError(`Your changes couldn't be saved (${reason}). The original event was restored.`, true);
+    console.warn(`[PlanaVista] The edit failed (${reason}); the original is back`);
+    throw new EditRestoreError("Your changes couldn't be saved, so the event is back as it was. Try again in a moment.", true);
   }
 }
```

- [ ] **Step 5: The editor sheet.**

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index b471735..299e7c0 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -20,12 +20,32 @@ import {
   withEndTime,
   withStartTime,
 } from '../utils/event-form';
-import { baseStyles, buttonStyles, formStyles, dialogStyles, animationStyles } from '../../../styles/shared';
+import { baseStyles, buttonStyles, formStyles, animationStyles } from '../../../styles/shared';
+import { sheetStyles } from '../../../styles/sheet';
+import type { Layout } from '../../../core/layout';
+import { SheetController } from '../../../shell/sheet-controller';
+import type { NoticeAction } from '../../../shell/pv-notice-sheet';
+import '../../../shell/pv-notice-sheet';
 import { LocationSearch } from '../utils/location-search';
 import { contrastText } from '../../../core/color';
+import { formSignature, saveFailedText } from '../event-words';
 
 const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
 
+const DISCARD_ACTIONS: NoticeAction[] = [
+  { id: 'discard', label: 'Discard', kind: 'destructive' },
+  { id: 'keep', label: 'Keep editing', kind: 'secondary' },
+];
+
+/**
+ * pv-event-create-dialog: New event and Edit event as a sheet (spec 11.5,
+ * 11.8, 12.3): from the bottom in portrait and on phones, a card in
+ * landscape. Escape closes an open picker first, then the sheet. Escape, a
+ * tap outside, or a drag ask before throwing away what was typed; Cancel
+ * is the deliberate way out and doesn't.
+ *
+ * @fires pv-sheet-close - once it has left (Cancel, a dismiss or discard, or `leaving`)
+ */
 export class PVEventCreateDialog extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ type: Array }) calendars: CalendarConfig[] = [];
@@ -35,6 +55,9 @@ export class PVEventCreateDialog extends LitElement {
   @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
   /** Display setting `location_autocomplete`: when false the Location field never touches the network. */
   @property({ attribute: false }) locationAutocomplete = false;
+  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Set once nothing wants the sheet (an event saved): it plays its exit, then fires pv-sheet-close. */
+  @property({ type: Boolean }) leaving = false;
 
   @state() private _title = '';
   @state() private _selectedCalendars: Set<string> = new Set();
@@ -54,6 +77,9 @@ export class PVEventCreateDialog extends LitElement {
   @state() private _saving = false;
   @state() private _error = '';
   @state() private _removeGuestsHint = false;
+  @state() private _askDiscard = false;
+  /** The fields as the sheet opened with them, to tell whether a dismiss would throw anything away. */
+  private _baseline = '';
 
   // Date picker state
   @state() private _datePickerOpen = false;
@@ -76,6 +102,11 @@ export class PVEventCreateDialog extends LitElement {
   @property({ attribute: false }) store!: CalendarStore;
   /** Re-renders when that store changes (the controller registers itself with this element). */
   private _storeSubscription = new StoreSubscriber(this, () => this.store);
+  private _sheet = new SheetController(this, {
+    initialFocus: () => this._titleInput ?? null,
+    escape: () => this._closePickers(),
+    mayDismiss: () => this._mayDismiss(),
+  });
 
   @query('#title-input') private _titleInput?: HTMLInputElement;
   @query('.location-input') private _locationInput?: HTMLInputElement;
@@ -87,10 +118,80 @@ export class PVEventCreateDialog extends LitElement {
     baseStyles,
     buttonStyles,
     formStyles,
-    dialogStyles,
+    sheetStyles,
     animationStyles,
     css`
-      :host { display: block; }
+      .panel {
+        display: flex;
+        flex-direction: column;
+        overflow: hidden;
+        padding-bottom: 0;
+      }
+
+      :host([layout='landscape']) .panel {
+        width: min(560px, calc(100vw - 32px));
+        max-height: 88vh;
+        padding-bottom: 0;
+      }
+
+      .heading {
+        text-align: left;
+        font-weight: 800;
+        margin: 0 0 14px;
+      }
+
+      /* The form scrolls between the heading and the footer. */
+      .fields {
+        flex: 1 1 auto;
+        min-height: 0;
+        overflow-y: auto;
+        padding: 2px 2px 16px;
+      }
+
+      .footer {
+        display: flex;
+        gap: 10px;
+        padding: 12px 0 calc(16px + env(safe-area-inset-bottom, 0px));
+        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
+      }
+
+      .footer .pv-btn {
+        flex: 1 1 0;
+        min-height: 48px;
+      }
+
+      :host([layout='landscape']) .footer {
+        justify-content: flex-end;
+        padding-bottom: 20px;
+      }
+
+      :host([layout='landscape']) .footer .pv-btn {
+        flex: 0 0 auto;
+        min-width: 120px;
+      }
+
+      :host([layout='phone']) .form-row {
+        flex-direction: column;
+        align-items: stretch;
+        gap: 0.5rem;
+      }
+
+      .hint {
+        display: flex;
+        align-items: center;
+        gap: 0.5rem;
+        padding: 0.5rem 0.75rem;
+        margin-bottom: 0.5rem;
+        border-radius: 12px;
+        background: var(--pv-accent-tint, #EEEEFC);
+        color: var(--pv-accent-tint-ink, #3B3BB0);
+        font-size: 0.875rem;
+      }
+
+      .hint ha-icon {
+        --mdc-icon-size: 16px;
+        flex-shrink: 0;
+      }
 
       .form-grid {
         display: flex;
@@ -118,7 +219,8 @@ export class PVEventCreateDialog extends LitElement {
         display: flex;
         align-items: center;
         justify-content: space-between;
-        padding: 0.5rem 0;
+        min-height: 48px;
+        cursor: pointer;
       }
 
       .all-day-label {
@@ -138,16 +240,16 @@ export class PVEventCreateDialog extends LitElement {
         display: inline-flex;
         align-items: center;
         gap: 0.375rem;
-        padding: 0.375rem 0.75rem;
+        padding: 0.375rem 0.875rem;
         border: 2px solid transparent;
         border-radius: 9999px;
         cursor: pointer;
         transition: all var(--pv-transition);
-        font-size: 0.8125rem;
-        font-weight: 500;
+        font-size: 0.875rem;
+        font-weight: 600;
         background: transparent;
         font-family: inherit;
-        min-height: 40px;
+        min-height: 48px;
       }
 
       .cal-option.selected {
@@ -174,11 +276,9 @@ export class PVEventCreateDialog extends LitElement {
         top: -10px;
         left: 50%;
         transform: translateX(-50%);
-        font-size: 0.5rem;
+        font-size: 0.6875rem;
         font-weight: 700;
         color: var(--pv-accent-ink, var(--pv-accent));
-        text-transform: uppercase;
-        letter-spacing: 0.3px;
         line-height: 1;
         white-space: nowrap;
         pointer-events: none;
@@ -202,16 +302,26 @@ export class PVEventCreateDialog extends LitElement {
       }
 
       .show-more-btn {
+        display: inline-flex;
+        align-items: center;
+        gap: 6px;
+        align-self: flex-start;
+        min-height: 48px;
         background: none;
         border: none;
-        color: var(--pv-text-secondary);
-        font-size: 0.8125rem;
+        color: var(--pv-accent-ink, var(--pv-accent));
+        font-size: 0.9375rem;
+        font-weight: 600;
         cursor: pointer;
-        padding: 0.5rem 0;
+        padding: 0;
         font-family: inherit;
         text-align: left;
       }
 
+      .show-more-btn ha-icon {
+        --mdc-icon-size: 18px;
+      }
+
       .show-more-btn:hover {
         color: var(--pv-accent-ink, var(--pv-accent));
       }
@@ -223,11 +333,12 @@ export class PVEventCreateDialog extends LitElement {
       }
 
       .error-msg {
-        color: #EF4444;
-        font-size: 0.8125rem;
-        padding: 0.5rem;
-        background: color-mix(in srgb, #EF4444 8%, transparent);
-        border-radius: var(--pv-radius-sm);
+        padding: 10px 12px;
+        border-radius: 12px;
+        background: var(--pv-bad-bg, #FBE4E4);
+        color: var(--pv-bad-ink, #A12828);
+        font-size: 0.875rem;
+        line-height: 1.4;
       }
 
       /* ============================================
@@ -249,12 +360,19 @@ export class PVEventCreateDialog extends LitElement {
         color: var(--pv-text);
         font-size: 0.9375rem;
         font-family: inherit;
+        text-align: left;
         cursor: pointer;
         min-height: 48px;
         box-sizing: border-box;
         transition: border-color 200ms ease;
       }
 
+      .date-display:focus-visible,
+      .time-display:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: 2px;
+      }
+
       .date-display:hover {
         border-color: var(--pv-text-muted);
       }
@@ -271,8 +389,8 @@ export class PVEventCreateDialog extends LitElement {
         border: 1px solid var(--pv-border);
         border-radius: var(--pv-radius-md, 12px);
         box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
-        padding: 12px;
-        width: 280px;
+        padding: 8px;
+        width: max-content;
         animation: pv-fadeIn 150ms ease;
       }
 
@@ -298,8 +416,8 @@ export class PVEventCreateDialog extends LitElement {
         display: flex;
         align-items: center;
         justify-content: center;
-        width: 30px;
-        height: 30px;
+        width: 48px;
+        height: 48px;
         border: none;
         border-radius: 50%;
         background: transparent;
@@ -329,54 +447,66 @@ export class PVEventCreateDialog extends LitElement {
         font-weight: 600;
         color: var(--pv-text-muted);
         padding: 4px 0;
-        text-transform: uppercase;
       }
 
       .picker-days {
         display: grid;
-        grid-template-columns: repeat(7, 1fr);
-        gap: 2px;
+        grid-template-columns: repeat(7, 48px);
       }
 
+      /* A 48 px target with the day drawn smaller inside (spec 11.8). */
       .picker-day {
-        display: flex;
-        align-items: center;
-        justify-content: center;
-        width: 36px;
-        height: 36px;
+        display: grid;
+        place-items: center;
+        width: 48px;
+        height: 48px;
+        padding: 0;
         border: none;
-        border-radius: 50%;
         background: transparent;
         color: var(--pv-text);
-        font-size: 0.8125rem;
-        font-family: inherit;
+        font-family: var(--pv-font-heading, inherit);
+        font-size: 0.875rem;
+        font-variant-numeric: tabular-nums;
         cursor: pointer;
-        transition: all 150ms;
-        margin: 0 auto;
       }
 
-      .picker-day:hover {
+      .picker-day span {
+        display: grid;
+        place-items: center;
+        box-sizing: border-box;
+        width: 36px;
+        height: 36px;
+        border-radius: 50%;
+        transition: background 150ms;
+      }
+
+      .picker-day:hover span {
         background: var(--pv-event-hover, rgba(0,0,0,0.05));
       }
 
+      .picker-day:focus-visible {
+        outline: none;
+      }
+
+      .picker-day:focus-visible span {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: 1px;
+      }
+
       .picker-day.other-month {
         color: var(--pv-text-muted);
         opacity: 0.4;
       }
 
-      .picker-day.today {
+      .picker-day.today span {
         border: 2px solid var(--pv-accent);
-        font-weight: 600;
+        font-weight: 700;
       }
 
-      .picker-day.selected {
+      .picker-day.selected span {
         background: var(--pv-accent);
         color: var(--pv-accent-text, #fff);
-        font-weight: 600;
-      }
-
-      .picker-day.selected:hover {
-        filter: brightness(1.1);
+        font-weight: 700;
       }
 
       /* ============================================
@@ -432,10 +562,18 @@ export class PVEventCreateDialog extends LitElement {
       }
 
       .time-slot {
-        padding: 10px 16px;
-        cursor: pointer;
+        display: block;
+        width: 100%;
+        min-height: 48px;
+        padding: 0 16px;
+        border: none;
+        background: transparent;
+        text-align: left;
+        font-family: inherit;
         font-size: 0.9375rem;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
+        cursor: pointer;
         transition: background 120ms ease;
       }
 
@@ -471,13 +609,19 @@ export class PVEventCreateDialog extends LitElement {
         display: flex;
         align-items: flex-start;
         gap: 8px;
-        padding: 10px 12px;
+        width: 100%;
+        min-height: 48px;
+        padding: 12px;
+        border: none;
+        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
+        background: transparent;
+        text-align: left;
         cursor: pointer;
-        font-size: 0.8125rem;
+        font-family: inherit;
+        font-size: 0.875rem;
         color: var(--pv-text);
         line-height: 1.35;
         transition: background 120ms ease;
-        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
       }
 
       .location-suggestion:last-child {
@@ -509,43 +653,6 @@ export class PVEventCreateDialog extends LitElement {
         color: var(--pv-text-muted);
         opacity: 0.6;
       }
-
-      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */
-
-      /* xs: phones, bottom-sheet dialog */
-      @media (max-width: 479px) {
-        .pv-overlay {
-          align-items: flex-end;
-        }
-
-        .pv-dialog {
-          max-width: 100%;
-          width: 100%;
-          max-height: 90vh;
-          border-radius: 16px 16px 0 0;
-          animation: pv-slideUp 250ms ease;
-        }
-
-        .pv-dialog-header { padding: 1rem; }
-        .pv-dialog-body { padding: 1rem; }
-        .pv-dialog-footer { padding: 0.75rem 1rem; }
-
-        .form-row { flex-direction: column; gap: 0.5rem; align-items: stretch; }
-
-        .cal-option { padding: 0.25rem 0.5rem; font-size: 0.75rem; min-height: 36px; }
-      }
-
-      /* sm: large phones, slightly wider dialog */
-      @media (min-width: 480px) and (max-width: 767px) {
-        .pv-dialog { max-width: calc(100% - 1rem); }
-        .pv-dialog-header { padding: 1rem 1.25rem; }
-        .pv-dialog-body { padding: 1.25rem; }
-      }
-
-      @keyframes pv-slideUp {
-        from { transform: translateY(100%); }
-        to { transform: translateY(0); }
-      }
     `,
   ];
 
@@ -556,15 +663,14 @@ export class PVEventCreateDialog extends LitElement {
 
   updated(changedProps: PropertyValues) {
     super.updated(changedProps);
+    if (changedProps.has('leaving') && this.leaving) void this._sheet.close();
     if (changedProps.has('locationAutocomplete') && !this.locationAutocomplete) {
       this._resetLocationSearch();
     }
     if (changedProps.has('open') && this.open) {
       this._initForm();
       this._datePickerOpen = false;
-      requestAnimationFrame(() => {
-        this._titleInput?.focus();
-      });
+      this._baseline = this._signature();
     }
   }
 
@@ -672,7 +778,7 @@ export class PVEventCreateDialog extends LitElement {
   }
 
   private _formatDateDisplay(): string {
-    if (!this._date) return 'Select a date';
+    if (!this._date) return 'Pick a date';
     const [y, m, d] = this._date.split('-').map(Number);
     const date = new Date(y, m - 1, d);
     return date.toLocaleDateString('en-US', {
@@ -688,159 +794,203 @@ export class PVEventCreateDialog extends LitElement {
 
     const visibleCalendars = this.calendars.filter(c => c.visible !== false);
     const isEdit = this.mode === 'edit';
-    const heading = isEdit ? 'Edit Event' : 'New Event';
+    const heading = isEdit ? 'Edit event' : 'New event';
 
     return html`
-      <div class="pv-overlay" @click=${this._onOverlayClick}>
-        <div class="pv-dialog" @click=${(e: Event) => e.stopPropagation()}>
-          <div class="pv-dialog-header">
-            <span class="pv-heading-2">${heading}</span>
-            <button class="pv-btn-icon" @click=${this._close}>
-              <ha-icon icon="mdi:close"></ha-icon>
-            </button>
-          </div>
-
-          <div class="pv-dialog-body">
-            <div class="form-grid">
-              ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}
-
-              <div class="form-field">
-                <input
-                  id="title-input"
-                  class="pv-input"
-                  type="text"
-                  placeholder="Event title"
-                  .value=${this._title}
-                  @input=${(e: Event) => this._title = (e.target as HTMLInputElement).value}
-                />
-              </div>
+      <div class="backdrop" @click=${() => this._sheet.dismiss()}></div>
+      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="editor-title" @keydown=${this._sheet.onKeydown}>
+        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
+        <h2 class="heading" id="editor-title">${heading}</h2>
+
+        <div class="fields">
+          <div class="form-grid">
+            ${this._error ? html`<div class="error-msg" role="alert">${this._error}</div>` : nothing}
+
+            <div class="form-field">
+              <input
+                id="title-input"
+                class="pv-input"
+                type="text"
+                placeholder="Title"
+                aria-label="Title"
+                .value=${this._title}
+                @input=${(e: Event) => this._title = (e.target as HTMLInputElement).value}
+              />
+            </div>
 
-              <div class="form-field">
-                <label class="pv-label">${isEdit ? 'Participants' : 'Calendars'}</label>
-                ${this._removeGuestsHint ? html`
-                  <div style="
-                    display: flex; align-items: center; gap: 0.5rem;
-                    padding: 0.5rem 0.75rem; margin-bottom: 0.5rem;
-                    background: color-mix(in srgb, var(--pv-accent, #6366F1) 8%, transparent);
-                    border: 1px solid color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
-                    border-radius: var(--pv-radius-sm, 8px);
-                    font-size: 0.8125rem; color: var(--pv-text-secondary);
-                  ">
-                    <ha-icon icon="mdi:information-outline" style="--mdc-icon-size: 16px; color: var(--pv-accent-ink, var(--pv-accent, #6366F1)); flex-shrink: 0;"></ha-icon>
-                    Tap a guest to remove them from this event
-                  </div>
-                ` : nothing}
-                <div class="calendar-select">
-                  ${visibleCalendars.map(cal => {
-                    const selected = this._selectedCalendars.has(cal.entity_id);
-                    const isOrganizer = cal.entity_id === this._organizerEntityId;
-                    const isLockedOrganizer = isEdit && isOrganizer;
-                    return html`
-                      <div class="cal-option-wrap">
-                        ${isOrganizer && selected
-                          ? html`<span class="organizer-badge">Organizer</span>`
-                          : nothing}
-                        <button
-                          class="cal-option ${selected ? 'selected' : ''} ${isLockedOrganizer ? 'locked' : ''}"
-                          style="${selected
-                            ? `background: ${cal.color}; --cal-bg: ${cal.color}; color: ${contrastText(cal.color)}`
-                            : `--cal-bg: ${cal.color}`}"
-                          @click=${() => this._toggleCalendar(cal.entity_id)}
-                        >
-                          <span class="cal-dot" style="background: ${cal.color}"></span>
-                          ${cal.display_name}
-                          ${isLockedOrganizer
-                            ? html`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`
-                            : nothing}
-                        </button>
-                      </div>
-                    `;
-                  })}
+            <div class="form-field">
+              <span class="pv-label" id="who-label">Who</span>
+              ${this._removeGuestsHint ? html`
+                <div class="hint">
+                  <ha-icon icon="mdi:information-outline"></ha-icon>
+                  Tap someone to take them off this event.
                 </div>
+              ` : nothing}
+              <div class="calendar-select" role="group" aria-labelledby="who-label">
+                ${visibleCalendars.map(cal => {
+                  const selected = this._selectedCalendars.has(cal.entity_id);
+                  const isOrganizer = cal.entity_id === this._organizerEntityId;
+                  const isLockedOrganizer = isEdit && isOrganizer;
+                  return html`
+                    <div class="cal-option-wrap">
+                      ${isOrganizer && selected
+                        ? html`<span class="organizer-badge">Organizer</span>`
+                        : nothing}
+                      <button
+                        type="button"
+                        class="cal-option ${selected ? 'selected' : ''} ${isLockedOrganizer ? 'locked' : ''}"
+                        aria-pressed=${selected ? 'true' : 'false'}
+                        style="${selected
+                          ? `background: ${cal.color}; --cal-bg: ${cal.color}; color: ${contrastText(cal.color)}`
+                          : `--cal-bg: ${cal.color}`}"
+                        @click=${() => this._toggleCalendar(cal.entity_id)}
+                      >
+                        <span class="cal-dot" style="background: ${cal.color}"></span>
+                        ${cal.display_name}
+                        ${isLockedOrganizer
+                          ? html`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`
+                          : nothing}
+                      </button>
+                    </div>
+                  `;
+                })}
               </div>
+            </div>
 
-              <div class="form-field">
-                <label class="pv-label">Date</label>
-                ${this._renderDatePicker()}
-                ${this._renderEndsHint()}
-              </div>
-
-              <div class="all-day-row">
-                <span class="all-day-label">All Day</span>
-                <div
-                  class="pv-toggle ${this._allDay ? 'active' : ''}"
-                  role="switch"
-                  tabindex="0"
-                  aria-checked="${this._allDay}"
-                  @click=${() => this._allDay = !this._allDay}
-                  @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._allDay = !this._allDay; }}}
-                ></div>
-              </div>
+            <div class="form-field">
+              <label class="pv-label" for="date-button">Date</label>
+              ${this._renderDatePicker()}
+              ${this._renderEndsHint()}
+            </div>
 
-              ${!this._allDay ? html`
-                <div class="form-row">
-                  <div class="form-field">
-                    <label class="pv-label">Start Time</label>
-                    <div class="time-display start-time-display" @click=${() => this._openTimePicker('start')}>
-                      <ha-icon icon="mdi:clock-outline"></ha-icon>
-                      ${this._formatTimeForDisplay(this._startTime)}
-                    </div>
-                  </div>
-                  <div class="form-field">
-                    <label class="pv-label">End Time</label>
-                    <div class="time-display end-time-display" @click=${() => this._openTimePicker('end')}>
-                      <ha-icon icon="mdi:clock-outline"></ha-icon>
-                      ${this._formatTimeForDisplay(this._endTime)}
-                    </div>
-                  </div>
-                </div>
-              ` : nothing}
+            <div class="all-day-row" @click=${this._toggleAllDay}>
+              <span class="all-day-label" id="all-day-label">All day</span>
+              <div
+                class="pv-toggle ${this._allDay ? 'active' : ''}"
+                role="switch"
+                tabindex="0"
+                aria-checked="${this._allDay}"
+                aria-labelledby="all-day-label"
+                @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleAllDay(); }}}
+              ></div>
+            </div>
 
-              ${!this._showMore ? html`
-                <button class="show-more-btn" @click=${() => this._showMore = true}>
-                  + Add description, location
-                </button>
-              ` : html`
+            ${!this._allDay ? html`
+              <div class="form-row">
                 <div class="form-field">
-                  <label class="pv-label">Description</label>
-                  <textarea
-                    class="pv-input"
-                    rows="3"
-                    placeholder="Add a description..."
-                    .value=${this._description}
-                    @input=${(e: Event) => this._description = (e.target as HTMLTextAreaElement).value}
-                    style="resize: vertical; min-height: 80px;"
-                  ></textarea>
+                  <label class="pv-label" for="starts-button">Starts</label>
+                  <button type="button" id="starts-button" class="time-display start-time-display"
+                    aria-expanded=${this._activeTimePicker === 'start' ? 'true' : 'false'}
+                    @click=${() => this._openTimePicker('start')}>
+                    <ha-icon icon="mdi:clock-outline"></ha-icon>
+                    ${this._formatTimeForDisplay(this._startTime)}
+                  </button>
                 </div>
                 <div class="form-field">
-                  <label class="pv-label">Location</label>
-                  ${this._renderLocationField()}
+                  <label class="pv-label" for="ends-button">Ends</label>
+                  <button type="button" id="ends-button" class="time-display end-time-display"
+                    aria-expanded=${this._activeTimePicker === 'end' ? 'true' : 'false'}
+                    @click=${() => this._openTimePicker('end')}>
+                    <ha-icon icon="mdi:clock-outline"></ha-icon>
+                    ${this._formatTimeForDisplay(this._endTime)}
+                  </button>
                 </div>
-              `}
-            </div>
+              </div>
+            ` : nothing}
+
+            ${!this._showMore ? html`
+              <button class="show-more-btn" type="button" @click=${() => this._showMore = true}>
+                <ha-icon icon="mdi:plus"></ha-icon>
+                Add a description or location
+              </button>
+            ` : html`
+              <div class="form-field">
+                <label class="pv-label" for="description-input">Description</label>
+                <textarea
+                  id="description-input"
+                  class="pv-input"
+                  rows="3"
+                  placeholder="Add a description"
+                  .value=${this._description}
+                  @input=${(e: Event) => this._description = (e.target as HTMLTextAreaElement).value}
+                  style="resize: vertical; min-height: 80px;"
+                ></textarea>
+              </div>
+              <div class="form-field">
+                <label class="pv-label" for="location-input">Location</label>
+                ${this._renderLocationField()}
+              </div>
+            `}
           </div>
+        </div>
 
-          <div class="pv-dialog-footer">
-            <button class="pv-btn pv-btn-secondary" @click=${this._close}>
-              Cancel
-            </button>
-            <button
-              class="pv-btn pv-btn-primary"
-              ?disabled=${this._saving}
-              @click=${this._save}
-            >
-              ${this._saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Event')}
-            </button>
-          </div>
+        <div class="footer">
+          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
+          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving} @click=${this._save}>
+            ${this._saving ? 'Saving…' : (isEdit ? 'Save' : 'Add')}
+          </button>
         </div>
       </div>
 
       ${this._renderLocationDropdown()}
       ${this._renderDatePickerDropdown()}
       ${this._renderTimePickerDropdown()}
+      ${this._askDiscard ? html`
+        <pv-notice-sheet
+          .layout=${this.layout}
+          .heading=${isEdit ? 'Discard your changes?' : 'Discard this event?'}
+          .actions=${DISCARD_ACTIONS}
+          @pv-sheet-action=${this._onDiscardChoice}
+        ></pv-notice-sheet>
+      ` : nothing}
     `;
   }
 
+  /** The editor's fields, to tell whether anything changed since it opened. */
+  private _signature(): string {
+    return formSignature({
+      title: this._title,
+      calendars: this._selectedCalendars,
+      date: this._date,
+      allDay: this._allDay,
+      startTime: this._startTime,
+      endTime: this._endTime,
+      spanDays: this._spanDays,
+      endDayOffset: this._endDayOffset,
+      description: this._description,
+      location: this._location,
+    });
+  }
+
+  /** Escape closes an open picker before the sheet; true when there was one. */
+  private _closePickers(): boolean {
+    const open = this._datePickerOpen || this._activeTimePicker !== null || this._locationSuggestions.length > 0;
+    if (!open) return false;
+    this._datePickerOpen = false;
+    this._activeTimePicker = null;
+    this._resetLocationSearch();
+    return true;
+  }
+
+  /** A dismiss throws nothing away without asking (spec 11.7). */
+  private _mayDismiss(): boolean {
+    if (this._saving) return false;
+    if (this._signature() === this._baseline) return true;
+    this._closePickers();
+    this._askDiscard = true;
+    return false;
+  }
+
+  private _onDiscardChoice = (e: CustomEvent<{ id: string }>): void => {
+    this._askDiscard = false;
+    if (e.detail.id === 'discard') void this._sheet.close();
+    else void this.updateComplete.then(() => this._titleInput?.focus());
+  };
+
+  private _toggleAllDay = (): void => {
+    this._allDay = !this._allDay;
+  };
+
   // ==================================================================
   // CUSTOM DATE PICKER
   // ==================================================================
@@ -848,10 +998,11 @@ export class PVEventCreateDialog extends LitElement {
   private _renderDatePicker() {
     return html`
       <div class="date-picker-wrap">
-        <div class="date-display" @click=${this._toggleDatePicker}>
+        <button type="button" id="date-button" class="date-display"
+          aria-expanded=${this._datePickerOpen ? 'true' : 'false'} @click=${this._toggleDatePicker}>
           <ha-icon icon="mdi:calendar"></ha-icon>
           ${this._formatDateDisplay()}
-        </div>
+        </button>
       </div>
     `;
   }
@@ -863,11 +1014,12 @@ export class PVEventCreateDialog extends LitElement {
     if (!el) return nothing;
     const rect = el.getBoundingClientRect();
 
-    // Position below the trigger, but if it would go off-screen, position above
-    const dropdownHeight = 330; // approximate
+    // Below the field, or above it when it won't fit; never off the screen.
+    const dropdownHeight = 384; // the header, the weekdays, and six 48 px weeks
     const spaceBelow = window.innerHeight - rect.bottom - 8;
     const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
-    const top = placeAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
+    const wanted = placeAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
+    const top = Math.max(8, Math.min(wanted, window.innerHeight - dropdownHeight - 8));
 
     return html`
       <div
@@ -879,10 +1031,10 @@ export class PVEventCreateDialog extends LitElement {
             ${new Date(this._pickerYear, this._pickerMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <div class="picker-nav">
-            <button class="picker-nav-btn" @click=${this._pickerPrevMonth}>
+            <button class="picker-nav-btn" type="button" aria-label="Previous month" @click=${this._pickerPrevMonth}>
               <ha-icon icon="mdi:chevron-left"></ha-icon>
             </button>
-            <button class="picker-nav-btn" @click=${this._pickerNextMonth}>
+            <button class="picker-nav-btn" type="button" aria-label="Next month" @click=${this._pickerNextMonth}>
               <ha-icon icon="mdi:chevron-right"></ha-icon>
             </button>
           </div>
@@ -897,9 +1049,11 @@ export class PVEventCreateDialog extends LitElement {
             const isSelected = this._toDateStr(day) === this._date;
             return html`
               <button
+                type="button"
                 class="picker-day ${isOther ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
+                aria-pressed=${isSelected ? 'true' : 'false'}
                 @click=${() => this._selectPickerDay(day)}
-              >${day.getDate()}</button>
+              ><span>${day.getDate()}</span></button>
             `;
           })}
         </div>
@@ -958,7 +1112,7 @@ export class PVEventCreateDialog extends LitElement {
   // ==================================================================
 
   private _formatTimeForDisplay(time24: string): string {
-    if (!time24) return 'Select time';
+    if (!time24) return 'Pick a time';
     const [h, m] = time24.split(':').map(Number);
     if (this.timeFormat === '24h') {
       return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
@@ -1028,10 +1182,12 @@ export class PVEventCreateDialog extends LitElement {
         style="top: ${top}px; left: ${rect.left}px; width: ${rect.width}px;"
       >
         ${slots.map(slot => html`
-          <div
+          <button
+            type="button"
             class="time-slot ${slot === currentTime ? 'selected' : ''}"
+            aria-pressed=${slot === currentTime ? 'true' : 'false'}
             @click=${() => this._selectTime(slot)}
-          >${this._formatTimeForDisplay(slot)}</div>
+          >${this._formatTimeForDisplay(slot)}</button>
         `)}
       </div>
     `;
@@ -1052,9 +1208,10 @@ export class PVEventCreateDialog extends LitElement {
     return html`
       <div class="location-wrap">
         <input
+          id="location-input"
           class="pv-input location-input"
           type="text"
-          placeholder=${this.locationAutocomplete ? 'Search for a place or address...' : 'Add a location'}
+          placeholder=${this.locationAutocomplete ? 'Search for a place or address' : 'Add a location'}
           .value=${this._location}
           @input=${this._onLocationInput}
           @focus=${() => this._locationFocused = true}
@@ -1081,13 +1238,15 @@ export class PVEventCreateDialog extends LitElement {
         style="top: ${rect.bottom}px; left: ${rect.left}px; width: ${rect.width}px;"
       >
         ${this._locationLoading ? html`
-          <div class="location-loading">Searching...</div>
+          <div class="location-loading">Searching…</div>
         ` : nothing}
         ${this._locationSuggestions.map(s => html`
-          <div class="location-suggestion" @mousedown=${() => this._selectLocation(s)}>
+          <button type="button" class="location-suggestion"
+            @mousedown=${(e: Event) => e.preventDefault()}
+            @click=${() => this._selectLocation(s)}>
             <ha-icon icon="mdi:map-marker"></ha-icon>
             <span>${s}</span>
-          </div>
+          </button>
         `)}
         ${this._locationSuggestions.length > 0 ? html`
           <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
@@ -1143,16 +1302,13 @@ export class PVEventCreateDialog extends LitElement {
     this._removeGuestsHint = false;
   }
 
-  private _onOverlayClick() {
-    this._close();
-  }
-
-  private _close() {
+  /** Cancel: the deliberate way out, so it doesn't ask first. */
+  private _cancel = (): void => {
     this._datePickerOpen = false;
     this._activeTimePicker = null;
     this._resetLocationSearch();
-    this.store.closeDialog();
-  }
+    void this._sheet.close();
+  };
 
   private async _editFallback(
     baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string },
@@ -1204,11 +1360,11 @@ export class PVEventCreateDialog extends LitElement {
 
   private async _save() {
     if (!this._title.trim()) {
-      this._error = 'Please enter an event title';
+      this._error = 'Give the event a title.';
       return;
     }
     if (this._selectedCalendars.size === 0) {
-      this._error = 'Please select at least one calendar';
+      this._error = "Pick who it's for.";
       return;
     }
 
@@ -1356,9 +1512,9 @@ export class PVEventCreateDialog extends LitElement {
         }
       }
     } catch (err: any) {
-      this._error = err instanceof EditRestoreError
-        ? err.message
-        : `Failed to save event: ${err?.message || 'Unknown error'}`;
+      // Home Assistant's own words go to the log; people get plain ones (spec 11.7).
+      console.error('PlanaVista: Saving the event failed', err);
+      this._error = err instanceof EditRestoreError ? err.message : saveFailedText(this._title, this.mode === 'edit');
       this._saving = false;
     }
   }
```

- [ ] **Step 6: The module mounts the editor like the details sheet; Remove someone gives Delete focus first; the All day switch reads when it's off.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 07dec56..f8a8e41 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -28,6 +28,12 @@ import './components/event-create-dialog';
 
 const DEFAULT_ENTITY = 'sensor.planavista_config';
 
+/** What the editor sheet shows: New event, or Edit event with what it starts from. */
+interface EditorWant {
+  mode: 'create' | 'edit';
+  prefill: Partial<CalendarEvent> | null;
+}
+
 /**
  * pv-calendar-module: the calendar's toolbar, its four views, and the event
  * popup and dialog. The shell renders it inside the card and hands it the
@@ -72,6 +78,12 @@ export class PvCalendarModule extends LitElement {
   private _detailsMount = 0;
   /** What had focus when the details sheet opened; it gets focus back when the sheet has left (spec 11.8). */
   private _detailsOpener: HTMLElement | null = null;
+  /** The editor sheet (New event, Edit event), mounted the same way. */
+  private _editor: Presence<EditorWant> = GONE;
+  private _editorMount = 0;
+  private _editorOpener: HTMLElement | null = null;
+  /** The store's editor choice as one object, so the presence sees the same value while it stands. */
+  private _editorWant: EditorWant | null = null;
   private _tickTimer: ReturnType<typeof setTimeout> | null = null;
   /** Where the current one-finger touch began; null when there's no swipe in progress. */
   private _touchStart: { x: number; y: number } | null = null;
@@ -522,7 +534,7 @@ export class PvCalendarModule extends LitElement {
   protected updated(changed: PropertyValues): void {
     super.updated(changed);
     const store = this._pv.store;
-    const open = !!(this._details.value || store.dialogOpen);
+    const open = !!(this._details.value || this._editor.value);
     if (open !== this._overlayOpen) {
       this._overlayOpen = open;
       this._fireOverlay(open);
@@ -551,8 +563,37 @@ export class PvCalendarModule extends LitElement {
       this._detailsOpener = deepActiveElement();
     }
     this._details = details;
+    const editor = nextPresence(this._editor, this._wantedEditor());
+    if (editor.value && (!this._editor.value || this._editor.leaving)) {
+      this._editorMount += 1;
+      this._editorOpener = deepActiveElement();
+    }
+    this._editor = editor;
   }
 
+  /** The store's editor choice, the same object while it stands. */
+  private _wantedEditor(): EditorWant | null {
+    const store = this._pv.store;
+    if (!store.dialogOpen) return (this._editorWant = null);
+    const want = this._editorWant;
+    if (want && want.mode === store.dialogOpen && want.prefill === store.createPrefill) return want;
+    return (this._editorWant = { mode: store.dialogOpen, prefill: store.createPrefill });
+  }
+
+  /** The editor left: the store lets go, and focus goes back to what opened it (Edit, or New event). */
+  private _onEditorClosed = (): void => {
+    this._editor = GONE;
+    if (this._pv.store.dialogOpen) this._pv.store.closeDialog();
+    this.requestUpdate();
+    const opener = this._editorOpener;
+    this._editorOpener = null;
+    // A details sheet leaving too (a saved edit) takes focus back to the event itself.
+    if (this._details.value && this._details.leaving) return;
+    requestAnimationFrame(() => {
+      if (opener?.isConnected) opener.focus();
+    });
+  };
+
   /** Now, to the minute the views last moved to. */
   private _now = memoizeOne((tick: number) => new Date(tick * 60000));
 
@@ -613,18 +654,21 @@ export class PvCalendarModule extends LitElement {
         ></pv-event-popup>
       `) : nothing}
 
-      ${store.dialogOpen ? html`
+      ${this._editor.value ? keyed(this._editorMount, html`
         <pv-event-create-dialog
+          layout=${this.layout}
           .store=${store}
           .hass=${this.hass}
           .calendars=${calendars}
           .open=${true}
-          .mode=${store.dialogOpen}
-          .prefill=${store.createPrefill}
+          .mode=${this._editor.value.mode}
+          .prefill=${this._editor.value.prefill}
+          .leaving=${this._editor.leaving}
           .timeFormat=${display?.time_format || '12h'}
           .locationAutocomplete=${display.location_autocomplete === true}
+          @pv-sheet-close=${this._onEditorClosed}
         ></pv-event-create-dialog>
-      ` : nothing}
+      `) : nothing}
     `;
   }
 
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
index b2c2f11..b13b5b9 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
@@ -287,7 +287,11 @@ export class PVEventPopup extends LitElement {
     this._asking = false;
     const id = e.detail.id;
     if (id === 'delete' || id === 'everyone') void this._delete(id === 'everyone');
-    else if (id === 'remove' && this.event) this.store.openEditDialog(this.event, { removeGuests: true });
+    else if (id === 'remove' && this.event) {
+      // Delete gets focus first, so it gets it back when the editor closes.
+      this.renderRoot.querySelector<HTMLElement>('.danger')?.focus();
+      this.store.openEditDialog(this.event, { removeGuests: true });
+    }
     else void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.danger')?.focus());
   };
 
```

`custom_components/planavista/frontend/src/styles/shared.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/shared.ts b/custom_components/planavista/frontend/src/styles/shared.ts
index 08ee0cf..fb7babc 100644
--- a/custom_components/planavista/frontend/src/styles/shared.ts
+++ b/custom_components/planavista/frontend/src/styles/shared.ts
@@ -320,7 +320,9 @@ export const formStyles = css`
     position: relative;
     width: 44px;
     height: 24px;
-    background: var(--pv-border);
+    flex-shrink: 0;
+    /* Off reads at about 3:1 on the card, like a control should (spec 11.8). */
+    background: var(--pv-text-muted, #8E949C);
     border-radius: var(--pv-radius, 12px);
     cursor: pointer;
     transition: background var(--pv-transition, 200ms ease);
```

- [ ] **Step 7: Run the task's tests.** `npx vitest run test/event-words.test.ts test/event-edit.test.ts test/event-form.test.ts test/calendar-store.test.ts` Expected: PASS, `72 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `757 passed`.

- [ ] **Step 8: Check it on the dev Home Assistant** at 800 by 1280 and 390 by 844: New event rises with the title focused; Escape with nothing typed closes it and focus returns to New event; with a title typed, Escape asks "Discard this event?" and Keep editing keeps it; the date picker's days are 48 px and Escape closes the picker first; Add on a test calendar closes the sheet; Edit opens over the details and Cancel goes back with Edit focused; Save closes both and focus lands on the event's chip. Delete the test event afterwards.

- [ ] **Step 9: Commit.** `git add` the files above; message:

```text
feat(calendar): New event and Edit event open as a sheet

The event editor takes the same sheet as everything else: it rises from
the bottom in portrait and on phones and is a wider card in landscape,
with the title focused, Tab kept inside, and focus back where it came
from. Escape closes an open picker first, then the sheet; Escape, a tap
outside, or a drag ask "Discard your changes?" when something was typed,
while Cancel doesn't. Edit opens over the event's details and Cancel
goes back to them; saving closes both. The words follow the copy rules:
New event, Who, Starts and Ends, All day, Add or Save, and errors that
say what happened and what to do next, with Home Assistant's own reason
kept for the log. The date and time pickers, the people, and the
suggestions are real buttons with 48 px targets, and the All day switch
reads clearly when it's off.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 4: Designed loading, empty, and error states

Spec 11.6 (skeletons, not spinners; designed empty and error states that say what to do next) and 15.4 (things that need a person).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/calendar/calendar-states.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/calendar-skeleton.ts`
- Modify: `custom_components/planavista/coordinator.py`, `custom_components/planavista/frontend/src/types.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/styles/status.ts`
- Test: `custom_components/planavista/frontend/test/calendar-states.test.ts`, `tests/test_coordinator.py`

**Interfaces:**
- Consumes: Task 2's `namesList` and `statusStyles`.
- Produces: `CalendarScreen` (`loading`, `unavailable`, `no-calendars`, `all-hidden`, `ready`), `screenOf({ sensorState, running, calendars, hidden })`, `calendarLabel(calendar)`, `unreachableText(labels)`, `Banner`, `bannersOf({ connected, calendars, hidden })` in `calendar-states.ts`; `calendarSkeleton(view, layout, people)` and `skeletonStyles`; `CalendarStore.showAllCalendars()`; `CalendarConfig.fetch_failed?`; the coordinator's calendar rows carry `fetch_failed: true` when their events couldn't be read.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/calendar-states.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import type { CalendarConfig } from '../src/types';
import { bannersOf, calendarLabel, screenOf, unreachableText } from '../src/modules/calendar/calendar-states';

function calendar(entity_id: string, display_name: string, extra: Partial<CalendarConfig> = {}): CalendarConfig {
  return {
    entity_id, display_name, color: '#F94144', color_light: '#FDBDBE', icon: 'mdi:account',
    person_entity: '', member_id: 'm-' + display_name.toLowerCase(), visible: true, state: 'off', ...extra,
  };
}

const ALEX = calendar('calendar.test_alex', 'Alex');
const BLAIR = calendar('calendar.test_blair', 'Blair');
const NONE = new Set<string>();

describe('screenOf', () => {
  it('shows a skeleton while Home Assistant is starting and the data is not there yet', () => {
    expect(screenOf({ sensorState: 'unavailable', running: false, calendars: [], hidden: NONE })).toBe('loading');
    expect(screenOf({ sensorState: undefined, running: false, calendars: [], hidden: NONE })).toBe('loading');
  });

  it("says it can't load once Home Assistant runs and the data still isn't there", () => {
    expect(screenOf({ sensorState: 'unavailable', running: true, calendars: [], hidden: NONE })).toBe('unavailable');
    expect(screenOf({ sensorState: 'unknown', running: true, calendars: [ALEX], hidden: NONE })).toBe('unavailable');
  });

  it('tells a household with no calendars yet, and one that hid them all, what to do', () => {
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [], hidden: NONE })).toBe('no-calendars');
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [ALEX, BLAIR], hidden: new Set([ALEX.entity_id, BLAIR.entity_id]) }))
      .toBe('all-hidden');
  });

  it('shows the views when there is something to show', () => {
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [ALEX, BLAIR], hidden: new Set([ALEX.entity_id]) })).toBe('ready');
  });
});

describe('calendarLabel', () => {
  it("names a person's calendar by its owner, and another by its own name", () => {
    expect(calendarLabel(ALEX)).toBe("Alex's calendar");
    expect(calendarLabel(calendar('calendar.family', 'Family', { member_id: null }))).toBe('the Family calendar');
  });
});

describe('unreachableText', () => {
  it('says what happened and what to do next', () => {
    expect(unreachableText(["Alex's calendar"])).toBe(
      "Alex's calendar can't be reached, so its events may be missing. Check its integration in Settings, Devices and services.",
    );
    expect(unreachableText(["Alex's calendar", 'the Family calendar'])).toBe(
      "Alex's calendar and the Family calendar can't be reached, so their events may be missing. Check their integrations in Settings, Devices and services.",
    );
  });
});

describe('bannersOf', () => {
  it('says when Home Assistant is out of reach', () => {
    expect(bannersOf({ connected: false, calendars: [ALEX], hidden: NONE })).toEqual([
      { kind: 'offline', text: "Can't reach Home Assistant. These are the last events it sent." },
    ]);
  });

  it("names the shown calendars that can't be reached or whose events didn't arrive", () => {
    const banners = bannersOf({
      connected: true,
      calendars: [calendar('calendar.test_alex', 'Alex', { state: 'unavailable' }), calendar('calendar.test_blair', 'Blair', { fetch_failed: true })],
      hidden: NONE,
    });
    expect(banners).toEqual([{ kind: 'unreachable', text: unreachableText(["Alex's calendar", "Blair's calendar"]) }]);
  });

  it('leaves out a hidden calendar, and says nothing when all is well', () => {
    expect(bannersOf({ connected: true, calendars: [calendar('calendar.test_alex', 'Alex', { state: 'unavailable' })], hidden: new Set(['calendar.test_alex']) }))
      .toEqual([]);
    expect(bannersOf({ connected: true, calendars: [ALEX, BLAIR], hidden: NONE })).toEqual([]);
  });
});
```

`tests/test_coordinator.py`:

```diff
diff --git a/tests/test_coordinator.py b/tests/test_coordinator.py
index 125515f..a4e8448 100644
--- a/tests/test_coordinator.py
+++ b/tests/test_coordinator.py
@@ -2,8 +2,9 @@
 from __future__ import annotations
 
 from copy import deepcopy
-from datetime import timedelta
+from datetime import datetime, timedelta
 from typing import Any
+from unittest.mock import patch
 
 import pytest
 from pytest_homeassistant_custom_component.common import MockConfigEntry
@@ -75,3 +76,38 @@ async def test_sensor_exposes_calendars_and_events(
     assert state.attributes["onboarding_complete"] is False
 
     assert hass.states.get("sensor.planavista_upcoming_events").state == "2"
+
+
+def _rows(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
+    state = hass.states.get("sensor.planavista_config")
+    return {row["entity_id"]: row for row in state.attributes["calendars"]}
+
+
+async def test_a_calendar_whose_events_cant_be_read_is_marked(
+    hass: HomeAssistant,
+    setup_calendars: dict[str, FakeCalendar],
+    mock_config_entry: MockConfigEntry,
+) -> None:
+    """The card can name a calendar whose events didn't arrive (spec 11.6); the others carry no mark."""
+    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
+    await hass.async_block_till_done()
+    coordinator = mock_config_entry.runtime_data
+    real_fetch = coordinator._fetch_calendar_events
+
+    async def fetch(entity_id: str, start: datetime, end: datetime) -> list[dict]:
+        if entity_id == "calendar.test_blair":
+            raise RuntimeError("token expired")
+        return await real_fetch(entity_id, start, end)
+
+    with patch.object(coordinator, "_fetch_calendar_events", side_effect=fetch):
+        await coordinator.async_refresh()
+        await hass.async_block_till_done()
+
+    rows = _rows(hass)
+    assert rows["calendar.test_blair"]["fetch_failed"] is True
+    assert "fetch_failed" not in rows["calendar.test_alex"]
+
+    # The next refresh that reads it clears the mark.
+    await coordinator.async_refresh()
+    await hass.async_block_till_done()
+    assert "fetch_failed" not in _rows(hass)["calendar.test_blair"]
```

- [ ] **Step 2: Run them.** `npx vitest run test/calendar-states.test.ts` Expected: FAIL: `../src/modules/calendar/calendar-states` can't be found. `bash scripts/test-backend.sh tests/test_coordinator.py -q` Expected: FAIL with `KeyError: 'fetch_failed'`.

- [ ] **Step 3: The coordinator marks a calendar whose events couldn't be read.**

`custom_components/planavista/coordinator.py`:

```diff
diff --git a/custom_components/planavista/coordinator.py b/custom_components/planavista/coordinator.py
index 638b78b..ad7a910 100644
--- a/custom_components/planavista/coordinator.py
+++ b/custom_components/planavista/coordinator.py
@@ -188,6 +188,8 @@ class PlanaVistaCoordinator(DataUpdateCoordinator[dict[str, Any]]):
                             event["calendar_color_light"] = color_light
                             data["events"].append(event)
                     except Exception as err:
+                        # The card names it, so a family knows its events may be missing (spec 11.6).
+                        calendar_data["fetch_failed"] = True
                         _LOGGER.warning(
                             "Failed to fetch events from %s: %s", entity_id, err
                         )
```

`custom_components/planavista/frontend/src/types.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/types.ts b/custom_components/planavista/frontend/src/types.ts
index 02debbd..2994a39 100644
--- a/custom_components/planavista/frontend/src/types.ts
+++ b/custom_components/planavista/frontend/src/types.ts
@@ -77,6 +77,8 @@ export interface CalendarConfig {
   visible: boolean;
   state?: string;
   attributes?: Record<string, any>;
+  /** Set by the coordinator when this calendar's events couldn't be read on the last refresh. */
+  fetch_failed?: boolean;
 }
 
 export interface CalendarEvent {
```

- [ ] **Step 4: Which screen, and which banners.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-states.ts` (new):

```ts
import type { CalendarConfig } from '../../types';
import { namesList } from './event-words';

/**
 * What the calendar shows (spec 11.6): a skeleton while the data is on its
 * way, a designed state when there is nothing to show or it can't load,
 * and the views otherwise.
 */
export type CalendarScreen = 'loading' | 'unavailable' | 'no-calendars' | 'all-hidden' | 'ready';

export interface ScreenInput {
  /** The config sensor's state; 'unavailable' or 'unknown' while it has no data. */
  sensorState: string | undefined;
  /** Whether Home Assistant has finished starting (hass.config.state is RUNNING). */
  running: boolean;
  /** The calendars this card shows. */
  calendars: Pick<CalendarConfig, 'entity_id'>[];
  /** The ones the filter hides. */
  hidden: ReadonlySet<string>;
}

export function screenOf({ sensorState, running, calendars, hidden }: ScreenInput): CalendarScreen {
  if (sensorState === undefined || sensorState === 'unavailable' || sensorState === 'unknown') {
    return running ? 'unavailable' : 'loading';
  }
  if (calendars.length === 0) return 'no-calendars';
  if (calendars.every(c => hidden.has(c.entity_id))) return 'all-hidden';
  return 'ready';
}

/** How a calendar is named in a sentence: "Alex's calendar", or "the Family calendar" when nobody owns it. */
export function calendarLabel(calendar: Pick<CalendarConfig, 'display_name' | 'member_id' | 'person_entity' | 'entity_id'>): string {
  const name = calendar.display_name || calendar.entity_id;
  return calendar.member_id || calendar.person_entity ? `${name}'s calendar` : `the ${name} calendar`;
}

function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The banner for calendars Home Assistant can't reach, or whose events didn't arrive: what happened and what to do. */
export function unreachableText(labels: string[]): string {
  if (labels.length === 1) {
    return `${capitalized(labels[0])} can't be reached, so its events may be missing. Check its integration in Settings, Devices and services.`;
  }
  return `${capitalized(namesList(labels))} can't be reached, so their events may be missing. Check their integrations in Settings, Devices and services.`;
}

export interface Banner {
  kind: 'offline' | 'unreachable';
  text: string;
}

export interface BannerInput {
  /** hass.connected: false while the browser can't reach Home Assistant. */
  connected: boolean;
  calendars: CalendarConfig[];
  hidden: ReadonlySet<string>;
}

/** The banners over the views: Home Assistant out of reach, and the shown calendars it can't read. */
export function bannersOf({ connected, calendars, hidden }: BannerInput): Banner[] {
  const banners: Banner[] = [];
  if (!connected) {
    banners.push({ kind: 'offline', text: "Can't reach Home Assistant. These are the last events it sent." });
  }
  const unreachable = calendars.filter(c => !hidden.has(c.entity_id) && (c.state === 'unavailable' || c.fetch_failed === true));
  if (unreachable.length) banners.push({ kind: 'unreachable', text: unreachableText(unreachable.map(calendarLabel)) });
  return banners;
}
```

- [ ] **Step 5: The skeletons, in the shape of each view.**

`custom_components/planavista/frontend/src/modules/calendar/components/calendar-skeleton.ts` (new):

```ts
import { css, html, TemplateResult } from 'lit';
import type { ViewType } from '../../../types';
import type { Layout } from '../../../core/layout';

/** Where each lane's placeholder blocks sit, as top and height in percent of the day. */
const LANE_BLOCKS: Array<Array<[number, number]>> = [
  [[8, 9], [34, 6], [62, 12]],
  [[18, 12], [52, 8]],
  [[4, 6], [28, 14], [70, 8]],
];

/** Placeholder chips per day card or Month cell, repeating. */
const CHIPS = [2, 1, 0, 3, 1, 2, 0];

/**
 * The calendar's skeletons (spec 11.6: skeletons, not spinners): the shape
 * of the view that's loading, in neutral bones, so nothing jumps when the
 * events arrive.
 */
export function calendarSkeleton(view: ViewType, layout: Layout, people: number): TemplateResult {
  const lanes = Math.max(1, Math.min(4, people || 3));
  switch (view) {
    case 'week': {
      const cards = layout === 'phone' ? 3 : layout === 'portrait' ? 6 : 8;
      return html`
        <div class="skeleton skeleton-week" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({ length: cards }, (_, i) => html`
            <div class="bone-card">
              <div class="bone" style="width: 45%; height: 16px"></div>
              ${Array.from({ length: CHIPS[i % CHIPS.length] }, () => html`<div class="bone" style="height: 44px"></div>`)}
            </div>
          `)}
        </div>
      `;
    }
    case 'month':
      return html`
        <div class="skeleton skeleton-month" aria-busy="true" aria-label="Loading the calendar">
          ${Array.from({ length: 35 }, (_, i) => html`
            <div class="bone-cell">
              <div class="bone round" style="width: 18px; height: 18px"></div>
              ${Array.from({ length: Math.min(2, CHIPS[i % CHIPS.length]) }, () => html`<div class="bone" style="height: 14px"></div>`)}
            </div>
          `)}
        </div>
      `;
    case 'agenda':
      return html`
        <div class="skeleton skeleton-agenda" aria-busy="true" aria-label="Loading the calendar">
          ${[2, 1, 3, 1].map(rows => html`
            <div class="bone-card">
              <div class="bone" style="width: 30%; height: 18px"></div>
              ${Array.from({ length: rows }, () => html`<div class="bone" style="height: 48px"></div>`)}
            </div>
          `)}
        </div>
      `;
    default:
      return html`
        <div class="skeleton skeleton-day" aria-busy="true" aria-label="Loading the calendar">
          <div class="bone-heads">
            ${Array.from({ length: lanes }, () => html`
              <div class="bone-head"><div class="bone round" style="width: 48px; height: 48px"></div><div class="bone" style="width: 56px; height: 12px"></div></div>
            `)}
          </div>
          <div class="bone-lanes">
            ${Array.from({ length: lanes }, (_, i) => html`
              <div class="bone-lane">
                ${LANE_BLOCKS[i % LANE_BLOCKS.length].map(([top, height]) => html`
                  <div class="bone" style="top: ${top}%; height: ${height}%"></div>
                `)}
              </div>
            `)}
          </div>
        </div>
      `;
  }
}

export const skeletonStyles = css`
  .skeleton {
    box-sizing: border-box;
    height: 100%;
    padding: 12px 16px;
    overflow: hidden;
  }

  .skeleton-week {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: 12px;
  }

  :host([layout='portrait']) .skeleton-week {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :host([layout='phone']) .skeleton-week {
    grid-template-columns: minmax(0, 1fr);
  }

  .bone-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 120px;
    padding: 12px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
    border-radius: var(--pv-radius, 12px);
  }

  .skeleton-agenda {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 800px;
    margin: 0 auto;
  }

  .skeleton-agenda .bone-card {
    min-height: 0;
  }

  .skeleton-month {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: repeat(5, minmax(0, 1fr));
    gap: 1px;
    padding: 0;
  }

  .bone-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border: 1px solid var(--pv-border-subtle, #F1F1EE);
  }

  .skeleton-day {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bone-heads,
  .bone-lanes {
    display: flex;
    gap: 12px;
    padding-left: 48px;
  }

  .bone-head {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bone-lanes {
    flex: 1 1 auto;
  }

  .bone-lane {
    position: relative;
    flex: 1 1 0;
  }

  .bone-lane .bone {
    position: absolute;
    left: 0;
    right: 0;
  }
`;
```

- [ ] **Step 6: The module shows them, with Show all, Add calendars, and Try again; banners keep their button on one line.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts
index 1c109a7..91cd1d5 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-store.ts
@@ -63,6 +63,13 @@ export class CalendarStore {
     this._notify();
   }
 
+  /** Show every calendar again (the all-hidden state's Show all). */
+  showAllCalendars(): void {
+    if (this.hiddenCalendars.size === 0) return;
+    this.hiddenCalendars = new Set();
+    this._notify();
+  }
+
   setView(view: ViewType): void {
     if (this.currentView !== view) {
       this.currentView = view;
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index f8a8e41..1a30fc1 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -7,6 +7,7 @@ import { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, Pla
 import type { Layout } from '../../core/layout';
 import type { Mode, ThemeShape } from '../../styles/theme-pairs';
 import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../../styles/shared';
+import { statusStyles } from '../../styles/status';
 import { getPersonAvatar, getPersonName } from '../../utils/ha-utils';
 import { swipeDirection } from '../../utils/gestures';
 import { memoizeOne } from '../../utils/render-cache';
@@ -18,6 +19,12 @@ import { contrastText } from '../../core/color';
 import type { ModuleService } from '../../core/module-registry';
 import { GONE, Presence, nextPresence } from '../../core/sheet-presence';
 import { deepActiveElement } from '../../core/focus';
+import type { HouseholdView } from '../../core/household';
+import type { Session } from '../../core/session';
+import { parentAccess } from '../../core/access';
+import { OPEN_SETTINGS } from '../../core/page-host';
+import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
+import { calendarSkeleton, skeletonStyles } from './components/calendar-skeleton';
 
 import './components/view-day';
 import './components/view-week';
@@ -61,6 +68,9 @@ export class PvCalendarModule extends LitElement {
   @property({ attribute: false }) services: Record<string, ModuleService> = {};
   /** Bumped by the card when a module's service has news. */
   @property({ attribute: false }) revision = 0;
+  /** The household and parent mode, for what the empty states offer (a parent adds calendars). */
+  @property({ attribute: false }) household: HouseholdView | null = null;
+  @property({ attribute: false }) session: Session | null = null;
 
   /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
   @state() private _tick = Math.floor(Date.now() / 60000);
@@ -94,6 +104,8 @@ export class PvCalendarModule extends LitElement {
     buttonStyles,
     typographyStyles,
     animationStyles,
+    statusStyles,
+    skeletonStyles,
     css`
       :host {
         display: flex;
@@ -626,9 +638,25 @@ export class PvCalendarModule extends LitElement {
     const { calendars, visibleEvents } = this._derived();
     const store = this._pv.store;
     const display = this.display;
+    const hidden = store.hiddenCalendars;
+    const screen = screenOf({
+      sensorState: this.hass.states[this.cardConfig?.entity || DEFAULT_ENTITY]?.state,
+      running: this._running(),
+      calendars,
+      hidden,
+    });
+    const banners = screen === 'ready' ? bannersOf({ connected: this.hass.connected !== false, calendars, hidden }) : [];
 
     return html`
-      ${this._renderToolbar(calendars)}
+      ${screen === 'no-calendars' || screen === 'unavailable' ? nothing : this._renderToolbar(calendars)}
+      ${banners.map(banner => html`
+        <div class="banner" role="status">
+          <span class="text">${banner.text}</span>
+          ${banner.kind === 'unreachable' ? html`
+            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
+          ` : nothing}
+        </div>
+      `)}
       <div class="pvc-body"
         @touchstart=${this._onTouchStart}
         @touchend=${this._onTouchEnd}
@@ -637,7 +665,7 @@ export class PvCalendarModule extends LitElement {
         @day-click=${this._onDayClick}
         @create-event=${this._onCreateEvent}
       >
-        ${this._renderView(store.currentView, visibleEvents, calendars, display)}
+        ${screen === 'ready' ? this._renderView(store.currentView, visibleEvents, calendars, display) : this._renderScreen(screen, calendars)}
       </div>
 
       ${this._details.value ? keyed(this._detailsMount, html`
@@ -672,6 +700,59 @@ export class PvCalendarModule extends LitElement {
     `;
   }
 
+  /** Whether Home Assistant has finished starting (an older frontend without the state counts as running). */
+  private _running(): boolean {
+    const state = (this.hass.config as { state?: string } | undefined)?.state;
+    return state === undefined || state === 'RUNNING';
+  }
+
+  /** The designed states (spec 11.6): what's loading, what's missing, and what to do next. */
+  private _renderScreen(screen: CalendarScreen, calendars: CalendarConfig[]) {
+    if (screen === 'loading') return calendarSkeleton(this._pv.store.currentView, this.layout, calendars.length);
+    if (screen === 'unavailable') {
+      return html`
+        <div class="state" role="alert">
+          <div class="art" aria-hidden="true">📡</div>
+          <h2>Can't load the calendar</h2>
+          <p>PlanaVista couldn't read the calendars just now, and tries again every minute. If this stays, check Settings, System, Logs for PlanaVista.</p>
+          <div class="buttons">
+            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
+          </div>
+        </div>
+      `;
+    }
+    if (screen === 'no-calendars') {
+      const parent = parentAccess(this.household, this.session) !== 'no';
+      return html`
+        <div class="state">
+          <div class="art" aria-hidden="true">📅</div>
+          <h2>No calendars yet</h2>
+          <p>${parent ? "Add your family's calendars, and say whose each one is." : 'A parent can add calendars in Settings.'}</p>
+          ${parent ? html`
+            <div class="buttons">
+              <button class="pv-btn pv-btn-primary" type="button" @click=${this._openCalendarsPage}>Add calendars</button>
+            </div>
+          ` : nothing}
+        </div>
+      `;
+    }
+    return html`
+      <div class="state">
+        <div class="art" aria-hidden="true">📅</div>
+        <h2>Every calendar is hidden</h2>
+        <p>Show them again to see what's coming up.</p>
+        <div class="buttons">
+          <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._pv.store.showAllCalendars()}>Show all</button>
+        </div>
+      </div>
+    `;
+  }
+
+  /** Settings, Calendars (the card asks for a parent's PIN first where it needs one). */
+  private _openCalendarsPage = (): void => {
+    this.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { detail: { page: 'calendars' }, bubbles: true, composed: true }));
+  };
+
   private _renderToolbar(calendars: CalendarConfig[]) {
     const hiddenCount = calendars.filter(c => this._pv.store.hiddenCalendars.has(c.entity_id)).length;
 
@@ -918,7 +999,7 @@ export class PvCalendarModule extends LitElement {
     this._touchStart = null;
   }
 
-  private async _refreshCalendars() {
+  private _refreshCalendars = async (): Promise<void> => {
     if (this._refreshing) return;
     this._refreshing = true;
     try {
@@ -934,7 +1015,7 @@ export class PvCalendarModule extends LitElement {
     }
     // Keep spinner for at least 800ms so the animation completes
     setTimeout(() => { this._refreshing = false; }, 800);
-  }
+  };
 }
 
 defineElement('pv-calendar-module', PvCalendarModule);
```

`custom_components/planavista/frontend/src/styles/status.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/status.ts b/custom_components/planavista/frontend/src/styles/status.ts
index a2b4ce9..cee29db 100644
--- a/custom_components/planavista/frontend/src/styles/status.ts
+++ b/custom_components/planavista/frontend/src/styles/status.ts
@@ -108,7 +108,9 @@ export const statusStyles = css`
   }
 
   .banner button {
-    min-height: 40px;
+    flex-shrink: 0;
+    min-height: 48px;
+    white-space: nowrap;
   }
 
   /* Skeletons stay neutral: a tint of the text color, never a brand fill (spec 11.6). */
```

- [ ] **Step 7: Agenda with nothing coming up, a Day with nothing on it, and the card without its sensor.**

`custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
index b111b48..a700681 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
@@ -3,7 +3,8 @@ import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../../../utils/define';
 import { HomeAssistant } from 'custom-card-helpers';
 import { CalendarEvent, CalendarConfig, WeatherCondition } from '../../../types';
-import { baseStyles, animationStyles } from '../../../styles/shared';
+import { baseStyles, animationStyles, buttonStyles } from '../../../styles/shared';
+import { statusStyles } from '../../../styles/status';
 import type { Layout } from '../../../core/layout';
 import {
   formatDate,
@@ -43,6 +44,8 @@ export class PVViewAgenda extends LitElement {
   static styles = [
     baseStyles,
     animationStyles,
+    buttonStyles,
+    statusStyles,
     css`
       :host { display: block; height: 100%; overflow: hidden; }
 
@@ -245,6 +248,23 @@ export class PVViewAgenda extends LitElement {
     // Weather forecast
     const forecast = buildForecastMap(this.forecast);
 
+    // Nothing in the whole range: one designed state, not a stack of empty days (spec 11.6).
+    if (days.every(day => !(grouped.get(getDateKey(day))?.length))) {
+      return html`
+        <div class="agenda-container">
+          <div class="state">
+            <div class="art" aria-hidden="true">🗓️</div>
+            <h2>Nothing coming up</h2>
+            <p>Nothing is on the calendar for the next ${this._daysLoaded} days.</p>
+            <div class="buttons">
+              <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._addEvent(days[0])}>New event</button>
+              <button class="pv-btn pv-btn-secondary" type="button" @click=${this._loadMore}>Look further ahead</button>
+            </div>
+          </div>
+        </div>
+      `;
+    }
+
     return html`
       <div class="agenda-container">
         ${days.map(day => this._renderDayCard(day, grouped, forecast))}
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index c0e0e0d..ef7174c 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -397,6 +397,31 @@ export class PVViewDay extends LitElement {
       }
 
       /* Date banner (shown when viewing a day other than today) */
+      /* A quiet line on a day with nothing on it (spec 11.6); the lanes stay. */
+      .day-empty {
+        display: flex;
+        align-items: center;
+        justify-content: center;
+        gap: 12px;
+        min-height: 48px;
+        padding: 0 16px;
+        color: var(--pv-text-secondary);
+        font-size: 0.9375rem;
+        border-bottom: 1px solid var(--pv-border-subtle, rgba(0, 0, 0, 0.04));
+        flex-shrink: 0;
+      }
+
+      .day-empty-add {
+        min-height: 48px;
+        padding: 0 12px;
+        border: none;
+        background: transparent;
+        color: var(--pv-accent-ink, var(--pv-accent));
+        font: inherit;
+        font-weight: 700;
+        cursor: pointer;
+      }
+
       .date-banner {
         display: flex;
         align-items: center;
@@ -725,6 +750,15 @@ export class PVViewDay extends LitElement {
           </div>
         ` : nothing}
 
+        ${dayEvents.length === 0 ? html`
+          <div class="day-empty" role="status">
+            <span>${isCurrentDay
+              ? 'Nothing on the calendar today.'
+              : `Nothing on the calendar on ${this.currentDate.toLocaleDateString('en-US', { weekday: 'long' })}.`}</span>
+            <button class="day-empty-add" type="button" @click=${this._addEvent}>New event</button>
+          </div>
+        ` : nothing}
+
         <div class="time-grid-wrapper">
           <div class="time-grid">
             <div class="time-gutter">
@@ -795,6 +829,11 @@ export class PVViewDay extends LitElement {
     `;
   }
 
+  /** New event on the day shown (the module opens the editor). */
+  private _addEvent = (): void => {
+    this.dispatchEvent(new CustomEvent('create-event', { detail: { date: this.currentDate }, bubbles: true, composed: true }));
+  };
+
   private _goToToday() {
     this.dispatchEvent(new CustomEvent('day-click', {
       detail: { date: new Date() },
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index d74a978..1f4d8f6 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -5,6 +5,7 @@ import { HomeAssistant } from 'custom-card-helpers';
 import { defineElement, defineElementAlias } from '../utils/define';
 import { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../types';
 import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
+import { statusStyles } from '../styles/status';
 import { getPlanaVistaData } from '../utils/ha-utils';
 import { todayHighLow } from '../utils/weather-subscription';
 import { memoizeOne, statesChanged } from '../utils/render-cache';
@@ -172,6 +173,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     buttonStyles,
     typographyStyles,
     animationStyles,
+    statusStyles,
     css`
       :host {
         display: block;
@@ -215,14 +217,6 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         order: 2;
       }
 
-/* Empty state */
-
-      .pvc-empty {
-        padding: 2rem;
-        text-align: center;
-        color: var(--pv-text-muted);
-      }
-
 /* Setup-pending placeholder shown in card editor preview */
 
       .pvc-setup-pending {
@@ -296,6 +290,12 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     return true;
   }
 
+  /** True while Home Assistant is still starting (the config sensor may not exist yet). */
+  private _starting(): boolean {
+    const state = (this.hass?.config as { state?: string } | undefined)?.state;
+    return state !== undefined && state !== 'RUNNING';
+  }
+
   private _entityId(): string {
     return this._config?.entity || DEFAULT_ENTITY;
   }
@@ -642,10 +642,19 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     if (!data) {
       return html`
         <ha-card>
-          <div class="pvc-empty">
-            <p>PlanaVista entity not found</p>
-            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
-          </div>
+          ${this._starting() ? html`
+            <div class="state" role="status">
+              <div class="art" aria-hidden="true">⏳</div>
+              <h2>Home Assistant is starting</h2>
+              <p>The calendar shows up here as soon as it's ready.</p>
+            </div>
+          ` : html`
+            <div class="state" role="alert">
+              <div class="art" aria-hidden="true">🧩</div>
+              <h2>PlanaVista isn't set up yet</h2>
+              <p>Add PlanaVista in Settings, Devices and services, then reload this page.</p>
+            </div>
+          `}
         </ha-card>
       `;
     }
```

- [ ] **Step 8: Run the task's tests.** `npx vitest run test/calendar-states.test.ts` Expected: PASS, `9 passed`. `bash scripts/test-backend.sh tests/test_coordinator.py -q` Expected: `2 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `766 passed`; `bash scripts/test-backend.sh -q` Expected: `1050 passed`.

- [ ] **Step 9: Check it on the dev Home Assistant:** hiding every calendar shows "Every calendar is hidden" and Show all; `python scripts/ha.py api POST /api/states/calendar.test_alex '{"state": "unavailable"}'` then a refresh of `sensor.planavista_config` shows the banner naming Alex's calendar (a later `update_entity` on the calendar puts it back); handing the card a `hass` whose sensor is unavailable shows the skeleton while starting and "Can't load the calendar" while running; a sensor with no calendars shows "No calendars yet" with Add calendars, which opens Settings, Calendars.

- [ ] **Step 10: Commit.** `git add` the files above; message:

```text
feat(calendar): designed loading, empty, and error states

While Home Assistant starts, the calendar shows a skeleton in the shape
of the view that's loading. When its data can't be read, it says so
and what to do, with Try again; with no calendars yet, a parent gets
Add calendars, which opens Settings; with every calendar hidden, Show
all. A calendar Home Assistant can't reach, or whose events didn't
arrive, gets a banner naming it, and losing Home Assistant says the
events are the last it sent. Agenda with nothing coming up and a Day
with nothing on it say so, with New event. The card itself tells
"Home Assistant is starting" from "PlanaVista isn't set up yet". The
coordinator marks a calendar whose events couldn't be read so the card
can name it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 5: Rounded headings, the status map, the copy rules, and 48 px targets

Spec 11.2 (headings and numbers in the rounded face, tabular figures), 11.4, 11.7, and 11.8.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/calendar/view-words.ts`
- Modify: `custom_components/planavista/frontend/src/modules/calendar/event-words.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts`, `custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts`
- Test: `custom_components/planavista/frontend/test/view-words.test.ts`, `custom_components/planavista/frontend/test/event-words.test.ts`

**Interfaces:**
- Consumes: Task 2's `eventStatus`, `longDate`, and `statusStyles`.
- Produces: `navLabels(view)`, `newEventLabel(day, now)`, `agendaNote(day, today, first)` in `view-words.ts`; `dayOfStatus(event, day)` in `event-words.ts`; `pv-event-chip` takes `badge: StatusBadge | null`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/view-words.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { agendaNote, navLabels, newEventLabel } from '../src/modules/calendar/view-words';

const TODAY = new Date(2026, 9, 11);

describe('navLabels', () => {
  it('names the arrows for the step they take', () => {
    expect(navLabels('day')).toEqual({ prev: 'Previous day', next: 'Next day' });
    expect(navLabels('week')).toEqual({ prev: 'Previous week', next: 'Next week' });
    expect(navLabels('agenda')).toEqual({ prev: 'Previous week', next: 'Next week' });
    expect(navLabels('month')).toEqual({ prev: 'Previous month', next: 'Next month' });
  });
});

describe('newEventLabel', () => {
  it("names a day's add button for its day", () => {
    expect(newEventLabel(new Date(2026, 9, 12), TODAY)).toBe('New event on Monday, October 12');
  });
});

describe('agendaNote', () => {
  it('says Today and Tomorrow', () => {
    expect(agendaNote(new Date(2026, 9, 11), TODAY, true)).toBe('Today');
    expect(agendaNote(new Date(2026, 9, 12), TODAY, false)).toBe('Tomorrow');
  });

  it("names the month where the list starts and where a new one begins, and says nothing the day's name already says", () => {
    expect(agendaNote(new Date(2026, 9, 20), TODAY, true)).toBe('October');
    expect(agendaNote(new Date(2026, 9, 13), TODAY, false)).toBe('');
    expect(agendaNote(new Date(2026, 10, 1), TODAY, false)).toBe('November');
    expect(agendaNote(new Date(2027, 0, 1), TODAY, false)).toBe('January 2027');
  });
});
```

`custom_components/planavista/frontend/test/event-words.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-words.test.ts b/custom_components/planavista/frontend/test/event-words.test.ts
index c98b28c..2f01b94 100644
--- a/custom_components/planavista/frontend/test/event-words.test.ts
+++ b/custom_components/planavista/frontend/test/event-words.test.ts
@@ -1,7 +1,7 @@
 import { describe, expect, it } from 'vitest';
 import type { CalendarEvent } from '../src/types';
 import {
-  calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, formSignature, longDate, namesList, saveFailedText,
+  calendarCan, dayOfStatus, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, formSignature, longDate, namesList, saveFailedText,
 } from '../src/modules/calendar/event-words';
 
 const NOW = new Date(2026, 9, 12, 8, 50); // Mon Oct 12, 8:50 AM
@@ -64,6 +64,14 @@ describe('eventStatus', () => {
   });
 });
 
+describe('dayOfStatus', () => {
+  it("counts a multi-day event on the day a card shows, not on today", () => {
+    const trip = event('2026-10-11', '2026-10-14', 'Weekend trip');
+    expect(dayOfStatus(trip, new Date(2026, 9, 13))).toEqual({ words: 'Day 3 of 3', tone: 'neutral' });
+    expect(dayOfStatus(event('2026-10-13T12:00:00-05:00', '2026-10-13T13:00:00-05:00'), new Date(2026, 9, 13, 12, 30))).toBeNull();
+  });
+});
+
 describe('names in sentences', () => {
   it('joins names the way people write them', () => {
     expect(namesList(['Alex'])).toBe('Alex');
```

- [ ] **Step 2: Run them.** `npx vitest run test/view-words.test.ts test/event-words.test.ts` Expected: FAIL: `../src/modules/calendar/view-words` can't be found, and `dayOfStatus` isn't exported.

- [ ] **Step 3: The views' words, and a multi-day event counted on its card's own day.**

`custom_components/planavista/frontend/src/modules/calendar/view-words.ts` (new):

```ts
import type { ViewType } from '../../types';
import { calendarDaysBetween } from '../../utils/date-utils';
import { longDate } from './event-words';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** What the toolbar's arrows are called (spec 11.8: a control without words still has a name). Agenda steps a week. */
export function navLabels(view: ViewType): { prev: string; next: string } {
  switch (view) {
    case 'day':
      return { prev: 'Previous day', next: 'Next day' };
    case 'month':
      return { prev: 'Previous month', next: 'Next month' };
    default:
      return { prev: 'Previous week', next: 'Next week' };
  }
}

/** A day's add button, named for its day: "New event on Monday, October 12". */
export function newEventLabel(day: Date, now: Date): string {
  return `New event on ${longDate(day, now)}`;
}

/**
 * The quiet word beside an Agenda day's name ("Tue 13"): Today, Tomorrow,
 * or the month where the list starts or a new one begins; otherwise
 * nothing, since the day's name already says it.
 */
export function agendaNote(day: Date, today: Date, first: boolean): string {
  const ahead = calendarDaysBetween(today, day);
  if (ahead === 0) return 'Today';
  if (ahead === 1) return 'Tomorrow';
  if (!first && day.getDate() !== 1) return '';
  const month = MONTHS[day.getMonth()];
  return day.getFullYear() === today.getFullYear() ? month : `${month} ${day.getFullYear()}`;
}
```

`custom_components/planavista/frontend/src/modules/calendar/event-words.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
index 0f9f531..45ce3a0 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
@@ -56,15 +56,8 @@ export function eventWhen(event: CalendarEvent, timeFormat: '12h' | '24h', now:
  * and Day N of M through a multi-day all-day event.
  */
 export function eventStatus(event: CalendarEvent, now: Date): StatusBadge | null {
+  if (isAllDayEvent(event)) return dayOfStatus(event, now);
   const start = parseEventDate(event.start);
-  if (isAllDayEvent(event)) {
-    const last = lastAllDay(event);
-    const days = Math.round((last.getTime() - start.getTime()) / 86_400_000) + 1;
-    if (days < 2) return null;
-    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
-    const day = Math.round((today.getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86_400_000) + 1;
-    return day >= 1 && day <= days ? { words: `Day ${day} of ${days}`, tone: 'neutral' } : null;
-  }
   const end = parseEventDate(event.end);
   if (now >= start && now < end) return { words: 'Now', tone: 'neutral' };
   const minutes = (start.getTime() - now.getTime()) / 60_000;
@@ -72,6 +65,18 @@ export function eventStatus(event: CalendarEvent, now: Date): StatusBadge | null
   return null;
 }
 
+/** Day N of M through a multi-day all-day event, counted on `day` (an Agenda card counts its own day). */
+export function dayOfStatus(event: CalendarEvent, day: Date): StatusBadge | null {
+  if (!isAllDayEvent(event)) return null;
+  const start = parseEventDate(event.start);
+  const last = lastAllDay(event);
+  const days = Math.round((last.getTime() - start.getTime()) / 86_400_000) + 1;
+  if (days < 2) return null;
+  const on = new Date(day.getFullYear(), day.getMonth(), day.getDate());
+  const n = Math.round((on.getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86_400_000) + 1;
+  return n >= 1 && n <= days ? { words: `Day ${n} of ${days}`, tone: 'neutral' } : null;
+}
+
 /** "Alex", "Alex and Blair", "Alex, Blair, and Casey". */
 export function namesList(names: string[]): string {
   if (names.length <= 1) return names[0] ?? '';
```

- [ ] **Step 4: The chip shows a status badge and tabular times.**

`custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
index 406842d..da061d5 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
@@ -8,6 +8,8 @@ import { contrastText } from '../../../core/color';
 import { formatTime } from '../../../utils/date-utils';
 import { getPersonAvatar, getPersonName } from '../../../utils/ha-utils';
 import { baseStyles } from '../../../styles/shared';
+import { statusStyles } from '../../../styles/status';
+import type { StatusBadge } from '../../../core/status-map';
 
 export class PVEventChip extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -17,9 +19,12 @@ export class PVEventChip extends LitElement {
   @property({ type: Boolean }) compact = false;
   @property({ type: Boolean }) showStripes = true;
   @property({ type: Number }) tick = 0;
+  /** A status from the status map (Now, In 10 min), when the view shows one (spec 11.4). */
+  @property({ attribute: false }) badge: StatusBadge | null = null;
 
   static styles = [
     baseStyles,
+    statusStyles,
     css`
       :host { display: block; }
 
@@ -71,13 +76,26 @@ export class PVEventChip extends LitElement {
       }
 
       .chip-time {
+        display: flex;
+        align-items: center;
+        flex-wrap: wrap;
+        gap: 6px;
         font-size: 0.75rem;
         font-weight: 500;
+        font-variant-numeric: tabular-nums;
         color: var(--chip-text);
-        opacity: 0.8;
         margin-top: 2px;
       }
 
+      .chip-time .time-text {
+        opacity: 0.8;
+      }
+
+      .chip-time .badge {
+        padding: 1px 6px;
+        font-size: 0.75rem;
+      }
+
       .chip-avatars {
         display: flex;
         align-items: center;
@@ -225,7 +243,8 @@ export class PVEventChip extends LitElement {
           <div class="${titleClass}">${event.summary}</div>
           ${!this.compact ? html`
             <div class="chip-time">
-              ${isAllDay ? 'All day' : `${formatTime(event.start, this.timeFormat)} – ${formatTime(event.end, this.timeFormat)}`}
+              <span class="time-text">${isAllDay ? 'All day' : `${formatTime(event.start, this.timeFormat)} – ${formatTime(event.end, this.timeFormat)}`}</span>
+              ${this.badge ? html`<span class="badge ${this.badge.tone}">${this.badge.words}</span>` : nothing}
             </div>
           ` : nothing}
         </div>
```

- [ ] **Step 5: Week and Agenda: rounded days, a 48 px + per day, no "N events", "Nothing planned"; Agenda starts on the day shown and carries the badges.**

`custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
index 6bd5e26..3fb62f6 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
@@ -13,6 +13,7 @@ import {
   deduplicateSharedEvents,
   SharedEvent,
 } from '../utils/event-utils';
+import { newEventLabel } from '../view-words';
 import { weatherIcon } from '../../../utils/weather-icons';
 import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
 
@@ -47,9 +48,12 @@ export class PVViewWeek extends LitElement {
         overflow: auto;
       }
 
+      /* Headings and numbers in the rounded face (spec 11.2). */
       .week-label {
-        font-size: 1rem;
-        font-weight: 600;
+        font-family: var(--pv-font-heading, inherit);
+        font-size: 1.125rem;
+        font-weight: 800;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
         padding: 0.75rem 1rem 0.5rem;
         flex-shrink: 0;
@@ -88,19 +92,16 @@ export class PVViewWeek extends LitElement {
         display: flex;
         align-items: center;
         justify-content: space-between;
-        padding: 0.625rem 0.75rem 0.375rem;
+        min-height: 48px;
+        padding: 0 0 0 0.75rem;
         border-bottom: 1px solid var(--pv-border-subtle);
       }
 
-      .day-card-header-left {
-        display: flex;
-        flex-direction: column;
-        gap: 2px;
-      }
-
       .day-name {
+        font-family: var(--pv-font-heading, inherit);
         font-size: 0.9375rem;
-        font-weight: 600;
+        font-weight: 800;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
       }
 
@@ -108,27 +109,34 @@ export class PVViewWeek extends LitElement {
         color: var(--pv-accent-ink, var(--pv-accent));
       }
 
-      .day-meta {
-        font-size: 0.6875rem;
-        color: var(--pv-text-muted);
+      .day-card-tools {
         display: flex;
         align-items: center;
-        gap: 0.5rem;
+        gap: 2px;
       }
 
-      .add-event-link {
-        font-size: 0.6875rem;
+      /* New event on that day: a 48 px target (spec 11.8). */
+      .add-btn {
+        display: grid;
+        place-items: center;
+        width: 48px;
+        height: 48px;
+        padding: 0;
+        border: none;
+        border-radius: 50%;
+        background: transparent;
         color: var(--pv-accent-ink, var(--pv-accent));
         cursor: pointer;
-        font-weight: 500;
-        background: none;
-        border: none;
-        padding: 0;
-        font-family: inherit;
+        --mdc-icon-size: 22px;
+      }
+
+      .add-btn:hover {
+        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
       }
 
-      .add-event-link:hover {
-        text-decoration: underline;
+      .add-btn:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: -4px;
       }
 
       .day-weather {
@@ -166,8 +174,7 @@ export class PVViewWeek extends LitElement {
         justify-content: center;
         padding: 0.75rem;
         color: var(--pv-text-muted);
-        font-size: 0.75rem;
-        font-style: italic;
+        font-size: 0.875rem;
       }
 
       /* ═══════════ RESPONSIVE ═══════════ */
@@ -195,8 +202,6 @@ export class PVViewWeek extends LitElement {
       @media (min-width: 1440px) {
         .week-label { font-size: 1.5rem; }
         .day-name { font-size: 1.375rem; }
-        .day-meta { font-size: 0.9375rem; }
-        .add-event-link { font-size: 0.9375rem; }
         .day-weather svg { width: 36px; height: 36px; }
         .day-weather-temp { font-size: 0.9375rem; }
         .day-card { min-height: 180px; }
@@ -260,24 +265,23 @@ export class PVViewWeek extends LitElement {
 
     const forecast = forecasts.get(dateKey);
     const dayName = `${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}`;
-    const eventCount = dayEvents.length;
 
     return html`
       <div class="day-card ${today ? 'day-card--today' : ''}">
         <div class="day-card-header">
-          <div class="day-card-header-left">
-            <div class="day-name">${dayName}</div>
-            <div class="day-meta">
-              <span>${eventCount} event${eventCount !== 1 ? 's' : ''}</span>
-              <button class="add-event-link" @click=${() => this._addEvent(day)}>+ Add</button>
-            </div>
+          <div class="day-name">${dayName}</div>
+          <div class="day-card-tools">
+            ${forecast ? html`
+              <div class="day-weather">
+                ${weatherIcon(forecast.condition as any)}
+                <span class="day-weather-temp">${Math.round(forecast.tempHigh)}°/${Math.round(forecast.tempLow)}°</span>
+              </div>
+            ` : nothing}
+            <button class="add-btn" type="button" aria-label=${newEventLabel(day, new Date())} title="New event"
+              @click=${() => this._addEvent(day)}>
+              <ha-icon icon="mdi:plus"></ha-icon>
+            </button>
           </div>
-          ${forecast ? html`
-            <div class="day-weather">
-              ${weatherIcon(forecast.condition as any)}
-              <span class="day-weather-temp">${Math.round(forecast.tempHigh)}°/${Math.round(forecast.tempLow)}°</span>
-            </div>
-          ` : nothing}
         </div>
         ${dayEvents.length > 0 ? html`
           <div class="day-card-events">
@@ -294,7 +298,7 @@ export class PVViewWeek extends LitElement {
             `)}
           </div>
         ` : html`
-          <div class="day-card-empty">No events</div>
+          <div class="day-card-empty">Nothing planned</div>
         `}
       </div>
     `;
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
index a700681..ebc5208 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
@@ -6,12 +6,7 @@ import { CalendarEvent, CalendarConfig, WeatherCondition } from '../../../types'
 import { baseStyles, animationStyles, buttonStyles } from '../../../styles/shared';
 import { statusStyles } from '../../../styles/status';
 import type { Layout } from '../../../core/layout';
-import {
-  formatDate,
-  getRelativeLabel,
-  getDateKey,
-  isToday,
-} from '../../../utils/date-utils';
+import { getDateKey, isToday } from '../../../utils/date-utils';
 import {
   compareEventsForDisplay,
   groupEventsByDate,
@@ -21,6 +16,8 @@ import {
 } from '../utils/event-utils';
 import { weatherIcon } from '../../../utils/weather-icons';
 import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
+import { dayOfStatus, eventStatus } from '../event-words';
+import { agendaNote, newEventLabel } from '../view-words';
 
 const DAYS_PER_PAGE = 14;
 const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
@@ -80,9 +77,10 @@ export class PVViewAgenda extends LitElement {
 
       .day-card-header {
         display: flex;
-        align-items: baseline;
+        align-items: center;
         justify-content: space-between;
-        padding: 0.625rem 0.75rem 0.375rem;
+        min-height: 48px;
+        padding: 0 0 0 0.75rem;
         border-bottom: 1px solid var(--pv-border-subtle);
         position: sticky;
         top: 0;
@@ -96,9 +94,12 @@ export class PVViewAgenda extends LitElement {
         gap: 0.5rem;
       }
 
+      /* Headings and numbers in the rounded face (spec 11.2). */
       .day-name {
+        font-family: var(--pv-font-heading, inherit);
         font-size: 1.0625rem;
-        font-weight: 700;
+        font-weight: 800;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
       }
 
@@ -107,50 +108,56 @@ export class PVViewAgenda extends LitElement {
       }
 
       .day-relative {
-        font-size: 0.75rem;
-        color: var(--pv-text-muted);
-        font-weight: 400;
+        font-size: 0.8125rem;
+        color: var(--pv-text-secondary);
+        font-weight: 600;
       }
 
-      .day-weather {
+      .day-card-tools {
         display: flex;
         align-items: center;
-        gap: 0.25rem;
-        font-size: 0.6875rem;
-        color: var(--pv-text-secondary);
+        gap: 2px;
       }
 
-      .day-weather svg {
-        width: 20px;
-        height: 20px;
+      /* New event on that day: a 48 px target (spec 11.8). */
+      .add-btn {
+        display: grid;
+        place-items: center;
+        width: 48px;
+        height: 48px;
+        padding: 0;
+        border: none;
+        border-radius: 50%;
+        background: transparent;
+        color: var(--pv-accent-ink, var(--pv-accent));
+        cursor: pointer;
+        --mdc-icon-size: 22px;
       }
 
-      .day-weather-temps {
-        font-weight: 500;
+      .add-btn:hover {
+        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
       }
 
-      .day-subheader {
+      .add-btn:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: -4px;
+      }
+
+      .day-weather {
         display: flex;
         align-items: center;
-        justify-content: space-between;
-        padding: 0.25rem 0.75rem 0.375rem;
+        gap: 0.25rem;
         font-size: 0.6875rem;
-        color: var(--pv-text-muted);
+        color: var(--pv-text-secondary);
       }
 
-      .add-event-link {
-        color: var(--pv-accent-ink, var(--pv-accent));
-        cursor: pointer;
-        font-weight: 500;
-        font-size: 0.6875rem;
-        background: none;
-        border: none;
-        padding: 0;
-        font-family: inherit;
+      .day-weather svg {
+        width: 20px;
+        height: 20px;
       }
 
-      .add-event-link:hover {
-        text-decoration: underline;
+      .day-weather-temps {
+        font-weight: 500;
       }
 
       .day-events {
@@ -162,10 +169,9 @@ export class PVViewAgenda extends LitElement {
 
       .empty-day {
         color: var(--pv-text-muted);
-        font-size: 0.75rem;
+        font-size: 0.875rem;
         padding: 0.75rem;
         text-align: center;
-        font-style: italic;
       }
 
       .load-more {
@@ -174,7 +180,9 @@ export class PVViewAgenda extends LitElement {
         justify-content: center;
         flex-shrink: 0;
         gap: 0.5rem;
+        min-height: 48px;
         padding: 1rem;
+        font-family: inherit;
         margin: 0 0.75rem 0.75rem;
         background: var(--pv-card-bg, #fff);
         border-radius: var(--pv-radius-md, 12px);
@@ -196,8 +204,6 @@ export class PVViewAgenda extends LitElement {
       @media (max-width: 479px) {
         .day-card { margin: 0 0.5rem 0.5rem; }
         .day-name { font-size: 0.9375rem; }
-        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
-        .day-subheader { padding: 0.125rem 0.625rem 0.25rem; }
       }
 
       /* MD+: constrain width */
@@ -208,7 +214,6 @@ export class PVViewAgenda extends LitElement {
       /* LG: large screens */
       @media (min-width: 1024px) {
         .day-name { font-size: 1.125rem; }
-        .day-card-header { padding: 0.75rem 1rem 0.5rem; }
         .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
       }
 
@@ -219,9 +224,6 @@ export class PVViewAgenda extends LitElement {
         .day-relative { font-size: 1rem; }
         .day-weather svg { width: 32px; height: 32px; }
         .day-weather-temps { font-size: 0.9375rem; }
-        .day-subheader { font-size: 0.9375rem; }
-        .add-event-link { font-size: 0.9375rem; }
-        .day-card-header { padding: 0.875rem 1.125rem 0.5rem; }
         .day-events { padding: 0.75rem 1rem 1rem; gap: 0.625rem; }
         .load-more { font-size: 1.125rem; padding: 1.25rem; }
       }
@@ -229,13 +231,13 @@ export class PVViewAgenda extends LitElement {
   ];
 
   render() {
-    const today = new Date();
-    today.setHours(0, 0, 0, 0);
+    // The list starts on the day shown, so Previous, Next, and Today move it.
+    const start = new Date(this.currentDate);
+    start.setHours(0, 0, 0, 0);
 
-    // Build day list: today + N days forward
     const days: Date[] = [];
     for (let i = 0; i < this._daysLoaded; i++) {
-      const d = new Date(today);
+      const d = new Date(start);
       d.setDate(d.getDate() + i);
       days.push(d);
     }
@@ -267,10 +269,8 @@ export class PVViewAgenda extends LitElement {
 
     return html`
       <div class="agenda-container">
-        ${days.map(day => this._renderDayCard(day, grouped, forecast))}
-        <div class="load-more" @click=${this._loadMore}>
-          Load more days
-        </div>
+        ${days.map((day, i) => this._renderDayCard(day, grouped, forecast, i === 0))}
+        <button class="load-more" type="button" @click=${this._loadMore}>Show more days</button>
       </div>
     `;
   }
@@ -279,13 +279,14 @@ export class PVViewAgenda extends LitElement {
     day: Date,
     grouped: Map<string, CalendarEvent[]>,
     forecast: Map<string, DayForecast>,
+    first: boolean,
   ) {
     const key = getDateKey(day);
     const events = (grouped.get(key) || []) as SharedEvent[];
     const today = isToday(day);
     const dayForecast = forecast.get(key);
-    const relativeLabel = getRelativeLabel(day);
-    const fullDate = formatDate(day, 'long');
+    const now = new Date(this.tick ? this.tick * 60000 : Date.now());
+    const note = agendaNote(day, new Date(now.getFullYear(), now.getMonth(), now.getDate()), first);
 
     // Sort: all-day first, then by start time
     const sorted = [...events].sort(compareEventsForDisplay);
@@ -297,20 +298,20 @@ export class PVViewAgenda extends LitElement {
             <span class="day-name ${today ? 'day-name--today' : ''}">
               ${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}
             </span>
-            ${relativeLabel
-              ? html`<span class="day-relative">${relativeLabel}</span>`
-              : html`<span class="day-relative">${fullDate}</span>`}
+            ${note ? html`<span class="day-relative">${note}</span>` : nothing}
+          </div>
+          <div class="day-card-tools">
+            ${dayForecast ? html`
+              <div class="day-weather">
+                ${weatherIcon(dayForecast.condition as WeatherCondition, 20)}
+                <span class="day-weather-temps">${Math.round(dayForecast.tempHigh)}°/${Math.round(dayForecast.tempLow)}°</span>
+              </div>
+            ` : nothing}
+            <button class="add-btn" type="button" aria-label=${newEventLabel(day, now)} title="New event"
+              @click=${() => this._addEvent(day)}>
+              <ha-icon icon="mdi:plus"></ha-icon>
+            </button>
           </div>
-          ${dayForecast ? html`
-            <div class="day-weather">
-              ${weatherIcon(dayForecast.condition as WeatherCondition, 20)}
-              <span class="day-weather-temps">${Math.round(dayForecast.tempHigh)}°/${Math.round(dayForecast.tempLow)}°</span>
-            </div>
-          ` : nothing}
-        </div>
-        <div class="day-subheader">
-          <span>${sorted.length} event${sorted.length !== 1 ? 's' : ''}</span>
-          <button class="add-event-link" @click=${() => this._addEvent(day)}>+ Add event</button>
         </div>
         <div class="day-events">
           ${sorted.length > 0
@@ -322,10 +323,11 @@ export class PVViewAgenda extends LitElement {
                   .timeFormat=${this.timeFormat}
                   .showStripes=${this.showStripes}
                   .tick=${this.tick}
+                  .badge=${today ? eventStatus(event, now) : dayOfStatus(event, day)}
                   @event-click=${(e: CustomEvent) => { e.stopPropagation(); this._onEventClick(e.detail.event); }}
                 ></pv-event-chip>
               `)
-            : html`<div class="empty-day">No events</div>`
+            : html`<div class="empty-day">Nothing planned</div>`
           }
         </div>
       </div>
```

- [ ] **Step 6: Month and Day in the rounded face; Day's All day and next-day button.**

`custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
index 9ec9899..04da026 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
@@ -50,9 +50,12 @@ export class PVViewMonth extends LitElement {
         height: 100%;
       }
 
+      /* Headings and numbers in the rounded face (spec 11.2). */
       .month-name {
+        font-family: var(--pv-font-heading, inherit);
         font-size: 1.125rem;
-        font-weight: 700;
+        font-weight: 800;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
         padding: 0.5rem 0.75rem;
         text-align: center;
@@ -111,8 +114,10 @@ export class PVViewMonth extends LitElement {
       }
 
       .day-number {
+        font-family: var(--pv-font-heading, inherit);
         font-size: 0.8125rem;
-        font-weight: 400;
+        font-weight: 600;
+        font-variant-numeric: tabular-nums;
         color: var(--pv-text);
         margin-bottom: 0.125rem;
         padding: 0.125rem 0.25rem;
@@ -131,7 +136,7 @@ export class PVViewMonth extends LitElement {
         display: flex;
         align-items: center;
         justify-content: center;
-        font-weight: 600;
+        font-weight: 800;
       }
 
       .day-events {
@@ -140,13 +145,14 @@ export class PVViewMonth extends LitElement {
         gap: 1px;
       }
 
+      /* Inside the cell, which is the day's whole target (spec 11.8). */
       .more-events {
         line-height: 1.2;
-        font-size: 0.625rem;
+        font-size: 0.75rem;
         color: var(--pv-text-secondary);
         padding: 0 0.375rem;
         cursor: pointer;
-        font-weight: 500;
+        font-weight: 600;
       }
 
       .more-events:hover {
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index ef7174c..a243b56 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -111,6 +111,21 @@ export class PVViewDay extends LitElement {
         padding: 0 0.5rem;
       }
 
+      /* Names and the date in the rounded face (spec 11.2). */
+      .person-name,
+      .date-banner {
+        font-family: var(--pv-font-heading, inherit);
+        font-weight: 700;
+      }
+
+      .next-day-footer {
+        width: 100%;
+        min-height: 48px;
+        border: none;
+        font-family: var(--pv-font-heading, inherit);
+        font-weight: 700;
+      }
+
       .all-day-chip:focus-visible,
       .positioned-event:focus-visible {
         outline: 2px solid var(--pv-accent-ink, #5B5BD6);
@@ -683,7 +698,7 @@ export class PVViewDay extends LitElement {
       <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
         ${allDayEvents.length > 0 ? html`
           <div class="all-day-section">
-            <div class="all-day-gutter">All Day</div>
+            <div class="all-day-gutter">All day</div>
             <div class="all-day-events">
               ${allDayEvents.map(e => html`
                 <div
@@ -822,10 +837,10 @@ export class PVViewDay extends LitElement {
       day: 'numeric',
     });
     return html`
-      <div class="next-day-footer" @click=${this._goToNextDay}>
+      <button class="next-day-footer" type="button" aria-label="Go to ${label}" @click=${this._goToNextDay}>
         ${label}
         <ha-icon icon="mdi:arrow-down"></ha-icon>
-      </div>
+      </button>
     `;
   }
 
```

- [ ] **Step 7: The toolbar: 48 px controls, New event, named arrows, and a keyboard-ready filter.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 1a30fc1..fcc7007 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -25,6 +25,7 @@ import { parentAccess } from '../../core/access';
 import { OPEN_SETTINGS } from '../../core/page-host';
 import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
 import { calendarSkeleton, skeletonStyles } from './components/calendar-skeleton';
+import { navLabels } from './view-words';
 
 import './components/view-day';
 import './components/view-week';
@@ -148,7 +149,7 @@ export class PvCalendarModule extends LitElement {
         cursor: pointer;
         transition: all 200ms ease;
         font-family: inherit;
-        min-height: 40px;
+        min-height: 48px;
         -webkit-tap-highlight-color: transparent;
       }
 
@@ -286,7 +287,8 @@ export class PvCalendarModule extends LitElement {
         transition: all 200ms ease;
         white-space: nowrap;
         -webkit-tap-highlight-color: transparent;
-        min-height: 40px;
+        min-height: 48px;
+        --mdc-icon-size: 20px;
       }
 
       .pvc-new-btn:hover {
@@ -310,8 +312,8 @@ export class PvCalendarModule extends LitElement {
         display: flex;
         align-items: center;
         justify-content: center;
-        width: 40px;
-        height: 40px;
+        width: 48px;
+        height: 48px;
         border: none;
         border-radius: 50%;
         background: transparent;
@@ -339,7 +341,7 @@ export class PvCalendarModule extends LitElement {
         cursor: pointer;
         transition: all 200ms ease;
         font-family: inherit;
-        min-height: 38px;
+        min-height: 48px;
         -webkit-tap-highlight-color: transparent;
       }
 
@@ -370,8 +372,8 @@ export class PvCalendarModule extends LitElement {
         display: flex;
         align-items: center;
         justify-content: center;
-        width: 40px;
-        height: 40px;
+        width: 48px;
+        height: 48px;
         border: none;
         border-radius: 50%;
         background: transparent;
@@ -448,7 +450,8 @@ export class PvCalendarModule extends LitElement {
         display: inline-flex;
         align-items: center;
         gap: 4px;
-        padding: 4px 10px 4px 4px;
+        min-height: 48px;
+        padding: 4px 12px 4px 8px;
         border-radius: 9999px;
         border: 1.5px solid var(--chip-color, var(--pv-border));
         background: transparent;
@@ -755,12 +758,16 @@ export class PvCalendarModule extends LitElement {
 
   private _renderToolbar(calendars: CalendarConfig[]) {
     const hiddenCount = calendars.filter(c => this._pv.store.hiddenCalendars.has(c.entity_id)).length;
+    const arrows = navLabels(this._pv.store.currentView);
 
     return html`
       <div class="pvc-toolbar">
         <div class="pvc-filter-wrap">
           <button
             class="pvc-filter-btn ${hiddenCount > 0 ? 'has-hidden' : ''}"
+            type="button"
+            aria-expanded=${this._filterOpen ? 'true' : 'false'}
+            aria-label=${hiddenCount > 0 ? `Calendars, ${calendars.length - hiddenCount} of ${calendars.length} shown` : 'Calendars'}
             @click=${this._toggleFilterDropdown}
           >
             <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
@@ -780,7 +787,11 @@ export class PvCalendarModule extends LitElement {
                   <div
                     class="pvc-filter-item ${isActive ? 'active' : ''}"
                     style="--item-color: ${cal.color}; --item-ink: ${contrastText(cal.color)}"
+                    role="checkbox"
+                    tabindex="0"
+                    aria-checked=${isActive ? 'true' : 'false'}
                     @click=${() => this._pv.store.toggleCalendar(cal.entity_id)}
+                    @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._pv.store.toggleCalendar(cal.entity_id); } }}
                   >
                     <div class="pvc-filter-check">
                       ${isActive ? html`<span class="pvc-filter-check-icon">✓</span>` : nothing}
@@ -809,6 +820,8 @@ export class PvCalendarModule extends LitElement {
             return html`
               <button
                 class="pvc-cal-chip ${isActive ? 'active' : ''}"
+                type="button"
+                aria-pressed=${isActive ? 'true' : 'false'}
                 style="--chip-color: ${cal.color}; --chip-ink: ${contrastText(cal.color)}"
                 @click=${() => this._pv.store.toggleCalendar(cal.entity_id)}
               >
@@ -825,18 +838,21 @@ export class PvCalendarModule extends LitElement {
         </div>
 
         <div class="pvc-controls">
-          <button class="pvc-new-btn" @click=${() => this._pv.store.openCreateDialog()}>
-            + New
+          <button class="pvc-new-btn" type="button" @click=${() => this._pv.store.openCreateDialog()}>
+            <ha-icon icon="mdi:plus"></ha-icon>
+            New event
           </button>
 
           <div class="pvc-nav">
-            <button class="pvc-nav-btn" @click=${() => this._pv.store.navigateDate('prev')}>
+            <button class="pvc-nav-btn" type="button" aria-label=${arrows.prev} title=${arrows.prev}
+              @click=${() => this._pv.store.navigateDate('prev')}>
               <ha-icon icon="mdi:chevron-left"></ha-icon>
             </button>
-            <button class="pvc-today-btn" @click=${() => this._pv.store.navigateDate('today')}>
+            <button class="pvc-today-btn" type="button" @click=${() => this._pv.store.navigateDate('today')}>
               Today
             </button>
-            <button class="pvc-nav-btn" @click=${() => this._pv.store.navigateDate('next')}>
+            <button class="pvc-nav-btn" type="button" aria-label=${arrows.next} title=${arrows.next}
+              @click=${() => this._pv.store.navigateDate('next')}>
               <ha-icon icon="mdi:chevron-right"></ha-icon>
             </button>
           </div>
```

- [ ] **Step 8: The calendar's Settings pages follow the copy rules.**

`custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts b/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
index 43c817e..264df7c 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
@@ -89,8 +89,8 @@ export class PvCalendarCalendarsPage extends LitElement {
     if (this._rows.length === 0) {
       return html`
         <div class="page-content">
-          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
-          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
+          <p class="page-subtitle">Home Assistant has no calendars yet.</p>
+          <p class="empty-hint">Add one in Settings, Devices and services (Google Calendar, CalDAV, or Local Calendar), and it shows up here.</p>
         </div>
       `;
     }
@@ -185,13 +185,13 @@ export class PvCalendarCalendarsPage extends LitElement {
           <div class="cal-details">
             <!-- Display name input -->
             <div class="cal-field">
-              <label class="pv-label" for="cal-name-${idx}">Display Name</label>
+              <label class="pv-label" for="cal-name-${idx}">Name</label>
               <input
                 id="cal-name-${idx}"
                 type="text"
                 class="pv-input cal-name-input"
                 .value=${cal.display_name}
-                placeholder="Calendar name"
+                placeholder="Name on the calendar"
                 @input=${(e: Event) => this._updateCalendar(idx, { display_name: (e.target as HTMLInputElement).value }, false)}
                 @change=${() => this._save()}
               />
@@ -209,14 +209,14 @@ export class PvCalendarCalendarsPage extends LitElement {
 
             <!-- Person entity link -->
             <div class="cal-field">
-              <label class="pv-label" for="cal-person-${idx}">Link to Person</label>
+              <label class="pv-label" for="cal-person-${idx}">Home Assistant person</label>
               <select
                 id="cal-person-${idx}"
                 class="pv-input pv-select cal-person-select"
                 .value=${cal.person_entity}
                 @change=${(e: Event) => this._updateCalendar(idx, { person_entity: (e.target as HTMLSelectElement).value })}
               >
-                <option value="">(None)</option>
+                <option value="">None</option>
                 ${this._personEntities.map(p => html`
                   <option value="${p}" ?selected=${cal.person_entity === p}>${this._personLabel(p)}</option>
                 `)}
```

`custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts b/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
index 052b18f..c64949f 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
@@ -64,26 +64,26 @@ export class PvCalendarOptionsPage extends LitElement {
   private _renderPreferences() {
     return html`
       <div class="page-content">
-        <!-- Time Format -->
+        <!-- Time format -->
         <div class="field-group">
-          <label class="pv-label">Time Format</label>
+          <label class="pv-label">Time format</label>
           <div class="pill-group" role="group" aria-label="Time format">
             <button
               class="pill-btn ${this._draft.time_format === '12h' ? 'pill-btn--active' : ''}"
               type="button"
               @click=${() => { this._apply({ time_format: '12h' }); }}
-            >12h</button>
+            >12-hour</button>
             <button
               class="pill-btn ${this._draft.time_format === '24h' ? 'pill-btn--active' : ''}"
               type="button"
               @click=${() => { this._apply({ time_format: '24h' }); }}
-            >24h</button>
+            >24-hour</button>
           </div>
         </div>
 
-        <!-- First Day of Week -->
+        <!-- First day of the week -->
         <div class="field-group">
-          <label class="pv-label">First Day of Week</label>
+          <label class="pv-label">First day of the week</label>
           <div class="pill-group" role="group" aria-label="First day of week">
             <button
               class="pill-btn ${this._draft.first_day === 'sunday' ? 'pill-btn--active' : ''}"
@@ -98,25 +98,25 @@ export class PvCalendarOptionsPage extends LitElement {
           </div>
         </div>
 
-        <!-- Weather Entity -->
+        <!-- Weather -->
         <div class="field-group">
-          <label class="pv-label" for="weather-select">Weather Entity</label>
+          <label class="pv-label" for="weather-select">Weather</label>
           <select
             id="weather-select"
             class="pv-input pv-select"
             .value=${this._draft.weather_entity}
             @change=${(e: Event) => { this._apply({ weather_entity: (e.target as HTMLSelectElement).value }); }}
           >
-            <option value="">(None)</option>
+            <option value="">None</option>
             ${this._weatherEntities.map(e => html`
               <option value="${e}" ?selected=${this._draft.weather_entity === e}>${this._entityLabel(e)}</option>
             `)}
           </select>
         </div>
 
-        <!-- Default View -->
+        <!-- Default view -->
         <div class="field-group">
-          <label class="pv-label">Default View</label>
+          <label class="pv-label">Default view</label>
           <div class="view-grid" role="group" aria-label="Default calendar view">
             ${([
               { key: 'day', label: 'Day', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' },
```

- [ ] **Step 9: Run the task's tests.** `npx vitest run test/view-words.test.ts test/event-words.test.ts` Expected: PASS, `24 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `771 passed`.

- [ ] **Step 10: Check it on the dev Home Assistant** at 800 by 1280: Week shows the rounded range and days, a + in each day's header, and "Nothing planned"; Agenda shows "Sun 11 Today", "Mon 12 Tomorrow", "Tue 13" alone, Day 2 of 3 on Sunday's Weekend trip and Day 3 of 3 on Monday's.

- [ ] **Step 11: Commit.** `git add` the files above; message:

```text
feat(calendar): rounded headings, the status map, the copy rules, and 48 px targets

The calendar's headings and numbers take the rounded face with tabular
figures: Week's range and days, Month's title and day numbers, Agenda's
days, and the Day view's names and date. Agenda's events say Now, In 10
min in amber before they start, and Day 2 of 3 through a trip, and the
list starts on the day shown, so Previous, Next, and Today move it. The
words follow the copy rules: New event everywhere, no "0 events" or
"Tue 13 Tuesday", "Nothing planned" for an empty day, and sentence case
in the calendar's Settings. Every toolbar control, each day's add
button, the phone's person chips, and the next-day link are 48 px
targets, the arrows say which way they go, and the Calendars filter
works from the keyboard.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 6: The calendar sizes itself from the card, not the window

Spec 12.1 (the card measures itself) and DESIGN_SYSTEM 2.1 ("they move to the card's own size in milestone 7").

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`
- Delete: `custom_components/planavista/frontend/src/styles/responsive.ts`
- Test: `custom_components/planavista/frontend/test/calendar-sizes.test.ts`

**Interfaces:**
- Produces: the container `pv-calendar` on `.pvc-frame` in `pv-calendar-module` (the toolbar, banners, and views; the sheets render after it closes, marked `<!-- .pvc-frame -->`); every former width media query in the calendar is `@container pv-calendar (...)`; window-height queries stay `@media`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/calendar-sizes.test.ts` (new):

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8');
const COMPONENTS = '../src/modules/calendar/components/';
const FILES = [
  '../src/modules/calendar/calendar-module.ts',
  ...readdirSync(new URL(COMPONENTS, import.meta.url)).filter(name => name.endsWith('.ts')).map(name => COMPONENTS + name),
];

describe("the calendar's sizes", () => {
  // DESIGN_SYSTEM 2.1: the card measures itself, so a narrow card on a wide screen gets narrow sizes.
  it.each(FILES)('%s sizes itself from the card, not the window', path => {
    expect(read(path)).not.toMatch(/@media[^{]*\((min|max)-width/);
  });

  it('measures a frame the sheets sit outside of, so they still cover the screen', () => {
    const module = read('../src/modules/calendar/calendar-module.ts');
    expect(module).toMatch(/\.pvc-frame\s*\{[^}]*container:\s*pv-calendar\s*\/\s*inline-size/);
    expect(module).not.toMatch(/:host\s*\{[^}]*container/);
    // The sheets render after the frame closes, never inside it.
    const frame = module.slice(module.indexOf('<div class="pvc-frame">'));
    expect(frame.indexOf('<pv-event-popup')).toBeGreaterThan(frame.indexOf('</div><!-- .pvc-frame -->'));
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/calendar-sizes.test.ts` Expected: FAIL: six files still have window-width media queries, and there is no `.pvc-frame`.

- [ ] **Step 3: The frame, and the toolbar's sizes against it.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index fcc7007..241df02 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -115,6 +115,16 @@ export class PvCalendarModule extends LitElement {
         min-height: 0;
       }
 
+      /* The card measures itself (DESIGN_SYSTEM 2.1): the toolbar and the views size
+         against this frame's width. The sheets sit outside it, so it never holds them in. */
+      .pvc-frame {
+        display: flex;
+        flex-direction: column;
+        flex: 1 1 auto;
+        min-height: 0;
+        container: pv-calendar / inline-size;
+      }
+
 /* ================================================================
          TOOLBAR: avatars left, controls right
          ================================================================ */
@@ -503,7 +513,7 @@ export class PvCalendarModule extends LitElement {
 
 /* lg: large desktops / small wall displays (1024–1439px), scale up ~20% */
 
-      @media (min-width: 1024px){
+      @container pv-calendar (min-width: 1024px){
         .pvc-toolbar { padding: 14px 20px; gap: 10px; }
         .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
         .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
@@ -513,7 +523,7 @@ export class PvCalendarModule extends LitElement {
 
 /* xl: wall-mounted touch displays (1440px+, 27"+), scale up ~40% */
 
-      @media (min-width: 1440px){
+      @container pv-calendar (min-width: 1440px){
         .pvc-toolbar { padding: 16px 24px; gap: 12px; }
         .pvc-filter-btn { padding: 12px 24px; font-size: 1.125rem; min-height: 56px; }
         .pvc-filter-badge { min-width: 24px; height: 24px; font-size: 0.8125rem; }
@@ -651,6 +661,7 @@ export class PvCalendarModule extends LitElement {
     const banners = screen === 'ready' ? bannersOf({ connected: this.hass.connected !== false, calendars, hidden }) : [];
 
     return html`
+      <div class="pvc-frame">
       ${screen === 'no-calendars' || screen === 'unavailable' ? nothing : this._renderToolbar(calendars)}
       ${banners.map(banner => html`
         <div class="banner" role="status">
@@ -670,6 +681,7 @@ export class PvCalendarModule extends LitElement {
       >
         ${screen === 'ready' ? this._renderView(store.currentView, visibleEvents, calendars, display) : this._renderScreen(screen, calendars)}
       </div>
+      </div><!-- .pvc-frame -->
 
       ${this._details.value ? keyed(this._detailsMount, html`
         <pv-event-popup
```

- [ ] **Step 4: The views and the chip measure the frame** (in the Day view, the event title and time sizes now name `.positioned-event`, so they win over the base rule).

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index a243b56..b0a4447 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -518,28 +518,28 @@ export class PVViewDay extends LitElement {
       /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */
 
       /* xs: phones, hide column headers, compact events */
-      @media (max-width: 479px) {
+      @container pv-calendar (max-width: 479px) {
         .column-headers { display: none; }
         .time-gutter { width: 40px; }
         .all-day-gutter { width: 40px; font-size: 0.5625rem; }
         .time-label { font-size: 0.5625rem; }
         .positioned-event { padding: 3px 6px; }
-        .event-title { font-size: 0.75rem; }
-        .event-time { display: none; }
+        .positioned-event .event-title { font-size: 0.75rem; }
+        .positioned-event .event-time { display: none; }
         .next-day-footer { padding: 10px; font-size: 0.8125rem; }
       }
 
       /* sm: large phones, hide column headers, narrower gutter */
-      @media (min-width: 480px) and (max-width: 767px) {
+      @container pv-calendar (min-width: 480px) and (max-width: 767px) {
         .column-headers { display: none; }
         .time-gutter { width: 48px; }
         .all-day-gutter { width: 48px; }
         .positioned-event { padding: 4px 8px; }
-        .event-title { font-size: 0.875rem; }
+        .positioned-event .event-title { font-size: 0.875rem; }
       }
 
       /* md: tablets, smaller avatars */
-      @media (min-width: 768px) and (max-width: 1023px) {
+      @container pv-calendar (min-width: 768px) and (max-width: 1023px) {
         .person-avatar, .person-initial { width: 48px; height: 48px; font-size: 1.125rem; }
         .person-name { font-size: 0.8125rem; }
       }
@@ -557,29 +557,29 @@ export class PVViewDay extends LitElement {
       }
 
       /* lg: large screens (1024–1439px), scale up ~20% */
-      @media (min-width: 1024px) {
+      @container pv-calendar (min-width: 1024px) {
         .time-gutter { width: 72px; }
         .time-label { font-size: 0.8125rem; }
         .all-day-gutter { width: 72px; font-size: 0.8125rem; }
         .header-gutter { width: 72px; }
         .all-day-chip { font-size: 0.9375rem; min-height: 30px; }
         .positioned-event { min-height: 30px; }
-        .event-title { font-size: 1.0625rem; }
-        .event-time { font-size: 0.9375rem; }
+        .positioned-event .event-title { font-size: 1.0625rem; }
+        .positioned-event .event-time { font-size: 0.9375rem; }
         .person-name { font-size: 1rem; }
         .next-day-footer { font-size: 1.0625rem; }
       }
 
       /* xl: wall displays (1440px+), scale up ~40% */
-      @media (min-width: 1440px) {
+      @container pv-calendar (min-width: 1440px) {
         .time-gutter { width: 84px; }
         .time-label { font-size: 0.9375rem; }
         .all-day-gutter { width: 84px; font-size: 0.9375rem; }
         .header-gutter { width: 84px; }
         .all-day-chip { font-size: 1.0625rem; min-height: 34px; padding: 6px 14px; }
         .positioned-event { min-height: 34px; padding: 8px 12px; }
-        .event-title { font-size: 1.1875rem; }
-        .event-time { font-size: 1.0625rem; }
+        .positioned-event .event-title { font-size: 1.1875rem; }
+        .positioned-event .event-time { font-size: 1.0625rem; }
         .person-avatar, .person-initial { width: 72px; height: 72px; font-size: 1.5rem; }
         .person-name { font-size: 1.125rem; }
         .next-day-footer { font-size: 1.1875rem; padding: 18px; }
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
index 3fb62f6..d150124 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
@@ -180,7 +180,7 @@ export class PVViewWeek extends LitElement {
       /* ═══════════ RESPONSIVE ═══════════ */
 
       /* SM/XS: small screens, tighter cards */
-      @media (max-width: 767px) {
+      @container pv-calendar (max-width: 767px) {
         .day-grid {
           gap: 0.375rem;
           padding: 0 0.5rem 0.5rem;
@@ -192,14 +192,14 @@ export class PVViewWeek extends LitElement {
       }
 
       /* LG: large screens */
-      @media (min-width: 1024px) {
+      @container pv-calendar (min-width: 1024px) {
         .week-label { font-size: 1.0625rem; }
         .day-name { font-size: 1rem; }
         .day-card { min-height: 140px; }
       }
 
       /* XL: wall displays, ~50% larger */
-      @media (min-width: 1440px) {
+      @container pv-calendar (min-width: 1440px) {
         .week-label { font-size: 1.5rem; }
         .day-name { font-size: 1.375rem; }
         .day-weather svg { width: 36px; height: 36px; }
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
index 04da026..24508c3 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
@@ -162,7 +162,7 @@ export class PVViewMonth extends LitElement {
       /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */
 
       /* xs: phones, compact day cells */
-      @media (max-width: 479px) {
+      @container pv-calendar (max-width: 479px) {
         .month-name { font-size: 0.9375rem; padding: 0.375rem 0.5rem; }
         .weekday-name { font-size: 0.5625rem; padding: 0.25rem 0; letter-spacing: 0.02em; }
         .day-number { font-size: 0.6875rem; padding: 0.0625rem 0.125rem; }
@@ -172,7 +172,7 @@ export class PVViewMonth extends LitElement {
       }
 
       /* sm: large phones */
-      @media (min-width: 480px) and (max-width: 767px) {
+      @container pv-calendar (min-width: 480px) and (max-width: 767px) {
         .weekday-name { font-size: 0.625rem; }
         .day-number { font-size: 0.75rem; }
       }
@@ -184,7 +184,7 @@ export class PVViewMonth extends LitElement {
       }
 
       /* lg: large screens (1024–1439px) */
-      @media (min-width: 1024px) {
+      @container pv-calendar (min-width: 1024px) {
         .month-name { font-size: 1.25rem; }
         .weekday-name { font-size: 0.8125rem; padding: 0.625rem 0; }
         .day-number { font-size: 0.9375rem; padding: 0.25rem 0.375rem; }
@@ -193,7 +193,7 @@ export class PVViewMonth extends LitElement {
       }
 
       /* xl: wall displays (1440px+) */
-      @media (min-width: 1440px) {
+      @container pv-calendar (min-width: 1440px) {
         .month-name { font-size: 1.375rem; }
         .weekday-name { font-size: 0.9375rem; padding: 0.75rem 0; }
         .day-number { font-size: 1.0625rem; padding: 0.375rem 0.5rem; }
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
index ebc5208..2c2201f 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
@@ -201,24 +201,24 @@ export class PVViewAgenda extends LitElement {
       /* ═══════════ RESPONSIVE ═══════════ */
 
       /* SM/XS: phones */
-      @media (max-width: 479px) {
+      @container pv-calendar (max-width: 479px) {
         .day-card { margin: 0 0.5rem 0.5rem; }
         .day-name { font-size: 0.9375rem; }
       }
 
       /* MD+: constrain width */
-      @media (min-width: 768px) {
+      @container pv-calendar (min-width: 768px) {
         .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
       }
 
       /* LG: large screens */
-      @media (min-width: 1024px) {
+      @container pv-calendar (min-width: 1024px) {
         .day-name { font-size: 1.125rem; }
         .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
       }
 
       /* XL: wall displays, ~50% larger */
-      @media (min-width: 1440px) {
+      @container pv-calendar (min-width: 1440px) {
         .agenda-container { max-width: 960px; }
         .day-name { font-size: 1.5rem; }
         .day-relative { font-size: 1rem; }
```

`custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
index da061d5..25d3de4 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/pv-event-chip.ts
@@ -167,7 +167,7 @@ export class PVEventChip extends LitElement {
       }
 
       /* Responsive: small screens */
-      @media (max-width: 479px) {
+      @container pv-calendar (max-width: 479px) {
         .chip { padding: 0.375rem 0.5rem; }
         .chip-title { font-size: 0.8125rem; }
         .chip-time { font-size: 0.6875rem; }
@@ -175,7 +175,7 @@ export class PVEventChip extends LitElement {
       }
 
       /* Large screens */
-      @media (min-width: 1024px) {
+      @container pv-calendar (min-width: 1024px) {
         .chip { padding: 0.625rem 0.75rem; }
         .chip-title { font-size: 0.9375rem; }
         .chip-time { font-size: 0.8125rem; }
@@ -183,7 +183,7 @@ export class PVEventChip extends LitElement {
       }
 
       /* XL screens: ~50% larger for wall displays */
-      @media (min-width: 1440px) {
+      @container pv-calendar (min-width: 1440px) {
         .chip { padding: 1rem 1.25rem; gap: 0.75rem; border-left-width: 4px; }
         .chip-title { font-size: 1.375rem; }
         .chip-time { font-size: 1.125rem; }
```

- [ ] **Step 5: Remove the unused window-width helpers.** `git rm custom_components/planavista/frontend/src/styles/responsive.ts`

- [ ] **Step 6: Run the task's tests.** `npx vitest run test/calendar-sizes.test.ts` Expected: PASS, `10 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `781 passed`.

- [ ] **Step 7: Check it on the dev Home Assistant:** at 800 by 1280 the Day view's gutter is 60 px with its headers showing; at a 1700 by 1000 window (a 1444 px card) the toolbar's arrows are 56 px and Week's range title takes its large size; an open sheet still covers the whole screen.

- [ ] **Step 8: Commit.** `git add` the files above and `git rm` the deleted one; message:

```text
feat(calendar): the calendar sizes itself from the card, not the window

The calendar's breakpoints for type, padding, and avatars now measure
the card with container queries, as the header already does, so a
narrow card on a wide screen gets narrow sizes and a wall display's
card gets the large ones. The toolbar and the views measure one frame
the sheets sit outside of, so the sheets still cover the whole screen.
The Day view's sizes for event titles and times now apply (a more
specific rule used to win), and the unused window-width helpers are
gone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 7: Springs for view changes in the calendar and chores

Spec 11.5 ("view changes use the same springs"; reduced motion keeps the meaning; only transform and opacity animate).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/view-motion.ts`
- Modify: `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/view-motion.test.ts`

**Interfaces:**
- Consumes: `SMOOTH`, `springEasing`, `motionOf`, `supportsLinearEasing` from `core/motion.ts`.
- Produces: `ViewChange` (`none`, `switch`, `forward`, `back`), `ViewPlace { view, at }`, `viewChange(prev, next)`, `ViewMotion`, `viewMotion(change, motion, linear)` in `core/view-motion.ts`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/view-motion.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { SMOOTH } from '../src/core/motion';
import { viewChange, viewMotion } from '../src/core/view-motion';

const MON = new Date(2026, 9, 12).getTime();
const TUE = new Date(2026, 9, 13).getTime();

describe('viewChange', () => {
  it("doesn't move the first draw", () => {
    expect(viewChange(null, { view: 'day', at: MON })).toBe('none');
  });

  it('glides another view in, and slides a later or earlier day in from its side', () => {
    expect(viewChange({ view: 'day', at: MON }, { view: 'week', at: MON })).toBe('switch');
    expect(viewChange({ view: 'day', at: MON }, { view: 'day', at: TUE })).toBe('forward');
    expect(viewChange({ view: 'day', at: TUE }, { view: 'day', at: MON })).toBe('back');
    expect(viewChange({ view: 'board', at: 0 }, { view: 'board', at: 0 })).toBe('none');
  });
});

describe('viewMotion', () => {
  it('rides the smooth spring: a short rise for another view, a slide from the side for a step', () => {
    const glide = viewMotion('switch', 'full', true)!;
    expect(glide.keyframes).toEqual([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }]);
    expect(glide.options).toEqual({ duration: SMOOTH.duration, easing: SMOOTH.easing });
    expect(viewMotion('forward', 'full', true)!.keyframes[0]).toEqual({ opacity: 0, transform: 'translateX(32px)' });
    expect(viewMotion('back', 'full', true)!.keyframes[0]).toEqual({ opacity: 0, transform: 'translateX(-32px)' });
  });

  it('keeps the length but uses a plain curve where the browser has no linear() easing', () => {
    const glide = viewMotion('switch', 'full', false)!;
    expect(glide.options.duration).toBe(SMOOTH.duration);
    expect(glide.options.easing).not.toContain('linear(');
  });

  it('fades quickly with reduced motion, and does nothing when nothing changed', () => {
    expect(viewMotion('forward', 'reduced', true)).toEqual({
      keyframes: [{ opacity: 0.4 }, { opacity: 1 }],
      options: { duration: 150, easing: 'ease-out' },
    });
    expect(viewMotion('none', 'full', true)).toBeNull();
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/view-motion.test.ts` Expected: FAIL: `../src/core/view-motion` can't be found.

- [ ] **Step 3: Which change, and how it moves.**

`custom_components/planavista/frontend/src/core/view-motion.ts` (new):

```ts
import { Motion, SMOOTH, springEasing } from './motion';

/**
 * How a screen's content moves when it changes (spec 11.5: view changes use
 * the same springs as everything else): another view glides in, a step to a
 * later or an earlier day, week, or month slides in from that side, and the
 * first draw doesn't move at all.
 */
export type ViewChange = 'none' | 'switch' | 'forward' | 'back';

export interface ViewPlace {
  /** Which view shows (Day, Week, Board...). */
  view: string;
  /** Where in time it shows, as a number that grows forward (a day's start, in ms); 0 when it has none. */
  at: number;
}

export function viewChange(prev: ViewPlace | null, next: ViewPlace): ViewChange {
  if (!prev) return 'none';
  if (prev.view !== next.view) return 'switch';
  if (next.at > prev.at) return 'forward';
  if (next.at < prev.at) return 'back';
  return 'none';
}

export interface ViewMotion {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

const SLIDE_PX = 32;
const RISE_PX = 12;
const FADE_MS = 150;

/**
 * The entrance for a change: the smooth spring at full motion, a quick fade
 * with reduced motion, which keeps the meaning (something new is here)
 * without the movement. Only transform and opacity move, so older wall
 * tablets keep up.
 */
export function viewMotion(change: ViewChange, motion: Motion, linear: boolean): ViewMotion | null {
  if (change === 'none') return null;
  if (motion === 'reduced') {
    return { keyframes: [{ opacity: 0.4 }, { opacity: 1 }], options: { duration: FADE_MS, easing: 'ease-out' } };
  }
  const spring = springEasing(SMOOTH, linear);
  const from = change === 'switch'
    ? `translateY(${RISE_PX}px)`
    : `translateX(${change === 'forward' ? SLIDE_PX : -SLIDE_PX}px)`;
  return {
    keyframes: [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
    options: { duration: spring.duration, easing: spring.easing },
  };
}
```

- [ ] **Step 4: The calendar plays it on its body; the arrows, Today, a swipe, and Month's day tap mark a person's move.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 241df02..94d4bbe 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -26,6 +26,8 @@ import { OPEN_SETTINGS } from '../../core/page-host';
 import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
 import { calendarSkeleton, skeletonStyles } from './components/calendar-skeleton';
 import { navLabels } from './view-words';
+import { ViewPlace, viewChange, viewMotion } from '../../core/view-motion';
+import { motionOf, supportsLinearEasing } from '../../core/motion';
 
 import './components/view-day';
 import './components/view-week';
@@ -83,6 +85,10 @@ export class PvCalendarModule extends LitElement {
   private _progressOf = (memberId: string) => this.services?.chores?.memberProgress?.(memberId) ?? null;
   /** What pv-overlay-change last said, so the card hears each change once. */
   private _overlayOpen = false;
+  /** The view and day last drawn, to tell how the next change moves (spec 11.5). */
+  private _drawn: ViewPlace | null = null;
+  /** When a person last moved the calendar; a midnight rollover or a wake doesn't glide. */
+  private _movedAt = 0;
   /** The event sheet: mounted while the store wants it and while it leaves. */
   private _details: Presence<CalendarEvent> = GONE;
   /** Bumped for each new details sheet, so one reopened mid-exit starts fresh. */
@@ -564,6 +570,26 @@ export class PvCalendarModule extends LitElement {
       this._overlayOpen = open;
       this._fireOverlay(open);
     }
+    this._playViewChange();
+  }
+
+  /** Arrows, Today, and a swipe: a person moving the calendar, so the step slides in. */
+  private _navigate(direction: 'prev' | 'next' | 'today'): void {
+    this._movedAt = performance.now();
+    this._pv.store.navigateDate(direction);
+  }
+
+  /** The springs for view changes (spec 11.5): another view glides in, a step slides in from its side. */
+  private _playViewChange(): void {
+    const store = this._pv.store;
+    const day = new Date(store.currentDate);
+    day.setHours(0, 0, 0, 0);
+    const next: ViewPlace = { view: store.currentView, at: day.getTime() };
+    let change = viewChange(this._drawn, next);
+    this._drawn = next;
+    if ((change === 'forward' || change === 'back') && performance.now() - this._movedAt > 1000) change = 'none';
+    const motion = viewMotion(change, motionOf(this), supportsLinearEasing());
+    if (motion) this.renderRoot.querySelector<HTMLElement>('.pvc-body')?.animate(motion.keyframes, motion.options);
   }
 
   private _fireOverlay(open: boolean): void {
@@ -857,14 +883,14 @@ export class PvCalendarModule extends LitElement {
 
           <div class="pvc-nav">
             <button class="pvc-nav-btn" type="button" aria-label=${arrows.prev} title=${arrows.prev}
-              @click=${() => this._pv.store.navigateDate('prev')}>
+              @click=${() => this._navigate('prev')}>
               <ha-icon icon="mdi:chevron-left"></ha-icon>
             </button>
-            <button class="pvc-today-btn" type="button" @click=${() => this._pv.store.navigateDate('today')}>
+            <button class="pvc-today-btn" type="button" @click=${() => this._navigate('today')}>
               Today
             </button>
             <button class="pvc-nav-btn" type="button" aria-label=${arrows.next} title=${arrows.next}
-              @click=${() => this._pv.store.navigateDate('next')}>
+              @click=${() => this._navigate('next')}>
               <ha-icon icon="mdi:chevron-right"></ha-icon>
             </button>
           </div>
@@ -1003,6 +1029,7 @@ export class PvCalendarModule extends LitElement {
   }
 
   private _onDayClick(e: CustomEvent) {
+    this._movedAt = performance.now();
     this._pv.store.setDate(e.detail.date);
     this.dispatchEvent(new CustomEvent('pv-view-change', { detail: { view: 'day' }, bubbles: true, composed: true }));
   }
@@ -1020,7 +1047,7 @@ export class PvCalendarModule extends LitElement {
     if (!start || e.touches.length > 0 || e.changedTouches.length !== 1) return;
     const end = e.changedTouches[0];
     const direction = swipeDirection(end.clientX - start.x, end.clientY - start.y);
-    if (direction) this._pv.store.navigateDate(direction);
+    if (direction) this._navigate(direction);
   }
 
   private _onTouchCancel() {
```

- [ ] **Step 5: Chores plays it on its view, and Week's weeks slide.**

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 3362394..48ecb59 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -12,6 +12,8 @@ import type { Toast } from '../../core/pv-toast';
 import { memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
 import { OPEN_SETTINGS } from '../../core/page-host';
 import { deepActiveElement } from '../../core/focus';
+import { ViewPlace, viewChange, viewMotion } from '../../core/view-motion';
+import { motionOf, supportsLinearEasing } from '../../core/motion';
 import type { SettingsTarget } from '../../core/settings-registry';
 import type { Mode } from '../../styles/theme-pairs';
 import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../../types';
@@ -103,6 +105,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   @state() private _minute = Math.floor(Date.now() / 60000);
   /** The Week view: how many weeks from this one, what came back, and for which request. */
   @state() private _weekOffset = 0;
+  /** The view (and Week's week) last drawn, to tell how the next change moves (spec 11.5). */
+  private _drawn: ViewPlace | null = null;
   @state() private _week: WeekView | null = null;
   @state() private _weekFailed = false;
   private _weekAsked: string | null = null;
@@ -266,6 +270,16 @@ export class PvChoresModule extends LitElement implements ModuleElement {
       this._overlayOpen = open;
       this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open }, bubbles: true, composed: true }));
     }
+    this._playViewChange();
+  }
+
+  /** The calendar's springs for view changes (spec 11.5): another view glides in, another week slides in from its side. */
+  private _playViewChange(): void {
+    const next: ViewPlace = { view: this.view ?? 'board', at: this.view === 'week' ? this._weekOffset : 0 };
+    const change = viewChange(this._drawn, next);
+    this._drawn = next;
+    const motion = viewMotion(change, motionOf(this), supportsLinearEasing());
+    if (motion) this.renderRoot.querySelector<HTMLElement>('.view')?.animate(motion.keyframes, motion.options);
   }
 
   connectedCallback(): void {
```

- [ ] **Step 6: Run the task's tests.** `npx vitest run test/view-motion.test.ts` Expected: PASS, `5 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `786 passed`.

- [ ] **Step 7: Check it on the dev Home Assistant:** right after picking Month, the calendar's body has an animation starting at `translateY(12px)`; after Next, one at `translateX(32px)`; after Today, one at `translateX(-32px)`; a `setDate` with no button pressed starts none; in Chores, Week after Board starts one at `translateY(12px)`.

- [ ] **Step 8: Commit.** `git add` the files above; message:

```text
feat(card): springs for view changes in the calendar and chores

Switching between Day, Week, Month, and Agenda, or between the chores
views, glides the new view in on the smooth spring, and moving to the
next or previous day, week, or month (the arrows, Today, a swipe, a
week in chores) slides it in from that side. With reduced motion it is
a quick fade. A change nobody made, like the date turning over at
midnight or a screen waking up, just switches.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 8: The portrait header shrinks to one line while the content scrolls

Spec 12.2 ("With many people the big header shrinks to one line as you scroll, like large titles on an iPhone"), deferred from milestone 5.

**Files:**
- Create: `custom_components/planavista/frontend/src/core/content-scroll.ts`
- Modify: `custom_components/planavista/frontend/src/shell/pv-glance-header.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`
- Test: `custom_components/planavista/frontend/test/content-scroll.test.ts`

**Interfaces:**
- Produces: `CONTENT_SCROLL` (`pv-content-scroll`, detail `{ top }`, bubbling and composed), `compactHeader(compact, top)`, `shouldReport(top, msSinceInput)`, `INPUT_WINDOW_MS`, and `ScrollReporter` (bind `attach` with lit's `ref()`, or call it with the element) in `core/content-scroll.ts`; `pv-glance-header` takes `compact` and reflects `shape` (its styles key off `shape`).

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/content-scroll.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { INPUT_WINDOW_MS, compactHeader, shouldReport } from '../src/core/content-scroll';

describe('compactHeader', () => {
  it('shrinks the header once the content is scrolled past 24 px and brings it back under 8 px', () => {
    expect(compactHeader(false, 30)).toBe(true);
    expect(compactHeader(true, 4)).toBe(false);
  });

  it("keeps its shape in between, so a scroll near the top doesn't flicker it", () => {
    expect(compactHeader(false, 16)).toBe(false);
    expect(compactHeader(true, 16)).toBe(true);
  });
});

describe('shouldReport', () => {
  it("tells a person's scroll, and always the way back to the top", () => {
    expect(shouldReport(300, 200)).toBe(true);
    expect(shouldReport(0, Infinity)).toBe(true);
  });

  it("doesn't tell a view scrolling itself (the Day view going to now)", () => {
    expect(shouldReport(300, INPUT_WINDOW_MS + 1)).toBe(false);
    expect(shouldReport(300, Infinity)).toBe(false);
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/content-scroll.test.ts` Expected: FAIL: `../src/core/content-scroll` can't be found.

- [ ] **Step 3: When the header shrinks, and the reporter.**

`custom_components/planavista/frontend/src/core/content-scroll.ts` (new):

```ts
/**
 * Content scrolled under the header (spec 12.2): in portrait the big
 * header shrinks to one line while what's below it is scrolled down, and
 * comes back at the top. Scroll events stop at their shadow root, so each
 * scroller reports how far down it is.
 */
export const CONTENT_SCROLL = 'pv-content-scroll';

export interface ContentScrollDetail {
  top: number;
}

const SHRINK_PX = 24;
const GROW_PX = 8;
/** How long after a person's touch, wheel, or key a scroll still counts as theirs. */
export const INPUT_WINDOW_MS = 1500;

/** Shrink past 24 px and come back under 8 px, so a scroll near the top doesn't flicker it. */
export function compactHeader(compact: boolean, top: number): boolean {
  if (top > SHRINK_PX) return true;
  if (top < GROW_PX) return false;
  return compact;
}

/**
 * Whether a scroll position is worth telling: a person scrolled lately, or
 * it is back at the top. A view scrolling itself (Day to now) doesn't shrink
 * the header.
 */
export function shouldReport(top: number, msSinceInput: number): boolean {
  return top < GROW_PX || msSinceInput < INPUT_WINDOW_MS;
}

/** Tells the card, once a frame, how far down a scroller is while a person scrolls it. Bind `attach` with lit's ref(). */
export class ScrollReporter {
  private _element: HTMLElement | null = null;
  private _inputAt = -Infinity;
  private _frame = 0;

  private readonly _onInput = (): void => {
    this._inputAt = performance.now();
  };

  private readonly _onScroll = (): void => {
    if (this._frame) return;
    this._frame = requestAnimationFrame(() => {
      this._frame = 0;
      const element = this._element;
      if (!element) return;
      const top = element.scrollTop;
      if (!shouldReport(top, performance.now() - this._inputAt)) return;
      element.dispatchEvent(new CustomEvent<ContentScrollDetail>(CONTENT_SCROLL, { detail: { top }, bubbles: true, composed: true }));
    });
  };

  /** For lit's ref(): the scroller, or nothing when it goes. */
  readonly attach = (element?: Element): void => {
    const next = element instanceof HTMLElement ? element : null;
    if (next === this._element) return;
    const prev = this._element;
    if (prev) {
      prev.removeEventListener('scroll', this._onScroll);
      for (const type of ['wheel', 'touchmove', 'pointerdown', 'keydown']) prev.removeEventListener(type, this._onInput);
    }
    this._element = next;
    if (next) {
      next.addEventListener('scroll', this._onScroll, { passive: true });
      for (const type of ['wheel', 'touchmove', 'pointerdown', 'keydown']) next.addEventListener(type, this._onInput, { passive: true });
    }
  };
}
```

- [ ] **Step 4: The header's compact shape, and the card following the reports in portrait.**

`custom_components/planavista/frontend/src/shell/pv-glance-header.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-glance-header.ts b/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
index 6a7cf5c..97a3820 100644
--- a/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
@@ -1,4 +1,4 @@
-import { LitElement, html, css, nothing } from 'lit';
+import { LitElement, html, css, nothing, PropertyValues } from 'lit';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
 import { formatClockParts } from '../utils/date-utils';
@@ -26,6 +26,10 @@ export interface HeaderWeather {
  */
 export class PvGlanceHeader extends LitElement {
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Portrait with the content scrolled down: the header shrinks to one line (spec 12.2). */
+  @property({ type: Boolean }) compact = false;
+  /** The shape drawn: the layout, or the phone's one row for a compact portrait header. Styles key off it. */
+  @property({ type: String, reflect: true }) shape: Layout = 'landscape';
   @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
   /** The weather entity's state, or null for no weather (none set, or hide_weather). */
   @property({ attribute: false }) weather: HeaderWeather | null = null;
@@ -134,31 +138,31 @@ export class PvGlanceHeader extends LitElement {
     }
 
     /* Portrait: a lock-screen clock at the left, the weather at the right. */
-    :host([layout='portrait']) .row {
+    :host([shape='portrait']) .row {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       padding: 16px 20px 12px;
     }
 
-    :host([layout='portrait']) .time {
+    :host([shape='portrait']) .time {
       font-weight: 700;
       font-size: clamp(40px, 6cqi, 60px);
       line-height: 1;
       letter-spacing: -0.5px;
     }
 
-    :host([layout='portrait']) .ampm {
+    :host([shape='portrait']) .ampm {
       font-size: 0.4em;
       letter-spacing: 0;
     }
 
-    :host([layout='portrait']) .date {
+    :host([shape='portrait']) .date {
       font-size: clamp(16px, 2.2cqi, 22px);
       margin-top: 6px;
     }
 
-    :host([layout='portrait']) .temp {
+    :host([shape='portrait']) .temp {
       font-weight: 800;
       font-size: clamp(24px, 3.5cqi, 34px);
       line-height: 1;
@@ -178,11 +182,11 @@ export class PvGlanceHeader extends LitElement {
       min-width: 0;
     }
 
-    :host([layout='portrait']) .chips {
+    :host([shape='portrait']) .chips {
       padding: 0 20px 14px;
     }
 
-    :host([layout='phone']) .chips {
+    :host([shape='phone']) .chips {
       padding: 0 14px 8px;
     }
 
@@ -226,34 +230,45 @@ export class PvGlanceHeader extends LitElement {
     }
 
     /* Phone: one compact row. */
-    :host([layout='phone']) .row {
+    :host([shape='phone']) .row {
       display: flex;
       justify-content: space-between;
       align-items: center;
       padding: 8px 14px;
     }
 
-    :host([layout='phone']) .clock {
+    :host([shape='phone']) .clock {
       display: flex;
       align-items: baseline;
       gap: 8px;
     }
 
-    :host([layout='phone']) .time {
+    :host([shape='phone']) .time {
       font-weight: 700;
       font-size: 22px;
     }
 
-    :host([layout='phone']) .date {
+    :host([shape='phone']) .date {
       font-weight: 700;
       font-size: 14px;
     }
 
-    :host([layout='phone']) .temp {
+    :host([shape='phone']) .temp {
       font-size: 18px;
     }
   `;
 
+  protected willUpdate(): void {
+    this.shape = this.layout === 'portrait' && this.compact ? 'phone' : this.layout;
+  }
+
+  protected updated(changed: PropertyValues): void {
+    // The new shape fades in, so the step to one line (and back) isn't a jump cut.
+    if (changed.has('shape') && changed.get('shape') !== undefined) {
+      this.renderRoot.querySelector('.row')?.animate({ opacity: [0, 1] }, { duration: 150, easing: 'ease-out' });
+    }
+  }
+
   connectedCallback(): void {
     super.connectedCallback();
     this._minute = Math.floor(Date.now() / 60000);
@@ -274,7 +289,7 @@ export class PvGlanceHeader extends LitElement {
     const { time, ampm, date } = formatClockParts(now, this.timeFormat);
     const clock = html`<span class="time">${time}${ampm ? html`<span class="ampm muted">${ampm}</span>` : nothing}</span>`;
     const primary = this.chips.filter(chip => chip.primary);
-    if (this.layout === 'portrait') {
+    if (this.shape === 'portrait') {
       return html`
         <div class="row">
           <div class="clock">${clock}<div class="date">${date}</div></div>
@@ -283,7 +298,7 @@ export class PvGlanceHeader extends LitElement {
         ${this._chips(this.chips)}
       `;
     }
-    if (this.layout === 'phone') {
+    if (this.shape === 'phone') {
       const short = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
       return html`
         <div class="row">
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 1f4d8f6..d79a653 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -48,6 +48,7 @@ import './pv-pin-sheet';
 import './pv-notice-sheet';
 import './settings/pv-settings';
 import './setup/pv-setup';
+import { ContentScrollDetail, compactHeader } from '../core/content-scroll';
 
 /** A sheet the card shows over everything: a PIN, or why there is no way in. */
 type CardSheet =
@@ -84,6 +85,9 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   @state() private _views: Record<string, string> = {};
   /** The module the switcher picked; null for the card's first. */
   @state() private _moduleId: string | null = null;
+  /** Portrait with the content scrolled down: the header shows one line (spec 12.2). */
+  @state() private _compactHeader = false;
+  private _headerLayout: string | null = null;
   /** Where a glance chip or a ring sent the card last (a module and view, perhaps one person). */
   @state() private _openTarget: OpenTarget | null = null;
   /** Bumped whenever a module's service has news, so the modules and the header redraw. */
@@ -384,6 +388,10 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     if (mod && data && !(mod.id in this._views)) {
       this._views = { ...this._views, [mod.id]: initialModuleView(mod, { config: this._config, data }) };
     }
+    // Another view, module, or layout starts at its top, so the header starts tall again.
+    const layout = this._layout.layout;
+    if (changed.has('_views') || changed.has('_moduleId') || layout !== this._headerLayout) this._compactHeader = false;
+    this._headerLayout = layout;
   }
 
   private _setView(id: string): void {
@@ -392,6 +400,12 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     this._views = { ...this._views, [mod.id]: id };
   }
 
+  /** A module's content scrolled: in portrait the header shrinks past the top and grows back at it. */
+  private _onContentScroll = (e: CustomEvent<ContentScrollDetail>): void => {
+    if (this._layout.layout !== 'portrait') return;
+    this._compactHeader = compactHeader(this._compactHeader, e.detail.top);
+  };
+
   connectedCallback(): void {
     super.connectedCallback();
     // The heading face is declared on the page; shadow roots ignore @font-face (spec 11.2).
@@ -763,6 +777,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         .openTarget=${this._openTarget}
         @pv-view-change=${(e: CustomEvent<{ view: string }>) => this._setView(e.detail.view)}
         @pv-overlay-change=${(e: CustomEvent<{ open: boolean }>) => { this._moduleOverlay = e.detail.open; }}
+        @pv-content-scroll=${this._onContentScroll}
         @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
         @pv-open-settings=${this._openSettings}
       ></${tag}>
@@ -774,6 +789,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     return html`
       <pv-glance-header
         layout=${this._layout.layout}
+        ?compact=${this._layout.layout === 'portrait' && this._compactHeader}
         .timeFormat=${display.time_format || '12h'}
         .weather=${weather ?? null}
         .weatherEntity=${display.weather_entity}
```

- [ ] **Step 5: The scrollers report.**

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index b0a4447..7e7afa8 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -18,6 +18,8 @@ import { getPersonAvatar, getPersonName } from '../../../utils/ha-utils';
 import { contrastText } from '../../../core/color';
 import type { Layout } from '../../../core/layout';
 import { HOUR_PX, dayHourHeight, rescaleScroll } from '../layout-rules';
+import { ref } from 'lit/directives/ref.js';
+import { ScrollReporter } from '../../../core/content-scroll';
 
 /** Today's chore progress for one person (spec 13.9: rings in the Day view). */
 export type ProgressOf = (memberId: string) => { done: number; pending: number; due: number } | null;
@@ -55,6 +57,8 @@ export class PVViewDay extends LitElement {
   @property({ type: Number }) tick = 0;
   /** The card's layout: portrait fits about 14 hours on screen (spec 12.2). */
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
   /** Today's chore progress per person, when Chores is on: each column header gets a ring. */
   @property({ attribute: false }) progress: ProgressOf | null = null;
   /** Bumped when chores change, so the rings redraw. */
@@ -774,7 +778,7 @@ export class PVViewDay extends LitElement {
           </div>
         ` : nothing}
 
-        <div class="time-grid-wrapper">
+        <div class="time-grid-wrapper" ${ref(this._scroll.attach)}>
           <div class="time-grid">
             <div class="time-gutter">
               ${this._renderTimeLabels()}
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
index d150124..4247716 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
@@ -16,6 +16,8 @@ import {
 import { newEventLabel } from '../view-words';
 import { weatherIcon } from '../../../utils/weather-icons';
 import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
+import { ref } from 'lit/directives/ref.js';
+import { ScrollReporter } from '../../../core/content-scroll';
 
 const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
@@ -33,6 +35,8 @@ export class PVViewWeek extends LitElement {
   @property({ type: Number }) tick = 0;
   /** The card's layout: four days across in landscape, two in portrait, one on a phone (spec 12.3). */
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
 
 
   static styles = [
@@ -243,7 +247,7 @@ export class PVViewWeek extends LitElement {
     const forecasts = buildForecastMap(this.forecast);
 
     return html`
-      <div class="week-container">
+      <div class="week-container" ${ref(this._scroll.attach)}>
         <div class="week-label">${this._getWeekLabel(days)}</div>
         <div class="day-grid">
           ${days.map(day => this._renderDayCard(day, deduped, forecasts))}
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
index 2c2201f..a7ba941 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-agenda.ts
@@ -18,6 +18,8 @@ import { weatherIcon } from '../../../utils/weather-icons';
 import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
 import { dayOfStatus, eventStatus } from '../event-words';
 import { agendaNote, newEventLabel } from '../view-words';
+import { ref } from 'lit/directives/ref.js';
+import { ScrollReporter } from '../../../core/content-scroll';
 
 const DAYS_PER_PAGE = 14;
 const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
@@ -35,6 +37,8 @@ export class PVViewAgenda extends LitElement {
   @property({ type: Number }) tick = 0;
   /** The card's layout (spec 12.1). */
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
 
   @state() private _daysLoaded = DAYS_PER_PAGE;
 
@@ -253,7 +257,7 @@ export class PVViewAgenda extends LitElement {
     // Nothing in the whole range: one designed state, not a stack of empty days (spec 11.6).
     if (days.every(day => !(grouped.get(getDateKey(day))?.length))) {
       return html`
-        <div class="agenda-container">
+        <div class="agenda-container" ${ref(this._scroll.attach)}>
           <div class="state">
             <div class="art" aria-hidden="true">🗓️</div>
             <h2>Nothing coming up</h2>
@@ -268,7 +272,7 @@ export class PVViewAgenda extends LitElement {
     }
 
     return html`
-      <div class="agenda-container">
+      <div class="agenda-container" ${ref(this._scroll.attach)}>
         ${days.map((day, i) => this._renderDayCard(day, grouped, forecast, i === 0))}
         <button class="load-more" type="button" @click=${this._loadMore}>Show more days</button>
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
index ff81e43..c86e7b7 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
@@ -11,6 +11,8 @@ import type { ColumnEntry, ColumnModel, RowModel } from './board-derive';
 import { bump, flyStars, glide, measure } from './effects';
 import './pv-chore-item';
 import './pv-chore-tile';
+import { ref } from 'lit/directives/ref.js';
+import { ScrollReporter } from '../../core/content-scroll';
 
 /** The most stickers a strip draws before it says "+5". */
 const STICKERS = 20;
@@ -25,6 +27,9 @@ const STICKERS = 20;
  * @fires pv-member-open - { member } the header was tapped
  */
 export class PvChoresColumn extends LitElement {
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
+
   @property({ attribute: false }) model!: ColumnModel;
   @property({ attribute: false }) hass?: HomeAssistant;
   /** The person's color for the mode (their ring, checks, and tints). */
@@ -274,7 +279,7 @@ export class PvChoresColumn extends LitElement {
         </span>
       </button>
       ${model.next ? html`<div class="next">${this._next(model.next)}</div>` : nothing}
-      <div class="body">
+      <div class="body" ${ref(this._scroll.attach)}>
         ${model.away ? html`<div class="away">🧳 Away${model.away.note ? ` · ${model.away.note}` : ''}. Nothing is due, and the streak keeps.</div>` : nothing}
         ${model.ring.closed && !model.entries.some(e => e.kind === 'row' && (e.zone === 'now' || e.zone === 'later' || e.zone === 'overdue'))
           ? html`<div class="closed"><strong>Ring closed for today</strong><span>Everything due today is done. Nice work.</span></div>`
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index 5026ca1..a6e13a4 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -23,6 +23,7 @@ import {
 import { pictureOf } from './pv-chore-tile';
 import './pv-chore-item';
 import './pv-chore-tile';
+import { ScrollReporter } from '../../core/content-scroll';
 
 export type MyDayStyle = 'timeline' | 'list' | 'pictures';
 const STYLES: Array<{ id: MyDayStyle; label: string }> = [
@@ -42,6 +43,9 @@ const STYLES: Array<{ id: MyDayStyle; label: string }> = [
  * @fires pv-my-day-style - { member, style } a style was picked
  */
 export class PvChoresMyDay extends LitElement {
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
+
   @property({ attribute: false }) column!: ColumnModel;
   @property({ attribute: false }) columns: ColumnModel[] = [];
   @property({ attribute: false }) board!: Board;
@@ -415,6 +419,16 @@ export class PvChoresMyDay extends LitElement {
     return style === 'list' || style === 'pictures' ? style : 'timeline';
   }
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this._scroll.attach(this);
+  }
+
+  disconnectedCallback(): void {
+    super.disconnectedCallback();
+    this._scroll.attach(undefined);
+  }
+
   render() {
     const column = this.column;
     if (!column) return nothing;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index 5cb8a96..d8c455d 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -9,6 +9,7 @@ import '../../core/pv-member-avatar';
 import { choresStyles } from './chores-styles';
 import type { Balance, RewardCard } from './rewards-derive';
 import { pictureOf } from './pv-chore-tile';
+import { ScrollReporter } from '../../core/content-scroll';
 
 /**
  * pv-chores-rewards: what stars are for (spec 13.6). Balances and goals on
@@ -20,6 +21,9 @@ import { pictureOf } from './pv-chore-tile';
  * @fires pv-reward-open - { reward } a card was tapped (its sheet), or { reward: null } for Add a reward
  */
 export class PvChoresRewards extends LitElement {
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
+
   @property({ attribute: false }) balances: Balance[] = [];
   @property({ attribute: false }) cards: RewardCard[] = [];
   @property({ attribute: false }) recent: string | null = null;
@@ -205,6 +209,16 @@ export class PvChoresRewards extends LitElement {
     `,
   ];
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this._scroll.attach(this);
+  }
+
+  disconnectedCallback(): void {
+    super.disconnectedCallback();
+    this._scroll.attach(undefined);
+  }
+
   render() {
     return html`
       <div class="wrap">
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
index ad873b7..6252bfa 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
@@ -11,6 +11,7 @@ import '../../core/pv-member-avatar';
 import { choresStyles } from './chores-styles';
 import type { WeekView } from './chores-types';
 import { Highlight, WeekCell, WeekRow, weekDays, weekTitle } from './week-derive';
+import { ScrollReporter } from '../../core/content-scroll';
 
 /**
  * pv-chores-week: how the week is going, for everyone (spec 13.5). One mini
@@ -24,6 +25,9 @@ import { Highlight, WeekCell, WeekRow, weekDays, weekTitle } from './week-derive
  * @fires pv-week-excuse - { occurrence, name, member } Excuse it on a highlight
  */
 export class PvChoresWeek extends LitElement {
+  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
+  private _scroll = new ScrollReporter();
+
   @property({ attribute: false }) view: WeekView | null = null;
   @property({ attribute: false }) rows: WeekRow[] = [];
   @property({ attribute: false }) highlights: Highlight[] = [];
@@ -295,6 +299,16 @@ export class PvChoresWeek extends LitElement {
     `,
   ];
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this._scroll.attach(this);
+  }
+
+  disconnectedCallback(): void {
+    super.disconnectedCallback();
+    this._scroll.attach(undefined);
+  }
+
   render() {
     const view = this.view;
     const shape = this.layout === 'landscape' ? 'landscape' : this.layout === 'phone' ? 'phone' : 'portrait';
```

- [ ] **Step 6: Run the task's tests.** `npx vitest run test/content-scroll.test.ts` Expected: PASS, `4 passed`. Then `npx tsc --noEmit -p . && npm test` Expected: `790 passed`.

- [ ] **Step 7: Check it on the dev Home Assistant** at 800 by 1280: a wheel scroll of 300 px in Week turns the header's `shape` to `phone` (173 px to 121 px tall) and scrolling back to the top restores it; switching to Day, which scrolls itself to now, leaves it tall.

- [ ] **Step 8: Commit.** `git add` the files above; message:

```text
feat(card): the portrait header shrinks to one line while the content scrolls

In portrait, scrolling a board column, My day, Week, Rewards, or the
calendar's Day, Week, and Agenda down past the top shrinks the big
lock-screen header to the phone's one row, so a big household's board
gets the room, and it grows back at the top. A view that scrolls
itself (the Day view going to now) leaves it alone, and another view,
module, or layout starts tall again.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

---

### Task 9: 1.4.0, the design system, and the README

**Files:**
- Modify: `DESIGN_SYSTEM.md`, `README.md`, `custom_components/planavista/manifest.json`, `custom_components/planavista/const.py`, `custom_components/planavista/frontend/package.json`, `custom_components/planavista/frontend/package-lock.json`, `custom_components/planavista/frontend/src/styles/shared.ts`
- Rebuild: `custom_components/planavista/frontend/dist/planavista-cards.js`

- [ ] **Step 1: DESIGN_SYSTEM records what the calendar took on.**

`DESIGN_SYSTEM.md`:

````diff
diff --git a/DESIGN_SYSTEM.md b/DESIGN_SYSTEM.md
index 68a4d54..f45c116 100644
--- a/DESIGN_SYSTEM.md
+++ b/DESIGN_SYSTEM.md
@@ -29,7 +29,7 @@ The shell watches the card's own box, not the window or the device, and sets a `
 - **Keyboards:** while a text field in the card has focus, height-only shrinks are ignored. Kiosk browsers shrink the page when the keyboard opens, which would otherwise flip portrait to landscape mid-word.
 - **Rotating keeps your place:** the view, the person, and the time at the top of the Day view stay put. The header, the module, and the bar are the same elements in every layout; only their order changes.
 - **Reference sizes:** 1280 × 800 (landscape), 800 × 1280 (portrait, a typical 10-inch tablet), and 390 × 844 (phone).
-- The calendar views still have a few window-width media queries for type sizes; they move to the card's own size in milestone 7.
+- The calendar's sizes for type, padding, and avatars measure the card too, with container queries on one frame that its sheets sit outside of, so a narrow card on a wide screen gets narrow sizes and a wall display's card gets the large ones.
 
 ### 2.2 Header and bar
 
@@ -42,6 +42,7 @@ The shell watches the card's own box, not the window or the device, and sets a `
 - Switching modules never moves the controls. With only one module there is no switcher.
 - `hide_header` hides the clock and weather header; the bar stays, because it holds the views and Settings.
 - The header's type scales with the card's width (container query units), not the window's.
+- In portrait the header shrinks to the phone's one row while the content below it is scrolled down (past 24 px) and grows back at the top (under 8 px), so a big household's board gets the room. A view that scrolls itself, like the Day view going to now, leaves it alone, and another view, module, or layout starts tall.
 
 ### 2.3 The calendar in each layout
 
@@ -54,7 +55,9 @@ The shell watches the card's own box, not the window or the device, and sets a `
 
 - In portrait and on phones a sheet rises from the bottom, only as tall as its content, with a grab handle. A finger drags it down; letting go past 90 px, or flicking faster than 0.6 px per ms, closes it, and anything less springs back.
 - In landscape a sheet is a centered card that pops in.
-- A sheet leaves before it reports why it closed, so whatever happens next never fights the exit.
+- A sheet leaves before it reports why it closed, so whatever happens next never fights the exit. A sheet the state lets go of (an event saved, a delete done) stays on screen while it leaves.
+- Escape steps back: an open picker first, then the sheet. Escape, a tap outside, or a drag ask before a sheet throws away what was typed ("Discard your changes?"); Cancel is the deliberate way out and doesn't ask.
+- A sheet opened from another (Edit over an event's details) stacks on it, and closing it goes back. Focus returns to whatever opened each one.
 - The same sheets take both shapes; no screen gets a portrait-only version.
 
 ---
@@ -216,6 +219,15 @@ One map, used by every view, sensor description, and notification:
 | Away | 🧳 | "Away · At Grandma's" | neutral |
 | Ring closed | check badge on the ring | "Ring closed for today" | member color |
 
+The calendar's rows, shown in Agenda and in an event's details (Day, Week, and Month keep the now line and dim what's past):
+
+| State | Glyph | Words | Color |
+|---|---|---|---|
+| Starting soon | none | "In 10 min" (the last 15 minutes) | amber |
+| Happening now | none | "Now" | neutral |
+| A multi-day event | none | "Day 2 of 3" | neutral |
+| Past | none | none: the event dims | muted |
+
 ---
 
 ## 7. Motion
@@ -238,6 +250,7 @@ Motion is part of the product, Apple style, in every module.
 - **Reduced motion keeps the meaning.** A ring still fills, because it is the feedback, but pops, flights, glides, and sweeps become quick fades, and a wrong PIN fades instead of shaking. It follows PlanaVista's Motion setting (Follow the device, Full, Reduced), because kiosk tablets often hide the system setting. The card sets `--pv-motion`, which reaches into every shadow root.
 - **Cheap to run.** Only transform, opacity, clip paths, masks, and stroke offsets animate, so older wall tablets stay smooth.
 - **Keyboard.** Space or Enter does what a hold does, with the same feedback.
+- **View changes.** Another view glides in on the smooth spring, with a short rise and a fade; the next or previous day, week, or month slides in from that side. A change nobody made, like the date turning over at midnight or a screen waking up, just switches.
 
 ---
 
@@ -246,14 +259,15 @@ Motion is part of the product, Apple style, in every module.
 - **Skeletons, not spinners,** in the shape of what is loading.
 - **Optimistic changes.** A check-off or an appearance change shows at once; if saving fails, it goes back, with a message that says what to do.
 - **Designed empty and error states** that say what to do next.
+- The calendar: a skeleton in the shape of the view while Home Assistant starts; "Can't load the calendar" with Try again; "No calendars yet" (a parent gets Add calendars) and "Every calendar is hidden" (Show all); a banner that names a calendar Home Assistant can't reach or whose events didn't arrive; "Nothing coming up" in Agenda; and a quiet line on a day with nothing on it.
 
 ---
 
 ## 9. Copy
 
-- Sentence case. One name per thing ("Waiting for OK" is the only name for pending).
+- Sentence case. One name per thing ("Waiting for OK" is the only name for pending; "New event", never New, Add event, or Create event).
 - No em dashes in product copy or public docs. The CI copy check (`scripts/check_copy.py`) enforces it.
-- Destructive actions are confirmed by name ("Remove Casey's PIN?", "Reset PlanaVista to its original colors?").
+- Destructive actions are confirmed by name, without quotes ("Remove Casey's PIN?", "Delete Team standup?", "Reset PlanaVista to its original colors?").
 - Every sub-screen has a back control naming its parent ("‹ Settings", "‹ Appearance"). A kiosk has no browser back button.
 - Errors say what happened and what to do next, in plain words.
 
@@ -284,6 +298,8 @@ Motion is part of the product, Apple style, in every module.
 
 `pv-pin-sheet` (the keypad: tap your face, then your PIN; digits never reach the page) and `pv-notice-sheet` (a short message with buttons). Both move per section 2.4 and section 7, and fire their events after they've left.
 
+The calendar's event details (`pv-event-popup`) and New event and Edit event (`pv-event-create-dialog`) are sheets too, built on `SheetController`: the spring entrance, drag to dismiss, Escape, the focus trap, and leaving before saying it closed. The calendar keeps each one mounted while it leaves, so a sheet that a save or a delete closes still plays its exit.
+
 ### 11.4 Event blocks
 
 ```
@@ -341,6 +357,16 @@ hide_header: false
 
 ## 12. Design changelog
 
+### 2026-10-11: Changed: the calendar takes on the rest (1.4.0)
+
+- Event details, New event, and Edit event are sheets like the chores sheets, with focus traps, Escape, focus returned, and a question before typing is thrown away.
+- Rounded headings and tabular numbers throughout the calendar; the status map's calendar rows (Now, In 10 min, Day 2 of 3).
+- Designed loading, empty, and error states for the calendar, and banners for a calendar Home Assistant can't reach.
+- The copy rules in the calendar and its Settings: New event, Who, Starts and Ends, sentence case, deletes asked by name.
+- Springs for view changes in the calendar and chores.
+- The calendar's sizes follow the card's width, and every control is a 48 px target.
+- The portrait header shrinks to one line while the content scrolls.
+
 ### 2026-10-10: Changed: the new look (1.2.0)
 
 - The header and the bar: one row in landscape; a lock-screen clock and a bottom bar in portrait and on phones; the card lays itself out by its own size.
````

- [ ] **Step 2: README's event how-to follows the sheets.**

`README.md`:

```diff
diff --git a/README.md b/README.md
index 3cd80e8..2ebe0d0 100644
--- a/README.md
+++ b/README.md
@@ -287,7 +287,7 @@ PlanaVista goes beyond Home Assistant's built-in calendar services to provide de
 - **In-Place Event Editing**: Shared events are updated via PATCH requests, preserving event links and attendee lists (no delete-and-recreate)
 - **Real Organizer Detection**: Each event's true organizer is fetched from the Google Calendar API, enabling accurate "who created this?" display
 - **Shared Event Deduplication**: When the same event appears on multiple family members' calendars, PlanaVista detects and displays it once with participant indicators
-- **Smart Delete**: The organizer sees "Delete Event" (removes for everyone); attendees see "Remove Me" (removes only their copy)
+- **Smart Delete**: An event on several people's calendars can be deleted for everyone at once, or one person can be taken off it, and a delete that misses a calendar names it
 - **Graceful Fallback**: Non-Google calendars (Local Calendar, CalDAV, etc.) work normally using standard Home Assistant services
 
 ---
@@ -296,25 +296,27 @@ PlanaVista goes beyond Home Assistant's built-in calendar services to provide de
 
 ### Creating Events
 
-1. Click the **+ New** button in the card header (or the "+ Add" button on any day in week/agenda view)
-2. Enter a title, select one or more calendars, and pick start/end times
-3. Optionally add a location or description. Locations are plain text unless you turn on **Address suggestions** (see below)
-4. Click **Add**. For multi-calendar events on Google Calendar, attendees are automatically invited via the API
+1. Tap **New event** under the header (or the **+** on any day in Week or Agenda)
+2. Enter a title, pick who it's for, and pick when it starts and ends
+3. Optionally add a description or location. Locations are plain text unless you turn on **Address suggestions** (see below)
+4. Tap **Add**. For an event for several people on Google Calendar, they're invited through the API
+
+The event opens as a sheet: from the bottom in portrait and on phones, as a card in landscape. Closing it by tapping outside, pressing Escape, or dragging it down after typing something asks first; **Cancel** closes it straight away.
 
 **Address suggestions** are **off by default**. A parent can turn them on in the card's **Settings, Calendar options**. When on, the location text you type (and nothing else) is sent to [Photon](https://photon.komoot.io) (OpenStreetMap data) to suggest addresses. When off, locations are plain text and nothing is sent.
 
 ### Editing Events
 
-- Tap any event to open its detail popup, then click **Edit**
+- Tap any event to open its details, then tap **Edit**. **Cancel** goes back to the details
 - For shared Google Calendar events, edits are applied in-place via PATCH, with no need to delete and recreate
 - All fields are editable: title, time, location, description, and calendar
 - Guests can be added or removed when editing shared events
 
 ### Deleting Events
 
-- From the event detail popup, click **Delete**
-- If you're the organizer, the event is deleted for all attendees
-- If you're an attendee, you're removed from the event without affecting others
+- From an event's details, tap **Delete**. PlanaVista asks by name first ("Delete Dentist?")
+- An event on several people's calendars offers **Delete for everyone**, or **Remove someone** to take one person off it
+- An event on a calendar PlanaVista can't change says so, and can be changed in that calendar's own app
 
 Events sync two-way with your calendar provider (Google Calendar, Local Calendar, etc.).
 
```

- [ ] **Step 3: The old overlay styles go, and the version is 1.4.0** (the frontend's `version.test.ts` checks the manifest and `package.json` agree).

`custom_components/planavista/frontend/src/styles/shared.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/shared.ts b/custom_components/planavista/frontend/src/styles/shared.ts
index fb7babc..d56cd43 100644
--- a/custom_components/planavista/frontend/src/styles/shared.ts
+++ b/custom_components/planavista/frontend/src/styles/shared.ts
@@ -214,64 +214,6 @@ export const eventStyles = css`
   }
 `;
 
-/**
- * Dialog/popup styles.
- */
-export const dialogStyles = css`
-  .pv-overlay {
-    position: fixed;
-    inset: 0;
-    background: var(--pv-backdrop, rgba(0, 0, 0, 0.3));
-    backdrop-filter: blur(4px);
-    -webkit-backdrop-filter: blur(4px);
-    display: flex;
-    align-items: center;
-    justify-content: center;
-    z-index: 999;
-    animation: pv-fadeIn var(--pv-transition, 200ms ease) forwards;
-  }
-
-  .pv-dialog {
-    background: var(--pv-card-bg-elevated, #FFFFFF);
-    border-radius: var(--pv-radius-lg, 16px);
-    box-shadow: var(--pv-shadow-xl);
-    max-width: 480px;
-    width: calc(100% - 2rem);
-    max-height: 85vh;
-    overflow-y: auto;
-    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
-  }
-
-  .pv-dialog-header {
-    display: flex;
-    align-items: center;
-    justify-content: space-between;
-    padding: 1.25rem 1.5rem;
-    border-bottom: 1px solid var(--pv-border-subtle);
-  }
-
-  .pv-dialog-body {
-    padding: 1.5rem;
-  }
-
-  .pv-dialog-footer {
-    display: flex;
-    justify-content: flex-end;
-    gap: 0.75rem;
-    padding: 1rem 1.5rem;
-    border-top: 1px solid var(--pv-border-subtle);
-  }
-
-  .pv-popup {
-    background: var(--pv-card-bg-elevated, #FFFFFF);
-    border-radius: var(--pv-radius-lg, 16px);
-    box-shadow: var(--pv-shadow-xl);
-    max-width: 360px;
-    width: calc(100% - 2rem);
-    animation: pv-scaleIn var(--pv-transition, 200ms ease) forwards;
-  }
-`;
-
 /**
  * Form input styles.
  */
```

`custom_components/planavista/manifest.json`:

```diff
diff --git a/custom_components/planavista/manifest.json b/custom_components/planavista/manifest.json
index 361032c..2e08069 100644
--- a/custom_components/planavista/manifest.json
+++ b/custom_components/planavista/manifest.json
@@ -11,5 +11,5 @@
   "issue_tracker": "https://github.com/tavenhall1/planavista/issues",
   "requirements": [],
   "single_config_entry": true,
-  "version": "1.3.0"
+  "version": "1.4.0"
 }
```

`custom_components/planavista/const.py`:

```diff
diff --git a/custom_components/planavista/const.py b/custom_components/planavista/const.py
index 8844283..c69cbb9 100644
--- a/custom_components/planavista/const.py
+++ b/custom_components/planavista/const.py
@@ -3,7 +3,7 @@ from typing import Final
 
 DOMAIN: Final = "planavista"
 NAME: Final = "PlanaVista"
-VERSION: Final = "1.3.0"
+VERSION: Final = "1.4.0"
 
 # Event fetching range
 EVENT_RANGE_PAST_DAYS: Final = 30
```

`custom_components/planavista/frontend/package.json`:

```diff
diff --git a/custom_components/planavista/frontend/package.json b/custom_components/planavista/frontend/package.json
index 49eef20..14bd859 100644
--- a/custom_components/planavista/frontend/package.json
+++ b/custom_components/planavista/frontend/package.json
@@ -1,6 +1,6 @@
 {
   "name": "planavista-cards",
-  "version": "1.3.0",
+  "version": "1.4.0",
   "description": "PlanaVista cards for Home Assistant",
   "author": "Stephen Hall",
   "license": "MIT",
```

`custom_components/planavista/frontend/package-lock.json`:

```diff
diff --git a/custom_components/planavista/frontend/package-lock.json b/custom_components/planavista/frontend/package-lock.json
index 89ab20c..39ecd13 100644
--- a/custom_components/planavista/frontend/package-lock.json
+++ b/custom_components/planavista/frontend/package-lock.json
@@ -1,12 +1,12 @@
 {
   "name": "planavista-cards",
-  "version": "1.3.0",
+  "version": "1.4.0",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
       "name": "planavista-cards",
-      "version": "1.3.0",
+      "version": "1.4.0",
       "license": "MIT",
       "dependencies": {
         "custom-card-helpers": "^1.9.0",
```

- [ ] **Step 4: Rebuild and verify.** `npm run build`; `npx tsc --noEmit -p . && npm test` Expected: `790 passed`; `bash scripts/test-backend.sh -q` Expected: `1050 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Commit and push.** `git add` the files above and the bundle; message:

```text
chore: 1.4.0, the design system and README for the calendar's new look

DESIGN_SYSTEM records what the calendar took on: the card-size rule for
its views, the portrait header that shrinks while the content scrolls,
how sheets step back and ask before throwing typing away, the status
map's calendar rows, view-change springs, the calendar's designed
states, and the copy examples, with a 1.4.0 changelog entry. README's
event how-to follows the sheets. The old dialog styles nothing uses
are gone, the version is 1.4.0, and the bundle is rebuilt.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
```

Then push the branch and wait for CI (Validate and Frontend) to pass.
