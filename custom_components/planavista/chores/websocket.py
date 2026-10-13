"""WebSocket commands for the card's chores screens (spec section 10.7).

Every command checks the rule in spec 9.5 with the command's PIN session:
member-level changes (check off, uncheck, plan a day, ask for more time or a
skip, redeem) and parent-level ones (approve, edit, excuse, stars, settings).
On a shared screen, a refused member-level change answers pin_required with
the member whose PIN (or a parent's) would allow it.
"""
from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from homeassistant.util import dt as dt_util

from ..const import CONF_CALENDARS, VERSION
from ..coordinator import async_apply_config
from ..household.members import MemberError, check_parent_pins, import_members
from ..household.permissions import may_open_surprise, member_level, parent_level
from ..household.store import Household
from ..household.websocket import (
    ERROR_MESSAGES,
    _screens_need_parent_pin,
    account_for,
    parent_for,
    refuse,
    session_for,
)
from ..refusals import send_refusal
from .access import MESSAGES, message, source_of
from .engine import ChoresEngine, Item, Outcome
from .importer import FORMAT_HOUSEHOLD, ImportProblem, export_household, plan_import, preview, read_file
from .model import ChoreError
from .occurrences import parse_key
from .runtime import DATA_CHORES, STATE_NEEDS_A_LOOK, STATE_NEWER, STATE_OFF, ChoresRuntime, ChoresUnavailable

STATE_MESSAGES = {
    STATE_OFF: ("chores_off", "Turn on chores first."),
    STATE_NEEDS_A_LOOK: ("chores_need_a_look", "Chores need a look. A parent can restore them in Settings."),
    STATE_NEWER: ("update_planavista", "Update PlanaVista to use chores."),
}
SESSION = vol.Optional("session")


@callback
def _runtime(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], *, ready: bool = True
) -> ChoresRuntime | None:
    """The runtime, or None after saying why chores can't be used now."""
    runtime = hass.data.get(DATA_CHORES)
    if runtime is None:
        send_refusal(connection, msg, "not_loaded", "PlanaVista is not set up yet.")
        return None
    if ready and not runtime.available:
        code, text = STATE_MESSAGES[runtime.state]
        send_refusal(connection, msg, code, text)
        return None
    return runtime


@callback
def _member_by(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], household: Household, target: str
) -> str | None:
    """Who a member-level change to `target`'s items is attributed to, or None after refusing."""
    account = account_for(hass, household, connection.user)
    session = session_for(household, connection, msg)
    by = member_level(account, session, target, target in household.pins)
    if by is not None:
        return by
    if account.screen_rules:
        member = household.member(target) or {}
        # A live session that is someone else's gets its own code, so the card doesn't take it for an ended one.
        code = "other_pin_required" if session is not None else "pin_required"
        send_refusal(connection, msg, code, f"{member.get('name', target)}'s PIN or a parent's is needed.")
    else:
        refuse(connection, msg, account)
    return None


def _done_at(engine: Any, now: datetime, at: str | None) -> datetime:
    """When a check-off was done: the card's own time for it (queued while Home Assistant was out of
    reach), when that is no later than now and on the same chore day; otherwise now (round 2)."""
    when = dt_util.parse_datetime(at) if at else None
    if when is None or when.tzinfo is None or when > now:
        return now
    clock = engine.clock
    return when.astimezone(now.tzinfo) if clock.chore_date(when) == clock.chore_date(now) else now


@callback
def _may_credit(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], household: Household, doer: str
) -> bool:
    """Whether this screen may say `doer` did someone else's chore, or False after refusing (spec 9.5).

    Crediting someone is theirs to say too: a parent, whose check-offs need no approval,
    takes parent level; anyone else takes their own PIN when they have one.
    """
    member = household.member(doer)
    if member is None:
        return True  # the engine names an unknown member
    account = account_for(hass, household, connection.user)
    session = session_for(household, connection, msg)
    name = member.get("name", doer)
    if member.get("parent"):
        if parent_level(account, session) is not None:
            return True
        if account.screen_rules or account.kind == "member":
            send_refusal(connection, msg, "parent_mode_required", f"A parent's PIN is needed to give {name} the credit.")
        else:
            refuse(connection, msg, account)
        return False
    if member_level(account, session, doer, doer in household.pins) is not None:
        return True
    if account.screen_rules:
        code = "other_pin_required" if session is not None else "pin_required"
        send_refusal(connection, msg, code, f"{name}'s PIN or a parent's is needed.")
    else:
        refuse(connection, msg, account)
    return False


