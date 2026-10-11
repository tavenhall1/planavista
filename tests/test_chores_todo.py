"""Each member's chores as a to-do list, and Assist through it (spec 10.3, 10.6, 9.5)."""
from __future__ import annotations

from datetime import date
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockUser

from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.core import Context, HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import intent
from homeassistant.setup import async_setup_component

from .conftest import set_pin

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"
FISH = "feed_the_fish|dana|day:2026-10-13|0"


async def _items(hass: HomeAssistant, entity_id: str) -> list[dict[str, Any]]:
    result = await hass.services.async_call(
        TODO_DOMAIN, "get_items", {}, target={"entity_id": entity_id}, blocking=True, return_response=True
    )
    return result[entity_id]["items"]


async def _update(hass: HomeAssistant, entity_id: str, data: dict[str, Any], user: MockUser | None = None) -> None:
    await hass.services.async_call(
        TODO_DOMAIN, "update_item", data, target={"entity_id": entity_id}, blocking=True,
        context=Context(user_id=user.id) if user else None,
    )
    await hass.async_block_till_done()


def _last(chores: Any) -> dict[str, Any]:
    return chores.engine.log["completions"][-1]


async def test_the_list_holds_todays_items(hass: HomeAssistant, chores: Any) -> None:
    items = await _items(hass, "todo.casey_chores")
    assert [(i["uid"], i["summary"], i["status"]) for i in items] == [
        ("cat_care|casey|day:2026-10-13|0", "Cat care", "needs_action"),
        ("clean_out_the_garage|casey|once|0", "Clean out the garage", "needs_action"),
        ("clean_out_the_garage|casey|once|1", "Clean out the garage", "needs_action"),
        ("cat_care|casey|day:2026-10-13|1", "Cat care", "needs_action"),
        (TRASH, "Take out the trash", "needs_action"),
        ("clean_the_bathroom|casey|week:2026-10-12|0", "Clean the bathroom", "needs_action"),
        ("yard_work|casey|week:2026-10-12|0", "Yard work", "needs_action"),
    ]
    garage = items[1]
    assert (garage["due"], garage["description"]) == ("2026-10-18", "Due Sun")
    assert items[4]["due"] == "2026-10-18"
    assert items[5]["description"] == "This week"


async def test_checking_an_item_completes_it_through_the_engine(hass: HomeAssistant, chores: Any) -> None:
    await _update(hass, "todo.casey_chores", {"item": "Take out the trash", "status": "completed"})
    assert (_last(chores)["occurrence"], _last(chores)["source"], _last(chores)["by"]) == (TRASH, "automation", "automation")
    items = {i["uid"]: i for i in await _items(hass, "todo.casey_chores")}
    assert items[TRASH]["status"] == "completed"
    assert hass.states.get("todo.casey_chores").state == "6"
    await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "needs_action"})
    assert _last(chores)["state"] == "undone"
    assert hass.states.get("sensor.casey_stars").state == "0"


async def test_waiting_for_ok_shows_as_checked_with_a_note(hass: HomeAssistant, chores: Any) -> None:
    await _update(hass, "todo.dana_chores", {"item": "Feed the fish", "status": "completed"})
    fish = next(i for i in await _items(hass, "todo.dana_chores") if i["uid"] == FISH)
    assert (fish["status"], fish["description"]) == ("completed", "Waiting for a parent's OK")


async def test_own_accounts_change_only_their_own_items(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "completed"}, accounts["casey"])
    assert (_last(chores)["source"], _last(chores)["by"], _last(chores)["user"]) == ("phone", "casey", accounts["casey"].id)
    with pytest.raises(ServiceValidationError) as err:
        await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["casey"])
    assert err.value.translation_key == "not_allowed"
    await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["alex"])
    assert _last(chores)["by"] == "alex"


async def test_a_shared_screen_needs_the_card_for_people_with_a_pin(
    hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]
) -> None:
    household = chores.household
    household.shared_users.append(accounts["kitchen"].id)
    await set_pin(hass, household, "casey", "4826")
    await _update(hass, "todo.dana_chores", {"item": FISH, "status": "completed"}, accounts["kitchen"])
    assert (_last(chores)["source"], _last(chores)["by"]) == ("tablet", "dana")
    with pytest.raises(ServiceValidationError):
        await _update(hass, "todo.casey_chores", {"item": TRASH, "status": "completed"}, accounts["kitchen"])


