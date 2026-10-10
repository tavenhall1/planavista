# Chores Module and Shell Design Language: Design

**Date:** 2026-10-09 (design approved 2026-10-10)
**Status:** Approved
**Scope:** Spec 1 of 2. Household members, the Chores module (chore model, board, editors, import), the Home Assistant surface, kiosk PINs and parent mode, stars and rewards, streaks, and the shell design language (layout by size, day and night, motion) that the calendar inherits. Spec 2 is the family-meeting planner.

## 1. Summary

PlanaVista becomes one card that hosts modules. Today it hosts the calendar. This design adds Chores, and later modules (Lists) plug into the same shell. A household agrees on who does what (the plan). PlanaVista turns that plan into a board on the kitchen screen, where each person checks off their chores, and into Home Assistant entities and actions that automations, phones, and voice can use.

Success means:

- The agreement a family makes at the table becomes the daily system on the kitchen screen.
- A household with one shared touchscreen and no phones can run everything from that screen.
- Anything the card can do to a chore, an automation can do too.
- A 6-year-old, a teen, and a parent can all use the same screen.
- Households that only use the calendar notice nothing until they opt in.

## 2. Goals and non-goals

### Goals

1. Household members as a shell concept shared by every module.
2. A chore model that covers the household plan (hours per day or week) plus one-time and repeating chores.
3. The Chores module: Board, Week, My day, and Rewards views; hold to complete; approvals and requests.
4. The Home Assistant surface as a public API: to-do lists, sensors, events, actions, phone notifications, Assist.
5. Kiosk operation with per-person PINs and parent mode.
6. Stars, rewards, goals, and streaks.
7. Import of an existing household plan; export and restore of a PlanaVista household.
8. First-run setup built from steps that modules contribute.
9. The shell design language: layout from the card's own size (portrait and landscape both first-class), day and night appearance with light and dark theme pairs, a motion system, and a heading face. The calendar adopts it.

### Non-goals for spec 1

- The family-meeting planner (agree, load, schedule; editing locked minimums). That is spec 2. Its fields are stored now and hidden in the UI.
- Photo proof, help and trades, "up for grabs" bonus chores, taking turns, and a PlanaVista LLM API. See Future updates (section 18).
- Showing plan activities that have set start times on calendars, or writing anything to calendars.
- Logging actual time spent. Times are estimates, and credit is given by completion.
- The Lists module and the photo frame module.

## 3. Principles

1. **The Home Assistant surface is the public API, and the card is one client of it.** Anything the card can do to a chore, an automation can do through a documented action or through Home Assistant's standard `todo.update_item`. Example acceptance test: a Frigate zone sensor sees Casey take the trash out, an automation completes the chore, Casey gets the credit and stars, and approval rules still apply.
2. **One engine, one source of truth.** A pure-Python engine and its own Store files decide everything. The card, to-do lists, sensors, events, and notifications are projections of it. The card never decides whether a chore is done.
3. **Kiosk first, phones optional.** Every action is possible at one shared screen, protected by per-person PINs. Phones add notifications and convenience; they are never required.
4. **Every age on one screen.** Age groups set sensible defaults (pictures for young children, fairness for teens). One gesture, hold to complete, works for everyone.
5. **Apple-like, calm, and functional.** The design directives are guidance, not limits. When a directive would remove useful function, function wins and the design resolves the tension (for example, "Approve all" stays even though it is a second primary action).
6. **Chores leads and the calendar inherits.** Every design decision made for Chores (layout, motion, color jobs, type, states, copy) is adopted by the calendar.
7. **Local only.** No cloud services and no web fonts. Everything ships in the integration.
8. **PINs never leak.** PINs never pass through services, logs, exports, diagnostics, events, or automation traces.

## 4. Sample household

Every example, fixture, test, and screenshot uses this invented household. Real household data never enters the repository.

| Member | Age group | Parent | Notes |
|---|---|---|---|
| Alex | adult | yes | Has a phone and a calendar. PIN set. |
| Blair | adult | yes | Has a phone and a calendar. PIN set. |
| Casey | teen | no | Has a calendar (School, Soccer). PIN set. Stars on. |
| Dana | young child (6) | no | No Home Assistant person, no calendar, no phone. Sees pictures. Stars on. |

The sample scene is Tuesday, October 13, 2026, at 4:10 PM in America/Chicago, with weeks starting on Monday. Sample chores include Kitchen cleanup (Alex, daily), Cat care (Casey, twice daily), Make your bed, Feed the fish, Set the table, Tidy toys (Dana, daily, need an OK), Laundry (Blair, Mon and Thu), Clean the bathroom (Blair and Casey, split, needs an OK), Take out the trash (Casey, Tue and Fri evenings), Yard work (Casey, any day), Groceries (Alex, Sat), Finance and budget (Alex, any day), Change the furnace filter (Alex, monthly), Rake the leaves (Casey, Saturdays until Nov 30), Fix the gate latch (Alex, by Friday), and Clean out the garage (Casey, by Sunday, 2 sessions).

## 5. Glossary

