"""Phone notifications with buttons and evening reminders (spec 10.5, 15.4, 15.5)."""
from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser, async_fire_time_changed, async_mock_service

from homeassistant.core import Context, HomeAssistant, ServiceCall

from custom_components.planavista.chores.notify import clock_text, request_text

EVENT = "mobile_app_notification_action"


async def _phones(hass: HomeAssistant, chores: Any, phones: dict[str, list[str]], **notify: dict[str, bool]) -> None:
    household = chores.household
    household.members = [
        {**m, "phones": phones.get(m["id"], []), "notify": {"requests": True, "reminders": False, **notify.get(m["id"], {})}}
        for m in household.members
    ]
    await household.async_save()
    chores.notifier.async_start()
    await hass.async_block_till_done()


def _service(hass: HomeAssistant, name: str) -> list[ServiceCall]:
    return async_mock_service(hass, "notify", name)


async def _dana_feeds_the_fish(hass: HomeAssistant, chores: Any) -> str:
    await chores.async_run(lambda e, now: e.complete(now, chore="feed_the_fish", member="dana", by="dana", source="tablet"))
    await hass.async_block_till_done()
    (request,) = chores.engine.open_requests()
    return request["id"]


def _actions(call: ServiceCall) -> tuple[str, str]:
    allow, decline = call.data["data"]["actions"]
    return allow["action"], decline["action"]


def test_what_a_request_says() -> None:
    names = {"casey": "Casey", "dana": "Dana"}
    assert request_text({"kind": "completion", "member": "dana", "done_by": "dana", "name": "Feed the fish", "stars": 1}, names) == (
        "Dana finished Feed the fish (1 star)."
    )
    assert request_text({"kind": "completion", "member": "dana", "done_by": "casey", "name": "Tidy toys", "stars": 2}, names) == (
        "Casey did Tidy toys for Dana (2 stars)."
    )
    assert request_text({"kind": "more_time", "member": "casey", "name": "Yard work", "until": "2026-10-18"}, names) == (
        "Casey asks for more time on Yard work, until 2026-10-18."
    )
    assert request_text({"kind": "skip", "member": "casey", "name": "Yard work"}, names) == "Casey asks to skip Yard work this week."
    # Round 15 (r15b M1): the words follow what the skip covers.
    daily = {"kind": "skip", "member": "casey", "name": "Cat care", "occurrence": "cat_care|casey|day:2026-10-15|0"}
    assert request_text(daily, names) == "Casey asks to skip Cat care on Thursday."
    once = {"kind": "skip", "member": "casey", "name": "Clean out the garage", "occurrence": "clean_out_the_garage|casey|once|0"}
    assert request_text(once, names) == "Casey asks to skip Clean out the garage."
    assert request_text({"kind": "redemption", "member": "casey", "name": "Movie night pick", "cost": 40}, names) == (
        "Casey wants Movie night pick (40 stars)."
    )
    assert (clock_text("19:00", "12h"), clock_text("07:30", "12h"), clock_text("19:00", "24h")) == ("7:00 PM", "7:30 AM", "19:00")


