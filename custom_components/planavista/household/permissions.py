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
