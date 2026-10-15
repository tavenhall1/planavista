# Milestone 10, the Goal Surprise: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a person's stars reach their goal, from any source, a wrapped present waits on their own screen, wiggling every few seconds, until they hold it open; the hold is the first act of a full-screen reveal of their reward. Parents hear that a surprise is waiting. The branch also carries release 0.10.0's version and docs.

**Architecture:** see the design, sections 3 to 5 (`docs/superpowers/specs/2026-10-13-goal-surprise-design.md`). The chores engine wraps and removes surprises with one rule (`settle_surprises`), the runtime runs it before every apply, the rewards store keeps them (`surprises`), and `planavista/chores/surprise/open` opens one on the child's screen (`may_open_surprise`). The card's rules are pure (`surprise-derive.ts`); `pv-surprise-present` waits and holds, and `pv-surprise-reveal` plays the reveal, which the card shows outside `ha-card` through `pv-fullscreen`.

**Tech Stack:** TypeScript 5.7 with Lit 3, Rollup, vitest (node environment, `TZ=America/Chicago`); Python 3.14 and Home Assistant 2026.10.0 in Docker, with backend tests from pytest-homeassistant-custom-component in Docker (`scripts/test-backend.sh`).

**Spec:** `docs/superpowers/specs/2026-10-13-goal-surprise-design.md` (decisions D1 to D11, sections 3 to 8).

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- Rollback-safe data: one top-level field added to the rewards store (`surprises`), normalized on load; 0.9.0's normalizer keeps unknown top-level fields. Nothing is renamed or removed.
- Public surface: the member's chores event entity gains the `goal_reached` event type; new `planavista/chores/surprise/open`; the board feed's members gain `surprise`; diagnostics count surprises. Element names stay.
- A parent's own phone never opens a child's surprise (unless the household has no shared screens); PINs are never accepted through actions, logged, exported, or traced.
- Touch targets are at least 48 px; one scroll area per screen; reduced motion keeps the meaning; sound only with the household's Sound on.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, and docs.
- Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01Ng97wkffZAqTzDTrYUzS7m`
- Don't merge, tag, or publish a release in this plan. Pushing the milestone branch for CI is allowed. The release follows the review, the fix pass, and the demo.
- Frontend: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`; the bundle (`npm run build`) is committed in Task 5 and must match the source. Backend: `bash scripts/test-backend.sh` (from the repository root).
- Paths are relative to the repository root.

## Review Focus

1. **Stars landing from anywhere wrap a surprise once, and only once:** a parent's OK from a phone, the day-end approval, bonus stars, a lowered price, a goal picked already in reach; removal when spent, changed, deleted, or no longer theirs; two screens at once. Pinned by `tests/test_surprise.py`.
2. **Only the child's screen opens it:** a parent's or a sibling's own login sees "Waiting for Dana to open it" and the backend refuses `not_their_screen`; a household with no shared screens lets any login. Pinned by `tests/test_surprise.py` and `test/surprise-derive.test.ts`.
3. **The reveal under real touch:** Safari's click sent to the element under the finger after the hold, a tap to skip, Escape, reduced motion, sound off, over Home Assistant's own bars and in kiosk mode, at iPad and iPhone sizes with their insets. Pinned by `test/surprise-places.test.ts`; walked on a Home Assistant copy.
4. **Ask for it** on a shared screen for a child with a PIN, and Get it for a reward that needs no OK, both closing the reveal before the usual redeem.
5. **Old backends and reloads:** a feed without `surprise` shows nothing; a reload mid-reveal leaves the surprise opened and Watch it again available; other screens' presents go once it is opened.

## Plan rulings

