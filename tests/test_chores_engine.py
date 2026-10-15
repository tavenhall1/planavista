"""Check-offs, approvals, requests, overrides, plan edits, and stars (spec 8.3 to 8.8, 8.12, 8.15)."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta
from unittest.mock import patch

import pytest

from custom_components.planavista.chores import engine as engine_module
from custom_components.planavista.chores.engine import ChoresEngine, with_away, without_away
from custom_components.planavista.chores.model import ChoreError

from .chores_sample import MEMBERS, SCENE, TZ, at, keys, once, plan, repeats, sample_engine

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


def test_a_check_off_after_its_due_time_counts_while_it_shows() -> None:
    """Round 5 (r5a A4): the board shows it, "Due today", until its day ends, so a check-off counts
    until then (it said Done and changed nothing); the next chore day it's gone."""
    def engine() -> object:
        return sample_engine(activities=[
            once("forms", "Sign the school forms", ["alex"], by="2026-10-14", by_time="08:00", estimate_minutes=10),
        ])
    late = engine().complete(at(10, 14, 9), key="forms|alex|once|0", by="alex", source="tablet")
    assert late.result == "done"
    next_day = engine().complete(at(10, 15, 9), key="forms|alex|once|0", by="alex", source="tablet")
    assert next_day.result == "nothing_open"


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
        "missed_if_sent_back": False,
        "stays_excused": False,
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


@pytest.mark.parametrize("chore", [
    once("sort_the_socks", "Sort the socks", ["dana"]),
    once("wash_the_car", "Wash the car", ["dana"], sessions=2),
    repeats("water_the_fern", "Water the fern", ["dana"], "FREQ=DAILY;COUNT=1", "2026-10-13", "day", 10),
])
def test_sending_back_a_once_or_last_repeat_reopens_it(chore: dict) -> None:
    """Round 7 (r7a A1): a waiting check-off finished a Once chore (or a Repeats chore's last time),
    and sending it back never reopened it, so it left every list and could never be redone."""
    engine = sample_engine(activities=[chore])
    mine = [k for k in keys(engine, "dana", SCENE) if k.startswith(chore["id"])]
    for key in mine:
        assert engine.complete(SCENE, key=key, by="dana", source="tablet").result == "pending"
    last = mine[-1]
    request = next(r for r in engine.open_requests() if r["occurrence"] == last)
    assert engine.review(SCENE, request_id=request["id"], allow=False, by="blair", note="Not finished").result == "sent_back"
    assert engine.activity(chore["id"])["finished_at"] is None
    assert _item(engine, last).status == "sent_back"
    assert engine.complete(SCENE + timedelta(minutes=5), key=last, by="dana", source="tablet").result == "pending"


def test_deleting_a_chore_withdraws_its_waiting_check_offs() -> None:
    """Round 7 (r7a A2): it stayed in To approve under its id, and approving it, or the 3 AM
    approval, still gave its stars."""
    engine = sample_engine(activities=[once("dust_the_shelf", "Dust the shelf", ["dana"])], settings={"auto_approve": "day_end"})
    engine.complete(SCENE, key="dust_the_shelf|dana|once|0", by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.delete_activity("dust_the_shelf", now=SCENE)
    assert engine.open_requests() == []
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert err.value.code == "request_withdrawn"
    engine.catch_up(at(10, 14, 9))
    assert engine.balance("dana") == 0
    assert engine.chore_minutes("dana") == 0
    # Added again under the same name, it gets its own id and starts fresh, not "waiting" (round 8).
    out = engine.save_activity(at(10, 14, 9), {"name": "Dust the shelf", "schedule": "once", "assignees": ["dana"], "once": {}}, by="alex", source="tablet")
    assert _item(engine, f"{out.data['activity']['id']}|dana|once|0", at(10, 14, 9)).status == "open"


def test_a_check_off_unchecked_while_a_parent_answers_says_so() -> None:
    """Round 7 (r7a A4): a check-off the child unchecked during the PIN was "already answered"."""
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.undo(SCENE, key=FISH, by="dana", source="tablet")
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request["id"], allow=True, by="blair")
    assert err.value.code == "request_withdrawn"


def test_a_chore_added_under_a_deleted_ones_name_starts_fresh() -> None:
    """Round 8 (r8a A1): it took the deleted chore's id, and with it its check-offs, sent-back notes,
    excuses, and open requests: it arrived done, couldn't be checked off, and finished itself at 3 AM."""
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.review(SCENE, request_id=request["id"], allow=False, by="blair", note="The lid")
    engine.request(SCENE, kind="more_time", key=FISH, by="dana", until=date(2026, 10, 14))
    engine.delete_activity("feed_the_fish", now=SCENE)
    out = engine.save_activity(SCENE, {"name": "Feed the fish", "schedule": "plan", "assignees": ["dana"],
                                       "minimum": {"hours": 5 / 60, "per": "day"}}, by="alex", source="tablet")
    new_id = out.data["activity"]["id"]
    assert new_id != "feed_the_fish"
    item = _item(engine, f"{new_id}|dana|day:2026-10-13|0")
    assert (item.status, engine.item_view(item, SCENE.date()).get("note")) == ("open", None)
    assert engine.open_requests() == []
    assert engine.complete(SCENE, key=item.occ.key, by="dana", source="tablet").result == "pending"


