# Milestone 4, the Chores Engine and Its Home Assistant Surface: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A household's chores run in Home Assistant: a pure-Python engine turns the chore plan into check-offs for every day and week, applies approvals, requests, the three missed-chore rules, streaks, stars, and rewards, and keeps time through every 3:00 AM boundary (including the ones missed while Home Assistant was off); each member gets a device with a to-do list, sensors, a binary sensor, and an event entity; actions and the card's WebSocket commands change chores under spec 9.5's rule; Assist works through the to-do lists; diagnostics leave names and PINs out. The section 8.16 worked examples pass through actions and to-do lists on the dev Home Assistant. No release follows; chores ship as 1.3.0 after milestone 6.

**Architecture:** Five pure modules decide everything and import nothing from Home Assistant: `chores/recurrence.py` (the RRULE subset), `chores/periods.py` (chore days, weeks, months, bands), `chores/model.py` (records, rules, the stars formula), `chores/occurrences.py` (Plan, Once, and Repeats chores as one Occurrence shape), and `chores/engine.py` (status, check-offs, reviews, requests, overrides, plan edits, rewards, rollover, summaries, streaks, progress, and the board, week, and to-do views). A thin Home Assistant layer wraps them: three Store files (`chores/store.py`), one runtime per run that saves, fires events, keeps time, and keeps devices and entities in step with the household (`chores/runtime.py`), entity platforms that are loaded only while chores are on, public actions (`chores/services.py`), WebSocket commands (`chores/websocket.py`), and diagnostics. Who may do what outside the card is one module (`chores/access.py`) built on milestone 2's permission functions.

**Tech Stack:** Python 3.14, Home Assistant 2026.9.4 (`helpers.storage.Store`, the `todo`, `sensor`, `binary_sensor`, and `event` platforms, services with response data, WebSocket commands, repairs, diagnostics, Assist intents), pytest with pytest-homeassistant-custom-component 0.13.367 in Docker (`scripts/test-backend.sh`), freezegun through `freezer`, and python-dateutil 2.9.0.post0 as the test-only reference for recurrence. No frontend changes.

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 4, with sections 3, 5, 6.1, 6.2, 6.5, 7 (all), 8 (all), 9.4, 9.5, 9.8, 10 (all but 10.5), 11.4, 11.7, 13.7 (the request kinds), 14.5 (Rules), 15 (all), and 16.

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data (spec 7.8): the three new Stores are `planavista.chores_plan`, `planavista.chores_log`, and `planavista.chores_rewards`, each version 1, minor version 1, `private=True`, `atomic_writes=True`. Loaders keep every field they don't know and write it back. Members gain an optional `away` list; nothing else in the household or the config entry changes shape.
- `chores/recurrence.py`, `chores/periods.py`, `chores/model.py`, `chores/occurrences.py`, and `chores/engine.py` import nothing from Home Assistant. Time is passed in.
- Times are stored local with their offset; instants are compared in UTC (Python compares two datetimes that share a tzinfo by their wall clocks).
- Public surface (spec 10.8), pinned by tests: per member `todo.<member>_chores`, `sensor.<member>_chores_left`, `sensor.<member>_chores_this_week`, `sensor.<member>_chore_time`, `sensor.<member>_stars`, `sensor.<member>_streak`, `binary_sensor.<member>_chores_done`, `event.<member>_chores` (event types `completed`, `approved`, `sent_back`, `undone`, `missed`, `redeemed`); household `sensor.household_chores_left`, `sensor.household_approvals_waiting`; `select.planavista_appearance` keeps its entity ID. Actions `complete_chore`, `undo_chore`, `get_chores`, `redeem_reward`, `approve_chore`, `send_back_chore`, `add_chore`, `remove_chore`, `excuse_chore`, `pause_member`, `resume_member`, `award_stars`, each documented in `services.yaml` with exactly its schema's fields.
- PINs never pass through actions, `call_service` events, logs, diagnostics, entity attributes, events, Store files other than hashes, or automation traces (spec 9.8). PIN sessions only come from `planavista/pin/*`.
- A calendar-only household notices nothing beyond the Household device holding the appearance select: no chores entities, no member devices, and the to-do, binary sensor, and event platforms are not loaded until chores are on.
- Copy (spec 11.7): plain words, sentence case, one name per thing ("Waiting for a parent's OK" in to-do descriptions), errors that say what to do. Action mistakes are translated `ServiceValidationError`s from `strings.json` `exceptions`; `translations/en.json` equals `strings.json`.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, fixtures, and docs.
- Don't touch `custom_components/planavista/frontend/` or `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or release in this plan. Pushing the milestone branch for CI is allowed.
- Backend tests: `bash scripts/test-backend.sh` (from the repository root, any pytest arguments after it). Frontend checks, unchanged by this milestone: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`.
- Paths are relative to the repository root.

## Review Focus

1. **A busy household.** Eight people and forty chores, the board recomputed after every check-off: the board and the to-do lists stay quick (well under a second per change) and every item appears once. Pinned by Task 3's `test_a_busy_household_stays_quick`.
2. **Home Assistant off for weeks.** Six weeks without a boundary: every chore day rolls over once, in order, each missed occurrence is reported once, and running the catch-up again does nothing. Pinned by Task 3's `test_weeks_off_are_caught_up_once_each` (and Task 5's startup catch-up).
3. **Two to-do items with the same name** (Cat care morning and evening). `todo.update_item` by name and Assist check off the open one, never answering "already done" while one is still open. Pinned by Task 5's `test_two_items_with_one_name_check_off_the_open_one`.
4. **A parent changes when the day starts in the small hours.** An earlier day start ends the current chore day at once and only once; a later one never runs a day twice. Pinned by Task 3's `test_an_earlier_day_start_ends_the_day_at_once_and_only_once`.
5. **Two screens check the same item at the same moment** (the kitchen tablet and Casey's phone). One check-off is credited and the other answers already done. Pinned by Task 7's `test_two_screens_checking_one_item_at_once_credit_it_once`.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others. Every module and every test in Tasks 1 to 8 was built and run in a scratch copy of the repository before this plan was written (919 backend tests, each task's tests passing at its own commit and failing without its code), and the result was deployed to the dev Home Assistant: the entities, the actions, the board feed, a to-do check-off, Assist, and diagnostics worked there.

- **Ruling: the engine is five pure modules (recurrence, periods, model, occurrences, engine) instead of the spec's three,** so each file has one job and a task of its own. Cost if wrong: none.
- **Ruling: stored records stay plain dicts, as household members are,** so fields from a newer release survive a save; dataclasses describe only what is derived (Occurrence, Item, Outcome). Cost if wrong: none.
- **Ruling: the rollover bookmark is the last chore day processed (`last_day`), kept beside `last_boundary`,** so a change of day start can never process a day twice. Cost if wrong: none.
- **Ruling: a change of the calendar's first day starts at the next week boundary, and the first week under the new day may be short (one to six days).** Cost if wrong: one short week with a full week's floating chores due.
- **Ruling: a new missed policy governs chore days that start after the change; days already under way keep the old one.** Cost if wrong: none.
- **Ruling: today's ring (chores left, Chores done, the household total, the day summary) counts what is in Today and due today or planned for today, plus overdue items;** a Once chore with a date to finish by shows in Today every day with "Due Sat" but counts only on that day. Cost if wrong: a ring can close while a "Due Sat" item waits.
- **Ruling: a weekly chore pinned to a day is Today's item on that day,** so under Make it up the day's ring stays open and the daily streak breaks if it isn't done, while the week still counts it on time when it is done later (spec 8.16 example 3 speaks of the week). Cost if wrong: Make it up protects the week but not the day's streak.
- **Ruling: "Plan it for a day" hides the item until that day, and that day's ring counts it.** Cost if wrong: planning a day adds to that day.
- **Ruling: Carry it over keeps overdue records in the log until they are done or excused; they aren't pruned by age.** Cost if wrong: a long-ignored daily chore piles up overdue items.
- **Ruling: excused and Away items aren't due; a weekly item is Away only when its member is away for every day of it inside that week.** Cost if wrong: someone away six days of seven still owes the week's floating chores.
- **Ruling: a check-off without an exact occurrence within 60 seconds of one for the same chore and member answers already_done, whatever its source** (spec 8.16 example 4 and 7.6's Frigate and a tap); a named occurrence is idempotent by its key. Cost if wrong: a real second check-off of a twice-daily chore within a minute needs the card's exact item.
- **Ruling: undo works on check-offs made during the current chore day.** Cost if wrong: an older mistake needs a parent's stars correction.
- **Ruling: chore time and contribution are credited at check-off, Waiting for OK included; Send back and undo take them back. Stars come only with done, and the amount is the snapshot made at check-off.** Cost if wrong: fairness counts a check-off later sent back until it is.
- **Ruling: records gain fields the spec's examples don't show: completions carry `by` (who acted) beside `done_by` (who gets the credit) and `undone` when unchecked; reviews carry `source`; day summaries carry `closed`, `carried`, and a per-chore tally for per-chore streaks; the log carries `weeks`, `policy`, `carried`, and `totals`.** Cost if wrong: none (added fields).
- **Ruling: a finished Once or Repeats chore's check-offs stay in Done today until the day ends.** Cost if wrong: none.
- **Ruling: a Once chore's day or finish-by date can't be set in the past; the day starts between midnight and 6:00 AM; a period window needs a weekly or monthly rule; a repeating rule must land within five years of its start.** Cost if wrong: none.
- **Ruling: turning chores off keeps every file; turning them on again starts from that day, with nothing replayed.** Cost if wrong: the days chores were off are blank in history.
- **Ruling: the to-do, binary sensor, and event platforms load only while chores are on;** Home Assistant's default_config doesn't include the to-do integration, so loading it for a calendar-only household would add the To-do lists panel to its sidebar. Cost if wrong: none.
- **Ruling: `select.planavista_appearance` joins the Household device (milestone 3's ruling), and because Home Assistant 2026.9 puts the device name in front of every entity name, it is named "Household Appearance"; its entity ID stays.** Cost if wrong: dashboards that show the select's name show the new one.
- **Ruling: every member gets a device and entities while chores are on, with chores or not.** Cost if wrong: eight unused entities for a member with no chores.
- **Ruling: chores events fire on the assignee's event entity, with `done_by` naming whoever did it; `completed` fires for Waiting for OK too, with a `state` attribute (`done` or `pending`).** Cost if wrong: an automation listening on the doer's entity misses "done by someone else".
- **Ruling: `chores_this_week` is the percent of the week's minutes done or waiting for OK, and unknown when nothing is due; `chore_time` is every minute ever credited to the member as the doer (`device_class: duration`, `state_class: total`); stars, streak, and chores left are plain numbers.** Cost if wrong: one statistics definition each.
- **Ruling: actions follow spec 9.5 with no PIN session, so a parent's own account may run parent-level actions;** spec 10.4's line "Parent-level means: admins and automations" is narrower than 9.5, "the rule the backend enforces". Cost if wrong: a parent's own login can approve and edit through scripts as well as through the card.
- **Ruling: Assist acts at member level, attributed to `automation` with source `voice`; it can check and uncheck but can't change due dates or remove items.** Cost if wrong: anyone near a voice satellite can check off a PIN-protected member's chores.
- **Ruling: the to-do lists record a shared screen's service calls as source `tablet`, someone's own account as `phone`, and no user as `automation`; adding an item makes a Once chore (its due date, 15 minutes) that needs an OK unless a parent, an admin, or an automation added it; removing an item is a parent's change and takes that member off the Once chore (deleting it when nobody is left); a due date moves the occurrence's due date (the date only); renaming is refused.** Cost if wrong: as each says.
- **Ruling: Assist completes items with Home Assistant 2026.9's own sentences, such as "Check off cat care on Casey Chores" (verified on the dev Home Assistant); the spec's "Mark ... as done on ..." isn't one of them.** Cost if wrong: households phrase it Home Assistant's way; the 1.3.0 README will say how.
- **Ruling: the calendar's first day reaches chores through a dispatcher signal from `async_apply_config`,** because the project keeps its config entry free of update listeners (a test pins that). Cost if wrong: none.
- **Ruling: a failed write is noticed by a Store subclass that wraps Home Assistant's private `_async_write_data`** (Home Assistant logs a failed write and carries on); it raises a repair and sets `save_failed` in the card's feed, the change stays in memory, and the next good write saves it. Cost if wrong: if Home Assistant renames that method, the repair stops appearing (the test then fails).
- **Ruling: when chores were set up but any of the three files is missing or damaged, chores need a look: nothing is written, the entities are unavailable, and Start over (a WebSocket command) is the only way out in this milestone;** restoring and importing arrive with milestone 6. Cost if wrong: a damaged rewards file alone pauses chores too.
- **Ruling: export (`export_household`, `planavista.household/v1`, its JSON Schema), import, and restore arrive with milestone 6's Import and export screens.** Cost if wrong: no export action until 1.3.0.
- **Ruling: phone notifications arrive with milestone 6, so example 2's approval is checked through `approve_chore` from Alex's own account.** Cost if wrong: none.
- **Ruling: the status map's shared table and the card's copy of the stars formula arrive with the board (milestone 5); the stars table, `tests/fixtures/chores_stars.json`, exists now.** Cost if wrong: none.
- **Ruling: members gain only `away` now; goal, bedtimes, sleep hours, phones, and reminders arrive with the person page (milestone 6).** Cost if wrong: none.
- **Ruling: WebSocket gains `planavista/chores/enable` and `planavista/chores/start_over` beyond spec 10.7's table, for milestone 6's setup and Needs a look; a refusal on a shared screen answers `pin_required` naming the member.** Cost if wrong: none.
- **Ruling: the board feed carries the plan and the reward catalog and is recomputed after every change (about 13 KB for the sample household).** Cost if wrong: more bandwidth for a large household.
- **Ruling: the household's WebSocket helpers become public (`household_for`, `account_for`, `session_for`, `refuse`, `parent_for`) so chores share them instead of copying them.** Cost if wrong: none.
- **Ruling: devices are found by identifier within the config entry,** as Home Assistant 2026.9 requires. Cost if wrong: none.
- **Ruling: a member id reused after someone was removed inherits their history and stars.** Cost if wrong: a new person with a removed person's name starts with their stars.
- **Ruling: the README stays as it is until chores ship in 1.3.0** (milestone 6 documents chores, their entities, the actions, and Assist's phrasing). Cost if wrong: none, as nothing is released.
- **Ruling: the public surface (spec 10.8) is pinned by explicit assertions in the tests (entity IDs, devices, units, classes, event types and data, action fields through services.yaml, response shapes) rather than by snapshot files,** so a change shows as a readable test failure. Cost if wrong: a new attribute isn't caught until someone pins it.
- **Ruling: the dev Home Assistant checks are scripted in the session scratchpad, not committed.** Cost if wrong: milestone 5 writes its own.

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/chores-m4-engine` (main is at `fff9423`, release v1.2.0).
- [ ] **Step 2: Baseline.** `bash scripts/test-backend.sh -q` Expected: `265 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `416 passed`.
- [ ] **Step 3: Commit this plan.** `git add docs/superpowers/plans/2026-10-11-chores-m4-engine.md && git commit` with the message `docs: plan milestone 4, the chores engine` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m4-engine`.

---

### Task 1: Repeating rules (the RRULE subset)

Spec 7.3 and 16: a repeating chore uses a standard RFC 5545 RRULE limited to FREQ=DAILY, WEEKLY, or MONTHLY with INTERVAL, BYDAY (weekly), BYMONTHDAY (monthly, one day), and COUNT or UNTIL. Anything else is refused with a message that says what to change. The expander follows python-dateutil's reading of the RFC and is compared against it over 300 seeded random rules, plus the RFC's own examples inside the subset.

**Files:**
- Create: `custom_components/planavista/chores/__init__.py`, `custom_components/planavista/chores/recurrence.py`
- Modify: `requirements_test.txt` (python-dateutil, test only)
- Test: `tests/test_chores_recurrence.py`

**Interfaces:**
- Produces: `RecurrenceError(ValueError)`; `Rule(freq, interval=1, byday=(), bymonthday=None, count=None, until=None)` (frozen; `str(rule)` is the canonical RRULE text); `parse_rule(text) -> Rule`; `instances(rule, start: date, last: date, first: date | None = None) -> Iterator[date]` (both ends inclusive); `last_instance(rule, start) -> date | None`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_recurrence.py` (new):

```python
"""The RRULE subset for repeating chores, checked against python-dateutil (spec 7.3, 16)."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import random

from dateutil import rrule as du
import pytest

from custom_components.planavista.chores.recurrence import (
    RecurrenceError,
    Rule,
    instances,
    last_instance,
    parse_rule,
)

DU_FREQ = {"DAILY": du.DAILY, "WEEKLY": du.WEEKLY, "MONTHLY": du.MONTHLY}


def _dates(rule: str, start: date, last: date) -> list[date]:
    return list(instances(parse_rule(rule), start, last))


def test_a_rule_reads_back_in_canonical_form() -> None:
    rule = parse_rule("rrule:freq=weekly;byday=th,mo;interval=2;until=20261130T000000Z")
    assert rule == Rule("WEEKLY", 2, (0, 3), None, None, date(2026, 11, 30))
    assert str(rule) == "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH;UNTIL=20261130"
    assert str(parse_rule(str(rule))) == str(rule)


@pytest.mark.parametrize(
    ("text", "message"),
    [
        ("", "Add a repeating rule."),
        ("BYDAY=MO", "The rule needs FREQ (DAILY, WEEKLY, or MONTHLY)."),
        ("FREQ=YEARLY", "Chores repeat daily, weekly, or monthly."),
        ("FREQ=HOURLY", "Chores repeat daily, weekly, or monthly."),
        ("FREQ=DAILY;INTERVAL=0", "INTERVAL must be a whole number from 1 to 99."),
        ("FREQ=DAILY;BYDAY=MO", "Only weekly chores pick days of the week (BYDAY)."),
        ("FREQ=MONTHLY;BYDAY=2TU", "Only weekly chores pick days of the week (BYDAY)."),
        ("FREQ=WEEKLY;BYDAY=1MO", "BYDAY lists days such as MO,TH, without numbers in front."),
        ("FREQ=WEEKLY;BYDAY=MO,MO", "BYDAY lists a day twice."),
        ("FREQ=WEEKLY;BYMONTHDAY=3", "Only monthly chores pick a day of the month (BYMONTHDAY)."),
        ("FREQ=MONTHLY;BYMONTHDAY=1,15", "A monthly chore repeats on one day of the month."),
        ("FREQ=MONTHLY;BYMONTHDAY=-1", "BYMONTHDAY must be a whole number from 1 to 31."),
        ("FREQ=DAILY;COUNT=3;UNTIL=20261130", "Use COUNT or UNTIL, not both."),
        ("FREQ=DAILY;UNTIL=2026-11-30", "UNTIL is a date such as 20261130."),
        ("FREQ=DAILY;UNTIL=20260230", "UNTIL is a date such as 20261130."),
        ("FREQ=WEEKLY;WKST=SU", "PlanaVista doesn't support WKST in a repeating chore."),
        ("FREQ=MONTHLY;BYSETPOS=1", "PlanaVista doesn't support BYSETPOS in a repeating chore."),
        ("FREQ=DAILY;FREQ=WEEKLY", "FREQ appears twice."),
        ("FREQ", "FREQ isn't a rule part like FREQ=WEEKLY."),
    ],
)
def test_rules_outside_the_subset_say_what_to_change(text: str, message: str) -> None:
    with pytest.raises(RecurrenceError) as err:
        parse_rule(text)
    assert str(err.value) == message


# RFC 5545 section 3.8.5.3 examples that fall inside the subset (DTSTART 1997-09-02, a Tuesday).
RFC_START = date(1997, 9, 2)


def test_rfc_daily_for_10_occurrences() -> None:
    assert _dates("FREQ=DAILY;COUNT=10", RFC_START, date(1998, 1, 1)) == [
        RFC_START + timedelta(days=n) for n in range(10)
    ]


def test_rfc_every_10_days_5_occurrences() -> None:
    assert _dates("FREQ=DAILY;INTERVAL=10;COUNT=5", RFC_START, date(1998, 1, 1)) == [
        date(1997, 9, 2), date(1997, 9, 12), date(1997, 9, 22), date(1997, 10, 2), date(1997, 10, 12)
    ]


def test_rfc_weekly_for_10_occurrences() -> None:
    assert _dates("FREQ=WEEKLY;COUNT=10", RFC_START, date(1998, 1, 1)) == [
        RFC_START + timedelta(weeks=n) for n in range(10)
    ]


def test_rfc_weekly_on_tuesday_and_thursday_for_five_weeks() -> None:
    assert _dates("FREQ=WEEKLY;COUNT=10;BYDAY=TU,TH", RFC_START, date(1998, 1, 1)) == [
        date(1997, 9, d) for d in (2, 4, 9, 11, 16, 18, 23, 25, 30)
    ] + [date(1997, 10, 2)]


def test_rfc_every_other_week_on_monday_wednesday_and_friday() -> None:
    # The RFC's UNTIL=19971224T000000Z ends before 9 AM on December 24; chores keep
    # only dates, so the same list comes from the date before.
    got = _dates("FREQ=WEEKLY;INTERVAL=2;UNTIL=19971223;BYDAY=MO,WE,FR", date(1997, 9, 1), date(1998, 1, 1))
    expected = {9: (1, 3, 5, 15, 17, 19, 29), 10: (1, 3, 13, 15, 17, 27, 29, 31), 11: (10, 12, 14, 24, 26, 28), 12: (8, 10, 12, 22)}
    assert got == [date(1997, month, day) for month, days in expected.items() for day in days]


def test_a_month_without_the_day_is_skipped() -> None:
    assert _dates("FREQ=MONTHLY;BYMONTHDAY=31", date(2026, 1, 31), date(2026, 7, 31)) == [
        date(2026, 1, 31), date(2026, 3, 31), date(2026, 5, 31), date(2026, 7, 31)
    ]


def test_a_rule_that_never_lands_ends_instead_of_looping() -> None:
    assert _dates("FREQ=MONTHLY;INTERVAL=12;BYMONTHDAY=31", date(2026, 4, 1), date(2040, 1, 1)) == []


def test_instances_can_start_part_way_through() -> None:
    rule = parse_rule("FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130")
    assert list(instances(rule, date(2026, 10, 17), date(2026, 12, 31), first=date(2026, 11, 1))) == [
        date(2026, 11, 7), date(2026, 11, 14), date(2026, 11, 21), date(2026, 11, 28)
    ]


def test_last_instance() -> None:
    assert last_instance(parse_rule("FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130"), date(2026, 10, 17)) == date(2026, 11, 28)
    assert last_instance(parse_rule("FREQ=MONTHLY;COUNT=3"), date(2026, 10, 1)) == date(2026, 12, 1)
    assert last_instance(parse_rule("FREQ=DAILY"), date(2026, 10, 1)) is None


def _random_rule(rng: random.Random) -> str:
    freq = rng.choice(("DAILY", "WEEKLY", "MONTHLY"))
    parts = [f"FREQ={freq}"]
    if rng.random() < 0.6:
        parts.append(f"INTERVAL={rng.randint(1, 4)}")
    if freq == "WEEKLY" and rng.random() < 0.7:
        days = rng.sample(("MO", "TU", "WE", "TH", "FR", "SA", "SU"), rng.randint(1, 4))
        parts.append("BYDAY=" + ",".join(days))
    if freq == "MONTHLY" and rng.random() < 0.6:
        parts.append(f"BYMONTHDAY={rng.randint(1, 31)}")
    end = rng.random()
    if end < 0.35:
        parts.append(f"COUNT={rng.randint(1, 40)}")
    elif end < 0.7:
        parts.append(f"UNTIL={date(2026, 1, 1) + timedelta(days=rng.randint(0, 900)):%Y%m%d}")
    return ";".join(parts)


def _dateutil(rule: Rule, start: date, last: date) -> list[date]:
    kwargs: dict = {"dtstart": datetime.combine(start, datetime.min.time()), "interval": rule.interval, "wkst": du.MO}
    if rule.byday:
        kwargs["byweekday"] = rule.byday
    if rule.bymonthday is not None:
        kwargs["bymonthday"] = rule.bymonthday
    if rule.count is not None:
        kwargs["count"] = rule.count
    if rule.until is not None:
        kwargs["until"] = datetime.combine(rule.until, datetime.min.time())
    return [
        moment.date()
        for moment in du.rrule(DU_FREQ[rule.freq], **kwargs).between(
            datetime.combine(start, datetime.min.time()),
            datetime.combine(last, datetime.min.time()),
            inc=True,
        )
    ]


@pytest.mark.parametrize("seed", range(300))
def test_matches_dateutil(seed: int) -> None:
    rng = random.Random(seed)
    text = _random_rule(rng)
    start = date(2025, 6, 1) + timedelta(days=rng.randint(0, 500))
    last = start + timedelta(days=rng.randint(30, 1000))
    rule = parse_rule(text)
    assert list(instances(rule, start, last)) == _dateutil(rule, start, last), text


@pytest.mark.parametrize("seed", range(100))
def test_skipping_ahead_matches_starting_from_the_beginning(seed: int) -> None:
    rng = random.Random(1000 + seed)
    rule = parse_rule(_random_rule(rng))
    start = date(2025, 6, 1) + timedelta(days=rng.randint(0, 300))
    first = start + timedelta(days=rng.randint(0, 400))
    last = first + timedelta(days=rng.randint(0, 120))
    assert list(instances(rule, start, last, first=first)) == [
        day for day in instances(rule, start, last) if day >= first
    ]
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_recurrence.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores'`.

- [ ] **Step 3: Pin the reference library and write the module.**

`requirements_test.txt`:

```diff
diff --git a/requirements_test.txt b/requirements_test.txt
index a6502d7..067c849 100644
--- a/requirements_test.txt
+++ b/requirements_test.txt
@@ -4,3 +4,5 @@
 # that Home Assistant 2026.9.4 pins is installed too.
 pytest-homeassistant-custom-component==0.13.367
 home-assistant-frontend==20260826.7
+# The chores recurrence tests compare against python-dateutil's rrule (spec 16).
+python-dateutil==2.9.0.post0
```

`custom_components/planavista/chores/__init__.py` (new):

```python
"""Chores: the plan, the engine that turns it into check-offs, and its Home Assistant surface."""
```

`custom_components/planavista/chores/recurrence.py` (new):

```python
"""Repeating chores: the RRULE subset PlanaVista supports (spec section 7.3).

A standard RFC 5545 RRULE, the format Home Assistant calendars use, limited to
FREQ=DAILY, WEEKLY, or MONTHLY with INTERVAL, BYDAY (weekly), BYMONTHDAY
(monthly, one day), and COUNT or UNTIL. Anything else is refused with a
message that says what to change. Nothing here imports Home Assistant.

Instances follow python-dateutil's reading of the RFC, which the tests compare
against: the start date is an instance only when it fits the rule, weeks start
on Monday (WKST=MO), and a month without the day (the 31st in April) has no
instance. Chores repeat on dates, so an UNTIL with a time keeps only its date.
"""
from __future__ import annotations

from collections.abc import Iterator
import calendar
from dataclasses import dataclass
from datetime import date, timedelta
import re

FREQUENCIES = ("DAILY", "WEEKLY", "MONTHLY")
WEEKDAYS = ("MO", "TU", "WE", "TH", "FR", "SA", "SU")
MAX_INTERVAL = 99
MAX_COUNT = 999

_UNTIL = re.compile(r"(\d{4})(\d{2})(\d{2})(?:T\d{6}Z?)?")
_NUMBER = re.compile(r"[0-9]{1,4}")


class RecurrenceError(ValueError):
    """A rule outside the supported subset. The message says what to change."""


@dataclass(frozen=True)
class Rule:
    """One parsed rule. `byday` holds weekdays with 0 for Monday."""

    freq: str
    interval: int = 1
    byday: tuple[int, ...] = ()
    bymonthday: int | None = None
    count: int | None = None
    until: date | None = None

    def __str__(self) -> str:
        """The rule as canonical RRULE text, the way PlanaVista stores it."""
        parts = [f"FREQ={self.freq}"]
        if self.interval != 1:
            parts.append(f"INTERVAL={self.interval}")
        if self.byday:
            parts.append("BYDAY=" + ",".join(WEEKDAYS[day] for day in self.byday))
        if self.bymonthday is not None:
            parts.append(f"BYMONTHDAY={self.bymonthday}")
        if self.count is not None:
            parts.append(f"COUNT={self.count}")
        if self.until is not None:
            parts.append(f"UNTIL={self.until:%Y%m%d}")
        return ";".join(parts)


def _number(value: str, name: str, low: int, high: int) -> int:
    if not _NUMBER.fullmatch(value) or not low <= int(value) <= high:
        raise RecurrenceError(f"{name} must be a whole number from {low} to {high}.")
    return int(value)


def parse_rule(text: object) -> Rule:
    """Read RRULE text (with or without the "RRULE:" prefix) or say what is wrong."""
    if not isinstance(text, str) or not text.strip():
        raise RecurrenceError("Add a repeating rule.")
    body = text.strip()
    if body[:6].upper() == "RRULE:":
        body = body[6:]
    parts: dict[str, str] = {}
    for part in body.split(";"):
        if not part.strip():
            continue
        name, sep, value = part.partition("=")
        name, value = name.strip().upper(), value.strip().upper()
        if not sep or not name or not value:
            raise RecurrenceError(f"{part.strip()} isn't a rule part like FREQ=WEEKLY.")
        if name in parts:
            raise RecurrenceError(f"{name} appears twice.")
        parts[name] = value

    freq = parts.pop("FREQ", None)
    if freq is None:
        raise RecurrenceError("The rule needs FREQ (DAILY, WEEKLY, or MONTHLY).")
    if freq not in FREQUENCIES:
        raise RecurrenceError("Chores repeat daily, weekly, or monthly.")
    interval = _number(parts.pop("INTERVAL", "1"), "INTERVAL", 1, MAX_INTERVAL)

    byday: tuple[int, ...] = ()
    if "BYDAY" in parts:
        if freq != "WEEKLY":
            raise RecurrenceError("Only weekly chores pick days of the week (BYDAY).")
        days = parts.pop("BYDAY").split(",")
        if any(day not in WEEKDAYS for day in days):
            raise RecurrenceError("BYDAY lists days such as MO,TH, without numbers in front.")
        if len(set(days)) != len(days):
            raise RecurrenceError("BYDAY lists a day twice.")
        byday = tuple(sorted(WEEKDAYS.index(day) for day in days))

    bymonthday: int | None = None
    if "BYMONTHDAY" in parts:
        if freq != "MONTHLY":
            raise RecurrenceError("Only monthly chores pick a day of the month (BYMONTHDAY).")
        value = parts.pop("BYMONTHDAY")
        if "," in value:
            raise RecurrenceError("A monthly chore repeats on one day of the month.")
        bymonthday = _number(value, "BYMONTHDAY", 1, 31)

    count: int | None = None
    if "COUNT" in parts:
        count = _number(parts.pop("COUNT"), "COUNT", 1, MAX_COUNT)
    until: date | None = None
    if "UNTIL" in parts:
        if count is not None:
            raise RecurrenceError("Use COUNT or UNTIL, not both.")
        match = _UNTIL.fullmatch(parts.pop("UNTIL"))
        try:
            if match is None:
                raise ValueError
            until = date(int(match[1]), int(match[2]), int(match[3]))
        except ValueError:
            raise RecurrenceError("UNTIL is a date such as 20261130.") from None

    if parts:
        name = sorted(parts)[0]
        raise RecurrenceError(f"PlanaVista doesn't support {name} in a repeating chore.")
    return Rule(freq, interval, byday, bymonthday, count, until)


def _months_later(year: int, month: int, months: int) -> tuple[int, int]:
    index = year * 12 + (month - 1) + months
    return index // 12, index % 12 + 1


def _candidates(rule: Rule, start: date, last: date, skip_to: date | None) -> Iterator[date]:
    """Dates that fit the rule from `start` through `last`, in order (COUNT and UNTIL not applied).

    `skip_to` jumps ahead to near that date; only rules without COUNT use it,
    because COUNT needs every instance from the start. Each frequency stops
    once a whole period lies after `last`, so a month that never has the day
    (the 31st, every April) can't loop forever.
    """
    if rule.freq == "DAILY":
        step = 0
        if skip_to is not None and skip_to > start:
            step = (skip_to - start).days // rule.interval
        while (candidate := start + timedelta(days=step * rule.interval)) <= last:
            yield candidate
            step += 1
    elif rule.freq == "WEEKLY":
        days = rule.byday or (start.weekday(),)
        first_monday = start - timedelta(days=start.weekday())
        week = 0
        if skip_to is not None and skip_to > start:
            weeks = (skip_to - first_monday).days // 7
            week = weeks // rule.interval * rule.interval
        while (monday := first_monday + timedelta(weeks=week)) <= last:
            for day in days:
                candidate = monday + timedelta(days=day)
                if candidate >= start:
                    yield candidate
            week += rule.interval
    else:
        day_of_month = rule.bymonthday or start.day
        months = 0
        if skip_to is not None and skip_to > start:
            between = (skip_to.year - start.year) * 12 + skip_to.month - start.month
            months = max(0, between) // rule.interval * rule.interval
        while date(*_months_later(start.year, start.month, months), 1) <= last:
            year, month = _months_later(start.year, start.month, months)
            if day_of_month <= calendar.monthrange(year, month)[1]:
                candidate = date(year, month, day_of_month)
                if candidate >= start:
                    yield candidate
            months += rule.interval


def instances(rule: Rule, start: date, last: date, first: date | None = None) -> Iterator[date]:
    """Instance dates from `first` (default `start`) through `last`, both inclusive."""
    first = first or start
    skip_to = first if rule.count is None else None
    produced = 0
    for candidate in _candidates(rule, start, last, skip_to):
        if candidate > last or (rule.until is not None and candidate > rule.until):
            return
        if rule.count is not None:
            produced += 1
            if produced > rule.count:
                return
        if candidate >= first:
            yield candidate


def last_instance(rule: Rule, start: date) -> date | None:
    """The final instance of a rule that ends (COUNT or UNTIL), or None when it never ends."""
    if rule.count is None and rule.until is None:
        return None
    last: date | None = None
    for candidate in instances(rule, start, rule.until or date.max - timedelta(days=400)):
        last = candidate
    return last
```

- [ ] **Step 4: Run them again.** Same command. Expected: `429 passed`.
- [ ] **Step 5: Run the whole backend suite.** `bash scripts/test-backend.sh -q` Expected: `694 passed`. `python scripts/check_copy.py` passes.
- [ ] **Step 6: Commit.** `git add custom_components/planavista/chores requirements_test.txt tests/test_chores_recurrence.py`, message `feat(chores): repeating rules, the RRULE subset` with the trailers.

---

### Task 2: Chore days and weeks, the chore model, and stars

Spec 8.1: a chore day runs from `day_starts` (3:00 AM) to the next day's, in Home Assistant's time zone, from local wall-clock times (23- and 25-hour days around daylight saving changes); a chore week starts on the calendar's first-day setting, and a change waits for the next week boundary. Spec 7.3, 7.5, 8.3: chores, settings, and rewards are checked against their rules, and stars per check-off follow one formula, checked against a shared table.

**Files:**
- Create: `custom_components/planavista/chores/periods.py`, `custom_components/planavista/chores/model.py`, `tests/fixtures/chores_stars.json`
- Test: `tests/test_chores_periods.py`, `tests/test_chores_model.py`

**Interfaces:**
- Consumes: `parse_rule`, `instances`, `RecurrenceError` (Task 1); `slug` from `household/members.py`.
- Produces (periods): `WEEKDAY_CODES`, `FIRST_DAYS`, `BANDS`, `parse_clock(text) -> time | None`, `period_id(kind, day) -> str`; `WeekRule(first_day="monday", before=None, since=None)` with `start(day)`, `end(day)`, `first_day_on(day)`, `changed_to(first_day, today) -> WeekRule`, `as_dict()`, `from_dict(data)`; `Clock(tz, day_starts=time(3, 0), weeks=WeekRule())` with `day_start(day)`, `day_end(day)`, `chore_date(at)`, `due_day(due)`, `week_start(day)`, `week_end(day)`, `month_start(day)`, `month_end(day)`, `band(at)`, `with_weeks(weeks)`.
- Produces (model): `SCHEDULES`, `CATEGORIES`, `MISSED_POLICIES`, `AUTO_APPROVE`, `SOURCES`, `DEFAULT_SETTINGS`; `ChoreError(code, detail=None)`; `round_half_up(Fraction) -> int`; `stars_for(credit_minutes, minutes_per_star, override=None) -> int`; `make_id(name, taken) -> str`; `build_activity(existing, changes, member_ids) -> dict`; `on_board(activity) -> bool`; `build_settings(existing, changes) -> dict`; `build_reward(existing, changes, member_ids) -> dict`; `default_plan()`, `default_log()`, `default_rewards()`.

- [ ] **Step 1: Write the failing tests and the shared stars table.**

`tests/fixtures/chores_stars.json` (new):

```json
{
  "about": "Stars per check-off (spec 8.3): the chore's own number when set, otherwise 1 per minutes_per_star, rounded half up, at least 1. The card's copy of the formula is checked against this table too.",
  "cases": [
    {"minutes": 60, "minutes_per_star": 15, "stars": 4},
    {"minutes": 15, "minutes_per_star": 15, "stars": 1},
    {"minutes": 37.5, "minutes_per_star": 15, "stars": 3},
    {"minutes": 22.5, "minutes_per_star": 15, "stars": 2},
    {"minutes": 7.5, "minutes_per_star": 15, "stars": 1},
    {"minutes": 5, "minutes_per_star": 15, "stars": 1},
    {"minutes": 52.5, "minutes_per_star": 15, "stars": 4},
    {"minutes": 40, "minutes_per_star": 15, "stars": 3},
    {"minutes": 8.57, "minutes_per_star": 15, "stars": 1},
    {"minutes": 120, "minutes_per_star": 30, "stars": 4},
    {"minutes": 45, "minutes_per_star": 10, "stars": 5},
    {"minutes": 240, "minutes_per_star": 15, "stars": 16},
    {"minutes": 60, "minutes_per_star": 15, "override": 10, "stars": 10},
    {"minutes": 60, "minutes_per_star": 15, "override": 0, "stars": 0}
  ]
}
```

`tests/test_chores_periods.py` (new):

```python
"""Chore days, weeks, and bands, including days around daylight saving changes (spec 8.1)."""
from __future__ import annotations

from datetime import UTC, date, datetime, time, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.planavista.chores.periods import Clock, WeekRule, parse_clock

TZ = ZoneInfo("America/Chicago")
CLOCK = Clock(TZ)


def at(month: int, day: int, hour: int, minute: int) -> datetime:
    """A local time in 2026, in the sample household's time zone."""
    return datetime(2026, month, day, hour, minute, tzinfo=TZ)


def test_a_chore_day_runs_from_3_am_to_3_am() -> None:
    assert CLOCK.day_start(date(2026, 10, 13)) == at(10, 13, 3, 0)
    assert CLOCK.day_end(date(2026, 10, 13)) == at(10, 14, 3, 0)
    assert CLOCK.chore_date(at(10, 14, 2, 59)) == date(2026, 10, 13)
    assert CLOCK.chore_date(at(10, 14, 3, 0)) == date(2026, 10, 14)
    assert CLOCK.due_day(at(10, 14, 3, 0)) == date(2026, 10, 13)


def test_days_around_daylight_saving_changes_are_23_and_25_hours() -> None:
    def length(day: date) -> timedelta:
        return CLOCK.day_end(day).astimezone(UTC) - CLOCK.day_start(day).astimezone(UTC)

    spring, autumn = length(date(2026, 3, 7)), length(date(2026, 10, 31))
    assert spring == timedelta(hours=23)
    assert autumn == timedelta(hours=25)
    # Both boundaries are 3:00 AM on the wall clock.
    assert CLOCK.day_end(date(2026, 10, 31)).astimezone(TZ).hour == 3
    assert CLOCK.day_end(date(2026, 3, 7)).astimezone(TZ).hour == 3


def test_an_instant_in_another_zone_lands_on_the_local_chore_day() -> None:
    utc = datetime(2026, 10, 14, 7, 30, tzinfo=ZoneInfo("UTC"))  # 2:30 AM in Chicago
    assert CLOCK.chore_date(utc) == date(2026, 10, 13)


def test_a_day_start_in_a_skipped_hour_still_has_one_boundary() -> None:
    clock = Clock(TZ, time(2, 30))
    start = clock.day_start(date(2026, 3, 8))  # 2:30 AM doesn't exist that night
    assert clock.chore_date(start) == date(2026, 3, 8)
    assert clock.chore_date(start - timedelta(minutes=1)) == date(2026, 3, 7)


@pytest.mark.parametrize(
    ("moment", "band"),
    [((10, 13, 3, 0), "morning"), ((10, 13, 11, 59), "morning"), ((10, 13, 12, 0), "afternoon"),
     ((10, 13, 16, 59), "afternoon"), ((10, 13, 17, 0), "evening"), ((10, 14, 1, 30), "evening")],
)
def test_bands(moment: tuple[int, int, int, int], band: str) -> None:
    assert CLOCK.band(at(*moment)) == band


def test_weeks_start_on_the_first_day_setting() -> None:
    assert CLOCK.week_start(date(2026, 10, 13)) == date(2026, 10, 12)
    assert CLOCK.week_end(date(2026, 10, 13)) == date(2026, 10, 19)
    sunday = Clock(TZ, weeks=WeekRule("sunday"))
    assert sunday.week_start(date(2026, 10, 13)) == date(2026, 10, 11)


def test_changing_the_first_day_waits_for_the_next_week_boundary() -> None:
    rule = WeekRule("monday").changed_to("sunday", date(2026, 10, 13))
    assert rule == WeekRule("sunday", before="monday", since=date(2026, 10, 19))
    # This week isn't split.
    assert (rule.start(date(2026, 10, 16)), rule.end(date(2026, 10, 16))) == (date(2026, 10, 12), date(2026, 10, 19))
    # The first week under Sunday starts at the old boundary and ends at the first Sunday.
    assert (rule.start(date(2026, 10, 20)), rule.end(date(2026, 10, 20))) == (date(2026, 10, 19), date(2026, 10, 25))
    assert (rule.start(date(2026, 10, 27)), rule.end(date(2026, 10, 27))) == (date(2026, 10, 25), date(2026, 11, 1))


def test_changing_back_before_it_takes_effect_cancels_the_change() -> None:
    pending = WeekRule("monday").changed_to("sunday", date(2026, 10, 13))
    assert pending.changed_to("monday", date(2026, 10, 14)) == WeekRule("monday")
    assert WeekRule("monday").changed_to("monday", date(2026, 10, 14)) == WeekRule("monday")


def test_a_week_rule_survives_the_log() -> None:
    rule = WeekRule("sunday", before="monday", since=date(2026, 10, 19))
    assert WeekRule.from_dict(rule.as_dict()) == rule
    assert WeekRule.from_dict({"first_day": "tuesday"}) == WeekRule()
    assert WeekRule.from_dict(None) == WeekRule()


def test_month_bounds() -> None:
    assert Clock.month_start(date(2026, 10, 13)) == date(2026, 10, 1)
    assert Clock.month_end(date(2026, 12, 31)) == date(2027, 1, 1)


def test_clock_times() -> None:
    assert parse_clock("03:00") == time(3, 0)
    assert parse_clock("3:00") is None
    assert parse_clock("24:00") is None
    assert parse_clock(None) is None
```

`tests/test_chores_model.py` (new):

```python
"""Chore records and their rules, and the stars formula (spec 7.3, 7.5, 8.3, 15.5)."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from custom_components.planavista.chores.model import (
    DEFAULT_SETTINGS,
    ChoreError,
    build_activity,
    build_reward,
    build_settings,
    make_id,
    on_board,
    stars_for,
)

MEMBERS = {"alex", "blair", "casey", "dana"}
STARS = json.loads((Path(__file__).parent / "fixtures" / "chores_stars.json").read_text("utf-8"))


@pytest.mark.parametrize("case", STARS["cases"])
def test_stars_follow_the_shared_table(case: dict[str, Any]) -> None:
    assert stars_for(case["minutes"], case["minutes_per_star"], case.get("override")) == case["stars"]


def test_ids_are_slugs_with_a_number_on_a_collision() -> None:
    assert make_id("Clean the Bathroom!", []) == "clean_the_bathroom"
    assert make_id("Clean the bathroom", ["clean_the_bathroom"]) == "clean_the_bathroom_2"
    assert make_id("Café run", []) == "cafe_run"


def _plan(**fields: Any) -> dict[str, Any]:
    return {"name": "Clean the bathroom", "schedule": "plan", "assignees": ["blair", "casey"],
            "minimum": {"hours": 2, "per": "week"}, **fields}


def test_a_plan_chore_gets_its_defaults() -> None:
    activity = build_activity(None, _plan(), MEMBERS)
    assert activity["split"] == "each"
    assert activity["shares"] is None
    assert activity["days"] == [] and activity["time_of_day"] == [] and activity["times"] == 1
    assert (activity["on_board"], activity["needs_ok"], activity["stars"], activity["category"]) == (True, False, None, "other")
    assert activity["finished_at"] is None


def test_days_and_bands_are_kept_in_calendar_order() -> None:
    activity = build_activity(None, _plan(days=["thu", "mon"], time_of_day=["evening", "morning"]), MEMBERS)
    assert activity["days"] == ["mon", "thu"]
    assert activity["time_of_day"] == ["morning", "evening"]


def test_shared_time_must_add_up() -> None:
    ok = build_activity(None, _plan(split="shared", shares={"blair": 1.5, "casey": 0.5}), MEMBERS)
    assert ok["shares"] == {"blair": 1.5, "casey": 0.5}
    for shares in ({"blair": 1, "casey": 0.5}, {"blair": 2}, {"blair": 1, "casey": 1, "dana": 0}):
        with pytest.raises(ChoreError) as err:
            build_activity(None, _plan(split="shared", shares=shares), MEMBERS)
        assert err.value.code == "shares_mismatch"


@pytest.mark.parametrize(
    ("changes", "code"),
    [
        ({"name": "  "}, "name_required"),
        ({"name": "x" * 61}, "name_too_long"),
        ({"schedule": "sometimes"}, "invalid_schedule"),
        ({"assignees": ["erin"]}, "unknown_member"),
        ({"assignees": ["casey", "casey"]}, "invalid_assignees"),
        ({"minimum": {"hours": 0, "per": "week"}}, "invalid_minimum"),
        ({"minimum": {"hours": 1, "per": "month"}}, "invalid_minimum"),
        ({"days": ["mon", "funday"]}, "invalid_days"),
        ({"time_of_day": ["night"]}, "invalid_bands"),
        ({"times": 0}, "invalid_times"),
        ({"set_time": "5:30 PM"}, "invalid_set_time"),
        ({"stars": -1}, "invalid_stars"),
        ({"category": "chores"}, "invalid_category"),
        ({"icon": ""}, "invalid_icon"),
        ({"on_board": "yes"}, "invalid_on_board"),
    ],
)
def test_broken_rules_are_named(changes: dict[str, Any], code: str) -> None:
    with pytest.raises(ChoreError) as err:
        build_activity(None, _plan(**changes), MEMBERS)
    assert err.value.code == code


def test_a_change_keeps_fields_this_version_does_not_edit() -> None:
    stored = build_activity(None, _plan(), MEMBERS) | {
        "id": "clean_the_bathroom", "type": "need", "locked": True, "agreed": True,
        "import_ref": {"format": "household-hours/v1", "id": "a12"}, "future_field": 1,
    }
    changed = build_activity(stored, {"name": "Bathroom"}, MEMBERS)
    assert changed["name"] == "Bathroom"
    for key in ("id", "type", "locked", "agreed", "import_ref", "future_field"):
        assert changed[key] == stored[key]


def test_once_chores() -> None:
    once = build_activity(None, {"name": "Fix the gate latch", "schedule": "once", "assignees": ["alex"],
                                 "once": {"by": "2026-10-16", "estimate_minutes": 30}}, MEMBERS)
    assert once["once"] == {"on": None, "by": "2026-10-16", "by_time": None, "sessions": 1, "estimate_minutes": 30}
    for bad, detail in (
        ({"on": "2026-10-16", "by": "2026-10-17"}, "Pick a day or a date to finish by, not both."),
        ({"by_time": "17:00"}, "A time to finish by needs a date."),
    ):
        with pytest.raises(ChoreError) as err:
            build_activity(None, {"name": "x", "schedule": "once", "assignees": [], "once": bad}, MEMBERS)
        assert (err.value.code, err.value.detail) == ("invalid_once", detail)


def test_repeats_chores_store_the_canonical_rule() -> None:
    raw = {"name": "Rake the leaves", "schedule": "repeats", "assignees": ["casey"],
           "repeats": {"rrule": "freq=weekly;byday=sa;until=20261130", "start": "2026-10-17", "estimate_minutes": 60}}
    activity = build_activity(None, raw, MEMBERS)
    assert activity["repeats"] == {"rrule": "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", "start": "2026-10-17",
                                   "window": "day", "estimate_minutes": 60}


@pytest.mark.parametrize(
    ("repeats", "detail"),
    [
        ({"rrule": "FREQ=YEARLY", "start": "2026-10-17"}, "Chores repeat daily, weekly, or monthly."),
        ({"rrule": "FREQ=WEEKLY"}, "Add the day it starts."),
        ({"rrule": "FREQ=DAILY", "start": "2026-10-17", "window": "period"}, "A daily chore is done on its day."),
        ({"rrule": "FREQ=MONTHLY;INTERVAL=12;BYMONTHDAY=31", "start": "2026-04-01"},
         "This rule never repeats. Pick another day."),
    ],
)
def test_repeats_outside_the_subset_are_refused_with_a_reason(repeats: dict[str, Any], detail: str) -> None:
    with pytest.raises(ChoreError) as err:
        build_activity(None, {"name": "x", "schedule": "repeats", "assignees": [], "repeats": repeats}, MEMBERS)
    assert (err.value.code, err.value.detail) == ("invalid_repeats", detail)


def test_what_reaches_the_board() -> None:
    assert on_board(build_activity(None, _plan(), MEMBERS))
    assert not on_board(build_activity(None, _plan(assignees=[]), MEMBERS))
    assert not on_board(build_activity(None, _plan(on_board=False), MEMBERS))
    assert not on_board(build_activity(None, _plan(set_time="17:30"), MEMBERS))
    assert not on_board(build_activity(None, _plan(), MEMBERS) | {"finished_at": "2026-10-13T16:00:00-05:00"})


def test_settings() -> None:
    assert build_settings({}, {}) == DEFAULT_SETTINGS
    assert build_settings(DEFAULT_SETTINGS, {"missed": "strict", "evening_check": None})["missed"] == "strict"
    for changes, code in (
        ({"missed": "never"}, "invalid_missed"),
        ({"day_starts": "07:00"}, "invalid_day_starts"),
        ({"day_starts": "3:00"}, "invalid_day_starts"),
        ({"auto_approve": "always"}, "invalid_auto_approve"),
        ({"minutes_per_star": 0}, "invalid_minutes_per_star"),
        ({"evening_check": "7 PM"}, "invalid_evening_check"),
        ({"sound": 1}, "invalid_sound"),
    ):
        with pytest.raises(ChoreError) as err:
            build_settings(DEFAULT_SETTINGS, changes)
        assert err.value.code == code


def test_rewards() -> None:
    reward = build_reward(None, {"name": "Movie night pick", "icon": "🎬", "cost": 40, "who": ["casey", "dana"]}, MEMBERS)
    assert reward == {"name": "Movie night pick", "icon": "🎬", "cost": 40, "needs_ok": True, "who": ["casey", "dana"]}
    for changes, code in (({"cost": 0}, "invalid_cost"), ({"who": ["erin"]}, "unknown_member"), ({"name": ""}, "name_required")):
        with pytest.raises(ChoreError) as err:
            build_reward(None, {"name": "Movie night pick", "cost": 40, **changes}, MEMBERS)
        assert err.value.code == code
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_periods.py tests/test_chores_model.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.periods'` (and `.model`).

- [ ] **Step 3: Write the modules.**

`custom_components/planavista/chores/periods.py` (new):

```python
"""Chore days, chore weeks, months, and time-of-day bands (spec section 8.1).

A chore day runs from `day_starts` (3:00 AM) to the next day's `day_starts`, in
Home Assistant's time zone. Boundaries are local wall-clock times made with
zoneinfo, never "add 24 hours", so days around daylight saving changes are 23
or 25 hours long. A chore week starts on the calendar's first-day setting; a
change of that setting takes effect at the next week boundary, so no week is
split. Nothing here imports Home Assistant.

Python compares and subtracts two datetimes that share a tzinfo by their wall
clocks, not as instants, so everything here compares instants in UTC.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import UTC, date, datetime, time, timedelta, tzinfo
import re

WEEKDAY_CODES = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
FIRST_DAYS = {"monday": 0, "sunday": 6}
BANDS = ("morning", "afternoon", "evening")
AFTERNOON_FROM = time(12, 0)
EVENING_FROM = time(17, 0)

_CLOCK = re.compile(r"([01][0-9]|2[0-3]):([0-5][0-9])")


def parse_clock(text: object) -> time | None:
    """A 24-hour "HH:MM" time, or None when the text isn't one."""
    if not isinstance(text, str):
        return None
    match = _CLOCK.fullmatch(text)
    return time(int(match[1]), int(match[2])) if match else None


def period_id(kind: str, day: date) -> str:
    """`day:YYYY-MM-DD`, `week:YYYY-MM-DD`, or `rep:YYYY-MM-DD` (spec 7.6)."""
    return f"{kind}:{day.isoformat()}"


def _rule_start(day: date, first_day: str) -> date:
    return day - timedelta(days=(day.weekday() - FIRST_DAYS[first_day]) % 7)


@dataclass(frozen=True)
class WeekRule:
    """Which day weeks start on, and since when.

    Before `since`, weeks follow `before`. The first week from `since` may be
    short, because it ends at the next week start under `first_day`.
    """

    first_day: str = "monday"
    before: str | None = None
    since: date | None = None

    def first_day_on(self, day: date) -> str:
        """The first-day setting that weeks follow on `day`."""
        if self.since is not None and day < self.since and self.before:
            return self.before
        return self.first_day

    def start(self, day: date) -> date:
        """The first chore day of the week holding `day`."""
        if self.since is not None and day < self.since:
            return _rule_start(day, self.first_day_on(day))
        start = _rule_start(day, self.first_day)
        if self.since is not None and start < self.since:
            return self.since
        return start

    def end(self, day: date) -> date:
        """The first chore day after the week holding `day`."""
        if self.since is not None and day < self.since:
            return min(_rule_start(day, self.first_day_on(day)) + timedelta(days=7), self.since)
        return _rule_start(day, self.first_day) + timedelta(days=7)

    def changed_to(self, first_day: str, today: date) -> WeekRule:
        """The rule after the setting changes on `today`: from the next week boundary on."""
        current = self.first_day_on(today)
        if first_day == current:
            return WeekRule(first_day) if self.first_day != current else self
        return WeekRule(first_day, before=current, since=self.end(today))

    def as_dict(self) -> dict[str, str | None]:
        """How the log stores the rule."""
        return {
            "first_day": self.first_day,
            "before": self.before,
            "since": self.since.isoformat() if self.since else None,
        }

    @classmethod
    def from_dict(cls, data: object) -> WeekRule:
        """Read a stored rule; anything unreadable starts weeks on Monday."""
        if not isinstance(data, dict) or data.get("first_day") not in FIRST_DAYS:
            return cls()
        before = data.get("before") if data.get("before") in FIRST_DAYS else None
        try:
            since = date.fromisoformat(data["since"]) if data.get("since") else None
        except (TypeError, ValueError):
            since = None
        return cls(data["first_day"], before if since else None, since if before else None)


@dataclass(frozen=True)
class Clock:
    """Turns instants into chore days and back, in one time zone."""

    tz: tzinfo
    day_starts: time = time(3, 0)
    weeks: WeekRule = WeekRule()

    def with_weeks(self, weeks: WeekRule) -> Clock:
        """The same clock with another week rule."""
        return replace(self, weeks=weeks)

    def day_start(self, day: date) -> datetime:
        """When chore day `day` begins (a local wall-clock time)."""
        return datetime.combine(day, self.day_starts, tzinfo=self.tz)

    def day_end(self, day: date) -> datetime:
        """When chore day `day` ends: the next day's start."""
        return self.day_start(day + timedelta(days=1))

    def chore_date(self, at: datetime) -> date:
        """The chore day an instant falls in."""
        local = at.astimezone(self.tz).date()
        if at.astimezone(UTC) < self.day_start(local).astimezone(UTC):
            return local - timedelta(days=1)
        return local

    def due_day(self, due: datetime) -> date:
        """The chore day something due at `due` belongs to (the day that ends there)."""
        return self.chore_date(due - timedelta(microseconds=1))

    def week_start(self, day: date) -> date:
        """The first chore day of the chore week holding `day`."""
        return self.weeks.start(day)

    def week_end(self, day: date) -> date:
        """The first chore day after that week."""
        return self.weeks.end(day)

    @staticmethod
    def month_start(day: date) -> date:
        """The first day of the month holding `day`."""
        return day.replace(day=1)

    @staticmethod
    def month_end(day: date) -> date:
        """The first day of the next month."""
        return (day.replace(day=28) + timedelta(days=4)).replace(day=1)

    def band(self, at: datetime) -> str:
        """Morning until 12:00 PM, afternoon until 5:00 PM, evening after that (and past midnight)."""
        moment = at.astimezone(self.tz).time()
        if self.day_starts <= moment < AFTERNOON_FROM:
            return "morning"
        if AFTERNOON_FROM <= moment < EVENING_FROM:
            return "afternoon"
        return "evening"
```

`custom_components/planavista/chores/model.py` (new):

```python
"""The chore plan's records, their rules, and the stars formula (spec 7.3, 7.5, 8.3).

Records are plain dicts, like household members: a field written by a newer
release is kept as it is when this one saves (spec 7.8). `build_activity`,
`build_settings`, and `build_reward` return a record after a change, checked
against the rules, or raise ChoreError naming the broken rule. Nothing here
imports Home Assistant.
"""
from __future__ import annotations

from collections.abc import Collection, Iterable, Mapping
from datetime import date, timedelta
from fractions import Fraction
import math
from typing import Any

from ..household.members import slug
from .periods import BANDS, WEEKDAY_CODES, parse_clock
from .recurrence import RecurrenceError, instances, parse_rule

SCHEDULES = ("plan", "once", "repeats")
CATEGORIES = ("kitchen", "cleaning", "home", "personal", "school", "work", "family", "sleep", "other")
MISSED_POLICIES = ("make_up", "strict", "carry_over")
AUTO_APPROVE = ("day_end", "never")
SPLITS = ("shared", "each")
PERIODS = ("day", "week")
WINDOWS = ("day", "period")
SOURCES = ("tablet", "phone", "voice", "automation", "notification")

DEFAULT_SETTINGS: dict[str, Any] = {
    "missed": "make_up",
    "day_starts": "03:00",
    "auto_approve": "day_end",
    "minutes_per_star": 15,
    "evening_check": "19:00",
    "sound": False,
}

# Fields a chore save may change. Anything else on a stored chore is kept.
ACTIVITY_FIELDS = (
    "name", "icon", "category", "schedule", "assignees", "on_board", "needs_ok", "stars", "label",
    "minimum", "split", "shares", "days", "time_of_day", "times", "set_time", "once", "repeats",
)
REWARD_FIELDS = ("name", "icon", "cost", "needs_ok", "who")

NAME_MAX_LENGTH = 60
LABEL_MAX_LENGTH = 30
ICON_MAX_LENGTH = 40
MAX_TIMES = 12
MAX_SESSIONS = 20
MAX_ESTIMATE_MINUTES = 24 * 60
MAX_HOURS = 168
MAX_STARS = 100
MAX_ACTIVITIES = 300
MAX_REWARDS = 100
MAX_COST = 10_000
# A repeating chore must land at least once this soon after it starts.
FIRST_INSTANCE_WITHIN = timedelta(days=5 * 366)


class ChoreError(ValueError):
    """A change that breaks a chore rule. `code` names the rule; `detail` says more."""

    def __init__(self, code: str, detail: str | None = None) -> None:
        """Remember which rule was broken."""
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


def round_half_up(value: Fraction) -> int:
    """Round to the nearest whole number, halves up (2.5 is 3)."""
    return math.floor(value + Fraction(1, 2))


def stars_for(credit_minutes: float, minutes_per_star: int, override: int | None = None) -> int:
    """Stars per check-off (spec 8.3): the chore's own number, else 1 per `minutes_per_star`, at least 1."""
    if override is not None:
        return int(override)
    return max(1, round_half_up(Fraction(str(credit_minutes)) / int(minutes_per_star)))


def make_id(name: str, taken: Iterable[str]) -> str:
    """A new id made from the name, with _2, _3, ... on a collision (spec 7.6)."""
    used = set(taken)
    base = slug(name)
    if base not in used:
        return base
    number = 2
    while f"{base}_{number}" in used:
        number += 1
    return f"{base}_{number}"


def _date(value: object, code: str) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        raise ChoreError(code) from None


def _whole(value: object, code: str, low: int, high: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise ChoreError(code)
    return value


def _hours(value: object, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 < value <= MAX_HOURS:
        raise ChoreError(code)
    return float(value)


def _name(value: object) -> str:
    name = value.strip() if isinstance(value, str) else ""
    if not name:
        raise ChoreError("name_required")
    if len(name) > NAME_MAX_LENGTH:
        raise ChoreError("name_too_long")
    return name


def _icon(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or not 0 < len(value.strip()) <= ICON_MAX_LENGTH:
        raise ChoreError("invalid_icon")
    return value.strip()


def _codes(value: object, allowed: tuple[str, ...], code: str) -> list[str]:
    if not isinstance(value, list) or any(v not in allowed for v in value) or len(set(value)) != len(value):
        raise ChoreError(code)
    return sorted(value, key=allowed.index)


def _plan_fields(activity: dict[str, Any]) -> None:
    minimum = activity.get("minimum")
    if not isinstance(minimum, Mapping) or minimum.get("per") not in PERIODS:
        raise ChoreError("invalid_minimum")
    activity["minimum"] = {**minimum, "hours": _hours(minimum.get("hours"), "invalid_minimum")}
    activity.setdefault("split", "each")
    if activity["split"] not in SPLITS:
        raise ChoreError("invalid_split")
    if activity["split"] == "shared":
        shares = activity.get("shares")
        if not isinstance(shares, Mapping) or set(shares) != set(activity["assignees"]):
            raise ChoreError("shares_mismatch")
        hours = {member: _hours(value, "shares_mismatch") for member, value in shares.items()}
        if abs(sum(hours.values()) - activity["minimum"]["hours"]) > 0.01:
            raise ChoreError("shares_mismatch")
        activity["shares"] = hours
    else:
        activity["shares"] = None
    activity["days"] = _codes(activity.get("days", []), WEEKDAY_CODES, "invalid_days")
    activity["time_of_day"] = _codes(activity.get("time_of_day", []), BANDS, "invalid_bands")
    activity["times"] = _whole(activity.get("times", 1), "invalid_times", 1, MAX_TIMES)
    set_time = activity.get("set_time")
    if set_time is not None and parse_clock(set_time) is None:
        raise ChoreError("invalid_set_time")
    activity["set_time"] = set_time


def _once_fields(activity: dict[str, Any]) -> None:
    once = activity.get("once")
    if not isinstance(once, Mapping):
        raise ChoreError("invalid_once")
    on = _date(once.get("on"), "invalid_once")
    by = _date(once.get("by"), "invalid_once")
    by_time = once.get("by_time")
    if on is not None and by is not None:
        raise ChoreError("invalid_once", "Pick a day or a date to finish by, not both.")
    if by_time is not None and (by is None or parse_clock(by_time) is None):
        raise ChoreError("invalid_once", "A time to finish by needs a date.")
    activity["once"] = {
        **once,
        "on": on.isoformat() if on else None,
        "by": by.isoformat() if by else None,
        "by_time": by_time,
        "sessions": _whole(once.get("sessions", 1), "invalid_sessions", 1, MAX_SESSIONS),
        "estimate_minutes": _whole(once.get("estimate_minutes", 15), "invalid_estimate", 1, MAX_ESTIMATE_MINUTES),
    }


def _repeats_fields(activity: dict[str, Any]) -> None:
    repeats = activity.get("repeats")
    if not isinstance(repeats, Mapping):
        raise ChoreError("invalid_repeats", "Add how it repeats.")
    try:
        rule = parse_rule(repeats.get("rrule"))
    except RecurrenceError as err:
        raise ChoreError("invalid_repeats", str(err)) from None
    start = _date(repeats.get("start"), "invalid_repeats")
    if start is None:
        raise ChoreError("invalid_repeats", "Add the day it starts.")
    window = repeats.get("window", "day")
    if window not in WINDOWS:
        raise ChoreError("invalid_repeats", "Each time is on its day or any time that week or month.")
    if window == "period" and rule.freq == "DAILY":
        raise ChoreError("invalid_repeats", "A daily chore is done on its day.")
    if next(instances(rule, start, start + FIRST_INSTANCE_WITHIN), None) is None:
        raise ChoreError("invalid_repeats", "This rule never repeats. Pick another day.")
    activity["repeats"] = {
        **repeats,
        "rrule": str(rule),
        "start": start.isoformat(),
        "window": window,
        "estimate_minutes": _whole(
            repeats.get("estimate_minutes", 15), "invalid_estimate", 1, MAX_ESTIMATE_MINUTES
        ),
    }


def build_activity(
    existing: Mapping[str, Any] | None,
    changes: Mapping[str, Any],
    member_ids: Collection[str],
) -> dict[str, Any]:
    """The chore after `changes`, checked against the rules (spec 7.3, 15.5).

    `existing` is the stored chore, or None for a new one. Stored fields this
    version doesn't edit are kept (planner fields, import_ref, created).
    """
    activity: dict[str, Any] = dict(existing) if existing else {}
    for key in ACTIVITY_FIELDS:
        if key in changes:
            activity[key] = changes[key]
    activity["name"] = _name(activity.get("name"))
    activity["icon"] = _icon(activity.get("icon"))
    activity.setdefault("category", "other")
    if activity["category"] not in CATEGORIES:
        raise ChoreError("invalid_category")
    if activity.get("schedule") not in SCHEDULES:
        raise ChoreError("invalid_schedule")
    assignees = activity.get("assignees", [])
    if not isinstance(assignees, list) or len(set(assignees)) != len(assignees):
        raise ChoreError("invalid_assignees")
    if any(member not in member_ids for member in assignees):
        raise ChoreError("unknown_member")
    activity["assignees"] = list(assignees)
    for flag, default in (("on_board", True), ("needs_ok", False)):
        activity.setdefault(flag, default)
        if not isinstance(activity[flag], bool):
            raise ChoreError(f"invalid_{flag}")
    if activity.get("stars") is not None:
        activity["stars"] = _whole(activity["stars"], "invalid_stars", 0, MAX_STARS)
    else:
        activity["stars"] = None
    label = activity.get("label")
    if label is not None and (not isinstance(label, str) or len(label.strip()) > LABEL_MAX_LENGTH):
        raise ChoreError("invalid_label")
    activity["label"] = label.strip() or None if isinstance(label, str) else None
    {"plan": _plan_fields, "once": _once_fields, "repeats": _repeats_fields}[activity["schedule"]](activity)
    activity.setdefault("finished_at", None)
    return activity


def on_board(activity: Mapping[str, Any]) -> bool:
    """Whether a chore produces check-offs: on the board, with someone assigned (spec 7.3)."""
    if not activity.get("on_board", True) or not activity.get("assignees"):
        return False
    if activity.get("schedule") == "plan" and activity.get("set_time"):
        return False
    return not activity.get("finished_at")


def build_settings(existing: Mapping[str, Any], changes: Mapping[str, Any]) -> dict[str, Any]:
    """Rules and Reminders after `changes` (spec 7.3, 14.5)."""
    settings = {**DEFAULT_SETTINGS, **existing}
    for key in DEFAULT_SETTINGS:
        if key in changes:
            settings[key] = changes[key]
    if settings["missed"] not in MISSED_POLICIES:
        raise ChoreError("invalid_missed")
    day_starts = parse_clock(settings["day_starts"])
    if day_starts is None or day_starts.hour > 6 or (day_starts.hour == 6 and day_starts.minute):
        raise ChoreError("invalid_day_starts")
    if settings["auto_approve"] not in AUTO_APPROVE:
        raise ChoreError("invalid_auto_approve")
    settings["minutes_per_star"] = _whole(settings["minutes_per_star"], "invalid_minutes_per_star", 1, 240)
    if settings["evening_check"] is not None and parse_clock(settings["evening_check"]) is None:
        raise ChoreError("invalid_evening_check")
    if not isinstance(settings["sound"], bool):
        raise ChoreError("invalid_sound")
    return settings


def build_reward(
    existing: Mapping[str, Any] | None,
    changes: Mapping[str, Any],
    member_ids: Collection[str],
) -> dict[str, Any]:
    """A reward after `changes` (spec 7.5, 8.15). An empty `who` means everyone who earns stars."""
    reward: dict[str, Any] = dict(existing) if existing else {}
    for key in REWARD_FIELDS:
        if key in changes:
            reward[key] = changes[key]
    reward["name"] = _name(reward.get("name"))
    reward["icon"] = _icon(reward.get("icon"))
    reward["cost"] = _whole(reward.get("cost"), "invalid_cost", 1, MAX_COST)
    reward.setdefault("needs_ok", True)
    if not isinstance(reward["needs_ok"], bool):
        raise ChoreError("invalid_needs_ok")
    who = reward.get("who", [])
    if not isinstance(who, list) or len(set(who)) != len(who):
        raise ChoreError("invalid_who")
    if any(member not in member_ids for member in who):
        raise ChoreError("unknown_member")
    reward["who"] = list(who)
    return reward


def default_plan() -> dict[str, Any]:
    """A plan with the default rules and no chores yet."""
    return {"settings": dict(DEFAULT_SETTINGS), "activities": []}


def default_log() -> dict[str, Any]:
    """A log with nothing done yet."""
    return {
        "last_day": None,
        "last_boundary": None,
        "weeks": None,
        "policy": None,
        "completions": [],
        "overrides": [],
        "requests": [],
        "carried": [],
        "summaries": [],
        "totals": {},
    }


def default_rewards() -> dict[str, Any]:
    """No rewards, no stars."""
    return {"rewards": [], "ledger": [], "redemptions": []}
```

- [ ] **Step 4: Run them again.** Same command. Expected: `59 passed`.
- [ ] **Step 5: Run the whole backend suite.** Expected: `753 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): chore days and weeks, the chore model, and stars` with the trailers.

---

### Task 3: The engine

Spec 8 in full: occurrences for Plan, Once, and Repeats chores (8.2) and where they show (8.4), completing with the oldest open one and the parent's OK (8.5), undo and review (8.6), the four kinds of request in one review flow (8.7), per-occurrence overrides (8.8), the rollover and its catch-up (8.9), the three missed policies and switching between them (8.10), excuses and Away (8.11), plan edits and finished chores (8.12), streaks (8.13), progress numbers (8.14), rewards and stars (8.15), and the worked examples (8.16). The sample household of spec 4 runs through all of it, on the scene of Tuesday, October 13, 2026, 4:10 PM in America/Chicago.

**Files:**
- Create: `custom_components/planavista/chores/occurrences.py`, `custom_components/planavista/chores/engine.py`, `tests/chores_sample.py`
- Test: `tests/test_chores_occurrences.py`, `tests/test_chores_engine.py`, `tests/test_chores_rollover.py`, `tests/test_chores_examples.py`

**Interfaces:**
- Consumes: Task 1 and Task 2 in full.
- Produces (occurrences): `Occurrence` (frozen: `key, chore, owner, member, period, n, appears, planned, due, band, credit_minutes, stars, window, dated, excused`); `occurrence_key(chore, member, period, n)`; `parse_key(key) -> (chore, member, period, n) | None`; `Generator(clock, minutes_per_star, policy_on)` with `periods_on(activity, day)`, `period_occurrences(activity, member, kind, start)`, `from_key(activity, key)`; `visible_on(occ, day, clock)`, `with_overrides(occ, overrides, members, clock)`, `section_on(occ, day)`, `counted_on(occ, day, clock)`.
- Produces (engine): `ChoreEvent(type, member, data)`; `Outcome(result, data, events, changed)` with `merge(other)`; `Item(occ, section, moved_from, status, completion, counted, overdue_since, request)` with `satisfied`; `EVENT_TYPES`, `CREDITED`, `OPEN`; `new_ulid()`, `needs_ok(doer, activity)`, `away_on(member, day)`, `with_away(away, start, end, note)`, `without_away(away, start, end)`, `short_day(day, today)`; `ChoresEngine(plan, log, rewards, members, *, tz, new_id=new_ulid)` with reading methods `clock`, `generator()`, `policy_on(day)`, `today(now)`, `member(id)`, `member_ids()`, `activity(id)`, `reward(id)`, `items(now, day=None)`, `stats(items)`, `contribution(member, first, end)`, `streak(member, now, today_items=None)`, `week_streak(member, now)`, `chore_streak(member, chore, now)`, `balance(member)`, `chore_minutes(member)`, `open_requests()`, `find_item(key, now)`, `open_item(chore, member, now)`, `item_view(item, day)`, `description(item, today)`, `todo_items(member, now)`, `board(now, day=None)`, `week_view(now, day=None)`, `needs_a_look()`, `next_boundary(now)`; configuration `set_members(members)`, `set_time_zone(tz)`, `set_first_day(first_day, now) -> bool`; writes returning `Outcome`: `complete(now, *, by, source, user=None, key=None, chore=None, member=None, done_by=None, approve=False)`, `undo(now, *, by, source, user=None, key=None, chore=None, member=None)`, `review(now, *, request_id, allow, by, note=None, source=None)`, `pending_for(chore, member)`, `request(now, *, kind, key, by, until=None)`, `override(now, *, key, by, planned_day=..., due=..., assignee=..., excused=..., note=None)`, `excuse(now, *, chore, member, by, day=None, key=None, note=None)`, `save_activity(now, changes, *, by, source, activity_id=None, rev=None)`, `delete_activity(chore_id)`, `unassign_member(member_id)`, `save_settings(now, changes)`, `save_reward(changes, *, reward_id=None)`, `delete_reward(reward_id)`, `redeem(now, *, member, reward, by, source)`, `award_stars(now, *, member, stars, reason, by)`, `start(now)`, `catch_up(now)`, `rollover(day)`.

- [ ] **Step 1: Write the sample household and the failing tests.**

`tests/chores_sample.py` (new):

```python
"""The sample household's chores (spec section 4), shared by the chores tests.

The scene is Tuesday, October 13, 2026, at 4:10 PM in America/Chicago, with
weeks starting on Monday.
"""
from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
import itertools
from typing import Any
from zoneinfo import ZoneInfo

from custom_components.planavista.chores.engine import ChoresEngine
from custom_components.planavista.chores.model import (
    build_activity,
    default_log,
    default_plan,
    default_rewards,
)

TZ = ZoneInfo("America/Chicago")
CREATED = "2026-10-10T19:05:00-05:00"


def at(month: int, day: int, hour: int = 16, minute: int = 10, *, year: int = 2026) -> datetime:
    """A local time in the sample household's time zone."""
    return datetime(year, month, day, hour, minute, tzinfo=TZ)


SCENE = at(10, 13)

MEMBERS: list[dict[str, Any]] = [
    {"id": "alex", "name": "Alex", "parent": True, "age_group": "adult", "needs_ok_for": "none", "stars": False, "order": 0},
    {"id": "blair", "name": "Blair", "parent": True, "age_group": "adult", "needs_ok_for": "none", "stars": False, "order": 1},
    {"id": "casey", "name": "Casey", "parent": False, "age_group": "teen", "needs_ok_for": "marked", "stars": True, "order": 2},
    {"id": "dana", "name": "Dana", "parent": False, "age_group": "young_child", "needs_ok_for": "all", "stars": True, "order": 3},
]


def plan(
    chore_id: str, name: str, assignees: list[str], hours: float, per: str, **fields: Any
) -> dict[str, Any]:
    """A Plan chore."""
    return {"id": chore_id, "name": name, "schedule": "plan", "assignees": assignees,
            "minimum": {"hours": hours, "per": per}, **fields}


def once(chore_id: str, name: str, assignees: list[str], **fields: Any) -> dict[str, Any]:
    """A Once chore; `fields` go into `once` unless they are chore fields."""
    chore = {k: fields.pop(k) for k in ("needs_ok", "stars", "icon") if k in fields}
    return {"id": chore_id, "name": name, "schedule": "once", "assignees": assignees, "once": fields, **chore}


def repeats(
    chore_id: str, name: str, assignees: list[str], rrule: str, start: str, window: str, minutes: int, **fields: Any
) -> dict[str, Any]:
    """A Repeats chore."""
    return {"id": chore_id, "name": name, "schedule": "repeats", "assignees": assignees,
            "repeats": {"rrule": rrule, "start": start, "window": window, "estimate_minutes": minutes}, **fields}


def sample_activities() -> list[dict[str, Any]]:
    """The sample chores, in plan order."""
    return [
        plan("kitchen_cleanup", "Kitchen cleanup", ["alex"], 0.5, "day", time_of_day=["evening"], category="kitchen"),
        plan("cat_care", "Cat care", ["casey"], 0.5, "day", time_of_day=["morning", "evening"], times=2),
        plan("make_your_bed", "Make your bed", ["dana"], 5 / 60, "day", time_of_day=["morning"], category="personal"),
        plan("feed_the_fish", "Feed the fish", ["dana"], 5 / 60, "day", time_of_day=["afternoon"]),
        plan("set_the_table", "Set the table", ["dana"], 10 / 60, "day", time_of_day=["evening"], category="kitchen"),
        plan("tidy_toys", "Tidy toys", ["dana"], 0.25, "day", needs_ok=True),
        plan("laundry", "Laundry", ["blair"], 2, "week", days=["mon", "thu"], label="2 loads"),
        plan("clean_the_bathroom", "Clean the bathroom", ["blair", "casey"], 2, "week",
             split="shared", shares={"blair": 1, "casey": 1}, needs_ok=True, category="cleaning"),
        plan("take_out_the_trash", "Take out the trash", ["casey"], 0.5, "week",
             days=["tue", "fri"], time_of_day=["evening"]),
        plan("yard_work", "Yard work", ["casey"], 1, "week"),
        plan("groceries", "Groceries", ["alex"], 1.5, "week", days=["sat"]),
        plan("finance_and_budget", "Finance and budget", ["alex"], 1, "week", category="work"),
        repeats("change_the_furnace_filter", "Change the furnace filter", ["alex"],
                "FREQ=MONTHLY;BYMONTHDAY=1", "2026-10-01", "period", 15),
        repeats("rake_the_leaves", "Rake the leaves", ["casey"],
                "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", "2026-10-17", "day", 60),
        once("fix_the_gate_latch", "Fix the gate latch", ["alex"], by="2026-10-16", estimate_minutes=30),
        once("clean_out_the_garage", "Clean out the garage", ["casey"], by="2026-10-18",
             sessions=2, estimate_minutes=240, needs_ok=True),
    ]


def built(raw: dict[str, Any], members: list[dict[str, Any]] = MEMBERS) -> dict[str, Any]:
    """A raw chore checked by the model, as the plan stores it."""
    activity = build_activity(None, raw, {m["id"] for m in members})
    activity.update(id=raw["id"], rev=1, created={"by": "alex", "source": "tablet", "at": CREATED})
    return activity


def counter_ids() -> Callable[[], str]:
    """Ids id0001, id0002, ... so records are easy to read in a failing test."""
    numbers = itertools.count(1)
    return lambda: f"id{next(numbers):04d}"


def sample_engine(
    now: datetime = SCENE,
    *,
    activities: list[dict[str, Any]] | None = None,
    members: list[dict[str, Any]] | None = None,
    settings: dict[str, Any] | None = None,
) -> ChoresEngine:
    """An engine with the sample household and chores, started on the morning of `now`'s chore day."""
    members = [dict(m) for m in (members or MEMBERS)]
    document = default_plan()
    document["settings"].update(settings or {})
    document["activities"] = [built(a, members) for a in (sample_activities() if activities is None else activities)]
    engine = ChoresEngine(document, default_log(), default_rewards(), members, tz=TZ, new_id=counter_ids())
    engine.set_first_day("monday", now)
    engine.start(now)
    return engine


def keys(engine: ChoresEngine, member: str, now: datetime, section: str | None = None) -> list[str]:
    """A member's occurrence keys on `now`'s chore day, optionally in one section."""
    return [i.occ.key for i in engine.items(now).get(member, []) if section is None or i.section == section]
```

`tests/test_chores_occurrences.py` (new):

```python
"""Turning the sample household's plan into check-offs (spec 7.6, 8.2, 8.4, 8.8)."""
from __future__ import annotations

from datetime import date

from custom_components.planavista.chores.occurrences import parse_key

from .chores_sample import SCENE, at, keys, once, plan, repeats, sample_engine


def _view(engine, member, now=SCENE):  # noqa: ANN001, ANN202
    day = engine.today(now)
    return {i.occ.key: engine.item_view(i, day) for i in engine.items(now).get(member, [])}


def test_tuesday_afternoon_for_everyone() -> None:
    engine = sample_engine()
    assert keys(engine, "alex", SCENE) == [
        "fix_the_gate_latch|alex|once|0",
        "kitchen_cleanup|alex|day:2026-10-13|0",
        "finance_and_budget|alex|week:2026-10-12|0",
        "change_the_furnace_filter|alex|rep:2026-10-01|0",
    ]
    assert keys(engine, "blair", SCENE) == [
        "clean_the_bathroom|blair|week:2026-10-12|0",
        "laundry|blair|week:2026-10-12|0",
    ]
    assert keys(engine, "casey", SCENE) == [
        "cat_care|casey|day:2026-10-13|0",
        "clean_out_the_garage|casey|once|0",
        "clean_out_the_garage|casey|once|1",
        "cat_care|casey|day:2026-10-13|1",
        "take_out_the_trash|casey|week:2026-10-12|0",
        "clean_the_bathroom|casey|week:2026-10-12|0",
        "yard_work|casey|week:2026-10-12|0",
    ]
    assert keys(engine, "dana", SCENE) == [
        "make_your_bed|dana|day:2026-10-13|0",
        "feed_the_fish|dana|day:2026-10-13|0",
        "tidy_toys|dana|day:2026-10-13|0",
        "set_the_table|dana|day:2026-10-13|0",
    ]


def test_items_without_a_band_sit_in_the_current_band() -> None:
    engine = sample_engine()
    dana = _view(engine, "dana")
    assert dana["tidy_toys|dana|day:2026-10-13|0"]["band"] is None
    # At 4:10 PM the current band is the afternoon, so Tidy toys comes after Feed the fish.
    assert list(dana).index("tidy_toys|dana|day:2026-10-13|0") == 2


def test_cat_care_twice_a_day_rotates_through_its_bands() -> None:
    casey = _view(sample_engine(), "casey")
    assert casey["cat_care|casey|day:2026-10-13|0"]["band"] == "morning"
    assert casey["cat_care|casey|day:2026-10-13|1"]["band"] == "evening"
    assert casey["cat_care|casey|day:2026-10-13|0"]["credit_minutes"] == 15.0
    assert casey["cat_care|casey|day:2026-10-13|0"]["stars"] == 1


def test_weekly_chores_on_picked_days_show_on_their_day() -> None:
    casey = _view(sample_engine(), "casey")
    trash = casey["take_out_the_trash|casey|week:2026-10-12|0"]
    assert (trash["section"], trash["band"], trash["planned"], trash["counted"]) == ("today", "evening", "2026-10-13", True)
    assert trash["due"] == "2026-10-19T03:00:00-05:00"  # Make it up: due when the week ends
    assert (trash["credit_minutes"], trash["stars"]) == (15.0, 1)


def test_a_pinned_weekly_chore_moves_to_this_week_after_its_day() -> None:
    laundry = _view(sample_engine(), "blair")["laundry|blair|week:2026-10-12|0"]
    assert (laundry["section"], laundry["from"], laundry["counted"]) == ("week", "2026-10-12", False)
    assert (laundry["credit_minutes"], laundry["stars"]) == (60.0, 4)


def test_strict_days_never_move_a_chore() -> None:
    engine = sample_engine(settings={"missed": "strict"})
    assert keys(engine, "blair", SCENE) == ["clean_the_bathroom|blair|week:2026-10-12|0"]
    trash = _view(engine, "casey")["take_out_the_trash|casey|week:2026-10-12|0"]
    assert trash["due"] == "2026-10-14T03:00:00-05:00"


def test_split_time_gives_each_person_their_share() -> None:
    engine = sample_engine(activities=[
        plan("clean_the_bathroom", "Clean the bathroom", ["blair", "casey"], 3, "week",
             split="shared", shares={"blair": 2, "casey": 1}),
    ])
    assert _view(engine, "blair")["clean_the_bathroom|blair|week:2026-10-12|0"]["credit_minutes"] == 120.0
    assert _view(engine, "casey")["clean_the_bathroom|casey|week:2026-10-12|0"]["credit_minutes"] == 60.0


def test_each_does_it_all_gives_everyone_the_full_time() -> None:
    engine = sample_engine(activities=[plan("tidy", "Tidy up", ["casey", "dana"], 0.5, "day")])
    assert _view(engine, "casey")["tidy|casey|day:2026-10-13|0"]["credit_minutes"] == 30.0
    assert _view(engine, "dana")["tidy|dana|day:2026-10-13|0"]["credit_minutes"] == 30.0


def test_floating_weekly_times() -> None:
    engine = sample_engine(activities=[plan("vacuum", "Vacuum", ["blair"], 1, "week", times=3)])
    assert keys(engine, "blair", SCENE) == [f"vacuum|blair|week:2026-10-12|{n}" for n in range(3)]
    assert _view(engine, "blair")["vacuum|blair|week:2026-10-12|0"]["credit_minutes"] == 20.0


def test_once_chores() -> None:
    engine = sample_engine(activities=[
        once("on_friday", "Wash the car", ["alex"], on="2026-10-16", estimate_minutes=45),
        once("any_time", "Clean the closet", ["alex"], estimate_minutes=60),
    ])
    assert keys(engine, "alex", SCENE) == ["any_time|alex|once|0"]
    friday = at(10, 16, 9)
    assert keys(engine, "alex", friday, "today") == ["on_friday|alex|once|0"]
    assert keys(engine, "alex", at(10, 17, 9)) == ["any_time|alex|once|0"]
    closet = _view(engine, "alex")["any_time|alex|once|0"]
    assert (closet["section"], closet["due"], closet["counted"]) == ("week", None, False)


def test_a_dated_once_chore_shows_in_today_every_day_and_counts_on_its_day() -> None:
    engine = sample_engine()
    latch = _view(engine, "alex")["fix_the_gate_latch|alex|once|0"]
    assert (latch["section"], latch["dated"], latch["counted"], latch["due_day"]) == ("today", True, False, "2026-10-16")
    friday = _view(engine, "alex", at(10, 16, 9))["fix_the_gate_latch|alex|once|0"]
    assert friday["counted"] is True
    assert "fix_the_gate_latch|alex|once|0" not in keys(engine, "alex", at(10, 17, 9))


def test_a_once_chore_by_a_time() -> None:
    engine = sample_engine(activities=[
        once("forms", "Sign the school forms", ["alex"], by="2026-10-14", by_time="08:00", estimate_minutes=10),
    ])
    forms = _view(engine, "alex")["forms|alex|once|0"]
    assert forms["due"] == "2026-10-14T08:00:00-05:00"
    assert forms["due_day"] == "2026-10-14"


def test_repeats_on_their_day_then_this_week() -> None:
    engine = sample_engine()
    saturday = at(10, 17, 10)
    rake = _view(engine, "casey", saturday)["rake_the_leaves|casey|rep:2026-10-17|0"]
    assert (rake["section"], rake["planned"], rake["credit_minutes"], rake["stars"]) == ("today", "2026-10-17", 60.0, 4)
    sunday = _view(engine, "casey", at(10, 18, 10))["rake_the_leaves|casey|rep:2026-10-17|0"]
    assert (sunday["section"], sunday["from"]) == ("week", "2026-10-17")
    # The rule ends on November 30: no instance after the 28th.
    assert [k for k in keys(engine, "casey", at(12, 5, 10)) if k.startswith("rake")] == []


def test_a_monthly_chore_shows_all_month() -> None:
    engine = sample_engine()
    for moment in (at(10, 1, 9), SCENE, at(10, 31, 20)):
        filters = [k for k in keys(engine, "alex", moment) if k.startswith("change_the_furnace_filter")]
        assert filters == ["change_the_furnace_filter|alex|rep:2026-10-01|0"]
    november = _view(engine, "alex", at(11, 2, 9))
    assert "change_the_furnace_filter|alex|rep:2026-11-01|0" in november
    assert november["change_the_furnace_filter|alex|rep:2026-11-01|0"]["window"] == "month"


def test_a_weekly_repeat_with_a_week_window() -> None:
    engine = sample_engine(activities=[
        repeats("mop", "Mop the floors", ["blair"], "FREQ=WEEKLY;INTERVAL=2;BYDAY=WE", "2026-10-14", "period", 30),
    ])
    # Nothing shows before the chore starts on Wednesday; then it shows until the week ends.
    assert keys(engine, "blair", SCENE) == []
    assert keys(engine, "blair", at(10, 14, 9)) == ["mop|blair|rep:2026-10-14|0"]
    assert keys(engine, "blair", at(10, 18, 9)) == ["mop|blair|rep:2026-10-14|0"]
    assert keys(engine, "blair", at(10, 20, 9)) == []
    assert keys(engine, "blair", at(10, 26, 9)) == ["mop|blair|rep:2026-10-28|0"]


def test_due_times_follow_daylight_saving_changes() -> None:
    engine = sample_engine(activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    halloween = _view(engine, "casey", at(10, 31, 9))["cat_care|casey|day:2026-10-31|0"]
    assert halloween["due"] == "2026-11-01T03:00:00-06:00"


def test_planning_a_day_only_moves_where_it_shows() -> None:
    engine = sample_engine()
    yard = "yard_work|casey|week:2026-10-12|0"
    engine.override(SCENE, key=yard, by="casey", planned_day=date(2026, 10, 17))
    assert yard not in keys(engine, "casey", SCENE)
    saturday = _view(engine, "casey", at(10, 17, 9))[yard]
    assert (saturday["section"], saturday["counted"]) == ("today", True)
    sunday = _view(engine, "casey", at(10, 18, 9))[yard]
    assert (sunday["section"], sunday["from"], sunday["due"]) == ("week", "2026-10-17", "2026-10-19T03:00:00-05:00")


def test_more_time_keeps_a_chore_on_the_board_into_next_week() -> None:
    engine = sample_engine()
    yard = "yard_work|casey|week:2026-10-12|0"
    engine.override(SCENE, key=yard, by="blair", due=date(2026, 10, 25))
    monday = _view(engine, "casey", at(10, 19, 9))
    assert monday[yard]["due"] == "2026-10-26T03:00:00-05:00"
    assert "yard_work|casey|week:2026-10-19|0" in monday


def test_handing_a_chore_to_someone_else() -> None:
    engine = sample_engine()
    trash = "take_out_the_trash|casey|week:2026-10-12|0"
    engine.override(SCENE, key=trash, by="alex", assignee="blair")
    assert trash not in keys(engine, "casey", SCENE)
    handed = _view(engine, "blair")[trash]
    assert (handed["member"], handed["owner"]) == ("blair", "casey")


def test_an_excused_chore_is_not_due() -> None:
    engine = sample_engine()
    bed = "make_your_bed|dana|day:2026-10-13|0"
    engine.override(SCENE, key=bed, by="blair", excused=True, note="Sick day")
    assert _view(engine, "dana")[bed]["status"] == "excused"
    assert engine.board(SCENE)["members"]["dana"]["today"]["due"] == 3


def test_away_days_have_nothing_due() -> None:
    members = [dict(m) for m in sample_engine().members]
    for member in members:
        if member["id"] == "dana":
            member["away"] = [{"from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}]
    engine = sample_engine(members=members)
    statuses = {v["status"] for v in _view(engine, "dana").values()}
    assert statuses == {"away"}
    assert engine.board(SCENE)["members"]["dana"]["today"]["due"] == 0
    assert engine.board(SCENE)["members"]["dana"]["away"]["note"] == "At Grandma's"


def test_keys_name_the_same_occurrence_everywhere() -> None:
    engine = sample_engine()
    gen = engine.generator()
    for found in engine.items(SCENE).values():
        for item in found:
            assert gen.from_key(engine.activity(item.occ.chore), item.occ.key).key == item.occ.key
    assert parse_key("cat_care|casey|day:2026-10-13|1") == ("cat_care", "casey", "day:2026-10-13", 1)
    assert parse_key("cat_care|casey") is None
    # Keys the plan doesn't make are refused.
    assert gen.from_key(engine.activity("cat_care"), "cat_care|casey|day:2026-10-13|2") is None
    assert gen.from_key(engine.activity("cat_care"), "cat_care|dana|day:2026-10-13|0") is None
    assert gen.from_key(engine.activity("laundry"), "laundry|blair|week:2026-10-13|0") is None
    assert gen.from_key(engine.activity("rake_the_leaves"), "rake_the_leaves|casey|rep:2026-10-18|0") is None


def test_plan_only_and_unassigned_chores_never_reach_the_board() -> None:
    engine = sample_engine(activities=[
        plan("homework", "Homework", ["casey"], 1, "day", on_board=False),
        plan("soccer", "Soccer practice", ["casey"], 1.5, "week", set_time="17:30"),
        plan("wash_the_car", "Wash the car", [], 1, "week"),
    ])
    assert keys(engine, "casey", SCENE) == []
    assert engine.needs_a_look() == [{"kind": "unassigned", "chore": "wash_the_car", "name": "Wash the car"}]
```

`tests/test_chores_engine.py` (new):

```python
"""Check-offs, approvals, requests, overrides, plan edits, and stars (spec 8.3 to 8.8, 8.12, 8.15)."""
from __future__ import annotations

from datetime import date, timedelta

import pytest

from custom_components.planavista.chores.engine import ChoresEngine, with_away, without_away
from custom_components.planavista.chores.model import ChoreError

from .chores_sample import SCENE, at, keys, once, plan, sample_engine

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"
YARD = "yard_work|casey|week:2026-10-12|0"
CAT_MORNING = "cat_care|casey|day:2026-10-13|0"
CAT_EVENING = "cat_care|casey|day:2026-10-13|1"


def _item(engine: ChoresEngine, key: str, now=SCENE):  # noqa: ANN001, ANN202
    item = engine.find_item(key, now)
    assert item is not None, key
    return item


def test_an_automation_completes_the_oldest_open_one() -> None:
    engine = sample_engine()
    out = engine.complete(at(10, 13, 19, 40), chore="take_out_the_trash", member="casey", by="automation", source="automation")
    assert (out.result, out.data["occurrence"], out.data["stars"]) == ("done", TRASH, 1)
    completion = engine.log["completions"][-1]
    assert completion | {"id": None} == {
        "id": None, "occurrence": TRASH, "chore": "take_out_the_trash", "member": "casey", "done_by": "casey",
        "by": "automation", "at": "2026-10-13T19:40:00-05:00", "source": "automation", "user": None,
        "state": "done", "review": None, "credit_minutes": 15.0, "stars": 1,
    }
    assert engine.balance("casey") == 1
    assert engine.chore_minutes("casey") == 15.0
    assert [(e.type, e.member, e.data["state"]) for e in out.events] == [("completed", "casey", "done")]
    assert out.changed == {"log", "rewards"}


def test_the_oldest_open_one_is_overdue_then_today_then_this_week() -> None:
    engine = sample_engine()
    first = engine.complete(at(10, 13, 7), chore="cat_care", member="casey", by="automation", source="automation")
    later = engine.complete(at(10, 13, 19), chore="cat_care", member="casey", by="automation", source="automation")
    assert (first.data["occurrence"], later.data["occurrence"]) == (CAT_MORNING, CAT_EVENING)
    # Laundry from Monday waits in This week; Thursday's isn't open yet.
    out = engine.complete(SCENE, chore="laundry", member="blair", by="blair", source="tablet")
    assert out.data["occurrence"] == "laundry|blair|week:2026-10-12|0"


def test_a_repeat_within_a_minute_is_a_no_op() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 7, 0), chore="cat_care", member="casey", by="automation", source="automation")
    again = engine.complete(at(10, 13, 7, 0) + timedelta(seconds=40), chore="cat_care", member="casey", by="automation", source="automation")
    assert (again.result, again.data["occurrence"], again.events) == ("already_done", CAT_MORNING, [])
    assert engine.balance("casey") == 1


def test_the_same_occurrence_twice_credits_once() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, key=TRASH, by="casey", source="tablet").result == "done"
    again = engine.complete(SCENE + timedelta(hours=1), key=TRASH, by="automation", source="automation")
    assert (again.result, again.events, again.changed) == ("already_done", [], set())
    assert engine.balance("casey") == 1


def test_nothing_open_is_not_an_error() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, chore="groceries", member="alex", by="automation", source="automation").result == "nothing_open"
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    later = engine.complete(SCENE + timedelta(minutes=5), chore="take_out_the_trash", member="casey", by="automation", source="automation")
    assert later.result == "already_done"
    yesterday = "cat_care|casey|day:2026-10-12|0"
    assert engine.complete(SCENE, key=yesterday, by="casey", source="tablet").result == "nothing_open"


def test_a_check_off_after_its_due_time_is_too_late() -> None:
    engine = sample_engine(activities=[
        once("forms", "Sign the school forms", ["alex"], by="2026-10-14", by_time="08:00", estimate_minutes=10),
    ])
    out = engine.complete(at(10, 14, 9), key="forms|alex|once|0", by="alex", source="tablet")
    assert out.result == "nothing_open"


def test_who_needs_an_ok() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, key=FISH, by="dana", source="tablet").result == "pending"  # every chore
    assert engine.complete(SCENE, key=TRASH, by="casey", source="tablet").result == "done"  # not marked
    bathroom = "clean_the_bathroom|casey|week:2026-10-12|0"
    assert engine.complete(SCENE, key=bathroom, by="casey", source="tablet").result == "pending"  # marked
    assert engine.complete(SCENE, key="clean_the_bathroom|blair|week:2026-10-12|0", by="blair", source="tablet").result == "done"
    bed = "make_your_bed|dana|day:2026-10-13|0"
    assert engine.complete(SCENE, key=bed, by="automation", source="automation", approve=True).result == "done"


def test_done_by_someone_else_credits_the_doer() -> None:
    engine = sample_engine()
    out = engine.complete(SCENE, key=TRASH, done_by="blair", by="blair", source="tablet")
    assert out.result == "done"
    assert out.data["stars"] == 0  # Blair doesn't earn stars
    assert engine.chore_minutes("blair") == 15.0 and engine.chore_minutes("casey") == 0
    assert _item(engine, TRASH).status == "done"
    with pytest.raises(ChoreError) as err:
        engine.complete(SCENE, key=CAT_MORNING, done_by="erin", by="casey", source="tablet")
    assert err.value.code == "unknown_member"


def test_approving_grants_the_stars() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    assert engine.balance("dana") == 0
    [request] = engine.open_requests()
    assert request | {"id": None} == {
        "id": None, "kind": "completion", "member": "dana", "done_by": "dana", "chore": "feed_the_fish",
        "name": "Feed the fish", "occurrence": FISH, "at": "2026-10-13T16:10:00-05:00", "stars": 1,
    }
    out = engine.review(SCENE + timedelta(minutes=20), request_id=request["id"], allow=True, by="alex", source="notification")
    assert out.result == "approved"
    assert engine.balance("dana") == 1
    assert engine.log["completions"][-1]["review"] == {
        "by": "alex", "at": "2026-10-13T16:30:00-05:00", "note": None, "source": "notification",
    }
    assert [e.type for e in out.events] == ["approved"]
    assert engine.open_requests() == []


def test_sending_back_reopens_it_with_the_note() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    out = engine.review(SCENE, request_id=request["id"], allow=False, by="blair", note="edges")
    assert out.result == "sent_back"
    item = _item(engine, FISH)
    assert item.status == "sent_back"
    assert engine.item_view(item, SCENE.date())["note"] == "edges"
    assert engine.description(item, SCENE.date()) == "Sent back: edges"
    assert engine.chore_minutes("dana") == 0
    assert engine.complete(SCENE + timedelta(minutes=5), key=FISH, by="dana", source="tablet").result == "pending"


def test_undo_reverses_only_what_that_check_off_earned() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    out = engine.undo(SCENE + timedelta(minutes=1), key=TRASH, by="casey", source="tablet")
    assert out.result == "undone"
    assert engine.balance("casey") == 0
    assert [e["reason"] for e in engine.rewards["ledger"]] == ["chore", "undo"]
    assert engine.log["completions"][-1]["state"] == "undone"
    assert _item(engine, TRASH).status == "open"
    assert [e.type for e in out.events] == ["undone"]
    assert engine.undo(SCENE, key=TRASH, by="casey", source="tablet").result == "nothing_to_undo"


def test_undo_of_a_check_off_waiting_for_ok_takes_nothing() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.undo(SCENE, chore="feed_the_fish", member="dana", by="dana", source="tablet")
    assert engine.rewards["ledger"] == []
    assert engine.open_requests() == []


def test_only_todays_check_offs_can_be_undone() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=YARD, by="casey", source="tablet")
    wednesday = at(10, 14, 9)
    engine.catch_up(wednesday)
    assert engine.undo(wednesday, key=YARD, by="casey", source="tablet").result == "nothing_to_undo"


def test_asking_for_more_time_moves_the_due_date_when_allowed() -> None:
    engine = sample_engine()
    out = engine.request(SCENE, kind="more_time", key=YARD, by="casey", until=date(2026, 10, 25))
    assert engine.request(SCENE, kind="more_time", key=YARD, by="casey", until=date(2026, 10, 25)).data == out.data
    [request] = engine.open_requests()
    assert (request["kind"], request["until"], request["name"]) == ("more_time", "2026-10-25", "Yard work")
    engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert _item(engine, YARD).occ.due.isoformat() == "2026-10-26T03:00:00-05:00"
    for until in (date(2026, 10, 18), date(2026, 12, 31), None):
        with pytest.raises(ChoreError) as err:
            engine.request(SCENE, kind="more_time", key=TRASH, by="casey", until=until)
        assert err.value.code == "invalid_until"


def test_asking_to_skip_excuses_it_when_allowed() -> None:
    engine = sample_engine()
    engine.request(SCENE, kind="skip", key=YARD, by="casey")
    [request] = engine.open_requests()
    assert engine.review(SCENE, request_id=request["id"], allow=False, by="alex").result == "declined"
    assert _item(engine, YARD).status == "open"
    engine.request(SCENE, kind="skip", key=YARD, by="casey")
    [request] = engine.open_requests()
    assert engine.review(SCENE, request_id=request["id"], allow=True, by="alex").result == "allowed"
    assert _item(engine, YARD).status == "excused"
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="alex")
    assert err.value.code == "unknown_request"


def test_requests_need_an_open_item() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    with pytest.raises(ChoreError) as err:
        engine.request(SCENE, kind="skip", key=TRASH, by="casey")
    assert err.value.code == "not_open"


def test_planning_a_day_stays_within_the_week() -> None:
    engine = sample_engine()
    for day in (date(2026, 10, 12), date(2026, 10, 19)):
        with pytest.raises(ChoreError) as err:
            engine.override(SCENE, key=YARD, by="casey", planned_day=day)
        assert err.value.code == "invalid_planned_day"
    with pytest.raises(ChoreError) as err:
        engine.override(SCENE, key=YARD, by="alex")
    assert err.value.code == "nothing_to_change"


def test_excusing_a_sick_day() -> None:
    engine = sample_engine()
    out = engine.excuse(SCENE, chore="cat_care", member="casey", by="blair", note="Sick day")
    assert out.data["occurrences"] == [CAT_MORNING, CAT_EVENING]
    assert {_item(engine, k).status for k in (CAT_MORNING, CAT_EVENING)} == {"excused"}
    tomorrow = engine.excuse(SCENE, chore="cat_care", member="casey", by="blair", day=date(2026, 10, 14))
    assert tomorrow.data["occurrences"] == ["cat_care|casey|day:2026-10-14|0", "cat_care|casey|day:2026-10-14|1"]


def test_a_new_chore_gets_an_id_and_its_creator() -> None:
    engine = sample_engine()
    out = engine.save_activity(SCENE, {"name": "Laundry", "schedule": "once", "assignees": ["casey"],
                                       "once": {"estimate_minutes": 20}}, by="alex", source="tablet")
    activity = out.data["activity"]
    assert activity["id"] == "laundry_2"
    assert activity["created"] == {"by": "alex", "source": "tablet", "at": "2026-10-13T16:10:00-05:00"}
    assert "laundry_2|casey|once|0" in keys(engine, "casey", SCENE)
    with pytest.raises(ChoreError) as err:
        engine.save_activity(SCENE, {"name": "Late", "schedule": "once", "assignees": [],
                                     "once": {"on": "2026-10-12"}}, by="alex", source="tablet")
    assert (err.value.code, err.value.detail) == ("invalid_once", "Pick today or a later day.")


def test_an_edit_applies_to_open_items_and_keeps_check_offs() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=CAT_EVENING, by="casey", source="tablet")
    rev = engine.activity("cat_care")["rev"]
    engine.save_activity(SCENE, {"times": 1, "time_of_day": ["morning"]}, activity_id="cat_care", rev=rev, by="alex", source="tablet")
    found = {i.occ.key: i for i in engine.items(SCENE)["casey"]}
    assert found[CAT_MORNING].occ.credit_minutes == 30.0
    assert found[CAT_EVENING].status == "done" and found[CAT_EVENING].occ.credit_minutes == 15.0
    with pytest.raises(ChoreError) as err:
        engine.save_activity(SCENE, {"times": 2}, activity_id="cat_care", rev=rev, by="alex", source="tablet")
    assert err.value.code == "changed"


def test_deleting_a_chore_drops_its_open_items() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    engine.delete_activity("yard_work")
    assert YARD not in keys(engine, "casey", SCENE)
    assert engine.balance("casey") == 1
    with pytest.raises(ChoreError):
        engine.delete_activity("yard_work")


def test_removing_someone_unassigns_their_chores() -> None:
    engine = sample_engine()
    engine.unassign_member("casey")
    engine.set_members([m for m in engine.members if m["id"] != "casey"])
    bathroom = engine.activity("clean_the_bathroom")
    assert (bathroom["assignees"], bathroom["shares"], bathroom["minimum"]["hours"]) == (["blair"], {"blair": 1.0}, 1.0)
    assert engine.activity("yard_work")["assignees"] == []
    assert {"kind": "unassigned", "chore": "yard_work", "name": "Yard work"} in engine.needs_a_look()
    assert "casey" not in engine.items(SCENE)


def test_a_once_chore_finishes_with_its_last_session() -> None:
    engine = sample_engine()
    garage = engine.activity("clean_out_the_garage")
    engine.complete(SCENE, key="clean_out_the_garage|casey|once|0", by="casey", source="tablet")
    assert garage["finished_at"] is None
    out = engine.complete(SCENE, key="clean_out_the_garage|casey|once|1", by="casey", source="tablet")
    assert garage["finished_at"] == "2026-10-13T16:10:00-05:00" and "plan" in out.changed
    # It stays in Done today until the day ends, then leaves the board.
    later = [(i.occ.key, i.status) for i in engine.items(SCENE + timedelta(hours=1))["casey"] if i.occ.chore == "clean_out_the_garage"]
    assert later == [("clean_out_the_garage|casey|once|0", "pending"), ("clean_out_the_garage|casey|once|1", "pending")]
    assert not [k for k in keys(engine, "casey", at(10, 14, 9)) if k.startswith("clean_out")]
    engine.undo(SCENE, key="clean_out_the_garage|casey|once|1", by="casey", source="tablet")
    assert garage["finished_at"] is None


def test_rewards_wait_for_an_ok_and_take_the_stars_when_given() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=5, reason="Helped a neighbor", by="blair")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎲", "cost": 4, "who": ["casey", "dana"]})
    out = engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    assert out.result == "requested"
    [request] = engine.open_requests()
    assert (request["kind"], request["cost"], request["balance"]) == ("redemption", 4, 5)
    assert engine.balance("casey") == 5
    given = engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert given.result == "given" and engine.balance("casey") == 1
    assert [(e.type, e.data["reward_name"], e.data["stars"]) for e in given.events] == [("redeemed", "Pick the weekend game", 4)]
    with pytest.raises(ChoreError) as err:
        engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    assert err.value.code == "not_enough_stars"


def test_a_reward_without_an_ok_is_given_at_once() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Great week", by="alex")
    engine.save_reward({"name": "Sticker", "cost": 2, "needs_ok": False})
    out = engine.redeem(SCENE, member="dana", reward="sticker", by="dana", source="tablet")
    assert out.result == "given" and engine.balance("dana") == 1
    assert engine.open_requests() == []
    with pytest.raises(ChoreError) as err:
        engine.redeem(SCENE, member="blair", reward="sticker", by="blair", source="tablet")
    assert err.value.code == "not_enough_stars"


def test_stars_by_hand_need_a_reason_and_never_go_below_zero() -> None:
    engine = sample_engine()
    assert engine.award_stars(SCENE, member="casey", stars=5, reason="Helped a neighbor", by="blair").data == {"balance": 5}
    assert engine.award_stars(SCENE, member="casey", stars=-2, reason="Left the bike out", by="blair").data == {"balance": 3}
    for stars, reason, code in ((-4, "Too many", "not_enough_stars"), (0, "Nothing", "invalid_stars"), (2, " ", "reason_required")):
        with pytest.raises(ChoreError) as err:
            engine.award_stars(SCENE, member="casey", stars=stars, reason=reason, by="blair")
        assert err.value.code == code


def test_a_redemption_waits_until_approved_and_checks_the_balance_again() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=4, reason="Bonus", by="blair")
    engine.save_reward({"name": "Movie night pick", "cost": 4})
    engine.redeem(SCENE, member="casey", reward="movie_night_pick", by="casey", source="tablet")
    engine.award_stars(SCENE, member="casey", stars=-1, reason="Oops", by="blair")
    [request] = engine.open_requests()
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert err.value.code == "not_enough_stars"


def test_deleting_a_reward_declines_what_was_waiting() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=4, reason="Bonus", by="blair")
    engine.save_reward({"name": "Movie night pick", "cost": 4})
    engine.redeem(SCENE, member="casey", reward="movie_night_pick", by="casey", source="tablet")
    engine.delete_reward("movie_night_pick")
    assert engine.open_requests() == []
    assert engine.balance("casey") == 4


def test_the_to_do_list_puts_open_items_first_and_keeps_todays_check_offs() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=CAT_MORNING, by="casey", source="tablet")
    engine.complete(SCENE, key="clean_the_bathroom|casey|week:2026-10-12|0", by="casey", source="tablet")
    items = engine.todo_items("casey", SCENE)
    assert [(i.occ.key, i.status) for i in items] == [
        ("clean_out_the_garage|casey|once|0", "open"),
        ("clean_out_the_garage|casey|once|1", "open"),
        (CAT_EVENING, "open"),
        (TRASH, "open"),
        (YARD, "open"),
        (CAT_MORNING, "done"),
        ("clean_the_bathroom|casey|week:2026-10-12|0", "pending"),
    ]
    today = SCENE.date()
    assert [engine.description(i, today) for i in items] == [
        "Due Sun", "Due Sun", None, None, "This week", None, "Waiting for a parent's OK",
    ]


def test_away_ranges_join_and_split() -> None:
    spans = with_away([], date(2026, 10, 14), date(2026, 10, 15), "At Grandma's")
    spans = with_away(spans, date(2026, 10, 16), date(2026, 10, 17), None)
    assert spans == [{"from": "2026-10-14", "to": "2026-10-17", "note": "At Grandma's"}]
    assert without_away(spans, date(2026, 10, 16), None) == [{"from": "2026-10-14", "to": "2026-10-15", "note": "At Grandma's"}]
    assert without_away(spans, date(2026, 10, 15), date(2026, 10, 15)) == [
        {"from": "2026-10-14", "to": "2026-10-14", "note": "At Grandma's"},
        {"from": "2026-10-16", "to": "2026-10-17", "note": "At Grandma's"},
    ]


def test_a_household_without_chores_is_quiet() -> None:
    engine = sample_engine(activities=[plan("x", "X", [], 1, "day")])
    board = engine.board(SCENE)
    assert board["household"] == {"due": 0, "done": 0, "pending": 0}
    assert board["members"]["casey"]["week"]["percent"] is None


def test_a_busy_household_stays_quick() -> None:  # Review Focus 1
    import time

    members = [{"id": f"p{n}", "name": f"Person {n}", "parent": n < 2, "age_group": "teen", "needs_ok_for": "marked",
                "stars": True, "order": n} for n in range(8)]
    ids = [m["id"] for m in members]
    activities = [plan(f"daily_{n}", f"Daily {n}", ids[n % 8: n % 8 + 2], 0.5, "day", times=2, time_of_day=["morning", "evening"])
                  for n in range(25)]
    activities += [plan(f"weekly_{n}", f"Weekly {n}", ids[:4], 2, "week", split="shared",
                        shares={i: 0.5 for i in ids[:4]}, days=["mon", "thu"]) for n in range(15)]
    engine = sample_engine(activities=activities, members=members)
    started = time.perf_counter()
    board = engine.board(SCENE)
    engine.complete(SCENE, chore="daily_0", member="p0", by="p0", source="tablet")
    engine.board(SCENE)
    assert time.perf_counter() - started < 2.0
    assert sum(len(m["items"]) for m in board["members"].values()) > 100
```

`tests/test_chores_rollover.py` (new):

```python
"""The day boundary: auto-approve, missed policies, summaries, catching up, streaks (spec 8.9 to 8.14)."""
from __future__ import annotations

from datetime import date
from zoneinfo import ZoneInfo

from custom_components.planavista.chores.engine import ChoresEngine

from .chores_sample import at, keys, plan, sample_engine

MONDAY = at(10, 12, 9)
DANA_DAILY = ("make_your_bed", "feed_the_fish", "tidy_toys", "set_the_table")


def _summary(engine: ChoresEngine, member: str, period: str) -> dict:
    return next(s for s in engine.log["summaries"] if s["member"] == member and s["period"] == period)


def _dana_does_everything(engine: ChoresEngine, day: date) -> None:
    now = at(day.month, day.day, 18)
    for chore in DANA_DAILY:
        engine.complete(now, key=f"{chore}|dana|day:{day.isoformat()}|0", by="dana", source="tablet", approve=True)


def test_make_it_up_moves_a_missed_pinned_chore_to_this_week() -> None:
    engine = sample_engine(MONDAY)
    out = engine.catch_up(at(10, 13, 9))
    missed = [e.data["occurrence"] for e in out.events if e.type == "missed"]
    assert "laundry|blair|week:2026-10-12|0" not in missed
    item = engine.find_item("laundry|blair|week:2026-10-12|0", at(10, 13, 9))
    assert (item.section, item.moved_from) == ("week", date(2026, 10, 12))
    assert engine.description(item, date(2026, 10, 13)) == "From Mon"


def test_strict_days_miss_it_at_the_end_of_its_day() -> None:
    engine = sample_engine(MONDAY, settings={"missed": "strict"})
    out = engine.catch_up(at(10, 13, 9))
    missed = {e.data["occurrence"]: e for e in out.events if e.type == "missed"}
    assert missed["laundry|blair|week:2026-10-12|0"].data == {
        "chore": "laundry", "chore_name": "Laundry", "occurrence": "laundry|blair|week:2026-10-12|0",
        "member": "blair", "done_by": None, "source": None, "stars": 0, "state": "missed",
    }
    assert "laundry|blair|week:2026-10-12|0" not in keys(engine, "blair", at(10, 13, 9))
    assert "laundry|blair|week:2026-10-12|0" in _summary(engine, "blair", "day:2026-10-12")["missed"]


def test_carry_it_over_keeps_it_overdue_until_done() -> None:
    engine = sample_engine(MONDAY, settings={"missed": "carry_over"})
    out = engine.catch_up(at(10, 13, 9))
    assert [e for e in out.events if e.type == "missed"] == []
    bed = "make_your_bed|dana|day:2026-10-12|0"
    item = engine.find_item(bed, at(10, 13, 9))
    assert (item.section, item.overdue_since, item.counted) == ("overdue", date(2026, 10, 12), True)
    assert engine.description(item, date(2026, 10, 13)) == "Overdue since Mon"
    assert _summary(engine, "dana", "day:2026-10-12")["carried"] == [
        "make_your_bed|dana|day:2026-10-12|0", "feed_the_fish|dana|day:2026-10-12|0",
        "set_the_table|dana|day:2026-10-12|0", "tidy_toys|dana|day:2026-10-12|0",
    ]
    # The oldest open one comes first, and doing it late still counts.
    assert engine.open_item("make_your_bed", "dana", at(10, 13, 9)).occ.key == bed
    assert engine.complete(at(10, 13, 9), chore="make_your_bed", member="dana", by="dana", source="tablet").data["occurrence"] == bed
    engine.catch_up(at(10, 14, 9))
    assert bed not in {c["key"] for c in engine.log["carried"]}
    assert "feed_the_fish|dana|day:2026-10-12|0" in {c["key"] for c in engine.log["carried"]}


def test_a_new_missed_policy_starts_at_the_next_day_boundary() -> None:
    engine = sample_engine(at(10, 13, 9))
    engine.save_settings(at(10, 13, 9), {"missed": "strict"})
    assert engine.log["policy"] == {"before": "make_up", "since": "2026-10-14"}
    assert engine.policy_on(date(2026, 10, 13)) == "make_up"
    out = engine.catch_up(at(10, 14, 9))
    assert "take_out_the_trash|casey|week:2026-10-12|0" not in [e.data["occurrence"] for e in out.events]
    assert engine.find_item("take_out_the_trash|casey|week:2026-10-12|0", at(10, 14, 9)).moved_from == date(2026, 10, 13)
    thursday = engine.find_item("laundry|blair|week:2026-10-12|1", at(10, 15, 9))
    assert thursday.occ.due.isoformat() == "2026-10-16T03:00:00-05:00"


def test_catching_up_after_an_outage_runs_each_boundary_in_order() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(at(10, 12, 22), key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    out = engine.catch_up(at(10, 14, 9))  # off from Monday 11 PM to Wednesday 9 AM
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-13", "2026-10-14T03:00:00-05:00")
    assert out.events[0].type == "approved"
    assert out.events[0].data["occurrence"] == "feed_the_fish|dana|day:2026-10-12|0"
    fish = next(c for c in engine.log["completions"] if c["occurrence"] == "feed_the_fish|dana|day:2026-10-12|0")
    assert fish["review"] == {"by": "auto", "at": "2026-10-13T03:00:00-05:00", "note": None, "source": "auto"}
    missed_days = [e.data["occurrence"].split("|")[2] for e in out.events if e.type == "missed"]
    assert missed_days == sorted(missed_days)
    assert {"day:2026-10-12", "day:2026-10-13"} <= set(missed_days)
    periods = [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"]
    assert periods == ["day:2026-10-12", "day:2026-10-13"]
    # Nothing runs twice, even if the clock jumps back.
    assert engine.catch_up(at(10, 14, 9)).events == []
    assert engine.catch_up(at(10, 13, 9)).events == []
    assert len(engine.log["summaries"]) == 8


def test_a_25_hour_day_rolls_over_once_at_3_am() -> None:
    engine = sample_engine(at(10, 31, 9), activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    engine.catch_up(at(11, 1, 2, 30))  # 2:30 AM: the clocks fell back at 2:00, still Saturday's chore day
    assert engine.log["last_day"] == "2026-10-30"
    engine.catch_up(at(11, 1, 3, 0))
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-31", "2026-11-01T03:00:00-06:00")
    assert engine.next_boundary(at(11, 1, 9)).isoformat() == "2026-11-02T03:00:00-06:00"


def test_a_23_hour_day_rolls_over_once_at_3_am() -> None:
    engine = sample_engine(at(3, 7, 9), activities=[plan("cat_care", "Cat care", ["casey"], 0.5, "day")])
    engine.catch_up(at(3, 8, 3, 0))
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-03-07", "2026-03-08T03:00:00-05:00")


def test_a_time_zone_change_moves_the_next_boundary() -> None:
    engine = sample_engine(MONDAY)
    engine.set_time_zone(ZoneInfo("America/Los_Angeles"))
    assert engine.next_boundary(MONDAY).isoformat() == "2026-10-13T03:00:00-07:00"


def test_a_new_first_day_starts_at_the_next_week() -> None:
    engine = sample_engine(at(10, 13, 9))
    assert engine.set_first_day("sunday", at(10, 13, 9)) is True
    assert engine.clock.week_start(date(2026, 10, 16)) == date(2026, 10, 12)
    assert engine.clock.week_start(date(2026, 10, 20)) == date(2026, 10, 19)
    assert engine.clock.week_start(date(2026, 10, 27)) == date(2026, 10, 25)
    assert engine.set_first_day("sunday", at(10, 13, 10)) is False


def test_waiting_for_ok_stays_when_auto_approve_is_off() -> None:
    engine = sample_engine(MONDAY, settings={"auto_approve": "never"})
    engine.complete(MONDAY, key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    assert [r["kind"] for r in engine.open_requests()] == ["completion"]
    assert engine.balance("dana") == 0


def test_summaries_record_the_day() -> None:
    engine = sample_engine(MONDAY)
    engine.complete(MONDAY, key="make_your_bed|dana|day:2026-10-12|0", by="dana", source="tablet")
    engine.complete(MONDAY, key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(10, 13, 9))
    summary = _summary(engine, "dana", "day:2026-10-12")
    assert summary | {"missed": None, "chores": None} == {
        "member": "dana", "period": "day:2026-10-12", "due": 4, "done": 2, "pending": 0,
        "minutes_due": 35.0, "minutes_done": 10.0, "minutes_pending": 0.0, "missed": None,
        "carried": [], "excused": [], "away": False, "closed": False, "chores": None,
    }
    # The check-off still waiting at the end of the day was approved before the summary.
    assert summary["missed"] == ["set_the_table|dana|day:2026-10-12|0", "tidy_toys|dana|day:2026-10-12|0"]
    assert summary["chores"]["make_your_bed"] == {"due": 1, "done": 1}


def test_streaks_count_closed_days_and_skip_away_and_empty_ones() -> None:
    engine = sample_engine(at(10, 5, 9))
    for day in (5, 6):
        _dana_does_everything(engine, date(2026, 10, day))
    engine.set_members([
        {**m, "away": [{"from": "2026-10-07", "to": "2026-10-07", "note": None}]} if m["id"] == "dana" else m
        for m in engine.members
    ])
    _dana_does_everything(engine, date(2026, 10, 8))
    engine.catch_up(at(10, 9, 9))
    assert engine.streak("dana", at(10, 9, 9)) == 3  # Mon, Tue, (away Wed), Thu
    _dana_does_everything(engine, date(2026, 10, 9))
    assert engine.streak("dana", at(10, 9, 20)) == 4  # today counts once everything is done
    engine.catch_up(at(10, 11, 9))  # Saturday was missed
    assert engine.streak("dana", at(10, 11, 9)) == 0
    assert engine.chore_streak("dana", "make_your_bed", at(10, 10, 9)) == 4


def test_a_member_with_nothing_due_keeps_their_streak() -> None:
    engine = sample_engine(at(10, 5, 9), activities=[plan("bed", "Make your bed", ["dana"], 5 / 60, "day", days=["mon", "wed"])])
    engine.complete(at(10, 5, 9), key="bed|dana|day:2026-10-05|0", by="dana", source="tablet", approve=True)
    engine.complete(at(10, 7, 9), key="bed|dana|day:2026-10-07|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(10, 8, 9))
    assert engine.streak("dana", at(10, 8, 9)) == 2


def test_week_streaks_count_finished_weeks() -> None:
    engine = sample_engine(at(10, 5, 9), activities=[plan("yard", "Yard work", ["casey"], 1, "week")])
    engine.complete(at(10, 6, 9), key="yard|casey|week:2026-10-05|0", by="casey", source="tablet")
    engine.catch_up(at(10, 13, 9))
    assert _summary(engine, "casey", "week:2026-10-05")["closed"] is True
    assert engine.week_streak("casey", at(10, 13, 9)) == 1
    engine.catch_up(at(10, 20, 9))
    assert engine.week_streak("casey", at(10, 20, 9)) == 0


def test_progress_today_this_week_and_shared_time() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 8), key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet")
    engine.complete(at(10, 13, 9), key="clean_the_bathroom|casey|week:2026-10-12|0", by="casey", source="tablet")
    board = engine.board(at(10, 13, 16, 10))
    casey = board["members"]["casey"]
    assert casey["today"] == {"due": 3, "done": 1, "pending": 0, "minutes_due": 45.0, "minutes_done": 15.0, "minutes_pending": 0.0}
    week = casey["week"]
    assert (week["minutes_done"], week["minutes_pending"]) == (15.0, 60.0)
    assert week["percent"] == round(100 * 75 / week["minutes_due"])
    assert casey["contribution"] == {"minutes": 75.0, "shared_minutes": 60.0}
    assert board["household"] == {"due": 8, "done": 1, "pending": 0}
    assert board["week"] == {"start": "2026-10-12", "end": "2026-10-19", "days_left": 6}


def test_old_records_are_pruned_and_summaries_kept() -> None:
    engine = sample_engine(at(7, 1, 9), activities=[plan("bed", "Make your bed", ["dana"], 5 / 60, "day")])
    engine.complete(at(7, 1, 9), key="bed|dana|day:2026-07-01|0", by="dana", source="tablet", approve=True)
    engine.catch_up(at(9, 28, 9))
    assert len(engine.log["completions"]) == 1
    engine.catch_up(at(10, 1, 9))
    assert engine.log["completions"] == []
    assert any(s["period"] == "day:2026-07-01" for s in engine.log["summaries"])
    assert engine.balance("dana") == 1


def test_a_dated_once_chore_finishes_when_it_is_missed() -> None:
    engine = sample_engine()
    engine.catch_up(at(10, 17, 9))
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-17T03:00:00-05:00"


def test_carried_over_once_chores_wait_until_done() -> None:
    engine = sample_engine(settings={"missed": "carry_over"})
    engine.catch_up(at(10, 17, 9))
    assert engine.activity("fix_the_gate_latch")["finished_at"] is None
    item = engine.find_item("fix_the_gate_latch|alex|once|0", at(10, 17, 9))
    assert (item.section, item.overdue_since) == ("overdue", date(2026, 10, 16))
    engine.complete(at(10, 17, 10), key="fix_the_gate_latch|alex|once|0", by="alex", source="tablet")
    assert engine.activity("fix_the_gate_latch")["finished_at"] == "2026-10-17T10:10:00-05:00"


def test_a_repeating_chore_finishes_after_its_last_week() -> None:
    engine = sample_engine()
    engine.catch_up(at(11, 29, 9))
    assert engine.activity("rake_the_leaves")["finished_at"] is None
    engine.catch_up(at(11, 30, 9))
    assert engine.activity("rake_the_leaves")["finished_at"] == "2026-11-30T03:00:00-06:00"


def test_weeks_off_are_caught_up_once_each(  # Review Focus 2
) -> None:
    engine = sample_engine(at(9, 1, 9))
    out = engine.catch_up(at(10, 13, 9))  # Home Assistant was off for six weeks
    assert engine.log["last_day"] == "2026-10-12"
    days = [s["period"] for s in engine.log["summaries"] if s["member"] == "dana" and s["period"].startswith("day:")]
    assert len(days) == len(set(days)) == 42
    missed = [e.data["occurrence"] for e in out.events if e.type == "missed"]
    assert len(missed) == len(set(missed))
    assert engine.catch_up(at(10, 13, 9)).events == []


def test_an_earlier_day_start_ends_the_day_at_once_and_only_once(  # Review Focus 4
) -> None:
    engine = sample_engine(at(10, 13, 2, 30))  # 2:30 AM Tuesday is still Monday's chore day
    assert engine.today(at(10, 13, 2, 30)) == date(2026, 10, 12)
    engine.save_settings(at(10, 13, 2, 30), {"day_starts": "02:00"})
    assert engine.today(at(10, 13, 2, 30)) == date(2026, 10, 13)
    engine.catch_up(at(10, 13, 2, 30))
    assert engine.log["last_day"] == "2026-10-12"
    engine.save_settings(at(10, 13, 2, 40), {"day_starts": "04:00"})
    engine.catch_up(at(10, 13, 4, 30))
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12"]
```

`tests/test_chores_examples.py` (new):

```python
"""The worked examples of spec section 8.16, in the engine (the Home Assistant versions are in test_chores_acceptance.py)."""
from __future__ import annotations

from datetime import date, timedelta

from .chores_sample import at, sample_engine

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


def test_1_frigate() -> None:
    """Tuesday 7:40 PM, a zone sensor sees Casey take the trash out, and an automation completes it."""
    engine = sample_engine(at(10, 13, 9))
    out = engine.complete(at(10, 13, 19, 40), member="casey", chore="take_out_the_trash", by="automation", source="automation")
    # Today's occurrence; Casey's setting is "marked" and the trash isn't marked, so it is done.
    assert (out.result, out.data["occurrence"], out.data["stars"]) == ("done", TRASH, 1)
    assert engine.log["completions"][-1]["source"] == "automation"
    assert engine.balance("casey") == 1


def test_2_approval() -> None:
    """Dana holds Feed the fish, so it waits for OK; Alex taps Looks good on their phone."""
    engine = sample_engine(at(10, 13, 9))
    fish = "feed_the_fish|dana|day:2026-10-13|0"
    assert engine.complete(at(10, 13, 15, 58), key=fish, by="dana", source="tablet").result == "pending"
    [request] = engine.open_requests()
    out = engine.review(at(10, 13, 16, 5), request_id=request["id"], allow=True, by="alex", source="notification")
    completion = engine.log["completions"][-1]
    assert (out.result, completion["state"], completion["stars"]) == ("approved", "done", 1)
    assert (completion["review"]["by"], completion["review"]["source"]) == ("alex", "notification")
    assert engine.balance("dana") == 1


def test_3_make_it_up() -> None:
    """Blair misses Monday's laundry; on Tuesday it shows "From Mon"; done, it counts as on time for the week."""
    engine = sample_engine(at(10, 12, 9))
    engine.catch_up(at(10, 13, 9))
    monday = "laundry|blair|week:2026-10-12|0"
    item = engine.find_item(monday, at(10, 13, 9))
    assert (item.section, item.moved_from) == ("week", date(2026, 10, 12))
    assert engine.description(item, date(2026, 10, 13)) == "From Mon"
    assert engine.complete(at(10, 13, 18), key=monday, by="blair", source="tablet").result == "done"
    engine.complete(at(10, 15, 18), key="laundry|blair|week:2026-10-12|1", by="blair", source="tablet")
    engine.complete(at(10, 15, 19), key="clean_the_bathroom|blair|week:2026-10-12|0", by="blair", source="tablet")
    engine.catch_up(at(10, 19, 9))
    week = next(s for s in engine.log["summaries"] if s["member"] == "blair" and s["period"] == "week:2026-10-12")
    assert monday not in week["missed"]
    assert week["closed"] is True


def test_4_repeat_delivery() -> None:
    """The same automation fires twice within a minute: already_done, no second credit, no error."""
    engine = sample_engine(at(10, 13, 9))
    first = engine.complete(at(10, 13, 19, 40), member="casey", chore="take_out_the_trash", by="automation", source="automation")
    second = engine.complete(at(10, 13, 19, 40) + timedelta(seconds=30), member="casey", chore="take_out_the_trash",
                             by="automation", source="automation")
    assert (first.result, second.result) == ("done", "already_done")
    assert second.events == [] and second.changed == set()
    assert engine.balance("casey") == 1


def test_5_outage() -> None:
    """Off from Monday 11 PM to Wednesday 9 AM: the Tuesday and Wednesday 3:00 AM rollovers run in order."""
    engine = sample_engine(at(10, 12, 9))
    engine.complete(at(10, 12, 21), key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    out = engine.catch_up(at(10, 14, 9))
    kinds = [event.type for event in out.events]
    # Monday's day: auto-approve, then missed; then Tuesday's day: missed.
    assert kinds[0] == "approved" and set(kinds[1:]) == {"missed"}
    days = [event.data["occurrence"].split("|")[2] for event in out.events[1:]]
    assert days == sorted(days) and days[0] == "day:2026-10-12" and days[-1] in ("day:2026-10-13", "week:2026-10-12")
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12", "day:2026-10-13"]
    assert engine.log["last_boundary"] == "2026-10-14T03:00:00-05:00"
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_occurrences.py tests/test_chores_engine.py tests/test_chores_rollover.py tests/test_chores_examples.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.engine'` (and `.occurrences`).

- [ ] **Step 3: Write the occurrence generator.**

`custom_components/planavista/chores/occurrences.py` (new):

```python
"""Turning the plan into check-offs (spec sections 7.6, 8.2, 8.4, and 8.8).

An occurrence is one thing to check off: a chore, for one member, in one
period, number n. Its key, `{chore}|{member}|{period}|{n}`, is deterministic,
so every client names the same occurrence the same way. Plan, Once, and
Repeats chores are three generators of the one Occurrence shape. Whether an
occurrence is done comes from the log, not from here. Nothing here imports
Home Assistant.
"""
from __future__ import annotations

from collections.abc import Callable, Iterator, Mapping
from dataclasses import dataclass, replace
from datetime import date, datetime, timedelta
from typing import Any

from .model import on_board, stars_for
from .periods import WEEKDAY_CODES, Clock, parse_clock, period_id
from .recurrence import instances, parse_rule


@dataclass(frozen=True)
class Occurrence:
    """One check-off. `owner` is the assignee in the key; `member` is who has it now."""

    key: str
    chore: str
    owner: str
    member: str
    period: str
    n: int
    appears: date
    planned: date | None
    due: datetime | None
    band: str | None
    credit_minutes: float
    stars: int
    window: str
    dated: bool = False
    excused: bool = False


def occurrence_key(chore: str, member: str, period: str, n: int) -> str:
    """`{chore}|{member}|{period}|{n}` (spec 7.6)."""
    return f"{chore}|{member}|{period}|{n}"


def parse_key(key: object) -> tuple[str, str, str, int] | None:
    """(chore, member, period, n) from a key, or None when it isn't one."""
    if not isinstance(key, str):
        return None
    parts = key.split("|")
    if len(parts) != 4 or not parts[3].isdigit():
        return None
    return parts[0], parts[1], parts[2], int(parts[3])


@dataclass(frozen=True)
class Generator:
    """Everything generating occurrences needs besides the plan itself."""

    clock: Clock
    minutes_per_star: int
    policy_on: Callable[[date], str]

    def _occurrence(
        self,
        activity: Mapping[str, Any],
        member: str,
        period: str,
        n: int,
        *,
        appears: date,
        planned: date | None,
        due: datetime | None,
        band: str | None,
        minutes: float,
        window: str,
        dated: bool = False,
    ) -> Occurrence:
        credit = round(minutes, 2)
        return Occurrence(
            key=occurrence_key(activity["id"], member, period, n),
            chore=activity["id"],
            owner=member,
            member=member,
            period=period,
            n=n,
            appears=appears,
            planned=planned,
            due=due,
            band=band,
            credit_minutes=credit,
            stars=stars_for(credit, self.minutes_per_star, activity.get("stars")),
            window=window,
            dated=dated,
        )

    # Plan chores (spec 8.2): per day, per week on picked days, or per week floating.

    @staticmethod
    def _share_minutes(activity: Mapping[str, Any], member: str) -> float:
        if activity.get("split") == "shared" and activity.get("shares"):
            return float(activity["shares"].get(member, 0)) * 60
        return float(activity["minimum"]["hours"]) * 60

    @staticmethod
    def _band(activity: Mapping[str, Any], n: int) -> str | None:
        bands = activity.get("time_of_day") or []
        return bands[n % len(bands)] if bands else None

    def _plan_day(self, activity: Mapping[str, Any], member: str, day: date) -> list[Occurrence]:
        days = activity.get("days") or []
        if days and WEEKDAY_CODES[day.weekday()] not in days:
            return []
        times = int(activity.get("times", 1))
        each = self._share_minutes(activity, member) / times
        return [
            self._occurrence(
                activity, member, period_id("day", day), n,
                appears=day, planned=day, due=self.clock.day_end(day),
                band=self._band(activity, n), minutes=each, window="day",
            )
            for n in range(times)
        ]

    def _plan_week(self, activity: Mapping[str, Any], member: str, week: date) -> list[Occurrence]:
        clock = self.clock
        end = clock.week_end(week)
        times = int(activity.get("times", 1))
        share = self._share_minutes(activity, member)
        period = period_id("week", week)
        week_due = clock.day_start(end)
        days = activity.get("days") or []
        if not days:
            return [
                self._occurrence(
                    activity, member, period, n,
                    appears=week, planned=None, due=week_due,
                    band=self._band(activity, n), minutes=share / times, window="week",
                )
                for n in range(times)
            ]
        picked = [
            week + timedelta(days=offset)
            for offset in range((end - week).days)
            if WEEKDAY_CODES[(week + timedelta(days=offset)).weekday()] in days
        ]
        each = share / (len(days) * times)
        result = []
        for index, day in enumerate(picked):
            strict = self.policy_on(day) == "strict"
            for t in range(times):
                result.append(
                    self._occurrence(
                        activity, member, period, index * times + t,
                        appears=day, planned=day,
                        due=clock.day_end(day) if strict else week_due,
                        band=self._band(activity, t), minutes=each, window="week",
                    )
                )
        return result

    # Once chores: one occurrence per session per assignee, period `once`.

    def _once(self, activity: Mapping[str, Any], member: str) -> list[Occurrence]:
        once = activity["once"]
        sessions = int(once.get("sessions", 1))
        each = float(once.get("estimate_minutes", 15)) / sessions
        created = _created_day(activity, self.clock)
        if once.get("on"):
            day = date.fromisoformat(once["on"])
            timing = {"appears": day, "planned": day, "due": self.clock.day_end(day), "dated": False}
        elif once.get("by"):
            by = date.fromisoformat(once["by"])
            at = parse_clock(once.get("by_time"))
            due = (
                datetime.combine(by, at, tzinfo=self.clock.tz)
                if at is not None
                else self.clock.day_end(by)
            )
            timing = {"appears": created, "planned": None, "due": due, "dated": True}
        else:
            timing = {"appears": created, "planned": None, "due": None, "dated": False}
        return [
            self._occurrence(
                activity, member, "once", n, band=None, minutes=each, window="once", **timing
            )
            for n in range(sessions)
        ]

    # Repeats chores: one occurrence per instance per assignee, period `rep:<date>`.

    def _repeat(self, activity: Mapping[str, Any], member: str, instance: date) -> Occurrence:
        repeats = activity["repeats"]
        clock = self.clock
        minutes = float(repeats.get("estimate_minutes", 15))
        period = period_id("rep", instance)
        if repeats.get("window") == "period":
            start = date.fromisoformat(repeats["start"])
            if parse_rule(repeats["rrule"]).freq == "MONTHLY":
                first, end, window = clock.month_start(instance), clock.month_end(instance), "month"
            else:
                first, end, window = clock.week_start(instance), clock.week_end(instance), "week"
            return self._occurrence(
                activity, member, period, 0,
                appears=max(first, start), planned=None, due=clock.day_start(end),
                band=None, minutes=minutes, window=window,
            )
        strict = self.policy_on(instance) == "strict"
        due = clock.day_end(instance) if strict else clock.day_start(clock.week_end(instance))
        return self._occurrence(
            activity, member, period, 0,
            appears=instance, planned=instance, due=due, band=None, minutes=minutes, window="day",
        )

    def _repeat_instances(self, activity: Mapping[str, Any], first: date, last: date) -> list[date]:
        repeats = activity["repeats"]
        start = date.fromisoformat(repeats["start"])
        if last < start:
            return []
        return list(instances(parse_rule(repeats["rrule"]), start, last, first=max(first, start)))

    # Which periods matter on a chore day, and every occurrence of one period.

    def periods_on(self, activity: Mapping[str, Any], day: date) -> Iterator[tuple[str, date | None]]:
        """The (kind, start) periods whose occurrences may show on `day`."""
        schedule = activity.get("schedule")
        clock = self.clock
        if schedule == "plan":
            if activity["minimum"]["per"] == "day":
                yield "day", day
            else:
                yield "week", clock.week_start(day)
        elif schedule == "once":
            yield "once", None
        elif schedule == "repeats":
            repeats = activity["repeats"]
            if repeats.get("window") == "period":
                if parse_rule(repeats["rrule"]).freq == "MONTHLY":
                    first, last = clock.month_start(day), clock.month_end(day) - timedelta(days=1)
                else:
                    first, last = clock.week_start(day), clock.week_end(day) - timedelta(days=1)
            else:
                first, last = clock.week_start(day), day
            for instance in self._repeat_instances(activity, first, last):
                yield "rep", instance

    def period_occurrences(
        self, activity: Mapping[str, Any], member: str, kind: str, start: date | None
    ) -> list[Occurrence]:
        """Every occurrence of one period for one assignee (before overrides)."""
        schedule = activity.get("schedule")
        per = activity.get("minimum", {}).get("per") if schedule == "plan" else None
        if kind == "day" and start is not None and per == "day":
            return self._plan_day(activity, member, start)
        if kind == "week" and start is not None and per == "week":
            return self._plan_week(activity, member, start)
        if kind == "once" and schedule == "once":
            return self._once(activity, member)
        if kind == "rep" and start is not None and schedule == "repeats":
            return [self._repeat(activity, member, start)]
        return []

    def from_key(self, activity: Mapping[str, Any], key: str) -> Occurrence | None:
        """Regenerate one occurrence by its key, when the plan still makes it."""
        parsed = parse_key(key)
        if parsed is None or parsed[0] != activity.get("id"):
            return None
        _chore, member, period, n = parsed
        if member not in activity.get("assignees", []) or not on_board(activity):
            return None
        kind, _, start_text = period.partition(":")
        try:
            start = date.fromisoformat(start_text) if start_text else None
        except ValueError:
            return None
        if (
            kind == "rep"
            and start is not None
            and activity.get("schedule") == "repeats"
            and start not in self._repeat_instances(activity, start, start)
        ):
            return None
        if kind == "week" and start is not None and self.clock.week_start(start) != start:
            return None
        return next(
            (occ for occ in self.period_occurrences(activity, member, kind, start) if occ.key == key),
            None,
        )


def _created_day(activity: Mapping[str, Any], clock: Clock) -> date:
    created = activity.get("created")
    at = created.get("at") if isinstance(created, Mapping) else None
    try:
        return clock.chore_date(datetime.fromisoformat(at)) if at else date.min
    except (TypeError, ValueError):
        return date.min


def visible_on(occ: Occurrence, day: date, clock: Clock) -> bool:
    """Whether `occ` shows on chore day `day`: from when it appears until the day it is due."""
    if occ.appears > day:
        return False
    return occ.due is None or day <= clock.due_day(occ.due)


def with_overrides(
    occ: Occurrence, overrides: Mapping[str, Any], members: set[str], clock: Clock
) -> Occurrence:
    """Apply a parent's or a member's per-occurrence changes (spec 8.8).

    `planned_day` only moves where it shows; `due` moves when it is due;
    `assignee` hands it to someone else; `excused` means it isn't due.
    """
    changes: dict[str, Any] = {}
    if (planned := overrides.get("planned_day")) is not None:
        day = date.fromisoformat(planned)
        changes.update(planned=day, appears=max(occ.appears, day), dated=False)
    if (due := overrides.get("due")) is not None:
        changes["due"] = clock.day_end(date.fromisoformat(due))
    if (assignee := overrides.get("assignee")) is not None and assignee in members:
        changes["member"] = assignee
    if overrides.get("excused"):
        changes["excused"] = True
    return replace(occ, **changes) if changes else occ


def section_on(occ: Occurrence, day: date) -> tuple[str, date | None]:
    """Where an occurrence shows on `day`: (today or week, the day it moved from)."""
    if occ.dated or occ.planned == day:
        return "today", None
    if occ.planned is not None and occ.planned < day:
        return "week", occ.planned
    return "week", None


def counted_on(occ: Occurrence, day: date, clock: Clock) -> bool:
    """Whether `occ` is part of `day`'s ring: shown in Today and due by then, or planned for it."""
    section, _moved = section_on(occ, day)
    if section != "today":
        return False
    if occ.dated:
        return occ.due is not None and clock.due_day(occ.due) == day
    return True
```

- [ ] **Step 4: Write the engine.**

`custom_components/planavista/chores/engine.py` (new):

```python
"""The chores engine: plan + time + log -> what's due, credit, stars, streaks, rollover (spec 8).

One engine decides everything; the card, the to-do lists, sensors, events,
and actions are projections of it (spec principle 2). It works on the three
documents of the chores Stores (plan, log, rewards) and the household's
members, changing them in place, and every write returns an Outcome: its
result, the events to fire, and which documents changed. Time is passed in,
so tests can run months in milliseconds. Nothing here imports Home Assistant.
"""
from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass, field, replace
from datetime import UTC, date, datetime, time, timedelta, tzinfo
import os
import time as wall_time
from typing import Any

from .model import (
    MAX_ACTIVITIES,
    MAX_REWARDS,
    ChoreError,
    build_activity,
    build_reward,
    build_settings,
    make_id,
    on_board,
)
from .occurrences import (
    Generator,
    Occurrence,
    counted_on,
    parse_key,
    section_on,
    visible_on,
    with_overrides,
)
from .periods import BANDS, Clock, WeekRule, parse_clock
from .recurrence import instances, last_instance, parse_rule

AUTO = "auto"
RETENTION = timedelta(days=90)
REPEAT_WINDOW = timedelta(seconds=60)
CREDITED = ("done", "pending")
OPEN = ("open", "sent_back")
SECTIONS = ("overdue", "today", "week")
WEEKDAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
MONTH_NAMES = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
MAX_UNTIL_DAYS = 60
EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed")
_CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def new_ulid() -> str:
    """A ULID: 48 bits of milliseconds and 80 random bits, in Crockford base 32."""
    value = (int(wall_time.time() * 1000) << 80) | int.from_bytes(os.urandom(10), "big")
    return "".join(_CROCKFORD[(value >> shift) & 31] for shift in range(125, -1, -5))


@dataclass
class ChoreEvent:
    """Something an `event.<member>_chores` entity reports (spec 10.2)."""

    type: str
    member: str
    data: dict[str, Any]


@dataclass
class Outcome:
    """What a write did: its result, response data, events to fire, documents to save."""

    result: str | None = None
    data: dict[str, Any] = field(default_factory=dict)
    events: list[ChoreEvent] = field(default_factory=list)
    changed: set[str] = field(default_factory=set)

    def merge(self, other: Outcome) -> Outcome:
        """Add another outcome's events and changes to this one."""
        self.events.extend(other.events)
        self.changed |= other.changed
        return self


@dataclass
class Item:
    """An occurrence as it stands on one chore day."""

    occ: Occurrence
    section: str
    moved_from: date | None
    status: str
    completion: dict[str, Any] | None
    counted: bool
    overdue_since: date | None = None
    request: dict[str, Any] | None = None

    @property
    def satisfied(self) -> bool:
        """Done, waiting for OK, excused, or away: nothing more is owed today."""
        return self.status not in OPEN


@dataclass
class _Index:
    latest: dict[str, dict[str, Any]]
    overrides: dict[str, dict[str, Any]]
    requests: dict[str, dict[str, Any]]
    carried: dict[str, dict[str, Any]]


def _day(value: str) -> date:
    return date.fromisoformat(value)


def _at(value: str) -> datetime:
    return datetime.fromisoformat(value)


def short_day(day: date, today: date) -> str:
    """"Mon" within a week of today, otherwise "Oct 3" (for to-do descriptions)."""
    if abs((day - today).days) <= 6:
        return WEEKDAY_NAMES[day.weekday()]
    return f"{MONTH_NAMES[day.month - 1]} {day.day}"


def needs_ok(doer: Mapping[str, Any], activity: Mapping[str, Any] | None) -> bool:
    """Whether a check-off by `doer` waits for a parent's OK (spec 8.5 step 3)."""
    if doer.get("parent"):
        return False
    setting = doer.get("needs_ok_for", "none")
    return setting == "all" or (setting == "marked" and bool(activity and activity.get("needs_ok")))


def away_on(member: Mapping[str, Any], day: date) -> Mapping[str, Any] | None:
    """The member's Away range holding `day`, if any (spec 8.11)."""
    for span in member.get("away") or []:
        try:
            if _day(span["from"]) <= day <= _day(span["to"]):
                return span
        except (KeyError, TypeError, ValueError):
            continue
    return None


def with_away(away: Iterable[Mapping[str, Any]], start: date, end: date, note: str | None) -> list[dict[str, Any]]:
    """Away ranges after marking `start` to `end` away (ranges that overlap are joined)."""
    spans = [dict(span) for span in away]
    merged = {"from": start.isoformat(), "to": end.isoformat(), "note": note}
    kept = []
    for span in spans:
        if _day(span["to"]) + timedelta(days=1) < start or _day(span["from"]) > end + timedelta(days=1):
            kept.append(span)
        else:
            merged["from"] = min(merged["from"], span["from"])
            merged["to"] = max(merged["to"], span["to"])
            merged["note"] = note if note is not None else span.get("note")
    return sorted([*kept, merged], key=lambda span: span["from"])


def without_away(away: Iterable[Mapping[str, Any]], start: date, end: date | None) -> list[dict[str, Any]]:
    """Away ranges after `start` (to `end`, or for good) is no longer away."""
    result = []
    for span in away:
        first, last = _day(span["from"]), _day(span["to"])
        if last < start or (end is not None and first > end):
            result.append(dict(span))
            continue
        if first < start:
            result.append({**span, "to": (start - timedelta(days=1)).isoformat()})
        if end is not None and last > end:
            result.append({**span, "from": (end + timedelta(days=1)).isoformat()})
    return sorted(result, key=lambda span: span["from"])


class ChoresEngine:
    """The engine for one household. Methods take `now`; writes return an Outcome."""

    def __init__(
        self,
        plan: dict[str, Any],
        log: dict[str, Any],
        rewards: dict[str, Any],
        members: Iterable[Mapping[str, Any]],
        *,
        tz: tzinfo,
        new_id: Callable[[], str] = new_ulid,
    ) -> None:
        """Wrap loaded documents (they are changed in place)."""
        self.plan = plan
        self.log = log
        self.rewards = rewards
        self.members: list[dict[str, Any]] = [dict(m) for m in members]
        self._tz = tz
        self._new_id = new_id

    # Configuration ------------------------------------------------------------

    @property
    def settings(self) -> dict[str, Any]:
        """Rules and Reminders."""
        return self.plan["settings"]

    @property
    def clock(self) -> Clock:
        """Chore days in Home Assistant's time zone, with the household's day start and weeks."""
        return Clock(
            self._tz,
            parse_clock(self.settings.get("day_starts")) or time(3, 0),
            WeekRule.from_dict(self.log.get("weeks")),
        )

    def generator(self) -> Generator:
        """What turns the plan into occurrences."""
        return Generator(self.clock, int(self.settings.get("minutes_per_star", 15)), self.policy_on)

    def policy_on(self, day: date) -> str:
        """The missed policy for chore day `day`: a change takes effect at the next day boundary."""
        policy = self.log.get("policy") or {}
        since, before = policy.get("since"), policy.get("before")
        if since and before and day < _day(since):
            return before
        return self.settings["missed"]

    def set_members(self, members: Iterable[Mapping[str, Any]]) -> None:
        """The household's members changed (names, away, settings)."""
        self.members = [dict(m) for m in members]

    def set_time_zone(self, tz: tzinfo) -> None:
        """Home Assistant's time zone changed: boundaries follow it from the next one on."""
        self._tz = tz

    def set_first_day(self, first_day: str, now: datetime) -> bool:
        """The calendar's first day changed; weeks follow from the next week boundary (spec 8.1)."""
        if self.log.get("weeks") is None:
            self.log["weeks"] = WeekRule(first_day).as_dict()
            return True
        rule = WeekRule.from_dict(self.log["weeks"])
        changed = rule.changed_to(first_day, self.today(now))
        if changed == rule:
            return False
        self.log["weeks"] = changed.as_dict()
        return True

    def _stamp(self, moment: datetime) -> str:
        """How records store a time: local, with its offset."""
        return moment.astimezone(self._tz).isoformat()

    def today(self, now: datetime) -> date:
        """The chore day `now` falls in."""
        return self.clock.chore_date(now)

    def member(self, member_id: str | None) -> dict[str, Any] | None:
        """The member with this id."""
        return next((m for m in self.members if m["id"] == member_id), None)

    def member_ids(self) -> list[str]:
        """Members in board order."""
        return [m["id"] for m in sorted(self.members, key=lambda m: (m.get("order", 0), m["id"]))]

    def activity(self, chore_id: str | None) -> dict[str, Any] | None:
        """The chore with this id."""
        return next((a for a in self.plan["activities"] if a["id"] == chore_id), None)

    def reward(self, reward_id: str | None) -> dict[str, Any] | None:
        """The reward with this id."""
        return next((r for r in self.rewards["rewards"] if r["id"] == reward_id), None)

    # Reading --------------------------------------------------------------------

    def _index(self) -> _Index:
        latest: dict[str, dict[str, Any]] = {}
        for completion in self.log["completions"]:
            if completion.get("state") != "undone":
                latest[completion["occurrence"]] = completion
        overrides: dict[str, dict[str, Any]] = defaultdict(dict)
        for record in self.log["overrides"]:
            for name in ("planned_day", "due", "assignee", "excused", "note"):
                if name in record:
                    overrides[record["occurrence"]][name] = record[name]
        requests = {
            r["occurrence"]: r for r in self.log["requests"] if r.get("state") == "open"
        }
        carried = {c["key"]: c for c in self.log["carried"]}
        return _Index(latest, dict(overrides), requests, carried)

    def _occurrences_on(self, day: date, index: _Index) -> list[Occurrence]:
        gen = self.generator()
        clock = gen.clock
        members = set(self.member_ids())
        found: dict[str, Occurrence] = {}
        for activity in self.plan["activities"]:
            if not on_board(activity):
                continue
            for kind, start in gen.periods_on(activity, day):
                for owner in activity["assignees"]:
                    if owner not in members:
                        continue
                    for occ in gen.period_occurrences(activity, owner, kind, start):
                        occ = with_overrides(occ, index.overrides.get(occ.key, {}), members, clock)
                        if visible_on(occ, day, clock):
                            found[occ.key] = occ
        # Occurrences kept on the board past their period by a later due date.
        for key, changes in index.overrides.items():
            if key in found or "due" not in changes or key in index.carried:
                continue
            parsed = parse_key(key)
            activity = self.activity(parsed[0]) if parsed else None
            occ = gen.from_key(activity, key) if activity else None
            if occ is None or occ.owner not in members:
                continue
            occ = with_overrides(occ, changes, members, clock)
            if visible_on(occ, day, clock):
                found[key] = occ
        return list(found.values())

    def _is_away(self, occ: Occurrence, day: date) -> bool:
        member = self.member(occ.member)
        if member is None or not member.get("away"):
            return False
        if occ.planned is not None:
            return away_on(member, occ.planned) is not None
        if occ.due is None:
            return False
        clock = self.clock
        first = max(occ.appears, clock.week_start(day))
        last = min(clock.due_day(occ.due), clock.week_end(day) - timedelta(days=1))
        days = [first + timedelta(days=n) for n in range((last - first).days + 1)]
        return bool(days) and all(away_on(member, d) is not None for d in days)

    def _status(self, occ: Occurrence, completion: dict[str, Any] | None, day: date) -> str:
        state = completion.get("state") if completion else None
        if state in CREDITED:
            return state
        if occ.excused:
            return "excused"
        if self._is_away(occ, day):
            return "away"
        return "sent_back" if state == "sent_back" else "open"

    def _carried_occurrence(self, record: Mapping[str, Any]) -> Occurrence:
        return Occurrence(
            key=record["key"],
            chore=record["chore"],
            owner=record["owner"],
            member=record["member"],
            period=record["period"],
            n=int(record["n"]),
            appears=_day(record["since"]),
            planned=None,
            due=_at(record["due"]) if record.get("due") else None,
            band=record.get("band"),
            credit_minutes=float(record["credit_minutes"]),
            stars=int(record["stars"]),
            window=record.get("window", "day"),
        )

    def _items_on(self, day: date, index: _Index) -> dict[str, list[Item]]:
        clock = self.clock
        members = set(self.member_ids())
        items: dict[str, list[Item]] = defaultdict(list)
        present: set[str] = set()
        for occ in self._occurrences_on(day, index):
            section, moved = section_on(occ, day)
            completion = index.latest.get(occ.key)
            items[occ.member].append(
                Item(
                    occ,
                    section,
                    moved,
                    self._status(occ, completion, day),
                    completion,
                    counted_on(occ, day, clock),
                    request=index.requests.get(occ.key),
                )
            )
            present.add(occ.key)
        for key, record in index.carried.items():
            if key in present or record["member"] not in members or self.activity(record["chore"]) is None:
                continue
            completion = index.latest.get(key)
            done_earlier = (
                completion is not None
                and completion.get("state") in CREDITED
                and clock.chore_date(_at(completion["at"])) < day
            )
            if done_earlier:
                continue
            occ = self._carried_occurrence(record)
            overrides = index.overrides.get(key, {})
            if overrides.get("excused"):
                occ = replace(occ, excused=True)
            items[occ.member].append(
                Item(
                    occ,
                    "overdue",
                    None,
                    self._status(occ, completion, day),
                    completion,
                    True,
                    overdue_since=_day(record["since"]),
                    request=index.requests.get(key),
                )
            )
            present.add(key)
        # Check-offs from today whose occurrence the plan no longer makes (an edit since).
        for completion in self.log["completions"]:
            key = completion["occurrence"]
            if (
                key in present
                or completion.get("state") not in CREDITED
                or completion["member"] not in members
                or clock.chore_date(_at(completion["at"])) != day
            ):
                continue
            parsed = parse_key(key)
            if parsed is None:
                continue
            occ = Occurrence(
                key=key, chore=completion["chore"], owner=parsed[1], member=completion["member"],
                period=parsed[2], n=parsed[3], appears=day, planned=day, due=clock.day_end(day),
                band=None, credit_minutes=float(completion["credit_minutes"]),
                stars=int(completion["stars"]), window="day",
            )
            items[occ.member].append(Item(occ, "today", None, completion["state"], completion, True))
            present.add(key)
        return items

    def _order(self) -> dict[str, int]:
        return {a["id"]: index for index, a in enumerate(self.plan["activities"])}

    def _sorted(self, items: list[Item], band_now: str) -> list[Item]:
        order = self._order()
        current = BANDS.index(band_now)

        def rank(item: Item) -> tuple[Any, ...]:
            band = BANDS.index(item.occ.band) if item.occ.band in BANDS else current
            return (
                SECTIONS.index(item.section),
                item.overdue_since or date.min,
                band if item.section == "today" else 0,
                item.moved_from or date.min,
                order.get(item.occ.chore, len(order)),
                item.occ.owner,
                item.occ.n,
            )

        return sorted(items, key=rank)

    def items(self, now: datetime, day: date | None = None) -> dict[str, list[Item]]:
        """Every member's occurrences on a chore day (default today), in board order."""
        day = day or self.today(now)
        band = self.clock.band(now)
        return {
            member: self._sorted(found, band)
            for member, found in self._items_on(day, self._index()).items()
        }

    @staticmethod
    def stats(items: Iterable[Item]) -> dict[str, Any]:
        """Due and done counts and minutes; Waiting for OK counted separately (spec 8.14)."""
        result = {"due": 0, "done": 0, "pending": 0, "minutes_due": 0.0, "minutes_done": 0.0, "minutes_pending": 0.0}
        for item in items:
            if item.status in ("away", "excused"):
                continue
            minutes = item.occ.credit_minutes
            result["due"] += 1
            result["minutes_due"] += minutes
            if item.status == "done":
                result["done"] += 1
                result["minutes_done"] += minutes
            elif item.status == "pending":
                result["pending"] += 1
                result["minutes_pending"] += minutes
        for key in ("minutes_due", "minutes_done", "minutes_pending"):
            result[key] = round(result[key], 2)
        return result

    def _week_items(self, week: date, index: _Index) -> dict[str, dict[str, Item]]:
        """Each member's occurrences due within a chore week, by key (latest state)."""
        clock = self.clock
        end = clock.week_end(week)
        result: dict[str, dict[str, Item]] = defaultdict(dict)
        day = week
        while day < end:
            for member, found in self._items_on(day, index).items():
                for item in found:
                    due = item.occ.due
                    if item.section == "overdue" or due is None:
                        continue
                    if week <= clock.due_day(due) < end:
                        result[member][item.occ.key] = item
            day += timedelta(days=1)
        return result

    def contribution(self, member_id: str, first: date, end: date) -> dict[str, float]:
        """Minutes credited to `member_id` as the doer from `first` to before `end` (spec 8.14)."""
        clock = self.clock
        total = shared = 0.0
        for completion in self.log["completions"]:
            if completion.get("done_by") != member_id or completion.get("state") not in CREDITED:
                continue
            if not first <= clock.chore_date(_at(completion["at"])) < end:
                continue
            minutes = float(completion.get("credit_minutes", 0))
            total += minutes
            activity = self.activity(completion.get("chore"))
            if activity is not None and len(activity.get("assignees", [])) >= 2:
                shared += minutes
        return {"minutes": round(total, 2), "shared_minutes": round(shared, 2)}

    def _summaries(self, member_id: str, kind: str) -> dict[date, dict[str, Any]]:
        prefix = f"{kind}:"
        return {
            _day(s["period"][len(prefix):]): s
            for s in self.log["summaries"]
            if s.get("member") == member_id and str(s.get("period", "")).startswith(prefix)
        }

    def streak(self, member_id: str, now: datetime, today_items: Iterable[Item] | None = None) -> int:
        """Chore days in a row with every item due done; away and empty days are skipped (spec 8.13)."""
        today = self.today(now)
        days = self._summaries(member_id, "day")
        count = 0
        day = today - timedelta(days=1)
        while (summary := days.get(day)) is not None:
            if not (summary.get("away") or summary.get("due", 0) == 0):
                if not summary.get("closed"):
                    break
                count += 1
            day -= timedelta(days=1)
        if today_items is None:
            today_items = self.items(now).get(member_id, [])
        due = [i for i in today_items if i.counted and i.status not in ("away", "excused")]
        if due and all(i.satisfied for i in due):
            count += 1
        return count

    def week_streak(self, member_id: str, now: datetime) -> int:
        """Chore weeks in a row with everything due done (the current week counts once it ends)."""
        weeks = self._summaries(member_id, "week")
        count = 0
        week = self.clock.week_start(self.today(now))
        while True:
            week = self.clock.week_start(week - timedelta(days=1))
            summary = weeks.get(week)
            if summary is None:
                return count
            if summary.get("away") or summary.get("due", 0) == 0:
                continue
            if not summary.get("closed"):
                return count
            count += 1

    def chore_streak(self, member_id: str, chore_id: str, now: datetime) -> int:
        """Days in a row a member did all of one daily chore ("Cat care, 12 days")."""
        today = self.today(now)
        days = self._summaries(member_id, "day")
        count = 0
        day = today - timedelta(days=1)
        while (summary := days.get(day)) is not None:
            tally = (summary.get("chores") or {}).get(chore_id)
            if tally and not summary.get("away"):
                if tally["done"] < tally["due"]:
                    break
                count += 1
            day -= timedelta(days=1)
        items = [
            i for i in self.items(now).get(member_id, [])
            if i.counted and i.occ.chore == chore_id and i.status not in ("away", "excused")
        ]
        if items and all(i.satisfied for i in items):
            count += 1
        return count

    def balance(self, member_id: str) -> int:
        """A member's stars (spec 7.5: the ledger is append-only)."""
        return sum(int(e["delta"]) for e in self.rewards["ledger"] if e.get("member") == member_id)

    def chore_minutes(self, member_id: str) -> float:
        """Every minute ever credited to a member as the doer (sensor.<member>_chore_time)."""
        return round(float((self.log.get("totals") or {}).get(member_id, 0)), 2)

    def open_requests(self) -> list[dict[str, Any]]:
        """Everything waiting for a parent, all four kinds in one list (spec 8.7)."""
        members = set(self.member_ids())
        found: list[dict[str, Any]] = []
        for c in self.log["completions"]:
            if c.get("state") == "pending" and c["member"] in members:
                activity = self.activity(c["chore"])
                found.append({
                    "id": c["id"], "kind": "completion", "member": c["member"], "done_by": c["done_by"],
                    "chore": c["chore"], "name": activity["name"] if activity else c["chore"],
                    "occurrence": c["occurrence"], "at": c["at"], "stars": c["stars"],
                })
        for r in self.log["requests"]:
            activity = self.activity(r["chore"])
            if r.get("state") == "open" and r["member"] in members and activity is not None:
                found.append({
                    "id": r["id"], "kind": r["kind"], "member": r["member"], "chore": r["chore"],
                    "name": activity["name"], "occurrence": r["occurrence"], "until": r.get("until"),
                    "at": r["at"],
                })
        for r in self.rewards["redemptions"]:
            reward = self.reward(r["reward"])
            if r.get("state") == "requested" and r["member"] in members:
                found.append({
                    "id": r["id"], "kind": "redemption", "member": r["member"], "reward": r["reward"],
                    "name": reward["name"] if reward else r["reward"], "cost": r["cost"],
                    "balance": self.balance(r["member"]), "at": r["at"],
                })
        return sorted(found, key=lambda r: r["at"])

    def find_item(self, key: str, now: datetime) -> Item | None:
        """Today's occurrence with this key, if it shows today."""
        for found in self.items(now).values():
            for item in found:
                if item.occ.key == key:
                    return item
        return None

    def open_item(self, chore_id: str, member_id: str, now: datetime) -> Item | None:
        """The member's oldest open occurrence of a chore (spec 8.5 step 1).

        Overdue first, then today's, then this week's floating, then this
        week's earlier pinned items.
        """
        candidates = [
            item for item in self.items(now).get(member_id, [])
            if item.occ.chore == chore_id and item.status in OPEN and self._still_open(item, now)
        ]

        def rank(item: Item) -> tuple[Any, ...]:
            if item.section == "overdue":
                tier = 0
            elif item.section == "today":
                tier = 1
            else:
                tier = 3 if item.moved_from else 2
            return (tier, item.overdue_since or date.min, item.moved_from or date.min, item.occ.n)

        return min(candidates, key=rank, default=None)

    @staticmethod
    def _still_open(item: Item, now: datetime) -> bool:
        due = item.occ.due
        return item.section == "overdue" or due is None or due.astimezone(UTC) > now.astimezone(UTC)

    # Views -----------------------------------------------------------------------

    def item_view(self, item: Item, day: date) -> dict[str, Any]:
        """One occurrence as the card and the actions see it."""
        occ = item.occ
        activity = self.activity(occ.chore)
        completion = item.completion
        clock = self.clock
        return {
            "key": occ.key,
            "chore": occ.chore,
            "name": activity["name"] if activity else occ.chore,
            "icon": activity.get("icon") if activity else None,
            "member": occ.member,
            "owner": occ.owner,
            "period": occ.period,
            "n": occ.n,
            "section": item.section,
            "band": occ.band,
            "planned": occ.planned.isoformat() if occ.planned else None,
            "due": occ.due.isoformat() if occ.due else None,
            "due_day": clock.due_day(occ.due).isoformat() if occ.due else None,
            "window": occ.window,
            "dated": occ.dated,
            "status": item.status,
            "counted": item.counted,
            "credit_minutes": occ.credit_minutes,
            "stars": occ.stars,
            "from": item.moved_from.isoformat() if item.moved_from else None,
            "overdue_since": item.overdue_since.isoformat() if item.overdue_since else None,
            "needs_ok": bool(activity and activity.get("needs_ok")),
            "completion": (
                {k: completion.get(k) for k in ("id", "done_by", "by", "at", "source", "state", "review", "stars")}
                if completion
                else None
            ),
            "note": (completion.get("review") or {}).get("note") if item.status == "sent_back" and completion else None,
            "request": (
                {"id": item.request["id"], "kind": item.request["kind"], "until": item.request.get("until")}
                if item.request
                else None
            ),
        }

    def description(self, item: Item, today: date) -> str | None:
        """The to-do item's description: what the status map would say (spec 10.3)."""
        if item.status == "pending":
            return "Waiting for a parent's OK"
        if item.status == "sent_back":
            note = (item.completion or {}).get("review", {}) or {}
            return f"Sent back: {note['note']}" if note.get("note") else "Sent back"
        if item.status == "done":
            return None
        if item.overdue_since:
            return f"Overdue since {short_day(item.overdue_since, today)}"
        if item.moved_from:
            return f"From {short_day(item.moved_from, today)}"
        occ = item.occ
        if occ.dated and occ.due is not None:
            return f"Due {short_day(self.clock.due_day(occ.due), today)}"
        if item.section == "week":
            return "This month" if occ.window == "month" else "This week"
        return None

    def todo_items(self, member_id: str, now: datetime) -> list[Item]:
        """A member's to-do list: open items, then today's check-offs (spec 10.3).

        Today's items first, then this week's floating ones, then make-up and
        overdue ones. Today's completed items stay checked until rollover.
        """
        today = self.today(now)
        clock = self.clock
        found = self.items(now).get(member_id, [])
        open_items = [i for i in found if i.status in OPEN and self._still_open(i, now)]

        def tier(item: Item) -> int:
            if item.section == "today":
                return 0
            if item.section == "week" and not item.moved_from:
                return 1
            return 2

        done = [
            i for i in found
            if i.status in CREDITED and i.completion and clock.chore_date(_at(i.completion["at"])) == today
        ]
        return sorted(open_items, key=tier) + done

    def board(self, now: datetime, day: date | None = None) -> dict[str, Any]:
        """The board for a chore day: everyone's items, progress, streaks, stars, requests (spec 10.7)."""
        clock = self.clock
        today = self.today(now)
        day = day or today
        index = self._index()
        band = clock.band(now)
        by_member = self._items_on(day, index)
        week = clock.week_start(day)
        week_end = clock.week_end(day)
        week_items = self._week_items(week, index)
        members: dict[str, Any] = {}
        household = {"due": 0, "done": 0, "pending": 0}
        for member_id in self.member_ids():
            found = self._sorted(by_member.get(member_id, []), band)
            counted = [i for i in found if i.counted]
            today_stats = self.stats(counted)
            week_stats = self.stats(week_items.get(member_id, {}).values())
            week_stats["percent"] = (
                round(100 * (week_stats["minutes_done"] + week_stats["minutes_pending"]) / week_stats["minutes_due"])
                if week_stats["minutes_due"]
                else None
            )
            for key in household:
                household[key] += today_stats[key]
            member = self.member(member_id) or {}
            away = away_on(member, day)
            members[member_id] = {
                "items": [self.item_view(i, day) for i in found],
                "today": today_stats,
                "week": week_stats,
                "contribution": self.contribution(member_id, week, week_end),
                "streak": self.streak(member_id, now, found if day == today else None),
                "week_streak": self.week_streak(member_id, now),
                "stars": self.balance(member_id),
                "chore_minutes": self.chore_minutes(member_id),
                "away": dict(away) if away else None,
            }
        return {
            "date": day.isoformat(),
            "today": today.isoformat(),
            "now": self._stamp(now),
            "band": band,
            "day": {"start": clock.day_start(day).isoformat(), "end": clock.day_end(day).isoformat()},
            "week": {
                "start": week.isoformat(),
                "end": week_end.isoformat(),
                "days_left": max(0, (week_end - max(day, today)).days),
            },
            "members": members,
            "household": household,
            "requests": self.open_requests(),
            "settings": dict(self.settings),
            "chores": [dict(a) for a in self.plan["activities"]],
            "rewards": [dict(r) for r in self.rewards["rewards"]],
            "needs_a_look": self.needs_a_look(),
        }

    def week_view(self, now: datetime, day: date | None = None) -> dict[str, Any]:
        """The Week view (spec 13.5): a ring per person per day, weekly chores, and fairness.

        Past days come from the summaries written at rollover; today is live;
        future days show what will be due.
        """
        clock = self.clock
        today = self.today(now)
        week = clock.week_start(day or today)
        end = clock.week_end(week)
        index = self._index()
        dates = [week + timedelta(days=n) for n in range((end - week).days)]
        live = {d: self._items_on(d, index) for d in dates if d >= today}
        week_items = self._week_items(week, index)
        members: dict[str, Any] = {}
        for member_id in self.member_ids():
            summaries = self._summaries(member_id, "day")
            member = self.member(member_id) or {}
            days = []
            for d in dates:
                away = away_on(member, d)
                if d < today:
                    summary = summaries.get(d)
                    days.append({
                        "date": d.isoformat(), "kind": "past", "away": bool(away),
                        **(
                            {key: summary.get(key) for key in ("due", "done", "pending", "closed")}
                            | {"missed": len(summary.get("missed", []))}
                            if summary
                            else {"due": None, "done": None, "pending": None, "closed": None, "missed": 0}
                        ),
                    })
                    continue
                counted = [i for i in live[d].get(member_id, []) if i.counted]
                tally = self.stats(counted)
                days.append({
                    "date": d.isoformat(),
                    "kind": "today" if d == today else "future",
                    "away": bool(away),
                    "due": tally["due"],
                    "done": tally["done"],
                    "pending": tally["pending"],
                    "closed": bool(tally["due"]) and tally["done"] + tally["pending"] == tally["due"],
                    "missed": 0,
                })
            weekly: dict[str, dict[str, Any]] = {}
            for item in week_items.get(member_id, {}).values():
                if item.occ.window not in ("week", "month") or item.status in ("away", "excused"):
                    continue
                activity = self.activity(item.occ.chore)
                entry = weekly.setdefault(item.occ.chore, {
                    "chore": item.occ.chore, "name": activity["name"] if activity else item.occ.chore,
                    "total": 0, "done": 0, "pending": 0, "from": None,
                })
                entry["total"] += 1
                if item.status == "done":
                    entry["done"] += 1
                elif item.status == "pending":
                    entry["pending"] += 1
                if item.moved_from and item.status in OPEN:
                    earliest = entry["from"]
                    entry["from"] = min(earliest, item.moved_from.isoformat()) if earliest else item.moved_from.isoformat()
            members[member_id] = {
                "days": days,
                "weekly": list(weekly.values()),
                "contribution": self.contribution(member_id, week, end),
                "away": [dict(span) for span in member.get("away") or []
                         if _day(span["to"]) >= week and _day(span["from"]) < end],
            }
        return {"week": {"start": week.isoformat(), "end": end.isoformat()}, "today": today.isoformat(), "members": members}

    def needs_a_look(self) -> list[dict[str, Any]]:
        """Chores that wait off the board because nobody is assigned (spec 7.9, 15.5)."""
        return [
            {"kind": "unassigned", "chore": a["id"], "name": a["name"]}
            for a in self.plan["activities"]
            if a.get("on_board", True) and not a.get("assignees") and not a.get("finished_at")
            and not (a.get("schedule") == "plan" and a.get("set_time"))
        ]

    def next_boundary(self, now: datetime) -> datetime:
        """When the first day not yet rolled over ends."""
        last = self.log.get("last_day")
        day = _day(last) + timedelta(days=1) if last else self.today(now)
        return self.clock.day_end(day)

    # Writing: check-offs -------------------------------------------------------

    def _credit(self, member_id: str, minutes: float) -> None:
        totals = self.log.setdefault("totals", {})
        totals[member_id] = round(float(totals.get(member_id, 0)) + minutes, 2)

    def _ledger(self, member_id: str, delta: int, reason: str, at: datetime, **extra: Any) -> None:
        self.rewards["ledger"].append(
            {"id": self._new_id(), "member": member_id, "delta": delta, "reason": reason, "at": self._stamp(at), **extra}
        )

    def _event_data(self, completion: Mapping[str, Any], state: str | None = None) -> dict[str, Any]:
        activity = self.activity(completion["chore"])
        return {
            "chore": completion["chore"],
            "chore_name": activity["name"] if activity else completion["chore"],
            "occurrence": completion["occurrence"],
            "member": completion["member"],
            "done_by": completion["done_by"],
            "source": completion["source"],
            "stars": completion["stars"],
            "state": state or completion["state"],
        }

    def _grant(self, completion: dict[str, Any], at: datetime, out: Outcome) -> None:
        if completion["stars"] > 0:
            self._ledger(completion["done_by"], completion["stars"], "chore", at, ref=completion["id"])
            out.changed.add("rewards")

    def complete(
        self,
        now: datetime,
        *,
        by: str,
        source: str,
        user: str | None = None,
        key: str | None = None,
        chore: str | None = None,
        member: str | None = None,
        done_by: str | None = None,
        approve: bool = False,
    ) -> Outcome:
        """Check something off (spec 8.5). Repeats and closed periods are no-ops, never errors.

        Name the exact occurrence with `key`, or give `chore` and `member` to
        take their oldest open one. `approve` (automations and admins only,
        filtered by the caller) skips the parent's OK.
        """
        if key is not None:
            item = self.find_item(key, now)
            if item is None:
                return Outcome("nothing_open", {"occurrence": key, "stars": 0})
        else:
            if chore is None or member is None:
                raise ChoreError("unknown_chore")
            recent = self._recent(chore, member, now)
            if recent is not None:
                return Outcome("already_done", {"occurrence": recent["occurrence"], "stars": 0})
            item = self.open_item(chore, member, now)
            if item is None:
                done = next(
                    (i for i in self.items(now).get(member, []) if i.occ.chore == chore and i.status in CREDITED),
                    None,
                )
                return Outcome(
                    "already_done" if done else "nothing_open",
                    {"occurrence": done.occ.key if done else None, "stars": 0},
                )
        if item.status in CREDITED:
            return Outcome("already_done", {"occurrence": item.occ.key, "stars": 0})
        if not self._still_open(item, now):
            return Outcome("nothing_open", {"occurrence": item.occ.key, "stars": 0})
        occ = item.occ
        doer_id = done_by or occ.member
        doer = self.member(doer_id)
        if doer is None:
            raise ChoreError("unknown_member")
        activity = self.activity(occ.chore)
        state = "pending" if not approve and needs_ok(doer, activity) else "done"
        stars = occ.stars if doer.get("stars") else 0
        completion = {
            "id": self._new_id(), "occurrence": occ.key, "chore": occ.chore, "member": occ.member,
            "done_by": doer_id, "by": by, "at": self._stamp(now), "source": source, "user": user,
            "state": state, "review": None, "credit_minutes": occ.credit_minutes, "stars": stars,
        }
        self.log["completions"].append(completion)
        self._credit(doer_id, occ.credit_minutes)
        out = Outcome(state, {"occurrence": occ.key, "stars": stars, "completion": completion["id"]}, changed={"log"})
        if state == "done":
            self._grant(completion, now, out)
        out.events.append(ChoreEvent("completed", occ.member, self._event_data(completion)))
        self._finish_if_done(activity, now, out)
        return out

    def _recent(self, chore: str, member: str, now: datetime) -> dict[str, Any] | None:
        for completion in reversed(self.log["completions"]):
            if (
                completion["chore"] == chore
                and completion["member"] == member
                and completion.get("state") != "undone"
                and timedelta(0) <= now - _at(completion["at"]) < REPEAT_WINDOW
            ):
                return completion
        return None

    def _todays_completion(self, now: datetime, key: str | None, chore: str | None, member: str | None) -> dict[str, Any] | None:
        clock = self.clock
        today = self.today(now)
        for completion in reversed(self.log["completions"]):
            if completion.get("state") not in CREDITED or clock.chore_date(_at(completion["at"])) != today:
                continue
            if key is not None and completion["occurrence"] == key:
                return completion
            if key is None and completion["chore"] == chore and completion["member"] == member:
                return completion
        return None

    def undo(
        self,
        now: datetime,
        *,
        by: str,
        source: str,
        user: str | None = None,
        key: str | None = None,
        chore: str | None = None,
        member: str | None = None,
    ) -> Outcome:
        """Uncheck today's check-off (spec 8.6): kept in history as undone, stars reversed."""
        completion = self._todays_completion(now, key, chore, member)
        if completion is None:
            return Outcome("nothing_to_undo", {"occurrence": key})
        was = completion["state"]
        completion["state"] = "undone"
        completion["undone"] = {"by": by, "at": self._stamp(now), "source": source, "user": user}
        self._credit(completion["done_by"], -float(completion["credit_minutes"]))
        out = Outcome("undone", {"occurrence": completion["occurrence"]}, changed={"log"})
        if was == "done" and completion["stars"] > 0:
            self._ledger(completion["done_by"], -completion["stars"], "undo", now, ref=completion["id"], by=by)
            out.changed.add("rewards")
        out.events.append(ChoreEvent("undone", completion["member"], self._event_data(completion, "undone")))
        activity = self.activity(completion["chore"])
        if activity is not None and activity.get("finished_at"):
            activity["finished_at"] = None
            out.changed.add("plan")
        return out

    # Writing: reviews and requests ---------------------------------------------

    def _approve(self, completion: dict[str, Any], at: datetime, by: str, note: str | None, source: str | None, out: Outcome) -> None:
        completion["state"] = "done"
        completion["review"] = {"by": by, "at": self._stamp(at), "note": note, "source": source}
        self._grant(completion, at, out)
        out.changed.add("log")
        out.events.append(ChoreEvent("approved", completion["member"], self._event_data(completion, "done")))

    def pending_for(self, chore: str, member: str) -> dict[str, Any] | None:
        """The member's latest check-off of a chore that is waiting for OK."""
        return next(
            (c for c in reversed(self.log["completions"])
             if c["chore"] == chore and c["member"] == member and c.get("state") == "pending"),
            None,
        )

    def review(
        self,
        now: datetime,
        *,
        request_id: str,
        allow: bool,
        by: str,
        note: str | None = None,
        source: str | None = None,
    ) -> Outcome:
        """Resolve any request (spec 8.7): approve or send back, allow or decline."""
        out = Outcome(changed={"log"})
        completion = next((c for c in self.log["completions"] if c["id"] == request_id), None)
        if completion is not None and completion.get("state") == "pending":
            if allow:
                self._approve(completion, now, by, note, source, out)
                out.result = "approved"
            else:
                completion["state"] = "sent_back"
                completion["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
                self._credit(completion["done_by"], -float(completion["credit_minutes"]))
                out.events.append(ChoreEvent("sent_back", completion["member"], self._event_data(completion, "sent_back")))
                out.result = "sent_back"
            out.data = {"occurrence": completion["occurrence"]}
            return out
        request = next((r for r in self.log["requests"] if r["id"] == request_id), None)
        if request is not None and request.get("state") == "open":
            request["state"] = "allowed" if allow else "declined"
            request["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
            if allow:
                change = (
                    {"due": request["until"]} if request["kind"] == "more_time" else {"excused": True}
                )
                self.log["overrides"].append(
                    {"occurrence": request["occurrence"], **change, "by": by, "at": self._stamp(now),
                     "request": request["id"]}
                )
            out.result = request["state"]
            out.data = {"occurrence": request["occurrence"]}
            return out
        redemption = next((r for r in self.rewards["redemptions"] if r["id"] == request_id), None)
        if redemption is not None and redemption.get("state") == "requested":
            out.changed = {"rewards"}
            if allow:
                if self.balance(redemption["member"]) < redemption["cost"]:
                    raise ChoreError("not_enough_stars")
                self._give(redemption, now, by, source, out)
            else:
                redemption["state"] = "declined"
                redemption["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
            out.result = "given" if allow else "declined"
            out.data = {"reward": redemption["reward"]}
            return out
        raise ChoreError("unknown_request")

    def request(
        self, now: datetime, *, kind: str, key: str, by: str, until: date | None = None
    ) -> Outcome:
        """Ask for more time or to skip this week (spec 8.7); one open request per kind."""
        if kind not in ("more_time", "skip"):
            raise ChoreError("invalid_request")
        item = self.find_item(key, now)
        if item is None or item.status not in OPEN or not self._still_open(item, now):
            raise ChoreError("not_open")
        if kind == "more_time":
            due_day = self.clock.due_day(item.occ.due) if item.occ.due else None
            if until is None or due_day is None or until <= due_day or until > self.today(now) + timedelta(days=MAX_UNTIL_DAYS):
                raise ChoreError("invalid_until")
        existing = next(
            (r for r in self.log["requests"] if r["occurrence"] == key and r["kind"] == kind and r.get("state") == "open"),
            None,
        )
        if existing is not None:
            return Outcome("open", {"request": existing["id"]})
        record = {
            "id": self._new_id(), "kind": kind, "occurrence": key, "chore": item.occ.chore,
            "member": item.occ.member, "until": until.isoformat() if until else None, "state": "open",
            "by": by, "at": self._stamp(now), "review": None,
        }
        self.log["requests"].append(record)
        return Outcome("open", {"request": record["id"]}, changed={"log"})

    _MISSING: Any = object()

    def override(
        self,
        now: datetime,
        *,
        key: str,
        by: str,
        planned_day: Any = _MISSING,
        due: Any = _MISSING,
        assignee: Any = _MISSING,
        excused: Any = _MISSING,
        note: str | None = None,
    ) -> Outcome:
        """Per-occurrence changes (spec 8.8). Who may make each is the caller's check."""
        item = self.find_item(key, now)
        if item is None:
            raise ChoreError("not_open")
        clock = self.clock
        today = self.today(now)
        record: dict[str, Any] = {"occurrence": key, "by": by, "at": self._stamp(now)}
        if planned_day is not self._MISSING:
            if planned_day is not None:
                last = clock.due_day(item.occ.due) if item.occ.due else today + timedelta(days=MAX_UNTIL_DAYS)
                if not today <= planned_day <= last:
                    raise ChoreError("invalid_planned_day")
                planned_day = planned_day.isoformat()
            record["planned_day"] = planned_day
        if due is not self._MISSING:
            if due is not None:
                if due < today:
                    raise ChoreError("invalid_due")
                due = due.isoformat()
            record["due"] = due
        if assignee is not self._MISSING:
            if assignee is not None and self.member(assignee) is None:
                raise ChoreError("unknown_member")
            record["assignee"] = assignee
        if excused is not self._MISSING:
            record["excused"] = bool(excused)
            record["note"] = note
        if len(record) == 3:
            raise ChoreError("nothing_to_change")
        self.log["overrides"].append(record)
        out = Outcome("changed", {"occurrence": key}, changed={"log"})
        if record.get("excused"):
            self._finish_if_done(self.activity(item.occ.chore), now, out)
        return out

    def excuse(self, now: datetime, *, chore: str, member: str, by: str, day: date | None = None, key: str | None = None, note: str | None = None) -> Outcome:
        """Excuse one occurrence, or a member's open items of a chore on a day (a sick day)."""
        if key is not None:
            keys = [key]
        else:
            day = day or self.today(now)
            found = [
                i for i in self.items(now, day).get(member, [])
                if i.occ.chore == chore and i.status in OPEN
            ]
            today_items = [i for i in found if i.section in ("today", "overdue")]
            keys = [i.occ.key for i in (today_items or found[:1])]
        if not keys:
            return Outcome("nothing_open", {"occurrences": []})
        out = Outcome("excused", {"occurrences": keys}, changed={"log"})
        for occurrence in keys:
            self.log["overrides"].append(
                {"occurrence": occurrence, "excused": True, "note": note, "by": by, "at": self._stamp(now)}
            )
        self._finish_if_done(self.activity(chore), now, out)
        return out

    # Writing: the plan ---------------------------------------------------------------

    def save_activity(
        self,
        now: datetime,
        changes: Mapping[str, Any],
        *,
        by: str,
        source: str,
        activity_id: str | None = None,
        rev: int | None = None,
    ) -> Outcome:
        """Add a chore or change one (spec 8.12): open occurrences follow at once, history stays."""
        activities = self.plan["activities"]
        members = set(self.member_ids())
        today = self.today(now)
        if activity_id is not None:
            index = next((i for i, a in enumerate(activities) if a["id"] == activity_id), None)
            if index is None:
                raise ChoreError("unknown_chore")
            existing = activities[index]
            if rev is not None and rev != existing.get("rev", 1):
                raise ChoreError("changed")
            activity = build_activity(existing, changes, members)
            activity["rev"] = int(existing.get("rev", 1)) + 1
            self._check_dates(activity, existing, today)
            activities[index] = activity
        else:
            if len(activities) >= MAX_ACTIVITIES:
                raise ChoreError("too_many")
            activity = build_activity(None, changes, members)
            self._check_dates(activity, None, today)
            activity["id"] = make_id(activity["name"], (a["id"] for a in activities))
            activity["rev"] = 1
            activity["created"] = {"by": by, "source": source, "at": self._stamp(now)}
            activities.append(activity)
        return Outcome("saved", {"activity": dict(activity)}, changed={"plan"})

    @staticmethod
    def _check_dates(activity: Mapping[str, Any], existing: Mapping[str, Any] | None, today: date) -> None:
        if activity.get("schedule") != "once":
            return
        before = (existing or {}).get("once") or {}
        for name in ("on", "by"):
            value = activity["once"].get(name)
            if value and value != before.get(name) and _day(value) < today:
                raise ChoreError("invalid_once", "Pick today or a later day.")

    def delete_activity(self, chore_id: str) -> Outcome:
        """Delete a chore: it leaves the board at once; past weeks and earned stars stay."""
        if self.activity(chore_id) is None:
            raise ChoreError("unknown_chore")
        self.plan["activities"] = [a for a in self.plan["activities"] if a["id"] != chore_id]
        self.log["carried"] = [c for c in self.log["carried"] if c["chore"] != chore_id]
        return Outcome("deleted", {"chore": chore_id}, changed={"plan", "log"})

    def unassign_member(self, member_id: str) -> Outcome:
        """Someone left the household: their chores wait unassigned, their history stays (spec 8.12)."""
        out = Outcome("unassigned")
        for activity in self.plan["activities"]:
            if member_id not in activity.get("assignees", []):
                continue
            activity["assignees"] = [m for m in activity["assignees"] if m != member_id]
            shares = activity.get("shares")
            if activity.get("split") == "shared" and isinstance(shares, dict):
                removed = float(shares.pop(member_id, 0))
                if activity["assignees"]:
                    activity["minimum"] = {**activity["minimum"], "hours": round(activity["minimum"]["hours"] - removed, 4)}
                else:
                    activity["split"], activity["shares"] = "each", None
            activity["rev"] = int(activity.get("rev", 1)) + 1
            out.changed.add("plan")
        for reward in self.rewards["rewards"]:
            if member_id in reward.get("who", []):
                reward["who"] = [m for m in reward["who"] if m != member_id]
                out.changed.add("rewards")
        carried = [c for c in self.log["carried"] if c["member"] != member_id]
        if len(carried) != len(self.log["carried"]):
            self.log["carried"] = carried
            out.changed.add("log")
        return out

    def save_settings(self, now: datetime, changes: Mapping[str, Any]) -> Outcome:
        """Rules and Reminders (spec 14.5). A new missed policy starts at the next day boundary."""
        settings = build_settings(self.settings, changes)
        out = Outcome("saved", {"settings": dict(settings)}, changed={"plan"})
        if settings["missed"] != self.settings["missed"]:
            today = self.today(now)
            self.log["policy"] = {"before": self.policy_on(today), "since": (today + timedelta(days=1)).isoformat()}
            out.changed.add("log")
        self.plan["settings"] = settings
        return out

    def _finish_if_done(self, activity: Mapping[str, Any] | None, now: datetime, out: Outcome) -> None:
        """A Once chore, or a Repeats chore that has ended, is finished when nothing is left open."""
        if activity is None or activity.get("finished_at") or activity.get("schedule") not in ("once", "repeats"):
            return
        if self._has_open(activity):
            return
        activity["finished_at"] = self._stamp(now)
        out.changed.add("plan")

    def _has_open(self, activity: Mapping[str, Any], rolled_over: date | None = None) -> bool:
        """Whether anything of a Once chore, or of a Repeats chore's final week, is still owed.

        After a rollover (`rolled_over` is the day that ended), occurrences due
        by then count as resolved: missed, or carried over and checked apart.
        """
        gen = self.generator()
        index = self._index()
        members = set(self.member_ids())
        if any(c["chore"] == activity["id"] and self._open_carried(c, index) for c in self.log["carried"]):
            return True
        if activity["schedule"] == "once":
            periods: list[tuple[str, date | None]] = [("once", None)]
        else:
            rule = parse_rule(activity["repeats"]["rrule"])
            start = _day(activity["repeats"]["start"])
            final = last_instance(rule, start)
            if final is None:
                return True
            periods = [("rep", day) for day in instances(rule, start, final, first=gen.clock.week_start(final))]
        for owner in activity.get("assignees", []):
            if owner not in members:
                continue
            for kind, period_start in periods:
                for occ in gen.period_occurrences(activity, owner, kind, period_start):
                    occ = with_overrides(occ, index.overrides.get(occ.key, {}), members, gen.clock)
                    if occ.excused or index.latest.get(occ.key, {}).get("state") in CREDITED:
                        continue
                    if rolled_over is not None and occ.due is not None and gen.clock.due_day(occ.due) <= rolled_over:
                        continue
                    return True
        return False

    @staticmethod
    def _open_carried(record: Mapping[str, Any], index: _Index) -> bool:
        if index.overrides.get(record["key"], {}).get("excused"):
            return False
        return index.latest.get(record["key"], {}).get("state") not in CREDITED

    # Writing: rewards and stars ---------------------------------------------------------

    def save_reward(self, changes: Mapping[str, Any], *, reward_id: str | None = None) -> Outcome:
        """Add a reward or change one (spec 8.15)."""
        rewards = self.rewards["rewards"]
        members = set(self.member_ids())
        if reward_id is not None:
            index = next((i for i, r in enumerate(rewards) if r["id"] == reward_id), None)
            if index is None:
                raise ChoreError("unknown_reward")
            reward = build_reward(rewards[index], changes, members)
            rewards[index] = reward
        else:
            if len(rewards) >= MAX_REWARDS:
                raise ChoreError("too_many")
            reward = build_reward(None, changes, members)
            reward["id"] = make_id(reward["name"], (r["id"] for r in rewards))
            rewards.append(reward)
        return Outcome("saved", {"reward": dict(reward)}, changed={"rewards"})

    def delete_reward(self, reward_id: str) -> Outcome:
        """Remove a reward from the catalog; redemptions already made stay in history."""
        if self.reward(reward_id) is None:
            raise ChoreError("unknown_reward")
        self.rewards["rewards"] = [r for r in self.rewards["rewards"] if r["id"] != reward_id]
        for redemption in self.rewards["redemptions"]:
            if redemption["reward"] == reward_id and redemption.get("state") == "requested":
                redemption["state"] = "declined"
        return Outcome("deleted", {"reward": reward_id}, changed={"rewards"})

    def _give(self, redemption: dict[str, Any], at: datetime, by: str, source: str | None, out: Outcome) -> None:
        redemption["state"] = "given"
        redemption["review"] = {"by": by, "at": self._stamp(at), "note": None, "source": source}
        self._ledger(redemption["member"], -int(redemption["cost"]), "redeemed", at, ref=redemption["id"], by=by)
        reward = self.reward(redemption["reward"])
        out.events.append(ChoreEvent("redeemed", redemption["member"], {
            "reward": redemption["reward"], "reward_name": reward["name"] if reward else redemption["reward"],
            "member": redemption["member"], "stars": int(redemption["cost"]), "source": source,
        }))

    def redeem(self, now: datetime, *, member: str, reward: str, by: str, source: str) -> Outcome:
        """Spend stars on a reward (spec 8.15): it waits for an OK unless the reward needs none."""
        found = self.reward(reward)
        if found is None:
            raise ChoreError("unknown_reward")
        person = self.member(member)
        if person is None:
            raise ChoreError("unknown_member")
        if found.get("who") and member not in found["who"]:
            raise ChoreError("not_for_member")
        if self.balance(member) < found["cost"]:
            raise ChoreError("not_enough_stars")
        redemption = {
            "id": self._new_id(), "member": member, "reward": reward, "cost": int(found["cost"]),
            "state": "requested", "by": by, "source": source, "at": self._stamp(now), "review": None,
        }
        self.rewards["redemptions"].append(redemption)
        out = Outcome("requested", {"request": redemption["id"]}, changed={"rewards"})
        if not found.get("needs_ok", True):
            self._give(redemption, now, AUTO, source, out)
            out.result = "given"
        return out

    def award_stars(self, now: datetime, *, member: str, stars: int, reason: str, by: str) -> Outcome:
        """A parent gives or takes stars by hand, with a reason (spec 8.15)."""
        if self.member(member) is None:
            raise ChoreError("unknown_member")
        if not isinstance(stars, int) or isinstance(stars, bool) or stars == 0:
            raise ChoreError("invalid_stars")
        reason = reason.strip() if isinstance(reason, str) else ""
        if not reason:
            raise ChoreError("reason_required")
        if self.balance(member) + stars < 0:
            raise ChoreError("not_enough_stars")
        self._ledger(member, stars, reason, now, by=by)
        return Outcome("awarded", {"balance": self.balance(member)}, changed={"rewards"})

    # Rollover (spec 8.9) ----------------------------------------------------------------

    def start(self, now: datetime) -> Outcome:
        """Chores start, or start again after being off: nothing before today is replayed."""
        yesterday = (self.today(now) - timedelta(days=1)).isoformat()
        if self.log.get("last_day") is not None and self.log["last_day"] >= yesterday:
            return Outcome()
        self.log["last_day"] = yesterday
        self.log["last_boundary"] = self.clock.day_start(self.today(now)).isoformat()
        return Outcome(changed={"log"})

    def catch_up(self, now: datetime) -> Outcome:
        """Run every day boundary that has passed, in order, once each (spec 8.9)."""
        out = Outcome()
        if self.log.get("last_day") is None:
            return out.merge(self.start(now))
        day = _day(self.log["last_day"]) + timedelta(days=1)
        while self.clock.day_end(day).astimezone(UTC) <= now.astimezone(UTC):
            out.merge(self.rollover(day))
            day += timedelta(days=1)
        return out

    def rollover(self, day: date) -> Outcome:
        """End chore day `day`: auto-approve, apply the missed policy, write summaries, prune."""
        clock = self.clock
        end = clock.day_end(day)
        out = Outcome(changed={"log"})
        if self.settings.get("auto_approve") == "day_end":
            for completion in self.log["completions"]:
                if completion.get("state") == "pending" and clock.chore_date(_at(completion["at"])) == day:
                    self._approve(completion, end, AUTO, None, AUTO, out)
        index = self._index()
        by_member = self._items_on(day, index)
        policy = self.policy_on(day)
        week_ends = clock.week_end(day) == day + timedelta(days=1)
        week = clock.week_start(day)
        week_items = self._week_items(week, index) if week_ends else {}
        for member_id in self.member_ids():
            found = by_member.get(member_id, [])
            missed: list[str] = []
            carried: list[str] = []
            for item in found:
                due = item.occ.due
                if item.section == "overdue" or due is None or clock.due_day(due) != day:
                    continue
                if item.status not in OPEN:
                    continue
                if policy == "carry_over":
                    self.log["carried"].append(self._carry(item.occ, day))
                    carried.append(item.occ.key)
                else:
                    missed.append(item.occ.key)
                    out.events.append(ChoreEvent("missed", member_id, self._missed_data(item.occ)))
            self.log["summaries"].append(self._day_summary(member_id, day, found, missed, carried))
            if week_ends:
                self.log["summaries"].append(
                    self._week_summary(member_id, week, day + timedelta(days=1), week_items.get(member_id, {}))
                )
        self._tidy_carried(day, index)
        self._prune(end)
        for activity in self.plan["activities"]:
            if (
                activity.get("schedule") in ("once", "repeats")
                and not activity.get("finished_at")
                and not self._has_open(activity, rolled_over=day)
            ):
                activity["finished_at"] = end.isoformat()
                out.changed.add("plan")
        self.log["last_day"] = day.isoformat()
        self.log["last_boundary"] = end.isoformat()
        return out

    def _carry(self, occ: Occurrence, day: date) -> dict[str, Any]:
        return {
            "key": occ.key, "chore": occ.chore, "owner": occ.owner, "member": occ.member,
            "period": occ.period, "n": occ.n, "due": occ.due.isoformat() if occ.due else None,
            "band": occ.band, "credit_minutes": occ.credit_minutes, "stars": occ.stars,
            "window": occ.window, "since": day.isoformat(),
        }

    def _missed_data(self, occ: Occurrence) -> dict[str, Any]:
        activity = self.activity(occ.chore)
        return {
            "chore": occ.chore, "chore_name": activity["name"] if activity else occ.chore,
            "occurrence": occ.key, "member": occ.member, "done_by": None, "source": None, "stars": 0,
            "state": "missed",
        }

    def _day_summary(self, member_id: str, day: date, found: list[Item], missed: list[str], carried: list[str]) -> dict[str, Any]:
        counted = [i for i in found if i.counted]
        due = [i for i in counted if i.status not in ("away", "excused")]
        tally = self.stats(counted)
        chores: dict[str, dict[str, int]] = {}
        for item in due:
            entry = chores.setdefault(item.occ.chore, {"due": 0, "done": 0})
            entry["due"] += 1
            entry["done"] += int(item.status in CREDITED)
        member = self.member(member_id) or {}
        return {
            "member": member_id,
            "period": f"day:{day.isoformat()}",
            **tally,
            "missed": missed,
            "carried": carried,
            "excused": [i.occ.key for i in counted if i.status == "excused"],
            "away": away_on(member, day) is not None,
            "closed": bool(due) and all(i.status in CREDITED for i in due),
            "chores": chores,
        }

    def _week_summary(self, member_id: str, week: date, end: date, items: Mapping[str, Item]) -> dict[str, Any]:
        found = list(items.values())
        due = [i for i in found if i.status not in ("away", "excused")]
        late = [i.occ.key for i in due if i.status in OPEN]
        member = self.member(member_id) or {}
        days = [week + timedelta(days=n) for n in range((end - week).days)]
        return {
            "member": member_id,
            "period": f"week:{week.isoformat()}",
            **self.stats(found),
            "missed": [k for k in late if self.policy_on(self.clock.due_day(items[k].occ.due)) != "carry_over"],
            "carried": [k for k in late if self.policy_on(self.clock.due_day(items[k].occ.due)) == "carry_over"],
            "excused": [i.occ.key for i in found if i.status == "excused"],
            "away": bool(days) and all(away_on(member, d) is not None for d in days),
            "closed": bool(due) and not late,
            "contribution": self.contribution(member_id, week, end),
        }

    def _tidy_carried(self, day: date, index: _Index) -> None:
        """Drop overdue records once they are done or excused, or their chore or person is gone."""
        members = set(self.member_ids())
        self.log["carried"] = [
            c for c in self.log["carried"]
            if c["member"] in members and self.activity(c["chore"]) is not None and self._open_carried(c, index)
        ]

    def _prune(self, end: datetime) -> None:
        """Completions, overrides, and resolved requests older than 90 days go (spec 7.7)."""
        cutoff = end - RETENTION
        log = self.log
        log["completions"] = [c for c in log["completions"] if _at(c["at"]) >= cutoff]
        log["overrides"] = [o for o in log["overrides"] if _at(o["at"]) >= cutoff]
        log["requests"] = [r for r in log["requests"] if r.get("state") == "open" or _at(r["at"]) >= cutoff]
        self.rewards["redemptions"] = [
            r for r in self.rewards["redemptions"] if r.get("state") == "requested" or _at(r["at"]) >= cutoff
        ]
```

- [ ] **Step 5: Run them again.** Same command. Expected: `81 passed`.
- [ ] **Step 6: Run the whole backend suite.** Expected: `834 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): the chores engine` with the trailers.

---

### Task 4: Who may change chores outside the card

Spec 9.5 and 10.4: actions and to-do lists have no PIN session, so milestone 2's `member_level` and `parent_level` run with none: an automation, an admin, or a parent's own account may do anything; a member's own account only their own items; a shared screen (or an account linked to no one) only the items of people without a PIN. Mistakes read in plain words and become translated action errors. The household's WebSocket helpers become public so chores can share them.

**Files:**
- Create: `custom_components/planavista/chores/access.py`
- Modify: `custom_components/planavista/household/websocket.py` (helper names only)
- Test: `tests/test_chores_access.py`

**Interfaces:**
- Consumes: `Account`, `AUTOMATION`, `member_level`, `parent_level` (`household/permissions.py`); `ChoreError` (Task 2).
- Produces: `household/websocket.py` exports `household_for(hass, connection, msg)`, `account_for(hass, household, user)`, `session_for(household, connection, msg)`, `refuse(connection, msg, account)`, `parent_for(hass, connection, msg, *, needs_file=True)` (renamed from the leading-underscore names; behavior unchanged). `chores/access.py`: `MESSAGES`, `message(err)`, `service_error(err) -> ServiceValidationError` (own keys `unknown_member`, `unknown_chore`, `unknown_request`, `unknown_reward`, `not_enough_stars`; schedule rules as `invalid_schedule`; the rest `invalid_chore`, both with `{reason}`), `not_allowed()`, `async_account(hass, household, context) -> Account`, `resolve_member(household, value) -> str`, `member_by(household, account, member_id) -> str`, `parent_by(account) -> str`, `source_of(account) -> str`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_access.py` (new):

```python
"""Who may change chores through actions and to-do lists, and how mistakes read (spec 9.5, 10.4, 11.7)."""
from __future__ import annotations

from typing import Any

import pytest

from homeassistant.exceptions import ServiceValidationError

from custom_components.planavista.chores.access import (
    MESSAGES,
    member_by,
    message,
    parent_by,
    resolve_member,
    service_error,
    source_of,
)
from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.household.permissions import Account


class FakeHousehold:
    """The parts of a household the access rules read."""

    def __init__(self) -> None:
        self.members: list[dict[str, Any]] = [
            {"id": "alex", "person": "person.alex", "parent": True},
            {"id": "casey", "person": "person.casey", "parent": False},
            {"id": "dana", "person": None, "parent": False},
        ]
        self.pins: dict[str, Any] = {"casey": {"hash": "..."}}

    def member(self, member_id: str) -> dict[str, Any] | None:
        return next((m for m in self.members if m["id"] == member_id), None)


HOUSEHOLD = FakeHousehold()
AUTOMATION = Account(user_id=None)
ADMIN = Account(user_id="u-admin", is_admin=True)
ALEX = Account(user_id="u-alex", member_id="alex", member_is_parent=True)
CASEY = Account(user_id="u-casey", member_id="casey")
KITCHEN = Account(user_id="u-kitchen", shared=True)
GUEST = Account(user_id="u-guest")


@pytest.mark.parametrize(
    ("account", "target", "expected"),
    [
        (AUTOMATION, "casey", "automation"),
        (ADMIN, "casey", "admin"),
        (ALEX, "casey", "alex"),
        (CASEY, "casey", "casey"),
        (CASEY, "dana", None),
        (KITCHEN, "dana", "dana"),
        (KITCHEN, "casey", None),
        (GUEST, "dana", "dana"),
        (GUEST, "casey", None),
    ],
)
def test_member_level_without_a_session(account: Account, target: str, expected: str | None) -> None:
    if expected is None:
        with pytest.raises(ServiceValidationError) as err:
            member_by(HOUSEHOLD, account, target)
        assert err.value.translation_key == "not_allowed"
    else:
        assert member_by(HOUSEHOLD, account, target) == expected


@pytest.mark.parametrize(
    ("account", "expected"),
    [(AUTOMATION, "automation"), (ADMIN, "admin"), (ALEX, "alex"), (CASEY, None), (KITCHEN, None), (GUEST, None)],
)
def test_parent_level_without_a_session(account: Account, expected: str | None) -> None:
    if expected is None:
        with pytest.raises(ServiceValidationError):
            parent_by(account)
    else:
        assert parent_by(account) == expected


def test_members_by_id_or_person() -> None:
    assert resolve_member(HOUSEHOLD, "casey") == "casey"
    assert resolve_member(HOUSEHOLD, "person.casey") == "casey"
    for value in ("erin", "person.erin", None, 3):
        with pytest.raises(ServiceValidationError) as err:
            resolve_member(HOUSEHOLD, value)
        assert err.value.translation_key == "unknown_member"


def test_where_a_change_came_from() -> None:
    assert [source_of(a) for a in (AUTOMATION, ADMIN, ALEX, CASEY, KITCHEN, GUEST)] == [
        "automation", "phone", "phone", "phone", "tablet", "tablet",
    ]


def test_mistakes_read_in_plain_words() -> None:
    assert message(ChoreError("shares_mismatch")) == "Everyone's share has to add up to the time."
    assert message(ChoreError("invalid_once", "Pick today or a later day.")) == "Pick today or a later day."
    assert message(ChoreError("brand_new_rule")) == "That change can't be saved."
    assert all(text.endswith(".") and chr(0x2014) not in text for text in MESSAGES.values())


def test_mistakes_become_translated_action_errors() -> None:
    own = service_error(ChoreError("not_enough_stars"))
    assert (own.translation_key, own.translation_placeholders) == ("not_enough_stars", None)
    schedule = service_error(ChoreError("invalid_repeats", "Chores repeat daily, weekly, or monthly."))
    assert (schedule.translation_key, schedule.translation_placeholders) == (
        "invalid_schedule", {"reason": "Chores repeat daily, weekly, or monthly."},
    )
    other = service_error(ChoreError("reason_required"))
    assert (other.translation_key, other.translation_placeholders) == ("invalid_chore", {"reason": "Add a reason."})
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_access.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.access'`.

- [ ] **Step 3: Make the household helpers public.**

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index f5950a0..1c7b6f9 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -89,7 +89,7 @@ def _monotonic() -> float:
 
 
 @callback
-def _account(hass: HomeAssistant, household: Household, user: User) -> Account:
+def account_for(hass: HomeAssistant, household: Household, user: User) -> Account:
     """What kind of account `user` is: linked through a person to a member, or not."""
     member = None
     for state in hass.states.async_all("person"):
@@ -116,11 +116,11 @@ def _screens_need_parent_pin(
     An upgraded wall tablet is often an account linked to no one and not
     marked shared, so the account making the change counts too.
     """
-    return bool(household.shared_users) or _account(hass, household, connection.user).screen_rules
+    return bool(household.shared_users) or account_for(hass, household, connection.user).screen_rules
 
 
 @callback
-def _session(
+def session_for(
     household: Household, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> SessionView | None:
     """The command's session when it names a live one on this connection (counts as activity)."""
@@ -129,7 +129,7 @@ def _session(
 
 
 @callback
-def _household(
+def household_for(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> Household | None:
     household = hass.data.get(DATA_HOUSEHOLD)
@@ -139,7 +139,7 @@ def _household(
 
 
 @callback
-def _refuse(
+def refuse(
     connection: websocket_api.ActiveConnection, msg: dict[str, Any], account: Account
 ) -> None:
     if account.screen_rules:
@@ -151,7 +151,7 @@ def _refuse(
 
 
 @callback
-def _parent(
+def parent_for(
     hass: HomeAssistant,
     connection: websocket_api.ActiveConnection,
     msg: dict[str, Any],
@@ -159,13 +159,13 @@ def _parent(
     needs_file: bool = True,
 ) -> tuple[Household, str] | None:
     """The household and who acts as a parent, or None after saying why not."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return None
-    account = _account(hass, household, connection.user)
-    by = parent_level(account, _session(household, connection, msg))
+    account = account_for(hass, household, connection.user)
+    by = parent_level(account, session_for(household, connection, msg))
     if by is None:
-        _refuse(connection, msg, account)
+        refuse(connection, msg, account)
         return None
     if needs_file and not household.available:
         connection.send_error(
@@ -187,7 +187,7 @@ def _member_error(
 @callback
 def _view(hass: HomeAssistant, household: Household, user: User) -> dict[str, Any]:
     """What one account sees: people (never PIN data), its own kind, and setup progress."""
-    account = _account(hass, household, user)
+    account = account_for(hass, household, user)
     return {
         "available": household.available,
         "members": [
@@ -217,7 +217,7 @@ def ws_household_subscribe(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Send the household now and after every change, until unsubscribed."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return
 
@@ -246,7 +246,7 @@ async def ws_member_save(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Add someone, or change them (with the revision the editor started from)."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -288,7 +288,7 @@ async def ws_member_delete(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Remove someone. Their calendars stay and belong to no one."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -338,7 +338,7 @@ async def ws_member_reorder(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Put people in a new order (the order on the board and in PIN prompts)."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -363,7 +363,7 @@ async def ws_shared_screen(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Mark or unmark the account this screen signs in with as a shared family screen."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -392,7 +392,7 @@ async def ws_settings_save(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Household-wide PIN settings (today, Shuffle the keypad)."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -415,7 +415,7 @@ async def ws_setup_save(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Where first-run setup picks up, and whether it is finished."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -443,7 +443,7 @@ async def ws_config_save(
 
     Display settings merge into the saved ones (a None value removes one).
     """
-    if _parent(hass, connection, msg, needs_file=False) is None:
+    if parent_for(hass, connection, msg, needs_file=False) is None:
         return
     changes = {
         key: msg[key]
@@ -464,16 +464,16 @@ def _pin_manager(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> tuple[Household, str | None] | None:
     """The household and this command's session token, when the account may manage the PIN."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return None
     if household.member(msg["member_id"]) is None:
         connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
         return None
-    account = _account(hass, household, connection.user)
-    session = _session(household, connection, msg)
+    account = account_for(hass, household, connection.user)
+    session = session_for(household, connection, msg)
     if may_manage_pin(account, session, msg["member_id"]) is None:
-        _refuse(connection, msg, account)
+        refuse(connection, msg, account)
         return None
     if not household.available:
         connection.send_error(
@@ -495,7 +495,7 @@ async def ws_pin_unlock(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Check a PIN and start parent mode (a parent) or the member's own session."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return
     member_id = msg["member_id"]
@@ -622,7 +622,7 @@ async def ws_pin_clear_lockout(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """A parent ends a pause after too many wrong tries (spec 9.6)."""
-    context = _parent(hass, connection, msg)
+    context = parent_for(hass, connection, msg)
     if context is None:
         return
     household, _by = context
@@ -640,7 +640,7 @@ def ws_pin_lock(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """End a session now (Lock, or the page was hidden)."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return
     if household.sessions.get(msg["session"], connection, _monotonic()) is not None:
@@ -657,7 +657,7 @@ def ws_pin_touch(
     hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
 ) -> None:
     """Someone is using the screen: keep the session open."""
-    household = _household(hass, connection, msg)
+    household = household_for(hass, connection, msg)
     if household is None:
         return
     if household.sessions.get(msg["session"], connection, _monotonic(), touch=True) is None:
```

- [ ] **Step 4: Write the access rules.**

`custom_components/planavista/chores/access.py` (new):

```python
"""Who may change chores through actions and to-do lists, and how mistakes read (spec 9.5, 10.4).

Actions and to-do lists have no PIN session, so the rule in
household/permissions.py runs with none: an automation, an admin, or a
parent's own account may do anything; a member's own account only their own
items; a shared screen (or an account linked to no one) only the items of
people without a PIN. People with a PIN act through the card.
"""
from __future__ import annotations

from typing import Any

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from ..const import DOMAIN
from ..household.permissions import AUTOMATION, Account, member_level, parent_level
from ..household.store import Household
from ..household.websocket import account_for
from .model import ChoreError

# What a broken rule says, in plain words (spec 11.7). Shared by actions and the card.
MESSAGES: dict[str, str] = {
    "name_required": "Add a name.",
    "name_too_long": "Use a name of 60 letters or fewer.",
    "invalid_icon": "Pick an emoji or an icon.",
    "invalid_category": "Pick a category.",
    "invalid_schedule": "Pick Plan, Once, or Repeats.",
    "invalid_assignees": "Pick each person once.",
    "unknown_member": "That person isn't in the household.",
    "unknown_chore": "That chore isn't in the plan.",
    "unknown_request": "That request was already answered.",
    "unknown_reward": "That reward isn't in the catalog.",
    "invalid_on_board": "Show on the board is on or off.",
    "invalid_needs_ok": "Needs a parent's OK is on or off.",
    "invalid_stars": "Stars are a whole number from 0 to 100.",
    "invalid_label": "Use a label of 30 letters or fewer.",
    "invalid_minimum": "Add the time per day or per week.",
    "invalid_split": "Split the time, or each does it all.",
    "shares_mismatch": "Everyone's share has to add up to the time.",
    "invalid_days": "Pick days of the week.",
    "invalid_bands": "Pick morning, afternoon, or evening.",
    "invalid_times": "Check-offs are a whole number from 1 to 12.",
    "invalid_set_time": "Use a time such as 17:30.",
    "invalid_once": "Pick a day, a date to finish by, or any time.",
    "invalid_sessions": "Sessions are a whole number from 1 to 20.",
    "invalid_estimate": "About how long is from 1 minute to 24 hours.",
    "invalid_repeats": "That repeating rule isn't one PlanaVista can follow.",
    "invalid_missed": "Pick what happens to missed chores.",
    "invalid_day_starts": "The day starts between midnight and 6:00 AM.",
    "invalid_auto_approve": "Approving automatically is on or off.",
    "invalid_minutes_per_star": "Stars are 1 per 1 to 240 minutes.",
    "invalid_evening_check": "Use a time such as 19:00, or turn the evening check off.",
    "invalid_sound": "Sound is on or off.",
    "invalid_cost": "A reward costs from 1 to 10,000 stars.",
    "invalid_who": "Pick each person once.",
    "invalid_request": "Ask for more time or to skip.",
    "invalid_until": "Pick a later day, within 60 days.",
    "invalid_planned_day": "Pick a day before it's due.",
    "invalid_due": "Pick today or a later day.",
    "nothing_to_change": "Nothing to change.",
    "not_open": "That chore isn't open anymore.",
    "not_for_member": "That reward isn't one they can get.",
    "not_enough_stars": "Not enough stars yet.",
    "reason_required": "Add a reason.",
    "too_many": "There are too many to add another.",
    "changed": "This changed on another screen.",
}

# Mistakes with their own translated message in strings.json; every other rule
# reads "{reason}" through invalid_chore.
OWN_TRANSLATIONS = frozenset(
    {"unknown_member", "unknown_chore", "unknown_request", "unknown_reward", "not_enough_stars"}
)
SCHEDULE_CODES = frozenset(
    {"invalid_schedule", "invalid_once", "invalid_repeats", "invalid_minimum", "invalid_days",
     "invalid_times", "invalid_sessions", "invalid_estimate", "shares_mismatch", "invalid_split"}
)


def message(err: ChoreError) -> str:
    """What to tell a person about a broken rule."""
    return err.detail or MESSAGES.get(err.code, "That change can't be saved.")


def service_error(err: ChoreError) -> ServiceValidationError:
    """A broken rule as an action's translated error (spec 10.4)."""
    if err.code in OWN_TRANSLATIONS:
        return ServiceValidationError(translation_domain=DOMAIN, translation_key=err.code)
    key = "invalid_schedule" if err.code in SCHEDULE_CODES else "invalid_chore"
    return ServiceValidationError(
        translation_domain=DOMAIN, translation_key=key, translation_placeholders={"reason": message(err)}
    )


def not_allowed() -> ServiceValidationError:
    """The account may not do this here (people with a PIN act through the card)."""
    return ServiceValidationError(translation_domain=DOMAIN, translation_key="not_allowed")


async def async_account(hass: HomeAssistant, household: Household, context: Context | None) -> Account:
    """The account behind an action or a to-do change; no user means an automation."""
    if context is None or context.user_id is None:
        return Account(user_id=None)
    user = await hass.auth.async_get_user(context.user_id)
    if user is None:
        raise not_allowed()
    return account_for(hass, household, user)


def resolve_member(household: Household, value: Any) -> str:
    """A member id from a member id or a person.* entity (spec 10.4)."""
    if isinstance(value, str):
        if value.startswith("person."):
            member = next((m for m in household.members if m.get("person") == value), None)
        else:
            member = household.member(value)
        if member is not None:
            return member["id"]
    raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_member")


def member_by(household: Household, account: Account, member_id: str) -> str:
    """Who a member-level change to `member_id`'s items is attributed to, or not_allowed."""
    by = member_level(account, None, member_id, member_id in household.pins)
    if by is None:
        raise not_allowed()
    return by


def parent_by(account: Account) -> str:
    """Who a parent-level change is attributed to, or not_allowed."""
    by = parent_level(account, None)
    if by is None:
        raise not_allowed()
    return by


def source_of(account: Account) -> str:
    """Where a change came from: an automation, a shared screen, or someone's own phone."""
    if account.kind == "automation":
        return AUTOMATION
    return "tablet" if account.screen_rules else "phone"
```

- [ ] **Step 5: Run them again.** Same command. Expected: `19 passed`.
- [ ] **Step 6: Run the whole backend suite.** Expected: `853 passed` (milestone 2's household and PIN tests unchanged); the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): who may change chores outside the card` with the trailers.

---

### Task 5: Chores in Home Assistant: files, the runtime, devices, entities, and to-do lists

Spec 6.1, 7.1, 8.9, 10.1 to 10.3, 10.6, 15.3, and 15.4. The three Store files load once per run; a damaged or missing file while chores were set up holds chores for a parent (Needs a look) without writing over anything; a newer major version keeps chores off. One runtime saves what changed (the log a second later, the rest at once), fires events, tells entities and the card, runs each day boundary on time and the missed ones at startup, follows the time zone and the calendar's first day, and keeps devices and entities in step with the household. Each member is a device with a to-do list, five sensors, a binary sensor, and an event entity; the Household device holds the household sensors and the appearance select. The to-do lists check, uncheck, add, remove, and move due dates through the engine, and Assist works through them.

**Files:**
- Create: `custom_components/planavista/chores/store.py`, `custom_components/planavista/chores/runtime.py`, `custom_components/planavista/chores/entity.py`, `custom_components/planavista/chores/sensor.py`, `custom_components/planavista/chores/binary_sensor.py`, `custom_components/planavista/chores/event.py`, `custom_components/planavista/chores/todo.py`, `custom_components/planavista/binary_sensor.py`, `custom_components/planavista/event.py`, `custom_components/planavista/todo.py`
- Modify: `custom_components/planavista/__init__.py`, `custom_components/planavista/sensor.py`, `custom_components/planavista/select.py`, `custom_components/planavista/const.py`, `custom_components/planavista/coordinator.py`, `custom_components/planavista/strings.json`, `custom_components/planavista/translations/en.json`, `tests/conftest.py`, `tests/test_select.py`
- Test: `tests/test_chores_entities.py`, `tests/test_chores_runtime.py`, `tests/test_chores_todo.py`, `tests/test_select.py`

**Interfaces:**
- Consumes: Tasks 1 to 4; `Household`, `DATA_HOUSEHOLD` (`household/store.py`).
- Produces (store): `STORE_KEYS`, `ChoresStore` (a `Store` with `write_failed`), `normalize_plan`, `normalize_log`, `normalize_rewards`, `NORMALIZERS`, `ChoresStores(hass)` with `files`, `async_load()`, `async_save(name, data) -> bool`, `write_failed`.
- Produces (runtime): `CHORES_PLATFORMS = (Platform.TODO, Platform.BINARY_SENSOR, Platform.EVENT)`; states `STATE_OFF`, `STATE_OK`, `STATE_NEEDS_A_LOOK`, `STATE_NEWER`; repair issues `chores_newer_version`, `chores_data_missing`, `chores_save_failed`; `member_device_id(member_id)`, `chores_unique_id(entry_id, owner, key)`; `ChoresUnavailable(ServiceValidationError)`; `ChoresRuntime` with `engine`, `entry`, `platforms_loaded`, `save_failed`, `errors`, `module`, `enabled`, `state`, `available`, `now()`, `require() -> ChoresEngine`, `board()`, `member_view(member_id)`, `todo_items(member_id)`, `feed()`, `async_listen(listener)`, `async_listen_entities(listener)`, `async_listen_events(listener)`, `async_notify(changed=True)`, `async_run(action) -> Outcome` (action is `(engine, now) -> Outcome`), `async_apply(outcome)`, `async_flush()`, `async_start()`, `async_stop()`, `async_sync_members()`, `async_add_platform(platform, add_entities, member_entities, household_entities=None)`, `async_set_enabled(enabled)`, `async_start_over()`; `DATA_CHORES`; `async_get_chores(hass, household) -> ChoresRuntime`.
- Produces (entities): `household_device()`, `member_device(member_id, name)`, `ChoresEntity`; `MEMBER_SENSORS`, `async_setup_chores_sensors(hass, entry, add_entities)`; platform `async_setup_entry` in `chores/todo.py`, `chores/binary_sensor.py`, `chores/event.py`, re-exported by the root platform modules. `const.SIGNAL_CONFIG_APPLIED`, sent by `coordinator.async_apply_config`.
- Produces (tests): the `chores_start` and `chores` fixtures in `tests/conftest.py` (the sample household with chores on and the sample chores, the clock at Tuesday 4:10 PM unless a test parametrizes `chores_start`).

- [ ] **Step 1: Write the failing tests and their fixture.**

`tests/conftest.py`:

```diff
diff --git a/tests/conftest.py b/tests/conftest.py
index 255eac8..e881fc3 100644
--- a/tests/conftest.py
+++ b/tests/conftest.py
@@ -253,3 +253,34 @@ async def ws_command(
             seen.append(reply)
         if reply.get("id") == message["id"] and reply.get("type") == "result":
             return reply
+
+
+CHORES_SCENE = "2026-10-13T16:10:00-05:00"
+
+
+@pytest.fixture
+def chores_start() -> str:
+    """When the chores fixture starts its clock (a test may parametrize another time)."""
+    return CHORES_SCENE
+
+
+@pytest.fixture
+async def chores(hass: HomeAssistant, household: Any, freezer: Any, chores_start: str) -> Any:
+    """The sample household with chores on and the sample chores (spec section 4).
+
+    The clock stands at `chores_start`: Tuesday, October 13, 2026, 4:10 PM in
+    America/Chicago, unless a test asks for another time.
+    """
+    from custom_components.planavista.chores.runtime import DATA_CHORES
+
+    from .chores_sample import built, sample_activities
+
+    freezer.move_to(chores_start)
+    await hass.config.async_update(time_zone="America/Chicago")
+    runtime = hass.data[DATA_CHORES]
+    await runtime.async_set_enabled(True)
+    runtime.engine.plan["activities"] = [built(a, household.members) for a in sample_activities()]
+    await runtime.stores.async_save("plan", runtime.engine.plan)
+    runtime.async_notify()
+    await hass.async_block_till_done()
+    return runtime
```

`tests/test_select.py`:

```diff
diff --git a/tests/test_select.py b/tests/test_select.py
index bea9ec8..a877df5 100644
--- a/tests/test_select.py
+++ b/tests/test_select.py
@@ -8,7 +8,7 @@ from pytest_homeassistant_custom_component.common import MockConfigEntry
 
 from homeassistant.core import HomeAssistant
 from homeassistant.exceptions import ServiceValidationError
-from homeassistant.helpers import entity_registry as er
+from homeassistant.helpers import device_registry as dr, entity_registry as er
 
 from .conftest import FakeCalendar, ws_command
 
@@ -40,10 +40,12 @@ async def test_the_select_is_pinned(hass: HomeAssistant, loaded_entry: MockConfi
     assert state is not None
     assert state.state == "light"
     assert state.attributes["options"] == ["light", "dark", "automatic"]
-    assert state.attributes["friendly_name"] == "PlanaVista appearance"
+    assert state.attributes["friendly_name"] == "Household Appearance"
     registry_entry = er.async_get(hass).async_get(ENTITY_ID)
     assert registry_entry is not None
     assert registry_entry.unique_id == f"{loaded_entry.entry_id}_appearance"
+    device = dr.async_get(hass).async_get(registry_entry.device_id)
+    assert (device.name, device.manufacturer, device.model) == ("Household", "PlanaVista", "Household")
 
 
 async def test_choosing_dark_saves_it_for_every_screen(
```

`tests/test_chores_entities.py` (new):

```python
"""Chores in Home Assistant: devices, entities, and turning chores on and off (spec 10.1, 10.2)."""
from __future__ import annotations

from typing import Any

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er

from custom_components.planavista.chores.runtime import DATA_CHORES
from custom_components.planavista.const import DOMAIN

MEMBERS = ("alex", "blair", "casey", "dana")
MEMBER_ENTITIES = (
    "todo.{}_chores",
    "sensor.{}_chores_left",
    "sensor.{}_chores_this_week",
    "sensor.{}_chore_time",
    "sensor.{}_stars",
    "sensor.{}_streak",
    "binary_sensor.{}_chores_done",
    "event.{}_chores",
)
HOUSEHOLD_ENTITIES = ("sensor.household_chores_left", "sensor.household_approvals_waiting")


async def _complete(hass: HomeAssistant, chores: Any, member: str, chore: str) -> None:
    """Check off a member's oldest open chore, as an automation."""
    await chores.async_run(lambda e, now: e.complete(now, chore=chore, member=member, by="automation", source="automation"))
    await hass.async_block_till_done()


def _chores_entities(hass: HomeAssistant) -> set[str]:
    return {
        e.entity_id for e in er.async_get(hass).entities.values()
        if e.platform == DOMAIN and "_chores_" in e.unique_id
    }


async def test_a_calendar_only_household_gets_nothing_from_chores(hass: HomeAssistant, household: Any) -> None:
    assert _chores_entities(hass) == set()
    assert "todo" not in hass.config.components
    devices = dr.async_entries_for_config_entry(dr.async_get(hass), next(iter(hass.config_entries.async_entries(DOMAIN))).entry_id)
    assert [d.name for d in devices] == ["Household"]
    assert hass.data[DATA_CHORES].state == "off"


async def test_turning_chores_on_makes_a_device_and_entities_for_everyone(hass: HomeAssistant, chores: Any) -> None:
    expected = {template.format(m) for m in MEMBERS for template in MEMBER_ENTITIES} | set(HOUSEHOLD_ENTITIES)
    assert _chores_entities(hass) == expected
    for entity_id in expected:
        assert hass.states.get(entity_id) is not None, entity_id
    dev_reg = dr.async_get(hass)
    casey = dev_reg.async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id)
    assert (casey.name, casey.manufacturer, casey.model) == ("Casey", "PlanaVista", "Household member")
    ent_reg = er.async_get(hass)
    assert {e.entity_id for e in er.async_entries_for_device(ent_reg, casey.id)} == {t.format("casey") for t in MEMBER_ENTITIES}
    household = dev_reg.async_get_device_by_identifier((DOMAIN, "household"), chores.entry.entry_id)
    assert {e.entity_id for e in er.async_entries_for_device(ent_reg, household.id)} == {
        *HOUSEHOLD_ENTITIES, "select.planavista_appearance",
    }


async def test_casey_at_tuesday_afternoon(hass: HomeAssistant, chores: Any) -> None:
    left = hass.states.get("sensor.casey_chores_left")
    assert left.state == "3"
    assert left.attributes["items"] == ["Cat care", "Cat care", "Take out the trash"]
    assert left.attributes["friendly_name"] == "Casey Chores left"
    week = hass.states.get("sensor.casey_chores_this_week")
    assert (week.state, week.attributes["unit_of_measurement"]) == ("0", "%")
    time = hass.states.get("sensor.casey_chore_time")
    assert (time.state, time.attributes["unit_of_measurement"]) == ("0.0", "min")
    assert (time.attributes["device_class"], time.attributes["state_class"]) == ("duration", "total")
    assert hass.states.get("sensor.casey_stars").state == "0"
    assert hass.states.get("sensor.casey_streak").state == "0"
    assert hass.states.get("binary_sensor.casey_chores_done").state == "off"
    assert hass.states.get("todo.casey_chores").state == "7"
    assert hass.states.get("sensor.household_chores_left").state == "8"
    assert hass.states.get("sensor.household_approvals_waiting").state == "0"
    event = hass.states.get("event.casey_chores")
    assert event.attributes["event_types"] == ["completed", "approved", "sent_back", "undone", "missed", "redeemed"]


async def test_a_check_off_updates_every_projection(hass: HomeAssistant, chores: Any) -> None:
    await _complete(hass, chores, "casey", "take_out_the_trash")
    assert hass.states.get("sensor.casey_chores_left").state == "2"
    assert hass.states.get("sensor.casey_stars").state == "1"
    assert hass.states.get("sensor.casey_chore_time").state == "15.0"
    event = hass.states.get("event.casey_chores")
    assert event.attributes["event_type"] == "completed"
    assert {k: event.attributes[k] for k in ("chore", "chore_name", "occurrence", "member", "done_by", "source", "stars", "state")} == {
        "chore": "take_out_the_trash", "chore_name": "Take out the trash",
        "occurrence": "take_out_the_trash|casey|week:2026-10-12|0", "member": "casey", "done_by": "casey",
        "source": "automation", "stars": 1, "state": "done",
    }


async def test_waiting_for_ok_shows_on_the_household_sensor(hass: HomeAssistant, chores: Any) -> None:
    await _complete(hass, chores, "dana", "feed_the_fish")
    waiting = hass.states.get("sensor.household_approvals_waiting")
    assert waiting.state == "1"
    assert waiting.attributes["completion"] == 1
    assert hass.states.get("binary_sensor.dana_chores_done").state == "off"


async def test_turning_chores_off_removes_them_and_keeps_the_data(
    hass: HomeAssistant, chores: Any, mock_config_entry: MockConfigEntry
) -> None:
    await _complete(hass, chores, "casey", "take_out_the_trash")
    await chores.async_set_enabled(False)
    await hass.async_block_till_done()
    assert _chores_entities(hass) == set()
    assert hass.states.get("todo.casey_chores") is None
    devices = dr.async_entries_for_config_entry(dr.async_get(hass), mock_config_entry.entry_id)
    assert [d.name for d in devices] == ["Household"]
    assert hass.states.get("select.planavista_appearance") is not None
    await chores.async_set_enabled(True)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.casey_stars").state == "1"


async def test_people_joining_renaming_and_leaving(hass: HomeAssistant, chores: Any) -> None:
    from custom_components.planavista.household.members import add_member, remove_member, update_member

    household = chores.household
    household.members, _ = add_member(household.members, {"name": "Erin", "age_group": "older_child"})
    await household.async_save()
    await hass.async_block_till_done()
    assert hass.states.get("todo.erin_chores") is not None

    household.members, _ = update_member(household.members, "casey", {"name": "Casey Jo"}, None)
    await household.async_save()
    await hass.async_block_till_done()
    device = dr.async_get(hass).async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id)
    assert device.name == "Casey Jo"
    assert hass.states.get("sensor.casey_stars") is not None

    household.members = remove_member(household.members, "casey")
    await household.async_save()
    await hass.async_block_till_done()
    assert dr.async_get(hass).async_get_device_by_identifier((DOMAIN, "member_casey"), chores.entry.entry_id) is None
    assert hass.states.get("todo.casey_chores") is None
    assert chores.engine.activity("yard_work")["assignees"] == []
    assert chores.engine.activity("clean_the_bathroom")["assignees"] == ["blair"]
```

`tests/test_chores_runtime.py` (new):

```python
"""The chores runtime: day boundaries on time and after an outage, damaged files, saving (spec 8.9, 15.3)."""
from __future__ import annotations

from copy import deepcopy
from typing import Any
from unittest.mock import patch

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import issue_registry as ir
from homeassistant.util.file import WriteError

from custom_components.planavista.chores.model import default_log, default_rewards
from custom_components.planavista.chores.runtime import DATA_CHORES
from custom_components.planavista.const import DOMAIN

from .chores_sample import MEMBERS, built, sample_activities
from .conftest import FakeCalendar, ws_command


async def _complete(chores: Any, chore: str) -> None:
    """Casey checks off their oldest open chore of this kind, as an automation."""
    await chores.async_run(lambda e, now: e.complete(now, chore=chore, member="casey", by="automation", source="automation"))


async def test_the_day_rolls_over_at_3_am(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    freezer.move_to("2026-10-14T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.engine.log["last_day"] == "2026-10-13"
    assert hass.states.get("event.dana_chores").attributes["event_type"] == "missed"
    assert hass.states.get("sensor.casey_chores_left").state == "2"  # Wednesday: Cat care twice


def _seed(hass_storage: dict[str, Any], *, log: dict[str, Any] | None = None, skip: str | None = None, plan_version: int = 1) -> None:
    household = {
        "members": [dict(m, rev=1, color=color, color_dark=None, picture={"initial": True}, person=None, my_day="list")
                    for m, color in zip(MEMBERS, ("#F94144", "#277DA1", "#43AA8B", "#F9C74F"), strict=True)],
        "security": {"pins": {}, "shared_users": [], "shuffle_keypad": False},
        "modules": {"chores": {"enabled": True, "set_up_at": "2026-10-10T19:02:11-05:00"}},
        "setup": {"completed": True, "step": None},
        "migrations": {"people_from_calendars": True},
    }
    plan = {"settings": {"missed": "make_up", "day_starts": "03:00", "auto_approve": "day_end",
                         "minutes_per_star": 15, "evening_check": "19:00", "sound": False},
            "activities": [built(a) for a in sample_activities()]}
    files = {
        "planavista.household": (1, household),
        "planavista.chores_plan": (plan_version, plan),
        "planavista.chores_log": (1, log or default_log()),
        "planavista.chores_rewards": (1, default_rewards()),
    }
    for key, (version, data) in files.items():
        if key != skip:
            hass_storage[key] = {"version": version, "minor_version": 1, "key": key, "data": deepcopy(data)}


@pytest.fixture
async def chicago(hass: HomeAssistant, setup_calendars: dict[str, FakeCalendar]) -> None:
    """Home Assistant in the sample household's time zone, calendars loaded."""
    await hass.config.async_update(time_zone="America/Chicago")


async def _start(hass: HomeAssistant, entry: MockConfigEntry) -> Any:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return hass.data[DATA_CHORES]


async def test_an_outage_is_caught_up_at_startup(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    """Off from Monday 11 PM to Wednesday 9 AM (spec 8.16 example 5)."""
    log = default_log() | {"last_day": "2026-10-11", "last_boundary": "2026-10-12T03:00:00-05:00",
                           "weeks": {"first_day": "monday", "before": None, "since": None}}
    log["completions"] = [{
        "id": "01JAAAAAAAAAAAAAAAAAAAAAAA", "occurrence": "feed_the_fish|dana|day:2026-10-12|0", "chore": "feed_the_fish",
        "member": "dana", "done_by": "dana", "by": "dana", "at": "2026-10-12T21:00:00-05:00", "source": "tablet",
        "user": None, "state": "pending", "review": None, "credit_minutes": 5.0, "stars": 1,
    }]
    _seed(hass_storage, log=log)
    freezer.move_to("2026-10-14T09:00:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    engine = runtime.engine
    assert (engine.log["last_day"], engine.log["last_boundary"]) == ("2026-10-13", "2026-10-14T03:00:00-05:00")
    assert engine.log["completions"][0]["review"]["by"] == "auto"
    assert engine.balance("dana") == 1
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12", "day:2026-10-13"]
    assert hass.states.get("sensor.dana_stars").state == "1"


async def test_a_missing_file_holds_chores_for_a_parent(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    _seed(hass_storage, skip="planavista.chores_log")
    freezer.move_to("2026-10-13T16:10:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    assert runtime.state == "needs_a_look"
    assert hass.states.get("sensor.casey_chores_left").state == STATE_UNAVAILABLE
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_data_missing") is not None
    with pytest.raises(ServiceValidationError) as err:
        await runtime.async_run(lambda e, now: e.complete(now, chore="yard_work", member="casey", by="admin", source="tablet"))
    assert err.value.translation_key == "chores_unavailable"
    await hass.async_block_till_done()
    assert "planavista.chores_log" not in hass_storage
    await runtime.async_start_over()
    await hass.async_block_till_done()
    assert runtime.state == "ok"
    assert runtime.engine.plan["activities"] == []
    assert hass_storage["planavista.chores_log"]["data"]["completions"] == []
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_data_missing") is None
    assert hass.states.get("sensor.casey_chores_left").state == "0"


async def test_files_from_a_newer_planavista_keep_chores_off(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry
) -> None:
    _seed(hass_storage, plan_version=2)
    runtime = await _start(hass, mock_config_entry)
    assert runtime.state == "newer"
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_newer_version") is not None
    assert hass_storage["planavista.chores_plan"]["version"] == 2
    assert hass.states.get("sensor.casey_chores_left").state == STATE_UNAVAILABLE
    with pytest.raises(ServiceValidationError):
        await runtime.async_set_enabled(True)


async def test_unknown_fields_survive_a_save(
    hass: HomeAssistant, chicago: None, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry, freezer: Any
) -> None:
    _seed(hass_storage)
    hass_storage["planavista.chores_plan"]["data"]["future_field"] = {"kept": True}
    hass_storage["planavista.chores_plan"]["data"]["activities"][0]["future_field"] = 1
    freezer.move_to("2026-10-13T16:10:00-05:00")
    runtime = await _start(hass, mock_config_entry)
    await runtime.async_run(lambda e, now: e.save_activity(
        now, {"name": "Wash the car", "schedule": "once", "assignees": ["alex"], "once": {}}, by="admin", source="tablet"
    ))
    await hass.async_block_till_done()
    saved = hass_storage["planavista.chores_plan"]["data"]
    assert saved["future_field"] == {"kept": True}
    assert saved["activities"][0]["future_field"] == 1


async def test_a_failed_write_raises_a_repair_and_tells_the_card(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    with patch("homeassistant.helpers.storage.Store._async_write_data", side_effect=WriteError("disk full")):
        await _complete(chores, "yard_work")
        freezer.tick(2)
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
    assert chores.save_failed is True
    assert chores.feed()["save_failed"] is True
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_save_failed") is not None
    await _complete(chores, "take_out_the_trash")
    freezer.tick(2)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.save_failed is False
    assert ir.async_get(hass).async_get_issue(DOMAIN, "chores_save_failed") is None


async def test_check_offs_are_saved_before_the_entry_unloads(
    hass: HomeAssistant, chores: Any, hass_storage: dict[str, Any], mock_config_entry: MockConfigEntry
) -> None:
    await _complete(chores, "yard_work")
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    saved = hass_storage["planavista.chores_log"]["data"]["completions"]
    assert [c["occurrence"] for c in saved] == ["yard_work|casey|week:2026-10-12|0"]


async def test_the_calendars_first_day_moves_chore_weeks_from_the_next_week(
    hass: HomeAssistant, chores: Any, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/config/save", "display": {"first_day": "sunday"}})
    assert reply["success"]
    await hass.async_block_till_done()
    assert chores.engine.log["weeks"] == {"first_day": "sunday", "before": "monday", "since": "2026-10-19"}


async def test_a_new_time_zone_moves_the_next_boundary(hass: HomeAssistant, chores: Any) -> None:
    await hass.config.async_update(time_zone="America/Los_Angeles")
    await hass.async_block_till_done()
    assert chores.engine.next_boundary(chores.now()).isoformat() == "2026-10-14T03:00:00-07:00"
```

`tests/test_chores_todo.py` (new):

```python
"""Each member's chores as a to-do list, and Assist through it (spec 10.3, 10.6, 9.5)."""
from __future__ import annotations

from datetime import date
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import intent
from homeassistant.setup import async_setup_component

from .conftest import set_pin

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"


async def _items(hass: HomeAssistant, entity_id: str) -> list[dict[str, Any]]:
    result = await hass.services.async_call(
        TODO_DOMAIN, "get_items", {}, target={"entity_id": entity_id}, blocking=True, return_response=True
    )
    return result[entity_id]["items"]


async def _update(hass: HomeAssistant, entity_id: str, data: dict[str, Any], user: MockUser | None = None) -> None:
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", data, target={"entity_id": entity_id}, blocking=True,
        context=Context(user_id=user.id) if user else None,
    )
    await hass.async_block_till_done()


def _last(chores: Any) -> dict[str, Any]:
    return chores.engine.log["completions"][-1]


async def test_the_list_holds_todays_items(hass: HomeAssistant, chores: Any) -> None:
    items = await _items(hass, "todo.casey_chores")
    assert [(i["uid"], i["summary"], i["status"]) for i in items] == [
        ("cat_care|casey|day:2026-10-13|0", "Cat care", "needs_action"),
        ("clean_out_the_garage|casey|once|0", "Clean out the garage", "needs_action"),
        ("clean_out_the_garage|casey|once|1", "Clean out the garage", "needs_action"),
        ("cat_care|casey|day:2026-10-13|1", "Cat care", "needs_action"),
        (TRASH, "Take out the trash", "needs_action"),
        ("clean_the_bathroom|casey|week:2026-10-12|0", "Clean the bathroom", "needs_action"),
        ("yard_work|casey|week:2026-10-12|0", "Yard work", "needs_action"),
    ]
    garage = items[1]
    assert (garage["due"], garage["description"]) == ("2026-10-18", "Due Sun")
    assert items[4]["due"] == "2026-10-18"
    assert items[5]["description"] == "This week"


async def test_checking_an_item_completes_it_through_the_engine(hass: HomeAssistant, chores: Any) -> None:
    await _update(hass, "todo.casey_chores", {"item": "Take out the trash", "status": "completed"})
    assert (_last(chores)["occurrence"], _last(chores)["source"], _last(chores)["by"]) == (TRASH, "automation", "automation")
    items = {i["uid"]: i for i in await _items(hass, "todo.casey_chores")}
    assert items[TRASH]["status"] == "completed"
    assert hass.states.get("todo.casey_chores").state == "6"
    await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "needs_action"})
    assert _last(chores)["state"] == "undone"
    assert hass.states.get("sensor.casey_stars").state == "0"


async def test_waiting_for_ok_shows_as_checked_with_a_note(hass: HomeAssistant, chores: Any) -> None:
    await _update(hass, "todo.dana_chores", {"item": "Feed the fish", "status": "completed"})
    fish = next(i for i in await _items(hass, "todo.dana_chores") if i["uid"] == FISH)
    assert (fish["status"], fish["description"]) == ("completed", "Waiting for a parent's OK")


async def test_own_accounts_change_only_their_own_items(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "completed"}, accounts["casey"])
    assert (_last(chores)["source"], _last(chores)["by"], _last(chores)["user"]) == ("phone", "casey", accounts["casey"].id)
    with pytest.raises(ServiceValidationError) as err:
        await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["casey"])
    assert err.value.translation_key == "not_allowed"
    await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["alex"])
    assert _last(chores)["by"] == "alex"


async def test_a_shared_screen_needs_the_card_for_people_with_a_pin(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["kitchen"])
    assert (_last(chores)["source"], _last(chores)["by"]) == ("tablet", "dana")
    with pytest.raises(ServiceValidationError):
        await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "completed"}, accounts["kitchen"])


async def test_a_due_date_is_a_parents_change(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    yard = "yard_work|casey|week:2026-10-12|0"
    with pytest.raises(ServiceValidationError):
        await _update(hass, "todo.casey_chores", {"item": yard, "due_date": "2026-10-25"}, accounts["casey"])
    await _update(hass, "todo.casey_chores", {"item": yard, "due_date": "2026-10-25"}, accounts["alex"])
    item = next(i for i in await _items(hass, "todo.casey_chores") if i["uid"] == yard)
    assert item["due"] == "2026-10-25"


async def test_renaming_belongs_to_settings(hass: HomeAssistant, chores: Any) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _update(hass, "todo.casey_chores", {"item": TRASH, "rename": "Trash"})
    assert err.value.translation_key == "rename_not_supported"


async def test_adding_an_item_makes_a_once_chore(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    await hass.services.async_call(
        TODO_DOMAIN, "add_item", {"item": "Brush teeth", "due_date": date(2026, 10, 14)},
        target={"entity_id": "todo.casey_chores"}, blocking=True, context=Context(user_id=accounts["casey"].id),
    )
    await hass.async_block_till_done()
    chore = chores.engine.activity("brush_teeth")
    assert (chore["schedule"], chore["assignees"], chore["needs_ok"]) == ("once", ["casey"], True)
    assert chore["once"] | {} == {"on": None, "by": "2026-10-14", "by_time": None, "sessions": 1, "estimate_minutes": 15}
    assert chore["created"]["by"] == "casey" and chore["created"]["source"] == "phone"
    await hass.services.async_call(
        TODO_DOMAIN, "add_item", {"item": "Return library books"},
        target={"entity_id": "todo.casey_chores"}, blocking=True, context=Context(user_id=accounts["alex"].id),
    )
    assert chores.engine.activity("return_library_books")["needs_ok"] is False


async def test_only_once_chores_can_be_removed(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    alex = Context(user_id=accounts["alex"].id)
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": TRASH}, target={"entity_id": "todo.casey_chores"},
                                       blocking=True, context=alex)
    assert err.value.translation_key == "delete_not_once"
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": "clean_out_the_garage|casey|once|0"},
                                       target={"entity_id": "todo.casey_chores"}, blocking=True,
                                       context=Context(user_id=accounts["casey"].id))
    await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": "clean_out_the_garage|casey|once|0"},
                                   target={"entity_id": "todo.casey_chores"}, blocking=True, context=alex)
    assert chores.engine.activity("clean_out_the_garage") is None


async def test_assist_marks_an_item_done_as_voice(hass: HomeAssistant, chores: Any) -> None:
    assert await async_setup_component(hass, "intent", {})
    await hass.async_block_till_done()  # intent platforms register in the background
    await intent.async_handle(
        hass, "test", "HassListCompleteItem", {"name": {"value": "Casey Chores"}, "item": {"value": "take out the trash"}},
    )
    await hass.async_block_till_done()
    assert (_last(chores)["occurrence"], _last(chores)["source"], _last(chores)["done_by"]) == (TRASH, "voice", "casey")


async def test_assist_adds_to_a_list_and_it_waits_for_an_ok(hass: HomeAssistant, chores: Any) -> None:
    assert await async_setup_component(hass, "intent", {})
    await hass.async_block_till_done()  # intent platforms register in the background
    await intent.async_handle(
        hass, "test", "HassListAddItem", {"name": {"value": "Casey Chores"}, "item": {"value": "clean the closet"}},
    )
    await hass.async_block_till_done()
    chore = chores.engine.activity("clean_the_closet")
    assert (chore["name"], chore["needs_ok"], chore["created"]["source"]) == ("Clean the closet", True, "voice")


async def test_two_items_with_one_name_check_off_the_open_one(hass: HomeAssistant, chores: Any) -> None:  # Review Focus 3
    await _update(hass, "todo.casey_chores", {"item": "Cat care", "status": "completed"})
    await _update(hass, "todo.casey_chores", {"item": "Cat care", "status": "completed"})
    done = [c["occurrence"] for c in chores.engine.log["completions"] if c["chore"] == "cat_care"]
    assert done == ["cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1"]
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_select.py tests/test_chores_entities.py tests/test_chores_runtime.py tests/test_chores_todo.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.runtime'`.

- [ ] **Step 3: Write the Store files.**

`custom_components/planavista/chores/store.py` (new):

```python
"""The chores Store files: the plan, the log, and rewards (spec sections 7.1 and 7.8).

Each starts at version 1, minor version 1. Loading keeps every field it
doesn't know and drops only records too damaged to use. Home Assistant moves
a damaged file aside and returns nothing, and a file from a newer major
version raises UnsupportedStorageVersionError; the runtime decides what each
means for the household.
"""
from __future__ import annotations

from collections.abc import Mapping
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import DOMAIN
from .model import DEFAULT_SETTINGS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_MINOR_VERSION = 1
STORE_KEYS = {
    "plan": f"{DOMAIN}.chores_plan",
    "log": f"{DOMAIN}.chores_log",
    "rewards": f"{DOMAIN}.chores_rewards",
}

# Records missing any of these are too damaged to use and are dropped on load.
_REQUIRED: dict[str, tuple[str, ...]] = {
    "completions": ("id", "occurrence", "chore", "member", "done_by", "at", "state", "credit_minutes", "stars"),
    "overrides": ("occurrence", "at"),
    "requests": ("id", "kind", "occurrence", "chore", "member", "state", "at"),
    "carried": ("key", "chore", "owner", "member", "period", "n", "credit_minutes", "stars", "since"),
    "summaries": ("member", "period"),
    "rewards": ("id", "name", "cost"),
    "ledger": ("member", "delta"),
    "redemptions": ("id", "member", "reward", "cost", "state", "at"),
}


class ChoresStore(Store[dict[str, Any]]):
    """A Store that remembers whether its last write failed.

    Home Assistant logs a failed write (a full disk, say) and carries on; the
    runtime turns this flag into a repair issue and a "Couldn't save".
    """

    write_failed = False

    async def _async_write_data(self, data: dict) -> None:
        try:
            await super()._async_write_data(data)
        except Exception:
            self.write_failed = True
            raise
        self.write_failed = False


def _records(value: object, name: str) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    required = _REQUIRED[name]
    return [dict(r) for r in value if isinstance(r, Mapping) and all(k in r for k in required)]


def normalize_plan(data: object) -> dict[str, Any]:
    """The stored plan with missing parts filled in. Nothing unknown is dropped."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    settings = doc.get("settings")
    doc["settings"] = {**DEFAULT_SETTINGS, **(dict(settings) if isinstance(settings, Mapping) else {})}
    activities = doc.get("activities")
    doc["activities"] = (
        [
            dict(a) for a in activities
            if isinstance(a, Mapping) and isinstance(a.get("id"), str) and isinstance(a.get("name"), str)
            and a.get("schedule") in ("plan", "once", "repeats")
        ]
        if isinstance(activities, list)
        else []
    )
    return doc


def normalize_log(data: object) -> dict[str, Any]:
    """The stored log with missing parts filled in."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    for name in ("completions", "overrides", "requests", "carried", "summaries"):
        doc[name] = _records(doc.get(name), name)
    if not isinstance(doc.get("totals"), Mapping):
        doc["totals"] = {}
    for name in ("last_day", "last_boundary"):
        if not isinstance(doc.get(name), str):
            doc[name] = None
    for name in ("weeks", "policy"):
        if not isinstance(doc.get(name), Mapping):
            doc[name] = None
    return doc


def normalize_rewards(data: object) -> dict[str, Any]:
    """The stored rewards with missing parts filled in."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    for name in ("rewards", "ledger", "redemptions"):
        doc[name] = _records(doc.get(name), name)
    return doc


NORMALIZERS = {"plan": normalize_plan, "log": normalize_log, "rewards": normalize_rewards}


class ChoresStores:
    """The three chores Store files."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Make the Stores; nothing is read yet."""
        self.files: dict[str, ChoresStore] = {
            name: ChoresStore(
                hass,
                STORAGE_VERSION,
                key,
                minor_version=STORAGE_MINOR_VERSION,
                private=True,
                atomic_writes=True,
            )
            for name, key in STORE_KEYS.items()
        }

    async def async_load(self) -> dict[str, Any | None]:
        """Each file's data, or None for a file that is missing or was moved aside.

        UnsupportedStorageVersionError (a newer major version) propagates.
        """
        return {name: await store.async_load() for name, store in self.files.items()}

    async def async_save(self, name: str, data: dict[str, Any]) -> bool:
        """Write one file now; False when the write failed."""
        store = self.files[name]
        await store.async_save(data)
        return not store.write_failed

    @property
    def write_failed(self) -> bool:
        """Whether any file's last write failed."""
        return any(store.write_failed for store in self.files.values())
```

- [ ] **Step 4: Write the runtime, and send a signal when settings are applied.**

`custom_components/planavista/chores/runtime.py` (new):

```python
"""The chores engine inside Home Assistant (spec sections 6.1, 8.9, 10.1, and 15.3).

One ChoresRuntime per Home Assistant run holds the engine and its Store
files. It saves what each write changed (the log after a second, the rest at
once), fires the events, tells the card's subscriptions and the entities, runs
every day boundary on time and the ones missed while Home Assistant was off,
and keeps devices and entities in step with the household. Chores entities
exist only while the module is on; a calendar-only household gets no to-do
lists, sensors, events, or devices from chores at all.
"""
from __future__ import annotations

from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import EVENT_CORE_CONFIG_UPDATE, EVENT_HOMEASSISTANT_FINAL_WRITE, Platform
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError, UnsupportedStorageVersionError
from homeassistant.helpers import device_registry as dr, entity_registry as er, issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_call_later, async_track_point_in_utc_time, async_track_time_interval
from homeassistant.util import dt as dt_util
from homeassistant.util.hass_dict import HassKey
from homeassistant.util.ulid import ulid_now

from ..const import CONF_DISPLAY, CONF_FIRST_DAY, DOMAIN, SIGNAL_CONFIG_APPLIED
from ..household.store import Household
from .engine import ChoreEvent, ChoresEngine, Item, Outcome
from .model import default_log, default_plan, default_rewards
from .store import NORMALIZERS, STORE_KEYS, ChoresStores

if TYPE_CHECKING:
    from homeassistant.helpers.entity import Entity
    from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

_LOGGER = logging.getLogger(__name__)

CHORES_PLATFORMS: tuple[Platform, ...] = (Platform.TODO, Platform.BINARY_SENSOR, Platform.EVENT)
LOG_SAVE_DELAY = 1.0
REFRESH_INTERVAL = timedelta(minutes=5)

STATE_OFF = "off"
STATE_OK = "ok"
STATE_NEEDS_A_LOOK = "needs_a_look"
STATE_NEWER = "newer"

ISSUE_NEWER = "chores_newer_version"
ISSUE_MISSING = "chores_data_missing"
ISSUE_SAVE = "chores_save_failed"

HOUSEHOLD_DEVICE = "household"


def member_device_id(member_id: str) -> str:
    """The device identifier of a member's device (spec 10.1)."""
    return f"member_{member_id}"


def chores_unique_id(entry_id: str, owner: str, key: str) -> str:
    """Unique ids of chores entities: `<entry>_chores_<member or household>_<key>`."""
    return f"{entry_id}_chores_{owner}_{key}"


class ChoresUnavailable(ServiceValidationError):
    """Chores are off, need a look, or were saved by a newer PlanaVista."""


@dataclass
class _Platform:
    add_entities: AddConfigEntryEntitiesCallback
    member_entities: Callable[[str], list[Entity]]
    household_entities: Callable[[], list[Entity]] | None


class ChoresRuntime:
    """The chores module for one Home Assistant run."""

    def __init__(
        self,
        hass: HomeAssistant,
        household: Household,
        stores: ChoresStores,
        documents: dict[str, dict[str, Any]],
        problem: str | None,
    ) -> None:
        """Wrap loaded documents. `problem` is needs_a_look, newer, or None."""
        self.hass = hass
        self.household = household
        self.stores = stores
        self.problem = problem
        self.engine = ChoresEngine(
            documents["plan"], documents["log"], documents["rewards"], household.members,
            tz=dt_util.get_default_time_zone(), new_id=ulid_now,
        )
        self.entry: ConfigEntry | None = None
        self.platforms_loaded = False
        self.save_failed = False
        self.errors: deque[dict[str, str]] = deque(maxlen=10)
        self._platforms: dict[str, _Platform] = {}
        self._devices: dict[str, str] = {}
        self._listeners: list[Callable[[], None]] = []
        self._entity_listeners: list[Callable[[], None]] = []
        self._event_listeners: list[Callable[[ChoreEvent], None]] = []
        self._board: dict[str, Any] | None = None
        self._unsubs: list[CALLBACK_TYPE] = []
        self._boundary: CALLBACK_TYPE | None = None
        self._log_save: CALLBACK_TYPE | None = None
        self._started = False

    # State ------------------------------------------------------------------------

    @property
    def module(self) -> dict[str, Any]:
        """The household's record of the chores module."""
        return dict(self.household.data["modules"].get("chores") or {})

    @property
    def enabled(self) -> bool:
        """Whether the household turned chores on."""
        return bool(self.module.get("enabled")) and self.household.available

    @property
    def state(self) -> str:
        """off, ok, needs_a_look (set up, but a file came back empty), or newer."""
        if self.problem == STATE_NEWER:
            return STATE_NEWER
        if not self.enabled:
            return STATE_OFF
        return self.problem or STATE_OK

    @property
    def available(self) -> bool:
        """Whether chores can be read and changed."""
        return self.state == STATE_OK

    @staticmethod
    def now() -> datetime:
        """The server's clock decides (spec 15.1)."""
        return dt_util.utcnow()

    def require(self) -> ChoresEngine:
        """The engine, or ChoresUnavailable saying why chores can't change now."""
        if self.state == STATE_OFF:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_off")
        if not self.available:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        return self.engine

    # Views ------------------------------------------------------------------------

    def board(self) -> dict[str, Any]:
        """Today's board, computed once per change."""
        if self._board is None:
            self._board = self.engine.board(self.now())
        return self._board

    def member_view(self, member_id: str) -> dict[str, Any] | None:
        """One member's part of today's board."""
        return self.board()["members"].get(member_id)

    def todo_items(self, member_id: str) -> list[Item]:
        """A member's to-do list right now."""
        return self.engine.todo_items(member_id, self.now())

    def feed(self) -> dict[str, Any]:
        """What planavista/chores/subscribe sends."""
        return {
            "state": self.state,
            "save_failed": self.save_failed,
            "board": self.board() if self.available else None,
        }

    @callback
    def async_listen(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` after every change (the card's subscriptions)."""
        return self._add(self._listeners, listener)

    @callback
    def async_listen_entities(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        """Call `listener` after every change and every few minutes (entities)."""
        return self._add(self._entity_listeners, listener)

    @callback
    def async_listen_events(self, listener: Callable[[ChoreEvent], None]) -> CALLBACK_TYPE:
        """Call `listener` with every chores event (event entities)."""
        return self._add(self._event_listeners, listener)

    @staticmethod
    def _add(listeners: list[Any], listener: Any) -> CALLBACK_TYPE:
        listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in listeners:
                listeners.remove(listener)

        return remove

    @callback
    def async_notify(self, *, changed: bool = True) -> None:
        """Tell entities (and, after a change, the card) to read again."""
        self._board = None
        for listener in list(self._entity_listeners):
            listener()
        if changed:
            for listener in list(self._listeners):
                listener()

    # Writing ----------------------------------------------------------------------

    async def async_run(self, action: Callable[[ChoresEngine, datetime], Outcome]) -> Outcome:
        """Run one engine write and apply what it did."""
        engine = self.require()
        outcome = action(engine, self.now())
        await self.async_apply(outcome)
        return outcome

    async def async_apply(self, outcome: Outcome) -> None:
        """Save what changed, fire the events, and tell everyone."""
        for name in ("plan", "rewards"):
            if name in outcome.changed:
                await self.stores.async_save(name, getattr(self.engine, name))
        if "log" in outcome.changed:
            self._schedule_log_save()
        self._check_writes()
        for event in outcome.events:
            _LOGGER.debug("Chores event %s for %s: %s", event.type, event.member, event.data.get("occurrence"))
            for listener in list(self._event_listeners):
                listener(event)
        self.async_notify(changed=bool(outcome.changed or outcome.events))
        self._schedule_boundary()

    def _schedule_log_save(self) -> None:
        if self._log_save is None:
            self._log_save = async_call_later(self.hass, LOG_SAVE_DELAY, self._async_save_log)

    async def _async_save_log(self, _now: datetime | None = None) -> None:
        self._log_save = None
        await self.stores.async_save("log", self.engine.log)
        self._check_writes()

    async def async_flush(self) -> None:
        """Write a waiting log save now (Home Assistant is stopping, or the entry unloads)."""
        if self._log_save is not None:
            self._log_save()
            await self._async_save_log()

    @callback
    def _check_writes(self) -> None:
        failed = self.stores.write_failed
        if failed and not self.save_failed:
            _LOGGER.warning("PlanaVista couldn't save chores; check the disk Home Assistant writes to")
            self.errors.append({"at": dt_util.now().isoformat(), "error": "save_failed"})
            ir.async_create_issue(
                self.hass, DOMAIN, ISSUE_SAVE, is_fixable=False,
                severity=ir.IssueSeverity.ERROR, translation_key=ISSUE_SAVE,
            )
        elif not failed and self.save_failed:
            ir.async_delete_issue(self.hass, DOMAIN, ISSUE_SAVE)
        if failed != self.save_failed:
            self.save_failed = failed
            self.async_notify()

    # Starting and stopping -------------------------------------------------------

    async def async_start(self) -> None:
        """Once Home Assistant has started: catch up on missed day boundaries, then keep time."""
        if self._started:
            return
        self._started = True
        self._unsubs.append(self.household.async_listen(self._on_household))
        self._unsubs.append(self.hass.bus.async_listen(EVENT_CORE_CONFIG_UPDATE, self._on_core_config))
        self._unsubs.append(self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_FINAL_WRITE, self._on_final_write))
        self._unsubs.append(async_track_time_interval(self.hass, self._on_refresh, REFRESH_INTERVAL))
        self._unsubs.append(async_dispatcher_connect(self.hass, SIGNAL_CONFIG_APPLIED, self._on_config_applied))
        await self.async_sync_members()
        if self.available:
            if self._sync_first_day():
                self._schedule_log_save()
            await self.async_apply(self.engine.catch_up(self.now()))
        self._schedule_boundary()

    @callback
    def async_stop(self) -> None:
        """The entry unloaded: stop every timer and listener."""
        self._started = False
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._platforms.clear()
        self._devices.clear()
        if self._boundary is not None:
            self._boundary()
            self._boundary = None

    def _schedule_boundary(self) -> None:
        if self._boundary is not None:
            self._boundary()
            self._boundary = None
        if not self._started or not self.available:
            return
        when = self.engine.next_boundary(self.now()).astimezone(UTC)
        self._boundary = async_track_point_in_utc_time(self.hass, self._on_boundary, when)

    async def _on_boundary(self, _now: datetime) -> None:
        self._boundary = None
        if self.available:
            await self.async_apply(self.engine.catch_up(self.now()))
        self._schedule_boundary()

    @callback
    def _on_refresh(self, _now: datetime) -> None:
        self.async_notify(changed=False)

    async def _on_final_write(self, _event: Event) -> None:
        await self.async_flush()

    @callback
    def _on_core_config(self, _event: Event) -> None:
        self.engine.set_time_zone(dt_util.get_default_time_zone())
        self._schedule_boundary()
        self.async_notify()

    @callback
    def _on_config_applied(self, _entry: ConfigEntry) -> None:
        """Settings were saved: the calendar's first day sets where chore weeks start."""
        if self.available and self._sync_first_day():
            self._schedule_log_save()
            self.async_notify()

    def _sync_first_day(self) -> bool:
        if self.entry is None:
            return False
        first_day = (self.entry.data.get(CONF_DISPLAY) or {}).get(CONF_FIRST_DAY) or "monday"
        return self.engine.set_first_day(first_day if first_day in ("monday", "sunday") else "monday", self.now())

    # The household ----------------------------------------------------------------

    @callback
    def _on_household(self) -> None:
        self.hass.async_create_task(self.async_sync_members(), eager_start=True)

    async def async_sync_members(self) -> None:
        """People changed: rename devices, add entities for newcomers, unassign people who left."""
        members = {m["id"]: m for m in self.household.members}
        known = set(self.engine.member_ids())
        self.engine.set_members(self.household.members)
        for member_id in known - set(members):
            if self.available:
                await self.async_apply(self.engine.unassign_member(member_id))
        if self.entry is None or not self.enabled:
            self.async_notify()
            return
        dev_reg = dr.async_get(self.hass)
        for member_id, member in members.items():
            device = dev_reg.async_get_device_by_identifier((DOMAIN, member_device_id(member_id)), self.entry.entry_id)
            if device is not None and device.name != member["name"]:
                dev_reg.async_update_device(device.id, name=member["name"])
            if member_id not in self._devices:
                self._devices[member_id] = member["name"]
                if device is None:
                    for platform in self._platforms.values():
                        platform.add_entities(platform.member_entities(member_id))
        for member_id in set(self._devices) - set(members):
            del self._devices[member_id]
            device = dev_reg.async_get_device_by_identifier((DOMAIN, member_device_id(member_id)), self.entry.entry_id)
            if device is not None:
                dev_reg.async_remove_device(device.id)
        self.async_notify()

    @callback
    def async_add_platform(
        self,
        platform: str,
        add_entities: AddConfigEntryEntitiesCallback,
        member_entities: Callable[[str], list[Entity]],
        household_entities: Callable[[], list[Entity]] | None = None,
    ) -> None:
        """A platform is ready: add entities for everyone now, and for newcomers later."""
        self._platforms[platform] = _Platform(add_entities, member_entities, household_entities)
        if not self.enabled:
            return
        entities: list[Entity] = []
        for member in self.household.members:
            self._devices.setdefault(member["id"], member["name"])
            entities.extend(member_entities(member["id"]))
        if household_entities is not None:
            entities.extend(household_entities())
        add_entities(entities)

    # Turning chores on and off -----------------------------------------------------

    async def async_set_enabled(self, enabled: bool) -> None:
        """Turn chores on (setting the files up the first time) or off (data stays)."""
        if enabled and self.problem == STATE_NEWER:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        module = self.module
        if enabled == bool(module.get("enabled")):
            return
        first_time = not module.get("set_up_at")
        module["enabled"] = enabled
        if enabled and first_time:
            module["set_up_at"] = dt_util.now().isoformat()
        self.household.data["modules"]["chores"] = module
        await self.household.async_save()
        if enabled:
            if self.available:
                self.engine.start(self.now())
                self._sync_first_day()
                for name in STORE_KEYS:
                    await self.stores.async_save(name, getattr(self.engine, name))
                self._check_writes()
            await self._async_load_platforms()
            await self.async_sync_members()
        else:
            await self._async_unload_platforms()
            self._remove_entities()
            self._devices.clear()
        self._schedule_boundary()
        self.async_notify()

    async def async_start_over(self) -> None:
        """Chores need a look and a parent chose Start over: empty files, nothing replayed."""
        if self.state != STATE_NEEDS_A_LOOK:
            raise ChoresUnavailable(translation_domain=DOMAIN, translation_key="chores_unavailable")
        self.engine.plan, self.engine.log, self.engine.rewards = default_plan(), default_log(), default_rewards()
        self.problem = None
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE_MISSING)
        self.engine.start(self.now())
        self._sync_first_day()
        for name in STORE_KEYS:
            await self.stores.async_save(name, getattr(self.engine, name))
        self._check_writes()
        self._schedule_boundary()
        self.async_notify()

    async def _async_load_platforms(self) -> None:
        entry = self.entry
        if entry is None or entry.state is not ConfigEntryState.LOADED:
            return
        if not self.platforms_loaded:
            self.platforms_loaded = True
            await self.hass.config_entries.async_forward_entry_setups(entry, CHORES_PLATFORMS)
        sensors = self._platforms.get(Platform.SENSOR)
        if sensors is not None:
            self.async_add_platform(Platform.SENSOR, sensors.add_entities, sensors.member_entities, sensors.household_entities)

    async def _async_unload_platforms(self) -> None:
        if self.entry is not None and self.platforms_loaded:
            await self.hass.config_entries.async_unload_platforms(self.entry, CHORES_PLATFORMS)
            self.platforms_loaded = False
        for platform in CHORES_PLATFORMS:
            self._platforms.pop(platform, None)

    def _remove_entities(self) -> None:
        """Chores turned off: their entities and the members' devices go (the Household device stays)."""
        if self.entry is None:
            return
        prefix = f"{self.entry.entry_id}_chores_"
        ent_reg = er.async_get(self.hass)
        for entity in er.async_entries_for_config_entry(ent_reg, self.entry.entry_id):
            if entity.unique_id.startswith(prefix):
                ent_reg.async_remove(entity.entity_id)
        dev_reg = dr.async_get(self.hass)
        for device in dr.async_entries_for_config_entry(dev_reg, self.entry.entry_id):
            if any(domain == DOMAIN and ident.startswith("member_") for domain, ident in device.identifiers):
                dev_reg.async_remove_device(device.id)


DATA_CHORES: HassKey[ChoresRuntime] = HassKey(f"{DOMAIN}_chores")


async def async_get_chores(hass: HomeAssistant, household: Household) -> ChoresRuntime:
    """The chores runtime, loaded once per Home Assistant run (spec 15.3 for damaged files)."""
    if (runtime := hass.data.get(DATA_CHORES)) is not None:
        return runtime
    stores = ChoresStores(hass)
    problem: str | None = None
    try:
        raw = await stores.async_load()
    except UnsupportedStorageVersionError:
        _LOGGER.error("The chores files were saved by a newer version of PlanaVista; update PlanaVista to use chores")
        ir.async_create_issue(
            hass, DOMAIN, ISSUE_NEWER, is_fixable=False,
            severity=ir.IssueSeverity.ERROR, translation_key=ISSUE_NEWER,
        )
        raw = dict.fromkeys(STORE_KEYS)
        problem = STATE_NEWER
    set_up = bool((household.data["modules"].get("chores") or {}).get("set_up_at"))
    if problem is None and set_up and any(value is None for value in raw.values()):
        _LOGGER.warning("Chores were set up but a chores file is missing or damaged; chores wait for a parent")
        ir.async_create_issue(
            hass, DOMAIN, ISSUE_MISSING, is_fixable=False,
            severity=ir.IssueSeverity.WARNING, translation_key=ISSUE_MISSING,
        )
        problem = STATE_NEEDS_A_LOOK
    defaults = {"plan": default_plan, "log": default_log, "rewards": default_rewards}
    documents = {
        name: NORMALIZERS[name](raw[name]) if raw[name] is not None else defaults[name]()
        for name in STORE_KEYS
    }
    runtime = ChoresRuntime(hass, household, stores, documents, problem)
    hass.data[DATA_CHORES] = runtime
    return runtime
```

`custom_components/planavista/const.py`:

```diff
diff --git a/custom_components/planavista/const.py b/custom_components/planavista/const.py
index f17887a..a65dd6d 100644
--- a/custom_components/planavista/const.py
+++ b/custom_components/planavista/const.py
@@ -93,6 +93,9 @@ SENSOR_PREFIX: Final = "planavista"
 FRONTEND_URL_PATH: Final = "/planavista_panel/dist"
 FRONTEND_BUNDLE: Final = "planavista-cards.js"
 
+# Sent after settings are saved through async_apply_config (chores follow the first day).
+SIGNAL_CONFIG_APPLIED: Final = f"{DOMAIN}_config_applied"
+
 # Services
 SERVICE_SAVE_CONFIG: Final = "save_config"
 SERVICE_DELETE_EVENT: Final = "delete_event"
```

`custom_components/planavista/coordinator.py`:

```diff
diff --git a/custom_components/planavista/coordinator.py b/custom_components/planavista/coordinator.py
index fe62065..638b78b 100644
--- a/custom_components/planavista/coordinator.py
+++ b/custom_components/planavista/coordinator.py
@@ -18,6 +18,7 @@ from homeassistant.core import (
     callback,
 )
 from homeassistant.helpers.debounce import Debouncer
+from homeassistant.helpers.dispatcher import async_dispatcher_send
 from homeassistant.helpers.event import async_track_state_change_event
 from homeassistant.helpers.start import async_at_started
 from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
@@ -28,6 +29,7 @@ from .const import (
     DOMAIN,
     EVENT_RANGE_FUTURE_DAYS,
     EVENT_RANGE_PAST_DAYS,
+    SIGNAL_CONFIG_APPLIED,
     UPDATE_INTERVAL_SECONDS,
 )
 
@@ -317,6 +319,7 @@ async def async_apply_config(
     this function. The entry is never reloaded, so the sensors stay in place.
     """
     hass.config_entries.async_update_entry(entry, data=new_data)
+    async_dispatcher_send(hass, SIGNAL_CONFIG_APPLIED, entry)
     if entry.state is ConfigEntryState.LOADED:
         coordinator = entry.runtime_data
         coordinator.async_set_calendars(new_data.get(CONF_CALENDARS, []))
```

- [ ] **Step 5: Write the entities and the platforms.**

`custom_components/planavista/chores/entity.py` (new):

```python
"""What chores entities share: their devices, names, and when they are available (spec 10.1)."""
from __future__ import annotations

from typing import Any

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from ..const import DOMAIN, NAME
from .runtime import HOUSEHOLD_DEVICE, ChoresRuntime, chores_unique_id, member_device_id


def household_device() -> DeviceInfo:
    """The Household device: household-wide entities, and the appearance select."""
    return DeviceInfo(
        identifiers={(DOMAIN, HOUSEHOLD_DEVICE)},
        name="Household",
        manufacturer=NAME,
        model="Household",
    )


def member_device(member_id: str, name: str) -> DeviceInfo:
    """A member's device: automation authors pick "Casey" and find everything of theirs."""
    return DeviceInfo(
        identifiers={(DOMAIN, member_device_id(member_id))},
        name=name,
        manufacturer=NAME,
        model="Household member",
    )


class ChoresEntity(Entity):
    """A chores entity of one member, or of the household when `member_id` is None."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str | None, key: str) -> None:
        """Name it by its key; the device gives the member's or the household's name."""
        self.runtime = runtime
        self.member_id = member_id
        self._attr_unique_id = chores_unique_id(entry_id, member_id or HOUSEHOLD_DEVICE, key)
        self._attr_translation_key = key
        if member_id is None:
            self._attr_device_info = household_device()
        else:
            member = runtime.household.member(member_id) or {}
            self._attr_device_info = member_device(member_id, member.get("name", member_id))

    @property
    def available(self) -> bool:
        """Unavailable while chores need a look, and once the member is gone."""
        if not self.runtime.available:
            return False
        return self.member_id is None or self.runtime.household.member(self.member_id) is not None

    @property
    def view(self) -> dict[str, Any] | None:
        """This member's part of today's board."""
        if self.member_id is None or not self.available:
            return None
        return self.runtime.member_view(self.member_id)

    async def async_added_to_hass(self) -> None:
        """Write the state again whenever chores change."""
        self.async_on_remove(self.runtime.async_listen_entities(self._handle_update))

    def _handle_update(self) -> None:
        self.async_write_ha_state()
```

`custom_components/planavista/chores/sensor.py` (new):

```python
"""Chores sensors (spec 10.2): chores left, this week, chore time, stars, and streak per member,
plus the household's chores left and requests waiting for a parent."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import PERCENTAGE, Platform, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.typing import StateType

from ..coordinator import PlanaVistaConfigEntry
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime

MAX_ITEMS = 20
OPEN = ("open", "sent_back")


def left_today(view: dict[str, Any]) -> list[dict[str, Any]]:
    """Items still due today: in today's ring and not done or waiting for OK."""
    return [i for i in view["items"] if i["counted"] and i["status"] in OPEN]


@dataclass(frozen=True, kw_only=True)
class ChoresSensorDescription(SensorEntityDescription):
    """A member's chores sensor: its value and attributes from their part of the board."""

    value: Callable[[dict[str, Any]], StateType]
    attributes: Callable[[dict[str, Any]], dict[str, Any]] | None = None


MEMBER_SENSORS: tuple[ChoresSensorDescription, ...] = (
    ChoresSensorDescription(
        key="chores_left",
        icon="mdi:clipboard-list-outline",
        value=lambda view: len(left_today(view)),
        attributes=lambda view: {"items": [i["name"] for i in left_today(view)][:MAX_ITEMS]},
    ),
    ChoresSensorDescription(
        key="chores_this_week",
        icon="mdi:chart-donut",
        native_unit_of_measurement=PERCENTAGE,
        value=lambda view: view["week"]["percent"],
    ),
    ChoresSensorDescription(
        key="chore_time",
        icon="mdi:timer-outline",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        state_class=SensorStateClass.TOTAL,
        suggested_display_precision=0,
        value=lambda view: view["chore_minutes"],
    ),
    ChoresSensorDescription(key="stars", icon="mdi:star", value=lambda view: view["stars"]),
    ChoresSensorDescription(key="streak", icon="mdi:fire", value=lambda view: view["streak"]),
)


class MemberChoresSensor(ChoresEntity, SensorEntity):
    """One of a member's chores sensors."""

    entity_description: ChoresSensorDescription

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str, description: ChoresSensorDescription) -> None:
        """A sensor of `member_id`'s chores."""
        super().__init__(runtime, entry_id, member_id, description.key)
        self.entity_description = description

    @property
    def native_value(self) -> StateType:
        """The value from today's board."""
        view = self.view
        return self.entity_description.value(view) if view else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Attributes from today's board (chores left lists up to 20 names)."""
        view = self.view
        if view is None or self.entity_description.attributes is None:
            return None
        return self.entity_description.attributes(view)


class HouseholdChoresLeftSensor(ChoresEntity, SensorEntity):
    """Items still due today, everyone (sensor.household_chores_left)."""

    _attr_icon = "mdi:clipboard-list-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str) -> None:
        """The household's sensor."""
        super().__init__(runtime, entry_id, None, "chores_left")

    @property
    def native_value(self) -> StateType:
        """The sum over everyone."""
        if not self.available:
            return None
        return sum(len(left_today(view)) for view in self.runtime.board()["members"].values())


class ApprovalsWaitingSensor(ChoresEntity, SensorEntity):
    """Open requests: check-offs waiting for OK, more time, skips, and rewards."""

    _attr_icon = "mdi:account-clock-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str) -> None:
        """The household's sensor."""
        super().__init__(runtime, entry_id, None, "approvals_waiting")

    @property
    def native_value(self) -> StateType:
        """How many requests wait for a parent."""
        return len(self.runtime.board()["requests"]) if self.available else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """How many of each kind."""
        if not self.available:
            return None
        kinds = {"completion": 0, "more_time": 0, "skip": 0, "redemption": 0}
        for request in self.runtime.board()["requests"]:
            kinds[request["kind"]] = kinds.get(request["kind"], 0) + 1
        return kinds


async def async_setup_chores_sensors(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Hand the runtime what it needs to add chores sensors now or when chores turn on."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.SENSOR,
        async_add_entities,
        lambda member_id: [MemberChoresSensor(runtime, entry.entry_id, member_id, d) for d in MEMBER_SENSORS],
        lambda: [HouseholdChoresLeftSensor(runtime, entry.entry_id), ApprovalsWaitingSensor(runtime, entry.entry_id)],
    )
```

`custom_components/planavista/chores/binary_sensor.py` (new):

```python
"""binary_sensor.<member>_chores_done: on when everything due today is done (spec 10.2)."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..coordinator import PlanaVistaConfigEntry
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime


class ChoresDoneBinarySensor(ChoresEntity, BinarySensorEntity):
    """On when today's ring is closed: done or waiting for OK (nothing due counts as done)."""

    _attr_icon = "mdi:check-circle-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's sensor."""
        super().__init__(runtime, entry_id, member_id, "chores_done")

    @property
    def is_on(self) -> bool | None:
        """Everything due today is done."""
        view = self.view
        if view is None:
            return None
        today = view["today"]
        return today["done"] + today["pending"] >= today["due"]


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add a done sensor for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.BINARY_SENSOR,
        async_add_entities,
        lambda member_id: [ChoresDoneBinarySensor(runtime, entry.entry_id, member_id)],
    )
```

`custom_components/planavista/chores/event.py` (new):

```python
"""event.<member>_chores: completed, approved, sent back, undone, missed, and redeemed (spec 10.2)."""
from __future__ import annotations

from homeassistant.components.event import EventEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..coordinator import PlanaVistaConfigEntry
from .engine import EVENT_TYPES, ChoreEvent
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime


class ChoresEventEntity(ChoresEntity, EventEntity):
    """A member's chores events, for automation triggers."""

    _attr_event_types = list(EVENT_TYPES)
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's event entity."""
        super().__init__(runtime, entry_id, member_id, "chores")

    async def async_added_to_hass(self) -> None:
        """Listen for this member's events too."""
        await super().async_added_to_hass()
        self.async_on_remove(self.runtime.async_listen_events(self._handle_event))

    @callback
    def _handle_event(self, event: ChoreEvent) -> None:
        if event.member == self.member_id:
            self._trigger_event(event.type, event.data)
            self.async_write_ha_state()


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add an event entity for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.EVENT,
        async_add_entities,
        lambda member_id: [ChoresEventEntity(runtime, entry.entry_id, member_id)],
    )
```

`custom_components/planavista/chores/todo.py` (new):

```python
"""todo.<member>_chores: each item is one occurrence, its key the uid (spec 10.3, 10.6).

Checking and unchecking go through the engine; adding makes a Once chore;
removing works for Once chores only; a due date moves the occurrence's due
date. Assist's to-do intents call the list directly rather than through a
service, so a change with no service context is recorded as voice.
"""
from __future__ import annotations

from datetime import UTC, date, datetime
import time
from typing import Any

from homeassistant.components.todo import TodoItem, TodoItemStatus, TodoListEntity, TodoListEntityFeature
from homeassistant.const import Platform
from homeassistant.core import Context, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..const import DOMAIN
from ..coordinator import PlanaVistaConfigEntry
from ..household.permissions import ADMIN, AUTOMATION, Account
from .access import async_account, member_by, not_allowed, parent_by, service_error, source_of
from .engine import CREDITED, Item
from .entity import ChoresEntity
from .model import ChoreError
from .runtime import DATA_CHORES, ChoresRuntime

# A service sets the entity's context just before calling it; anything older isn't that call's.
CONTEXT_WINDOW_SECONDS = 1.0
ESTIMATE_MINUTES = 15


class ChoresTodoList(ChoresEntity, TodoListEntity):
    """A member's chores as a Home Assistant to-do list."""

    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.SET_DUE_DATE_ON_ITEM
        | TodoListEntityFeature.SET_DUE_DATETIME_ON_ITEM
    )

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's list."""
        super().__init__(runtime, entry_id, member_id, "chores")
        self._call_context: Context | None = None
        self._call_context_at = 0.0

    @callback
    def async_set_context(self, context: Context) -> None:
        """Remember the context of the service call that is about to run."""
        super().async_set_context(context)
        self._call_context = context
        self._call_context_at = time.monotonic()

    def _handle_update(self) -> None:
        self._attr_todo_items = self._items() if self.available else None
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Fill the list, then follow every change."""
        self._attr_todo_items = self._items() if self.available else None
        await super().async_added_to_hass()

    def _items(self) -> list[TodoItem]:
        engine = self.runtime.engine
        today = engine.today(self.runtime.now())
        return [self._todo(item, today) for item in self.runtime.todo_items(self.member_id or "")]

    def _todo(self, item: Item, today: date) -> TodoItem:
        engine = self.runtime.engine
        clock = engine.clock
        due: date | datetime | None = None
        if item.occ.due is not None:
            day = clock.due_day(item.occ.due)
            if item.occ.due.astimezone(UTC) == clock.day_end(day).astimezone(UTC):
                due = day
            else:
                due = item.occ.due.astimezone(clock.tz)
        activity = engine.activity(item.occ.chore)
        return TodoItem(
            summary=activity["name"] if activity else item.occ.chore,
            uid=item.occ.key,
            status=TodoItemStatus.COMPLETED if item.status in CREDITED else TodoItemStatus.NEEDS_ACTION,
            due=due,
            description=engine.description(item, today),
        )

    async def _caller(self) -> tuple[Account | None, str]:
        """(account, source); no account means Assist (voice), which acts like a household device."""
        context, self._call_context = self._call_context, None
        if context is None or time.monotonic() - self._call_context_at > CONTEXT_WINDOW_SECONDS:
            return None, "voice"
        account = await async_account(self.hass, self.runtime.household, context)
        return account, source_of(account)

    def _member_by(self, account: Account | None) -> str:
        if account is None:
            return AUTOMATION
        return member_by(self.runtime.household, account, self.member_id or "")

    @staticmethod
    def _parent_by(account: Account | None) -> str:
        if account is None:
            raise not_allowed()
        return parent_by(account)

    async def _run(self, action: Any) -> Any:
        try:
            return await self.runtime.async_run(action)
        except ChoreError as err:
            raise service_error(err) from err

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Check, uncheck, or move the due date of one occurrence."""
        account, source = await self._caller()
        current = next((i for i in self._attr_todo_items or [] if i.uid == item.uid), None)
        if current is None or item.uid is None:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
        if item.summary is not None and item.summary != current.summary:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="rename_not_supported")
        key = item.uid
        # Assist's intents pass only the uid, the name, and the status, so a
        # missing due date from voice isn't a request to clear it.
        if source != "voice" and item.due != current.due:
            by = self._parent_by(account)
            new_due = item.due.date() if isinstance(item.due, datetime) else item.due
            await self._run(lambda engine, now: engine.override(now, key=key, by=by, due=new_due))
        if item.status == current.status:
            return
        by = self._member_by(account)
        user = account.user_id if account else None
        if item.status == TodoItemStatus.COMPLETED:
            await self._run(lambda engine, now: engine.complete(now, key=key, by=by, source=source, user=user))
        else:
            await self._run(lambda engine, now: engine.undo(now, key=key, by=by, source=source, user=user))

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Adding an item makes a Once chore for this member (spec 10.3).

        It takes the item's due date and a 15-minute estimate. Added by someone
        who isn't a parent, it needs an OK, so its stars wait for a parent.
        """
        account, source = await self._caller()
        by = self._member_by(account)
        member = self.runtime.household.member(by) if by not in (ADMIN, AUTOMATION) else None
        trusted = (by == ADMIN or (by == AUTOMATION and source == AUTOMATION) or bool(member and member.get("parent")))
        once: dict[str, Any] = {"sessions": 1, "estimate_minutes": ESTIMATE_MINUTES}
        if isinstance(item.due, datetime):
            local = item.due.astimezone(self.runtime.engine.clock.tz)
            once.update(by=local.date().isoformat(), by_time=local.strftime("%H:%M"))
        elif isinstance(item.due, date):
            once["by"] = item.due.isoformat()
        changes = {
            "name": item.summary or "",
            "schedule": "once",
            "assignees": [self.member_id],
            "needs_ok": not trusted,
            "once": once,
        }
        await self._run(lambda engine, now: engine.save_activity(now, changes, by=by, source=source))

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Removing an item removes a Once chore from this member (a parent's change)."""
        account, source = await self._caller()
        by = self._parent_by(account)
        engine = self.runtime.require()
        chores: list[str] = []
        for uid in uids:
            activity = engine.activity(uid.split("|", 1)[0])
            if activity is None:
                raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
            if activity["schedule"] != "once":
                raise ServiceValidationError(translation_domain=DOMAIN, translation_key="delete_not_once")
            if activity["id"] not in chores:
                chores.append(activity["id"])
        for chore_id in chores:
            activity = engine.activity(chore_id)
            others = [m for m in activity["assignees"] if m != self.member_id]
            if others:
                await self._run(
                    lambda e, now, c=chore_id, o=others: e.save_activity(
                        now, {"assignees": o}, activity_id=c, by=by, source=source
                    )
                )
            else:
                await self._run(lambda e, _now, c=chore_id: e.delete_activity(c))


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add a to-do list for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.TODO,
        async_add_entities,
        lambda member_id: [ChoresTodoList(runtime, entry.entry_id, member_id)],
    )
```

`custom_components/planavista/binary_sensor.py` (new):

```python
"""The binary sensor platform: whether each member's chores are done today (spec 10.2)."""
from __future__ import annotations

from .chores.binary_sensor import async_setup_entry

__all__ = ["async_setup_entry"]
```

`custom_components/planavista/event.py` (new):

```python
"""The event platform: each member's chores events, for automation triggers (spec 10.2)."""
from __future__ import annotations

from .chores.event import async_setup_entry

__all__ = ["async_setup_entry"]
```

`custom_components/planavista/todo.py` (new):

```python
"""The to-do platform: each member's chores as a to-do list (spec 10.2, 10.3)."""
from __future__ import annotations

from .chores.todo import async_setup_entry

__all__ = ["async_setup_entry"]
```

`custom_components/planavista/sensor.py`:

```diff
diff --git a/custom_components/planavista/sensor.py b/custom_components/planavista/sensor.py
index 67c35fc..626b858 100644
--- a/custom_components/planavista/sensor.py
+++ b/custom_components/planavista/sensor.py
@@ -11,6 +11,7 @@ from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
 from homeassistant.helpers.update_coordinator import CoordinatorEntity
 from homeassistant.util import dt as dt_util
 
+from .chores.sensor import async_setup_chores_sensors
 from .const import SENSOR_PREFIX
 from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 
@@ -31,6 +32,7 @@ async def async_setup_entry(
     ]
 
     async_add_entities(entities)
+    await async_setup_chores_sensors(hass, entry, async_add_entities)
 
 
 class PlanaVistaConfigSensor(CoordinatorEntity, SensorEntity):
```

`custom_components/planavista/select.py`:

```diff
diff --git a/custom_components/planavista/select.py b/custom_components/planavista/select.py
index 7609b3a..13e11c9 100644
--- a/custom_components/planavista/select.py
+++ b/custom_components/planavista/select.py
@@ -8,6 +8,7 @@ from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
 from homeassistant.helpers.update_coordinator import CoordinatorEntity
 
 from .appearance import APPEARANCE, MODES, appearance_settings
+from .chores.entity import household_device
 from .const import CONF_DISPLAY
 from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 from .services import async_store_config
@@ -25,16 +26,18 @@ async def async_setup_entry(
 class PlanaVistaAppearanceSelect(CoordinatorEntity[PlanaVistaCoordinator], SelectEntity):
     """The household's appearance; an automation can pick Dark for movie night."""
 
+    _attr_has_entity_name = True
     _attr_translation_key = "appearance"
     _attr_icon = "mdi:theme-light-dark"
     _attr_options = list(MODES)
 
     def __init__(self, coordinator: PlanaVistaCoordinator, entry: PlanaVistaConfigEntry) -> None:
-        """Name it like the other PlanaVista entities, so its ID is select.planavista_appearance."""
+        """On the Household device as "Appearance"; its ID stays select.planavista_appearance."""
         super().__init__(coordinator)
         self.entity_id = "select.planavista_appearance"
-        self._attr_name = "PlanaVista appearance"
         self._attr_unique_id = f"{entry.entry_id}_appearance"
+        # The Household device holds household-wide entities (spec 10.1).
+        self._attr_device_info = household_device()
 
     @property
     def available(self) -> bool:
```

- [ ] **Step 6: Set chores up with the entry.**

`custom_components/planavista/__init__.py`:

```diff
diff --git a/custom_components/planavista/__init__.py b/custom_components/planavista/__init__.py
index c552a2f..867b869 100644
--- a/custom_components/planavista/__init__.py
+++ b/custom_components/planavista/__init__.py
@@ -15,6 +15,7 @@ from homeassistant.helpers.typing import ConfigType
 from homeassistant.loader import async_get_integration
 
 from .appearance import migrate_display
+from .chores.runtime import CHORES_PLATFORMS, DATA_CHORES, async_get_chores
 from .const import CONF_DISPLAY, DOMAIN, FRONTEND_BUNDLE, FRONTEND_URL_PATH
 from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 from .household.store import async_get_household, async_start_household
@@ -47,15 +48,22 @@ async def async_setup_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -
     entry.runtime_data = coordinator
 
     # People and calendars are linked once Home Assistant has started, when
-    # every person entity exists.
+    # every person entity exists; then chores catch up on missed days.
     household = await async_get_household(hass)
+    chores = await async_get_chores(hass, household)
+    chores.entry = entry
 
-    async def _async_start_household(_hass: HomeAssistant) -> None:
+    async def _async_started(_hass: HomeAssistant) -> None:
         await async_start_household(hass, household, entry)
+        await chores.async_start()
 
-    entry.async_on_unload(async_at_started(hass, _async_start_household))
+    entry.async_on_unload(async_at_started(hass, _async_started))
+    entry.async_on_unload(chores.async_stop)
 
-    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
+    # Chores entities exist only while the household has chores on (spec 10.1).
+    chores.platforms_loaded = chores.enabled
+    platforms = [*PLATFORMS, *CHORES_PLATFORMS] if chores.enabled else PLATFORMS
+    await hass.config_entries.async_forward_entry_setups(entry, platforms)
     return True
 
 
@@ -109,5 +117,12 @@ async def async_register_frontend(hass: HomeAssistant) -> None:
 
 
 async def async_unload_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
-    """Unload a config entry."""
-    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
+    """Unload a config entry, saving any chores change still waiting to be written."""
+    chores = hass.data.get(DATA_CHORES)
+    loaded = chores is not None and chores.platforms_loaded
+    platforms = [*PLATFORMS, *CHORES_PLATFORMS] if loaded else PLATFORMS
+    unloaded = await hass.config_entries.async_unload_platforms(entry, platforms)
+    if unloaded and chores is not None:
+        chores.platforms_loaded = False
+        await chores.async_flush()
+    return unloaded
```

- [ ] **Step 7: Name everything and every mistake.** Apply the same change to `strings.json` and `translations/en.json` (they stay equal; a test checks).

`custom_components/planavista/strings.json`:

```diff
diff --git a/custom_components/planavista/strings.json b/custom_components/planavista/strings.json
index 032881e..3d5502f 100644
--- a/custom_components/planavista/strings.json
+++ b/custom_components/planavista/strings.json
@@ -92,6 +92,48 @@
     },
     "household_unavailable": {
       "message": "People and PINs can't be changed until PlanaVista is updated."
+    },
+    "chores_off": {
+      "message": "Chores are turned off in PlanaVista."
+    },
+    "chores_unavailable": {
+      "message": "Chores can't change right now. A parent can check Chores in PlanaVista's Settings."
+    },
+    "chores_save_failed": {
+      "message": "PlanaVista couldn't save chores. Check that Home Assistant's disk has free space."
+    },
+    "unknown_member": {
+      "message": "There's no one by that name in PlanaVista's household."
+    },
+    "unknown_chore": {
+      "message": "That chore isn't in PlanaVista's chores."
+    },
+    "unknown_occurrence": {
+      "message": "That chore isn't on the list today."
+    },
+    "unknown_request": {
+      "message": "That request was already answered."
+    },
+    "unknown_reward": {
+      "message": "That reward isn't in PlanaVista's rewards."
+    },
+    "not_allowed": {
+      "message": "This account can't do that in PlanaVista. People with a PIN make changes on the family screen."
+    },
+    "invalid_schedule": {
+      "message": "That schedule can't be used: {reason}"
+    },
+    "invalid_chore": {
+      "message": "That change can't be saved: {reason}"
+    },
+    "not_enough_stars": {
+      "message": "Not enough stars yet."
+    },
+    "rename_not_supported": {
+      "message": "Rename chores in PlanaVista's Settings."
+    },
+    "delete_not_once": {
+      "message": "Only one-time chores can be removed from a to-do list."
     }
   },
   "entity": {
@@ -104,12 +146,71 @@
           "automatic": "Automatic"
         }
       }
+    },
+    "todo": {
+      "chores": {
+        "name": "Chores"
+      }
+    },
+    "sensor": {
+      "chores_left": {
+        "name": "Chores left"
+      },
+      "chores_this_week": {
+        "name": "Chores this week"
+      },
+      "chore_time": {
+        "name": "Chore time"
+      },
+      "stars": {
+        "name": "Stars"
+      },
+      "streak": {
+        "name": "Streak"
+      },
+      "approvals_waiting": {
+        "name": "Approvals waiting"
+      }
+    },
+    "binary_sensor": {
+      "chores_done": {
+        "name": "Chores done"
+      }
+    },
+    "event": {
+      "chores": {
+        "name": "Chores",
+        "state_attributes": {
+          "event_type": {
+            "state": {
+              "completed": "Completed",
+              "approved": "Approved",
+              "sent_back": "Sent back",
+              "undone": "Undone",
+              "missed": "Missed",
+              "redeemed": "Redeemed"
+            }
+          }
+        }
+      }
     }
   },
   "issues": {
     "household_newer_version": {
       "title": "Update PlanaVista to change people and PINs",
       "description": "The household file was saved by a newer version of PlanaVista. The calendar keeps working, but people, PINs, and shared screens can't be changed until PlanaVista is updated."
+    },
+    "chores_newer_version": {
+      "title": "Update PlanaVista to use chores",
+      "description": "The chores files were saved by a newer version of PlanaVista. The calendar keeps working, but chores stay off until PlanaVista is updated."
+    },
+    "chores_data_missing": {
+      "title": "PlanaVista's chores need a look",
+      "description": "Chores were set up, but a chores file is missing or damaged, so chores are paused and nothing is written over it. Restore a Home Assistant backup from before it happened, or start chores over from PlanaVista's Settings on the family screen."
+    },
+    "chores_save_failed": {
+      "title": "PlanaVista couldn't save chores",
+      "description": "Home Assistant couldn't write a PlanaVista chores file. Check that the disk has free space. Recent changes are kept and are saved once writing works again."
     }
   }
 }
```

- [ ] **Step 8: Run them again.** Same command as Step 2. Expected: `32 passed`.
- [ ] **Step 9: Run the whole backend suite.** Expected: `881 passed`; the copy check passes.
- [ ] **Step 10: Commit.** Message `feat(chores): chores in Home Assistant: files, runtime, devices, entities, to-do lists` with the trailers.

---

### Task 6: The actions

Spec 10.4 and 15.2: twelve actions with response data, members by id or `person.*`, chores by id. A repeat or nothing open is a result, never an error; real mistakes are translated errors. `pause_member` and `resume_member` write the member's Away ranges, which members now validate.

**Files:**
- Create: `custom_components/planavista/chores/services.py`
- Modify: `custom_components/planavista/__init__.py`, `custom_components/planavista/services.yaml`, `custom_components/planavista/household/members.py`, `custom_components/planavista/household/websocket.py`, `tests/test_metadata.py`, `tests/test_household_members.py`
- Test: `tests/test_chores_services.py`, `tests/test_metadata.py`, `tests/test_household_members.py`

**Interfaces:**
- Consumes: Tasks 3 to 5 (`ChoresRuntime.async_run`, `require`, the access rules).
- Produces: the twelve schemas (`COMPLETE_CHORE_SCHEMA` and so on), `SERVICES: dict[name, (handler, schema, SupportsResponse)]`, `async_setup_chores_services(hass)`; members' `away` field (`MemberError("invalid_away")`); `MEMBER_FIELDS` accepts `away`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_services.py` (new):

```python
"""The chores actions: responses, who may run them, and mistakes (spec 10.4, 9.5, 15.2)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.planavista.const import DOMAIN

from .conftest import set_pin

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


async def _call(
    hass: HomeAssistant, service: str, data: dict[str, Any], user: MockUser | None = None, *, response: bool = True
) -> Any:
    result = await hass.services.async_call(
        DOMAIN, service, data, blocking=True, return_response=response,
        context=Context(user_id=user.id) if user else None,
    )
    await hass.async_block_till_done()
    return result


async def test_complete_chore_answers_what_happened(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "complete_chore", {"member": "person.casey", "chore": "take_out_the_trash"}) == {
        "result": "done", "occurrence": TRASH, "stars": 1,
    }
    again = await _call(hass, "complete_chore", {"member": "person.casey", "chore": "take_out_the_trash"})
    assert again == {"result": "already_done", "occurrence": TRASH, "stars": 0}
    assert await _call(hass, "complete_chore", {"member": "alex", "chore": "groceries"}) == {
        "result": "nothing_open", "occurrence": None, "stars": 0,
    }
    pending = await _call(hass, "complete_chore", {"member": "dana", "chore": "feed_the_fish"})
    assert pending["result"] == "pending"


async def test_an_action_can_run_without_asking_for_a_response(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"}, response=False) is None
    assert hass.states.get("sensor.casey_stars").state == "4"


@pytest.mark.parametrize(
    ("data", "key"),
    [
        ({"member": "erin", "chore": "yard_work"}, "unknown_member"),
        ({"member": "person.nobody", "chore": "yard_work"}, "unknown_member"),
        ({"member": "casey", "chore": "fly_a_kite"}, "unknown_chore"),
        ({"member": "casey", "chore": "yard_work", "occurrence": TRASH}, "unknown_occurrence"),
        ({"member": "dana", "chore": "take_out_the_trash", "occurrence": TRASH}, "unknown_occurrence"),
    ],
)
async def test_mistakes_are_translated_errors(hass: HomeAssistant, chores: Any, data: dict[str, Any], key: str) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "complete_chore", data)
    assert (err.value.translation_domain, err.value.translation_key) == (DOMAIN, key)


async def test_who_may_complete_whose_chores(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    assert (await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"}, accounts["casey"]))["result"] == "done"
    for user, member in (("casey", "dana"), ("kitchen", "casey"), ("guest", "casey")):
        with pytest.raises(ServiceValidationError) as err:
            await _call(hass, "complete_chore", {"member": member, "chore": "cat_care"}, accounts[user])
        assert err.value.translation_key == "not_allowed", (user, member)
    assert (await _call(hass, "complete_chore", {"member": "dana", "chore": "make_your_bed"}, accounts["kitchen"]))["result"] == "pending"
    assert (await _call(hass, "complete_chore", {"member": "dana", "chore": "set_the_table"}, accounts["alex"]))["result"] == "pending"


async def test_only_automations_and_admins_may_skip_the_ok(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    data = {"member": "dana", "chore": "feed_the_fish", "approve": True}
    assert (await _call(hass, "complete_chore", data, accounts["alex"]))["result"] == "pending"
    data["chore"] = "make_your_bed"
    assert (await _call(hass, "complete_chore", data))["result"] == "done"
    data["chore"] = "set_the_table"
    assert (await _call(hass, "complete_chore", data, accounts["admin"]))["result"] == "done"


async def test_done_by_someone_else(hass: HomeAssistant, chores: Any) -> None:
    await _call(hass, "complete_chore", {"member": "casey", "chore": "take_out_the_trash", "done_by": "person.blair"})
    assert chores.engine.log["completions"][-1]["done_by"] == "blair"


async def test_undo_chore(hass: HomeAssistant, chores: Any) -> None:
    await _call(hass, "complete_chore", {"member": "casey", "chore": "take_out_the_trash"})
    assert await _call(hass, "undo_chore", {"member": "casey", "chore": "take_out_the_trash"}) == {"result": "undone", "occurrence": TRASH}
    assert await _call(hass, "undo_chore", {"member": "casey", "chore": "take_out_the_trash"}) == {"result": "nothing_to_undo", "occurrence": None}


async def test_get_chores_for_today_and_another_day(hass: HomeAssistant, chores: Any) -> None:
    today = await _call(hass, "get_chores", {"member": "person.casey"})
    assert (today["member"], today["date"], len(today["items"])) == ("casey", "2026-10-13", 7)
    trash = next(i for i in today["items"] if i["key"] == TRASH)
    assert trash == {
        "key": TRASH, "chore": "take_out_the_trash", "name": "Take out the trash", "section": "today",
        "band": "evening", "status": "open", "counted": True, "due": "2026-10-19T03:00:00-05:00",
        "due_day": "2026-10-18", "planned": "2026-10-13", "from": None, "overdue_since": None,
        "credit_minutes": 15.0, "stars": 1,
    }
    saturday = await _call(hass, "get_chores", {"member": "casey", "date": "2026-10-17"})
    assert "rake_the_leaves|casey|rep:2026-10-17|0" in [i["key"] for i in saturday["items"]]


async def test_approving_and_sending_back(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    await _call(hass, "complete_chore", {"member": "dana", "chore": "feed_the_fish"})
    with pytest.raises(ServiceValidationError):
        await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["casey"])
    with pytest.raises(ServiceValidationError):
        await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["kitchen"])
    assert await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["alex"]) == {"result": "approved"}
    review = chores.engine.log["completions"][-1]["review"]
    assert (review["by"], review["source"]) == ("alex", "phone")
    assert await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}) == {"result": "nothing_waiting"}
    await _call(hass, "complete_chore", {"member": "dana", "chore": "tidy_toys"})
    [request] = chores.engine.open_requests()
    assert await _call(hass, "send_back_chore", {"request": request["id"], "note": "Missed a spot"}) == {"result": "sent_back"}
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "approve_chore", {"request": request["id"]})
    assert err.value.translation_key == "unknown_request"


async def test_adding_and_removing_chores(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    once = await _call(hass, "add_chore", {"name": "Wash the car", "assignees": ["person.alex", "blair"], "by": "2026-10-17",
                                           "estimate_minutes": 45})
    assert once == {"chore": "wash_the_car"}
    assert chores.engine.activity("wash_the_car")["once"]["by"] == "2026-10-17"
    rep = await _call(hass, "add_chore", {"name": "Water the plants", "assignees": ["dana"], "rrule": "FREQ=WEEKLY;BYDAY=WE,SA",
                                          "estimate_minutes": 5})
    assert chores.engine.activity(rep["chore"])["repeats"] == {
        "rrule": "FREQ=WEEKLY;BYDAY=WE,SA", "start": "2026-10-13", "window": "day", "estimate_minutes": 5,
    }
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "add_chore", {"name": "Spring cleaning", "assignees": ["alex"], "rrule": "FREQ=YEARLY"})
    assert err.value.translation_key == "invalid_schedule"
    assert err.value.translation_placeholders == {"reason": "Chores repeat daily, weekly, or monthly."}
    with pytest.raises(ServiceValidationError):
        await _call(hass, "add_chore", {"name": "Nap", "assignees": ["casey"]}, accounts["casey"])
    assert await _call(hass, "remove_chore", {"chore": "wash_the_car"}) == {"result": "removed"}
    assert chores.engine.activity("wash_the_car") is None


async def test_excusing_and_marking_someone_away(hass: HomeAssistant, chores: Any) -> None:
    out = await _call(hass, "excuse_chore", {"member": "casey", "chore": "cat_care", "note": "Sick day"})
    assert out == {"result": "excused", "occurrences": ["cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1"]}
    assert await _call(hass, "pause_member", {"member": "dana", "from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}) == {"result": "paused"}
    assert chores.household.member("dana")["away"] == [{"from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}]
    assert hass.states.get("sensor.dana_chores_left").state == "0"
    assert hass.states.get("binary_sensor.dana_chores_done").state == "on"
    assert await _call(hass, "resume_member", {"member": "dana"}) == {"result": "resumed"}
    assert chores.household.member("dana")["away"] == []
    assert hass.states.get("sensor.dana_chores_left").state == "4"
    with pytest.raises(ServiceValidationError):
        await _call(hass, "pause_member", {"member": "dana", "from": "2026-10-14", "to": "2026-10-13"})


async def test_stars_and_rewards(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "award_stars", {"member": "casey", "stars": 5, "reason": "Helped a neighbor"}) == {"balance": 5}
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "award_stars", {"member": "casey", "stars": -9, "reason": "Too many"})
    assert err.value.translation_key == "not_enough_stars"
    chores.engine.save_reward({"name": "Movie night pick", "icon": "🎬", "cost": 4, "who": ["casey", "dana"]})
    out = await _call(hass, "redeem_reward", {"member": "casey", "reward": "movie_night_pick"})
    assert out["result"] == "requested"
    assert hass.states.get("sensor.household_approvals_waiting").attributes["redemption"] == 1
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "redeem_reward", {"member": "casey", "reward": "a_pony"})
    assert err.value.translation_key == "unknown_reward"


async def test_actions_say_when_chores_are_off(hass: HomeAssistant, household: Any) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"})
    assert err.value.translation_key == "chores_off"
```

`tests/test_metadata.py`:

```diff
diff --git a/tests/test_metadata.py b/tests/test_metadata.py
index 58ba707..a3bcb60 100644
--- a/tests/test_metadata.py
+++ b/tests/test_metadata.py
@@ -11,6 +11,7 @@ import yaml
 from homeassistant.core import HomeAssistant
 from homeassistant.setup import async_setup_component
 
+from custom_components.planavista.chores.services import SERVICES as CHORES_SERVICES
 from custom_components.planavista.const import DOMAIN
 from custom_components.planavista.services import (
     CREATE_EVENT_SCHEMA,
@@ -47,6 +48,7 @@ async def test_services_yaml_documents_exactly_the_registered_services(
         ("save_config", SAVE_CONFIG_SCHEMA),
         ("delete_event", DELETE_EVENT_SCHEMA),
         ("create_event_with_attendees", CREATE_EVENT_SCHEMA),
+        *((name, schema) for name, (_handler, schema, _response) in CHORES_SERVICES.items()),
     ):
         assert set(documented[service]["fields"]) == _schema_fields(schema), service
 
```

`tests/test_household_members.py`:

```diff
diff --git a/tests/test_household_members.py b/tests/test_household_members.py
index e1c1a15..6bf0077 100644
--- a/tests/test_household_members.py
+++ b/tests/test_household_members.py
@@ -231,3 +231,22 @@ def test_clear_missing_persons_drops_links_to_deleted_people() -> None:
     assert cleared[0]["picture"] == {"initial": True}
     assert cleared[0]["rev"] == 2
     assert clear_missing_persons(cleared, PERSONS) == cleared
+
+
+def test_away_ranges_are_checked_and_kept_in_order() -> None:
+    members = _household("Dana")
+    _, dana = update_member(members, "dana", {"away": [
+        {"from": "2026-10-20", "to": "2026-10-21", "note": None},
+        {"from": "2026-10-14", "to": "2026-10-15", "note": "At Grandma's"},
+    ]}, None)
+    assert dana["away"] == [
+        {"from": "2026-10-14", "to": "2026-10-15", "note": "At Grandma's"},
+        {"from": "2026-10-20", "to": "2026-10-21", "note": None},
+    ]
+    for away in ([{"from": "2026-10-15", "to": "2026-10-14"}], [{"from": "soon", "to": "2026-10-14"}],
+                 "2026-10-14", [{"from": "2026-10-14", "to": "2026-10-14", "note": "x" * 61}]):
+        with pytest.raises(MemberError) as err:
+            update_member(members, "dana", {"away": away}, None)
+        assert err.value.code == "invalid_away"
+    # Members saved before Away existed get no new field.
+    assert "away" not in update_member(members, "dana", {"name": "Dana"}, None)[1]
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_services.py tests/test_metadata.py tests/test_household_members.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.services'`.

- [ ] **Step 3: Let members be away.**

`custom_components/planavista/household/members.py`:

```diff
diff --git a/custom_components/planavista/household/members.py b/custom_components/planavista/household/members.py
index 44e8216..1f6f219 100644
--- a/custom_components/planavista/household/members.py
+++ b/custom_components/planavista/household/members.py
@@ -7,6 +7,7 @@ are when this one saves (spec section 7.8).
 from __future__ import annotations
 
 from collections.abc import Collection, Iterable, Mapping
+from datetime import date
 import re
 from typing import Any
 import unicodedata
@@ -36,6 +37,7 @@ EDITABLE_FIELDS = (
     "my_day",
     "needs_ok_for",
     "stars",
+    "away",
 )
 
 # Records name who acted with a member id or one of these words (spec 7.6).
@@ -46,6 +48,8 @@ PALETTE: tuple[str, ...] = tuple(DEFAULT_COLORS)
 MAX_MEMBERS = len(PALETTE)
 NAME_MAX_LENGTH = 40
 EMOJI_MAX_LENGTH = 16
+AWAY_NOTE_MAX_LENGTH = 60
+MAX_AWAY_RANGES = 50
 
 
 class MemberError(ValueError):
@@ -110,6 +114,28 @@ def _checked_picture(picture: object, person: str | None) -> dict[str, Any]:
     raise MemberError("invalid_picture")
 
 
+def _checked_away(away: object) -> list[dict[str, Any]]:
+    """Away ranges (spec 8.11): first and last chore days, inclusive, with an optional note."""
+    if away is None:
+        return []
+    if not isinstance(away, list) or len(away) > MAX_AWAY_RANGES:
+        raise MemberError("invalid_away")
+    ranges = []
+    for span in away:
+        if not isinstance(span, Mapping):
+            raise MemberError("invalid_away")
+        try:
+            first = date.fromisoformat(str(span.get("from")))
+            last = date.fromisoformat(str(span.get("to")))
+        except ValueError:
+            raise MemberError("invalid_away") from None
+        note = span.get("note")
+        if last < first or (note is not None and (not isinstance(note, str) or len(note) > AWAY_NOTE_MAX_LENGTH)):
+            raise MemberError("invalid_away")
+        ranges.append({"from": first.isoformat(), "to": last.isoformat(), "note": note or None})
+    return sorted(ranges, key=lambda span: span["from"])
+
+
 def build_member(
     existing: Mapping[str, Any] | None,
     changes: Mapping[str, Any],
@@ -172,6 +198,8 @@ def build_member(
         raise MemberError("person_taken")
     member["person"] = person
     member["picture"] = _checked_picture(member.get("picture"), person)
+    if "away" in member:
+        member["away"] = _checked_away(member["away"])
     return member
 
 
```

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 1c7b6f9..315b1ce 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -66,6 +66,7 @@ ERROR_MESSAGES = {
     "invalid_order": "The list changed on another screen. Try again.",
     "last_parent_pin": "A shared screen needs at least one parent with a PIN.",
     "needs_parent_pin": "Set a PIN for a parent first, so someone can open Settings here.",
+    "invalid_away": "Pick the first and last days away.",
 }
 
 MEMBER_FIELDS = vol.Schema(
@@ -79,6 +80,7 @@ MEMBER_FIELDS = vol.Schema(
         vol.Optional("my_day"): str,
         vol.Optional("needs_ok_for"): str,
         vol.Optional("stars"): bool,
+        vol.Optional("away"): vol.Any(None, [dict]),
     }
 )
 
```

- [ ] **Step 4: Write the actions, register them, and document them.**

`custom_components/planavista/chores/services.py` (new):

```python
"""Chores actions: the public API for automations and scripts (spec section 10.4).

Members are given as a member id or a person.* entity, chores by their id.
Every action returns response data, so a script can branch on the result. A
repeat or "nothing open" is never an error; real mistakes raise a translated
ServiceValidationError. Who may run each action follows spec 9.5 with no PIN
session (chores/access.py).
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from ..household.permissions import Account
from .access import async_account, member_by, parent_by, resolve_member, service_error, source_of
from .engine import ChoresEngine, Outcome, with_away, without_away
from .model import ChoreError
from .occurrences import parse_key
from .runtime import DATA_CHORES, ChoresRuntime

COMPLETE_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
    vol.Optional("done_by"): cv.string,
    vol.Optional("approve", default=False): cv.boolean,
})
UNDO_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
})
GET_CHORES_SCHEMA = vol.Schema({vol.Required("member"): cv.string, vol.Optional("date"): cv.date})
REDEEM_REWARD_SCHEMA = vol.Schema({vol.Required("member"): cv.string, vol.Required("reward"): cv.string})
APPROVE_CHORE_SCHEMA = vol.All(
    vol.Schema({vol.Optional("request"): cv.string, vol.Optional("member"): cv.string, vol.Optional("chore"): cv.string}),
    cv.has_at_least_one_key("request", "chore"),
)
SEND_BACK_CHORE_SCHEMA = vol.All(
    vol.Schema({
        vol.Optional("request"): cv.string,
        vol.Optional("member"): cv.string,
        vol.Optional("chore"): cv.string,
        vol.Optional("note"): cv.string,
    }),
    cv.has_at_least_one_key("request", "chore"),
)
ADD_CHORE_SCHEMA = vol.Schema({
    vol.Required("name"): cv.string,
    vol.Required("assignees"): vol.All(cv.ensure_list, [cv.string]),
    vol.Optional("icon"): cv.string,
    vol.Optional("on"): cv.date,
    vol.Optional("by"): cv.date,
    vol.Optional("by_time"): cv.string,
    vol.Optional("sessions"): vol.Coerce(int),
    vol.Optional("rrule"): cv.string,
    vol.Optional("start"): cv.date,
    vol.Optional("window"): vol.In(["day", "period"]),
    vol.Optional("estimate_minutes"): vol.Coerce(int),
    vol.Optional("needs_ok"): cv.boolean,
    vol.Optional("stars"): vol.Coerce(int),
})
REMOVE_CHORE_SCHEMA = vol.Schema({vol.Required("chore"): cv.string})
EXCUSE_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
    vol.Optional("date"): cv.date,
    vol.Optional("note"): cv.string,
})
PAUSE_MEMBER_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("from"): cv.date,
    vol.Required("to"): cv.date,
    vol.Optional("note"): cv.string,
})
RESUME_MEMBER_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Optional("from"): cv.date,
    vol.Optional("to"): cv.date,
})
AWARD_STARS_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("stars"): vol.Coerce(int),
    vol.Required("reason"): cv.string,
})


def _runtime(hass: HomeAssistant) -> ChoresRuntime:
    runtime = hass.data.get(DATA_CHORES)
    if runtime is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
    runtime.require()
    return runtime


async def _run(runtime: ChoresRuntime, action: Callable[[ChoresEngine, Any], Outcome]) -> Outcome:
    try:
        return await runtime.async_run(action)
    except ChoreError as err:
        raise service_error(err) from err


def _chore(engine: ChoresEngine, chore_id: str) -> str:
    if engine.activity(chore_id) is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_chore")
    return chore_id


def _occurrence(chore_id: str, value: str | None) -> str | None:
    if value is None:
        return None
    parsed = parse_key(value)
    if parsed is None or parsed[0] != chore_id:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
    return value


async def _caller(call: ServiceCall) -> tuple[ChoresRuntime, Account]:
    runtime = _runtime(call.hass)
    return runtime, await async_account(call.hass, runtime.household, call.context)


async def _complete_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    household, engine = runtime.household, runtime.engine
    member = resolve_member(household, call.data["member"])
    by = member_by(household, account, member)
    chore = _chore(engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    done_by = resolve_member(household, call.data["done_by"]) if "done_by" in call.data else None
    approve = bool(call.data["approve"]) and account.kind in ("automation", "admin")
    if key is not None:
        item = engine.find_item(key, runtime.now())
        if item is not None and item.occ.member != member:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
    out = await _run(runtime, lambda e, now: e.complete(
        now, key=key, chore=chore, member=member, done_by=done_by, by=by,
        source=source_of(account), user=account.user_id, approve=approve,
    ))
    return {"result": out.result, "occurrence": out.data.get("occurrence"), "stars": out.data.get("stars", 0)}


async def _undo_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    household, engine = runtime.household, runtime.engine
    member = resolve_member(household, call.data["member"])
    by = member_by(household, account, member)
    chore = _chore(engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    out = await _run(runtime, lambda e, now: e.undo(
        now, key=key, chore=chore, member=member, by=by, source=source_of(account), user=account.user_id,
    ))
    return {"result": out.result, "occurrence": out.data.get("occurrence")}


async def _get_chores(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    member = resolve_member(runtime.household, call.data["member"])
    engine = runtime.engine
    now = runtime.now()
    day: date = call.data.get("date") or engine.today(now)
    items = engine.items(now, day).get(member, [])
    fields = ("key", "chore", "name", "section", "band", "status", "counted", "due", "due_day",
              "planned", "from", "overdue_since", "credit_minutes", "stars")
    return {
        "member": member,
        "date": day.isoformat(),
        "items": [{name: view[name] for name in fields} for view in (engine.item_view(i, day) for i in items)],
    }


async def _redeem_reward(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    member = resolve_member(runtime.household, call.data["member"])
    by = member_by(runtime.household, account, member)
    out = await _run(runtime, lambda e, now: e.redeem(
        now, member=member, reward=call.data["reward"], by=by, source=source_of(account),
    ))
    return {"result": out.result, "request": out.data["request"]}


async def _review(call: ServiceCall, allow: bool) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    engine = runtime.engine
    request_id = call.data.get("request")
    if request_id is None:
        if "member" not in call.data:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_member")
        member = resolve_member(runtime.household, call.data["member"])
        pending = engine.pending_for(_chore(engine, call.data["chore"]), member)
        if pending is None:
            return {"result": "nothing_waiting"}
        request_id = pending["id"]
    out = await _run(runtime, lambda e, now: e.review(
        now, request_id=request_id, allow=allow, by=by, note=call.data.get("note"), source=source_of(account),
    ))
    return {"result": out.result}


async def _approve_chore(call: ServiceCall) -> ServiceResponse:
    return await _review(call, True)


async def _send_back_chore(call: ServiceCall) -> ServiceResponse:
    return await _review(call, False)


async def _add_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    data = call.data
    assignees = [resolve_member(runtime.household, value) for value in data["assignees"]]
    changes: dict[str, Any] = {"name": data["name"], "assignees": assignees}
    for name in ("icon", "needs_ok", "stars"):
        if name in data:
            changes[name] = data[name]
    minutes = data.get("estimate_minutes", 15)
    if "rrule" in data:
        start = data.get("start") or runtime.engine.today(runtime.now())
        changes["schedule"] = "repeats"
        changes["repeats"] = {"rrule": data["rrule"], "start": start.isoformat(),
                              "window": data.get("window", "day"), "estimate_minutes": minutes}
    else:
        changes["schedule"] = "once"
        changes["once"] = {
            "on": data["on"].isoformat() if "on" in data else None,
            "by": data["by"].isoformat() if "by" in data else None,
            "by_time": data.get("by_time"),
            "sessions": data.get("sessions", 1),
            "estimate_minutes": minutes,
        }
    out = await _run(runtime, lambda e, now: e.save_activity(now, changes, by=by, source=source_of(account)))
    return {"chore": out.data["activity"]["id"]}


async def _remove_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    parent_by(account)
    chore = _chore(runtime.engine, call.data["chore"])
    await _run(runtime, lambda e, _now: e.delete_activity(chore))
    return {"result": "removed"}


async def _excuse_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    member = resolve_member(runtime.household, call.data["member"])
    chore = _chore(runtime.engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    out = await _run(runtime, lambda e, now: e.excuse(
        now, chore=chore, member=member, by=by, day=call.data.get("date"), key=key, note=call.data.get("note"),
    ))
    return {"result": out.result, "occurrences": out.data["occurrences"]}


async def _change_away(call: ServiceCall, change: Callable[[list[dict[str, Any]]], list[dict[str, Any]]]) -> None:
    runtime, account = await _caller(call)
    parent_by(account)
    household = runtime.household
    member_id = resolve_member(household, call.data["member"])
    household.members = [
        {**m, "away": change(list(m.get("away") or [])), "rev": int(m.get("rev", 1)) + 1}
        if m["id"] == member_id else m
        for m in household.members
    ]
    await household.async_save()


async def _pause_member(call: ServiceCall) -> ServiceResponse:
    start, end = call.data["from"], call.data["to"]
    if end < start:
        raise service_error(ChoreError("invalid_away", "The last day away comes after the first."))
    await _change_away(call, lambda away: with_away(away, start, end, call.data.get("note")))
    return {"result": "paused"}


async def _resume_member(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    start = call.data.get("from") or runtime.engine.today(runtime.now())
    await _change_away(call, lambda away: without_away(away, start, call.data.get("to")))
    return {"result": "resumed"}


async def _award_stars(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    member = resolve_member(runtime.household, call.data["member"])
    out = await _run(runtime, lambda e, now: e.award_stars(
        now, member=member, stars=call.data["stars"], reason=call.data["reason"], by=by,
    ))
    return {"balance": out.data["balance"]}


SERVICES: dict[str, tuple[Callable[[ServiceCall], Awaitable[ServiceResponse]], vol.Schema, SupportsResponse]] = {
    "complete_chore": (_complete_chore, COMPLETE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "undo_chore": (_undo_chore, UNDO_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "get_chores": (_get_chores, GET_CHORES_SCHEMA, SupportsResponse.ONLY),
    "redeem_reward": (_redeem_reward, REDEEM_REWARD_SCHEMA, SupportsResponse.OPTIONAL),
    "approve_chore": (_approve_chore, APPROVE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "send_back_chore": (_send_back_chore, SEND_BACK_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "add_chore": (_add_chore, ADD_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "remove_chore": (_remove_chore, REMOVE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "excuse_chore": (_excuse_chore, EXCUSE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "pause_member": (_pause_member, PAUSE_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
    "resume_member": (_resume_member, RESUME_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
    "award_stars": (_award_stars, AWARD_STARS_SCHEMA, SupportsResponse.OPTIONAL),
}


@callback
def async_setup_chores_services(hass: HomeAssistant) -> None:
    """Register the chores actions (once per Home Assistant start)."""
    for name, (handler, schema, supports_response) in SERVICES.items():
        hass.services.async_register(DOMAIN, name, handler, schema, supports_response=supports_response)
```

`custom_components/planavista/__init__.py`:

```diff
diff --git a/custom_components/planavista/__init__.py b/custom_components/planavista/__init__.py
index 867b869..c12bc40 100644
--- a/custom_components/planavista/__init__.py
+++ b/custom_components/planavista/__init__.py
@@ -16,6 +16,7 @@ from homeassistant.loader import async_get_integration
 
 from .appearance import migrate_display
 from .chores.runtime import CHORES_PLATFORMS, DATA_CHORES, async_get_chores
+from .chores.services import async_setup_chores_services
 from .const import CONF_DISPLAY, DOMAIN, FRONTEND_BUNDLE, FRONTEND_URL_PATH
 from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 from .household.store import async_get_household, async_start_household
@@ -35,6 +36,7 @@ FRONTEND_DIST = Path(__file__).parent / "frontend" / "dist"
 async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
     """Register services, WebSocket commands, and the card bundle once."""
     async_setup_services(hass)
+    async_setup_chores_services(hass)
     async_setup_household_websocket(hass)
     await async_register_frontend(hass)
     return True
```

`custom_components/planavista/services.yaml`:

```diff
diff --git a/custom_components/planavista/services.yaml b/custom_components/planavista/services.yaml
index 8d1f2a1..a1abdb7 100644
--- a/custom_components/planavista/services.yaml
+++ b/custom_components/planavista/services.yaml
@@ -124,3 +124,349 @@ save_config:
       required: false
       selector:
         boolean:
+
+complete_chore:
+  name: Complete chore
+  description: >
+    Check off a chore for a member, as if they held it on the family screen.
+    Without an occurrence, their oldest open one is checked off. A repeat, or
+    a chore with nothing open, answers already_done or nothing_open and is
+    never an error. Approval rules still apply.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      example: person.casey
+      selector:
+        text:
+    chore:
+      name: Chore
+      description: The chore's id (Settings, Chores, Use in automations).
+      required: true
+      example: take_out_the_trash
+      selector:
+        text:
+    occurrence:
+      name: Occurrence
+      description: One exact check-off, by its key. Leave it out to take the oldest open one.
+      selector:
+        text:
+    done_by:
+      name: Done by
+      description: Someone else who did it, to get the credit and stars.
+      selector:
+        text:
+    approve:
+      name: Approve
+      description: Skip the parent's OK. Only automations and admins can use this.
+      default: false
+      selector:
+        boolean:
+
+undo_chore:
+  name: Undo chore
+  description: Uncheck today's check-off of a chore. The stars it earned are taken back.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    chore:
+      name: Chore
+      description: The chore's id.
+      required: true
+      selector:
+        text:
+    occurrence:
+      name: Occurrence
+      description: One exact check-off. Leave it out to undo the latest one.
+      selector:
+        text:
+
+get_chores:
+  name: Get chores
+  description: A member's chores for a day and how each one stands, as response data.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    date:
+      name: Date
+      description: The chore day to read. Leave it out for today.
+      selector:
+        date:
+
+redeem_reward:
+  name: Redeem reward
+  description: Spend a member's stars on a reward. It waits for a parent's OK unless the reward needs none.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    reward:
+      name: Reward
+      description: The reward's id.
+      required: true
+      selector:
+        text:
+
+approve_chore:
+  name: Approve chore
+  description: Approve a check-off that is waiting for OK, so it counts and earns its stars.
+  fields:
+    request:
+      name: Request
+      description: The request's id. Or give the member and the chore.
+      selector:
+        text:
+    member:
+      name: Member
+      description: The member whose check-off is waiting.
+      selector:
+        text:
+    chore:
+      name: Chore
+      description: The chore's id.
+      selector:
+        text:
+
+send_back_chore:
+  name: Send back chore
+  description: Send a check-off that is waiting for OK back to the member, with a note.
+  fields:
+    request:
+      name: Request
+      description: The request's id. Or give the member and the chore.
+      selector:
+        text:
+    member:
+      name: Member
+      description: The member whose check-off is waiting.
+      selector:
+        text:
+    chore:
+      name: Chore
+      description: The chore's id.
+      selector:
+        text:
+    note:
+      name: Note
+      description: What to fix, shown as "Sent back" with the note.
+      example: Missed a spot
+      selector:
+        text:
+
+add_chore:
+  name: Add chore
+  description: >
+    Add a one-time chore, or a repeating one when a rule is given. Plan chores
+    are made in PlanaVista's Settings.
+  fields:
+    name:
+      name: Name
+      description: What needs doing.
+      required: true
+      example: Clean out the garage
+      selector:
+        text:
+    assignees:
+      name: Assignees
+      description: Member ids or Home Assistant persons. Each gets their own check-off.
+      required: true
+      selector:
+        text:
+          multiple: true
+    icon:
+      name: Picture
+      description: An emoji or an mdi icon.
+      selector:
+        text:
+    "on":
+      name: On a day
+      description: A one-time chore that shows on this day.
+      selector:
+        date:
+    by:
+      name: By a date
+      description: A one-time chore that shows every day until this date.
+      selector:
+        date:
+    by_time:
+      name: By a time
+      description: A time on that date, such as 17:00.
+      selector:
+        text:
+    sessions:
+      name: Sessions
+      description: How many check-offs a one-time chore takes.
+      selector:
+        number:
+          min: 1
+          max: 20
+    rrule:
+      name: Repeats
+      description: A repeating rule, such as FREQ=WEEKLY;BYDAY=SA. Daily, weekly, and monthly rules work.
+      example: FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130
+      selector:
+        text:
+    start:
+      name: Starts
+      description: The day a repeating chore starts. Leave it out for today.
+      selector:
+        date:
+    window:
+      name: Each time
+      description: On its day, or any time that week or month.
+      selector:
+        select:
+          options:
+            - day
+            - period
+    estimate_minutes:
+      name: About how long
+      description: Minutes, for the whole one-time chore or each repeat.
+      selector:
+        number:
+          min: 1
+          max: 1440
+          unit_of_measurement: min
+    needs_ok:
+      name: Needs a parent's OK
+      description: Check-offs wait for a parent before they count.
+      selector:
+        boolean:
+    stars:
+      name: Stars
+      description: Stars for each check-off. Leave it out for 1 per 15 minutes.
+      selector:
+        number:
+          min: 0
+          max: 100
+
+remove_chore:
+  name: Remove chore
+  description: Delete a chore. It leaves the board at once; past weeks and earned stars stay.
+  fields:
+    chore:
+      name: Chore
+      description: The chore's id.
+      required: true
+      selector:
+        text:
+
+excuse_chore:
+  name: Excuse chore
+  description: Excuse a member's chore for a day, such as a sick day. Nothing is missed and streaks hold.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    chore:
+      name: Chore
+      description: The chore's id.
+      required: true
+      selector:
+        text:
+    occurrence:
+      name: Occurrence
+      description: One exact check-off. Or give a date.
+      selector:
+        text:
+    date:
+      name: Date
+      description: The chore day. Leave it out for today.
+      selector:
+        date:
+    note:
+      name: Note
+      description: Why, for the history.
+      example: Sick day
+      selector:
+        text:
+
+pause_member:
+  name: Mark away
+  description: Mark a member away for some days. Nothing is due or missed while they are away, and streaks hold.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    from:
+      name: From
+      description: The first day away.
+      required: true
+      selector:
+        date:
+    to:
+      name: To
+      description: The last day away.
+      required: true
+      selector:
+        date:
+    note:
+      name: Note
+      description: Shown with Away, such as At Grandma's.
+      selector:
+        text:
+
+resume_member:
+  name: End away
+  description: A member is back. Days from the first given day on are no longer away.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    from:
+      name: From
+      description: The first day back. Leave it out for today.
+      selector:
+        date:
+    to:
+      name: To
+      description: The last day to clear. Leave it out to clear every later day.
+      selector:
+        date:
+
+award_stars:
+  name: Give or take stars
+  description: Give a member stars, or take some away, with a reason. The balance never goes below zero.
+  fields:
+    member:
+      name: Member
+      description: The member's id, or their Home Assistant person.
+      required: true
+      selector:
+        text:
+    stars:
+      name: Stars
+      description: How many to give; a negative number takes stars away.
+      required: true
+      selector:
+        number:
+          min: -1000
+          max: 1000
+    reason:
+      name: Reason
+      description: Why, shown in their stars history.
+      required: true
+      example: Helped a neighbor
+      selector:
+        text:
```

- [ ] **Step 5: Run them again.** Same command. Expected: `42 passed`.
- [ ] **Step 6: Run the whole backend suite.** Expected: `899 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): chores actions` with the trailers.

---

### Task 7: The card's WebSocket commands

Spec 10.7 with 9.4 and 9.5: the board subscription, the Week view, check-off, undo, requests, reviews, overrides, the chore editor, Rules, turning chores on and off, Start over, rewards, and stars. Every command checks the rule with its PIN session; on a shared screen a refused check-off answers `pin_required` naming the member.

**Files:**
- Create: `custom_components/planavista/chores/websocket.py`
- Modify: `custom_components/planavista/__init__.py`
- Test: `tests/test_chores_websocket.py`

**Interfaces:**
- Consumes: Tasks 3 to 5; `household_for`, `account_for`, `session_for`, `refuse`, `parent_for` (Task 4); `member_level`.
- Produces: commands `planavista/chores/subscribe` (event: `{state, save_failed, board}`), `planavista/chores/week` (`date`), `planavista/chores/complete` (`occurrence`, `done_by`), `planavista/chores/undo`, `planavista/chores/request` (`kind`, `occurrence`, `until`), `planavista/chores/review` (`request`, `decision`, `note`), `planavista/chores/override` (`occurrence`, `planned_day`, `due`, `assignee`, `excused`, `note`), `planavista/chores/activity/save` (`activity_id`, `rev`, `activity`), `planavista/chores/activity/delete`, `planavista/chores/settings/save` (`settings`), `planavista/chores/enable` (`enabled`), `planavista/chores/start_over`, `planavista/rewards/save`, `planavista/rewards/delete`, `planavista/rewards/redeem`, `planavista/stars/award`, each taking `session`; error codes `chores_off`, `chores_need_a_look`, `update_planavista`, `pin_required`, `period_closed`, `nothing_to_fix`, and every rule's code with its message; `CHORES_COMMANDS`, `async_setup_chores_websocket(hass)`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_websocket.py` (new):

```python
"""The card's chores commands, with PIN sessions on a shared screen (spec 10.7, 9.4, 9.5)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from .conftest import set_pin, ws_client_for, ws_command

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"
YARD = "yard_work|casey|week:2026-10-12|0"


@pytest.fixture
async def kitchen(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> Any:
    """The wall tablet's account, marked shared, with PINs for Blair and Casey."""
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "blair", "2468")
    await set_pin(hass, household, "casey", "4826")
    return await ws_client_for(hass, hass_ws_client, accounts["kitchen"])


async def _unlock(client: Any, member: str, pin: str) -> str:
    reply = await ws_command(client, {"type": "planavista/pin/unlock", "member_id": member, "pin": pin})
    assert reply["result"]["ok"], reply
    return reply["result"]["session"]


async def test_subscribe_sends_the_board_and_every_change(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "planavista/chores/subscribe"})
    assert (await client.receive_json())["success"]
    feed = (await client.receive_json())["event"]
    assert (feed["state"], feed["save_failed"]) == ("ok", False)
    board = feed["board"]
    assert (board["date"], board["band"], list(board["members"])) == ("2026-10-13", "afternoon", ["alex", "blair", "casey", "dana"])
    assert board["members"]["casey"]["today"]["due"] == 3
    seen: list[dict[str, Any]] = []
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": TRASH}, seen)
    assert reply["result"] == {"result": "done", "occurrence": TRASH, "stars": 1, "completion": reply["result"]["completion"]}
    pushed = [m["event"] for m in seen if m.get("type") == "event"]
    if not pushed:
        pushed = [(await client.receive_json())["event"]]
    assert pushed[-1]["board"]["members"]["casey"]["today"]["done"] == 1


async def test_subscribe_says_when_chores_are_off(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "planavista/chores/subscribe"})
    assert (await client.receive_json())["success"]
    assert (await client.receive_json())["event"] == {"state": "off", "save_failed": False, "board": None}
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": TRASH})
    assert reply["error"]["code"] == "chores_off"


async def test_a_shared_screen_asks_for_the_members_pin(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    dana = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": FISH})
    assert dana["result"]["result"] == "pending"
    refused = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH})
    assert refused["error"] == {"code": "pin_required", "message": "Casey's PIN or a parent's is needed."}
    session = await _unlock(kitchen, "casey", "4826")
    reply = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH, "session": session})
    assert reply["result"]["result"] == "done"
    completion = chores.engine.log["completions"][-1]
    assert (completion["by"], completion["source"]) == ("casey", "tablet")


async def test_a_parents_session_may_check_off_anyones_items(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    session = await _unlock(kitchen, "blair", "2468")
    reply = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH, "done_by": "blair", "session": session})
    assert reply["result"]["result"] == "done"
    completion = chores.engine.log["completions"][-1]
    assert (completion["by"], completion["done_by"]) == ("blair", "blair")


async def test_a_closed_day_says_so(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": "cat_care|casey|day:2026-10-12|0"})
    assert reply["error"] == {"code": "period_closed", "message": "The day had ended."}


async def test_reviews_need_parent_mode_on_a_shared_screen(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": FISH})
    [request] = chores.engine.open_requests()
    refused = await ws_command(kitchen, {"type": "planavista/chores/review", "request": request["id"], "decision": "allow"})
    assert refused["error"]["code"] == "parent_mode_required"
    session = await _unlock(kitchen, "blair", "2468")
    reply = await ws_command(kitchen, {"type": "planavista/chores/review", "request": request["id"], "decision": "allow", "session": session})
    assert reply["result"] == {"result": "approved", "occurrence": FISH}
    assert chores.engine.log["completions"][-1]["review"]["by"] == "blair"


async def test_planning_a_day_is_the_members_but_due_dates_are_a_parents(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    planned = await ws_command(casey, {"type": "planavista/chores/override", "occurrence": YARD, "planned_day": "2026-10-17"})
    assert planned["success"]
    refused = await ws_command(casey, {"type": "planavista/chores/override", "occurrence": "cat_care|casey|day:2026-10-13|1", "due": "2026-10-15"})
    assert refused["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    moved = await ws_command(alex, {"type": "planavista/chores/override", "occurrence": TRASH, "due": "2026-10-20"})
    assert moved["success"]
    bad = await ws_command(alex, {"type": "planavista/chores/override", "occurrence": TRASH, "planned_day": "2026-10-30"})
    assert bad["error"] == {"code": "invalid_planned_day", "message": "Pick a day before it's due."}


async def test_asking_for_more_time(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    reply = await ws_command(casey, {"type": "planavista/chores/request", "kind": "more_time", "occurrence": YARD, "until": "2026-10-25"})
    assert "request" in reply["result"]
    assert hass.states.get("sensor.household_approvals_waiting").attributes["more_time"] == 1


async def test_editing_chores_and_rules(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    saved = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity": {
        "name": "Vacuum", "schedule": "plan", "assignees": ["blair"], "minimum": {"hours": 1, "per": "week"}}})
    activity = saved["result"]["activity"]
    assert (activity["id"], activity["rev"], activity["created"]["by"]) == ("vacuum", 1, "admin")
    assert hass.states.get("todo.blair_chores").state == "3"
    stale = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity_id": "vacuum", "rev": 7, "activity": {"times": 2}})
    assert stale["error"] == {"code": "changed", "message": "This changed on another screen."}
    shares = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity_id": "vacuum", "activity": {
        "assignees": ["blair", "casey"], "split": "shared", "shares": {"blair": 1}}})
    assert shares["error"] == {"code": "shares_mismatch", "message": "Everyone's share has to add up to the time."}
    assert (await ws_command(admin, {"type": "planavista/chores/activity/delete", "activity_id": "vacuum"}))["success"]
    rules = await ws_command(admin, {"type": "planavista/chores/settings/save", "settings": {"missed": "strict"}})
    assert rules["result"]["settings"]["missed"] == "strict"
    bad = await ws_command(admin, {"type": "planavista/chores/settings/save", "settings": {"missed": "forgive"}})
    assert bad["error"]["code"] == "invalid_missed"


async def test_children_cant_edit(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    for command in (
        {"type": "planavista/chores/activity/delete", "activity_id": "yard_work"},
        {"type": "planavista/chores/settings/save", "settings": {"missed": "strict"}},
        {"type": "planavista/chores/enable", "enabled": False},
        {"type": "planavista/stars/award", "member": "casey", "stars": 50, "reason": "Me"},
    ):
        assert (await ws_command(casey, command))["error"]["code"] == "not_allowed", command["type"]


async def test_the_week_view(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    week = (await ws_command(client, {"type": "planavista/chores/week"}))["result"]
    assert week["week"] == {"start": "2026-10-12", "end": "2026-10-19"}
    casey = week["members"]["casey"]
    assert [d["kind"] for d in casey["days"]] == ["past", "today", "future", "future", "future", "future", "future"]
    assert casey["days"][1]["due"] == 3
    assert {w["chore"] for w in casey["weekly"]} == {"clean_the_bathroom", "yard_work", "take_out_the_trash"}


async def test_rewards_and_stars(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    saved = await ws_command(admin, {"type": "planavista/rewards/save", "reward": {"name": "Pick the weekend game", "cost": 3}})
    assert saved["result"]["reward"]["id"] == "pick_the_weekend_game"
    assert (await ws_command(admin, {"type": "planavista/stars/award", "member": "casey", "stars": 5, "reason": "Bonus"}))["result"] == {"balance": 5}
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    redeem = await ws_command(casey, {"type": "planavista/rewards/redeem", "member": "casey", "reward": "pick_the_weekend_game"})
    assert redeem["result"]["result"] == "requested"
    others = await ws_command(casey, {"type": "planavista/rewards/redeem", "member": "dana", "reward": "pick_the_weekend_game"})
    assert others["error"]["code"] == "not_allowed"


async def test_turning_chores_off_and_on_from_the_card(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    assert (await ws_command(admin, {"type": "planavista/chores/enable", "enabled": False}))["result"] == {"state": "off"}
    assert hass.states.get("todo.casey_chores") is None
    assert (await ws_command(admin, {"type": "planavista/chores/enable", "enabled": True}))["result"] == {"state": "ok"}
    await hass.async_block_till_done()
    assert hass.states.get("todo.casey_chores").state == "7"
    assert (await ws_command(admin, {"type": "planavista/chores/start_over"}))["error"]["code"] == "nothing_to_fix"


async def test_two_screens_checking_one_item_at_once_credit_it_once(  # Review Focus 5
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    import asyncio

    tablet = await hass_ws_client(hass)
    phone = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    replies = await asyncio.gather(
        ws_command(tablet, {"type": "planavista/chores/complete", "occurrence": TRASH}),
        ws_command(phone, {"type": "planavista/chores/complete", "occurrence": TRASH}),
    )
    assert sorted(r["result"]["result"] for r in replies) == ["already_done", "done"]
    assert hass.states.get("sensor.casey_stars").state == "1"
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_websocket.py -q` Expected: FAIL, `14 failed`, each on an `unknown_command` reply (for example `{'code': 'unknown_command'} != {'code': 'period_closed'}`).

- [ ] **Step 3: Write the commands and register them.**

`custom_components/planavista/chores/websocket.py` (new):

```python
"""WebSocket commands for the card's chores screens (spec section 10.7).

Every command checks the rule in spec 9.5 with the command's PIN session:
member-level changes (check off, uncheck, plan a day, ask for more time or a
skip, redeem) and parent-level ones (approve, edit, excuse, stars, settings).
On a shared screen, a refused member-level change answers pin_required with
the member whose PIN (or a parent's) would allow it.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..household.permissions import member_level
from ..household.store import Household
from ..household.websocket import account_for, parent_for, refuse, session_for
from .access import message, source_of
from .engine import ChoresEngine, Item, Outcome
from .model import ChoreError
from .runtime import DATA_CHORES, STATE_NEEDS_A_LOOK, STATE_NEWER, STATE_OFF, ChoresRuntime, ChoresUnavailable

STATE_MESSAGES = {
    STATE_OFF: ("chores_off", "Turn on chores first."),
    STATE_NEEDS_A_LOOK: ("chores_need_a_look", "Chores need a look. A parent can restore them in Settings."),
    STATE_NEWER: ("update_planavista", "Update PlanaVista to use chores."),
}
SESSION = vol.Optional("session")


@callback
def _runtime(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], *, ready: bool = True
) -> ChoresRuntime | None:
    """The runtime, or None after saying why chores can't be used now."""
    runtime = hass.data.get(DATA_CHORES)
    if runtime is None:
        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
        return None
    if ready and not runtime.available:
        code, text = STATE_MESSAGES[runtime.state]
        connection.send_error(msg["id"], code, text)
        return None
    return runtime


@callback
def _member_by(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], household: Household, target: str
) -> str | None:
    """Who a member-level change to `target`'s items is attributed to, or None after refusing."""
    account = account_for(hass, household, connection.user)
    by = member_level(account, session_for(household, connection, msg), target, target in household.pins)
    if by is not None:
        return by
    if account.screen_rules:
        member = household.member(target) or {}
        connection.send_error(msg["id"], "pin_required", f"{member.get('name', target)}'s PIN or a parent's is needed.")
    else:
        refuse(connection, msg, account)
    return None


async def _apply(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    runtime: ChoresRuntime,
    action: Callable[[ChoresEngine, Any], Outcome],
) -> Outcome | None:
    """Run one engine write, or send the rule it broke."""
    try:
        return await runtime.async_run(action)
    except ChoreError as err:
        connection.send_error(msg["id"], err.code, message(err))
    except ChoresUnavailable:
        code, text = STATE_MESSAGES.get(runtime.state, ("chores_off", "Turn on chores first."))
        connection.send_error(msg["id"], code, text)
    return None


@callback
def _item(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], runtime: ChoresRuntime
) -> Item | None:
    """Today's occurrence named by the command, or None after saying it can't change now."""
    item = runtime.engine.find_item(msg["occurrence"], runtime.now())
    if item is None:
        connection.send_error(msg["id"], "period_closed", "The day had ended.")
    return item


def _source(hass: HomeAssistant, household: Household, connection: websocket_api.ActiveConnection) -> str:
    return source_of(account_for(hass, household, connection.user))


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/subscribe"})
@callback
def ws_chores_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send the board now and after every change: items, progress, streaks, stars, requests."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None:
        return

    @callback
    def forward() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], runtime.feed()))

    connection.subscriptions[msg["id"]] = runtime.async_listen(forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/week", vol.Optional("date"): cv.date})
@callback
def ws_chores_week(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The Week view for the week holding `date` (default this week)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    connection.send_result(msg["id"], runtime.engine.week_view(runtime.now(), msg.get("date")))


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/complete",
    vol.Required("occurrence"): str,
    vol.Optional("done_by"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_complete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Check off one occurrence, credited to its owner or to whoever did it."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, item.occ.member)
    if by is None:
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.complete(
        now, key=item.occ.key, done_by=msg.get("done_by"), by=by, source=source, user=connection.user.id,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/undo", vol.Required("occurrence"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_chores_undo(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Uncheck today's check-off of one occurrence."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, item.occ.member)
    if by is None:
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.undo(
        now, key=item.occ.key, by=by, source=source, user=connection.user.id,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/request",
    vol.Required("kind"): vol.In(["more_time", "skip"]),
    vol.Required("occurrence"): str,
    vol.Optional("until"): cv.date,
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_request(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Ask the parents for more time or to skip this week."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    by = _member_by(hass, connection, msg, runtime.household, item.occ.member)
    if by is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.request(
        now, kind=msg["kind"], key=item.occ.key, by=by, until=msg.get("until"),
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/review",
    vol.Required("request"): str,
    vol.Required("decision"): vol.In(["allow", "decline"]),
    vol.Optional("note"): vol.Any(None, str),
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_review(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A parent answers a request: Looks good or Send back, Allow or Not this time, Approve or Decline."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    household, by = context
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.review(
        now, request_id=msg["request"], allow=msg["decision"] == "allow", by=by, note=msg.get("note"), source=source,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/override",
    vol.Required("occurrence"): str,
    vol.Optional("planned_day"): vol.Any(None, cv.date),
    vol.Optional("due"): vol.Any(None, cv.date),
    vol.Optional("assignee"): vol.Any(None, str),
    vol.Optional("excused"): bool,
    vol.Optional("note"): vol.Any(None, str),
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_override(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Plan it for a day (the member), or change the due date, hand it over, or excuse it (a parent)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    parent_fields = ("due", "assignee", "excused")
    if any(name in msg for name in parent_fields):
        context = parent_for(hass, connection, msg, needs_file=False)
        if context is None:
            return
        by = context[1]
    else:
        member = _member_by(hass, connection, msg, household, item.occ.member)
        if member is None:
            return
        by = member
    changes = {name: msg[name] for name in ("planned_day", *parent_fields) if name in msg}
    out = await _apply(connection, msg, runtime, lambda e, now: e.override(
        now, key=item.occ.key, by=by, note=msg.get("note"), **changes,
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/activity/save",
    vol.Optional("activity_id"): str,
    vol.Optional("rev"): int,
    vol.Required("activity"): dict,
    SESSION: str,
})
@websocket_api.async_response
async def ws_activity_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add a chore or change one (the chore editor and quick add)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    household, by = context
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.save_activity(
        now, msg["activity"], by=by, source=source, activity_id=msg.get("activity_id"), rev=msg.get("rev"),
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/activity/delete", vol.Required("activity_id"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_activity_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Delete a chore: it leaves the board at once; past weeks and earned stars stay."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.delete_activity(msg["activity_id"]))
    if out is not None:
        connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/settings/save", vol.Required("settings"): dict, SESSION: str,
})
@websocket_api.async_response
async def ws_settings_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Rules and Reminders; they apply as the parent taps."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.save_settings(now, msg["settings"]))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/enable", vol.Required("enabled"): bool, SESSION: str,
})
@websocket_api.async_response
async def ws_chores_enable(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Turn chores on or off for the household. Turning them off keeps everything for later."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or parent_for(hass, connection, msg) is None:
        return
    try:
        await runtime.async_set_enabled(msg["enabled"])
    except ChoresUnavailable:
        code, text = STATE_MESSAGES[STATE_NEWER]
        connection.send_error(msg["id"], code, text)
        return
    connection.send_result(msg["id"], {"state": runtime.state})


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/start_over", SESSION: str})
@websocket_api.async_response
async def ws_chores_start_over(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Chores need a look and a parent chose Start over: empty chores, rewards, and history."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or parent_for(hass, connection, msg) is None:
        return
    try:
        await runtime.async_start_over()
    except ChoresUnavailable:
        connection.send_error(msg["id"], "nothing_to_fix", "Chores don't need a look.")
        return
    connection.send_result(msg["id"], {"state": runtime.state})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/save",
    vol.Optional("reward_id"): str,
    vol.Required("reward"): dict,
    SESSION: str,
})
@websocket_api.async_response
async def ws_reward_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add a reward or change one."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.save_reward(msg["reward"], reward_id=msg.get("reward_id")))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/delete", vol.Required("reward_id"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_reward_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Remove a reward; redemptions already given stay in history."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.delete_reward(msg["reward_id"]))
    if out is not None:
        connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/redeem",
    vol.Required("member"): str,
    vol.Required("reward"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_reward_redeem(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A member spends stars on a reward (it waits for a parent unless it needs no OK)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, msg["member"])
    if by is None:
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.redeem(
        now, member=msg["member"], reward=msg["reward"], by=by, source=source,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/stars/award",
    vol.Required("member"): str,
    vol.Required("stars"): int,
    vol.Required("reason"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_stars_award(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A parent gives or takes stars by hand, with a reason."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.award_stars(
        now, member=msg["member"], stars=msg["stars"], reason=msg["reason"], by=context[1],
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


CHORES_COMMANDS = (
    ws_chores_subscribe,
    ws_chores_week,
    ws_chores_complete,
    ws_chores_undo,
    ws_chores_request,
    ws_chores_review,
    ws_chores_override,
    ws_activity_save,
    ws_activity_delete,
    ws_settings_save,
    ws_chores_enable,
    ws_chores_start_over,
    ws_reward_save,
    ws_reward_delete,
    ws_reward_redeem,
    ws_stars_award,
)


@callback
def async_setup_chores_websocket(hass: HomeAssistant) -> None:
    """Register the chores commands (once per Home Assistant start)."""
    for command in CHORES_COMMANDS:
        websocket_api.async_register_command(hass, command)
```

`custom_components/planavista/__init__.py`:

```diff
diff --git a/custom_components/planavista/__init__.py b/custom_components/planavista/__init__.py
index c12bc40..4306457 100644
--- a/custom_components/planavista/__init__.py
+++ b/custom_components/planavista/__init__.py
@@ -17,6 +17,7 @@ from homeassistant.loader import async_get_integration
 from .appearance import migrate_display
 from .chores.runtime import CHORES_PLATFORMS, DATA_CHORES, async_get_chores
 from .chores.services import async_setup_chores_services
+from .chores.websocket import async_setup_chores_websocket
 from .const import CONF_DISPLAY, DOMAIN, FRONTEND_BUNDLE, FRONTEND_URL_PATH
 from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
 from .household.store import async_get_household, async_start_household
@@ -38,6 +39,7 @@ async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
     async_setup_services(hass)
     async_setup_chores_services(hass)
     async_setup_household_websocket(hass)
+    async_setup_chores_websocket(hass)
     await async_register_frontend(hass)
     return True
 
```

- [ ] **Step 4: Run them again.** Same command. Expected: `14 passed`.
- [ ] **Step 5: Run the whole backend suite.** Expected: `913 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): the card's chores commands` with the trailers.

---

### Task 8: Diagnostics, PIN privacy, and the worked examples end to end

Spec 15.6: Download diagnostics gives counts, settings, Store versions, and recent errors, with member names replaced and PIN data and user ids left out. Spec 9.8 and 16: a known PIN never appears in logs, events, states, diagnostics, or the chores files after every chores flow. Spec 8.16 through actions and to-do lists: the milestone's done-when.

**Files:**
- Create: `custom_components/planavista/diagnostics.py`
- Test: `tests/test_chores_privacy.py`, `tests/test_chores_acceptance.py`

**Interfaces:**
- Consumes: Tasks 3 to 7.
- Produces: `async_get_config_entry_diagnostics(hass, entry)`.

- [ ] **Step 1: Write the failing privacy tests.**

`tests/test_chores_privacy.py` (new):

```python
"""Diagnostics without names, PINs, or user ids, and PINs that never leak through chores (spec 15.6, 9.8)."""
from __future__ import annotations

import json
import logging
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser
from pytest_homeassistant_custom_component.components.diagnostics import get_diagnostics_for_config_entry

from homeassistant.const import MATCH_ALL
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN

from .conftest import set_pin, ws_client_for, ws_command

PIN = "482613"


async def test_diagnostics_replace_names_and_leave_out_pins_and_users(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_client: Any
) -> None:
    assert await async_setup_component(hass, "diagnostics", {})
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", PIN)
    await hass.services.async_call(DOMAIN, "complete_chore", {"member": "casey", "chore": "yard_work"}, blocking=True)
    result = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
    assert [m["member"] for m in result["household"]["members"]] == ["Member 1", "Member 2", "Member 3", "Member 4"]
    assert result["household"]["members"][2]["has_pin"] is True
    assert result["chores"]["state"] == "ok"
    assert result["chores"]["completions"] == 1
    assert result["chores"]["stores"]["log"] == {"version": 1, "minor_version": 1}
    text = json.dumps(result)
    for secret in ("Alex", "Blair", "Casey", "Dana", PIN, '"hash"', '"salt"', "person.", accounts["kitchen"].id, accounts["casey"].id):
        assert secret not in text, secret


async def test_a_pin_never_leaks_through_chores(
    hass: HomeAssistant,
    chores: Any,
    accounts: dict[str, MockUser],
    hass_ws_client: Any,
    hass_client: Any,
    hass_storage: dict[str, Any],
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger="homeassistant.components.websocket_api")
    caplog.set_level(logging.DEBUG, logger="custom_components.planavista")
    events: list[Event] = []

    @callback
    def remember(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(MATCH_ALL, remember)
    assert await async_setup_component(hass, "diagnostics", {})
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", PIN)
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    wrong = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": "000000"})
    assert wrong["result"]["ok"] is False
    unlocked = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": PIN})
    session = unlocked["result"]["session"]
    for command in (
        {"type": "planavista/chores/complete", "occurrence": "take_out_the_trash|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/undo", "occurrence": "take_out_the_trash|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/request", "kind": "skip", "occurrence": "yard_work|casey|week:2026-10-12|0"},
        {"type": "planavista/chores/override", "occurrence": "yard_work|casey|week:2026-10-12|0", "planned_day": "2026-10-17"},
        {"type": "planavista/chores/complete", "occurrence": "cat_care|casey|day:2026-10-13|1"},
    ):
        reply = await ws_command(kitchen, {**command, "session": session})
        assert reply["success"], reply
    await hass.services.async_call(DOMAIN, "complete_chore", {"member": "dana", "chore": "feed_the_fish"}, blocking=True)
    await hass.services.async_call(
        "todo", "update_item", {"item": "Make your bed", "status": "completed"},
        target={"entity_id": "todo.dana_chores"}, blocking=True, context=Context(user_id=accounts["kitchen"].id),
    )
    diagnostics = await get_diagnostics_for_config_entry(hass, hass_client, chores.entry)
    await chores.async_flush()
    await hass.async_block_till_done()
    places = {
        "logs": caplog.text,
        "events": json.dumps([{"type": e.event_type, "data": e.data} for e in events], default=str),
        "states": json.dumps([s.as_dict() for s in hass.states.async_all()], default=str),
        "diagnostics": json.dumps(diagnostics),
        "chores files": json.dumps({k: v for k, v in hass_storage.items() if k.startswith("planavista.chores")}),
    }
    for place, text in places.items():
        assert PIN not in text, place
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_privacy.py -q` Expected: FAIL, 2 failed, each `assert 404 == <HTTPStatus.OK: 200>` (no diagnostics yet).

- [ ] **Step 3: Write the diagnostics.**

`custom_components/planavista/diagnostics.py` (new):

```python
"""Download diagnostics: counts, settings, Store versions, and recent errors (spec 15.6).

Member names are replaced ("Member 1"), and PIN data and Home Assistant user
ids are left out entirely.
"""
from __future__ import annotations

from collections import Counter
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .chores.runtime import DATA_CHORES
from .const import CONF_CALENDARS, CONF_DISPLAY
from .coordinator import PlanaVistaConfigEntry
from .household.members import ordered
from .household.store import DATA_HOUSEHOLD

TO_REDACT = {"weather_entity"}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> dict[str, Any]:
    """What a bug report needs, and nothing about who lives here."""
    household = hass.data.get(DATA_HOUSEHOLD)
    chores = hass.data.get(DATA_CHORES)
    result: dict[str, Any] = {
        "entry": {
            "version": entry.version,
            "minor_version": entry.minor_version,
            "calendars": len(entry.data.get(CONF_CALENDARS, [])),
            "display": async_redact_data(dict(entry.data.get(CONF_DISPLAY, {})), TO_REDACT),
        }
    }
    names: dict[str, str] = {}
    if household is not None:
        members = ordered(household.members)
        names = {m["id"]: f"Member {n}" for n, m in enumerate(members, 1)}
        result["household"] = {
            "available": household.available,
            "members": [
                {
                    "member": names[m["id"]],
                    "age_group": m.get("age_group"),
                    "parent": bool(m.get("parent")),
                    "needs_ok_for": m.get("needs_ok_for"),
                    "stars": bool(m.get("stars")),
                    "has_person": bool(m.get("person")),
                    "has_pin": m["id"] in household.pins,
                    "away_ranges": len(m.get("away") or []),
                }
                for m in members
            ],
            "shared_screens": len(household.shared_users),
            "modules": household.data["modules"],
            "setup": household.data["setup"],
        }
    if chores is not None:
        engine = chores.engine
        result["chores"] = {
            "state": chores.state,
            "save_failed": chores.save_failed,
            "settings": dict(engine.settings),
            "chores_by_schedule": dict(Counter(a.get("schedule") for a in engine.plan["activities"])),
            "chores_unassigned": len(engine.needs_a_look()),
            "completions": len(engine.log["completions"]),
            "overrides": len(engine.log["overrides"]),
            "open_requests": len(engine.open_requests()),
            "carried": len(engine.log["carried"]),
            "summaries": len(engine.log["summaries"]),
            "rewards": len(engine.rewards["rewards"]),
            "ledger": len(engine.rewards["ledger"]),
            "last_day": engine.log.get("last_day"),
            "last_boundary": engine.log.get("last_boundary"),
            "stores": {
                name: {"version": store.version, "minor_version": store.minor_version}
                for name, store in chores.stores.files.items()
            },
            "recent_errors": list(chores.errors),
        }
    return result
```

- [ ] **Step 4: Run them again.** Expected: `2 passed`.

- [ ] **Step 5: Write the worked examples through actions and to-do lists.** These exercise Tasks 3 to 7, so they pass as soon as they are written; they are the milestone's done-when, and a failure here is a finding against an earlier task.

`tests/test_chores_acceptance.py` (new):

```python
"""Spec section 8.16's worked examples, end to end through actions and to-do lists.

The engine versions are in test_chores_examples.py; the outage is also checked
at startup in test_chores_runtime.py. Approval from a phone notification's
button arrives with phone notifications (milestone 6), so example 2 approves
through the action from Alex's own account here.
"""
from __future__ import annotations

from datetime import timedelta
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser, async_fire_time_changed

from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.core import Context, HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


async def test_1_frigate(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    """A zone sensor sees Casey take the trash out; an automation completes the chore."""
    freezer.move_to("2026-10-13T19:40:00-05:00")
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "off")
    assert await async_setup_component(hass, "automation", {"automation": {
        "triggers": [{"trigger": "state", "entity_id": "binary_sensor.curb_trash_bin_occupancy", "to": "on"}],
        "actions": [{"action": "planavista.complete_chore", "data": {"member": "person.casey", "chore": "take_out_the_trash"}}],
    }})
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "on")
    await hass.async_block_till_done()
    event = hass.states.get("event.casey_chores")
    assert (event.attributes["event_type"], event.attributes["occurrence"], event.attributes["state"]) == ("completed", TRASH, "done")
    assert (event.attributes["source"], event.attributes["stars"]) == ("automation", 1)
    assert hass.states.get("sensor.casey_stars").state == "1"
    # 4. Repeat delivery: the automation fires again within a minute.
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "off")
    freezer.tick(timedelta(seconds=30))
    hass.states.async_set("binary_sensor.curb_trash_bin_occupancy", "on")
    await hass.async_block_till_done()
    assert hass.states.get("sensor.casey_stars").state == "1"
    assert len([c for c in chores.engine.log["completions"] if c["occurrence"] == TRASH]) == 1


async def test_4_repeat_delivery_answers_already_done(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    data = {"member": "person.casey", "chore": "take_out_the_trash"}
    first = await hass.services.async_call(DOMAIN, "complete_chore", data, blocking=True, return_response=True)
    freezer.tick(timedelta(seconds=40))
    second = await hass.services.async_call(DOMAIN, "complete_chore", data, blocking=True, return_response=True)
    assert (first["result"], second["result"]) == ("done", "already_done")
    assert hass.states.get("sensor.casey_stars").state == "1"


async def test_2_approval(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    """Dana checks Feed the fish on the family screen; it waits for OK until Alex approves."""
    chores.household.shared_users.append(accounts["kitchen"].id)
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", {"item": "Feed the fish", "status": "completed"},
        target={"entity_id": "todo.dana_chores"}, blocking=True, context=Context(user_id=accounts["kitchen"].id),
    )
    await hass.async_block_till_done()
    assert hass.states.get("sensor.household_approvals_waiting").state == "1"
    assert hass.states.get("sensor.dana_stars").state == "0"
    result = await hass.services.async_call(
        DOMAIN, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, blocking=True,
        return_response=True, context=Context(user_id=accounts["alex"].id),
    )
    await hass.async_block_till_done()
    assert result == {"result": "approved"}
    event = hass.states.get("event.dana_chores")
    assert (event.attributes["event_type"], event.attributes["stars"]) == ("approved", 1)
    assert hass.states.get("sensor.dana_stars").state == "1"
    completion = chores.engine.log["completions"][-1]
    assert (completion["state"], completion["source"], completion["review"]["by"]) == ("done", "tablet", "alex")


@pytest.mark.parametrize("chores_start", ["2026-10-12T09:00:00-05:00"])
async def test_3_make_it_up(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], freezer: Any) -> None:
    """Blair misses Monday's laundry; Tuesday it shows "From Mon"; done, it counts for the week."""
    monday = "laundry|blair|week:2026-10-12|0"
    freezer.move_to("2026-10-13T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert chores.engine.log["last_day"] == "2026-10-12"
    today = await hass.services.async_call(DOMAIN, "get_chores", {"member": "blair"}, blocking=True, return_response=True)
    laundry = next(i for i in today["items"] if i["key"] == monday)
    assert (laundry["section"], laundry["from"], laundry["status"]) == ("week", "2026-10-12", "open")
    items = await hass.services.async_call(
        TODO_DOMAIN, "get_items", {}, target={"entity_id": "todo.blair_chores"}, blocking=True, return_response=True
    )
    assert next(i for i in items["todo.blair_chores"]["items"] if i["uid"] == monday)["description"] == "From Mon"
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", {"item": monday, "status": "completed"},
        target={"entity_id": "todo.blair_chores"}, blocking=True, context=Context(user_id=accounts["alex"].id),
    )
    freezer.move_to("2026-10-19T03:00:01-05:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    week = next(s for s in chores.engine.log["summaries"] if s["member"] == "blair" and s["period"] == "week:2026-10-12")
    assert monday not in week["missed"]
    assert "laundry|blair|week:2026-10-12|1" in week["missed"]  # Thursday's load was never done
```

- [ ] **Step 6: Run them.** `bash scripts/test-backend.sh tests/test_chores_privacy.py tests/test_chores_acceptance.py -q` Expected: `6 passed`.
- [ ] **Step 7: Run the whole backend suite.** Expected: `919 passed`; the copy check passes. The frontend checks pass unchanged (tsc clean, `416 passed`).
- [ ] **Step 8: Commit.** Message `feat(chores): diagnostics, PIN privacy, and the worked examples` with the trailers; push the branch and wait for CI (Validate and Frontend) to pass.

---

### Task 9: Verify on the dev Home Assistant, review, and demo (controller)

- [ ] **Step 1: Deploy.** `bash scripts/dev-ha.sh deploy`, then `python scripts/ha.py api GET /api/config` shows Home Assistant running.
- [ ] **Step 2: The worked examples through actions and to-do lists, scripted in the session scratchpad** (spec 17.3 row 4's done-when): turn chores on (`planavista/chores/enable`), add the sample chores the dev household can hold (`planavista/chores/activity/save`), then (1) an automation on a test binary sensor calls `planavista.complete_chore` for Casey's trash: done, 1 star, source automation, and `event.casey_chores` says so; (2) a check-off waiting for OK (Dana's or Casey's marked chore) through `todo.update_item` from the Kitchen account, approved through `approve_chore` from Alex's own account; (3) a pinned chore from an earlier day shows in This week with "From ..." in `get_chores` and the to-do description, and checking it off counts; (4) the same `complete_chore` twice within a minute: `already_done`; (5) an outage: stop the container, set the chores log's `last_day` two days back with the container stopped, start it, and the missed boundaries run in order (summaries and `last_day` in `.storage/planavista.chores_log`).
- [ ] **Step 3: Assist.** Expose the to-do lists to Assist (`homeassistant/expose_entity`), then `conversation/process` with "Check off cat care on Casey Chores" and "Add clean the closet to Casey Chores": both act, recorded with source voice.
- [ ] **Step 4: Diagnostics and the calendar.** Download diagnostics: Member 1 to Member n, no names, no PIN data. The calendar card still loads in light and dark (one screenshot each); the bundle is byte-identical to the committed one.
- [ ] **Step 5: Final review.** Run the review package over `main..HEAD` and dispatch a fresh reviewer on the most capable model with the plan, the spec, this plan's Review Focus verbatim, and the ledger's rulings. Re-grade, fix Critical and Important findings test-first in one pass, ledger the minors.
- [ ] **Step 6: Demo.** The demo message: what is in it, what to look at on the dev Home Assistant, the finishing menu, "Rulings I made", and "Deferred minors". Wait for the go-ahead before any merge. No release follows this milestone.
