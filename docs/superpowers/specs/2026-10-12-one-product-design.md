# Milestone 8: one product (design)

**Status:** approved by the owner on 2026-10-12 ("Yes to all fixes").
**Source:** the final review of release 1.4.0 (two reviewers: the product against its objectives and the design directives; a like-for-like inventory of every control plus the household's journeys run end to end), merged into one list, plus the owner's own questions about PINs and parent mode.
**Release:** 1.5.0, after the demo and the owner's go-ahead.
**Sample household:** the one in the chores spec (Alex and Blair parents, Casey a teen, Dana a young child).

## 1. Goal and done when

Release 1.4.0 works end to end, but underneath it is still two products in one shell. The calendar and Chores disagree about who a person is, who may change what, and what an event is, and the same kind of control is drawn two or three ways depending on which screen built it.

**Done when:**
- A person has one color, one picture, and one set of permissions in both modules.
- An event tells the same story in every view.
- Every kind of control (pick one, pick people, buttons, sheets, confirmations, toasts, tags, pickers, toolbars) has one look and one place, written down in `DESIGN_SYSTEM.md`.
- Every finding of the merged review is fixed or ruled on.
- The household's journeys (the kitchen screen's morning, stars to a reward, the to-do lists, a calendar week, Settings by account, appearance, moving around, offline and back, My day and Week) still work end to end on the dev Home Assistant in portrait, landscape, and on a phone.

## 2. Decisions

