# Missed at the top, and a week that feels its end: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A missed chore is called out at the top of its person's Board column until done or a parent clears it, and chores with a deadline escalate at 3, 2, and 1 days left.

**Architecture:** The engine keeps *late records* (the carried-record list, marked `missed: true`) made when Strict or Make it up misses an occurrence; `_items_on` either hangs a `missed` flag on the member's current open copy of that chore or serves the record as its own uncounted row (section `missed`). The card draws a Missed panel and a due-soon panel at the top of a column from pure derive rules; urgency is card-only.

**Tech Stack:** Python 3.14 (engine, pytest via `scripts/test-backend.sh`), Lit 3 + TypeScript (vitest via `npm test` in `custom_components/planavista/frontend`).

**Spec:** `docs/superpowers/specs/2026-11-25-missed-and-urgency-design.md` (read it first; section numbers below refer to it).

## Global Constraints

- No em dashes in any tracked file; `python scripts/check_copy.py` must pass.
- Data rollback-safe across one step back: add fields only, keep unknown fields (`store.py` normalizers keep extra keys).
- The engine imports nothing from Home Assistant.
- Public repo: tests and docs use the sample household in `tests/chores_sample.py` (Alex, Blair, Casey, Dana), never real names.
- Version 0.15.0 in `manifest.json`, `frontend/package.json`, `const.py` `VERSION` (a test enforces they match).
- Words exactly as spec section 3; badges shared by `status.describe` and `itemBadge` through `tests/fixtures/chores_status.json`.
- Carry it over behaves exactly as on main (no late records, Overdue section unchanged).
- Never test on production (the family uses it); dev HA and review copies only.

## Review Focus

1. **Undo after a late check-off:** a child checks off the flagged copy, taps Undo: the callout returns with its full count (Task 2 test `test_undo_brings_the_callout_back`).
2. **A day the chore wasn't scheduled or the person was away between misses:** "in a row" stays true; an excused period between makes it "N times" (Task 1 test `test_in_a_row_skips_unscheduled_and_away_days`).
3. **Two loads, picked days, or sessions in one period:** count is periods, one row, one check-off clears all (Task 1 `test_count_is_periods_not_records`, Task 3 `test_one_checkoff_clears_every_record`).
4. **A missed chore never holds today's ring open or appears in a later day's `open` list** (Task 3 `test_late_rows_are_not_counted`).
5. **Two screens racing:** Take it off the board after Done elsewhere answers `not_missed` and the card says it was already taken care of, no error tone (Task 5 `test_clear_missed_twice_refuses_quietly`, Task 9 options-derive test).

---

### Task 1: Pure late-record rules (`chores/late.py`)

**Files:**
- Create: `custom_components/planavista/chores/late.py`
- Test: `tests/test_chores_late.py`

**Interfaces:**
- Consumes: `Occurrence` (occurrences.py), `parse_key` (occurrences.py), `Clock` (periods.py).
- Produces:
  - `late_record(occ: Occurrence, day: date) -> dict`: `_carry`'s shape plus `"missed": True`, `since` = `day.isoformat()`.
  - `is_late(record: Mapping) -> bool`: `record.get("missed") is True`.
  - `answering(record: Mapping, completions: Iterable[Mapping], member: str, day_of: Callable[[object], date]) -> dict | None`: the latest completion with `state` in CREDITED, `chore == record["chore"]`, `member == member`, and `day_of(at) >= date(record["since"])`.
  - `missed_flag(records: list[Mapping], *, late: bool, scheduled: Callable[[date], bool], away: Callable[[date], bool]) -> dict`: `{count, unit, in_a_row, periods, late}` per spec section 2. `count` = distinct periods (by `period`, except a Strict picked-day miss, `window == "week"` with `due` at a day end that isn't the week's end, counts by its due day). `unit`: `day` for `day:` periods or single-day misses, `week`, `month` (repeats monthly, `window == "month"`), `time` (`once` and irregular). `in_a_row`: for `day` units, every day between the oldest and newest missed day is missed, unscheduled, or away; for `week`/`month`, consecutive period starts; `time` always false.
  - `missed_words(flag: Mapping, today: date) -> str`: spec section 3 table ("Missed yesterday", "Missed 3 days in a row", "Missed last week", "Missed 2 weeks in a row", "Missed last month", "Missed Tue" via `status.short_day`, "Missed 3 times").

