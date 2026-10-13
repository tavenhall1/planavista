"""Check-offs, approvals, requests, overrides, plan edits, and stars (spec 8.3 to 8.8, 8.12, 8.15)."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
from unittest.mock import patch

import pytest

from custom_components.planavista.chores import engine as engine_module
from custom_components.planavista.chores.engine import ChoresEngine, with_away, without_away
from custom_components.planavista.chores.model import ChoreError

from .chores_sample import MEMBERS, SCENE, TZ, at, keys, once, plan, sample_engine

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"
YARD = "yard_work|casey|week:2026-10-12|0"
CAT_MORNING = "cat_care|casey|day:2026-10-13|0"
CAT_EVENING = "cat_care|casey|day:2026-10-13|1"


def _item(engine: ChoresEngine, key: str, now=SCENE):  # noqa: ANN001, ANN202
    item = engine.find_item(key, now)
    assert item is not None, key
    return item


def test_an_automation_completes_the_oldest_open_one() -> None:
    engine = sample_engine()
    out = engine.complete(at(10, 13, 19, 40), chore="take_out_the_trash", member="casey", by="automation", source="automation")
    assert (out.result, out.data["occurrence"], out.data["stars"]) == ("done", TRASH, 1)
    completion = engine.log["completions"][-1]
    assert completion | {"id": None} == {
        "id": None, "occurrence": TRASH, "chore": "take_out_the_trash", "member": "casey", "done_by": "casey",
        "by": "automation", "at": "2026-10-13T19:40:00-05:00", "source": "automation", "user": None,
        "state": "done", "review": None, "credit_minutes": 15.0, "stars": 1,
    }
    assert engine.balance("casey") == 1
    assert engine.chore_minutes("casey") == 15.0
    assert [(e.type, e.member, e.data["state"]) for e in out.events] == [("completed", "casey", "done")]
    assert out.changed == {"log", "rewards"}


def test_the_oldest_open_one_is_overdue_then_today_then_this_week() -> None:
    engine = sample_engine()
    first = engine.complete(at(10, 13, 7), chore="cat_care", member="casey", by="automation", source="automation")
    later = engine.complete(at(10, 13, 19), chore="cat_care", member="casey", by="automation", source="automation")
    assert (first.data["occurrence"], later.data["occurrence"]) == (CAT_MORNING, CAT_EVENING)
    # Laundry from Monday waits in This week; Thursday's isn't open yet.
    out = engine.complete(SCENE, chore="laundry", member="blair", by="blair", source="tablet")
    assert out.data["occurrence"] == "laundry|blair|week:2026-10-12|0"


def test_a_repeat_within_a_minute_is_a_no_op() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 7, 0), chore="cat_care", member="casey", by="automation", source="automation")
    again = engine.complete(at(10, 13, 7, 0) + timedelta(seconds=40), chore="cat_care", member="casey", by="automation", source="automation")
    assert (again.result, again.data["occurrence"], again.events) == ("already_done", CAT_MORNING, [])
    assert engine.balance("casey") == 1


def test_the_same_occurrence_twice_credits_once() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, key=TRASH, by="casey", source="tablet").result == "done"
    again = engine.complete(SCENE + timedelta(hours=1), key=TRASH, by="automation", source="automation")
    assert (again.result, again.events, again.changed) == ("already_done", [], set())
    assert engine.balance("casey") == 1


def test_nothing_open_is_not_an_error() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, chore="groceries", member="alex", by="automation", source="automation").result == "nothing_open"
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    later = engine.complete(SCENE + timedelta(minutes=5), chore="take_out_the_trash", member="casey", by="automation", source="automation")
    assert later.result == "already_done"
    yesterday = "cat_care|casey|day:2026-10-12|0"
    assert engine.complete(SCENE, key=yesterday, by="casey", source="tablet").result == "nothing_open"


def test_a_check_off_after_its_due_time_is_too_late() -> None:
    engine = sample_engine(activities=[
        once("forms", "Sign the school forms", ["alex"], by="2026-10-14", by_time="08:00", estimate_minutes=10),
    ])
    out = engine.complete(at(10, 14, 9), key="forms|alex|once|0", by="alex", source="tablet")
    assert out.result == "nothing_open"


def test_who_needs_an_ok() -> None:
    engine = sample_engine()
    assert engine.complete(SCENE, key=FISH, by="dana", source="tablet").result == "pending"  # every chore
    assert engine.complete(SCENE, key=TRASH, by="casey", source="tablet").result == "done"  # not marked
    bathroom = "clean_the_bathroom|casey|week:2026-10-12|0"
    assert engine.complete(SCENE, key=bathroom, by="casey", source="tablet").result == "pending"  # marked
    assert engine.complete(SCENE, key="clean_the_bathroom|blair|week:2026-10-12|0", by="blair", source="tablet").result == "done"
    bed = "make_your_bed|dana|day:2026-10-13|0"
    assert engine.complete(SCENE, key=bed, by="automation", source="automation", approve=True).result == "done"


def test_done_by_someone_else_credits_the_doer() -> None:
    engine = sample_engine()
    out = engine.complete(SCENE, key=TRASH, done_by="blair", by="blair", source="tablet")
    assert out.result == "done"
    assert out.data["stars"] == 0  # Blair doesn't earn stars
    assert engine.chore_minutes("blair") == 15.0 and engine.chore_minutes("casey") == 0
    assert _item(engine, TRASH).status == "done"
    with pytest.raises(ChoreError) as err:
        engine.complete(SCENE, key=CAT_MORNING, done_by="erin", by="casey", source="tablet")
    assert err.value.code == "unknown_member"


def test_approving_grants_the_stars() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    assert engine.balance("dana") == 0
    [request] = engine.open_requests()
    assert request | {"id": None} == {
        "id": None, "kind": "completion", "member": "dana", "done_by": "dana", "chore": "feed_the_fish",
        "name": "Feed the fish", "occurrence": FISH, "at": "2026-10-13T16:10:00-05:00", "stars": 1,
    }
    out = engine.review(SCENE + timedelta(minutes=20), request_id=request["id"], allow=True, by="alex", source="notification")
    assert out.result == "approved"
    assert engine.balance("dana") == 1
    assert engine.log["completions"][-1]["review"] == {
        "by": "alex", "at": "2026-10-13T16:30:00-05:00", "note": None, "source": "notification",
    }
    assert [e.type for e in out.events] == ["approved"]
    assert engine.open_requests() == []


def test_sending_back_reopens_it_with_the_note() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    out = engine.review(SCENE, request_id=request["id"], allow=False, by="blair", note="edges")
    assert out.result == "sent_back"
    item = _item(engine, FISH)
    assert item.status == "sent_back"
    assert engine.item_view(item, SCENE.date())["note"] == "edges"
    assert engine.description(item, SCENE.date()) == "Sent back: edges"
    assert engine.chore_minutes("dana") == 0
    assert engine.complete(SCENE + timedelta(minutes=5), key=FISH, by="dana", source="tablet").result == "pending"


def test_undo_reverses_only_what_that_check_off_earned() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    out = engine.undo(SCENE + timedelta(minutes=1), key=TRASH, by="casey", source="tablet")
    assert out.result == "undone"
    assert engine.balance("casey") == 0
    assert [e["reason"] for e in engine.rewards["ledger"]] == ["chore", "undo"]
    assert engine.log["completions"][-1]["state"] == "undone"
    assert _item(engine, TRASH).status == "open"
    assert [e.type for e in out.events] == ["undone"]
    assert engine.undo(SCENE, key=TRASH, by="casey", source="tablet").result == "nothing_to_undo"


def test_undo_of_a_check_off_waiting_for_ok_takes_nothing() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.undo(SCENE, chore="feed_the_fish", member="dana", by="dana", source="tablet")
    assert engine.rewards["ledger"] == []
    assert engine.open_requests() == []


def test_only_todays_check_offs_can_be_undone() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=YARD, by="casey", source="tablet")
    wednesday = at(10, 14, 9)
    engine.catch_up(wednesday)
    assert engine.undo(wednesday, key=YARD, by="casey", source="tablet").result == "nothing_to_undo"


def test_asking_for_more_time_moves_the_due_date_when_allowed() -> None:
    engine = sample_engine()
    out = engine.request(SCENE, kind="more_time", key=YARD, by="casey", until=date(2026, 10, 25))
    assert engine.request(SCENE, kind="more_time", key=YARD, by="casey", until=date(2026, 10, 25)).data == out.data
    [request] = engine.open_requests()
    assert (request["kind"], request["until"], request["name"]) == ("more_time", "2026-10-25", "Yard work")
    engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert _item(engine, YARD).occ.due.isoformat() == "2026-10-26T03:00:00-05:00"
    for until in (date(2026, 10, 18), date(2026, 12, 31), None):
        with pytest.raises(ChoreError) as err:
            engine.request(SCENE, kind="more_time", key=TRASH, by="casey", until=until)
        assert err.value.code == "invalid_until"


def test_asking_to_skip_excuses_it_when_allowed() -> None:
    engine = sample_engine()
    engine.request(SCENE, kind="skip", key=YARD, by="casey")
    [request] = engine.open_requests()
    assert engine.review(SCENE, request_id=request["id"], allow=False, by="alex").result == "declined"
    assert _item(engine, YARD).status == "open"
    engine.request(SCENE, kind="skip", key=YARD, by="casey")
    [request] = engine.open_requests()
    assert engine.review(SCENE, request_id=request["id"], allow=True, by="alex").result == "allowed"
    assert _item(engine, YARD).status == "excused"
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="alex")
    assert err.value.code == "unknown_request"


def test_requests_need_an_open_item() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    with pytest.raises(ChoreError) as err:
        engine.request(SCENE, kind="skip", key=TRASH, by="casey")
    assert err.value.code == "not_open"


def test_a_request_closes_when_its_chore_is_missed() -> None:
    engine = sample_engine()
    request = engine.request(SCENE, kind="more_time", key=FISH, by="dana", until=date(2026, 10, 15)).data["request"]
    out = engine.catch_up(at(10, 14, 9))  # nobody answered before the day ended
    assert [e.data["occurrence"] for e in out.events if e.type == "missed"].count(FISH) == 1
    assert engine.open_requests() == []
    with pytest.raises(ChoreError) as err:
        engine.review(at(10, 14, 10), request_id=request, allow=True, by="alex")
    assert err.value.code == "request_closed"
    out = engine.catch_up(at(10, 16, 9))
    assert FISH not in [e.data["occurrence"] for e in out.events if e.type == "missed"]


def test_a_request_stays_open_while_its_chore_is_still_due() -> None:
    engine = sample_engine()
    engine.request(SCENE, kind="skip", key=YARD, by="casey")
    engine.catch_up(at(10, 15, 9))
    assert [r["occurrence"] for r in engine.open_requests()] == [YARD]
    engine.catch_up(at(10, 19, 9))  # the week is over
    assert engine.open_requests() == []


def test_planning_a_day_stays_within_the_week() -> None:
    engine = sample_engine()
    for day in (date(2026, 10, 12), date(2026, 10, 19)):
        with pytest.raises(ChoreError) as err:
            engine.override(SCENE, key=YARD, by="casey", planned_day=day)
        assert err.value.code == "invalid_planned_day"
    with pytest.raises(ChoreError) as err:
        engine.override(SCENE, key=YARD, by="alex")
    assert err.value.code == "nothing_to_change"


def test_excusing_a_sick_day() -> None:
    engine = sample_engine()
    out = engine.excuse(SCENE, chore="cat_care", member="casey", by="blair", note="Sick day")
    assert out.data["occurrences"] == [CAT_MORNING, CAT_EVENING]
    assert {_item(engine, k).status for k in (CAT_MORNING, CAT_EVENING)} == {"excused"}
    tomorrow = engine.excuse(SCENE, chore="cat_care", member="casey", by="blair", day=date(2026, 10, 14))
    assert tomorrow.data["occurrences"] == ["cat_care|casey|day:2026-10-14|0", "cat_care|casey|day:2026-10-14|1"]


def test_a_new_chore_gets_an_id_and_its_creator() -> None:
    engine = sample_engine()
    out = engine.save_activity(SCENE, {"name": "Laundry", "schedule": "once", "assignees": ["casey"],
                                       "once": {"estimate_minutes": 20}}, by="alex", source="tablet")
    activity = out.data["activity"]
    assert activity["id"] == "laundry_2"
    assert activity["created"] == {"by": "alex", "source": "tablet", "at": "2026-10-13T16:10:00-05:00"}
    assert "laundry_2|casey|once|0" in keys(engine, "casey", SCENE)
    with pytest.raises(ChoreError) as err:
        engine.save_activity(SCENE, {"name": "Late", "schedule": "once", "assignees": [],
                                     "once": {"on": "2026-10-12"}}, by="alex", source="tablet")
    assert (err.value.code, err.value.detail) == ("invalid_once", "Pick today or a later day.")


def test_an_edit_applies_to_open_items_and_keeps_check_offs() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=CAT_EVENING, by="casey", source="tablet")
    rev = engine.activity("cat_care")["rev"]
    engine.save_activity(SCENE, {"times": 1, "time_of_day": ["morning"]}, activity_id="cat_care", rev=rev, by="alex", source="tablet")
    found = {i.occ.key: i for i in engine.items(SCENE)["casey"]}
    assert found[CAT_MORNING].occ.credit_minutes == 30.0
    assert found[CAT_EVENING].status == "done" and found[CAT_EVENING].occ.credit_minutes == 15.0
    with pytest.raises(ChoreError) as err:
        engine.save_activity(SCENE, {"times": 2}, activity_id="cat_care", rev=rev, by="alex", source="tablet")
    assert err.value.code == "changed"


def test_deleting_a_chore_drops_its_open_items() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    engine.delete_activity("yard_work")
    assert YARD not in keys(engine, "casey", SCENE)
    assert engine.balance("casey") == 1
    with pytest.raises(ChoreError):
        engine.delete_activity("yard_work")


def test_removing_someone_unassigns_their_chores() -> None:
    engine = sample_engine()
    engine.unassign_member("casey")
    engine.set_members([m for m in engine.members if m["id"] != "casey"])
    bathroom = engine.activity("clean_the_bathroom")
    assert (bathroom["assignees"], bathroom["shares"], bathroom["minimum"]["hours"]) == (["blair"], {"blair": 1.0}, 1.0)
    assert engine.activity("yard_work")["assignees"] == []
    assert {"kind": "unassigned", "chore": "yard_work", "name": "Yard work"} in engine.needs_a_look()
    assert "casey" not in engine.items(SCENE)


def test_a_once_chore_finishes_with_its_last_session() -> None:
    engine = sample_engine()
    garage = engine.activity("clean_out_the_garage")
    engine.complete(SCENE, key="clean_out_the_garage|casey|once|0", by="casey", source="tablet")
    assert garage["finished_at"] is None
    out = engine.complete(SCENE, key="clean_out_the_garage|casey|once|1", by="casey", source="tablet")
    assert garage["finished_at"] == "2026-10-13T16:10:00-05:00" and "plan" in out.changed
    # It stays in Done today until the day ends, then leaves the board.
    later = [(i.occ.key, i.status) for i in engine.items(SCENE + timedelta(hours=1))["casey"] if i.occ.chore == "clean_out_the_garage"]
    assert later == [("clean_out_the_garage|casey|once|0", "pending"), ("clean_out_the_garage|casey|once|1", "pending")]
    assert not [k for k in keys(engine, "casey", at(10, 14, 9)) if k.startswith("clean_out")]
    engine.undo(SCENE, key="clean_out_the_garage|casey|once|1", by="casey", source="tablet")
    assert garage["finished_at"] is None


def test_rewards_wait_for_an_ok_and_take_the_stars_when_given() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=5, reason="Helped a neighbor", by="blair")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎲", "cost": 4, "who": ["casey", "dana"]})
    out = engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    assert out.result == "requested"
    [request] = engine.open_requests()
    assert (request["kind"], request["cost"], request["balance"]) == ("redemption", 4, 5)
    assert engine.balance("casey") == 5
    given = engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert given.result == "given" and engine.balance("casey") == 1
    assert [(e.type, e.data["reward_name"], e.data["stars"]) for e in given.events] == [("redeemed", "Pick the weekend game", 4)]
    with pytest.raises(ChoreError) as err:
        engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    assert err.value.code == "not_enough_stars"


def test_a_reward_without_an_ok_is_given_at_once() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Great week", by="alex")
    engine.save_reward({"name": "Sticker", "cost": 2, "needs_ok": False})
    out = engine.redeem(SCENE, member="dana", reward="sticker", by="dana", source="tablet")
    assert out.result == "given" and engine.balance("dana") == 1
    assert engine.open_requests() == []
    with pytest.raises(ChoreError) as err:
        engine.redeem(SCENE, member="blair", reward="sticker", by="blair", source="tablet")
    assert err.value.code == "not_enough_stars"


def test_a_parent_who_redeems_for_a_child_gives_it_at_once() -> None:
    """Round 2: Alex redeemed for Dana from their own phone, was told "A parent will answer.",
    and then had to approve their own ask in the inbox."""
    engine = sample_engine()
    engine.award_stars(SCENE, member="dana", stars=5, reason="Great week", by="alex")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎲", "cost": 4, "who": ["casey", "dana"]})
    out = engine.redeem(SCENE, member="dana", reward="pick_the_weekend_game", by="alex", source="phone")
    assert out.result == "given" and engine.balance("dana") == 1
    assert engine.open_requests() == []
    [given] = [r for r in engine.rewards["redemptions"] if r["member"] == "dana"]
    assert given["review"]["by"] == "alex"
    # A child's own ask, or an account that is nobody in the household, still waits for a parent.
    engine.award_stars(SCENE, member="casey", stars=8, reason="Great week", by="alex")
    assert engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet").result == "requested"
    assert engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="admin", source="phone").result == "requested"


def test_stars_by_hand_need_a_reason_and_never_go_below_zero() -> None:
    engine = sample_engine()
    assert engine.award_stars(SCENE, member="casey", stars=5, reason="Helped a neighbor", by="blair").data == {"balance": 5}
    assert engine.award_stars(SCENE, member="casey", stars=-2, reason="Left the bike out", by="blair").data == {"balance": 3}
    for stars, reason, code in ((-4, "Too many", "not_enough_stars"), (0, "Nothing", "invalid_stars"), (2, " ", "reason_required")):
        with pytest.raises(ChoreError) as err:
            engine.award_stars(SCENE, member="casey", stars=stars, reason=reason, by="blair")
        assert err.value.code == code


def test_a_redemption_waits_until_approved_and_checks_the_balance_again() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=4, reason="Bonus", by="blair")
    engine.save_reward({"name": "Movie night pick", "cost": 4})
    engine.redeem(SCENE, member="casey", reward="movie_night_pick", by="casey", source="tablet")
    engine.award_stars(SCENE, member="casey", stars=-1, reason="Oops", by="blair")
    [request] = engine.open_requests()
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert err.value.code == "not_enough_stars"


def test_deleting_a_reward_declines_what_was_waiting() -> None:
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=4, reason="Bonus", by="blair")
    engine.save_reward({"name": "Movie night pick", "cost": 4})
    engine.redeem(SCENE, member="casey", reward="movie_night_pick", by="casey", source="tablet")
    engine.delete_reward("movie_night_pick")
    assert engine.open_requests() == []
    assert engine.balance("casey") == 4


def test_the_to_do_list_puts_open_items_first_and_keeps_todays_check_offs() -> None:
    engine = sample_engine()
    engine.complete(SCENE, key=CAT_MORNING, by="casey", source="tablet")
    engine.complete(SCENE, key="clean_the_bathroom|casey|week:2026-10-12|0", by="casey", source="tablet")
    items = engine.todo_items("casey", SCENE)
    assert [(i.occ.key, i.status) for i in items] == [
        ("clean_out_the_garage|casey|once|0", "open"),
        ("clean_out_the_garage|casey|once|1", "open"),
        (CAT_EVENING, "open"),
        (TRASH, "open"),
        (YARD, "open"),
        (CAT_MORNING, "done"),
        ("clean_the_bathroom|casey|week:2026-10-12|0", "pending"),
    ]
    today = SCENE.date()
    assert [engine.description(i, today) for i in items] == [
        "Due Sun", "Due Sun", None, None, "This week", None, "Waiting for a parent's approval",
    ]


def test_away_ranges_join_and_split() -> None:
    spans = with_away([], date(2026, 10, 14), date(2026, 10, 15), "At Grandma's")
    spans = with_away(spans, date(2026, 10, 16), date(2026, 10, 17), None)
    assert spans == [{"from": "2026-10-14", "to": "2026-10-17", "note": "At Grandma's"}]
    assert without_away(spans, date(2026, 10, 16), None) == [{"from": "2026-10-14", "to": "2026-10-15", "note": "At Grandma's"}]
    assert without_away(spans, date(2026, 10, 15), date(2026, 10, 15)) == [
        {"from": "2026-10-14", "to": "2026-10-14", "note": "At Grandma's"},
        {"from": "2026-10-16", "to": "2026-10-17", "note": "At Grandma's"},
    ]


def test_a_household_without_chores_is_quiet() -> None:
    engine = sample_engine(activities=[plan("x", "X", [], 1, "day")])
    board = engine.board(SCENE)
    assert board["household"] == {"due": 0, "done": 0, "pending": 0}
    assert board["members"]["casey"]["week"]["percent"] is None


def _busy_household() -> tuple[ChoresEngine, list[str]]:
    """Eight people and forty chores, with 90 days of everyone doing everything (about 10,500 check-offs)."""
    members = [{"id": f"p{n}", "name": f"Person {n}", "parent": n < 2, "age_group": "teen", "needs_ok_for": "marked",
                "stars": True, "order": n} for n in range(8)]
    ids = [m["id"] for m in members]
    daily = [plan(f"daily_{n}", f"Daily {n}", ids[n % 8: n % 8 + 2], 0.5, "day", times=2, time_of_day=["morning", "evening"])
             for n in range(25)]
    weekly = [plan(f"weekly_{n}", f"Weekly {n}", ids[:4], 2, "week", split="shared",
                   shares={i: 0.5 for i in ids[:4]}, days=["mon", "thu"]) for n in range(15)]
    engine = sample_engine(activities=daily + weekly, members=members)
    history = engine.log["completions"]
    for back in range(90, 0, -1):
        day = SCENE.date() - timedelta(days=back)
        week = day - timedelta(days=day.weekday())
        done = [(a, m, f"day:{day}|{t}") for a in daily for m in a["assignees"] for t in range(2)]
        if day.weekday() in (0, 3):
            done += [(a, m, f"week:{week}|{day.weekday() // 3}") for a in weekly for m in a["assignees"]]
        stamp = datetime.combine(day, time(18), tzinfo=TZ).isoformat()
        for activity, member, period in done:
            history.append({
                "id": f"h{len(history)}", "occurrence": f"{activity['id']}|{member}|{period}", "chore": activity["id"],
                "member": member, "done_by": member, "by": member, "at": stamp, "source": "tablet", "user": None,
                "state": "done", "review": None, "credit_minutes": 15.0, "stars": 1,
            })
    return engine, ids


def test_a_busy_household_stays_quick() -> None:  # Review Focus 1
    import time as wall

    engine, ids = _busy_household()
    assert len(engine.log["completions"]) > 10_000
    engine.items(SCENE)  # Home Assistant has been running a while
    with patch.object(engine_module, "_at", wraps=engine_module._at) as parsed:
        engine.items(SCENE)
    assert parsed.call_count < 50  # working out a day doesn't read every check-off again
    runs = 0
    items_on = ChoresEngine._items_on

    def counted(self: ChoresEngine, day: date, index: object) -> object:
        nonlocal runs
        runs += 1
        return items_on(self, day, index)

    started = wall.perf_counter()
    with patch.object(ChoresEngine, "_items_on", counted):
        engine.complete(SCENE, chore="daily_0", member="p0", by="p0", source="tablet")
        items = engine.items(SCENE)
        board = engine.board(SCENE, items=items)
        lists = {member: engine.todo_items(member, SCENE, items=items) for member in ids}
    assert wall.perf_counter() - started < 1.0
    assert runs <= 8  # the check-off, today once, and the week's other days
    for member in ids:
        shown = [i["key"] for i in board["members"][member]["items"]]
        listed = [i.occ.key for i in lists[member]]
        assert len(shown) == len(set(shown)) and len(listed) == len(set(listed))
    assert sum(len(m["items"]) for m in board["members"].values()) > 100


def test_a_chore_someone_who_isnt_a_parent_added_waits_for_a_parent() -> None:
    members = [dict(m, needs_ok_for="none") if m["id"] == "casey" else m for m in MEMBERS]
    engine = sample_engine(activities=[], members=members)
    engine.save_activity(SCENE, {"name": "Brush teeth", "schedule": "once", "assignees": ["casey"], "needs_ok": True,
                                 "needs_ok_always": True, "once": {}}, by="casey", source="phone")
    out = engine.complete(SCENE, chore="brush_teeth", member="casey", by="casey", source="phone")
    assert out.result == "pending"  # though Casey's own check-offs need no approval
    engine.catch_up(at(10, 14, 9))
    assert engine.log["completions"][-1]["state"] == "pending"  # the day's end leaves it for a parent
    assert engine.balance("casey") == 0
    engine.review(at(10, 14, 9), request_id=out.data["completion"], allow=True, by="alex")
    assert engine.balance("casey") == 1
