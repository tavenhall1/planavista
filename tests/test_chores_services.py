"""The chores actions: responses, who may run them, and mistakes (spec 10.4, 9.5, 15.2)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.planavista.const import DOMAIN

from .conftest import set_pin

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


async def _call(
    hass: HomeAssistant, service: str, data: dict[str, Any], user: MockUser | None = None, *, response: bool = True
) -> Any:
    result = await hass.services.async_call(
        DOMAIN, service, data, blocking=True, return_response=response,
        context=Context(user_id=user.id) if user else None,
    )
    await hass.async_block_till_done()
    return result


async def test_complete_chore_answers_what_happened(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "complete_chore", {"member": "person.casey", "chore": "take_out_the_trash"}) == {
        "result": "done", "occurrence": TRASH, "stars": 1,
    }
    again = await _call(hass, "complete_chore", {"member": "person.casey", "chore": "take_out_the_trash"})
    assert again == {"result": "already_done", "occurrence": TRASH, "stars": 0}
    assert await _call(hass, "complete_chore", {"member": "alex", "chore": "groceries"}) == {
        "result": "nothing_open", "occurrence": None, "stars": 0,
    }
    pending = await _call(hass, "complete_chore", {"member": "dana", "chore": "feed_the_fish"})
    assert pending["result"] == "pending"


async def test_an_action_can_run_without_asking_for_a_response(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"}, response=False) is None
    assert hass.states.get("sensor.casey_stars").state == "4"


@pytest.mark.parametrize(
    ("data", "key"),
    [
        ({"member": "erin", "chore": "yard_work"}, "unknown_member"),
        ({"member": "person.nobody", "chore": "yard_work"}, "unknown_member"),
        ({"member": "casey", "chore": "fly_a_kite"}, "unknown_chore"),
        ({"member": "casey", "chore": "yard_work", "occurrence": TRASH}, "unknown_occurrence"),
        ({"member": "dana", "chore": "take_out_the_trash", "occurrence": TRASH}, "unknown_occurrence"),
    ],
)
async def test_mistakes_are_translated_errors(hass: HomeAssistant, chores: Any, data: dict[str, Any], key: str) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "complete_chore", data)
    assert (err.value.translation_domain, err.value.translation_key) == (DOMAIN, key)


async def test_who_may_complete_whose_chores(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    assert (await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"}, accounts["casey"]))["result"] == "done"
    for user, member in (("casey", "dana"), ("kitchen", "casey"), ("guest", "casey")):
        with pytest.raises(ServiceValidationError) as err:
            await _call(hass, "complete_chore", {"member": member, "chore": "cat_care"}, accounts[user])
        assert err.value.translation_key == "not_allowed", (user, member)
    assert (await _call(hass, "complete_chore", {"member": "dana", "chore": "make_your_bed"}, accounts["kitchen"]))["result"] == "pending"
    assert (await _call(hass, "complete_chore", {"member": "dana", "chore": "set_the_table"}, accounts["alex"]))["result"] == "pending"


async def test_only_automations_and_admins_may_skip_the_ok(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    data = {"member": "dana", "chore": "feed_the_fish", "approve": True}
    assert (await _call(hass, "complete_chore", data, accounts["alex"]))["result"] == "pending"
    data["chore"] = "make_your_bed"
    assert (await _call(hass, "complete_chore", data))["result"] == "done"
    data["chore"] = "set_the_table"
    assert (await _call(hass, "complete_chore", data, accounts["admin"]))["result"] == "done"


async def test_done_by_someone_else(hass: HomeAssistant, chores: Any) -> None:
    await _call(hass, "complete_chore", {"member": "casey", "chore": "take_out_the_trash", "done_by": "person.blair"})
    assert chores.engine.log["completions"][-1]["done_by"] == "blair"


async def test_undo_chore(hass: HomeAssistant, chores: Any) -> None:
    await _call(hass, "complete_chore", {"member": "casey", "chore": "take_out_the_trash"})
    assert await _call(hass, "undo_chore", {"member": "casey", "chore": "take_out_the_trash"}) == {"result": "undone", "occurrence": TRASH}
    assert await _call(hass, "undo_chore", {"member": "casey", "chore": "take_out_the_trash"}) == {"result": "nothing_to_undo", "occurrence": None}


async def test_get_chores_for_today_and_another_day(hass: HomeAssistant, chores: Any) -> None:
    today = await _call(hass, "get_chores", {"member": "person.casey"})
    assert (today["member"], today["date"], len(today["items"])) == ("casey", "2026-10-13", 7)
    trash = next(i for i in today["items"] if i["key"] == TRASH)
    assert trash == {
        "key": TRASH, "chore": "take_out_the_trash", "name": "Take out the trash", "section": "today",
        "band": "evening", "status": "open", "counted": True, "due": "2026-10-19T03:00:00-05:00",
        "due_day": "2026-10-18", "planned": "2026-10-13", "from": None, "overdue_since": None,
        "credit_minutes": 15.0, "stars": 1,
    }
    saturday = await _call(hass, "get_chores", {"member": "casey", "date": "2026-10-17"})
    assert "rake_the_leaves|casey|rep:2026-10-17|0" in [i["key"] for i in saturday["items"]]


async def test_approving_and_sending_back(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    await _call(hass, "complete_chore", {"member": "dana", "chore": "feed_the_fish"})
    with pytest.raises(ServiceValidationError):
        await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["casey"])
    with pytest.raises(ServiceValidationError):
        await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["kitchen"])
    assert await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}, accounts["alex"]) == {"result": "approved"}
    review = chores.engine.log["completions"][-1]["review"]
    assert (review["by"], review["source"]) == ("alex", "phone")
    assert await _call(hass, "approve_chore", {"member": "dana", "chore": "feed_the_fish"}) == {"result": "nothing_waiting"}
    await _call(hass, "complete_chore", {"member": "dana", "chore": "tidy_toys"})
    [request] = chores.engine.open_requests()
    assert await _call(hass, "send_back_chore", {"request": request["id"], "note": "Missed a spot"}) == {"result": "sent_back"}
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "approve_chore", {"request": request["id"]})
    assert err.value.translation_key == "unknown_request"


async def test_adding_and_removing_chores(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    once = await _call(hass, "add_chore", {"name": "Wash the car", "assignees": ["person.alex", "blair"], "by": "2026-10-17",
                                           "estimate_minutes": 45})
    assert once == {"chore": "wash_the_car"}
    assert chores.engine.activity("wash_the_car")["once"]["by"] == "2026-10-17"
    rep = await _call(hass, "add_chore", {"name": "Water the plants", "assignees": ["dana"], "rrule": "FREQ=WEEKLY;BYDAY=WE,SA",
                                          "estimate_minutes": 5})
    assert chores.engine.activity(rep["chore"])["repeats"] == {
        "rrule": "FREQ=WEEKLY;BYDAY=WE,SA", "start": "2026-10-13", "window": "day", "estimate_minutes": 5,
    }
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "add_chore", {"name": "Spring cleaning", "assignees": ["alex"], "rrule": "FREQ=YEARLY"})
    assert err.value.translation_key == "invalid_schedule"
    assert err.value.translation_placeholders == {"reason": "Chores repeat daily, weekly, or monthly."}
    with pytest.raises(ServiceValidationError):
        await _call(hass, "add_chore", {"name": "Nap", "assignees": ["casey"]}, accounts["casey"])
    assert await _call(hass, "remove_chore", {"chore": "wash_the_car"}) == {"result": "removed"}
    assert chores.engine.activity("wash_the_car") is None


async def test_excusing_and_marking_someone_away(hass: HomeAssistant, chores: Any) -> None:
    out = await _call(hass, "excuse_chore", {"member": "casey", "chore": "cat_care", "note": "Sick day"})
    assert out == {"result": "excused", "occurrences": ["cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1"]}
    assert await _call(hass, "pause_member", {"member": "dana", "from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}) == {"result": "paused"}
    assert chores.household.member("dana")["away"] == [{"from": "2026-10-13", "to": "2026-10-14", "note": "At Grandma's"}]
    assert hass.states.get("sensor.dana_chores_left").state == "0"
    assert hass.states.get("binary_sensor.dana_chores_done").state == "on"
    assert await _call(hass, "resume_member", {"member": "dana"}) == {"result": "resumed"}
    assert chores.household.member("dana")["away"] == []
    assert hass.states.get("sensor.dana_chores_left").state == "4"
    with pytest.raises(ServiceValidationError):
        await _call(hass, "pause_member", {"member": "dana", "from": "2026-10-14", "to": "2026-10-13"})


async def test_stars_and_rewards(hass: HomeAssistant, chores: Any) -> None:
    assert await _call(hass, "award_stars", {"member": "casey", "stars": 5, "reason": "Helped a neighbor"}) == {"balance": 5}
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "award_stars", {"member": "casey", "stars": -9, "reason": "Too many"})
    assert err.value.translation_key == "not_enough_stars"
    chores.engine.save_reward({"name": "Movie night pick", "icon": "🎬", "cost": 4, "who": ["casey", "dana"]})
    out = await _call(hass, "redeem_reward", {"member": "casey", "reward": "movie_night_pick"})
    assert out["result"] == "requested"
    assert hass.states.get("sensor.household_approvals_waiting").attributes["redemption"] == 1
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "redeem_reward", {"member": "casey", "reward": "a_pony"})
    assert err.value.translation_key == "unknown_reward"


async def test_actions_say_when_chores_are_off(hass: HomeAssistant, household: Any) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _call(hass, "complete_chore", {"member": "casey", "chore": "yard_work"})
    assert err.value.translation_key == "chores_off"
