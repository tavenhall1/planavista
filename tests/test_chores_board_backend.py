"""What the chores board asks of the backend (spec 13): history, a day, late excuses, and the feed's extras."""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.chores.status import describe

from .chores_sample import SCENE, at, sample_engine
from .conftest import set_pin, ws_client_for, ws_command

STATUS = json.loads((Path(__file__).parent / "fixtures" / "chores_status.json").read_text("utf-8"))
TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
CAT_MONDAY_EVENING = "cat_care|casey|day:2026-10-12|1"


@pytest.mark.parametrize("case", STATUS["cases"], ids=lambda case: case["name"])
def test_status_words_follow_the_shared_table(case: dict[str, Any]) -> None:
    assert describe(case["view"], date.fromisoformat(STATUS["today"])) == case["todo"]


def test_history_tells_a_weekly_chores_streak_and_when_it_usually_gets_done() -> None:
    engine = sample_engine(at(9, 14, 9))
    for day in (19, 26):
        engine.catch_up(at(9, day, 14))
        engine.complete(at(9, day, 14), chore="yard_work", member="casey", by="casey", source="tablet")
    for day in (3, 10):
        engine.catch_up(at(10, day, 14))
        engine.complete(at(10, day, 14), chore="yard_work", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    history = engine.history(SCENE, "yard_work", "casey")
    assert history["streak"] == {"weeks": 4}
    assert history["weeks"] == {"done": 4, "of": 6}
    assert history["usual"] == {"band": "afternoon", "day": "sat"}
    assert [r["at"][:10] for r in history["recent"]] == ["2026-10-10", "2026-10-03", "2026-09-26", "2026-09-19"]


def test_history_counts_a_daily_chore_in_days() -> None:
    engine = sample_engine(at(10, 8, 7))
    for day in range(8, 13):
        engine.catch_up(at(10, day, 7))
        engine.complete(at(10, day, 7), chore="cat_care", member="casey", by="casey", source="tablet")
        engine.complete(at(10, day, 19), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    history = engine.history(SCENE, "cat_care", "casey")
    assert history["streak"] == {"days": 5}
    assert history["usual"]["day"] is None
    with pytest.raises(ChoreError) as err:
        engine.history(SCENE, "no_such_chore", "casey")
    assert err.value.code == "unknown_chore"


def test_a_past_day_comes_from_its_summary_and_the_log() -> None:
    engine = sample_engine(at(10, 12, 7))
    engine.complete(at(10, 12, 7, 5), key="cat_care|casey|day:2026-10-12|0", by="casey", source="tablet")
    engine.catch_up(SCENE)
    monday = engine.day_view(SCENE, date(2026, 10, 12))
    casey = monday["members"]["casey"]
    assert monday["kind"] == "past"
    assert sorted((i["key"], i["status"]) for i in casey["items"]) == [
        ("cat_care|casey|day:2026-10-12|0", "done"),
        (CAT_MONDAY_EVENING, "missed"),
    ]
    assert casey["summary"] == {"due": 2, "done": 1, "pending": 0, "closed": False}
    today = engine.day_view(SCENE, date(2026, 10, 13))
    assert today["kind"] == "today"
    assert [i["key"] for i in today["members"]["casey"]["items"]] == [
        "cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1", TRASH,
    ]


def test_the_week_names_what_was_missed() -> None:
    engine = sample_engine(at(10, 12, 7))
    engine.complete(at(10, 12, 7, 5), key="cat_care|casey|day:2026-10-12|0", by="casey", source="tablet")
    engine.catch_up(SCENE)
    monday = engine.week_view(SCENE)["members"]["casey"]["days"][0]
    assert (monday["date"], monday["missed"]) == ("2026-10-12", 1)
    assert monday["missed_items"] == [
        {"key": CAT_MONDAY_EVENING, "chore": "cat_care", "name": "Cat care", "icon": None, "status": "missed"},
    ]


def test_excusing_a_missed_check_off_mends_its_day_and_the_streak() -> None:
    engine = sample_engine(at(10, 11, 7))
    engine.complete(at(10, 11, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.complete(at(10, 11, 19), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(at(10, 12, 7))
    engine.complete(at(10, 12, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    assert engine.streak("casey", SCENE) == 0
    out = engine.excuse_missed(SCENE, key=CAT_MONDAY_EVENING, by="blair", note="Sick day")
    assert (out.result, out.data, out.changed) == ("excused", {"occurrence": CAT_MONDAY_EVENING}, {"log"})
    assert engine.streak("casey", SCENE) == 2
    monday = engine.day_view(SCENE, date(2026, 10, 12))["members"]["casey"]
    assert monday["summary"] == {"due": 1, "done": 1, "pending": 0, "closed": True}
    assert (CAT_MONDAY_EVENING, "excused") in {(i["key"], i["status"]) for i in monday["items"]}
    with pytest.raises(ChoreError) as err:
        engine.excuse_missed(SCENE, key=CAT_MONDAY_EVENING, by="blair")
    assert err.value.code == "not_missed"



@pytest.mark.parametrize("begins", ["created", "assigned_since"])
def test_excusing_a_day_from_before_the_chore_began_still_mends_it(begins: str) -> None:
    """Round 1 (adversarial review): history older than a chore's start (its created time, an assignee
    added later, chores turned off and on) can't be worked out again, so the excuse left "0 of 1"."""
    engine = sample_engine(at(10, 11, 7))
    engine.complete(at(10, 11, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.complete(at(10, 11, 19), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(at(10, 12, 7))
    engine.complete(at(10, 12, 7), chore="cat_care", member="casey", by="casey", source="tablet")
    engine.catch_up(SCENE)
    cat = next(a for a in engine.plan["activities"] if a["id"] == "cat_care")
    if begins == "created":
        cat["created"] = dict(cat["created"], at="2026-10-13T08:00:00-05:00")
    else:
        cat["assigned_since"] = {"casey": "2026-10-13T08:00:00-05:00"}
    assert engine._past_occurrence(CAT_MONDAY_EVENING) is None  # the history this test is about
    engine.excuse_missed(SCENE, key=CAT_MONDAY_EVENING, by="blair", note="Sick day")
    monday = next(s for s in engine.log["summaries"] if s.get("member") == "casey" and s.get("period") == "day:2026-10-12")
    assert (monday["due"], monday["done"], monday["closed"]) == (1, 1, True)
    assert engine.streak("casey", SCENE) == 2


YARD = "yard_work|casey|week:2026-10-12|0"


def _rows(view: dict[str, Any], member: str) -> set[tuple[str, str]]:
    return {(i["key"], i["status"]) for i in view["members"][member]["items"]}


def test_excusing_a_weekly_chore_missed_at_the_week_end_leaves_that_days_ring_alone() -> None:
    engine = sample_engine(at(10, 18, 7))
    engine.complete(at(10, 18, 7), key="cat_care|casey|day:2026-10-18|0", by="casey", source="tablet")
    engine.catch_up(at(10, 19, 9))
    before = engine.day_view(at(10, 19, 9), date(2026, 10, 18))["members"]["casey"]["summary"]
    streak = engine.streak("casey", at(10, 19, 9))
    assert before["closed"] is False
    engine.excuse_missed(at(10, 19, 9), key=YARD, by="blair")
    sunday = engine.day_view(at(10, 19, 9), date(2026, 10, 18))
    assert sunday["members"]["casey"]["summary"] == before
    assert {(YARD, "excused"), ("cat_care|casey|day:2026-10-18|1", "missed")} <= _rows(sunday, "casey")
    assert engine.streak("casey", at(10, 19, 9)) == streak


def test_a_make_up_chore_shows_on_its_day_and_excusing_it_mends_that_day() -> None:
    engine = sample_engine(at(10, 13, 7))
    for n in (0, 1):
        engine.complete(at(10, 13, 8), key=f"cat_care|casey|day:2026-10-13|{n}", by="casey", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = engine.day_view(at(10, 14, 9), date(2026, 10, 13))
    assert tuesday["members"]["casey"]["summary"] == {"due": 3, "done": 2, "pending": 0, "closed": False}
    assert (TRASH, "open") in _rows(tuesday, "casey")
    engine.catch_up(at(10, 19, 9))
    assert (TRASH, "missed") in _rows(engine.day_view(at(10, 19, 9), date(2026, 10, 13)), "casey")
    engine.excuse_missed(at(10, 19, 9), key=TRASH, by="blair", note="Sick day")
    tuesday = engine.day_view(at(10, 19, 9), date(2026, 10, 13))
    assert tuesday["members"]["casey"]["summary"] == {"due": 2, "done": 2, "pending": 0, "closed": True}
    assert (TRASH, "excused") in _rows(tuesday, "casey")
    sunday = engine.day_view(at(10, 19, 9), date(2026, 10, 18))
    assert (TRASH, "excused") in _rows(sunday, "casey")


BED_TUESDAY = "make_your_bed|dana|day:2026-10-13|0"


def _item(engine: Any, member: str, key: str, now: Any) -> dict[str, Any]:
    day = engine.today(now)
    return next(engine.item_view(i, day) for i in engine.items(now)[member] if i.occ.key == key)


def test_more_time_on_a_chore_for_today_lets_todays_ring_close() -> None:
    engine = sample_engine(at(10, 13, 7))
    request = engine.request(
        at(10, 13, 7), kind="more_time", key=BED_TUESDAY, by="dana", until=date(2026, 10, 14)
    ).data["request"]
    engine.review(at(10, 13, 8), request_id=request, allow=True, by="blair")
    bed = _item(engine, "dana", BED_TUESDAY, at(10, 13, 9))
    assert (bed["due_day"], bed["planned"], bed["dated"], bed["counted"]) == ("2026-10-14", None, True, False)
    for item in [i for i in engine.items(at(10, 13, 9))["dana"] if i.counted]:
        engine.complete(at(10, 13, 9), key=item.occ.key, by="blair", source="tablet")
    engine.catch_up(at(10, 14, 9))
    tuesday = engine.day_view(at(10, 14, 9), date(2026, 10, 13))["members"]["dana"]
    assert tuesday["summary"]["closed"] is True
    assert _item(engine, "dana", BED_TUESDAY, at(10, 14, 9))["counted"] is True


def test_the_board_tells_this_weeks_stars_and_recent_rewards() -> None:
    engine = sample_engine()
    engine.complete(at(10, 11, 8), chore="cat_care", member="casey", by="casey", source="tablet")  # last week
    engine.complete(SCENE, key=TRASH, by="casey", source="tablet")
    engine.complete(SCENE, key="cat_care|casey|day:2026-10-13|1", by="casey", source="tablet")
    engine.undo(SCENE, key="cat_care|casey|day:2026-10-13|1", by="casey", source="tablet")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎮", "cost": 1, "needs_ok": True})
    request = engine.redeem(SCENE, member="casey", reward="pick_the_weekend_game", by="casey", source="tablet").data["request"]
    engine.review(SCENE, request_id=request, allow=True, by="blair", source="tablet")
    board = engine.board(SCENE)
    assert board["members"]["casey"]["week_stars"] == 1
    assert board["members"]["dana"]["week_stars"] == 0
    assert board["recent_redemptions"] == [{
        "id": request, "member": "casey", "reward": "pick_the_weekend_game", "name": "Pick the weekend game",
        "cost": 1, "at": "2026-10-13T16:10:00-05:00", "by": "blair",
    }]


# The card's commands -----------------------------------------------------------------------


async def test_the_day_and_history_commands(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    day = await ws_command(client, {"type": "planavista/chores/day", "date": "2026-10-13"})
    assert day["result"]["kind"] == "today"
    assert {i["chore"] for i in day["result"]["members"]["casey"]["items"]} == {"cat_care", "take_out_the_trash"}
    history = await ws_command(client, {"type": "planavista/chores/history", "chore": "yard_work", "member": "casey"})
    assert history["result"]["streak"] == {"weeks": 0}
    unknown = await ws_command(client, {"type": "planavista/chores/history", "chore": "nope", "member": "casey"})
    assert unknown["error"] == {"code": "unknown_chore", "message": "That chore isn't in the plan."}


async def test_excusing_a_missed_one_is_a_parents(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    chores.engine.log["summaries"].append({
        "member": "casey", "period": "day:2026-10-12", "due": 2, "done": 1, "pending": 0,
        "minutes_due": 30.0, "minutes_done": 15.0, "minutes_pending": 0.0, "missed": [CAT_MONDAY_EVENING],
        "carried": [], "excused": [], "away": False, "closed": False, "chores": {"cat_care": {"due": 2, "done": 1}},
    })
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    refused = await ws_command(casey, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING})
    assert refused["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    reply = await ws_command(alex, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING, "note": "Sick"})
    assert reply["result"] == {"result": "excused", "occurrence": CAT_MONDAY_EVENING}
    again = await ws_command(alex, {"type": "planavista/chores/excuse_missed", "occurrence": CAT_MONDAY_EVENING})
    assert again["error"] == {"code": "not_missed", "message": "That chore wasn't missed, or it was already excused."}


async def test_a_person_picks_their_own_my_day_style_and_goal(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    household = chores.household
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    reply = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "casey",
                                     "my_day": "list", "goal": "movie_night_pick"})
    member = reply["result"]["member"]
    assert (member["my_day"], member["goal"], member["rev"]) == ("list", "movie_night_pick", 2)
    assert household.member("casey")["goal"] == "movie_night_pick"
    others = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "dana", "my_day": "list"})
    assert others["error"]["code"] == "not_allowed"
    bad = await ws_command(casey, {"type": "planavista/household/member/prefs", "member_id": "casey", "my_day": "grid"})
    assert bad["error"] == {"code": "invalid_my_day", "message": "Pick a My day style."}


async def test_on_a_shared_screen_a_pin_protected_person_needs_their_pin_for_prefs(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    kitchen = await ws_client_for(hass, hass_ws_client, accounts["kitchen"])
    dana = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "dana", "my_day": "list"})
    assert dana["result"]["member"]["my_day"] == "list"
    refused = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "casey", "goal": None})
    assert refused["error"] == {"code": "pin_required", "message": "Casey's PIN or a parent's is needed."}
    unlocked = await ws_command(kitchen, {"type": "planavista/pin/unlock", "member_id": "casey", "pin": "4826"})
    session = unlocked["result"]["session"]
    allowed = await ws_command(kitchen, {"type": "planavista/household/member/prefs", "member_id": "casey",
                                         "goal": None, "session": session})
    assert allowed["result"]["member"]["goal"] is None
