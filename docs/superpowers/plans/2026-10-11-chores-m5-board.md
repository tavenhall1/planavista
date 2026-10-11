# Milestone 5, the Chores Board: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The household's day runs from the tablet: a Chores module in the card with the Board (everyone's today, hold to complete, picture tiles for young children), the options sheet, My day in three styles, the Week view, Rewards, the Waiting for OK inbox, quick add, the calendar's rings, check-offs that wait out a lost connection, and designed loading, empty, and error states, in portrait, landscape, and phone layouts, light and dark. No release follows; chores ship as 1.3.0 after milestone 6.

**Architecture:** The engine still decides everything; the card draws its feed and sends changes. A card-wide `ChoresService` (one per card, made through the module registry's new `service` hook) follows `planavista/chores/subscribe`, keeps check-offs in a page-wide queue in browser storage until Home Assistant answers, and shows them at once on the board. Pure derive modules turn the feed into what each screen shows (board columns, options, the inbox, My day, the Week grid, Rewards) and carry the unit tests; Lit elements only render them and fire events. The shell gains glance chips, module buttons in the bar and the parent-mode strip, a PIN gate modules ask through, and the services; the calendar reads Chores' progress for its Day view rings. Four backend additions serve the screens: a person's own choices (My day style, goal), a chore's history, one day's detail, and excusing a check-off already counted as missed.

**Tech Stack:** TypeScript 5.7 with Lit 3, Rollup, vitest 5 (node environment, `TZ=America/Chicago`); Python 3.14 and Home Assistant 2026.9.4 for the backend additions, tested with pytest-homeassistant-custom-component 0.13.367 in Docker (`scripts/test-backend.sh`).

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 5, with sections 6.3 to 6.5, 8.4, 8.13 to 8.15, 9.1 to 9.5, 10.7, 11 (all), 12.1 to 12.3, 13 (all), 15.1, and 16.

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data (spec 7.8): members gain an optional `goal`; the board feed, the week view, and the log's summaries gain fields; nothing is renamed or removed. A 1.2.0 card reading this backend, and this card reading a 1.2.0 backend, both still work (the chores module stays hidden when the household has no chores).
- `chores/status.py` imports nothing from Home Assistant, like the rest of the engine.
- Public surface (spec 10.8): no entity, action, or event changes. New WebSocket commands: `planavista/household/member/prefs`, `planavista/chores/history`, `planavista/chores/day`, `planavista/chores/excuse_missed`.
- PINs never pass through anything but `planavista/pin/*` (spec 9.8); the card never stores a PIN or a session token in browser storage.
- The check-off queue keeps only what a check-off needs (its occurrence, its member, the chore's name, who did it, what it shows, and when) in `localStorage` under `planavista.checkoffs`, and every read and write of it is wrapped so a blocked or full storage never breaks the card.
- Copy (spec 11.7): sentence case, "Waiting for OK" as the one name for a check-off that waits, errors that say what to do, destructive actions confirmed by name.
- Color jobs (spec 11.3): the person's color says who; indigo (the accent) is something to act on; amber is time pressure; red is overdue, missed, or sent back. Color is never alone: every state has words.
- Touch targets are at least 48 px; every hold has a keyboard equivalent (Space or Enter); reduced motion keeps the ring filling and turns pops, flights, and glides into quick fades (spec 11.5, 11.8).
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, fixtures, and docs.
- Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or release in this plan. Pushing the milestone branch for CI is allowed.
- Backend tests: `bash scripts/test-backend.sh` (from the repository root). Frontend: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`; the bundle (`npm run build`) is committed in the last task and must match the source.
- Paths are relative to the repository root.

## Review Focus

1. **Two PlanaVista cards on one dashboard** (a calendar card and a chores card, or two chores cards). One page-wide queue: each check-off is sent once, by the card that made it, and both cards show it. Pinned by Task 3's queue tests (one queue, entries sent in order, a refused one dropped once) and checked on the dev Home Assistant.
2. **A check-off made while Home Assistant restarts, then a page reload before it is back.** It survives in browser storage, is sent once when the connection returns, and the board shows the "Can't reach Home Assistant" banner meanwhile. Pinned by Task 3's `survives a reload` and `keeps everything while there is no connection` tests, and the outage check in Task 13.
3. **The 3:00 AM day change while a check-off still waits.** Home Assistant refuses it (`period_closed`), the item reverts, and the toast says the day had ended. Pinned by Task 3's `refusalText` test and milestone 4's `test_a_closed_day_says_so`.
4. **A PIN-protected person on a shared screen.** The hold asks for their PIN (or a parent's) before anything is sent, Cancel rewinds the circle, and their session then covers their next check-offs. Pinned by Task 2's `memberAccess` tests and Task 13's kitchen account check.
5. **Eight people in portrait, and long chore names.** An even grid (3, 3, 2) whose panels scroll on their own, with badges under names in narrow panels. Pinned by Task 5's `boardRows` tests.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others. Every module and every test in Tasks 1 to 12 was built and run in a scratch branch before this plan was written (963 backend tests and 570 frontend tests at the end, each task's tests passing at its own commit and failing without its code), and each screen was checked on the dev Home Assistant at 1280 by 800, 800 by 1280, and 390 by 844, in light and dark, from the admin, a parent's, and the kitchen tablet's accounts, through a Home Assistant restart.

- **Ruling: the backend gains four WebSocket commands beyond spec 10.7's table** (`planavista/household/member/prefs`, `planavista/chores/history`, `planavista/chores/day`, `planavista/chores/excuse_missed`); the board feed gains each person's `week_stars` and the last rewards given (`recent_redemptions`), and the week view names each past day's missed chores. Cost if wrong: none (added).
- **Ruling: a person's own choices (their My day style and their goal) are member-level, through `planavista/household/member/prefs`,** so a child changes their own style without a parent; everything else about a person stays parent-level. Cost if wrong: a child can change their own goal.
- **Ruling: excusing a check-off already counted as missed amends that day's and that week's summaries** (missed becomes excused, due goes down by one, closed is worked out again), so the ring and the streak hold, as the Week view's Excuse it promises (spec 13.5); this fixes milestone 4's deferred minor about excusing a past day, for missed check-offs (marking someone away for a past day still doesn't amend it). Cost if wrong: a summary no longer shows that day's miss.
- **Ruling: one table, `tests/fixtures/chores_status.json`, is read by both the engine's to-do descriptions and the card's badges;** they differ only where the spec does ("Waiting for a parent's OK" in a to-do, "Waiting for OK" on the card; "Due Tue" in a to-do, "Due today" on the card on the day). Cost if wrong: none.
- **Ruling: the module registry gains `enabled` and `service`; the card makes one service per module, passes every module `services` and `revision`, and shows each service's glance chips and bar buttons;** the calendar reads Chores' progress through it. Cost if wrong: none.
- **Ruling: one check-off queue per page, in `localStorage` (`planavista.checkoffs`), shared by every card on it;** an entry is sent by the card that queued it (with that card's PIN session), or by any card once that one is gone, and entries more than two days old are dropped when the page loads. Cost if wrong: a check-off waiting two days offline is lost.
- **Ruling: a refused check-off reverts with a toast:** "the day had ended" for `period_closed`, "The PIN timed out, so hold it again" for a refusal that wants a PIN (sessions don't survive a reconnect, spec 9.4), otherwise "Try again". Cost if wrong: a PIN-protected check-off made while the connection was down has to be held again.
- **Ruling: an uncheck cancels a check-off that hasn't been sent yet; a check-off after an uncheck that hasn't been sent is sent after it,** because it may name someone else. Cost if wrong: a quick check, uncheck, and check made offline sends an uncheck and a new check-off.
- **Ruling: the PIN sheet stays the card's; a module asks through a `PinGate` naming who may unlock** (the person, when they have a PIN, then the parents with PINs), and the card's session covers what follows. Cost if wrong: none.
- **Ruling: the card mirrors spec 9.5 (`memberAccess`, `parentAccess`) so a screen asks for the right PIN before a change instead of failing after it;** the backend still decides. Cost if wrong: if the two drift apart, a refusal shows after the hold.
- **Ruling: the glance chip counts Waiting for OK as done ("9 of 17 chores done today", "All 7 chores done today"), and there is no chip when nothing is due; "Next: Dentist at 4:45 · Alex" joins it in the portrait header, with chores on.** Cost if wrong: calendar-only households don't get the Next chip.
- **Ruling: "⏳ n waiting for OK" shows only when something waits and this account can ever review (not on a non-parent's own login); "+ Add chore" sits in the bar for anyone who can become a parent on this screen, and in the parent-mode strip during parent mode.** Cost if wrong: a child's own login never sees what waits.
- **Ruling: opening Waiting for OK or quick add on a shared screen asks for a parent's PIN first,** since everything in them is parent-level. Cost if wrong: a parent unlocks before seeing what waits.
- **Ruling: a column runs Overdue, Now, later bands, This week, Done today, then a credit line for each past band ("Morning · 1 done"); a past band with work left stays open under "Morning · 1 left".** Cost if wrong: a chore done in the morning shows only in its band's credit line.
- **Ruling: a floating weekly chore's check-offs, and a one-time chore's sessions, show as one row ("1 h · 1 of 3"), and holding it completes the next open one.** Cost if wrong: none.
- **Ruling: a check-off waiting for OK stays in its place with ⏳, not in Done today; only done ones move.** Cost if wrong: none.
- **Ruling: a young child's column shows picture tiles, the one for now first, then the rest of today's and the done ones, with a sticker strip of the stars earned by chores this week.** Cost if wrong: a busy young child sees a long column of tiles.
- **Ruling: Edit in the options sheet and Import a plan on the empty board wait for milestone 6's chore editor and import; the empty board offers Add chores (quick add).** Cost if wrong: none.
- **Ruling: the options depend on whose chore it is: a parent's own chore has no requests (a parent just changes it); the parent group is Change the due date, Hand it to someone else, Excuse it, and Delete the chore, plus Looks good and Send back for a check-off waiting for OK; 🔒 marks what needs a PIN here.** Cost if wrong: none.
- **Ruling: Plan it for a day hides the item until that day (milestone 4's ruling), so its toast has no Undo.** Cost if wrong: taking a plan back means waiting for that day.
- **Ruling: a new due date is offered as the day after it's due and a week later (plus Pick a date); more time as one, two, and seven days later.** Cost if wrong: none.
- **Ruling: History shows a daily chore's streak in days and a weekly one's in weeks (weeks with a check-off and no miss), how many of the last six weeks it was done, when it was last done and by whom, and when it usually gets done (the band, and the weekday once there are three check-offs).** Cost if wrong: none.
- **Ruling: quick add makes a one-time chore (today, or by a date) or a simple repeating one (every day, every Tuesday, every month on the 13th; days after the 28th become the 28th), with a picture chosen from its name and category Other.** Cost if wrong: a monthly chore meant for the 30th lands on the 28th.
- **Ruling: the inbox's answer buttons are the accent (indigo, something to act on), not the mockup's green,** since spec 11.3 gives green no job. Cost if wrong: none.
- **Ruling: Approve all answers each check-off in turn, attributed to the parent, and stops at the first failure; a mistaken approval is taken back by unchecking that chore.** Cost if wrong: none.
- **Ruling: My day's Timeline is today's bands with events at their times, a line at now, the free gap until the next event with what fits (in order, by estimate, three at most), and bedtime when the person has one; Pictures turns the next event into a picture step chosen from its title, or 📅.** Cost if wrong: an unusual event title gets 📅.
- **Ruling: My day opens on this account's own person, else the person picked last, else the first; a column header or a calendar ring opens a person's day.** Cost if wrong: none.
- **Ruling: the Week view shows make-up badges only for days already past (the engine's week view also looks at days to come), shows nothing on a past day it has no summary for, and says someone closed every ring only once two days count.** Cost if wrong: none.
- **Ruling: a Week cell opens that day's sheet: a past day from the log and its summary, today and later days from their items, with Excuse it on a missed one for parents.** Cost if wrong: none.
- **Ruling: Redeem asks who is getting it when more than one person can afford it; "Save up for this" in the reward sheet sets that person's goal (member-level); parents add, edit, and delete rewards in the same sheet.** Cost if wrong: none.
- **Ruling: the Day view's rings use the calendar's color and show on today only.** Cost if wrong: none.
- **Ruling: the portrait header's large clock shrinking to one line as a big household scrolls (spec 12.2) waits for milestone 7's polish.** Cost if wrong: a big household's portrait board scrolls under a tall header.
- **Ruling: the bundle grows from 378 KB to 584 KB.** Cost if wrong: a slower first load on old tablets.
- **Ruling: a card that Home Assistant rebuilds after a reconnect opens on its configured module, so a chores tablet's card sets `module: chores`.** Cost if wrong: a tablet without it shows the calendar after Home Assistant restarts.
- **Ruling: elements are checked on the dev Home Assistant; the unit tests cover the derive modules, the queue, the subscription, and the rules, since vitest runs in node.** Cost if wrong: an element's regression shows only in screen checks.
- **Ruling: the dev Home Assistant's sample household gains Dana and the spec's chores and rewards, scripted in the session scratchpad.** Cost if wrong: none.

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/chores-m5-board` (main is at `038100f`, milestone 4 merged).
- [ ] **Step 2: Baseline.** `bash scripts/test-backend.sh -q` Expected: `933 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `416 passed`.
- [ ] **Step 3: Commit this plan.** `git add docs/superpowers/plans/2026-10-11-chores-m5-board.md && git commit` with the message `docs: plan milestone 5, the chores board` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m5-board`.

---

### Task 1: What the board asks of the backend

Spec 13.3 (History), 13.4 (a person's own My day style), 13.5 (a day's detail, Excuse it), 13.6 (stickers this week, who got what), 8.15 (a goal), and 16 (the status map checked against one table by both sides). The to-do description moves into a pure `describe()` that reads the same item view the card reads.

**Files:**
- Create: `custom_components/planavista/chores/status.py`, `tests/fixtures/chores_status.json`
- Modify: `custom_components/planavista/chores/engine.py`, `custom_components/planavista/chores/websocket.py`, `custom_components/planavista/chores/access.py`, `custom_components/planavista/household/members.py`, `custom_components/planavista/household/websocket.py`
- Test: `tests/test_chores_board_backend.py`

**Interfaces:**
- Produces: `chores/status.py` `describe(view, today) -> str | None` and `short_day(day, today)`; engine `history(now, chore_id, member_id)`, `day_view(now, day)`, `excuse_missed(now, *, key, by, note=None) -> Outcome` (error `not_missed`), `recent_redemptions()`, `_stars_since(first)`; board members gain `week_stars`, the board gains `recent_redemptions`; members `set_prefs(members, member_id, changes)` (errors `invalid_my_day`, `invalid_goal`); WebSocket `planavista/chores/history` `{chore, member}`, `planavista/chores/day` `{date}`, `planavista/chores/excuse_missed` `{occurrence, note?}` (parent level), `planavista/household/member/prefs` `{member_id, my_day?, goal?}` (member level, `pin_required` on a shared screen).

- [ ] **Step 1: Write the failing tests and the shared status table.**

`tests/fixtures/chores_status.json` (new):

```json
{
  "about": "What an item's status says (spec 11.4): `todo` is the to-do item's description (chores/status.py describe), `card` is the badge the card shows beside the name (core/status-map.ts itemBadge), null when the estimate shows instead. Both read the same item view. today is Tuesday, October 13, 2026; days_left counts today; remaining is how many of the chore's floating check-offs are still open this week.",
  "today": "2026-10-13",
  "cases": [
    {"name": "to do today", "view": {"status": "open", "section": "today", "window": "day"}, "todo": null, "card": null},
    {"name": "waiting for OK", "view": {"status": "pending", "section": "today", "window": "day"}, "todo": "Waiting for a parent's OK", "card": {"words": "Waiting for OK", "tone": "act", "glyph": "⏳"}},
    {"name": "waiting for OK beats From", "view": {"status": "pending", "section": "week", "window": "week", "from": "2026-10-12"}, "todo": "Waiting for a parent's OK", "card": {"words": "Waiting for OK", "tone": "act", "glyph": "⏳"}},
    {"name": "sent back with a note", "view": {"status": "sent_back", "section": "week", "window": "week", "note": "edges"}, "todo": "Sent back: edges", "card": {"words": "Sent back: edges", "tone": "bad", "glyph": "↩"}},
    {"name": "sent back without a note", "view": {"status": "sent_back", "section": "today", "window": "day", "note": null}, "todo": "Sent back", "card": {"words": "Sent back", "tone": "bad", "glyph": "↩"}},
    {"name": "sent back beats overdue", "view": {"status": "sent_back", "section": "overdue", "window": "day", "note": "do it again", "overdue_since": "2026-10-12"}, "todo": "Sent back: do it again", "card": {"words": "Sent back: do it again", "tone": "bad", "glyph": "↩"}},
    {"name": "overdue", "view": {"status": "open", "section": "overdue", "window": "day", "overdue_since": "2026-10-12"}, "todo": "Overdue since Mon", "card": {"words": "Overdue since Mon", "tone": "bad", "glyph": "•"}},
    {"name": "overdue a while", "view": {"status": "open", "section": "overdue", "window": "week", "overdue_since": "2026-09-28"}, "todo": "Overdue since Sep 28", "card": {"words": "Overdue since Sep 28", "tone": "bad", "glyph": "•"}},
    {"name": "make-up", "view": {"status": "open", "section": "week", "window": "week", "from": "2026-10-12"}, "todo": "From Mon", "card": {"words": "From Mon", "tone": "neutral"}},
    {"name": "due later this week", "view": {"status": "open", "section": "today", "window": "once", "dated": true, "due_day": "2026-10-17"}, "todo": "Due Sat", "card": {"words": "Due Sat", "tone": "neutral"}},
    {"name": "due today", "view": {"status": "open", "section": "today", "window": "once", "dated": true, "due_day": "2026-10-13"}, "todo": "Due Tue", "card": {"words": "Due today", "tone": "time"}},
    {"name": "due in a few weeks", "view": {"status": "open", "section": "today", "window": "once", "dated": true, "due_day": "2026-10-31"}, "todo": "Due Oct 31", "card": {"words": "Due Oct 31", "tone": "neutral"}},
    {"name": "floating, plenty of days", "view": {"status": "open", "section": "week", "window": "week"}, "days_left": 6, "remaining": 1, "todo": "This week", "card": null},
    {"name": "floating, running out of days", "view": {"status": "open", "section": "week", "window": "week"}, "days_left": 2, "remaining": 2, "todo": "This week", "card": {"words": "2 days left", "tone": "time", "glyph": "•"}},
    {"name": "floating, last day", "view": {"status": "open", "section": "week", "window": "week"}, "days_left": 1, "remaining": 1, "todo": "This week", "card": {"words": "Last day", "tone": "bad", "glyph": "•"}},
    {"name": "this month", "view": {"status": "open", "section": "week", "window": "month"}, "days_left": 6, "remaining": 1, "todo": "This month", "card": null},
    {"name": "any time", "view": {"status": "open", "section": "week", "window": "once", "dated": false}, "days_left": 6, "remaining": 1, "todo": "This week", "card": null},
    {"name": "done", "view": {"status": "done", "section": "today", "window": "day"}, "todo": null, "card": null},
    {"name": "excused", "view": {"status": "excused", "section": "today", "window": "day"}, "todo": null, "card": {"words": "Excused", "tone": "muted"}},
    {"name": "away", "view": {"status": "away", "section": "today", "window": "day"}, "todo": null, "card": {"words": "Away", "tone": "neutral", "glyph": "🧳"}}
  ]
}
```

`tests/test_chores_board_backend.py` (new):

```python
"""What the chores board asks of the backend (spec 13): history, a day, late excuses, and the feed's extras."""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.chores.status import describe

from .chores_sample import SCENE, at, sample_engine
from .conftest import set_pin, ws_client_for, ws_command

STATUS = json.loads((Path(__file__).parent / "fixtures" / "chores_status.json").read_text("utf-8"))
TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
CAT_MONDAY_EVENING = "cat_care|casey|day:2026-10-12|1"


@pytest.mark.parametrize("case", STATUS["cases"], ids=lambda case: case["name"])
def test_status_words_follow_the_shared_table(case: dict[str, Any]) -> None:
    assert describe(case["view"], date.fromisoformat(STATUS["today"])) == case["todo"]


def test_history_tells_a_weekly_chores_streak_and_when_it_usually_gets_done() -> None:
    engine = sample_engine(at(9, 14, 9))
    for day in (19, 26):
        engine.catch_up(at(9, day, 14))
        engine.complete(at(9, day, 14), chore="yard_work", member="casey", by="casey", source="tablet")
    for day in (3, 10):
        engine.catch_up(at(10, day, 14))
        engine.complete(at(10, day, 14), chore="yard_work", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    history = engine.history(SCENE, "yard_work", "casey")
    assert history["streak"] == {"weeks": 4}
    assert history["weeks"] == {"done": 4, "of": 6}
    assert history["usual"] == {"band": "afternoon", "day": "sat"}
    assert [r["at"][:10] for r in history["recent"]] == ["2026-10-10", "2026-10-03", "2026-09-26", "2026-09-19"]


def test_history_counts_a_daily_chore_in_days() -> None:
    engine = sample_engine(at(10, 8, 7))
    for day in range(8, 13):
        engine.catch_up(at(10, day, 7))
        engine.complete(at(10, day, 7), chore="cat_care", member="casey", by="casey", source="tablet")
        engine.complete(at(10, day, 19), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    history = engine.history(SCENE, "cat_care", "casey")
    assert history["streak"] == {"days": 5}
    assert history["usual"]["day"] is None
    with pytest.raises(ChoreError) as err:
        engine.history(SCENE, "no_such_chore", "casey")
    assert err.value.code == "unknown_chore"


def test_a_past_day_comes_from_its_summary_and_the_log() -> None:
    engine = sample_engine(at(10, 12, 7))
    engine.complete(at(10, 12, 7, 5), key="cat_care|casey|day:2026-10-12|0", by="casey", source="tablet")
    engine.catch_up(SCENE)
    monday = engine.day_view(SCENE, date(2026, 10, 12))
    casey = monday["members"]["casey"]
    assert monday["kind"] == "past"
    assert sorted((i["key"], i["status"]) for i in casey["items"]) == [
        ("cat_care|casey|day:2026-10-12|0", "done"),
        (CAT_MONDAY_EVENING, "missed"),
    ]
    assert casey["summary"] == {"due": 2, "done": 1, "pending": 0, "closed": False}
    today = engine.day_view(SCENE, date(2026, 10, 13))
    assert today["kind"] == "today"
    assert [i["key"] for i in today["members"]["casey"]["items"]] == [
        "cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1", TRASH,
    ]


def test_excusing_a_missed_check_off_mends_its_day_and_the_streak() -> None:
    engine = sample_engine(at(10, 11, 7))
    engine.complete(at(10, 11, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.complete(at(10, 11, 19), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(at(10, 12, 7))
    engine.complete(at(10, 12, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    assert engine.streak("casey", SCENE) == 0
    out = engine.excuse_missed(SCENE, key=CAT_MONDAY_EVENING, by="blair", note="Sick day")
    assert (out.result, out.data, out.changed) == ("excused", {"occurrence": CAT_MONDAY_EVENING}, {"log"})
    assert engine.streak("casey", SCENE) == 2
    monday = engine.day_view(SCENE, date(2026, 10, 12))["members"]["casey"]
    assert monday["summary"] == {"due": 1, "done": 1, "pending": 0, "closed": True}
    assert (CAT_MONDAY_EVENING, "excused") in {(i["key"], i["status"]) for i in monday["items"]}
    with pytest.raises(ChoreError) as err:
        engine.excuse_missed(SCENE, key=CAT_MONDAY_EVENING, by="blair")
    assert err.value.code == "not_missed"


def test_the_board_tells_this_weeks_stars_and_recent_rewards() -> None:
    engine = sample_engine()
    engine.complete(at(10, 11, 8), chore="cat_care", member="casey", by="casey", source="tablet")  # last week
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    engine.complete(SCENE, key="cat_care|casey|day:2026-10-13|1", by="casey", source="tablet")
    engine.undo(SCENE, key="cat_care|casey|day:2026-10-13|1", by="casey", source="tablet")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎮", "cost": 1, "needs_ok": True})
    request = engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet").data["request"]
    engine.review(SCENE, request_id=request, allow=True, by="blair", source="tablet")
    board = engine.board(SCENE)
    assert board["members"]["casey"]["week_stars"] == 1
    assert board["members"]["dana"]["week_stars"] == 0
    assert board["recent_redemptions"] == [{
        "id": request, "member": "casey", "reward": "pick_the_weekend_game", "name": "Pick the weekend game",
        "cost": 1, "at": "2026-10-13T16:10:00-05:00", "by": "blair",
    }]


# The card's commands -----------------------------------------------------------------------


async def test_the_day_and_history_commands(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    day = await ws_command(client, {"type": "planavista/chores/day", "date": "2026-10-13"})
    assert day["result"]["kind"] == "today"
    assert {i["chore"] for i in day["result"]["members"]["casey"]["items"]} == {"cat_care", "take_out_the_trash"}
    history = await ws_command(client, {"type": "planavista/chores/history", "chore": "yard_work", "member": "casey"})
    assert history["result"]["streak"] == {"weeks": 0}
    unknown = await ws_command(client, {"type": "planavista/chores/history", "chore": "nope", "member": "casey"})
    assert unknown["error"] == {"code": "unknown_chore", "message": "That chore isn't in the plan."}


async def test_excusing_a_missed_one_is_a_parents(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    chores.engine.log["summaries"].append({
        "member": "casey", "period": "day:2026-10-12", "due": 2, "done": 1, "pending": 0,
        "minutes_due": 30.0, "minutes_done": 15.0, "minutes_pending": 0.0, "missed": [CAT_MONDAY_EVENING],
        "carried": [], "excused": [], "away": False, "closed": False, "chores": {"cat_care": {"due": 2, "done": 1}},
    })
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING})
    assert refused["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    reply = await ws_command(alex, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING, "note": "Sick"})
    assert reply["result"] == {"result": "excused", "occurrence": CAT_MONDAY_EVENING}
    again = await ws_command(alex, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING})
    assert again["error"] == {"code": "not_missed", "message": "That chore wasn't missed, or it was already excused."}


async def test_a_person_picks_their_own_my_day_style_and_goal(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    household = chores.household
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    reply = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "casey",
                                     "my_day": "list", "goal": "movie_night_pick"})
    member = reply["result"]["member"]
    assert (member["my_day"], member["goal"], member["rev"]) == ("list", "movie_night_pick", 2)
    assert household.member("casey")["goal"] == "movie_night_pick"
    others = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "dana", "my_day": "list"})
    assert others["error"]["code"] == "not_allowed"
    bad = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "casey", "my_day": "grid"})
    assert bad["error"] == {"code": "invalid_my_day", "message": "Pick a My day style."}


async def test_on_a_shared_screen_a_pin_protected_person_needs_their_pin_for_prefs(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    dana = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "dana", "my_day": "list"})
    assert dana["result"]["member"]["my_day"] == "list"
    refused = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "casey", "goal": None})
    assert refused["error"] == {"code": "pin_required", "message": "Casey's PIN or a parent's is needed."}
    unlocked = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": "4826"})
    session = unlocked["result"]["session"]
    allowed = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "casey",
                                         "goal": None, "session": session})
    assert allowed["result"]["member"]["goal"] is None
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_board_backend.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.status'`.

- [ ] **Step 3: Write the status words and the engine's new views.**

`custom_components/planavista/chores/status.py` (new):

```python
"""What an item's status says in words, for to-do descriptions (spec 10.3, 11.4).

It reads an item as the card and the actions see it (`ChoresEngine.item_view`),
so the card's status map and these words are checked against one table:
tests/fixtures/chores_status.json. Nothing here imports Home Assistant.
"""
from __future__ import annotations

from collections.abc import Mapping
from datetime import date
from typing import Any

WEEKDAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
MONTH_NAMES = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


def short_day(day: date, today: date) -> str:
    """"Mon" within a week of today, otherwise "Oct 3"."""
    if abs((day - today).days) <= 6:
        return WEEKDAY_NAMES[day.weekday()]
    return f"{MONTH_NAMES[day.month - 1]} {day.day}"


def _day(value: Any) -> date | None:
    return date.fromisoformat(value) if isinstance(value, str) and value else None


def describe(view: Mapping[str, Any], today: date) -> str | None:
    """The to-do item's description: what the status map would say about it."""
    status = view.get("status")
    if status == "pending":
        return "Waiting for a parent's OK"
    if status == "sent_back":
        return f"Sent back: {view['note']}" if view.get("note") else "Sent back"
    if status == "done":
        return None
    if (since := _day(view.get("overdue_since"))) is not None:
        return f"Overdue since {short_day(since, today)}"
    if (moved := _day(view.get("from"))) is not None:
        return f"From {short_day(moved, today)}"
    if view.get("dated") and (due := _day(view.get("due_day"))) is not None:
        return f"Due {short_day(due, today)}"
    if view.get("section") == "week":
        return "This month" if view.get("window") == "month" else "This week"
    return None
```

`custom_components/planavista/chores/engine.py`:

```diff
diff --git a/custom_components/planavista/chores/engine.py b/custom_components/planavista/chores/engine.py
index c4e12c6..3916b89 100644
--- a/custom_components/planavista/chores/engine.py
+++ b/custom_components/planavista/chores/engine.py
@@ -9,7 +9,7 @@ so tests can run months in milliseconds. Nothing here imports Home Assistant.
 """
 from __future__ import annotations
 
-from collections import defaultdict
+from collections import Counter, defaultdict
 from collections.abc import Callable, Iterable, Mapping
 from dataclasses import dataclass, field, replace
 from datetime import UTC, date, datetime, time, timedelta, tzinfo
@@ -36,8 +36,9 @@ from .occurrences import (
     visible_on,
     with_overrides,
 )
-from .periods import BANDS, Clock, WeekRule, parse_clock
+from .periods import BANDS, WEEKDAY_CODES, Clock, WeekRule, parse_clock
 from .recurrence import instances, last_instance, parse_rule
+from .status import describe
 
 AUTO = "auto"
 RETENTION = timedelta(days=90)
@@ -45,8 +46,8 @@ REPEAT_WINDOW = timedelta(seconds=60)
 CREDITED = ("done", "pending")
 OPEN = ("open", "sent_back")
 SECTIONS = ("overdue", "today", "week")
-WEEKDAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
-MONTH_NAMES = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
+HISTORY_WEEKS = 6
+RECENT_REDEMPTIONS = 5
 MAX_UNTIL_DAYS = 60
 EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed")
 _CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
@@ -119,13 +120,6 @@ def _at(value: str) -> datetime:
     return datetime.fromisoformat(value)
 
 
-def short_day(day: date, today: date) -> str:
-    """"Mon" within a week of today, otherwise "Oct 3" (for to-do descriptions)."""
-    if abs((day - today).days) <= 6:
-        return WEEKDAY_NAMES[day.weekday()]
-    return f"{MONTH_NAMES[day.month - 1]} {day.day}"
-
-
 def needs_ok(doer: Mapping[str, Any], activity: Mapping[str, Any] | None) -> bool:
     """Whether a check-off by `doer` waits for a parent's OK (spec 8.5 step 3, 10.3)."""
     if doer.get("parent"):
@@ -733,23 +727,7 @@ class ChoresEngine:
 
     def description(self, item: Item, today: date) -> str | None:
         """The to-do item's description: what the status map would say (spec 10.3)."""
-        if item.status == "pending":
-            return "Waiting for a parent's OK"
-        if item.status == "sent_back":
-            note = (item.completion or {}).get("review", {}) or {}
-            return f"Sent back: {note['note']}" if note.get("note") else "Sent back"
-        if item.status == "done":
-            return None
-        if item.overdue_since:
-            return f"Overdue since {short_day(item.overdue_since, today)}"
-        if item.moved_from:
-            return f"From {short_day(item.moved_from, today)}"
-        occ = item.occ
-        if occ.dated and occ.due is not None:
-            return f"Due {short_day(self.clock.due_day(occ.due), today)}"
-        if item.section == "week":
-            return "This month" if occ.window == "month" else "This week"
-        return None
+        return describe(self.item_view(item, today), today)
 
     def todo_items(
         self, member_id: str, now: datetime, items: Mapping[str, list[Item]] | None = None
@@ -795,6 +773,7 @@ class ChoresEngine:
         week_items = self._week_items(week, index, {day: by_member})
         members: dict[str, Any] = {}
         household = {"due": 0, "done": 0, "pending": 0}
+        week_stars = self._stars_since(clock.week_start(today))
         for member_id in self.member_ids():
             found = self._sorted(by_member.get(member_id, []), band)
             counted = [i for i in found if i.counted]
@@ -817,6 +796,7 @@ class ChoresEngine:
                 "streak": self.streak(member_id, now, found if day == today else None),
                 "week_streak": self.week_streak(member_id, now),
                 "stars": self.balance(member_id),
+                "week_stars": week_stars.get(member_id, 0),
                 "chore_minutes": self.chore_minutes(member_id),
                 "away": dict(away) if away else None,
             }
@@ -837,6 +817,7 @@ class ChoresEngine:
             "settings": dict(self.settings),
             "chores": [dict(a) for a in self.plan["activities"]],
             "rewards": [dict(r) for r in self.rewards["rewards"]],
+            "recent_redemptions": self.recent_redemptions(),
             "needs_a_look": self.needs_a_look(),
         }
 
@@ -911,6 +892,133 @@ class ChoresEngine:
             }
         return {"week": {"start": week.isoformat(), "end": end.isoformat()}, "today": today.isoformat(), "members": members}
 
+    def _stars_since(self, first: date) -> dict[str, int]:
+        """Stars each member earned by doing chores from chore day `first` on (the week's sticker strip).
+
+        The ledger only grows, in time order, so this reads it from the end.
+        """
+        earned: dict[str, int] = defaultdict(int)
+        for entry in reversed(self.rewards["ledger"]):
+            if self._day_of(entry.get("at")) < first:
+                break
+            if entry.get("reason") in ("chore", "undo"):
+                earned[entry["member"]] += int(entry["delta"])
+        return {member: max(0, stars) for member, stars in earned.items()}
+
+    def recent_redemptions(self) -> list[dict[str, Any]]:
+        """The last rewards given, newest first, with who approved them (spec 13.6)."""
+        given = [r for r in self.rewards["redemptions"] if r.get("state") == "given"]
+        given.sort(key=lambda r: _at((r.get("review") or {}).get("at") or r["at"]), reverse=True)
+        result = []
+        for r in given[:RECENT_REDEMPTIONS]:
+            reward = self.reward(r["reward"])
+            review = r.get("review") or {}
+            result.append({
+                "id": r["id"], "member": r["member"], "reward": r["reward"],
+                "name": reward["name"] if reward else r["reward"], "cost": r["cost"],
+                "at": review.get("at") or r["at"], "by": review.get("by"),
+            })
+        return result
+
+    def history(self, now: datetime, chore_id: str, member_id: str) -> dict[str, Any]:
+        """The options sheet's History (spec 13.3): the streak, recent check-offs, and when it usually gets done."""
+        activity = self.activity(chore_id)
+        if activity is None:
+            raise ChoreError("unknown_chore")
+        if self.member(member_id) is None:
+            raise ChoreError("unknown_member")
+        clock = self.clock
+        done = sorted(
+            (c for c in self.log["completions"]
+             if c.get("chore") == chore_id and c.get("member") == member_id and c.get("state") in CREDITED),
+            key=lambda c: _at(c["at"]),
+        )
+        this_week = clock.week_start(self.today(now))
+        done_weeks = {clock.week_start(self._day_of(c["at"])) for c in done}
+        begins = self.generator().begins(activity, member_id)
+        weeks = [clock.week_start(this_week - timedelta(days=7 * n)) for n in range(1, HISTORY_WEEKS + 1)]
+        weeks = [w for w in weeks if clock.week_end(w) > begins]
+        daily = activity.get("schedule") == "plan" and (activity.get("minimum") or {}).get("per") == "day"
+        if daily:
+            streak = {"days": self.chore_streak(member_id, chore_id, now)}
+        else:
+            summaries = self._summaries(member_id, "week")
+            count = 0
+            week = clock.week_start(this_week - timedelta(days=1))
+            while clock.week_end(week) > begins:
+                summary = summaries.get(week) or {}
+                late = (summary.get("missed") or []) + (summary.get("carried") or [])
+                if week not in done_weeks or any(key.startswith(f"{chore_id}|") for key in late):
+                    break
+                count += 1
+                week = clock.week_start(week - timedelta(days=1))
+            streak = {"weeks": count}
+        bands = Counter(clock.band(_at(c["at"])) for c in done)
+        days = Counter(WEEKDAY_CODES[self._day_of(c["at"]).weekday()] for c in done)
+        return {
+            "chore": chore_id,
+            "member": member_id,
+            "streak": streak,
+            "recent": [
+                {"at": c["at"], "done_by": c["done_by"], "state": c["state"], "occurrence": c["occurrence"]}
+                for c in reversed(done[-5:])
+            ],
+            "weeks": {"done": sum(1 for w in weeks if w in done_weeks), "of": len(weeks)},
+            "usual": {
+                "band": bands.most_common(1)[0][0] if bands else None,
+                "day": days.most_common(1)[0][0] if len(done) >= 3 and not daily else None,
+            },
+        }
+
+    def day_view(self, now: datetime, day: date) -> dict[str, Any]:
+        """One chore day for the Week view's day sheet (spec 13.5).
+
+        A past day comes from the log and that day's summaries (history stays
+        true); today and later days are worked out as they stand.
+        """
+        today = self.today(now)
+        members: dict[str, Any] = {}
+        if day >= today:
+            found = self.items(now, day)
+            for member_id in self.member_ids():
+                items = [i for i in found.get(member_id, []) if i.counted]
+                members[member_id] = {
+                    "items": [self.item_view(i, day) for i in items],
+                    "summary": None,
+                    "away": away_on(self.member(member_id) or {}, day) is not None,
+                }
+            return {"date": day.isoformat(), "kind": "today" if day == today else "future", "members": members}
+        for member_id in self.member_ids():
+            summary = self._summaries(member_id, "day").get(day)
+            items: list[dict[str, Any]] = []
+            for c in self.log["completions"]:
+                if c.get("member") == member_id and c.get("state") in CREDITED and self._day_of(c["at"]) == day:
+                    items.append(self._past_item(c["occurrence"], c["state"], done_by=c["done_by"], at=c["at"]))
+            if summary:
+                for key in summary.get("missed") or []:
+                    items.append(self._past_item(key, "missed"))
+                for key in summary.get("carried") or []:
+                    items.append(self._past_item(key, "carried"))
+                for key in summary.get("excused") or []:
+                    items.append(self._past_item(key, "excused"))
+            members[member_id] = {
+                "items": items,
+                "summary": (
+                    {k: summary.get(k) for k in ("due", "done", "pending", "closed")} if summary else None
+                ),
+                "away": bool(summary and summary.get("away")),
+            }
+        return {"date": day.isoformat(), "kind": "past", "members": members}
+
+    def _past_item(self, key: str, status: str, **extra: Any) -> dict[str, Any]:
+        parsed = parse_key(key)
+        chore = parsed[0] if parsed else key
+        activity = self.activity(chore)
+        return {
+            "key": key, "chore": chore, "name": activity["name"] if activity else chore,
+            "icon": activity.get("icon") if activity else None, "status": status, **extra,
+        }
+
     def needs_a_look(self) -> list[dict[str, Any]]:
         """Chores that wait off the board because nobody is assigned (spec 7.9, 15.5)."""
         return [
@@ -1248,6 +1356,46 @@ class ChoresEngine:
         self._finish_if_done(self.activity(chore), now, out)
         return out
 
+    def excuse_missed(self, now: datetime, *, key: str, by: str, note: str | None = None) -> Outcome:
+        """Excuse a check-off already counted as missed (a sick day noticed later, spec 13.5).
+
+        Its day and week stop counting it, so the ring and the streak hold.
+        """
+        found = [s for s in self.log["summaries"] if key in (s.get("missed") or [])]
+        if not found:
+            raise ChoreError("not_missed")
+        parsed = parse_key(key)
+        chore = parsed[0] if parsed else None
+        minutes = self._missed_minutes(key)
+        for summary in found:
+            summary["missed"] = [k for k in summary["missed"] if k != key]
+            summary["excused"] = [*(summary.get("excused") or []), key]
+            summary["due"] = max(0, int(summary.get("due", 0)) - 1)
+            if minutes is not None:
+                summary["minutes_due"] = round(max(0.0, float(summary.get("minutes_due", 0)) - minutes), 2)
+            tally = (summary.get("chores") or {}).get(chore)
+            if tally:
+                tally["due"] = max(0, tally["due"] - 1)
+            credited = int(summary.get("done", 0)) + int(summary.get("pending", 0))
+            summary["closed"] = summary["due"] > 0 and credited >= summary["due"]
+        self.log["overrides"].append(
+            {"occurrence": key, "excused": True, "note": note, "late": True, "by": by, "at": self._stamp(now)}
+        )
+        return Outcome("excused", {"occurrence": key}, changed={"log"})
+
+    def _missed_minutes(self, key: str) -> float | None:
+        """What a missed occurrence was worth, worked out again from its chore (None once the chore is gone)."""
+        parsed = parse_key(key)
+        activity = self.activity(parsed[0]) if parsed else None
+        if parsed is None or activity is None:
+            return None
+        _chore, member, period, _n = parsed
+        kind, _, start = period.partition(":")
+        for occ in self.generator().period_occurrences(activity, member, kind, _day(start) if start else None):
+            if occ.key == key:
+                return occ.credit_minutes
+        return None
+
     # Writing: the plan ---------------------------------------------------------------
 
     def save_activity(
```

- [ ] **Step 4: Add the commands and a person's own choices.**

`custom_components/planavista/chores/access.py`:

```diff
diff --git a/custom_components/planavista/chores/access.py b/custom_components/planavista/chores/access.py
index 0a94dda..ca3d8c8 100644
--- a/custom_components/planavista/chores/access.py
+++ b/custom_components/planavista/chores/access.py
@@ -61,6 +61,7 @@ MESSAGES: dict[str, str] = {
     "invalid_due": "Pick today or a later day.",
     "nothing_to_change": "Nothing to change.",
     "not_open": "That chore isn't open anymore.",
+    "not_missed": "That chore wasn't missed, or it was already excused.",
     "not_for_member": "That reward isn't one they can get.",
     "not_enough_stars": "Not enough stars yet.",
     "reason_required": "Add a reason.",
```

`custom_components/planavista/chores/websocket.py`:

```diff
diff --git a/custom_components/planavista/chores/websocket.py b/custom_components/planavista/chores/websocket.py
index 4815baa..9d2caee 100644
--- a/custom_components/planavista/chores/websocket.py
+++ b/custom_components/planavista/chores/websocket.py
@@ -125,6 +125,35 @@ def ws_chores_week(hass: HomeAssistant, connection: websocket_api.ActiveConnecti
     connection.send_result(msg["id"], runtime.engine.week_view(runtime.now(), msg.get("date")))
 
 
+@websocket_api.websocket_command({
+    vol.Required("type"): "planavista/chores/day", vol.Required("date"): cv.date,
+})
+@callback
+def ws_chores_day(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """One chore day for the Week view's day sheet: what was due, done, missed, or excused."""
+    runtime = _runtime(hass, connection, msg)
+    if runtime is None:
+        return
+    connection.send_result(msg["id"], runtime.engine.day_view(runtime.now(), msg["date"]))
+
+
+@websocket_api.websocket_command({
+    vol.Required("type"): "planavista/chores/history", vol.Required("chore"): str, vol.Required("member"): str,
+})
+@callback
+def ws_chores_history(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """The options sheet's History: the streak, recent check-offs, and when it usually gets done."""
+    runtime = _runtime(hass, connection, msg)
+    if runtime is None:
+        return
+    try:
+        result = runtime.engine.history(runtime.now(), msg["chore"], msg["member"])
+    except ChoreError as err:
+        connection.send_error(msg["id"], err.code, message(err))
+        return
+    connection.send_result(msg["id"], result)
+
+
 @websocket_api.websocket_command({
     vol.Required("type"): "planavista/chores/complete",
     vol.Required("occurrence"): str,
@@ -251,6 +280,25 @@ async def ws_chores_override(hass: HomeAssistant, connection: websocket_api.Acti
         connection.send_result(msg["id"], out.data)
 
 
+@websocket_api.websocket_command({
+    vol.Required("type"): "planavista/chores/excuse_missed",
+    vol.Required("occurrence"): str,
+    vol.Optional("note"): vol.Any(None, str),
+    SESSION: str,
+})
+@websocket_api.async_response
+async def ws_chores_excuse_missed(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """A parent excuses a check-off already counted as missed, so its day and the streak hold."""
+    runtime = _runtime(hass, connection, msg)
+    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
+        return
+    out = await _apply(connection, msg, runtime, lambda e, now: e.excuse_missed(
+        now, key=msg["occurrence"], by=context[1], note=msg.get("note"),
+    ))
+    if out is not None:
+        connection.send_result(msg["id"], {"result": out.result, **out.data})
+
+
 @websocket_api.websocket_command({
     vol.Required("type"): "planavista/chores/activity/save",
     vol.Optional("activity_id"): str,
@@ -412,6 +460,9 @@ async def ws_stars_award(hass: HomeAssistant, connection: websocket_api.ActiveCo
 CHORES_COMMANDS = (
     ws_chores_subscribe,
     ws_chores_week,
+    ws_chores_day,
+    ws_chores_history,
+    ws_chores_excuse_missed,
     ws_chores_complete,
     ws_chores_undo,
     ws_chores_request,
```

`custom_components/planavista/household/members.py`:

```diff
diff --git a/custom_components/planavista/household/members.py b/custom_components/planavista/household/members.py
index 1f6f219..97e5ea9 100644
--- a/custom_components/planavista/household/members.py
+++ b/custom_components/planavista/household/members.py
@@ -244,6 +244,32 @@ def update_member(
     return updated, member
 
 
+GOAL_MAX_LENGTH = 60
+
+
+def set_prefs(
+    members: list[dict[str, Any]], member_id: str, changes: Mapping[str, Any]
+) -> tuple[list[dict[str, Any]], dict[str, Any]]:
+    """A person's own choices: their My day style and the reward they're saving up for (spec 13.4, 8.15)."""
+    index = next((i for i, m in enumerate(members) if m["id"] == member_id), None)
+    if index is None:
+        raise MemberError("unknown_member")
+    member = dict(members[index])
+    if "my_day" in changes:
+        if changes["my_day"] not in MY_DAY_STYLES:
+            raise MemberError("invalid_my_day")
+        member["my_day"] = changes["my_day"]
+    if "goal" in changes:
+        goal = changes["goal"]
+        if goal is not None and (not isinstance(goal, str) or not 0 < len(goal) <= GOAL_MAX_LENGTH):
+            raise MemberError("invalid_goal")
+        member["goal"] = goal
+    member["rev"] = int(member.get("rev", 1)) + 1
+    updated = list(members)
+    updated[index] = member
+    return updated, member
+
+
 def remove_member(members: list[dict[str, Any]], member_id: str) -> list[dict[str, Any]]:
     """Everyone except `member_id`."""
     if not any(m["id"] == member_id for m in members):
```

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 315b1ce..002b1fd 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -30,9 +30,10 @@ from .members import (
     public_member,
     remove_member,
     reorder_members,
+    set_prefs,
     update_member,
 )
-from .permissions import Account, SessionView, may_manage_pin, parent_level
+from .permissions import Account, SessionView, may_manage_pin, member_level, parent_level
 from .security import (
     SESSION_IDLE_SECONDS,
     after_failure,
@@ -67,6 +68,7 @@ ERROR_MESSAGES = {
     "last_parent_pin": "A shared screen needs at least one parent with a PIN.",
     "needs_parent_pin": "Set a PIN for a parent first, so someone can open Settings here.",
     "invalid_away": "Pick the first and last days away.",
+    "invalid_goal": "Pick a reward to save up for.",
 }
 
 MEMBER_FIELDS = vol.Schema(
@@ -278,6 +280,55 @@ async def ws_member_save(
     )
 
 
+@websocket_api.websocket_command(
+    {
+        vol.Required("type"): "planavista/household/member/prefs",
+        vol.Required("member_id"): str,
+        vol.Optional("my_day"): str,
+        vol.Optional("goal"): vol.Any(None, str),
+        vol.Optional("session"): str,
+    }
+)
+@websocket_api.async_response
+async def ws_member_prefs(
+    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
+) -> None:
+    """A person's own choices (their My day style, their goal): member-level, like checking off."""
+    household = household_for(hass, connection, msg)
+    if household is None:
+        return
+    if not household.available:
+        connection.send_error(msg["id"], "unavailable", "Update PlanaVista to change people and PINs.")
+        return
+    member_id = msg["member_id"]
+    member = household.member(member_id)
+    if member is None:
+        connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
+        return
+    account = account_for(hass, household, connection.user)
+    session = session_for(household, connection, msg)
+    if member_level(account, session, member_id, member_id in household.pins) is None:
+        if account.screen_rules:
+            connection.send_error(
+                msg["id"], "pin_required", f"{member.get('name', member_id)}'s PIN or a parent's is needed."
+            )
+        else:
+            refuse(connection, msg, account)
+        return
+    try:
+        members, changed = set_prefs(
+            household.members, member_id, {key: msg[key] for key in ("my_day", "goal") if key in msg}
+        )
+    except MemberError as err:
+        _member_error(connection, msg, err)
+        return
+    household.members = members
+    await household.async_save()
+    connection.send_result(
+        msg["id"], {"member": public_member(changed, household.pins.get(member_id))}
+    )
+
+
 @websocket_api.websocket_command(
     {
         vol.Required("type"): "planavista/household/member/delete",
@@ -671,6 +722,7 @@ def ws_pin_touch(
 HOUSEHOLD_COMMANDS = (
     ws_household_subscribe,
     ws_member_save,
+    ws_member_prefs,
     ws_member_delete,
     ws_member_reorder,
     ws_shared_screen,
```

- [ ] **Step 5: Run them again.** Same command. Expected: `29 passed`.
- [ ] **Step 6: Run the whole backend suite.** `bash scripts/test-backend.sh -q` Expected: `962 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): what the board asks of the backend` with the trailers.

---

### Task 2: The stars formula, the status map, and who may change what

Spec 8.3 and 16 (the card's copy of the stars formula, checked against `tests/fixtures/chores_stars.json`), 11.4 (one status map, checked against Task 1's table), 9.5 (the rule, mirrored so a screen asks for the right PIN first), and 6.3 (a module the household doesn't use stays hidden).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/stars.ts`, `custom_components/planavista/frontend/src/core/status-map.ts`, `custom_components/planavista/frontend/src/core/access.ts`
- Modify: `custom_components/planavista/frontend/src/core/module-registry.ts`
- Test: `custom_components/planavista/frontend/test/stars.test.ts`, `custom_components/planavista/frontend/test/status-map.test.ts`, `custom_components/planavista/frontend/test/access.test.ts`, `custom_components/planavista/frontend/test/module-registry.test.ts`

**Interfaces:**
- Consumes: `tests/fixtures/chores_stars.json` (milestone 4), `tests/fixtures/chores_status.json` (Task 1).
- Produces: `starsFor(minutes, perStar, override?)`, `perStarText(perStar)`; `Tone`, `StatusBadge`, `StatusView`, `BadgeContext`, `itemBadge(view, ctx)`, `pastBadge(status, note?)`, `shortDay`, `dayDate`, `daysBetween`, `minutesText`, `ringLabel`; `Access`, `ParentAccess`, `memberAccess(view, session, memberId)`, `parentAccess(view, session)`, `pinChoicesFor(view, memberId)`, `actingParent`, `mayEverReview`; module registry `ModuleContext.household`, `OpenTarget`, `GlanceChip`, `ModuleAction`, `MemberProgress`, `ServiceHost`, `ModuleService`, `ModuleElement`, `ModuleDefinition.enabled` and `.service`, `resolveModules(registered, options, ctx)`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/stars.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { perStarText, starsFor } from '../src/core/stars';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_stars.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ minutes: number; minutes_per_star: number; override?: number; stars: number }>;
};

describe('starsFor', () => {
  it.each(TABLE.cases)('$minutes min at 1 per $minutes_per_star (override $override) earns $stars', c => {
    expect(starsFor(c.minutes, c.minutes_per_star, c.override)).toBe(c.stars);
  });

  it('treats a missing override like none', () => {
    expect(starsFor(60, 15, null)).toBe(4);
    expect(starsFor(60, 15, undefined)).toBe(4);
  });
});

describe('perStarText', () => {
  it('says how often a star comes', () => {
    expect(perStarText(15)).toBe('1 per 15 minutes');
    expect(perStarText(1)).toBe('1 per minute');
  });
});
```

`custom_components/planavista/frontend/test/status-map.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { daysBetween, itemBadge, minutesText, pastBadge, ringLabel, shortDay, type StatusView } from '../src/core/status-map';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_status.json', import.meta.url), 'utf-8')) as {
  today: string;
  cases: Array<{
    name: string;
    view: StatusView;
    days_left?: number;
    remaining?: number;
    card: { words: string; tone: string; glyph?: string } | null;
  }>;
};

describe('itemBadge', () => {
  it.each(TABLE.cases)('$name', c => {
    const badge = itemBadge(c.view, { today: TABLE.today, daysLeft: c.days_left ?? 6, remaining: c.remaining ?? 1 });
    expect(badge).toEqual(c.card);
  });
});

describe('shortDay', () => {
  it('names the weekday within a week of today, and the date further out', () => {
    expect(shortDay('2026-10-12', '2026-10-13')).toBe('Mon');
    expect(shortDay('2026-10-19', '2026-10-13')).toBe('Mon');
    expect(shortDay('2026-10-20', '2026-10-13')).toBe('Oct 20');
    expect(shortDay('2026-09-28', '2026-10-13')).toBe('Sep 28');
  });

  it('counts days across a daylight saving change', () => {
    expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
  });
});

describe('pastBadge', () => {
  it('words a past day\'s outcomes', () => {
    expect(pastBadge('missed')).toEqual({ words: 'Missed', tone: 'bad', glyph: '×' });
    expect(pastBadge('excused', 'Sick day')).toEqual({ words: 'Excused: Sick day', tone: 'muted' });
    expect(pastBadge('done').words).toBe('Done');
  });
});

describe('minutesText', () => {
  it('shows minutes under an hour and hours above', () => {
    expect(minutesText(15)).toBe('15 min');
    expect(minutesText(0.4)).toBe('1 min');
    expect(minutesText(60)).toBe('1 h');
    expect(minutesText(90)).toBe('1.5 h');
    expect(minutesText(160)).toBe('2 h 40 min');
  });
});

describe('ringLabel', () => {
  it('tells a screen reader how the day is going', () => {
    expect(ringLabel('Casey', 1, 3)).toBe('Casey, 1 of 3 done today');
    expect(ringLabel('Blair', 5, 5)).toBe('Blair, ring closed for today');
    expect(ringLabel('Dana', 0, 0)).toBe('Dana, nothing due today');
  });
});
```

`custom_components/planavista/frontend/test/access.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { actingParent, mayEverReview, memberAccess, parentAccess, pinChoicesFor } from '../src/core/access';
import type { AccountKind, HouseholdView, Member } from '../src/core/household';
import type { Session } from '../src/core/session';

function member(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

const PEOPLE = [
  member('alex', { parent: true, order: 0 }),
  member('blair', { parent: true, has_pin: true, order: 1 }),
  member('casey', { age_group: 'teen', has_pin: true, order: 2 }),
  member('dana', { age_group: 'young_child', order: 3 }),
];

function view(kind: AccountKind, memberId: string | null = null, members = PEOPLE): HouseholdView {
  return {
    available: true,
    members,
    account: {
      user_id: 'u', name: 'u', is_admin: kind === 'admin', shared: kind === 'shared', kind,
      member_id: memberId, parent_level: kind === 'admin' || kind === 'parent',
    },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

const session = (memberId: string, parent: boolean): Session => ({ token: 't', memberId, parent, lastTouch: 0 });

describe('memberAccess (spec 9.5)', () => {
  it('lets a parent\'s own login and an admin change anyone\'s items', () => {
    expect(memberAccess(view('parent', 'alex'), null, 'casey')).toBe('yes');
    expect(memberAccess(view('admin'), null, 'casey')).toBe('yes');
  });

  it('lets a child\'s own login change only their own items', () => {
    expect(memberAccess(view('member', 'casey'), null, 'casey')).toBe('yes');
    expect(memberAccess(view('member', 'casey'), null, 'dana')).toBe('no');
  });

  it('asks a shared screen for the PIN of someone who has one', () => {
    const kitchen = view('shared');
    expect(memberAccess(kitchen, null, 'dana')).toBe('yes');
    expect(memberAccess(kitchen, null, 'casey')).toBe('pin');
    expect(memberAccess(kitchen, session('casey', false), 'casey')).toBe('yes');
    expect(memberAccess(kitchen, session('casey', false), 'blair')).toBe('pin');
    expect(memberAccess(kitchen, session('blair', true), 'casey')).toBe('yes');
    expect(memberAccess(view('other'), null, 'casey')).toBe('pin');
  });

  it('allows nothing before the household answers, or for someone removed', () => {
    expect(memberAccess(null, null, 'casey')).toBe('no');
    expect(memberAccess(view('shared'), null, 'gone')).toBe('no');
  });
});

describe('parentAccess (spec 9.5)', () => {
  it('needs parent mode on a shared screen, and a parent with a PIN to start it', () => {
    expect(parentAccess(view('shared'), null)).toBe('pin');
    expect(parentAccess(view('shared'), session('blair', true))).toBe('yes');
    expect(parentAccess(view('shared'), session('casey', false))).toBe('pin');
    const nobody = PEOPLE.map(m => ({ ...m, has_pin: false }));
    expect(parentAccess(view('shared', null, nobody), null)).toBe('no_pin');
  });

  it('never lets a child\'s own login make parent changes', () => {
    expect(parentAccess(view('member', 'casey'), null)).toBe('no');
    expect(mayEverReview(view('member', 'casey'))).toBe(false);
    expect(mayEverReview(view('shared'))).toBe(true);
    expect(parentAccess(view('parent', 'alex'), null)).toBe('yes');
  });
});

describe('pinChoicesFor', () => {
  it('offers the person first, then parents who have PINs', () => {
    expect(pinChoicesFor(view('shared'), 'casey').map(m => m.id)).toEqual(['casey', 'blair']);
    expect(pinChoicesFor(view('shared'), 'dana').map(m => m.id)).toEqual(['blair']);
    expect(pinChoicesFor(view('shared'), 'blair').map(m => m.id)).toEqual(['blair']);
  });
});

describe('actingParent', () => {
  it('is the parent in parent mode, or the parent whose login this is', () => {
    expect(actingParent(view('shared'), session('blair', true))?.id).toBe('blair');
    expect(actingParent(view('parent', 'alex'), null)?.id).toBe('alex');
    expect(actingParent(view('shared'), null)).toBeNull();
  });
});
```

`custom_components/planavista/frontend/test/module-registry.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/module-registry.test.ts b/custom_components/planavista/frontend/test/module-registry.test.ts
index 0988dd2..88e242a 100644
--- a/custom_components/planavista/frontend/test/module-registry.test.ts
+++ b/custom_components/planavista/frontend/test/module-registry.test.ts
@@ -54,6 +54,16 @@ describe('resolveModules', () => {
   it('has nothing to show when no modules are registered', () => {
     expect(resolveModules([], {})).toEqual({ shown: [], initial: undefined });
   });
+
+  it('leaves out a module the household does not use', () => {
+    const optIn: ModuleDefinition = { ...chores, enabled: ctx => !!(ctx.household?.modules as { chores?: unknown } | undefined)?.chores };
+    const ctx = (on: boolean) => ({ config: undefined, data: null, household: { modules: on ? { chores: { enabled: true } } : {} } as never });
+    expect(resolveModules([calendar, optIn], {}, ctx(false)).shown.map(m => m.id)).toEqual(['calendar']);
+    expect(resolveModules([calendar, optIn], { module: 'chores' }, ctx(false)).initial?.id).toBe('calendar');
+    expect(resolveModules([calendar, optIn], { modules: ['chores'] }, ctx(false)).shown.map(m => m.id)).toEqual(['calendar']);
+    expect(resolveModules([calendar, optIn], { module: 'chores' }, ctx(true)).initial?.id).toBe('chores');
+    expect(resolveModules([calendar, optIn], {}).shown.map(m => m.id)).toEqual(['calendar']);
+  });
 });
 
 describe('initialModuleView', () => {
```

- [ ] **Step 2: Run them.** `cd custom_components/planavista/frontend && npx vitest run test/stars.test.ts test/status-map.test.ts test/access.test.ts test/module-registry.test.ts` Expected: FAIL: the three new files can't load the modules they import, and `module-registry.test.ts` fails `leaves out a module the household does not use`.

- [ ] **Step 3: Write the modules.**

`custom_components/planavista/frontend/src/core/stars.ts` (new):

```ts
/**
 * Stars per check-off (spec 8.3): the chore's own number when it has one,
 * otherwise 1 per `minutesPerStar` minutes, rounded half up, and at least 1.
 * The engine uses the same formula; both are checked against
 * tests/fixtures/chores_stars.json, so the worth a parent sees while adding
 * a chore is what the board awards.
 */
export function starsFor(creditMinutes: number, minutesPerStar: number, override?: number | null): number {
  if (override !== undefined && override !== null) return Math.trunc(override);
  // A hair over the half, so 37.5 / 15 = 2.4999999... still rounds up.
  return Math.max(1, Math.floor(creditMinutes / minutesPerStar + 0.5 + 1e-9));
}

/** "1 per 15 minutes" (quick add's worth line). */
export function perStarText(minutesPerStar: number): string {
  return minutesPerStar === 1 ? '1 per minute' : `1 per ${minutesPerStar} minutes`;
}
```

`custom_components/planavista/frontend/src/core/status-map.ts` (new):

```ts
/**
 * The status map (spec 11.4): one set of words, glyphs, and color jobs for
 * every chores view. Color is never alone: each state also has words.
 * The engine's to-do descriptions read the same item views and are checked
 * against the same table (tests/fixtures/chores_status.json).
 */

/** A color job (spec 11.3): neutral, something to act on (indigo), time pressure (amber), overdue or sent back (red), or quiet. */
export type Tone = 'neutral' | 'act' | 'time' | 'bad' | 'muted';

export interface StatusBadge {
  words: string;
  tone: Tone;
  glyph?: string;
}

/** The fields of an item view (planavista/chores/subscribe) the status map reads. */
export interface StatusView {
  status: string;
  section?: string;
  window?: string;
  from?: string | null;
  overdue_since?: string | null;
  dated?: boolean;
  due_day?: string | null;
  note?: string | null;
  planned?: string | null;
}

export interface BadgeContext {
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  /** Days left in the chore week, today included. */
  daysLeft: number;
  /** The chore's floating check-offs still open this week. */
  remaining: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A YYYY-MM-DD day as a local date at noon (so no zone shift moves it to another day). */
export function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Whole days from `from` to `to` (YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  return Math.round((dayDate(to).getTime() - dayDate(from).getTime()) / 86_400_000);
}

/** "Mon" within a week of today, otherwise "Oct 3" (the engine's short_day). */
export function shortDay(day: string, today: string): string {
  const date = dayDate(day);
  if (Math.abs(daysBetween(today, day)) <= 6) return WEEKDAYS[date.getDay()];
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/**
 * The badge beside an item's name, or null when its estimate shows instead.
 * Waiting for OK and Sent back come first; then overdue, make-up, and due
 * dates; a floating item turns amber when its open check-offs equal the days
 * left, and red on the last day (spec 8.4).
 */
export function itemBadge(view: StatusView, ctx: BadgeContext): StatusBadge | null {
  switch (view.status) {
    case 'done':
      return null;
    case 'pending':
      return { words: 'Waiting for OK', tone: 'act', glyph: '⏳' };
    case 'sent_back':
      return { words: view.note ? `Sent back: ${view.note}` : 'Sent back', tone: 'bad', glyph: '↩' };
    case 'excused':
      return { words: 'Excused', tone: 'muted' };
    case 'away':
      return { words: 'Away', tone: 'neutral', glyph: '🧳' };
    default:
      break;
  }
  if (view.overdue_since) return { words: `Overdue since ${shortDay(view.overdue_since, ctx.today)}`, tone: 'bad', glyph: '•' };
  if (view.from) return { words: `From ${shortDay(view.from, ctx.today)}`, tone: 'neutral' };
  if (view.dated && view.due_day) {
    if (view.due_day === ctx.today) return { words: 'Due today', tone: 'time' };
    return { words: `Due ${shortDay(view.due_day, ctx.today)}`, tone: 'neutral' };
  }
  if (view.section === 'week' && view.window === 'week' && ctx.remaining > 0) {
    if (ctx.daysLeft <= 1) return { words: 'Last day', tone: 'bad', glyph: '•' };
    if (ctx.remaining >= ctx.daysLeft) return { words: `${ctx.daysLeft} days left`, tone: 'time', glyph: '•' };
  }
  return null;
}

/** A past day's outcome for an item (the Week view's day sheet). */
export function pastBadge(status: string, note?: string | null): StatusBadge {
  switch (status) {
    case 'done':
      return { words: 'Done', tone: 'neutral', glyph: '✓' };
    case 'pending':
      return { words: 'Waiting for OK', tone: 'act', glyph: '⏳' };
    case 'missed':
      return { words: 'Missed', tone: 'bad', glyph: '×' };
    case 'carried':
      return { words: 'Carried over', tone: 'time', glyph: '•' };
    case 'excused':
      return { words: note ? `Excused: ${note}` : 'Excused', tone: 'muted' };
    default:
      return { words: status, tone: 'neutral' };
  }
}

/** "15 min", "1 h", "1.5 h", "2 h 40 min". */
export function minutesText(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${Math.max(1, rounded)} min`;
  const hours = rounded / 60;
  if (Number.isInteger(hours)) return `${hours} h`;
  if (Number.isInteger(hours * 2)) return `${hours.toFixed(1)} h`;
  return `${Math.floor(hours)} h ${rounded % 60} min`;
}

/** What a ring says to a screen reader (spec 11.8). */
export function ringLabel(name: string, done: number, due: number): string {
  if (due === 0) return `${name}, nothing due today`;
  if (done >= due) return `${name}, ring closed for today`;
  return `${name}, ${done} of ${due} done today`;
}
```

`custom_components/planavista/frontend/src/core/access.ts` (new):

```ts
import { HouseholdView, Member, inOrder, parentsWithPins } from './household';
import type { Session } from './session';

/**
 * The card's copy of the rule the backend enforces (spec 9.5), so a screen
 * can ask for the right PIN before it tries, instead of failing after. The
 * backend still decides; a refusal comes back as pin_required or
 * parent_mode_required.
 */

/** A member-level change (check off, uncheck, plan a day, ask, redeem): allowed now, after a PIN, or never here. */
export type Access = 'yes' | 'pin' | 'no';

/** A parent-level change: allowed now, after a parent's PIN, not possible until a parent has a PIN, or never here. */
export type ParentAccess = 'yes' | 'pin' | 'no_pin' | 'no';

function sharedRules(view: HouseholdView): boolean {
  return view.account.kind === 'shared' || view.account.kind === 'other';
}

/** Whether this screen may change `memberId`'s items. */
export function memberAccess(view: HouseholdView | null, session: Session | null, memberId: string): Access {
  if (!view || !view.available) return 'no';
  const account = view.account;
  if (account.parent_level) return 'yes';
  if (account.kind === 'member') return account.member_id === memberId ? 'yes' : 'no';
  if (!sharedRules(view)) return 'no';
  if (session && (session.parent || session.memberId === memberId)) return 'yes';
  const member = view.members.find(m => m.id === memberId);
  if (!member) return 'no';
  return member.has_pin ? 'pin' : 'yes';
}

/** Whether this screen may make parent-level changes. */
export function parentAccess(view: HouseholdView | null, session: Session | null): ParentAccess {
  if (!view || !view.available) return 'no';
  if (view.account.parent_level) return 'yes';
  if (!sharedRules(view)) return 'no';
  if (session?.parent) return 'yes';
  return parentsWithPins(view.members).length > 0 ? 'pin' : 'no_pin';
}

/** Who may unlock a member-level change to `memberId`'s items: them (when they have a PIN), then parents with PINs. */
export function pinChoicesFor(view: HouseholdView | null, memberId: string): Member[] {
  if (!view) return [];
  const member = view.members.find(m => m.id === memberId);
  const parents = parentsWithPins(view.members).filter(m => m.id !== memberId);
  return member?.has_pin ? [member, ...parents] : parents;
}

/** Who did a parent-level change on this screen: the parent in parent mode, or the account's own member. */
export function actingParent(view: HouseholdView | null, session: Session | null): Member | null {
  if (!view) return null;
  const id = session?.parent ? session.memberId : view.account.parent_level ? view.account.member_id : null;
  return inOrder(view.members).find(m => m.id === id) ?? null;
}

/** Whether this account can ever review requests (it decides whether the bar shows Waiting for OK). */
export function mayEverReview(view: HouseholdView | null): boolean {
  return parentAccess(view, null) !== 'no';
}
```

`custom_components/planavista/frontend/src/core/module-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/module-registry.ts b/custom_components/planavista/frontend/src/core/module-registry.ts
index 314deae..8136160 100644
--- a/custom_components/planavista/frontend/src/core/module-registry.ts
+++ b/custom_components/planavista/frontend/src/core/module-registry.ts
@@ -1,9 +1,15 @@
+import type { ReactiveController, ReactiveControllerHost } from 'lit';
+import type { HomeAssistant } from 'custom-card-helpers';
 import type { PlanaVistaCardConfig, PlanaVistaData } from '../types';
+import type { HouseholdView } from './household';
+import type { Session } from './session';
 
 /** What the shell knows when it asks a module a question. */
 export interface ModuleContext {
   config: PlanaVistaCardConfig | undefined;
   data: PlanaVistaData | null;
+  /** The household once it has answered; null before that, or without one. */
+  household?: HouseholdView | null;
 }
 
 /** A view a module offers in the bar (the calendar's Day, Week, Month, Agenda). */
@@ -12,6 +18,72 @@ export interface ModuleView {
   label: string;
 }
 
+/** Where a tap leads: a module, one of its views, and perhaps one person (a ring in the calendar opens their My day). */
+export interface OpenTarget {
+  module: string;
+  view?: string;
+  member?: string;
+}
+
+/** A glance chip in the header (spec 12.2), such as "9 of 17 chores done today". */
+export interface GlanceChip {
+  id: string;
+  text: string;
+  /** 0 to 1: a small ring before the text. */
+  progress?: number;
+  /** Shown in the one-row landscape header as well as in portrait. */
+  primary?: boolean;
+  /** Where a tap leads. */
+  open?: OpenTarget;
+}
+
+/** A button a module adds to the bar or the parent-mode strip, such as "⏳ 2 waiting for OK". */
+export interface ModuleAction {
+  id: string;
+  label: string;
+  /** A leading glyph or emoji. */
+  glyph?: string;
+  /** 'act' draws it in indigo: something to act on (spec 11.3). */
+  tone?: 'act' | 'plain';
+}
+
+/** One person's chore progress today, for rings on other screens (spec 13.9). */
+export interface MemberProgress {
+  done: number;
+  pending: number;
+  due: number;
+}
+
+/** What a module's service can read from the card. */
+export interface ServiceHost extends ReactiveControllerHost, HTMLElement {
+  hass?: HomeAssistant;
+  /** The household, once it has answered. */
+  readonly householdView: HouseholdView | null;
+  /** The PIN session on this screen. */
+  readonly pinSession: Session | null;
+}
+
+/**
+ * Card-wide state a module keeps while the card is on the page, even when
+ * another module is on screen: the chores feed behind the header's glance
+ * chip and the calendar's rings.
+ */
+export interface ModuleService extends ReactiveController {
+  /** The header's glance chips. */
+  glance?(ctx: ModuleContext): GlanceChip[];
+  /** Buttons in the bar while this module is on screen. */
+  barActions?(ctx: ModuleContext): ModuleAction[];
+  /** Buttons in the parent-mode strip (spec 9.4: + Add chore). */
+  stripActions?(ctx: ModuleContext): ModuleAction[];
+  /** One person's progress today, or null when there's nothing to show. */
+  memberProgress?(memberId: string): MemberProgress | null;
+}
+
+/** The element a module renders through; the shell hands it bar and strip taps. */
+export interface ModuleElement extends HTMLElement {
+  moduleAction?(id: string): void;
+}
+
 /** A feature area the card hosts (Calendar today; Chores and Lists later). */
 export interface ModuleDefinition {
   /** Stable id, used by the card options `modules` and `module`. */
@@ -30,6 +102,10 @@ export interface ModuleDefinition {
   initialView?(ctx: ModuleContext): string | undefined;
   /** Entities whose state changes should re-render this module. */
   watchedEntities(ctx: ModuleContext): string[];
+  /** Whether the household uses this module (spec 6.3); without it a module is always on. */
+  enabled?(ctx: ModuleContext): boolean;
+  /** The module's card-wide state, made once per card. */
+  service?(host: ServiceHost): ModuleService;
 }
 
 /** The view a module opens on: the one it asks for when it offers it, else its first. */
@@ -67,20 +143,23 @@ export interface ResolvedModules {
 }
 
 /**
- * Apply the card options to the registered modules. `modules` (a list of
- * ids) picks and orders them; unknown ids and repeats are ignored, and if
- * nothing valid is listed every module is shown. `module` names the one the
+ * Apply the household and the card options to the registered modules. A
+ * module the household doesn't use is left out. `modules` (a list of ids)
+ * picks and orders the rest; unknown ids and repeats are ignored, and if
+ * nothing valid is listed every one is shown. `module` names the one the
  * card opens on, if it is shown.
  */
 export function resolveModules(
   registered: ModuleDefinition[],
   options: { modules?: unknown; module?: unknown },
+  ctx: ModuleContext = { config: undefined, data: null },
 ): ResolvedModules {
-  let shown = registered;
+  const usable = registered.filter(m => !m.enabled || m.enabled(ctx));
+  let shown = usable;
   if (Array.isArray(options.modules)) {
     const picked: ModuleDefinition[] = [];
     for (const id of options.modules) {
-      const found = typeof id === 'string' ? registered.find(m => m.id === id) : undefined;
+      const found = typeof id === 'string' ? usable.find(m => m.id === id) : undefined;
       if (found && !picked.includes(found)) picked.push(found);
     }
     if (picked.length > 0) shown = picked;
```

- [ ] **Step 4: Run them again.** Same command. Expected: `58 passed`.
- [ ] **Step 5: Run the whole frontend suite.** `npx tsc --noEmit -p . && npm test` Expected: tsc clean, `466 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(card): the stars formula, the status map, and who may change what` with the trailers.

---

### Task 3: The live board feed, the check-off queue, and the card-wide service

Spec 10.7 (`planavista/chores/subscribe`, pushed again after every change), 11.6 (optimistic check-offs), 15.1 (check-offs wait out a lost connection in browser storage, are resent safely by occurrence, and revert with a message when refused), and 12.2 (the header's glance and the bar's buttons). The household subscription moves onto the same `LiveSubscription`, and both clients share `WsApi` (a refused command that carried a session ends that session here too).

**Files:**
- Create: `custom_components/planavista/frontend/src/core/live-subscription.ts`, `custom_components/planavista/frontend/src/core/ws-api.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-types.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-client.ts`, `custom_components/planavista/frontend/src/modules/chores/checkoff-queue.ts`, `custom_components/planavista/frontend/src/modules/chores/overlay.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-glance.ts`, `custom_components/planavista/frontend/src/modules/chores/calendar-ties.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-service.ts`
- Modify: `custom_components/planavista/frontend/src/core/household-client.ts`, `custom_components/planavista/frontend/src/core/module-registry.ts`
- Test: `custom_components/planavista/frontend/test/chores-fixtures.ts` (shared sample board), `custom_components/planavista/frontend/test/checkoff-queue.test.ts`, `custom_components/planavista/frontend/test/chores-overlay.test.ts`, `custom_components/planavista/frontend/test/live-subscription.test.ts`, `custom_components/planavista/frontend/test/chores-glance.test.ts`, `custom_components/planavista/frontend/test/calendar-ties.test.ts`

**Interfaces:**
- Consumes: Task 2's access rules and registry types.
- Produces: `LiveSubscription<T>` (`status` idle, connecting, live, or offline; `update`, `stop`, `retry`); `WsApi`, `WsCaller`, `errorCode`, `errorMessage`; `ChoresSubscription`, `ChoresApi` (every chores command, `savePrefs`, `startOver`); the feed types (`Board`, `BoardMember`, `ItemView`, `ChoreRequest`, `Activity`, `Reward`, `WeekView`, `DayView`, `ChoreHistory`, ...); `CheckoffQueue` (`add`, `flush`, `entries`, `waiting`, `latestFor`), `QueuedCheckoff`, `browserStorage()`, `outcomeOf(err)`; `withQueued(board, entries)`, `statsOf`, `needsOk(doer, activity)`, `localStamp`; `choresGlance`, `nextEventChip`, `choresBarActions`, `choresStripActions`; `eventsOn`, `nextOnCalendar`, `nextForHousehold`, `clockTime`, `DayEvent`; `ChoresService` (`feed`, `status`, `board()`, `enqueue`, `send`, `retry`, `notify`, `takeNotices`, `glance`, `barActions`, `stripActions`, `memberProgress`), `choresEnabled(ctx)`, `refusalText(entry, code)`.

- [ ] **Step 1: Write the shared sample board and the failing tests.**

`custom_components/planavista/frontend/test/chores-fixtures.ts` (new):

```ts
// The sample household's chores board (spec 4), for the chores tests: Tuesday,
// October 13, 2026, at 4:10 PM in America/Chicago, weeks starting on Monday.
import type { Member } from '../src/core/household';
import type { Activity, Board, BoardMember, ItemView } from '../src/modules/chores/chores-types';

export const TODAY = '2026-10-13';
export const NOW = new Date(2026, 9, 13, 16, 10);

export function person(id: string, fields: Partial<Member> = {}): Member {
  return {
    id, name: id[0].toUpperCase() + id.slice(1), color: '#43AA8B', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline', needs_ok_for: 'none',
    stars: false, has_pin: false, pin_length: null, locked_until: null, ...fields,
  };
}

export const MEMBERS: Member[] = [
  person('alex', { parent: true, order: 0, color: '#277DA1' }),
  person('blair', { parent: true, order: 1, has_pin: true, color: '#F3722C' }),
  person('casey', { age_group: 'teen', order: 2, has_pin: true, stars: true, needs_ok_for: 'marked', color: '#43AA8B' }),
  person('dana', { age_group: 'young_child', order: 3, stars: true, needs_ok_for: 'all', my_day: 'pictures', color: '#F94144' }),
];

export function item(key: string, fields: Partial<ItemView> = {}): ItemView {
  const [chore, member, period, n] = key.split('|');
  return {
    key, chore, name: chore.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), icon: null, member, owner: member,
    period, n: Number(n), section: 'today', band: null, planned: TODAY, due: `${TODAY}T03:00:00-05:00`, due_day: TODAY,
    window: 'day', dated: false, status: 'open', counted: true, credit_minutes: 15, stars: 1, from: null,
    overdue_since: null, needs_ok: false, completion: null, note: null, request: null, ...fields,
  };
}

const ZERO = { due: 0, done: 0, pending: 0, minutes_due: 0, minutes_done: 0, minutes_pending: 0 };

export function column(items: ItemView[], fields: Partial<BoardMember> = {}): BoardMember {
  const counted = items.filter(i => i.counted && i.status !== 'away' && i.status !== 'excused');
  const today = {
    ...ZERO,
    due: counted.length,
    done: counted.filter(i => i.status === 'done').length,
    pending: counted.filter(i => i.status === 'pending').length,
  };
  return {
    items, today, week: { ...ZERO, percent: null }, contribution: { minutes: 0, shared_minutes: 0 }, streak: 0,
    week_streak: 0, stars: 0, week_stars: 0, chore_minutes: 0, away: null, ...fields,
  };
}

export function activity(id: string, fields: Partial<Activity> = {}): Activity {
  return {
    id, name: id.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), icon: null, category: 'other',
    schedule: 'plan', assignees: [], on_board: true, needs_ok: false, stars: null, ...fields,
  };
}

export function board(members: Record<string, BoardMember>, fields: Partial<Board> = {}): Board {
  const household = { due: 0, done: 0, pending: 0 };
  for (const m of Object.values(members)) {
    household.due += m.today.due;
    household.done += m.today.done;
    household.pending += m.today.pending;
  }
  return {
    date: TODAY, today: TODAY, now: '2026-10-13T16:10:00-05:00', band: 'afternoon',
    day: { start: '2026-10-13T03:00:00-05:00', end: '2026-10-14T03:00:00-05:00' },
    week: { start: '2026-10-12', end: '2026-10-19', days_left: 6 },
    members, household, requests: [],
    settings: { missed: 'make_up', day_starts: '03:00', auto_approve: 'day_end', minutes_per_star: 15, evening_check: '19:00', sound: false },
    chores: [], rewards: [], recent_redemptions: [], needs_a_look: [], ...fields,
  };
}
```

`custom_components/planavista/frontend/test/checkoff-queue.test.ts` (new):

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CheckoffQueue,
  QueuedCheckoff,
  QueueStorage,
  SendOutcome,
  browserStorage,
  outcomeOf,
} from '../src/modules/chores/checkoff-queue';

function memoryStorage(initial: QueuedCheckoff[] = []): QueueStorage & { saved: QueuedCheckoff[][] } {
  const saved: QueuedCheckoff[][] = [];
  let current = initial;
  return {
    saved,
    load: () => current,
    save: entries => {
      current = entries;
      saved.push(entries);
    },
  };
}

const TRASH = { op: 'complete' as const, occurrence: 'take_out_the_trash|casey|week:2026-10-12|0', member: 'casey', name: 'Take out the trash' };
const CAT = { op: 'complete' as const, occurrence: 'cat_care|casey|day:2026-10-13|1', member: 'casey', name: 'Cat care' };

function queueWith(send: (entry: QueuedCheckoff) => Promise<SendOutcome>, storage = memoryStorage()) {
  const refused: Array<[string, string]> = [];
  const changed = vi.fn();
  const queue = new CheckoffQueue(storage, send, { changed, refused: (entry, code) => refused.push([entry.name, code]) });
  return { queue, refused, changed, storage };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoffQueue (spec 15.1)', () => {
  it('sends check-offs oldest first and forgets each once it went through', async () => {
    const sent: string[] = [];
    const { queue, storage } = queueWith(async entry => {
      sent.push(entry.name);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
    expect(queue.waiting).toBe(false);
    expect(storage.saved.at(-1)).toEqual([]);
  });

  it('keeps everything while there is no connection, and goes on when it comes back', async () => {
    let online = false;
    const sent: string[] = [];
    const { queue } = queueWith(async entry => {
      if (!online) return { kind: 'wait' };
      sent.push(entry.name);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(queue.entries.map(e => e.name)).toEqual(['Take out the trash', 'Cat care']);
    online = true;
    await queue.flush();
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
  });

  it('drops one Home Assistant refuses, says so, and sends the rest', async () => {
    const { queue, refused } = queueWith(async entry =>
      entry.name === 'Take out the trash' ? { kind: 'refused', code: 'period_closed', message: 'The day had ended.' } : { kind: 'sent' });
    queue.add(TRASH);
    queue.add(CAT);
    await queue.flush();
    expect(refused).toEqual([['Take out the trash', 'period_closed']]);
    expect(queue.waiting).toBe(false);
  });

  it('cancels a check-off that was taken back before it left', async () => {
    const send = vi.fn(async (): Promise<SendOutcome> => ({ kind: 'wait' }));
    const { queue } = queueWith(send);
    queue.add(TRASH);
    expect(queue.add({ ...TRASH, op: 'undo' })).toBeNull();
    expect(queue.waiting).toBe(false);
    queue.add({ ...TRASH, doneBy: 'blair' });
    expect(queue.entries.map(e => [e.op, e.doneBy])).toEqual([['complete', 'blair']]);
  });

  it('sends an uncheck of a check-off that already went through', async () => {
    const ops: string[] = [];
    const { queue } = queueWith(async entry => {
      ops.push(entry.op);
      return { kind: 'sent' };
    });
    queue.add(TRASH);
    await queue.flush();
    queue.add({ ...TRASH, op: 'undo' });
    queue.add({ ...TRASH, doneBy: 'blair' });
    await queue.flush();
    expect(ops).toEqual(['complete', 'undo', 'complete']);
  });

  it('survives a reload: what was waiting comes back from storage', () => {
    const storage = memoryStorage();
    const first = queueWith(async () => ({ kind: 'wait' }), storage);
    first.queue.add(TRASH);
    const second = queueWith(async () => ({ kind: 'wait' }), storage);
    expect(second.queue.entries.map(e => e.occurrence)).toEqual([TRASH.occurrence]);
  });

  it('flushes once at a time, and once more if asked meanwhile', async () => {
    let release: () => void = () => undefined;
    const sent: string[] = [];
    const { queue } = queueWith(entry => new Promise(resolve => {
      sent.push(entry.name);
      release = () => resolve({ kind: 'sent' });
    }));
    queue.add(TRASH);
    const first = queue.flush();
    queue.add(CAT);
    void queue.flush();
    release();
    await Promise.resolve();
    await Promise.resolve();
    release();
    await first;
    expect(sent).toEqual(['Take out the trash', 'Cat care']);
  });
});

describe('outcomeOf', () => {
  it('treats a code Home Assistant chose as a refusal and anything else as a lost connection', () => {
    expect(outcomeOf({ code: 'pin_required', message: 'x' })).toEqual({ kind: 'refused', code: 'pin_required', message: null });
    expect(outcomeOf(3)).toEqual({ kind: 'wait' });
    expect(outcomeOf(new Error('Connection lost'))).toEqual({ kind: 'wait' });
  });
});

describe('browserStorage', () => {
  it('keeps the queue in localStorage and drops entries from days ago or that make no sense', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    });
    const now = 1_800_000_000_000;
    const storage = browserStorage(() => now);
    const fresh = { ...TRASH, id: 'a', at: now - 1000 };
    storage.save([fresh, { ...CAT, id: 'b', at: now - 3 * 86_400_000 }, { id: 'c' } as never]);
    expect(storage.load()).toEqual([fresh]);
    storage.save([]);
    expect(store.has('planavista.checkoffs')).toBe(false);
  });

  it('works without storage (a blocked or private browser)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    });
    const storage = browserStorage();
    expect(storage.load()).toEqual([]);
    expect(() => storage.save([{ ...TRASH, id: 'a', at: 1 }])).not.toThrow();
  });
});
```

`custom_components/planavista/frontend/test/chores-overlay.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { localStamp, needsOk, statsOf, withQueued } from '../src/modules/chores/overlay';
import { activity, board, column, item, MEMBERS } from './chores-fixtures';

const TRASH = 'take_out_the_trash|casey|week:2026-10-12|0';
const CAT = 'cat_care|casey|day:2026-10-13|1';
const queued = (occurrence: string, op: 'complete' | 'undo', fields = {}) => ({
  id: 'q1', op, occurrence, member: 'casey', name: 'x', at: new Date(2026, 9, 13, 16, 12).getTime(), ...fields,
});

describe('withQueued (spec 11.6)', () => {
  const today = board({ casey: column([item(TRASH), item(CAT, { status: 'done' })]) });

  it('hands back the same board when nothing waits', () => {
    expect(withQueued(today, [])).toBe(today);
  });

  it('shows a waiting check-off as done, and counts it', () => {
    const shown = withQueued(today, [queued(TRASH, 'complete')]);
    const trash = shown.members.casey.items[0];
    expect(trash.status).toBe('done');
    expect(trash.completion).toMatchObject({ done_by: 'casey', state: 'done', at: '2026-10-13T16:12:00-05:00' });
    expect(shown.members.casey.today).toMatchObject({ due: 2, done: 2 });
    expect(shown.household).toEqual({ due: 2, done: 2, pending: 0 });
    expect(today.members.casey.items[0].status).toBe('open');
  });

  it('shows Waiting for OK when the check-off needs one, and who did it', () => {
    const shown = withQueued(today, [queued(TRASH, 'complete', { shows: 'pending', doneBy: 'blair' })]);
    expect(shown.members.casey.items[0]).toMatchObject({ status: 'pending', completion: { done_by: 'blair' } });
    expect(shown.members.casey.today.pending).toBe(1);
  });

  it('shows a waiting uncheck as open again', () => {
    const shown = withQueued(today, [queued(CAT, 'undo')]);
    expect(shown.members.casey.items[1]).toMatchObject({ status: 'open', completion: null });
    expect(shown.members.casey.today.done).toBe(0);
  });

  it('leaves items the feed already settled, and items it no longer has', () => {
    expect(withQueued(today, [queued(CAT, 'complete')])).toBe(today);
    expect(withQueued(today, [queued('gone|casey|once|0', 'complete')])).toBe(today);
  });
});

describe('statsOf', () => {
  it('counts what is due today, with Waiting for OK apart and excused or away left out', () => {
    const stats = statsOf([
      item('a|x|day:1|0', { status: 'done', credit_minutes: 30 }),
      item('b|x|day:1|0', { status: 'pending', credit_minutes: 10 }),
      item('c|x|day:1|0', { status: 'excused' }),
      item('d|x|week:1|0', { counted: false }),
      item('e|x|day:1|0'),
    ]);
    expect(stats).toEqual({ due: 3, done: 1, pending: 1, minutes_due: 55, minutes_done: 30, minutes_pending: 10 });
  });
});

describe('needsOk (spec 8.5)', () => {
  const [alex, , casey, dana] = MEMBERS;
  it('follows the doer\'s setting and the chore\'s mark', () => {
    expect(needsOk(alex, activity('laundry', { needs_ok: true }))).toBe(false);
    expect(needsOk(casey, activity('laundry'))).toBe(false);
    expect(needsOk(casey, activity('bathroom', { needs_ok: true }))).toBe(true);
    expect(needsOk(dana, activity('feed_the_fish'))).toBe(true);
    expect(needsOk({ ...casey, needs_ok_for: 'none' }, activity('brush', { needs_ok_always: true }))).toBe(true);
    expect(needsOk(undefined, activity('x'))).toBe(false);
  });
});

describe('localStamp', () => {
  it('writes a local time with its offset, as the engine does', () => {
    expect(localStamp(new Date(2026, 9, 13, 16, 10, 5).getTime())).toBe('2026-10-13T16:10:05-05:00');
    expect(localStamp(new Date(2026, 11, 1, 9, 0).getTime())).toBe('2026-12-01T09:00:00-06:00');
  });
});
```

`custom_components/planavista/frontend/test/live-subscription.test.ts` (new):

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LiveConnection, LiveStatus, LiveSubscription } from '../src/core/live-subscription';

type Listener = () => void;

function fakeConnection() {
  const callbacks: Array<(event: string) => void> = [];
  const pending: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];
  const listeners = new Map<string, Listener[]>();
  const connection: LiveConnection<string> = {
    subscribeMessage: vi.fn((callback: (event: string) => void) => {
      callbacks.push(callback);
      return new Promise<() => void>((resolve, reject) => {
        pending.push({ resolve: () => resolve(() => undefined), reject });
      });
    }),
    addEventListener: (event, listener) => listeners.set(event, [...(listeners.get(event) ?? []), listener]),
    removeEventListener: (event, listener) => listeners.set(event, (listeners.get(event) ?? []).filter(l => l !== listener)),
  };
  return {
    connection,
    callbacks,
    resolveAll: () => pending.splice(0).forEach(p => p.resolve()),
    failAll: (err: unknown) => pending.splice(0).forEach(p => p.reject(err)),
    fire: (event: string) => (listeners.get(event) ?? []).forEach(listener => listener()),
  };
}

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++) await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('LiveSubscription status', () => {
  it('goes from connecting to live, offline on a drop, and live again after the reconnect', async () => {
    const statuses: LiveStatus[] = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, () => undefined, status => statuses.push(status));
    sub.update(fake.connection);
    fake.resolveAll();
    await settle();
    fake.fire('disconnected');
    fake.fire('ready');
    fake.resolveAll();
    await settle();
    expect(statuses).toEqual(['connecting', 'live', 'offline', 'live']);
  });

  it('is offline while refused and tries again, now when asked', async () => {
    vi.useFakeTimers();
    const statuses: LiveStatus[] = [];
    const events: Array<string | null> = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, event => events.push(event), status => statuses.push(status));
    sub.update(fake.connection);
    fake.failAll({ code: 'not_loaded' });
    await settle();
    expect(statuses).toEqual(['connecting', 'offline']);
    expect(events).toEqual([null]);
    sub.retry();
    fake.resolveAll();
    await settle();
    expect(statuses.at(-1)).toBe('live');
    fake.callbacks.at(-1)?.('board');
    expect(events.at(-1)).toBe('board');
  });

  it('is idle once stopped', async () => {
    const statuses: LiveStatus[] = [];
    const fake = fakeConnection();
    const sub = new LiveSubscription<string>({ type: 'x' }, () => undefined, status => statuses.push(status));
    sub.update(fake.connection);
    sub.stop();
    expect(statuses).toEqual(['connecting', 'idle']);
  });
});
```

`custom_components/planavista/frontend/test/chores-glance.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { choresBarActions, choresGlance, choresStripActions, nextEventChip } from '../src/modules/chores/chores-glance';
import { choresEnabled, refusalText } from '../src/modules/chores/chores-service';
import type { AccountKind, HouseholdView } from '../src/core/household';
import type { Session } from '../src/core/session';
import { MEMBERS, board, column, item } from './chores-fixtures';

function view(kind: AccountKind, memberId: string | null = null, modules: Record<string, unknown> = { chores: { enabled: true } }): HouseholdView {
  return {
    available: true,
    members: MEMBERS,
    account: { user_id: 'u', name: 'u', is_admin: kind === 'admin', shared: kind === 'shared', kind, member_id: memberId, parent_level: kind === 'admin' || kind === 'parent' },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules,
    setup: { completed: true, step: null },
  };
}

const today = board({
  alex: column([item('a|alex|day:1|0', { status: 'done' }), item('b|alex|day:1|0')]),
  casey: column([item('c|casey|day:1|0', { status: 'pending' }), item('d|casey|day:1|0')]),
});

describe('choresGlance (spec 12.2)', () => {
  it('counts the household\'s chores, Waiting for OK as done', () => {
    expect(choresGlance(today)).toEqual([{
      id: 'chores', text: '2 of 4 chores done today', progress: 0.5, primary: true, open: { module: 'chores', view: 'board' },
    }]);
  });

  it('says when every chore is done, and shows nothing on a day with none', () => {
    const done = board({ alex: column([item('a|alex|day:1|0', { status: 'done' })]) });
    expect(choresGlance(done)[0].text).toBe('All 1 chores done today');
    expect(choresGlance(board({}))).toEqual([]);
    expect(choresGlance(null)).toEqual([]);
  });

  it('words the next event', () => {
    expect(nextEventChip({ title: 'Dentist', time: '4:45', who: 'Alex' })[0].text).toBe('Next: Dentist at 4:45 · Alex');
    expect(nextEventChip({ title: 'Pizza night', time: '6:00', who: null })[0].text).toBe('Next: Pizza night at 6:00');
    expect(nextEventChip(null)).toEqual([]);
  });
});

describe('choresBarActions', () => {
  const waiting = { ...today, requests: [{ id: 'r1', kind: 'completion' as const, member: 'dana', name: 'Feed the fish', at: '' }] };
  const parentMode: Session = { token: 't', memberId: 'blair', parent: true, lastTouch: 0 };

  it('shows Waiting for OK and Add chore on a shared screen', () => {
    expect(choresBarActions(waiting, view('shared'), null).map(a => a.label)).toEqual(['1 waiting for OK', 'Add chore']);
  });

  it('moves Add chore to the strip in parent mode', () => {
    expect(choresBarActions(waiting, view('shared'), parentMode).map(a => a.id)).toEqual(['inbox']);
    expect(choresStripActions(waiting).map(a => a.id)).toEqual(['add']);
  });

  it('shows a child\'s own login neither', () => {
    expect(choresBarActions(waiting, view('member', 'casey'), null)).toEqual([]);
  });

  it('leaves out Waiting for OK when nothing waits', () => {
    expect(choresBarActions(today, view('parent', 'alex'), null).map(a => a.id)).toEqual(['add']);
  });
});

describe('choresEnabled', () => {
  it('is on only when the household turned chores on', () => {
    expect(choresEnabled({ household: view('shared') })).toBe(true);
    expect(choresEnabled({ household: view('shared', null, {}) })).toBe(false);
    expect(choresEnabled({ household: null })).toBe(false);
  });
});

describe('refusalText (spec 15.1)', () => {
  const entry = { id: '1', op: 'complete' as const, occurrence: 'x', member: 'casey', name: 'Take out the trash', at: 0 };
  it('says what happened and what to do', () => {
    expect(refusalText(entry, 'period_closed')).toBe('Couldn\'t save "Take out the trash": the day had ended.');
    expect(refusalText(entry, 'pin_required')).toBe('Couldn\'t save "Take out the trash". The PIN timed out, so hold it again.');
    expect(refusalText(entry, 'not_open')).toBe('Couldn\'t save "Take out the trash". Try again.');
  });
});
```

`custom_components/planavista/frontend/test/calendar-ties.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { clockTime, eventsOn, nextForHousehold, nextOnCalendar } from '../src/modules/chores/calendar-ties';
import type { PlanaVistaData } from '../src/types';
import { MEMBERS, NOW } from './chores-fixtures';

function data(): PlanaVistaData {
  const cal = (entity: string, member: string | null, name: string) => ({
    entity_id: entity, display_name: name, color: '#000000', color_light: '#FFFFFF', icon: '', person_entity: '',
    member_id: member, visible: true,
  });
  const ev = (calendar: string, summary: string, start: string, end: string) => ({
    summary, start, end, calendar_entity_id: calendar, calendar_name: calendar, calendar_color: '', calendar_color_light: '',
  });
  return {
    calendars: [cal('calendar.alex', 'alex', 'Alex'), cal('calendar.casey', 'casey', 'Casey'), cal('calendar.family', null, 'Family')],
    events: [
      ev('calendar.casey', 'Soccer practice', '2026-10-13T17:30:00-05:00', '2026-10-13T19:00:00-05:00'),
      ev('calendar.alex', 'Dentist', '2026-10-13T16:45:00-05:00', '2026-10-13T17:30:00-05:00'),
      ev('calendar.casey', 'School', '2026-10-13T08:00:00-05:00', '2026-10-13T14:45:00-05:00'),
      ev('calendar.family', 'Pizza night', '2026-10-13T18:00:00-05:00', '2026-10-13T19:00:00-05:00'),
      ev('calendar.alex', 'Holiday', '2026-10-13', '2026-10-14'),
      ev('calendar.alex', 'Tomorrow', '2026-10-14T09:00:00-05:00', '2026-10-14T10:00:00-05:00'),
    ],
    display: { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'planavista' },
  };
}

const dayStart = new Date('2026-10-13T03:00:00-05:00');
const dayEnd = new Date('2026-10-14T03:00:00-05:00');

describe('eventsOn', () => {
  it('lists the chore day\'s timed events, soonest first, with whose calendar each is', () => {
    const events = eventsOn(data(), dayStart, dayEnd);
    expect(events.map(e => [e.title, e.member])).toEqual([
      ['School', 'casey'], ['Dentist', 'alex'], ['Soccer practice', 'casey'], ['Pizza night', null],
    ]);
  });
});

describe('nextOnCalendar (spec 13.1)', () => {
  const events = eventsOn(data(), dayStart, dayEnd);

  it('finds someone\'s next event and whether they are free until then', () => {
    expect(nextOnCalendar(events, 'casey', NOW)).toMatchObject({ event: { title: 'Soccer practice' }, freeUntil: true });
    expect(nextOnCalendar(events, 'alex', NOW)).toMatchObject({ event: { title: 'Dentist' }, freeUntil: false });
  });

  it('is busy, not free, during an event', () => {
    expect(nextOnCalendar(events, 'casey', new Date('2026-10-13T12:00:00-05:00'))?.freeUntil).toBe(false);
  });

  it('has nothing for someone with no more events today', () => {
    expect(nextOnCalendar(events, 'dana', NOW)).toBeNull();
    expect(nextOnCalendar(events, 'alex', new Date('2026-10-13T18:00:00-05:00'))).toBeNull();
  });
});

describe('nextForHousehold', () => {
  it('names whose event is next, or the calendar when it belongs to no one', () => {
    const events = eventsOn(data(), dayStart, dayEnd);
    const name = (id: string) => data().calendars.find(c => c.entity_id === id)?.display_name ?? null;
    expect(nextForHousehold(events, MEMBERS, NOW, '12h', name)).toEqual({ title: 'Dentist', time: '4:45', who: 'Alex' });
    expect(nextForHousehold(events, MEMBERS, new Date('2026-10-13T17:45:00-05:00'), '24h', name))
      .toEqual({ title: 'Pizza night', time: '18:00', who: 'Family' });
  });
});

describe('clockTime', () => {
  it('writes the time the household reads', () => {
    const t = new Date(2026, 9, 13, 17, 5);
    expect(clockTime(t)).toBe('5:05');
    expect(clockTime(t, '12h', true)).toBe('5:05 PM');
    expect(clockTime(t, '24h')).toBe('17:05');
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/checkoff-queue.test.ts test/chores-overlay.test.ts test/live-subscription.test.ts test/chores-glance.test.ts test/calendar-ties.test.ts` Expected: FAIL: each file can't load the module it imports.

- [ ] **Step 3: Write the live subscription and the shared command base, and move the household client onto them.**

`custom_components/planavista/frontend/src/core/live-subscription.ts` (new):

```ts
import { Unsubscribe, retryDelayMs, safeUnsubscribe } from '../utils/subscriptions';

/** The part of hass.connection a live subscription uses. */
export interface LiveConnection<T> {
  subscribeMessage(
    callback: (event: T) => void,
    message: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ): Promise<Unsubscribe>;
  addEventListener(event: 'ready' | 'disconnected', listener: () => void): void;
  removeEventListener(event: 'ready' | 'disconnected', listener: () => void): void;
}

/** idle (no connection), connecting (asked, no answer yet), live, or offline (dropped or refused; trying again). */
export type LiveStatus = 'idle' | 'connecting' | 'live' | 'offline';

/**
 * Follows one PlanaVista subscription with at most one live subscription.
 * A subscribe that resolves after stop() is dropped at once. When the
 * backend refuses before anything arrived, the event handler hears null.
 *
 * After Home Assistant restarts, the socket comes back before PlanaVista's
 * commands do, and the socket library drops a resubscribe that fails. So
 * this subscribes itself after every reconnect and keeps trying (keeping the
 * last event meanwhile), or a kiosk would keep a frozen screen until it
 * reloads.
 */
export class LiveSubscription<T> {
  status: LiveStatus = 'idle';
  private _connection: LiveConnection<T> | undefined;
  private _unsub: Unsubscribe | null = null;
  private _generation = 0;
  private _retry: ReturnType<typeof setTimeout> | undefined;
  private _attempt = 0;
  private _hadEvent = false;

  constructor(
    private readonly _message: Record<string, unknown>,
    private readonly _onEvent: (event: T | null) => void,
    private readonly _onStatus?: (status: LiveStatus) => void,
  ) {}

  update(connection: LiveConnection<T> | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    if (!connection) return;
    connection.addEventListener('ready', this._onReady);
    connection.addEventListener('disconnected', this._onDisconnected);
    this._subscribe();
  }

  stop(): void {
    this._generation++;
    this._cancelRetry();
    this._connection?.removeEventListener('ready', this._onReady);
    this._connection?.removeEventListener('disconnected', this._onDisconnected);
    this._connection = undefined;
    this._hadEvent = false;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
    this._setStatus('idle');
  }

  /** Try again now (a Try again button), instead of waiting for the next retry. */
  retry(): void {
    if (!this._connection || this.status === 'live' || this.status === 'connecting') return;
    this._generation++;
    this._cancelRetry();
    this._subscribe();
  }

  /** The socket was made again: the backend forgot the subscription with the old one. */
  private _onReady = (): void => {
    if (!this._connection) return;
    this._generation++;
    // Not unsubscribed: command ids start again after a reconnect, so the
    // old id may belong to a new command now.
    this._unsub = null;
    this._cancelRetry();
    this._subscribe();
  };

  private _onDisconnected = (): void => {
    if (this._connection) this._setStatus('offline');
  };

  private _subscribe(): void {
    const connection = this._connection;
    if (!connection) return;
    const generation = this._generation;
    if (this.status !== 'offline') this._setStatus('connecting');
    connection
      .subscribeMessage(
        event => {
          if (generation !== this._generation) return;
          this._hadEvent = true;
          this._onEvent(event);
        },
        this._message,
        { resubscribe: false },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub);
          return;
        }
        this._unsub = unsub;
        this._attempt = 0;
        this._setStatus('live');
      })
      .catch(() => {
        if (generation !== this._generation) return;
        if (!this._hadEvent) this._onEvent(null);
        this._setStatus('offline');
        this._retry = setTimeout(() => {
          this._retry = undefined;
          if (generation === this._generation) this._subscribe();
        }, retryDelayMs(this._attempt++));
      });
  }

  private _setStatus(status: LiveStatus): void {
    if (status === this.status) return;
    this.status = status;
    this._onStatus?.(status);
  }

  private _cancelRetry(): void {
    if (this._retry !== undefined) clearTimeout(this._retry);
    this._retry = undefined;
    this._attempt = 0;
  }
}
```

`custom_components/planavista/frontend/src/core/ws-api.ts` (new):

```ts
/** The part of hass the commands use. */
export interface WsCaller {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

/** The code of a failed command (Home Assistant rejects with {code, message}). */
export function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && typeof (err as { code?: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return 'unknown';
}

/** What a failed command said, for a toast (Home Assistant rejects with {code, message}). */
export function errorMessage(err: unknown): string | null {
  if (err && typeof err === 'object' && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return null;
}

/** Codes that mean the backend no longer knows the session a command carried. */
const SESSION_GONE = new Set(['parent_mode_required', 'pin_required']);

/**
 * PlanaVista commands with this card's PIN session token added when it has
 * one. A command refused for want of a PIN although it carried a session
 * means the backend already ended that session (after a reconnect or a
 * restart); `onSessionEnded` hears about it.
 */
export class WsApi {
  constructor(
    private readonly _ws: WsCaller,
    private readonly _session: () => string | null,
    private readonly _onSessionEnded?: (token: string) => void,
  ) {}

  protected call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
    const message: Record<string, unknown> = { type, ...fields };
    const token = withSession ? this._session() : null;
    if (!token) return this._ws.callWS<T>(message);
    message.session = token;
    return this._ws.callWS<T>(message).catch((err: unknown) => {
      if (SESSION_GONE.has(errorCode(err))) this._onSessionEnded?.(token);
      throw err;
    });
  }
}
```

`custom_components/planavista/frontend/src/core/household-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household-client.ts b/custom_components/planavista/frontend/src/core/household-client.ts
index cc374d7..b8876ff 100644
--- a/custom_components/planavista/frontend/src/core/household-client.ts
+++ b/custom_components/planavista/frontend/src/core/household-client.ts
@@ -1,117 +1,25 @@
 import { HouseholdView, Member, MemberChanges } from './household';
-import { Unsubscribe, retryDelayMs, safeUnsubscribe } from '../utils/subscriptions';
-
-export { retryDelayMs };
-
-/** The part of hass.connection the subscription uses. */
-export interface HouseholdConnection {
-  subscribeMessage(
-    callback: (view: HouseholdView) => void,
-    message: Record<string, unknown>,
-    options?: { resubscribe?: boolean },
-  ): Promise<Unsubscribe>;
-  addEventListener(event: 'ready', listener: () => void): void;
-  removeEventListener(event: 'ready', listener: () => void): void;
-}
+import { LiveConnection, LiveSubscription } from './live-subscription';
+import { WsApi, WsCaller, errorCode } from './ws-api';
+import { retryDelayMs } from '../utils/subscriptions';
 
-/**
- * Follows planavista/household/subscribe with at most one live subscription.
- * A subscribe that resolves after stop() is dropped at once. When the backend
- * has no household (an older PlanaVista, or not set up yet), the view is null.
- *
- * After Home Assistant restarts, the socket comes back before PlanaVista's
- * commands do, and the socket library drops a resubscribe that fails. So
- * this subscribes itself after every reconnect and keeps trying (keeping the
- * last view meanwhile), or a kiosk would keep a frozen household until it
- * reloads.
- */
-export class HouseholdSubscription {
-  private _connection: HouseholdConnection | undefined;
-  private _unsub: Unsubscribe | null = null;
-  private _generation = 0;
-  private _retry: ReturnType<typeof setTimeout> | undefined;
-  private _attempt = 0;
-  private _hadView = false;
-
-  constructor(private readonly _onView: (view: HouseholdView | null) => void) {}
-
-  update(connection: HouseholdConnection | undefined): void {
-    if (connection === this._connection) return;
-    this.stop();
-    this._connection = connection;
-    if (!connection) return;
-    connection.addEventListener('ready', this._onReady);
-    this._subscribe();
-  }
+export { errorCode, retryDelayMs };
+export type { WsCaller };
 
-  stop(): void {
-    this._generation++;
-    this._cancelRetry();
-    this._connection?.removeEventListener('ready', this._onReady);
-    this._connection = undefined;
-    this._hadView = false;
-    if (this._unsub) {
-      const unsub = this._unsub;
-      this._unsub = null;
-      safeUnsubscribe(unsub);
-    }
-  }
+/** The part of hass.connection the household subscription uses. */
+export type HouseholdConnection = LiveConnection<HouseholdView>;
 
-  /** The socket was made again: the backend forgot the subscription with the old one. */
-  private _onReady = (): void => {
-    if (!this._connection) return;
-    this._generation++;
-    // Not unsubscribed: command ids start again after a reconnect, so the
-    // old id may belong to a new command now.
-    this._unsub = null;
-    this._cancelRetry();
-    this._subscribe();
-  };
-
-  private _subscribe(): void {
-    const connection = this._connection;
-    if (!connection) return;
-    const generation = this._generation;
-    connection
-      .subscribeMessage(
-        view => {
-          if (generation !== this._generation) return;
-          this._hadView = true;
-          this._onView(view);
-        },
-        { type: 'planavista/household/subscribe' },
-        { resubscribe: false },
-      )
-      .then(unsub => {
-        if (generation !== this._generation) {
-          safeUnsubscribe(unsub);
-          return;
-        }
-        this._unsub = unsub;
-        this._attempt = 0;
-      })
-      .catch(() => {
-        if (generation !== this._generation) return;
-        if (!this._hadView) this._onView(null);
-        this._retry = setTimeout(() => {
-          this._retry = undefined;
-          if (generation === this._generation) this._subscribe();
-        }, retryDelayMs(this._attempt++));
-      });
-  }
-
-  private _cancelRetry(): void {
-    if (this._retry !== undefined) clearTimeout(this._retry);
-    this._retry = undefined;
-    this._attempt = 0;
+/**
+ * Follows planavista/household/subscribe (see LiveSubscription). When the
+ * backend has no household (an older PlanaVista, or not set up yet), the
+ * view is null.
+ */
+export class HouseholdSubscription extends LiveSubscription<HouseholdView> {
+  constructor(onView: (view: HouseholdView | null) => void) {
+    super({ type: 'planavista/household/subscribe' }, onView);
   }
 }
 
-/** The part of hass the commands use. */
-export interface WsCaller {
-  callWS<T>(message: Record<string, unknown>): Promise<T>;
-}
-
 export interface UnlockResult {
   ok: boolean;
   session?: string;
@@ -123,89 +31,60 @@ export interface UnlockResult {
   retry_after?: number | null;
 }
 
-/**
- * The household and PIN commands, with this card's session token added when
- * it has one. A command refused with parent_mode_required although it
- * carried a session means the backend already ended that session (after a
- * reconnect or a restart); `onSessionEnded` hears about it.
- */
-export class HouseholdApi {
-  constructor(
-    private readonly _ws: WsCaller,
-    private readonly _session: () => string | null,
-    private readonly _onSessionEnded?: (token: string) => void,
-  ) {}
-
-  private _call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
-    const message: Record<string, unknown> = { type, ...fields };
-    const token = withSession ? this._session() : null;
-    if (!token) return this._ws.callWS<T>(message);
-    message.session = token;
-    return this._ws.callWS<T>(message).catch((err: unknown) => {
-      if (errorCode(err) === 'parent_mode_required') this._onSessionEnded?.(token);
-      throw err;
-    });
-  }
+/** The household and PIN commands, with this card's session token added when it has one (see WsApi). */
+export class HouseholdApi extends WsApi {
 
   saveMember(changes: MemberChanges, existing?: { id: string; rev: number }): Promise<{ member: Member }> {
     const fields: Record<string, unknown> = { member: changes };
     if (existing) Object.assign(fields, { member_id: existing.id, rev: existing.rev });
-    return this._call('planavista/household/member/save', fields);
+    return this.call('planavista/household/member/save', fields);
   }
 
   deleteMember(memberId: string): Promise<void> {
-    return this._call('planavista/household/member/delete', { member_id: memberId });
+    return this.call('planavista/household/member/delete', { member_id: memberId });
   }
 
   reorder(order: string[]): Promise<void> {
-    return this._call('planavista/household/member/reorder', { order });
+    return this.call('planavista/household/member/reorder', { order });
   }
 
   setSharedScreen(shared: boolean): Promise<void> {
-    return this._call('planavista/household/shared_screen', { shared });
+    return this.call('planavista/household/shared_screen', { shared });
   }
 
   saveSecurity(settings: { shuffle_keypad: boolean }): Promise<void> {
-    return this._call('planavista/household/settings/save', settings);
+    return this.call('planavista/household/settings/save', settings);
   }
 
   saveSetup(progress: { step?: string | null; completed?: boolean }): Promise<void> {
-    return this._call('planavista/household/setup/save', progress);
+    return this.call('planavista/household/setup/save', progress);
   }
 
   saveConfig(changes: Record<string, unknown>): Promise<void> {
-    return this._call('planavista/config/save', changes);
+    return this.call('planavista/config/save', changes);
   }
 
   unlock(memberId: string, pin: string): Promise<UnlockResult> {
-    return this._call('planavista/pin/unlock', { member_id: memberId, pin }, false);
+    return this.call('planavista/pin/unlock', { member_id: memberId, pin }, false);
   }
 
   setPin(memberId: string, pin: string): Promise<void> {
-    return this._call('planavista/pin/set', { member_id: memberId, pin });
+    return this.call('planavista/pin/set', { member_id: memberId, pin });
   }
 
   clearPin(memberId: string): Promise<void> {
-    return this._call('planavista/pin/clear', { member_id: memberId });
+    return this.call('planavista/pin/clear', { member_id: memberId });
   }
 
   clearPause(memberId: string): Promise<void> {
-    return this._call('planavista/pin/clear_lockout', { member_id: memberId });
+    return this.call('planavista/pin/clear_lockout', { member_id: memberId });
   }
 
   lock(token: string): Promise<void> {
-    return this._call('planavista/pin/lock', { session: token }, false);
+    return this.call('planavista/pin/lock', { session: token }, false);
   }
 
   touch(token: string): Promise<{ expires_in: number }> {
-    return this._call('planavista/pin/touch', { session: token }, false);
-  }
-}
-
-/** The code of a failed command (Home Assistant rejects with {code, message}). */
-export function errorCode(err: unknown): string {
-  if (err && typeof err === 'object' && typeof (err as { code?: unknown }).code === 'string') {
-    return (err as { code: string }).code;
+    return this.call('planavista/pin/touch', { session: token }, false);
   }
-  return 'unknown';
 }
```

`custom_components/planavista/frontend/src/core/module-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/module-registry.ts b/custom_components/planavista/frontend/src/core/module-registry.ts
index 8136160..917282c 100644
--- a/custom_components/planavista/frontend/src/core/module-registry.ts
+++ b/custom_components/planavista/frontend/src/core/module-registry.ts
@@ -61,6 +61,10 @@ export interface ServiceHost extends ReactiveControllerHost, HTMLElement {
   readonly householdView: HouseholdView | null;
   /** The PIN session on this screen. */
   readonly pinSession: Session | null;
+  /** The config sensor's data (calendars and their events). */
+  readonly planavistaData: PlanaVistaData | null;
+  /** A command was refused although it carried this session: the backend already ended it. */
+  sessionEnded(token: string): void;
 }
 
 /**
```

- [ ] **Step 4: Write the chores client, the queue, and the service.**

`custom_components/planavista/frontend/src/modules/chores/chores-types.ts` (new):

```ts
/** The chores feed and views as the card receives them (spec 10.7). */

export type ItemStatus = 'open' | 'sent_back' | 'done' | 'pending' | 'excused' | 'away';
export type Section = 'overdue' | 'today' | 'week';
export type Band = 'morning' | 'afternoon' | 'evening';
export type Window = 'day' | 'week' | 'month' | 'once';

export interface Review {
  by: string;
  at: string;
  note: string | null;
}

export interface CompletionView {
  id: string;
  done_by: string;
  by: string;
  at: string;
  source: string;
  state: string;
  review: Review | null;
  stars: number;
}

/** One occurrence on a chore day (ChoresEngine.item_view). */
export interface ItemView {
  key: string;
  chore: string;
  name: string;
  icon: string | null;
  member: string;
  owner: string;
  period: string;
  n: number;
  section: Section;
  band: Band | null;
  planned: string | null;
  due: string | null;
  due_day: string | null;
  window: Window;
  dated: boolean;
  status: ItemStatus;
  counted: boolean;
  credit_minutes: number;
  stars: number;
  from: string | null;
  overdue_since: string | null;
  needs_ok: boolean;
  completion: CompletionView | null;
  note: string | null;
  request: { id: string; kind: string; until: string | null } | null;
}

export interface Stats {
  due: number;
  done: number;
  pending: number;
  minutes_due: number;
  minutes_done: number;
  minutes_pending: number;
}

export interface AwaySpan {
  from: string;
  to: string;
  note?: string | null;
}

export interface BoardMember {
  items: ItemView[];
  today: Stats;
  week: Stats & { percent: number | null };
  contribution: { minutes: number; shared_minutes: number };
  streak: number;
  week_streak: number;
  stars: number;
  week_stars: number;
  chore_minutes: number;
  away: AwaySpan | null;
}

export type RequestKind = 'completion' | 'more_time' | 'skip' | 'redemption';

/** Anything a parent reviews (spec 8.7). */
export interface ChoreRequest {
  id: string;
  kind: RequestKind;
  member: string;
  name: string;
  at: string;
  done_by?: string;
  chore?: string;
  occurrence?: string;
  stars?: number;
  until?: string | null;
  reward?: string;
  cost?: number;
  balance?: number;
}

export interface Activity {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  schedule: 'plan' | 'once' | 'repeats';
  assignees: string[];
  on_board: boolean;
  needs_ok: boolean;
  needs_ok_always?: boolean;
  stars: number | null;
  label?: string | null;
  minimum?: { hours: number; per: 'day' | 'week' };
  split?: 'shared' | 'each';
  shares?: Record<string, number> | null;
  days?: string[];
  time_of_day?: Band[];
  times?: number;
  set_time?: string | null;
  once?: { on: string | null; by: string | null; by_time: string | null; sessions: number; estimate_minutes: number };
  repeats?: { rrule: string; start: string; window: 'day' | 'period'; estimate_minutes: number };
  finished_at?: string | null;
  created?: { by: string; source: string; at: string };
  rev?: number;
  [key: string]: unknown;
}

export interface Reward {
  id: string;
  name: string;
  icon: string | null;
  cost: number;
  needs_ok: boolean;
  who: string[];
}

export interface ChoresSettings {
  missed: 'make_up' | 'strict' | 'carry_over';
  day_starts: string;
  auto_approve: 'day_end' | 'never';
  minutes_per_star: number;
  evening_check: string | null;
  sound: boolean;
}

export interface GivenReward {
  id: string;
  member: string;
  reward: string;
  name: string;
  cost: number;
  at: string;
  by: string | null;
}

export interface Board {
  date: string;
  today: string;
  now: string;
  band: Band;
  day: { start: string; end: string };
  week: { start: string; end: string; days_left: number };
  members: Record<string, BoardMember>;
  household: { due: number; done: number; pending: number };
  requests: ChoreRequest[];
  settings: ChoresSettings;
  chores: Activity[];
  rewards: Reward[];
  recent_redemptions: GivenReward[];
  needs_a_look: Array<{ kind: string; chore: string; name: string }>;
}

export type ChoresState = 'ok' | 'off' | 'needs_a_look' | 'newer';

export interface ChoresFeed {
  state: ChoresState;
  save_failed: boolean;
  board: Board | null;
}

export interface WeekDay {
  date: string;
  kind: 'past' | 'today' | 'future';
  away: boolean;
  due: number | null;
  done: number | null;
  pending: number | null;
  closed: boolean | null;
  missed: number;
}

export interface WeeklyEntry {
  chore: string;
  name: string;
  total: number;
  done: number;
  pending: number;
  from: string | null;
}

export interface WeekView {
  week: { start: string; end: string };
  today: string;
  members: Record<string, {
    days: WeekDay[];
    weekly: WeeklyEntry[];
    contribution: { minutes: number; shared_minutes: number };
    away: AwaySpan[];
  }>;
}

/** A past day's item in the day sheet. */
export interface PastItem {
  key: string;
  chore: string;
  name: string;
  icon: string | null;
  status: 'done' | 'pending' | 'missed' | 'carried' | 'excused';
  done_by?: string;
  at?: string;
}

export interface DayView {
  date: string;
  kind: 'past' | 'today' | 'future';
  members: Record<string, {
    items: Array<ItemView | PastItem>;
    summary: { due: number; done: number; pending: number; closed: boolean } | null;
    away: boolean;
  }>;
}

export interface ChoreHistory {
  chore: string;
  member: string;
  streak: { days?: number; weeks?: number };
  recent: Array<{ at: string; done_by: string; state: string; occurrence: string }>;
  weeks: { done: number; of: number };
  usual: { band: Band | null; day: string | null };
}

export interface CompleteResult {
  result: 'done' | 'pending' | 'already_done' | 'nothing_open';
  occurrence?: string;
  stars?: number;
}
```

`custom_components/planavista/frontend/src/modules/chores/chores-client.ts` (new):

```ts
import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
import { WsApi } from '../../core/ws-api';
import type { Member } from '../../core/household';
import type { Activity, ChoreHistory, ChoresFeed, CompleteResult, DayView, Reward, WeekView } from './chores-types';

/** Follows planavista/chores/subscribe: the board for today, sent again after every change. */
export class ChoresSubscription extends LiveSubscription<ChoresFeed> {
  constructor(onFeed: (feed: ChoresFeed | null) => void, onStatus?: (status: LiveStatus) => void) {
    super({ type: 'planavista/chores/subscribe' }, onFeed, onStatus);
  }
}

/** Per-occurrence changes (planavista/chores/override). */
export interface OverrideChanges {
  planned_day?: string | null;
  due?: string | null;
  assignee?: string | null;
  excused?: boolean;
  note?: string | null;
}

/** The chores commands (spec 10.7), with this card's PIN session added when it has one. */
export class ChoresApi extends WsApi {
  complete(occurrence: string, doneBy?: string): Promise<CompleteResult> {
    return this.call('planavista/chores/complete', doneBy ? { occurrence, done_by: doneBy } : { occurrence });
  }

  undo(occurrence: string): Promise<{ result: string }> {
    return this.call('planavista/chores/undo', { occurrence });
  }

  request(kind: 'more_time' | 'skip', occurrence: string, until?: string): Promise<{ request: string }> {
    return this.call('planavista/chores/request', until ? { kind, occurrence, until } : { kind, occurrence });
  }

  review(request: string, decision: 'allow' | 'decline', note?: string | null): Promise<{ result: string }> {
    return this.call('planavista/chores/review', note ? { request, decision, note } : { request, decision });
  }

  override(occurrence: string, changes: OverrideChanges): Promise<{ occurrence: string }> {
    return this.call('planavista/chores/override', { occurrence, ...changes });
  }

  excuseMissed(occurrence: string, note?: string | null): Promise<{ result: string }> {
    return this.call('planavista/chores/excuse_missed', note ? { occurrence, note } : { occurrence });
  }

  saveActivity(activity: Partial<Activity>, existing?: { id: string; rev?: number }): Promise<{ activity: Activity }> {
    const fields: Record<string, unknown> = { activity };
    if (existing) {
      fields.activity_id = existing.id;
      if (existing.rev !== undefined) fields.rev = existing.rev;
    }
    return this.call('planavista/chores/activity/save', fields);
  }

  deleteActivity(activityId: string): Promise<void> {
    return this.call('planavista/chores/activity/delete', { activity_id: activityId });
  }

  saveReward(reward: Partial<Reward>, rewardId?: string): Promise<{ reward: Reward }> {
    return this.call('planavista/rewards/save', rewardId ? { reward, reward_id: rewardId } : { reward });
  }

  deleteReward(rewardId: string): Promise<void> {
    return this.call('planavista/rewards/delete', { reward_id: rewardId });
  }

  redeem(member: string, reward: string): Promise<{ result: string; request: string }> {
    return this.call('planavista/rewards/redeem', { member, reward });
  }

  awardStars(member: string, stars: number, reason: string): Promise<{ balance: number }> {
    return this.call('planavista/stars/award', { member, stars, reason });
  }

  week(date?: string): Promise<WeekView> {
    return this.call('planavista/chores/week', date ? { date } : {}, false);
  }

  day(date: string): Promise<DayView> {
    return this.call('planavista/chores/day', { date }, false);
  }

  history(chore: string, member: string): Promise<ChoreHistory> {
    return this.call('planavista/chores/history', { chore, member }, false);
  }

  /** A person's own choices: their My day style and the reward they're saving up for. */
  savePrefs(memberId: string, prefs: { my_day?: string; goal?: string | null }): Promise<{ member: Member }> {
    return this.call('planavista/household/member/prefs', { member_id: memberId, ...prefs });
  }

  startOver(): Promise<{ state: string }> {
    return this.call('planavista/chores/start_over', {});
  }
}
```

`custom_components/planavista/frontend/src/modules/chores/checkoff-queue.ts` (new):

```ts
import { errorCode } from '../../core/ws-api';

/**
 * Check-offs waiting to reach Home Assistant (spec 15.1). A check-off shows
 * at once and is sent when the connection allows; while Home Assistant
 * restarts or the Wi-Fi drops it waits in the browser's storage, so it
 * survives a reload, and goes through when the connection returns. Resending
 * is safe because each one names its occurrence. The server's clock decides:
 * one that can no longer count (its day ended) is dropped with a message,
 * and so is one refused for any other reason, so the item reverts.
 */

export type CheckoffOp = 'complete' | 'undo';

export interface QueuedCheckoff {
  /** This card's id for the entry. */
  id: string;
  op: CheckoffOp;
  occurrence: string;
  /** Whose item it is. */
  member: string;
  /** The chore's name, for messages. */
  name: string;
  /** Who did it, when someone else did. */
  doneBy?: string;
  /** What the item shows until the answer comes: done, or waiting for OK. */
  shows?: 'done' | 'pending';
  /** When it was queued (ms since the epoch). */
  at: number;
  /** The card that queued it (its PIN session sends it); any card sends it once that one is gone. */
  card?: string;
}

export interface QueueStorage {
  load(): QueuedCheckoff[];
  save(entries: QueuedCheckoff[]): void;
}

/** What sending an entry came to: it went through, it must wait (no connection), or it was refused. */
export type SendOutcome = { kind: 'sent' } | { kind: 'wait' } | { kind: 'refused'; code: string; message: string | null };

export interface QueueListener {
  /** The entries changed (an entry was added, went through, or was dropped). */
  changed(): void;
  /** An entry was refused and dropped; its item reverts. */
  refused(entry: QueuedCheckoff, code: string, message: string | null): void;
}

/** How a send that threw counts: a code Home Assistant chose is a refusal; anything else means wait. */
export function outcomeOf(err: unknown, message: string | null = null): SendOutcome {
  const code = errorCode(err);
  return code === 'unknown' ? { kind: 'wait' } : { kind: 'refused', code, message };
}

let counter = 0;

/** A unique id for an entry. */
export function entryId(now = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${now.toString(36)}-${counter.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export class CheckoffQueue {
  private _entries: QueuedCheckoff[];
  private _flushing = false;
  private _again = false;

  constructor(
    private readonly _storage: QueueStorage,
    private readonly _send: (entry: QueuedCheckoff) => Promise<SendOutcome>,
    private readonly _listener: QueueListener,
  ) {
    this._entries = _storage.load();
  }

  get entries(): readonly QueuedCheckoff[] {
    return this._entries;
  }

  get waiting(): boolean {
    return this._entries.length > 0;
  }

  /** The newest entry waiting for an occurrence, if any. */
  latestFor(occurrence: string): QueuedCheckoff | undefined {
    for (let i = this._entries.length - 1; i >= 0; i--) {
      if (this._entries[i].occurrence === occurrence) return this._entries[i];
    }
    return undefined;
  }

  /**
   * Queue a check-off or an uncheck. An uncheck of a check-off still waiting
   * cancels it instead, so nothing is sent for a check-off taken back before
   * it left. (A check-off after a waiting uncheck is sent after it: it may
   * name someone else as the doer.)
   */
  add(entry: Omit<QueuedCheckoff, 'id' | 'at'> & { id?: string; at?: number }): QueuedCheckoff | null {
    const last = this.latestFor(entry.occurrence);
    if (entry.op === 'undo' && last?.op === 'complete' && !this._isSending(last)) {
      this._entries = this._entries.filter(e => e !== last);
      this._persist();
      return null;
    }
    const full: QueuedCheckoff = { ...entry, id: entry.id ?? entryId(), at: entry.at ?? Date.now() };
    this._entries = [...this._entries, full];
    this._persist();
    return full;
  }

  /** Send what's waiting, oldest first, one at a time; stop at the first that has to wait. */
  async flush(): Promise<void> {
    if (this._flushing) {
      this._again = true;
      return;
    }
    this._flushing = true;
    try {
      do {
        this._again = false;
        while (this._entries.length > 0) {
          const entry = this._entries[0];
          this._sending = entry;
          let outcome: SendOutcome;
          try {
            outcome = await this._send(entry);
          } catch (err) {
            outcome = outcomeOf(err);
          }
          this._sending = null;
          if (outcome.kind === 'wait') return;
          this._entries = this._entries.filter(e => e !== entry);
          this._persist();
          if (outcome.kind === 'refused') this._listener.refused(entry, outcome.code, outcome.message);
        }
      } while (this._again);
    } finally {
      this._sending = null;
      this._flushing = false;
    }
  }

  private _sending: QueuedCheckoff | null = null;

  private _isSending(entry: QueuedCheckoff): boolean {
    return this._sending === entry;
  }

  private _persist(): void {
    this._storage.save(this._entries);
    this._listener.changed();
  }
}

const STORAGE_KEY = 'planavista.checkoffs';
/** Entries older than this are dropped on load: the day they belonged to is long over. */
const STALE_MS = 2 * 24 * 60 * 60 * 1000;

/** The queue's home in the browser: localStorage, shared by every card on the page. */
export function browserStorage(now: () => number = Date.now): QueueStorage {
  return {
    load() {
      try {
        const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
          (e): e is QueuedCheckoff =>
            !!e && typeof e === 'object' && typeof (e as QueuedCheckoff).occurrence === 'string' &&
            ((e as QueuedCheckoff).op === 'complete' || (e as QueuedCheckoff).op === 'undo') &&
            typeof (e as QueuedCheckoff).at === 'number' && now() - (e as QueuedCheckoff).at < STALE_MS,
        );
      } catch {
        return [];
      }
    },
    save(entries) {
      try {
        if (entries.length === 0) globalThis.localStorage?.removeItem(STORAGE_KEY);
        else globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch {
        // Storage can be full or blocked; the queue still works until the page reloads.
      }
    },
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/overlay.ts` (new):

```ts
import type { Member } from '../../core/household';
import type { Activity, Board, BoardMember, ItemView, Stats } from './chores-types';
import type { QueuedCheckoff } from './checkoff-queue';

const OPEN = new Set(['open', 'sent_back']);
const CREDITED = new Set(['done', 'pending']);

/** Due and done counts and minutes over the items that count today, as the engine adds them (spec 8.14). */
export function statsOf(items: ItemView[]): Stats {
  const stats: Stats = { due: 0, done: 0, pending: 0, minutes_due: 0, minutes_done: 0, minutes_pending: 0 };
  for (const item of items) {
    if (!item.counted || item.status === 'away' || item.status === 'excused') continue;
    stats.due += 1;
    stats.minutes_due += item.credit_minutes;
    if (item.status === 'done') {
      stats.done += 1;
      stats.minutes_done += item.credit_minutes;
    } else if (item.status === 'pending') {
      stats.pending += 1;
      stats.minutes_pending += item.credit_minutes;
    }
  }
  return stats;
}

/**
 * Whether a check-off by `doer` waits for a parent's OK (spec 8.5 step 3):
 * never for a parent; always for a chore a child added from a to-do list;
 * otherwise by their "Needs an OK for" setting and the chore's mark.
 */
export function needsOk(doer: Pick<Member, 'parent' | 'needs_ok_for'> | undefined, activity: Activity | undefined): boolean {
  if (!doer || doer.parent) return false;
  if (activity?.needs_ok_always) return true;
  const setting = doer.needs_ok_for ?? 'none';
  return setting === 'all' || (setting === 'marked' && !!activity?.needs_ok);
}

/** A local time with its offset, like the engine's stamps ("2026-10-13T16:10:00-05:00"). */
export function localStamp(ms: number): string {
  const date = new Date(ms);
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
  );
}

function applied(item: ItemView, entry: QueuedCheckoff): ItemView {
  if (entry.op === 'complete' && OPEN.has(item.status)) {
    const state = entry.shows ?? 'done';
    return {
      ...item,
      status: state,
      note: null,
      completion: {
        id: `queued:${entry.id}`, done_by: entry.doneBy ?? item.member, by: '', at: localStamp(entry.at),
        source: 'tablet', state, review: null, stars: item.stars,
      },
    };
  }
  if (entry.op === 'undo' && CREDITED.has(item.status)) {
    return { ...item, status: 'open', completion: null };
  }
  return item;
}

/**
 * The board with check-offs that haven't reached Home Assistant yet shown as
 * if they had (spec 11.6: optimistic check-offs). The feed wins as soon as an
 * entry goes through; with nothing waiting, the board comes back unchanged.
 */
export function withQueued(board: Board, entries: readonly QueuedCheckoff[]): Board {
  if (entries.length === 0) return board;
  const members: Record<string, BoardMember> = { ...board.members };
  const touched = new Set<string>();
  for (const entry of entries) {
    const member = members[entry.member];
    if (!member) continue;
    const index = member.items.findIndex(item => item.key === entry.occurrence);
    if (index < 0) continue;
    const next = applied(member.items[index], entry);
    if (next === member.items[index]) continue;
    const items = [...member.items];
    items[index] = next;
    members[entry.member] = { ...member, items };
    touched.add(entry.member);
  }
  if (touched.size === 0) return board;
  const household = { due: 0, done: 0, pending: 0 };
  for (const [id, member] of Object.entries(members)) {
    const today = touched.has(id) ? statsOf(member.items) : member.today;
    if (touched.has(id)) members[id] = { ...member, today };
    household.due += today.due;
    household.done += today.done;
    household.pending += today.pending;
  }
  return { ...board, members, household };
}
```

`custom_components/planavista/frontend/src/modules/chores/chores-glance.ts` (new):

```ts
import type { GlanceChip, ModuleAction } from '../../core/module-registry';
import type { HouseholdView } from '../../core/household';
import type { Session } from '../../core/session';
import { mayEverReview, parentAccess } from '../../core/access';
import type { Board } from './chores-types';

/** What the header says about chores (spec 12.2): "9 of 17 chores done today", on every module. */
export function choresGlance(board: Board | null): GlanceChip[] {
  if (!board) return [];
  const { due, done, pending } = board.household;
  if (due === 0) return [];
  const finished = Math.min(due, done + pending);
  return [{
    id: 'chores',
    text: finished >= due ? `All ${due} chores done today` : `${finished} of ${due} chores done today`,
    progress: finished / due,
    primary: true,
    open: { module: 'chores', view: 'board' },
  }];
}

/** "Next: Dentist at 4:45 · Alex" from the household's calendars, for the portrait header. */
export function nextEventChip(next: { title: string; time: string; who: string | null } | null): GlanceChip[] {
  if (!next) return [];
  return [{
    id: 'next',
    text: `Next: ${next.title} at ${next.time}${next.who ? ` · ${next.who}` : ''}`,
    open: { module: 'calendar' },
  }];
}

/**
 * The Chores bar's buttons (spec 12.2, 13.7, 13.8): "⏳ n waiting for OK"
 * when something waits and this screen can ever review it, and Add chore for
 * anyone who can become a parent here. In parent mode, Add chore moves to
 * the parent-mode strip.
 */
export function choresBarActions(board: Board | null, view: HouseholdView | null, session: Session | null): ModuleAction[] {
  if (!board) return [];
  const actions: ModuleAction[] = [];
  const waiting = board.requests.length;
  if (waiting > 0 && mayEverReview(view)) {
    actions.push({ id: 'inbox', label: `${waiting} waiting for OK`, glyph: '⏳', tone: 'act' });
  }
  const access = parentAccess(view, session);
  if (access !== 'no' && !session?.parent) actions.push({ id: 'add', label: 'Add chore', glyph: '+' });
  return actions;
}

/** The parent-mode strip's button (spec 9.4). */
export function choresStripActions(board: Board | null): ModuleAction[] {
  return board ? [{ id: 'add', label: 'Add chore', glyph: '+' }] : [];
}
```

`custom_components/planavista/frontend/src/modules/chores/calendar-ties.ts` (new):

```ts
import type { CalendarEvent, PlanaVistaData } from '../../types';
import type { Member } from '../../core/household';
import { isDateOnly, parseEventDate } from '../../utils/date-utils';

/** A timed event of today, as the chores screens use it (spec 13.9). */
export interface DayEvent {
  title: string;
  start: Date;
  end: Date;
  calendar: string;
  /** Whose calendar it is, when it belongs to someone. */
  member: string | null;
}

/** "5:30" (12-hour) or "17:30" (24-hour); "4:45 PM" with `ampm`. */
export function clockTime(date: Date, format: '12h' | '24h' = '12h', ampm = false): string {
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (format === '24h') return `${date.getHours()}:${minutes}`;
  const hour = date.getHours() % 12 || 12;
  return ampm ? `${hour}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}` : `${hour}:${minutes}`;
}

/** Today's timed events (all-day ones are left out), soonest first, with whose calendar each is. */
export function eventsOn(data: PlanaVistaData | null, dayStart: Date, dayEnd: Date): DayEvent[] {
  if (!data) return [];
  const owners = new Map((data.calendars ?? []).map(cal => [cal.entity_id, cal.member_id ?? null]));
  const found: DayEvent[] = [];
  for (const event of data.events ?? []) {
    if (!event.start || isDateOnly(event.start)) continue;
    const start = parseEventDate(event.start);
    const end = event.end ? parseEventDate(event.end) : start;
    if (end <= dayStart || start >= dayEnd) continue;
    found.push({
      title: event.summary || 'Busy',
      start,
      end,
      calendar: event.calendar_entity_id,
      member: owners.get(event.calendar_entity_id) ?? null,
    });
  }
  return found.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** A person's own events of today (from the calendars that belong to them). */
export function eventsOf(events: DayEvent[], memberId: string): DayEvent[] {
  return events.filter(event => event.member === memberId);
}

export interface NextUp {
  event: DayEvent;
  /** Nothing else on their calendar before it, for at least an hour. */
  freeUntil: boolean;
}

/** Someone's next event still to start today, and whether they are free until then (spec 13.1). */
export function nextOnCalendar(events: DayEvent[], memberId: string, now: Date): NextUp | null {
  const mine = eventsOf(events, memberId);
  const next = mine.find(event => event.start > now);
  if (!next) return null;
  const busyNow = mine.some(event => event.start <= now && event.end > now);
  return { event: next, freeUntil: !busyNow && next.start.getTime() - now.getTime() >= 60 * 60 * 1000 };
}

/** The household's next event today ("Next: Dentist at 4:45 · Alex"), for the header. */
export function nextForHousehold(
  events: DayEvent[],
  members: Member[],
  now: Date,
  format: '12h' | '24h',
  calendarName: (entityId: string) => string | null,
): { title: string; time: string; who: string | null } | null {
  const next = events.find(event => event.start > now);
  if (!next) return null;
  const owner = next.member ? members.find(m => m.id === next.member)?.name ?? null : null;
  return { title: next.title, time: clockTime(next.start, format), who: owner ?? calendarName(next.calendar) };
}

/** The display name of a calendar, for an event that belongs to no one. */
export function calendarNameOf(data: PlanaVistaData | null, entityId: string): string | null {
  return data?.calendars?.find(cal => cal.entity_id === entityId)?.display_name ?? null;
}

export type { CalendarEvent };
```

`custom_components/planavista/frontend/src/modules/chores/chores-service.ts` (new):

```ts
import type {
  GlanceChip,
  MemberProgress,
  ModuleAction,
  ModuleContext,
  ModuleService,
  ServiceHost,
} from '../../core/module-registry';
import type { LiveConnection, LiveStatus } from '../../core/live-subscription';
import { errorMessage } from '../../core/ws-api';
import { ChoresApi, ChoresSubscription } from './chores-client';
import type { Board, ChoresFeed } from './chores-types';
import { CheckoffQueue, QueuedCheckoff, SendOutcome, browserStorage, outcomeOf } from './checkoff-queue';
import { withQueued } from './overlay';
import { choresBarActions, choresGlance, choresStripActions, nextEventChip } from './chores-glance';
import { calendarNameOf, eventsOn, nextForHousehold } from './calendar-ties';

/** Something to tell whoever is at the screen: a check-off that couldn't be saved. */
export interface ChoresNotice {
  id: string;
  text: string;
  /** The entry it is about, when it is a check-off. */
  entry?: QueuedCheckoff;
}

/** Whether the household has chores on (spec 6.3: the module only shows then). */
export function choresEnabled(ctx: Pick<ModuleContext, 'household'>): boolean {
  const modules = ctx.household?.modules as { chores?: { enabled?: boolean } } | undefined;
  return !!ctx.household?.available && modules?.chores?.enabled === true;
}

/** What a refused check-off says (spec 15.1). */
export function refusalText(entry: QueuedCheckoff, code: string): string {
  if (code === 'period_closed') return `Couldn't save "${entry.name}": the day had ended.`;
  if (code === 'pin_required' || code === 'parent_mode_required') {
    return `Couldn't save "${entry.name}". The PIN timed out, so hold it again.`;
  }
  return `Couldn't save "${entry.name}". Try again.`;
}

// One queue per page: localStorage is shared by every card on it.
const live = new Set<ChoresService>();
let pageQueue: CheckoffQueue | null = null;
let services = 0;

function sharedQueue(): CheckoffQueue {
  if (!pageQueue) {
    pageQueue = new CheckoffQueue(
      browserStorage(),
      entry => {
        const owner = [...live].find(service => service.id === entry.card) ?? [...live].find(service => service.connected);
        return owner ? owner.send(entry) : Promise.resolve<SendOutcome>({ kind: 'wait' });
      },
      {
        changed: () => live.forEach(service => service.requestUpdate()),
        refused: (entry, code) => {
          const owner = [...live].find(service => service.id === entry.card) ?? [...live][0];
          owner?.notify({ id: entry.id, text: refusalText(entry, code), entry });
        },
      },
    );
  }
  return pageQueue;
}

/** For tests: forget the page's queue. */
export function resetSharedQueue(): void {
  pageQueue = null;
  live.clear();
}

const RESEND_MS = 15_000;

/**
 * The chores module's card-wide state (spec 10.7): the board feed, the
 * check-offs waiting to be sent, and what the header and bar show about
 * chores on every module. One per card; it subscribes only while the
 * household has chores on.
 */
export class ChoresService implements ModuleService {
  readonly id = `card${++services}`;
  feed: ChoresFeed | null = null;
  status: LiveStatus = 'idle';
  notices: ChoresNotice[] = [];
  readonly api: ChoresApi;
  readonly queue: CheckoffQueue;
  private readonly _subscription: ChoresSubscription;
  private _following = false;
  private _resend: ReturnType<typeof setInterval> | undefined;
  private _boardFor: { feed: ChoresFeed | null; entries: readonly unknown[]; board: Board | null } = {
    feed: null, entries: [], board: null,
  };

  constructor(private readonly _host: ServiceHost) {
    this.api = new ChoresApi(
      { callWS: <T>(msg: Record<string, unknown>) => (this._host.hass as unknown as { callWS(m: unknown): Promise<T> }).callWS(msg) },
      () => this._host.pinSession?.token ?? null,
      token => this._host.sessionEnded(token),
    );
    this.queue = sharedQueue();
    this._subscription = new ChoresSubscription(
      feed => {
        this.feed = feed;
        this.requestUpdate();
      },
      status => {
        this.status = status;
        if (status === 'live') void this.queue.flush();
        this.requestUpdate();
      },
    );
    _host.addController(this);
  }

  get connected(): boolean {
    return this.status === 'live';
  }

  hostConnected(): void {
    live.add(this);
    this._follow();
    this._resend = setInterval(() => {
      if (this.queue.waiting && this.connected) void this.queue.flush();
    }, RESEND_MS);
  }

  hostUpdate(): void {
    this._follow();
  }

  hostDisconnected(): void {
    live.delete(this);
    clearInterval(this._resend);
    this._resend = undefined;
    this._subscription.stop();
    this._following = false;
    this.feed = null;
  }

  requestUpdate(): void {
    this._host.requestUpdate();
  }

  private _follow(): void {
    const on = choresEnabled({ household: this._host.householdView });
    if (!on) {
      if (this._following) {
        this._subscription.stop();
        this._following = false;
        this.feed = null;
      }
      return;
    }
    this._following = true;
    this._subscription.update(this._host.hass?.connection as unknown as LiveConnection<ChoresFeed> | undefined);
  }

  /** Try to reach Home Assistant again now (the error state's Try again). */
  retry(): void {
    this._subscription.retry();
    void this.queue.flush();
  }

  /** Today's board with waiting check-offs shown as done; null until the feed arrives or when chores aren't usable. */
  board(): Board | null {
    const feed = this.feed;
    const entries = this.queue.entries;
    if (this._boardFor.feed === feed && this._boardFor.entries === entries) return this._boardFor.board;
    const board = feed?.state === 'ok' && feed.board ? withQueued(feed.board, entries) : null;
    this._boardFor = { feed, entries, board };
    return board;
  }

  /** Queue a check-off or an uncheck and send it when the connection allows. */
  enqueue(entry: Omit<QueuedCheckoff, 'id' | 'at' | 'card'>): QueuedCheckoff | null {
    const added = this.queue.add({ ...entry, card: this.id });
    if (this.connected) void this.queue.flush();
    return added;
  }

  /** Send one waiting entry (the queue calls this). */
  async send(entry: QueuedCheckoff): Promise<SendOutcome> {
    if (!this.connected) return { kind: 'wait' };
    try {
      if (entry.op === 'complete') await this.api.complete(entry.occurrence, entry.doneBy);
      else await this.api.undo(entry.occurrence);
      return { kind: 'sent' };
    } catch (err) {
      return outcomeOf(err, errorMessage(err));
    }
  }

  notify(notice: ChoresNotice): void {
    this.notices = [...this.notices, notice];
    this.requestUpdate();
  }

  /** The notices not yet shown; whoever shows them takes them. */
  takeNotices(): ChoresNotice[] {
    const notices = this.notices;
    if (notices.length) this.notices = [];
    return notices;
  }

  glance(ctx: ModuleContext): GlanceChip[] {
    if (!choresEnabled(ctx)) return [];
    const board = this.board();
    const chips = choresGlance(board);
    if (!board) return chips;
    const data = this._host.planavistaData;
    const now = new Date();
    const events = eventsOn(data, new Date(board.day.start), new Date(board.day.end));
    const next = nextForHousehold(events, ctx.household?.members ?? [], now, data?.display?.time_format ?? '12h',
      entityId => calendarNameOf(data, entityId));
    return [...chips, ...nextEventChip(next)];
  }

  barActions(ctx: ModuleContext): ModuleAction[] {
    return choresBarActions(this.board(), ctx.household ?? null, this._host.pinSession);
  }

  stripActions(): ModuleAction[] {
    return choresStripActions(this.board());
  }

  memberProgress(memberId: string): MemberProgress | null {
    const member = this.board()?.members[memberId];
    if (!member) return null;
    return { done: member.today.done, pending: member.today.pending, due: member.today.due };
  }
}
```

- [ ] **Step 5: Run them again.** Same command. Expected: `36 passed`.
- [ ] **Step 6: Run the whole frontend suite.** Expected: tsc clean, `502 passed` (milestone 2's household client tests unchanged); the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): the live board feed, the check-off queue, and the card-wide service` with the trailers.

---

### Task 4: Chores in the card: glance chips, bar buttons, the PIN gate, and the ring

Spec 6.3 (the module registry's services), 9.3 and 9.4 (tap your face, then your PIN; parent mode's + Add chore), 11.1 (one `pv-ring`), 12.2 (the glance chip on every module, "⏳ 2 waiting for OK" in the bar), and 13.1's states (loading skeleton, can't reach Home Assistant, chores need a look, a newer release). `motionOf` moves into `core/motion.ts` so the ring doesn't reach into the shell.

**Files:**
- Create: `custom_components/planavista/frontend/src/core/pin-gate.ts`, `custom_components/planavista/frontend/src/core/pv-ring.ts`, `custom_components/planavista/frontend/src/core/pv-toast.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-styles.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Modify: `custom_components/planavista/frontend/src/core/module-registry.ts`, `custom_components/planavista/frontend/src/core/motion.ts`, `custom_components/planavista/frontend/src/main.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-glance.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-service.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/pv-glance-header.ts`, `custom_components/planavista/frontend/src/shell/pv-nav-bar.ts`, `custom_components/planavista/frontend/src/shell/pv-parent-strip.ts`, `custom_components/planavista/frontend/src/shell/sheet-motion.ts`
- Test: `custom_components/planavista/frontend/test/chores-definition.test.ts`

**Interfaces:**
- Consumes: Task 3's service and glance.
- Produces: `PinGate.ask(members, heading)`; `pv-ring` (`size`, `progress`, `color`, `closed`, `dashed`, `label`, `celebrate`); `pv-toast` (`toast: { id, text, actions?, tone?, ms? }`, events `pv-toast-action`, `pv-toast-gone`); `choresModule`, `CHORES_VIEWS`, `registerChoresModule`; `pv-chores-module` (properties from the shell: `household`, `session`, `services`, `revision`, `pinGate`, `openTarget`; `moduleAction(id)`; protected `asParent(heading)`, `showToast`); the card as `ServiceHost` (`householdView`, `pinSession`, `planavistaData`, `sessionEnded`, `serviceChanged`); `pv-glance-header.chips` and `pv-open`; `pv-nav-bar.actions` and `pv-module-action`; `pv-parent-strip.actions` and `pv-strip-action`.

- [ ] **Step 1: Write the failing test.**

`custom_components/planavista/frontend/test/chores-definition.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { ModuleRegistry } from '../src/core/module-registry';
import { CHORES_VIEWS, choresModule, registerChoresModule } from '../src/modules/chores/definition';

describe('the Chores module', () => {
  it('offers Board, Week, My day, and Rewards (spec 12.2)', () => {
    expect(CHORES_VIEWS.map(v => v.label)).toEqual(['Board', 'Week', 'My day', 'Rewards']);
    expect(choresModule.views[0].id).toBe('board');
  });

  it('shows only once the household turns chores on', () => {
    const household = (modules: Record<string, unknown>) =>
      ({ available: true, modules } as never);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: household({ chores: { enabled: true } }) })).toBe(true);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: household({ chores: { enabled: false } }) })).toBe(false);
    expect(choresModule.enabled?.({ config: undefined, data: null, household: null })).toBe(false);
  });

  it('comes after the calendar and keeps card-wide state', () => {
    const registry = new ModuleRegistry();
    registerChoresModule(registry);
    expect(registry.get('chores')?.order).toBeGreaterThan(10);
    expect(typeof choresModule.service).toBe('function');
    expect(choresModule.watchedEntities({ config: undefined, data: null })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it.** `npx vitest run test/chores-definition.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/definition`.

- [ ] **Step 3: Write the ring, the toast, the PIN gate, and move motionOf.**

`custom_components/planavista/frontend/src/core/pin-gate.ts` (new):

```ts
import type { Member } from './household';

/**
 * How a module asks for a PIN (spec 9.3: tap your face, then your PIN). The
 * card owns the PIN sheet and the session; a module says who may unlock and
 * what for, and hears whether a session for one of them started.
 */
export interface PinGate {
  ask(members: Member[], heading: string): Promise<boolean>;
}
```

`custom_components/planavista/frontend/src/core/pv-ring.ts` (new):

```ts
import { LitElement, html, css, nothing, svg, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { contrastText } from './color';
import { BOUNCY, GENTLE, motionOf, springEasing } from './motion';

/**
 * pv-ring: the signature (spec 11.1). A person's ring fills as their day gets
 * done and closes with a check. One element serves every size: 34 px Week
 * cells, 58 px board columns, 132 px picture tiles, and the calendar's Day
 * view headers. Whatever is slotted (a picture, an icon) sits inside it.
 *
 * Bumping `celebrate` plays the glow and burst once (spec 11.5: celebrations
 * are earned).
 */
export class PvRing extends LitElement {
  @property({ type: Number }) size = 58;
  /** 0 to 1. */
  @property({ type: Number }) progress = 0;
  @property({ type: String }) color = 'currentColor';
  /** Draws the closed check badge. */
  @property({ type: Boolean, reflect: true }) closed = false;
  /** A dashed track: a day still to come (Week). */
  @property({ type: Boolean, reflect: true }) dashed = false;
  /** What a screen reader hears ("Casey, 1 of 3 done today"); empty leaves it to the surroundings. */
  @property({ type: String }) label = '';
  /** Change it to a new number to celebrate once. */
  @property({ type: Number }) celebrate = 0;

  static styles = css`
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      line-height: 0;
    }

    svg.ring {
      position: absolute;
      inset: 0;
      transform: rotate(-90deg);
      overflow: visible;
    }

    .track {
      stroke: var(--pv-ring-track, var(--pv-track, #ECECE8));
    }

    :host([dashed]) .track {
      stroke-dasharray: 3 4;
    }

    .fill {
      transition: stroke-dashoffset var(--pv-ring-ms, 700ms) var(--pv-ring-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
    }

    .inside {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
    }

    .badge {
      position: absolute;
      right: -1px;
      bottom: -1px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid var(--pv-card-bg, #FFFFFF);
      box-sizing: border-box;
    }

    .glow {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }

    .spark {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    }
  `;

  private get _stroke(): number {
    return this.size >= 100 ? 8 : this.size >= 50 ? 4 : 3;
  }

  protected firstUpdated(): void {
    this._setEasing();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('celebrate') && this.celebrate && changed.get('celebrate') !== undefined) this._play();
  }

  private _setEasing(): void {
    if (motionOf(this) === 'reduced') {
      this.style.setProperty('--pv-ring-ms', '180ms');
      this.style.setProperty('--pv-ring-ease', 'linear');
      return;
    }
    const spring = springEasing(GENTLE);
    this.style.setProperty('--pv-ring-ms', `${spring.duration}ms`);
    this.style.setProperty('--pv-ring-ease', spring.easing);
  }

  /** The glow and burst, once. Only opacity and transform animate (spec 11.5: cheap to run). */
  private _play(): void {
    const glow = this.renderRoot.querySelector<HTMLElement>('.glow');
    if (!glow) return;
    if (motionOf(this) === 'reduced') {
      glow.animate({ opacity: [0, 0.5, 0] }, { duration: 500, easing: 'ease-out' });
      return;
    }
    glow.animate(
      { opacity: [0, 0.7, 0], transform: ['scale(0.9)', 'scale(1.15)', 'scale(1.25)'] },
      { duration: 900, easing: 'ease-out' },
    );
    const pop = springEasing(BOUNCY);
    this.animate({ transform: ['scale(1)', 'scale(1.08)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
    const sparks = [...this.renderRoot.querySelectorAll<HTMLElement>('.spark')];
    const reach = this.size * 0.75;
    sparks.forEach((spark, i) => {
      const angle = (i / sparks.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * reach;
      const y = Math.sin(angle) * reach;
      spark.animate(
        {
          opacity: [0, 1, 0],
          transform: ['translate(0, 0) scale(0.6)', `translate(${x * 0.7}px, ${y * 0.7}px) scale(1)`, `translate(${x}px, ${y}px) scale(0.4)`],
        },
        { duration: 800, delay: i * 18, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
      );
    });
  }

  render() {
    const size = this.size;
    const stroke = this._stroke;
    const center = size / 2;
    const radius = (size - stroke) / 2;
    const length = 2 * Math.PI * radius;
    const progress = this.closed ? 1 : Math.min(1, Math.max(0, this.progress));
    const inner = size - stroke * 2 - Math.max(2, Math.round(size * 0.06)) * 2;
    const badge = Math.max(14, Math.round(size * 0.32));
    return html`
      <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center"
        role=${this.label ? 'img' : nothing} aria-label=${this.label || nothing}>
        <div class="glow" style="box-shadow: 0 0 0 4px ${this.color}, 0 0 24px 6px ${this.color}"></div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(() => html`<span class="spark" style="background:${this.color}"></span>`)}
        <svg class="ring" width=${size} height=${size} viewBox="0 0 ${size} ${size}" aria-hidden="true">
          ${svg`
            <circle class="track" cx=${center} cy=${center} r=${radius} fill="none" stroke-width=${stroke}></circle>
            <circle class="fill" cx=${center} cy=${center} r=${radius} fill="none" stroke=${this.color}
              stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${length}
              stroke-dashoffset=${length * (1 - progress)} opacity=${progress > 0 ? 1 : 0}></circle>
          `}
        </svg>
        <div class="inside" style="width:${inner}px;height:${inner}px"><slot></slot></div>
        ${this.closed ? html`
          <span class="badge" aria-hidden="true"
            style="width:${badge}px;height:${badge}px;background:${this.color};color:${contrastText(this.color)}">
            <svg width=${Math.round(badge * 0.6)} height=${Math.round(badge * 0.6)} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5"></path>
            </svg>
          </span>
        ` : nothing}
      </div>
    `;
  }
}

defineElement('pv-ring', PvRing);
```

`custom_components/planavista/frontend/src/core/pv-toast.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { SMOOTH, motionOf, springEasing } from './motion';

export interface ToastAction {
  id: string;
  label: string;
}

export interface Toast {
  /** A new id shows a new toast (and restarts its timer). */
  id: string;
  text: string;
  actions?: ToastAction[];
  /** 'bad' for something that failed (a revert). */
  tone?: 'plain' | 'bad';
  /** How long it stays (ms). */
  ms?: number;
}

/**
 * pv-toast: one short message at the bottom of a screen, just above the bar
 * in portrait (spec 12.3), with up to two actions such as Undo. A new toast
 * replaces the one showing. Screen readers hear it politely.
 *
 * @fires pv-toast-action - { toast, action } when an action is tapped
 * @fires pv-toast-gone - { toast } when it times out or is dismissed
 */
export class PvToast extends LitElement {
  @property({ attribute: false }) toast: Toast | null = null;
  private _timer: ReturnType<typeof setTimeout> | undefined;

  static styles = css`
    :host {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12px;
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 40;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: min(560px, calc(100% - 24px));
      min-height: 48px;
      box-sizing: border-box;
      padding: 6px 8px 6px 16px;
      border-radius: 14px;
      background: #1F2023;
      color: #F4F4F2;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      font-size: 0.9375rem;
      line-height: 1.3;
    }

    .toast.bad .text::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 8px;
      border-radius: 50%;
      background: #F3A5A5;
      vertical-align: 1px;
    }

    .text {
      flex: 1 1 auto;
      min-width: 0;
      padding: 6px 4px 6px 0;
    }

    button {
      flex-shrink: 0;
      min-height: 40px;
      min-width: 48px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #A9A9FF;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:hover,
    button:focus-visible {
      background: rgba(255, 255, 255, 0.1);
      outline: none;
    }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  protected updated(changed: PropertyValues): void {
    const before = changed.get('toast') as Toast | null | undefined;
    if (!changed.has('toast') || before?.id === this.toast?.id) return;
    clearTimeout(this._timer);
    const toast = this.toast;
    if (!toast) return;
    const box = this.renderRoot.querySelector<HTMLElement>('.toast');
    if (box) {
      if (motionOf(this) === 'reduced') box.animate({ opacity: [0, 1] }, { duration: 150 });
      else {
        const spring = springEasing(SMOOTH);
        box.animate({ transform: ['translateY(16px)', 'translateY(0)'], opacity: [0, 1] }, { duration: spring.duration, easing: spring.easing });
      }
    }
    this._timer = setTimeout(() => this._gone(toast), toast.ms ?? 5000);
  }

  render() {
    const toast = this.toast;
    if (!toast) return nothing;
    return html`
      <div class="toast ${toast.tone === 'bad' ? 'bad' : ''}" role="status" aria-live="polite">
        <span class="text">${toast.text}</span>
        ${(toast.actions ?? []).map(action => html`
          <button type="button" @click=${() => this._act(toast, action)}>${action.label}</button>
        `)}
      </div>
    `;
  }

  private _act(toast: Toast, action: ToastAction): void {
    clearTimeout(this._timer);
    this.dispatchEvent(new CustomEvent('pv-toast-action', { detail: { toast, action: action.id }, bubbles: true, composed: true }));
  }

  private _gone(toast: Toast): void {
    this.dispatchEvent(new CustomEvent('pv-toast-gone', { detail: { toast }, bubbles: true, composed: true }));
  }
}

defineElement('pv-toast', PvToast);
```

`custom_components/planavista/frontend/src/core/motion.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/motion.ts b/custom_components/planavista/frontend/src/core/motion.ts
index b427409..328ed5a 100644
--- a/custom_components/planavista/frontend/src/core/motion.ts
+++ b/custom_components/planavista/frontend/src/core/motion.ts
@@ -58,3 +58,14 @@ export function resolveMotion(setting: MotionSetting | undefined, deviceReduced:
   if (setting === 'full' || setting === 'reduced') return setting;
   return deviceReduced ? 'reduced' : 'full';
 }
+
+/**
+ * Full or reduced motion where an element is drawn. The card sets
+ * --pv-motion (spec 11.5), and custom properties reach into every shadow
+ * root, so a sheet inside a Settings page reads it too.
+ */
+export function motionOf(element: Element): Motion {
+  const value = getComputedStyle(element).getPropertyValue('--pv-motion').trim();
+  if (value === 'reduced' || value === 'full') return value;
+  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
+}
```

`custom_components/planavista/frontend/src/shell/sheet-motion.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/sheet-motion.ts b/custom_components/planavista/frontend/src/shell/sheet-motion.ts
index d147288..55aafce 100644
--- a/custom_components/planavista/frontend/src/shell/sheet-motion.ts
+++ b/custom_components/planavista/frontend/src/shell/sheet-motion.ts
@@ -1,17 +1,8 @@
 import type { Layout } from '../core/layout';
-import { BOUNCY, Motion, SMOOTH, springEasing } from '../core/motion';
+import { BOUNCY, SMOOTH, motionOf, springEasing } from '../core/motion';
 import { sheetDragOffset, sheetDragOutcome } from '../core/sheet-drag';
 
-/**
- * Full or reduced motion where an element is drawn. The card sets
- * --pv-motion (spec 11.5), and custom properties reach into every shadow
- * root, so a sheet inside a Settings page reads it too.
- */
-export function motionOf(element: Element): Motion {
-  const value = getComputedStyle(element).getPropertyValue('--pv-motion').trim();
-  if (value === 'reduced' || value === 'full') return value;
-  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
-}
+export { motionOf };
 
 const QUICK_MS = 150;
 
```

- [ ] **Step 4: Give the shell services, chips, module buttons, and the PIN gate.**

`custom_components/planavista/frontend/src/core/module-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/module-registry.ts b/custom_components/planavista/frontend/src/core/module-registry.ts
index 917282c..f5e1565 100644
--- a/custom_components/planavista/frontend/src/core/module-registry.ts
+++ b/custom_components/planavista/frontend/src/core/module-registry.ts
@@ -41,6 +41,8 @@ export interface GlanceChip {
 export interface ModuleAction {
   id: string;
   label: string;
+  /** What a phone's narrow bar shows instead ("2"); just the glyph when empty. */
+  short?: string;
   /** A leading glyph or emoji. */
   glyph?: string;
   /** 'act' draws it in indigo: something to act on (spec 11.3). */
@@ -65,6 +67,8 @@ export interface ServiceHost extends ReactiveControllerHost, HTMLElement {
   readonly planavistaData: PlanaVistaData | null;
   /** A command was refused although it carried this session: the backend already ended it. */
   sessionEnded(token: string): void;
+  /** The service has news: the card redraws the header, the bar, and the modules. */
+  serviceChanged(): void;
 }
 
 /**
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 3ce4007..51d42dc 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -9,8 +9,23 @@ import { getPlanaVistaData } from '../utils/ha-utils';
 import { todayHighLow } from '../utils/weather-subscription';
 import { memoizeOne, statesChanged } from '../utils/render-cache';
 import { resolveDisplay } from '../core/display';
-import { ModuleDefinition, ResolvedModules, initialModuleView, moduleRegistry, resolveModules } from '../core/module-registry';
-import { SettingsAccess, parentsWithPins, settingsAccess } from '../core/household';
+import {
+  GlanceChip,
+  ModuleAction,
+  ModuleContext,
+  ModuleDefinition,
+  ModuleElement,
+  ModuleService,
+  OpenTarget,
+  ResolvedModules,
+  ServiceHost,
+  initialModuleView,
+  moduleRegistry,
+  resolveModules,
+} from '../core/module-registry';
+import { HouseholdView, Member, SettingsAccess, parentsWithPins, settingsAccess } from '../core/household';
+import type { PinGate } from '../core/pin-gate';
+import type { Session } from '../core/session';
 import { HouseholdApi, UnlockResult } from '../core/household-client';
 import { AppearanceEdits } from '../core/appearance-edits';
 import { appearanceDependencies, sunOf } from '../core/appearance-deps';
@@ -32,9 +47,10 @@ import './pv-notice-sheet';
 import './settings/pv-settings';
 import './setup/pv-setup';
 
-/** A sheet the card shows over everything: a parent's PIN, or why there is no way in. */
+/** A sheet the card shows over everything: a PIN, or why there is no way in. */
 type CardSheet =
   | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue'; heading: string }
+  | { kind: 'pin'; purpose: 'module'; heading: string; members: Member[]; resolve: (unlocked: boolean) => void }
   | { kind: 'no_pin' };
 
 const DEFAULT_ENTITY = 'sensor.planavista_config';
@@ -44,7 +60,7 @@ const DEFAULT_ENTITY = 'sensor.planavista_config';
  * Settings, applies the theme, and hosts the modules registered in
  * core/module-registry (today, the calendar).
  */
-export class PlanaVistaCard extends LitElement {
+export class PlanaVistaCard extends LitElement implements ServiceHost {
   @property({ attribute: false }) public hass!: HomeAssistant;
   @state() private _config?: PlanaVistaCardConfig;
   @state() private _wizardOpen = false;
@@ -60,6 +76,10 @@ export class PlanaVistaCard extends LitElement {
   @state() private _views: Record<string, string> = {};
   /** The module the switcher picked; null for the card's first. */
   @state() private _moduleId: string | null = null;
+  /** Where a glance chip or a ring sent the card last (a module and view, perhaps one person). */
+  @state() private _openTarget: OpenTarget | null = null;
+  /** Bumped whenever a module's service has news, so the modules and the header redraw. */
+  @state() private _serviceRevision = 0;
 
   private _household = new HouseholdController(this);
   private _session = new SessionController(this, () => this._api);
@@ -92,9 +112,52 @@ export class PlanaVistaCard extends LitElement {
     token => this._session.ended(token),
   );
 
+  /** Each module's card-wide state (the chores feed), made once per card. */
+  private readonly _services: Record<string, ModuleService> = {};
+
+  /** How a module asks for a PIN: the card's PIN sheet, then the card's session. */
+  private readonly _pinGate: PinGate = {
+    ask: (members, heading) => new Promise<boolean>(resolve => {
+      if (members.length === 0 || this._sheet) {
+        resolve(false);
+        return;
+      }
+      this._sheetOpener = (this.renderRoot as ShadowRoot | undefined)?.activeElement as HTMLElement | null ?? null;
+      this._sheet = { kind: 'pin', purpose: 'module', heading, members, resolve };
+    }),
+  };
+
   constructor() {
     super();
     this._drafts.set('appearance', this._appearanceEdits);
+    for (const mod of moduleRegistry.list()) {
+      if (mod.service) this._services[mod.id] = mod.service(this);
+    }
+  }
+
+  /** ServiceHost: the household, once it has answered. */
+  get householdView(): HouseholdView | null {
+    return this._household.view;
+  }
+
+  /** ServiceHost: the PIN session on this screen. */
+  get pinSession(): Session | null {
+    return this._session.session;
+  }
+
+  /** ServiceHost: the config sensor's data. */
+  get planavistaData(): PlanaVistaData | null {
+    return this._data();
+  }
+
+  /** ServiceHost: the backend refused a command made with this session. */
+  sessionEnded(token: string): void {
+    this._session.ended(token);
+  }
+
+  /** ServiceHost: a module's service has news. */
+  serviceChanged(): void {
+    this._serviceRevision++;
   }
 
   static styles = [
@@ -246,11 +309,39 @@ export class PlanaVistaCard extends LitElement {
     return this._displayFor(this._config, this._data());
   }
 
-  private _modulesFor = memoizeOne((config: PlanaVistaCardConfig | undefined): ResolvedModules =>
-    resolveModules(moduleRegistry.list(), config ?? {}));
+  private _modulesFor = memoizeOne((config: PlanaVistaCardConfig | undefined, modules: unknown, _available: boolean): ResolvedModules =>
+    resolveModules(moduleRegistry.list(), config ?? {}, { config, data: null, household: this._household.view }));
 
   private _modules(): ResolvedModules {
-    return this._modulesFor(this._config);
+    const view = this._household.view;
+    return this._modulesFor(this._config, view?.modules, !!view?.available);
+  }
+
+  /** What modules and their services know about the card right now. */
+  private _ctx(): ModuleContext {
+    return { config: this._config, data: this._data(), household: this._household.view };
+  }
+
+  /** Every module's glance chips, for the header (spec 12.2: on every module). */
+  private _glanceChips(): GlanceChip[] {
+    const ctx = this._ctx();
+    return Object.values(this._services).flatMap(service => service.glance?.(ctx) ?? []);
+  }
+
+  /** Go where a chip or a ring points: a module, one of its views, perhaps one person. */
+  private _open(target: OpenTarget): void {
+    const mod = this._modules().shown.find(m => m.id === target.module);
+    if (!mod) return;
+    this._moduleId = mod.id;
+    if (target.view && mod.views.some(v => v.id === target.view)) {
+      this._views = { ...this._views, [mod.id]: target.view };
+    }
+    this._openTarget = { ...target };
+  }
+
+  /** A bar or strip button of the module on screen. */
+  private _moduleAction(id: string): void {
+    (this.renderRoot.querySelector('.pv-module') as ModuleElement | null)?.moduleAction?.(id);
   }
 
   /** The config sensor, the weather entity, and whatever the shown modules watch. */
@@ -377,6 +468,10 @@ export class PlanaVistaCard extends LitElement {
     const sheet = this._sheet;
     this._session.unlocked(event.detail.result);
     this._closeSheet();
+    if (sheet?.kind === 'pin' && sheet.purpose === 'module') {
+      sheet.resolve(!!this._session.session);
+      return;
+    }
     if (sheet?.kind === 'pin' && (sheet.purpose === 'settings' || sheet.purpose === 'continue')) {
       this._settingsVia = 'session';
       this._settingsOpen = true;
@@ -387,6 +482,7 @@ export class PlanaVistaCard extends LitElement {
   private _onSheetCancel() {
     const sheet = this._sheet;
     this._closeSheet();
+    if (sheet?.kind === 'pin' && sheet.purpose === 'module') sheet.resolve(false);
     // Without parent mode, Settings can't stay open on this screen.
     if (sheet?.kind === 'pin' && sheet.purpose === 'continue') this._onSettingsClose();
   }
@@ -433,7 +529,7 @@ export class PlanaVistaCard extends LitElement {
         .api=${this._api}
         .layout=${layout}
         mode="unlock"
-        .members=${view ? parentsWithPins(view.members) : []}
+        .members=${sheet.purpose === 'module' ? sheet.members : view ? parentsWithPins(view.members) : []}
         .heading=${sheet.heading}
         .shuffle=${!!view?.security.shuffle_keypad}
         @pv-unlocked=${this._onUnlocked}
@@ -448,12 +544,16 @@ export class PlanaVistaCard extends LitElement {
     if (!session?.parent) return nothing;
     const parent = this._household.view?.members.find(m => m.id === session.memberId);
     if (!parent) return nothing;
+    const active = this._activeModule();
+    const actions: ModuleAction[] = active ? this._services[active.id]?.stripActions?.(this._ctx()) ?? [] : [];
     return html`
       <pv-parent-strip
         .member=${parent}
         .hass=${this.hass}
         .endsAt=${this._session.endsAt ?? 0}
+        .actions=${actions}
         @pv-lock=${() => this._session.lock()}
+        @pv-strip-action=${(e: CustomEvent<{ id: string }>) => this._moduleAction(e.detail.id)}
       ></pv-parent-strip>
     `;
   }
@@ -554,8 +654,16 @@ export class PlanaVistaCard extends LitElement {
         .mode=${this._appearance.mode}
         .shape=${this._appearance.look.shape}
         .forecast=${this._forecast.forecast}
+        .household=${this._household.view}
+        .session=${this._session.session}
+        .sessionEndsAt=${this._session.endsAt ?? 0}
+        .services=${this._services}
+        .revision=${this._serviceRevision}
+        .pinGate=${this._pinGate}
+        .openTarget=${this._openTarget}
         @pv-view-change=${(e: CustomEvent<{ view: string }>) => this._setView(e.detail.view)}
         @pv-overlay-change=${(e: CustomEvent<{ open: boolean }>) => { this._moduleOverlay = e.detail.open; }}
+        @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
       ></${tag}>
     `;
   }
@@ -569,6 +677,8 @@ export class PlanaVistaCard extends LitElement {
         .weather=${weather ?? null}
         .weatherEntity=${display.weather_entity}
         .today=${todayHighLow(this._forecast.forecast, new Date())}
+        .chips=${this._glanceChips()}
+        @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
       ></pv-glance-header>
     `;
   }
@@ -583,6 +693,8 @@ export class PlanaVistaCard extends LitElement {
         .views=${active.views}
         .activeView=${this._views[active.id] ?? ''}
         .canOpenSettings=${this._access() !== 'none'}
+        .actions=${this._services[active.id]?.barActions?.(this._ctx()) ?? []}
+        @pv-module-action=${(e: CustomEvent<{ id: string }>) => this._moduleAction(e.detail.id)}
         @pv-module-select=${(e: CustomEvent<{ id: string }>) => { this._moduleId = e.detail.id; }}
         @pv-view-select=${(e: CustomEvent<{ id: string }>) => this._setView(e.detail.id)}
         @pv-open-settings=${this._openSettings}
```

`custom_components/planavista/frontend/src/shell/pv-glance-header.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-glance-header.ts b/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
index fa3396c..6a7cf5c 100644
--- a/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-glance-header.ts
@@ -4,7 +4,9 @@ import { defineElement } from '../utils/define';
 import { formatClockParts } from '../utils/date-utils';
 import { weatherIcon } from '../utils/weather-icons';
 import type { Layout } from '../core/layout';
+import type { GlanceChip } from '../core/module-registry';
 import type { WeatherCondition } from '../types';
+import '../core/pv-ring';
 
 /** The part of a weather entity's state the header shows. */
 export interface HeaderWeather {
@@ -15,9 +17,12 @@ export interface HeaderWeather {
 /**
  * pv-glance-header: the clock, the date, and the weather, laid out for the
  * card's own size (spec 12.2): one row in landscape, a lock-screen clock in
- * portrait, a compact row on a phone. Glance chips arrive with chores.
+ * portrait, a compact row on a phone. Modules add glance chips ("9 of 17
+ * chores done today"): the main one beside the weather in landscape, all of
+ * them under the clock in portrait, the main one on a phone.
  *
  * @fires hass-more-info - { entityId } when the weather is tapped
+ * @fires pv-open - the chip's target (a module and view) when a chip is tapped
  */
 export class PvGlanceHeader extends LitElement {
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
@@ -27,6 +32,8 @@ export class PvGlanceHeader extends LitElement {
   @property({ attribute: false }) weatherEntity = '';
   /** Today's high and low from the card's forecast. */
   @property({ attribute: false }) today: { high: number; low: number | null } | null = null;
+  /** The modules' glance chips. */
+  @property({ attribute: false }) chips: GlanceChip[] = [];
 
   /** Minutes since the epoch; changing it is what re-renders the clock. */
   @state() private _minute = Math.floor(Date.now() / 60000);
@@ -157,6 +164,67 @@ export class PvGlanceHeader extends LitElement {
       line-height: 1;
     }
 
+    .chips {
+      display: flex;
+      flex-wrap: wrap;
+      gap: 8px;
+    }
+
+    .left {
+      justify-self: start;
+      display: flex;
+      align-items: center;
+      gap: 12px;
+      min-width: 0;
+    }
+
+    :host([layout='portrait']) .chips {
+      padding: 0 20px 14px;
+    }
+
+    :host([layout='phone']) .chips {
+      padding: 0 14px 8px;
+    }
+
+    .chip {
+      display: inline-flex;
+      align-items: center;
+      min-height: 48px;
+      padding: 0;
+      border: none;
+      background: transparent;
+      color: inherit;
+      font: inherit;
+      cursor: pointer;
+      -webkit-tap-highlight-color: transparent;
+    }
+
+    .chip span.pill {
+      display: inline-flex;
+      align-items: center;
+      gap: 7px;
+      height: 32px;
+      padding: 0 12px 0 8px;
+      border-radius: 99px;
+      background: color-mix(in srgb, var(--pv-header-text, #1A1B1E) 7%, transparent);
+      font-size: 0.8125rem;
+      font-weight: 700;
+      white-space: nowrap;
+    }
+
+    .chip span.pill.plain {
+      padding-left: 12px;
+    }
+
+    .chip:focus-visible {
+      outline: none;
+    }
+
+    .chip:focus-visible span.pill {
+      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
+      outline-offset: 2px;
+    }
+
     /* Phone: one compact row. */
     :host([layout='phone']) .row {
       display: flex;
@@ -205,12 +273,14 @@ export class PvGlanceHeader extends LitElement {
     const now = new Date();
     const { time, ampm, date } = formatClockParts(now, this.timeFormat);
     const clock = html`<span class="time">${time}${ampm ? html`<span class="ampm muted">${ampm}</span>` : nothing}</span>`;
+    const primary = this.chips.filter(chip => chip.primary);
     if (this.layout === 'portrait') {
       return html`
         <div class="row">
           <div class="clock">${clock}<div class="date">${date}</div></div>
           ${this._weather(40, 'highlow')}
         </div>
+        ${this._chips(this.chips)}
       `;
     }
     if (this.layout === 'phone') {
@@ -220,17 +290,41 @@ export class PvGlanceHeader extends LitElement {
           <div class="clock">${clock}<span class="date muted">${short}</span></div>
           ${this._weather(24, 'none')}
         </div>
+        ${this._chips(primary)}
       `;
     }
     return html`
       <div class="row">
-        ${this._weather(32, 'condition')}
+        <div class="left">${this._weather(32, 'condition')}${this._chips(primary)}</div>
         <div class="date">${date}</div>
         ${clock}
       </div>
     `;
   }
 
+  private _chips(chips: GlanceChip[]) {
+    if (chips.length === 0) return nothing;
+    return html`
+      <div class="chips">
+        ${chips.map(chip => html`
+          <button type="button" class="chip" @click=${() => this._openChip(chip)}>
+            <span class="pill ${chip.progress === undefined ? 'plain' : ''}">
+              ${chip.progress !== undefined ? html`
+                <pv-ring size="18" .progress=${chip.progress} color="var(--pv-accent, #5B5BD6)" ?closed=${chip.progress >= 1}></pv-ring>
+              ` : nothing}
+              ${chip.text}
+            </span>
+          </button>
+        `)}
+      </div>
+    `;
+  }
+
+  private _openChip(chip: GlanceChip): void {
+    if (!chip.open) return;
+    this.dispatchEvent(new CustomEvent('pv-open', { detail: chip.open, bubbles: true, composed: true }));
+  }
+
   private _weather(size: number, detail: 'condition' | 'highlow' | 'none') {
     const weather = this.weather;
     if (!weather) return html`<span></span>`;
```

`custom_components/planavista/frontend/src/shell/pv-nav-bar.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts b/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
index eaf308a..2ee0c7b 100644
--- a/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-nav-bar.ts
@@ -2,7 +2,7 @@ import { LitElement, html, css, nothing } from 'lit';
 import { property } from 'lit/decorators.js';
 import { defineElement } from '../utils/define';
 import type { Layout } from '../core/layout';
-import type { ModuleView } from '../core/module-registry';
+import type { ModuleAction, ModuleView } from '../core/module-registry';
 
 /** A module as the switcher shows it. */
 export interface BarModule {
@@ -19,6 +19,7 @@ export interface BarModule {
  * @fires pv-module-select - { id } of the module tapped
  * @fires pv-view-select - { id } of the view tapped
  * @fires pv-open-settings - the gear
+ * @fires pv-module-action - { id } of one of the module's buttons (⏳ 2 waiting for OK, + Add chore)
  */
 export class PvNavBar extends LitElement {
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
@@ -27,6 +28,8 @@ export class PvNavBar extends LitElement {
   @property({ attribute: false }) views: ModuleView[] = [];
   @property({ attribute: false }) activeView = '';
   @property({ type: Boolean }) canOpenSettings = false;
+  /** The module's own buttons, between its views and the gear. */
+  @property({ attribute: false }) actions: ModuleAction[] = [];
 
   static styles = css`
     :host {
@@ -146,6 +149,43 @@ export class PvNavBar extends LitElement {
       color: var(--pv-text, #1A1B1E);
     }
 
+    .actions {
+      display: flex;
+      align-items: center;
+      gap: 6px;
+      flex-shrink: 0;
+    }
+
+    .action {
+      min-height: 48px;
+      flex-shrink: 0;
+    }
+
+    .action > span {
+      display: inline-flex;
+      align-items: center;
+      gap: 6px;
+      height: 36px;
+      padding: 0 12px;
+      border-radius: 9px;
+      border: 1px solid var(--pv-border, #E7E7E3);
+      font-size: 0.875rem;
+      font-weight: 650;
+      color: var(--pv-text, #1A1B1E);
+      white-space: nowrap;
+    }
+
+    .action.act > span {
+      border-color: transparent;
+      background: var(--pv-accent-tint, #EEEEFC);
+      color: var(--pv-accent-tint-ink, #3B3BB0);
+    }
+
+    .glyph {
+      font-size: 1rem;
+      line-height: 1;
+    }
+
     .gear {
       width: 48px;
       height: 48px;
@@ -198,6 +238,19 @@ export class PvNavBar extends LitElement {
             </button>
           `)}
         </div>
+        ${this.actions.length ? html`
+          <div class="actions">
+            ${this.actions.map(action => {
+              const text = this.layout === 'phone' && action.short !== undefined ? action.short : action.label;
+              return html`
+                <button type="button" class="action ${action.tone === 'act' ? 'act' : ''}" aria-label=${action.label}
+                  @click=${() => this._fire('pv-module-action', { id: action.id })}>
+                  <span>${action.glyph ? html`<span class="glyph" aria-hidden="true">${action.glyph}</span>` : nothing}${text}</span>
+                </button>
+              `;
+            })}
+          </div>
+        ` : nothing}
         ${this.canOpenSettings ? html`
           <button type="button" class="gear" aria-label="Settings" title="Settings"
             @click=${this._openSettings}>
```

`custom_components/planavista/frontend/src/shell/pv-parent-strip.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts b/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
index fe2b416..c8dc374 100644
--- a/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
+++ b/custom_components/planavista/frontend/src/shell/pv-parent-strip.ts
@@ -4,6 +4,7 @@ import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../utils/define';
 import { buttonStyles } from '../styles/shared';
 import { Member } from '../core/household';
+import type { ModuleAction } from '../core/module-registry';
 import '../core/pv-member-avatar';
 import '../core/pv-session-ring';
 
@@ -12,11 +13,14 @@ import '../core/pv-session-ring';
  * Lock (spec 9.4). It takes on the parent's color and picture.
  *
  * @fires pv-lock - Lock was tapped
+ * @fires pv-strip-action - { id } of a module's button (+ Add chore)
  */
 export class PvParentStrip extends LitElement {
   @property({ attribute: false }) member?: Member;
   @property({ attribute: false }) hass?: HomeAssistant;
   @property({ type: Number }) endsAt = 0;
+  /** The module's buttons, such as + Add chore. */
+  @property({ attribute: false }) actions: ModuleAction[] = [];
 
   static styles = [
     buttonStyles,
@@ -52,10 +56,15 @@ export class PvParentStrip extends LitElement {
         color: var(--pv-text-secondary, #6B7280);
       }
 
-      .lock {
+      .lock,
+      .action {
         min-width: 48px;
         min-height: 48px;
       }
+
+      .action {
+        font-weight: 650;
+      }
     `,
   ];
 
@@ -67,11 +76,20 @@ export class PvParentStrip extends LitElement {
         <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
         <span class="who">${member.name} <span class="mode">· parent mode</span></span>
         <pv-session-ring .endsAt=${this.endsAt} color=${member.color}></pv-session-ring>
+        ${this.actions.map(action => html`
+          <button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._action(action.id)}>
+            ${action.glyph ? `${action.glyph} ` : ''}${action.label}
+          </button>
+        `)}
         <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
       </div>
     `;
   }
 
+  private _action(id: string): void {
+    this.dispatchEvent(new CustomEvent('pv-strip-action', { detail: { id }, bubbles: true, composed: true }));
+  }
+
   private _lock(): void {
     this.dispatchEvent(new CustomEvent('pv-lock', { bubbles: true, composed: true }));
   }
```

- [ ] **Step 5: Register the Chores module with its states.**

`custom_components/planavista/frontend/src/modules/chores/chores-glance.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts b/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
index 13f9ce9..372cceb 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-glance.ts
@@ -40,10 +40,10 @@ export function choresBarActions(board: Board | null, view: HouseholdView | null
   const actions: ModuleAction[] = [];
   const waiting = board.requests.length;
   if (waiting > 0 && mayEverReview(view)) {
-    actions.push({ id: 'inbox', label: `${waiting} waiting for OK`, glyph: '⏳', tone: 'act' });
+    actions.push({ id: 'inbox', label: `${waiting} waiting for OK`, short: String(waiting), glyph: '⏳', tone: 'act' });
   }
   const access = parentAccess(view, session);
-  if (access !== 'no' && !session?.parent) actions.push({ id: 'add', label: 'Add chore', glyph: '+' });
+  if (access !== 'no' && !session?.parent) actions.push({ id: 'add', label: 'Add chore', short: '', glyph: '+' });
   return actions;
 }
 
```

`custom_components/planavista/frontend/src/modules/chores/chores-service.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-service.ts b/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
index 3525b14..5c3be56 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-service.ts
@@ -138,7 +138,7 @@ export class ChoresService implements ModuleService {
   }
 
   requestUpdate(): void {
-    this._host.requestUpdate();
+    this._host.serviceChanged();
   }
 
   private _follow(): void {
```

`custom_components/planavista/frontend/src/modules/chores/chores-styles.ts` (new):

```ts
import { css } from 'lit';

/**
 * Styles every chores screen shares: badges in the status map's color jobs
 * (spec 11.3, 11.4), section headings, designed states (spec 11.6), and the
 * neutral skeleton (no spinners).
 */
export const choresStyles = css`
  :host {
    --pv-chores-gap: 12px;
    font-family: var(--pv-font-family, system-ui, sans-serif);
    color: var(--pv-text, #1A1B1E);
  }

  .heading {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-weight: 800;
    letter-spacing: 0.1px;
  }

  .num {
    font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
    font-variant-numeric: tabular-nums;
  }

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

  .section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 14px 4px 6px;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--pv-text-muted, #8E949C);
  }

  .section-head .right {
    font-weight: 700;
  }

  .meta {
    color: var(--pv-text-secondary, #5F6670);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
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

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts` (new):

```ts
import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
import { ChoresService, choresEnabled } from './chores-service';

/** The views the Chores module offers in the bar (spec 12.2). */
export const CHORES_VIEWS = [
  { id: 'board', label: 'Board' },
  { id: 'week', label: 'Week' },
  { id: 'my_day', label: 'My day' },
  { id: 'rewards', label: 'Rewards' },
];

/** The Chores module, as the shell sees it. It shows once the household turns chores on. */
export const choresModule: ModuleDefinition = {
  id: 'chores',
  label: 'Chores',
  icon: 'mdi:checkbox-marked-circle-outline',
  tag: 'pv-chores-module',
  order: 20,
  views: CHORES_VIEWS,
  // Chores arrive over their own subscription, not through entity states.
  watchedEntities: () => [],
  enabled: ctx => choresEnabled(ctx),
  service: host => new ChoresService(host),
};

/** Add Chores to the module registry. */
export function registerChoresModule(modules: ModuleRegistry = moduleRegistry): void {
  modules.register(choresModule);
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { HouseholdView } from '../../core/household';
import type { ModuleElement, ModuleService, OpenTarget } from '../../core/module-registry';
import type { PinGate } from '../../core/pin-gate';
import type { Session } from '../../core/session';
import type { Toast } from '../../core/pv-toast';
import { parentAccess } from '../../core/access';
import type { Mode } from '../../styles/theme-pairs';
import type { DisplayConfig, PlanaVistaData } from '../../types';
import { choresStyles } from './chores-styles';
import type { ChoresService } from './chores-service';
import '../../core/pv-toast';
import '../../shell/pv-notice-sheet';

/** A sheet the chores screens show over themselves. */
type ChoresSheet = { kind: 'start_over' } | { kind: 'no_pin'; heading: string };

/**
 * pv-chores-module: the Chores module (spec 13). It shows the view the bar
 * picked (Board, Week, My day, Rewards) over the card-wide chores feed, its
 * sheets, and its toasts, and asks the card for PINs when a change needs one.
 * The engine decides everything; this only draws the feed and sends changes.
 *
 * @fires pv-overlay-change - { open } when one of its sheets opens or closes
 * @fires pv-open - a module and view to go to
 */
export class PvChoresModule extends LitElement implements ModuleElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  @property({ attribute: false }) display!: DisplayConfig;
  @property({ attribute: false }) mode: Mode = 'light';
  @property({ attribute: false }) view: string | undefined;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) session: Session | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  /** Bumped by the card whenever the chores feed has news. */
  @property({ attribute: false }) revision = 0;
  @property({ attribute: false }) pinGate?: PinGate;
  @property({ attribute: false }) openTarget: OpenTarget | null = null;

  @state() protected _sheet: ChoresSheet | null = null;
  @state() protected _toast: Toast | null = null;
  private _overlayOpen = false;

  static styles = [
    buttonStyles,
    choresStyles,
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        background: var(--pv-bg, #F8F8F6);
      }

      .view {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .skeleton {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 12px;
        padding: 12px;
      }

      .skeleton .col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .skeleton .who {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }
    `,
  ];

  /** The chores feed and queue, kept by the card for every module. */
  protected get service(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  /** The bar's and the parent-mode strip's buttons. */
  moduleAction(_id: string): void {
    // Waiting for OK and Add chore arrive with their sheets.
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const notices = this.service?.takeNotices() ?? [];
    const last = notices[notices.length - 1];
    if (last) this._toast = { id: last.id, text: last.text, tone: 'bad', ms: 7000 };
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const open = this._sheet !== null;
    if (open !== this._overlayOpen) {
      this._overlayOpen = open;
      this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open }, bubbles: true, composed: true }));
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._overlayOpen) {
      this._overlayOpen = false;
      this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open: false }, bubbles: true, composed: true }));
    }
  }

  render() {
    const service = this.service;
    if (!service) return nothing;
    return html`
      ${this._renderContent(service)}
      <pv-toast .toast=${this._toast} @pv-toast-gone=${() => { this._toast = null; }}
        @pv-toast-action=${this._onToastAction}></pv-toast>
      ${this._renderSheet()}
    `;
  }

  private _renderContent(service: ChoresService) {
    const feed = service.feed;
    if (!feed) {
      return service.status === 'offline' ? this._unreachable(service) : this._skeleton();
    }
    if (feed.state === 'needs_a_look') return this._needsALook();
    if (feed.state === 'newer') {
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">⬆️</div>
          <h2>Update PlanaVista to use chores</h2>
          <p>These chores were saved by a newer PlanaVista. Update it in HACS to use them on this screen.</p>
        </div>
      `;
    }
    if (feed.state === 'off' || !feed.board) {
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">🧺</div>
          <h2>Chores are off</h2>
          <p>A parent can turn them on in Settings.</p>
        </div>
      `;
    }
    return html`
      ${service.status === 'offline' ? html`
        <div class="banner" role="status">
          <span class="text"><strong>Can't reach Home Assistant.</strong> Your check-offs aren't lost. We'll keep trying.</span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => service.retry()}>Try again</button>
        </div>
      ` : nothing}
      ${feed.save_failed ? html`
        <div class="banner" role="status">
          <span class="text"><strong>Couldn't save.</strong> Home Assistant will keep trying. If this stays, check its storage in Settings, System, Repairs.</span>
        </div>
      ` : nothing}
      <div class="view">${this.renderView()}</div>
    `;
  }

  /** The view the bar picked. */
  protected renderView(): unknown {
    return nothing;
  }

  private _skeleton() {
    const columns = Math.max(1, Math.min(4, this.household?.members.length ?? 3));
    return html`
      <div class="skeleton" aria-busy="true" aria-label="Loading chores">
        ${Array.from({ length: columns }, () => html`
          <div class="col">
            <div class="who"><div class="bone round" style="width:58px;height:58px"></div>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                <div class="bone" style="width:60%;height:16px"></div><div class="bone" style="width:80%;height:12px"></div>
              </div>
            </div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px"></div>
            <div class="bone" style="height:44px;width:85%"></div>
          </div>
        `)}
      </div>
    `;
  }

  private _unreachable(service: ChoresService) {
    return html`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">📡</div>
        <h2>Can't reach Home Assistant</h2>
        <p>Your check-offs aren't lost. We'll keep trying.</p>
        <div class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => service.retry()}>Try again</button>
        </div>
      </div>
    `;
  }

  private _needsALook() {
    const access = parentAccess(this.household, this.session);
    return html`
      <div class="state" role="alert">
        <div class="art" aria-hidden="true">🧰</div>
        <h2>Chores need a look</h2>
        <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
          restore a Home Assistant backup from before it went missing (Settings, System, Backups). Or start over
          with no chores.</p>
        ${access !== 'no' ? html`
          <div class="buttons">
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _askStartOver = async (): Promise<void> => {
    if (await this.asParent("Who's starting over?")) this._sheet = { kind: 'start_over' };
  };

  /**
   * Make sure a parent-level change may go ahead on this screen: straight
   * away for a parent's own login, after a parent's PIN on a shared screen.
   */
  protected async asParent(heading: string): Promise<boolean> {
    const access = parentAccess(this.household, this.session);
    if (access === 'yes') return true;
    if (access === 'no_pin') {
      this._sheet = { kind: 'no_pin', heading: 'This needs a parent\'s PIN' };
      return false;
    }
    if (access === 'no' || !this.pinGate || !this.household) return false;
    const parents = this.household.members.filter(m => m.parent && m.has_pin);
    return this.pinGate.ask(parents, heading);
  }

  protected showToast(toast: Toast): void {
    this._toast = toast;
  }

  protected onToastAction(_toast: Toast, _action: string): void {
    // Undo and Someone else did it? arrive with the board.
  }

  private _onToastAction = (event: CustomEvent<{ toast: Toast; action: string }>): void => {
    this._toast = null;
    this.onToastAction(event.detail.toast, event.detail.action);
  };

  protected renderSheet(): unknown {
    return nothing;
  }

  private _renderSheet() {
    const sheet = this._sheet;
    if (!sheet) return this.renderSheet();
    if (sheet.kind === 'no_pin') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading=${sheet.heading}
          body="On a shared screen, a parent's PIN allows this, and no parent has one yet. A parent can set one in Settings, PINs and parent mode, from their own Home Assistant login."
          .actions=${[{ id: 'ok', label: 'OK', kind: 'primary' }]}
          @pv-sheet-action=${() => { this._sheet = null; }}></pv-notice-sheet>
      `;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading="Start over with no chores?"
        body="Chores, rewards, stars, and their history are emptied. People, PINs, and calendars stay as they are."
        .actions=${[{ id: 'start_over', label: 'Start over', kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
        @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => this._onStartOver(e.detail.id)}></pv-notice-sheet>
    `;
  }

  private async _onStartOver(id: string): Promise<void> {
    this._sheet = null;
    if (id !== 'start_over') return;
    try {
      await this.service?.api.startOver();
      this.showToast({ id: `start-over-${Date.now()}`, text: 'Chores started over.' });
    } catch {
      this.showToast({ id: `start-over-${Date.now()}`, text: 'Couldn\'t start over. Try again.', tone: 'bad' });
    }
  }
}

defineElement('pv-chores-module', PvChoresModule);
```

`custom_components/planavista/frontend/src/modules/chores/index.ts` (new):

```ts
// The Chores module: its elements, and its entry in the module registry.
import './pv-chores-module';
import { registerChoresModule } from './definition';

registerChoresModule();
```

`custom_components/planavista/frontend/src/main.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/main.ts b/custom_components/planavista/frontend/src/main.ts
index 5112a70..062db3c 100644
--- a/custom_components/planavista/frontend/src/main.ts
+++ b/custom_components/planavista/frontend/src/main.ts
@@ -1,6 +1,7 @@
 // PlanaVista: the single entry point. Modules register themselves first,
 // then the card that hosts them.
 import './modules/calendar';
+import './modules/chores';
 import './shell/planavista-card';
 import { version } from '../package.json';
 import { registerCardPicker } from './shell/card-picker';
```

- [ ] **Step 6: Run it again.** Same command. Expected: `3 passed`.
- [ ] **Step 7: Run the whole frontend suite.** Expected: tsc clean, `505 passed`; the copy check passes.
- [ ] **Step 8: Commit.** Message `feat(card): chores in the card, with glance chips, bar buttons, the PIN gate, and the ring` with the trailers.

---

### Task 5: The board, with hold to complete

Spec 13.1 (columns by person with their ring, the line, Next on calendar; bands with Now highlighted and past bands as credit; This week; Done today; ring closed; young children's picture tiles and sticker strip; the evening check), 13.2 (two zones: hold the circle, tap the row; picture tiles hold as a whole), 11.5 (the ring fills under the finger; check, strike-through, "+1 ★" flies, rows glide into Done today; celebrations once per ring and when every ring closes; haptics; the optional sound), and 12.3 (columns while each can be 240 px wide, then an even grid; phone: one person at a time with a swipe).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/board-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/effects.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts`
- Modify: `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/board-derive.test.ts`

**Interfaces:**
- Consumes: Tasks 2 to 4.
- Produces: `memberColor(member, mode)`; `RowModel`, `ColumnEntry`, `ColumnModel`, `DeriveContext`, `BANDS`, `BAND_NAMES`, `columnFor`, `boardColumns`, `groupKey`, `doneToday`, `bandOf`, `bandState`, `estimateText`, `eveningCheck`, `boardRows`, `everyRingClosed`; `pv-chore-item` and `pv-chore-tile` (events `pv-hold-done`, `pv-hold-undo` with `HoldDetail { row, settle(accepted), from }`, `pv-hint`, `pv-row-options`), `pictureOf(icon)`; `pv-chores-column` (`flyStars`, event `pv-member-open`); `pv-chores-board` (`flyStars`); `pv-chores-people-sheet` (event `pv-person-pick`); the module's `asMember(memberId, heading)`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/board-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  bandState,
  boardColumns,
  boardRows,
  columnFor,
  doneToday,
  estimateText,
  eveningCheck,
  everyRingClosed,
  type DeriveContext,
} from '../src/modules/chores/board-derive';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, NOW, TODAY, activity, board, column, item } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;
const WEEK = { section: 'week' as const, window: 'week' as const, planned: null, due_day: '2026-10-18', counted: false };

function ctx(fields: Partial<DeriveContext> = {}): DeriveContext {
  return {
    today: TODAY,
    now: NOW,
    events: [],
    timeFormat: '12h',
    activities: new Map([['laundry', activity('laundry', { label: '2 loads' })]]),
    members: MEMBERS,
    ...fields,
  };
}

const keysOf = (entries: ReturnType<typeof columnFor>['entries']) =>
  entries.map(e => (e.kind === 'row' ? `${e.zone}:${e.row.key.split('|')[0]}` : `${e.kind}:${e.text}`));

describe('columnFor (spec 13.1)', () => {
  it('puts Now first, then later bands, This week, Done today, and past bands as credit', () => {
    const casey_items = [
      item('cat_care|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: { id: 'c', done_by: 'casey', by: 'casey', at: '2026-10-13T07:30:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', due_day: '2026-10-18' }),
      item('cat_care|casey|day:2026-10-13|1', { band: 'evening', credit_minutes: 15, stars: 1 }),
      item('fix_it|casey|once|0', { band: null, dated: true, due_day: '2026-10-17', window: 'once', counted: false }),
      item('clean_the_bathroom|casey|week:2026-10-12|0', { ...WEEK, status: 'pending', credit_minutes: 60 }),
      item('yard_work|casey|week:2026-10-12|0', { ...WEEK, status: 'sent_back', note: 'edges', credit_minutes: 60 }),
    ];
    const col = columnFor(casey, column(casey_items, { stars: 23, streak: 5 }), board({ casey: column(casey_items) }), ctx());
    expect(keysOf(col.entries)).toEqual([
      'head:Now · afternoon', 'now:fix_it',
      'head:Later · evening', 'later:take_out_the_trash', 'later:cat_care',
      'head:This week', 'week:clean_the_bathroom', 'week:yard_work',
      'credit:Morning · 1 done',
    ]);
    expect(col.line).toBe('1 of 3 today · ★ 23 · 🔥 5 days');
    expect(col.ring).toEqual({ progress: 1 / 3, closed: false, label: 'Casey, 1 of 3 done today' });
    const rows = col.entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(rows.find(r => r.key.startsWith('fix_it'))?.badge).toEqual({ words: 'Due Sat', tone: 'neutral' });
    expect(rows.find(r => r.key.startsWith('yard'))?.badge?.words).toBe('Sent back: edges');
    expect(rows.find(r => r.key.startsWith('cat_care'))?.meta).toBe('15 min · ★ 1');
  });

  it('shows a floating chore once, with its check-offs this week', () => {
    const items = [
      item('yard_work|casey|week:2026-10-12|0', { ...WEEK, status: 'done', credit_minutes: 20, completion: { id: 'a', done_by: 'casey', by: 'casey', at: '2026-10-12T17:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('yard_work|casey|week:2026-10-12|1', { ...WEEK, credit_minutes: 20 }),
      item('yard_work|casey|week:2026-10-12|2', { ...WEEK, credit_minutes: 20 }),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    const rows = col.entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ key: 'yard_work|casey|week:2026-10-12|1', meta: '1 h · 1 of 3', group: { done: 1, total: 3 } });
  });

  it('shows a one-time chore\'s sessions as one row, in today\'s band', () => {
    const garage = (n: number, fields = {}) => item(`clean_out_the_garage|casey|once|${n}`, {
      band: null, window: 'once', period: 'once', dated: true, due_day: '2026-10-18', counted: false, credit_minutes: 120, ...fields,
    });
    const items = [
      garage(0, { status: 'done', completion: { id: 'g', done_by: 'casey', by: 'casey', at: '2026-10-12T15:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 8 } }),
      garage(1),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    expect(keysOf(col.entries)).toEqual(['head:Now · afternoon', 'now:clean_out_the_garage']);
    const [, entry] = col.entries;
    expect(entry).toMatchObject({ row: { key: 'clean_out_the_garage|casey|once|1', meta: '4 h · 1 of 2', badge: { words: 'Due Sun' } } });
  });

  it('lists what was done today in Done today, with the time and who did it', () => {
    const laundry = item('laundry|blair|week:2026-10-12|0', {
      section: 'week', window: 'week', planned: '2026-10-12', from: '2026-10-12', status: 'done', credit_minutes: 30,
      completion: { id: 'l', done_by: 'alex', by: 'alex', at: '2026-10-13T15:40:00-05:00', source: 'tablet', state: 'done', review: null, stars: 2 },
    });
    const col = columnFor(blair, column([laundry]), board({ blair: column([laundry]) }), ctx());
    const [head, row] = col.entries;
    expect(head).toMatchObject({ kind: 'head', text: 'Done today' });
    expect(row).toMatchObject({ zone: 'done', row: { doneAt: '3:40', doneBy: 'Alex', label: '2 loads' } });
  });

  it('keeps a check-off from an earlier day out of Done today', () => {
    const monday = item('laundry|blair|week:2026-10-12|0', {
      section: 'week', window: 'week', planned: '2026-10-12', from: '2026-10-12', status: 'done',
      completion: { id: 'l', done_by: 'blair', by: 'blair', at: '2026-10-12T10:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 2 },
    });
    expect(columnFor(blair, column([monday]), board({ blair: column([monday]) }), ctx()).entries).toEqual([]);
  });

  it('puts overdue items first and says a past band still has work', () => {
    const items = [
      item('cat_care|casey|day:2026-10-13|0', { band: 'morning' }),
      item('rake|casey|rep:2026-10-10|0', { section: 'overdue', overdue_since: '2026-10-12', window: 'day' }),
    ];
    const col = columnFor(casey, column(items), board({ casey: column(items) }), ctx());
    expect(keysOf(col.entries)).toEqual(['head:Overdue', 'overdue:rake', 'head:Morning · 1 left', 'past:cat_care']);
    expect(col.left).toBe(2);
  });

  it('closes the ring when everything due is done or waiting for OK', () => {
    const items = [
      item('a|dana|day:2026-10-13|0', { status: 'done', completion: { id: 'x', done_by: 'dana', by: 'dana', at: '2026-10-13T08:00:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
      item('b|dana|day:2026-10-13|0', { status: 'pending' }),
    ];
    const col = columnFor(dana, column(items, { stars: 12 }), board({ dana: column(items) }), ctx());
    expect(col.ring).toMatchObject({ progress: 1, closed: true, label: 'Dana, ring closed for today' });
    expect(col.pictures).toBe(true);
    expect(col.line).toBe('2 of 2 today · ★ 12');
  });

  it('says when nothing is due, and leaves stars out for someone who does not earn them', () => {
    const col = columnFor(alex, column([]), board({ alex: column([]) }), ctx());
    expect(col.line).toBe('Nothing due today');
    expect(col.empty).toBe(true);
  });

  it('names their next event, and says when they are free until then', () => {
    const soccer: DayEvent = {
      title: 'Soccer', start: new Date(2026, 9, 13, 17, 30), end: new Date(2026, 9, 13, 19), calendar: 'calendar.casey', member: 'casey',
    };
    const col = columnFor(casey, column([]), board({ casey: column([]) }), ctx({ events: [soccer] }));
    expect(col.next).toBe('Next on calendar: Soccer at 5:30 · free until then');
  });
});

describe('boardColumns', () => {
  it('keeps board order and leaves out anyone the board has no column for', () => {
    const b = board({ dana: column([]), alex: column([]) });
    expect(boardColumns(b, ctx()).map(c => c.member.id)).toEqual(['alex', 'dana']);
  });
});

describe('eveningCheck (spec 9.9)', () => {
  const items = [item('cat_care|casey|day:2026-10-13|1', { band: 'evening' }), item('trash|casey|week:2026-10-12|0', { band: 'evening' })];
  const fish = [item('fish|dana|day:2026-10-13|0')];
  const b = board({ casey: column(items), dana: column(fish) });
  const cols = boardColumns(b, ctx());

  it('stays quiet before the evening check time', () => {
    expect(eveningCheck(cols, b, NOW)).toBeNull();
  });

  it('names who still has chores at the evening check', () => {
    expect(eveningCheck(cols, b, new Date(2026, 9, 13, 19, 5))).toEqual({
      text: 'Evening check: Casey has 2 chores left and Dana has 1', members: ['casey', 'dana'],
    });
    expect(eveningCheck(cols, { ...b, settings: { ...b.settings, evening_check: null } }, new Date(2026, 9, 13, 19, 5))).toBeNull();
  });
});

describe('boardRows (spec 12.3)', () => {
  it('keeps people in columns while each can be 240 px wide', () => {
    expect(boardRows(4, 1256)).toEqual([4]);
    expect(boardRows(3, 776)).toEqual([3]);
  });

  it('wraps into an even grid, with a short last row', () => {
    expect(boardRows(4, 776)).toEqual([2, 2]);
    expect(boardRows(5, 776)).toEqual([3, 2]);
    expect(boardRows(6, 776)).toEqual([3, 3]);
    expect(boardRows(2, 200)).toEqual([1, 1]);
    expect(boardRows(0, 800)).toEqual([]);
  });
});

describe('small helpers', () => {
  it('orders bands', () => {
    expect(bandState('morning', 'afternoon')).toBe('past');
    expect(bandState('afternoon', 'afternoon')).toBe('now');
    expect(bandState('evening', 'afternoon')).toBe('later');
  });

  it('shows the estimate, with stars only for someone who earns them', () => {
    expect(estimateText(item('a|x|day:1|0', { credit_minutes: 30, stars: 2 }), true)).toBe('30 min · ★ 2');
    expect(estimateText(item('a|x|day:1|0', { credit_minutes: 30, stars: 2 }), false)).toBe('30 min');
  });

  it('tells a check-off of today\'s chore day from yesterday\'s, across the 3:00 AM line', () => {
    const b = board({});
    const at = (stamp: string) => item('a|x|day:1|0', { completion: { id: 'c', done_by: 'x', by: 'x', at: stamp, source: 'tablet', state: 'done', review: null, stars: 1 } });
    expect(doneToday(at('2026-10-13T02:59:00-05:00'), b)).toBe(false);
    expect(doneToday(at('2026-10-13T03:00:00-05:00'), b)).toBe(true);
    expect(doneToday(at('2026-10-14T02:30:00-05:00'), b)).toBe(true);
  });

  it('celebrates the family once every ring with something due is closed', () => {
    const doneItem = item('a|alex|day:1|0', { status: 'done' });
    const closed = boardColumns(board({ alex: column([doneItem]), blair: column([]) }), ctx());
    expect(everyRingClosed(closed)).toBe(true);
    expect(everyRingClosed(boardColumns(board({ alex: column([item('a|alex|day:1|0')]) }), ctx()))).toBe(false);
    expect(everyRingClosed(boardColumns(board({ blair: column([]) }), ctx()))).toBe(false);
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/board-derive.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/board-derive`.

- [ ] **Step 3: Write the board's rules.**

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index 1904903..6e9201b 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -1,5 +1,7 @@
 /** Household members and accounts as the card receives them (planavista/household/subscribe). */
 
+import { matchedInk } from './color';
+
 export type AgeGroup = 'young_child' | 'older_child' | 'teen' | 'adult';
 export type Role = 'parent' | AgeGroup;
 export type Picture = { initial: true } | { emoji: string } | { person: true };
@@ -177,3 +179,12 @@ export function pictureOf(
   }
   return { kind: 'initial', text: initialOf(member.name) };
 }
+
+/**
+ * Someone's color for the mode (spec 12.4): as chosen in light; in dark,
+ * the dark color they picked, or one Matched from it (brighter, same hue).
+ */
+export function memberColor(member: Pick<Member, 'color' | 'color_dark'>, mode: 'light' | 'dark'): string {
+  if (mode === 'light') return member.color;
+  return member.color_dark || matchedInk(member.color);
+}
```

`custom_components/planavista/frontend/src/modules/chores/board-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import { BadgeContext, StatusBadge, itemBadge, minutesText, ringLabel } from '../../core/status-map';
import type { Activity, Band, Board, BoardMember, ItemView } from './chores-types';
import { DayEvent, clockTime, nextOnCalendar } from './calendar-ties';

/** The bands of a chore day, in order (spec 8.1). */
export const BANDS: Band[] = ['morning', 'afternoon', 'evening'];
export const BAND_NAMES: Record<Band, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

/** One row on the board: an item, or a floating chore's check-offs this week ("1 of 3"). */
export interface RowModel {
  /** The occurrence a hold acts on (for a floating chore, its next open check-off). */
  key: string;
  item: ItemView;
  name: string;
  icon: string | null;
  label: string | null;
  badge: StatusBadge | null;
  /** The estimate and stars, or how far a floating chore has come ("1.5 h · 0 of 1"). */
  meta: string;
  state: ItemView['status'];
  /** A floating chore's check-offs this week. */
  group?: { done: number; total: number };
  /** When it was checked off today ("4:20"), and by someone other than its owner. */
  doneAt?: string;
  doneBy?: string | null;
}

export type BandState = 'past' | 'now' | 'later';

/** A list entry of a column, in order: section headings and rows share one list so rows can glide between sections. */
export type ColumnEntry =
  | { kind: 'head'; key: string; text: string; right?: string; tone: 'now' | 'later' | 'past' | 'plain' }
  | { kind: 'row'; key: string; row: RowModel; zone: 'now' | 'later' | 'past' | 'overdue' | 'week' | 'done' }
  | { kind: 'credit'; key: string; text: string };

export interface ColumnModel {
  member: Member;
  entry: BoardMember;
  ring: { progress: number; closed: boolean; label: string };
  /** "1 of 3 today · ★ 23 · 🔥 5 days". */
  line: string;
  /** The same line in parts; the stars part is where "+1 ★" flies to. */
  parts: Array<{ kind: 'count' | 'stars' | 'streak'; text: string }>;
  /** "Next on calendar: Soccer at 5:30 · free until then". */
  next: string | null;
  away: { note: string | null } | null;
  /** Picture tiles (young children, spec 7.2). */
  pictures: boolean;
  entries: ColumnEntry[];
  /** Open check-offs still due today, for the evening check. */
  left: number;
  /** Nothing at all on their board today. */
  empty: boolean;
}

export interface DeriveContext {
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  now: Date;
  events: DayEvent[];
  timeFormat: '12h' | '24h';
  activities: Map<string, Activity>;
  members: Member[];
}

const OPEN = new Set(['open', 'sent_back']);

/** Whether a check-off happened within today's chore day. */
export function doneToday(item: ItemView, board: Pick<Board, 'day'>): boolean {
  const at = item.completion?.at;
  if (!at) return false;
  const t = new Date(at).getTime();
  return t >= new Date(board.day.start).getTime() && t < new Date(board.day.end).getTime();
}

/** The band an item belongs to now: its own, or the current one for items without one (spec 8.4). */
export function bandOf(item: ItemView, current: Band): Band {
  return item.band ?? current;
}

export function bandState(band: Band, current: Band): BandState {
  const a = BANDS.indexOf(band);
  const b = BANDS.indexOf(current);
  return a < b ? 'past' : a === b ? 'now' : 'later';
}

/** The estimate, and stars for someone who earns them ("15 min · ★ 1"). */
export function estimateText(item: ItemView, earnsStars: boolean): string {
  const time = minutesText(item.credit_minutes);
  return earnsStars && item.stars > 0 ? `${time} · ★ ${item.stars}` : time;
}

function rowFor(item: ItemView, ctx: DeriveContext, board: Board, earnsStars: boolean, extra: Partial<RowModel> = {}): RowModel {
  const activity = ctx.activities.get(item.chore);
  const remaining = extra.group ? extra.group.total - extra.group.done : 1;
  const badgeCtx: BadgeContext = { today: ctx.today, daysLeft: board.week.days_left, remaining };
  let doneAt: string | undefined;
  let doneBy: string | null | undefined;
  if (item.completion && (item.status === 'done' || item.status === 'pending')) {
    doneAt = clockTime(new Date(item.completion.at), ctx.timeFormat);
    const by = item.completion.done_by;
    doneBy = by && by !== item.member ? ctx.members.find(m => m.id === by)?.name ?? by : null;
  }
  const meta = item.window === 'month' ? 'this month' : estimateText(item, earnsStars);
  return {
    key: item.key,
    item,
    name: item.name,
    icon: item.icon,
    label: activity?.label ?? null,
    badge: itemBadge(item, badgeCtx),
    meta,
    state: item.status,
    doneAt,
    doneBy,
    ...extra,
  };
}

/** A floating chore (weekly, no days) is one row however many check-offs it has this week. */
function isFloating(item: ItemView): boolean {
  return item.section === 'week' && item.window === 'week' && !item.planned && !item.from && !item.dated;
}

/**
 * Check-offs that show as one row: a floating chore's for the week, and a
 * one-time chore's sessions ("Clean out the garage · 1 of 2").
 */
export function groupKey(item: ItemView): string | null {
  if (item.section === 'overdue') return null;
  if (isFloating(item) || (item.window === 'once' && item.period === 'once')) return `${item.section}|${item.chore}|${item.period}`;
  return null;
}

/** One person's column (spec 13.1): bands with Now highlighted, This week, Done today, and past bands as credit. */
export function columnFor(member: Member, entry: BoardMember, board: Board, ctx: DeriveContext): ColumnModel {
  const current = board.band;
  const earnsStars = !!member.stars;
  const entries: ColumnEntry[] = [];
  const items = entry.items;
  const done: RowModel[] = [];
  const bandRows: Record<Band, RowModel[]> = { morning: [], afternoon: [], evening: [] };
  const bandDone: Record<Band, number> = { morning: 0, afternoon: 0, evening: 0 };
  const overdue: RowModel[] = [];
  const week: RowModel[] = [];
  const groups = new Map<string, ItemView[]>();

  for (const item of items) {
    const group = groupKey(item);
    if (group) {
      groups.set(group, [...(groups.get(group) ?? []), item]);
      continue;
    }
    if (item.section === 'overdue') {
      if (OPEN.has(item.status) || item.status === 'pending') overdue.push(rowFor(item, ctx, board, earnsStars));
      else if (item.status === 'done' && doneToday(item, board)) done.push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    if (item.section === 'today') {
      const band = bandOf(item, current);
      if (item.status === 'done') {
        if (bandState(band, current) === 'past') bandDone[band] += 1;
        else done.push(rowFor(item, ctx, board, earnsStars));
        continue;
      }
      if (item.status === 'excused' || item.status === 'away') continue;
      bandRows[band].push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    // This week.
    if (item.status === 'done') {
      if (doneToday(item, board)) done.push(rowFor(item, ctx, board, earnsStars));
      continue;
    }
    if (item.status === 'excused' || item.status === 'away') continue;
    week.push(rowFor(item, ctx, board, earnsStars));
  }

  for (const [, list] of groups) {
    const live = list.filter(i => i.status !== 'excused' && i.status !== 'away');
    const total = live.length;
    const credited = live.filter(i => i.status === 'done' || i.status === 'pending').length;
    const today = list[0].section === 'today';
    for (const item of live) {
      if (item.status !== 'done' || !doneToday(item, board)) continue;
      const band = bandOf(item, current);
      if (today && bandState(band, current) === 'past') bandDone[band] += 1;
      else done.push(rowFor(item, ctx, board, earnsStars));
    }
    const next = live.find(i => OPEN.has(i.status)) ?? live.find(i => i.status === 'pending');
    if (!next) continue;
    const group = { done: credited, total };
    const time = minutesText(live.reduce((sum, i) => sum + i.credit_minutes, 0));
    const row = rowFor(next, ctx, board, earnsStars, { group });
    row.meta = total > 1 || next.window === 'week' ? `${time} · ${credited} of ${total}` : row.meta;
    if (today) bandRows[bandOf(next, current)].push(row);
    else week.push(row);
  }

  if (overdue.length) {
    entries.push({ kind: 'head', key: 'head:overdue', text: 'Overdue', tone: 'plain' });
    for (const row of overdue) entries.push({ kind: 'row', key: row.key, row, zone: 'overdue' });
  }
  const credits: ColumnEntry[] = [];
  for (const band of BANDS) {
    const state = bandState(band, current);
    const rows = bandRows[band];
    if (state === 'past') {
      if (rows.length === 0) {
        if (bandDone[band] > 0) credits.push({ kind: 'credit', key: `credit:${band}`, text: `${BAND_NAMES[band]} · ${bandDone[band]} done` });
        continue;
      }
      const open = rows.filter(r => OPEN.has(r.state)).length;
      const waiting = rows.length - open;
      const said = [
        open ? `${open} left` : '',
        waiting ? `${waiting} waiting for OK` : '',
        bandDone[band] ? `${bandDone[band]} done` : '',
      ].filter(Boolean);
      entries.push({ kind: 'head', key: `head:${band}`, tone: 'past', text: `${BAND_NAMES[band]} · ${said.join(', ')}` });
    } else if (rows.length === 0) {
      continue;
    } else {
      entries.push({
        kind: 'head', key: `head:${band}`, tone: state,
        text: `${state === 'now' ? 'Now' : 'Later'} · ${BAND_NAMES[band].toLowerCase()}`,
      });
    }
    for (const row of rows) entries.push({ kind: 'row', key: row.key, row, zone: state });
  }
  if (week.length) {
    const left = board.week.days_left;
    entries.push({ kind: 'head', key: 'head:week', text: 'This week', right: left === 1 ? 'Last day' : `${left} days left`, tone: 'plain' });
    for (const row of week) entries.push({ kind: 'row', key: row.key, row, zone: 'week' });
  }
  if (done.length) {
    entries.push({ kind: 'head', key: 'head:done', text: 'Done today', tone: 'plain' });
    for (const row of done) entries.push({ kind: 'row', key: row.key, row, zone: 'done' });
  }
  entries.push(...credits);

  const { due, done: doneCount, pending } = entry.today;
  const finished = doneCount + pending;
  const closed = due > 0 && finished >= due;
  const parts: ColumnModel['parts'] = [{ kind: 'count', text: due > 0 ? `${Math.min(finished, due)} of ${due} today` : 'Nothing due today' }];
  if (earnsStars) parts.push({ kind: 'stars', text: `★ ${entry.stars}` });
  if (entry.streak >= 2) parts.push({ kind: 'streak', text: `🔥 ${entry.streak} days` });
  const next = nextOnCalendar(ctx.events, member.id, ctx.now);
  const nextText = next
    ? `Next on calendar: ${next.event.title} at ${clockTime(next.event.start, ctx.timeFormat)}${next.freeUntil ? ' · free until then' : ''}`
    : null;
  const left = items.filter(i => i.counted && OPEN.has(i.status) && i.section !== 'week').length;
  return {
    member,
    entry,
    ring: { progress: due > 0 ? Math.min(1, finished / due) : 0, closed, label: ringLabel(member.name, Math.min(finished, due), due) },
    line: parts.map(p => p.text).join(' · '),
    parts,
    next: nextText,
    away: entry.away ? { note: entry.away.note ?? null } : null,
    pictures: member.age_group === 'young_child',
    entries,
    left,
    empty: items.length === 0,
  };
}

/** Everyone's columns, in board order (spec 12.3: the order never changes). */
export function boardColumns(board: Board, ctx: DeriveContext): ColumnModel[] {
  return ctx.members
    .filter(member => board.members[member.id])
    .map(member => columnFor(member, board.members[member.id], board, ctx));
}

/** "Evening check: Casey has 2 chores left" at the reminder time (spec 9.9), and whose columns pulse. */
export function eveningCheck(columns: ColumnModel[], board: Board, now: Date): { text: string; members: string[] } | null {
  const at = board.settings.evening_check;
  if (!at) return null;
  const [h, m] = at.split(':').map(Number);
  const start = new Date(board.day.start);
  const check = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h, m);
  if (check < start) check.setDate(check.getDate() + 1);
  if (now < check || now >= new Date(board.day.end)) return null;
  const behind = columns.filter(c => c.left > 0 && !c.away);
  if (behind.length === 0) return null;
  const said = behind.map((c, i) => (i === 0 ? `${c.member.name} has ${c.left} ${c.left === 1 ? 'chore' : 'chores'} left` : `${c.member.name} has ${c.left}`));
  const text = said.length === 1 ? said[0] : `${said.slice(0, -1).join(', ')} and ${said[said.length - 1]}`;
  return { text: `Evening check: ${text}`, members: behind.map(c => c.member.id) };
}

/** How many people each row holds (spec 12.3): columns while each can be 240 px wide, else an even grid. */
export function boardRows(count: number, width: number, gap = 12, minWidth = 240): number[] {
  if (count <= 0) return [];
  const fits = Math.max(1, Math.floor((width + gap) / (minWidth + gap)));
  if (count <= fits) return [count];
  const rows = Math.ceil(count / fits);
  const perRow = Math.ceil(count / rows);
  const result: number[] = [];
  let left = count;
  while (left > 0) {
    result.push(Math.min(perRow, left));
    left -= perRow;
  }
  return result;
}

/** Whether every ring that had something due today is closed (the family celebration). */
export function everyRingClosed(columns: ColumnModel[]): boolean {
  const due = columns.filter(c => c.entry.today.due > 0);
  return due.length > 0 && due.every(c => c.ring.closed);
}
```

- [ ] **Step 4: Write the items, the tiles, the columns, the board, and the people sheet.**

`custom_components/planavista/frontend/src/modules/chores/effects.ts` (new):

```ts
import { BOUNCY, SMOOTH, motionOf, springEasing } from '../../core/motion';

/**
 * The board's small moments (spec 11.5): every animation answers "what just
 * happened?". Only transform and opacity animate, so older wall tablets stay
 * smooth; with reduced motion, flights and glides become quick fades.
 */

/** A light tick on a check-off, a richer one when a ring closes (Android tablets; iOS browsers don't allow it). */
export function haptic(kind: 'tick' | 'ring'): void {
  try {
    navigator.vibrate?.(kind === 'tick' ? 12 : [18, 40, 28]);
  } catch {
    // Vibration is a nicety.
  }
}

let audio: AudioContext | null = null;

/** A soft two-note chime (the optional Sound setting); made, not loaded, so nothing leaves the house. */
export function chime(ring = false): void {
  try {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    audio ??= new Context();
    const now = audio.currentTime;
    const notes = ring ? [659.25, 783.99, 1046.5] : [783.99, 1046.5];
    notes.forEach((frequency, i) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(audio!.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {
    // Sound is a nicety.
  }
}

/** "+1 ★" flies from where the check happened to the star counter. */
export function flyStars(host: HTMLElement, layer: HTMLElement, from: DOMRect, to: DOMRect | null, stars: number): void {
  if (stars <= 0) return;
  const box = layer.getBoundingClientRect();
  const badge = document.createElement('span');
  badge.textContent = `+${stars} ★`;
  badge.setAttribute('aria-hidden', 'true');
  Object.assign(badge.style, {
    position: 'absolute',
    left: `${from.left - box.left + from.width / 2}px`,
    top: `${from.top - box.top}px`,
    transform: 'translate(-50%, 0)',
    font: '800 15px var(--pv-font-heading, ui-rounded, system-ui, sans-serif)',
    color: 'var(--pv-star, #8A6A00)',
    pointerEvents: 'none',
    zIndex: '30',
    whiteSpace: 'nowrap',
  });
  layer.appendChild(badge);
  const remove = () => badge.remove();
  if (motionOf(host) === 'reduced' || !to) {
    badge.animate({ opacity: [0, 1, 0] }, { duration: 700, easing: 'ease-out' }).finished.then(remove, remove);
    return;
  }
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top - from.top;
  const glide = springEasing(SMOOTH);
  badge.animate(
    [
      { transform: 'translate(-50%, 0) scale(0.8)', opacity: 0 },
      { transform: 'translate(-50%, -14px) scale(1.1)', opacity: 1, offset: 0.25 },
      { transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(0.7)`, opacity: 0.2 },
    ],
    { duration: Math.max(650, glide.duration), easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' },
  ).finished.then(remove, remove);
}

/** A number that changed gives a small bounce, so the eye finds it (the star counter, the ring's count). */
export function bump(element: Element | null | undefined, host: HTMLElement): void {
  if (!element || motionOf(host) === 'reduced') return;
  const pop = springEasing(BOUNCY);
  element.animate({ transform: ['scale(1)', 'scale(1.18)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
}

/** Where each keyed element is, before a change (for a FLIP glide). */
export function measure(elements: Iterable<HTMLElement>): Map<string, DOMRect> {
  const rects = new Map<string, DOMRect>();
  for (const el of elements) {
    const key = el.dataset.key;
    if (key) rects.set(key, el.getBoundingClientRect());
  }
  return rects;
}

/** Glide keyed elements from where they were to where they are now (rows moving into Done today). */
export function glide(elements: Iterable<HTMLElement>, before: Map<string, DOMRect>, host: HTMLElement): void {
  const reduced = motionOf(host) === 'reduced';
  const spring = springEasing(SMOOTH);
  for (const el of elements) {
    const key = el.dataset.key;
    const was = key ? before.get(key) : undefined;
    if (!was) continue;
    const now = el.getBoundingClientRect();
    const dx = was.left - now.left;
    const dy = was.top - now.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    if (reduced) {
      el.animate({ opacity: [0.4, 1] }, { duration: 160, easing: 'ease-out' });
      continue;
    }
    el.animate({ transform: [`translate(${dx}px, ${dy}px)`, 'translate(0, 0)'] }, { duration: spring.duration, easing: spring.easing });
  }
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts` (new):

```ts
import { LitElement, html, css, nothing, svg, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HoldGesture } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import { contrastText } from '../../core/color';
import { choresStyles } from './chores-styles';
import type { RowModel } from './board-derive';

/** What a finished hold asks of whoever handles it. */
export interface HoldDetail {
  row: RowModel;
  /** Say whether the check-off goes ahead (a PIN can be refused); false rewinds the circle. */
  settle(accepted: boolean): void;
  /** Where the circle is on screen, for the stars' flight. */
  from: DOMRect;
}

const CIRCLE = 26;
const R = 11.5;
const LENGTH = 2 * Math.PI * R;

/**
 * pv-chore-item: one chore, two zones (spec 13.2). The circle is the "do it"
 * zone: hold it to complete (a quick tap only shows a hint), or hold a done
 * one to uncheck it; Space or Enter does the same. While held, its ring
 * fills and a soft sweep crosses the row. The rest of the row is the
 * "about it" zone: a tap opens the options sheet.
 *
 * @fires pv-hold-done - HoldDetail, a hold finished on an open item
 * @fires pv-hold-undo - HoldDetail, a hold finished on a done item
 * @fires pv-hint - { row } a quick tap on the circle
 * @fires pv-row-options - { row } the rest of the row was tapped
 */
export class PvChoreItem extends LitElement {
  @property({ attribute: false }) row!: RowModel;
  /** The person's color (their ring, their checks). */
  @property({ type: String }) color = '#5B5BD6';
  /** The Now band's rows sit on a pale tint of it. */
  @property({ type: Boolean, reflect: true }) highlight = false;
  /** A panel narrower than about 300 px puts badges under the name (spec 12.3). */
  @property({ type: Boolean, reflect: true }) narrow = false;
  /** This screen may not change this person's items (another child's, on a child's own login). */
  @property({ type: Boolean }) locked = false;

  @state() private _fill = 0;
  /** A hold finished and waits for its answer: the circle stays full. */
  @state() private _held = false;
  private _frame = 0;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._fill = fill;
    },
    complete: () => this._finish(),
    rewind: fill => this._rewind(fill),
    tap: () => this._fire('pv-hint', { row: this.row }),
  });

  static styles = [
    choresStyles,
    css`
      :host {
        display: block;
        --tint: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 2px;
        min-height: 52px;
        padding-right: 10px;
        border-radius: 12px;
        overflow: hidden;
      }

      :host([highlight]) .row {
        background: var(--tint);
      }

      .sweep {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--member) 22%, transparent);
        transform-origin: left center;
        pointer-events: none;
      }

      .circle {
        position: relative;
        flex-shrink: 0;
        width: 48px;
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        touch-action: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
      }

      .circle[disabled] {
        cursor: default;
        opacity: 0.5;
      }

      .circle:focus-visible {
        outline: none;
      }

      .circle:focus-visible svg {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 3px;
        border-radius: 50%;
      }

      .circle svg {
        overflow: visible;
      }

      .about {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 52px;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      :host([narrow]) .about {
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 3px;
      }

      .about:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .name {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
        font-size: 1rem;
        line-height: 1.3;
      }

      :host([narrow]) .name {
        flex: none;
      }

      .name .text {
        position: relative;
      }

      .label {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
        margin-left: 4px;
      }

      .strike {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 1.5px;
        background: currentColor;
        transform-origin: left center;
        transform: scaleX(0);
      }

      :host([data-state='done']) .name {
        color: var(--pv-text-muted, #8E949C);
      }

      :host([data-state='done']) .strike {
        transform: scaleX(1);
      }

      .end {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .who {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .sparkles {
        position: absolute;
        left: 60px;
        top: 4px;
        pointer-events: none;
        color: var(--member);
        font-size: 11px;
        letter-spacing: 4px;
        opacity: 0;
      }
    `,
  ];

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('row')) {
      const before = changed.get('row') as RowModel | undefined;
      this.dataset.state = this.row.state;
      if (before && before.state !== this.row.state) {
        this._held = false;
        this._fill = 0;
        if (this.row.state === 'done' || this.row.state === 'pending') this._celebrate = true;
      }
    }
  }

  private _celebrate = false;

  protected updated(): void {
    if (!this._celebrate) return;
    this._celebrate = false;
    const reduced = motionOf(this) === 'reduced';
    const check = this.renderRoot.querySelector('.check');
    const mark = this.renderRoot.querySelector<SVGPathElement>('.mark');
    const strike = this.renderRoot.querySelector('.strike');
    if (reduced) {
      check?.animate({ opacity: [0, 1] }, { duration: 150 });
      return;
    }
    const pop = springEasing(BOUNCY);
    check?.animate({ transform: ['scale(0.55)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
    mark?.animate({ strokeDashoffset: [24, 0] }, { duration: 320, delay: 60, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)', fill: 'backwards' });
    strike?.animate({ transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 300, delay: 120, easing: 'ease-out', fill: 'backwards' });
    this.renderRoot.querySelector('.sparkles')?.animate(
      { opacity: [0, 1, 0], transform: ['translateY(4px)', 'translateY(-6px)'] },
      { duration: 700, easing: 'ease-out' },
    );
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
  }

  private get _done(): boolean {
    return this.row.state === 'done';
  }

  private get _holdable(): boolean {
    return !this.locked && (this.row.state === 'open' || this.row.state === 'sent_back' || this.row.state === 'done');
  }

  private _down = (event: PointerEvent): void => {
    if (!this._holdable || this._held || event.button > 0) return;
    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture keeps a drifting finger on the circle; without it the hold still works.
    }
    this._gesture.down(event.clientX, event.clientY, performance.now());
    const tick = (t: number) => {
      this._gesture.frame(t);
      if (this._gesture.holding) this._frame = requestAnimationFrame(tick);
    };
    this._frame = requestAnimationFrame(tick);
  };

  private _move = (event: PointerEvent): void => {
    this._gesture.move(event.clientX, event.clientY);
  };

  private _up = (): void => {
    cancelAnimationFrame(this._frame);
    this._gesture.up(performance.now());
  };

  private _cancel = (): void => {
    cancelAnimationFrame(this._frame);
    this._gesture.cancel();
  };

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!this._holdable || this._held) {
      this._fire('pv-hint', { row: this.row });
      return;
    }
    this._gesture.key(event.key);
  };

  private _finish(): void {
    this._held = true;
    this._fill = 1;
    const circle = this.renderRoot.querySelector('.circle')?.getBoundingClientRect() ?? new DOMRect();
    const detail: HoldDetail = {
      row: this.row,
      from: circle,
      settle: accepted => {
        if (!accepted) this._rewind(1);
      },
    };
    this._fire(this._done ? 'pv-hold-undo' : 'pv-hold-done', detail);
  }

  private _rewind(fill: number): void {
    this._held = false;
    if (fill <= 0 || motionOf(this) === 'reduced') {
      this._fill = 0;
      return;
    }
    // Let go early: the ring rewinds from where it got to.
    const start = performance.now();
    const ms = 220 * fill;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      this._fill = fill * (1 - k);
      if (k < 1 && !this._gesture.holding) this._frame = requestAnimationFrame(step);
    };
    this._frame = requestAnimationFrame(step);
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private _options = (): void => {
    this._fire('pv-row-options', { row: this.row });
  };

  private _context = (event: Event): void => {
    event.preventDefault();
    this._options();
  };

  render() {
    const row = this.row;
    if (!row) return nothing;
    const color = this.color;
    const state = row.state;
    const done = state === 'done';
    const pending = state === 'pending';
    const fill = this._held ? 1 : this._fill;
    const action = done ? `Hold to uncheck ${row.name}` : `Hold to complete ${row.name}`;
    const end = html`
      ${row.badge ? html`
        <span class="badge ${row.badge.tone}">${row.badge.glyph ? html`<span aria-hidden="true">${row.badge.glyph}</span>` : nothing}${row.badge.words}</span>
      ` : nothing}
      ${!row.badge && row.meta && !done ? html`<span class="meta">${row.meta}</span>` : nothing}
      ${done && row.doneAt ? html`<span class="meta">${row.doneBy ? `${row.doneBy} · ` : ''}${row.doneAt}</span>` : nothing}
    `;
    return html`
      <div class="row" style="--member:${color}">
        <div class="sweep" style="transform: scaleX(${done ? 0 : fill})"></div>
        <button class="circle" type="button" aria-label=${action} ?disabled=${this.locked}
          @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
          @pointercancel=${this._cancel} @lostpointercapture=${this._up} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
          <svg width=${CIRCLE} height=${CIRCLE} viewBox="0 0 26 26" aria-hidden="true">
            ${done ? svg`
              <g class="check" style="transform-origin: 13px 13px">
                <circle cx="13" cy="13" r="12.5" fill=${color}></circle>
                <path class="mark" d="M7.5 13.4l3.6 3.6 7.4-7.6" fill="none" stroke=${contrastText(color)} stroke-width="2.6"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="24"></path>
              </g>
              <circle cx="13" cy="13" r="15.5" fill="none" stroke=${color} stroke-width="2.4" stroke-linecap="round"
                stroke-dasharray=${2 * Math.PI * 15.5} stroke-dashoffset=${2 * Math.PI * 15.5 * (1 - fill)}
                transform="rotate(-90 13 13)" opacity=${fill > 0 ? 0.55 : 0}></circle>
            ` : svg`
              <circle cx="13" cy="13" r=${R} fill="none" stroke=${color} stroke-width="2.4"
                stroke-dasharray=${pending ? '3.2 3.2' : 'none'} opacity=${pending ? 0.9 : 1}></circle>
              ${pending ? svg`<text x="13" y="17.2" text-anchor="middle" font-size="11">⏳</text>` : nothing}
              <circle cx="13" cy="13" r=${R} fill="none" stroke=${color} stroke-width="3.4" stroke-linecap="round"
                stroke-dasharray=${LENGTH} stroke-dashoffset=${LENGTH * (1 - fill)}
                transform="rotate(-90 13 13)" opacity=${fill > 0 ? 1 : 0}></circle>
            `}
          </svg>
        </button>
        <button class="about" type="button" @click=${this._options} @contextmenu=${this._context}
          aria-label=${`${row.name}${row.badge ? `, ${row.badge.words}` : ''}. Options`}>
          <span class="name"><span class="text">${row.name}<span class="strike"></span></span>${row.label ? html`<span class="label">${row.label}</span>` : nothing}</span>
          <span class="end">${end}</span>
        </button>
        <span class="sparkles" aria-hidden="true">✦ ✧ ✦</span>
      </div>
    `;
  }
}

defineElement('pv-chore-item', PvChoreItem);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HoldGesture } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import { contrastText } from '../../core/color';
import '../../core/pv-ring';
import type { HoldDetail } from './pv-chore-item';
import type { RowModel } from './board-derive';

/** The picture for a chore: its emoji, or a star when it has none (spec 7.3: the icon is also the picture tile). */
export function pictureOf(icon: string | null | undefined): string {
  return icon && !icon.startsWith('mdi:') ? icon : '⭐';
}

/**
 * pv-chore-tile: a young child's chore as a picture (spec 13.2). The whole
 * tile is the hold target, because small hands need a big one; a small ⋯
 * button in the corner opens the options, mostly for grown-ups. Waiting for
 * OK says so in words here too.
 *
 * @fires pv-hold-done - HoldDetail, a hold finished on an open tile
 * @fires pv-hold-undo - HoldDetail, a hold finished on a done tile
 * @fires pv-hint - { row } a quick tap
 * @fires pv-row-options - { row } the ⋯ button
 */
export class PvChoreTile extends LitElement {
  @property({ attribute: false }) row!: RowModel;
  @property({ type: String }) color = '#5B5BD6';
  /** The chore for now: drawn with the person's color around it. */
  @property({ type: Boolean, reflect: true }) now = false;
  /** Bigger, for My day's Now tile. */
  @property({ type: Boolean, reflect: true }) large = false;
  @property({ type: Boolean }) locked = false;
  /** Stars a check-off earns, for "Keep holding… ⭐ +1". */
  @property({ type: Number }) stars = 0;

  @state() private _fill = 0;
  @state() private _held = false;
  private _frame = 0;
  private _celebrate = false;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._fill = fill;
    },
    complete: () => this._finish(),
    rewind: () => {
      this._held = false;
      this._fill = 0;
    },
    tap: () => this._fire('pv-hint', { row: this.row }),
  });

  static styles = css`
    :host {
      display: block;
      --tint: color-mix(in srgb, var(--member) 12%, var(--pv-card-bg, #FFFFFF));
    }

    .tile {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      border-radius: 18px;
      border: 2px solid transparent;
      background: var(--tint);
      color: var(--pv-text, #1A1B1E);
    }

    .hold {
      box-sizing: border-box;
      width: 100%;
      min-height: 132px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 14px 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      user-select: none;
    }

    :host([large]) .hold {
      min-height: 300px;
      gap: 10px;
    }

    .hold:focus-visible {
      outline: 3px solid var(--pv-accent-ink, #5B5BD6);
      outline-offset: 2px;
    }

    .hold[aria-disabled='true'] {
      cursor: default;
    }

    :host([now]) .tile {
      border-color: var(--member);
    }

    .tile.pending {
      border: 2px dashed var(--member);
      background: var(--pv-card-bg, #FFFFFF);
    }

    .tile.done {
      opacity: 0.72;
    }

    .picture {
      font-size: 44px;
      line-height: 1;
    }

    :host([large]) .picture {
      font-size: 84px;
    }

    .name {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: 1.0625rem;
      line-height: 1.2;
      text-align: center;
    }

    :host([large]) .name {
      font-size: 1.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #5F6670);
      min-height: 1.2em;
    }

    .waiting {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--pv-accent-tint-ink, #3B3BB0);
    }

    .more {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .more span {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--pv-card-bg, #FFFFFF);
      color: var(--pv-text-secondary, #5F6670);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      letter-spacing: 1px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .more:focus-visible span {
      outline: 2px solid var(--pv-accent-ink, #5B5BD6);
    }

    .tick {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('row')) {
      const before = changed.get('row') as RowModel | undefined;
      if (before && before.state !== this.row.state) {
        this._held = false;
        this._fill = 0;
        if (this.row.state === 'done' || this.row.state === 'pending') this._celebrate = true;
      }
    }
  }

  protected updated(): void {
    if (!this._celebrate) return;
    this._celebrate = false;
    const tile = this.renderRoot.querySelector('.tile');
    if (motionOf(this) === 'reduced') {
      tile?.animate({ opacity: [0.5, 1] }, { duration: 160 });
      return;
    }
    const pop = springEasing(BOUNCY);
    tile?.animate({ transform: ['scale(0.94)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
  }

  private get _holdable(): boolean {
    const state = this.row.state;
    return !this.locked && (state === 'open' || state === 'sent_back' || state === 'done');
  }

  private _down = (event: PointerEvent): void => {
    if (!this._holdable || this._held || event.button > 0) return;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // A hold works without pointer capture too.
    }
    this._gesture.down(event.clientX, event.clientY, performance.now());
    const tick = (t: number) => {
      this._gesture.frame(t);
      if (this._gesture.holding) this._frame = requestAnimationFrame(tick);
    };
    this._frame = requestAnimationFrame(tick);
  };

  private _up = (): void => {
    cancelAnimationFrame(this._frame);
    this._gesture.up(performance.now());
  };

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (this._holdable && !this._held) this._gesture.key(event.key);
  };

  private _finish(): void {
    this._held = true;
    this._fill = 1;
    const from = this.renderRoot.querySelector('.picture')?.getBoundingClientRect() ?? new DOMRect();
    const detail: HoldDetail = {
      row: this.row,
      from,
      settle: accepted => {
        if (!accepted) {
          this._held = false;
          this._fill = 0;
        }
      },
    };
    this._fire(this.row.state === 'done' ? 'pv-hold-undo' : 'pv-hold-done', detail);
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  render() {
    const row = this.row;
    if (!row) return nothing;
    const state = row.state;
    const done = state === 'done';
    const pending = state === 'pending';
    const fill = this._held ? 1 : this._fill;
    const ring = this.large ? 132 : 84;
    return html`
      <div class="tile ${pending ? 'pending' : ''} ${done ? 'done' : ''}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.locked ? -1 : 0} aria-disabled=${this.locked ? 'true' : 'false'}
          aria-label=${done ? `${row.name}, done. Hold to uncheck` : pending ? `${row.name}, waiting for OK` : `Hold to complete ${row.name}`}
          @pointerdown=${this._down} @pointermove=${(e: PointerEvent) => this._gesture.move(e.clientX, e.clientY)}
          @pointerup=${this._up} @pointercancel=${() => this._gesture.cancel()} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
        ${done ? html`
          <span class="tick" style="background:${this.color};color:${contrastText(this.color)}" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          </span>
        ` : nothing}
        <pv-ring size=${ring} .progress=${fill} color=${this.color}>
          <span class="picture" aria-hidden="true">${pictureOf(row.icon)}</span>
        </pv-ring>
        <span class="name">${row.name}</span>
        ${pending
          ? html`<span class="waiting">⏳ Waiting for OK</span>`
          : html`<span class="hint">${fill > 0 && !done ? html`Keep holding… ${this.stars > 0 ? `⭐ +${this.stars}` : ''}` : this.large && !done ? 'Hold me' : ''}</span>`}
        </div>
        <button class="more" type="button" aria-label=${`Options for ${row.name}`}
          @click=${() => this._fire('pv-row-options', { row })}>
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
    `;
  }
}

defineElement('pv-chore-tile', PvChoreTile);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { motionOf } from '../../core/motion';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { ColumnEntry, ColumnModel, RowModel } from './board-derive';
import { bump, flyStars, glide, measure } from './effects';
import './pv-chore-item';
import './pv-chore-tile';

/** The most stickers a strip draws before it says "+5". */
const STICKERS = 20;

/**
 * pv-chores-column: one person's today on the board (spec 13.1). The header
 * is their picture inside their ring, their name, today's count, stars and
 * streak, and what's next on their calendar; tapping it opens their My day.
 * Rows glide into Done today when they're checked off (FLIP). Young
 * children get picture tiles and a sticker strip for the week.
 *
 * @fires pv-member-open - { member } the header was tapped
 */
export class PvChoresColumn extends LitElement {
  @property({ attribute: false }) model!: ColumnModel;
  @property({ attribute: false }) hass?: HomeAssistant;
  /** The person's color for the mode (their ring, checks, and tints). */
  @property({ type: String }) color = '#5B5BD6';
  @property({ type: Boolean, reflect: true }) narrow = false;
  /** This screen may not change their items. */
  @property({ type: Boolean }) locked = false;
  /** Change it to celebrate the ring closing once. */
  @property({ type: Number }) celebrate = 0;
  /** Change it to pulse once (the evening check). */
  @property({ type: Number }) pulse = 0;
  @property({ type: String, reflect: true }) member = '';

  private _before: Map<string, DOMRect> | null = null;

  static styles = [
    choresStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        box-sizing: border-box;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--member);
        overflow: hidden;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 14px 14px 8px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .head:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 12px;
      }

      .who {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.3125rem;
        font-weight: 800;
        line-height: 1.15;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .stars {
        display: inline-block;
      }

      .next {
        padding: 0 14px 8px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }

      .next strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 650;
      }

      .body {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 8px 12px;
      }

      .head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 12px 6px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .head-row.now {
        color: var(--pv-text, #1A1B1E);
      }

      .head-row.now::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--member);
        flex-shrink: 0;
      }

      .head-row.now .text {
        flex: 1;
      }

      .head-row.later ~ pv-chore-item {
        opacity: 0.92;
      }

      .credit {
        margin: 10px 6px 0;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .closed {
        margin: 6px 4px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-text, #1A1B1E);
      }

      .closed strong {
        display: block;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        margin-bottom: 2px;
      }

      .closed span {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .away {
        margin: 6px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
      }

      .quiet {
        margin: 10px 6px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.9375rem;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 10px;
        padding: 4px 4px 0;
      }

      .stickers {
        margin: 14px 6px 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .stickers .row {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 4px;
        font-size: 20px;
        line-height: 1.1;
      }

      .layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
      }
    `,
  ];

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('color')) this.style.setProperty('--member', this.color);
    if (changed.has('model') && changed.get('model')) {
      this._before = measure(this.renderRoot.querySelectorAll<HTMLElement>('[data-key]'));
    }
  }

  protected updated(changed: PropertyValues): void {
    if (this._before) {
      glide(this.renderRoot.querySelectorAll<HTMLElement>('[data-key]'), this._before, this);
      this._before = null;
    }
    if (changed.has('pulse') && this.pulse && changed.get('pulse') !== undefined) this._pulse();
  }

  private _pulse(): void {
    if (motionOf(this) === 'reduced') return;
    this.animate(
      { boxShadow: ['0 0 0 0 transparent', `0 0 0 6px color-mix(in srgb, ${this.color} 35%, transparent)`, '0 0 0 0 transparent'] },
      { duration: 1400, easing: 'ease-in-out' },
    );
  }

  /** "+1 ★" flies from a check-off to this person's star count (spec 11.5). */
  flyStars(from: DOMRect, stars: number): void {
    const layer = this.renderRoot.querySelector<HTMLElement>('.layer');
    const target = this.renderRoot.querySelector<HTMLElement>('.stars');
    if (!layer) return;
    flyStars(this, layer, from, target?.getBoundingClientRect() ?? null, stars);
    window.setTimeout(() => bump(this.renderRoot.querySelector('.stars'), this), 600);
  }

  private _open(): void {
    this.dispatchEvent(new CustomEvent('pv-member-open', { detail: { member: this.model.member.id }, bubbles: true, composed: true }));
  }

  render() {
    const model = this.model;
    if (!model) return nothing;
    const member = model.member;
    return html`
      <button class="head" type="button" aria-label=${`${model.ring.label}. Open ${member.name}'s day`} @click=${this._open}>
        <pv-ring size="58" .progress=${model.ring.progress} ?closed=${model.ring.closed} color=${this.color}
          .celebrate=${this.celebrate}>
          <pv-member-avatar .member=${{ ...member, color: this.color }} .hass=${this.hass} size="44"></pv-member-avatar>
        </pv-ring>
        <span class="who">
          <span class="name">${member.name}</span>
          <span class="line">${model.parts.map((part, i) => html`${i ? ' · ' : ''}<span class=${part.kind}>${part.text}</span>`)}</span>
        </span>
      </button>
      ${model.next ? html`<div class="next">${this._next(model.next)}</div>` : nothing}
      <div class="body">
        ${model.away ? html`<div class="away">🧳 Away${model.away.note ? ` · ${model.away.note}` : ''}. Nothing is due, and the streak keeps.</div>` : nothing}
        ${model.ring.closed && !model.entries.some(e => e.kind === 'row' && (e.zone === 'now' || e.zone === 'later' || e.zone === 'overdue'))
          ? html`<div class="closed"><strong>Ring closed for today</strong><span>Everything due today is done. Nice work.</span></div>`
          : nothing}
        ${model.pictures ? this._tiles(model) : this._list(model)}
        ${model.empty && !model.away ? html`<div class="quiet">Nothing on the board today.</div>` : nothing}
        <div class="layer"></div>
      </div>
    `;
  }

  /** "Next on calendar: Soccer at 5:30 · free until then", with the event in bold. */
  private _next(text: string) {
    const match = /^Next on calendar: (.*?)( · free until then)?$/.exec(text);
    if (!match) return text;
    return html`Next on calendar: <strong>${match[1]}</strong>${match[2] ?? ''}`;
  }

  private _list(model: ColumnModel) {
    return repeat(model.entries, entry => entry.key, entry => this._entry(entry));
  }

  private _entry(entry: ColumnEntry) {
    if (entry.kind === 'head') {
      return html`
        <div class="head-row ${entry.tone}" data-key=${entry.key}>
          <span class="text">${entry.text}</span>${entry.right ? html`<span>${entry.right}</span>` : nothing}
        </div>
      `;
    }
    if (entry.kind === 'credit') return html`<div class="credit" data-key=${entry.key}>${entry.text}</div>`;
    return html`
      <pv-chore-item data-key=${entry.key} .row=${entry.row} color=${this.color} ?narrow=${this.narrow}
        ?highlight=${entry.zone === 'now'} ?locked=${this.locked}></pv-chore-item>
    `;
  }

  private _tiles(model: ColumnModel) {
    const rows: Array<{ row: RowModel; now: boolean }> = [];
    let first = true;
    for (const entry of model.entries) {
      if (entry.kind !== 'row' || entry.zone === 'done') continue;
      rows.push({ row: entry.row, now: first && entry.row.state !== 'pending' });
      if (entry.row.state !== 'pending') first = false;
    }
    const done = model.entries.flatMap(e => (e.kind === 'row' && e.zone === 'done' ? [e.row] : []));
    const stickers = model.entry.week_stars;
    return html`
      <div class="tiles">
        ${repeat(rows, r => r.row.key, r => html`
          <pv-chore-tile .row=${r.row} color=${this.color} ?now=${r.now} ?locked=${this.locked}
            .stars=${model.member.stars ? r.row.item.stars : 0}></pv-chore-tile>
        `)}
        ${repeat(done, r => r.key, r => html`<pv-chore-tile .row=${r} color=${this.color} ?locked=${this.locked}></pv-chore-tile>`)}
      </div>
      ${model.member.stars ? html`
        <div class="stickers">
          This week:
          <div class="row" role="img" aria-label=${`${stickers} ${stickers === 1 ? 'star' : 'stars'} this week`}>
            ${Array.from({ length: Math.min(STICKERS, stickers) }, () => html`<span aria-hidden="true">⭐</span>`)}
            ${stickers > STICKERS ? html`<span class="meta">+${stickers - STICKERS}</span>` : nothing}
            ${stickers === 0 ? html`<span class="meta">Stars show up here.</span>` : nothing}
          </div>
        </div>
      ` : nothing}
    `;
  }
}

defineElement('pv-chores-column', PvChoresColumn);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import type { Layout } from '../../core/layout';
import { HouseholdView, inOrder, memberColor } from '../../core/household';
import type { Session } from '../../core/session';
import { memberAccess } from '../../core/access';
import { motionOf } from '../../core/motion';
import { swipeDirection } from '../../utils/gestures';
import { memoizeOne } from '../../utils/render-cache';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Board } from './chores-types';
import { ColumnModel, boardColumns, boardRows, eveningCheck, everyRingClosed } from './board-derive';
import { eventsOn } from './calendar-ties';
import { chime, haptic } from './effects';
import './pv-chores-column';
import type { PvChoresColumn } from './pv-chores-column';

const GAP = 12;
const NARROW_PX = 300;

/**
 * pv-chores-board: everyone's today at once (spec 13.1, 12.3). People sit in
 * columns while each can be 240 px wide, then wrap into an even grid (four
 * people in portrait make a 2 by 2) with a short last row stretched; the
 * order is Settings order and never changes, and each panel scrolls on its
 * own. A phone shows one person at a time, with a swipe between people.
 * Rings closing are celebrated once; when every ring closes, everyone's are.
 *
 * @fires pv-member-open - { member } a column's header was tapped
 */
export class PvChoresBoard extends LitElement {
  @property({ attribute: false }) board!: Board;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) session: Session | null = null;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) mode: 'light' | 'dark' = 'light';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Minutes since the epoch: the board re-derives each minute (bands and the evening check move with the clock). */
  @property({ attribute: false }) minute = 0;

  @state() private _width = 0;
  @state() private _phoneIndex = 0;
  @state() private _celebrate: Record<string, number> = {};
  @state() private _pulse: Record<string, number> = {};
  @state() private _family = false;
  private _observer?: ResizeObserver;
  private _closed = new Map<string, boolean>();
  private _evening = false;
  private _familyShown = false;
  private _touch: { x: number; y: number } | null = null;

  static styles = [
    choresStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      .rows {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: ${GAP}px;
        padding: ${GAP}px;
      }

      .row {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
        gap: ${GAP}px;
      }

      pv-chores-column {
        flex: 1 1 0;
      }

      .people {
        display: flex;
        gap: 6px;
        padding: 10px 12px 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 56px;
        min-height: 48px;
        padding: 2px 4px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
      }

      .person.on {
        color: var(--pv-text, #1A1B1E);
        background: var(--pv-card-bg, #FFFFFF);
      }

      .phone {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        padding: ${GAP}px;
      }

      .phone pv-chores-column {
        flex: 1 1 auto;
      }

      .celebrate {
        margin: 10px 12px 0;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
        font-weight: 750;
        text-align: center;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver(entries => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (Math.abs(width - this._width) >= 1) this._width = width;
    });
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  private _columnsFor = memoizeOne(
    (board: Board, household: HouseholdView | null, data: PlanaVistaData | null, timeFormat: '12h' | '24h', _minute: number) => {
      const members = household ? inOrder(household.members) : [];
      const now = new Date();
      return boardColumns(board, {
        today: board.today,
        now,
        events: eventsOn(data, new Date(board.day.start), new Date(board.day.end)),
        timeFormat,
        activities: new Map(board.chores.map(a => [a.id, a])),
        members,
      });
    },
  );

  private _columns(): ColumnModel[] {
    return this._columnsFor(this.board, this.household, this.data, this.timeFormat, this.minute);
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has('board') && !changed.has('minute')) return;
    const columns = this._columns();
    const live = changed.get('board') !== undefined || this._closed.size > 0;
    const celebrate = { ...this._celebrate };
    let any = false;
    for (const col of columns) {
      const was = this._closed.get(col.member.id);
      if (live && was === false && col.ring.closed) {
        celebrate[col.member.id] = (celebrate[col.member.id] ?? 0) + 1;
        any = true;
      }
      this._closed.set(col.member.id, col.ring.closed);
    }
    const family = everyRingClosed(columns);
    if (family && live && !this._familyShown && any) {
      this._familyShown = true;
      this._family = true;
      for (const col of columns) if (col.entry.today.due > 0) celebrate[col.member.id] = (celebrate[col.member.id] ?? 0) + 1;
      window.setTimeout(() => { this._family = false; }, 6000);
    }
    if (!family) this._familyShown = false;
    if (any) {
      this._celebrate = celebrate;
      haptic('ring');
      if (this.board.settings.sound) chime(true);
    }
    const evening = eveningCheck(columns, this.board, new Date());
    if (evening && !this._evening && this._closed.size > 0) {
      const pulse = { ...this._pulse };
      for (const id of evening.members) pulse[id] = (pulse[id] ?? 0) + 1;
      this._pulse = pulse;
    }
    this._evening = !!evening;
  }

  /** "+1 ★" flies to someone's star count. */
  flyStars(memberId: string, from: DOMRect, stars: number): void {
    const column = this.renderRoot.querySelector<PvChoresColumn>(`pv-chores-column[member="${memberId}"]`);
    column?.flyStars(from, stars);
  }

  render() {
    if (!this.board) return nothing;
    const columns = this._columns();
    const evening = eveningCheck(columns, this.board, new Date());
    const banners = html`
      ${this._family ? html`<div class="celebrate" role="status">🎉 Everyone closed their ring today. What a team.</div>` : nothing}
      ${evening ? html`<div class="banner info" role="status"><span class="text">${evening.text}</span></div>` : nothing}
    `;
    if (this.layout === 'phone') return html`${banners}${this._phone(columns)}`;
    const width = Math.max(0, this._width - GAP * 2);
    const rows = boardRows(columns.length, width || 1200, GAP);
    const perRow = Math.max(...rows, 1);
    const narrow = width > 0 && (width - GAP * (perRow - 1)) / perRow < NARROW_PX;
    let index = 0;
    return html`
      ${banners}
      <div class="rows">
        ${rows.map(count => {
          const slice = columns.slice(index, index + count);
          index += count;
          return html`<div class="row">${repeat(slice, c => c.member.id, c => this._column(c, narrow))}</div>`;
        })}
      </div>
    `;
  }

  private _column(model: ColumnModel, narrow: boolean) {
    const id = model.member.id;
    return html`
      <pv-chores-column member=${id} .model=${model} .hass=${this.hass} color=${memberColor(model.member, this.mode)}
        ?narrow=${narrow} ?locked=${memberAccess(this.household, this.session, id) === 'no'}
        .celebrate=${this._celebrate[id] ?? 0} .pulse=${this._pulse[id] ?? 0}></pv-chores-column>
    `;
  }

  private _phone(columns: ColumnModel[]) {
    if (columns.length === 0) return nothing;
    const index = Math.min(this._phoneIndex, columns.length - 1);
    const current = columns[index];
    return html`
      <div class="people" role="tablist" aria-label="Whose chores">
        ${columns.map((col, i) => html`
          <button type="button" class="person ${i === index ? 'on' : ''}" role="tab" aria-selected=${i === index ? 'true' : 'false'}
            @click=${() => this._show(i)}>
            <pv-ring size="40" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${memberColor(col.member, this.mode)}>
              <pv-member-avatar .member=${{ ...col.member, color: memberColor(col.member, this.mode) }} .hass=${this.hass} size="28"></pv-member-avatar>
            </pv-ring>
            ${col.member.name}
          </button>
        `)}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${(e: TouchEvent) => this._touchEnd(e, columns.length)}>
        ${this._column(current, true)}
      </div>
    `;
  }

  private _show(index: number): void {
    const before = this._phoneIndex;
    this._phoneIndex = index;
    if (before === index || motionOf(this) === 'reduced') return;
    this.updateComplete.then(() => {
      const column = this.renderRoot.querySelector('.phone pv-chores-column');
      column?.animate(
        { transform: [`translateX(${index > before ? 24 : -24}px)`, 'translateX(0)'], opacity: [0.4, 1] },
        { duration: 220, easing: 'ease-out' },
      );
    });
  }

  private _touchStart = (event: TouchEvent): void => {
    this._touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  private _touchEnd(event: TouchEvent, count: number): void {
    const start = this._touch;
    this._touch = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction === 'next' && this._phoneIndex < count - 1) this._show(this._phoneIndex + 1);
    if (direction === 'prev' && this._phoneIndex > 0) this._show(this._phoneIndex - 1);
  }
}

defineElement('pv-chores-board', PvChoresBoard);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-people-sheet.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';

/**
 * pv-chores-people-sheet: pick a person ("Who did it?", "Who's getting it?").
 * Faces, not a list, so a child can answer too.
 *
 * @fires pv-person-pick - { member } of the person tapped, or null for Cancel; it fires once the sheet has left
 */
export class PvChoresPeopleSheet extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) heading = '';
  @property({ type: String }) body = '';
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  /** Each person's color for the mode. */
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;

  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      .faces {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        margin: 14px 0 6px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 72px;
        min-height: 48px;
        padding: 6px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .face:hover,
      .face:focus-visible {
        background: var(--pv-chip, #F1F1EE);
        outline: none;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => this._pick(null));
    this.renderRoot.querySelector<HTMLElement>('.face')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  render() {
    return html`
      <div class="backdrop" @click=${() => this._pick(null)}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="people-heading" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="people-heading">${this.heading}</h2>
        ${this.body ? html`<p class="body">${this.body}</p>` : nothing}
        <div class="faces">
          ${this.people.map(person => html`
            <button class="face" type="button" @click=${() => this._pick(person)}>
              <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="56"></pv-member-avatar>
              ${person.name}
            </button>
          `)}
        </div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._pick(null)}>Cancel</button>
        </div>
      </div>
    `;
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._pick(null);
      return;
    }
    trapTab(this.shadowRoot!, event);
  };

  private async _pick(member: Member | null): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-person-pick', { detail: { member }, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-people-sheet', PvChoresPeopleSheet);
```

- [ ] **Step 5: Show the board and run check-offs from the module.**

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index de32376..11d4a38 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -4,21 +4,39 @@ import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { buttonStyles } from '../../styles/shared';
 import type { Layout } from '../../core/layout';
-import type { HouseholdView } from '../../core/household';
+import { HouseholdView, Member, inOrder, memberColor } from '../../core/household';
 import type { ModuleElement, ModuleService, OpenTarget } from '../../core/module-registry';
 import type { PinGate } from '../../core/pin-gate';
 import type { Session } from '../../core/session';
 import type { Toast } from '../../core/pv-toast';
-import { parentAccess } from '../../core/access';
+import { memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
 import type { Mode } from '../../styles/theme-pairs';
 import type { DisplayConfig, PlanaVistaData } from '../../types';
 import { choresStyles } from './chores-styles';
 import type { ChoresService } from './chores-service';
+import type { Board } from './chores-types';
+import type { RowModel } from './board-derive';
+import type { HoldDetail } from './pv-chore-item';
+import { needsOk } from './overlay';
+import { chime, haptic } from './effects';
+import type { PvChoresBoard } from './pv-chores-board';
 import '../../core/pv-toast';
 import '../../shell/pv-notice-sheet';
+import './pv-chores-board';
+import './pv-chores-people-sheet';
 
 /** A sheet the chores screens show over themselves. */
-type ChoresSheet = { kind: 'start_over' } | { kind: 'no_pin'; heading: string };
+type ChoresSheet =
+  | { kind: 'start_over' }
+  | { kind: 'no_pin'; heading: string }
+  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void };
+
+/** What the last check-off toast can take back or hand to someone else. */
+interface LastCheckoff {
+  row: RowModel;
+  member: string;
+  toast: string;
+}
 
 /**
  * pv-chores-module: the Chores module (spec 13). It shows the view the bar
@@ -46,7 +64,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
 
   @state() protected _sheet: ChoresSheet | null = null;
   @state() protected _toast: Toast | null = null;
+  /** Minutes since the epoch, so bands and the evening check move with the clock. */
+  @state() private _minute = Math.floor(Date.now() / 60000);
   private _overlayOpen = false;
+  private _last: LastCheckoff | null = null;
+  private _clock: ReturnType<typeof setInterval> | undefined;
 
   static styles = [
     buttonStyles,
@@ -121,8 +143,17 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     }
   }
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this._clock = setInterval(() => {
+      const minute = Math.floor(Date.now() / 60000);
+      if (minute !== this._minute) this._minute = minute;
+    }, 5000);
+  }
+
   disconnectedCallback(): void {
     super.disconnectedCallback();
+    clearInterval(this._clock);
     if (this._overlayOpen) {
       this._overlayOpen = false;
       this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open: false }, bubbles: true, composed: true }));
@@ -182,7 +213,136 @@ export class PvChoresModule extends LitElement implements ModuleElement {
 
   /** The view the bar picked. */
   protected renderView(): unknown {
-    return nothing;
+    const board = this.service?.board();
+    if (!board) return nothing;
+    const empty = board.chores.length === 0;
+    if (empty) return this._empty();
+    return html`
+      <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
+        .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
+        .minute=${this._minute}
+        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
+        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
+        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}></pv-chores-board>
+    `;
+  }
+
+  private _empty() {
+    const access = parentAccess(this.household, this.session);
+    return html`
+      <div class="state">
+        <div class="art" aria-hidden="true">🧺</div>
+        <h2>No chores yet</h2>
+        <p>Add your family's chores, and they'll show up here for everyone.</p>
+        ${access !== 'no' ? html`
+          <div class="buttons">
+            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>Add chores</button>
+          </div>
+        ` : nothing}
+      </div>
+    `;
+  }
+
+  private _member(id: string): Member | undefined {
+    return this.household?.members.find(m => m.id === id);
+  }
+
+  private _colorOf = (member: Member): string => memberColor(member, this.mode);
+
+  /**
+   * Whether this screen may change `memberId`'s items now: straight away, or
+   * after their PIN (or a parent's) on a shared screen (spec 13.2).
+   */
+  protected async asMember(memberId: string, heading: string): Promise<boolean> {
+    const access = memberAccess(this.household, this.session, memberId);
+    if (access === 'yes') return true;
+    if (access === 'no' || !this.pinGate) return false;
+    return this.pinGate.ask(pinChoicesFor(this.household, memberId), heading);
+  }
+
+  private async _complete(detail: HoldDetail): Promise<void> {
+    const { row } = detail;
+    const service = this.service;
+    const board = service?.board();
+    if (!service || !board) {
+      detail.settle(false);
+      return;
+    }
+    const member = row.item.member;
+    if (!(await this.asMember(member, `Who's checking off ${row.name}?`))) {
+      detail.settle(false);
+      return;
+    }
+    this._checkOff(row, member, board, undefined, detail.from);
+    detail.settle(true);
+  }
+
+  /** Queue the check-off, show it at once, and offer Undo (spec 13.2). */
+  private _checkOff(row: RowModel, member: string, board: Board, doneBy?: string, from?: DOMRect): void {
+    const service = this.service!;
+    const doer = this._member(doneBy ?? member);
+    const activity = board.chores.find(a => a.id === row.item.chore);
+    const waits = needsOk(doer, activity);
+    service.enqueue({ op: 'complete', occurrence: row.key, member, name: row.name, doneBy, shows: waits ? 'pending' : 'done' });
+    haptic('tick');
+    if (board.settings.sound) chime();
+    const id = `done-${row.key}-${Date.now()}`;
+    this._last = { row, member, toast: id };
+    const name = doneBy && doneBy !== member ? this._member(doneBy)?.name : null;
+    this.showToast({
+      id,
+      text: waits ? `${row.name}: waiting for OK` : name ? `Done by ${name}` : 'Done',
+      actions: [{ id: 'undo', label: 'Undo' }, ...(doneBy ? [] : [{ id: 'someone', label: 'Someone else did it?' }])],
+      ms: 6000,
+    });
+    const owner = this._member(doneBy ?? member);
+    if (from && owner?.stars && !waits) {
+      void this.updateComplete.then(() => {
+        this.renderRoot.querySelector<PvChoresBoard>('pv-chores-board')?.flyStars(member, from, row.item.stars);
+      });
+    }
+  }
+
+  private async _uncheck(detail: HoldDetail): Promise<void> {
+    const { row } = detail;
+    const member = row.item.member;
+    if (!this.service || !(await this.asMember(member, `Who's unchecking ${row.name}?`))) {
+      detail.settle(false);
+      return;
+    }
+    this.service.enqueue({ op: 'undo', occurrence: row.key, member, name: row.name });
+    detail.settle(true);
+    this.showToast({ id: `undo-${row.key}-${Date.now()}`, text: `${row.name} is open again.` });
+  }
+
+  private _hint(row: RowModel): void {
+    const locked = memberAccess(this.household, this.session, row.item.member) === 'no';
+    const owner = this._member(row.item.member)?.name ?? 'its owner';
+    const text = locked
+      ? `Only ${owner} or a parent can check this off here.`
+      : row.state === 'done'
+        ? 'Hold the check to uncheck it.'
+        : row.state === 'pending'
+          ? 'This is waiting for a parent\'s OK.'
+          : 'Hold the circle to finish a chore. Let go early and nothing happens.';
+    this.showToast({ id: `hint-${Date.now()}`, text, ms: 3500 });
+  }
+
+  /** "Someone else did it?": pick who, then credit them instead (spec 13.2). */
+  private _someoneElse(last: LastCheckoff): void {
+    const people = inOrder(this.household?.members ?? []).filter(m => m.id !== last.member);
+    this._sheet = {
+      kind: 'people',
+      heading: 'Who did it?',
+      body: `They get the credit${people.some(p => p.stars) ? ' and the stars' : ''} for ${last.row.name}.`,
+      people,
+      pick: member => {
+        const board = this.service?.board();
+        if (!member || !board || !this.service) return;
+        this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
+        this._checkOff(last.row, last.member, board, member.id);
+      },
+    };
   }
 
   private _skeleton() {
@@ -260,8 +420,15 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     this._toast = toast;
   }
 
-  protected onToastAction(_toast: Toast, _action: string): void {
-    // Undo and Someone else did it? arrive with the board.
+  protected onToastAction(toast: Toast, action: string): void {
+    const last = this._last;
+    if (!last || last.toast !== toast.id || !this.service) return;
+    if (action === 'undo') {
+      this.service.enqueue({ op: 'undo', occurrence: last.row.key, member: last.member, name: last.row.name });
+      this._last = null;
+    } else if (action === 'someone') {
+      this._someoneElse(last);
+    }
   }
 
   private _onToastAction = (event: CustomEvent<{ toast: Toast; action: string }>): void => {
@@ -276,6 +443,14 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _renderSheet() {
     const sheet = this._sheet;
     if (!sheet) return this.renderSheet();
+    if (sheet.kind === 'people') {
+      return html`
+        <pv-chores-people-sheet .layout=${this.layout} heading=${sheet.heading} body=${sheet.body ?? ''}
+          .people=${sheet.people} .hass=${this.hass} .colorOf=${this._colorOf}
+          @pv-person-pick=${(e: CustomEvent<{ member: Member | null }>) => { this._sheet = null; sheet.pick(e.detail.member); }}>
+        </pv-chores-people-sheet>
+      `;
+    }
     if (sheet.kind === 'no_pin') {
       return html`
         <pv-notice-sheet .layout=${this.layout} heading=${sheet.heading}
```

- [ ] **Step 6: Run them again.** Same command. Expected: `18 passed`.
- [ ] **Step 7: Run the whole frontend suite.** Expected: tsc clean, `523 passed`; the copy check passes.
- [ ] **Step 8: Commit.** Message `feat(chores): the board, with hold to complete` with the trailers.

---

### Task 6: The options sheet

Spec 13.3 (what it offers depends on who is looking: a member plans a day, asks for more time or to skip, or says someone else did it, and sees History; a parent also changes the due date, hands it over, excuses it, or deletes the chore, behind a parent's PIN on a shared screen), 8.7 and 8.8 (requests and overrides), and 11.7 (Delete confirmed by name).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/options-derive.test.ts`

**Interfaces:**
- Consumes: Task 5's rows and the module's access helpers.
- Produces: `OptionId`, `OptionModel`, `OptionsContext`, `OptionsModel`, `DayChip`, `itemOptions(ctx)`, `planChips`, `dueChips`, `moreTimeChips`, `chipLabel`, `dayWords`, `addDays`, `rhythmText`, `historyLines(history, today, members, format)`; `pv-chore-options` (events `pv-option { id, value? }`, `pv-sheet-close`), `SEND_BACK_REASONS`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/options-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  addDays,
  chipLabel,
  dayWords,
  dueChips,
  historyLines,
  itemOptions,
  moreTimeChips,
  planChips,
  rhythmText,
  type OptionsContext,
} from '../src/modules/chores/options-derive';
import { MEMBERS, TODAY, activity, item } from './chores-fixtures';

const [alex, blair, casey] = MEMBERS;
const YARD = item('yard_work|casey|week:2026-10-12|0', {
  section: 'week', window: 'week', planned: null, due_day: '2026-10-18', counted: false, credit_minutes: 60, stars: 4,
});
const LATCH = item('fix_the_gate_latch|alex|once|0', {
  window: 'once', period: 'once', dated: true, due_day: '2026-10-17', planned: null, credit_minutes: 30, stars: 2,
});

function ctx(fields: Partial<OptionsContext>): OptionsContext {
  return {
    item: YARD,
    activity: activity('yard_work', { minimum: { hours: 1, per: 'week' }, created: { by: 'blair', source: 'tablet', at: '2026-10-11T19:00:00-05:00' } }),
    owner: casey,
    members: MEMBERS,
    today: TODAY,
    member: 'yes',
    parent: 'pin',
    ...fields,
  };
}

const ids = (list: Array<{ id: string }>) => list.map(o => o.id);

describe('itemOptions (spec 13.3)', () => {
  it('offers a member planning, requests, done by someone else, and history', () => {
    const options = itemOptions(ctx({}));
    expect(ids(options.member)).toEqual(['plan_day', 'more_time', 'skip', 'done_by', 'history']);
    expect(options.member[1]).toMatchObject({ tag: 'needs OK', hint: 'Sends a request to Alex and Blair.' });
    expect(options.member[0].hint).toBe('Shows on that day, and it\'s still due Sunday.');
    expect(options.title).toBe('Yard work');
    expect(options.meta).toBe('Casey · Every week · 1 h · ★ 4');
    expect(options.added).toBe('Added by Blair on Sunday');
  });

  it('marks the parent options with a lock on a shared screen, and hides them on a child\'s own login', () => {
    const shared = itemOptions(ctx({}));
    expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'delete']);
    expect(shared.parent.every(o => o.tag === '🔒 parent')).toBe(true);
    expect(itemOptions(ctx({ parent: 'no' })).parent).toEqual([]);
    expect(itemOptions(ctx({ parent: 'yes' })).parent[0].tag).toBeUndefined();
  });

  it('gives a parent\'s own chore no requests, since a parent just changes it', () => {
    const options = itemOptions(ctx({ item: LATCH, owner: alex, activity: activity('fix_the_gate_latch', { schedule: 'once', once: { on: null, by: '2026-10-17', by_time: null, sessions: 1, estimate_minutes: 30 } }) }));
    expect(ids(options.member)).toEqual(['plan_day', 'done_by', 'history']);
    expect(options.meta).toBe('Alex · Once · by Saturday · 30 min');
  });

  it('asks for the owner\'s PIN where one is needed', () => {
    const options = itemOptions(ctx({ member: 'pin' }));
    expect(options.member[0].tag).toBe('🔒 Casey\'s PIN');
  });

  it('offers unchecking a done one, and review for one waiting for OK', () => {
    expect(ids(itemOptions(ctx({ item: { ...YARD, status: 'done' } })).member)).toEqual(['undo', 'done_by', 'history']);
    const pending = itemOptions(ctx({ item: { ...YARD, status: 'pending' }, parent: 'yes' }));
    expect(ids(pending.member)).toEqual(['undo', 'history']);
    expect(ids(pending.parent)).toEqual(['approve', 'send_back', 'delete']);
  });

  it('says why a sent back one came back, and that a request is waiting', () => {
    expect(itemOptions(ctx({ item: { ...YARD, status: 'sent_back', note: 'edges' } })).note).toBe('Sent back: edges');
    const asked = itemOptions(ctx({ item: { ...YARD, request: { id: 'r', kind: 'more_time', until: '2026-10-25' } } }));
    expect(asked.note).toBe('Waiting for a parent: more time, until October 25.');
    expect(ids(asked.member)).toEqual(['plan_day', 'done_by', 'history']);
  });

  it('lets a child\'s own login see only the history of someone else\'s chore', () => {
    expect(ids(itemOptions(ctx({ member: 'no', parent: 'no' })).member)).toEqual(['history']);
  });
});

describe('day chips', () => {
  it('plans tomorrow up to the day it is due', () => {
    expect(planChips(YARD, TODAY).map(c => c.label)).toEqual(['Tomorrow', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(planChips(item('cat|x|day:1|0'), TODAY)).toEqual([]);
  });

  it('moves a due date a day or a week, and asks for later days', () => {
    expect(dueChips(LATCH, TODAY).map(c => c.label)).toEqual(['Sun', 'Next Sat']);
    expect(moreTimeChips(YARD, TODAY).map(c => [c.day, c.label])).toEqual([
      ['2026-10-19', 'Mon'], ['2026-10-20', 'Next Tue'], ['2026-10-25', 'Next Sun'],
    ]);
  });

  it('labels days the way a family says them', () => {
    expect(chipLabel('2026-10-14', TODAY)).toBe('Tomorrow');
    expect(chipLabel('2026-10-17', TODAY)).toBe('Sat');
    expect(chipLabel('2026-10-24', TODAY)).toBe('Next Sat');
    expect(chipLabel('2026-11-02', TODAY)).toBe('Nov 2');
    expect(dayWords('2026-10-18', TODAY)).toBe('Sunday');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });
});

describe('rhythmText', () => {
  it('says how often', () => {
    expect(rhythmText(activity('laundry', { minimum: { hours: 2, per: 'week' }, days: ['mon', 'thu'] }), YARD, TODAY)).toBe('Mon and Thu');
    expect(rhythmText(activity('cat', { minimum: { hours: 0.5, per: 'day' } }), YARD, TODAY)).toBe('Every day');
    expect(rhythmText(activity('filter', { schedule: 'repeats', repeats: { rrule: 'FREQ=MONTHLY;BYMONTHDAY=1', start: '2026-10-01', window: 'period', estimate_minutes: 15 } }), YARD, TODAY)).toBe('Repeats monthly');
  });
});

describe('historyLines', () => {
  it('words the streak, how often lately, the last time, and when it usually gets done', () => {
    const lines = historyLines({
      chore: 'yard_work', member: 'casey', streak: { weeks: 4 }, weeks: { done: 4, of: 6 },
      recent: [{ at: '2026-10-10T14:00:00-05:00', done_by: 'casey', state: 'done', occurrence: 'x' }],
      usual: { band: 'afternoon', day: 'sat' },
    }, TODAY, MEMBERS, '12h');
    expect(lines).toEqual(['🔥 4 weeks in a row', 'Done 4 of the last 6 weeks', 'Last done Saturday at 2:00 PM', 'Usually Saturdays in the afternoon']);
  });

  it('says when it has not been done yet, and who did it for someone else', () => {
    expect(historyLines({ chore: 'c', member: 'casey', streak: { days: 0 }, weeks: { done: 0, of: 0 }, recent: [], usual: { band: null, day: null } }, TODAY, MEMBERS, '12h'))
      .toEqual(['Not done yet']);
    const byBlair = historyLines({
      chore: 'c', member: 'casey', streak: { days: 3 }, weeks: { done: 1, of: 1 },
      recent: [{ at: '2026-10-12T19:30:00-05:00', done_by: 'blair', state: 'done', occurrence: 'x' }], usual: { band: 'evening', day: null },
    }, TODAY, [blair, casey], '24h');
    expect(byBlair).toEqual(['🔥 3 days in a row', 'Last done Monday at 19:30 by Blair', 'Usually in the evening']);
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/options-derive.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/options-derive`.

- [ ] **Step 3: Write the options and the sheet.**

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import type { Access, ParentAccess } from '../../core/access';
import { dayDate, daysBetween, minutesText } from '../../core/status-map';
import type { Activity, Band, ChoreHistory, ItemView } from './chores-types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export type OptionId =
  | 'plan_day' | 'more_time' | 'skip' | 'done_by' | 'history' | 'undo'
  | 'change_due' | 'hand_off' | 'excuse' | 'delete' | 'approve' | 'send_back';

/** A day to pick in a sheet ("Tomorrow", "Sat", "Next Sat"). */
export interface DayChip {
  day: string;
  label: string;
  on?: boolean;
}

export interface OptionModel {
  id: OptionId;
  label: string;
  hint?: string;
  /** Says what unlocks it ("🔒 parent", "🔒 Casey's PIN"), or that it asks the parents ("needs OK"). */
  tag?: string;
  chips?: DayChip[];
  /** A date picker for anything the chips don't offer. */
  pick?: { min: string; max?: string };
  destructive?: boolean;
  disabled?: boolean;
}

export interface OptionsContext {
  item: ItemView;
  activity: Activity | undefined;
  owner: Member;
  members: Member[];
  /** Today's chore day, YYYY-MM-DD. */
  today: string;
  member: Access;
  parent: ParentAccess;
}

export interface OptionsModel {
  title: string;
  /** "Alex · Once · by Saturday · 30 min". */
  meta: string;
  /** "Added by Blair on Sunday". */
  added: string | null;
  /** "Sent back: edges", or a request still waiting. */
  note: string | null;
  member: OptionModel[];
  parent: OptionModel[];
}

/** A day `n` days after `day` (YYYY-MM-DD). */
export function addDays(day: string, n: number): string {
  const date = dayDate(day);
  date.setDate(date.getDate() + n);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Tomorrow", "Sat" within the week, "Next Sat" the week after, then "Oct 31". */
export function chipLabel(day: string, today: string): string {
  const days = daysBetween(today, day);
  const date = dayDate(day);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1 && days <= 6) return SHORT[date.getDay()];
  if (days >= 7 && days <= 13) return `Next ${SHORT[date.getDay()]}`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Saturday" within a week, else "October 31" (sentences: "Shows on Saturday"). */
export function dayWords(day: string, today: string): string {
  const days = daysBetween(today, day);
  const date = dayDate(day);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (Math.abs(days) <= 6) return WEEKDAYS[date.getDay()];
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]} ${date.getDate()}`;
}

function listDays(codes: string[]): string {
  const names = codes.map(code => SHORT[CODES.indexOf(code)] ?? code);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** How often a chore comes ("Every day", "Mon and Thu", "Once · by Saturday", "Repeats"). */
export function rhythmText(activity: Activity | undefined, item: ItemView, today: string): string {
  if (!activity) return '';
  if (activity.schedule === 'plan') {
    const days = activity.days ?? [];
    if (activity.minimum?.per === 'day') return days.length ? listDays(days) : 'Every day';
    return days.length ? listDays(days) : 'Every week';
  }
  if (activity.schedule === 'once') {
    const once = activity.once;
    if (once?.on) return `Once · on ${dayWords(once.on, today)}`;
    if (item.dated && item.due_day) return `Once · by ${dayWords(item.due_day, today)}`;
    return 'Once · any time';
  }
  const rule = activity.repeats?.rrule ?? '';
  if (rule.includes('FREQ=DAILY')) return 'Repeats daily';
  if (rule.includes('FREQ=MONTHLY')) return 'Repeats monthly';
  return 'Repeats weekly';
}

/** Days it may be shown on instead (Plan it for a day): tomorrow up to the day it's due, at most a week. */
export function planChips(item: ItemView, today: string): DayChip[] {
  if (!item.due_day || item.window === 'day') return [];
  const last = Math.min(daysBetween(today, item.due_day), 6);
  const chips: DayChip[] = [];
  for (let n = 1; n <= last; n++) {
    const day = addDays(today, n);
    chips.push({ day, label: chipLabel(day, today) });
  }
  return chips;
}

/** New due dates a parent can pick: the day after, and a week later; tomorrow and the week's end for one with none. */
export function dueChips(item: ItemView, today: string): DayChip[] {
  const base = item.due_day && daysBetween(today, item.due_day) >= 0 ? item.due_day : today;
  const days = item.due_day ? [addDays(base, 1), addDays(base, 7)] : [addDays(today, 1), addDays(today, 7)];
  return days.map(day => ({ day, label: chipLabel(day, today) }));
}

/** Days to ask for (Ask for more time): later than it's due now. */
export function moreTimeChips(item: ItemView, today: string): DayChip[] {
  const base = item.due_day && daysBetween(today, item.due_day) >= 0 ? item.due_day : today;
  return [addDays(base, 1), addDays(base, 2), addDays(base, 7)].map(day => ({ day, label: chipLabel(day, today) }));
}

function names(people: Member[]): string {
  const list = people.map(p => p.name);
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

function addedLine(activity: Activity | undefined, members: Member[], today: string): string | null {
  const created = activity?.created;
  if (!created?.at) return null;
  const who = members.find(m => m.id === created.by)?.name ??
    (created.by === 'automation' ? 'an automation' : created.by === 'admin' ? 'an admin' : null);
  const day = created.at.slice(0, 10);
  const when = daysBetween(day, today) === 0 ? 'today' : `on ${dayWords(day, today)}`;
  return who ? `Added by ${who} ${when}` : `Added ${when}`;
}

/** What the options sheet offers, depending on who's looking (spec 13.3). */
export function itemOptions(ctx: OptionsContext): OptionsModel {
  const { item, activity, owner, members, today } = ctx;
  const parents = members.filter(m => m.parent && m.id !== owner.id);
  const ownerIsParent = owner.parent;
  const memberTag = ctx.member === 'pin' ? `🔒 ${owner.name}'s PIN` : undefined;
  const parentTag = ctx.parent === 'pin' ? '🔒 parent' : ctx.parent === 'no_pin' ? 'needs a parent\'s PIN' : undefined;
  const status = item.status;
  const open = status === 'open' || status === 'sent_back';
  const member: OptionModel[] = [];
  const parent: OptionModel[] = [];
  const due = item.due_day;
  const memberMay = ctx.member !== 'no';

  if (open && memberMay) {
    const chips = planChips(item, today);
    if (chips.length) {
      member.push({
        id: 'plan_day', label: 'Plan it for a day', tag: memberTag, chips,
        hint: due ? `Shows on that day, and it's still due ${dayWords(due, today)}.` : 'Shows on that day.',
      });
    }
    if (!ownerIsParent && due && !item.request) {
      member.push({
        id: 'more_time', label: 'Ask for more time', tag: 'needs OK', chips: moreTimeChips(item, today),
        pick: { min: addDays(due, 1), max: addDays(today, 60) },
        hint: parents.length ? `Sends a request to ${names(parents)}.` : 'Sends a request to the parents.',
      });
      member.push({ id: 'skip', label: 'Ask to skip this week', tag: 'needs OK', hint: 'Sick, away, rained out…' });
    }
    member.push({ id: 'done_by', label: 'Done by someone else…', tag: memberTag, hint: 'They get the credit.' });
  }
  if ((status === 'done' || status === 'pending') && memberMay) {
    member.push({ id: 'undo', label: 'Uncheck it', tag: memberTag, hint: 'It goes back on the list.' });
    if (status === 'done') member.push({ id: 'done_by', label: 'Done by someone else…', tag: memberTag, hint: 'Change who gets the credit.' });
  }
  member.push({ id: 'history', label: 'History', hint: 'The streak, recent check-offs, and when it usually gets done.' });

  if (ctx.parent !== 'no') {
    if (status === 'pending') {
      parent.push({ id: 'approve', label: 'Looks good', tag: parentTag, hint: 'Approves it, and the stars are earned.' });
      parent.push({ id: 'send_back', label: 'Send back', tag: parentTag, hint: 'It goes back on the list with a note.' });
    }
    if (open) {
      parent.push({
        id: 'change_due', label: 'Change the due date', tag: parentTag, chips: dueChips(item, today),
        pick: { min: today }, hint: due ? `Due ${dayWords(due, today)} now.` : 'It has no due date now.',
      });
      parent.push({ id: 'hand_off', label: 'Hand it to someone else', tag: parentTag, hint: 'Just this time.' });
      parent.push({ id: 'excuse', label: 'Excuse it', tag: parentTag, hint: 'A sick day: nothing is missed, and the streak holds.' });
    }
    parent.push({ id: 'delete', label: 'Delete the chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
  }

  const minutes = item.window === 'once' && activity?.once ? activity.once.estimate_minutes : item.credit_minutes;
  const metaParts = [owner.name, rhythmText(activity, item, today), minutesText(minutes)];
  if (owner.stars && item.stars > 0) metaParts.push(`★ ${item.stars}`);
  const request = item.request
    ? item.request.kind === 'more_time' && item.request.until
      ? `Waiting for a parent: more time, until ${dayWords(item.request.until, today)}.`
      : 'Waiting for a parent: skip this week.'
    : null;
  return {
    title: item.name,
    meta: metaParts.filter(Boolean).join(' · '),
    added: addedLine(activity, members, today),
    note: status === 'sent_back' ? (item.note ? `Sent back: ${item.note}` : 'Sent back') : request,
    member,
    parent,
  };
}

const BAND_WORDS: Record<Band, string> = { morning: 'in the morning', afternoon: 'in the afternoon', evening: 'in the evening' };
const PLURAL: Record<string, string> = {
  mon: 'Mondays', tue: 'Tuesdays', wed: 'Wednesdays', thu: 'Thursdays', fri: 'Fridays', sat: 'Saturdays', sun: 'Sundays',
};

/** The History lines (spec 13.3): the streak, how often lately, the last time, and when it usually gets done. */
export function historyLines(history: ChoreHistory, today: string, members: Member[], timeFormat: '12h' | '24h'): string[] {
  const lines: string[] = [];
  if (history.streak.days) lines.push(`🔥 ${history.streak.days} ${history.streak.days === 1 ? 'day' : 'days'} in a row`);
  if (history.streak.weeks) lines.push(`🔥 ${history.streak.weeks} ${history.streak.weeks === 1 ? 'week' : 'weeks'} in a row`);
  if (history.weeks.of > 0 && history.streak.days === undefined) {
    lines.push(`Done ${history.weeks.done} of the last ${history.weeks.of} ${history.weeks.of === 1 ? 'week' : 'weeks'}`);
  }
  const last = history.recent[0];
  if (last) {
    const at = new Date(last.at);
    const day = last.at.slice(0, 10);
    const hour = timeFormat === '24h'
      ? `${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`
      : `${at.getHours() % 12 || 12}:${String(at.getMinutes()).padStart(2, '0')} ${at.getHours() >= 12 ? 'PM' : 'AM'}`;
    const by = last.done_by !== history.member ? members.find(m => m.id === last.done_by)?.name : null;
    lines.push(`Last done ${dayWords(day, today)} at ${hour}${by ? ` by ${by}` : ''}`);
  } else {
    lines.push('Not done yet');
  }
  const { band, day } = history.usual;
  if (day && band) lines.push(`Usually ${PLURAL[day]} ${BAND_WORDS[band]}`);
  else if (band) lines.push(`Usually ${BAND_WORDS[band]}`);
  return lines;
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import { SheetMotion } from '../../shell/sheet-motion';
import { choresStyles } from './chores-styles';
import type { OptionId, OptionModel, OptionsModel } from './options-derive';

const ICONS: Record<OptionId, string> = {
  plan_day: '📅', more_time: '⏰', skip: '🛌', done_by: '🙋', history: '📜', undo: '↩️',
  change_due: '🗓️', hand_off: '🔁', excuse: '🤒', delete: '🗑️', approve: '✅', send_back: '↩️',
};

/** Quick reasons for Send back (spec 13.7). */
export const SEND_BACK_REASONS = ['Not finished', 'Missed a spot', 'Do it again'];

export interface OptionChoice {
  id: OptionId;
  /** The day picked (plan a day, change the due date, more time), or a Send back note. */
  value?: string;
}

/**
 * pv-chore-options: what can be done about one chore, by whoever is looking
 * (spec 13.3). A member plans a day, asks for more time or to skip, or says
 * someone else did it; parents also change the due date, hand it over,
 * excuse it, or delete the chore, behind a parent's PIN on a shared screen.
 *
 * @fires pv-option - OptionChoice when an option (and its day or note) is picked
 * @fires pv-sheet-close - the sheet left (Done, Escape, a tap outside, or a drag down)
 */
export class PvChoreOptions extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) model!: OptionsModel;
  @property({ type: String }) color = '#5B5BD6';
  /** The History lines once they arrive; null before. */
  @property({ attribute: false }) history: string[] | null = null;
  /** An option is being saved: the sheet waits. */
  @property({ type: Boolean }) busy = false;

  @state() private _open: OptionId | null = null;
  @state() private _note = '';
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    choresStyles,
    css`
      .panel {
        padding-top: 0;
        border-top: 4px solid var(--member);
      }

      :host([layout='landscape']) .panel {
        width: min(460px, calc(100vw - 32px));
        padding-top: 0;
      }

      .top {
        padding: 18px 2px 12px;
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .meta-line {
        margin-top: 4px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .added {
        margin-top: 2px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      .note {
        margin-top: 8px;
      }

      .group {
        margin: 14px 2px 2px;
        font-size: 0.75rem;
        font-weight: 750;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted, #8E949C);
      }

      .option {
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .option > button {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 8px 2px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .option > button:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 10px;
      }

      .option > button[disabled] {
        opacity: 0.5;
        cursor: default;
      }

      .icon {
        width: 28px;
        flex-shrink: 0;
        text-align: center;
        font-size: 1.125rem;
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .label {
        font-size: 1rem;
      }

      .option.destructive .label {
        color: var(--pv-danger, #C62828);
      }

      .hint {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }

      .tag {
        flex-shrink: 0;
        padding: 3px 8px;
        border-radius: 8px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.75rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .tag.ask {
        background: var(--pv-warn-bg, #FDF1DC);
        color: var(--pv-warn-ink, #8A5A00);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 2px 14px 42px;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip:hover,
      .chip:focus-visible {
        border-color: var(--pv-accent, #5B5BD6);
        outline: none;
      }

      input[type='date'],
      input[type='text'] {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .history {
        margin: 0;
        padding: 0 2px 14px 42px;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: var(--pv-text-secondary, #5F6670);
      }

      .loading {
        width: 60%;
        height: 14px;
      }

      .actions {
        margin-top: 14px;
      }
    `,
  ];

  firstUpdated(): void {
    this.style.setProperty('--member', this.color);
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLElement>('.option > button')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  /** Leave, then say so. */
  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  render() {
    const model = this.model;
    if (!model) return nothing;
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="options-title" @keydown=${this._key}
        aria-busy=${this.busy ? 'true' : 'false'}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="options-title">${model.title}</h2>
          <div class="meta-line">${model.meta}</div>
          ${model.added ? html`<div class="added">${model.added}</div>` : nothing}
          ${model.note ? html`<div class="note"><span class="badge ${model.note.startsWith('Sent back') ? 'bad' : 'act'}">${model.note}</span></div>` : nothing}
        </div>
        ${model.member.map(option => this._option(option))}
        ${model.parent.length ? html`<div class="group">For parents</div>${model.parent.map(option => this._option(option))}` : nothing}
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
        </div>
      </div>
    `;
  }

  private _option(option: OptionModel) {
    const open = this._open === option.id;
    const expands = !!option.chips?.length || !!option.pick || option.id === 'history' || option.id === 'send_back';
    return html`
      <div class="option ${option.destructive ? 'destructive' : ''}">
        <button type="button" ?disabled=${option.disabled || this.busy} aria-expanded=${expands ? (open ? 'true' : 'false') : nothing}
          @click=${() => this._tap(option, expands)}>
          <span class="icon" aria-hidden="true">${ICONS[option.id]}</span>
          <span class="words">
            <span class="label">${option.label}</span>
            ${option.hint ? html`<span class="hint">${option.hint}</span>` : nothing}
          </span>
          ${option.tag ? html`<span class="tag ${option.tag === 'needs OK' ? 'ask' : ''}">${option.tag}</span>` : nothing}
        </button>
        ${open ? this._more(option) : nothing}
      </div>
    `;
  }

  private _more(option: OptionModel) {
    if (option.id === 'history') {
      return this.history
        ? html`<ul class="history">${this.history.map(line => html`<li>${line}</li>`)}</ul>`
        : html`<ul class="history" aria-busy="true"><li class="bone loading"></li><li class="bone loading"></li></ul>`;
    }
    if (option.id === 'send_back') {
      return html`
        <div class="chips">
          ${SEND_BACK_REASONS.map(reason => html`
            <button class="chip" type="button" @click=${() => this._choose(option.id, reason)}>${reason}</button>
          `)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${(e: Event) => { this._note = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && this._note.trim()) this._choose(option.id, this._note.trim()); }} />
          ${this._note.trim() ? html`<button class="chip" type="button" @click=${() => this._choose(option.id, this._note.trim())}>Send back</button>` : nothing}
        </div>
      `;
    }
    return html`
      <div class="chips">
        ${(option.chips ?? []).map(chip => html`
          <button class="chip" type="button" @click=${() => this._choose(option.id, chip.day)}>${chip.label}</button>
        `)}
        ${option.pick ? html`
          <input type="date" aria-label="Pick a date" min=${option.pick.min} max=${option.pick.max ?? nothing}
            @change=${(e: Event) => { const value = (e.target as HTMLInputElement).value; if (value) this._choose(option.id, value); }} />
        ` : nothing}
      </div>
    `;
  }

  private _tap(option: OptionModel, expands: boolean): void {
    if (expands) {
      this._open = this._open === option.id ? null : option.id;
      if (option.id === 'history' && this._open === 'history') this._choose('history');
      return;
    }
    this._choose(option.id);
  }

  private _choose(id: OptionId, value?: string): void {
    this.dispatchEvent(new CustomEvent<OptionChoice>('pv-option', { detail: { id, value }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chore-options', PvChoreOptions);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 11d4a38..aaf9f93 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -18,18 +18,24 @@ import type { Board } from './chores-types';
 import type { RowModel } from './board-derive';
 import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
+import { dayWords, historyLines, itemOptions } from './options-derive';
+import type { OptionChoice } from './pv-chore-options';
+import { errorMessage } from '../../core/ws-api';
 import { chime, haptic } from './effects';
 import type { PvChoresBoard } from './pv-chores-board';
 import '../../core/pv-toast';
 import '../../shell/pv-notice-sheet';
 import './pv-chores-board';
 import './pv-chores-people-sheet';
+import './pv-chore-options';
 
 /** A sheet the chores screens show over themselves. */
 type ChoresSheet =
   | { kind: 'start_over' }
   | { kind: 'no_pin'; heading: string }
-  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void };
+  | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void }
+  | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
+  | { kind: 'delete'; row: RowModel };
 
 /** What the last check-off toast can take back or hand to someone else. */
 interface LastCheckoff {
@@ -223,7 +229,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         .minute=${this._minute}
         @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
         @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
-        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}></pv-chores-board>
+        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
+        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}></pv-chores-board>
     `;
   }
 
@@ -328,6 +335,157 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     this.showToast({ id: `hint-${Date.now()}`, text, ms: 3500 });
   }
 
+  /** The board item with this key now (the feed may have changed it since a sheet opened). */
+  private _itemRow(key: string): RowModel | null {
+    const board = this.service?.board();
+    if (!board) return null;
+    for (const entry of Object.values(board.members)) {
+      const item = entry.items.find(i => i.key === key);
+      if (item) return { key, item, name: item.name, icon: item.icon, label: null, badge: null, meta: '', state: item.status };
+    }
+    return null;
+  }
+
+  private _openOptions(row: RowModel): void {
+    this._sheet = { kind: 'options', key: row.key, history: null, busy: false };
+  }
+
+  private _optionsModel(key: string) {
+    const board = this.service?.board();
+    const row = this._itemRow(key);
+    const owner = row ? this._member(row.item.member) : undefined;
+    if (!board || !row || !owner) return null;
+    return {
+      row,
+      owner,
+      model: itemOptions({
+        item: row.item,
+        activity: board.chores.find(a => a.id === row.item.chore),
+        owner,
+        members: inOrder(this.household?.members ?? []),
+        today: board.today,
+        member: memberAccess(this.household, this.session, owner.id),
+        parent: parentAccess(this.household, this.session),
+      }),
+    };
+  }
+
+  /** Run one change from a sheet: close it and say what happened, or say what went wrong (spec 11.7). */
+  private async _run(action: () => Promise<unknown>, done: string): Promise<boolean> {
+    try {
+      await action();
+      this._sheet = null;
+      this.showToast({ id: `ok-${Date.now()}`, text: done });
+      return true;
+    } catch (err) {
+      this.showToast({ id: `err-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad', ms: 6000 });
+      if (this._sheet?.kind === 'options') this._sheet = { ...this._sheet, busy: false };
+      return false;
+    }
+  }
+
+  private async _option(key: string, choice: OptionChoice): Promise<void> {
+    const service = this.service;
+    const found = this._optionsModel(key);
+    const board = service?.board();
+    if (!service || !found || !board) return;
+    const { row, owner } = found;
+    const item = row.item;
+    const api = service.api;
+    const today = board.today;
+    const name = row.name;
+    switch (choice.id) {
+      case 'history': {
+        try {
+          const history = await api.history(item.chore, item.member);
+          if (this._sheet?.kind === 'options' && this._sheet.key === key) {
+            this._sheet = { ...this._sheet, history: historyLines(history, today, this.household?.members ?? [], this.display?.time_format ?? '12h') };
+          }
+        } catch {
+          if (this._sheet?.kind === 'options') this._sheet = { ...this._sheet, history: ['History isn\'t available right now.'] };
+        }
+        return;
+      }
+      case 'plan_day': {
+        if (!choice.value || !(await this.asMember(owner.id, `Who's planning ${name}?`))) return;
+        const due = item.due_day ? ` It's still due ${dayWords(item.due_day, today)}.` : '';
+        await this._run(() => api.override(key, { planned_day: choice.value }), `${name} shows on ${dayWords(choice.value, today)}.${due}`);
+        return;
+      }
+      case 'more_time': {
+        if (!choice.value || !(await this.asMember(owner.id, `Who's asking for more time?`))) return;
+        await this._run(() => api.request('more_time', key, choice.value), 'Asked for more time. A parent will answer.');
+        return;
+      }
+      case 'skip': {
+        if (!(await this.asMember(owner.id, `Who's asking to skip ${name}?`))) return;
+        await this._run(() => api.request('skip', key), 'Asked to skip this week. A parent will answer.');
+        return;
+      }
+      case 'undo': {
+        if (!(await this.asMember(owner.id, `Who's unchecking ${name}?`))) return;
+        service.enqueue({ op: 'undo', occurrence: key, member: owner.id, name });
+        this._sheet = null;
+        this.showToast({ id: `undo-${key}-${Date.now()}`, text: `${name} is open again.` });
+        return;
+      }
+      case 'done_by': {
+        const people = inOrder(this.household?.members ?? []).filter(m => m.id !== owner.id);
+        this._sheet = {
+          kind: 'people', heading: 'Who did it?', people,
+          body: `They get the credit for ${name}.`,
+          pick: async member => {
+            if (!member || !(await this.asMember(owner.id, `Who's checking off ${name}?`))) return;
+            const fresh = this.service?.board();
+            if (!fresh) return;
+            if (item.status === 'done' || item.status === 'pending') {
+              service.enqueue({ op: 'undo', occurrence: key, member: owner.id, name });
+            }
+            this._checkOff(row, owner.id, fresh, member.id);
+          },
+        };
+        return;
+      }
+      case 'change_due': {
+        if (!choice.value || !(await this.asParent(`Who's changing ${name}?`))) return;
+        await this._run(() => api.override(key, { due: choice.value }), `${name} is due ${dayWords(choice.value!, today)} now.`);
+        return;
+      }
+      case 'hand_off': {
+        const people = inOrder(this.household?.members ?? []).filter(m => m.id !== owner.id);
+        this._sheet = {
+          kind: 'people', heading: `Who's doing ${name}?`, people, body: 'Just this time. It comes back next time.',
+          pick: async member => {
+            if (!member || !(await this.asParent(`Who's handing ${name} over?`))) return;
+            await this._run(() => api.override(key, { assignee: member.id }), `${name} is ${member.name}'s this time.`);
+          },
+        };
+        return;
+      }
+      case 'excuse': {
+        if (!(await this.asParent(`Who's excusing ${name}?`))) return;
+        await this._run(() => api.override(key, { excused: true }), `${name} is excused. Nothing is missed.`);
+        return;
+      }
+      case 'approve':
+      case 'send_back': {
+        const request = item.completion?.id;
+        if (!request || !(await this.asParent(choice.id === 'approve' ? "Who's approving?" : "Who's sending it back?"))) return;
+        const allow = choice.id === 'approve';
+        await this._run(
+          () => api.review(request, allow ? 'allow' : 'decline', allow ? null : choice.value ?? null),
+          allow ? `${name}: looks good.` : `${name} went back${choice.value ? `: ${choice.value}` : ''}.`,
+        );
+        return;
+      }
+      case 'delete': {
+        if (!(await this.asParent(`Who's deleting ${name}?`))) return;
+        this._sheet = { kind: 'delete', row };
+        return;
+      }
+    }
+  }
+
   /** "Someone else did it?": pick who, then credit them instead (spec 13.2). */
   private _someoneElse(last: LastCheckoff): void {
     const people = inOrder(this.household?.members ?? []).filter(m => m.id !== last.member);
@@ -443,6 +601,28 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _renderSheet() {
     const sheet = this._sheet;
     if (!sheet) return this.renderSheet();
+    if (sheet.kind === 'options') {
+      const found = this._optionsModel(sheet.key);
+      if (!found) {
+        queueMicrotask(() => { if (this._sheet === sheet) this._sheet = null; });
+        return nothing;
+      }
+      return html`
+        <pv-chore-options .layout=${this.layout} .model=${found.model} color=${memberColor(found.owner, this.mode)}
+          .history=${sheet.history} ?busy=${sheet.busy}
+          @pv-option=${(e: CustomEvent<OptionChoice>) => void this._option(sheet.key, e.detail)}
+          @pv-sheet-close=${() => { if (this._sheet === sheet) this._sheet = null; }}></pv-chore-options>
+      `;
+    }
+    if (sheet.kind === 'delete') {
+      const name = sheet.row.name;
+      return html`
+        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${name}?`}
+          body="It leaves the board for everyone now. Past weeks still show what was done, and stars stay earned."
+          .actions=${[{ id: 'delete', label: `Delete ${name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
+          @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => void this._confirmDelete(sheet.row, e.detail.id)}></pv-notice-sheet>
+      `;
+    }
     if (sheet.kind === 'people') {
       return html`
         <pv-chores-people-sheet .layout=${this.layout} heading=${sheet.heading} body=${sheet.body ?? ''}
@@ -467,6 +647,12 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     `;
   }
 
+  private async _confirmDelete(row: RowModel, id: string): Promise<void> {
+    this._sheet = null;
+    if (id !== 'delete' || !this.service) return;
+    await this._run(() => this.service!.api.deleteActivity(row.item.chore), `Deleted ${row.name}.`);
+  }
+
   private async _onStartOver(id: string): Promise<void> {
     this._sheet = null;
     if (id !== 'start_over') return;
```

- [ ] **Step 4: Run them again.** Same command. Expected: `13 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `536 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): the options sheet` with the trailers.

---

### Task 7: Waiting for OK and quick add

Spec 13.7 (one inbox for chores to check, requests, and rewards; Approve all; Send back with quick reasons; a panel beside the board in landscape, a sheet in portrait) and 13.8 (quick add in parent mode: what, who, when, about how long, Needs a parent's OK on for young children, and what it earns).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/inbox-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/picture-words.ts`, `custom_components/planavista/frontend/src/modules/chores/quick-add.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/inbox-quick-add.test.ts`

**Interfaces:**
- Consumes: Tasks 3 to 6.
- Produces: `InboxRow`, `InboxGroups`, `inboxGroups(requests, members, today, format)`, `whenText`, `answeredText`; `pictureFor(text, fallback)`; `QuickAddDraft`, `newDraft`, `withWho`, `autoNeedsOk`, `byChips`, `everyChoices`, `worthLine`, `quickAddProblem`, `activityFrom(draft, today)`, `MINUTE_CHOICES`; `pv-chores-inbox` (events `pv-review`, `pv-approve-all`, `pv-sheet-close`); `pv-chores-quick-add` (events `pv-quick-add`, `pv-sheet-close`); the module answers `moduleAction('inbox')` and `moduleAction('add')`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/inbox-quick-add.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { answeredText, inboxGroups, whenText } from '../src/modules/chores/inbox-derive';
import {
  activityFrom,
  autoNeedsOk,
  byChips,
  everyChoices,
  newDraft,
  quickAddProblem,
  withWho,
  worthLine,
} from '../src/modules/chores/quick-add';
import { pictureFor } from '../src/modules/chores/picture-words';
import type { ChoreRequest } from '../src/modules/chores/chores-types';
import { MEMBERS, TODAY } from './chores-fixtures';

const REQUESTS: ChoreRequest[] = [
  { id: 'c1', kind: 'completion', member: 'dana', done_by: 'dana', name: 'Feed the fish', at: '2026-10-13T15:58:00-05:00', stars: 1, chore: 'feed_the_fish', occurrence: 'x' },
  { id: 'c2', kind: 'completion', member: 'casey', done_by: 'blair', name: 'Clean the bathroom', at: '2026-10-12T19:10:00-05:00', stars: 4, chore: 'clean_the_bathroom', occurrence: 'y' },
  { id: 'r1', kind: 'more_time', member: 'casey', name: 'Yard work', at: '2026-10-13T12:00:00-05:00', until: '2026-10-25', chore: 'yard_work', occurrence: 'z' },
  { id: 'r2', kind: 'skip', member: 'casey', name: 'Rake the leaves', at: '2026-10-13T12:05:00-05:00', chore: 'rake', occurrence: 'w' },
  { id: 'g1', kind: 'redemption', member: 'casey', name: 'Pick the weekend game', at: '2026-10-13T13:00:00-05:00', reward: 'game', cost: 10, balance: 23 },
  { id: 'g2', kind: 'redemption', member: 'dana', name: 'Movie night pick', at: '2026-10-13T13:00:00-05:00', reward: 'movie', cost: 40, balance: 12 },
];

describe('inboxGroups (spec 13.7)', () => {
  const groups = inboxGroups(REQUESTS, MEMBERS, TODAY, '12h');

  it('puts chores to check, requests, and rewards in their groups', () => {
    expect(groups.count).toBe(6);
    expect(groups.chores.map(r => r.id)).toEqual(['c1', 'c2']);
    expect(groups.requests.map(r => r.id)).toEqual(['r1', 'r2']);
    expect(groups.rewards.map(r => r.id)).toEqual(['g1', 'g2']);
  });

  it('words each the way the approved inbox does', () => {
    expect(groups.chores[0]).toMatchObject({ lead: 'Dana finished', what: 'Feed the fish', detail: 'Today at 3:58 PM · ★ 1', allow: 'Looks good', decline: 'Send back' });
    expect(groups.chores[1]).toMatchObject({ lead: 'Blair finished', tail: ' for Casey', detail: 'Yesterday at 7:10 PM · ★ 4' });
    expect(groups.requests[0]).toMatchObject({ lead: 'Casey asks for more time on', what: 'Yard work', detail: 'Move the due date to October 25', allow: 'Allow', decline: 'Not this time' });
    expect(groups.requests[1]).toMatchObject({ lead: 'Casey asks to skip', tail: ' this week' });
    expect(groups.rewards[0]).toMatchObject({ lead: 'Casey wants', detail: '★ 10 of 23', allow: 'Approve', blocked: false });
    expect(groups.rewards[1]).toMatchObject({ detail: '★ 40, and Dana has 12: not enough stars yet', blocked: true });
  });

  it('says what was done once a parent answers', () => {
    expect(answeredText(groups.chores[0], true)).toBe('Feed the fish: looks good.');
    expect(answeredText(groups.chores[0], false, 'Missed a spot')).toBe('Feed the fish went back: Missed a spot.');
    expect(answeredText(groups.rewards[0], true)).toBe('Pick the weekend game is Casey\'s.');
    expect(answeredText(groups.requests[0], false)).toBe('Not this time: Yard work.');
  });

  it('words when', () => {
    expect(whenText('2026-10-13T09:05:00-05:00', TODAY, '24h')).toBe('Today at 9:05');
    expect(whenText('2026-10-10T09:05:00-05:00', TODAY, '12h')).toBe('Saturday at 9:05 AM');
  });
});

describe('quick add (spec 13.8)', () => {
  it('turns Needs a parent\'s OK on for young children, until a parent sets it', () => {
    expect(autoNeedsOk(['dana'], MEMBERS)).toBe(true);
    let draft = withWho(newDraft(), ['casey'], MEMBERS);
    expect(draft.needsOk).toBe(false);
    draft = withWho(draft, ['casey', 'dana'], MEMBERS);
    expect(draft.needsOk).toBe(true);
    draft = withWho({ ...draft, needsOk: false, needsOkSet: true }, ['dana'], MEMBERS);
    expect(draft.needsOk).toBe(false);
  });

  it('offers Tomorrow, Saturday, and Sunday', () => {
    expect(byChips(TODAY).map(c => [c.day, c.label])).toEqual([
      ['2026-10-14', 'Tomorrow'], ['2026-10-17', 'Saturday'], ['2026-10-18', 'Sunday'],
    ]);
    expect(byChips('2026-10-16').map(c => c.label)).toEqual(['Tomorrow', 'Sunday']);
  });

  it('words its repeats from today', () => {
    expect(everyChoices(TODAY).map(c => c.label)).toEqual(['Every day', 'Every Tuesday', 'Every month on the 13th']);
    expect(everyChoices('2026-10-31')[2].label).toBe('Every month on the 28th');
    expect(everyChoices('2026-10-22')[2].label).toBe('Every month on the 22nd');
  });

  it('says what it earns, from the engine\'s formula', () => {
    expect(worthLine({ ...newDraft(), minutes: 60 }, 15)).toBe('Earns ★ 4 (1 per 15 minutes)');
    expect(worthLine({ ...newDraft(), minutes: 60, stars: 10 }, 15)).toBe('Earns ★ 10 each time');
  });

  it('says what is missing', () => {
    expect(quickAddProblem(newDraft(), TODAY)).toBe('Add what needs doing.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car' }, TODAY)).toBe('Pick who does it.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car', who: ['casey'], when: 'by' }, TODAY)).toBe('Pick a day to finish by.');
    expect(quickAddProblem({ ...newDraft(), name: 'Wash the car', who: ['casey'] }, TODAY)).toBeNull();
  });

  it('saves a Once chore for today or by a date, or a simple Repeats one', () => {
    const draft = { ...newDraft(), name: ' Clean out the garage ', who: ['casey'], minutes: 60, needsOk: true };
    expect(activityFrom(draft, TODAY)).toEqual({
      name: 'Clean out the garage', icon: '📦', category: 'other', assignees: ['casey'], on_board: true, needs_ok: true, stars: null,
      schedule: 'once', once: { on: TODAY, by: null, by_time: null, sessions: 1, estimate_minutes: 60 },
    });
    expect(activityFrom({ ...draft, when: 'by', by: '2026-10-17' }, TODAY).once).toMatchObject({ on: null, by: '2026-10-17' });
    expect(activityFrom({ ...draft, when: 'repeats', every: 'weekly' }, TODAY).repeats).toEqual({
      rrule: 'FREQ=WEEKLY;BYDAY=TU', start: TODAY, window: 'day', estimate_minutes: 60,
    });
    expect(activityFrom({ ...draft, when: 'repeats', every: 'monthly' }, '2026-10-30').repeats?.rrule).toBe('FREQ=MONTHLY;BYMONTHDAY=28');
  });
});

describe('pictureFor', () => {
  it('finds a picture in a name, or falls back', () => {
    expect(pictureFor('Take out the trash')).toBe('🗑️');
    expect(pictureFor('Swim practice', '📅')).toBe('🏊');
    expect(pictureFor('Rake the leaves')).toBe('🍂');
    expect(pictureFor('Something new')).toBe('⭐');
    expect(pictureFor('Book club', '📅')).toBe('📅');
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/inbox-quick-add.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/inbox-derive`.

- [ ] **Step 3: Write the rules, the inbox, and quick add.**

`custom_components/planavista/frontend/src/modules/chores/picture-words.ts` (new):

```ts
/**
 * A picture for a chore or an event from its name (spec 13.4, 13.8): what a
 * young child sees on a tile, and what quick add picks for a new chore until
 * a parent chooses another in the chore editor. Presentation only.
 */
const WORDS: Array<[RegExp, string]> = [
  [/\b(trash|garbage|bins?|recycling)\b/i, '🗑️'],
  [/\b(dish(es)?|dishwasher)\b/i, '🍽️'],
  [/\b(laundry|clothes|fold)\b/i, '🧺'],
  [/\bbeds?\b/i, '🛏️'],
  [/\btoys?\b/i, '🧸'],
  [/\bfish\b/i, '🐠'],
  [/\bcats?\b/i, '🐱'],
  [/\b(dogs?|walk the dog)\b/i, '🐕'],
  [/\b(pets?|feed)\b/i, '🐾'],
  [/\btable\b/i, '🍴'],
  [/\b(vacuum|sweep|mop|floors?)\b/i, '🧹'],
  [/\b(bath(room)?|toilet|shower|tub)\b/i, '🛁'],
  [/\b(leaf|leaves|rake)\b/i, '🍂'],
  [/\b(yard|garden|lawn|weeds?|mow)\b/i, '🌿'],
  [/\b(grocer(y|ies)|shopping|shop)\b/i, '🛒'],
  [/\b(plants?|flowers?)\b/i, '🪴'],
  [/\bcar\b/i, '🚗'],
  [/\b(garage|boxes|closet|attic|basement)\b/i, '📦'],
  [/\b(cook|dinner|lunch|breakfast|meal)\b/i, '🍳'],
  [/\b(homework|study|reading|read)\b/i, '📚'],
  [/\b(teeth|toothbrush)\b/i, '🪥'],
  [/\b(fix|repair|latch)\b/i, '🔨'],
  [/\bfilters?\b/i, '🔧'],
  [/\b(budget|bills?|finance|money)\b/i, '💵'],
  [/\b(windows?|dust|tidy|clean)\b/i, '✨'],
  [/\b(swim(ming)?|pool)\b/i, '🏊'],
  [/\b(soccer|football)\b/i, '⚽'],
  [/\bbasketball\b/i, '🏀'],
  [/\bbaseball\b/i, '⚾'],
  [/\b(school|class)\b/i, '🏫'],
  [/\bdentist\b/i, '🦷'],
  [/\b(doctor|checkup)\b/i, '🩺'],
  [/\b(piano|music|guitar|violin|band)\b/i, '🎹'],
  [/\b(dance|ballet)\b/i, '🩰'],
  [/\b(birthday|party)\b/i, '🎉'],
  [/\bpizza\b/i, '🍕'],
  [/\bmovies?\b/i, '🎬'],
  [/\b(practice|game|match|training)\b/i, '🏅'],
  [/\b(meeting|work|standup)\b/i, '💼'],
  [/\b(trip|travel|flight)\b/i, '🧳'],
  [/\b(bus)\b/i, '🚌'],
  [/\b(drop-off|pick-?up)\b/i, '🚗'],
  [/\b(church|temple|mosque)\b/i, '⛪'],
  [/\b(study group|tutor)\b/i, '📚'],
];

export function pictureFor(text: string, fallback = '⭐'): string {
  for (const [pattern, picture] of WORDS) {
    if (pattern.test(text)) return picture;
  }
  return fallback;
}
```

`custom_components/planavista/frontend/src/modules/chores/inbox-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import { daysBetween } from '../../core/status-map';
import type { ChoreRequest } from './chores-types';
import { clockTime } from './calendar-ties';
import { dayWords } from './options-derive';

/** One request in the Waiting for OK inbox (spec 13.7). */
export interface InboxRow {
  id: string;
  kind: ChoreRequest['kind'];
  member: Member | null;
  /** "Dana finished", "Casey asks for more time on", "Casey wants". */
  lead: string;
  /** The chore or reward, in bold. */
  what: string;
  /** What follows ("this week" after a skip). */
  tail: string;
  /** "Today at 3:58 PM · ★ 1", "Move the due date to next Sunday", "★ 10 of 23". */
  detail: string;
  allow: string;
  decline: string;
  /** Approving isn't possible now (not enough stars). */
  blocked: boolean;
}

export interface InboxGroups {
  chores: InboxRow[];
  requests: InboxRow[];
  rewards: InboxRow[];
  count: number;
}

/** "Today at 3:58 PM", "Yesterday at 7:10 PM", "Monday at 9:00 AM". */
export function whenText(at: string, today: string, format: '12h' | '24h'): string {
  const date = new Date(at);
  const pad = (v: number) => String(v).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = clockTime(date, format, format === '12h');
  const ago = daysBetween(day, today);
  if (ago === 0) return `Today at ${time}`;
  if (ago === 1) return `Yesterday at ${time}`;
  const words = dayWords(day, today);
  return `${words[0].toUpperCase()}${words.slice(1)} at ${time}`;
}

/** The inbox in its three groups: Chores to check, Requests, and Rewards (spec 13.7). */
export function inboxGroups(requests: ChoreRequest[], members: Member[], today: string, format: '12h' | '24h'): InboxGroups {
  const byId = new Map(members.map(m => [m.id, m]));
  const groups: InboxGroups = { chores: [], requests: [], rewards: [], count: requests.length };
  for (const r of requests) {
    const member = byId.get(r.member) ?? null;
    const name = member?.name ?? r.member;
    if (r.kind === 'completion') {
      const doer = r.done_by && r.done_by !== r.member ? byId.get(r.done_by)?.name ?? r.done_by : null;
      const stars = r.stars ? ` · ★ ${r.stars}` : '';
      groups.chores.push({
        id: r.id, kind: r.kind, member, lead: doer ? `${doer} finished` : `${name} finished`, what: r.name,
        tail: doer ? ` for ${name}` : '', detail: `${whenText(r.at, today, format)}${stars}`,
        allow: 'Looks good', decline: 'Send back', blocked: false,
      });
    } else if (r.kind === 'more_time' || r.kind === 'skip') {
      const more = r.kind === 'more_time';
      groups.requests.push({
        id: r.id, kind: r.kind, member,
        lead: more ? `${name} asks for more time on` : `${name} asks to skip`,
        what: r.name, tail: more ? '' : ' this week',
        detail: more && r.until ? `Move the due date to ${dayWords(r.until, today)}` : 'It would be excused, so nothing is missed.',
        allow: 'Allow', decline: 'Not this time', blocked: false,
      });
    } else {
      const cost = r.cost ?? 0;
      const balance = r.balance ?? 0;
      groups.rewards.push({
        id: r.id, kind: r.kind, member, lead: `${name} wants`, what: r.name, tail: '',
        detail: balance >= cost ? `★ ${cost} of ${balance}` : `★ ${cost}, and ${name} has ${balance}: not enough stars yet`,
        allow: 'Approve', decline: 'Decline', blocked: balance < cost,
      });
    }
  }
  return groups;
}

/** What the toast says once a parent answered. */
export function answeredText(row: InboxRow, allowed: boolean, note?: string | null): string {
  if (row.kind === 'completion') return allowed ? `${row.what}: looks good.` : `${row.what} went back${note ? `: ${note}` : ''}.`;
  if (row.kind === 'redemption') return allowed ? `${row.what} is ${row.member?.name ?? 'theirs'}'s.` : `${row.what}: declined.`;
  return allowed ? `Allowed: ${row.what}.` : `Not this time: ${row.what}.`;
}
```

`custom_components/planavista/frontend/src/modules/chores/quick-add.ts` (new):

```ts
import type { Member } from '../../core/household';
import { dayDate } from '../../core/status-map';
import { perStarText, starsFor } from '../../core/stars';
import type { Activity } from './chores-types';
import { DayChip, addDays, chipLabel } from './options-derive';
import { pictureFor } from './picture-words';

export type When = 'today' | 'by' | 'repeats';
export type Every = 'daily' | 'weekly' | 'monthly';

/** Quick add's answers so far (spec 13.8). */
export interface QuickAddDraft {
  name: string;
  who: string[];
  when: When;
  /** The date to finish by. */
  by: string | null;
  every: Every;
  minutes: number;
  needsOk: boolean;
  /** A parent switched Needs a parent's OK themselves: it stops following the people picked. */
  needsOkSet: boolean;
  /** null: automatic (1 per the household's minutes per star). */
  stars: number | null;
}

/** About how long (spec 13.8): 5 min, 15 min, 30 min, 1 h, 2 h, or Other. */
export const MINUTE_CHOICES = [5, 15, 30, 60, 120];

export function newDraft(): QuickAddDraft {
  return { name: '', who: [], when: 'today', by: null, every: 'weekly', minutes: 15, needsOk: false, needsOkSet: false, stars: null };
}

/** Needs a parent's OK is on automatically for young children (spec 13.8). */
export function autoNeedsOk(who: string[], members: Member[]): boolean {
  return who.some(id => members.find(m => m.id === id)?.age_group === 'young_child');
}

/** The draft after picking people: OK follows them until a parent sets it. */
export function withWho(draft: QuickAddDraft, who: string[], members: Member[]): QuickAddDraft {
  return { ...draft, who, needsOk: draft.needsOkSet ? draft.needsOk : autoNeedsOk(who, members) };
}

const SAT = 6;
const SUN = 0;

/** By a date: Tomorrow, the coming Saturday and Sunday (spec 13.8), and Pick a date. */
export function byChips(today: string): DayChip[] {
  const days = [addDays(today, 1)];
  for (const target of [SAT, SUN]) {
    const now = dayDate(today).getDay();
    const ahead = (target - now + 7) % 7 || 7;
    const day = addDays(today, ahead);
    if (!days.includes(day)) days.push(day);
  }
  return days.map(day => {
    const weekday = dayDate(day).getDay();
    const label = chipLabel(day, today);
    return { day, label: label === 'Tomorrow' ? label : weekday === SAT ? 'Saturday' : weekday === SUN ? 'Sunday' : label };
  });
}

const CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** The repeat choices, worded from today: Every day, Every Tuesday, Every month on the 13th. */
export function everyChoices(today: string): Array<{ id: Every; label: string }> {
  const date = dayDate(today);
  return [
    { id: 'daily', label: 'Every day' },
    { id: 'weekly', label: `Every ${WEEKDAY_NAMES[date.getDay()]}` },
    { id: 'monthly', label: `Every month on the ${ordinal(Math.min(28, date.getDate()))}` },
  ];
}

/** "Earns ★ 4 (1 per 15 minutes)" from the formula the engine uses (spec 8.3). */
export function worthLine(draft: QuickAddDraft, minutesPerStar: number): string {
  const stars = starsFor(draft.minutes, minutesPerStar, draft.stars);
  if (draft.stars !== null) return `Earns ★ ${stars} each time`;
  return `Earns ★ ${stars} (${perStarText(minutesPerStar)})`;
}

/** What's still missing, in plain words; null when it can be added. */
export function quickAddProblem(draft: QuickAddDraft, today: string): string | null {
  if (!draft.name.trim()) return 'Add what needs doing.';
  if (draft.who.length === 0) return 'Pick who does it.';
  if (draft.when === 'by' && (!draft.by || draft.by < today)) return 'Pick a day to finish by.';
  if (!Number.isFinite(draft.minutes) || draft.minutes < 1 || draft.minutes > 1440) return 'About how long is from 1 minute to 24 hours.';
  return null;
}

/** The chore quick add saves (planavista/chores/activity/save): a Once chore, or a simple Repeats one. */
export function activityFrom(draft: QuickAddDraft, today: string): Partial<Activity> {
  const name = draft.name.trim();
  const base: Partial<Activity> = {
    name,
    icon: pictureFor(name),
    category: 'other',
    assignees: [...draft.who],
    on_board: true,
    needs_ok: draft.needsOk,
    stars: draft.stars,
  };
  const minutes = Math.round(draft.minutes);
  if (draft.when === 'repeats') {
    const date = dayDate(today);
    const rrule = draft.every === 'daily'
      ? 'FREQ=DAILY'
      : draft.every === 'weekly'
        ? `FREQ=WEEKLY;BYDAY=${CODES[date.getDay()]}`
        : `FREQ=MONTHLY;BYMONTHDAY=${Math.min(28, date.getDate())}`;
    return { ...base, schedule: 'repeats', repeats: { rrule, start: today, window: 'day', estimate_minutes: minutes } };
  }
  return {
    ...base,
    schedule: 'once',
    once: {
      on: draft.when === 'today' ? today : null,
      by: draft.when === 'by' ? draft.by : null,
      by_time: null,
      sessions: 1,
      estimate_minutes: minutes,
    },
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-inbox.ts` (new):

```ts
import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SMOOTH, motionOf, springEasing } from '../../core/motion';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import type { InboxGroups, InboxRow } from './inbox-derive';
import { SEND_BACK_REASONS } from './pv-chore-options';

export interface ReviewDetail {
  row: InboxRow;
  allow: boolean;
  note?: string | null;
}

/**
 * pv-chores-inbox: Waiting for OK (spec 13.7), grouped into Chores to check
 * (with Approve all), Requests, and Rewards. A panel beside the board in
 * landscape, so a parent can see the board while approving; a sheet in
 * portrait and on phones. Every answer is its own, attributed review.
 *
 * @fires pv-review - ReviewDetail
 * @fires pv-approve-all - every chore to check, approved one by one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresInbox extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) groups!: InboxGroups;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  /** Requests being answered right now. */
  @property({ attribute: false }) busy: ReadonlySet<string> = new Set();

  @state() private _sendingBack: string | null = null;
  @state() private _note = '';
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      :host([layout='landscape']) {
        position: absolute;
        inset: 0 0 0 auto;
        width: min(400px, 100%);
        z-index: 30;
        display: block;
      }

      :host([layout='landscape']) .backdrop {
        display: none;
      }

      :host([layout='landscape']) .panel {
        position: absolute;
        inset: 0;
        width: auto;
        max-height: none;
        border-radius: 0;
        border-left: 1px solid var(--pv-border, #E7E7E3);
        box-shadow: -12px 0 32px rgba(0, 0, 0, 0.12);
        padding: 0 0 20px;
        overflow-y: auto;
      }

      .top {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px 12px;
        background: var(--pv-card-bg, #FFFFFF);
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .done {
        min-height: 44px;
        font-weight: 750;
      }

      .group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 16px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .link {
        min-height: 40px;
        padding: 0 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
      }

      .what {
        line-height: 1.35;
      }

      .detail {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .answers {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .answers button {
        min-height: 44px;
        padding: 0 14px;
      }

      :host([layout='phone']) .row {
        flex-wrap: wrap;
      }

      :host([layout='phone']) .answers {
        width: 100%;
        justify-content: flex-end;
      }

      .reasons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 12px 60px;
      }

      .reasons .lead {
        width: 100%;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      input {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .empty {
        padding: 32px 24px;
        text-align: center;
        color: var(--pv-text-secondary, #5F6670);
        line-height: 1.5;
      }

      .empty .art {
        font-size: 32px;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    if (this.layout === 'landscape') {
      if (motionOf(this) === 'reduced') panel.animate({ opacity: [0, 1] }, { duration: 150 });
      else {
        const spring = springEasing(SMOOTH);
        panel.animate({ transform: ['translateX(100%)', 'translateX(0)'] }, { duration: spring.duration, easing: spring.easing });
      }
    } else {
      this._motion.open(panel, backdrop);
      this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    }
    this.renderRoot.querySelector<HTMLElement>('.answers button, .done')?.focus();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('groups') && this._sendingBack && !this._all().some(r => r.id === this._sendingBack)) this._sendingBack = null;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    if (this.layout === 'landscape') {
      const out = motionOf(this) === 'reduced'
        ? panel.animate({ opacity: [1, 0] }, { duration: 120, fill: 'forwards' })
        : panel.animate({ transform: ['translateX(0)', 'translateX(100%)'] }, { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      await out.finished.catch(() => undefined);
    } else {
      await this._motion.close(panel, backdrop);
    }
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _all(): InboxRow[] {
    const g = this.groups;
    return g ? [...g.chores, ...g.requests, ...g.rewards] : [];
  }

  render() {
    const g = this.groups;
    if (!g) return nothing;
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal=${this.layout === 'landscape' ? 'false' : 'true'} aria-labelledby="inbox-title"
        @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="inbox-title">Waiting for OK${g.count ? ` · ${g.count}` : ''}</h2>
          <button class="pv-btn pv-btn-ghost done" type="button" @click=${() => void this.close()}>Done</button>
        </div>
        ${g.count === 0 ? html`
          <div class="empty"><div class="art" aria-hidden="true">✅</div>Nothing is waiting. Check-offs that need a parent's OK, requests, and rewards land here.</div>
        ` : nothing}
        ${g.chores.length ? html`
          <div class="group"><span>Chores to check</span>
            <button class="link" type="button" ?disabled=${this.busy.size > 0}
              @click=${() => this.dispatchEvent(new CustomEvent('pv-approve-all', { bubbles: true, composed: true }))}>Approve all (${g.chores.length})</button>
          </div>
          ${g.chores.map(row => this._row(row))}
        ` : nothing}
        ${g.requests.length ? html`<div class="group"><span>Requests</span></div>${g.requests.map(row => this._row(row))}` : nothing}
        ${g.rewards.length ? html`<div class="group"><span>Rewards</span></div>${g.rewards.map(row => this._row(row))}` : nothing}
      </div>
    `;
  }

  private _row(row: InboxRow) {
    const busy = this.busy.has(row.id);
    const member = row.member;
    return html`
      <div class="row" aria-busy=${busy ? 'true' : 'false'}>
        ${member ? html`<pv-member-avatar .member=${{ ...member, color: this.colorOf(member) }} .hass=${this.hass} size="32"></pv-member-avatar>` : nothing}
        <div class="words">
          <div class="what">${row.lead} <strong>${row.what}</strong>${row.tail}</div>
          <div class="detail">${row.detail}</div>
        </div>
        <div class="answers">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${busy}
            @click=${() => this._decline(row)}>${row.decline}</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${busy || row.blocked}
            @click=${() => this._review(row, true)}>${busy ? 'Saving…' : row.allow}</button>
        </div>
      </div>
      ${this._sendingBack === row.id ? html`
        <div class="reasons">
          <span class="lead">Sending back: what should change?</span>
          ${SEND_BACK_REASONS.map(reason => html`<button class="chip" type="button" @click=${() => this._review(row, false, reason)}>${reason}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${(e: Event) => { this._note = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._review(row, false, this._note.trim() || null); }} />
          <button class="chip" type="button" @click=${() => this._review(row, false, this._note.trim() || null)}>Send back</button>
        </div>
      ` : nothing}
    `;
  }

  private _decline(row: InboxRow): void {
    if (row.kind === 'completion') {
      this._sendingBack = this._sendingBack === row.id ? null : row.id;
      this._note = '';
      return;
    }
    this._review(row, false);
  }

  private _review(row: InboxRow, allow: boolean, note?: string | null): void {
    this._sendingBack = null;
    this.dispatchEvent(new CustomEvent<ReviewDetail>('pv-review', { detail: { row, allow, note }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    if (this.layout !== 'landscape') trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-inbox', PvChoresInbox);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-quick-add.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import {
  MINUTE_CHOICES,
  QuickAddDraft,
  When,
  byChips,
  everyChoices,
  newDraft,
  quickAddProblem,
  withWho,
  worthLine,
} from './quick-add';

/**
 * pv-chores-quick-add: a short sheet for one-offs (spec 13.8): what needs
 * doing, who, when (today, by a date, or repeating), about how long,
 * whether it needs a parent's OK (on for young children), and what it earns.
 * The chore editor in Settings handles everything else.
 *
 * @fires pv-quick-add - { draft } on Add, once the draft makes sense
 * @fires pv-sheet-close - Cancel, Escape, a tap outside, or a drag down
 */
export class PvChoresQuickAdd extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String }) today = '';
  @property({ type: Number }) minutesPerStar = 15;
  @property({ type: Boolean }) busy = false;

  @state() private _draft: QuickAddDraft = newDraft();
  @state() private _problem: string | null = null;
  @state() private _other = false;
  @state() private _changeStars = false;
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      :host([layout='landscape']) .panel {
        width: min(480px, calc(100vw - 32px));
      }

      .bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        margin: -4px -6px 10px;
      }

      .bar h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.125rem;
        font-weight: 800;
      }

      .bar .add {
        justify-self: end;
        font-weight: 800;
      }

      .text {
        min-height: 44px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .text[disabled] {
        opacity: 0.5;
      }

      section {
        padding: 12px 0;
        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      label.title,
      .title {
        display: block;
        margin-bottom: 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'],
      input[type='date'] {
        box-sizing: border-box;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      input[type='text'] {
        width: 100%;
        font-size: 1.0625rem;
      }

      input:focus-visible {
        outline: 2px solid var(--pv-accent, #5B5BD6);
        outline-offset: 1px;
      }

      .faces {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 56px;
        min-height: 48px;
        padding: 4px;
        border: none;
        border-radius: 14px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.55;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .face[aria-pressed='true'] pv-member-avatar {
        outline: 3px solid var(--face);
        outline-offset: 2px;
        border-radius: 50%;
      }

      .seg {
        display: inline-flex;
        padding: 3px;
        border-radius: 10px;
        background: var(--pv-seg, #ECECE8);
        margin-bottom: 10px;
      }

      .seg button {
        min-height: 40px;
        padding: 0 14px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .seg button[aria-pressed='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      .switch-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .switch-row .caption {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
      }

      .switch {
        position: relative;
        width: 52px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        cursor: pointer;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease;
      }

      .switch[aria-checked='true'] {
        background: var(--pv-accent, #5B5BD6);
      }

      .switch[aria-checked='true']::after {
        transform: translateX(20px);
      }

      .worth {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .stepper {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
      }

      .stepper button {
        min-width: 44px;
        min-height: 44px;
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLInputElement>('#name')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _set(changes: Partial<QuickAddDraft>): void {
    this._draft = { ...this._draft, ...changes };
    if (this._problem) this._problem = quickAddProblem(this._draft, this.today);
  }

  private _toggle(member: Member): void {
    const who = this._draft.who.includes(member.id)
      ? this._draft.who.filter(id => id !== member.id)
      : [...this._draft.who, member.id];
    this._draft = withWho(this._draft, who, this.people);
    if (this._problem) this._problem = quickAddProblem(this._draft, this.today);
  }

  private _add = (): void => {
    const problem = quickAddProblem(this._draft, this.today);
    this._problem = problem;
    if (problem) return;
    this.dispatchEvent(new CustomEvent('pv-quick-add', { detail: { draft: this._draft }, bubbles: true, composed: true }));
  };

  render() {
    const d = this._draft;
    const when: Array<{ id: When; label: string }> = [
      { id: 'today', label: 'Today' },
      { id: 'by', label: 'By a date' },
      { id: 'repeats', label: 'Repeats' },
    ];
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="add-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="bar">
          <button class="text" type="button" @click=${() => void this.close()}>Cancel</button>
          <h2 id="add-title">New chore</h2>
          <button class="text add" type="button" ?disabled=${this.busy} @click=${this._add}>${this.busy ? 'Adding…' : 'Add'}</button>
        </div>
        <section>
          <label class="title" for="name">What needs doing?</label>
          <input id="name" type="text" maxlength="60" placeholder="Clean out the garage" autocomplete="off" .value=${d.name}
            @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._add(); }} />
        </section>
        <section>
          <span class="title" id="who-title">Who</span>
          <div class="faces" role="group" aria-labelledby="who-title">
            ${this.people.map(person => html`
              <button class="face" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
                style="--face:${this.colorOf(person)}" @click=${() => this._toggle(person)}>
                <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="40"></pv-member-avatar>
                ${person.name}
              </button>
            `)}
          </div>
        </section>
        <section>
          <span class="title">When</span>
          <div class="seg" role="group" aria-label="When">
            ${when.map(w => html`<button type="button" aria-pressed=${d.when === w.id ? 'true' : 'false'} @click=${() => this._set({ when: w.id })}>${w.label}</button>`)}
          </div>
          ${d.when === 'by' ? html`
            <div class="chips">
              ${byChips(this.today).map(chip => html`
                <button class="chip" type="button" aria-pressed=${d.by === chip.day ? 'true' : 'false'} @click=${() => this._set({ by: chip.day })}>${chip.label}</button>
              `)}
              <input type="date" aria-label="Pick a date" min=${this.today} .value=${d.by && !byChips(this.today).some(c => c.day === d.by) ? d.by : ''}
                @change=${(e: Event) => this._set({ by: (e.target as HTMLInputElement).value || null })} />
            </div>
          ` : nothing}
          ${d.when === 'repeats' ? html`
            <div class="chips">
              ${everyChoices(this.today).map(choice => html`
                <button class="chip" type="button" aria-pressed=${d.every === choice.id ? 'true' : 'false'} @click=${() => this._set({ every: choice.id })}>${choice.label}</button>
              `)}
            </div>
          ` : nothing}
        </section>
        <section>
          <span class="title">About how long?</span>
          <div class="chips">
            ${MINUTE_CHOICES.map(minutes => html`
              <button class="chip" type="button" aria-pressed=${!this._other && d.minutes === minutes ? 'true' : 'false'}
                @click=${() => { this._other = false; this._set({ minutes }); }}>${minutesText(minutes)}</button>
            `)}
            <button class="chip" type="button" aria-pressed=${this._other ? 'true' : 'false'} @click=${() => { this._other = true; }}>Other</button>
            ${this._other ? html`
              <input type="number" min="1" max="1440" inputmode="numeric" aria-label="Minutes" .value=${String(d.minutes)}
                @input=${(e: Event) => this._set({ minutes: Number((e.target as HTMLInputElement).value) })} /> min
            ` : nothing}
          </div>
        </section>
        <section>
          <div class="switch-row">
            <div>
              <div>Needs a parent's OK</div>
              <div class="caption">On for young children automatically</div>
            </div>
            <button class="switch" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
              @click=${() => this._set({ needsOk: !d.needsOk, needsOkSet: true })}></button>
          </div>
        </section>
        <section>
          <span class="worth">${worthLine(d, this.minutesPerStar)}</span>
          <button class="text" type="button" @click=${() => { this._changeStars = !this._changeStars; }}>Change</button>
          ${this._changeStars ? html`
            <div class="stepper">
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="Fewer stars"
                @click=${() => this._set({ stars: Math.max(0, (d.stars ?? 1) - 1) })}>−</button>
              <button class="pv-btn pv-btn-secondary" type="button" aria-label="More stars"
                @click=${() => this._set({ stars: Math.min(100, (d.stars ?? 0) + 1) })}>+</button>
              <button class="text" type="button" ?disabled=${d.stars === null} @click=${() => this._set({ stars: null })}>Automatic</button>
            </div>
          ` : nothing}
          ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
        </section>
      </div>
    `;
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-quick-add', PvChoresQuickAdd);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index aaf9f93..7cb1105 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -20,6 +20,9 @@ import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
 import { dayWords, historyLines, itemOptions } from './options-derive';
 import type { OptionChoice } from './pv-chore-options';
+import { InboxRow, answeredText, inboxGroups } from './inbox-derive';
+import type { ReviewDetail } from './pv-chores-inbox';
+import { QuickAddDraft, activityFrom } from './quick-add';
 import { errorMessage } from '../../core/ws-api';
 import { chime, haptic } from './effects';
 import type { PvChoresBoard } from './pv-chores-board';
@@ -28,6 +31,8 @@ import '../../shell/pv-notice-sheet';
 import './pv-chores-board';
 import './pv-chores-people-sheet';
 import './pv-chore-options';
+import './pv-chores-inbox';
+import './pv-chores-quick-add';
 
 /** A sheet the chores screens show over themselves. */
 type ChoresSheet =
@@ -35,7 +40,9 @@ type ChoresSheet =
   | { kind: 'no_pin'; heading: string }
   | { kind: 'people'; heading: string; body?: string; people: Member[]; pick: (member: Member | null) => void }
   | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
-  | { kind: 'delete'; row: RowModel };
+  | { kind: 'delete'; row: RowModel }
+  | { kind: 'inbox' }
+  | { kind: 'quick_add'; busy: boolean };
 
 /** What the last check-off toast can take back or hand to someone else. */
 interface LastCheckoff {
@@ -72,6 +79,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   @state() protected _toast: Toast | null = null;
   /** Minutes since the epoch, so bands and the evening check move with the clock. */
   @state() private _minute = Math.floor(Date.now() / 60000);
+  /** Requests being answered in the inbox. */
+  @state() private _reviewing: ReadonlySet<string> = new Set();
   private _overlayOpen = false;
   private _last: LastCheckoff | null = null;
   private _clock: ReturnType<typeof setInterval> | undefined;
@@ -128,9 +137,64 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     return this.services?.chores as ChoresService | undefined;
   }
 
-  /** The bar's and the parent-mode strip's buttons. */
-  moduleAction(_id: string): void {
-    // Waiting for OK and Add chore arrive with their sheets.
+  /** The bar's and the parent-mode strip's buttons: Waiting for OK and Add chore. */
+  moduleAction(id: string): void {
+    if (id === 'inbox') void this._openInbox();
+    if (id === 'add') void this._openQuickAdd();
+  }
+
+  private async _openInbox(): Promise<void> {
+    if (await this.asParent("Who's approving?")) this._sheet = { kind: 'inbox' };
+  }
+
+  private async _openQuickAdd(): Promise<void> {
+    if (await this.asParent("Who's adding a chore?")) this._sheet = { kind: 'quick_add', busy: false };
+  }
+
+  /** One answer from the inbox: its own review, attributed to the parent (spec 13.7). */
+  private async _review(detail: ReviewDetail): Promise<boolean> {
+    const { row, allow, note } = detail;
+    const api = this.service?.api;
+    if (!api || !(await this.asParent("Who's approving?"))) return false;
+    this._reviewing = new Set([...this._reviewing, row.id]);
+    try {
+      await api.review(row.id, allow ? 'allow' : 'decline', note ?? null);
+      this.showToast({ id: `review-${row.id}`, text: answeredText(row, allow, note) });
+      return true;
+    } catch (err) {
+      this.showToast({ id: `review-${row.id}-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+      return false;
+    } finally {
+      const next = new Set(this._reviewing);
+      next.delete(row.id);
+      this._reviewing = next;
+    }
+  }
+
+  /** Approve all: each chore to check approved on its own, so each is attributed and stands alone. */
+  private async _approveAll(rows: InboxRow[]): Promise<void> {
+    let approved = 0;
+    for (const row of rows) {
+      if (await this._review({ row, allow: true })) approved += 1;
+      else break;
+    }
+    if (approved > 1) this.showToast({ id: `approved-${Date.now()}`, text: `Approved ${approved} chores.` });
+  }
+
+  private async _quickAdd(draft: QuickAddDraft): Promise<void> {
+    const board = this.service?.board();
+    const api = this.service?.api;
+    if (!board || !api || this._sheet?.kind !== 'quick_add') return;
+    if (!(await this.asParent("Who's adding a chore?"))) return;
+    this._sheet = { kind: 'quick_add', busy: true };
+    try {
+      await api.saveActivity(activityFrom(draft, board.today));
+      this._sheet = null;
+      this.showToast({ id: `added-${Date.now()}`, text: `Added ${draft.name.trim()}.` });
+    } catch (err) {
+      this._sheet = { kind: 'quick_add', busy: false };
+      this.showToast({ id: `add-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
   }
 
   protected willUpdate(changed: PropertyValues): void {
@@ -601,6 +665,27 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _renderSheet() {
     const sheet = this._sheet;
     if (!sheet) return this.renderSheet();
+    if (sheet.kind === 'inbox') {
+      const board = this.service?.board();
+      if (!board) return nothing;
+      const groups = inboxGroups(board.requests, inOrder(this.household?.members ?? []), board.today, this.display?.time_format ?? '12h');
+      return html`
+        <pv-chores-inbox .layout=${this.layout} .groups=${groups} .hass=${this.hass} .colorOf=${this._colorOf} .busy=${this._reviewing}
+          @pv-review=${(e: CustomEvent<ReviewDetail>) => void this._review(e.detail)}
+          @pv-approve-all=${() => void this._approveAll(groups.chores)}
+          @pv-sheet-close=${() => { if (this._sheet === sheet) this._sheet = null; }}></pv-chores-inbox>
+      `;
+    }
+    if (sheet.kind === 'quick_add') {
+      const board = this.service?.board();
+      if (!board) return nothing;
+      return html`
+        <pv-chores-quick-add .layout=${this.layout} .people=${inOrder(this.household?.members ?? [])} .hass=${this.hass}
+          .colorOf=${this._colorOf} today=${board.today} .minutesPerStar=${board.settings.minutes_per_star} ?busy=${sheet.busy}
+          @pv-quick-add=${(e: CustomEvent<{ draft: QuickAddDraft }>) => void this._quickAdd(e.detail.draft)}
+          @pv-sheet-close=${() => { if (this._sheet?.kind === 'quick_add') this._sheet = null; }}></pv-chores-quick-add>
+      `;
+    }
     if (sheet.kind === 'options') {
       const found = this._optionsModel(sheet.key);
       if (!found) {
```

- [ ] **Step 4: Run them again.** Same command. Expected: `11 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `547 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): Waiting for OK and quick add` with the trailers.

---

### Task 8: My day in three styles

Spec 13.4 (one person's day in the style they choose, saved on them: Timeline with events at their times, chores in their bands, a line at now, the free gap and what fits, and bedtime; List with the fairness strip; Pictures with one huge Now tile and Now to Next as picture steps; opened from the bar, a column header, or a calendar ring) and 12.3 (landscape keeps a side panel; portrait stacks it).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/board-derive.ts` (every check-off of today, earlier bands' too, for My day), `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/my-day-derive.test.ts`

**Interfaces:**
- Consumes: Task 5's columns, Task 1's `planavista/household/member/prefs`.
- Produces: `ColumnModel.doneToday`; `TimelineEntry`, `DayContext`, `timelineFor(column, ctx)`, `fitsIn(minutes, rows)`, `bedtimeOn(member, day)`, `nextLine`, `GoalModel`, `goalFor(member, entry, rewards)`, `FairShare`, `fairShares(board, members)`, `PicturesModel`, `picturesFor`; `pv-chores-my-day` (events `pv-my-day-member`, `pv-my-day-style`), `MyDayStyle`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/my-day-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { columnFor, type DeriveContext } from '../src/modules/chores/board-derive';
import { bedtimeOn, fairShares, fitsIn, goalFor, nextLine, picturesFor, timelineFor } from '../src/modules/chores/my-day-derive';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, NOW, TODAY, board, column, item } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;
const at = (h: number, m = 0) => new Date(2026, 9, 13, h, m);
const event = (title: string, start: Date, end: Date, member = 'casey'): DayEvent => ({ title, start, end, calendar: `calendar.${member}`, member });
const EVENTS = [event('School', at(8), at(14, 45)), event('Soccer practice', at(17, 30), at(19))];
const WEEK = { section: 'week' as const, window: 'week' as const, planned: null, due_day: '2026-10-18', counted: false };

function casey_column() {
  const items = [
    item('cat_care|casey|day:2026-10-13|0', { band: 'morning', status: 'done', completion: { id: 'c', done_by: 'casey', by: 'casey', at: '2026-10-13T07:20:00-05:00', source: 'tablet', state: 'done', review: null, stars: 1 } }),
    item('take_out_the_trash|casey|week:2026-10-12|0', { band: 'evening', window: 'week', credit_minutes: 15 }),
    item('cat_care|casey|day:2026-10-13|1', { band: 'evening', credit_minutes: 15 }),
    item('yard_work|casey|week:2026-10-12|0', { ...WEEK, credit_minutes: 60 }),
    item('clean_the_bathroom|casey|week:2026-10-12|0', { ...WEEK, status: 'pending', credit_minutes: 60 }),
  ];
  const ctx: DeriveContext = { today: TODAY, now: NOW, events: EVENTS, timeFormat: '12h', activities: new Map(), members: MEMBERS };
  return columnFor(casey, column(items, { stars: 23 }), board({ casey: column(items) }), ctx);
}

describe('timelineFor (spec 13.4)', () => {
  it('puts events at their times, chores in their bands, and what fits at now', () => {
    const entries = timelineFor(casey_column(), { now: NOW, events: EVENTS, timeFormat: '12h', bedtime: at(22) });
    expect(entries.map(e => {
      switch (e.kind) {
        case 'band': return `== ${e.label}`;
        case 'event': return `${e.time} ${e.title}${e.past ? ' (past)' : ''}`;
        case 'chore': return `${e.time ?? '·'} ${e.row.name}${e.row.state === 'done' ? ' ✓' : ''}`;
        case 'now': return `${e.time} NOW`;
        case 'free': return `free until ${e.until} (${e.span}): ${e.fits.join(', ')}`;
        case 'bedtime': return `bedtime ${e.time}`;
      }
    })).toEqual([
      '== Morning', '7:20 Cat care ✓', '8:00 School (past)',
      '== Afternoon', '4:10 NOW', 'free until 5:30 (1 h 20 min): Take out the trash, Cat care',
      '== Evening', '5:30 Soccer practice', '· Take out the trash', '· Cat care',
      'bedtime 10:00 PM',
    ]);
  });

  it('says it is free for the rest of the day when nothing else is on the calendar', () => {
    const entries = timelineFor(casey_column(), { now: at(19, 30), events: EVENTS, timeFormat: '12h', bedtime: null });
    const free = entries.find(e => e.kind === 'free');
    expect(free).toMatchObject({ until: null, span: null });
  });
});

describe('fitsIn', () => {
  it('fills the gap greedily, in order, at most three', () => {
    const rows = casey_column().entries.flatMap(e => (e.kind === 'row' ? [e.row] : []));
    expect(fitsIn(30, rows)).toEqual(['Take out the trash', 'Cat care']);
    expect(fitsIn(null, rows)).toEqual(['Take out the trash', 'Cat care', 'Yard work']);
    expect(fitsIn(5, rows)).toEqual([]);
  });
});

describe('picturesFor', () => {
  it('shows the chore for now, then the next event and chore as picture steps', () => {
    const model = picturesFor(casey_column(), EVENTS, NOW, '12h');
    expect(model.now?.name).toBe('Take out the trash');
    expect(model.next).toEqual([
      { kind: 'event', picture: '⚽', text: 'Soccer practice at 5:30' },
      { kind: 'chore', row: expect.objectContaining({ name: 'Cat care' }) },
    ]);
    expect(model.waiting.map(r => r.name)).toEqual(['Clean the bathroom']);
    expect(model.done.map(r => r.name)).toEqual(['Cat care']);
  });
});

describe('small helpers', () => {
  it('finds tonight\'s bedtime', () => {
    const night = { ...casey, bedtime: { weeknight: '22:00', weekend: '23:30' } };
    expect(bedtimeOn(night, at(12))).toEqual(at(22));
    expect(bedtimeOn(night, new Date(2026, 9, 16, 12))?.getHours()).toBe(23);
    expect(bedtimeOn(casey, at(12))).toBeNull();
  });

  it('says what is next on the calendar', () => {
    expect(nextLine([event('Dentist', at(16, 45), at(17, 30), 'alex')], 'alex', NOW, '12h')).toBe('Next: Dentist at 4:45 PM · then nothing until tomorrow');
    expect(nextLine(EVENTS, 'casey', NOW, '12h')).toBe('Next: Soccer practice at 5:30 PM · then nothing until tomorrow');
    expect(nextLine(EVENTS, 'casey', at(7), '12h')).toBe('Next: School at 8:00 AM');
    expect(nextLine(EVENTS, 'dana', NOW, '12h')).toBeNull();
  });

  it('measures the goal', () => {
    const reward = { id: 'movie', name: 'Movie night pick', icon: '🎬', cost: 40, needs_ok: true, who: [] };
    expect(goalFor({ ...casey, goal: 'movie' }, column([], { stars: 23 }), [reward])).toEqual({ reward, have: 23, need: 17, progress: 23 / 40 });
    expect(goalFor(casey, column([], { stars: 23 }), [reward])).toBeNull();
  });

  it('shares out the shared chores by time done', () => {
    const b = board({
      alex: column([], { contribution: { minutes: 60, shared_minutes: 30 } }),
      blair: column([], { contribution: { minutes: 90, shared_minutes: 90 } }),
      casey: column([], { contribution: { minutes: 0, shared_minutes: 0 } }),
    });
    expect(fairShares(b, [alex, blair, casey, dana]).map(s => [s.member.id, s.percent])).toEqual([['alex', 25], ['blair', 75]]);
    expect(fairShares(board({}), MEMBERS)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/my-day-derive.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/my-day-derive`.

- [ ] **Step 3: Write My day.**

`custom_components/planavista/frontend/src/modules/chores/board-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/board-derive.ts b/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
index 3760cd8..e058a1e 100644
--- a/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/board-derive.ts
@@ -50,6 +50,8 @@ export interface ColumnModel {
   entries: ColumnEntry[];
   /** Open check-offs still due today, for the evening check. */
   left: number;
+  /** Everything checked off today, earlier bands' too (My day lists them at their times). */
+  doneToday: RowModel[];
   /** Nothing at all on their board today. */
   empty: boolean;
 }
@@ -145,6 +147,7 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
   const overdue: RowModel[] = [];
   const week: RowModel[] = [];
   const groups = new Map<string, ItemView[]>();
+  const earlier: RowModel[] = [];
 
   for (const item of items) {
     const group = groupKey(item);
@@ -160,8 +163,10 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
     if (item.section === 'today') {
       const band = bandOf(item, current);
       if (item.status === 'done') {
-        if (bandState(band, current) === 'past') bandDone[band] += 1;
-        else done.push(rowFor(item, ctx, board, earnsStars));
+        if (bandState(band, current) === 'past') {
+          bandDone[band] += 1;
+          earlier.push(rowFor(item, ctx, board, earnsStars));
+        } else done.push(rowFor(item, ctx, board, earnsStars));
         continue;
       }
       if (item.status === 'excused' || item.status === 'away') continue;
@@ -185,8 +190,10 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
     for (const item of live) {
       if (item.status !== 'done' || !doneToday(item, board)) continue;
       const band = bandOf(item, current);
-      if (today && bandState(band, current) === 'past') bandDone[band] += 1;
-      else done.push(rowFor(item, ctx, board, earnsStars));
+      if (today && bandState(band, current) === 'past') {
+        bandDone[band] += 1;
+        earlier.push(rowFor(item, ctx, board, earnsStars));
+      } else done.push(rowFor(item, ctx, board, earnsStars));
     }
     const next = live.find(i => OPEN.has(i.status)) ?? live.find(i => i.status === 'pending');
     if (!next) continue;
@@ -261,6 +268,7 @@ export function columnFor(member: Member, entry: BoardMember, board: Board, ctx:
     away: entry.away ? { note: entry.away.note ?? null } : null,
     pictures: member.age_group === 'young_child',
     entries,
+    doneToday: [...earlier, ...done].sort((a, b) => (a.item.completion?.at ?? '').localeCompare(b.item.completion?.at ?? '')),
     left,
     empty: items.length === 0,
   };
```

`custom_components/planavista/frontend/src/modules/chores/my-day-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';
import type { Band, Board, BoardMember, Reward } from './chores-types';
import type { ColumnModel, RowModel } from './board-derive';
import { BANDS, BAND_NAMES, bandState } from './board-derive';
import { DayEvent, clockTime } from './calendar-ties';
import { pictureFor } from './picture-words';

/** Where a band starts on the clock (spec 8.1: morning until noon, afternoon until 5:00 PM). */
const BAND_START: Record<Band, number> = { morning: 0, afternoon: 12, evening: 17 };

export type TimelineEntry =
  | { kind: 'band'; key: string; band: Band; label: string }
  | { kind: 'event'; key: string; time: string; title: string; range: string; past: boolean; picture: string }
  | { kind: 'chore'; key: string; time: string | null; row: RowModel }
  | { kind: 'now'; key: string; time: string }
  | { kind: 'free'; key: string; until: string | null; span: string | null; fits: string[] }
  | { kind: 'bedtime'; key: string; time: string };

export interface DayContext {
  now: Date;
  events: DayEvent[];
  timeFormat: '12h' | '24h';
  /** Today's bedtime for this person, as a Date, or null. */
  bedtime: Date | null;
}

function bandOfTime(date: Date): Band {
  const h = date.getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

function range(event: DayEvent, format: '12h' | '24h'): string {
  return `${clockTime(event.start, format, format === '12h')} to ${clockTime(event.end, format, format === '12h')}`;
}

/** The person's bedtime tonight (spec 7.2: weeknights, and Friday and Saturday nights). */
export function bedtimeOn(member: Member, day: Date): Date | null {
  const bedtime = member.bedtime as { weeknight?: string; weekend?: string } | undefined;
  const weekend = day.getDay() === 5 || day.getDay() === 6;
  const at = (weekend ? bedtime?.weekend : bedtime?.weeknight) ?? bedtime?.weeknight;
  if (!at || !/^\d{1,2}:\d{2}$/.test(at)) return null;
  const [h, m] = at.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
}

/**
 * What fits in a free gap (spec 13.4): open chores in order, today's first,
 * while their estimates add up within the gap; at most three names.
 */
export function fitsIn(minutes: number | null, rows: RowModel[]): string[] {
  const names: string[] = [];
  let used = 0;
  for (const row of rows) {
    if (row.state !== 'open' && row.state !== 'sent_back') continue;
    const need = row.item.credit_minutes;
    if (minutes !== null && used + need > minutes) continue;
    used += need;
    names.push(row.name);
    if (names.length === 3) break;
  }
  return names;
}

/**
 * The Timeline (spec 13.4): calendar events at their real times, chores in
 * their bands in plan order, a line at now with what fits before the next
 * event, and the day ending at bedtime. Presentation only.
 */
export function timelineFor(column: ColumnModel, ctx: DayContext): TimelineEntry[] {
  const now = ctx.now;
  const current = bandOfTime(now);
  const rows = column.entries.flatMap(e => (e.kind === 'row' ? [{ row: e.row, zone: e.zone }] : []));
  const bandOf = (row: RowModel): Band => row.item.band ?? current;
  // Overdue ones and ones left from an earlier band are due now.
  const dueNow = rows
    .filter(r => r.zone === 'overdue' || (r.zone === 'past'))
    .map(r => r.row);
  const open = rows.filter(r => r.zone === 'now' || r.zone === 'later').map(r => r.row);
  const done = column.doneToday;
  const week = rows.filter(r => r.zone === 'week').map(r => r.row);
  const events = ctx.events.filter(e => e.member === column.member.id);
  const entries: TimelineEntry[] = [];
  const end = ctx.bedtime;
  for (const band of BANDS) {
    const state = bandState(band, current);
    const inBand = events.filter(e => bandOfTime(e.start) === band && (!end || e.start < end));
    const choresHere = state === 'past' ? [] : [...(state === 'now' ? dueNow : []), ...open.filter(r => bandOf(r) === band)];
    const doneHere = done.filter(r => r.item.completion && bandOfTime(new Date(r.item.completion.at)) === band);
    const items: Array<{ at: number; entry: TimelineEntry }> = [];
    for (const e of inBand) {
      items.push({
        at: e.start.getTime(),
        entry: {
          kind: 'event', key: `event:${e.calendar}:${e.start.getTime()}:${e.title}`, time: clockTime(e.start, ctx.timeFormat),
          title: e.title, range: range(e, ctx.timeFormat), past: e.end <= now, picture: pictureFor(e.title, '📅'),
        },
      });
    }
    for (const r of doneHere) {
      const at = new Date(r.item.completion!.at);
      items.push({ at: at.getTime(), entry: { kind: 'chore', key: r.key, time: clockTime(at, ctx.timeFormat), row: r } });
    }
    if (state === 'now') {
      const nowAt = now.getTime();
      const next = events.find(e => e.start > now);
      const free = next ? Math.round((next.start.getTime() - nowAt) / 60000) : end ? Math.round((end.getTime() - nowAt) / 60000) : null;
      items.push({ at: nowAt, entry: { kind: 'now', key: 'now', time: clockTime(now, ctx.timeFormat) } });
      const busy = events.some(e => e.start <= now && e.end > now);
      if (!busy && (free === null || free >= 15)) {
        items.push({
          at: nowAt + 1,
          entry: {
            kind: 'free', key: 'free',
            until: next ? clockTime(next.start, ctx.timeFormat) : null,
            span: free !== null ? minutesText(free) : null,
            fits: fitsIn(free, [...dueNow, ...open, ...week]),
          },
        });
      }
      choresHere.forEach((r, i) => items.push({ at: nowAt + 2 + i, entry: { kind: 'chore', key: r.key, time: null, row: r } }));
    } else if (state === 'later') {
      const last = inBand.reduce((t, e) => Math.max(t, e.end.getTime()), 0);
      const base = Math.max(last, new Date(now.getFullYear(), now.getMonth(), now.getDate(), BAND_START[band]).getTime());
      choresHere.forEach((r, i) => items.push({ at: base + i, entry: { kind: 'chore', key: r.key, time: null, row: r } }));
    }
    if (items.length === 0) continue;
    entries.push({ kind: 'band', key: `band:${band}`, band, label: BAND_NAMES[band] });
    entries.push(...items.sort((a, b) => a.at - b.at).map(i => i.entry));
  }
  if (end && end > now) entries.push({ kind: 'bedtime', key: 'bedtime', time: clockTime(end, ctx.timeFormat, ctx.timeFormat === '12h') });
  return entries;
}

/** "Next: Dentist at 4:45 PM · then nothing until tomorrow" (List's top line). */
export function nextLine(events: DayEvent[], memberId: string, now: Date, format: '12h' | '24h'): string | null {
  const mine = events.filter(e => e.member === memberId && e.start > now);
  if (mine.length === 0) return null;
  const [next, ...rest] = mine;
  const time = clockTime(next.start, format, format === '12h');
  return rest.length === 0 ? `Next: ${next.title} at ${time} · then nothing until tomorrow` : `Next: ${next.title} at ${time}`;
}

export interface GoalModel {
  reward: Reward;
  have: number;
  /** Stars still to go; 0 when they have enough. */
  need: number;
  progress: number;
}

/** Someone's goal (spec 8.15): the reward they're saving up for, and how close they are. */
export function goalFor(member: Member, entry: BoardMember, rewards: Reward[]): GoalModel | null {
  const goal = typeof member.goal === 'string' ? member.goal : null;
  const reward = goal ? rewards.find(r => r.id === goal) : undefined;
  if (!reward) return null;
  const have = entry.stars;
  return { reward, have, need: Math.max(0, reward.cost - have), progress: reward.cost > 0 ? Math.min(1, have / reward.cost) : 1 };
}

export interface FairShare {
  member: Member;
  minutes: number;
  percent: number;
}

/** Shared chores this week, by time done (spec 13.4, 13.5): everyone's share of the minutes. */
export function fairShares(board: Board, members: Member[]): FairShare[] {
  const shares = members.map(member => ({ member, minutes: board.members[member.id]?.contribution.shared_minutes ?? 0 }));
  const total = shares.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return [];
  return shares.filter(s => s.minutes > 0).map(s => ({ ...s, percent: Math.round((100 * s.minutes) / total) }));
}

export interface PicturesModel {
  now: RowModel | null;
  /** Now to Next: the next calendar event as a picture step, and the chore after this one. */
  next: Array<{ kind: 'event'; picture: string; text: string } | { kind: 'chore'; row: RowModel }>;
  waiting: RowModel[];
  done: RowModel[];
  later: RowModel[];
}

/** Pictures (spec 13.4): one huge Now tile, a Now to Next strip, then waiting and done tiles. */
export function picturesFor(column: ColumnModel, events: DayEvent[], now: Date, format: '12h' | '24h'): PicturesModel {
  const rows = column.entries.flatMap(e => (e.kind === 'row' ? [{ row: e.row, zone: e.zone }] : []));
  const todo = rows.filter(r => r.zone !== 'done' && (r.row.state === 'open' || r.row.state === 'sent_back'));
  const order = ['overdue', 'now', 'past', 'later', 'week'];
  todo.sort((a, b) => order.indexOf(a.zone) - order.indexOf(b.zone));
  const [first, ...others] = todo.map(r => r.row);
  const next: PicturesModel['next'] = [];
  const event = events.find(e => e.member === column.member.id && e.start > now);
  if (event) next.push({ kind: 'event', picture: pictureFor(event.title, '📅'), text: `${event.title} at ${clockTime(event.start, format)}` });
  if (others[0]) next.push({ kind: 'chore', row: others[0] });
  return {
    now: first ?? null,
    next,
    waiting: rows.filter(r => r.row.state === 'pending').map(r => r.row),
    done: column.doneToday,
    later: others.slice(1),
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Board } from './chores-types';
import type { ColumnModel, RowModel } from './board-derive';
import type { DayEvent } from './calendar-ties';
import {
  FairShare,
  GoalModel,
  TimelineEntry,
  nextLine,
  picturesFor,
  timelineFor,
} from './my-day-derive';
import { pictureOf } from './pv-chore-tile';
import './pv-chore-item';
import './pv-chore-tile';

export type MyDayStyle = 'timeline' | 'list' | 'pictures';
const STYLES: Array<{ id: MyDayStyle; label: string }> = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'list', label: 'List' },
  { id: 'pictures', label: 'Pictures' },
];

/**
 * pv-chores-my-day: one person's day in the style they choose (spec 13.4),
 * saved on them: Timeline (events at their times, chores in their bands,
 * what fits now), List (a checklist and the fairness strip), or Pictures
 * (one huge Now tile, then Now to Next as picture steps). Landscape keeps a
 * side panel with the goal and This week; portrait stacks them.
 *
 * @fires pv-my-day-member - { member } a face in the picker was tapped
 * @fires pv-my-day-style - { member, style } a style was picked
 */
export class PvChoresMyDay extends LitElement {
  @property({ attribute: false }) column!: ColumnModel;
  @property({ attribute: false }) columns: ColumnModel[] = [];
  @property({ attribute: false }) board!: Board;
  @property({ attribute: false }) events: DayEvent[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ attribute: false }) goal: GoalModel | null = null;
  @property({ attribute: false }) shares: FairShare[] = [];
  @property({ attribute: false }) bedtime: Date | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: Boolean }) locked = false;
  /** Minutes since the epoch: re-derive each minute. */
  @property({ attribute: false }) minute = 0;

  static styles = [
    choresStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      .picker {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 12px 12px 4px;
        flex-wrap: wrap;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 56px;
        min-height: 48px;
        padding: 2px 4px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        opacity: 0.6;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
        gap: 12px;
        padding: 8px 12px 16px;
        max-width: 1100px;
        width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }

      :host(:not([layout='landscape'])) .layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 14px;
        min-width: 0;
      }

      .main {
        border-top: 3px solid var(--member);
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .who {
        flex: 1 1 auto;
        min-width: 0;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.5rem;
        font-weight: 800;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .seg {
        display: inline-flex;
        padding: 3px;
        border-radius: 10px;
        background: var(--pv-seg, #ECECE8);
      }

      .seg button {
        min-height: 40px;
        padding: 0 12px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--pv-text-secondary, #5F6670);
        font: inherit;
        font-size: 0.875rem;
        font-weight: 650;
        cursor: pointer;
      }

      .seg button[aria-pressed='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }

      .goal {
        margin-top: 12px;
      }

      .goal .text {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 10px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--member);
        transition: width 600ms ease;
      }

      /* Timeline */
      .tl {
        margin-top: 10px;
      }

      .tl-row {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        min-height: 40px;
      }

      .tl-time {
        justify-self: end;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }

      .tl-band {
        margin: 14px 0 4px 64px;
        font-size: 0.75rem;
        font-weight: 750;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--pv-text-muted, #8E949C);
      }

      .event {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border-left: 4px solid var(--member);
        background: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .event.past {
        opacity: 0.55;
      }

      .event .title {
        font-weight: 650;
      }

      .event .range {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .now-time {
        color: var(--pv-now-color, #E5484D);
        font-weight: 800;
      }

      .now-line {
        height: 2px;
        background: var(--pv-now-color, #E5484D);
        border-radius: 2px;
      }

      .free {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1.5px dashed color-mix(in srgb, var(--member) 60%, transparent);
        background: color-mix(in srgb, var(--member) 7%, var(--pv-card-bg, #FFFFFF));
        font-size: 0.9375rem;
      }

      .free .fits {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .bed {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      /* List */
      .next {
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        font-size: 0.875rem;
      }

      .fair {
        margin-top: 12px;
      }

      .fair .bar {
        display: flex;
        height: 12px;
        gap: 2px;
        background: transparent;
      }

      .fair .bar span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        margin-top: 6px;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: -1px;
      }

      /* Pictures */
      .now-tile,
      .pictures-next {
        max-width: 520px;
        margin: 12px auto 0;
      }

      .label {
        margin: 14px 2px 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
        align-items: stretch;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 120px;
        border-radius: 18px;
        background: var(--pv-chip, #F1F1EE);
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-weight: 800;
        text-align: center;
        padding: 10px;
      }

      .step .picture {
        font-size: 44px;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }

      :host([layout='landscape']) .tiles {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .stickers {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        font-size: 22px;
      }

      .side h3 {
        margin: 0 0 8px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        font-weight: 800;
      }

      .side .section + .section {
        margin-top: 16px;
      }

      .stars-big {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2rem;
        font-weight: 800;
        color: var(--pv-star, #8A6A00);
      }
    `,
  ];

  willUpdate(): void {
    if (this.column) this.style.setProperty('--member', this.colorOf(this.column.member));
  }

  private _style(): MyDayStyle {
    const style = this.column.member.my_day;
    return style === 'list' || style === 'pictures' ? style : 'timeline';
  }

  render() {
    const column = this.column;
    if (!column) return nothing;
    const member = column.member;
    const style = this._style();
    return html`
      ${this.columns.length > 1 ? html`
        <div class="picker" role="group" aria-label="Whose day">
          ${this.columns.map(col => html`
            <button class="face" type="button" aria-pressed=${col.member.id === member.id ? 'true' : 'false'}
              @click=${() => this._fire('pv-my-day-member', { member: col.member.id })}>
              <pv-ring size="44" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${this.colorOf(col.member)}>
                <pv-member-avatar .member=${{ ...col.member, color: this.colorOf(col.member) }} .hass=${this.hass} size="32"></pv-member-avatar>
              </pv-ring>
              ${col.member.name}
            </button>
          `)}
        </div>
      ` : nothing}
      <div class="layout">
        <div class="card main">
          <div class="head">
            <pv-ring size="64" .progress=${column.ring.progress} ?closed=${column.ring.closed} color=${this.colorOf(member)} label=${column.ring.label}>
              <pv-member-avatar .member=${{ ...member, color: this.colorOf(member) }} .hass=${this.hass} size="48"></pv-member-avatar>
            </pv-ring>
            <div class="who">
              <div class="name">${member.name}</div>
              <div class="line">${column.line}</div>
            </div>
            <div class="seg" role="group" aria-label="My day style">
              ${STYLES.map(s => html`
                <button type="button" aria-pressed=${s.id === style ? 'true' : 'false'}
                  @click=${() => this._fire('pv-my-day-style', { member: member.id, style: s.id })}>${s.label}</button>
              `)}
            </div>
          </div>
          ${this.goal && this.layout !== 'landscape' ? this._goal(this.goal) : nothing}
          ${style === 'timeline' ? this._timeline() : style === 'list' ? this._list() : this._pictures()}
        </div>
        ${this._side()}
      </div>
    `;
  }

  private _goal(goal: GoalModel) {
    return html`
      <div class="goal">
        <div class="text">
          <span>Goal: ${pictureOf(goal.reward.icon)} ${goal.reward.name}</span>
          <span class="num">${goal.need > 0 ? `${goal.have} of ${goal.reward.cost} ★ · ${goal.need} more` : 'Enough stars!'}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${goal.reward.cost} aria-valuenow=${goal.have}
          aria-label=${`${goal.reward.name}: ${goal.have} of ${goal.reward.cost} stars`}><span style="width:${Math.round(goal.progress * 100)}%"></span></div>
      </div>
    `;
  }

  private _row(row: RowModel, zone = 'now') {
    return html`<pv-chore-item .row=${row} color=${this.colorOf(this.column.member)} ?highlight=${zone === 'now'} ?locked=${this.locked}></pv-chore-item>`;
  }

  private _timeline() {
    const entries = timelineFor(this.column, { now: new Date(), events: this.events, timeFormat: this.timeFormat, bedtime: this.bedtime });
    if (entries.length === 0) return html`<p class="meta" style="margin-top:12px">Nothing on today's timeline.</p>`;
    return html`<div class="tl">${repeat(entries, e => e.key, e => this._entry(e))}</div>${this._weekRows()}`;
  }

  private _entry(entry: TimelineEntry) {
    switch (entry.kind) {
      case 'band':
        return html`<div class="tl-band">${entry.label}</div>`;
      case 'event':
        return html`
          <div class="tl-row"><span class="tl-time">${entry.time}</span>
            <div class="event ${entry.past ? 'past' : ''}"><span aria-hidden="true">${entry.picture}</span>
              <div><div class="title">${entry.title}</div><div class="range">${entry.range}</div></div>
            </div>
          </div>
        `;
      case 'chore':
        return html`<div class="tl-row"><span class="tl-time">${entry.time ?? ''}</span>${this._row(entry.row, entry.row.state === 'done' ? 'done' : 'later')}</div>`;
      case 'now':
        return html`<div class="tl-row"><span class="tl-time now-time">${entry.time}</span><div class="now-line" aria-label="Now"></div></div>`;
      case 'free':
        return html`
          <div class="tl-row"><span class="tl-time"></span>
            <div class="free">
              ${entry.until ? html`Free until <strong>${entry.until}</strong>${entry.span ? html` · <strong>${entry.span}</strong>` : nothing}` : html`Free for the rest of the day`}
              ${entry.fits.length ? html`<div class="fits">Fits now: ${entry.fits.join(' · ')}</div>` : nothing}
            </div>
          </div>
        `;
      case 'bedtime':
        return html`<div class="tl-row"><span class="tl-time"></span><span class="bed">🌙 Bedtime ${entry.time}</span></div>`;
    }
  }

  private _weekRows() {
    if (this.layout === 'landscape') return nothing;
    const week = this.column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    if (week.length === 0) return nothing;
    return html`
      <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
      ${week.map(row => this._row(row, 'week'))}
    `;
  }

  private _list() {
    const column = this.column;
    const open = column.entries.flatMap(e => (e.kind === 'row' && e.zone !== 'week' && e.zone !== 'done' ? [e.row] : []));
    const week = column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    const next = nextLine(this.events, column.member.id, new Date(), this.timeFormat);
    return html`
      ${next ? html`<div class="next">📅 ${next}</div>` : nothing}
      <div class="section-head"><span>Today</span></div>
      ${open.length || column.doneToday.length ? nothing : html`<p class="meta">Nothing due today.</p>`}
      ${repeat(open, r => r.key, r => this._row(r))}
      ${repeat(column.doneToday, r => r.key, r => this._row(r, 'done'))}
      ${week.length && this.layout !== 'landscape' ? html`
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${repeat(week, r => r.key, r => this._row(r, 'week'))}
      ` : nothing}
      ${this._fair()}
    `;
  }

  private _fair() {
    if (this.shares.length === 0 || this.column.member.age_group === 'young_child') return nothing;
    return html`
      <div class="fair">
        <div class="section-head" style="margin-left:0"><span>Shared chores this week, by time done</span></div>
        <div class="bar" role="img" aria-label=${this.shares.map(s => `${s.member.name} ${s.percent}%`).join(', ')}>
          ${this.shares.map(s => html`<span style="width:${s.percent}%;background:${this.colorOf(s.member)}"></span>`)}
        </div>
        <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.member.name} ${s.percent}%</span>`)}</div>
      </div>
    `;
  }

  private _pictures() {
    const model = picturesFor(this.column, this.events, new Date(), this.timeFormat);
    const stars = this.column.member.stars ? this.column.entry.week_stars : 0;
    const color = this.colorOf(this.column.member);
    return html`
      ${model.now ? html`
        <div class="now-tile">
          <div class="label" style="text-align:center;margin-top:0;color:${color}">NOW</div>
          <pv-chore-tile large now .row=${model.now} color=${color} ?locked=${this.locked}
            .stars=${this.column.member.stars ? model.now.item.stars : 0}></pv-chore-tile>
        </div>
      ` : html`<div class="label" style="text-align:center">All done for now 🎉</div>`}
      ${model.next.length ? html`
        <div class="pictures-next">
        <div class="label">Next</div>
        <div class="steps">
          ${model.next.map(step => step.kind === 'event'
            ? html`<div class="step"><span class="picture" aria-hidden="true">${step.picture}</span>${step.text}</div>`
            : html`<pv-chore-tile .row=${step.row} color=${color} ?locked=${this.locked}></pv-chore-tile>`)}
        </div>
        </div>
      ` : nothing}
      ${model.waiting.length || model.later.length || model.done.length ? html`
        <div class="label">Later, waiting, and done</div>
        <div class="tiles">
          ${repeat([...model.later, ...model.waiting, ...model.done], r => r.key, r => html`
            <pv-chore-tile .row=${r} color=${color} ?locked=${this.locked}></pv-chore-tile>
          `)}
        </div>
      ` : nothing}
      ${this.column.member.stars ? html`
        <div class="label">Stickers this week${this.goal ? html` → ${pictureOf(this.goal.reward.icon)} ${this.goal.reward.name} at ${this.goal.reward.cost}` : nothing}</div>
        <div class="stickers" role="img" aria-label=${`${stars} stars this week`}>
          ${Array.from({ length: Math.min(30, stars) }, () => html`<span aria-hidden="true">⭐</span>`)}
          ${stars === 0 ? html`<span class="meta">Stars show up here.</span>` : nothing}
        </div>
      ` : nothing}
    `;
  }

  private _side() {
    const column = this.column;
    const week = column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    if (this.layout !== 'landscape') {
      return nothing;
    }
    return html`
      <aside class="card side">
        ${column.member.stars ? html`
          <div class="section">
            <h3>Stars</h3>
            <div class="stars-big num">★ ${column.entry.stars}</div>
            ${this.goal ? this._goal(this.goal) : nothing}
          </div>
        ` : nothing}
        <div class="section">
          <h3>This week</h3>
          ${week.length ? repeat(week, r => r.key, r => this._row(r, 'week')) : html`<p class="meta">Nothing more this week.</p>`}
        </div>
      </aside>
    `;
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-my-day', PvChoresMyDay);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 7cb1105..9f55257 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -15,7 +15,11 @@ import type { DisplayConfig, PlanaVistaData } from '../../types';
 import { choresStyles } from './chores-styles';
 import type { ChoresService } from './chores-service';
 import type { Board } from './chores-types';
-import type { RowModel } from './board-derive';
+import { ColumnModel, RowModel, boardColumns } from './board-derive';
+import { eventsOn } from './calendar-ties';
+import { bedtimeOn, fairShares, goalFor } from './my-day-derive';
+import type { MyDayStyle } from './pv-chores-my-day';
+import { memoizeOne } from '../../utils/render-cache';
 import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
 import { dayWords, historyLines, itemOptions } from './options-derive';
@@ -33,6 +37,7 @@ import './pv-chores-people-sheet';
 import './pv-chore-options';
 import './pv-chores-inbox';
 import './pv-chores-quick-add';
+import './pv-chores-my-day';
 
 /** A sheet the chores screens show over themselves. */
 type ChoresSheet =
@@ -79,6 +84,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   @state() protected _toast: Toast | null = null;
   /** Minutes since the epoch, so bands and the evening check move with the clock. */
   @state() private _minute = Math.floor(Date.now() / 60000);
+  /** Whose My day is showing. */
+  @state() private _myDayMember: string | null = null;
   /** Requests being answered in the inbox. */
   @state() private _reviewing: ReadonlySet<string> = new Set();
   private _overlayOpen = false;
@@ -199,6 +206,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
 
   protected willUpdate(changed: PropertyValues): void {
     super.willUpdate(changed);
+    // A ring in the calendar, or a column header, opened someone's day.
+    if (changed.has('openTarget') && this.openTarget?.member) this._myDayMember = this.openTarget.member;
     const notices = this.service?.takeNotices() ?? [];
     const last = notices[notices.length - 1];
     if (last) this._toast = { id: last.id, text: last.text, tone: 'bad', ms: 7000 };
@@ -281,12 +290,66 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     `;
   }
 
+  private _columnsFor = memoizeOne((board: Board, household: HouseholdView | null, data: PlanaVistaData | null, timeFormat: '12h' | '24h', _minute: number) =>
+    boardColumns(board, {
+      today: board.today,
+      now: new Date(),
+      events: eventsOn(data, new Date(board.day.start), new Date(board.day.end)),
+      timeFormat,
+      activities: new Map(board.chores.map(a => [a.id, a])),
+      members: household ? inOrder(household.members) : [],
+    }));
+
+  /** Whose day My day shows: the one picked, else this account's own person, else the first. */
+  private _myDayColumn(columns: ColumnModel[]): ColumnModel | undefined {
+    const wanted = this._myDayMember ?? this.household?.account.member_id ?? null;
+    return columns.find(c => c.member.id === wanted) ?? columns[0];
+  }
+
+  private _openMyDay(memberId: string): void {
+    this._myDayMember = memberId;
+    this.dispatchEvent(new CustomEvent('pv-view-change', { detail: { view: 'my_day' }, bubbles: true, composed: true }));
+  }
+
+  private async _setStyle(memberId: string, style: MyDayStyle): Promise<void> {
+    const api = this.service?.api;
+    if (!api || !(await this.asMember(memberId, 'Whose day is this?'))) return;
+    try {
+      await api.savePrefs(memberId, { my_day: style });
+    } catch (err) {
+      this.showToast({ id: `style-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
+  }
+
+  private _renderMyDay(board: Board) {
+    const timeFormat = this.display?.time_format ?? '12h';
+    const columns = this._columnsFor(board, this.household, this.data, timeFormat, this._minute);
+    const column = this._myDayColumn(columns);
+    if (!column) return nothing;
+    const member = column.member;
+    return html`
+      <pv-chores-my-day .column=${column} .columns=${columns} .board=${board} .hass=${this.hass} layout=${this.layout}
+        .events=${eventsOn(this.data, new Date(board.day.start), new Date(board.day.end))}
+        .colorOf=${this._colorOf} .timeFormat=${timeFormat} .minute=${this._minute}
+        .goal=${goalFor(member, column.entry, board.rewards)} .shares=${fairShares(board, inOrder(this.household?.members ?? []))}
+        .bedtime=${bedtimeOn(member, new Date())}
+        ?locked=${memberAccess(this.household, this.session, member.id) === 'no'}
+        @pv-my-day-member=${(e: CustomEvent<{ member: string }>) => { this._myDayMember = e.detail.member; }}
+        @pv-my-day-style=${(e: CustomEvent<{ member: string; style: MyDayStyle }>) => void this._setStyle(e.detail.member, e.detail.style)}
+        @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
+        @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
+        @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
+        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}></pv-chores-my-day>
+    `;
+  }
+
   /** The view the bar picked. */
   protected renderView(): unknown {
     const board = this.service?.board();
     if (!board) return nothing;
     const empty = board.chores.length === 0;
     if (empty) return this._empty();
+    if (this.view === 'my_day') return this._renderMyDay(board);
     return html`
       <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
         .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
@@ -294,7 +357,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         @pv-hold-done=${(e: CustomEvent<HoldDetail>) => this._complete(e.detail)}
         @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
         @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
-        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}></pv-chores-board>
+        @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}
+        @pv-member-open=${(e: CustomEvent<{ member: string }>) => this._openMyDay(e.detail.member)}></pv-chores-board>
     `;
   }
 
```

- [ ] **Step 4: Run them again.** Same command. Expected: `8 passed`; `test/board-derive.test.ts` still `18 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `555 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): My day in three styles` with the trailers.

---

### Task 9: The Week view, its day sheet, and Excuse it

Spec 13.5 (one mini ring per person per day; today outlined, days to come dashed; weekly chores in their own column or section; a fairness bar; up to three highlights, with Excuse it for parents on a missed chore; tap a cell to see that day; swipe or use the arrows for other weeks). The week view names each past day's missed chores so a highlight can say which.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/week-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`
- Modify: `custom_components/planavista/chores/engine.py`, `custom_components/planavista/frontend/src/modules/chores/chores-types.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `tests/test_chores_board_backend.py`, `custom_components/planavista/frontend/test/week-derive.test.ts`

**Interfaces:**
- Consumes: Task 1's day view and `excuse_missed`.
- Produces: week view past days' `missed_items`; `WeekCell`, `WeekRow`, `Highlight`, `weekCell`, `weeklyLine(entries, daysLeft, today)`, `weekRows`, `weekHighlights`, `weekShares`, `weekTitle`, `weekDays`; `pv-chores-week` (events `pv-week-nav`, `pv-week-day`, `pv-week-excuse`); `pv-chores-day-sheet` (events `pv-day-excuse`, `pv-sheet-close`), `longDay`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_board_backend.py`:

```diff
diff --git a/tests/test_chores_board_backend.py b/tests/test_chores_board_backend.py
index 94db41d..a5678ee 100644
--- a/tests/test_chores_board_backend.py
+++ b/tests/test_chores_board_backend.py
@@ -77,6 +77,17 @@ def test_a_past_day_comes_from_its_summary_and_the_log() -> None:
     ]
 
 
+def test_the_week_names_what_was_missed() -> None:
+    engine = sample_engine(at(10, 12, 7))
+    engine.complete(at(10, 12, 7, 5), key="cat_care|casey|day:2026-10-12|0", by="casey", source="tablet")
+    engine.catch_up(SCENE)
+    monday = engine.week_view(SCENE)["members"]["casey"]["days"][0]
+    assert (monday["date"], monday["missed"]) == ("2026-10-12", 1)
+    assert monday["missed_items"] == [
+        {"key": CAT_MONDAY_EVENING, "chore": "cat_care", "name": "Cat care", "icon": None, "status": "missed"},
+    ]
+
+
 def test_excusing_a_missed_check_off_mends_its_day_and_the_streak() -> None:
     engine = sample_engine(at(10, 11, 7))
     engine.complete(at(10, 11, 7), chore="cat_care", member="casey", by="casey", source="tablet")
```

`custom_components/planavista/frontend/test/week-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { weekCell, weekDays, weekHighlights, weekRows, weekShares, weekTitle, weeklyLine } from '../src/modules/chores/week-derive';
import type { WeekDay, WeekView } from '../src/modules/chores/chores-types';
import { MEMBERS } from './chores-fixtures';

const [alex, blair, casey, dana] = MEMBERS;

function day(date: string, kind: WeekDay['kind'], fields: Partial<WeekDay> = {}): WeekDay {
  return { date, kind, away: false, due: 3, done: 3, pending: 0, closed: true, missed: 0, ...fields };
}

const WEEK: WeekView = {
  week: { start: '2026-10-12', end: '2026-10-19' },
  today: '2026-10-13',
  members: {
    alex: { days: [day('2026-10-12', 'past'), day('2026-10-13', 'today', { due: 4, done: 2, closed: false }), day('2026-10-14', 'future', { done: 0, closed: false })], weekly: [{ chore: 'finance', name: 'Finance and budget', total: 2, done: 0, pending: 0, from: null }], contribution: { minutes: 150, shared_minutes: 150 }, away: [] },
    blair: { days: [day('2026-10-12', 'past', { due: 5, done: 5 }), day('2026-10-13', 'today', { due: 5, done: 5 })], weekly: [{ chore: 'laundry', name: 'Laundry', total: 3, done: 1, pending: 0, from: '2026-10-12' }], contribution: { minutes: 222, shared_minutes: 222 }, away: [] },
    casey: {
      days: [
        day('2026-10-12', 'past', { done: 2, closed: false, missed: 1, missed_items: [{ key: 'cat_care|casey|day:2026-10-12|1', chore: 'cat_care', name: 'Cat care', icon: null, status: 'missed' }] }),
        day('2026-10-13', 'today', { due: 3, done: 1, closed: false }),
      ],
      weekly: [{ chore: 'bathroom', name: 'Clean the bathroom', total: 3, done: 0, pending: 1, from: null }],
      contribution: { minutes: 132, shared_minutes: 132 }, away: [],
    },
    dana: { days: [day('2026-10-14', 'future', { away: true }), day('2026-10-15', 'future', { away: true })], weekly: [], contribution: { minutes: 36, shared_minutes: 0 }, away: [{ from: '2026-10-14', to: '2026-10-15', note: "At Grandma's" }] },
  },
};

describe('weekCell (spec 13.5)', () => {
  it('shows a closed ring with its count, a missed day, today, and days to come', () => {
    expect(weekCell(day('2026-10-12', 'past'))).toMatchObject({ label: '3 of 3', closed: true, tone: 'plain' });
    expect(weekCell(WEEK.members.casey.days[0])).toMatchObject({ label: '1 missed', tone: 'bad', closed: false });
    expect(weekCell(WEEK.members.alex.days[1])).toMatchObject({ label: '2 of 4', progress: 0.5, closed: false });
    expect(weekCell(day('2026-10-14', 'future', { done: 0 }))).toMatchObject({ label: '3 due', dashed: true, progress: 0 });
    expect(weekCell(day('2026-10-14', 'future', { away: true }))).toMatchObject({ label: 'Away', away: true });
    expect(weekCell(day('2026-10-12', 'past', { due: null, done: null, pending: null, closed: null }))).toMatchObject({ empty: true, label: '' });
  });
});

describe('weeklyLine', () => {
  it('counts the week, and says what needs a look', () => {
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-13')).toEqual({ text: '1 of 3', badge: 'Laundry from Mon', badgeTone: 'time', progress: 1 / 3 });
    expect(weeklyLine(WEEK.members.casey.weekly, 6, '2026-10-13')).toMatchObject({ text: '1 of 3', badge: '⏳ 1 waiting', badgeTone: 'act' });
    expect(weeklyLine(WEEK.members.alex.weekly, 4, '2026-10-13')).toMatchObject({ text: '0 of 2', badge: '4 days left' });
    expect(weeklyLine([], 6, '2026-10-13')).toBeNull();
    expect(weeklyLine(WEEK.members.blair.weekly, 6, '2026-10-11')?.badge).toBe('6 days left');
  });
});

describe('weekHighlights', () => {
  it('says who closed every ring, what was missed (to excuse), and who is away', () => {
    const lines = weekHighlights(WEEK, MEMBERS);
    expect(lines.map(l => l.text)).toEqual([
      'Blair has closed every ring this week.',
      'Casey missed Cat care on Monday.',
      'Dana is away Wednesday and Thursday.',
    ]);
    expect(lines[1].excuse).toEqual({ occurrence: 'cat_care|casey|day:2026-10-12|1', name: 'Cat care', day: '2026-10-12' });
  });
});

describe('the rest of the Week view', () => {
  it('heads the week and its days', () => {
    expect(weekTitle(WEEK)).toBe('Week of October 12');
    expect(weekDays(WEEK).map(d => `${d.label}${d.today ? '*' : ''}`)).toEqual(['Mon', 'Tue*', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('keeps board order', () => {
    expect(weekRows(WEEK, [dana, alex], 6).map(r => r.member.id)).toEqual(['dana', 'alex']);
  });

  it('shares out shared chores by time done', () => {
    expect(weekShares(WEEK, [alex, blair, casey, dana]).map(s => s.text)).toEqual(['Alex 2.5 h', 'Blair 3 h 42 min', 'Casey 2 h 12 min']);
  });
});
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_board_backend.py -q` Expected: FAIL, `test_the_week_names_what_was_missed` with `KeyError: 'missed_items'`. `npx vitest run test/week-derive.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/week-derive`.

- [ ] **Step 3: Name the missed chores, and write the Week view and the day sheet.**

`custom_components/planavista/chores/engine.py`:

```diff
diff --git a/custom_components/planavista/chores/engine.py b/custom_components/planavista/chores/engine.py
index 3916b89..6c9ef17 100644
--- a/custom_components/planavista/chores/engine.py
+++ b/custom_components/planavista/chores/engine.py
@@ -848,9 +848,12 @@ class ChoresEngine:
                         "date": d.isoformat(), "kind": "past", "away": bool(away),
                         **(
                             {key: summary.get(key) for key in ("due", "done", "pending", "closed")}
-                            | {"missed": len(summary.get("missed", []))}
+                            | {
+                                "missed": len(summary.get("missed", [])),
+                                "missed_items": [self._past_item(k, "missed") for k in summary.get("missed", [])],
+                            }
                             if summary
-                            else {"due": None, "done": None, "pending": None, "closed": None, "missed": 0}
+                            else {"due": None, "done": None, "pending": None, "closed": None, "missed": 0, "missed_items": []}
                         ),
                     })
                     continue
```

`custom_components/planavista/frontend/src/modules/chores/chores-types.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
index 17306f3..554c382 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
@@ -187,6 +187,8 @@ export interface WeekDay {
   pending: number | null;
   closed: boolean | null;
   missed: number;
+  /** What was missed, on a past day. */
+  missed_items?: PastItem[];
 }
 
 export interface WeeklyEntry {
```

`custom_components/planavista/frontend/src/modules/chores/week-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import { dayDate, minutesText } from '../../core/status-map';
import type { PastItem, WeekDay, WeekView, WeeklyEntry } from './chores-types';
import { dayWords, addDays } from './options-derive';

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** One person's day in the Week grid (spec 13.5): a mini ring and a word or two. */
export interface WeekCell {
  date: string;
  kind: WeekDay['kind'];
  /** "3 of 3", "1 missed", "3 due", "Away". */
  label: string;
  tone: 'plain' | 'bad' | 'muted';
  progress: number;
  closed: boolean;
  /** A day to come: the ring is dashed. */
  dashed: boolean;
  away: boolean;
  /** Nothing was due or nothing is known. */
  empty: boolean;
}

export interface WeekRow {
  member: Member;
  cells: WeekCell[];
  weekly: { text: string; badge: string | null; badgeTone: 'neutral' | 'act' | 'time'; progress: number } | null;
}

/** "Week of October 12". */
export function weekTitle(view: Pick<WeekView, 'week'>): string {
  const start = dayDate(view.week.start);
  return `Week of ${MONTHS[start.getMonth()]} ${start.getDate()}`;
}

/** The column heads: "Mon", "Tue" (with "Today" under today's). */
export function weekDays(view: Pick<WeekView, 'week' | 'today'>): Array<{ date: string; label: string; today: boolean }> {
  const days: Array<{ date: string; label: string; today: boolean }> = [];
  for (let n = 0; n < 7; n++) {
    const date = addDays(view.week.start, n);
    if (date >= view.week.end) break;
    days.push({ date, label: SHORT[dayDate(date).getDay()], today: date === view.today });
  }
  return days;
}

export function weekCell(day: WeekDay): WeekCell {
  const base = { date: day.date, kind: day.kind, away: day.away, dashed: day.kind === 'future' };
  if (day.away) return { ...base, label: 'Away', tone: 'muted', progress: 0, closed: false, empty: false };
  const due = day.due ?? 0;
  const finished = (day.done ?? 0) + (day.pending ?? 0);
  if (day.kind === 'future') {
    return { ...base, label: due ? `${due} due` : '', tone: 'muted', progress: 0, closed: false, empty: !due };
  }
  if (day.due === null) return { ...base, label: '', tone: 'muted', progress: 0, closed: false, empty: true };
  if (due === 0) return { ...base, label: 'Nothing due', tone: 'muted', progress: 0, closed: false, empty: true };
  if (day.kind === 'past' && day.missed > 0) {
    return { ...base, label: `${day.missed} missed`, tone: 'bad', progress: Math.min(1, finished / due), closed: false, empty: false };
  }
  return { ...base, label: `${Math.min(finished, due)} of ${due}`, tone: 'plain', progress: Math.min(1, finished / due), closed: !!day.closed || finished >= due, empty: false };
}

/** Weekly chores for one person: "1 of 3", with "Laundry from Mon" or "⏳ 1 waiting" (spec 13.5). */
export function weeklyLine(entries: WeeklyEntry[], daysLeft: number, today: string): WeekRow['weekly'] {
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, e) => sum + e.total, 0);
  const done = entries.reduce((sum, e) => sum + e.done, 0);
  const pending = entries.reduce((sum, e) => sum + e.pending, 0);
  // A make-up is one whose day has passed; the Week view also looks at days still to come.
  const late = entries.filter(e => e.from && e.from < today).sort((a, b) => (a.from ?? '').localeCompare(b.from ?? ''))[0];
  let badge: string | null = null;
  let badgeTone: 'neutral' | 'act' | 'time' = 'neutral';
  if (late?.from) {
    badge = `${late.name} from ${SHORT[dayDate(late.from).getDay()]}`;
    badgeTone = 'time';
  } else if (pending) {
    badge = `⏳ ${pending} waiting`;
    badgeTone = 'act';
  } else if (done + pending < total) {
    badge = daysLeft === 1 ? 'Last day' : `${daysLeft} days left`;
  }
  return { text: `${done + pending} of ${total}`, badge, badgeTone, progress: total ? (done + pending) / total : 0 };
}

export function weekRows(view: WeekView, members: Member[], daysLeft: number): WeekRow[] {
  return members
    .filter(m => view.members[m.id])
    .map(member => {
      const entry = view.members[member.id];
      return {
        member,
        cells: entry.days.map(weekCell),
        weekly: weeklyLine(entry.weekly, daysLeft, view.today),
      };
    });
}

/** A plain-language highlight under the grid, with an Excuse it for a missed chore (spec 13.5). */
export interface Highlight {
  key: string;
  member: Member;
  text: string;
  excuse?: { occurrence: string; name: string; day: string };
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function joinDays(days: string[]): string {
  const names = days.map(d => WEEKDAYS[dayDate(d).getDay()]);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Up to three highlights: rings closed all week, a chore missed, someone away. */
export function weekHighlights(view: WeekView, members: Member[], limit = 3): Highlight[] {
  const found: Highlight[] = [];
  for (const member of members) {
    const entry = view.members[member.id];
    if (!entry) continue;
    const counted = entry.days.filter(d => d.kind !== 'future' && !d.away && (d.due ?? 0) > 0);
    if (counted.length >= 2 && counted.some(d => d.kind === 'past') && counted.every(d => weekCell(d).closed)) {
      found.push({ key: `closed:${member.id}`, member, text: `${member.name} has closed every ring this week.` });
    }
  }
  for (const member of members) {
    const entry = view.members[member.id];
    if (!entry) continue;
    for (const day of entry.days) {
      for (const missed of day.missed_items ?? []) {
        found.push({
          key: `missed:${missed.key}`, member,
          text: `${member.name} missed ${missed.name} on ${dayWords(day.date, view.today)}.`,
          excuse: { occurrence: missed.key, name: missed.name, day: day.date },
        });
      }
    }
  }
  for (const member of members) {
    const entry = view.members[member.id];
    const away = entry?.days.filter(d => d.away).map(d => d.date) ?? [];
    if (away.length) found.push({ key: `away:${member.id}`, member, text: `${member.name} is away ${joinDays(away)}.` });
  }
  return found.slice(0, limit);
}

/** Shared chores this week, by time done: everyone's minutes, for the fairness bar. */
export function weekShares(view: WeekView, members: Member[]): Array<{ member: Member; minutes: number; text: string; percent: number }> {
  const shares = members
    .filter(m => view.members[m.id])
    .map(member => ({ member, minutes: view.members[member.id].contribution.shared_minutes }));
  const total = shares.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return [];
  return shares
    .filter(s => s.minutes > 0)
    .map(s => ({ ...s, text: `${s.member.name} ${minutesText(s.minutes)}`, percent: (100 * s.minutes) / total }));
}

export type { PastItem };
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-week.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { swipeDirection } from '../../utils/gestures';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { WeekView } from './chores-types';
import { Highlight, WeekCell, WeekRow, weekDays, weekTitle } from './week-derive';

/**
 * pv-chores-week: how the week is going, for everyone (spec 13.5). One mini
 * ring per person per day (closed when everything due that day was done),
 * today outlined and days to come dashed; weekly chores in their own column
 * (a section in portrait); a fairness bar and up to three highlights below.
 * Tap a cell to see that day; swipe or use the arrows for other weeks.
 *
 * @fires pv-week-nav - { offset } -1, 1, or 0 for this week
 * @fires pv-week-day - { member, date } a cell was tapped
 * @fires pv-week-excuse - { occurrence, name, member } Excuse it on a highlight
 */
export class PvChoresWeek extends LitElement {
  @property({ attribute: false }) view: WeekView | null = null;
  @property({ attribute: false }) rows: WeekRow[] = [];
  @property({ attribute: false }) highlights: Highlight[] = [];
  @property({ attribute: false }) shares: Array<{ member: Member; text: string; percent: number }> = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Whether Excuse it shows (parents, or a screen that can ask for a parent's PIN). */
  @property({ type: Boolean }) canExcuse = false;
  @property({ type: Boolean }) current = true;
  @property({ type: Boolean }) failed = false;
  private _touch: { x: number; y: number } | null = null;

  static styles = [
    buttonStyles,
    choresStyles,
    css`
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }

      .wrap {
        max-width: 1200px;
        margin: 0 auto;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      .top h2 {
        margin: 0 6px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.375rem;
        font-weight: 800;
      }

      .nav {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-size: 1.25rem;
        cursor: pointer;
      }

      .this-week {
        margin-left: auto;
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 12px;
      }

      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
      }

      .grid.landscape {
        grid-template-columns: 120px repeat(7, minmax(0, 1fr)) minmax(160px, 220px);
      }

      .grid.portrait {
        grid-template-columns: 96px repeat(7, minmax(0, 1fr));
      }

      .grid.phone {
        grid-template-columns: 52px repeat(7, minmax(0, 1fr));
        gap: 4px;
      }

      .dayhead {
        text-align: center;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--pv-text-muted, #8E949C);
        line-height: 1.2;
      }

      .dayhead.today {
        color: var(--pv-accent-ink, #5B5BD6);
      }

      .dayhead .sub {
        display: block;
        font-size: 0.6875rem;
      }

      .who {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        min-width: 0;
      }

      .grid.phone .who span.name {
        display: none;
      }

      .who .streak {
        display: block;
        font-weight: 600;
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 72px;
        padding: 6px 2px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .cell.today {
        border: 1.5px solid var(--pv-accent, #5B5BD6);
        background: var(--pv-today-bg, rgba(91, 91, 214, 0.06));
      }

      .cell.future {
        border-style: dashed;
        color: var(--pv-text-muted, #8E949C);
      }

      .cell.away {
        background: var(--pv-chip, #F1F1EE);
      }

      .cell .bad {
        padding: 1px 6px;
        border-radius: 6px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-weight: 700;
      }

      .weekly {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        font-size: 0.8125rem;
      }

      .weekly .line {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .bar {
        height: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
      }

      .weekly-section {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      :host([layout='phone']) .weekly-section {
        grid-template-columns: minmax(0, 1fr);
      }

      .weekly-section .weekly {
        border-left: 3px solid var(--c);
      }

      .lower {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        margin-top: 12px;
      }

      :host(:not([layout='landscape'])) .lower {
        grid-template-columns: minmax(0, 1fr);
      }

      .fair .stack {
        display: flex;
        height: 12px;
        gap: 2px;
        margin: 8px 0 6px;
      }

      .fair .stack span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: -1px;
      }

      .highlights p {
        margin: 0 0 6px;
        line-height: 1.5;
      }

      .highlights .link {
        min-height: 40px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
        padding: 0 4px;
      }

      h3 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 800;
      }
    `,
  ];

  render() {
    const view = this.view;
    const shape = this.layout === 'landscape' ? 'landscape' : this.layout === 'phone' ? 'phone' : 'portrait';
    return html`
      <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
        <div class="top">
          <button class="nav" type="button" aria-label="Last week" @click=${() => this._nav(-1)}>‹</button>
          <h2>${view ? weekTitle(view) : 'This week'}</h2>
          <button class="nav" type="button" aria-label="Next week" @click=${() => this._nav(1)}>›</button>
          ${this.current ? nothing : html`<button class="pv-btn pv-btn-secondary this-week" type="button" @click=${() => this._nav(0)}>This week</button>`}
        </div>
        ${this.failed ? html`
          <div class="state"><div class="art" aria-hidden="true">📡</div><h2>Couldn't load this week</h2>
            <p>Home Assistant didn't answer. Try again in a moment.</p>
            <div class="buttons"><button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._nav(0)}>Try again</button></div></div>
        ` : !view ? this._skeleton(shape) : this._grid(view, shape)}
      </div>
    `;
  }

  private _skeleton(shape: string) {
    return html`
      <div class="card" aria-busy="true" aria-label="Loading the week">
        <div class="grid ${shape}">
          ${Array.from({ length: 4 * (shape === 'landscape' ? 9 : 8) }, () => html`<div class="bone" style="height:72px"></div>`)}
        </div>
      </div>
    `;
  }

  private _grid(view: WeekView, shape: string) {
    const days = weekDays(view);
    return html`
      <div class="card">
        <div class="grid ${shape}" role="grid" aria-label=${weekTitle(view)}>
          <div></div>
          ${days.map(d => html`<div class="dayhead ${d.today ? 'today' : ''}">${d.label}${d.today ? html`<span class="sub">Today</span>` : nothing}</div>`)}
          ${shape === 'landscape' ? html`<div class="dayhead">Weekly chores</div>` : nothing}
          ${this.rows.map(row => this._row(row, shape))}
        </div>
      </div>
      ${shape !== 'landscape' ? this._weeklySection() : nothing}
      <div class="lower">
        ${this.shares.length ? html`
          <div class="card fair">
            <h3>Shared chores this week, by time done</h3>
            <div class="stack" role="img" aria-label=${this.shares.map(s => s.text).join(', ')}>
              ${this.shares.map(s => html`<span style="width:${s.percent}%;background:${this.colorOf(s.member)}"></span>`)}
            </div>
            <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.text}</span>`)}</div>
          </div>
        ` : nothing}
        ${this.highlights.length ? html`
          <div class="card highlights">
            ${this.highlights.map(h => html`
              <p><strong>${h.member.name}</strong>${h.text.slice(h.member.name.length)}
                ${h.excuse && this.canExcuse ? html`<button class="link" type="button"
                  @click=${() => this._fire('pv-week-excuse', { occurrence: h.excuse!.occurrence, name: h.excuse!.name, member: h.member.id })}>Excuse it</button>` : nothing}
              </p>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _row(row: WeekRow, shape: string) {
    const member = row.member;
    const color = this.colorOf(member);
    return html`
      <div class="who">
        <pv-member-avatar .member=${{ ...member, color }} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="name">${member.name}</span>
      </div>
      ${row.cells.map(cell => this._cell(member, cell, color))}
      ${shape === 'landscape' ? this._weekly(row, color) : nothing}
    `;
  }

  private _cell(member: Member, cell: WeekCell, color: string) {
    const label = `${member.name}, ${cell.date}: ${cell.label || 'nothing known'}`;
    return html`
      <button class="cell ${cell.kind} ${cell.away ? 'away' : ''}" type="button" aria-label=${label}
        @click=${() => this._fire('pv-week-day', { member: member.id, date: cell.date })}>
        ${cell.away ? html`<span aria-hidden="true">🧳</span>` : cell.empty ? nothing : html`
          <pv-ring size="34" .progress=${cell.progress} ?closed=${cell.closed} ?dashed=${cell.dashed} color=${color}></pv-ring>
        `}
        <span class=${cell.tone === 'bad' ? 'bad' : ''}>${cell.label}</span>
      </button>
    `;
  }

  private _weekly(row: WeekRow, color: string) {
    const weekly = row.weekly;
    if (!weekly) return html`<div class="weekly"><span class="meta">No weekly chores</span></div>`;
    return html`
      <div class="weekly">
        <div class="line"><strong class="num">${weekly.text}</strong>
          ${weekly.badge ? html`<span class="badge ${weekly.badgeTone}">${weekly.badge}</span>` : nothing}
        </div>
        <div class="bar"><span style="width:${Math.round(weekly.progress * 100)}%;background:${color}"></span></div>
      </div>
    `;
  }

  private _weeklySection() {
    const rows = this.rows;
    if (!rows.some(r => r.weekly)) return nothing;
    return html`
      <div class="section-head" style="margin:14px 2px 0"><span>Weekly chores</span></div>
      <div class="weekly-section">
        ${rows.map(row => html`
          <div class="weekly" style="--c:${this.colorOf(row.member)}">
            <div class="line"><strong>${row.member.name}</strong>
              ${row.weekly ? html`<span class="num">${row.weekly.text}</span>${row.weekly.badge ? html`<span class="badge ${row.weekly.badgeTone}">${row.weekly.badge}</span>` : nothing}` : html`<span class="meta">No weekly chores</span>`}
            </div>
            ${row.weekly ? html`<div class="bar"><span style="width:${Math.round(row.weekly.progress * 100)}%;background:${this.colorOf(row.member)}"></span></div>` : nothing}
          </div>
        `)}
      </div>
    `;
  }

  private _nav(offset: number): void {
    this._fire('pv-week-nav', { offset });
  }

  private _touchStart = (event: TouchEvent): void => {
    this._touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  private _touchEnd = (event: TouchEvent): void => {
    const start = this._touch;
    this._touch = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction) this._nav(direction === 'next' ? 1 : -1);
  };

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-week', PvChoresWeek);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { StatusBadge, itemBadge, pastBadge } from '../../core/status-map';
import { SheetMotion } from '../../shell/sheet-motion';
import { choresStyles } from './chores-styles';
import type { DayView, ItemView, PastItem } from './chores-types';
import { pictureOf } from './pv-chore-tile';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Monday, October 12". */
export function longDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function isPast(item: ItemView | PastItem): item is PastItem {
  return !('section' in item);
}

/**
 * pv-chores-day-sheet: one person's day from the Week view (spec 13.5):
 * what was due, done, missed, or excused on a past day, and what is due on
 * today or a day to come. Parents can excuse a missed one.
 *
 * @fires pv-day-excuse - { occurrence, name } Excuse it on a missed one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresDaySheet extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) member!: Member;
  @property({ type: String }) date = '';
  @property({ type: String }) today = '';
  /** The day, once it arrives; null while loading. */
  @property({ attribute: false }) day: DayView | null = null;
  @property({ type: Boolean }) failed = false;
  @property({ type: Boolean }) canExcuse = false;
  @property({ attribute: false }) names: (id: string) => string = id => id;

  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    choresStyles,
    css`
      .heading {
        text-align: left;
      }

      .sub {
        margin: 0 0 12px;
        color: var(--pv-text-secondary, #5F6670);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      li .name {
        flex: 1 1 auto;
        min-width: 0;
      }

      li .pic {
        width: 28px;
        text-align: center;
      }

      .link {
        min-height: 40px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLElement>('.actions button')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _badge(item: ItemView | PastItem): StatusBadge | null {
    if (isPast(item)) {
      const badge = pastBadge(item.status);
      if (item.status === 'done' && item.done_by && item.done_by !== this.member.id) return { ...badge, words: `Done by ${this.names(item.done_by)}` };
      return badge;
    }
    return itemBadge(item, { today: this.today, daysLeft: 7, remaining: 0 }) ?? (item.status === 'done' ? pastBadge('done') : null);
  }

  render() {
    const entry = this.day?.members[this.member?.id ?? ''];
    const summary = entry?.summary;
    const sub = !this.day
      ? ''
      : entry?.away
        ? 'Away: nothing was due, and the streak keeps.'
        : summary
          ? summary.closed ? `Ring closed: ${summary.done + summary.pending} of ${summary.due} done.` : `${summary.done + summary.pending} of ${summary.due} done.`
          : this.day.kind === 'future' ? 'Still to come.' : '';
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title">${this.member?.name} · ${longDay(this.date)}</h2>
        ${sub ? html`<p class="sub">${sub}</p>` : nothing}
        ${this.failed ? html`<p class="sub">Couldn't load this day. Try again in a moment.</p>` : !this.day ? html`
          <div aria-busy="true"><div class="bone" style="height:44px;margin-bottom:8px"></div><div class="bone" style="height:44px"></div></div>
        ` : entry && entry.items.length ? html`
          <ul>
            ${entry.items.map(item => {
              const badge = this._badge(item);
              return html`
                <li>
                  <span class="pic" aria-hidden="true">${pictureOf(item.icon)}</span>
                  <span class="name">${item.name}</span>
                  ${badge ? html`<span class="badge ${badge.tone}">${badge.glyph ? `${badge.glyph} ` : ''}${badge.words}</span>` : nothing}
                  ${isPast(item) && item.status === 'missed' && this.canExcuse ? html`
                    <button class="link" type="button" @click=${() => this._excuse(item)}>Excuse it</button>
                  ` : nothing}
                </li>
              `;
            })}
          </ul>
        ` : html`<p class="sub">Nothing was on the board.</p>`}
        <div class="actions"><button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button></div>
      </div>
    `;
  }

  private _excuse(item: PastItem): void {
    this.dispatchEvent(new CustomEvent('pv-day-excuse', { detail: { occurrence: item.key, name: item.name }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-day-sheet', PvChoresDaySheet);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 9f55257..630c778 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -19,6 +19,9 @@ import { ColumnModel, RowModel, boardColumns } from './board-derive';
 import { eventsOn } from './calendar-ties';
 import { bedtimeOn, fairShares, goalFor } from './my-day-derive';
 import type { MyDayStyle } from './pv-chores-my-day';
+import type { DayView, WeekView } from './chores-types';
+import { weekHighlights, weekRows, weekShares } from './week-derive';
+import { addDays } from './options-derive';
 import { memoizeOne } from '../../utils/render-cache';
 import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
@@ -38,6 +41,8 @@ import './pv-chore-options';
 import './pv-chores-inbox';
 import './pv-chores-quick-add';
 import './pv-chores-my-day';
+import './pv-chores-week';
+import './pv-chores-day-sheet';
 
 /** A sheet the chores screens show over themselves. */
 type ChoresSheet =
@@ -47,6 +52,7 @@ type ChoresSheet =
   | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
   | { kind: 'delete'; row: RowModel }
   | { kind: 'inbox' }
+  | { kind: 'day'; member: string; date: string; day: DayView | null; failed: boolean }
   | { kind: 'quick_add'; busy: boolean };
 
 /** What the last check-off toast can take back or hand to someone else. */
@@ -84,6 +90,12 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   @state() protected _toast: Toast | null = null;
   /** Minutes since the epoch, so bands and the evening check move with the clock. */
   @state() private _minute = Math.floor(Date.now() / 60000);
+  /** The Week view: how many weeks from this one, what came back, and for which request. */
+  @state() private _weekOffset = 0;
+  @state() private _week: WeekView | null = null;
+  @state() private _weekFailed = false;
+  private _weekAsked: string | null = null;
+  private _weekRevision = -1;
   /** Whose My day is showing. */
   @state() private _myDayMember: string | null = null;
   /** Requests being answered in the inbox. */
@@ -215,6 +227,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
 
   protected updated(changed: PropertyValues): void {
     super.updated(changed);
+    if (this.view === 'week') this._loadWeek();
     const open = this._sheet !== null;
     if (open !== this._overlayOpen) {
       this._overlayOpen = open;
@@ -343,6 +356,78 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     `;
   }
 
+  /** The week to show, fetched when the view opens, the week changes, or (this week) the board changes. */
+  private _loadWeek(force = false): void {
+    const board = this.service?.board();
+    const api = this.service?.api;
+    if (!board || !api) return;
+    const date = this._weekOffset === 0 ? board.week.start : addDays(board.week.start, 7 * this._weekOffset);
+    const stale = this._weekOffset === 0 && this._weekRevision !== this.revision;
+    if (!force && this._weekAsked === date && !stale) return;
+    this._weekAsked = date;
+    this._weekRevision = this.revision;
+    if (this._week?.week.start !== date) this._week = null;
+    this._weekFailed = false;
+    api.week(date).then(
+      view => {
+        if (this._weekAsked === date) this._week = view;
+      },
+      () => {
+        if (this._weekAsked === date) this._weekFailed = true;
+      },
+    );
+  }
+
+  private _renderWeek(board: Board) {
+    const members = inOrder(this.household?.members ?? []);
+    const view = this._week;
+    return html`
+      <pv-chores-week .view=${view} .rows=${view ? weekRows(view, members, board.week.days_left) : []}
+        .highlights=${view ? weekHighlights(view, members) : []} .shares=${view ? weekShares(view, members) : []}
+        .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout} ?current=${this._weekOffset === 0}
+        ?failed=${this._weekFailed} ?canExcuse=${parentAccess(this.household, this.session) !== 'no'}
+        @pv-week-nav=${(e: CustomEvent<{ offset: number }>) => this._navWeek(e.detail.offset)}
+        @pv-week-day=${(e: CustomEvent<{ member: string; date: string }>) => this._openDay(e.detail.member, e.detail.date)}
+        @pv-week-excuse=${(e: CustomEvent<{ occurrence: string; name: string; member: string }>) => void this._excuseMissed(e.detail.occurrence, e.detail.name, e.detail.member)}>
+      </pv-chores-week>
+    `;
+  }
+
+  private _navWeek(offset: number): void {
+    this._weekOffset = offset === 0 ? 0 : this._weekOffset + offset;
+    this._loadWeek(offset === 0 && this._weekFailed);
+  }
+
+  private _openDay(member: string, date: string): void {
+    const api = this.service?.api;
+    if (!api) return;
+    const sheet = { kind: 'day' as const, member, date, day: null, failed: false };
+    this._sheet = sheet;
+    api.day(date).then(
+      day => {
+        if (this._sheet?.kind === 'day' && this._sheet.date === date) this._sheet = { ...this._sheet, day };
+      },
+      () => {
+        if (this._sheet?.kind === 'day' && this._sheet.date === date) this._sheet = { ...this._sheet, failed: true };
+      },
+    );
+  }
+
+  /** Excuse it on a missed one (spec 13.5): its day and the streak hold. */
+  private async _excuseMissed(occurrence: string, name: string, member: string): Promise<void> {
+    const api = this.service?.api;
+    if (!api || !(await this.asParent(`Who's excusing ${name}?`))) return;
+    try {
+      await api.excuseMissed(occurrence);
+      const who = this._member(member)?.name;
+      this.showToast({ id: `excused-${occurrence}`, text: `Excused ${name}.${who ? ` ${who}'s streak holds.` : ''}` });
+      this._loadWeek(true);
+      if (this._sheet?.kind === 'day') this._openDay(this._sheet.member, this._sheet.date);
+    } catch (err) {
+      this.showToast({ id: `excuse-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
+  }
+
   /** The view the bar picked. */
   protected renderView(): unknown {
     const board = this.service?.board();
@@ -350,6 +435,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     const empty = board.chores.length === 0;
     if (empty) return this._empty();
     if (this.view === 'my_day') return this._renderMyDay(board);
+    if (this.view === 'week') return this._renderWeek(board);
     return html`
       <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
         .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
@@ -729,6 +815,18 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   private _renderSheet() {
     const sheet = this._sheet;
     if (!sheet) return this.renderSheet();
+    if (sheet.kind === 'day') {
+      const member = this._member(sheet.member);
+      const board = this.service?.board();
+      if (!member || !board) return nothing;
+      return html`
+        <pv-chores-day-sheet .layout=${this.layout} .member=${member} date=${sheet.date} today=${board.today}
+          .day=${sheet.day} ?failed=${sheet.failed} ?canExcuse=${parentAccess(this.household, this.session) !== 'no'}
+          .names=${(id: string) => this._member(id)?.name ?? id}
+          @pv-day-excuse=${(e: CustomEvent<{ occurrence: string; name: string }>) => void this._excuseMissed(e.detail.occurrence, e.detail.name, sheet.member)}
+          @pv-sheet-close=${() => { if (this._sheet?.kind === 'day') this._sheet = null; }}></pv-chores-day-sheet>
+      `;
+    }
     if (sheet.kind === 'inbox') {
       const board = this.service?.board();
       if (!board) return nothing;
```

- [ ] **Step 4: Run them again.** Expected: backend `30 passed`; frontend `6 passed`.
- [ ] **Step 5: Run both suites.** Expected: backend `963 passed`; tsc clean, frontend `561 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): the Week view, its day sheet, and Excuse it` with the trailers.

---

### Task 10: Rewards

Spec 13.6 (balances and goals on top; the catalog, each card saying who can afford it, with Redeem, "Not enough stars yet", or "⏳ Casey · Waiting for OK"; goals tagged; parents add a reward; who got what lately) and 8.15 (redeeming needs enough stars; a member pins one reward as their goal).

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`
- Test: `custom_components/planavista/frontend/test/rewards-derive.test.ts`

**Interfaces:**
- Consumes: Task 8's `goalFor`, Task 1's feed fields and prefs.
- Produces: `Balance`, `balances`, `RewardCard`, `rewardCards`, `eligible`, `recentLine`, `RewardDraft`, `rewardDraft`, `rewardProblem`, `rewardFrom`, `REWARD_PICTURES`; `pv-chores-rewards` (events `pv-reward-redeem`, `pv-reward-open`); `pv-chores-reward-sheet` (events `pv-reward-goal`, `pv-reward-save`, `pv-reward-delete`, `pv-sheet-close`).

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/rewards-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  balances,
  eligible,
  recentLine,
  rewardCards,
  rewardDraft,
  rewardFrom,
  rewardProblem,
} from '../src/modules/chores/rewards-derive';
import type { Reward } from '../src/modules/chores/chores-types';
import { MEMBERS, board, column } from './chores-fixtures';

const [, , casey, dana] = MEMBERS;
const reward = (id: string, cost: number, who: string[] = []): Reward => ({ id, name: id.replace(/_/g, ' '), icon: '🎁', cost, needs_ok: true, who });

const REWARDS = [reward('screen_time', 15), reward('weekend_game', 10), reward('movie_night_pick', 40, ['casey', 'dana']), reward('ice_cream_trip', 25)];
const PEOPLE = [MEMBERS[0], MEMBERS[1], { ...casey, goal: 'movie_night_pick' }, { ...dana, goal: 'ice_cream_trip' }];
const B = board(
  { alex: column([]), blair: column([]), casey: column([], { stars: 23 }), dana: column([], { stars: 12 }) },
  {
    rewards: REWARDS,
    requests: [{ id: 'r1', kind: 'redemption', member: 'casey', name: 'weekend game', at: '2026-10-13T13:00:00-05:00', reward: 'weekend_game', cost: 10, balance: 23 }],
    recent_redemptions: [{ id: 'g', member: 'casey', reward: 'screen_time', name: '30 minutes of extra screen time', cost: 15, at: '2026-10-11T18:00:00-05:00', by: 'blair' }],
  },
);

describe('balances (spec 13.6)', () => {
  it('lists who earns stars, with their goal', () => {
    const list = balances(B, PEOPLE);
    expect(list.map(b => [b.member.id, b.stars, b.goal?.need])).toEqual([['casey', 23, 17], ['dana', 12, 13]]);
  });
});

describe('rewardCards', () => {
  const cards = rewardCards(B, PEOPLE);

  it('says who can afford each, and how many more someone needs', () => {
    expect(cards[0].people.map(p => [p.member.id, p.afford, p.more])).toEqual([['casey', true, 0], ['dana', false, 3]]);
    expect(cards[0].canRedeem).toBe(true);
  });

  it('shows a redemption waiting for OK, and goals', () => {
    expect(cards[1].asked.map(m => m.id)).toEqual(['casey']);
    expect(cards[1].canRedeem).toBe(true);
    expect(cards[2].goals.map(m => m.id)).toEqual(['casey']);
    expect(cards[2].canRedeem).toBe(false);
  });

  it('keeps a reward to the people named on it', () => {
    expect(eligible(reward('x', 5, ['dana']), PEOPLE).map(m => m.id)).toEqual(['dana']);
    expect(eligible(reward('x', 5), PEOPLE).map(m => m.id)).toEqual(['casey', 'dana']);
  });
});

describe('recentLine', () => {
  it('says who got what, and who approved it', () => {
    expect(recentLine(B, PEOPLE)).toBe('Recently: Casey redeemed 30 minutes of extra screen time on Sunday, approved by Blair.');
    expect(recentLine({ ...B, recent_redemptions: [] }, PEOPLE)).toBeNull();
  });
});

describe('the reward sheet', () => {
  it('starts from a reward or from nothing, and says what is missing', () => {
    expect(rewardDraft()).toEqual({ name: '', icon: '🎁', cost: 20, needsOk: true, who: [] });
    expect(rewardDraft(REWARDS[2])).toMatchObject({ cost: 40, who: ['casey', 'dana'] });
    expect(rewardProblem(rewardDraft())).toBe('Add a name.');
    expect(rewardProblem({ ...rewardDraft(), name: 'Pizza', cost: 0 })).toBe('A reward costs from 1 to 10,000 stars.');
    expect(rewardFrom({ ...rewardDraft(), name: ' Pizza night ', icon: '🍕' })).toEqual({ name: 'Pizza night', icon: '🍕', cost: 20, needs_ok: true, who: [] });
  });
});
```

- [ ] **Step 2: Run them.** `npx vitest run test/rewards-derive.test.ts` Expected: FAIL: the file can't load `../src/modules/chores/rewards-derive`.

- [ ] **Step 3: Write Rewards.**

`custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts` (new):

```ts
import type { Member } from '../../core/household';
import type { Board, Reward } from './chores-types';
import { GoalModel, goalFor } from './my-day-derive';
import { dayWords } from './options-derive';

export interface Balance {
  member: Member;
  stars: number;
  goal: GoalModel | null;
}

/** Who earns stars, with their balance and goal (spec 13.6: balances and goals on top). */
export function balances(board: Board, members: Member[]): Balance[] {
  return members
    .filter(m => m.stars && board.members[m.id])
    .map(member => ({ member, stars: board.members[member.id].stars, goal: goalFor(member, board.members[member.id], board.rewards) }));
}

export interface RewardCard {
  reward: Reward;
  /** Who can get it, and whether they can afford it ("Casey ✓", "Dana: 3 more"). */
  people: Array<{ member: Member; afford: boolean; more: number; asked: boolean }>;
  /** "Casey's goal". */
  goals: Member[];
  /** Waiting for a parent: "⏳ Casey · Waiting for OK". */
  asked: Member[];
  /** Someone who can get it can afford it and hasn't asked yet. */
  canRedeem: boolean;
}

/** Who a reward is for: the people named, or everyone who earns stars (spec 7.5). */
export function eligible(reward: Reward, members: Member[]): Member[] {
  const earners = members.filter(m => m.stars);
  return reward.who.length ? earners.filter(m => reward.who.includes(m.id)) : earners;
}

/** The catalog (spec 13.6): each card shows who can afford it, goals, and redemptions waiting. */
export function rewardCards(board: Board, members: Member[]): RewardCard[] {
  return board.rewards.map(reward => {
    const asked = new Set(
      board.requests.filter(r => r.kind === 'redemption' && r.reward === reward.id).map(r => r.member),
    );
    const people = eligible(reward, members).map(member => {
      const stars = board.members[member.id]?.stars ?? 0;
      return { member, afford: stars >= reward.cost, more: Math.max(0, reward.cost - stars), asked: asked.has(member.id) };
    });
    return {
      reward,
      people,
      goals: members.filter(m => m.goal === reward.id),
      asked: members.filter(m => asked.has(m.id)),
      canRedeem: people.some(p => p.afford && !p.asked),
    };
  });
}

/** "Recently: Casey redeemed Pick the weekend game on Sunday, approved by Blair" (spec 13.6). */
export function recentLine(board: Board, members: Member[]): string | null {
  const last = board.recent_redemptions[0];
  if (!last) return null;
  const name = (id: string | null) => (id ? members.find(m => m.id === id)?.name ?? null : null);
  const who = name(last.member) ?? last.member;
  const by = last.by === 'auto' ? null : name(last.by);
  return `Recently: ${who} redeemed ${last.name} ${dayWords(last.at.slice(0, 10), board.today) === 'today' ? 'today' : `on ${dayWords(last.at.slice(0, 10), board.today)}`}${by ? `, approved by ${by}` : ''}.`;
}

/** A reward's answers so far in the reward sheet (spec 14.5: picture, name, cost, needs an OK, who). */
export interface RewardDraft {
  name: string;
  icon: string;
  cost: number;
  needsOk: boolean;
  who: string[];
}

export function rewardDraft(reward?: Reward): RewardDraft {
  return reward
    ? { name: reward.name, icon: reward.icon ?? '🎁', cost: reward.cost, needsOk: reward.needs_ok, who: [...reward.who] }
    : { name: '', icon: '🎁', cost: 20, needsOk: true, who: [] };
}

export function rewardProblem(draft: RewardDraft): string | null {
  if (!draft.name.trim()) return 'Add a name.';
  if (!Number.isInteger(draft.cost) || draft.cost < 1 || draft.cost > 10_000) return 'A reward costs from 1 to 10,000 stars.';
  return null;
}

export function rewardFrom(draft: RewardDraft): Partial<Reward> {
  return { name: draft.name.trim(), icon: draft.icon.trim() || null, cost: draft.cost, needs_ok: draft.needsOk, who: [...draft.who] };
}

/** Pictures a parent can tap for a reward. */
export const REWARD_PICTURES = ['🎁', '🎬', '🎮', '🍦', '🍕', '📱', '🌙', '💵', '🧸', '🎨', '⚽', '🏊', '🎟️', '🍪'];
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Balance, RewardCard } from './rewards-derive';
import { pictureOf } from './pv-chore-tile';

/**
 * pv-chores-rewards: what stars are for (spec 13.6). Balances and goals on
 * top; the catalog below, each card saying who can afford it, with Redeem
 * (it waits for a parent unless the reward needs no OK). Parents get an Add
 * a reward tile; a line at the bottom says who got what lately.
 *
 * @fires pv-reward-redeem - { reward } Redeem was tapped
 * @fires pv-reward-open - { reward } a card was tapped (its sheet), or { reward: null } for Add a reward
 */
export class PvChoresRewards extends LitElement {
  @property({ attribute: false }) balances: Balance[] = [];
  @property({ attribute: false }) cards: RewardCard[] = [];
  @property({ attribute: false }) recent: string | null = null;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Parents (or a screen that can ask for a parent's PIN) see Add a reward. */
  @property({ type: Boolean }) canEdit = false;

  static styles = [
    buttonStyles,
    choresStyles,
    css`
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }

      .wrap {
        max-width: 1200px;
        margin: 0 auto;
      }

      .balances {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .balance {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--c);
      }

      .balance .stars {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.75rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .balance .goal {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 8px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--c);
      }

      .catalog {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      :host([layout='portrait']) .catalog {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      :host([layout='phone']) .catalog {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        min-width: 0;
      }

      .open {
        display: flex;
        flex-direction: column;
        gap: 4px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 0;
        cursor: pointer;
      }

      .open:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 2px;
        border-radius: 10px;
      }

      .icon {
        font-size: 30px;
        line-height: 1.1;
      }

      .name {
        font-weight: 750;
        line-height: 1.25;
      }

      .cost {
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .tag {
        padding: 2px 6px;
        border-radius: 6px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .tag.ok {
        color: var(--pv-text, #1A1B1E);
      }

      .goal-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .card .action {
        margin-top: auto;
        min-height: 44px;
        width: 100%;
      }

      .add {
        align-items: center;
        justify-content: center;
        min-height: 160px;
        border-style: dashed;
        color: var(--pv-accent-ink, #5B5BD6);
        font-weight: 750;
        cursor: pointer;
        font: inherit;
        background: transparent;
      }

      .recent {
        margin: 14px 4px 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }
    `,
  ];

  render() {
    return html`
      <div class="wrap">
        ${this.balances.length ? html`
          <div class="balances">
            ${this.balances.map(b => html`
              <div class="balance" style="--c:${this.colorOf(b.member)}">
                <pv-member-avatar .member=${{ ...b.member, color: this.colorOf(b.member) }} .hass=${this.hass} size="40"></pv-member-avatar>
                <span class="stars num" aria-label=${`${b.member.name}: ${b.stars} stars`}>★ ${b.stars}</span>
                <div class="goal">
                  ${b.goal ? html`
                    Goal: ${pictureOf(b.goal.reward.icon)} ${b.goal.reward.name} · ${b.goal.need > 0 ? `${b.goal.need} more` : 'enough stars!'}
                    <div class="bar"><span style="width:${Math.round(b.goal.progress * 100)}%"></span></div>
                  ` : html`No goal yet`}
                </div>
              </div>
            `)}
          </div>
        ` : nothing}
        ${this.cards.length === 0 && !this.canEdit ? html`
          <div class="state"><div class="art" aria-hidden="true">🎁</div><h2>No rewards yet</h2><p>A parent can add rewards to save stars up for.</p></div>
        ` : html`
          <div class="catalog">
            ${this.cards.map(card => this._card(card))}
            ${this.canEdit ? html`
              <button class="card add" type="button" @click=${() => this._fire('pv-reward-open', { reward: null })}>+ Add a reward<span class="meta">parents</span></button>
            ` : nothing}
          </div>
        `}
        ${this.recent ? html`<p class="recent">${this.recent}</p>` : nothing}
      </div>
    `;
  }

  private _card(card: RewardCard) {
    const reward = card.reward;
    const asked = card.asked.length;
    return html`
      <div class="card">
        ${card.goals.length ? html`<span class="tag goal-tag">${card.goals.map(m => `${m.name}'s goal`).join(', ')}</span>` : nothing}
        <button class="open" type="button" @click=${() => this._fire('pv-reward-open', { reward: reward.id })}>
          <span class="icon" aria-hidden="true">${pictureOf(reward.icon)}</span>
          <span class="name">${reward.name}</span>
          <span class="cost num">★ ${reward.cost}</span>
        </button>
        <div class="tags">
          ${card.people.map(p => html`<span class="tag ${p.afford ? 'ok' : ''}">${p.member.name}${p.afford ? ' ✓' : `: ${p.more} more`}</span>`)}
          ${asked ? html`<span class="badge act">⏳ ${card.asked.map(m => m.name).join(', ')} · Waiting for OK</span>` : nothing}
        </div>
        ${card.canRedeem
          ? html`<button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._fire('pv-reward-redeem', { reward: reward.id })}>Redeem</button>`
          : html`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${asked ? 'Requested' : 'Not enough stars yet'}</button>`}
      </div>
    `;
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-rewards', PvChoresRewards);
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-reward-sheet.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import type { Reward } from './chores-types';
import { REWARD_PICTURES, RewardCard, RewardDraft, rewardDraft, rewardProblem } from './rewards-derive';
import { pictureOf } from './pv-chore-tile';

/**
 * pv-chores-reward-sheet: one reward (spec 13.6, 14.5). Anyone sees who can
 * get it and can save up for it (their goal); a parent edits its picture,
 * name, cost, whether it needs an OK, and who can get it, or deletes it.
 * With no reward, it opens as Add a reward.
 *
 * @fires pv-reward-goal - { member, reward | null } "Save up for this" switched
 * @fires pv-reward-save - { draft } Save (or Add)
 * @fires pv-reward-delete - Delete was tapped
 * @fires pv-sheet-close - Cancel, Done, Escape, a tap outside, or a drag down
 */
export class PvChoresRewardSheet extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) card: RewardCard | null = null;
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: Boolean }) canEdit = false;
  @property({ type: Boolean }) busy = false;

  @state() private _editing = false;
  @state() private _draft: RewardDraft = rewardDraft();
  @state() private _problem: string | null = null;
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;
  private _started = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      .icon {
        font-size: 44px;
        text-align: center;
      }

      .heading {
        margin-top: 4px;
      }

      .cost {
        text-align: center;
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
        margin-bottom: 10px;
      }

      .person {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 52px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .person .words {
        flex: 1 1 auto;
      }

      .person .meta {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .toggle {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .toggle[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      label.title,
      .title {
        display: block;
        margin: 12px 0 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'] {
        box-sizing: border-box;
        width: 100%;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .pictures {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pictures button {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 22px;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border: 2px solid var(--pv-accent, #5B5BD6);
      }

      .faces {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .face {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-height: 48px;
        padding: 4px;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--pv-text-secondary, #5F6670);
        cursor: pointer;
        opacity: 0.55;
      }

      .face[aria-pressed='true'] {
        opacity: 1;
        color: var(--pv-text, #1A1B1E);
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }

      .switch {
        position: relative;
        width: 52px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        cursor: pointer;
      }

      .switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
        transition: transform 180ms ease;
      }

      .switch[aria-checked='true'] {
        background: var(--pv-accent, #5B5BD6);
      }

      .switch[aria-checked='true']::after {
        transform: translateX(20px);
      }

      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }

      .danger {
        color: var(--pv-danger, #C62828);
      }
    `,
  ];

  protected willUpdate(): void {
    if (this._started) return;
    this._started = true;
    this._editing = !this.card;
    this._draft = rewardDraft(this.card?.reward);
  }

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLElement>('input, button')?.focus();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="reward-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._editing ? this._form() : this._view()}
      </div>
    `;
  }

  private _view() {
    const card = this.card;
    if (!card) return nothing;
    const reward = card.reward;
    return html`
      <div class="icon" aria-hidden="true">${pictureOf(reward.icon)}</div>
      <h2 class="heading" id="reward-title">${reward.name}</h2>
      <div class="cost">★ ${reward.cost}${reward.needs_ok ? ' · needs a parent\'s OK' : ''}</div>
      ${card.people.map(p => html`
        <div class="person">
          <pv-member-avatar .member=${{ ...p.member, color: this.colorOf(p.member) }} .hass=${this.hass} size="36"></pv-member-avatar>
          <div class="words">
            <div>${p.member.name}</div>
            <div class="meta">${p.asked ? 'Waiting for OK' : p.afford ? 'Has enough stars' : `${p.more} more to go`}</div>
          </div>
          <button class="toggle" type="button" aria-pressed=${p.member.goal === reward.id ? 'true' : 'false'}
            @click=${() => this._fire('pv-reward-goal', { member: p.member.id, reward: p.member.goal === reward.id ? null : reward.id })}>
            ${p.member.goal === reward.id ? 'Saving up for this' : 'Save up for this'}
          </button>
        </div>
      `)}
      ${card.people.length === 0 ? html`<p class="body">Nobody who earns stars can get this one yet.</p>` : nothing}
      <div class="actions">
        ${this.canEdit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._editing = true; }}>Edit reward</button>` : nothing}
        <button class="pv-btn pv-btn-ghost" type="button" @click=${() => void this.close()}>Done</button>
      </div>
    `;
  }

  private _set(changes: Partial<RewardDraft>): void {
    this._draft = { ...this._draft, ...changes };
    if (this._problem) this._problem = rewardProblem(this._draft);
  }

  private _form() {
    const d = this._draft;
    const editing = !!this.card;
    return html`
      <h2 class="heading" id="reward-title">${editing ? 'Edit reward' : 'Add a reward'}</h2>
      <span class="title">Picture</span>
      <div class="pictures">
        ${REWARD_PICTURES.map(p => html`<button type="button" aria-pressed=${d.icon === p ? 'true' : 'false'} aria-label=${p} @click=${() => this._set({ icon: p })}>${p}</button>`)}
      </div>
      <label class="title" for="reward-name">Name</label>
      <input id="reward-name" type="text" maxlength="60" placeholder="Movie night pick" .value=${d.name}
        @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })} />
      <label class="title" for="reward-cost">Cost in stars</label>
      <input id="reward-cost" type="number" min="1" max="10000" inputmode="numeric" .value=${String(d.cost)}
        @input=${(e: Event) => this._set({ cost: Math.round(Number((e.target as HTMLInputElement).value)) })} />
      <div class="row">
        <span>Needs a parent's OK</span>
        <button class="switch" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
          @click=${() => this._set({ needsOk: !d.needsOk })}></button>
      </div>
      <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
      <div class="faces">
        ${this.people.filter(p => p.stars).map(person => html`
          <button class="face" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'}
            @click=${() => this._set({ who: d.who.includes(person.id) ? d.who.filter(id => id !== person.id) : [...d.who, person.id] })}>
            <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="36"></pv-member-avatar>
            ${person.name}
          </button>
        `)}
      </div>
      ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
      <div class="actions">
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy ? 'Saving…' : editing ? 'Save' : 'Add'}</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => (editing ? (this._editing = false) : void this.close())}>Cancel</button>
        ${editing ? html`<button class="pv-btn pv-btn-ghost danger" type="button" @click=${() => this._fire('pv-reward-delete', {})}>Delete reward</button>` : nothing}
      </div>
    `;
  }

  private _save = (): void => {
    this._problem = rewardProblem(this._draft);
    if (this._problem) return;
    this._fire('pv-reward-save', { draft: this._draft });
  };

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-reward-sheet', PvChoresRewardSheet);

export type { Reward };
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 630c778..0b59b01 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -22,6 +22,7 @@ import type { MyDayStyle } from './pv-chores-my-day';
 import type { DayView, WeekView } from './chores-types';
 import { weekHighlights, weekRows, weekShares } from './week-derive';
 import { addDays } from './options-derive';
+import { RewardDraft, balances, recentLine, rewardCards, rewardFrom } from './rewards-derive';
 import { memoizeOne } from '../../utils/render-cache';
 import type { HoldDetail } from './pv-chore-item';
 import { needsOk } from './overlay';
@@ -43,6 +44,8 @@ import './pv-chores-quick-add';
 import './pv-chores-my-day';
 import './pv-chores-week';
 import './pv-chores-day-sheet';
+import './pv-chores-rewards';
+import './pv-chores-reward-sheet';
 
 /** A sheet the chores screens show over themselves. */
 type ChoresSheet =
@@ -52,6 +55,8 @@ type ChoresSheet =
   | { kind: 'options'; key: string; history: string[] | null; busy: boolean }
   | { kind: 'delete'; row: RowModel }
   | { kind: 'inbox' }
+  | { kind: 'reward'; id: string | null; busy: boolean }
+  | { kind: 'delete_reward'; id: string; name: string }
   | { kind: 'day'; member: string; date: string; day: DayView | null; failed: boolean }
   | { kind: 'quick_add'; busy: boolean };
 
@@ -428,6 +433,79 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     }
   }
 
+  private _renderRewards(board: Board) {
+    const members = inOrder(this.household?.members ?? []);
+    return html`
+      <pv-chores-rewards .balances=${balances(board, members)} .cards=${rewardCards(board, members)}
+        .recent=${recentLine(board, members)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
+        ?canEdit=${parentAccess(this.household, this.session) !== 'no'}
+        @pv-reward-redeem=${(e: CustomEvent<{ reward: string }>) => this._redeem(e.detail.reward)}
+        @pv-reward-open=${(e: CustomEvent<{ reward: string | null }>) => void this._openReward(e.detail.reward)}></pv-chores-rewards>
+    `;
+  }
+
+  /** Redeem: for whoever can afford it (asking who, when more than one can), behind their PIN if they have one. */
+  private _redeem(rewardId: string): void {
+    const board = this.service?.board();
+    if (!board) return;
+    const card = rewardCards(board, inOrder(this.household?.members ?? [])).find(c => c.reward.id === rewardId);
+    if (!card) return;
+    const ready = card.people.filter(p => p.afford && !p.asked).map(p => p.member);
+    const go = async (member: Member) => {
+      const api = this.service?.api;
+      if (!api || !(await this.asMember(member.id, `Who's getting ${card.reward.name}?`))) return;
+      try {
+        const out = await api.redeem(member.id, rewardId);
+        this.showToast({
+          id: `redeem-${Date.now()}`,
+          text: out.result === 'given' ? `${card.reward.name} is ${member.name}'s!` : `Asked for ${card.reward.name}. A parent will answer.`,
+        });
+      } catch (err) {
+        this.showToast({ id: `redeem-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+      }
+    };
+    if (ready.length === 1) {
+      void go(ready[0]);
+      return;
+    }
+    this._sheet = {
+      kind: 'people', heading: `Who's getting ${card.reward.name}?`, people: ready, body: `It costs ★ ${card.reward.cost}.`,
+      pick: member => { if (member) void go(member); },
+    };
+  }
+
+  private async _openReward(id: string | null): Promise<void> {
+    if (id === null && !(await this.asParent("Who's adding a reward?"))) return;
+    this._sheet = { kind: 'reward', id, busy: false };
+  }
+
+  private async _saveReward(id: string | null, draft: RewardDraft): Promise<void> {
+    const api = this.service?.api;
+    if (!api || !(await this.asParent(id ? "Who's changing this reward?" : "Who's adding a reward?"))) return;
+    this._sheet = { kind: 'reward', id, busy: true };
+    try {
+      await api.saveReward(rewardFrom(draft), id ?? undefined);
+      this._sheet = null;
+      this.showToast({ id: `reward-${Date.now()}`, text: id ? `Saved ${draft.name.trim()}.` : `Added ${draft.name.trim()}.` });
+    } catch (err) {
+      this._sheet = { kind: 'reward', id, busy: false };
+      this.showToast({ id: `reward-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
+  }
+
+  private async _setGoal(memberId: string, rewardId: string | null): Promise<void> {
+    const api = this.service?.api;
+    const member = this._member(memberId);
+    if (!api || !member || !(await this.asMember(memberId, `Whose goal is this?`))) return;
+    const reward = this.service?.board()?.rewards.find(r => r.id === rewardId);
+    try {
+      await api.savePrefs(memberId, { goal: rewardId });
+      this.showToast({ id: `goal-${Date.now()}`, text: reward ? `${member.name} is saving up for ${reward.name}.` : `${member.name} has no goal now.` });
+    } catch (err) {
+      this.showToast({ id: `goal-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
+  }
+
   /** The view the bar picked. */
   protected renderView(): unknown {
     const board = this.service?.board();
@@ -436,6 +514,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     if (empty) return this._empty();
     if (this.view === 'my_day') return this._renderMyDay(board);
     if (this.view === 'week') return this._renderWeek(board);
+    if (this.view === 'rewards') return this._renderRewards(board);
     return html`
       <pv-chores-board .board=${board} .household=${this.household} .session=${this.session} .data=${this.data}
         .hass=${this.hass} .timeFormat=${this.display?.time_format ?? '12h'} .mode=${this.mode} layout=${this.layout}
@@ -827,6 +906,32 @@ export class PvChoresModule extends LitElement implements ModuleElement {
           @pv-sheet-close=${() => { if (this._sheet?.kind === 'day') this._sheet = null; }}></pv-chores-day-sheet>
       `;
     }
+    if (sheet.kind === 'reward') {
+      const board = this.service?.board();
+      if (!board) return nothing;
+      const members = inOrder(this.household?.members ?? []);
+      const card = sheet.id ? rewardCards(board, members).find(c => c.reward.id === sheet.id) ?? null : null;
+      if (sheet.id && !card) {
+        queueMicrotask(() => { if (this._sheet === sheet) this._sheet = null; });
+        return nothing;
+      }
+      return html`
+        <pv-chores-reward-sheet .layout=${this.layout} .card=${card} .people=${members} .hass=${this.hass} .colorOf=${this._colorOf}
+          ?canEdit=${parentAccess(this.household, this.session) !== 'no'} ?busy=${sheet.busy}
+          @pv-reward-goal=${(e: CustomEvent<{ member: string; reward: string | null }>) => void this._setGoal(e.detail.member, e.detail.reward)}
+          @pv-reward-save=${(e: CustomEvent<{ draft: RewardDraft }>) => void this._saveReward(sheet.id, e.detail.draft)}
+          @pv-reward-delete=${() => { if (card) this._sheet = { kind: 'delete_reward', id: card.reward.id, name: card.reward.name }; }}
+          @pv-sheet-close=${() => { if (this._sheet?.kind === 'reward') this._sheet = null; }}></pv-chores-reward-sheet>
+      `;
+    }
+    if (sheet.kind === 'delete_reward') {
+      return html`
+        <pv-notice-sheet .layout=${this.layout} heading=${`Delete ${sheet.name}?`}
+          body="It leaves the catalog. Rewards already given stay in history, and nobody loses stars."
+          .actions=${[{ id: 'delete', label: `Delete ${sheet.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
+          @pv-sheet-action=${(e: CustomEvent<{ id: string }>) => void this._confirmDeleteReward(sheet.id, sheet.name, e.detail.id)}></pv-notice-sheet>
+      `;
+    }
     if (sheet.kind === 'inbox') {
       const board = this.service?.board();
       if (!board) return nothing;
@@ -900,6 +1005,12 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     await this._run(() => this.service!.api.deleteActivity(row.item.chore), `Deleted ${row.name}.`);
   }
 
+  private async _confirmDeleteReward(rewardId: string, name: string, id: string): Promise<void> {
+    this._sheet = null;
+    if (id !== 'delete' || !this.service || !(await this.asParent(`Who's deleting ${name}?`))) return;
+    await this._run(() => this.service!.api.deleteReward(rewardId), `Deleted ${name}.`);
+  }
+
   private async _onStartOver(id: string): Promise<void> {
     this._sheet = null;
     if (id !== 'start_over') return;
```

- [ ] **Step 4: Run them again.** Same command. Expected: `6 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `567 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): Rewards` with the trailers.

---

### Task 11: Rings in the calendar's Day view

Spec 13.9 (each person's column header in the Day view gets a small ring of today's chore progress; tapping it opens their My day). The calendar reads the Chores service through the services the shell hands every module.

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`, `custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`
- Test: `custom_components/planavista/frontend/test/day-rings.test.ts`

**Interfaces:**
- Consumes: Task 3's `memberProgress`, Task 4's `pv-open`.
- Produces: `ProgressOf`, `dayRing(name, progress)`; `pv-view-day.progress` and `.revision`; `pv-calendar-module.services` and `.revision`.

- [ ] **Step 1: Write the failing test.**

`custom_components/planavista/frontend/test/day-rings.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { dayRing } from '../src/modules/calendar/components/view-day';

describe('dayRing (spec 13.9)', () => {
  it('fills with today\'s chores, Waiting for OK counted as done', () => {
    expect(dayRing('Casey', { done: 1, pending: 1, due: 4 })).toEqual({
      fraction: 0.5, closed: false, label: 'Casey, 2 of 4 done today. Open Casey\'s day',
    });
  });

  it('closes when everything due is done', () => {
    expect(dayRing('Blair', { done: 5, pending: 0, due: 5 })).toMatchObject({ fraction: 1, closed: true, label: 'Blair, ring closed for today. Open Blair\'s day' });
  });

  it('draws no ring for someone with nothing due, or without chores', () => {
    expect(dayRing('Alex', { done: 0, pending: 0, due: 0 })).toBeNull();
    expect(dayRing('Alex', null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it.** `npx vitest run test/day-rings.test.ts` Expected: FAIL: `dayRing` is not exported from `view-day`.

- [ ] **Step 3: Draw the rings.**

`custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
index 6644eec..5ff6423 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/components/view-day.ts
@@ -19,9 +19,29 @@ import { contrastText } from '../../../core/color';
 import type { Layout } from '../../../core/layout';
 import { HOUR_PX, dayHourHeight, rescaleScroll } from '../layout-rules';
 
+/** Today's chore progress for one person (spec 13.9: rings in the Day view). */
+export type ProgressOf = (memberId: string) => { done: number; pending: number; due: number } | null;
+
+/** The ring's fraction and its words for a screen reader. */
+export function dayRing(name: string, progress: { done: number; pending: number; due: number } | null): { fraction: number; closed: boolean; label: string } | null {
+  if (!progress || progress.due <= 0) return null;
+  const finished = Math.min(progress.due, progress.done + progress.pending);
+  const closed = finished >= progress.due;
+  return {
+    fraction: finished / progress.due,
+    closed,
+    label: closed ? `${name}, ring closed for today. Open ${name}'s day` : `${name}, ${finished} of ${progress.due} done today. Open ${name}'s day`,
+  };
+}
+
 const DAY_START_HOUR = 0;
 const DAY_END_HOUR = 24;
 
+/**
+ * pv-view-day: the calendar's Day view, a column per person.
+ *
+ * @fires pv-open - { module: 'chores', view: 'my_day', member } a person's ring was tapped
+ */
 export class PVViewDay extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ type: Array }) events: CalendarEvent[] = [];
@@ -35,6 +55,10 @@ export class PVViewDay extends LitElement {
   @property({ type: Number }) tick = 0;
   /** The card's layout: portrait fits about 14 hours on screen (spec 12.2). */
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Today's chore progress per person, when Chores is on: each column header gets a ring. */
+  @property({ attribute: false }) progress: ProgressOf | null = null;
+  /** Bumped when chores change, so the rings redraw. */
+  @property({ attribute: false }) revision = 0;
 
   /** The hour height in px; the grid, the events, and the now-line all scale with it. */
   @state() private _hourPx = HOUR_PX;
@@ -135,6 +159,40 @@ export class PVViewDay extends LitElement {
         min-width: 0;
       }
 
+      .ring-wrap {
+        position: relative;
+        display: inline-flex;
+        padding: 0;
+        border: none;
+        background: transparent;
+        border-radius: 50%;
+        cursor: pointer;
+        -webkit-tap-highlight-color: transparent;
+      }
+
+      .ring-wrap:focus-visible {
+        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
+        outline-offset: 8px;
+      }
+
+      .ring-wrap svg {
+        position: absolute;
+        inset: -7px;
+        width: calc(100% + 14px);
+        height: calc(100% + 14px);
+        transform: rotate(-90deg);
+        pointer-events: none;
+        overflow: visible;
+      }
+
+      .ring-wrap .track {
+        stroke: var(--pv-track, #ECECE8);
+      }
+
+      .ring-wrap .done {
+        transition: stroke-dashoffset 600ms ease;
+      }
+
       .person-avatar {
         width: 64px;
         height: 64px;
@@ -491,6 +549,11 @@ export class PVViewDay extends LitElement {
     if (this.hasUpdated) this._watchHours();
   }
 
+  /** A ring opens that person's My day (spec 13.9). */
+  private _openDay(member: string): void {
+    this.dispatchEvent(new CustomEvent('pv-open', { detail: { module: 'chores', view: 'my_day', member }, bubbles: true, composed: true }));
+  }
+
   disconnectedCallback(): void {
     super.disconnectedCallback();
     this._hoursObserver?.disconnect();
@@ -616,12 +679,24 @@ export class PVViewDay extends LitElement {
               const borderColor = this.avatarBorderMode === 'light' ? colorLight
                 : this.avatarBorderMode === 'primary' ? color
                 : this.avatarBorderMode;
+              const picture = avatar
+                ? html`<img class="person-avatar" src="${avatar}" alt="${name}"
+                    style="${borderColor ? `--pv-avatar-border: ${borderColor}` : ''}" />`
+                : html`<div class="person-initial" style="background: ${color}; color: ${contrastText(color)}">${name[0]?.toUpperCase() || '?'}</div>`;
+              const ring = isCurrentDay && cal?.member_id && this.progress ? dayRing(name, this.progress(cal.member_id)) : null;
               return html`
                 <div class="person-header">
-                  ${avatar
-                    ? html`<img class="person-avatar" src="${avatar}" alt="${name}"
-                        style="${borderColor ? `--pv-avatar-border: ${borderColor}` : ''}" />`
-                    : html`<div class="person-initial" style="background: ${color}; color: ${contrastText(color)}">${name[0]?.toUpperCase() || '?'}</div>`}
+                  ${ring ? html`
+                    <button class="ring-wrap" type="button" aria-label=${ring.label}
+                      @click=${() => this._openDay(cal!.member_id!)}>
+                      ${picture}
+                      <svg viewBox="0 0 100 100" aria-hidden="true">
+                        <circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="6"></circle>
+                        <circle class="done" cx="50" cy="50" r="46" fill="none" stroke=${color} stroke-width="6" stroke-linecap="round"
+                          stroke-dasharray=${2 * Math.PI * 46} stroke-dashoffset=${2 * Math.PI * 46 * (1 - ring.fraction)}></circle>
+                      </svg>
+                    </button>
+                  ` : picture}
                   <span class="person-name">${name}</span>
                 </div>
               `;
```

`custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
index 79071b5..2ad55bf 100644
--- a/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
+++ b/custom_components/planavista/frontend/src/modules/calendar/calendar-module.ts
@@ -14,6 +14,7 @@ import { CalendarStoreController } from './calendar-store';
 import { CalendarDerived, deriveCalendarData } from './calendar-derive';
 import { withModeColors } from './mode-colors';
 import { contrastText } from '../../core/color';
+import type { ModuleService } from '../../core/module-registry';
 
 import './components/view-day';
 import './components/view-week';
@@ -47,6 +48,10 @@ export class PvCalendarModule extends LitElement {
   @property({ attribute: false }) view: ViewType | undefined;
   /** The card's layout (spec 12.1), passed on to the views. */
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
+  /** Other modules' card-wide state: the Day view's rings read Chores' progress (spec 13.9). */
+  @property({ attribute: false }) services: Record<string, ModuleService> = {};
+  /** Bumped by the card when a module's service has news. */
+  @property({ attribute: false }) revision = 0;
 
   /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
   @state() private _tick = Math.floor(Date.now() / 60000);
@@ -54,6 +59,8 @@ export class PvCalendarModule extends LitElement {
   @state() private _refreshing = false;
 
   private _pv = new CalendarStoreController(this);
+  /** Today's chore progress for the Day view's rings, from the Chores service. */
+  private _progressOf = (memberId: string) => this.services?.chores?.memberProgress?.(memberId) ?? null;
   /** What pv-overlay-change last said, so the card hears each change once. */
   private _overlayOpen = false;
   private _tickTimer: ReturnType<typeof setTimeout> | null = null;
@@ -732,6 +739,8 @@ export class PvCalendarModule extends LitElement {
           .avatarBorderMode=${avatarBorder}
           .sharedEventMap=${sharedEventMap}
           .tick=${tick}
+          .progress=${this.services?.chores?.memberProgress ? this._progressOf : null}
+          .revision=${this.revision}
         ></pv-view-day>`;
       }
       case 'week': {
```

- [ ] **Step 4: Run it again.** Same command. Expected: `3 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `570 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(calendar): rings in the Day view open My day` with the trailers.

---

### Task 12: Sheets give focus back, a locked circle explains itself, later bands dim; the bundle

Spec 11.8 (sheets return focus to where they came from), 13.2 (a quick tap on the circle shows a hint, also where this screen can't check it off), and 13.1 (later bands are dimmed).

**Files:**
- Modify: `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`, `custom_components/planavista/frontend/dist/planavista-cards.js` (rebuilt)

- [ ] **Step 1: Make the changes.**

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 0b59b01..f3fa510 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -60,6 +60,13 @@ type ChoresSheet =
   | { kind: 'day'; member: string; date: string; day: DayView | null; failed: boolean }
   | { kind: 'quick_add'; busy: boolean };
 
+/** The element with focus, looking inside shadow roots (the card's controls live in several). */
+function deepActiveElement(): HTMLElement | null {
+  let active: Element | null = document.activeElement;
+  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
+  return active instanceof HTMLElement ? active : null;
+}
+
 /** What the last check-off toast can take back or hand to someone else. */
 interface LastCheckoff {
   row: RowModel;
@@ -106,6 +113,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   /** Requests being answered in the inbox. */
   @state() private _reviewing: ReadonlySet<string> = new Set();
   private _overlayOpen = false;
+  /** What had focus when a sheet opened; it gets focus back when the sheet closes (spec 11.8). */
+  private _opener: HTMLElement | null = null;
   private _last: LastCheckoff | null = null;
   private _clock: ReturnType<typeof setInterval> | undefined;
 
@@ -223,6 +232,10 @@ export class PvChoresModule extends LitElement implements ModuleElement {
 
   protected willUpdate(changed: PropertyValues): void {
     super.willUpdate(changed);
+    if (changed.has('_sheet')) {
+      const before = changed.get('_sheet') as ChoresSheet | null | undefined;
+      if (!before && this._sheet) this._opener = deepActiveElement();
+    }
     // A ring in the calendar, or a column header, opened someone's day.
     if (changed.has('openTarget') && this.openTarget?.member) this._myDayMember = this.openTarget.member;
     const notices = this.service?.takeNotices() ?? [];
@@ -233,6 +246,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
   protected updated(changed: PropertyValues): void {
     super.updated(changed);
     if (this.view === 'week') this._loadWeek();
+    if (changed.has('_sheet') && changed.get('_sheet') && !this._sheet) {
+      const opener = this._opener;
+      this._opener = null;
+      if (opener?.isConnected) opener.focus();
+    }
     const open = this._sheet !== null;
     if (open !== this._overlayOpen) {
       this._overlayOpen = open;
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts
index abcd974..835d5a7 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-item.ts
@@ -42,6 +42,8 @@ export class PvChoreItem extends LitElement {
   @property({ type: Boolean, reflect: true }) narrow = false;
   /** This screen may not change this person's items (another child's, on a child's own login). */
   @property({ type: Boolean }) locked = false;
+  /** A later band's row: drawn a little quieter (spec 13.1). */
+  @property({ type: Boolean, reflect: true }) dim = false;
 
   @state() private _fill = 0;
   /** A hold finished and waits for its answer: the circle stays full. */
@@ -105,11 +107,16 @@ export class PvChoreItem extends LitElement {
         user-select: none;
       }
 
-      .circle[disabled] {
+      .circle[aria-disabled='true'] {
         cursor: default;
         opacity: 0.5;
       }
 
+      :host([dim]) .name,
+      :host([dim]) .end {
+        opacity: 0.72;
+      }
+
       .circle:focus-visible {
         outline: none;
       }
@@ -372,7 +379,7 @@ export class PvChoreItem extends LitElement {
     return html`
       <div class="row" style="--member:${color}">
         <div class="sweep" style="transform: scaleX(${done ? 0 : fill})"></div>
-        <button class="circle" type="button" aria-label=${action} ?disabled=${this.locked}
+        <button class="circle" type="button" aria-label=${action} aria-disabled=${this.locked ? 'true' : 'false'}
           @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
           @pointercancel=${this._cancel} @lostpointercapture=${this._up} @keydown=${this._key}
           @contextmenu=${(e: Event) => e.preventDefault()}>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
index d4c6cb6..ff81e43 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
@@ -150,10 +150,6 @@ export class PvChoresColumn extends LitElement {
         flex: 1;
       }
 
-      .head-row.later ~ pv-chore-item {
-        opacity: 0.92;
-      }
-
       .credit {
         margin: 10px 6px 0;
         font-size: 0.8125rem;
@@ -312,7 +308,7 @@ export class PvChoresColumn extends LitElement {
     if (entry.kind === 'credit') return html`<div class="credit" data-key=${entry.key}>${entry.text}</div>`;
     return html`
       <pv-chore-item data-key=${entry.key} .row=${entry.row} color=${this.color} ?narrow=${this.narrow}
-        ?highlight=${entry.zone === 'now'} ?locked=${this.locked}></pv-chore-item>
+        ?highlight=${entry.zone === 'now'} ?dim=${entry.zone === 'later'} ?locked=${this.locked}></pv-chore-item>
     `;
   }
 
```

- [ ] **Step 2: Rebuild the bundle.** `npm run build` Expected: `created dist/planavista-cards.js` (about 584 KB).
- [ ] **Step 3: Run both suites.** Expected: backend `963 passed`; tsc clean, frontend `570 passed`; the copy check passes.
- [ ] **Step 4: Commit.** Message `fix(chores): sheets give focus back, locked circles explain, later bands dim; rebuild the bundle` with the trailers. Push the branch.

---

### Task 13: The household's day on the dev Home Assistant, review, and demo (controller)

- [ ] **Step 1: Deploy.** `bash scripts/dev-ha.sh deploy`; the dev household has the sample people and chores (Dana added, the spec's chores and rewards; scripted in the session scratchpad).
- [ ] **Step 2: The sample household's day from the tablet** (spec 17.3 row 5's done-when), signed in as the Kitchen account at 800 by 1280 and again at 1280 by 800: Casey holds a chore and it moves to Done today with "+1 ★"; Dana holds a picture tile and it waits for OK; the bar's "⏳ 1 waiting for OK" asks for Blair's PIN and opens the inbox, Looks good; quick add adds a chore; the options sheet plans a day and asks for more time; My day in each style; the Week view and a day; Rewards: redeem, then approve in the inbox; Lock. Then the calendar's Day view ring opens My day, and a phone-sized check (390 by 844) of the board.
- [ ] **Step 3: An outage.** Stop the container with the board open, hold a chore, and see the banner and the waiting check-off; start it again, and the check-off is saved once (the stored queue empties).
- [ ] **Step 4: Light and dark, reduced motion.** Screenshots of the board in both appearances; the Motion setting on Reduced keeps the ring filling.
- [ ] **Step 5: Final review.** Run the review package over `main..HEAD` and dispatch a fresh reviewer on the most capable model with the plan, the spec, this plan's Review Focus verbatim, and the ledger's rulings. Re-grade, fix Critical and Important findings test-first in one pass, ledger the minors.
- [ ] **Step 6: Demo.** The demo message: what is in it, what to look at on the dev Home Assistant, screenshots, the finishing menu, "Rulings I made", and "Deferred minors". Wait for the go-ahead before any merge. No release follows this milestone.