async def test_a_due_date_is_a_parents_change(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    yard = "yard_work|casey|week:2026-10-12|0"
    with pytest.raises(ServiceValidationError):
        await _update(hass, "todo.casey_chores", {"item": yard, "due_date": "2026-10-25"}, accounts["casey"])
    await _update(hass, "todo.casey_chores", {"item": yard, "due_date": "2026-10-25"}, accounts["alex"])
    item = next(i for i in await _items(hass, "todo.casey_chores") if i["uid"] == yard)
    assert item["due"] == "2026-10-25"


async def test_renaming_belongs_to_settings(hass: HomeAssistant, chores: Any) -> None:
    with pytest.raises(ServiceValidationError) as err:
        await _update(hass, "todo.casey_chores", {"item": TRASH, "rename": "Trash"})
    assert err.value.translation_key == "rename_not_supported"


async def test_adding_an_item_makes_a_once_chore(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    await hass.services.async_call(
        TODO_DOMAIN, "add_item", {"item": "Brush teeth", "due_date": date(2026, 10, 14)},
        target={"entity_id": "todo.casey_chores"}, blocking=True, context=Context(user_id=accounts["casey"].id),
    )
    await hass.async_block_till_done()
    chore = chores.engine.activity("brush_teeth")
    assert (chore["schedule"], chore["assignees"], chore["needs_ok"]) == ("once", ["casey"], True)
    assert chore["needs_ok_always"] is True  # its stars wait for a parent
    assert chore["once"] | {} == {"on": None, "by": "2026-10-14", "by_time": None, "sessions": 1, "estimate_minutes": 15}
    assert chore["created"]["by"] == "casey" and chore["created"]["source"] == "phone"
    await hass.services.async_call(
        TODO_DOMAIN, "add_item", {"item": "Return library books"},
        target={"entity_id": "todo.casey_chores"}, blocking=True, context=Context(user_id=accounts["alex"].id),
    )
    assert chores.engine.activity("return_library_books")["needs_ok"] is False
    assert "needs_ok_always" not in chores.engine.activity("return_library_books")


async def test_only_once_chores_can_be_removed(hass: HomeAssistant, chores: Any, accounts: dict[str, MockUser]) -> None:
    alex = Context(user_id=accounts["alex"].id)
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": TRASH}, target={"entity_id": "todo.casey_chores"},
                                       blocking=True, context=alex)
    assert err.value.translation_key == "delete_not_once"
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": "clean_out_the_garage|casey|once|0"},
                                       target={"entity_id": "todo.casey_chores"}, blocking=True,
                                       context=Context(user_id=accounts["casey"].id))
    await hass.services.async_call(TODO_DOMAIN, "remove_item", {"item": "clean_out_the_garage|casey|once|0"},
                                   target={"entity_id": "todo.casey_chores"}, blocking=True, context=alex)
    assert chores.engine.activity("clean_out_the_garage") is None


async def test_assist_marks_an_item_done_as_voice(hass: HomeAssistant, chores: Any) -> None:
    assert await async_setup_component(hass, "intent", {})
    await hass.async_block_till_done()  # intent platforms register in the background
    await intent.async_handle(
        hass, "test", "HassListCompleteItem", {"name": {"value": "Casey Chores"}, "item": {"value": "take out the trash"}},
    )
    await hass.async_block_till_done()
    assert (_last(chores)["occurrence"], _last(chores)["source"], _last(chores)["done_by"]) == (TRASH, "voice", "casey")


async def test_assist_adds_to_a_list_and_it_waits_for_an_ok(hass: HomeAssistant, chores: Any) -> None:
    assert await async_setup_component(hass, "intent", {})
    await hass.async_block_till_done()  # intent platforms register in the background
    await intent.async_handle(
        hass, "test", "HassListAddItem", {"name": {"value": "Casey Chores"}, "item": {"value": "clean the closet"}},
    )
    await hass.async_block_till_done()
    chore = chores.engine.activity("clean_the_closet")
    assert (chore["name"], chore["needs_ok"], chore["created"]["source"]) == ("Clean the closet", True, "voice")
    assert chore["needs_ok_always"] is True


async def test_two_items_with_one_name_check_off_the_open_one(hass: HomeAssistant, chores: Any) -> None:  # Review Focus 3
    await _update(hass, "todo.casey_chores", {"item": "Cat care", "status": "completed"})
    await _update(hass, "todo.casey_chores", {"item": "Cat care", "status": "completed"})
    done = [c["occurrence"] for c in chores.engine.log["completions"] if c["chore"] == "cat_care"]
    assert done == ["cat_care|casey|day:2026-10-13|0", "cat_care|casey|day:2026-10-13|1"]