| # | Decision | Owner's call |
|---|---|---|
| D1 | Calendar events follow the chores permission rule (chores spec 9.5): an event only on your own calendar is a member-level change; an event on anyone else's calendar, on several people's, or on a calendar that belongs to nobody is a parent-level change. | Yes |
| D2 | New chore stays in the bar when a parent unlocks the screen. The parent-mode strip holds who, the countdown, and Lock (this replaces spec 9.4's strip button). | Yes |
| D3 | The session times are household settings: **Lock after no touches** 30 seconds, 1 minute, 2 minutes (default), or 5 minutes; **Parent mode ends after** 5, 10 (default), 15, or 30 minutes however much the screen is touched. Neither offers Never. Both apply to a child's PIN window too. The pause after wrong PINs (5 tries, then 30 seconds doubling to 15 minutes) stays fixed. | Yes |
| D4 | Easy PINs are turned away when a PIN is chosen (all one digit, a straight run up or down, the keypad's middle column), and a parent choosing a PIN is told that 6 digits is much harder to guess. 4 to 6 digits stay allowed. | Yes |
| D5 | A child's PIN window shows the same strip as parent mode, in the child's color, with its countdown and Lock. | Yes |

## 3. What the person sees

### 3.1 One color per person

- A person's color is set in one place, their page in People, and both modules draw it: the board, rings, avatars, the calendar's events and chips, Day lanes, and Week and Month chips.
- A calendar that belongs to someone draws its person's color and a pale tint made from it. The Calendars page shows that calendar's color as the person's, with "Set in People" instead of a second picker.
- A calendar that belongs to nobody keeps its own color and picker.
- Dark mode brightens a person's color the same way everywhere (the existing Matched rule).

### 3.2 Who may change calendar events (D1)

- **Your own login:** you may add, edit, and delete events that are only on your own calendar. A parent's login may change any event. A teen's or child's login sees Edit and Delete only on their own events. New event offers only their own calendar in Who.
- **The shared kitchen screen:** an event only on the calendar of someone without a PIN can be changed straight away. An event on the calendar of someone with a PIN asks for that person's PIN or a parent's. An event on someone else's calendar, on several people's, or on a calendar that belongs to nobody asks for a parent's PIN. The PIN sheet says why it is asking ("To change Team standup").
- **What stays outside PlanaVista:** this is the card's rule. Home Assistant's own calendar page and its actions stay as Home Assistant allows them; the README says so.

### 3.3 One event in every view

- An event that sits on several people's calendars (the copies Home Assistant keeps for each) is one event in every view.
  - Week, Month, and Agenda already merge the copies.
  - Day now draws the event in each person's lane, and tapping it opens the same details: everyone it is for, and Delete for everyone or Remove someone.
  - Day's all-day row shows one pill per event, with the people's avatars.
- The details sheet names everyone the event is for, the same way in every view: people chips, even for one person.

### 3.4 All-day events over several days

- With All day on, the editor shows **Starts** and **Ends** dates. A trip from Friday to Sunday is one event. Editing keeps both days.
- Home Assistant stores an all-day event's end as the day after; the editor shows the last day.

### 3.5 The board

- **Done today lists every chore done today,** including ones from a part of the day that is over, so a mistaken check-off can be unchecked on the board with the same hold. A finished part of the day keeps its "Morning · 2 done" heading.
- **"Who did it?"** says "They get the credit and the stars" only when the person picked earns stars; otherwise "They get the credit".
- **Undo always answers in words:** "Make your bed is open again." If Home Assistant refuses, the toast says why, on the card where it was tapped.
- **Asking for a reward** confirms with a toast ("Asked for Pick the weekend game. A parent will look."), and the card's Redeem waits ("Waiting for OK") until a parent answers.
- **Diagnostics** list the last 20 refusals (time, command, reason; no PINs, names, or user ids), so a report like "Undo did nothing" can be traced.

### 3.6 The phone

- The board opens on the account's own person (Casey's phone opens on Casey); a shared or admin login opens on the first person.
- The people strip above it never shrinks; names stay whole.
- Day shows one person at a time with the same people strip, starting on the account's own person. A horizontal swipe still changes the day.

### 3.7 Coming back where you were

- Each card on each device remembers its module and view.
- When the card comes back within an hour (a Home Assistant restart or update, a reconnect, a reload), it opens where it was. After that it opens on its configured start, so a morning starts where the household set it.
- Dates are not remembered: a card comes back on today.

### 3.8 PINs and sessions (D3, D4, D5)

- **Settings, PINs and parent mode** gains two rows next to Shuffle the keypad:
  - Lock after no touches: 30 seconds, 1 minute, 2 minutes, 5 minutes.
  - Parent mode ends after: 5, 10, 15, 30 minutes.
- **The strip:** parent mode and a child's PIN window show the same strip at the top, in the person's color and picture, with whose it is, a countdown ring, and Lock.
  - The ring counts down to whichever comes first: no touches for the set time, or the end of the window.
  - In parent mode the strip holds no other buttons (D2).
- **Choosing a PIN:** an easy PIN gets "Pick a PIN that's harder to guess: not all one digit, a run like 1234, or 2580." A parent's keypad says "4 to 6 digits. 6 is much harder to guess." Unlocking with an existing easy PIN still works.

### 3.9 One control for each job

- **Pick one of a few** (the module switcher, the views, My day's style, quick add's When, Motion, every Settings editor's segments, the repeat picker, a person's Picture): one segmented control.
  - Its look: a grey track, a white selected chip with a light shadow, labels at 0.875rem 650, 48 px tall.
  - The accent fill is kept for buttons that do something, never for "where am I".
- **Pick from a list of named choices** with a line of explanation (Age group, the missed rule): one grouped list of rows around real radio inputs, the chosen row marked with a check, as in a phone's settings. Appearance's Light, Dark, Automatic and its themes stay picture cards, because they preview; setup's choice cards already mark the chosen card. Shorter choices (Default view, Time format, First day, Customize's shape) use the segmented control.
  - The option in effect is always marked chosen, including a theme's own value (Customize's "Theme").
- **People:** two patterns, by job.
  - A **people strip** chooses whose view you're looking at: the phone board, Day on a phone, and My day. It uses round faces with names, and the one shown is filled with its color.
  - **Person chips** choose who something is for: New event's Who, quick add, a chore's people, and a reward's who. They are avatar chips, selected with the person's color ring and a check.
