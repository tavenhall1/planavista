"""The goal surprise (milestone 10): wrapped when a goal is reached, opened once on the child's screen."""
from __future__ import annotations

from datetime import timedelta

import pytest

from custom_components.planavista.chores.model import ChoreError
from custom_components.planavista.chores.store import normalize_rewards
from custom_components.planavista.household.permissions import Account, may_open_surprise

from .chores_sample import MEMBERS, SCENE, sample_engine

FISH = "feed_the_fish|dana|day:2026-10-13|0"


def _with_goal(goal: str | None, who: str = "dana") -> list[dict]:
    return [dict(m, goal=goal) if m["id"] == who else dict(m) for m in MEMBERS]


def _engine(goal: str | None = "ice_cream_trip", cost: int = 3, **settings):
    engine = sample_engine(members=_with_goal(goal), settings=settings or None)
    engine.save_reward({"name": "Ice cream trip", "icon": "🍦", "cost": cost})
    return engine


def _types(out) -> list[tuple[str, str]]:
    return [(e.type, e.member) for e in out.events]


def test_bonus_stars_that_reach_the_goal_wrap_a_surprise_once() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=2, reason="Great week", by="alex")
    assert _types(engine.settle_surprises(SCENE)) == []
    engine.award_stars(SCENE, member="dana", stars=1, reason="Helped", by="alex")
    out = engine.settle_surprises(SCENE)
    assert _types(out) == [("goal_reached", "dana")]
    assert out.events[0].data == {"member": "dana", "reward": "ice_cream_trip", "reward_name": "Ice cream trip", "stars": 3}
    assert out.changed == {"rewards"}
    assert engine.rewards["surprises"]["dana"] == {
        "reward": "ice_cream_trip", "cost": 3, "wrapped": "2026-10-13T16:10:00-05:00", "opened": None,
    }
    # Settling again changes nothing and fires nothing.
    again = engine.settle_surprises(SCENE + timedelta(minutes=5))
    assert (again.events, again.changed) == ([], set())


def test_a_parents_ok_that_pays_the_last_star_wraps_it() -> None:
    engine = _engine(cost=1)
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    assert _types(engine.settle_surprises(SCENE)) == []  # waiting for approval earns nothing yet
    [request] = engine.open_requests()
    engine.review(SCENE + timedelta(hours=2), request_id=request["id"], allow=True, by="alex", source="notification")
    out = engine.settle_surprises(SCENE + timedelta(hours=2))
    assert _types(out) == [("goal_reached", "dana")]


def test_the_day_end_approval_wraps_it_while_the_child_sleeps() -> None:
    engine = _engine(cost=1, auto_approve="day_end")
    engine.complete(SCENE, key=FISH, by="dana", source="tablet")
    engine.catch_up(SCENE + timedelta(hours=12))
    assert _types(engine.settle_surprises(SCENE + timedelta(hours=12))) == [("goal_reached", "dana")]


def test_a_lowered_price_or_a_goal_already_in_reach_wraps_it() -> None:
    engine = _engine(goal=None, cost=5)
    engine.award_stars(SCENE, member="dana", stars=4, reason="Bonus", by="alex")
    engine.set_members(_with_goal("ice_cream_trip"))
    assert _types(engine.settle_surprises(SCENE)) == []
    engine.save_reward({"cost": 4}, reward_id="ice_cream_trip")
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]


def test_it_goes_away_when_the_goal_is_out_of_reach_and_comes_back_when_saved_again() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.open_surprise(SCENE, member="dana", by="dana")
    # The reward is given: the stars are spent, and the opened surprise goes with them.
    engine.redeem(SCENE, member="dana", reward="ice_cream_trip", by="dana", source="tablet")
    [request] = engine.open_requests()
    engine.review(SCENE, request_id=request["id"], allow=True, by="alex")
    out = engine.settle_surprises(SCENE)
    assert ("dana" in engine.rewards["surprises"], out.changed) == (False, {"rewards"})
    # Saving up for it again wraps a new one.
    engine.award_stars(SCENE, member="dana", stars=3, reason="Another great week", by="alex")
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    assert engine.rewards["surprises"]["dana"]["opened"] is None


def _view(engine, member: str = "dana"):
    return engine.board(SCENE)["members"][member]["surprise"]


