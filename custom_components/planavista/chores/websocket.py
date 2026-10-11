"""WebSocket commands for the card's chores screens (spec section 10.7).

Every command checks the rule in spec 9.5 with the command's PIN session:
member-level changes (check off, uncheck, plan a day, ask for more time or a
skip, redeem) and parent-level ones (approve, edit, excuse, stars, settings).
On a shared screen, a refused member-level change answers pin_required with
the member whose PIN (or a parent's) would allow it.
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..household.permissions import member_level
from ..household.store import Household
from ..household.websocket import account_for, parent_for, refuse, session_for
from .access import message, source_of
from .engine import ChoresEngine, Item, Outcome
from .model import ChoreError
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
        connection.send_error(msg["id"], "not_loaded", "PlanaVista is not set up yet.")
        return None
    if ready and not runtime.available:
        code, text = STATE_MESSAGES[runtime.state]
        connection.send_error(msg["id"], code, text)
        return None
    return runtime


@callback
def _member_by(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any], household: Household, target: str
) -> str | None:
    """Who a member-level change to `target`'s items is attributed to, or None after refusing."""
    account = account_for(hass, household, connection.user)
    by = member_level(account, session_for(household, connection, msg), target, target in household.pins)
    if by is not None:
        return by
    if account.screen_rules:
        member = household.member(target) or {}
        connection.send_error(msg["id"], "pin_required", f"{member.get('name', target)}'s PIN or a parent's is needed.")
    else:
        refuse(connection, msg, account)
    return None


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
        connection.send_error(msg["id"], err.code, message(err))
    except ChoresUnavailable:
        code, text = STATE_MESSAGES.get(runtime.state, ("chores_off", "Turn on chores first."))
        connection.send_error(msg["id"], code, text)
    return None


@callback
def _item(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any], runtime: ChoresRuntime
) -> Item | None:
    """Today's occurrence named by the command, or None after saying it can't change now."""
    item = runtime.engine.find_item(msg["occurrence"], runtime.now())
    if item is None:
        connection.send_error(msg["id"], "period_closed", "The day had ended.")
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
        connection.send_error(msg["id"], err.code, message(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({
    vol.Required("type"): "planavista/chores/complete",
    vol.Required("occurrence"): str,
    vol.Optional("done_by"): str,
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
    source = _source(hass, household, connection)
    out = await _apply(connection, msg, runtime, lambda e, now: e.complete(
        now, key=item.occ.key, done_by=msg.get("done_by"), by=by, source=source, user=connection.user.id,
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
        connection.send_error(msg["id"], code, text)
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
        connection.send_error(msg["id"], "nothing_to_fix", "Chores don't need a look.")
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
    """A member spends stars on a reward (it waits for a parent unless it needs no OK)."""
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
    ws_stars_award,
)


@callback
def async_setup_chores_websocket(hass: HomeAssistant) -> None:
    """Register the chores commands (once per Home Assistant start)."""
    for command in CHORES_COMMANDS:
        websocket_api.async_register_command(hass, command)