async def _apply(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    runtime: ChoresRuntime,
    action: Callable[[ChoresEngine, Any], Outcome],
) -> Outcome | None:
    """Run one engine write, or send the rule it broke."""
    try:
        return await runtime.async_run(action)
    except ChoreError as err:
        send_refusal(connection, msg, err.code, message(err))
    except ChoresUnavailable:
        code, text = STATE_MESSAGES.get(runtime.state, ("chores_off", "Turn on chores first."))
        send_refusal(connection, msg, code, text)
    return None


@callback
def _item(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], runtime: ChoresRuntime
) -> Item | None:
    """Today's occurrence named by the command, or None after saying it can't change now."""
    engine, now = runtime.engine, runtime.now()
    item = engine.find_item(msg["occurrence"], now)
    if item is None:
        later = engine.planned_later(msg["occurrence"], now)
        if later is not None:
            parsed = parse_key(msg["occurrence"])
            activity = engine.activity(parsed[0]) if parsed else None
            name = activity["name"] if activity else "That chore"
            send_refusal(connection, msg, "planned_later", f"{name} is planned for {later.strftime('%A')}.")
        else:
            send_refusal(connection, msg, "period_closed", "The day had ended.")
    return item


def _source(hass: HomeAssistant, household: Household, connection: websocket_api.ActiveConnection) -> str:
    return source_of(account_for(hass, household, connection.user))


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/subscribe"})
@callback
def ws_chores_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Send the board now and after every change: items, progress, streaks, stars, requests."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None:
        return

    @callback
    def forward() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], runtime.feed()))

    connection.subscriptions[msg["id"]] = runtime.async_listen(forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/week", vol.Optional("date"): cv.date})
@callback
def ws_chores_week(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The Week view for the week holding `date` (default this week)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    connection.send_result(msg["id"], runtime.engine.week_view(runtime.now(), msg.get("date")))


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/day", vol.Required("date"): cv.date,
})
@callback
def ws_chores_day(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """One chore day for the Week view's day sheet: what was due, done, missed, or excused."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    connection.send_result(msg["id"], runtime.engine.day_view(runtime.now(), msg["date"]))


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/history", vol.Required("chore"): str, vol.Required("member"): str,
})
@callback
def ws_chores_history(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The options sheet's History: the streak, recent check-offs, and when it usually gets done."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    try:
        result = runtime.engine.history(runtime.now(), msg["chore"], msg["member"])
    except ChoreError as err:
        send_refusal(connection, msg, err.code, message(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/complete",
    vol.Required("occurrence"): str,
    vol.Optional("done_by"): str,
    vol.Optional("at"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_complete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Check off one occurrence, credited to its owner or to whoever did it."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, item.occ.member)
    if by is None:
        return
    done_by = msg.get("done_by")
    if done_by and done_by != item.occ.member and not _may_credit(hass, connection, msg, household, done_by):
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.complete(
        _done_at(e, now, msg.get("at")), key=item.occ.key, done_by=done_by, by=by, source=source, user=connection.user.id,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/undo", vol.Required("occurrence"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_chores_undo(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Uncheck today's check-off of one occurrence."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, item.occ.member)
    if by is None:
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.undo(
        now, key=item.occ.key, by=by, source=source, user=connection.user.id,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/request",
    vol.Required("kind"): vol.In(["more_time", "skip"]),
    vol.Required("occurrence"): str,
    vol.Optional("until"): cv.date,
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_request(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Ask the parents for more time or to skip this week."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    by = _member_by(hass, connection, msg, runtime.household, item.occ.member)
    if by is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.request(
        now, kind=msg["kind"], key=item.occ.key, by=by, until=msg.get("until"),
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/review",
    vol.Required("request"): str,
    vol.Required("decision"): vol.In(["allow", "decline"]),
    vol.Optional("note"): vol.Any(None, str),
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_review(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A parent answers a request: Looks good or Send back, Allow or Not this time, Approve or Decline."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    household, by = context
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.review(
        now, request_id=msg["request"], allow=msg["decision"] == "allow", by=by, note=msg.get("note"), source=source,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/override",
    vol.Required("occurrence"): str,
    vol.Optional("planned_day"): vol.Any(None, cv.date),
    vol.Optional("due"): vol.Any(None, cv.date),
    vol.Optional("assignee"): vol.Any(None, str),
    vol.Optional("excused"): bool,
    vol.Optional("note"): vol.Any(None, str),
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_override(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Plan it for a day (the member), or change the due date, hand it over, or excuse it (a parent)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (item := _item(connection, msg, runtime)) is None:
        return
    household = runtime.household
    parent_fields = ("due", "assignee", "excused")
    if any(name in msg for name in parent_fields):
        context = parent_for(hass, connection, msg, needs_file=False)
        if context is None:
            return
        by = context[1]
    else:
        member = _member_by(hass, connection, msg, household, item.occ.member)
        if member is None:
            return
        by = member
    changes = {name: msg[name] for name in ("planned_day", *parent_fields) if name in msg}
    out = await _apply(connection, msg, runtime, lambda e, now: e.override(
        now, key=item.occ.key, by=by, note=msg.get("note"), **changes,
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/excuse_missed",
    vol.Required("occurrence"): str,
    vol.Optional("note"): vol.Any(None, str),
    SESSION: str,
})
@websocket_api.async_response
async def ws_chores_excuse_missed(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A parent excuses a check-off already counted as missed, so its day and the streak hold."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.excuse_missed(
        now, key=msg["occurrence"], by=context[1], note=msg.get("note"),
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/activity/save",
    vol.Optional("activity_id"): str,
    vol.Optional("rev"): int,
    vol.Required("activity"): dict,
    SESSION: str,
})
@websocket_api.async_response
async def ws_activity_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add a chore or change one (the chore editor and quick add)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    household, by = context
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.save_activity(
        now, msg["activity"], by=by, source=source, activity_id=msg.get("activity_id"), rev=msg.get("rev"),
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/activity/delete", vol.Required("activity_id"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_activity_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Delete a chore: it leaves the board at once; past weeks and earned stars stay."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.delete_activity(msg["activity_id"]))
    if out is not None:
        connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/settings/save", vol.Required("settings"): dict, SESSION: str,
})
@websocket_api.async_response
async def ws_settings_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Rules and Reminders; they apply as the parent taps."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.save_settings(now, msg["settings"]))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/enable", vol.Required("enabled"): bool, SESSION: str,
})
@websocket_api.async_response
async def ws_chores_enable(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Turn chores on or off for the household. Turning them off keeps everything for later."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or parent_for(hass, connection, msg) is None:
        return
    try:
        await runtime.async_set_enabled(msg["enabled"])
    except ChoresUnavailable:
        code, text = STATE_MESSAGES[STATE_NEWER]
        send_refusal(connection, msg, code, text)
        return
    connection.send_result(msg["id"], {"state": runtime.state})


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/start_over", SESSION: str})
@websocket_api.async_response
async def ws_chores_start_over(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Chores need a look and a parent chose Start over: empty chores, rewards, and history."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or parent_for(hass, connection, msg) is None:
        return
    try:
        await runtime.async_start_over()
    except ChoresUnavailable:
        send_refusal(connection, msg, "nothing_to_fix", "Chores don't need a look.")
        return
    connection.send_result(msg["id"], {"state": runtime.state})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/save",
    vol.Optional("reward_id"): str,
    vol.Required("reward"): dict,
    SESSION: str,
})
@websocket_api.async_response
async def ws_reward_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Add a reward or change one."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.save_reward(msg["reward"], reward_id=msg.get("reward_id")))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/delete", vol.Required("reward_id"): str, SESSION: str,
})
@websocket_api.async_response
async def ws_reward_delete(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Remove a reward; redemptions already given stay in history."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or parent_for(hass, connection, msg, needs_file=False) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, _now: e.delete_reward(msg["reward_id"]))
    if out is not None:
        connection.send_result(msg["id"])


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/rewards/redeem",
    vol.Required("member"): str,
    vol.Required("reward"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_reward_redeem(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A member spends stars on a reward (it waits for a parent unless it needs no approval)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    household = runtime.household
    by = _member_by(hass, connection, msg, household, msg["member"])
    if by is None:
        return
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.redeem(
        now, member=msg["member"], reward=msg["reward"], by=by, source=source,
    ))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result, **out.data})


@websocket_api.websocket_command({vol.Required("type"): "planavista/chores/surprise/open", vol.Required("member"): str})
@websocket_api.async_response
async def ws_surprise_open(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Open a member's goal surprise: on a shared screen or their own login (milestone 10)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    household = runtime.household
    account = account_for(hass, household, connection.user)
    if not may_open_surprise(account, msg["member"], shared_screens=len(household.shared_users)):
        name = (household.member(msg["member"]) or {}).get("name", msg["member"])
        send_refusal(connection, msg, "not_their_screen", f"Only {name}'s own screen or a shared screen opens this.")
        return
    by = account.member_id or source_of(account)
    out = await _apply(connection, msg, runtime, lambda e, now: e.open_surprise(now, member=msg["member"], by=by))
    if out is not None:
        connection.send_result(msg["id"], {"result": out.result})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/stars/award",
    vol.Required("member"): str,
    vol.Required("stars"): int,
    vol.Required("reason"): str,
    SESSION: str,
})
@websocket_api.async_response
async def ws_stars_award(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A parent gives or takes stars by hand, with a reason."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    out = await _apply(connection, msg, runtime, lambda e, now: e.award_stars(
        now, member=msg["member"], stars=msg["stars"], reason=msg["reason"], by=context[1],
    ))
    if out is not None:
        connection.send_result(msg["id"], out.data)


@websocket_api.websocket_command({vol.Required("type"): "planavista/stars/history", vol.Required("member"): str})
@callback
def ws_stars_history(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """A member's latest stars, newest first (a person's page: Stars)."""
    runtime = _runtime(hass, connection, msg)
    if runtime is None:
        return
    try:
        history = runtime.engine.star_history(msg["member"])
    except ChoreError as err:
        send_refusal(connection, msg, err.code, message(err))
        return
    connection.send_result(msg["id"], {"balance": runtime.engine.balance(msg["member"]), "history": history})


# Import, restore, and export (spec 7.9, 14.6, 15.5) ---------------------------------------------

MAX_FILE_LENGTH = 2_000_000
# What stops an import, item by item, in plain words.
IMPORT_PROBLEMS = {
    "name_required": "{item} has no name.",
    "invalid_hours": "{item}: set how long it takes.",
    "invalid_list": "{item} can't be read.",
    "matched_twice": "{item} and {other} can't both be the same person.",
    "age_group_required": "Pick an age group for {item}.",
}


def _problem_text(problem: dict[str, Any]) -> str:
    code, item = problem["code"], problem["item"]
    if code in IMPORT_PROBLEMS:
        return IMPORT_PROBLEMS[code].format(item=item, other=problem.get("other", ""))
    table = ERROR_MESSAGES if problem.get("of") == "member" else MESSAGES
    text = problem.get("detail") or table.get(code) or "That can't be imported."
    return f"{item}: {text}"


def _problem(err: ImportProblem) -> dict[str, Any]:
    return {"code": err.code, "message": err.message, "problems": [_problem_text(p) for p in err.problems]}


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/import/preview",
    vol.Required("text"): vol.All(str, vol.Length(max=MAX_FILE_LENGTH)),
    SESSION: str,
})
@callback
def ws_import_preview(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Read a plan or a PlanaVista file and say where everything would go. Nothing is saved."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or (context := parent_for(hass, connection, msg)) is None:
        return
    household, _by = context
    try:
        parsed = read_file(msg["text"])
    except ImportProblem as err:
        connection.send_result(msg["id"], {"problem": _problem(err)})
        return
    engine = runtime.engine
    result = preview(parsed, household.members, engine.plan["activities"], engine.rewards["rewards"])
    # Chores that need a look: a restore fills in the files that couldn't be read and keeps the rest (spec 15.3).
    result["fills_in"] = runtime.state == STATE_NEEDS_A_LOOK
    connection.send_result(msg["id"], {"preview": result})


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/import/apply",
    vol.Required("text"): vol.All(str, vol.Length(max=MAX_FILE_LENGTH)),
    vol.Optional("choices", default={}): dict,
    SESSION: str,
})
@websocket_api.async_response
async def ws_import_apply(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Import what the preview showed, with the parent's choices: people first, then chores, rewards, and rules."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or (context := parent_for(hass, connection, msg)) is None:
        return
    household, by = context
    if runtime.state == STATE_NEWER:
        code, text = STATE_MESSAGES[STATE_NEWER]
        send_refusal(connection, msg, code, text)
        return
    try:
        parsed = read_file(msg["text"])
    except ImportProblem as err:
        connection.send_result(msg["id"], {"problem": _problem(err)})
        return
    fills_in = runtime.state == STATE_NEEDS_A_LOOK
    if fills_in and parsed["format"] != FORMAT_HOUSEHOLD:
        send_refusal(connection, msg, "chores_need_a_look", "Restore from a PlanaVista file, or start over, before importing a plan."
        )
        return
    # Everything is checked first, against what's here now (files that couldn't be read are empty), and nothing
    # is written until it all passes: a file with problems leaves chores that need a look as they were.
    engine = runtime.engine
    entry = runtime.entry
    rows = list(entry.data.get(CONF_CALENDARS, [])) if entry is not None else []
    try:
        changes = plan_import(
            parsed, msg["choices"], household.members, engine.plan["activities"], engine.rewards["rewards"],
            engine.settings, persons={s.entity_id for s in hass.states.async_all("person")},
            calendars={row["entity_id"] for row in rows},
        )
    except ImportProblem as err:
        connection.send_result(msg["id"], {"problem": _problem(err)})
        return
    try:
        members = import_members(household.members, changes["members_add"], changes["members_update"])
        check_parent_pins(
            household.members, members, household.pins, household.pins, _screens_need_parent_pin(hass, household, connection)
        )
    except MemberError as err:
        problem = ImportProblem(
            "invalid_file", "This file has problems, so nothing was imported.",
            [{"item": err.member or "People", "code": err.code, "of": "member"}],
        )
        connection.send_result(msg["id"], {"problem": _problem(problem)})
        return
    if fills_in:
        await runtime.async_recover()
    if members != household.members:
        household.members = members
        await household.async_save()
    if not runtime.enabled:
        await runtime.async_set_enabled(True)  # importing chores turns chores on
    await runtime.async_sync_members()
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.apply_import(now, changes, by=by, source=source))
    if out is None:
        return
    if changes["calendars"] and entry is not None:
        linked = [
            {**row, "member_id": changes["calendars"][row["entity_id"]]} if row["entity_id"] in changes["calendars"] else row
            for row in rows
        ]
        await async_apply_config(hass, entry, {**entry.data, CONF_CALENDARS: linked})
    connection.send_result(msg["id"], {"summary": changes["summary"]})


@websocket_api.websocket_command({vol.Required("type"): "planavista/export", SESSION: str})
@callback
def ws_export(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """The household as a PlanaVista file: people, chores, rewards, and rules (never PINs, stars, or history)."""
    runtime = _runtime(hass, connection, msg, ready=False)
    if runtime is None or (context := parent_for(hass, connection, msg, needs_file=False)) is None:
        return
    household, _by = context
    if runtime.state in (STATE_NEEDS_A_LOOK, STATE_NEWER):
        code, text = STATE_MESSAGES[runtime.state]
        send_refusal(connection, msg, code, text)
        return
    rows = runtime.entry.data.get(CONF_CALENDARS, []) if runtime.entry is not None else []
    now = dt_util.now()
    file = export_household(
        household.members, rows, runtime.engine.plan, runtime.engine.rewards,
        version=VERSION, exported=now.isoformat(timespec="seconds"),
    )
    connection.send_result(msg["id"], {"file": file, "name": f"planavista-household-{now.date().isoformat()}.json"})


CHORES_COMMANDS = (
    ws_chores_subscribe,
    ws_chores_week,
    ws_chores_day,
    ws_chores_history,
    ws_chores_excuse_missed,
    ws_chores_complete,
    ws_chores_undo,
    ws_chores_request,
    ws_chores_review,
    ws_chores_override,
    ws_activity_save,
    ws_activity_delete,
    ws_settings_save,
    ws_chores_enable,
    ws_chores_start_over,
    ws_reward_save,
    ws_reward_delete,
    ws_reward_redeem,
    ws_surprise_open,
    ws_stars_award,
    ws_stars_history,
    ws_import_preview,
    ws_import_apply,
    ws_export,
)


@callback
def async_setup_chores_websocket(hass: HomeAssistant) -> None:
    """Register the chores commands (once per Home Assistant start)."""
    for command in CHORES_COMMANDS:
        websocket_api.async_register_command(hass, command)