def test_a_deleted_chore_done_today_leaves_the_board() -> None:
    """Round 8 (r8a A4): it stayed on the board and the to-do list under its id, counted in the ring."""
    engine = sample_engine()
    assert engine.complete(SCENE, key=TRASH, by="casey", source="tablet").result == "done"
    stars = engine.balance("casey")
    engine.delete_activity("take_out_the_trash", now=SCENE)
    assert TRASH not in keys(engine, "casey", SCENE)
    assert engine.balance("casey") == stars


def test_a_deleted_chores_past_days_keep_its_name() -> None:
    """Round 10 (r10b M5): its past rows rebuilt the name from its id ("Tv time") and lost its picture."""
    tv = {**plan("tv_time", "TV time", ["casey"], 0.5, "day"), "icon": "📺"}
    engine = sample_engine(activities=[tv])
    engine.complete(SCENE, key="tv_time|casey|day:2026-10-13|0", by="casey", source="tablet")
    engine.catch_up(at(10, 14, 9))
    engine.delete_activity("tv_time", now=at(10, 14, 9))
    rows = engine.day_view(at(10, 14, 10), date(2026, 10, 13))["members"]["casey"]["items"]
    [row] = [r for r in rows if r["chore"] == "tv_time"]
    assert (row["name"], row["icon"]) == ("TV time", "📺")


def test_an_edit_that_leaves_something_owed_reopens_a_finished_chore() -> None:
    """Round 8 (r8a A3): a finished Once chore given a second session stayed finished, off the board."""
    engine = sample_engine(activities=[once("fix_the_gate", "Fix the gate", ["alex"], by="2026-10-16")])
    engine.complete(SCENE, key="fix_the_gate|alex|once|0", by="alex", source="tablet")
    assert engine.activity("fix_the_gate")["finished_at"] is not None
    engine.save_activity(SCENE, {"once": {"by": "2026-10-16", "sessions": 2}}, by="alex", source="tablet", activity_id="fix_the_gate")
    assert engine.activity("fix_the_gate")["finished_at"] is None
    assert _item(engine, "fix_the_gate|alex|once|1").status == "open"
    # An edit that leaves nothing owed keeps it finished.
    engine.complete(SCENE, key="fix_the_gate|alex|once|1", by="alex", source="tablet")
    engine.save_activity(SCENE, {"name": "Fix the garden gate"}, by="alex", source="tablet", activity_id="fix_the_gate")
    assert engine.activity("fix_the_gate")["finished_at"] is not None


def test_a_sent_back_chore_handed_to_someone_else_is_theirs_to_do_fresh() -> None:
    """Round 8 (r8a A5): the new person's tile showed the first child's sent-back note."""
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.review(SCENE, request_id=request["id"], allow=False, by="blair", note="Dana, the lid")
    engine.override(SCENE, key=FISH, by="blair", assignee="casey")
    item = next(i for i in engine.items(SCENE)["casey"] if i.occ.key == FISH)
    assert item.status == "open"
    assert engine.item_view(item, SCENE.date()).get("note") is None


def _summary(engine: ChoresEngine, member: str, period: str) -> dict:
    return next(s for s in engine.log["summaries"] if s["member"] == member and s["period"] == period)


@pytest.mark.parametrize("policy", ["make_up", "strict", "carry_over"])
def test_a_check_off_sent_back_after_its_day_counts_as_the_missed_rule_says(policy: str) -> None:
    """Round 8 (r8a A2): sent back the next morning, it never came back, and its day kept
    counting it as done ("Ring closed: 5 of 5" over 3 rows)."""
    engine = sample_engine(settings={"auto_approve": "never", "missed": policy})
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.catch_up(at(10, 14, 9))
    day = _summary(engine, "dana", "day:2026-10-13")
    pending = day["pending"]
    out = engine.review(at(10, 14, 10), request_id=request["id"], allow=False, by="blair", note="The lid")
    assert out.result == "sent_back"
    assert day["pending"] == pending - 1
    assert day["closed"] is False
    assert day["chores"]["feed_the_fish"]["done"] == 0
    if policy == "carry_over":
        assert FISH in day["carried"] and FISH not in day["missed"]
        item = _item(engine, FISH, at(10, 14, 10))
        assert (item.section, item.status) == ("overdue", "sent_back")
    else:
        assert FISH in day["missed"]
        assert [e.data["occurrence"] for e in out.events if e.type == "missed"] == [FISH]


