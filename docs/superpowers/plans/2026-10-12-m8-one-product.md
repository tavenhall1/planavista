# Milestone 8, One Product: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The calendar and Chores feel like one product, end to end: one control for each kind of choice, one button family, sheets that end the same way, one color per person, one event in every view, dates and times picked one way, and calendar events that follow the household's rule for who may change what (D1). Sessions get the household's own limits (D3), easy PINs are turned away (D4), and a child's unlocked time shows the same strip (D5). The branch also carries release 1.5.0's version and docs, published only after the go-ahead.

**Architecture:** see the design, section 4 (`docs/superpowers/specs/2026-10-12-one-product-design.md`). Shared looks are styles over each site's own controls (`styles/controls.ts`), so no new elements or nested shadow roots. Rules live in pure modules with unit tests (`core/access.ts` eventAccess, `core/session.ts`, `core/keypad.ts` easyPin, `core/place.ts`, `core/pickers.ts`, `modules/calendar/event-gate.ts`, `mode-colors.ts`, `event-utils.ts` sameEventKey, the chores derive modules); elements only render, checked on the dev Home Assistant. Backend: `household/security.py` (limits, easy_pin), `household/store.py` (two security fields), `household/websocket.py` (settings, unlock and touch replies, easy_pin), and `refusals.py` with `diagnostics.py`.

**Tech Stack:** TypeScript 5.7 with Lit 3, Rollup, vitest (node environment, `TZ=America/Chicago`); Python 3.14 and Home Assistant 2026.10.0 in Docker for the dev Home Assistant, with backend tests from pytest-homeassistant-custom-component in Docker (`scripts/test-backend.sh`).

**Spec:** `docs/superpowers/specs/2026-10-12-one-product-design.md` (decisions D1 to D5, sections 3.1 to 3.12, 4, 5).

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data: two fields added under the household's `security` (`session_idle_seconds`, `parent_mode_minutes`), normalized on load; 1.4.0 ignores them. Nothing is renamed or removed.
- Public surface: no entity or action changes. WebSocket: `planavista/household/settings/save` takes the two new fields; `planavista/pin/unlock` adds `idle_seconds` and `cap_in`; `planavista/pin/touch` returns the time left; `planavista/pin/set` can refuse with `easy_pin`. Element names stay.
- PINs are never accepted through actions, logged, exported, or traced; no reply contains a PIN (the easy-PIN message names no digits).
- Touch targets are at least 48 px; sheets keep their focus traps, Escape, and returned focus.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, and docs.
- Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01Ng97wkffZAqTzDTrYUzS7m`
- Don't merge, tag, or publish a release in this plan. Pushing the milestone branch for CI is allowed. Release 1.5.0 follows the user's go-ahead.
- Frontend: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`; the bundle (`npm run build`) is committed in Task 18 and must match the source. Backend: `bash scripts/test-backend.sh` (from the repository root).
- Paths are relative to the repository root.

## Review Focus

1. **The same job, two looks** (the owner's example: the module switcher and the views): every pick-one-of-a-few is `.pv-seg`, every list of named choices is `.pv-choices`, every people choice is the strip or the chips. Pinned by `test/controls.test.ts` and `test/people.test.ts`, which scan the sources for the old classes.
2. **Who may change an event on a shared screen, and on a child's own login** (D1): the owner's PIN or a parent's, a parent's for several people or nobody, nothing extra while no parent has a PIN. Pinned by `test/access.test.ts` and `test/event-gate.test.ts`; walked on the dev Home Assistant from the Kitchen and Casey accounts.
3. **Sessions that end when the household said** (D3): the quiet time and the cap, both following a change at once, a command counting as a touch on both sides. Pinned by `test/session.test.ts`, `tests/test_household_security.py`, and `tests/test_pins.py`.
4. **Undo, credit, and refusals** (3.5): a toast's Undo always undoes its own check-off and answers; refusals land in diagnostics without names. Pinned by `test/recent-checkoffs.test.ts`, `test/options-derive.test.ts`, and `tests/test_chores_privacy.py`.
5. **One event, one color, one place** (3.1, 3.3, 3.7): copies merge by title and times everywhere, a linked calendar draws its person's color, and a card comes back where it was within the hour. Pinned by `test/calendar-derive.test.ts`, `test/mode-colors.test.ts`, and `test/place.test.ts`.

## Plan rulings

Every module and every test in Tasks 1 to 18 was built and run on a scratch branch before this plan was written (1092 backend tests and 1167 frontend tests at the end, each task's tests run at its own commit), and each screen was checked on the dev Home Assistant at 1280 by 800, 800 by 1280, and 390 by 844. These rulings were made while building it. They are named by the prototype's tasks: T1 to T8 are Tasks 1 to 8, T9 is Task 10, T10 is Task 11, T11 is Task 12, T12 is Task 13, T13 is Task 14, T14 is Task 15, T15 is Task 16, and T16 is Task 18 (Tasks 9 and 17 are a README update and a fix found at the end). The spec amendments the T1 and T6 rulings ask for are in Task 18, and the Settings page layout found in T1 is in Task 16.

### Rulings T1 to T7
- T1 ruling: the one segmented control is a shared stylesheet (styles/controls.ts segmentedStyles, .pv-seg) over each site's own buttons with aria-pressed (or aria-checked in a radiogroup), not a new element: no nested shadow roots, sites keep their own handlers and roving focus. Spec section 4 says core/pv-segmented.ts; amend it.
- T1 ruling: named choices with a line of explanation (Age group, the missed rule) are a grouped list with a check (choiceStyles, .pv-choices/.pv-choice around a real radio). Appearance's Light/Dark/Automatic and Theme stay picture cards (they preview); setup's choice cards already put a check on the chosen card and stay. Amend spec 3.9 bullet 2.
- Found in T1: Calendar options' content is a narrow centered column while every other Settings page starts at the left (add to T12: one Settings page layout).
- T3 ruling: a read-only sheet's order is its actions, then Delete (set apart), then Done last (Done ends the sheet), so "delete at the end" means the end of the actions.
- T3 ruling: the details sheet now opens with focus on its title (M7 ruling 28 put it on Edit); editors still focus their first field.
- T3 ruling: the calendar shows no toasts of its own (its sheets answer in place); "one toast everywhere" means one element wherever a toast shows. Settings and setup errors use it in the bad tone.
- T3 ruling: in dark mode the toast is light (light background, dark text), so it reads against a dark card.
- T3 commit: tests in test/sheets.test.ts (7) and test/controls.test.ts.
- T4 ruling: an editor page can't tell Settings it left (a node removed from the page sends no events), so Settings forgets the editor whenever the page in view changes (_stack or _selected), and each editor announces itself after its first render.
- T4 ruling: setup's "Add 8 chores" stays "Add": it adds a batch of picked starters; "New ..." is for creating one thing.
- T4 ruling: People keeps its one New person button at the top (the one under the list goes).
- T5 ruling: Day shows one person at a time whenever its lane headers are hidden (card under 768 px, the existing container queries), not only at the phone layout, so a lane is never told apart by color alone. The choice lives in the element (_dayPick); CSS hides the other lanes.
- T5 ruling: the calendar's phone filter pills (show or hide a calendar) stay as filters; they are not a people pattern.
- T5 ruling: "Who did it?" keeps its big faces (it acts on one tap, it doesn't toggle a choice).
- Found and fixed in T5: T1's segmented buttons could shrink, so the bar's views cut words on a phone (and the bar's fit measurement believed they fit). Choices keep their width now (flex: 0 0 auto), test added red then green.
- T6 ruling: the event editor keeps its own dropdown containers (positioned outside its panel, its Escape hook, its focus moves, from M7) and draws the shared grid and list in them; everywhere else the grid and list open inline in pv-date-field and pv-time-field, which work in any scrolling page or sheet. One implementation of each picker, two containers. Spec 4 named core/pv-date-picker.ts and core/pv-time-picker.ts; the pieces are core/pickers.ts, core/picker-views.ts, styles/pickers.ts, and the two fields.
- T6 ruling: the fields set their own value and fire a plain change, so every site's handler (reading the target's value, as for an input or a select) stays as it was.
- T6 ruling: the grid starts weeks on Sunday, as the editor's did (it doesn't follow the First day setting); deferred.

### T8 rulings (sessions and PINs)
- T8.1 Limits are read at every check on the backend (`Household.session_limits`), so a change applies to open sessions; the card follows the household view the same way (`withLimits`, `SessionController.follow` in the card's willUpdate).
- T8.2 The cap applies to every session (parent mode and a child's window), counted from the PIN (`Session.started`). Wrong-PIN pauses unchanged.
- T8.3 A command the backend accepted with the session counts as a touch there (session_for touches), so the card counts it too (`WsApi` onSessionUsed, `usedAt`). Older than M8, visible only with 30 s.
- T8.4 Touches go to the backend every min(30 s, quiet time / 4): 7.5 s at 30 s.
- T8.5 The easy-PIN message names no digits ("the same digit, a run, or straight down the keypad"), so a reply never contains a PIN; card and backend share the words and the table (tests/fixtures/easy_pins.json). PINs set before stay valid.
- T8.6 A child's window: the same strip, words "Casey · unlocked", ring spoken "Locks in ...", no module buttons (D2/D5).
- T8.7 Settings rows: short labels (30 sec, 1 min ...) with spoken aria-labels; a radiogroup with arrows, like the Appearance page.
- Dev data: Casey has the dev-only test PIN 1357 (for checking D5).

### T9 rulings (calendar permissions, D1)
- T9.1 No protection asked for, none applied: a household with no parent PIN (parentAccess no_pin), or whose household hasn't answered or is unavailable, changes events as in 1.4 (eventAccess 'yes'), so an upgrade never locks a wall tablet out of its calendar. Chores keep their own no_pin notice.
- T9.2 Owners are counted once each (ownersOf): two calendars of the same person are still that person's event; a calendar PlanaVista no longer shows counts as nobody's.
- T9.3 An edit is checked against the calendars it leaves and the ones it joins; New event against the ones picked.
- T9.4 A login that may never change an event sees no Edit or Delete and a note saying who can ("Only Dana or a parent can change this event."); New event offers only the calendars it may use and hides when there are none.
- T9.5 One default Who for New event and a day's +: the one calendar offered, else nobody (before, + picked whichever calendar was first).
- T9.6 PinGate.ask takes a reason, shown under "Blair, enter your PIN" ("To change Team standup"); chores pass theirs in T15.
- T9.7 After the PIN, the sheet goes on if it is still open, with the event it holds now (the minute's refresh may hand it a fresh copy).

### T10 rulings (one color per person)
- T10.1 The card derives a linked calendar's colors from its person at draw time (withModeColors with the members); saved rows keep their own color, so unlinking brings it back and nothing is rewritten.
- T10.2 The tint is the swatches' own rule, 65% of the way to white (lightTint in core/color.ts; the picker's comment said 88% while its code used 65%). Dark: memberColor (their own dark color first, else Matched) on darkTint, as the board.
- T10.3 Ownership on the Calendars page follows Belongs to (belongsTo: the linked HA person first, then member_id); the calendar views read member_id, which the backend keeps in step with the person link.
- T10.4 Set in People pushes the person page with back "Calendars".

### T11 rulings (one event in every view)
- T11.1 One definition of "the same event": title, start, and end (sameEventKey in event-utils), used by Week's merge, the Day lanes' faces, the details sheet, and Day's all-day row. A uid shared across calendars still counts first in the details sheet.
- T11.2 Day's all-day pill per event: drawn in the chosen person's copy's color (their own on a phone), the first copy's otherwise, with everyone's faces ringed in the pill's ink.
- T11.3 Found on the dev HA: Day lane chips were content-box, 17 px wider than their lane (into the next lane, past the card's edge); now border-box. Short events (under 45 minutes) put title and time on one line so they fit their slot instead of growing into the next half hour.
- T11.4 Lane faces sit at the chip's top right, as on Week's chips.
- T11.5 The details sheet always shows people chips; Organizer only with two or more people.

### T12 rulings (all-day events over several days)
- T12.1 With All day on, the date row is Starts and Ends (dates), mirroring a timed event's Starts and Ends (times); the "Through ... (N days)" hint is gone, and "Ends <day>" stays only for a timed event past midnight.
- T12.2 Ends shows the last day; Home Assistant's exclusive end (the day after) stays inside buildDatePayload. The end grid starts at the start day (min).
- T12.3 A new start keeps the event's length (the end moves along), as phone calendars do; a new last day changes the length.
- Dev check: "Test trip" Fri Oct 16 to Sun Oct 18 on Test Alex stored as 2026-10-16 to 2026-10-19, reopened with both days, deleted.

### T13 rulings (board words and refusals)
- T13.1 Done today lists every check-off today, a finished part of the day's too, oldest first; "Morning · N done" stays below.
- T13.2 "Who did it?" can't know the pick before it, so both sheets say one neutral line (whoDidItBody), and the toast after the pick says what happened (creditedText: the stars only when that person earns them and the chore gives some; a pick whose check-offs wait for OK says "waiting for OK"). The engine gives the chore's stars only to a doer who earns them.
- T13.3 Undo: each check-off toast keeps its own check-off (RecentCheckoffs, last 5), so a newer check-off no longer turns an older toast's Undo into nothing (a likely cause of "Undo did nothing" for Dana); Undo always answers ("X is open again." or "Hold the check to uncheck it."); refusals keep coming back on the card where they were tapped (CheckoffQueue).
- T13.4 Redeem waits at once: the module keeps asks the board doesn't show yet; the label rule is redeemLabel (Redeem / Waiting for OK / Not enough stars yet). The toast keeps its shipped words "A parent will answer." (the spec draft said "will look").
- T13.5 Refusals: every WebSocket refusal in the household and chores modules goes through refusals.send_refusal, which keeps the last 20 in hass.data (time, command, code; never a name, member, user id, or PIN); diagnostics show them as recent_refusals. A proxy around the connection was ruled out: sessions compare the connection by identity.

### T14 rulings (coming back where you were)
- T14.1 "Within an hour" counts from when the card was last on screen: the place is written on every module or view change, each minute while the page is visible, and when the card leaves. A tablet on Week all afternoon comes back on Week after an update; one that was off overnight opens on its start.
- T14.2 The key is the dashboard path plus the card's config (stable key order), so two cards keep their own place and a config change starts fresh; supersedes the M5 note that a card Home Assistant rebuilds opens on its configured module (it does once the hour has passed, or when its config changed).
- T14.3 Each module's view is remembered (switching back to Calendar finds its view); dates never are.
- T14.4 Applied once, when the data and the household are both in, so Chores (enabled only with the household) can be found; a module the card no longer shows, or a view it no longer has, is dropped.
- T14.5 Storage failures (private windows, blocked storage) fall back to the start, silently.

### T15 rulings (smaller fixes)
- T15.1 Fairness: one helper (fairness.ts) for Week and My day, "Blair 1 h · 100%"; widths stay exact, the words round.
- T15.2 Goal: goalWords ("18 more ★" / "Enough stars!") in My day and Rewards; My day drops "7 of 25 ★" from the line (the bar's label keeps it). Stickers: stickersLabel "This week: 5 ★" on the board and in My day; My day's sticker label adds the goal the same way.
- T15.3 Settings list: a Once chore whose open occurrence has another due date says "On Oct 11 · moved to Oct 12" (choresList takes the board's items).
- T15.4 Age group: a note under the choices names what the new defaults changed (ageGroupNote), shown while chores are on; it doesn't keep a customized style (that stays the M6 rule: an age group brings its defaults).
- T15.5 People row: "Parent · Teen" for a parent who isn't an adult.
- T15.6 Timeline: a check-off waiting for OK sits at its time like a done one; a timed row doesn't repeat the time on its right.
- T15.7 "Added by an admin" is gone: only a person (or an automation) is named; otherwise "Added on Saturday".
- T15.8 Picture: Photo can't be picked until the linked person has a photo; a Photo saved before shows Initial as chosen (the saved value stays, so the photo appears once there is one).
- T15.9 PINs row: "This screen: shared family screen" / "This screen: not shared".
- T15.10 The inbox and the Day view use the shared designed state (.state).
- T15.11 pinReason turns every PIN question into its why line; a source scan in the test keeps new questions covered.
- T15.12 Settings list: the Needs a look card is compact (two lines at most, 48 px); the list scrolls. Every Settings page is one column, 640 px at most, from the left (pv-settings .page-el); .page-content lost its centered 560 px.
- T15.13 Taps go through the change's snapshots (::view-transition pointer-events none).
- T15.14 Customize: Corners and Shadows have "Theme" (the theme's own, none of the presets for Minimal and Vibrant), chosen until another is picked.
- T15.15 README: on a wall tablet, set Home Assistant's profile to Dark, or Auto with the tablet's own dark mode on a schedule.
- Already done before T15: one New person (T4); "Who did it?" opens on its heading, not a face (T3).

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/m8-one-product` (main is at `d484f4b`: release 1.4.0 and the dev Home Assistant on 2026.10.0).
- [ ] **Step 2: The design.** `git cherry-pick 9fe04b5` (the design document, `docs: the design for milestone 8, one product`; no code).
- [ ] **Step 3: Baseline.** `bash scripts/test-backend.sh -q` Expected: `1052 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `811 passed`.
- [ ] **Step 4: Commit this plan.** `git add docs/superpowers/plans/2026-10-12-m8-one-product.md && git commit` with the message `docs: plan milestone 8, one product` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/m8-one-product`.

---

### Task 1: One control for picking one of a few

Spec 3.9 (pick one of a few, named choices).

**Files:**
- Create: `custom_components/planavista/frontend/src/styles/controls.ts`, `custom_components/planavista/frontend/test/controls.test.ts`
- Modify: `custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`, `custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`, `custom_components/planavista/frontend/src/shell/pv-nav-bar.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts`, `custom_components/planavista/frontend/src/styles/settings.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/controls.test.ts` (new):

```ts
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { segmentedStyles } from '../src/styles/controls';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sources(path) : path.endsWith('.ts') ? [path] : [];
  });
}

const FILES = sources(SRC).map(path => ({ path: path.slice(SRC.length).replace(/\\/g, '/'), text: readFileSync(path, 'utf-8') }));

describe('one control for each kind of choice (milestone 8, spec 3.9)', () => {
  // The old looks for "pick one of a few": the bar's switcher and views, settings segments, pills, view cards.
  const OLD = [/class="seg\b/, /class="seg-inner/, /class="seg-btn/, /class="segmented/, /class="pill-group/, /class="pill-btn/, /class="view-card/];

  it.each(FILES.map(f => [f.path, f.text]))('%s draws pick-one choices with the shared control', (_path, text) => {
    for (const pattern of OLD) expect(text).not.toMatch(pattern);
  });

  it('the bar puts modules and views in the same control', () => {
    const bar = FILES.find(f => f.path === 'shell/pv-nav-bar.ts')!.text;
    expect(bar).toMatch(/class="pv-seg[^"]*" role="group" aria-label="Modules"/);
    expect(bar).toMatch(/class="views pv-seg[^"]*" role="group" aria-label="Views"/);
  });

  it('every part of the control is a 48 px target', () => {
    const text = segmentedStyles.cssText;
    const button = /\.pv-seg > button \{([^}]*)\}/.exec(text)?.[1] ?? '';
    expect(button).toMatch(/height:\s*48px/);
    expect(button).toMatch(/min-width:\s*48px/);
  });

  it('named choices with a line of explanation are rows with a check, not bare radios', () => {
    const person = FILES.find(f => f.path === 'shell/settings/person-page.ts')!.text;
    const rules = FILES.find(f => f.path === 'modules/chores/settings/pv-rules-page.ts')!.text;
    expect(person).toMatch(/class="pv-choices"/);
    expect(rules).toMatch(/class="pv-choices"/);
    expect(person).not.toMatch(/class="radio"/);
    expect(rules).not.toMatch(/class="row radio"/);
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/controls.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
index 6feef58..7afced1 100644
--- a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
+++ b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../styles/controls';
 import { property } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
 import { Freq, RecurrenceValue, WEEKDAYS, Weekday, ordinal, recurrenceSummary, weekdayOf } from './recurrence';
@@ -22,7 +23,9 @@ const UNITS: Record<Freq, [string, string]> = { DAILY: ['day', 'days'], WEEKLY:
 export class PvRecurrencePicker extends LitElement {
   @property({ attribute: false }) value!: RecurrenceValue;
 
-  static styles = css`
+  static styles = [
+    segmentedStyles,
+    css`
     :host {
       display: block;
     }
@@ -53,31 +56,11 @@ export class PvRecurrencePicker extends LitElement {
       min-width: 80px;
     }
 
-    .segmented {
-      display: flex;
+    .row > .pv-seg {
       flex: 1 1 100%;
-      gap: 4px;
-      padding: 4px;
-      border-radius: 12px;
-      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
     }
 
-    .segmented button {
-      flex: 1;
-      min-height: 44px;
-      border: none;
-      border-radius: 9px;
-      background: transparent;
-      color: inherit;
-      font: inherit;
-      cursor: pointer;
-    }
 
-    .segmented button[aria-pressed='true'] {
-      background: var(--pv-card-bg, #FFFFFF);
-      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
-      font-weight: 600;
-    }
 
     .stepper {
       display: inline-flex;
@@ -146,7 +129,8 @@ export class PvRecurrencePicker extends LitElement {
       font-size: 0.8125rem;
       color: var(--pv-text-secondary, #6B7280);
     }
-  `;
+  `,
+  ];
 
   render() {
     const v = this.value;
@@ -155,7 +139,7 @@ export class PvRecurrencePicker extends LitElement {
     return html`
       <div class="group">
         <div class="row">
-          <div class="segmented" role="group" aria-label="Repeats">
+          <div class="pv-seg stretch" role="group" aria-label="Repeats">
             ${(['DAILY', 'WEEKLY', 'MONTHLY'] as Freq[]).map(freq => html`
               <button type="button" aria-pressed=${v.freq === freq ? 'true' : 'false'} @click=${() => this._freq(freq)}>
                 ${freq === 'DAILY' ? 'Every day' : freq === 'WEEKLY' ? 'Every week' : 'Every month'}
@@ -204,7 +188,7 @@ export class PvRecurrencePicker extends LitElement {
         </div>
         <div class="row">
           <span class="label">Ends</span>
-          <div class="segmented" role="group" aria-label="Ends">
+          <div class="pv-seg stretch" role="group" aria-label="Ends">
             ${(['never', 'count', 'until'] as const).map(ends => html`
               <button type="button" aria-pressed=${v.ends === ends ? 'true' : 'false'} @click=${() => this._set({ ends })}>
                 ${ends === 'never' ? 'Never' : ends === 'count' ? 'After a number of times' : 'On a date'}
```

`custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts b/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
index c64949f..b5ed5da 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/settings/options-page.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -67,14 +68,14 @@ export class PvCalendarOptionsPage extends LitElement {
         <!-- Time format -->
         <div class="field-group">
           <label class="pv-label">Time format</label>
-          <div class="pill-group" role="group" aria-label="Time format">
+          <div class="pv-seg" role="group" aria-label="Time format">
             <button
-              class="pill-btn ${this._draft.time_format === '12h' ? 'pill-btn--active' : ''}"
+              aria-pressed=${this._draft.time_format === '12h' ? 'true' : 'false'}
               type="button"
               @click=${() => { this._apply({ time_format: '12h' }); }}
             >12-hour</button>
             <button
-              class="pill-btn ${this._draft.time_format === '24h' ? 'pill-btn--active' : ''}"
+              aria-pressed=${this._draft.time_format === '24h' ? 'true' : 'false'}
               type="button"
               @click=${() => { this._apply({ time_format: '24h' }); }}
             >24-hour</button>
@@ -84,14 +85,14 @@ export class PvCalendarOptionsPage extends LitElement {
         <!-- First day of the week -->
         <div class="field-group">
           <label class="pv-label">First day of the week</label>
-          <div class="pill-group" role="group" aria-label="First day of week">
+          <div class="pv-seg" role="group" aria-label="First day of week">
             <button
-              class="pill-btn ${this._draft.first_day === 'sunday' ? 'pill-btn--active' : ''}"
+              aria-pressed=${this._draft.first_day === 'sunday' ? 'true' : 'false'}
               type="button"
               @click=${() => { this._apply({ first_day: 'sunday' }); }}
             >Sunday</button>
             <button
-              class="pill-btn ${this._draft.first_day === 'monday' ? 'pill-btn--active' : ''}"
+              aria-pressed=${this._draft.first_day === 'monday' ? 'true' : 'false'}
               type="button"
               @click=${() => { this._apply({ first_day: 'monday' }); }}
             >Monday</button>
@@ -117,24 +118,15 @@ export class PvCalendarOptionsPage extends LitElement {
         <!-- Default view -->
         <div class="field-group">
           <label class="pv-label">Default view</label>
-          <div class="view-grid" role="group" aria-label="Default calendar view">
+          <div class="pv-seg stretch" role="group" aria-label="Default calendar view">
             ${([
-              { key: 'day', label: 'Day', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm-7-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' },
-              { key: 'week', label: 'Week', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v6H7zm4 0h2v6h-2zm4 0h2v6h-2z' },
-              { key: 'month', label: 'Month', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z' },
-              { key: 'agenda', label: 'Agenda', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
-            ] as Array<{ key: string; label: string; icon: string }>).map(v => html`
-              <button
-                class="view-card ${this._draft.default_view === v.key ? 'view-card--active' : ''}"
-                type="button"
-                aria-pressed="${this._draft.default_view === v.key}"
-                @click=${() => { this._apply({ default_view: v.key as DisplayConfig['default_view'] }); }}
-              >
-                <svg class="view-icon" viewBox="0 0 24 24" width="24" height="24">
-                  <path d="${v.icon}" />
-                </svg>
-                <span class="view-label">${v.label}</span>
-              </button>
+              { key: 'day', label: 'Day' },
+              { key: 'week', label: 'Week' },
+              { key: 'month', label: 'Month' },
+              { key: 'agenda', label: 'Agenda' },
+            ] as Array<{ key: string; label: string }>).map(v => html`
+              <button type="button" aria-pressed=${this._draft.default_view === v.key ? 'true' : 'false'}
+                @click=${() => { this._apply({ default_view: v.key as DisplayConfig['default_view'] }); }}>${v.label}</button>
             `)}
           </div>
         </div>
@@ -178,6 +170,7 @@ export class PvCalendarOptionsPage extends LitElement {
   }
 
   static styles = [
+    segmentedStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -212,63 +205,8 @@ export class PvCalendarOptionsPage extends LitElement {
         color: var(--pv-text, #1A1B1E);
         font-weight: 600;
       }
-/* ── View grid (default view selection) ────────────────── */
-.view-grid {
-        display: grid;
-        grid-template-columns: repeat(4, 1fr);
-        gap: 8px;
-      }
-@media (max-width: 400px) {
-.view-grid {
-          grid-template-columns: repeat(2, 1fr);
-        }
-}
-.view-card {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        justify-content: center;
-        gap: 0.375rem;
-        padding: 0.875rem 0.5rem;
-        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
-        border-radius: var(--pv-radius, 12px);
-        background: transparent;
-        cursor: pointer;
-        font-family: inherit;
-        transition: all var(--pv-transition, 200ms ease);
-        -webkit-tap-highlight-color: transparent;
-        user-select: none;
-      }
-.view-card:hover {
-        border-color: var(--pv-accent, #6366F1);
-        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
-      }
-.view-card--active {
-        border-color: var(--pv-accent, #6366F1);
-        background: color-mix(in srgb, var(--pv-accent, #6366F1) 10%, transparent);
-        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
-      }
-.view-icon {
-        fill: var(--pv-text-secondary, #6B7280);
-        transition: fill var(--pv-transition, 200ms ease);
-      }
-.view-card--active .view-icon,
-      .view-card:hover .view-icon {
-        fill: var(--pv-accent, #6366F1);
-      }
-.view-label {
-        font-size: 0.8125rem;
-        font-weight: 500;
-        color: var(--pv-text-secondary, #6B7280);
-        transition: color var(--pv-transition, 200ms ease);
-      }
-.view-card--active .view-label,
-      .view-card:hover .view-label {
-        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
-      }
 @media (max-width: 479px) {
 .field-group { margin-bottom: 1rem; }
-.view-grid { grid-template-columns: repeat(2, 1fr); }
 }
     `,
   ];
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index a6e13a4..2f7a89a 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import { repeat } from 'lit/directives/repeat.js';
 import { keyed } from 'lit/directives/keyed.js';
@@ -62,6 +63,7 @@ export class PvChoresMyDay extends LitElement {
   @property({ attribute: false }) minute = 0;
 
   static styles = [
+    segmentedStyles,
     choresStyles,
     css`
       :host {
@@ -155,31 +157,8 @@ export class PvChoresMyDay extends LitElement {
         font-size: 0.9375rem;
       }
 
-      .seg {
-        display: inline-flex;
-        padding: 3px;
-        border-radius: 10px;
-        background: var(--pv-seg, #ECECE8);
-      }
 
-      .seg button {
-        min-height: 40px;
-        padding: 0 12px;
-        border: none;
-        border-radius: 8px;
-        background: transparent;
-        color: var(--pv-text-secondary, #5F6670);
-        font: inherit;
-        font-size: 0.875rem;
-        font-weight: 650;
-        cursor: pointer;
-      }
 
-      .seg button[aria-pressed='true'] {
-        background: var(--pv-seg-on, #FFFFFF);
-        color: var(--pv-text, #1A1B1E);
-        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
-      }
 
       .goal {
         margin-top: 12px;
@@ -458,7 +437,7 @@ export class PvChoresMyDay extends LitElement {
               <div class="name">${member.name}</div>
               <div class="line">${column.line}</div>
             </div>
-            <div class="seg" role="group" aria-label="My day style">
+            <div class="pv-seg" role="group" aria-label="My day style">
               ${STYLES.map(s => html`
                 <button type="button" aria-pressed=${s.id === style ? 'true' : 'false'}
                   @click=${() => this._fire('pv-my-day-style', { member: member.id, style: s.id })}>${s.label}</button>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
index 4fcb714..e9f27d6 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -49,6 +50,7 @@ export class PvChoresQuickAdd extends LitElement {
   private _closing = false;
 
   static styles = [
+    segmentedStyles,
     buttonStyles,
     sheetStyles,
     css`
@@ -163,31 +165,8 @@ export class PvChoresQuickAdd extends LitElement {
         border-radius: 50%;
       }
 
-      .seg {
-        display: inline-flex;
-        padding: 3px;
-        border-radius: 10px;
-        background: var(--pv-seg, #ECECE8);
-        margin-bottom: 10px;
-      }
 
-      .seg button {
-        min-height: 40px;
-        padding: 0 14px;
-        border: none;
-        border-radius: 8px;
-        background: transparent;
-        color: var(--pv-text-secondary, #5F6670);
-        font: inherit;
-        font-weight: 650;
-        cursor: pointer;
-      }
 
-      .seg button[aria-pressed='true'] {
-        background: var(--pv-seg-on, #FFFFFF);
-        color: var(--pv-text, #1A1B1E);
-        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
-      }
 
       .chips {
         display: flex;
@@ -361,7 +340,7 @@ export class PvChoresQuickAdd extends LitElement {
         </section>
         <section>
           <span class="title">When</span>
-          <div class="seg" role="group" aria-label="When">
+          <div class="pv-seg stretch" role="group" aria-label="When">
             ${when.map(w => html`<button type="button" aria-pressed=${d.when === w.id ? 'true' : 'false'} @click=${() => this._set({ when: w.id })}>${w.label}</button>`)}
           </div>
           ${d.when === 'by' ? html`
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index ce08c33..3e470aa 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -118,6 +119,7 @@ export class PvChoreEditor extends LitElement {
   }
 
   static styles = [
+    segmentedStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -348,7 +350,7 @@ export class PvChoreEditor extends LitElement {
             @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })} />
         </label>
       </div>
-      <div class="segmented" role="group" aria-label="Schedule" style="margin-top: 14px">
+      <div class="pv-seg stretch" role="group" aria-label="Schedule" style="margin-top: 14px">
         ${(['plan', 'once', 'repeats'] as Schedule[]).map(schedule => html`
           <button type="button" aria-pressed=${d.schedule === schedule ? 'true' : 'false'}
             @click=${() => this._change({ schedule })}>${schedule === 'plan' ? 'Plan' : schedule === 'once' ? 'Once' : 'Repeats'}</button>
@@ -412,7 +414,7 @@ export class PvChoreEditor extends LitElement {
         </div>
         ${shared ? html`
           <div class="row">
-            <div class="segmented" role="group" aria-label="How the time is shared">
+            <div class="pv-seg stretch" role="group" aria-label="How the time is shared">
               <button type="button" aria-pressed=${d.split === 'shared' ? 'true' : 'false'}
                 @click=${() => this._change({ split: 'shared', shares: evenShares(d.assignees, d.minutes) })}>Split the time</button>
               <button type="button" aria-pressed=${d.split === 'each' ? 'true' : 'false'}
@@ -466,7 +468,7 @@ export class PvChoreEditor extends LitElement {
           ${this._stepper(d.minutes, minutes => this._setMinutes(minutes), 'time')}
         </div>
         <div class="row">
-          <div class="segmented" role="group" aria-label="Each day or each week">
+          <div class="pv-seg stretch" role="group" aria-label="Each day or each week">
             <button type="button" aria-pressed=${d.per === 'day' ? 'true' : 'false'} @click=${() => this._change({ per: 'day' })}>Each day</button>
             <button type="button" aria-pressed=${d.per === 'week' ? 'true' : 'false'} @click=${() => this._change({ per: 'week' })}>Each week</button>
           </div>
@@ -549,7 +551,7 @@ export class PvChoreEditor extends LitElement {
       <h2 class="section-label">When</h2>
       <div class="group">
         <div class="row">
-          <div class="segmented" role="group" aria-label="When">
+          <div class="pv-seg stretch" role="group" aria-label="When">
             ${(['on', 'by', 'any'] as const).map(when => html`
               <button type="button" aria-pressed=${d.once_when === when ? 'true' : 'false'} @click=${() => this._change({ once_when: when })}>
                 ${when === 'on' ? 'On a day' : when === 'by' ? 'By a date' : 'Any time'}
@@ -590,7 +592,7 @@ export class PvChoreEditor extends LitElement {
         @pv-recurrence-change=${(e: CustomEvent) => this._change({ recurrence: e.detail })}></pv-recurrence-picker>
       ${freq !== 'DAILY' ? html`
         <h2 class="section-label">Each time</h2>
-        <div class="segmented" role="group" aria-label="Each time">
+        <div class="pv-seg stretch" role="group" aria-label="Each time">
           <button type="button" aria-pressed=${d.window === 'day' ? 'true' : 'false'} @click=${() => this._change({ window: 'day' })}>On the day</button>
           <button type="button" aria-pressed=${d.window === 'period' ? 'true' : 'false'} @click=${() => this._change({ window: 'period' })}>
             ${freq === 'MONTHLY' ? 'Any time that month' : 'Any time that week'}
@@ -631,7 +633,7 @@ export class PvChoreEditor extends LitElement {
           okText(d, members) || undefined)}
         <div class="row">
           <span class="row-text">Stars<span class="row-sub">${d.stars === null ? `★ ${automatic} each, from the time` : `★ ${d.stars} each`}</span></span>
-          <div class="segmented" role="group" aria-label="Stars" style="flex: 0 1 260px">
+          <div class="pv-seg stretch" role="group" aria-label="Stars" style="flex: 0 1 260px">
             <button type="button" aria-pressed=${d.stars === null ? 'true' : 'false'} @click=${() => this._change({ stars: null })}>Automatic</button>
             <button type="button" aria-pressed=${d.stars !== null ? 'true' : 'false'}
               @click=${() => this._change({ stars: d.stars ?? automatic })}>Set</button>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
index 7eede3f..8cae35f 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -33,6 +34,7 @@ export class PvPersonChores extends LitElement {
   @state() private _adding: AwayRange | null = null;
 
   static styles = [
+    segmentedStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -95,7 +97,7 @@ export class PvPersonChores extends LitElement {
           <div class="row">
             <div class="stack">
               <span>Needs an OK for</span>
-              <div class="segmented" role="group" aria-label="Needs an OK for">
+              <div class="pv-seg stretch" role="group" aria-label="Needs an OK for">
                 ${NEEDS_OK.map(([id, label]) => html`
                   <button type="button" aria-pressed=${d.needs_ok_for === id ? 'true' : 'false'}
                     @click=${() => this._change({ needs_ok_for: id })}>${label}</button>
@@ -107,7 +109,7 @@ export class PvPersonChores extends LitElement {
         <div class="row">
           <div class="stack">
             <span>My day</span>
-            <div class="segmented" role="group" aria-label="My day">
+            <div class="pv-seg stretch" role="group" aria-label="My day">
               ${MY_DAY.map(([id, label]) => html`
                 <button type="button" aria-pressed=${d.my_day === id ? 'true' : 'false'}
                   @click=${() => this._change({ my_day: id })}>${label}</button>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts
index ee0f1d9..1bfb46f 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -60,6 +61,7 @@ export class PvPersonStars extends LitElement {
   }
 
   static styles = [
+    segmentedStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -108,7 +110,7 @@ export class PvPersonStars extends LitElement {
       <h2 class="section-label">Give or take</h2>
       <div class="group">
         <div class="row">
-          <div class="segmented" role="group" aria-label="Give or take">
+          <div class="pv-seg stretch" role="group" aria-label="Give or take">
             <button type="button" aria-pressed=${this._give ? 'true' : 'false'} @click=${() => { this._give = true; }}>Give</button>
             <button type="button" aria-pressed=${!this._give ? 'true' : 'false'} @click=${() => { this._give = false; }}>Take</button>
           </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
index 6a28776..0d12a0c 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css } from 'lit';
+import { choiceStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -31,6 +32,7 @@ export class PvRulesPage extends LitElement {
   @state() private _pending: Partial<ChoresSettings> = {};
 
   static styles = [
+    choiceStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -40,19 +42,7 @@ export class PvRulesPage extends LitElement {
         max-width: 640px;
       }
 
-      .radio {
-        display: flex;
-        align-items: flex-start;
-        gap: 12px;
-        cursor: pointer;
-      }
 
-      .radio input {
-        width: 20px;
-        height: 20px;
-        margin-top: 2px;
-        accent-color: var(--pv-accent, #6366F1);
-      }
 
       .row .pv-select {
         max-width: 160px;
@@ -73,15 +63,16 @@ export class PvRulesPage extends LitElement {
     const firstDay = this.data?.display?.first_day === 'sunday' ? 'Sunday' : 'Monday';
     return html`
       <h2 class="section-label">If a chore is missed</h2>
-      <div class="group" role="radiogroup" aria-label="If a chore is missed">
+      <div class="pv-choices" role="radiogroup" aria-label="If a chore is missed">
         ${POLICIES.map(policy => html`
-          <label class="row radio">
+          <label class="pv-choice">
             <input type="radio" name="missed" .checked=${settings.missed === policy.id}
               @change=${() => this._save({ missed: policy.id })} />
-            <span class="row-text">
-              <span class="row-title">${policy.label}</span>
-              <span class="row-sub">${policy.description}</span>
+            <span class="choice-text">
+              <span class="choice-title">${policy.label}</span>
+              <span class="choice-sub">${policy.description}</span>
             </span>
+            <span class="choice-check" aria-hidden="true">✓</span>
           </label>
         `)}
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
index 986dc21..e81ff5b 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
@@ -183,35 +183,12 @@ export const choresSettingsStyles = css`
     font-weight: 600;
   }
 
-  .segmented {
-    display: flex;
-    gap: 4px;
-    padding: 4px;
-    border-radius: 12px;
-    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
-  }
 
-  .row > .segmented {
+  .row > .pv-seg {
     flex: 1;
   }
 
-  .segmented button {
-    flex: 1;
-    min-height: 44px;
-    padding: 0 12px;
-    border: none;
-    border-radius: 9px;
-    background: transparent;
-    color: inherit;
-    font: inherit;
-    cursor: pointer;
-  }
 
-  .segmented button[aria-pressed='true'] {
-    background: var(--pv-card-bg, #FFFFFF);
-    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
-    font-weight: 600;
-  }
 
   .stepper {
     display: inline-flex;
```

`custom_components/planavista/frontend/src/shell/pv-nav-bar.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts b/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
index b25381d..7ba1966 100644
--- a/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
+import { segmentedStyles } from '../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
 import { type Layout, barFits } from '../core/layout';
@@ -34,7 +35,9 @@ export class PvNavBar extends LitElement {
   /** The module's own buttons, between its views and the gear. */
   @property({ attribute: false }) actions: ModuleAction[] = [];
 
-  static styles = css`
+  static styles = [
+    segmentedStyles,
+    css`
     :host {
       display: block;
       background: var(--pv-card-bg, #FFFFFF);
@@ -50,6 +53,7 @@ export class PvNavBar extends LitElement {
     nav {
       display: flex;
       align-items: center;
+      min-height: 56px;
       gap: 12px;
       padding: 0 20px;
     }
@@ -74,41 +78,10 @@ export class PvNavBar extends LitElement {
       border-radius: 10px;
     }
 
-    /* Every control is at least 48 px to the touch; the pill inside is drawn smaller. */
-    .seg,
-    .views {
-      display: flex;
-      align-items: center;
-      min-height: 56px;
-    }
 
-    .seg-inner {
-      display: flex;
-      background: var(--pv-seg, #ECECE8);
-      border-radius: 10px;
-      padding: 3px;
-    }
 
-    .seg-btn {
-      min-height: 48px;
-    }
 
-    .seg-btn span {
-      display: inline-flex;
-      align-items: center;
-      height: 34px;
-      padding: 0 14px;
-      border-radius: 8px;
-      font-size: 0.875rem;
-      font-weight: 650;
-      color: var(--pv-text-secondary, #5F6670);
-    }
 
-    .seg-btn.on span {
-      background: var(--pv-seg-on, #FFFFFF);
-      color: var(--pv-text, #1A1B1E);
-      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
-    }
 
     .views {
       gap: 2px;
@@ -127,30 +100,9 @@ export class PvNavBar extends LitElement {
       display: none;
     }
 
-    .view {
-      min-height: 48px;
-      flex-shrink: 0;
-    }
 
-    .view span {
-      display: inline-flex;
-      align-items: center;
-      height: 36px;
-      padding: 0 14px;
-      border-radius: 9px;
-      font-size: 0.9375rem;
-      font-weight: 650;
-      color: var(--pv-text-secondary, #5F6670);
-    }
 
-    .view.on span {
-      background: var(--pv-accent, #5B5BD6);
-      color: var(--pv-accent-text, #FFFFFF);
-    }
 
-    .view:not(.on):hover span {
-      color: var(--pv-text, #1A1B1E);
-    }
 
     .actions {
       display: flex;
@@ -228,7 +180,8 @@ export class PvNavBar extends LitElement {
       overflow-x: visible;
       margin-left: 0;
     }
-  `;
+  `,
+  ];
 
   connectedCallback(): void {
     super.connectedCallback();
@@ -267,25 +220,17 @@ export class PvNavBar extends LitElement {
     return html`
       <nav aria-label="PlanaVista">
         ${this.modules.length > 1 ? html`
-          <div class="seg" role="group" aria-label="Modules">
-            <div class="seg-inner">
-              ${this.modules.map(mod => html`
-                <button type="button" class="seg-btn ${mod.id === this.activeModule ? 'on' : ''}"
-                  aria-pressed=${mod.id === this.activeModule ? 'true' : 'false'}
-                  @click=${() => this._fire('pv-module-select', { id: mod.id })}>
-                  <span>${mod.label}</span>
-                </button>
-              `)}
-            </div>
+          <div class="pv-seg modules" role="group" aria-label="Modules">
+            ${this.modules.map(mod => html`
+              <button type="button" aria-pressed=${mod.id === this.activeModule ? 'true' : 'false'}
+                @click=${() => this._fire('pv-module-select', { id: mod.id })}>${mod.label}</button>
+            `)}
           </div>
         ` : nothing}
-        <div class="views" role="group" aria-label="Views">
+        <div class="views pv-seg" role="group" aria-label="Views">
           ${this.views.map(view => html`
-            <button type="button" class="view ${view.id === this.activeView ? 'on' : ''}"
-              aria-pressed=${view.id === this.activeView ? 'true' : 'false'}
-              @click=${() => this._fire('pv-view-select', { id: view.id })}>
-              <span>${view.label}</span>
-            </button>
+            <button type="button" class="view" aria-pressed=${view.id === this.activeView ? 'true' : 'false'}
+              @click=${() => this._fire('pv-view-select', { id: view.id })}>${view.label}</button>
           `)}
         </div>
         ${this.actions.length ? html`
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index f31d468..a3e48ef 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { choiceStyles, segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
 import type { HomeAssistant } from 'custom-card-helpers';
@@ -115,6 +116,8 @@ export class PvSettingsPerson extends LitElement {
   }
 
   static styles = [
+    segmentedStyles,
+    choiceStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -234,30 +237,9 @@ export class PvSettingsPerson extends LitElement {
         max-width: 240px;
       }
 
-      .radios {
-        display: flex;
-        flex-direction: column;
-        gap: 4px;
-      }
 
-      .radio {
-        display: flex;
-        align-items: center;
-        gap: 10px;
-        min-height: 48px;
-        cursor: pointer;
-      }
 
-      .radio input {
-        width: 20px;
-        height: 20px;
-        accent-color: var(--pv-accent, #6366F1);
-      }
 
-      .radio .age-hint {
-        color: var(--pv-text-secondary, #6B7280);
-        font-size: 0.875rem;
-      }
 
       .toggle-row {
         display: flex;
@@ -385,7 +367,7 @@ export class PvSettingsPerson extends LitElement {
     return html`
       <fieldset class="field">
         <legend>Picture</legend>
-        <div class="segmented" role="group" aria-label="Picture">
+        <div class="pv-seg stretch" role="group" aria-label="Picture">
           <button type="button" aria-pressed=${kind === 'initial' ? 'true' : 'false'}
             @click=${() => choose({ initial: true })}>Initial</button>
           <button type="button" aria-pressed=${kind === 'emoji' ? 'true' : 'false'}
@@ -417,15 +399,15 @@ export class PvSettingsPerson extends LitElement {
     return html`
       <fieldset class="field">
         <legend>Age group</legend>
-        <div class="radios">
+        <div class="pv-choices">
           ${AGE_GROUP_CHOICES.map(choice => {
             const hint = this._choresOn ? AGE_GROUP_CHORES_HINTS[choice.id] : choice.hint;
             return html`
-              <label class="radio">
+              <label class="pv-choice">
                 <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
                   @change=${() => this._changeDraft(withAgeGroup(this._draft, choice.id))} />
-                <span>${choice.label}</span>
-                ${hint ? html`<span class="age-hint">${hint}</span>` : nothing}
+                <span class="choice-text"><span class="choice-title">${choice.label}</span>${hint ? html`<span class="choice-sub">${hint}</span>` : nothing}</span>
+                <span class="choice-check" aria-hidden="true">✓</span>
               </label>
             `;
           })}
```

`custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts b/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
index 827a6ff..b9b29b9 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -76,6 +77,7 @@ export class PvAppearanceEditor extends LitElement {
   private _page = new AppearancePageController(this);
 
   static styles = [
+    segmentedStyles,
     buttonStyles,
     formStyles,
     settingsPageStyles,
@@ -401,31 +403,8 @@ export class PvAppearanceEditor extends LitElement {
         color: var(--pv-text-secondary, #5F6670);
       }
 
-      /* Motion */
-      .seg {
-        display: inline-flex;
-        flex-wrap: wrap;
-        padding: 3px;
-        border-radius: 12px;
-        background: var(--pv-seg, #ECECE8);
-      }
 
-      .seg-btn {
-        min-height: 48px;
-        padding: 0 16px;
-        border: none;
-        border-radius: 9px;
-        background: transparent;
-        font-weight: 650;
-        color: var(--pv-text-secondary, #5F6670);
-        cursor: pointer;
-      }
 
-      .seg-btn[aria-checked='true'] {
-        background: var(--pv-seg-on, #FFFFFF);
-        color: var(--pv-text, #1A1B1E);
-        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
-      }
     `,
   ];
 
@@ -559,10 +538,10 @@ export class PvAppearanceEditor extends LitElement {
 
   private _renderMotion(chosen: MotionSetting) {
     return html`
-      <div class="seg" role="radiogroup" aria-labelledby="motion-heading"
+      <div class="pv-seg" role="radiogroup" aria-labelledby="motion-heading"
         @keydown=${(e: KeyboardEvent) => this._arrows(e, MOTIONS, chosen, value => this._page.set({ motion: value }, e))}>
         ${MOTIONS.map(motion => html`
-          <button class="seg-btn" type="button" role="radio" data-value=${motion}
+          <button type="button" role="radio" data-value=${motion}
             aria-checked=${motion === chosen ? 'true' : 'false'}
             tabindex=${motion === chosen ? '0' : '-1'}
             @click=${(e: Event) => this._page.set({ motion }, e)}>${MOTION_LABELS[motion]}</button>
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
index 5abe3ce..d937cba 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -65,6 +66,7 @@ export class PvSettingsCustomize extends LitElement {
   private _page = new AppearancePageController(this);
 
   static styles = [
+    segmentedStyles,
     buttonStyles,
     formStyles,
     settingsPageStyles,
@@ -209,7 +211,7 @@ export class PvSettingsCustomize extends LitElement {
         border: 1px solid var(--pv-border, #E7E7E3);
       }
 
-      .editor .pill-group {
+      .editor .pv-seg {
         margin-bottom: 12px;
       }
 
@@ -228,9 +230,6 @@ export class PvSettingsCustomize extends LitElement {
         color: var(--pv-text-secondary, #5F6670);
       }
 
-      .pill-btn {
-        min-height: 48px;
-      }
 
       .border-custom {
         display: flex;
@@ -359,12 +358,12 @@ export class PvSettingsCustomize extends LitElement {
     const hex = own && own.startsWith('#') ? own : '';
     return html`
       <div class="editor" aria-label=${`${ROWS.find(r => r.key === key)?.label} for ${VERSION_LABELS[mode]}`} role="group">
-        <div class="pill-group">
-          <button class="pill-btn ${own === undefined ? 'pill-btn--active' : ''}" type="button"
+        <div class="pv-seg">
+          <button type="button"
             aria-pressed=${own === undefined ? 'true' : 'false'}
             @click=${(e: Event) => this._setColor(mode, key, undefined, e)}>${unset}</button>
           ${key === 'header' ? HEADER_CHOICES.map(choice => html`
-            <button class="pill-btn ${own === choice.key ? 'pill-btn--active' : ''}" type="button"
+            <button type="button"
               aria-pressed=${own === choice.key ? 'true' : 'false'}
               @click=${(e: Event) => this._setColor(mode, key, choice.key, e)}>${choice.label}</button>
           `) : nothing}
@@ -391,9 +390,9 @@ export class PvSettingsCustomize extends LitElement {
           return html`
             <div role="group" aria-label=${group.label}>
               <span class="shape-label">${group.label}</span>
-              <div class="pill-group">
+              <div class="pv-seg">
                 ${group.options.map(([value, label]) => html`
-                  <button class="pill-btn ${chosen === value ? 'pill-btn--active' : ''}" type="button"
+                  <button type="button"
                     aria-pressed=${chosen === value ? 'true' : 'false'}
                     @click=${(e: Event) => this._setShape({ [group.key]: value } as Partial<ThemeShape>, e)}>${label}</button>
                 `)}
@@ -403,14 +402,14 @@ export class PvSettingsCustomize extends LitElement {
         })}
         <div role="group" aria-label="Avatar border">
           <span class="shape-label">Avatar border</span>
-          <div class="pill-group">
-            <button class="pill-btn ${border === 'primary' ? 'pill-btn--active' : ''}" type="button"
+          <div class="pv-seg">
+            <button type="button"
               aria-pressed=${border === 'primary' ? 'true' : 'false'}
               @click=${(e: Event) => this._setShape({ avatar_border: 'primary' }, e)}>Their color</button>
-            <button class="pill-btn ${border === 'white' || border === 'light' ? 'pill-btn--active' : ''}" type="button"
+            <button type="button"
               aria-pressed=${border === 'white' || border === 'light' ? 'true' : 'false'}
               @click=${(e: Event) => this._setShape({ avatar_border: 'white' }, e)}>White</button>
-            <button class="pill-btn ${custom ? 'pill-btn--active' : ''}" type="button"
+            <button type="button"
               aria-pressed=${custom ? 'true' : 'false'}
               @click=${(e: Event) => this._setShape({ avatar_border: custom ? border : CUSTOM_BORDER }, e)}>Custom</button>
           </div>
```

`custom_components/planavista/frontend/src/styles/controls.ts` (new):

```ts
import { css } from 'lit';

/**
 * The one look for each kind of choice (DESIGN_SYSTEM section 11, milestone 8).
 *
 * - Pick one of a few: `.pv-seg`, a grey track whose chosen button carries a
 *   white chip. Buttons mark the choice with aria-pressed (or aria-checked in a
 *   radiogroup). Every button is 48 px tall; the chip is drawn inside it, so
 *   the whole button is the target. `.stretch` fills the row with equal parts.
 * - Pick one of a list of named choices with a line of explanation:
 *   `.pv-choices` holding `label.pv-choice` rows around a real radio input; the
 *   chosen row shows a check, as in a phone's settings.
 */
export const segmentedStyles = css`
  .pv-seg {
    display: inline-flex;
    align-items: stretch;
    gap: 2px;
    max-width: 100%;
    height: 48px;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: 13px;
    background: var(--pv-seg, #ECECE8);
  }

  .pv-seg.stretch {
    display: flex;
    width: 100%;
  }

  .pv-seg.stretch > button {
    flex: 1 1 0;
    min-width: 0;
  }

  .pv-seg > button {
    position: relative;
    isolation: isolate;
    min-width: 48px;
    height: 48px;
    padding: 0 14px;
    border: none;
    background: none;
    color: var(--pv-text-secondary, #5F6670);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 650;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-seg > button::before {
    content: '';
    position: absolute;
    inset: 5px 0;
    z-index: -1;
    border-radius: 9px;
  }

  .pv-seg > button[aria-pressed='true'],
  .pv-seg > button[aria-checked='true'] {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button[aria-pressed='true']::before,
  .pv-seg > button[aria-checked='true']::before {
    background: var(--pv-seg-on, #FFFFFF);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }

  .pv-seg > button:not([aria-pressed='true']):not([aria-checked='true']):not(:disabled):hover {
    color: var(--pv-text, #1A1B1E);
  }

  .pv-seg > button:focus-visible {
    outline: none;
  }

  .pv-seg > button:focus-visible::before {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -1px;
  }

  .pv-seg > button:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

export const choiceStyles = css`
  .pv-choices {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: 12px;
    background: var(--pv-card-bg, #FFFFFF);
    overflow: hidden;
  }

  .pv-choice {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 10px 14px;
    box-sizing: border-box;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-choice + .pv-choice {
    border-top: 1px solid var(--pv-border, #E7E7E3);
  }

  .pv-choice input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    margin: 0;
    pointer-events: none;
  }

  .pv-choice .choice-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pv-choice .choice-title {
    font-weight: 600;
    color: var(--pv-text, #1A1B1E);
  }

  .pv-choice .choice-sub {
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--pv-text-secondary, #5F6670);
  }

  .pv-choice .choice-check {
    flex: none;
    width: 22px;
    text-align: center;
    font-weight: 800;
    color: var(--pv-accent-ink, #5B5BD6);
    visibility: hidden;
  }

  .pv-choice:has(input:checked) .choice-check {
    visibility: visible;
  }

  .pv-choice:has(input:focus-visible) {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: -2px;
  }
`;
```

`custom_components/planavista/frontend/src/styles/settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/settings.ts b/custom_components/planavista/frontend/src/styles/settings.ts
index 961bf70..ece84ca 100644
--- a/custom_components/planavista/frontend/src/styles/settings.ts
+++ b/custom_components/planavista/frontend/src/styles/settings.ts
@@ -22,48 +22,9 @@ export const settingsPageStyles = css`
         line-height: 1.5;
       }
 /* ── Pill group (time format / first day) ───────────────── */
-.pill-group {
-        display: flex;
-        gap: 8px;
-        flex-wrap: wrap;
-      }
-.pill-btn {
-        display: inline-flex;
-        align-items: center;
-        justify-content: center;
-        padding: 0.5rem 1.25rem;
-        min-height: 44px;
-        border-radius: 9999px;
-        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
-        background: transparent;
-        color: var(--pv-text-secondary, #6B7280);
-        font-family: inherit;
-        font-size: 0.9375rem;
-        font-weight: 500;
-        cursor: pointer;
-        transition: all var(--pv-transition, 200ms ease);
-        -webkit-tap-highlight-color: transparent;
-        user-select: none;
-      }
-.pill-btn:hover {
-        border-color: var(--pv-accent, #6366F1);
-        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
-        background: color-mix(in srgb, var(--pv-accent, #6366F1) 5%, transparent);
-      }
-.pill-btn--active {
-        border-color: var(--pv-accent, #6366F1);
-        background: var(--pv-accent, #6366F1);
-        color: var(--pv-accent-text, #FFFFFF);
-      }
-.pill-btn--active:hover {
-        opacity: 0.9;
-        color: var(--pv-accent-text, #FFFFFF);
-        background: var(--pv-accent, #6366F1);
-      }
 @media (max-width: 479px) {
 .page-title { font-size: 1.125rem; }
 .page-subtitle { font-size: 0.8125rem; margin-bottom: 1.25rem; }
-.pill-btn { padding: 0.375rem 0.875rem; min-height: 38px; font-size: 0.8125rem; }
 }
 @media (min-width: 480px) and (max-width: 767px) {
 .page-title { font-size: 1.25rem; }
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `998 passed`; the task's own files `187 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** The bar's module switcher and views, My day's style, quick add's When, Motion, and every Settings segment draw the same grey track and white chip, at 1280 by 800, 800 by 1280, and 390 by 844, light and dark.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one control for picking one of a few, everywhere

The module switcher, the views, My day's style, quick add's When,
Motion, the calendar's options, Customize, every chores editor's
segments, the repeat picker, and a person's Picture now share one
segmented control: a grey track with a white chip on the choice, 48 px
tall. The bar's views no longer use the accent fill. Age group and the
missed rule become a grouped list with a check on the chosen row.
```

---

### Task 2: One button family, one red, one switch, one tag, and 48 px targets

Spec 3.9 (tags, switches, buttons, touch targets), 3.10 (delete in place).

**Files:**
- Modify: `custom_components/planavista/frontend/src/core/color-swatch-picker.ts`, `custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`, `custom_components/planavista/frontend/src/core/pv-toast.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pin-actions.ts`, `custom_components/planavista/frontend/src/shell/setup/people-step.ts`, `custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`, `custom_components/planavista/frontend/src/styles/controls.ts`, `custom_components/planavista/frontend/src/styles/shared.ts`, `custom_components/planavista/frontend/src/styles/theme-pairs.ts`, `custom_components/planavista/frontend/test/controls.test.ts`, `custom_components/planavista/frontend/test/options-derive.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/controls.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/controls.test.ts b/custom_components/planavista/frontend/test/controls.test.ts
index 72ef25d..ae09a02 100644
--- a/custom_components/planavista/frontend/test/controls.test.ts
+++ b/custom_components/planavista/frontend/test/controls.test.ts
@@ -36,6 +36,66 @@ describe('one control for each kind of choice (milestone 8, spec 3.9)', () => {
     expect(button).toMatch(/min-width:\s*48px/);
   });
 
+  it('every button looks like one family, and disabled buttons look disabled', () => {
+    const shared = FILES.find(f => f.path === 'styles/shared.ts')!.text;
+    const btn = /\n {2}\.pv-btn \{([^}]*)\}/.exec(shared)?.[1] ?? '';
+    expect(btn).toMatch(/min-height:\s*48px/);
+    expect(btn).toMatch(/font-weight:\s*600/);
+    expect(btn).toMatch(/border-radius:\s*var\(--pv-radius,/);
+    expect(shared).toMatch(/\.pv-btn:disabled[^{]*\{[^}]*opacity:\s*0\.45/);
+    expect(shared).toMatch(/\.pv-btn-danger \{[^}]*var\(--pv-danger,/);
+    expect(shared).toMatch(/\.pv-btn\.danger \{[^}]*var\(--pv-danger-ink,/);
+  });
+
+  it('one red pair for destructive actions, light and dark', () => {
+    const themes = FILES.find(f => f.path === 'styles/theme-pairs.ts')!.text;
+    expect(themes.match(/'--pv-danger-ink':/g)?.length).toBeGreaterThanOrEqual(2);
+  });
+
+  it('one switch for every on and off setting, a 48 px target', () => {
+    for (const f of FILES) expect(f.text, f.path).not.toMatch(/\n\s*\.switch \{/);
+    const shared = FILES.find(f => f.path === 'styles/shared.ts')!.text;
+    expect(shared).toMatch(/\.pv-toggle::before \{[^}]*inset:\s*-12px/);
+    expect(shared).toMatch(/\.pv-toggle\[aria-checked='true'\]/);
+  });
+
+  it('one tag, in sentence case', () => {
+    for (const f of FILES) if (f.path !== 'styles/controls.ts') expect(f.text, f.path).not.toMatch(/\n\s*\.tag \{/);
+    expect(FILES.find(f => f.path === 'styles/controls.ts')!.text).toMatch(/\.pv-tag \{/);
+  });
+
+  it('section heads are sentence case everywhere', () => {
+    for (const f of FILES) expect(f.text, f.path).not.toMatch(/text-transform:\s*uppercase/);
+  });
+
+  // Controls a finger uses that were drawn under 48 px (DESIGN_SYSTEM 11, spec 11.8).
+  const TARGETS: Array<[string, string]> = [
+    ['core/color-swatch-picker.ts', '.swatch-btn'], ['core/pv-recurrence-picker.ts', '.day'], ['core/pv-recurrence-picker.ts', 'select'],
+    ['core/pv-toast.ts', 'button'], ['modules/chores/pv-chore-options.ts', '.chip'], ["modules/chores/pv-chore-options.ts", "input[type='text']"],
+    ['modules/chores/pv-chores-day-sheet.ts', '.link'], ['modules/chores/pv-chores-inbox.ts', '.done'], ['modules/chores/pv-chores-inbox.ts', '.link'],
+    ['modules/chores/pv-chores-inbox.ts', '.answers button'], ['modules/chores/pv-chores-inbox.ts', '.chip'], ['modules/chores/pv-chores-inbox.ts', 'input'],
+    ['modules/chores/pv-chores-my-day.ts', '.tl-row'], ['modules/chores/pv-chores-quick-add.ts', '.text'], ['modules/chores/pv-chores-quick-add.ts', '.chip'],
+    ['modules/chores/pv-chores-quick-add.ts', '.stepper button'], ['modules/chores/pv-chores-reward-sheet.ts', '.toggle'],
+    ['modules/chores/pv-chores-reward-sheet.ts', '.pictures button'], ['modules/chores/pv-chores-rewards.ts', '.card .action'],
+    ['modules/chores/pv-chores-week.ts', '.nav'], ['modules/chores/pv-chores-week.ts', '.highlights .link'],
+    ['modules/chores/settings/pv-chore-editor.ts', '.name-row input'], ['modules/chores/settings/pv-chore-editor.ts', '.day'],
+    ['modules/chores/settings/pv-chore-editor.ts', '.copy'], ['modules/chores/settings/pv-chores-list-page.ts', '.finished-link'],
+    ['modules/chores/settings/pv-import-preview.ts', '.link'], ['modules/chores/settings/pv-person-chores.ts', '.remove'],
+    ['modules/chores/settings/pv-person-phones.ts', '.copy'], ['modules/chores/settings/pv-reward-editor.ts', '.name-row input'],
+    ['modules/chores/settings/settings-styles.ts', '.chip'], ['modules/chores/settings/settings-styles.ts', '.stepper button'],
+    ['modules/chores/setup/pv-setup-common-chores.ts', '.chip'], ['shell/settings/pin-actions.ts', '.buttons button'],
+    ['shell/setup/people-step.ts', '.role'], ['shell/setup/pv-setup.ts', '.second'],
+  ];
+
+  it.each(TARGETS)('%s %s is at least 48 px', (path, selector) => {
+    const text = FILES.find(f => f.path === path)!.text;
+    const rule = new RegExp('\\n\\s*' + selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\{([^}]*)\\}').exec(text)?.[1];
+    expect(rule, `${path} ${selector}`).toBeDefined();
+    const sizes = [...rule!.matchAll(/(?:^|[\s;])(min-height|height|min-width|width):\s*(\d+)px/g)].map(m => Number(m[2]));
+    expect(sizes.length).toBeGreaterThan(0);
+    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(48);
+  });
+
   it('named choices with a line of explanation are rows with a check, not bare radios', () => {
     const person = FILES.find(f => f.path === 'shell/settings/person-page.ts')!.text;
     const rules = FILES.find(f => f.path === 'modules/chores/settings/pv-rules-page.ts')!.text;
```

`custom_components/planavista/frontend/test/options-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/options-derive.test.ts b/custom_components/planavista/frontend/test/options-derive.test.ts
index 8e823c6..20315ce 100644
--- a/custom_components/planavista/frontend/test/options-derive.test.ts
+++ b/custom_components/planavista/frontend/test/options-derive.test.ts
@@ -40,7 +40,7 @@ describe('itemOptions (spec 13.3)', () => {
   it('offers a member planning, requests, done by someone else, and history', () => {
     const options = itemOptions(ctx({}));
     expect(ids(options.member)).toEqual(['plan_day', 'more_time', 'skip', 'done_by', 'history']);
-    expect(options.member[1]).toMatchObject({ tag: 'needs OK', hint: 'Sends a request to Alex and Blair.' });
+    expect(options.member[1]).toMatchObject({ tag: 'Needs an OK', hint: 'Sends a request to Alex and Blair.' });
     expect(options.member[0].hint).toBe('Shows on that day, and it\'s still due Sunday.');
     expect(options.title).toBe('Yard work');
     expect(options.meta).toBe('Casey · Every week · 1 h · ★ 4');
@@ -51,7 +51,7 @@ describe('itemOptions (spec 13.3)', () => {
     const shared = itemOptions(ctx({}));
     expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'edit', 'delete']);
     expect(shared.parent.find(o => o.id === 'edit')!.hint).toBe('Opens it in Settings.');
-    expect(shared.parent.every(o => o.tag === '🔒 parent')).toBe(true);
+    expect(shared.parent.every(o => o.tag === '🔒 Parent')).toBe(true);
     expect(itemOptions(ctx({ parent: 'no' })).parent).toEqual([]);
     expect(itemOptions(ctx({ parent: 'yes' })).parent[0].tag).toBeUndefined();
   });
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/controls.test.ts test/options-derive.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/color-swatch-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/color-swatch-picker.ts b/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
index b51f942..661a5ce 100644
--- a/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
+++ b/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
@@ -135,8 +135,8 @@ export class PvColorSwatchPicker extends LitElement {
 
       /* Each cell is a 44×44 touch target */
       .swatch-btn {
-        width: 44px;
-        height: 44px;
+        width: 48px;
+        height: 48px;
         padding: 6px;
         background: transparent;
         border: none;
```

`custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
index 7afced1..30d0ea5 100644
--- a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
+++ b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
@@ -76,8 +76,8 @@ export class PvRecurrencePicker extends LitElement {
 
     .stepper button,
     .day {
-      width: 44px;
-      height: 44px;
+      width: 48px;
+      height: 48px;
       border: 1px solid var(--pv-border-subtle, #E5E7EB);
       background: var(--pv-card-bg, #FFFFFF);
       color: inherit;
@@ -115,7 +115,7 @@ export class PvRecurrencePicker extends LitElement {
 
     input,
     select {
-      min-height: 44px;
+      min-height: 48px;
       padding: 0 10px;
       border-radius: 10px;
       border: 1px solid var(--pv-border-subtle, #E5E7EB);
```

`custom_components/planavista/frontend/src/core/pv-toast.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-toast.ts b/custom_components/planavista/frontend/src/core/pv-toast.ts
index 6b93d83..957043b 100644
--- a/custom_components/planavista/frontend/src/core/pv-toast.ts
+++ b/custom_components/planavista/frontend/src/core/pv-toast.ts
@@ -79,7 +79,7 @@ export class PvToast extends LitElement {
 
     button {
       flex-shrink: 0;
-      min-height: 40px;
+      min-height: 48px;
       min-width: 48px;
       padding: 0 10px;
       border: none;
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 777e6c2..63d049a 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -100,9 +100,7 @@ export class PVViewDay extends LitElement {
         justify-content: center;
         font-size: 0.6875rem;
         color: var(--pv-text-muted);
-        text-transform: uppercase;
         font-weight: 500;
-        letter-spacing: 0.04em;
       }
 
       .all-day-events {
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
index 24508c3..67cf298 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
@@ -74,8 +74,6 @@ export class PVViewMonth extends LitElement {
         padding: 0.5rem 0;
         font-size: 0.6875rem;
         font-weight: 600;
-        text-transform: uppercase;
-        letter-spacing: 0.04em;
         color: var(--pv-text-muted);
       }
 
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index 35dfa83..193ba76 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -23,7 +23,7 @@ export interface OptionModel {
   id: OptionId;
   label: string;
   hint?: string;
-  /** Says what unlocks it ("🔒 parent", "🔒 Casey's PIN"), or that it asks the parents ("needs OK"). */
+  /** Says what unlocks it ("🔒 Parent", "🔒 Casey's PIN"), or that it asks the parents ("Needs OK"). */
   tag?: string;
   chips?: DayChip[];
   /** A date picker for anything the chips don't offer. */
@@ -157,7 +157,7 @@ export function itemOptions(ctx: OptionsContext): OptionsModel {
   const parents = members.filter(m => m.parent && m.id !== owner.id);
   const ownerIsParent = owner.parent;
   const memberTag = ctx.member === 'pin' ? `🔒 ${owner.name}'s PIN` : undefined;
-  const parentTag = ctx.parent === 'pin' ? '🔒 parent' : ctx.parent === 'no_pin' ? 'needs a parent\'s PIN' : undefined;
+  const parentTag = ctx.parent === 'pin' ? '🔒 Parent' : ctx.parent === 'no_pin' ? 'Needs a parent\'s PIN' : undefined;
   const status = item.status;
   const open = status === 'open' || status === 'sent_back';
   const member: OptionModel[] = [];
@@ -175,11 +175,11 @@ export function itemOptions(ctx: OptionsContext): OptionsModel {
     }
     if (!ownerIsParent && due && !item.request) {
       member.push({
-        id: 'more_time', label: 'Ask for more time', tag: 'needs OK', chips: moreTimeChips(item, today),
+        id: 'more_time', label: 'Ask for more time', tag: 'Needs an OK', chips: moreTimeChips(item, today),
         pick: { min: addDays(due, 1), max: addDays(today, 60) },
         hint: parents.length ? `Sends a request to ${names(parents)}.` : 'Sends a request to the parents.',
       });
-      member.push({ id: 'skip', label: 'Ask to skip this week', tag: 'needs OK', hint: 'Sick, away, rained out…' });
+      member.push({ id: 'skip', label: 'Ask to skip this week', tag: 'Needs an OK', hint: 'Sick, away, rained out…' });
     }
     member.push({ id: 'done_by', label: 'Done by someone else…', tag: memberTag, hint: 'They get the credit.' });
   }
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
index d4fbaae..fbcfe0b 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { tagStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../../utils/define';
 import { buttonStyles } from '../../styles/shared';
@@ -48,6 +49,7 @@ export class PvChoreOptions extends LitElement {
   private _closing = false;
 
   static styles = [
+    tagStyles,
     buttonStyles,
     sheetStyles,
     choresStyles,
@@ -97,10 +99,8 @@ export class PvChoreOptions extends LitElement {
 
       .group {
         margin: 14px 2px 2px;
-        font-size: 0.75rem;
+        font-size: 0.8125rem;
         font-weight: 750;
-        text-transform: uppercase;
-        letter-spacing: 0.04em;
         color: var(--pv-text-muted, #8E949C);
       }
 
@@ -163,21 +163,7 @@ export class PvChoreOptions extends LitElement {
         line-height: 1.35;
       }
 
-      .tag {
-        flex-shrink: 0;
-        padding: 3px 8px;
-        border-radius: 8px;
-        background: var(--pv-chip, #F1F1EE);
-        color: var(--pv-text-secondary, #5F6670);
-        font-size: 0.75rem;
-        font-weight: 700;
-        white-space: nowrap;
-      }
 
-      .tag.ask {
-        background: var(--pv-warn-bg, #FDF1DC);
-        color: var(--pv-warn-ink, #8A5A00);
-      }
 
       .chips {
         display: flex;
@@ -187,7 +173,7 @@ export class PvChoreOptions extends LitElement {
       }
 
       .chip {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 14px;
         border-radius: 999px;
         border: 1px solid var(--pv-border, #E7E7E3);
@@ -206,7 +192,7 @@ export class PvChoreOptions extends LitElement {
 
       input[type='date'],
       input[type='text'] {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 12px;
         border-radius: 12px;
         border: 1px solid var(--pv-border, #E7E7E3);
@@ -295,7 +281,7 @@ export class PvChoreOptions extends LitElement {
             <span class="label">${option.label}</span>
             ${option.hint ? html`<span class="hint">${option.hint}</span>` : nothing}
           </span>
-          ${option.tag ? html`<span class="tag ${option.tag === 'needs OK' ? 'ask' : ''}">${option.tag}</span>` : nothing}
+          ${option.tag ? html`<span class="pv-tag ${option.tag === 'Needs an OK' ? 'ask' : 'muted'}">${option.tag}</span>` : nothing}
         </button>
         ${open ? this._more(option) : nothing}
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
index 4d0cbd3..3b7a2ed 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
@@ -88,7 +88,7 @@ export class PvChoresDaySheet extends LitElement {
       }
 
       .link {
-        min-height: 40px;
+        min-height: 48px;
         border: none;
         background: transparent;
         color: var(--pv-accent-ink, #5B5BD6);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
index a2ffa9f..c8f7739 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
@@ -92,7 +92,7 @@ export class PvChoresInbox extends LitElement {
       }
 
       .done {
-        min-height: 44px;
+        min-height: 48px;
         font-weight: 750;
       }
 
@@ -107,7 +107,7 @@ export class PvChoresInbox extends LitElement {
       }
 
       .link {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 4px;
         border: none;
         background: transparent;
@@ -147,7 +147,7 @@ export class PvChoresInbox extends LitElement {
       }
 
       .answers button {
-        min-height: 44px;
+        min-height: 48px;
         padding: 0 14px;
       }
 
@@ -174,7 +174,7 @@ export class PvChoresInbox extends LitElement {
       }
 
       .chip {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 14px;
         border-radius: 999px;
         border: 1px solid var(--pv-border, #E7E7E3);
@@ -186,7 +186,7 @@ export class PvChoresInbox extends LitElement {
       }
 
       input {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 12px;
         border-radius: 12px;
         border: 1px solid var(--pv-border, #E7E7E3);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index 2f7a89a..aad7177 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -198,7 +198,7 @@ export class PvChoresMyDay extends LitElement {
         grid-template-columns: 56px minmax(0, 1fr);
         gap: 8px;
         align-items: center;
-        min-height: 40px;
+        min-height: 48px;
       }
 
       .tl-time {
@@ -210,10 +210,8 @@ export class PvChoresMyDay extends LitElement {
 
       .tl-band {
         margin: 14px 0 4px 64px;
-        font-size: 0.75rem;
+        font-size: 0.8125rem;
         font-weight: 750;
-        letter-spacing: 0.06em;
-        text-transform: uppercase;
         color: var(--pv-text-muted, #8E949C);
       }
 
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
index e9f27d6..1f8f256 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
@@ -3,7 +3,7 @@ import { segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
-import { buttonStyles } from '../../styles/shared';
+import { buttonStyles, formStyles } from '../../styles/shared';
 import { sheetStyles } from '../../styles/sheet';
 import { trapTab } from '../../core/focus';
 import type { Layout } from '../../core/layout';
@@ -50,6 +50,7 @@ export class PvChoresQuickAdd extends LitElement {
   private _closing = false;
 
   static styles = [
+    formStyles,
     segmentedStyles,
     buttonStyles,
     sheetStyles,
@@ -78,7 +79,7 @@ export class PvChoresQuickAdd extends LitElement {
       }
 
       .text {
-        min-height: 44px;
+        min-height: 48px;
         padding: 0 8px;
         border: none;
         background: transparent;
@@ -176,7 +177,7 @@ export class PvChoresQuickAdd extends LitElement {
       }
 
       .chip {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 14px;
         border-radius: 999px;
         border: 1px solid var(--pv-border, #E7E7E3);
@@ -205,37 +206,9 @@ export class PvChoresQuickAdd extends LitElement {
         font-size: 0.8125rem;
       }
 
-      .switch {
-        position: relative;
-        width: 52px;
-        height: 32px;
-        flex-shrink: 0;
-        border: none;
-        border-radius: 999px;
-        background: var(--pv-track, #ECECE8);
-        cursor: pointer;
-      }
 
-      .switch::after {
-        content: '';
-        position: absolute;
-        top: 3px;
-        left: 3px;
-        width: 26px;
-        height: 26px;
-        border-radius: 50%;
-        background: #FFFFFF;
-        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
-        transition: transform 180ms ease;
-      }
 
-      .switch[aria-checked='true'] {
-        background: var(--pv-accent, #5B5BD6);
-      }
 
-      .switch[aria-checked='true']::after {
-        transform: translateX(20px);
-      }
 
       .worth {
         color: var(--pv-text-secondary, #5F6670);
@@ -250,8 +223,8 @@ export class PvChoresQuickAdd extends LitElement {
       }
 
       .stepper button {
-        min-width: 44px;
-        min-height: 44px;
+        min-width: 48px;
+        min-height: 48px;
       }
 
       .problem {
@@ -380,7 +353,7 @@ export class PvChoresQuickAdd extends LitElement {
               <div>Needs a parent's OK</div>
               <div class="caption">On for young children automatically</div>
             </div>
-            <button class="switch" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
+            <button class="pv-toggle" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
               @click=${() => this._set({ needsOk: !d.needsOk, needsOkSet: true })}></button>
           </div>
         </section>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
index e99eac5..a70c540 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
@@ -2,7 +2,7 @@ import { LitElement, html, css, nothing } from 'lit';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
-import { buttonStyles } from '../../styles/shared';
+import { buttonStyles, formStyles } from '../../styles/shared';
 import { sheetStyles } from '../../styles/sheet';
 import { trapTab } from '../../core/focus';
 import type { Layout } from '../../core/layout';
@@ -42,6 +42,7 @@ export class PvChoresRewardSheet extends LitElement {
   private _started = false;
 
   static styles = [
+    formStyles,
     buttonStyles,
     sheetStyles,
     css`
@@ -79,7 +80,7 @@ export class PvChoresRewardSheet extends LitElement {
       }
 
       .toggle {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 12px;
         border-radius: 999px;
         border: 1px solid var(--pv-border, #E7E7E3);
@@ -125,8 +126,8 @@ export class PvChoresRewardSheet extends LitElement {
       }
 
       .pictures button {
-        width: 44px;
-        height: 44px;
+        width: 48px;
+        height: 48px;
         border-radius: 12px;
         border: 1px solid var(--pv-border, #E7E7E3);
         background: var(--pv-card-bg, #FFFFFF);
@@ -174,37 +175,9 @@ export class PvChoresRewardSheet extends LitElement {
         margin-top: 12px;
       }
 
-      .switch {
-        position: relative;
-        width: 52px;
-        height: 32px;
-        flex-shrink: 0;
-        border: none;
-        border-radius: 999px;
-        background: var(--pv-track, #ECECE8);
-        cursor: pointer;
-      }
 
-      .switch::after {
-        content: '';
-        position: absolute;
-        top: 3px;
-        left: 3px;
-        width: 26px;
-        height: 26px;
-        border-radius: 50%;
-        background: #FFFFFF;
-        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
-        transition: transform 180ms ease;
-      }
 
-      .switch[aria-checked='true'] {
-        background: var(--pv-accent, #5B5BD6);
-      }
 
-      .switch[aria-checked='true']::after {
-        transform: translateX(20px);
-      }
 
       .problem {
         margin-top: 8px;
@@ -308,7 +281,7 @@ export class PvChoresRewardSheet extends LitElement {
         @input=${(e: Event) => this._set({ cost: Math.round(Number((e.target as HTMLInputElement).value)) })} />
       <div class="row">
         <span>Needs a parent's OK</span>
-        <button class="switch" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
+        <button class="pv-toggle" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
           @click=${() => this._set({ needsOk: !d.needsOk })}></button>
       </div>
       <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index d8c455d..667be99 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { tagStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -34,6 +35,7 @@ export class PvChoresRewards extends LitElement {
   @property({ type: Boolean }) canEdit = false;
 
   static styles = [
+    tagStyles,
     buttonStyles,
     choresStyles,
     css`
@@ -164,18 +166,7 @@ export class PvChoresRewards extends LitElement {
         gap: 4px;
       }
 
-      .tag {
-        padding: 2px 6px;
-        border-radius: 6px;
-        background: var(--pv-chip, #F1F1EE);
-        color: var(--pv-text-secondary, #5F6670);
-        font-size: 0.75rem;
-        font-weight: 700;
-      }
 
-      .tag.ok {
-        color: var(--pv-text, #1A1B1E);
-      }
 
       .goal-tag {
         position: absolute;
@@ -185,7 +176,7 @@ export class PvChoresRewards extends LitElement {
 
       .card .action {
         margin-top: auto;
-        min-height: 44px;
+        min-height: 48px;
         width: 100%;
       }
 
@@ -258,14 +249,14 @@ export class PvChoresRewards extends LitElement {
     const asked = card.asked.length;
     return html`
       <div class="card">
-        ${card.goals.length ? html`<span class="tag goal-tag">${card.goals.map(m => `${m.name}'s goal`).join(', ')}</span>` : nothing}
+        ${card.goals.length ? html`<span class="pv-tag goal-tag">${card.goals.map(m => `${m.name}'s goal`).join(', ')}</span>` : nothing}
         <button class="open" type="button" @click=${() => this._fire('pv-reward-open', { reward: reward.id })}>
           <span class="icon" aria-hidden="true">${pictureOf(reward.icon)}</span>
           <span class="name">${reward.name}</span>
           <span class="cost num">★ ${reward.cost}</span>
         </button>
         <div class="tags">
-          ${card.people.map(p => html`<span class="tag ${p.afford ? 'ok' : ''}">${p.member.name}${p.afford ? ' ✓' : `: ${p.more} more`}</span>`)}
+          ${card.people.map(p => html`<span class="pv-tag muted ${p.afford ? 'ok' : ''}">${p.member.name}${p.afford ? ' ✓' : `: ${p.more} more`}</span>`)}
           ${asked ? html`<span class="badge act">⏳ ${card.asked.map(m => m.name).join(', ')} · Waiting for OK</span>` : nothing}
         </div>
         ${card.canRedeem
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
index 6252bfa..24773ac 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
@@ -74,8 +74,8 @@ export class PvChoresWeek extends LitElement {
       }
 
       .nav {
-        width: 44px;
-        height: 44px;
+        width: 48px;
+        height: 48px;
         border-radius: 12px;
         border: 1px solid var(--pv-border, #E7E7E3);
         background: var(--pv-card-bg, #FFFFFF);
@@ -280,7 +280,7 @@ export class PvChoresWeek extends LitElement {
       }
 
       .highlights .link {
-        min-height: 40px;
+        min-height: 48px;
         border: none;
         background: transparent;
         color: var(--pv-accent-ink, #5B5BD6);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index 3e470aa..5b4b454 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -204,7 +204,7 @@ export class PvChoreEditor extends LitElement {
         font: inherit;
         font-size: 1.0625rem;
         color: inherit;
-        min-height: 44px;
+        min-height: 48px;
       }
 
       .name-row input:focus {
@@ -262,8 +262,8 @@ export class PvChoreEditor extends LitElement {
       }
 
       .day {
-        width: 44px;
-        height: 44px;
+        width: 48px;
+        height: 48px;
         border-radius: 50%;
         border: 1px solid var(--pv-border-subtle, #E5E7EB);
         background: var(--pv-card-bg, #FFFFFF);
@@ -305,7 +305,7 @@ export class PvChoreEditor extends LitElement {
       }
 
       .copy {
-        min-height: 40px;
+        min-height: 48px;
         margin-left: auto;
       }
 
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
index b20b462..7bbb575 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
@@ -110,7 +110,7 @@ export class PvChoresListPage extends LitElement {
         font: inherit;
         font-weight: 600;
         cursor: pointer;
-        min-height: 44px;
+        min-height: 48px;
       }
     `,
   ];
@@ -186,7 +186,7 @@ export class PvChoresListPage extends LitElement {
           <span class="row-sub">${row.rhythm}</span>
           ${row.tags.length ? html`
             <span class="row-tags">
-              ${row.tags.map(tag => html`<span class="tag ${tag === 'Plan only' ? 'tag--muted' : tag === 'No one yet' ? 'tag--attention' : ''}">${tag}</span>`)}
+              ${row.tags.map(tag => html`<span class="pv-tag ${tag === 'Plan only' ? 'muted' : tag === 'No one yet' ? 'attention' : ''}">${tag}</span>`)}
             </span>
           ` : nothing}
         </span>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
index acb216b..b2fe568 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
@@ -125,7 +125,7 @@ export class PvImportPreview extends LitElement {
         font: inherit;
         font-weight: 600;
         cursor: pointer;
-        min-height: 40px;
+        min-height: 48px;
         white-space: nowrap;
       }
 
@@ -217,7 +217,7 @@ export class PvImportPreview extends LitElement {
                     <span class="row-title">${person.name}</span>
                     <span class="row-sub">${personLine(person, this.choices, this.members, this.timeFormat)}</span>
                   </span>
-                  ${isNew ? html`<span class="tag">New</span>` : nothing}
+                  ${isNew ? html`<span class="pv-tag">New</span>` : nothing}
                   <select class="pv-input pv-select" aria-label="Who ${person.name} is" .value=${match ?? ''}
                     @change=${(e: Event) => this._pickPerson(person.ref, (e.target as HTMLSelectElement).value)}>
                     <option value="" ?selected=${!match}>New person</option>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
index 8cae35f..f0f29c3 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
@@ -70,7 +70,7 @@ export class PvPersonChores extends LitElement {
       }
 
       .remove {
-        min-height: 40px;
+        min-height: 48px;
         margin-left: auto;
       }
     `,
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts
index f8f7425..14a7280 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts
@@ -73,7 +73,7 @@ export class PvPersonPhones extends LitElement {
       }
 
       .copy {
-        min-height: 40px;
+        min-height: 48px;
         margin-left: auto;
       }
 
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
index 0634f47..0ed1894 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
@@ -137,7 +137,7 @@ export class PvRewardEditor extends LitElement {
 
       .name-row input {
         flex: 1;
-        min-height: 44px;
+        min-height: 48px;
         border: none;
         background: transparent;
         color: inherit;
```

`custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
index e81ff5b..9579095 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
@@ -1,21 +1,22 @@
 import { css } from 'lit';
+import { tagStyles } from '../../../styles/controls';
 
 /**
  * The chores Settings pages' look (the approved settings-editors mockup):
  * small headings over grouped cards of rows, tags as pills, person chips,
  * steppers, and segmented controls. Built on the card's theme tokens.
  */
-export const choresSettingsStyles = css`
+export const choresSettingsStyles = [
+  tagStyles,
+  css`
   :host {
     display: block;
   }
 
   .section-label {
     margin: 22px 4px 8px;
-    font-size: 0.75rem;
-    font-weight: 700;
-    letter-spacing: 0.06em;
-    text-transform: uppercase;
+    font-size: 0.8125rem;
+    font-weight: 750;
     color: var(--pv-text-secondary, #6B7280);
   }
 
@@ -109,26 +110,8 @@ export const choresSettingsStyles = css`
     margin-top: 2px;
   }
 
-  .tag {
-    flex-shrink: 0;
-    padding: 3px 9px;
-    border-radius: 999px;
-    font-size: 0.75rem;
-    font-weight: 600;
-    white-space: nowrap;
-    background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, transparent);
-    color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
-  }
 
-  .tag--muted {
-    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
-    color: var(--pv-text-secondary, #6B7280);
-  }
 
-  .tag--attention {
-    background: color-mix(in srgb, #F59E0B 18%, transparent);
-    color: var(--pv-text, #1A1B1E);
-  }
 
   .stars {
     flex-shrink: 0;
@@ -163,7 +146,7 @@ export const choresSettingsStyles = css`
     display: inline-flex;
     align-items: center;
     gap: 6px;
-    min-height: 40px;
+    min-height: 48px;
     padding: 0 14px 0 6px;
     border-radius: 999px;
     border: 1px solid var(--pv-border-subtle, #E5E7EB);
@@ -204,8 +187,8 @@ export const choresSettingsStyles = css`
   }
 
   .stepper button {
-    width: 44px;
-    height: 40px;
+    width: 48px;
+    height: 48px;
     border: 1px solid var(--pv-border-subtle, #E5E7EB);
     border-radius: 10px;
     background: var(--pv-card-bg, #FFFFFF);
@@ -275,4 +258,5 @@ export const choresSettingsStyles = css`
       opacity: 0.5;
     }
   }
-`;
+`,
+];
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts
index 784f1cd..01711cf 100644
--- a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts
@@ -80,10 +80,8 @@ export class PvSetupBoardPreview extends LitElement {
 
     .week {
       margin: 8px 0 4px;
-      font-size: 0.6875rem;
-      font-weight: 700;
-      letter-spacing: 0.05em;
-      text-transform: uppercase;
+      font-size: 0.8125rem;
+      font-weight: 750;
       color: var(--pv-text-secondary, #6B7280);
     }
   `;
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts
index 495b099..fee7313 100644
--- a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts
@@ -175,7 +175,7 @@ export class PvSetupCommonChores extends LitElement {
       }
 
       .chip {
-        min-height: 40px;
+        min-height: 48px;
         padding: 0 12px;
         border-radius: 999px;
         border: 1px solid var(--pv-border-subtle, #E5E7EB);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
index 649681b..7684045 100644
--- a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
@@ -116,10 +116,8 @@ export class PvSetupSharedScreen extends LitElement {
 
       .label {
         margin: 0 4px 8px;
-        font-size: 0.75rem;
-        font-weight: 700;
-        letter-spacing: 0.06em;
-        text-transform: uppercase;
+        font-size: 0.8125rem;
+        font-weight: 750;
         color: var(--pv-text-secondary, #6B7280);
       }
 
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index a3e48ef..177ddba 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -202,35 +202,9 @@ export class PvSettingsPerson extends LitElement {
         opacity: 0.45;
       }
 
-      .segmented {
-        display: inline-flex;
-        gap: 4px;
-        padding: 4px;
-        border-radius: 12px;
-        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
-      }
 
-      .segmented button {
-        min-height: 44px;
-        padding: 0 16px;
-        border: none;
-        border-radius: 9px;
-        background: transparent;
-        color: inherit;
-        font: inherit;
-        cursor: pointer;
-      }
 
-      .segmented button[aria-pressed='true'] {
-        background: var(--pv-card-bg, #FFFFFF);
-        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
-        font-weight: 600;
-      }
 
-      .segmented button:disabled {
-        opacity: 0.4;
-        cursor: not-allowed;
-      }
 
       .emoji {
         margin-top: 10px;
```

`custom_components/planavista/frontend/src/shell/settings/pin-actions.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts b/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
index ad4620a..efc4786 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
@@ -62,7 +62,7 @@ export class PvPinActions extends LitElement {
       }
 
       .buttons button {
-        min-height: 44px;
+        min-height: 48px;
       }
 
       .message {
```

`custom_components/planavista/frontend/src/shell/setup/people-step.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/people-step.ts b/custom_components/planavista/frontend/src/shell/setup/people-step.ts
index 90c1ded..93d5a63 100644
--- a/custom_components/planavista/frontend/src/shell/setup/people-step.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/people-step.ts
@@ -118,7 +118,7 @@ export class PvSetupPeople extends LitElement {
       .role {
         width: auto;
         min-width: 150px;
-        min-height: 44px;
+        min-height: 48px;
       }
 
       .add {
```

`custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
index 2351d6f..b62d395 100644
--- a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
@@ -199,7 +199,7 @@ export class PvSetup extends LitElement {
       }
 
       .second {
-        min-height: 44px;
+        min-height: 48px;
         border: none;
         background: transparent;
         color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
```

`custom_components/planavista/frontend/src/styles/controls.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/controls.ts b/custom_components/planavista/frontend/src/styles/controls.ts
index e87d959..de173b1 100644
--- a/custom_components/planavista/frontend/src/styles/controls.ts
+++ b/custom_components/planavista/frontend/src/styles/controls.ts
@@ -163,3 +163,34 @@ export const choiceStyles = css`
     outline-offset: -2px;
   }
 `;
+
+export const tagStyles = css`
+  .pv-tag {
+    display: inline-flex;
+    align-items: center;
+    flex-shrink: 0;
+    padding: 3px 9px;
+    border-radius: 999px;
+    font-size: 0.75rem;
+    font-weight: 600;
+    line-height: 1.3;
+    white-space: nowrap;
+    background: color-mix(in srgb, var(--pv-accent, #5B5BD6) 12%, transparent);
+    color: var(--pv-accent-ink, #5B5BD6);
+  }
+
+  .pv-tag.muted {
+    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
+    color: var(--pv-text-secondary, #5F6670);
+  }
+
+  .pv-tag.muted.ok {
+    color: var(--pv-text, #1A1B1E);
+  }
+
+  .pv-tag.ask,
+  .pv-tag.attention {
+    background: var(--pv-warn-bg, #FDF1DC);
+    color: var(--pv-warn-ink, #8A5A00);
+  }
+`;
```

`custom_components/planavista/frontend/src/styles/shared.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/shared.ts b/custom_components/planavista/frontend/src/styles/shared.ts
index d56cd43..2215d26 100644
--- a/custom_components/planavista/frontend/src/styles/shared.ts
+++ b/custom_components/planavista/frontend/src/styles/shared.ts
@@ -70,8 +70,6 @@ export const typographyStyles = css`
   .pv-overline {
     font-size: 0.6875rem;
     font-weight: 600;
-    letter-spacing: 0.05em;
-    text-transform: uppercase;
     color: var(--pv-text-muted);
   }
 `;
@@ -87,10 +85,10 @@ export const buttonStyles = css`
     gap: 0.5rem;
     padding: 0.625rem 1.25rem;
     border: none;
-    border-radius: var(--pv-radius-sm, 8px);
+    border-radius: var(--pv-radius, 12px);
     font-family: inherit;
-    font-size: 0.875rem;
-    font-weight: 500;
+    font-size: 0.9375rem;
+    font-weight: 600;
     cursor: pointer;
     transition: all var(--pv-transition, 200ms ease);
     min-height: 48px;
@@ -104,13 +102,13 @@ export const buttonStyles = css`
     color: var(--pv-accent-text);
   }
 
-  .pv-btn-primary:hover {
+  .pv-btn-primary:hover:not(:disabled) {
     opacity: 0.9;
     transform: translateY(-1px);
     box-shadow: var(--pv-shadow);
   }
 
-  .pv-btn-primary:active {
+  .pv-btn-primary:active:not(:disabled) {
     transform: translateY(0);
   }
 
@@ -120,7 +118,7 @@ export const buttonStyles = css`
     border: 1px solid var(--pv-border);
   }
 
-  .pv-btn-secondary:hover {
+  .pv-btn-secondary:hover:not(:disabled) {
     background: var(--pv-event-hover);
   }
 
@@ -130,11 +128,30 @@ export const buttonStyles = css`
     padding: 0.5rem;
   }
 
-  .pv-btn-ghost:hover {
+  .pv-btn-ghost:hover:not(:disabled) {
     background: var(--pv-event-hover);
     color: var(--pv-text);
   }
 
+  /* A disabled button looks it: faded, no lift, nothing under the pointer (milestone 8). */
+  .pv-btn:disabled,
+  .pv-btn[aria-disabled='true'] {
+    opacity: 0.45;
+    cursor: default;
+    transform: none;
+    box-shadow: none;
+  }
+
+  /* Destructive: a filled button in a confirmation, red text on a secondary button in place. */
+  .pv-btn-danger {
+    background: var(--pv-danger, #C62828);
+    color: #FFFFFF;
+  }
+
+  .pv-btn.danger {
+    color: var(--pv-danger-ink, #A12828);
+  }
+
   .pv-btn-icon {
     background: transparent;
     color: var(--pv-text-secondary);
@@ -263,6 +280,8 @@ export const formStyles = css`
     width: 44px;
     height: 24px;
     flex-shrink: 0;
+    border: none;
+    padding: 0;
     /* Off reads at about 3:1 on the card, like a control should (spec 11.8). */
     background: var(--pv-text-muted, #8E949C);
     border-radius: var(--pv-radius, 12px);
@@ -270,10 +289,23 @@ export const formStyles = css`
     transition: background var(--pv-transition, 200ms ease);
   }
 
-  .pv-toggle.active {
+  .pv-toggle.active,
+  .pv-toggle[aria-checked='true'] {
     background: var(--pv-accent);
   }
 
+  /* The switch is drawn 44 by 24; its target reaches 48 by 48. */
+  .pv-toggle::before {
+    content: '';
+    position: absolute;
+    inset: -12px -2px;
+  }
+
+  .pv-toggle:focus-visible {
+    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+    outline-offset: 2px;
+  }
+
   .pv-toggle::after {
     content: '';
     position: absolute;
@@ -287,7 +319,8 @@ export const formStyles = css`
     transition: transform var(--pv-transition, 200ms ease);
   }
 
-  .pv-toggle.active::after {
+  .pv-toggle.active::after,
+  .pv-toggle[aria-checked='true']::after {
     transform: translateX(20px);
   }
 `;
```

`custom_components/planavista/frontend/src/styles/theme-pairs.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/theme-pairs.ts b/custom_components/planavista/frontend/src/styles/theme-pairs.ts
index 67dc06c..a1f537e 100644
--- a/custom_components/planavista/frontend/src/styles/theme-pairs.ts
+++ b/custom_components/planavista/frontend/src/styles/theme-pairs.ts
@@ -110,6 +110,7 @@ const PLANAVISTA_LIGHT: Tokens = {
   '--pv-bad-ink': '#A12828',
   '--pv-star': '#8A6A00',
   '--pv-danger': '#C62828',
+  '--pv-danger-ink': '#A12828',
   '--pv-today-bg': 'rgba(91, 91, 214, 0.06)',
   '--pv-now-color': '#E5484D',
   '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
@@ -154,6 +155,7 @@ const PLANAVISTA_DARK: Tokens = {
   '--pv-bad-ink': '#F3A5A5',
   '--pv-star': '#EFC75E',
   '--pv-danger': '#B93838',
+  '--pv-danger-ink': '#F3A5A5',
   '--pv-today-bg': 'rgba(142, 142, 242, 0.08)',
   '--pv-now-color': '#FE6062',
   '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1038 passed`; the task's own files `240 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Disabled buttons look disabled; every Delete is red text on a secondary button; every toggle is the same size; the inbox's and Redeem's buttons and the chores Week arrows measure 48 px.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one button family, one red, one switch, one tag, and 48 px targets

Buttons share one radius (the theme's), one height, and weight 600, and
a disabled button looks it. Destructive actions get one red pair
(--pv-danger for fills, --pv-danger-ink for text, light and dark). Quick
add and the reward sheet use the same switch as everywhere else, now a
48 px target. Tags are one pill in sentence case ("🔒 Parent", "Needs an
OK"), section heads are sentence case everywhere, and every control a
finger uses that was drawn under 48 px reaches it.
```

---

### Task 3: Every sheet ends the same way

Spec 3.10 (editing sheets, read-only sheets, titles, confirmations, toasts, focus).

**Files:**
- Create: `custom_components/planavista/frontend/test/sheets.test.ts`
- Modify: `custom_components/planavista/frontend/src/core/pv-toast.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pin-actions.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`, `custom_components/planavista/frontend/src/shell/sheet-controller.ts`, `custom_components/planavista/frontend/src/styles/shared.ts`, `custom_components/planavista/frontend/src/styles/sheet.ts`, `custom_components/planavista/frontend/src/styles/theme-pairs.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/sheets.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Sheets and editors end the same way everywhere (milestone 8, spec 3.10). Element behavior is checked on
// the dev Home Assistant; these pin the markup rules that check depends on.
const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

/** Each `.actions=${[ ... ]}` list of a notice sheet, as the kinds and labels in order. */
function confirmations(text: string): Array<Array<{ kind: string; label: string }>> {
  return [...text.matchAll(/\.actions=\$\{\[([\s\S]*?)\]\}/g)].map(m =>
    [...m[1].matchAll(/label: (`[^`]*`|'(?:[^'\\]|\\.)*'), kind: '(\w+)'/g)].map(a => ({ label: a[1], kind: a[2] })));
}

describe('sheets and editors (milestone 8, spec 3.10)', () => {
  it('sheet titles are one style: left aligned, the rounded face at 800', () => {
    const sheet = read('styles/sheet.ts');
    const heading = /\.heading \{([^}]*)\}/.exec(sheet)?.[1] ?? '';
    expect(heading).toMatch(/font-weight:\s*800/);
    expect(heading).toMatch(/text-align:\s*left/);
  });

  it('a sheet opens with focus on its title, so nothing looks chosen', () => {
    expect(read('shell/sheet-controller.ts')).toMatch(/querySelector<HTMLElement>\('h2\[tabindex="-1"\]'\)/);
    for (const [path, id] of [['modules/chores/pv-chores-inbox.ts', 'inbox-title'], ['modules/chores/pv-chore-options.ts', 'options-title'],
      ['modules/chores/pv-chores-people-sheet.ts', 'people-heading'], ['modules/chores/pv-chores-day-sheet.ts', 'day-title']]) {
      const text = read(path);
      expect(text, path).toMatch(new RegExp(`id="${id}" tabindex="-1"`));
      expect(text, path).toMatch(new RegExp(`querySelector<HTMLElement>\\('#${id}'\\)\\?\\.focus\\(\\)`));
    }
  });

  it('read-only sheets end with a full-width secondary Done', () => {
    for (const path of ['modules/chores/pv-chores-inbox.ts', 'modules/chores/pv-chores-reward-sheet.ts']) {
      expect(read(path), path).not.toMatch(/pv-btn-ghost[^\n]{0,160}?>Done</);
    }
  });

  it('editing sheets end with Cancel, then the action', () => {
    const quick = read('modules/chores/pv-chores-quick-add.ts');
    expect(quick).not.toMatch(/class="bar"/);
    const footer = /<div class="sheet-footer">([\s\S]*?)<\/div>/.exec(quick)?.[1] ?? '';
    expect(footer.indexOf('>Cancel<')).toBeGreaterThan(-1);
    expect(footer.indexOf('>Cancel<')).toBeLessThan(footer.indexOf("'Add'"));
    const reward = read('modules/chores/pv-chores-reward-sheet.ts');
    const rewardFooter = /<div class="sheet-footer">([\s\S]*?)<\/div>/.exec(reward)?.[1] ?? '';
    expect(rewardFooter.indexOf('>Cancel<')).toBeLessThan(rewardFooter.indexOf('this._save'));
  });

  it('delete in place is one style: a secondary button in red, set apart', () => {
    expect(read('modules/chores/pv-chores-reward-sheet.ts')).toMatch(/pv-btn pv-btn-secondary danger[^\n]*>Delete reward</);
    expect(read('modules/calendar/components/event-popup.ts')).toMatch(/pv-btn pv-btn-secondary danger apart[\s\S]{0,200}'Delete event'/);
    expect(read('modules/chores/pv-chore-options.ts')).toMatch(/option\.destructive\)\.map[\s\S]{0,120}pv-btn pv-btn-secondary danger/);
  });

  it('confirmations put the named destructive action first', () => {
    for (const path of ['modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-reward-editor.ts', 'shell/settings/person-page.ts',
      'shell/settings/pin-actions.ts', 'modules/chores/pv-chores-module.ts', 'modules/calendar/components/event-create-dialog.ts']) {
      for (const actions of confirmations(read(path))) {
        if (!actions.some(a => a.kind === 'destructive')) continue;
        expect(actions[0].kind, `${path}: ${actions.map(a => a.label).join(', ')}`).toBe('destructive');
        expect(actions[0].label, path).not.toMatch(/^'(Delete|Remove|Discard)'$/);
      }
    }
  });

  it('one toast everywhere, its colors from tokens, every message ending with a full stop', () => {
    for (const path of ['shell/settings/pv-settings.ts', 'shell/setup/pv-setup.ts']) {
      const text = read(path);
      expect(text, path).toMatch(/<pv-toast/);
      expect(text, path).not.toMatch(/class="toast"/);
    }
    const toast = read('core/pv-toast.ts');
    expect(toast).toMatch(/var\(--pv-toast-bg,/);
    expect(toast).not.toMatch(/background: #1F2023/);
    const module = read('modules/chores/pv-chores-module.ts');
    expect(module).toMatch(/: 'Done\.'/);
    expect(module).toMatch(/`Done by \$\{name\}\.`/);
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/sheets.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/pv-toast.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-toast.ts b/custom_components/planavista/frontend/src/core/pv-toast.ts
index 957043b..3080848 100644
--- a/custom_components/planavista/frontend/src/core/pv-toast.ts
+++ b/custom_components/planavista/frontend/src/core/pv-toast.ts
@@ -53,8 +53,8 @@ export class PvToast extends LitElement {
       box-sizing: border-box;
       padding: 6px 8px 6px 16px;
       border-radius: 14px;
-      background: #1F2023;
-      color: #F4F4F2;
+      background: var(--pv-toast-bg, #1F2023);
+      color: var(--pv-toast-text, #F4F4F2);
       box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
       font-size: 0.9375rem;
       line-height: 1.3;
@@ -85,7 +85,7 @@ export class PvToast extends LitElement {
       border: none;
       border-radius: 10px;
       background: transparent;
-      color: #A9A9FF;
+      color: var(--pv-toast-action, #A9A9FF);
       font: inherit;
       font-weight: 700;
       cursor: pointer;
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index 0e60273..bdec5c6 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -33,7 +33,7 @@ import { calendarCan, formSignature, saveFailedText } from '../event-words';
 const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
 
 const DISCARD_ACTIONS: NoticeAction[] = [
-  { id: 'discard', label: 'Discard', kind: 'destructive' },
+  { id: 'discard', label: 'Discard changes', kind: 'destructive' },
   { id: 'keep', label: 'Keep editing', kind: 'secondary' },
 ];
 
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
index 370d3a3..8269fd1 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
@@ -168,18 +168,8 @@ export class PVEventPopup extends LitElement {
         line-height: 1.4;
       }
 
-      .pair {
-        display: flex;
-        gap: 10px;
-      }
 
-      .pair button {
-        flex: 1 1 0;
-      }
 
-      .danger {
-        color: var(--pv-bad-ink, #A12828);
-      }
     `,
   ];
 
@@ -253,16 +243,12 @@ export class PVEventPopup extends LitElement {
         ` : nothing}
 
         <div class="actions">
-          ${changeable && (can.edit || can.delete) ? html`
-            <div class="pair">
-              ${can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
-              ${can.delete ? html`
-                <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${this._deleting}
-                  @click=${() => { this._asking = true; }}>${this._deleting ? 'Deleting…' : 'Delete'}</button>
-              ` : nothing}
-            </div>
+          ${changeable && can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
+          ${changeable && can.delete ? html`
+            <button class="pv-btn pv-btn-secondary danger apart" type="button" ?disabled=${this._deleting}
+              @click=${() => { this._asking = true; }}>${this._deleting ? 'Deleting…' : 'Delete event'}</button>
           ` : nothing}
-          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._deleting} @click=${() => void this._sheet.close()}>Done</button>
+          <button class="pv-btn pv-btn-secondary ${changeable && can.delete ? 'apart' : ''}" type="button" ?disabled=${this._deleting} @click=${() => void this._sheet.close()}>Done</button>
         </div>
       </div>
       ${this._asking ? html`
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index 193ba76..d3dab52 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -203,7 +203,7 @@ export function itemOptions(ctx: OptionsContext): OptionsModel {
       parent.push({ id: 'excuse', label: 'Excuse it', tag: parentTag, hint: 'A sick day: nothing is missed, and the streak holds.' });
     }
     parent.push({ id: 'edit', label: 'Edit the chore', tag: parentTag, hint: 'Opens it in Settings.' });
-    parent.push({ id: 'delete', label: 'Delete the chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
+    parent.push({ id: 'delete', label: 'Delete chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
   }
 
   const minutes = item.window === 'once' && activity?.once ? activity.once.estimate_minutes : item.credit_minutes;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
index fbcfe0b..62dcb3b 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
@@ -228,7 +228,7 @@ export class PvChoreOptions extends LitElement {
     const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
     this._motion.open(panel, backdrop);
     this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
-    this.renderRoot.querySelector<HTMLElement>('.option > button')?.focus();
+    this.renderRoot.querySelector<HTMLElement>('#options-title')?.focus();
   }
 
   disconnectedCallback(): void {
@@ -255,14 +255,20 @@ export class PvChoreOptions extends LitElement {
         aria-busy=${this.busy ? 'true' : 'false'}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
         <div class="top">
-          <h2 id="options-title">${model.title}</h2>
+          <h2 id="options-title" tabindex="-1">${model.title}</h2>
           <div class="meta-line">${model.meta}</div>
           ${model.added ? html`<div class="added">${model.added}</div>` : nothing}
           ${model.note ? html`<div class="note"><span class="badge ${model.note.startsWith('Sent back') ? 'bad' : 'act'}">${model.note}</span></div>` : nothing}
         </div>
-        ${model.member.map(option => this._option(option))}
-        ${model.parent.length ? html`<div class="group">For parents</div>${model.parent.map(option => this._option(option))}` : nothing}
+        ${model.member.filter(option => !option.destructive).map(option => this._option(option))}
+        ${model.parent.some(option => !option.destructive)
+          ? html`<div class="group">For parents</div>${model.parent.filter(option => !option.destructive).map(option => this._option(option))}`
+          : nothing}
         <div class="actions">
+          ${[...model.member, ...model.parent].filter(option => option.destructive).map(option => html`
+            <button class="pv-btn pv-btn-secondary danger" type="button" ?disabled=${option.disabled || this.busy}
+              @click=${() => this._tap(option, false)}>${option.label}${option.tag ? html` <span class="pv-tag muted">${option.tag}</span>` : nothing}</button>
+          `)}
           <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
         </div>
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
index 3b7a2ed..62a69ef 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
@@ -104,7 +104,7 @@ export class PvChoresDaySheet extends LitElement {
     const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
     this._motion.open(panel, backdrop);
     this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
-    this.renderRoot.querySelector<HTMLElement>('.actions button')?.focus();
+    this.renderRoot.querySelector<HTMLElement>('#day-title')?.focus();
   }
 
   disconnectedCallback(): void {
@@ -144,7 +144,7 @@ export class PvChoresDaySheet extends LitElement {
       <div class="backdrop" @click=${() => void this.close()}></div>
       <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
-        <h2 class="heading" id="day-title">${this.member?.name} · ${longDay(this.date)}</h2>
+        <h2 class="heading" id="day-title" tabindex="-1">${this.member?.name} · ${longDay(this.date)}</h2>
         ${sub ? html`<p class="sub">${sub}</p>` : nothing}
         ${this.failed ? html`<p class="sub">Couldn't load this day. Try again in a moment.</p>` : !this.day ? html`
           <div aria-busy="true"><div class="bone" style="height:44px;margin-bottom:8px"></div><div class="bone" style="height:44px"></div></div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
index c8f7739..aed0b48 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
@@ -91,6 +91,19 @@ export class PvChoresInbox extends LitElement {
         font-weight: 800;
       }
 
+      .actions {
+        display: flex;
+        margin-top: 16px;
+      }
+
+      .actions .pv-btn {
+        flex: 1;
+      }
+
+      h2[tabindex='-1']:focus {
+        outline: none;
+      }
+
       .done {
         min-height: 48px;
         font-weight: 750;
@@ -221,7 +234,7 @@ export class PvChoresInbox extends LitElement {
       this._motion.open(panel, backdrop);
       this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
     }
-    this.renderRoot.querySelector<HTMLElement>('.answers button, .done')?.focus();
+    this.renderRoot.querySelector<HTMLElement>('#inbox-title')?.focus();
   }
 
   protected updated(changed: PropertyValues): void {
@@ -263,8 +276,7 @@ export class PvChoresInbox extends LitElement {
         @keydown=${this._key}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
         <div class="top">
-          <h2 id="inbox-title">Waiting for OK${g.count ? ` · ${g.count}` : ''}</h2>
-          <button class="pv-btn pv-btn-ghost done" type="button" @click=${() => void this.close()}>Done</button>
+          <h2 id="inbox-title" tabindex="-1">Waiting for OK${g.count ? ` · ${g.count}` : ''}</h2>
         </div>
         ${g.count === 0 ? html`
           <div class="empty"><div class="art" aria-hidden="true">✅</div>Nothing is waiting. Check-offs that need a parent's OK, requests, and rewards land here.</div>
@@ -278,6 +290,9 @@ export class PvChoresInbox extends LitElement {
         ` : nothing}
         ${g.requests.length ? html`<div class="group"><span>Requests</span></div>${g.requests.map(row => this._row(row))}` : nothing}
         ${g.rewards.length ? html`<div class="group"><span>Rewards</span></div>${g.rewards.map(row => this._row(row))}` : nothing}
+        <div class="actions">
+          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
+        </div>
       </div>
     `;
   }
@@ -295,7 +310,7 @@ export class PvChoresInbox extends LitElement {
         <div class="answers">
           <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${busy}
             @click=${() => this._decline(row)}>${row.decline}</button>
-          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${busy || row.blocked}
+          <button class="pv-btn pv-btn-secondary accent" type="button" ?disabled=${busy || row.blocked}
             @click=${() => this._review(row, true)}>${busy ? 'Saving…' : row.allow}</button>
         </div>
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 48ecb59..f568b12 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -638,7 +638,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     const name = doneBy && doneBy !== member ? this._member(doneBy)?.name : null;
     this.showToast({
       id,
-      text: waits ? `${row.name}: waiting for OK` : name ? `Done by ${name}` : 'Done',
+      text: waits ? `${row.name}: waiting for OK.` : name ? `Done by ${name}.` : 'Done.',
       actions: [{ id: 'undo', label: 'Undo' }, ...(doneBy ? [] : [{ id: 'someone', label: 'Someone else did it?' }])],
       ms: 6000,
     });
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts
index d509c35..2e51635 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts
@@ -71,7 +71,7 @@ export class PvChoresPeopleSheet extends LitElement {
     const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
     this._motion.open(panel, backdrop);
     this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => this._pick(null));
-    this.renderRoot.querySelector<HTMLElement>('.face')?.focus();
+    this.renderRoot.querySelector<HTMLElement>('#people-heading')?.focus();
   }
 
   disconnectedCallback(): void {
@@ -84,7 +84,7 @@ export class PvChoresPeopleSheet extends LitElement {
       <div class="backdrop" @click=${() => this._pick(null)}></div>
       <div class="panel" role="dialog" aria-modal="true" aria-labelledby="people-heading" @keydown=${this._key}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
-        <h2 class="heading" id="people-heading">${this.heading}</h2>
+        <h2 class="heading" id="people-heading" tabindex="-1">${this.heading}</h2>
         ${this.body ? html`<p class="body">${this.body}</p>` : nothing}
         <div class="faces">
           ${this.people.map(person => html`
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
index 1f8f256..667f30f 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
@@ -59,24 +59,8 @@ export class PvChoresQuickAdd extends LitElement {
         width: min(480px, calc(100vw - 32px));
       }
 
-      .bar {
-        display: grid;
-        grid-template-columns: 1fr auto 1fr;
-        align-items: center;
-        margin: -4px -6px 10px;
-      }
 
-      .bar h2 {
-        margin: 0;
-        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
-        font-size: 1.125rem;
-        font-weight: 800;
-      }
 
-      .bar .add {
-        justify-self: end;
-        font-weight: 800;
-      }
 
       .text {
         min-height: 48px;
@@ -288,11 +272,7 @@ export class PvChoresQuickAdd extends LitElement {
       <div class="backdrop" @click=${() => void this.close()}></div>
       <div class="panel" role="dialog" aria-modal="true" aria-labelledby="add-title" @keydown=${this._key}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
-        <div class="bar">
-          <button class="text" type="button" @click=${() => void this.close()}>Cancel</button>
-          <h2 id="add-title">New chore</h2>
-          <button class="text add" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy ? 'Adding…' : 'Add'}</button>
-        </div>
+        <h2 class="heading" id="add-title">New chore</h2>
         <section>
           <label class="title" for="name">What needs doing?</label>
           <input id="name" type="text" maxlength="60" placeholder="Clean out the garage" autocomplete="off" .value=${d.name}
@@ -371,6 +351,10 @@ export class PvChoresQuickAdd extends LitElement {
           ` : nothing}
           ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
         </section>
+        <div class="sheet-footer">
+          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Cancel</button>
+          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy ? 'Adding…' : 'Add'}</button>
+        </div>
       </div>
     `;
   }
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
index a70c540..ddbfaeb 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
@@ -185,9 +185,6 @@ export class PvChoresRewardSheet extends LitElement {
         font-weight: 650;
       }
 
-      .danger {
-        color: var(--pv-danger, #C62828);
-      }
     `,
   ];
 
@@ -203,7 +200,7 @@ export class PvChoresRewardSheet extends LitElement {
     const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
     this._motion.open(panel, backdrop);
     this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
-    this.renderRoot.querySelector<HTMLElement>('input, button')?.focus();
+    (this.renderRoot.querySelector<HTMLElement>('input') ?? this.renderRoot.querySelector<HTMLElement>('#reward-title'))?.focus();
   }
 
   disconnectedCallback(): void {
@@ -236,7 +233,7 @@ export class PvChoresRewardSheet extends LitElement {
     const reward = card.reward;
     return html`
       <div class="icon" aria-hidden="true">${pictureOf(reward.icon)}</div>
-      <h2 class="heading" id="reward-title">${reward.name}</h2>
+      <h2 class="heading" id="reward-title" tabindex="-1">${reward.name}</h2>
       <div class="cost">★ ${reward.cost}${reward.needs_ok ? ' · needs a parent\'s OK' : ''}</div>
       ${card.people.map(p => html`
         <div class="person">
@@ -253,8 +250,8 @@ export class PvChoresRewardSheet extends LitElement {
       `)}
       ${card.people.length === 0 ? html`<p class="body">Nobody who earns stars can get this one yet.</p>` : nothing}
       <div class="actions">
-        ${this.canEdit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._editing = true; }}>Edit reward</button>` : nothing}
-        <button class="pv-btn pv-btn-ghost" type="button" @click=${() => void this.close()}>Done</button>
+        ${this.canEdit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._editing = true; }}>Edit</button>` : nothing}
+        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
       </div>
     `;
   }
@@ -268,7 +265,7 @@ export class PvChoresRewardSheet extends LitElement {
     const d = this._draft;
     const editing = !!this.card;
     return html`
-      <h2 class="heading" id="reward-title">${editing ? 'Edit reward' : 'Add a reward'}</h2>
+      <h2 class="heading" id="reward-title">${editing ? 'Edit reward' : 'New reward'}</h2>
       <span class="title">Picture</span>
       <div class="pictures">
         ${REWARD_PICTURES.map(p => html`<button type="button" aria-pressed=${d.icon === p ? 'true' : 'false'} aria-label=${p} @click=${() => this._set({ icon: p })}>${p}</button>`)}
@@ -295,11 +292,15 @@ export class PvChoresRewardSheet extends LitElement {
         `)}
       </div>
       ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
-      <div class="actions">
-        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy ? 'Saving…' : editing ? 'Save' : 'Add'}</button>
+      <div class="sheet-footer">
         <button class="pv-btn pv-btn-secondary" type="button" @click=${() => (editing ? (this._editing = false) : void this.close())}>Cancel</button>
-        ${editing ? html`<button class="pv-btn pv-btn-ghost danger" type="button" @click=${() => this._fire('pv-reward-delete', {})}>Delete reward</button>` : nothing}
+        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy ? 'Saving…' : editing ? 'Save' : 'Add'}</button>
       </div>
+      ${editing ? html`
+        <div class="sheet-delete">
+          <button class="pv-btn pv-btn-secondary danger" type="button" @click=${() => this._fire('pv-reward-delete', {})}>Delete reward</button>
+        </div>
+      ` : nothing}
     `;
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index 5b4b454..5c3af72 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -694,7 +694,7 @@ export class PvChoreEditor extends LitElement {
     if (this._notice === 'discard') {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
-          .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'discard', label: 'Discard', kind: 'destructive' }]}
+          .actions=${[{ id: 'discard', label: 'Discard changes', kind: 'destructive' }, { id: 'keep', label: 'Keep editing', kind: 'secondary' }]}
           @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
       `;
     }
@@ -702,7 +702,7 @@ export class PvChoreEditor extends LitElement {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._activity.name}?"
           body="It leaves the board at once. Past weeks still show what was done, and stars stay earned."
-          .actions=${[{ id: 'cancel', label: 'Cancel', kind: 'secondary' }, { id: 'delete', label: 'Delete', kind: 'destructive' }]}
+          .actions=${[{ id: 'delete', label: `Delete ${this._activity.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
           @pv-sheet-action=${this._onDeleteChoice}></pv-notice-sheet>
       `;
     }
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
index 0ed1894..faf47e0 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
@@ -235,7 +235,7 @@ export class PvRewardEditor extends LitElement {
     if (this._notice === 'discard') {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
-          .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'discard', label: 'Discard', kind: 'destructive' }]}
+          .actions=${[{ id: 'discard', label: 'Discard changes', kind: 'destructive' }, { id: 'keep', label: 'Keep editing', kind: 'secondary' }]}
           @pv-sheet-action=${this._onDiscard}></pv-notice-sheet>
       `;
     }
@@ -243,7 +243,7 @@ export class PvRewardEditor extends LitElement {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._reward.name}?"
           body="Rewards already given stay in everyone's history."
-          .actions=${[{ id: 'cancel', label: 'Cancel', kind: 'secondary' }, { id: 'delete', label: 'Delete', kind: 'destructive' }]}
+          .actions=${[{ id: 'delete', label: `Delete ${this._reward.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
           @pv-sheet-action=${this._onDelete}></pv-notice-sheet>
       `;
     }
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index 177ddba..c720aa5 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -491,8 +491,8 @@ export class PvSettingsPerson extends LitElement {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
           .actions=${[
+            { id: 'discard', label: 'Discard changes', kind: 'destructive' },
             { id: 'keep', label: 'Keep editing', kind: 'secondary' },
-            { id: 'discard', label: 'Discard', kind: 'destructive' },
           ]}
           @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
       `;
@@ -502,8 +502,8 @@ export class PvSettingsPerson extends LitElement {
         <pv-notice-sheet .layout=${this.layout} heading="Remove ${member.name}?"
           body="Their calendars stay, and won't belong to anyone."
           .actions=${[
+            { id: 'remove', label: `Remove ${member.name}`, kind: 'destructive' },
             { id: 'cancel', label: 'Cancel', kind: 'secondary' },
-            { id: 'remove', label: 'Remove', kind: 'destructive' },
           ]}
           @pv-sheet-action=${this._onRemoveChoice}></pv-notice-sheet>
       `;
```

`custom_components/planavista/frontend/src/shell/settings/pin-actions.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts b/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
index efc4786..93f101c 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pin-actions.ts
@@ -125,8 +125,8 @@ export class PvPinActions extends LitElement {
             ? `On a shared screen, ${this.member.name} will need a new PIN to start parent mode.`
             : 'You can set a new one any time.'}
           .actions=${[
+            { id: 'remove', label: `Remove ${this.member.name}'s PIN`, kind: 'destructive' },
             { id: 'cancel', label: 'Cancel', kind: 'secondary' },
-            { id: 'remove', label: 'Remove PIN', kind: 'destructive' },
           ]}
           @pv-sheet-action=${this._onRemoveChoice}
         ></pv-notice-sheet>
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 98b3ce6..1365fd6 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -3,6 +3,7 @@ import { property, state } from 'lit/decorators.js';
 import { keyed } from 'lit/directives/keyed.js';
 import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
 import type { HomeAssistant } from 'custom-card-helpers';
+import '../../core/pv-toast';
 import { defineElement } from '../../utils/define';
 import { baseStyles, buttonStyles } from '../../styles/shared';
 import type { HouseholdView, Member } from '../../core/household';
@@ -276,20 +277,6 @@ export class PvSettings extends LitElement {
         background: color-mix(in srgb, #F59E0B 14%, transparent);
       }
 
-      .toast {
-        position: absolute;
-        left: 16px;
-        right: 16px;
-        bottom: 20px;
-        margin: 0 auto;
-        max-width: 480px;
-        padding: 12px 16px;
-        border-radius: 12px;
-        background: var(--pv-text, #1A1B1E);
-        color: var(--pv-card-bg, #FFFFFF);
-        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
-        text-align: center;
-      }
     `,
   ];
 
@@ -325,7 +312,7 @@ export class PvSettings extends LitElement {
         ${this._split || !current ? this._renderList(pages, current) : nothing}
         ${current ? this._renderPage(current, top) : nothing}
       </div>
-      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
+      <pv-toast .toast=${this._toast ? { id: this._toast, text: this._toast, tone: 'bad' } : null}></pv-toast>
     `;
   }
 
```

`custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
index b62d395..4395290 100644
--- a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
@@ -3,6 +3,7 @@ import { property, state } from 'lit/decorators.js';
 import { keyed } from 'lit/directives/keyed.js';
 import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
 import type { HomeAssistant } from 'custom-card-helpers';
+import '../../core/pv-toast';
 import { defineElement } from '../../utils/define';
 import { baseStyles, buttonStyles } from '../../styles/shared';
 import type { HouseholdView } from '../../core/household';
@@ -219,19 +220,6 @@ export class PvSetup extends LitElement {
         cursor: pointer;
       }
 
-      .toast {
-        position: absolute;
-        left: 16px;
-        right: 16px;
-        bottom: 92px;
-        margin: 0 auto;
-        max-width: 480px;
-        padding: 12px 16px;
-        border-radius: 12px;
-        background: var(--pv-text, #1A1B1E);
-        color: var(--pv-card-bg, #FFFFFF);
-        text-align: center;
-      }
 
       .progress-dots {
         display: flex;
@@ -330,7 +318,7 @@ export class PvSetup extends LitElement {
           <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${secondary}</button>
         ` : nothing}
       </div>
-      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
+      <pv-toast .toast=${this._toast ? { id: this._toast, text: this._toast, tone: 'bad' } : null}></pv-toast>
     `;
   }
 
```

`custom_components/planavista/frontend/src/shell/sheet-controller.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/sheet-controller.ts b/custom_components/planavista/frontend/src/shell/sheet-controller.ts
index da496fe..39e472b 100644
--- a/custom_components/planavista/frontend/src/shell/sheet-controller.ts
+++ b/custom_components/planavista/frontend/src/shell/sheet-controller.ts
@@ -44,7 +44,8 @@ export class SheetController implements ReactiveController {
     this._opened = true;
     this._motion.open(parts.panel, parts.backdrop);
     this._detach = this._motion.attachDrag(parts.zone, parts.panel, () => this.dismiss());
-    (this._options.initialFocus?.() ?? parts.panel.querySelector<HTMLElement>('.actions button'))?.focus();
+    (this._options.initialFocus?.() ?? parts.panel.querySelector<HTMLElement>('h2[tabindex="-1"]')
+      ?? parts.panel.querySelector<HTMLElement>('.actions button'))?.focus();
   }
 
   hostDisconnected(): void {
```

`custom_components/planavista/frontend/src/styles/shared.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/shared.ts b/custom_components/planavista/frontend/src/styles/shared.ts
index 2215d26..97f3a7f 100644
--- a/custom_components/planavista/frontend/src/styles/shared.ts
+++ b/custom_components/planavista/frontend/src/styles/shared.ts
@@ -152,6 +152,15 @@ export const buttonStyles = css`
     color: var(--pv-danger-ink, #A12828);
   }
 
+  /* An answer that moves things on, in a list where nothing is filled (one primary per screen). */
+  .pv-btn.accent {
+    color: var(--pv-accent-ink, #5B5BD6);
+  }
+
+  .pv-btn.apart {
+    margin-top: 12px;
+  }
+
   .pv-btn-icon {
     background: transparent;
     color: var(--pv-text-secondary);
```

`custom_components/planavista/frontend/src/styles/sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/sheet.ts b/custom_components/planavista/frontend/src/styles/sheet.ts
index 6c58ba5..d122081 100644
--- a/custom_components/planavista/frontend/src/styles/sheet.ts
+++ b/custom_components/planavista/frontend/src/styles/sheet.ts
@@ -50,8 +50,36 @@ export const sheetStyles = css`
     font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
     margin: 0 0 6px;
     font-size: 1.25rem;
-    font-weight: 700;
-    text-align: center;
+    font-weight: 800;
+    text-align: left;
+  }
+
+  .heading:focus,
+  h2[tabindex='-1']:focus {
+    outline: none;
+  }
+
+  /* An editing sheet ends with Cancel, then its action (Add or Save). */
+  .sheet-footer {
+    display: flex;
+    gap: 10px;
+    margin-top: 16px;
+  }
+
+  .sheet-footer > .pv-btn {
+    flex: 1 1 0;
+  }
+
+  /* Delete in place: a secondary button in red, set apart at the end. */
+  .sheet-delete {
+    display: flex;
+    margin-top: 16px;
+    padding-top: 16px;
+    border-top: 1px solid var(--pv-border, #E7E7E3);
+  }
+
+  .sheet-delete > .pv-btn {
+    flex: 1;
   }
 
   .body {
```

`custom_components/planavista/frontend/src/styles/theme-pairs.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/theme-pairs.ts b/custom_components/planavista/frontend/src/styles/theme-pairs.ts
index a1f537e..6df4242 100644
--- a/custom_components/planavista/frontend/src/styles/theme-pairs.ts
+++ b/custom_components/planavista/frontend/src/styles/theme-pairs.ts
@@ -111,6 +111,9 @@ const PLANAVISTA_LIGHT: Tokens = {
   '--pv-star': '#8A6A00',
   '--pv-danger': '#C62828',
   '--pv-danger-ink': '#A12828',
+  '--pv-toast-bg': '#1F2023',
+  '--pv-toast-text': '#F4F4F2',
+  '--pv-toast-action': '#A9A9FF',
   '--pv-today-bg': 'rgba(91, 91, 214, 0.06)',
   '--pv-now-color': '#E5484D',
   '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
@@ -156,6 +159,9 @@ const PLANAVISTA_DARK: Tokens = {
   '--pv-star': '#EFC75E',
   '--pv-danger': '#B93838',
   '--pv-danger-ink': '#F3A5A5',
+  '--pv-toast-bg': '#E9E9E6',
+  '--pv-toast-text': '#1A1B1E',
+  '--pv-toast-action': '#3B3BB0',
   '--pv-today-bg': 'rgba(142, 142, 242, 0.08)',
   '--pv-now-color': '#FE6062',
   '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1045 passed`; the task's own files `7 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Every editing sheet ends Cancel then its action; read-only sheets end with Done; titles are left aligned; the details sheet opens on its title; one toast, light in dark mode.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): every sheet ends the same way

Sheet titles share one style, left aligned, and a sheet opens with focus
on its title so nothing looks chosen. Editing sheets end with Cancel, then
Add or Save; read-only sheets end with a full-width Done, the inbox's
included. Delete in place is one style, a secondary button in red set
apart (Delete event, Delete chore, Delete reward), and confirmations put
the named destructive action first ("Delete Laundry", "Remove Alex",
"Discard changes"). The inbox's answers are secondary, so a screen has
one primary. Settings and setup use the same toast as Chores, with token
colors, and every toast ends with a full stop.
```

---

### Task 4: Settings editors keep Save in view, New chore stays in the bar, one name per action

Spec 3.10 (Settings editors, naming, one primary), D2.

**Files:**
- Create: `custom_components/planavista/frontend/test/editors.test.ts`
- Modify: `custom_components/planavista/frontend/src/core/page-host.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-glance.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`, `custom_components/planavista/frontend/src/shell/settings/people-page.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/test/chores-glance.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/chores-glance.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/chores-glance.test.ts b/custom_components/planavista/frontend/test/chores-glance.test.ts
index 395c466..a75766a 100644
--- a/custom_components/planavista/frontend/test/chores-glance.test.ts
+++ b/custom_components/planavista/frontend/test/chores-glance.test.ts
@@ -46,13 +46,13 @@ describe('choresBarActions', () => {
   const waiting = { ...today, requests: [{ id: 'r1', kind: 'completion' as const, member: 'dana', name: 'Feed the fish', at: '' }] };
   const parentMode: Session = { token: 't', memberId: 'blair', parent: true, lastTouch: 0 };
 
-  it('shows Waiting for OK and Add chore on a shared screen', () => {
-    expect(choresBarActions(waiting, view('shared'), null).map(a => a.label)).toEqual(['1 waiting for OK', 'Add chore']);
+  it('shows Waiting for OK and New chore on a shared screen', () => {
+    expect(choresBarActions(waiting, view('shared'), null).map(a => a.label)).toEqual(['1 waiting for OK', 'New chore']);
   });
 
-  it('moves Add chore to the strip in parent mode', () => {
-    expect(choresBarActions(waiting, view('shared'), parentMode).map(a => a.id)).toEqual(['inbox']);
-    expect(choresStripActions(waiting).map(a => a.id)).toEqual(['add']);
+  it('keeps New chore in the bar in parent mode; the strip holds who, the countdown, and Lock (milestone 8, D2)', () => {
+    expect(choresBarActions(waiting, view('shared'), parentMode).map(a => a.id)).toEqual(['inbox', 'add']);
+    expect(choresStripActions(waiting)).toEqual([]);
   });
 
   it('shows a child\'s own login neither', () => {
```

`custom_components/planavista/frontend/test/editors.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('Settings editors keep Save in view (milestone 8, spec 3.10)', () => {
  const EDITORS = ['shell/settings/person-page.ts', 'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-reward-editor.ts'];

  it.each(EDITORS)('%s tells Settings it is an editor, and draws no Cancel and Save of its own', path => {
    const text = read(path);
    expect(text).toMatch(/announceEditor\(this, editor\)/);
    expect(text).not.toMatch(/class="actions">\s*<button class="pv-btn pv-btn-secondary" type="button" @click=\$\{this\._cancel\}>Cancel/);
  });

  it('Settings puts an editor\'s Cancel and Save in its header, and its own Done is a text button', () => {
    const settings = read('shell/settings/pv-settings.ts');
    expect(settings).toMatch(/addEventListener\(PAGE_EDITOR/);
    // A page that left can't send anything, so another page in view clears the editor.
    expect(settings).toMatch(/changed\.has\('_stack'\) \|\| changed\.has\('_selected'\)\) this\._editor = null/);
    expect(settings).toMatch(/class="pv-btn pv-btn-ghost done"/);
    expect(settings).toMatch(/class="pv-btn pv-btn-primary save"/);
  });
});

describe('one name for each action, and one primary per screen (milestone 8, spec 3.10)', () => {
  it('creating something is New ...', () => {
    expect(read('modules/chores/pv-chores-rewards.ts')).toMatch(/\+ New reward/);
    expect(read('modules/chores/pv-chores-rewards.ts')).not.toMatch(/Add a reward/);
    const people = read('shell/settings/people-page.ts');
    expect(people.match(/\+ New person/g)).toHaveLength(1);
    expect(people).not.toMatch(/Add someone/);
    expect(read('modules/chores/pv-chores-module.ts')).toMatch(/>New chore<\/button>/);
  });

  it('inside a sheet, Edit is just Edit', () => {
    expect(read('modules/chores/options-derive.ts')).toMatch(/id: 'edit', label: 'Edit',/);
  });

  it('list rows answer with secondary buttons, and Restore is secondary to Import', () => {
    expect(read('modules/chores/pv-chores-rewards.ts')).toMatch(/pv-btn pv-btn-secondary accent action[^\n]*>Redeem</);
    expect(read('modules/chores/settings/pv-import-export-page.ts')).toMatch(/mode === 'restore' \? 'pv-btn-secondary' : 'pv-btn-primary'/);
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/chores-glance.test.ts test/editors.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/page-host.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/page-host.ts b/custom_components/planavista/frontend/src/core/page-host.ts
index 4a58463..d154387 100644
--- a/custom_components/planavista/frontend/src/core/page-host.ts
+++ b/custom_components/planavista/frontend/src/core/page-host.ts
@@ -30,6 +30,27 @@ export const POP_PAGE = 'pv-pop-page';
 /** A page reports a failed save; the host shows the message. */
 export const PAGE_ERROR = 'pv-page-error';
 
+/**
+ * An editor page (a person, a chore, a reward) gives the host its Cancel and
+ * Save, so Settings holds them in its header, in view however long the page
+ * is (milestone 8). Sent when what it says changes; null when it leaves.
+ */
+export const PAGE_EDITOR = 'pv-page-editor';
+
+export interface PageEditor {
+  /** "Save", or "Add" for something new. */
+  label: string;
+  /** Something changed and nothing is saving. */
+  ready: boolean;
+  save(): void;
+  cancel(): void;
+}
+
+/** Tell the Settings host about this editor, or (null) that it left. */
+export function announceEditor(page: HTMLElement, editor: PageEditor | null): void {
+  page.dispatchEvent(new CustomEvent<PageEditor | null>(PAGE_EDITOR, { detail: editor, bubbles: true, composed: true }));
+}
+
 /** A page asks for a module's view (Open Dana's day): Settings closes and the card goes there. */
 export const OPEN_TARGET = 'pv-page-open';
 
```

`custom_components/planavista/frontend/src/modules/chores/chores-glance.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts b/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
index 372cceb..7a56554 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
@@ -43,11 +43,11 @@ export function choresBarActions(board: Board | null, view: HouseholdView | null
     actions.push({ id: 'inbox', label: `${waiting} waiting for OK`, short: String(waiting), glyph: '⏳', tone: 'act' });
   }
   const access = parentAccess(view, session);
-  if (access !== 'no' && !session?.parent) actions.push({ id: 'add', label: 'Add chore', short: '', glyph: '+' });
+  if (access !== 'no') actions.push({ id: 'add', label: 'New chore', short: '', glyph: '+' });
   return actions;
 }
 
-/** The parent-mode strip's button (spec 9.4). */
-export function choresStripActions(board: Board | null): ModuleAction[] {
-  return board ? [{ id: 'add', label: 'Add chore', glyph: '+' }] : [];
+/** The parent-mode strip holds who, the countdown, and Lock; New chore stays in the bar (milestone 8, D2). */
+export function choresStripActions(_board: Board | null): ModuleAction[] {
+  return [];
 }
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index d3dab52..9733964 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -202,7 +202,7 @@ export function itemOptions(ctx: OptionsContext): OptionsModel {
       parent.push({ id: 'hand_off', label: 'Hand it to someone else', tag: parentTag, hint: 'Just this time.' });
       parent.push({ id: 'excuse', label: 'Excuse it', tag: parentTag, hint: 'A sick day: nothing is missed, and the streak holds.' });
     }
-    parent.push({ id: 'edit', label: 'Edit the chore', tag: parentTag, hint: 'Opens it in Settings.' });
+    parent.push({ id: 'edit', label: 'Edit', tag: parentTag, hint: 'Opens it in Settings.' });
     parent.push({ id: 'delete', label: 'Delete chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index f568b12..2ba2018 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -582,7 +582,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         <p>Add your family's chores, or import a plan you already agreed on.</p>
         ${access !== 'no' ? html`
           <div class="buttons">
-            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>Add chores</button>
+            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>New chore</button>
             <button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._openSettings(IMPORT_EXPORT)}>Import a plan</button>
           </div>
         ` : nothing}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index 667be99..59618e4 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -19,7 +19,7 @@ import { ScrollReporter } from '../../core/content-scroll';
  * a reward tile; a line at the bottom says who got what lately.
  *
  * @fires pv-reward-redeem - { reward } Redeem was tapped
- * @fires pv-reward-open - { reward } a card was tapped (its sheet), or { reward: null } for Add a reward
+ * @fires pv-reward-open - { reward } a card was tapped (its sheet), or { reward: null } for New reward
  */
 export class PvChoresRewards extends LitElement {
   /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
@@ -31,7 +31,7 @@ export class PvChoresRewards extends LitElement {
   @property({ attribute: false }) hass?: HomeAssistant;
   @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
-  /** Parents (or a screen that can ask for a parent's PIN) see Add a reward. */
+  /** Parents (or a screen that can ask for a parent's PIN) see New reward. */
   @property({ type: Boolean }) canEdit = false;
 
   static styles = [
@@ -235,7 +235,7 @@ export class PvChoresRewards extends LitElement {
           <div class="catalog">
             ${this.cards.map(card => this._card(card))}
             ${this.canEdit ? html`
-              <button class="card add" type="button" @click=${() => this._fire('pv-reward-open', { reward: null })}>+ Add a reward<span class="meta">parents</span></button>
+              <button class="card add" type="button" @click=${() => this._fire('pv-reward-open', { reward: null })}>+ New reward<span class="meta">Parents</span></button>
             ` : nothing}
           </div>
         `}
@@ -260,7 +260,7 @@ export class PvChoresRewards extends LitElement {
           ${asked ? html`<span class="badge act">⏳ ${card.asked.map(m => m.name).join(', ')} · Waiting for OK</span>` : nothing}
         </div>
         ${card.canRedeem
-          ? html`<button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._fire('pv-reward-redeem', { reward: reward.id })}>Redeem</button>`
+          ? html`<button class="pv-btn pv-btn-secondary accent action" type="button" @click=${() => this._fire('pv-reward-redeem', { reward: reward.id })}>Redeem</button>`
           : html`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${asked ? 'Requested' : 'Not enough stars yet'}</button>`}
       </div>
     `;
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index 5c3af72..931ac7d 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -7,7 +7,7 @@ import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
 import { HouseholdView, Member, inOrder } from '../../../core/household';
 import type { Layout } from '../../../core/layout';
 import type { ModuleService } from '../../../core/module-registry';
-import { PAGE_ERROR, POP_PAGE } from '../../../core/page-host';
+import { PAGE_ERROR, POP_PAGE, announceEditor } from '../../../core/page-host';
 import { copyText } from '../../../core/clipboard';
 import { errorCode, errorMessage } from '../../../core/ws-api';
 import type { PlanaVistaData } from '../../../types';
@@ -319,6 +319,23 @@ export class PvChoreEditor extends LitElement {
     `,
   ];
 
+  /** The editor's Cancel and Save, held in the Settings header (milestone 8). */
+  private _announced = '';
+
+  protected updated(): void {
+    const isNew = this._choreId === null;
+    const editor = {
+      label: isNew ? 'Add' : 'Save',
+      ready: !(this._saving || (!isNew && !isDirty(this._record))),
+      save: () => void this._save(),
+      cancel: () => this._cancel(),
+    };
+    const said = `${editor.label}|${editor.ready}`;
+    if (said === this._announced) return;
+    this._announced = said;
+    announceEditor(this, editor);
+  }
+
   render() {
     const board = this._board;
     if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
@@ -335,11 +352,6 @@ export class PvChoreEditor extends LitElement {
           @click=${() => { this._pictures = !this._pictures; }}>
           <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'chore')}</span>Change picture
         </button>
-        <div class="actions">
-          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
-          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !isDirty(this._record))}
-            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
-        </div>
       </div>
       ${this._pictures ? this._renderPictures() : nothing}
       ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
index fd6116e..1534ecd 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
@@ -196,7 +196,8 @@ export class PvImportExportPage extends LitElement {
   private _renderActions(mode: Mode) {
     return html`
       <div class="actions">
-        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${() => this._choose(mode)}>Choose a file</button>
+        <button class="pv-btn ${mode === 'restore' ? 'pv-btn-secondary' : 'pv-btn-primary'}" type="button" ?disabled=${this._reading}
+          @click=${() => this._choose(mode)}>Choose a file</button>
         <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = this._pasting === mode ? null : mode; this._problem = null; }}>
           Paste text</button>
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
index faf47e0..fcd24eb 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts
@@ -6,7 +6,7 @@ import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
 import { HouseholdView, inOrder } from '../../../core/household';
 import type { Layout } from '../../../core/layout';
 import type { ModuleService } from '../../../core/module-registry';
-import { POP_PAGE } from '../../../core/page-host';
+import { POP_PAGE, announceEditor } from '../../../core/page-host';
 import { errorMessage } from '../../../core/ws-api';
 import type { PlanaVistaData } from '../../../types';
 import type { ChoresService } from '../chores-service';
@@ -159,6 +159,23 @@ export class PvRewardEditor extends LitElement {
     `,
   ];
 
+  /** The editor's Cancel and Save, held in the Settings header (milestone 8). */
+  private _announced = '';
+
+  protected updated(): void {
+    const isNew = this._rewardId === null;
+    const editor = {
+      label: isNew ? 'Add' : 'Save',
+      ready: !(this._saving || (!isNew && !rewardDirty(this._record))),
+      save: () => void this._save(),
+      cancel: () => this._cancel(),
+    };
+    const said = `${editor.label}|${editor.ready}`;
+    if (said === this._announced) return;
+    this._announced = said;
+    announceEditor(this, editor);
+  }
+
   render() {
     if (this._rewardId !== null && this._chores?.board() && !this._reward) {
       return html`<p class="gone">This reward was removed on another screen.</p>`;
@@ -170,11 +187,6 @@ export class PvRewardEditor extends LitElement {
     return html`
       <div class="top">
         <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'reward', '🎁')}</span>
-        <div class="actions">
-          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
-          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !rewardDirty(this._record))}
-            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
-        </div>
       </div>
       ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
       <div class="group">
```

`custom_components/planavista/frontend/src/shell/settings/people-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/people-page.ts b/custom_components/planavista/frontend/src/shell/settings/people-page.ts
index f37384c..2966070 100644
--- a/custom_components/planavista/frontend/src/shell/settings/people-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/people-page.ts
@@ -147,7 +147,7 @@ export class PvSettingsPeople extends LitElement {
     return html`
       <div class="head">
         <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
-        ${editable ? html`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>` : nothing}
+        ${editable ? html`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ New person</button>` : nothing}
       </div>
       ${members.length === 0 ? html`<p class="empty">No one here yet.</p>` : nothing}
       <ul>
@@ -172,9 +172,6 @@ export class PvSettingsPeople extends LitElement {
           </li>
         `)}
       </ul>
-      ${editable && members.length > 0
-        ? html`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`
-        : nothing}
     `;
   }
 
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index c720aa5..e9be93f 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -17,7 +17,7 @@ import {
 } from '../../core/household';
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
-import { POP_PAGE, saveErrorMessage } from '../../core/page-host';
+import { POP_PAGE, announceEditor, saveErrorMessage } from '../../core/page-host';
 import {
   DraftRecord, PersonDraft, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft, withAgeGroup,
 } from '../../core/person-draft';
@@ -98,6 +98,7 @@ export class PvSettingsPerson extends LitElement {
 
   disconnectedCallback(): void {
     super.disconnectedCallback();
+    this._announced = '';
     this.removeEventListener(PERSON_CHANGE, this._onSectionChange as EventListener);
   }
 
@@ -242,6 +243,23 @@ export class PvSettingsPerson extends LitElement {
     `,
   ];
 
+  /** The editor's Cancel and Save, held in the Settings header (milestone 8). */
+  private _announced = '';
+
+  protected updated(): void {
+    const isNew = this._memberId === null;
+    const editor = {
+      label: isNew ? 'Add' : 'Save',
+      ready: !(this._saving || (!isNew && !isDirty(this._draft, this._start))),
+      save: () => void this._save(),
+      cancel: () => this._cancel(),
+    };
+    const said = `${editor.label}|${editor.ready}`;
+    if (said === this._announced) return;
+    this._announced = said;
+    announceEditor(this, editor);
+  }
+
   render() {
     if (!this._loaded || !this.household) return nothing;
     const member = this._member;
@@ -258,12 +276,6 @@ export class PvSettingsPerson extends LitElement {
           .hass=${this.hass}
           size="64"
         ></pv-member-avatar>
-        <div class="actions">
-          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
-          <button class="pv-btn pv-btn-primary" type="button"
-            ?disabled=${this._saving || (!isNew && !dirty)}
-            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
-        </div>
       </div>
       ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
       ${this._renderName()}
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 1365fd6..5e18bb5 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -10,7 +10,7 @@ import type { HouseholdView, Member } from '../../core/household';
 import type { HouseholdApi } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
 import type { ModuleService, OpenTarget } from '../../core/module-registry';
-import { OPEN_TARGET, PAGE_ERROR, POP_PAGE, PUSH_PAGE, PushPageDetail } from '../../core/page-host';
+import { OPEN_TARGET, PAGE_EDITOR, PAGE_ERROR, POP_PAGE, PUSH_PAGE, PageEditor, PushPageDetail } from '../../core/page-host';
 import type { Session } from '../../core/session';
 import {
   LookItem, SettingsContext, SettingsPage, SettingsTarget, groupPages, needsALook, settingsAt, settingsRegistry,
@@ -62,6 +62,8 @@ export class PvSettings extends LitElement {
   @state() private _stack: PushPageDetail[] = [];
   @state() private _toast = '';
   private _toastTimer: number | undefined;
+  /** The editor page open now, whose Cancel and Save the header holds. */
+  @state() private _editor: PageEditor | null = null;
 
   connectedCallback(): void {
     super.connectedCallback();
@@ -69,6 +71,7 @@ export class PvSettings extends LitElement {
     this.addEventListener(POP_PAGE, this._onPop);
     this.addEventListener(PAGE_ERROR, this._onError as EventListener);
     this.addEventListener(OPEN_TARGET, this._onOpen as EventListener);
+    this.addEventListener(PAGE_EDITOR, this._onEditor as EventListener);
   }
 
   disconnectedCallback(): void {
@@ -77,10 +80,13 @@ export class PvSettings extends LitElement {
     this.removeEventListener(POP_PAGE, this._onPop);
     this.removeEventListener(PAGE_ERROR, this._onError as EventListener);
     this.removeEventListener(OPEN_TARGET, this._onOpen as EventListener);
+    this.removeEventListener(PAGE_EDITOR, this._onEditor as EventListener);
     window.clearTimeout(this._toastTimer);
   }
 
   protected willUpdate(changed: PropertyValues): void {
+    // Another page in view: the editor that was open has gone (it can't say so once it has left the page).
+    if (changed.has('_stack') || changed.has('_selected')) this._editor = null;
     if (changed.has('target') && this.target) {
       const at = settingsAt(settingsRegistry.pages(this._context()), this.target);
       this._selected = at.selected;
@@ -120,11 +126,24 @@ export class PvSettings extends LitElement {
         font-weight: 800;
       }
 
-      .done {
+      .done,
+      .cancel,
+      .save {
         min-height: 48px;
         min-width: 88px;
       }
 
+      .done,
+      .cancel {
+        color: var(--pv-accent-ink, #5B5BD6);
+        font-weight: 700;
+      }
+
+      .editor-actions {
+        display: flex;
+        gap: 8px;
+      }
+
       .back {
         display: inline-flex;
         align-items: center;
@@ -303,10 +322,18 @@ export class PvSettings extends LitElement {
         <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
       ` : nothing}
       <div class="bar">
-        ${stackedPage
-          ? html`<button class="back" type="button" @click=${this._back}>‹ ${top ? top.back : 'Settings'}</button>`
-          : html`<h1 class="title">Settings</h1>`}
-        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
+        ${stackedPage && this._editor
+          ? html`<button class="pv-btn pv-btn-ghost cancel" type="button" @click=${() => this._editor?.cancel()}>Cancel</button>`
+          : stackedPage
+            ? html`<button class="back" type="button" @click=${this._back}>‹ ${top ? top.back : 'Settings'}</button>`
+            : html`<h1 class="title">Settings</h1>`}
+        ${this._editor ? html`
+          <div class="editor-actions">
+            ${stackedPage ? nothing : html`<button class="pv-btn pv-btn-ghost cancel" type="button" @click=${() => this._editor?.cancel()}>Cancel</button>`}
+            <button class="pv-btn pv-btn-primary save" type="button" ?disabled=${!this._editor.ready}
+              @click=${() => this._editor?.save()}>${this._editor.label}</button>
+          </div>
+        ` : html`<button class="pv-btn pv-btn-ghost done" type="button" @click=${this._done}>Done</button>`}
       </div>
       <div class="body">
         ${this._split || !current ? this._renderList(pages, current) : nothing}
@@ -437,6 +464,11 @@ export class PvSettings extends LitElement {
     this.dispatchEvent(new CustomEvent('pv-settings-open-target', { detail: target, bubbles: true, composed: true }));
   }
 
+  private _onEditor = (event: CustomEvent<PageEditor | null>): void => {
+    event.stopPropagation();
+    this._editor = event.detail;
+  };
+
   private _onError = (event: CustomEvent<{ message: string }>): void => {
     event.stopPropagation();
     this._toast = event.detail.message;
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1052 passed`; the task's own files `16 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** A person's page, the chore editor, and the reward editor put Cancel and Save in the Settings header; Cancel leaves the page; New chore stays in the bar in parent mode; People has one New person.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): Settings editors keep Save in view, New chore stays in the bar, one name per action

A person's page, the chore editor, and the reward editor hand their
Cancel and Save to the Settings header, so Save stays in view however
long the page is, enabled once something changed; Settings' own Done is a
text button and steps aside while an editor is open. New chore stays in
the bar when a parent unlocks the screen; the parent-mode strip holds
who, the countdown, and Lock. Creating something is "New ..." everywhere
(New chore, New reward, New person, with one New person on People),
Edit in a sheet is just Edit, Redeem answers as a secondary button, and
Restore is secondary to Import.
```

---

### Task 5: One people strip, one person picker, and the phone opens on its own person

Spec 3.6, 3.9 (people).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/people-strip.ts`, `custom_components/planavista/frontend/test/people.test.ts`
- Modify: `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/styles/controls.ts`, `custom_components/planavista/frontend/test/controls.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/controls.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/controls.test.ts b/custom_components/planavista/frontend/test/controls.test.ts
index ae09a02..4aa4174 100644
--- a/custom_components/planavista/frontend/test/controls.test.ts
+++ b/custom_components/planavista/frontend/test/controls.test.ts
@@ -34,6 +34,8 @@ describe('one control for each kind of choice (milestone 8, spec 3.9)', () => {
     const button = /\.pv-seg > button \{([^}]*)\}/.exec(text)?.[1] ?? '';
     expect(button).toMatch(/height:\s*48px/);
     expect(button).toMatch(/min-width:\s*48px/);
+    // A choice never shrinks to cut its word (the bar's views on a phone).
+    expect(button).toMatch(/flex:\s*0 0 auto/);
   });
 
   it('every button looks like one family, and disabled buttons look disabled', () => {
```

`custom_components/planavista/frontend/test/people.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { stripStart } from '../src/core/people-strip';
import { peopleStripStyles } from '../src/styles/controls';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('stripStart (milestone 8, spec 3.6): whose screen a people strip opens on', () => {
  const ids = ['alex', 'blair', 'casey', 'dana'];

  it('opens on the account\'s own person: Casey\'s phone shows Casey', () => {
    expect(stripStart(ids, null, 'casey')).toBe('casey');
  });

  it('keeps the person someone picked', () => {
    expect(stripStart(ids, 'dana', 'casey')).toBe('dana');
  });

  it('opens on the first person on a shared or admin login, or when the pick has gone', () => {
    expect(stripStart(ids, null, null)).toBe('alex');
    expect(stripStart(ids, 'eve', null)).toBe('alex');
    expect(stripStart([], null, 'casey')).toBeNull();
  });
});

describe('two people patterns, by job (milestone 8, spec 3.9)', () => {
  it('a people strip chooses whose view: the phone board, Day on a phone, and My day', () => {
    for (const path of ['modules/chores/pv-chores-board.ts', 'modules/chores/pv-chores-my-day.ts', 'modules/calendar/components/view-day.ts']) {
      expect(read(path), path).toMatch(/class="pv-people/);
      expect(read(path), path).toMatch(/class="pv-person"/);
    }
  });

  it('the strip never shrinks, so names stay whole', () => {
    const strip = /\.pv-people \{([^}]*)\}/.exec(peopleStripStyles.cssText)?.[1] ?? '';
    expect(strip).toMatch(/flex:\s*0 0 auto/);
  });

  it('person chips choose who something is for: New event, quick add, a chore, a reward', () => {
    for (const path of ['modules/calendar/components/event-create-dialog.ts', 'modules/chores/pv-chores-quick-add.ts',
      'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/pv-chores-reward-sheet.ts']) {
      expect(read(path), path).toMatch(/class="pv-person-chip/);
      expect(read(path), path).not.toMatch(/class="face"|class="cal-option/);
    }
  });

  it('Day on a narrow card shows one person at a time, with the strip', () => {
    const day = read('modules/calendar/components/view-day.ts');
    expect(day).toMatch(/\.day-people \{ display: flex; \}/);
    expect(day).toMatch(/\.person-column:not\(\.chosen\) \{ display: none; \}/);
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/controls.test.ts test/people.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/people-strip.ts` (new):

```ts
/**
 * Whose view a people strip opens on (milestone 8, spec 3.6): the person
 * someone picked while they're still there, else the account's own person
 * (Casey's phone opens on Casey), else the first person.
 */
export function stripStart(ids: readonly string[], chosen: string | null, own: string | null): string | null {
  if (chosen && ids.includes(chosen)) return chosen;
  if (own && ids.includes(own)) return own;
  return ids[0] ?? null;
}
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index bdec5c6..b6ab11f 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
+import { personChipStyles } from '../../../styles/controls';
 import { property, state, query } from 'lit/decorators.js';
 import { defineElement } from '../../../utils/define';
 import { HomeAssistant } from 'custom-card-helpers';
@@ -115,6 +116,7 @@ export class PVEventCreateDialog extends LitElement {
   @query('.end-time-display') private _endTimeEl?: HTMLElement;
 
   static styles = [
+    personChipStyles,
     baseStyles,
     buttonStyles,
     formStyles,
@@ -236,37 +238,11 @@ export class PVEventCreateDialog extends LitElement {
         padding-top: 12px;
       }
 
-      .cal-option {
-        display: inline-flex;
-        align-items: center;
-        gap: 0.375rem;
-        padding: 0.375rem 0.875rem;
-        border: 2px solid transparent;
-        border-radius: 9999px;
-        cursor: pointer;
-        transition: all var(--pv-transition);
-        font-size: 0.875rem;
-        font-weight: 600;
-        background: transparent;
-        font-family: inherit;
-        min-height: 48px;
-      }
 
-      .cal-option.selected {
-        color: white;
-        box-shadow: 0 2px 6px color-mix(in srgb, var(--cal-bg) 30%, transparent);
-      }
 
-      .cal-option:not(.selected) {
-        border-color: var(--pv-border);
-        color: var(--pv-text-secondary);
-      }
 
-      .cal-option:hover:not(.selected) {
-        border-color: var(--pv-text-muted);
-      }
 
-      .cal-option-wrap {
+      .who-wrap {
         position: relative;
         display: inline-flex;
       }
@@ -284,7 +260,7 @@ export class PVEventCreateDialog extends LitElement {
         pointer-events: none;
       }
 
-      .cal-option.locked {
+      .pv-person-chip.locked {
         cursor: default;
         opacity: 0.9;
       }
@@ -295,11 +271,6 @@ export class PVEventCreateDialog extends LitElement {
         opacity: 0.7;
       }
 
-      .cal-dot {
-        width: 10px;
-        height: 10px;
-        border-radius: 50%;
-      }
 
       .show-more-btn {
         display: inline-flex;
@@ -828,26 +799,24 @@ export class PVEventCreateDialog extends LitElement {
                   Tap someone to take them off this event.
                 </div>
               ` : nothing}
-              <div class="calendar-select" role="group" aria-labelledby="who-label">
+              <div class="calendar-select pv-person-chips" role="group" aria-labelledby="who-label">
                 ${visibleCalendars.map(cal => {
                   const selected = this._selectedCalendars.has(cal.entity_id);
                   const isOrganizer = cal.entity_id === this._organizerEntityId;
                   const isLockedOrganizer = isEdit && isOrganizer;
                   return html`
-                    <div class="cal-option-wrap">
+                    <div class="who-wrap">
                       ${isOrganizer && selected
                         ? html`<span class="organizer-badge">Organizer</span>`
                         : nothing}
                       <button
                         type="button"
-                        class="cal-option ${selected ? 'selected' : ''} ${isLockedOrganizer ? 'locked' : ''}"
+                        class="pv-person-chip ${isLockedOrganizer ? 'locked' : ''}"
                         aria-pressed=${selected ? 'true' : 'false'}
-                        style="${selected
-                          ? `background: ${cal.color}; --cal-bg: ${cal.color}; color: ${contrastText(cal.color)}`
-                          : `--cal-bg: ${cal.color}`}"
+                        style="--member: ${cal.color}"
                         @click=${() => this._toggleCalendar(cal.entity_id)}
                       >
-                        <span class="cal-dot" style="background: ${cal.color}"></span>
+                        <span class="dot" aria-hidden="true"></span>
                         ${cal.display_name}
                         ${isLockedOrganizer
                           ? html`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 63d049a..9e8278d 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
+import { peopleStripStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../../../utils/define';
 import { HomeAssistant } from 'custom-card-helpers';
@@ -16,6 +17,7 @@ import {
 } from '../utils/event-utils';
 import { getPersonAvatar, getPersonName } from '../../../utils/ha-utils';
 import { contrastText } from '../../../core/color';
+import { stripStart } from '../../../core/people-strip';
 import type { Layout } from '../../../core/layout';
 import { HOUR_PX, dayHourHeight, rescaleScroll } from '../layout-rules';
 
@@ -50,6 +52,8 @@ export class PVViewDay extends LitElement {
   @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
   @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
   @property({ type: Boolean }) hideColumnHeaders = false;
+  /** Whose lane a narrow card shows (milestone 8): picked on the strip, else the account's own person. */
+  @state() private _dayPick: string | null = null;
   @property({ attribute: false }) avatarBorderMode: string = 'primary';
   @property({ attribute: false }) sharedEventMap: Map<string, Array<{ entity_id: string; calendar_name: string; calendar_color: string; person_entity: string }>> = new Map();
   @property({ type: Number }) tick = 0;
@@ -70,6 +74,7 @@ export class PVViewDay extends LitElement {
   private _measured: HTMLElement | null = null;
 
   static styles = [
+    peopleStripStyles,
     baseStyles,
     eventStyles,
     nowIndicatorStyles,
@@ -526,9 +531,18 @@ export class PVViewDay extends LitElement {
 
       /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */
 
-      /* xs: phones, hide column headers, compact events */
+      /* Wide enough for every lane's header: the strip stays out of the way. */
+      .day-people { display: none; }
+      .day-people .person-avatar,
+      .day-people .person-initial { width: 32px; height: 32px; font-size: 0.875rem; }
+
+      /* xs: phones, hide column headers, compact events; one person at a time with the strip (milestone 8) */
       @container pv-calendar (max-width: 479px) {
         .column-headers { display: none; }
+        .day-people { display: flex; }
+        .person-column:not(.chosen) { display: none; }
+        .all-day-chip.other,
+        .all-day-section.none-chosen { display: none; }
         .time-gutter { width: 40px; }
         .all-day-gutter { width: 40px; font-size: 0.5625rem; }
         .time-label { font-size: 0.5625rem; }
@@ -538,9 +552,13 @@ export class PVViewDay extends LitElement {
         .next-day-footer { padding: 10px; font-size: 0.8125rem; }
       }
 
-      /* sm: large phones, hide column headers, narrower gutter */
+      /* sm: large phones, hide column headers, narrower gutter; one person at a time with the strip */
       @container pv-calendar (min-width: 480px) and (max-width: 767px) {
         .column-headers { display: none; }
+        .day-people { display: flex; }
+        .person-column:not(.chosen) { display: none; }
+        .all-day-chip.other,
+        .all-day-section.none-chosen { display: none; }
         .time-gutter { width: 48px; }
         .all-day-gutter { width: 48px; }
         .positioned-event { padding: 4px 8px; }
@@ -686,6 +704,11 @@ export class PVViewDay extends LitElement {
     const visibleCalendars = this.calendars.filter(c => c.visible !== false && !this.hiddenCalendars.has(c.entity_id));
     const personGroups = groupEventsByPerson(timedEvents, visibleCalendars);
     const personKeys = Array.from(personGroups.keys());
+    const chosenKey = stripStart(personKeys, this._dayPick, this._ownPerson(personKeys));
+    const keyOf = (e: CalendarEvent): string | null => {
+      const cal = visibleCalendars.find(c => c.entity_id === e.calendar_entity_id);
+      return cal ? (cal.person_entity || cal.entity_id) : null;
+    };
 
     // Compute now indicator position
     const now = new Date();
@@ -705,13 +728,24 @@ export class PVViewDay extends LitElement {
 
     return html`
       <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
+        ${personKeys.length > 1 ? html`
+          <div class="pv-people day-people" role="tablist" aria-label="Whose day">
+            ${personKeys.map(key => {
+              const face = this._face(key, visibleCalendars);
+              return html`
+                <button type="button" class="pv-person" role="tab" aria-selected=${key === chosenKey ? 'true' : 'false'}
+                  style="--member:${face.color}" @click=${() => { this._dayPick = key; }}>${face.picture}${face.name}</button>
+              `;
+            })}
+          </div>
+        ` : nothing}
         ${allDayEvents.length > 0 ? html`
-          <div class="all-day-section">
+          <div class="all-day-section ${allDayEvents.some(e => keyOf(e) === chosenKey) ? '' : 'none-chosen'}">
             <div class="all-day-gutter">All day</div>
             <div class="all-day-events">
               ${allDayEvents.map(e => html`
                 <div
-                  class="all-day-chip${isEventPast(e) ? ' past' : ''}"
+                  class="all-day-chip${isEventPast(e) ? ' past' : ''}${keyOf(e) !== chosenKey ? ' other' : ''}"
                   role="button"
                   tabindex="0"
                   @click=${() => this._onEventClick(e)}
@@ -792,7 +826,7 @@ export class PVViewDay extends LitElement {
               ${nowPercent >= 0 && nowPercent <= 100 ? html`
                 <div class="pv-now-line" style="top: ${nowPercent}%"></div>
               ` : nothing}
-              ${personKeys.map(key => this._renderColumn(key, personGroups.get(key) || []))}
+              ${personKeys.map(key => this._renderColumn(key, personGroups.get(key) || [], key === chosenKey))}
             </div>
           </div>
           ${this._renderNextDayFooter()}
@@ -801,6 +835,27 @@ export class PVViewDay extends LitElement {
     `;
   }
 
+  /** The account's own person, when one of the lanes is theirs. */
+  private _ownPerson(keys: string[]): string | null {
+    const user = this.hass?.user?.id;
+    if (!user) return null;
+    const person = Object.values(this.hass.states).find(s =>
+      s.entity_id.startsWith('person.') && (s.attributes as { user_id?: string }).user_id === user);
+    return person && keys.includes(person.entity_id) ? person.entity_id : null;
+  }
+
+  /** A lane's person as the strip draws them: their photo or initial, and name. */
+  private _face(key: string, calendars: CalendarConfig[]) {
+    const cal = calendars.find(c => (c.person_entity || c.entity_id) === key);
+    const avatar = cal?.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
+    const name = cal?.person_entity ? getPersonName(this.hass, cal.person_entity) : cal?.display_name || key;
+    const color = cal?.color || '#6366F1';
+    const picture = avatar
+      ? html`<img class="person-avatar" src="${avatar}" alt="" />`
+      : html`<div class="person-initial" style="background: ${color}; color: ${contrastText(color)}">${name[0]?.toUpperCase() || '?'}</div>`;
+    return { name, color, picture };
+  }
+
   private _renderTimeLabels() {
     const labels: ReturnType<typeof html>[] = [];
     for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
@@ -875,11 +930,11 @@ export class PVViewDay extends LitElement {
     }));
   }
 
-  private _renderColumn(personKey: string, events: CalendarEvent[]) {
+  private _renderColumn(personKey: string, events: CalendarEvent[], chosen: boolean) {
     const positioned = detectOverlaps(events);
 
     return html`
-      <div class="person-column">
+      <div class="person-column ${chosen ? 'chosen' : ''}">
         ${positioned.map(event => {
           // Clip to the viewed day so overnight events draw their full portion
           const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR, this.currentDate);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
index b1133f8..b37ab4e 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
@@ -1,8 +1,10 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
+import { peopleStripStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import { repeat } from 'lit/directives/repeat.js';
 import { keyed } from 'lit/directives/keyed.js';
 import type { HomeAssistant } from 'custom-card-helpers';
+import { stripStart } from '../../core/people-strip';
 import { defineElement } from '../../utils/define';
 import type { Layout } from '../../core/layout';
 import { HouseholdView, inOrder, memberColor } from '../../core/household';
@@ -51,6 +53,8 @@ export class PvChoresBoard extends LitElement {
 
   @state() private _width = 0;
   @state() private _phoneIndex = 0;
+  /** Someone tapped the strip or swiped: the board stays on their pick. */
+  private _phonePicked = false;
   @state() private _celebrate: Record<string, number> = {};
   @state() private _pulse: Record<string, number> = {};
   @state() private _family = false;
@@ -63,6 +67,7 @@ export class PvChoresBoard extends LitElement {
   private _touch: { x: number; y: number } | null = null;
 
   static styles = [
+    peopleStripStyles,
     choresStyles,
     css`
       :host {
@@ -92,36 +97,8 @@ export class PvChoresBoard extends LitElement {
         flex: 1 1 0;
       }
 
-      .people {
-        display: flex;
-        gap: 6px;
-        padding: 10px 12px 0;
-        overflow-x: auto;
-        scrollbar-width: none;
-      }
 
-      .person {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        gap: 2px;
-        min-width: 56px;
-        min-height: 48px;
-        padding: 2px 4px;
-        border: none;
-        border-radius: 12px;
-        background: transparent;
-        color: var(--pv-text-secondary, #5F6670);
-        font: inherit;
-        font-size: 0.75rem;
-        font-weight: 700;
-        cursor: pointer;
-      }
 
-      .person.on {
-        color: var(--pv-text, #1A1B1E);
-        background: var(--pv-card-bg, #FFFFFF);
-      }
 
       .phone {
         flex: 1 1 auto;
@@ -181,6 +158,11 @@ export class PvChoresBoard extends LitElement {
   }
 
   protected willUpdate(changed: PropertyValues): void {
+    if (!this._phonePicked && (changed.has('board') || changed.has('household'))) {
+      // Casey's phone opens on Casey; a shared or admin login opens on the first person (milestone 8).
+      const ids = this._columns().map(col => col.member.id);
+      this._phoneIndex = Math.max(0, ids.indexOf(stripStart(ids, null, this.household?.account?.member_id ?? null) ?? ''));
+    }
     if (!changed.has('board') && !changed.has('minute')) return;
     const columns = this._columns();
     const live = changed.get('board') !== undefined || this._closed.size > 0;
@@ -257,10 +239,10 @@ export class PvChoresBoard extends LitElement {
     const index = Math.min(this._phoneIndex, columns.length - 1);
     const current = columns[index];
     return html`
-      <div class="people" role="tablist" aria-label="Whose chores">
+      <div class="pv-people" role="tablist" aria-label="Whose chores">
         ${columns.map((col, i) => html`
-          <button type="button" class="person ${i === index ? 'on' : ''}" role="tab" aria-selected=${i === index ? 'true' : 'false'}
-            @click=${() => this._show(i)}>
+          <button type="button" class="pv-person" role="tab" aria-selected=${i === index ? 'true' : 'false'}
+            style="--member:${memberColor(col.member, this.mode)}" @click=${() => this._show(i)}>
             <pv-ring size="40" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${memberColor(col.member, this.mode)}>
               <pv-member-avatar .member=${{ ...col.member, color: memberColor(col.member, this.mode) }} .hass=${this.hass} size="28"></pv-member-avatar>
             </pv-ring>
@@ -276,6 +258,7 @@ export class PvChoresBoard extends LitElement {
 
   private _show(index: number): void {
     const before = this._phoneIndex;
+    this._phonePicked = true;
     this._phoneIndex = index;
     if (before === index || motionOf(this) === 'reduced') return;
     this.updateComplete.then(() => {
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index aad7177..e7ce35e 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -1,5 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
-import { segmentedStyles } from '../../styles/controls';
+import { peopleStripStyles, segmentedStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import { repeat } from 'lit/directives/repeat.js';
 import { keyed } from 'lit/directives/keyed.js';
@@ -63,6 +63,7 @@ export class PvChoresMyDay extends LitElement {
   @property({ attribute: false }) minute = 0;
 
   static styles = [
+    peopleStripStyles,
     segmentedStyles,
     choresStyles,
     css`
@@ -75,37 +76,8 @@ export class PvChoresMyDay extends LitElement {
         overscroll-behavior: contain;
       }
 
-      .picker {
-        display: flex;
-        justify-content: center;
-        gap: 10px;
-        padding: 12px 12px 4px;
-        flex-wrap: wrap;
-      }
 
-      .face {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        gap: 2px;
-        min-width: 56px;
-        min-height: 48px;
-        padding: 2px 4px;
-        border: none;
-        border-radius: 12px;
-        background: transparent;
-        color: var(--pv-text-secondary, #5F6670);
-        font: inherit;
-        font-size: 0.75rem;
-        font-weight: 700;
-        cursor: pointer;
-        opacity: 0.6;
-      }
 
-      .face[aria-pressed='true'] {
-        opacity: 1;
-        color: var(--pv-text, #1A1B1E);
-      }
 
       .layout {
         display: grid;
@@ -413,10 +385,10 @@ export class PvChoresMyDay extends LitElement {
     const style = this._style();
     return html`
       ${this.columns.length > 1 ? html`
-        <div class="picker" role="group" aria-label="Whose day">
+        <div class="pv-people" role="group" aria-label="Whose day">
           ${this.columns.map(col => html`
-            <button class="face" type="button" aria-pressed=${col.member.id === member.id ? 'true' : 'false'}
-              @click=${() => this._fire('pv-my-day-member', { member: col.member.id })}>
+            <button class="pv-person" type="button" aria-pressed=${col.member.id === member.id ? 'true' : 'false'}
+              style="--member:${this.colorOf(col.member)}" @click=${() => this._fire('pv-my-day-member', { member: col.member.id })}>
               <pv-ring size="44" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${this.colorOf(col.member)}>
                 <pv-member-avatar .member=${{ ...col.member, color: this.colorOf(col.member) }} .hass=${this.hass} size="32"></pv-member-avatar>
               </pv-ring>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
index 667f30f..8b34929 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
@@ -1,5 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
-import { segmentedStyles } from '../../styles/controls';
+import { personChipStyles, segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -50,6 +50,7 @@ export class PvChoresQuickAdd extends LitElement {
   private _closing = false;
 
   static styles = [
+    personChipStyles,
     formStyles,
     segmentedStyles,
     buttonStyles,
@@ -114,41 +115,9 @@ export class PvChoresQuickAdd extends LitElement {
         outline-offset: 1px;
       }
 
-      .faces {
-        display: flex;
-        flex-wrap: wrap;
-        gap: 10px;
-      }
 
-      .face {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        gap: 4px;
-        min-width: 56px;
-        min-height: 48px;
-        padding: 4px;
-        border: none;
-        border-radius: 14px;
-        background: transparent;
-        color: var(--pv-text-secondary, #5F6670);
-        font: inherit;
-        font-size: 0.8125rem;
-        font-weight: 700;
-        cursor: pointer;
-        opacity: 0.55;
-      }
 
-      .face[aria-pressed='true'] {
-        opacity: 1;
-        color: var(--pv-text, #1A1B1E);
-      }
 
-      .face[aria-pressed='true'] pv-member-avatar {
-        outline: 3px solid var(--face);
-        outline-offset: 2px;
-        border-radius: 50%;
-      }
 
 
 
@@ -281,11 +250,11 @@ export class PvChoresQuickAdd extends LitElement {
         </section>
         <section>
           <span class="title" id="who-title">Who</span>
-          <div class="faces" role="group" aria-labelledby="who-title">
+          <div class="pv-person-chips" role="group" aria-labelledby="who-title">
             ${this.people.map(person => html`
-              <button class="face" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
-                style="--face:${this.colorOf(person)}" @click=${() => this._toggle(person)}>
-                <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="40"></pv-member-avatar>
+              <button class="pv-person-chip" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
+                style="--member:${this.colorOf(person)}" @click=${() => this._toggle(person)}>
+                <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="28"></pv-member-avatar>
                 ${person.name}
               </button>
             `)}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
index ddbfaeb..0d7a416 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import { personChipStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
@@ -42,6 +43,7 @@ export class PvChoresRewardSheet extends LitElement {
   private _started = false;
 
   static styles = [
+    personChipStyles,
     formStyles,
     buttonStyles,
     sheetStyles,
@@ -139,33 +141,8 @@ export class PvChoresRewardSheet extends LitElement {
         border: 2px solid var(--pv-accent, #5B5BD6);
       }
 
-      .faces {
-        display: flex;
-        flex-wrap: wrap;
-        gap: 8px;
-      }
 
-      .face {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        gap: 4px;
-        min-height: 48px;
-        padding: 4px;
-        border: none;
-        background: transparent;
-        font: inherit;
-        font-size: 0.8125rem;
-        font-weight: 700;
-        color: var(--pv-text-secondary, #5F6670);
-        cursor: pointer;
-        opacity: 0.55;
-      }
 
-      .face[aria-pressed='true'] {
-        opacity: 1;
-        color: var(--pv-text, #1A1B1E);
-      }
 
       .row {
         display: flex;
@@ -282,11 +259,11 @@ export class PvChoresRewardSheet extends LitElement {
           @click=${() => this._set({ needsOk: !d.needsOk })}></button>
       </div>
       <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
-      <div class="faces">
+      <div class="pv-person-chips" role="group" aria-label="Who can get it">
         ${this.people.filter(p => p.stars).map(person => html`
-          <button class="face" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
+          <button class="pv-person-chip" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'} style="--member:${this.colorOf(person)}"
             @click=${() => this._set({ who: d.who.includes(person.id) ? d.who.filter(id => id !== person.id) : [...d.who, person.id] })}>
-            <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="36"></pv-member-avatar>
+            <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="28"></pv-member-avatar>
             ${person.name}
           </button>
         `)}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index 931ac7d..0894105 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -1,5 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
-import { segmentedStyles } from '../../../styles/controls';
+import { personChipStyles, segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
@@ -119,6 +119,7 @@ export class PvChoreEditor extends LitElement {
   }
 
   static styles = [
+    personChipStyles,
     segmentedStyles,
     baseStyles,
     buttonStyles,
@@ -211,34 +212,9 @@ export class PvChoreEditor extends LitElement {
         outline: none;
       }
 
-      .people {
-        display: flex;
-        flex-wrap: wrap;
-        gap: 14px;
-        padding: 12px 14px;
-      }
 
-      .person {
-        position: relative;
-        display: grid;
-        justify-items: center;
-        gap: 4px;
-        min-width: 56px;
-        border: none;
-        background: transparent;
-        color: inherit;
-        font: inherit;
-        font-size: 0.8125rem;
-        cursor: pointer;
-      }
 
-      .person[aria-pressed='false'] pv-member-avatar {
-        opacity: 0.4;
-      }
 
-      .person[aria-pressed='true'] .name {
-        font-weight: 700;
-      }
 
       .check {
         position: absolute;
@@ -316,6 +292,10 @@ export class PvChoreEditor extends LitElement {
       .gone {
         color: var(--pv-text-secondary, #6B7280);
       }
+
+      .who {
+        padding: 12px 14px;
+      }
     `,
   ];
 
@@ -412,14 +392,13 @@ export class PvChoreEditor extends LitElement {
     return html`
       <h2 class="section-label">Who</h2>
       <div class="group">
-        <div class="people" role="group" aria-label="Who">
+        <div class="pv-person-chips who" role="group" aria-label="Who">
           ${members.map(member => {
             const on = d.assignees.includes(member.id);
             return html`
-              <button class="person" type="button" aria-pressed=${on ? 'true' : 'false'} @click=${() => this._toggleMember(member.id)}>
-                <pv-member-avatar .member=${member} .hass=${this.hass} size="44"></pv-member-avatar>
-                ${on ? html`<span class="check" aria-hidden="true">✓</span>` : nothing}
-                <span class="name">${member.name}</span>
+              <button class="pv-person-chip" type="button" aria-pressed=${on ? 'true' : 'false'} style="--member:${member.color}"
+                @click=${() => this._toggleMember(member.id)}>
+                <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>${member.name}
               </button>
             `;
           })}
```

`custom_components/planavista/frontend/src/styles/controls.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/controls.ts b/custom_components/planavista/frontend/src/styles/controls.ts
index de173b1..5debc63 100644
--- a/custom_components/planavista/frontend/src/styles/controls.ts
+++ b/custom_components/planavista/frontend/src/styles/controls.ts
@@ -37,6 +37,8 @@ export const segmentedStyles = css`
   .pv-seg > button {
     position: relative;
     isolation: isolate;
+    /* Each choice keeps its width, so a long list scrolls (or wraps the bar) instead of cutting words. */
+    flex: 0 0 auto;
     min-width: 48px;
     height: 48px;
     padding: 0 14px;
@@ -194,3 +196,112 @@ export const tagStyles = css`
     color: var(--pv-warn-ink, #8A5A00);
   }
 `;
+
+/**
+ * Two people patterns, by job (milestone 8):
+ * - `.pv-people` holding `.pv-person` buttons chooses whose view you're looking
+ *   at (the phone board, Day on a phone, My day). The one shown is filled with
+ *   its person's color (`--member` on the button). The strip never shrinks.
+ * - `.pv-person-chips` holding `.pv-person-chip` buttons chooses who something
+ *   is for (New event's Who, quick add, a chore's people, a reward's who): an
+ *   avatar chip that, chosen, takes a ring in the person's color and a check.
+ */
+export const peopleStripStyles = css`
+  .pv-people {
+    display: flex;
+    flex: 0 0 auto;
+    gap: 6px;
+    padding: 8px 12px 0;
+    overflow-x: auto;
+    scrollbar-width: none;
+  }
+
+  .pv-people::-webkit-scrollbar {
+    display: none;
+  }
+
+  .pv-person {
+    flex: 0 0 auto;
+    display: flex;
+    flex-direction: column;
+    align-items: center;
+    gap: 2px;
+    min-width: 56px;
+    min-height: 56px;
+    padding: 4px 6px;
+    border: none;
+    border-radius: 14px;
+    background: transparent;
+    color: var(--pv-text-secondary, #5F6670);
+    font: inherit;
+    font-size: 0.75rem;
+    font-weight: 700;
+    cursor: pointer;
+    -webkit-tap-highlight-color: transparent;
+  }
+
+  .pv-person[aria-selected='true'],
+  .pv-person[aria-pressed='true'] {
+    color: var(--pv-text, #1A1B1E);
+    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 16%, var(--pv-card-bg, #FFFFFF));
+  }
+
+  .pv-person:focus-visible {
+    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+    outline-offset: -2px;
+  }
+`;
+
+export const personChipStyles = css`
+  .pv-person-chips {
+    display: flex;
+    flex-wrap: wrap;
+    gap: 8px;
+  }
+
+  .pv-person-chip {
+    display: inline-flex;
+    align-items: center;
+    gap: 8px;
+    min-height: 48px;
+    padding: 4px 14px 4px 6px;
+    box-sizing: border-box;
+    border: 1.5px solid var(--pv-border, #E7E7E3);
+    border-radius: 999px;
+    background: var(--pv-card-bg, #FFFFFF);
+    color: var(--pv-text, #1A1B1E);
+    font: inherit;
+    font-size: 0.875rem;
+    font-weight: 600;
+    cursor: pointer;
+    -webkit-tap-highlight-color: transparent;
+  }
+
+  .pv-person-chip .dot {
+    width: 28px;
+    height: 28px;
+    flex: none;
+    border-radius: 50%;
+    background: var(--member, var(--pv-accent, #5B5BD6));
+  }
+
+  .pv-person-chip[aria-pressed='true'] {
+    border-color: var(--member, var(--pv-accent, #5B5BD6));
+    background: color-mix(in srgb, var(--member, var(--pv-accent, #5B5BD6)) 12%, var(--pv-card-bg, #FFFFFF));
+  }
+
+  .pv-person-chip[aria-pressed='true']::after {
+    content: '✓';
+    font-weight: 800;
+  }
+
+  .pv-person-chip:focus-visible {
+    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+    outline-offset: 2px;
+  }
+
+  .pv-person-chip:disabled {
+    opacity: 0.45;
+    cursor: default;
+  }
+`;
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1060 passed`; the task's own files `235 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Casey's phone opens the board on Casey; Day shows one person at a time below 768 px with the same strip; person chips in New event's Who, quick add, a chore's people, and a reward's who.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one people strip, one person picker, and the phone opens on its own person

Choosing whose view you're looking at (the phone board, My day, and
now Day on a narrow card) is one people strip, the shown person filled
with their color; choosing who something is for (New event's Who, quick
add, a chore's people, a reward's who) is one avatar chip, chosen with a
ring in the person's color and a check. On a phone the board opens on
the account's own person and its strip never squeezes the names; Day on
a card under 768 px shows one person at a time with the strip, since its
lane headers don't fit. Pick-one choices keep their width, so the bar's
views never cut a word.
```

---

### Task 6: Dates and times are picked one way everywhere

Spec 3.11 (dates and times).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/picker-views.ts`, `custom_components/planavista/frontend/src/core/pickers.ts`, `custom_components/planavista/frontend/src/core/pv-date-field.ts`, `custom_components/planavista/frontend/src/core/pv-time-field.ts`, `custom_components/planavista/frontend/src/styles/pickers.ts`, `custom_components/planavista/frontend/test/pickers.test.ts`
- Modify: `custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/pickers.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dateKey, dateLabel, monthDays, shiftMonth, timeLabel, timeSlots } from '../src/core/pickers';

describe('the shared date and time pickers (milestone 8, spec 3.11)', () => {
  it('a month grid is six weeks from the Sunday on or before the 1st', () => {
    const days = monthDays(2026, 9); // October 2026
    expect(days).toHaveLength(42);
    expect(dateKey(days[0])).toBe('2026-09-27');
    expect(dateKey(days[4])).toBe('2026-10-01');
    expect(dateKey(days[41])).toBe('2026-11-07');
  });

  it('steps months across a year', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('offers every quarter hour, or the slots a setting allows', () => {
    const slots = timeSlots();
    expect(slots).toHaveLength(96);
    expect(slots[0]).toBe('00:00');
    expect(slots[95]).toBe('23:45');
  });

  it('labels times as the household reads them', () => {
    expect(timeLabel('00:00', '12h')).toBe('12:00 AM');
    expect(timeLabel('13:30', '12h')).toBe('1:30 PM');
    expect(timeLabel('07:05', '24h')).toBe('07:05');
    expect(timeLabel('', '12h')).toBe('');
  });

  it('labels a date one way, in the editor and every field', () => {
    expect(dateLabel('2026-10-20')).toBe('Tue, October 20, 2026');
    expect(dateLabel('')).toBe('');
  });

  it('dates and times are picked one way: no native date or time inputs anywhere', () => {
    const files = ['core/pv-recurrence-picker.ts', 'modules/chores/pv-chore-options.ts', 'modules/chores/pv-chores-quick-add.ts',
      'modules/chores/settings/pv-chore-editor.ts', 'modules/chores/settings/pv-person-chores.ts', 'modules/chores/settings/pv-person-sleep.ts',
      'shell/settings/pv-appearance-editor.ts'];
    for (const path of files) {
      const text = readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');
      expect(text, path).not.toMatch(/type="(date|time)"/);
    }
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/pickers.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/picker-views.ts` (new):

```ts
import { html, TemplateResult } from 'lit';
import { dateKey, monthDays, timeLabel } from './pickers';

/** The one month grid and the one time list (milestone 8, spec 3.11). Styles: styles/pickers.ts. */

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface MonthGridOptions {
  year: number;
  /** 0 to 11. */
  month: number;
  /** "YYYY-MM-DD", or "". */
  selected: string;
  min?: string;
  max?: string;
  onPick(day: string): void;
  onPrev(): void;
  onNext(): void;
}

export function monthGrid(o: MonthGridOptions): TemplateResult {
  const today = dateKey(new Date());
  return html`
    <div class="picker-header">
      <span class="picker-month-label">${new Date(o.year, o.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      <div class="picker-nav">
        <button class="picker-nav-btn" type="button" aria-label="Previous month" @click=${o.onPrev}>
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <button class="picker-nav-btn" type="button" aria-label="Next month" @click=${o.onNext}>
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    </div>
    <div class="picker-weekdays">${WEEKDAY_LABELS.map(d => html`<span class="picker-weekday">${d}</span>`)}</div>
    <div class="picker-days">
      ${monthDays(o.year, o.month).map(day => {
        const key = dateKey(day);
        const out = (!!o.min && key < o.min) || (!!o.max && key > o.max);
        return html`
          <button type="button"
            class="picker-day ${day.getMonth() !== o.month ? 'other-month' : ''} ${key === today ? 'today' : ''} ${key === o.selected ? 'selected' : ''}"
            aria-pressed=${key === o.selected ? 'true' : 'false'}
            aria-label=${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            ?disabled=${out} @click=${() => o.onPick(key)}><span>${day.getDate()}</span></button>
        `;
      })}
    </div>
  `;
}

export interface TimeListOptions {
  slots: readonly string[];
  /** "HH:MM", or "". */
  selected: string;
  format: '12h' | '24h';
  onPick(time: string): void;
}

export function timeList(o: TimeListOptions): TemplateResult {
  return html`${o.slots.map(slot => html`
    <button type="button" class="time-slot ${slot === o.selected ? 'selected' : ''}" aria-pressed=${slot === o.selected ? 'true' : 'false'}
      @click=${() => o.onPick(slot)}>${timeLabel(slot, o.format)}</button>
  `)}`;
}
```

`custom_components/planavista/frontend/src/core/pickers.ts` (new):

```ts
/**
 * The rules behind the one date and time picker (milestone 8, spec 3.11),
 * shared by the event editor's dropdowns and the inline date and time
 * fields everywhere else. Dates are local "YYYY-MM-DD"; times "HH:MM".
 */

/** A local date as "YYYY-MM-DD". */
export function dateKey(day: Date): string {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

/** The 42 days a month grid shows: six weeks from the Sunday on or before the 1st. `month` is 0 to 11. */
export function monthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** The month `delta` months away. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const at = new Date(year, month + delta, 1);
  return { year: at.getFullYear(), month: at.getMonth() };
}

/** Every quarter hour of the day ("00:00" to "23:45"). */
export function timeSlots(stepMinutes = 15): string[] {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
}

/** A time as the household reads it: "1:30 PM", or "13:30" with 24-hour time. */
export function timeLabel(time: string, format: '12h' | '24h'): string {
  if (!/^\d{2}:\d{2}$/.test(time)) return '';
  const [h, m] = time.split(':').map(Number);
  if (format === '24h') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** A date as the household reads it: "Tue, October 20, 2026" (the editor's and every field's label). */
export function dateLabel(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}
```

`custom_components/planavista/frontend/src/core/pv-date-field.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { pickerStyles } from '../styles/pickers';
import { dateLabel, shiftMonth } from './pickers';
import { monthGrid } from './picker-views';

/**
 * pv-date-field: a date that opens the shared month grid in place, the one
 * way dates are picked outside the event editor (milestone 8, spec 3.11).
 * It sets its own `value` and fires a plain `change`, so a handler that reads
 * the target's value (as for a date input) works unchanged. Escape closes the
 * grid without closing the sheet around it.
 *
 * @fires change - the value ("YYYY-MM-DD") changed
 */
export class PvDateField extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';
  @property({ type: String }) placeholder = 'Pick a date';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private _open = false;
  @state() private _year = 0;
  @state() private _month = 0;

  static styles = [
    pickerStyles,
    css`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        padding: 8px;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        width: max-content;
        max-width: 100%;
        box-sizing: border-box;
      }
    `,
  ];

  render() {
    return html`
      <button class="picker-field" type="button" aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${this.getAttribute('aria-label') ?? nothing} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:calendar"></ha-icon>
        <span class=${this.value ? '' : 'placeholder'}>${this.value ? dateLabel(this.value) : this.placeholder}</span>
      </button>
      ${this._open ? html`
        <div class="panel" @keydown=${this._key}>
          ${monthGrid({
            year: this._year, month: this._month, selected: this.value, min: this.min || undefined, max: this.max || undefined,
            onPick: day => this._pick(day),
            onPrev: () => this._step(-1),
            onNext: () => this._step(1),
          })}
        </div>
      ` : nothing}
    `;
  }

  private _toggle = (): void => {
    this._open = !this._open;
    if (!this._open) return;
    const at = this.value || this.min || '';
    const now = new Date();
    const [y, m] = at ? at.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
    this._year = y;
    this._month = m - 1;
    void this.updateComplete.then(() => {
      const root = this.renderRoot;
      (root.querySelector<HTMLElement>('.picker-day.selected') ?? root.querySelector<HTMLElement>('.picker-day.today')
        ?? root.querySelector<HTMLElement>('.picker-day:not([disabled])'))?.focus();
    });
  };

  private _step(delta: number): void {
    const next = shiftMonth(this._year, this._month, delta);
    this._year = next.year;
    this._month = next.month;
  }

  private _pick(day: string): void {
    this.value = day;
    this._open = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this._open = false;
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  };
}

defineElement('pv-date-field', PvDateField);
```

`custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
index 30d0ea5..f138943 100644
--- a/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
+++ b/custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { segmentedStyles } from '../styles/controls';
 import { property } from 'lit/decorators.js';
+import './pv-date-field';
 import { defineElement } from '../utils/define';
 import { Freq, RecurrenceValue, WEEKDAYS, Weekday, ordinal, recurrenceSummary, weekdayOf } from './recurrence';
 
@@ -183,8 +184,8 @@ export class PvRecurrencePicker extends LitElement {
         ` : nothing}
         <div class="row">
           <label class="label" for="start">Starts</label>
-          <input id="start" type="date" .value=${v.start}
-            @change=${(e: Event) => this._start((e.target as HTMLInputElement).value)} />
+          <pv-date-field id="start"  .value=${v.start}
+            @change=${(e: Event) => this._start((e.target as HTMLInputElement).value)}></pv-date-field>
         </div>
         <div class="row">
           <span class="label">Ends</span>
@@ -211,8 +212,8 @@ export class PvRecurrencePicker extends LitElement {
         ${v.ends === 'until' ? html`
           <div class="row">
             <label class="label" for="until">End date</label>
-            <input id="until" type="date" .value=${v.until} min=${v.start}
-              @change=${(e: Event) => this._set({ until: (e.target as HTMLInputElement).value || v.until })} />
+            <pv-date-field id="until"  .value=${v.until} min=${v.start}
+              @change=${(e: Event) => this._set({ until: (e.target as HTMLInputElement).value || v.until })}></pv-date-field>
           </div>
         ` : nothing}
       </div>
```

`custom_components/planavista/frontend/src/core/pv-time-field.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { pickerStyles } from '../styles/pickers';
import { timeLabel, timeSlots } from './pickers';
import { timeList } from './picker-views';

/**
 * pv-time-field: a time that opens the shared time list in place, the one
 * way times are picked outside the event editor (milestone 8, spec 3.11).
 * `slots` limits the choices (a setting's allowed times); `clearable` adds
 * "No time". It sets its own `value` and fires a plain `change`, like a time
 * input or a select. Escape closes the list without closing the sheet.
 *
 * @fires change - the value ("HH:MM", or "" when cleared) changed
 */
export class PvTimeField extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) format: '12h' | '24h' = '12h';
  @property({ attribute: false }) slots: readonly string[] | null = null;
  @property({ type: Boolean }) clearable = false;
  @property({ type: String }) placeholder = 'Pick a time';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private _open = false;

  static styles = [
    pickerStyles,
    css`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        max-height: 280px;
        min-width: 160px;
        overflow-y: auto;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        scrollbar-width: thin;
      }
    `,
  ];

  render() {
    return html`
      <button class="picker-field" type="button" aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${this.getAttribute('aria-label') ?? nothing} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:clock-outline"></ha-icon>
        <span class=${this.value ? '' : 'placeholder'}>${this.value ? timeLabel(this.value, this.format) : this.placeholder}</span>
      </button>
      ${this._open ? html`
        <div class="panel" @keydown=${this._key}>
          ${this.clearable ? html`<button type="button" class="time-slot ${this.value ? '' : 'selected'}" @click=${() => this._pick('')}>No time</button>` : nothing}
          ${timeList({ slots: this.slots ?? timeSlots(), selected: this.value, format: this.format, onPick: time => this._pick(time) })}
        </div>
      ` : nothing}
    `;
  }

  private _toggle = (): void => {
    this._open = !this._open;
    if (!this._open) return;
    void this.updateComplete.then(() => {
      const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
      const selected = panel?.querySelector<HTMLElement>('.time-slot.selected');
      if (panel && selected) panel.scrollTop = selected.offsetTop - panel.clientHeight / 2 + selected.clientHeight / 2;
      (selected ?? panel?.querySelector<HTMLElement>('.time-slot'))?.focus({ preventScroll: true });
    });
  };

  private _pick(time: string): void {
    this.value = time;
    this._open = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this._open = false;
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  };
}

defineElement('pv-time-field', PvTimeField);
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index b6ab11f..c101c61 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -28,10 +28,12 @@ import { SheetController } from '../../../shell/sheet-controller';
 import type { NoticeAction } from '../../../shell/pv-notice-sheet';
 import '../../../shell/pv-notice-sheet';
 import { LocationSearch } from '../utils/location-search';
+import { monthGrid, timeList } from '../../../core/picker-views';
+import { dateLabel, timeSlots } from '../../../core/pickers';
+import { pickerStyles } from '../../../styles/pickers';
 import { contrastText } from '../../../core/color';
 import { calendarCan, formSignature, saveFailedText } from '../event-words';
 
-const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
 
 const DISCARD_ACTIONS: NoticeAction[] = [
   { id: 'discard', label: 'Discard changes', kind: 'destructive' },
@@ -116,6 +118,7 @@ export class PVEventCreateDialog extends LitElement {
   @query('.end-time-display') private _endTimeEl?: HTMLElement;
 
   static styles = [
+    pickerStyles,
     personChipStyles,
     baseStyles,
     buttonStyles,
@@ -365,121 +368,6 @@ export class PVEventCreateDialog extends LitElement {
         animation: pv-fadeIn 150ms ease;
       }
 
-      .picker-header {
-        display: flex;
-        align-items: center;
-        justify-content: space-between;
-        margin-bottom: 8px;
-      }
-
-      .picker-month-label {
-        font-size: 0.9375rem;
-        font-weight: 600;
-        color: var(--pv-text);
-      }
-
-      .picker-nav {
-        display: flex;
-        gap: 2px;
-      }
-
-      .picker-nav-btn {
-        display: flex;
-        align-items: center;
-        justify-content: center;
-        width: 48px;
-        height: 48px;
-        border: none;
-        border-radius: 50%;
-        background: transparent;
-        color: var(--pv-text-secondary);
-        cursor: pointer;
-        font-family: inherit;
-        transition: background 150ms;
-      }
-
-      .picker-nav-btn:hover {
-        background: var(--pv-event-hover, rgba(0,0,0,0.05));
-      }
-
-      .picker-nav-btn ha-icon {
-        --mdc-icon-size: 18px;
-      }
-
-      .picker-weekdays {
-        display: grid;
-        grid-template-columns: repeat(7, 1fr);
-        text-align: center;
-        margin-bottom: 4px;
-      }
-
-      .picker-weekday {
-        font-size: 0.6875rem;
-        font-weight: 600;
-        color: var(--pv-text-muted);
-        padding: 4px 0;
-      }
-
-      .picker-days {
-        display: grid;
-        grid-template-columns: repeat(7, 48px);
-      }
-
-      /* A 48 px target with the day drawn smaller inside (spec 11.8). */
-      .picker-day {
-        display: grid;
-        place-items: center;
-        width: 48px;
-        height: 48px;
-        padding: 0;
-        border: none;
-        background: transparent;
-        color: var(--pv-text);
-        font-family: var(--pv-font-heading, inherit);
-        font-size: 0.875rem;
-        font-variant-numeric: tabular-nums;
-        cursor: pointer;
-      }
-
-      .picker-day span {
-        display: grid;
-        place-items: center;
-        box-sizing: border-box;
-        width: 36px;
-        height: 36px;
-        border-radius: 50%;
-        transition: background 150ms;
-      }
-
-      .picker-day:hover span {
-        background: var(--pv-event-hover, rgba(0,0,0,0.05));
-      }
-
-      .picker-day:focus-visible {
-        outline: none;
-      }
-
-      .picker-day:focus-visible span {
-        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
-        outline-offset: 1px;
-      }
-
-      .picker-day.other-month {
-        color: var(--pv-text-muted);
-        opacity: 0.4;
-      }
-
-      .picker-day.today span {
-        border: 2px solid var(--pv-accent);
-        font-weight: 700;
-      }
-
-      .picker-day.selected span {
-        background: var(--pv-accent);
-        color: var(--pv-accent-text, #fff);
-        font-weight: 700;
-      }
-
       /* ============================================
          CUSTOM TIME PICKER
          ============================================ */
@@ -532,32 +420,6 @@ export class PVEventCreateDialog extends LitElement {
         border-radius: 4px;
       }
 
-      .time-slot {
-        display: block;
-        width: 100%;
-        min-height: 48px;
-        padding: 0 16px;
-        border: none;
-        background: transparent;
-        text-align: left;
-        font-family: inherit;
-        font-size: 0.9375rem;
-        font-variant-numeric: tabular-nums;
-        color: var(--pv-text);
-        cursor: pointer;
-        transition: background 120ms ease;
-      }
-
-      .time-slot:hover {
-        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
-      }
-
-      .time-slot.selected {
-        background: var(--pv-accent);
-        color: var(--pv-accent-text, #fff);
-        font-weight: 600;
-      }
-
       /* ============================================
          LOCATION AUTOCOMPLETE (fixed position)
          ============================================ */
@@ -749,15 +611,7 @@ export class PVEventCreateDialog extends LitElement {
   }
 
   private _formatDateDisplay(): string {
-    if (!this._date) return 'Pick a date';
-    const [y, m, d] = this._date.split('-').map(Number);
-    const date = new Date(y, m - 1, d);
-    return date.toLocaleDateString('en-US', {
-      weekday: 'short',
-      month: 'long',
-      day: 'numeric',
-      year: 'numeric',
-    });
+    return this._date ? dateLabel(this._date) : 'Pick a date';
   }
 
   render() {
@@ -1015,37 +869,12 @@ export class PVEventCreateDialog extends LitElement {
         style="top: ${top}px; left: ${rect.left}px;"
         @keydown=${this._sheet.onKeydown}
       >
-        <div class="picker-header">
-          <span class="picker-month-label">
-            ${new Date(this._pickerYear, this._pickerMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
-          </span>
-          <div class="picker-nav">
-            <button class="picker-nav-btn" type="button" aria-label="Previous month" @click=${this._pickerPrevMonth}>
-              <ha-icon icon="mdi:chevron-left"></ha-icon>
-            </button>
-            <button class="picker-nav-btn" type="button" aria-label="Next month" @click=${this._pickerNextMonth}>
-              <ha-icon icon="mdi:chevron-right"></ha-icon>
-            </button>
-          </div>
-        </div>
-        <div class="picker-weekdays">
-          ${WEEKDAY_LABELS.map(d => html`<span class="picker-weekday">${d}</span>`)}
-        </div>
-        <div class="picker-days">
-          ${this._getPickerDays().map(day => {
-            const isOther = day.getMonth() !== this._pickerMonth;
-            const isToday = this._toDateStr(day) === this._toDateStr(new Date());
-            const isSelected = this._toDateStr(day) === this._date;
-            return html`
-              <button
-                type="button"
-                class="picker-day ${isOther ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
-                aria-pressed=${isSelected ? 'true' : 'false'}
-                @click=${() => this._selectPickerDay(day)}
-              ><span>${day.getDate()}</span></button>
-            `;
-          })}
-        </div>
+        ${monthGrid({
+          year: this._pickerYear, month: this._pickerMonth, selected: this._date,
+          onPick: day => this._selectPickerDay(day),
+          onPrev: () => this._pickerPrevMonth(),
+          onNext: () => this._pickerNextMonth(),
+        })}
       </div>
     `;
   }
@@ -1082,23 +911,8 @@ export class PVEventCreateDialog extends LitElement {
     }
   }
 
-  private _getPickerDays(): Date[] {
-    const firstOfMonth = new Date(this._pickerYear, this._pickerMonth, 1);
-    const startDay = firstOfMonth.getDay(); // 0=Sun
-    const start = new Date(firstOfMonth);
-    start.setDate(start.getDate() - startDay);
-
-    const days: Date[] = [];
-    for (let i = 0; i < 42; i++) {
-      const d = new Date(start);
-      d.setDate(d.getDate() + i);
-      days.push(d);
-    }
-    return days;
-  }
-
-  private _selectPickerDay(day: Date) {
-    this._date = this._toDateStr(day);
+  private _selectPickerDay(day: string) {
+    this._date = day;
     this._datePickerOpen = false;
     this._focusAfterUpdate(() => this._dateDisplay ?? null);
   }
@@ -1118,15 +932,6 @@ export class PVEventCreateDialog extends LitElement {
     return `${h12}:${String(m).padStart(2, '0')} ${period}`;
   }
 
-  private _getTimeSlots(): string[] {
-    const slots: string[] = [];
-    for (let h = 0; h < 24; h++) {
-      for (let m = 0; m < 60; m += 15) {
-        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
-      }
-    }
-    return slots;
-  }
 
   private _openTimePicker(which: 'start' | 'end') {
     this._datePickerOpen = false;
@@ -1168,7 +973,7 @@ export class PVEventCreateDialog extends LitElement {
     if (!el) return nothing;
     const rect = el.getBoundingClientRect();
     const currentTime = this._activeTimePicker === 'start' ? this._startTime : this._endTime;
-    const slots = this._getTimeSlots();
+    const slots = timeSlots();
 
     const dropdownHeight = 280;
     const spaceBelow = window.innerHeight - rect.bottom - 8;
@@ -1181,14 +986,7 @@ export class PVEventCreateDialog extends LitElement {
         style="top: ${top}px; left: ${rect.left}px; width: ${rect.width}px;"
         @keydown=${this._sheet.onKeydown}
       >
-        ${slots.map(slot => html`
-          <button
-            type="button"
-            class="time-slot ${slot === currentTime ? 'selected' : ''}"
-            aria-pressed=${slot === currentTime ? 'true' : 'false'}
-            @click=${() => this._selectTime(slot)}
-          >${this._formatTimeForDisplay(slot)}</button>
-        `)}
+        ${timeList({ slots, selected: currentTime, format: this.timeFormat === '24h' ? '24h' : '12h', onPick: slot => this._selectTime(slot) })}
       </div>
     `;
   }
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
index 62dcb3b..b5eebb3 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { tagStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
+import '../../core/pv-date-field';
 import { defineElement } from '../../utils/define';
 import { buttonStyles } from '../../styles/shared';
 import { sheetStyles } from '../../styles/sheet';
@@ -319,8 +320,8 @@ export class PvChoreOptions extends LitElement {
           <button class="chip" type="button" @click=${() => this._choose(option.id, chip.day)}>${chip.label}</button>
         `)}
         ${option.pick ? html`
-          <input type="date" aria-label="Pick a date" min=${option.pick.min} max=${option.pick.max ?? nothing}
-            @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this._choose(option.id, value); }} />
+          <pv-date-field  aria-label="Pick a date" min=${option.pick.min} max=${option.pick.max ?? nothing}
+            @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this._choose(option.id, value); }}></pv-date-field>
         ` : nothing}
       </div>
     `;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
index 8b34929..3821091 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { personChipStyles, segmentedStyles } from '../../styles/controls';
 import { property, state } from 'lit/decorators.js';
+import '../../core/pv-date-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { buttonStyles, formStyles } from '../../styles/shared';
@@ -270,8 +271,8 @@ export class PvChoresQuickAdd extends LitElement {
               ${byChips(this.today).map(chip => html`
                 <button class="chip" type="button" aria-pressed=${d.by === chip.day ? 'true' : 'false'} @click=${() => this._set({ by: chip.day })}>${chip.label}</button>
               `)}
-              <input type="date" aria-label="Pick a date" min=${this.today} .value=${d.by && !byChips(this.today).some(c => c.day === d.by) ? d.by : ''}
-                @change=${(e: Event) => this._set({ by: (e.target as HTMLInputElement).value || null })} />
+              <pv-date-field  aria-label="Pick a date" min=${this.today} .value=${d.by && !byChips(this.today).some(c => c.day === d.by) ? d.by : ''}
+                @change=${(e: Event) => this._set({ by: (e.target as HTMLInputElement).value || null })}></pv-date-field>
             </div>
           ` : nothing}
           ${d.when === 'repeats' ? html`
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
index 0894105..b55a34b 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts
@@ -1,6 +1,8 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { personChipStyles, segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
+import '../../../core/pv-time-field';
+import '../../../core/pv-date-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
@@ -553,15 +555,15 @@ export class PvChoreEditor extends LitElement {
         ${d.once_when !== 'any' ? html`
           <label class="row">
             <span class="row-text">Date</span>
-            <input class="pv-input" type="date" min=${board.today} .value=${d.date}
-              @change=${(e: Event) => this._change({ date: (e.target as HTMLInputElement).value })} />
+            <pv-date-field  min=${board.today} .value=${d.date}
+              @change=${(e: Event) => this._change({ date: (e.target as HTMLInputElement).value })}></pv-date-field>
           </label>
         ` : nothing}
         ${d.once_when === 'by' ? html`
           <label class="row">
             <span class="row-text">By<span class="row-sub">Leave it empty for the end of the day.</span></span>
-            <input class="pv-input" type="time" .value=${d.by_time ?? ''}
-              @change=${(e: Event) => this._change({ by_time: (e.target as HTMLInputElement).value || null })} />
+            <pv-time-field  clearable .format=${this.data?.display?.time_format === '24h' ? '24h' : '12h'} .value=${d.by_time ?? ''}
+              @change=${(e: Event) => this._change({ by_time: (e.target as HTMLInputElement).value || null })}></pv-time-field>
           </label>
         ` : nothing}
         <div class="row">
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
index f0f29c3..43aa8d7 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { segmentedStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
+import '../../../core/pv-date-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
@@ -166,10 +167,10 @@ export class PvPersonChores extends LitElement {
         <div class="row">
           <div class="stack">
             <div class="away-form">
-              <label>From <input class="pv-input" type="date" .value=${this._adding.from}
-                @change=${(e: Event) => { this._adding = { ...this._adding!, from: (e.target as HTMLInputElement).value }; }} /></label>
-              <label>To <input class="pv-input" type="date" .value=${this._adding.to} min=${this._adding.from}
-                @change=${(e: Event) => { this._adding = { ...this._adding!, to: (e.target as HTMLInputElement).value }; }} /></label>
+              <label>From <pv-date-field  .value=${this._adding.from}
+                @change=${(e: Event) => { this._adding = { ...this._adding!, from: (e.target as HTMLInputElement).value }; }}></pv-date-field></label>
+              <label>To <pv-date-field  .value=${this._adding.to} min=${this._adding.from}
+                @change=${(e: Event) => { this._adding = { ...this._adding!, to: (e.target as HTMLInputElement).value }; }}></pv-date-field></label>
               <label>Note <input class="pv-input" type="text" maxlength="60" placeholder="At Grandma's" .value=${this._adding.note ?? ''}
                 @input=${(e: Event) => { this._adding = { ...this._adding!, note: (e.target as HTMLInputElement).value }; }} /></label>
             </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts
index 33b4d64..9bd4af8 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts
@@ -1,8 +1,10 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { property } from 'lit/decorators.js';
+import '../../../core/pv-time-field';
 import { defineElement } from '../../../utils/define';
 import { baseStyles, formStyles } from '../../../styles/shared';
 import type { PersonDraft } from '../../../core/person-draft';
+import type { PlanaVistaData } from '../../../types';
 import { PERSON_CHANGE } from '../../../core/settings-registry';
 import { sleepText } from './person-derive';
 import { choresSettingsStyles } from './settings-styles';
@@ -13,6 +15,8 @@ import { choresSettingsStyles } from './settings-styles';
  */
 export class PvPersonSleep extends LitElement {
   @property({ attribute: false }) draft!: PersonDraft;
+  /** For the household's 12- or 24-hour times. */
+  @property({ attribute: false }) data?: PlanaVistaData;
 
   static styles = [
     baseStyles,
@@ -61,13 +65,13 @@ export class PvPersonSleep extends LitElement {
       <div class="group">
         <label class="row">
           <span class="row-text">Bedtime, weeknights</span>
-          <input class="pv-input" type="time" .value=${d.bedtime?.weeknight ?? ''}
-            @change=${(e: Event) => this._bedtime('weeknight', (e.target as HTMLInputElement).value)} />
+          <pv-time-field  .format=${this.data?.display?.time_format === '24h' ? '24h' : '12h'} .value=${d.bedtime?.weeknight ?? ''}
+            @change=${(e: Event) => this._bedtime('weeknight', (e.target as HTMLInputElement).value)}></pv-time-field>
         </label>
         <label class="row">
           <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
-          <input class="pv-input" type="time" .value=${d.bedtime?.weekend ?? ''} ?disabled=${!d.bedtime}
-            @change=${(e: Event) => this._bedtime('weekend', (e.target as HTMLInputElement).value)} />
+          <pv-time-field  .format=${this.data?.display?.time_format === '24h' ? '24h' : '12h'} .value=${d.bedtime?.weekend ?? ''} ?disabled=${!d.bedtime}
+            @change=${(e: Event) => this._bedtime('weekend', (e.target as HTMLInputElement).value)}></pv-time-field>
         </label>
         <div class="row">
           <span class="row-text">Sleep</span>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts
index 6e369ee..6325f54 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts
@@ -1,5 +1,6 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { property, state } from 'lit/decorators.js';
+import '../../../core/pv-time-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
@@ -77,10 +78,9 @@ export class PvRemindersPage extends LitElement {
         ${evening ? html`
           <label class="row">
             <span class="row-text">At</span>
-            <select class="pv-input pv-select" .value=${evening}
-              @change=${(e: Event) => this._saveEvening((e.target as HTMLSelectElement).value)}>
-              ${eveningChoices(evening, timeFormat).map(c => html`<option value=${c.value} ?selected=${c.value === evening}>${c.label}</option>`)}
-            </select>
+            <pv-time-field .value=${evening} .format=${timeFormat === '24h' ? '24h' : '12h'}
+              .slots=${eveningChoices(evening, timeFormat).map(c => c.value)}
+              @change=${(e: Event) => this._saveEvening((e.target as HTMLSelectElement).value)}></pv-time-field>
           </label>
         ` : nothing}
       </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
index 0d12a0c..0de1b68 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css } from 'lit';
 import { choiceStyles } from '../../../styles/controls';
 import { property, state } from 'lit/decorators.js';
+import '../../../core/pv-time-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
@@ -82,10 +83,9 @@ export class PvRulesPage extends LitElement {
       <div class="group">
         <label class="row">
           <span class="row-text">A chore day starts at</span>
-          <select class="pv-input pv-select" .value=${settings.day_starts}
-            @change=${(e: Event) => this._save({ day_starts: (e.target as HTMLSelectElement).value })}>
-            ${dayStartChoices(timeFormat).map(c => html`<option value=${c.value} ?selected=${settings.day_starts === c.value}>${c.label}</option>`)}
-          </select>
+          <pv-time-field .value=${settings.day_starts} .format=${timeFormat === '24h' ? '24h' : '12h'}
+            .slots=${dayStartChoices(timeFormat).map(c => c.value)}
+            @change=${(e: Event) => this._save({ day_starts: (e.target as HTMLSelectElement).value })}></pv-time-field>
         </label>
         <div class="row">
           <span class="row-text">Weeks start on</span>
```

`custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts b/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
index b9b29b9..70153b7 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-appearance-editor.ts
@@ -1,6 +1,7 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { segmentedStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
+import '../../core/pv-time-field';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { buttonStyles, formStyles } from '../../styles/shared';
@@ -498,12 +499,12 @@ export class PvAppearanceEditor extends LitElement {
           ${rule === 'schedule' && chosen === 'schedule' ? html`
             <div class="times">
               <label>Light from
-                <input class="pv-input" type="time" .value=${lightFrom}
-                  @change=${(e: Event) => this._time('light_from', e)}>
+                <pv-time-field  .format=${this.data.display?.time_format === '24h' ? '24h' : '12h'} .value=${lightFrom}
+                  @change=${(e: Event) => this._time('light_from', e)}></pv-time-field>
               </label>
               <label>Dark from
-                <input class="pv-input" type="time" .value=${darkFrom}
-                  @change=${(e: Event) => this._time('dark_from', e)}>
+                <pv-time-field  .format=${this.data.display?.time_format === '24h' ? '24h' : '12h'} .value=${darkFrom}
+                  @change=${(e: Event) => this._time('dark_from', e)}></pv-time-field>
               </label>
             </div>
           ` : nothing}
```

`custom_components/planavista/frontend/src/styles/pickers.ts` (new):

```ts
import { css } from 'lit';

/**
 * The one month grid and the one time list (milestone 8, spec 3.11): the
 * event editor's pickers, shared with the date and time fields. The field
 * button matches the event editor's date and time buttons.
 */
export const pickerStyles = css`
  .picker-field {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    min-height: 48px;
    padding: 0 14px;
    box-sizing: border-box;
    border: 1px solid var(--pv-border, #E7E7E3);
    border-radius: var(--pv-radius-sm, 8px);
    background: var(--pv-card-bg, #FFFFFF);
    color: var(--pv-text, #1A1B1E);
    font: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-field:hover:not(:disabled) {
    border-color: var(--pv-text-muted, #8E949C);
  }

  .picker-field:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .picker-field ha-icon {
    --mdc-icon-size: 20px;
    color: var(--pv-text-muted, #8E949C);
  }

  .picker-field .placeholder {
    color: var(--pv-text-muted, #8E949C);
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .picker-month-label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--pv-text);
  }

  .picker-nav {
    display: flex;
    gap: 2px;
  }

  .picker-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--pv-text-secondary);
    cursor: pointer;
    font-family: inherit;
    transition: background 150ms;
  }

  .picker-nav-btn:hover {
    background: var(--pv-event-hover, rgba(0,0,0,0.05));
  }

  .picker-nav-btn ha-icon {
    --mdc-icon-size: 18px;
  }

  .picker-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 4px;
  }

  .picker-weekday {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--pv-text-muted);
    padding: 4px 0;
  }

  .picker-days {
    display: grid;
    grid-template-columns: repeat(7, 48px);
  }

  /* A 48 px target with the day drawn smaller inside (spec 11.8). */
  .picker-day {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--pv-text);
    font-family: var(--pv-font-heading, inherit);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }

  .picker-day span {
    display: grid;
    place-items: center;
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition: background 150ms;
  }

  .picker-day:hover span {
    background: var(--pv-event-hover, rgba(0,0,0,0.05));
  }

  .picker-day:focus-visible {
    outline: none;
  }

  .picker-day:focus-visible span {
    outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    outline-offset: 1px;
  }

  .picker-day.other-month {
    color: var(--pv-text-muted);
    opacity: 0.4;
  }

  .picker-day.today span {
    border: 2px solid var(--pv-accent);
    font-weight: 700;
  }

  .picker-day.selected span {
    background: var(--pv-accent);
    color: var(--pv-accent-text, #fff);
    font-weight: 700;
  }

  .picker-day:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .time-slot {
    display: block;
    width: 100%;
    min-height: 48px;
    padding: 0 16px;
    border: none;
    background: transparent;
    text-align: left;
    font-family: inherit;
    font-size: 0.9375rem;
    font-variant-numeric: tabular-nums;
    color: var(--pv-text);
    cursor: pointer;
    transition: background 120ms ease;
  }

  .time-slot:hover {
    background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
  }

  .time-slot.selected {
    background: var(--pv-accent);
    color: var(--pv-accent-text, #fff);
    font-weight: 600;
  }
`;
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1071 passed`; the task's own files `6 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** The chore editor's dates, the repeat picker, bedtimes, the evening check, and quick add's date open the event editor's grid and list; no native date or time inputs remain.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): dates and times are picked one way everywhere

The event editor's month grid and time list become shared (one render
and one stylesheet), and every other date and time uses them through two
inline fields: a chore's date and due time, the repeat picker's start and
end, quick add's date, a new due date in a chore's options, time away,
bedtimes, Appearance's light and dark times, the chore day's start, and
the evening check. Native date and time inputs and the time dropdowns
go. Dates read one way, "Tue, October 20, 2026", in the editor and every
field.
```

---

### Task 7: One toolbar for both Week views, and Today goes quiet on today

Spec 3.11 (the two Week views, en dashes).

**Files:**
- Create: `custom_components/planavista/frontend/test/toolbars.test.ts`
- Modify: `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`, `custom_components/planavista/frontend/src/modules/calendar/view-words.ts`, `custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`, `custom_components/planavista/frontend/src/modules/chores/week-derive.ts`, `custom_components/planavista/frontend/src/utils/date-utils.ts`, `custom_components/planavista/frontend/test/week-derive.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/toolbars.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { weekRangeLabel } from '../src/utils/date-utils';
import { showsToday } from '../src/modules/calendar/view-words';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('one toolbar grammar for both Week views (milestone 8, spec 3.11)', () => {
  it('names a week by its range, the same way in both', () => {
    expect(weekRangeLabel(new Date(2026, 9, 12), new Date(2026, 9, 18))).toBe('October 12 – 18');
    expect(weekRangeLabel(new Date(2026, 8, 28), new Date(2026, 9, 4))).toBe('September 28 – October 4');
  });

  it('knows when a view already shows today, so Today goes quiet', () => {
    const today = new Date(2026, 9, 12, 15, 0);
    expect(showsToday('day', new Date(2026, 9, 12, 9), today, 'sunday')).toBe(true);
    expect(showsToday('day', new Date(2026, 9, 13), today, 'sunday')).toBe(false);
    expect(showsToday('week', new Date(2026, 9, 17), today, 'sunday')).toBe(true);
    expect(showsToday('week', new Date(2026, 9, 18), today, 'sunday')).toBe(false);
    expect(showsToday('month', new Date(2026, 9, 31), today, 'sunday')).toBe(true);
    expect(showsToday('month', new Date(2026, 10, 1), today, 'sunday')).toBe(false);
    expect(showsToday('agenda', new Date(2026, 9, 12), today, 'sunday')).toBe(true);
    expect(showsToday('agenda', new Date(2026, 9, 11), today, 'sunday')).toBe(false);
  });

  it('chores Week has round arrows and a This week that is always there, quiet on this week', () => {
    const week = read('modules/chores/pv-chores-week.ts');
    expect(week).toMatch(/class="nav"[^>]*aria-label="Last week"[\s\S]{0,200}mdi:chevron-left/);
    expect(week).toMatch(/class="pv-btn pv-btn-secondary this-week" type="button" \?disabled=\$\{this\.current\}/);
    expect(read('modules/calendar/calendar-module.ts')).toMatch(/class="pvc-today-btn" type="button" \?disabled=\$\{onToday\}/);
  });

  it('Month\'s title is left aligned like Week\'s', () => {
    const rule = /\.month-name \{([^}]*)\}/.exec(read('modules/calendar/components/view-month.ts'))?.[1] ?? '';
    expect(rule).toMatch(/text-align:\s*left/);
  });

  it('time ranges use an en dash everywhere, My day included', () => {
    expect(read('modules/chores/my-day-derive.ts')).not.toMatch(/\} to \$\{/);
  });
});
```

`custom_components/planavista/frontend/test/week-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/week-derive.test.ts b/custom_components/planavista/frontend/test/week-derive.test.ts
index 54605a5..e437a3b 100644
--- a/custom_components/planavista/frontend/test/week-derive.test.ts
+++ b/custom_components/planavista/frontend/test/week-derive.test.ts
@@ -62,7 +62,7 @@ describe('weekHighlights', () => {
 
 describe('the rest of the Week view', () => {
   it('heads the week and its days', () => {
-    expect(weekTitle(WEEK)).toBe('Week of October 12');
+    expect(weekTitle(WEEK)).toBe('October 12 – 18');
     expect(weekDays(WEEK).map(d => `${d.label}${d.today ? '*' : ''}`)).toEqual(['Mon', 'Tue*', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
   });
 
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/toolbars.test.ts test/week-derive.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index e33fab6..2236a57 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -25,7 +25,7 @@ import { parentAccess } from '../../core/access';
 import { OPEN_SETTINGS } from '../../core/page-host';
 import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
 import { calendarSkeleton, skeletonStyles } from './components/calendar-skeleton';
-import { navLabels } from './view-words';
+import { navLabels , showsToday } from './view-words';
 import { ViewPlace, viewChange, viewMotion } from '../../core/view-motion';
 import { motionOf, supportsLinearEasing } from '../../core/motion';
 
@@ -361,7 +361,12 @@ export class PvCalendarModule extends LitElement {
         -webkit-tap-highlight-color: transparent;
       }
 
-      .pvc-today-btn:hover {
+      .pvc-today-btn:disabled {
+        opacity: 0.45;
+        cursor: default;
+      }
+
+      .pvc-today-btn:hover:not(:disabled) {
         background: var(--pv-accent);
         color: var(--pv-accent-text);
         border-color: var(--pv-accent);
@@ -799,6 +804,7 @@ export class PvCalendarModule extends LitElement {
   private _renderToolbar(calendars: CalendarConfig[]) {
     const hiddenCount = calendars.filter(c => this._pv.store.hiddenCalendars.has(c.entity_id)).length;
     const arrows = navLabels(this._pv.store.currentView);
+    const onToday = showsToday(this._pv.store.currentView, this._pv.store.currentDate, new Date(), this.display?.first_day || 'sunday');
 
     return html`
       <div class="pvc-toolbar">
@@ -888,7 +894,7 @@ export class PvCalendarModule extends LitElement {
               @click=${() => this._navigate('prev')}>
               <ha-icon icon="mdi:chevron-left"></ha-icon>
             </button>
-            <button class="pvc-today-btn" type="button" @click=${() => this._navigate('today')}>
+            <button class="pvc-today-btn" type="button" ?disabled=${onToday} @click=${() => this._navigate('today')}>
               Today
             </button>
             <button class="pvc-nav-btn" type="button" aria-label=${arrows.next} title=${arrows.next}
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
index 67cf298..a1cf0c2 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-month.ts
@@ -57,8 +57,8 @@ export class PVViewMonth extends LitElement {
         font-weight: 800;
         font-variant-numeric: tabular-nums;
         color: var(--pv-text);
-        padding: 0.5rem 0.75rem;
-        text-align: center;
+        padding: 0.75rem 1rem 0.5rem;
+        text-align: left;
         flex-shrink: 0;
       }
 
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
index 03ad96f..9b9c5cc 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-week.ts
@@ -5,7 +5,7 @@ import { HomeAssistant } from 'custom-card-helpers';
 import { CalendarEvent, CalendarConfig } from '../../../types';
 import { baseStyles, animationStyles } from '../../../styles/shared';
 import type { Layout } from '../../../core/layout';
-import { getStartOfWeek, isToday, getDateKey } from '../../../utils/date-utils';
+import { getStartOfWeek, isToday, getDateKey , weekRangeLabel } from '../../../utils/date-utils';
 import {
   compareEventsForDisplay,
   getEventsForDateRange,
@@ -236,12 +236,7 @@ export class PVViewWeek extends LitElement {
   private _getWeekLabel(days: Date[]): string {
     const first = days[0];
     const last = days[6];
-    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
-
-    if (first.getMonth() === last.getMonth()) {
-      return `${first.toLocaleDateString('en-US', { month: 'long' })} ${first.getDate()} – ${last.getDate()}`;
-    }
-    return `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}`;
+    return weekRangeLabel(first, last);
   }
 
   render() {
```

`custom_components/planavista/frontend/src/modules/calendar/view-words.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/view-words.ts b/custom_components/planavista/frontend/src/modules/calendar/view-words.ts
index 379ba64..8433d97 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/view-words.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/view-words.ts
@@ -1,5 +1,5 @@
 import type { ViewType } from '../../types';
-import { calendarDaysBetween } from '../../utils/date-utils';
+import { calendarDaysBetween, getDateKey, getStartOfWeek } from '../../utils/date-utils';
 import { longDate } from './event-words';
 
 const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
@@ -48,3 +48,10 @@ export function agendaNote(day: Date, today: Date, first: boolean): string {
   const month = MONTHS[day.getMonth()];
   return day.getFullYear() === today.getFullYear() ? month : `${month} ${day.getFullYear()}`;
 }
+
+/** Whether the view already shows today, so Today has nothing to do and goes quiet (milestone 8). Agenda starts on its day. */
+export function showsToday(view: ViewType, shown: Date, today: Date, firstDay: 'monday' | 'sunday'): boolean {
+  if (view === 'week') return getDateKey(getStartOfWeek(shown, firstDay)) === getDateKey(getStartOfWeek(today, firstDay));
+  if (view === 'month') return shown.getFullYear() === today.getFullYear() && shown.getMonth() === today.getMonth();
+  return getDateKey(shown) === getDateKey(today);
+}
```

`custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts b/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
index 15150b4..c0b4c42 100644
--- a/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
@@ -28,7 +28,7 @@ export interface DayContext {
 }
 
 function range(event: DayEvent, format: '12h' | '24h'): string {
-  return `${clockTime(event.start, format, format === '12h')} to ${clockTime(event.end, format, format === '12h')}`;
+  return `${clockTime(event.start, format, format === '12h')} – ${clockTime(event.end, format, format === '12h')}`;
 }
 
 /** The person's bedtime tonight (spec 7.2: weeknights, and Friday and Saturday nights). */
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
index 24773ac..37cd176 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts
@@ -66,26 +66,37 @@ export class PvChoresWeek extends LitElement {
         margin-bottom: 10px;
       }
 
+      /* The calendar's toolbar grammar: the range on the left, then round arrows around This week. */
       .top h2 {
         margin: 0 6px;
         font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
-        font-size: 1.375rem;
+        font-size: 1.125rem;
         font-weight: 800;
+        font-variant-numeric: tabular-nums;
+      }
+
+      .week-nav {
+        display: flex;
+        align-items: center;
+        gap: 4px;
+        margin-left: auto;
       }
 
       .nav {
+        display: inline-flex;
+        align-items: center;
+        justify-content: center;
         width: 48px;
         height: 48px;
-        border-radius: 12px;
-        border: 1px solid var(--pv-border, #E7E7E3);
-        background: var(--pv-card-bg, #FFFFFF);
-        color: var(--pv-text, #1A1B1E);
-        font-size: 1.25rem;
+        border: none;
+        border-radius: 50%;
+        background: transparent;
+        color: var(--pv-text-secondary, #5F6670);
         cursor: pointer;
       }
 
-      .this-week {
-        margin-left: auto;
+      .nav:hover {
+        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
       }
 
       .card {
@@ -315,10 +326,16 @@ export class PvChoresWeek extends LitElement {
     return html`
       <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
         <div class="top">
-          <button class="nav" type="button" aria-label="Last week" @click=${() => this._nav(-1)}>‹</button>
           <h2>${view ? weekTitle(view) : 'This week'}</h2>
-          <button class="nav" type="button" aria-label="Next week" @click=${() => this._nav(1)}>›</button>
-          ${this.current ? nothing : html`<button class="pv-btn pv-btn-secondary this-week" type="button" @click=${() => this._nav(0)}>This week</button>`}
+          <div class="week-nav">
+            <button class="nav" type="button" aria-label="Last week" title="Last week" @click=${() => this._nav(-1)}>
+              <ha-icon icon="mdi:chevron-left"></ha-icon>
+            </button>
+            <button class="pv-btn pv-btn-secondary this-week" type="button" ?disabled=${this.current} @click=${() => this._nav(0)}>This week</button>
+            <button class="nav" type="button" aria-label="Next week" title="Next week" @click=${() => this._nav(1)}>
+              <ha-icon icon="mdi:chevron-right"></ha-icon>
+            </button>
+          </div>
         </div>
         ${this.failed ? html`
           <div class="state"><div class="art" aria-hidden="true">📡</div><h2>Couldn't load this week</h2>
```

`custom_components/planavista/frontend/src/modules/chores/week-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/week-derive.ts b/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
index ec3be10..72b31f2 100644
--- a/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
@@ -1,4 +1,5 @@
 import type { Member } from '../../core/household';
+import { weekRangeLabel } from '../../utils/date-utils';
 import { dayDate, minutesText } from '../../core/status-map';
 import type { PastItem, WeekDay, WeekView, WeeklyEntry } from './chores-types';
 import { dayWords, addDays } from './options-derive';
@@ -28,10 +29,10 @@ export interface WeekRow {
   weekly: { text: string; badge: string | null; badgeTone: 'neutral' | 'act' | 'time'; progress: number } | null;
 }
 
-/** "Week of October 12". */
+/** "October 12 – 18": the week by its range, as the calendar's Week names it. */
 export function weekTitle(view: Pick<WeekView, 'week'>): string {
   const start = dayDate(view.week.start);
-  return `Week of ${MONTHS[start.getMonth()]} ${start.getDate()}`;
+  return weekRangeLabel(start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
 }
 
 /** The column heads: "Mon", "Tue" (with "Today" under today's). */
```

`custom_components/planavista/frontend/src/utils/date-utils.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/utils/date-utils.ts b/custom_components/planavista/frontend/src/utils/date-utils.ts
index bb7ab65..4cf9597 100644
--- a/custom_components/planavista/frontend/src/utils/date-utils.ts
+++ b/custom_components/planavista/frontend/src/utils/date-utils.ts
@@ -224,3 +224,10 @@ export function navigateDate(date: Date, view: ViewType, direction: 'prev' | 'ne
   }
   return d;
 }
+
+/** A week by its range, as both Week views name it: "October 12 – 18", "September 28 – October 4" (milestone 8). */
+export function weekRangeLabel(first: Date, last: Date): string {
+  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'long' });
+  if (first.getMonth() === last.getMonth()) return `${month(first)} ${first.getDate()} – ${last.getDate()}`;
+  return `${month(first)} ${first.getDate()} – ${month(last)} ${last.getDate()}`;
+}
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1076 passed`; the task's own files `11 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Both Week views read "October 12 – 18" with round arrows; Today and This week dim when already shown; Month's title is left aligned.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one toolbar for both Week views, and Today goes quiet on today

Chores' Week takes the calendar's toolbar: the week by its range on the
left ("October 11 – 17", named the same way in both), then round arrows
around a This week that is always there. Today and This week go quiet
when the view already shows today. Month's title is left aligned like
Week's, and My day's times use the en dash like the calendar's.
```

---

### Task 8: Lock after no touches, Parent mode ends after, and easy PINs turned away

Spec 3.8, D3, D4, D5.

**Files:**
- Create: `custom_components/planavista/frontend/test/pins.test.ts`, `tests/fixtures/easy_pins.json`
- Modify: `custom_components/planavista/frontend/src/core/household-client.ts`, `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/core/keypad.ts`, `custom_components/planavista/frontend/src/core/module-registry.ts`, `custom_components/planavista/frontend/src/core/pv-session-ring.ts`, `custom_components/planavista/frontend/src/core/session.ts`, `custom_components/planavista/frontend/src/core/ws-api.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-service.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/pv-parent-strip.ts`, `custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts`, `custom_components/planavista/frontend/src/shell/session-controller.ts`, `custom_components/planavista/frontend/src/shell/settings/pins-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/test/household-client.test.ts`, `custom_components/planavista/frontend/test/session.test.ts`, `custom_components/planavista/household/security.py`, `custom_components/planavista/household/store.py`, `custom_components/planavista/household/websocket.py`, `tests/test_household_security.py`, `tests/test_household_store.py`, `tests/test_household_websocket.py`, `tests/test_pins.py`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/household-client.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/household-client.test.ts b/custom_components/planavista/frontend/test/household-client.test.ts
index faa75a4..0a91df0 100644
--- a/custom_components/planavista/frontend/test/household-client.test.ts
+++ b/custom_components/planavista/frontend/test/household-client.test.ts
@@ -192,6 +192,25 @@ describe('HouseholdApi', () => {
     expect(ended).toEqual(['abc']);
   });
 
+  it('tells the card when a command kept its session open (the backend counts it as a touch)', async () => {
+    const refusal = { code: 'invalid_format', message: 'x' };
+    let fail = false;
+    const ws = { callWS: <T>(_message: Record<string, unknown>) => (fail ? Promise.reject(refusal) : Promise.resolve({} as T)) as Promise<T> };
+    const used: string[] = [];
+    let token: string | null = 'abc';
+    const api = new HouseholdApi(ws, () => token, undefined, used.push.bind(used));
+    await api.saveSecurity({ session_idle_seconds: 30 });
+    expect(used).toEqual(['abc']);
+    // Unlock and lock don't carry the session; a refused command proves nothing.
+    await api.unlock('blair', '4826');
+    fail = true;
+    await expect(api.reorder(['dana'])).rejects.toBe(refusal);
+    token = null;
+    fail = false;
+    await api.reorder(['dana']);
+    expect(used).toEqual(['abc']);
+  });
+
   it('reads the code of a failed command', () => {
     expect(errorCode({ code: 'parent_mode_required', message: 'x' })).toBe('parent_mode_required');
     expect(errorCode(new Error('boom'))).toBe('unknown');
```

`custom_components/planavista/frontend/test/pins.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EASY_PIN_MESSAGE, easyPin, pinHint } from '../src/core/keypad';

/** The backend's table (tests/fixtures/easy_pins.json): the card turns the same PINs away before asking twice. */
const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/easy_pins.json', import.meta.url), 'utf-8')) as {
  easy: string[];
  fine: string[];
};

describe('easy PINs (milestone 8, D4)', () => {
  it.each(TABLE.easy)('%s is easy to guess', pin => {
    expect(easyPin(pin)).toBe(true);
  });

  it.each(TABLE.fine)('%s is fine', pin => {
    expect(easyPin(pin)).toBe(false);
  });

  it('says why without repeating any PIN', () => {
    expect(EASY_PIN_MESSAGE).toBe('That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another.');
    expect(EASY_PIN_MESSAGE).not.toMatch(/\d/);
  });

  it('hints parents toward 6 digits', () => {
    expect(pinHint(true)).toBe('4 to 6 digits. 6 is much harder to guess.');
    expect(pinHint(false)).toBe('4 to 6 digits.');
  });
});
```

`custom_components/planavista/frontend/test/session.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/session.test.ts b/custom_components/planavista/frontend/test/session.test.ts
index fe21c65..caca6cd 100644
--- a/custom_components/planavista/frontend/test/session.test.ts
+++ b/custom_components/planavista/frontend/test/session.test.ts
@@ -1,12 +1,14 @@
 import { describe, expect, it } from 'vitest';
-import { SESSION_IDLE_MS, TOUCH_EVERY_MS, expired, noteActivity, remainingMs, startSession } from '../src/core/session';
+import {
+  SESSION_IDLE_MS, TOUCH_EVERY_MS, expired, noteActivity, remainingMs, sessionWords, startSession, touchEveryMs, usedAt, withLimits,
+} from '../src/core/session';
 
 const UNLOCKED = { session: 'token', member_id: 'blair', parent: true };
 
 describe('session', () => {
   it('starts with two minutes left', () => {
     const session = startSession(UNLOCKED, 1000);
-    expect(session).toEqual({ token: 'token', memberId: 'blair', parent: true, lastTouch: 1000 });
+    expect(session).toEqual({ token: 'token', memberId: 'blair', parent: true, lastTouch: 1000, startedAt: 1000, idleMs: SESSION_IDLE_MS, capAt: 601_000 });
     expect(remainingMs(session, 1000)).toBe(SESSION_IDLE_MS);
   });
 
@@ -26,4 +28,46 @@ describe('session', () => {
     expect(later.touch).toBe(true);
     expect(remainingMs(later.session, TOUCH_EVERY_MS)).toBe(SESSION_IDLE_MS);
   });
+
+  it('lasts as long as the household chose (Lock after no touches)', () => {
+    const session = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
+    expect(remainingMs(session, 0)).toBe(30_000);
+    expect(expired(session, 30_000)).toBe(true);
+  });
+
+  it('never outlasts Parent mode ends after, however often someone touches', () => {
+    let session = startSession({ ...UNLOCKED, idle_seconds: 120, cap_in: 300 }, 0);
+    for (let now = 30_000; now <= 270_000; now += 30_000) session = noteActivity(session, now).session;
+    expect(remainingMs(session, 270_000)).toBe(30_000);
+    expect(expired(session, 300_000)).toBe(true);
+  });
+
+  it('tells the backend often enough for a short quiet time', () => {
+    const short = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
+    expect(touchEveryMs(short)).toBe(7_500);
+    expect(noteActivity(short, 7_500).touch).toBe(true);
+    expect(touchEveryMs(startSession({ ...UNLOCKED, idle_seconds: 300, cap_in: 900 }, 0))).toBe(TOUCH_EVERY_MS);
+  });
+
+  it("names a parent's session and a child's window the same way, with their own words", () => {
+    expect(sessionWords(true)).toEqual({ mode: 'parent mode', ends: 'Parent mode ends in' });
+    expect(sessionWords(false)).toEqual({ mode: 'unlocked', ends: 'Locks in' });
+  });
+
+  it('follows new limits saved while it is open, as the backend does', () => {
+    const session = startSession({ ...UNLOCKED, idle_seconds: 120, cap_in: 600 }, 0);
+    const shorter = withLimits(session, 30, 5);
+    expect(shorter.idleMs).toBe(30_000);
+    expect(shorter.capAt).toBe(300_000);
+    expect(remainingMs(shorter, 0)).toBe(30_000);
+    expect(withLimits(session, 120, 10)).toBe(session);
+    expect(withLimits(session, undefined, undefined)).toBe(session);
+  });
+
+  it('a command the backend accepted with the session counts as a touch', () => {
+    const session = startSession({ ...UNLOCKED, idle_seconds: 30, cap_in: 300 }, 0);
+    expect(remainingMs(usedAt(session, 20_000), 20_000)).toBe(30_000);
+    expect(usedAt(session, 280_000).lastTouch).toBe(280_000);
+    expect(remainingMs(usedAt(session, 280_000), 280_000)).toBe(20_000);
+  });
 });
```

`tests/fixtures/easy_pins.json` (new):

```json
{
  "_doc": "PINs turned away when one is chosen (milestone 8, D4): all one digit, a straight run up or down, or the keypad's middle column. Shared by tests/test_household_security.py and the card's test/pins.test.ts.",
  "easy": ["0000", "1111", "9999", "777777", "1234", "0123", "3456", "6789", "12345", "123456", "4321", "9876", "98765", "987654", "2580", "0852"],
  "fine": ["2468", "1357", "4826", "482613", "8642", "2024", "1470", "8901", "1212", "2581", "1235"]
}
```

`tests/test_household_security.py`:

```diff
diff --git a/tests/test_household_security.py b/tests/test_household_security.py
index 482c407..d904954 100644
--- a/tests/test_household_security.py
+++ b/tests/test_household_security.py
@@ -2,6 +2,8 @@
 from __future__ import annotations
 
 from datetime import UTC, datetime, timedelta
+import json
+from pathlib import Path
 
 import pytest
 
@@ -13,6 +15,7 @@ from custom_components.planavista.household.security import (
     SessionManager,
     after_failure,
     after_success,
+    easy_pin,
     hash_pin,
     pause_remaining,
     tries_left,
@@ -104,7 +107,7 @@ def test_touch_keeps_a_session_alive() -> None:
     session = sessions.start("blair", parent=True, connection=screen, now=0.0)
     for now in (100.0, 200.0, 300.0):
         assert sessions.get(session.token, screen, now, touch=True) is session
-    assert session.expires_in(300.0) == SESSION_IDLE_SECONDS
+    assert sessions.expires_in(session, 300.0) == SESSION_IDLE_SECONDS
     assert sessions.get(session.token, screen, 300.0 + SESSION_IDLE_SECONDS + 1) is None
 
 
@@ -144,3 +147,46 @@ def test_end_parent_mode_only_ends_parent_sessions() -> None:
     sessions.end_parent_mode("blair")
     assert sessions.get(parent.token, screen, 1.0) is None
     assert sessions.get(own.token, screen, 1.0) is own
+
+
+EASY = json.loads((Path(__file__).parent / "fixtures" / "easy_pins.json").read_text(encoding="utf-8"))
+
+
+@pytest.mark.parametrize("pin", EASY["easy"])
+def test_easy_pins_are_turned_away_when_chosen(pin: str) -> None:
+    assert easy_pin(pin)
+
+
+@pytest.mark.parametrize("pin", EASY["fine"])
+def test_other_pins_are_fine(pin: str) -> None:
+    assert not easy_pin(pin)
+
+
+def test_the_household_sets_how_long_a_quiet_session_lasts() -> None:
+    sessions = SessionManager(lambda: (30, 600))
+    screen = object()
+    session = sessions.start("blair", parent=True, connection=screen, now=0.0)
+    assert sessions.get(session.token, screen, 29.0) is session
+    assert sessions.get(session.token, screen, 30.0) is None
+
+
+def test_parent_mode_ends_at_its_cap_however_much_the_screen_is_touched() -> None:
+    sessions = SessionManager(lambda: (120, 300))
+    screen = object()
+    session = sessions.start("blair", parent=True, connection=screen, now=0.0)
+    for now in (60.0, 120.0, 180.0, 240.0):
+        assert sessions.get(session.token, screen, now, touch=True) is session
+    assert sessions.expires_in(session, 280.0) == 20.0
+    assert sessions.get(session.token, screen, 300.0, touch=True) is None
+
+
+def test_a_childs_pin_window_has_the_same_limits() -> None:
+    sessions = SessionManager(lambda: (60, 300))
+    screen = object()
+    window = sessions.start("casey", parent=False, connection=screen, now=0.0)
+    assert sessions.get(window.token, screen, 59.0, touch=True) is window
+    assert sessions.get(window.token, screen, 119.0) is None
+    again = sessions.start("casey", parent=False, connection=screen, now=200.0)
+    for now in (250.0, 300.0, 350.0, 400.0, 450.0):
+        assert sessions.get(again.token, screen, now, touch=True) is again
+    assert sessions.get(again.token, screen, 500.0, touch=True) is None
```

`tests/test_household_store.py`:

```diff
diff --git a/tests/test_household_store.py b/tests/test_household_store.py
index 1738ba3..41db297 100644
--- a/tests/test_household_store.py
+++ b/tests/test_household_store.py
@@ -50,7 +50,13 @@ def test_normalize_fills_gaps_and_keeps_unknown_fields() -> None:
         "later": True,
         "shared_users": [],
         "shuffle_keypad": False,
+        "session_idle_seconds": 120,
+        "parent_mode_minutes": 10,
     }
+    assert normalize({"security": {"session_idle_seconds": 45, "parent_mode_minutes": 15}})["security"][
+        "session_idle_seconds"
+    ] == 120
+    assert normalize({"security": {"parent_mode_minutes": 15}})["security"]["parent_mode_minutes"] == 15
     assert doc["chores_hint"] == "x"
     assert doc["setup"] == {"completed": False, "step": None}
     assert normalize(None) == default_document()
```

`tests/test_household_websocket.py`:

```diff
diff --git a/tests/test_household_websocket.py b/tests/test_household_websocket.py
index 5bcbd0b..2f33704 100644
--- a/tests/test_household_websocket.py
+++ b/tests/test_household_websocket.py
@@ -54,7 +54,9 @@ async def test_subscribe_describes_the_account(
     assert view["account"]["parent_level"] is parent_level
     assert view["available"] is True
     assert [m["id"] for m in view["members"]] == ["alex", "blair", "casey", "dana"]
-    assert view["security"] == {"shuffle_keypad": False, "shared_screens": 1}
+    assert view["security"] == {
+        "shuffle_keypad": False, "shared_screens": 1, "session_idle_seconds": 120, "parent_mode_minutes": 10,
+    }
 
 
 async def test_subscribe_never_sends_pin_data(
@@ -282,3 +284,18 @@ async def test_commands_before_planavista_is_set_up(
     client = await hass_ws_client(hass)
     reply = await ws_command(client, {"type": "planavista/household/subscribe"})
     assert reply["error"]["code"] == "not_loaded"
+
+
+async def test_a_parent_sets_how_long_sessions_last(
+    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, Any], household: Any
+) -> None:
+    client = await ws_client_for(hass, hass_ws_client, accounts["admin"])
+    reply = await ws_command(
+        client, {"type": "planavista/household/settings/save", "session_idle_seconds": 300, "parent_mode_minutes": 15}
+    )
+    assert reply["success"]
+    assert household.data["security"]["session_idle_seconds"] == 300
+    assert household.data["security"]["parent_mode_minutes"] == 15
+    for bad in ({"session_idle_seconds": 45}, {"session_idle_seconds": 0}, {"parent_mode_minutes": 0}, {"parent_mode_minutes": 60}):
+        refused = await ws_command(client, {"type": "planavista/household/settings/save", **bad})
+        assert not refused["success"], bad
```

`tests/test_pins.py`:

```diff
diff --git a/tests/test_pins.py b/tests/test_pins.py
index 5a59800..c272d81 100644
--- a/tests/test_pins.py
+++ b/tests/test_pins.py
@@ -295,3 +295,43 @@ async def test_a_pin_never_leaks(
     for where, text in haystacks.items():
         for secret in (PIN, "135791", "48a613"):
             assert secret not in text, f"{secret} found in {where}"
+
+
+@pytest.mark.parametrize("pin", ["1234", "0000", "987654", "2580"])
+async def test_an_easy_pin_is_turned_away_when_chosen(
+    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, pin: str
+) -> None:
+    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
+    reply = await ws_command(alex, {"type": "planavista/pin/set", "member_id": "dana", "pin": pin})
+    assert reply["error"]["code"] == "easy_pin"
+    assert pin not in json.dumps(reply)
+    assert "dana" not in household.pins
+
+
+async def test_an_easy_pin_set_before_still_unlocks(hass: HomeAssistant, household: Any, kitchen: Any) -> None:
+    await set_pin(hass, household, "alex", "1111")
+    assert (await _unlock(kitchen, "alex", "1111"))["ok"] is True
+
+
+async def test_unlocking_says_how_long_the_session_can_last(
+    hass: HomeAssistant, household: Any, kitchen: Any
+) -> None:
+    household.data["security"]["session_idle_seconds"] = 60
+    household.data["security"]["parent_mode_minutes"] = 5
+    result = await _unlock(kitchen, "blair", PIN)
+    assert (result["expires_in"], result["idle_seconds"], result["cap_in"]) == (60, 60, 300)
+
+
+async def test_parent_mode_ends_at_its_cap(
+    hass: HomeAssistant, household: Any, kitchen: Any, monkeypatch: pytest.MonkeyPatch
+) -> None:
+    clock = [1000.0]
+    monkeypatch.setattr(household_ws, "_monotonic", lambda: clock[0])
+    household.data["security"]["parent_mode_minutes"] = 5
+    token = (await _unlock(kitchen, "blair", PIN))["session"]
+    for _ in range(4):
+        clock[0] += 60
+        assert (await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token}))["success"]
+    clock[0] += 61
+    reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
+    assert reply["error"]["code"] == "session_ended"
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/household-client.test.ts test/pins.test.ts test/session.test.ts` and `bash scripts/test-backend.sh -q tests/test_household_security.py tests/test_household_store.py tests/test_household_websocket.py tests/test_pins.py` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/household-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household-client.ts b/custom_components/planavista/frontend/src/core/household-client.ts
index 4e10faf..e96a1f6 100644
--- a/custom_components/planavista/frontend/src/core/household-client.ts
+++ b/custom_components/planavista/frontend/src/core/household-client.ts
@@ -26,6 +26,10 @@ export interface UnlockResult {
   member_id?: string;
   parent?: boolean;
   expires_in?: number;
+  /** Lock after no touches, in seconds (milestone 8, D3). */
+  idle_seconds?: number;
+  /** Seconds until Parent mode ends after, however busy. */
+  cap_in?: number;
   reason?: 'no_pin' | 'wrong_pin' | 'paused';
   tries_left?: number;
   retry_after?: number | null;
@@ -56,7 +60,7 @@ export class HouseholdApi extends WsApi {
     return this.call('planavista/household/shared_screen', { shared });
   }
 
-  saveSecurity(settings: { shuffle_keypad: boolean }): Promise<void> {
+  saveSecurity(settings: { shuffle_keypad?: boolean; session_idle_seconds?: number; parent_mode_minutes?: number }): Promise<void> {
     return this.call('planavista/household/settings/save', settings);
   }
 
```

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index b08d8ac..eb16a16 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -42,7 +42,14 @@ export interface HouseholdView {
   available: boolean;
   members: Member[];
   account: AccountView;
-  security: { shuffle_keypad: boolean; shared_screens: number };
+  security: {
+    shuffle_keypad: boolean;
+    shared_screens: number;
+    /** Lock after no touches (30, 60, 120, or 300); missing from older backends. */
+    session_idle_seconds?: number;
+    /** Parent mode ends after (5, 10, 15, or 30). */
+    parent_mode_minutes?: number;
+  };
   modules: Record<string, unknown>;
   /** Where setup stands; `start` is how the household started (restore, plan, common, empty, calendar). */
   setup: { completed: boolean; step: string | null; start?: string | null };
```

`custom_components/planavista/frontend/src/core/keypad.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/keypad.ts b/custom_components/planavista/frontend/src/core/keypad.ts
index b5b0d83..9c4ff75 100644
--- a/custom_components/planavista/frontend/src/core/keypad.ts
+++ b/custom_components/planavista/frontend/src/core/keypad.ts
@@ -42,3 +42,19 @@ export function isComplete(entry: PinEntry): boolean {
 export function canFinishChoosing(entry: PinEntry): boolean {
   return entry.digits.length >= MIN_PIN;
 }
+
+/** Easy to guess, so turned away when chosen (milestone 8, D4; the backend's rule): all one digit, a straight run, or the keypad's middle column. */
+export function easyPin(pin: string): boolean {
+  if (new Set(pin).size === 1) return true;
+  const steps = new Set([...pin].slice(1).map((digit, i) => Number(digit) - Number(pin[i])));
+  if (steps.size === 1 && (steps.has(1) || steps.has(-1))) return true;
+  return pin === '2580' || pin === '0852';
+}
+
+/** The backend's words for an easy PIN, so either one can say it. */
+export const EASY_PIN_MESSAGE = 'That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another.';
+
+/** Choosing a PIN: parents are nudged toward 6 digits. */
+export function pinHint(parent: boolean): string {
+  return parent ? '4 to 6 digits. 6 is much harder to guess.' : '4 to 6 digits.';
+}
```

`custom_components/planavista/frontend/src/core/module-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/module-registry.ts b/custom_components/planavista/frontend/src/core/module-registry.ts
index f5e1565..ac68b2d 100644
--- a/custom_components/planavista/frontend/src/core/module-registry.ts
+++ b/custom_components/planavista/frontend/src/core/module-registry.ts
@@ -67,6 +67,8 @@ export interface ServiceHost extends ReactiveControllerHost, HTMLElement {
   readonly planavistaData: PlanaVistaData | null;
   /** A command was refused although it carried this session: the backend already ended it. */
   sessionEnded(token: string): void;
+  /** The backend accepted a command made with this session (it counts as a touch there). */
+  sessionUsed?(token: string): void;
   /** The service has news: the card redraws the header, the bar, and the modules. */
   serviceChanged(): void;
 }
```

`custom_components/planavista/frontend/src/core/pv-session-ring.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pv-session-ring.ts b/custom_components/planavista/frontend/src/core/pv-session-ring.ts
index 7ce0d2d..19691dc 100644
--- a/custom_components/planavista/frontend/src/core/pv-session-ring.ts
+++ b/custom_components/planavista/frontend/src/core/pv-session-ring.ts
@@ -1,17 +1,23 @@
 import { LitElement, html, css, svg } from 'lit';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
-import { SESSION_IDLE_MS } from './session';
+import { SESSION_IDLE_MS, sessionWords } from './session';
 
 /**
- * pv-session-ring: parent mode's countdown, a ring that empties over two
- * minutes. It redraws itself every second, so only this element re-renders.
+ * pv-session-ring: a session's countdown, a ring that empties over the
+ * household's quiet time and refills at each touch the backend hears (in the
+ * last stretch before the cap it can't refill). It redraws itself every
+ * second, so only this element re-renders.
  */
 export class PvSessionRing extends LitElement {
   /** When the session ends (ms since the epoch). */
   @property({ type: Number }) endsAt = 0;
   @property({ type: String }) color = 'currentColor';
   @property({ type: Number }) size = 28;
+  /** A full ring (ms): Lock after no touches. */
+  @property({ type: Number }) span = SESSION_IDLE_MS;
+  /** Parent mode, or a child's unlocked window: only the spoken words differ. */
+  @property({ type: Boolean }) parent = true;
   @state() private _now = Date.now();
   private _timer: number | undefined;
 
@@ -44,14 +50,14 @@ export class PvSessionRing extends LitElement {
 
   render() {
     const left = Math.max(0, this.endsAt - this._now);
-    const fraction = Math.min(1, left / SESSION_IDLE_MS);
+    const fraction = Math.min(1, left / (this.span || SESSION_IDLE_MS));
     const stroke = 3;
     const center = this.size / 2;
     const radius = (this.size - stroke) / 2;
     const length = 2 * Math.PI * radius;
     // Screen readers hear the time left in 10-second steps, not every second.
     const spoken = Math.ceil(Math.ceil(left / 1000) / 10) * 10;
-    const label = `Parent mode ends in ${Math.floor(spoken / 60)} min ${spoken % 60} s`;
+    const label = `${sessionWords(this.parent).ends} ${Math.floor(spoken / 60)} min ${spoken % 60} s`;
     return html`
       <svg width=${this.size} height=${this.size} viewBox="0 0 ${this.size} ${this.size}" role="img" aria-label=${label}>
         ${svg`
```

`custom_components/planavista/frontend/src/core/session.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/session.ts b/custom_components/planavista/frontend/src/core/session.ts
index f1d0407..cb5bb7c 100644
--- a/custom_components/planavista/frontend/src/core/session.ts
+++ b/custom_components/planavista/frontend/src/core/session.ts
@@ -2,9 +2,12 @@
  * A parent-mode or member session on this card (spec 9.4). The backend
  * decides; the card mirrors the backend's clock, which restarts each time a
  * touch reaches it, so the countdown never promises time the backend
- * won't give.
+ * won't give. Since milestone 8 the household picks both limits (D3): how
+ * long a quiet session lasts (Lock after no touches) and when any session
+ * ends however busy (Parent mode ends after).
  */
 export const SESSION_IDLE_MS = 120_000;
+export const PARENT_MODE_MS = 10 * 60_000;
 export const TOUCH_EVERY_MS = 30_000;
 
 export interface Session {
@@ -13,22 +16,67 @@ export interface Session {
   parent: boolean;
   /** When the backend last heard from this card (ms). */
   lastTouch: number;
+  /** When the PIN opened it (ms). */
+  startedAt: number;
+  /** How long a quiet session lasts (ms). */
+  idleMs: number;
+  /** When the session ends however busy (ms since the epoch). */
+  capAt: number;
 }
 
-export function startSession(result: { session: string; member_id: string; parent: boolean }, now: number): Session {
-  return { token: result.session, memberId: result.member_id, parent: result.parent, lastTouch: now };
+export function startSession(
+  result: { session: string; member_id: string; parent: boolean; idle_seconds?: number; cap_in?: number },
+  now: number,
+): Session {
+  return {
+    token: result.session,
+    memberId: result.member_id,
+    parent: result.parent,
+    lastTouch: now,
+    startedAt: now,
+    idleMs: result.idle_seconds ? result.idle_seconds * 1000 : SESSION_IDLE_MS,
+    capAt: now + (result.cap_in ? result.cap_in * 1000 : PARENT_MODE_MS),
+  };
+}
+
+/** New limits saved while the session is open: the backend reads them at every check, so the card does too. */
+export function withLimits(session: Session, idleSeconds: number | undefined, capMinutes: number | undefined): Session {
+  const idleMs = idleSeconds ? idleSeconds * 1000 : session.idleMs;
+  const capAt = capMinutes ? session.startedAt + capMinutes * 60_000 : session.capAt;
+  if (idleMs === session.idleMs && capAt === session.capAt) return session;
+  return { ...session, idleMs, capAt };
+}
+
+/** When the session ends unless someone touches the screen first (ms since the epoch). */
+export function endsAt(session: Session): number {
+  return Math.min(session.lastTouch + session.idleMs, session.capAt);
 }
 
 export function remainingMs(session: Session, now: number): number {
-  return Math.max(0, session.lastTouch + SESSION_IDLE_MS - now);
+  return Math.max(0, endsAt(session) - now);
 }
 
 export function expired(session: Session, now: number): boolean {
   return remainingMs(session, now) === 0;
 }
 
-/** Someone touched the card: whether to tell the backend now (at most every 30 seconds). */
+/** The backend accepted a command made with the session, which counts as a touch there. */
+export function usedAt(session: Session, now: number): Session {
+  return now > session.lastTouch ? { ...session, lastTouch: now } : session;
+}
+
+/** How often to tell the backend about touches: every 30 seconds, or sooner when the quiet time is short. */
+export function touchEveryMs(session: Session): number {
+  return Math.min(TOUCH_EVERY_MS, session.idleMs / 4);
+}
+
+/** Someone touched the card: whether to tell the backend now. */
 export function noteActivity(session: Session, now: number): { session: Session; touch: boolean } {
-  if (now - session.lastTouch < TOUCH_EVERY_MS) return { session, touch: false };
+  if (now - session.lastTouch < touchEveryMs(session)) return { session, touch: false };
   return { session: { ...session, lastTouch: now }, touch: true };
 }
+
+/** A parent's session and a child's window share one strip (D5); only the words differ. */
+export function sessionWords(parent: boolean): { mode: string; ends: string } {
+  return parent ? { mode: 'parent mode', ends: 'Parent mode ends in' } : { mode: 'unlocked', ends: 'Locks in' };
+}
```

`custom_components/planavista/frontend/src/core/ws-api.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/ws-api.ts b/custom_components/planavista/frontend/src/core/ws-api.ts
index 62ab0de..a71d550 100644
--- a/custom_components/planavista/frontend/src/core/ws-api.ts
+++ b/custom_components/planavista/frontend/src/core/ws-api.ts
@@ -26,13 +26,16 @@ const SESSION_GONE = new Set(['parent_mode_required', 'pin_required']);
  * PlanaVista commands with this card's PIN session token added when it has
  * one. A command refused for want of a PIN although it carried a session
  * means the backend already ended that session (after a reconnect or a
- * restart); `onSessionEnded` hears about it.
+ * restart); `onSessionEnded` hears about it. A command the backend accepted
+ * with the session also counted as a touch there; `onSessionUsed` hears about
+ * that, so the card's countdown matches.
  */
 export class WsApi {
   constructor(
     private readonly _ws: WsCaller,
     private readonly _session: () => string | null,
     private readonly _onSessionEnded?: (token: string) => void,
+    private readonly _onSessionUsed?: (token: string) => void,
   ) {}
 
   protected call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
@@ -40,9 +43,15 @@ export class WsApi {
     const token = withSession ? this._session() : null;
     if (!token) return this._ws.callWS<T>(message);
     message.session = token;
-    return this._ws.callWS<T>(message).catch((err: unknown) => {
-      if (SESSION_GONE.has(errorCode(err))) this._onSessionEnded?.(token);
-      throw err;
-    });
+    return this._ws.callWS<T>(message).then(
+      result => {
+        this._onSessionUsed?.(token);
+        return result;
+      },
+      (err: unknown) => {
+        if (SESSION_GONE.has(errorCode(err))) this._onSessionEnded?.(token);
+        throw err;
+      },
+    );
   }
 }
```

`custom_components/planavista/frontend/src/modules/chores/chores-service.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-service.ts b/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
index 39b4ebb..5c23b62 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
@@ -112,6 +112,7 @@ export class ChoresService implements ModuleService {
       { callWS: <T>(msg: Record<string, unknown>) => (this._host.hass as unknown as { callWS(m: unknown): Promise<T> }).callWS(msg) },
       () => this._host.pinSession?.token ?? null,
       token => this._host.sessionEnded(token),
+      token => this._host.sessionUsed?.(token),
     );
     this.queue = sharedQueue();
     this._subscription = new ChoresSubscription(
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index d86d932..31906b5 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -124,6 +124,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     { callWS: <T>(msg: Record<string, unknown>) => (this.hass as any).callWS(msg) as Promise<T> },
     () => this._session.token,
     token => this._session.ended(token),
+    token => this._session.used(token),
   );
 
   /** Each module's card-wide state (the chores feed), made once per card. */
@@ -169,6 +170,11 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     this._session.ended(token);
   }
 
+  /** ServiceHost: the backend accepted a command made with this session (a touch there). */
+  sessionUsed(token: string): void {
+    this._session.used(token);
+  }
+
   /** ServiceHost: a module's service has news. */
   serviceChanged(): void {
     this._serviceRevision++;
@@ -395,6 +401,8 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     // Another view or module starts at its top, so the header starts tall again. Turning the
     // tablet keeps the content's place (spec 12.1), so it keeps the header's shape too.
     if (changed.has('_views') || changed.has('_moduleId')) this._compactHeader = false;
+    // Lock after no touches and Parent mode ends after apply to an open session as soon as they're saved.
+    this._session.follow(this._household.view?.security);
   }
 
   private _setView(id: string): void {
@@ -588,19 +596,21 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     `;
   }
 
-  /** Whose parent mode is on, with its countdown and Lock, even when the header is hidden. */
+  /** Whose session is open (parent mode, or a child's unlocked window), with its countdown and Lock, even when the header is hidden. */
   private _renderParentStrip() {
     const session = this._session.session;
-    if (!session?.parent) return nothing;
-    const parent = this._household.view?.members.find(m => m.id === session.memberId);
-    if (!parent) return nothing;
+    if (!session) return nothing;
+    const member = this._household.view?.members.find(m => m.id === session.memberId);
+    if (!member) return nothing;
     const active = this._activeModule();
-    const actions: ModuleAction[] = active ? this._services[active.id]?.stripActions?.(this._ctx()) ?? [] : [];
+    const actions: ModuleAction[] = active && session.parent ? this._services[active.id]?.stripActions?.(this._ctx()) ?? [] : [];
     return html`
       <pv-parent-strip
-        .member=${parent}
+        .member=${member}
         .hass=${this.hass}
         .endsAt=${this._session.endsAt ?? 0}
+        .span=${this._session.spanMs}
+        .parent=${session.parent}
         .actions=${actions}
         @pv-lock=${() => this._session.lock()}
         @pv-strip-action=${(e: CustomEvent<{ id: string }>) => this._moduleAction(e.detail.id)}
@@ -721,6 +731,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .layout=${this._layout.layout}
               .session=${this._session.session}
               .sessionEndsAt=${this._session.endsAt ?? 0}
+              .sessionSpan=${this._session.spanMs}
               .parent=${this._household.view?.members.find(m => m.id === this._session.session?.memberId) ?? null}
               .drafts=${this._drafts}
               .services=${this._services}
```

`custom_components/planavista/frontend/src/shell/pv-parent-strip.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts b/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
index c8dc374..d0c3fa8 100644
--- a/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
@@ -5,12 +5,15 @@ import { defineElement } from '../utils/define';
 import { buttonStyles } from '../styles/shared';
 import { Member } from '../core/household';
 import type { ModuleAction } from '../core/module-registry';
+import { SESSION_IDLE_MS, sessionWords } from '../core/session';
 import '../core/pv-member-avatar';
 import '../core/pv-session-ring';
 
 /**
  * pv-parent-strip: shows whose parent mode is on, with its countdown and
- * Lock (spec 9.4). It takes on the parent's color and picture.
+ * Lock (spec 9.4). It takes on the parent's color and picture. A child's
+ * unlocked window shows the same strip in the child's color (milestone 8,
+ * D5), without the module's buttons.
  *
  * @fires pv-lock - Lock was tapped
  * @fires pv-strip-action - { id } of a module's button (+ Add chore)
@@ -19,6 +22,10 @@ export class PvParentStrip extends LitElement {
   @property({ attribute: false }) member?: Member;
   @property({ attribute: false }) hass?: HomeAssistant;
   @property({ type: Number }) endsAt = 0;
+  /** A full ring (ms): the household's Lock after no touches. */
+  @property({ type: Number }) span = SESSION_IDLE_MS;
+  /** Parent mode, or a child's unlocked window. */
+  @property({ type: Boolean }) parent = true;
   /** The module's buttons, such as + Add chore. */
   @property({ attribute: false }) actions: ModuleAction[] = [];
 
@@ -74,9 +81,9 @@ export class PvParentStrip extends LitElement {
     return html`
       <div class="strip" style="--strip-color: ${member.color}">
         <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
-        <span class="who">${member.name} <span class="mode">· parent mode</span></span>
-        <pv-session-ring .endsAt=${this.endsAt} color=${member.color}></pv-session-ring>
-        ${this.actions.map(action => html`
+        <span class="who">${member.name} <span class="mode">· ${sessionWords(this.parent).mode}</span></span>
+        <pv-session-ring .endsAt=${this.endsAt} .span=${this.span} .parent=${this.parent} color=${member.color}></pv-session-ring>
+        ${(this.parent ? this.actions : []).map(action => html`
           <button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._action(action.id)}>
             ${action.glyph ? `${action.glyph} ` : ''}${action.label}
           </button>
```

`custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts b/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
index 24ad1cb..9b75205 100644
--- a/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
@@ -8,12 +8,15 @@ import { trapTab } from '../core/focus';
 import { Member } from '../core/household';
 import { HouseholdApi, errorCode } from '../core/household-client';
 import {
+  EASY_PIN_MESSAGE,
   MAX_PIN,
   PinEntry,
   canFinishChoosing,
+  easyPin,
   isComplete,
   keypadDigits,
   pressDelete,
+  pinHint,
   pressDigit,
   startEntry,
 } from '../core/keypad';
@@ -316,7 +319,7 @@ export class PvPinSheet extends LitElement {
         ? html`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`
         : nothing}
       <h2 class="heading" id="pin-heading">${heading}</h2>
-      ${this._step === 'choose' ? html`<p class="hint">4 to 6 digits.</p>` : nothing}
+      ${this._step === 'choose' ? html`<p class="hint">${pinHint(!!this.target?.parent)}</p>` : nothing}
       <div class="boxes ${this._shake ? 'shake' : ''}" aria-hidden="true">
         ${Array.from({ length: this._entry.length }, (_, i) => html`
           <span class="box ${i < this._entry.digits.length ? 'filled' : ''}"></span>
@@ -396,6 +399,11 @@ export class PvPinSheet extends LitElement {
   private _next(): void {
     if (this._step === 'choose') {
       if (!canFinishChoosing(this._entry)) return;
+      // Turned away before asking twice; the backend refuses the same PINs (D4).
+      if (easyPin(this._entry.digits)) {
+        this._restartChoosing(EASY_PIN_MESSAGE);
+        return;
+      }
       this._first = this._entry.digits;
       this._entry = startEntry(this._first.length);
       this._step = 'confirm';
@@ -453,7 +461,7 @@ export class PvPinSheet extends LitElement {
       await this.api.setPin(target.id, pin);
       void this._leave('pv-pin-set', { memberId: target.id });
     } catch (err) {
-      this._restartChoosing(saveErrorMessage(errorCode(err)));
+      this._restartChoosing(errorCode(err) === 'easy_pin' ? EASY_PIN_MESSAGE : saveErrorMessage(errorCode(err)));
     } finally {
       this._busy = false;
     }
```

`custom_components/planavista/frontend/src/shell/session-controller.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/session-controller.ts b/custom_components/planavista/frontend/src/shell/session-controller.ts
index 40fa41b..6d55831 100644
--- a/custom_components/planavista/frontend/src/shell/session-controller.ts
+++ b/custom_components/planavista/frontend/src/shell/session-controller.ts
@@ -1,13 +1,14 @@
 import { ReactiveController, ReactiveControllerHost } from 'lit';
 import { ConnectionEvents, ConnectionWatch } from '../core/connection-watch';
 import { HouseholdApi, UnlockResult } from '../core/household-client';
-import { SESSION_IDLE_MS, Session, expired, noteActivity, startSession } from '../core/session';
+import { Session, endsAt, expired, noteActivity, startSession, usedAt, withLimits } from '../core/session';
 
 type Host = ReactiveControllerHost & HTMLElement & { hass?: { connection?: unknown } };
 
 /**
  * The card's PIN session (spec 9.4). A PIN starts it; touches keep it open,
- * reported at most every 30 seconds; Lock, two quiet minutes, a hidden page,
+ * reported at most every 30 seconds; Lock, the household's quiet time (two
+ * minutes unless changed), its cap however busy (D3), a hidden page,
  * a dropped or re-made connection (the backend bound the session to the old
  * one), or a command or touch the backend refuses (it forgot the session,
  * for example after a restart) end it. Ending is the safe way to fail on a
@@ -31,7 +32,12 @@ export class SessionController implements ReactiveController {
 
   /** When the session ends unless someone touches the screen (ms since the epoch). */
   get endsAt(): number | null {
-    return this.session ? this.session.lastTouch + SESSION_IDLE_MS : null;
+    return this.session ? endsAt(this.session) : null;
+  }
+
+  /** A full ring: the household's quiet time (ms). */
+  get spanMs(): number {
+    return this.session?.idleMs ?? 0;
   }
 
   hostConnected(): void {
@@ -59,16 +65,35 @@ export class SessionController implements ReactiveController {
     if (this.session?.token === token) this._forget();
   }
 
+  /** The backend accepted a command made with this session: it counted as a touch there. */
+  used(token: string): void {
+    if (this.session?.token !== token) return;
+    this.session = usedAt(this.session, Date.now());
+    this._host.requestUpdate();
+  }
+
   private _followConnection(): void {
     this._connection.follow(this._host.hass?.connection as ConnectionEvents | undefined);
   }
 
+  /** The household's limits as saved now (Settings may change them while a session is open). */
+  follow(security: { session_idle_seconds?: number; parent_mode_minutes?: number } | undefined): void {
+    if (!this.session || !security) return;
+    const next = withLimits(this.session, security.session_idle_seconds, security.parent_mode_minutes);
+    if (next === this.session) return;
+    this.session = next;
+    this._host.requestUpdate();
+  }
+
   /** A PIN was accepted: start the session it returned. */
   unlocked(result: UnlockResult): void {
     if (!result.ok || !result.session || !result.member_id) return;
     this._forget();
     this.session = startSession(
-      { session: result.session, member_id: result.member_id, parent: !!result.parent },
+      {
+        session: result.session, member_id: result.member_id, parent: !!result.parent,
+        idle_seconds: result.idle_seconds, cap_in: result.cap_in,
+      },
       Date.now(),
     );
     this._timer = window.setInterval(this._check, 1000);
```

`custom_components/planavista/frontend/src/shell/settings/pins-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pins-page.ts b/custom_components/planavista/frontend/src/shell/settings/pins-page.ts
index 303c617..3f3b4cb 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pins-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pins-page.ts
@@ -3,6 +3,7 @@ import { property, state } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
+import { segmentedStyles } from '../../styles/controls';
 import { HouseholdView, inOrder } from '../../core/household';
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
@@ -13,8 +14,23 @@ import './pin-actions';
 
 /**
  * pv-settings-pins: PINs and parent mode (spec 14.5). Whether this screen is
- * a shared family screen, everyone's PIN, and Shuffle the keypad.
+ * a shared family screen, everyone's PIN, Shuffle the keypad, and how long a
+ * PIN's session lasts (milestone 8, D3: like a phone's Auto-Lock, with no
+ * Never).
  */
+const IDLE_CHOICES = [
+  { value: 30, label: '30 sec', spoken: '30 seconds' },
+  { value: 60, label: '1 min', spoken: '1 minute' },
+  { value: 120, label: '2 min', spoken: '2 minutes' },
+  { value: 300, label: '5 min', spoken: '5 minutes' },
+] as const;
+const CAP_CHOICES = [
+  { value: 5, label: '5 min', spoken: '5 minutes' },
+  { value: 10, label: '10 min', spoken: '10 minutes' },
+  { value: 15, label: '15 min', spoken: '15 minutes' },
+  { value: 30, label: '30 min', spoken: '30 minutes' },
+] as const;
+
 export class PvSettingsPins extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ attribute: false }) data!: PlanaVistaData;
@@ -30,6 +46,7 @@ export class PvSettingsPins extends LitElement {
     baseStyles,
     buttonStyles,
     formStyles,
+    segmentedStyles,
     css`
       :host {
         display: block;
@@ -97,6 +114,20 @@ export class PvSettingsPins extends LitElement {
         min-width: 0;
       }
 
+      .choice-row {
+        display: flex;
+        flex-wrap: wrap;
+        align-items: center;
+        justify-content: space-between;
+        gap: 8px 12px;
+        min-height: 48px;
+        margin-top: 16px;
+      }
+
+      .choice-row:first-of-type {
+        margin-top: 0;
+      }
+
       .rule {
         font-size: 0.875rem;
         color: var(--pv-text-secondary, #6B7280);
@@ -148,6 +179,15 @@ export class PvSettingsPins extends LitElement {
         <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
       </section>
 
+      <section>
+        ${this._choices('Lock after no touches', 'idle-label', IDLE_CHOICES, household.security.session_idle_seconds ?? 120,
+          value => this.api.saveSecurity({ session_idle_seconds: value }))}
+        <p class="hint">After a PIN, the screen locks again once nobody has touched it this long.</p>
+        ${this._choices('Parent mode ends after', 'cap-label', CAP_CHOICES, household.security.parent_mode_minutes ?? 10,
+          value => this.api.saveSecurity({ parent_mode_minutes: value }))}
+        <p class="hint">However busy the screen is, parent mode and a child's unlocked time end this long after the PIN.</p>
+      </section>
+
       <p class="rule">
         After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
         long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
@@ -179,6 +219,41 @@ export class PvSettingsPins extends LitElement {
     `;
   }
 
+  /** One of a few: the segmented control, as everywhere (arrows move the choice). */
+  private _choices(
+    label: string,
+    id: string,
+    choices: readonly { value: number; label: string; spoken: string }[],
+    chosen: number,
+    save: (value: number) => Promise<void>,
+  ) {
+    const choose = (value: number, group?: HTMLElement): void => {
+      if (value !== chosen) void this._run(() => save(value));
+      void this.updateComplete.then(() => group?.querySelector<HTMLElement>(`[data-value='${value}']`)?.focus());
+    };
+    const arrows = (event: KeyboardEvent): void => {
+      const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
+      if (!step) return;
+      event.preventDefault();
+      const index = Math.max(0, choices.findIndex(c => c.value === chosen));
+      choose(choices[(index + step + choices.length) % choices.length].value, event.currentTarget as HTMLElement);
+    };
+    return html`
+      <div class="choice-row">
+        <span class="label" id=${id}>${label}</span>
+        <div class="pv-seg" role="radiogroup" aria-labelledby=${id} @keydown=${arrows}>
+          ${choices.map(choice => html`
+            <button type="button" role="radio" data-value=${choice.value} aria-label=${choice.spoken}
+              aria-checked=${choice.value === chosen ? 'true' : 'false'}
+              tabindex=${choice.value === chosen ? '0' : '-1'}
+              ?disabled=${this._busy}
+              @click=${() => choose(choice.value)}>${choice.label}</button>
+          `)}
+        </div>
+      </div>
+    `;
+  }
+
   private _toggleShared = (): void => {
     if (!this.household) return;
     void this._run(() => this.api.setSharedScreen(!this.household!.account.shared));
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 5e18bb5..2f6fa24 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -48,6 +48,8 @@ export class PvSettings extends LitElement {
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
   @property({ attribute: false }) session: Session | null = null;
   @property({ type: Number }) sessionEndsAt = 0;
+  /** A full ring (ms): the household's Lock after no touches. */
+  @property({ type: Number }) sessionSpan = 0;
   @property({ attribute: false }) parent: Member | null = null;
   @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
   /** The card's module services, and a number that changes whenever one of them does. */
@@ -319,7 +321,7 @@ export class PvSettings extends LitElement {
     const stackedPage = !this._split && current;
     return html`
       ${this.session?.parent && this.parent ? html`
-        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
+        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt} .span=${this.sessionSpan}></pv-parent-strip>
       ` : nothing}
       <div class="bar">
         ${stackedPage && this._editor
```

`custom_components/planavista/household/security.py`:

```diff
diff --git a/custom_components/planavista/household/security.py b/custom_components/planavista/household/security.py
index 6a8bdff..ddf7038 100644
--- a/custom_components/planavista/household/security.py
+++ b/custom_components/planavista/household/security.py
@@ -29,6 +29,10 @@ FIRST_PAUSE_SECONDS = 30
 MAX_PAUSE_SECONDS = 15 * 60
 
 SESSION_IDLE_SECONDS = 120
+PARENT_MODE_MINUTES = 10
+# The household's choices (milestone 8, D3): how long a quiet session lasts, and when any session ends.
+SESSION_IDLE_CHOICES = (30, 60, 120, 300)
+PARENT_MODE_CHOICES = (5, 10, 15, 30)
 
 
 def valid_pin(pin: object) -> bool:
@@ -36,6 +40,16 @@ def valid_pin(pin: object) -> bool:
     return isinstance(pin, str) and PIN_PATTERN.fullmatch(pin) is not None
 
 
+def easy_pin(pin: str) -> bool:
+    """Easy to guess, so turned away when chosen (milestone 8, D4): all one digit, a straight run up or down, or the keypad's middle column."""
+    if len(set(pin)) == 1:
+        return True
+    steps = {int(b) - int(a) for a, b in zip(pin, pin[1:])}
+    if steps in ({1}, {-1}):
+        return True
+    return pin in ("2580", "0852")
+
+
 def _derive(pin: str, salt: bytes) -> bytes:
     return hashlib.scrypt(
         pin.encode("ascii"),
@@ -126,18 +140,26 @@ class Session:
     parent: bool
     last_active: float
     connection: object = field(repr=False)
-
-    def expires_in(self, now: float) -> float:
-        """Seconds of quiet left before the session ends."""
-        return max(0.0, self.last_active + SESSION_IDLE_SECONDS - now)
+    #: When the PIN opened it; no session outlives the household's cap.
+    started: float = 0.0
 
 
 class SessionManager:
     """Sessions live in memory only, so a restart or a closed connection forgets them."""
 
-    def __init__(self) -> None:
-        """Start with no sessions."""
+    def __init__(self, limits: Callable[[], tuple[float, float]] | None = None) -> None:
+        """Start with no sessions. `limits` gives (quiet seconds, cap seconds), read at each check."""
         self._sessions: dict[str, Session] = {}
+        self._limits = limits or (lambda: (float(SESSION_IDLE_SECONDS), PARENT_MODE_MINUTES * 60.0))
+
+    def _alive(self, session: Session, now: float) -> bool:
+        idle, cap = self._limits()
+        return now - session.last_active < idle and now - session.started < cap
+
+    def expires_in(self, session: Session, now: float) -> float:
+        """Seconds left: until the quiet time runs out or the cap arrives, whichever is first."""
+        idle, cap = self._limits()
+        return max(0.0, min(session.last_active + idle, session.started + cap) - now)
 
     def __len__(self) -> int:
         """How many sessions are open (some may have idled out without being asked yet)."""
@@ -145,8 +167,8 @@ class SessionManager:
 
     def start(self, member_id: str, parent: bool, connection: object, now: float) -> Session:
         """A new session for `member_id` on `connection`."""
-        self._drop(lambda s: now - s.last_active >= SESSION_IDLE_SECONDS)
-        session = Session(secrets.token_urlsafe(32), member_id, parent, now, connection)
+        self._drop(lambda s: not self._alive(s, now))
+        session = Session(secrets.token_urlsafe(32), member_id, parent, now, connection, started=now)
         self._sessions[session.token] = session
         return session
 
@@ -157,7 +179,7 @@ class SessionManager:
         session = self._sessions.get(token) if token else None
         if session is None or session.connection is not connection:
             return None
-        if now - session.last_active >= SESSION_IDLE_SECONDS:
+        if not self._alive(session, now):
             del self._sessions[session.token]
             return None
         if touch:
```

`custom_components/planavista/household/store.py`:

```diff
diff --git a/custom_components/planavista/household/store.py b/custom_components/planavista/household/store.py
index 5539ad4..3003811 100644
--- a/custom_components/planavista/household/store.py
+++ b/custom_components/planavista/household/store.py
@@ -15,7 +15,13 @@ from homeassistant.util.hass_dict import HassKey
 from ..const import CONF_CALENDARS, CONF_ONBOARDING_COMPLETE, DOMAIN
 from ..coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 from .members import clear_missing_persons, link_calendars
-from .security import SessionManager
+from .security import (
+    PARENT_MODE_CHOICES,
+    PARENT_MODE_MINUTES,
+    SESSION_IDLE_CHOICES,
+    SESSION_IDLE_SECONDS,
+    SessionManager,
+)
 
 _LOGGER = logging.getLogger(__name__)
 
@@ -30,7 +36,10 @@ def default_document() -> dict[str, Any]:
     """A household with nobody in it yet."""
     return {
         "members": [],
-        "security": {"pins": {}, "shared_users": [], "shuffle_keypad": False},
+        "security": {
+            "pins": {}, "shared_users": [], "shuffle_keypad": False,
+            "session_idle_seconds": SESSION_IDLE_SECONDS, "parent_mode_minutes": PARENT_MODE_MINUTES,
+        },
         "modules": {},
         "setup": {"completed": False, "step": None},
         "migrations": {},
@@ -53,6 +62,10 @@ def normalize(data: object) -> dict[str, Any]:
         security["shared_users"] = []
     if not isinstance(security.get("shuffle_keypad"), bool):
         security["shuffle_keypad"] = False
+    if security.get("session_idle_seconds") not in SESSION_IDLE_CHOICES:
+        security["session_idle_seconds"] = SESSION_IDLE_SECONDS
+    if security.get("parent_mode_minutes") not in PARENT_MODE_CHOICES:
+        security["parent_mode_minutes"] = PARENT_MODE_MINUTES
     doc["security"] = security
     setup = dict(doc["setup"]) if isinstance(doc.get("setup"), Mapping) else {}
     if not isinstance(setup.get("completed"), bool):
@@ -73,10 +86,17 @@ class Household:
         """Wrap a loaded document; no store means a newer version wrote it."""
         self._store = store
         self.data = data
-        self.sessions = SessionManager()
+        self.sessions = SessionManager(self.session_limits)
         self._listeners: list[Callable[[], None]] = []
         self._pin_locks: dict[str, asyncio.Lock] = {}
 
+    def session_limits(self) -> tuple[float, float]:
+        """How long a quiet session lasts, and when any session ends, in seconds (milestone 8, D3)."""
+        security = self.data.get("security", {})
+        idle = security.get("session_idle_seconds", SESSION_IDLE_SECONDS)
+        cap = security.get("parent_mode_minutes", PARENT_MODE_MINUTES)
+        return float(idle), float(cap) * 60
+
     @property
     def available(self) -> bool:
         """False when the file came from a newer PlanaVista and must not be changed."""
```

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index dfd38d7..617537d 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -35,8 +35,10 @@ from .members import (
 )
 from .permissions import Account, SessionView, may_manage_pin, member_level, parent_level
 from .security import (
-    SESSION_IDLE_SECONDS,
+    PARENT_MODE_CHOICES,
+    SESSION_IDLE_CHOICES,
     after_failure,
+    easy_pin,
     after_success,
     hash_pin,
     pause_remaining,
@@ -220,6 +222,8 @@ def _view(hass: HomeAssistant, household: Household, user: User) -> dict[str, An
         "security": {
             "shuffle_keypad": household.data["security"]["shuffle_keypad"],
             "shared_screens": len(household.shared_users),
+            "session_idle_seconds": household.data["security"]["session_idle_seconds"],
+            "parent_mode_minutes": household.data["security"]["parent_mode_minutes"],
         },
         "modules": household.data["modules"],
         "setup": household.data["setup"],
@@ -448,6 +452,8 @@ async def ws_shared_screen(
     {
         vol.Required("type"): "planavista/household/settings/save",
         vol.Optional("shuffle_keypad"): bool,
+        vol.Optional("session_idle_seconds"): vol.In(SESSION_IDLE_CHOICES),
+        vol.Optional("parent_mode_minutes"): vol.In(PARENT_MODE_CHOICES),
         vol.Optional("session"): str,
     }
 )
@@ -455,13 +461,14 @@ async def ws_shared_screen(
 async def ws_settings_save(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
-    """Household-wide PIN settings (today, Shuffle the keypad)."""
+    """Household-wide PIN settings: Shuffle the keypad, Lock after no touches, Parent mode ends after."""
     context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
-    if "shuffle_keypad" in msg:
-        household.data["security"]["shuffle_keypad"] = msg["shuffle_keypad"]
+    for key in ("shuffle_keypad", "session_idle_seconds", "parent_mode_minutes"):
+        if key in msg:
+            household.data["security"][key] = msg[key]
     await household.async_save()
     connection.send_result(msg["id"])
 
@@ -523,6 +530,7 @@ async def ws_config_save(
 # PIN fields accept any value; the handler checks the format with a fixed
 # message, so Home Assistant's error logging can never quote a PIN.
 INVALID_PIN = "PINs are 4 to 6 digits."
+EASY_PIN = "That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another."
 
 
 @callback
@@ -597,9 +605,9 @@ async def ws_pin_unlock(
         if record.get("failures") or record.get("lockouts"):
             household.pins[member_id] = after_success(record)
             await household.async_save()
-    session = household.sessions.start(
-        member_id, bool(member.get("parent")), connection, _monotonic()
-    )
+    now = _monotonic()
+    session = household.sessions.start(member_id, bool(member.get("parent")), connection, now)
+    idle, cap = household.session_limits()
     connection.subscriptions[("planavista_session", session.token)] = partial(
         household.sessions.end, session.token
     )
@@ -610,7 +618,9 @@ async def ws_pin_unlock(
             "session": session.token,
             "member_id": member_id,
             "parent": session.parent,
-            "expires_in": SESSION_IDLE_SECONDS,
+            "expires_in": math.ceil(household.sessions.expires_in(session, now)),
+            "idle_seconds": math.ceil(idle),
+            "cap_in": math.ceil(cap),
         },
     )
 
@@ -635,6 +645,9 @@ async def ws_pin_set(
     if not valid_pin(msg["pin"]):
         connection.send_error(msg["id"], "invalid_pin", INVALID_PIN)
         return
+    if easy_pin(msg["pin"]):
+        connection.send_error(msg["id"], "easy_pin", EASY_PIN)
+        return
     household.pins[msg["member_id"]] = await hass.async_add_executor_job(hash_pin, msg["pin"])
     household.sessions.end_member(msg["member_id"], keep=token)
     await household.async_save()
@@ -726,10 +739,12 @@ def ws_pin_touch(
     household = household_for(hass, connection, msg)
     if household is None:
         return
-    if household.sessions.get(msg["session"], connection, _monotonic(), touch=True) is None:
+    now = _monotonic()
+    session = household.sessions.get(msg["session"], connection, now, touch=True)
+    if session is None:
         connection.send_error(msg["id"], "session_ended", "The PIN session ended.")
         return
-    connection.send_result(msg["id"], {"expires_in": SESSION_IDLE_SECONDS})
+    connection.send_result(msg["id"], {"expires_in": math.ceil(household.sessions.expires_in(session, now))})
 
 
 HOUSEHOLD_COMMANDS = (
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1112 passed`; the task's own files `49 passed`; `bash scripts/test-backend.sh -q` Expected: `1090 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Settings, PINs and parent mode shows both rows; a session follows a new quiet time at once; 1234 is turned away with the backend's words; a parent is hinted toward 6 digits; Casey's PIN shows "Casey · unlocked" with the countdown and Lock.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat: Lock after no touches, Parent mode ends after, and easy PINs turned away

- The household picks how long a quiet PIN session lasts (30 seconds to
  5 minutes, 2 by default) and when any session ends however busy (5 to 30
  minutes, 10 by default). Both apply to open sessions as soon as they are
  saved; wrong-PIN pauses are unchanged.
- Unlocking says how long the session can last; a touch says what is left.
  A command made with the session counts as a touch on the card too, so the
  countdown matches the backend.
- A child's unlocked time shows the same strip as parent mode, in the
  child's color, with its countdown and Lock.
- Choosing a PIN turns away easy ones (all one digit, a straight run, or
  straight down the keypad) on the card and the backend; PINs set before
  keep working. Parents are told 6 digits are much harder to guess.
```

---

### Task 9: The README's session times and easy PINs

Spec 3.8.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Make them pass.**

`README.md`:

```diff
diff --git a/README.md b/README.md
index 7f01518..66725ba 100644
--- a/README.md
+++ b/README.md
@@ -122,7 +122,7 @@ PlanaVista keeps a list of the people in your household. Anyone whose calendar i
 
 **Shared family screens.** A wall tablet that the whole family uses should sign in with its own Home Assistant account, one that isn't an admin. On that account, Settings asks for a parent's PIN first. Once a parent has a PIN, mark the tablet's account as a shared family screen in Settings, under PINs and parent mode. A non-admin account is safer on a shared screen because an admin account also opens Home Assistant's own settings, which no PlanaVista PIN can guard. An account that isn't linked to anyone and isn't an admin is treated as a shared screen too.
 
-**PINs and parent mode.** Anyone can have a PIN of 4 to 6 digits. A parent's PIN starts parent mode on that screen: the top of the card shows whose it is, with a countdown and a Lock button. Parent mode ends after two quiet minutes, when the screen sleeps, when the page reloads, or when someone taps Lock. After 5 wrong tries a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes. A parent can clear a pause. PlanaVista keeps PINs only as salted hashes, and never puts them in actions, events, or its logs.
+**PINs and parent mode.** Anyone can have a PIN of 4 to 6 digits; 6 is much harder to guess. PINs that are easy to guess are turned away: the same digit over and over, a run like 1234, or straight down the keypad like 2580. A parent's PIN starts parent mode on that screen: the top of the card shows whose it is, with a countdown and a Lock button. A child's PIN shows the same strip in their color while their changes are unlocked. Either ends once nobody has touched the screen for two minutes, when the screen sleeps, when the page reloads, when someone taps Lock, and in any case ten minutes after the PIN. Both times can be changed in Settings, under PINs and parent mode (Lock after no touches, and Parent mode ends after). After 5 wrong tries a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes. A parent can clear a pause. PlanaVista keeps PINs only as salted hashes, and never puts them in actions, events, or its logs.
 
 **Forgot every parent's PIN?** Sign in to Home Assistant with a parent's or an admin's own account and set new ones in Settings, under PINs and parent mode.
 
```

- [ ] **Step 2: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1112 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 3: Check it on the dev Home Assistant.** None (documentation).

- [ ] **Step 4: Commit** with this message and the two trailer lines:

```text
docs(readme): session times and easy PINs
```

---

### Task 10: Calendar events follow the household's rule for who may change what

Spec 3.2, D1.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/calendar/event-gate.ts`, `custom_components/planavista/frontend/test/event-gate.test.ts`
- Modify: `README.md`, `custom_components/planavista/frontend/src/core/access.ts`, `custom_components/planavista/frontend/src/core/pin-gate.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`, `custom_components/planavista/frontend/src/modules/calendar/event-words.ts`, `custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts`, `custom_components/planavista/frontend/test/access.test.ts`, `custom_components/planavista/frontend/test/calendar-derive.test.ts`, `custom_components/planavista/frontend/test/event-form.test.ts`, `custom_components/planavista/frontend/test/event-words.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/access.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/access.test.ts b/custom_components/planavista/frontend/test/access.test.ts
index 679661d..610744f 100644
--- a/custom_components/planavista/frontend/test/access.test.ts
+++ b/custom_components/planavista/frontend/test/access.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { actingParent, mayEverReview, memberAccess, parentAccess, pinChoicesFor } from '../src/core/access';
+import { actingParent, eventAccess, eventPinChoices, mayEverReview, memberAccess, parentAccess, pinChoicesFor } from '../src/core/access';
 import type { AccountKind, HouseholdView, Member } from '../src/core/household';
 import type { Session } from '../src/core/session';
 
@@ -93,3 +93,48 @@ describe('actingParent', () => {
     expect(actingParent(view('shared'), null)).toBeNull();
   });
 });
+
+describe('eventAccess (milestone 8, D1: events follow 9.5)', () => {
+  it('an event only on your own calendar is yours to change; anything else needs a parent', () => {
+    const casey = view('member', 'casey');
+    expect(eventAccess(casey, null, ['casey'])).toBe('yes');
+    expect(eventAccess(casey, null, ['dana'])).toBe('no');
+    expect(eventAccess(casey, null, ['casey', 'dana'])).toBe('no');
+    expect(eventAccess(casey, null, [null])).toBe('no');
+  });
+
+  it("a parent's own login and an admin change any event", () => {
+    expect(eventAccess(view('parent', 'alex'), null, ['casey', 'dana'])).toBe('yes');
+    expect(eventAccess(view('admin'), null, [null])).toBe('yes');
+  });
+
+  it("the shared screen asks for the owner's PIN or a parent's", () => {
+    const kitchen = view('shared');
+    expect(eventAccess(kitchen, null, ['dana'])).toBe('yes');
+    expect(eventAccess(kitchen, null, ['casey'])).toBe('pin');
+    expect(eventAccess(kitchen, null, ['casey', 'dana'])).toBe('pin');
+    expect(eventAccess(kitchen, null, [null])).toBe('pin');
+    expect(eventAccess(kitchen, session('casey', false), ['casey'])).toBe('yes');
+    expect(eventAccess(kitchen, session('casey', false), ['casey', 'dana'])).toBe('pin');
+    expect(eventAccess(kitchen, session('blair', true), ['casey', null])).toBe('yes');
+  });
+
+  it('who may unlock: the owner and the parents for one person, the parents otherwise', () => {
+    const kitchen = view('shared');
+    expect(eventPinChoices(kitchen, ['casey']).map(m => m.id)).toEqual(['casey', 'blair']);
+    expect(eventPinChoices(kitchen, ['casey', 'dana']).map(m => m.id)).toEqual(['blair']);
+    expect(eventPinChoices(kitchen, [null]).map(m => m.id)).toEqual(['blair']);
+  });
+
+  it('a household with no parent PINs keeps changing events as before', () => {
+    const open = view('shared', null, PEOPLE.map(m => ({ ...m, has_pin: false })));
+    expect(eventAccess(open, null, [null])).toBe('yes');
+    expect(eventAccess(open, null, ['casey', 'dana'])).toBe('yes');
+    expect(eventAccess(view('other', null, []), null, [null])).toBe('yes');
+  });
+
+  it('the calendar keeps working before the household answers, or when it is unavailable', () => {
+    expect(eventAccess(null, null, ['casey'])).toBe('yes');
+    expect(eventAccess({ ...view('shared'), available: false }, null, [null])).toBe('yes');
+  });
+});
```

`custom_components/planavista/frontend/test/calendar-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/calendar-derive.test.ts b/custom_components/planavista/frontend/test/calendar-derive.test.ts
index 5673457..466de18 100644
--- a/custom_components/planavista/frontend/test/calendar-derive.test.ts
+++ b/custom_components/planavista/frontend/test/calendar-derive.test.ts
@@ -1,6 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import {
-  calendarWatchedEntities, deriveCalendarData, eventForPopup, initialView, selectCalendars,
+  calendarWatchedEntities, deriveCalendarData, eventForPopup, initialView, ownersOf, selectCalendars,
 } from '../src/modules/calendar/calendar-derive';
 import type { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';
 
@@ -101,3 +101,23 @@ describe('eventForPopup (what the event popup opens with)', () => {
     expect(eventForPopup(a, [a])).toBe(a);
   });
 });
+
+describe('ownersOf (milestone 8, D1)', () => {
+  const rows = [
+    { entity_id: 'calendar.alex', member_id: 'alex' },
+    { entity_id: 'calendar.alex_work', member_id: 'alex' },
+    { entity_id: 'calendar.casey', member_id: 'casey' },
+    { entity_id: 'calendar.family', member_id: null },
+  ] as CalendarConfig[];
+
+  it('names whose calendars an event is on, once each', () => {
+    expect(ownersOf(['calendar.casey'], rows)).toEqual(['casey']);
+    expect(ownersOf(['calendar.alex', 'calendar.alex_work'], rows)).toEqual(['alex']);
+    expect(ownersOf(['calendar.alex', 'calendar.casey'], rows)).toEqual(['alex', 'casey']);
+  });
+
+  it("a calendar that belongs to nobody, or one PlanaVista no longer shows, counts as nobody's", () => {
+    expect(ownersOf(['calendar.family'], rows)).toEqual([null]);
+    expect(ownersOf(['calendar.gone', 'calendar.casey'], rows)).toEqual([null, 'casey']);
+  });
+});
```

`custom_components/planavista/frontend/test/event-form.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-form.test.ts b/custom_components/planavista/frontend/test/event-form.test.ts
index 4d50485..9334d41 100644
--- a/custom_components/planavista/frontend/test/event-form.test.ts
+++ b/custom_components/planavista/frontend/test/event-form.test.ts
@@ -11,6 +11,7 @@ import {
   withEndTime,
   withStartTime,
   type EventFormDates,
+  defaultWho,
 } from '../src/modules/calendar/utils/event-form';
 
 describe('calendarDaysBetween', () => {
@@ -237,3 +238,11 @@ describe('buildEventBase', () => {
     expect(base).toEqual({ summary: 'Field trip', start_date: '2026-10-09', end_date: '2026-10-10', location: 'Museum' });
   });
 });
+
+describe("a new event's Who (milestone 8)", () => {
+  it('picks the one calendar offered, or nobody when there is a choice', () => {
+    expect(defaultWho(['calendar.test_casey'])).toEqual(['calendar.test_casey']);
+    expect(defaultWho(['calendar.test_alex', 'calendar.test_blair'])).toEqual([]);
+    expect(defaultWho([])).toEqual([]);
+  });
+});
```

`custom_components/planavista/frontend/test/event-gate.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { calendarsOf, eventGate } from '../src/modules/calendar/event-gate';
import type { HouseholdView, Member } from '../src/core/household';
import type { PinGate } from '../src/core/pin-gate';
import type { CalendarConfig, CalendarEvent } from '../src/types';

function member(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

const PEOPLE = [
  member('blair', { parent: true, has_pin: true, order: 1 }),
  member('casey', { age_group: 'teen', has_pin: true, order: 2 }),
  member('dana', { age_group: 'young_child', order: 3 }),
];

const ROWS = [
  { entity_id: 'calendar.casey', member_id: 'casey' },
  { entity_id: 'calendar.dana', member_id: 'dana' },
  { entity_id: 'calendar.family', member_id: null },
] as CalendarConfig[];

function view(kind: 'shared' | 'member', memberId: string | null = null): HouseholdView {
  return {
    available: true,
    members: PEOPLE,
    account: { user_id: 'u', name: 'u', is_admin: false, shared: kind === 'shared', kind, member_id: memberId, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

function fakeGate(answer: boolean) {
  const asked: Array<{ members: string[]; heading: string; reason?: string }> = [];
  const gate: PinGate = {
    ask: async (members, heading, reason) => {
      asked.push({ members: members.map(m => m.id), heading, reason });
      return answer;
    },
  };
  return { gate, asked };
}

describe('the event gate (milestone 8, D1)', () => {
  it("asks the shared screen for the owner's PIN, saying why", async () => {
    const { gate, asked } = fakeGate(true);
    const events = eventGate(() => ({ view: view('shared'), session: null, pinGate: gate, rows: ROWS }));
    expect(await events.ask(['calendar.casey'], 'Team standup')).toBe(true);
    expect(asked).toEqual([{ members: ['casey', 'blair'], heading: "Who's changing Team standup?", reason: 'To change Team standup' }]);
  });

  it('goes ahead without a PIN when none is needed, and stops when the PIN sheet is cancelled', async () => {
    const { gate, asked } = fakeGate(false);
    const events = eventGate(() => ({ view: view('shared'), session: null, pinGate: gate, rows: ROWS }));
    expect(await events.ask(['calendar.dana'], 'Swim')).toBe(true);
    expect(asked).toEqual([]);
    expect(await events.ask(['calendar.family'], 'Dinner')).toBe(false);
    expect(asked.map(a => a.members)).toEqual([['blair']]);
  });

  it("a child's own login changes only their own events, and says who can", async () => {
    const { gate, asked } = fakeGate(true);
    const events = eventGate(() => ({ view: view('member', 'casey'), session: null, pinGate: gate, rows: ROWS }));
    expect(events.allowed(['calendar.casey'])).toBe(true);
    expect(events.allowed(['calendar.dana'])).toBe(false);
    expect(await events.ask(['calendar.dana'], 'Swim')).toBe(false);
    expect(asked).toEqual([]);
    expect(events.note(['calendar.dana'])).toBe('Only Dana or a parent can change this event.');
    expect(events.note(['calendar.casey', 'calendar.dana'])).toBe('Only a parent can change this event.');
  });

  it("an event's calendars: every person's copy, or its own calendar", () => {
    const one = { calendar_entity_id: 'calendar.casey' } as CalendarEvent;
    const shared = { calendar_entity_id: 'calendar.casey', shared_calendars: [{ entity_id: 'calendar.casey' }, { entity_id: 'calendar.dana' }] } as unknown as CalendarEvent;
    expect(calendarsOf(one)).toEqual(['calendar.casey']);
    expect(calendarsOf(shared)).toEqual(['calendar.casey', 'calendar.dana']);
  });
});
```

`custom_components/planavista/frontend/test/event-words.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-words.test.ts b/custom_components/planavista/frontend/test/event-words.test.ts
index 4fdd3d9..7640d1c 100644
--- a/custom_components/planavista/frontend/test/event-words.test.ts
+++ b/custom_components/planavista/frontend/test/event-words.test.ts
@@ -1,7 +1,8 @@
 import { describe, expect, it } from 'vitest';
 import type { CalendarEvent } from '../src/types';
 import {
-  calendarCan, dayOfStatus, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, formSignature, longDate, namesList, saveFailedText,
+  calendarCan, changeReason, dayOfStatus, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, formSignature, lockedEventNote, longDate,
+  namesList, saveFailedText,
 } from '../src/modules/calendar/event-words';
 
 const NOW = new Date(2026, 9, 12, 8, 50); // Mon Oct 12, 8:50 AM
@@ -154,3 +155,16 @@ describe('saveFailedText', () => {
     expect(saveFailedText('', false)).toBe("Couldn't add this event. Check that Home Assistant is reachable, then try again.");
   });
 });
+
+describe('who may change an event, in words (milestone 8, D1)', () => {
+  it("says who can change an event this login can't", () => {
+    expect(lockedEventNote(['Dana'])).toBe('Only Dana or a parent can change this event.');
+    expect(lockedEventNote([])).toBe('Only a parent can change this event.');
+    expect(lockedEventNote(['Alex', 'Dana'])).toBe('Only a parent can change this event.');
+  });
+
+  it('the PIN sheet says why it is asking', () => {
+    expect(changeReason('Team standup')).toEqual({ heading: "Who's changing Team standup?", reason: 'To change Team standup' });
+    expect(changeReason('  ')).toEqual({ heading: "Who's changing this event?", reason: 'To change this event' });
+  });
+});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/access.test.ts test/calendar-derive.test.ts test/event-form.test.ts test/event-gate.test.ts test/event-words.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`README.md`:

```diff
diff --git a/README.md b/README.md
index 66725ba..a3c970c 100644
--- a/README.md
+++ b/README.md
@@ -124,6 +124,8 @@ PlanaVista keeps a list of the people in your household. Anyone whose calendar i
 
 **PINs and parent mode.** Anyone can have a PIN of 4 to 6 digits; 6 is much harder to guess. PINs that are easy to guess are turned away: the same digit over and over, a run like 1234, or straight down the keypad like 2580. A parent's PIN starts parent mode on that screen: the top of the card shows whose it is, with a countdown and a Lock button. A child's PIN shows the same strip in their color while their changes are unlocked. Either ends once nobody has touched the screen for two minutes, when the screen sleeps, when the page reloads, when someone taps Lock, and in any case ten minutes after the PIN. Both times can be changed in Settings, under PINs and parent mode (Lock after no touches, and Parent mode ends after). After 5 wrong tries a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes. A parent can clear a pause. PlanaVista keeps PINs only as salted hashes, and never puts them in actions, events, or its logs.
 
+**Who may change calendar events.** On your own login you can add, change, and delete events that are only on your own calendar, and a parent's login can change any event. On a shared family screen, an event on the calendar of someone without a PIN can be changed straight away; an event on the calendar of someone with a PIN asks for their PIN or a parent's; and an event on several people's calendars, or on a calendar that belongs to nobody, asks for a parent's PIN. Until a parent has a PIN, events can be changed as before. This is PlanaVista's rule: Home Assistant's own calendar page and its actions stay as Home Assistant allows them.
+
 **Forgot every parent's PIN?** Sign in to Home Assistant with a parent's or an admin's own account and set new ones in Settings, under PINs and parent mode.
 
 ---
```

`custom_components/planavista/frontend/src/core/access.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/access.ts b/custom_components/planavista/frontend/src/core/access.ts
index da4ae6c..fe66451 100644
--- a/custom_components/planavista/frontend/src/core/access.ts
+++ b/custom_components/planavista/frontend/src/core/access.ts
@@ -48,6 +48,31 @@ export function pinChoicesFor(view: HouseholdView | null, memberId: string): Mem
   return member?.has_pin ? [member, ...parents] : parents;
 }
 
+/**
+ * Whether this screen may change a calendar event (milestone 8, D1: events
+ * follow 9.5). `owners` holds the member of each calendar the event is on, or
+ * null for a calendar that belongs to nobody. An event only on one person's
+ * calendar is a member-level change; anything else is parent-level. This is
+ * the card's rule (Home Assistant's own calendar stays as it allows), so a
+ * household that has asked for no protection (no parent has a PIN), or whose
+ * household hasn't answered, keeps changing events as before.
+ */
+export function eventAccess(view: HouseholdView | null, session: Session | null, owners: readonly (string | null)[]): Access {
+  if (!view || !view.available) return 'yes';
+  const [only] = owners;
+  if (owners.length === 1 && only) return memberAccess(view, session, only);
+  const access = parentAccess(view, session);
+  return access === 'no_pin' ? 'yes' : access;
+}
+
+/** Who may unlock a change to an event: the owner and the parents for one person's event, the parents otherwise. */
+export function eventPinChoices(view: HouseholdView | null, owners: readonly (string | null)[]): Member[] {
+  if (!view) return [];
+  const [only] = owners;
+  if (owners.length === 1 && only) return pinChoicesFor(view, only);
+  return parentsWithPins(view.members);
+}
+
 /** Who did a parent-level change on this screen: the parent in parent mode, or the account's own member. */
 export function actingParent(view: HouseholdView | null, session: Session | null): Member | null {
   if (!view) return null;
```

`custom_components/planavista/frontend/src/core/pin-gate.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pin-gate.ts b/custom_components/planavista/frontend/src/core/pin-gate.ts
index 367bef7..6b774a3 100644
--- a/custom_components/planavista/frontend/src/core/pin-gate.ts
+++ b/custom_components/planavista/frontend/src/core/pin-gate.ts
@@ -6,5 +6,6 @@ import type { Member } from './household';
  * what for, and hears whether a session for one of them started.
  */
 export interface PinGate {
-  ask(members: Member[], heading: string): Promise<boolean>;
+  /** `reason` is the line under "Blair, enter your PIN" that says why ("To change Team standup"). */
+  ask(members: Member[], heading: string, reason?: string): Promise<boolean>;
 }
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
index 50387ed..0478290 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
@@ -124,3 +124,17 @@ export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
 export function initialView(config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): ViewType | undefined {
   return config?.view || config?.default_view || data?.display?.default_view || undefined;
 }
+
+/**
+ * Whose calendars an event is on (milestone 8, D1), once each: a member id,
+ * or null for a calendar that belongs to nobody (or that PlanaVista no
+ * longer shows).
+ */
+export function ownersOf(calendarIds: readonly string[], rows: readonly CalendarConfig[]): (string | null)[] {
+  const owners: (string | null)[] = [];
+  for (const id of calendarIds) {
+    const owner = rows.find(row => row.entity_id === id)?.member_id ?? null;
+    if (!owners.includes(owner)) owners.push(owner);
+  }
+  return owners;
+}
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 2236a57..0f514a3 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -21,6 +21,8 @@ import { GONE, Presence, nextPresence } from '../../core/sheet-presence';
 import { deepActiveElement } from '../../core/focus';
 import type { HouseholdView } from '../../core/household';
 import type { Session } from '../../core/session';
+import type { PinGate } from '../../core/pin-gate';
+import { eventGate } from './event-gate';
 import { parentAccess } from '../../core/access';
 import { OPEN_SETTINGS } from '../../core/page-host';
 import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
@@ -74,6 +76,8 @@ export class PvCalendarModule extends LitElement {
   /** The household and parent mode, for what the empty states offer (a parent adds calendars). */
   @property({ attribute: false }) household: HouseholdView | null = null;
   @property({ attribute: false }) session: Session | null = null;
+  /** The card's PIN sheet, for changes that need someone's PIN on a shared screen (D1). */
+  @property({ attribute: false }) pinGate?: PinGate;
 
   /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
   @state() private _tick = Math.floor(Date.now() / 60000);
@@ -724,6 +728,7 @@ export class PvCalendarModule extends LitElement {
           .event=${this._details.value}
           .leaving=${this._details.leaving}
           .calendars=${calendars}
+          .gate=${this._gate}
           .now=${this._now(this._tick)}
           .timeFormat=${display?.time_format || '12h'}
           @pv-sheet-close=${this._onDetailsClosed}
@@ -735,7 +740,8 @@ export class PvCalendarModule extends LitElement {
           layout=${this.layout}
           .store=${store}
           .hass=${this.hass}
-          .calendars=${calendars}
+          .calendars=${this._mine(calendars)}
+          .gate=${this._gate}
           .open=${true}
           .mode=${this._editor.value.mode}
           .prefill=${this._editor.value.prefill}
@@ -884,10 +890,12 @@ export class PvCalendarModule extends LitElement {
         </div>
 
         <div class="pvc-controls">
-          <button class="pvc-new-btn" type="button" @click=${() => this._pv.store.openCreateDialog()}>
-            <ha-icon icon="mdi:plus"></ha-icon>
-            New event
-          </button>
+          ${this._mine(calendars).length ? html`
+            <button class="pvc-new-btn" type="button" @click=${() => this._pv.store.openCreateDialog()}>
+              <ha-icon icon="mdi:plus"></ha-icon>
+              New event
+            </button>
+          ` : nothing}
 
           <div class="pvc-nav">
             <button class="pvc-nav-btn" type="button" aria-label=${arrows.prev} title=${arrows.prev}
@@ -1023,7 +1031,18 @@ export class PvCalendarModule extends LitElement {
     this._pv.store.selectEvent(eventForPopup(clicked, allEvents));
   }
 
+  /** Who may change events here (D1): the household's rule, read when asked. */
+  private readonly _gate = eventGate(() => ({
+    view: this.household, session: this.session, pinGate: this.pinGate, rows: this.data?.calendars ?? [],
+  }));
+
+  /** The calendars this screen may ever put an event on: a child's own login offers only their own (D1). */
+  private _mine(calendars: CalendarConfig[]): CalendarConfig[] {
+    return calendars.filter(c => this._gate.allowed([c.entity_id]));
+  }
+
   private _onCreateEvent(e: CustomEvent) {
+    if (!this._mine(this._derived().calendars).length) return;
     const date = e.detail?.date as Date | undefined;
     const prefill: Partial<any> = {};
     if (date) {
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index c101c61..c74bf5f 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -7,12 +7,13 @@ import { CalendarConfig, CalendarEvent, CreateEventData } from '../../../types';
 import { CalendarStore, StoreSubscriber } from '../calendar-store';
 import { createEvent, createEventWithAttendees, deleteEvent, updateEvent, refreshPlanaVista, getEventOrganizer } from '../../../utils/ha-utils';
 import {
-  EditRestoreError,
-  EventFormDates,
   buildDeleteData,
   buildEventBase,
   buildRestoreData,
   defaultFormDates,
+  defaultWho,
+  EditRestoreError,
+  EventFormDates,
   formDatesFromEvent,
   formEndDate,
   planEdit,
@@ -33,6 +34,7 @@ import { dateLabel, timeSlots } from '../../../core/pickers';
 import { pickerStyles } from '../../../styles/pickers';
 import { contrastText } from '../../../core/color';
 import { calendarCan, formSignature, saveFailedText } from '../event-words';
+import type { EventGate } from '../event-gate';
 
 
 const DISCARD_ACTIONS: NoticeAction[] = [
@@ -52,6 +54,8 @@ const DISCARD_ACTIONS: NoticeAction[] = [
 export class PVEventCreateDialog extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ type: Array }) calendars: CalendarConfig[] = [];
+  /** Who may change events here (D1): Save asks for a PIN first when this screen needs one. */
+  @property({ attribute: false }) gate?: EventGate;
   @property({ type: Boolean }) open = false;
   @property({ type: String }) mode: 'create' | 'edit' = 'create';
   @property({ type: Object }) prefill: Partial<CalendarEvent> | null = null;
@@ -64,6 +68,8 @@ export class PVEventCreateDialog extends LitElement {
 
   @state() private _title = '';
   @state() private _selectedCalendars: Set<string> = new Set();
+  /** Save is waiting on a PIN (D1). */
+  private _gating = false;
   @state() private _originalCalendars: Set<string> = new Set();
   @state() private _organizerEntityId = '';
   @state() private _date = '';
@@ -527,7 +533,7 @@ export class PVEventCreateDialog extends LitElement {
       } else if (this.prefill.calendar_entity_id) {
         this._selectedCalendars = new Set([this.prefill.calendar_entity_id]);
       } else {
-        this._selectedCalendars = new Set([this.calendars[0]?.entity_id].filter(Boolean));
+        this._selectedCalendars = new Set(defaultWho(this._offered().map(c => c.entity_id)));
       }
       this._originalCalendars = new Set(this._selectedCalendars);
 
@@ -562,9 +568,15 @@ export class PVEventCreateDialog extends LitElement {
     }
   }
 
+  /** The calendars Who offers: a read-only calendar can't take a new event; the event's own calendars stay in an edit. */
+  private _offered(): CalendarConfig[] {
+    return this.calendars.filter(c =>
+      c.visible !== false && (calendarCan(c.attributes).create || this._originalCalendars.has(c.entity_id)));
+  }
+
   private _setDefaults() {
     this._title = '';
-    this._selectedCalendars = new Set();
+    this._selectedCalendars = new Set(defaultWho(this._offered().map(c => c.entity_id)));
     this._originalCalendars = new Set();
     this._organizerEntityId = '';
     this._applyDates(defaultFormDates(new Date()));
@@ -617,9 +629,7 @@ export class PVEventCreateDialog extends LitElement {
   render() {
     if (!this.open) return nothing;
 
-    // A read-only calendar can't take a new event; the event's own calendars stay in an edit.
-    const visibleCalendars = this.calendars.filter(c =>
-      c.visible !== false && (calendarCan(c.attributes).create || this._originalCalendars.has(c.entity_id)));
+    const visibleCalendars = this._offered();
     const isEdit = this.mode === 'edit';
     const heading = isEdit ? 'Edit event' : 'New event';
 
@@ -1183,6 +1193,14 @@ export class PVEventCreateDialog extends LitElement {
       return;
     }
 
+    // An edit changes the calendars it leaves as well as the ones it joins (D1).
+    if (this._gating) return;
+    const touched = this.mode === 'edit' ? new Set([...this._originalCalendars, ...this._selectedCalendars]) : this._selectedCalendars;
+    this._gating = true;
+    const allowed = this.gate ? await this.gate.ask([...touched], this._title) : true;
+    this._gating = false;
+    if (!allowed) return;
+
     this._error = '';
     this._saving = true;
 
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
index 8269fd1..1cf1bd7 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
@@ -14,6 +14,7 @@ import { SheetController } from '../../../shell/sheet-controller';
 import type { NoticeAction } from '../../../shell/pv-notice-sheet';
 import '../../../shell/pv-notice-sheet';
 import { calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen } from '../event-words';
+import { EventGate, calendarsOf } from '../event-gate';
 
 interface Participant {
   entity_id: string;
@@ -39,6 +40,8 @@ function participantsOf(event: CalendarEvent): Participant[] {
 export class PVEventPopup extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ attribute: false }) event: CalendarEvent | null = null;
+  /** Who may change it here (D1); without one, anyone may. */
+  @property({ attribute: false }) gate?: EventGate;
   @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
   /** The calendars shown, for what each one lets PlanaVista change. */
@@ -203,6 +206,8 @@ export class PVEventPopup extends LitElement {
     const calendar = this.calendars.find(c => c.entity_id === event.calendar_entity_id);
     const can = calendarCan(calendar?.attributes);
     const changeable = !!event.uid;
+    const ids = calendarsOf(event);
+    const allowed = this.gate?.allowed(ids) ?? true;
     const question = deleteQuestion(event, shared.length > 1 ? shared.map(p => p.calendar_name) : []);
 
     return html`
@@ -240,15 +245,17 @@ export class PVEventPopup extends LitElement {
         ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
         ${!changeable || (!can.edit && !can.delete) ? html`
           <p class="note">This event can only be changed in its calendar's own app.</p>
+        ` : !allowed ? html`
+          <p class="note">${this.gate?.note(ids)}</p>
         ` : nothing}
 
         <div class="actions">
-          ${changeable && can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
-          ${changeable && can.delete ? html`
+          ${allowed && changeable && can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
+          ${allowed && changeable && can.delete ? html`
             <button class="pv-btn pv-btn-secondary danger apart" type="button" ?disabled=${this._deleting}
-              @click=${() => { this._asking = true; }}>${this._deleting ? 'Deleting…' : 'Delete event'}</button>
+              @click=${this._askDelete}>${this._deleting ? 'Deleting…' : 'Delete event'}</button>
           ` : nothing}
-          <button class="pv-btn pv-btn-secondary ${changeable && can.delete ? 'apart' : ''}" type="button" ?disabled=${this._deleting} @click=${() => void this._sheet.close()}>Done</button>
+          <button class="pv-btn pv-btn-secondary ${allowed && changeable && can.delete ? 'apart' : ''}" type="button" ?disabled=${this._deleting} @click=${() => void this._sheet.close()}>Done</button>
         </div>
       </div>
       ${this._asking ? html`
@@ -291,8 +298,23 @@ export class PVEventPopup extends LitElement {
     else void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.danger')?.focus());
   };
 
-  private _edit() {
-    if (this.event) this.store.openEditDialog(this.event);
+  /** A PIN first when this screen needs one (D1), then the editor. */
+  private async _edit(): Promise<void> {
+    const event = this.event;
+    if (!event || !(await this._mayChange(event))) return;
+    // The sheet may have been handed a fresh copy meanwhile (the minute's refresh); it is the same event.
+    if (this.isConnected && this.event) this.store.openEditDialog(this.event);
+  }
+
+  /** A PIN first when this screen needs one (D1), then the question. */
+  private _askDelete = async (): Promise<void> => {
+    const event = this.event;
+    if (!event || !(await this._mayChange(event))) return;
+    if (this.isConnected && this.event) this._asking = true;
+  };
+
+  private _mayChange(event: CalendarEvent): Promise<boolean> {
+    return this.gate ? this.gate.ask(calendarsOf(event), event.summary ?? '') : Promise.resolve(true);
   }
 
   private async _delete(everyone: boolean) {
```

`custom_components/planavista/frontend/src/modules/calendar/event-gate.ts` (new):

```ts
import { eventAccess, eventPinChoices } from '../../core/access';
import type { HouseholdView } from '../../core/household';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import type { CalendarConfig, CalendarEvent } from '../../types';
import { ownersOf } from './calendar-derive';
import { changeReason, lockedEventNote } from './event-words';

/**
 * Who may change calendar events on this screen (milestone 8, D1), for the
 * details sheet and the editor: whether Edit and Delete show at all, and the
 * PIN to ask for before a change. The card's rule; Home Assistant's own
 * calendar stays as it allows.
 */
export interface EventGate {
  /** Whether this screen may ever change an event on these calendars (Edit and Delete show). */
  allowed(calendarIds: readonly string[]): boolean;
  /** Ask for a PIN when one is needed; true when the change may go ahead. */
  ask(calendarIds: readonly string[], summary: string): Promise<boolean>;
  /** The note under an event this screen may not change. */
  note(calendarIds: readonly string[]): string;
}

export interface GateState {
  view: HouseholdView | null;
  session: Session | null;
  pinGate?: PinGate;
  rows: readonly CalendarConfig[];
}

/** The calendars an event is on: every person's copy, or its own calendar. */
export function calendarsOf(event: CalendarEvent): string[] {
  const shared = (event as { shared_calendars?: Array<{ entity_id: string }> }).shared_calendars ?? [];
  return shared.length ? shared.map(c => c.entity_id) : [event.calendar_entity_id];
}

/** A gate that reads the module's state each time it is asked. */
export function eventGate(state: () => GateState): EventGate {
  return {
    allowed(calendarIds) {
      const { view, session, rows } = state();
      return eventAccess(view, session, ownersOf(calendarIds, rows)) !== 'no';
    },
    async ask(calendarIds, summary) {
      const { view, session, pinGate, rows } = state();
      const owners = ownersOf(calendarIds, rows);
      const access = eventAccess(view, session, owners);
      if (access === 'yes') return true;
      if (access === 'no' || !pinGate) return false;
      const { heading, reason } = changeReason(summary);
      return pinGate.ask(eventPinChoices(view, owners), heading, reason);
    },
    note(calendarIds) {
      const { view, rows } = state();
      const owners = ownersOf(calendarIds, rows);
      const names = owners.length === 1 && owners[0] ? [view?.members.find(m => m.id === owners[0])?.name ?? ''] : [];
      return lockedEventNote(names.filter(Boolean));
    },
  };
}
```

`custom_components/planavista/frontend/src/modules/calendar/event-words.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
index 6b62559..fa5cf9f 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/event-words.ts
@@ -170,3 +170,14 @@ export function formSignature(f: FormFields): string {
 export function saveFailedText(title: string, editing: boolean): string {
   return `Couldn't ${editing ? 'save' : 'add'} ${eventName({ summary: title })}. Check that Home Assistant is reachable, then try again.`;
 }
+
+/** Under an event this login may not change (D1): who can. */
+export function lockedEventNote(ownerNames: readonly string[]): string {
+  return ownerNames.length === 1 ? `Only ${ownerNames[0]} or a parent can change this event.` : 'Only a parent can change this event.';
+}
+
+/** The PIN sheet's question, and the line that says why it is asking. */
+export function changeReason(summary: string): { heading: string; reason: string } {
+  const name = summary.trim() || 'this event';
+  return { heading: `Who's changing ${name}?`, reason: `To change ${name}` };
+}
```

`custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
index e4b0836..9e10f55 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
@@ -284,3 +284,8 @@ export async function runEditWithRestore(steps: {
     );
   }
 }
+
+/** A new event's Who, however it was opened (New event or a day's +): the one calendar offered, or nobody when there is a choice. */
+export function defaultWho(offered: readonly string[]): string[] {
+  return offered.length === 1 ? [offered[0]] : [];
+}
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 31906b5..3bca063 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -54,7 +54,7 @@ import { ContentScrollDetail, HeaderHeights, compactHeader } from '../core/conte
 /** A sheet the card shows over everything: a PIN, or why there is no way in. */
 type CardSheet =
   | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue' | 'keep_setup'; heading: string }
-  | { kind: 'pin'; purpose: 'module'; heading: string; members: Member[]; resolve: (unlocked: boolean) => void }
+  | { kind: 'pin'; purpose: 'module'; heading: string; reason?: string; members: Member[]; resolve: (unlocked: boolean) => void }
   | { kind: 'no_pin' };
 
 const DEFAULT_ENTITY = 'sensor.planavista_config';
@@ -132,13 +132,13 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
 
   /** How a module asks for a PIN: the card's PIN sheet, then the card's session. */
   private readonly _pinGate: PinGate = {
-    ask: (members, heading) => new Promise<boolean>(resolve => {
+    ask: (members, heading, reason) => new Promise<boolean>(resolve => {
       if (members.length === 0 || this._sheet) {
         resolve(false);
         return;
       }
       this._sheetOpener = (this.renderRoot as ShadowRoot | undefined)?.activeElement as HTMLElement | null ?? null;
-      this._sheet = { kind: 'pin', purpose: 'module', heading, members, resolve };
+      this._sheet = { kind: 'pin', purpose: 'module', heading, reason, members, resolve };
     }),
   };
 
@@ -589,6 +589,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         mode="unlock"
         .members=${sheet.purpose === 'module' ? sheet.members : view ? parentsWithPins(view.members) : []}
         .heading=${sheet.heading}
+        .reason=${sheet.purpose === 'module' ? sheet.reason ?? '' : ''}
         .shuffle=${!!view?.security.shuffle_keypad}
         @pv-unlocked=${this._onUnlocked}
         @pv-sheet-close=${this._onSheetCancel}
```

`custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts b/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
index 9b75205..635ed17 100644
--- a/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-pin-sheet.ts
@@ -54,6 +54,8 @@ export class PvPinSheet extends LitElement {
   @property({ attribute: false }) members: Member[] = [];
   /** Unlock mode: the picker's question, such as "Who's opening Settings?". */
   @property({ type: String }) heading = '';
+  /** Unlock mode: why it is asking, under "Blair, enter your PIN" ("To change Team standup"). */
+  @property({ type: String }) reason = '';
   /** Choose mode: whose PIN this is. */
   @property({ attribute: false }) target?: Member;
   @property({ type: Boolean }) shuffle = false;
@@ -320,6 +322,7 @@ export class PvPinSheet extends LitElement {
         : nothing}
       <h2 class="heading" id="pin-heading">${heading}</h2>
       ${this._step === 'choose' ? html`<p class="hint">${pinHint(!!this.target?.parent)}</p>` : nothing}
+      ${this._step === 'enter' && this.reason ? html`<p class="hint">${this.reason}</p>` : nothing}
       <div class="boxes ${this._shake ? 'shake' : ''}" aria-hidden="true">
         ${Array.from({ length: this._entry.length }, (_, i) => html`
           <span class="box ${i < this._entry.digits.length ? 'filled' : ''}"></span>
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1128 passed`; the task's own files `86 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** On the Kitchen screen, Alex's event opens Edit straight away, Blair's asks Blair's PIN, Casey's asks Casey's or Blair's, Team standup (two people) asks a parent's, each with "To change ..."; on Casey's own login only Casey's events offer Edit and New event offers only Casey.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): calendar events follow the household's rule for who may change what

- An event only on your own calendar is yours to change; an event on
  someone else's calendar, on several people's, or on a calendar that
  belongs to nobody needs a parent. A parent's login changes any event.
- On a shared family screen, Edit, Delete, and Save ask for the owner's
  PIN or a parent's when one is needed, and the PIN sheet says why
  ("To change Team standup"). Until a parent has a PIN, events change as
  before.
- A teen's or child's own login sees Edit and Delete only on their own
  events, with a note saying who can change the rest, and New event offers
  only their own calendar.
- New event and a day's + pick the same Who: the one calendar offered, or
  nobody when there is a choice.
- The README says this is PlanaVista's rule; Home Assistant's own calendar
  stays as Home Assistant allows it.
```

---

### Task 11: One color per person in both modules

Spec 3.1.

**Files:**
- Modify: `custom_components/planavista/frontend/src/core/color-swatch-picker.ts`, `custom_components/planavista/frontend/src/core/color.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts`, `custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts`, `custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts`, `custom_components/planavista/frontend/test/calendar-rows.test.ts`, `custom_components/planavista/frontend/test/mode-colors.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/calendar-rows.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/calendar-rows.test.ts b/custom_components/planavista/frontend/test/calendar-rows.test.ts
index 2397a4d..73fb007 100644
--- a/custom_components/planavista/frontend/test/calendar-rows.test.ts
+++ b/custom_components/planavista/frontend/test/calendar-rows.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { belongsTo, buildCalendarRows, toSavedCalendars } from '../src/modules/calendar/calendar-rows';
+import { belongsTo, buildCalendarRows, toSavedCalendars, rowColor } from '../src/modules/calendar/calendar-rows';
 import { Member } from '../src/core/household';
 
 const PRESETS = [{ color: '#001219', light: '#A6ACAF' }, { color: '#005F73', light: '#A6C7CE' }];
@@ -53,3 +53,19 @@ describe('calendar rows', () => {
     expect(belongsTo({ person_entity: '', member_id: 'blair' }, members)).toEqual({ memberId: null, viaPerson: false });
   });
 });
+
+describe("a calendar's color (milestone 8, spec 3.1)", () => {
+  const people = [{ id: 'alex', name: 'Alex', person: 'person.alex', color: '#277DA1' }];
+
+  it("a calendar that belongs to someone shows their color, set in People", () => {
+    const row = { person_entity: '', member_id: 'alex', color: '#F94144', color_light: '#FDBDBE' };
+    expect(rowColor(row, people)).toEqual({ owner: people[0], color: '#277DA1' });
+    const viaPerson = { person_entity: 'person.alex', member_id: null, color: '#F94144', color_light: '#FDBDBE' };
+    expect(rowColor(viaPerson, people).owner).toBe(people[0]);
+  });
+
+  it('a calendar that belongs to nobody keeps its own color and picker', () => {
+    const row = { person_entity: '', member_id: null, color: '#90BE6D', color_light: '#D8E8CC' };
+    expect(rowColor(row, people)).toEqual({ owner: null, color: '#90BE6D' });
+  });
+});
```

`custom_components/planavista/frontend/test/mode-colors.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/mode-colors.test.ts b/custom_components/planavista/frontend/test/mode-colors.test.ts
index aebc1f6..78d576d 100644
--- a/custom_components/planavista/frontend/test/mode-colors.test.ts
+++ b/custom_components/planavista/frontend/test/mode-colors.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { matchedInk, toOklch } from '../src/core/color';
+import { darkTint, lightTint, matchedInk, toOklch } from '../src/core/color';
 import { withModeColors } from '../src/modules/calendar/mode-colors';
 import type { PlanaVistaData } from '../src/types';
 
@@ -24,3 +24,44 @@ describe('withModeColors', () => {
     expect(data.calendars[0].color).toBe('#F94144');
   });
 });
+
+describe('one color per person (milestone 8, spec 3.1)', () => {
+  const linked = {
+    calendars: [
+      { entity_id: 'calendar.test_alex', display_name: 'Alex', color: '#F94144', color_light: '#FDBDBE', member_id: 'alex', visible: true },
+      { entity_id: 'calendar.family', display_name: 'Family', color: '#90BE6D', color_light: '#D8E8CC', member_id: null, visible: true },
+    ],
+    events: [
+      { summary: 'Dentist', start: '', end: '', calendar_entity_id: 'calendar.test_alex', calendar_name: 'Alex', calendar_color: '#F94144', calendar_color_light: '#FDBDBE' },
+      { summary: 'Dinner', start: '', end: '', calendar_entity_id: 'calendar.family', calendar_name: 'Family', calendar_color: '#90BE6D', calendar_color_light: '#D8E8CC' },
+    ],
+    display: {},
+  } as unknown as PlanaVistaData;
+  const people = [{ id: 'alex', color: '#277DA1', color_dark: null }];
+
+  it("a calendar that belongs to someone draws their color and a tint made from it", () => {
+    const light = withModeColors(linked, 'light', people)!;
+    expect(light.calendars[0].color).toBe('#277DA1');
+    expect(light.calendars[0].color_light).toBe(lightTint('#277DA1'));
+    expect(light.events[0].calendar_color).toBe('#277DA1');
+    expect(light.events[0].calendar_color_light).toBe(lightTint('#277DA1'));
+  });
+
+  it('a calendar that belongs to nobody keeps its own color', () => {
+    const light = withModeColors(linked, 'light', people)!;
+    expect(light.calendars[1].color).toBe('#90BE6D');
+    expect(light.events[1].calendar_color_light).toBe('#D8E8CC');
+  });
+
+  it("dark mode brightens a person's color as the board does, their own dark color first", () => {
+    expect(withModeColors(linked, 'dark', people)!.calendars[0].color).toBe(matchedInk('#277DA1'));
+    const chosen = withModeColors(linked, 'dark', [{ id: 'alex', color: '#277DA1', color_dark: '#7FC8F8' }])!;
+    expect(chosen.calendars[0].color).toBe('#7FC8F8');
+    expect(chosen.events[0].calendar_color_light).toBe(darkTint('#277DA1'));
+  });
+
+  it("a person's tint is the swatches' own: 65% of the way to white", () => {
+    expect(lightTint('#001219')).toBe('#a6acaf');
+    expect(lightTint('#F94144')).toBe('#fdbdbe');
+  });
+});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/calendar-rows.test.ts test/mode-colors.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/color-swatch-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/color-swatch-picker.ts b/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
index 661a5ce..91fc973 100644
--- a/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
+++ b/custom_components/planavista/frontend/src/core/color-swatch-picker.ts
@@ -2,27 +2,7 @@ import { LitElement, html, css } from 'lit';
 import { property, state, query } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
 import { baseStyles } from '../styles/shared';
-
-/**
- * Computes the light variant of a hex color by blending toward white at 88%.
- * Formula: channel = channel + (255 - channel) * 0.88
- */
-function computeLightVariant(hex: string): string {
-  let clean = hex.replace('#', '');
-  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
-  if (clean.length !== 6) return hex;
-  const r = parseInt(clean.substring(0, 2), 16);
-  const g = parseInt(clean.substring(2, 4), 16);
-  const b = parseInt(clean.substring(4, 6), 16);
-  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;
-
-  const rLight = Math.round(r + (255 - r) * 0.65);
-  const gLight = Math.round(g + (255 - g) * 0.65);
-  const bLight = Math.round(b + (255 - b) * 0.65);
-
-  const toHex = (n: number) => n.toString(16).padStart(2, '0');
-  return `#${toHex(rLight)}${toHex(gLight)}${toHex(bLight)}`;
-}
+import { lightTint } from './color';
 
 interface Preset {
   name: string;
@@ -99,7 +79,7 @@ export class PvColorSwatchPicker extends LitElement {
   private _onCustomColorChange(e: Event) {
     const input = e.target as HTMLInputElement;
     const color = input.value;
-    const colorLight = computeLightVariant(color);
+    const colorLight = lightTint(color);
     this._isCustom = true;
     this._emit(color, colorLight);
   }
```

`custom_components/planavista/frontend/src/core/color.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/color.ts b/custom_components/planavista/frontend/src/core/color.ts
index 7632ec4..19d4617 100644
--- a/custom_components/planavista/frontend/src/core/color.ts
+++ b/custom_components/planavista/frontend/src/core/color.ts
@@ -127,6 +127,17 @@ export function matchedSurface(hex: string): string {
   return fromOklch({ l: 0.19, c: Math.min(c, 0.02), h });
 }
 
+/**
+ * The pale fill behind someone's events in light mode: their color 65% of the
+ * way to white, as every swatch's own tint is made.
+ */
+export function lightTint(hex: string): string {
+  const rgb = parseHex(hex);
+  if (!rgb) return hex;
+  const channel = (n: number) => Math.round(n + (255 - n) * 0.65).toString(16).padStart(2, '0');
+  return `#${rgb.map(channel).join('')}`;
+}
+
 /** The pale fill behind a person's events in dark mode: their hue, low and quiet. */
 export function darkTint(hex: string): string {
   const { c, h } = toOklch(hex);
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 0f514a3..81e0dd3 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -19,7 +19,7 @@ import { contrastText } from '../../core/color';
 import type { ModuleService } from '../../core/module-registry';
 import { GONE, Presence, nextPresence } from '../../core/sheet-presence';
 import { deepActiveElement } from '../../core/focus';
-import type { HouseholdView } from '../../core/household';
+import type { HouseholdView, Member } from '../../core/household';
 import type { Session } from '../../core/session';
 import type { PinGate } from '../../core/pin-gate';
 import { eventGate } from './event-gate';
@@ -46,6 +46,9 @@ interface EditorWant {
   prefill: Partial<CalendarEvent> | null;
 }
 
+/** Nobody linked yet: one array, so the cached colors aren't worked out again on every render. */
+const NO_PEOPLE: readonly Member[] = [];
+
 /**
  * pv-calendar-module: the calendar's toolbar, its four views, and the event
  * popup and dialog. The shell renders it inside the card and hands it the
@@ -669,16 +672,17 @@ export class PvCalendarModule extends LitElement {
     });
   };
 
-  /** Cached until the data, the card config, the calendar filter, or the mode changes. */
+  /** Cached until the data, the card config, the calendar filter, the mode, or the people change. */
   private _derive = memoizeOne((
     data: PlanaVistaData | null,
     config: PlanaVistaCardConfig | undefined,
     hidden: Set<string>,
     mode: Mode,
-  ): CalendarDerived => deriveCalendarData(withModeColors(data, mode), config, hidden));
+    members: readonly Member[],
+  ): CalendarDerived => deriveCalendarData(withModeColors(data, mode, members), config, hidden));
 
   private _derived(): CalendarDerived {
-    return this._derive(this.data, this.cardConfig, this._pv.store.hiddenCalendars, this.mode);
+    return this._derive(this.data, this.cardConfig, this._pv.store.hiddenCalendars, this.mode, this.household?.members ?? NO_PEOPLE);
   }
 
   render() {
@@ -1027,7 +1031,7 @@ export class PvCalendarModule extends LitElement {
   private _onEventClick(e: CustomEvent) {
     const clicked: CalendarEvent = e.detail.event;
     // The mode's colors, so the popup's people match the views.
-    const allEvents = withModeColors(this.data, this.mode)?.events || [];
+    const allEvents = withModeColors(this.data, this.mode, this.household?.members ?? NO_PEOPLE)?.events || [];
     this._pv.store.selectEvent(eventForPopup(clicked, allEvents));
   }
 
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts
index b1cd0e7..2a50a6c 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-rows.ts
@@ -94,3 +94,16 @@ export function belongsTo(
   const chosen = members.some(m => m.id === row.member_id) ? row.member_id : null;
   return { memberId: chosen, viaPerson: false };
 }
+
+/**
+ * The color a calendar row shows (milestone 8, spec 3.1): its person's, set
+ * in People, when it belongs to someone; its own otherwise.
+ */
+export function rowColor<M extends Pick<Member, 'id' | 'person' | 'color'>>(
+  row: Pick<CalendarRow, 'person_entity' | 'member_id' | 'color'>,
+  members: M[],
+): { owner: M | null; color: string } {
+  const { memberId } = belongsTo(row, members);
+  const owner = members.find(m => m.id === memberId) ?? null;
+  return { owner, color: owner ? owner.color : row.color };
+}
```

`custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts b/custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts
index ad0450a..0cbc05e 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/mode-colors.ts
@@ -1,13 +1,24 @@
+import type { Member } from '../../core/household';
+import { memberColor } from '../../core/household';
+import { darkTint, lightTint } from '../../core/color';
 import type { PlanaVistaData } from '../../types';
 import { Mode, personColors } from '../../styles/theme-pairs';
 
+type Person = Pick<Member, 'id' | 'color' | 'color_dark'>;
+
 /**
- * The data with each person's colors for the mode: as saved in light, and
- * in dark their color brightened and their events on a dark tint (spec 12.4).
- * Light mode hands back the same object, so nothing downstream recomputes.
+ * The data with each person's colors for the mode (spec 12.4; milestone 8,
+ * spec 3.1). A calendar that belongs to someone draws their color, set in
+ * People, with a tint made from it; in dark, their color brightened as the
+ * board does (their own dark color first) on a dark tint. A calendar that
+ * belongs to nobody keeps its own color. With nobody linked, light mode hands
+ * back the same object, so nothing downstream recomputes.
  */
-export function withModeColors(data: PlanaVistaData | null, mode: Mode): PlanaVistaData | null {
-  if (!data || mode === 'light') return data;
+export function withModeColors(data: PlanaVistaData | null, mode: Mode, members: readonly Person[] = []): PlanaVistaData | null {
+  if (!data) return data;
+  const people = new Map(members.map(m => [m.id, m]));
+  const linked = (data.calendars || []).some(cal => cal.member_id && people.has(cal.member_id));
+  if (mode === 'light' && !linked) return data;
   const cache = new Map<string, { color: string; colorLight: string }>();
   const colors = (color: string, light: string | undefined) => {
     const key = `${color}|${light ?? ''}`;
@@ -18,14 +29,22 @@ export function withModeColors(data: PlanaVistaData | null, mode: Mode): PlanaVi
     }
     return found;
   };
+  const byCalendar = new Map<string, { color: string; colorLight: string }>();
+  for (const cal of data.calendars || []) {
+    const person = cal.member_id ? people.get(cal.member_id) : undefined;
+    if (!person) continue;
+    byCalendar.set(cal.entity_id, mode === 'light'
+      ? { color: person.color, colorLight: lightTint(person.color) }
+      : { color: memberColor(person, 'dark'), colorLight: darkTint(person.color) });
+  }
   return {
     ...data,
     calendars: (data.calendars || []).map(cal => {
-      const { color, colorLight } = colors(cal.color, cal.color_light);
+      const { color, colorLight } = byCalendar.get(cal.entity_id) ?? colors(cal.color, cal.color_light);
       return { ...cal, color, color_light: colorLight };
     }),
     events: (data.events || []).map(event => {
-      const { color, colorLight } = colors(event.calendar_color, event.calendar_color_light);
+      const { color, colorLight } = byCalendar.get(event.calendar_entity_id) ?? colors(event.calendar_color, event.calendar_color_light);
       return { ...event, calendar_color: color, calendar_color_light: colorLight };
     }),
   };
```

`custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts b/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
index 264df7c..f4589b3 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/settings/calendars-page.ts
@@ -4,14 +4,14 @@ import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../../utils/define';
 import { animationStyles, baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
 import { settingsPageStyles } from '../../../styles/settings';
-import type { HouseholdView } from '../../../core/household';
+import type { HouseholdView, Member } from '../../../core/household';
 import { HouseholdApi, errorCode } from '../../../core/household-client';
 import type { Layout } from '../../../core/layout';
-import { PAGE_ERROR, saveErrorMessage } from '../../../core/page-host';
+import { PAGE_ERROR, saveErrorMessage, PUSH_PAGE, PushPageDetail } from '../../../core/page-host';
 import { inOrder } from '../../../core/household';
 import { PvColorSwatchPicker } from '../../../core/color-swatch-picker';
 import type { PlanaVistaData } from '../../../types';
-import { CalendarRow, belongsTo, buildCalendarRows, toSavedCalendars } from '../calendar-rows';
+import { CalendarRow, belongsTo, buildCalendarRows, toSavedCalendars, rowColor } from '../calendar-rows';
 
 /**
  * pv-calendar-calendars-page: which calendars show, how each looks, and who
@@ -197,15 +197,7 @@ export class PvCalendarCalendarsPage extends LitElement {
               />
             </div>
 
-            <!-- Color picker -->
-            <div class="cal-field">
-              <label class="pv-label">Color</label>
-              <pv-color-swatch-picker
-                .value=${cal.color}
-                .valueLight=${cal.color_light}
-                @color-change=${(e: CustomEvent) => this._onCalendarColorChange(idx, e)}
-              ></pv-color-swatch-picker>
-            </div>
+            ${this._renderColor(cal, idx)}
 
             <!-- Person entity link -->
             <div class="cal-field">
@@ -231,6 +223,40 @@ export class PvCalendarCalendarsPage extends LitElement {
   }
 
 
+  /** One color per person (milestone 8, spec 3.1): a calendar that belongs to someone shows theirs, set in People. */
+  private _renderColor(cal: CalendarRow, idx: number) {
+    const members = this.household?.available ? inOrder(this.household.members) : [];
+    const { owner } = rowColor(cal, members);
+    if (owner) {
+      return html`
+        <div class="cal-field">
+          <span class="pv-label">Color</span>
+          <div class="cal-owned-color">
+            <span class="cal-color-dot" style="background: ${owner.color}" aria-hidden="true"></span>
+            <span class="cal-owned-name">${owner.name}'s color</span>
+            <button class="pv-btn pv-btn-secondary" type="button"
+              @click=${() => this._openPerson(owner)}>Set in People</button>
+          </div>
+        </div>
+      `;
+    }
+    return html`
+      <div class="cal-field">
+        <label class="pv-label">Color</label>
+        <pv-color-swatch-picker
+          .value=${cal.color}
+          .valueLight=${cal.color_light}
+          @color-change=${(e: CustomEvent) => this._onCalendarColorChange(idx, e)}
+        ></pv-color-swatch-picker>
+      </div>
+    `;
+  }
+
+  private _openPerson(member: Member): void {
+    const detail: PushPageDetail = { tag: 'pv-settings-person', title: member.name, back: 'Calendars', props: { memberId: member.id } };
+    this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
+  }
+
   /** Belongs to: fixed by a linked person who is in the household, else a choice (spec 14.5). */
   private _renderBelongsTo(cal: CalendarRow, idx: number) {
     if (!this.household?.available) return nothing;
@@ -274,6 +300,23 @@ export class PvCalendarCalendarsPage extends LitElement {
         color: var(--pv-text-muted, #9CA3AF);
         margin: 0.5rem 0 0;
       }
+.cal-owned-color {
+        display: flex;
+        flex-wrap: wrap;
+        align-items: center;
+        gap: 10px 12px;
+        min-height: 48px;
+      }
+.cal-color-dot {
+        width: 28px;
+        height: 28px;
+        border-radius: 50%;
+        flex: 0 0 auto;
+      }
+.cal-owned-name {
+        flex: 1 1 auto;
+        font-weight: 600;
+      }
 /* ── Calendar list (page 1) ─────────────────────────────── */
 .calendar-list {
         display: flex;
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1134 passed`; the task's own files `11 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Alex's calendar draws Alex's People color in every view; the Calendars page shows "Alex's color" with Set in People, which opens Alex's page.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one color per person in both modules

- A calendar that belongs to someone draws their color, set in People, with
  a pale tint made from it; dark mode brightens it as the chores board does.
  A calendar that belongs to nobody keeps its own color.
- The Calendars page shows such a calendar's color as the person's, with
  Set in People instead of a second picker.
- The pale tint is made one way everywhere: the color 65% of the way to
  white, as every swatch's own tint.
```

---

### Task 12: One event in every view

Spec 3.3.

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts`, `custom_components/planavista/frontend/test/calendar-derive.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/calendar-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/calendar-derive.test.ts b/custom_components/planavista/frontend/test/calendar-derive.test.ts
index 466de18..89735b2 100644
--- a/custom_components/planavista/frontend/test/calendar-derive.test.ts
+++ b/custom_components/planavista/frontend/test/calendar-derive.test.ts
@@ -1,6 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import {
-  calendarWatchedEntities, deriveCalendarData, eventForPopup, initialView, ownersOf, selectCalendars,
+  calendarWatchedEntities, deriveCalendarData, eventForPopup, groupSameEvents, initialView, ownersOf, sameEventKey, selectCalendars,
 } from '../src/modules/calendar/calendar-derive';
 import type { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';
 
@@ -41,15 +41,26 @@ describe('deriveCalendarData', () => {
     expect(deriveCalendarData(d, card(), new Set(['calendar.test_blair'])).visibleEvents.map(e => e.uid)).toEqual(['a']);
   });
 
-  it('groups shared events by uid, once per calendar, and skips events without a uid', () => {
+  it("groups the copies of one event (same title and times), once per calendar, whatever their ids (milestone 8)", () => {
     const d = data([cal('calendar.test_alex', 'person.alex'), cal('calendar.test_blair')], [
-      ev('calendar.test_alex', 'dinner'), ev('calendar.test_blair', 'dinner'), ev('calendar.test_alex', 'dinner'), ev('calendar.test_alex'),
+      ev('calendar.test_alex', 'dinner'), ev('calendar.test_blair', 'its-own'), ev('calendar.test_alex', 'dinner'), ev('calendar.test_alex'),
+      { ...ev('calendar.test_blair', 'later'), start: '2026-10-14T18:00:00-05:00', end: '2026-10-14T19:00:00-05:00' },
     ]);
     const map = deriveCalendarData(d, card(), new Set()).sharedEventMap;
-    expect([...map.keys()]).toEqual(['dinner']);
-    expect(map.get('dinner')!.map(p => [p.entity_id, p.person_entity])).toEqual([
+    const key = sameEventKey(ev('calendar.test_alex'));
+    expect(map.get(key)!.map(p => [p.entity_id, p.person_entity])).toEqual([
       ['calendar.test_alex', 'person.alex'], ['calendar.test_blair', ''],
     ]);
+    expect(map.get(sameEventKey({ ...ev('calendar.test_blair'), start: '2026-10-14T18:00:00-05:00', end: '2026-10-14T19:00:00-05:00' }))!.length).toBe(1);
+  });
+
+  it("puts the copies of one event together, in order, for Day's all-day row", () => {
+    const trip = (calendar: string) => ({ ...ev(calendar), summary: 'Weekend trip' });
+    const groups = groupSameEvents([trip('calendar.test_alex'), ev('calendar.test_alex'), trip('calendar.test_blair')]);
+    expect(groups.map(g => g.map(e => `${e.summary} ${e.calendar_entity_id}`))).toEqual([
+      ['Weekend trip calendar.test_alex', 'Weekend trip calendar.test_blair'],
+      ['Dinner calendar.test_alex'],
+    ]);
   });
 });
 
@@ -96,6 +107,12 @@ describe('eventForPopup (what the event popup opens with)', () => {
     expect(people(eventForPopup(merged, [merged, ev('calendar.test_casey', 'two')]))).toEqual([{ ...blair, uid: 'one' }, { ...casey, uid: 'two' }]);
   });
 
+  it("finds the other copies of an event by its title and times, as Week merges them, so Day's lanes open the same details (milestone 8)", () => {
+    const a = ev('calendar.test_blair', 'one');
+    const b = ev('calendar.test_casey', 'two');
+    expect(people(eventForPopup(a, [a, b]))).toEqual([{ ...blair, uid: 'one' }, { ...casey, uid: 'two' }]);
+  });
+
   it('leaves an event on one calendar as it is', () => {
     const a = ev('calendar.test_blair', 'alone');
     expect(eventForPopup(a, [a])).toBe(a);
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/calendar-derive.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
index 0478290..25cd78d 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-derive.ts
@@ -1,6 +1,6 @@
 import type { CalendarConfig, CalendarEvent, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
 import { selectCalendars } from '../../core/calendars';
-import { filterVisibleEvents } from './utils/event-utils';
+import { filterVisibleEvents, sameEventKey } from './utils/event-utils';
 
 /** A calendar that shares an event (same UID), for Day-view participant avatars. */
 export interface SharedParticipant {
@@ -17,7 +17,7 @@ export interface CalendarDerived {
   sharedEventMap: Map<string, SharedParticipant[]>;
 }
 
-export { selectCalendars };
+export { sameEventKey, selectCalendars };
 
 /** The calendars, the events the filter leaves visible, and the shared-event map. */
 export function deriveCalendarData(
@@ -28,13 +28,12 @@ export function deriveCalendarData(
   const calendars = selectCalendars(data, config);
   const events = data?.events || [];
 
-  // Group all events by UID to find shared events (Day-view participant avatars).
+  // The copies of one event on several calendars, by the same key every view merges by (Day-view participant avatars).
   const sharedEventMap = new Map<string, SharedParticipant[]>();
   for (const ev of events) {
-    const uid = ev.uid;
-    if (!uid) continue;
-    if (!sharedEventMap.has(uid)) sharedEventMap.set(uid, []);
-    const arr = sharedEventMap.get(uid)!;
+    const key = sameEventKey(ev);
+    if (!sharedEventMap.has(key)) sharedEventMap.set(key, []);
+    const arr = sharedEventMap.get(key)!;
     const eid = ev.calendar_entity_id;
     // Deduplicate by calendar entity (recurring events share UIDs)
     if (!arr.some(p => p.entity_id === eid)) {
@@ -113,9 +112,43 @@ export function eventForPopup(clicked: CalendarEvent, allEvents: CalendarEvent[]
     }));
     return { ...clicked, shared_calendars: shared } as CalendarEvent;
   }
+  // Day draws each copy in its person's lane: the others are found as Week merges them.
+  const key = sameEventKey(clicked);
+  const copies = onePerCalendar(allEvents.filter(ev => sameEventKey(ev) === key));
+  if (copies.length > 1) {
+    const shared: PopupParticipant[] = copies.map(s => ({
+      entity_id: s.calendar_entity_id,
+      calendar_name: s.calendar_name,
+      calendar_color: s.calendar_color,
+      uid: s.uid,
+      recurrence_id: s.recurrence_id,
+    }));
+    return { ...clicked, shared_calendars: shared } as CalendarEvent;
+  }
   return clicked;
 }
 
+function onePerCalendar(events: CalendarEvent[]): CalendarEvent[] {
+  const seen = new Set<string>();
+  return events.filter(ev => {
+    if (seen.has(ev.calendar_entity_id)) return false;
+    seen.add(ev.calendar_entity_id);
+    return true;
+  });
+}
+
+/** The copies of each event together, in the order the events first appear (Day's all-day row: one pill per event). */
+export function groupSameEvents(events: readonly CalendarEvent[]): CalendarEvent[][] {
+  const groups = new Map<string, CalendarEvent[]>();
+  for (const ev of events) {
+    const key = sameEventKey(ev);
+    const group = groups.get(key);
+    if (group) group.push(ev);
+    else groups.set(key, [ev]);
+  }
+  return [...groups.values()];
+}
+
 export function calendarWatchedEntities(calendars: CalendarConfig[]): string[] {
   return calendars.map(c => c.person_entity).filter(id => !!id);
 }
```

`custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
index 1cf1bd7..18316ab 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-popup.ts
@@ -80,21 +80,7 @@ export class PVEventPopup extends LitElement {
         outline: none;
       }
 
-      .who {
-        display: flex;
-        align-items: center;
-        gap: 8px;
-        margin: 6px 0 0;
-        color: var(--pv-text-secondary, #5F6670);
-        font-weight: 600;
-      }
 
-      .dot {
-        width: 10px;
-        height: 10px;
-        border-radius: 50%;
-        flex-shrink: 0;
-      }
 
       .people {
         display: flex;
@@ -201,6 +187,10 @@ export class PVEventPopup extends LitElement {
     const event = this.event;
     if (!event) return nothing;
     const shared = participantsOf(event);
+    // Everyone it is for, as chips, the same way in every view (even for one person).
+    const people = shared.length
+      ? shared
+      : [{ entity_id: event.calendar_entity_id, calendar_name: event.calendar_name, calendar_color: event.calendar_color }];
     const when = eventWhen(event, this.timeFormat, this.now);
     const status = eventStatus(event, this.now);
     const calendar = this.calendars.find(c => c.entity_id === event.calendar_entity_id);
@@ -215,18 +205,14 @@ export class PVEventPopup extends LitElement {
       <div class="panel" role="dialog" aria-modal="true" aria-labelledby="event-title" @keydown=${this._sheet.onKeydown}>
         <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
         <h2 class="heading" id="event-title" tabindex="-1">${event.summary?.trim() || 'Untitled event'}</h2>
-        ${shared.length > 1 ? html`
-          <div class="people">
-            ${shared.map(p => html`
-              <span class="person" style="background: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}">
-                ${p.calendar_name}
-                ${p.entity_id === this._organizerEntityId ? html`<span class="tag">Organizer</span>` : nothing}
-              </span>
-            `)}
-          </div>
-        ` : html`
-          <div class="who"><span class="dot" style="background: ${event.calendar_color}"></span>${event.calendar_name}</div>
-        `}
+        <div class="people">
+          ${people.map(p => html`
+            <span class="person" style="background: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}">
+              ${p.calendar_name}
+              ${people.length > 1 && p.entity_id === this._organizerEntityId ? html`<span class="tag">Organizer</span>` : nothing}
+            </span>
+          `)}
+        </div>
         ${status ? html`<div class="status"><span class="badge ${status.tone}">${status.words}</span></div>` : nothing}
 
         <div class="rows">
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 9e8278d..77b1f9d 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -5,7 +5,7 @@ import { defineElement } from '../../../utils/define';
 import { HomeAssistant } from 'custom-card-helpers';
 import { CalendarEvent, CalendarConfig } from '../../../types';
 import { baseStyles, eventStyles, nowIndicatorStyles, animationStyles } from '../../../styles/shared';
-import { formatTime } from '../../../utils/date-utils';
+import { formatTime, parseEventDate } from '../../../utils/date-utils';
 import {
   isAllDayEvent,
   isEventPast,
@@ -18,9 +18,17 @@ import {
 import { getPersonAvatar, getPersonName } from '../../../utils/ha-utils';
 import { contrastText } from '../../../core/color';
 import { stripStart } from '../../../core/people-strip';
+import { groupSameEvents, sameEventKey } from '../calendar-derive';
 import type { Layout } from '../../../core/layout';
 import { HOUR_PX, dayHourHeight, rescaleScroll } from '../layout-rules';
 
+/** Enough of a person to draw their face on an event. */
+interface FaceOf {
+  calendar_name: string;
+  calendar_color: string;
+  person_entity: string;
+}
+
 /** Today's chore progress for one person (spec 13.9: rings in the Day view). */
 export type ProgressOf = (memberId: string) => { done: number; pending: number; due: number } | null;
 
@@ -149,7 +157,11 @@ export class PVViewDay extends LitElement {
       }
 
       .all-day-pill {
-        display: block;
+        display: inline-flex;
+        align-items: center;
+        gap: 6px;
+        max-width: 100%;
+        box-sizing: border-box;
         min-width: 0;
         padding: 6px 14px;
         border-radius: 9999px;
@@ -163,6 +175,26 @@ export class PVViewDay extends LitElement {
         box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
       }
 
+      .all-day-name {
+        min-width: 0;
+        overflow: hidden;
+        text-overflow: ellipsis;
+      }
+
+      .all-day-pill .event-participants {
+        margin-top: 0;
+        flex-shrink: 0;
+      }
+
+      /* On the pill, a ring in the pill's ink keeps the face of the person whose color it is visible. */
+      .all-day-pill .event-participant-initial,
+      .all-day-pill .event-participant-avatar {
+        width: 20px;
+        height: 20px;
+        border-color: currentColor;
+        font-size: 0.5625rem;
+      }
+
       .all-day-chip.past .all-day-pill { opacity: 0.45; }
 
       .all-day-chip:hover .all-day-pill {
@@ -339,6 +371,8 @@ export class PVViewDay extends LitElement {
         position: absolute;
         left: 3px;
         right: 3px;
+        /* Its width is the lane's less the gaps, padding and accent included, so it never runs into the next lane. */
+        box-sizing: border-box;
         padding: 6px 10px;
         border-radius: var(--pv-radius-sm, 4px);
         border-left: 3px solid var(--event-color);
@@ -380,6 +414,39 @@ export class PVViewDay extends LitElement {
         margin-top: 2px;
       }
 
+      /* As on Week's chips: everyone's faces at the top right, so a short event keeps them in view. */
+      .positioned-event .event-participants {
+        position: absolute;
+        top: 6px;
+        right: 6px;
+        margin: 0;
+      }
+
+      .positioned-event.brief {
+        display: flex;
+        align-items: baseline;
+        gap: 8px;
+        padding-top: 4px;
+        padding-bottom: 4px;
+      }
+
+      .positioned-event.brief .event-title {
+        min-width: 0;
+        overflow: hidden;
+        text-overflow: ellipsis;
+        white-space: nowrap;
+      }
+
+      .positioned-event.brief .event-time {
+        margin-top: 0;
+        flex-shrink: 0;
+      }
+
+      .positioned-event.shared .event-title,
+      .positioned-event.shared .event-time {
+        padding-right: 40px;
+      }
+
       .event-participant-avatar {
         width: 18px;
         height: 18px;
@@ -688,6 +755,34 @@ export class PVViewDay extends LitElement {
     });
   }
 
+  /** Who an event is for, as one copy's calendar names them. */
+  private _participant(event: CalendarEvent, calendars: CalendarConfig[]): FaceOf {
+    const cal = calendars.find(c => c.entity_id === event.calendar_entity_id);
+    return {
+      calendar_name: event.calendar_name || cal?.display_name || '',
+      calendar_color: event.calendar_color || cal?.color || '',
+      person_entity: cal?.person_entity || '',
+    };
+  }
+
+  /** The faces of everyone an event is for: their photo, or their initial on their color. */
+  private _faces(people: readonly FaceOf[]) {
+    return html`
+      <div class="event-participants">
+        ${people.map(p => {
+          const avatar = p.person_entity ? getPersonAvatar(this.hass, p.person_entity) : null;
+          const name = p.person_entity ? getPersonName(this.hass, p.person_entity) : p.calendar_name;
+          return avatar
+            ? html`<img class="event-participant-avatar" src="${avatar}" alt="${name}"
+                style="--participant-color: ${p.calendar_color}" />`
+            : html`<div class="event-participant-initial"
+                style="background: ${p.calendar_color}; --participant-color: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}"
+              >${name[0]?.toUpperCase() || '?'}</div>`;
+        })}
+      </div>
+    `;
+  }
+
   render() {
     const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
     const dateStart = new Date(this.currentDate);
@@ -743,15 +838,23 @@ export class PVViewDay extends LitElement {
           <div class="all-day-section ${allDayEvents.some(e => keyOf(e) === chosenKey) ? '' : 'none-chosen'}">
             <div class="all-day-gutter">All day</div>
             <div class="all-day-events">
-              ${allDayEvents.map(e => html`
-                <div
-                  class="all-day-chip${isEventPast(e) ? ' past' : ''}${keyOf(e) !== chosenKey ? ' other' : ''}"
-                  role="button"
-                  tabindex="0"
-                  @click=${() => this._onEventClick(e)}
-                  @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, e)}
-                ><span class="all-day-pill" style="background: ${e.calendar_color}; color: ${contrastText(e.calendar_color)}">${e.summary}</span></div>
-              `)}
+              ${groupSameEvents(allDayEvents).map(copies => {
+                // One pill per event, with everyone's faces when it is on several calendars (spec 3.3).
+                const e = copies.find(c => keyOf(c) === chosenKey) ?? copies[0];
+                const mine = copies.some(c => keyOf(c) === chosenKey);
+                return html`
+                  <div
+                    class="all-day-chip${isEventPast(e) ? ' past' : ''}${mine ? '' : ' other'}"
+                    role="button"
+                    tabindex="0"
+                    @click=${() => this._onEventClick(e)}
+                    @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, e)}
+                  ><span class="all-day-pill" style="background: ${e.calendar_color}; color: ${contrastText(e.calendar_color)}">
+                    <span class="all-day-name">${e.summary}</span>
+                    ${copies.length > 1 ? this._faces(copies.map(c => this._participant(c, visibleCalendars))) : nothing}
+                  </span></div>
+                `;
+              })}
             </div>
           </div>
         ` : nothing}
@@ -946,12 +1049,14 @@ export class PVViewDay extends LitElement {
             : '3px';
 
           // Check if this is a shared event with multiple participants
-          const sharedInfo = event.uid ? this.sharedEventMap.get(event.uid) : undefined;
+          const sharedInfo = this.sharedEventMap.get(sameEventKey(event));
           const isShared = sharedInfo && sharedInfo.length > 1;
+          // Under 45 minutes, the title and time share one line so the chip fits its slot.
+          const brief = parseEventDate(event.end).getTime() - parseEventDate(event.start).getTime() < 45 * 60_000;
 
           return html`
             <div
-              class="positioned-event${isEventPast(event) ? ' past' : ''}"
+              class="positioned-event${isEventPast(event) ? ' past' : ''}${isShared ? ' shared' : ''}${brief ? ' brief' : ''}"
               style="
                 top: ${pos.top}%;
                 height: ${pos.height}%;
@@ -968,23 +1073,7 @@ export class PVViewDay extends LitElement {
             >
               <div class="event-title">${event.summary}</div>
               <div class="event-time">${formatTime(event.start, this.timeFormat)}</div>
-              ${isShared ? html`
-                <div class="event-participants">
-                  ${sharedInfo!.map(p => {
-                    const avatar = p.person_entity ? getPersonAvatar(this.hass, p.person_entity) : null;
-                    const name = p.person_entity
-                      ? getPersonName(this.hass, p.person_entity)
-                      : p.calendar_name;
-                    return avatar
-                      ? html`<img class="event-participant-avatar"
-                          src="${avatar}" alt="${name}"
-                          style="--participant-color: ${p.calendar_color}" />`
-                      : html`<div class="event-participant-initial"
-                          style="background: ${p.calendar_color}; --participant-color: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}"
-                        >${name[0]?.toUpperCase() || '?'}</div>`;
-                  })}
-                </div>
-              ` : nothing}
+              ${isShared ? this._faces(sharedInfo!) : nothing}
             </div>
           `;
         })}
```

`custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts b/custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts
index dfeaf3f..6ee24c3 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/utils/event-utils.ts
@@ -14,6 +14,15 @@ export interface SharedEvent extends CalendarEvent {
   }>;
 }
 
+/**
+ * One event's copies on several people's calendars share this key: the same
+ * title and times (each copy keeps its own uid). Every view merges by it
+ * (milestone 8, spec 3.3).
+ */
+export function sameEventKey(event: Pick<CalendarEvent, 'summary' | 'start' | 'end'>): string {
+  return `${event.summary}|${event.start}|${event.end}`;
+}
+
 export function deduplicateSharedEvents(
   events: CalendarEvent[],
   calendars: CalendarConfig[]
@@ -22,8 +31,7 @@ export function deduplicateSharedEvents(
   const eventMap = new Map<string, SharedEvent>();
 
   for (const event of events) {
-    // Key: summary + start + end (normalized)
-    const key = `${event.summary}|${event.start}|${event.end}`;
+    const key = sameEventKey(event);
 
     if (eventMap.has(key)) {
       // Add this calendar as a participant
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1136 passed`; the task's own files `15 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Tapping Team standup in either lane of the Day view lists Blair and Casey and offers Delete for everyone or Remove someone; Weekend trip is one all-day pill with both faces; lane chips stay inside their lanes.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): one event in every view

- An event on several people's calendars is one event everywhere: the Day
  view finds its copies the way Week merges them, so tapping it in any
  lane opens the same details, with everyone it is for and Delete for
  everyone or Remove someone.
- Day's all-day row shows one pill per event with everyone's faces.
- The details sheet names everyone the event is for as people chips, even
  for one person.
- Day's event chips stay inside their lane, keep everyone's faces at the
  top right, and short events put the title and time on one line.
```

---

### Task 13: All-day events pick a start and an end date

Spec 3.4.

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`, `custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`, `custom_components/planavista/frontend/test/event-form.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/event-form.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/event-form.test.ts b/custom_components/planavista/frontend/test/event-form.test.ts
index 9334d41..9bc894c 100644
--- a/custom_components/planavista/frontend/test/event-form.test.ts
+++ b/custom_components/planavista/frontend/test/event-form.test.ts
@@ -12,6 +12,8 @@ import {
   withStartTime,
   type EventFormDates,
   defaultWho,
+  withAllDayEnd,
+  withAllDayStart,
 } from '../src/modules/calendar/utils/event-form';
 
 describe('calendarDaysBetween', () => {
@@ -246,3 +248,30 @@ describe("a new event's Who (milestone 8)", () => {
     expect(defaultWho([])).toEqual([]);
   });
 });
+
+describe('all-day events over several days (milestone 8, spec 3.4)', () => {
+  const friday = { date: '2026-10-16', allDay: true, startTime: '09:00', endTime: '10:00', spanDays: 1, endDayOffset: 0 };
+
+  it("a trip from Friday to Sunday is one event, with Home Assistant's end the day after", () => {
+    const trip = withAllDayEnd(friday, '2026-10-18');
+    expect(trip.spanDays).toBe(3);
+    expect(formEndDate(trip)).toBe('2026-10-18');
+    expect(buildDatePayload(trip)).toEqual({ start_date: '2026-10-16', end_date: '2026-10-19' });
+  });
+
+  it('editing shows the last day and keeps both days', () => {
+    const f = formDatesFromEvent('2026-10-16', '2026-10-19');
+    expect(f.spanDays).toBe(3);
+    expect(formEndDate(f)).toBe('2026-10-18');
+  });
+
+  it('a new start moves the end along, so the trip keeps its length', () => {
+    const moved = withAllDayStart(withAllDayEnd(friday, '2026-10-18'), '2026-10-23');
+    expect(moved.date).toBe('2026-10-23');
+    expect(formEndDate(moved)).toBe('2026-10-25');
+  });
+
+  it('an end before the start is the start day', () => {
+    expect(withAllDayEnd(friday, '2026-10-14').spanDays).toBe(1);
+  });
+});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/event-form.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
index c74bf5f..7e09ed9 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/event-create-dialog.ts
@@ -20,6 +20,8 @@ import {
   runEditWithRestore,
   validateFormDates,
   withEndTime,
+  withAllDayEnd,
+  withAllDayStart,
   withStartTime,
 } from '../utils/event-form';
 import { baseStyles, buttonStyles, formStyles, animationStyles } from '../../../styles/shared';
@@ -92,6 +94,8 @@ export class PVEventCreateDialog extends LitElement {
 
   // Date picker state
   @state() private _datePickerOpen = false;
+  /** Which date the month grid is picking: the start, or an all-day event's last day (spec 3.4). */
+  @state() private _dateTarget: 'start' | 'end' = 'start';
   @state() private _pickerMonth = 0;
   @state() private _pickerYear = 0;
 
@@ -120,6 +124,7 @@ export class PVEventCreateDialog extends LitElement {
   @query('#title-input') private _titleInput?: HTMLInputElement;
   @query('.location-input') private _locationInput?: HTMLInputElement;
   @query('.date-display') private _dateDisplay?: HTMLElement;
+  @query('.end-date-display') private _endDateDisplay?: HTMLElement;
   @query('.start-time-display') private _startTimeEl?: HTMLElement;
   @query('.end-time-display') private _endTimeEl?: HTMLElement;
 
@@ -612,14 +617,13 @@ export class PVEventCreateDialog extends LitElement {
     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
   }
 
-  /** "Through Mon, Oct 12 (3 days)" / "Ends Sat, Oct 10" for events that run past the start date. */
+  /** "Ends Sat, Oct 10" for a timed event that runs past midnight (an all-day event shows its Ends date). */
   private _renderEndsHint() {
     const f = this._formDates;
-    const multiDay = f.allDay ? f.spanDays > 1 : f.endDayOffset > 0;
-    if (!multiDay) return nothing;
+    if (f.allDay || f.endDayOffset <= 0) return nothing;
     const [y, m, d] = formEndDate(f).split('-').map(Number);
     const label = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
-    return html`<div class="ends-hint">${f.allDay ? `Through ${label} (${f.spanDays} days)` : `Ends ${label}`}</div>`;
+    return html`<div class="ends-hint">Ends ${label}</div>`;
   }
 
   private _formatDateDisplay(): string {
@@ -692,11 +696,24 @@ export class PVEventCreateDialog extends LitElement {
               </div>
             </div>
 
-            <div class="form-field">
-              <label class="pv-label" for="date-button">Date</label>
-              ${this._renderDatePicker()}
-              ${this._renderEndsHint()}
-            </div>
+            ${this._allDay ? html`
+              <div class="form-row">
+                <div class="form-field">
+                  <label class="pv-label" for="date-button">Starts</label>
+                  ${this._renderDatePicker()}
+                </div>
+                <div class="form-field">
+                  <label class="pv-label" for="end-date-button">Ends</label>
+                  ${this._renderEndDatePicker()}
+                </div>
+              </div>
+            ` : html`
+              <div class="form-field">
+                <label class="pv-label" for="date-button">Date</label>
+                ${this._renderDatePicker()}
+                ${this._renderEndsHint()}
+              </div>
+            `}
 
             <div class="all-day-row" @click=${this._toggleAllDay}>
               <span class="all-day-label" id="all-day-label">All day</span>
@@ -801,7 +818,7 @@ export class PVEventCreateDialog extends LitElement {
   private _closePickers(refocus = true): boolean {
     const open = this._datePickerOpen || this._activeTimePicker !== null || this._locationSuggestions.length > 0;
     if (!open) return false;
-    const field = this._datePickerOpen ? this._dateDisplay
+    const field = this._datePickerOpen ? (this._dateTarget === 'end' ? this._endDateDisplay : this._dateDisplay)
       : this._activeTimePicker === 'start' ? this._startTimeEl
         : this._activeTimePicker === 'end' ? this._endTimeEl
           : this._locationInput;
@@ -851,7 +868,7 @@ export class PVEventCreateDialog extends LitElement {
     return html`
       <div class="date-picker-wrap">
         <button type="button" id="date-button" class="date-display"
-          aria-expanded=${this._datePickerOpen ? 'true' : 'false'} @click=${this._toggleDatePicker}>
+          aria-expanded=${this._datePickerOpen && this._dateTarget === 'start' ? 'true' : 'false'} @click=${() => this._toggleDatePicker('start')}>
           <ha-icon icon="mdi:calendar"></ha-icon>
           ${this._formatDateDisplay()}
         </button>
@@ -859,10 +876,24 @@ export class PVEventCreateDialog extends LitElement {
     `;
   }
 
+  /** An all-day event's last day (Home Assistant stores the day after). */
+  private _renderEndDatePicker() {
+    return html`
+      <div class="date-picker-wrap">
+        <button type="button" id="end-date-button" class="date-display end-date-display"
+          aria-expanded=${this._datePickerOpen && this._dateTarget === 'end' ? 'true' : 'false'} @click=${() => this._toggleDatePicker('end')}>
+          <ha-icon icon="mdi:calendar"></ha-icon>
+          ${this._date ? dateLabel(formEndDate(this._formDates)) : 'Pick a date'}
+        </button>
+      </div>
+    `;
+  }
+
   private _renderDatePickerDropdown() {
     if (!this._datePickerOpen) return nothing;
 
-    const el = this._dateDisplay;
+    const end = this._dateTarget === 'end';
+    const el = end ? this._endDateDisplay : this._dateDisplay;
     if (!el) return nothing;
     const rect = el.getBoundingClientRect();
 
@@ -880,7 +911,9 @@ export class PVEventCreateDialog extends LitElement {
         @keydown=${this._sheet.onKeydown}
       >
         ${monthGrid({
-          year: this._pickerYear, month: this._pickerMonth, selected: this._date,
+          year: this._pickerYear, month: this._pickerMonth,
+          selected: end ? formEndDate(this._formDates) : this._date,
+          min: end ? this._date : undefined,
           onPick: day => this._selectPickerDay(day),
           onPrev: () => this._pickerPrevMonth(),
           onNext: () => this._pickerNextMonth(),
@@ -889,11 +922,13 @@ export class PVEventCreateDialog extends LitElement {
     `;
   }
 
-  private _toggleDatePicker() {
+  private _toggleDatePicker(target: 'start' | 'end' = 'start') {
     this._activeTimePicker = null;
-    this._datePickerOpen = !this._datePickerOpen;
-    if (this._datePickerOpen && this._date) {
-      const [y, m] = this._date.split('-').map(Number);
+    this._datePickerOpen = !(this._datePickerOpen && this._dateTarget === target);
+    this._dateTarget = target;
+    const shown = target === 'end' ? formEndDate(this._formDates) : this._date;
+    if (this._datePickerOpen && shown) {
+      const [y, m] = shown.split('-').map(Number);
       this._pickerYear = y;
       this._pickerMonth = m - 1;
     }
@@ -922,9 +957,12 @@ export class PVEventCreateDialog extends LitElement {
   }
 
   private _selectPickerDay(day: string) {
-    this._date = day;
+    const end = this._dateTarget === 'end';
+    // A new start keeps the event's length; a new last day changes it (spec 3.4).
+    if (end) this._spanDays = withAllDayEnd(this._formDates, day).spanDays;
+    else this._date = withAllDayStart(this._formDates, day).date;
     this._datePickerOpen = false;
-    this._focusAfterUpdate(() => this._dateDisplay ?? null);
+    this._focusAfterUpdate(() => (end ? this._endDateDisplay : this._dateDisplay) ?? null);
   }
 
   // ==================================================================
```

`custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
index 9e10f55..1451b14 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/utils/event-form.ts
@@ -118,6 +118,19 @@ export function formEndDate(f: EventFormDates): string {
     : shiftDateKey(f.date, f.endDayOffset);
 }
 
+/** An all-day event's new first day (milestone 8, spec 3.4): the end moves along, so it keeps its length. */
+export function withAllDayStart(f: EventFormDates, date: string): EventFormDates {
+  return { ...f, date };
+}
+
+/** An all-day event's last day, as the editor's Ends shows it; Home Assistant's end is the day after. Never before the start. */
+export function withAllDayEnd(f: EventFormDates, lastDay: string): EventFormDates {
+  const [y, m, d] = f.date.split('-').map(Number);
+  const [ly, lm, ld] = lastDay.split('-').map(Number);
+  const days = calendarDaysBetween(new Date(y, m - 1, d), new Date(ly, lm - 1, ld));
+  return { ...f, spanDays: Math.max(1, days + 1) };
+}
+
 /** Error text for invalid dates, or null when the form can be saved. */
 export function validateFormDates(f: EventFormDates): string | null {
   if (!isDateOnly(f.date)) return 'Pick a date.';
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1140 passed`; the task's own files `35 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** A trip Friday to Sunday is stored with end_date the Monday, reopens with both days, and deletes cleanly (on a Test calendar).

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): all-day events pick a start and an end date

- With All day on, the editor shows Starts and Ends dates on the shared
  month grid, so a trip from Friday to Sunday is one event; editing keeps
  both days.
- Ends shows the last day (Home Assistant stores the day after) and never
  comes before the start; a new start keeps the event's length.
```

---

### Task 14: The board says what happened, and diagnostics keep the last refusals

Spec 3.5.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/recent-checkoffs.ts`, `custom_components/planavista/frontend/test/recent-checkoffs.test.ts`, `custom_components/planavista/refusals.py`
- Modify: `custom_components/planavista/chores/websocket.py`, `custom_components/planavista/diagnostics.py`, `custom_components/planavista/frontend/src/modules/chores/board-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts`, `custom_components/planavista/frontend/test/board-derive.test.ts`, `custom_components/planavista/frontend/test/options-derive.test.ts`, `custom_components/planavista/frontend/test/rewards-derive.test.ts`, `custom_components/planavista/frontend/test/sheets.test.ts`, `custom_components/planavista/household/websocket.py`, `tests/test_chores_privacy.py`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/board-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/board-derive.test.ts b/custom_components/planavista/frontend/test/board-derive.test.ts
index ebc1c1a..8c9a163 100644
--- a/custom_components/planavista/frontend/test/board-derive.test.ts
+++ b/custom_components/planavista/frontend/test/board-derive.test.ts
@@ -57,7 +57,7 @@ describe('bandAt (the engine\'s bands, spec 8.4)', () => {
 });
 
 describe('columnFor (spec 13.1)', () => {
-  it('puts Now first, then later bands, This week, Done today, and past bands as credit', () => {
+  it('puts Now first, then later bands, This week, Done today (every check-off today, milestone 8), and past bands as credit', () => {
     const casey_items = [
       item('cat_care|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: { id: 'c', done_by: 'casey', by: 'casey', at: '2026-10-13T07:30:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
       item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', due_day: '2026-10-18' }),
@@ -71,6 +71,7 @@ describe('columnFor (spec 13.1)', () => {
       'head:Now · afternoon', 'now:fix_it',
       'head:Later · evening', 'later:take_out_the_trash', 'later:cat_care',
       'head:This week', 'week:clean_the_bathroom', 'week:yard_work',
+      'head:Done today', 'done:cat_care',
       'credit:Morning · 1 done',
     ]);
     expect(col.line).toBe('1 of 3 today · ★ 23 · 🔥 5 days');
```

`custom_components/planavista/frontend/test/options-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/options-derive.test.ts b/custom_components/planavista/frontend/test/options-derive.test.ts
index 20315ce..f201f70 100644
--- a/custom_components/planavista/frontend/test/options-derive.test.ts
+++ b/custom_components/planavista/frontend/test/options-derive.test.ts
@@ -2,14 +2,16 @@ import { describe, expect, it } from 'vitest';
 import {
   addDays,
   chipLabel,
+  creditedText,
   dayWords,
   dueChips,
   historyLines,
   itemOptions,
   moreTimeChips,
+  type OptionsContext,
   planChips,
   rhythmText,
-  type OptionsContext,
+  whoDidItBody,
 } from '../src/modules/chores/options-derive';
 import { MEMBERS, TODAY, activity, item } from './chores-fixtures';
 
@@ -137,3 +139,15 @@ describe('historyLines', () => {
     expect(byBlair).toEqual(['🔥 3 days in a row', 'Last done Monday at 19:30 by Blair', 'Usually in the evening']);
   });
 });
+
+describe('Who did it? (milestone 8)', () => {
+  it('both sheets say the same thing before anyone is picked', () => {
+    expect(whoDidItBody('Cat care')).toBe('They get the credit for Cat care.');
+  });
+
+  it('after the pick, says the stars only when that person earns them', () => {
+    expect(creditedText({ name: 'Dana', stars: true }, 1)).toBe('Dana gets the credit and the stars.');
+    expect(creditedText({ name: 'Blair', stars: false }, 1)).toBe('Blair gets the credit.');
+    expect(creditedText({ name: 'Dana', stars: true }, 0)).toBe('Dana gets the credit.');
+  });
+});
```

`custom_components/planavista/frontend/test/recent-checkoffs.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { RecentCheckoffs } from '../src/modules/chores/recent-checkoffs';

describe('RecentCheckoffs (milestone 8: Undo always knows what it undoes)', () => {
  it("each toast's Undo finds its own check-off, even after another one", () => {
    const recent = new RecentCheckoffs<string>();
    recent.remember('t1', 'Make your bed');
    recent.remember('t2', 'Feed the fish');
    expect(recent.take('t1')).toBe('Make your bed');
    expect(recent.take('t1')).toBeUndefined();
    expect(recent.peek('t2')).toBe('Feed the fish');
  });

  it('keeps only the last few', () => {
    const recent = new RecentCheckoffs<number>(3);
    for (let i = 1; i <= 5; i++) recent.remember(`t${i}`, i);
    expect(recent.take('t1')).toBeUndefined();
    expect(recent.take('t3')).toBe(3);
  });
});
```

`custom_components/planavista/frontend/test/rewards-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/rewards-derive.test.ts b/custom_components/planavista/frontend/test/rewards-derive.test.ts
index e7a8b2b..abd4e9f 100644
--- a/custom_components/planavista/frontend/test/rewards-derive.test.ts
+++ b/custom_components/planavista/frontend/test/rewards-derive.test.ts
@@ -3,6 +3,7 @@ import {
   balances,
   eligible,
   recentLine,
+  redeemLabel,
   rewardCards,
   rewardDraft,
   rewardFrom,
@@ -53,6 +54,22 @@ describe('rewardCards', () => {
   });
 });
 
+describe('asking for a reward (milestone 8)', () => {
+  it('Redeem waits as soon as someone asks, before the board comes back', () => {
+    const asking = rewardCards(B, PEOPLE, [{ member: 'dana', reward: 'weekend_game' }])[1];
+    expect(asking.asked.map(m => m.id)).toEqual(['casey', 'dana']);
+    expect(asking.canRedeem).toBe(false);
+    expect(redeemLabel(asking)).toBe('Waiting for OK');
+  });
+
+  it('says Redeem while anyone can, and why not otherwise', () => {
+    const cards = rewardCards(B, PEOPLE);
+    expect(redeemLabel(cards[0])).toBe('Redeem');
+    expect(redeemLabel(cards[1])).toBe('Redeem');
+    expect(redeemLabel(cards[2])).toBe('Not enough stars yet');
+  });
+});
+
 describe('recentLine', () => {
   it('says who got what, and who approved it', () => {
     expect(recentLine(B, PEOPLE)).toBe('Recently: Casey redeemed 30 minutes of extra screen time on Sunday, approved by Blair.');
```

`custom_components/planavista/frontend/test/sheets.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/sheets.test.ts b/custom_components/planavista/frontend/test/sheets.test.ts
index 284cad7..b8da559 100644
--- a/custom_components/planavista/frontend/test/sheets.test.ts
+++ b/custom_components/planavista/frontend/test/sheets.test.ts
@@ -73,7 +73,8 @@ describe('sheets and editors (milestone 8, spec 3.10)', () => {
     expect(toast).toMatch(/var\(--pv-toast-bg,/);
     expect(toast).not.toMatch(/background: #1F2023/);
     const module = read('modules/chores/pv-chores-module.ts');
-    expect(module).toMatch(/: 'Done\.'/);
-    expect(module).toMatch(/`Done by \$\{name\}\.`/);
+    expect(module).toMatch(/\?\? 'Done\.'/);
+    // Someone else's check-off says who got the credit (and the stars only when they earn them): creditedText, tested with its words.
+    expect(module).toMatch(/creditedText\(/);
   });
 });
```

`tests/test_chores_privacy.py`:

```diff
diff --git a/tests/test_chores_privacy.py b/tests/test_chores_privacy.py
index dc679cc..a97ee14 100644
--- a/tests/test_chores_privacy.py
+++ b/tests/test_chores_privacy.py
@@ -92,3 +92,34 @@ async def test_a_pin_never_leaks_through_chores(
     }
     for place, text in places.items():
         assert PIN not in text, place
+
+
+async def test_diagnostics_list_the_last_20_refusals_without_names(
+    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any, hass_client: Any
+) -> None:
+    """A report like "Undo did nothing" can be traced (milestone 8): time, command, and reason only."""
+    assert await async_setup_component(hass, "diagnostics", {})
+    household = chores.household
+    household.shared_users.append(accounts["kitchen"].id)
+    await set_pin(hass, household, "casey", PIN)
+    await set_pin(hass, household, "blair", "2468")
+    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
+    trash = "take_out_the_trash|casey|week:2026-10-12|0"
+    refused = await ws_command(kitchen, {"type": "planavista/chores/undo", "occurrence": trash})
+    assert refused["error"]["code"] == "pin_required"
+    refused = await ws_command(kitchen, {"type": "planavista/household/settings/save", "shuffle_keypad": True})
+    assert refused["error"]["code"] == "parent_mode_required"
+    result = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
+    assert [(r["command"], r["reason"]) for r in result["recent_refusals"]] == [
+        ("planavista/chores/undo", "pin_required"),
+        ("planavista/household/settings/save", "parent_mode_required"),
+    ]
+    assert all(set(r) == {"at", "command", "reason"} for r in result["recent_refusals"])
+    text = json.dumps(result["recent_refusals"])
+    for secret in ("Casey", "casey", PIN, accounts["kitchen"].id):
+        assert secret not in text, secret
+    for _ in range(25):
+        await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": trash})
+    result = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
+    assert len(result["recent_refusals"]) == 20
+    assert {r["command"] for r in result["recent_refusals"]} == {"planavista/chores/complete"}
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/board-derive.test.ts test/options-derive.test.ts test/recent-checkoffs.test.ts test/rewards-derive.test.ts test/sheets.test.ts` and `bash scripts/test-backend.sh -q tests/test_chores_privacy.py` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/chores/websocket.py`:

```diff
diff --git a/custom_components/planavista/chores/websocket.py b/custom_components/planavista/chores/websocket.py
index 0440358..73beac8 100644
--- a/custom_components/planavista/chores/websocket.py
+++ b/custom_components/planavista/chores/websocket.py
@@ -32,6 +32,7 @@ from ..household.websocket import (
     refuse,
     session_for,
 )
+from ..refusals import send_refusal
 from .access import MESSAGES, message, source_of
 from .engine import ChoresEngine, Item, Outcome
 from .importer import FORMAT_HOUSEHOLD, ImportProblem, export_household, plan_import, preview, read_file
@@ -53,11 +54,11 @@ def _runtime(
     """The runtime, or None after saying why chores can't be used now."""
     runtime = hass.data.get(DATA_CHORES)
     if runtime is None:
-        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
+        send_refusal(connection, msg, "not_loaded", "PlanaVista is not set up yet.")
         return None
     if ready and not runtime.available:
         code, text = STATE_MESSAGES[runtime.state]
-        connection.send_error(msg["id"], code, text)
+        send_refusal(connection, msg, code, text)
         return None
     return runtime
 
@@ -73,7 +74,7 @@ def _member_by(
         return by
     if account.screen_rules:
         member = household.member(target) or {}
-        connection.send_error(msg["id"], "pin_required", f"{member.get('name', target)}'s PIN or a parent's is needed.")
+        send_refusal(connection, msg, "pin_required", f"{member.get('name', target)}'s PIN or a parent's is needed.")
     else:
         refuse(connection, msg, account)
     return None
@@ -89,10 +90,10 @@ async def _apply(
     try:
         return await runtime.async_run(action)
     except ChoreError as err:
-        connection.send_error(msg["id"], err.code, message(err))
+        send_refusal(connection, msg, err.code, message(err))
     except ChoresUnavailable:
         code, text = STATE_MESSAGES.get(runtime.state, ("chores_off", "Turn on chores first."))
-        connection.send_error(msg["id"], code, text)
+        send_refusal(connection, msg, code, text)
     return None
 
 
@@ -103,7 +104,7 @@ def _item(
     """Today's occurrence named by the command, or None after saying it can't change now."""
     item = runtime.engine.find_item(msg["occurrence"], runtime.now())
     if item is None:
-        connection.send_error(msg["id"], "period_closed", "The day had ended.")
+        send_refusal(connection, msg, "period_closed", "The day had ended.")
     return item
 
 
@@ -162,7 +163,7 @@ def ws_chores_history(hass: HomeAssistant, connection: websocket_api.ActiveConne
     try:
         result = runtime.engine.history(runtime.now(), msg["chore"], msg["member"])
     except ChoreError as err:
-        connection.send_error(msg["id"], err.code, message(err))
+        send_refusal(connection, msg, err.code, message(err))
         return
     connection.send_result(msg["id"], result)
 
@@ -375,7 +376,7 @@ async def ws_chores_enable(hass: HomeAssistant, connection: websocket_api.Active
         await runtime.async_set_enabled(msg["enabled"])
     except ChoresUnavailable:
         code, text = STATE_MESSAGES[STATE_NEWER]
-        connection.send_error(msg["id"], code, text)
+        send_refusal(connection, msg, code, text)
         return
     connection.send_result(msg["id"], {"state": runtime.state})
 
@@ -390,7 +391,7 @@ async def ws_chores_start_over(hass: HomeAssistant, connection: websocket_api.Ac
     try:
         await runtime.async_start_over()
     except ChoresUnavailable:
-        connection.send_error(msg["id"], "nothing_to_fix", "Chores don't need a look.")
+        send_refusal(connection, msg, "nothing_to_fix", "Chores don't need a look.")
         return
     connection.send_result(msg["id"], {"state": runtime.state})
 
@@ -480,7 +481,7 @@ def ws_stars_history(hass: HomeAssistant, connection: websocket_api.ActiveConnec
     try:
         history = runtime.engine.star_history(msg["member"])
     except ChoreError as err:
-        connection.send_error(msg["id"], err.code, message(err))
+        send_refusal(connection, msg, err.code, message(err))
         return
     connection.send_result(msg["id"], {"balance": runtime.engine.balance(msg["member"]), "history": history})
 
@@ -550,7 +551,7 @@ async def ws_import_apply(hass: HomeAssistant, connection: websocket_api.ActiveC
     household, by = context
     if runtime.state == STATE_NEWER:
         code, text = STATE_MESSAGES[STATE_NEWER]
-        connection.send_error(msg["id"], code, text)
+        send_refusal(connection, msg, code, text)
         return
     try:
         parsed = read_file(msg["text"])
@@ -559,8 +560,7 @@ async def ws_import_apply(hass: HomeAssistant, connection: websocket_api.ActiveC
         return
     fills_in = runtime.state == STATE_NEEDS_A_LOOK
     if fills_in and parsed["format"] != FORMAT_HOUSEHOLD:
-        connection.send_error(
-            msg["id"], "chores_need_a_look", "Restore from a PlanaVista file, or start over, before importing a plan."
+        send_refusal(connection, msg, "chores_need_a_look", "Restore from a PlanaVista file, or start over, before importing a plan."
         )
         return
     # Everything is checked first, against what's here now (files that couldn't be read are empty), and nothing
@@ -620,7 +620,7 @@ def ws_export(hass: HomeAssistant, connection: websocket_api.ActiveConnection, m
     household, _by = context
     if runtime.state in (STATE_NEEDS_A_LOOK, STATE_NEWER):
         code, text = STATE_MESSAGES[runtime.state]
-        connection.send_error(msg["id"], code, text)
+        send_refusal(connection, msg, code, text)
         return
     rows = runtime.entry.data.get(CONF_CALENDARS, []) if runtime.entry is not None else []
     now = dt_util.now()
```

`custom_components/planavista/diagnostics.py`:

```diff
diff --git a/custom_components/planavista/diagnostics.py b/custom_components/planavista/diagnostics.py
index 44a0e1f..6ad80b6 100644
--- a/custom_components/planavista/diagnostics.py
+++ b/custom_components/planavista/diagnostics.py
@@ -1,4 +1,4 @@
-"""Download diagnostics: counts, settings, Store versions, and recent errors (spec 15.6).
+"""Download diagnostics: counts, settings, Store versions, recent errors, and recent refusals (spec 15.6).
 
 Member names are replaced ("Member 1"), and PIN data and Home Assistant user
 ids are left out entirely.
@@ -16,6 +16,7 @@ from .const import CONF_CALENDARS, CONF_DISPLAY
 from .coordinator import PlanaVistaConfigEntry
 from .household.members import ordered
 from .household.store import DATA_HOUSEHOLD
+from .refusals import recent_refusals
 
 TO_REDACT = {"weather_entity"}
 
@@ -78,4 +79,6 @@ async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: PlanaVi
             },
             "recent_errors": list(chores.errors),
         }
+    # What was refused lately (milestone 8): time, command, and reason only.
+    result["recent_refusals"] = recent_refusals(hass)
     return result
```

`custom_components/planavista/frontend/src/modules/chores/board-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/board-derive.ts b/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
index ee2d750..7682d33 100644
--- a/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
@@ -150,7 +150,7 @@ export function groupKey(item: ItemView): string | null {
   return null;
 }
 
-/** One person's column (spec 13.1): bands with Now highlighted, This week, Done today, and past bands as credit. */
+/** One person's column (spec 13.1): bands with Now highlighted, This week, Done today (every check-off today), and past bands as credit. */
 export function columnFor(member: Member, entry: BoardMember, board: Board, ctx: DeriveContext): ColumnModel {
   const current = bandAt(ctx.now, board.settings?.day_starts);
   const earnsStars = !!member.stars;
@@ -256,9 +256,11 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
     entries.push({ kind: 'head', key: 'head:week', text: 'This week', right: left === 1 ? 'Last day' : `${left} days left`, tone: 'plain' });
     for (const row of week) entries.push({ kind: 'row', key: row.key, row, zone: 'week' });
   }
-  if (done.length) {
+  // Every check-off today, a finished part of the day's too, so a mistaken one can be unchecked with the same hold (milestone 8).
+  const allDone = [...earlier, ...done].sort((a, b) => (a.item.completion?.at ?? '').localeCompare(b.item.completion?.at ?? ''));
+  if (allDone.length) {
     entries.push({ kind: 'head', key: 'head:done', text: 'Done today', tone: 'plain' });
-    for (const row of done) entries.push({ kind: 'row', key: row.key, row, zone: 'done' });
+    for (const row of allDone) entries.push({ kind: 'row', key: row.key, row, zone: 'done' });
   }
   entries.push(...credits);
 
@@ -283,7 +285,7 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
     away: entry.away ? { note: entry.away.note ?? null } : null,
     pictures: member.age_group === 'young_child',
     entries,
-    doneToday: [...earlier, ...done].sort((a, b) => (a.item.completion?.at ?? '').localeCompare(b.item.completion?.at ?? '')),
+    doneToday: allDone,
     left,
     empty: items.length === 0,
   };
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index 9733964..bb393ff 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -254,3 +254,13 @@ export function historyLines(history: ChoreHistory, today: string, members: Memb
   else if (band) lines.push(`Usually ${BAND_WORDS[band]}`);
   return lines;
 }
+
+/** "Who did it?" before anyone is picked, the same on the options sheet and after a check-off (milestone 8). */
+export function whoDidItBody(name: string): string {
+  return `They get the credit for ${name}.`;
+}
+
+/** After the pick: the stars only when the person picked earns them and the chore gives some. */
+export function creditedText(doer: { name: string; stars: boolean }, stars: number): string {
+  return doer.stars && stars > 0 ? `${doer.name} gets the credit and the stars.` : `${doer.name} gets the credit.`;
+}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 2ba2018..99e5038 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -31,7 +31,8 @@ import { RewardDraft, balances, recentLine, rewardCards, rewardFrom } from './re
 import { memoizeOne } from '../../utils/render-cache';
 import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
-import { dayWords, historyLines, itemOptions } from './options-derive';
+import { creditedText, dayWords, historyLines, itemOptions, whoDidItBody } from './options-derive';
+import { RecentCheckoffs } from './recent-checkoffs';
 import type { OptionChoice } from './pv-chore-options';
 import { InboxRow, answeredText, inboxGroups } from './inbox-derive';
 import type { ReviewDetail } from './pv-chores-inbox';
@@ -118,7 +119,10 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _overlayOpen = false;
   /** What had focus when a sheet opened; it gets focus back when the sheet closes (spec 11.8). */
   private _opener: HTMLElement | null = null;
-  private _last: LastCheckoff | null = null;
+  /** Each check-off toast's own check-off, so its Undo always knows what to undo (milestone 8). */
+  private readonly _recent = new RecentCheckoffs<LastCheckoff>();
+  /** Rewards asked for that the board doesn't show yet: Redeem waits at once. */
+  @state() private _asking: ReadonlyArray<{ member: string; reward: string }> = [];
   private _clock: ReturnType<typeof setInterval> | undefined;
 
   static styles = [
@@ -481,7 +485,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _renderRewards(board: Board) {
     const members = inOrder(this.household?.members ?? []);
     return html`
-      <pv-chores-rewards .balances=${balances(board, members)} .cards=${rewardCards(board, members)}
+      <pv-chores-rewards .balances=${balances(board, members)} .cards=${rewardCards(board, members, this._waitingAsks(board))}
         .recent=${recentLine(board, members)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
         ?canEdit=${parentAccess(this.household, this.session) !== 'no'}
         @pv-reward-redeem=${(e: CustomEvent<{ reward: string }>) => this._redeem(e.detail.reward)}
@@ -489,23 +493,35 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     `;
   }
 
+  /** Asks the board doesn't show yet; once it shows them (or a parent answered), they're the board's. */
+  private _waitingAsks(board: Board): ReadonlyArray<{ member: string; reward: string }> {
+    if (!this._asking.length) return this._asking;
+    const shown = (a: { member: string; reward: string }) =>
+      board.requests.some(r => r.kind === 'redemption' && r.member === a.member && r.reward === a.reward);
+    return this._asking.filter(a => !shown(a));
+  }
+
   /** Redeem: for whoever can afford it (asking who, when more than one can), behind their PIN if they have one. */
   private _redeem(rewardId: string): void {
     const board = this.service?.board();
     if (!board) return;
-    const card = rewardCards(board, inOrder(this.household?.members ?? [])).find(c => c.reward.id === rewardId);
+    const card = rewardCards(board, inOrder(this.household?.members ?? []), this._waitingAsks(board)).find(c => c.reward.id === rewardId);
     if (!card) return;
     const ready = card.people.filter(p => p.afford && !p.asked).map(p => p.member);
     const go = async (member: Member) => {
       const api = this.service?.api;
       if (!api || !(await this.asMember(member.id, `Who's getting ${card.reward.name}?`))) return;
+      const ask = { member: member.id, reward: rewardId };
+      this._asking = [...this._asking, ask];
       try {
         const out = await api.redeem(member.id, rewardId);
+        if (out.result === 'given') this._asking = this._asking.filter(a => a !== ask);
         this.showToast({
           id: `redeem-${Date.now()}`,
           text: out.result === 'given' ? `${card.reward.name} is ${member.name}'s!` : `Asked for ${card.reward.name}. A parent will answer.`,
         });
       } catch (err) {
+        this._asking = this._asking.filter(a => a !== ask);
         this.showToast({ id: `redeem-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
       }
     };
@@ -634,11 +650,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     haptic('tick');
     if (board.settings.sound) chime();
     const id = `done-${row.key}-${Date.now()}`;
-    this._last = { row, member, toast: id };
-    const name = doneBy && doneBy !== member ? this._member(doneBy)?.name : null;
+    this._recent.remember(id, { row, member, toast: id });
+    const credited = doneBy && doneBy !== member && doer ? creditedText({ name: doer.name, stars: !!doer.stars }, row.item.stars) : null;
     this.showToast({
       id,
-      text: waits ? `${row.name}: waiting for OK.` : name ? `Done by ${name}.` : 'Done.',
+      text: waits ? `${row.name}: waiting for OK.` : credited ?? 'Done.',
       actions: [{ id: 'undo', label: 'Undo' }, ...(doneBy ? [] : [{ id: 'someone', label: 'Someone else did it?' }])],
       ms: 6000,
     });
@@ -773,7 +789,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         const people = inOrder(this.household?.members ?? []).filter(m => m.id !== owner.id);
         this._sheet = {
           kind: 'people', heading: 'Who did it?', people,
-          body: `They get the credit for ${name}.`,
+          body: whoDidItBody(name),
           pick: async member => {
             if (!member || !(await this.asMember(owner.id, `Who's checking off ${name}?`))) return;
             const fresh = this.service?.board();
@@ -843,7 +859,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     this._sheet = {
       kind: 'people',
       heading: 'Who did it?',
-      body: `They get the credit${people.some(p => p.stars) ? ' and the stars' : ''} for ${last.row.name}.`,
+      body: whoDidItBody(last.row.name),
       people,
       pick: member => {
         const board = this.service?.board();
@@ -931,13 +947,19 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   }
 
   protected onToastAction(toast: Toast, action: string): void {
-    const last = this._last;
-    if (!last || last.toast !== toast.id || !this.service) return;
+    if (!this.service) return;
     if (action === 'undo') {
+      // Undo always answers in words; a refusal comes back as its own toast, on this card (milestone 8).
+      const last = this._recent.take(toast.id);
+      if (!last) {
+        this.showToast({ id: `undo-${Date.now()}`, text: 'Hold the check to uncheck it.' });
+        return;
+      }
       this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
-      this._last = null;
+      this.showToast({ id: `undo-${last.row.key}-${Date.now()}`, text: `${last.row.name} is open again.` });
     } else if (action === 'someone') {
-      this._someoneElse(last);
+      const last = this._recent.peek(toast.id);
+      if (last) this._someoneElse(last);
     }
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index 59618e4..3d5b7d2 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -8,6 +8,7 @@ import type { Layout } from '../../core/layout';
 import type { Member } from '../../core/household';
 import '../../core/pv-member-avatar';
 import { choresStyles } from './chores-styles';
+import { redeemLabel } from './rewards-derive';
 import type { Balance, RewardCard } from './rewards-derive';
 import { pictureOf } from './pv-chore-tile';
 import { ScrollReporter } from '../../core/content-scroll';
@@ -261,7 +262,7 @@ export class PvChoresRewards extends LitElement {
         </div>
         ${card.canRedeem
           ? html`<button class="pv-btn pv-btn-secondary accent action" type="button" @click=${() => this._fire('pv-reward-redeem', { reward: reward.id })}>Redeem</button>`
-          : html`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${asked ? 'Requested' : 'Not enough stars yet'}</button>`}
+          : html`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${redeemLabel(card)}</button>`}
       </div>
     `;
   }
```

`custom_components/planavista/frontend/src/modules/chores/recent-checkoffs.ts` (new):

```ts
/**
 * The last few check-offs, each by the toast that offered its Undo
 * (milestone 8). A toast's Undo then undoes its own check-off even after a
 * newer one, instead of doing nothing.
 */
export class RecentCheckoffs<T> {
  private readonly _byToast = new Map<string, T>();

  constructor(private readonly _keep = 5) {}

  remember(toast: string, checkoff: T): void {
    this._byToast.set(toast, checkoff);
    while (this._byToast.size > this._keep) this._byToast.delete(this._byToast.keys().next().value as string);
  }

  /** The check-off a toast offered, without forgetting it (Someone else did it? still needs it). */
  peek(toast: string): T | undefined {
    return this._byToast.get(toast);
  }

  /** The check-off a toast offered, forgotten once its Undo is used. */
  take(toast: string): T | undefined {
    const checkoff = this._byToast.get(toast);
    this._byToast.delete(toast);
    return checkoff;
  }
}
```

`custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts b/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
index 6721b4e..448d64a 100644
--- a/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
@@ -34,12 +34,17 @@ export function eligible(reward: Reward, members: Member[]): Member[] {
   return reward.who.length ? earners.filter(m => reward.who.includes(m.id)) : earners;
 }
 
-/** The catalog (spec 13.6): each card shows who can afford it, goals, and redemptions waiting. */
-export function rewardCards(board: Board, members: Member[]): RewardCard[] {
+/**
+ * The catalog (spec 13.6): each card shows who can afford it, goals, and
+ * redemptions waiting. `asking` holds requests sent but not yet on the
+ * board, so Redeem waits at once (milestone 8).
+ */
+export function rewardCards(board: Board, members: Member[], asking: ReadonlyArray<{ member: string; reward: string }> = []): RewardCard[] {
   return board.rewards.map(reward => {
-    const asked = new Set(
-      board.requests.filter(r => r.kind === 'redemption' && r.reward === reward.id).map(r => r.member),
-    );
+    const asked = new Set([
+      ...board.requests.filter(r => r.kind === 'redemption' && r.reward === reward.id).map(r => r.member),
+      ...asking.filter(a => a.reward === reward.id).map(a => a.member),
+    ]);
     const people = eligible(reward, members).map(member => {
       const stars = board.members[member.id]?.stars ?? 0;
       return { member, afford: stars >= reward.cost, more: Math.max(0, reward.cost - stars), asked: asked.has(member.id) };
@@ -54,6 +59,12 @@ export function rewardCards(board: Board, members: Member[]): RewardCard[] {
   });
 }
 
+/** The card's button: Redeem while anyone can; otherwise why not. */
+export function redeemLabel(card: Pick<RewardCard, 'canRedeem' | 'asked'>): string {
+  if (card.canRedeem) return 'Redeem';
+  return card.asked.length ? 'Waiting for OK' : 'Not enough stars yet';
+}
+
 /** "Recently: Casey redeemed Pick the weekend game on Sunday, approved by Blair" (spec 13.6). */
 export function recentLine(board: Board, members: Member[]): string | null {
   const last = board.recent_redemptions[0];
```

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 617537d..8dedc5f 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -46,6 +46,7 @@ from .security import (
     valid_pin,
     verify_pin,
 )
+from ..refusals import send_refusal
 from .store import DATA_HOUSEHOLD, Household
 
 # What the card shows when a change breaks a rule (spec 11.7: say what to do).
@@ -151,7 +152,7 @@ def household_for(
 ) -> Household | None:
     household = hass.data.get(DATA_HOUSEHOLD)
     if household is None:
-        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
+        send_refusal(connection, msg, "not_loaded", "PlanaVista is not set up yet.")
     return household
 
 
@@ -160,11 +161,10 @@ def refuse(
     connection: websocket_api.ActiveConnection, msg: dict[str, Any], account: Account
 ) -> None:
     if account.screen_rules:
-        connection.send_error(
-            msg["id"], "parent_mode_required", "A parent's PIN is needed on this screen."
+        send_refusal(connection, msg, "parent_mode_required", "A parent's PIN is needed on this screen."
         )
     else:
-        connection.send_error(msg["id"], "not_allowed", "Only a parent can do this.")
+        send_refusal(connection, msg, "not_allowed", "Only a parent can do this.")
 
 
 @callback
@@ -185,8 +185,7 @@ def parent_for(
         refuse(connection, msg, account)
         return None
     if needs_file and not household.available:
-        connection.send_error(
-            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
+        send_refusal(connection, msg, "unavailable", "Update PlanaVista to change people and PINs."
         )
         return None
     return household, by
@@ -196,8 +195,7 @@ def parent_for(
 def _member_error(
     connection: websocket_api.ActiveConnection, msg: dict[str, Any], err: MemberError
 ) -> None:
-    connection.send_error(
-        msg["id"], err.code, ERROR_MESSAGES.get(err.code, "That change can't be saved.")
+    send_refusal(connection, msg, err.code, ERROR_MESSAGES.get(err.code, "That change can't be saved.")
     )
 
 
@@ -313,19 +311,18 @@ async def ws_member_prefs(
     if household is None:
         return
     if not household.available:
-        connection.send_error(msg["id"], "unavailable", "Update PlanaVista to change people and PINs.")
+        send_refusal(connection, msg, "unavailable", "Update PlanaVista to change people and PINs.")
         return
     member_id = msg["member_id"]
     member = household.member(member_id)
     if member is None:
-        connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
+        send_refusal(connection, msg, "unknown_member", ERROR_MESSAGES["unknown_member"])
         return
     account = account_for(hass, household, connection.user)
     session = session_for(household, connection, msg)
     if member_level(account, session, member_id, member_id in household.pins) is None:
         if account.screen_rules:
-            connection.send_error(
-                msg["id"], "pin_required", f"{member.get('name', member_id)}'s PIN or a parent's is needed."
+            send_refusal(connection, msg, "pin_required", f"{member.get('name', member_id)}'s PIN or a parent's is needed."
             )
         else:
             refuse(connection, msg, account)
@@ -438,8 +435,7 @@ async def ws_shared_screen(
     users = [user_id for user_id in household.shared_users if user_id != connection.user.id]
     if msg["shared"]:
         if not parents_with_pins(household.members, household.pins):
-            connection.send_error(
-                msg["id"], "needs_parent_pin", ERROR_MESSAGES["needs_parent_pin"]
+            send_refusal(connection, msg, "needs_parent_pin", ERROR_MESSAGES["needs_parent_pin"]
             )
             return
         users.append(connection.user.id)
@@ -542,7 +538,7 @@ def _pin_manager(
     if household is None:
         return None
     if household.member(msg["member_id"]) is None:
-        connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
+        send_refusal(connection, msg, "unknown_member", ERROR_MESSAGES["unknown_member"])
         return None
     account = account_for(hass, household, connection.user)
     session = session_for(household, connection, msg)
@@ -550,8 +546,7 @@ def _pin_manager(
         refuse(connection, msg, account)
         return None
     if not household.available:
-        connection.send_error(
-            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
+        send_refusal(connection, msg, "unavailable", "Update PlanaVista to change people and PINs."
         )
         return None
     return household, msg.get("session") if session else None
@@ -643,10 +638,10 @@ async def ws_pin_set(
         return
     household, token = context
     if not valid_pin(msg["pin"]):
-        connection.send_error(msg["id"], "invalid_pin", INVALID_PIN)
+        send_refusal(connection, msg, "invalid_pin", INVALID_PIN)
         return
     if easy_pin(msg["pin"]):
-        connection.send_error(msg["id"], "easy_pin", EASY_PIN)
+        send_refusal(connection, msg, "easy_pin", EASY_PIN)
         return
     household.pins[msg["member_id"]] = await hass.async_add_executor_job(hash_pin, msg["pin"])
     household.sessions.end_member(msg["member_id"], keep=token)
@@ -742,7 +737,7 @@ def ws_pin_touch(
     now = _monotonic()
     session = household.sessions.get(msg["session"], connection, now, touch=True)
     if session is None:
-        connection.send_error(msg["id"], "session_ended", "The PIN session ended.")
+        send_refusal(connection, msg, "session_ended", "The PIN session ended.")
         return
     connection.send_result(msg["id"], {"expires_in": math.ceil(household.sessions.expires_in(session, now))})
 
```

`custom_components/planavista/refusals.py` (new):

```python
"""The last 20 commands PlanaVista refused, for diagnostics (milestone 8).

A report like "Undo did nothing" can then be traced: each entry is the time,
the command, and the reason's code. Never a name, a member, a user id, or a
PIN.
"""
from __future__ import annotations

from collections import deque
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey

from .const import DOMAIN

DATA_REFUSALS: HassKey[deque[dict[str, str]]] = HassKey(f"{DOMAIN}_refusals")
KEPT = 20


@callback
def send_refusal(connection: websocket_api.ActiveConnection, msg: dict[str, Any], code: str, text: str) -> None:
    """Refuse the command, and note it."""
    note_refusal(connection.hass, str(msg.get("type", "")), code)
    connection.send_error(msg["id"], code, text)


@callback
def note_refusal(hass: HomeAssistant, command: str, code: str) -> None:
    """Remember a refusal: when, which command, and why (its code)."""
    log = hass.data.setdefault(DATA_REFUSALS, deque(maxlen=KEPT))
    log.append({"at": dt_util.now().isoformat(timespec="seconds"), "command": command, "reason": code})


def recent_refusals(hass: HomeAssistant) -> list[dict[str, str]]:
    """Oldest first."""
    return list(hass.data.get(DATA_REFUSALS, ()))
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1147 passed`; the task's own files `53 passed`; `bash scripts/test-backend.sh -q` Expected: `1091 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** A morning check-off sits in Done today with Hold to uncheck; Someone else did it? says "Blair gets the credit."; each toast's Undo answers; Redeem shows Waiting for OK at once; diagnostics list a refusal by command and code.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat: the board says what happened, and diagnostics keep the last refusals

- Done today lists every chore done today, including ones from a part of
  the day that is over, so a mistaken check-off can be unchecked with the
  same hold.
- "Who did it?" says the same thing on both sheets, and the toast after
  the pick says who got the credit, and the stars only when they earn them.
- Each check-off toast's Undo undoes its own check-off, even after another
  one, and always answers in words.
- Asking for a reward shows "Waiting for OK" on its card at once.
- Diagnostics list the last 20 refused commands: the time, the command,
  and the reason, with no names, user ids, or PINs.
```

---

### Task 15: Each card comes back where it was within the hour

Spec 3.7.

**Files:**
- Create: `custom_components/planavista/frontend/src/core/place.ts`, `custom_components/planavista/frontend/test/place.test.ts`
- Modify: `custom_components/planavista/frontend/src/shell/planavista-card.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/place.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { PLACE_MS, placeKey, readPlace, usablePlace, writePlace } from '../src/core/place';

const KEY = placeKey('/wall-calendar/chores', { type: 'custom:planavista-card', module: 'chores' });
const AT = 1_000_000_000;

describe('coming back where you were (milestone 8, spec 3.7)', () => {
  it('each card on each dashboard has its own place', () => {
    expect(placeKey('/wall-calendar/chores', { module: 'chores', type: 'custom:planavista-card' })).toBe(KEY);
    expect(placeKey('/wall-calendar/planavista', { type: 'custom:planavista-card', module: 'chores' })).not.toBe(KEY);
    expect(placeKey('/wall-calendar/chores', { type: 'custom:planavista-card' })).not.toBe(KEY);
  });

  it('comes back within an hour of being on screen, and not after', () => {
    const raw = writePlace(null, KEY, { module: 'chores', views: { chores: 'week', calendar: 'month' } }, AT);
    expect(readPlace(raw, KEY, AT + PLACE_MS - 1)).toEqual({ module: 'chores', views: { chores: 'week', calendar: 'month' }, at: AT });
    expect(readPlace(raw, KEY, AT + PLACE_MS)).toBeNull();
    expect(readPlace(raw, 'another card', AT)).toBeNull();
  });

  it('forgets places older than an hour when it writes, and survives anything odd in storage', () => {
    const old = writePlace(null, 'old card', { module: 'calendar', views: {} }, AT);
    const raw = writePlace(old, KEY, { module: 'chores', views: {} }, AT + PLACE_MS + 1);
    expect(Object.keys(JSON.parse(raw))).toEqual([KEY]);
    expect(readPlace('not json', KEY, AT)).toBeNull();
    expect(readPlace(JSON.stringify({ [KEY]: { module: 7 } }), KEY, AT)).toBeNull();
    expect(Object.keys(JSON.parse(writePlace('[1,2]', KEY, { module: 'chores', views: {} }, AT)))).toEqual([KEY]);
  });

  it('only a module the card still shows, and only views that module has (dates are never remembered)', () => {
    const modules = [
      { id: 'calendar', views: [{ id: 'day' }, { id: 'week' }] },
      { id: 'chores', views: [{ id: 'board' }, { id: 'week' }] },
    ];
    const place = { module: 'chores', views: { chores: 'week', calendar: 'agenda' }, at: AT };
    expect(usablePlace(place, modules)).toEqual({ module: 'chores', views: { chores: 'week' } });
    expect(usablePlace({ ...place, module: 'photos' }, modules)).toBeNull();
    expect(usablePlace(null, modules)).toBeNull();
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/place.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/core/place.ts` (new):

```ts
/**
 * Coming back where you were (milestone 8, spec 3.7). Each card on each
 * device remembers its module and each module's view in localStorage
 * (`planavista.place`, one entry per dashboard path and card config). A card
 * that comes back within an hour of last being on screen (a Home Assistant
 * restart or update, a reconnect, a reload) opens there; after that it opens
 * on its configured start. Dates are never remembered: it comes back on today.
 */
export const PLACE_STORAGE = 'planavista.place';
export const PLACE_MS = 60 * 60_000;

export interface Place {
  module: string;
  /** Each module's view, by module id. */
  views: Record<string, string>;
  /** When the card was last on screen (ms). */
  at: number;
}

/** A card's key: where it is, and how it is set up (two cards on one dashboard keep their own). */
export function placeKey(path: string, config: Record<string, unknown>): string {
  return `${path}|${stable(config)}`;
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function entriesOf(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function asPlace(value: unknown): Place | null {
  if (!value || typeof value !== 'object') return null;
  const { module, views, at } = value as Partial<Place>;
  if (typeof module !== 'string' || typeof at !== 'number' || !views || typeof views !== 'object') return null;
  const clean = Object.fromEntries(Object.entries(views).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
  return { module, views: clean, at };
}

/** This card's place, if it was on screen less than an hour ago. */
export function readPlace(raw: string | null, key: string, now: number): Place | null {
  const place = asPlace(entriesOf(raw)[key]);
  return place && now - place.at < PLACE_MS ? place : null;
}

/** The storage with this card's place set (as of `now`) and places older than an hour gone. */
export function writePlace(raw: string | null, key: string, place: Omit<Place, 'at'>, now: number): string {
  const kept: Record<string, Place> = {};
  for (const [k, v] of Object.entries(entriesOf(raw))) {
    const p = asPlace(v);
    if (p && now - p.at < PLACE_MS) kept[k] = p;
  }
  kept[key] = { module: place.module, views: { ...place.views }, at: now };
  return JSON.stringify(kept);
}

/** The part of a place this card can still use: a module it shows, and views that module has. */
export function usablePlace(
  place: Place | null,
  modules: ReadonlyArray<{ id: string; views: ReadonlyArray<{ id: string }> }>,
): { module: string; views: Record<string, string> } | null {
  if (!place || !modules.some(m => m.id === place.module)) return null;
  const views: Record<string, string> = {};
  for (const mod of modules) {
    const view = place.views[mod.id];
    if (view && mod.views.some(v => v.id === view)) views[mod.id] = view;
  }
  return { module: place.module, views };
}
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 3bca063..a638c46 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -50,6 +50,7 @@ import './pv-notice-sheet';
 import './settings/pv-settings';
 import './setup/pv-setup';
 import { ContentScrollDetail, HeaderHeights, compactHeader } from '../core/content-scroll';
+import { PLACE_STORAGE, Place, placeKey, readPlace, usablePlace, writePlace } from '../core/place';
 
 /** A sheet the card shows over everything: a PIN, or why there is no way in. */
 type CardSheet =
@@ -86,6 +87,11 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   @state() private _views: Record<string, string> = {};
   /** The module the switcher picked; null for the card's first. */
   @state() private _moduleId: string | null = null;
+  /** Where this card was, if it was on screen within the hour (spec 3.7); applied once data and the household are in. */
+  private _remembered: Place | null = null;
+  private _placeKey = '';
+  private _placeApplied = false;
+  private _placeTimer: number | undefined;
   /** Portrait with the content scrolled down: the header shows one line (spec 12.2). */
   @state() private _compactHeader = false;
   /** The header's two heights, for how much its step to one line gives the content. */
@@ -379,9 +385,32 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
 
   setConfig(config: PlanaVistaCardConfig) {
     this._config = { entity: DEFAULT_ENTITY, ...config };
-    // The card's own view and module options apply whenever its config changes.
+    // The card's own view and module options apply whenever its config changes,
+    // unless this card was on screen within the hour: then it comes back where it was.
     this._views = {};
     this._moduleId = null;
+    this._placeKey = placeKey(window.location.pathname, config as unknown as Record<string, unknown>);
+    this._remembered = readPlace(this._storedPlaces(), this._placeKey, Date.now());
+    this._placeApplied = false;
+  }
+
+  private _storedPlaces(): string | null {
+    try {
+      return window.localStorage.getItem(PLACE_STORAGE);
+    } catch {
+      return null;
+    }
+  }
+
+  /** Remember where this card is now (on every change, each minute on screen, and when it leaves). */
+  private _savePlace(): void {
+    const mod = this._activeModule();
+    if (!this._placeApplied || !mod || !this._placeKey) return;
+    try {
+      window.localStorage.setItem(PLACE_STORAGE, writePlace(this._storedPlaces(), this._placeKey, { module: mod.id, views: this._views }, Date.now()));
+    } catch {
+      // Private windows and blocked storage: the card opens on its start, as before.
+    }
   }
 
   /** The module on screen: the one the switcher picked, else the card's first. */
@@ -393,6 +422,16 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   protected willUpdate(changed: PropertyValues): void {
     super.willUpdate(changed);
     // The view a card opens on is chosen once, when the data first arrives (as in 1.1.0).
+    // Coming back where it was (spec 3.7): once, when the data and the household are in, so a
+    // module that needs the household (Chores) can be found.
+    if (!this._placeApplied && this._data() && this._household.view) {
+      this._placeApplied = true;
+      const place = usablePlace(this._remembered, this._modules().shown);
+      if (place) {
+        this._moduleId = place.module;
+        this._views = { ...this._views, ...place.views };
+      }
+    }
     const mod = this._activeModule();
     const data = this._data();
     if (mod && data && !(mod.id in this._views)) {
@@ -423,10 +462,21 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     super.connectedCallback();
     // The heading face is declared on the page; shadow roots ignore @font-face (spec 11.2).
     ensurePageStyles();
+    // "Within an hour" counts from when the card was last on screen, not from its last change.
+    this._placeTimer = window.setInterval(() => {
+      if (document.visibilityState === 'visible') this._savePlace();
+    }, 60_000);
+  }
+
+  disconnectedCallback(): void {
+    super.disconnectedCallback();
+    window.clearInterval(this._placeTimer);
+    this._savePlace();
   }
 
   updated(changedProps: PropertyValues) {
     super.updated(changedProps);
+    if (changedProps.has('_moduleId') || changedProps.has('_views')) this._savePlace();
     this._guardSettings();
     this._guardSetup();
   }
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1152 passed`; the task's own files `4 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** Chores > Week survives a reload; with the place aged past an hour, the card opens on its start.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): each card comes back where it was within the hour

- Each card on each device remembers its module and each module's view.
- When it comes back within an hour of last being on screen (a Home
  Assistant restart or update, a reconnect, a reload), it opens there;
  after that it opens on its configured start. Dates are not remembered.
```

---

### Task 16: The smaller fixes from the review

Spec 3.12.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/fairness.ts`, `custom_components/planavista/frontend/test/pin-reason.test.ts`
- Modify: `README.md`, `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/core/person-draft.ts`, `custom_components/planavista/frontend/src/core/pin-gate.ts`, `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`, `custom_components/planavista/frontend/src/modules/chores/week-derive.ts`, `custom_components/planavista/frontend/src/shell/definition.ts`, `custom_components/planavista/frontend/src/shell/page-styles.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/src/styles/settings.ts`, `custom_components/planavista/frontend/test/chores-list-derive.test.ts`, `custom_components/planavista/frontend/test/household.test.ts`, `custom_components/planavista/frontend/test/my-day-derive.test.ts`, `custom_components/planavista/frontend/test/options-derive.test.ts`, `custom_components/planavista/frontend/test/page-styles.test.ts`, `custom_components/planavista/frontend/test/person-draft.test.ts`, `custom_components/planavista/frontend/test/settings-registry.test.ts`, `custom_components/planavista/frontend/test/sheets.test.ts`, `custom_components/planavista/frontend/test/week-derive.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/chores-list-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/chores-list-derive.test.ts b/custom_components/planavista/frontend/test/chores-list-derive.test.ts
index 115a71e..546cdd8 100644
--- a/custom_components/planavista/frontend/test/chores-list-derive.test.ts
+++ b/custom_components/planavista/frontend/test/chores-list-derive.test.ts
@@ -3,7 +3,7 @@ import {
   choreRow, choresList, durationText, groupOf, onTheBoard, rhythmText,
 } from '../src/modules/chores/settings/chores-list-derive';
 import type { Activity } from '../src/modules/chores/chores-types';
-import { MEMBERS, TODAY, activity } from './chores-fixtures';
+import { MEMBERS, TODAY, activity, item } from './chores-fixtures';
 
 const SETTINGS = { minutes_per_star: 15 };
 
@@ -98,3 +98,21 @@ describe('choresList', () => {
     expect(onTheBoard(SAMPLE.find(a => a.id === 'laundry')!)).toBe(true);
   });
 });
+
+describe("a standing new date (milestone 8)", () => {
+  const water = activity('water_the_plants', { name: 'Water the plants', schedule: 'once', assignees: ['casey'], once: { on: '2026-10-11', by: null, by_time: null, sessions: 1, estimate_minutes: 15 } });
+
+  it("shows a parent's new due date next to the chore's own", () => {
+    const moved = item('water_the_plants|casey|once|0', { chore: 'water_the_plants', window: 'once', period: 'once', due_day: '2026-10-12', dated: true });
+    const list = choresList([water], MEMBERS, SETTINGS, { today: TODAY, items: [moved] });
+    expect(list.groups.flatMap(g => g.rows).map(r => r.rhythm)).toEqual(['On Oct 11 · moved to Oct 12']);
+  });
+
+  it('says nothing more when the date stands, or once it is done', () => {
+    const same = item('water_the_plants|casey|once|0', { chore: 'water_the_plants', window: 'once', period: 'once', due_day: '2026-10-11', dated: true });
+    const done = item('water_the_plants|casey|once|0', { chore: 'water_the_plants', window: 'once', period: 'once', due_day: '2026-10-12', dated: true, status: 'done' });
+    for (const items of [[same], [done], []]) {
+      expect(choresList([water], MEMBERS, SETTINGS, { today: TODAY, items }).groups.flatMap(g => g.rows).map(r => r.rhythm)).toEqual(['On Oct 11']);
+    }
+  });
+});
```

`custom_components/planavista/frontend/test/household.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/household.test.ts b/custom_components/planavista/frontend/test/household.test.ts
index 349dae6..003b0fb 100644
--- a/custom_components/planavista/frontend/test/household.test.ts
+++ b/custom_components/planavista/frontend/test/household.test.ts
@@ -121,6 +121,8 @@ describe('people helpers', () => {
     ];
     expect(memberSummary(ALEX, calendars)).toBe("Parent · PIN on · Alex's calendar");
     expect(memberSummary(CASEY, calendars)).toBe('Teen · 2 calendars');
+    // A parent who isn't an adult is named both ways (milestone 8).
+    expect(memberSummary({ ...CASEY, parent: true }, calendars)).toBe('Parent · Teen · 2 calendars');
     expect(memberSummary(DANA, calendars)).toBe('Young child · no calendar');
   });
 
```

`custom_components/planavista/frontend/test/my-day-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/my-day-derive.test.ts b/custom_components/planavista/frontend/test/my-day-derive.test.ts
index 9b6094f..ab47d02 100644
--- a/custom_components/planavista/frontend/test/my-day-derive.test.ts
+++ b/custom_components/planavista/frontend/test/my-day-derive.test.ts
@@ -1,6 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import { columnFor, type DeriveContext } from '../src/modules/chores/board-derive';
-import { bedtimeOn, fairShares, fitsIn, goalFor, nextLine, picturesFor, timelineFor } from '../src/modules/chores/my-day-derive';
+import { bedtimeOn, fairShares, fitsIn, goalFor, goalWords, nextLine, picturesFor, stickersLabel, timelineFor } from '../src/modules/chores/my-day-derive';
 import type { DayEvent } from '../src/modules/chores/calendar-ties';
 import { MEMBERS, NOW, TODAY, board, column, item } from './chores-fixtures';
 
@@ -52,6 +52,21 @@ describe('timelineFor (spec 13.4)', () => {
     expect(labels).toEqual(['Evening', 'Tidy toys']);
   });
 
+  it('puts a check-off waiting for OK at the time it was done, with that time once (milestone 8)', () => {
+    const waiting = { id: 'w', done_by: 'dana', by: 'dana', at: '2026-10-13T08:51:00-05:00', source: 'tablet', state: 'pending', review: null, stars: 1 } as const;
+    const items = [
+      item('feed_the_fish|dana|day:2026-10-13|0', { band: 'morning', status: 'pending', completion: waiting }),
+      item('tidy_toys|dana|day:2026-10-13|0', { band: 'evening' }),
+    ];
+    const ctx: DeriveContext = { today: TODAY, now: NOW, events: [], timeFormat: '12h', activities: new Map(), members: MEMBERS };
+    const col = columnFor(dana, column(items), board({ dana: column(items) }), ctx);
+    const entries = timelineFor(col, { now: NOW, events: [], timeFormat: '12h', bedtime: null });
+    const shown = entries.flatMap(e => (e.kind === 'band' ? [`== ${e.label}`] : e.kind === 'chore' ? [`${e.time ?? '·'} ${e.row.name}`] : e.kind === 'now' ? ['NOW'] : []));
+    expect(shown).toEqual(['== Morning', '8:51 Feed the fish', '== Afternoon', 'NOW', '== Evening', '· Tidy toys']);
+    const fish = entries.find(e => e.kind === 'chore' && e.row.name === 'Feed the fish');
+    expect(fish && fish.kind === 'chore' ? fish.row.doneAt : 'missing').toBeUndefined();
+  });
+
   it('says it is free for the rest of the day when nothing else is on the calendar', () => {
     const entries = timelineFor(casey_column(), { now: at(19, 30), events: EVENTS, timeFormat: '12h', bedtime: null });
     const free = entries.find(e => e.kind === 'free');
@@ -109,6 +124,21 @@ describe('small helpers', () => {
       casey: column([], { contribution: { minutes: 0, shared_minutes: 0 } }),
     });
     expect(fairShares(b, [alex, blair, casey, dana]).map(s => [s.member.id, s.percent])).toEqual([['alex', 25], ['blair', 75]]);
+    expect(fairShares(b, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 30 min · 25%', 'Blair 1.5 h · 75%']);
     expect(fairShares(board({}), MEMBERS)).toEqual([]);
   });
 });
+
+describe('a goal and stickers read one way (milestone 8)', () => {
+  const reward = { id: 'ice', name: 'Ice cream trip', icon: '🍦', cost: 25, needs_ok: true, who: [] };
+
+  it("says how many more stars, or that there are enough", () => {
+    expect(goalWords({ reward, have: 7, need: 18, progress: 7 / 25 })).toBe('18 more ★');
+    expect(goalWords({ reward, have: 25, need: 0, progress: 1 })).toBe('Enough stars!');
+  });
+
+  it("names the week's stars the same on the board and in My day", () => {
+    expect(stickersLabel(5)).toBe('This week: 5 ★');
+    expect(stickersLabel(0)).toBe('This week: 0 ★');
+  });
+});
```

`custom_components/planavista/frontend/test/options-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/options-derive.test.ts b/custom_components/planavista/frontend/test/options-derive.test.ts
index f201f70..f6321e7 100644
--- a/custom_components/planavista/frontend/test/options-derive.test.ts
+++ b/custom_components/planavista/frontend/test/options-derive.test.ts
@@ -49,6 +49,11 @@ describe('itemOptions (spec 13.3)', () => {
     expect(options.added).toBe('Added by Blair on Sunday');
   });
 
+  it('names a person who added a chore, never an account kind (milestone 8)', () => {
+    const byAdmin = activity('yard_work', { minimum: { hours: 1, per: 'week' }, created: { by: 'admin', source: 'tablet', at: '2026-10-10T19:00:00-05:00' } });
+    expect(itemOptions(ctx({ activity: byAdmin })).added).toBe('Added on Saturday');
+  });
+
   it('marks the parent options with a lock on a shared screen, and hides them on a child\'s own login', () => {
     const shared = itemOptions(ctx({}));
     expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'edit', 'delete']);
```

`custom_components/planavista/frontend/test/page-styles.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/page-styles.test.ts b/custom_components/planavista/frontend/test/page-styles.test.ts
index e74ef6a..17de95b 100644
--- a/custom_components/planavista/frontend/test/page-styles.test.ts
+++ b/custom_components/planavista/frontend/test/page-styles.test.ts
@@ -26,4 +26,10 @@ describe('page styles', () => {
     expect(transitionCss(['planavista-1'], 'none')).toBe('');
     expect(transitionCss([], 'dusk')).toBe('');
   });
+
+  it('lets a tap during the change reach the card underneath (milestone 8)', () => {
+    for (const kind of ['dusk', 'dawn', 'reveal', 'fade'] as const) {
+      expect(transitionCss(['pv-card-1'], kind)).toContain('html[data-pv-vt]::view-transition{pointer-events:none}');
+    }
+  });
 });
```

`custom_components/planavista/frontend/test/person-draft.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/person-draft.test.ts b/custom_components/planavista/frontend/test/person-draft.test.ts
index 2506a68..b5522cf 100644
--- a/custom_components/planavista/frontend/test/person-draft.test.ts
+++ b/custom_components/planavista/frontend/test/person-draft.test.ts
@@ -1,7 +1,7 @@
 import { readFileSync } from 'node:fs';
 import { describe, expect, it } from 'vitest';
 import {
-  AGE_GROUP_DEFAULTS, beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft, withAgeGroup,
+  AGE_GROUP_DEFAULTS, ageGroupNote, beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft, withAgeGroup,
 } from '../src/core/person-draft';
 import { Member } from '../src/core/household';
 
@@ -97,3 +97,19 @@ describe('person drafts', () => {
     expect(draftProblem(draftOf(ALEX, [ALEX], PALETTE), [ALEX, casey], 'alex')).toBeNull();
   });
 });
+
+describe('a new age group says what it changed (milestone 8)', () => {
+  const casey = { my_day: 'list', needs_ok_for: 'marked', stars: true };
+
+  it('names the new style, OKs, and stars', () => {
+    expect(ageGroupNote(casey, { my_day: 'timeline', needs_ok_for: 'marked', stars: true })).toBe('Now Timeline.');
+    expect(ageGroupNote({ my_day: 'timeline', needs_ok_for: 'none', stars: false }, { my_day: 'timeline', needs_ok_for: 'marked', stars: true }))
+      .toBe('Now an OK for chores marked Needs an OK, and earns stars.');
+    expect(ageGroupNote(casey, { my_day: 'pictures', needs_ok_for: 'all', stars: true })).toBe('Now Pictures, and an OK for every chore.');
+    expect(ageGroupNote(casey, { my_day: 'timeline', needs_ok_for: 'none', stars: false })).toBe('Now Timeline, no OKs, and no stars.');
+  });
+
+  it('says nothing when nothing changed', () => {
+    expect(ageGroupNote(casey, casey)).toBeNull();
+  });
+});
```

`custom_components/planavista/frontend/test/pin-reason.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pinReason } from '../src/core/pin-gate';

const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8');

describe('the PIN sheet always says why it is asking (milestone 8, spec 3.12)', () => {
  it('turns the question into the line under "Blair, enter your PIN"', () => {
    expect(pinReason("Who's checking off Cat care?")).toBe('To check off Cat care');
    expect(pinReason("Who's approving?")).toBe('To approve');
    expect(pinReason("Who's handing Laundry over?")).toBe('To hand Laundry over');
    expect(pinReason("Who's opening Settings?")).toBe('To open Settings');
    expect(pinReason("Who's setting up PlanaVista?")).toBe('To set up PlanaVista');
    expect(pinReason("Enter a parent's PIN to keep changing settings")).toBe('To keep changing settings');
    expect(pinReason('Whose day is this?')).toBe('To change their My day');
    expect(pinReason('Whose goal is this?')).toBe('To set their goal');
  });

  it('has a reason for every question the card asks', () => {
    const sources = ['modules/chores/pv-chores-module.ts', 'modules/chores/setup/pv-setup-shared-screen.ts', 'shell/planavista-card.ts'];
    const headings = sources.flatMap(path => [...read(path).matchAll(/(["`])((?:Who's|Whose|Enter a parent's PIN)[^"`]*?)\1/g)].map(m => m[2]));
    expect(headings.length).toBeGreaterThan(20);
    for (const heading of headings) expect(pinReason(heading), heading).not.toBeNull();
  });
});
```

`custom_components/planavista/frontend/test/settings-registry.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/settings-registry.test.ts b/custom_components/planavista/frontend/test/settings-registry.test.ts
index 1aa3cee..ae04c25 100644
--- a/custom_components/planavista/frontend/test/settings-registry.test.ts
+++ b/custom_components/planavista/frontend/test/settings-registry.test.ts
@@ -69,7 +69,7 @@ describe('settings registry', () => {
       calendars: '2 calendars',
       'calendar-options': 'Week · 12-hour',
       appearance: 'Dark · PlanaVista',
-      pins: 'Shared screen · 1 PIN',
+      pins: 'This screen: shared family screen · 1 PIN',
       about: `Version ${version}`,
     });
     const quiet = context({
@@ -77,7 +77,7 @@ describe('settings registry', () => {
       account: { kind: 'admin', shared: false, parent_level: true } as unknown as HouseholdView['account'],
     });
     expect(settings.pages(quiet).find(p => p.id === 'people')?.summary?.(quiet)).toBe('No one yet');
-    expect(settings.pages(quiet).find(p => p.id === 'pins')?.summary?.(quiet)).toBe('Not a shared screen');
+    expect(settings.pages(quiet).find(p => p.id === 'pins')?.summary?.(quiet)).toBe('This screen: not shared');
   });
 
   it('leaves out People and PINs when there is no household', () => {
```

`custom_components/planavista/frontend/test/sheets.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/sheets.test.ts b/custom_components/planavista/frontend/test/sheets.test.ts
index b8da559..7ac7128 100644
--- a/custom_components/planavista/frontend/test/sheets.test.ts
+++ b/custom_components/planavista/frontend/test/sheets.test.ts
@@ -78,3 +78,33 @@ describe('sheets and editors (milestone 8, spec 3.10)', () => {
     expect(module).toMatch(/creditedText\(/);
   });
 });
+
+describe('empty states (milestone 8, spec 3.12)', () => {
+  it('the inbox and the Day view use the shared designed state', () => {
+    for (const path of ['modules/chores/pv-chores-inbox.ts', 'modules/calendar/components/view-day.ts']) {
+      const text = read(path);
+      expect(text, path).toMatch(/class="state"/);
+      expect(text, path).not.toMatch(/class="empty(-state)?"/);
+      expect(text, path).toMatch(/statusStyles/);
+    }
+  });
+});
+
+describe('Settings pages share one layout (milestone 8)', () => {
+  it('one column, 640 px at most, from the left, on every page', () => {
+    const host = read('shell/settings/pv-settings.ts');
+    expect(host).toMatch(/\.page-el \{[^}]*max-width: 640px/);
+    const shared = read('styles/settings.ts');
+    const content = /\.page-content \{([^}]*)\}/.exec(shared)?.[1] ?? '';
+    expect(content).not.toMatch(/margin: 0 auto/);
+    expect(content).not.toMatch(/max-width: 560px/);
+  });
+});
+
+describe("Customize shows what applies (milestone 8)", () => {
+  it("Corners and Shadows offer the theme's own, chosen until another is picked", () => {
+    const text = read('shell/settings/pv-settings-customize.ts');
+    expect(text).toMatch(/key: 'corner_style', label: 'Corners', options: \[\['', 'Theme'\]/);
+    expect(text).toMatch(/key: 'shadow_depth', label: 'Shadows', options: \[\['', 'Theme'\]/);
+  });
+});
```

`custom_components/planavista/frontend/test/week-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/week-derive.test.ts b/custom_components/planavista/frontend/test/week-derive.test.ts
index e437a3b..01faee6 100644
--- a/custom_components/planavista/frontend/test/week-derive.test.ts
+++ b/custom_components/planavista/frontend/test/week-derive.test.ts
@@ -71,6 +71,7 @@ describe('the rest of the Week view', () => {
   });
 
   it('shares out shared chores by time done', () => {
-    expect(weekShares(WEEK, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 2.5 h', 'Blair 3 h 42 min', 'Casey 2 h 12 min']);
+    // The same words as My day's (milestone 8): time and share.
+    expect(weekShares(WEEK, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 2.5 h · 30%', 'Blair 3 h 42 min · 44%', 'Casey 2 h 12 min · 26%']);
   });
 });
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/chores-list-derive.test.ts test/household.test.ts test/my-day-derive.test.ts test/options-derive.test.ts test/page-styles.test.ts test/person-draft.test.ts test/pin-reason.test.ts test/settings-registry.test.ts test/sheets.test.ts test/week-derive.test.ts` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`README.md`:

```diff
diff --git a/README.md b/README.md
index a3c970c..2ff5a31 100644
--- a/README.md
+++ b/README.md
@@ -164,6 +164,8 @@ In Settings, Appearance shows Light, Dark, and Automatic as small pictures of th
 - **On a schedule**, with a time for light and a time for dark.
 - **Matching Home Assistant**: each screen follows its own Home Assistant theme setting. Handy for phones.
 
+**On a wall tablet**, Home Assistant's own header and menus keep Home Assistant's theme. So they don't glare around a dark card at night, set the tablet's Home Assistant profile to Dark, or to Auto with the tablet's own dark mode on a schedule.
+
 Night falls from the top of the screen and day rises from the bottom. A change never happens while someone is touching the screen or has a sheet open, and a screen that was asleep wakes up already changed.
 
 **Themes.** PlanaVista, Minimal, and Vibrant each have a light and a dark version. Dark is designed rather than inverted: people's colors brighten a little, and their events sit on dark tints.
```

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index eb16a16..6f7c48b 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -194,7 +194,10 @@ export function calendarsOf(memberId: string, calendars: CalendarLink[]): Calend
 
 /** A People row's summary, such as "Parent · PIN on · Alex's calendar" (spec 14.2). */
 export function memberSummary(member: Member, calendars: CalendarLink[]): string {
-  const parts = [member.parent ? 'Parent' : AGE_GROUP_LABELS[member.age_group]];
+  // A parent who isn't an adult is named both ways: "Parent · Teen" (milestone 8).
+  const parts = member.parent
+    ? ['Parent', ...(member.age_group === 'adult' ? [] : [AGE_GROUP_LABELS[member.age_group]])]
+    : [AGE_GROUP_LABELS[member.age_group]];
   if (member.has_pin) parts.push('PIN on');
   const own = calendarsOf(member.id, calendars);
   if (own.length === 0) parts.push('no calendar');
```

`custom_components/planavista/frontend/src/core/person-draft.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/person-draft.ts b/custom_components/planavista/frontend/src/core/person-draft.ts
index 46423df..98e86b5 100644
--- a/custom_components/planavista/frontend/src/core/person-draft.ts
+++ b/custom_components/planavista/frontend/src/core/person-draft.ts
@@ -47,6 +47,24 @@ export function withAgeGroup(draft: PersonDraft, age: AgeGroup): PersonDraft {
   return { ...draft, age_group: age, ...AGE_GROUP_DEFAULTS[age] };
 }
 
+const STYLE_WORDS: Record<string, string> = { timeline: 'Timeline', list: 'List', pictures: 'Pictures' };
+const OK_WORDS: Record<string, string> = {
+  all: 'an OK for every chore', marked: 'an OK for chores marked Needs an OK', none: 'no OKs',
+};
+
+type AgeSettings = { my_day: string; needs_ok_for: string; stars: boolean };
+
+/** What a new age group changed, in a line under the choices ("Now Timeline, and earns stars."; milestone 8). */
+export function ageGroupNote(before: AgeSettings, after: AgeSettings): string | null {
+  const parts: string[] = [];
+  if (before.my_day !== after.my_day) parts.push(STYLE_WORDS[after.my_day] ?? after.my_day);
+  if (before.needs_ok_for !== after.needs_ok_for) parts.push(OK_WORDS[after.needs_ok_for] ?? after.needs_ok_for);
+  if (before.stars !== after.stars) parts.push(after.stars ? 'earns stars' : 'no stars');
+  if (!parts.length) return null;
+  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
+  return `Now ${list}.`;
+}
+
 /** The editor's starting point: the person as saved, or someone new with the first free color. */
 export function draftOf(member: Member | null, members: Member[], palette: string[]): PersonDraft {
   if (member) {
```

`custom_components/planavista/frontend/src/core/pin-gate.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/pin-gate.ts b/custom_components/planavista/frontend/src/core/pin-gate.ts
index 6b774a3..b307996 100644
--- a/custom_components/planavista/frontend/src/core/pin-gate.ts
+++ b/custom_components/planavista/frontend/src/core/pin-gate.ts
@@ -9,3 +9,28 @@ export interface PinGate {
   /** `reason` is the line under "Blair, enter your PIN" that says why ("To change Team standup"). */
   ask(members: Member[], heading: string, reason?: string): Promise<boolean>;
 }
+
+/** The verbs the card's questions use, as the line under the keypad says them. */
+const VERBS: Record<string, string> = {
+  adding: 'add', approving: 'approve', asking: 'ask', changing: 'change', checking: 'check', deleting: 'delete', doing: 'do',
+  excusing: 'excuse', finishing: 'finish', getting: 'get', handing: 'hand', opening: 'open', planning: 'plan',
+  sending: 'send', setting: 'set', starting: 'start', unchecking: 'uncheck',
+};
+
+const FIXED: Record<string, string> = {
+  'Whose day is this?': 'To change their My day',
+  'Whose goal is this?': 'To set their goal',
+};
+
+/**
+ * Why the PIN sheet is asking, from its question (milestone 8): "Who's
+ * checking off Cat care?" is "To check off Cat care", shown under "Blair,
+ * enter your PIN" once the face is picked (or when there is only one face).
+ */
+export function pinReason(heading: string): string | null {
+  if (FIXED[heading]) return FIXED[heading];
+  const who = /^Who's (\w+)(.*)\?$/.exec(heading);
+  if (who && VERBS[who[1]]) return `To ${VERBS[who[1]]}${who[2]}`;
+  const to = /\bto (.+?)\.?$/.exec(heading);
+  return to ? `To ${to[1]}` : null;
+}
```

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 77b1f9d..1cc9f83 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -1,5 +1,6 @@
 import { LitElement, html, css, nothing, PropertyValues } from 'lit';
 import { peopleStripStyles } from '../../../styles/controls';
+import { statusStyles } from '../../../styles/status';
 import { property, state } from 'lit/decorators.js';
 import { defineElement } from '../../../utils/define';
 import { HomeAssistant } from 'custom-card-helpers';
@@ -83,6 +84,7 @@ export class PVViewDay extends LitElement {
 
   static styles = [
     peopleStripStyles,
+    statusStyles,
     baseStyles,
     eventStyles,
     nowIndicatorStyles,
@@ -579,22 +581,6 @@ export class PVViewDay extends LitElement {
         --mdc-icon-size: 20px;
       }
 
-      /* Empty state */
-      .empty-state {
-        display: flex;
-        flex-direction: column;
-        align-items: center;
-        justify-content: center;
-        padding: 3rem;
-        color: var(--pv-text-muted);
-        text-align: center;
-      }
-
-      .empty-state ha-icon {
-        --mdc-icon-size: 48px;
-        opacity: 0.3;
-        margin-bottom: 1rem;
-      }
 
       /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */
 
@@ -814,9 +800,10 @@ export class PVViewDay extends LitElement {
 
     if (visibleCalendars.length === 0) {
       return html`
-        <div class="empty-state">
-          <ha-icon icon="mdi:calendar-blank"></ha-icon>
-          <p>No calendars visible</p>
+        <div class="state">
+          <div class="art" aria-hidden="true">📅</div>
+          <h2>Every calendar is hidden</h2>
+          <p>Show them again to see what's coming up.</p>
         </div>
       `;
     }
```

`custom_components/planavista/frontend/src/modules/chores/fairness.ts` (new):

```ts
import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';

/** One person's share of the shared chores this week. */
export interface FairShare {
  member: Member;
  minutes: number;
  /** Exact, for the bar's widths. */
  percent: number;
  /** "Blair 1 h · 100%": the same words in Week and My day (milestone 8). */
  text: string;
}

/** Shared chores by time done (spec 13.4, 13.5): everyone who did some, with their share. */
export function fairnessShares(entries: ReadonlyArray<{ member: Member; minutes: number }>): FairShare[] {
  const total = entries.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return [];
  return entries
    .filter(s => s.minutes > 0)
    .map(s => {
      const percent = (100 * s.minutes) / total;
      return { ...s, percent, text: `${s.member.name} ${minutesText(s.minutes)} · ${Math.round(percent)}%` };
    });
}
```

`custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts b/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
index c0b4c42..793b697 100644
--- a/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts
@@ -1,5 +1,6 @@
 import type { Member } from '../../core/household';
 import { minutesText } from '../../core/status-map';
+import { FairShare, fairnessShares } from './fairness';
 import type { Band, Board, BoardMember, Reward } from './chores-types';
 import type { ColumnModel, RowModel } from './board-derive';
 import { BANDS, BAND_NAMES, bandAt, bandState } from './board-derive';
@@ -69,12 +70,15 @@ export function timelineFor(column: ColumnModel, ctx: DayContext): TimelineEntry
   const current = bandAt(now, ctx.dayStarts);
   const rows = column.entries.flatMap(e => (e.kind === 'row' ? [{ row: e.row, zone: e.zone }] : []));
   const bandOf = (row: RowModel): Band => row.item.band ?? current;
+  // A check-off waiting for OK happened already: it sits at its time, like a done one (milestone 8).
+  const checkedOff = (row: RowModel) => row.state === 'pending' && !!row.item.completion;
   // Overdue ones and ones left from an earlier band are due now.
   const dueNow = rows
-    .filter(r => r.zone === 'overdue' || (r.zone === 'past'))
+    .filter(r => (r.zone === 'overdue' || r.zone === 'past') && !checkedOff(r.row))
     .map(r => r.row);
-  const open = rows.filter(r => r.zone === 'now' || r.zone === 'later').map(r => r.row);
-  const done = column.doneToday;
+  const open = rows.filter(r => (r.zone === 'now' || r.zone === 'later') && !checkedOff(r.row)).map(r => r.row);
+  const waiting = rows.filter(r => r.zone !== 'week' && r.zone !== 'done' && checkedOff(r.row)).map(r => r.row);
+  const done = [...column.doneToday, ...waiting];
   const week = rows.filter(r => r.zone === 'week').map(r => r.row);
   const events = ctx.events.filter(e => e.member === column.member.id);
   const entries: TimelineEntry[] = [];
@@ -96,7 +100,8 @@ export function timelineFor(column: ColumnModel, ctx: DayContext): TimelineEntry
     }
     for (const r of doneHere) {
       const at = new Date(r.item.completion!.at);
-      items.push({ at: at.getTime(), entry: { kind: 'chore', key: r.key, time: clockTime(at, ctx.timeFormat), row: r } });
+      // The time shows once, at the left; the row doesn't repeat it.
+      items.push({ at: at.getTime(), entry: { kind: 'chore', key: r.key, time: clockTime(at, ctx.timeFormat), row: { ...r, doneAt: undefined } } });
     }
     if (state === 'now') {
       const nowAt = now.getTime();
@@ -155,18 +160,11 @@ export function goalFor(member: Member, entry: BoardMember, rewards: Reward[]):
   return { reward, have, need: Math.max(0, reward.cost - have), progress: reward.cost > 0 ? Math.min(1, have / reward.cost) : 1 };
 }
 
-export interface FairShare {
-  member: Member;
-  minutes: number;
-  percent: number;
-}
+export type { FairShare };
 
-/** Shared chores this week, by time done (spec 13.4, 13.5): everyone's share of the minutes. */
+/** Shared chores this week, by time done (spec 13.4, 13.5): everyone's share of the minutes, as Week says it. */
 export function fairShares(board: Board, members: Member[]): FairShare[] {
-  const shares = members.map(member => ({ member, minutes: board.members[member.id]?.contribution.shared_minutes ?? 0 }));
-  const total = shares.reduce((sum, s) => sum + s.minutes, 0);
-  if (total <= 0) return [];
-  return shares.filter(s => s.minutes > 0).map(s => ({ ...s, percent: Math.round((100 * s.minutes) / total) }));
+  return fairnessShares(members.map(member => ({ member, minutes: board.members[member.id]?.contribution.shared_minutes ?? 0 })));
 }
 
 export interface PicturesModel {
@@ -197,3 +195,13 @@ export function picturesFor(column: ColumnModel, events: DayEvent[], now: Date,
     later: others.slice(1),
   };
 }
+
+/** A goal's progress in words, the same in My day and Rewards: "Goal: 🍦 Ice cream trip · 18 more ★" (milestone 8). */
+export function goalWords(goal: Pick<GoalModel, 'need'>): string {
+  return goal.need > 0 ? `${goal.need} more ★` : 'Enough stars!';
+}
+
+/** The week's stickers, the same on the board and in My day. */
+export function stickersLabel(stars: number): string {
+  return `This week: ${stars} ★`;
+}
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index bb393ff..67407b6 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -144,8 +144,8 @@ function names(people: Member[]): string {
 function addedLine(activity: Activity | undefined, members: Member[], today: string): string | null {
   const created = activity?.created;
   if (!created?.at) return null;
-  const who = members.find(m => m.id === created.by)?.name ??
-    (created.by === 'automation' ? 'an automation' : created.by === 'admin' ? 'an admin' : null);
+  // A person, or an automation; an admin account isn't a person, so it goes unnamed (milestone 8).
+  const who = members.find(m => m.id === created.by)?.name ?? (created.by === 'automation' ? 'an automation' : null);
   const day = created.at.slice(0, 10);
   const when = daysBetween(day, today) === 0 ? 'today' : `on ${dayWords(day, today)}`;
   return who ? `Added by ${who} ${when}` : `Added ${when}`;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
index b8e595e..1637caf 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
@@ -13,6 +13,7 @@ import './pv-chore-item';
 import './pv-chore-tile';
 import { ref } from 'lit/directives/ref.js';
 import { ScrollReporter } from '../../core/content-scroll';
+import { stickersLabel } from './my-day-derive';
 
 /** The most stickers a strip draws before it says "+5". */
 const STICKERS = 20;
@@ -339,7 +340,7 @@ export class PvChoresColumn extends LitElement {
       </div>
       ${model.member.stars ? html`
         <div class="stickers">
-          This week:
+          ${stickersLabel(stickers)}
           <div class="row" role="img" aria-label=${`${stickers} ${stickers === 1 ? 'star' : 'stars'} this week`}>
             ${Array.from({ length: Math.min(STICKERS, stickers) }, () => html`<span aria-hidden="true">⭐</span>`)}
             ${stickers > STICKERS ? html`<span class="meta">+${stickers - STICKERS}</span>` : nothing}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
index aed0b48..8c0be43 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts
@@ -4,6 +4,7 @@ import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { buttonStyles } from '../../styles/shared';
 import { sheetStyles } from '../../styles/sheet';
+import { statusStyles } from '../../styles/status';
 import { trapTab } from '../../core/focus';
 import type { Layout } from '../../core/layout';
 import type { Member } from '../../core/household';
@@ -46,6 +47,7 @@ export class PvChoresInbox extends LitElement {
   static styles = [
     buttonStyles,
     sheetStyles,
+    statusStyles,
     css`
       :host([layout='landscape']) {
         position: absolute;
@@ -208,16 +210,6 @@ export class PvChoresInbox extends LitElement {
         font: inherit;
       }
 
-      .empty {
-        padding: 32px 24px;
-        text-align: center;
-        color: var(--pv-text-secondary, #5F6670);
-        line-height: 1.5;
-      }
-
-      .empty .art {
-        font-size: 32px;
-      }
     `,
   ];
 
@@ -279,7 +271,11 @@ export class PvChoresInbox extends LitElement {
           <h2 id="inbox-title" tabindex="-1">Waiting for OK${g.count ? ` · ${g.count}` : ''}</h2>
         </div>
         ${g.count === 0 ? html`
-          <div class="empty"><div class="art" aria-hidden="true">✅</div>Nothing is waiting. Check-offs that need a parent's OK, requests, and rewards land here.</div>
+          <div class="state">
+            <div class="art" aria-hidden="true">✅</div>
+            <h2>Nothing is waiting</h2>
+            <p>Check-offs that need a parent's OK, requests, and rewards land here.</p>
+          </div>
         ` : nothing}
         ${g.chores.length ? html`
           <div class="group"><span>Chores to check</span>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index e7ce35e..06a23f2 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -17,8 +17,10 @@ import {
   FairShare,
   GoalModel,
   TimelineEntry,
+  goalWords,
   nextLine,
   picturesFor,
+  stickersLabel,
   timelineFor,
 } from './my-day-derive';
 import { pictureOf } from './pv-chore-tile';
@@ -427,7 +429,7 @@ export class PvChoresMyDay extends LitElement {
       <div class="goal">
         <div class="text">
           <span>Goal: ${pictureOf(goal.reward.icon)} ${goal.reward.name}</span>
-          <span class="num">${goal.need > 0 ? `${goal.have} of ${goal.reward.cost} ★ · ${goal.need} more` : 'Enough stars!'}</span>
+          <span class="num">${goalWords(goal)}</span>
         </div>
         <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${goal.reward.cost} aria-valuenow=${goal.have}
           aria-label=${`${goal.reward.name}: ${goal.have} of ${goal.reward.cost} stars`}><span style="width:${Math.round(goal.progress * 100)}%"></span></div>
@@ -512,10 +514,10 @@ export class PvChoresMyDay extends LitElement {
     return html`
       <div class="fair">
         <div class="section-head" style="margin-left:0"><span>Shared chores this week, by time done</span></div>
-        <div class="bar" role="img" aria-label=${this.shares.map(s => `${s.member.name} ${s.percent}%`).join(', ')}>
+        <div class="bar" role="img" aria-label=${this.shares.map(s => s.text).join(', ')}>
           ${this.shares.map(s => html`<span style="width:${s.percent}%;background:${this.colorOf(s.member)}"></span>`)}
         </div>
-        <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.member.name} ${s.percent}%</span>`)}</div>
+        <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.text}</span>`)}</div>
       </div>
     `;
   }
@@ -551,7 +553,7 @@ export class PvChoresMyDay extends LitElement {
         </div>
       ` : nothing}
       ${this.column.member.stars ? html`
-        <div class="label">Stickers this week${this.goal ? html` → ${pictureOf(this.goal.reward.icon)} ${this.goal.reward.name} at ${this.goal.reward.cost}` : nothing}</div>
+        <div class="label">${stickersLabel(stars)}${this.goal ? html` · Goal: ${pictureOf(this.goal.reward.icon)} ${this.goal.reward.name} · ${goalWords(this.goal)}` : nothing}</div>
         <div class="stickers" role="img" aria-label=${`${stars} stars this week`}>
           ${Array.from({ length: Math.min(30, stars) }, () => html`<span aria-hidden="true">⭐</span>`)}
           ${stars === 0 ? html`<span class="meta">Stars show up here.</span>` : nothing}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index 3d5b7d2..4390bc5 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -8,6 +8,7 @@ import type { Layout } from '../../core/layout';
 import type { Member } from '../../core/household';
 import '../../core/pv-member-avatar';
 import { choresStyles } from './chores-styles';
+import { goalWords } from './my-day-derive';
 import { redeemLabel } from './rewards-derive';
 import type { Balance, RewardCard } from './rewards-derive';
 import { pictureOf } from './pv-chore-tile';
@@ -222,7 +223,7 @@ export class PvChoresRewards extends LitElement {
                 <span class="stars num" aria-label=${`${b.member.name}: ${b.stars} stars`}>★ ${b.stars}</span>
                 <div class="goal">
                   ${b.goal ? html`
-                    Goal: ${pictureOf(b.goal.reward.icon)} ${b.goal.reward.name} · ${b.goal.need > 0 ? `${b.goal.need} more` : 'enough stars!'}
+                    Goal: ${pictureOf(b.goal.reward.icon)} ${b.goal.reward.name} · ${goalWords(b.goal)}
                     <div class="bar"><span style="width:${Math.round(b.goal.progress * 100)}%"></span></div>
                   ` : html`No goal yet`}
                 </div>
```

`custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts b/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
index f479da1..c3ef384 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
@@ -1,6 +1,6 @@
 import type { Member } from '../../../core/household';
 import { parseRule, ruleText, shortDate } from '../../../core/recurrence';
-import type { Activity, Band, ChoresSettings } from '../chores-types';
+import type { Activity, Band, ChoresSettings, ItemView } from '../chores-types';
 import { chorePicture } from '../picture-words';
 import { checkoffStars } from '../worth';
 
@@ -124,9 +124,22 @@ export function rhythmText(activity: Activity, today: string, timeFormat = '12h'
   return when ? `${amount.join(', ')} · ${when}` : amount.join(', ');
 }
 
+/**
+ * A Once chore whose open occurrence a parent gave a new due date (more time,
+ * or a change) says so: "On Oct 11 · moved to Oct 12" (milestone 8).
+ */
+function withMoved(rhythm: string, activity: Activity, items: readonly ItemView[], today: string): string {
+  if (activity.schedule !== 'once' || !activity.once) return rhythm;
+  const own = activity.once.on ?? activity.once.by;
+  const open = items.find(i => i.chore === activity.id && i.due_day && i.status !== 'done' && i.status !== 'pending' && i.status !== 'excused');
+  if (!own || !open?.due_day || open.due_day === own) return rhythm;
+  return `${rhythm} · moved to ${dayText(open.due_day, today)}`;
+}
+
 /** A chore as a row of the Chores list. */
 export function choreRow(
   activity: Activity, members: Member[], settings: Pick<ChoresSettings, 'minutes_per_star'>, today: string, timeFormat = '12h',
+  items: readonly ItemView[] = [],
 ): ChoreRow {
   const tags: string[] = [];
   if (planOnly(activity)) tags.push('Plan only');
@@ -136,7 +149,7 @@ export function choreRow(
     id: activity.id,
     name: activity.name,
     picture: chorePicture(activity.icon, activity.name),
-    rhythm: rhythmText(activity, today, timeFormat),
+    rhythm: withMoved(rhythmText(activity, today, timeFormat), activity, items, today),
     tags,
     stars: planOnly(activity) ? null : checkoffStars(activity, settings.minutes_per_star),
     people: members.filter(m => activity.assignees?.includes(m.id)),
@@ -151,13 +164,13 @@ export function choresList(
   activities: Activity[],
   members: Member[],
   settings: Pick<ChoresSettings, 'minutes_per_star'>,
-  options: { member?: string | null; search?: string; today: string; timeFormat?: string },
+  options: { member?: string | null; search?: string; today: string; timeFormat?: string; items?: readonly ItemView[] },
 ): ChoreList {
   const query = (options.search ?? '').trim().toLocaleLowerCase();
   const shown = activities.filter(a =>
     (!options.member || a.assignees?.includes(options.member)) && (!query || a.name.toLocaleLowerCase().includes(query)));
   const active = activities.filter(a => !a.finished_at);
-  const row = (a: Activity) => choreRow(a, members, settings, options.today, options.timeFormat);
+  const row = (a: Activity) => choreRow(a, members, settings, options.today, options.timeFormat, options.items);
   const groups = ORDER.map(id => ({
     id,
     label: GROUP_LABELS[id],
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
index 7bbb575..d20204c 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
@@ -127,6 +127,7 @@ export class PvChoresListPage extends LitElement {
     }
     const list = choresList(board.chores, members, board.settings, {
       member: this._member, search: this._search, today: board.today, timeFormat: this.data?.display?.time_format,
+      items: Object.values(board.members).flatMap(m => m.items),
     });
     const filtered = members.find(m => m.id === this._member) ?? null;
     return html`
```

`custom_components/planavista/frontend/src/modules/chores/week-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/week-derive.ts b/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
index 72b31f2..7cc65db 100644
--- a/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/week-derive.ts
@@ -1,6 +1,7 @@
 import type { Member } from '../../core/household';
 import { weekRangeLabel } from '../../utils/date-utils';
 import { dayDate, minutesText } from '../../core/status-map';
+import { FairShare, fairnessShares } from './fairness';
 import type { PastItem, WeekDay, WeekView, WeeklyEntry } from './chores-types';
 import { dayWords, addDays } from './options-derive';
 
@@ -146,15 +147,10 @@ export function weekHighlights(view: WeekView, members: Member[], limit = 3): Hi
 }
 
 /** Shared chores this week, by time done: everyone's minutes, for the fairness bar. */
-export function weekShares(view: WeekView, members: Member[]): Array<{ member: Member; minutes: number; text: string; percent: number }> {
-  const shares = members
+export function weekShares(view: WeekView, members: Member[]): FairShare[] {
+  return fairnessShares(members
     .filter(m => view.members[m.id])
-    .map(member => ({ member, minutes: view.members[member.id].contribution.shared_minutes }));
-  const total = shares.reduce((sum, s) => sum + s.minutes, 0);
-  if (total <= 0) return [];
-  return shares
-    .filter(s => s.minutes > 0)
-    .map(s => ({ ...s, text: `${s.member.name} ${minutesText(s.minutes)}`, percent: (100 * s.minutes) / total }));
+    .map(member => ({ member, minutes: view.members[member.id].contribution.shared_minutes })));
 }
 
 export type { PastItem };
```

`custom_components/planavista/frontend/src/shell/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/definition.ts b/custom_components/planavista/frontend/src/shell/definition.ts
index 51bc4ab..c4f0b12 100644
--- a/custom_components/planavista/frontend/src/shell/definition.ts
+++ b/custom_components/planavista/frontend/src/shell/definition.ts
@@ -55,7 +55,8 @@ export const shellSettingsPages: SettingsPage[] = [
     applies: ({ household }) => household !== null,
     summary: ({ household }) => {
       const pins = household?.members.filter(m => m.has_pin).length ?? 0;
-      const screen = household?.account.shared ? 'Shared screen' : 'Not a shared screen';
+      // Names the switch on the page (milestone 8): this screen, shared or not.
+      const screen = household?.account.shared ? 'This screen: shared family screen' : 'This screen: not shared';
       return pins > 0 ? `${screen} · ${count(pins, 'PIN', 'PINs')}` : screen;
     },
   },
```

`custom_components/planavista/frontend/src/shell/page-styles.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/page-styles.ts b/custom_components/planavista/frontend/src/shell/page-styles.ts
index 41c4d02..1ff6ba7 100644
--- a/custom_components/planavista/frontend/src/shell/page-styles.ts
+++ b/custom_components/planavista/frontend/src/shell/page-styles.ts
@@ -66,6 +66,8 @@ export function transitionCss(names: string[], kind: TransitionKind): string {
   if (names.length === 0 || kind === 'none') return '';
   const each = (pseudo: string) => names.map(name => `html[data-pv-vt]::view-transition-${pseudo}(${name})`).join(',');
   const rules = [
+    // The snapshots sit over the page while the change plays; a tap goes through them to the card (milestone 8).
+    'html[data-pv-vt]::view-transition{pointer-events:none}',
     'html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}',
     `${each('group')}{animation:none}`,
     `${each('old')},${each('new')}{animation:none;mix-blend-mode:normal}`,
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index a638c46..a535ac7 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -26,7 +26,7 @@ import {
   resolveModules,
 } from '../core/module-registry';
 import { HouseholdView, Member, SettingsAccess, parentsWithPins, settingsAccess, setupNeedsPin } from '../core/household';
-import type { PinGate } from '../core/pin-gate';
+import { PinGate, pinReason } from '../core/pin-gate';
 import type { Session } from '../core/session';
 import { HouseholdApi, UnlockResult } from '../core/household-client';
 import { AppearanceEdits } from '../core/appearance-edits';
@@ -639,7 +639,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         mode="unlock"
         .members=${sheet.purpose === 'module' ? sheet.members : view ? parentsWithPins(view.members) : []}
         .heading=${sheet.heading}
-        .reason=${sheet.purpose === 'module' ? sheet.reason ?? '' : ''}
+        .reason=${(sheet.purpose === 'module' ? sheet.reason : undefined) ?? pinReason(sheet.heading) ?? ''}
         .shuffle=${!!view?.security.shuffle_keypad}
         @pv-unlocked=${this._onUnlocked}
         @pv-sheet-close=${this._onSheetCancel}
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index e9be93f..6e9c487 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -8,6 +8,7 @@ import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
 import {
   AGE_GROUP_CHOICES,
   AGE_GROUP_CHORES_HINTS,
+  AgeGroup,
   HouseholdView,
   Member,
   Picture,
@@ -19,7 +20,7 @@ import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
 import { POP_PAGE, announceEditor, saveErrorMessage } from '../../core/page-host';
 import {
-  DraftRecord, PersonDraft, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft, withAgeGroup,
+  DraftRecord, PersonDraft, ageGroupNote, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft, withAgeGroup,
 } from '../../core/person-draft';
 import type { ModuleService } from '../../core/module-registry';
 import { PERSON_CHANGE, PersonSection, personSections } from '../../core/settings-registry';
@@ -52,6 +53,8 @@ export class PvSettingsPerson extends LitElement {
   @property({ type: Number }) revision = 0;
 
   @state() private _draft!: PersonDraft;
+  /** What the last age group change changed. */
+  @state() private _ageNote: string | null = null;
   @state() private _start!: PersonDraft;
   /** The revision the edit began from (null for someone new); Save sends it. */
   private _rev: number | null = null;
@@ -347,18 +350,21 @@ export class PvSettingsPerson extends LitElement {
     const kind = typeof picture.emoji === 'string' ? 'emoji' : picture.person ? 'photo' : 'initial';
     const photo = this._personPicture();
     // Photo means "their Home Assistant person's photo": it needs a linked
-    // person, and shows the initial until that person has a photo.
+    // person who has one, so it can't be picked before (milestone 8). A Photo
+    // saved before the photo exists shows the initial until it does.
     const linked = !!this._draft.person;
+    const usable = linked && !!photo;
+    const shown = kind === 'photo' && !usable ? 'initial' : kind;
     const choose = (next: Picture) => this._change({ picture: next });
     return html`
       <fieldset class="field">
         <legend>Picture</legend>
         <div class="pv-seg stretch" role="group" aria-label="Picture">
-          <button type="button" aria-pressed=${kind === 'initial' ? 'true' : 'false'}
+          <button type="button" aria-pressed=${shown === 'initial' ? 'true' : 'false'}
             @click=${() => choose({ initial: true })}>Initial</button>
-          <button type="button" aria-pressed=${kind === 'emoji' ? 'true' : 'false'}
+          <button type="button" aria-pressed=${shown === 'emoji' ? 'true' : 'false'}
             @click=${() => choose({ emoji: typeof picture.emoji === 'string' ? picture.emoji : '🙂' })}>Emoji</button>
-          <button type="button" aria-pressed=${kind === 'photo' ? 'true' : 'false'} ?disabled=${!linked}
+          <button type="button" aria-pressed=${shown === 'photo' ? 'true' : 'false'} ?disabled=${!usable}
             @click=${() => choose({ person: true })}>Photo</button>
         </div>
         ${kind === 'emoji' ? html`
@@ -369,8 +375,8 @@ export class PvSettingsPerson extends LitElement {
         ` : nothing}
         ${!linked
           ? html`<p class="hint">Link a Home Assistant person to use their photo.</p>`
-          : kind === 'photo' && !photo
-            ? html`<p class="hint">Their Home Assistant person has no photo yet, so their initial shows.</p>`
+          : !photo
+            ? html`<p class="hint">Their Home Assistant person has no photo yet. Add one there to use it here.</p>`
             : nothing}
       </fieldset>
     `;
@@ -391,17 +397,25 @@ export class PvSettingsPerson extends LitElement {
             return html`
               <label class="pv-choice">
                 <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
-                  @change=${() => this._changeDraft(withAgeGroup(this._draft, choice.id))} />
+                  @change=${() => this._pickAgeGroup(choice.id)} />
                 <span class="choice-text"><span class="choice-title">${choice.label}</span>${hint ? html`<span class="choice-sub">${hint}</span>` : nothing}</span>
                 <span class="choice-check" aria-hidden="true">✓</span>
               </label>
             `;
           })}
         </div>
+        ${this._choresOn && this._ageNote ? html`<p class="hint" role="status">${this._ageNote}</p>` : nothing}
       </fieldset>
     `;
   }
 
+  /** A new age group brings its defaults, and says what they changed (milestone 8). */
+  private _pickAgeGroup(age: AgeGroup): void {
+    const next = withAgeGroup(this._draft, age);
+    this._ageNote = ageGroupNote(this._draft, next);
+    this._changeDraft(next);
+  }
+
   /** The parts modules add at one slot of the page, such as the chores rows. */
   private _renderSections(slot: PersonSection['slot'], member: Member | null) {
     const context = { household: this.household, data: this.data, services: this.services };
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
index d937cba..2486ee1 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings-customize.ts
@@ -38,8 +38,9 @@ const VERSION_LABELS: Record<Mode, string> = { light: 'Light', dark: 'Dark' };
 
 type ShapeKey = 'corner_style' | 'shadow_depth' | 'event_style';
 const SHAPE_CHOICES: Array<{ key: ShapeKey; label: string; options: Array<[string, string]> }> = [
-  { key: 'corner_style', label: 'Corners', options: [['sharp', 'Sharp'], ['rounded', 'Rounded'], ['pill', 'Pill']] },
-  { key: 'shadow_depth', label: 'Shadows', options: [['none', 'None'], ['subtle', 'Subtle'], ['bold', 'Bold']] },
+  // "Theme" is the theme's own corners or shadows, which may be none of the others (milestone 8).
+  { key: 'corner_style', label: 'Corners', options: [['', 'Theme'], ['sharp', 'Sharp'], ['rounded', 'Rounded'], ['pill', 'Pill']] },
+  { key: 'shadow_depth', label: 'Shadows', options: [['', 'Theme'], ['none', 'None'], ['subtle', 'Subtle'], ['bold', 'Bold']] },
   { key: 'event_style', label: 'Events', options: [['stripes', 'Stripes'], ['solid', 'Solid']] },
 ];
 
@@ -385,8 +386,8 @@ export class PvSettingsCustomize extends LitElement {
     return html`
       <div class="shape">
         ${SHAPE_CHOICES.map(group => {
-          // Events start as Stripes; corners and shadows start as the theme's own, which may be none of these.
-          const chosen = shape[group.key] ?? (group.key === 'event_style' ? 'stripes' : undefined);
+          // Events start as Stripes; corners and shadows start as the theme's own ("Theme").
+          const chosen = shape[group.key] ?? (group.key === 'event_style' ? 'stripes' : '');
           return html`
             <div role="group" aria-label=${group.label}>
               <span class="shape-label">${group.label}</span>
@@ -394,7 +395,7 @@ export class PvSettingsCustomize extends LitElement {
                 ${group.options.map(([value, label]) => html`
                   <button type="button"
                     aria-pressed=${chosen === value ? 'true' : 'false'}
-                    @click=${(e: Event) => this._setShape({ [group.key]: value } as Partial<ThemeShape>, e)}>${label}</button>
+                    @click=${(e: Event) => this._setShape({ [group.key]: value || undefined } as Partial<ThemeShape>, e)}>${label}</button>
                 `)}
               </div>
             </div>
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 2f6fa24..3400282 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -179,7 +179,7 @@ export class PvSettings extends LitElement {
       }
 
       .group {
-        margin-bottom: 14px;
+        margin-bottom: 10px;
       }
 
       .group-label {
@@ -240,8 +240,11 @@ export class PvSettings extends LitElement {
         font-size: 1.25rem;
       }
 
+      /* Compact, so the page list fits a landscape screen 800 px tall (milestone 8); the whole list scrolls. */
       .look-row {
         align-items: flex-start;
+        min-height: 48px;
+        padding: 6px 12px;
         background: color-mix(in srgb, #F59E0B 12%, transparent);
       }
 
@@ -268,7 +271,11 @@ export class PvSettings extends LitElement {
       }
 
       .look-text {
-        font-size: 0.9375rem;
+        display: -webkit-box;
+        -webkit-box-orient: vertical;
+        -webkit-line-clamp: 2;
+        overflow: hidden;
+        font-size: 0.875rem;
         line-height: 1.35;
       }
 
@@ -284,6 +291,12 @@ export class PvSettings extends LitElement {
         padding: 12px 20px 40px;
       }
 
+      /* Every page the same column (milestone 8): 640 px at most, from the left. */
+      .page-el {
+        display: block;
+        max-width: 640px;
+      }
+
       .page-heading {
         font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
         margin: 6px 0 16px;
```

`custom_components/planavista/frontend/src/styles/settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/styles/settings.ts b/custom_components/planavista/frontend/src/styles/settings.ts
index ece84ca..5065bf1 100644
--- a/custom_components/planavista/frontend/src/styles/settings.ts
+++ b/custom_components/planavista/frontend/src/styles/settings.ts
@@ -3,8 +3,6 @@ import { css } from 'lit';
 /** Styles that Settings pages and setup steps share (moved from the setup wizard). */
 export const settingsPageStyles = css`
 .page-content {
-        max-width: 560px;
-        margin: 0 auto;
         animation: pv-slideLeft 250ms ease forwards;
       }
 .page-title {
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1167 passed`; the task's own files `92 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** The Needs a look card is compact; every Settings page is one 640 px column from the left; Customize marks Theme; Photo waits for a photo; a new age group says what it changed.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(card): the smaller fixes from the review

- Week and My day share their words: "Blair 1 h · 100%", "Goal: Ice cream
  trip · 18 more ★", "This week: 5 ★".
- A one-time chore's row in Settings shows a new due date ("On Oct 11 ·
  moved to Oct 12").
- Changing someone's age group says what it changed; the People list says
  "Parent · Teen" for a parent who isn't an adult.
- My day's Timeline puts a check-off waiting for OK at its time, and shows
  each time once.
- The options sheet names the person who added a chore, never an account.
- Photo can be picked once the person's Home Assistant person has a photo.
- The PINs row says whether this screen is shared; the PIN sheet always
  says why it is asking.
- The inbox and the Day view use the shared empty state; Settings pages
  share one column, and the Needs a look card is compact.
- A tap during the light and dark change goes through to the card.
- Customize marks the theme's own corners and shadows.
- The README suggests a matching Home Assistant theme for wall tablets.
```

---

### Task 17: Session times are whole seconds whatever the clock's fractions

Spec 3.8.

**Files:**
- Modify: `custom_components/planavista/household/websocket.py`, `tests/test_pins.py`

- [ ] **Step 1: Write the failing tests.**

`tests/test_pins.py`:

```diff
diff --git a/tests/test_pins.py b/tests/test_pins.py
index c272d81..9db16f8 100644
--- a/tests/test_pins.py
+++ b/tests/test_pins.py
@@ -335,3 +335,15 @@ async def test_parent_mode_ends_at_its_cap(
     clock[0] += 61
     reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
     assert reply["error"]["code"] == "session_ended"
+
+
+async def test_session_seconds_are_whole_even_when_the_clock_is_not(
+    hass: HomeAssistant, household: Any, kitchen: Any, monkeypatch: pytest.MonkeyPatch
+) -> None:
+    """A monotonic clock like 1000.3000000000001 must not turn 60 seconds into 61."""
+    monkeypatch.setattr(household_ws, "_monotonic", lambda: 1000.3000000000001)
+    household.data["security"]["session_idle_seconds"] = 60
+    result = await _unlock(kitchen, "blair", PIN)
+    assert result["expires_in"] == 60
+    touch = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": result["session"]})
+    assert touch["result"]["expires_in"] == 60
```

- [ ] **Step 2: Run them and see them fail.** `bash scripts/test-backend.sh -q tests/test_pins.py` Expected: the new tests fail (a missing export or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 8dedc5f..9ca8dea 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -525,6 +525,11 @@ async def ws_config_save(
 
 # PIN fields accept any value; the handler checks the format with a fixed
 # message, so Home Assistant's error logging can never quote a PIN.
+def _whole_seconds(seconds: float) -> int:
+    """Seconds for the card, rounded up, after the clock's float noise is gone (60.000000000007 is 60)."""
+    return max(0, math.ceil(round(seconds, 3)))
+
+
 INVALID_PIN = "PINs are 4 to 6 digits."
 EASY_PIN = "That PIN is easy to guess: the same digit, a run, or straight down the keypad. Try another."
 
@@ -613,9 +618,9 @@ async def ws_pin_unlock(
             "session": session.token,
             "member_id": member_id,
             "parent": session.parent,
-            "expires_in": math.ceil(household.sessions.expires_in(session, now)),
-            "idle_seconds": math.ceil(idle),
-            "cap_in": math.ceil(cap),
+            "expires_in": _whole_seconds(household.sessions.expires_in(session, now)),
+            "idle_seconds": _whole_seconds(idle),
+            "cap_in": _whole_seconds(cap),
         },
     )
 
@@ -739,7 +744,7 @@ def ws_pin_touch(
     if session is None:
         send_refusal(connection, msg, "session_ended", "The PIN session ended.")
         return
-    connection.send_result(msg["id"], {"expires_in": math.ceil(household.sessions.expires_in(session, now))})
+    connection.send_result(msg["id"], {"expires_in": _whole_seconds(household.sessions.expires_in(session, now))})
 
 
 HOUSEHOLD_COMMANDS = (
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1167 passed`; `bash scripts/test-backend.sh -q` Expected: `1092 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on the dev Home Assistant.** None (pinned by a test with the clock value that showed it).

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
fix: session times are whole seconds whatever the clock's fractions

Unlocking and touching a session could say 61 seconds for a 60-second
quiet time, because the monotonic clock's float arithmetic rounded up.
```

---

### Task 18: 1.5.0, the design system's controls, and the bundle

Spec 4, 5.

**Files:**
- Modify: `DESIGN_SYSTEM.md`, `custom_components/planavista/const.py`, `custom_components/planavista/frontend/dist/planavista-cards.js`, `custom_components/planavista/frontend/package-lock.json`, `custom_components/planavista/frontend/package.json`, `custom_components/planavista/manifest.json`, `docs/superpowers/specs/2026-10-12-one-product-design.md`

- [ ] **Step 1: Make them pass.**

`DESIGN_SYSTEM.md`:

```diff
diff --git a/DESIGN_SYSTEM.md b/DESIGN_SYSTEM.md
index 4596b73..1a30177 100644
--- a/DESIGN_SYSTEM.md
+++ b/DESIGN_SYSTEM.md
@@ -111,7 +111,9 @@ Twenty presets in two palettes. Each has a color and a light fill for its events
 | Oxidized Iron | `#AE2012` | `#E3B1AC` | Blue Slate | `#577590` | `#C4CFD8` |
 | Brown Red | `#9B2226` | `#DCB2B3` | Cerulean | `#277DA1` | `#B3D2DE` |
 
-A custom color gets its fill computed for it. In dark mode both are derived in OKLCH (section 5.3), so contrast is measured rather than eyeballed.
+A custom color gets its fill computed for it, 65 percent of the way to white, as every preset's fill is. In dark mode both are derived in OKLCH (section 5.3), so contrast is measured rather than eyeballed.
+
+**One color per person.** A person's color is set once, on their page in People, and both modules draw it: the board, rings, avatars, and every calendar that belongs to them, with its fill made from that color. A calendar that belongs to nobody keeps its own color and picker.
 
 ### 4.3 Text on color
 
@@ -335,6 +337,27 @@ The calendar's event details (`pv-event-popup`) and New event and Edit event (`p
 - Fifteen animated icons. The condition text is capitalized, with hyphens as spaces.
 - Without a weather entity the space collapses, with no placeholder.
 
+### 11.9 Controls: one for each kind of choice
+
+The shared styles live in `styles/controls.ts`; each site keeps its own buttons, inputs, and handlers.
+
+| Job | Control | Where |
+|---|---|---|
+| Pick one of a few | Segmented: a grey track, the chosen choice on a white chip, 48 px tall, choices keep their width | The module switcher and views, My day's style, quick add's When, Motion, every Settings segment, the repeat picker, a person's Picture, Lock after no touches |
+| Pick from named choices with a line each | Choice rows around real radios, a check on the chosen row | Age group, the missed rule |
+| Pick a look | Picture cards that preview | Light, Dark, Automatic, and the themes |
+| Whose view this is | The people strip: round faces with names, the shown one filled with its color; it never shrinks | The phone board, Day when its lanes are hidden, My day |
+| Who something is for | Person chips: avatar chips with the person's color ring and a check | New event's Who, quick add, a chore's people, a reward's who |
+| A label on a row | A tag: one pill in sentence case (muted, OK, ask, attention) | Parent, Needs an OK, Plan only |
+| On or off | One toggle, 44 by 24 with a 48 px hit area | Every on/off setting |
+| A date or a time | The event editor's month grid and time list, shared (`pv-date-field`, `pv-time-field`) | Every date and time; no native inputs |
+
+Buttons are one family: primary (filled, one per screen), secondary, and text, 48 px tall with one radius. A disabled button is dimmed and shows nothing to press. Deleting is a secondary button with red text (`--pv-danger-ink`) set apart at the end; a fill uses `--pv-danger`.
+
+Sheets end the same way: an editing sheet with Cancel then its action; a read-only sheet with its actions, Delete set apart, and Done last. A sheet opens with focus on its title. Settings editors put Cancel and Save in the Settings header so Save stays in view.
+
+The PIN session strip shows whose session is open, a parent's or a child's, in their color, with the countdown and Lock. The PIN sheet always says why it is asking ("To change Team standup").
+
 ### 11.8 Card options
 
 Settings are saved for the whole household; a card's YAML can override some for that card:
@@ -357,6 +380,16 @@ hide_header: false
 
 ## 12. Design changelog
 
+### 2026-10-12: Changed: one product (1.5.0)
+
+- One control for each kind of choice (section 11.9), and one button family with a disabled look and one red for deleting.
+- One color per person in both modules; a calendar that belongs to someone draws its person's color.
+- Every sheet ends the same way; Settings editors keep Save in view; one toast, light in dark mode.
+- Dates and times picked one way everywhere; both Week views share one toolbar.
+- The PIN strip for a child's unlocked time too; the PIN sheet says why it is asking.
+- One event in every view; all-day events with Starts and Ends.
+- Settings pages share one column.
+
 ### 2026-10-11: Changed: the calendar takes on the rest (1.4.0)
 
 - Event details, New event, and Edit event are sheets like the chores sheets, with focus traps, Escape, focus returned, and a question before typing is thrown away.
```

`custom_components/planavista/const.py`:

```diff
diff --git a/custom_components/planavista/const.py b/custom_components/planavista/const.py
index c69cbb9..6238ffd 100644
--- a/custom_components/planavista/const.py
+++ b/custom_components/planavista/const.py
@@ -3,7 +3,7 @@ from typing import Final
 
 DOMAIN: Final = "planavista"
 NAME: Final = "PlanaVista"
-VERSION: Final = "1.4.0"
+VERSION: Final = "1.5.0"
 
 # Event fetching range
 EVENT_RANGE_PAST_DAYS: Final = 30
```

`custom_components/planavista/frontend/dist/planavista-cards.js`: rebuilt with `npm run build` (not copied; the build is deterministic).

`custom_components/planavista/frontend/package-lock.json`:

```diff
diff --git a/custom_components/planavista/frontend/package-lock.json b/custom_components/planavista/frontend/package-lock.json
index 39ecd13..0911021 100644
--- a/custom_components/planavista/frontend/package-lock.json
+++ b/custom_components/planavista/frontend/package-lock.json
@@ -1,12 +1,12 @@
 {
   "name": "planavista-cards",
-  "version": "1.4.0",
+  "version": "1.5.0",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
       "name": "planavista-cards",
-      "version": "1.4.0",
+      "version": "1.5.0",
       "license": "MIT",
       "dependencies": {
         "custom-card-helpers": "^1.9.0",
```

`custom_components/planavista/frontend/package.json`:

```diff
diff --git a/custom_components/planavista/frontend/package.json b/custom_components/planavista/frontend/package.json
index 14bd859..e368c23 100644
--- a/custom_components/planavista/frontend/package.json
+++ b/custom_components/planavista/frontend/package.json
@@ -1,6 +1,6 @@
 {
   "name": "planavista-cards",
-  "version": "1.4.0",
+  "version": "1.5.0",
   "description": "PlanaVista cards for Home Assistant",
   "author": "Stephen Hall",
   "license": "MIT",
```

`custom_components/planavista/manifest.json`:

```diff
diff --git a/custom_components/planavista/manifest.json b/custom_components/planavista/manifest.json
index 2e08069..83b441d 100644
--- a/custom_components/planavista/manifest.json
+++ b/custom_components/planavista/manifest.json
@@ -11,5 +11,5 @@
   "issue_tracker": "https://github.com/tavenhall1/planavista/issues",
   "requirements": [],
   "single_config_entry": true,
-  "version": "1.4.0"
+  "version": "1.5.0"
 }
```

`docs/superpowers/specs/2026-10-12-one-product-design.md`:

```diff
diff --git a/docs/superpowers/specs/2026-10-12-one-product-design.md b/docs/superpowers/specs/2026-10-12-one-product-design.md
index c5fb252..bba2bcc 100644
--- a/docs/superpowers/specs/2026-10-12-one-product-design.md
+++ b/docs/superpowers/specs/2026-10-12-one-product-design.md
@@ -89,8 +89,8 @@ Release 1.4.0 works end to end, but underneath it is still two products in one s
 - **Pick one of a few** (the module switcher, the views, My day's style, quick add's When, Motion, every Settings editor's segments, the repeat picker, a person's Picture): one segmented control.
   - Its look: a grey track, a white selected chip with a light shadow, labels at 0.875rem 650, 48 px tall.
   - The accent fill is kept for buttons that do something, never for "where am I".
-- **Pick from a list of named choices** (Age group, the missed rule, Theme, Default view, Time format, First day, Customize's options): one choice-row or choice-card style, the one Appearance uses for Light, Dark, Automatic. Native radios go.
-  - The option in effect is always marked selected, including a theme's own value ("Theme default").
+- **Pick from a list of named choices** with a line of explanation (Age group, the missed rule): one grouped list of rows around real radio inputs, the chosen row marked with a check, as in a phone's settings. Appearance's Light, Dark, Automatic and its themes stay picture cards, because they preview; setup's choice cards already mark the chosen card. Shorter choices (Default view, Time format, First day, Customize's shape) use the segmented control.
+  - The option in effect is always marked chosen, including a theme's own value (Customize's "Theme").
 - **People:** two patterns, by job.
   - A **people strip** chooses whose view you're looking at: the phone board, Day on a phone, and My day. It uses round faces with names, and the one shown is filled with its color.
   - **Person chips** choose who something is for: New event's Who, quick add, a chore's people, and a reward's who. They are avatar chips, selected with the person's color ring and a check.
@@ -151,17 +151,18 @@ Release 1.4.0 works end to end, but underneath it is still two products in one s
 
 ## 4. Architecture
 
-- `core/pv-segmented.ts` (new): the one segmented control (options, value, a change event; keyboard arrows; 48 px).
-- `core/pv-people-strip.ts`, `core/pv-person-chips.ts` (new): the two people patterns.
-- `core/pv-date-picker.ts`, `core/pv-time-picker.ts` (new): moved out of the event editor, unchanged in behavior.
-- `core/access.ts`: `eventAccess(view, session, memberIds, unlinked)` mirrors 9.5 for events (pure, tested).
-- `core/session.ts` and `household/security.py`: sessions carry their start; `SessionManager` ends a session after the household's idle time or its cap; the card's ring counts down to the earlier end.
-- `household/security.py`: `easy_pin(pin)`, with the cases in `tests/fixtures/easy_pins.json` shared by the Python and card tests.
-- `core/place.ts` (new): the remembered module and view (localStorage `planavista.place`, keyed by the dashboard path and the card's configuration; entries older than an hour are ignored).
-- `modules/calendar/calendar-derive.ts`: one merge of event copies for every view, and a calendar's color from its member (`memberColors`).
-- `shell/pv-parent-strip.ts` becomes the session strip for any session (parent or child).
-- `styles/shared.ts` and `styles/theme-pairs.ts`: one button family with a disabled look, `--pv-danger` and `--pv-danger-ink`, one toggle, one tag, one section head.
-- `chores/runtime.py` and `diagnostics.py`: a ring of the last 20 command refusals.
+- `styles/controls.ts` (new): the one look for each kind of choice, as shared styles over each site's own buttons and inputs (no new elements, so sites keep their handlers and keyboard focus): `.pv-seg` (segmented), `.pv-choices` (choice rows), `.pv-tag` (tags), `.pv-people` (the people strip), `.pv-person-chips` (person chips). `core/people-strip.ts` picks whose view opens first.
+- `core/pickers.ts`, `core/picker-views.ts`, `styles/pickers.ts` (new), with `core/pv-date-field.ts` and `core/pv-time-field.ts`: the event editor's month grid and time list, shared. The editor draws them in its own dropdowns; the two fields open them inline everywhere else.
+- `core/access.ts`: `eventAccess(view, session, owners)` and `eventPinChoices(view, owners)` mirror 9.5 for events (pure, tested). `modules/calendar/event-gate.ts` (new) asks for the PIN from the details sheet and the editor. `core/pin-gate.ts` `pinReason` gives every PIN question its why line.
+- `core/session.ts`, `shell/session-controller.ts`, and `household/security.py`: sessions carry their start; `SessionManager(limits)` ends a session after the household's quiet time or its cap, both read at every check; a command the backend accepted counts as a touch on the card too (`WsApi` onSessionUsed).
+- `household/security.py` `easy_pin(pin)` and `core/keypad.ts` `easyPin`, both checked against `tests/fixtures/easy_pins.json`.
+- `core/place.ts` (new): the remembered module and views (localStorage `planavista.place`, keyed by the dashboard path and the card's configuration; places last on screen more than an hour ago are ignored).
+- `modules/calendar/mode-colors.ts`: a linked calendar's colors come from its member (`withModeColors(data, mode, members)`), with `core/color.ts` `lightTint`. `modules/calendar/settings/calendars-page.ts` shows Set in People (`rowColor`).
+- `modules/calendar/utils/event-utils.ts` `sameEventKey`: one key for an event's copies, used by Week's merge, the Day view's faces, the details sheet (`eventForPopup`), and Day's all-day row (`groupSameEvents`).
+- `shell/pv-parent-strip.ts` is the strip for any session, a parent's or a child's.
+- `styles/shared.ts`, `styles/theme-pairs.ts`, and `styles/sheet.ts`: one button family with a disabled look, `--pv-danger` and `--pv-danger-ink`, one toggle, toast tokens, one sheet heading and footer.
+- `refusals.py` (new) and `diagnostics.py`: the last 20 refusals from the household and chores commands.
+- `modules/chores/recent-checkoffs.ts` and `fairness.ts` (new), with the chores derive modules: each toast's Undo, one fairness line, the goal and sticker words.
 - No new Store files. Two added fields under `security` in the household Store (`session_idle_seconds`, `parent_mode_minutes`). Older releases ignore them, so a step back to 1.4.0 keeps working.
 
 ## 5. Testing
```

- [ ] **Step 2: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1167 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 3: Check it on the dev Home Assistant.** The dev Home Assistant serves planavista-cards.js?v=1.5.0.

- [ ] **Step 4: Commit** with this message and the two trailer lines:

```text
chore: 1.5.0, the design system's controls, and the bundle

- DESIGN_SYSTEM: one control for each kind of choice, one color per
  person, and the changelog for 1.5.0.
- The design document records what was built.
- Version 1.5.0 in the manifest, the card, and the integration.
```

---