def _dip_and_recover(engine, how: str) -> None:
    """Take Dana's goal out of reach and give it back, the ways round 3 found (r3b I3)."""
    if how == "uncheck":
        engine.undo(SCENE, key=FISH, by="alex", source="tablet")
        assert engine.settle_surprises(SCENE).events == []
        assert _view(engine) is None
        engine.complete(SCENE, key=FISH, by="alex", source="tablet", done_by="dana", approve=True)
    elif how == "price":
        engine.save_reward({"cost": 9}, reward_id="ice_cream_trip")
        assert engine.settle_surprises(SCENE).events == []
        assert _view(engine) is None
        engine.save_reward({"cost": 3}, reward_id="ice_cream_trip")
    elif how == "stars":
        engine.award_stars(SCENE, member="dana", stars=-1, reason="Oops", by="alex")
        assert engine.settle_surprises(SCENE).events == []
        assert _view(engine) is None
        engine.award_stars(SCENE, member="dana", stars=1, reason="Sorry", by="alex")
    else:  # the goal changed to one out of reach, then back
        engine.set_members(_with_goal("zoo_day"))
        assert engine.settle_surprises(SCENE).events == []
        assert _view(engine) is None
        engine.set_members(_with_goal("ice_cream_trip"))


@pytest.mark.parametrize("how", ["uncheck", "price", "stars", "goal"])
def test_an_opened_surprise_stays_opened_through_a_dip(how: str) -> None:
    engine = _engine()
    engine.save_reward({"name": "Zoo day", "icon": "🦁", "cost": 30})
    engine.award_stars(SCENE, member="dana", stars=2, reason="Bonus", by="alex")
    engine.complete(SCENE, key=FISH, by="alex", source="tablet", done_by="dana", approve=True)
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    engine.open_surprise(SCENE, member="dana", by="dana")
    _dip_and_recover(engine, how)
    out = engine.settle_surprises(SCENE)
    assert (out.events, _view(engine)) == ([], {"reward": "ice_cream_trip", "opened": True})


@pytest.mark.parametrize("how", ["uncheck", "price", "stars", "goal"])
def test_an_unopened_surprise_comes_back_without_telling_the_parents_again(how: str) -> None:
    engine = _engine()
    engine.save_reward({"name": "Zoo day", "icon": "🦁", "cost": 30})
    engine.award_stars(SCENE, member="dana", stars=2, reason="Bonus", by="alex")
    engine.complete(SCENE, key=FISH, by="alex", source="tablet", done_by="dana", approve=True)
    engine.settle_surprises(SCENE)
    _dip_and_recover(engine, how)
    out = engine.settle_surprises(SCENE)
    assert (out.events, _view(engine)) == ([], {"reward": "ice_cream_trip", "opened": False})
    assert engine.rewards["surprises"]["dana"]["wrapped"] == "2026-10-13T16:10:00-05:00"


def test_switching_between_goals_in_reach_wraps_each_once() -> None:
    engine = _engine()
    engine.save_reward({"name": "Sticker", "icon": "⭐", "cost": 2})
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    engine.open_surprise(SCENE, member="dana", by="dana")
    engine.set_members(_with_goal("sticker"))
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    assert _view(engine) == {"reward": "sticker", "opened": False}
    engine.set_members(_with_goal("ice_cream_trip"))
    assert engine.settle_surprises(SCENE).events == []
    assert _view(engine) == {"reward": "ice_cream_trip", "opened": True}
    engine.set_members(_with_goal("sticker"))
    assert engine.settle_surprises(SCENE).events == []
    assert _view(engine) == {"reward": "sticker", "opened": False}


def test_spending_stars_clears_the_slate_for_every_goal() -> None:
    engine = _engine()
    engine.save_reward({"name": "Sticker", "icon": "⭐", "cost": 2})
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.open_surprise(SCENE, member="dana", by="dana")
    engine.set_members(_with_goal("sticker"))
    engine.settle_surprises(SCENE)
    engine.set_members(_with_goal("ice_cream_trip"))
    engine.settle_surprises(SCENE)
    # Spending something else that leaves the goal covered keeps the surprise as it is.
    engine.award_stars(SCENE, member="dana", stars=2, reason="Bonus", by="alex")
    engine.redeem(SCENE, member="dana", reward="sticker", by="alex", source="tablet")
    assert engine.settle_surprises(SCENE).events == []
    assert _view(engine) == {"reward": "ice_cream_trip", "opened": True}
    # Spending that takes the goal out of reach: the next time it's reached is a new surprise, for either goal.
    engine.redeem(SCENE, member="dana", reward="ice_cream_trip", by="alex", source="tablet")
    assert engine.settle_surprises(SCENE).events == []
    assert ("dana" in engine.rewards["surprises"], _view(engine)) == (False, None)
    engine.award_stars(SCENE, member="dana", stars=2, reason="Bonus", by="alex")
    engine.set_members(_with_goal("sticker"))
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]