- **Tags** (Parent, Needs an OK, Plan only, Waiting for OK on a tile): one pill style in sentence case.
- **Status badges** keep the status map, in sentence case.
- **Section heads:** sentence case everywhere (no uppercase), 0.8125rem 750 in the muted text color.
- **Switches:** one size (the 44 by 24 toggle with a 48 px hit area) for every on/off setting.
- **Buttons:**
  - One radius, height (48 px), and weight per kind: primary, secondary, and text.
  - Disabled buttons look disabled: lower opacity, no hover, and the pointer shows nothing to press.
- **Touch targets:** every control a finger uses is at least 48 by 48 px, including segments, chips, steppers, the chores Week arrows, the inbox buttons, and Redeem.

### 3.10 Sheets and editors

- **Editing sheets** (New event and Edit event, quick add, a reward's editor sheet) end with a footer: Cancel on the left as secondary, and the action on the right as primary (Add or Save).
- **Read-only sheets** (an event's details, a chore's options, a past day, a reward, the inbox, Who did it?) end with a full-width secondary Done. The sheet's own actions sit above it.
- **Settings editors** (a person's page, the chore editor, the reward editor): while one is open, the Settings header holds Cancel on the left and Save on the right, so Save stays in view however long the page is.
  - Save is the one primary on screen, enabled once something changed.
  - Settings' own Done is a text button and steps aside while an editor is open.
- **Sheet titles:** one style. Left aligned, the rounded face at 1.25rem 800, under the grabber.
- **Confirmations:** the named destructive action comes first, then Cancel, everywhere: "Delete Laundry", "Delete for everyone", "Remove Alex", "Discard changes".
- **Delete in place:** one style. A secondary button with red text at the end of the sheet or editor, set apart from the other actions.
  - One red pair of tokens serves every destructive use: `--pv-danger` for fills and `--pv-danger-ink` for text, light and dark.
- **Naming:** creating something is "New ..." everywhere: New event, New chore, New reward, New person.
  - Delete is for a thing that goes away: a chore, a reward, an event. Remove is for taking someone or something off: a person from the household, a person from an event, a PIN, a day away.
  - Inside a sheet, Edit is just "Edit".
- **One primary per screen:** list rows (the inbox's Looks good and Approve, the rewards' Redeem) are secondary with accent text. On Import and export, Import a plan is primary and Restore is secondary.
- **Toasts:** one toast everywhere (chores, the calendar, Settings, setup): token colors, actions on the right, and a full stop at the end of every message.
- **Focus:** a sheet opens with focus on its title, so nothing looks pre-selected. Focus rings show only for the keyboard.

### 3.11 Pickers and toolbars

- **Dates and times** are picked one way everywhere: the event editor's month grid and its time list, made shared. This covers the chore editor's dates, the repeat picker's start and end, bedtimes, the evening check time, and quick add's date. Native date and time inputs go.
- **The two Week views share one toolbar grammar:**
  - 48 px round arrows with icons.
  - The range title in the rounded face at 1.125rem.
  - A Today (or This week) button that is always there, quiet when already on it.
  - Month's title is left aligned like Week's.
- Time ranges use an en dash everywhere ("9:00 AM – 9:30 AM"), My day included.

### 3.12 Smaller fixes

- The fairness strip reads the same in Week and My day ("Blair 1 h · 100%").
- A goal reads one way: "Goal: 🍦 Ice cream trip · 18 more ★". My day's stickers say "This week: 5 ★".
- A chore's row in Settings shows a standing new date ("On Oct 11 · moved to Oct 12").
- People has one New person button.
- Changing a person's age group says what it changed ("Now Timeline, and earns stars").
- The People row names the age group of a parent who isn't an adult ("Parent · Teen").
- My day's Timeline puts a chore done earlier at the time it was done, not after the now line, and shows that time once.
- The options sheet says "Added on Saturday" when an admin account added a chore (an account isn't a person).
- A person's Picture can't select Photo when their Home Assistant person has no photo.
- The PINs row says "This screen: shared family screen" or "This screen: not shared".
- Empty states use the shared designed state everywhere (the inbox's and Day's own versions go).
- The PIN sheet always says why it is asking.
- Settings' page list fits a landscape screen 800 px tall (the Needs a look card is compact, and the list scrolls).
- A tap made during the light and dark change is not lost.
- The README says to pair Automatic with Home Assistant's own dark theme on a wall tablet.

## 4. Architecture

- `styles/controls.ts` (new): the one look for each kind of choice, as shared styles over each site's own buttons and inputs (no new elements, so sites keep their handlers and keyboard focus): `.pv-seg` (segmented), `.pv-choices` (choice rows), `.pv-tag` (tags), `.pv-people` (the people strip), `.pv-person-chips` (person chips). `core/people-strip.ts` picks whose view opens first.
- `core/pickers.ts`, `core/picker-views.ts`, `styles/pickers.ts` (new), with `core/pv-date-field.ts` and `core/pv-time-field.ts`: the event editor's month grid and time list, shared. The editor draws them in its own dropdowns; the two fields open them inline everywhere else.
- `core/access.ts`: `eventAccess(view, session, owners)` and `eventPinChoices(view, owners)` mirror 9.5 for events (pure, tested). `modules/calendar/event-gate.ts` (new) asks for the PIN from the details sheet and the editor. `core/pin-gate.ts` `pinReason` gives every PIN question its why line.
- `core/session.ts`, `shell/session-controller.ts`, and `household/security.py`: sessions carry their start; `SessionManager(limits)` ends a session after the household's quiet time or its cap, both read at every check; a command the backend accepted counts as a touch on the card too (`WsApi` onSessionUsed).
- `household/security.py` `easy_pin(pin)` and `core/keypad.ts` `easyPin`, both checked against `tests/fixtures/easy_pins.json`.
- `core/place.ts` (new): the remembered module and views (localStorage `planavista.place`, keyed by the dashboard path and the card's configuration; places last on screen more than an hour ago are ignored).
- `modules/calendar/mode-colors.ts`: a linked calendar's colors come from its member (`withModeColors(data, mode, members)`), with `core/color.ts` `lightTint`. `modules/calendar/settings/calendars-page.ts` shows Set in People (`rowColor`).
- `modules/calendar/utils/event-utils.ts` `sameEventKey`: one key for an event's copies, used by Week's merge, the Day view's faces, the details sheet (`eventForPopup`), and Day's all-day row (`groupSameEvents`).
- `shell/pv-parent-strip.ts` is the strip for any session, a parent's or a child's.
- `styles/shared.ts`, `styles/theme-pairs.ts`, and `styles/sheet.ts`: one button family with a disabled look, `--pv-danger` and `--pv-danger-ink`, one toggle, toast tokens, one sheet heading and footer.
- `refusals.py` (new) and `diagnostics.py`: the last 20 refusals from the household and chores commands.
- `modules/chores/recent-checkoffs.ts` and `fairness.ts` (new), with the chores derive modules: each toast's Undo, one fairness line, the goal and sticker words.
- No new Store files. Two added fields under `security` in the household Store (`session_idle_seconds`, `parent_mode_minutes`). Older releases ignore them, so a step back to 1.4.0 keeps working.

## 5. Testing

- Pure rules get unit tests before their code (vitest for the card, pytest for Home Assistant):
  - event access for every account kind
  - member colors and tints
  - merging event copies
  - session ends (idle and cap)
  - easy PINs, from the shared fixture
  - the remembered place
  - the board's Done today
  - the "Who did it?" words
  - the Week toolbar labels
  - the time range format
- Element behavior is checked on the dev Home Assistant with scripted checks recorded failing then passing, as in milestones 5 to 7.
- The household's journeys from the final review run again on the dev Home Assistant at the end, in portrait, landscape, and on a phone, light and dark.
- A final review of the whole branch (on Fable) runs against this document, the merged review, and the design directives; then one fix pass.
