"""The card's chores commands, with PIN sessions on a shared screen (spec 10.7, 9.4, 9.5)."""
from __future__ import annotations

from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.core import HomeAssistant

from .conftest import set_pin, ws_client_for, ws_command

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"
YARD = "yard_work|casey|week:2026-10-12|0"


@pytest.fixture
async def kitchen(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> Any:
    """The wall tablet's account, marked shared, with PINs for Blair and Casey."""
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "blair", "2468")
    await set_pin(hass, household, "casey", "4826")
    return await ws_client_for(hass, hass_ws_client, accounts["kitchen"])


async def _unlock(client: Any, member: str, pin: str) -> str:
    reply = await ws_command(client, {"type": "planavista/pin/unlock", "member_id": member, "pin": pin})
    assert reply["result"]["ok"], reply
    return reply["result"]["session"]


async def test_subscribe_sends_the_board_and_every_change(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "planavista/chores/subscribe"})
    assert (await client.receive_json())["success"]
    feed = (await client.receive_json())["event"]
    assert (feed["state"], feed["save_failed"]) == ("ok", False)
    board = feed["board"]
    assert (board["date"], board["band"], list(board["members"])) == ("2026-10-13", "afternoon", ["alex", "blair", "casey", "dana"])
    assert board["members"]["casey"]["today"]["due"] == 3
    seen: list[dict[str, Any]] = []
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": TRASH}, seen)
    assert reply["result"] == {"result": "done", "occurrence": TRASH, "stars": 1, "completion": reply["result"]["completion"]}
    pushed = [m["event"] for m in seen if m.get("type") == "event"]
    if not pushed:
        pushed = [(await client.receive_json())["event"]]
    assert pushed[-1]["board"]["members"]["casey"]["today"]["done"] == 1


async def test_subscribe_says_when_chores_are_off(hass: HomeAssistant, household: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "planavista/chores/subscribe"})
    assert (await client.receive_json())["success"]
    assert (await client.receive_json())["event"] == {"state": "off", "save_failed": False, "board": None}
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": TRASH})
    assert reply["error"]["code"] == "chores_off"


async def test_a_shared_screen_asks_for_the_members_pin(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    dana = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": FISH})
    assert dana["result"]["result"] == "pending"
    refused = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH})
    assert refused["error"] == {"code": "pin_required", "message": "Casey's PIN or a parent's is needed."}
    session = await _unlock(kitchen, "casey", "4826")
    reply = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH, "session": session})
    assert reply["result"]["result"] == "done"
    completion = chores.engine.log["completions"][-1]
    assert (completion["by"], completion["source"]) == ("casey", "tablet")