def test_a_reward_given_while_the_goal_stays_in_reach_changes_nothing() -> None:
    """Round 4 (r4a A3): a cheaper reward given in reach marked the surprise spent, so a later
    uncheck and re-check wrapped the same goal again and told the parents twice."""
    engine = _engine()
    engine.save_reward({"name": "Sticker", "icon": "⭐", "cost": 2, "needs_ok": False})
    engine.award_stars(SCENE, member="dana", stars=5, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.open_surprise(SCENE, member="dana", by="dana")
    engine.redeem(SCENE, member="dana", reward="sticker", by="alex", source="tablet")
    assert engine.settle_surprises(SCENE).events == []
    assert "spent" not in engine.rewards["surprises"]["dana"]
    engine.award_stars(SCENE, member="dana", stars=-1, reason="Oops", by="alex")
    assert engine.settle_surprises(SCENE).events == []
    engine.award_stars(SCENE, member="dana", stars=1, reason="Sorry", by="alex")
    out = engine.settle_surprises(SCENE)
    assert (out.events, _view(engine)) == ([], {"reward": "ice_cream_trip", "opened": True})


def test_a_deleted_reward_leaves_no_surprise_to_come_back() -> None:
    """Round 4 (r4a A5): a reward deleted and added again (the same id) brought back the old one's surprise."""
    engine = _engine()
    engine.save_reward({"name": "Sticker", "icon": "⭐", "cost": 2})
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.open_surprise(SCENE, member="dana", by="dana")
    engine.set_members(_with_goal("sticker"))
    engine.settle_surprises(SCENE)
    engine.delete_reward("ice_cream_trip")
    assert "ice_cream_trip" not in engine.rewards["surprises"]["dana"].get("earlier", {})
    engine.save_reward({"name": "Ice cream trip", "icon": "🍦", "cost": 3})
    engine.set_members(_with_goal("ice_cream_trip"))
    assert _types(engine.settle_surprises(SCENE)) == [("goal_reached", "dana")]
    assert _view(engine) == {"reward": "ice_cream_trip", "opened": False}


def test_a_surprise_out_of_reach_cant_be_opened() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.award_stars(SCENE, member="dana", stars=-1, reason="Oops", by="alex")
    engine.settle_surprises(SCENE)
    with pytest.raises(ChoreError) as err:
        engine.open_surprise(SCENE, member="dana", by="dana")
    assert err.value.code == "no_surprise"


@pytest.mark.parametrize("change", ["goal_cleared", "goal_changed", "reward_deleted", "not_for_them", "stars_taken", "stars_off"])
def test_an_unopened_surprise_goes_away_quietly(change: str) -> None:
    engine = _engine()
    engine.save_reward({"name": "Zoo day", "icon": "🦁", "cost": 30})
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    if change == "goal_cleared":
        engine.set_members(_with_goal(None))
    elif change == "goal_changed":
        engine.set_members(_with_goal("zoo_day"))
    elif change == "reward_deleted":
        engine.delete_reward("ice_cream_trip")
    elif change == "not_for_them":
        engine.save_reward({"who": ["casey"]}, reward_id="ice_cream_trip")
    elif change == "stars_off":  # review A2: someone who earns no stars has no goal to reach
        engine.set_members([dict(m, stars=False) if m["id"] == "dana" else m for m in _with_goal("ice_cream_trip")])
    else:
        engine.award_stars(SCENE, member="dana", stars=-1, reason="Oops", by="alex")
    out = engine.settle_surprises(SCENE)
    assert (out.events, _view(engine)) == ([], None)
    # A deleted reward can't come back, so its surprise goes for good.
    assert ("dana" in engine.rewards["surprises"]) is (change != "reward_deleted")


def test_a_raised_price_still_covered_keeps_it() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=5, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    engine.save_reward({"cost": 4}, reward_id="ice_cream_trip")
    out = engine.settle_surprises(SCENE)
    assert (out.events, out.changed, engine.rewards["surprises"]["dana"]["cost"]) == ([], set(), 3)


def test_opening_stamps_it_once_and_a_second_open_answers_the_same() -> None:
    engine = _engine()
    with pytest.raises(ChoreError) as err:
        engine.open_surprise(SCENE, member="dana", by="dana")
    assert err.value.code == "no_surprise"
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    first = engine.open_surprise(SCENE + timedelta(minutes=1), member="dana", by="dana")
    assert (first.result, first.changed) == ("opened", {"rewards"})
    second = engine.open_surprise(SCENE + timedelta(minutes=2), member="dana", by="kitchen")
    assert (second.result, second.changed) == ("opened", set())
    assert engine.rewards["surprises"]["dana"]["opened"] == "2026-10-13T16:11:00-05:00"


def test_the_board_feed_shows_each_members_surprise() -> None:
    engine = _engine()
    engine.award_stars(SCENE, member="dana", stars=3, reason="Bonus", by="alex")
    engine.settle_surprises(SCENE)
    members = engine.board(SCENE)["members"]
    assert members["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": False}
    assert members["casey"]["surprise"] is None
    engine.open_surprise(SCENE, member="dana", by="dana")
    assert engine.board(SCENE)["members"]["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": True}


def test_the_store_keeps_good_surprises_and_drops_bad_ones() -> None:
    good = {"reward": "ice_cream_trip", "cost": 3, "wrapped": "2026-10-13T16:10:00-05:00", "opened": None}
    doc = normalize_rewards({"surprises": {"dana": good, "casey": "nope", "alex": {"reward": 4}, 7: good}, "future": 1})
    assert doc["surprises"] == {"dana": good}
    # Set aside and earlier goals (r3b I3): bad parts are dropped, the surprise kept.
    earlier = {"sticker": {"wrapped": "2026-10-12T09:00:00-05:00", "opened": None}}
    mixed = dict(good, away="yes", spent=1, earlier={**earlier, "zoo": "nope", "kite": {"opened": None}})
    assert normalize_rewards({"surprises": {"dana": mixed}})["surprises"]["dana"] == dict(good, earlier=earlier)
    kept = dict(good, away=True, spent=True, earlier=earlier)
    assert normalize_rewards({"surprises": {"dana": kept}})["surprises"]["dana"] == kept
    assert doc["future"] == 1
    assert normalize_rewards({})["surprises"] == {}


@pytest.mark.parametrize(("account", "shared_screens", "allowed"), [
    (Account("kitchen", shared=True), 1, True),           # the kitchen tablet
    (Account("guest"), 1, True),                          # linked to no one: shared-screen rules
    (Account("dana_user", member_id="dana"), 1, True),    # the child's own login
    (Account("casey_user", member_id="casey"), 1, False), # a sibling's own login
    (Account("alex_user", member_id="alex", member_is_parent=True), 1, False),  # a parent's phone
    (Account("dev", is_admin=True), 1, False),            # an admin's own login
    (Account("alex_user", member_id="alex", member_is_parent=True), 0, True),   # no shared screens at all
    (Account(None), 0, False),                            # automations never open one
])
def test_who_may_open_it(account: Account, shared_screens: int, allowed: bool) -> None:
    assert may_open_surprise(account, "dana", shared_screens=shared_screens) is allowed


# The runtime, the open command, and the parents' notification ---------------------------------

async def _goal(hass, chores, cost: int = 3) -> None:
    """Dana saves for an ice cream trip that costs `cost` stars."""
    await chores.async_run(lambda e, now: e.save_reward({"name": "Ice cream trip", "icon": "🍦", "cost": cost}))
    household = chores.household
    household.members = [dict(m, goal="ice_cream_trip") if m["id"] == "dana" else m for m in household.members]
    await household.async_save()
    await chores.async_sync_members()
    await hass.async_block_till_done()


async def _bonus(hass, chores, stars: int = 3) -> None:
    await chores.async_run(lambda e, now: e.award_stars(now, member="dana", stars=stars, reason="Great week", by="alex"))
    await hass.async_block_till_done()


async def test_the_runtime_wraps_it_after_any_change_and_reports_the_event(hass, chores) -> None:
    seen: list = []
    chores.async_listen_events(seen.append)
    await _goal(hass, chores)
    await _bonus(hass, chores, 2)
    assert "dana" not in chores.engine.rewards["surprises"]
    await _bonus(hass, chores, 1)
    assert chores.engine.rewards["surprises"]["dana"]["opened"] is None
    assert [(e.type, e.member) for e in seen] == [("goal_reached", "dana")]
    assert chores.engine.board(chores.now())["members"]["dana"]["surprise"] == {"reward": "ice_cream_trip", "opened": False}


async def test_a_goal_already_in_reach_wraps_it_when_the_goal_is_picked(hass, chores) -> None:
    await _bonus(hass, chores, 5)
    await _goal(hass, chores)
    assert chores.engine.rewards["surprises"]["dana"]["reward"] == "ice_cream_trip"


async def _client(hass, hass_ws_client, accounts, name: str):
    from .conftest import ws_client_for

    return await ws_client_for(hass, hass_ws_client, accounts[name])


async def test_a_shared_screen_opens_it_and_a_parents_own_login_does_not(hass, chores, accounts, hass_ws_client) -> None:
    from .conftest import ws_command

    chores.household.shared_users.append(accounts["kitchen"].id)
    await chores.household.async_save()
    await _goal(hass, chores)
    await _bonus(hass, chores)
    alex = await _client(hass, hass_ws_client, accounts, "alex")
    refused = await ws_command(alex, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert (refused["success"], refused["error"]["code"]) == (False, "not_their_screen")
    assert refused["error"]["message"] == "Only Dana's own screen or a shared screen opens this."
    casey = await _client(hass, hass_ws_client, accounts, "casey")
    sibling = await ws_command(casey, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert sibling["error"]["code"] == "not_their_screen"
    kitchen = await _client(hass, hass_ws_client, accounts, "kitchen")
    opened = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert (opened["success"], opened["result"]) == (True, {"result": "opened"})
    again = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert again["result"] == {"result": "opened"}
    assert chores.engine.rewards["surprises"]["dana"]["opened"] is not None
    none = await ws_command(kitchen, {"type": "planavista/chores/surprise/open", "member": "casey"})
    assert none["error"]["code"] == "no_surprise"
    # Review A3: a made-up member is answered in fixed words, never with what was sent.
    made_up = await ws_command(alex, {"type": "planavista/chores/surprise/open", "member": "<b>zzz</b> nobody"})
    assert (made_up["error"]["code"], made_up["error"]["message"]) == ("no_surprise", "There's no surprise waiting.")


async def test_with_no_shared_screens_any_login_opens_it(hass, chores, accounts, hass_ws_client) -> None:
    from .conftest import ws_command

    await _goal(hass, chores)
    await _bonus(hass, chores)
    alex = await _client(hass, hass_ws_client, accounts, "alex")
    opened = await ws_command(alex, {"type": "planavista/chores/surprise/open", "member": "dana"})
    assert opened["result"] == {"result": "opened"}


async def _alex_hears(hass, chores) -> list:
    """Alex's phone, the one that gets the household's requests; returns its calls."""
    from pytest_homeassistant_custom_component.common import async_mock_service

    alex = async_mock_service(hass, "notify", "mobile_app_alex_phone")
    household = chores.household
    household.members = [
        {**m, "phones": ["notify.mobile_app_alex_phone"] if m["id"] == "alex" else [], "notify": {"requests": True, "reminders": False}}
        for m in household.members
    ]
    await household.async_save()
    return alex


def _goal_notes(calls: list) -> list[dict]:
    return [c.data for c in calls if c.data.get("title") == "Dana reached a goal"]


async def test_parents_hear_once_that_a_goal_was_reached(hass, chores) -> None:
    alex = await _alex_hears(hass, chores)
    chores.notifier.async_start()
    await _goal(hass, chores)
    await _bonus(hass, chores)
    await _bonus(hass, chores, 1)  # still in reach: no second notification
    assert _goal_notes(alex) == [{
        "title": "Dana reached a goal",
        "message": "🍦 Ice cream trip. There's a surprise waiting on Dana's screen.",
        # Review A4: news, not a question, so it arrives quietly (it can come with the 3 AM approval).
        "data": {
            "tag": "planavista-goal-dana", "group": "planavista",
            "push": {"interruption-level": "passive"}, "channel": "PlanaVista goals", "importance": "low",
        },
    }]


async def test_parents_hear_of_a_goal_reached_while_home_assistant_was_down(hass, chores, freezer) -> None:
    """Review A1: the 3 AM approval caught up after an outage wrapped the surprise, but the
    notifier started listening only after the catch-up, so no parent heard of it."""
    alex = await _alex_hears(hass, chores)
    await _goal(hass, chores, cost=1)
    await chores.async_run(lambda e, now: e.complete(now, key=FISH, by="dana", source="tablet"))
    await hass.async_block_till_done()
    assert "dana" not in chores.engine.rewards["surprises"]  # waiting for approval earns nothing yet
    chores.async_stop()
    freezer.move_to("2026-10-14T08:00:00-05:00")  # Home Assistant was down across 3 AM
    await chores.async_start()
    await hass.async_block_till_done()
    assert chores.engine.rewards["surprises"]["dana"]["opened"] is None
    assert [n["title"] for n in _goal_notes(alex)] == ["Dana reached a goal"]

async def test_diagnostics_count_the_surprises(hass, chores, mock_config_entry) -> None:
    from custom_components.planavista.diagnostics import async_get_config_entry_diagnostics

    await _goal(hass, chores)
    await _bonus(hass, chores)
    found = await async_get_config_entry_diagnostics(hass, mock_config_entry)
    assert found["chores"]["surprises"] == {"waiting": 1, "opened": 0, "set_aside": 0}