async def test_a_request_goes_to_every_parents_phone_with_buttons(hass: HomeAssistant, chores: Any) -> None:
    alex, blair = _service(hass, "mobile_app_alex_phone"), _service(hass, "mobile_app_blair_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"], "blair": ["notify.mobile_app_blair_phone"],
                                 "casey": ["notify.mobile_app_caseys_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    assert len(alex) == len(blair) == 1
    data = alex[0].data
    assert (data["title"], data["message"]) == ("Waiting for approval", "Dana finished Feed the fish (1 star).")
    assert data["data"]["tag"] == f"planavista-{request_id}"
    allow, decline = data["data"]["actions"]
    assert allow["title"] == "Looks good" and allow["action"].startswith(f"PLANAVISTA_ALLOW_{request_id}_")
    assert decline["title"] == "Send back" and decline["behavior"] == "textInput"
    assert _actions(blair[0]) == _actions(alex[0])  # one token for the request, on every phone


async def test_looks_good_on_a_parents_phone_approves_and_clears_every_copy(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    alex, blair = _service(hass, "mobile_app_alex_phone"), _service(hass, "mobile_app_blair_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"], "blair": ["notify.mobile_app_blair_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    allow, _ = _actions(alex[0])
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    completion = next(c for c in chores.engine.log["completions"] if c["id"] == request_id)
    assert (completion["state"], completion["review"]["by"]) == ("done", "alex")
    clears = [c.data for c in (*alex, *blair) if c.data.get("message") == "clear_notification"]
    assert clears == [{"message": "clear_notification", "data": {"tag": f"planavista-{request_id}"}}] * 2
    # The same button again is stale: ignored, and its notification cleared.
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert completion["state"] == "done"


async def test_send_back_takes_the_typed_reason(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    _, decline = _actions(alex[0])
    hass.bus.async_fire(EVENT, {"action": decline, "reply_text": " Some food fell on the floor "},
                        context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    completion = next(c for c in chores.engine.log["completions"] if c["id"] == request_id)
    assert (completion["state"], completion["review"]["note"]) == ("sent_back", "Some food fell on the floor")


async def test_a_button_needs_a_parents_account_and_the_notifications_token(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    allow, _ = _actions(alex[0])
    forged = f"PLANAVISTA_ALLOW_{request_id}_0000000000000000"
    hass.bus.async_fire(EVENT, {"action": forged}, context=Context(user_id=accounts["alex"].id))
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["casey"].id))
    hass.bus.async_fire(EVENT, {"action": allow})
    hass.bus.async_fire(EVENT, {"action": "SOMETHING_ELSE"}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert [r["id"] for r in chores.engine.open_requests()] == [request_id]
    # The forged token changed nothing, and the real button still works.
    hass.bus.async_fire(EVENT, {"action": allow}, context=Context(user_id=accounts["alex"].id))
    await hass.async_block_till_done()
    assert chores.engine.open_requests() == []


async def test_answering_on_the_screen_clears_the_phones(hass: HomeAssistant, chores: Any) -> None:
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    request_id = await _dana_feeds_the_fish(hass, chores)
    await chores.async_run(lambda e, now: e.review(now, request_id=request_id, allow=True, by="blair", source="tablet"))
    await hass.async_block_till_done()
    assert alex[-1].data == {"message": "clear_notification", "data": {"tag": f"planavista-{request_id}"}}


async def test_requests_waiting_before_a_restart_are_not_sent_again(hass: HomeAssistant, chores: Any) -> None:
    await _dana_feeds_the_fish(hass, chores)
    chores.notifier.async_stop()
    alex = _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    chores.async_notify()
    await hass.async_block_till_done()
    assert alex == []


async def test_without_phones_requests_wait_on_the_screen(hass: HomeAssistant, chores: Any) -> None:
    await _phones(hass, chores, {})
    await _dana_feeds_the_fish(hass, chores)
    assert len(chores.feed()["board"]["requests"]) == 1


async def test_a_phone_home_assistant_lost_is_logged_once_and_needs_a_look(
    hass: HomeAssistant, chores: Any, caplog: pytest.LogCaptureFixture
) -> None:
    await _phones(hass, chores, {"alex": ["notify.mobile_app_gone"]})
    with caplog.at_level(logging.WARNING):
        await _dana_feeds_the_fish(hass, chores)
        await chores.async_run(lambda e, now: e.complete(now, chore="tidy_toys", member="dana", by="dana", source="tablet"))
        await hass.async_block_till_done()
    assert chores.feed()["notify_problems"] == [{"member": "alex", "phone": "notify.mobile_app_gone"}]
    assert sum(r.levelno == logging.WARNING and "notify.mobile_app_gone" in r.message for r in caplog.records) == 1
    _service(hass, "mobile_app_gone")
    await chores.async_run(lambda e, now: e.complete(now, chore="make_your_bed", member="dana", by="dana", source="tablet"))
    await hass.async_block_till_done()
    assert chores.feed()["notify_problems"] == []


async def test_the_evening_reminder_goes_to_people_with_chores_left(
    hass: HomeAssistant, chores: Any, freezer: Any
) -> None:
    casey, alex = _service(hass, "mobile_app_caseys_phone"), _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"casey": ["notify.mobile_app_caseys_phone"], "alex": ["notify.mobile_app_alex_phone"]},
                  casey={"reminders": True}, alex={"reminders": True})
    await chores.async_run(lambda e, now: e.complete(now, chore="kitchen_cleanup", member="alex", by="alex", source="tablet"))
    await chores.async_run(lambda e, now: e.complete(now, key="cat_care|casey|day:2026-10-13|0", by="casey", source="tablet"))
    seven = datetime.fromisoformat("2026-10-13T19:00:00-05:00")
    freezer.move_to(seven)
    async_fire_time_changed(hass, seven)
    await hass.async_block_till_done()
    reminders = [c.data for c in casey if c.data.get("title") == "Chores"]
    assert reminders == [{"title": "Chores", "message": "7:00 PM: 2 chores left",
                          "data": {"tag": "planavista-reminder", "group": "planavista"}}]
    assert [c for c in alex if c.data.get("title") == "Chores"] == []  # nothing left for Alex today


async def test_no_evening_check_means_no_reminders(hass: HomeAssistant, chores: Any, freezer: Any) -> None:
    casey = _service(hass, "mobile_app_caseys_phone")
    await chores.async_run(lambda e, now: e.save_settings(now, {"evening_check": None}))
    await _phones(hass, chores, {"casey": ["notify.mobile_app_caseys_phone"]}, casey={"reminders": True})
    seven = datetime.fromisoformat("2026-10-13T19:00:00-05:00")
    freezer.move_to(seven)
    async_fire_time_changed(hass, seven)
    await hass.async_block_till_done()
    assert casey == []


async def test_a_lost_phone_is_listed_from_the_start_until_it_is_removed(hass: HomeAssistant, chores: Any) -> None:
    """Spec 15.4: Needs a look lists a phone Home Assistant doesn't have; removing it from the person clears it."""
    _service(hass, "mobile_app_alex_phone")
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone", "notify.mobile_app_gone"]})
    assert chores.notifier.problems() == [{"member": "alex", "phone": "notify.mobile_app_gone"}]
    await _phones(hass, chores, {"alex": ["notify.mobile_app_alex_phone"]})
    assert chores.notifier.problems() == []