def test_a_check_off_sent_back_after_its_week_revises_the_week() -> None:
    """Round 8 (r8a A2): the week's summary counted it too, and the doer's minutes."""
    engine = sample_engine(settings={"auto_approve": "never", "missed": "strict"})
    sunday = "feed_the_fish|dana|day:2026-10-18|0"
    engine.complete(at(10, 18, 19), key=sunday, by="dana", source="tablet")
    request = next(r for r in engine.open_requests() if r["occurrence"] == sunday)
    engine.catch_up(at(10, 19, 9))
    week = _summary(engine, "dana", "week:2026-10-12")
    pending, minutes = week["pending"], week["contribution"]["minutes"]
    credit = next(c for c in engine.log["completions"] if c["id"] == request["id"])["credit_minutes"]
    engine.review(at(10, 19, 10), request_id=request["id"], allow=False, by="blair")
    assert week["pending"] == pending - 1
    assert sunday in week["missed"]
    assert week["closed"] is False
    assert week["contribution"]["minutes"] == round(minutes - credit, 2)
    # Listed once, not once per summary.
    assert week["missed"].count(sunday) == 1


@pytest.mark.parametrize("policy", ["make_up", "carry_over"])
def test_a_set_day_chore_sent_back_the_next_day_leaves_its_day_open(policy: str) -> None:
    """Round 9 (r9a A2): its day counted it as waiting and stayed closed ("6 of 6"), with no row for it."""
    ferns = plan("water_the_ferns", "Water the ferns", ["dana"], 0.25, "week", days=["tue"])
    engine = sample_engine(activities=[ferns], settings={"auto_approve": "never", "missed": policy})
    key = "water_the_ferns|dana|week:2026-10-12|0"
    assert engine.complete(SCENE, key=key, by="dana", source="tablet").result == "pending"
    request = next(r for r in engine.open_requests() if r["occurrence"] == key)
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert (tuesday["pending"], tuesday["closed"]) == (1, True)
    engine.review(at(10, 14, 10), request_id=request["id"], allow=False, by="blair", note="Leaves are dry")
    assert (tuesday["pending"], tuesday["closed"]) == (0, False)
    assert key in tuesday["open"] and key not in tuesday["missed"]
    # The week is still running: it's this week's to do again, and Tuesday's sheet says so, with the note.
    assert _item(engine, key, at(10, 14, 10)).status == "sent_back"
    row = next(i for i in engine.day_view(at(10, 14, 10), date(2026, 10, 13))["members"]["dana"]["items"] if i["key"] == key)
    assert (row["status"], row.get("note")) == ("open", "Leaves are dry")


def test_an_overdue_copy_sent_back_the_next_day_leaves_that_day_open() -> None:
    """Round 9 (r9a A2): under Carry it over, the day the overdue copy was checked off stayed "closed, 1 waiting"."""
    engine = sample_engine(settings={"auto_approve": "never", "missed": "carry_over"})
    engine.catch_up(at(10, 14, 9))  # nobody fed the fish on Tuesday: carried
    assert _item(engine, FISH, at(10, 14, 9)).section == "overdue"
    engine.complete(at(10, 14, 18), key=FISH, by="dana", source="tablet")
    request = next(r for r in engine.open_requests() if r["occurrence"] == FISH)
    engine.catch_up(at(10, 15, 9))
    wednesday = _summary(engine, "dana", "day:2026-10-14")
    pending = wednesday["pending"]
    engine.review(at(10, 15, 10), request_id=request["id"], allow=False, by="blair")
    assert wednesday["pending"] == pending - 1 and wednesday["closed"] is False and FISH in wednesday["open"]
    item = _item(engine, FISH, at(10, 15, 10))
    assert (item.section, item.status) == ("overdue", "sent_back")


def test_an_overdue_chore_can_be_handed_on_but_keeps_its_date() -> None:
    """Round 9 (r9a A3): Hand it to someone else, Change the due date, and more time said yes and changed nothing."""
    engine = sample_engine(settings={"missed": "carry_over"})
    engine.catch_up(at(10, 14, 9))
    now = at(10, 14, 10)
    for change in ({"due": date(2026, 10, 16)}, {"planned_day": date(2026, 10, 15)}):
        with pytest.raises(ChoreError) as err:
            engine.override(now, key=FISH, by="blair", **change)
        assert err.value.code == "overdue_stays"
    with pytest.raises(ChoreError) as err:
        engine.request(now, kind="more_time", key=FISH, by="dana", until=date(2026, 10, 16))
    assert err.value.code == "overdue_stays"
    engine.override(now, key=FISH, by="blair", assignee="casey")
    item = next(i for i in engine.items(now)["casey"] if i.occ.key == FISH)
    assert (item.section, item.status) == ("overdue", "open")
    assert FISH not in [i.occ.key for i in engine.items(now)["dana"]]
    engine.complete(now, key=FISH, by="casey", source="tablet")
    engine.catch_up(at(10, 16, 9))
    assert FISH not in [i.occ.key for m in engine.items(at(10, 16, 9)).values() for i in m]


def test_a_handed_chore_drops_the_first_persons_request_and_a_done_one_stays() -> None:
    """Round 9 (r9a A4, A5): a hand-off kept Casey's skip request on Dana's chore; a done one handed on vanished."""
    engine = sample_engine()
    request = engine.request(SCENE, kind="skip", key=TRASH, by="casey").data["request"]
    engine.override(SCENE, key=TRASH, by="blair", assignee="dana")
    assert [r for r in engine.open_requests() if r["id"] == request] == []
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request, allow=True, by="blair")
    assert err.value.code == "request_handed_on"  # its own words since round 10
    engine.complete(SCENE, key=CAT_MORNING, by="casey", source="tablet")
    with pytest.raises(ChoreError) as err:
        engine.override(SCENE, key=CAT_MORNING, by="blair", assignee="dana")
    assert err.value.code == "not_open"


