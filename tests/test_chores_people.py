"""A person's chores details (spec 14.2): goal, bedtimes, sleep, phones, what phones get, and stars history."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.household.members import MemberError, add_member, update_member

from .chores_sample import SCENE, at, sample_engine
from .conftest import ws_client_for, ws_command


def _casey(**changes: Any) -> dict[str, Any]:
    members, _ = add_member([], {"name": "Casey", "age_group": "teen"})
    return update_member(members, "casey", changes, None)[1]


def test_bedtimes_are_weeknights_and_weekends_and_weekends_default_to_weeknights() -> None:
    assert _casey(bedtime={"weeknight": "22:00", "weekend": "23:30"})["bedtime"] == {"weeknight": "22:00", "weekend": "23:30"}
    assert _casey(bedtime={"weeknight": "21:00"})["bedtime"] == {"weeknight": "21:00", "weekend": "21:00"}
    assert _casey(bedtime=None)["bedtime"] is None
    for bad in ({"weeknight": "25:00"}, {"weeknight": "9pm"}, "22:00", {"weekend": "22:00"}):
        with pytest.raises(MemberError) as err:
            _casey(bedtime=bad)
        assert err.value.args[0] == "invalid_bedtime"


def test_sleep_is_hours_to_the_quarter_hour_between_1_and_16() -> None:
    assert _casey(sleep_hours=9)["sleep_hours"] == 9.0
    assert _casey(sleep_hours=7.6)["sleep_hours"] == 7.5
    assert _casey(sleep_hours=None)["sleep_hours"] is None
    for bad in (0.5, 17, True, "9"):
        with pytest.raises(MemberError) as err:
            _casey(sleep_hours=bad)
        assert err.value.args[0] == "invalid_sleep"


def test_phones_are_notify_services_up_to_five() -> None:
    assert _casey(phones=["notify.mobile_app_caseys_phone"])["phones"] == ["notify.mobile_app_caseys_phone"]
    assert _casey(phones=None)["phones"] == []
    six = [f"notify.mobile_app_phone_{n}" for n in range(6)]
    for bad in (["mobile_app_caseys_phone"], ["notify.Casey Phone"], ["notify.a", "notify.a"], six, "notify.a"):
        with pytest.raises(MemberError) as err:
            _casey(phones=bad)
        assert err.value.args[0] == "invalid_phones"


def test_what_phones_get_starts_with_requests_on_and_reminders_off() -> None:
    assert _casey(notify=None)["notify"] == {"requests": True, "reminders": False}
    assert _casey(notify={"reminders": True})["notify"] == {"requests": True, "reminders": True}
    assert _casey(notify={"reminders": True, "colour": "red"})["notify"] == {"requests": True, "reminders": True}
    with pytest.raises(MemberError) as err:
        _casey(notify={"requests": "yes"})
    assert err.value.args[0] == "invalid_notify"


def test_a_parent_sets_someones_goal_on_their_page() -> None:
    assert _casey(goal="movie_night_pick")["goal"] == "movie_night_pick"
    assert _casey(goal=None)["goal"] is None
    with pytest.raises(MemberError) as err:
        _casey(goal="")
    assert err.value.args[0] == "invalid_goal"


def test_fields_this_page_leaves_alone_are_kept() -> None:
    members, _ = add_member([], {"name": "Casey", "age_group": "teen", "phones": ["notify.mobile_app_caseys_phone"]})
    members[0]["planner"] = {"kept": True}
    _, casey = update_member(members, "casey", {"sleep_hours": 9}, None)
    assert casey["phones"] == ["notify.mobile_app_caseys_phone"]
    assert casey["planner"] == {"kept": True}


def test_stars_history_names_what_each_change_was_for() -> None:
    engine = sample_engine()
    engine.complete(at(10, 13, 7), key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet")
    engine.complete(at(10, 13, 8), key="take_out_the_trash|casey|week:2026-10-12|0", by="casey", source="tablet")
    engine.undo(at(10, 13, 9), key="take_out_the_trash|casey|week:2026-10-12|0", by="casey", source="tablet")
    engine.award_stars(at(10, 13, 10), member="casey", stars=5, reason="Helped a neighbor", by="blair")
    engine.save_reward({"name": "Pick the weekend game", "icon": "🎮", "cost": 3, "needs_ok": False})
    engine.redeem(at(10, 13, 11), member="casey", reward="pick_the_weekend_game", by="casey", source="tablet")
    history = engine.star_history("casey")
    assert [(h["reason"], h["delta"], h["name"]) for h in history] == [
        ("redeemed", -3, "Pick the weekend game"),
        ("Helped a neighbor", 5, None),
        ("undo", -1, "Take out the trash"),
        ("chore", 1, "Take out the trash"),
        ("chore", 1, "Cat care"),
    ]
    assert history[1]["by"] == "blair"
    assert engine.star_history("casey", limit=2) == history[:2]
    assert engine.star_history("dana") == []
    with pytest.raises(ChoreError) as err:
        engine.star_history("jordan")
    assert err.value.code == "unknown_member"


async def test_a_parent_saves_someones_chores_details(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    reply = await ws_command(alex, {
        "type": "planavista/household/member/save", "member_id": "casey",
        "member": {
            "goal": "movie_night_pick", "bedtime": {"weeknight": "22:00", "weekend": "23:30"}, "sleep_hours": 9,
            "phones": ["notify.mobile_app_caseys_phone"], "notify": {"reminders": True},
        },
    })
    member = reply["result"]["member"]
    assert member["bedtime"] == {"weeknight": "22:00", "weekend": "23:30"}
    assert (member["sleep_hours"], member["goal"]) == (9.0, "movie_night_pick")
    assert member["phones"] == ["notify.mobile_app_caseys_phone"]
    assert member["notify"] == {"requests": True, "reminders": True}
    assert chores.household.member("casey")["sleep_hours"] == 9.0
    bad = await ws_command(alex, {"type": "planavista/household/member/save", "member_id": "casey",
                                  "member": {"sleep_hours": 30}})
    assert bad["error"] == {"code": "invalid_sleep", "message": "Pick between 1 and 16 hours of sleep."}


async def test_the_stars_history_command(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    chores.engine.award_stars(SCENE, member="casey", stars=4, reason="Extra help", by="alex")
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/stars/history", "member": "casey"})
    assert reply["result"]["balance"] == 4
    assert reply["result"]["history"] == [
        {"at": "2026-10-13T16:10:00-05:00", "delta": 4, "reason": "Extra help", "name": None, "by": "alex"},
    ]
    unknown = await ws_command(client, {"type": "planavista/stars/history", "member": "jordan"})
    assert unknown["error"] == {"code": "unknown_member", "message": "That person isn't in the household."}