| Term | Meaning |
|---|---|
| Shell | The part of the card every module shares: header, navigation, Settings, PIN pad, toasts, setup, appearance. |
| Module | A feature area hosted by the shell: Calendar, Chores, later Lists. |
| Member | A person in the household. Owns name, color, picture, age group, and the parent role. May or may not have a Home Assistant person, user, calendar, or phone. |
| Parent | A role, separate from age group. Parents approve, edit, and manage. |
| Chore | One item in the chore plan, of schedule type Plan, Once, or Repeats. The data model calls it an activity because plan-only items (homework, set-time commitments) live in the same list. |
| Plan only | A plan activity that is not on the board (for example, Homework). Kept for the planner, never checked off. |
| Set time | A plan activity with a fixed start time (for example, Soccer practice at 5:30 PM). Always plan only. It belongs on a calendar, and PlanaVista never puts it there. |
| Occurrence | One thing to check off: a chore, for one member, in one period, number n. |
| Completion | A record that an occurrence was done: who did it, when, from which source, and its review state. |
| Chore day | 3:00 AM to 3:00 AM local time (configurable). |
| Chore week | Seven chore days starting on the calendar's first-day setting. |
| Share | A member's part of a Plan chore: their assigned hours when the time is split, or the full minimum when each person does it all. |
| Waiting for OK | The one name for a completion that needs a parent's review (engine state `pending`). |
| Request | Anything a parent reviews: a completion waiting for OK, a request for more time, a request to skip, a reward redemption. |
| Excuse | A parent's decision that one occurrence is not due (a sick day). Nothing is missed and streaks hold. |
| Away | A pause for a member over a date range. Nothing is due or missed and streaks hold. |
| Parent mode | A short session on a shared screen after a parent enters their PIN. |
| Shared-screen account | A Home Assistant user marked as a shared family screen (for example, the kitchen tablet's account). |

## 6. Architecture

### 6.1 The engine and its projections

```
 tablet hold ────────────┐                          ┌─▶ card (WebSocket subscription)
 phone to-do checkbox ───┤                          ├─▶ todo.<member>_chores
 Assist "mark trash" ────┼─▶ ChoresEngine ──────────┼─▶ sensors, binary sensors, event entities
 notification button ────┤   (pure Python)          └─▶ phone notifications, reminders
 actions / automations ──┘        │
                                  ▼
            Store files: household · chores plan · chores log · rewards
```

Every write, wherever it comes from, goes through one engine API and is recorded with its **source**: `tablet`, `phone`, `voice`, `automation`, or `notification`. Day-end auto-approve, missed-chore processing, and reminders run in the backend even when no screen is open.

### 6.2 Backend layout

The existing calendar code stays where it is. New code goes in two packages.

```
custom_components/planavista/
  __init__.py            setup: shell plus enabled modules (calendar on by default, chores opt-in)
  household/             shared by every module
    members.py           member model, validation, migration from person-linked calendars
    security.py          PIN hashing and verification, lockout, parent sessions
    store.py             the household Store
    websocket.py         members, PINs, parent mode, shared-screen accounts, setup progress
  chores/
    model.py             dataclasses and validation, shared by Store, import/export, actions
    engine.py            pure Python: plan + time + log -> occurrences, credit, stars, streaks, rollover
    recurrence.py        RRULE subset parser and expander
    store.py             Stores for the plan, the log, and rewards, plus migrations
    services.py          public actions (section 10.4)
    websocket.py         card feed (subscription) and editor commands
    importer.py          household-hours/v1 import, planavista.household/v1 export and restore
    notify.py            actionable notifications and reminders
    todo.py sensor.py binary_sensor.py event.py   entity platforms, one device per member
  select.py              select.planavista_appearance (shell)
  diagnostics.py         redacted diagnostics
```

`chores/engine.py`, `chores/model.py`, and `chores/recurrence.py` import nothing from Home Assistant. Time is passed in, so tests can simulate months in milliseconds. The Home Assistant layer (Stores, WebSocket, entities, timers) stays thin.

PlanaVista remains a single-instance integration (`single_config_entry`). Stores are keyed by domain, not entry.

**Modules fail separately.** If the chores Stores can't load, the calendar keeps working, chores entities report unavailable, and the board shows its error state (section 15).

### 6.3 Frontend layout

The card becomes a shell that hosts modules.

```
frontend/src/
  shell/              header (clock, weather, glance), module switcher, bottom bar, Settings host,
                      PIN pad, toasts, setup host, appearance controller, size classifier
  core/               members state, avatar and ring components, module registry,
                      settings page registry, setup step registry, motion helpers, status map
  modules/calendar/   today's four views and their toolbar controls, moved here unchanged
  modules/chores/     Board, Week, My day (Timeline, List, Pictures), Rewards, sheets, editors, live feed
```

- **Module registry.** Each module registers its id, label, views, header controls, Settings pages, setup steps, and whether it is enabled for the household. The switcher hides when only one module is enabled.
- **Per-card state.** View and date state move from today's page-wide singleton to per-card state, so two cards on one page stop overwriting each other.
- **Registries for Settings and setup.** Pages and steps are lists contributed by modules, each with a condition for when it applies. Nothing is hard-coded by index.

### 6.4 Card element and options

- The element stays `custom:planavista-calendar-card`, so existing dashboards keep working. A neutral alias, `custom:planavista-card`, is added for new dashboards. Both register through the guarded `customElements.define` helper.
- Optional card options: `modules` (which modules this card shows, for example only Chores on a phone dashboard) and `module` (which one opens first).

### 6.5 Transport

- **WebSocket subscriptions** push chore state to the card (modeled on the existing weather forecast subscription). Chore state never travels in `sensor.planavista_config` attributes or config-entry data.
- **WebSocket commands** carry every card edit and every PIN. PINs are never accepted by actions, because action calls are broadcast as `call_service` events and appear in traces.
- **Actions** (services) are the public API for automations and scripts (section 10.4).
- `save_config` (admin only today) gains a WebSocket counterpart that accepts parent mode, so a non-admin kiosk account can change PlanaVista settings.

### 6.6 Changes to existing code

- The coordinator and wizard rebuild calendar rows from fixed keys and drop anything else. They must keep new keys, starting with each calendar's `member_id`.
- `save_config` rejects unknown top-level keys today. Shell settings that live in the config entry (appearance) are added to its schema.
- The onboarding wizard's three hard-coded pages become the setup step registry. The settings panel becomes shell Settings (section 14).
- The calendar's views move into `modules/calendar/` without behavior changes, then adopt the shell design language (milestones 3 and 7).

## 7. Data model and storage

### 7.1 Store files

State lives in four Home Assistant `Store` files, split by how often they change, so each save stays small (this matters on installs that run from an SD card). All four are included in Home Assistant backups automatically. Calendars and display settings stay in the config entry, as today.

| Store key | Owner | Changes | Holds |
|---|---|---|---|
| `planavista.household` | shell | rarely | members, PIN hashes and lockouts, shared-screen accounts, module state, setup progress |
| `planavista.chores_plan` | chores | on edits | chore settings and activities |
| `planavista.chores_log` | chores | on every check-off | completions, per-occurrence overrides, requests, rollover bookmark, daily and weekly summaries |
| `planavista.chores_rewards` | chores | on stars and rewards | reward catalog, stars ledger, redemptions |

Saves use `async_delay_save` with a 1 second delay for the log and immediate saves for plan, member, and security changes.

### 7.2 Household

```yaml
# .storage/planavista.household
members:
  - id: casey                         # slug made from the name at creation; never changes
    name: Casey
    color: "#43AA8B"                  # from the 20-color palette; no two members share one
    color_dark: null                  # null = matched automatically for dark mode
    picture: {person: true}           # {initial: true} | {emoji: "🦖"} | {person: true} (HA person photo)
    age_group: teen                   # young_child | older_child | teen | adult
    parent: false
    person: person.casey              # optional; gives the HA user, photo, and device trackers
    order: 2                          # position on the board, left to right then down
    my_day: timeline                  # timeline | list | pictures
    needs_ok_for: marked              # all | marked | none
    stars: true                       # earns stars
    goal: movie_night_pick            # "Saving up for"
    bedtime: {weeknight: "22:00", weekend: "23:30"}
    sleep_hours: 9
    away: [{from: 2026-10-14, to: 2026-10-15, note: "At Grandma's"}]
    phones: [notify.mobile_app_caseys_phone]
    notify: {requests: false, reminders: true}   # requests apply to parents only
security:
  pins:
    casey: {hash: "<scrypt, base64>", salt: "<base64>", failures: 0, locked_until: null, lockouts: 0}
  shared_users: ["<HA user id of the kitchen tablet account>"]
  shuffle_keypad: false
modules:
  chores: {enabled: true, set_up_at: "2026-10-10T19:02:11-05:00"}
setup: {completed: true, step: null}
```

**Age group defaults.** Each default can be changed per member. A parent never needs an OK.

| | Young child (about 4 to 8) | Older child (about 9 to 12) | Teen | Adult |
|---|---|---|---|---|
| My day style | Pictures | List | Timeline | Timeline |
| Needs an OK for | Every chore | Marked chores | Marked chores | No chores |
| Stars | On | On | On | Off |
| Board look | Picture tiles, a few at a time, Now first, no times | Icon and text, minutes | Text, minutes, weekly hours | Same as teen |
| Motivation | Celebration in their color, sticker strip for the week | Progress bar | Fairness view | Fairness view |

Calendars keep their records in the config entry and gain `member_id`. A calendar linked to a Home Assistant person joins that person's member automatically.

### 7.3 Chore plan

```yaml
# .storage/planavista.chores_plan
settings:
  missed: make_up                     # make_up | strict | carry_over
  day_starts: "03:00"
  auto_approve: day_end               # day_end | never
  minutes_per_star: 15
  evening_check: "19:00"              # null = off
  sound: false
activities:                           # list order = order within a time of day
  - id: clean_the_bathroom
    name: Clean the bathroom
    icon: "🛁"                         # emoji or mdi:*; also the picture tile for young children
    category: cleaning                # kitchen | cleaning | home | personal | school | work | family | sleep | other
    schedule: plan                    # plan | once | repeats
    assignees: [blair, casey]
    minimum: {hours: 2, per: week}    # plan only
    split: shared                     # plan only: shared = hours divided | each = everyone owes it all
    shares: {blair: 1, casey: 1}      # plan + shared only; hours; must add up to minimum.hours
    days: []                          # plan only; empty = floats in "This week"
    time_of_day: []                   # morning | afternoon | evening
    times: 1                          # plan only; check-offs per active day, or per week when floating
    label: null                       # shown next to the name, e.g. "2 loads"
    on_board: true
    needs_ok: true                    # a parent's OK for members whose setting is "marked"
    stars: null                       # null = automatic; a number overrides stars per check-off
    type: need                        # planner field, hidden in spec 1: need | want
    locked: true                      # planner field, hidden in spec 1
    agreed: true                      # planner field, hidden in spec 1
    set_time: null                    # plan only; a set time ("17:30") makes it plan only
    import_ref: {format: household-hours/v1, id: "a12"}
    created: {by: alex, source: tablet, at: "2026-10-10T19:05:00-05:00"}
  - id: clean_out_the_garage
    name: Clean out the garage
    icon: "📦"
    category: home
    schedule: once
    assignees: [casey]
    once: {on: null, by: 2026-10-18, by_time: null, sessions: 2, estimate_minutes: 240}
    on_board: true
    needs_ok: true
    finished_at: null
  - id: rake_the_leaves
    name: Rake the leaves
    icon: "🍂"
    category: home
    schedule: repeats
    assignees: [casey]
    repeats: {rrule: "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", start: 2026-10-17, window: day, estimate_minutes: 60}
    on_board: true
    needs_ok: false
    finished_at: null
```

Rules:

- **Once:** `on` (shows on that day), or `by` with an optional `by_time` (shows from creation until then), or neither (stays until done). `sessions` is 1 or more; each session is its own check-off. `estimate_minutes` is the estimate for the whole chore.
- **Repeats:** a standard RFC 5545 RRULE, the format Home Assistant calendars use. Supported subset: `FREQ=DAILY|WEEKLY|MONTHLY`, `INTERVAL`, `BYDAY` (weekly), `BYMONTHDAY` (monthly, one day), and `COUNT` or `UNTIL` (or neither). Anything else is rejected with a clear validation error. `window` is `day` (each instance is due on its day) or `period` (any time that week or month). `estimate_minutes` is per instance.
- **Plan** stays day- and week-based because it is the agreement. Anything with another rhythm (monthly, every 3 days) is a Repeats chore.
- Two or more assignees on a Once or Repeats chore: each person gets their own check-off.
- Plan-only activities (`on_board: false`, or any `set_time`) never produce occurrences.

### 7.4 Chore log

```yaml
# .storage/planavista.chores_log (completions, overrides, and requests kept 90 days; summaries kept for good)
last_boundary: "2026-10-13T03:00:00-05:00"
completions:
  - id: 01JABC7Q3W9K2M4N6P8R0S2T4V   # ULID
    occurrence: "clean_the_bathroom|casey|week:2026-10-12|0"
    member: casey                     # the assignee whose occurrence this satisfies
    done_by: casey                    # gets the credit and stars
    at: "2026-10-13T16:20:05-05:00"
    source: automation                # tablet | phone | voice | automation | notification
    user: null                        # HA user id when known
    state: pending                    # done | pending | sent_back | undone
    review: null                      # {by: alex | auto, at, note}
    credit_minutes: 60                # snapshot; later plan edits never rewrite history
    stars: 4                          # snapshot
overrides:
  - {occurrence: "yard_work|casey|week:2026-10-12|0", planned_day: 2026-10-17, by: casey, at: "..."}
  - {occurrence: "...", due: "2026-10-25T03:00:00-05:00", by: blair, at: "..."}
  - {occurrence: "...", assignee: blair, by: alex, at: "..."}
  - {occurrence: "...", excused: true, note: "Sick day", by: blair, at: "..."}
requests:
  - {id: "...", kind: more_time, occurrence: "...", member: casey, until: 2026-10-25, state: open, at: "...", review: null}
  - {id: "...", kind: skip, occurrence: "...", member: casey, state: open, at: "...", review: null}
summaries:                            # one per member per chore day and chore week, written at rollover
  - {member: casey, period: "day:2026-10-13", due: 4, done: 3, pending: 0, minutes_due: 75, minutes_done: 45,
     missed: ["cat_care|casey|day:2026-10-13|1"], excused: [], away: false}
```

### 7.5 Rewards

```yaml
# .storage/planavista.chores_rewards
rewards:
  - {id: movie_night_pick, name: Movie night pick, icon: "🎬", cost: 40, needs_ok: true, who: [casey, dana]}
ledger:                               # append-only
  - {id: "...", member: casey, delta: 4, reason: chore, ref: "<completion id>", at: "..."}
  - {id: "...", member: casey, delta: -4, reason: undo, ref: "<completion id>", at: "..."}
  - {id: "...", member: casey, delta: 5, reason: "Helped a neighbor", by: blair, at: "..."}
  - {id: "...", member: casey, delta: -10, reason: redeemed, ref: "<redemption id>", by: blair, at: "..."}
redemptions:
  - {id: "...", member: casey, reward: pick_the_weekend_game, state: requested, at: "...", review: null}
```

### 7.6 Identity rules

- **IDs** are slugs made from the name at creation: lowercase ASCII, accents removed, words joined with `_`, and `_2`, `_3` added on a collision. They never change, even when the name does.
- **Occurrence keys** are deterministic: `{activity}|{member}|{period}|{n}`.
  - Period ids: `day:YYYY-MM-DD` (a chore day), `week:YYYY-MM-DD` (a chore week, by its first day), `once`, and `rep:YYYY-MM-DD` (a Repeats instance, by its start date).
  - `n` counts check-offs within the period, from 0.
  - Because keys are deterministic, completing is idempotent across every client. If Frigate and a tap mark the same occurrence within a minute, the second write finds it done and becomes a no-op.
- **Every write records** who did it (a member id, `automation`, `admin`, or `auto`), the source, the HA user when known, and the time.

### 7.7 History stays true

- A completion snapshots the credit and stars it earned. Each rollover writes a small per-member summary. Streaks, fairness, and the Week view read those records, never a recomputation against today's plan.
- The stars ledger is append-only. An undo appends a reversal instead of deleting.
- Retention: completions, overrides, and resolved requests are pruned after 90 days. Summaries and the ledger are kept for good (they are tiny).

### 7.8 Versions and rollback

Every Store starts at version 1, minor version 1. Rules that keep any release rollback-safe:

1. Changes bump the minor version and add fields. They never rename or remove fields.
2. Loaders keep fields they don't recognize and write them back unchanged.
3. Every migration is safe to run twice. Reason: when a release is rolled back, Home Assistant still loads a file with a newer minor version but saves it again with the older version number, so upgrading again reruns the migration (verified in `homeassistant/helpers/storage.py`, 2026.9.4).
4. The same rules apply to the config entry. Today it is version 1 with no minor version and no `async_migrate_entry`. The first migration (appearance, milestone 3) adds `MINOR_VERSION = 2` and an `async_migrate_entry` that returns success for a newer minor version of the same major version.

### 7.9 Export, restore, and import

**Export and restore.** `planavista.household/v1` is a documented JSON format with a JSON Schema published at `docs/schemas/planavista.household.v1.json`, so other tools can generate or read it.

- Included: members (with Home Assistant links), chores (activities, including hidden planner fields), rewards, and chore settings.
- Not included: PINs, stars balances, the ledger, completions, summaries, requests, and shared-screen accounts. Home Assistant backups keep those.
- Restore runs the same preview as import.

**Import of an existing plan.** Import accepts `household-hours/v1`, as exported by the Household Hours planner. Nothing is saved until the parent has seen the preview of what goes where.

| Household Hours field | Becomes |
|---|---|
| People | Members (name, bedtimes, color). Matched to existing members by name; new people need an age group. |
| Sleep activities | Each member's `sleep_hours` |
| Set-time activities | Plan-only activities. Never on the board and never written to calendars. |
| `alloc` and `timePer` | `assignees`, `shares`, and `split` |
| Category | The default for `on_board` (kitchen, cleaning, home: on; personal, school, work, family: off; sleep: never) |
| Need or want, locked, agreed | Kept as hidden planner fields |

Rules:

- Importing again updates instead of duplicating. Activities match by the plan's own id recorded in `import_ref`, then by name. Nothing is deleted.
- Stars, rewards, and history are never touched by an import.
- An activity with no one assigned waits off the board and is listed under "Needs a look".
- A file from a newer format version gets its own message that says what to do (section 15).
- The test fixture is a `household-hours/v1` file built from the sample household.

## 8. Engine rules

### 8.1 Periods

- Everything runs in Home Assistant's configured time zone.
- A chore day runs from 3:00 AM to 3:00 AM (`day_starts`).
- A chore week starts on the calendar's first-day setting. Changing that setting takes effect at the next week boundary, so no week is split.
- Days around daylight saving changes are 23 or 25 hours long. Boundaries are computed with `zoneinfo` from local wall-clock times, never by adding 24 hours.
- Time-of-day bands for the board: morning until 12:00 PM, afternoon until 5:00 PM, evening after that.

### 8.2 Occurrences

Occurrences are generated per on-board activity, per assignee. Internally every occurrence is `{key, member, appears, due, planned_day, band, credit_minutes, stars}`. Plan, Once, and Repeats are three generators of that one shape, so completing, approvals, missed policies, stars, streaks, summaries, and the to-do lists work the same for all three.

**Plan chores:**

| Minimum | Days | Occurrences | Each is worth | Due by |
|---|---|---|---|---|
| per day | picked, or none (every day) | `times` on each active day | share ÷ times | end of that chore day |
| per week | picked | `times` on each picked day | share ÷ (days × times) | end of the chore week (strict days: end of that day) |
| per week | none | `times` per week, floating | share ÷ times | end of the chore week |

When `times` is 2 or more and the activity lists several time-of-day bands, occurrences rotate through the bands (Cat care morning and evening).

**Once chores:** one occurrence per session per assignee, period `once`, each worth `estimate_minutes ÷ sessions`. They appear from creation (or on the `on` date) and are due at the end of the `on` day, at `by` (and `by_time`), or never.

**Repeats chores:** one occurrence per instance per assignee, each worth `estimate_minutes`. With `window: day` an instance appears and is due on its day. With `window: period` it appears at the start of its week (weekly rules) or month (monthly rules) and is due at the end of that week or month.

### 8.3 Stars

- Stars per check-off are the activity's `stars` override when set, otherwise `max(1, round_half_up(credit_minutes ÷ minutes_per_star))`. A 1-hour clean earns 4 and a 15-minute trash run earns 1.
- Rounding is half up (37.5 minutes earns 3, not 2). The engine and the editor's "worth" line call the same formula, so what a parent sees while editing always matches what the board awards. The frontend copy of the formula is tested against the same table as the engine.
- Stars are granted to the doer, if that member earns stars, when the completion becomes done (immediately, or when approved). The amount is snapshotted then.
- Stars are never taken away automatically. An undo reverses only the stars that completion earned.

### 8.4 Where occurrences appear

On the board, each member's column shows:

- **Today, by band** (morning, afternoon, evening): per-day Plan items, pinned weekly Plan items for today, Repeats instances due today, Once chores with `on` today, and Once chores with a `by` date (every day until due, with a "Due Sat" badge). Items without a band appear in the current band.
- **This week:** floating weekly Plan items ("0 of 1"), make-up items ("From Mon"), Repeats instances with a week or month window ("this month"), and Once chores with no date.
- **Overdue** items (carry-over policy) appear at the top of today's list, marked "Overdue since Mon".
- A floating item turns amber when its remaining count equals the days left in the week, and red on the last day.

### 8.5 Completing

Every source uses one entry point: `complete(occurrence or (activity, member), done_by, source, user)`.

1. **Pick the occurrence.** The card always names the exact occurrence. Callers that don't (automations, voice, to-do lists) get the member's oldest open one: overdue, then today's, then this week's floating, then this week's earlier pinned items.
2. **Nothing open?** It's a no-op. The result says `nothing_open` (or `already_done` when the named occurrence is done), and no error lands in the automation trace, so a Frigate automation that fires twice stays harmless.
3. **Does it need a parent's OK?** Only if the doer isn't a parent and either their `needs_ok_for` is `all`, or the chore has `needs_ok` and their setting is `marked`. Then the completion is `pending` (Waiting for OK); otherwise it is `done`. Automations and admins may pass `approve: true` (for example, a washer's power sensor reporting a finished load); the flag is ignored for everyone else.
4. **Credit and stars go to the doer.** The assignee's occurrence counts as satisfied either way.

### 8.6 Undo and review

- **Uncheck or Undo:** the completion becomes `undone` (kept in history) and a stars reversal is appended to the ledger.
- **Send back:** reopens the occurrence with the parent's note ("Sent back: edges").
- **Approve:** the completion becomes `done` and its stars are granted.
- **Auto-approve:** completions still waiting for OK approve themselves at the end of the chore day they were done in (setting: `day_end` or `never`).
- Whether something was on time is judged by when it was completed, not when it was approved.

### 8.7 Requests

Completion approvals, more-time requests, skip requests, and reward redemptions form one **request** type with one review flow. The Waiting for OK inbox, phone notifications, `sensor.household_approvals_waiting`, the one-time notification tokens, and day-end auto-approve each exist once for all four kinds.

| Kind | Raised by | Allow | Decline |
|---|---|---|---|
| Completion (Waiting for OK) | completing a chore that needs an OK | approve: done, stars granted | send back with a note |
| More time | a member, from the options sheet | the occurrence's `due` moves to the asked date | "Not this time"; nothing changes |
| Skip this week | a member, from the options sheet | the occurrence is excused | "Not this time"; nothing changes |
| Reward redemption | a member, from Rewards | the stars are taken (ledger entry) and the reward is marked given | "Decline"; nothing changes |

Auto-approve applies only to completions. Other requests wait for a parent.

### 8.8 Per-occurrence overrides

- `planned_day` ("Plan it for a day") is self-service and display-only. It changes when the item is shown, never when it is due, so it can't be used to dodge a deadline.
- `due` and `assignee` change only by a parent or through an allowed request.
- `excused` is set by a parent, or by an allowed skip request.

### 8.9 Rollover

At every day boundary (3:00 AM), the engine runs these steps in order:

1. Auto-approve completions waiting for OK from the day that ended.
2. Apply the missed policy.
3. Write the day's summaries (and the week's, at a week boundary).
4. Fire `missed` events.
5. Prune log records older than 90 days.

It records the last boundary processed. If Home Assistant was off at 3:00 AM, every skipped boundary is replayed in order at startup, so an outage never loses or doubles a day. Rollover is a pure function of (plan, log, boundary), so the catch-up loop calls it once per skipped boundary.

### 8.10 Missed policies

| Policy (household setting) | Per-day item not done | Pinned weekly item not done on its day | Weekly item not done by week end |
|---|---|---|---|
| **Make it up** (default) | missed | moves to "This week · From Tue" | missed |
| **Strict days** | missed | missed | missed |
| **Carry it over** | overdue until done or excused | stays open through the week | overdue until done or excused |

A pinned Repeats instance follows the pinned weekly rules. Switching the policy takes effect at the next day boundary.

### 8.11 Exceptions

- A parent can **excuse** one occurrence (a sick day).
- A parent can mark a member **Away** for a date range. Nothing is due and nothing is missed while they are away, and streaks hold.

### 8.12 Plan edits and lifecycle

- Saved edits apply right away to open occurrences. Completed ones keep their snapshots.
- Removing a chore or an assignee drops their open occurrences without counting them as missed.
- Removing a member unassigns their chores (which wait in the list as unassigned) and keeps their history.
- A Once chore, or a Repeats chore that has ended, is **finished** when its last occurrence is done, missed, or excused. It leaves the board and the editor's active list ("Show 3 finished"); its history stays.

### 8.13 Streaks

- A member's **daily streak** counts consecutive chore days on which every item due that day was done (waiting for OK counts as done).
- Away, excused, and empty days are skipped instead of breaking the streak.
- **Weekly streaks** work the same way over chore weeks.
- Daily chores also get **per-chore streaks** ("Cat care, 12 days").

### 8.14 Progress numbers

Computed in one place and used everywhere (board, sensors, to-do lists, header):

- Per member, today and this week: due and done counts and minutes, with Waiting for OK counted separately.
- **Contribution:** minutes credited to someone as the doer. This drives the fairness view ("Shared chores this week, by time done").
- **Household total** for the header glance ("9 of 17 chores done today").

### 8.15 Rewards

- Parents keep the catalog: picture, name, cost in stars, needs an OK (default on), and who can get it.
- Redeeming needs enough stars when requested and again when approved. With "needs an OK" off, redeeming takes the stars at once.
- A member can pin one reward as their goal and see their progress.
- Parents can add or remove stars by hand, with a reason.

### 8.16 Worked examples (acceptance tests)

1. **Frigate.** On Tuesday at 7:40 PM, a zone sensor sees Casey take the trash out, and an automation calls `planavista.complete_chore` with `member: person.casey, chore: take_out_the_trash`. That satisfies today's occurrence. Casey's setting is "marked" and the trash isn't marked, so it is done, with 1 star, source `automation`.
2. **Approval.** Dana holds Feed the fish, so it waits for OK. Alex taps Looks good on their phone, so it is done, with 1 star, reviewed by Alex, source `notification`.
3. **Make it up.** Blair misses Monday's laundry. On Tuesday the board shows "Laundry · From Mon". Blair does it, and it counts as on time for the week.
4. **Repeat delivery.** The same automation fires twice within a minute. The second call returns `already_done`, with no second credit and no error.
5. **Outage.** Home Assistant is off from Monday 11 PM to Wednesday 9 AM. At startup the Tuesday and Wednesday 3:00 AM rollovers run in order: auto-approve, missed, summaries, events.

## 9. Identity, kiosk, and permissions

### 9.1 Everything is doable at the screen

Approvals, reward redemptions, adding and removing chores, editing chores, members, rewards, excusing a sick day, marking someone away, and settings all live behind a parent's PIN on the shared screen. Phones are optional. With no phones set up, no notifications are sent, requests wait in the Waiting for OK inbox (a badge in the header), and day-end auto-approve still runs.

### 9.2 PINs identify people

- Any member can have a PIN of 4 to 6 digits. On a shared screen, parents need one.
- Entering a PIN records who acted: "approved by Blair", "added by Alex", "unchecked by Casey".
- Check-offs without a PIN are credited to the item's owner, or to whoever was picked under "Done by someone else".
- PINs are stored as scrypt hashes (`n = 2^14, r = 8, p = 1`, 32 bytes) with a random 16-byte salt per PIN, verified in the executor with a constant-time comparison.

### 9.3 The PIN prompt: tap your face, then your PIN

```
  Who's approving?      ( Alex )   ( Blair )
  Blair, enter your PIN   [•][•][ ][ ]
```

- Picking a person first means PINs don't have to be unique. That closes a classic hole: with unique PINs, a child choosing "1234" and being told it is taken would learn a parent's PIN.
- The prompt only shows people who may do the action: parents for parent actions; the member plus parents for a PIN-protected member's item.
- Round keys, Apple style. An optional shuffled keypad moves the numbers each time, so smudges and glances don't give a PIN away. In portrait the keypad sits in the lower half of the screen.

### 9.4 Sessions and parent mode

- Entering a parent's PIN starts **parent mode**. Entering a member's PIN starts a session for that member, for checking and unchecking their own items.
- A session is a token issued by the backend, bound to that screen's WebSocket connection, and held in memory only. It can't be replayed from another device.
- A session ends after 2 idle minutes (the card reports activity at most every 30 seconds while someone is touching it), when the screen sleeps (the page is hidden), when the page reloads, when Home Assistant restarts, or when someone taps **Lock**. Forgetting is the safe failure direction for a kiosk.
- In parent mode the header takes on that parent's color and picture, with a countdown ring, **+ Add chore**, and **Lock**. Several approvals and edits take one PIN.
- Unsaved editor changes live only in the card's memory. If parent mode ends mid-edit, they come back after the next parent PIN on that screen. A page reload drops them.

### 9.5 The rule the backend enforces

**A PIN is required wherever the Home Assistant account doesn't identify one person.** The backend checks it in every WebSocket command and action, so it holds for any client using that account.

| Account | Member-level actions | Parent-level actions |
|---|---|---|
| Shared-screen account (marked in setup, or in Settings, PINs and parent mode) | Allowed for members without a PIN. For a PIN-protected member: that member's session or parent mode. | Parent mode only. |
| A parent's own account (an HA user linked to a parent member through their person) | Yes, attributed to that parent | Yes, no PIN needed |
| A non-parent's own account (a child, or an adult who isn't a parent) | Only on that member's items | Never |
| Admin account that isn't marked shared | Yes | Yes, attributed to the admin's member if linked, otherwise `admin` |
| Any other account (not linked to a member, not an admin) | Treated as a shared-screen account | Treated as a shared-screen account |
| Automations and scripts (no user in the context) | Yes, attributed to `automation` | Yes, attributed to `automation` |