def test_a_deleted_chores_past_rows_read_as_words() -> None:
    """Round 9 (r9a A6): the day sheet listed "wipe_the_counters"."""
    engine = sample_engine()
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.delete_activity("feed_the_fish", now=SCENE)
    assert engine._past_item(FISH, "done")["name"] == "Feed the fish"
    assert engine._past_item("feed_the_fish_2|dana|day:2026-10-13|0", "done")["name"] == "Feed the fish"


def test_renaming_a_once_chore_missed_at_the_rollover_keeps_it_finished() -> None:
    """Round 9 (r9a A7): a rename reopened it until 3 AM, in Settings' active list with nothing on the board."""
    engine = sample_engine(activities=[once("fix_the_gate", "Fix the gate", ["alex"], by="2026-10-13")])
    engine.catch_up(at(10, 14, 9))
    finished = engine.activity("fix_the_gate")["finished_at"]
    assert finished is not None
    engine.save_activity(at(10, 14, 10), {"name": "Fix the garden gate"}, by="alex", source="tablet", activity_id="fix_the_gate")
    assert engine.activity("fix_the_gate")["finished_at"] == finished


def test_the_inbox_knows_when_sending_back_counts_as_missed() -> None:
    """Round 9 (r9b B2): a late send-back said "went back" and the child never saw it."""
    for policy, expected in (("make_up", True), ("carry_over", False)):
        engine = sample_engine(settings={"auto_approve": "never", "missed": policy})
        engine.complete(SCENE, key=FISH, by="dana", source="tablet")
        [today] = [r for r in engine.open_requests(SCENE) if r["occurrence"] == FISH]
        assert today["missed_if_sent_back"] is False
        [later] = [r for r in engine.open_requests(at(10, 14, 10)) if r["occurrence"] == FISH]
        assert later["missed_if_sent_back"] is expected


def test_excusing_a_missed_chore_says_whether_the_day_closes() -> None:
    """Round 9 (r9b B3): "Y's streak holds" while the day still had another miss."""
    engine = sample_engine(activities=[
        plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day"),
        plan("tidy_toys", "Tidy toys", ["dana"], 0.25, "day"),
        plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day"),
    ])
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    first = engine.excuse_missed(at(10, 14, 10), key=FISH, by="blair")
    assert first.data["streak_holds"] is False  # Tidy toys is still missed
    second = engine.excuse_missed(at(10, 14, 10), key="tidy_toys|dana|day:2026-10-13|0", by="blair")
    assert second.data["streak_holds"] is True


@pytest.mark.parametrize("chore", [
    once("water_the_ferns", "Water the ferns", ["dana"], on="2026-10-13"),
    repeats("water_the_ferns", "Water the ferns", ["dana"], "FREQ=DAILY;COUNT=1", "2026-10-13", "day", 10),
])
def test_excusing_a_missed_one_off_chore_closes_its_day(chore: dict) -> None:
    """Round 10 (r10a C1): the rollover finished it, so excusing it later never closed its day."""
    fish = plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")
    engine = sample_engine(activities=[fish, chore])
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert tuesday["closed"] is False
    [key] = [k for k in tuesday["missed"] + tuesday["open"] if k.startswith("water_the_ferns")]
    out = engine.excuse_missed(at(10, 14, 10), key=key, by="blair")
    assert (tuesday["due"], tuesday["closed"], out.data["streak_holds"]) == (1, True, True)


