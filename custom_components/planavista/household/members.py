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