async def test_a_parents_session_may_check_off_anyones_items(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    session = await _unlock(kitchen, "blair", "2468")
    reply = await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": TRASH, "done_by": "blair", "session": session})
    assert reply["result"]["result"] == "done"
    completion = chores.engine.log["completions"][-1]
    assert (completion["by"], completion["done_by"]) == ("blair", "blair")


async def test_a_closed_day_says_so(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    reply = await ws_command(client, {"type": "planavista/chores/complete", "occurrence": "cat_care|casey|day:2026-10-12|0"})
    assert reply["error"] == {"code": "period_closed", "message": "The day had ended."}


async def test_reviews_need_parent_mode_on_a_shared_screen(hass: HomeAssistant, kitchen: Any, chores: Any) -> None:
    await ws_command(kitchen, {"type": "planavista/chores/complete", "occurrence": FISH})
    [request] = chores.engine.open_requests()
    refused = await ws_command(kitchen, {"type": "planavista/chores/review", "request": request["id"], "decision": "allow"})
    assert refused["error"]["code"] == "parent_mode_required"
    session = await _unlock(kitchen, "blair", "2468")
    reply = await ws_command(kitchen, {"type": "planavista/chores/review", "request": request["id"], "decision": "allow", "session": session})
    assert reply["result"] == {"result": "approved", "occurrence": FISH}
    assert chores.engine.log["completions"][-1]["review"]["by"] == "blair"


async def test_planning_a_day_is_the_members_but_due_dates_are_a_parents(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    planned = await ws_command(casey, {"type": "planavista/chores/override", "occurrence": YARD, "planned_day": "2026-10-17"})
    assert planned["success"]
    refused = await ws_command(casey, {"type": "planavista/chores/override", "occurrence": "cat_care|casey|day:2026-10-13|1", "due": "2026-10-15"})
    assert refused["error"]["code"] == "not_allowed"
    alex = await ws_client_for(hass, hass_ws_client, accounts["alex"])
    moved = await ws_command(alex, {"type": "planavista/chores/override", "occurrence": TRASH, "due": "2026-10-20"})
    assert moved["success"]
    bad = await ws_command(alex, {"type": "planavista/chores/override", "occurrence": TRASH, "planned_day": "2026-10-30"})
    assert bad["error"] == {"code": "invalid_planned_day", "message": "Pick a day before it's due."}


async def test_asking_for_more_time(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    reply = await ws_command(casey, {"type": "planavista/chores/request", "kind": "more_time", "occurrence": YARD, "until": "2026-10-25"})
    assert "request" in reply["result"]
    assert hass.states.get("sensor.household_approvals_waiting").attributes["more_time"] == 1


async def test_editing_chores_and_rules(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    saved = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity": {
        "name": "Vacuum", "schedule": "plan", "assignees": ["blair"], "minimum": {"hours": 1, "per": "week"}}})
    activity = saved["result"]["activity"]
    assert (activity["id"], activity["rev"], activity["created"]["by"]) == ("vacuum", 1, "admin")
    assert hass.states.get("todo.blair_chores").state == "3"
    stale = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity_id": "vacuum", "rev": 7, "activity": {"times": 2}})
    assert stale["error"] == {"code": "changed", "message": "This changed on another screen."}
    shares = await ws_command(admin, {"type": "planavista/chores/activity/save", "activity_id": "vacuum", "activity": {
        "assignees": ["blair", "casey"], "split": "shared", "shares": {"blair": 1}}})
    assert shares["error"] == {"code": "shares_mismatch", "message": "Everyone's share has to add up to the time."}
    assert (await ws_command(admin, {"type": "planavista/chores/activity/delete", "activity_id": "vacuum"}))["success"]
    rules = await ws_command(admin, {"type": "planavista/chores/settings/save", "settings": {"missed": "strict"}})
    assert rules["result"]["settings"]["missed"] == "strict"
    bad = await ws_command(admin, {"type": "planavista/chores/settings/save", "settings": {"missed": "forgive"}})
    assert bad["error"]["code"] == "invalid_missed"


async def test_children_cant_edit(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    for command in (
        {"type": "planavista/chores/activity/delete", "activity_id": "yard_work"},
        {"type": "planavista/chores/settings/save", "settings": {"missed": "strict"}},
        {"type": "planavista/chores/enable", "enabled": False},
        {"type": "planavista/stars/award", "member": "casey", "stars": 50, "reason": "Me"},
    ):
        assert (await ws_command(casey, command))["error"]["code"] == "not_allowed", command["type"]


async def test_the_week_view(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    client = await hass_ws_client(hass)
    week = (await ws_command(client, {"type": "planavista/chores/week"}))["result"]
    assert week["week"] == {"start": "2026-10-12", "end": "2026-10-19"}
    casey = week["members"]["casey"]
    assert [d["kind"] for d in casey["days"]] == ["past", "today", "future", "future", "future", "future", "future"]
    assert casey["days"][1]["due"] == 3
    assert {w["chore"] for w in casey["weekly"]} == {"clean_the_bathroom", "yard_work", "take_out_the_trash"}


async def test_rewards_and_stars(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    saved = await ws_command(admin, {"type": "planavista/rewards/save", "reward": {"name": "Pick the weekend game", "cost": 3}})
    assert saved["result"]["reward"]["id"] == "pick_the_weekend_game"
    assert (await ws_command(admin, {"type": "planavista/stars/award", "member": "casey", "stars": 5, "reason": "Bonus"}))["result"] == {"balance": 5}
    casey = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    redeem = await ws_command(casey, {"type": "planavista/rewards/redeem", "member": "casey", "reward": "pick_the_weekend_game"})
    assert redeem["result"]["result"] == "requested"
    others = await ws_command(casey, {"type": "planavista/rewards/redeem", "member": "dana", "reward": "pick_the_weekend_game"})
    assert others["error"]["code"] == "not_allowed"


async def test_turning_chores_off_and_on_from_the_card(hass: HomeAssistant, chores: Any, hass_ws_client: Any) -> None:
    admin = await hass_ws_client(hass)
    assert (await ws_command(admin, {"type": "planavista/chores/enable", "enabled": False}))["result"] == {"state": "off"}
    assert hass.states.get("todo.casey_chores") is None
    assert (await ws_command(admin, {"type": "planavista/chores/enable", "enabled": True}))["result"] == {"state": "ok"}
    await hass.async_block_till_done()
    assert hass.states.get("todo.casey_chores").state == "7"
    assert (await ws_command(admin, {"type": "planavista/chores/start_over"}))["error"]["code"] == "nothing_to_fix"


async def test_two_screens_checking_one_item_at_once_credit_it_once(  # Review Focus 5
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser], hass_ws_client: Any
) -> None:
    import asyncio

    tablet = await hass_ws_client(hass)
    phone = await ws_client_for(hass, hass_ws_client, accounts["casey"])
    replies = await asyncio.gather(
        ws_command(tablet, {"type": "planavista/chores/complete", "occurrence": TRASH}),
        ws_command(phone, {"type": "planavista/chores/complete", "occurrence": TRASH}),
    )
    assert sorted(r["result"]["result"] for r in replies) == ["already_done", "done"]
    assert hass.states.get("sensor.casey_stars").state == "1"
