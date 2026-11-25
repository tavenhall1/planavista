# Missed chores at the top, and a week that feels its end

Date: 2026-11-25. Release: 0.15.0 (a feature). Mockups: the Design canvas "Missed and Running Late" (approved by the owner: the week running out, missed at the top, a missed chore's options).

## Why

A household has used the chores Board daily for five weeks. Two things let a chore slip without anyone noticing:

1. **A weekly chore gives no sense of its deadline.** The This week heading says "4 days left" in the same quiet grey every day, and a row only turns amber when it falls behind pace. Saturday looks like Wednesday.
2. **A missed chore disappears.** Under the default house rule (Make it up within the week) a chore not done by its deadline is recorded as missed at the 3 AM boundary and leaves the Board. A daily chore is missed at the end of each day and is gone the next morning. Only someone stepping back through past days ever sees it.

The owner's goal, in their words: missing a chore "would really require somebody to be completely ignoring it."

## Goals

- **Urgency:** a chore with a deadline escalates visibly as the deadline nears: amber at 3 days left, moving to the top of the column at 2, red at the top on the last day.
- **Missed at the top:** a missed chore is called out at the top of its person's column, above everything else, until it is done or a parent clears it.
- **Repeats counted:** a chore missed more than once says so ("Missed 2 weeks in a row", "Missed 3 days in a row").
- **The record stays honest:** a miss stays a miss. Past rings, streaks, and summaries do not change when a chore is done late.
- **Every surface agrees:** the kitchen, phones, each member's to-do list, and voice all show the same thing, because the backend decides.

## Non-goals

- New notifications or reminders (the evening check stays as it is).
- Changing the Carry it over rule. It already keeps unfinished chores on the Board under "Overdue" without counting them missed. It stays exactly as it is.
- Any change to how stars are worth or how rings and streaks are computed for days already ended.
- Past days in the Board's day navigator: they keep showing their record as now.

## Anti-goals (a failure even if it works)

- **A pile-up of things that can't be made up.** Five skipped beds must not become five rows to check off. One row per chore per person, always.
- **Double punishment.** A missed chore must not also hold today's ring open, or count as missed again on later days. It was missed once, on its deadline.
- **Nagging that is wrong.** A chore that was excused, a person who was away, or a day the chore wasn't scheduled must never produce a "missed" callout or break the count's meaning.
- **Two copies of one chore on the Board** (a missed one and this week's) when one check-off would do.

## The owner's decisions

1. A missed chore stays at the top **until done late, or a parent clears it**. It does not clear itself.
2. Doing it late earns the chore's usual stars. The miss stays in the record; the missed day's ring and the streak do not come back.
3. **Daily chores:** today's copy moves to the top, flagged "Missed yesterday" or "Missed 3 days in a row". Doing today's clears the flag and earns **one** day's stars (the owner: missing the bed two days and doing it today earns stars for one day).
4. **Weekly and other repeating chores work the same way:** one check-off covers the missed period(s) and the current one. The flag rides on this period's copy at the top, which earns one period's stars when done. Last week stays missed in the record.
5. A chore with **no newer copy** to carry the flag (a one-time chore, or a repeating chore between its periods) keeps its own late row at the top until it is done or cleared.
6. A parent has two ways to clear a callout: **Take it off the board** (it stays missed) and **Excuse the misses** (they become excused, the existing late excuse).
7. Urgency: amber at 3 days left; at 2 days the chores move to the top in an amber panel ("2 to go"); on the last day the panel turns red ("Last day · 2 to go", "Ends tonight").
8. Built in the backend (option 1 of three): the household's records carry the misses, so every screen, list, and voice agree. Rejected: the card working it out alone (to-do lists and voice wouldn't know; late check-offs need the backend anyway), and a separate late-chores list beside the overdue records (repeats logic that took many review rounds to get right).

## Approaches considered

| | How | Trade-off | Chosen |
|---|---|---|---|
| 1 | The engine keeps **late records** (the carried-record machinery, marked missed) and serves the callout; the card draws it | Most work; one source of truth; reuses tested code | Yes |
| 2 | The card reads recent summaries and draws callouts itself | Quick for daily flags; to-do lists and voice can't see it; late check-offs still need the backend | No |
| 3 | A separate late-chores list in the log | Clean on paper; duplicates the carried logic that rounds 8 to 15 hardened | No |

## How it works today (the parts this touches)

Facts read from main at 61d54cd (paths under `custom_components/planavista/`):

- At each chore-day boundary `engine.rollover` closes the day. An open occurrence whose due day ended is either **carried** (house rule Carry it over: a record in `log["carried"]` via `_carry`) or **missed** (Strict or Make it up: listed in the day summary's `missed` and a `missed` event). The week summary splits late keys into `missed` and `carried` by the rule on each key's due day.
- Carried records are served by `_items_on` with **no rule check** as section `overdue`, `counted=True` (they hold today's ring open), `overdue_since` set. `_tidy_carried` drops a record once done or excused or its chore or person is gone.
- Completing an overdue item (`complete`) credits today (the completion's own chore day), grants the item's stars, and **never touches summaries**: the due day's record stays as it was.
- Summaries are rewritten after the fact only by late send-backs (`_sent_back_late`), excuses (`_excuse_counted`, `_excuse_unkeyed`: skip requests, `override(excused)`, `excuse`, `excuse_missed`), and chore deletion.
- `excuse_missed` (websocket only, parent level) accepts a key that some summary lists as missed or counts open, restates the summaries to excused, adds a late excused override, and answers `streak_holds`.
- Daily chores (`day:` periods) are due at the end of their day under every rule; Make it up only gives picked-day weekly chores until the week's end.
- `todo_items` lists overdue items too, described "Overdue since Mon" (`status.describe`).
- The card: `board-derive.ts` `columnFor` draws Overdue first, then the bands, This week (head right "N days left" / "Last day"), Done today. `status-map.ts` `itemBadge` turns a floating week row amber when its open check-offs equal the days left and red ("Last day") on the last day.

## Design

### 1. Late records (backend)

At rollover, where an occurrence is **missed** today (Strict or Make it up on its due day), the engine also appends a **late record** to `log["carried"]`: the `_carry` shape plus `"missed": true` and `"since"` = the due day. Carry it over behaves exactly as now (no `missed` flag).

A late record differs from a carried one in three ways:

- **Not counted.** It is served with `counted=False`: it never holds today's ring open, never enters a later day's `open` list or `keys`, and never counts as missed again. (A carried record stays `counted=True`.)
- **Hidden behind a newer copy.** While the same member has an open, visible occurrence of the same chore (today's copy of a daily chore; this period's copy of a weekly or repeating chore, once it has appeared), the late records of that chore and member are not served as rows. Instead that copy carries the **missed flag** (section 2) and is drawn at the top.
- **Answered by any credited check-off of the chore, and dropped only once that check-off stands.** A late record is *answered* while the same member has a credited check-off (done, or waiting for approval) of the same chore at or after the record's `since` day, whichever copy or session was checked off. An answered record is hidden (no row, no flag). It is **kept** until the rollover's tidy finds its answering check-off approved (`done`), and only then dropped (the way `_open_carried` and `_tidy_carried` treat carried records today). So the toast's Undo, a to-do uncheck, or a parent's send-back (same day or late) un-answers it and the callout comes back with its full count. Nobody can hold a chore, tap Undo, and make a miss vanish.

A late record is also dropped by: Take it off the board, Excuse the misses (or any late excuse of its key, including Excuse it from the Board's day navigator), its chore deleted, or its person removed (`_tidy_carried`'s existing rules). Records older than 90 days go with the log's retention.

A miss made **after the fact** by a late send-back (`_sent_back_late` under Strict or Make it up, which already writes the summary's `missed` and fires `missed`) also appends a late record, as rollover does.

**One row per chore per person.** Several late records of one chore and member (several periods, several picked days or check-offs within one week, several sessions of a one-time chore) are one callout. One credited check-off answers all of them and earns one copy's stars (the owner's bed rule, applied to every kind).

**Sensors:** a standalone late row (no newer copy) counts in `sensor.<member>_chores_left` and keeps `binary_sensor.<member>_chores_done` off, so automations see misses; it still doesn't count in the ring.

**Hand-offs:** late records stay with the person who missed them. If the chore now belongs to someone else (a parent's hand-off, or an edit that removes them from it), the callout stays with them as a standalone late row until done or cleared. The new assignee's copy carries no flag.

A **one-time chore** with an open late record is not finished (`finished_at` stays unset) until the record goes.

### 2. The missed flag (feed)

Every item in the board feed gains an optional `missed`:

```
missed: {
  count: number,        // distinct missed PERIODS of this chore for this member (not records: two picked days or two loads in one week count once)
  unit: 'day' | 'week' | 'month' | 'time',
  in_a_row: boolean,    // the misses were consecutive periods of the chore
  periods: string[],    // the missed periods' start days, oldest first (the sheet's "weeks of Nov 15 and Nov 22")
  late: boolean         // true on a late record's own row (no newer copy); false on a flagged current copy
}
```

- `unit`: `day` for `day:` periods and for anything whose miss was a single day (a Strict picked day, a Repeats day instance under Strict), `week` for weekly plan chores and weekly repeats missed at the week's end, `month` for monthly repeats, `time` for one-time chores and irregular repeats. A partly done week (1 of 2 loads) is a missed week.
- A Strict picked-day miss in the current week (Tuesday missed, Thursday's copy showing) reads "Missed Tue" and rides on Thursday's copy.
- `in_a_row`: consecutive by the chore's own schedule. A day the chore wasn't scheduled, or a day the person was away, doesn't break a run; an excused or done period does (but those leave no late record, so a gap in the records' periods that isn't explained by schedule or away means `false`).
- The feed's board gains `missed_total`: the number of rows with a `missed` flag across members on the board (the header chip).

To-do lists and voice: a flagged item's description becomes the callout's words ("Missed yesterday", "Missed 2 weeks in a row"); a late row's due stays its original due. `status.describe` and the card's `itemBadge` share the words through the existing fixture `tests/fixtures/chores_status.json`.

### 3. Words

| Case | Badge |
|---|---|
| One day | Missed yesterday |
| Days in a row | Missed 3 days in a row |
| One week | Missed last week |
| Weeks in a row | Missed 2 weeks in a row |
| One month | Missed last month |
| One-time chore | Missed Tue (short day, as `shortDay`) |
| Not in a row | Missed 3 times |
| Done late (Done today row of a late record) | Done late |

Heading of the top panel: "Missed · N" (N = rows in it). Header chip beside "N of M chores done today": "N missed" (only when N > 0).

### 4. The Board (card)

Order of a column, top to bottom:

1. **Missed** panel (red outline, `--pv-bad-bg`, heading "Missed · N"): every row with a `missed` flag (late rows and flagged current copies), oldest miss first.
2. **Due-soon** panel, when it applies (section 5).
3. Carry it over's **Overdue** (unchanged, for households on that rule).
4. The day's bands, This week (what remains of it), Done today, as now.

A flagged current copy leaves its usual place (band or This week) for the Missed panel; its own meta (estimate, "0 of 1") stays. Picture tiles (a young child's screen) put missed tiles first with the red outline and the badge under the name; a due-soon tile gets the amber or red outline. Row height, hold-to-check, Who did it?, approvals, and the toast work exactly as for any row.

Rows in the panels use the same `pv-chore-item` as everywhere; the panel is a wrapper, so keyed rows glide between places (the existing keyed list) when a flag appears or a day turns.

### 5. Urgency (card only)

For every open row whose deadline is a day boundary within reach, by **days left to its own deadline** (today included, the meaning `week.days_left` already has):

| Days left | Look |
|---|---|
| 4 or more | As today (the pace rule still turns a behind-pace row amber) |
| 3 | Heading right "3 days left" in `--pv-warn-ink` with a dot; rows' badge "3 days left" (warn) |
| 2 | The rows move to an amber **due-soon panel** at the top (under Missed): heading "This week · 2 to go" left, "2 days left" right; names semibold |
| 1 | The panel turns red with a 2 px `--pv-danger` border: "Last day · 2 to go", right "Ends tonight"; names bold |

Applies to: floating weekly rows and picked-day rows due at the week's end (window `week`), monthly repeats (by days left in their month), and dated one-time chores (by days to their `by` day; under 3 days they join the panel). Not to daily chores (always due tonight) or undated one-time chores. "N to go" counts open check-offs (a 2-load laundry chore with none done counts 2). When the panel holds only the week's chores its heading says "This week"; with anything else it says "Due soon".

The same badges and the Missed panel appear in **My day** (one person's list); the **Week view**'s weekly line uses the same thresholds for its badge. The calendar's header chip shows "N missed" too (the shared glance).

### 6. A missed chore's options (sheet)

The existing chore options sheet gains, for a row with a `missed` flag:

- A red note at the top: the badge words in bold, then which periods ("Not done the weeks of Nov 15 and Nov 22. Doing it now takes it off the top. Both misses stay in the record." Wording for one period: "Not done last week."). For a flagged current copy: "Doing this week's takes it off the top."
- Done (the primary action), as now.
- Under "For a parent" (the existing parent gate: PIN or parent level, as `excuse_missed`):
  - **Take it off the board** ("It stays missed. Nothing more to do this time."): new command `planavista/chores/clear_missed {chore, member}` (parent level), drops that chore's late records for that member. Refusals: `not_missed` when none remain (another screen answered first; the card says it was already taken care of).
  - **Excuse the misses** ("There was a good reason. They count as excused, not missed."): `excuse_missed` for each late record's key (one call taking a list, or a new `excuse_missed` field `keys`; builder's call), which restates the summaries as now and drops the records. Answers `streak_holds` as today.

### 7. House rules and rule changes

- Strict days and Make it up: as above. Under Make it up a picked-day chore is missed only at the week's end (as now), so its callout appears the next morning; under Strict it appears the morning after its day.
- Carry it over: no late records; its Overdue section is unchanged. Records made under one rule keep their kind after a rule change (a late record stays late, a carried one stays carried); the rule on each occurrence's due day decides, as summaries already do.

### 8. Upgrade day

At the first start of 0.15.0 the engine **back-fills** late records once, from the day summaries of the last 14 chore days: every key listed `missed` there whose chore and member have **no credited check-off of that chore since** the key's due day, and whose chore and member still exist. So a household sees this week's open misses at once instead of only those made after the update. A marker in the log (`late_backfill: 1`) makes it run once. Fourteen days bounds the surprise: at most two weeks of a daily chore (one row, "Missed N days"), at most two weekly periods. A one-time chore (or a Repeats chore's last time) that 0.14.1 marked finished at the rollover after its miss is **reopened** by the back-fill (`finished_at` cleared), so it shows; it finishes again once answered or cleared.

### 9. Data and stepping back

- Add fields only: late records are ordinary `log["carried"]` entries plus `missed: true`; `late_backfill` is new. Unknown fields are kept.
- Step back to 0.14.1: it serves every carried record as an Overdue row, counted, so late records would show there as "Overdue since ..." rows and hold rings open until done or excused. Acceptable for one step back (spec 7.8); note it in the release notes' upgrade section.

## Edge cases the builder must handle

- A chore reassigned (assignee override or edit): see Hand-offs in section 1 (the callout stays with the person who missed it).
- A chore's schedule edited so it no longer repeats: its late rows stay until done or cleared.
- Undo or send-back of the answering check-off: the callout returns with its full count (section 1).
- A late record whose person is away today: it still shows (away excuses only the days away; the miss happened before).
- Two screens: Take it off the board on one, Done on the other: whichever lands first wins; the other is told plainly (`not_missed`, or the check-off finds the row gone and credits nothing extra: builder's call, but no error toast for the child).
- Stars: a late row earns its own stars when done; a flagged copy earns its own period's stars; never both for one check-off.

## Calls I made (for the owner to check)

1. Missed chores **don't hold today's ring open** (no double punishment).
2. Any credited check-off of the chore clears its callout (incl. "waiting for approval").
3. Words: "Missed yesterday / last week / last month / Tue", "Missed N days/weeks in a row", "Missed N times", "Done late".
4. Urgency also applies to monthly chores (last 3 days of the month) and to one-time chores with a due date; not to daily chores.
5. My day gets the same panels; the Week view's badge uses the same thresholds; the calendar's header shows "N missed" too.
6. Upgrade day back-fills open misses from the last 14 days, reopening a one-time chore 0.14.1 had closed.
7. Carry it over households see no change.
8. Undo or a send-back of the check-off that cleared a callout brings the callout back.
9. One check-off clears every miss of that chore for that person (all periods, picked days, loads, sessions), for one copy's stars.
10. On a hand-off the callout stays with the person who missed it.
11. A standalone missed row counts as a chore left for the person's sensors (automations see it), though not in the ring.

## Left to the builder

- Exact serialization (`missed` object on `item_view`, `missed_total`), command and schema names beyond those named.
- Whether Excuse the misses is one call with a list of keys or several calls.
- Test fixtures: extend `tests/chores_sample.py`; the five worked examples keep passing; new worked examples for a daily run, a weekly miss with this week's copy, a one-time chore, back-fill, and each parent action.
- Dev HA checks at 1080 by 1920 portrait (the kitchen) and a phone, light and dark, with dimming on a shared screen.
