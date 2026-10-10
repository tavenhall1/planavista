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
