"""Chores actions: the public API for automations and scripts (spec section 10.4).

Members are given as a member id or a person.* entity, chores by their id.
Every action returns response data, so a script can branch on the result. A
repeat or "nothing open" is never an error; real mistakes raise a translated
ServiceValidationError. Who may run each action follows spec 9.5 with no PIN
session (chores/access.py).
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import date
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from ..household.permissions import Account
from .access import async_account, member_by, parent_by, resolve_member, service_error, source_of
from .engine import ChoresEngine, Outcome, with_away, without_away
from .model import ChoreError
from .occurrences import parse_key
from .runtime import DATA_CHORES, ChoresRuntime

COMPLETE_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
    vol.Optional("done_by"): cv.string,
    vol.Optional("approve", default=False): cv.boolean,
})
UNDO_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
})
GET_CHORES_SCHEMA = vol.Schema({vol.Required("member"): cv.string, vol.Optional("date"): cv.date})
REDEEM_REWARD_SCHEMA = vol.Schema({vol.Required("member"): cv.string, vol.Required("reward"): cv.string})
APPROVE_CHORE_SCHEMA = vol.All(
    vol.Schema({vol.Optional("request"): cv.string, vol.Optional("member"): cv.string, vol.Optional("chore"): cv.string}),
    cv.has_at_least_one_key("request", "chore"),
)
SEND_BACK_CHORE_SCHEMA = vol.All(
    vol.Schema({
        vol.Optional("request"): cv.string,
        vol.Optional("member"): cv.string,
        vol.Optional("chore"): cv.string,
        vol.Optional("note"): cv.string,
    }),
    cv.has_at_least_one_key("request", "chore"),
)
ADD_CHORE_SCHEMA = vol.Schema({
    vol.Required("name"): cv.string,
    vol.Required("assignees"): vol.All(cv.ensure_list, [cv.string]),
    vol.Optional("icon"): cv.string,
    vol.Optional("on"): cv.date,
    vol.Optional("by"): cv.date,
    vol.Optional("by_time"): cv.string,
    vol.Optional("sessions"): vol.Coerce(int),
    vol.Optional("rrule"): cv.string,
    vol.Optional("start"): cv.date,
    vol.Optional("window"): vol.In(["day", "period"]),
    vol.Optional("estimate_minutes"): vol.Coerce(int),
    vol.Optional("needs_ok"): cv.boolean,
    vol.Optional("stars"): vol.Coerce(int),
})
REMOVE_CHORE_SCHEMA = vol.Schema({vol.Required("chore"): cv.string})
EXCUSE_CHORE_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("chore"): cv.string,
    vol.Optional("occurrence"): cv.string,
    vol.Optional("date"): cv.date,
    vol.Optional("note"): cv.string,
})
PAUSE_MEMBER_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("from"): cv.date,
    vol.Required("to"): cv.date,
    vol.Optional("note"): cv.string,
})
RESUME_MEMBER_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Optional("from"): cv.date,
    vol.Optional("to"): cv.date,
})
AWARD_STARS_SCHEMA = vol.Schema({
    vol.Required("member"): cv.string,
    vol.Required("stars"): vol.Coerce(int),
    vol.Required("reason"): cv.string,
})


def _runtime(hass: HomeAssistant) -> ChoresRuntime:
    runtime = hass.data.get(DATA_CHORES)
    if runtime is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
    runtime.require()
    return runtime


async def _run(runtime: ChoresRuntime, action: Callable[[ChoresEngine, Any], Outcome]) -> Outcome:
    try:
        return await runtime.async_run(action)
    except ChoreError as err:
        raise service_error(err) from err


def _chore(engine: ChoresEngine, chore_id: str) -> str:
    if engine.activity(chore_id) is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_chore")
    return chore_id


def _occurrence(chore_id: str, value: str | None) -> str | None:
    if value is None:
        return None
    parsed = parse_key(value)
    if parsed is None or parsed[0] != chore_id:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
    return value


async def _caller(call: ServiceCall) -> tuple[ChoresRuntime, Account]:
    runtime = _runtime(call.hass)
    return runtime, await async_account(call.hass, runtime.household, call.context)


async def _complete_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    household, engine = runtime.household, runtime.engine
    member = resolve_member(household, call.data["member"])
    by = member_by(household, account, member)
    chore = _chore(engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    done_by = resolve_member(household, call.data["done_by"]) if "done_by" in call.data else None
    approve = bool(call.data["approve"]) and account.kind in ("automation", "admin")
    if key is not None:
        item = engine.find_item(key, runtime.now())
        if item is not None and item.occ.member != member:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
    out = await _run(runtime, lambda e, now: e.complete(
        now, key=key, chore=chore, member=member, done_by=done_by, by=by,
        source=source_of(account), user=account.user_id, approve=approve,
    ))
    return {"result": out.result, "occurrence": out.data.get("occurrence"), "stars": out.data.get("stars", 0)}


async def _undo_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    household, engine = runtime.household, runtime.engine
    member = resolve_member(household, call.data["member"])
    by = member_by(household, account, member)
    chore = _chore(engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    if key is not None:
        item = engine.find_item(key, runtime.now())
        if item is not None and item.occ.member != member:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_occurrence")
    out = await _run(runtime, lambda e, now: e.undo(
        now, key=key, chore=chore, member=member, by=by, source=source_of(account), user=account.user_id,
    ))
    return {"result": out.result, "occurrence": out.data.get("occurrence")}


async def _get_chores(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    member = resolve_member(runtime.household, call.data["member"])
    engine = runtime.engine
    now = runtime.now()
    day: date = call.data.get("date") or engine.today(now)
    items = engine.items(now, day).get(member, [])
    fields = ("key", "chore", "name", "section", "band", "status", "counted", "due", "due_day",
              "planned", "from", "overdue_since", "credit_minutes", "stars")
    return {
        "member": member,
        "date": day.isoformat(),
        "items": [{name: view[name] for name in fields} for view in (engine.item_view(i, day) for i in items)],
    }


async def _redeem_reward(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    member = resolve_member(runtime.household, call.data["member"])
    by = member_by(runtime.household, account, member)
    out = await _run(runtime, lambda e, now: e.redeem(
        now, member=member, reward=call.data["reward"], by=by, source=source_of(account),
    ))
    return {"result": out.result, "request": out.data["request"]}


async def _review(call: ServiceCall, allow: bool) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    engine = runtime.engine
    request_id = call.data.get("request")
    if request_id is None:
        if "member" not in call.data:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="unknown_member")
        member = resolve_member(runtime.household, call.data["member"])
        pending = engine.pending_for(_chore(engine, call.data["chore"]), member)
        if pending is None:
            return {"result": "nothing_waiting"}
        request_id = pending["id"]
    out = await _run(runtime, lambda e, now: e.review(
        now, request_id=request_id, allow=allow, by=by, note=call.data.get("note"), source=source_of(account),
    ))
    return {"result": out.result}


async def _approve_chore(call: ServiceCall) -> ServiceResponse:
    return await _review(call, True)


async def _send_back_chore(call: ServiceCall) -> ServiceResponse:
    return await _review(call, False)


async def _add_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    data = call.data
    assignees = [resolve_member(runtime.household, value) for value in data["assignees"]]
    changes: dict[str, Any] = {"name": data["name"], "assignees": assignees}
    for name in ("icon", "needs_ok", "stars"):
        if name in data:
            changes[name] = data[name]
    minutes = data.get("estimate_minutes", 15)
    if "rrule" in data:
        start = data.get("start") or runtime.engine.today(runtime.now())
        changes["schedule"] = "repeats"
        changes["repeats"] = {"rrule": data["rrule"], "start": start.isoformat(),
                              "window": data.get("window", "day"), "estimate_minutes": minutes}
    else:
        changes["schedule"] = "once"
        changes["once"] = {
            "on": data["on"].isoformat() if "on" in data else None,
            "by": data["by"].isoformat() if "by" in data else None,
            "by_time": data.get("by_time"),
            "sessions": data.get("sessions", 1),
            "estimate_minutes": minutes,
        }
    out = await _run(runtime, lambda e, now: e.save_activity(now, changes, by=by, source=source_of(account)))
    return {"chore": out.data["activity"]["id"]}


async def _remove_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    parent_by(account)
    chore = _chore(runtime.engine, call.data["chore"])
    await _run(runtime, lambda e, _now: e.delete_activity(chore))
    return {"result": "removed"}


async def _excuse_chore(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    member = resolve_member(runtime.household, call.data["member"])
    chore = _chore(runtime.engine, call.data["chore"])
    key = _occurrence(chore, call.data.get("occurrence"))
    out = await _run(runtime, lambda e, now: e.excuse(
        now, chore=chore, member=member, by=by, day=call.data.get("date"), key=key, note=call.data.get("note"),
    ))
    return {"result": out.result, "occurrences": out.data["occurrences"]}


async def _change_away(call: ServiceCall, change: Callable[[list[dict[str, Any]]], list[dict[str, Any]]]) -> None:
    runtime, account = await _caller(call)
    parent_by(account)
    household = runtime.household
    member_id = resolve_member(household, call.data["member"])
    household.members = [
        {**m, "away": change(list(m.get("away") or [])), "rev": int(m.get("rev", 1)) + 1}
        if m["id"] == member_id else m
        for m in household.members
    ]
    await household.async_save()


async def _pause_member(call: ServiceCall) -> ServiceResponse:
    start, end = call.data["from"], call.data["to"]
    if end < start:
        raise service_error(ChoreError("invalid_away", "The last day away comes after the first."))
    await _change_away(call, lambda away: with_away(away, start, end, call.data.get("note")))
    return {"result": "paused"}


async def _resume_member(call: ServiceCall) -> ServiceResponse:
    runtime = _runtime(call.hass)
    start = call.data.get("from") or runtime.engine.today(runtime.now())
    await _change_away(call, lambda away: without_away(away, start, call.data.get("to")))
    return {"result": "resumed"}


async def _award_stars(call: ServiceCall) -> ServiceResponse:
    runtime, account = await _caller(call)
    by = parent_by(account)
    member = resolve_member(runtime.household, call.data["member"])
    out = await _run(runtime, lambda e, now: e.award_stars(
        now, member=member, stars=call.data["stars"], reason=call.data["reason"], by=by,
    ))
    return {"balance": out.data["balance"]}


SERVICES: dict[str, tuple[Callable[[ServiceCall], Awaitable[ServiceResponse]], vol.Schema, SupportsResponse]] = {
    "complete_chore": (_complete_chore, COMPLETE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "undo_chore": (_undo_chore, UNDO_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "get_chores": (_get_chores, GET_CHORES_SCHEMA, SupportsResponse.ONLY),
    "redeem_reward": (_redeem_reward, REDEEM_REWARD_SCHEMA, SupportsResponse.OPTIONAL),
    "approve_chore": (_approve_chore, APPROVE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "send_back_chore": (_send_back_chore, SEND_BACK_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "add_chore": (_add_chore, ADD_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "remove_chore": (_remove_chore, REMOVE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "excuse_chore": (_excuse_chore, EXCUSE_CHORE_SCHEMA, SupportsResponse.OPTIONAL),
    "pause_member": (_pause_member, PAUSE_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
    "resume_member": (_resume_member, RESUME_MEMBER_SCHEMA, SupportsResponse.OPTIONAL),
    "award_stars": (_award_stars, AWARD_STARS_SCHEMA, SupportsResponse.OPTIONAL),
}


@callback
def async_setup_chores_services(hass: HomeAssistant) -> None:
    """Register the chores actions (once per Home Assistant start)."""
    for name, (handler, schema, supports_response) in SERVICES.items():
        hass.services.async_register(DOMAIN, name, handler, schema, supports_response=supports_response)