- **Member-level:** complete, uncheck or undo, done by someone else, plan it for a day, ask for more time, ask to skip, redeem a reward.
- **Parent-level:** approve, send back, allow or decline requests, change a due date, hand a chore to someone else, add, edit, or delete chores, excuse, mark away, give or take stars, edit rewards, members, settings, and other people's PINs, import, and export.
- A shared-screen account's admin status never bypasses this rule inside PlanaVista.

### 9.6 Lockout and recovery

- After 5 wrong tries, that member's PIN pauses for 30 seconds. Each further lockout doubles the pause, up to 15 minutes. A correct PIN resets the count. A parent can clear a lockout.
- The lockout is kept per member in the backend, so it holds across screens.
- A forgotten PIN is reset by another parent in parent mode. If no parent remembers one, any parent or admin signed in to their own Home Assistant account can set new PINs, because their account already proves who they are.

### 9.7 Kiosk accounts

- Installing PlanaVista and adding the integration needs a Home Assistant admin once.
- PlanaVista recommends running the shared screen on a **non-admin** Home Assistant account and says why: an admin account exposes Home Assistant's own admin tools (Developer tools, Settings), which no PlanaVista PIN can guard.
- The shared-screen setup step flags an admin account. It warns and links to how to set up a non-admin account, but doesn't block.

