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
