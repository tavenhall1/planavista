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
    "request_closed": "That request closed when the chore's time ran out.",
    "unknown_reward": "That reward isn't in the catalog.",
    "invalid_on_board": "Show on the board is on or off.",
    "invalid_needs_ok": "Needs a parent's approval is on or off.",
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
    "not_missed": "That chore wasn't missed, or it was already excused.",
    "not_for_member": "That reward isn't one they can get.",
    "not_enough_stars": "Not enough stars yet.",
    "reason_required": "Add a reason.",
    "too_many": "There are too many to add another.",
    "changed": "This changed on another screen.",
}

# Mistakes with their own translated message in strings.json; every other rule
# reads "{reason}" through invalid_chore.
OWN_TRANSLATIONS = frozenset(
    {"unknown_member", "unknown_chore", "unknown_request", "request_closed", "unknown_reward", "not_enough_stars"}
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


def credit_by(household: Household, account: Account, doer: str) -> None:
    """Crediting `doer` with someone else's chore is theirs to say too (round 1): a parent, whose
    check-offs need no approval, takes parent level; anyone else is a member-level change to them."""
    member = household.member(doer) or {}
    if member.get("parent"):
        parent_by(account)
    else:
        member_by(household, account, doer)


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