def test_a_late_send_back_under_carry_over_leaves_later_days_alone() -> None:
    """Round 10 (r10a I1): sent back two days late, it reopened a closed day that never counted it."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")],
                           settings={"auto_approve": "never", "missed": "carry_over"})
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    [tuesdays] = engine.open_requests()
    engine.catch_up(at(10, 14, 9))
    wed_key = "feed_the_fish|dana|day:2026-10-14|0"
    engine.complete(at(10, 14, 18), key=wed_key, by="dana", source="tablet")
    wednesdays = next(r for r in engine.open_requests() if r["occurrence"] == wed_key)
    engine.review(at(10, 14, 19), request_id=wednesdays["id"], allow=True, by="blair")
    engine.catch_up(at(10, 15, 9))
    wednesday = _summary(engine, "dana", "day:2026-10-14")
    before = {k: wednesday[k] for k in ("due", "done", "pending", "closed")}
    engine.review(at(10, 15, 10), request_id=tuesdays["id"], allow=False, by="blair")
    assert {k: wednesday[k] for k in ("due", "done", "pending", "closed")} == before == {"due": 1, "done": 1, "pending": 0, "closed": True}
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert FISH in tuesday["carried"] and tuesday["closed"] is False
    assert engine.streak("dana", at(10, 15, 10)) >= 1


def test_a_one_off_chore_sent_back_after_its_date_is_missed_on_its_date() -> None:
    """Round 10 (r10a I2): the inbox said "went back", the day it was checked off kept it waiting,
    and no day counted it missed."""
    recycling = once("sort_the_recycling", "Sort the recycling", ["casey"], by="2026-10-15", needs_ok=True)
    engine = sample_engine(activities=[recycling], settings={"auto_approve": "never"})
    key = "sort_the_recycling|casey|once|0"
    assert engine.complete(SCENE, key=key, by="casey", source="tablet").result == "pending"
    engine.catch_up(at(10, 16, 9))
    # Due by Thursday, it counts on Thursday, not on the day it was checked off (round 11: the same
    # whether or not the check-off finished the chore).
    tuesday = _summary(engine, "casey", "day:2026-10-13")
    assert (tuesday["due"], tuesday["pending"]) == (0, 0)
    [request] = [r for r in engine.open_requests(at(10, 16, 10)) if r["occurrence"] == key]
    assert request["missed_if_sent_back"] is True
    engine.review(at(10, 16, 10), request_id=request["id"], allow=False, by="blair")
    assert (tuesday["due"], tuesday["pending"]) == (0, 0) and key not in tuesday["keys"]
    thursday = _summary(engine, "casey", "day:2026-10-15")
    assert key in thursday["missed"] and thursday["closed"] is False


def test_excusing_an_overdue_chore_closes_the_day_it_was_carried_from() -> None:
    """Round 10 (r10a I3): Excuse it on the overdue tile said the streak holds, and its day stayed open."""
    engine = sample_engine(activities=[
        plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day"),
        plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day"),
    ], settings={"missed": "carry_over"})
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert FISH in tuesday["carried"] and tuesday["closed"] is False
    engine.override(at(10, 14, 10), key=FISH, by="blair", excused=True)
    assert (tuesday["due"], tuesday["closed"]) == (1, True)
    assert FISH in tuesday["excused"] and FISH not in tuesday["carried"]


def test_excusing_a_past_day_by_the_action_closes_it() -> None:
    """Round 10 (r10a M1): excuse_chore with a past date answered excused and changed nothing that counts."""
    engine = sample_engine(activities=[
        plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day"),
        plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day"),
    ])
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    engine.excuse(at(10, 14, 10), chore="feed_the_fish", member="dana", by="blair", day=date(2026, 10, 13))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert (tuesday["due"], tuesday["closed"]) == (1, True)


@pytest.mark.parametrize("policy", ["make_up", "carry_over"])
def test_a_repeats_chores_last_time_sent_back_late_reopens_its_day(policy: str) -> None:
    """Round 11 (r11a I1): its check-off finished the chore, so its day counted it only as a check-off;
    sent back later, it left that day, whose ring stayed closed. The same chore with times to come reopened it."""
    found = []
    for count in (1, 3):
        engine = sample_engine(activities=[repeats(
            "water_the_ferns", "Water the ferns", ["dana"], f"FREQ=WEEKLY;BYDAY=TU;COUNT={count}", "2026-10-13", "day", 10,
        )], settings={"auto_approve": "never", "missed": policy})
        key = next(i.occ.key for i in engine.items(SCENE)["dana"] if i.occ.chore == "water_the_ferns")
        engine.complete(SCENE, key=key, by="dana", source="tablet")
        engine.catch_up(at(10, 16, 9))
        [request] = engine.open_requests()
        engine.review(at(10, 16, 9), request_id=request["id"], allow=False, by="blair")
        tuesday = _summary(engine, "dana", "day:2026-10-13")
        found.append({k: tuesday.get(k) for k in ("due", "done", "pending", "closed", "open", "missed", "carried")})
    assert found[0] == found[1]
    assert found[0]["closed"] is False


def test_excusing_a_date_leaves_other_days_overdue_copies_alone() -> None:
    """Round 11 (r11a I2): excuse_chore for Tuesday also excused Wednesday's overdue copy, and a date ahead today's."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")], settings={"missed": "carry_over"})
    engine.catch_up(at(10, 15, 9))
    wednesdays = "feed_the_fish|dana|day:2026-10-14|0"
    out = engine.excuse(at(10, 15, 10), chore="feed_the_fish", member="dana", by="blair", day=date(2026, 10, 13))
    assert out.data["occurrences"] == [FISH]
    wednesday = _summary(engine, "dana", "day:2026-10-14")
    assert wednesday["closed"] is False and wednesdays in wednesday["carried"]
    ahead = engine.excuse(at(10, 15, 10), chore="feed_the_fish", member="dana", by="blair", day=date(2026, 10, 17))
    assert wednesdays not in ahead.data["occurrences"]


