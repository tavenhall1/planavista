# Milestone 6, Chores Settings and Setup: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new household sets up chores from nothing, or from its plan file, on the tablet alone: Settings gains the Chores list and the chore editor (with `pv-recurrence-picker`), Rewards, Rules, Reminders, the person page's chores rows, and Import and export (import a plan, export and restore a PlanaVista file); first-run setup gains the chores steps (the chores choice, common chores, the plan file, restore, and the shared screen with parents' PINs); parents' phones get Waiting for OK notifications with buttons and everyone can get phone reminders at the evening check. The branch also carries release 1.3.0's version, card picker name, and README, published only after the go-ahead.

**Architecture:** The engine still decides everything. A pure `chores/importer.py` reads Household Hours plans and PlanaVista files, builds the review, works out what an import changes, and writes PlanaVista files; WebSocket commands preview and apply it (members first, then chores), and an `export_household` action returns the file. A `ChoresNotifier` in the runtime sends a notification for each new request, clears answered ones, checks each button press against a per-request token and a parent's linked user, and sends reminders at the evening check. On the card, Settings and setup stay shell code driven by registries: the chores module registers its pages, the person page's sections, its setup steps, and its part of setup's last step, and every page and step gets the card's module services. Pure derive modules (`*-derive.ts`, `recurrence.ts`, `worth.ts`, `chore-draft.ts`, `reward-draft.ts`, `starter-chores.ts`) carry the unit tests; shared JSON tables keep the card's worth, recurrence, and age-group rules identical to the backend's.

**Tech Stack:** Python 3.14 and Home Assistant 2026.9.4, tested with pytest-homeassistant-custom-component 0.13.367 in Docker (`scripts/test-backend.sh`); TypeScript 5.7 with Lit 3, Rollup, vitest 5 (node environment, `TZ=America/Chicago`).

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 6, with sections 6.4, 7.2 to 7.9, 8.3, 9.4 to 9.9, 10.4 to 10.8, 13.1, 13.3, 14 (all), and 15.3 to 15.5.

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data (spec 7.8): members gain optional `goal`, `bedtime`, `sleep_hours`, `phones`, and `notify`; the household's setup progress gains `start`; the chores feed gains `notify_problems`; imported chores keep their planner fields beside the chore's own. Nothing is renamed or removed, and 1.2.0 keeps unknown fields when it saves.
- `chores/importer.py` imports nothing from Home Assistant, like the engine; `chores/notify.py` is the Home Assistant side.
- Public surface (spec 10.8): one new action, `planavista.export_household` (response data only; admins and automations). New WebSocket commands: `planavista/stars/history`, `planavista/import/preview`, `planavista/import/apply`, `planavista/export`; `planavista/household/setup/save` takes `start`; `planavista/household/member/save` takes the new member fields. No entity changes. Notification actions are named `PLANAVISTA_<ALLOW|DECLINE>_<request id>_<token>`.
- PINs never pass through anything but `planavista/pin/*` (spec 9.8). A PlanaVista file never holds PINs, stars, history, or shared screens; nothing about a person but what Settings shows goes into it.
- The PlanaVista file format is published as a JSON Schema, `docs/schemas/planavista.household.v1.json`. Files over 2,000,000 characters are refused before they are read.
- Copy (spec 11.7): sentence case, "Waiting for OK" as the one name for a check-off that waits, errors that say what to do, destructive actions confirmed by name.
- Touch targets are at least 48 px; reduced motion keeps every step usable (spec 11.5, 11.8).
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, fixtures, and docs.
- Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or publish a release in this plan. Pushing the milestone branch for CI is allowed. Release 1.3.0 follows the user's go-ahead.
- Backend tests: `bash scripts/test-backend.sh` (from the repository root). Frontend: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`; the bundle (`npm run build`) is committed in Tasks 12 and 13 and must match the source.
- Paths are relative to the repository root.

## Review Focus

1. **A shared family screen whose parent mode ends halfway through setup or Settings** (two quiet minutes on the tablet, or the screen just marked shared in setup). Setup asks for a parent's PIN to keep going instead of failing every save, and marking the screen shared starts parent mode first. Pinned by Task 13's `setupNeedsPin` and `pinBeforeSharing` tests and the dev Home Assistant walkthrough in portrait.
2. **Importing a plan again, or one with someone new.** Matches update instead of adding copies (plan chores by `import_ref`, then by name), nothing is deleted, and a new person must get an age group before Import. Pinned by Task 2's `test_importing_again_updates_instead_of_duplicating` and `test_a_new_person_needs_an_age_group_before_anything_is_saved`, Task 3's `test_a_new_person_without_an_age_group_stops_the_import`, and Task 9's `missingAges` test.
3. **Chores data that needs a look.** A restore starts over first and then applies; a plan import is refused until a parent chooses; Settings lists it under Needs a look and Import and export offers Start over. Pinned by Task 3's `test_export_then_restore_brings_chores_back_after_they_need_a_look` and Task 11's Needs a look tests.
4. **A notification button pressed late, twice, from someone else's phone, or with a forged token.** A late or repeated press clears the notification on every parent's phone and changes nothing; a forged token is ignored without spending the real one; only a parent's own linked user can answer. Pinned by Task 4's `test_a_button_needs_a_parents_account_and_the_notifications_token` and `test_looks_good_on_a_parents_phone_approves_and_clears_every_copy`.
5. **A file that isn't a plan, comes from a newer version, or has problems.** Each says what to do ("This doesn't look like a Household Hours or PlanaVista file.", "Export it as version 1, or update PlanaVista.", the problems by item), and nothing is saved. Pinned by Task 2's `test_a_file_that_isnt_a_plan_says_so`, `test_a_plan_from_a_newer_planner_says_what_to_do`, and `test_problems_are_listed_by_item_and_nothing_is_read`, and Task 3's `test_a_file_that_cant_be_read_says_why`.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others. Every module and every test in Tasks 1 to 13 was built and run in a scratch branch before this plan was written (1040 backend tests and 720 frontend tests at the end, each task's tests run at its own commit), and each screen was checked on the dev Home Assistant at 1280 by 800, 800 by 1280, and 390 by 844, in light and dark, from the admin and the kitchen tablet's accounts: a new household from nothing, from a plan file, and from a restored PlanaVista file.

- **Ruling: what a person's phones get defaults to `{requests: true, reminders: false}`;** requests matter only for parents with phones, and reminders are opt-in per person. Cost if wrong: a parent who wanted reminders turns them on.
- **Ruling: phone reminders share the evening check's time,** and with the evening check off there are no reminders (Reminders says "Off"). Cost if wrong: a household that wants reminders without the banner can't have them yet.
- **Ruling: notification tokens live in memory,** one per request; after a restart, earlier buttons are stale (pressing one clears it and changes nothing), and the on-screen inbox and the day-end approval still cover those requests. Action ids are `PLANAVISTA_<ALLOW|DECLINE>_<request>_<token>`. Cost if wrong: a parent answers a request from before a restart on the screen instead.
- **Ruling: a forged token is ignored without clearing anything,** so the real buttons keep working; only a press for a request that's gone (answered, used, or sent before a restart) counts as stale and clears that notification on every parent's phone. Task 4's test comment said the forged button's notification is cleared; the code doesn't, and the comment is corrected in the plan and the replay. Cost if wrong: none.
- **Ruling: `left_today` moves from `sensor.py` to `status.py`,** shared by the chores-left sensors and the reminders. Reminders say "7:00 PM: 2 chores left" (title "Chores", tag `planavista-reminder`); requests are titled "Waiting for OK". Cost if wrong: none.
- **Ruling: new people in an import must get an age group before Import;** there's no default. Cost if wrong: one more tap per new person.
- **Ruling: shares that don't add up to the plan's minimum make the minimum their sum,** and the review lists it under Needs a look. Cost if wrong: an imported chore owes a little more time than the plan's headline number.
- **Ruling: imports match plan chores by `import_ref`, then by name among plan chores only;** rewards by id, then name; people by name (by id first for a restore). Nothing is deleted. Cost if wrong: a renamed chore in a hand-edited plan comes in as new.
- **Ruling: imported chores get no icon;** their picture comes from the name, as the chore editor's From the name shows (Task 13 makes the board's tiles follow the same rule). Cost if wrong: none.
- **Ruling: a restore is an import of a PlanaVista file with the same review;** members by id then name, chores by id then name, rewards by id then name, settings replaced, nothing deleted. A restore while chores need a look starts over first; a plan import then is refused until a parent restores or starts over. Cost if wrong: a damaged household needs one more choice.
- **Ruling: an export lists each person's calendars as links,** and a restore relinks calendars PlanaVista already shows. Cost if wrong: calendars added after the export need their Belongs to set again.
- **Ruling: import, preview, apply, and export are parent level;** importing chores turns chores on; problems come back as results (`{"problem": {code, message, problems}}`) because an error can't carry the list. The `export_household` action is for admins and automations only (spec 10.4 says admin). Cost if wrong: a parent's own login can't use the action (the card's Export still works).
- **Ruling: the shared-screen step applies only while chores are on** (spec 14.7 lists it with the chores steps), and `setup.start` (`restore`, `plan`, `common`, `empty`, `calendar`) records how setup began, so the steps that follow apply and setup resumes. Cost if wrong: a calendar-only home sets its shared screen in Settings, PINs and parent mode.
- **Ruling: rewards are edited on a pushed page, not a sheet,** like the other Settings editors; Weeks start on is read-only on Rules (it follows Calendar options); the evening check offers 4 PM to 10 PM in half hours (and the saved time); the day's start offers midnight to 6 AM in half hours; minutes per star step by 5 to 60, then by 15; reward costs step by 1 to 20, then by 5. Cost if wrong: an unusual value is set from Home Assistant instead.
- **Ruling: Settings says "1 h 30 min",** while the board keeps its short "1.5 h"; one-time chores say "Today" and "Tomorrow"; the editor's stars are Automatic or Set (a stepper), its category is a select, and its picture is a grid of 30 plus any emoji. Cost if wrong: copy only.
- **Ruling: Reminders lists people without a phone in one hint, only those linked to a Home Assistant person.** Cost if wrong: a child without an account isn't nudged toward a phone.
- **Ruling: the person page takes module sections (slots `role`, `pin`, `links`),** so the shell stays free of chores code; changing someone's age group resets My day, Needs an OK for, and Stars to that group's defaults in the editor; a parent's Needs an OK for shows "Never"; phone choices are the `notify.mobile_app_*` services, the person's own devices first; rematch is a select (New person or a member). Cost if wrong: a parent sets those three again after changing an age group.
- **Ruling: Import and export shows while chores are off** (importing turns them on); Export downloads a file and offers Copy the text (wall tablets rarely save files); the import toast says what was added and updated. Cost if wrong: none.
- **Ruling: the landscape board preview shows on the common chores step and on Done,** not on every step; the shared-screen question starts at Yes unless the account is a parent's own login; "Not now" turns chores off again if an earlier choice turned them on; after a restore, the people step still shows (the restored people) and the chores question doesn't. Cost if wrong: none.
- **Ruling: the evening check's banner and pulse shipped in milestone 5;** milestone 6 adds its time on Reminders and the phone reminder, and no Hide (the spec has none). Cost if wrong: none.
- **Ruling: Needs a look lists a chore no one is assigned to (opens its editor), chores data that needs a look (opens Import and export, which now offers Start over), a phone Home Assistant no longer has (opens that person), and Automatic by the sun without the Sun integration (opens Appearance).** A link to a removed Home Assistant person isn't listed: milestone 2 clears it (`clear_missing_persons`), nothing records that, and the person keeps working. Cost if wrong: a parent doesn't learn that a link was cleared.
- **Ruling: the Chores row's short setup is setup's own host limited to the chores steps,** ending on the shared screen with Open the board (never the Done step, whose commit saves the starting display options); it asks its first question afresh, leaves the setup bookmark alone, and its first step's Back runs that step's Not now (turning chores off again) and returns to Settings. Cost if wrong: none.
- **Ruling: Edit from the board asks "Who's changing <chore>?" for a parent's PIN,** like the other parent options, then opens Settings at that chore's editor. Cost if wrong: none.
- **Ruling: the card picker writes `planavista-card` from 1.3.0,** because 1.2.0, the release a household steps back to, knows it; its description now names chores, and the README's tagline says calendar and chore board. Cost if wrong: a household stepping back two releases (to 1.1.0) re-adds the card.
- **Ruling: the shared-screen step asks for a parent's PIN before marking the screen,** rather than deferring the marking to Done, consistent with Settings' "keep changing settings" PIN; setup asks again only where a PIN can be entered. Cost if wrong: one more PIN entry during setup.

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/chores-m6-settings` (main is at `f6f354e`, milestone 5 merged).
- [ ] **Step 2: Baseline.** `bash scripts/test-backend.sh -q` Expected: `966 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `588 passed`.
- [ ] **Step 3: Commit this plan.** `git add docs/superpowers/plans/2026-10-11-chores-m6-settings.md && git commit` with the message `docs: plan milestone 6, chores settings and setup` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m6-settings`.

---

### Task 1: A person's chores details and their stars history

Spec 7.2 (a member's goal, bedtimes, sleep, phones, and what their phones get), 8.15 (a goal), 9.9 and 10.5 (phones for reminders and requests), and 14.2 (the person page's Stars rows: recent stars with what earned them).

**Files:**
- Modify: `custom_components/planavista/household/members.py`, `custom_components/planavista/household/websocket.py`, `custom_components/planavista/chores/engine.py`, `custom_components/planavista/chores/websocket.py`
- Test: `tests/test_chores_people.py`

**Interfaces:**
- Produces: members `EDITABLE_FIELDS` gains `goal`, `bedtime`, `sleep_hours`, `phones`, `notify`; `add_member(members, changes, member_id=None)` keeps a free precomputed id; errors `invalid_bedtime`, `invalid_sleep`, `invalid_phones`, `invalid_notify`; engine `star_history(member_id, limit=30)` returns `{at, delta, reason, name, by}` newest first; WebSocket `planavista/stars/history` `{member}` (member level).

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_people.py` (new):

```python
"""A person's chores details (spec 14.2): goal, bedtimes, sleep, phones, what phones get, and stars history."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.household.members import MemberError, add_member, update_member

from .chores_sample import SCENE, at, sample_engine
from .conftest import ws_client_for, ws_command


def _casey(**changes: Any) -> dict[str, Any]:
    members, _ = add_member([], {"name": "Casey", "age_group": "teen"})
    return update_member(members, "casey", changes, None)[1]


def test_bedtimes_are_weeknights_and_weekends_and_weekends_default_to_weeknights() -> None:
    assert _casey(bedtime={"weeknight": "22:00", "weekend": "23:30"})["bedtime"] == {"weeknight": "22:00", "weekend": "23:30"}
    assert _casey(bedtime={"weeknight": "21:00"})["bedtime"] == {"weeknight": "21:00", "weekend": "21:00"}
    assert _casey(bedtime=None)["bedtime"] is None
    for bad in ({"weeknight": "25:00"}, {"weeknight": "9pm"}, "22:00", {"weekend": "22:00"}):
        with pytest.raises(MemberError) as err:
            _casey(bedtime=bad)
        assert err.value.args[0] == "invalid_bedtime"


def test_sleep_is_hours_to_the_quarter_hour_between_1_and_16() -> None:
    assert _casey(sleep_hours=9)["sleep_hours"] == 9.0
    assert _casey(sleep_hours=7.6)["sleep_hours"] == 7.5
    assert _casey(sleep_hours=None)["sleep_hours"] is None
    for bad in (0.5, 17, True, "9"):
        with pytest.raises(MemberError) as err:
            _casey(sleep_hours=bad)
        assert err.value.args[0] == "invalid_sleep"


def test_phones_are_notify_services_up_to_five() -> None:
    assert _casey(phones=["notify.mobile_app_caseys_phone"])["phones"] == ["notify.mobile_app_caseys_phone"]
    assert _casey(phones=None)["phones"] == []
    six = [f"notify.mobile_app_phone_{n}" for n in range(6)]
    for bad in (["mobile_app_caseys_phone"], ["notify.Casey Phone"], ["notify.a", "notify.a"], six, "notify.a"):
        with pytest.raises(MemberError) as err:
            _casey(phones=bad)
        assert err.value.args[0] == "invalid_phones"


def test_what_phones_get_starts_with_requests_on_and_reminders_off() -> None:
    assert _casey(notify=None)["notify"] == {"requests": True, "reminders": False}
    assert _casey(notify={"reminders": True})["notify"] == {"requests": True, "reminders": True}
    assert _casey(notify={"reminders": True, "colour": "red"})["notify"] == {"requests": True, "reminders": True}
    with pytest.raises(MemberError) as err:
        _casey(notify={"requests": "yes"})
    assert err.value.args[0] == "invalid_notify"


def test_a_parent_sets_someones_goal_on_their_page() -> None:
    assert _casey(goal="movie_night_pick")["goal"] == "movie_night_pick"
    assert _casey(goal=None)["goal"] is None
    with pytest.raises(MemberError) as err:
        _casey(goal="")
    assert err.value.args[0] == "invalid_goal"


def test_fields_this_page_leaves_alone_are_kept() -> None:
    members, _ = add_member([], {"name": "Casey", "age_group": "teen", "phones": ["notify.mobile_app_caseys_phone"]})
    members[0]["planner"] = {"kept": True}
    _, casey = update_member(members, "casey", {"sleep_hours": 9}, None)
    assert casey["phones"] == ["notify.mobile_app_caseys_phone"]
    assert casey["planner"] == {"kept": True}


def test_stars_history_names_what_each_change_was_for() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 7), key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet")
    engine.complete(at(10, 13, 8), key="take_out_the_trash|casey|week:2026-10-12|0", by="casey", source="tablet")
    engine.undo(at(10, 13, 9), key="take_out_the_trash|casey|week:2026-10-12|0", by="casey", source="tablet")
    engine.award_stars(at(10, 13, 10), member="casey", stars=5, reason="Helped a neighbor", by="blair")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎮", "cost": 3, "needs_ok": False})
    engine.redeem(at(10, 13, 11), member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    history = engine.star_history("casey")
    assert [(h["reason"], h["delta"], h["name"]) for h in history] == [
        ("redeemed", -3, "Pick the weekend game"),
        ("Helped a neighbor", 5, None),
        ("undo", -1, "Take out the trash"),
        ("chore", 1, "Take out the trash"),
        ("chore", 1, "Cat care"),
    ]
    assert history[1]["by"] == "blair"
    assert engine.star_history("casey", limit=2) == history[:2]
    assert engine.star_history("dana") == []
    with pytest.raises(ChoreError) as err:
        engine.star_history("jordan")
    assert err.value.code == "unknown_member"


async def test_a_parent_saves_someones_chores_details(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    reply = await ws_command(alex, {
        "type": "planavista/household/member/save", "member_id": "casey",
        "member": {
            "goal": "movie_night_pick", "bedtime": {"weeknight": "22:00", "weekend": "23:30"}, "sleep_hours": 9,
            "phones": ["notify.mobile_app_caseys_phone"], "notify": {"reminders": True},
        },
    })
    member = reply["result"]["member"]
    assert member["bedtime"] == {"weeknight": "22:00", "weekend": "23:30"}
    assert (member["sleep_hours"], member["goal"]) == (9.0, "movie_night_pick")
    assert member["phones"] == ["notify.mobile_app_caseys_phone"]
    assert member["notify"] == {"requests": True, "reminders": True}
    assert chores.household.member("casey")["sleep_hours"] == 9.0
    bad = await ws_command(alex, {"type": "planavista/household/member/save", "member_id": "casey",
                                  "member": {"sleep_hours": 30}})
    assert bad["error"] == {"code": "invalid_sleep", "message": "Pick between 1 and 16 hours of sleep."}


async def test_the_stars_history_command(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    chores.engine.award_stars(SCENE, member="casey", stars=4, reason="Extra help", by="alex")
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/stars/history", "member": "casey"})
    assert reply["result"]["balance"] == 4
    assert reply["result"]["history"] == [
        {"at": "2026-10-13T16:10:00-05:00", "delta": 4, "reason": "Extra help", "name": None, "by": "alex"},
    ]
    unknown = await ws_command(client, {"type": "planavista/stars/history", "member": "jordan"})
    assert unknown["error"] == {"code": "unknown_member", "message": "That person isn't in the household."}
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_people.py -q` Expected: FAIL: the new member fields are refused, and `planavista/stars/history` is an unknown command.

- [ ] **Step 3: Accept the new member fields.**

`custom_components/planavista/household/members.py`:

```diff
diff --git a/custom_components/planavista/household/members.py b/custom_components/planavista/household/members.py
index 97e5ea9..87f3b77 100644
--- a/custom_components/planavista/household/members.py
+++ b/custom_components/planavista/household/members.py
@@ -38,6 +38,11 @@ EDITABLE_FIELDS = (
     "needs_ok_for",
     "stars",
     "away",
+    "goal",
+    "bedtime",
+    "sleep_hours",
+    "phones",
+    "notify",
 )
 
 # Records name who acted with a member id or one of these words (spec 7.6).
@@ -50,6 +55,13 @@ NAME_MAX_LENGTH = 40
 EMOJI_MAX_LENGTH = 16
 AWAY_NOTE_MAX_LENGTH = 60
 MAX_AWAY_RANGES = 50
+GOAL_MAX_LENGTH = 60
+MAX_PHONES = 5
+SLEEP_HOURS = (1.0, 16.0)
+# Phone requests go to parents; reminders are each person's choice (spec 7.2, 10.5).
+NOTIFY_DEFAULTS = {"requests": True, "reminders": False}
+_CLOCK = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")
+_NOTIFY_SERVICE = re.compile(r"notify\.[a-z0-9_]+")
 
 
 class MemberError(ValueError):
@@ -136,6 +148,60 @@ def _checked_away(away: object) -> list[dict[str, Any]]:
     return sorted(ranges, key=lambda span: span["from"])
 
 
+def _checked_goal(goal: object) -> str | None:
+    """The reward someone is saving up for (spec 8.15), by its id."""
+    if goal is not None and (not isinstance(goal, str) or not 0 < len(goal) <= GOAL_MAX_LENGTH):
+        raise MemberError("invalid_goal")
+    return goal
+
+
+def _checked_bedtime(bedtime: object) -> dict[str, str] | None:
+    """Bedtimes on weeknights and on Friday and Saturday nights (spec 7.2), as HH:MM."""
+    if bedtime is None:
+        return None
+    if not isinstance(bedtime, Mapping):
+        raise MemberError("invalid_bedtime")
+    weeknight = bedtime.get("weeknight")
+    weekend = bedtime.get("weekend", weeknight)
+    for value in (weeknight, weekend):
+        if not isinstance(value, str) or not _CLOCK.fullmatch(value):
+            raise MemberError("invalid_bedtime")
+    return {"weeknight": weeknight, "weekend": weekend}
+
+
+def _checked_sleep(hours: object) -> float | None:
+    """Hours of sleep a night, to the quarter hour."""
+    if hours is None:
+        return None
+    low, high = SLEEP_HOURS
+    if isinstance(hours, bool) or not isinstance(hours, (int, float)) or not low <= hours <= high:
+        raise MemberError("invalid_sleep")
+    return round(float(hours) * 4) / 4
+
+
+def _checked_phones(phones: object) -> list[str]:
+    """The notify services of someone's phones, such as notify.mobile_app_caseys_phone (spec 10.5)."""
+    if phones is None:
+        return []
+    if not isinstance(phones, list) or len(phones) > MAX_PHONES or len(set(phones)) != len(phones):
+        raise MemberError("invalid_phones")
+    if any(not isinstance(p, str) or not _NOTIFY_SERVICE.fullmatch(p) for p in phones):
+        raise MemberError("invalid_phones")
+    return list(phones)
+
+
+def _checked_notify(notify: object) -> dict[str, bool]:
+    """What someone's phones get: Waiting for OK requests (parents) and reminders."""
+    if notify is None:
+        return dict(NOTIFY_DEFAULTS)
+    if not isinstance(notify, Mapping):
+        raise MemberError("invalid_notify")
+    checked = {**NOTIFY_DEFAULTS, **{k: v for k, v in notify.items() if k in NOTIFY_DEFAULTS}}
+    if any(not isinstance(v, bool) for v in checked.values()):
+        raise MemberError("invalid_notify")
+    return checked
+
+
 def build_member(
     existing: Mapping[str, Any] | None,
     changes: Mapping[str, Any],
@@ -200,6 +266,16 @@ def build_member(
     member["picture"] = _checked_picture(member.get("picture"), person)
     if "away" in member:
         member["away"] = _checked_away(member["away"])
+    # Checked when changed; a stored value is kept as it is (spec 7.8).
+    for key, check in (
+        ("goal", _checked_goal),
+        ("bedtime", _checked_bedtime),
+        ("sleep_hours", _checked_sleep),
+        ("phones", _checked_phones),
+        ("notify", _checked_notify),
+    ):
+        if key in changes:
+            member[key] = check(changes[key])
     return member
 
 
@@ -244,9 +320,6 @@ def update_member(
     return updated, member
 
 
-GOAL_MAX_LENGTH = 60
-
-
 def set_prefs(
     members: list[dict[str, Any]], member_id: str, changes: Mapping[str, Any]
 ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
@@ -260,10 +333,7 @@ def set_prefs(
             raise MemberError("invalid_my_day")
         member["my_day"] = changes["my_day"]
     if "goal" in changes:
-        goal = changes["goal"]
-        if goal is not None and (not isinstance(goal, str) or not 0 < len(goal) <= GOAL_MAX_LENGTH):
-            raise MemberError("invalid_goal")
-        member["goal"] = goal
+        member["goal"] = _checked_goal(changes["goal"])
     member["rev"] = int(member.get("rev", 1)) + 1
     updated = list(members)
     updated[index] = member
```

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 002b1fd..76fe34f 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -69,6 +69,10 @@ ERROR_MESSAGES = {
     "needs_parent_pin": "Set a PIN for a parent first, so someone can open Settings here.",
     "invalid_away": "Pick the first and last days away.",
     "invalid_goal": "Pick a reward to save up for.",
+    "invalid_bedtime": "Pick a bedtime, such as 9:00 PM.",
+    "invalid_sleep": "Pick between 1 and 16 hours of sleep.",
+    "invalid_phones": "Pick up to 5 phones from Home Assistant.",
+    "invalid_notify": "Requests and reminders are on or off.",
 }
 
 MEMBER_FIELDS = vol.Schema(
@@ -83,6 +87,11 @@ MEMBER_FIELDS = vol.Schema(
         vol.Optional("needs_ok_for"): str,
         vol.Optional("stars"): bool,
         vol.Optional("away"): vol.Any(None, [dict]),
+        vol.Optional("goal"): vol.Any(None, str),
+        vol.Optional("bedtime"): vol.Any(None, dict),
+        vol.Optional("sleep_hours"): vol.Any(None, vol.Coerce(float)),
+        vol.Optional("phones"): [str],
+        vol.Optional("notify"): dict,
     }
 )
 
```

- [ ] **Step 4: Add the stars history.**

`custom_components/planavista/chores/engine.py`:

```diff
diff --git a/custom_components/planavista/chores/engine.py b/custom_components/planavista/chores/engine.py
index d4de9f3..7082f18 100644
--- a/custom_components/planavista/chores/engine.py
+++ b/custom_components/planavista/chores/engine.py
@@ -612,6 +612,32 @@ class ChoresEngine:
         """A member's stars (spec 7.5: the ledger is append-only)."""
         return sum(int(e["delta"]) for e in self.rewards["ledger"] if e.get("member") == member_id)
 
+    def star_history(self, member_id: str, limit: int = 30) -> list[dict[str, Any]]:
+        """A member's latest stars, newest first: chores (by name), undos, rewards, and a parent's give or take."""
+        if self.member(member_id) is None:
+            raise ChoreError("unknown_member")
+        completions = {c["id"]: c for c in self.log["completions"]}
+        redemptions = {r["id"]: r for r in self.rewards["redemptions"]}
+        found: list[dict[str, Any]] = []
+        for entry in reversed(self.rewards["ledger"]):
+            if entry["member"] != member_id:
+                continue
+            reason, name = entry["reason"], None
+            if reason in ("chore", "undo"):
+                completion = completions.get(entry.get("ref"))
+                activity = self.activity(completion["chore"]) if completion else None
+                name = activity["name"] if activity else None
+            elif reason == "redeemed":
+                redemption = redemptions.get(entry.get("ref"))
+                reward = self.reward(redemption["reward"]) if redemption else None
+                name = reward["name"] if reward else None
+            found.append({
+                "at": entry["at"], "delta": entry["delta"], "reason": reason, "name": name, "by": entry.get("by"),
+            })
+            if len(found) >= limit:
+                break
+        return found
+
     def chore_minutes(self, member_id: str) -> float:
         """Every minute ever credited to a member as the doer (sensor.<member>_chore_time)."""
         return round(float((self.log.get("totals") or {}).get(member_id, 0)), 2)
```

`custom_components/planavista/chores/websocket.py`:

```diff
diff --git a/custom_components/planavista/chores/websocket.py b/custom_components/planavista/chores/websocket.py
index 9d2caee..c9eec4b 100644
--- a/custom_components/planavista/chores/websocket.py
+++ b/custom_components/planavista/chores/websocket.py
@@ -457,6 +457,21 @@ async def ws_stars_award(hass: HomeAssistant, connection: websocket_api.ActiveCo
         connection.send_result(msg["id"], out.data)
 
 
+@websocket_api.websocket_command({vol.Required("type"): "planavista/stars/history", vol.Required("member"): str})
+@callback
+def ws_stars_history(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """A member's latest stars, newest first (a person's page: Stars)."""
+    runtime = _runtime(hass, connection, msg)
+    if runtime is None:
+        return
+    try:
+        history = runtime.engine.star_history(msg["member"])
+    except ChoreError as err:
+        connection.send_error(msg["id"], err.code, message(err))
+        return
+    connection.send_result(msg["id"], {"balance": runtime.engine.balance(msg["member"]), "history": history})
+
+
 CHORES_COMMANDS = (
     ws_chores_subscribe,
     ws_chores_week,
@@ -477,6 +492,7 @@ CHORES_COMMANDS = (
     ws_reward_delete,
     ws_reward_redeem,
     ws_stars_award,
+    ws_stars_history,
 )
 
 
```

- [ ] **Step 5: Run them again.** Same command. Expected: `9 passed`.
- [ ] **Step 6: Run the whole backend suite.** `bash scripts/test-backend.sh -q` Expected: `975 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): a person's chores details and their stars history` with the trailers.

---

### Task 2: Read a plan or a PlanaVista file, and write one

Spec 7.9 (importing a plan: what matches, what's kept, nothing deleted), 14.6 (the review: people, Needs a look, On the board, Plan only, Set times), 15.5 (unknown files, newer versions, and problems by item), and 10.4 (the PlanaVista file). Pure: no Home Assistant imports.

**Files:**
- Create: `custom_components/planavista/chores/importer.py`, `docs/schemas/planavista.household.v1.json`
- Test: `tests/fixtures/household_hours_sample.json` (an invented sample plan), `tests/test_chores_importer.py`

**Interfaces:**
- Consumes: Task 1's member fields.
- Produces: `FORMAT_PLAN`, `FORMAT_HOUSEHOLD`, `FORMAT_LABELS`, `ImportProblem(code, message, problems)`, the messages `UNKNOWN_FILE`, `NEWER_PLAN`, `NEWER_HOUSEHOLD`, `INVALID_FILE`; `read_file(text) -> dict` (the parsed file, `format` first); `preview(parsed, members, activities, rewards) -> dict` (`file`, `people`, `activities`, `rewards`, `settings`, `needs_a_look`); `plan_import(parsed, choices, members, activities, rewards, settings, *, persons, calendars) -> dict` (`members_add`, `members_update`, `calendars`, `activities_add`, `activities_update` with `{changes, extra}`, `rewards_add`, `rewards_update`, `settings`, `summary`); `export_household(members, calendars, plan, rewards, *, version, exported) -> dict`.

- [ ] **Step 1: Write the sample plan and the failing tests.**

`tests/fixtures/household_hours_sample.json` (new):

```json
{
  "schema": "household-hours/v1",
  "exported": "2026-10-03",
  "source": "Household Hours planner",
  "people": [
    {"id": "p_alex", "name": "Alex", "color": "#277DA1", "bedWk": "23:00", "bedWe": "23:30"},
    {"id": "p_blair", "name": "Blair", "color": "#F3722C", "bedWk": "22:30", "bedWe": "23:30"},
    {"id": "p_casey", "name": "Casey", "color": "#43AA8B", "bedWk": "22:00", "bedWe": "23:00"},
    {"id": "p_dana", "name": "Dana", "color": "#F94144", "bedWk": "19:30", "bedWe": "20:00"}
  ],
  "activities": [
    {"id": "a01", "name": "Sleep", "category": "personal", "minHours": 35, "per": "day", "timePer": "activity",
     "alloc": {"p_alex": 7.5, "p_blair": 8, "p_casey": 9, "p_dana": 10.5}, "days": [], "tod": [], "fixedStart": "",
     "type": "need", "locked": true, "isSleep": true, "agreed": true},
    {"id": "a02", "name": "Kitchen cleanup", "category": "kitchen", "minHours": 0.5, "per": "day", "timePer": "person",
     "alloc": {"p_alex": 0.5}, "days": [], "tod": ["evening"], "fixedStart": "", "type": "need", "locked": true,
     "isSleep": false, "agreed": true},
    {"id": "a03", "name": "Unload the dishwasher", "category": "kitchen", "minHours": 0.25, "per": "day", "timePer": "person",
     "alloc": {"p_casey": 0.25}, "days": [], "tod": ["morning"], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a04", "name": "Set the table", "category": "kitchen", "minHours": 0.25, "per": "day", "timePer": "person",
     "alloc": {"p_dana": 0.25}, "days": [], "tod": ["evening"], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a05", "name": "Cook dinner", "category": "kitchen", "minHours": 1, "per": "day", "timePer": "activity",
     "alloc": {"p_alex": 0.5, "p_blair": 0.5}, "days": [], "tod": ["evening"], "fixedStart": "", "type": "need",
     "locked": true, "isSleep": false, "agreed": true},
    {"id": "a06", "name": "Laundry", "category": "cleaning", "minHours": 2, "per": "week", "timePer": "activity",
     "alloc": {"p_blair": 2}, "days": [1, 4], "tod": [], "fixedStart": "", "type": "need", "locked": true,
     "isSleep": false, "agreed": true},
    {"id": "a07", "name": "Clean the bathroom", "category": "cleaning", "minHours": 2, "per": "week", "timePer": "activity",
     "alloc": {"p_blair": 1, "p_casey": 1}, "days": [], "tod": [], "fixedStart": "", "type": "need", "locked": true,
     "isSleep": false, "agreed": true},
    {"id": "a08", "name": "Vacuum", "category": "cleaning", "minHours": 1, "per": "week", "timePer": "activity",
     "alloc": {"p_blair": 1}, "days": [], "tod": [], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a09", "name": "Mop the floors", "category": "cleaning", "minHours": 0.75, "per": "week", "timePer": "activity",
     "alloc": {"p_casey": 0.75}, "days": [], "tod": [], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a10", "name": "Tidy toys", "category": "cleaning", "minHours": 0.25, "per": "day", "timePer": "person",
     "alloc": {"p_dana": 0.25}, "days": [], "tod": ["evening"], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a11", "name": "Take out the trash", "category": "home", "minHours": 0.5, "per": "week", "timePer": "activity",
     "alloc": {"p_casey": 0.5}, "days": [2, 5], "tod": ["evening"], "fixedStart": "", "type": "need", "locked": true,
     "isSleep": false, "agreed": true},
    {"id": "a12", "name": "Cat care", "category": "home", "minHours": 0.5, "per": "day", "timePer": "person",
     "alloc": {"p_casey": 0.5}, "days": [], "tod": ["morning", "evening"], "fixedStart": "", "type": "need",
     "locked": true, "isSleep": false, "agreed": true},
    {"id": "a13", "name": "Yard work", "category": "home", "minHours": 1.5, "per": "week", "timePer": "activity",
     "alloc": {"p_casey": 1.5}, "days": [], "tod": [], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a14", "name": "Groceries", "category": "home", "minHours": 1.5, "per": "week", "timePer": "activity",
     "alloc": {"p_alex": 1.5}, "days": [6], "tod": [], "fixedStart": "", "type": "need", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a15", "name": "Wash the car", "category": "home", "minHours": 1, "per": "week", "timePer": "activity",
     "alloc": {}, "days": [], "tod": [], "fixedStart": "", "type": "want", "locked": false, "isSleep": false,
     "agreed": true},
    {"id": "a16", "name": "Water the plants", "category": "home", "minHours": 0.5, "per": "week", "timePer": "activity",
     "alloc": {"p_blair": 0.25, "p_casey": 0.5}, "days": [], "tod": [], "fixedStart": "", "type": "need",
     "locked": false, "isSleep": false, "agreed": true},
    {"id": "a17", "name": "Homework", "category": "work", "minHours": 1, "per": "day", "timePer": "person",
     "alloc": {"p_casey": 1}, "days": [1, 2, 3, 4, 5], "tod": ["afternoon"], "fixedStart": "", "type": "need",
     "locked": true, "isSleep": false, "agreed": true},
    {"id": "a18", "name": "Reading", "category": "personal", "minHours": 0.5, "per": "day", "timePer": "person",
     "alloc": {"p_dana": 0.5}, "days": [], "tod": ["evening"], "fixedStart": "", "type": "want", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a19", "name": "Exercise", "category": "personal", "minHours": 3, "per": "week", "timePer": "person",
     "alloc": {"p_alex": 3, "p_blair": 3}, "days": [], "tod": [], "fixedStart": "", "type": "want", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a20", "name": "Family dinner", "category": "family", "minHours": 1, "per": "day", "timePer": "person",
     "alloc": {"p_alex": 1, "p_blair": 1, "p_casey": 1, "p_dana": 1}, "days": [], "tod": ["evening"], "fixedStart": "",
     "type": "need", "locked": true, "isSleep": false, "agreed": true},
    {"id": "a21", "name": "Work", "category": "work", "minHours": 40, "per": "week", "timePer": "person",
     "alloc": {"p_alex": 40, "p_blair": 40}, "days": [1, 2, 3, 4, 5], "tod": [], "fixedStart": "", "type": "need",
     "locked": true, "isSleep": false, "agreed": true},
    {"id": "a22", "name": "Organize the closet", "category": "", "minHours": 1, "per": "week", "timePer": "activity",
     "alloc": {"p_alex": 1}, "days": [], "tod": [], "fixedStart": "", "type": "want", "locked": false,
     "isSleep": false, "agreed": true},
    {"id": "a23", "name": "Soccer practice", "category": "family", "minHours": 3, "per": "week", "timePer": "person",
     "alloc": {"p_casey": 3}, "days": [2, 4], "tod": [], "fixedStart": "17:30", "type": "need", "locked": true,
     "isSleep": false, "agreed": true},
    {"id": "a24", "name": "Piano lesson", "category": "personal", "minHours": 0.5, "per": "week", "timePer": "person",
     "alloc": {"p_dana": 0.5}, "days": [3], "tod": [], "fixedStart": "16:00", "type": "need", "locked": true,
     "isSleep": false, "agreed": true}
  ]
}
```

`tests/test_chores_importer.py` (new):

```python
"""Importing a Household Hours plan, and exporting and restoring a PlanaVista household (spec 7.9, 14.6, 15.5)."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from custom_components.planavista.chores.importer import (
    FORMAT_HOUSEHOLD,
    FORMAT_PLAN,
    ImportProblem,
    export_household,
    plan_import,
    preview,
    read_file,
)
from custom_components.planavista.household.members import add_member

from .chores_sample import MEMBERS, built, sample_activities

PLAN_TEXT = (Path(__file__).parent / "fixtures" / "household_hours_sample.json").read_text("utf-8")
SCHEMA = json.loads((Path(__file__).parent.parent / "docs" / "schemas" / "planavista.household.v1.json").read_text("utf-8"))


def _household(*names: str) -> list[dict[str, Any]]:
    members: list[dict[str, Any]] = []
    roles = {"Alex": {"parent": True}, "Blair": {"parent": True}, "Casey": {"age_group": "teen"},
             "Dana": {"age_group": "young_child"}}
    for name in names:
        members, _ = add_member(members, {"name": name, **roles[name]})
    return members


def _problem(text: str) -> ImportProblem:
    with pytest.raises(ImportProblem) as err:
        read_file(text)
    return err.value


# Reading a file ---------------------------------------------------------------------------------


@pytest.mark.parametrize("text", ["", "plan.txt", "[1, 2]", '{"schema": "something-else/v1"}', '{"schema": "household-hours/v0"}'])
def test_a_file_that_isnt_a_plan_says_so(text: str) -> None:
    problem = _problem(text)
    assert problem.code == "unknown_file"
    assert problem.message == "This doesn't look like a Household Hours or PlanaVista file."


def test_a_plan_from_a_newer_planner_says_what_to_do() -> None:
    assert _problem('{"schema": "household-hours/v2"}').message == (
        "This plan was made with a newer Household Hours (version 2). Export it as version 1, or update PlanaVista."
    )
    assert _problem('{"format": "planavista.household/v3"}').message == (
        "This file was made with a newer PlanaVista (file version 3). Update PlanaVista to read it."
    )


def test_problems_are_listed_by_item_and_nothing_is_read() -> None:
    text = json.dumps({"schema": FORMAT_PLAN, "people": [{"id": "x"}], "activities": [
        {"id": "a1", "name": "", "minHours": 1},
        {"id": "a2", "name": "Vacuum", "minHours": 0},
        {"id": "a3", "name": "Dishes", "minHours": 30, "per": "day"},
    ]})
    problem = _problem(text)
    assert problem.code == "invalid_file"
    assert problem.problems == [
        {"item": "Person 1", "code": "name_required"},
        {"item": "Activity 1", "code": "name_required"},
        {"item": "Vacuum", "code": "invalid_hours"},
        {"item": "Dishes", "code": "invalid_hours"},
    ]


def test_a_plan_brings_bedtimes_and_sleep_and_keeps_sleep_off_the_list() -> None:
    parsed = read_file(PLAN_TEXT)
    assert (parsed["format"], parsed["exported"], parsed["source"]) == (FORMAT_PLAN, "2026-10-03", "Household Hours planner")
    people = {p["name"]: p for p in parsed["people"]}
    assert people["Dana"]["bedtime"] == {"weeknight": "19:30", "weekend": "20:00"}
    assert {name: p["sleep_hours"] for name, p in people.items()} == {"Alex": 7.5, "Blair": 8.0, "Casey": 9.0, "Dana": 10.5}
    assert people["Casey"]["color"] == "#43AA8B"
    assert "Sleep" not in {a["record"]["name"] for a in parsed["activities"]}
    assert len(parsed["activities"]) == 23


def test_each_activity_becomes_a_plan_chore() -> None:
    records = {a["record"]["name"]: a["record"] for a in read_file(PLAN_TEXT)["activities"]}
    laundry = records["Laundry"]
    assert (laundry["assignees"], laundry["split"], laundry["minimum"]) == (["p_blair"], "each", {"hours": 2.0, "per": "week"})
    assert laundry["days"] == ["mon", "thu"]  # the planner counts days from Sunday
    assert (laundry["type"], laundry["locked"], laundry["agreed"]) == ("need", True, True)
    assert laundry["import_ref"] == {"format": FORMAT_PLAN, "id": "a06"}
    bathroom = records["Clean the bathroom"]
    assert (bathroom["split"], bathroom["shares"], bathroom["minimum"]["hours"]) == ("shared", {"p_blair": 1.0, "p_casey": 1.0}, 2.0)
    family_dinner = records["Family dinner"]
    assert (family_dinner["split"], len(family_dinner["assignees"])) == ("each", 4)
    assert records["Take out the trash"]["days"] == ["tue", "fri"]
    assert records["Cat care"]["times"] == 2  # morning and evening are a check-off each
    assert records["Wash the car"]["assignees"] == []


def test_categories_decide_whats_on_the_board_and_set_times_are_plan_only() -> None:
    records = {a["record"]["name"]: a["record"] for a in read_file(PLAN_TEXT)["activities"]}
    assert records["Vacuum"]["on_board"] is True
    assert records["Homework"]["on_board"] is False
    assert (records["Organize the closet"]["category"], records["Organize the closet"]["on_board"]) == ("other", False)
    soccer = records["Soccer practice"]
    assert (soccer["set_time"], soccer["on_board"], soccer["days"]) == ("17:30", False, ["tue", "thu"])


def test_shares_that_dont_add_up_are_what_people_owe() -> None:
    entry = next(a for a in read_file(PLAN_TEXT)["activities"] if a["ref"] == "a16")
    assert entry["record"]["minimum"] == {"hours": 0.75, "per": "week"}
    assert entry["planned_hours"] == 0.5


# The preview ------------------------------------------------------------------------------------


def _sample_preview(members: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    members = members if members is not None else _household("Alex", "Blair", "Casey")
    activities = [built(a) for a in sample_activities()]
    return preview(read_file(PLAN_TEXT), members, activities, [])


def test_the_preview_matches_people_by_name_and_finds_new_ones() -> None:
    people = {p["name"]: p for p in _sample_preview()["people"]}
    assert (people["Alex"]["match"], people["Alex"]["match_name"]) == ("alex", "Alex")
    assert people["Dana"]["match"] is None
    assert people["Dana"]["sleep_hours"] == 10.5


def test_the_preview_sorts_activities_and_says_what_needs_a_look() -> None:
    result = _sample_preview()
    assert result["file"] == {
        "format": FORMAT_PLAN, "label": "Household Hours plan, version 1", "exported": "2026-10-03",
        "source": "Household Hours planner",
    }
    kinds: dict[str, list[str]] = {}
    for item in result["activities"]:
        kinds.setdefault(item["kind"], []).append(item["name"])
    assert kinds["set_time"] == ["Soccer practice", "Piano lesson"]
    assert "Homework" in kinds["plan_only"] and "Vacuum" in kinds["board"]
    updates = next(look for look in result["needs_a_look"] if look["kind"] == "updates")
    assert updates["names"] == [
        "Kitchen cleanup", "Set the table", "Laundry", "Clean the bathroom", "Tidy toys", "Take out the trash",
        "Cat care", "Yard work", "Groceries",
    ]
    assert {"kind": "unassigned", "ref": "a15", "name": "Wash the car"} in result["needs_a_look"]
    shares = next(look for look in result["needs_a_look"] if look["kind"] == "shares")
    assert (shares["name"], shares["hours"], shares["planned"]) == ("Water the plants", 0.75, 0.5)
    laundry = next(i for i in result["activities"] if i["name"] == "Laundry")
    assert (laundry["match"], laundry["on_board"]) == ("laundry", True)


def test_a_chore_already_on_the_board_keeps_its_switch() -> None:
    activities = [built(a) for a in sample_activities()]
    for activity in activities:
        if activity["id"] == "yard_work":
            activity["on_board"] = False
    result = preview(read_file(PLAN_TEXT), _household("Alex", "Blair", "Casey", "Dana"), activities, [])
    yard = next(i for i in result["activities"] if i["name"] == "Yard work")
    assert (yard["kind"], yard["on_board"]) == ("plan_only", False)


# What an import saves ---------------------------------------------------------------------------


def _plan(choices: dict[str, Any] | None = None, members: list[dict[str, Any]] | None = None,
          activities: list[dict[str, Any]] | None = None, text: str = PLAN_TEXT) -> dict[str, Any]:
    members = members if members is not None else _household("Alex", "Blair", "Casey")
    return plan_import(
        read_file(text), choices if choices is not None else {"people": {"p_dana": {"age_group": "young_child"}}},
        members, activities if activities is not None else [], [], {},
    )


def test_a_new_person_needs_an_age_group_before_anything_is_saved() -> None:
    with pytest.raises(ImportProblem) as err:
        _plan({})
    assert err.value.problems == [{"item": "Dana", "code": "age_group_required"}]


def test_an_import_adds_people_and_updates_bedtimes_and_sleep() -> None:
    result = _plan()
    (dana,) = result["members_add"]
    assert (dana["id"], dana["age_group"], dana["parent"], dana["color"]) == ("dana", "young_child", False, "#F94144")
    assert (dana["bedtime"], dana["sleep_hours"], dana["my_day"]) == ({"weeknight": "19:30", "weekend": "20:00"}, 10.5, "pictures")
    assert result["members_update"]["casey"] == {"bedtime": {"weeknight": "22:00", "weekend": "23:00"}, "sleep_hours": 9.0}
    assert result["summary"]["people_added"] == ["Dana"]


def test_chores_name_people_by_their_ids_and_keep_the_planners_fields() -> None:
    result = _plan()
    added = {a["name"]: a for a in result["activities_add"]}
    assert len(added) == 23 and result["activities_update"] == {}
    bathroom = added["Clean the bathroom"]
    assert (bathroom["id"], bathroom["assignees"], bathroom["shares"]) == (
        "clean_the_bathroom", ["blair", "casey"], {"blair": 1.0, "casey": 1.0},
    )
    assert added["Set the table"]["assignees"] == ["dana"]
    assert (added["Laundry"]["locked"], added["Laundry"]["import_ref"]) == (True, {"format": FORMAT_PLAN, "id": "a06"})
    assert added["Wash the car"]["assignees"] == []


def test_the_parents_switches_and_picks_decide() -> None:
    result = _plan({
        "people": {"p_dana": {"age_group": "young_child"}},
        "on_board": {"a17": True, "a08": False},
        "assignees": {"a15": ["p_casey", "p_alex"]},
    })
    added = {a["name"]: a for a in result["activities_add"]}
    assert (added["Homework"]["on_board"], added["Vacuum"]["on_board"]) == (True, False)
    assert added["Wash the car"]["assignees"] == ["casey", "alex"]


def test_rematching_someone_the_plan_calls_by_another_name() -> None:
    text = PLAN_TEXT.replace('"name": "Casey"', '"name": "Cassie"')
    assert preview(read_file(text), _household("Alex", "Blair", "Casey"), [], [])["people"][2]["match"] is None
    result = _plan({"people": {"p_casey": {"match": "casey"}, "p_dana": {"age_group": "young_child"}}}, text=text)
    assert [m["name"] for m in result["members_add"]] == ["Dana"]
    assert result["members_update"]["casey"]["sleep_hours"] == 9.0
    with pytest.raises(ImportProblem) as err:
        _plan({"people": {"p_dana": {"match": "alex"}}})
    assert err.value.problems == [{"item": "Dana", "code": "matched_twice", "other": "Alex"}]


def test_importing_again_updates_instead_of_duplicating() -> None:
    first = _plan(members=_household("Alex", "Blair", "Casey", "Dana"))
    again = _plan(members=_household("Alex", "Blair", "Casey", "Dana"), activities=first["activities_add"])
    assert again["activities_add"] == []
    assert len(again["activities_update"]) == 23
    laundry = again["activities_update"]["laundry"]
    assert laundry["changes"]["minimum"] == {"hours": 2.0, "per": "week"}
    assert laundry["extra"] == {"type": "need", "locked": True, "agreed": True, "import_ref": {"format": FORMAT_PLAN, "id": "a06"}}
    assert "icon" not in laundry["changes"] and "times" not in laundry["changes"]


def test_a_plan_matches_existing_chores_by_name_and_updates_only_the_plans_fields() -> None:
    activities = [built(a) for a in sample_activities()]
    result = _plan(members=_household("Alex", "Blair", "Casey", "Dana"), activities=activities)
    trash = result["activities_update"]["take_out_the_trash"]["changes"]
    assert trash["minimum"] == {"hours": 0.5, "per": "week"} and trash["schedule"] == "plan"
    assert "needs_ok" not in trash and "label" not in trash
    assert "rake_the_leaves" not in result["activities_update"]
    assert result["summary"]["activities_updated"] == 9


# Export and restore -----------------------------------------------------------------------------


def _export(members: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    members = [dict(m, rev=3) for m in (members or MEMBERS)]
    members[2].update(person="person.casey", phones=["notify.mobile_app_caseys_phone"], bedtime={"weeknight": "22:00", "weekend": "23:00"})
    activities = [dict(built(a), assigned_since={"casey": "2026-06-01T00:00:00-05:00"}) for a in sample_activities()]
    plan = {"settings": {"missed": "strict", "day_starts": "03:00", "auto_approve": "day_end", "minutes_per_star": 10,
                         "evening_check": "19:00", "sound": False}, "activities": activities}
    rewards = {"rewards": [{"id": "movie_night_pick", "name": "Movie night pick", "icon": "🎬", "cost": 40,
                            "needs_ok": True, "who": ["casey", "dana"]}],
               "ledger": [{"id": "x", "member": "casey", "delta": 4}], "redemptions": []}
    calendars = [{"entity_id": "calendar.casey", "member_id": "casey"}, {"entity_id": "calendar.family"}]
    return export_household(members, calendars, plan, rewards, version="1.3.0", exported="2026-10-13T16:10:00-05:00")


def test_an_export_has_people_chores_rewards_and_rules_and_nothing_private() -> None:
    exported = _export()
    assert (exported["format"], exported["source"]) == (FORMAT_HOUSEHOLD, "PlanaVista 1.3.0")
    casey = exported["members"][2]
    assert casey["links"] == {"person": "person.casey", "calendars": ["calendar.casey"], "phones": ["notify.mobile_app_caseys_phone"]}
    assert "rev" not in casey and "person" not in casey and "phones" not in casey
    assert all("rev" not in a and "assigned_since" not in a for a in exported["chores"]["activities"])
    assert exported["chores"]["settings"]["missed"] == "strict"
    assert exported["rewards"] == [{"id": "movie_night_pick", "name": "Movie night pick", "icon": "🎬", "cost": 40,
                                    "needs_ok": True, "who": ["casey", "dana"]}]
    text = json.dumps(exported)
    assert "ledger" not in text and "pin" not in text.lower()


def test_the_published_schema_names_every_exported_field() -> None:
    exported = _export()
    member_fields = set(SCHEMA["$defs"]["member"]["properties"])
    assert set(SCHEMA["properties"]) >= set(exported)
    for member in exported["members"]:
        assert set(member) <= member_fields
    assert set(SCHEMA["$defs"]["reward"]["properties"]) >= set(exported["rewards"][0])


def test_a_restore_brings_a_household_back_with_its_ids() -> None:
    parsed = read_file(json.dumps(_export()))
    look = preview(parsed, [], [], [])
    assert [p["match"] for p in look["people"]] == [None, None, None, None]
    assert look["settings"] is True
    result = plan_import(parsed, {}, [], [], [], {}, persons={"person.casey"}, calendars={"calendar.casey"})
    assert [m["id"] for m in result["members_add"]] == ["alex", "blair", "casey", "dana"]
    casey = result["members_add"][2]
    assert (casey["person"], casey["phones"], casey["age_group"]) == ("person.casey", ["notify.mobile_app_caseys_phone"], "teen")
    assert result["calendars"] == {"calendar.casey": "casey"}
    ids = [a["id"] for a in result["activities_add"]]
    assert "take_out_the_trash" in ids and "rake_the_leaves" in ids
    assert result["activities_add"][0]["created"]["at"] == "2026-06-01T19:05:00-05:00"
    assert result["rewards_add"][0]["id"] == "movie_night_pick"
    assert result["settings"]["missed"] == "strict"


def test_a_restore_onto_a_household_updates_what_is_there() -> None:
    parsed = read_file(json.dumps(_export()))
    members = [dict(m) for m in MEMBERS]
    for m, color in zip(members, ("#277DA1", "#F3722C", "#43AA8B", "#F94144")):
        m["color"] = color
    activities = [built(a) for a in sample_activities()]
    result = plan_import(parsed, {}, members, activities, [], {}, persons=set(), calendars=set())
    assert result["members_add"] == [] and set(result["members_update"]) == {"alex", "blair", "casey", "dana"}
    assert "person" not in result["members_update"]["casey"]  # a person Home Assistant doesn't have keeps the link there is
    assert result["activities_add"] == [] and len(result["activities_update"]) == 16
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_importer.py -q` Expected: FAIL, collection stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.importer'`.

- [ ] **Step 3: Write the importer and publish the file format.**

`custom_components/planavista/chores/importer.py` (new):

```python
"""Import a household plan; export and restore a PlanaVista household (spec 7.9, 14.6, 15.5).

Nothing here imports Home Assistant. `read_file` says what a file is and reads
it. `preview` works out where everything in it would go in the household as
it stands. `plan_import` turns that and the parent's choices into the records
to save, each one checked before anything is saved. `export_household` writes
the planavista.household/v1 file (docs/schemas/planavista.household.v1.json).

A Household Hours plan (household-hours/v1) brings people's bedtimes and sleep
and the plan's activities. A PlanaVista file (planavista.household/v1) brings
back a whole household: people, chores, rewards, and rules. Importing again
updates instead of duplicating, and nothing is ever deleted.
"""
from __future__ import annotations

from collections.abc import Collection, Iterable, Mapping
import json
import re
from typing import Any

from ..household.members import (
    AGE_GROUPS,
    EDITABLE_FIELDS,
    MemberError,
    PALETTE,
    build_member,
    make_id as make_member_id,
    ordered,
    palette_color,
)
from .model import ACTIVITY_FIELDS, CATEGORIES, ChoreError, build_activity, build_reward, build_settings, make_id
from .periods import BANDS, WEEKDAY_CODES

FORMAT_PLAN = "household-hours/v1"
FORMAT_HOUSEHOLD = "planavista.household/v1"
FORMAT_LABELS = {FORMAT_PLAN: "Household Hours plan, version 1", FORMAT_HOUSEHOLD: "PlanaVista file, version 1"}

UNKNOWN_FILE = "This doesn't look like a Household Hours or PlanaVista file."
NEWER_PLAN = "This plan was made with a newer Household Hours (version {version}). Export it as version 1, or update PlanaVista."
NEWER_HOUSEHOLD = "This file was made with a newer PlanaVista (file version {version}). Update PlanaVista to read it."
INVALID_FILE = "This file has problems, so nothing was imported."

# The planner counts days from Sunday.
PLAN_DAYS = ("sun", "mon", "tue", "wed", "thu", "fri", "sat")
# Chores by default (spec 7.9); personal, school, work, and family stay plan only, and sleep never shows.
BOARD_CATEGORIES = frozenset({"kitchen", "cleaning", "home"})
PLANNER_FIELDS = ("type", "locked", "agreed")
DEFAULT_BEDTIME = {"weeknight": "22:30", "weekend": "23:30"}
MAX_ITEMS = 300
_CLOCK = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")
_FORMAT = re.compile(r"(household-hours|planavista\.household)/v(\d+)")
_SLUG = re.compile(r"[a-z0-9]+(?:_[a-z0-9]+)*")

# Exported member fields; links to Home Assistant travel under `links` (spec 7.9).
MEMBER_EXPORT = (
    "id", "name", "color", "color_dark", "picture", "age_group", "parent", "order", "my_day", "needs_ok_for",
    "stars", "goal", "bedtime", "sleep_hours", "away", "notify",
)
# Activity fields that are bookkeeping of this household, not part of the plan.
ACTIVITY_LOCAL = ("rev", "assigned_since")
REWARD_EXPORT = ("id", "name", "icon", "cost", "needs_ok", "who")
# What a re-import of a plan changes on a chore it already made: the plan's own fields.
PLAN_UPDATES = ("name", "category", "assignees", "minimum", "split", "shares", "days", "time_of_day", "set_time")


class ImportProblem(ValueError):
    """A file that can't be imported. `problems` lists what is wrong, item by item."""

    def __init__(self, code: str, message: str, problems: list[dict[str, Any]] | None = None) -> None:
        """Remember what is wrong."""
        super().__init__(message)
        self.code = code
        self.message = message
        self.problems = problems or []


def _number(value: object) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        try:
            return float(str(value))
        except ValueError:
            return 0.0
    return float(value)


def _text(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _clock(value: object) -> str | None:
    text = _text(value)
    return text if _CLOCK.fullmatch(text) else None


def _hours(value: float) -> float:
    """Hours to the minute, so shares like 1/3 h add up."""
    return round(value * 60) / 60


# Reading a file ---------------------------------------------------------------------------------


def read_file(text: object) -> dict[str, Any]:
    """What the file is and what it holds, or ImportProblem saying why it can't be read."""
    if not isinstance(text, str) or not text.strip():
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    try:
        data = json.loads(text)
    except ValueError:
        raise ImportProblem("unknown_file", UNKNOWN_FILE) from None
    if not isinstance(data, Mapping):
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    kind = data.get("schema", data.get("format"))
    match = _FORMAT.fullmatch(kind) if isinstance(kind, str) else None
    if match is None or int(match[2]) < 1:
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    version = int(match[2])
    if version > 1:
        template = NEWER_PLAN if match[1] == "household-hours" else NEWER_HOUSEHOLD
        raise ImportProblem("newer_file", template.format(version=version))
    parsed = _read_plan(data) if match[1] == "household-hours" else _read_household(data)
    exported = _text(data.get("exported"))
    parsed["exported"] = exported[:10] if re.match(r"\d{4}-\d{2}-\d{2}", exported) else None
    parsed["source"] = _text(data.get("source")) or None
    return parsed


def _list(data: Mapping[str, Any], key: str, problems: list[dict[str, Any]], what: str) -> list[Any]:
    value = data.get(key, [])
    if not isinstance(value, list) or len(value) > MAX_ITEMS:
        problems.append({"item": what, "code": "invalid_list"})
        return []
    return value


def _invalid(problems: list[dict[str, Any]]) -> None:
    if problems:
        raise ImportProblem("invalid_file", INVALID_FILE, problems)


def _read_plan(data: Mapping[str, Any]) -> dict[str, Any]:
    """A Household Hours plan: people with bedtimes and sleep, and the plan's activities."""
    problems: list[dict[str, Any]] = []
    people: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "people", problems, "People"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Person {n}", "code": "name_required"})
            continue
        ref = _text(raw.get("id")) or f"person_{n}"
        people.append({
            "ref": ref, "name": name, "color": palette_color(raw.get("color")),
            "bedtime": {
                "weeknight": _clock(raw.get("bedWk")) or DEFAULT_BEDTIME["weeknight"],
                "weekend": _clock(raw.get("bedWe")) or DEFAULT_BEDTIME["weekend"],
            },
            "sleep_hours": None, "age_group": None, "parent": None, "record": None,
        })
    by_ref = {p["ref"]: p for p in people}
    activities: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "activities", problems, "Activities"), 1):
        if not isinstance(raw, Mapping):
            problems.append({"item": f"Activity {n}", "code": "name_required"})
            continue
        name = _text(raw.get("name"))
        if not name:
            problems.append({"item": f"Activity {n}", "code": "name_required"})
            continue
        hours = _number(raw.get("minHours"))
        per = "day" if raw.get("per") == "day" else "week"
        alloc = raw.get("alloc") if isinstance(raw.get("alloc"), Mapping) else {}
        refs = [ref for ref in alloc if ref in by_ref]
        each = raw.get("timePer") == "person"
        # More than a day (or a week) holds is a mistake per person; a split total may be more.
        owed = [hours] if each or not refs else [_number(alloc[ref]) for ref in refs]
        if hours <= 0 or any(o > (24 if per == "day" else 168) for o in owed):
            problems.append({"item": name, "code": "invalid_hours"})
            continue
        if raw.get("isSleep"):
            for ref in refs:
                owed = hours if each else _number(alloc[ref])
                nightly = owed if per == "day" else owed / 7
                person = by_ref[ref]
                person["sleep_hours"] = round(((person["sleep_hours"] or 0) + nightly) * 4) / 4
            continue
        activities.append(_plan_activity(raw, name, hours, per, alloc, refs, each))
    _invalid(problems)
    return {"format": FORMAT_PLAN, "people": people, "activities": activities, "rewards": [], "settings": None}


def _plan_activity(
    raw: Mapping[str, Any], name: str, hours: float, per: str, alloc: Mapping[str, Any], refs: list[str], each: bool
) -> dict[str, Any]:
    """One planner activity as a Plan chore, its people still named by the plan's ids."""
    planned: float | None = None
    shares: dict[str, float] | None = None
    if each:
        assignees, split, minimum = refs, "each", hours
    else:
        owed = {ref: _hours(_number(alloc[ref])) for ref in refs if _number(alloc[ref]) > 0}
        assignees = list(owed)
        total = _hours(sum(owed.values()))
        if len(owed) >= 2:
            split, shares, minimum = "shared", owed, total
        elif owed:
            split, minimum = "each", total
        else:
            split, minimum = "each", hours
        if owed and abs(total - hours) > 0.01:
            planned = hours  # the shares are what people owe; the difference is pointed out
    picked = {PLAN_DAYS[d] for d in raw.get("days") or [] if isinstance(d, int) and not isinstance(d, bool) and 0 <= d <= 6}
    bands = [band for band in BANDS if band in (raw.get("tod") or [])]
    set_time = _clock(raw.get("fixedStart"))
    category = raw.get("category") if raw.get("category") in CATEGORIES and raw.get("category") != "sleep" else "other"
    record: dict[str, Any] = {
        "name": name, "icon": None, "category": category, "schedule": "plan", "assignees": assignees,
        "minimum": {"hours": minimum, "per": per}, "split": split, "shares": shares,
        "days": [day for day in WEEKDAY_CODES if day in picked], "time_of_day": bands,
        # A daily chore at two times of day is checked off at each (morning and evening cat care).
        "times": len(bands) if per == "day" and len(bands) > 1 else 1,
        "set_time": set_time, "on_board": category in BOARD_CATEGORIES and set_time is None,
        "needs_ok": False, "stars": None,
        "type": "want" if raw.get("type") == "want" else "need",
        "locked": bool(raw.get("locked")), "agreed": bool(raw.get("agreed")),
        "import_ref": {"format": FORMAT_PLAN, "id": _text(raw.get("id")) or name},
    }
    return {"ref": record["import_ref"]["id"], "record": record, "planned_hours": planned}


def _read_household(data: Mapping[str, Any]) -> dict[str, Any]:
    """A PlanaVista file: the whole household, with its ids (spec 7.9)."""
    problems: list[dict[str, Any]] = []
    people: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "members", problems, "People"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Person {n}", "code": "name_required"})
            continue
        age_group = raw.get("age_group") if raw.get("age_group") in AGE_GROUPS else "adult"
        people.append({
            "ref": _text(raw.get("id")) or f"person_{n}", "name": name, "color": palette_color(raw.get("color")),
            "bedtime": raw.get("bedtime"), "sleep_hours": raw.get("sleep_hours"),
            "age_group": age_group, "parent": bool(raw.get("parent")), "record": dict(raw),
        })
    chores = data.get("chores") if isinstance(data.get("chores"), Mapping) else {}
    activities: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(chores, "activities", problems, "Chores"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Chore {n}", "code": "name_required"})
            continue
        record = {k: v for k, v in raw.items() if k not in ACTIVITY_LOCAL}
        activities.append({"ref": _text(raw.get("id")) or name, "record": record, "planned_hours": None})
    rewards: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "rewards", problems, "Rewards"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Reward {n}", "code": "name_required"})
            continue
        rewards.append({"ref": _text(raw.get("id")) or name, "record": dict(raw)})
    settings = chores.get("settings") if isinstance(chores.get("settings"), Mapping) else None
    _invalid(problems)
    return {
        "format": FORMAT_HOUSEHOLD, "people": people, "activities": activities, "rewards": rewards,
        "settings": dict(settings) if settings else None,
    }


# Where everything would go ----------------------------------------------------------------------


def _match_people(
    parsed: Mapping[str, Any], members: list[dict[str, Any]], chosen: Mapping[str, Any] | None = None
) -> dict[str, str | None]:
    """File person -> member id: the parent's pick, else (in a PlanaVista file) the same id, else the same name."""
    by_id = {m["id"]: m for m in members}
    taken: set[str] = set()
    matches: dict[str, str | None] = {}
    picks = chosen or {}
    for person in parsed["people"]:
        ref = person["ref"]
        if ref in picks and "match" in picks[ref]:
            matches[ref] = picks[ref]["match"] if picks[ref]["match"] in by_id else None
            continue
        found = None
        if parsed["format"] == FORMAT_HOUSEHOLD and ref in by_id and ref not in taken:
            found = ref
        if found is None:
            found = next(
                (m["id"] for m in members if m["name"].casefold() == person["name"].casefold() and m["id"] not in taken),
                None,
            )
        matches[ref] = found
        if found:
            taken.add(found)
    return matches


def _match_activity(
    parsed: Mapping[str, Any], entry: Mapping[str, Any], activities: list[dict[str, Any]], taken: set[str]
) -> str | None:
    """The chore this one updates: by the plan's own id from the last import (or the chore id), then by name."""
    record = entry["record"]
    if parsed["format"] == FORMAT_PLAN:
        ref = record["import_ref"]
        found = next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("import_ref") == ref),
            None,
        ) or next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("schedule") == "plan"
             and a["name"].casefold() == record["name"].casefold()),
            None,
        )
    else:
        found = next((a["id"] for a in activities if a["id"] not in taken and a["id"] == entry["ref"]), None) or next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("schedule") == record.get("schedule")
             and a["name"].casefold() == record["name"].casefold()),
            None,
        )
    if found:
        taken.add(found)
    return found


def _kind(record: Mapping[str, Any], on_board: bool) -> str:
    if record.get("schedule", "plan") == "plan" and record.get("set_time"):
        return "set_time"
    return "board" if on_board else "plan_only"


def preview(
    parsed: Mapping[str, Any], members: list[dict[str, Any]], activities: list[dict[str, Any]],
    rewards: list[dict[str, Any]],
) -> dict[str, Any]:
    """Where everything in the file would go (spec 14.6). Nothing is saved."""
    matches = _match_people(parsed, members)
    names = {m["id"]: m["name"] for m in members}
    people = [
        {
            "ref": p["ref"], "name": p["name"], "match": matches[p["ref"]],
            "match_name": names.get(matches[p["ref"]] or ""), "color": p["color"], "bedtime": p["bedtime"],
            "sleep_hours": p["sleep_hours"], "age_group": p["age_group"], "parent": p["parent"],
        }
        for p in parsed["people"]
    ]
    existing = {a["id"]: a for a in activities}
    taken: set[str] = set()
    items: list[dict[str, Any]] = []
    look: list[dict[str, Any]] = []
    for entry in parsed["activities"]:
        record = entry["record"]
        match = _match_activity(parsed, entry, activities, taken)
        on_board = bool(existing[match].get("on_board", True)) if match and parsed["format"] == FORMAT_PLAN else bool(
            record.get("on_board", True)
        )
        kind = _kind(record, on_board)
        items.append({
            "ref": entry["ref"], "name": record["name"], "icon": record.get("icon") or (existing[match].get("icon") if match else None),
            "category": record.get("category", "other"), "kind": kind, "on_board": on_board, "match": match,
            **{key: record.get(key) for key in (
                "schedule", "assignees", "minimum", "split", "shares", "days", "time_of_day", "set_time", "once", "repeats",
            )},
        })
        if kind == "board" and not record.get("assignees"):
            look.append({"kind": "unassigned", "ref": entry["ref"], "name": record["name"]})
        if entry.get("planned_hours") is not None:
            look.append({
                "kind": "shares", "ref": entry["ref"], "name": record["name"],
                "hours": record["minimum"]["hours"], "planned": entry["planned_hours"], "per": record["minimum"]["per"],
            })
    updates = [i for i in items if i["match"]]
    if updates:
        look.append({"kind": "updates", "refs": [i["ref"] for i in updates], "names": [i["name"] for i in updates]})
    reward_taken: set[str] = set()
    reward_items = []
    for entry in parsed["rewards"]:
        record = entry["record"]
        match = next((r["id"] for r in rewards if r["id"] == entry["ref"] and r["id"] not in reward_taken), None) or next(
            (r["id"] for r in rewards if r["name"].casefold() == record["name"].casefold() and r["id"] not in reward_taken),
            None,
        )
        if match:
            reward_taken.add(match)
        reward_items.append({"ref": entry["ref"], "name": record["name"], "icon": record.get("icon"), "match": match})
    return {
        "file": {
            "format": parsed["format"], "label": FORMAT_LABELS[parsed["format"]],
            "exported": parsed.get("exported"), "source": parsed.get("source"),
        },
        "people": people,
        "activities": items,
        "rewards": reward_items,
        "settings": parsed["settings"] is not None,
        "needs_a_look": look,
    }


# What to save -----------------------------------------------------------------------------------


def _free_id(wanted: str, taken: set[str], name: str, make: Any) -> str:
    """Keep a file's own id when it is free (automations name it), else make one from the name."""
    if _SLUG.fullmatch(wanted) and wanted not in taken:
        return wanted
    return make(name, taken)


def plan_import(
    parsed: Mapping[str, Any],
    choices: Mapping[str, Any],
    members: list[dict[str, Any]],
    activities: list[dict[str, Any]],
    rewards: list[dict[str, Any]],
    settings: Mapping[str, Any],
    *,
    persons: Collection[str] = (),
    calendars: Collection[str] = (),
) -> dict[str, Any]:
    """The records an import saves, all checked first: ImportProblem lists what stops it.

    `choices` holds the parent's picks from the preview: `people` (ref ->
    {match, age_group}), `on_board` (ref -> bool), and `assignees` (ref ->
    the plan's people refs). `persons` and `calendars` are the Home Assistant
    people and the calendars PlanaVista shows, for a PlanaVista file's links.
    """
    problems: list[dict[str, Any]] = []
    picks = choices.get("people") or {}
    matches = _match_people(parsed, members, picks)
    restoring = parsed["format"] == FORMAT_HOUSEHOLD
    seen: dict[str, str] = {}
    for person in parsed["people"]:
        member_id = matches[person["ref"]]
        if member_id and member_id in seen:
            problems.append({"item": person["name"], "code": "matched_twice", "other": seen[member_id]})
        elif member_id:
            seen[member_id] = person["name"]

    # People: new ones get their ids first, so chores can name them.
    by_id = {m["id"]: dict(m) for m in members}
    taken = set(by_id)
    ids: dict[str, str] = {}
    members_add: list[dict[str, Any]] = []
    members_update: dict[str, dict[str, Any]] = {}
    calendar_links: dict[str, str] = {}
    after: list[dict[str, Any]] = [dict(m) for m in members]
    for person in parsed["people"]:
        ref = person["ref"]
        member_id = matches[ref]
        if restoring:
            changes = {k: v for k, v in (person["record"] or {}).items() if k in EDITABLE_FIELDS}
            links = (person["record"] or {}).get("links") or {}
            if isinstance(links, Mapping):
                changes["person"] = links.get("person") if links.get("person") in persons else None
                changes["phones"] = links.get("phones") or []
        else:
            changes = {"bedtime": person["bedtime"]}
            if person["sleep_hours"] is not None:
                changes["sleep_hours"] = person["sleep_hours"]
        if member_id:
            if not restoring or changes.get("person") is None:
                changes.pop("person", None)  # a link the file can't make keeps the one there is
            ids[ref] = member_id
            others = [m for m in after if m["id"] != member_id]
            try:
                build_member(by_id[member_id], changes, others)
            except MemberError as err:
                problems.append({"item": person["name"], "code": err.code})
            members_update[member_id] = changes
            after = [dict(m, **changes) if m["id"] == member_id else m for m in after]
        else:
            age_group = (picks.get(ref) or {}).get("age_group") or person["age_group"]
            if age_group not in AGE_GROUPS:
                problems.append({"item": person["name"], "code": "age_group_required"})
                age_group = "adult"
            new_id = _free_id(ref, taken, person["name"], make_member_id) if restoring else make_member_id(person["name"], taken)
            taken.add(new_id)
            ids[ref] = new_id
            changes = {**changes, "name": person["name"], "age_group": age_group}
            if not restoring:
                changes["parent"] = False
            used = {m["color"].upper() for m in after if m.get("color")}
            if person["color"] and person["color"].upper() not in used:
                changes["color"] = person["color"]
            else:
                changes["color"] = next((c for c in PALETTE if c.upper() not in used), None)
            try:
                record = build_member(None, changes, after)
            except MemberError as err:
                problems.append({"item": person["name"], "code": err.code})
                continue
            record["id"] = new_id
            members_add.append(record)
            after.append(record)
        links = (person["record"] or {}).get("links") if restoring else None
        if isinstance(links, Mapping):
            for entity_id in links.get("calendars") or []:
                if entity_id in calendars:
                    calendar_links[entity_id] = ids[ref]
    member_ids = {m["id"] for m in after}

    # Chores, with the plan's people named by member id now.
    existing = {a["id"]: a for a in activities}
    activity_taken: set[str] = set()
    activity_ids = set(existing)
    activities_add: list[dict[str, Any]] = []
    activities_update: dict[str, dict[str, Any]] = {}
    on_board_picks = choices.get("on_board") or {}
    assignee_picks = choices.get("assignees") or {}
    for entry in parsed["activities"]:
        record = dict(entry["record"])
        ref = entry["ref"]
        assignees = assignee_picks.get(ref) if ref in assignee_picks else record.get("assignees") or []
        record["assignees"] = list(dict.fromkeys(ids[a] for a in assignees if a in ids))
        if isinstance(record.get("shares"), Mapping):
            shares = {ids[a]: h for a, h in record["shares"].items() if a in ids}
            if ref in assignee_picks or set(shares) != set(record["assignees"]):
                record["split"], record["shares"] = "each", None  # a new pick does the whole time each
            else:
                record["shares"] = shares
        match = _match_activity(parsed, entry, activities, activity_taken)
        if ref in on_board_picks:
            record["on_board"] = bool(on_board_picks[ref])
        elif match and not restoring:
            record["on_board"] = bool(existing[match].get("on_board", True))
        # What the chore rules don't edit, and the import keeps: the planner's fields and where it came from.
        extra = {k: v for k, v in record.items() if k not in ACTIVITY_FIELDS and k not in ("id", *ACTIVITY_LOCAL)}
        try:
            if match:
                if restoring:
                    changes = {k: v for k, v in record.items() if k in ACTIVITY_FIELDS}
                    extra = {}
                else:
                    changes = {k: v for k, v in record.items() if k in PLAN_UPDATES or k == "on_board"}
                    changes["schedule"] = "plan"
                    extra = {k: v for k, v in extra.items() if k in PLANNER_FIELDS or k == "import_ref"}
                build_activity(existing[match], changes, member_ids)
                activities_update[match] = {"changes": changes, "extra": extra}
            else:
                built = build_activity(None, record, member_ids)
                built.update(extra)
                built["id"] = _free_id(ref, activity_ids, built["name"], make_id) if restoring else make_id(
                    built["name"], activity_ids
                )
                activity_ids.add(built["id"])
                activities_add.append(built)
        except ChoreError as err:
            problems.append({"item": record.get("name") or ref, "code": err.code, "detail": err.detail})

    # Rewards and rules (a PlanaVista file only).
    rewards_add: list[dict[str, Any]] = []
    rewards_update: dict[str, dict[str, Any]] = {}
    reward_ids = {r["id"] for r in rewards}
    reward_taken: set[str] = set()
    for entry in parsed["rewards"]:
        record = dict(entry["record"])
        record["who"] = [ids[w] for w in record.get("who") or [] if w in ids]
        match = next((r["id"] for r in rewards if r["id"] == entry["ref"] and r["id"] not in reward_taken), None) or next(
            (r["id"] for r in rewards if r["name"].casefold() == record["name"].casefold() and r["id"] not in reward_taken),
            None,
        )
        try:
            if match:
                reward_taken.add(match)
                build_reward(next(r for r in rewards if r["id"] == match), record, member_ids)
                rewards_update[match] = record
            else:
                built = build_reward(None, record, member_ids)
                built["id"] = _free_id(entry["ref"], reward_ids, built["name"], make_id)
                reward_ids.add(built["id"])
                rewards_add.append(built)
        except ChoreError as err:
            problems.append({"item": record.get("name") or entry["ref"], "code": err.code, "detail": err.detail})
    new_settings = None
    if parsed["settings"] is not None:
        try:
            new_settings = build_settings(settings, parsed["settings"])
        except ChoreError as err:
            problems.append({"item": "Rules", "code": err.code, "detail": err.detail})
    _invalid(problems)
    return {
        "members_add": members_add,
        "members_update": members_update,
        "calendars": calendar_links,
        "activities_add": activities_add,
        "activities_update": activities_update,
        "rewards_add": rewards_add,
        "rewards_update": rewards_update,
        "settings": new_settings,
        "summary": {
            "people_added": [m["name"] for m in members_add],
            "activities_added": len(activities_add),
            "activities_updated": len(activities_update),
            "rewards_added": len(rewards_add),
            "rewards_updated": len(rewards_update),
        },
    }


# Export -----------------------------------------------------------------------------------------


def export_household(
    members: Iterable[Mapping[str, Any]],
    calendars: Iterable[Mapping[str, Any]],
    plan: Mapping[str, Any],
    rewards: Mapping[str, Any],
    *,
    version: str,
    exported: str,
) -> dict[str, Any]:
    """The household as a planavista.household/v1 file (spec 7.9).

    People (with their Home Assistant links), chores (with the planner's hidden
    fields), rewards, and rules. Never PINs, stars, history, requests, or
    shared-screen accounts: Home Assistant backups keep those.
    """
    rows = list(calendars)
    out_members = []
    for member in ordered(members):
        record = {key: member[key] for key in MEMBER_EXPORT if key in member}
        record["links"] = {
            "person": member.get("person"),
            "calendars": [row["entity_id"] for row in rows if row.get("member_id") == member["id"]],
            "phones": list(member.get("phones") or []),
        }
        out_members.append(record)
    return {
        "format": FORMAT_HOUSEHOLD,
        "exported": exported,
        "source": f"PlanaVista {version}",
        "members": out_members,
        "chores": {
            "settings": dict(plan.get("settings") or {}),
            "activities": [{k: v for k, v in a.items() if k not in ACTIVITY_LOCAL} for a in plan.get("activities", [])],
        },
        "rewards": [{k: r[k] for k in REWARD_EXPORT if k in r} for r in rewards.get("rewards", [])],
    }
```

`docs/schemas/planavista.household.v1.json` (new):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/tavenhall1/planavista/blob/main/docs/schemas/planavista.household.v1.json",
  "title": "PlanaVista household, version 1",
  "description": "A PlanaVista household: people, chores, rewards, and rules. PINs, stars, history, and shared-screen accounts are never in it; Home Assistant backups keep those. Readers keep fields they don't know.",
  "type": "object",
  "required": ["format", "members"],
  "properties": {
    "format": {"const": "planavista.household/v1"},
    "exported": {"type": "string", "description": "When the file was made, as an ISO 8601 time."},
    "source": {"type": "string", "description": "What made the file, such as PlanaVista 1.3.0."},
    "members": {"type": "array", "items": {"$ref": "#/$defs/member"}, "maxItems": 20},
    "chores": {
      "type": "object",
      "properties": {
        "settings": {"$ref": "#/$defs/settings"},
        "activities": {"type": "array", "items": {"$ref": "#/$defs/activity"}, "maxItems": 300}
      }
    },
    "rewards": {"type": "array", "items": {"$ref": "#/$defs/reward"}, "maxItems": 100}
  },
  "$defs": {
    "clock": {"type": "string", "pattern": "^([01][0-9]|2[0-3]):[0-5][0-9]$"},
    "date": {"type": "string", "pattern": "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"},
    "id": {"type": "string", "pattern": "^[a-z0-9]+(_[a-z0-9]+)*$", "description": "Made from the name when the record was created; it never changes."},
    "member": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": {"$ref": "#/$defs/id"},
        "name": {"type": "string", "minLength": 1, "maxLength": 40},
        "color": {"type": "string", "description": "One of PlanaVista's 20 colors, as #RRGGBB."},
        "color_dark": {"type": ["string", "null"]},
        "picture": {
          "oneOf": [
            {"type": "object", "properties": {"initial": {"const": true}}, "required": ["initial"]},
            {"type": "object", "properties": {"emoji": {"type": "string"}}, "required": ["emoji"]},
            {"type": "object", "properties": {"person": {"const": true}}, "required": ["person"]}
          ]
        },
        "age_group": {"enum": ["young_child", "older_child", "teen", "adult"]},
        "parent": {"type": "boolean"},
        "order": {"type": "integer", "description": "Position on the board, left to right, then down."},
        "my_day": {"enum": ["timeline", "list", "pictures"]},
        "needs_ok_for": {"enum": ["all", "marked", "none"]},
        "stars": {"type": "boolean", "description": "Whether they earn stars."},
        "goal": {"type": ["string", "null"], "description": "The id of the reward they're saving up for."},
        "bedtime": {
          "type": ["object", "null"],
          "properties": {
            "weeknight": {"$ref": "#/$defs/clock"},
            "weekend": {"$ref": "#/$defs/clock", "description": "Friday and Saturday nights."}
          }
        },
        "sleep_hours": {"type": ["number", "null"], "minimum": 1, "maximum": 16},
        "away": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["from", "to"],
            "properties": {"from": {"$ref": "#/$defs/date"}, "to": {"$ref": "#/$defs/date"}, "note": {"type": ["string", "null"]}}
          }
        },
        "notify": {
          "type": "object",
          "properties": {
            "requests": {"type": "boolean", "description": "A parent's phones get Waiting for OK requests."},
            "reminders": {"type": "boolean", "description": "Their phones get the evening reminder when chores are left."}
          }
        },
        "links": {
          "type": "object",
          "description": "Links to Home Assistant, made again on restore when Home Assistant has them.",
          "properties": {
            "person": {"type": ["string", "null"], "pattern": "^person\\."},
            "calendars": {"type": "array", "items": {"type": "string", "pattern": "^calendar\\."}},
            "phones": {"type": "array", "items": {"type": "string", "pattern": "^notify\\."}, "maxItems": 5}
          }
        }
      }
    },
    "activity": {
      "type": "object",
      "required": ["id", "name", "schedule"],
      "description": "A chore, or a plan-only activity. Plan chores set an amount of time each day or week; Once chores happen one time; Repeats chores follow an RRULE.",
      "properties": {
        "id": {"$ref": "#/$defs/id"},
        "name": {"type": "string", "minLength": 1, "maxLength": 60},
        "icon": {"type": ["string", "null"], "description": "An emoji or an mdi: icon."},
        "category": {"enum": ["kitchen", "cleaning", "home", "personal", "school", "work", "family", "sleep", "other"]},
        "schedule": {"enum": ["plan", "once", "repeats"]},
        "assignees": {"type": "array", "items": {"$ref": "#/$defs/id"}},
        "on_board": {"type": "boolean"},
        "needs_ok": {"type": "boolean", "description": "A parent's OK, for people whose setting is marked chores."},
        "stars": {"type": ["integer", "null"], "minimum": 0, "maximum": 100, "description": "Stars per check-off; null works them out from the time."},
        "label": {"type": ["string", "null"], "maxLength": 30},
        "minimum": {
          "type": "object",
          "properties": {"hours": {"type": "number", "exclusiveMinimum": 0, "maximum": 168}, "per": {"enum": ["day", "week"]}}
        },
        "split": {"enum": ["shared", "each"]},
        "shares": {"type": ["object", "null"], "additionalProperties": {"type": "number"}, "description": "Hours each person owes when the time is split."},
        "days": {"type": "array", "items": {"enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}},
        "time_of_day": {"type": "array", "items": {"enum": ["morning", "afternoon", "evening"]}},
        "times": {"type": "integer", "minimum": 1, "maximum": 12, "description": "Check-offs per day, or per week when it has no days."},
        "set_time": {"oneOf": [{"$ref": "#/$defs/clock"}, {"type": "null"}], "description": "A set start time makes it plan only."},
        "once": {
          "type": "object",
          "properties": {
            "on": {"oneOf": [{"$ref": "#/$defs/date"}, {"type": "null"}]},
            "by": {"oneOf": [{"$ref": "#/$defs/date"}, {"type": "null"}]},
            "by_time": {"oneOf": [{"$ref": "#/$defs/clock"}, {"type": "null"}]},
            "sessions": {"type": "integer", "minimum": 1, "maximum": 20},
            "estimate_minutes": {"type": "integer", "minimum": 1, "maximum": 1440}
          }
        },
        "repeats": {
          "type": "object",
          "properties": {
            "rrule": {"type": "string", "description": "FREQ=DAILY, WEEKLY, or MONTHLY, with INTERVAL, BYDAY (weekly), BYMONTHDAY (monthly, one day), and COUNT or UNTIL."},
            "start": {"$ref": "#/$defs/date"},
            "window": {"enum": ["day", "period"]},
            "estimate_minutes": {"type": "integer", "minimum": 1, "maximum": 1440}
          }
        },
        "type": {"enum": ["need", "want"], "description": "Kept for the family-meeting planner."},
        "locked": {"type": "boolean", "description": "Kept for the family-meeting planner."},
        "agreed": {"type": "boolean", "description": "Kept for the family-meeting planner."},
        "import_ref": {"type": "object", "properties": {"format": {"type": "string"}, "id": {"type": "string"}}},
        "created": {"type": "object"},
        "finished_at": {"type": ["string", "null"]}
      }
    },
    "reward": {
      "type": "object",
      "required": ["id", "name", "cost"],
      "properties": {
        "id": {"$ref": "#/$defs/id"},
        "name": {"type": "string", "minLength": 1, "maxLength": 60},
        "icon": {"type": ["string", "null"]},
        "cost": {"type": "integer", "minimum": 1, "maximum": 10000},
        "needs_ok": {"type": "boolean"},
        "who": {"type": "array", "items": {"$ref": "#/$defs/id"}, "description": "Who can get it; empty means everyone who earns stars."}
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "missed": {"enum": ["make_up", "strict", "carry_over"]},
        "day_starts": {"$ref": "#/$defs/clock"},
        "auto_approve": {"enum": ["day_end", "never"]},
        "minutes_per_star": {"type": "integer", "minimum": 1, "maximum": 240},
        "evening_check": {"oneOf": [{"$ref": "#/$defs/clock"}, {"type": "null"}]},
        "sound": {"type": "boolean"}
      }
    }
  }
}
```

- [ ] **Step 4: Run them again.** Same command. Expected: `25 passed`.
- [ ] **Step 5: Run the whole backend suite.** Expected: `1000 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): read Household Hours plans and PlanaVista files, and write PlanaVista files` with the trailers.

---

### Task 3: Import, export, and restore over WebSocket, and the export_household action

Spec 10.4 (`export_household`), 10.7 (the commands), 14.6 (preview, then Import), 15.3 (a restore while chores need a look starts over first), and 9.5 (parent level). Problems come back as results (`{"problem": {code, message, problems}}`), since an error can't carry the list.

**Files:**
- Modify: `custom_components/planavista/chores/importer.py`, `custom_components/planavista/chores/engine.py`, `custom_components/planavista/chores/websocket.py`, `custom_components/planavista/chores/services.py`, `custom_components/planavista/household/members.py`, `custom_components/planavista/services.yaml`
- Test: `tests/test_chores_import_ws.py`

**Interfaces:**
- Consumes: Task 2's `read_file`, `preview`, `plan_import`, `export_household`.
- Produces: engine `apply_import(now, changes, *, by, source)`; WebSocket `planavista/import/preview` `{text, name?}` -> `{preview}` or `{problem}` (`starts_over` while chores need a look), `planavista/import/apply` `{text, choices}` -> `{summary}` or `{problem}` (parent level; turns chores on; relinks calendars PlanaVista shows), `planavista/export` -> `{file, name}`; action `planavista.export_household` (response only).

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_import_ws.py` (new):

```python
"""Import, restore, and export through the card's commands and the export_household action (spec 7.9, 10.4, 10.7)."""
from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.planavista.chores.runtime import STATE_NEEDS_A_LOOK
from custom_components.planavista.const import DOMAIN

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, ws_client_for, ws_command

PLAN_TEXT = (Path(__file__).parent / "fixtures" / "household_hours_sample.json").read_text("utf-8")


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """PlanaVista shows Alex's and Blair's calendars."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    return data


async def _alex(hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser]) -> Any:
    return await ws_client_for(hass, hass_ws_client, accounts["alex"])


async def test_the_preview_is_a_parents_and_says_where_things_go(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/import/preview", "text": PLAN_TEXT})
    assert refused["error"]["code"] == "not_allowed"
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/preview", "text": PLAN_TEXT})
    result = reply["result"]["preview"]
    assert result["file"]["label"] == "Household Hours plan, version 1"
    assert [p["match"] for p in result["people"]] == ["alex", "blair", "casey", "dana"]
    assert result["starts_over"] is False
    assert chores.engine.activity("vacuum") is None  # nothing saved


async def test_a_file_that_cant_be_read_says_why(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/preview", "text": "plan.txt"})
    assert reply["result"]["problem"] == {
        "code": "unknown_file", "message": "This doesn't look like a Household Hours or PlanaVista file.", "problems": [],
    }
    broken = json.dumps({"schema": "household-hours/v1", "people": [], "activities": [{"name": "Vacuum", "minHours": 0}]})
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": broken})
    assert reply["result"]["problem"]["problems"] == ["Vacuum: set how long it takes."]


async def test_importing_a_plan_adds_and_updates_chores_and_peoples_sleep(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT, "choices": {
        "on_board": {"a17": True}, "assignees": {"a15": ["p_casey"]},
    }})
    summary = reply["result"]["summary"]
    assert (summary["activities_added"], summary["activities_updated"], summary["people_added"]) == (14, 9, [])
    engine = chores.engine
    vacuum = engine.activity("vacuum")
    assert (vacuum["assignees"], vacuum["created"]["by"], vacuum["import_ref"]["id"]) == (["blair"], "alex", "a08")
    assert engine.activity("homework")["on_board"] is True
    assert engine.activity("wash_the_car")["assignees"] == ["casey"]
    laundry = engine.activity("laundry")
    assert (laundry["label"], laundry["import_ref"], laundry["rev"]) == ("2 loads", {"format": "household-hours/v1", "id": "a06"}, 2)
    assert chores.household.member("dana")["sleep_hours"] == 10.5
    assert chores.household.member("casey")["bedtime"] == {"weeknight": "22:00", "weekend": "23:00"}
    again = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert again["result"]["summary"]["activities_added"] == 0


async def test_a_new_person_without_an_age_group_stops_the_import(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    plan = json.loads(PLAN_TEXT)
    plan["people"].append({"id": "p_jordan", "name": "Jordan", "bedWk": "21:00", "bedWe": "22:00"})
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(plan)})
    assert reply["result"]["problem"]["problems"] == ["Pick an age group for Jordan."]
    assert chores.household.member("jordan") is None
    assert chores.engine.activity("vacuum") is None
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(plan),
                                    "choices": {"people": {"p_jordan": {"age_group": "older_child"}}}})
    assert reply["result"]["summary"]["people_added"] == ["Jordan"]
    assert chores.household.member("jordan")["age_group"] == "older_child"


async def test_importing_chores_turns_chores_on(
    hass: HomeAssistant, household: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    from custom_components.planavista.chores.runtime import DATA_CHORES

    runtime = hass.data[DATA_CHORES]
    assert runtime.enabled is False
    alex = await _alex(hass, hass_ws_client, accounts)
    reply = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert reply["result"]["summary"]["activities_added"] == 23
    assert runtime.enabled is True
    assert runtime.engine.activity("cat_care")["times"] == 2


async def test_export_then_restore_brings_chores_back_after_they_need_a_look(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    exported = await ws_command(alex, {"type": "planavista/export"})
    file, name = exported["result"]["file"], exported["result"]["name"]
    assert name == "planavista-household-2026-10-13.json"
    assert file["format"] == "planavista.household/v1" and len(file["chores"]["activities"]) == 16
    assert "pin" not in json.dumps(file).lower()
    chores.problem = STATE_NEEDS_A_LOOK
    chores.engine.plan["activities"] = []
    looked = await ws_command(alex, {"type": "planavista/import/preview", "text": json.dumps(file)})
    assert looked["result"]["preview"]["starts_over"] is True
    plan_text = await ws_command(alex, {"type": "planavista/import/apply", "text": PLAN_TEXT})
    assert plan_text["error"]["code"] == "chores_need_a_look"
    restored = await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    assert restored["result"]["summary"]["activities_added"] == 16
    assert chores.state == "ok"
    assert chores.engine.activity("take_out_the_trash")["assignees"] == ["casey"]


async def test_a_restore_links_calendars_planavista_shows(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any, mock_config_entry: Any
) -> None:
    alex = await _alex(hass, hass_ws_client, accounts)
    file = (await ws_command(alex, {"type": "planavista/export"}))["result"]["file"]
    file["members"][1]["links"]["calendars"] = ["calendar.test_blair", "calendar.not_shown"]
    await ws_command(alex, {"type": "planavista/import/apply", "text": json.dumps(file)})
    rows = {row["entity_id"]: row.get("member_id") for row in mock_config_entry.data["calendars"]}
    assert rows["calendar.test_blair"] == "blair"


async def test_export_is_a_parents_on_the_card(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/export"})
    assert refused["error"]["code"] == "not_allowed"


async def test_the_export_action_is_for_admins_and_automations(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    response = await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True)
    assert response["format"] == "planavista.household/v1"
    assert [m["name"] for m in response["members"]] == ["Alex", "Blair", "Casey", "Dana"]
    admin = await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True,
                                           context=Context(user_id=accounts["admin"].id))
    assert admin["source"].startswith("PlanaVista ")
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(DOMAIN, "export_household", {}, blocking=True, return_response=True,
                                       context=Context(user_id=accounts["alex"].id))
    assert err.value.translation_key == "not_allowed"
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_import_ws.py -q` Expected: FAIL: `planavista/import/preview`, `planavista/import/apply`, and `planavista/export` are unknown commands, and `planavista.export_household` isn't an action.

- [ ] **Step 3: Apply an import in the engine.**

`custom_components/planavista/chores/importer.py`:

```diff
diff --git a/custom_components/planavista/chores/importer.py b/custom_components/planavista/chores/importer.py
index 641924b..8894ddf 100644
--- a/custom_components/planavista/chores/importer.py
+++ b/custom_components/planavista/chores/importer.py
@@ -464,7 +464,7 @@ def plan_import(
             try:
                 build_member(by_id[member_id], changes, others)
             except MemberError as err:
-                problems.append({"item": person["name"], "code": err.code})
+                problems.append({"item": person["name"], "code": err.code, "of": "member"})
             members_update[member_id] = changes
             after = [dict(m, **changes) if m["id"] == member_id else m for m in after]
         else:
@@ -486,7 +486,7 @@ def plan_import(
             try:
                 record = build_member(None, changes, after)
             except MemberError as err:
-                problems.append({"item": person["name"], "code": err.code})
+                problems.append({"item": person["name"], "code": err.code, "of": "member"})
                 continue
             record["id"] = new_id
             members_add.append(record)
```

`custom_components/planavista/chores/engine.py`:

```diff
diff --git a/custom_components/planavista/chores/engine.py b/custom_components/planavista/chores/engine.py
index 7082f18..9e41bd8 100644
--- a/custom_components/planavista/chores/engine.py
+++ b/custom_components/planavista/chores/engine.py
@@ -18,6 +18,7 @@ import time as wall_time
 from typing import Any
 
 from .model import (
+    ACTIVITY_FIELDS,
     MAX_ACTIVITIES,
     MAX_REWARDS,
     ChoreError,
@@ -1509,6 +1510,68 @@ class ChoresEngine:
             if value and value != before.get(name) and _day(value) < today:
                 raise ChoreError("invalid_once", "Pick today or a later day.")
 
+    def apply_import(self, now: datetime, changes: Mapping[str, Any], *, by: str, source: str) -> Outcome:
+        """Save an import's chores, rewards, and rules together (spec 7.9).
+
+        `changes` comes from importer.plan_import. Everything is checked again
+        first, so a rule broken since the preview saves nothing. Imported chores
+        keep the planner's fields and where they came from; nothing is deleted.
+        """
+        members = set(self.member_ids())
+        activities = list(self.plan["activities"])
+        at = {a["id"]: i for i, a in enumerate(activities)}
+        updated: list[tuple[int, dict[str, Any]]] = []
+        for chore_id, update in changes["activities_update"].items():
+            if chore_id not in at:
+                raise ChoreError("unknown_chore")
+            existing = activities[at[chore_id]]
+            activity = build_activity(existing, update["changes"], members)
+            activity.update(update.get("extra") or {})
+            activity["rev"] = int(existing.get("rev", 1)) + 1
+            self._note_joined(activity, existing, now)
+            updated.append((at[chore_id], activity))
+        taken = set(at)
+        added: list[dict[str, Any]] = []
+        for record in changes["activities_add"]:
+            activity = build_activity(None, record, members)
+            activity.update({k: v for k, v in record.items() if k not in ACTIVITY_FIELDS and k not in ("rev", "assigned_since")})
+            if activity.get("id") in taken or not activity.get("id"):
+                activity["id"] = make_id(activity["name"], taken)
+            taken.add(activity["id"])
+            activity["rev"] = 1
+            activity.setdefault("created", {"by": by, "source": source, "at": self._stamp(now)})
+            added.append(activity)
+        if len(activities) + len(added) > MAX_ACTIVITIES:
+            raise ChoreError("too_many")
+        rewards = list(self.rewards["rewards"])
+        reward_at = {r["id"]: i for i, r in enumerate(rewards)}
+        new_rewards = []
+        for reward_id, update in changes.get("rewards_update", {}).items():
+            if reward_id not in reward_at:
+                raise ChoreError("unknown_reward")
+            rewards[reward_at[reward_id]] = build_reward(rewards[reward_at[reward_id]], update, members)
+        reward_taken = set(reward_at)
+        for record in changes.get("rewards_add", []):
+            reward = build_reward(None, record, members)
+            reward["id"] = record["id"] if record.get("id") and record["id"] not in reward_taken else make_id(
+                reward["name"], reward_taken
+            )
+            reward_taken.add(reward["id"])
+            new_rewards.append(reward)
+        if len(rewards) + len(new_rewards) > MAX_REWARDS:
+            raise ChoreError("too_many")
+        settings = build_settings(self.settings, changes["settings"]) if changes.get("settings") else None
+        for index, activity in updated:
+            activities[index] = activity
+        self.plan["activities"] = activities + added
+        out = Outcome("imported", {"added": len(added), "updated": len(updated)}, changed={"plan"})
+        if changes.get("rewards_update") or new_rewards:
+            self.rewards["rewards"] = rewards + new_rewards
+            out.changed.add("rewards")
+        if settings is not None:
+            out.merge(self.save_settings(now, settings))
+        return out
+
     def delete_activity(self, chore_id: str) -> Outcome:
         """Delete a chore: it leaves the board at once; past weeks and earned stars stay."""
         if self.activity(chore_id) is None:
```

`custom_components/planavista/household/members.py`:

```diff
diff --git a/custom_components/planavista/household/members.py b/custom_components/planavista/household/members.py
index 87f3b77..a5f2a93 100644
--- a/custom_components/planavista/household/members.py
+++ b/custom_components/planavista/household/members.py
@@ -285,13 +285,21 @@ def ordered(members: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
 
 
 def add_member(
-    members: list[dict[str, Any]], changes: Mapping[str, Any]
+    members: list[dict[str, Any]], changes: Mapping[str, Any], member_id: str | None = None
 ) -> tuple[list[dict[str, Any]], dict[str, Any]]:
-    """Add someone at the end; returns the new list and the new member."""
+    """Add someone at the end; returns the new list and the new member.
+
+    `member_id` keeps an id worked out beforehand (an import names people in
+    its chores before they are added); otherwise one is made from the name.
+    """
     if len(members) >= MAX_MEMBERS:
         raise MemberError("too_many")
     member = build_member(None, changes, members)
-    member["id"] = make_id(member["name"], (m["id"] for m in members))
+    taken = {m["id"] for m in members}
+    if member_id is not None and member_id not in taken and member_id not in RESERVED_IDS and slug(member_id) == member_id:
+        member["id"] = member_id
+    else:
+        member["id"] = make_id(member["name"], taken)
     member["order"] = max((int(m.get("order", 0)) for m in members), default=-1) + 1
     member["rev"] = 1
     return [*members, member], member
```

- [ ] **Step 4: Add the commands and the action.**

`custom_components/planavista/chores/websocket.py`:

```diff
diff --git a/custom_components/planavista/chores/websocket.py b/custom_components/planavista/chores/websocket.py
index c9eec4b..3aaa58b 100644
--- a/custom_components/planavista/chores/websocket.py
+++ b/custom_components/planavista/chores/websocket.py
@@ -17,11 +17,24 @@ from homeassistant.components import websocket_api
 from homeassistant.core import HomeAssistant, callback
 from homeassistant.helpers import config_validation as cv
 
+from homeassistant.util import dt as dt_util
+
+from ..const import CONF_CALENDARS, VERSION
+from ..coordinator import async_apply_config
+from ..household.members import MemberError, add_member, check_parent_pins, update_member
 from ..household.permissions import member_level
 from ..household.store import Household
-from ..household.websocket import account_for, parent_for, refuse, session_for
-from .access import message, source_of
+from ..household.websocket import (
+    ERROR_MESSAGES,
+    _screens_need_parent_pin,
+    account_for,
+    parent_for,
+    refuse,
+    session_for,
+)
+from .access import MESSAGES, message, source_of
 from .engine import ChoresEngine, Item, Outcome
+from .importer import FORMAT_HOUSEHOLD, ImportProblem, export_household, plan_import, preview, read_file
 from .model import ChoreError
 from .runtime import DATA_CHORES, STATE_NEEDS_A_LOOK, STATE_NEWER, STATE_OFF, ChoresRuntime, ChoresUnavailable
 
@@ -472,6 +485,156 @@ def ws_stars_history(hass: HomeAssistant, connection: websocket_api.ActiveConnec
     connection.send_result(msg["id"], {"balance": runtime.engine.balance(msg["member"]), "history": history})
 
 
+# Import, restore, and export (spec 7.9, 14.6, 15.5) ---------------------------------------------
+
+MAX_FILE_LENGTH = 2_000_000
+# What stops an import, item by item, in plain words.
+IMPORT_PROBLEMS = {
+    "name_required": "{item} has no name.",
+    "invalid_hours": "{item}: set how long it takes.",
+    "invalid_list": "{item} can't be read.",
+    "matched_twice": "{item} and {other} can't both be the same person.",
+    "age_group_required": "Pick an age group for {item}.",
+}
+
+
+def _problem_text(problem: dict[str, Any]) -> str:
+    code, item = problem["code"], problem["item"]
+    if code in IMPORT_PROBLEMS:
+        return IMPORT_PROBLEMS[code].format(item=item, other=problem.get("other", ""))
+    table = ERROR_MESSAGES if problem.get("of") == "member" else MESSAGES
+    text = problem.get("detail") or table.get(code) or "That can't be imported."
+    return f"{item}: {text}"
+
+
+def _problem(err: ImportProblem) -> dict[str, Any]:
+    return {"code": err.code, "message": err.message, "problems": [_problem_text(p) for p in err.problems]}
+
+
+@websocket_api.websocket_command({
+    vol.Required("type"): "planavista/import/preview",
+    vol.Required("text"): vol.All(str, vol.Length(max=MAX_FILE_LENGTH)),
+    SESSION: str,
+})
+@callback
+def ws_import_preview(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """Read a plan or a PlanaVista file and say where everything would go. Nothing is saved."""
+    runtime = _runtime(hass, connection, msg, ready=False)
+    if runtime is None or (context := parent_for(hass, connection, msg)) is None:
+        return
+    household, _by = context
+    try:
+        parsed = read_file(msg["text"])
+    except ImportProblem as err:
+        connection.send_result(msg["id"], {"problem": _problem(err)})
+        return
+    # Chores that need a look start over with a restore, so nothing is matched against them.
+    fresh = runtime.state == STATE_NEEDS_A_LOOK
+    engine = runtime.engine
+    result = preview(
+        parsed, household.members, [] if fresh else engine.plan["activities"], [] if fresh else engine.rewards["rewards"],
+    )
+    result["starts_over"] = fresh
+    connection.send_result(msg["id"], {"preview": result})
+
+
+@websocket_api.websocket_command({
+    vol.Required("type"): "planavista/import/apply",
+    vol.Required("text"): vol.All(str, vol.Length(max=MAX_FILE_LENGTH)),
+    vol.Optional("choices", default={}): dict,
+    SESSION: str,
+})
+@websocket_api.async_response
+async def ws_import_apply(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """Import what the preview showed, with the parent's choices: people first, then chores, rewards, and rules."""
+    runtime = _runtime(hass, connection, msg, ready=False)
+    if runtime is None or (context := parent_for(hass, connection, msg)) is None:
+        return
+    household, by = context
+    if runtime.state == STATE_NEWER:
+        code, text = STATE_MESSAGES[STATE_NEWER]
+        connection.send_error(msg["id"], code, text)
+        return
+    try:
+        parsed = read_file(msg["text"])
+    except ImportProblem as err:
+        connection.send_result(msg["id"], {"problem": _problem(err)})
+        return
+    if runtime.state == STATE_NEEDS_A_LOOK:
+        if parsed["format"] != FORMAT_HOUSEHOLD:
+            connection.send_error(
+                msg["id"], "chores_need_a_look", "Restore from a PlanaVista file, or start over, before importing a plan."
+            )
+            return
+        await runtime.async_start_over()
+    engine = runtime.engine
+    entry = runtime.entry
+    rows = list(entry.data.get(CONF_CALENDARS, [])) if entry is not None else []
+    try:
+        changes = plan_import(
+            parsed, msg["choices"], household.members, engine.plan["activities"], engine.rewards["rewards"],
+            engine.settings, persons={s.entity_id for s in hass.states.async_all("person")},
+            calendars={row["entity_id"] for row in rows},
+        )
+    except ImportProblem as err:
+        connection.send_result(msg["id"], {"problem": _problem(err)})
+        return
+    members = household.members
+    try:
+        for record in changes["members_add"]:
+            members, _ = add_member(members, record, member_id=record["id"])
+        for member_id, update in changes["members_update"].items():
+            members, _ = update_member(members, member_id, update, None)
+        check_parent_pins(
+            household.members, members, household.pins, household.pins, _screens_need_parent_pin(hass, household, connection)
+        )
+    except MemberError as err:
+        problem = ImportProblem(
+            "invalid_file", "This file has problems, so nothing was imported.",
+            [{"item": "People", "code": err.code, "of": "member"}],
+        )
+        connection.send_result(msg["id"], {"problem": _problem(problem)})
+        return
+    if members != household.members:
+        household.members = members
+        await household.async_save()
+    if not runtime.enabled:
+        await runtime.async_set_enabled(True)  # importing chores turns chores on
+    await runtime.async_sync_members()
+    source = _source(hass, household, connection)
+    out = await _apply(connection, msg, runtime, lambda e, now: e.apply_import(now, changes, by=by, source=source))
+    if out is None:
+        return
+    if changes["calendars"] and entry is not None:
+        linked = [
+            {**row, "member_id": changes["calendars"][row["entity_id"]]} if row["entity_id"] in changes["calendars"] else row
+            for row in rows
+        ]
+        await async_apply_config(hass, entry, {**entry.data, CONF_CALENDARS: linked})
+    connection.send_result(msg["id"], {"summary": changes["summary"]})
+
+
+@websocket_api.websocket_command({vol.Required("type"): "planavista/export", SESSION: str})
+@callback
+def ws_export(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """The household as a PlanaVista file: people, chores, rewards, and rules (never PINs, stars, or history)."""
+    runtime = _runtime(hass, connection, msg, ready=False)
+    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
+        return
+    household, _by = context
+    if runtime.state in (STATE_NEEDS_A_LOOK, STATE_NEWER):
+        code, text = STATE_MESSAGES[runtime.state]
+        connection.send_error(msg["id"], code, text)
+        return
+    rows = runtime.entry.data.get(CONF_CALENDARS, []) if runtime.entry is not None else []
+    now = dt_util.now()
+    file = export_household(
+        household.members, rows, runtime.engine.plan, runtime.engine.rewards,
+        version=VERSION, exported=now.isoformat(timespec="seconds"),
+    )
+    connection.send_result(msg["id"], {"file": file, "name": f"planavista-household-{now.date().isoformat()}.json"})
+
+
 CHORES_COMMANDS = (
     ws_chores_subscribe,
     ws_chores_week,
@@ -493,6 +656,9 @@ CHORES_COMMANDS = (
     ws_reward_redeem,
     ws_stars_award,
     ws_stars_history,
+    ws_import_preview,
+    ws_import_apply,
+    ws_export,
 )
 
 
```

`custom_components/planavista/chores/services.py`:

```diff
diff --git a/custom_components/planavista/chores/services.py b/custom_components/planavista/chores/services.py
index bfd53fa..f7aefa0 100644
--- a/custom_components/planavista/chores/services.py
+++ b/custom_components/planavista/chores/services.py
@@ -18,10 +18,13 @@ from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, Supp
 from homeassistant.exceptions import ServiceValidationError
 from homeassistant.helpers import config_validation as cv
 
-from ..const import DOMAIN
+from homeassistant.util import dt as dt_util
+
+from ..const import CONF_CALENDARS, DOMAIN, VERSION
 from ..household.permissions import Account
-from .access import async_account, member_by, parent_by, resolve_member, service_error, source_of
+from .access import async_account, member_by, not_allowed, parent_by, resolve_member, service_error, source_of
 from .engine import ChoresEngine, Outcome, with_away, without_away
+from .importer import export_household
 from .model import ChoreError
 from .occurrences import parse_key
 from .runtime import DATA_CHORES, ChoresRuntime
@@ -92,6 +95,7 @@ AWARD_STARS_SCHEMA = vol.Schema({
     vol.Required("stars"): vol.Coerce(int),
     vol.Required("reason"): cv.string,
 })
+EXPORT_HOUSEHOLD_SCHEMA = vol.Schema({})
 
 
 def _runtime(hass: HomeAssistant) -> ChoresRuntime:
@@ -305,6 +309,17 @@ async def _award_stars(call: ServiceCall) -> ServiceResponse:
     return {"balance": out.data["balance"]}
 
 
+async def _export_household(call: ServiceCall) -> ServiceResponse:
+    runtime, account = await _caller(call)
+    if account.kind not in ("automation", "admin"):
+        raise not_allowed()
+    rows = runtime.entry.data.get(CONF_CALENDARS, []) if runtime.entry is not None else []
+    return export_household(
+        runtime.household.members, rows, runtime.engine.plan, runtime.engine.rewards,
+        version=VERSION, exported=dt_util.now().isoformat(timespec="seconds"),
+    )
+
+
 SERVICES: dict[str, tuple[Callable[[ServiceCall], Awaitable[ServiceResponse]], vol.Schema, SupportsResponse]] = {
     "complete_chore": (_complete_chore, COMPLETE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
     "undo_chore": (_undo_chore, UNDO_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
@@ -318,6 +333,7 @@ SERVICES: dict[str, tuple[Callable[[ServiceCall], Awaitable[ServiceResponse]], v
     "pause_member": (_pause_member, PAUSE_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
     "resume_member": (_resume_member, RESUME_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
     "award_stars": (_award_stars, AWARD_STARS_SCHEMA, SupportsResponse.OPTIONAL),
+    "export_household": (_export_household, EXPORT_HOUSEHOLD_SCHEMA, SupportsResponse.ONLY),
 }
 
 
```

`custom_components/planavista/services.yaml`:

```diff
diff --git a/custom_components/planavista/services.yaml b/custom_components/planavista/services.yaml
index a1abdb7..2e321ed 100644
--- a/custom_components/planavista/services.yaml
+++ b/custom_components/planavista/services.yaml
@@ -470,3 +470,11 @@ award_stars:
       example: Helped a neighbor
       selector:
         text:
+
+export_household:
+  name: Export household
+  description: >-
+    The household as a PlanaVista file (planavista.household/v1): people, chores, rewards, and rules.
+    PINs, stars, history, and shared screens are left out; Home Assistant backups keep those.
+    For an admin or an automation; the file comes back as the action's response.
+  fields: {}
```

- [ ] **Step 5: Run them again.** Same command. Expected: `9 passed`.
- [ ] **Step 6: Run the whole backend suite.** Expected: `1009 passed` (`test_metadata` finds `fields` for the new action); the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(chores): import, export, and restore over WebSocket, and the export_household action` with the trailers.

---

### Task 4: Phone notifications with buttons, and phone reminders

Spec 10.5 (Waiting for OK on parents' phones, with buttons; answered requests cleared; stale buttons), 9.9 (reminders at the evening check, only when chores are left), and 15.4 (a phone Home Assistant no longer has: requests fall back to the screen, logged once, listed under Needs a look).

**Files:**
- Create: `custom_components/planavista/chores/notify.py`
- Modify: `custom_components/planavista/chores/runtime.py`, `custom_components/planavista/chores/status.py`, `custom_components/planavista/chores/sensor.py`
- Test: `tests/test_chores_notify.py`, `tests/test_chores_websocket.py`

**Interfaces:**
- Consumes: Task 1's `phones` and `notify`.
- Produces: `ChoresNotifier(hass, runtime)` (`async_start`, `async_stop`, `problems() -> [{member, phone}]`), `clock_text(at, time_format)`, `request_text(request, names)`, `BUTTONS`, `ACTION_PREFIX`, `TAG_PREFIX`, `REMINDER_TAG`; `status.left_today(view)` (moved from `sensor.py`); runtime `notifier` and feed `notify_problems`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_notify.py` (new):

```python
"""Phone notifications with buttons and evening reminders (spec 10.5, 15.4, 15.5)."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser, async_fire_time_changed, async_mock_service

from homeassistant.core import Context, HomeAssistant, ServiceCall

from custom_components.planavista.chores.notify import clock_text, request_text

EVENT = "mobile_app_notification_action"


async def _phones(hass: HomeAssistant, chores: Any, phones: dict[str, list[str]], **notify: dict[str, bool]) -> None:
    household = chores.household
    household.members = [
        {**m, "phones": phones.get(m["id"], []), "notify": {"requests": True, "reminders": False, **notify.get(m["id"], {})}}
        for m in household.members
    ]
    await household.async_save()
    chores.notifier.async_start()
    await hass.async_block_till_done()


def _service(hass: HomeAssistant, name: str) -> list[ServiceCall]:
    return async_mock_service(hass, "notify", name)


async def _dana_feeds_the_fish(hass: HomeAssistant, chores: Any) -> str:
    await chores.async_run(lambda e, now: e.complete(now, chore="feed_the_fish", member="dana", by="dana", source="tablet"))
    await hass.async_block_till_done()
    (request,) = chores.engine.open_requests()
    return request["id"]


def _actions(call: ServiceCall) -> tuple[str, str]:
    allow, decline = call.data["data"]["actions"]
    return allow["action"], decline["action"]


def test_what_a_request_says() -> None:
    names = {"casey": "Casey", "dana": "Dana"}
    assert request_text({"kind": "completion", "member": "dana", "done_by": "dana", "name": "Feed the fish", "stars": 1}, names) == (
        "Dana finished Feed the fish (1 star)."
    )
    assert request_text({"kind": "completion", "member": "dana", "done_by": "casey", "name": "Tidy toys", "stars": 2}, names) == (
        "Casey did Tidy toys for Dana (2 stars)."
    )
    assert request_text({"kind": "more_time", "member": "casey", "name": "Yard work", "until": "2026-10-18"}, names) == (
        "Casey asks for more time on Yard work, until 2026-10-18."
    )
    assert request_text({"kind": "skip", "member": "casey", "name": "Yard work"}, names) == "Casey asks to skip Yard work this week."
    assert request_text({"kind": "redemption", "member": "casey", "name": "Movie night pick", "cost": 40}, names) == (
        "Casey wants Movie night pick (40 stars)."
    )
    assert (clock_text("19:00", "12h"), clock_text("07:30", "12h"), clock_text("19:00", "24h")) == ("7:00 PM", "7:30 AM", "19:00")


async def test_a_request_goes_to_every_parents_phone_with_buttons(hass: HomeAssistant, chores: Any) -> None:
    alex, blair = _service(hass, "mobile_app_alex_phone"), _service(hass, "mobile_app_blair_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"], "blair": ["notify.mobile_app_blair_phone"],
                                 "casey": ["notify.mobile_app_caseys_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    assert len(alex) == len(blair) == 1
    data = alex[0].data
    assert (data["title"], data["message"]) == ("Waiting for OK", "Dana finished Feed the fish (1 star).")
    assert data["data"]["tag"] == f"planavista-{request_id}"
    allow, decline = data["data"]["actions"]
    assert allow["title"] == "Looks good" and allow["action"].startswith(f"PLANAVISTA_ALLOW_{request_id}_")
    assert decline["title"] == "Send back" and decline["behavior"] == "textInput"
    assert _actions(blair[0]) == _actions(alex[0])  # one token for the request, on every phone


async def test_looks_good_on_a_parents_phone_approves_and_clears_every_copy(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    alex, blair = _service(hass, "mobile_app_alex_phone"), _service(hass, "mobile_app_blair_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"], "blair": ["notify.mobile_app_blair_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    allow, _ = _actions(alex[0])
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    completion = next(c for c in chores.engine.log["completions"] if c["id"] == request_id)
    assert (completion["state"], completion["review"]["by"]) == ("done", "alex")
    clears = [c.data for c in (*alex, *blair) if c.data.get("message") == "clear_notification"]
    assert clears == [{"message": "clear_notification", "data": {"tag": f"planavista-{request_id}"}}] * 2
    # The same button again is stale: ignored, and its notification cleared.
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert completion["state"] == "done"


async def test_send_back_takes_the_typed_reason(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    _, decline = _actions(alex[0])
    hass.bus.async_fire(EVENT, {"action": decline, "reply_text": " Some food fell on the floor "},
                        context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    completion = next(c for c in chores.engine.log["completions"] if c["id"] == request_id)
    assert (completion["state"], completion["review"]["note"]) == ("sent_back", "Some food fell on the floor")


async def test_a_button_needs_a_parents_account_and_the_notifications_token(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    allow, _ = _actions(alex[0])
    forged = f"PLANAVISTA_ALLOW_{request_id}_0000000000000000"
    hass.bus.async_fire(EVENT, {"action": forged}, context=Context(user_id=accounts["alex"].id))
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["casey"].id))
    hass.bus.async_fire(EVENT, {"action": allow})
    hass.bus.async_fire(EVENT, {"action": "SOMETHING_ELSE"}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert [r["id"] for r in chores.engine.open_requests()] == [request_id]
    # The forged token changed nothing, and the real button still works.
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert chores.engine.open_requests() == []


async def test_answering_on_the_screen_clears_the_phones(hass: HomeAssistant, chores: Any) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    await chores.async_run(lambda e, now: e.review(now, request_id=request_id, allow=True, by="blair", source="tablet"))
    await hass.async_block_till_done()
    assert alex[-1].data == {"message": "clear_notification", "data": {"tag": f"planavista-{request_id}"}}


async def test_requests_waiting_before_a_restart_are_not_sent_again(hass: HomeAssistant, chores: Any) -> None:
    await _dana_feeds_the_fish(hass, chores)
    chores.notifier.async_stop()
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    chores.async_notify()
    await hass.async_block_till_done()
    assert alex == []


async def test_without_phones_requests_wait_on_the_screen(hass: HomeAssistant, chores: Any) -> None:
    await _phones(hass, chores, {})
    await _dana_feeds_the_fish(hass, chores)
    assert len(chores.feed()["board"]["requests"]) == 1


async def test_a_phone_home_assistant_lost_is_logged_once_and_needs_a_look(
    hass: HomeAssistant, chores: Any, caplog: pytest.LogCaptureFixture
) -> None:
    await _phones(hass, chores, {"alex": ["notify.mobile_app_gone"]})
    with caplog.at_level(logging.WARNING):
        await _dana_feeds_the_fish(hass, chores)
        await chores.async_run(lambda e, now: e.complete(now, chore="tidy_toys", member="dana", by="dana", source="tablet"))
        await hass.async_block_till_done()
    assert chores.feed()["notify_problems"] == [{"member": "alex", "phone": "notify.mobile_app_gone"}]
    assert sum(r.levelno == logging.WARNING and "notify.mobile_app_gone" in r.message for r in caplog.records) == 1
    _service(hass, "mobile_app_gone")
    await chores.async_run(lambda e, now: e.complete(now, chore="make_your_bed", member="dana", by="dana", source="tablet"))
    await hass.async_block_till_done()
    assert chores.feed()["notify_problems"] == []


async def test_the_evening_reminder_goes_to_people_with_chores_left(
    hass: HomeAssistant, chores: Any, freezer: Any
) -> None:
    casey, alex = _service(hass, "mobile_app_caseys_phone"), _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"casey": ["notify.mobile_app_caseys_phone"], "alex": ["notify.mobile_app_alex_phone"]},
                  casey={"reminders": True}, alex={"reminders": True})
    await chores.async_run(lambda e, now: e.complete(now, chore="kitchen_cleanup", member="alex", by="alex", source="tablet"))
    await chores.async_run(lambda e, now: e.complete(now, key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet"))
    seven = datetime.fromisoformat("2026-10-13T19:00:00-05:00")
    freezer.move_to(seven)
    async_fire_time_changed(hass, seven)
    await hass.async_block_till_done()
    reminders = [c.data for c in casey if c.data.get("title") == "Chores"]
    assert reminders == [{"title": "Chores", "message": "7:00 PM: 2 chores left",
                          "data": {"tag": "planavista-reminder", "group": "planavista"}}]
    assert [c for c in alex if c.data.get("title") == "Chores"] == []  # nothing left for Alex today


async def test_no_evening_check_means_no_reminders(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    casey = _service(hass, "mobile_app_caseys_phone")
    await chores.async_run(lambda e, now: e.save_settings(now, {"evening_check": None}))
    await _phones(hass, chores, {"casey": ["notify.mobile_app_caseys_phone"]}, casey={"reminders": True})
    seven = datetime.fromisoformat("2026-10-13T19:00:00-05:00")
    freezer.move_to(seven)
    async_fire_time_changed(hass, seven)
    await hass.async_block_till_done()
    assert casey == []
```

`tests/test_chores_websocket.py`:

```diff
diff --git a/tests/test_chores_websocket.py b/tests/test_chores_websocket.py
index 450407e..fa6adb3 100644
--- a/tests/test_chores_websocket.py
+++ b/tests/test_chores_websocket.py
@@ -53,7 +53,7 @@ async def test_subscribe_says_when_chores_are_off(hass: HomeAssistant, household
     client = await hass_ws_client(hass)
     await client.send_json_auto_id({"type": "planavista/chores/subscribe"})
     assert (await client.receive_json())["success"]
-    assert (await client.receive_json())["event"] == {"state": "off", "save_failed": False, "board": None}
+    assert (await client.receive_json())["event"] == {"state": "off", "save_failed": False, "board": None, "notify_problems": []}
     reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": TRASH})
     assert reply["error"]["code"] == "chores_off"
 
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_notify.py tests/test_chores_websocket.py -q` Expected: FAIL: collection of `test_chores_notify.py` stops with `ModuleNotFoundError: No module named 'custom_components.planavista.chores.notify'`, and the feed has no `notify_problems`.

- [ ] **Step 3: Move today's open chores to the status words, and write the notifier.**

`custom_components/planavista/chores/status.py`:

```diff
diff --git a/custom_components/planavista/chores/status.py b/custom_components/planavista/chores/status.py
index 0c3f934..3e41f70 100644
--- a/custom_components/planavista/chores/status.py
+++ b/custom_components/planavista/chores/status.py
@@ -43,3 +43,11 @@ def describe(view: Mapping[str, Any], today: date) -> str | None:
     if view.get("section") == "week":
         return "This month" if view.get("window") == "month" else "This week"
     return None
+
+
+OPEN = ("open", "sent_back")
+
+
+def left_today(view: dict[str, Any]) -> list[dict[str, Any]]:
+    """Items still due today: in today's ring and not done or waiting for OK."""
+    return [i for i in view["items"] if i["counted"] and i["status"] in OPEN]
```

`custom_components/planavista/chores/sensor.py`:

```diff
diff --git a/custom_components/planavista/chores/sensor.py b/custom_components/planavista/chores/sensor.py
index a9ffafc..302fed1 100644
--- a/custom_components/planavista/chores/sensor.py
+++ b/custom_components/planavista/chores/sensor.py
@@ -20,14 +20,9 @@ from homeassistant.helpers.typing import StateType
 from ..coordinator import PlanaVistaConfigEntry
 from .entity import ChoresEntity
 from .runtime import DATA_CHORES, ChoresRuntime
+from .status import left_today
 
 MAX_ITEMS = 20
-OPEN = ("open", "sent_back")
-
-
-def left_today(view: dict[str, Any]) -> list[dict[str, Any]]:
-    """Items still due today: in today's ring and not done or waiting for OK."""
-    return [i for i in view["items"] if i["counted"] and i["status"] in OPEN]
 
 
 @dataclass(frozen=True, kw_only=True)
```

`custom_components/planavista/chores/notify.py` (new):

```python
"""Phone notifications: Waiting for OK requests with buttons, and evening reminders (spec 10.5, 15.4, 15.5).

Requests go to each parent's phones (the Phone row on their page) through the
legacy notify.mobile_app_* services, because notify entities can't carry
buttons. A button counts only when the event's user is linked to a parent and
the action carries that notification's one-time token: any registered phone
can fire any event through its webhook, so both checks are needed. Once a
request is answered anywhere, every copy is cleared by its tag. Tokens live in
memory, so buttons from before a restart are stale: they are ignored and the
notification is cleared, while the request still waits on the screen.

Reminders go at the evening check time to people with a phone and reminders
on, and only when chores are left. A phone Home Assistant no longer has is
logged once and listed under Needs a look; requests then show on the screen.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
import logging
import secrets
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import dt as dt_util

from ..const import CONF_DISPLAY
from .model import ChoreError
from .periods import parse_clock
from .status import left_today

if TYPE_CHECKING:
    from .runtime import ChoresRuntime

_LOGGER = logging.getLogger(__name__)

EVENT_ACTION = "mobile_app_notification_action"
ACTION_PREFIX = "PLANAVISTA"
ALLOW, DECLINE = "ALLOW", "DECLINE"
TAG_PREFIX = "planavista-"
REMINDER_TAG = "planavista-reminder"

# Button titles per kind of request (spec 10.5).
BUTTONS = {
    "completion": ("Looks good", "Send back"),
    "more_time": ("Allow", "Not this time"),
    "skip": ("Allow", "Not this time"),
    "redemption": ("Approve", "Decline"),
}


@dataclass
class _Sent:
    """One request's notifications: its token and the phones that got it."""

    token: str
    phones: set[str] = field(default_factory=set)


def clock_text(at: str, time_format: str) -> str:
    """19:00 as 7:00 PM (or 19:00 on a 24-hour calendar)."""
    clock = parse_clock(at)
    if clock is None:
        return at
    if time_format == "24h":
        return f"{clock.hour:02d}:{clock.minute:02d}"
    hour = clock.hour % 12 or 12
    return f"{hour}:{clock.minute:02d} {'AM' if clock.hour < 12 else 'PM'}"


def request_text(request: dict[str, Any], names: dict[str, str]) -> str:
    """What a request's notification says, such as "Dana finished Feed the fish (1 star)"."""
    member = names.get(request["member"], request["member"])
    kind = request["kind"]
    if kind == "completion":
        doer = names.get(request.get("done_by") or request["member"], member)
        stars = int(request.get("stars") or 0)
        worth = f" ({stars} star{'s' if stars != 1 else ''})" if stars else ""
        if doer != member:
            return f"{doer} did {request['name']} for {member}{worth}."
        return f"{member} finished {request['name']}{worth}."
    if kind == "more_time":
        until = request.get("until")
        return f"{member} asks for more time on {request['name']}" + (f", until {until}." if until else ".")
    if kind == "skip":
        return f"{member} asks to skip {request['name']} this week."
    cost = int(request.get("cost") or 0)
    return f"{member} wants {request['name']} ({cost} stars)."


class ChoresNotifier:
    """Sends requests to parents' phones, answers their buttons, and sends evening reminders."""

    def __init__(self, hass: HomeAssistant, runtime: ChoresRuntime) -> None:
        """Belong to one chores runtime."""
        self.hass = hass
        self.runtime = runtime
        self._sent: dict[str, _Sent] = {}
        self._known: set[str] | None = None
        self._missing: dict[str, str] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._reminder: CALLBACK_TYPE | None = None
        self._reminder_at: str | None = None

    # Starting and stopping --------------------------------------------------------------------

    @callback
    def async_start(self) -> None:
        """Requests already waiting were sent before a restart; only new ones are sent."""
        if self._unsubs:
            return
        self._known = {r["id"] for r in self._open_requests()}
        self._unsubs.append(self.runtime.async_listen(self._on_change))
        self._unsubs.append(self.hass.bus.async_listen(EVENT_ACTION, self._on_action))
        self._schedule_reminder()

    @callback
    def async_stop(self) -> None:
        """Stop listening and forget the timer."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._reminder is not None:
            self._reminder()
            self._reminder = None
        self._reminder_at = None

    def problems(self) -> list[dict[str, str]]:
        """Phones Home Assistant doesn't have anymore (Needs a look)."""
        return [{"member": member, "phone": phone} for phone, member in sorted(self._missing.items())]

    # Requests ---------------------------------------------------------------------------------

    def _open_requests(self) -> list[dict[str, Any]]:
        return self.runtime.engine.open_requests() if self.runtime.available else []

    @callback
    def _on_change(self) -> None:
        """After every change: send new requests, clear answered ones, keep the reminder's time."""
        if self._reminder_at != self._evening_check():
            self._schedule_reminder()
        if not self.runtime.available:
            return
        requests = {r["id"]: r for r in self._open_requests()}
        known = self._known if self._known is not None else set()
        for request_id in requests.keys() - known:
            self.hass.async_create_task(self._async_send(requests[request_id]), eager_start=True)
        for request_id in known - requests.keys():
            self.hass.async_create_task(self._async_clear(request_id), eager_start=True)
        self._known = set(requests)

    def _parents_to_ask(self) -> list[dict[str, Any]]:
        return [
            m for m in self.runtime.household.members
            if m.get("parent") and m.get("phones") and (m.get("notify") or {}).get("requests", True)
        ]

    def _reachable(self, phone: str, member_id: str) -> str | None:
        """The notify service of a phone Home Assistant has, or None (logged once)."""
        domain, _, service = phone.partition(".")
        if domain == "notify" and self.hass.services.has_service("notify", service):
            self._missing.pop(phone, None)
            return service
        if phone not in self._missing:
            _LOGGER.warning("PlanaVista can't reach %s; requests show on the screen until it's back", phone)
            self._missing[phone] = member_id
            self.runtime.async_notify()
        return None

    async def _async_send(self, request: dict[str, Any]) -> None:
        parents = self._parents_to_ask()
        if not parents:
            return
        names = {m["id"]: m["name"] for m in self.runtime.household.members}
        token = secrets.token_hex(8)
        allow, decline = BUTTONS.get(request["kind"], BUTTONS["completion"])
        stem = f"{ACTION_PREFIX}_{{}}_{request['id']}_{token}"
        send_back: dict[str, Any] = {"action": stem.format(DECLINE), "title": decline}
        if request["kind"] == "completion":
            # A typed reason where the phone offers it (spec 10.5).
            send_back.update(behavior="textInput", textInputButtonTitle=decline, textInputPlaceholder="What to fix")
        data = {
            "title": "Waiting for OK",
            "message": request_text(request, names),
            "data": {
                "tag": f"{TAG_PREFIX}{request['id']}",
                "group": "planavista",
                "actions": [{"action": stem.format(ALLOW), "title": allow}, send_back],
            },
        }
        sent = _Sent(token)
        for parent in parents:
            for phone in parent["phones"]:
                service = self._reachable(phone, parent["id"])
                if service is None:
                    continue
                await self.hass.services.async_call("notify", service, data)
                sent.phones.add(phone)
        if sent.phones:
            self._sent[request["id"]] = sent

    async def _async_clear(self, request_id: str, phones: set[str] | None = None) -> None:
        """Take a request's notifications off every phone that got them."""
        sent = self._sent.pop(request_id, None)
        targets = phones if phones is not None else (sent.phones if sent else set())
        for phone in targets:
            domain, _, service = phone.partition(".")
            if domain == "notify" and self.hass.services.has_service("notify", service):
                await self.hass.services.async_call(
                    "notify", service, {"message": "clear_notification", "data": {"tag": f"{TAG_PREFIX}{request_id}"}}
                )

    def _parent_of(self, user_id: str | None) -> str | None:
        """The parent whose Home Assistant person belongs to this user."""
        if not user_id:
            return None
        for member in self.runtime.household.members:
            person = member.get("person")
            state = self.hass.states.get(person) if member.get("parent") and person else None
            if state is not None and state.attributes.get("user_id") == user_id:
                return member["id"]
        return None

    async def _on_action(self, event: Event) -> None:
        action = event.data.get("action")
        if not isinstance(action, str) or not action.startswith(f"{ACTION_PREFIX}_"):
            return
        parts = action.split("_")
        if len(parts) != 4 or parts[1] not in (ALLOW, DECLINE):
            return
        _prefix, decision, request_id, token = parts
        sent = self._sent.get(request_id)
        if sent is None:
            # A stale button: answered already, used, or sent before a restart. Its notification goes.
            _LOGGER.debug("Ignored a stale PlanaVista notification button for %s", request_id)
            await self._async_clear(request_id, self._all_parent_phones())
            return
        if not secrets.compare_digest(sent.token, token):
            _LOGGER.debug("Ignored a PlanaVista notification button with the wrong token")
            return  # forged: the real buttons keep working
        parent = self._parent_of(event.context.user_id)
        if parent is None:
            _LOGGER.debug("Ignored a PlanaVista notification button from someone who isn't a parent")
            return
        reply = event.data.get("reply_text")
        note = reply.strip()[:200] if isinstance(reply, str) and reply.strip() else None
        self._sent.pop(request_id, None)  # each token works once
        try:
            await self.runtime.async_run(lambda e, now: e.review(
                now, request_id=request_id, allow=decision == ALLOW, by=parent, source="notification", note=note,
            ))
        except (ChoreError, ValueError) as err:
            _LOGGER.debug("A PlanaVista notification button came too late: %s", err)
        await self._async_clear(request_id, sent.phones)

    def _all_parent_phones(self) -> set[str]:
        return {phone for m in self.runtime.household.members if m.get("parent") for phone in m.get("phones") or []}

    # Reminders --------------------------------------------------------------------------------

    def _evening_check(self) -> str | None:
        return self.runtime.engine.settings.get("evening_check") if self.runtime.available else None

    @callback
    def _schedule_reminder(self) -> None:
        if self._reminder is not None:
            self._reminder()
            self._reminder = None
        at = self._evening_check()
        self._reminder_at = at
        clock = parse_clock(at) if at else None
        if clock is None:
            return
        now = dt_util.now()
        when = now.replace(hour=clock.hour, minute=clock.minute, second=0, microsecond=0)
        if when <= now:
            when = (now + timedelta(days=1)).replace(hour=clock.hour, minute=clock.minute, second=0, microsecond=0)
        self._reminder = async_track_point_in_utc_time(self.hass, self._on_reminder, when.astimezone(UTC))

    async def _on_reminder(self, _now: datetime) -> None:
        self._reminder = None
        at = self._evening_check()
        if at and self.runtime.available:
            await self._async_remind(at)
        self._schedule_reminder()

    async def _async_remind(self, at: str) -> None:
        """Remind each person with reminders on who still has chores today (spec 10.5)."""
        entry = self.runtime.entry
        time_format = ((entry.data.get(CONF_DISPLAY) or {}).get("time_format") if entry else None) or "12h"
        for member in self.runtime.household.members:
            if not member.get("phones") or not (member.get("notify") or {}).get("reminders"):
                continue
            view = self.runtime.member_view(member["id"])
            left = left_today(view) if view else []
            if not left:
                continue
            count = f"{len(left)} chore{'s' if len(left) != 1 else ''} left"
            data = {
                "title": "Chores",
                "message": f"{clock_text(at, time_format)}: {count}",
                "data": {"tag": REMINDER_TAG, "group": "planavista"},
            }
            for phone in member["phones"]:
                service = self._reachable(phone, member["id"])
                if service is not None:
                    await self.hass.services.async_call("notify", service, data)
```

`custom_components/planavista/chores/runtime.py`:

```diff
diff --git a/custom_components/planavista/chores/runtime.py b/custom_components/planavista/chores/runtime.py
index 2d7d112..f428fb5 100644
--- a/custom_components/planavista/chores/runtime.py
+++ b/custom_components/planavista/chores/runtime.py
@@ -32,6 +32,7 @@ from ..const import CONF_DISPLAY, CONF_FIRST_DAY, DOMAIN, SIGNAL_CONFIG_APPLIED
 from ..household.store import Household
 from .engine import ChoreEvent, ChoresEngine, Item, Outcome
 from .model import default_log, default_plan, default_rewards
+from .notify import ChoresNotifier
 from .store import NORMALIZERS, STORE_KEYS, ChoresStores
 
 if TYPE_CHECKING:
@@ -112,6 +113,7 @@ class ChoresRuntime:
         self._boundary: CALLBACK_TYPE | None = None
         self._log_save: CALLBACK_TYPE | None = None
         self._started = False
+        self.notifier = ChoresNotifier(hass, self)
 
     # State ------------------------------------------------------------------------
 
@@ -180,6 +182,7 @@ class ChoresRuntime:
             "state": self.state,
             "save_failed": self.save_failed,
             "board": self.board() if self.available else None,
+            "notify_problems": self.notifier.problems(),
         }
 
     @callback
@@ -303,11 +306,13 @@ class ChoresRuntime:
                 self._schedule_log_save()
             await self.async_apply(self.engine.catch_up(self.now()))
         self._schedule_boundary()
+        self.notifier.async_start()
 
     @callback
     def async_stop(self) -> None:
         """The entry unloaded: stop every timer and listener."""
         self._started = False
+        self.notifier.async_stop()
         for unsub in self._unsubs:
             unsub()
         self._unsubs.clear()
```

- [ ] **Step 4: Run them again.** Same command. Expected: `25 passed`.
- [ ] **Step 5: Run the whole backend suite.** Expected: `1020 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(chores): phone notifications with buttons, and phone reminders` with the trailers.

---

### Task 5: Chores pages in Settings, and the Chores list

Spec 14.1 (one Settings: the Chores group), 14.3 (the Chores list: by person or by chore, with each one's worth and rhythm), 8.3 and 16 (the credit each check-off earns, checked against one table by both sides), and 14.4's `pv-recurrence-picker` groundwork (reading the RRULE subset). Settings and setup pages get the card's module services; a page can ask for a module's view.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/worth.ts`, `custom_components/planavista/frontend/src/core/recurrence.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`
- Modify: `custom_components/planavista/frontend/src/core/settings-registry.ts`, `custom_components/planavista/frontend/src/core/page-host.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `tests/fixtures/chores_worth.json`, `tests/test_chores_worth.py`, `custom_components/planavista/frontend/test/chores-worth.test.ts`, `custom_components/planavista/frontend/test/recurrence.test.ts`, `custom_components/planavista/frontend/test/chores-list-derive.test.ts`, `custom_components/planavista/frontend/test/chores-settings.test.ts`

**Interfaces:**
- Consumes: milestone 5's `ChoresService` (`board()`), `Activity`, `ChoresSettings`.
- Produces: `SettingsContext.services`, `SetupContext.services`; `OPEN_TARGET` (`pv-page-open`), `pv-settings-open-target`; `checkoffMinutes`, `checkoffStars` (the credit and stars one check-off earns); `Freq`, `Weekday`, `WEEKDAYS`, `Rule`, `parseRule(rrule)`, `ruleText(rule, start)`, `weekdaysText`, `ordinal`, `shortDate`, `longDate`; `settingsBoard(ctx)`, `choresSettingsPages`, `registerChoresSettings(settings, ...)`; `ChoreRow`, `ChoreList`, `RhythmGroup`, `GROUP_LABELS`, `choreRow`, `choresList`, `groupOf`, `onTheBoard`, `planOnly`, `rhythmText`, `dayText`, `clockText`, `durationText`; `choresSettingsStyles`; the element `pv-chores-list-page`.

- [ ] **Step 1: Write the shared worth table and the failing tests.**

`tests/fixtures/chores_worth.json` (new):

```json
{
  "description": "What one check-off is worth in minutes, per assignee (spec 8.2, 14.4). The engine's occurrences and the card's worth line are both checked against this table.",
  "cases": [
    {"name": "every day, once", "minutes": {"alex": 30},
     "activity": {"id": "kitchen_cleanup", "name": "Kitchen cleanup", "schedule": "plan", "assignees": ["alex"],
                  "minimum": {"hours": 0.5, "per": "day"}}},
    {"name": "every day, twice", "minutes": {"casey": 15},
     "activity": {"id": "cat_care", "name": "Cat care", "schedule": "plan", "assignees": ["casey"],
                  "minimum": {"hours": 0.5, "per": "day"}, "times": 2, "time_of_day": ["morning", "evening"]}},
    {"name": "every day, each does it all", "minutes": {"casey": 10, "dana": 10},
     "activity": {"id": "tidy_up", "name": "Tidy up", "schedule": "plan", "assignees": ["casey", "dana"],
                  "minimum": {"hours": 0.1666666667, "per": "day"}, "split": "each"}},
    {"name": "a week on two days", "minutes": {"blair": 60},
     "activity": {"id": "laundry", "name": "Laundry", "schedule": "plan", "assignees": ["blair"],
                  "minimum": {"hours": 2, "per": "week"}, "days": ["mon", "thu"]}},
    {"name": "a week, split unevenly, any day", "minutes": {"blair": 90, "casey": 30},
     "activity": {"id": "clean_the_bathroom", "name": "Clean the bathroom", "schedule": "plan",
                  "assignees": ["blair", "casey"], "minimum": {"hours": 2, "per": "week"}, "split": "shared",
                  "shares": {"blair": 1.5, "casey": 0.5}}},
    {"name": "a week on two days, twice each", "minutes": {"casey": 15},
     "activity": {"id": "take_out_the_trash", "name": "Take out the trash", "schedule": "plan", "assignees": ["casey"],
                  "minimum": {"hours": 1, "per": "week"}, "days": ["tue", "fri"], "times": 2}},
    {"name": "a week, three check-offs any day", "minutes": {"casey": 20},
     "activity": {"id": "yard_work", "name": "Yard work", "schedule": "plan", "assignees": ["casey"],
                  "minimum": {"hours": 1, "per": "week"}, "times": 3}},
    {"name": "one time, two sessions", "minutes": {"casey": 120},
     "activity": {"id": "clean_out_the_garage", "name": "Clean out the garage", "schedule": "once", "assignees": ["casey"],
                  "once": {"by": "2026-10-18", "sessions": 2, "estimate_minutes": 240}}},
    {"name": "repeats, each time", "minutes": {"alex": 45, "casey": 45},
     "activity": {"id": "rake_the_leaves", "name": "Rake the leaves", "schedule": "repeats", "assignees": ["alex", "casey"],
                  "repeats": {"rrule": "FREQ=WEEKLY;BYDAY=SA", "start": "2026-10-17", "window": "day", "estimate_minutes": 45}}}
  ]
}
```

`tests/test_chores_worth.py` (new):

```python
"""One check-off's worth, checked against the table the card reads too (tests/fixtures/chores_worth.json)."""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Any

import pytest

from .chores_sample import SCENE, sample_engine

TABLE = json.loads((Path(__file__).parent / "fixtures" / "chores_worth.json").read_text("utf-8"))


def _first_credit(activity: dict[str, Any], member: str) -> float:
    engine = sample_engine(activities=[activity])
    stored = engine.activity(activity["id"])
    generator = engine.generator()
    if stored["schedule"] == "once":
        found = generator.period_occurrences(stored, member, "once", None)
    elif stored["schedule"] == "repeats":
        found = generator.period_occurrences(stored, member, "rep", date.fromisoformat(stored["repeats"]["start"]))
    elif stored["minimum"]["per"] == "day":
        found = generator.period_occurrences(stored, member, "day", SCENE.date())
    else:
        found = generator.period_occurrences(stored, member, "week", engine.clock.week_start(SCENE.date()))
    assert found, (activity["id"], member)
    assert len({o.credit_minutes for o in found}) == 1  # every check-off of a period is worth the same
    return found[0].credit_minutes


@pytest.mark.parametrize("case", TABLE["cases"], ids=lambda case: case["name"])
def test_each_check_off_is_worth_what_the_table_says(case: dict[str, Any]) -> None:
    for member, minutes in case["minutes"].items():
        assert _first_credit(case["activity"], member) == pytest.approx(minutes, abs=0.01)
```

`custom_components/planavista/frontend/test/chores-worth.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Activity } from '../src/modules/chores/chores-types';
import { checkoffMinutes, checkoffStars } from '../src/modules/chores/worth';

const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/chores_worth.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ name: string; activity: Partial<Activity>; minutes: Record<string, number> }>;
};

describe('checkoffMinutes', () => {
  it.each(TABLE.cases)('$name', c => {
    for (const [member, minutes] of Object.entries(c.minutes)) {
      expect(checkoffMinutes(c.activity, member)).toBeCloseTo(minutes, 2);
    }
  });

  it('reads the first assignee when no one is named', () => {
    const bathroom = TABLE.cases.find(c => c.name === 'a week, split unevenly, any day')!.activity;
    expect(checkoffMinutes(bathroom)).toBe(90);
  });
});

describe('checkoffStars', () => {
  const laundry = TABLE.cases.find(c => c.name === 'a week on two days')!.activity;

  it('works stars out from the time at the household rate', () => {
    expect(checkoffStars(laundry, 15)).toBe(4);
    expect(checkoffStars(laundry, 30)).toBe(2);
  });

  it('uses the chore\'s own stars when it has them', () => {
    expect(checkoffStars({ ...laundry, stars: 7 }, 15)).toBe(7);
  });
});
```

`custom_components/planavista/frontend/test/recurrence.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { ordinal, parseRule, ruleText, weekdaysText } from '../src/core/recurrence';

describe('parseRule', () => {
  it('reads the subset the engine follows', () => {
    expect(parseRule('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130')).toEqual({
      freq: 'WEEKLY', interval: 1, byday: ['SA'], bymonthday: null, count: null, until: '2026-11-30',
    });
    expect(parseRule('FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=1;COUNT=6')).toEqual({
      freq: 'MONTHLY', interval: 2, byday: [], bymonthday: 1, count: 6, until: null,
    });
    expect(parseRule('RRULE:FREQ=WEEKLY;BYDAY=TH,MO')!.byday).toEqual(['MO', 'TH']);
    expect(parseRule('FREQ=DAILY;UNTIL=20261130T000000Z')!.until).toBe('2026-11-30');
  });

  it.each([
    'FREQ=YEARLY', 'FREQ=DAILY;BYDAY=MO', 'FREQ=WEEKLY;BYMONTHDAY=3', 'FREQ=MONTHLY;BYMONTHDAY=32',
    'FREQ=WEEKLY;COUNT=3;UNTIL=20261130', 'FREQ=WEEKLY;BYSETPOS=1', 'FREQ=WEEKLY;INTERVAL=0', 'BYDAY=MO',
    'FREQ=WEEKLY;FREQ=DAILY',
  ])('refuses %s', text => {
    expect(parseRule(text)).toBeNull();
  });
});

describe('ruleText', () => {
  const text = (rule: string, window: 'day' | 'period' = 'day') => ruleText(parseRule(rule)!, window);

  it('says a rule in a few words', () => {
    expect(text('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130')).toBe('Saturdays until Nov 30');
    expect(text('FREQ=MONTHLY;BYMONTHDAY=1', 'period')).toBe('Monthly · any time that month');
    expect(text('FREQ=MONTHLY;BYMONTHDAY=1')).toBe('Monthly on the 1st');
    expect(text('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH')).toBe('Every 2 weeks · Mon, Thu');
    expect(text('FREQ=WEEKLY', 'period')).toBe('Weekly · any time that week');
    expect(text('FREQ=DAILY;INTERVAL=3;COUNT=5')).toBe('Every 3 days, 5 times');
    expect(text('FREQ=DAILY')).toBe('Every day');
  });

  it('names days and dates of the month', () => {
    expect(weekdaysText(['SA'])).toBe('Saturdays');
    expect(weekdaysText(['SA'], false)).toBe('Saturday');
    expect(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '31st']).toEqual(
      [1, 2, 3, 4, 11, 12, 13, 21, 22, 31].map(ordinal),
    );
  });
});
```

`custom_components/planavista/frontend/test/chores-list-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  choreRow, choresList, durationText, groupOf, onTheBoard, rhythmText,
} from '../src/modules/chores/settings/chores-list-derive';
import type { Activity } from '../src/modules/chores/chores-types';
import { MEMBERS, TODAY, activity } from './chores-fixtures';

const SETTINGS = { minutes_per_star: 15 };

/** The sample household's chores (spec 4), as the Settings mockup lists them. */
const SAMPLE: Activity[] = [
  activity('kitchen_cleanup', { name: 'Kitchen cleanup', assignees: ['alex'], minimum: { hours: 0.5, per: 'day' }, time_of_day: ['evening'] }),
  activity('cat_care', { name: 'Cat care', assignees: ['casey'], minimum: { hours: 1 / 3, per: 'day' }, times: 2, time_of_day: ['morning', 'evening'] }),
  activity('make_your_bed', { name: 'Make your bed', icon: '🛏️', assignees: ['dana'], minimum: { hours: 5 / 60, per: 'day' }, time_of_day: ['morning'], needs_ok: true }),
  activity('laundry', { name: 'Laundry', assignees: ['blair'], minimum: { hours: 2, per: 'week' }, days: ['mon', 'thu'], label: '2 loads' }),
  activity('clean_the_bathroom', { name: 'Clean the bathroom', assignees: ['blair', 'casey'], minimum: { hours: 2, per: 'week' }, split: 'shared', shares: { blair: 1, casey: 1 }, needs_ok: true }),
  activity('take_out_the_trash', { name: 'Take out the trash', assignees: ['casey'], minimum: { hours: 1 / 3, per: 'week' }, days: ['tue', 'fri'], time_of_day: ['evening'] }),
  activity('yard_work', { name: 'Yard work', assignees: ['casey'], minimum: { hours: 1.5, per: 'week' } }),
  activity('change_the_furnace_filter', { name: 'Change the furnace filter', schedule: 'repeats', assignees: ['alex'], repeats: { rrule: 'FREQ=MONTHLY;BYMONTHDAY=1', start: '2026-10-01', window: 'period', estimate_minutes: 15 } }),
  activity('rake_the_leaves', { name: 'Rake the leaves', schedule: 'repeats', assignees: ['casey'], repeats: { rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60 } }),
  activity('fix_the_gate_latch', { name: 'Fix the gate latch', schedule: 'once', assignees: ['alex'], once: { on: null, by: '2026-10-16', by_time: null, sessions: 1, estimate_minutes: 30 } }),
  activity('clean_out_the_garage', { name: 'Clean out the garage', schedule: 'once', assignees: ['casey'], needs_ok: true, once: { on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240 } }),
  activity('homework', { name: 'Homework', assignees: ['casey'], on_board: false, minimum: { hours: 1, per: 'day' }, days: ['mon', 'tue', 'wed', 'thu', 'fri'] }),
  activity('soccer_practice', { name: 'Soccer practice', assignees: ['casey'], minimum: { hours: 3, per: 'week' }, days: ['tue', 'thu'], set_time: '17:30' }),
  activity('wash_the_car', { name: 'Wash the car', assignees: [], minimum: { hours: 1, per: 'week' } }),
  activity('paint_the_fence', { name: 'Paint the fence', schedule: 'once', assignees: ['alex'], finished_at: '2026-10-10T12:00:00-05:00', once: { on: null, by: null, by_time: null, sessions: 1, estimate_minutes: 120 } }),
];

const rhythm = (id: string) => rhythmText(SAMPLE.find(a => a.id === id)!, TODAY);

describe('rhythmText', () => {
  it('says Plan chores in time and days', () => {
    expect(rhythm('kitchen_cleanup')).toBe('30 min a day · evenings');
    expect(rhythm('cat_care')).toBe('20 min a day, 2 times · morning and evening');
    expect(rhythm('laundry')).toBe('2 h a week, 2 loads · Mon, Thu');
    expect(rhythm('clean_the_bathroom')).toBe('2 h a week, split · any day');
    expect(rhythm('take_out_the_trash')).toBe('20 min a week · Tue, Fri evenings');
    expect(rhythm('yard_work')).toBe('1 h 30 min a week · any day');
    expect(rhythm('homework')).toBe('1 h a day · school days');
  });

  it('says set times, repeats, and one-time chores', () => {
    expect(rhythm('soccer_practice')).toBe('Tue, Thu at 5:30 PM · set time');
    expect(rhythmText(SAMPLE.find(a => a.id === 'soccer_practice')!, TODAY, '24h')).toBe('Tue, Thu at 17:30 · set time');
    expect(rhythm('change_the_furnace_filter')).toBe('Monthly · any time that month');
    expect(rhythm('rake_the_leaves')).toBe('Saturdays until Nov 30');
    expect(rhythm('fix_the_gate_latch')).toBe('By Friday');
    expect(rhythm('clean_out_the_garage')).toBe('By Sunday · 2 sessions');
    const on = (day: string) => rhythmText(activity('x', { schedule: 'once', once: { on: day, by: null, by_time: null, sessions: 1, estimate_minutes: 5 } }), TODAY);
    expect([on('2026-10-30'), on('2026-10-13'), on('2026-10-14'), on('2026-10-16')]).toEqual(['On Oct 30', 'Today', 'Tomorrow', 'On Friday']);
  });
});

describe('durationText', () => {
  it.each([[5, '5 min'], [60, '1 h'], [90, '1 h 30 min'], [135, '2 h 15 min'], [0.2, '1 min']])('%s min is %s', (minutes, text) => {
    expect(durationText(minutes)).toBe(text);
  });
});

describe('choreRow', () => {
  it('tags what needs an OK, plan-only chores, and chores nobody does yet', () => {
    const row = (id: string) => choreRow(SAMPLE.find(a => a.id === id)!, MEMBERS, SETTINGS, TODAY);
    expect(row('make_your_bed')).toMatchObject({ picture: '🛏️', tags: ['Needs an OK'], stars: 1 });
    expect(row('homework')).toMatchObject({ tags: ['Plan only'], stars: null });
    expect(row('wash_the_car')).toMatchObject({ tags: ['No one yet'], picture: '🚗' });
    expect(row('clean_the_bathroom').people.map(m => m.id)).toEqual(['blair', 'casey']);
    expect(row('laundry').stars).toBe(4);
    expect(row('clean_out_the_garage').stars).toBe(8);
  });
});

describe('choresList', () => {
  it('groups by rhythm and counts what is on the board', () => {
    const list = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY });
    expect(list.groups.map(g => [g.label, g.rows.length])).toEqual([
      ['Every day', 3], ['Every week', 5], ['On a schedule', 2], ['One time', 2], ['Not on the board', 2],
    ]);
    expect(list.onBoard).toBe(11);
    expect(list.total).toBe(14);
    expect(list.finished.map(r => r.id)).toEqual(['paint_the_fence']);
  });

  it('filters to one person and by a search', () => {
    const casey = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY, member: 'casey' });
    expect(casey.groups.flatMap(g => g.rows.map(r => r.id))).toEqual([
      'cat_care', 'clean_the_bathroom', 'take_out_the_trash', 'yard_work', 'rake_the_leaves', 'clean_out_the_garage',
      'homework', 'soccer_practice',
    ]);
    const search = choresList(SAMPLE, MEMBERS, SETTINGS, { today: TODAY, search: '  CLEAN ' });
    expect(search.groups.flatMap(g => g.rows.map(r => r.id))).toEqual(['kitchen_cleanup', 'clean_the_bathroom', 'clean_out_the_garage']);
    expect(search.total).toBe(14);
  });

  it('knows which group a chore goes in and whether it is checked off', () => {
    expect(SAMPLE.map(groupOf).filter(g => g === 'off_board')).toHaveLength(2);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'wash_the_car')!)).toBe(false);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'soccer_practice')!)).toBe(false);
    expect(onTheBoard(SAMPLE.find(a => a.id === 'laundry')!)).toBe(true);
  });
});
```

`custom_components/planavista/frontend/test/chores-settings.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { SettingsContext, SettingsPage } from '../src/core/settings-registry';
import type { ModuleService } from '../src/core/module-registry';
import { choresSettingsPages, registerChoresSettings, settingsBoard } from '../src/modules/chores/definition';
import type { Board } from '../src/modules/chores/chores-types';
import { activity, board } from './chores-fixtures';

const household = (enabled: boolean) => ({ available: true, modules: { chores: { enabled } } } as never);

function context(enabled: boolean, chores: Board | null): SettingsContext {
  const service = { board: () => chores } as unknown as ModuleService;
  return { household: household(enabled), data: {} as never, services: { chores: service } };
}

const sample = board({}, {
  chores: [activity('laundry'), activity('vacuum'), activity('paint', { finished_at: '2026-10-10T12:00:00-05:00' })],
});

describe('the Chores group of Settings', () => {
  it('shows its pages only while chores are on', () => {
    const registry = new PageRegistry<SettingsContext, SettingsPage>();
    registerChoresSettings(registry);
    expect(registry.pages(context(true, sample)).map(p => p.id)).toContain('chores');
    expect(registry.pages(context(false, null)).map(p => p.id)).not.toContain('chores');
  });

  it('counts the chores not yet finished', () => {
    const page = choresSettingsPages.find(p => p.id === 'chores')!;
    expect(page.summary!(context(true, sample))).toBe('2 chores');
    expect(page.summary!(context(true, null))).toBe('');
  });

  it('reads the board from the chores service', () => {
    expect(settingsBoard(context(true, sample))).toBe(sample);
    expect(settingsBoard({ services: {} })).toBeNull();
  });
});
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_worth.py -q` Expected: `9 passed` at once: it pins the engine's existing credit to the table the card reads. `cd custom_components/planavista/frontend && npx vitest run test/chores-worth.test.ts test/recurrence.test.ts test/chores-list-derive.test.ts test/chores-settings.test.ts` Expected: FAIL: each file imports a module or an export that doesn't exist yet.

- [ ] **Step 3: Give Settings the card's services, and let a page open a module's view.**

`custom_components/planavista/frontend/src/core/settings-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/settings-registry.ts b/custom_components/planavista/frontend/src/core/settings-registry.ts
index 73e0da8..1af6747 100644
--- a/custom_components/planavista/frontend/src/core/settings-registry.ts
+++ b/custom_components/planavista/frontend/src/core/settings-registry.ts
@@ -1,4 +1,5 @@
 import { HouseholdView } from './household';
+import type { ModuleService } from './module-registry';
 import { PageRegistry, WizardPage } from './page-registry';
 import { PlanaVistaData } from '../types';
 
@@ -6,6 +7,8 @@ import { PlanaVistaData } from '../types';
 export interface SettingsContext {
   household: HouseholdView | null;
   data: PlanaVistaData;
+  /** The card's module services (the chores pages read the chores feed). */
+  services?: Record<string, ModuleService>;
 }
 
 export interface SettingsGroup {
@@ -52,6 +55,7 @@ export function groupPages(
 export interface SetupContext {
   household: HouseholdView | null;
   data: PlanaVistaData;
+  services?: Record<string, ModuleService>;
 }
 
 export interface SetupStep extends WizardPage<SetupContext> {
```

`custom_components/planavista/frontend/src/core/page-host.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/page-host.ts b/custom_components/planavista/frontend/src/core/page-host.ts
index dafc510..f80be77 100644
--- a/custom_components/planavista/frontend/src/core/page-host.ts
+++ b/custom_components/planavista/frontend/src/core/page-host.ts
@@ -30,6 +30,9 @@ export const POP_PAGE = 'pv-pop-page';
 /** A page reports a failed save; the host shows the message. */
 export const PAGE_ERROR = 'pv-page-error';
 
+/** A page asks for a module's view (Open Dana's day): Settings closes and the card goes there. */
+export const OPEN_TARGET = 'pv-page-open';
+
 /** Words for a failed save (spec 11.7: what happened and what to do). */
 export function saveErrorMessage(code: string): string {
   switch (code) {
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 35ed8d5..2edb21e 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -8,7 +8,8 @@ import { baseStyles, buttonStyles } from '../../styles/shared';
 import type { HouseholdView, Member } from '../../core/household';
 import type { HouseholdApi } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
-import { PAGE_ERROR, POP_PAGE, PUSH_PAGE, PushPageDetail } from '../../core/page-host';
+import type { ModuleService, OpenTarget } from '../../core/module-registry';
+import { OPEN_TARGET, PAGE_ERROR, POP_PAGE, PUSH_PAGE, PushPageDetail } from '../../core/page-host';
 import type { Session } from '../../core/session';
 import { SettingsContext, SettingsPage, groupPages, settingsRegistry } from '../../core/settings-registry';
 import type { PlanaVistaData } from '../../types';
@@ -31,6 +32,7 @@ const TOAST_MS = 4000;
  * phones. The parent-mode strip stays on top while parent mode is on.
  *
  * @fires pv-settings-close - Done
+ * @fires pv-settings-open-target - a page asked for a module's view (Open Dana's day); Settings closes
  */
 export class PvSettings extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -42,6 +44,9 @@ export class PvSettings extends LitElement {
   @property({ type: Number }) sessionEndsAt = 0;
   @property({ attribute: false }) parent: Member | null = null;
   @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
+  /** The card's module services, and a number that changes whenever one of them does. */
+  @property({ attribute: false }) services: Record<string, ModuleService> = {};
+  @property({ type: Number }) revision = 0;
 
   /** The page picked in the sidebar (the stack starts at the list). */
   @state() private _selected: string | null = null;
@@ -55,6 +60,7 @@ export class PvSettings extends LitElement {
     this.addEventListener(PUSH_PAGE, this._onPush as EventListener);
     this.addEventListener(POP_PAGE, this._onPop);
     this.addEventListener(PAGE_ERROR, this._onError as EventListener);
+    this.addEventListener(OPEN_TARGET, this._onOpen as EventListener);
   }
 
   disconnectedCallback(): void {
@@ -62,6 +68,7 @@ export class PvSettings extends LitElement {
     this.removeEventListener(PUSH_PAGE, this._onPush as EventListener);
     this.removeEventListener(POP_PAGE, this._onPop);
     this.removeEventListener(PAGE_ERROR, this._onError as EventListener);
+    this.removeEventListener(OPEN_TARGET, this._onOpen as EventListener);
     window.clearTimeout(this._toastTimer);
   }
 
@@ -236,7 +243,7 @@ export class PvSettings extends LitElement {
   ];
 
   private _context(): SettingsContext {
-    return { household: this.household, data: this.data };
+    return { household: this.household, data: this.data, services: this.services };
   }
 
   private get _split(): boolean {
@@ -320,6 +327,8 @@ export class PvSettings extends LitElement {
             mode="settings"
             .pageProps=${top?.props ?? {}}
             .drafts=${this.drafts}
+            .services=${this.services}
+            .revision=${this.revision}
           ></${tag}>
         `)}
       </section>
@@ -360,6 +369,16 @@ export class PvSettings extends LitElement {
     this._stack = this._stack.slice(0, -1);
   };
 
+  private _onOpen = (event: CustomEvent<OpenTarget>): void => {
+    event.stopPropagation();
+    void this._openTarget(event.detail);
+  };
+
+  private async _openTarget(target: OpenTarget): Promise<void> {
+    if (!(await this._mayLeave())) return;
+    this.dispatchEvent(new CustomEvent('pv-settings-open-target', { detail: target, bubbles: true, composed: true }));
+  }
+
   private _onError = (event: CustomEvent<{ message: string }>): void => {
     event.stopPropagation();
     this._toast = event.detail.message;
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 51d42dc..100ae3e 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -629,7 +629,10 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .sessionEndsAt=${this._session.endsAt ?? 0}
               .parent=${this._household.view?.members.find(m => m.id === this._session.session?.memberId) ?? null}
               .drafts=${this._drafts}
+              .services=${this._services}
+              .revision=${this._serviceRevision}
               @pv-settings-close=${this._onSettingsClose}
+              @pv-settings-open-target=${(e: CustomEvent<OpenTarget>) => { this._onSettingsClose(); this._open(e.detail); }}
               @pv-lock=${this._onSettingsLock}
             ></pv-settings>
           </div>
```

- [ ] **Step 4: Write the worth, the recurrence reader, and the Chores list.**

`custom_components/planavista/frontend/src/modules/chores/worth.ts` (new):

```ts
import { starsFor } from '../../core/stars';
import type { Activity } from './chores-types';

/**
 * What one check-off of a chore is worth in minutes for one assignee (spec
 * 8.2): a Plan chore's time (their share when it is split) divided by its
 * check-offs, a Once chore's estimate by its sessions, a Repeats chore's
 * estimate each time. The engine's occurrences follow the same rule; both
 * are checked against tests/fixtures/chores_worth.json.
 */
export function checkoffMinutes(activity: Partial<Activity>, memberId?: string): number {
  if (activity.schedule === 'once') {
    const once = activity.once;
    return (once?.estimate_minutes ?? 15) / Math.max(1, once?.sessions ?? 1);
  }
  if (activity.schedule === 'repeats') return activity.repeats?.estimate_minutes ?? 15;
  const minimum = activity.minimum ?? { hours: 0, per: 'week' };
  const shares = activity.split === 'shared' ? activity.shares : null;
  const owner = memberId ?? activity.assignees?.[0];
  const hours = shares && owner && owner in shares ? shares[owner] : minimum.hours;
  const times = Math.max(1, activity.times ?? 1);
  const days = activity.days?.length ?? 0;
  const each = minimum.per === 'week' && days > 0 ? days * times : times;
  return (hours * 60) / each;
}

/** Stars one check-off earns (spec 8.3): the chore's own number, or the time at the household's rate. */
export function checkoffStars(activity: Partial<Activity>, minutesPerStar: number, memberId?: string): number {
  return starsFor(checkoffMinutes(activity, memberId), minutesPerStar, activity.stars);
}
```

`custom_components/planavista/frontend/src/core/recurrence.ts` (new):

```ts
/**
 * Repeating rules in the subset the engine follows (spec 7.3): FREQ=DAILY,
 * WEEKLY, or MONTHLY; INTERVAL; BYDAY (weekly); BYMONTHDAY (monthly, one
 * day); and COUNT or UNTIL. The chore editor's pv-recurrence-picker writes
 * them and the Chores list describes them; the calendar can reuse both.
 */

export type Freq = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export const WEEKDAYS: Weekday[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const SHORT: Record<Weekday, string> = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' };
const LONG: Record<Weekday, string> = {
  MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday', FR: 'Friday', SA: 'Saturday', SU: 'Sunday',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface Rule {
  freq: Freq;
  interval: number;
  byday: Weekday[];
  bymonthday: number | null;
  count: number | null;
  /** The last day it may happen, YYYY-MM-DD. */
  until: string | null;
}

/** A rule from its RRULE text, or null when it isn't one the engine follows. */
export function parseRule(text: string): Rule | null {
  const parts = new Map<string, string>();
  for (const part of text.replace(/^RRULE:/i, '').split(';')) {
    const [key, value] = part.split('=');
    if (!key || value === undefined || parts.has(key.toUpperCase())) return null;
    parts.set(key.toUpperCase(), value.toUpperCase());
  }
  const freq = parts.get('FREQ') as Freq | undefined;
  if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY') return null;
  const interval = parts.has('INTERVAL') ? Number(parts.get('INTERVAL')) : 1;
  const byday = parts.get('BYDAY')?.split(',') ?? [];
  if (!Number.isInteger(interval) || interval < 1 || byday.some(d => !WEEKDAYS.includes(d as Weekday))) return null;
  if (byday.length && freq !== 'WEEKLY') return null;
  const monthday = parts.has('BYMONTHDAY') ? Number(parts.get('BYMONTHDAY')) : null;
  if (monthday !== null && (freq !== 'MONTHLY' || !Number.isInteger(monthday) || monthday < 1 || monthday > 31)) return null;
  const count = parts.has('COUNT') ? Number(parts.get('COUNT')) : null;
  if (count !== null && (!Number.isInteger(count) || count < 1)) return null;
  const untilMatch = parts.get('UNTIL')?.match(/^(\d{4})(\d{2})(\d{2})(T\d{6}Z?)?$/);
  if (parts.has('UNTIL') && !untilMatch) return null;
  if (count !== null && untilMatch) return null;
  const known = new Set(['FREQ', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'COUNT', 'UNTIL']);
  if ([...parts.keys()].some(key => !known.has(key))) return null;
  return {
    freq,
    interval,
    byday: WEEKDAYS.filter(d => byday.includes(d)),
    bymonthday: monthday,
    count,
    until: untilMatch ? `${untilMatch[1]}-${untilMatch[2]}-${untilMatch[3]}` : null,
  };
}

/** "Mon, Thu", or "Saturdays" for one day. */
export function weekdaysText(days: Weekday[], plural = true): string {
  if (days.length === 1) return plural ? `${LONG[days[0]]}s` : LONG[days[0]];
  return days.map(d => SHORT[d]).join(', ');
}

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** "Nov 30" from YYYY-MM-DD. */
export function shortDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

/**
 * A rule in a few words for a list (spec 14.3): "Saturdays until Nov 30",
 * "Monthly · any time that month", "Every 2 weeks · Mon, Thu".
 */
export function ruleText(rule: Rule, window: 'day' | 'period' = 'day'): string {
  let text: string;
  if (rule.freq === 'DAILY') {
    text = rule.interval === 1 ? 'Every day' : `Every ${rule.interval} days`;
  } else if (rule.freq === 'WEEKLY') {
    const days = rule.byday;
    if (rule.interval === 1) {
      text = window === 'period' || days.length === 0 ? 'Weekly · any time that week' : weekdaysText(days);
    } else {
      const every = `Every ${rule.interval} weeks`;
      text = window === 'period' || days.length === 0 ? `${every} · any time that week` : `${every} · ${weekdaysText(days, false)}`;
    }
  } else {
    const every = rule.interval === 1 ? 'Monthly' : `Every ${rule.interval} months`;
    text = window === 'period' || rule.bymonthday === null
      ? `${every} · any time that month`
      : `${every} on the ${ordinal(rule.bymonthday)}`;
  }
  if (rule.until) return `${text} until ${shortDate(rule.until)}`;
  if (rule.count) return `${text}, ${rule.count} ${rule.count === 1 ? 'time' : 'times'}`;
  return text;
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts` (new):

```ts
import { css } from 'lit';

/**
 * The chores Settings pages' look (the approved settings-editors mockup):
 * small headings over grouped cards of rows, tags as pills, person chips,
 * steppers, and segmented controls. Built on the card's theme tokens.
 */
export const choresSettingsStyles = css`
  :host {
    display: block;
  }

  .section-label {
    margin: 22px 4px 8px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--pv-text-secondary, #6B7280);
  }

  .section-label:first-child {
    margin-top: 4px;
  }

  .group {
    margin: 0;
    padding: 0;
    list-style: none;
    border-radius: 14px;
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    overflow: hidden;
  }

  .group > li + li,
  .group > .row + .row {
    border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 8px 14px;
    box-sizing: border-box;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
  }

  button.row {
    cursor: pointer;
  }

  button.row:hover {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
  }

  .row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .row-title {
    font-weight: 600;
  }

  .row-sub {
    font-size: 0.8125rem;
    color: var(--pv-text-secondary, #6B7280);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-value {
    color: var(--pv-text-secondary, #6B7280);
    white-space: nowrap;
  }

  .chevron {
    color: var(--pv-text-secondary, #6B7280);
    font-size: 1.25rem;
  }

  .picture {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 5%, transparent);
    font-size: 1.375rem;
  }

  .tag {
    flex-shrink: 0;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, transparent);
    color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
  }

  .tag--muted {
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 7%, transparent);
    color: var(--pv-text-secondary, #6B7280);
  }

  .tag--attention {
    background: color-mix(in srgb, #F59E0B 18%, transparent);
    color: var(--pv-text, #1A1B1E);
  }

  .stars {
    flex-shrink: 0;
    font-weight: 700;
    color: var(--pv-star-ink, #8A6A00);
    white-space: nowrap;
  }

  .avatars {
    display: flex;
    flex-shrink: 0;
  }

  .avatars > * + * {
    margin-left: -8px;
  }

  .hint {
    margin: 8px 4px 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--pv-text-secondary, #6B7280);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 14px 0 6px;
    border-radius: 999px;
    border: 1px solid var(--pv-border-subtle, #E5E7EB);
    background: var(--pv-card-bg, #FFFFFF);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .chip--plain {
    padding: 0 14px;
  }

  .chip[aria-pressed='true'] {
    border-color: var(--pv-accent, #6366F1);
    background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, var(--pv-card-bg, #FFFFFF));
    font-weight: 600;
  }

  .segmented {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
  }

  .segmented button {
    flex: 1;
    min-height: 44px;
    padding: 0 12px;
    border: none;
    border-radius: 9px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .segmented button[aria-pressed='true'] {
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    font-weight: 600;
  }

  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }

  .stepper output {
    min-width: 72px;
    text-align: right;
    font-weight: 700;
  }

  .stepper button {
    width: 44px;
    height: 40px;
    border: 1px solid var(--pv-border-subtle, #E5E7EB);
    border-radius: 10px;
    background: var(--pv-card-bg, #FFFFFF);
    color: inherit;
    font: inherit;
    font-size: 1.25rem;
    cursor: pointer;
  }

  .stepper button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle-row .pv-toggle {
    margin-left: auto;
    flex-shrink: 0;
  }

  .problem {
    margin: 0 0 16px;
    padding: 10px 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
    color: var(--pv-danger, #DC2626);
  }

  .ok {
    color: var(--pv-success-ink, #2F7D4F);
  }

  .destructive {
    width: 100%;
    min-height: 52px;
    margin-top: 24px;
    border-radius: 14px;
    border: none;
    background: var(--pv-card-bg, #FFFFFF);
    box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    color: var(--pv-danger, #DC2626);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .empty {
    margin: 24px 4px;
    color: var(--pv-text-secondary, #6B7280);
    line-height: 1.5;
  }

  .skeleton {
    height: 56px;
    border-radius: 14px;
    margin-bottom: 8px;
    background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    .skeleton {
      animation: pv-pulse 1.4s ease-in-out infinite;
    }
  }

  @keyframes pv-pulse {
    50% {
      opacity: 0.5;
    }
  }
`;
```

`custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts` (new):

```ts
import type { Member } from '../../../core/household';
import { parseRule, ruleText, shortDate } from '../../../core/recurrence';
import type { Activity, Band, ChoresSettings } from '../chores-types';
import { pictureFor } from '../picture-words';
import { checkoffStars } from '../worth';

/** The Chores list's groups, by rhythm (spec 14.3). */
export type RhythmGroup = 'every_day' | 'every_week' | 'schedule' | 'once' | 'off_board';

export const GROUP_LABELS: Record<RhythmGroup, string> = {
  every_day: 'Every day',
  every_week: 'Every week',
  schedule: 'On a schedule',
  once: 'One time',
  off_board: 'Not on the board',
};
const ORDER: RhythmGroup[] = ['every_day', 'every_week', 'schedule', 'once', 'off_board'];

export interface ChoreRow {
  id: string;
  name: string;
  picture: string;
  rhythm: string;
  tags: string[];
  /** Stars each check-off earns; null for a chore that isn't checked off. */
  stars: number | null;
  people: Member[];
}

export interface ChoreList {
  /** Chores not yet finished. */
  total: number;
  onBoard: number;
  groups: Array<{ id: RhythmGroup; label: string; rows: ChoreRow[] }>;
  finished: ChoreRow[];
}

/** Whether a chore makes check-offs (the engine's on_board rule, spec 7.3). */
export function onTheBoard(activity: Activity): boolean {
  if (activity.on_board === false || !activity.assignees?.length || activity.finished_at) return false;
  return !(activity.schedule === 'plan' && activity.set_time);
}

export function planOnly(activity: Activity): boolean {
  return activity.schedule === 'plan' && (activity.on_board === false || !!activity.set_time);
}

export function groupOf(activity: Activity): RhythmGroup {
  if (planOnly(activity)) return 'off_board';
  if (activity.schedule === 'once') return 'once';
  if (activity.schedule === 'repeats') return 'schedule';
  return activity.minimum?.per === 'day' ? 'every_day' : 'every_week';
}

/** "5 min", "1 h", "1 h 30 min" (spec 14.7's way of saying how long). */
export function durationText(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

const DAY_NAMES: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const BAND_PLURALS: Record<Band, string> = { morning: 'mornings', afternoon: 'afternoons', evening: 'evenings' };

function daysText(days: string[]): string {
  const set = days.join();
  if (set === 'mon,tue,wed,thu,fri') return 'school days';
  if (set === 'sat,sun') return 'weekends';
  return days.map(d => DAY_NAMES[d] ?? d).join(', ');
}

function bandsText(bands: Band[]): string {
  if (bands.length === 1) return BAND_PLURALS[bands[0]];
  return bands.join(' and ');
}

/** "5:30 PM", or "17:30" on a 24-hour calendar. */
export function clockText(at: string, timeFormat: string): string {
  const [hour, minute] = at.split(':').map(Number);
  if (timeFormat === '24h') return at;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** "Friday" within the coming week, else "Oct 18" (Once chores' dates). */
export function dayText(iso: string, today: string): string {
  const days = Math.round((Date.parse(`${iso}T12:00:00`) - Date.parse(`${today}T12:00:00`)) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 1 && days < 7) return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  return shortDate(iso);
}

/** How a chore repeats in a line (spec 14.3): "2 h a week, split · any day", "By Sunday · 2 sessions". */
export function rhythmText(activity: Activity, today: string, timeFormat = '12h'): string {
  if (activity.schedule === 'once') {
    const once = activity.once;
    const on = once?.on ? dayText(once.on, today) : null;
    const when = on
      ? (on === 'today' || on === 'tomorrow' ? on[0].toUpperCase() + on.slice(1) : `On ${on}`)
      : once?.by ? `By ${dayText(once.by, today)}` : 'Any time';
    return once && once.sessions > 1 ? `${when} · ${once.sessions} sessions` : when;
  }
  if (activity.schedule === 'repeats') {
    const rule = activity.repeats ? parseRule(activity.repeats.rrule) : null;
    return rule ? ruleText(rule, activity.repeats!.window) : 'On a schedule';
  }
  const minimum = activity.minimum ?? { hours: 0, per: 'week' as const };
  const days = activity.days ?? [];
  const bands = activity.time_of_day ?? [];
  if (activity.set_time) {
    const on = days.length ? `${daysText(days)} at ` : 'At ';
    return `${on}${clockText(activity.set_time, timeFormat)} · set time`;
  }
  const amount = [`${durationText(minimum.hours * 60)} a ${minimum.per}`];
  if (minimum.per === 'day' && (activity.times ?? 1) > 1) amount.push(`${activity.times} times`);
  if (activity.split === 'shared') amount.push('split');
  if (activity.label) amount.push(activity.label);
  let when = '';
  if (days.length) when = bands.length ? `${daysText(days)} ${bandsText(bands)}` : daysText(days);
  else if (bands.length) when = bandsText(bands);
  else if (minimum.per === 'week') when = 'any day';
  return when ? `${amount.join(', ')} · ${when}` : amount.join(', ');
}

/** A chore as a row of the Chores list. */
export function choreRow(
  activity: Activity, members: Member[], settings: Pick<ChoresSettings, 'minutes_per_star'>, today: string, timeFormat = '12h',
): ChoreRow {
  const tags: string[] = [];
  if (planOnly(activity)) tags.push('Plan only');
  else if (!activity.assignees?.length) tags.push('No one yet');
  if (!planOnly(activity) && (activity.needs_ok || activity.needs_ok_always)) tags.push('Needs an OK');
  return {
    id: activity.id,
    name: activity.name,
    picture: activity.icon || pictureFor(activity.name),
    rhythm: rhythmText(activity, today, timeFormat),
    tags,
    stars: planOnly(activity) ? null : checkoffStars(activity, settings.minutes_per_star),
    people: members.filter(m => activity.assignees?.includes(m.id)),
  };
}

/**
 * The Chores list (spec 14.3): grouped by rhythm, filtered to one person
 * and by a search, with finished chores apart ("Show 3 finished").
 */
export function choresList(
  activities: Activity[],
  members: Member[],
  settings: Pick<ChoresSettings, 'minutes_per_star'>,
  options: { member?: string | null; search?: string; today: string; timeFormat?: string },
): ChoreList {
  const query = (options.search ?? '').trim().toLocaleLowerCase();
  const shown = activities.filter(a =>
    (!options.member || a.assignees?.includes(options.member)) && (!query || a.name.toLocaleLowerCase().includes(query)));
  const active = activities.filter(a => !a.finished_at);
  const row = (a: Activity) => choreRow(a, members, settings, options.today, options.timeFormat);
  const groups = ORDER.map(id => ({
    id,
    label: GROUP_LABELS[id],
    rows: shown.filter(a => !a.finished_at && groupOf(a) === id).map(row),
  })).filter(group => group.rows.length > 0);
  return {
    total: active.length,
    onBoard: active.filter(onTheBoard).length,
    groups,
    finished: shown.filter(a => a.finished_at).map(row),
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { OPEN_TARGET, PUSH_PAGE, PushPageDetail } from '../../../core/page-host';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ChoreRow, choresList } from './chores-list-derive';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';

/**
 * pv-chores-list-page: every chore, grouped by rhythm (spec 14.3), with a
 * search, person filter chips, two columns in landscape, and for a young
 * child a preview of how they see their chores. Rows open the chore editor.
 */
export class PvChoresListPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _member: string | null = null;
  @state() private _search = '';
  @state() private _showFinished = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }

      .search {
        width: 100%;
        margin-bottom: 12px;
      }

      .filters {
        margin-bottom: 8px;
      }

      .groups {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .groups {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .rhythm-group {
        min-width: 0;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
        gap: 10px;
        margin-top: 4px;
      }

      .tile {
        display: grid;
        justify-items: center;
        gap: 6px;
        padding: 12px 8px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .tile .emoji {
        font-size: 2rem;
      }

      .finished-link {
        margin: 16px 4px 0;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 44px;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    const members = inOrder(this.household?.members ?? []);
    if (!board) {
      return html`<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
    }
    const list = choresList(board.chores, members, board.settings, {
      member: this._member, search: this._search, today: board.today, timeFormat: this.data?.display?.time_format,
    });
    const filtered = members.find(m => m.id === this._member) ?? null;
    return html`
      <div class="head">
        <p class="count">${list.total} ${list.total === 1 ? 'chore' : 'chores'} · ${list.onBoard} on the board</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${() => this._open(null)}>+ New chore</button>
      </div>
      <input class="pv-input search" type="search" placeholder="Search chores" aria-label="Search chores"
        .value=${this._search} @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }} />
      <div class="chips filters" role="group" aria-label="Whose chores">
        <button class="chip chip--plain" type="button" aria-pressed=${this._member === null ? 'true' : 'false'}
          @click=${() => { this._member = null; }}>Everyone</button>
        ${members.map(member => html`
          <button class="chip" type="button" aria-pressed=${this._member === member.id ? 'true' : 'false'}
            @click=${() => { this._member = member.id; }}>
            <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>${member.name}
          </button>
        `)}
      </div>
      ${list.groups.length === 0 ? this._renderEmpty(list.total > 0) : nothing}
      <div class="groups">
        ${list.groups.map(group => html`
          <section class="rhythm-group" aria-label=${group.label}>
            <h2 class="section-label">${group.label} · ${group.rows.length}</h2>
            <ul class="group">${group.rows.map(row => html`<li>${this._renderRow(row, !this._member)}</li>`)}</ul>
            ${group.id === 'off_board'
              ? html`<p class="hint">Plan only: part of the household plan, but not checked off. Turn on Show on the board in the chore to add it.</p>`
              : nothing}
          </section>
        `)}
      </div>
      ${filtered ? this._renderFor(filtered, list.groups.flatMap(g => g.rows)) : nothing}
      ${list.finished.length ? html`
        <button class="finished-link" type="button" aria-expanded=${this._showFinished ? 'true' : 'false'}
          @click=${() => { this._showFinished = !this._showFinished; }}>
          ${this._showFinished ? 'Hide finished' : `Show ${list.finished.length} finished`} ›
        </button>
        ${this._showFinished
          ? html`<ul class="group">${list.finished.map(row => html`<li>${this._renderRow(row, true)}</li>`)}</ul>`
          : nothing}
      ` : nothing}
    `;
  }

  private _renderEmpty(filtered: boolean) {
    return filtered
      ? html`<p class="empty">No chores match.</p>`
      : html`<p class="empty">No chores yet. Tap + New chore, or import a plan in Import and export.</p>`;
  }

  private _renderRow(row: ChoreRow, showPeople: boolean) {
    return html`
      <button class="row" type="button" @click=${() => this._open(row)}>
        <span class="picture" aria-hidden="true">${row.picture}</span>
        <span class="row-text">
          <span class="row-title">${row.name}</span>
          <span class="row-sub">${row.rhythm}</span>
        </span>
        ${row.tags.map(tag => html`<span class="tag ${tag === 'Plan only' ? 'tag--muted' : tag === 'No one yet' ? 'tag--attention' : ''}">${tag}</span>`)}
        ${row.stars !== null ? html`<span class="stars" aria-label="${row.stars} stars each">★ ${row.stars}</span>` : nothing}
        ${showPeople ? html`
          <span class="avatars">
            ${row.people.map(member => html`<pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>`)}
          </span>
        ` : nothing}
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    `;
  }

  /** Filtered to one person: why their chores need an OK, and for a young child, how they see them. */
  private _renderFor(member: Member, rows: ChoreRow[]) {
    const tiles = rows.filter(row => !row.tags.includes('Plan only') && !row.tags.includes('No one yet'));
    return html`
      ${member.needs_ok_for === 'all' && !member.parent
        ? html`<p class="hint">Every chore of ${member.name}'s needs an OK${member.age_group === 'young_child' ? `, because ${member.name} is a young child` : ''}.</p>`
        : nothing}
      ${member.age_group === 'young_child' && tiles.length ? html`
        <h2 class="section-label">How ${member.name} sees them</h2>
        <div class="tiles">
          ${tiles.map(row => html`<div class="tile"><span class="emoji" aria-hidden="true">${row.picture}</span>${row.name}</div>`)}
        </div>
        <ul class="group" style="margin-top: 12px">
          <li>
            <button class="row" type="button" @click=${() => this._openDay(member)}>
              <span class="row-text">
                <span class="row-title">Open ${member.name}'s day</span>
                <span class="row-sub">My day, the way ${member.name} sees it</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      ` : nothing}
    `;
  }

  private _open(row: ChoreRow | null): void {
    const detail: PushPageDetail = row
      ? { tag: 'pv-chore-editor', title: row.name, back: 'Chores', props: { choreId: row.id } }
      : { tag: 'pv-chore-editor', title: 'New chore', back: 'Chores', props: { choreId: null, assignees: this._member ? [this._member] : [] } };
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
  }

  private _openDay(member: Member): void {
    this.dispatchEvent(new CustomEvent(OPEN_TARGET, {
      detail: { module: 'chores', view: 'my_day', member: member.id }, bubbles: true, composed: true,
    }));
  }
}

defineElement('pv-chores-list-page', PvChoresListPage);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index 2c4efc4..1b472cb 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -1,5 +1,8 @@
 import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
+import { PageRegistry } from '../../core/page-registry';
+import { SettingsContext, SettingsPage, settingsRegistry } from '../../core/settings-registry';
 import { ChoresService, choresEnabled } from './chores-service';
+import type { Board } from './chores-types';
 
 /** The views the Chores module offers in the bar (spec 12.2). */
 export const CHORES_VIEWS = [
@@ -27,3 +30,33 @@ export const choresModule: ModuleDefinition = {
 export function registerChoresModule(modules: ModuleRegistry = moduleRegistry): void {
   modules.register(choresModule);
 }
+
+/** Today's chores board as Settings sees it, or null before the feed arrives. */
+export function settingsBoard(ctx: Pick<SettingsContext, 'services'>): Board | null {
+  return (ctx.services?.chores as ChoresService | undefined)?.board() ?? null;
+}
+
+function count(n: number, one: string, many: string): string {
+  return `${n} ${n === 1 ? one : many}`;
+}
+
+/** The Chores group of Settings (spec 14.1): Chores, Rewards, Rules, and Reminders, while chores are on. */
+export const choresSettingsPages: SettingsPage[] = [
+  {
+    id: 'chores',
+    label: 'Chores',
+    group: 'chores',
+    order: 200,
+    tag: 'pv-chores-list-page',
+    applies: ({ household }) => choresEnabled({ household }),
+    summary: ctx => {
+      const board = settingsBoard(ctx);
+      return board ? count(board.chores.filter(a => !a.finished_at).length, 'chore', 'chores') : '';
+    },
+  },
+];
+
+/** Add the chores pages to Settings. */
+export function registerChoresSettings(settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry): void {
+  for (const page of choresSettingsPages) settings.register(page);
+}
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index 2e9244d..2ca5f46 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -1,5 +1,7 @@
-// The Chores module: its elements, and its entry in the module registry.
+// The Chores module: its elements, its Settings pages, and its entry in the module registry.
 import './pv-chores-module';
-import { registerChoresModule } from './definition';
+import './settings/pv-chores-list-page';
+import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
+registerChoresSettings();
```

- [ ] **Step 5: Run them again.** Same command. Expected: `38 passed`.
- [ ] **Step 6: Run the whole frontend suite.** `npx tsc --noEmit -p . && npm test` Expected: tsc clean, `626 passed`; the backend suite, `1029 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(card): chores pages in Settings, and the Chores list` with the trailers.

---

### Task 6: The chore editor and pv-recurrence-picker

Spec 14.4 (the editor: Plan, Once, or Repeats; who; when; how long; the worth line; on the board; Use in automations; Delete confirmed by name) and its `pv-recurrence-picker`, which produces exactly the backend's RRULE subset (spec 7.4), checked against one table by both sides.

**Files:**
- Create: `custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts`, `custom_components/planavista/frontend/src/core/clipboard.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/chore-draft.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/entities.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts`
- Modify: `custom_components/planavista/frontend/src/core/recurrence.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `tests/fixtures/recurrence_cases.json`, `tests/test_chores_recurrence.py`, `custom_components/planavista/frontend/test/recurrence.test.ts`, `custom_components/planavista/frontend/test/chore-draft.test.ts`, `custom_components/planavista/frontend/test/chores-entities.test.ts`

**Interfaces:**
- Consumes: Task 5's `parseRule`, `ruleText`, `checkoffMinutes`, `checkoffStars`, the Chores list's push (`pv-chore-editor` with `{choreId}` or `{choreId: null, assignees}`).
- Produces: `RecurrenceValue`, `recurrenceValue(rrule, start)`, `toRRule(value)`, `instanceDates(value, from, count)`, `recurrenceSummary(value)`, `happens`, `weekdayOf`; the element `pv-recurrence-picker` (fires `pv-recurrence-change`); `copyText(text)`; `ChoreDraft`, `ChoreRecord`, `Schedule`, `OnceWhen`, `CATEGORIES`, `DAY_CODES`, `draftOf(activity)`, `beginChoreDraft`, `isDirty`, `rebaseChore`, `choreChanges`, `choreProblem`, `asActivity`, `evenShares`, `sharesStatus`, `worthText`, `okText`, `whenText`, `onceText`, `windowText`, `automationExample`; `MemberEntity`, `memberEntities(member)`; the element `pv-chore-editor` (Cancel and Save, Delete confirmed by name, `confirmLeave`).

- [ ] **Step 1: Write the shared recurrence table and the failing tests.**

`tests/fixtures/recurrence_cases.json` (new):

```json
{
  "description": "Repeating rules and every date they happen on (spec 7.3). The engine's expander and the chore editor's picker are both checked against this table.",
  "cases": [
    {"name": "Saturdays until Nov 30", "rrule": "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130", "start": "2026-10-17",
     "dates": ["2026-10-17", "2026-10-24", "2026-10-31", "2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28"]},
    {"name": "the 31st skips short months", "rrule": "FREQ=MONTHLY;BYMONTHDAY=31;COUNT=4", "start": "2026-10-01",
     "dates": ["2026-10-31", "2026-12-31", "2027-01-31", "2027-03-31"]},
    {"name": "every other week from a Wednesday", "rrule": "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH;COUNT=5", "start": "2026-10-14",
     "dates": ["2026-10-15", "2026-10-26", "2026-10-29", "2026-11-09", "2026-11-12"]},
    {"name": "every third day", "rrule": "FREQ=DAILY;INTERVAL=3;UNTIL=20261025", "start": "2026-10-13",
     "dates": ["2026-10-13", "2026-10-16", "2026-10-19", "2026-10-22", "2026-10-25"]},
    {"name": "weekly on the start's weekday", "rrule": "FREQ=WEEKLY;COUNT=3", "start": "2026-10-13",
     "dates": ["2026-10-13", "2026-10-20", "2026-10-27"]},
    {"name": "monthly on the start's day", "rrule": "FREQ=MONTHLY;COUNT=3", "start": "2026-01-31",
     "dates": ["2026-01-31", "2026-03-31", "2026-05-31"]},
    {"name": "every two months on the 15th", "rrule": "FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=15;UNTIL=20270401", "start": "2026-10-20",
     "dates": ["2026-12-15", "2027-02-15"]}
  ]
}
```

`tests/test_chores_recurrence.py`:

```diff
diff --git a/tests/test_chores_recurrence.py b/tests/test_chores_recurrence.py
index a0a9316..67b8c23 100644
--- a/tests/test_chores_recurrence.py
+++ b/tests/test_chores_recurrence.py
@@ -2,7 +2,10 @@
 from __future__ import annotations
 
 from datetime import date, datetime, timedelta
+import json
+from pathlib import Path
 import random
+from typing import Any
 
 from dateutil import rrule as du
 import pytest
@@ -176,3 +179,14 @@ def test_skipping_ahead_matches_starting_from_the_beginning(seed: int) -> None:
     assert list(instances(rule, start, last, first=first)) == [
         day for day in instances(rule, start, last) if day >= first
     ]
+
+
+CASES = json.loads((Path(__file__).parent / "fixtures" / "recurrence_cases.json").read_text("utf-8"))
+
+
+@pytest.mark.parametrize("case", CASES["cases"], ids=lambda case: case["name"])
+def test_the_shared_table_of_rules(case: dict[str, Any]) -> None:
+    """The chore editor's picker reads the same table (test/recurrence.test.ts)."""
+    rule = parse_rule(case["rrule"])
+    found = list(instances(rule, date.fromisoformat(case["start"]), date(2030, 1, 1)))
+    assert [d.isoformat() for d in found] == case["dates"]
```

`custom_components/planavista/frontend/test/recurrence.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/recurrence.test.ts b/custom_components/planavista/frontend/test/recurrence.test.ts
index 3604099..9622471 100644
--- a/custom_components/planavista/frontend/test/recurrence.test.ts
+++ b/custom_components/planavista/frontend/test/recurrence.test.ts
@@ -1,5 +1,12 @@
+import { readFileSync } from 'node:fs';
 import { describe, expect, it } from 'vitest';
-import { ordinal, parseRule, ruleText, weekdaysText } from '../src/core/recurrence';
+import {
+  happens, instanceDates, ordinal, parseRule, recurrenceSummary, recurrenceValue, ruleText, toRRule, weekdaysText,
+} from '../src/core/recurrence';
+
+const TABLE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/recurrence_cases.json', import.meta.url), 'utf-8')) as {
+  cases: Array<{ name: string; rrule: string; start: string; dates: string[] }>;
+};
 
 describe('parseRule', () => {
   it('reads the subset the engine follows', () => {
@@ -43,3 +50,52 @@ describe('ruleText', () => {
     );
   });
 });
+
+describe('instanceDates', () => {
+  it.each(TABLE.cases)('$name', c => {
+    expect(instanceDates(parseRule(c.rrule)!, c.start, '2030-01-01')).toEqual(c.dates);
+  });
+
+  it('stops at the last day asked for, and at a limit', () => {
+    expect(instanceDates(parseRule('FREQ=DAILY')!, '2026-10-13', '2026-10-15')).toEqual(['2026-10-13', '2026-10-14', '2026-10-15']);
+    expect(instanceDates(parseRule('FREQ=DAILY')!, '2026-10-13', '2030-01-01', 2)).toHaveLength(2);
+  });
+});
+
+describe('the picker value', () => {
+  it.each(TABLE.cases)('$name comes back as the same rule', c => {
+    expect(parseRule(toRRule(recurrenceValue(c.rrule, c.start)))).toEqual(parseRule(c.rrule));
+  });
+
+  it('starts a new rule weekly on the start day, never ending', () => {
+    const value = recurrenceValue(null, '2026-10-17');
+    expect(toRRule(value)).toBe('FREQ=WEEKLY;BYDAY=SA');
+    expect(value.ends).toBe('never');
+  });
+
+  it('keeps a count and an end date while another ending is picked', () => {
+    const value = { ...recurrenceValue('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', '2026-10-17'), ends: 'never' as const };
+    expect(toRRule(value)).toBe('FREQ=WEEKLY;BYDAY=SA');
+    expect(toRRule({ ...value, ends: 'until' })).toBe('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130');
+  });
+});
+
+describe('recurrenceSummary', () => {
+  const summary = (rrule: string, start: string) => recurrenceSummary(recurrenceValue(rrule, start));
+
+  it('says the rule, its end, and how many times (spec 14.4)', () => {
+    expect(summary('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', '2026-10-17')).toBe('Every Saturday until November 30: 7 times.');
+    expect(summary('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TH;COUNT=5', '2026-10-14')).toBe(
+      'Every 2 weeks on Monday and Thursday, 5 times, ending November 12.',
+    );
+    expect(summary('FREQ=MONTHLY;BYMONTHDAY=1', '2026-10-01')).toBe('Every month on the 1st, from October 1.');
+    expect(summary('FREQ=DAILY;INTERVAL=3', '2026-10-13')).toBe('Every 3 days, from October 13.');
+  });
+
+  it('notices a rule that never happens', () => {
+    const never = recurrenceValue('FREQ=WEEKLY;BYDAY=SA;UNTIL=20261016', '2026-10-17');
+    expect(recurrenceSummary(never)).toBe('This never happens. Pick a later end date.');
+    expect(happens(never)).toBe(false);
+    expect(happens(recurrenceValue('FREQ=MONTHLY;BYMONTHDAY=31', '2026-10-01'))).toBe(true);
+  });
+});
```

`custom_components/planavista/frontend/test/chore-draft.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  automationExample, beginChoreDraft, choreChanges, choreProblem, draftOf, evenShares, isDirty, okText, onceText,
  rebaseChore, sharesStatus, whenText, windowText, worthText,
} from '../src/modules/chores/settings/chore-draft';
import type { ChoreDraft } from '../src/modules/chores/settings/chore-draft';
import { MEMBERS, TODAY, activity } from './chores-fixtures';

const SETTINGS = { minutes_per_star: 15 };
const BATHROOM = activity('clean_the_bathroom', {
  name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', assignees: ['blair', 'casey'], needs_ok: true,
  minimum: { hours: 2, per: 'week' }, split: 'shared', shares: { blair: 1, casey: 1 }, times: 1, days: [], time_of_day: [],
  type: 'need', locked: true, rev: 3,
});
const GARAGE = activity('clean_out_the_garage', {
  name: 'Clean out the garage', schedule: 'once', assignees: ['casey'], needs_ok: true,
  once: { on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240 },
});
const LEAVES = activity('rake_the_leaves', {
  name: 'Rake the leaves', schedule: 'repeats', assignees: ['casey'],
  repeats: { rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60 },
});

const edit = (draft: ChoreDraft, patch: Partial<ChoreDraft>): ChoreDraft => ({ ...draft, ...patch });

describe('a draft of a chore', () => {
  it('starts a new chore as a Plan chore of 15 minutes a day, for the person filtered to', () => {
    const record = beginChoreDraft(null, TODAY, ['dana']);
    expect(record.rev).toBeNull();
    expect(record.draft).toMatchObject({ schedule: 'plan', minutes: 15, per: 'day', assignees: ['dana'], on_board: true });
    expect(record.draft.recurrence.start).toBe(TODAY);
  });

  it('reads a saved chore in minutes', () => {
    const d = draftOf(BATHROOM, TODAY);
    expect(d).toMatchObject({ minutes: 120, per: 'week', split: 'shared', shares: { blair: 60, casey: 60 }, icon: '🛁' });
    expect(draftOf(GARAGE, TODAY)).toMatchObject({ once_when: 'by', date: '2026-10-18', sessions: 2, estimate: 240 });
    const leaves = draftOf(LEAVES, TODAY);
    expect(leaves.recurrence).toMatchObject({ freq: 'WEEKLY', byday: ['SA'], ends: 'until', until: '2026-11-30', start: '2026-10-17' });
    expect(leaves.estimate).toBe(60);
  });

  it('notices changes, and keeps this screen\'s on top of another screen\'s', () => {
    const record = beginChoreDraft(BATHROOM, TODAY);
    expect(record.rev).toBe(3);
    expect(isDirty(record)).toBe(false);
    const edited = { ...record, draft: edit(record.draft, { name: 'Bathroom' }) };
    expect(isDirty(edited)).toBe(true);
    const newer = { ...BATHROOM, needs_ok: false, rev: 4 };
    const rebased = rebaseChore(edited, newer, TODAY);
    expect(rebased.rev).toBe(4);
    expect(rebased.draft).toMatchObject({ name: 'Bathroom', needs_ok: false });
  });
});

describe('what Save sends', () => {
  it('sends a Plan chore in hours, with shares only while the time is split', () => {
    const record = beginChoreDraft(BATHROOM, TODAY);
    expect(choreChanges(record)).toEqual({
      name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', schedule: 'plan', assignees: ['blair', 'casey'],
      needs_ok: true, stars: null, label: null, on_board: true, minimum: { hours: 2, per: 'week' }, split: 'shared',
      shares: { blair: 1, casey: 1 }, times: 1, days: [], time_of_day: [],
    });
    const one = { ...record, draft: edit(record.draft, { assignees: ['casey'] }) };
    expect(choreChanges(one)).toMatchObject({ split: 'each', shares: null });
  });

  it('sends a Once chore by its date and a Repeats chore by its rule', () => {
    expect(choreChanges(beginChoreDraft(GARAGE, TODAY)).once).toEqual({
      on: null, by: '2026-10-18', by_time: null, sessions: 2, estimate_minutes: 240,
    });
    const record = beginChoreDraft(LEAVES, TODAY);
    expect(choreChanges(record).repeats).toEqual({
      rrule: 'FREQ=WEEKLY;BYDAY=SA;UNTIL=20261130', start: '2026-10-17', window: 'day', estimate_minutes: 60,
    });
    const daily = { ...record, draft: edit(record.draft, { recurrence: { ...record.draft.recurrence, freq: 'DAILY' }, window: 'period' }) };
    expect(choreChanges(daily).repeats!.window).toBe('day');
  });

  it('turns off a to-do chore\'s OK for every check-off only when asked', () => {
    const record = beginChoreDraft(activity('brush_teeth', { needs_ok: true, needs_ok_always: true, minimum: { hours: 0.1, per: 'day' } }), TODAY);
    expect(choreChanges(record)).not.toHaveProperty('needs_ok_always');
    expect(choreChanges({ ...record, draft: edit(record.draft, { needs_ok: false, needs_ok_always: false }) }).needs_ok_always).toBe(false);
  });
});

describe('checks before saving', () => {
  const plan = draftOf(BATHROOM, TODAY);

  it('needs a name and shares that add up', () => {
    expect(choreProblem(edit(plan, { name: ' ' }), TODAY)).toBe('Add a name.');
    expect(choreProblem(edit(plan, { shares: { blair: 60, casey: 45 } }), TODAY)).toBe('Everyone\'s share has to add up to the time.');
    expect(choreProblem(plan, TODAY)).toBeNull();
  });

  it('needs a date from today on, and a rule that happens', () => {
    const once = draftOf(GARAGE, TODAY);
    expect(choreProblem(edit(once, { date: '2026-10-01' }), TODAY)).toBe('Pick today or a later day.');
    expect(choreProblem(edit(once, { date: '2026-10-01' }), TODAY, '2026-10-01')).toBeNull();
    const leaves = draftOf(LEAVES, TODAY);
    const never = edit(leaves, { recurrence: { ...leaves.recurrence, until: '2026-10-16' } });
    expect(choreProblem(never, TODAY)).toBe('This never happens. Pick another day or a later end date.');
  });

  it('says how the shares stand', () => {
    expect(sharesStatus(plan)).toEqual({ ok: true, text: '✓ The shares add up to 2 h.' });
    expect(sharesStatus(edit(plan, { shares: { blair: 60, casey: 30 } }))).toEqual({ ok: false, text: '30 min still unassigned.' });
    expect(sharesStatus(edit(plan, { shares: { blair: 90, casey: 45 } }))).toEqual({ ok: false, text: '15 min over the time.' });
    expect(evenShares(['blair', 'casey', 'dana'], 100)).toEqual({ blair: 40, casey: 30, dana: 30 });
  });
});

describe('the editor\'s lines', () => {
  it('says what each check-off is worth (spec 14.4)', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(worthText(plan, SETTINGS, MEMBERS)).toBe('Each check-off is worth about 1 h and ★ 4.');
    expect(worthText(edit(plan, { shares: { blair: 90, casey: 30 } }), SETTINGS, MEMBERS)).toBe(
      'Each check-off is worth about 1 h 30 min and ★ 6 for Blair and 30 min and ★ 2 for Casey.',
    );
    expect(worthText(draftOf(GARAGE, TODAY), SETTINGS, MEMBERS)).toBe('Each session is worth about 2 h and ★ 8.');
    expect(worthText(draftOf(LEAVES, TODAY), SETTINGS, MEMBERS)).toBe('Each time is worth about 1 h and ★ 4.');
    expect(worthText(edit(draftOf(LEAVES, TODAY), { stars: 10 }), SETTINGS, MEMBERS)).toBe('Each time is worth about 1 h and ★ 10.');
  });

  it('says who waits for an OK', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(okText(plan, MEMBERS)).toBe("Casey's check-offs wait for an OK. Blair is a parent, so Blair's count right away.");
    expect(okText(edit(plan, { needs_ok: false }), MEMBERS)).toBe('');
    expect(okText(edit(plan, { needs_ok: false, assignees: ['dana'] }), MEMBERS)).toBe(
      "Dana's check-offs still wait for an OK: every chore of Dana's needs one.",
    );
    expect(okText(edit(plan, { assignees: ['alex', 'casey', 'dana'] }), MEMBERS)).toBe(
      "Check-offs by Casey and Dana wait for an OK. Alex is a parent, so Alex's count right away.",
    );
  });

  it('explains when a chore shows', () => {
    const plan = draftOf(BATHROOM, TODAY);
    expect(whenText(plan)).toBe('No days or times picked, so any time this week works. It waits under This week on the board.');
    expect(whenText(edit(plan, { days: ['mon', 'thu'] }))).toBe('2 h split across 2 days.');
    const once = draftOf(GARAGE, TODAY);
    expect(onceText(once, TODAY)).toBe('On the board from today until Sunday. Each session is its own check-off.');
    expect(onceText(edit(once, { once_when: 'on', sessions: 1 }), TODAY)).toBe('On the board on October 18.');
    expect(windowText('make_up')).toBe("Not done on the day? The house rule decides. Right now that's: make it up within the week.");
  });

  it('writes a ready-to-copy automation', () => {
    expect(automationExample('clean_the_bathroom', 'casey')).toBe(
      'action: planavista.complete_chore\ndata:\n  member: casey\n  chore: clean_the_bathroom',
    );
  });
});
```

`custom_components/planavista/frontend/test/chores-entities.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { memberEntities } from '../src/modules/chores/settings/entities';

describe('memberEntities', () => {
  it('finds the ids Home Assistant gave a person\'s chores entities by their names', () => {
    const states = {
      'todo.casey_chores_2': { attributes: { friendly_name: 'Casey Chores' } },
      'sensor.casey_stars': { attributes: { friendly_name: 'Casey Stars' } },
      'sensor.casey_chores_left': { attributes: { friendly_name: 'Casey Chores left' } },
      'event.casey_chores': { attributes: { friendly_name: 'Casey Chores' } },
    };
    expect(memberEntities(states, { id: 'casey', name: 'Casey' })).toEqual([
      { label: 'To-do list', entity_id: 'todo.casey_chores_2' },
      { label: 'Chores left today', entity_id: 'sensor.casey_chores_left' },
      { label: 'Stars', entity_id: 'sensor.casey_stars' },
      { label: 'Done for today', entity_id: 'binary_sensor.casey_chores_done' },
      { label: 'Events', entity_id: 'event.casey_chores' },
    ]);
  });

  it('falls back to the ids they were made with', () => {
    expect(memberEntities(undefined, { id: 'dana', name: 'Dana' })[0]).toEqual({ label: 'To-do list', entity_id: 'todo.dana_chores' });
  });
});
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_recurrence.py -q` Expected: `436 passed` at once: the table pins milestone 4's recurrence. `npx vitest run test/recurrence.test.ts test/chore-draft.test.ts test/chores-entities.test.ts` Expected: FAIL: `recurrence.test.ts` imports `recurrenceValue` and `toRRule`, which don't exist yet, and the other two files can't load their modules.

- [ ] **Step 3: Write the recurrence values and the picker.**

`custom_components/planavista/frontend/src/core/recurrence.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/recurrence.ts b/custom_components/planavista/frontend/src/core/recurrence.ts
index 13e2bd0..bed9038 100644
--- a/custom_components/planavista/frontend/src/core/recurrence.ts
+++ b/custom_components/planavista/frontend/src/core/recurrence.ts
@@ -102,3 +102,166 @@ export function ruleText(rule: Rule, window: 'day' | 'period' = 'day'): string {
   if (rule.count) return `${text}, ${rule.count} ${rule.count === 1 ? 'time' : 'times'}`;
   return text;
 }
+
+// The picker's value ------------------------------------------------------------------------
+
+/** What pv-recurrence-picker edits: a rule, and the day it starts. */
+export interface RecurrenceValue {
+  freq: Freq;
+  interval: number;
+  byday: Weekday[];
+  bymonthday: number | null;
+  ends: 'never' | 'count' | 'until';
+  /** Kept while another ending is picked, so switching back keeps it. */
+  count: number;
+  until: string;
+  /** YYYY-MM-DD. */
+  start: string;
+}
+
+const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
+  'November', 'December'];
+
+function dateOf(iso: string): Date {
+  const [year, month, day] = iso.split('-').map(Number);
+  return new Date(Date.UTC(year, month - 1, day));
+}
+
+function isoOf(date: Date): string {
+  return date.toISOString().slice(0, 10);
+}
+
+/** Monday is 0, as the engine counts (date.weekday()). */
+function weekdayIndex(iso: string): number {
+  return (dateOf(iso).getUTCDay() + 6) % 7;
+}
+
+export function weekdayOf(iso: string): Weekday {
+  return WEEKDAYS[weekdayIndex(iso)];
+}
+
+function addDays(iso: string, days: number): string {
+  const date = dateOf(iso);
+  date.setUTCDate(date.getUTCDate() + days);
+  return isoOf(date);
+}
+
+/** "November 30". */
+export function longDate(iso: string): string {
+  const [, month, day] = iso.split('-').map(Number);
+  return `${LONG_MONTHS[month - 1]} ${day}`;
+}
+
+/** The value for a stored rule, or a new one: every week on the start's weekday, never ending. */
+export function recurrenceValue(rrule: string | null | undefined, start: string): RecurrenceValue {
+  const rule = rrule ? parseRule(rrule) : null;
+  const fallbackUntil = addDays(start, 56);
+  if (!rule) {
+    return { freq: 'WEEKLY', interval: 1, byday: [weekdayOf(start)], bymonthday: null, ends: 'never', count: 4, until: fallbackUntil, start };
+  }
+  return {
+    freq: rule.freq,
+    interval: rule.interval,
+    byday: rule.byday,
+    bymonthday: rule.bymonthday,
+    ends: rule.count ? 'count' : rule.until ? 'until' : 'never',
+    count: rule.count ?? 4,
+    until: rule.until ?? fallbackUntil,
+    start,
+  };
+}
+
+/** The RRULE the picker's value makes, in the subset the engine follows. */
+export function toRRule(value: RecurrenceValue): string {
+  const parts = [`FREQ=${value.freq}`];
+  if (value.interval > 1) parts.push(`INTERVAL=${value.interval}`);
+  if (value.freq === 'WEEKLY' && value.byday.length) parts.push(`BYDAY=${WEEKDAYS.filter(d => value.byday.includes(d)).join(',')}`);
+  if (value.freq === 'MONTHLY' && value.bymonthday) parts.push(`BYMONTHDAY=${value.bymonthday}`);
+  if (value.ends === 'count') parts.push(`COUNT=${value.count}`);
+  if (value.ends === 'until') parts.push(`UNTIL=${value.until.replace(/-/g, '')}`);
+  return parts.join(';');
+}
+
+function daysInMonth(year: number, month: number): number {
+  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
+}
+
+/**
+ * The dates a rule happens on from `start` through `last`, as the engine
+ * works them out (chores/recurrence.py): weeks start on Monday, a weekly
+ * rule without days repeats on the start's weekday, a monthly one on its
+ * day of the month (skipping months that don't have it), and COUNT counts
+ * from the start. At most `max` dates.
+ */
+export function instanceDates(rule: Rule, start: string, last: string, max = 1000): string[] {
+  const out: string[] = [];
+  const end = rule.until && rule.until < last ? rule.until : last;
+  const push = (iso: string): boolean => {
+    if (iso > end || (rule.count !== null && out.length >= rule.count) || out.length >= max) return false;
+    out.push(iso);
+    return true;
+  };
+  if (rule.freq === 'DAILY') {
+    for (let iso = start; iso <= end; iso = addDays(iso, rule.interval)) if (!push(iso)) break;
+    return out;
+  }
+  if (rule.freq === 'WEEKLY') {
+    const days = rule.byday.length ? rule.byday.map(d => WEEKDAYS.indexOf(d)) : [weekdayIndex(start)];
+    days.sort((a, b) => a - b);
+    for (let monday = addDays(start, -weekdayIndex(start)); monday <= end; monday = addDays(monday, 7 * rule.interval)) {
+      for (const day of days) {
+        const iso = addDays(monday, day);
+        if (iso >= start && !push(iso)) return out;
+      }
+    }
+    return out;
+  }
+  const dayOfMonth = rule.bymonthday ?? dateOf(start).getUTCDate();
+  const first = dateOf(start);
+  for (let months = 0; ; months += rule.interval) {
+    const year = first.getUTCFullYear() + Math.floor((first.getUTCMonth() + months) / 12);
+    const month = (first.getUTCMonth() + months) % 12;
+    if (isoOf(new Date(Date.UTC(year, month, 1))) > end) return out;
+    if (dayOfMonth <= daysInMonth(year, month)) {
+      const iso = isoOf(new Date(Date.UTC(year, month, dayOfMonth)));
+      if (iso >= start && !push(iso)) return out;
+    }
+  }
+}
+
+function joinAnd(words: string[]): string {
+  if (words.length <= 1) return words.join('');
+  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
+}
+
+/** The picker's line under the rule (spec 14.4): "Every Saturday until November 30: 7 times." */
+export function recurrenceSummary(value: RecurrenceValue): string {
+  const rule = parseRule(toRRule(value));
+  if (!rule) return '';
+  let base: string;
+  if (rule.freq === 'DAILY') {
+    base = rule.interval === 1 ? 'Every day' : `Every ${rule.interval} days`;
+  } else if (rule.freq === 'WEEKLY') {
+    const days = joinAnd((rule.byday.length ? rule.byday : [weekdayOf(value.start)]).map(d => LONG[d]));
+    base = rule.interval === 1 ? `Every ${days}` : `Every ${rule.interval} weeks on ${days}`;
+  } else {
+    const day = ordinal(rule.bymonthday ?? dateOf(value.start).getUTCDate());
+    base = rule.interval === 1 ? `Every month on the ${day}` : `Every ${rule.interval} months on the ${day}`;
+  }
+  const times = (n: number) => `${n} ${n === 1 ? 'time' : 'times'}`;
+  if (rule.until) {
+    const count = instanceDates(rule, value.start, rule.until).length;
+    return count ? `${base} until ${longDate(rule.until)}: ${times(count)}.` : 'This never happens. Pick a later end date.';
+  }
+  if (rule.count) {
+    const dates = instanceDates(rule, value.start, addDays(value.start, 366 * 30));
+    return dates.length ? `${base}, ${times(dates.length)}, ending ${longDate(dates[dates.length - 1])}.` : '';
+  }
+  return `${base}, from ${longDate(value.start)}.`;
+}
+
+/** Whether the rule happens at least once from its start (the engine refuses one that never does). */
+export function happens(value: RecurrenceValue): boolean {
+  const rule = parseRule(toRRule(value));
+  return !!rule && instanceDates(rule, value.start, addDays(value.start, 366 * 5), 1).length > 0;
+}
```

`custom_components/planavista/frontend/src/core/pv-recurrence-picker.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { Freq, RecurrenceValue, WEEKDAYS, Weekday, ordinal, recurrenceSummary, weekdayOf } from './recurrence';

const DAY_LETTERS: Record<Weekday, [string, string]> = {
  MO: ['M', 'Monday'], TU: ['T', 'Tuesday'], WE: ['W', 'Wednesday'], TH: ['T', 'Thursday'], FR: ['F', 'Friday'],
  SA: ['S', 'Saturday'], SU: ['S', 'Sunday'],
};
const UNITS: Record<Freq, [string, string]> = { DAILY: ['day', 'days'], WEEKLY: ['week', 'weeks'], MONTHLY: ['month', 'months'] };

/**
 * pv-recurrence-picker: how something repeats, in the subset the engine
 * follows (spec 14.4): every day, week, or month; every N; the days of the
 * week or the day of the month; when it starts; and when it ends (never,
 * after a number of times, or on a date), with a line that says it back
 * ("Every Saturday until November 30: 7 times."). Shared, so the calendar
 * can reuse it for its own repeating events.
 *
 * @fires pv-recurrence-change - detail: the new RecurrenceValue
 */
export class PvRecurrencePicker extends LitElement {
  @property({ attribute: false }) value!: RecurrenceValue;

  static styles = css`
    :host {
      display: block;
    }

    .group {
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      overflow: hidden;
    }

    .row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      min-height: 56px;
      padding: 8px 14px;
      box-sizing: border-box;
    }

    .row + .row {
      border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
    }

    .label {
      flex: 1;
      min-width: 80px;
    }

    .segmented {
      display: flex;
      flex: 1 1 100%;
      gap: 4px;
      padding: 4px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
    }

    .segmented button {
      flex: 1;
      min-height: 44px;
      border: none;
      border-radius: 9px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .segmented button[aria-pressed='true'] {
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      font-weight: 600;
    }

    .stepper {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .stepper output {
      min-width: 72px;
      text-align: right;
      font-weight: 700;
    }

    .stepper button,
    .day {
      width: 44px;
      height: 44px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .stepper button {
      border-radius: 10px;
      font-size: 1.25rem;
    }

    .stepper button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .days {
      display: flex;
      flex: 1 1 100%;
      gap: 6px;
      flex-wrap: wrap;
    }

    .day {
      border-radius: 50%;
      font-weight: 600;
    }

    .day[aria-pressed='true'] {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
      color: var(--pv-on-accent, #FFFFFF);
    }

    input,
    select {
      min-height: 44px;
      padding: 0 10px;
      border-radius: 10px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
    }

    .summary {
      margin: 8px 4px 0;
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #6B7280);
    }
  `;

  render() {
    const v = this.value;
    if (!v) return nothing;
    const [one, many] = UNITS[v.freq];
    return html`
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="Repeats">
            ${(['DAILY', 'WEEKLY', 'MONTHLY'] as Freq[]).map(freq => html`
              <button type="button" aria-pressed=${v.freq === freq ? 'true' : 'false'} @click=${() => this._freq(freq)}>
                ${freq === 'DAILY' ? 'Every day' : freq === 'WEEKLY' ? 'Every week' : 'Every month'}
              </button>
            `)}
          </div>
        </div>
        <div class="row">
          <span class="label">Every</span>
          <span class="stepper">
            <output>${v.interval} ${v.interval === 1 ? one : many}</output>
            <button type="button" aria-label="Less often" ?disabled=${v.interval <= 1}
              @click=${() => this._set({ interval: v.interval - 1 })}>−</button>
            <button type="button" aria-label="More often" ?disabled=${v.interval >= 99}
              @click=${() => this._set({ interval: v.interval + 1 })}>+</button>
          </span>
        </div>
        ${v.freq === 'WEEKLY' ? html`
          <div class="row">
            <span class="label">On</span>
            <div class="days" role="group" aria-label="Days of the week">
              ${WEEKDAYS.map(day => html`
                <button class="day" type="button" aria-label=${DAY_LETTERS[day][1]}
                  aria-pressed=${v.byday.includes(day) ? 'true' : 'false'} @click=${() => this._toggleDay(day)}>
                  ${DAY_LETTERS[day][0]}
                </button>
              `)}
            </div>
          </div>
        ` : nothing}
        ${v.freq === 'MONTHLY' ? html`
          <div class="row">
            <label class="label" for="monthday">On the</label>
            <select id="monthday" .value=${String(v.bymonthday ?? Number(v.start.slice(8, 10)))}
              @change=${(e: Event) => this._set({ bymonthday: Number((e.target as HTMLSelectElement).value) })}>
              ${Array.from({ length: 31 }, (_, i) => i + 1).map(day => html`
                <option value=${String(day)} ?selected=${(v.bymonthday ?? Number(v.start.slice(8, 10))) === day}>${ordinal(day)}</option>
              `)}
            </select>
          </div>
        ` : nothing}
        <div class="row">
          <label class="label" for="start">Starts</label>
          <input id="start" type="date" .value=${v.start}
            @change=${(e: Event) => this._start((e.target as HTMLInputElement).value)} />
        </div>
        <div class="row">
          <span class="label">Ends</span>
          <div class="segmented" role="group" aria-label="Ends">
            ${(['never', 'count', 'until'] as const).map(ends => html`
              <button type="button" aria-pressed=${v.ends === ends ? 'true' : 'false'} @click=${() => this._set({ ends })}>
                ${ends === 'never' ? 'Never' : ends === 'count' ? 'After a number of times' : 'On a date'}
              </button>
            `)}
          </div>
        </div>
        ${v.ends === 'count' ? html`
          <div class="row">
            <span class="label">Times</span>
            <span class="stepper">
              <output>${v.count}</output>
              <button type="button" aria-label="Fewer times" ?disabled=${v.count <= 1}
                @click=${() => this._set({ count: v.count - 1 })}>−</button>
              <button type="button" aria-label="More times" ?disabled=${v.count >= 999}
                @click=${() => this._set({ count: v.count + 1 })}>+</button>
            </span>
          </div>
        ` : nothing}
        ${v.ends === 'until' ? html`
          <div class="row">
            <label class="label" for="until">End date</label>
            <input id="until" type="date" .value=${v.until} min=${v.start}
              @change=${(e: Event) => this._set({ until: (e.target as HTMLInputElement).value || v.until })} />
          </div>
        ` : nothing}
      </div>
      <p class="summary" aria-live="polite">${recurrenceSummary(v)}</p>
    `;
  }

  private _set(patch: Partial<RecurrenceValue>): void {
    this.value = { ...this.value, ...patch };
    this.dispatchEvent(new CustomEvent('pv-recurrence-change', { detail: this.value, bubbles: true, composed: true }));
  }

  private _freq(freq: Freq): void {
    const v = this.value;
    if (freq === v.freq) return;
    this._set({
      freq,
      byday: freq === 'WEEKLY' ? (v.byday.length ? v.byday : [weekdayOf(v.start)]) : [],
      bymonthday: freq === 'MONTHLY' ? v.bymonthday ?? Number(v.start.slice(8, 10)) : null,
    });
  }

  private _toggleDay(day: Weekday): void {
    const days = this.value.byday.includes(day) ? this.value.byday.filter(d => d !== day) : [...this.value.byday, day];
    this._set({ byday: WEEKDAYS.filter(d => days.includes(d)) });
  }

  private _start(start: string): void {
    if (!start) return;
    this._set({ start, until: this.value.until < start ? start : this.value.until });
  }
}

defineElement('pv-recurrence-picker', PvRecurrencePicker);
```

`custom_components/planavista/frontend/src/core/clipboard.ts` (new):

```ts
/**
 * Copy text for Use in automations. The Clipboard API needs a secure page,
 * and a wall tablet often opens Home Assistant over plain http on the home
 * network, so a selected text area and execCommand take over there.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the older way.
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}
```

- [ ] **Step 4: Write the editor.**

`custom_components/planavista/frontend/src/modules/chores/settings/chore-draft.ts` (new):

```ts
import type { Member } from '../../../core/household';
import { RecurrenceValue, happens, longDate, recurrenceValue, toRRule } from '../../../core/recurrence';
import { starsFor } from '../../../core/stars';
import type { Activity, Band, ChoresSettings } from '../chores-types';
import { checkoffMinutes } from '../worth';
import { dayText, durationText } from './chores-list-derive';

export type Schedule = 'plan' | 'once' | 'repeats';
export type OnceWhen = 'on' | 'by' | 'any';

/** What the chore editor edits (spec 14.4). Times are whole minutes; they're saved as the engine's hours. */
export interface ChoreDraft {
  name: string;
  icon: string | null;
  category: string;
  schedule: Schedule;
  assignees: string[];
  on_board: boolean;
  needs_ok: boolean;
  /** Added from a to-do list by someone who isn't a parent: every check-off waits (spec 10.3). */
  needs_ok_always: boolean;
  /** null works them out from the time. */
  stars: number | null;
  label: string;
  // Plan
  minutes: number;
  per: 'day' | 'week';
  split: 'shared' | 'each';
  /** Each person's share in minutes, when the time is split. */
  shares: Record<string, number>;
  times: number;
  days: string[];
  time_of_day: Band[];
  // Once
  once_when: OnceWhen;
  date: string;
  /** HH:MM, or null for the end of the day. */
  by_time: string | null;
  sessions: number;
  /** About how long: a Once chore in all, a Repeats chore each time. */
  estimate: number;
  // Repeats
  recurrence: RecurrenceValue;
  window: 'day' | 'period';
}

/** An edit in progress, kept on the card like a person's (spec 14.1, 9.4). */
export interface ChoreRecord {
  draft: ChoreDraft;
  start: ChoreDraft;
  /** The revision the edit began from; null for a new chore. */
  rev: number | null;
}

export const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'home', label: 'Home and yard' },
  { id: 'personal', label: 'Personal' },
  { id: 'school', label: 'School' },
  { id: 'work', label: 'Work' },
  { id: 'family', label: 'Family' },
  { id: 'other', label: 'Other' },
];

export const DAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Shares split evenly in 5-minute steps; what's left over goes to the first person. */
export function evenShares(assignees: string[], minutes: number): Record<string, number> {
  if (!assignees.length) return {};
  const each = Math.floor(minutes / assignees.length / 5) * 5;
  const shares: Record<string, number> = {};
  for (const id of assignees) shares[id] = each;
  shares[assignees[0]] += minutes - each * assignees.length;
  return shares;
}

/** The editor's starting point: the chore as saved, or a new one (spec 14.4). */
export function draftOf(activity: Activity | null, today: string, assignees: string[] = []): ChoreDraft {
  const recurrence = recurrenceValue(activity?.repeats?.rrule ?? null, activity?.repeats?.start ?? today);
  const draft: ChoreDraft = {
    name: '', icon: null, category: 'other', schedule: 'plan', assignees, on_board: true, needs_ok: false,
    needs_ok_always: false, stars: null, label: '', minutes: 15, per: 'day', split: 'each', shares: {}, times: 1,
    days: [], time_of_day: [], once_when: 'by', date: today, by_time: null, sessions: 1, estimate: 30, recurrence,
    window: 'day',
  };
  if (!activity) return draft;
  draft.name = activity.name;
  draft.icon = activity.icon;
  draft.category = activity.category || 'other';
  draft.schedule = activity.schedule;
  draft.assignees = [...(activity.assignees ?? [])];
  draft.on_board = activity.on_board !== false;
  draft.needs_ok = !!activity.needs_ok;
  draft.needs_ok_always = !!activity.needs_ok_always;
  draft.stars = activity.stars ?? null;
  draft.label = activity.label ?? '';
  if (activity.minimum) {
    draft.minutes = Math.round(activity.minimum.hours * 60);
    draft.per = activity.minimum.per;
  }
  draft.split = activity.split === 'shared' ? 'shared' : 'each';
  if (activity.shares) {
    draft.shares = Object.fromEntries(Object.entries(activity.shares).map(([id, hours]) => [id, Math.round(hours * 60)]));
  }
  draft.times = activity.times ?? 1;
  draft.days = [...(activity.days ?? [])];
  draft.time_of_day = [...(activity.time_of_day ?? [])];
  if (activity.once) {
    draft.once_when = activity.once.on ? 'on' : activity.once.by ? 'by' : 'any';
    draft.date = activity.once.on ?? activity.once.by ?? today;
    draft.by_time = activity.once.by_time;
    draft.sessions = activity.once.sessions;
    draft.estimate = activity.once.estimate_minutes;
  }
  if (activity.repeats) {
    draft.window = activity.repeats.window;
    draft.estimate = activity.repeats.estimate_minutes;
  }
  return draft;
}

export function beginChoreDraft(activity: Activity | null, today: string, assignees: string[] = []): ChoreRecord {
  const start = draftOf(activity, today, assignees);
  return { draft: start, start, rev: activity ? activity.rev ?? 1 : null };
}

export function isDirty(record: ChoreRecord): boolean {
  return !same(record.draft, record.start);
}

/**
 * Keep editing after "This changed on another screen": this screen's own
 * changes on top of the version saved there, saved with its revision.
 */
export function rebaseChore(record: ChoreRecord, activity: Activity, today: string): ChoreRecord {
  const start = draftOf(activity, today);
  const draft: Record<string, unknown> = { ...start };
  for (const key of Object.keys(record.draft) as Array<keyof ChoreDraft>) {
    if (!same(record.draft[key], record.start[key])) draft[key] = record.draft[key];
  }
  return { draft: draft as unknown as ChoreDraft, start, rev: activity.rev ?? 1 };
}

/** What Save sends: the chore's fields for its schedule; anything the editor doesn't show is kept (spec 14.4). */
export function choreChanges(record: ChoreRecord): Partial<Activity> {
  const d = record.draft;
  const shared = d.split === 'shared' && d.assignees.length > 1;
  const changes: Partial<Activity> = {
    name: d.name.trim(), icon: d.icon, category: d.category, schedule: d.schedule, assignees: d.assignees,
    needs_ok: d.needs_ok, stars: d.stars, label: d.label.trim() || null,
  };
  if (record.start.needs_ok_always && !d.needs_ok_always) changes.needs_ok_always = false;
  if (d.schedule === 'plan') {
    Object.assign(changes, {
      on_board: d.on_board,
      minimum: { hours: d.minutes / 60, per: d.per },
      split: shared ? 'shared' : 'each',
      shares: shared ? Object.fromEntries(d.assignees.map(id => [id, (d.shares[id] ?? 0) / 60])) : null,
      times: d.times,
      days: DAY_CODES.filter(day => d.days.includes(day)),
      time_of_day: (['morning', 'afternoon', 'evening'] as Band[]).filter(band => d.time_of_day.includes(band)),
    });
  } else if (d.schedule === 'once') {
    changes.on_board = true;
    changes.once = {
      on: d.once_when === 'on' ? d.date : null,
      by: d.once_when === 'by' ? d.date : null,
      by_time: d.once_when === 'by' ? d.by_time : null,
      sessions: d.sessions,
      estimate_minutes: d.estimate,
    };
  } else {
    changes.on_board = true;
    changes.repeats = {
      rrule: toRRule(d.recurrence),
      start: d.recurrence.start,
      window: d.recurrence.freq === 'DAILY' ? 'day' : d.window,
      estimate_minutes: d.estimate,
    };
  }
  return changes;
}

/** How the shares stand (spec 14.4: "✓ The shares add up to 2 h."). */
export function sharesStatus(d: ChoreDraft): { ok: boolean; text: string } {
  const total = d.assignees.reduce((sum, id) => sum + (d.shares[id] ?? 0), 0);
  const left = d.minutes - total;
  if (left === 0) return { ok: true, text: `✓ The shares add up to ${durationText(d.minutes)}.` };
  return left > 0
    ? { ok: false, text: `${durationText(left)} still unassigned.` }
    : { ok: false, text: `${durationText(-left)} over the time.` };
}

/** A problem to fix before saving, or null. The backend checks again. */
export function choreProblem(d: ChoreDraft, today: string, startDate: string | null = null): string | null {
  if (!d.name.trim()) return 'Add a name.';
  if (d.schedule === 'plan') {
    if (d.minutes <= 0) return 'Add how long it takes.';
    if (d.split === 'shared' && d.assignees.length > 1 && !sharesStatus(d).ok) {
      return 'Everyone\'s share has to add up to the time.';
    }
  }
  if (d.schedule === 'once' && d.once_when !== 'any') {
    if (!d.date) return 'Pick a date.';
    if (d.date < today && d.date !== startDate) return 'Pick today or a later day.';
  }
  if (d.schedule !== 'plan' && d.estimate <= 0) return 'Add about how long it takes.';
  if (d.schedule === 'repeats' && !happens(d.recurrence)) return 'This never happens. Pick another day or a later end date.';
  return null;
}

function names(list: string[]): string {
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

/** The draft as a chore, for the worth rule. */
export function asActivity(d: ChoreDraft): Partial<Activity> {
  return choreChanges({ draft: d, start: d, rev: null });
}

/** The worth line (spec 14.4): "Each check-off is worth about 1 h and ★ 4." */
export function worthText(d: ChoreDraft, settings: Pick<ChoresSettings, 'minutes_per_star'>, members: Member[]): string {
  const activity = asActivity(d);
  const each = d.schedule === 'once'
    ? (d.sessions > 1 ? 'Each session is' : 'It\'s')
    : d.schedule === 'repeats' ? 'Each time is' : 'Each check-off is';
  const worth = (memberId?: string) => {
    const minutes = checkoffMinutes(activity, memberId);
    return `${durationText(minutes)} and ★ ${starsFor(minutes, settings.minutes_per_star, d.stars)}`;
  };
  const people = d.assignees.length ? d.assignees : [undefined];
  const values = people.map(id => worth(id));
  if (new Set(values).size <= 1) return `${each} worth about ${values[0]}.`;
  const byName = d.assignees.map((id, index) => `${values[index]} for ${members.find(m => m.id === id)?.name ?? id}`);
  return `${each} worth about ${names(byName)}.`;
}

/** Who waits for an OK on this chore, and who doesn't (spec 14.4's hint under Needs a parent's OK). */
export function okText(d: ChoreDraft, members: Member[]): string {
  const people = members.filter(m => d.assignees.includes(m.id));
  const marked = d.needs_ok || d.needs_ok_always;
  if (!people.length) return marked ? 'Check-offs wait for an OK for people whose setting is marked chores.' : '';
  const waits = (m: Member) => !m.parent
    && (d.needs_ok_always || m.needs_ok_for === 'all' || (m.needs_ok_for === 'marked' && d.needs_ok));
  const waiting = people.filter(waits).map(m => m.name);
  if (!marked) {
    if (!waiting.length) return '';
    return waiting.length === 1
      ? `${waiting[0]}'s check-offs still wait for an OK: every chore of ${waiting[0]}'s needs one.`
      : `Check-offs by ${names(waiting)} still wait for an OK: every chore of theirs needs one.`;
  }
  const parents = people.filter(m => m.parent).map(m => m.name);
  const others = people.filter(m => !m.parent && !waits(m)).map(m => m.name);
  const parts: string[] = [];
  if (waiting.length === 1) parts.push(`${waiting[0]}'s check-offs wait for an OK.`);
  else if (waiting.length) parts.push(`Check-offs by ${names(waiting)} wait for an OK.`);
  if (parents.length === 1) parts.push(`${parents[0]} is a parent, so ${parents[0]}'s count right away.`);
  else if (parents.length) parts.push(`${names(parents)} are parents, so theirs count right away.`);
  if (others.length) parts.push(`Check-offs by ${names(others)} count right away.`);
  return parts.join(' ');
}

/** The hint under When (spec 14.4). */
export function whenText(d: ChoreDraft): string {
  if (d.per === 'week' && !d.days.length && !d.time_of_day.length) {
    return 'No days or times picked, so any time this week works. It waits under This week on the board.';
  }
  if (d.per === 'week' && d.days.length > 1) return `${durationText(d.minutes)} split across ${d.days.length} days.`;
  if (d.per === 'day' && d.days.length) return 'Only on the days picked.';
  return '';
}

/** The hint under a Once chore's dates. */
export function onceText(d: ChoreDraft, today: string): string {
  const sessions = d.sessions > 1 ? ' Each session is its own check-off.' : '';
  if (d.once_when === 'on') return `On the board on ${longDate(d.date)}.${sessions}`;
  if (d.once_when === 'by') {
    return d.date === today ? `On the board today.${sessions}` : `On the board from today until ${dayText(d.date, today)}.${sessions}`;
  }
  return `On the board until it's done.${sessions}`;
}

const POLICY_WORDS: Record<string, string> = {
  make_up: 'make it up within the week',
  strict: 'strict days, so it counts as missed',
  carry_over: 'carry it over until done',
};

/** The hint under Each time, with the house rule (spec 14.4). */
export function windowText(policy: string): string {
  return `Not done on the day? The house rule decides. Right now that's: ${POLICY_WORDS[policy] ?? POLICY_WORDS.make_up}.`;
}

/** The ready-to-copy example (spec 14.4: Use in automations). */
export function automationExample(choreId: string, memberId: string | undefined): string {
  return `action: planavista.complete_chore\ndata:\n  member: ${memberId ?? 'casey'}\n  chore: ${choreId}`;
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/entities.ts` (new):

```ts
import type { Member } from '../../../core/household';

/** A person's chores entities (spec 10.2), as Use in automations lists them. */
export interface MemberEntity {
  label: string;
  entity_id: string;
}

/** What each entity is named after its device ("Casey Chores left"), and the id it starts with. */
const ENTITIES: Array<{ label: string; domain: string; name: string; suffix: string }> = [
  { label: 'To-do list', domain: 'todo', name: 'Chores', suffix: 'chores' },
  { label: 'Chores left today', domain: 'sensor', name: 'Chores left', suffix: 'chores_left' },
  { label: 'Stars', domain: 'sensor', name: 'Stars', suffix: 'stars' },
  { label: 'Done for today', domain: 'binary_sensor', name: 'Chores done', suffix: 'chores_done' },
  { label: 'Events', domain: 'event', name: 'Chores', suffix: 'chores' },
];

type States = Record<string, { attributes?: { friendly_name?: unknown } } | undefined>;

/**
 * The entity ids Home Assistant gave a person's chores entities: found by
 * their names (the device is named after the person), else the ids they
 * were made with. Renaming a person keeps the ids (spec 10.1).
 */
export function memberEntities(states: States | undefined, member: Pick<Member, 'id' | 'name'>): MemberEntity[] {
  const all = Object.keys(states ?? {});
  return ENTITIES.map(({ label, domain, name, suffix }) => {
    const wanted = `${member.name} ${name}`.toLocaleLowerCase();
    const found = all.find(id => id.startsWith(`${domain}.`)
      && String(states?.[id]?.attributes?.friendly_name ?? '').toLocaleLowerCase() === wanted);
    return { label, entity_id: found ?? `${domain}.${member.id}_${suffix}` };
  });
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
index 8f1c9a5..1d042a2 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/settings-styles.ts
@@ -183,6 +183,10 @@ export const choresSettingsStyles = css`
     background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
   }
 
+  .row > .segmented {
+    flex: 1;
+  }
+
   .segmented button {
     flex: 1;
     min-height: 44px;
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chore-editor.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR, POP_PAGE } from '../../../core/page-host';
import { copyText } from '../../../core/clipboard';
import { errorCode, errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Activity, Band, Board } from '../chores-types';
import { pictureFor } from '../picture-words';
import { checkoffStars } from '../worth';
import {
  CATEGORIES, ChoreDraft, ChoreRecord, DAY_CODES, Schedule, asActivity, automationExample, beginChoreDraft,
  choreChanges, choreProblem, evenShares, isDirty, okText, onceText, rebaseChore, sharesStatus, whenText, windowText,
  worthText,
} from './chore-draft';
import { durationText } from './chores-list-derive';
import { memberEntities } from './entities';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';
import '../../../core/pv-recurrence-picker';
import '../../../shell/pv-notice-sheet';

type Notice = 'discard' | 'delete' | 'changed';

const SCHEDULE_LEADS: Record<Schedule, string> = {
  plan: 'Part of the household plan: a set amount of time each day or each week.',
  once: 'One time, on a day or by a date.',
  repeats: 'On a schedule, like every Saturday or once a month.',
};
const DAY_LETTERS: Record<string, [string, string]> = {
  mon: ['M', 'Monday'], tue: ['T', 'Tuesday'], wed: ['W', 'Wednesday'], thu: ['T', 'Thursday'], fri: ['F', 'Friday'],
  sat: ['S', 'Saturday'], sun: ['S', 'Sunday'],
};
const BANDS: Array<[Band, string]> = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']];
const ESTIMATES = [15, 30, 60, 120, 240];
const PICTURES = ['🍽️', '🧽', '🧺', '🛏️', '🧸', '🐠', '🐱', '🐕', '🐾', '🍴', '🧹', '🛁', '🍂', '🌿', '🛒', '🪴', '🚗', '📦',
  '🍳', '📚', '🪥', '🔨', '🔧', '💵', '✨', '🗑️', '🧼', '🪣', '🛋️', '🌀'];

/** Steps of 5 minutes under an hour, then of 15. */
function step(minutes: number, up: boolean): number {
  if (up) return minutes < 60 ? minutes + 5 : minutes + 15;
  return minutes <= 60 ? Math.max(5, minutes - 5) : minutes - 15;
}

/**
 * pv-chore-editor: one chore (spec 14.4). Plan, Once, or Repeats at the top;
 * who, the board settings, and Use in automations work the same for all
 * three. An editor: Cancel and Save, with the draft kept on the card so it
 * survives the end of parent mode, and the revision it began from saved
 * with it, so a version another screen saved is noticed.
 */
export class PvChoreEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _record!: ChoreRecord;
  @state() private _problem = '';
  @state() private _saving = false;
  @state() private _notice: Notice | null = null;
  @state() private _pictures = false;
  @state() private _otherEstimate = false;
  @state() private _copied = '';
  private _loaded = false;
  private _leave?: (ok: boolean) => void;

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _board(): Board | null {
    return this._chores?.board() ?? null;
  }

  private get _choreId(): string | null {
    return (this.pageProps.choreId as string | null | undefined) ?? null;
  }

  private get _activity(): Activity | null {
    return this._board?.chores.find(a => a.id === this._choreId) ?? null;
  }

  private get _draftKey(): string {
    return `chore:${this._choreId ?? 'new'}`;
  }

  private get _draft(): ChoreDraft {
    return this._record.draft;
  }

  protected willUpdate(): void {
    const board = this._board;
    if (!this._loaded && board && (this._choreId === null || this._activity)) {
      const kept = this.drafts.get(this._draftKey) as ChoreRecord | undefined;
      this._record = kept ?? beginChoreDraft(this._activity, board.today, (this.pageProps.assignees as string[] | undefined) ?? []);
      this._loaded = true;
    }
  }

  /** Settings asks before leaving a page with changes (spec 14.1). */
  confirmLeave(): Promise<boolean> {
    if (!this._loaded || !isDirty(this._record)) return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      :host([layout='landscape']) {
        margin: 0 auto;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .top .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .top .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .picture-button {
        display: grid;
        justify-items: center;
        gap: 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }

      .picture-button .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 1.0625rem;
        color: inherit;
        min-height: 44px;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        padding: 12px 14px;
      }

      .person {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        min-width: 56px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }

      .person[aria-pressed='false'] pv-member-avatar {
        opacity: 0.4;
      }

      .person[aria-pressed='true'] .name {
        font-weight: 700;
      }

      .check {
        position: absolute;
        top: 28px;
        left: calc(50% + 10px);
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
        font-size: 0.6875rem;
        box-shadow: 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      .days {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .day {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .day[aria-pressed='true'] {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-input,
      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .other {
        max-width: 120px;
      }

      pre {
        margin: 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.8125rem;
        white-space: pre-wrap;
      }

      .copy {
        min-height: 40px;
        margin-left: auto;
      }

      code {
        font-size: 0.875rem;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  render() {
    const board = this._board;
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    if (this._choreId !== null && !this._activity) {
      return html`<p class="gone">This chore was deleted on another screen.</p>`;
    }
    if (!this._loaded) return nothing;
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const isNew = this._choreId === null;
    return html`
      <div class="top">
        <button class="picture-button" type="button" aria-expanded=${this._pictures ? 'true' : 'false'}
          @click=${() => { this._pictures = !this._pictures; }}>
          <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'chore')}</span>Change picture
        </button>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !isDirty(this._record))}
            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
        </div>
      </div>
      ${this._pictures ? this._renderPictures() : nothing}
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" .value=${d.name} aria-label="Name"
            @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })} />
        </label>
      </div>
      <div class="segmented" role="group" aria-label="Schedule" style="margin-top: 14px">
        ${(['plan', 'once', 'repeats'] as Schedule[]).map(schedule => html`
          <button type="button" aria-pressed=${d.schedule === schedule ? 'true' : 'false'}
            @click=${() => this._change({ schedule })}>${schedule === 'plan' ? 'Plan' : schedule === 'once' ? 'Once' : 'Repeats'}</button>
        `)}
      </div>
      <p class="hint">${SCHEDULE_LEADS[d.schedule]}</p>
      ${this._renderWho(members)}
      ${d.schedule === 'plan' ? this._renderPlan(board) : d.schedule === 'once' ? this._renderOnce(board) : this._renderRepeats(board)}
      ${this._renderBoard(board, members)}
      ${this._activity ? this._renderAutomations(this._activity, members) : nothing}
      ${this._activity ? html`
        <button class="destructive" type="button" @click=${() => { this._notice = 'delete'; }}>Delete ${this._activity.name}…</button>
      ` : nothing}
      ${this._renderNotice()}
    `;
  }

  private _renderPictures() {
    const d = this._draft;
    return html`
      <div class="group">
        <div class="pictures" role="group" aria-label="Pictures">
          <button type="button" aria-pressed=${d.icon === null ? 'true' : 'false'} aria-label="From the name"
            title="From the name" @click=${() => this._pick(null)}>${pictureFor(d.name || 'chore')}</button>
          ${PICTURES.map(picture => html`
            <button type="button" aria-pressed=${d.icon === picture ? 'true' : 'false'} @click=${() => this._pick(picture)}>${picture}</button>
          `)}
        </div>
        <label class="row">
          <span class="row-text">Another emoji</span>
          <input class="pv-input other" type="text" maxlength="8" placeholder="🦖" aria-label="Another emoji"
            .value=${d.icon && !PICTURES.includes(d.icon) ? d.icon : ''}
            @input=${(e: Event) => { const value = (e.target as HTMLInputElement).value.trim(); this._change({ icon: value || null }); }} />
        </label>
      </div>
    `;
  }

  private _pick(icon: string | null): void {
    this._change({ icon });
    this._pictures = false;
  }

  private _renderWho(members: Member[]) {
    const d = this._draft;
    const shared = d.schedule === 'plan' && d.assignees.length > 1;
    return html`
      <h2 class="section-label">Who</h2>
      <div class="group">
        <div class="people" role="group" aria-label="Who">
          ${members.map(member => {
            const on = d.assignees.includes(member.id);
            return html`
              <button class="person" type="button" aria-pressed=${on ? 'true' : 'false'} @click=${() => this._toggleMember(member.id)}>
                <pv-member-avatar .member=${member} .hass=${this.hass} size="44"></pv-member-avatar>
                ${on ? html`<span class="check" aria-hidden="true">✓</span>` : nothing}
                <span class="name">${member.name}</span>
              </button>
            `;
          })}
        </div>
        ${shared ? html`
          <div class="row">
            <div class="segmented" role="group" aria-label="How the time is shared">
              <button type="button" aria-pressed=${d.split === 'shared' ? 'true' : 'false'}
                @click=${() => this._change({ split: 'shared', shares: evenShares(d.assignees, d.minutes) })}>Split the time</button>
              <button type="button" aria-pressed=${d.split === 'each' ? 'true' : 'false'}
                @click=${() => this._change({ split: 'each' })}>Each does it all</button>
            </div>
          </div>
          ${d.split === 'shared' ? members.filter(m => d.assignees.includes(m.id)).map(member => html`
            <div class="row">
              <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
              <span class="row-text">${member.name}</span>
              ${this._stepper(d.shares[member.id] ?? 0, value => this._change({ shares: { ...d.shares, [member.id]: value } }), `${member.name}'s share`, 0)}
            </div>
          `) : nothing}
        ` : nothing}
      </div>
      ${shared && d.split === 'shared' ? html`<p class="hint ${sharesStatus(d).ok ? 'ok' : ''}">${sharesStatus(d).text}</p>` : nothing}
      ${!d.assignees.length ? html`<p class="hint">No one yet: it waits off the board until someone is picked.</p>` : nothing}
      ${d.schedule !== 'plan' && d.assignees.length > 1 ? html`<p class="hint">With two or more people, each one gets their own check-off.</p>` : nothing}
    `;
  }

  private _stepper(value: number, set: (value: number) => void, label: string, min = 5, text = durationText(value)) {
    return html`
      <span class="stepper">
        <output>${value === 0 ? '0 min' : text}</output>
        <button type="button" aria-label="Less: ${label}" ?disabled=${value <= min} @click=${() => set(Math.max(min, step(value, false)))}>−</button>
        <button type="button" aria-label="More: ${label}" @click=${() => set(step(value, true))}>+</button>
      </span>
    `;
  }

  private _counter(value: number, set: (value: number) => void, label: string, text: string, min: number, max: number) {
    return html`
      <span class="stepper">
        <output>${text}</output>
        <button type="button" aria-label="Fewer: ${label}" ?disabled=${value <= min} @click=${() => set(value - 1)}>−</button>
        <button type="button" aria-label="More: ${label}" ?disabled=${value >= max} @click=${() => set(value + 1)}>+</button>
      </span>
    `;
  }

  private _renderPlan(board: Board) {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const unit = d.per === 'day' ? 'day' : 'week';
    return html`
      <h2 class="section-label">How much</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Time</span>
          ${this._stepper(d.minutes, minutes => this._setMinutes(minutes), 'time')}
        </div>
        <div class="row">
          <div class="segmented" role="group" aria-label="Each day or each week">
            <button type="button" aria-pressed=${d.per === 'day' ? 'true' : 'false'} @click=${() => this._change({ per: 'day' })}>Each day</button>
            <button type="button" aria-pressed=${d.per === 'week' ? 'true' : 'false'} @click=${() => this._change({ per: 'week' })}>Each week</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Check off</span>
          ${this._counter(d.times, times => this._change({ times }), 'check-offs',
            `${d.times} ${d.times === 1 ? 'time' : 'times'} a ${d.per === 'week' && d.days.length ? 'day picked' : unit}`, 1, 12)}
        </div>
      </div>
      <p class="hint">${worthText(d, board.settings, members)}</p>
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>Days</span>
            <div class="days" role="group" aria-label="Days">
              ${DAY_CODES.map(day => html`
                <button class="day" type="button" aria-label=${DAY_LETTERS[day][1]} aria-pressed=${d.days.includes(day) ? 'true' : 'false'}
                  @click=${() => this._change({ days: d.days.includes(day) ? d.days.filter(x => x !== day) : [...d.days, day] })}>
                  ${DAY_LETTERS[day][0]}
                </button>
              `)}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="stack">
            <span>Time of day</span>
            <div class="chips" role="group" aria-label="Time of day">
              ${BANDS.map(([band, label]) => html`
                <button class="chip chip--plain" type="button" aria-pressed=${d.time_of_day.includes(band) ? 'true' : 'false'}
                  @click=${() => this._change({
                    time_of_day: d.time_of_day.includes(band) ? d.time_of_day.filter(b => b !== band) : [...d.time_of_day, band],
                  })}>${label}</button>
              `)}
            </div>
          </div>
        </div>
      </div>
      ${whenText(d) ? html`<p class="hint">${whenText(d)}</p>` : nothing}
    `;
  }

  private _renderEstimate(board: Board, label: string) {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []);
    const other = this._otherEstimate || !ESTIMATES.includes(d.estimate);
    return html`
      <h2 class="section-label">How long</h2>
      <div class="group">
        <div class="row">
          <div class="stack">
            <span>${label}</span>
            <div class="chips" role="group" aria-label=${label}>
              ${ESTIMATES.map(minutes => html`
                <button class="chip chip--plain" type="button" aria-pressed=${!other && d.estimate === minutes ? 'true' : 'false'}
                  @click=${() => { this._otherEstimate = false; this._change({ estimate: minutes }); }}>${durationText(minutes)}</button>
              `)}
              <button class="chip chip--plain" type="button" aria-pressed=${other ? 'true' : 'false'}
                @click=${() => { this._otherEstimate = true; }}>Other…</button>
            </div>
            ${other ? html`
              <label class="row" style="padding: 0">
                <span class="row-text">Minutes</span>
                <input class="pv-input other" type="number" min="1" max="1440" inputmode="numeric" .value=${String(d.estimate)}
                  @input=${(e: Event) => this._change({ estimate: Math.max(0, Math.round(Number((e.target as HTMLInputElement).value) || 0)) })} />
              </label>
            ` : nothing}
          </div>
        </div>
      </div>
      <p class="hint">${worthText(d, board.settings, members)}</p>
    `;
  }

  private _renderOnce(board: Board) {
    const d = this._draft;
    return html`
      <h2 class="section-label">When</h2>
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="When">
            ${(['on', 'by', 'any'] as const).map(when => html`
              <button type="button" aria-pressed=${d.once_when === when ? 'true' : 'false'} @click=${() => this._change({ once_when: when })}>
                ${when === 'on' ? 'On a day' : when === 'by' ? 'By a date' : 'Any time'}
              </button>
            `)}
          </div>
        </div>
        ${d.once_when !== 'any' ? html`
          <label class="row">
            <span class="row-text">Date</span>
            <input class="pv-input" type="date" min=${board.today} .value=${d.date}
              @change=${(e: Event) => this._change({ date: (e.target as HTMLInputElement).value })} />
          </label>
        ` : nothing}
        ${d.once_when === 'by' ? html`
          <label class="row">
            <span class="row-text">By<span class="row-sub">Leave it empty for the end of the day.</span></span>
            <input class="pv-input" type="time" .value=${d.by_time ?? ''}
              @change=${(e: Event) => this._change({ by_time: (e.target as HTMLInputElement).value || null })} />
          </label>
        ` : nothing}
        <div class="row">
          <span class="row-text">Sessions</span>
          ${this._counter(d.sessions, sessions => this._change({ sessions }), 'sessions', String(d.sessions), 1, 20)}
        </div>
      </div>
      <p class="hint">${onceText(d, board.today)}</p>
      ${this._renderEstimate(board, 'About how long, in all')}
    `;
  }

  private _renderRepeats(board: Board) {
    const d = this._draft;
    const freq = d.recurrence.freq;
    return html`
      <h2 class="section-label">Repeats</h2>
      <pv-recurrence-picker .value=${d.recurrence}
        @pv-recurrence-change=${(e: CustomEvent) => this._change({ recurrence: e.detail })}></pv-recurrence-picker>
      ${freq !== 'DAILY' ? html`
        <h2 class="section-label">Each time</h2>
        <div class="segmented" role="group" aria-label="Each time">
          <button type="button" aria-pressed=${d.window === 'day' ? 'true' : 'false'} @click=${() => this._change({ window: 'day' })}>On the day</button>
          <button type="button" aria-pressed=${d.window === 'period' ? 'true' : 'false'} @click=${() => this._change({ window: 'period' })}>
            ${freq === 'MONTHLY' ? 'Any time that month' : 'Any time that week'}
          </button>
        </div>
        <p class="hint">${d.window === 'day' ? windowText(board.settings.missed) : 'It waits under This week on the board until it\'s done.'}</p>
      ` : nothing}
      ${this._renderEstimate(board, 'About how long')}
    `;
  }

  private _toggle(on: boolean, label: string, set: () => void, sub?: string) {
    return html`
      <div class="row toggle-row">
        <span class="row-text">
          <span>${label}</span>
          ${sub ? html`<span class="row-sub">${sub}</span>` : nothing}
        </span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  private _renderBoard(board: Board, members: Member[]) {
    const d = this._draft;
    const ok = d.needs_ok || d.needs_ok_always;
    const automatic = checkoffStars({ ...asActivity(d), stars: null }, board.settings.minutes_per_star);
    return html`
      <h2 class="section-label">On the board</h2>
      <div class="group">
        ${d.schedule === 'plan'
          ? this._toggle(d.on_board, 'Show on the board', () => this._change({ on_board: !d.on_board }),
            d.on_board ? undefined : 'Plan only: part of the household plan, but not checked off.')
          : nothing}
        ${this._toggle(ok, "Needs a parent's OK", () => this._change(ok ? { needs_ok: false, needs_ok_always: false } : { needs_ok: true }),
          okText(d, members) || undefined)}
        <div class="row">
          <span class="row-text">Stars<span class="row-sub">${d.stars === null ? `★ ${automatic} each, from the time` : `★ ${d.stars} each`}</span></span>
          <div class="segmented" role="group" aria-label="Stars" style="flex: 0 1 260px">
            <button type="button" aria-pressed=${d.stars === null ? 'true' : 'false'} @click=${() => this._change({ stars: null })}>Automatic</button>
            <button type="button" aria-pressed=${d.stars !== null ? 'true' : 'false'}
              @click=${() => this._change({ stars: d.stars ?? automatic })}>Set</button>
          </div>
        </div>
        ${d.stars !== null ? html`
          <div class="row">
            <span class="row-text">Stars each check-off</span>
            ${this._counter(d.stars, stars => this._change({ stars }), 'stars', `★ ${d.stars}`, 0, 100)}
          </div>
        ` : nothing}
        <label class="row">
          <span class="row-text">Category</span>
          <select class="pv-input pv-select" .value=${d.category}
            @change=${(e: Event) => this._change({ category: (e.target as HTMLSelectElement).value })}>
            ${CATEGORIES.map(c => html`<option value=${c.id} ?selected=${d.category === c.id}>${c.label}</option>`)}
          </select>
        </label>
      </div>
    `;
  }

  private _renderAutomations(activity: Activity, members: Member[]) {
    const owner = members.find(m => activity.assignees.includes(m.id));
    const example = automationExample(activity.id, owner?.id);
    const todo = owner ? memberEntities(this.hass?.states, owner)[0].entity_id : null;
    return html`
      <h2 class="section-label">Use in automations</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Chore ID<code>${activity.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(activity.id, 'id')}>
            ${this._copied === 'id' ? 'Copied' : 'Copy'}</button>
        </div>
        <div class="row">
          <div class="stack">
            <pre>${example}</pre>
            <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(example, 'yaml')}>
              ${this._copied === 'yaml' ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
      </div>
      <p class="hint">${todo ? `Or check it off on ${todo}. ` : ''}The ID stays the same even if the chore is renamed.</p>
    `;
  }

  private async _copy(text: string, what: string): Promise<void> {
    if (await copyText(text)) {
      this._copied = what;
      window.setTimeout(() => { if (this._copied === what) this._copied = ''; }, 2000);
    } else {
      this._error("Couldn't copy. Select the text and copy it instead.");
    }
  }

  private _renderNotice() {
    if (!this._notice) return nothing;
    if (this._notice === 'discard') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'discard', label: 'Discard', kind: 'destructive' }]}
          @pv-sheet-action=${this._onDiscardChoice}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'delete' && this._activity) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._activity.name}?"
          body="It leaves the board at once. Past weeks still show what was done, and stars stay earned."
          .actions=${[{ id: 'cancel', label: 'Cancel', kind: 'secondary' }, { id: 'delete', label: 'Delete', kind: 'destructive' }]}
          @pv-sheet-action=${this._onDeleteChoice}></pv-notice-sheet>
      `;
    }
    return html`
      <pv-notice-sheet .layout=${this.layout} heading="This changed on another screen."
        .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'load', label: 'Load the new version', kind: 'primary' }]}
        @pv-sheet-action=${this._onChangedChoice}></pv-notice-sheet>
    `;
  }

  private _change(patch: Partial<ChoreDraft>): void {
    const draft = { ...this._draft, ...patch };
    this._record = { ...this._record, draft };
    this._problem = '';
    this.drafts.set(this._draftKey, this._record);
  }

  private _setMinutes(minutes: number): void {
    const d = this._draft;
    const shares = d.split === 'shared' && d.assignees.length > 1 ? evenShares(d.assignees, minutes) : d.shares;
    this._change({ minutes, shares });
  }

  private _toggleMember(id: string): void {
    const d = this._draft;
    const members = inOrder(this.household?.members ?? []).map(m => m.id);
    const assignees = members.filter(m => (m === id ? !d.assignees.includes(id) : d.assignees.includes(m)));
    this._change({ assignees, shares: d.split === 'shared' ? evenShares(assignees, d.minutes) : d.shares });
  }

  private _pop(): void {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  }

  private _error(message: string): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message }, bubbles: true, composed: true }));
  }

  private _cancel(): void {
    if (isDirty(this._record)) {
      this._notice = 'discard';
      return;
    }
    this._pop();
  }

  private async _save(): Promise<void> {
    const board = this._board;
    const chores = this._chores;
    if (!board || !chores) return;
    const startDate = this._activity?.once?.on ?? this._activity?.once?.by ?? null;
    const problem = choreProblem(this._draft, board.today, startDate);
    if (problem) {
      this._problem = problem;
      return;
    }
    if (this._choreId !== null && !this._activity) {
      this._problem = 'This chore was deleted on another screen.';
      return;
    }
    this._saving = true;
    try {
      const existing = this._choreId !== null && this._record.rev !== null ? { id: this._choreId, rev: this._record.rev } : undefined;
      await chores.api.saveActivity(choreChanges(this._record), existing);
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      if (errorCode(err) === 'changed') this._notice = 'changed';
      else this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  }

  private _onDiscardChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const discard = event.detail.id === 'discard';
    if (discard) {
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, draft: this._record.start };
    }
    if (this._leave) {
      const leave = this._leave;
      this._leave = undefined;
      leave(discard);
    } else if (discard) {
      this._pop();
    }
  }

  private async _onDeleteChoice(event: CustomEvent<{ id: string }>): Promise<void> {
    event.stopPropagation();
    this._notice = null;
    const activity = this._activity;
    if (event.detail.id !== 'delete' || !activity || !this._chores) return;
    try {
      await this._chores.api.deleteActivity(activity.id);
      this.drafts.delete(this._draftKey);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't delete. Check the connection and try again.";
    }
  }

  private _onChangedChoice(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const activity = this._activity;
    const board = this._board;
    if (!activity || !board) return;
    if (event.detail.id === 'load') {
      this._record = beginChoreDraft(activity, board.today);
      this.drafts.delete(this._draftKey);
    } else {
      this._record = rebaseChore(this._record, activity, board.today);
      this.drafts.set(this._draftKey, this._record);
    }
  }
}

defineElement('pv-chore-editor', PvChoreEditor);
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index 2ca5f46..6e9c275 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -1,6 +1,7 @@
 // The Chores module: its elements, its Settings pages, and its entry in the module registry.
 import './pv-chores-module';
 import './settings/pv-chores-list-page';
+import './settings/pv-chore-editor';
 import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
```

- [ ] **Step 5: Run them again.** Same command. Expected: `46 passed`.
- [ ] **Step 6: Run the whole frontend suite.** Expected: tsc clean, `660 passed`; the backend suite, `1036 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(card): the chore editor and pv-recurrence-picker` with the trailers.

---

### Task 7: Rewards, Rules, and Reminders

Spec 14.5 (Rewards: a list, each reward on its own page; Rules: missed chores, the day's start, approving at the end of the day, minutes per star, sound; Reminders: the evening check, phone reminders per person, and which parents' phones get requests), 8.15 (rewards), and 9.9.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/settings/reward-draft.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/rules-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/reminders-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-rewards-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts`
- Modify: `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/core/household-client.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-client.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `custom_components/planavista/frontend/test/chores-house-rules.test.ts`, `custom_components/planavista/frontend/test/chores-settings.test.ts`

**Interfaces:**
- Consumes: Task 1's member fields; milestone 4's `planavista/chores/settings/save` and `planavista/rewards/save|delete`.
- Produces: `RewardDraft`, `RewardRecord`, `rewardDraftOf`, `beginRewardDraft`, `rewardDirty`, `rewardChanges`, `rewardProblem`, `nextCost`, `whoText`, `rewardLine`; `POLICIES`, `rulesSummary(settings)`, `eveningChoices(saved)`, `dayStartChoices`, `nextMinutesPerStar`; `notifyOf`, `phonesOf`, `phoneName(service)`, `remindersSummary`, `reminderRows`, `requestRows`, `namesText`; `ChoresApi.saveSettings`; `HouseholdApi.saveMember(changes, existing?)` without a revision; the pages `rewards`, `rules`, `reminders` and the elements `pv-rewards-page`, `pv-reward-editor`, `pv-rules-page`, `pv-reminders-page`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/chores-house-rules.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  POLICIES, dayStartChoices, eveningChoices, nextMinutesPerStar, rulesSummary,
} from '../src/modules/chores/settings/rules-derive';
import {
  namesText, notifyOf, phoneName, reminderRows, remindersSummary, requestRows,
} from '../src/modules/chores/settings/reminders-derive';
import {
  beginRewardDraft, nextCost, rewardChanges, rewardDirty, rewardLine, rewardProblem, whoText,
} from '../src/modules/chores/settings/reward-draft';
import { MEMBERS, person } from './chores-fixtures';

describe('Rules', () => {
  it('offers the three missed-chore rules with their words (spec 14.5)', () => {
    expect(POLICIES.map(p => p.label)).toEqual(['Make it up within the week', 'Strict days', 'Carry it over until done']);
    expect(rulesSummary({ missed: 'carry_over' })).toBe('Carry it over');
    expect(rulesSummary({ missed: 'make_up' })).toBe('Make it up');
  });

  it('lets the day start from midnight to 6:00 AM', () => {
    const choices = dayStartChoices();
    expect(choices[0]).toEqual({ value: '00:00', label: '12:00 AM' });
    expect(choices[6]).toEqual({ value: '03:00', label: '3:00 AM' });
    expect(choices[choices.length - 1]).toEqual({ value: '06:00', label: '6:00 AM' });
    expect(dayStartChoices('24h')[6].label).toBe('03:00');
  });

  it('steps the minutes per star by 5, then by 15', () => {
    expect([nextMinutesPerStar(15, true), nextMinutesPerStar(15, false), nextMinutesPerStar(60, true), nextMinutesPerStar(75, false)])
      .toEqual([20, 10, 75, 60]);
    expect([nextMinutesPerStar(5, false), nextMinutesPerStar(240, true), nextMinutesPerStar(7, true)]).toEqual([5, 240, 10]);
  });
});

describe('Reminders', () => {
  const casey = person('casey', { person: 'person.casey', phones: ['notify.mobile_app_caseys_phone'], notify: { reminders: true } });
  const alex = person('alex', { parent: true, person: 'person.alex', phones: ['notify.mobile_app_alex_phone'] });
  const blair = person('blair', { parent: true, person: 'person.blair' });
  const dana = person('dana', { age_group: 'young_child' });

  it('says the evening check time, or Off', () => {
    expect(remindersSummary({ evening_check: '19:00' })).toBe('7:00 PM');
    expect(remindersSummary({ evening_check: null })).toBe('Off');
    expect(eveningChoices('19:00').map(c => c.label)).toContain('7:00 PM');
    expect(eveningChoices('23:15').at(-1)).toEqual({ value: '23:15', label: '11:15 PM' });
  });

  it('lists phone reminders and parents\' requests, and who has no phone yet', () => {
    expect(reminderRows([alex, blair, casey]).rows.map(r => [r.member.id, r.on])).toEqual([['alex', false], ['casey', true]]);
    expect(reminderRows([alex, blair, casey, dana]).noPhone.map(m => m.id)).toEqual(['blair']);
    expect(namesText([alex, blair, casey])).toBe('Alex, Blair, and Casey');
    expect(namesText([alex, blair])).toBe('Alex and Blair');
    expect(requestRows([alex, blair, casey]).rows.map(r => [r.member.id, r.on])).toEqual([['alex', true]]);
    expect(requestRows([alex, blair, casey]).noPhone.map(m => m.id)).toEqual(['blair']);
  });

  it('reads what phones get, with the defaults', () => {
    expect(notifyOf(blair)).toEqual({ requests: true, reminders: false });
    expect(notifyOf(casey)).toEqual({ requests: true, reminders: true });
    expect(phoneName('notify.mobile_app_caseys_phone')).toBe('Caseys phone');
  });
});

describe('Rewards', () => {
  const movie = { id: 'movie_night_pick', name: 'Movie night pick', icon: '🎬', cost: 40, needs_ok: true, who: ['casey', 'dana'] };

  it('says a reward in a line', () => {
    expect(rewardLine(movie, MEMBERS)).toBe('★ 40 · needs an OK · Casey, Dana');
    expect(rewardLine({ ...movie, needs_ok: false, who: [] }, MEMBERS)).toBe('★ 40 · Everyone who earns stars');
    expect(whoText(['dana'], MEMBERS)).toBe('Dana');
  });

  it('starts a new reward at 20 stars that needs an OK', () => {
    const record = beginRewardDraft(null);
    expect(record.draft).toEqual({ name: '', icon: null, cost: 20, needs_ok: true, who: [] });
    expect(rewardProblem(record.draft)).toBe('Add a name.');
    expect(rewardDirty({ ...record, draft: { ...record.draft, cost: 25 } })).toBe(true);
  });

  it('checks the cost and sends what changed', () => {
    const record = beginRewardDraft(movie);
    expect(rewardProblem({ ...record.draft, cost: 0 })).toBe('A reward costs from 1 to 10,000 stars.');
    expect(rewardChanges({ ...record.draft, name: ' Movie night ' })).toEqual({
      name: 'Movie night', icon: '🎬', cost: 40, needs_ok: true, who: ['casey', 'dana'],
    });
    expect([nextCost(19, true), nextCost(20, true), nextCost(25, false), nextCost(1, false)]).toEqual([20, 25, 20, 1]);
  });
});
```

`custom_components/planavista/frontend/test/chores-settings.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/chores-settings.test.ts b/custom_components/planavista/frontend/test/chores-settings.test.ts
index 21e7b38..0fd654c 100644
--- a/custom_components/planavista/frontend/test/chores-settings.test.ts
+++ b/custom_components/planavista/frontend/test/chores-settings.test.ts
@@ -31,6 +31,15 @@ describe('the Chores group of Settings', () => {
     expect(page.summary!(context(true, null))).toBe('');
   });
 
+  it('sums up Rewards, Rules, and Reminders', () => {
+    const summary = (id: string, b: Board | null = sample) => choresSettingsPages.find(p => p.id === id)!.summary!(context(true, b));
+    expect(summary('rewards', { ...sample, rewards: [{ id: 'x', name: 'X', icon: null, cost: 5, needs_ok: true, who: [] }] })).toBe('1 reward');
+    expect(summary('rules')).toBe('Make it up');
+    expect(summary('reminders')).toBe('7:00 PM');
+    expect(summary('reminders', { ...sample, settings: { ...sample.settings, evening_check: null } })).toBe('Off');
+    expect(summary('rules', null)).toBe('');
+  });
+
   it('reads the board from the chores service', () => {
     expect(settingsBoard(context(true, sample))).toBe(sample);
     expect(settingsBoard({ services: {} })).toBeNull();
```

- [ ] **Step 2: Run them.** `npx vitest run test/chores-house-rules.test.ts test/chores-settings.test.ts` Expected: FAIL: `chores-house-rules.test.ts` can't load its modules, and `chores-settings.test.ts` finds no Rewards, Rules, or Reminders pages.

- [ ] **Step 3: Write the rules and the pages.**

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index 6e9201b..817a081 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -47,7 +47,13 @@ export interface HouseholdView {
   setup: { completed: boolean; step: string | null };
 }
 
-/** The fields the person page and setup change. */
+/** What a person's phones get (spec 7.2): Waiting for OK requests (parents) and evening reminders. */
+export interface NotifyChoice {
+  requests: boolean;
+  reminders: boolean;
+}
+
+/** The fields the person page, setup, and Reminders change. */
 export interface MemberChanges {
   name?: string;
   color?: string;
@@ -55,6 +61,7 @@ export interface MemberChanges {
   age_group?: AgeGroup;
   parent?: boolean;
   person?: string | null;
+  notify?: NotifyChoice;
 }
 
 /** The part of a calendar row the people pages read. */
```

`custom_components/planavista/frontend/src/core/household-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household-client.ts b/custom_components/planavista/frontend/src/core/household-client.ts
index b8876ff..97dc75b 100644
--- a/custom_components/planavista/frontend/src/core/household-client.ts
+++ b/custom_components/planavista/frontend/src/core/household-client.ts
@@ -34,9 +34,13 @@ export interface UnlockResult {
 /** The household and PIN commands, with this card's session token added when it has one (see WsApi). */
 export class HouseholdApi extends WsApi {
 
-  saveMember(changes: MemberChanges, existing?: { id: string; rev: number }): Promise<{ member: Member }> {
+  /** Add someone, or change them; with a revision, a newer one saved meanwhile is refused (changed). */
+  saveMember(changes: MemberChanges, existing?: { id: string; rev?: number }): Promise<{ member: Member }> {
     const fields: Record<string, unknown> = { member: changes };
-    if (existing) Object.assign(fields, { member_id: existing.id, rev: existing.rev });
+    if (existing) {
+      fields.member_id = existing.id;
+      if (existing.rev !== undefined) fields.rev = existing.rev;
+    }
     return this.call('planavista/household/member/save', fields);
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/chores-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
index 61dd963..df021dc 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
@@ -1,7 +1,9 @@
 import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
 import { WsApi } from '../../core/ws-api';
 import type { Member } from '../../core/household';
-import type { Activity, ChoreHistory, ChoresFeed, CompleteResult, DayView, Reward, WeekView } from './chores-types';
+import type {
+  Activity, ChoreHistory, ChoresFeed, ChoresSettings, CompleteResult, DayView, Reward, WeekView,
+} from './chores-types';
 
 /** Follows planavista/chores/subscribe: the board for today, sent again after every change. */
 export class ChoresSubscription extends LiveSubscription<ChoresFeed> {
@@ -58,6 +60,11 @@ export class ChoresApi extends WsApi {
     return this.call('planavista/chores/activity/delete', { activity_id: activityId });
   }
 
+  /** Rules and Reminders: they apply as a parent taps (spec 14.1). */
+  saveSettings(settings: Partial<ChoresSettings>): Promise<{ settings: ChoresSettings }> {
+    return this.call('planavista/chores/settings/save', { settings });
+  }
+
   saveReward(reward: Partial<Reward>, rewardId?: string): Promise<{ reward: Reward }> {
     return this.call('planavista/rewards/save', rewardId ? { reward, reward_id: rewardId } : { reward });
   }
```

`custom_components/planavista/frontend/src/modules/chores/settings/reward-draft.ts` (new):

```ts
import type { Member } from '../../../core/household';
import type { Reward } from '../chores-types';

/** What the reward editor edits (spec 14.5, 8.15). */
export interface RewardDraft {
  name: string;
  icon: string | null;
  cost: number;
  needs_ok: boolean;
  /** Empty means everyone who earns stars. */
  who: string[];
}

export interface RewardRecord {
  draft: RewardDraft;
  start: RewardDraft;
}

export function rewardDraftOf(reward: Reward | null): RewardDraft {
  return reward
    ? { name: reward.name, icon: reward.icon, cost: reward.cost, needs_ok: reward.needs_ok, who: [...reward.who] }
    : { name: '', icon: null, cost: 20, needs_ok: true, who: [] };
}

export function beginRewardDraft(reward: Reward | null): RewardRecord {
  const start = rewardDraftOf(reward);
  return { draft: start, start };
}

export function rewardDirty(record: RewardRecord): boolean {
  return JSON.stringify(record.draft) !== JSON.stringify(record.start);
}

/** What Save sends. */
export function rewardChanges(draft: RewardDraft): Partial<Reward> {
  return { name: draft.name.trim(), icon: draft.icon, cost: draft.cost, needs_ok: draft.needs_ok, who: draft.who };
}

export function rewardProblem(draft: RewardDraft): string | null {
  if (!draft.name.trim()) return 'Add a name.';
  if (!Number.isInteger(draft.cost) || draft.cost < 1 || draft.cost > 10_000) return 'A reward costs from 1 to 10,000 stars.';
  return null;
}

/** Steps of 1 star up to 20, then 5. */
export function nextCost(cost: number, up: boolean): number {
  if (up) return Math.min(10_000, cost < 20 ? cost + 1 : cost + 5);
  return Math.max(1, cost <= 20 ? cost - 1 : cost - 5);
}

/** Who can get it, in words: "Casey, Dana", or "Everyone who earns stars". */
export function whoText(who: string[], members: Member[]): string {
  if (!who.length) return 'Everyone who earns stars';
  return members.filter(m => who.includes(m.id)).map(m => m.name).join(', ');
}

/** A Rewards row's line (spec 14.5): "★ 40 · needs an OK · Casey, Dana". */
export function rewardLine(reward: Reward, members: Member[]): string {
  const parts = [`★ ${reward.cost}`];
  if (reward.needs_ok) parts.push('needs an OK');
  parts.push(whoText(reward.who, members));
  return parts.join(' · ');
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/rules-derive.ts` (new):

```ts
import type { ChoresSettings } from '../chores-types';
import { clockText } from './chores-list-derive';

/** The missed-chore rules (spec 14.5, 8.10), as the Rules page offers them. */
export const POLICIES: Array<{ id: ChoresSettings['missed']; label: string; short: string; description: string }> = [
  {
    id: 'make_up',
    label: 'Make it up within the week',
    short: 'Make it up',
    description: 'Missed on its day? It moves to This week, and only counts as missed if the week ends first.',
  },
  { id: 'strict', label: 'Strict days', short: 'Strict days', description: 'A chore not done on its day is missed.' },
  {
    id: 'carry_over',
    label: 'Carry it over until done',
    short: 'Carry it over',
    description: "Nothing is missed. It stays on the board, marked overdue, until it's done or excused.",
  },
];

/** The Rules row's value in Settings ("Make it up"). */
export function rulesSummary(settings: Pick<ChoresSettings, 'missed'>): string {
  return POLICIES.find(p => p.id === settings.missed)?.short ?? POLICIES[0].short;
}

/** When a chore day may start: midnight to 6:00 AM in half hours (the engine allows up to 6:00). */
export function dayStartChoices(timeFormat = '12h'): Array<{ value: string; label: string }> {
  const choices: Array<{ value: string; label: string }> = [];
  for (let half = 0; half <= 12; half++) {
    const value = `${String(Math.floor(half / 2)).padStart(2, '0')}:${half % 2 ? '30' : '00'}`;
    choices.push({ value, label: clockText(value, timeFormat) });
  }
  return choices;
}

/** Evening check times: 4:00 PM to 10:00 PM in half hours, and the saved one if it's another. */
export function eveningChoices(current: string | null, timeFormat = '12h'): Array<{ value: string; label: string }> {
  const choices: Array<{ value: string; label: string }> = [];
  for (let half = 32; half <= 44; half++) {
    const value = `${String(Math.floor(half / 2)).padStart(2, '0')}:${half % 2 ? '30' : '00'}`;
    choices.push({ value, label: clockText(value, timeFormat) });
  }
  if (current && !choices.some(c => c.value === current)) {
    choices.push({ value: current, label: clockText(current, timeFormat) });
    choices.sort((a, b) => a.value.localeCompare(b.value));
  }
  return choices;
}

/** Minutes per star: 5-minute steps from 5 to 60, then 15-minute steps to 240 (the engine allows 1 to 240). */
export function nextMinutesPerStar(current: number, up: boolean): number {
  if (up) return Math.min(240, current < 60 ? Math.floor(current / 5) * 5 + 5 : current + 15);
  return Math.max(5, current <= 60 ? Math.ceil(current / 5) * 5 - 5 : current - 15);
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/reminders-derive.ts` (new):

```ts
import type { Member } from '../../../core/household';
import type { ChoresSettings } from '../chores-types';
import { clockText } from './chores-list-derive';

/** What a person's phones get (spec 7.2): parents' requests are on by default, reminders off. */
export function notifyOf(member: Member): { requests: boolean; reminders: boolean } {
  const notify = (member.notify ?? {}) as { requests?: boolean; reminders?: boolean };
  return { requests: notify.requests ?? true, reminders: notify.reminders ?? false };
}

export function phonesOf(member: Member): string[] {
  return Array.isArray(member.phones) ? (member.phones as string[]) : [];
}

/** A phone's name from its notify service: notify.mobile_app_caseys_phone is "Caseys phone". */
export function phoneName(service: string): string {
  const words = service.replace(/^notify\./, '').replace(/^mobile_app_/, '').replace(/_/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : service;
}

/** The Reminders row's value in Settings ("7:00 PM", or "Off"). */
export function remindersSummary(settings: Pick<ChoresSettings, 'evening_check'>, timeFormat = '12h'): string {
  return settings.evening_check ? clockText(settings.evening_check, timeFormat) : 'Off';
}

export interface ReminderRow {
  member: Member;
  phones: string[];
  on: boolean;
}

/**
 * People's phone reminders (spec 14.5): everyone with a phone, and who could
 * have one but doesn't yet (people linked to a Home Assistant person; a
 * young child without an account isn't asked about).
 */
export function reminderRows(members: Member[]): { rows: ReminderRow[]; noPhone: Member[] } {
  const rows = members.filter(m => phonesOf(m).length).map(m => ({ member: m, phones: phonesOf(m), on: notifyOf(m).reminders }));
  return { rows, noPhone: members.filter(m => !phonesOf(m).length && !!m.person) };
}

/** "Alex, Blair, and Casey" (spec 11.7: plain lists). */
export function namesText(members: Member[]): string {
  const names = members.map(m => m.name);
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** Which parents' phones get Waiting for OK requests (spec 14.5, 10.5). */
export function requestRows(members: Member[]): { rows: ReminderRow[]; noPhone: Member[] } {
  const parents = members.filter(m => m.parent);
  return {
    rows: parents.filter(m => phonesOf(m).length).map(m => ({ member: m, phones: phonesOf(m), on: notifyOf(m).requests })),
    noPhone: parents.filter(m => !phonesOf(m).length),
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-rewards-page.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Reward } from '../chores-types';
import { pictureFor } from '../picture-words';
import { rewardLine } from './reward-draft';
import { choresSettingsStyles } from './settings-styles';

/** pv-rewards-page: the rewards catalog (spec 14.5, 8.15), a list like Chores; each opens its editor. */
export class PvRewardsPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }
    `,
  ];

  render() {
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const members = inOrder(this.household?.members ?? []);
    const rewards = board.rewards;
    return html`
      <div class="head">
        <p class="count">${rewards.length} ${rewards.length === 1 ? 'reward' : 'rewards'}</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${() => this._open(null)}>+ New reward</button>
      </div>
      ${rewards.length ? html`
        <ul class="group">
          ${rewards.map(reward => html`
            <li>
              <button class="row" type="button" @click=${() => this._open(reward)}>
                <span class="picture" aria-hidden="true">${reward.icon || pictureFor(reward.name, '🎁')}</span>
                <span class="row-text">
                  <span class="row-title">${reward.name}</span>
                  <span class="row-sub">${rewardLine(reward, members)}</span>
                </span>
                <span class="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          `)}
        </ul>
      ` : html`<p class="empty">No rewards yet. Add a few things worth saving stars for, like a movie night pick or 30 minutes of screen time.</p>`}
      ${rewards.length ? html`<p class="hint">Kids see these in Rewards on the board and can pin one as what they're saving up for.</p>` : nothing}
    `;
  }

  private _open(reward: Reward | null): void {
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
      detail: { tag: 'pv-reward-editor', title: reward ? reward.name : 'New reward', back: 'Rewards', props: { rewardId: reward?.id ?? null } },
      bubbles: true, composed: true,
    }));
  }
}

defineElement('pv-rewards-page', PvRewardsPage);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reward-editor.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { POP_PAGE } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Reward } from '../chores-types';
import { pictureFor } from '../picture-words';
import {
  RewardDraft, RewardRecord, beginRewardDraft, nextCost, rewardChanges, rewardDirty, rewardProblem, whoText,
} from './reward-draft';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';
import '../../../shell/pv-notice-sheet';

type Notice = 'discard' | 'delete';
const PICTURES = ['🎬', '🎮', '📺', '🍦', '🍕', '🌙', '💵', '🍽️', '🎨', '📚', '⚽', '🎁', '🛝', '🧁', '🎟️', '🏊'];

/**
 * pv-reward-editor: one reward (spec 14.5): picture, name, cost in stars,
 * needs an OK, and who can get it. Cancel and Save, like the other editors.
 */
export class PvRewardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _record!: RewardRecord;
  @state() private _problem = '';
  @state() private _saving = false;
  @state() private _notice: Notice | null = null;
  private _loaded = false;
  private _leave?: (ok: boolean) => void;

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _rewardId(): string | null {
    return (this.pageProps.rewardId as string | null | undefined) ?? null;
  }

  private get _reward(): Reward | null {
    return this._chores?.board()?.rewards.find(r => r.id === this._rewardId) ?? null;
  }

  private get _key(): string {
    return `reward:${this._rewardId ?? 'new'}`;
  }

  protected willUpdate(): void {
    if (!this._loaded && this._chores?.board() && (this._rewardId === null || this._reward)) {
      this._record = (this.drafts.get(this._key) as RewardRecord | undefined) ?? beginRewardDraft(this._reward);
      this._loaded = true;
    }
  }

  confirmLeave(): Promise<boolean> {
    if (!this._loaded || !rewardDirty(this._record)) return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        min-height: 44px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 1.0625rem;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        padding: 12px 14px;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  render() {
    if (this._rewardId !== null && this._chores?.board() && !this._reward) {
      return html`<p class="gone">This reward was removed on another screen.</p>`;
    }
    if (!this._loaded) return html`<div class="skeleton"></div>`;
    const d = this._record.draft;
    const isNew = this._rewardId === null;
    const earners = inOrder(this.household?.members ?? []).filter(m => m.stars);
    return html`
      <div class="top">
        <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'reward', '🎁')}</span>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !rewardDirty(this._record))}
            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
        </div>
      </div>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" aria-label="Name" .value=${d.name}
            @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })} />
        </label>
      </div>
      <h2 class="section-label">Picture</h2>
      <div class="group">
        <div class="pictures" role="group" aria-label="Picture">
          ${PICTURES.map(picture => html`
            <button type="button" aria-pressed=${d.icon === picture ? 'true' : 'false'} @click=${() => this._change({ icon: picture })}>${picture}</button>
          `)}
        </div>
      </div>
      <h2 class="section-label">Cost</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${d.cost}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${d.cost <= 1} @click=${() => this._change({ cost: nextCost(d.cost, false) })}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${d.cost >= 10_000} @click=${() => this._change({ cost: nextCost(d.cost, true) })}>+</button>
          </span>
        </div>
        <div class="row toggle-row">
          <span class="row-text">
            <span>Needs a parent's OK</span>
            <span class="row-sub">${d.needs_ok ? 'Redeeming waits for a parent, and the stars are taken then.' : 'Redeeming takes the stars at once.'}</span>
          </span>
          <div class="pv-toggle ${d.needs_ok ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${d.needs_ok ? 'true' : 'false'}
            aria-label="Needs a parent's OK" @click=${() => this._change({ needs_ok: !d.needs_ok })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._change({ needs_ok: !d.needs_ok }); } }}></div>
        </div>
      </div>
      <h2 class="section-label">Who can get it</h2>
      <div class="group">
        <div class="people chips" role="group" aria-label="Who can get it">
          <button class="chip chip--plain" type="button" aria-pressed=${d.who.length === 0 ? 'true' : 'false'}
            @click=${() => this._change({ who: [] })}>Everyone</button>
          ${earners.map(member => html`
            <button class="chip" type="button" aria-pressed=${d.who.includes(member.id) ? 'true' : 'false'}
              @click=${() => this._change({ who: d.who.includes(member.id) ? d.who.filter(id => id !== member.id) : [...d.who, member.id] })}>
              <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>${member.name}
            </button>
          `)}
        </div>
      </div>
      <p class="hint">${whoText(d.who, earners)}. People earn stars when Stars is on for them on their page.</p>
      ${this._reward ? html`<button class="destructive" type="button" @click=${() => { this._notice = 'delete'; }}>Delete ${this._reward.name}…</button>` : nothing}
      ${this._renderNotice()}
    `;
  }

  private _renderNotice() {
    if (this._notice === 'discard') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{ id: 'keep', label: 'Keep editing', kind: 'secondary' }, { id: 'discard', label: 'Discard', kind: 'destructive' }]}
          @pv-sheet-action=${this._onDiscard}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'delete' && this._reward) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._reward.name}?"
          body="Rewards already given stay in everyone's history."
          .actions=${[{ id: 'cancel', label: 'Cancel', kind: 'secondary' }, { id: 'delete', label: 'Delete', kind: 'destructive' }]}
          @pv-sheet-action=${this._onDelete}></pv-notice-sheet>
      `;
    }
    return nothing;
  }

  private _change(patch: Partial<RewardDraft>): void {
    this._record = { ...this._record, draft: { ...this._record.draft, ...patch } };
    this._problem = '';
    this.drafts.set(this._key, this._record);
  }

  private _pop(): void {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  }

  private _cancel(): void {
    if (rewardDirty(this._record)) this._notice = 'discard';
    else this._pop();
  }

  private async _save(): Promise<void> {
    const problem = rewardProblem(this._record.draft);
    if (problem) {
      this._problem = problem;
      return;
    }
    const chores = this._chores;
    if (!chores) return;
    this._saving = true;
    try {
      await chores.api.saveReward(rewardChanges(this._record.draft), this._rewardId ?? undefined);
      this.drafts.delete(this._key);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  }

  private _onDiscard(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const discard = event.detail.id === 'discard';
    if (discard) {
      this.drafts.delete(this._key);
      this._record = { ...this._record, draft: this._record.start };
    }
    if (this._leave) {
      const leave = this._leave;
      this._leave = undefined;
      leave(discard);
    } else if (discard) {
      this._pop();
    }
  }

  private async _onDelete(event: CustomEvent<{ id: string }>): Promise<void> {
    event.stopPropagation();
    this._notice = null;
    const reward = this._reward;
    if (event.detail.id !== 'delete' || !reward || !this._chores) return;
    try {
      await this._chores.api.deleteReward(reward.id);
      this.drafts.delete(this._key);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't delete. Check the connection and try again.";
    }
  }
}

defineElement('pv-reward-editor', PvRewardEditor);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-rules-page.ts` (new):

```ts
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { ChoresSettings } from '../chores-types';
import { POLICIES, dayStartChoices, nextMinutesPerStar } from './rules-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-rules-page: the house rules (spec 14.5): what happens to a missed
 * chore, when the chore day starts, approving at the end of the day, stars
 * per minutes, and sound. They apply as the parent taps.
 */
export class PvRulesPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  /** A change on its way, shown until the board has it. */
  @state() private _pending: Partial<ChoresSettings> = {};

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .radio {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
      }

      .radio input {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const settings = { ...board.settings, ...this._pending };
    const timeFormat = this.data?.display?.time_format ?? '12h';
    const firstDay = this.data?.display?.first_day === 'sunday' ? 'Sunday' : 'Monday';
    return html`
      <h2 class="section-label">If a chore is missed</h2>
      <div class="group" role="radiogroup" aria-label="If a chore is missed">
        ${POLICIES.map(policy => html`
          <label class="row radio">
            <input type="radio" name="missed" .checked=${settings.missed === policy.id}
              @change=${() => this._save({ missed: policy.id })} />
            <span class="row-text">
              <span class="row-title">${policy.label}</span>
              <span class="row-sub">${policy.description}</span>
            </span>
          </label>
        `)}
      </div>
      <p class="hint">A change starts with the next chore day. A parent can excuse a sick day under any rule.</p>

      <h2 class="section-label">Days and weeks</h2>
      <div class="group">
        <label class="row">
          <span class="row-text">A chore day starts at</span>
          <select class="pv-input pv-select" .value=${settings.day_starts}
            @change=${(e: Event) => this._save({ day_starts: (e.target as HTMLSelectElement).value })}>
            ${dayStartChoices(timeFormat).map(c => html`<option value=${c.value} ?selected=${settings.day_starts === c.value}>${c.label}</option>`)}
          </select>
        </label>
        <div class="row">
          <span class="row-text">Weeks start on</span>
          <span class="row-value">${firstDay}</span>
        </div>
      </div>
      <p class="hint">Late-night check-offs count for the day before. Weeks follow the calendar's setting in Calendar options.</p>

      <h2 class="section-label">Waiting for OK</h2>
      <div class="group">
        ${this._toggle(settings.auto_approve === 'day_end', 'Approve at the end of the day',
          () => this._save({ auto_approve: settings.auto_approve === 'day_end' ? 'never' : 'day_end' }))}
      </div>
      <p class="hint">Anything still waiting when the chore day ends is approved. On time means when it was done, not when it was approved.</p>

      <h2 class="section-label">Stars</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">1 star for every</span>
          <span class="stepper">
            <output>${settings.minutes_per_star} min</output>
            <button type="button" aria-label="Fewer minutes per star" ?disabled=${settings.minutes_per_star <= 5}
              @click=${() => this._save({ minutes_per_star: nextMinutesPerStar(settings.minutes_per_star, false) })}>−</button>
            <button type="button" aria-label="More minutes per star" ?disabled=${settings.minutes_per_star >= 240}
              @click=${() => this._save({ minutes_per_star: nextMinutesPerStar(settings.minutes_per_star, true) })}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">A chore can set its own stars instead. A change applies to stars earned from then on.</p>

      <h2 class="section-label">Sound</h2>
      <div class="group">
        ${this._toggle(settings.sound, 'Play a sound when a chore is done', () => this._save({ sound: !settings.sound }))}
      </div>
    `;
  }

  private _toggle(on: boolean, label: string, set: () => void) {
    return html`
      <div class="row toggle-row">
        <span class="row-text">${label}</span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  /** Rules apply as the parent taps (spec 14.1). */
  private async _save(changes: Partial<ChoresSettings>): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._pending = { ...this._pending, ...changes };
    try {
      await chores.api.saveSettings(changes);
    } catch (err) {
      this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
        detail: { message: errorMessage(err) ?? "Couldn't save. Check the connection and try again." },
        bubbles: true, composed: true,
      }));
    } finally {
      const pending = { ...this._pending };
      for (const key of Object.keys(changes) as Array<keyof ChoresSettings>) delete pending[key];
      this._pending = pending;
    }
  }
}

defineElement('pv-rules-page', PvRulesPage);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-reminders-page.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { clockText } from './chores-list-derive';
import { ReminderRow, namesText, notifyOf, phoneName, reminderRows, requestRows } from './reminders-derive';
import { eveningChoices } from './rules-derive';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';

/**
 * pv-reminders-page: reminders (spec 14.5, 9.9, 10.5): the evening check on
 * the screen, phone reminders per person, and which parents' phones get
 * Waiting for OK requests. They apply as the parent taps.
 */
export class PvRemindersPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _evening: string | null | undefined = undefined;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }

      button.row .row-sub {
        white-space: normal;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const members = inOrder(this.household?.members ?? []);
    const timeFormat = this.data?.display?.time_format ?? '12h';
    const evening = this._evening !== undefined ? this._evening : board.settings.evening_check;
    const at = evening ? clockText(evening, timeFormat) : null;
    const reminders = reminderRows(members);
    const requests = requestRows(members);
    return html`
      <h2 class="section-label">Evening check</h2>
      <div class="group">
        <div class="row toggle-row">
          <span class="row-text">Evening check on the screen</span>
          ${this._switch(!!evening, 'Evening check on the screen', () => this._saveEvening(evening ? null : '19:00'))}
        </div>
        ${evening ? html`
          <label class="row">
            <span class="row-text">At</span>
            <select class="pv-input pv-select" .value=${evening}
              @change=${(e: Event) => this._saveEvening((e.target as HTMLSelectElement).value)}>
              ${eveningChoices(evening, timeFormat).map(c => html`<option value=${c.value} ?selected=${c.value === evening}>${c.label}</option>`)}
            </select>
          </label>
        ` : nothing}
      </div>
      <p class="hint">${at
        ? `At ${at}, the board says who still has chores, like "Casey has 2 chores left", and their column pulses once.`
        : 'Turn it on to have the board say who still has chores in the evening.'}</p>

      <h2 class="section-label">Phone reminders</h2>
      ${reminders.rows.length ? html`
        <div class="group">${reminders.rows.map(row => this._phoneRow(row, at
          ? `At ${at}, only if chores are left`
          : 'Turn on the evening check to send reminders', 'reminders', !!at))}</div>
      ` : nothing}
      ${reminders.noPhone.length ? html`
        <p class="hint">No phone yet for ${namesText(reminders.noPhone)}. Add one on their page in People.</p>
      ` : nothing}
      ${!reminders.rows.length && !reminders.noPhone.length ? html`
        <p class="hint">Phones are set on each person's page, for people linked to a Home Assistant person.</p>
      ` : nothing}

      <h2 class="section-label">Waiting for OK requests</h2>
      ${requests.rows.length ? html`
        <div class="group">${requests.rows.map(row => this._phoneRow(row, 'Requests come with Looks good and Send back buttons', 'requests', true))}</div>
      ` : nothing}
      ${requests.noPhone.length ? html`
        <p class="hint">No phone yet for ${namesText(requests.noPhone)}. Add one on their page in People.</p>
      ` : nothing}
      <p class="hint">Without a phone, requests wait in Waiting for OK on the screen${board.settings.auto_approve === 'day_end' ? ', and anything still waiting is approved at the end of the day' : ''}.</p>
    `;
  }

  private _switch(on: boolean, label: string, set: () => void, disabled = false) {
    return html`
      <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex=${disabled ? '-1' : '0'}
        aria-checked=${on ? 'true' : 'false'} aria-disabled=${disabled ? 'true' : 'false'} aria-label=${label}
        style=${disabled ? 'opacity: 0.45; pointer-events: none' : ''}
        @click=${set}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
    `;
  }

  private _phoneRow(row: ReminderRow, sub: string, kind: 'reminders' | 'requests', enabled: boolean) {
    const label = `${row.member.name}: ${kind === 'reminders' ? 'reminders' : 'requests'} on ${row.phones.map(p => phoneName(p)).join(', ')}`;
    return html`
      <div class="row toggle-row">
        <pv-member-avatar .member=${row.member} .hass=${this.hass} size="36"></pv-member-avatar>
        <span class="row-text">
          <span class="row-title">${row.member.name} · ${row.phones.map(p => phoneName(p)).join(', ')}</span>
          <span class="row-sub">${sub}</span>
        </span>
        ${this._switch(row.on && enabled, label, () => this._saveNotify(row.member, kind, !row.on), !enabled)}
      </div>
    `;
  }

  private _error(err: unknown): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: errorMessage(err) ?? "Couldn't save. Check the connection and try again." },
      bubbles: true, composed: true,
    }));
  }

  private async _saveEvening(at: string | null): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._evening = at;
    try {
      await chores.api.saveSettings({ evening_check: at });
    } catch (err) {
      this._error(err);
    } finally {
      this._evening = undefined;
    }
  }

  private async _saveNotify(member: Member, kind: 'reminders' | 'requests', on: boolean): Promise<void> {
    try {
      await this.api.saveMember({ notify: { ...notifyOf(member), [kind]: on } }, { id: member.id });
    } catch (err) {
      this._error(err);
    }
  }
}

defineElement('pv-reminders-page', PvRemindersPage);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index 1b472cb..7697dda 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -3,6 +3,8 @@ import { PageRegistry } from '../../core/page-registry';
 import { SettingsContext, SettingsPage, settingsRegistry } from '../../core/settings-registry';
 import { ChoresService, choresEnabled } from './chores-service';
 import type { Board } from './chores-types';
+import { remindersSummary } from './settings/reminders-derive';
+import { rulesSummary } from './settings/rules-derive';
 
 /** The views the Chores module offers in the bar (spec 12.2). */
 export const CHORES_VIEWS = [
@@ -54,6 +56,42 @@ export const choresSettingsPages: SettingsPage[] = [
       return board ? count(board.chores.filter(a => !a.finished_at).length, 'chore', 'chores') : '';
     },
   },
+  {
+    id: 'rewards',
+    label: 'Rewards',
+    group: 'chores',
+    order: 210,
+    tag: 'pv-rewards-page',
+    applies: ({ household }) => choresEnabled({ household }),
+    summary: ctx => {
+      const board = settingsBoard(ctx);
+      return board ? count(board.rewards.length, 'reward', 'rewards') : '';
+    },
+  },
+  {
+    id: 'rules',
+    label: 'Rules',
+    group: 'chores',
+    order: 220,
+    tag: 'pv-rules-page',
+    applies: ({ household }) => choresEnabled({ household }),
+    summary: ctx => {
+      const board = settingsBoard(ctx);
+      return board ? rulesSummary(board.settings) : '';
+    },
+  },
+  {
+    id: 'reminders',
+    label: 'Reminders',
+    group: 'chores',
+    order: 230,
+    tag: 'pv-reminders-page',
+    applies: ({ household }) => choresEnabled({ household }),
+    summary: ctx => {
+      const board = settingsBoard(ctx);
+      return board ? remindersSummary(board.settings, ctx.data?.display?.time_format) : '';
+    },
+  },
 ];
 
 /** Add the chores pages to Settings. */
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index 6e9c275..e889ac3 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -2,6 +2,10 @@
 import './pv-chores-module';
 import './settings/pv-chores-list-page';
 import './settings/pv-chore-editor';
+import './settings/pv-rewards-page';
+import './settings/pv-reward-editor';
+import './settings/pv-rules-page';
+import './settings/pv-reminders-page';
 import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
```

- [ ] **Step 4: Run them again.** Same command. Expected: `13 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `670 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(card): Rewards, Rules, and Reminders` with the trailers.

---

### Task 8: The person page's chores rows

Spec 14.2 (a person's page: the chores rows, Sleep, Phones with Use in automations, and Stars with recent history), 7.2 (age-group defaults for My day, Needs an OK for, and Stars, checked against one table by both sides). The shell's person page takes module sections, so it stays free of chores code.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/settings/person-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts`
- Modify: `custom_components/planavista/frontend/src/core/settings-registry.ts`, `custom_components/planavista/frontend/src/core/person-draft.ts`, `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/shell/settings/person-page.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-client.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `tests/fixtures/age_group_defaults.json`, `tests/test_household_members.py`, `custom_components/planavista/frontend/test/person-draft.test.ts`, `custom_components/planavista/frontend/test/chores-person.test.ts`

**Interfaces:**
- Consumes: Task 1's fields and `planavista/stars/history`; Task 7's `phoneName`, `notifyOf`.
- Produces: `PersonSection`, `PERSON_CHANGE`, `personSections` (slots `role`, `pin`, `links`); `PersonDraft` gains the chores fields, `AGE_GROUP_DEFAULTS`, `NOTIFY_DEFAULTS`, `withAgeGroup(draft, ageGroup)`; `phoneChoices(hass, member)`, `starLine`, `awayText`, `awayNow`, `goalChoices`, `sleepText`; `ChoresApi.starHistory(member)`; the sections `chores`, `sleep`, `phones` and the elements `pv-person-chores`, `pv-person-sleep`, `pv-person-phones`, `pv-person-stars`.

- [ ] **Step 1: Write the shared age-group table and the failing tests.**

`tests/fixtures/age_group_defaults.json` (new):

```json
{
  "description": "What each age group starts a person with (spec 7.2). The household rules and the person page both read this table.",
  "defaults": {
    "young_child": {"my_day": "pictures", "needs_ok_for": "all", "stars": true},
    "older_child": {"my_day": "list", "needs_ok_for": "marked", "stars": true},
    "teen": {"my_day": "timeline", "needs_ok_for": "marked", "stars": true},
    "adult": {"my_day": "timeline", "needs_ok_for": "none", "stars": false}
  }
}
```

`tests/test_household_members.py`:

```diff
diff --git a/tests/test_household_members.py b/tests/test_household_members.py
index 6bf0077..9294c22 100644
--- a/tests/test_household_members.py
+++ b/tests/test_household_members.py
@@ -250,3 +250,14 @@ def test_away_ranges_are_checked_and_kept_in_order() -> None:
         assert err.value.code == "invalid_away"
     # Members saved before Away existed get no new field.
     assert "away" not in update_member(members, "dana", {"name": "Dana"}, None)[1]
+
+
+def test_age_group_defaults_follow_the_shared_table() -> None:
+    """The person page starts people from the same table (test/person-draft.test.ts)."""
+    import json
+    from pathlib import Path
+
+    from custom_components.planavista.household.members import AGE_GROUP_DEFAULTS
+
+    table = json.loads((Path(__file__).parent / "fixtures" / "age_group_defaults.json").read_text("utf-8"))
+    assert table["defaults"] == AGE_GROUP_DEFAULTS
```

`custom_components/planavista/frontend/test/person-draft.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/person-draft.test.ts b/custom_components/planavista/frontend/test/person-draft.test.ts
index 4117374..2506a68 100644
--- a/custom_components/planavista/frontend/test/person-draft.test.ts
+++ b/custom_components/planavista/frontend/test/person-draft.test.ts
@@ -1,5 +1,8 @@
+import { readFileSync } from 'node:fs';
 import { describe, expect, it } from 'vitest';
-import { beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft } from '../src/core/person-draft';
+import {
+  AGE_GROUP_DEFAULTS, beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft, withAgeGroup,
+} from '../src/core/person-draft';
 import { Member } from '../src/core/household';
 
 const PALETTE = ['#F94144', '#277DA1', '#43AA8B'];
@@ -9,25 +12,50 @@ const ALEX = {
   has_pin: true, pin_length: 4, locked_until: null,
 } as Member;
 
+const CHORES = {
+  needs_ok_for: 'none', my_day: 'timeline', stars: false, goal: null, away: [], bedtime: null, sleep_hours: null,
+  phones: [], notify: { requests: true, reminders: false },
+};
+const AGES = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/age_group_defaults.json', import.meta.url), 'utf-8')) as {
+  defaults: Record<string, unknown>;
+};
+
 describe('person drafts', () => {
   it('starts someone new with the first free color', () => {
     expect(draftOf(null, [ALEX], PALETTE)).toEqual({
-      name: '', color: '#277DA1', picture: { initial: true }, age_group: 'adult', parent: false, person: null,
+      name: '', color: '#277DA1', picture: { initial: true }, age_group: 'adult', parent: false, person: null, ...CHORES,
     });
   });
 
   it('starts from a saved person', () => {
     expect(draftOf(ALEX, [ALEX], PALETTE)).toEqual({
       name: 'Alex', color: '#F94144', picture: { initial: true }, age_group: 'adult', parent: true, person: 'person.alex',
+      ...CHORES,
+    });
+    const casey = { ...ALEX, id: 'casey', bedtime: { weeknight: '22:00', weekend: '23:00' }, sleep_hours: 9,
+      phones: ['notify.mobile_app_caseys_phone'], notify: { reminders: true }, away: [{ from: '2026-10-14', to: '2026-10-15' }],
+      goal: 'movie_night_pick' } as Member;
+    expect(draftOf(casey, [casey], PALETTE)).toMatchObject({
+      bedtime: { weeknight: '22:00', weekend: '23:00' }, sleep_hours: 9, phones: ['notify.mobile_app_caseys_phone'],
+      notify: { requests: true, reminders: true }, away: [{ from: '2026-10-14', to: '2026-10-15' }], goal: 'movie_night_pick',
     });
   });
 
+  it("starts a new age group from its defaults, from the household rules' table", () => {
+    expect(AGE_GROUP_DEFAULTS).toEqual(AGES.defaults);
+    const teen = withAgeGroup(draftOf(null, [], PALETTE), 'teen');
+    expect([teen.age_group, teen.my_day, teen.needs_ok_for, teen.stars]).toEqual(['teen', 'timeline', 'marked', true]);
+    const young = withAgeGroup(teen, 'young_child');
+    expect([young.my_day, young.needs_ok_for, young.stars]).toEqual(['pictures', 'all', true]);
+  });
+
   it('sends everything for someone new and only changes for someone saved', () => {
     const fresh = beginDraft(null, [], PALETTE);
     expect(fresh.rev).toBeNull();
     const named = { ...fresh, draft: { ...fresh.draft, name: '  Dana ', age_group: 'young_child' as const } };
     expect(draftChanges(named)).toEqual({
       name: 'Dana', color: '#F94144', picture: { initial: true }, age_group: 'young_child', parent: false, person: null,
+      ...CHORES,
     });
     const saved = beginDraft(ALEX, [ALEX], PALETTE);
     const edited = { ...saved, draft: { ...saved.draft, picture: { emoji: '\u{1F996}' } } };
```

`custom_components/planavista/frontend/test/chores-person.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { PersonSection, SettingsContext } from '../src/core/settings-registry';
import { choresPersonSections, registerChoresSettings } from '../src/modules/chores/definition';
import {
  awayNow, awayText, goalChoices, phoneChoices, sleepText, starLine,
} from '../src/modules/chores/settings/person-derive';

const household = (enabled: boolean) => ({ available: true, modules: { chores: { enabled } } } as never);

describe('the person page\'s chores parts', () => {
  it('come only while chores are on, at their slots', () => {
    const sections = new PageRegistry<SettingsContext, PersonSection>();
    registerChoresSettings(undefined, sections);
    const on = sections.pages({ household: household(true), data: {} as never });
    expect(on.map(s => [s.id, s.slot])).toEqual([['chores', 'role'], ['sleep', 'pin'], ['phones', 'links']]);
    expect(sections.pages({ household: household(false), data: {} as never })).toEqual([]);
    expect(choresPersonSections.map(s => s.tag)).toEqual(['pv-person-chores', 'pv-person-sleep', 'pv-person-phones']);
  });
});

describe('phoneChoices', () => {
  const hass = {
    services: { notify: { mobile_app_caseys_phone: {}, mobile_app_alex_phone: {}, persistent_notification: {} } },
    states: { 'person.casey': { attributes: { device_trackers: ['device_tracker.caseys_phone'] } } },
  };

  it('suggests the person\'s own phone first and leaves out other notify services', () => {
    expect(phoneChoices(hass, { person: 'person.casey' })).toEqual([
      { service: 'notify.mobile_app_caseys_phone', label: 'Caseys phone', suggested: true },
      { service: 'notify.mobile_app_alex_phone', label: 'Alex phone', suggested: false },
    ]);
  });

  it('keeps a saved phone Home Assistant no longer has', () => {
    expect(phoneChoices({ services: {} }, { person: null, phones: ['notify.mobile_app_old_tablet'] })).toEqual([
      { service: 'notify.mobile_app_old_tablet', label: 'Old tablet', suggested: false },
    ]);
  });
});

describe('the stars history', () => {
  const names = { blair: 'Blair' };

  it('says what each change was for', () => {
    const at = '2026-10-13T16:10:00-05:00';
    expect(starLine({ at, delta: 1, reason: 'chore', name: 'Cat care', by: null }, names)).toEqual({ amount: '+1', what: 'Cat care' });
    expect(starLine({ at, delta: -1, reason: 'undo', name: 'Take out the trash', by: 'casey' }, names)).toEqual({
      amount: '−1', what: 'Unchecked: Take out the trash',
    });
    expect(starLine({ at, delta: -40, reason: 'redeemed', name: 'Movie night pick', by: 'blair' }, names).what).toBe('Movie night pick');
    expect(starLine({ at, delta: 5, reason: 'Helped a neighbor', name: null, by: 'blair' }, names)).toEqual({
      amount: '+5', what: 'Helped a neighbor (Blair)',
    });
  });
});

describe('away, goals, and sleep', () => {
  it('says a time away', () => {
    expect(awayText({ from: '2026-10-14', to: '2026-10-15', note: "At Grandma's" })).toBe("Oct 14 to Oct 15 · At Grandma's");
    expect(awayText({ from: '2026-10-14', to: '2026-10-14' })).toBe('Oct 14');
    expect(awayNow([{ from: '2026-10-12', to: '2026-10-14' }], '2026-10-13')).toEqual({ from: '2026-10-12', to: '2026-10-14' });
    expect(awayNow([{ from: '2026-10-14', to: '2026-10-15' }], '2026-10-13')).toBeNull();
  });

  it('offers the rewards someone can get', () => {
    const rewards = [
      { id: 'movie', name: 'Movie', icon: null, cost: 40, needs_ok: true, who: ['casey', 'dana'] },
      { id: 'screen', name: 'Screen time', icon: null, cost: 15, needs_ok: true, who: [] },
      { id: 'allowance', name: 'Allowance', icon: null, cost: 50, needs_ok: true, who: ['casey'] },
    ];
    expect(goalChoices(rewards, 'dana').map(r => r.id)).toEqual(['movie', 'screen']);
  });

  it('says hours of sleep', () => {
    expect([sleepText(9), sleepText(7.5), sleepText(10.25)]).toEqual(['9 h', '7 h 30 min', '10 h 15 min']);
  });
});
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_household_members.py -q` Expected: `22 passed` at once: the table pins milestone 2's defaults. `npx vitest run test/person-draft.test.ts test/chores-person.test.ts` Expected: FAIL: `AGE_GROUP_DEFAULTS` and `withAgeGroup` don't exist yet, and `chores-person.test.ts` can't load `person-derive`.

- [ ] **Step 3: Let the person page take module sections, and give the draft the chores fields.**

`custom_components/planavista/frontend/src/core/settings-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/settings-registry.ts b/custom_components/planavista/frontend/src/core/settings-registry.ts
index 1af6747..82be294 100644
--- a/custom_components/planavista/frontend/src/core/settings-registry.ts
+++ b/custom_components/planavista/frontend/src/core/settings-registry.ts
@@ -75,8 +75,26 @@ export function resumeIndex(steps: SetupStep[], saved: string | null): number {
   return index >= 0 ? index : 0;
 }
 
+/**
+ * A part of a person's page that a module adds (spec 14.2: the chores rows,
+ * sleep, phones, and Use in automations). The page shows it at its slot:
+ * after the age group and Parent, after the PIN, or after the Home Assistant
+ * links. The element gets the page's draft and sends changes back with
+ * pv-person-change.
+ */
+export interface PersonSection extends WizardPage<SettingsContext> {
+  slot: 'role' | 'pin' | 'links';
+  tag: string;
+}
+
+/** A section asks the person page to change its draft. */
+export const PERSON_CHANGE = 'pv-person-change';
+
 /** Settings pages that the shell and modules contribute. */
 export const settingsRegistry = new PageRegistry<SettingsContext, SettingsPage>();
 
+/** Parts of the person page that modules contribute. */
+export const personSections = new PageRegistry<SettingsContext, PersonSection>();
+
 /** First-run setup steps that the shell and modules contribute. */
 export const setupRegistry = new PageRegistry<SetupContext, SetupStep>();
```

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index 817a081..f11b1b5 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -53,7 +53,20 @@ export interface NotifyChoice {
   reminders: boolean;
 }
 
-/** The fields the person page, setup, and Reminders change. */
+/** A time away (spec 8.11): first and last chore days, inclusive. */
+export interface AwayRange {
+  from: string;
+  to: string;
+  note?: string | null;
+}
+
+/** Bedtimes on weeknights, and on Friday and Saturday nights (HH:MM). */
+export interface Bedtime {
+  weeknight: string;
+  weekend: string;
+}
+
+/** The fields the person page, setup, Reminders, and imports change. */
 export interface MemberChanges {
   name?: string;
   color?: string;
@@ -61,6 +74,14 @@ export interface MemberChanges {
   age_group?: AgeGroup;
   parent?: boolean;
   person?: string | null;
+  needs_ok_for?: string;
+  my_day?: string;
+  stars?: boolean;
+  goal?: string | null;
+  away?: AwayRange[];
+  bedtime?: Bedtime | null;
+  sleep_hours?: number | null;
+  phones?: string[];
   notify?: NotifyChoice;
 }
 
@@ -93,6 +114,14 @@ export const AGE_GROUP_CHOICES: Array<{ id: AgeGroup; label: string; hint: strin
   { id: 'adult', label: 'Adult', hint: '' },
 ];
 
+/** What each age group means once chores are on (the approved person page). */
+export const AGE_GROUP_CHORES_HINTS: Record<AgeGroup, string> = {
+  young_child: 'Pictures and big buttons. Every chore needs an OK.',
+  older_child: 'A list with pictures. Chores marked Needs an OK wait for one.',
+  teen: 'The full list and a timeline. Chores marked Needs an OK wait for one.',
+  adult: 'The full list and a timeline. No OKs needed.',
+};
+
 /** The role chips of setup's "Who lives here?" (spec 14.7). */
 export const ROLES: Array<{ id: Role; label: string }> = [
   { id: 'parent', label: 'Parent' },
```

`custom_components/planavista/frontend/src/core/person-draft.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/person-draft.ts b/custom_components/planavista/frontend/src/core/person-draft.ts
index f3db45a..46423df 100644
--- a/custom_components/planavista/frontend/src/core/person-draft.ts
+++ b/custom_components/planavista/frontend/src/core/person-draft.ts
@@ -1,6 +1,6 @@
-import { AgeGroup, Member, MemberChanges, Picture, takenColors } from './household';
+import { AgeGroup, AwayRange, Bedtime, Member, MemberChanges, NotifyChoice, Picture, takenColors } from './household';
 
-/** What the person page edits. */
+/** What the person page edits, chores rows included (spec 14.2). */
 export interface PersonDraft {
   name: string;
   color: string;
@@ -8,17 +8,49 @@ export interface PersonDraft {
   age_group: AgeGroup;
   parent: boolean;
   person: string | null;
+  needs_ok_for: string;
+  my_day: string;
+  stars: boolean;
+  goal: string | null;
+  away: AwayRange[];
+  bedtime: Bedtime | null;
+  sleep_hours: number | null;
+  phones: string[];
+  notify: NotifyChoice;
 }
 
-const FIELDS: Array<keyof PersonDraft> = ['name', 'color', 'picture', 'age_group', 'parent', 'person'];
+const FIELDS: Array<keyof PersonDraft> = [
+  'name', 'color', 'picture', 'age_group', 'parent', 'person', 'needs_ok_for', 'my_day', 'stars', 'goal', 'away',
+  'bedtime', 'sleep_hours', 'phones', 'notify',
+];
+
+/**
+ * What each age group starts someone with (spec 7.2), the household rules'
+ * own table (household/members.py), checked against the same fixture:
+ * tests/fixtures/age_group_defaults.json.
+ */
+export const AGE_GROUP_DEFAULTS: Record<AgeGroup, { my_day: string; needs_ok_for: string; stars: boolean }> = {
+  young_child: { my_day: 'pictures', needs_ok_for: 'all', stars: true },
+  older_child: { my_day: 'list', needs_ok_for: 'marked', stars: true },
+  teen: { my_day: 'timeline', needs_ok_for: 'marked', stars: true },
+  adult: { my_day: 'timeline', needs_ok_for: 'none', stars: false },
+};
+
+export const NOTIFY_DEFAULTS: NotifyChoice = { requests: true, reminders: false };
 
 function same(a: unknown, b: unknown): boolean {
   return JSON.stringify(a) === JSON.stringify(b);
 }
 
+/** A new age group brings its starting points ("These start from the teen defaults"). */
+export function withAgeGroup(draft: PersonDraft, age: AgeGroup): PersonDraft {
+  return { ...draft, age_group: age, ...AGE_GROUP_DEFAULTS[age] };
+}
+
 /** The editor's starting point: the person as saved, or someone new with the first free color. */
 export function draftOf(member: Member | null, members: Member[], palette: string[]): PersonDraft {
   if (member) {
+    const notify = (member.notify ?? {}) as Partial<NotifyChoice>;
     return {
       name: member.name,
       color: member.color,
@@ -26,11 +58,24 @@ export function draftOf(member: Member | null, members: Member[], palette: strin
       age_group: member.age_group,
       parent: member.parent,
       person: member.person,
+      needs_ok_for: member.needs_ok_for,
+      my_day: member.my_day,
+      stars: member.stars,
+      goal: (member.goal as string | null | undefined) ?? null,
+      away: Array.isArray(member.away) ? (member.away as AwayRange[]) : [],
+      bedtime: (member.bedtime as Bedtime | null | undefined) ?? null,
+      sleep_hours: (member.sleep_hours as number | null | undefined) ?? null,
+      phones: Array.isArray(member.phones) ? (member.phones as string[]) : [],
+      notify: { ...NOTIFY_DEFAULTS, ...notify },
     };
   }
   const taken = takenColors(members);
   const color = palette.find(c => !taken.has(c.toUpperCase())) ?? palette[0];
-  return { name: '', color, picture: { initial: true }, age_group: 'adult', parent: false, person: null };
+  return {
+    name: '', color, picture: { initial: true }, age_group: 'adult', parent: false, person: null,
+    ...AGE_GROUP_DEFAULTS.adult, goal: null, away: [], bedtime: null, sleep_hours: null, phones: [],
+    notify: { ...NOTIFY_DEFAULTS },
+  };
 }
 
 /**
@@ -86,5 +131,7 @@ export function draftProblem(draft: PersonDraft, members: Member[], selfId: stri
     return 'Someone already has that name.';
   }
   const owner = others.find(m => m.color.toUpperCase() === draft.color.toUpperCase());
-  return owner ? `${owner.name} already has that color.` : null;
+  if (owner) return `${owner.name} already has that color.`;
+  if (draft.away.some(span => !span.from || !span.to || span.to < span.from)) return 'Pick the first and last days away.';
+  return null;
 }
```

`custom_components/planavista/frontend/src/shell/settings/person-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/person-page.ts b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
index 25bf7a1..f31d468 100644
--- a/custom_components/planavista/frontend/src/shell/settings/person-page.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/person-page.ts
@@ -1,10 +1,12 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { property, state } from 'lit/decorators.js';
+import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
 import {
   AGE_GROUP_CHOICES,
+  AGE_GROUP_CHORES_HINTS,
   HouseholdView,
   Member,
   Picture,
@@ -15,7 +17,11 @@ import {
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
 import { POP_PAGE, saveErrorMessage } from '../../core/page-host';
-import { DraftRecord, PersonDraft, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft } from '../../core/person-draft';
+import {
+  DraftRecord, PersonDraft, beginDraft, draftChanges, draftProblem, isDirty, rebaseDraft, withAgeGroup,
+} from '../../core/person-draft';
+import type { ModuleService } from '../../core/module-registry';
+import { PERSON_CHANGE, PersonSection, personSections } from '../../core/settings-registry';
 import { PvColorSwatchPicker } from '../../core/color-swatch-picker';
 import type { PlanaVistaData } from '../../types';
 import '../../core/pv-member-avatar';
@@ -27,9 +33,10 @@ const PALETTE = PvColorSwatchPicker.PRESETS.map(preset => preset.color);
 type Notice = 'discard' | 'remove' | 'changed';
 
 /**
- * pv-settings-person: one person's page (spec 14.2, without the chores rows).
- * An editor: Cancel and Save, so a half-made change never reaches anyone.
- * The draft lives in the card's memory, so it survives the end of parent mode.
+ * pv-settings-person: one person's page (spec 14.2). An editor: Cancel and
+ * Save, so a half-made change never reaches anyone. The draft lives in the
+ * card's memory, so it survives the end of parent mode. Modules add their
+ * own parts (the chores rows, sleep, phones) through personSections.
  */
 export class PvSettingsPerson extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -40,6 +47,8 @@ export class PvSettingsPerson extends LitElement {
   @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
   @property({ attribute: false }) pageProps: Record<string, unknown> = {};
   @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
+  @property({ attribute: false }) services: Record<string, ModuleService> = {};
+  @property({ type: Number }) revision = 0;
 
   @state() private _draft!: PersonDraft;
   @state() private _start!: PersonDraft;
@@ -81,6 +90,21 @@ export class PvSettingsPerson extends LitElement {
     return { draft: this._draft, start: this._start, rev: this._rev };
   }
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this.addEventListener(PERSON_CHANGE, this._onSectionChange as EventListener);
+  }
+
+  disconnectedCallback(): void {
+    super.disconnectedCallback();
+    this.removeEventListener(PERSON_CHANGE, this._onSectionChange as EventListener);
+  }
+
+  private _onSectionChange = (event: CustomEvent<Partial<PersonDraft>>): void => {
+    event.stopPropagation();
+    this._change(event.detail);
+  };
+
   /** Settings asks before leaving a page with changes (spec 14.1). */
   confirmLeave(): Promise<boolean> {
     if (!this._loaded || !isDirty(this._draft, this._start)) return Promise.resolve(true);
@@ -291,8 +315,11 @@ export class PvSettingsPerson extends LitElement {
       ${this._renderPicture()}
       ${this._renderAgeGroup()}
       ${this._renderParent()}
+      ${this._renderSections('role', member)}
       ${this._renderPin(member)}
+      ${this._renderSections('pin', member)}
       ${this._renderHomeAssistant()}
+      ${this._renderSections('links', member)}
       ${member ? html`
         <button class="pv-btn remove" type="button" @click=${() => { this._notice = 'remove'; }}>Remove ${member.name}</button>
       ` : nothing}
@@ -381,24 +408,52 @@ export class PvSettingsPerson extends LitElement {
     `;
   }
 
+  private get _choresOn(): boolean {
+    const chores = (this.household?.modules as { chores?: { enabled?: boolean } } | undefined)?.chores;
+    return chores?.enabled === true;
+  }
+
   private _renderAgeGroup() {
     return html`
       <fieldset class="field">
         <legend>Age group</legend>
         <div class="radios">
-          ${AGE_GROUP_CHOICES.map(choice => html`
-            <label class="radio">
-              <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
-                @change=${() => this._change({ age_group: choice.id })} />
-              <span>${choice.label}</span>
-              ${choice.hint ? html`<span class="age-hint">${choice.hint}</span>` : nothing}
-            </label>
-          `)}
+          ${AGE_GROUP_CHOICES.map(choice => {
+            const hint = this._choresOn ? AGE_GROUP_CHORES_HINTS[choice.id] : choice.hint;
+            return html`
+              <label class="radio">
+                <input type="radio" name="age-group" .checked=${this._draft.age_group === choice.id}
+                  @change=${() => this._changeDraft(withAgeGroup(this._draft, choice.id))} />
+                <span>${choice.label}</span>
+                ${hint ? html`<span class="age-hint">${hint}</span>` : nothing}
+              </label>
+            `;
+          })}
         </div>
       </fieldset>
     `;
   }
 
+  /** The parts modules add at one slot of the page, such as the chores rows. */
+  private _renderSections(slot: PersonSection['slot'], member: Member | null) {
+    const context = { household: this.household, data: this.data, services: this.services };
+    return personSections.pages(context).filter(section => section.slot === slot).map(section => {
+      const tag = unsafeStatic(section.tag);
+      return staticHtml`
+        <${tag}
+          .hass=${this.hass}
+          .data=${this.data}
+          .household=${this.household}
+          .member=${member}
+          .draft=${this._draft}
+          .services=${this.services}
+          .revision=${this.revision}
+          .layout=${this.layout}
+        ></${tag}>
+      `;
+    });
+  }
+
   private _renderParent() {
     const on = this._draft.parent;
     const toggle = () => this._change({ parent: !on });
@@ -508,7 +563,11 @@ export class PvSettingsPerson extends LitElement {
   }
 
   private _change(patch: Partial<PersonDraft>): void {
-    this._draft = { ...this._draft, ...patch };
+    this._changeDraft({ ...this._draft, ...patch });
+  }
+
+  private _changeDraft(draft: PersonDraft): void {
+    this._draft = draft;
     this._problem = '';
     this.drafts.set(this._draftKey, this._record);
   }
```

- [ ] **Step 4: Write the chores sections.**

`custom_components/planavista/frontend/src/modules/chores/chores-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
index df021dc..8ffc394 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
@@ -1,6 +1,7 @@
 import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
 import { WsApi } from '../../core/ws-api';
 import type { Member } from '../../core/household';
+import type { StarEntry } from './settings/person-derive';
 import type {
   Activity, ChoreHistory, ChoresFeed, ChoresSettings, CompleteResult, DayView, Reward, WeekView,
 } from './chores-types';
@@ -81,6 +82,11 @@ export class ChoresApi extends WsApi {
     return this.call('planavista/stars/award', { member, stars, reason });
   }
 
+  /** A person's latest stars, newest first (their page: Stars). */
+  starHistory(member: string): Promise<{ balance: number; history: StarEntry[] }> {
+    return this.call('planavista/stars/history', { member }, false);
+  }
+
   week(date?: string): Promise<WeekView> {
     return this.call('planavista/chores/week', date ? { date } : {}, false);
   }
```

`custom_components/planavista/frontend/src/modules/chores/settings/person-derive.ts` (new):

```ts
import type { AwayRange, Member } from '../../../core/household';
import { shortDate } from '../../../core/recurrence';
import type { Reward } from '../chores-types';
import { phoneName } from './reminders-derive';

export interface PhoneChoice {
  service: string;
  label: string;
  /** One of the person's own device trackers. */
  suggested: boolean;
}

interface HassLike {
  services?: Record<string, Record<string, unknown> | undefined>;
  states?: Record<string, { attributes?: Record<string, unknown> } | undefined>;
}

/**
 * The phones Home Assistant can send buttons to (the Companion app's legacy
 * notify.mobile_app_* services, spec 10.5), the person's own first:
 * suggested from their person's device trackers.
 */
export function phoneChoices(hass: HassLike | undefined, member: Pick<Member, 'person'> & { phones?: unknown }): PhoneChoice[] {
  const services = Object.keys(hass?.services?.notify ?? {}).filter(name => name.startsWith('mobile_app_'));
  const trackers = member.person ? hass?.states?.[member.person]?.attributes?.device_trackers : undefined;
  const own = new Set((Array.isArray(trackers) ? trackers : []).map(id => String(id).replace(/^device_tracker\./, '')));
  const saved = Array.isArray(member.phones) ? (member.phones as string[]) : [];
  const names = new Set([...services.map(name => `notify.${name}`), ...saved]);
  return [...names]
    .map(service => {
      const id = service.replace(/^notify\.mobile_app_/, '');
      return { service, label: phoneName(service), suggested: own.has(id) };
    })
    .sort((a, b) => Number(b.suggested) - Number(a.suggested) || a.label.localeCompare(b.label));
}

export interface StarEntry {
  at: string;
  delta: number;
  reason: string;
  name: string | null;
  by: string | null;
}

/** A line of someone's stars history: "+1 · Cat care", "−1 · Uncheck: Take out the trash", "+5 · Helped a neighbor". */
export function starLine(entry: StarEntry, names: Record<string, string>): { amount: string; what: string } {
  const amount = entry.delta > 0 ? `+${entry.delta}` : `−${Math.abs(entry.delta)}`;
  let what: string;
  if (entry.reason === 'chore') what = entry.name ?? 'A chore';
  else if (entry.reason === 'undo') what = `Unchecked: ${entry.name ?? 'a chore'}`;
  else if (entry.reason === 'redeemed') what = entry.name ?? 'A reward';
  else what = entry.by && names[entry.by] ? `${entry.reason} (${names[entry.by]})` : entry.reason;
  return { amount, what };
}

/** "Oct 14 to Oct 15 · At Grandma's", or one day. */
export function awayText(span: AwayRange): string {
  const days = span.from === span.to ? shortDate(span.from) : `${shortDate(span.from)} to ${shortDate(span.to)}`;
  return span.note ? `${days} · ${span.note}` : days;
}

/** Whether someone is away today. */
export function awayNow(away: AwayRange[], today: string): AwayRange | null {
  return away.find(span => span.from <= today && today <= span.to) ?? null;
}

/** The rewards a person can save up for: theirs, or everyone's when a reward names no one. */
export function goalChoices(rewards: Reward[], memberId: string): Reward[] {
  return rewards.filter(r => !r.who.length || r.who.includes(memberId));
}

/** Hours of sleep in words: 9 h, 7 h 30 min. */
export function sleepText(hours: number): string {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return minutes ? `${whole} h ${minutes} min` : `${whole} h`;
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-chores.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { AGE_GROUP_LABELS, AwayRange, HouseholdView, Member } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import type { ChoresService } from '../chores-service';
import { awayText, goalChoices } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

const NEEDS_OK: Array<[string, string]> = [['all', 'Every chore'], ['marked', 'Marked chores'], ['none', 'No chores']];
const MY_DAY: Array<[string, string]> = [['timeline', 'Timeline'], ['list', 'List'], ['pictures', 'Pictures']];

/**
 * pv-person-chores: a person's chores rows (spec 14.2): Needs an OK for, My
 * day, Stars (with the history and give or take), Saving up for, and Away.
 * Changes go into the person page's draft and are saved with it.
 */
export class PvPersonChores extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) member: Member | null = null;
  @property({ attribute: false }) draft!: PersonDraft;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String }) layout: Layout = 'landscape';

  @state() private _adding: AwayRange | null = null;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .away-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        width: 100%;
      }

      .remove {
        min-height: 40px;
        margin-left: auto;
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    const stars = this.member && board ? board.members[this.member.id]?.stars ?? 0 : null;
    const goals = goalChoices(board?.rewards ?? [], this.member?.id ?? '');
    return html`
      <span class="legend">Chores</span>
      <div class="group">
        ${d.parent ? html`
          <div class="row">
            <span class="row-text">Needs an OK for<span class="row-sub">Never: a parent's check-offs count right away.</span></span>
          </div>
        ` : html`
          <div class="row">
            <div class="stack">
              <span>Needs an OK for</span>
              <div class="segmented" role="group" aria-label="Needs an OK for">
                ${NEEDS_OK.map(([id, label]) => html`
                  <button type="button" aria-pressed=${d.needs_ok_for === id ? 'true' : 'false'}
                    @click=${() => this._change({ needs_ok_for: id })}>${label}</button>
                `)}
              </div>
            </div>
          </div>
        `}
        <div class="row">
          <div class="stack">
            <span>My day</span>
            <div class="segmented" role="group" aria-label="My day">
              ${MY_DAY.map(([id, label]) => html`
                <button type="button" aria-pressed=${d.my_day === id ? 'true' : 'false'}
                  @click=${() => this._change({ my_day: id })}>${label}</button>
              `)}
            </div>
          </div>
        </div>
        <div class="row toggle-row">
          <span class="row-text">Earns stars</span>
          <div class="pv-toggle ${d.stars ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${d.stars ? 'true' : 'false'}
            aria-label="Earns stars" @click=${() => this._change({ stars: !d.stars })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._change({ stars: !d.stars }); } }}></div>
        </div>
        ${this.member && stars !== null ? html`
          <button class="row" type="button" @click=${this._openStars}>
            <span class="row-text">Stars<span class="row-sub">History, and give or take stars with a reason</span></span>
            <span class="stars">★ ${stars}</span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        ` : nothing}
        ${d.stars ? html`
          <label class="row">
            <span class="row-text">Saving up for</span>
            <select class="pv-input pv-select" .value=${d.goal ?? ''}
              @change=${(e: Event) => this._change({ goal: (e.target as HTMLSelectElement).value || null })}>
              <option value="" ?selected=${!d.goal}>Nothing yet</option>
              ${goals.map(r => html`<option value=${r.id} ?selected=${d.goal === r.id}>${r.icon ? `${r.icon} ` : ''}${r.name}</option>`)}
            </select>
          </label>
        ` : nothing}
        ${this._renderAway(d)}
      </div>
      <p class="hint">These start from the ${AGE_GROUP_LABELS[d.age_group].toLocaleLowerCase()} defaults.</p>
    `;
  }

  private _renderAway(d: PersonDraft) {
    return html`
      <div class="row">
        <span class="row-text">Away<span class="row-sub">Pause chores for a few days. Nothing is due or missed, and streaks hold.</span></span>
        ${!this._adding ? html`
          <button class="pv-btn pv-btn-secondary remove" type="button"
            @click=${() => { this._adding = { from: '', to: '', note: '' }; }}>Add a time away</button>
        ` : nothing}
      </div>
      ${d.away.map((span, index) => html`
        <div class="row">
          <span class="row-text">${awayText(span)}</span>
          <button class="pv-btn pv-btn-secondary remove" type="button" aria-label="Remove ${awayText(span)}"
            @click=${() => this._change({ away: d.away.filter((_, i) => i !== index) })}>Remove</button>
        </div>
      `)}
      ${this._adding ? html`
        <div class="row">
          <div class="stack">
            <div class="away-form">
              <label>From <input class="pv-input" type="date" .value=${this._adding.from}
                @change=${(e: Event) => { this._adding = { ...this._adding!, from: (e.target as HTMLInputElement).value }; }} /></label>
              <label>To <input class="pv-input" type="date" .value=${this._adding.to} min=${this._adding.from}
                @change=${(e: Event) => { this._adding = { ...this._adding!, to: (e.target as HTMLInputElement).value }; }} /></label>
              <label>Note <input class="pv-input" type="text" maxlength="60" placeholder="At Grandma's" .value=${this._adding.note ?? ''}
                @input=${(e: Event) => { this._adding = { ...this._adding!, note: (e.target as HTMLInputElement).value }; }} /></label>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end">
              <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._adding = null; }}>Cancel</button>
              <button class="pv-btn pv-btn-primary" type="button"
                ?disabled=${!this._adding.from || !this._adding.to || this._adding.to < this._adding.from}
                @click=${this._addAway}>Add</button>
            </div>
          </div>
        </div>
      ` : nothing}
    `;
  }

  private _addAway = (): void => {
    const span = this._adding;
    if (!span) return;
    const note = span.note?.trim() || null;
    const away = [...this.draft.away, { from: span.from, to: span.to, note }].sort((a, b) => a.from.localeCompare(b.from));
    this._change({ away });
    this._adding = null;
  };

  private _openStars = (): void => {
    if (!this.member) return;
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
      detail: { tag: 'pv-person-stars', title: `${this.member.name}'s stars`, back: this.member.name, props: { memberId: this.member.id } },
      bubbles: true, composed: true,
    }));
  };
}

defineElement('pv-person-chores', PvPersonChores);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-sleep.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { baseStyles, formStyles } from '../../../styles/shared';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import { sleepText } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-person-sleep: bedtimes and sleep (spec 14.2, 7.2). My day starts after
 * sleep and ends at bedtime; an imported plan fills these in.
 */
export class PvPersonSleep extends LitElement {
  @property({ attribute: false }) draft!: PersonDraft;

  static styles = [
    baseStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .row .pv-input {
        max-width: 160px;
        margin-left: auto;
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  private _bedtime(which: 'weeknight' | 'weekend', value: string): void {
    const now = this.draft.bedtime;
    if (!value) {
      this._change({ bedtime: which === 'weeknight' ? null : now ? { ...now, weekend: now.weeknight } : null });
      return;
    }
    const weeknight = which === 'weeknight' ? value : now?.weeknight ?? value;
    const weekend = which === 'weekend' ? value : now?.weekend ?? value;
    this._change({ bedtime: { weeknight, weekend } });
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const sleep = d.sleep_hours;
    return html`
      <span class="legend">Sleep</span>
      <div class="group">
        <label class="row">
          <span class="row-text">Bedtime, weeknights</span>
          <input class="pv-input" type="time" .value=${d.bedtime?.weeknight ?? ''}
            @change=${(e: Event) => this._bedtime('weeknight', (e.target as HTMLInputElement).value)} />
        </label>
        <label class="row">
          <span class="row-text">Bedtime, weekends<span class="row-sub">Friday and Saturday nights</span></span>
          <input class="pv-input" type="time" .value=${d.bedtime?.weekend ?? ''} ?disabled=${!d.bedtime}
            @change=${(e: Event) => this._bedtime('weekend', (e.target as HTMLInputElement).value)} />
        </label>
        <div class="row">
          <span class="row-text">Sleep</span>
          <span class="stepper">
            <output>${sleep === null ? 'Not set' : sleepText(sleep)}</output>
            <button type="button" aria-label="Less sleep" ?disabled=${sleep !== null && sleep <= 1}
              @click=${() => this._change({ sleep_hours: sleep === null ? 8 : Math.max(1, sleep - 0.5) })}>−</button>
            <button type="button" aria-label="More sleep" ?disabled=${sleep !== null && sleep >= 16}
              @click=${() => this._change({ sleep_hours: sleep === null ? 8 : Math.min(16, sleep + 0.5) })}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">My day starts after sleep and ends at bedtime.</p>
    `;
  }
}

defineElement('pv-person-sleep', PvPersonSleep);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-phones.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView, Member } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import { copyText } from '../../../core/clipboard';
import type { ChoresService } from '../chores-service';
import { clockText } from './chores-list-derive';
import { memberEntities } from './entities';
import { phoneChoices } from './person-derive';
import { choresSettingsStyles } from './settings-styles';
import type { PlanaVistaData } from '../../../types';

const MAX_PHONES = 5;

/**
 * pv-person-phones: a person's phones (spec 14.2, 10.5): which phones get
 * the evening reminder, and for a parent, Waiting for OK requests with
 * buttons; then Use in automations, the person's entity ids.
 */
export class PvPersonPhones extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) member: Member | null = null;
  @property({ attribute: false }) draft!: PersonDraft;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _copied = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin: 0 0 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .legend + .group {
        margin-bottom: 0;
      }

      .space {
        margin-top: 22px;
      }

      .phones {
        padding: 12px 14px;
      }

      .suggested {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      code {
        font-size: 0.8125rem;
        overflow-wrap: anywhere;
      }

      .copy {
        min-height: 40px;
        margin-left: auto;
      }

      a {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  private _togglePhone(service: string): void {
    const phones = this.draft.phones.includes(service)
      ? this.draft.phones.filter(p => p !== service)
      : [...this.draft.phones, service].slice(0, MAX_PHONES);
    this._change({ phones });
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const choices = phoneChoices(this.hass as never, { person: d.person, phones: d.phones });
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    const evening = board?.settings.evening_check ?? null;
    const timeFormat = this.data?.display?.time_format ?? '12h';
    return html`
      <span class="legend">Phones</span>
      <div class="group">
        ${choices.length ? html`
          <div class="phones chips" role="group" aria-label="Phones">
            ${choices.map(choice => html`
              <button class="chip chip--plain" type="button" aria-pressed=${d.phones.includes(choice.service) ? 'true' : 'false'}
                @click=${() => this._togglePhone(choice.service)}>
                ${choice.label}${choice.suggested ? html` <span class="suggested">· theirs</span>` : nothing}
              </button>
            `)}
          </div>
        ` : html`
          <div class="row"><span class="row-sub">No phones with the Home Assistant app yet. Install the Companion app on a phone, and it shows up here.</span></div>
        `}
        ${d.phones.length ? html`
          ${this._toggle(d.notify.reminders, 'Evening reminders',
            evening ? `At ${clockText(evening, timeFormat)}, only if chores are left` : 'Turn on the evening check in Reminders',
            () => this._change({ notify: { ...d.notify, reminders: !d.notify.reminders } }))}
          ${d.parent ? this._toggle(d.notify.requests, 'Waiting for OK requests', 'With Looks good and Send back buttons',
            () => this._change({ notify: { ...d.notify, requests: !d.notify.requests } })) : nothing}
        ` : nothing}
      </div>
      ${this.member ? this._renderAutomations(this.member) : nothing}
    `;
  }

  private _toggle(on: boolean, label: string, sub: string, set: () => void) {
    return html`
      <div class="row toggle-row">
        <span class="row-text"><span>${label}</span><span class="row-sub">${sub}</span></span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  private _renderAutomations(member: Member) {
    const devices = (this.hass as unknown as { devices?: Record<string, { name?: string; model?: string }> })?.devices ?? {};
    const device = Object.entries(devices).find(([, d]) => d.name === member.name && d.model === 'Household member')?.[0];
    return html`
      <span class="legend space">Use in automations</span>
      <div class="group">
        <div class="row">
          <span class="row-text">ID<code>${member.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(member.id)}>${this._copied ? 'Copied' : 'Copy'}</button>
        </div>
        ${memberEntities(this.hass?.states as never, member).map(entity => html`
          <div class="row">
            <span class="row-text">${entity.label}<code>${entity.entity_id}</code></span>
          </div>
        `)}
      </div>
      <p class="hint">
        These names stay the same even if ${member.name} is renamed.
        ${device ? html`<a href="/config/devices/device/${device}" target="_top">Open ${member.name} in Home Assistant ↗</a>` : nothing}
      </p>
    `;
  }

  private async _copy(text: string): Promise<void> {
    this._copied = await copyText(text);
    window.setTimeout(() => { this._copied = false; }, 2000);
  }
}

defineElement('pv-person-phones', PvPersonPhones);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-person-stars.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { StarEntry, starLine } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-person-stars: someone's stars (spec 14.2, 8.15): the balance, give or
 * take stars with a reason, and the history of what each change was for.
 */
export class PvPersonStars extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _history: StarEntry[] | null = null;
  @state() private _balance = 0;
  @state() private _give = true;
  @state() private _amount = 5;
  @state() private _reason = '';
  @state() private _problem = '';
  @state() private _saving = false;

  private get _memberId(): string {
    return String(this.pageProps.memberId ?? '');
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this._load();
  }

  private async _load(): Promise<void> {
    try {
      const result = await this._chores?.api.starHistory(this._memberId);
      if (result) {
        this._history = result.history;
        this._balance = result.balance;
      }
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't load the history. Check the connection and try again.";
      this._history = [];
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .balance {
        margin: 0 0 18px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--pv-star-ink, #8A6A00);
      }

      .reason {
        width: 100%;
      }

      .amount {
        font-weight: 700;
        min-width: 48px;
      }

      .plus {
        color: var(--pv-success-ink, #2F7D4F);
      }

      .when {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        white-space: nowrap;
      }
    `,
  ];

  render() {
    const members = this.household?.members ?? [];
    const names = Object.fromEntries(members.map(m => [m.id, m.name]));
    const balance = this._chores?.board()?.members[this._memberId]?.stars ?? this._balance;
    return html`
      <p class="balance" aria-label="${balance} stars">★ ${balance}</p>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <h2 class="section-label">Give or take</h2>
      <div class="group">
        <div class="row">
          <div class="segmented" role="group" aria-label="Give or take">
            <button type="button" aria-pressed=${this._give ? 'true' : 'false'} @click=${() => { this._give = true; }}>Give</button>
            <button type="button" aria-pressed=${!this._give ? 'true' : 'false'} @click=${() => { this._give = false; }}>Take</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${this._amount}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${this._amount <= 1} @click=${() => { this._amount -= 1; }}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${this._amount >= 100} @click=${() => { this._amount += 1; }}>+</button>
          </span>
        </div>
        <div class="row">
          <input class="pv-input reason" type="text" maxlength="60" placeholder="Why? Like: Helped a neighbor" aria-label="Reason"
            .value=${this._reason} @input=${(e: Event) => { this._reason = (e.target as HTMLInputElement).value; this._problem = ''; }} />
        </div>
        <div class="row">
          <button class="pv-btn pv-btn-primary" type="button" style="margin-left: auto" ?disabled=${this._saving} @click=${this._award}>
            ${this._give ? `Give ★ ${this._amount}` : `Take ★ ${this._amount}`}
          </button>
        </div>
      </div>
      <h2 class="section-label">History</h2>
      ${this._history === null ? html`<div class="skeleton"></div><div class="skeleton"></div>` : this._history.length ? html`
        <ul class="group">
          ${this._history.map(entry => {
            const line = starLine(entry, names);
            return html`
              <li class="row">
                <span class="amount ${entry.delta > 0 ? 'plus' : ''}">${line.amount}</span>
                <span class="row-text">${line.what}</span>
                <span class="when">${new Date(entry.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </li>
            `;
          })}
        </ul>
      ` : html`<p class="empty">No stars yet.</p>`}
    `;
  }

  private _award = async (): Promise<void> => {
    const reason = this._reason.trim();
    if (!reason) {
      this._problem = 'Add a reason.';
      return;
    }
    const chores = this._chores;
    if (!chores) return;
    this._saving = true;
    try {
      const result = await chores.api.awardStars(this._memberId, this._give ? this._amount : -this._amount, reason);
      this._balance = result.balance;
      this._reason = '';
      await this._load();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  };
}

defineElement('pv-person-stars', PvPersonStars);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index 7697dda..381ff77 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -1,6 +1,8 @@
 import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
 import { PageRegistry } from '../../core/page-registry';
-import { SettingsContext, SettingsPage, settingsRegistry } from '../../core/settings-registry';
+import {
+  PersonSection, SettingsContext, SettingsPage, personSections, settingsRegistry,
+} from '../../core/settings-registry';
 import { ChoresService, choresEnabled } from './chores-service';
 import type { Board } from './chores-types';
 import { remindersSummary } from './settings/reminders-derive';
@@ -94,7 +96,18 @@ export const choresSettingsPages: SettingsPage[] = [
   },
 ];
 
-/** Add the chores pages to Settings. */
-export function registerChoresSettings(settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry): void {
+/** The person page's chores parts (spec 14.2): the chores rows, sleep, and phones with Use in automations. */
+export const choresPersonSections: PersonSection[] = [
+  { id: 'chores', label: 'Chores', order: 100, slot: 'role', tag: 'pv-person-chores', applies: ({ household }) => choresEnabled({ household }) },
+  { id: 'sleep', label: 'Sleep', order: 200, slot: 'pin', tag: 'pv-person-sleep', applies: ({ household }) => choresEnabled({ household }) },
+  { id: 'phones', label: 'Phones', order: 300, slot: 'links', tag: 'pv-person-phones', applies: ({ household }) => choresEnabled({ household }) },
+];
+
+/** Add the chores pages to Settings, and their parts to the person page. */
+export function registerChoresSettings(
+  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
+  sections: PageRegistry<SettingsContext, PersonSection> = personSections,
+): void {
   for (const page of choresSettingsPages) settings.register(page);
+  for (const section of choresPersonSections) sections.register(section);
 }
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index e889ac3..447ad39 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -6,6 +6,10 @@ import './settings/pv-rewards-page';
 import './settings/pv-reward-editor';
 import './settings/pv-rules-page';
 import './settings/pv-reminders-page';
+import './settings/pv-person-chores';
+import './settings/pv-person-sleep';
+import './settings/pv-person-phones';
+import './settings/pv-person-stars';
 import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
```

- [ ] **Step 5: Run them again.** Same command. Expected: `15 passed`.
- [ ] **Step 6: Run the whole frontend suite.** Expected: tsc clean, `678 passed`; the backend suite, `1037 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(card): the person page's chores rows` with the trailers.

---

### Task 9: Import and export, and the review page

Spec 14.5 (Import and export: import a plan by choosing a file or pasting its text, export a PlanaVista file, restore one) and 14.6 (the review inside Settings: the file card, People with rematch and age groups, Needs a look, On the board by category with switches, Plan only, Set times, and the pinned Import bar with a plain summary). The card's reading of the preview is checked against a sample the backend writes.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/chores-client.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `tests/fixtures/import_preview_sample.json`, `tests/test_chores_importer.py`, `custom_components/planavista/frontend/test/import-derive.test.ts`, `custom_components/planavista/frontend/test/chores-settings.test.ts`

**Interfaces:**
- Consumes: Task 3's commands; Task 2's preview shape.
- Produces: `ImportPreview`, `ImportChoices`, `RESTORE_FORMAT`, `emptyChoices`, `fileLine`, `tiles`, `personLine`, `matchOf`, `missingAges`, `lookLines`, `byCategory`, `onBoardOf`, `activityLine`, `sections`, `importSummary`, `importedText`; `ChoresApi.importPreview`, `importApply`, `exportHousehold`, `enable`, `ImportProblem`, `ImportSummary`; the page `import-export` (group `data`, also while chores are off) and the elements `pv-import-export-page`, `pv-import-preview` (reused by setup), `pv-import-review`.

- [ ] **Step 1: Write the backend's sample preview and the failing tests.**

`tests/fixtures/import_preview_sample.json` (new):

```json
{
 "description": "The sample plan's preview for Alex, Blair, and Casey with the sample chores, as planavista/import/preview sends it (chores/importer.py preview). The card's review page reads this shape; tests/test_chores_importer.py keeps it current.",
 "preview": {
  "file": {
   "format": "household-hours/v1",
   "label": "Household Hours plan, version 1",
   "exported": "2026-10-03",
   "source": "Household Hours planner"
  },
  "people": [
   {
    "ref": "p_alex",
    "name": "Alex",
    "match": "alex",
    "match_name": "Alex",
    "color": "#277DA1",
    "bedtime": {
     "weeknight": "23:00",
     "weekend": "23:30"
    },
    "sleep_hours": 7.5,
    "age_group": null,
    "parent": null
   },
   {
    "ref": "p_blair",
    "name": "Blair",
    "match": "blair",
    "match_name": "Blair",
    "color": "#F3722C",
    "bedtime": {
     "weeknight": "22:30",
     "weekend": "23:30"
    },
    "sleep_hours": 8.0,
    "age_group": null,
    "parent": null
   },
   {
    "ref": "p_casey",
    "name": "Casey",
    "match": "casey",
    "match_name": "Casey",
    "color": "#43AA8B",
    "bedtime": {
     "weeknight": "22:00",
     "weekend": "23:00"
    },
    "sleep_hours": 9.0,
    "age_group": null,
    "parent": null
   },
   {
    "ref": "p_dana",
    "name": "Dana",
    "match": null,
    "match_name": null,
    "color": "#F94144",
    "bedtime": {
     "weeknight": "19:30",
     "weekend": "20:00"
    },
    "sleep_hours": 10.5,
    "age_group": null,
    "parent": null
   }
  ],
  "activities": [
   {
    "ref": "a02",
    "name": "Kitchen cleanup",
    "icon": null,
    "category": "kitchen",
    "kind": "board",
    "on_board": true,
    "match": "kitchen_cleanup",
    "schedule": "plan",
    "assignees": [
     "p_alex"
    ],
    "minimum": {
     "hours": 0.5,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a03",
    "name": "Unload the dishwasher",
    "icon": null,
    "category": "kitchen",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 0.25,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "morning"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a04",
    "name": "Set the table",
    "icon": null,
    "category": "kitchen",
    "kind": "board",
    "on_board": true,
    "match": "set_the_table",
    "schedule": "plan",
    "assignees": [
     "p_dana"
    ],
    "minimum": {
     "hours": 0.25,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a05",
    "name": "Cook dinner",
    "icon": null,
    "category": "kitchen",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_alex",
     "p_blair"
    ],
    "minimum": {
     "hours": 1.0,
     "per": "day"
    },
    "split": "shared",
    "shares": {
     "p_alex": 0.5,
     "p_blair": 0.5
    },
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a06",
    "name": "Laundry",
    "icon": null,
    "category": "cleaning",
    "kind": "board",
    "on_board": true,
    "match": "laundry",
    "schedule": "plan",
    "assignees": [
     "p_blair"
    ],
    "minimum": {
     "hours": 2.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "mon",
     "thu"
    ],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a07",
    "name": "Clean the bathroom",
    "icon": null,
    "category": "cleaning",
    "kind": "board",
    "on_board": true,
    "match": "clean_the_bathroom",
    "schedule": "plan",
    "assignees": [
     "p_blair",
     "p_casey"
    ],
    "minimum": {
     "hours": 2.0,
     "per": "week"
    },
    "split": "shared",
    "shares": {
     "p_blair": 1.0,
     "p_casey": 1.0
    },
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a08",
    "name": "Vacuum",
    "icon": null,
    "category": "cleaning",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_blair"
    ],
    "minimum": {
     "hours": 1.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a09",
    "name": "Mop the floors",
    "icon": null,
    "category": "cleaning",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 0.75,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a10",
    "name": "Tidy toys",
    "icon": null,
    "category": "cleaning",
    "kind": "board",
    "on_board": true,
    "match": "tidy_toys",
    "schedule": "plan",
    "assignees": [
     "p_dana"
    ],
    "minimum": {
     "hours": 0.25,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a11",
    "name": "Take out the trash",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": "take_out_the_trash",
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 0.5,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "tue",
     "fri"
    ],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a12",
    "name": "Cat care",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": "cat_care",
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 0.5,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "morning",
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a13",
    "name": "Yard work",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": "yard_work",
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 1.5,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a14",
    "name": "Groceries",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": "groceries",
    "schedule": "plan",
    "assignees": [
     "p_alex"
    ],
    "minimum": {
     "hours": 1.5,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "sat"
    ],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a15",
    "name": "Wash the car",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [],
    "minimum": {
     "hours": 1.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a16",
    "name": "Water the plants",
    "icon": null,
    "category": "home",
    "kind": "board",
    "on_board": true,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_blair",
     "p_casey"
    ],
    "minimum": {
     "hours": 0.75,
     "per": "week"
    },
    "split": "shared",
    "shares": {
     "p_blair": 0.25,
     "p_casey": 0.5
    },
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a17",
    "name": "Homework",
    "icon": null,
    "category": "work",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 1.0,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [
     "mon",
     "tue",
     "wed",
     "thu",
     "fri"
    ],
    "time_of_day": [
     "afternoon"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a18",
    "name": "Reading",
    "icon": null,
    "category": "personal",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_dana"
    ],
    "minimum": {
     "hours": 0.5,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a19",
    "name": "Exercise",
    "icon": null,
    "category": "personal",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_alex",
     "p_blair"
    ],
    "minimum": {
     "hours": 3.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a20",
    "name": "Family dinner",
    "icon": null,
    "category": "family",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_alex",
     "p_blair",
     "p_casey",
     "p_dana"
    ],
    "minimum": {
     "hours": 1.0,
     "per": "day"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [
     "evening"
    ],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a21",
    "name": "Work",
    "icon": null,
    "category": "work",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_alex",
     "p_blair"
    ],
    "minimum": {
     "hours": 40.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "mon",
     "tue",
     "wed",
     "thu",
     "fri"
    ],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a22",
    "name": "Organize the closet",
    "icon": null,
    "category": "other",
    "kind": "plan_only",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_alex"
    ],
    "minimum": {
     "hours": 1.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [],
    "time_of_day": [],
    "set_time": null,
    "once": null,
    "repeats": null
   },
   {
    "ref": "a23",
    "name": "Soccer practice",
    "icon": null,
    "category": "family",
    "kind": "set_time",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_casey"
    ],
    "minimum": {
     "hours": 3.0,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "tue",
     "thu"
    ],
    "time_of_day": [],
    "set_time": "17:30",
    "once": null,
    "repeats": null
   },
   {
    "ref": "a24",
    "name": "Piano lesson",
    "icon": null,
    "category": "personal",
    "kind": "set_time",
    "on_board": false,
    "match": null,
    "schedule": "plan",
    "assignees": [
     "p_dana"
    ],
    "minimum": {
     "hours": 0.5,
     "per": "week"
    },
    "split": "each",
    "shares": null,
    "days": [
     "wed"
    ],
    "time_of_day": [],
    "set_time": "16:00",
    "once": null,
    "repeats": null
   }
  ],
  "rewards": [],
  "settings": false,
  "needs_a_look": [
   {
    "kind": "unassigned",
    "ref": "a15",
    "name": "Wash the car"
   },
   {
    "kind": "shares",
    "ref": "a16",
    "name": "Water the plants",
    "hours": 0.75,
    "planned": 0.5,
    "per": "week"
   },
   {
    "kind": "updates",
    "refs": [
     "a02",
     "a04",
     "a06",
     "a07",
     "a10",
     "a11",
     "a12",
     "a13",
     "a14"
    ],
    "names": [
     "Kitchen cleanup",
     "Set the table",
     "Laundry",
     "Clean the bathroom",
     "Tidy toys",
     "Take out the trash",
     "Cat care",
     "Yard work",
     "Groceries"
    ]
   }
  ]
 }
}
```

`tests/test_chores_importer.py`:

```diff
diff --git a/tests/test_chores_importer.py b/tests/test_chores_importer.py
index 322f801..eafb2cc 100644
--- a/tests/test_chores_importer.py
+++ b/tests/test_chores_importer.py
@@ -314,3 +314,9 @@ def test_a_restore_onto_a_household_updates_what_is_there() -> None:
     assert result["members_add"] == [] and set(result["members_update"]) == {"alex", "blair", "casey", "dana"}
     assert "person" not in result["members_update"]["casey"]  # a person Home Assistant doesn't have keeps the link there is
     assert result["activities_add"] == [] and len(result["activities_update"]) == 16
+
+
+def test_the_preview_the_card_reads_keeps_its_shape() -> None:
+    """test/import-derive.test.ts reads tests/fixtures/import_preview_sample.json; this keeps it current."""
+    fixture = json.loads((Path(__file__).parent / "fixtures" / "import_preview_sample.json").read_text("utf-8"))
+    assert _sample_preview() == fixture["preview"]
```

`custom_components/planavista/frontend/test/import-derive.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ImportPreview, activityLine, byCategory, emptyChoices, fileLine, importSummary, importedText, lookLines, matchOf, missingAges,
  onBoardOf, personLine, sections, tiles,
} from '../src/modules/chores/settings/import-derive';
import { MEMBERS } from './chores-fixtures';

const PREVIEW = (JSON.parse(readFileSync(new URL('../../../../tests/fixtures/import_preview_sample.json', import.meta.url), 'utf-8')) as {
  preview: ImportPreview;
}).preview;
const people = (name: string) => PREVIEW.people.find(p => p.name === name)!;
const activity = (name: string) => PREVIEW.activities.find(a => a.name === name)!;

describe('the review page', () => {
  it('says what the file is', () => {
    expect(fileLine(PREVIEW)).toBe('Household Hours plan, version 1 · exported October 3');
  });

  it('says who each person in the plan is', () => {
    const choices = emptyChoices();
    expect(personLine(people('Alex'), choices, MEMBERS)).toBe('Matches Alex · sleeps 7 h 30 min');
    expect(personLine(people('Dana'), choices, MEMBERS)).toBe('New person · bedtime 7:30 PM · sleeps 10 h 30 min');
    const rematched = { ...choices, people: { p_dana: { match: 'dana' } } };
    expect(matchOf(people('Dana'), rematched)).toBe('dana');
    expect(personLine(people('Dana'), rematched, MEMBERS)).toBe('Matches Dana · sleeps 10 h 30 min');
  });

  it('needs an age group for each new person before Import', () => {
    expect(missingAges(PREVIEW, emptyChoices()).map(p => p.name)).toEqual(['Dana']);
    expect(missingAges(PREVIEW, { ...emptyChoices(), people: { p_dana: { age_group: 'young_child' } } })).toEqual([]);
  });

  it('sorts activities onto the board, plan only, and set times, with the parent\'s switches', () => {
    const plain = sections(PREVIEW, emptyChoices());
    expect([plain.board.length, plain.planOnly.length, plain.setTimes.length]).toEqual([15, 6, 2]);
    expect(onBoardOf(activity('Homework'), emptyChoices())).toBe(false);
    const switched = { ...emptyChoices(), on_board: { a17: true, a08: false } };
    expect(onBoardOf(activity('Homework'), switched)).toBe(true);
    expect(sections(PREVIEW, switched).board.map(a => a.name)).toContain('Homework');
    expect(onBoardOf(activity('Soccer practice'), { ...emptyChoices(), on_board: { a23: true } })).toBe(false);
    expect(tiles(PREVIEW, emptyChoices())).toEqual([
      { value: 4, label: 'people' }, { value: 15, label: 'on the board' }, { value: 6, label: 'plan only' }, { value: 2, label: 'set times' },
    ]);
  });

  it('says each activity in a line', () => {
    expect(activityLine(activity('Clean the bathroom'), PREVIEW.people, emptyChoices())).toBe('Blair, Casey · 2 h a week · updates yours');
    expect(activityLine(activity('Vacuum'), PREVIEW.people, emptyChoices())).toBe('Blair · 1 h a week');
    expect(activityLine(activity('Wash the car'), PREVIEW.people, emptyChoices())).toBe('No one yet · 1 h a week');
    expect(activityLine(activity('Wash the car'), PREVIEW.people, { ...emptyChoices(), assignees: { a15: ['p_casey'] } }))
      .toBe('Casey · 1 h a week');
    expect(activityLine(activity('Piano lesson'), PREVIEW.people, emptyChoices())).toBe('Dana · at 4:00 PM');
  });

  it('groups activities by category', () => {
    const groups = byCategory(sections(PREVIEW, emptyChoices()).board);
    expect(groups.map(g => [g.label, g.items.length])).toEqual([['Kitchen', 4], ['Cleaning', 5], ['Home and yard', 6]]);
  });

  it('says what needs a look', () => {
    expect(lookLines(PREVIEW)).toEqual([
      { kind: 'unassigned', ref: 'a15', title: 'No one is assigned to Wash the car.', detail: 'It waits in Chores, off the board, until someone is.' },
      {
        kind: 'shares', ref: 'a16', title: 'The shares of Water the plants add up to 45 min, not 30 min.',
        detail: "It comes in with 45 min a week, what everyone's share adds up to.",
      },
      { kind: 'updates', title: '9 are already in your chores.', detail: "Kitchen cleanup, Set the table, Laundry, and 6 more get the plan's times." },
    ]);
  });

  it('sums up the import on its bar (spec 14.6)', () => {
    expect(importSummary(PREVIEW, emptyChoices())).toBe('Adds Dana and 14 activities, and updates 9.');
    expect(importSummary(PREVIEW, { ...emptyChoices(), people: { p_dana: { match: 'dana' } } })).toBe('Adds 14 activities, and updates 9.');
  });

  it('says what an import did, after it', () => {
    expect(importedText({ people_added: ['Dana'], activities_added: 14, activities_updated: 9, rewards_added: 0 }))
      .toBe('Imported: Dana and 14 activities added, 9 updated.');
    expect(importedText({ people_added: [], activities_added: 0, activities_updated: 0, rewards_added: 0 }))
      .toBe('Imported. Nothing needed changing.');
  });
});
```

`custom_components/planavista/frontend/test/chores-settings.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/chores-settings.test.ts b/custom_components/planavista/frontend/test/chores-settings.test.ts
index 0fd654c..8e2052c 100644
--- a/custom_components/planavista/frontend/test/chores-settings.test.ts
+++ b/custom_components/planavista/frontend/test/chores-settings.test.ts
@@ -40,6 +40,13 @@ describe('the Chores group of Settings', () => {
     expect(summary('rules', null)).toBe('');
   });
 
+  it('offers Import and export with chores off too', () => {
+    const registry = new PageRegistry<SettingsContext, SettingsPage>();
+    registerChoresSettings(registry);
+    expect(registry.pages(context(false, null)).map(p => p.id)).toEqual(['import-export']);
+    expect(registry.pages({ household: null, data: {} as never }).map(p => p.id)).toEqual([]);
+  });
+
   it('reads the board from the chores service', () => {
     expect(settingsBoard(context(true, sample))).toBe(sample);
     expect(settingsBoard({ services: {} })).toBeNull();
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_importer.py -q` Expected: `26 passed` at once: the sample is what Task 2's `preview` writes. `npx vitest run test/import-derive.test.ts test/chores-settings.test.ts` Expected: FAIL: `import-derive.test.ts` can't load its module, and Settings has no Import and export page.

- [ ] **Step 3: Write the review's rules and the pages.**

`custom_components/planavista/frontend/src/modules/chores/chores-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
index 8ffc394..ca22739 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
@@ -1,6 +1,7 @@
 import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
 import { WsApi } from '../../core/ws-api';
 import type { Member } from '../../core/household';
+import type { ImportChoices, ImportPreview } from './settings/import-derive';
 import type { StarEntry } from './settings/person-derive';
 import type {
   Activity, ChoreHistory, ChoresFeed, ChoresSettings, CompleteResult, DayView, Reward, WeekView,
@@ -13,6 +14,22 @@ export class ChoresSubscription extends LiveSubscription<ChoresFeed> {
   }
 }
 
+/** Why a file can't be imported, item by item (planavista/import/*). */
+export interface ImportProblem {
+  code: 'unknown_file' | 'newer_file' | 'invalid_file' | string;
+  message: string;
+  problems: string[];
+}
+
+/** What an import did. */
+export interface ImportSummary {
+  people_added: string[];
+  activities_added: number;
+  activities_updated: number;
+  rewards_added: number;
+  rewards_updated: number;
+}
+
 /** Per-occurrence changes (planavista/chores/override). */
 export interface OverrideChanges {
   planned_day?: string | null;
@@ -107,4 +124,24 @@ export class ChoresApi extends WsApi {
   startOver(): Promise<{ state: string }> {
     return this.call('planavista/chores/start_over', {});
   }
+
+  /** Read a plan or a PlanaVista file and say where everything would go (nothing is saved). */
+  importPreview(text: string): Promise<{ preview?: ImportPreview; problem?: ImportProblem }> {
+    return this.call('planavista/import/preview', { text });
+  }
+
+  /** Import what the preview showed, with the parent's choices. */
+  importApply(text: string, choices: ImportChoices): Promise<{ summary?: ImportSummary; problem?: ImportProblem }> {
+    return this.call('planavista/import/apply', { text, choices });
+  }
+
+  /** The household as a PlanaVista file. */
+  exportHousehold(): Promise<{ file: Record<string, unknown>; name: string }> {
+    return this.call('planavista/export', {});
+  }
+
+  /** Turn chores on or off for the household (turning them off keeps everything). */
+  enable(enabled: boolean): Promise<{ state: string }> {
+    return this.call('planavista/chores/enable', { enabled });
+  }
 }
```

`custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts` (new):

```ts
import type { AgeGroup, Member } from '../../../core/household';
import { longDate } from '../../../core/recurrence';
import { CATEGORIES } from './chore-draft';
import { clockText, durationText } from './chores-list-derive';
import { sleepText } from './person-derive';

/** What planavista/import/preview says (chores/importer.py preview). */
export interface PreviewPerson {
  ref: string;
  name: string;
  match: string | null;
  match_name: string | null;
  color: string | null;
  bedtime: { weeknight: string; weekend: string } | null;
  sleep_hours: number | null;
  age_group: AgeGroup | null;
  parent: boolean | null;
}

export interface PreviewActivity {
  ref: string;
  name: string;
  icon: string | null;
  category: string;
  kind: 'board' | 'plan_only' | 'set_time';
  on_board: boolean;
  match: string | null;
  schedule: string;
  assignees: string[];
  minimum: { hours: number; per: 'day' | 'week' } | null;
  split: string | null;
  days: string[] | null;
  set_time: string | null;
}

export type NeedsALook =
  | { kind: 'unassigned'; ref: string; name: string }
  | { kind: 'shares'; ref: string; name: string; hours: number; planned: number; per: 'day' | 'week' }
  | { kind: 'updates'; refs: string[]; names: string[] };

export interface ImportPreview {
  file: { format: string; label: string; exported: string | null; source: string | null };
  people: PreviewPerson[];
  activities: PreviewActivity[];
  rewards: Array<{ ref: string; name: string; icon: string | null; match: string | null }>;
  settings: boolean;
  needs_a_look: NeedsALook[];
  starts_over?: boolean;
}

/** The parent's picks on the review page; sent with Import. */
export interface ImportChoices {
  people: Record<string, { match?: string | null; age_group?: AgeGroup }>;
  on_board: Record<string, boolean>;
  assignees: Record<string, string[]>;
}

export const RESTORE_FORMAT = 'planavista.household/v1';

function list(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function emptyChoices(): ImportChoices {
  return { people: {}, on_board: {}, assignees: {} };
}

/** "Household Hours plan, version 1 · exported October 3". */
export function fileLine(preview: ImportPreview): string {
  return preview.file.exported ? `${preview.file.label} · exported ${longDate(preview.file.exported)}` : preview.file.label;
}

/** Who a person in the file is, with the parent's pick: an existing member, or someone new. */
export function matchOf(person: PreviewPerson, choices: ImportChoices): string | null {
  const pick = choices.people[person.ref];
  return pick && 'match' in pick ? pick.match ?? null : person.match;
}

export function ageOf(person: PreviewPerson, choices: ImportChoices): AgeGroup | null {
  return choices.people[person.ref]?.age_group ?? person.age_group;
}

/** A People row's line: "Matches Alex · sleeps 7 h 30 min", "New person · bedtime 7:30 PM · sleeps 10 h 30 min". */
export function personLine(person: PreviewPerson, choices: ImportChoices, members: Member[], timeFormat = '12h'): string {
  const match = matchOf(person, choices);
  const parts = [match ? `Matches ${members.find(m => m.id === match)?.name ?? person.match_name ?? match}` : 'New person'];
  if (!match && person.bedtime) parts.push(`bedtime ${clockText(person.bedtime.weeknight, timeFormat)}`);
  if (person.sleep_hours) parts.push(`sleeps ${sleepText(person.sleep_hours)}`);
  return parts.join(' · ');
}

/** Whether an activity comes in on the board, with the parent's switch. */
export function onBoardOf(activity: PreviewActivity, choices: ImportChoices): boolean {
  if (activity.kind === 'set_time') return false;
  return choices.on_board[activity.ref] ?? activity.on_board;
}

/** An activity's line: "Blair, Casey · 2 h a week · updates yours". */
export function activityLine(activity: PreviewActivity, people: PreviewPerson[], choices: ImportChoices, timeFormat = '12h'): string {
  const refs = choices.assignees[activity.ref] ?? activity.assignees;
  const names = refs.map(ref => people.find(p => p.ref === ref)?.name ?? ref);
  const parts = [names.length ? names.join(', ') : 'No one yet'];
  if (activity.set_time) parts.push(`at ${clockText(activity.set_time, timeFormat)}`);
  else if (activity.minimum) parts.push(`${durationText(activity.minimum.hours * 60)} a ${activity.minimum.per}`);
  if (activity.match) parts.push('updates yours');
  return parts.join(' · ');
}

/** A picture for each category on the review page. */
export const CATEGORY_ICONS: Record<string, string> = {
  kitchen: '🍽️', cleaning: '🧽', home: '🌿', personal: '🙂', school: '📚', work: '💼', family: '👪', other: '📋',
};

/** What an import did, for the toast after it: "Imported: Dana and 14 activities added, 9 updated." */
export function importedText(summary: {
  people_added: string[]; activities_added: number; activities_updated: number; rewards_added: number;
}): string {
  const added = [...summary.people_added];
  if (summary.activities_added) added.push(`${summary.activities_added} ${summary.activities_added === 1 ? 'activity' : 'activities'}`);
  if (summary.rewards_added) added.push(`${summary.rewards_added} ${summary.rewards_added === 1 ? 'reward' : 'rewards'}`);
  const parts: string[] = [];
  if (added.length) parts.push(`${list(added)} added`);
  if (summary.activities_updated) parts.push(`${summary.activities_updated} updated`);
  return parts.length ? `Imported: ${parts.join(', ')}.` : 'Imported. Nothing needed changing.';
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? 'Other';
}

/** Activities grouped by category, in the editor's category order. */
export function byCategory(activities: PreviewActivity[]): Array<{ category: string; label: string; items: PreviewActivity[] }> {
  return CATEGORIES.map(c => ({ category: c.id, label: c.label, items: activities.filter(a => (a.category || 'other') === c.id) }))
    .concat([{ category: '', label: 'Other', items: activities.filter(a => !CATEGORIES.some(c => c.id === a.category)) }])
    .filter(group => group.items.length > 0);
}

/** The review page's sections (spec 14.6): what goes on the board, what stays plan only, and the set times. */
export function sections(preview: ImportPreview, choices: ImportChoices) {
  const board = preview.activities.filter(a => onBoardOf(a, choices));
  const planOnly = preview.activities.filter(a => a.kind !== 'set_time' && !onBoardOf(a, choices));
  const setTimes = preview.activities.filter(a => a.kind === 'set_time');
  return { board, planOnly, setTimes };
}

/** New people who still need an age group before Import (spec 14.6). */
export function missingAges(preview: ImportPreview, choices: ImportChoices): PreviewPerson[] {
  return preview.people.filter(p => !matchOf(p, choices) && !ageOf(p, choices));
}


/** The Import bar (spec 14.6): "Adds Dana and 28 activities, and updates 3." */
export function importSummary(preview: ImportPreview, choices: ImportChoices): string {
  const newPeople = preview.people.filter(p => !matchOf(p, choices)).map(p => p.name);
  const adds = preview.activities.filter(a => !a.match).length;
  const updates = preview.activities.filter(a => a.match).length;
  const added: string[] = [...newPeople];
  if (adds) added.push(`${adds} ${adds === 1 ? 'activity' : 'activities'}`);
  const rewards = preview.rewards.filter(r => !r.match).length;
  if (rewards) added.push(`${rewards} ${rewards === 1 ? 'reward' : 'rewards'}`);
  const parts: string[] = [];
  if (added.length) parts.push(`Adds ${list(added)}`);
  if (updates) parts.push(`${parts.length ? 'and updates' : 'Updates'} ${updates}`);
  return parts.length ? `${parts.join(', ')}.` : 'Nothing new to add.';
}

/** The lines under Needs a look (spec 14.6). */
export function lookLines(preview: ImportPreview): Array<{ kind: NeedsALook['kind']; title: string; detail: string; ref?: string }> {
  return preview.needs_a_look.map(look => {
    if (look.kind === 'unassigned') {
      return { kind: look.kind, ref: look.ref, title: `No one is assigned to ${look.name}.`, detail: 'It waits in Chores, off the board, until someone is.' };
    }
    if (look.kind === 'shares') {
      return {
        kind: look.kind, ref: look.ref,
        title: `The shares of ${look.name} add up to ${durationText(look.hours * 60)}, not ${durationText(look.planned * 60)}.`,
        detail: `It comes in with ${durationText(look.hours * 60)} a ${look.per}, what everyone's share adds up to.`,
      };
    }
    const n = look.names.length;
    return {
      kind: look.kind,
      title: `${n} ${n === 1 ? 'is' : 'are'} already in your chores.`,
      detail: `${n > 3 ? `${look.names.slice(0, 3).join(', ')}, and ${n - 3} more` : list(look.names)} get the plan's times.`,
    };
  });
}

/** Planned counts for the portrait tiles. */
export function tiles(preview: ImportPreview, choices: ImportChoices): Array<{ value: number; label: string }> {
  const s = sections(preview, choices);
  return [
    { value: preview.people.length, label: preview.people.length === 1 ? 'person' : 'people' },
    { value: s.board.length, label: 'on the board' },
    { value: s.planOnly.length, label: 'plan only' },
    { value: s.setTimes.length, label: s.setTimes.length === 1 ? 'set time' : 'set times' },
  ];
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { AGE_GROUP_CHOICES, AgeGroup, Member } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import {
  CATEGORY_ICONS, ImportChoices, ImportPreview, PreviewActivity, RESTORE_FORMAT, activityLine, ageOf, byCategory,
  emptyChoices, lookLines, matchOf, onBoardOf, personLine, sections, tiles,
} from './import-derive';
import { pictureFor } from '../picture-words';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-import-preview: where everything in a file would go (spec 14.6):
 * People (matched by name; tap to rematch; new people pick an age group),
 * Needs a look, On the board by category with a switch each, Plan only, and
 * Set times. Used by Settings' review page and by setup. The parent's picks
 * go out in pv-import-choices.
 *
 * @fires pv-import-choices - detail: ImportChoices
 */
export class PvImportPreview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) preview!: ImportPreview;
  @property({ attribute: false }) members: Member[] = [];
  @property({ attribute: false }) choices: ImportChoices = emptyChoices();
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) timeFormat = '12h';

  @state() private _open = new Set<string>();
  @state() private _assigning: string | null = null;
  @state() private _showUpdates = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      .columns {
        display: grid;
        gap: 0 20px;
      }

      :host([layout='landscape']) .columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 4px;
      }

      :host([layout='landscape']) .tiles {
        display: none;
      }

      .tile {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .tile strong {
        display: block;
        font-size: 1.25rem;
      }

      .tile span {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .dot {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #FFFFFF;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        flex: 0 0 150px;
        max-width: 150px;
        margin-left: auto;
      }

      .mark {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-weight: 800;
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 14%, transparent);
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }

      .mark--attention {
        background: color-mix(in srgb, #F59E0B 22%, transparent);
        color: var(--pv-text, #1A1B1E);
      }

      .link {
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        min-height: 40px;
        white-space: nowrap;
      }

      .nested {
        padding-left: 18px;
      }

      .warning {
        margin: 0 0 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
      }
    `,
  ];

  private _set(choices: ImportChoices): void {
    this.choices = choices;
    this.dispatchEvent(new CustomEvent('pv-import-choices', { detail: choices, bubbles: true, composed: true }));
  }

  private _pickPerson(ref: string, value: string): void {
    const pick = value === '' ? { match: null } : { match: value };
    this._set({ ...this.choices, people: { ...this.choices.people, [ref]: { ...this.choices.people[ref], ...pick } } });
  }

  private _pickAge(ref: string, age: AgeGroup): void {
    this._set({ ...this.choices, people: { ...this.choices.people, [ref]: { ...this.choices.people[ref], age_group: age } } });
  }

  private _switch(activity: PreviewActivity): void {
    this._set({ ...this.choices, on_board: { ...this.choices.on_board, [activity.ref]: !onBoardOf(activity, this.choices) } });
  }

  private _toggleOpen(key: string): void {
    const open = new Set(this._open);
    if (open.has(key)) open.delete(key);
    else open.add(key);
    this._open = open;
  }

  render() {
    const p = this.preview;
    if (!p) return nothing;
    const s = sections(p, this.choices);
    const restoring = p.file.format === RESTORE_FORMAT;
    return html`
      ${p.starts_over ? html`<p class="warning" role="note">Chores need a look, so this restore replaces them with the file's chores, rewards, and rules.</p>` : nothing}
      <div class="tiles">
        ${tiles(p, this.choices).map(t => html`<div class="tile"><strong>${t.value}</strong><span>${t.label}</span></div>`)}
      </div>
      <div class="columns">
        <div>
          ${this._renderPeople()}
          ${this._renderLook()}
          ${restoring && (p.rewards.length || p.settings) ? html`
            <h2 class="section-label">Rewards and rules</h2>
            <div class="group">
              ${p.rewards.length ? html`<div class="row"><span class="row-text">${p.rewards.length} ${p.rewards.length === 1 ? 'reward' : 'rewards'}<span class="row-sub">${p.rewards.map(r => r.name).slice(0, 3).join(', ')}${p.rewards.length > 3 ? ', and more' : ''}</span></span></div>` : nothing}
              ${p.settings ? html`<div class="row"><span class="row-text">Rules<span class="row-sub">Come from the file.</span></span></div>` : nothing}
            </div>
          ` : nothing}
        </div>
        <div>
          ${this._renderBoard(s.board)}
          ${this._renderPlanOnly(s.planOnly)}
          ${this._renderSetTimes(s.setTimes)}
        </div>
      </div>
    `;
  }

  private _renderPeople() {
    const p = this.preview;
    const taken = new Set(p.people.map(person => matchOf(person, this.choices)).filter(Boolean));
    return html`
      <h2 class="section-label">People · ${p.people.length}</h2>
      <div class="group">
        ${p.people.map(person => {
          const match = matchOf(person, this.choices);
          const isNew = !match;
          const age = ageOf(person, this.choices);
          return html`
            <div class="row">
              <div class="stack">
                <div style="display: flex; align-items: center; gap: 12px">
                  <span class="dot" style="background:${person.color ?? '#8E949C'}" aria-hidden="true">${person.name[0]?.toUpperCase()}</span>
                  <span class="row-text">
                    <span class="row-title">${person.name}</span>
                    <span class="row-sub">${personLine(person, this.choices, this.members, this.timeFormat)}</span>
                  </span>
                  ${isNew ? html`<span class="tag">New</span>` : nothing}
                  <select class="pv-input pv-select" aria-label="Who ${person.name} is" .value=${match ?? ''}
                    @change=${(e: Event) => this._pickPerson(person.ref, (e.target as HTMLSelectElement).value)}>
                    <option value="" ?selected=${!match}>New person</option>
                    ${this.members.filter(m => m.id === match || !taken.has(m.id)).map(m => html`
                      <option value=${m.id} ?selected=${m.id === match}>${m.name}</option>
                    `)}
                  </select>
                </div>
                ${isNew ? html`
                  <div class="chips" role="group" aria-label="${person.name}'s age group">
                    ${AGE_GROUP_CHOICES.map(choice => html`
                      <button class="chip chip--plain" type="button" aria-pressed=${age === choice.id ? 'true' : 'false'}
                        @click=${() => this._pickAge(person.ref, choice.id)}>${choice.label}</button>
                    `)}
                  </div>
                ` : nothing}
              </div>
            </div>
          `;
        })}
      </div>
      <p class="hint">Matched by name; pick someone else to change it. Bedtimes and sleep come from the plan.</p>
    `;
  }

  private _renderLook() {
    const lines = lookLines(this.preview);
    if (!lines.length) return nothing;
    const updates = this.preview.needs_a_look.find(l => l.kind === 'updates');
    return html`
      <h2 class="section-label">Needs a look · ${lines.length}</h2>
      <div class="group">
        ${lines.map(line => html`
          <div class="row">
            <div class="stack">
              <div style="display: flex; align-items: flex-start; gap: 12px">
                <span class="mark ${line.kind === 'updates' ? '' : 'mark--attention'}" aria-hidden="true">${line.kind === 'updates' ? 'i' : '!'}</span>
                <span class="row-text"><span>${line.title}</span><span class="row-sub">${line.detail}</span></span>
                ${line.kind === 'unassigned' ? html`
                  <button class="link" type="button" @click=${() => { this._assigning = this._assigning === line.ref ? null : line.ref ?? null; }}>Assign</button>
                ` : line.kind === 'updates' ? html`
                  <button class="link" type="button" @click=${() => { this._showUpdates = !this._showUpdates; }}>${this._showUpdates ? 'Hide them' : 'See them'}</button>
                ` : nothing}
              </div>
              ${line.kind === 'unassigned' && this._assigning === line.ref ? this._renderAssign(line.ref!) : nothing}
              ${line.kind === 'updates' && this._showUpdates && updates?.kind === 'updates' ? html`
                <span class="row-sub">${updates.names.join(', ')}</span>
              ` : nothing}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private _renderAssign(ref: string) {
    const picked = this.choices.assignees[ref] ?? [];
    return html`
      <div class="chips" role="group" aria-label="Who does it">
        ${this.preview.people.map(person => html`
          <button class="chip chip--plain" type="button" aria-pressed=${picked.includes(person.ref) ? 'true' : 'false'}
            @click=${() => {
              const next = picked.includes(person.ref) ? picked.filter(r => r !== person.ref) : [...picked, person.ref];
              this._set({ ...this.choices, assignees: { ...this.choices.assignees, [ref]: next } });
            }}>${person.name}</button>
        `)}
      </div>
    `;
  }

  private _renderActivity(activity: PreviewActivity, withSwitch = true) {
    const on = onBoardOf(activity, this.choices);
    return html`
      <div class="row toggle-row nested">
        <span class="picture" aria-hidden="true">${activity.icon || pictureFor(activity.name)}</span>
        <span class="row-text">
          <span class="row-title">${activity.name}</span>
          <span class="row-sub">${activityLine(activity, this.preview.people, this.choices, this.timeFormat)}</span>
        </span>
        ${withSwitch ? html`
          <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
            aria-label="${activity.name} on the board" @click=${() => this._switch(activity)}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._switch(activity); } }}></div>
        ` : nothing}
      </div>
    `;
  }

  private _renderGroups(activities: PreviewActivity[], prefix: string) {
    return byCategory(activities).map(group => {
      const key = `${prefix}:${group.category}`;
      const open = this._open.has(key);
      return html`
        <button class="row" type="button" aria-expanded=${open ? 'true' : 'false'} @click=${() => this._toggleOpen(key)}>
          <span class="picture" aria-hidden="true">${CATEGORY_ICONS[group.category] ?? '📋'}</span>
          <span class="row-text"><span class="row-title">${group.label}</span></span>
          <span class="row-value">${group.items.length}</span>
          <span class="chevron" aria-hidden="true">${open ? '⌄' : '›'}</span>
        </button>
        ${open ? group.items.map(activity => this._renderActivity(activity)) : nothing}
      `;
    });
  }

  private _renderBoard(board: PreviewActivity[]) {
    return html`
      <h2 class="section-label">On the board · ${board.length}</h2>
      ${board.length ? html`<div class="group">${this._renderGroups(board, 'board')}</div>` : html`<p class="hint">Nothing goes on the board yet. Turn on an activity under Plan only.</p>`}
    `;
  }

  private _renderPlanOnly(planOnly: PreviewActivity[]) {
    if (!planOnly.length) return nothing;
    const counts = byCategory(planOnly).map(g => `${g.label} ${g.items.length}`).join(' · ');
    return html`
      <h2 class="section-label">Plan only · ${planOnly.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has('plan') ? 'true' : 'false'} @click=${() => this._toggleOpen('plan')}>
          <span class="row-text"><span>${counts}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has('plan') ? '⌄' : '›'}</span>
        </button>
        ${this._open.has('plan') ? this._renderGroups(planOnly, 'plan') : nothing}
      </div>
      <p class="hint">Kept in the plan, not checked off. Turn one on to add it.</p>
    `;
  }

  private _renderSetTimes(setTimes: PreviewActivity[]) {
    if (!setTimes.length) return nothing;
    const names = setTimes.map(a => a.name);
    const text = names.length > 2 ? `${names.slice(0, 2).join(', ')}, and ${names.length - 2} more` : names.join(' and ');
    return html`
      <h2 class="section-label">Set times · ${setTimes.length}</h2>
      <div class="group">
        <button class="row" type="button" aria-expanded=${this._open.has('set') ? 'true' : 'false'} @click=${() => this._toggleOpen('set')}>
          <span class="row-text"><span>${text}</span></span>
          <span class="chevron" aria-hidden="true">${this._open.has('set') ? '⌄' : '›'}</span>
        </button>
        ${this._open.has('set') ? setTimes.map(activity => this._renderActivity(activity, false)) : nothing}
      </div>
      <p class="hint">They belong on a calendar, so they never become chores.</p>
    `;
  }
}

defineElement('pv-import-preview', PvImportPreview);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR, POP_PAGE } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ImportChoices, ImportPreview, emptyChoices, fileLine, importSummary, importedText, missingAges } from './import-derive';
import { choresSettingsStyles } from './settings-styles';
import './pv-import-preview';

/**
 * pv-import-review: Review the import (spec 14.6), inside Settings. The file
 * card, the preview, and the Import bar pinned at the bottom with a plain
 * summary. Nothing is saved until Import.
 */
export class PvImportReview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _choices: ImportChoices = emptyChoices();
  @state() private _problems: string[] = [];
  @state() private _importing = false;

  private get _preview(): ImportPreview {
    return this.pageProps.preview as ImportPreview;
  }

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        display: block;
        padding-bottom: 96px;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .badge {
        flex-shrink: 0;
        padding: 8px 6px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .bar {
        position: sticky;
        bottom: 0;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: 20px -20px -40px;
        padding: 14px 20px calc(14px + env(safe-area-inset-bottom, 0px));
        background: var(--pv-card-bg, #FFFFFF);
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.06);
      }

      .bar .text {
        flex: 1;
        min-width: 200px;
      }

      .bar .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .bar button {
        min-height: 48px;
        min-width: 96px;
      }

      .problems {
        margin: 0 0 16px;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }
    `,
  ];

  render() {
    const preview = this._preview;
    if (!preview) return nothing;
    const name = String(this.pageProps.name ?? 'Pasted text');
    const missing = missingAges(preview, this._choices);
    return html`
      <div class="file">
        <span class="badge" aria-hidden="true">JSON</span>
        <span class="row-text"><span class="row-title">${name}</span><span class="row-sub">${fileLine(preview)}</span></span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Choose another</button>
      </div>
      ${this._problems.length ? html`
        <div class="problems" role="alert">
          <strong>This file has problems, so nothing was imported.</strong>
          <ul>${this._problems.map(p => html`<li>${p}</li>`)}</ul>
        </div>
      ` : nothing}
      <pv-import-preview
        .hass=${this.hass}
        .preview=${preview}
        .members=${inOrder(this.household?.members ?? [])}
        .choices=${this._choices}
        .layout=${this.layout}
        .timeFormat=${this.data?.display?.time_format ?? '12h'}
        @pv-import-choices=${(e: CustomEvent<ImportChoices>) => { this._choices = e.detail; }}
      ></pv-import-preview>
      <div class="bar">
        <span class="text">
          ${missing.length ? `Pick an age group for ${missing.map(p => p.name).join(' and ')} to import.` : importSummary(preview, this._choices)}
          <span class="sub">Nothing is deleted. Stars, rewards, and history stay as they are.</span>
        </span>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._pop}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._importing || missing.length > 0}
          @click=${this._import}>Import</button>
      </div>
    `;
  }

  private _pop = (): void => {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  };

  private _import = async (): Promise<void> => {
    const chores = this.services?.chores as ChoresService | undefined;
    if (!chores) return;
    this._importing = true;
    this._problems = [];
    try {
      const result = await chores.api.importApply(String(this.pageProps.text ?? ''), this._choices);
      if (result.problem) {
        this._problems = result.problem.problems.length ? result.problem.problems : [result.problem.message];
        return;
      }
      if (result.summary) {
        this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message: importedText(result.summary) }, bubbles: true, composed: true }));
      }
      this._pop();
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't import. Check the connection and try again."];
    } finally {
      this._importing = false;
    }
  };
}

defineElement('pv-import-review', PvImportReview);
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import { copyText } from '../../../core/clipboard';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ImportProblem } from '../chores-client';
import type { ChoresService } from '../chores-service';
import { choresSettingsStyles } from './settings-styles';

type Mode = 'import' | 'restore';
const PASTED = 'Pasted text';

/**
 * pv-import-export-page: Import and export (spec 14.5, 14.6, 7.9). Import a
 * plan by choosing a file or pasting its text (wall tablets rarely have
 * files), export a PlanaVista file, and restore one. Reading a file opens
 * the review page; nothing is saved until Import there.
 */
export class PvImportExportPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _pasting: Mode | null = null;
  @state() private _text = '';
  @state() private _reading = false;
  @state() private _problem: { name: string; problem: ImportProblem; mode: Mode } | null = null;
  @state() private _exported: { text: string; name: string } | null = null;
  @state() private _copied = false;
  private _mode: Mode = 'import';

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px 14px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 160px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .paste {
        display: grid;
        gap: 8px;
        padding: 12px 14px;
      }

      .error {
        margin: 12px 0 0;
        padding: 16px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .error h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 6px;
        font-size: 1.125rem;
      }

      .error .mark {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 14%, transparent);
        color: var(--pv-danger, #DC2626);
        font-weight: 800;
      }

      .error ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    return html`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      <h2 class="section-label">Import a plan</h2>
      <div class="group">
        <div class="row"><span class="row-sub">A Household Hours plan (version 1) brings its people, bedtimes, and activities. You see where everything goes before anything is saved.</span></div>
        ${this._renderActions('import')}
      </div>
      ${this._problem?.mode === 'import' ? this._renderProblem() : nothing}

      <h2 class="section-label">Export</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Saves people, chores, rewards, and rules as a PlanaVista file that other tools can read. PINs, stars, and history aren't in it; Home Assistant backups keep those.</span></div>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._export}>Export a PlanaVista file</button>
          ${this._exported ? html`
            <button class="pv-btn pv-btn-secondary" type="button" @click=${this._copy}>${this._copied ? 'Copied' : 'Copy the text'}</button>
          ` : nothing}
        </div>
      </div>

      <h2 class="section-label">Restore</h2>
      <div class="group">
        <div class="row"><span class="row-sub">Bring a household back from a PlanaVista file, such as after rebuilding Home Assistant. It shows the same review first.</span></div>
        ${this._renderActions('restore')}
      </div>
      ${this._problem?.mode === 'restore' ? this._renderProblem() : nothing}
    `;
  }

  private _renderActions(mode: Mode) {
    return html`
      <div class="actions">
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${() => this._choose(mode)}>Choose a file</button>
        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = this._pasting === mode ? null : mode; this._problem = null; }}>
          Paste text</button>
      </div>
      ${this._pasting === mode ? html`
        <div class="paste">
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${(e: Event) => { this._text = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim() || this._reading}
            @click=${() => this._read(this._text, PASTED, mode)}>Review</button>
        </div>
      ` : nothing}
    `;
  }

  private _renderProblem() {
    const { name, problem } = this._problem!;
    return html`
      <div class="error" role="alert">
        <h3><span class="mark" aria-hidden="true">!</span>Can't read this file</h3>
        <div>${problem.code === 'unknown_file'
          ? `${name === PASTED ? 'This text' : `"${name}"`} isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.`
          : problem.message}</div>
        ${problem.problems.length ? html`<ul>${problem.problems.map(p => html`<li>${p}</li>`)}</ul>` : nothing}
        <div class="actions" style="padding: 12px 0 0">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = this._problem!.mode; this._problem = null; }}>Paste text instead</button>
          <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._choose(this._problem!.mode)}>Choose another file</button>
        </div>
      </div>
    `;
  }

  private _choose(mode: Mode): void {
    this._mode = mode;
    const input = this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      input.value = '';
      input.click();
    }
  }

  private _onFile = async (event: Event): Promise<void> => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    await this._read(text, file.name, this._mode);
  };

  private async _read(text: string, name: string, mode: Mode): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._reading = true;
    this._problem = null;
    try {
      const result = await chores.api.importPreview(text);
      if (result.problem) {
        this._problem = { name, problem: result.problem, mode };
        return;
      }
      this._pasting = null;
      this._text = '';
      this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
        detail: { tag: 'pv-import-review', title: 'Review the import', back: 'Import and export', props: { text, name, preview: result.preview } },
        bubbles: true, composed: true,
      }));
    } catch (err) {
      this._problem = { name, mode, problem: { code: 'error', message: errorMessage(err) ?? "Couldn't read it. Check the connection and try again.", problems: [] } };
    } finally {
      this._reading = false;
    }
  }

  private _export = async (): Promise<void> => {
    const chores = this._chores;
    if (!chores) return;
    try {
      const { file, name } = await chores.api.exportHousehold();
      const text = JSON.stringify(file, null, 2);
      this._exported = { text, name };
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      this._problem = { name: 'Export', mode: 'import', problem: { code: 'error', message: errorMessage(err) ?? "Couldn't export. Check the connection and try again.", problems: [] } };
    }
  };

  private _copy = async (): Promise<void> => {
    if (!this._exported) return;
    this._copied = await copyText(this._exported.text);
    window.setTimeout(() => { this._copied = false; }, 2000);
  };
}

defineElement('pv-import-export-page', PvImportExportPage);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index 381ff77..bbde519 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -94,6 +94,15 @@ export const choresSettingsPages: SettingsPage[] = [
       return board ? remindersSummary(board.settings, ctx.data?.display?.time_format) : '';
     },
   },
+  {
+    // People, chores, rewards, and rules travel together, so this works with chores off too.
+    id: 'import-export',
+    label: 'Import and export',
+    group: 'data',
+    order: 600,
+    tag: 'pv-import-export-page',
+    applies: ({ household }) => !!household?.available,
+  },
 ];
 
 /** The person page's chores parts (spec 14.2): the chores rows, sleep, and phones with Use in automations. */
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index 447ad39..a49d0ea 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -10,6 +10,8 @@ import './settings/pv-person-chores';
 import './settings/pv-person-sleep';
 import './settings/pv-person-phones';
 import './settings/pv-person-stars';
+import './settings/pv-import-export-page';
+import './settings/pv-import-review';
 import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
```

- [ ] **Step 4: Run them again.** Same command. Expected: `14 passed`.
- [ ] **Step 5: Run the whole frontend suite.** Expected: tsc clean, `688 passed`; the backend suite, `1038 passed`; the copy check passes.
- [ ] **Step 6: Commit.** Message `feat(card): Import and export, and the review page` with the trailers.

---

### Task 10: The chores setup steps

Spec 14.7 (first-run setup: Welcome's Restore, the chores choice, common chores, the household plan, the shared screen with parents' PINs and the admin-account note, and the last step's board preview with two tips and Open the board; the board fills in beside the answers in landscape; leaving halfway resumes at the same step). Steps can change which steps follow them, so the host lays what a step just changed over the household until its update arrives.

**Files:**
- Create: `custom_components/planavista/frontend/src/core/setup-flow.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/starter-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-chores-choice.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-file.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-done-board.ts`
- Modify: `custom_components/planavista/household/websocket.py`, `custom_components/planavista/frontend/src/core/settings-registry.ts`, `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/core/household-client.ts`, `custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`, `custom_components/planavista/frontend/src/shell/setup/welcome-step.ts`, `custom_components/planavista/frontend/src/shell/setup/done-step.ts`, `custom_components/planavista/frontend/src/shell/definition.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `tests/test_chores_setup.py`, `custom_components/planavista/frontend/test/setup-flow.test.ts`, `custom_components/planavista/frontend/test/starter-chores.test.ts`, `custom_components/planavista/frontend/test/setup-derive.test.ts`

**Interfaces:**
- Consumes: Task 9's `pv-import-preview` and import commands; milestone 2's PIN actions (`pv-pin-actions`).
- Produces: backend `SETUP_STARTS` (`restore`, `plan`, `common`, `empty`, `calendar`) and `planavista/household/setup/save` `{start}`; `SetupStep.secondary`, `.skip`, `.wide`; `STEP_CHANGE`; `SetupPatch`; `DonePart`, `doneParts`; the step element hooks `commit()`, `primaryLabel`, `ready`, `secondary()`, `setupPatch`, `openModule`; `mergePatch`, `withPatch`, `stepAfter`; `STARTERS`, `suggestPicks(members)`, `pickLine`, `addLabel`, `pickActivity`; `previewColumns`, `previewTotal`; the steps `restore`, `chores`, `chores-common`, `chores-plan`, `shared-screen` and the Done part `chores-board`.

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_setup.py` (new):

```python
"""First-run setup remembers how the household started (spec 14.7), so the steps that follow apply and setup resumes."""
from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .conftest import ws_command


async def test_setup_remembers_how_the_household_started(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    for start in ("common", "restore", "calendar", None):
        reply = await ws_command(client, {"type": "planavista/household/setup/save", "start": start, "step": "chores"})
        assert reply["success"], reply
        assert household.data["setup"]["start"] == start
    refused = await ws_command(client, {"type": "planavista/household/setup/save", "start": "everything"})
    assert not refused["success"]
    assert household.data["setup"]["step"] == "chores"


async def test_the_household_view_carries_the_start(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await ws_command(client, {"type": "planavista/household/setup/save", "start": "plan"})
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    seen: list[dict[str, Any]] = []
    while not any(m.get("type") == "event" for m in seen):
        seen.append(await client.receive_json())
    view = next(m for m in seen if m.get("type") == "event")["event"]
    assert view["setup"]["start"] == "plan"
```

`custom_components/planavista/frontend/test/setup-flow.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { DonePart, SetupContext, SetupStep } from '../src/core/settings-registry';
import { mergePatch, stepAfter, withPatch } from '../src/core/setup-flow';
import { registerShellSettings, shellSetupSteps } from '../src/shell/definition';
import { registerChoresSettings } from '../src/modules/chores/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import type { HouseholdView } from '../src/core/household';

function view(start: string | null, choresOn: boolean): HouseholdView {
  return {
    available: true, members: [], account: { kind: 'admin', shared: false } as never,
    security: { shuffle_keypad: false, shared_screens: 0 }, modules: { chores: { enabled: choresOn } },
    setup: { completed: false, step: null, start },
  };
}

function steps(household: HouseholdView): string[] {
  const setup = new PageRegistry<SetupContext, SetupStep>();
  registerShellSettings(undefined, setup);
  registerCalendarSettings(undefined, setup);
  registerChoresSettings(undefined, undefined, setup, new PageRegistry<SetupContext, DonePart>());
  return setup.pages({ household, data: {} as never }).map(step => step.id);
}

describe('first-run setup with chores (spec 14.7)', () => {
  it('asks about chores after Calendars, and offers Restore on Welcome', () => {
    expect(steps(view(null, false))).toEqual(['welcome', 'people', 'calendars', 'chores', 'look', 'done']);
    expect(shellSetupSteps[0].secondary).toBe('Restore from a PlanaVista file');
  });

  it('brings in common chores or the plan, and the shared screen once chores are on', () => {
    expect(steps(view('common', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'chores-common', 'shared-screen', 'look', 'done']);
    expect(steps(view('plan', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'chores-plan', 'shared-screen', 'look', 'done']);
    expect(steps(view('empty', true))).toEqual(['welcome', 'people', 'calendars', 'chores', 'shared-screen', 'look', 'done']);
  });

  it('goes straight to Look for just the calendar', () => {
    expect(steps(view('calendar', false))).toEqual(['welcome', 'people', 'calendars', 'chores', 'look', 'done']);
  });

  it('restores in one step, then skips the chores question', () => {
    expect(steps(view('restore', false))).toEqual(['welcome', 'restore', 'people', 'calendars', 'look', 'done']);
    expect(steps(view('restore', true))).toEqual(['welcome', 'restore', 'people', 'calendars', 'shared-screen', 'look', 'done']);
  });
});

describe('the setup host\'s patches', () => {
  it('lays what a step changed over the household until its update arrives', () => {
    const patched = withPatch(view(null, false), { setup: { start: 'common' }, modules: { chores: { enabled: true } } })!;
    expect(patched.setup.start).toBe('common');
    expect((patched.modules.chores as { enabled: boolean }).enabled).toBe(true);
    expect(withPatch(null, { setup: { start: 'plan' } })).toBeNull();
    const plain = view('plan', true);
    expect(withPatch(plain, {})).toBe(plain);
  });

  it('merges patches, the later one winning', () => {
    const merged = mergePatch({ setup: { start: 'common' }, modules: { chores: { enabled: true } } },
      { setup: { start: 'calendar' }, modules: { chores: { enabled: false } } });
    expect(merged).toEqual({ setup: { start: 'calendar' }, modules: { chores: { enabled: false } } });
    expect(mergePatch({ setup: { a: 1 } }, undefined)).toEqual({ setup: { a: 1 } });
  });

  it('moves to the step after the one on screen, as the steps stand now', () => {
    const now = [{ id: 'chores' }, { id: 'chores-common' }, { id: 'look' }];
    expect(stepAfter(now, 'chores')).toBe(1);
    expect(stepAfter(now, 'look')).toBeNull();
    expect(stepAfter(now, 'gone')).toBe(1);
  });
});
```

`custom_components/planavista/frontend/test/starter-chores.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { STARTERS, addLabel, pickActivity, pickLine, suggestPicks } from '../src/modules/chores/setup/starter-chores';
import { MEMBERS, person } from './chores-fixtures';

describe('the common chores starter list (spec 14.7)', () => {
  it('has the twelve starters in the spec\'s order', () => {
    expect(STARTERS.map(s => s.name)).toEqual([
      'Make your bed', 'Set the table', 'Tidy toys', 'Unload the dishwasher', 'Take out the trash', 'Feed the pet', 'Laundry',
      'Kitchen cleanup', 'Vacuum', 'Clean the bathroom', 'Yard work', 'Groceries',
    ]);
  });

  it('suggests each one by age and picks eight for the sample household', () => {
    const picks = suggestPicks(MEMBERS);
    expect(picks.map(p => [p.id, p.member, p.on])).toEqual([
      ['make_your_bed', 'dana', true], ['set_the_table', 'dana', true], ['tidy_toys', 'dana', true],
      ['unload_the_dishwasher', 'casey', true], ['take_out_the_trash', 'casey', true], ['feed_the_pet', 'casey', false],
      ['laundry', 'alex', true], ['kitchen_cleanup', 'blair', true], ['vacuum', 'alex', false],
      ['clean_the_bathroom', 'casey', true], ['yard_work', 'casey', false], ['groceries', 'blair', false],
    ]);
    expect(addLabel(picks)).toBe('Add 8 chores');
  });

  it('leaves a chore nobody suits unpicked, with no one', () => {
    const picks = suggestPicks([person('alex', { parent: true }), person('blair', { parent: true })]);
    const bed = picks.find(p => p.id === 'make_your_bed')!;
    expect([bed.member, bed.on]).toEqual([null, false]);
    expect(addLabel(picks)).toBe('Add 2 chores');
    expect(addLabel(picks.map(p => ({ ...p, on: false })))).toBe('Add chores');
  });

  it('says each tile\'s rhythm and time', () => {
    const picks = suggestPicks(MEMBERS);
    expect(picks.slice(0, 1).concat(picks.slice(4, 5), picks.slice(6, 7)).map(pickLine)).toEqual([
      'Daily · 5 min', 'Tue, Fri · 10 min', 'Weekly · 2 h',
    ]);
  });

  it('turns a pick into a normal Plan chore', () => {
    const picks = suggestPicks(MEMBERS);
    expect(pickActivity(picks.find(p => p.id === 'take_out_the_trash')!)).toEqual({
      name: 'Take out the trash', icon: '🗑️', category: 'home', schedule: 'plan', assignees: ['casey'], on_board: true,
      needs_ok: false, stars: null, minimum: { hours: 20 / 60, per: 'week' }, split: 'each', times: 1, days: ['tue', 'fri'],
      time_of_day: ['evening'],
    });
    expect(pickActivity(picks.find(p => p.id === 'make_your_bed')!).minimum).toEqual({ hours: 5 / 60, per: 'day' });
  });
});
```

`custom_components/planavista/frontend/test/setup-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { previewColumns, previewTotal } from '../src/modules/chores/setup/setup-derive';
import { MEMBERS, board, column, item } from './chores-fixtures';

describe('the board as setup shows it', () => {
  const sample = board({
    alex: column([item('kitchen_cleanup|alex|day:2026-10-13|0', { name: 'Kitchen cleanup' })]),
    blair: column([item('laundry|blair|week:2026-10-12|0', { name: 'Laundry', section: 'week' })]),
    casey: column([]),
    dana: column([]),
  });

  it('lists each person\'s chores today and this week', () => {
    const columns = previewColumns(MEMBERS, sample);
    expect(columns.map(c => [c.member.id, c.today, c.week, c.summary])).toEqual([
      ['alex', ['Kitchen cleanup'], [], '0 of 1 today'],
      ['blair', [], ['Laundry'], '1 this week'],
      ['casey', [], [], 'Nothing yet'],
      ['dana', [], [], 'Nothing yet'],
    ]);
  });

  it('adds what the parent just picked, before it is saved', () => {
    const columns = previewColumns(MEMBERS, null, [
      { member: 'casey', name: 'Take out the trash', week: false },
      { member: 'casey', name: 'Clean the bathroom', week: true },
    ]);
    expect(columns[2]).toMatchObject({ today: ['Take out the trash'], week: ['Clean the bathroom'], summary: '0 of 1 today' });
    expect(previewTotal(columns, null)).toBe('0 of 1 chore done today');
    expect(previewTotal(previewColumns(MEMBERS, sample, [{ member: 'dana', name: 'Tidy toys', week: false }]), sample)).toBe(
      '0 of 2 chores done today',
    );
  });
});
```

- [ ] **Step 2: Run them.** `bash scripts/test-backend.sh tests/test_chores_setup.py -q` Expected: FAIL: `planavista/household/setup/save` refuses `start`. `npx vitest run test/setup-flow.test.ts test/starter-chores.test.ts test/setup-derive.test.ts` Expected: FAIL: each file can't load the module it imports.

- [ ] **Step 3: Save how setup started.**

`custom_components/planavista/household/websocket.py`:

```diff
diff --git a/custom_components/planavista/household/websocket.py b/custom_components/planavista/household/websocket.py
index 76fe34f..dfd38d7 100644
--- a/custom_components/planavista/household/websocket.py
+++ b/custom_components/planavista/household/websocket.py
@@ -75,6 +75,8 @@ ERROR_MESSAGES = {
     "invalid_notify": "Requests and reminders are on or off.",
 }
 
+SETUP_STARTS = ("restore", "plan", "common", "empty", "calendar")
+
 MEMBER_FIELDS = vol.Schema(
     {
         vol.Optional("name"): str,
@@ -469,6 +471,8 @@ async def ws_settings_save(
         vol.Required("type"): "planavista/household/setup/save",
         vol.Optional("step"): vol.Any(None, str),
         vol.Optional("completed"): bool,
+        # How the household started (spec 14.7): restoring a file, a plan, common chores, empty, or just the calendar.
+        vol.Optional("start"): vol.Any(None, vol.In(SETUP_STARTS)),
         vol.Optional("session"): str,
     }
 )
@@ -481,7 +485,7 @@ async def ws_setup_save(
     if context is None:
         return
     household, _by = context
-    for key in ("step", "completed"):
+    for key in ("step", "completed", "start"):
         if key in msg:
             household.data["setup"][key] = msg[key]
     await household.async_save()
```

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index f11b1b5..617f0f1 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -44,7 +44,8 @@ export interface HouseholdView {
   account: AccountView;
   security: { shuffle_keypad: boolean; shared_screens: number };
   modules: Record<string, unknown>;
-  setup: { completed: boolean; step: string | null };
+  /** Where setup stands; `start` is how the household started (restore, plan, common, empty, calendar). */
+  setup: { completed: boolean; step: string | null; start?: string | null };
 }
 
 /** What a person's phones get (spec 7.2): Waiting for OK requests (parents) and evening reminders. */
```

`custom_components/planavista/frontend/src/core/household-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household-client.ts b/custom_components/planavista/frontend/src/core/household-client.ts
index 97dc75b..4e10faf 100644
--- a/custom_components/planavista/frontend/src/core/household-client.ts
+++ b/custom_components/planavista/frontend/src/core/household-client.ts
@@ -60,7 +60,7 @@ export class HouseholdApi extends WsApi {
     return this.call('planavista/household/settings/save', settings);
   }
 
-  saveSetup(progress: { step?: string | null; completed?: boolean }): Promise<void> {
+  saveSetup(progress: { step?: string | null; completed?: boolean; start?: string | null }): Promise<void> {
     return this.call('planavista/household/setup/save', progress);
   }
 
```

- [ ] **Step 4: Teach the setup host the new step hooks.**

`custom_components/planavista/frontend/src/core/settings-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/settings-registry.ts b/custom_components/planavista/frontend/src/core/settings-registry.ts
index 82be294..e4ea87e 100644
--- a/custom_components/planavista/frontend/src/core/settings-registry.ts
+++ b/custom_components/planavista/frontend/src/core/settings-registry.ts
@@ -65,8 +65,32 @@ export interface SetupStep extends WizardPage<SetupContext> {
   heading: string;
   /** A short line under the heading. */
   lead?: string;
-  /** The main button's label; Next (or Finish on the last step) when left out. */
+  /** The main button's label; Next (or Finish on the last step) when left out. The step element may change it. */
   primary?: string;
+  /** A second way on under the main button, such as "Not now, just the calendar"; the element's secondary() runs it. */
+  secondary?: string;
+  /** Skip at the top right: on to the next step without the step's commit. */
+  skip?: boolean;
+  /** A wider column (a step with a board preview beside its choices). */
+  wide?: boolean;
+}
+
+/** A step asks its host to draw again (its button's label or readiness changed). */
+export const STEP_CHANGE = 'pv-step-change';
+
+/** How a step changes what the steps after it see, before the household's next update arrives. */
+export interface SetupPatch {
+  setup?: Record<string, unknown>;
+  modules?: Record<string, Record<string, unknown>>;
+}
+
+/** Something a module adds to setup's last step (spec 14.7: a preview of the board, two tips). */
+export interface DonePart extends WizardPage<SetupContext> {
+  tag: string;
+  /** The main button's label while this part shows, such as "Open the board". */
+  primary?: string;
+  /** The module the card opens when setup finishes. */
+  module?: string;
 }
 
 /** Where setup starts: the saved step while it still applies, else the first. */
@@ -96,5 +120,8 @@ export const settingsRegistry = new PageRegistry<SettingsContext, SettingsPage>(
 /** Parts of the person page that modules contribute. */
 export const personSections = new PageRegistry<SettingsContext, PersonSection>();
 
+/** Parts of setup's last step that modules contribute. */
+export const doneParts = new PageRegistry<SetupContext, DonePart>();
+
 /** First-run setup steps that the shell and modules contribute. */
 export const setupRegistry = new PageRegistry<SetupContext, SetupStep>();
```

`custom_components/planavista/frontend/src/core/setup-flow.ts` (new):

```ts
import type { HouseholdView } from './household';
import type { SetupPatch } from './settings-registry';

/**
 * How first-run setup moves (spec 14.7). A step can change which steps
 * follow it (choosing common chores brings their step in), and the
 * household's own update arrives a moment later, so the host lays what
 * steps just changed over the household until it does.
 */

/** Two patches as one, the later one winning. */
export function mergePatch(earlier: SetupPatch, later: SetupPatch | undefined): SetupPatch {
  if (!later) return earlier;
  const modules: Record<string, Record<string, unknown>> = { ...(earlier.modules ?? {}) };
  for (const [id, changes] of Object.entries(later.modules ?? {})) modules[id] = { ...(modules[id] ?? {}), ...changes };
  return { setup: { ...(earlier.setup ?? {}), ...(later.setup ?? {}) }, modules };
}

/** The household as the steps should see it, with a patch laid over it. */
export function withPatch(view: HouseholdView | null, patch: SetupPatch): HouseholdView | null {
  if (!view || (!patch.setup && !patch.modules)) return view;
  const modules: Record<string, unknown> = { ...view.modules };
  for (const [id, changes] of Object.entries(patch.modules ?? {})) {
    modules[id] = { ...((modules[id] as Record<string, unknown> | undefined) ?? {}), ...changes };
  }
  return { ...view, setup: { ...view.setup, ...(patch.setup ?? {}) }, modules };
}

/** Where to go after the step `current`: the next one's index, or null past the last (setup is finished). */
export function stepAfter(steps: Array<{ id: string }>, current: string | undefined): number | null {
  const at = Math.max(0, steps.findIndex(step => step.id === current));
  return at >= steps.length - 1 ? null : at + 1;
}
```

`custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
index cdb8fc8..8c80d51 100644
--- a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
@@ -8,18 +8,32 @@ import { baseStyles, buttonStyles } from '../../styles/shared';
 import type { HouseholdView } from '../../core/household';
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
+import type { ModuleService } from '../../core/module-registry';
 import { saveErrorMessage } from '../../core/page-host';
-import { SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
+import { STEP_CHANGE, SetupContext, SetupPatch, SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
+import { mergePatch, stepAfter, withPatch } from '../../core/setup-flow';
 import type { PlanaVistaData } from '../../types';
 import './welcome-step';
 import './people-step';
 import './look-step';
 import './done-step';
 
+/** What a step element may offer its host; every part is optional. */
 interface StepElement extends HTMLElement {
   commit?: () => Promise<boolean>;
+  /** The main button's label now ("Add 8 chores"), instead of the step's. */
+  primaryLabel?: string;
+  /** False keeps the main button off (nothing picked yet, an age group missing). */
+  ready?: boolean;
+  /** The step's second way on; true goes on to the next step. */
+  secondary?: () => Promise<boolean>;
+  /** What the step just changed, for the steps after it, until the household's update arrives. */
+  setupPatch?: SetupPatch;
+  /** The module the card opens when setup finishes. */
+  openModule?: string;
 }
 
+
 const TOAST_MS = 4000;
 
 /**
@@ -38,18 +52,34 @@ export class PvSetup extends LitElement {
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
   /** Edits the card keeps while steps come and go (the appearance changes, spec 14.7). */
   @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
+  /** The card's module services (chores steps read the chores feed and call its commands). */
+  @property({ attribute: false }) services: Record<string, ModuleService> = {};
+  @property({ type: Number }) revision = 0;
 
   @state() private _index = 0;
   @state() private _busy = false;
   @state() private _toast = '';
+  /** What steps changed that the household doesn't show yet (how it started, chores on). */
+  @state() private _patch: SetupPatch = {};
   private _started = false;
   private _toastTimer: number | undefined;
 
+  connectedCallback(): void {
+    super.connectedCallback();
+    this.addEventListener(STEP_CHANGE, this._onStepChange);
+  }
+
   disconnectedCallback(): void {
     super.disconnectedCallback();
+    this.removeEventListener(STEP_CHANGE, this._onStepChange);
     window.clearTimeout(this._toastTimer);
   }
 
+  private _onStepChange = (event: Event): void => {
+    event.stopPropagation();
+    this.requestUpdate();
+  };
+
   protected willUpdate(): void {
     if (!this._started && this.data) {
       this._index = resumeIndex(this._steps(), this.household?.setup.step ?? null);
@@ -140,6 +170,37 @@ export class PvSetup extends LitElement {
         font-size: 1.0625rem;
       }
 
+      .column.wide {
+        max-width: 1040px;
+      }
+
+      .bottom {
+        flex-direction: column;
+        align-items: center;
+        gap: 4px;
+      }
+
+      .second {
+        min-height: 44px;
+        border: none;
+        background: transparent;
+        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
+        font: inherit;
+        font-weight: 600;
+        cursor: pointer;
+      }
+
+      .skip {
+        justify-self: end;
+        min-height: 48px;
+        padding: 0 8px;
+        border: none;
+        background: transparent;
+        color: var(--pv-text-secondary, #6B7280);
+        font: inherit;
+        cursor: pointer;
+      }
+
       .toast {
         position: absolute;
         left: 16px;
@@ -176,8 +237,21 @@ export class PvSetup extends LitElement {
     `,
   ];
 
+  /** The household as steps see it: with what earlier steps just changed. */
+  private _context(): SetupContext {
+    return { household: withPatch(this.household, this._patch), data: this.data, services: this.services };
+  }
+
   private _steps(): SetupStep[] {
-    return setupRegistry.pages({ household: this.household, data: this.data });
+    return setupRegistry.pages(this._context());
+  }
+
+  private get _element(): StepElement | null {
+    return this.renderRoot?.querySelector<StepElement>('.step-el') ?? null;
+  }
+
+  private _take(element: StepElement | null): void {
+    if (element?.setupPatch) this._patch = mergePatch(this._patch, element.setupPatch);
   }
 
   render() {
@@ -187,6 +261,10 @@ export class PvSetup extends LitElement {
     const step = steps[index];
     const last = index === steps.length - 1;
     const tag = unsafeStatic(step.tag);
+    const element = this._element;
+    const label = element?.primaryLabel ?? step.primary ?? (last ? 'Finish' : 'Next');
+    const ready = element?.ready !== false;
+    const context = this._context();
     return html`
       <div class="top">
         <button class="back ${index === 0 ? 'hidden' : ''}" type="button"
@@ -196,10 +274,10 @@ export class PvSetup extends LitElement {
         <div class="progress-dots" role="img" aria-label="Step ${index + 1} of ${steps.length}">
           ${steps.map((_, i) => html`<div class="dot ${i === index ? 'dot--active' : ''}"></div>`)}
         </div>
-        <span></span>
+        ${step.skip ? html`<button class="skip" type="button" ?disabled=${this._busy} @click=${this._skip}>Skip</button>` : html`<span></span>`}
       </div>
       <div class="content">
-        <div class="column">
+        <div class="column ${step.wide ? 'wide' : ''}">
           <h1 class="heading">${step.heading}</h1>
           ${step.lead ? html`<p class="lead">${step.lead}</p>` : nothing}
           ${keyed(step.id, staticHtml`
@@ -207,43 +285,96 @@ export class PvSetup extends LitElement {
               class="step-el"
               .hass=${this.hass}
               .data=${this.data}
-              .household=${this.household}
+              .household=${context.household}
               .api=${this.api}
               .layout=${this.layout}
               .drafts=${this.drafts}
+              .services=${this.services}
+              .revision=${this.revision}
               mode="setup"
             ></${tag}>
           `)}
         </div>
       </div>
       <div class="bottom">
-        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy} @click=${this._next}>
-          ${step.primary ?? (last ? 'Finish' : 'Next')}
+        <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy || !ready} @click=${this._next}>
+          ${label}
         </button>
+        ${step.secondary ? html`
+          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${step.secondary}</button>
+        ` : nothing}
       </div>
       ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
     `;
   }
 
+  protected updated(): void {
+    // A step's label and readiness live on its element, which exists only after the first render.
+    const element = this._element;
+    if (element && !(element as unknown as { _hostSeen?: boolean })._hostSeen) {
+      (element as unknown as { _hostSeen?: boolean })._hostSeen = true;
+      if (element.primaryLabel !== undefined || element.ready !== undefined) this.requestUpdate();
+    }
+  }
+
+  /** The step on screen now. */
+  private _currentId(): string | undefined {
+    const steps = this._steps();
+    return steps[Math.min(this._index, steps.length - 1)]?.id;
+  }
+
   private _next = async (): Promise<void> => {
     if (this._busy) return;
-    const element = this.renderRoot.querySelector<StepElement>('.step-el');
+    const element = this._element;
+    const current = this._currentId();
     this._busy = true;
     try {
       const ok = element?.commit ? await element.commit() : true;
       if (!ok) return;
-      const steps = this._steps();
-      if (this._index >= steps.length - 1) {
-        this.dispatchEvent(new CustomEvent('onboarding-complete', { bubbles: true, composed: true }));
-        return;
-      }
-      this._index += 1;
-      this._remember(steps[this._index].id);
+      this._take(element);
+      this._advance(element, current);
+    } finally {
+      this._busy = false;
+    }
+  };
+
+  /**
+   * On to the step after `current`, as the steps stand after what it changed
+   * (choosing common chores brings their step in); past the last, setup is finished.
+   */
+  private _advance(element: StepElement | null, current: string | undefined): void {
+    const steps = this._steps();
+    const next = stepAfter(steps, current);
+    if (next === null) {
+      this.dispatchEvent(new CustomEvent('onboarding-complete', {
+        detail: { module: element?.openModule }, bubbles: true, composed: true,
+      }));
+      return;
+    }
+    this._index = next;
+    this._remember(steps[next].id);
+  }
+
+  private _secondary = async (): Promise<void> => {
+    if (this._busy) return;
+    const element = this._element;
+    const current = this._currentId();
+    this._busy = true;
+    try {
+      const go = element?.secondary ? await element.secondary() : true;
+      if (!go) return;
+      this._take(element);
+      this._advance(element, current);
     } finally {
       this._busy = false;
     }
   };
 
+  private _skip = (): void => {
+    if (this._busy) return;
+    this._advance(this._element, this._currentId());
+  };
+
   private _back = (): void => {
     if (this._index === 0 || this._busy) return;
     this._index -= 1;
```

`custom_components/planavista/frontend/src/shell/setup/welcome-step.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/welcome-step.ts b/custom_components/planavista/frontend/src/shell/setup/welcome-step.ts
index 97558f4..a003103 100644
--- a/custom_components/planavista/frontend/src/shell/setup/welcome-step.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/welcome-step.ts
@@ -1,11 +1,47 @@
 import { LitElement, html, css, svg } from 'lit';
+import { property } from 'lit/decorators.js';
 import { defineElement } from '../../utils/define';
+import type { HouseholdView } from '../../core/household';
+import type { HouseholdApi } from '../../core/household-client';
+import type { SetupPatch } from '../../core/settings-registry';
 
 /** Four people's rings, three quarters closed: a hint of what's coming. */
 const RING_COLORS = ['#F94144', '#277DA1', '#43AA8B', '#F9C74F'];
 
-/** pv-setup-welcome: the first step (spec 14.7); the host shows its heading and lead. */
+const FEATURES: Array<[string, string, string]> = [
+  ['👥', 'Everyone who lives here', 'Each person gets a color, even kids without a Home Assistant account.'],
+  ['📅', 'Your calendars', 'Each one belongs to someone, so the day reads at a glance.'],
+  ['✓', 'Chores, if you want them', 'From your household plan, or a few common ones.'],
+];
+
+/**
+ * pv-setup-welcome: the first step (spec 14.7); the host shows its heading
+ * and lead. Its second way on, Restore from a PlanaVista file, brings a
+ * household back in one step (the restore step that follows).
+ */
 export class PvSetupWelcome extends LitElement {
+  @property({ attribute: false }) api!: HouseholdApi;
+  @property({ attribute: false }) household: HouseholdView | null = null;
+
+  /** For the host: the restore step applies from now on. */
+  setupPatch?: SetupPatch;
+
+  /** Restore from a PlanaVista file. */
+  async secondary(): Promise<boolean> {
+    await this.api.saveSetup({ start: 'restore' });
+    this.setupPatch = { setup: { start: 'restore' } };
+    return true;
+  }
+
+  /** Set up: an earlier choice to restore (and Back to here) is forgotten. */
+  async commit(): Promise<boolean> {
+    if (this.household?.setup.start === 'restore') {
+      await this.api.saveSetup({ start: null });
+      this.setupPatch = { setup: { start: null } };
+    }
+    return true;
+  }
+
   static styles = css`
     :host {
       display: block;
@@ -15,12 +51,54 @@ export class PvSetupWelcome extends LitElement {
       display: flex;
       justify-content: center;
       gap: 18px;
-      margin: 24px 0 8px;
+      margin: 8px 0 20px;
     }
 
     svg {
       transform: rotate(-90deg);
     }
+
+    ul {
+      list-style: none;
+      margin: 0 0 18px;
+      padding: 0;
+      display: grid;
+      gap: 14px;
+    }
+
+    li {
+      display: flex;
+      gap: 14px;
+      align-items: flex-start;
+    }
+
+    .icon {
+      flex-shrink: 0;
+      width: 40px;
+      height: 40px;
+      display: grid;
+      place-items: center;
+      border-radius: 12px;
+      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
+      font-size: 1.125rem;
+    }
+
+    .title {
+      display: block;
+      font-weight: 600;
+    }
+
+    .text {
+      font-size: 0.9375rem;
+      color: var(--pv-text-secondary, #6B7280);
+    }
+
+    .note {
+      margin: 0;
+      font-size: 0.875rem;
+      color: var(--pv-text-secondary, #6B7280);
+      text-align: center;
+    }
   `;
 
   render() {
@@ -39,6 +117,12 @@ export class PvSetupWelcome extends LitElement {
           </svg>
         `)}
       </div>
+      <ul>
+        ${FEATURES.map(([icon, title, text]) => html`
+          <li><span class="icon" aria-hidden="true">${icon}</span><span><span class="title">${title}</span><span class="text">${text}</span></span></li>
+        `)}
+      </ul>
+      <p class="note">About 5 minutes. Everything can change later in Settings.</p>
     `;
   }
 }
```

`custom_components/planavista/frontend/src/shell/setup/done-step.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/done-step.ts b/custom_components/planavista/frontend/src/shell/setup/done-step.ts
index 9dd4a6b..b7af416 100644
--- a/custom_components/planavista/frontend/src/shell/setup/done-step.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/done-step.ts
@@ -1,18 +1,23 @@
 import { LitElement, html, css, nothing } from 'lit';
 import { property, state } from 'lit/decorators.js';
+import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
 import type { HomeAssistant } from 'custom-card-helpers';
 import { defineElement } from '../../utils/define';
 import { baseStyles } from '../../styles/shared';
 import type { HouseholdView } from '../../core/household';
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
+import type { ModuleService } from '../../core/module-registry';
 import { saveErrorMessage } from '../../core/page-host';
+import { DonePart, doneParts } from '../../core/settings-registry';
 import { LocaleLike, setupDisplayDefaults } from '../../core/setup-defaults';
 import type { PlanaVistaData } from '../../types';
 
 /**
- * pv-setup-done: You're all set (spec 14.7). Opening the calendar saves the
- * calendar options a new household starts with and marks setup finished.
+ * pv-setup-done: You're all set (spec 14.7). Finishing saves the calendar
+ * options a new household starts with and marks setup finished. Modules add
+ * their own parts (Chores: a preview of the board and two tips), and the
+ * first one's button label and module are what Finish says and opens.
  */
 export class PvSetupDone extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -21,10 +26,26 @@ export class PvSetupDone extends LitElement {
   @property({ attribute: false }) api!: HouseholdApi;
   @property({ type: String }) layout: Layout = 'landscape';
   @property({ type: String }) mode: 'settings' | 'setup' = 'setup';
+  @property({ attribute: false }) services: Record<string, ModuleService> = {};
+  @property({ type: Number }) revision = 0;
 
   @state() private _message = '';
 
-  /** Open the calendar: save the starting calendar options and finish setup. */
+  private _parts(): DonePart[] {
+    return doneParts.pages({ household: this.household, data: this.data, services: this.services });
+  }
+
+  /** The host's main button: what the first part says ("Open the board"), else the step's own label. */
+  get primaryLabel(): string | undefined {
+    return this._parts()[0]?.primary;
+  }
+
+  /** The module the card opens when setup finishes. */
+  get openModule(): string | undefined {
+    return this._parts()[0]?.module;
+  }
+
+  /** Finish: save the starting calendar options and mark setup finished. */
   async commit(): Promise<boolean> {
     this._message = '';
     try {
@@ -68,11 +89,18 @@ export class PvSetupDone extends LitElement {
   ];
 
   render() {
+    const parts = this._parts();
     return html`
-      <ul>
-        <li>Tap the gear to change anything later.</li>
-        <li>On a shared screen, Settings asks for a parent's PIN.</li>
-      </ul>
+      ${parts.length ? parts.map(part => {
+        const tag = unsafeStatic(part.tag);
+        return staticHtml`<${tag} .hass=${this.hass} .household=${this.household} .services=${this.services}
+          .revision=${this.revision} .layout=${this.layout}></${tag}>`;
+      }) : html`
+        <ul>
+          <li>Tap the gear to change anything later.</li>
+          <li>On a shared screen, Settings asks for a parent's PIN.</li>
+        </ul>
+      `}
       ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
     `;
   }
```

`custom_components/planavista/frontend/src/shell/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/definition.ts b/custom_components/planavista/frontend/src/shell/definition.ts
index 9ecaf95..beb5ff3 100644
--- a/custom_components/planavista/frontend/src/shell/definition.ts
+++ b/custom_components/planavista/frontend/src/shell/definition.ts
@@ -67,8 +67,9 @@ export const shellSetupSteps: SetupStep[] = [
     order: 0,
     tag: 'pv-setup-welcome',
     heading: 'Welcome to PlanaVista',
-    lead: 'About 5 minutes. Everything can change later in Settings.',
+    lead: "Your family's calendar and chores, together on one screen.",
     primary: 'Set up',
+    secondary: 'Restore from a PlanaVista file',
   },
   {
     id: 'people',
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 100ae3e..4f0a0c8 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -396,9 +396,12 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     this._guardSettings();
   }
 
-  private _onOnboardingComplete() {
+  private _onOnboardingComplete(event?: CustomEvent<{ module?: string }>) {
     this._wizardOpen = false;
     this._onboardingDone = true;
+    // Setup's last step can open a module (Open the board).
+    const module = event?.detail?.module;
+    if (module) this._moduleId = module;
   }
 
   /** What the gear may do for this account; until the household answers, admins only, as in 1.1.0. */
@@ -600,6 +603,8 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .api=${this._api}
               .layout=${this._layout.layout}
               .drafts=${this._drafts}
+              .services=${this._services}
+              .revision=${this._serviceRevision}
               @onboarding-complete=${this._onOnboardingComplete}
             ></pv-setup>
           ` : this._renderSetupCard()}
```

- [ ] **Step 5: Write the chores steps.**

`custom_components/planavista/frontend/src/modules/chores/setup/starter-chores.ts` (new):

```ts
import { Member, inOrder } from '../../../core/household';
import type { Activity, Band } from '../chores-types';
import { durationText } from '../settings/chores-list-derive';

/** Who a starter chore suits (spec 14.7's table). */
export type Suits = 'young_child' | 'kid' | 'teen' | 'adult';

export interface Starter {
  id: string;
  name: string;
  icon: string;
  category: string;
  /** daily, or weekly (on `days` when it has them). */
  rhythm: 'daily' | 'weekly';
  days: string[];
  /** About how long each time. */
  minutes: number;
  band: Band | null;
  suits: Suits;
  /** Picked to start with when someone it suits lives here (the approved setup screen picks eight). */
  picked: boolean;
}

/** The common chores starter list (spec 14.7). */
export const STARTERS: Starter[] = [
  { id: 'make_your_bed', name: 'Make your bed', icon: '🛏️', category: 'personal', rhythm: 'daily', days: [], minutes: 5, band: 'morning', suits: 'young_child', picked: true },
  { id: 'set_the_table', name: 'Set the table', icon: '🍴', category: 'kitchen', rhythm: 'daily', days: [], minutes: 10, band: 'evening', suits: 'young_child', picked: true },
  { id: 'tidy_toys', name: 'Tidy toys', icon: '🧸', category: 'cleaning', rhythm: 'daily', days: [], minutes: 15, band: 'evening', suits: 'young_child', picked: true },
  { id: 'unload_the_dishwasher', name: 'Unload the dishwasher', icon: '🍽️', category: 'kitchen', rhythm: 'daily', days: [], minutes: 10, band: 'morning', suits: 'kid', picked: true },
  { id: 'take_out_the_trash', name: 'Take out the trash', icon: '🗑️', category: 'home', rhythm: 'weekly', days: ['tue', 'fri'], minutes: 10, band: 'evening', suits: 'kid', picked: true },
  { id: 'feed_the_pet', name: 'Feed the pet', icon: '🐾', category: 'home', rhythm: 'daily', days: [], minutes: 5, band: 'morning', suits: 'kid', picked: false },
  { id: 'laundry', name: 'Laundry', icon: '🧺', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 120, band: null, suits: 'adult', picked: true },
  { id: 'kitchen_cleanup', name: 'Kitchen cleanup', icon: '🧽', category: 'kitchen', rhythm: 'daily', days: [], minutes: 30, band: 'evening', suits: 'adult', picked: true },
  { id: 'vacuum', name: 'Vacuum', icon: '🧹', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'adult', picked: false },
  { id: 'clean_the_bathroom', name: 'Clean the bathroom', icon: '🛁', category: 'cleaning', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'teen', picked: true },
  { id: 'yard_work', name: 'Yard work', icon: '🌿', category: 'home', rhythm: 'weekly', days: [], minutes: 60, band: null, suits: 'teen', picked: false },
  { id: 'groceries', name: 'Groceries', icon: '🛒', category: 'home', rhythm: 'weekly', days: [], minutes: 90, band: null, suits: 'adult', picked: false },
];

/** A starter as the parent set it up: who does it, how often, and about how long. */
export interface Pick {
  id: string;
  member: string | null;
  rhythm: 'daily' | 'weekly';
  days: string[];
  minutes: number;
  on: boolean;
}

function fits(member: Member, suits: Suits): boolean {
  if (suits === 'young_child') return member.age_group === 'young_child';
  if (suits === 'kid') return member.age_group === 'older_child' || member.age_group === 'teen';
  if (suits === 'teen') return member.age_group === 'teen' || member.age_group === 'older_child';
  return member.age_group === 'adult';
}

/**
 * Who each starter goes to (spec 14.7: suggested by age group, so young
 * children get quick, simple ones): the first person it suits, sharing the
 * grown-ups' chores out in turn. A chore nobody suits starts unpicked, with
 * no one, until the parent picks someone.
 */
export function suggestPicks(members: Member[]): Pick[] {
  const people = inOrder(members);
  const turns = new Map<Suits, number>();
  return STARTERS.map(starter => {
    const suited = people.filter(m => fits(m, starter.suits));
    const turn = turns.get(starter.suits) ?? 0;
    turns.set(starter.suits, turn + 1);
    const member = suited.length ? suited[turn % suited.length].id : null;
    return { id: starter.id, member, rhythm: starter.rhythm, days: starter.days, minutes: starter.minutes, on: starter.picked && member !== null };
  });
}

export function starterOf(id: string): Starter {
  return STARTERS.find(s => s.id === id)!;
}

/** A tile's line: "Daily · 5 min", "Tue, Fri · 10 min", "Weekly · 2 h". */
export function pickLine(pick: Pick): string {
  const names: Record<string, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const when = pick.rhythm === 'daily' ? 'Daily' : pick.days.length ? pick.days.map(d => names[d]).join(', ') : 'Weekly';
  return `${when} · ${durationText(pick.minutes)}`;
}

/** The main button: "Add 8 chores". */
export function addLabel(picks: Pick[]): string {
  const n = picks.filter(p => p.on && p.member).length;
  return n === 0 ? 'Add chores' : `Add ${n} ${n === 1 ? 'chore' : 'chores'}`;
}

/** Each pick as a normal Plan chore (spec 14.7: each pick becomes a normal chore). */
export function pickActivity(pick: Pick): Partial<Activity> {
  const starter = starterOf(pick.id);
  const each = pick.rhythm === 'weekly' && pick.days.length ? pick.days.length : 1;
  return {
    name: starter.name,
    icon: starter.icon,
    category: starter.category,
    schedule: 'plan',
    assignees: pick.member ? [pick.member] : [],
    on_board: true,
    needs_ok: false,
    stars: null,
    minimum: { hours: (pick.minutes * each) / 60, per: pick.rhythm === 'daily' ? 'day' : 'week' },
    split: 'each',
    times: 1,
    days: pick.rhythm === 'weekly' ? pick.days : [],
    time_of_day: starter.band ? [starter.band] : [],
  };
}
```

`custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts` (new):

```ts
import { Member, inOrder } from '../../../core/household';
import type { Board } from '../chores-types';

/** A chore that isn't saved yet, shown in the preview as the parent picks it. */
export interface PreviewPick {
  member: string;
  name: string;
  /** Floats in This week instead of today. */
  week: boolean;
}

export interface PreviewColumn {
  member: Member;
  today: string[];
  week: string[];
  /** "0 of 3 today", "1 this week", or "Nothing yet". */
  summary: string;
}

/**
 * The board as setup shows it (spec 14.7): each person's chores today and
 * this week, from the board and the picks not saved yet.
 */
export function previewColumns(members: Member[], board: Board | null, picks: PreviewPick[] = []): PreviewColumn[] {
  return inOrder(members).map(member => {
    const items = board?.members[member.id]?.items ?? [];
    const today = items.filter(i => i.section !== 'week').map(i => i.name);
    const week = items.filter(i => i.section === 'week').map(i => i.name);
    for (const pick of picks.filter(p => p.member === member.id)) {
      const list = pick.week ? week : today;
      if (!list.includes(pick.name)) list.push(pick.name);
    }
    const done = board?.members[member.id]?.today.done ?? 0;
    const summary = today.length ? `${done} of ${today.length} today` : week.length ? `${week.length} this week` : 'Nothing yet';
    return { member, today, week, summary };
  });
}

/** The landscape header over the preview: "0 of 6 chores done today". */
export function previewTotal(columns: PreviewColumn[], board: Board | null): string {
  const due = columns.reduce((sum, c) => sum + c.today.length, 0);
  const done = board?.household.done ?? 0;
  return `${Math.min(done, due)} of ${due} ${due === 1 ? 'chore' : 'chores'} done today`;
}
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-board-preview.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import type { ChoresService } from '../chores-service';
import { PreviewPick, previewColumns } from './setup-derive';
import '../../../core/pv-member-avatar';

/**
 * pv-setup-board-preview: the board as setup shows it (spec 14.7): each
 * person's column with today's chores and This week, filling in as the
 * parent picks. Read only.
 */
export class PvSetupBoardPreview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ attribute: false }) picks: PreviewPick[] = [];

  static styles = css`
    :host {
      display: block;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .column {
      padding: 10px 12px;
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    }

    .who {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .name {
      font-weight: 700;
    }

    .summary {
      font-size: 0.75rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 4px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
    }

    li::before {
      content: '';
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
    }

    .week {
      margin: 8px 0 4px;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--pv-text-secondary, #6B7280);
    }
  `;

  render() {
    const board = (this.services?.chores as ChoresService | undefined)?.board() ?? null;
    const columns = previewColumns(this.household?.members ?? [], board, this.picks);
    if (!columns.length) return nothing;
    return html`
      <div class="columns">
        ${columns.map(column => html`
          <section class="column" aria-label=${column.member.name}>
            <div class="who">
              <pv-member-avatar .member=${column.member} .hass=${this.hass} size="28"></pv-member-avatar>
              <span><span class="name">${column.member.name}</span><br /><span class="summary">${column.summary}</span></span>
            </div>
            ${column.today.length ? html`<ul>${column.today.map(name => html`<li>${name}</li>`)}</ul>` : nothing}
            ${column.week.length ? html`
              <div class="week">This week</div>
              <ul>${column.week.map(name => html`<li>${name}</li>`)}</ul>
            ` : nothing}
          </section>
        `)}
      </div>
    `;
  }
}

defineElement('pv-setup-board-preview', PvSetupBoardPreview);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-chores-choice.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { ModuleService } from '../../../core/module-registry';
import type { SetupPatch } from '../../../core/settings-registry';
import { errorMessage } from '../../../core/ws-api';
import type { ChoresService } from '../chores-service';

type Start = 'plan' | 'common' | 'empty';

const CHOICES: Array<{ id: Start; icon: string; title: string; text: string }> = [
  { id: 'plan', icon: '📋', title: 'Start from our household plan', text: "Import a Household Hours plan. You see everything before it's saved." },
  { id: 'common', icon: '✨', title: 'Start with some common chores', text: 'Pick from a short list. Each comes with a time and who it suits.' },
  { id: 'empty', icon: '✏️', title: 'Start empty', text: "Add chores yourself when you're ready." },
];

/**
 * pv-setup-chores-choice: Do you want chores too? (spec 14.7). A plan, some
 * common chores, or empty turns chores on; Not now, just the calendar goes
 * straight to Look and leaves chores off.
 */
export class PvSetupChoresChoice extends LitElement {
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};

  @state() private _choice: Start = 'common';
  @state() private _message = '';
  private _read = false;
  setupPatch?: SetupPatch;

  protected willUpdate(): void {
    if (!this._read && this.household) {
      const saved = this.household.setup.start;
      if (saved === 'plan' || saved === 'common' || saved === 'empty') this._choice = saved;
      this._read = true;
    }
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _on(): boolean {
    return (this.household?.modules as { chores?: { enabled?: boolean } } | undefined)?.chores?.enabled === true;
  }

  /** Continue: chores on, and how they start. */
  async commit(): Promise<boolean> {
    this._message = '';
    try {
      if (!this._on) await this._chores?.api.enable(true);
      await this.api.saveSetup({ start: this._choice });
      this.setupPatch = { setup: { start: this._choice }, modules: { chores: { enabled: true } } };
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't turn chores on. Check the connection and try again.";
      return false;
    }
  }

  /** Not now, just the calendar: chores stay off (or go off again, keeping anything already made). */
  async secondary(): Promise<boolean> {
    this._message = '';
    try {
      if (this._on) await this._chores?.api.enable(false);
      await this.api.saveSetup({ start: 'calendar' });
      this.setupPatch = { setup: { start: 'calendar' }, modules: { chores: { enabled: false } } };
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
      return false;
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    .choices {
      display: grid;
      gap: 10px;
    }

    .choice {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .choice[aria-checked='true'] {
      border-color: var(--pv-accent, #6366F1);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
    }

    .icon {
      font-size: 1.5rem;
    }

    .text {
      flex: 1;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .sub {
      font-size: 0.875rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    .radio {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
      display: grid;
      place-items: center;
      color: var(--pv-on-accent, #FFFFFF);
      font-size: 0.75rem;
    }

    .choice[aria-checked='true'] .radio {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
    }

    .message {
      margin: 14px 0 0;
      color: var(--pv-danger, #DC2626);
    }
  `;

  render() {
    return html`
      <div class="choices" role="radiogroup" aria-label="How chores start">
        ${CHOICES.map(choice => html`
          <button class="choice" type="button" role="radio" aria-checked=${this._choice === choice.id ? 'true' : 'false'}
            @click=${() => { this._choice = choice.id; }}>
            <span class="icon" aria-hidden="true">${choice.icon}</span>
            <span class="text"><span class="title">${choice.title}</span><span class="sub">${choice.text}</span></span>
            <span class="radio" aria-hidden="true">${this._choice === choice.id ? '✓' : ''}</span>
          </button>
        `)}
      </div>
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-chores-choice', PvSetupChoresChoice);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-common-chores.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { errorMessage } from '../../../core/ws-api';
import type { ChoresService } from '../chores-service';
import { durationText } from '../settings/chores-list-derive';
import { STEP_CHANGE } from '../../../core/settings-registry';
import { Pick, addLabel, pickActivity, pickLine, starterOf, suggestPicks } from './starter-chores';
import { PreviewPick } from './setup-derive';
import './pv-setup-board-preview';
import '../../../core/pv-member-avatar';

const MINUTES = [5, 10, 15, 30, 60, 90, 120];

/**
 * pv-setup-common-chores: Pick some to start with (spec 14.7). Twelve
 * starter tiles, each with a person, how often, and about how long,
 * suggested by age group; tapping a picked tile changes those. In landscape
 * the board fills in beside the tiles as they're picked. Each pick becomes a
 * normal chore.
 */
export class PvSetupCommonChores extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  @state() private _picks: Pick[] = [];
  @state() private _editing: string | null = null;
  @state() private _message = '';
  private _built = false;

  protected willUpdate(): void {
    if (!this._built && this.household) {
      this._picks = suggestPicks(this.household.members);
      this._built = true;
    }
  }

  get primaryLabel(): string {
    return addLabel(this._picks);
  }

  get ready(): boolean {
    return this._picks.some(p => p.on && p.member);
  }

  private _changed(): void {
    this.dispatchEvent(new CustomEvent(STEP_CHANGE, { bubbles: true, composed: true }));
  }

  /** Add the picked chores. */
  async commit(): Promise<boolean> {
    const chores = this.services?.chores as ChoresService | undefined;
    if (!chores) return false;
    this._message = '';
    const picked = this._picks.filter(p => p.on && p.member);
    try {
      for (const pick of picked) await chores.api.saveActivity(pickActivity(pick));
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't add the chores. Check the connection and try again.";
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    css`
      :host {
        display: block;
      }

      .layout {
        display: grid;
        gap: 18px;
      }

      :host([layout='landscape']) .layout {
        grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .tile {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        padding: 14px 8px 10px;
        border-radius: 14px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
      }

      .tile[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 6%, var(--pv-card-bg, #FFFFFF));
      }

      .tile .check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.6875rem;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .emoji {
        font-size: 1.75rem;
      }

      .name {
        font-weight: 700;
        font-size: 0.875rem;
      }

      .line {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .editor {
        grid-column: 1 / -1;
        display: grid;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .chip {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, var(--pv-card-bg, #FFFFFF));
        font-weight: 600;
      }

      .hint {
        margin: 10px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .preview-head {
        margin: 0 0 8px;
        font-weight: 700;
      }

      .message {
        margin: 12px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  private _toggle(pick: Pick): void {
    if (!pick.member) {
      this._editing = pick.id;
      return;
    }
    if (pick.on && this._editing !== pick.id) {
      // Tapping a picked chore changes it (spec 14.7); its editor has Remove.
      this._editing = pick.id;
      return;
    }
    this._set(pick.id, { on: !pick.on });
    this._editing = null;
  }

  private _set(id: string, patch: Partial<Pick>): void {
    this._picks = this._picks.map(p => (p.id === id ? { ...p, ...patch } : p));
    this._changed();
  }

  render() {
    const members = inOrder(this.household?.members ?? []);
    const picks: PreviewPick[] = this._picks
      .filter(p => p.on && p.member)
      .map(p => ({ member: p.member!, name: starterOf(p.id).name, week: p.rhythm === 'weekly' && !p.days.length }));
    return html`
      <div class="layout">
        <div>
          <div class="tiles">
            ${this._picks.map(pick => {
              const starter = starterOf(pick.id);
              const who = members.find(m => m.id === pick.member);
              return html`
                <button class="tile" type="button" aria-pressed=${pick.on ? 'true' : 'false'} @click=${() => this._toggle(pick)}>
                  ${pick.on ? html`<span class="check" aria-hidden="true">✓</span>` : nothing}
                  <span class="emoji" aria-hidden="true">${starter.icon}</span>
                  <span class="name">${starter.name}</span>
                  <span class="line">${pickLine(pick)}</span>
                  ${who ? html`<pv-member-avatar .member=${who} .hass=${this.hass} size="22"></pv-member-avatar>` : html`<span class="line">Pick someone</span>`}
                </button>
                ${this._editing === pick.id ? this._renderEditor(pick) : nothing}
              `;
            })}
          </div>
          <p class="hint">Suggested by age, so young children get quick, simple ones.</p>
          ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
        </div>
        ${this.layout === 'landscape' ? html`
          <aside aria-label="Your board">
            <p class="preview-head">Your board fills in as you pick</p>
            <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
              .revision=${this.revision} .picks=${picks}></pv-setup-board-preview>
          </aside>
        ` : nothing}
      </div>
    `;
  }

  private _renderEditor(pick: Pick) {
    const members = inOrder(this.household?.members ?? []);
    const starter = starterOf(pick.id);
    return html`
      <div class="editor" role="group" aria-label="Change ${starter.name}">
        <span>Who</span>
        <div class="chips">
          ${members.map(m => html`
            <button class="chip" type="button" aria-pressed=${pick.member === m.id ? 'true' : 'false'}
              @click=${() => this._set(pick.id, { member: m.id, on: true })}>${m.name}</button>
          `)}
        </div>
        <span>How often</span>
        <div class="chips">
          <button class="chip" type="button" aria-pressed=${pick.rhythm === 'daily' ? 'true' : 'false'}
            @click=${() => this._set(pick.id, { rhythm: 'daily', days: [] })}>Every day</button>
          <button class="chip" type="button" aria-pressed=${pick.rhythm === 'weekly' ? 'true' : 'false'}
            @click=${() => this._set(pick.id, { rhythm: 'weekly', days: starter.rhythm === 'weekly' ? starter.days : [] })}>Every week</button>
        </div>
        <span>About how long${pick.rhythm === 'weekly' && pick.days.length ? ', each time' : ''}</span>
        <div class="chips">
          ${MINUTES.map(minutes => html`
            <button class="chip" type="button" aria-pressed=${pick.minutes === minutes ? 'true' : 'false'}
              @click=${() => this._set(pick.id, { minutes })}>${durationText(minutes)}</button>
          `)}
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          ${pick.on ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._set(pick.id, { on: false }); this._editing = null; }}>Remove</button>` : nothing}
          <button class="pv-btn pv-btn-primary" type="button" @click=${() => { this._editing = null; }}>Done</button>
        </div>
      </div>
    `;
  }
}

defineElement('pv-setup-common-chores', PvSetupCommonChores);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-file.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { STEP_CHANGE, SetupPatch } from '../../../core/settings-registry';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { ImportChoices, ImportPreview, emptyChoices, fileLine, importSummary, missingAges } from '../settings/import-derive';
import '../settings/pv-import-preview';

/**
 * pv-setup-file: setup's way in from a file (spec 14.7): Start from our
 * household plan (a Household Hours plan) or Restore from a PlanaVista file
 * (a rebuilt Home Assistant gets its household back in one step). Choose
 * the file or paste its text, see the same preview as in Settings, then the
 * main button imports.
 */
export class PvSetupFile extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String }) layout: Layout = 'landscape';

  @state() private _text = '';
  @state() private _name = '';
  @state() private _pasting = false;
  @state() private _preview: ImportPreview | null = null;
  @state() private _choices: ImportChoices = emptyChoices();
  @state() private _problems: string[] = [];
  @state() private _reading = false;
  setupPatch?: SetupPatch;

  private get _restoring(): boolean {
    return this.household?.setup.start === 'restore';
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  get primaryLabel(): string {
    return this._restoring ? 'Restore' : 'Import';
  }

  get ready(): boolean {
    return !!this._preview && missingAges(this._preview, this._choices).length === 0;
  }

  private _changed(): void {
    this.dispatchEvent(new CustomEvent(STEP_CHANGE, { bubbles: true, composed: true }));
  }

  /** Import (or restore) what the preview shows. */
  async commit(): Promise<boolean> {
    const chores = this._chores;
    if (!chores || !this._preview) return false;
    this._problems = [];
    try {
      const result = await chores.api.importApply(this._text, this._choices);
      if (result.problem) {
        this._problems = result.problem.problems.length ? result.problem.problems : [result.problem.message];
        return false;
      }
      // Importing chores turns them on (the steps after this one, such as the shared screen, apply now).
      this.setupPatch = { modules: { chores: { enabled: true } } };
      return true;
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't import. Check the connection and try again."];
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    css`
      :host {
        display: block;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 12px;
      }

      .actions button {
        min-height: 48px;
      }

      textarea {
        width: 100%;
        min-height: 140px;
        box-sizing: border-box;
        font-family: ui-monospace, monospace;
        font-size: 0.8125rem;
      }

      .file {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
        padding: 12px 14px;
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .file .text {
        flex: 1;
      }

      .file .sub {
        display: block;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .summary {
        margin: 16px 0 0;
        font-weight: 600;
      }

      .problems {
        margin: 12px 0;
        padding: 12px 16px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--pv-danger, #DC2626) 10%, transparent);
      }

      .problems ul {
        margin: 6px 0 0;
        padding-left: 18px;
      }

      input[type='file'] {
        display: none;
      }
    `,
  ];

  render() {
    return html`
      <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
      ${this._preview ? html`
        <div class="file">
          <span class="text"><strong>${this._name}</strong><span class="sub">${fileLine(this._preview)}</span></span>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._reset}>Choose another</button>
        </div>
      ` : html`
        <div class="actions">
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._reading} @click=${this._choose}>Choose a file</button>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._pasting = !this._pasting; }}>Paste text</button>
        </div>
        ${this._pasting ? html`
          <textarea class="pv-input" aria-label="The file's text" placeholder="Paste the file's text here"
            .value=${this._text} @input=${(e: Event) => { this._text = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <div class="actions" style="margin-top: 8px">
            <button class="pv-btn pv-btn-primary" type="button" ?disabled=${!this._text.trim() || this._reading}
              @click=${() => this._read(this._text, 'Pasted text')}>Review</button>
          </div>
        ` : nothing}
      `}
      ${this._problems.length ? html`
        <div class="problems" role="alert">
          <strong>${this._preview ? 'This file has problems, so nothing was imported.' : "Can't read this file"}</strong>
          <ul>${this._problems.map(p => html`<li>${p}</li>`)}</ul>
        </div>
      ` : nothing}
      ${this._preview ? html`
        <pv-import-preview .hass=${this.hass} .preview=${this._preview} .members=${inOrder(this.household?.members ?? [])}
          .choices=${this._choices} .layout=${this.layout} .timeFormat=${this.data?.display?.time_format ?? '12h'}
          @pv-import-choices=${(e: CustomEvent<ImportChoices>) => { this._choices = e.detail; this._changed(); }}></pv-import-preview>
        <p class="summary">${importSummary(this._preview, this._choices)} Nothing is deleted.</p>
      ` : nothing}
    `;
  }

  private _choose = (): void => {
    const input = this.renderRoot.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      input.value = '';
      input.click();
    }
  };

  private _reset = (): void => {
    this._preview = null;
    this._choices = emptyChoices();
    this._problems = [];
    this._changed();
  };

  private _onFile = async (event: Event): Promise<void> => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await this._read(await file.text(), file.name);
  };

  private async _read(text: string, name: string): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._reading = true;
    this._problems = [];
    try {
      const result = await chores.api.importPreview(text);
      if (result.problem) {
        const known = result.problem.code === 'unknown_file'
          ? `${name === 'Pasted text' ? 'This text' : `"${name}"`} isn't a plan PlanaVista knows. It reads Household Hours plans (version 1) and files exported from PlanaVista.`
          : result.problem.message;
        this._problems = [known, ...result.problem.problems];
        return;
      }
      this._text = text;
      this._name = name;
      this._preview = result.preview ?? null;
      this._choices = emptyChoices();
      this._pasting = false;
    } catch (err) {
      this._problems = [errorMessage(err) ?? "Couldn't read it. Check the connection and try again."];
    } finally {
      this._reading = false;
      this._changed();
    }
  }
}

defineElement('pv-setup-file', PvSetupFile);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import { errorMessage } from '../../../core/ws-api';
import '../../../core/pv-member-avatar';
import '../../../shell/settings/pin-actions';

/**
 * pv-setup-shared-screen: Is this a shared family screen? (spec 14.7, 9.7).
 * On yes, parents set their PINs here, and an admin account is flagged
 * (not blocked): a non-admin account is safer on a shared screen.
 */
export class PvSetupSharedScreen extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';

  @state() private _shared: boolean | null = null;
  @state() private _message = '';

  protected willUpdate(): void {
    if (this._shared === null && this.household) {
      // A parent's own login is their own screen; any other account starts as the family's.
      this._shared = this.household.account.kind !== 'parent';
    }
  }

  /** Continue: mark this account as a shared screen, or not. */
  async commit(): Promise<boolean> {
    const view = this.household;
    if (!view) return false;
    this._message = '';
    const shared = this._shared !== false;
    if (shared && !view.members.some(m => m.parent && m.has_pin)) {
      this._message = "Set a PIN for a parent first, so someone can open Settings here.";
      return false;
    }
    try {
      if (shared !== view.account.shared) await this.api.setSharedScreen(shared);
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        display: block;
      }

      .choices {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
      }

      .choice {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .choice[aria-checked='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }

      .icon {
        font-size: 1.5rem;
      }

      .text {
        flex: 1;
      }

      .title {
        display: block;
        font-weight: 700;
      }

      .sub {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .label {
        margin: 0 4px 8px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--pv-text-secondary, #6B7280);
      }

      .parents {
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .parent {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 60px;
        padding: 8px 14px;
      }

      .parent + .parent {
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .parent .name {
        flex: 1;
        font-weight: 600;
      }

      .hint {
        margin: 10px 4px 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .warning {
        margin: 16px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
        line-height: 1.5;
      }

      .message {
        margin: 14px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  render() {
    const view = this.household;
    if (!view) return nothing;
    const shared = this._shared !== false;
    const parents = inOrder(view.members).filter(m => m.parent);
    return html`
      <div class="choices" role="radiogroup" aria-label="Is this a shared family screen?">
        <button class="choice" type="button" role="radio" aria-checked=${shared ? 'true' : 'false'} @click=${() => { this._shared = true; }}>
          <span class="icon" aria-hidden="true">🏠</span>
          <span class="text"><span class="title">Yes, the whole family uses it</span><span class="sub">Like a tablet on the kitchen wall.</span></span>
        </button>
        <button class="choice" type="button" role="radio" aria-checked=${!shared ? 'true' : 'false'} @click=${() => { this._shared = false; }}>
          <span class="icon" aria-hidden="true">📱</span>
          <span class="text"><span class="title">No, it's just mine</span><span class="sub">Your own phone or computer. No PINs needed here.</span></span>
        </button>
      </div>
      ${shared ? html`
        <p class="label">Parents, set your PINs</p>
        ${parents.length ? html`
          <div class="parents">
            ${parents.map(member => html`
              <div class="parent">
                <pv-member-avatar .member=${member} .hass=${this.hass} size="36"></pv-member-avatar>
                <span class="name">${member.name}</span>
                <pv-pin-actions .hass=${this.hass} .api=${this.api} .layout=${this.layout} .member=${member}
                  .shuffle=${!!view.security.shuffle_keypad} .sharedScreens=${true}></pv-pin-actions>
              </div>
            `)}
          </div>
        ` : html`<p class="hint">No one is a parent yet. Go back to Who lives here? and mark the parents.</p>`}
        <p class="hint">Kids can have a PIN too, so nobody checks off someone else's chores. That's in Settings.</p>
        ${this.hass?.user?.is_admin ? html`
          <p class="warning" role="note">
            This screen is signed in with an admin account. A non-admin account is safer for a shared screen, because an
            admin can open Home Assistant's own settings, and a PIN can't guard those. Make a new user in Home Assistant
            (Settings, People, Users) without administrator rights, and sign this screen in with it.
          </p>
        ` : nothing}
      ` : nothing}
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-shared-screen', PvSetupSharedScreen);
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-done-board.ts` (new):

```ts
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import './pv-setup-board-preview';

/**
 * pv-setup-done-board: what chores add to You're all set (spec 14.7): a
 * preview of the board and two tips. Shown while chores are on.
 */
export class PvSetupDoneBoard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  static styles = css`
    :host {
      display: block;
    }

    .lead {
      margin: -12px 0 16px;
      color: var(--pv-text-secondary, #6B7280);
    }

    .tips {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .tip {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      font-size: 1.25rem;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .text {
      color: var(--pv-text-secondary, #6B7280);
    }
  `;

  render() {
    const account = this.household?.account;
    const pin = account?.shared || account?.kind === 'other';
    return html`
      <p class="lead">Here's your board. It fills in as the day goes.</p>
      <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
        .revision=${this.revision}></pv-setup-board-preview>
      <div class="tips">
        <div class="tip">
          <span class="icon" aria-hidden="true">👆</span>
          <span><span class="title">Hold the circle to finish a chore</span><span class="text">Let go early and nothing happens.</span></span>
        </div>
        <div class="tip">
          <span class="icon" aria-hidden="true">⚙️</span>
          <span>
            <span class="title">${pin ? "Settings needs a parent's PIN" : 'Change anything in Settings'}</span>
            <span class="text">It's the gear in the bar.</span>
          </span>
        </div>
      </div>
    `;
  }
}

defineElement('pv-setup-done-board', PvSetupDoneBoard);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index bbde519..7d8dc21 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -1,7 +1,8 @@
 import { ModuleDefinition, ModuleRegistry, moduleRegistry } from '../../core/module-registry';
 import { PageRegistry } from '../../core/page-registry';
 import {
-  PersonSection, SettingsContext, SettingsPage, personSections, settingsRegistry,
+  DonePart, PersonSection, SettingsContext, SettingsPage, SetupContext, SetupStep, doneParts, personSections,
+  settingsRegistry, setupRegistry,
 } from '../../core/settings-registry';
 import { ChoresService, choresEnabled } from './chores-service';
 import type { Board } from './chores-types';
@@ -112,11 +113,84 @@ export const choresPersonSections: PersonSection[] = [
   { id: 'phones', label: 'Phones', order: 300, slot: 'links', tag: 'pv-person-phones', applies: ({ household }) => choresEnabled({ household }) },
 ];
 
-/** Add the chores pages to Settings, and their parts to the person page. */
+/** How the household started setup (spec 14.7), from what setup saved. */
+function startOf(ctx: SetupContext): string | null {
+  return (ctx.household?.setup.start as string | null | undefined) ?? null;
+}
+
+/** The chores setup steps (spec 14.7): restore, the chores choice, common chores or a plan, and the shared screen. */
+export const choresSetupSteps: SetupStep[] = [
+  {
+    id: 'restore',
+    label: 'Restore',
+    order: 50,
+    tag: 'pv-setup-file',
+    heading: 'Restore from a PlanaVista file',
+    lead: 'Choose the file, or paste its text. You see everything in it before anything is saved.',
+    wide: true,
+    applies: ctx => startOf(ctx) === 'restore',
+  },
+  {
+    id: 'chores',
+    label: 'Chores',
+    order: 300,
+    tag: 'pv-setup-chores-choice',
+    heading: 'Do you want chores too?',
+    lead: "Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.",
+    primary: 'Continue',
+    secondary: 'Not now, just the calendar',
+    applies: ctx => !!ctx.household?.available && startOf(ctx) !== 'restore',
+  },
+  {
+    id: 'chores-common',
+    label: 'Common chores',
+    order: 310,
+    tag: 'pv-setup-common-chores',
+    heading: 'Pick some to start with',
+    lead: 'Each comes with a person, how often, and about how long. Tap a picked chore to change those.',
+    skip: true,
+    wide: true,
+    applies: ctx => startOf(ctx) === 'common',
+  },
+  {
+    id: 'chores-plan',
+    label: 'Household plan',
+    order: 320,
+    tag: 'pv-setup-file',
+    heading: 'Start from your household plan',
+    lead: 'Choose the plan file, or paste its text. You see where everything goes before anything is saved.',
+    wide: true,
+    applies: ctx => startOf(ctx) === 'plan',
+  },
+  {
+    id: 'shared-screen',
+    label: 'Shared screen',
+    order: 400,
+    tag: 'pv-setup-shared-screen',
+    heading: 'Is this a shared family screen?',
+    lead: 'On a shared screen, parents use a PIN for grown-up things like approving chores and changing settings.',
+    primary: 'Continue',
+    applies: ({ household }) => choresEnabled({ household }),
+  },
+];
+
+/** What chores add to setup's last step: the board, two tips, and Open the board. */
+export const choresDoneParts: DonePart[] = [
+  {
+    id: 'chores-board', label: 'Your board', order: 100, tag: 'pv-setup-done-board', primary: 'Open the board', module: 'chores',
+    applies: ({ household }) => choresEnabled({ household }),
+  },
+];
+
+/** Add the chores pages to Settings, their parts to the person page, and their steps to setup. */
 export function registerChoresSettings(
   settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
   sections: PageRegistry<SettingsContext, PersonSection> = personSections,
+  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
+  done: PageRegistry<SetupContext, DonePart> = doneParts,
 ): void {
   for (const page of choresSettingsPages) settings.register(page);
   for (const section of choresPersonSections) sections.register(section);
+  for (const step of choresSetupSteps) setup.register(step);
+  for (const part of choresDoneParts) done.register(part);
 }
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index a49d0ea..91b2aee 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -12,6 +12,11 @@ import './settings/pv-person-phones';
 import './settings/pv-person-stars';
 import './settings/pv-import-export-page';
 import './settings/pv-import-review';
+import './setup/pv-setup-chores-choice';
+import './setup/pv-setup-common-chores';
+import './setup/pv-setup-file';
+import './setup/pv-setup-shared-screen';
+import './setup/pv-setup-done-board';
 import { registerChoresModule, registerChoresSettings } from './definition';
 
 registerChoresModule();
```

- [ ] **Step 6: Run them again.** Same commands. Expected: `2 passed`, and `14 passed`.
- [ ] **Step 7: Run both suites.** Expected: tsc clean, `702 passed`; the backend suite, `1040 passed`; the copy check passes.
- [ ] **Step 8: Commit.** Message `feat(card): the chores setup steps` with the trailers.

---

### Task 11: Needs a look, Settings at a page, the Chores row, and Edit from the board

Spec 15.4 (problems that need a person at the top of Settings: a chore no one is assigned to, a phone Home Assistant no longer has, damaged chores data, Automatic by the sun without the Sun integration), 15.3 (Import and export offers Start over while chores need a look; the board offers Restore from a file), 13.1 (the empty board's Add chores and Import a plan), 13.3 (a parent's Edit, before Delete), and 14.7 (a calendar-only home's Chores row runs a short version of setup). The evening check's banner and pulse shipped in milestone 5.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/settings/targets.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/looks-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-off-page.ts`
- Modify: `custom_components/planavista/frontend/src/core/settings-registry.ts`, `custom_components/planavista/frontend/src/core/setup-flow.ts`, `custom_components/planavista/frontend/src/core/page-host.ts`, `custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`, `custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-types.ts`, `custom_components/planavista/frontend/src/modules/chores/definition.ts`, `custom_components/planavista/frontend/src/modules/chores/options-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts`, `custom_components/planavista/frontend/src/modules/chores/index.ts`
- Test: `custom_components/planavista/frontend/test/settings-look.test.ts`, `custom_components/planavista/frontend/test/chores-settings.test.ts`, `custom_components/planavista/frontend/test/options-derive.test.ts`

**Interfaces:**
- Consumes: Task 4's feed `notify_problems`; Task 6's editor push; Task 10's setup host and steps.
- Produces: `SettingsContext.hass`; `SettingsTarget {page, stack?}`, `LookItem {id, text, page?, stack?}`, `SettingsPage.needsALook`, `needsALook(pages, ctx)`, `settingsAt(pages, target)`; `SetupStep.finish`, `.module`; `RUN_SETUP` (`pv-run-setup`), `RunSetupDetail`; `OPEN_SETTINGS` (`pv-open-settings`, from modules with a target); `onlySteps(steps, only)`; pv-settings `target`; pv-setup `only` and `cancelLabel` (fires `pv-setup-cancel`); `choreEditor(chore)`, `editChore(chore)`, `IMPORT_EXPORT`; `choresLooks(feed, board)`, `phoneLooks(feed, members)`; `settingsFeed(ctx)`; `CHORES_SETUP_FLOW`; the page `chores-off` and the element `pv-chores-off-page`; the option `edit`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/settings-look.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { ModuleService } from '../src/core/module-registry';
import {
  DonePart, SettingsContext, SettingsPage, SetupContext, SetupStep, needsALook, settingsAt,
} from '../src/core/settings-registry';
import { onlySteps } from '../src/core/setup-flow';
import { registerShellSettings, shellSettingsPages } from '../src/shell/definition';
import { CHORES_SETUP_FLOW, choresSettingsPages, registerChoresSettings } from '../src/modules/chores/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import { IMPORT_EXPORT, choreEditor, editChore } from '../src/modules/chores/settings/targets';
import type { Board, ChoresFeed } from '../src/modules/chores/chores-types';
import type { HouseholdView } from '../src/core/household';
import { activity, board } from './chores-fixtures';

const MEMBERS = [
  { id: 'alex', name: 'Alex', parent: true, has_pin: true },
  { id: 'blair', name: 'Blair', parent: true, has_pin: false },
];

function household(enabled: boolean, start: string | null = null): HouseholdView {
  return {
    available: true, members: MEMBERS, account: { kind: 'admin', shared: false },
    security: { shuffle_keypad: false, shared_screens: 0 }, modules: { chores: { enabled } },
    setup: { completed: true, step: null, start },
  } as unknown as HouseholdView;
}

function context(feed: Partial<ChoresFeed> | null, options: { enabled?: boolean; display?: object; hass?: object } = {}): SettingsContext {
  const full = feed ? { state: 'ok', save_failed: false, board: null, notify_problems: [], ...feed } as ChoresFeed : null;
  const service = { board: () => (full?.state === 'ok' ? full.board : null), feed: full } as unknown as ModuleService;
  return {
    household: household(options.enabled ?? true),
    data: { display: options.display ?? {} } as never,
    services: { chores: service },
    hass: options.hass as never,
  };
}

function pages(ctx: SettingsContext): SettingsPage[] {
  const registry = new PageRegistry<SettingsContext, SettingsPage>();
  registerShellSettings(registry);
  registerCalendarSettings(registry);
  registerChoresSettings(registry);
  return registry.pages(ctx);
}

const WITH_SUN = { states: { 'sun.sun': { state: 'above_horizon', attributes: {} } } };

describe('Needs a look at the top of Settings (spec 15.4)', () => {
  const unassigned: Board = board({}, {
    chores: [activity('wash_the_car', { name: 'Wash the car', assignees: [] })],
    needs_a_look: [{ kind: 'unassigned', chore: 'wash_the_car', name: 'Wash the car' }],
  });

  it('lists a chore no one is assigned to, opening its editor', () => {
    const ctx = context({ board: unassigned }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'unassigned:wash_the_car',
      text: 'No one is assigned to Wash the car. It waits off the board until someone is.',
      page: 'chores',
      stack: [choreEditor({ id: 'wash_the_car', name: 'Wash the car' })],
    }]);
  });

  it('lists chores data that needs a look, opening Import and export', () => {
    const ctx = context({ state: 'needs_a_look' }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'chores-data',
      text: "Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",
      page: 'import-export',
    }]);
  });

  it('lists a phone Home Assistant no longer has, opening that person', () => {
    const ctx = context({ board: board({}), notify_problems: [{ member: 'blair', phone: 'notify.mobile_app_blairs_phone' }] }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([{
      id: 'phone:notify.mobile_app_blairs_phone',
      text: "Blair's phone, Blairs phone, isn't in Home Assistant anymore, so nothing is sent to it.",
      page: 'people',
      stack: [{ tag: 'pv-settings-person', title: 'Blair', back: 'People', props: { memberId: 'blair' } }],
    }]);
  });

  it("says when automatic appearance follows the sun but there's no Sun integration", () => {
    const sunny = { appearance: 'automatic', appearance_switch: 'sun' };
    const missing = context(null, { enabled: false, display: sunny, hass: { states: {} } });
    expect(needsALook(pages(missing), missing)).toEqual([{
      id: 'appearance-sun',
      text: "Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is.",
      page: 'appearance',
    }]);
    const fine = context(null, { enabled: false, display: sunny, hass: WITH_SUN });
    expect(needsALook(pages(fine), fine)).toEqual([]);
    const light = context(null, { enabled: false, display: { appearance: 'light' }, hass: { states: {} } });
    expect(needsALook(pages(light), light)).toEqual([]);
  });

  it('is empty when nothing needs a person', () => {
    const ctx = context({ board: board({}) }, { hass: WITH_SUN });
    expect(needsALook(pages(ctx), ctx)).toEqual([]);
  });
});

describe('opening Settings at a page (the board\'s Edit and Import a plan)', () => {
  const ctx = context({ board: board({}) }, { hass: WITH_SUN });

  it('picks the page and the pages on top of it', () => {
    expect(settingsAt(pages(ctx), editChore({ id: 'laundry', name: 'Laundry' }))).toEqual({
      selected: 'chores',
      stack: [{ tag: 'pv-chore-editor', title: 'Laundry', back: 'Chores', props: { choreId: 'laundry' } }],
    });
    expect(settingsAt(pages(ctx), IMPORT_EXPORT)).toEqual({ selected: 'import-export', stack: [] });
  });

  it('starts at the list for a page that does not apply, or no target', () => {
    const off = context(null, { enabled: false });
    expect(settingsAt(pages(off), editChore({ id: 'laundry', name: 'Laundry' }))).toEqual({ selected: null, stack: [] });
    expect(settingsAt(pages(ctx), null)).toEqual({ selected: null, stack: [] });
  });
});

describe('the Chores row for a calendar-only home (spec 14.7)', () => {
  it('shows Chores, Off, while chores are off, and the Chores list once they are on', () => {
    const off = context(null, { enabled: false });
    const row = pages(off).find(p => p.group === 'chores')!;
    expect(row).toMatchObject({ id: 'chores-off', label: 'Chores', tag: 'pv-chores-off-page' });
    expect(row.summary!(off)).toBe('Off');
    const on = context({ board: board({}) });
    expect(pages(on).map(p => p.id)).not.toContain('chores-off');
    expect(choresSettingsPages.find(p => p.id === 'chores-off')!.applies!({ household: null, data: {} as never })).toBe(false);
  });

  function flow(view: HouseholdView): SetupStep[] {
    const setup = new PageRegistry<SetupContext, SetupStep>();
    registerShellSettings(undefined, setup);
    registerCalendarSettings(undefined, setup);
    registerChoresSettings(undefined, undefined, setup, new PageRegistry<SetupContext, DonePart>());
    return onlySteps(setup.pages({ household: view, data: {} as never }), CHORES_SETUP_FLOW);
  }

  it('runs a short setup: the chores question, then common chores or the plan, then the shared screen', () => {
    expect(flow(household(false)).map(s => s.id)).toEqual(['chores']);
    expect(flow(household(true, 'common')).map(s => s.id)).toEqual(['chores', 'chores-common', 'shared-screen']);
    expect(flow(household(true, 'plan')).map(s => s.id)).toEqual(['chores', 'chores-plan', 'shared-screen']);
    expect(flow(household(true, 'empty')).map(s => s.id)).toEqual(['chores', 'shared-screen']);
  });

  it('ends on the shared screen with Open the board', () => {
    const last = flow(household(true, 'empty')).at(-1)!;
    expect(last).toMatchObject({ id: 'shared-screen', finish: 'Open the board', module: 'chores' });
  });

  it('keeps every step without a list', () => {
    const steps = [{ id: 'a' }, { id: 'b' }] as SetupStep[];
    expect(onlySteps(steps, null)).toBe(steps);
  });
});

describe('the Settings pages', () => {
  it('give every page with Needs a look a page that applies', () => {
    const ids = [...shellSettingsPages, ...choresSettingsPages].filter(p => p.needsALook).map(p => p.id);
    expect(ids).toEqual(['appearance', 'chores', 'reminders']);
  });
});
```

`custom_components/planavista/frontend/test/chores-settings.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/chores-settings.test.ts b/custom_components/planavista/frontend/test/chores-settings.test.ts
index 8e2052c..5638a93 100644
--- a/custom_components/planavista/frontend/test/chores-settings.test.ts
+++ b/custom_components/planavista/frontend/test/chores-settings.test.ts
@@ -40,10 +40,10 @@ describe('the Chores group of Settings', () => {
     expect(summary('rules', null)).toBe('');
   });
 
-  it('offers Import and export with chores off too', () => {
+  it('offers the Chores row and Import and export with chores off', () => {
     const registry = new PageRegistry<SettingsContext, SettingsPage>();
     registerChoresSettings(registry);
-    expect(registry.pages(context(false, null)).map(p => p.id)).toEqual(['import-export']);
+    expect(registry.pages(context(false, null)).map(p => p.id)).toEqual(['chores-off', 'import-export']);
     expect(registry.pages({ household: null, data: {} as never }).map(p => p.id)).toEqual([]);
   });
 
```

`custom_components/planavista/frontend/test/options-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/options-derive.test.ts b/custom_components/planavista/frontend/test/options-derive.test.ts
index 4957224..8e823c6 100644
--- a/custom_components/planavista/frontend/test/options-derive.test.ts
+++ b/custom_components/planavista/frontend/test/options-derive.test.ts
@@ -49,7 +49,8 @@ describe('itemOptions (spec 13.3)', () => {
 
   it('marks the parent options with a lock on a shared screen, and hides them on a child\'s own login', () => {
     const shared = itemOptions(ctx({}));
-    expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'delete']);
+    expect(ids(shared.parent)).toEqual(['change_due', 'hand_off', 'excuse', 'edit', 'delete']);
+    expect(shared.parent.find(o => o.id === 'edit')!.hint).toBe('Opens it in Settings.');
     expect(shared.parent.every(o => o.tag === '🔒 parent')).toBe(true);
     expect(itemOptions(ctx({ parent: 'no' })).parent).toEqual([]);
     expect(itemOptions(ctx({ parent: 'yes' })).parent[0].tag).toBeUndefined();
@@ -70,7 +71,7 @@ describe('itemOptions (spec 13.3)', () => {
     expect(ids(itemOptions(ctx({ item: { ...YARD, status: 'done' } })).member)).toEqual(['undo', 'done_by', 'history']);
     const pending = itemOptions(ctx({ item: { ...YARD, status: 'pending' }, parent: 'yes' }));
     expect(ids(pending.member)).toEqual(['undo', 'history']);
-    expect(ids(pending.parent)).toEqual(['approve', 'send_back', 'delete']);
+    expect(ids(pending.parent)).toEqual(['approve', 'send_back', 'edit', 'delete']);
   });
 
   it('says why a sent back one came back, and that a request is waiting', () => {
```

- [ ] **Step 2: Run them.** `npx vitest run test/settings-look.test.ts test/chores-settings.test.ts test/options-derive.test.ts` Expected: FAIL: `settings-look.test.ts` can't load `settings/targets`, Settings has no Chores row while chores are off, and the parent options have no Edit.

- [ ] **Step 3: Give Settings targets and Needs a look, and let it run a short setup.**

`custom_components/planavista/frontend/src/core/settings-registry.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/settings-registry.ts b/custom_components/planavista/frontend/src/core/settings-registry.ts
index e4ea87e..d56f859 100644
--- a/custom_components/planavista/frontend/src/core/settings-registry.ts
+++ b/custom_components/planavista/frontend/src/core/settings-registry.ts
@@ -1,5 +1,7 @@
+import type { HomeAssistant } from 'custom-card-helpers';
 import { HouseholdView } from './household';
 import type { ModuleService } from './module-registry';
+import type { PushPageDetail } from './page-host';
 import { PageRegistry, WizardPage } from './page-registry';
 import { PlanaVistaData } from '../types';
 
@@ -9,6 +11,24 @@ export interface SettingsContext {
   data: PlanaVistaData;
   /** The card's module services (the chores pages read the chores feed). */
   services?: Record<string, ModuleService>;
+  /** Home Assistant, for what Settings reads from its states (sun.sun, for Needs a look). */
+  hass?: HomeAssistant;
+}
+
+/** Where Settings opens: a page, and the pages pushed on it (the board's Edit opens a chore's editor). */
+export interface SettingsTarget {
+  page: string;
+  stack?: PushPageDetail[];
+}
+
+/** Something that needs a person (spec 15.4), listed under Needs a look at the top of Settings. */
+export interface LookItem {
+  id: string;
+  text: string;
+  /** The page that fixes it, when it isn't the page that reports it. */
+  page?: string;
+  /** Pages opened on top of that page, such as the editor of a chore no one is assigned to. */
+  stack?: PushPageDetail[];
 }
 
 export interface SettingsGroup {
@@ -35,6 +55,22 @@ export interface SettingsPage extends WizardPage<SettingsContext> {
   tag: string;
   /** The row's current value, such as "4 people". */
   summary?: (ctx: SettingsContext) => string;
+  /** What this page can fix that needs a person now (spec 15.4). */
+  needsALook?: (ctx: SettingsContext) => LookItem[];
+}
+
+/** Everything under Needs a look, from the pages that apply, each with the page that fixes it. */
+export function needsALook(pages: SettingsPage[], ctx: SettingsContext): Array<LookItem & { page: string }> {
+  return pages.flatMap(page => (page.needsALook?.(ctx) ?? []).map(item => ({ ...item, page: item.page ?? page.id })));
+}
+
+/** Where Settings starts for a target: its page and the pages on it, or the list when that page doesn't apply. */
+export function settingsAt(
+  pages: SettingsPage[],
+  target: SettingsTarget | null,
+): { selected: string | null; stack: PushPageDetail[] } {
+  if (!target || !pages.some(page => page.id === target.page)) return { selected: null, stack: [] };
+  return { selected: target.page, stack: target.stack ?? [] };
 }
 
 /** Pages under their groups, in order; a page of an unknown group gets a group of its own at the end. */
@@ -73,6 +109,17 @@ export interface SetupStep extends WizardPage<SetupContext> {
   skip?: boolean;
   /** A wider column (a step with a board preview beside its choices). */
   wide?: boolean;
+  /** The main button's label when this step ends a short setup (Settings' Chores row): "Open the board". */
+  finish?: string;
+  /** The module the card opens when setup ends on this step. */
+  module?: string;
+}
+
+/** A Settings page asks the card to run some of setup's steps (the Chores row runs the chores steps, spec 14.7). */
+export const RUN_SETUP = 'pv-run-setup';
+
+export interface RunSetupDetail {
+  steps: string[];
 }
 
 /** A step asks its host to draw again (its button's label or readiness changed). */
```

`custom_components/planavista/frontend/src/core/setup-flow.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/setup-flow.ts b/custom_components/planavista/frontend/src/core/setup-flow.ts
index 824ac7e..89a36db 100644
--- a/custom_components/planavista/frontend/src/core/setup-flow.ts
+++ b/custom_components/planavista/frontend/src/core/setup-flow.ts
@@ -31,3 +31,8 @@ export function stepAfter(steps: Array<{ id: string }>, current: string | undefi
   const at = Math.max(0, steps.findIndex(step => step.id === current));
   return at >= steps.length - 1 ? null : at + 1;
 }
+
+/** A short setup: only the steps named, in setup's order; every step without a list. */
+export function onlySteps<S extends { id: string }>(steps: S[], only: readonly string[] | null | undefined): S[] {
+  return only ? steps.filter(step => only.includes(step.id)) : steps;
+}
```

`custom_components/planavista/frontend/src/core/page-host.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/page-host.ts b/custom_components/planavista/frontend/src/core/page-host.ts
index f80be77..4a58463 100644
--- a/custom_components/planavista/frontend/src/core/page-host.ts
+++ b/custom_components/planavista/frontend/src/core/page-host.ts
@@ -33,6 +33,13 @@ export const PAGE_ERROR = 'pv-page-error';
 /** A page asks for a module's view (Open Dana's day): Settings closes and the card goes there. */
 export const OPEN_TARGET = 'pv-page-open';
 
+/**
+ * A module asks the card to open Settings, perhaps at a page (detail: a
+ * SettingsTarget, such as the board's Edit); the gear sends it with no detail.
+ * The card asks for a parent's PIN first when it must.
+ */
+export const OPEN_SETTINGS = 'pv-open-settings';
+
 /** Words for a failed save (spec 11.7: what happened and what to do). */
 export function saveErrorMessage(code: string): string {
   switch (code) {
```

`custom_components/planavista/frontend/src/shell/settings/pv-settings.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
index 2edb21e..98b3ce6 100644
--- a/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
+++ b/custom_components/planavista/frontend/src/shell/settings/pv-settings.ts
@@ -1,4 +1,4 @@
-import { LitElement, html, css, nothing } from 'lit';
+import { LitElement, html, css, nothing, PropertyValues } from 'lit';
 import { property, state } from 'lit/decorators.js';
 import { keyed } from 'lit/directives/keyed.js';
 import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
@@ -11,7 +11,9 @@ import type { Layout } from '../../core/layout';
 import type { ModuleService, OpenTarget } from '../../core/module-registry';
 import { OPEN_TARGET, PAGE_ERROR, POP_PAGE, PUSH_PAGE, PushPageDetail } from '../../core/page-host';
 import type { Session } from '../../core/session';
-import { SettingsContext, SettingsPage, groupPages, settingsRegistry } from '../../core/settings-registry';
+import {
+  LookItem, SettingsContext, SettingsPage, SettingsTarget, groupPages, needsALook, settingsAt, settingsRegistry,
+} from '../../core/settings-registry';
 import type { PlanaVistaData } from '../../types';
 import '../pv-parent-strip';
 import './people-page';
@@ -31,6 +33,9 @@ const TOAST_MS = 4000;
  * iPad Settings in landscape; a stack with back controls in portrait and on
  * phones. The parent-mode strip stays on top while parent mode is on.
  *
+ * Problems that need a person sit under Needs a look at the top of the list
+ * (spec 15.4); each opens the page that fixes it.
+ *
  * @fires pv-settings-close - Done
  * @fires pv-settings-open-target - a page asked for a module's view (Open Dana's day); Settings closes
  */
@@ -47,6 +52,8 @@ export class PvSettings extends LitElement {
   /** The card's module services, and a number that changes whenever one of them does. */
   @property({ attribute: false }) services: Record<string, ModuleService> = {};
   @property({ type: Number }) revision = 0;
+  /** Where Settings opens (the board's Edit, Import a plan); the list when null. */
+  @property({ attribute: false }) target: SettingsTarget | null = null;
 
   /** The page picked in the sidebar (the stack starts at the list). */
   @state() private _selected: string | null = null;
@@ -72,6 +79,14 @@ export class PvSettings extends LitElement {
     window.clearTimeout(this._toastTimer);
   }
 
+  protected willUpdate(changed: PropertyValues): void {
+    if (changed.has('target') && this.target) {
+      const at = settingsAt(settingsRegistry.pages(this._context()), this.target);
+      this._selected = at.selected;
+      this._stack = at.stack;
+    }
+  }
+
   static styles = [
     baseStyles,
     buttonStyles,
@@ -203,6 +218,42 @@ export class PvSettings extends LitElement {
         font-size: 1.25rem;
       }
 
+      .look-row {
+        align-items: flex-start;
+        background: color-mix(in srgb, #F59E0B 12%, transparent);
+      }
+
+      .look-row:hover {
+        background: color-mix(in srgb, #F59E0B 18%, transparent);
+      }
+
+      .look-row + .look-row {
+        margin-top: 6px;
+      }
+
+      .look-icon {
+        flex-shrink: 0;
+        display: grid;
+        place-items: center;
+        width: 24px;
+        height: 24px;
+        margin-top: 1px;
+        border-radius: 50%;
+        background: #B45309;
+        color: #FFFFFF;
+        font-size: 0.875rem;
+        font-weight: 800;
+      }
+
+      .look-text {
+        font-size: 0.9375rem;
+        line-height: 1.35;
+      }
+
+      .look-row .chevron {
+        align-self: center;
+      }
+
       .page {
         flex: 1;
         min-width: 0;
@@ -243,7 +294,7 @@ export class PvSettings extends LitElement {
   ];
 
   private _context(): SettingsContext {
-    return { household: this.household, data: this.data, services: this.services };
+    return { household: this.household, data: this.data, services: this.services, hass: this.hass };
   }
 
   private get _split(): boolean {
@@ -280,8 +331,21 @@ export class PvSettings extends LitElement {
 
   private _renderList(pages: SettingsPage[], current: SettingsPage | undefined) {
     const context = this._context();
+    const looks = needsALook(pages, context);
     return html`
       <nav class="list" aria-label="Settings">
+        ${looks.length ? html`
+          <section class="group">
+            <h2 class="group-label">Needs a look</h2>
+            ${looks.map(item => html`
+              <button class="row look-row" type="button" @click=${() => this._look(item)}>
+                <span class="look-icon" aria-hidden="true">!</span>
+                <span class="row-text"><span class="look-text">${item.text}</span></span>
+                <span class="chevron" aria-hidden="true">›</span>
+              </button>
+            `)}
+          </section>
+        ` : nothing}
         ${groupPages(pages).map(({ group, pages: rows }) => html`
           <section class="group">
             ${group.label ? html`<h2 class="group-label">${group.label}</h2>` : nothing}
@@ -348,6 +412,13 @@ export class PvSettings extends LitElement {
     this._selected = id;
   }
 
+  /** A Needs a look row: the page that fixes it, with its editor on top when it has one. */
+  private async _look(item: LookItem & { page: string }): Promise<void> {
+    if (!(await this._mayLeave())) return;
+    this._selected = item.page;
+    this._stack = item.stack ?? [];
+  }
+
   private _back = async (): Promise<void> => {
     if (!(await this._mayLeave())) return;
     if (this._stack.length > 0) this._stack = this._stack.slice(0, -1);
```

`custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
index 8c80d51..3ffd760 100644
--- a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
@@ -11,7 +11,7 @@ import type { Layout } from '../../core/layout';
 import type { ModuleService } from '../../core/module-registry';
 import { saveErrorMessage } from '../../core/page-host';
 import { STEP_CHANGE, SetupContext, SetupPatch, SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
-import { mergePatch, stepAfter, withPatch } from '../../core/setup-flow';
+import { mergePatch, onlySteps, stepAfter, withPatch } from '../../core/setup-flow';
 import type { PlanaVistaData } from '../../types';
 import './welcome-step';
 import './people-step';
@@ -42,7 +42,14 @@ const TOAST_MS = 4000;
  * bottom, progress dots, and Back at the top left. Setup picks up where it
  * stopped.
  *
- * @fires onboarding-complete - after the last step's commit
+ * Settings can run a short setup (`only`: the chores steps for a
+ * calendar-only home, spec 14.7). It starts at its first step, doesn't move
+ * the household's setup bookmark, offers Back to where it came from on its
+ * first step, and drops second ways on: Back is the way out, and runs the
+ * first step's own (Not now turns chores off again).
+ *
+ * @fires onboarding-complete - after the last step's commit; { module } to open
+ * @fires pv-setup-cancel - Back on a short setup's first step
  */
 export class PvSetup extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -55,6 +62,10 @@ export class PvSetup extends LitElement {
   /** The card's module services (chores steps read the chores feed and call its commands). */
   @property({ attribute: false }) services: Record<string, ModuleService> = {};
   @property({ type: Number }) revision = 0;
+  /** A short setup: only these steps (their ids). */
+  @property({ attribute: false }) only: string[] | null = null;
+  /** Where Back on a short setup's first step goes ("Settings"). */
+  @property({ type: String }) cancelLabel = '';
 
   @state() private _index = 0;
   @state() private _busy = false;
@@ -82,7 +93,9 @@ export class PvSetup extends LitElement {
 
   protected willUpdate(): void {
     if (!this._started && this.data) {
-      this._index = resumeIndex(this._steps(), this.household?.setup.step ?? null);
+      // A short setup asks its first question afresh, whatever setup chose before.
+      if (this.only) this._patch = { setup: { start: null } };
+      this._index = this.only ? 0 : resumeIndex(this._steps(), this.household?.setup.step ?? null);
       this._started = true;
     }
   }
@@ -243,7 +256,7 @@ export class PvSetup extends LitElement {
   }
 
   private _steps(): SetupStep[] {
-    return setupRegistry.pages(this._context());
+    return onlySteps(setupRegistry.pages(this._context()), this.only);
   }
 
   private get _element(): StepElement | null {
@@ -262,15 +275,19 @@ export class PvSetup extends LitElement {
     const last = index === steps.length - 1;
     const tag = unsafeStatic(step.tag);
     const element = this._element;
-    const label = element?.primaryLabel ?? step.primary ?? (last ? 'Finish' : 'Next');
+    const short = !!this.only;
+    const label = element?.primaryLabel ?? (short && last ? step.finish : undefined) ?? step.primary ?? (last ? 'Finish' : 'Next');
     const ready = element?.ready !== false;
     const context = this._context();
+    const leave = index === 0 && short && !!this.cancelLabel;
+    const noBack = index === 0 && !leave;
+    const secondary = short ? undefined : step.secondary;
     return html`
       <div class="top">
-        <button class="back ${index === 0 ? 'hidden' : ''}" type="button"
-          ?disabled=${index === 0 || this._busy}
-          aria-hidden=${index === 0 ? 'true' : 'false'}
-          @click=${this._back}>‹ Back</button>
+        <button class="back ${noBack ? 'hidden' : ''}" type="button"
+          ?disabled=${noBack || this._busy}
+          aria-hidden=${noBack ? 'true' : 'false'}
+          @click=${leave ? this._leave : this._back}>‹ ${leave ? this.cancelLabel : 'Back'}</button>
         <div class="progress-dots" role="img" aria-label="Step ${index + 1} of ${steps.length}">
           ${steps.map((_, i) => html`<div class="dot ${i === index ? 'dot--active' : ''}"></div>`)}
         </div>
@@ -300,8 +317,8 @@ export class PvSetup extends LitElement {
         <button class="pv-btn pv-btn-primary main" type="button" ?disabled=${this._busy || !ready} @click=${this._next}>
           ${label}
         </button>
-        ${step.secondary ? html`
-          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${step.secondary}</button>
+        ${secondary ? html`
+          <button class="second" type="button" ?disabled=${this._busy} @click=${this._secondary}>${secondary}</button>
         ` : nothing}
       </div>
       ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
@@ -346,8 +363,9 @@ export class PvSetup extends LitElement {
     const steps = this._steps();
     const next = stepAfter(steps, current);
     if (next === null) {
+      const module = element?.openModule ?? steps.find(step => step.id === current)?.module;
       this.dispatchEvent(new CustomEvent('onboarding-complete', {
-        detail: { module: element?.openModule }, bubbles: true, composed: true,
+        detail: { module }, bubbles: true, composed: true,
       }));
       return;
     }
@@ -355,6 +373,19 @@ export class PvSetup extends LitElement {
     this._remember(steps[next].id);
   }
 
+  /** Back on a short setup's first step: the step's own way out (Not now), then back where it came from. */
+  private _leave = async (): Promise<void> => {
+    if (this._busy) return;
+    const element = this._element;
+    this._busy = true;
+    try {
+      if (element?.secondary && !(await element.secondary())) return;
+    } finally {
+      this._busy = false;
+    }
+    this.dispatchEvent(new CustomEvent('pv-setup-cancel', { bubbles: true, composed: true }));
+  };
+
   private _secondary = async (): Promise<void> => {
     if (this._busy) return;
     const element = this._element;
@@ -381,8 +412,9 @@ export class PvSetup extends LitElement {
     this._remember(this._steps()[this._index].id);
   };
 
-  /** Where setup picks up next time (leaving halfway keeps what's done). */
+  /** Where setup picks up next time (leaving halfway keeps what's done); a short setup leaves it alone. */
   private _remember(stepId: string): void {
+    if (this.only) return;
     this.api.saveSetup({ step: stepId }).catch(err => {
       this._toast = saveErrorMessage(errorCode(err));
       window.clearTimeout(this._toastTimer);
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 4f0a0c8..5711b48 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -31,6 +31,7 @@ import { AppearanceEdits } from '../core/appearance-edits';
 import { appearanceDependencies, sunOf } from '../core/appearance-deps';
 import { AppearanceController } from './appearance-controller';
 import { registerShellSettings } from './definition';
+import type { RunSetupDetail, SettingsTarget } from '../core/settings-registry';
 import { HouseholdController } from './household-controller';
 import { ForecastController } from './forecast-controller';
 import { LayoutController } from './layout-controller';
@@ -66,6 +67,10 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   @state() private _wizardOpen = false;
   @state() private _onboardingDone = false;
   @state() private _settingsOpen = false;
+  /** Where Settings opens this time (the board's Edit, Import a plan); the list when null. */
+  @state() private _settingsTarget: SettingsTarget | null = null;
+  /** Setup's steps that Settings asked to run (the Chores row's short setup, spec 14.7); null when none run. */
+  @state() private _flow: string[] | null = null;
   @state() private _sheet: CardSheet | null = null;
   private _sheetOpener: HTMLElement | null = null;
   /** Drafts of person edits; they outlive Settings until the page reloads (spec 9.4). */
@@ -99,7 +104,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
       cardTheme: this._config?.theme,
       sun: sunOf(this.hass?.states as never),
       haDark: !!(this.hass as unknown as { themes?: { darkMode?: boolean } } | undefined)?.themes?.darkMode,
-      overlayOpen: !!this._sheet || this._settingsOpen || this._wizardOpen || this._moduleOverlay,
+      overlayOpen: !!this._sheet || this._settingsOpen || this._wizardOpen || !!this._flow || this._moduleOverlay,
     }),
     async () => {
       await this.updateComplete;
@@ -411,8 +416,11 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     return settingsAccess(this._household.view, isAdmin);
   }
 
+  /** The gear, or a module asking for Settings at a page (its event's detail), perhaps after a parent's PIN. */
   private _openSettings(event?: Event) {
     this._sheetOpener = (event?.composedPath?.()[0] as HTMLElement | undefined) ?? null;
+    const detail = (event as CustomEvent<SettingsTarget | undefined> | undefined)?.detail;
+    this._settingsTarget = detail && typeof detail.page === 'string' ? detail : null;
     const access = this._access();
     if (access === 'open' || this._session.session?.parent) {
       this._settingsVia = access === 'open' ? 'access' : 'session';
@@ -485,6 +493,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   private _onSheetCancel() {
     const sheet = this._sheet;
     this._closeSheet();
+    if (sheet?.kind === 'pin' && sheet.purpose === 'settings') this._settingsTarget = null;
     if (sheet?.kind === 'pin' && sheet.purpose === 'module') sheet.resolve(false);
     // Without parent mode, Settings can't stay open on this screen.
     if (sheet?.kind === 'pin' && sheet.purpose === 'continue') this._onSettingsClose();
@@ -564,6 +573,28 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   private _onSettingsClose() {
     this._settingsOpen = false;
     this._settingsVia = null;
+    this._settingsTarget = null;
+  }
+
+  /** Settings' Chores row: close Settings and run the chores steps of setup (spec 14.7). */
+  private _onRunSetup(event: CustomEvent<RunSetupDetail>) {
+    event.stopPropagation();
+    this._flow = [...event.detail.steps];
+    this._settingsOpen = false;
+    this._settingsTarget = null;
+  }
+
+  /** The short setup finished: open the module its last step names (Open the board). */
+  private _onFlowComplete(event: CustomEvent<{ module?: string }>) {
+    event.stopPropagation();
+    this._flow = null;
+    if (event.detail?.module) this._moduleId = event.detail.module;
+  }
+
+  /** Back from the short setup's first step: Settings again, where it started. */
+  private _onFlowCancel() {
+    this._flow = null;
+    this._openSettings(new CustomEvent('pv-open-settings', { detail: { page: 'chores-off' } }));
   }
 
   private _onSettingsLock() {
@@ -636,12 +667,32 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .drafts=${this._drafts}
               .services=${this._services}
               .revision=${this._serviceRevision}
+              .target=${this._settingsTarget}
               @pv-settings-close=${this._onSettingsClose}
+              @pv-run-setup=${this._onRunSetup}
               @pv-settings-open-target=${(e: CustomEvent<OpenTarget>) => { this._onSettingsClose(); this._open(e.detail); }}
               @pv-lock=${this._onSettingsLock}
             ></pv-settings>
           </div>
         ` : nothing}
+        ${this._flow ? html`
+          <div class="pvc-settings-overlay">
+            <pv-setup
+              .hass=${this.hass}
+              .data=${data}
+              .household=${this._household.view}
+              .api=${this._api}
+              .layout=${this._layout.layout}
+              .drafts=${this._drafts}
+              .services=${this._services}
+              .revision=${this._serviceRevision}
+              .only=${this._flow}
+              cancelLabel="Settings"
+              @onboarding-complete=${this._onFlowComplete}
+              @pv-setup-cancel=${this._onFlowCancel}
+            ></pv-setup>
+          </div>
+        ` : nothing}
         ${this._renderSheet()}
       </ha-card>
     `;
@@ -672,6 +723,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         @pv-view-change=${(e: CustomEvent<{ view: string }>) => this._setView(e.detail.view)}
         @pv-overlay-change=${(e: CustomEvent<{ open: boolean }>) => { this._moduleOverlay = e.detail.open; }}
         @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
+        @pv-open-settings=${this._openSettings}
       ></${tag}>
     `;
   }
```

`custom_components/planavista/frontend/src/shell/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/definition.ts b/custom_components/planavista/frontend/src/shell/definition.ts
index beb5ff3..51bc4ab 100644
--- a/custom_components/planavista/frontend/src/shell/definition.ts
+++ b/custom_components/planavista/frontend/src/shell/definition.ts
@@ -8,7 +8,8 @@ import {
   settingsRegistry,
   setupRegistry,
 } from '../core/settings-registry';
-import { appearanceSettings, appearanceSummary } from '../core/appearance';
+import { appearanceSettings, appearanceSummary, resolveMode } from '../core/appearance';
+import { sunOf } from '../core/appearance-deps';
 
 function count(n: number, one: string, many: string): string {
   return `${n} ${n === 1 ? one : many}`;
@@ -35,6 +36,15 @@ export const shellSettingsPages: SettingsPage[] = [
     order: 400,
     tag: 'pv-settings-appearance',
     summary: ({ data }) => appearanceSummary(appearanceSettings(data.display)),
+    // Spec 15.4: automatic at sunset and sunrise without the Sun integration uses the schedule until it's fixed.
+    needsALook: ({ data, hass }) => {
+      const settings = appearanceSettings(data?.display);
+      const { sunMissing } = resolveMode(settings, { now: new Date(), sun: sunOf(hass?.states as never) });
+      return sunMissing ? [{
+        id: 'appearance-sun',
+        text: "Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is.",
+      }] : [];
+    },
   },
   {
     id: 'pins',
```

- [ ] **Step 4: Report what needs a look, add the Chores row, and open Settings from the board.**

`custom_components/planavista/frontend/src/modules/chores/chores-types.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
index d671d90..5b968b2 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
@@ -176,6 +176,8 @@ export interface ChoresFeed {
   state: ChoresState;
   save_failed: boolean;
   board: Board | null;
+  /** Phones Home Assistant doesn't have anymore (Needs a look, spec 15.4). */
+  notify_problems?: Array<{ member: string; phone: string }>;
 }
 
 export interface WeekDay {
```

`custom_components/planavista/frontend/src/modules/chores/settings/targets.ts` (new):

```ts
import type { PushPageDetail } from '../../../core/page-host';
import type { SettingsTarget } from '../../../core/settings-registry';

/** A chore's editor, pushed on the Chores list (spec 14.4). */
export function choreEditor(chore: { id: string; name: string }): PushPageDetail {
  return { tag: 'pv-chore-editor', title: chore.name, back: 'Chores', props: { choreId: chore.id } };
}

/** Settings at a chore's editor: the board's Edit (spec 13.3), and a chore no one is assigned to. */
export function editChore(chore: { id: string; name: string }): SettingsTarget {
  return { page: 'chores', stack: [choreEditor(chore)] };
}

/** Settings at Import and export: the empty board's Import a plan, and restoring chores data that needs a look. */
export const IMPORT_EXPORT: SettingsTarget = { page: 'import-export' };
```

`custom_components/planavista/frontend/src/modules/chores/settings/looks-derive.ts` (new):

```ts
import type { Member } from '../../../core/household';
import type { LookItem } from '../../../core/settings-registry';
import type { Board, ChoresFeed } from '../chores-types';
import { phoneName } from './reminders-derive';
import { choreEditor } from './targets';

/**
 * What the Chores page puts under Needs a look (spec 15.4, 7.9): chores no one
 * is assigned to, which wait off the board, and chores data that couldn't be
 * read, which Import and export can restore.
 */
export function choresLooks(feed: ChoresFeed | null, board: Board | null): LookItem[] {
  if (feed?.state === 'needs_a_look') {
    return [{
      id: 'chores-data',
      text: "Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",
      page: 'import-export',
    }];
  }
  return (board?.needs_a_look ?? [])
    .filter(entry => entry.kind === 'unassigned')
    .map(entry => ({
      id: `unassigned:${entry.chore}`,
      text: `No one is assigned to ${entry.name}. It waits off the board until someone is.`,
      stack: [choreEditor({ id: entry.chore, name: entry.name })],
    }));
}

/** Phones Home Assistant doesn't have anymore (spec 15.4); each opens its person, where it can be removed. */
export function phoneLooks(feed: ChoresFeed | null, members: Member[]): LookItem[] {
  return (feed?.notify_problems ?? []).flatMap(problem => {
    const member = members.find(m => m.id === problem.member);
    if (!member) return [];
    return [{
      id: `phone:${problem.phone}`,
      text: `${member.name}'s phone, ${phoneName(problem.phone)}, isn't in Home Assistant anymore, so nothing is sent to it.`,
      page: 'people',
      stack: [{ tag: 'pv-settings-person', title: member.name, back: 'People', props: { memberId: member.id } }],
    }];
  });
}
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-off-page.ts` (new):

```ts
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import type { Layout } from '../../../core/layout';
import { RUN_SETUP, RunSetupDetail } from '../../../core/settings-registry';
import { CHORES_SETUP_FLOW } from '../definition';
import { choresSettingsStyles } from './settings-styles';

const FEATURES: Array<[string, string, string]> = [
  ['🧺', 'One board for everyone', "Today's chores in a column for each person, with a ring that closes when they're done."],
  ['⭐', 'Stars and rewards', 'If your family wants them. Kids save up for what they pick.'],
  ['📋', 'Start any way you like', 'From a few common chores, your household plan, or nothing at all.'],
];

/**
 * pv-chores-off-page: Settings' Chores row while chores are off (spec 14.7:
 * a calendar-only home gets a Chores row that runs a short version of
 * setup). Set up chores runs setup's chores steps.
 */
export class PvChoresOffPage extends LitElement {
  @property({ type: String }) layout: Layout = 'landscape';

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .lead {
        margin: 0 0 16px;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.0625rem;
        line-height: 1.5;
      }

      .group li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 14px 16px;
      }

      .icon {
        flex-shrink: 0;
        width: 28px;
        font-size: 1.375rem;
        line-height: 1.2;
        text-align: center;
      }

      .title {
        display: block;
        font-weight: 700;
      }

      .text {
        display: block;
        margin-top: 2px;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }

      .start {
        width: 100%;
        min-height: 52px;
        margin-top: 20px;
        font-size: 1.0625rem;
      }

      .note {
        margin: 10px 0 0;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
        text-align: center;
      }
    `,
  ];

  render() {
    return html`
      <p class="lead">Chores sit next to the calendar. Kids hold a chore's circle to finish it and earn stars.</p>
      <ul class="group">
        ${FEATURES.map(([icon, title, text]) => html`
          <li><span class="icon" aria-hidden="true">${icon}</span><span><span class="title">${title}</span><span class="text">${text}</span></span></li>
        `)}
      </ul>
      <button class="pv-btn pv-btn-primary start" type="button" @click=${this._start}>Set up chores</button>
      <p class="note">A few questions. The calendar stays as it is.</p>
    `;
  }

  private _start = (): void => {
    const detail: RunSetupDetail = { steps: CHORES_SETUP_FLOW };
    this.dispatchEvent(new CustomEvent(RUN_SETUP, { detail, bubbles: true, composed: true }));
  };
}

defineElement('pv-chores-off-page', PvChoresOffPage);
```

`custom_components/planavista/frontend/src/modules/chores/definition.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/definition.ts b/custom_components/planavista/frontend/src/modules/chores/definition.ts
index 7d8dc21..7fb9fe8 100644
--- a/custom_components/planavista/frontend/src/modules/chores/definition.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/definition.ts
@@ -5,7 +5,8 @@ import {
   settingsRegistry, setupRegistry,
 } from '../../core/settings-registry';
 import { ChoresService, choresEnabled } from './chores-service';
-import type { Board } from './chores-types';
+import type { Board, ChoresFeed } from './chores-types';
+import { choresLooks, phoneLooks } from './settings/looks-derive';
 import { remindersSummary } from './settings/reminders-derive';
 import { rulesSummary } from './settings/rules-derive';
 
@@ -41,11 +42,20 @@ export function settingsBoard(ctx: Pick<SettingsContext, 'services'>): Board | n
   return (ctx.services?.chores as ChoresService | undefined)?.board() ?? null;
 }
 
+/** The chores feed as it came (its state and phone problems too), or null before it arrives. */
+export function settingsFeed(ctx: Pick<SettingsContext, 'services'>): ChoresFeed | null {
+  return (ctx.services?.chores as ChoresService | undefined)?.feed ?? null;
+}
+
 function count(n: number, one: string, many: string): string {
   return `${n} ${n === 1 ? one : many}`;
 }
 
-/** The Chores group of Settings (spec 14.1): Chores, Rewards, Rules, and Reminders, while chores are on. */
+/**
+ * The Chores group of Settings (spec 14.1): Chores, Rewards, Rules, and
+ * Reminders while chores are on; while they're off, one Chores row that runs
+ * a short version of setup (spec 14.7).
+ */
 export const choresSettingsPages: SettingsPage[] = [
   {
     id: 'chores',
@@ -58,6 +68,16 @@ export const choresSettingsPages: SettingsPage[] = [
       const board = settingsBoard(ctx);
       return board ? count(board.chores.filter(a => !a.finished_at).length, 'chore', 'chores') : '';
     },
+    needsALook: ctx => choresLooks(settingsFeed(ctx), settingsBoard(ctx)),
+  },
+  {
+    id: 'chores-off',
+    label: 'Chores',
+    group: 'chores',
+    order: 200,
+    tag: 'pv-chores-off-page',
+    applies: ({ household }) => !!household?.available && !choresEnabled({ household }),
+    summary: () => 'Off',
   },
   {
     id: 'rewards',
@@ -94,6 +114,7 @@ export const choresSettingsPages: SettingsPage[] = [
       const board = settingsBoard(ctx);
       return board ? remindersSummary(board.settings, ctx.data?.display?.time_format) : '';
     },
+    needsALook: ctx => phoneLooks(settingsFeed(ctx), ctx.household?.members ?? []),
   },
   {
     // People, chores, rewards, and rules travel together, so this works with chores off too.
@@ -170,10 +191,15 @@ export const choresSetupSteps: SetupStep[] = [
     heading: 'Is this a shared family screen?',
     lead: 'On a shared screen, parents use a PIN for grown-up things like approving chores and changing settings.',
     primary: 'Continue',
+    finish: 'Open the board',
+    module: 'chores',
     applies: ({ household }) => choresEnabled({ household }),
   },
 ];
 
+/** The short setup that Settings' Chores row runs for a calendar-only home (spec 14.7). */
+export const CHORES_SETUP_FLOW = ['chores', 'chores-common', 'chores-plan', 'shared-screen'];
+
 /** What chores add to setup's last step: the board, two tips, and Open the board. */
 export const choresDoneParts: DonePart[] = [
   {
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
index 0aae677..fd22be8 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-chores-list-page.ts
@@ -7,6 +7,7 @@ import { HouseholdView, Member, inOrder } from '../../../core/household';
 import type { Layout } from '../../../core/layout';
 import type { ModuleService } from '../../../core/module-registry';
 import { OPEN_TARGET, PUSH_PAGE, PushPageDetail } from '../../../core/page-host';
+import { choreEditor } from './targets';
 import type { PlanaVistaData } from '../../../types';
 import type { ChoresService } from '../chores-service';
 import { ChoreRow, choresList } from './chores-list-derive';
@@ -225,7 +226,7 @@ export class PvChoresListPage extends LitElement {
 
   private _open(row: ChoreRow | null): void {
     const detail: PushPageDetail = row
-      ? { tag: 'pv-chore-editor', title: row.name, back: 'Chores', props: { choreId: row.id } }
+      ? choreEditor(row)
       : { tag: 'pv-chore-editor', title: 'New chore', back: 'Chores', props: { choreId: null, assignees: this._member ? [this._member] : [] } };
     this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
   }
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
index b7a1c8b..fd6116e 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-export-page.ts
@@ -6,13 +6,14 @@ import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
 import type { HouseholdView } from '../../../core/household';
 import type { Layout } from '../../../core/layout';
 import type { ModuleService } from '../../../core/module-registry';
-import { PUSH_PAGE } from '../../../core/page-host';
+import { PAGE_ERROR, PUSH_PAGE } from '../../../core/page-host';
 import { copyText } from '../../../core/clipboard';
 import { errorMessage } from '../../../core/ws-api';
 import type { PlanaVistaData } from '../../../types';
 import type { ImportProblem } from '../chores-client';
 import type { ChoresService } from '../chores-service';
 import { choresSettingsStyles } from './settings-styles';
+import '../../../shell/pv-notice-sheet';
 
 type Mode = 'import' | 'restore';
 const PASTED = 'Pasted text';
@@ -21,7 +22,8 @@ const PASTED = 'Pasted text';
  * pv-import-export-page: Import and export (spec 14.5, 14.6, 7.9). Import a
  * plan by choosing a file or pasting its text (wall tablets rarely have
  * files), export a PlanaVista file, and restore one. Reading a file opens
- * the review page; nothing is saved until Import there.
+ * the review page; nothing is saved until Import there. While chores data
+ * needs a look (spec 15.3), it says so first and offers Start over too.
  */
 export class PvImportExportPage extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
@@ -37,6 +39,8 @@ export class PvImportExportPage extends LitElement {
   @state() private _problem: { name: string; problem: ImportProblem; mode: Mode } | null = null;
   @state() private _exported: { text: string; name: string } | null = null;
   @state() private _copied = false;
+  /** Start over is asking to be confirmed. */
+  @state() private _confirming = false;
   private _mode: Mode = 'import';
 
   static styles = [
@@ -109,6 +113,19 @@ export class PvImportExportPage extends LitElement {
       input[type='file'] {
         display: none;
       }
+
+      .look {
+        margin: 0 0 8px;
+      }
+
+      .look p {
+        margin: 0;
+        line-height: 1.45;
+      }
+
+      .look .actions {
+        padding: 12px 0 0;
+      }
     `,
   ];
 
@@ -117,7 +134,25 @@ export class PvImportExportPage extends LitElement {
   }
 
   render() {
+    const damaged = this._chores?.feed?.state === 'needs_a_look';
     return html`
+      ${damaged ? html`
+        <div class="error look" role="alert">
+          <h3><span class="mark" aria-hidden="true">!</span>Chores need a look</h3>
+          <p class="row-sub">Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file you
+            exported (under Restore), or a Home Assistant backup from before it went missing (Settings, System, Backups).
+            Or start over with no chores.</p>
+          <div class="actions">
+            <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._confirming = true; }}>Start over…</button>
+          </div>
+        </div>
+      ` : nothing}
+      ${this._confirming ? html`
+        <pv-notice-sheet .layout=${this.layout} heading="Start over with no chores?"
+          body="Chores, rewards, stars, and their history are emptied. People, PINs, and calendars stay as they are."
+          .actions=${[{ id: 'start_over', label: 'Start over', kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
+          @pv-sheet-action=${this._onStartOver}></pv-notice-sheet>
+      ` : nothing}
       <input type="file" accept=".json,application/json,text/plain" @change=${this._onFile} />
       <h2 class="section-label">Import a plan</h2>
       <div class="group">
@@ -146,6 +181,18 @@ export class PvImportExportPage extends LitElement {
     `;
   }
 
+  private _onStartOver = async (event: CustomEvent<{ id: string }>): Promise<void> => {
+    event.stopPropagation();
+    this._confirming = false;
+    if (event.detail.id !== 'start_over' || !this._chores) return;
+    try {
+      await this._chores.api.startOver();
+    } catch (err) {
+      const message = errorMessage(err) ?? "Couldn't start over. Try again.";
+      this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message }, bubbles: true, composed: true }));
+    }
+  };
+
   private _renderActions(mode: Mode) {
     return html`
       <div class="actions">
```

`custom_components/planavista/frontend/src/modules/chores/options-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
index ee95010..35dfa83 100644
--- a/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/options-derive.ts
@@ -10,7 +10,7 @@ const CODES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
 
 export type OptionId =
   | 'plan_day' | 'more_time' | 'skip' | 'done_by' | 'history' | 'undo'
-  | 'change_due' | 'hand_off' | 'excuse' | 'delete' | 'approve' | 'send_back';
+  | 'change_due' | 'hand_off' | 'excuse' | 'edit' | 'delete' | 'approve' | 'send_back';
 
 /** A day to pick in a sheet ("Tomorrow", "Sat", "Next Sat"). */
 export interface DayChip {
@@ -202,6 +202,7 @@ export function itemOptions(ctx: OptionsContext): OptionsModel {
       parent.push({ id: 'hand_off', label: 'Hand it to someone else', tag: parentTag, hint: 'Just this time.' });
       parent.push({ id: 'excuse', label: 'Excuse it', tag: parentTag, hint: 'A sick day: nothing is missed, and the streak holds.' });
     }
+    parent.push({ id: 'edit', label: 'Edit the chore', tag: parentTag, hint: 'Opens it in Settings.' });
     parent.push({ id: 'delete', label: 'Delete the chore', tag: parentTag, destructive: true, hint: 'It leaves the board for everyone.' });
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
index 0108a71..d4fbaae 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-options.ts
@@ -11,7 +11,7 @@ import type { OptionId, OptionModel, OptionsModel } from './options-derive';
 
 const ICONS: Record<OptionId, string> = {
   plan_day: '📅', more_time: '⏰', skip: '🛌', done_by: '🙋', history: '📜', undo: '↩️',
-  change_due: '🗓️', hand_off: '🔁', excuse: '🤒', delete: '🗑️', approve: '✅', send_back: '↩️',
+  change_due: '🗓️', hand_off: '🔁', excuse: '🤒', edit: '✏️', delete: '🗑️', approve: '✅', send_back: '↩️',
 };
 
 /** Quick reasons for Send back (spec 13.7). */
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 514cbd6..7270edd 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -10,6 +10,8 @@ import type { PinGate } from '../../core/pin-gate';
 import type { Session } from '../../core/session';
 import type { Toast } from '../../core/pv-toast';
 import { memberAccess, parentAccess, pinChoicesFor } from '../../core/access';
+import { OPEN_SETTINGS } from '../../core/page-host';
+import type { SettingsTarget } from '../../core/settings-registry';
 import type { Mode } from '../../styles/theme-pairs';
 import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../../types';
 import { choresStyles } from './chores-styles';
@@ -34,6 +36,7 @@ import { QuickAddDraft, activityFrom } from './quick-add';
 import { errorMessage } from '../../core/ws-api';
 import { chime, haptic } from './effects';
 import type { PvChoresBoard } from './pv-chores-board';
+import { IMPORT_EXPORT, editChore } from './settings/targets';
 import '../../core/pv-toast';
 import '../../shell/pv-notice-sheet';
 import './pv-chores-board';
@@ -568,10 +571,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
       <div class="state">
         <div class="art" aria-hidden="true">🧺</div>
         <h2>No chores yet</h2>
-        <p>Add your family's chores, and they'll show up here for everyone.</p>
+        <p>Add your family's chores, or import a plan you already agreed on.</p>
         ${access !== 'no' ? html`
           <div class="buttons">
             <button class="pv-btn pv-btn-primary" type="button" @click=${() => this.moduleAction('add')}>Add chores</button>
+            <button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._openSettings(IMPORT_EXPORT)}>Import a plan</button>
           </div>
         ` : nothing}
       </div>
@@ -806,6 +810,12 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         );
         return;
       }
+      case 'edit': {
+        if (!(await this.asParent(`Who's changing ${name}?`))) return;
+        this._sheet = null;
+        this._openSettings(editChore({ id: item.chore, name: board.chores.find(a => a.id === item.chore)?.name ?? name }));
+        return;
+      }
       case 'delete': {
         if (!(await this.asParent(`Who's deleting ${name}?`))) return;
         this._sheet = { kind: 'delete', row };
@@ -814,6 +824,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     }
   }
 
+  /** Settings at a page (Edit, Import a plan); the card asks for a parent's PIN when it must. */
+  private _openSettings(target: SettingsTarget): void {
+    this.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { detail: target, bubbles: true, composed: true }));
+  }
+
   /** "Someone else did it?": pick who, then credit them instead (spec 13.2). */
   private _someoneElse(last: LastCheckoff): void {
     const people = inOrder(this.household?.members ?? []).filter(m => m.id !== last.member);
@@ -871,10 +886,11 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         <div class="art" aria-hidden="true">🧰</div>
         <h2>Chores need a look</h2>
         <p>Some chores data couldn't be read, so nothing is shown or saved until a parent decides. To get it back,
-          restore a Home Assistant backup from before it went missing (Settings, System, Backups). Or start over
-          with no chores.</p>
+          restore a Home Assistant backup from before it went missing (Settings, System, Backups), or a PlanaVista
+          file you exported. Or start over with no chores.</p>
         ${access !== 'no' ? html`
           <div class="buttons">
+            <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._openSettings(IMPORT_EXPORT)}>Restore from a file</button>
             <button class="pv-btn pv-btn-secondary" type="button" @click=${this._askStartOver}>Start over</button>
           </div>
         ` : nothing}
```

`custom_components/planavista/frontend/src/modules/chores/index.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/index.ts b/custom_components/planavista/frontend/src/modules/chores/index.ts
index 91b2aee..cf245ce 100644
--- a/custom_components/planavista/frontend/src/modules/chores/index.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/index.ts
@@ -1,6 +1,7 @@
 // The Chores module: its elements, its Settings pages, and its entry in the module registry.
 import './pv-chores-module';
 import './settings/pv-chores-list-page';
+import './settings/pv-chores-off-page';
 import './settings/pv-chore-editor';
 import './settings/pv-rewards-page';
 import './settings/pv-reward-editor';
```

- [ ] **Step 5: Run them again.** Same command. Expected: `30 passed`.
- [ ] **Step 6: Run the whole frontend suite.** Expected: tsc clean, `714 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `feat(card): Needs a look, Settings at a page, the Chores row, and Edit from the board` with the trailers.

---

### Task 12: Release 1.3.0 on the branch: the version, the card picker's name, the README, and the bundle

Spec 6.4 (`custom:planavista-card` for new dashboards; 1.2.0, the release a household steps back to from 1.3.0, already knows it) and 17.3 (1.3.0 ships chores). The README gains the chores section and the chores automations; the docs' card examples follow the picker. Nothing is published.

**Files:**
- Modify: `custom_components/planavista/manifest.json`, `custom_components/planavista/const.py`, `custom_components/planavista/frontend/package.json`, `custom_components/planavista/frontend/package-lock.json`, `custom_components/planavista/frontend/src/shell/card-picker.ts`, `README.md`, `DESIGN_SYSTEM.md`, `custom_components/planavista/frontend/dist/planavista-cards.js`
- Test: `custom_components/planavista/frontend/test/card-picker.test.ts`

**Interfaces:**
- Produces: version `1.3.0`; `CARD_PICKER_ENTRY.type` `planavista-card`, description "Your family's calendar and chores, together on one screen."

- [ ] **Step 1: Write the failing test.**

`custom_components/planavista/frontend/test/card-picker.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/card-picker.test.ts b/custom_components/planavista/frontend/test/card-picker.test.ts
index 5c9d234..6379e74 100644
--- a/custom_components/planavista/frontend/test/card-picker.test.ts
+++ b/custom_components/planavista/frontend/test/card-picker.test.ts
@@ -2,11 +2,13 @@ import { describe, expect, it } from 'vitest';
 import { CARD_PICKER_ENTRY, registerCardPicker } from '../src/shell/card-picker';
 
 describe('the card picker entry', () => {
-  it('offers the 1.1.0 element name, so a household that steps back a release keeps working cards', () => {
+  it('offers the short name, which 1.2.0 (one release back) already knows', () => {
     const cards: Array<{ type: string }> = [];
     registerCardPicker(cards);
     expect(cards).toEqual([CARD_PICKER_ENTRY]);
-    expect(CARD_PICKER_ENTRY.type).toBe('planavista-calendar-card');
+    expect(CARD_PICKER_ENTRY).toMatchObject({
+      type: 'planavista-card', name: 'PlanaVista', description: "Your family's calendar and chores, together on one screen.",
+    });
   });
 
   it('adds nothing when another copy of the bundle already registered either name', () => {
```

- [ ] **Step 2: Run it.** `npx vitest run test/card-picker.test.ts` Expected: FAIL: the picker still writes `planavista-calendar-card`.

- [ ] **Step 3: Switch the picker, bump the version, and document chores.**

`custom_components/planavista/frontend/src/shell/card-picker.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/card-picker.ts b/custom_components/planavista/frontend/src/shell/card-picker.ts
index 6577459..1e0b49b 100644
--- a/custom_components/planavista/frontend/src/shell/card-picker.ts
+++ b/custom_components/planavista/frontend/src/shell/card-picker.ts
@@ -7,15 +7,15 @@ export interface CardPickerEntry {
 }
 
 /**
- * The picker keeps the 1.1.0 element name for now. A card added as
- * `custom:planavista-card` would break if the household stepped back to
- * 1.1.0, which doesn't know the alias. The picker switches to the alias once
- * the release that introduced it is the oldest one people step back to.
+ * New cards get the short name, `custom:planavista-card` (spec 6.4). 1.2.0
+ * introduced it and is the release a household steps back to from 1.3.0, so a
+ * card added now keeps working after a step back. Cards added as
+ * `custom:planavista-calendar-card` keep working too.
  */
 export const CARD_PICKER_ENTRY: CardPickerEntry = {
-  type: 'planavista-calendar-card',
+  type: 'planavista-card',
   name: 'PlanaVista',
-  description: 'All-in-one calendar with clock, weather, toggles, and views',
+  description: "Your family's calendar and chores, together on one screen.",
   preview: true,
 };
 
```

`custom_components/planavista/manifest.json`:

```diff
diff --git a/custom_components/planavista/manifest.json b/custom_components/planavista/manifest.json
index f9e266f..361032c 100644
--- a/custom_components/planavista/manifest.json
+++ b/custom_components/planavista/manifest.json
@@ -11,5 +11,5 @@
   "issue_tracker": "https://github.com/tavenhall1/planavista/issues",
   "requirements": [],
   "single_config_entry": true,
-  "version": "1.2.0"
+  "version": "1.3.0"
 }
```

`custom_components/planavista/const.py`:

```diff
diff --git a/custom_components/planavista/const.py b/custom_components/planavista/const.py
index a65dd6d..8844283 100644
--- a/custom_components/planavista/const.py
+++ b/custom_components/planavista/const.py
@@ -3,7 +3,7 @@ from typing import Final
 
 DOMAIN: Final = "planavista"
 NAME: Final = "PlanaVista"
-VERSION: Final = "1.2.0"
+VERSION: Final = "1.3.0"
 
 # Event fetching range
 EVENT_RANGE_PAST_DAYS: Final = 30
```

`custom_components/planavista/frontend/package.json`:

```diff
diff --git a/custom_components/planavista/frontend/package.json b/custom_components/planavista/frontend/package.json
index ec0d9b8..49eef20 100644
--- a/custom_components/planavista/frontend/package.json
+++ b/custom_components/planavista/frontend/package.json
@@ -1,6 +1,6 @@
 {
   "name": "planavista-cards",
-  "version": "1.2.0",
+  "version": "1.3.0",
   "description": "PlanaVista cards for Home Assistant",
   "author": "Stephen Hall",
   "license": "MIT",
```

`custom_components/planavista/frontend/package-lock.json`:

```diff
diff --git a/custom_components/planavista/frontend/package-lock.json b/custom_components/planavista/frontend/package-lock.json
index 6ff4623..89ab20c 100644
--- a/custom_components/planavista/frontend/package-lock.json
+++ b/custom_components/planavista/frontend/package-lock.json
@@ -1,12 +1,12 @@
 {
   "name": "planavista-cards",
-  "version": "1.2.0",
+  "version": "1.3.0",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
       "name": "planavista-cards",
-      "version": "1.2.0",
+      "version": "1.3.0",
       "license": "MIT",
       "dependencies": {
         "custom-card-helpers": "^1.9.0",
```

`README.md`:

````diff
diff --git a/README.md b/README.md
index 1a85407..3cd80e8 100644
--- a/README.md
+++ b/README.md
@@ -6,7 +6,7 @@
 
 <p align="center">
   <strong>A panoramic view of your family's life</strong><br>
-  A beautiful, privacy-first wall calendar for Home Assistant that rivals Skylight and Hearth, with no monthly fees.
+  A beautiful, privacy-first family calendar and chore board for Home Assistant that rivals Skylight and Hearth, with no monthly fees.
 </p>
 
 <p align="center">
@@ -20,12 +20,14 @@
 ## Features
 
 - **4 Calendar Views**: Day (per-person columns), Week, Month, and Agenda
+- **Chores**: One board for the whole family, with a ring for each person's day, stars, rewards, and a parent's OK when you want one
+- **Start from Your Plan**: Import a Household Hours plan, pick from common chores, or start empty
 - **Deep Google Calendar Integration**: Attendee invitations, in-place PATCH edits, real organizer detection via API
 - **Shared Event Awareness**: Multi-participant detection, organizer badges, stripe gradients, participant avatars
 - **Full Event Management**: Create, edit, and delete events with optional address suggestions and multi-calendar support
 - **Past Event Dimming**: Finished events automatically fade so you can focus on what's next
 - **20-Color Palette**: Earth, ocean, warm, and vivid tones for calendar personalization
-- **Built-in Onboarding Wizard**: Auto-discovers your calendars, weather, and people entities
+- **Built-in Setup**: Auto-discovers your calendars, weather, and people entities
 - **Day and Night**: Light, Dark, or Automatic (at sunset and sunrise, on a schedule, or with Home Assistant), with three themes that each have a light and a dark version
 - **Animated Weather**: 15 custom SVG icons with condition-based gradients and forecasts
 - **Per-Person Day View**: Skylight-inspired columns with large person avatars
@@ -80,14 +82,14 @@ Make sure you have at least one calendar integration configured:
 3. Search for **PlanaVista**
 4. Save: setup appears on first load
 
-Setup walks you through who lives here, your calendars, and the look. No YAML required.
+Setup walks you through who lives here, your calendars, chores if you want them, and the look. No YAML required.
 
 ### 5. Card YAML Options (Optional)
 
 The card works with zero configuration, but you can override settings per-card:
 
 ```yaml
-type: custom:planavista-calendar-card
+type: custom:planavista-card
 entity: sensor.planavista_config
 
 # Optional overrides
@@ -95,8 +97,8 @@ default_view: week          # day | week | month | agenda
 calendars:                  # show only specific calendars
   - calendar.alice
   - calendar.bob
-modules: [calendar]         # the modules this card shows, in order
-module: calendar            # the module it opens on
+modules: [calendar, chores] # the modules this card shows, in order
+module: calendar            # the module it opens on: calendar | chores
 theme: minimal              # planavista | minimal | vibrant, or light | dark
 hide_weather: false         # hide the weather
 hide_header: false          # hide the clock and weather header
@@ -105,8 +107,8 @@ time_format: 12h            # 12h | 24h
 first_day: sunday           # sunday | monday
 ```
 
-- `planavista-card` is the card's newer name and works from 1.2.0 on. The example uses `planavista-calendar-card`, which every version knows, so a dashboard keeps working if you ever go back to 1.1.0.
-- `modules` and `module` choose what a card shows and where it starts. Today the calendar is the only module; chores comes next.
+- `planavista-card` is the card's name for new dashboards and works from 1.2.0 on. Cards added before as `planavista-calendar-card` keep working.
+- `modules` and `module` choose what a card shows and where it starts. A chores tablet can open on the board with `module: chores`. Chores shows once the household turns it on.
 - `theme` with a theme's name picks the theme and still follows the household's Light, Dark, or Automatic. `light` or `dark` fixes the card to PlanaVista's light or dark version.
 - `hide_header` hides the clock and weather header. The bar with the views and Settings stays.
 
@@ -126,6 +128,30 @@ PlanaVista keeps a list of the people in your household. Anyone whose calendar i
 
 ---
 
+## Chores
+
+Chores sit next to the calendar. The board shows everyone's today at once: a column for each person, their chores in the morning, afternoon, and evening, and a ring that closes when everything due today is done. Kids hold a chore's circle to finish it and earn stars. Let go early and nothing happens.
+
+**Setting up.** First-run setup asks "Do you want chores too?" Start from your household plan (a Household Hours file), pick from a short list of common chores, or start empty. Already using PlanaVista for the calendar? Settings has a Chores row that asks the same few questions. Afterwards, Settings, Chores lists every chore; tap one to change who does it, when, about how long, and whether it needs a parent's OK. On the board, a parent can also tap a chore and choose Edit.
+
+**Three kinds of chores.**
+
+- **Plan**: a share of time each day or week, as your household agreed (Kitchen cleanup, 30 minutes a day).
+- **Once**: one job on a day or by a date (Fix the gate latch by Friday).
+- **Repeats**: every day, week, or month, on the days you pick (Take out the trash on Tuesday and Friday).
+
+**Views.** Board; Week, with each person's days and anything missed; My day, one person's day as a timeline, a list, or big pictures for young children; and Rewards, with stars saved up and what they can buy.
+
+**Waiting for OK.** A chore or a reward can wait for a parent's OK. Parents answer under Waiting for OK on the screen, or from their phones. Settings, Rules decides what happens to check-offs nobody answers by the end of the day, what a missed chore does, when the chore day starts (3:00 AM), and how many minutes earn a star.
+
+**Phones.** On a person's page in Settings, pick their phones (from the Home Assistant Companion app). Parents' phones get Waiting for OK requests with buttons to answer them. Under Reminders, anyone with a phone can get a reminder at the evening check (7:00 PM unless you change it), only when they have chores left; the board shows the evening check at the same time. If Home Assistant no longer has a phone, Settings lists it under Needs a look.
+
+**Import and export.** Settings, Import and export brings in a Household Hours plan (choose the file or paste its text), saves a PlanaVista file, and restores one. A review shows where everything goes before anything is saved. Importing again updates what's there instead of adding copies, and nothing is deleted. A PlanaVista file holds people, chores, rewards, and rules, but no PINs, stars, or history; Home Assistant backups keep those. Its format is described in [docs/schemas/planavista.household.v1.json](docs/schemas/planavista.household.v1.json).
+
+**Voice.** Each person's chores are also a Home Assistant to-do list (for example, Casey Chores), so Assist and other voice assistants can read them, add to them, and check them off. A chore added to a to-do list by voice, or by someone who isn't a parent, waits for a parent's OK each time it's checked off.
+
+---
+
 ## Appearance
 
 In Settings, Appearance shows Light, Dark, and Automatic as small pictures of the card. Changes show as you tap.
@@ -165,6 +191,36 @@ actions:
       option: dark
 ```
 
+### Chores in automations
+
+Each person gets a device in Home Assistant:
+
+| Entity | What it says |
+|--------|--------------|
+| `todo.<name>_chores` | Their chores; checking one off completes it |
+| `sensor.<name>_chores_left` | Chores still to do today |
+| `sensor.<name>_chores_this_week` | How much of this week's chores is done, in percent |
+| `sensor.<name>_chore_time` | Every minute of chores they've done |
+| `sensor.<name>_stars` | Stars to spend |
+| `sensor.<name>_streak` | Days in a row with every chore done |
+| `binary_sensor.<name>_chores_done` | On once everything due today is done |
+| `event.<name>_chores` | Completed, approved, sent back, undone, missed, or redeemed |
+
+The Household device adds `sensor.household_chores_left` and `sensor.household_approvals_waiting`, next to `select.planavista_appearance`.
+
+Actions: `planavista.complete_chore`, `undo_chore`, `get_chores`, `add_chore`, `remove_chore`, `excuse_chore`, `approve_chore`, `send_back_chore`, `redeem_reward`, `award_stars`, `pause_member`, `resume_member`, and `export_household`. A chore's id is in Settings, Chores, under Use in automations. For example, a tag by the fish tank checks off Casey's chore:
+
+```yaml
+triggers:
+  - trigger: tag
+    tag_id: fish-tank
+actions:
+  - action: planavista.complete_chore
+    data:
+      member: person.casey
+      chore: feed_the_fish
+```
+
 ---
 
 ## Layouts
@@ -245,7 +301,7 @@ PlanaVista goes beyond Home Assistant's built-in calendar services to provide de
 3. Optionally add a location or description. Locations are plain text unless you turn on **Address suggestions** (see below)
 4. Click **Add**. For multi-calendar events on Google Calendar, attendees are automatically invited via the API
 
-**Address suggestions** are **off by default**. An admin can turn them on under the card's **Settings > Preferences**. When on, the location text you type (and nothing else) is sent to [Photon](https://photon.komoot.io) (OpenStreetMap data) to suggest addresses. When off, locations are plain text and nothing is sent.
+**Address suggestions** are **off by default**. A parent can turn them on in the card's **Settings, Calendar options**. When on, the location text you type (and nothing else) is sent to [Photon](https://photon.komoot.io) (OpenStreetMap data) to suggest addresses. When off, locations are plain text and nothing is sent.
 
 ### Editing Events
 
````

`DESIGN_SYSTEM.md`:

````diff
diff --git a/DESIGN_SYSTEM.md b/DESIGN_SYSTEM.md
index 791bc33..68a4d54 100644
--- a/DESIGN_SYSTEM.md
+++ b/DESIGN_SYSTEM.md
@@ -324,7 +324,7 @@ Motion is part of the product, Apple style, in every module.
 Settings are saved for the whole household; a card's YAML can override some for that card:
 
 ```yaml
-type: custom:planavista-calendar-card
+type: custom:planavista-card
 default_view: day
 modules: [calendar]
 theme: minimal
@@ -332,7 +332,7 @@ hide_weather: true
 hide_header: false
 ```
 
-- `planavista-card` is the card's newer name, from 1.2.0 on. Examples and the card picker use `planavista-calendar-card`, which 1.1.0 also knows, so stepping back a release keeps dashboards working.
+- `planavista-card` is the card's name from 1.2.0 on, and what the card picker writes from 1.3.0. Cards added before as `planavista-calendar-card` keep working.
 - `theme`: `light` or `dark` fixes the card to PlanaVista Light or Dark; a theme name (`planavista`, `minimal`, `vibrant`) picks the theme and follows the household's Light, Dark, or Automatic.
 - `hide_header` hides the clock and weather header; the bar stays.
 - Anything not set in YAML follows the household's settings.
````

- [ ] **Step 4: Rebuild the bundle.** `npm run build` (the bundle is generated; don't edit it by hand).
- [ ] **Step 5: Run them again.** `npx vitest run test/card-picker.test.ts test/docs.test.ts test/version.test.ts` Expected: `5 passed` (the picker's 2, the docs' 2, and the version's 1).
- [ ] **Step 6: Run both suites.** Expected: tsc clean, `714 passed`; the backend suite, `1040 passed`; the copy check passes.
- [ ] **Step 7: Commit.** Message `chore(release): 1.3.0 on the branch, the card picker's short name, the README's chores, and the bundle` with the trailers.

---

### Task 13: Fixes from the dev Home Assistant walkthrough

Found running the household's setup on the dev Home Assistant (spec 14.7 on the tablet, 9.4 parent mode, 13.4 picture tiles, 14.6 the pinned Import bar):

- "Yes, the whole family uses it" made this account a shared screen with no parent mode, so setup's last saves were refused and setup couldn't finish. Continue now asks for a parent's PIN first, and setup asks again when parent mode ends halfway.
- Imported chores have no picture, so young children's tiles showed a star; a chore's picture now comes from its name when none is chosen, as the chore editor's From the name already showed.
- The review's Import bar floated above the bottom: a sticky box keeps clear of the Settings page's padding, and the page reserved more below it.
- The review's People hint said "the plan" for a PlanaVista file.

**Files:**
- Modify: `custom_components/planavista/frontend/src/core/household.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts`, `custom_components/planavista/frontend/src/modules/chores/picture-words.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts`, `custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts`, `custom_components/planavista/frontend/dist/planavista-cards.js`
- Test: `custom_components/planavista/frontend/test/household.test.ts`, `custom_components/planavista/frontend/test/setup-derive.test.ts`, `custom_components/planavista/frontend/test/inbox-quick-add.test.ts`, `custom_components/planavista/frontend/test/import-derive.test.ts`

**Interfaces:**
- Consumes: milestone 5's `PinGate`; Task 10's shared-screen step; Task 9's review.
- Produces: `setupNeedsPin(view, parentSession)`; `pinBeforeSharing(view, shared, session)`; pv-setup `pinGate` and `session` (passed to steps); the card's `keep_setup` PIN sheet ("Enter a parent's PIN to keep setting up"); `chorePicture(icon, name)`; `peopleHint(format)`.

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/household.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/household.test.ts b/custom_components/planavista/frontend/test/household.test.ts
index 31572d6..349dae6 100644
--- a/custom_components/planavista/frontend/test/household.test.ts
+++ b/custom_components/planavista/frontend/test/household.test.ts
@@ -12,6 +12,7 @@ import {
   roleFields,
   roleOf,
   settingsAccess,
+  setupNeedsPin,
   takenColors,
 } from '../src/core/household';
 
@@ -68,6 +69,21 @@ describe('settingsAccess', () => {
   });
 });
 
+describe('setupNeedsPin (spec 9.4, 14.7)', () => {
+  it("asks for a parent's PIN to keep setting up when parent mode ends on a shared screen", () => {
+    expect(setupNeedsPin(view('shared', false), false)).toBe(true);
+    expect(setupNeedsPin(view('other', false), false)).toBe(true);
+  });
+
+  it("doesn't ask in parent mode, on an admin's or a parent's own screen, or without a usable household", () => {
+    expect(setupNeedsPin(view('shared', false), true)).toBe(false);
+    expect(setupNeedsPin(view('admin', true), false)).toBe(false);
+    expect(setupNeedsPin(view('parent', true), false)).toBe(false);
+    expect(setupNeedsPin(null, false)).toBe(false);
+    expect(setupNeedsPin(view('shared', false, [BLAIR, CASEY]), false)).toBe(false);
+  });
+});
+
 describe('people helpers', () => {
   it('maps roles to age group and parent and back', () => {
     expect(roleOf(ALEX)).toBe('parent');
```

`custom_components/planavista/frontend/test/setup-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/setup-derive.test.ts b/custom_components/planavista/frontend/test/setup-derive.test.ts
index f335acf..524d154 100644
--- a/custom_components/planavista/frontend/test/setup-derive.test.ts
+++ b/custom_components/planavista/frontend/test/setup-derive.test.ts
@@ -1,5 +1,7 @@
 import { describe, expect, it } from 'vitest';
-import { previewColumns, previewTotal } from '../src/modules/chores/setup/setup-derive';
+import { pinBeforeSharing, previewColumns, previewTotal } from '../src/modules/chores/setup/setup-derive';
+import type { HouseholdView } from '../src/core/household';
+import type { Session } from '../src/core/session';
 import { MEMBERS, board, column, item } from './chores-fixtures';
 
 describe('the board as setup shows it', () => {
@@ -32,3 +34,19 @@ describe('the board as setup shows it', () => {
     );
   });
 });
+
+describe('marking this screen as shared during setup (spec 9.7, 14.7)', () => {
+  const view = (kind: string, shared: boolean) => ({ account: { kind, shared } } as unknown as HouseholdView);
+  const parent = { memberId: 'blair', parent: true } as unknown as Session;
+
+  it("asks for a parent's PIN first, so the rest of setup still saves", () => {
+    expect(pinBeforeSharing(view('admin', false), true, null)).toBe(true);
+    expect(pinBeforeSharing(view('parent', false), true, null)).toBe(true);
+  });
+
+  it('needs nothing more in parent mode, for a screen already shared, or for No', () => {
+    expect(pinBeforeSharing(view('admin', false), true, parent)).toBe(false);
+    expect(pinBeforeSharing(view('shared', true), true, null)).toBe(false);
+    expect(pinBeforeSharing(view('admin', false), false, null)).toBe(false);
+  });
+});
```

`custom_components/planavista/frontend/test/inbox-quick-add.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/inbox-quick-add.test.ts b/custom_components/planavista/frontend/test/inbox-quick-add.test.ts
index 99649e5..0ffcc91 100644
--- a/custom_components/planavista/frontend/test/inbox-quick-add.test.ts
+++ b/custom_components/planavista/frontend/test/inbox-quick-add.test.ts
@@ -10,7 +10,7 @@ import {
   withWho,
   worthLine,
 } from '../src/modules/chores/quick-add';
-import { pictureFor } from '../src/modules/chores/picture-words';
+import { chorePicture, pictureFor } from '../src/modules/chores/picture-words';
 import type { ChoreRequest } from '../src/modules/chores/chores-types';
 import { MEMBERS, TODAY } from './chores-fixtures';
 
@@ -114,3 +114,14 @@ describe('pictureFor', () => {
     expect(pictureFor('Book club', '📅')).toBe('📅');
   });
 });
+
+describe('chorePicture (spec 13.4, 14.4)', () => {
+  it("shows the picture a parent chose, else one from the name, as Settings' From the name does", () => {
+    expect(chorePicture('🛏️', 'Make your bed')).toBe('🛏️');
+    expect(chorePicture(null, 'Set the table')).toBe('🍴');
+    expect(chorePicture(undefined, 'Tidy toys')).toBe('🧸');
+    expect(chorePicture('', 'Feed the fish')).toBe('🐠');
+    expect(chorePicture('mdi:broom', 'Sweep the porch')).toBe('🧹');
+    expect(chorePicture(null, 'Something new')).toBe('⭐');
+  });
+});
```

`custom_components/planavista/frontend/test/import-derive.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/import-derive.test.ts b/custom_components/planavista/frontend/test/import-derive.test.ts
index 114cca0..d8c5453 100644
--- a/custom_components/planavista/frontend/test/import-derive.test.ts
+++ b/custom_components/planavista/frontend/test/import-derive.test.ts
@@ -1,8 +1,7 @@
 import { readFileSync } from 'node:fs';
 import { describe, expect, it } from 'vitest';
 import {
-  ImportPreview, activityLine, byCategory, emptyChoices, fileLine, importSummary, importedText, lookLines, matchOf, missingAges,
-  onBoardOf, personLine, sections, tiles,
+  activityLine, byCategory, emptyChoices, fileLine, importedText, ImportPreview, importSummary, lookLines, matchOf, missingAges, onBoardOf, peopleHint, personLine, sections, tiles,
 } from '../src/modules/chores/settings/import-derive';
 import { MEMBERS } from './chores-fixtures';
 
@@ -81,3 +80,10 @@ describe('the review page', () => {
       .toBe('Imported. Nothing needed changing.');
   });
 });
+
+describe('the people hint', () => {
+  it('says where bedtimes and sleep came from: the plan, or the PlanaVista file', () => {
+    expect(peopleHint('household-hours/v1')).toBe('Matched by name; pick someone else to change it. Bedtimes and sleep come from the plan.');
+    expect(peopleHint('planavista.household/v1')).toBe('Matched by name; pick someone else to change it. Bedtimes and sleep come from the file.');
+  });
+});
```

- [ ] **Step 2: Run them.** `npx vitest run test/household.test.ts test/setup-derive.test.ts test/inbox-quick-add.test.ts test/import-derive.test.ts` Expected: FAIL: `setupNeedsPin`, `pinBeforeSharing`, `chorePicture`, and `peopleHint` are not functions.

- [ ] **Step 3: Keep parent mode through setup on a shared screen.**

`custom_components/planavista/frontend/src/core/household.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/core/household.ts b/custom_components/planavista/frontend/src/core/household.ts
index 617f0f1..b08d8ac 100644
--- a/custom_components/planavista/frontend/src/core/household.ts
+++ b/custom_components/planavista/frontend/src/core/household.ts
@@ -171,6 +171,16 @@ export function settingsAccess(view: HouseholdView | null, isAdmin: boolean): Se
   return 'none';
 }
 
+/**
+ * Whether setup, open on this screen, has to ask for a parent's PIN to keep
+ * saving (spec 9.4, 14.7): on a shared screen setup runs in parent mode, and
+ * parent mode ends after two quiet minutes. Without a parent's PIN to ask
+ * for, there's nothing to ask.
+ */
+export function setupNeedsPin(view: HouseholdView | null, parentSession: boolean): boolean {
+  return !parentSession && settingsAccess(view, false) === 'pin';
+}
+
 export function calendarsOf(memberId: string, calendars: CalendarLink[]): CalendarLink[] {
   return calendars.filter(cal => cal.member_id === memberId);
 }
```

`custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts b/custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts
index 9a985bf..a933ed6 100644
--- a/custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/setup/setup-derive.ts
@@ -1,4 +1,5 @@
-import { Member, inOrder } from '../../../core/household';
+import { HouseholdView, Member, inOrder } from '../../../core/household';
+import type { Session } from '../../../core/session';
 import type { Board } from '../chores-types';
 
 /** A chore that isn't saved yet, shown in the preview as the parent picks it. */
@@ -42,3 +43,12 @@ export function previewTotal(columns: PreviewColumn[], board: Board | null): str
   const done = board?.household.done ?? 0;
   return `${Math.min(done, due)} of ${due} ${due === 1 ? 'chore' : 'chores'} done today`;
 }
+
+/**
+ * Whether Continue on "Is this a shared family screen?" asks for a parent's
+ * PIN first (spec 9.7): marking this account shared takes away its own say
+ * in Settings, so setup's remaining saves need parent mode.
+ */
+export function pinBeforeSharing(view: HouseholdView, shared: boolean, session: Session | null): boolean {
+  return shared && !view.account.shared && !session?.parent;
+}
```

`custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
index 1841723..649681b 100644
--- a/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/setup/pv-setup-shared-screen.ts
@@ -6,20 +6,28 @@ import { baseStyles, buttonStyles } from '../../../styles/shared';
 import { HouseholdView, inOrder } from '../../../core/household';
 import type { HouseholdApi } from '../../../core/household-client';
 import type { Layout } from '../../../core/layout';
+import type { PinGate } from '../../../core/pin-gate';
+import type { Session } from '../../../core/session';
 import { errorMessage } from '../../../core/ws-api';
+import { pinBeforeSharing } from './setup-derive';
 import '../../../core/pv-member-avatar';
 import '../../../shell/settings/pin-actions';
 
 /**
  * pv-setup-shared-screen: Is this a shared family screen? (spec 14.7, 9.7).
  * On yes, parents set their PINs here, and an admin account is flagged
- * (not blocked): a non-admin account is safer on a shared screen.
+ * (not blocked): a non-admin account is safer on a shared screen. Marking
+ * this account shared asks for a parent's PIN first, so the rest of setup
+ * saves in parent mode.
  */
 export class PvSetupSharedScreen extends LitElement {
   @property({ attribute: false }) hass!: HomeAssistant;
   @property({ attribute: false }) household: HouseholdView | null = null;
   @property({ attribute: false }) api!: HouseholdApi;
   @property({ type: String }) layout: Layout = 'landscape';
+  /** The card's PIN sheet, and the parent mode it starts. */
+  @property({ attribute: false }) pinGate?: PinGate;
+  @property({ attribute: false }) session: Session | null = null;
 
   @state() private _shared: boolean | null = null;
   @state() private _message = '';
@@ -41,6 +49,10 @@ export class PvSetupSharedScreen extends LitElement {
       this._message = "Set a PIN for a parent first, so someone can open Settings here.";
       return false;
     }
+    if (pinBeforeSharing(view, shared, this.session)) {
+      const parents = view.members.filter(m => m.parent && m.has_pin);
+      if (!this.pinGate || !(await this.pinGate.ask(parents, "Who's finishing setup?"))) return false;
+    }
     try {
       if (shared !== view.account.shared) await this.api.setSharedScreen(shared);
       return true;
```

`custom_components/planavista/frontend/src/shell/setup/pv-setup.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
index 3ffd760..d7c8900 100644
--- a/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
+++ b/custom_components/planavista/frontend/src/shell/setup/pv-setup.ts
@@ -9,6 +9,8 @@ import type { HouseholdView } from '../../core/household';
 import { HouseholdApi, errorCode } from '../../core/household-client';
 import type { Layout } from '../../core/layout';
 import type { ModuleService } from '../../core/module-registry';
+import type { PinGate } from '../../core/pin-gate';
+import type { Session } from '../../core/session';
 import { saveErrorMessage } from '../../core/page-host';
 import { STEP_CHANGE, SetupContext, SetupPatch, SetupStep, resumeIndex, setupRegistry } from '../../core/settings-registry';
 import { mergePatch, onlySteps, stepAfter, withPatch } from '../../core/setup-flow';
@@ -62,6 +64,9 @@ export class PvSetup extends LitElement {
   /** The card's module services (chores steps read the chores feed and call its commands). */
   @property({ attribute: false }) services: Record<string, ModuleService> = {};
   @property({ type: Number }) revision = 0;
+  /** The card's PIN sheet and parent mode (a step that makes this a shared screen asks for a parent's PIN). */
+  @property({ attribute: false }) pinGate?: PinGate;
+  @property({ attribute: false }) session: Session | null = null;
   /** A short setup: only these steps (their ids). */
   @property({ attribute: false }) only: string[] | null = null;
   /** Where Back on a short setup's first step goes ("Settings"). */
@@ -308,6 +313,8 @@ export class PvSetup extends LitElement {
               .drafts=${this.drafts}
               .services=${this.services}
               .revision=${this.revision}
+              .pinGate=${this.pinGate}
+              .session=${this.session}
               mode="setup"
             ></${tag}>
           `)}
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 5711b48..dccd980 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -23,7 +23,7 @@ import {
   moduleRegistry,
   resolveModules,
 } from '../core/module-registry';
-import { HouseholdView, Member, SettingsAccess, parentsWithPins, settingsAccess } from '../core/household';
+import { HouseholdView, Member, SettingsAccess, parentsWithPins, settingsAccess, setupNeedsPin } from '../core/household';
 import type { PinGate } from '../core/pin-gate';
 import type { Session } from '../core/session';
 import { HouseholdApi, UnlockResult } from '../core/household-client';
@@ -50,7 +50,7 @@ import './setup/pv-setup';
 
 /** A sheet the card shows over everything: a PIN, or why there is no way in. */
 type CardSheet =
-  | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue'; heading: string }
+  | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue' | 'keep_setup'; heading: string }
   | { kind: 'pin'; purpose: 'module'; heading: string; members: Member[]; resolve: (unlocked: boolean) => void }
   | { kind: 'no_pin' };
 
@@ -399,6 +399,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   updated(changedProps: PropertyValues) {
     super.updated(changedProps);
     this._guardSettings();
+    this._guardSetup();
   }
 
   private _onOnboardingComplete(event?: CustomEvent<{ module?: string }>) {
@@ -497,6 +498,11 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     if (sheet?.kind === 'pin' && sheet.purpose === 'module') sheet.resolve(false);
     // Without parent mode, Settings can't stay open on this screen.
     if (sheet?.kind === 'pin' && sheet.purpose === 'continue') this._onSettingsClose();
+    // Setup can't save without parent mode here; it picks up at the same step next time.
+    if (sheet?.kind === 'pin' && sheet.purpose === 'keep_setup') {
+      this._wizardOpen = false;
+      this._flow = null;
+    }
   }
 
   /** Settings stays open only while this account may use it, or parent mode is on. */
@@ -512,6 +518,17 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     this._onSettingsClose();
   }
 
+  /**
+   * Setup on a screen that needs a parent's PIN runs in parent mode. When
+   * parent mode ends halfway (two quiet minutes), ask for a PIN to keep going
+   * rather than let every save fail.
+   */
+  private _guardSetup() {
+    if (!(this._wizardOpen || this._flow) || this._sheet || !this._household.ready) return;
+    if (!setupNeedsPin(this._household.view, !!this._session.session?.parent)) return;
+    this._sheet = { kind: 'pin', purpose: 'keep_setup', heading: "Enter a parent's PIN to keep setting up" };
+  }
+
   private _closeSheet() {
     this._sheet = null;
     const opener = this._sheetOpener;
@@ -636,6 +653,8 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .drafts=${this._drafts}
               .services=${this._services}
               .revision=${this._serviceRevision}
+              .pinGate=${this._pinGate}
+              .session=${this._session.session}
               @onboarding-complete=${this._onOnboardingComplete}
             ></pv-setup>
           ` : this._renderSetupCard()}
@@ -686,6 +705,8 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
               .drafts=${this._drafts}
               .services=${this._services}
               .revision=${this._serviceRevision}
+              .pinGate=${this._pinGate}
+              .session=${this._session.session}
               .only=${this._flow}
               cancelLabel="Settings"
               @onboarding-complete=${this._onFlowComplete}
```

- [ ] **Step 4: Give imported chores pictures, and fix the review's bar and hint.**

`custom_components/planavista/frontend/src/modules/chores/picture-words.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/picture-words.ts b/custom_components/planavista/frontend/src/modules/chores/picture-words.ts
index ee28bc8..51dcfab 100644
--- a/custom_components/planavista/frontend/src/modules/chores/picture-words.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/picture-words.ts
@@ -56,3 +56,11 @@ export function pictureFor(text: string, fallback = '⭐'): string {
   }
   return fallback;
 }
+
+/**
+ * A chore's picture: the one a parent chose, else one from its name, as the
+ * chore editor's "From the name" shows (imported and spoken chores have none).
+ */
+export function chorePicture(icon: string | null | undefined, name: string): string {
+  return icon && !icon.startsWith('mdi:') ? icon : pictureFor(name);
+}
```

`custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts
index ba55c59..2f8e6c5 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chore-tile.ts
@@ -8,6 +8,7 @@ import '../../core/pv-ring';
 import type { HoldDetail } from './pv-chore-item';
 import type { RowModel } from './board-derive';
 import { rowChange } from './hold-state';
+import { chorePicture } from './picture-words';
 
 /** The picture for a chore: its emoji, or a star when it has none (spec 7.3: the icon is also the picture tile). */
 export function pictureOf(icon: string | null | undefined): string {
@@ -310,7 +311,7 @@ export class PvChoreTile extends LitElement {
           </span>
         ` : nothing}
         <pv-ring size=${ring} .progress=${fill} color=${this.color}>
-          <span class="picture" aria-hidden="true">${pictureOf(row.icon)}</span>
+          <span class="picture" aria-hidden="true">${chorePicture(row.icon, row.name)}</span>
         </pv-ring>
         <span class="name">${row.name}</span>
         ${pending
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
index 69e3939..4d0cbd3 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-day-sheet.ts
@@ -10,7 +10,7 @@ import { StatusBadge, itemBadge, pastBadge } from '../../core/status-map';
 import { SheetMotion } from '../../shell/sheet-motion';
 import { choresStyles } from './chores-styles';
 import type { DayView, ItemView, PastItem } from './chores-types';
-import { pictureOf } from './pv-chore-tile';
+import { chorePicture } from './picture-words';
 
 const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
@@ -154,7 +154,7 @@ export class PvChoresDaySheet extends LitElement {
               const badge = this._badge(item);
               return html`
                 <li>
-                  <span class="pic" aria-hidden="true">${pictureOf(item.icon)}</span>
+                  <span class="pic" aria-hidden="true">${chorePicture(item.icon, item.name)}</span>
                   <span class="name">${item.name}</span>
                   ${badge ? html`<span class="badge ${badge.tone}">${badge.glyph ? `${badge.glyph} ` : ''}${badge.words}</span>` : nothing}
                   ${isPast(item) && item.status === 'missed' && this.canExcuse ? html`
```

`custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts b/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
index b709d92..f479da1 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/chores-list-derive.ts
@@ -1,7 +1,7 @@
 import type { Member } from '../../../core/household';
 import { parseRule, ruleText, shortDate } from '../../../core/recurrence';
 import type { Activity, Band, ChoresSettings } from '../chores-types';
-import { pictureFor } from '../picture-words';
+import { chorePicture } from '../picture-words';
 import { checkoffStars } from '../worth';
 
 /** The Chores list's groups, by rhythm (spec 14.3). */
@@ -135,7 +135,7 @@ export function choreRow(
   return {
     id: activity.id,
     name: activity.name,
-    picture: activity.icon || pictureFor(activity.name),
+    picture: chorePicture(activity.icon, activity.name),
     rhythm: rhythmText(activity, today, timeFormat),
     tags,
     stars: planOnly(activity) ? null : checkoffStars(activity, settings.minutes_per_star),
```

`custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts b/custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts
index f3bd32c..0a9e871 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/import-derive.ts
@@ -57,6 +57,12 @@ export interface ImportChoices {
 
 export const RESTORE_FORMAT = 'planavista.household/v1';
 
+/** The line under People: how matching works, and where bedtimes and sleep came from. */
+export function peopleHint(format: string): string {
+  const from = format === RESTORE_FORMAT ? 'the file' : 'the plan';
+  return `Matched by name; pick someone else to change it. Bedtimes and sleep come from ${from}.`;
+}
+
 function list(names: string[]): string {
   if (names.length <= 2) return names.join(' and ');
   return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
index b15f423..b7c3bea 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-preview.ts
@@ -6,7 +6,7 @@ import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
 import { AGE_GROUP_CHOICES, AgeGroup, Member } from '../../../core/household';
 import type { Layout } from '../../../core/layout';
 import {
-  CATEGORY_ICONS, ImportChoices, ImportPreview, PreviewActivity, RESTORE_FORMAT, activityLine, ageOf, byCategory,
+  CATEGORY_ICONS, ImportChoices, ImportPreview, PreviewActivity, RESTORE_FORMAT, activityLine, ageOf, byCategory, peopleHint,
   emptyChoices, lookLines, matchOf, onBoardOf, personLine, sections, tiles,
 } from './import-derive';
 import { pictureFor } from '../picture-words';
@@ -239,7 +239,7 @@ export class PvImportPreview extends LitElement {
           `;
         })}
       </div>
-      <p class="hint">Matched by name; pick someone else to change it. Bedtimes and sleep come from the plan.</p>
+      <p class="hint">${peopleHint(this.preview.file.format)}</p>
     `;
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts
index ad97a3a..909b39c 100644
--- a/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/settings/pv-import-review.ts
@@ -43,7 +43,6 @@ export class PvImportReview extends LitElement {
     css`
       :host {
         display: block;
-        padding-bottom: 96px;
       }
 
       .file {
@@ -68,7 +67,8 @@ export class PvImportReview extends LitElement {
 
       .bar {
         position: sticky;
-        bottom: 0;
+        /* Flush with the bottom: a sticky box keeps clear of the Settings page's 40 px bottom padding otherwise. */
+        bottom: -40px;
         display: flex;
         align-items: center;
         flex-wrap: wrap;
```

- [ ] **Step 5: Rebuild the bundle.** `npm run build`.
- [ ] **Step 6: Run them again.** Same command. Expected: `40 passed`.
- [ ] **Step 7: Run both suites.** Expected: tsc clean, `720 passed`; the backend suite, `1040 passed`; the copy check passes.
- [ ] **Step 8: Check on the dev Home Assistant.** `bash scripts/dev-ha.sh deploy`, then in portrait at 800 by 1280: a new household with "Yes, the whole family uses it" asks for a parent's PIN on Continue and finishes setup; ending parent mode on the Look step brings up "Enter a parent's PIN to keep setting up"; an imported plan's young child's tiles show 🍴 and 🧸; the review's bar sits flush with the bottom when scrolled to the top, the middle, and the end.
- [ ] **Step 9: Commit.** Message `fix(card): setup on a shared screen keeps parent mode, imported chores get pictures, and the review's bar sits flush; rebuild the bundle` with the trailers.
