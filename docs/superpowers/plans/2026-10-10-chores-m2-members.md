# Milestone 2, Household Members, PINs, and Shell Settings: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Household members become a shell concept with PINs, parent mode, and shared-screen accounts enforced by the backend, and the card gets one Settings (split view in landscape, a stack in portrait and on phones) and a first-run setup built from registered steps, while a 1.1.0 calendar-only install upgrades with nothing changed except where Settings lives.

**Architecture:** A new `household/` package holds pure rules (`members.py`, `security.py`, `permissions.py`), the `planavista.household` Store and the loaded `Household` (`store.py`), and WebSocket commands (`websocket.py`) that check the spec 9.5 rule in every command. Calendars gain `member_id` and join their member through their Home Assistant person. The card subscribes to `planavista/household/subscribe`, keeps a per-card parent-mode session, measures its own size (`layout` attribute), and renders Settings pages and setup steps as registered elements. Logic that can be tested without a browser lives in modules that import no Lit elements.

**Tech Stack:** Python 3.14, Home Assistant 2026.9.4 (`helpers.storage.Store`, `websocket_api`), `hashlib.scrypt`, pytest with pytest-homeassistant-custom-component 0.13.367 (Docker, `scripts/test-backend.sh`); TypeScript 5.7 (strict), Lit 3, Rollup 4, vitest 5 (Node environment).

**Spec:** `docs/superpowers/specs/2026-10-09-chores-module-design.md`, section 17.3 row 2, with sections 6.2 to 6.6, 7.1, 7.2, 7.6, 7.8, 9, 10.7, 11.7, 11.8, 12.1, 14.1, 14.2, 14.5, 14.7, 15.3, 15.4, and 16.

## Global Constraints

- No em dashes in any tracked text file (U+2014, its HTML entities, or the backslash-u escape). `python scripts/check_copy.py` passes after every task.
- A 1.1.0 calendar-only install upgrades with nothing changed except Settings' new home: same calendars and views, same card options, same theme, no first-run setup (`onboarding_complete` decides, as today), and every key a calendar row had is kept, plus `member_id`.
- Rollback-safe data (spec 7.8): the `planavista.household` Store is version 1, minor version 1; loading keeps fields it doesn't know and saves them back; every migration is safe to run twice. The config entry stays at version 1 with no minor version (milestone 3 adds the first one).
- PINs are 4 to 6 digits. They travel only in `planavista/pin/*` WebSocket commands, as a field whose schema is `object` and whose format is checked inside the handler with a fixed message, so Home Assistant's error logging never quotes one. They never appear in actions, events, entity attributes, logs written by PlanaVista, error messages, or the Store (which holds only the scrypt hash, the salt, and the length). scrypt `n = 2**14, r = 8, p = 1`, 32 bytes, a random 16-byte salt per PIN, run in the executor, compared with `hmac.compare_digest`.
- Every household command checks the spec 9.5 rule through `household/permissions.py`. A shared-screen account's admin status never bypasses it.
- Sessions are backend tokens bound to the WebSocket connection, in memory only, ending after 120 idle seconds, on Lock, when the connection closes, or when Home Assistant restarts. The card reports activity at most every 30 seconds and locks when the page is hidden.
- Copy (spec 11.7): sentence case; one name per thing; every sub-screen has a back control naming its parent ("‹ Settings", "‹ People"); destructive actions are confirmed by name; errors say what happened and what to do next.
- Accessibility (spec 11.8): touch targets at least 48 px; new sheets are dialogs with a focus trap, Escape to close, and focus returned to where it came from.
- Lit conventions: `experimentalDecorators`, `useDefineForClassFields: false`, `@property` and `@state`, `pv-` prefix; register every element through `defineElement` in `src/utils/define.ts`.
- vitest runs in Node with no DOM. Logic that needs tests lives in modules that import no Lit elements. Elements are checked on the dev Home Assistant.
- Only the sample household (Alex, Blair, Casey, Dana) appears in code, tests, fixtures, docs, and screenshots.
- Don't commit `custom_components/planavista/frontend/dist/` until Task 13. Don't touch `assets/readme-social.jpg`. Never stage `docs/plans/CHORES_HANDOFF.md`, `docs/plans/household-plan.json`, `docs/plans/household-hours-reference.html`, `CLAUDE.md`, `BRAND.md`, or `.serena/`.
- Commit messages end with these two lines:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj`
- Don't merge, tag, or release in this plan. Pushing the milestone branch for CI is allowed.
- Backend tests: `bash scripts/test-backend.sh` (from the repository root). Frontend checks: `cd custom_components/planavista/frontend && npx tsc --noEmit -p . && npm test`.
- Paths are relative to the repository root unless a step says otherwise.

## Review Focus

1. **A wall tablet signed in with an account that isn't linked to anyone and isn't an admin** (the account kind spec 9.5 treats as a shared screen). After the upgrade the calendar is unchanged; the gear, which 1.1.0 hid for non-admins, now leads to a parent's PIN or, when no parent has one, to a sheet that says how to get one. Settings never opens half-working. Pinned by Task 5's account-kind tests, Task 7's `settingsAccess` tests, and Task 13's Kitchen-account check.
2. **Parallel PIN tries for one member** (two screens, or one client firing many commands) can't skip the pause: tries for a member are checked one at a time. Pinned by Task 6's parallel-tries test.
3. **A parent-mode session after a reconnect or on a second card:** the token belongs to one card and one connection, so after Home Assistant restarts the card must notice that touch fails and lock, not fail later in the middle of an edit. Pinned by Task 6's connection tests and Task 7's session tests (touch failure ends the session).
4. **People and calendars that disappear:** a calendar whose member was removed on another screen, or whose Home Assistant person was deleted, loses the link without crashing, removed people aren't re-created by the next restart, and Belongs to shows Nobody. Pinned by Task 1's linking tests and Task 5's delete test.
5. **Typing on a tablet in portrait:** the on-screen keyboard shrinks the page, which must not flip Settings from the stack to the split view while someone types a name. Pinned by Task 7's keyboard-rule test and Task 13's portrait check.

## Plan rulings

These were decided while writing the plan; execution ledgers them with the others.

- **Ruling: the household Store uses Home Assistant's `Store` as it is (no subclass).** In 2026.9.4 a plain `Store` loads a newer minor version unchanged and saves it with the older number, and raises `UnsupportedStorageVersionError` for a newer major version, which is exactly spec 7.8. Cost if wrong: the first real migration adds a subclass.
- **Ruling: people are created from calendars only in a one-time migration and when a calendar is newly linked to a person in Settings.** Linking on every start would re-create someone a parent just removed (their calendar keeps its Home Assistant person). The migration is marked done in the household Store (`migrations.people_from_calendars`) and runs once Home Assistant has started, so the person entities exist. Cost if wrong: a person-linked calendar added outside PlanaVista's Settings (for example with the `save_config` action) doesn't create its member until someone opens its Settings row.
- **Ruling: migrated people are adults, and parents when their Home Assistant user is an admin.** 1.1.0 let only admins change settings, so this keeps who may change them. Cost if wrong: a parent edits a few age groups in People.
- **Ruling: every 5 wrong tries in a row start a pause; pauses are 30 s, 60 s, 120 s, and so on up to 15 minutes; a correct PIN or a parent resets the count.** This is the literal reading of spec 9.6. Cost if wrong: one constant.
- **Ruling: the public member view includes `pin_length`.** The approved PIN sheet shows one box per digit, so the card must know the length, and the sheet can check the PIN as soon as the last digit is in. Cost if wrong: an OK key on the keypad.
- **Ruling: Home Assistant's own WebSocket debug logging is out of PlanaVista's reach.** With debug logging turned on for `homeassistant.components.websocket_api`, Home Assistant prints every incoming message, access tokens included. PlanaVista never logs a PIN, and its PIN fields are built so Home Assistant's error logging can't quote one; the leak test turns Home Assistant's WebSocket debug logging off and everything else of PlanaVista's on. Cost if wrong: an admin who turns on that debug logging and shares the log shares PINs, as they would share tokens.
- **Ruling: marking an account as a shared screen needs at least one parent with a PIN, and the last parent PIN can't be removed while any account is marked shared.** Without this, a household could lock itself out of Settings on its only screen. Cost if wrong: one guard to drop.
- **Ruling: the size classifier from milestone 3 (spec 12.1) arrives now,** because Settings' split view and stack, and the PIN sheet's two shapes, need it. Milestone 3 applies it to the calendar and the header. Cost if wrong: none; it is the same function.
- **Ruling: commands the spec's list leaves out are added:** `planavista/pin/clear_lockout` (a parent clears a pause, spec 9.6), `planavista/household/settings/save` (Shuffle the keypad), and `planavista/household/setup/save` (where setup resumes). Cost if wrong: renames before release 1.3.0 pins the surface.
- **Ruling: in milestone 2 the Settings sidebar has People, Calendar (Calendars, Calendar options), Appearance (today's theme page, rebuilt in milestone 3), PINs and parent mode, and About PlanaVista.** Chores rows and Import and export arrive with chores; About gets diagnostics in milestone 4. The person page leaves out every chores row (Needs an OK for, My day, Stars, Saving up for, Away, sleep and bedtimes, phones, Use in automations). The People lead says "This is the order people appear in" until there is a board. Cost if wrong: copy changes in milestone 6.
- **Ruling: setup in milestone 2 is Welcome, Who lives here, Calendars, Look, and Done,** one column in every orientation. Restore from a file (milestone 6) and the landscape board preview (milestones 5 and 6) need chores. Calendar options leave setup: time format and first day come from Home Assistant's own settings, the first weather entity is picked, and Week is the default view; all of them stay in Settings. Cost if wrong: a new household opens Calendar options once.
- **Ruling: Calendars, Calendar options, and Appearance apply as you tap,** like Rules and Appearance in spec 14.1, and only the person page has Cancel and Save. Theme changes preview at once and save after 400 ms of quiet. Cost if wrong: a Save button per page.
- **Ruling: the three wizard pages are copied into their own elements by a script (Task 9), verbatim, and the old wizard stays until setup replaces it (Task 12).** Nothing breaks between tasks, and the CSS moves rule by rule as in milestone 1. Cost if wrong: two copies of the page code for three tasks.
- **Ruling: Lit elements are specified by a contract (properties, events, copy, layout) instead of full source in this plan,** while every piece of logic they use, and every test, is given in full. The elements are checked on the dev Home Assistant in Task 13. Cost if wrong: an executor has more freedom in render code than in logic.

---

### Task 0: Branch, baseline, and the sample household on the dev Home Assistant (controller)

The coordinating agent does this. Nothing is committed except this plan.

**Files:** screenshots under `m2-baseline/` in the session scratchpad.

- [ ] **Step 1: Confirm the branch and the dev Home Assistant**

```bash
git status --short --branch
bash scripts/dev-ha.sh status
python scripts/ha.py api GET /api/
```

Expected: branch `feat/chores-m2-members`; the container is up; `"message": "API running."`. If the API drops connections while the container is up, restart it with `docker restart planavista-dev-ha` and `bash scripts/dev-ha.sh wait` (Docker Desktop loses its port forward after it restarts).

- [ ] **Step 2: Deploy main's card and add the sample household's people and accounts**

```bash
bash scripts/dev-ha.sh deploy
```

Then, with `scripts/ha.py ws`, create these Home Assistant users (`config/auth/create` with `group_ids: ["system-users"]`, then `config/auth_provider/homeassistant/create` with a username and a password stored only in `~/.planavista-dev/credentials.json` next to the dev credentials) and people (`person/create`):

| User (non-admin) | Person | Notes |
|---|---|---|
| `alex` | Alex, linked to user `alex` | becomes a parent's own account |
| `casey` | Casey, linked to user `casey` | becomes a non-parent's own account |
| `kitchen` | none | the shared screen |
| none | Blair, no user | |

Then link the calendars to the people through the 1.1.0 data model: `python scripts/ha.py api POST /api/services/planavista/save_config` with the three calendars (`calendar.test_alex`, `calendar.test_blair`, `calendar.test_casey`) unchanged except `person_entity` set to `person.alex`, `person.blair`, and `person.casey`, and `onboarding_complete: true`.

Expected: `person/list` shows Alex, Blair, and Casey; `sensor.planavista_config` lists the three calendars with their people.

- [ ] **Step 3: Screenshot the calendar and Settings as they are**

In a fresh isolated context (`isolatedContext: "m2-baseline"`), signed in as the dev admin, open `http://127.0.0.1:8124/wall-calendar/planavista` and hard-reload. At 1280 × 800 screenshot the Week and Day views and each Settings tab; at 800 × 1280 and 390 × 844 screenshot the Week view. Note any console errors (expected: none from PlanaVista). Close every page (`close_page`).

---

### Task 1: Household members (pure rules)

**Files:**
- Create: `custom_components/planavista/household/__init__.py`
- Create: `custom_components/planavista/household/members.py`
- Test: `tests/test_household_members.py`

**Interfaces:**
- Produces (in `household/members.py`): `AGE_GROUPS`, `MY_DAY_STYLES`, `NEEDS_OK_FOR`, `AGE_GROUP_DEFAULTS: dict[str, dict[str, Any]]`, `EDITABLE_FIELDS`, `RESERVED_IDS`, `MAX_MEMBERS = 20`, `PALETTE: tuple[str, ...]`, `class MemberError(ValueError)` with `.code: str`, `slug(name) -> str`, `make_id(name, taken) -> str`, `palette_color(color) -> str | None`, `next_free_color(members, preferred=None) -> str | None`, `build_member(existing, changes, others) -> dict`, `ordered(members) -> list[dict]`, `add_member(members, changes) -> tuple[list[dict], dict]`, `update_member(members, member_id, changes, rev) -> tuple[list[dict], dict]`, `remove_member(members, member_id) -> list[dict]`, `reorder_members(members, ids) -> list[dict]`, `public_member(member, pin) -> dict`, `parents_with_pins(members, pins) -> list[str]`, `check_parent_pins(before, after, pins_before, pins_after, shared) -> None`, `link_calendars(calendars, members, persons, create_for) -> tuple[list[dict], list[dict]]`, `clear_missing_persons(members, persons) -> list[dict]`.
- `persons` everywhere maps a person entity id to `{"name": str, "user_id": str | None, "admin": bool}`.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_household_members.py`:

```python
"""Tests for household/members.py: ids, defaults, rules, and calendar links."""
from __future__ import annotations

from typing import Any

import pytest

from custom_components.planavista.household.members import (
    AGE_GROUP_DEFAULTS,
    MAX_MEMBERS,
    PALETTE,
    MemberError,
    add_member,
    build_member,
    check_parent_pins,
    clear_missing_persons,
    link_calendars,
    make_id,
    next_free_color,
    ordered,
    public_member,
    remove_member,
    reorder_members,
    slug,
    update_member,
)

PERSONS: dict[str, dict[str, Any]] = {
    "person.alex": {"name": "Alex", "user_id": "user-alex", "admin": True},
    "person.casey": {"name": "Casey", "user_id": "user-casey", "admin": False},
}


def _household(*names: str) -> list[dict[str, Any]]:
    members: list[dict[str, Any]] = []
    for name in names:
        members, _ = add_member(members, {"name": name})
    return members


def test_slug_makes_plain_ascii_words() -> None:
    assert slug("Casey") == "casey"
    assert slug("  Zoë Ann ") == "zoe_ann"
    assert slug("Dana-Lee!") == "dana_lee"
    assert slug("🦖") == "member"


def test_make_id_adds_a_number_on_a_collision_and_skips_reserved_words() -> None:
    assert make_id("Casey", []) == "casey"
    assert make_id("Casey", ["casey"]) == "casey_2"
    assert make_id("Casey", ["casey", "casey_2"]) == "casey_3"
    assert make_id("Admin", []) == "admin_2"
    assert make_id("Auto", []) == "auto_2"


def test_new_members_get_their_age_groups_defaults() -> None:
    _, dana = add_member([], {"name": "Dana", "age_group": "young_child"})
    assert {key: dana[key] for key in ("my_day", "needs_ok_for", "stars")} == AGE_GROUP_DEFAULTS["young_child"]
    assert dana["parent"] is False
    assert dana["picture"] == {"initial": True}
    assert dana["color"] == PALETTE[0]
    assert dana["color_dark"] is None
    assert (dana["id"], dana["order"], dana["rev"]) == ("dana", 0, 1)


def test_changing_the_age_group_applies_its_defaults_unless_given() -> None:
    members, _ = add_member([], {"name": "Casey", "age_group": "young_child"})
    members, casey = update_member(members, "casey", {"age_group": "teen"}, rev=1)
    assert casey["my_day"] == "timeline" and casey["needs_ok_for"] == "marked"
    members, casey = update_member(members, "casey", {"age_group": "older_child", "my_day": "pictures"}, rev=2)
    assert casey["my_day"] == "pictures" and casey["needs_ok_for"] == "marked"
    assert casey["rev"] == 3


def test_household_rules_name_the_broken_rule() -> None:
    members = _household("Alex")
    cases = [
        ({"name": "  "}, "name_required"),
        ({"name": "x" * 41}, "name_too_long"),
        ({"name": "alex"}, "name_taken"),
        ({"name": "Blair", "color": members[0]["color"]}, "color_taken"),
        ({"name": "Blair", "color": "#123456"}, "invalid_color"),
        ({"name": "Blair", "age_group": "baby"}, "invalid_age_group"),
        ({"name": "Blair", "person": "calendar.blair"}, "invalid_person"),
        ({"name": "Blair", "picture": {"emoji": ""}}, "invalid_picture"),
        ({"name": "Blair", "parent": "yes"}, "invalid_parent"),
    ]
    for changes, code in cases:
        with pytest.raises(MemberError) as err:
            add_member(members, changes)
        assert err.value.code == code, changes


def test_a_person_belongs_to_one_member() -> None:
    members, _ = add_member([], {"name": "Alex", "person": "person.alex"})
    with pytest.raises(MemberError) as err:
        add_member(members, {"name": "Blair", "person": "person.alex"})
    assert err.value.code == "person_taken"


def test_palette_colors_match_whatever_their_case() -> None:
    _, blair = add_member([], {"name": "Blair", "color": PALETTE[3].lower()})
    assert blair["color"] == PALETTE[3]
    assert next_free_color([blair], preferred=PALETTE[3]) == PALETTE[0]
    assert next_free_color([], preferred=PALETTE[5]) == PALETTE[5]
    assert next_free_color([{"color": color} for color in PALETTE]) is None


def test_a_household_has_at_most_twenty_people() -> None:
    members = _household(*[f"Person {n}" for n in range(MAX_MEMBERS)])
    with pytest.raises(MemberError) as err:
        add_member(members, {"name": "One more"})
    assert err.value.code == "too_many"


def test_saving_over_a_newer_revision_is_refused() -> None:
    members = _household("Casey")
    members, _ = update_member(members, "casey", {"name": "Casey B"}, rev=1)
    with pytest.raises(MemberError) as err:
        update_member(members, "casey", {"name": "Casey C"}, rev=1)
    assert err.value.code == "changed"
    with pytest.raises(MemberError) as err:
        update_member(members, "nobody", {"name": "X"}, rev=None)
    assert err.value.code == "unknown_member"


def test_renaming_keeps_the_id_and_unknown_fields_survive() -> None:
    members = _household("Casey")
    members[0]["bedtime"] = {"weeknight": "22:00"}
    members[0]["from_a_newer_version"] = [1, 2]
    members, casey = update_member(members, "casey", {"name": "Casey Jo"}, rev=1)
    assert casey["id"] == "casey"
    assert casey["bedtime"] == {"weeknight": "22:00"}
    assert casey["from_a_newer_version"] == [1, 2]


def test_a_photo_needs_a_linked_person() -> None:
    members, alex = add_member([], {"name": "Alex", "person": "person.alex"})
    assert alex["picture"] == {"person": True}
    members, alex = update_member(members, "alex", {"person": None}, rev=1)
    assert alex["picture"] == {"initial": True}
    _, dana = add_member(members, {"name": "Dana", "picture": {"emoji": " 🦖 "}})
    assert dana["picture"] == {"emoji": "🦖"}


def test_reorder_and_remove() -> None:
    members = _household("Alex", "Blair", "Casey")
    members = reorder_members(members, ["casey", "alex", "blair"])
    assert [m["id"] for m in ordered(members)] == ["casey", "alex", "blair"]
    with pytest.raises(MemberError) as err:
        reorder_members(members, ["casey", "alex"])
    assert err.value.code == "invalid_order"
    assert [m["id"] for m in ordered(remove_member(members, "alex"))] == ["casey", "blair"]


def test_public_view_shows_pin_status_but_no_pin_data() -> None:
    _, alex = add_member([], {"name": "Alex"})
    record = {"hash": "h", "salt": "s", "length": 4, "failures": 2, "lockouts": 0, "locked_until": None}
    view = public_member(alex, record)
    assert (view["has_pin"], view["pin_length"], view["locked_until"]) == (True, 4, None)
    assert "hash" not in view and "salt" not in view and "failures" not in view
    assert public_member(alex, None)["has_pin"] is False


def test_the_last_parent_pin_stays_while_screens_are_shared() -> None:
    members, _ = add_member([], {"name": "Alex", "parent": True})
    pins = {"alex": {"hash": "h"}}
    with pytest.raises(MemberError) as err:
        check_parent_pins(members, members, pins, {}, shared=True)
    assert err.value.code == "last_parent_pin"
    check_parent_pins(members, members, pins, {}, shared=False)
    check_parent_pins(members, members, {}, {}, shared=True)  # nothing to lose


def test_migration_creates_people_for_linked_calendars() -> None:
    calendars = [
        {"entity_id": "calendar.alex", "display_name": "Alex", "color": PALETTE[4], "person_entity": "person.alex", "icon": "mdi:account", "visible": True},
        {"entity_id": "calendar.casey", "display_name": "Casey", "color": "#ABCDEF", "person_entity": "person.casey"},
        {"entity_id": "calendar.family", "display_name": "Family", "color": PALETTE[4], "person_entity": ""},
    ]
    rows, members = link_calendars(calendars, [], PERSONS, create_for=set(PERSONS))
    by_id = {m["id"]: m for m in members}
    assert [row.get("member_id") for row in rows] == ["alex", "casey", None]
    assert "member_id" not in rows[2]
    assert rows[0]["icon"] == "mdi:account" and rows[0]["visible"] is True
    assert by_id["alex"]["parent"] is True and by_id["casey"]["parent"] is False
    assert by_id["alex"]["age_group"] == "adult" == by_id["casey"]["age_group"]
    assert by_id["alex"]["color"] == PALETTE[4]
    assert by_id["casey"]["color"] in PALETTE
    assert by_id["casey"]["picture"] == {"person": True}

    again_rows, again_members = link_calendars(rows, members, PERSONS, create_for=set(PERSONS))
    assert (again_rows, again_members) == (rows, members)


def test_linking_without_permission_to_create_only_uses_existing_people() -> None:
    calendars = [{"entity_id": "calendar.casey", "person_entity": "person.casey", "member_id": None}]
    rows, members = link_calendars(calendars, [], PERSONS, create_for=set())
    assert rows[0]["member_id"] is None and members == []


def test_a_person_linked_calendar_without_a_member_keeps_its_chosen_owner() -> None:
    members = _household("Dana")
    calendars = [{"entity_id": "calendar.casey", "person_entity": "person.casey", "member_id": "dana"}]
    rows, _ = link_calendars(calendars, members, PERSONS, create_for=set())
    assert rows[0]["member_id"] == "dana"


def test_an_unlinked_member_with_the_same_name_is_linked_instead_of_duplicated() -> None:
    members = _household("Casey")
    calendars = [{"entity_id": "calendar.casey", "person_entity": "person.casey"}]
    rows, linked = link_calendars(calendars, members, PERSONS, create_for={"person.casey"})
    assert rows[0]["member_id"] == "casey"
    assert len(linked) == 1 and linked[0]["person"] == "person.casey" and linked[0]["rev"] == 2


def test_missing_people_and_members_clear_the_link() -> None:
    members = _household("Dana")
    calendars = [
        {"entity_id": "calendar.gone", "person_entity": "person.gone", "member_id": None},
        {"entity_id": "calendar.removed", "person_entity": "", "member_id": "blair"},
    ]
    rows, _ = link_calendars(calendars, members, PERSONS, create_for={"person.gone"})
    assert [row["member_id"] for row in rows] == [None, None]


def test_clear_missing_persons_drops_links_to_deleted_people() -> None:
    members, _ = add_member([], {"name": "Blair", "person": "person.blair"})
    cleared = clear_missing_persons(members, PERSONS)
    assert cleared[0]["person"] is None
    assert cleared[0]["picture"] == {"initial": True}
    assert cleared[0]["rev"] == 2
    assert clear_missing_persons(cleared, PERSONS) == cleared
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_household_members.py -q`
Expected: collection error, `ModuleNotFoundError: No module named 'custom_components.planavista.household'`.

- [ ] **Step 3: Write the implementation**

Create `custom_components/planavista/household/__init__.py`:

```python
"""The household: members, PINs, parent mode, and shared screens (shared by every module)."""
```

Create `custom_components/planavista/household/members.py`:

```python
"""Household members: ids, age-group defaults, rules, and calendar links.

Nothing here touches Home Assistant, so the rules are tested directly.
Members are plain dicts: fields written by a newer release are kept as they
are when this one saves (spec section 7.8).
"""
from __future__ import annotations

from collections.abc import Collection, Iterable, Mapping
import re
from typing import Any
import unicodedata

from ..const import DEFAULT_COLORS

AGE_GROUPS = ("young_child", "older_child", "teen", "adult")
MY_DAY_STYLES = ("timeline", "list", "pictures")
NEEDS_OK_FOR = ("all", "marked", "none")

# Applied when the age group is chosen or changed; each can be changed per member.
AGE_GROUP_DEFAULTS: dict[str, dict[str, Any]] = {
    "young_child": {"my_day": "pictures", "needs_ok_for": "all", "stars": True},
    "older_child": {"my_day": "list", "needs_ok_for": "marked", "stars": True},
    "teen": {"my_day": "timeline", "needs_ok_for": "marked", "stars": True},
    "adult": {"my_day": "timeline", "needs_ok_for": "none", "stars": False},
}

# Fields a member save may change. Anything else on a stored member is kept.
EDITABLE_FIELDS = (
    "name",
    "color",
    "picture",
    "age_group",
    "parent",
    "person",
    "my_day",
    "needs_ok_for",
    "stars",
)

# Records name who acted with a member id or one of these words (spec 7.6).
RESERVED_IDS = frozenset({"automation", "admin", "auto"})

# The 20 calendar color presets; no two members share one.
PALETTE: tuple[str, ...] = tuple(DEFAULT_COLORS)
MAX_MEMBERS = len(PALETTE)
NAME_MAX_LENGTH = 40
EMOJI_MAX_LENGTH = 16


class MemberError(ValueError):
    """A change that breaks a household rule. `code` names the rule."""

    def __init__(self, code: str) -> None:
        """Remember which rule was broken."""
        super().__init__(code)
        self.code = code


def slug(name: str) -> str:
    """Lowercase ASCII words joined by underscores; accents become plain letters."""
    plain = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", plain.lower()).strip("_") or "member"


def make_id(name: str, taken: Iterable[str]) -> str:
    """A new member id made from the name, with _2, _3, ... on a collision."""
    used = set(taken) | RESERVED_IDS
    base = slug(name)
    if base not in used:
        return base
    number = 2
    while f"{base}_{number}" in used:
        number += 1
    return f"{base}_{number}"


def palette_color(color: object) -> str | None:
    """The palette's spelling of `color`, or None when it isn't a palette color."""
    if not isinstance(color, str):
        return None
    wanted = color.strip().upper()
    return next((c for c in PALETTE if c.upper() == wanted), None)


def next_free_color(
    members: Iterable[Mapping[str, Any]], preferred: object = None
) -> str | None:
    """`preferred` when it is a free palette color, else the first free one."""
    taken = {str(m.get("color", "")).upper() for m in members}
    choice = palette_color(preferred)
    if choice is not None and choice.upper() not in taken:
        return choice
    return next((c for c in PALETTE if c.upper() not in taken), None)


def _checked_picture(picture: object, person: str | None) -> dict[str, Any]:
    """An initial, an emoji, or the Home Assistant person's photo (which needs a person)."""
    if picture is None:
        return {"person": True} if person else {"initial": True}
    if not isinstance(picture, Mapping) or len(picture) != 1:
        raise MemberError("invalid_picture")
    if picture.get("initial") is True:
        return {"initial": True}
    if picture.get("person") is True:
        return {"person": True} if person else {"initial": True}
    emoji = picture.get("emoji")
    if isinstance(emoji, str) and 0 < len(emoji.strip()) <= EMOJI_MAX_LENGTH:
        return {"emoji": emoji.strip()}
    raise MemberError("invalid_picture")


def build_member(
    existing: Mapping[str, Any] | None,
    changes: Mapping[str, Any],
    others: Iterable[Mapping[str, Any]],
) -> dict[str, Any]:
    """Return the member after `changes`, checked against the household rules.

    `existing` is the stored member, or None when adding someone; `others` is
    everyone else. Stored fields this version doesn't edit are kept. Raises
    MemberError naming the broken rule.
    """
    others = list(others)
    member: dict[str, Any] = dict(existing) if existing else {}
    for key in EDITABLE_FIELDS:
        if key in changes:
            member[key] = changes[key]

    name = member.get("name")
    name = name.strip() if isinstance(name, str) else ""
    if not name:
        raise MemberError("name_required")
    if len(name) > NAME_MAX_LENGTH:
        raise MemberError("name_too_long")
    if any(str(o.get("name", "")).casefold() == name.casefold() for o in others):
        raise MemberError("name_taken")
    member["name"] = name

    age_group = member.get("age_group", "adult")
    if age_group not in AGE_GROUPS:
        raise MemberError("invalid_age_group")
    age_changed = existing is None or existing.get("age_group") != age_group
    for key, value in AGE_GROUP_DEFAULTS[age_group].items():
        if key not in changes and (age_changed or key not in member):
            member[key] = value
    member["age_group"] = age_group
    if member["my_day"] not in MY_DAY_STYLES:
        raise MemberError("invalid_my_day")
    if member["needs_ok_for"] not in NEEDS_OK_FOR:
        raise MemberError("invalid_needs_ok_for")
    if not isinstance(member["stars"], bool):
        raise MemberError("invalid_stars")
    member.setdefault("parent", False)
    if not isinstance(member["parent"], bool):
        raise MemberError("invalid_parent")

    color = palette_color(member.get("color") or next_free_color(others))
    if color is None:
        raise MemberError("invalid_color")
    if any(str(o.get("color", "")).upper() == color.upper() for o in others):
        raise MemberError("color_taken")
    member["color"] = color
    member.setdefault("color_dark", None)

    person = member.get("person") or None
    if person is not None and (
        not isinstance(person, str) or not person.startswith("person.")
    ):
        raise MemberError("invalid_person")
    if person is not None and any(o.get("person") == person for o in others):
        raise MemberError("person_taken")
    member["person"] = person
    member["picture"] = _checked_picture(member.get("picture"), person)
    return member