Every module and every test in Tasks 1 to 5 was built and run on a scratch branch before this plan was written (1151 backend tests and 1363 frontend tests at the end, each task's tests run at its own commit), and each screen was checked on a Home Assistant copy. These rulings were made while building it.

- **R1. One place settles surprises.** The runtime settles them before it applies any outcome (`async_apply`) and after a member sync, so every path that moves stars or goals (actions, the 3 AM boundary, reward edits, a goal picked or changed) wraps or removes them the same way.
- **R2. Out of reach means gone, opened or not.** Spending the stars, a changed goal, a deleted reward, or a reward no longer for them removes the surprise; saving up again wraps a new one. A raised price still covered keeps it.
- **R3. Opening is the backend's; Watch it again is the card's.** The stamp is kept so every screen agrees; replaying changes nothing.
- **R4. Who opens it:** shared-screen rules (`shared` or `other`) or the member's own login; any login when the household has no shared screens; never an automation. No PIN: opening changes nothing but the stamp.
- **R5. The reveal is the module's element, shown by the card outside `ha-card`** through a `pv-fullscreen` event, because `ha-card`'s `container-type` makes it the containing block of any fixed layer inside it; the card stays free of chores code.
- **R6. The hold's pose is drawn each frame** as an inline transform (`holdPose`), released early it springs back, and the rectangle of the finished pose is the reveal's first frame, so there is no cut.
- **R7. The reveal skips to the end only on a press that began on it** (`_pressed`): the hold's lifting finger lands on it in Safari.
- **R8. The box's fade and its drop are two animations.** A transform composited with `add` also adds the opacity, so the box stayed visible; the drop fills forwards only, so it can't freeze the shakes before it.
- **R9. Ask for it closes the reveal first,** then runs the usual redeem (`_redeemAs`), whose PIN sheet would otherwise sit under the reveal.
- **R10. The prototype ran on its own Home Assistant copy** (`127.0.0.1:8129`, a copy of the dev volume with Dev unmarked as shared), since the owner tests on the dev Home Assistant.

---

### Task 0: Branch, baseline, and the plan (controller)

- [ ] **Step 1: Branch from main.** `git checkout main && git pull --ff-only && git checkout -b feat/m10-goal-surprise` (main is at `8237397`: 0.9.0 with the first adversarial review's fixes).
- [ ] **Step 2: The design.** `git cherry-pick 3a3ae1b` (the design document, `docs: the goal surprise design (milestone 10)`; no code).
- [ ] **Step 3: Baseline.** `bash scripts/test-backend.sh -q` Expected: `1123 passed`. `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1341 passed`.
- [ ] **Step 4: Commit this plan.** `git add docs/superpowers/plans/2026-10-13-m10-goal-surprise.md && git commit` with the message `docs: plan milestone 10, the goal surprise` and the two trailer lines; push the branch with `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/m10-goal-surprise`.

---

### Task 1: The goal surprise in the backend: wrapping, opening, the feed, the event, and the parents' note

Spec 3.1, 3.4, 3.8, 4, D1 to D3, D6, D11.

**Files:**
- Create: `tests/test_surprise.py`
- Modify: `custom_components/planavista/chores/access.py`, `custom_components/planavista/chores/engine.py`, `custom_components/planavista/chores/model.py`, `custom_components/planavista/chores/notify.py`, `custom_components/planavista/chores/runtime.py`, `custom_components/planavista/chores/store.py`, `custom_components/planavista/chores/websocket.py`, `custom_components/planavista/diagnostics.py`, `custom_components/planavista/household/permissions.py`, `custom_components/planavista/strings.json`, `custom_components/planavista/translations/en.json`, `tests/test_chores_entities.py`

- [ ] **Step 1: Write the failing tests.**

`tests/test_chores_entities.py`:

```diff
diff --git a/tests/test_chores_entities.py b/tests/test_chores_entities.py
index 03b65a7..678dc9a 100644
--- a/tests/test_chores_entities.py
+++ b/tests/test_chores_entities.py
@@ -81,7 +81,7 @@ async def test_casey_at_tuesday_afternoon(hass: HomeAssistant, chores: Any) -> N
     assert hass.states.get("sensor.household_chores_left").state == "8"
     assert hass.states.get("sensor.household_approvals_waiting").state == "0"
     event = hass.states.get("event.casey_chores")
-    assert event.attributes["event_types"] == ["completed", "approved", "sent_back", "undone", "missed", "redeemed"]
+    assert event.attributes["event_types"] == ["completed", "approved", "sent_back", "undone", "missed", "redeemed", "goal_reached"]
 
 
 async def test_a_check_off_updates_every_projection(hass: HomeAssistant, chores: Any) -> None:
```

`tests/test_surprise.py` (new):

```python
"""The goal surprise (milestone 10): wrapped when a goal is reached, opened once on the child's screen."""
from __future__ import annotations

from datetime import timedelta

import pytest

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.chores.store import normalize_rewards
from custom_components.planavista.household.permissions import Account, may_open_surprise

from .chores_sample import MEMBERS, SCENE, sample_engine

FISH = "feed_the_fish|dana|day:2026-10-13|0"


def _with_goal(goal: str | None, who: str = "dana") -> list[dict]:
    return [dict(m, goal=goal) if m["id"] == who else dict(m) for m in MEMBERS]


def _engine(goal: str | None = "ice_cream_trip", cost: int = 3, **settings):
    engine = sample_engine(members=_with_goal(goal), settings=settings or None)
    engine.save_reward({"name": "Ice cream trip", "icon": "🍦", "cost": cost})
    return engine


def _types(out) -> list[tuple[str, str]]:
    return [(e.type, e.member) for e in out.events]


def test_bonus_stars_that_reach_the_goal_wrap_a_surprise_once() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=2, reason="Great week", by="alex")
    assert _types(engine.settle_surprises(SCENE)) == []
    engine.award_stars(SCENE, member="dana", stars=1, reason="Helped", by="alex")
    out = engine.settle_surprises(SCENE)
    assert _types(out) == [("goal_reached", "dana")]
    assert out.events[0].data == {"member": "dana", "reward": "ice_cream_trip", "reward_name": "Ice cream trip", "stars": 3}
    assert out.changed == {"rewards"}
    assert engine.rewards["surprises"]["dana"] == {
        "reward": "ice_cream_trip", "cost": 3, "wrapped": "2026-10-13T16:10:00-05:00", "opened": None,
    }
    # Settling again changes nothing and fires nothing.
    again = engine.settle_surprises(SCENE + timedelta(minutes=5))
    assert (again.events, again.changed) == ([], set())


def test_a_parents_ok_that_pays_the_last_star_wraps_it() -> None:
    engine = _engine(cost=1)
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    assert _types(engine.settle_surprises(SCENE)) == []  # waiting for OK earns nothing yet
    [request] = engine.open_requests()
    engine.review(SCENE + timedelta(hours=2), request_id=request["id"], allow=True, by="alex", source="notification")
    out = engine.settle_surprises(SCENE + timedelta(hours=2))
    assert _types(out) == [("goal_reached", "dana")]


def test_the_day_end_approval_wraps_it_while_the_child_sleeps() -> None:
    engine = _engine(cost=1, auto_approve="day_end")
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.catch_up(SCENE + timedelta(hours=12))
    assert _types(engine.settle_surprises(SCENE + timedelta(hours=12))) == [("goal_reached", "dana")]


def test_a_lowered_price_or_a_goal_already_in_reach_wraps_it() -> None:
    engine = _engine(goal=None, cost=5)
    engine.award_stars(SCENE, member="dana", stars=4, reason="Bonus", by="alex")
    engine.set_members(_with_goal("ice_cream_trip"))
    assert _types(engine.settle_surprises(SCENE)) == []
    engine.save_reward({"cost": 4}, reward_id="ice_cream_trip")
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]


def test_it_goes_away_when_the_goal_is_out_of_reach_and_comes_back_when_saved_again() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.open_surprise(SCENE, member="dana", by="dana")
    # The reward is given: the stars are spent, and the opened surprise goes with them.
    engine.redeem(SCENE, member="dana", reward="ice_cream_trip", by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.review(SCENE, request_id=request["id"], allow=True, by="alex")
    out = engine.settle_surprises(SCENE)
    assert ("dana" in engine.rewards["surprises"], out.changed) == (False, {"rewards"})
    # Saving up for it again wraps a new one.
    engine.award_stars(SCENE, member="dana", stars=3, reason="Another great week", by="alex")
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    assert engine.rewards["surprises"]["dana"]["opened"] is None


@pytest.mark.parametrize("change", ["goal_cleared", "goal_changed", "reward_deleted", "not_for_them", "stars_taken"])
def test_an_unopened_surprise_goes_away_quietly(change: str) -> None:
    engine = _engine()
    engine.save_reward({"name": "Zoo day", "icon": "🦁", "cost": 30})
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    if change == "goal_cleared":
        engine.set_members(_with_goal(None))
    elif change == "goal_changed":
        engine.set_members(_with_goal("zoo_day"))
    elif change == "reward_deleted":
        engine.delete_reward("ice_cream_trip")
    elif change == "not_for_them":
        engine.save_reward({"who": ["casey"]}, reward_id="ice_cream_trip")
    else:
        engine.award_stars(SCENE, member="dana", stars=-1, reason="Oops", by="alex")
    out = engine.settle_surprises(SCENE)
    assert (out.events, "dana" in engine.rewards["surprises"]) == ([], False)


def test_a_raised_price_still_covered_keeps_it() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=5, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.save_reward({"cost": 4}, reward_id="ice_cream_trip")
    out = engine.settle_surprises(SCENE)
    assert (out.events, out.changed, engine.rewards["surprises"]["dana"]["cost"]) == ([], set(), 3)


def test_opening_stamps_it_once_and_a_second_open_answers_the_same() -> None:
    engine = _engine()
    with pytest.raises(ChoreError) as err:
        engine.open_surprise(SCENE, member="dana", by="dana")
    assert err.value.code == "no_surprise"
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    first = engine.open_surprise(SCENE + timedelta(minutes=1), member="dana", by="dana")
    assert (first.result, first.changed) == ("opened", {"rewards"})
    second = engine.open_surprise(SCENE + timedelta(minutes=2), member="dana", by="kitchen")
    assert (second.result, second.changed) == ("opened", set())
    assert engine.rewards["surprises"]["dana"]["opened"] == "2026-10-13T16:11:00-05:00"


def test_the_board_feed_shows_each_members_surprise() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    members = engine.board(SCENE)["members"]
    assert members["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": False}
    assert members["casey"]["surprise"] is None
    engine.open_surprise(SCENE, member="dana", by="dana")
    assert engine.board(SCENE)["members"]["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": True}


def test_the_store_keeps_good_surprises_and_drops_bad_ones() -> None:
    good = {"reward": "ice_cream_trip", "cost": 3, "wrapped": "2026-10-13T16:10:00-05:00", "opened": None}
    doc = normalize_rewards({"surprises": {"dana": good, "casey": "nope", "alex": {"reward": 4}, 7: good}, "future": 1})
    assert doc["surprises"] == {"dana": good}
    assert doc["future"] == 1
    assert normalize_rewards({})["surprises"] == {}


@pytest.mark.parametrize(("account", "shared_screens", "allowed"), [
    (Account("kitchen", shared=True), 1, True),           # the kitchen tablet
    (Account("guest"), 1, True),                          # linked to no one: shared-screen rules
    (Account("dana_user", member_id="dana"), 1, True),    # the child's own login
    (Account("casey_user", member_id="casey"), 1, False), # a sibling's own login
    (Account("alex_user", member_id="alex", member_is_parent=True), 1, False),  # a parent's phone
    (Account("dev", is_admin=True), 1, False),            # an admin's own login
    (Account("alex_user", member_id="alex", member_is_parent=True), 0, True),   # no shared screens at all
    (Account(None), 0, False),                            # automations never open one
])
def test_who_may_open_it(account: Account, shared_screens: int, allowed: bool) -> None:
    assert may_open_surprise(account, "dana", shared_screens=shared_screens) is allowed


# The runtime, the open command, and the parents' notification ---------------------------------

async def _goal(hass, chores, cost: int = 3) -> None:
    """Dana saves for an ice cream trip that costs `cost` stars."""
    await chores.async_run(lambda e, now: e.save_reward({"name": "Ice cream trip", "icon": "🍦", "cost": cost}))
    household = chores.household
    household.members = [dict(m, goal="ice_cream_trip") if m["id"] == "dana" else m for m in household.members]
    await household.async_save()
    await chores.async_sync_members()
    await hass.async_block_till_done()


async def _bonus(hass, chores, stars: int = 3) -> None:
    await chores.async_run(lambda e, now: e.award_stars(now, member="dana", stars=stars, reason="Great week", by="alex"))
    await hass.async_block_till_done()


async def test_the_runtime_wraps_it_after_any_change_and_reports_the_event(hass, chores) -> None:
    seen: list = []
    chores.async_listen_events(seen.append)
    await _goal(hass, chores)
    await _bonus(hass, chores, 2)
    assert "dana" not in chores.engine.rewards["surprises"]
    await _bonus(hass, chores, 1)
    assert chores.engine.rewards["surprises"]["dana"]["opened"] is None
    assert [(e.type, e.member) for e in seen] == [("goal_reached", "dana")]
    assert chores.engine.board(chores.now())["members"]["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": False}


async def test_a_goal_already_in_reach_wraps_it_when_the_goal_is_picked(hass, chores) -> None:
    await _bonus(hass, chores, 5)
    await _goal(hass, chores)
    assert chores.engine.rewards["surprises"]["dana"]["reward"] == "ice_cream_trip"


async def _client(hass, hass_ws_client, accounts, name: str):
    from .conftest import ws_client_for

    return await ws_client_for(hass, hass_ws_client, accounts[name])


async def test_a_shared_screen_opens_it_and_a_parents_own_login_does_not(hass, chores, accounts, hass_ws_client) -> None:
    from .conftest import ws_command

    chores.household.shared_users.append(accounts["kitchen"].id)
    await chores.household.async_save()
    await _goal(hass, chores)
    await _bonus(hass, chores)
    alex = await _client(hass, hass_ws_client, accounts, "alex")
    refused = await ws_command(alex, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert (refused["success"], refused["error"]["code"]) == (False, "not_their_screen")
    assert refused["error"]["message"] == "Only Dana's own screen or a shared screen opens this."
    casey = await _client(hass, hass_ws_client, accounts, "casey")
    sibling = await ws_command(casey, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert sibling["error"]["code"] == "not_their_screen"
    kitchen = await _client(hass, hass_ws_client, accounts, "kitchen")
    opened = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert (opened["success"], opened["result"]) == (True, {"result": "opened"})
    again = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert again["result"] == {"result": "opened"}
    assert chores.engine.rewards["surprises"]["dana"]["opened"] is not None
    none = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "casey"})
    assert none["error"]["code"] == "no_surprise"


async def test_with_no_shared_screens_any_login_opens_it(hass, chores, accounts, hass_ws_client) -> None:
    from .conftest import ws_command

    await _goal(hass, chores)
    await _bonus(hass, chores)
    alex = await _client(hass, hass_ws_client, accounts, "alex")
    opened = await ws_command(alex, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert opened["result"] == {"result": "opened"}


async def test_parents_hear_once_that_a_goal_was_reached(hass, chores) -> None:
    from pytest_homeassistant_custom_component.common import async_mock_service

    alex = async_mock_service(hass, "notify", "mobile_app_alex_phone")
    household = chores.household
    household.members = [
        {**m, "phones": ["notify.mobile_app_alex_phone"] if m["id"] == "alex" else [], "notify": {"requests": True, "reminders": False}}
        for m in household.members
    ]
    await household.async_save()
    chores.notifier.async_start()
    await _goal(hass, chores)
    await _bonus(hass, chores)
    await _bonus(hass, chores, 1)  # still in reach: no second notification
    goal = [c.data for c in alex if c.data.get("title") == "Dana reached a goal"]
    assert goal == [{
        "title": "Dana reached a goal",
        "message": "🍦 Ice cream trip. There's a surprise waiting on Dana's screen.",
        "data": {"tag": "planavista-goal-dana", "group": "planavista"},
    }]


async def test_diagnostics_count_the_surprises(hass, chores, mock_config_entry) -> None:
    from custom_components.planavista.diagnostics import async_get_config_entry_diagnostics

    await _goal(hass, chores)
    await _bonus(hass, chores)
    found = await async_get_config_entry_diagnostics(hass, mock_config_entry)
    assert found["chores"]["surprises"] == {"waiting": 1, "opened": 0}
```

- [ ] **Step 2: Run them and see them fail.** `bash scripts/test-backend.sh -q tests/test_chores_entities.py tests/test_surprise.py` Expected: the new tests fail (a missing module, export, or command, or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/chores/access.py`:

```diff
diff --git a/custom_components/planavista/chores/access.py b/custom_components/planavista/chores/access.py
index da4b47b..7d2ca8a 100644
--- a/custom_components/planavista/chores/access.py
+++ b/custom_components/planavista/chores/access.py
@@ -64,6 +64,7 @@ MESSAGES: dict[str, str] = {
     "not_missed": "That chore wasn't missed, or it was already excused.",
     "not_for_member": "That reward isn't one they can get.",
     "not_enough_stars": "Not enough stars yet.",
+    "no_surprise": "There's no surprise waiting.",
     "reason_required": "Add a reason.",
     "too_many": "There are too many to add another.",
     "changed": "This changed on another screen.",
```

`custom_components/planavista/chores/engine.py`:

```diff
diff --git a/custom_components/planavista/chores/engine.py b/custom_components/planavista/chores/engine.py
index 46c5367..e3c4b95 100644
--- a/custom_components/planavista/chores/engine.py
+++ b/custom_components/planavista/chores/engine.py
@@ -50,7 +50,7 @@ SECTIONS = ("overdue", "today", "week")
 HISTORY_WEEKS = 6
 RECENT_REDEMPTIONS = 5
 MAX_UNTIL_DAYS = 60
-EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed")
+EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed", "goal_reached")
 _CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
 
 
@@ -834,6 +834,7 @@ class ChoresEngine:
                 "week_stars": week_stars.get(member_id, 0),
                 "chore_minutes": self.chore_minutes(member_id),
                 "away": dict(away) if away else None,
+                "surprise": self._surprise_view(member_id),
             }
         return {
             "date": day.isoformat(),
@@ -1754,6 +1755,65 @@ class ChoresEngine:
         self._ledger(member, stars, reason, now, by=by)
         return Outcome("awarded", {"balance": self.balance(member)}, changed={"rewards"})
 
+    # Goal surprises (milestone 10) -------------------------------------------------------
+
+    def _goal_reward(self, member: Mapping[str, Any]) -> dict[str, Any] | None:
+        """The reward a member is saving for, when it exists and is one they can get."""
+        goal = member.get("goal")
+        reward = self.reward(goal) if isinstance(goal, str) else None
+        if reward is None or (reward.get("who") and member["id"] not in reward["who"]):
+            return None
+        return reward
+
+    def settle_surprises(self, now: datetime) -> Outcome:
+        """Wrap a surprise for each member whose stars reach their goal; take away the rest.
+
+        A surprise for the current goal stays as it is; one whose goal is out of
+        reach (spent, changed, gone) goes, opened or not, so saving up again
+        wraps a new one. Each wrap fires `goal_reached` once.
+        """
+        surprises: dict[str, dict[str, Any]] = self.rewards.setdefault("surprises", {})
+        out = Outcome()
+        for member in self.members:
+            member_id = member["id"]
+            reward = self._goal_reward(member)
+            have = surprises.get(member_id)
+            if reward is not None and self.balance(member_id) >= int(reward["cost"]):
+                if have is not None and have["reward"] == reward["id"]:
+                    continue
+                surprises[member_id] = {
+                    "reward": reward["id"], "cost": int(reward["cost"]), "wrapped": self._stamp(now), "opened": None,
+                }
+                out.events.append(ChoreEvent("goal_reached", member_id, {
+                    "member": member_id, "reward": reward["id"], "reward_name": reward["name"], "stars": int(reward["cost"]),
+                }))
+                out.changed.add("rewards")
+            elif have is not None:
+                del surprises[member_id]
+                out.changed.add("rewards")
+        for member_id in set(surprises) - {m["id"] for m in self.members}:
+            del surprises[member_id]
+            out.changed.add("rewards")
+        return out
+
+    def open_surprise(self, now: datetime, *, member: str, by: str) -> Outcome:
+        """Open a member's waiting surprise; opening it again answers the same and changes nothing."""
+        surprise = self.rewards.setdefault("surprises", {}).get(member)
+        if surprise is None:
+            raise ChoreError("no_surprise")
+        if surprise.get("opened"):
+            return Outcome("opened")
+        surprise["opened"] = self._stamp(now)
+        surprise["opened_by"] = by
+        return Outcome("opened", changed={"rewards"})
+
+    def _surprise_view(self, member_id: str) -> dict[str, Any] | None:
+        """What the board shows of a member's surprise."""
+        surprise = self.rewards.get("surprises", {}).get(member_id)
+        if surprise is None:
+            return None
+        return {"reward": surprise["reward"], "opened": bool(surprise.get("opened"))}
+
     # Rollover (spec 8.9) ----------------------------------------------------------------
 
     def start(self, now: datetime) -> Outcome:
```

`custom_components/planavista/chores/model.py`:

```diff
diff --git a/custom_components/planavista/chores/model.py b/custom_components/planavista/chores/model.py
index 6affb09..b47213c 100644
--- a/custom_components/planavista/chores/model.py
+++ b/custom_components/planavista/chores/model.py
@@ -341,4 +341,4 @@ def default_log() -> dict[str, Any]:
 
 def default_rewards() -> dict[str, Any]:
     """No rewards, no stars."""
-    return {"rewards": [], "ledger": [], "redemptions": []}
+    return {"rewards": [], "ledger": [], "redemptions": [], "surprises": {}}
```

`custom_components/planavista/chores/notify.py`:

```diff
diff --git a/custom_components/planavista/chores/notify.py b/custom_components/planavista/chores/notify.py
index 15ac165..0659c28 100644
--- a/custom_components/planavista/chores/notify.py
+++ b/custom_components/planavista/chores/notify.py
@@ -112,6 +112,7 @@ class ChoresNotifier:
             return
         self._known = {r["id"] for r in self._open_requests()}
         self._unsubs.append(self.runtime.async_listen(self._on_change))
+        self._unsubs.append(self.runtime.async_listen_events(self._on_event))
         self._unsubs.append(self.hass.bus.async_listen(EVENT_ACTION, self._on_action))
         self._schedule_reminder()
 
@@ -207,6 +208,28 @@ class ChoresNotifier:
         if sent.phones:
             self._sent[request["id"]] = sent
 
+    @callback
+    def _on_event(self, event: Any) -> None:
+        """A goal reached: tell the parents a surprise is waiting (milestone 10)."""
+        if event.type == "goal_reached":
+            self.hass.async_create_task(self._async_send_goal(event.member, event.data), eager_start=False)
+
+    async def _async_send_goal(self, member_id: str, data: dict[str, Any]) -> None:
+        member = self.runtime.household.member(member_id) or {}
+        name = member.get("name", member_id)
+        reward = self.runtime.engine.reward(data["reward"]) or {}
+        icon = reward.get("icon")
+        message = {
+            "title": f"{name} reached a goal",
+            "message": f"{icon + ' ' if icon else ''}{data['reward_name']}. There's a surprise waiting on {name}'s screen.",
+            "data": {"tag": f"{TAG_PREFIX}goal-{member_id}", "group": "planavista"},
+        }
+        for parent in self._parents_to_ask():
+            for phone in parent["phones"]:
+                service = self._reachable(phone, parent["id"])
+                if service is not None:
+                    await self.hass.services.async_call("notify", service, message)
+
     async def _async_clear(self, request_id: str, phones: set[str] | None = None) -> None:
         """Take a request's notifications off every phone that got them."""
         sent = self._sent.pop(request_id, None)
```

`custom_components/planavista/chores/runtime.py`:

```diff
diff --git a/custom_components/planavista/chores/runtime.py b/custom_components/planavista/chores/runtime.py
index 3220537..f8013be 100644
--- a/custom_components/planavista/chores/runtime.py
+++ b/custom_components/planavista/chores/runtime.py
@@ -235,6 +235,9 @@ class ChoresRuntime:
 
     async def async_apply(self, outcome: Outcome) -> None:
         """Save what changed, fire the events, and tell everyone."""
+        if self.available:
+            # Whatever changed may have reached someone's goal, or taken it out of reach (milestone 10).
+            outcome.merge(self.engine.settle_surprises(self.now()))
         for name in ("plan", "rewards"):
             if name in outcome.changed:
                 await self.stores.async_save(name, getattr(self.engine, name))
@@ -379,6 +382,8 @@ class ChoresRuntime:
         for member_id in known - set(members):
             if self.available:
                 await self.async_apply(self.engine.unassign_member(member_id))
+        if self.available:
+            await self.async_apply(Outcome())  # a goal picked or changed settles the surprises
         if self.entry is None or not self.enabled:
             self.async_notify()
             return
```

`custom_components/planavista/chores/store.py`:

```diff
diff --git a/custom_components/planavista/chores/store.py b/custom_components/planavista/chores/store.py
index cf64016..6790b7b 100644
--- a/custom_components/planavista/chores/store.py
+++ b/custom_components/planavista/chores/store.py
@@ -100,11 +100,32 @@ def normalize_log(data: object) -> dict[str, Any]:
     return doc
 
 
+def _surprises(value: object) -> dict[str, dict[str, Any]]:
+    """Goal surprises by member (milestone 10); entries that don't make sense are dropped."""
+    if not isinstance(value, Mapping):
+        return {}
+    kept: dict[str, dict[str, Any]] = {}
+    for member, entry in value.items():
+        if not (isinstance(member, str) and isinstance(entry, Mapping)):
+            continue
+        if not (isinstance(entry.get("reward"), str) and isinstance(entry.get("wrapped"), str)):
+            continue
+        cost = entry.get("cost")
+        if not isinstance(cost, int) or isinstance(cost, bool):
+            continue
+        opened = entry.get("opened")
+        if opened is not None and not isinstance(opened, str):
+            continue
+        kept[member] = dict(entry)
+    return kept
+
+
 def normalize_rewards(data: object) -> dict[str, Any]:
     """The stored rewards with missing parts filled in."""
     doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
     for name in ("rewards", "ledger", "redemptions"):
         doc[name] = _records(doc.get(name), name)
+    doc["surprises"] = _surprises(doc.get("surprises"))
     return doc
 
 
```

`custom_components/planavista/chores/websocket.py`:

```diff
diff --git a/custom_components/planavista/chores/websocket.py b/custom_components/planavista/chores/websocket.py
index 5b7df37..0a9ac36 100644
--- a/custom_components/planavista/chores/websocket.py
+++ b/custom_components/planavista/chores/websocket.py
@@ -22,7 +22,7 @@ from homeassistant.util import dt as dt_util
 from ..const import CONF_CALENDARS, VERSION
 from ..coordinator import async_apply_config
 from ..household.members import MemberError, check_parent_pins, import_members
-from ..household.permissions import member_level, parent_level
+from ..household.permissions import may_open_surprise, member_level, parent_level
 from ..household.store import Household
 from ..household.websocket import (
     ERROR_MESSAGES,
@@ -499,6 +499,25 @@ async def ws_reward_redeem(hass: HomeAssistant, connection: websocket_api.Active
         connection.send_result(msg["id"], {"result": out.result, **out.data})
 
 
+@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/surprise/open", vol.Required("member"): str})
+@websocket_api.async_response
+async def ws_surprise_open(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
+    """Open a member's goal surprise: on a shared screen or their own login (milestone 10)."""
+    runtime = _runtime(hass, connection, msg)
+    if runtime is None:
+        return
+    household = runtime.household
+    account = account_for(hass, household, connection.user)
+    if not may_open_surprise(account, msg["member"], shared_screens=len(household.shared_users)):
+        name = (household.member(msg["member"]) or {}).get("name", msg["member"])
+        send_refusal(connection, msg, "not_their_screen", f"Only {name}'s own screen or a shared screen opens this.")
+        return
+    by = account.member_id or source_of(account)
+    out = await _apply(connection, msg, runtime, lambda e, now: e.open_surprise(now, member=msg["member"], by=by))
+    if out is not None:
+        connection.send_result(msg["id"], {"result": out.result})
+
+
 @websocket_api.websocket_command({
     vol.Required("type"): "planavista/stars/award",
     vol.Required("member"): str,
@@ -698,6 +717,7 @@ CHORES_COMMANDS = (
     ws_reward_save,
     ws_reward_delete,
     ws_reward_redeem,
+    ws_surprise_open,
     ws_stars_award,
     ws_stars_history,
     ws_import_preview,
```

`custom_components/planavista/diagnostics.py`:

```diff
diff --git a/custom_components/planavista/diagnostics.py b/custom_components/planavista/diagnostics.py
index 6235453..ba2dc1a 100644
--- a/custom_components/planavista/diagnostics.py
+++ b/custom_components/planavista/diagnostics.py
@@ -75,6 +75,10 @@ async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: PlanaVi
             "summaries": len(engine.log["summaries"]),
             "rewards": len(engine.rewards["rewards"]),
             "ledger": len(engine.rewards["ledger"]),
+            "surprises": {
+                "waiting": sum(1 for s in engine.rewards.get("surprises", {}).values() if not s.get("opened")),
+                "opened": sum(1 for s in engine.rewards.get("surprises", {}).values() if s.get("opened")),
+            },
             "last_day": engine.log.get("last_day"),
             "last_boundary": engine.log.get("last_boundary"),
             "stores": {
```

`custom_components/planavista/household/permissions.py`:

```diff
diff --git a/custom_components/planavista/household/permissions.py b/custom_components/planavista/household/permissions.py
index 2a66e58..d6fc9f8 100644
--- a/custom_components/planavista/household/permissions.py
+++ b/custom_components/planavista/household/permissions.py
@@ -97,3 +97,16 @@ def may_manage_pin(account: Account, session: SessionView | None, target: str) -
     if account.screen_rules and session is not None and session.member_id == target:
         return target
     return None
+
+
+def may_open_surprise(account: Account, member_id: str, *, shared_screens: int) -> bool:
+    """Opening a member's goal surprise (milestone 10): on a shared screen or the member's own login.
+
+    Not on a parent's phone, so a parent checking in from work can't open it for the
+    child; a household with no shared screens lets any login, or nobody could.
+    """
+    if account.kind == "automation":
+        return False
+    if account.screen_rules or account.member_id == member_id:
+        return True
+    return shared_screens == 0
```

`custom_components/planavista/strings.json`:

```diff
diff --git a/custom_components/planavista/strings.json b/custom_components/planavista/strings.json
index 00ee1db..94d4798 100644
--- a/custom_components/planavista/strings.json
+++ b/custom_components/planavista/strings.json
@@ -191,7 +191,8 @@
               "sent_back": "Sent back",
               "undone": "Undone",
               "missed": "Missed",
-              "redeemed": "Redeemed"
+              "redeemed": "Redeemed",
+              "goal_reached": "Goal reached"
             }
           }
         }
```

`custom_components/planavista/translations/en.json`:

```diff
diff --git a/custom_components/planavista/translations/en.json b/custom_components/planavista/translations/en.json
index 00ee1db..94d4798 100644
--- a/custom_components/planavista/translations/en.json
+++ b/custom_components/planavista/translations/en.json
@@ -191,7 +191,8 @@
               "sent_back": "Sent back",
               "undone": "Undone",
               "missed": "Missed",
-              "redeemed": "Redeemed"
+              "redeemed": "Redeemed",
+              "goal_reached": "Goal reached"
             }
           }
         }
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1341 passed`; `bash scripts/test-backend.sh -q` Expected: `1151 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on Home Assistant.** On the prototype's Home Assistant copy: set Dana's goal (`planavista/household/member/prefs` with `goal: ice_cream_trip`) and give her the last star (`planavista/stars/award`); `planavista.chores_rewards` then holds `surprises.dana` with `opened: null`; `planavista/chores/surprise/open` as Kitchen answers `opened`, as Alex's own login `not_their_screen`.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(chores): the goal surprise in the backend

When a member's stars reach their goal reward, from any source, the
engine wraps a surprise (rewards store `surprises`), fires goal_reached
once, and the parents' phones hear about it. It goes away if the goal
falls out of reach. planavista/chores/surprise/open opens it on a shared
screen or the member's own login, never a parent's phone, unless the
household has no shared screens. The board feed shows each member's
surprise; diagnostics count them.
```

---

### Task 2: The surprise's rules in the card

Spec 3.3, 3.4, 3.5, 5.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/surprise-derive.ts`, `custom_components/planavista/frontend/test/surprise-derive.test.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/chores-client.ts`, `custom_components/planavista/frontend/src/modules/chores/chores-types.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/surprise-derive.test.ts` (new):

```ts
import { describe, expect, it } from 'vitest';
import {
  IDLE_MS,
  REVEAL,
  confettiPieces,
  holdPose,
  idleOffset,
  mayOpenSurprise,
  revealWords,
  surpriseOf,
  surpriseWords,
} from '../src/modules/chores/surprise-derive';
import type { BoardMember, Reward } from '../src/modules/chores/chores-types';
import type { HouseholdView } from '../src/core/household';

const ICE_CREAM: Reward = { id: 'ice_cream_trip', name: 'Ice cream trip', icon: '🍦', cost: 3, needs_ok: true, who: [] };
const STICKER: Reward = { id: 'sticker', name: 'Sticker', icon: null, cost: 2, needs_ok: false, who: [] };

const entry = (surprise: BoardMember['surprise']): BoardMember => ({ surprise } as BoardMember);

const view = (account: Partial<HouseholdView['account']>, sharedScreens = 1): HouseholdView => ({
  account: { user_id: 'u', name: 'U', is_admin: false, shared: false, kind: 'other', member_id: null, parent_level: false, ...account },
  security: { shared_screens: sharedScreens },
} as unknown as HouseholdView);

describe("a member's surprise (milestone 10)", () => {
  it('comes from the feed, with the reward it is for', () => {
    expect(surpriseOf('dana', entry({ reward: 'ice_cream_trip', opened: false }), [ICE_CREAM])).toEqual({
      memberId: 'dana', reward: ICE_CREAM, opened: false,
    });
    expect(surpriseOf('dana', entry(null), [ICE_CREAM])).toBeNull();
    expect(surpriseOf('dana', entry(undefined), [ICE_CREAM])).toBeNull(); // an older backend
    expect(surpriseOf('dana', entry({ reward: 'gone', opened: false }), [ICE_CREAM])).toBeNull();
    expect(surpriseOf('dana', undefined, [ICE_CREAM])).toBeNull();
  });
});

describe('who may open it', () => {
  it('opens on a shared screen and on the child\'s own login', () => {
    expect(mayOpenSurprise(view({ kind: 'shared', shared: true }), 'dana')).toBe(true);
    expect(mayOpenSurprise(view({ kind: 'other' }), 'dana')).toBe(true);
    expect(mayOpenSurprise(view({ kind: 'member', member_id: 'dana' }), 'dana')).toBe(true);
  });

  it("waits on a parent's phone, a sibling's login, and an admin's own login", () => {
    expect(mayOpenSurprise(view({ kind: 'parent', member_id: 'alex', parent_level: true }), 'dana')).toBe(false);
    expect(mayOpenSurprise(view({ kind: 'member', member_id: 'casey' }), 'dana')).toBe(false);
    expect(mayOpenSurprise(view({ kind: 'admin', is_admin: true, parent_level: true }), 'dana')).toBe(false);
    expect(mayOpenSurprise(null, 'dana')).toBe(false);
  });

  it('opens on any login when the household has no shared screens', () => {
    expect(mayOpenSurprise(view({ kind: 'parent', member_id: 'alex', parent_level: true }, 0), 'dana')).toBe(true);
  });
});

describe('its words', () => {
  it('says whose it is and how to open it', () => {
    expect(surpriseWords('Dana', true, 'tile')).toEqual({ title: 'A surprise for Dana!', hint: 'Hold me' });
    expect(surpriseWords('Casey', true, 'row')).toEqual({ title: 'A surprise for Casey!', hint: 'Hold to open' });
    expect(surpriseWords('Dana', false, 'tile')).toEqual({ title: 'A surprise for Dana!', hint: 'Waiting for Dana to open it' });
  });

  it("the reveal names them and the reward's own button", () => {
    expect(revealWords('Dana', ICE_CREAM)).toEqual({ title: 'Dana, you did it!', reward: 'Ice cream trip', button: '🙋 Ask for it' });
    expect(revealWords('Dana', STICKER).button).toBe('🎉 Get it');
  });
});

describe('the hold is the reveal\'s first act', () => {
  it('shakes harder, faster, and higher as it fills', () => {
    expect(holdPose(0)).toEqual({ angle: 0, rise: 0, scale: 1, period: 180 });
    const half = holdPose(0.5);
    const full = holdPose(1);
    expect(full).toEqual({ angle: 6, rise: 10, scale: 1.08, period: 80 });
    expect(half.angle).toBeGreaterThan(0);
    expect(half.angle).toBeLessThan(full.angle);
    expect(half.period).toBeGreaterThan(full.period);
  });

  it('never goes past a full hold', () => {
    expect(holdPose(1.4)).toEqual(holdPose(1));
    expect(holdPose(-1)).toEqual(holdPose(0));
  });
});

describe('the reveal', () => {
  it('runs in order: fly, shake, lid, reward, words, buttons, about 4 seconds', () => {
    const marks = [REVEAL.shakeAt, REVEAL.lidAt, REVEAL.riseAt, REVEAL.wordsAt, REVEAL.buttonsAt, REVEAL.endAt];
    expect([...marks].sort((a, b) => a - b)).toEqual(marks);
    expect(REVEAL.flyMs).toBeLessThanOrEqual(REVEAL.shakeAt);
    expect(REVEAL.endAt).toBeGreaterThanOrEqual(3500);
    expect(REVEAL.endAt).toBeLessThanOrEqual(4500);
  });

  it("throws confetti across the screen in the child's color and gold, the same for the same seed", () => {
    const pieces = confettiPieces(80, 7, '#E5484D');
    expect(pieces).toHaveLength(80);
    expect(confettiPieces(80, 7, '#E5484D')).toEqual(pieces);
    expect(new Set(pieces.map(p => p.color))).toEqual(new Set(['#E5484D', '#F5B800']));
    expect(pieces.some(p => p.star)).toBe(true);
    // They spread both ways and mostly fall.
    expect(pieces.some(p => p.dx < -0.3) && pieces.some(p => p.dx > 0.3)).toBe(true);
    expect(pieces.filter(p => p.dy > 0).length).toBeGreaterThan(40);
    for (const p of pieces) {
      expect(Math.abs(p.dx)).toBeLessThanOrEqual(0.6);
      expect(p.delay).toBeGreaterThanOrEqual(0);
      expect(p.delay).toBeLessThan(400);
    }
  });
});

describe('waiting', () => {
  it('wiggles every few seconds, offset per person so two presents move apart', () => {
    expect(IDLE_MS).toBe(4000);
    expect(idleOffset('dana')).toBe(idleOffset('dana'));
    expect(idleOffset('dana')).not.toBe(idleOffset('casey'));
    for (const id of ['dana', 'casey', 'alex', 'blair']) {
      expect(idleOffset(id)).toBeGreaterThanOrEqual(0);
      expect(idleOffset(id)).toBeLessThan(IDLE_MS);
    }
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/surprise-derive.test.ts` Expected: the new tests fail (a missing module, export, or command, or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/modules/chores/chores-client.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
index ca22739..eac6bfb 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-client.ts
@@ -95,6 +95,11 @@ export class ChoresApi extends WsApi {
     return this.call('planavista/rewards/redeem', { member, reward });
   }
 
+  /** Open a member's goal surprise: a shared screen or their own login (milestone 10). */
+  openSurprise(member: string): Promise<{ result: string }> {
+    return this.call('planavista/chores/surprise/open', { member });
+  }
+
   awardStars(member: string, stars: number, reason: string): Promise<{ balance: number }> {
     return this.call('planavista/stars/award', { member, stars, reason });
   }
```

`custom_components/planavista/frontend/src/modules/chores/chores-types.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
index 5b968b2..67b8934 100644
--- a/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/chores-types.ts
@@ -77,6 +77,8 @@ export interface BoardMember {
   week_stars: number;
   chore_minutes: number;
   away: AwaySpan | null;
+  /** Their goal surprise (milestone 10); missing from older backends. */
+  surprise?: { reward: string; opened: boolean } | null;
 }
 
 export type RequestKind = 'completion' | 'more_time' | 'skip' | 'redemption';
```

`custom_components/planavista/frontend/src/modules/chores/surprise-derive.ts` (new):

```ts
import type { HouseholdView } from '../../core/household';
import type { BoardMember, Reward } from './chores-types';

/**
 * The goal surprise (milestone 10): when a member's stars reach their goal, a
 * wrapped present waits on their screen until they hold it open, then a
 * full-screen reveal plays. The backend wraps and keeps it; these are the
 * card's rules for showing it.
 */

export interface SurpriseModel {
  memberId: string;
  reward: Reward;
  opened: boolean;
}

/** A member's surprise from the board feed, with the reward it is for (none from an older backend). */
export function surpriseOf(memberId: string, entry: BoardMember | undefined, rewards: Reward[]): SurpriseModel | null {
  const surprise = entry?.surprise;
  if (!surprise) return null;
  const reward = rewards.find(r => r.id === surprise.reward);
  return reward ? { memberId, reward, opened: surprise.opened } : null;
}

/**
 * Whether this screen may open `memberId`'s surprise, as the backend decides:
 * a shared screen or their own login, never a parent's phone, unless the
 * household has no shared screens at all.
 */
export function mayOpenSurprise(view: HouseholdView | null, memberId: string): boolean {
  if (!view) return false;
  const { kind, member_id } = view.account;
  if (kind === 'shared' || kind === 'other' || member_id === memberId) return true;
  return view.security.shared_screens === 0;
}

/** "A surprise for Dana!" and how to open it, or who it waits for. */
export function surpriseWords(name: string, may: boolean, shape: 'tile' | 'row'): { title: string; hint: string } {
  const hint = may ? (shape === 'tile' ? 'Hold me' : 'Hold to open') : `Waiting for ${name} to open it`;
  return { title: `A surprise for ${name}!`, hint };
}

/** The reveal's words and the reward's own button. */
export function revealWords(name: string, reward: Reward): { title: string; reward: string; button: string } {
  return { title: `${name}, you did it!`, reward: reward.name, button: reward.needs_ok ? '🙋 Ask for it' : '🎉 Get it' };
}

/**
 * How the present moves while it is held (the reveal's first act): it shakes
 * harder and faster and rises as the hold fills. `angle` is the shake's
 * reach in degrees, `period` its length in ms, `rise` in px.
 */
export function holdPose(fill: number): { angle: number; rise: number; scale: number; period: number } {
  const f = Math.min(1, Math.max(0, fill));
  return {
    angle: round(6 * f),
    rise: round(10 * f),
    scale: round(1 + 0.08 * f),
    period: Math.round(180 - 100 * f),
  };
}

/** The reveal's timeline in ms from the end of the hold. */
export const REVEAL = {
  /** The present flies from where it was to the middle. */
  flyMs: 500,
  shakeAt: 500,
  lidAt: 1000,
  riseAt: 1200,
  wordsAt: 1600,
  buttonsAt: 2200,
  endAt: 4000,
  confettiMs: 1800,
} as const;

/** How often a waiting present wiggles. */
export const IDLE_MS = 4000;

/** Where in the wiggle's cycle a member's present starts, so two presents don't move in step. */
export function idleOffset(memberId: string): number {
  let hash = 0;
  for (const ch of memberId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % IDLE_MS;
}

export interface ConfettiPiece {
  /** Where it ends, as a share of the screen's width and height from the middle. */
  dx: number;
  dy: number;
  spin: number;
  delay: number;
  size: number;
  color: string;
  /** A gold star instead of a paper square. */
  star: boolean;
}

const GOLD = '#F5B800';

/** The burst from the box: the child's color and gold stars, the same for the same seed. */
export function confettiPieces(count: number, seed: number, color: string): ConfettiPiece[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const star = i % 4 === 0;
    return {
      dx: round((random() - 0.5) * 1.2),
      dy: round(random() * 0.9 - 0.25),
      spin: Math.round((random() - 0.5) * 720),
      delay: Math.round(random() * 350),
      size: Math.round(8 + random() * 10),
      color: star || i % 3 === 0 ? GOLD : color,
      star,
    };
  });
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1353 passed`; the task's own files `11 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on Home Assistant.** None (pure rules; the next task draws them).

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(chores): the surprise's rules in the card

surprise-derive.ts: a member's surprise from the feed, who may open it
(the backend's rule), its words, the hold's pose (the reveal's first
act), the reveal's timeline, the idle wiggle's offset, and the
confetti. ChoresApi.openSurprise.
```

---

### Task 3: The wrapped present and its full-screen reveal

Spec 3.2, 3.3, 3.5, 3.6, 3.7, D4 to D10.

**Files:**
- Create: `custom_components/planavista/frontend/src/modules/chores/pv-surprise-present.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-surprise-reveal.ts`, `custom_components/planavista/frontend/src/modules/chores/surprise-art.ts`, `custom_components/planavista/frontend/test/surprise-places.test.ts`
- Modify: `custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`, `custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`, `custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts`, `custom_components/planavista/frontend/src/shell/planavista-card.ts`, `custom_components/planavista/frontend/test/status-bar.test.ts`

- [ ] **Step 1: Write the failing tests.**

`custom_components/planavista/frontend/test/status-bar.test.ts`:

```diff
diff --git a/custom_components/planavista/frontend/test/status-bar.test.ts b/custom_components/planavista/frontend/test/status-bar.test.ts
index bf3bda9..b84decd 100644
--- a/custom_components/planavista/frontend/test/status-bar.test.ts
+++ b/custom_components/planavista/frontend/test/status-bar.test.ts
@@ -22,7 +22,7 @@ describe('whatever comes first in the card makes room for the status bar, once',
   it('the strip in parent mode, else the header, else the card itself', () => {
     const rule = card.slice(card.indexOf("private _underStatusBar(): 'strip' | 'header' | 'card' {"));
     expect(rule).toMatch(/if \(session && this\._household\.view\?\.members\.some\(m => m\.id === session\.memberId\)\) return 'strip';\n\s+return this\._config\?\.hide_header \? 'card' : 'header';/);
-    expect(card).toMatch(/<ha-card class=\$\{this\._underStatusBar\(\) === 'card' \? 'under' : ''\}>/);
+    expect(card).toMatch(/<ha-card class=\$\{this\._underStatusBar\(\) === 'card' \? 'under' : ''\}[ >]/);
     expect(card).toMatch(/<pv-parent-strip\n\s+class="under"/);
     expect(card).toMatch(/<pv-glance-header\n\s+class=\$\{this\._underStatusBar\(\) === 'header' \? 'under' : ''\}/);
     expect(block(card, '      pv-parent-strip.under')).toMatch(/--pv-strip-top: var\(--pv-under-status-bar, 0px\);/);
```

`custom_components/planavista/frontend/test/surprise-places.test.ts` (new):

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Element behavior is checked on a Home Assistant copy (the hold, the reveal, Safari's click);
// these pin where the surprise shows and the rules those checks depend on.
const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

describe('the goal surprise waits where the child looks (milestone 10)', () => {
  it('first in a picture column, at the top of a list column', () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/<div class="tiles">\n\s+\$\{this\._present\(model, 'tile'\)\}/);
    expect(column).toMatch(/\$\{this\._present\(model, 'row'\)\}\$\{repeat\(model\.entries/);
    expect(column).toMatch(/if \(!surprise \|\| surprise\.opened\) return nothing;/);
  });

  it('the board tells each column whether a surprise waits and whether this screen may open it', () => {
    const board = read('modules/chores/pv-chores-board.ts');
    expect(board).toMatch(/\.surprise=\$\{surpriseOf\(id, model\.entry, this\.board\.rewards\)\} \?mayOpen=\$\{mayOpenSurprise\(this\.household, id\)\}/);
  });

  it('at the top of My day, large', () => {
    const myDay = read('modules/chores/pv-chores-my-day.ts');
    expect(myDay).toMatch(/this\.surprise && !this\.surprise\.opened \? html`\n\s+<pv-surprise-present class="surprise"[^`]*large>/);
  });

  it('by the goal in Rewards, and Watch it again once it is opened', () => {
    const rewards = read('modules/chores/pv-chores-rewards.ts');
    expect(rewards).toMatch(/b\.surprise && !b\.surprise\.opened \? html`\n\s+<pv-surprise-present[^`]*shape="row"/);
    expect(rewards).toMatch(/b\.surprise\?\.opened \? html`[\s\S]*?pv-surprise-replay[\s\S]*?Watch it again/);
  });

  it('the module opens it from all three places', () => {
    const module = read('modules/chores/pv-chores-module.ts');
    expect(module.match(/@pv-surprise-open=\$\{\(e: CustomEvent<SurpriseOpenDetail>\) => this\._openSurprise\(e\.detail\)\}/g)).toHaveLength(3);
  });
});

describe('the reveal covers the whole screen', () => {
  it("is shown by the card outside ha-card, whose container query would hold a fixed layer inside it", () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/<\/ha-card>\n\s+\$\{this\._renderFullscreen\(\)\}/);
    expect(card).toMatch(/<ha-card [^>]*@pv-fullscreen=\$\{this\._onFullscreen\}>/);
  });

  it("skips to the end only on a press that began on it: the hold's lifting finger lands there in Safari", () => {
    const reveal = read('modules/chores/pv-surprise-reveal.ts');
    expect(reveal).toMatch(/const pressed = this\._pressed;\n\s+this\._pressed = false;\n\s+if \(!pressed/);
    expect(reveal).toMatch(/private _down = \(event: PointerEvent\): void => \{\n\s+this\._pressed = /);
  });
});
```

- [ ] **Step 2: Run them and see them fail.** `cd custom_components/planavista/frontend && npx vitest run test/status-bar.test.ts test/surprise-places.test.ts` Expected: the new tests fail (a missing module, export, or command, or the old behavior); the others pass.

- [ ] **Step 3: Make them pass.**

`custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
index b37ab4e..32b4d4c 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-board.ts
@@ -23,6 +23,7 @@ import { eventsOn } from './calendar-ties';
 import { chime, haptic } from './effects';
 import './pv-chores-column';
 import type { PvChoresColumn } from './pv-chores-column';
+import { mayOpenSurprise, surpriseOf } from './surprise-derive';
 
 const GAP = 12;
 const NARROW_PX = 300;
@@ -230,7 +231,8 @@ export class PvChoresBoard extends LitElement {
     return html`
       <pv-chores-column member=${id} .model=${model} .hass=${this.hass} color=${memberColor(model.member, this.mode)}
         ?narrow=${narrow} ?locked=${memberAccess(this.household, this.session, id) === 'no'}
-        .celebrate=${this._celebrate[id] ?? 0} .pulse=${this._pulse[id] ?? 0}></pv-chores-column>
+        .celebrate=${this._celebrate[id] ?? 0} .pulse=${this._pulse[id] ?? 0}
+        .surprise=${surpriseOf(id, model.entry, this.board.rewards)} ?mayOpen=${mayOpenSurprise(this.household, id)}></pv-chores-column>
     `;
   }
 
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
index f233883..dced3cf 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-column.ts
@@ -11,6 +11,8 @@ import type { ColumnEntry, ColumnModel, RowModel } from './board-derive';
 import { bump, flyStars, glide, measure } from './effects';
 import './pv-chore-item';
 import './pv-chore-tile';
+import './pv-surprise-present';
+import type { SurpriseModel } from './surprise-derive';
 import { ref } from 'lit/directives/ref.js';
 import { ScrollReporter } from '../../core/content-scroll';
 import { stickersLabel } from './my-day-derive';
@@ -42,6 +44,10 @@ export class PvChoresColumn extends LitElement {
   @property({ type: Number }) celebrate = 0;
   /** Change it to pulse once (the evening check). */
   @property({ type: Number }) pulse = 0;
+  /** Their goal surprise, waiting until it is opened (milestone 10). */
+  @property({ attribute: false }) surprise: SurpriseModel | null = null;
+  /** This screen may open it. */
+  @property({ type: Boolean }) mayOpen = false;
   @property({ type: String, reflect: true }) member = '';
 
   private _before: Map<string, DOMRect> | null = null;
@@ -305,7 +311,17 @@ export class PvChoresColumn extends LitElement {
   }
 
   private _list(model: ColumnModel) {
-    return repeat(model.entries, entry => entry.key, entry => this._entry(entry));
+    return html`${this._present(model, 'row')}${repeat(model.entries, entry => entry.key, entry => this._entry(entry))}`;
+  }
+
+  /** The goal surprise, while it waits to be opened. */
+  private _present(model: ColumnModel, shape: 'tile' | 'row') {
+    const surprise = this.surprise;
+    if (!surprise || surprise.opened) return nothing;
+    return html`
+      <pv-surprise-present class="surprise" .model=${surprise} name=${model.member.name} color=${this.color}
+        ?may=${this.mayOpen} shape=${shape}></pv-surprise-present>
+    `;
   }
 
   private _entry(entry: ColumnEntry) {
@@ -338,6 +354,7 @@ export class PvChoresColumn extends LitElement {
     const stickers = model.entry.week_stars;
     return html`
       <div class="tiles">
+        ${this._present(model, 'tile')}
         ${repeat(tiles, t => t.row.key, t => html`
           <pv-chore-tile data-key=${t.row.key} .row=${t.row} color=${this.color} ?now=${t.now} ?locked=${this.locked}
             .stars=${t.stars}></pv-chore-tile>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
index 26480a0..73e73ff 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-module.ts
@@ -38,6 +38,11 @@ import { InboxRow, answeredText, inboxGroups } from './inbox-derive';
 import type { ReviewDetail } from './pv-chores-inbox';
 import { QuickAddDraft, activityFrom } from './quick-add';
 import { errorMessage } from '../../core/ws-api';
+import './pv-surprise-present';
+import './pv-surprise-reveal';
+import type { SurpriseOpenDetail } from './pv-surprise-present';
+import type { RevealDetail } from './pv-surprise-reveal';
+import { mayOpenSurprise, surpriseOf } from './surprise-derive';
 import { chime, haptic } from './effects';
 import type { PvChoresBoard } from './pv-chores-board';
 import { IMPORT_EXPORT, editChore } from './settings/targets';
@@ -406,6 +411,8 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         .colorOf=${this._colorOf} .timeFormat=${timeFormat} .minute=${this._minute}
         .goal=${goalFor(member, column.entry, board.rewards)} .shares=${fairShares(board, inOrder(this.household?.members ?? []))}
         .bedtime=${bedtimeOn(member, new Date())}
+        .surprise=${surpriseOf(member.id, column.entry, board.rewards)} ?mayOpen=${mayOpenSurprise(this.household, member.id)}
+        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
         ?locked=${memberAccess(this.household, this.session, member.id) === 'no'}
         @pv-my-day-member=${(e: CustomEvent<{ member: string }>) => { this._myDayMember = e.detail.member; }}
         @pv-my-day-style=${(e: CustomEvent<{ member: string; style: MyDayStyle }>) => void this._setStyle(e.detail.member, e.detail.style)}
@@ -493,7 +500,9 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     return html`
       <pv-chores-rewards .balances=${balances(board, members)} .cards=${rewardCards(board, members, this._waitingAsks(board))}
         .recent=${recentLine(board, members)} .hass=${this.hass} .colorOf=${this._colorOf} layout=${this.layout}
-        ?canEdit=${parentAccess(this.household, this.session) !== 'no'}
+        ?canEdit=${parentAccess(this.household, this.session) !== 'no'} .mayOpen=${this._mayOpen}
+        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
+        @pv-surprise-replay=${(e: CustomEvent<{ member: string }>) => this._replaySurprise(e.detail.member)}
         @pv-reward-redeem=${(e: CustomEvent<{ reward: string }>) => this._redeem(e.detail.reward)}
         @pv-reward-open=${(e: CustomEvent<{ reward: string | null }>) => void this._openReward(e.detail.reward)}></pv-chores-rewards>
     `;
@@ -516,23 +525,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
       if (elsewhere.length) this.showToast({ id: `redeem-${Date.now()}`, text: elsewhereText(elsewhere, card.reward.name) });
       return;
     }
-    const go = async (member: Member) => {
-      const api = this.service?.api;
-      if (!api || !(await this.asMember(member.id, `Who's getting ${card.reward.name}?`))) return;
-      const ask = { member: member.id, reward: rewardId };
-      this._asking = [...this._asking, ask];
-      try {
-        const out = await api.redeem(member.id, rewardId);
-        if (out.result === 'given') this._asking = this._asking.filter(a => a !== ask);
-        this.showToast({
-          id: `redeem-${Date.now()}`,
-          text: out.result === 'given' ? `${card.reward.name} is ${member.name}'s!` : `Asked for ${card.reward.name}. A parent will answer.`,
-        });
-      } catch (err) {
-        this._asking = this._asking.filter(a => a !== ask);
-        this.showToast({ id: `redeem-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
-      }
-    };
+    const go = (member: Member) => this._redeemAs(member, rewardId, card.reward.name);
     if (ready.length === 1) {
       void go(ready[0]);
       return;
@@ -543,6 +536,69 @@ export class PvChoresModule extends LitElement implements ModuleElement {
     };
   }
 
+  /** One member spends their stars on a reward, behind their PIN if they have one. */
+  private async _redeemAs(member: Member, rewardId: string, rewardName: string): Promise<void> {
+    const api = this.service?.api;
+    if (!api || !(await this.asMember(member.id, `Who's getting ${rewardName}?`))) return;
+    const ask = { member: member.id, reward: rewardId };
+    this._asking = [...this._asking, ask];
+    try {
+      const out = await api.redeem(member.id, rewardId);
+      if (out.result === 'given') this._asking = this._asking.filter(a => a !== ask);
+      this.showToast({
+        id: `redeem-${Date.now()}`,
+        text: out.result === 'given' ? `${rewardName} is ${member.name}'s!` : `Asked for ${rewardName}. A parent will answer.`,
+      });
+    } catch (err) {
+      this._asking = this._asking.filter(a => a !== ask);
+      this.showToast({ id: `redeem-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t save. Try again.', tone: 'bad' });
+    }
+  }
+
+  // The goal surprise (milestone 10) -------------------------------------------------------
+
+  private _mayOpen = (memberId: string): boolean => mayOpenSurprise(this.household, memberId);
+
+  /** A present held open: the reveal plays at once while Home Assistant marks it opened. */
+  private _openSurprise(detail: SurpriseOpenDetail): void {
+    const api = this.service?.api;
+    if (!api) {
+      detail.settle(false);
+      return;
+    }
+    const reveal = this._reveal({ model: detail.model, name: detail.name, color: detail.color, from: detail.from });
+    api.openSurprise(detail.model.memberId).then(
+      () => detail.settle(true),
+      err => {
+        detail.settle(false);
+        reveal.dispatchEvent(new CustomEvent('pv-fullscreen-done', { bubbles: true, composed: true }));
+        this.showToast({ id: `surprise-${Date.now()}`, text: errorMessage(err) ?? 'That didn\'t open. Try again.', tone: 'bad' });
+      },
+    );
+  }
+
+  /** Watch it again, from Rewards: the same reveal, nothing to change. */
+  private _replaySurprise(memberId: string): void {
+    const board = this.service?.board();
+    const member = this.household?.members.find(m => m.id === memberId);
+    const model = board && member ? surpriseOf(memberId, board.members[memberId], board.rewards) : null;
+    if (!model || !member) return;
+    this._reveal({ model, name: member.name, color: this._colorOf(member), from: null });
+  }
+
+  /** Asks the card to show the reveal over everything; its button asks for the reward. */
+  private _reveal(detail: Omit<RevealDetail, 'sound'>): HTMLElement {
+    const reveal = document.createElement('pv-surprise-reveal');
+    reveal.detail = { ...detail, sound: !!this.service?.board()?.settings.sound };
+    reveal.addEventListener('pv-reveal-choice', event => {
+      if ((event as CustomEvent<{ choice: string }>).detail.choice !== 'ask') return;
+      const member = this.household?.members.find(m => m.id === detail.model.memberId);
+      if (member) void this._redeemAs(member, detail.model.reward.id, detail.model.reward.name);
+    });
+    this.dispatchEvent(new CustomEvent('pv-fullscreen', { detail: { element: reveal }, bubbles: true, composed: true }));
+    return reveal;
+  }
+
   private async _openReward(id: string | null): Promise<void> {
     if (id === null && !(await this.asParent("Who's adding a reward?"))) return;
     this._sheet = { kind: 'reward', id, busy: false };
@@ -593,6 +649,7 @@ export class PvChoresModule extends LitElement implements ModuleElement {
         @pv-hold-undo=${(e: CustomEvent<HoldDetail>) => this._uncheck(e.detail)}
         @pv-hint=${(e: CustomEvent<{ row: RowModel }>) => this._hint(e.detail.row)}
         @pv-row-options=${(e: CustomEvent<{ row: RowModel }>) => this._openOptions(e.detail.row)}
+        @pv-surprise-open=${(e: CustomEvent<SurpriseOpenDetail>) => this._openSurprise(e.detail)}
         @pv-member-open=${(e: CustomEvent<{ member: string }>) => this._openMyDay(e.detail.member)}></pv-chores-board>
     `;
   }
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
index 14da765..03c703d 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-my-day.ts
@@ -1,4 +1,6 @@
 import { LitElement, html, css, nothing } from 'lit';
+import './pv-surprise-present';
+import type { SurpriseModel } from './surprise-derive';
 import { peopleStripStyles, segmentedStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import { repeat } from 'lit/directives/repeat.js';
@@ -56,6 +58,9 @@ export class PvChoresMyDay extends LitElement {
   @property({ attribute: false }) hass?: HomeAssistant;
   @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
   @property({ attribute: false }) goal: GoalModel | null = null;
+  /** Their goal surprise, waiting at the top until it is opened (milestone 10). */
+  @property({ attribute: false }) surprise: SurpriseModel | null = null;
+  @property({ type: Boolean }) mayOpen = false;
   @property({ attribute: false }) shares: FairShare[] = [];
   @property({ attribute: false }) bedtime: Date | null = null;
   @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
@@ -137,6 +142,10 @@ export class PvChoresMyDay extends LitElement {
 
 
 
+      pv-surprise-present.surprise {
+        margin: 4px 0 12px;
+      }
+
       .goal {
         margin-top: 12px;
       }
@@ -416,6 +425,10 @@ export class PvChoresMyDay extends LitElement {
               `)}
             </div>
           </div>
+          ${this.surprise && !this.surprise.opened ? html`
+            <pv-surprise-present class="surprise" .model=${this.surprise} name=${member.name} color=${this.colorOf(member)}
+              ?may=${this.mayOpen} large></pv-surprise-present>
+          ` : nothing}
           ${this.goal && this.layout !== 'landscape' ? this._goal(this.goal) : nothing}
           ${style === 'timeline' ? this._timeline() : style === 'list' ? this._list() : this._pictures()}
         </div>
```

`custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
index 4390bc5..69de78c 100644
--- a/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/pv-chores-rewards.ts
@@ -1,4 +1,5 @@
 import { LitElement, html, css, nothing } from 'lit';
+import './pv-surprise-present';
 import { tagStyles } from '../../styles/controls';
 import { property } from 'lit/decorators.js';
 import type { HomeAssistant } from 'custom-card-helpers';
@@ -31,6 +32,8 @@ export class PvChoresRewards extends LitElement {
   @property({ attribute: false }) cards: RewardCard[] = [];
   @property({ attribute: false }) recent: string | null = null;
   @property({ attribute: false }) hass?: HomeAssistant;
+  /** Whether this screen may open a member's surprise (milestone 10). */
+  @property({ attribute: false }) mayOpen: (memberId: string) => boolean = () => false;
   @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
   @property({ type: String, reflect: true }) layout: Layout = 'landscape';
   /** Parents (or a screen that can ask for a parent's PIN) see New reward. */
@@ -226,6 +229,14 @@ export class PvChoresRewards extends LitElement {
                     Goal: ${pictureOf(b.goal.reward.icon)} ${b.goal.reward.name} · ${goalWords(b.goal)}
                     <div class="bar"><span style="width:${Math.round(b.goal.progress * 100)}%"></span></div>
                   ` : html`No goal yet`}
+                  ${b.surprise && !b.surprise.opened ? html`
+                    <pv-surprise-present class="surprise" .model=${b.surprise} name=${b.member.name} color=${this.colorOf(b.member)}
+                      ?may=${this.mayOpen(b.member.id)} shape="row"></pv-surprise-present>
+                  ` : nothing}
+                  ${b.surprise?.opened ? html`
+                    <button class="again pv-btn pv-btn-text" type="button"
+                      @click=${() => this._fire('pv-surprise-replay', { member: b.member.id })}>🎁 Watch it again</button>
+                  ` : nothing}
                 </div>
               </div>
             `)}
```

`custom_components/planavista/frontend/src/modules/chores/pv-surprise-present.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { HoldGesture } from '../../core/hold';
import { BOUNCY, motionOf, springEasing } from '../../core/motion';
import '../../core/pv-ring';
import { presentArt } from './surprise-art';
import { IDLE_MS, holdPose, idleOffset, surpriseWords, type SurpriseModel } from './surprise-derive';

/** What a finished hold hands the module: the surprise, where the present was, and how to put it back if it can't open. */
export interface SurpriseOpenDetail {
  model: SurpriseModel;
  name: string;
  color: string;
  from: DOMRect;
  settle: (opened: boolean) => void;
}

/**
 * pv-surprise-present: a member's wrapped goal surprise (milestone 10).
 *
 * It wiggles every few seconds while it waits. On the child's screen a hold
 * fills its ring while the present shakes harder and rises: the reveal's
 * first act. A finished hold fires `pv-surprise-open` with where the present
 * was, so the reveal carries on from there without a cut; letting go early
 * springs it back. Elsewhere it says who it waits for and can't be held.
 */
export class PvSurprisePresent extends LitElement {
  @property({ attribute: false }) model!: SurpriseModel;
  @property({ type: String }) name = '';
  @property({ type: String }) color = '#5B5BD6';
  /** This screen may open it (a shared screen or the member's own login). */
  @property({ type: Boolean }) may = false;
  @property({ type: String, reflect: true }) shape: 'tile' | 'row' = 'tile';
  @property({ type: Boolean, reflect: true }) large = false;

  @state() private _fill = 0;
  @state() private _tracking = true;
  /** Handed to the reveal: hidden here until the feed says it's opened, or it comes back. */
  @state() private _away = false;
  private _frame = 0;
  private _holdStart = 0;
  private _idle = 0;
  private _gesture = new HoldGesture({
    progress: fill => {
      this._tracking = true;
      this._fill = fill;
      this._pose(fill);
    },
    complete: () => this._open(),
    rewind: () => {
      this._tracking = false;
      this._fill = 0;
      this._settle();
    },
    tap: () => this._wiggle(),
  });

  static styles = css`
    :host {
      display: block;
      --tint: color-mix(in srgb, var(--member) 12%, var(--pv-card-bg, #FFFFFF));
      --gold: var(--pv-present-gold, #F5B800);
    }

    .surprise {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      border-radius: 18px;
      border: 2px solid color-mix(in srgb, var(--gold) 70%, transparent);
      background: linear-gradient(160deg, color-mix(in srgb, var(--gold) 16%, var(--pv-card-bg, #FFFFFF)), var(--tint));
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

    :host([shape='row']) .hold {
      min-height: 64px;
      flex-direction: row;
      justify-content: flex-start;
      gap: 12px;
      padding: 8px 12px;
    }

    .hold:focus-visible {
      outline: 3px solid var(--pv-accent-ink, #5B5BD6);
      outline-offset: 2px;
    }

    .hold[aria-disabled='true'] {
      cursor: default;
    }

    .art {
      position: relative;
      display: block;
      width: 56px;
      height: 56px;
      transform-origin: 50% 80%;
      will-change: transform;
    }

    :host([large]) .art {
      width: 110px;
      height: 110px;
    }

    :host([shape='row']) .art {
      width: 34px;
      height: 34px;
    }

    .art .present {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .sparkle {
      position: absolute;
      font-size: 12px;
      color: var(--gold);
      opacity: 0;
      pointer-events: none;
    }

    .sparkle.a { top: -4px; left: 2px; }
    .sparkle.b { top: -10px; right: 6px; font-size: 15px; }
    .sparkle.c { top: 14px; right: -8px; }

    .glow {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: radial-gradient(circle, color-mix(in srgb, var(--gold) 45%, transparent), transparent 70%);
      opacity: 0;
      pointer-events: none;
    }

    .words {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-align: center;
    }

    :host([shape='row']) .words {
      align-items: flex-start;
      text-align: left;
    }

    .title {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: 1.0625rem;
      line-height: 1.2;
    }

    :host([large]) .title {
      font-size: 1.75rem;
    }

    .hint {
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #5F6670);
    }

    .away {
      visibility: hidden;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._scheduleIdle(this.model ? idleOffset(this.model.memberId) : 0);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this._frame);
    window.clearTimeout(this._idle);
  }

  render() {
    if (!this.model) return nothing;
    const words = surpriseWords(this.name, this.may, this.shape);
    const ring = this.large ? 150 : this.shape === 'row' ? 48 : 84;
    return html`
      <div class="surprise ${this._away ? 'away' : ''}" style="--member:${this.color}">
        <div class="hold" role="button" tabindex=${this.may ? 0 : -1} aria-disabled=${this.may ? 'false' : 'true'}
          aria-label=${this.may ? `${words.title} Hold to open it.` : `${words.title} ${words.hint}.`}
          @pointerdown=${this._down} @pointermove=${(e: PointerEvent) => this._gesture.move(e.clientX, e.clientY)}
          @pointerup=${this._up} @pointercancel=${() => this._gesture.cancel()} @keydown=${this._key}
          @contextmenu=${(e: Event) => e.preventDefault()}>
          <pv-ring size=${ring} .progress=${this._fill} ?tracking=${this._tracking} color=${this.color}>
            <span class="art">
              <span class="glow"></span>
              ${presentArt()}
              <span class="sparkle a" aria-hidden="true">✦</span>
              <span class="sparkle b" aria-hidden="true">✦</span>
              <span class="sparkle c" aria-hidden="true">✦</span>
            </span>
          </pv-ring>
          <span class="words">
            <span class="title">${words.title}</span>
            <span class="hint">${words.hint}</span>
          </span>
        </div>
      </div>
    `;
  }

  // Waiting --------------------------------------------------------------------------------

  private _scheduleIdle(delay: number): void {
    window.clearTimeout(this._idle);
    this._idle = window.setTimeout(() => {
      if (this.isConnected && !document.hidden && this._fill === 0 && !this._away) this._wiggle();
      if (this.isConnected) this._scheduleIdle(IDLE_MS);
    }, delay);
  }

  /** The excited wait: a wiggle and a hop with the bow's sparkles; a soft glow with reduced motion. */
  private _wiggle(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art) return;
    if (motionOf(this) === 'reduced') {
      art.querySelector('.glow')?.animate({ opacity: [0, 0.8, 0] }, { duration: 1400, easing: 'ease-in-out' });
      return;
    }
    art.animate([
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-6px) rotate(-7deg)', offset: 0.25 },
      { transform: 'translateY(-6px) rotate(7deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-4deg)', offset: 0.75 },
      { transform: 'translateY(0) rotate(0deg)' },
    ], { duration: 700, easing: 'ease-in-out' });
    art.querySelectorAll('.sparkle').forEach((sparkle, i) => {
      sparkle.animate(
        { opacity: [0, 1, 0], transform: ['scale(0.4)', 'scale(1.15)', 'scale(0.6)'] },
        { duration: 650, delay: 80 + i * 110, easing: 'ease-out' },
      );
    });
  }

  // The hold: the reveal's first act ---------------------------------------------------------

  private _down = (event: PointerEvent): void => {
    if (event.button > 0 || !this.may || this._away) return;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // A hold works without pointer capture too.
    }
    this._holdStart = performance.now();
    this._gesture.down(event.clientX, event.clientY, this._holdStart);
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
    if (this.may && !this._away) this._gesture.key(event.key);
  };

  /** Shake harder, faster, and higher as the hold fills (no shake with reduced motion; the ring still fills). */
  private _pose(fill: number): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art || motionOf(this) === 'reduced') return;
    const pose = holdPose(fill);
    const t = performance.now() - this._holdStart;
    const angle = pose.angle * Math.sin((2 * Math.PI * t) / pose.period);
    art.style.transform = `translateY(${-pose.rise}px) rotate(${angle.toFixed(2)}deg) scale(${pose.scale})`;
  }

  /** Let go early: spring back to rest. */
  private _settle(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    if (!art) return;
    const from = art.style.transform;
    art.style.transform = '';
    if (!from || motionOf(this) === 'reduced') return;
    const back = springEasing(BOUNCY);
    art.animate({ transform: [from, 'none'] }, { duration: back.duration, easing: back.easing });
  }

  private _open(): void {
    const art = this.renderRoot.querySelector<HTMLElement>('.art');
    const from = art?.getBoundingClientRect() ?? new DOMRect();
    this._fill = 1;
    this._away = true;
    const detail: SurpriseOpenDetail = {
      model: this.model,
      name: this.name,
      color: this.color,
      from,
      settle: opened => {
        if (opened) return;
        this._away = false;
        this._tracking = false;
        this._fill = 0;
        this._settle();
      },
    };
    this.dispatchEvent(new CustomEvent('pv-surprise-open', { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-surprise-present', PvSurprisePresent);

declare global {
  interface HTMLElementTagNameMap {
    'pv-surprise-present': PvSurprisePresent;
  }
}
```

`custom_components/planavista/frontend/src/modules/chores/pv-surprise-reveal.ts` (new):

```ts
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { BOUNCY, GENTLE, motionOf, springEasing } from '../../core/motion';
import { chime, haptic } from './effects';
import { pictureOf } from './pv-chore-tile';
import { presentArt } from './surprise-art';
import { REVEAL, confettiPieces, revealWords, type SurpriseModel } from './surprise-derive';

export interface RevealDetail {
  model: SurpriseModel;
  name: string;
  color: string;
  /** Where the present was when the hold finished (the reveal's first frame); null starts in the middle. */
  from: DOMRect | null;
  /** The household's Sound setting. */
  sound: boolean;
}

/**
 * pv-surprise-reveal: the goal surprise's full-screen opening (milestone 10).
 *
 * The present flies from where the hold left it to the middle, shakes, pops
 * its lid in a burst of confetti and stars, and the reward rises out with the
 * child's name. Then the reward's own button and Later. A tap skips to the
 * end, but only a press that began on this layer: the finger that finished
 * the hold lifts here, and Safari sends its click to whatever is under it.
 * The card shows it outside ha-card (whose container query would hold a fixed
 * layer inside the card), so it covers Home Assistant's own bars too. It
 * fires `pv-reveal-choice` (ask or later) and then `pv-fullscreen-done`.
 */
export class PvSurpriseReveal extends LitElement {
  @property({ attribute: false }) detail!: RevealDetail;
  @state() private _ready = false;
  private _animations: Animation[] = [];
  private _timers: number[] = [];
  private _pressed = false;
  private _closing = false;

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: block;
      font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      --gold: var(--pv-present-gold, #F5B800);
      --s: min(40vw, 40vh);
    }

    .layer {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--member) 38%, rgba(12, 12, 24, 0.86)), rgba(12, 12, 24, 0.9) 65%);
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none;
      user-select: none;
    }

    .gift, .reward {
      position: absolute;
      left: 50%;
      top: 42%;
      width: var(--s);
      height: var(--s);
      margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
    }

    .gift .present {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .gift .lid, .gift .box {
      transform-box: fill-box;
      transform-origin: 50% 100%;
    }

    .shaker {
      display: block;
      width: 100%;
      height: 100%;
      transform-origin: 50% 85%;
    }

    .reward {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: calc(var(--s) * 0.62);
      line-height: 1;
      opacity: 0;
      filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--gold) 55%, transparent));
    }

    .words {
      position: absolute;
      left: 16px;
      right: 16px;
      top: calc(42% + var(--s) / 2 + 12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #FFFFFF;
      text-align: center;
      opacity: 0;
    }

    .title {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-weight: 800;
      font-size: clamp(1.75rem, 6vmin, 3rem);
      line-height: 1.1;
    }

    .name {
      font-size: clamp(1.125rem, 3.4vmin, 1.75rem);
      font-weight: 700;
      opacity: 0.92;
    }

    .buttons {
      display: flex;
      gap: 12px;
      margin-top: 18px;
      flex-wrap: wrap;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
    }

    .ready .buttons {
      pointer-events: auto;
    }

    button {
      min-height: 56px;
      min-width: 140px;
      padding: 0 28px;
      border-radius: 28px;
      font: inherit;
      font-size: 1.125rem;
      font-weight: 800;
      cursor: pointer;
      border: none;
    }

    .ask {
      background: var(--gold);
      color: #2A1F00;
      box-shadow: 0 6px 20px color-mix(in srgb, var(--gold) 45%, transparent);
    }

    .later {
      background: rgba(255, 255, 255, 0.14);
      color: #FFFFFF;
    }

    button:focus-visible {
      outline: 3px solid #FFFFFF;
      outline-offset: 3px;
    }

    .piece {
      position: absolute;
      left: 50%;
      top: 42%;
      border-radius: 2px;
      opacity: 0;
      pointer-events: none;
    }

    .piece.star {
      border-radius: 0;
      background: none !important;
      color: var(--gold);
      line-height: 1;
    }
  `;

  render() {
    const d = this.detail;
    if (!d) return nothing;
    const words = revealWords(d.name, d.model.reward);
    const reduced = motionOf(this) === 'reduced';
    const pieces = reduced ? [] : confettiPieces(80, d.model.memberId.length * 7919 + d.model.reward.cost, d.color);
    return html`
      <div class="layer ${this._ready ? 'ready' : ''}" style="--member:${d.color}" role="dialog" aria-modal="true"
        aria-label=${words.title} @pointerdown=${this._down} @click=${this._click} @keydown=${this._key}>
        ${pieces.map(p => html`<span class="piece ${p.star ? 'star' : ''}" data-dx=${p.dx} data-dy=${p.dy} data-spin=${p.spin}
          data-delay=${p.delay} style="width:${p.size}px;height:${p.star ? p.size : Math.round(p.size * 0.6)}px;margin:${-p.size / 2}px 0 0 ${-p.size / 2}px;background:${p.color};font-size:${p.size + 6}px"
          aria-hidden="true">${p.star ? '★' : ''}</span>`)}
        <div class="gift" aria-hidden="true"><span class="shaker">${presentArt()}</span></div>
        <div class="reward" aria-hidden="true">${pictureOf(d.model.reward.icon) || '🎁'}</div>
        <div class="words">
          <span class="title">${words.title}</span>
          <span class="name">${words.reward}</span>
          <div class="buttons">
            <button class="ask" type="button" @click=${() => this._choose('ask')}>${words.button}</button>
            <button class="later" type="button" @click=${() => this._choose('later')}>Later</button>
          </div>
        </div>
      </div>
    `;
  }

  protected firstUpdated(): void {
    if (motionOf(this) === 'reduced') this._playGently();
    else this._play();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._timers.forEach(t => window.clearTimeout(t));
    this._animations.forEach(a => a.cancel());
  }

  private _q<T extends Element>(selector: string): T | null {
    return this.renderRoot.querySelector<T>(selector);
  }

  private _animate(el: Element | null, keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): void {
    if (!el) return;
    this._animations.push(el.animate(keyframes, { fill: 'both', ...options }));
  }

  private _at(ms: number, run: () => void): void {
    this._timers.push(window.setTimeout(run, ms));
  }

  private _play(): void {
    const gift = this._q<HTMLElement>('.gift');
    const shaker = this._q('.shaker');
    const from = this.detail.from;
    const to = gift?.getBoundingClientRect();
    // 1. From where the hold left it to the middle, still shaking.
    if (gift && from && to && to.width > 0) {
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const fly = springEasing(GENTLE);
      this._animate(gift, { transform: [`translate(${dx}px, ${dy}px) scale(${from.width / to.width})`, 'none'] },
        { duration: Math.max(REVEAL.flyMs, fly.duration), easing: fly.easing });
    } else {
      this._animate(gift, { opacity: [0, 1], transform: ['scale(0.6)', 'none'] }, { duration: REVEAL.flyMs, easing: 'ease-out' });
    }
    this._animate(shaker, { transform: ['rotate(-5deg)', 'rotate(5deg)'] },
      { duration: 90, iterations: REVEAL.shakeAt / 90, direction: 'alternate', fill: 'none' });
    // 2. Two big shakes.
    this._animate(shaker, {
      transform: ['rotate(0deg)', 'rotate(-13deg)', 'rotate(13deg)', 'rotate(-13deg)', 'rotate(13deg)', 'rotate(0deg)'],
    }, { duration: REVEAL.lidAt - REVEAL.shakeAt, delay: REVEAL.shakeAt, easing: 'ease-in-out', fill: 'none' });
    // 3. The lid pops, and the burst.
    const pop = springEasing(BOUNCY);
    this._animate(this._q('.gift .lid'), {
      transform: ['none', 'translate(-18%, -150%) rotate(-32deg)'], opacity: [1, 0],
    }, { duration: 750, delay: REVEAL.lidAt, easing: pop.easing });
    this._animate(this._q('.gift .box'), { transform: ['none', 'scale(1.06, 0.9)', 'none'] },
      { duration: 360, delay: REVEAL.lidAt, easing: 'ease-out' });
    this._confetti();
    this._at(REVEAL.lidAt, () => {
      haptic('ring');
      if (this.detail.sound) chime(true);
    });
    // 4. The reward rises out of the box, which fades away below it.
    this._animate(this._q('.reward'), {
      opacity: [0, 1], transform: ['translateY(18%) scale(0.2)', 'translateY(-8%) scale(1)'],
    }, { duration: 650, delay: REVEAL.riseAt, easing: pop.easing });
    // The fade on the gift, the drop on its shaker: one animation can't add a transform without adding the opacity too.
    this._animate(gift, { opacity: [1, 0] }, { duration: 450, delay: REVEAL.riseAt + 150, easing: 'ease-in' });
    this._animate(shaker, { transform: ['none', 'translateY(14%) scale(0.92)'] },
      { duration: 450, delay: REVEAL.riseAt + 150, easing: 'ease-in', fill: 'forwards' });
    // 5 and 6. The words, then the buttons.
    this._animate(this._q('.words'), { opacity: [0, 1], transform: ['translateY(16px)', 'none'] },
      { duration: 420, delay: REVEAL.wordsAt, easing: 'ease-out' });
    this._animate(this._q('.buttons'), { opacity: [0, 1] }, { duration: 320, delay: REVEAL.buttonsAt, easing: 'ease-out' });
    this._at(REVEAL.buttonsAt, () => this._arrive());
  }

  /** Reduced motion keeps the meaning: the present fades to the reward with a soft glow, then the words and buttons. */
  private _playGently(): void {
    this._animate(this._q('.gift'), { opacity: [0, 1, 1, 0] }, { duration: 1100, easing: 'ease-in-out' });
    this._animate(this._q('.reward'), { opacity: [0, 1] }, { duration: 500, delay: 700, easing: 'ease-out' });
    this._animate(this._q('.words'), { opacity: [0, 1] }, { duration: 400, delay: 1000 });
    this._animate(this._q('.buttons'), { opacity: [0, 1] }, { duration: 300, delay: 1300 });
    this._at(700, () => {
      if (this.detail.sound) chime(true);
    });
    this._at(1300, () => this._arrive());
  }

  private _confetti(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderRoot.querySelectorAll<HTMLElement>('.piece').forEach(piece => {
      const dx = Number(piece.dataset.dx) * w;
      const dy = Number(piece.dataset.dy) * h;
      const spin = Number(piece.dataset.spin);
      this._animate(piece, [
        { opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(0.6)' },
        { opacity: 1, transform: `translate(${dx * 0.7}px, ${dy * 0.4 - h * 0.18}px) rotate(${spin * 0.5}deg) scale(1)`, offset: 0.35 },
        { opacity: 0, transform: `translate(${dx}px, ${dy + h * 0.25}px) rotate(${spin}deg) scale(0.9)` },
      ], { duration: REVEAL.confettiMs, delay: REVEAL.lidAt + Number(piece.dataset.delay), easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
    });
  }

  private _arrive(): void {
    if (this._ready) return;
    this._ready = true;
    void this.updateComplete.then(() => this._q<HTMLButtonElement>('.ask')?.focus());
  }

  /** A tap anywhere jumps to the end; the hold's own lifting finger doesn't count. */
  private _down = (event: PointerEvent): void => {
    this._pressed = !(event.target as Element).closest?.('button');
  };

  private _click = (event: MouseEvent): void => {
    const pressed = this._pressed;
    this._pressed = false;
    if (!pressed || (event.target as Element).closest?.('button') || this._ready) return;
    this._skip();
  };

  private _skip(): void {
    this._timers.forEach(t => window.clearTimeout(t));
    this._timers = [];
    for (const animation of this._animations) {
      try {
        animation.finish();
      } catch {
        // An endless animation can't finish; it is done anyway.
        animation.cancel();
      }
    }
    this._arrive();
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._choose('later');
    } else if (!this._ready && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      this._skip();
    }
  };

  private _choose(choice: 'ask' | 'later'): void {
    if (this._closing) return;
    this._closing = true;
    this.dispatchEvent(new CustomEvent('pv-reveal-choice', { detail: { choice }, bubbles: true, composed: true }));
    const done = () => this.dispatchEvent(new CustomEvent('pv-fullscreen-done', { bubbles: true, composed: true }));
    if (motionOf(this) === 'reduced') {
      done();
      return;
    }
    const layer = this._q('.layer');
    const out = layer?.animate({ opacity: [1, 0] }, { duration: 220, easing: 'ease-in', fill: 'forwards' });
    if (out) out.onfinish = done;
    else done();
  }
}

defineElement('pv-surprise-reveal', PvSurpriseReveal);

declare global {
  interface HTMLElementTagNameMap {
    'pv-surprise-reveal': PvSurpriseReveal;
  }
}
```

`custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts b/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
index 71289e9..ecbc5d4 100644
--- a/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
+++ b/custom_components/planavista/frontend/src/modules/chores/rewards-derive.ts
@@ -1,4 +1,5 @@
 import type { Member } from '../../core/household';
+import { type SurpriseModel, surpriseOf } from './surprise-derive';
 import type { Board, Reward } from './chores-types';
 import { GoalModel, goalFor } from './my-day-derive';
 import { dayWords } from './options-derive';
@@ -7,13 +8,20 @@ export interface Balance {
   member: Member;
   stars: number;
   goal: GoalModel | null;
+  /** Their goal surprise, waiting or opened (milestone 10). */
+  surprise: SurpriseModel | null;
 }
 
 /** Who earns stars, with their balance and goal (spec 13.6: balances and goals on top). */
 export function balances(board: Board, members: Member[]): Balance[] {
   return members
     .filter(m => m.stars && board.members[m.id])
-    .map(member => ({ member, stars: board.members[member.id].stars, goal: goalFor(member, board.members[member.id], board.rewards) }));
+    .map(member => ({
+      member,
+      stars: board.members[member.id].stars,
+      goal: goalFor(member, board.members[member.id], board.rewards),
+      surprise: surpriseOf(member.id, board.members[member.id], board.rewards),
+    }));
 }
 
 export interface RewardCard {
```

`custom_components/planavista/frontend/src/modules/chores/surprise-art.ts` (new):

```ts
import { svg } from 'lit';

/**
 * The wrapped present (milestone 10), drawn in the member's color with a gold
 * ribbon and bow. The waiting tile and the reveal draw the same one; the lid
 * is its own group so the reveal can pop it. Colors come from the host's
 * `--member`.
 */
export function presentArt() {
  return svg`
    <svg class="present" viewBox="0 0 64 64" aria-hidden="true">
      <g class="box">
        <rect x="10" y="28" width="44" height="30" rx="4" style="fill: var(--member)"></rect>
        <rect x="10" y="28" width="44" height="30" rx="4" style="fill: url(#pv-present-shade)"></rect>
        <rect x="28" y="28" width="8" height="30" style="fill: var(--pv-present-gold, #F5B800)"></rect>
      </g>
      <g class="lid">
        <rect x="6" y="19" width="52" height="11" rx="3" style="fill: color-mix(in srgb, var(--member) 78%, #000)"></rect>
        <rect x="28" y="19" width="8" height="11" style="fill: var(--pv-present-gold, #F5B800)"></rect>
        <path d="M32 19 C 26 6, 13 9, 21 19 Z M32 19 C 38 6, 51 9, 43 19 Z" style="fill: var(--pv-present-gold, #F5B800)"></path>
        <circle cx="32" cy="19" r="3.6" style="fill: #D99A00"></circle>
      </g>
      <defs>
        <linearGradient id="pv-present-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"></stop>
          <stop offset="1" stop-color="#000000" stop-opacity="0.12"></stop>
        </linearGradient>
      </defs>
    </svg>
  `;
}
```

`custom_components/planavista/frontend/src/shell/planavista-card.ts`:

```diff
diff --git a/custom_components/planavista/frontend/src/shell/planavista-card.ts b/custom_components/planavista/frontend/src/shell/planavista-card.ts
index 2be332b..e7d3456 100644
--- a/custom_components/planavista/frontend/src/shell/planavista-card.ts
+++ b/custom_components/planavista/frontend/src/shell/planavista-card.ts
@@ -77,6 +77,8 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
   @property({ attribute: false }) public hass!: HomeAssistant;
   /** Home Assistant sets this when the card is a panel view's one card; shown on the host as `panel`. */
   @property({ type: Boolean, reflect: true, attribute: 'panel' }) isPanel = false;
+  /** A module's full-screen layer, shown outside ha-card. */
+  @state() private _fullscreen: HTMLElement | null = null;
   /** Puts Home Assistant's view back as it was (core/panel-fit). */
   private _unfitView?: () => void;
   /** Stops hearing kiosk mode's changes (milestone 9). */
@@ -310,6 +312,10 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
       /* The card's own toast sits just after the module area: above the bar in
          portrait and on phones, at the bottom in landscape, as the chores
          toasts do (review: it covered the bar). */
+      .fullscreen {
+        display: contents;
+      }
+
       .toast-anchor {
         order: 3;
         position: relative;
@@ -921,7 +927,7 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
     const active = this._activeModule();
 
     return html`
-      <ha-card class=${this._underStatusBar() === 'card' ? 'under' : ''}>
+      <ha-card class=${this._underStatusBar() === 'card' ? 'under' : ''} @pv-fullscreen=${this._onFullscreen}>
         ${this._renderParentStrip()}
         ${showsKioskReturn(kiosk.steppedOut, this._session.session) ? html`
           <div class="banner info kiosk-out" role="status">
@@ -980,9 +986,28 @@ export class PlanaVistaCard extends LitElement implements ServiceHost {
         ${this._renderSheet()}
         <div class="toast-anchor"><pv-toast .toast=${this._toast} @pv-toast-gone=${() => { this._toast = null; }}></pv-toast></div>
       </ha-card>
+      ${this._renderFullscreen()}
     `;
   }
 
+  /**
+   * A module's full-screen layer (the goal surprise's reveal, milestone 10). It
+   * sits outside ha-card, whose container query would hold a fixed layer
+   * inside the card, so it covers the whole screen, Home Assistant's bars too.
+   */
+  private _renderFullscreen() {
+    const layer = this._fullscreen;
+    if (!layer) return nothing;
+    return html`<div class="fullscreen" @pv-fullscreen-done=${(e: Event) => {
+      if (e.composedPath()[0] === layer) this._fullscreen = null;
+    }}>${layer}</div>`;
+  }
+
+  private _onFullscreen = (event: CustomEvent<{ element: HTMLElement }>): void => {
+    event.stopPropagation();
+    this._fullscreen = event.detail.element;
+  };
+
   /** Render a module through its registered element. */
   private _renderModule(mod: ModuleDefinition, data: PlanaVistaData, display: DisplayConfig) {
     const tag = unsafeStatic(mod.tag);
```

- [ ] **Step 4: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1363 passed`; the task's own files `19 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 5: Check it on Home Assistant.** As Kitchen at 1032 by 1376 with the iPad insets: Dana's present is first in her column and wiggles every 4 seconds; a hold fills the ring while the present shakes harder and rises (about 3.6 degrees and 6 px at 60 percent); the finished hold flows into the reveal over the whole window; Safari's click sent to the element under the finger lands on the reveal and doesn't skip it; at 1.35 s the lid is off with confetti and the reward rising; at the end, the words and the reward's button, focused. As Alex's own login the present reads "Waiting for Dana to open it" and a hold does nothing; Watch it again plays the reveal over Home Assistant's own top bar and sidebar; Rewards shows the present by Dana's goal.

- [ ] **Step 6: Commit** with this message and the two trailer lines:

```text
feat(chores): the wrapped present and its full-screen reveal

pv-surprise-present waits first in the child's column, at the top of
their My day, and by their goal in Rewards, wiggling every few seconds.
On a shared screen or the child's own login a hold opens it, and the
hold is the reveal's first act: the present shakes harder and rises as
the ring fills. pv-surprise-reveal carries on from where the present
was: it flies to the middle, shakes, pops its lid in confetti and gold
stars, and the reward rises out with the child's name, then the
reward's button and Later. The card shows it outside ha-card so it
covers Home Assistant's bars too; only a press that began on it skips
to the end. Watch it again replays it from Rewards.
```

---

### Task 4: 0.10.0, the goal surprise in the README and the design system

Spec 4, 8.

**Files:**
- Modify: `DESIGN_SYSTEM.md`, `README.md`, `custom_components/planavista/const.py`, `custom_components/planavista/frontend/package-lock.json`, `custom_components/planavista/frontend/package.json`, `custom_components/planavista/manifest.json`, `docs/superpowers/specs/2026-10-13-goal-surprise-design.md`

- [ ] **Step 1: Make them pass.**

`DESIGN_SYSTEM.md`:

```diff
diff --git a/DESIGN_SYSTEM.md b/DESIGN_SYSTEM.md
index 56cfba6..7e306de 100644
--- a/DESIGN_SYSTEM.md
+++ b/DESIGN_SYSTEM.md
@@ -341,6 +341,14 @@ The calendar's event details (`pv-event-popup`) and New event and Edit event (`p
 - Fifteen animated icons. The condition text is capitalized, with hyphens as spaces.
 - Without a weather entity the space collapses, with no placeholder.
 
+### 11.10 The goal surprise
+
+`pv-surprise-present` and `pv-surprise-reveal` (modules/chores): when a person's stars reach their goal, a present in their color with a gold ribbon and bow waits first in their column (a tile like their chore tiles, or a row in a list column), at the top of their My day (large), and by their goal in Rewards.
+
+- **Waiting:** every 4 seconds, offset per person, a wiggle and a hop with three sparkles by the bow, then still; nothing moves while the page is hidden. Reduced motion: a soft glow instead.
+- **Opening:** the same hold as a chore (550 ms, a 12 px move cancels, Space or Enter), and the hold is the reveal's first act: the present shakes harder and faster and rises as the ring fills, and a finished hold flows into the reveal from where the present was. Letting go early springs it back. On a login that may not open it (a parent's or a sibling's own), it reads "Waiting for Dana to open it" and can't be held.
+- **The reveal:** a full-screen layer above everything, Home Assistant's bars included (the card shows it outside `ha-card`). The present flies to the middle, shakes twice, the lid pops (bouncy) in a burst of confetti in the person's color and gold stars, the reward's picture rises out of the box, "Dana, you did it!" and the reward's name fade up, then the reward's button (🙋 Ask for it, or 🎉 Get it when it needs no OK) and Later, about 4 seconds in all. A tap skips to the end, but only a press that began on the layer, since the hold's lifting finger lands there. Reduced motion: the present fades to the reward with a glow. The chime plays only with Sound on.
+
 ### 11.9 Controls: one for each kind of choice
 
 The shared styles live in `styles/controls.ts`; each site keeps its own buttons, inputs, and handlers.
@@ -387,6 +395,10 @@ hide_header: false
 
 ## 12. Design changelog
 
+### 2026-10-13: Added: the goal surprise
+
+- A reached goal waits as a wrapped present on the child's own screen until they hold it open; the hold is the reveal's first act, and the reveal covers the whole screen (11.10).
+
 ### 2026-10-13: Changed: the first adversarial review
 
 - A sheet or toast ignores the tap of a finger that went down before it appeared, and taps in its first 300 ms (`core/press-guard.ts`): Safari sends a lifting finger's click to whatever is under it, so a hold that opened the PIN sheet picked the face under the finger, and a double tap closed the options it opened.
```

`README.md`:

```diff
diff --git a/README.md b/README.md
index 15762d2..f799de9 100644
--- a/README.md
+++ b/README.md
@@ -146,6 +146,8 @@ Chores sit next to the calendar. The board shows everyone's today at once: a col
 
 **Views.** Board; Week, with each person's days and anything missed; My day, one person's day as a timeline, a list, or big pictures for young children; and Rewards, with stars saved up and what they can buy.
 
+**Goals and surprises.** Each person can save up for one reward, their goal. When their stars reach it, however they got there (a parent's OK from a phone, the end of the day, bonus stars), a wrapped present waits on their column, their My day, and their goal in Rewards, wiggling now and then until they open it. They hold it like a chore, and it opens across the whole screen with their reward. It opens on a shared screen or their own login, never on a parent's phone, so a parent checking in from work can't open it for them; parents with phones get a note that a surprise is waiting. Watch it again in Rewards plays it once more.
+
 **Waiting for OK.** A chore or a reward can wait for a parent's OK. Parents answer under Waiting for OK on the screen, or from their phones. Settings, Rules decides what happens to check-offs nobody answers by the end of the day, what a missed chore does, when the chore day starts (3:00 AM), and how many minutes earn a star.
 
 **Phones.** On a person's page in Settings, pick their phones (from the Home Assistant Companion app). Parents' phones get Waiting for OK requests with buttons to answer them. Under Reminders, anyone with a phone can get a reminder at the evening check (7:00 PM unless you change it), only when they have chores left; the board shows the evening check at the same time. If Home Assistant no longer has a phone, Settings lists it under Needs a look.
@@ -210,7 +212,7 @@ Each person gets a device in Home Assistant:
 | `sensor.<name>_stars` | Stars to spend |
 | `sensor.<name>_streak` | Days in a row with every chore done |
 | `binary_sensor.<name>_chores_done` | On once everything due today is done |
-| `event.<name>_chores` | Completed, approved, sent back, undone, missed, or redeemed |
+| `event.<name>_chores` | Completed, approved, sent back, undone, missed, redeemed, or goal reached |
 
 The Household device adds `sensor.household_chores_left` and `sensor.household_approvals_waiting`, next to `select.planavista_appearance`.
 
```

`custom_components/planavista/const.py`:

```diff
diff --git a/custom_components/planavista/const.py b/custom_components/planavista/const.py
index 3d95db8..eded145 100644
--- a/custom_components/planavista/const.py
+++ b/custom_components/planavista/const.py
@@ -3,7 +3,7 @@ from typing import Final
 
 DOMAIN: Final = "planavista"
 NAME: Final = "PlanaVista"
-VERSION: Final = "0.9.0"
+VERSION: Final = "0.10.0"
 
 # Event fetching range
 EVENT_RANGE_PAST_DAYS: Final = 30
```

`custom_components/planavista/frontend/package-lock.json`:

```diff
diff --git a/custom_components/planavista/frontend/package-lock.json b/custom_components/planavista/frontend/package-lock.json
index 0e51310..44945c4 100644
--- a/custom_components/planavista/frontend/package-lock.json
+++ b/custom_components/planavista/frontend/package-lock.json
@@ -1,12 +1,12 @@
 {
   "name": "planavista-cards",
-  "version": "0.9.0",
+  "version": "0.10.0",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
       "name": "planavista-cards",
-      "version": "0.9.0",
+      "version": "0.10.0",
       "license": "MIT",
       "dependencies": {
         "custom-card-helpers": "^1.9.0",
```

`custom_components/planavista/frontend/package.json`:

```diff
diff --git a/custom_components/planavista/frontend/package.json b/custom_components/planavista/frontend/package.json
index 166d432..d90549c 100644
--- a/custom_components/planavista/frontend/package.json
+++ b/custom_components/planavista/frontend/package.json
@@ -1,6 +1,6 @@
 {
   "name": "planavista-cards",
-  "version": "0.9.0",
+  "version": "0.10.0",
   "description": "PlanaVista cards for Home Assistant",
   "author": "Stephen Hall",
   "license": "MIT",
```

`custom_components/planavista/manifest.json`:

```diff
diff --git a/custom_components/planavista/manifest.json b/custom_components/planavista/manifest.json
index de629ad..e7b0562 100644
--- a/custom_components/planavista/manifest.json
+++ b/custom_components/planavista/manifest.json
@@ -11,5 +11,5 @@
   "issue_tracker": "https://github.com/tavenhall1/planavista/issues",
   "requirements": [],
   "single_config_entry": true,
-  "version": "0.9.0"
+  "version": "0.10.0"
 }
```

`docs/superpowers/specs/2026-10-13-goal-surprise-design.md`:

```diff
diff --git a/docs/superpowers/specs/2026-10-13-goal-surprise-design.md b/docs/superpowers/specs/2026-10-13-goal-surprise-design.md
index 11b5e53..38a5943 100644
--- a/docs/superpowers/specs/2026-10-13-goal-surprise-design.md
+++ b/docs/superpowers/specs/2026-10-13-goal-surprise-design.md
@@ -1,4 +1,4 @@
-# Goal surprise (milestone 10, release 1.7.0)
+# Goal surprise (milestone 10, release 0.10.0)
 
 ## 1. Why
 
@@ -40,7 +40,7 @@ After every change to chores data (any action, the day's boundary, a reward edit
 
 ### 3.3 The excited wait
 
-Every 4 seconds (offset per member so two presents don't move in step): a wiggle of about 7 degrees each way and a 6 px hop on the bouncy spring, about 700 ms, with three sparkles twinkling around the bow. Only transform and opacity animate. It stops while the page is hidden or the screen has an open sheet, and starts again after. Reduced motion: a slow glow (opacity) instead.
+Every 4 seconds (offset per member so two presents don't move in step): a wiggle of about 7 degrees each way and a 6 px hop on the bouncy spring, about 700 ms, with three sparkles twinkling around the bow. Only transform and opacity animate. It stops while the page is hidden (an open sheet's backdrop covers it anyway), and starts again after. Reduced motion: a slow glow (opacity) instead.
 
 ### 3.4 Who opens it
 
```

- [ ] **Step 2: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1363 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 3: Check it on Home Assistant.** None (version and docs).

- [ ] **Step 4: Commit** with this message and the two trailer lines:

```text
chore: 0.10.0, the goal surprise in the README and the design system
```

---

### Task 5: The bundle

Spec 4.

**Files:**
- Modify: `custom_components/planavista/frontend/dist/planavista-cards.js`

- [ ] **Step 1: Make them pass.**

`custom_components/planavista/frontend/dist/planavista-cards.js`: rebuilt with `npm run build` (not copied; the build is deterministic).

- [ ] **Step 2: Run the checks.** `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test` Expected: tsc clean, `1363 passed`; `bash scripts/test-backend.sh -q` Expected: `1151 passed`; `python scripts/check_copy.py` passes.

- [ ] **Step 3: Check it on Home Assistant.** The Home Assistant copy serves `planavista-cards.js?v=0.10.0-...` after a deploy.

- [ ] **Step 4: Commit** with this message and the two trailer lines:

```text
build: the bundle
```

---