### 9.8 PINs never leak

PINs travel only in `planavista/pin/*` WebSocket commands, which Home Assistant doesn't broadcast. They are hashed on arrival and never appear in actions, `call_service` events, logs (including debug logs), diagnostics, exports, entity attributes, events, or automation traces. A dedicated test enforces this (section 16).

### 9.9 Reminders without phones

At the evening check time (default 7:00 PM), the board shows a gentle banner such as "Evening check: Casey has 2 chores left", and that member's column pulses once. A smart speaker can read it out through an automation that uses the chores-left sensors.

## 10. Home Assistant surface (public API)

### 10.1 Devices

- Each member with chores is a Home Assistant **device** (manufacturer "PlanaVista", model "Household member", named after the member). Entities use `has_entity_name`, so automation authors can pick "Casey" as a device and find their to-do list, chore sensors, and events together. Areas, labels, and device triggers then work on chores too.
- A **Household** device holds household-wide entities.
- Renaming a member renames the device and keeps entity IDs. Removing a member removes their device and entities.
- Chores entities exist only while the Chores module is enabled. `select.planavista_appearance` belongs to the shell and always exists.

### 10.2 Entities

| Entity | State | Typical use |
|---|---|---|
| `todo.casey_chores` | open items (Home Assistant's to-do count) | Phone app, voice, `todo.update_item` |
| `sensor.casey_chores_left` | items still due today; attribute `items` lists up to 20 names | "At 7 PM, if more than 0, remind Casey" |
| `sensor.casey_chores_this_week` | percent of the week's minutes done | Any dashboard card |
| `sensor.casey_chore_time` | total credited minutes (`device_class: duration`, `state_class: total`) | Fairness charts in statistics graphs |
| `sensor.casey_stars` | star balance | "Unlock 30 minutes of screen time at 40" |
| `sensor.casey_streak` | days in a row | Celebrations and badges |
| `binary_sensor.casey_chores_done` | on when everything due today is done | Automation conditions |
| `event.casey_chores` | event types `completed`, `approved`, `sent_back`, `undone`, `missed`, `redeemed` | Automation triggers. Attributes: `chore`, `chore_name`, `occurrence`, `member`, `done_by`, `source`, `stars` |
| `sensor.household_chores_left` | items still due today, everyone | Household dashboards |
| `sensor.household_approvals_waiting` | open requests | Make a lamp glow when something is waiting for a parent |
| `select.planavista_appearance` | `light`, `dark`, `automatic` | Dark for movie night, from an automation or voice |

`sensor.casey_chore_time` uses `state_class: total` so the recorder keeps long-term statistics (hourly to monthly, never purged like states), and the built-in Statistics Graph card can chart chore time per person per week across a year. An undo lowers the total, which `total` permits.

### 10.3 What the to-do list holds

- Each item is one occurrence, with the occurrence key as its uid.
- Order: today's items first, then this week's floating items, then make-up and overdue items.
- Today's completed items stay checked until rollover.
- A completion waiting for OK shows as completed, with the description "Waiting for a parent's OK".
- Supported: update (check and uncheck, through the engine), create (adds a Once chore), delete (Once chores only; Plan chores can't be deleted from a to-do list), and due dates.
- Creating an item uses its due date if one is set and a 15-minute estimate. If someone who isn't a parent adds it, it needs an OK, so its stars wait for a parent. That way a child can't add "Brush teeth" twenty times for stars.

### 10.4 Actions

Members can be given as a member id or a `person.*` entity, and chores as their id. Actions return response data, so scripts can branch on the result.

| Action | Level | Fields | Response |
|---|---|---|---|
| `complete_chore` | member | `member`, `chore`, optional `occurrence`, `done_by`, `approve` (automations and admins only) | `result`: `done`, `pending`, `already_done`, or `nothing_open`; `occurrence`; `stars` |
| `undo_chore` | member | `member`, `chore`, optional `occurrence` (default: the latest completion) | `result`, `occurrence` |
| `get_chores` | anyone | `member`, optional `date` | items and their status for that day (response only) |
| `redeem_reward` | member | `member`, `reward` | `request` id |
| `approve_chore`, `send_back_chore` | parent | `request`, or `member` and `chore`; `send_back_chore` takes an optional `note` | `result` |
| `add_chore` | parent | `name`, `assignees`, optional `icon`, `once` or `repeats` fields, `estimate_minutes`, `needs_ok`, `stars` | `chore` id |
| `remove_chore` | parent | `chore` | `result` |
| `excuse_chore` | parent | `member`, `chore`, optional `occurrence` or `date`, `note` | `result` |
| `pause_member`, `resume_member` | parent | `member`, `from`, `to`, optional `note` | `result` |
| `award_stars` | parent | `member`, `stars` (positive or negative), `reason` | new balance |
| `export_household` | admin | none | `planavista.household/v1` JSON (response only) |

- **Member-level** means: admins, automations, the member's own user, or a parent's own user. On a shared-screen account it is allowed only for members without a PIN (people with a PIN act through the card).
- **Parent-level** means: admins and automations. People do these through parent mode on the screen, or with the buttons on their phone notifications.
- Mistakes raise `ServiceValidationError` with translated messages (`exceptions` in `strings.json`): unknown member, unknown chore, unknown request, not allowed, invalid schedule, not enough stars. A repeat or "nothing open" is never an error.
- `services.yaml` documents every action and field.

Example, the Frigate scenario:

```yaml
triggers:
  - trigger: state
    entity_id: binary_sensor.curb_trash_bin_occupancy   # a Frigate zone sensor
    to: "on"
actions:
  - action: planavista.complete_chore
    data: {member: person.casey, chore: take_out_the_trash}
```

Plain `todo.update_item` on `todo.casey_chores` works too, with no PlanaVista knowledge. Both go through the same engine, both are recorded with source `automation`, and approval rules still apply.

### 10.5 Phone notifications (optional)

- Each parent picks their phones on their person page, suggested from their `person.*` device trackers. Notifications use the legacy `notify.mobile_app_*` service, because notify entities can't carry buttons.
- Requests arrive with buttons: **Looks good** and **Send back** for completions (Send back accepts a typed reason on iOS and Android), **Allow** and **Not this time** for more time and skip, **Approve** and **Decline** for rewards.
- A button press counts only if the `mobile_app_notification_action` event's context user is linked to a parent **and** the action carries that notification's one-time token. Any registered phone can fire arbitrary events through its webhook, so both checks are needed. After a request is resolved, the other parents' copies are cleared by tag.
- Optional reminders go to members with phones: "7:00 PM: 2 chores left", sent only if chores are left.

### 10.6 Voice and AI

With the to-do lists exposed to Assist, Home Assistant's built-in intents and `todo__get_items` handle "What's on Casey's chores?", "Mark take out the trash as done on Casey's chores", and "Add clean the closet to Casey's chores" with no PlanaVista code. A PlanaVista LLM API (approving, stars, and rewards by voice) is a future update.

### 10.7 WebSocket API (for the card)

Commands are namespaced `planavista/<area>/<verb>`. Every command checks the rule in section 9.5. The main ones:

| Command | Purpose |
|---|---|
| `planavista/household/subscribe` | members (public fields), module state, setup progress, shared-screen status of this account |
| `planavista/chores/subscribe` | the board state for a date: each member's occurrences, statuses, progress, streaks, stars, open requests; pushed again on every change |
| `planavista/chores/week` | the Week view for a given week, from the log, summaries, and generated future occurrences |
| `planavista/chores/complete`, `undo` | check off and uncheck by occurrence key, with optional `done_by` |
| `planavista/chores/request`, `review` | raise and resolve requests (more time, skip, completions, rewards) |
| `planavista/chores/override` | plan it for a day, change the due date, hand to someone else, excuse |
| `planavista/chores/activity/save`, `delete` | the chore editor and quick add |
| `planavista/chores/settings/save` | Rules and Reminders |
| `planavista/rewards/save`, `delete`, `redeem`, `stars/award` | rewards and stars |
| `planavista/household/member/save`, `delete`, `reorder` | People |
| `planavista/pin/unlock` | verify a PIN, start a session; returns a session token |
| `planavista/pin/set`, `clear`, `lock`, `touch` | set or clear a PIN, end a session, report activity |
| `planavista/household/shared_screen` | mark or unmark this account as a shared screen (parent mode) |
| `planavista/import/preview`, `apply`; `planavista/export` | import, restore, and export |
| `planavista/config/save` | the parent-mode counterpart of the admin-only `save_config` action |

### 10.8 Stability

The public surface (entity IDs, states, attributes, event types and data, action names and fields, response shapes) is pinned by snapshot tests. Changing any of it is a deliberate act, recorded in the changelog.

## 11. Design language

These rules apply to every module. Chores is built on them first, and the calendar adopts them.

### 11.1 Product brief and signature

- **Mood:** warm, calm, encouraging. It should read from across a kitchen and feel friendly to a 6-year-old without boring a teen.
- **Signature: closing rings and rounded headings.** Each person's ring fills as their day gets done and closes with a check. All the boldness is spent here; everything else stays quiet.
- One `pv-ring` component (progress, color, closed check, optional celebration) serves every size: 34 px Week cells, 58 px board columns, 132 px picture tiles, and the calendar Day view's column headers.

### 11.2 Type

- **Headings and numbers** use a rounded face: `ui-rounded` (SF Pro Rounded) on Apple devices, and a locally bundled rounded face everywhere else: Nunito (SIL Open Font License 1.1), as a Latin-subset variable `woff2` served from `frontend/dist`. No web fonts.
- **Body text** uses the system font stack.
- Clocks and counters use tabular figures.
- Correction to `DESIGN_SYSTEM.md`: its font stack names Inter, but no Inter file was ever bundled, so the card renders in the system font today.

### 11.3 Color

- **Every color has one job:**
  - member color = who
  - indigo = something to act on (the active tab, the Waiting for OK button, items waiting for OK)
  - amber = time pressure
  - red = overdue, missed, or sent back
- **Color is never alone.** Every state also has words or a glyph ("Due Sat", "From Mon", "Sent back: edges"), so the board still reads in grayscale.
- **Chroma shrinks as area grows.** Full color only on rings, avatars, and checks. Rows, tiles, and done states use the pale tint.
- **Neutrals do most of the work.** White columns, hairline borders, no shadows. A 3 px top line is each column's only colored edge.
- **Member palette:** the existing 20 calendar color presets (pastel, not saturated). Tints and dark-mode variants are derived in OKLCH, so contrast is measured rather than eyeballed.
- **Text on color:** `contrastText()` picks white or near-black by measured contrast, crossing over at a relative luminance of about 0.179. Today's version switches at 0.4, which puts white text on colors where dark text reads better.

### 11.4 Status map

One map, used by every view, sensor description, and notification:

| State | Glyph | Words | Color |
|---|---|---|---|
| To do | empty circle | the estimate ("15 min") | neutral |
| Done | check in the member's color; title struck through | moves to "Done today" | member color |
| Waiting for OK | ⏳ | "Waiting for OK" (everywhere, even on picture tiles) | indigo |
| Sent back | ↩ | "Sent back: {note}" | red |
| Running out of days | dot | "2 days left" | amber |
| Last day, overdue | dot | "Last day", "Overdue since Mon" | red |
| Make-up | none | "From Mon" | neutral |
| Due date | none | "Due Sat" | neutral; amber on the day |
| Missed (history) | × | "Missed" | muted red |
| Excused | none | "Excused" | muted |
| Away | 🧳 | "Away · At Grandma's" | neutral |
| Ring closed | check badge on the ring | "Ring closed for today" | member color |

### 11.5 Motion

Motion is part of the product, Apple style, and inherited by the calendar.

- **It tracks the finger.** Hold to complete fills the ring at a steady rate over 550 ms while the finger stays down, and rewinds on release or on a move of more than 12 px. Pointer capture keeps the gesture alive if a finger drifts off the small circle; the movement threshold hands an intended scroll back to the page. The calendar's date swipe uses the same rule, so the gestures never fight.
- **Springs, not timers.** A small `spring(response, damping)` function solves the damped-spring equation and samples it into CSS `linear()` easing, with SwiftUI's parameters. Presets: smooth `spring(0.5, 0.86)` for glides, bouncy `spring(0.45, 0.55)` for pops, gentle `spring(0.6, 0.9)` for large moves.
- **Every animation answers "what just happened?"** The check draws itself, the title strikes through, "+1 ★" flies to the counter, numbers roll, and rows glide into "Done today" (FLIP).
- **Celebrations are earned.** The glow and burst play once, when a member's ring closes for the day, plus a family celebration when every ring closes. Each item gets its check and a ring step, nothing more.
- **Haptics** where the device allows: a light tick on completion and a richer one when a ring closes (Android tablets; iOS browsers don't allow vibration). **Sound** is an optional setting, off by default.
- **Reduced motion keeps the meaning.** The ring still fills (it is the feedback), but pops, flights, and glides become quick fades. It follows the device setting and PlanaVista's **Motion** setting (Follow the device, Full, Reduced), because kiosk tablets often hide the system setting.
- **Cheap to run.** Only transform, opacity, and stroke offsets animate, so older wall tablets stay smooth.
- **Keyboard.** Space or Enter on a focused circle completes it with the same feedback, no hold needed.
- The calendar inherits it: event dialogs become sheets, Day view headers get rings, and view changes use the same springs.

### 11.6 States

- **Skeletons, not spinners,** in the shape of what is loading.
- **Optimistic check-offs.** A check-off shows at once. If saving fails, it reverts with a toast that says what to do.
- **Designed empty and error states** that say what to do next (section 13.1).

### 11.7 Copy

- Sentence case. One name per thing ("Waiting for OK" is the only name for pending).
- No em dashes in product copy or public docs. A CI check enforces it (milestone 1).
- Destructive actions are confirmed by name ("Delete Rake the leaves?").
- Every sub-screen has a back control naming its parent ("‹ Settings"). A kiosk has no browser back button.
- Errors say what happened and what to do next, in plain words.

### 11.8 Accessibility

- Touch targets are at least 48 px, even where the drawn control is smaller.
- Rings and progress have text labels for screen readers ("Casey, 1 of 3 done today").
- Sheets are dialogs with a focus trap, Escape to close, and focus returned to where it came from.
- Every hold has a keyboard equivalent, and reduced motion is respected.

## 12. Layout, navigation, and appearance

### 12.1 The card measures itself

The shell runs one ResizeObserver on the card and sets a `layout` attribute that views style against. The layout comes from the card's own box, not the device, so the same card works full screen on a wall, in a dashboard column, or on a phone.

| Layout | Rule |
|---|---|
| Phone | narrower than 600 px |
| Portrait | 600 px or wider, and taller than wide |
| Landscape | 600 px or wider, and wider than tall |

- **Dead band:** when the aspect ratio is between 0.95 and 1.05, the previous layout is kept (the first measurement picks landscape), so split-screen sizes don't flip back and forth.
- **Keyboards:** while a text field in the card has focus, height-only shrinks are ignored. Kiosk browsers on Android WebView shrink the page when the keyboard opens, which would otherwise flip portrait to landscape mid-word. The focused field scrolls above the keyboard.
- The classifier is a pure function covered by unit tests. It replaces the per-view viewport media queries over time.
- Rotating keeps your place: the view, the person, and the scroll position.
- Reference sizes: 800 × 1280 (portrait, a typical 10-inch tablet), 1280 × 800 (landscape), and 390 × 844 (phone).

### 12.2 Header and navigation

- **Landscape:** one bar across the top: weather, the glance chip, the date and time, the module switcher (Calendar, Chores), the module's views (Chores: Board, Week, My day, Rewards), "⏳ 2 waiting for OK", and the gear.
- **Portrait:** glance at the top, touch at the bottom. A lock-screen style header shows a big clock, the date, the weather (with high and low), and glance chips ("9 of 17 chores done today", "Next: Dentist at 4:45 · Alex"). The switcher, views, Waiting for OK, and the gear sit in a bar along the bottom edge, where hands already are. With many people the big header shrinks to one line as you scroll, like large titles on an iPhone.
- **Phone:** a compact header, the bar at the bottom, and one person at a time with a swipe between people.
- The glance chip shows household progress on every module when Chores is on, and tapping it opens Chores. Calendar-only households never see it.
- Switching modules never moves the controls. The calendar gets the same header and bar; its Day view in portrait shows about 14 hours instead of 8.

### 12.3 Arrangement rules

- **Board:** people sit in columns while each column can be at least 240 px wide. Past that they wrap into an even grid (4 people in portrait make a 2 by 2), and a short last row stretches to fill. Order never changes: Settings order, left to right, then down. Each panel scrolls on its own. Panels narrower than about 300 px move times and badges under the chore name.
- **Week:** days across, people down, in both orientations and in the calendar. Weekly chores are a column in landscape and a section underneath in portrait.
- **My day:** portrait shows the whole afternoon and evening at once. Picture tiles go 2 across in portrait (4 across in landscape). Landscape keeps a side panel (ring, stars, goal, This week); portrait stacks the same pieces.
- **Rewards:** three across in portrait.
- **Sheets:** in portrait and on phones, sheets rise from the bottom, only as tall as their content, with drag to dismiss; the PIN keypad sits in the lower half. In landscape, sheets are centered cards, and Waiting for OK opens as a panel beside the board. The Undo toast sits just above the bottom bar. No screen gets a portrait-only version: the same sheets take two shapes.

### 12.4 Day and night

**Settings.** Appearance offers Light, Dark, and Automatic, shown as small pictures of the board (Automatic is split corner to corner). Automatic switches:

- **At sunset and sunrise,** from Home Assistant's `sun.sun`, so every screen in the house changes at the same moment ("Dark at 6:31 PM tonight, light again at 7:12 AM").
- **On a schedule** ("Light from 7:00 AM", "Dark from 9:00 PM").
- **Match Home Assistant:** each screen follows its own Home Assistant theme setting (`hass.themes.darkMode`). Handy for phones.

**The change itself** uses the browser's View Transitions:

- An automatic change sweeps across the screen in about 2 seconds. Night falls from the top like the sky darkening; day rises from the bottom like a sunrise. The sweep mask is 210% tall with its edge stops at 47.6% and 52.4%, so the edge stays on screen for the whole sweep.
- Switching by hand spreads the new look out from the finger in about half a second.
- With reduced motion it becomes a quick fade. Without View Transitions support it switches instantly.
- **Never mid-touch:** an automatic change waits until nobody has touched the screen for 10 seconds and no sheet is open.
- **Asleep screens just switch.** A page that is hidden at sunset wakes up already dark, and loading the page after sunset starts dark with no replay.
- Shadow DOM can't style the transition's pseudo-elements, so the card adds a tiny page-level stylesheet and sets a unique `view-transition-name` only while its own transition runs.

**Dark is designed, not inverted.** Surfaces get lighter as they come forward instead of relying on shadows. Member colors keep their hue and brighten a little, and the letters on them turn dark. Tints, badges, and Waiting for OK all have dark versions.

**Themes come in pairs.**

- Clean Light and Deep Dark merge into one theme, **PlanaVista**. **Minimal** and **Vibrant** gain dark versions. Each theme card shows both halves.
- Customize has a Light and a Dark swatch for each color. Dark starts as "Matched" (derived from the light color in OKLCH) and can be set by hand; choosing Matched again goes back.
- A color that would be hard to read gets flagged, with a one-tap fix that brightens or darkens it just enough.
- Shape settings are shared by both versions: corners (Sharp, Rounded, Pill), shadows (None, Subtle, Bold), events (Stripes, Solid), avatar border (Their color, White, Custom). "Reset to its original colors" restores a theme.

**Automations:** `select.planavista_appearance` (Light, Dark, Automatic) lets an automation or a voice assistant change it, for example Dark for movie night.

**Migration** (config entry minor version 2):

| Today | Becomes |
|---|---|
| Clean Light (`planavista`) | PlanaVista, Light |
| Deep Dark (`dark`) | PlanaVista, Dark |
| Minimal (`minimal`) | Minimal, Light |
| Vibrant (`modern`) | Vibrant, Light |

Existing customizations move to the version they were made for. New keys are added beside the existing `display.theme` and `display.theme_overrides`, which keep values 1.1.0 can read, so a rollback still renders sensibly.

## 13. Chores screens

### 13.1 Board

The Board shows everyone's today at once: one column per member, in member order (layout A, like the calendar's Day view).

- **Column header:** the member's picture inside their ring (today's progress), the name, a line such as "1 of 3 today · ★ 23 · 🔥 5 days", and "Next on calendar: Soccer at 5:30 · free until then" from the member's linked calendars.
- **Bands:** past bands collapse to one line ("Morning · 1 done"), so finished work stays visible as credit. The current band is highlighted ("Now · afternoon"); later bands are dimmed ("Later · evening").
- **This week** sits at the bottom ("This week · 4 days left"), then "Done today".
- **Ring closed:** "Ring closed for today. Everything due today is done. Nice work." with a check badge on the ring.
- **Young children** get picture tiles (big icon, a few at a time, Now first, no times) and a sticker strip for the week.
- **Evening check banner** at the reminder time (section 9.9).
- **States:**
  - Loading: a skeleton in the board's shape.
  - Empty: "No chores yet. Add your family's chores, or import a plan you already agreed on." with **Add chores** and **Import a plan**.
  - Can't reach Home Assistant: "Your check-offs aren't lost. We'll keep trying." with **Try again**.
  - Save failed: the item reverts, with a toast: "Couldn't save "Take out the trash". Try again".
  - Chores data needs a look (section 15).

### 13.2 Items: two zones

- **The circle is the "do it" zone.** Hold to complete; a quick tap only shows a hint ("Hold to complete"). Its touch area is 48 px even though it looks smaller. While held, the ring fills around the circle and a soft color sweep crosses the whole row, so the small target still gives big feedback.
- After a hold: the check pops, the checkmark draws, the title strikes through, "+1 ★" flies to the counter, the day ring steps, the row glides into "Done today", and a toast offers **Undo · Someone else did it?**
- **The rest of the row is the "about it" zone.** A tap or a hold opens the options sheet.
- **Picture tiles:** the whole tile is the hold target, since small hands need a big one. Options sit behind a small ⋯ corner button, mostly for grown-ups.
- A done item's check can be held again to uncheck it.
- A PIN-protected member's items ask for that member's PIN (or a parent's) on the first check-off, then their session lasts 2 idle minutes.

### 13.3 Options sheet

What it offers depends on who is looking:

- **A parent** (Alex on Fix the gate latch): Change the due date (Sun, next Sat, Pick a date), Plan it for a day, Hand it to someone else, Done by someone else, Edit, Delete. On a shared screen, parent options ask for a parent's PIN.
- **A member** (Casey on Yard work): Plan it for a day ("I'll do it Saturday": it shows on Saturday and is still due Sunday), Ask for more time and Ask to skip this week (both send a request to the parents), Done by someone else, and History (the streak, recent completions, and when it usually gets done).
- **A picture tile's ⋯** opens the same sheet.

### 13.4 My day

One person's day in the style they choose, saved on the member, so Casey gets Timeline on the tablet and on their phone. Opened by tapping a column header, from the My day view, or from a ring in the calendar's Day view. The header has a Timeline, List, and Pictures toggle.

- **Timeline:** calendar events are blocks at their real times; chores sit in their bands in plan order; a red line marks now. Free gaps say what fits ("Free until 5:30 · fits now: Take out the trash · Yard work"). That suggestion is presentation only, computed in the card from today's events and open items. The goal bar and This week are at the bottom, and the day ends at bedtime.
- **List:** a plain checklist (Today, This week, done items with their times) and the fairness strip: everyone's share of shared chores this week, by time done.
- **Pictures:** one huge Now tile (the whole tile is the hold target, "Keep holding… ⭐ +1"), then a Now to Next strip where calendar events become picture steps ("🏊 Swim at 6:00", then "🍽️ Set the table"), done tiles, Waiting for OK tiles, and a sticker chart toward the goal.

### 13.5 Week

- One mini ring per person per day. A closed ring means everything due that day was done. Today is outlined; future days are dashed ("3 due"). Tap a cell to see that day; swipe or use the arrows for other weeks.
- Weekly chores get their own column (landscape) or section (portrait), with progress and badges ("1 of 3 · Laundry from Mon", "⏳ 1 waiting").
- Away days show "🧳 Away · at Grandma's", with nothing due and the streak kept.
- Below the grid: a fairness bar ("Shared chores this week, by time done") and up to three plain-language highlights: "Blair has closed every ring this week.", "Casey missed Cat care on Monday." with **Excuse it** for parents, "Dana is away Wednesday and Thursday."

### 13.6 Rewards

- Balances and goals on top ("★ 23 · Goal: 🎬 Movie night pick · 17 more").
- The catalog: each card shows who can afford it ("Casey ✓ · Dana: 3 more") with **Redeem**, or "Not enough stars yet". Pending redemptions say "⏳ Casey · Waiting for OK". Goals are tagged on their cards.
- Parents see an **Add a reward** tile.
- A history line records who approved what ("Casey redeemed 30 minutes of extra screen time on Sunday, approved by Blair").

### 13.7 Waiting for OK inbox

- Opened from the header badge. A panel beside the board in landscape; a sheet in portrait.
- Grouped into **Chores to check** (with **Approve all (n)**), **Requests**, and **Rewards**:
  - "Dana finished Feed the fish · Today at 3:58 PM · ★ 1": **Send back**, **Looks good**
  - "Casey asks for more time on Yard work · Move the due date to next Sunday": **Not this time**, **Allow**
  - "Casey wants Pick the weekend game · ★ 10 of 23": **Decline**, **Approve**
- Send back offers quick reasons: Not finished, Missed a spot, Do it again, Write a note.
- Every action records who did it ("approved by Blair"). Approve all approves each item individually, attributed and individually undoable. On a parent's own phone, none of this asks for a PIN.

### 13.8 Quick add

A short sheet in parent mode (**+ Add chore**) for one-offs. The full chore editor in Settings handles Plan chores and everything else.

- What needs doing? (name), Who (pictures), When (Today, By a date: Tomorrow, Saturday, Sunday, Pick a date; or Repeats)
- About how long? (5 min, 15 min, 30 min, 1 h, 2 h, Other)
- Needs a parent's OK (on automatically for young children)
- "Earns ★ 4 (1 per 15 minutes) · Change"
- Cancel and Add

### 13.9 Calendar ties

When both modules are on:

- **Rings in the calendar's Day view:** each person's column header gets a small ring of today's chore progress; tapping it opens their My day.
- **Next on calendar** in each board column, so you can see who has time now.
- **The header glance** ("9 of 17 chores done today") on every module.

## 14. Settings, import, and setup

### 14.1 Shell Settings

- **One Settings for every module,** replacing today's reopened setup wizard. Only a parent can open it: on a shared screen the gear asks for a parent's PIN first; on a parent's own login it opens straight away; children can't open it.
- **Landscape:** a split view like iPad Settings, with the list on the left and the page on the right.
- **Portrait and phone:** a stack, with a back control on every page.
- The parent-mode strip stays visible at the top ("Blair · parent mode · Lock").
- **Sidebar:** People · Chores (Chores, Rewards, Rules, Reminders) · Calendar (Calendars, Calendar options) · Appearance · PINs and parent mode · Import and export · About PlanaVista. Rows show their current value ("Rules: Make it up", "Reminders: 7:00 PM", "Appearance: Automatic").
- When Chores is off, its group shows a single row that turns it on and runs a short setup for people and PINs.
- **Editors save; settings apply.** People, chores, and rewards have Cancel and Save, so a half-made change never reaches the board. Rules and Appearance apply as you tap. Leaving an editor with unsaved changes asks "Discard changes?". Drafts survive a parent-mode timeout (section 9.4).
- Two screens editing the same record: each record carries a revision number, and saving over a newer revision asks "This changed on another screen. Load the new version?" instead of overwriting.

### 14.2 People

- The list is in board order ("This is the order on the board. Drag ≡ to change it."). Rows summarize each person: "Parent · PIN on · Alex's calendar", "Young child · sees pictures · no calendar". **+** adds someone.
- **A person's page:** name; color (no two people share one); picture (an initial on their color, an emoji, or their Home Assistant person's photo); age group (with what it sets); Parent; Needs an OK for (every chore, marked chores, no chores); My day style; Stars (the balance, opening history and give or take); Saving up for; Away; PIN; sleep and bedtimes; Home Assistant links (person, calendars, phones, phone reminders); Use in automations (the person's entity IDs); Remove.
- **Parent is separate from age.** A parent never needs an OK, needs a PIN on a shared screen, and gets a Phone row that sends Waiting for OK requests with buttons.
- **Nobody needs Home Assistant to be a person here.** Dana has no account, no calendar, and no phone, and gets the same page without those rows filled in.
- Adding someone opens the same page, empty, with Cancel and Add.
- Removing someone is confirmed by name. Their chores become unassigned and wait in the list; past weeks still show what they did.

### 14.3 Chores list

- Header: "19 chores · 16 on the board" and **+ New chore**; a search field; person filter chips (Everyone, Alex, Blair, Casey, Dana).
- Grouped by rhythm: **Every day**, **Every week**, **On a schedule** (Repeats), **One time** (Once), and **Not on the board** (tagged "Plan only").
- Each row: the chore's picture, name, a rhythm line ("2 h a week, split · any day", "Monthly · any time that month", "By Sunday · 2 sessions"), tags ("Needs an OK"), stars, and who does it. "Show 3 finished" reveals finished chores.
- In landscape the list uses two columns, placing whole groups in a grid (Every day beside Every week, then On a schedule beside One time), so no group is split across columns.
- Filtering by a young child adds a preview of how they see their chores (picture tiles).

### 14.4 Chore editor

- **Plan, Once, or Repeats** at the top, as a segmented control. Who, the board settings, and Use in automations work the same for all three.
- **Who:** people chips. For Plan: **Split the time** (with each person's share) or **Each does it all**.
- **Plan:** time per day or per week, check-offs, days (none means any day), time of day.
- **Once:** On a day, By a date, or Any time; the date; an optional time; sessions; the estimate in all.
- **Repeats:** every day, week, or month; every N; days (weekly); starts; ends never, after N times, or on a date (showing how many times, "7 times"); each time on the day or any time that week or month; the estimate each time. This uses a shared `pv-recurrence-picker`, which the calendar can later reuse for its own recurrence editing, and it produces exactly the backend's RRULE subset.
- **Worth line:** "About 1 h and ★ 4 each check-off", from the same formula the engine uses.
- **On the board:** show on the board (Plan only), needs a parent's OK, stars (automatic or a number), category, and picture.
- **Use in automations:** the chore's ID and a ready-to-copy `planavista.complete_chore` example.
- **Delete** is confirmed by name. The chore leaves the board at once; past weeks still show what was done, and stars stay earned.
- Planning fields from an imported plan (need or want, locked minimums, agreed) are kept as they are and come back with the family-meeting planner. The editor shows only what changes the board.

### 14.5 Other Settings pages

- **Rewards:** a list like Chores. Each reward opens a short sheet: picture, name, cost in stars, needs an OK, and who can get it.
- **Rules:**
  - Missed chores: "Make it up within the week" (default: "Missed on its day? It moves to This week, and only counts as missed if the week ends first."), "Strict days" ("A chore not done on its day is missed."), or "Carry it over until done" ("Nothing is missed. It stays on the board, marked overdue, until it's done or excused.").
  - Day starts at (3:00 AM). Approve automatically at the end of the day. Stars per minutes (1 per 15). Sound.
- **Reminders:** the evening check on the screen (7:00 PM: "Casey has 2 chores left"), phone reminders per person ("At 7:00 PM, only if chores are left"), and which parents' phones get Waiting for OK requests.
- **PINs and parent mode:** "Is this a shared family screen?" for the signed-in account; each person's PIN (set, change, remove; parents need one on a shared screen); "Shuffle the keypad" ("The numbers move each time, so smudges and glances don't give a PIN away."); the lockout rule; the non-admin account advice.
- **Calendars:** today's calendar list, plus **Belongs to** for each calendar. A calendar linked to a Home Assistant person joins that person automatically. **Calendar options:** today's display options.
- **Appearance:** section 12.4, plus Motion (Follow the device, Full, Reduced).
- **Import and export:** import a plan (choose a file or paste its text), export a PlanaVista file, and restore.
- **About PlanaVista:** version, links, and how to download diagnostics.

### 14.6 Importing a plan

- Settings, Import and export: **choose a file or paste its text** (wall tablets rarely have files on them). Home Assistant validates the file and builds the preview. Nothing is saved until **Import**.
- **The preview** opens inside Settings ("‹ Import and export", "Review the import"):
  - A file card: "our-plan.json · Household Hours plan, version 1 · exported October 3", with Choose another.
  - **People:** matched by name (tap to rematch), with bedtimes and sleep from the plan. A new person picks an age group.
  - **Needs a look:** decisions to make, such as "No one is assigned to Wash the car. It waits off the board until someone is." or "3 activities are already in your chores. They'll be updated."
  - **On the board**, by category, with a switch per activity and an "updates yours" marker for matches.
  - **Plan only**, by category, and **Set times** (never chores, never written to calendars).
- **The Import bar** stays pinned at the bottom in both orientations, with a plain summary: "Adds Dana and 28 activities, and updates 3. Nothing is deleted. Stars, rewards, and history stay as they are." and **Cancel**, **Import**.
- Landscape keeps the Settings split view, with the preview in two columns that scroll under the pinned bar. Portrait shows one column with summary tiles.
- Importing again updates instead of duplicating (section 7.9).

### 14.7 First-run setup

One question per step: a big heading, a short lead, the main button at the bottom, progress dots, and Back at the top left. Steps come from the setup step registry; each module contributes steps with a condition for when they apply.

1. **Welcome to PlanaVista.** Four member rings. "About 5 minutes. Everything can change later in Settings." **Set up**, or **Restore from a PlanaVista file** (the same preview as import, so a rebuilt Home Assistant gets its household back in one step).
2. **Who lives here?** Home Assistant people with a checkbox and a role chip each (Parent, Adult, Teen, Older child, Young child), plus **Add someone** for people without Home Assistant.
3. **Calendars** (calendar module): today's calendar picker, plus Belongs to.
4. **Do you want chores too?** (chores module): "Start from our household plan" (import, preview first), "Start with some common chores", "Start empty", or **Not now, just the calendar**, which goes straight to Look.
5. **Pick some to start with** (common chores): 12 starter tiles, each with a person, how often, and about how long, suggested by age group so young children get quick, simple ones. Tapping a picked tile changes those. **Add 8 chores**. Each pick becomes a normal chore.

   | Starter chore | Rhythm | About | Suggested for |
   |---|---|---|---|
   | Make your bed | daily | 5 min | young child |
   | Set the table | daily | 10 min | young child |
   | Tidy toys | daily | 15 min | young child |
   | Unload the dishwasher | daily | 10 min | older child or teen |
   | Take out the trash | Tue, Fri | 10 min | older child or teen |
   | Feed the pet | daily | 5 min | older child or teen |
   | Laundry | weekly | 2 h | adult |
   | Kitchen cleanup | daily | 30 min | adult |
   | Vacuum | weekly | 1 h | adult |
   | Clean the bathroom | weekly | 1 h | teen |
   | Yard work | weekly | 1 h | teen |
   | Groceries | weekly | 1 h 30 min | adult |

6. **Is this a shared family screen?** (chores module): "Yes, the whole family uses it" or "No, it's just mine". On yes, parents set their PINs ("Alex ✓ PIN set", "Blair: Set PIN"). An admin account gets the note: "This screen is signed in with an admin account. A non-admin account is safer for a shared screen. How to set one up".
7. **Look:** Appearance (Light, Dark, Automatic, and the theme).
8. **You're all set.** A preview of the board with two tips: "Hold the circle to finish a chore. Let go early and nothing happens." and "Settings needs a parent's PIN. It's the gear in the bottom bar." **Open the board**.

- **In landscape** the board fills in on the left as you answer on the right ("4:10 PM · Tuesday, October 13 · 0 of 6 chores done today").
- **Leaving halfway** keeps what's done; opening the card again picks up at the same step.
- **Updating changes nothing for calendar-only homes.** They never see setup again. Settings gains People, made from calendars already linked to Home Assistant people, and a Chores row that runs a short version of this setup.

## 15. Errors and edge cases

### 15.1 Check-offs

- A check-off shows at once and is sent when the connection allows. If Home Assistant is restarting or the Wi-Fi drops, it waits, kept in the browser's storage so it survives a page reload, and goes through when the connection returns. The board shows "Can't reach Home Assistant. Your check-offs aren't lost. We'll keep trying."
- Resending is safe because each check-off carries its occurrence key.
- The server's clock decides. If a waiting check-off can no longer count because its period has closed, it is undone with a message ("Couldn't save Take out the trash: the day had ended").
- A save that fails for another reason reverts the item with a toast that says what to do.

### 15.2 Automations and actions

- `complete_chore` reports what happened: `done`, `pending`, `already_done`, or `nothing_open`. A repeat does no harm, so a camera automation firing twice is fine.
- Real mistakes stop with a plain, translated error in the automation trace: a chore or member that doesn't exist, an action that needs a parent, a schedule outside the supported subset, not enough stars.

### 15.3 Damaged or missing data

- Home Assistant moves a damaged Store file aside (`<file>.corrupt.<time>`), raises a critical repair issue, and starts that Store empty (verified in `homeassistant/helpers/storage.py`, 2026.9.4).
- The household Store records when chores were set up. If chores were set up but the plan or log comes back empty, PlanaVista doesn't show an empty board and doesn't write to the empty Store. The board says **"Chores need a look"**, and a parent chooses: restore a Home Assistant backup (with directions), import a PlanaVista file, or start over.
- If the household Store is damaged, the calendar keeps working, and chores records that refer to missing people are listed under "Needs a look" until a parent restores or reassigns them.
- A Store written by a newer major version (a rollback across a major change) raises `UnsupportedStorageVersionError`. The Chores module stays off with a repair issue that says to update PlanaVista. The calendar keeps working.
- A failed write (for example, a full disk) is logged, raises a repair issue, and shows "Couldn't save" on the card.
- Each module fails on its own. If chores can't load, the calendar keeps working.

### 15.4 Things that need a person

Problems that need a person appear under **Needs a look** at the top of Settings, and in Home Assistant's Repairs when an admin has to fix them. Examples:

- A phone that was removed. Requests fall back to the on-screen inbox, and the problem is logged once, not on every send.
- A linked Home Assistant person or calendar that no longer exists. The link is cleared and the person keeps working.
- Automatic appearance at sunset and sunrise without Home Assistant's Sun integration. Appearance says so and uses the schedule times until it's fixed.
- Damaged data (section 15.3).

### 15.5 Other edge cases

- **Stale notification buttons** (the request was already resolved, or the token was used) are ignored and the notification is cleared.
- **Time zone changes** recompute boundaries from the next boundary on. **Clock jumps** never process a boundary twice, because rollover keeps a bookmark.
- **PINs:** lockout and recovery as in section 9.6.
- **Import:** an unknown file says "This doesn't look like a Household Hours or PlanaVista file." A newer version says "This plan was made with a newer Household Hours (version 2). Export it as version 1, or update PlanaVista." Invalid content lists the problems by item, and nothing is saved.
- **Validation:** names are required; shares must add up to the time; a repeating schedule outside the subset is refused with a clear message; a chore with no one assigned waits off the board.

### 15.6 Diagnostics and logs

- Home Assistant's "Download diagnostics" gives bug reports what they need: counts, settings, Store versions, and recent errors, with member names replaced ("Member 1") and PIN data and Home Assistant user ids left out entirely.
- Logs stay quiet: warnings only for real problems, debug logs for engine decisions, and never a PIN or a token.

## 16. Testing

- **Engine (pure Python, fake clock), table-driven:** periods and the 3:00 AM rollover; catching up after days offline; 23- and 25-hour days around daylight saving changes; a time zone change; every missed policy, including switching mid-week; occurrence generation for Plan, Once, and Repeats; credit and stars (including half-up rounding); approvals and auto-approve; undo and send back; requests; overrides; excuses and Away; streaks; progress numbers; idempotency (the same check-off sent twice credits once); and the worked examples in section 8.16.
- **Recurrence:** the built-in expander is compared against python-dateutil's `rrule` as a reference (a test-only dependency) over a seeded set of generated rules within the subset, plus the RFC 5545 examples that fall inside it.
- **Shared tables:** the stars formula and the status map are checked by pytest and vitest against the same JSON fixture, so the card and the engine can't drift apart.
- **Home Assistant integration** (the existing Docker setup with `pytest-homeassistant-custom-component`): entities and devices; to-do items; every action with its responses and errors; WebSocket commands and subscriptions; permission rules for every account kind in section 9.5; parent mode and member sessions; lockout; actionable notifications, including forged events and stale tokens; rollover timers and startup catch-up; damaged Stores; diagnostics redaction; upgrading from a 1.1.0 config entry.
- **Snapshot tests** pin every entity ID, state, attribute, event type and data, action field, and response shape, so changing anything an automation might depend on has to be deliberate.
- **PIN leak test:** sets a known PIN, runs every flow, and fails if that PIN appears in logs, exports, diagnostics, events, entity attributes, or automation traces.
- **Migrations:** every Store and config-entry migration is tested from the old shape to the new one, run twice with the same result, and checked to keep unknown fields.
- **Card (vitest, `TZ=America/Chicago`):** the size classifier (including the dead band and the keyboard rule); the appearance resolver (sun, schedule, Match Home Assistant, the quiet moment, asleep screens); `spring()` to `linear()`; `contrastText()`; the status map; the stars formula; the check-off queue (persisting, resending, refusing); the recurrence picker's output; the module, Settings, and setup registries.
- **Screens:** checked on the dev Home Assistant with the sample household at 800 × 1280, 1280 × 800, and 390 × 844, in light and dark, with reduced motion, and with the keyboard only. Screenshots go with each milestone demo.
- **CI:** Validate (hassfest, HACS, backend tests) and Frontend (type-check, tests, build, committed bundle matches) run on `main`, `fix/**`, and `feat/**`, plus the copy check for em dashes.

## 17. Rollout and milestones

### 17.1 Releases

- Today HACS installs whatever is on `main`. Before chores work lands, PlanaVista starts publishing GitHub releases, beginning with 1.1.0 (HACS uses the latest published release as the installable version; tags alone don't count), and sets `hide_default_branch: true` in `hacs.json`.
- Each milestone then merges to `main` when it is done, while households install only finished releases and can step back one release in HACS if something breaks.
- Any release can be rolled back without losing data (section 7.8).

### 17.2 How milestones run

- One spec (this document), and one implementation plan per milestone in `docs/superpowers/plans/`. Each plan is written when its milestone starts, so it uses what earlier milestones taught.
- Each milestone is built on its own branch (`feat/chores-m1-groundwork`, and so on) with CI green.
- Each milestone ends with a demo on the dev Home Assistant: what was built and how to look at it. The owner's go-ahead comes before the merge to `main` and before any release.
- Production is updated through HACS by the owner after a release. Checks on production are read-only.

### 17.3 Milestones

| # | Milestone | Scope | Done when | Release |
|---|---|---|---|---|
| 1 | Groundwork | CI for `feat/**`; em-dash cleanup (4 card strings, README, DESIGN_SYSTEM, CONTRIBUTING, docs) with a CI check; the card split into shell, core, and modules (calendar moved unchanged), the module registry, per-card state, the `planavista-card` alias, and the `modules` and `module` options; setup and Settings registries replacing the wizard's hard-coded pages (same steps as today) | The calendar behaves exactly as before on the dev Home Assistant (every view, dialog, setup, and settings); tests and CI green | after the go-ahead: publish 1.1.0 and hide the default branch |
| 2 | Household members, PINs, shell Settings | The household package and Store; members created from person-linked calendars; calendars keep `member_id`; PINs, lockout, sessions, shared-screen accounts, the PIN sheet, the parent-mode header; shell Settings (split view and stack; People and the person page without chores rows; PINs and parent mode; Calendars with Belongs to; Calendar options; About); the setup framework (Welcome, Who lives here, Calendars, Look, Done); the parent-mode counterpart of `save_config` | A 1.1.0 calendar-only install upgrades with nothing changed except Settings' new home; the permission rules pass for every account kind | |
| 3 | The new look | Size classes, portrait and phone layouts, the bottom bar; Appearance (modes, transitions, theme pairs, Customize, the contrast guard, migration, `select.planavista_appearance`, Motion); the `contrastText()` fix; motion helpers (springs, the hold gesture, sheets); the bundled heading face; `DESIGN_SYSTEM.md` rewritten (motion, type, color jobs, status map, states, copy, layout, dark mode); the calendar gets the header, bar, portrait layouts, and day and night | Every calendar view works in portrait, landscape, and phone sizes, light and dark, on the dev Home Assistant | **1.2.0** |
| 4 | Chores engine and HA surface | The chores package (model, engine, recurrence, Stores); actions; the WebSocket API; to-do, sensor, binary sensor, and event entities; Assist through the to-do lists; diagnostics | The section 8.16 acceptance tests pass on the dev Home Assistant through actions and to-do lists | |
| 5 | The chores board | Board; two-zone items and hold to complete; the options sheet; My day (Timeline, List, Pictures); Week; Rewards; the Waiting for OK inbox; quick add; calendar ties; the check-off queue; loading, empty, and error states | The sample household's day runs entirely from the tablet on the dev Home Assistant, in portrait and landscape | |
| 6 | Chores settings and setup | The Chores list and chore editor (with `pv-recurrence-picker`); Rewards; Rules; Reminders; the person page's chores rows; import, export, and restore; the chores setup steps (the chores choice, common chores, the shared screen and parents' PINs); the evening check; phone notifications with buttons; phone reminders | A new household can set up chores from nothing, or from a plan file, on the tablet alone | **1.3.0** (chores) |
| 7 | The calendar takes on the rest | Rounded headings, the status map, designed loading, empty, and error states, the copy rules; event dialogs become sheets (with focus traps and Escape); springs for view changes | The calendar and Chores read as one product | **1.4.0** |

The roadmap's photo frame module moves to after chores.

## 18. Future updates

- **Family-meeting planner** (spec 2): Agree, Load, and Schedule on top of the chore editor, porting the planner's math, plus parent-only editing of locked minimums. It uses the hidden fields stored now (need or want, locked, agreed).
- **Photo proof:** for chores that need an OK, the child snaps a photo on the tablet and it appears in the parent's approval notification.
- **Help and trades:** "Can someone take my trash tonight?" A sibling accepts, and the chore and its credit move to them.
- **Up for grabs:** optional bonus chores anyone can claim for stars.
- **Taking turns:** a fourth way to assign a chore (Casey one week, Dana the next).
- **A PlanaVista LLM API:** approving, stars, and rewards by voice.
- **The Lists module** and **the photo frame module.**

## 19. References

- **Approved mockups** (local brainstorming files, not committed, in `.superpowers/brainstorm/56000-1791589520/content/`): `board-v2-directives.html` (Board and states), `my-day-styles.html`, `item-zones.html`, `motion-hold.html` (the reference implementation of the motion language), `week-rewards-parent.html` (Week, Rewards, parent mode, quick add), `portrait-layouts.html`, `day-night.html`, `settings-editors.html`, and `import-onboarding.html`.
- **Home Assistant behavior verified on 2026.9.4:**
  - `TodoItem` has six fields (`summary`, `uid`, `status`, `due`, `description`, `completed`) and two statuses, so approvals, done-by, and stars can't live in to-do items.
  - The Companion app fires `mobile_app_notification_action` with the phone's Home Assistant user in the event context. Notify entities carry only a title and message, so actionable buttons need the legacy `notify.mobile_app_*` service.
  - Assist has `HassListCompleteItem` and the to-do LLM tool `todo__get_items`.
  - Store loading renames a damaged file, raises a critical repair, and returns nothing; a newer minor version loads as-is and is saved again with the older number; a newer major version raises `UnsupportedStorageVersionError`.
  - Config entries with a newer major version fail to load. A newer minor version of the same major version loads when the integration has no `async_migrate_entry`, or when its migration returns success.
- **HACS:** the latest published GitHub release sets the installable version (tags alone don't count), and `hide_default_branch` stops HACS from offering the default branch.