def ordered(members: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
    """Members in board order (Settings order, left to right, then down)."""
    return sorted((dict(m) for m in members), key=lambda m: (m.get("order", 0), m["id"]))


def add_member(
    members: list[dict[str, Any]], changes: Mapping[str, Any]
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Add someone at the end; returns the new list and the new member."""
    if len(members) >= MAX_MEMBERS:
        raise MemberError("too_many")
    member = build_member(None, changes, members)
    member["id"] = make_id(member["name"], (m["id"] for m in members))
    member["order"] = max((int(m.get("order", 0)) for m in members), default=-1) + 1
    member["rev"] = 1
    return [*members, member], member


def update_member(
    members: list[dict[str, Any]],
    member_id: str,
    changes: Mapping[str, Any],
    rev: int | None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Change someone. `rev` must match the stored revision when given."""
    index = next((i for i, m in enumerate(members) if m["id"] == member_id), None)
    if index is None:
        raise MemberError("unknown_member")
    existing = members[index]
    if rev is not None and rev != existing.get("rev", 1):
        raise MemberError("changed")
    others = [m for i, m in enumerate(members) if i != index]
    member = build_member(existing, changes, others)
    member["id"] = existing["id"]
    member["order"] = existing.get("order", index)
    member["rev"] = int(existing.get("rev", 1)) + 1
    updated = list(members)
    updated[index] = member
    return updated, member


def remove_member(members: list[dict[str, Any]], member_id: str) -> list[dict[str, Any]]:
    """Everyone except `member_id`."""
    if not any(m["id"] == member_id for m in members):
        raise MemberError("unknown_member")
    return [m for m in members if m["id"] != member_id]


def reorder_members(members: list[dict[str, Any]], ids: list[str]) -> list[dict[str, Any]]:
    """Members in the order of `ids`, which must name each member once."""
    by_id = {m["id"]: m for m in members}
    if sorted(ids) != sorted(by_id):
        raise MemberError("invalid_order")
    return [{**by_id[member_id], "order": position} for position, member_id in enumerate(ids)]


def public_member(member: Mapping[str, Any], pin: Mapping[str, Any] | None) -> dict[str, Any]:
    """What every screen may see: the member, and whether they have a PIN."""
    view = dict(member)
    view["has_pin"] = pin is not None
    view["pin_length"] = pin.get("length") if pin else None
    view["locked_until"] = pin.get("locked_until") if pin else None
    return view


def parents_with_pins(
    members: Iterable[Mapping[str, Any]], pins: Mapping[str, Any]
) -> list[str]:
    """Ids of parents who have a PIN (they can start parent mode on a shared screen)."""
    return [m["id"] for m in members if m.get("parent") and m["id"] in pins]


def check_parent_pins(
    members_before: Iterable[Mapping[str, Any]],
    members_after: Iterable[Mapping[str, Any]],
    pins_before: Mapping[str, Any],
    pins_after: Mapping[str, Any],
    shared: bool,
) -> None:
    """Refuse a change that leaves shared screens with no parent who has a PIN."""
    if (
        shared
        and parents_with_pins(members_before, pins_before)
        and not parents_with_pins(members_after, pins_after)
    ):
        raise MemberError("last_parent_pin")


def _link_or_add(
    household: list[dict[str, Any]],
    person: str,
    info: Mapping[str, Any],
    calendar: Mapping[str, Any],
) -> dict[str, Any] | None:
    """The member for `person`: an unlinked member with the same name, or someone new."""
    name = str(
        info.get("name") or calendar.get("display_name") or person.removeprefix("person.")
    ).strip()
    for member in household:
        if not member.get("person") and str(member.get("name", "")).casefold() == name.casefold():
            member["person"] = person
            member["rev"] = int(member.get("rev", 1)) + 1
            return member
    for candidate in [name, *(f"{name} {n}" for n in range(2, MAX_MEMBERS + 2))]:
        try:
            updated, member = add_member(
                household,
                {
                    "name": candidate,
                    "color": next_free_color(household, calendar.get("color")),
                    "age_group": "adult",
                    "parent": bool(info.get("admin")),
                    "person": person,
                },
            )
        except MemberError as err:
            if err.code == "name_taken":
                continue
            return None
        household[:] = updated
        return member
    return None


def link_calendars(
    calendars: Iterable[Mapping[str, Any]],
    members: Iterable[Mapping[str, Any]],
    persons: Mapping[str, Mapping[str, Any]],
    create_for: Collection[str],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Give calendars their `member_id`; returns (calendars, members afterwards).

    A calendar linked to a Home Assistant person belongs to that person's
    member. When the person has no member yet and is in `create_for` (and
    still exists in `persons`), one is created, or an unlinked member with
    the same name gets the link. Otherwise a calendar keeps its `member_id`
    while that member exists. A row that belongs to nobody gets no new key,
    so an install without people sees no change at all. Every other key of
    a calendar row is kept. Running it again on its own output changes
    nothing.
    """
    household = [dict(m) for m in members]
    rows: list[dict[str, Any]] = []
    for calendar in calendars:
        row = dict(calendar)
        person = row.get("person_entity") or None
        member = None
        if person:
            member = next((m for m in household if m.get("person") == person), None)
            if member is None and person in create_for and person in persons:
                member = _link_or_add(household, person, persons[person], row)
        if member is None and row.get("member_id"):
            member = next((m for m in household if m["id"] == row["member_id"]), None)
        if member is not None:
            row["member_id"] = member["id"]
        elif "member_id" in row:
            row["member_id"] = None
        rows.append(row)
    return rows, household


def clear_missing_persons(
    members: Iterable[Mapping[str, Any]], persons: Mapping[str, Any]
) -> list[dict[str, Any]]:
    """Members whose Home Assistant person was deleted lose the link (spec 15.4)."""
    result: list[dict[str, Any]] = []
    for member in members:
        member = dict(member)
        if member.get("person") and member["person"] not in persons:
            member["person"] = None
            if member.get("picture") == {"person": True}:
                member["picture"] = {"initial": True}
            member["rev"] = int(member.get("rev", 1)) + 1
        result.append(member)
    return result
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh tests/test_household_members.py -q`
Expected: `20 passed`.

- [ ] **Step 5: Run the copy check and commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/__init__.py custom_components/planavista/household/members.py tests/test_household_members.py
git commit -F - <<'EOF'
feat(household): add household members and their rules

Members get ids made from their names, age-group defaults, one palette
color each, and revision numbers for edits from two screens. Calendars
linked to a Home Assistant person belong to that person's member.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

Expected: the copy check prints nothing and exits 0; one commit.

---
### Task 2: PINs, pauses, and sessions (pure rules)

**Files:**
- Create: `custom_components/planavista/household/security.py`
- Test: `tests/test_household_security.py`

**Interfaces:**
- Produces: `MAX_TRIES = 5`, `FIRST_PAUSE_SECONDS = 30`, `MAX_PAUSE_SECONDS = 900`, `SESSION_IDLE_SECONDS = 120`, `valid_pin(pin: object) -> bool`, `hash_pin(pin: str) -> dict` (blocks, run in the executor), `verify_pin(pin: str, record) -> bool` (blocks), `pause_remaining(record, now: datetime) -> float`, `tries_left(record) -> int`, `after_failure(record, now) -> dict`, `after_success(record) -> dict`, `@dataclass Session(token, member_id, parent, last_active, connection)` with `expires_in(now: float) -> float`, and `SessionManager` with `__len__()`, `start(member_id, parent, connection, now) -> Session`, `get(token, connection, now, *, touch=False) -> Session | None`, `end(token)`, `end_connection(connection)`, `end_member(member_id, keep=None)`, `end_parent_mode(member_id)`.
- A PIN record is `{"hash": str, "salt": str, "length": int, "failures": int, "lockouts": int, "locked_until": str | None}` (base64 strings, ISO time in UTC).
- Session clocks are monotonic seconds (`float`); pause clocks are aware `datetime`s.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_household_security.py`:

```python
"""Tests for household/security.py: PIN hashes, pauses, and sessions."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from custom_components.planavista.household.security import (
    FIRST_PAUSE_SECONDS,
    MAX_PAUSE_SECONDS,
    MAX_TRIES,
    SESSION_IDLE_SECONDS,
    SessionManager,
    after_failure,
    after_success,
    hash_pin,
    pause_remaining,
    tries_left,
    valid_pin,
    verify_pin,
)

NOW = datetime(2026, 10, 13, 21, 10, tzinfo=UTC)


def test_valid_pins_are_four_to_six_ascii_digits() -> None:
    assert all(valid_pin(pin) for pin in ("0000", "48261", "482613"))
    assert not any(
        valid_pin(pin)
        for pin in ("123", "1234567", "12a4", " 1234", "1234\n", "１２３４", 1234, None, ["1234"])
    )


def test_a_pin_record_holds_a_salted_hash_and_never_the_pin() -> None:
    record = hash_pin("482613")
    assert set(record) == {"hash", "salt", "length", "failures", "lockouts", "locked_until"}
    assert (record["length"], record["failures"], record["lockouts"], record["locked_until"]) == (6, 0, 0, None)
    assert "482613" not in repr(record)
    assert hash_pin("482613")["salt"] != record["salt"]


def test_verify_accepts_only_the_right_pin() -> None:
    record = hash_pin("4826")
    assert verify_pin("4826", record)
    assert not verify_pin("4827", record)
    assert not verify_pin("48260", record)
    assert not verify_pin("", record)
    assert not verify_pin("4826", {"hash": "not base64!", "salt": "x"})


def test_hash_pin_refuses_a_bad_pin_without_repeating_it() -> None:
    with pytest.raises(ValueError) as err:
        hash_pin("12a4")
    assert "12a4" not in str(err.value)


def test_every_fifth_wrong_try_starts_a_longer_pause() -> None:
    record = hash_pin("4826")
    now = NOW
    pauses = []
    for _ in range(7):
        for attempt in range(MAX_TRIES):
            assert pause_remaining(record, now) == 0
            record = after_failure(record, now)
            if attempt < MAX_TRIES - 1:
                assert tries_left(record) == MAX_TRIES - attempt - 1
        pauses.append(pause_remaining(record, now))
        now += timedelta(seconds=pauses[-1] + 1)
    assert pauses == [30, 60, 120, 240, 480, 900, 900]
    assert (FIRST_PAUSE_SECONDS, MAX_PAUSE_SECONDS) == (30, 900)


def test_a_correct_pin_resets_the_count() -> None:
    record = after_failure(after_failure(hash_pin("4826"), NOW), NOW)
    record = after_success(record)
    assert (record["failures"], record["lockouts"], record["locked_until"]) == (0, 0, None)
    assert tries_left(record) == MAX_TRIES


def test_pause_remaining_counts_down() -> None:
    record = hash_pin("4826")
    for _ in range(MAX_TRIES):
        record = after_failure(record, NOW)
    assert pause_remaining(record, NOW + timedelta(seconds=10)) == 20
    assert pause_remaining(record, NOW + timedelta(seconds=31)) == 0
    assert pause_remaining({"locked_until": "garbage"}, NOW) == 0


def test_sessions_are_bound_to_their_connection_and_idle_out() -> None:
    sessions = SessionManager()
    screen, other = object(), object()
    session = sessions.start("blair", parent=True, connection=screen, now=100.0)
    assert len(session.token) >= 43
    assert sessions.get(session.token, screen, 100.0 + SESSION_IDLE_SECONDS - 1) is session
    assert sessions.get(session.token, other, 101.0) is None
    assert sessions.get(session.token, screen, 100.0 + SESSION_IDLE_SECONDS) is None
    assert sessions.get(session.token, screen, 101.0) is None
    assert sessions.get(None, screen, 101.0) is None


def test_touch_keeps_a_session_alive() -> None:
    sessions = SessionManager()
    screen = object()
    session = sessions.start("blair", parent=True, connection=screen, now=0.0)
    for now in (100.0, 200.0, 300.0):
        assert sessions.get(session.token, screen, now, touch=True) is session
    assert session.expires_in(300.0) == SESSION_IDLE_SECONDS
    assert sessions.get(session.token, screen, 300.0 + SESSION_IDLE_SECONDS + 1) is None


def test_ending_sessions() -> None:
    sessions = SessionManager()
    screen, kitchen = object(), object()
    blair = sessions.start("blair", parent=True, connection=screen, now=0.0)
    casey = sessions.start("casey", parent=False, connection=screen, now=0.0)
    alex = sessions.start("alex", parent=True, connection=kitchen, now=0.0)
    sessions.end(blair.token)
    sessions.end(blair.token)
    assert sessions.get(blair.token, screen, 1.0) is None
    sessions.end_connection(screen)
    assert sessions.get(casey.token, screen, 1.0) is None
    assert sessions.get(alex.token, kitchen, 1.0) is alex
    assert len(sessions) == 1
    sessions.end_member("alex")
    assert sessions.get(alex.token, kitchen, 1.0) is None
    assert len(sessions) == 0


def test_end_member_keeps_the_session_that_made_the_change() -> None:
    sessions = SessionManager()
    screen, kitchen = object(), object()
    here = sessions.start("blair", parent=True, connection=screen, now=0.0)
    there = sessions.start("blair", parent=True, connection=kitchen, now=0.0)
    sessions.end_member("blair", keep=here.token)
    assert sessions.get(here.token, screen, 1.0) is here
    assert sessions.get(there.token, kitchen, 1.0) is None


def test_end_parent_mode_only_ends_parent_sessions() -> None:
    sessions = SessionManager()
    screen = object()
    parent = sessions.start("blair", parent=True, connection=screen, now=0.0)
    own = sessions.start("blair", parent=False, connection=screen, now=0.0)
    sessions.end_parent_mode("blair")
    assert sessions.get(parent.token, screen, 1.0) is None
    assert sessions.get(own.token, screen, 1.0) is own
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_household_security.py -q`
Expected: collection error, `ModuleNotFoundError: No module named 'custom_components.planavista.household.security'`.

- [ ] **Step 3: Write the implementation**

Create `custom_components/planavista/household/security.py`:

```python
"""PINs: scrypt hashes, pauses after wrong tries, and in-memory sessions.

hash_pin and verify_pin block for about 40 ms, so callers run them in the
executor. The pause and session rules take the time as an argument. Nothing
here logs, and no error message repeats a PIN.
"""
from __future__ import annotations

import base64
import binascii
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import hashlib
import hmac
import re
import secrets
from typing import Any

PIN_PATTERN = re.compile(r"[0-9]{4,6}")
SCRYPT_N = 2**14
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_LENGTH = 32
SALT_BYTES = 16

MAX_TRIES = 5
FIRST_PAUSE_SECONDS = 30
MAX_PAUSE_SECONDS = 15 * 60

SESSION_IDLE_SECONDS = 120


def valid_pin(pin: object) -> bool:
    """4 to 6 ASCII digits."""
    return isinstance(pin, str) and PIN_PATTERN.fullmatch(pin) is not None


def _derive(pin: str, salt: bytes) -> bytes:
    return hashlib.scrypt(
        pin.encode("ascii"),
        salt=salt,
        n=SCRYPT_N,
        r=SCRYPT_R,
        p=SCRYPT_P,
        dklen=SCRYPT_LENGTH,
    )


def hash_pin(pin: str) -> dict[str, Any]:
    """A new PIN record with no failures. Blocks: run it in the executor."""
    if not valid_pin(pin):
        raise ValueError("PINs are 4 to 6 digits")
    salt = secrets.token_bytes(SALT_BYTES)
    return {
        "hash": base64.b64encode(_derive(pin, salt)).decode("ascii"),
        "salt": base64.b64encode(salt).decode("ascii"),
        "length": len(pin),
        "failures": 0,
        "lockouts": 0,
        "locked_until": None,
    }


def verify_pin(pin: str, record: Mapping[str, Any]) -> bool:
    """Whether `pin` matches the record, compared in constant time. Blocks."""
    if not valid_pin(pin):
        return False
    try:
        salt = base64.b64decode(record["salt"], validate=True)
        expected = base64.b64decode(record["hash"], validate=True)
    except (KeyError, TypeError, ValueError, binascii.Error):
        return False
    return hmac.compare_digest(_derive(pin, salt), expected)


def pause_remaining(record: Mapping[str, Any], now: datetime) -> float:
    """Seconds until the member may try again; 0 when they may now."""
    until = record.get("locked_until")
    if not until:
        return 0.0
    try:
        end = datetime.fromisoformat(until)
    except (TypeError, ValueError):
        return 0.0
    return max(0.0, (end - now).total_seconds())


def tries_left(record: Mapping[str, Any]) -> int:
    """Wrong tries left before the next pause."""
    return MAX_TRIES - int(record.get("failures", 0))


def after_failure(record: Mapping[str, Any], now: datetime) -> dict[str, Any]:
    """The record after a wrong PIN: every fifth wrong try in a row starts a pause.

    Pauses double from 30 seconds up to 15 minutes until a correct PIN, or a
    parent, resets the count (spec section 9.6).
    """
    updated = dict(record)
    failures = int(updated.get("failures", 0)) + 1
    if failures < MAX_TRIES:
        updated["failures"] = failures
        return updated
    lockouts = int(updated.get("lockouts", 0)) + 1
    seconds = min(FIRST_PAUSE_SECONDS * 2 ** min(lockouts - 1, 10), MAX_PAUSE_SECONDS)
    updated.update(
        failures=0,
        lockouts=lockouts,
        locked_until=(now + timedelta(seconds=seconds)).isoformat(),
    )
    return updated


def after_success(record: Mapping[str, Any]) -> dict[str, Any]:
    """The record after a correct PIN, or after a parent clears a pause."""
    return {**record, "failures": 0, "lockouts": 0, "locked_until": None}


@dataclass
class Session:
    """A PIN session on one screen: parent mode, or a member's own session."""

    token: str
    member_id: str
    parent: bool
    last_active: float
    connection: object = field(repr=False)

    def expires_in(self, now: float) -> float:
        """Seconds of quiet left before the session ends."""
        return max(0.0, self.last_active + SESSION_IDLE_SECONDS - now)


class SessionManager:
    """Sessions live in memory only, so a restart or a closed connection forgets them."""

    def __init__(self) -> None:
        """Start with no sessions."""
        self._sessions: dict[str, Session] = {}

    def __len__(self) -> int:
        """How many sessions are open (some may have idled out without being asked yet)."""
        return len(self._sessions)

    def start(self, member_id: str, parent: bool, connection: object, now: float) -> Session:
        """A new session for `member_id` on `connection`."""
        self._drop(lambda s: now - s.last_active >= SESSION_IDLE_SECONDS)
        session = Session(secrets.token_urlsafe(32), member_id, parent, now, connection)
        self._sessions[session.token] = session
        return session

    def get(
        self, token: str | None, connection: object, now: float, *, touch: bool = False
    ) -> Session | None:
        """The live session for `token` on this connection; `touch` counts as activity."""
        session = self._sessions.get(token) if token else None
        if session is None or session.connection is not connection:
            return None
        if now - session.last_active >= SESSION_IDLE_SECONDS:
            del self._sessions[session.token]
            return None
        if touch:
            session.last_active = now
        return session

    def end(self, token: str) -> None:
        """End one session (Lock, or a hidden page)."""
        self._sessions.pop(token, None)

    def end_connection(self, connection: object) -> None:
        """End every session of a connection that closed."""
        self._drop(lambda s: s.connection is connection)

    def end_member(self, member_id: str, keep: str | None = None) -> None:
        """End a member's sessions (their PIN changed, or they were removed)."""
        self._drop(lambda s: s.member_id == member_id and s.token != keep)

    def end_parent_mode(self, member_id: str) -> None:
        """End parent mode for someone who is no longer a parent."""
        self._drop(lambda s: s.member_id == member_id and s.parent)

    def _drop(self, matches: Callable[[Session], bool]) -> None:
        for token in [token for token, s in self._sessions.items() if matches(s)]:
            del self._sessions[token]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh tests/test_household_security.py -q`
Expected: `12 passed`.

- [ ] **Step 5: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/security.py tests/test_household_security.py
git commit -F - <<'EOF'
feat(household): hash PINs, pause after wrong tries, and track sessions

PINs are kept as scrypt hashes with a salt each. Every fifth wrong try in
a row starts a pause that doubles from 30 seconds to 15 minutes. Sessions
live in memory, belong to one connection, and end after two quiet minutes.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 3: Who may do what (pure rules, spec section 9.5)

**Files:**
- Create: `custom_components/planavista/household/permissions.py`
- Test: `tests/test_household_permissions.py`

**Interfaces:**
- Produces: `AUTOMATION = "automation"`, `ADMIN = "admin"`, `@dataclass(frozen=True) Account(user_id: str | None, is_admin=False, shared=False, member_id: str | None = None, member_is_parent=False)` with properties `kind -> "automation" | "shared" | "admin" | "parent" | "member" | "other"` and `screen_rules -> bool`; `@dataclass(frozen=True) SessionView(member_id: str, parent: bool)`; `parent_level(account, session) -> str | None`; `member_level(account, session, target, target_has_pin) -> str | None`; `may_manage_pin(account, session, target) -> str | None`. Each returns who the action is attributed to (a member id, `"automation"`, or `"admin"`), or `None` when it isn't allowed.
- Order of the account kinds: no user, marked shared, admin, linked parent, linked member, anyone else. "Anyone else" follows the shared-screen rules.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_household_permissions.py`:

```python
"""Tests for household/permissions.py: the spec 9.5 table, for every account kind."""
from __future__ import annotations

import pytest

from custom_components.planavista.household.permissions import (
    ADMIN,
    AUTOMATION,
    Account,
    SessionView,
    may_manage_pin,
    member_level,
    parent_level,
)

NO_USER = Account(user_id=None)
SHARED = Account(user_id="kitchen", shared=True)
SHARED_ADMIN = Account(user_id="tablet", is_admin=True, shared=True)
OTHER = Account(user_id="guest")
ADMIN_ALONE = Account(user_id="owner", is_admin=True)
ADMIN_ALEX = Account(user_id="alex", is_admin=True, member_id="alex", member_is_parent=True)
PARENT = Account(user_id="blair", member_id="blair", member_is_parent=True)
CHILD = Account(user_id="casey", member_id="casey")

PARENT_MODE = SessionView(member_id="blair", parent=True)
CASEY_SESSION = SessionView(member_id="casey", parent=False)


@pytest.mark.parametrize(
    ("account", "kind", "screen_rules"),
    [
        (NO_USER, "automation", False),
        (SHARED, "shared", True),
        (SHARED_ADMIN, "shared", True),
        (OTHER, "other", True),
        (ADMIN_ALONE, "admin", False),
        (ADMIN_ALEX, "admin", False),
        (PARENT, "parent", False),
        (CHILD, "member", False),
    ],
)
def test_account_kinds(account: Account, kind: str, screen_rules: bool) -> None:
    assert account.kind == kind
    assert account.screen_rules is screen_rules


@pytest.mark.parametrize(
    ("account", "session", "expected"),
    [
        (NO_USER, None, AUTOMATION),
        (SHARED, None, None),
        (SHARED, PARENT_MODE, "blair"),
        (SHARED, CASEY_SESSION, None),
        (SHARED_ADMIN, None, None),
        (SHARED_ADMIN, PARENT_MODE, "blair"),
        (OTHER, None, None),
        (OTHER, PARENT_MODE, "blair"),
        (ADMIN_ALONE, None, ADMIN),
        (ADMIN_ALEX, None, "alex"),
        (PARENT, None, "blair"),
        (CHILD, None, None),
        (CHILD, PARENT_MODE, None),
    ],
)
def test_parent_level(account: Account, session: SessionView | None, expected: str | None) -> None:
    assert parent_level(account, session) == expected


@pytest.mark.parametrize(
    ("account", "session", "target", "has_pin", "expected"),
    [
        (NO_USER, None, "casey", True, AUTOMATION),
        (SHARED, None, "dana", False, "dana"),
        (SHARED, None, "casey", True, None),
        (SHARED, CASEY_SESSION, "casey", True, "casey"),
        (SHARED, CASEY_SESSION, "dana", False, "dana"),
        (SHARED, CASEY_SESSION, "alex", True, None),
        (SHARED, PARENT_MODE, "casey", True, "blair"),
        (SHARED_ADMIN, None, "casey", True, None),
        (OTHER, None, "dana", False, "dana"),
        (OTHER, None, "casey", True, None),
        (ADMIN_ALONE, None, "casey", True, ADMIN),
        (ADMIN_ALEX, None, "casey", True, "alex"),
        (PARENT, None, "casey", True, "blair"),
        (CHILD, None, "casey", True, "casey"),
        (CHILD, None, "dana", False, None),
        (CHILD, PARENT_MODE, "dana", False, None),
    ],
)
def test_member_level(
    account: Account,
    session: SessionView | None,
    target: str,
    has_pin: bool,
    expected: str | None,
) -> None:
    assert member_level(account, session, target, has_pin) == expected


@pytest.mark.parametrize(
    ("account", "session", "target", "expected"),
    [
        (SHARED, None, "casey", None),
        (SHARED, CASEY_SESSION, "casey", "casey"),
        (SHARED, CASEY_SESSION, "dana", None),
        (SHARED, PARENT_MODE, "casey", "blair"),
        (OTHER, None, "dana", None),
        (CHILD, None, "casey", "casey"),
        (CHILD, None, "dana", None),
        (PARENT, None, "dana", "blair"),
        (ADMIN_ALONE, None, "dana", ADMIN),
        (SHARED_ADMIN, None, "dana", None),
    ],
)
def test_who_may_set_a_pin(
    account: Account, session: SessionView | None, target: str, expected: str | None
) -> None:
    assert may_manage_pin(account, session, target) == expected
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_household_permissions.py -q`
Expected: collection error, `ModuleNotFoundError: No module named 'custom_components.planavista.household.permissions'`.

- [ ] **Step 3: Write the implementation**

Create `custom_components/planavista/household/permissions.py`:

```python
"""Who may do what (spec section 9.5).

A PIN is required wherever the Home Assistant account doesn't identify one
person. These functions are pure: the WebSocket layer works out the account
and the session, and every command asks here.
"""
from __future__ import annotations

from dataclasses import dataclass

AUTOMATION = "automation"
ADMIN = "admin"


@dataclass(frozen=True)
class Account:
    """The Home Assistant account behind a request, as PlanaVista sees it."""

    user_id: str | None
    is_admin: bool = False
    shared: bool = False
    member_id: str | None = None
    member_is_parent: bool = False

    @property
    def kind(self) -> str:
        """automation, shared, admin, parent, member, or other (in that order)."""
        if self.user_id is None:
            return "automation"
        if self.shared:
            return "shared"
        if self.is_admin:
            return "admin"
        if self.member_id is not None:
            return "parent" if self.member_is_parent else "member"
        return "other"

    @property
    def screen_rules(self) -> bool:
        """Shared-screen rules apply: marked shared, or linked to no one and not an admin."""
        return self.kind in ("shared", "other")


@dataclass(frozen=True)
class SessionView:
    """A live PIN session: whose it is, and whether it is parent mode."""

    member_id: str
    parent: bool


def parent_level(account: Account, session: SessionView | None) -> str | None:
    """Who a parent-level action is attributed to, or None when it isn't allowed."""
    kind = account.kind
    if kind == "automation":
        return AUTOMATION
    if kind == "admin":
        return account.member_id or ADMIN
    if kind == "parent":
        return account.member_id
    if kind == "member":
        return None
    if session is not None and session.parent:
        return session.member_id
    return None


def member_level(
    account: Account, session: SessionView | None, target: str, target_has_pin: bool
) -> str | None:
    """Who a member-level action on `target`'s items is attributed to, or None."""
    kind = account.kind
    if kind == "automation":
        return AUTOMATION
    if kind == "admin":
        return account.member_id or ADMIN
    if kind == "parent":
        return account.member_id
    if kind == "member":
        return account.member_id if account.member_id == target else None
    if session is not None and session.parent:
        return session.member_id
    if session is not None and session.member_id == target:
        return target
    if not target_has_pin:
        return target
    return None


def may_manage_pin(account: Account, session: SessionView | None, target: str) -> str | None:
    """Setting or removing `target`'s PIN: the person themselves, or anyone parent-level."""
    by = parent_level(account, session)
    if by is not None:
        return by
    if account.kind == "member" and account.member_id == target:
        return target
    if account.screen_rules and session is not None and session.member_id == target:
        return target
    return None
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh tests/test_household_permissions.py -q`
Expected: `47 passed`.

- [ ] **Step 5: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/permissions.py tests/test_household_permissions.py
git commit -F - <<'EOF'
feat(household): decide who may do what for every kind of account

A PIN is needed wherever the Home Assistant account doesn't identify one
person: shared screens and unlinked accounts need parent mode for parent
actions, while a parent's own login, an admin, and automations don't.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 4: The household Store, the upgrade, and calendars that keep their member

**Files:**
- Create: `custom_components/planavista/household/store.py`
- Modify: `custom_components/planavista/__init__.py` (load the household in `async_setup_entry`)
- Modify: `custom_components/planavista/coordinator.py:160-171` (calendar rows keep every key)
- Modify: `custom_components/planavista/services.py` (`member_id` in the calendar schema; `async_store_config`)
- Modify: `custom_components/planavista/strings.json` and `custom_components/planavista/translations/en.json` (exception and repair issue)
- Test: `tests/test_household_store.py`, `tests/test_upgrade.py`, `tests/test_calendar_rows.py`, `tests/test_services.py` (one test added)

**Interfaces:**
- Consumes: `link_calendars`, `clear_missing_persons` (Task 1); `SessionManager` (Task 2).
- Produces (in `household/store.py`): `STORAGE_KEY = "planavista.household"`, `STORAGE_VERSION = 1`, `STORAGE_MINOR_VERSION = 1`, `ISSUE_NEWER_VERSION = "household_newer_version"`, `MIGRATION_PEOPLE = "people_from_calendars"`, `default_document() -> dict`, `normalize(data) -> dict`, `class Household` (`available: bool`, `data: dict`, `members: list[dict]` with a setter, `member(member_id) -> dict | None`, `pins: dict[str, dict]`, `shared_users: list[str]`, `sessions: SessionManager`, `pin_lock(member_id) -> asyncio.Lock`, `async async_save()`, `async_listen(listener) -> Callable[[], None]`, `async_notify()`), `DATA_HOUSEHOLD: HassKey[Household]`, `async_get_household(hass) -> Household`, `async_person_info(hass) -> dict[str, dict]`, `async_link_calendars(hass, household, entry, *, create_people: bool)`, `async_start_household(hass, household, entry)`.
- Produces (in `services.py`): `async_store_config(hass, changes: Mapping[str, Any]) -> None`, used by Task 5's `planavista/config/save`. `CALENDAR_CONFIG_SCHEMA` and `DISPLAY_SCHEMA` stay importable.
- The household document: `{"members": [...], "security": {"pins": {}, "shared_users": [], "shuffle_keypad": false}, "modules": {}, "setup": {"completed": bool, "step": str | null}, "migrations": {"people_from_calendars": true}}`, plus anything a newer release added.

- [ ] **Step 1: Write the failing tests**

Create `tests/test_household_store.py`:

```python
"""Tests for the household Store: first start, unknown fields, and newer versions."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.household.store import (
    DATA_HOUSEHOLD,
    ISSUE_NEWER_VERSION,
    STORAGE_KEY,
    default_document,
    normalize,
)

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    """An install that finished setup before households existed."""
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CONFIGURED_CALENDARS)
    data["onboarding_complete"] = True
    return data


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


def test_normalize_fills_gaps_and_keeps_unknown_fields() -> None:
    doc = normalize(
        {
            "members": [{"id": "dana", "name": "Dana", "future": 1}, {"no": "id"}],
            "security": {"pins": {}, "later": True},
            "chores_hint": "x",
        }
    )
    assert doc["members"] == [{"id": "dana", "name": "Dana", "future": 1}]
    assert doc["security"] == {
        "pins": {},
        "later": True,
        "shared_users": [],
        "shuffle_keypad": False,
    }
    assert doc["chores_hint"] == "x"
    assert doc["setup"] == {"completed": False, "step": None}
    assert normalize(None) == default_document()
    assert normalize("garbage") == default_document()


async def test_first_start_marks_an_existing_install_as_set_up(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    await _setup(hass, mock_config_entry)
    household = hass.data[DATA_HOUSEHOLD]
    assert household.available
    assert household.data["setup"]["completed"] is True
    assert household.data["migrations"] == {"people_from_calendars": True}
    stored = hass_storage[STORAGE_KEY]
    assert (stored["version"], stored["minor_version"]) == (1, 1)


async def test_fields_from_a_newer_minor_version_survive_a_save(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "minor_version": 2,
        "key": STORAGE_KEY,
        "data": {
            "members": [
                {
                    "id": "dana",
                    "name": "Dana",
                    "color": "#F94144",
                    "color_dark": None,
                    "age_group": "young_child",
                    "parent": False,
                    "person": None,
                    "picture": {"emoji": "\U0001f996"},
                    "my_day": "pictures",
                    "needs_ok_for": "all",
                    "stars": True,
                    "order": 0,
                    "rev": 1,
                    "from_a_newer_version": {"x": 1},
                }
            ],
            "security": {"pins": {}, "shared_users": [], "shuffle_keypad": True, "later": [1]},
            "modules": {"chores": {"enabled": True}},
            "setup": {"completed": True, "step": None},
            "migrations": {"people_from_calendars": True},
            "rewards_hint": "kept",
        },
    }
    await _setup(hass, mock_config_entry)
    household = hass.data[DATA_HOUSEHOLD]
    household.data["security"]["shuffle_keypad"] = False
    await household.async_save()
    await hass.async_block_till_done()

    saved = hass_storage[STORAGE_KEY]["data"]
    assert saved["members"][0]["from_a_newer_version"] == {"x": 1}
    assert saved["security"]["later"] == [1]
    assert saved["modules"] == {"chores": {"enabled": True}}
    assert saved["rewards_hint"] == "kept"


async def test_a_file_from_a_newer_major_version_leaves_the_calendar_working(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 2,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {"members": []},
    }
    await _setup(hass, mock_config_entry)
    assert not hass.data[DATA_HOUSEHOLD].available
    assert hass.states.get("sensor.planavista_config").state == "configured"
    issue = ir.async_get(hass).async_get_issue(DOMAIN, ISSUE_NEWER_VERSION)
    assert issue is not None and issue.severity == ir.IssueSeverity.ERROR
    assert hass_storage[STORAGE_KEY]["version"] == 2
```

Create `tests/test_upgrade.py`:

```python
"""Upgrading a 1.1.0 calendar-only install: nothing changes except Settings' new home."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser

from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant

from custom_components.planavista.household.store import DATA_HOUSEHOLD, STORAGE_KEY

from .conftest import DEFAULT_ENTRY_DATA, FakeCalendar

# Calendars as 1.1.0 saved them: Alex's and Casey's are linked to their people.
CALENDARS_1_1_0: list[dict[str, Any]] = [
    {
        "entity_id": "calendar.test_alex",
        "display_name": "Alex",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:account",
        "person_entity": "person.alex",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_blair",
        "display_name": "Blair",
        "color": "#277DA1",
        "color_light": "#B3D2DE",
        "icon": "mdi:account",
        "person_entity": "",
        "visible": True,
    },
    {
        "entity_id": "calendar.test_casey",
        "display_name": "Casey",
        "color": "#F94144",
        "color_light": "#FDBDBE",
        "icon": "mdi:calendar",
        "person_entity": "person.casey",
        "visible": False,
    },
]


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = deepcopy(CALENDARS_1_1_0)
    data["display"]["theme"] = "dark"
    data["onboarding_complete"] = True
    return data


@pytest.fixture
async def people(
    hass: HomeAssistant, hass_admin_user: MockUser, local_auth: Any
) -> dict[str, MockUser]:
    """Alex signs in as an admin; Casey has an ordinary account."""
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    casey = MockUser(name="Casey", groups=[group]).add_to_hass(hass)
    hass.states.async_set(
        "person.alex", "home", {"friendly_name": "Alex", "user_id": hass_admin_user.id}
    )
    hass.states.async_set(
        "person.casey", "home", {"friendly_name": "Casey", "user_id": casey.id}
    )
    return {"alex": hass_admin_user, "casey": casey}


async def _setup(hass: HomeAssistant, entry: MockConfigEntry) -> None:
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()


async def test_upgrade_keeps_the_calendars_and_adds_their_people(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> None:
    await _setup(hass, mock_config_entry)

    rows = mock_config_entry.data["calendars"]
    for old, new in zip(CALENDARS_1_1_0, rows, strict=True):
        assert {key: new[key] for key in old} == old
    assert [row.get("member_id") for row in rows] == ["alex", None, "casey"]
    assert "member_id" not in rows[1]
    assert mock_config_entry.data["display"]["theme"] == "dark"
    assert mock_config_entry.data["onboarding_complete"] is True

    members = {m["id"]: m for m in hass.data[DATA_HOUSEHOLD].members}
    assert set(members) == {"alex", "casey"}
    assert members["alex"]["parent"] is True
    assert members["casey"]["parent"] is False
    assert members["alex"]["color"] == "#F94144"
    assert members["casey"]["color"] != "#F94144"

    sensor_rows = hass.states.get("sensor.planavista_config").attributes["calendars"]
    assert [row["member_id"] for row in sensor_rows] == ["alex", None, "casey"]
    assert sensor_rows[2]["visible"] is False
    assert sensor_rows[2]["icon"] == "mdi:calendar"


async def test_a_restart_changes_nothing(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    await _setup(hass, mock_config_entry)
    members = deepcopy(hass.data[DATA_HOUSEHOLD].members)
    calendars = deepcopy(mock_config_entry.data["calendars"])

    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    hass.data.pop(DATA_HOUSEHOLD)
    await _setup(hass, mock_config_entry)

    assert hass.data[DATA_HOUSEHOLD].members == members
    assert mock_config_entry.data["calendars"] == calendars
    assert hass_storage[STORAGE_KEY]["data"]["members"] == members


async def test_people_are_added_once_home_assistant_has_started(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> None:
    hass.set_state(CoreState.not_running)
    await _setup(hass, mock_config_entry)
    assert hass.data[DATA_HOUSEHOLD].members == []

    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()
    assert {m["id"] for m in hass.data[DATA_HOUSEHOLD].members} == {"alex", "casey"}


async def test_links_to_deleted_people_are_cleared(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    people: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {
            "members": [
                {
                    "id": "blair",
                    "name": "Blair",
                    "color": "#277DA1",
                    "color_dark": None,
                    "age_group": "adult",
                    "parent": True,
                    "person": "person.blair",
                    "picture": {"person": True},
                    "my_day": "timeline",
                    "needs_ok_for": "none",
                    "stars": False,
                    "order": 0,
                    "rev": 1,
                }
            ],
            "migrations": {"people_from_calendars": True},
        },
    }
    hass.config.components.add("person")
    await _setup(hass, mock_config_entry)

    blair = hass.data[DATA_HOUSEHOLD].member("blair")
    assert blair["person"] is None
    assert blair["picture"] == {"initial": True}
```

Create `tests/test_calendar_rows.py`:

```python
"""Calendar rows keep every key on their way to the card, including member_id."""
from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant

from .conftest import CONFIGURED_CALENDARS, DEFAULT_ENTRY_DATA, FakeCalendar


@pytest.fixture
def config_entry_data() -> dict[str, Any]:
    data = deepcopy(DEFAULT_ENTRY_DATA)
    data["calendars"] = [
        {**deepcopy(CONFIGURED_CALENDARS[0]), "member_id": None, "added_by_a_later_card": "kept"}
    ]
    data["onboarding_complete"] = True
    return data


async def test_sensor_rows_keep_every_key(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
) -> None:
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    row = hass.states.get("sensor.planavista_config").attributes["calendars"][0]
    assert row["added_by_a_later_card"] == "kept"
    assert row["member_id"] is None
    assert row["display_name"] == "Alex"
    assert "state" in row and "attributes" in row
```

Add to `tests/test_services.py` (after `test_save_config_accepts_the_wizard_payload`):

```python
async def test_save_config_gives_a_newly_linked_calendar_its_person(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, hass_admin_user: MockUser
) -> None:
    """Linking a calendar to a person adds that person to the household."""
    from custom_components.planavista.household.store import DATA_HOUSEHOLD

    hass.states.async_set("person.casey", "home", {"friendly_name": "Casey"})
    calendars = deepcopy(CONFIGURED_CALENDARS)
    calendars[1]["person_entity"] = "person.casey"
    calendars[0]["member_id"] = "nobody_by_this_id"

    await hass.services.async_call(
        DOMAIN,
        "save_config",
        {"calendars": calendars},
        blocking=True,
        context=Context(user_id=hass_admin_user.id),
    )

    rows = loaded_entry.data["calendars"]
    assert [row["member_id"] for row in rows] == [None, "casey"]
    casey = hass.data[DATA_HOUSEHOLD].member("casey")
    assert casey["person"] == "person.casey" and casey["parent"] is False
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_household_store.py tests/test_upgrade.py tests/test_calendar_rows.py tests/test_services.py -q`
Expected: collection errors for the three new modules (`No module named 'custom_components.planavista.household.store'`). If the new `test_services.py` test is collected, it fails because `save_config` rejects `member_id`... it is accepted (`ALLOW_EXTRA`), so it fails on `KeyError: 'member_id'` instead. `test_calendar_rows.py` fails on `KeyError: 'added_by_a_later_card'`.

- [ ] **Step 3: Write `household/store.py`**

```python
"""The household Store, the loaded household, and keeping calendars linked."""
from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping
import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError, UnsupportedStorageVersionError
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.storage import Store
from homeassistant.util.hass_dict import HassKey

from ..const import CONF_CALENDARS, CONF_ONBOARDING_COMPLETE, DOMAIN
from ..coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .members import clear_missing_persons, link_calendars
from .security import SessionManager

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = f"{DOMAIN}.household"
STORAGE_VERSION = 1
STORAGE_MINOR_VERSION = 1
ISSUE_NEWER_VERSION = "household_newer_version"
MIGRATION_PEOPLE = "people_from_calendars"


def default_document() -> dict[str, Any]:
    """A household with nobody in it yet."""
    return {
        "members": [],
        "security": {"pins": {}, "shared_users": [], "shuffle_keypad": False},
        "modules": {},
        "setup": {"completed": False, "step": None},
        "migrations": {},
    }


def normalize(data: object) -> dict[str, Any]:
    """The stored document with missing parts filled in. Nothing unknown is dropped."""
    doc: dict[str, Any] = dict(data) if isinstance(data, Mapping) else {}
    members = doc.get("members")
    doc["members"] = (
        [dict(m) for m in members if isinstance(m, Mapping) and isinstance(m.get("id"), str)]
        if isinstance(members, list)
        else []
    )
    security = dict(doc["security"]) if isinstance(doc.get("security"), Mapping) else {}
    if not isinstance(security.get("pins"), Mapping):
        security["pins"] = {}
    if not isinstance(security.get("shared_users"), list):
        security["shared_users"] = []
    if not isinstance(security.get("shuffle_keypad"), bool):
        security["shuffle_keypad"] = False
    doc["security"] = security
    setup = dict(doc["setup"]) if isinstance(doc.get("setup"), Mapping) else {}
    if not isinstance(setup.get("completed"), bool):
        setup["completed"] = False
    if not isinstance(setup.get("step"), str):
        setup["step"] = None
    doc["setup"] = setup
    for key in ("modules", "migrations"):
        if not isinstance(doc.get(key), Mapping):
            doc[key] = {}
    return doc


class Household:
    """The household document, plus what lives only in memory: sessions and listeners."""

    def __init__(self, store: Store[dict[str, Any]] | None, data: dict[str, Any]) -> None:
        """Wrap a loaded document; no store means a newer version wrote it."""
        self._store = store
        self.data = data
        self.sessions = SessionManager()
        self._listeners: list[Callable[[], None]] = []
        self._pin_locks: dict[str, asyncio.Lock] = {}

    @property
    def available(self) -> bool:
        """False when the file came from a newer PlanaVista and must not be changed."""
        return self._store is not None

    @property
    def members(self) -> list[dict[str, Any]]:
        """Everyone, in stored order (sort with members.ordered for board order)."""
        return self.data["members"]

    @members.setter
    def members(self, value: list[dict[str, Any]]) -> None:
        self.data["members"] = value

    def member(self, member_id: str) -> dict[str, Any] | None:
        """The member with this id, if there is one."""
        return next((m for m in self.members if m["id"] == member_id), None)

    @property
    def pins(self) -> dict[str, dict[str, Any]]:
        """PIN records by member id."""
        return self.data["security"]["pins"]

    @property
    def shared_users(self) -> list[str]:
        """Home Assistant user ids marked as shared family screens."""
        return self.data["security"]["shared_users"]

    def pin_lock(self, member_id: str) -> asyncio.Lock:
        """One PIN check at a time per member, so parallel tries can't skip a pause."""
        return self._pin_locks.setdefault(member_id, asyncio.Lock())

    async def async_save(self) -> None:
        """Save now (people and PINs change rarely) and tell every subscriber."""
        if self._store is None:
            raise HomeAssistantError(
                translation_domain=DOMAIN, translation_key="household_unavailable"
            )
        await self._store.async_save(self.data)
        self.async_notify()

    @callback
    def async_listen(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Call `listener` after every change; returns a function that stops it."""
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    @callback
    def async_notify(self) -> None:
        """Tell every subscriber that something changed."""
        for listener in list(self._listeners):
            listener()


DATA_HOUSEHOLD: HassKey[Household] = HassKey(f"{DOMAIN}_household")


async def async_get_household(hass: HomeAssistant) -> Household:
    """The household, loaded once per Home Assistant run."""
    if (household := hass.data.get(DATA_HOUSEHOLD)) is not None:
        return household
    store: Store[dict[str, Any]] = Store(
        hass,
        STORAGE_VERSION,
        STORAGE_KEY,
        minor_version=STORAGE_MINOR_VERSION,
        private=True,
        atomic_writes=True,
    )
    try:
        data = await store.async_load()
    except UnsupportedStorageVersionError:
        _LOGGER.error(
            "The household file was saved by a newer version of PlanaVista; "
            "update PlanaVista to change people and PINs"
        )
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_NEWER_VERSION,
            is_fixable=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key=ISSUE_NEWER_VERSION,
        )
        household = Household(None, default_document())
    else:
        household = Household(store, normalize(data))
    hass.data[DATA_HOUSEHOLD] = household
    return household


async def async_person_info(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """Home Assistant people by entity id: name, linked user, and whether that user is an admin."""
    admins = {user.id for user in await hass.auth.async_get_users() if user.is_admin}
    return {
        state.entity_id: {
            "name": state.name,
            "user_id": state.attributes.get("user_id"),
            "admin": state.attributes.get("user_id") in admins,
        }
        for state in hass.states.async_all("person")
    }


async def async_link_calendars(
    hass: HomeAssistant,
    household: Household,
    entry: PlanaVistaConfigEntry,
    *,
    create_people: bool,
) -> None:
    """Give calendars their members and save whatever changed.

    With `create_people`, people linked to calendars who aren't members yet
    become members (the one-time migration). Otherwise calendars only join
    people who already are.
    """
    if not household.available:
        return
    calendars = list(entry.data.get(CONF_CALENDARS, []))
    create_for = (
        {cal["person_entity"] for cal in calendars if cal.get("person_entity")}
        if create_people
        else set()
    )
    rows, members = link_calendars(
        calendars, household.members, await async_person_info(hass), create_for
    )
    if members != household.members:
        household.members = members
        await household.async_save()
    if rows != calendars:
        hass.config_entries.async_update_entry(entry, data={**entry.data, CONF_CALENDARS: rows})
        coordinator: PlanaVistaCoordinator | None = getattr(entry, "runtime_data", None)
        if coordinator is not None:
            coordinator.async_set_calendars(rows)
            await coordinator.async_refresh()


async def async_start_household(
    hass: HomeAssistant, household: Household, entry: PlanaVistaConfigEntry
) -> None:
    """Once Home Assistant has started: tidy people links, then link calendars.

    The first time, people linked to calendars become members, and an install
    that finished setup before households existed is marked as set up.
    """
    if not household.available:
        return
    if "person" in hass.config.components:
        members = clear_missing_persons(household.members, await async_person_info(hass))
        if members != household.members:
            household.members = members
            await household.async_save()
    first_time = not household.data["migrations"].get(MIGRATION_PEOPLE)
    await async_link_calendars(hass, household, entry, create_people=first_time)
    if first_time:
        household.data["migrations"][MIGRATION_PEOPLE] = True
        if entry.data.get(CONF_ONBOARDING_COMPLETE, True) is not False:
            household.data["setup"]["completed"] = True
        await household.async_save()
```

- [ ] **Step 4: Load the household in `__init__.py`**

Add the imports and change `async_setup_entry`:

```python
from homeassistant.helpers.start import async_at_started

from .household.store import async_get_household, async_start_household
```

```python
async def async_setup_entry(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> bool:
    """Set up PlanaVista from a config entry."""
    coordinator = PlanaVistaCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    coordinator.async_start_tracking()
    entry.runtime_data = coordinator

    # People and calendars are linked once Home Assistant has started, when
    # every person entity exists.
    household = await async_get_household(hass)

    async def _async_start_household(_hass: HomeAssistant) -> None:
        await async_start_household(hass, household, entry)

    entry.async_on_unload(async_at_started(hass, _async_start_household))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True
```

- [ ] **Step 5: Keep every calendar key in the coordinator**

In `coordinator.py`, replace the `calendar_data = {...}` dict in `_async_update_data` with:

```python
                    # Spread the saved row first so keys the card adds (member_id,
                    # and whatever later releases add) reach the card unchanged.
                    calendar_data = {
                        **calendar_config,
                        "entity_id": entity_id,
                        "display_name": display_name,
                        "color": color,
                        "color_light": color_light,
                        "icon": calendar_config.get("icon", "mdi:calendar"),
                        "person_entity": calendar_config.get("person_entity", ""),
                        "member_id": calendar_config.get("member_id"),
                        "visible": calendar_config.get("visible", True),
                        "state": calendar_state.state,
                        "attributes": dict(calendar_state.attributes),
                    }
```

- [ ] **Step 6: Save config through one function that links calendars**

In `services.py`:

1. Add the imports `from collections.abc import Iterable, Mapping` (replacing the `Iterable` import), `from .household.members import link_calendars`, and `from .household.store import DATA_HOUSEHOLD, async_person_info`.
2. In `CALENDAR_CONFIG_SCHEMA`, add `vol.Optional("member_id"): vol.Any(None, cv.string),` after the `CONF_PERSON_ENTITY` line.
3. Replace `_async_save_config` with:

```python
async def async_store_config(hass: HomeAssistant, changes: Mapping[str, Any]) -> None:
    """Save calendars, display settings, and onboarding_complete.

    The save_config action and the card's planavista/config/save both come
    here. A calendar newly linked to a Home Assistant person joins that
    person's member, who is added when needed (spec section 7.2).
    """
    entry = _async_get_loaded_entry(hass)
    new_data = dict(entry.data)
    if CONF_CALENDARS in changes:
        new_data[CONF_CALENDARS] = [dict(cal) for cal in changes[CONF_CALENDARS]]
    if CONF_DISPLAY in changes:
        new_data[CONF_DISPLAY] = dict(changes[CONF_DISPLAY])
    if CONF_ONBOARDING_COMPLETE in changes:
        new_data[CONF_ONBOARDING_COMPLETE] = changes[CONF_ONBOARDING_COMPLETE]

    household = hass.data.get(DATA_HOUSEHOLD)
    if household is not None and household.available and CONF_CALENDARS in changes:
        linked_before = {
            cal.get("entity_id"): cal.get("person_entity")
            for cal in entry.data.get(CONF_CALENDARS, [])
        }
        newly_linked = {
            cal["person_entity"]
            for cal in new_data[CONF_CALENDARS]
            if cal.get("person_entity")
            and linked_before.get(cal.get("entity_id")) != cal["person_entity"]
        }
        rows, members = link_calendars(
            new_data[CONF_CALENDARS],
            household.members,
            await async_person_info(hass),
            newly_linked,
        )
        new_data[CONF_CALENDARS] = rows
        if members != household.members:
            household.members = members
            await household.async_save()

    await async_apply_config(hass, entry, new_data)


async def _async_save_config(call: ServiceCall) -> None:
    """Save the settings sent by an admin or an automation."""
    await async_store_config(call.hass, call.data)
    entry = _async_get_loaded_entry(call.hass)
    _LOGGER.info(
        "PlanaVista config saved via save_config service (calendars=%d, onboarding=%s)",
        len(entry.data.get(CONF_CALENDARS, [])),
        entry.data.get(CONF_ONBOARDING_COMPLETE),
    )
```

- [ ] **Step 7: Add the exception and the repair issue text**

In `strings.json`, add to `"exceptions"`:

```json
    "household_unavailable": {
      "message": "People and PINs can't be changed until PlanaVista is updated."
    }
```

and add a top-level `"issues"` object:

```json
  "issues": {
    "household_newer_version": {
      "title": "Update PlanaVista to change people and PINs",
      "description": "The household file was saved by a newer version of PlanaVista. The calendar keeps working, but people, PINs, and shared screens can't be changed until PlanaVista is updated."
    }
  }
```

Copy `strings.json` to `translations/en.json` (they must be equal; `test_english_translations_match_strings` checks it):

```bash
cp custom_components/planavista/strings.json custom_components/planavista/translations/en.json
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh -q`
Expected: every test passes (65 before this milestone, plus 20 + 12 + 47 from Tasks 1 to 3, plus 4 + 4 + 1 + 1 here: `154 passed`).

- [ ] **Step 9: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/store.py custom_components/planavista/__init__.py custom_components/planavista/coordinator.py custom_components/planavista/services.py custom_components/planavista/strings.json custom_components/planavista/translations/en.json tests/test_household_store.py tests/test_upgrade.py tests/test_calendar_rows.py tests/test_services.py
git commit -F - <<'EOF'
feat(household): keep the household in its own file and link calendars

People live in .storage/planavista.household, which keeps fields it
doesn't know. Once Home Assistant has started, people linked to calendars
become members, once. Calendars keep every key on the way to the card,
including member_id, and a calendar newly linked to a person joins them.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 5: Household WebSocket commands, checked for every kind of account

**Files:**
- Create: `custom_components/planavista/household/websocket.py`
- Modify: `custom_components/planavista/__init__.py` (register the commands in `async_setup`)
- Modify: `tests/conftest.py` (the sample household's accounts and helpers)
- Test: `tests/test_household_websocket.py`

**Interfaces:**
- Consumes: Task 1's member functions, Task 3's `Account`, `SessionView`, `parent_level`, Task 4's `Household`, `DATA_HOUSEHOLD`, `async_store_config`, `CALENDAR_CONFIG_SCHEMA`, `DISPLAY_SCHEMA`.
- Produces (in `household/websocket.py`): `ERROR_MESSAGES: dict[str, str]`, `_monotonic() -> float` (the session clock; tests replace it), `async_setup_household_websocket(hass)`, and these commands (every one accepts an optional `session` token):

| Command | Level | Fields | Result |
|---|---|---|---|
| `planavista/household/subscribe` | anyone | none | events: the household view below, now and after every change |
| `planavista/household/member/save` | parent | `member` (any of `name`, `color`, `picture`, `age_group`, `parent`, `person`, `my_day`, `needs_ok_for`, `stars`), optional `member_id` (absent adds someone) and `rev` | `{"member": <public member>}` |
| `planavista/household/member/delete` | parent | `member_id` | `null` |
| `planavista/household/member/reorder` | parent | `order` (every member id once) | `null` |
| `planavista/household/shared_screen` | parent | `shared` (this connection's account) | `null` |
| `planavista/household/settings/save` | parent | `shuffle_keypad` | `null` |
| `planavista/household/setup/save` | parent | optional `step` (a step id or null) and `completed` | `null` |
| `planavista/config/save` | parent | optional `calendars`, `display`, `onboarding_complete` (the `save_config` schema) | `null` |

- The household view: `{"available": bool, "members": [<public member>, ...] (board order), "account": {"user_id", "name", "is_admin", "shared", "kind", "member_id", "parent_level"}, "security": {"shuffle_keypad": bool, "shared_screens": int}, "modules": {}, "setup": {"completed": bool, "step": str | None}}`. A public member is the stored member plus `has_pin`, `pin_length`, and `locked_until`.
- Error codes: `not_loaded`, `parent_mode_required` (shared-screen rules apply and there's no parent mode), `not_allowed`, `unavailable` (the household file is newer), `needs_parent_pin`, and every `MemberError` code.
- Test helpers (in `tests/conftest.py`): fixture `accounts` (users `admin`, `alex`, `casey`, `kitchen`, `guest`, with person states), fixture `household` (PlanaVista set up with Alex and Blair as parents, Casey a teen, and Dana a young child), `async def set_pin(hass, household, member_id, pin)`, `async def ws_client_for(hass, hass_ws_client, user)`, and `async def ws_command(client, fields, seen=None) -> dict`.

- [ ] **Step 1: Add the shared test helpers**

Append to `tests/conftest.py`, and add `from homeassistant.auth.const import GROUP_ID_USER` and `from pytest_homeassistant_custom_component.common import CLIENT_ID, MockUser` to its imports:

```python
@pytest.fixture
async def accounts(
    hass: HomeAssistant, hass_admin_user: MockUser, local_auth: Any
) -> dict[str, MockUser]:
    """The sample household's Home Assistant accounts.

    admin is linked to no one. alex and casey are their own logins, linked
    through their people. kitchen is the wall tablet. guest is linked to no
    one and isn't an admin. Blair has a person but no login.
    """
    group = await hass.auth.async_get_group(GROUP_ID_USER)
    users = {"admin": hass_admin_user}
    for name in ("alex", "casey", "kitchen", "guest"):
        users[name] = MockUser(name=name.title(), groups=[group]).add_to_hass(hass)
    hass.states.async_set(
        "person.alex", "home", {"friendly_name": "Alex", "user_id": users["alex"].id}
    )
    hass.states.async_set(
        "person.casey", "home", {"friendly_name": "Casey", "user_id": users["casey"].id}
    )
    hass.states.async_set("person.blair", "not_home", {"friendly_name": "Blair"})
    return users


@pytest.fixture
async def household(
    hass: HomeAssistant,
    setup_calendars: dict[str, FakeCalendar],
    accounts: dict[str, MockUser],
    mock_config_entry: MockConfigEntry,
) -> Any:
    """PlanaVista with the sample household: parents Alex and Blair, Casey (teen), Dana (6)."""
    from custom_components.planavista.household.members import add_member
    from custom_components.planavista.household.store import DATA_HOUSEHOLD

    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    household = hass.data[DATA_HOUSEHOLD]
    members: list[dict[str, Any]] = []
    for changes in (
        {"name": "Alex", "parent": True, "person": "person.alex"},
        {"name": "Blair", "parent": True, "person": "person.blair"},
        {"name": "Casey", "age_group": "teen", "person": "person.casey"},
        {"name": "Dana", "age_group": "young_child"},
    ):
        members, _ = add_member(members, changes)
    household.members = members
    await household.async_save()
    return household


async def set_pin(hass: HomeAssistant, household: Any, member_id: str, pin: str) -> None:
    """Give a member a PIN without going through the card."""
    from custom_components.planavista.household.security import hash_pin

    household.pins[member_id] = await hass.async_add_executor_job(hash_pin, pin)
    await household.async_save()


async def ws_client_for(hass: HomeAssistant, hass_ws_client: Any, user: MockUser) -> Any:
    """A WebSocket client signed in as `user`."""
    refresh_token = await hass.auth.async_create_refresh_token(user, CLIENT_ID)
    return await hass_ws_client(hass, hass.auth.async_create_access_token(refresh_token))


async def ws_command(
    client: Any, fields: dict[str, Any], seen: list[dict[str, Any]] | None = None
) -> dict[str, Any]:
    """Send a command and return its result, skipping (and keeping) subscription events."""
    message = dict(fields)
    await client.send_json_auto_id(message)
    while True:
        reply = await client.receive_json()
        if seen is not None:
            seen.append(reply)
        if reply.get("id") == message["id"] and reply.get("type") == "result":
            return reply
```

- [ ] **Step 2: Write the failing tests**

Create `tests/test_household_websocket.py`:

```python
"""Tests for the household WebSocket commands, for every kind of account (spec 9.5)."""
from __future__ import annotations

from copy import deepcopy
import json
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, MockUser

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.planavista.const import DOMAIN
from custom_components.planavista.household.store import DATA_HOUSEHOLD, STORAGE_KEY

from .conftest import CONFIGURED_CALENDARS, FakeCalendar, set_pin, ws_client_for, ws_command


async def _client(hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], who: str) -> Any:
    if who == "admin":
        return await hass_ws_client(hass)
    return await ws_client_for(hass, hass_ws_client, accounts[who])


async def _first_view(client: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": "planavista/household/subscribe"})
    assert (await client.receive_json())["success"]
    return (await client.receive_json())["event"]


@pytest.mark.parametrize(
    ("who", "kind", "parent_level"),
    [
        ("admin", "admin", True),
        ("alex", "parent", True),
        ("casey", "member", False),
        ("guest", "other", False),
        ("kitchen", "shared", False),
    ],
)
async def test_subscribe_describes_the_account(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    who: str,
    kind: str,
    parent_level: bool,
) -> None:
    household.shared_users.append(accounts["kitchen"].id)
    view = await _first_view(await _client(hass, hass_ws_client, accounts, who))
    assert view["account"]["kind"] == kind
    assert view["account"]["parent_level"] is parent_level
    assert view["available"] is True
    assert [m["id"] for m in view["members"]] == ["alex", "blair", "casey", "dana"]
    assert view["security"] == {"shuffle_keypad": False, "shared_screens": 1}


async def test_subscribe_never_sends_pin_data(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    await set_pin(hass, household, "alex", "482613")
    view = await _first_view(await hass_ws_client(hass))
    alex = view["members"][0]
    assert (alex["has_pin"], alex["pin_length"], alex["locked_until"]) == (True, 6, None)
    text = json.dumps(view)
    assert '"hash"' not in text and '"salt"' not in text and "482613" not in text


async def test_subscribe_pushes_every_change(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    await _first_view(client)
    seen: list[dict[str, Any]] = []
    reply = await ws_command(
        client,
        {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
        seen,
    )
    assert reply["success"]
    if len(seen) == 1:
        seen.append(await client.receive_json())
    events = [m["event"] for m in seen if m["type"] == "event"]
    assert [m["id"] for m in events[-1]["members"]] == ["alex", "blair", "casey", "dana", "erin"]


PARENT_COMMANDS = [
    {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
    {"type": "planavista/household/member/reorder", "order": ["dana", "casey", "blair", "alex"]},
    {"type": "planavista/household/settings/save", "shuffle_keypad": True},
    {"type": "planavista/household/setup/save", "step": "calendars"},
    {"type": "planavista/config/save", "display": {"time_format": "24h"}},
]


@pytest.mark.parametrize("command", PARENT_COMMANDS, ids=lambda c: c["type"].split("/", 1)[1])
@pytest.mark.parametrize(
    ("who", "error"),
    [
        ("admin", None),
        ("alex", None),
        ("casey", "not_allowed"),
        ("guest", "parent_mode_required"),
        ("kitchen", "parent_mode_required"),
    ],
)
async def test_parent_commands_follow_the_account_rules(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    command: dict[str, Any],
    who: str,
    error: str | None,
) -> None:
    household.shared_users.append(accounts["kitchen"].id)
    reply = await ws_command(await _client(hass, hass_ws_client, accounts, who), command)
    if error is None:
        assert reply["success"], reply
    else:
        assert not reply["success"]
        assert reply["error"]["code"] == error


async def test_member_rules_come_back_as_error_codes(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    alex = household.member("alex")
    cases = [
        ({"member": {"name": "alex"}}, "name_taken"),
        ({"member": {"name": "Erin", "color": alex["color"]}}, "color_taken"),
        ({"member": {"name": "Erin", "person": "person.alex"}}, "person_taken"),
        ({"member_id": "nobody", "member": {"name": "X"}}, "unknown_member"),
        ({"member_id": "casey", "rev": 99, "member": {"name": "Casey B"}}, "changed"),
    ]
    for fields, code in cases:
        reply = await ws_command(client, {"type": "planavista/household/member/save", **fields})
        assert reply["error"]["code"] == code, fields
        assert reply["error"]["message"]


async def test_member_save_returns_the_public_member(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    added = await ws_command(
        client,
        {"type": "planavista/household/member/save", "member": {"name": "Erin", "age_group": "teen"}},
    )
    erin = added["result"]["member"]
    assert (erin["id"], erin["rev"], erin["has_pin"], erin["my_day"]) == ("erin", 1, False, "timeline")
    renamed = await ws_command(
        client,
        {
            "type": "planavista/household/member/save",
            "member_id": "erin",
            "rev": 1,
            "member": {"name": "Erin Lee"},
        },
    )
    assert renamed["result"]["member"]["rev"] == 2
    assert household.member("erin")["name"] == "Erin Lee"


async def test_removing_someone_frees_their_calendars_for_good(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    mock_config_entry: MockConfigEntry,
) -> None:
    client = await hass_ws_client(hass)
    calendars = [
        {
            **deepcopy(CONFIGURED_CALENDARS[0]),
            "entity_id": "calendar.test_casey",
            "display_name": "Casey",
            "person_entity": "person.casey",
        },
        {**deepcopy(CONFIGURED_CALENDARS[1]), "member_id": "dana"},
    ]
    assert (await ws_command(client, {"type": "planavista/config/save", "calendars": calendars}))["success"]
    assert [c["member_id"] for c in mock_config_entry.data["calendars"]] == ["casey", "dana"]

    for member_id in ("casey", "dana"):
        reply = await ws_command(
            client, {"type": "planavista/household/member/delete", "member_id": member_id}
        )
        assert reply["success"], reply
    rows = mock_config_entry.data["calendars"]
    assert [c["member_id"] for c in rows] == [None, None]
    assert rows[0]["person_entity"] == "person.casey"

    # A restart doesn't bring Casey back, although her calendar keeps her person.
    assert await hass.config_entries.async_unload(mock_config_entry.entry_id)
    hass.data.pop(DATA_HOUSEHOLD)
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DATA_HOUSEHOLD].member("casey") is None
    assert mock_config_entry.data["calendars"][0]["member_id"] is None


async def test_reorder_needs_everyone_once(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    order = ["dana", "casey", "blair", "alex"]
    assert (await ws_command(client, {"type": "planavista/household/member/reorder", "order": order}))["success"]
    view = await _first_view(client)
    assert [m["id"] for m in view["members"]] == order
    reply = await ws_command(
        client, {"type": "planavista/household/member/reorder", "order": ["dana", "casey"]}
    )
    assert reply["error"]["code"] == "invalid_order"


async def test_marking_a_shared_screen_needs_a_parent_pin(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/household/shared_screen", "shared": True})
    assert reply["error"]["code"] == "needs_parent_pin"

    await set_pin(hass, household, "blair", "4826")
    assert (await ws_command(client, {"type": "planavista/household/shared_screen", "shared": True}))["success"]
    assert household.shared_users == [accounts["admin"].id]
    # The admin's own status no longer counts on this account (spec 9.5).
    reply = await ws_command(client, {"type": "planavista/household/settings/save", "shuffle_keypad": True})
    assert reply["error"]["code"] == "parent_mode_required"


async def test_config_save_still_works_when_the_household_file_is_newer(
    hass: HomeAssistant,
    hass_ws_client: Any,
    setup_calendars: dict[str, FakeCalendar],
    mock_config_entry: MockConfigEntry,
    hass_storage: dict[str, Any],
) -> None:
    hass_storage[STORAGE_KEY] = {"version": 2, "minor_version": 1, "key": STORAGE_KEY, "data": {}}
    assert await hass.config_entries.async_setup(mock_config_entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)

    saved = await ws_command(client, {"type": "planavista/config/save", "display": {"time_format": "24h"}})
    assert saved["success"]
    assert mock_config_entry.data["display"] == {"time_format": "24h"}
    refused = await ws_command(
        client, {"type": "planavista/household/member/save", "member": {"name": "Erin"}}
    )
    assert refused["error"]["code"] == "unavailable"


async def test_commands_before_planavista_is_set_up(
    hass: HomeAssistant, hass_ws_client: Any
) -> None:
    assert await async_setup_component(hass, DOMAIN, {})
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/household/subscribe"})
    assert reply["error"]["code"] == "not_loaded"
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_household_websocket.py -q`
Expected: the tests fail with `unknown_command` errors (for example `assert 'unknown_command' == 'not_loaded'`), because no household command is registered yet.

- [ ] **Step 4: Write `household/websocket.py`**

```python
"""WebSocket commands for people, shared screens, setup progress, and settings.

Every command asks household/permissions.py (spec section 9.5): a PIN is
needed wherever the Home Assistant account doesn't identify one person.
The PIN commands (planavista/pin/*) are at the end of this file.
"""
from __future__ import annotations

import time
from typing import Any

import voluptuous as vol

from homeassistant.auth.models import User
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..const import CONF_CALENDARS, CONF_DISPLAY, CONF_ONBOARDING_COMPLETE, DOMAIN
from ..services import CALENDAR_CONFIG_SCHEMA, DISPLAY_SCHEMA, async_store_config
from .members import (
    MemberError,
    add_member,
    check_parent_pins,
    ordered,
    parents_with_pins,
    public_member,
    remove_member,
    reorder_members,
    update_member,
)
from .permissions import Account, SessionView, parent_level
from .store import DATA_HOUSEHOLD, Household

# What the card shows when a change breaks a rule (spec 11.7: say what to do).
ERROR_MESSAGES = {
    "name_required": "Add a name.",
    "name_too_long": "Use a name of 40 letters or fewer.",
    "name_taken": "Someone already has that name.",
    "color_taken": "Someone already has that color.",
    "invalid_color": "Pick one of the colors shown.",
    "person_taken": "That Home Assistant person already belongs to someone.",
    "invalid_person": "Pick a Home Assistant person.",
    "invalid_picture": "Pick an initial, an emoji, or their photo.",
    "invalid_age_group": "Pick an age group.",
    "invalid_my_day": "Pick a My day style.",
    "invalid_needs_ok_for": "Pick when they need an OK.",
    "invalid_stars": "Stars are on or off.",
    "invalid_parent": "Parent is on or off.",
    "too_many": "A household can have up to 20 people.",
    "unknown_member": "That person was removed on another screen.",
    "changed": "This changed on another screen.",
    "invalid_order": "The list changed on another screen. Try again.",
    "last_parent_pin": "A shared screen needs at least one parent with a PIN.",
    "needs_parent_pin": "Set a PIN for a parent first, so someone can open Settings here.",
}

MEMBER_FIELDS = vol.Schema(
    {
        vol.Optional("name"): str,
        vol.Optional("color"): str,
        vol.Optional("picture"): dict,
        vol.Optional("age_group"): str,
        vol.Optional("parent"): bool,
        vol.Optional("person"): vol.Any(None, str),
        vol.Optional("my_day"): str,
        vol.Optional("needs_ok_for"): str,
        vol.Optional("stars"): bool,
    }
)


def _monotonic() -> float:
    """The session clock (tests replace it)."""
    return time.monotonic()


@callback
def _account(hass: HomeAssistant, household: Household, user: User) -> Account:
    """What kind of account `user` is: linked through a person to a member, or not."""
    member = None
    for state in hass.states.async_all("person"):
        if state.attributes.get("user_id") == user.id:
            member = next(
                (m for m in household.members if m.get("person") == state.entity_id), None
            )
            break
    return Account(
        user_id=user.id,
        is_admin=user.is_admin,
        shared=user.id in household.shared_users,
        member_id=member["id"] if member else None,
        member_is_parent=bool(member and member.get("parent")),
    )


@callback
def _session(
    household: Household, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> SessionView | None:
    """The command's session when it names a live one on this connection (counts as activity)."""
    session = household.sessions.get(msg.get("session"), connection, _monotonic(), touch=True)
    return SessionView(session.member_id, session.parent) if session else None


@callback
def _household(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> Household | None:
    household = hass.data.get(DATA_HOUSEHOLD)
    if household is None:
        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
    return household


@callback
def _refuse(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], account: Account
) -> None:
    if account.screen_rules:
        connection.send_error(
            msg["id"], "parent_mode_required", "A parent's PIN is needed on this screen."
        )
    else:
        connection.send_error(msg["id"], "not_allowed", "Only a parent can do this.")


@callback
def _parent(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    needs_file: bool = True,
) -> tuple[Household, str] | None:
    """The household and who acts as a parent, or None after saying why not."""
    household = _household(hass, connection, msg)
    if household is None:
        return None
    account = _account(hass, household, connection.user)
    by = parent_level(account, _session(household, connection, msg))
    if by is None:
        _refuse(connection, msg, account)
        return None
    if needs_file and not household.available:
        connection.send_error(
            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
        )
        return None
    return household, by


@callback
def _member_error(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], err: MemberError
) -> None:
    connection.send_error(
        msg["id"], err.code, ERROR_MESSAGES.get(err.code, "That change can't be saved.")
    )


@callback
def _view(hass: HomeAssistant, household: Household, user: User) -> dict[str, Any]:
    """What one account sees: people (never PIN data), its own kind, and setup progress."""
    account = _account(hass, household, user)
    return {
        "available": household.available,
        "members": [
            public_member(m, household.pins.get(m["id"])) for m in ordered(household.members)
        ],
        "account": {
            "user_id": user.id,
            "name": user.name,
            "is_admin": user.is_admin,
            "shared": account.shared,
            "kind": account.kind,
            "member_id": account.member_id,
            "parent_level": parent_level(account, None) is not None,
        },
        "security": {
            "shuffle_keypad": household.data["security"]["shuffle_keypad"],
            "shared_screens": len(household.shared_users),
        },
        "modules": household.data["modules"],
        "setup": household.data["setup"],
    }


@websocket_api.websocket_command({vol.Required("type"): "planavista/household/subscribe"})
@callback
def ws_household_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Send the household now and after every change, until unsubscribed."""
    household = _household(hass, connection, msg)
    if household is None:
        return

    @callback
    def forward() -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], _view(hass, household, connection.user))
        )

    connection.subscriptions[msg["id"]] = household.async_listen(forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/save",
        vol.Optional("member_id"): str,
        vol.Optional("rev"): int,
        vol.Required("member"): MEMBER_FIELDS,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add someone, or change them (with the revision the editor started from)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    try:
        if "member_id" in msg:
            members, member = update_member(
                household.members, msg["member_id"], msg["member"], msg.get("rev")
            )
        else:
            members, member = add_member(household.members, msg["member"])
        check_parent_pins(
            household.members,
            members,
            household.pins,
            household.pins,
            bool(household.shared_users),
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.members = members
    if not member["parent"]:
        household.sessions.end_parent_mode(member["id"])
    await household.async_save()
    connection.send_result(
        msg["id"], {"member": public_member(member, household.pins.get(member["id"]))}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/delete",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_delete(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove someone. Their calendars stay and belong to no one."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    member_id = msg["member_id"]
    pins = {key: value for key, value in household.pins.items() if key != member_id}
    try:
        members = remove_member(household.members, member_id)
        check_parent_pins(
            household.members, members, household.pins, pins, bool(household.shared_users)
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.members = members
    household.data["security"]["pins"] = pins
    household.sessions.end_member(member_id)
    await household.async_save()

    entry = next(iter(hass.config_entries.async_loaded_entries(DOMAIN)), None)
    calendars = entry.data.get(CONF_CALENDARS, []) if entry else []
    if any(cal.get("member_id") == member_id for cal in calendars):
        await async_store_config(
            hass,
            {
                CONF_CALENDARS: [
                    {**cal, "member_id": None} if cal.get("member_id") == member_id else cal
                    for cal in calendars
                ]
            },
        )
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/member/reorder",
        vol.Required("order"): [str],
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_member_reorder(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Put people in a new order (the order on the board and in PIN prompts)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    try:
        household.members = reorder_members(household.members, msg["order"])
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/shared_screen",
        vol.Required("shared"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_shared_screen(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Mark or unmark the account this screen signs in with as a shared family screen."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    users = [user_id for user_id in household.shared_users if user_id != connection.user.id]
    if msg["shared"]:
        if not parents_with_pins(household.members, household.pins):
            connection.send_error(
                msg["id"], "needs_parent_pin", ERROR_MESSAGES["needs_parent_pin"]
            )
            return
        users.append(connection.user.id)
    household.data["security"]["shared_users"] = users
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/settings/save",
        vol.Optional("shuffle_keypad"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_settings_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Household-wide PIN settings (today, Shuffle the keypad)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    if "shuffle_keypad" in msg:
        household.data["security"]["shuffle_keypad"] = msg["shuffle_keypad"]
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/household/setup/save",
        vol.Optional("step"): vol.Any(None, str),
        vol.Optional("completed"): bool,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_setup_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Where first-run setup picks up, and whether it is finished."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    for key in ("step", "completed"):
        if key in msg:
            household.data["setup"][key] = msg[key]
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/config/save",
        vol.Optional("session"): str,
        vol.Optional(CONF_CALENDARS): [CALENDAR_CONFIG_SCHEMA],
        vol.Optional(CONF_DISPLAY): DISPLAY_SCHEMA,
        vol.Optional(CONF_ONBOARDING_COMPLETE): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The parent-mode counterpart of the admin-only save_config action (spec 6.5)."""
    if _parent(hass, connection, msg, needs_file=False) is None:
        return
    changes = {
        key: msg[key]
        for key in (CONF_CALENDARS, CONF_DISPLAY, CONF_ONBOARDING_COMPLETE)
        if key in msg
    }
    await async_store_config(hass, changes)
    connection.send_result(msg["id"])


HOUSEHOLD_COMMANDS = (
    ws_household_subscribe,
    ws_member_save,
    ws_member_delete,
    ws_member_reorder,
    ws_shared_screen,
    ws_settings_save,
    ws_setup_save,
    ws_config_save,
)


@callback
def async_setup_household_websocket(hass: HomeAssistant) -> None:
    """Register the household commands (once per Home Assistant start)."""
    for command in HOUSEHOLD_COMMANDS:
        websocket_api.async_register_command(hass, command)
```

- [ ] **Step 5: Register the commands**

In `__init__.py`, import `from .household.websocket import async_setup_household_websocket` and call it in `async_setup` right after `async_setup_services(hass)`:

```python
async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register services, WebSocket commands, and the card bundle once."""
    async_setup_services(hass)
    async_setup_household_websocket(hass)
    await async_register_frontend(hass)
    return True
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh -q`
Expected: every test passes (`154` from Task 4 plus `39` here: `193 passed`).

- [ ] **Step 7: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/websocket.py custom_components/planavista/__init__.py tests/conftest.py tests/test_household_websocket.py
git commit -F - <<'EOF'
feat(household): add WebSocket commands for people and shared screens

The card can follow the household, add and change people, reorder them,
mark a shared family screen, and save settings through parent mode. Each
command applies the same rule: a PIN is needed wherever the account
doesn't identify one person.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 6: PIN commands, sessions on their connection, and the leak test

**Files:**
- Modify: `custom_components/planavista/household/websocket.py` (append the PIN commands)
- Test: `tests/test_pins.py`

**Interfaces:**
- Consumes: Task 2's `valid_pin`, `hash_pin`, `verify_pin`, `pause_remaining`, `tries_left`, `after_failure`, `after_success`, `SESSION_IDLE_SECONDS`; Task 3's `may_manage_pin`; Task 5's helpers.
- Produces these commands:

| Command | Who | Fields | Result |
|---|---|---|---|
| `planavista/pin/unlock` | anyone | `member_id`, `pin` | `{"ok": true, "session", "member_id", "parent", "expires_in": 120}` or `{"ok": false, "reason": "no_pin" \| "wrong_pin" \| "paused", "tries_left"?, "retry_after"?}` |
| `planavista/pin/set` | the person (own login or own session) or a parent | `member_id`, `pin`, `session`? | `null`; error `invalid_pin` |
| `planavista/pin/clear` | the same | `member_id`, `session`? | `null`; error `last_parent_pin` |
| `planavista/pin/clear_lockout` | parent | `member_id`, `session`? | `null` |
| `planavista/pin/lock` | the screen holding the session | `session` | `null` (also when it already ended) |
| `planavista/pin/touch` | the screen holding the session | `session` | `{"expires_in": 120}`; error `session_ended` |

- [ ] **Step 1: Write the failing tests**

Create `tests/test_pins.py`:

```python
"""Tests for the PIN commands: unlocking, pauses, sessions, and that PINs never leak."""
from __future__ import annotations

from datetime import timedelta
import json
import logging
from typing import Any

from freezegun.api import FrozenDateTimeFactory
import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.const import MATCH_ALL
from homeassistant.core import Event, HomeAssistant, callback

from custom_components.planavista.household import websocket as household_ws

from .conftest import set_pin, ws_client_for, ws_command

PIN = "482613"


@pytest.fixture
async def kitchen(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> Any:
    """The wall tablet's connection; its account is a shared screen and Blair has a PIN."""
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "blair", PIN)
    return await ws_client_for(hass, hass_ws_client, accounts["kitchen"])


async def _unlock(client: Any, member_id: str, pin: str) -> dict[str, Any]:
    reply = await ws_command(client, {"type": "planavista/pin/unlock", "member_id": member_id, "pin": pin})
    return reply["result"]


async def test_a_parent_pin_starts_parent_mode_on_a_shared_screen(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    denied = await ws_command(kitchen, {"type": "planavista/household/settings/save", "shuffle_keypad": True})
    assert denied["error"]["code"] == "parent_mode_required"
    result = await _unlock(kitchen, "blair", PIN)
    assert (result["ok"], result["parent"], result["member_id"], result["expires_in"]) == (True, True, "blair", 120)
    allowed = await ws_command(
        kitchen,
        {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": result["session"]},
    )
    assert allowed["success"]
    assert household.data["security"]["shuffle_keypad"] is True


async def test_wrong_pins_pause_after_five_tries(
    hass: HomeAssistant, household: Any, kitchen: Any, freezer: FrozenDateTimeFactory
) -> None:
    replies = [await _unlock(kitchen, "blair", "000000") for _ in range(6)]
    assert [r["reason"] for r in replies] == ["wrong_pin"] * 4 + ["paused", "paused"]
    assert [r["tries_left"] for r in replies[:4]] == [4, 3, 2, 1]
    assert replies[4]["retry_after"] == 30
    freezer.tick(timedelta(seconds=31))
    for _ in range(5):
        reply = await _unlock(kitchen, "blair", "000000")
    assert (reply["reason"], reply["retry_after"]) == ("paused", 60)
    freezer.tick(timedelta(seconds=61))
    assert (await _unlock(kitchen, "blair", PIN))["ok"] is True
    record = household.pins["blair"]
    assert (record["failures"], record["lockouts"], record["locked_until"]) == (0, 0, None)


async def test_parallel_tries_cannot_skip_the_pause(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    for _ in range(8):
        await kitchen.send_json_auto_id(
            {"type": "planavista/pin/unlock", "member_id": "blair", "pin": "000000"}
        )
    reasons = [(await kitchen.receive_json())["result"]["reason"] for _ in range(8)]
    assert sorted(reasons) == ["paused"] * 4 + ["wrong_pin"] * 4
    assert household.pins["blair"]["lockouts"] == 1


async def test_a_session_belongs_to_its_connection(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    other = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    reply = await ws_command(
        other, {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": token}
    )
    assert reply["error"]["code"] == "parent_mode_required"


async def test_closing_the_connection_ends_its_sessions(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    await _unlock(kitchen, "blair", PIN)
    assert len(household.sessions) == 1
    await kitchen.close()
    await hass.async_block_till_done()
    assert len(household.sessions) == 0


async def test_a_session_ends_after_two_quiet_minutes(
    hass: HomeAssistant, household: Any, kitchen: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    clock = [1000.0]
    monkeypatch.setattr(household_ws, "_monotonic", lambda: clock[0])
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    clock[0] += 119
    assert (await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token}))["result"] == {"expires_in": 120}
    clock[0] += 119
    saved = await ws_command(
        kitchen, {"type": "planavista/household/settings/save", "shuffle_keypad": False, "session": token}
    )
    assert saved["success"]
    clock[0] += 121
    reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
    assert reply["error"]["code"] == "session_ended"


async def test_lock_ends_parent_mode(hass: HomeAssistant, household: Any, kitchen: Any) -> None:
    token = (await _unlock(kitchen, "blair", PIN))["session"]
    assert (await ws_command(kitchen, {"type": "planavista/pin/lock", "session": token}))["success"]
    reply = await ws_command(kitchen, {"type": "planavista/pin/touch", "session": token})
    assert reply["error"]["code"] == "session_ended"
    assert (await ws_command(kitchen, {"type": "planavista/pin/lock", "session": token}))["success"]


async def test_a_members_own_session_changes_only_their_pin(
    hass: HomeAssistant, household: Any, kitchen: Any
) -> None:
    await set_pin(hass, household, "casey", "1357")
    result = await _unlock(kitchen, "casey", "1357")
    assert result["parent"] is False
    token = result["session"]
    changed = await ws_command(
        kitchen, {"type": "planavista/pin/set", "member_id": "casey", "pin": "2468", "session": token}
    )
    assert changed["success"]
    for fields in (
        {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468", "session": token},
        {"type": "planavista/household/settings/save", "shuffle_keypad": True, "session": token},
    ):
        assert (await ws_command(kitchen, fields))["error"]["code"] == "parent_mode_required"


async def test_your_own_login_sets_your_own_pin(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    assert (await ws_command(casey, {"type": "planavista/pin/set", "member_id": "casey", "pin": "2468"}))["success"]
    denied = await ws_command(casey, {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468"})
    assert denied["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    assert (await ws_command(alex, {"type": "planavista/pin/set", "member_id": "dana", "pin": "2468"}))["success"]


@pytest.mark.parametrize("pin", ["48a613", "481", "4826131", 482613, ["4826"], None])
async def test_bad_pins_are_refused_without_repeating_them(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    caplog: pytest.LogCaptureFixture,
    pin: Any,
) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/pin/set", "member_id": "dana", "pin": pin})
    error = reply["error"]
    assert (error["code"], error["message"]) == ("invalid_pin", "PINs are 4 to 6 digits.")
    # Short values could match a line number in the log, so only long ones are looked for.
    if isinstance(pin, (str, int)) and len(str(pin)) >= 6:
        assert str(pin) not in caplog.text
    assert "dana" not in household.pins


async def test_the_last_parent_pin_stays_while_a_screen_is_shared(
    hass: HomeAssistant, hass_ws_client: Any, household: Any, kitchen: Any
) -> None:
    admin = await hass_ws_client(hass)
    denied = await ws_command(admin, {"type": "planavista/pin/clear", "member_id": "blair"})
    assert denied["error"]["code"] == "last_parent_pin"
    await set_pin(hass, household, "alex", "1357")
    assert (await ws_command(admin, {"type": "planavista/pin/clear", "member_id": "blair"}))["success"]
    assert "blair" not in household.pins


async def test_a_parent_can_clear_a_pause(
    hass: HomeAssistant, hass_ws_client: Any, household: Any, kitchen: Any
) -> None:
    for _ in range(5):
        await _unlock(kitchen, "blair", "000000")
    denied = await ws_command(kitchen, {"type": "planavista/pin/clear_lockout", "member_id": "blair"})
    assert denied["error"]["code"] == "parent_mode_required"
    admin = await hass_ws_client(hass)
    assert (await ws_command(admin, {"type": "planavista/pin/clear_lockout", "member_id": "blair"}))["success"]
    assert (await _unlock(kitchen, "blair", PIN))["ok"] is True


async def test_unlocking_someone_without_a_pin(hass: HomeAssistant, household: Any, kitchen: Any) -> None:
    assert await _unlock(kitchen, "dana", "1234") == {"ok": False, "reason": "no_pin"}
    assert await _unlock(kitchen, "nobody", "1234") == {"ok": False, "reason": "no_pin"}


async def test_a_new_pin_ends_the_members_other_sessions(
    hass: HomeAssistant, hass_ws_client: Any, accounts: dict[str, MockUser], household: Any, kitchen: Any
) -> None:
    here = (await _unlock(kitchen, "blair", PIN))["session"]
    second = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    there = (await _unlock(second, "blair", PIN))["session"]
    changed = await ws_command(
        kitchen, {"type": "planavista/pin/set", "member_id": "blair", "pin": "1357", "session": here}
    )
    assert changed["success"]
    assert (await ws_command(kitchen, {"type": "planavista/pin/touch", "session": here}))["success"]
    reply = await ws_command(second, {"type": "planavista/pin/touch", "session": there})
    assert reply["error"]["code"] == "session_ended"


async def test_a_pin_never_leaks(
    hass: HomeAssistant,
    hass_ws_client: Any,
    accounts: dict[str, MockUser],
    household: Any,
    caplog: pytest.LogCaptureFixture,
    hass_storage: dict[str, Any],
) -> None:
    """Set a known PIN, run every flow, and look for it where it must never be (spec 9.8)."""
    # Home Assistant's own WebSocket debug log prints every message it receives,
    # access tokens included (plan ruling). Everything of PlanaVista's logs at debug.
    caplog.set_level(logging.INFO, logger="homeassistant.components.websocket_api")
    caplog.set_level(logging.DEBUG, logger="custom_components.planavista")
    events: list[Event] = []

    @callback
    def remember(event: Event) -> None:
        events.append(event)

    hass.bus.async_listen(MATCH_ALL, remember)
    household.shared_users.append(accounts["kitchen"].id)
    admin = await hass_ws_client(hass)
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    seen: list[dict[str, Any]] = []
    await ws_command(admin, {"type": "planavista/household/subscribe"}, seen)

    steps = [
        (admin, {"type": "planavista/pin/set", "member_id": "blair", "pin": PIN}),
        (kitchen, {"type": "planavista/pin/unlock", "member_id": "blair", "pin": "135791"}),
        (kitchen, {"type": "planavista/pin/unlock", "member_id": "blair", "pin": PIN}),
        (admin, {"type": "planavista/pin/set", "member_id": "alex", "pin": PIN}),
        (admin, {"type": "planavista/pin/set", "member_id": "casey", "pin": "48a613"}),
        (admin, {"type": "planavista/pin/clear", "member_id": "alex"}),
    ]
    for client, fields in steps:
        await ws_command(client, fields, seen)
    await hass.async_block_till_done()

    haystacks = {
        "logs": caplog.text,
        "storage": json.dumps(hass_storage, default=str),
        "events": json.dumps([event.as_dict() for event in events], default=str),
        "states": json.dumps([state.as_dict() for state in hass.states.async_all()], default=str),
        "replies": json.dumps(seen, default=str),
    }
    for where, text in haystacks.items():
        for secret in (PIN, "135791", "48a613"):
            assert secret not in text, f"{secret} found in {where}"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bash scripts/test-backend.sh tests/test_pins.py -q`
Expected: failures with `unknown_command` for the `planavista/pin/*` commands (for example `KeyError: 'result'` in `_unlock`).

- [ ] **Step 3: Append the PIN commands to `household/websocket.py`**

Add these imports at the top of the file:

```python
from functools import partial
import math

from homeassistant.util import dt as dt_util

from .permissions import may_manage_pin
from .security import (
    SESSION_IDLE_SECONDS,
    after_failure,
    after_success,
    hash_pin,
    pause_remaining,
    tries_left,
    valid_pin,
    verify_pin,
)
```

Append, above `HOUSEHOLD_COMMANDS`:

```python
# PIN fields accept any value; the handler checks the format with a fixed
# message, so Home Assistant's error logging can never quote a PIN.
INVALID_PIN = "PINs are 4 to 6 digits."


@callback
def _pin_manager(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> tuple[Household, str | None] | None:
    """The household and this command's session token, when the account may manage the PIN."""
    household = _household(hass, connection, msg)
    if household is None:
        return None
    if household.member(msg["member_id"]) is None:
        connection.send_error(msg["id"], "unknown_member", ERROR_MESSAGES["unknown_member"])
        return None
    account = _account(hass, household, connection.user)
    session = _session(household, connection, msg)
    if may_manage_pin(account, session, msg["member_id"]) is None:
        _refuse(connection, msg, account)
        return None
    if not household.available:
        connection.send_error(
            msg["id"], "unavailable", "Update PlanaVista to change people and PINs."
        )
        return None
    return household, msg.get("session") if session else None


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/unlock",
        vol.Required("member_id"): str,
        vol.Required("pin"): object,
    }
)
@websocket_api.async_response
async def ws_pin_unlock(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Check a PIN and start parent mode (a parent) or the member's own session."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    member_id = msg["member_id"]
    member = household.member(member_id)
    # One check at a time per member: parallel tries must not skip a pause.
    async with household.pin_lock(member_id):
        record = household.pins.get(member_id) if member else None
        if record is None:
            connection.send_result(msg["id"], {"ok": False, "reason": "no_pin"})
            return
        now = dt_util.utcnow()
        if (wait := pause_remaining(record, now)) > 0:
            connection.send_result(
                msg["id"], {"ok": False, "reason": "paused", "retry_after": math.ceil(wait)}
            )
            return
        pin = msg["pin"] if isinstance(msg["pin"], str) else ""
        if not await hass.async_add_executor_job(verify_pin, pin, record):
            record = after_failure(record, now)
            household.pins[member_id] = record
            await household.async_save()
            wait = pause_remaining(record, now)
            connection.send_result(
                msg["id"],
                {
                    "ok": False,
                    "reason": "paused" if wait else "wrong_pin",
                    "tries_left": tries_left(record),
                    "retry_after": math.ceil(wait) if wait else None,
                },
            )
            return
        if record.get("failures") or record.get("lockouts"):
            household.pins[member_id] = after_success(record)
            await household.async_save()
    session = household.sessions.start(
        member_id, bool(member.get("parent")), connection, _monotonic()
    )
    connection.subscriptions[("planavista_session", session.token)] = partial(
        household.sessions.end, session.token
    )
    connection.send_result(
        msg["id"],
        {
            "ok": True,
            "session": session.token,
            "member_id": member_id,
            "parent": session.parent,
            "expires_in": SESSION_IDLE_SECONDS,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/set",
        vol.Required("member_id"): str,
        vol.Required("pin"): object,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_set(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Set or change a PIN. The member's other sessions end; this one stays."""
    context = _pin_manager(hass, connection, msg)
    if context is None:
        return
    household, token = context
    if not valid_pin(msg["pin"]):
        connection.send_error(msg["id"], "invalid_pin", INVALID_PIN)
        return
    household.pins[msg["member_id"]] = await hass.async_add_executor_job(hash_pin, msg["pin"])
    household.sessions.end_member(msg["member_id"], keep=token)
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/clear",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_clear(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove a PIN, unless shared screens would be left with no parent PIN."""
    context = _pin_manager(hass, connection, msg)
    if context is None:
        return
    household, token = context
    member_id = msg["member_id"]
    pins = {key: value for key, value in household.pins.items() if key != member_id}
    try:
        check_parent_pins(
            household.members, household.members, household.pins, pins, bool(household.shared_users)
        )
    except MemberError as err:
        _member_error(connection, msg, err)
        return
    household.data["security"]["pins"] = pins
    household.sessions.end_member(member_id, keep=token)
    await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "planavista/pin/clear_lockout",
        vol.Required("member_id"): str,
        vol.Optional("session"): str,
    }
)
@websocket_api.async_response
async def ws_pin_clear_lockout(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """A parent ends a pause after too many wrong tries (spec 9.6)."""
    context = _parent(hass, connection, msg)
    if context is None:
        return
    household, _by = context
    if (record := household.pins.get(msg["member_id"])) is not None:
        household.pins[msg["member_id"]] = after_success(record)
        await household.async_save()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "planavista/pin/lock", vol.Required("session"): str}
)
@callback
def ws_pin_lock(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """End a session now (Lock, or the page was hidden)."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    if household.sessions.get(msg["session"], connection, _monotonic()) is not None:
        household.sessions.end(msg["session"])
        connection.subscriptions.pop(("planavista_session", msg["session"]), None)
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "planavista/pin/touch", vol.Required("session"): str}
)
@callback
def ws_pin_touch(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Someone is using the screen: keep the session open."""
    household = _household(hass, connection, msg)
    if household is None:
        return
    if household.sessions.get(msg["session"], connection, _monotonic(), touch=True) is None:
        connection.send_error(msg["id"], "session_ended", "The PIN session ended.")
        return
    connection.send_result(msg["id"], {"expires_in": SESSION_IDLE_SECONDS})
```

Then extend `HOUSEHOLD_COMMANDS` with `ws_pin_unlock, ws_pin_set, ws_pin_clear, ws_pin_clear_lockout, ws_pin_lock, ws_pin_touch`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bash scripts/test-backend.sh -q`
Expected: every test passes (`193` plus `20` here: `213 passed`).

- [ ] **Step 5: Commit**

```bash
python scripts/check_copy.py
git add custom_components/planavista/household/websocket.py tests/test_pins.py
git commit -F - <<'EOF'
feat(household): add PIN commands with pauses and per-screen sessions

A parent's PIN starts parent mode on that screen's connection; anyone
else's starts their own session. Five wrong tries in a row start a pause,
checked one at a time per person. A test sets a known PIN, runs every
flow, and fails if the PIN shows up in logs, events, states, or storage.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 7: The card's household logic (pure TypeScript)

Frontend commands in this task run in `custom_components/planavista/frontend`.

**Files:**
- Create: `src/core/household.ts`, `src/core/layout.ts`, `src/core/keypad.ts`, `src/core/session.ts`, `src/core/reorder.ts`, `src/core/household-client.ts`, `src/modules/calendar/calendar-rows.ts`
- Modify: `src/utils/weather-subscription.ts` (export `safeUnsubscribe`)
- Test: `test/household.test.ts`, `test/layout.test.ts`, `test/keypad.test.ts`, `test/session.test.ts`, `test/reorder.test.ts`, `test/household-client.test.ts`, `test/calendar-rows.test.ts`

**Interfaces:**
- Consumes: the backend's household view and commands (Tasks 5 and 6).
- Produces:
  - `core/household.ts`: types `AgeGroup`, `Role`, `Picture`, `Member`, `AccountKind`, `AccountView`, `HouseholdView`, `MemberChanges`, `CalendarLink`, `PictureView`, `SettingsAccess = 'open' | 'pin' | 'no_pin' | 'none'`; constants `AGE_GROUP_LABELS`, `AGE_GROUP_CHOICES`, `ROLES`; functions `roleOf`, `roleFields`, `inOrder`, `initialOf`, `parentsWithPins`, `settingsAccess(view, isAdmin)`, `calendarsOf`, `memberSummary`, `takenColors`, `nextFreeColor`, `pictureOf`.
  - `core/layout.ts`: `Layout = 'phone' | 'portrait' | 'landscape'`, `Box`, `PHONE_MAX_WIDTH = 600`, `classifyLayout(box, previous, previousBox, textFocused) -> Layout`.
  - `core/keypad.ts`: `DIGITS`, `MIN_PIN = 4`, `MAX_PIN = 6`, `PinEntry`, `keypadDigits(shuffle, random?)`, `startEntry(length)`, `pressDigit`, `pressDelete`, `isComplete`, `canFinishChoosing`.
  - `core/session.ts`: `SESSION_IDLE_MS = 120000`, `TOUCH_EVERY_MS = 30000`, `Session`, `startSession(result, now)`, `remainingMs(session, now)`, `expired(session, now)`, `noteActivity(session, now) -> { session, touch }`.
  - `core/reorder.ts`: `moveItem(list, from, to)`, `rowIndexAt(y, rows)`.
  - `core/household-client.ts`: `HouseholdConnection`, `HouseholdSubscription` (`update(connection)`, `stop()`), `WsCaller`, `UnlockResult`, `HouseholdApi` (methods below), `errorCode(err)`.
  - `modules/calendar/calendar-rows.ts`: `CalendarRow`, `Preset`, `buildCalendarRows(saved, entityIds, friendlyName, presets)`, `toSavedCalendars(rows)`, `belongsTo(row, members)`.

- [ ] **Step 1: Write the failing tests**

Create `test/household.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  AccountKind,
  HouseholdView,
  Member,
  inOrder,
  initialOf,
  memberSummary,
  nextFreeColor,
  parentsWithPins,
  pictureOf,
  roleFields,
  roleOf,
  settingsAccess,
  takenColors,
} from '../src/core/household';

function member(overrides: Partial<Member>): Member {
  return {
    id: 'alex', name: 'Alex', color: '#F94144', color_dark: null, picture: { initial: true },
    age_group: 'adult', parent: false, person: null, order: 0, rev: 1, my_day: 'timeline',
    needs_ok_for: 'none', stars: false, has_pin: false, pin_length: null, locked_until: null,
    ...overrides,
  };
}

const ALEX = member({ id: 'alex', name: 'Alex', parent: true, has_pin: true, pin_length: 4, person: 'person.alex', order: 0 });
const BLAIR = member({ id: 'blair', name: 'Blair', color: '#277DA1', parent: true, order: 1 });
const CASEY = member({ id: 'casey', name: 'Casey', color: '#43AA8B', age_group: 'teen', order: 2 });
const DANA = member({ id: 'dana', name: 'Dana', color: '#F9C74F', age_group: 'young_child', picture: { emoji: '\u{1F996}' }, order: 3 });
const EVERYONE = [ALEX, BLAIR, CASEY, DANA];

function view(kind: AccountKind, parentLevel: boolean, members = EVERYONE, available = true): HouseholdView {
  return {
    available,
    members,
    account: { user_id: 'u1', name: 'U', is_admin: kind === 'admin', shared: kind === 'shared', kind, member_id: null, parent_level: parentLevel },
    security: { shuffle_keypad: false, shared_screens: 0 },
    modules: {},
    setup: { completed: true, step: null },
  };
}

describe('settingsAccess', () => {
  it('opens Settings for admins and parents on their own login', () => {
    expect(settingsAccess(view('admin', true), true)).toBe('open');
    expect(settingsAccess(view('parent', true), false)).toBe('open');
  });

  it('asks for a parent PIN on shared screens and on accounts linked to no one', () => {
    expect(settingsAccess(view('shared', false), false)).toBe('pin');
    expect(settingsAccess(view('other', false), false)).toBe('pin');
  });

  it('explains when no parent has a PIN yet', () => {
    expect(settingsAccess(view('shared', false, [BLAIR, CASEY]), false)).toBe('no_pin');
    expect(settingsAccess(view('other', false, []), true)).toBe('no_pin');
  });

  it('keeps Settings away from children on their own login', () => {
    expect(settingsAccess(view('member', false), false)).toBe('none');
  });

  it('falls back to admins only, as in 1.1.0, without a usable household', () => {
    expect(settingsAccess(null, true)).toBe('open');
    expect(settingsAccess(null, false)).toBe('none');
    expect(settingsAccess(view('shared', false, EVERYONE, false), true)).toBe('open');
  });
});

describe('people helpers', () => {
  it('maps roles to age group and parent and back', () => {
    expect(roleOf(ALEX)).toBe('parent');
    expect(roleOf(CASEY)).toBe('teen');
    expect(roleFields('parent')).toEqual({ age_group: 'adult', parent: true });
    expect(roleFields('young_child')).toEqual({ age_group: 'young_child', parent: false });
  });

  it('sorts people in board order', () => {
    expect(inOrder([DANA, BLAIR, ALEX, CASEY]).map(m => m.id)).toEqual(['alex', 'blair', 'casey', 'dana']);
  });

  it('takes the first letter of a name for the initial', () => {
    expect(initialOf('alex')).toBe('A');
    expect(initialOf('  zoë')).toBe('Z');
    expect(initialOf('\u{1F996} Rex')).toBe('\u{1F996}');
    expect(initialOf('')).toBe('?');
  });

  it('finds the parents who can start parent mode', () => {
    expect(parentsWithPins(EVERYONE).map(m => m.id)).toEqual(['alex']);
  });

  it('knows which colors are taken and which is free', () => {
    expect([...takenColors(EVERYONE, 'alex').keys()]).toEqual(['#277DA1', '#43AA8B', '#F9C74F']);
    expect(nextFreeColor([ALEX], ['#f94144', '#277da1'])).toBe('#277da1');
    expect(nextFreeColor([ALEX], ['#F94144'])).toBeNull();
  });

  it('summarizes a person for the People list', () => {
    const calendars = [
      { entity_id: 'calendar.alex', display_name: 'Work', member_id: 'alex' },
      { entity_id: 'calendar.school', display_name: 'School', member_id: 'casey' },
      { entity_id: 'calendar.soccer', display_name: 'Soccer', member_id: 'casey' },
    ];
    expect(memberSummary(ALEX, calendars)).toBe("Parent · PIN on · Alex's calendar");
    expect(memberSummary(CASEY, calendars)).toBe('Teen · 2 calendars');
    expect(memberSummary(DANA, calendars)).toBe('Young child · no calendar');
  });

  it('picks what a picture shows', () => {
    const photos = (id: string) => (id === 'person.alex' ? '/api/image/alex.jpg' : null);
    expect(pictureOf(DANA, photos)).toEqual({ kind: 'emoji', text: '\u{1F996}' });
    expect(pictureOf({ ...ALEX, picture: { person: true } }, photos)).toEqual({ kind: 'photo', url: '/api/image/alex.jpg' });
    expect(pictureOf({ ...CASEY, picture: { person: true }, person: 'person.casey' }, photos)).toEqual({ kind: 'initial', text: 'C' });
    expect(pictureOf(BLAIR, photos)).toEqual({ kind: 'initial', text: 'B' });
  });
});
```

Create `test/layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { classifyLayout } from '../src/core/layout';

describe('classifyLayout', () => {
  it('sorts the reference sizes', () => {
    expect(classifyLayout({ width: 800, height: 1280 }, null, null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1280, height: 800 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 390, height: 844 }, null, null, false)).toBe('phone');
  });

  it('calls anything narrower than 600 px a phone', () => {
    expect(classifyLayout({ width: 599, height: 300 }, null, null, false)).toBe('phone');
    expect(classifyLayout({ width: 600, height: 900 }, null, null, false)).toBe('portrait');
  });

  it('keeps the previous shape when the card is nearly square', () => {
    expect(classifyLayout({ width: 1000, height: 1000 }, null, null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 1040, height: 1000 }, 'portrait', null, false)).toBe('portrait');
    expect(classifyLayout({ width: 960, height: 1000 }, 'landscape', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1060, height: 1000 }, 'portrait', null, false)).toBe('landscape');
    expect(classifyLayout({ width: 1000, height: 1000 }, 'phone', null, false)).toBe('landscape');
  });

  it('ignores the on-screen keyboard while a text field has focus', () => {
    const tablet = { width: 800, height: 1280 };
    const keyboard = { width: 800, height: 700 };
    expect(classifyLayout(keyboard, 'portrait', tablet, true)).toBe('portrait');
    expect(classifyLayout(keyboard, 'portrait', tablet, false)).toBe('landscape');
    expect(classifyLayout({ width: 1280, height: 800 }, 'portrait', tablet, true)).toBe('landscape');
  });

  it('treats a card with no height as landscape', () => {
    expect(classifyLayout({ width: 900, height: 0 }, null, null, false)).toBe('landscape');
  });
});
```

Create `test/keypad.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { DIGITS, canFinishChoosing, isComplete, keypadDigits, pressDelete, pressDigit, startEntry } from '../src/core/keypad';

function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

describe('keypad', () => {
  it('lays out 1 to 9 then 0 unless shuffled', () => {
    expect(keypadDigits(false)).toEqual([...DIGITS]);
  });

  it('shuffles into a different order that still has every digit once', () => {
    const shuffled = keypadDigits(true, seeded(7));
    expect([...shuffled].sort()).toEqual([...DIGITS].sort());
    expect(shuffled).not.toEqual([...DIGITS]);
  });

  it('collects digits up to the PIN length', () => {
    let entry = startEntry(4);
    for (const digit of '48261') entry = pressDigit(entry, digit);
    expect(entry.digits).toBe('4826');
    expect(isComplete(entry)).toBe(true);
    expect(pressDigit(startEntry(4), 'x').digits).toBe('');
    expect(pressDelete(entry).digits).toBe('482');
    expect(pressDelete(startEntry(4)).digits).toBe('');
  });

  it('collects up to 6 when choosing a new PIN, and allows finishing from 4', () => {
    let entry = startEntry(null);
    expect(entry.length).toBe(6);
    for (const digit of '482') entry = pressDigit(entry, digit);
    expect(canFinishChoosing(entry)).toBe(false);
    entry = pressDigit(entry, '6');
    expect(canFinishChoosing(entry)).toBe(true);
    expect(isComplete(entry)).toBe(false);
  });
});
```

Create `test/session.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SESSION_IDLE_MS, TOUCH_EVERY_MS, expired, noteActivity, remainingMs, startSession } from '../src/core/session';

const UNLOCKED = { session: 'token', member_id: 'blair', parent: true };

describe('session', () => {
  it('starts with two minutes left', () => {
    const session = startSession(UNLOCKED, 1000);
    expect(session).toEqual({ token: 'token', memberId: 'blair', parent: true, lastTouch: 1000 });
    expect(remainingMs(session, 1000)).toBe(SESSION_IDLE_MS);
  });

  it('runs out after two minutes without a touch the backend heard', () => {
    const session = startSession(UNLOCKED, 0);
    expect(remainingMs(session, 119_000)).toBe(1000);
    expect(expired(session, 119_999)).toBe(false);
    expect(expired(session, 120_000)).toBe(true);
  });

  it('tells the backend about activity at most every 30 seconds', () => {
    const session = startSession(UNLOCKED, 0);
    const soon = noteActivity(session, TOUCH_EVERY_MS - 1);
    expect(soon.touch).toBe(false);
    expect(soon.session).toBe(session);
    const later = noteActivity(session, TOUCH_EVERY_MS);
    expect(later.touch).toBe(true);
    expect(remainingMs(later.session, TOUCH_EVERY_MS)).toBe(SESSION_IDLE_MS);
  });
});
```

Create `test/reorder.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { moveItem, rowIndexAt } from '../src/core/reorder';

describe('reorder', () => {
  it('moves an item to a new place', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });

  it('finds the row a dragged pointer is over', () => {
    const rows = [{ top: 0, height: 60 }, { top: 60, height: 60 }, { top: 120, height: 60 }];
    expect(rowIndexAt(-10, rows)).toBe(0);
    expect(rowIndexAt(29, rows)).toBe(0);
    expect(rowIndexAt(31, rows)).toBe(1);
    expect(rowIndexAt(500, rows)).toBe(2);
    expect(rowIndexAt(10, [])).toBe(-1);
  });
});
```

Create `test/household-client.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { HouseholdApi, HouseholdConnection, HouseholdSubscription, errorCode } from '../src/core/household-client';
import { HouseholdView } from '../src/core/household';

/** A connection whose subscribes stay pending until resolveAll(). */
function fakeConnection() {
  const callbacks: Array<(view: HouseholdView) => void> = [];
  const unsubscribed: number[] = [];
  const pending: Array<() => void> = [];
  const subscribeMessage = vi.fn((callback: (view: HouseholdView) => void, _message: Record<string, unknown>) => {
    const index = callbacks.push(callback) - 1;
    return new Promise<() => void>(resolve => {
      pending.push(() => resolve(() => { unsubscribed.push(index); }));
    });
  });
  const connection: HouseholdConnection = { subscribeMessage };
  return { connection, subscribeMessage, callbacks, unsubscribed, resolveAll: () => pending.splice(0).forEach(run => run()) };
}

const VIEW = { available: true, members: [] } as unknown as HouseholdView;

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('HouseholdSubscription', () => {
  it('subscribes once per connection and passes views on', async () => {
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    const subscription = new HouseholdSubscription(view => views.push(view));
    subscription.update(fake.connection);
    subscription.update(fake.connection);
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(1);
    fake.resolveAll();
    await settle();
    fake.callbacks[0](VIEW);
    expect(views).toEqual([VIEW]);
  });

  it('drops a subscription that resolves after it was stopped', async () => {
    const views: Array<HouseholdView | null> = [];
    const fake = fakeConnection();
    const subscription = new HouseholdSubscription(view => views.push(view));
    subscription.update(fake.connection);
    subscription.stop();
    fake.resolveAll();
    await settle();
    expect(fake.unsubscribed).toEqual([0]);
    fake.callbacks[0](VIEW);
    expect(views).toEqual([]);
  });

  it('reports null when the backend has no household (an older PlanaVista)', async () => {
    const views: Array<HouseholdView | null> = [];
    const connection: HouseholdConnection = { subscribeMessage: () => Promise.reject({ code: 'unknown_command' }) };
    new HouseholdSubscription(view => views.push(view)).update(connection);
    await settle();
    expect(views).toEqual([null]);
  });
});

describe('HouseholdApi', () => {
  it('adds the session token to commands, except unlock and lock', async () => {
    const sent: Array<Record<string, unknown>> = [];
    const ws = { callWS: async <T>(message: Record<string, unknown>) => { sent.push(message); return {} as T; } };
    let token: string | null = 'abc';
    const api = new HouseholdApi(ws, () => token);
    await api.saveConfig({ display: { time_format: '24h' } });
    await api.saveMember({ name: 'Erin' }, { id: 'erin', rev: 3 });
    await api.unlock('blair', '4826');
    await api.lock('abc');
    token = null;
    await api.reorder(['dana', 'alex']);
    expect(sent).toEqual([
      { type: 'planavista/config/save', display: { time_format: '24h' }, session: 'abc' },
      { type: 'planavista/household/member/save', member: { name: 'Erin' }, member_id: 'erin', rev: 3, session: 'abc' },
      { type: 'planavista/pin/unlock', member_id: 'blair', pin: '4826' },
      { type: 'planavista/pin/lock', session: 'abc' },
      { type: 'planavista/household/member/reorder', order: ['dana', 'alex'] },
    ]);
  });

  it('reads the code of a failed command', () => {
    expect(errorCode({ code: 'parent_mode_required', message: 'x' })).toBe('parent_mode_required');
    expect(errorCode(new Error('boom'))).toBe('unknown');
    expect(errorCode(undefined)).toBe('unknown');
  });
});
```

Create `test/calendar-rows.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { belongsTo, buildCalendarRows, toSavedCalendars } from '../src/modules/calendar/calendar-rows';
import { Member } from '../src/core/household';

const PRESETS = [{ color: '#001219', light: '#A6ACAF' }, { color: '#005F73', light: '#A6C7CE' }];
const SAVED = [
  {
    entity_id: 'calendar.test_casey', display_name: 'Casey', color: '#43AA8B', color_light: '#BDE1D6',
    icon: 'mdi:soccer', person_entity: 'person.casey', visible: false, member_id: 'casey',
    added_later: 'kept', state: 'off', attributes: { friendly_name: 'Test Casey' },
  },
];
const names: Record<string, string> = { 'calendar.test_alex': 'Test Alex', 'calendar.test_blair': 'Test Blair' };

describe('calendar rows', () => {
  it('lists saved calendars first, then the other Home Assistant calendars, sorted and left out', () => {
    const rows = buildCalendarRows(SAVED, ['calendar.test_blair', 'calendar.test_alex', 'calendar.test_casey'], id => names[id], PRESETS);
    expect(rows.map(r => [r.entity_id, r.include])).toEqual([
      ['calendar.test_casey', true],
      ['calendar.test_alex', false],
      ['calendar.test_blair', false],
    ]);
    expect(rows[1]).toMatchObject({ display_name: 'Test Alex', color: '#005F73', color_light: '#A6C7CE', member_id: null, saved: null });
    expect(rows[0].saved).not.toHaveProperty('state');
    expect(rows[0].saved).not.toHaveProperty('attributes');
  });

  it('saves included rows with every key they had, and defaults for new ones', () => {
    const rows = buildCalendarRows(SAVED, ['calendar.test_alex'], id => names[id], PRESETS);
    rows[1] = { ...rows[1], include: true, member_id: 'alex' };
    rows[0] = { ...rows[0], display_name: 'Casey (school)' };
    expect(toSavedCalendars(rows)).toEqual([
      {
        entity_id: 'calendar.test_casey', display_name: 'Casey (school)', color: '#43AA8B', color_light: '#BDE1D6',
        icon: 'mdi:soccer', person_entity: 'person.casey', visible: false, member_id: 'casey', added_later: 'kept',
      },
      {
        entity_id: 'calendar.test_alex', display_name: 'Test Alex', color: '#005F73', color_light: '#A6C7CE',
        icon: 'mdi:calendar', person_entity: '', visible: true, member_id: 'alex',
      },
    ]);
  });

  it('says who a calendar belongs to', () => {
    const members = [
      { id: 'casey', person: 'person.casey' },
      { id: 'dana', person: null },
    ] as Member[];
    expect(belongsTo({ person_entity: 'person.casey', member_id: 'dana' }, members)).toEqual({ memberId: 'casey', viaPerson: true });
    expect(belongsTo({ person_entity: 'person.alex', member_id: 'dana' }, members)).toEqual({ memberId: 'dana', viaPerson: false });
    expect(belongsTo({ person_entity: '', member_id: 'blair' }, members)).toEqual({ memberId: null, viaPerson: false });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- household layout keypad session reorder household-client calendar-rows`
Expected: each file fails to import its module (`Failed to resolve import "../src/core/household"` and so on).

- [ ] **Step 3: Write the modules**

In `src/utils/weather-subscription.ts`, change `function safeUnsubscribe` to `export function safeUnsubscribe`.

Create `src/core/household.ts`:

```ts
/** Household members and accounts as the card receives them (planavista/household/subscribe). */

export type AgeGroup = 'young_child' | 'older_child' | 'teen' | 'adult';
export type Role = 'parent' | AgeGroup;
export type Picture = { initial: true } | { emoji: string } | { person: true };

export interface Member {
  id: string;
  name: string;
  color: string;
  color_dark: string | null;
  picture: Picture;
  age_group: AgeGroup;
  parent: boolean;
  person: string | null;
  order: number;
  rev: number;
  my_day: string;
  needs_ok_for: string;
  stars: boolean;
  has_pin: boolean;
  pin_length: number | null;
  locked_until: string | null;
  [key: string]: unknown;
}

export type AccountKind = 'shared' | 'admin' | 'parent' | 'member' | 'other';

export interface AccountView {
  user_id: string;
  name: string;
  is_admin: boolean;
  shared: boolean;
  kind: AccountKind;
  member_id: string | null;
  parent_level: boolean;
}

export interface HouseholdView {
  available: boolean;
  members: Member[];
  account: AccountView;
  security: { shuffle_keypad: boolean; shared_screens: number };
  modules: Record<string, unknown>;
  setup: { completed: boolean; step: string | null };
}

/** The fields the person page and setup change. */
export interface MemberChanges {
  name?: string;
  color?: string;
  picture?: Picture;
  age_group?: AgeGroup;
  parent?: boolean;
  person?: string | null;
}

/** The part of a calendar row the people pages read. */
export interface CalendarLink {
  entity_id: string;
  display_name: string;
  member_id?: string | null;
}

export type PictureView =
  | { kind: 'photo'; url: string }
  | { kind: 'emoji'; text: string }
  | { kind: 'initial'; text: string };

export type SettingsAccess = 'open' | 'pin' | 'no_pin' | 'none';

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  young_child: 'Young child',
  older_child: 'Older child',
  teen: 'Teen',
  adult: 'Adult',
};

/** The age groups on the person page, with the ages they suggest. */
export const AGE_GROUP_CHOICES: Array<{ id: AgeGroup; label: string; hint: string }> = [
  { id: 'young_child', label: 'Young child', hint: 'About 4 to 8' },
  { id: 'older_child', label: 'Older child', hint: 'About 9 to 12' },
  { id: 'teen', label: 'Teen', hint: '' },
  { id: 'adult', label: 'Adult', hint: '' },
];

/** The role chips of setup's "Who lives here?" (spec 14.7). */
export const ROLES: Array<{ id: Role; label: string }> = [
  { id: 'parent', label: 'Parent' },
  { id: 'adult', label: 'Adult' },
  { id: 'teen', label: 'Teen' },
  { id: 'older_child', label: 'Older child' },
  { id: 'young_child', label: 'Young child' },
];

export function roleOf(member: Pick<Member, 'age_group' | 'parent'>): Role {
  return member.parent ? 'parent' : member.age_group;
}

export function roleFields(role: Role): { age_group: AgeGroup; parent: boolean } {
  return role === 'parent' ? { age_group: 'adult', parent: true } : { age_group: role, parent: false };
}

/** People in board order. */
export function inOrder(members: Member[]): Member[] {
  return [...members].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** The first character of a name (a whole emoji counts as one), for the initial picture. */
export function initialOf(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toLocaleUpperCase() : '?';
}

/** Parents who can start parent mode with a PIN, in board order. */
export function parentsWithPins(members: Member[]): Member[] {
  return inOrder(members).filter(m => m.parent && m.has_pin);
}

/**
 * What the gear does for this account (spec 14.1): open Settings, ask for a
 * parent's PIN, explain that no parent has one yet, or nothing (children
 * can't open Settings). Without a usable household (an older backend, or a
 * household file from a newer release) only admins may open it, as in 1.1.0.
 */
export function settingsAccess(view: HouseholdView | null, isAdmin: boolean): SettingsAccess {
  if (!view || !view.available) return isAdmin ? 'open' : 'none';
  if (view.account.parent_level) return 'open';
  if (view.account.kind === 'shared' || view.account.kind === 'other') {
    return parentsWithPins(view.members).length > 0 ? 'pin' : 'no_pin';
  }
  return 'none';
}

export function calendarsOf(memberId: string, calendars: CalendarLink[]): CalendarLink[] {
  return calendars.filter(cal => cal.member_id === memberId);
}

/** A People row's summary, such as "Parent · PIN on · Alex's calendar" (spec 14.2). */
export function memberSummary(member: Member, calendars: CalendarLink[]): string {
  const parts = [member.parent ? 'Parent' : AGE_GROUP_LABELS[member.age_group]];
  if (member.has_pin) parts.push('PIN on');
  const own = calendarsOf(member.id, calendars);
  if (own.length === 0) parts.push('no calendar');
  else if (own.length === 1) parts.push(`${member.name}'s calendar`);
  else parts.push(`${own.length} calendars`);
  return parts.join(' · ');
}

/** Colors other people use, keyed in upper case. */
export function takenColors(members: Member[], exceptId?: string): Map<string, Member> {
  const taken = new Map<string, Member>();
  for (const m of members) {
    if (m.id !== exceptId) taken.set(m.color.toUpperCase(), m);
  }
  return taken;
}

/** The first palette color nobody uses, or null when every one is taken. */
export function nextFreeColor(members: Member[], palette: string[]): string | null {
  const taken = takenColors(members);
  return palette.find(color => !taken.has(color.toUpperCase())) ?? null;
}

/** What someone's picture shows. A photo needs their person's picture; otherwise the initial shows. */
export function pictureOf(
  member: Pick<Member, 'name' | 'picture' | 'person'>,
  personPicture: (entityId: string) => string | null,
): PictureView {
  const picture = member.picture as Record<string, unknown> | null;
  if (picture && typeof picture.emoji === 'string' && picture.emoji) {
    return { kind: 'emoji', text: picture.emoji };
  }
  if (picture && picture.person === true && member.person) {
    const url = personPicture(member.person);
    if (url) return { kind: 'photo', url };
  }
  return { kind: 'initial', text: initialOf(member.name) };
}
```

Create `src/core/layout.ts`:

```ts
/** The card's layout comes from its own size, not the device (spec 12.1). */
export type Layout = 'phone' | 'portrait' | 'landscape';

export interface Box {
  width: number;
  height: number;
}

export const PHONE_MAX_WIDTH = 600;
const SQUARE_LOW = 0.95;
const SQUARE_HIGH = 1.05;

/**
 * Phone below 600 px wide; otherwise portrait or landscape by shape. A
 * nearly square card (aspect 0.95 to 1.05) keeps its previous portrait or
 * landscape, landscape at first, so split screens don't flip. While a text
 * field has focus, a height-only shrink is the on-screen keyboard, and the
 * layout stays as it was.
 */
export function classifyLayout(
  box: Box,
  previous: Layout | null,
  previousBox: Box | null,
  textFocused: boolean,
): Layout {
  if (
    previous &&
    previousBox &&
    textFocused &&
    box.width === previousBox.width &&
    box.height < previousBox.height
  ) {
    return previous;
  }
  if (box.width < PHONE_MAX_WIDTH) return 'phone';
  const ratio = box.height > 0 ? box.width / box.height : Number.POSITIVE_INFINITY;
  if (ratio >= SQUARE_LOW && ratio <= SQUARE_HIGH) {
    return previous === 'portrait' || previous === 'landscape' ? previous : 'landscape';
  }
  return ratio > 1 ? 'landscape' : 'portrait';
}
```

Create `src/core/keypad.ts`:

```ts
/** The PIN keypad: which digit sits where, and what has been typed. */
export const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;
export const MIN_PIN = 4;
export const MAX_PIN = 6;

/** Digits in keypad order, or shuffled (Fisher-Yates) when Shuffle the keypad is on. */
export function keypadDigits(shuffle: boolean, random: () => number = Math.random): string[] {
  const digits: string[] = [...DIGITS];
  if (!shuffle) return digits;
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

export interface PinEntry {
  digits: string;
  /** How many digits to collect: the PIN's length, or 6 while choosing a new one. */
  length: number;
}

export function startEntry(length: number | null): PinEntry {
  return { digits: '', length: length ?? MAX_PIN };
}

export function pressDigit(entry: PinEntry, digit: string): PinEntry {
  if (!/^[0-9]$/.test(digit) || entry.digits.length >= entry.length) return entry;
  return { ...entry, digits: entry.digits + digit };
}

export function pressDelete(entry: PinEntry): PinEntry {
  return { ...entry, digits: entry.digits.slice(0, -1) };
}

/** Every digit of a known PIN is in, so it can be checked. */
export function isComplete(entry: PinEntry): boolean {
  return entry.digits.length === entry.length;
}

/** A new PIN can be finished from 4 digits. */
export function canFinishChoosing(entry: PinEntry): boolean {
  return entry.digits.length >= MIN_PIN;
}
```

Create `src/core/session.ts`:

```ts
/**
 * A parent-mode or member session on this card (spec 9.4). The backend
 * decides; the card mirrors the backend's clock, which restarts each time a
 * touch reaches it, so the countdown never promises time the backend
 * won't give.
 */
export const SESSION_IDLE_MS = 120_000;
export const TOUCH_EVERY_MS = 30_000;

export interface Session {
  token: string;
  memberId: string;
  parent: boolean;
  /** When the backend last heard from this card (ms). */
  lastTouch: number;
}

export function startSession(result: { session: string; member_id: string; parent: boolean }, now: number): Session {
  return { token: result.session, memberId: result.member_id, parent: result.parent, lastTouch: now };
}

export function remainingMs(session: Session, now: number): number {
  return Math.max(0, session.lastTouch + SESSION_IDLE_MS - now);
}

export function expired(session: Session, now: number): boolean {
  return remainingMs(session, now) === 0;
}

/** Someone touched the card: whether to tell the backend now (at most every 30 seconds). */
export function noteActivity(session: Session, now: number): { session: Session; touch: boolean } {
  if (now - session.lastTouch < TOUCH_EVERY_MS) return { session, touch: false };
  return { session: { ...session, lastTouch: now }, touch: true };
}
```

Create `src/core/reorder.ts`:

```ts
/** The list with the item at `from` moved to `to`; out-of-range moves change nothing. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const result = [...list];
  if (from < 0 || from >= result.length || to < 0 || to >= result.length || from === to) return result;
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/** The row a dragged pointer at `y` is over: the first whose middle is below it. */
export function rowIndexAt(y: number, rows: Array<{ top: number; height: number }>): number {
  if (rows.length === 0) return -1;
  const index = rows.findIndex(row => y < row.top + row.height / 2);
  return index >= 0 ? index : rows.length - 1;
}
```

Create `src/core/household-client.ts`:

```ts
import { HouseholdView, Member, MemberChanges } from './household';
import { safeUnsubscribe } from '../utils/weather-subscription';

type Unsubscribe = () => void | Promise<void>;

/** The part of hass.connection the subscription uses. */
export interface HouseholdConnection {
  subscribeMessage(
    callback: (view: HouseholdView) => void,
    message: Record<string, unknown>,
  ): Promise<Unsubscribe>;
}

/**
 * Follows planavista/household/subscribe with at most one live subscription.
 * A subscribe that resolves after stop() is dropped at once. When the backend
 * has no household (an older PlanaVista), the view is null.
 */
export class HouseholdSubscription {
  private _connection: HouseholdConnection | undefined;
  private _unsub: Unsubscribe | null = null;
  private _generation = 0;

  constructor(private readonly _onView: (view: HouseholdView | null) => void) {}

  update(connection: HouseholdConnection | undefined): void {
    if (connection === this._connection) return;
    this.stop();
    this._connection = connection;
    if (!connection) return;
    const generation = this._generation;
    connection
      .subscribeMessage(
        view => {
          if (generation === this._generation) this._onView(view);
        },
        { type: 'planavista/household/subscribe' },
      )
      .then(unsub => {
        if (generation !== this._generation) {
          safeUnsubscribe(unsub);
          return;
        }
        this._unsub = unsub;
      })
      .catch(() => {
        if (generation === this._generation) this._onView(null);
      });
  }

  stop(): void {
    this._generation++;
    this._connection = undefined;
    if (this._unsub) {
      const unsub = this._unsub;
      this._unsub = null;
      safeUnsubscribe(unsub);
    }
  }
}

/** The part of hass the commands use. */
export interface WsCaller {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
}

export interface UnlockResult {
  ok: boolean;
  session?: string;
  member_id?: string;
  parent?: boolean;
  expires_in?: number;
  reason?: 'no_pin' | 'wrong_pin' | 'paused';
  tries_left?: number;
  retry_after?: number | null;
}

/** The household and PIN commands, with this card's session token added when it has one. */
export class HouseholdApi {
  constructor(
    private readonly _ws: WsCaller,
    private readonly _session: () => string | null,
  ) {}

  private _call<T>(type: string, fields: Record<string, unknown>, withSession = true): Promise<T> {
    const message: Record<string, unknown> = { type, ...fields };
    const token = withSession ? this._session() : null;
    if (token) message.session = token;
    return this._ws.callWS<T>(message);
  }

  saveMember(changes: MemberChanges, existing?: { id: string; rev: number }): Promise<{ member: Member }> {
    const fields: Record<string, unknown> = { member: changes };
    if (existing) Object.assign(fields, { member_id: existing.id, rev: existing.rev });
    return this._call('planavista/household/member/save', fields);
  }

  deleteMember(memberId: string): Promise<void> {
    return this._call('planavista/household/member/delete', { member_id: memberId });
  }

  reorder(order: string[]): Promise<void> {
    return this._call('planavista/household/member/reorder', { order });
  }

  setSharedScreen(shared: boolean): Promise<void> {
    return this._call('planavista/household/shared_screen', { shared });
  }

  saveSecurity(settings: { shuffle_keypad: boolean }): Promise<void> {
    return this._call('planavista/household/settings/save', settings);
  }

  saveSetup(progress: { step?: string | null; completed?: boolean }): Promise<void> {
    return this._call('planavista/household/setup/save', progress);
  }

  saveConfig(changes: Record<string, unknown>): Promise<void> {
    return this._call('planavista/config/save', changes);
  }

  unlock(memberId: string, pin: string): Promise<UnlockResult> {
    return this._call('planavista/pin/unlock', { member_id: memberId, pin }, false);
  }

  setPin(memberId: string, pin: string): Promise<void> {
    return this._call('planavista/pin/set', { member_id: memberId, pin });
  }

  clearPin(memberId: string): Promise<void> {
    return this._call('planavista/pin/clear', { member_id: memberId });
  }

  clearPause(memberId: string): Promise<void> {
    return this._call('planavista/pin/clear_lockout', { member_id: memberId });
  }

  lock(token: string): Promise<void> {
    return this._call('planavista/pin/lock', { session: token }, false);
  }

  touch(token: string): Promise<{ expires_in: number }> {
    return this._call('planavista/pin/touch', { session: token }, false);
  }
}

/** The code of a failed command (Home Assistant rejects with {code, message}). */
export function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && typeof (err as { code?: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return 'unknown';
}
```

Create `src/modules/calendar/calendar-rows.ts`:

```ts
import { Member } from '../../core/household';

export interface Preset {
  color: string;
  light: string;
}

/** A calendar on the Calendars page: a saved row, or one Home Assistant offers. */
export interface CalendarRow {
  /** The saved row with every key it had (minus what the sensor adds), or null. */
  saved: Record<string, unknown> | null;
  entity_id: string;
  display_name: string;
  color: string;
  color_light: string;
  person_entity: string;
  member_id: string | null;
  include: boolean;
}

/** Keys the sensor adds to each row that aren't settings. */
const SENSOR_ONLY = new Set(['state', 'attributes']);

/** Saved calendars in their order, then Home Assistant's other calendars, sorted and left out. */
export function buildCalendarRows(
  saved: Array<Record<string, any>>,
  entityIds: string[],
  friendlyName: (entityId: string) => string | undefined,
  presets: Preset[],
): CalendarRow[] {
  const rows: CalendarRow[] = [];
  const seen = new Set<string>();
  for (const cal of saved) {
    const preset = presets[rows.length % presets.length];
    seen.add(cal.entity_id);
    rows.push({
      saved: Object.fromEntries(Object.entries(cal).filter(([key]) => !SENSOR_ONLY.has(key))),
      entity_id: cal.entity_id,
      display_name: cal.display_name || cal.entity_id,
      color: cal.color || preset.color,
      color_light: cal.color_light || preset.light,
      person_entity: cal.person_entity || '',
      member_id: cal.member_id ?? null,
      include: true,
    });
  }
  for (const entityId of entityIds.filter(id => !seen.has(id)).sort()) {
    const preset = presets[rows.length % presets.length];
    rows.push({
      saved: null,
      entity_id: entityId,
      display_name: friendlyName(entityId) || entityId,
      color: preset.color,
      color_light: preset.light,
      person_entity: '',
      member_id: null,
      include: false,
    });
  }
  return rows;
}

/** The calendars to save: included rows in order, each keeping every key it had. */
export function toSavedCalendars(rows: CalendarRow[]): Array<Record<string, unknown>> {
  return rows
    .filter(row => row.include)
    .map(row => ({
      icon: 'mdi:calendar',
      visible: true,
      ...(row.saved ?? {}),
      entity_id: row.entity_id,
      display_name: row.display_name,
      color: row.color,
      color_light: row.color_light,
      person_entity: row.person_entity,
      member_id: row.member_id,
    }));
}

/**
 * Who a calendar belongs to. A calendar linked to a person whose member
 * exists belongs to that member (and the choice is fixed); otherwise it is
 * the calendar's own choice, while that member exists.
 */
export function belongsTo(
  row: Pick<CalendarRow, 'person_entity' | 'member_id'>,
  members: Array<Pick<Member, 'id' | 'person'>>,
): { memberId: string | null; viaPerson: boolean } {
  if (row.person_entity) {
    const member = members.find(m => m.person === row.person_entity);
    if (member) return { memberId: member.id, viaPerson: true };
  }
  const chosen = members.some(m => m.id === row.member_id) ? row.member_id : null;
  return { memberId: chosen, viaPerson: false };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; every test passes (149 before this milestone, plus 13 + 5 + 4 + 3 + 2 + 5 + 3 here: `184 passed`).

- [ ] **Step 5: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/household.ts src/core/layout.ts src/core/keypad.ts src/core/session.ts src/core/reorder.ts src/core/household-client.ts src/modules/calendar/calendar-rows.ts src/utils/weather-subscription.ts test/household.test.ts test/layout.test.ts test/keypad.test.ts test/session.test.ts test/reorder.test.ts test/household-client.test.ts test/calendar-rows.test.ts
git commit -F - <<'EOF'
feat(frontend): add the card's household, layout, keypad, and session logic

Pure functions the new screens build on: who may open Settings, People
summaries, the size classifier with its dead band and keyboard rule, the
PIN keypad, the session countdown, the household subscription and
commands, and calendar rows that keep every saved key.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 8: Registries for Settings pages and setup steps

**Files:**
- Modify: `src/core/page-registry.ts` (the registry takes a page type)
- Create: `src/core/settings-registry.ts`
- Modify: `src/shell/definition.ts`, `src/modules/calendar/definition.ts`, `src/modules/calendar/index.ts`, `src/shell/planavista-card.ts` (register the new pages)
- Test: `test/settings-registry.test.ts`, `test/calendar-definition.test.ts` (extended)

**Interfaces:**
- Consumes: Task 7's `HouseholdView`, `PlanaVistaData` (types.ts).
- Produces (in `core/settings-registry.ts`): `SettingsContext { household: HouseholdView | null; data: PlanaVistaData }`, `SettingsGroup { id, label: string | null, order }`, `SETTINGS_GROUPS`, `SettingsPage extends WizardPage<SettingsContext> { group: string; tag: string; summary?(ctx): string }`, `groupPages(pages, groups?)`, `SetupContext { household: HouseholdView | null; data: PlanaVistaData }`, `SetupStep extends WizardPage<SetupContext> { tag: string }`, `resumeIndex(steps, saved)`, `settingsRegistry`, `setupRegistry`.
- Produces: `shellSettingsPages`, `shellSetupSteps`, `registerShellSettings(settings?, setup?)` (shell/definition.ts); `calendarSettingsPages`, `calendarSetupSteps`, `registerCalendarSettings(settings?, setup?)` (calendar/definition.ts).
- Page and step ids and elements (Tasks 9 to 12 build the elements):

| Registry | id | label | group | order | tag |
|---|---|---|---|---|---|
| settings | `people` | People | people | 100 | `pv-settings-people` |
| settings | `calendars` | Calendars | calendar | 300 | `pv-calendar-calendars-page` |
| settings | `calendar-options` | Calendar options | calendar | 310 | `pv-calendar-options-page` |
| settings | `appearance` | Appearance | appearance | 400 | `pv-settings-appearance` |
| settings | `pins` | PINs and parent mode | security | 500 | `pv-settings-pins` |
| settings | `about` | About PlanaVista | about | 900 | `pv-settings-about` |
| setup | `welcome` | Welcome | | 0 | `pv-setup-welcome` |
| setup | `people` | Who lives here? | | 100 | `pv-setup-people` |
| setup | `calendars` | Calendars | | 200 | `pv-calendar-calendars-page` |
| setup | `look` | Look | | 900 | `pv-setup-look` |
| setup | `done` | Done | | 1000 | `pv-setup-done` |

- The old `setupSteps` and `settingsPages` keep serving the old wizard until Task 12 removes both.

- [ ] **Step 1: Write the failing tests**

Create `test/settings-registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import {
  SETTINGS_GROUPS,
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  groupPages,
  resumeIndex,
} from '../src/core/settings-registry';
import { registerShellSettings } from '../src/shell/definition';
import { registerCalendarSettings } from '../src/modules/calendar/definition';
import { HouseholdView } from '../src/core/household';
import { PlanaVistaData } from '../src/types';
import { version } from '../package.json';

function context(overrides: Partial<HouseholdView> = {}): SettingsContext {
  const household = {
    available: true,
    members: [{ id: 'alex', parent: true, has_pin: true }, { id: 'dana', parent: false, has_pin: false }],
    account: { kind: 'shared', shared: true, parent_level: false },
    security: { shuffle_keypad: false, shared_screens: 1 },
    modules: {},
    setup: { completed: true, step: null },
    ...overrides,
  } as unknown as HouseholdView;
  const data = {
    calendars: [{ entity_id: 'calendar.test_alex' }, { entity_id: 'calendar.test_blair' }],
    events: [],
    display: { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'dark' },
  } as unknown as PlanaVistaData;
  return { household, data };
}

function registries() {
  const settings = new PageRegistry<SettingsContext, SettingsPage>();
  const setup = new PageRegistry<SetupContext, SetupStep>();
  registerShellSettings(settings, setup);
  registerCalendarSettings(settings, setup);
  return { settings, setup };
}

describe('settings registry', () => {
  it('groups the sidebar in the spec order and drops empty groups', () => {
    const { settings } = registries();
    const groups = groupPages(settings.pages(context()));
    expect(groups.map(g => [g.group.id, g.group.label, g.pages.map(p => p.id)])).toEqual([
      ['people', null, ['people']],
      ['calendar', 'Calendar', ['calendars', 'calendar-options']],
      ['appearance', null, ['appearance']],
      ['security', null, ['pins']],
      ['about', null, ['about']],
    ]);
  });

  it('puts pages of an unknown group at the end', () => {
    const page: SettingsPage = { id: 'lists', label: 'Lists', group: 'lists', order: 1, tag: 'pv-x' };
    const groups = groupPages([page], SETTINGS_GROUPS);
    expect(groups).toEqual([{ group: { id: 'lists', label: null, order: 1000 }, pages: [page] }]);
  });

  it('says what each row is set to', () => {
    const { settings } = registries();
    const ctx = context();
    const summaries = Object.fromEntries(settings.pages(ctx).map(p => [p.id, p.summary?.(ctx)]));
    expect(summaries).toEqual({
      people: '2 people',
      calendars: '2 calendars',
      'calendar-options': 'Week · 12-hour',
      appearance: 'Deep Dark',
      pins: 'Shared screen · 1 PIN',
      about: `Version ${version}`,
    });
    const quiet = context({
      members: [],
      account: { kind: 'admin', shared: false, parent_level: true } as unknown as HouseholdView['account'],
    });
    expect(settings.pages(quiet).find(p => p.id === 'people')?.summary?.(quiet)).toBe('No one yet');
    expect(settings.pages(quiet).find(p => p.id === 'pins')?.summary?.(quiet)).toBe('Not a shared screen');
  });

  it('lists the setup steps in order and resumes where setup stopped', () => {
    const { setup } = registries();
    const steps = setup.pages(context());
    expect(steps.map(s => [s.id, s.tag])).toEqual([
      ['welcome', 'pv-setup-welcome'],
      ['people', 'pv-setup-people'],
      ['calendars', 'pv-calendar-calendars-page'],
      ['look', 'pv-setup-look'],
      ['done', 'pv-setup-done'],
    ]);
    expect(resumeIndex(steps, 'calendars')).toBe(2);
    expect(resumeIndex(steps, 'chores')).toBe(0);
    expect(resumeIndex(steps, null)).toBe(0);
  });
});
```

Append to `test/calendar-definition.test.ts`:

```ts
import { calendarSettingsPages, calendarSetupSteps } from '../src/modules/calendar/definition';

describe('calendar settings pages', () => {
  it('adds Calendars and Calendar options to Settings, and Calendars to setup', () => {
    expect(calendarSettingsPages.map(p => [p.id, p.group, p.tag])).toEqual([
      ['calendars', 'calendar', 'pv-calendar-calendars-page'],
      ['calendar-options', 'calendar', 'pv-calendar-options-page'],
    ]);
    expect(calendarSetupSteps.map(s => s.id)).toEqual(['calendars']);
  });
});
```

(If `describe` and `expect` aren't imported in that file yet, add them to its `vitest` import.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- settings-registry calendar-definition`
Expected: `Failed to resolve import "../src/core/settings-registry"`.

- [ ] **Step 3: Let the registry take a page type**

In `src/core/page-registry.ts`, change the class line and its two signatures:

```ts
/** An ordered list of pages that modules contribute. Registering an id again replaces it. */
export class PageRegistry<C, P extends WizardPage<C> = WizardPage<C>> {
  private readonly _pages = new Map<string, P>();

  register(page: P): void {
    this._pages.set(page.id, page);
  }

  pages(ctx: C): P[] {
    return [...this._pages.values()]
      .filter(page => !page.applies || page.applies(ctx))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  }
}
```

- [ ] **Step 4: Create `src/core/settings-registry.ts`**

```ts
import { HouseholdView } from './household';
import { PageRegistry, WizardPage } from './page-registry';
import { PlanaVistaData } from '../types';

/** What Settings knows when it decides which pages apply and what their rows say. */
export interface SettingsContext {
  household: HouseholdView | null;
  data: PlanaVistaData;
}

export interface SettingsGroup {
  id: string;
  /** A heading over the group's rows; null for a group that is a single row. */
  label: string | null;
  order: number;
}

/** The sidebar's groups in order (spec 14.1). Chores and data rows arrive with chores. */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'people', label: null, order: 100 },
  { id: 'chores', label: 'Chores', order: 200 },
  { id: 'calendar', label: 'Calendar', order: 300 },
  { id: 'appearance', label: null, order: 400 },
  { id: 'security', label: null, order: 500 },
  { id: 'data', label: null, order: 600 },
  { id: 'about', label: null, order: 900 },
];

export interface SettingsPage extends WizardPage<SettingsContext> {
  group: string;
  /** The element that renders the page. */
  tag: string;
  /** The row's current value, such as "4 people". */
  summary?: (ctx: SettingsContext) => string;
}

/** Pages under their groups, in order; a page of an unknown group gets a group of its own at the end. */
export function groupPages(
  pages: SettingsPage[],
  groups: SettingsGroup[] = SETTINGS_GROUPS,
): Array<{ group: SettingsGroup; pages: SettingsPage[] }> {
  const known = new Set(groups.map(g => g.id));
  const extra = [...new Set(pages.map(p => p.group).filter(id => !known.has(id)))]
    .map(id => ({ id, label: null, order: 1000 }));
  return [...groups, ...extra]
    .sort((a, b) => a.order - b.order)
    .map(group => ({ group, pages: pages.filter(p => p.group === group.id) }))
    .filter(entry => entry.pages.length > 0);
}

/** What setup knows when it decides which steps apply. */
export interface SetupContext {
  household: HouseholdView | null;
  data: PlanaVistaData;
}

export interface SetupStep extends WizardPage<SetupContext> {
  /** The element that renders the step. */
  tag: string;
}

/** Where setup starts: the saved step while it still applies, else the first. */
export function resumeIndex(steps: SetupStep[], saved: string | null): number {
  const index = saved ? steps.findIndex(step => step.id === saved) : -1;
  return index >= 0 ? index : 0;
}

/** Settings pages that the shell and modules contribute. */
export const settingsRegistry = new PageRegistry<SettingsContext, SettingsPage>();

/** First-run setup steps that the shell and modules contribute. */
export const setupRegistry = new PageRegistry<SetupContext, SetupStep>();
```

- [ ] **Step 5: Register the shell's and the calendar's pages**

In `src/shell/definition.ts`, add these imports at the top (the file already imports `PageRegistry`):

```ts
import { version } from '../../package.json';
import {
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  settingsRegistry,
  setupRegistry,
} from '../core/settings-registry';
```

and append:

```ts
/** The theme names Settings shows (keys as display.theme saves them). */
const THEME_NAMES: Record<string, string> = {
  planavista: 'Clean Light',
  light: 'Clean Light',
  dark: 'Deep Dark',
  minimal: 'Minimal',
  modern: 'Vibrant',
  vibrant: 'Vibrant',
};

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** The shell's Settings pages. */
export const shellSettingsPages: SettingsPage[] = [
  {
    id: 'people',
    label: 'People',
    group: 'people',
    order: 100,
    tag: 'pv-settings-people',
    summary: ({ household }) => {
      const n = household?.members.length ?? 0;
      return n === 0 ? 'No one yet' : count(n, 'person', 'people');
    },
  },
  {
    id: 'appearance',
    label: 'Appearance',
    group: 'appearance',
    order: 400,
    tag: 'pv-settings-appearance',
    summary: ({ data }) => THEME_NAMES[data.display?.theme ?? 'light'] ?? 'Clean Light',
  },
  {
    id: 'pins',
    label: 'PINs and parent mode',
    group: 'security',
    order: 500,
    tag: 'pv-settings-pins',
    summary: ({ household }) => {
      const pins = household?.members.filter(m => m.has_pin).length ?? 0;
      const screen = household?.account.shared ? 'Shared screen' : 'Not a shared screen';
      return pins > 0 ? `${screen} · ${count(pins, 'PIN', 'PINs')}` : screen;
    },
  },
  {
    id: 'about',
    label: 'About PlanaVista',
    group: 'about',
    order: 900,
    tag: 'pv-settings-about',
    summary: () => `Version ${version}`,
  },
];

/** The shell's setup steps; modules add theirs between them (spec 14.7). */
export const shellSetupSteps: SetupStep[] = [
  { id: 'welcome', label: 'Welcome', order: 0, tag: 'pv-setup-welcome' },
  { id: 'people', label: 'Who lives here?', order: 100, tag: 'pv-setup-people' },
  { id: 'look', label: 'Look', order: 900, tag: 'pv-setup-look' },
  { id: 'done', label: 'Done', order: 1000, tag: 'pv-setup-done' },
];

/** Add the shell's Settings pages and setup steps. */
export function registerShellSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
): void {
  for (const page of shellSettingsPages) settings.register(page);
  for (const step of shellSetupSteps) setup.register(step);
}
```

Append to `src/modules/calendar/definition.ts`:

```ts
import {
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  settingsRegistry,
  setupRegistry,
} from '../../core/settings-registry';

const VIEW_NAMES: Record<string, string> = { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' };

/** The calendar's Settings pages (spec 14.5: Calendars with Belongs to, and Calendar options). */
export const calendarSettingsPages: SettingsPage[] = [
  {
    id: 'calendars',
    label: 'Calendars',
    group: 'calendar',
    order: 300,
    tag: 'pv-calendar-calendars-page',
    summary: ({ data }) => {
      const n = data.calendars?.length ?? 0;
      return n === 0 ? 'None yet' : `${n} ${n === 1 ? 'calendar' : 'calendars'}`;
    },
  },
  {
    id: 'calendar-options',
    label: 'Calendar options',
    group: 'calendar',
    order: 310,
    tag: 'pv-calendar-options-page',
    summary: ({ data }) =>
      `${VIEW_NAMES[data.display?.default_view ?? 'week'] ?? 'Week'} · ${data.display?.time_format === '24h' ? '24-hour' : '12-hour'}`,
  },
];

/** The calendar's setup step. */
export const calendarSetupSteps: SetupStep[] = [
  { id: 'calendars', label: 'Calendars', order: 200, tag: 'pv-calendar-calendars-page' },
];

/** Add the calendar's Settings pages and setup step. */
export function registerCalendarSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
): void {
  for (const page of calendarSettingsPages) settings.register(page);
  for (const step of calendarSetupSteps) setup.register(step);
}
```

In `src/modules/calendar/index.ts`, import `registerCalendarSettings` alongside `registerCalendarModule` and call it after `registerCalendarModule()`. In `src/shell/planavista-card.ts`, import `registerShellSettings` from `./definition` and call it after `registerShellPages()`.

- [ ] **Step 6: Run the checks**

Run: `npx tsc --noEmit -p . && npm test`
Expected: no type errors; `189 passed` (184 plus 4 + 1).

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/page-registry.ts src/core/settings-registry.ts src/shell/definition.ts src/modules/calendar/definition.ts src/modules/calendar/index.ts src/shell/planavista-card.ts test/settings-registry.test.ts test/calendar-definition.test.ts
git commit -F - <<'EOF'
feat(frontend): register Settings pages and setup steps with their elements

Settings pages belong to sidebar groups and say what they are set to;
setup steps resume where setup stopped. The shell contributes People,
Appearance, PINs and parent mode, About, and the setup frame; the
calendar contributes Calendars and Calendar options.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---
### Task 9: Calendar pages and the theme picker, in their own elements

Frontend commands run in `custom_components/planavista/frontend`. The old wizard keeps its copies until Task 12.

**Files:**
- Create: `src/core/page-host.ts`, `test/page-host.test.ts`
- Create: `src/styles/settings.ts` (styles the new pages share)
- Create: `src/modules/calendar/settings/options-page.ts` (`pv-calendar-options-page`)
- Create: `src/modules/calendar/settings/calendars-page.ts` (`pv-calendar-calendars-page`)
- Create: `src/shell/settings/theme-picker.ts` (`pv-theme-picker`)
- Modify: `src/modules/calendar/index.ts` (import the two pages), `src/shell/planavista-card.ts` (import the theme picker)
- Scratch (not committed): `<scratchpad>/m2-split/split_wizard.py`

**Interfaces:**
- Produces (in `core/page-host.ts`): `PageProps { hass; data: PlanaVistaData; household: HouseholdView | null; api: HouseholdApi; layout: Layout; mode: 'settings' | 'setup' }`; event names `PUSH_PAGE = 'pv-push-page'` (detail `PushPageDetail { tag; title; back; props? }`), `POP_PAGE = 'pv-pop-page'`, `PAGE_ERROR = 'pv-page-error'` (detail `{ message: string }`); `saveErrorMessage(code: string) -> string`.
- Every page and step element takes the `PageProps` as properties (`.hass`, `.data`, `.household`, `.api`, `.layout`, `.mode`) and may implement `confirmLeave(): Promise<boolean>` (Settings asks before leaving it) and, as a setup step, `primaryLabel: string` and `commit(): Promise<boolean>`.
- `pv-theme-picker` fires the existing `theme-preview` event (`{ theme, overrides }`, bubbles, composed) on every change, then saves.

- [ ] **Step 1: Write the failing test for the error words**

Create `test/page-host.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { saveErrorMessage } from '../src/core/page-host';

describe('saveErrorMessage', () => {
  it('says what happened and what to do', () => {
    expect(saveErrorMessage('parent_mode_required')).toBe("Parent mode ended. Enter a parent's PIN to keep changing settings.");
    expect(saveErrorMessage('not_allowed')).toBe('Only a parent can change this.');
    expect(saveErrorMessage('unavailable')).toBe('Update PlanaVista to change people and PINs.');
    expect(saveErrorMessage('anything else')).toBe("Couldn't save. Check the connection and try again.");
  });
});
```

Run: `npm test -- page-host`. Expected: `Failed to resolve import "../src/core/page-host"`.

- [ ] **Step 2: Create `src/core/page-host.ts`**

```ts
import type { HomeAssistant } from 'custom-card-helpers';
import type { HouseholdView } from './household';
import type { HouseholdApi } from './household-client';
import type { Layout } from './layout';
import type { PlanaVistaData } from '../types';

/** What every Settings page and setup step receives from its host. */
export interface PageProps {
  hass: HomeAssistant;
  data: PlanaVistaData;
  household: HouseholdView | null;
  api: HouseholdApi;
  layout: Layout;
  mode: 'settings' | 'setup';
}

/** A page asks its host to show another page on top (People opens a person). */
export const PUSH_PAGE = 'pv-push-page';
export interface PushPageDetail {
  tag: string;
  title: string;
  /** The back control's label: the page it returns to ("People"). */
  back: string;
  props?: Record<string, unknown>;
}

/** A page asks to go back (a person page after Save, Cancel, or Remove). */
export const POP_PAGE = 'pv-pop-page';

/** A page reports a failed save; the host shows the message. */
export const PAGE_ERROR = 'pv-page-error';

/** Words for a failed save (spec 11.7: what happened and what to do). */
export function saveErrorMessage(code: string): string {
  switch (code) {
    case 'parent_mode_required':
      return "Parent mode ended. Enter a parent's PIN to keep changing settings.";
    case 'not_allowed':
      return 'Only a parent can change this.';
    case 'unavailable':
      return 'Update PlanaVista to change people and PINs.';
    default:
      return "Couldn't save. Check the connection and try again.";
  }
}
```

Run: `npm test -- page-host`. Expected: `1 passed`.

- [ ] **Step 3: Write the split script and run it**

Create `<scratchpad>/m2-split/split_wizard.py`. It reads `src/shell/onboarding-wizard.ts` and prints, for a page, the wizard's methods by name (verbatim, from the method line to the closing `  }` at two-space indentation) and the CSS rules whose selectors use only that page's classes (verbatim, `@media` blocks rebuilt around the rules they keep). Rules used by two or more of the three pages go to a `shared` output. Every rule must land somewhere; the script lists any that don't.

```python
"""Copy the wizard's pages out verbatim: methods by name, CSS rules by the classes they use."""
from __future__ import annotations

import re
import sys
from pathlib import Path

WIZARD = Path(sys.argv[1])
SOURCE = WIZARD.read_text(encoding="utf-8")

PAGES = {
    "options": ["_weatherEntities", "_entityLabel", "_toggleLocationAutocomplete", "_renderPreferences"],
    "calendars": [
        "_initCalendars", "_personEntities", "_personLabel", "_entityLabel", "_updateCalendar",
        "_onCalendarColorChange", "_renderCalendars", "_onDragStart", "_onDragOver",
        "_onDragLeave", "_onDrop", "_onDragEnd", "_renderCalendarRow",
    ],
    "theme": ["_dispatchThemePreview", "_setOverride", "_resetOverrides", "_renderCustomize", "_renderTheme"],
    "frame": ["_renderProgressDots", "render"],
}
CLASS_TOKEN = re.compile(r"[a-z][a-z0-9]*(?:-{1,2}[a-z0-9]+)*")


def method(name: str) -> str:
    pattern = re.compile(rf"^  (?:private |protected |public )?(?:async )?(?:get )?{re.escape(name)}\(", re.M)
    match = pattern.search(SOURCE)
    if not match:
        raise SystemExit(f"method {name} not found")
    end = SOURCE.index("\n  }\n", match.start()) + len("\n  }\n")
    return SOURCE[match.start():end]


def classes_in(code: str) -> set[str]:
    found: set[str] = set()
    for attr in re.findall(r'class="([^"]*)"', code):
        found.update(CLASS_TOKEN.findall(attr))
    return found


def css_block() -> str:
    start = SOURCE.index("css`", SOURCE.index("static styles")) + len("css`")
    return SOURCE[start:SOURCE.index("`", start)]


def parse(css: str) -> list[tuple[str | None, str, str]]:
    """(media or None, selector, full rule text) for every rule, keeping comments with the next rule."""
    rules: list[tuple[str | None, str, str]] = []
    i = 0
    pending = ""
    while i < len(css):
        if css.startswith("/*", i):
            end = css.index("*/", i) + 2
            pending += css[i:end] + "\n"
            i = end
            continue
        if css[i].isspace():
            i += 1
            continue
        brace = css.index("{", i)
        head = css[i:brace].strip()
        depth, j = 1, brace + 1
        while depth:
            depth += {"{": 1, "}": -1}.get(css[j], 0)
            j += 1
        body = css[brace + 1:j - 1]
        if head.startswith("@media"):
            for _, selector, text in parse(body):
                rules.append((head, selector, text))
        else:
            rules.append((None, head, (pending + css[i:j]).strip()))
        pending = ""
        i = j
    return rules


def owner(selector: str, page_classes: dict[str, set[str]]) -> list[str]:
    if selector.startswith("@keyframes") or selector.startswith(":host"):
        return ["frame"]
    used = set(re.findall(r"\.([a-zA-Z0-9_-]+)", selector))
    return [page for page, classes in page_classes.items() if used and used <= classes]


def main() -> None:
    page_classes = {page: set().union(*(classes_in(method(m)) for m in names)) for page, names in PAGES.items()}
    out: dict[str, list[tuple[str | None, str]]] = {page: [] for page in [*PAGES, "shared", "dropped"]}
    for media, selector, text in parse(css_block()):
        owners = owner(selector, page_classes)
        target = owners[0] if len(owners) == 1 else ("shared" if owners else "dropped")
        out[target].append((media, text))
    wanted = sys.argv[2]
    if wanted == "methods":
        print("\n".join(method(m) for m in PAGES[sys.argv[3]]))
        return
    current: str | None = None
    for media, text in out[wanted]:
        if media != current:
            if current:
                print("}")
            if media:
                print(media + " {")
            current = media
        print(text)
    if current:
        print("}")
    print(f"/* {wanted}: {len(out[wanted])} rules; dropped overall: {len(out['dropped'])} */", file=sys.stderr)


main()
```

Run, from the frontend folder:

```bash
S="<scratchpad>/m2-split"
for page in options calendars theme frame shared dropped; do
  python "$S/split_wizard.py" src/shell/onboarding-wizard.ts "$page" > "$S/$page.css"
done
for page in options calendars theme frame; do
  python "$S/split_wizard.py" src/shell/onboarding-wizard.ts methods "$page" > "$S/$page.methods.ts"
done
```

Expected: every rule lands in options, calendars, theme, frame, or shared. `dropped.css` holds only the `.settings-tab*` rules (Settings tabs go away) and nothing else; if anything else is there, assign it by hand and note it in the ledger. Keep the files: Task 12 uses `frame.css` and `frame.methods.ts`.

- [ ] **Step 4: Create the shared page styles**

Create `src/styles/settings.ts` exporting `settingsPageStyles` (a `css` block) with the rules from `shared.css`, plus the `.page-content`, `.page-title`, and `.page-subtitle` rules if the script put them elsewhere. The hosts render the page title, so pages don't use `.page-title` themselves; keep the rule for the setup host.

- [ ] **Step 5: Create the three elements**

Each element:
- extends `LitElement`, declares the `PageProps` as `@property({ attribute: false })` (and `mode` as a string property), and registers through `defineElement` at the bottom of its file;
- uses `static styles = [baseStyles, buttonStyles, formStyles, settingsPageStyles, css`<its rules from the script, verbatim>`]`;
- moves the listed wizard methods verbatim, then makes only the edits below;
- reports a failed save with `this.dispatchEvent(new CustomEvent(PAGE_ERROR, { detail: { message: saveErrorMessage(errorCode(err)) }, bubbles: true, composed: true }))`.

`pv-calendar-options-page` (`src/modules/calendar/settings/options-page.ts`), from `options.methods.ts`:
- State: `@state() private _draft: DisplayConfig`, set from `this.data.display` the first time `data` arrives (later sensor updates don't overwrite what's on screen).
- Replace each `this._timeFormat = x` (and the same for first day, weather entity, default view, address suggestions) with `this._apply({ time_format: x })` and so on, where `_apply(change)` sets `_draft = { ..._draft, ...change }` and calls `this.api.saveConfig({ display: { ...this.data.display, ...this._draft } })`.
- Drop the page's own `<h2 class="page-title">` and subtitle (the host shows the title). Keep every other line of markup and copy as it is.

`pv-calendar-calendars-page` (`src/modules/calendar/settings/calendars-page.ts`), from `calendars.methods.ts`:
- Rows come from `buildCalendarRows(this.data.calendars, <calendar.* entity ids in hass.states>, id => friendly name, PvColorSwatchPicker.PRESETS)` once, when `hass` and `data` first arrive. Replace the wizard's `_calendarConfigs` with `_rows: CalendarRow[]`.
- `_updateCalendar(idx, patch)` updates `_rows` and calls `_save()`, which sends `this.api.saveConfig({ calendars: toSavedCalendars(this._rows) })`. The display-name field keeps `@input` updating the row without saving, and gets `@change` to save (on blur or Enter). Drag and drop saves on drop.
- Each included row gains a **Belongs to** field after "Link to Person": a `<select>` with "Nobody" and every member (`inOrder(this.household.members)`), showing `belongsTo(row, members).memberId`. When `viaPerson` is true the select is disabled and a hint under it reads "Through {person name}'s Home Assistant person." Choosing a member sets `member_id`. Without a usable household (`!this.household?.available`) the field is hidden.
- Changing "Link to Person" sets `person_entity` and saves; the backend adds that person to the household when needed, and the next household view shows it.
- In `mode === 'setup'` the page shows the same list; it has no `commit` (it saves as you tap).
- Keep the empty state ("No calendar entities found in Home Assistant." and its hint) and drop the wizard's `<h2>`/subtitle as above.

`pv-theme-picker` (`src/shell/settings/theme-picker.ts`), from `theme.methods.ts`:
- State `_theme` and `_themeOverrides` come from `this.data.display` the first time it arrives, with the wizard's `_initFromConfig` mapping (`display.theme || 'light'`, overrides copied, `_customizeOpen` when overrides exist).
- `_dispatchThemePreview()` stays as it is and is followed by `_queueSave()`: a 400 ms timer (restarted on each change) that sends `this.api.saveConfig({ display: { ...this.data.display, theme: this._theme, theme_overrides: <the overrides, or undefined when empty> } })`. `disconnectedCallback` sends a pending save at once.
- Drop the wizard's `<h2>`/subtitle as above.

Then add `import './settings/options-page';` and `import './settings/calendars-page';` to `src/modules/calendar/index.ts`, and `import './settings/theme-picker';` to `src/shell/planavista-card.ts`.

- [ ] **Step 6: Run the checks**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `190 passed`; the build succeeds. Discard the build output (`git checkout -- dist/`): the bundle is committed in Task 13.

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/page-host.ts test/page-host.test.ts src/styles/settings.ts src/modules/calendar/settings src/shell/settings/theme-picker.ts src/modules/calendar/index.ts src/shell/planavista-card.ts
git commit -F - <<'EOF'
feat(frontend): give Calendars, Calendar options, and themes their own pages

The three setup pages become elements that Settings and setup can both
show. They save as you tap, keep every key a calendar row had, and add
Belongs to, so each calendar can belong to someone in the household.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 10: The household on the card: PIN sheet, parent mode, and the gear

**Files:**
- Create: `src/core/focus.ts`, `test/focus.test.ts`
- Create: `src/shell/household-controller.ts`, `src/shell/session-controller.ts`, `src/shell/layout-controller.ts`
- Create: `src/core/pv-member-avatar.ts`, `src/core/pv-session-ring.ts`
- Create: `src/shell/pv-parent-strip.ts`, `src/shell/pv-pin-sheet.ts`, `src/shell/pv-notice-sheet.ts`, `src/styles/sheet.ts`
- Modify: `src/shell/planavista-card.ts`, `src/shell/onboarding-wizard.ts` (save through `planavista/config/save`)

**Interfaces:**
- Consumes: Task 7's household logic, `HouseholdSubscription`, `HouseholdApi`, `classifyLayout`, `keypadDigits`, the session functions.
- Produces:
  - `core/focus.ts`: `FOCUSABLE` (selector string), `wrapFocusIndex(current, count, backwards) -> number`, `trapTab(root: ShadowRoot, event: KeyboardEvent): void`.
  - `HouseholdController(host)`: `.view: HouseholdView | null`, `.ready: boolean` (the first answer, view or null, has arrived).
  - `SessionController(host, getApi: () => HouseholdApi)`: `.session: Session | null`, `.token: string | null`, `.endsAt: number | null`, `unlocked(result: UnlockResult)`, `lock()`. It listens on the host for `pointerdown` and `keydown` (activity), touches the backend at most every 30 s, ends the session when a touch fails, when it runs out, and when the page is hidden (`visibilitychange`), and calls `host.requestUpdate()` on every change.
  - `LayoutController(host)`: `.layout: Layout`; sets the host's `layout` attribute; uses a `ResizeObserver` on the host and `focusin`/`focusout` to know whether an `input`, `textarea`, or `select` has focus (`event.composedPath()[0]`).
  - `pv-member-avatar` (`.member`, `.hass`, `.size = 40`), `pv-session-ring` (`.endsAt`, `.color`, `.size = 28`), `pv-parent-strip` (`.member`, `.hass`, `.endsAt`; fires `pv-lock`), `pv-pin-sheet` (below), `pv-notice-sheet` (below).

- [ ] **Step 1: Write the failing test for focus wrapping**

Create `test/focus.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { wrapFocusIndex } from '../src/core/focus';

describe('wrapFocusIndex', () => {
  it('wraps Tab and Shift+Tab around the ends of a dialog', () => {
    expect(wrapFocusIndex(2, 3, false)).toBe(0);
    expect(wrapFocusIndex(0, 3, true)).toBe(2);
    expect(wrapFocusIndex(1, 3, false)).toBe(2);
    expect(wrapFocusIndex(-1, 3, false)).toBe(0);
    expect(wrapFocusIndex(-1, 3, true)).toBe(2);
    expect(wrapFocusIndex(0, 0, false)).toBe(-1);
  });
});
```

Run: `npm test -- focus`. Expected: `Failed to resolve import "../src/core/focus"`.

- [ ] **Step 2: Create `src/core/focus.ts`**

```ts
/** What Tab can reach inside a dialog. */
export const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The element to focus next when Tab (or Shift+Tab) runs past either end. */
export function wrapFocusIndex(current: number, count: number, backwards: boolean): number {
  if (count === 0) return -1;
  if (current < 0) return backwards ? count - 1 : 0;
  return backwards ? (current - 1 + count) % count : (current + 1) % count;
}

/** Keep Tab inside a dialog rendered in `root` (spec 11.8). */
export function trapTab(root: ShadowRoot, event: KeyboardEvent): void {
  if (event.key !== 'Tab') return;
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const index = items.indexOf(root.activeElement as HTMLElement);
  const next = wrapFocusIndex(index, items.length, event.shiftKey);
  if (next >= 0) {
    event.preventDefault();
    items[next].focus();
  }
}
```

Run: `npm test -- focus`. Expected: `1 passed`.

- [ ] **Step 3: Create the controllers**

`HouseholdController` (`src/shell/household-controller.ts`): a `ReactiveController` holding a `HouseholdSubscription`. `hostConnected` and `hostUpdate` call `subscription.update(host.hass?.connection)`; `hostDisconnected` calls `stop()` and clears `view`. The callback stores the view (or null), sets `ready = true`, and calls `host.requestUpdate()`.

`SessionController` (`src/shell/session-controller.ts`): holds `Session | null` from `core/session.ts`.
- `unlocked(result)`: `startSession(result, Date.now())`, then a 1 s interval while a session exists that calls `lock()` once `expired(session, Date.now())`.
- Activity (`pointerdown`, `keydown` on the host, capture phase): `noteActivity`; when it says `touch`, call `api.touch(token)`; if that rejects, `lock()` locally without calling the backend again.
- `lock()`: forgets the session and the interval, then calls `api.lock(token)` (errors ignored) and `requestUpdate()`.
- `visibilitychange` on `document`: when `document.visibilityState === 'hidden'`, `lock()`.
- `hostDisconnected`: `lock()`.

`LayoutController` (`src/shell/layout-controller.ts`): keeps the previous layout and box, observes the host with a `ResizeObserver`, computes `classifyLayout(box, previous, previousBox, textFocused)` from `contentRect`, and on a change sets `host.setAttribute('layout', layout)` and requests an update. The first measurement happens in `hostConnected` with `getBoundingClientRect()`.

- [ ] **Step 4: Create the small elements**

`pv-member-avatar` (`src/core/pv-member-avatar.ts`): a circle `size` px across in the member's color showing `pictureOf(member, id => hass.states[id]?.attributes?.entity_picture ?? null)`: a photo (`object-fit: cover`), an emoji (font size 0.55 × size), or the initial (bold, its color from the same light-or-dark text rule the calendar's avatars use today; milestone 3 replaces that rule). `role="img"` and `aria-label` = the member's name.

`pv-session-ring` (`src/core/pv-session-ring.ts`): an SVG ring `size` px across in `color` whose stroke shows the time left until `endsAt` out of two minutes, redrawn every second by its own timer (only this element re-renders). `role="img"`, `aria-label` "Parent mode ends in {m} min {s} s", updated every 10 seconds.

`pv-parent-strip` (`src/shell/pv-parent-strip.ts`): a bar 48 px tall across the top: the parent's avatar (28 px), "{Name} · parent mode", the session ring, and a **Lock** button (at least 48 × 48 px) that fires `pv-lock` (bubbles, composed). Its background is the parent's color mixed 16 percent into the card background (`color-mix(in srgb, <color> 16%, var(--pv-card-bg))`), with a 3 px bottom line in the parent's color (spec 11.3: the member color says who).

`src/styles/sheet.ts` exports `sheetStyles`: a fixed backdrop (`rgba(0, 0, 0, 0.4)`) and a panel. `:host([layout='landscape'])` centers the panel (max width 400 px, radius 20 px). Portrait and phone put it at the bottom, full width, radius 20 px on the top corners, only as tall as its content (spec 12.3). Buttons are at least 48 px tall.

`pv-notice-sheet` (`src/shell/pv-notice-sheet.ts`): properties `heading`, `body`, `actions: Array<{ id: string; label: string; kind: 'primary' | 'secondary' | 'destructive' }>`, `layout`. A dialog (`role="dialog"`, `aria-modal="true"`, `aria-labelledby` the heading) that focuses its first button when opened, traps Tab with `trapTab`, and fires `pv-sheet-action` with `{ id }` for a button, or `{ id: 'cancel' }` for Escape or a tap on the backdrop.

- [ ] **Step 5: Create the PIN sheet**

`pv-pin-sheet` (`src/shell/pv-pin-sheet.ts`), with `sheetStyles`:

| Property | Meaning |
|---|---|
| `hass`, `api`, `layout` | as on pages |
| `mode: 'unlock' \| 'choose'` | check a PIN, or choose a new one |
| `members: Member[]` | unlock: who may act, in board order |
| `heading: string` | unlock: the picker's question, such as "Who's opening Settings?" |
| `target: Member` | choose: whose PIN this is |
| `shuffle: boolean` | Shuffle the keypad (from the household view) |

Behavior:
- **Unlock.** With more than one person, the sheet first shows the question and each person's avatar (64 px) and name as a button. With one, it goes straight on. Then "{Name}, enter your PIN" with one box per digit (`pin_length`, else 6) and the keypad. On the last digit it calls `api.unlock(member.id, digits)`:
  - ok: fires `pv-unlocked` with `{ result }`;
  - `wrong_pin`: the boxes shake (a 300 ms transform; a fade under reduced motion), clear, and the sheet says "That's not {Name}'s PIN. {n} more tries before a short pause." ("1 more try" when one is left);
  - `paused`: "Too many tries. Try again in {m:ss}.", counting down every second, with the keypad disabled until it reaches zero;
  - `no_pin`: "{Name} has no PIN yet.";
  - a rejected call: "Couldn't check the PIN. Check the connection and try again."
  With more than one person, "‹ Someone else" goes back to the picker.
- **Choose.** "Choose a PIN for {Name}" with the hint "4 to 6 digits." and up to six boxes. **Next** is enabled from 4 digits (`canFinishChoosing`), and the sixth digit goes on by itself. Then "Enter it again". A match calls `api.setPin(target.id, pin)` and fires `pv-pin-set` with `{ memberId }`. A mismatch says "Those didn't match. Try again." and starts over. A rejected call says `saveErrorMessage(errorCode(err))`.
- **Keypad.** Three columns of round keys, at least 72 px across: the first nine of `keypadDigits(shuffle)` (shuffled anew each time the sheet opens), then **Cancel** (text), the tenth digit, and Delete (an icon, `aria-label="Delete last digit"`). In portrait and on phones it sits in the lower half of the screen (spec 9.3). The typed digits are never in the DOM: the boxes show only filled or empty, with a polite live region saying "{n} of {length} digits entered".
- **Keyboard.** Digit keys type; Backspace deletes; Enter is Next while choosing; Escape cancels. Tab stays in the sheet (`trapTab`).
- Cancel, Escape, and a tap on the backdrop fire `pv-sheet-close`.

- [ ] **Step 6: Wire the card**

In `src/shell/planavista-card.ts`:
- Add the three controllers, and `private _api = new HouseholdApi({ callWS: msg => (this.hass as any).callWS(msg) }, () => this._session.token)`.
- `_access()` returns `settingsAccess(this._household.view, !!this.hass?.user?.is_admin)`; while `!this._household.ready`, it returns `this.hass?.user?.is_admin ? 'open' : 'none'`.
- `_renderModule` passes `.canOpenSettings=${this._access() !== 'none'}` (replacing `is_admin`).
- `_openSettings()`: when access is `'open'`, or a parent-mode session is active, open Settings; when `'pin'`, open `pv-pin-sheet` in unlock mode with `parentsWithPins(view.members)` and the heading "Who's opening Settings?"; when `'no_pin'`, open `pv-notice-sheet` with heading "Settings needs a parent's PIN", body "On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode.", and one primary action "OK".
- `pv-unlocked`: `this._session.unlocked(result)`, close the sheet, open Settings.
- While `this._session.session?.parent` is true, render `pv-parent-strip` (the parent from `view.members`) as the first child of `ha-card`, even when `hide_header` is set. `pv-lock` calls `this._session.lock()`.
- Remember the gear's element when a sheet opens (`event.composedPath()[0]`), and focus it again when the sheet closes.
- Pass `.api=${this._api}` to the `pv-onboarding-wizard` elements.

In `src/shell/onboarding-wizard.ts`, add `@property({ attribute: false }) api?: HouseholdApi;` and in `_finish` replace the `callService('planavista', 'save_config', payload)` line with:

```ts
      if (this.api) {
        await this.api.saveConfig(payload);
      } else {
        await this.hass.callService('planavista', 'save_config', payload);
      }
```

- [ ] **Step 7: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `191 passed`; the build succeeds.

Deploy (`bash scripts/dev-ha.sh deploy`, since the backend changed) and, in a fresh isolated context signed in as the dev admin, check: the gear opens the old Settings; nothing else on the calendar changed. Then sign in as `kitchen` (another fresh context): the gear opens "Settings needs a parent's PIN". Set Blair's PIN through `scripts/ha.py ws` as the admin (`{"type": "planavista/pin/set", "member_id": "blair", "pin": "<a test PIN>"}`) and try again: the PIN sheet asks who, then for the PIN; a correct PIN shows Blair's parent-mode strip and opens Settings, and Lock ends it. Close every page. Discard the build output (`git checkout -- dist/`).

- [ ] **Step 8: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/focus.ts test/focus.test.ts src/shell/household-controller.ts src/shell/session-controller.ts src/shell/layout-controller.ts src/core/pv-member-avatar.ts src/core/pv-session-ring.ts src/shell/pv-parent-strip.ts src/shell/pv-pin-sheet.ts src/shell/pv-notice-sheet.ts src/styles/sheet.ts src/shell/planavista-card.ts src/shell/onboarding-wizard.ts
git commit -F - <<'EOF'
feat(frontend): ask for a parent's PIN on shared screens

The card follows the household and measures its own size. On a shared
screen the gear asks who is opening Settings and for their PIN, then
shows that parent's color, picture, a countdown, and Lock until parent
mode ends. Settings now saves through parent mode as well.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 11: Settings: People, a person's page, PINs and parent mode, and About

**Files:**
- Create: `src/core/person-draft.ts`, `test/person-draft.test.ts`
- Create: `src/shell/settings/pv-settings.ts`, `people-page.ts`, `person-page.ts`, `pins-page.ts`, `about-page.ts`, `appearance-page.ts` (all in `src/shell/settings/`)
- Modify: `src/shell/planavista-card.ts` (Settings opens `pv-settings`)

**Interfaces:**
- Consumes: Tasks 7 to 10.
- Produces (in `core/person-draft.ts`): `PersonDraft { name; color; picture; age_group; parent; person }`, `draftOf(member | null, members, palette) -> PersonDraft`, `draftChanges(draft, member | null) -> MemberChanges`, `isDirty(draft, start) -> boolean`, `draftProblem(draft, members, selfId) -> string | null`.
- `pv-settings` properties: the `PageProps` (minus `mode`), `session: Session | null`, `parent: Member | null`, `drafts: Map<string, PersonDraft>`. Events: `pv-settings-close`, `pv-lock`.

- [ ] **Step 1: Write the failing tests**

Create `test/person-draft.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { draftChanges, draftOf, draftProblem, isDirty } from '../src/core/person-draft';
import { Member } from '../src/core/household';

const PALETTE = ['#F94144', '#277DA1', '#43AA8B'];
const ALEX = {
  id: 'alex', name: 'Alex', color: '#F94144', color_dark: null, picture: { initial: true }, age_group: 'adult',
  parent: true, person: 'person.alex', order: 0, rev: 2, my_day: 'timeline', needs_ok_for: 'none', stars: false,
  has_pin: true, pin_length: 4, locked_until: null,
} as Member;

describe('person drafts', () => {
  it('starts someone new with the first free color', () => {
    expect(draftOf(null, [ALEX], PALETTE)).toEqual({
      name: '', color: '#277DA1', picture: { initial: true }, age_group: 'adult', parent: false, person: null,
    });
  });

  it('starts from a saved person', () => {
    expect(draftOf(ALEX, [ALEX], PALETTE)).toEqual({
      name: 'Alex', color: '#F94144', picture: { initial: true }, age_group: 'adult', parent: true, person: 'person.alex',
    });
  });

  it('sends everything for someone new and only changes for someone saved', () => {
    const fresh = { ...draftOf(null, [], PALETTE), name: '  Dana ', age_group: 'young_child' as const };
    expect(draftChanges(fresh, null)).toEqual({
      name: 'Dana', color: '#F94144', picture: { initial: true }, age_group: 'young_child', parent: false, person: null,
    });
    const edited = { ...draftOf(ALEX, [ALEX], PALETTE), picture: { emoji: '\u{1F996}' } };
    expect(draftChanges(edited, ALEX)).toEqual({ picture: { emoji: '\u{1F996}' } });
  });

  it('knows when there is something to save', () => {
    const start = draftOf(ALEX, [ALEX], PALETTE);
    expect(isDirty(start, start)).toBe(false);
    expect(isDirty({ ...start, parent: false }, start)).toBe(true);
  });

  it('says what to fix before saving', () => {
    const casey = { ...ALEX, id: 'casey', name: 'Casey', color: '#43AA8B', person: null } as Member;
    const draft = draftOf(null, [ALEX, casey], PALETTE);
    expect(draftProblem(draft, [ALEX, casey], null)).toBe('Add a name.');
    expect(draftProblem({ ...draft, name: 'alex' }, [ALEX, casey], null)).toBe('Someone already has that name.');
    expect(draftProblem({ ...draft, name: 'Dana', color: '#43aa8b' }, [ALEX, casey], null)).toBe('Casey already has that color.');
    expect(draftProblem({ ...draft, name: 'Dana' }, [ALEX, casey], null)).toBeNull();
    expect(draftProblem(draftOf(ALEX, [ALEX], PALETTE), [ALEX, casey], 'alex')).toBeNull();
  });
});
```

Run: `npm test -- person-draft`. Expected: `Failed to resolve import "../src/core/person-draft"`.

- [ ] **Step 2: Create `src/core/person-draft.ts`**

```ts
import { AgeGroup, Member, MemberChanges, Picture, takenColors } from './household';

/** What the person page edits. */
export interface PersonDraft {
  name: string;
  color: string;
  picture: Picture;
  age_group: AgeGroup;
  parent: boolean;
  person: string | null;
}

const FIELDS: Array<keyof PersonDraft> = ['name', 'color', 'picture', 'age_group', 'parent', 'person'];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The editor's starting point: the person as saved, or someone new with the first free color. */
export function draftOf(member: Member | null, members: Member[], palette: string[]): PersonDraft {
  if (member) {
    return {
      name: member.name,
      color: member.color,
      picture: member.picture,
      age_group: member.age_group,
      parent: member.parent,
      person: member.person,
    };
  }
  const taken = takenColors(members);
  const color = palette.find(c => !taken.has(c.toUpperCase())) ?? palette[0];
  return { name: '', color, picture: { initial: true }, age_group: 'adult', parent: false, person: null };
}

/** What to send: every field for someone new, only what changed for someone saved. */
export function draftChanges(draft: PersonDraft, member: Member | null): MemberChanges {
  const changes: Record<string, unknown> = {};
  for (const key of FIELDS) {
    if (!member || !same(draft[key], member[key])) changes[key] = draft[key];
  }
  if (typeof changes.name === 'string') changes.name = changes.name.trim();
  return changes as MemberChanges;
}

export function isDirty(draft: PersonDraft, start: PersonDraft): boolean {
  return !same(draft, start);
}

/** A problem to fix before saving, or null. The backend checks again. */
export function draftProblem(draft: PersonDraft, members: Member[], selfId: string | null): string | null {
  const name = draft.name.trim();
  if (!name) return 'Add a name.';
  const others = members.filter(m => m.id !== selfId);
  if (others.some(m => m.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    return 'Someone already has that name.';
  }
  const owner = others.find(m => m.color.toUpperCase() === draft.color.toUpperCase());
  return owner ? `${owner.name} already has that color.` : null;
}
```

Run: `npm test -- person-draft`. Expected: `5 passed`.

- [ ] **Step 3: Create the Settings host**

`pv-settings` (`src/shell/settings/pv-settings.ts`):
- **Pages:** `settingsRegistry.pages({ household, data })`, grouped with `groupPages`. Each sidebar row is a button (at least 48 px tall) with the page label, its `summary(ctx)` in secondary text, and a chevron. A group with a label gets a small heading in sentence case ("Calendar").
- **Landscape** (`layout === 'landscape'`): a split view like iPad Settings: the sidebar on the left (`minmax(260px, 320px)`, its own scroll) and the selected page on the right (its own scroll) under a large title; People is selected first. The selected row is tinted with the accent (spec 11.3: the active item is something to act on).
- **Portrait and phone:** a stack. First the sidebar under the title "Settings"; a row opens its page with a back control "‹ Settings" above the page title.
- **Sub-pages:** `PUSH_PAGE` pushes `{ tag, title, back, props }` onto a stack shown in the page area with a back control "‹ {back}"; `POP_PAGE` pops it. Switching rows clears the stack.
- **Leaving:** before going back, switching rows, or Done, the host calls the visible page's `confirmLeave()` when it has one, and stays when it returns false.
- **Top:** when `session?.parent` is set, `pv-parent-strip` for `parent` (its `pv-lock` bubbles to the card). Below it, a bar with "Settings" (or the back control in the stack) and a **Done** button that fires `pv-settings-close`.
- **Errors:** `PAGE_ERROR` shows its message in a toast at the bottom for 4 seconds (`role="status"`).
- Renders pages with `lit/static-html.js` (`unsafeStatic(tag)`), passing the `PageProps` with `mode: 'settings'`, the sub-page `props`, and `.drafts`.
- When the household isn't usable (`!household?.available`), a banner at the top of the page area: "People and PINs can't be changed until PlanaVista is updated." (only when `household` is not null; with no household at all, the People and PINs rows are hidden by their `applies`).

Add `applies: ({ household }) => household !== null` to the People and PINs pages in `src/shell/definition.ts`, and a test in `test/settings-registry.test.ts`: with `household: null`, `settings.pages(...)` has no `people` or `pins`.

- [ ] **Step 4: Create the pages**

`pv-settings-people` (`people-page.ts`):
- Lead: "This is the order people appear in. Drag ≡ to change it."
- A row per person (`inOrder`): a ≡ handle button, the avatar (40 px), the name, and `memberSummary(member, data.calendars)`. Tapping the row fires `PUSH_PAGE` with `{ tag: 'pv-settings-person', title: name, back: 'People', props: { memberId } }`.
- Dragging the handle (pointer events with pointer capture) moves the row to `rowIndexAt(y, row rects)`; dropping sends `api.reorder(ids)`. With the handle focused, Arrow Up and Arrow Down move the row one place and send the new order. A failed reorder reloads the order from the household and fires `PAGE_ERROR`.
- **Add someone** (top right of the page, and after the list) pushes the person page with `title: 'New person'` and `memberId: null`.
- With nobody yet: "No one here yet." and **Add someone**.

`pv-settings-person` (`person-page.ts`), properties `memberId: string | null`, `drafts`:
- The draft comes from `drafts.get(memberId ?? 'new')` when there is one (spec 9.4: an edit survives the end of parent mode), else `draftOf(member, members, PvColorSwatchPicker.PRESETS.map(p => p.color))`. Every change stores the draft in `drafts`.
- At the top: the avatar (64 px) as it will look, and **Cancel** and **Save** (**Add** for someone new). Save is disabled while saving, or when nothing changed.
- **Name:** a text field, at most 40 characters.
- **Color:** the 20 palette swatches. Someone else's color is disabled and shows their initial; its label says "{color name}, used by {name}".
- **Picture:** Initial, Emoji, or Photo. Photo is offered only when a Home Assistant person is linked and has a picture, with the hint "Link a Home Assistant person to use their photo." Emoji shows a field ("Type or paste an emoji").
- **Age group:** a radio list from `AGE_GROUP_CHOICES`, each with its hint.
- **Parent:** a switch, with the hint "Parents open Settings. On a shared screen they need a PIN."
- **PIN** (people already saved): "PIN set", "No PIN", or "Paused after too many tries", with **Set PIN** or **Change PIN**, **Remove PIN**, and **Clear pause**. They open `pv-pin-sheet` in choose mode, or call `api.clearPin` and `api.clearPause`. A refused removal shows the backend's message (for `last_parent_pin`: "A shared screen needs at least one parent with a PIN."). Someone new: "You can set a PIN after adding {name}."
- **Home Assistant:** **Person**, a select with None and every `person.*` not linked to someone else (by friendly name). Choosing None while Photo is the picture switches the picture to Initial. **Calendars:** the calendars that belong to them (`calendarsOf`), or "No calendars yet. Choose who each calendar belongs to in Calendars."
- **Remove {name}** (people already saved, destructive): `pv-notice-sheet` "Remove {name}?" with the body "Their calendars stay, and won't belong to anyone." and **Cancel**, **Remove**. Remove calls `api.deleteMember`, clears the draft, and fires `POP_PAGE`.
- **Saving:** a `draftProblem` shows under the form. Otherwise `api.saveMember(draftChanges(draft, member), member ? { id, rev } : undefined)`. Success clears the draft and fires `POP_PAGE`. `changed` opens "This changed on another screen." with **Keep editing** and **Load the new version** (which starts the draft over from the saved person). Any other refusal shows `err.message` from the backend, or `saveErrorMessage(errorCode(err))`.
- **Cancel**, and `confirmLeave()` while there are changes: "Discard changes?" with **Keep editing** and **Discard**. Discard clears the draft.

`pv-settings-pins` (`pins-page.ts`):
- **This screen:** a switch "Shared family screen" for the signed-in account (`account.shared`), with the hint "Yes, the whole family uses it. Settings asks for a parent's PIN." It calls `api.setSharedScreen`. A `needs_parent_pin` refusal shows "Set a PIN for a parent first, so someone can open Settings here." When `account.is_admin` is true: "This screen is signed in with an admin account. A non-admin account is safer for a shared screen, because anyone here can reach Home Assistant's own settings." and a link "How to set one up" (`https://www.home-assistant.io/docs/authentication/`, new tab).
- **PINs:** a row per person (avatar, name, status, actions as on the person page). A parent with no PIN, while any screen is shared, shows "Needs a PIN on a shared screen" in amber with that text (spec 11.3: color is never alone).
- **Shuffle the keypad:** a switch with the hint "The numbers move each time, so smudges and glances don't give a PIN away." It calls `api.saveSecurity`.
- The rule, in small text: "After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in to Home Assistant with a parent's or an admin's own account and set new ones here."

`pv-settings-about` (`about-page.ts`): "PlanaVista", "Version {version}", and two links that open in a new tab: "Project on GitHub" (`https://github.com/tavenhall1/planavista`) and "Report a problem" (`https://github.com/tavenhall1/planavista/issues`).

`pv-settings-appearance` (`appearance-page.ts`): `pv-theme-picker` with the same properties.

- [ ] **Step 5: Wire the card**

In `src/shell/planavista-card.ts`, the Settings overlay renders `pv-settings` instead of the wizard in settings mode, with `.drafts=${this._drafts}` (a `Map` on the card, so drafts outlive Settings until the page reloads), the session, and the parent. Keep the theme handling: `theme-preview` still previews, and closing Settings re-applies the saved theme as `_onSettingsClose` does today. Close Settings (drafts kept) when the session ends and `_access()` isn't `'open'`. When `_access()` turns from `'open'` to `'pin'` while Settings is open without a session (this account was just marked as a shared screen), open the PIN sheet over Settings with the heading "Enter a parent's PIN to keep changing settings"; closing that sheet closes Settings.

- [ ] **Step 6: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; `197 passed`; the build succeeds.

Deploy the bundle (`bash scripts/dev-ha.sh deploy-frontend`) and check, as the dev admin, at 1280 × 800, 800 × 1280, and 390 × 844: the split view and the stack, every row's value, People (drag, Add someone, a person's page with every field, Save, Remove with its confirmation, Discard changes), PINs and parent mode (set Casey's PIN, shuffle, the admin note), Calendars with Belongs to, Calendar options, Appearance, and About. Close every page. Discard the build output.

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add src/core/person-draft.ts test/person-draft.test.ts test/settings-registry.test.ts src/shell/settings src/shell/definition.ts src/shell/planavista-card.ts
git commit -F - <<'EOF'
feat(frontend): one Settings for every module, with People and PINs

Settings is a split view in landscape and a stack in portrait and on
phones, with the parent-mode strip on top. People lists the household
in order, each person has a page with Cancel and Save, and PINs and
parent mode marks shared screens and manages every PIN.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

---

### Task 12: First-run setup from registered steps, and the old wizard goes

**Files:**
- Create: `src/core/setup-people.ts`, `src/core/setup-defaults.ts`, `test/setup-people.test.ts`, `test/setup-defaults.test.ts`
- Create: `src/shell/setup/pv-setup.ts`, `welcome-step.ts`, `people-step.ts`, `look-step.ts`, `done-step.ts` (all in `src/shell/setup/`)
- Modify: `src/shell/planavista-card.ts` (setup opens `pv-setup`, gated by access)
- Delete: `src/shell/onboarding-wizard.ts`, `test/wizard-pages.test.ts`
- Modify: `src/core/page-registry.ts` (remove `WizardContext`, `setupSteps`, `settingsPages`), `src/shell/definition.ts` and `src/modules/calendar/definition.ts` (remove the old `shellPages`, `calendarPages`, and their registration), `src/modules/calendar/index.ts`, `test/page-registry.test.ts` and `test/calendar-definition.test.ts` (drop what tested the removed parts)

**Interfaces:**
- Produces (in `core/setup-people.ts`): `PersonRow { key; name; person: string | null; memberId: string | null; role: Role; checked: boolean }`, `HaPerson { entity_id; name; user_id?: string | null }`, `setupRows(members, persons, currentUserId) -> PersonRow[]`, `addedRow(name, index) -> PersonRow`, `SetupPlan { add: MemberChanges[]; update: Array<{ id; changes: MemberChanges }>; remove: string[] }`, `setupPlan(rows, members) -> SetupPlan`.
- Produces (in `core/setup-defaults.ts`): `LocaleLike { time_format?: string; first_weekday?: string }`, `setupDisplayDefaults(display, locale, weatherEntities) -> DisplayConfig`.
- Step headings and leads come from the step registrations (add `heading: string` and `lead?: string` to `SetupStep` in Task 8's `settings-registry.ts` and fill them in as listed below).

- [ ] **Step 1: Write the failing tests**

Create `test/setup-people.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { addedRow, setupPlan, setupRows } from '../src/core/setup-people';
import { Member } from '../src/core/household';

const casey = { id: 'casey', name: 'Casey', person: 'person.casey', age_group: 'teen', parent: false } as Member;
const PERSONS = [
  { entity_id: 'person.alex', name: 'Alex', user_id: 'user-alex' },
  { entity_id: 'person.blair', name: 'Blair', user_id: null },
  { entity_id: 'person.casey', name: 'Casey', user_id: 'user-casey' },
];

describe('who lives here', () => {
  it('lists people already in the household, then Home Assistant people who are not', () => {
    const rows = setupRows([casey], PERSONS, 'user-alex');
    expect(rows.map(r => [r.key, r.name, r.memberId, r.role, r.checked])).toEqual([
      ['casey', 'Casey', 'casey', 'teen', true],
      ['person.alex', 'Alex', null, 'parent', true],
      ['person.blair', 'Blair', null, 'adult', true],
    ]);
  });

  it('adds someone without Home Assistant by name', () => {
    expect(addedRow('  Dana ', 0)).toEqual({ key: 'new:0', name: 'Dana', person: null, memberId: null, role: 'adult', checked: true });
  });

  it('turns the rows into adds, role changes, and removals', () => {
    const rows = setupRows([casey], PERSONS, 'user-alex');
    rows[0] = { ...rows[0], role: 'older_child' };
    rows[2] = { ...rows[2], checked: false };
    rows.push({ ...addedRow('Dana', 0), role: 'young_child' }, { ...addedRow('   ', 1) });
    expect(setupPlan(rows, [casey])).toEqual({
      add: [
        { name: 'Alex', age_group: 'adult', parent: true, person: 'person.alex' },
        { name: 'Dana', age_group: 'young_child', parent: false },
      ],
      update: [{ id: 'casey', changes: { age_group: 'older_child', parent: false } }],
      remove: [],
    });
    rows[0] = { ...rows[0], checked: false };
    expect(setupPlan(rows, [casey]).remove).toEqual(['casey']);
  });
});
```

Create `test/setup-defaults.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { setupDisplayDefaults } from '../src/core/setup-defaults';
import { DisplayConfig } from '../src/types';

const DISPLAY = { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'planavista', extra: 1 } as unknown as DisplayConfig;

describe('setupDisplayDefaults', () => {
  it('takes Home Assistant’s explicit time format and first day', () => {
    expect(setupDisplayDefaults(DISPLAY, { time_format: '24', first_weekday: 'sunday' }, [])).toMatchObject({ time_format: '24h', first_day: 'sunday' });
  });

  it('keeps the saved values when Home Assistant follows the language', () => {
    expect(setupDisplayDefaults(DISPLAY, { time_format: 'language', first_weekday: 'language' }, [])).toEqual(DISPLAY);
    expect(setupDisplayDefaults(DISPLAY, { first_weekday: 'saturday' }, [])).toEqual(DISPLAY);
    expect(setupDisplayDefaults(DISPLAY, undefined, [])).toEqual(DISPLAY);
  });

  it('picks the first weather entity only when none is chosen', () => {
    expect(setupDisplayDefaults(DISPLAY, undefined, ['weather.office', 'weather.home']).weather_entity).toBe('weather.home');
    const chosen = { ...DISPLAY, weather_entity: 'weather.office' };
    expect(setupDisplayDefaults(chosen, undefined, ['weather.home']).weather_entity).toBe('weather.office');
  });
});
```

(Write the test title in the first `it` with a plain apostrophe in double quotes if the escape is awkward: `"takes Home Assistant's explicit time format and first day"`.)

Run: `npm test -- setup-people setup-defaults`. Expected: both fail to resolve their modules.

- [ ] **Step 2: Create the two modules**

`src/core/setup-people.ts`:

```ts
import { Member, MemberChanges, Role, roleFields, roleOf } from './household';

export interface PersonRow {
  key: string;
  name: string;
  person: string | null;
  memberId: string | null;
  role: Role;
  checked: boolean;
}

export interface HaPerson {
  entity_id: string;
  name: string;
  user_id?: string | null;
}

/** "Who lives here?": the household first, then Home Assistant people who aren't in it yet. */
export function setupRows(members: Member[], persons: HaPerson[], currentUserId: string | null): PersonRow[] {
  const rows: PersonRow[] = members.map(m => ({
    key: m.id, name: m.name, person: m.person, memberId: m.id, role: roleOf(m), checked: true,
  }));
  for (const person of persons) {
    if (members.some(m => m.person === person.entity_id)) continue;
    const isYou = !!currentUserId && person.user_id === currentUserId;
    rows.push({
      key: person.entity_id, name: person.name, person: person.entity_id, memberId: null,
      role: isYou ? 'parent' : 'adult', checked: true,
    });
  }
  return rows;
}

/** Someone without Home Assistant, added by name. */
export function addedRow(name: string, index: number): PersonRow {
  return { key: `new:${index}`, name: name.trim(), person: null, memberId: null, role: 'adult', checked: true };
}

export interface SetupPlan {
  add: MemberChanges[];
  update: Array<{ id: string; changes: MemberChanges }>;
  remove: string[];
}

/** What Next does: add checked newcomers, change roles that changed, remove people who were unchecked. */
export function setupPlan(rows: PersonRow[], members: Member[]): SetupPlan {
  const plan: SetupPlan = { add: [], update: [], remove: [] };
  for (const row of rows) {
    const member = row.memberId ? members.find(m => m.id === row.memberId) : undefined;
    if (member) {
      if (!row.checked) plan.remove.push(member.id);
      else if (row.role !== roleOf(member)) plan.update.push({ id: member.id, changes: roleFields(row.role) });
    } else if (row.checked && row.name.trim()) {
      plan.add.push({ name: row.name.trim(), ...roleFields(row.role), ...(row.person ? { person: row.person } : {}) });
    }
  }
  return plan;
}
```

`src/core/setup-defaults.ts`:

```ts
import { DisplayConfig } from '../types';

/** Home Assistant's locale settings (hass.locale), as far as setup uses them. */
export interface LocaleLike {
  time_format?: string;
  first_weekday?: string;
}

/**
 * Calendar options for a new household (spec 14.7 leaves them out of setup):
 * Home Assistant's own time format and first day when they are set
 * explicitly, and the first weather entity when none is chosen. Every other
 * saved value stays.
 */
export function setupDisplayDefaults(
  display: DisplayConfig,
  locale: LocaleLike | undefined,
  weatherEntities: string[],
): DisplayConfig {
  const result = { ...display };
  if (locale?.time_format === '12') result.time_format = '12h';
  if (locale?.time_format === '24') result.time_format = '24h';
  if (locale?.first_weekday === 'monday' || locale?.first_weekday === 'sunday') {
    result.first_day = locale.first_weekday;
  }
  if (!result.weather_entity && weatherEntities.length > 0) {
    result.weather_entity = [...weatherEntities].sort()[0];
  }
  return result;
}
```

Run: `npm test -- setup-people setup-defaults`. Expected: `6 passed`.

- [ ] **Step 3: Give the steps their headings and leads**

In `src/core/settings-registry.ts`, add to `SetupStep`: `heading: string;` and `lead?: string;`. Fill them in:

| Step | heading | lead |
|---|---|---|
| welcome | Welcome to PlanaVista | About 5 minutes. Everything can change later in Settings. |
| people | Who lives here? | Choose everyone in your home and what they are. People without Home Assistant can be added too. |
| calendars | Calendars | Choose the calendars to show, and who each one belongs to. |
| look | Pick a look | You can change it any time in Settings. |
| done | You're all set | |

- [ ] **Step 4: Create the setup host and the steps**

`pv-setup` (`src/shell/setup/pv-setup.ts`), with the wizard frame's styles from `frame.css` (Task 9) and its `_renderProgressDots` from `frame.methods.ts`:
- Steps from `setupRegistry.pages({ household, data })`; it starts at `resumeIndex(steps, household?.setup.step ?? null)`, once.
- One question per step (spec 14.7): **‹ Back** at the top left (hidden on the first step), progress dots ("Step 2 of 5" for screen readers), the step's heading (large) and lead, the step element (with the `PageProps` and `mode: 'setup'`), and the main button at the bottom: the step's `primaryLabel`, else "Next". One centered column, at most 640 px wide, in every layout.
- The main button awaits `step.commit?.()`; true (or no `commit`) moves on and saves where setup is: `api.saveSetup({ step: <next step id> })`. Errors from `saveSetup` show in a toast; the step changes anyway.
- After the last step's `commit`, it fires `onboarding-complete` (the card already handles it).

`pv-setup-welcome`: four rings in four palette colors, each three quarters closed (decorative, `aria-hidden`). `primaryLabel` "Set up".

`pv-setup-people`: rows from `setupRows(members, <person.* states as HaPerson>, hass.user.id)`. Each row: a checkbox (48 px target), the person's photo or initial, the name, and a role select from `ROLES`. Below: a text field and **Add** for someone without Home Assistant (`addedRow`). `commit()` runs `setupPlan(rows, members)`: removals, then role changes, then adds, one at a time through `api`. On a refusal it shows the message under the list and returns false.

`pv-calendar-calendars-page` is the calendars step (it saves as you tap).

`pv-setup-look`: `pv-theme-picker`.

`pv-setup-done`: two tips, "Tap the gear to change anything later." and "On a shared screen, Settings asks for a parent's PIN." `primaryLabel` "Open the calendar". `commit()` sends `api.saveConfig({ display: setupDisplayDefaults(data.display, hass.locale, <weather.* ids>), onboarding_complete: true })`, then `api.saveSetup({ completed: true, step: null })`, and returns true; a refusal shows `saveErrorMessage(errorCode(err))` and returns false.

- [ ] **Step 5: Wire the card and remove the old wizard**

In `src/shell/planavista-card.ts`, the setup card (shown while `data.onboarding_complete === false`) depends on `_access()`:
- `'open'`: "Tap to begin setup", which opens `pv-setup`.
- `'pin'`: "Tap to begin setup", which opens the PIN sheet ("Who's setting up PlanaVista?") and then `pv-setup`.
- `'no_pin'` or `'none'`: "PlanaVista isn't set up yet" and "An admin can set it up from their own Home Assistant login." with no tap action.

Delete `src/shell/onboarding-wizard.ts` and its import, and remove the old registries and registrations listed under Files, with the tests that covered them (`test/wizard-pages.test.ts`, the `WizardContext` and old-page cases in `test/page-registry.test.ts` and `test/calendar-definition.test.ts`; keep `PageRegistry`'s own tests, now using a small local page type).

- [ ] **Step 6: Run the checks and look at it**

Run: `npx tsc --noEmit -p . && npm test && npm run build`
Expected: no type errors; every test passes (197 plus 6 here, minus the removed wizard and old-page tests; write the new total in the ledger); the build succeeds.

On the dev Home Assistant, as the dev admin, set `onboarding_complete` to false (`python scripts/ha.py api POST /api/services/planavista/save_config '{"onboarding_complete": false}'`), deploy the bundle, and walk setup: Welcome, Who lives here (add Dana as a young child), Calendars (Belongs to), Look, Done. Reload the page during Calendars: setup picks up at Calendars. Finish: the calendar shows, and Settings has the household. Close every page. Discard the build output.

- [ ] **Step 7: Commit**

```bash
cd ../../.. && python scripts/check_copy.py && cd custom_components/planavista/frontend
git add -A src test
git commit -F - <<'EOF'
feat(frontend): build first-run setup from registered steps

Setup asks one question per step: welcome, who lives here, calendars,
the look, and done, picking up where it stopped. Calendar options start
from Home Assistant's own settings. The old setup wizard is gone; its
pages live on in Settings and setup.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
```

(Check `git status` before `git add -A src test`: only this task's files may be staged.)

---

### Task 13: Verify on the dev Home Assistant, document, review, and demo (controller)

- [ ] **Step 1: The upgrade, as a 1.1.0 household would get it**

The dev Home Assistant still holds Task 0's data (main's card, calendars linked to Alex, Blair, and Casey). Build, deploy with a restart (`bash scripts/dev-ha.sh deploy`), and check with `scripts/ha.py`: `sensor.planavista_config` lists the same calendars with every old key plus `member_id`; the household has Alex, Blair, and Casey (adults, not parents, since none of their users is an admin); `onboarding_complete` is still true. In a fresh isolated context as the dev admin, screenshot the same views as Task 0 and compare them with the baseline (as in milestone 1: only the clock may differ). Then open Settings: the split view at 1280 × 800.

- [ ] **Step 2: Every kind of account in the browser**

Make Alex a parent and give Blair a PIN (Settings, as the dev admin). Then, each in a fresh isolated context, signing in through the user picker:
- `alex` (a parent's own login): the gear opens Settings straight away.
- `casey` (a child's own login): no gear.
- `kitchen` (linked to no one, not an admin): the gear asks who and for a PIN. Five wrong PINs show the pause and its countdown; clear the pause as the dev admin; the right PIN shows Blair's strip and opens Settings. Mark this screen as shared, then Lock: the strip goes away and the gear asks again.
- At 800 × 1280 as `kitchen` in parent mode: open a person's page, focus Name, and shrink the window's height to 700: the stack stays (the keyboard rule).

- [ ] **Step 3: The README**

Add a section "People, PINs, and Settings" to `README.md` after "Card YAML Options": who is in the household and where they come from (people linked to calendars join on their own), shared family screens and parents' PINs (and why a non-admin account is safer on a wall tablet), parent mode (two quiet minutes, Lock), and where Settings is. No em dashes. Then run `python scripts/check_copy.py`.

- [ ] **Step 4: The bundle, CI, and the branch**

```bash
cd custom_components/planavista/frontend && npm run build && cd ../../..
bash scripts/test-backend.sh -q
git add custom_components/planavista/frontend/dist/planavista-cards.js README.md
git commit -F - <<'EOF'
build: rebuild bundle, and describe people, PINs, and Settings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VLVPWNUTsMxdQJNpqdTZgj
EOF
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin feat/chores-m2-members
```

Expected: the backend suite and the frontend checks pass; CI (Validate and Frontend) passes on the branch.

- [ ] **Step 5: The final review and the fix pass**

Run the executing-plans final review: `review-package` for `main..HEAD`, a fresh reviewer on the most capable model with this plan, the spec, the Review Focus above, and the ledger's `Ruling:` lines. Re-grade, fix Critical and Important findings test-first in one pass, ledger the minors, rebuild the bundle if the frontend changed, push, and wait for CI.

- [ ] **Step 6: The demo**

Screenshots for the owner (as a before-and-after where it helps): Settings in landscape and portrait, People and a person's page, PINs and parent mode, the PIN sheet on the kitchen account, the parent-mode strip, and setup's steps. Then the demo message: what's in it, what they're looking at, the finishing menu, "Rulings I made", and "Deferred minors". Wait for the go-ahead before any merge.