def test_excusing_on_a_day_without_keys_closes_it_too() -> None:
    """Round 11 (r11a M3): Excuse it in a chore's options skipped days written before they kept their keys."""
    ferns = plan("water_the_ferns", "Water the ferns", ["dana"], 0.25, "week", days=["tue"])
    engine = sample_engine(activities=[ferns, plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day")])
    key = "water_the_ferns|dana|week:2026-10-12|0"
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    tuesday.pop("keys")  # written before summaries kept their keys
    assert key in tuesday["open"] and tuesday["due"] == 2
    engine.override(at(10, 14, 10), key=key, by="blair", excused=True)
    assert (tuesday["due"], tuesday["closed"]) == (1, True) and key in tuesday["excused"]


def test_deleting_a_chore_takes_its_waiting_check_off_out_of_earlier_days() -> None:
    """Round 11 (r11a M4): the day still counted it as waiting, while its sheet no longer listed it."""
    engine = sample_engine(activities=[
        plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day"),
        plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day"),
    ], settings={"auto_approve": "never"})
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert (tuesday["due"], tuesday["pending"]) == (2, 2)
    engine.delete_activity("feed_the_fish", now=at(10, 14, 10))
    assert (tuesday["due"], tuesday["pending"], tuesday["closed"]) == (1, 1, True)


def test_a_deleted_chores_stars_keep_its_name() -> None:
    """Round 11 (r11a M5): Stars history said "A chore" once the chore was deleted."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")])
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.catch_up(at(10, 14, 9))
    engine.delete_activity("feed_the_fish", now=at(10, 14, 10))
    assert [e["name"] for e in engine.star_history("dana") if e["reason"] == "chore"] == ["Feed the fish"]


def test_a_missed_one_time_chore_stays_in_its_week() -> None:
    """Round 11 (r11a M6): the rollover finished it, and the week's numbers forgot it the next day."""
    engine = sample_engine(activities=[once("fix_the_porch_light", "Fix the porch light", ["alex"], on="2026-10-14")])
    before = engine.board(at(10, 14, 10))["members"]["alex"]["week"]["due"]
    engine.catch_up(at(10, 15, 9))
    assert engine.activity("fix_the_porch_light")["finished_at"] is not None
    assert engine.board(at(10, 15, 9))["members"]["alex"]["week"]["due"] == before == 1


def test_excusing_a_days_only_miss_says_the_streak_holds() -> None:
    """Round 11 (r11a M7): the day had nothing left to count, so it never read as closed."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")], settings={"missed": "strict"})
    engine.catch_up(at(10, 14, 9))
    out = engine.excuse_missed(at(10, 14, 10), key=FISH, by="blair")
    assert out.data["streak_holds"] is True


def test_an_allowed_skip_stays_excused_when_its_check_off_is_sent_back_late() -> None:
    """Round 12 (r12a I1): the parent allowed the skip, the check-off was sent back the next day,
    and the day reopened with it missed, the streak lost and a missed event."""
    engine = sample_engine(activities=[
        plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day"),
        plan("make_your_bed", "Make your bed", ["dana"], 0.1, "day"),
    ], settings={"auto_approve": "never"})
    engine.request(SCENE, kind="skip", key=FISH, by="dana")
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.complete(SCENE, key="make_your_bed|dana|day:2026-10-13|0", by="dana", source="tablet")
    [skip] = [r for r in engine.open_requests() if r["kind"] == "skip"]
    engine.review(SCENE, request_id=skip["id"], allow=True, by="blair")
    engine.catch_up(at(10, 14, 9))
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert tuesday["closed"] is True
    [check_off] = [r for r in engine.open_requests(at(10, 14, 10)) if r["kind"] == "completion" and r["occurrence"] == FISH]
    assert check_off["missed_if_sent_back"] is False and check_off["stays_excused"] is True
    out = engine.review(at(10, 14, 10), request_id=check_off["id"], allow=False, by="blair")
    assert tuesday["closed"] is True and FISH not in tuesday["missed"] and FISH not in tuesday["carried"]
    assert "missed" not in [e.type for e in out.events]


def test_a_one_time_chore_finished_early_counts_on_its_due_day() -> None:
    """Round 12 (r12a M1): finished before its day, it counted on no day at all."""
    recycling = once("sort_the_recycling", "Sort the recycling", ["casey"], by="2026-10-15")
    engine = sample_engine(activities=[recycling])
    engine.complete(SCENE, key="sort_the_recycling|casey|once|0", by="casey", source="tablet")
    assert engine.activity("sort_the_recycling")["finished_at"] is not None
    engine.catch_up(at(10, 16, 9))
    thursday = _summary(engine, "casey", "day:2026-10-15")
    assert (thursday["due"], thursday["done"] + thursday["pending"]) == (1, 1)


def test_last_weeks_overdue_copy_done_this_week_stays_out_of_its_numbers() -> None:
    """Round 12 (r12a M2): under Carry it over, Sunday's copy done on Monday joined this week overnight."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")], settings={"missed": "carry_over"})
    engine.catch_up(at(10, 19, 9))
    engine.complete(at(10, 19, 10), key="feed_the_fish|dana|day:2026-10-18|0", by="dana", source="tablet")
    monday = engine.board(at(10, 19, 11))["members"]["dana"]["week"]
    engine.catch_up(at(10, 20, 9))
    tuesday = engine.board(at(10, 20, 9))["members"]["dana"]["week"]
    assert (tuesday["due"], tuesday["done"]) == (monday["due"], monday["done"])


@pytest.mark.parametrize("policy", ["make_up", "carry_over"])
def test_a_check_off_on_an_away_day_sent_back_late_stays_away(policy: str) -> None:
    """Round 13 (r13a I1): an away day owes nothing, yet its check-off sent back late became a miss (or was carried)."""
    engine = sample_engine(activities=[plan("feed_the_fish", "Feed the fish", ["dana"], 0.1, "day")],
                           settings={"auto_approve": "never", "missed": policy})
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.member("dana")["away"] = [{"from": "2026-10-13", "to": "2026-10-13", "note": "At Grandma's"}]
    engine.catch_up(at(10, 14, 9))
    [check_off] = [r for r in engine.open_requests(at(10, 14, 10)) if r["kind"] == "completion"]
    assert check_off["missed_if_sent_back"] is False and check_off["stays_excused"] is True
    out = engine.review(at(10, 14, 10), request_id=check_off["id"], allow=False, by="blair")
    tuesday = _summary(engine, "dana", "day:2026-10-13")
    assert FISH not in tuesday["missed"] and FISH not in tuesday["carried"]
    assert "missed" not in [e.type for e in out.events]
    assert not engine.log["carried"]


def test_a_finished_one_time_chore_edited_into_a_plan_chore_shows_again() -> None:
    """Round 13 (r13a I2): it kept its finished mark, so it never showed on the board again."""
    engine = sample_engine(activities=[once("fix_the_gate", "Fix the gate", ["alex"], by="2026-10-16")])
    engine.complete(SCENE, key="fix_the_gate|alex|once|0", by="alex", source="tablet")
    assert engine.activity("fix_the_gate")["finished_at"] is not None
    engine.save_activity(SCENE, {"schedule": "plan", "minimum": {"hours": 0.25, "per": "day"}},
                         by="alex", source="tablet", activity_id="fix_the_gate")
    assert engine.activity("fix_the_gate")["finished_at"] is None
    assert "fix_the_gate|alex|day:2026-10-13|0" in keys(engine, "alex", SCENE)


@pytest.mark.parametrize(("chore", "key"), [
    (plan("water_the_ferns", "Water the ferns", ["dana"], 0.25, "week", days=["sun"]), "water_the_ferns|dana|week:2026-10-12|0"),
    (once("hang_the_shelf", "Hang the shelf", ["dana"], by="2026-10-16"), "hang_the_shelf|dana|once|0"),
])
def test_last_weeks_overdue_copy_of_any_chore_done_this_week_stays_out_of_its_numbers(chore: dict, key: str) -> None:
    """Round 13 (r13a M1): round 12 kept only a daily chore's overdue copy out of the later week."""
    engine = sample_engine(activities=[chore], settings={"missed": "carry_over"})
    engine.catch_up(at(10, 19, 9))
    assert any(c["key"] == key for c in engine.log["carried"])
    engine.complete(at(10, 19, 10), key=key, by="dana", source="tablet")
    monday = engine.board(at(10, 19, 11))["members"]["dana"]["week"]
    engine.catch_up(at(10, 20, 9))
    tuesday = engine.board(at(10, 20, 9))["members"]["dana"]["week"]
    assert (tuesday["due"], tuesday["done"]) == (monday["due"], monday["done"])


def test_a_last_time_given_more_time_counts_in_its_new_due_week() -> None:
    """Round 13 (r13a M2): its later due day was lost once the check-off finished the chore."""
    windows = repeats("wash_the_windows", "Wash the windows", ["casey"], "FREQ=WEEKLY;COUNT=1", "2026-10-15", "period", 30)
    engine = sample_engine(activities=[windows])
    engine.catch_up(at(10, 15, 9))
    key = next(i.occ.key for i in engine.items(at(10, 15, 9))["casey"] if i.occ.chore == "wash_the_windows")
    engine.request(at(10, 15, 9), kind="more_time", key=key, by="casey", until=date(2026, 10, 20))
    [ask] = [r for r in engine.open_requests() if r["kind"] == "more_time"]
    engine.review(at(10, 15, 9), request_id=ask["id"], allow=True, by="blair")
    engine.catch_up(at(10, 19, 9))
    engine.complete(at(10, 19, 10), key=key, by="casey", source="tablet")
    engine.catch_up(at(10, 26, 9))
    counted = {s["period"]: s["keys"][key][0] for s in engine.log["summaries"] if s["member"] == "casey" and key in (s.get("keys") or {})}
    # Any time that week, due Tuesday now: done, in its new week, and on no day's ring (Monday counted it).
    assert counted == {"week:2026-10-19": "done"}


def test_a_request_withdrawn_by_a_hand_off_says_so() -> None:
    """Round 10 (r10a M2): it was refused with the words for an unchecked check-off."""
    engine = sample_engine()
    request = engine.request(SCENE, kind="skip", key=TRASH, by="casey").data["request"]
    engine.override(SCENE, key=TRASH, by="blair", assignee="dana")
    with pytest.raises(ChoreError) as err:
        engine.review(SCENE, request_id=request, allow=True, by="blair")
    assert err.value.code == "request_handed_on"


def test_ids_named_only_in_a_summary_stay_taken() -> None:
    """Round 10 (r10a M3): a weekly chore missed at its week's end, deleted and added again, took its id."""
    engine = sample_engine()
    engine.catch_up(at(10, 19, 9))  # the week is over: Yard work was never done
    engine.delete_activity("yard_work", now=at(10, 19, 10))
    assert "yard_work" in engine.ids_in_log()


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


def test_a_reward_already_asked_for_is_not_asked_for_twice() -> None:
    """Milestone 10 review B3: the reveal's Ask for it filed a second ask while one waited."""
    engine = sample_engine()
    engine.award_stars(SCENE, member="casey", stars=8, reason="Great week", by="alex")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎲", "cost": 4, "who": ["casey", "dana"]})
    engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    with pytest.raises(ChoreError) as err:
        engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    assert err.value.code == "already_asked"
    assert len(engine.open_requests()) == 1


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
    engine.save_reward({"name": "Movie night pick", "icon": "🎬", "cost": 2})
    assert engine.redeem(SCENE, member="casey", reward="movie_night_pick", by="admin", source="phone").result == "requested"


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

def test_an_occurrences_time_runs_out_with_its_day_its_week_or_its_repeat() -> None:
    """Round 4 (r4a A1): only then does a check-off that finds nothing say "The day had ended."."""
    engine = sample_engine()
    assert engine.period_over("feed_the_fish|dana|day:2026-10-12|0", SCENE) is True
    assert engine.period_over("feed_the_fish|dana|day:2026-10-13|0", SCENE) is False
    assert engine.period_over("take_out_the_trash|casey|week:2026-10-12|0", SCENE) is False
    assert engine.period_over("take_out_the_trash|casey|week:2026-10-05|0", SCENE) is True
    assert engine.period_over("pack_for_camp|casey|once|0", SCENE) is False
    assert engine.period_over("not a key", SCENE) is True


def test_an_occurrences_time_follows_its_own_due() -> None:
    """Round 5 (r5a A3): a strict pinned day and a dated Once chore said "changed on another screen" after their day."""
    tuesday = at(10, 13, 9)
    strict = sample_engine(at(10, 12, 9), settings={"missed": "strict"})
    assert strict.period_over("laundry|blair|week:2026-10-12|0", tuesday) is True
    make_up = sample_engine(at(10, 12, 9))
    assert make_up.period_over("laundry|blair|week:2026-10-12|0", tuesday) is False
    dated = sample_engine(activities=[
        once("water_the_garden", "Water the garden", ["dana"], on="2026-10-12"),
        once("sweep_the_porch", "Sweep the porch", ["casey"], by="2026-10-13"),
        once("sort_the_shed", "Sort the shed", ["casey"]),
    ])
    assert dated.period_over("water_the_garden|dana|once|0", tuesday) is True
    assert dated.period_over("sweep_the_porch|casey|once|0", tuesday) is False
    assert dated.period_over("sweep_the_porch|casey|once|0", at(10, 14, 9)) is True
    assert dated.period_over("sort_the_shed|casey|once|0", at(10, 30, 9)) is False


def test_an_occurrences_time_runs_out_after_the_rollover_finished_it() -> None:
    """Round 6 (r6a A2): the 3 AM rollover finishes a missed dated Once chore, so the plan no longer
    makes it, and a check-off queued across 3 AM said "changed on another screen"; so did the next
    day's Undo of a Once chore with no date done the day before."""
    dated = sample_engine(activities=[
        once("water_the_garden", "Water the garden", ["dana"], on="2026-10-13"),
        once("sweep_the_porch", "Sweep the porch", ["casey"], by="2026-10-13", sessions=2),
        once("sort_the_shed", "Sort the shed", ["alex"]),
    ])
    dated.complete(SCENE, key="sort_the_shed|alex|once|0", by="alex", source="tablet")
    wednesday = at(10, 14, 9)
    dated.catch_up(wednesday)
    assert dated.period_over("water_the_garden|dana|once|0", wednesday) is True
    assert dated.period_over("sweep_the_porch|casey|once|1", wednesday) is True
    assert dated.period_over("sort_the_shed|alex|once|0", wednesday) is True
    # Turned off the board by a parent: that is a change, not the day ending.
    plain = sample_engine(activities=[once("pack", "Pack for camp", ["casey"], by="2026-10-20")])
    plain.save_activity(SCENE, {"on_board": False}, by="alex", source="tablet", activity_id="pack")
    assert plain.period_over("pack|casey|once|0", SCENE) is False


def test_a_once_chore_past_its_time_can_still_be_checked_off_while_it_shows() -> None:
    """Round 5 (r5a A4): "Return library books, by 6 PM", held at 6:34 PM, said Done and stayed open."""
    engine = sample_engine(activities=[once("library_books", "Return library books", ["casey"], by="2026-10-13", by_time="15:00")])
    key = "library_books|casey|once|0"
    assert engine.find_item(key, SCENE) is not None  # 4:10 PM: still on the board, "Due today"
    out = engine.complete(SCENE, key=key, by="casey", source="tablet")
    assert out.result in ("done", "waiting")
    assert engine.undo(SCENE, key=key, by="casey", source="tablet").result == "undone"
    assert engine.complete(SCENE, key=key, by="casey", source="tablet").result in ("done", "waiting")