- [ ] **Step 1: Write failing tests** in `tests/test_chores_late.py`: `test_late_record_marks_missed`, `test_answering_takes_any_credited_copy_since` (a done completion of the same chore on `since` or later answers; one before `since`, another member's, a `sent_back` or `undone` one don't), `test_count_is_periods_not_records` (two `week:2026-10-12` records of laundry, n=0 and n=1 → `count == 1`, `unit == "week"`), `test_in_a_row_skips_unscheduled_and_away_days` (Dana's bed missed Mon and Wed, Tue unscheduled → `in_a_row` True; Tue excused instead → False, words "Missed 2 times"), and `test_missed_words` with one case per row of the spec's table, today 2026-10-14.
- [ ] **Step 2:** `scripts/test-backend.sh tests/test_chores_late.py` → FAIL (module missing).
- [ ] **Step 3:** Implement the five functions.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5:** Commit `feat(chores): late records' rules`.

### Task 2: The engine makes, answers, and tidies late records

**Files:**
- Modify: `custom_components/planavista/chores/engine.py` (`rollover` ~2425, `_sent_back_late` ~1630, `_open_carried` ~2155, `_tidy_carried` ~2524, `_has_open` ~2120)
- Test: `tests/test_chores_late.py`

**Interfaces:**
- Consumes: Task 1.
- Produces: late records in `log["carried"]`; `ChoresEngine._late_answer(record, index) -> dict | None` (wraps `answering` with the record's holder: assignee override on the record's own key, else `record["member"]`).

- [ ] **Step 1: Failing tests:** `test_make_it_up_miss_leaves_a_late_record` (sample engine from Monday 10/12, catch up to 10/13 9 AM: `make_your_bed|dana|day:2026-10-12|0` is in `log["carried"]` with `missed: True`; the day summary still lists it `missed`), `test_carry_it_over_makes_no_late_records` (records have no `missed`), `test_late_send_back_leaves_a_late_record` (Blair's laundry check-off pending past its week, sent back late under make_up → a late record exists), `test_answered_record_is_dropped_only_once_approved` (answer with a pending check-off: record kept at next rollover if still pending; approved: dropped), `test_undo_brings_the_callout_back` (check off today's bed, undo → record still there and unanswered), `test_once_chore_with_a_late_record_is_not_finished` (a once chore missed: `finished_at` stays None until answered or cleared).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** At rollover where the rule isn't `carry_over`, append `late_record(item.occ, day)` beside the `missed` event. In `_sent_back_late`'s missed branch, the same. `_open_carried(record, index)` for a late record: not excused and `_late_answer` is None or not `done`. `_tidy_carried` drops a late record whose answer is `done` (approved). `_has_open`'s carried check already uses `_open_carried`.
- [ ] **Step 4:** Run the file, then the whole backend suite (`scripts/test-backend.sh`) → PASS (existing rollover tests unchanged).
- [ ] **Step 5:** Commit `feat(chores): misses leave late records`.

### Task 3: Serving late records: the flag, the late row, and the feed

**Files:**
- Modify: `engine.py` (`Item` dataclass, `_items_on` carried loop ~445, `item_view`, `board`), `chores/status.py` (`describe`, `left_today`)
- Modify: `tests/fixtures/chores_status.json` (new cases)
- Test: `tests/test_chores_late.py`, `tests/test_chores_todo.py`, `tests/test_chores_entities.py`

**Interfaces:**
- Produces: `Item.missed: dict | None = None`; section `"missed"` for standalone late rows (`counted=False`, `overdue_since=since`); `item_view(...)["missed"]` (the flag or None); `board(...)["missed_total"]: int` (rows with a flag, all members); `left_today(view)` also lists `section == "missed"` rows in OPEN.

- [ ] **Step 1: Failing tests:** `test_flag_rides_on_todays_copy` (Dana's bed missed Mon and Tue; Wednesday's bed item has `missed == {"count": 2, "unit": "day", "in_a_row": True, "periods": ["2026-10-12", "2026-10-13"], "late": False}` and no `missed` section row exists), `test_one_checkoff_clears_every_record` (completing Wednesday's bed hides the flag; stars granted once: ledger +1 chore entry), `test_late_row_when_no_current_copy` (a once chore missed: an item in section `missed`, `counted False`, flag `late True`), `test_late_rows_are_not_counted` (Thursday's day summary has the late key in neither `open` nor `keys`; Wednesday's ring `due` unchanged by it), `test_excused_or_away_copy_leaves_a_late_row` (today's copy away → standalone late row), `test_hand_off_keeps_the_callout_with_the_misser` (Blair's missed laundry; next week's copy handed to Alex: Blair keeps a late row, Alex's copy has no flag), `test_board_counts_missed_total`, `test_todo_describes_the_flag` (description "Missed 2 days in a row"), `test_standalone_late_row_counts_in_chores_left`. Fixture cases: one per words row, view carrying `missed`, `todo` and `card` both expected (`card` tone `bad`, glyph `×`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** In `_items_on`, after the plan items, group open (unanswered, unexcused, holder present) late records by `(holder, chore)`. For each group: the carrier is the holder's item for that chore with status in OPEN whose section is `today` or `week` (earliest `due`); set `carrier.missed = missed_flag(records, late=False, ...)`. No carrier: one `Item(section="missed", counted=False, overdue_since=oldest since, missed=missed_flag(..., late=True))` built from the oldest record (`_carried_occurrence`). A group answered by a still-standing check-off produces nothing. A done late row (answered by its own key today) shows in Done today: keep the item with status done and section `missed`. `describe`: when `view["missed"]` is set and status is OPEN, return `missed_words`. `stats()` ignores uncounted items already.
- [ ] **Step 4:** Run the three test files and the fixture test (`tests/test_chores_status_fixture*` or wherever `chores_status.json` is read; grep for it) → PASS; whole suite → PASS.
- [ ] **Step 5:** Commit `feat(chores): the missed flag and late rows on the board`.

### Task 4: Upgrade-day back-fill

**Files:**
- Modify: `engine.py` (new `backfill_late(now) -> Outcome`), `chores/runtime.py` (call it once after `catch_up` on load)
- Test: `tests/test_chores_late.py`, `tests/test_chores_runtime.py`

**Interfaces:**
- Produces: `ChoresEngine.backfill_late(now: datetime) -> Outcome`; log key `late_backfill: 1`.

- [ ] **Step 1: Failing tests:** `test_backfill_takes_open_misses_from_14_days` (summaries list misses 3 and 20 days back: only the 3-day one gets a record), `test_backfill_skips_answered_misses` (a credited check-off of the chore since), `test_backfill_reopens_a_finished_once_chore` (`finished_at` cleared), `test_backfill_runs_once` (marker set; second call changes nothing), `test_start_sets_the_marker` (chores turned on fresh: no back-fill), `test_carry_over_households_get_none` (misses whose due day's rule was carry_over: none).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Walk `day:` summaries of the last 14 chore days per member; for each `missed` key whose chore and member exist and `answering` finds nothing, rebuild the occurrence with `_past_occurrence(key)` and append `late_record`. Set `late_backfill`. `start()` sets the marker too. Runtime calls it after `catch_up` and saves the log when changed.
- [ ] **Step 4:** Run → PASS; whole suite → PASS.
- [ ] **Step 5:** Commit `feat(chores): back-fill open misses on upgrade`.

### Task 5: Parent actions: Take it off the board, Excuse the misses

**Files:**
- Modify: `engine.py` (new `clear_missed`, `excuse_missed` accepts a late key and hides its record), `chores/websocket.py` (`planavista/chores/clear_missed`; `excuse_missed` takes `keys: list[str]` as well as `key`), `chores/access.py` (parent level, as `excuse_missed`), `refusals`/MESSAGES (`not_missed`: "That was already taken care of.")
- Test: `tests/test_chores_late.py`, `tests/test_chores_websocket.py`, `tests/test_metadata.py` (session schema check covers the new command)

**Interfaces:**
- Produces: `ChoresEngine.clear_missed(now, *, chore: str, member: str, by: str) -> Outcome` (drops that holder's open late records of the chore; raises `ChoreError("not_missed")` when none); websocket `{type: "planavista/chores/clear_missed", chore, member, session?}` → `{cleared: int}`; `excuse_missed` with `keys` → `{streak_holds: bool}` (true if any key's answer did).

- [ ] **Step 1: Failing tests:** `test_clear_missed_keeps_the_record_missed` (records gone, summaries unchanged), `test_clear_missed_twice_refuses_quietly` (`not_missed`), `test_excuse_missed_takes_late_keys` (summaries restated excused, record gone from the board at once), `test_clear_missed_needs_a_parent` (websocket refuses a member-level session), `test_excuse_from_the_day_navigator_clears_the_callout`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; `clear_missed` removes the records (they are answered by a parent, nothing to restore).
- [ ] **Step 4:** Run → PASS; whole suite → PASS.
- [ ] **Step 5:** Commit `feat(chores): parents clear or excuse a missed chore`.

### Task 6: Card rules: types, words, urgency

**Files:**
- Modify: `frontend/src/modules/chores/chores-types.ts` (`MissedFlag`, `ItemView.missed?`, `Board.missed_total`), `frontend/src/core/status-map.ts` (`StatusView.missed`, `itemBadge`, `missedWords`)
- Create: `frontend/src/modules/chores/urgency-derive.ts`
- Test: `frontend/test/status-map.test.ts` (fixture-driven already), `frontend/test/urgency-derive.test.ts`

**Interfaces:**
- Produces:
  - `interface MissedFlag { count: number; unit: 'day' | 'week' | 'month' | 'time'; in_a_row: boolean; periods: string[]; late: boolean }`
  - `missedWords(flag: MissedFlag, today: string): string` (mirror of Task 1's)
  - `itemBadge`: an OPEN item with `missed` → `{words: missedWords(...), tone: 'bad', glyph: '×'}`, before overdue; a done item in section `missed` → `{words: 'Done late', tone: 'muted'}`.
  - `daysToDeadline(item: ItemView, today: string, board: {week: {end: string}}): number | null`: days left including today to the item's own deadline: window `week` → week end; window `month` → its `due_day`; `dated` once → `due_day`; daily and undated → null.
  - `type Urgency = 'calm' | 'amber' | 'soon' | 'last'`; `urgencyOf(days: number | null): Urgency`: null or ≥4 calm, 3 amber, 2 soon, 1 last (0 or less last).
  - `itemBadge` for `amber`: `{words: '3 days left', tone: 'time', glyph: '•'}` regardless of pace (the pace rule stays for ≥4).

- [ ] **Step 1: Failing tests:** fixture cases from Task 3 now run in `status-map.test.ts` (same JSON); `urgency-derive.test.ts`: weekly row Wed with week ending Sun 00:00 (`days_left` 4) → calm, Thu amber, Fri soon, Sat last; a monthly row 2 days before month end → soon; a dated once due tomorrow → soon; a daily row → calm; an undated once → calm.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` and `npx tsc --noEmit -p .` → PASS.
- [ ] **Step 5:** Commit `feat(chores): missed words and urgency rules in the card`.

### Task 7: Board column: Missed and due-soon panels

**Files:**
- Modify: `frontend/src/modules/chores/board-derive.ts` (`ColumnEntry`, `columnFor`), `pv-chores-column.ts` (wrap consecutive panel entries), `pv-chore-tile.ts` (outline by zone), `chores-styles.ts` (panel styles), `chores-glance.ts` (header chip "N missed")
- Test: `frontend/test/board-derive.test.ts`, `frontend/test/chores-glance.test.ts`

**Interfaces:**
- Consumes: Task 6.
- Produces: `ColumnEntry` head tones `'missed' | 'soon' | 'last'` and zones `'missed' | 'soon'`; head entries `{kind: 'head', key: 'head:missed', text: 'Missed · N', tone: 'missed'}`, `{key: 'head:soon', text: 'This week · N to go' | 'Due soon · N to go' | 'Last day · N to go', right: '2 days left' | 'Ends tonight', tone: 'soon' | 'last'}`; the 3-days head right gets `tone`-coloured "3 days left" via `rightTone: 'warn'`. Glance: `missedChip(board): string | null` → "N missed" when `missed_total > 0`.

- [ ] **Step 1: Failing tests:** `columnFor` order: missed panel first (oldest miss first), then soon panel, then Overdue, bands, This week, Done today; a flagged today copy leaves its band; `N to go` counts open check-offs of grouped rows (laundry 0 of 2 → 2); panel heading "Due soon" when a monthly row joins; at 3 days the week head's right is "3 days left" with `rightTone: 'warn'`; a done late row sits in Done today with badge Done late; tiles: missed tiles first. Glance: "2 missed".
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement derive, then render: the column wraps runs of `zone: 'missed'` in `.panel.missed` (`--pv-bad-bg`, 2 px `--pv-danger` border, radius 16) and `zone: 'soon'` in `.panel.soon` (`--pv-warn-bg`) or `.panel.last` (bad bg and border); names semibold in soon, bold in last and missed; keep keyed rows (`repeat` by key) so rows glide between zones. Tiles: `zone` reflected as attribute; outline colours as panels. Dimming: panel colours come from theme tokens (already dimmed by `dimTokens`).
- [ ] **Step 4:** `npm test`, `npx tsc --noEmit -p .`, `npm run build` → PASS.
- [ ] **Step 5:** Commit `feat(chores): missed and due-soon at the top of the Board`.

### Task 8: My day and the Week view

**Files:**
- Modify: `my-day-derive.ts`, `pv-chores-my-day.ts`, `week-derive.ts` (`weeklyLine`)
- Test: `frontend/test/my-day-derive.test.ts`, `frontend/test/week-derive.test.ts`

- [ ] **Step 1: Failing tests:** My day puts flagged and late rows in a Missed section first and due-soon rows next (same heads as Task 7); `weeklyLine` badge: 3 days "3 days left" (warn), 2 days "2 days left" (warn), 1 day "Last day" (bad).
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement by reusing Task 7's panel builder (export `topPanels(items, ctx)` from board-derive.ts and call it from my-day-derive).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat(chores): My day and Week view feel the deadline too`.

### Task 9: A missed chore's options

**Files:**
- Modify: `options-derive.ts` (`missedNote`, parent actions), `pv-chore-options.ts`, `chores-client.ts` (`ChoresApi.clearMissed(chore, member)`, `excuseMissed(keys)`), refusal text map (`refusalText`: `not_missed` → "That was already taken care of.", tone neutral)
- Test: `frontend/test/options-derive.test.ts`

**Interfaces:**
- Produces: `missedNote(flag: MissedFlag, today: string): {title: string; body: string}`: title = `missedWords`; body for `late` false: "Doing this week's takes it off the top." (day unit: "Doing today's takes it off the top."); for `late` true and one period: "Not done last week. Doing it now takes it off the top. It stays in the record."; several: "Not done the weeks of Nov 15 and Nov 22. Doing it now takes it off the top. Both misses stay in the record." (3 or more: "All N misses stay in the record."). Parent actions `[{id: 'clear_missed', label: 'Take it off the board', help: "It stays missed. Nothing more to do this time."}, {id: 'excuse_missed', label: 'Excuse the misses', help: 'There was a good reason. They count as excused, not missed.'}]` (singular "Excuse the miss" for count 1).

- [ ] **Step 1: Failing tests** for each wording above and for the singular label; `not_missed` refusal maps to a neutral toast.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement; actions go through the existing parent PIN gate used by Excuse it.
- [ ] **Step 4:** `npm test`, `tsc` → PASS.
- [ ] **Step 5:** Commit `feat(chores): a missed chore's options`.

### Task 10: Version, docs, bundle, and dev checks

**Files:**
- Modify: `manifest.json`, `frontend/package.json`, `const.py` (0.15.0); `README.md` (Board section: missed and urgency), `DESIGN_SYSTEM.md` (panel tones), `docs/superpowers/specs/2026-10-09-chores-module-design.md` (8.10 missed rule: late records), `frontend/dist/planavista-cards.js`
- Local only: `CLAUDE.md` (architecture paragraph)

- [ ] **Step 1:** Bump versions; `scripts/test-backend.sh` and `npm test` → PASS; `python scripts/check_copy.py` → exit 0.
- [ ] **Step 2:** `npm run build`; `scripts/dev-ha.sh deploy`.
- [ ] **Step 3:** Dev HA checks (Chrome DevTools MCP, fresh isolated context, Kitchen account at 1080 by 1920 and a 390 by 844 phone, light and dark, dimming at 30%): seed misses with a scratch script that sets the engine clock back (as earlier milestones' scratchpad scripts did), then confirm each artboard of the mockup appears, Done clears, Undo restores, both parent actions work, header chip counts.
- [ ] **Step 4:** Commit `chore: 0.15.0, missed at the top and a week that feels its end` and the bundle `build: the bundle`.
