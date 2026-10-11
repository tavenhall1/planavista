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
