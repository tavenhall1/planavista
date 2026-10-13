"""Phone notifications: Approval requests with buttons, and evening reminders (spec 10.5, 15.4, 15.5).

Requests go to each parent's phones (the Phone row on their page) through the
legacy notify.mobile_app_* services, because notify entities can't carry
buttons. A button counts only when the event's user is linked to a parent and
the action carries that notification's one-time token: any registered phone
can fire any event through its webhook, so both checks are needed. Once a
request is answered anywhere, every copy is cleared by its tag. Tokens live in
memory, so buttons from before a restart are stale: they are ignored and the
notification is cleared, while the request still waits on the screen.

Reminders go at the evening check time to people with a phone and reminders
on, and only when chores are left. A phone Home Assistant no longer has is
logged once and listed under Needs a look; requests then show on the screen.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
import logging
import secrets
from typing import TYPE_CHECKING, Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import dt as dt_util

from ..const import CONF_DISPLAY
from .model import ChoreError
from .periods import parse_clock
from .status import left_today

if TYPE_CHECKING:
    from .runtime import ChoresRuntime

_LOGGER = logging.getLogger(__name__)

EVENT_ACTION = "mobile_app_notification_action"
ACTION_PREFIX = "PLANAVISTA"
ALLOW, DECLINE = "ALLOW", "DECLINE"
TAG_PREFIX = "planavista-"
REMINDER_TAG = "planavista-reminder"

# Button titles per kind of request (spec 10.5).
BUTTONS = {
    "completion": ("Looks good", "Send back"),
    "more_time": ("Allow", "Not this time"),
    "skip": ("Allow", "Not this time"),
    "redemption": ("Approve", "Decline"),
}


@dataclass
class _Sent:
    """One request's notifications: its token and the phones that got it."""

    token: str
    phones: set[str] = field(default_factory=set)


def clock_text(at: str, time_format: str) -> str:
    """19:00 as 7:00 PM (or 19:00 on a 24-hour calendar)."""
    clock = parse_clock(at)
    if clock is None:
        return at
    if time_format == "24h":
        return f"{clock.hour:02d}:{clock.minute:02d}"
    hour = clock.hour % 12 or 12
    return f"{hour}:{clock.minute:02d} {'AM' if clock.hour < 12 else 'PM'}"


def request_text(request: dict[str, Any], names: dict[str, str]) -> str:
    """What a request's notification says, such as "Dana finished Feed the fish (1 star)"."""
    member = names.get(request["member"], request["member"])
    kind = request["kind"]
    if kind == "completion":
        doer = names.get(request.get("done_by") or request["member"], member)
        stars = int(request.get("stars") or 0)
        worth = f" ({stars} star{'s' if stars != 1 else ''})" if stars else ""
        if doer != member:
            return f"{doer} did {request['name']} for {member}{worth}."
        return f"{member} finished {request['name']}{worth}."
    if kind == "more_time":
        until = request.get("until")
        return f"{member} asks for more time on {request['name']}" + (f", until {until}." if until else ".")
    if kind == "skip":
        return f"{member} asks to skip {request['name']} this week."
    cost = int(request.get("cost") or 0)
    return f"{member} wants {request['name']} ({cost} stars)."


class ChoresNotifier:
    """Sends requests to parents' phones, answers their buttons, and sends evening reminders."""

    def __init__(self, hass: HomeAssistant, runtime: ChoresRuntime) -> None:
        """Belong to one chores runtime."""
        self.hass = hass
        self.runtime = runtime
        self._sent: dict[str, _Sent] = {}
        self._known: set[str] | None = None
        self._missing: dict[str, str] = {}
        self._unsubs: list[CALLBACK_TYPE] = []
        self._reminder: CALLBACK_TYPE | None = None
        self._reminder_at: str | None = None

    # Starting and stopping --------------------------------------------------------------------

    @callback
    def async_start(self) -> None:
        """Requests already waiting were sent before a restart; only new ones are sent."""
        if self._unsubs:
            return
        self._known = {r["id"] for r in self._open_requests()}
        self._unsubs.append(self.runtime.async_listen(self._on_change))
        self._unsubs.append(self.runtime.async_listen_events(self._on_event))
        self._unsubs.append(self.hass.bus.async_listen(EVENT_ACTION, self._on_action))
        self._schedule_reminder()

    @callback
    def async_stop(self) -> None:
        """Stop listening and forget the timer."""
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        if self._reminder is not None:
            self._reminder()
            self._reminder = None
        self._reminder_at = None

    def problems(self) -> list[dict[str, str]]:
        """Phones Home Assistant doesn't have anymore (Needs a look, spec 15.4): every phone someone lists
        whose notify service is gone, from the start and until it's removed from them."""
        found = []
        for member in self.runtime.household.members:
            for phone in member.get("phones") or []:
                domain, _, service = str(phone).partition(".")
                if not self.hass.services.has_service(domain, service):
                    found.append({"member": member["id"], "phone": phone})
        return sorted(found, key=lambda p: (p["phone"], p["member"]))

    # Requests ---------------------------------------------------------------------------------

    def _open_requests(self) -> list[dict[str, Any]]:
        return self.runtime.engine.open_requests() if self.runtime.available else []

    @callback
    def _on_change(self) -> None:
        """After every change: send new requests, clear answered ones, keep the reminder's time."""
        if self._reminder_at != self._evening_check():
            self._schedule_reminder()
        if not self.runtime.available:
            return
        requests = {r["id"]: r for r in self._open_requests()}
        known = self._known if self._known is not None else set()
        for request_id in requests.keys() - known:
            self.hass.async_create_task(self._async_send(requests[request_id]), eager_start=True)
        for request_id in known - requests.keys():
            self.hass.async_create_task(self._async_clear(request_id), eager_start=True)
        self._known = set(requests)

    def _parents_to_ask(self) -> list[dict[str, Any]]:
        return [
            m for m in self.runtime.household.members
            if m.get("parent") and m.get("phones") and (m.get("notify") or {}).get("requests", True)
        ]

    def _reachable(self, phone: str, member_id: str) -> str | None:
        """The notify service of a phone Home Assistant has, or None (logged once)."""
        domain, _, service = phone.partition(".")
        if domain == "notify" and self.hass.services.has_service("notify", service):
            self._missing.pop(phone, None)
            return service
        if phone not in self._missing:
            _LOGGER.warning("PlanaVista can't reach %s; requests show on the screen until it's back", phone)
            self._missing[phone] = member_id
            self.runtime.async_notify()
        return None

    async def _async_send(self, request: dict[str, Any]) -> None:
        parents = self._parents_to_ask()
        if not parents:
            return
        names = {m["id"]: m["name"] for m in self.runtime.household.members}
        token = secrets.token_hex(8)
        allow, decline = BUTTONS.get(request["kind"], BUTTONS["completion"])
        stem = f"{ACTION_PREFIX}_{{}}_{request['id']}_{token}"
        send_back: dict[str, Any] = {"action": stem.format(DECLINE), "title": decline}
        if request["kind"] == "completion":
            # A typed reason where the phone offers it (spec 10.5).
            send_back.update(behavior="textInput", textInputButtonTitle=decline, textInputPlaceholder="What to fix")
        data = {
            "title": "Waiting for approval",
            "message": request_text(request, names),
            "data": {
                "tag": f"{TAG_PREFIX}{request['id']}",
                "group": "planavista",
                "actions": [{"action": stem.format(ALLOW), "title": allow}, send_back],
            },
        }
        sent = _Sent(token)
        for parent in parents:
            for phone in parent["phones"]:
                service = self._reachable(phone, parent["id"])
                if service is None:
                    continue
                await self.hass.services.async_call("notify", service, data)
                sent.phones.add(phone)
        if sent.phones:
            self._sent[request["id"]] = sent

    @callback
    def _on_event(self, event: Any) -> None:
        """A goal reached: tell the parents a surprise is waiting (milestone 10)."""
        if event.type == "goal_reached":
            self.hass.async_create_task(self._async_send_goal(event.member, event.data), eager_start=False)

    async def _async_send_goal(self, member_id: str, data: dict[str, Any]) -> None:
        member = self.runtime.household.member(member_id) or {}
        name = member.get("name", member_id)
        reward = self.runtime.engine.reward(data["reward"]) or {}
        icon = reward.get("icon")
        message = {
            "title": f"{name} reached a goal",
            "message": f"{icon + ' ' if icon else ''}{data['reward_name']}. There's a surprise waiting on {name}'s screen.",
            # News, not a question: it arrives quietly, since it can come with the 3 AM approval.
            "data": {
                "tag": f"{TAG_PREFIX}goal-{member_id}", "group": "planavista",
                "push": {"interruption-level": "passive"},  # iOS
                "channel": "PlanaVista goals", "importance": "low",  # Android
            },
        }
        for parent in self._parents_to_ask():
            for phone in parent["phones"]:
                service = self._reachable(phone, parent["id"])
                if service is not None:
                    await self.hass.services.async_call("notify", service, message)

    async def _async_clear(self, request_id: str, phones: set[str] | None = None) -> None:
        """Take a request's notifications off every phone that got them."""
        sent = self._sent.pop(request_id, None)
        targets = phones if phones is not None else (sent.phones if sent else set())
        for phone in targets:
            domain, _, service = phone.partition(".")
            if domain == "notify" and self.hass.services.has_service("notify", service):
                await self.hass.services.async_call(
                    "notify", service, {"message": "clear_notification", "data": {"tag": f"{TAG_PREFIX}{request_id}"}}
                )

    def _parent_of(self, user_id: str | None) -> str | None:
        """The parent whose Home Assistant person belongs to this user."""
        if not user_id:
            return None
        for member in self.runtime.household.members:
            person = member.get("person")
            state = self.hass.states.get(person) if member.get("parent") and person else None
            if state is not None and state.attributes.get("user_id") == user_id:
                return member["id"]
        return None

    async def _on_action(self, event: Event) -> None:
        action = event.data.get("action")
        if not isinstance(action, str) or not action.startswith(f"{ACTION_PREFIX}_"):
            return
        parts = action.split("_")
        if len(parts) != 4 or parts[1] not in (ALLOW, DECLINE):
            return
        _prefix, decision, request_id, token = parts
        sent = self._sent.get(request_id)
        if sent is None:
            # A stale button: answered already, used, or sent before a restart. Its notification goes.
            _LOGGER.debug("Ignored a stale PlanaVista notification button for %s", request_id)
            await self._async_clear(request_id, self._all_parent_phones())
            return
        if not secrets.compare_digest(sent.token, token):
            _LOGGER.debug("Ignored a PlanaVista notification button with the wrong token")
            return  # forged: the real buttons keep working
        parent = self._parent_of(event.context.user_id)
        if parent is None:
            _LOGGER.debug("Ignored a PlanaVista notification button from someone who isn't a parent")
            return
        reply = event.data.get("reply_text")
        note = reply.strip()[:200] if isinstance(reply, str) and reply.strip() else None
        self._sent.pop(request_id, None)  # each token works once
        try:
            await self.runtime.async_run(lambda e, now: e.review(
                now, request_id=request_id, allow=decision == ALLOW, by=parent, source="notification", note=note,
            ))
        except (ChoreError, ValueError) as err:
            _LOGGER.debug("A PlanaVista notification button came too late: %s", err)
        await self._async_clear(request_id, sent.phones)

    def _all_parent_phones(self) -> set[str]:
        return {phone for m in self.runtime.household.members if m.get("parent") for phone in m.get("phones") or []}

    # Reminders --------------------------------------------------------------------------------

    def _evening_check(self) -> str | None:
        return self.runtime.engine.settings.get("evening_check") if self.runtime.available else None

    @callback
    def _schedule_reminder(self) -> None:
        if self._reminder is not None:
            self._reminder()
            self._reminder = None
        at = self._evening_check()
        self._reminder_at = at
        clock = parse_clock(at) if at else None
        if clock is None:
            return
        now = dt_util.now()
        when = now.replace(hour=clock.hour, minute=clock.minute, second=0, microsecond=0)
        if when <= now:
            when = (now + timedelta(days=1)).replace(hour=clock.hour, minute=clock.minute, second=0, microsecond=0)
        self._reminder = async_track_point_in_utc_time(self.hass, self._on_reminder, when.astimezone(UTC))

    async def _on_reminder(self, _now: datetime) -> None:
        self._reminder = None
        at = self._evening_check()
        if at and self.runtime.available:
            await self._async_remind(at)
        self._schedule_reminder()

    async def _async_remind(self, at: str) -> None:
        """Remind each person with reminders on who still has chores today (spec 10.5)."""
        entry = self.runtime.entry
        time_format = ((entry.data.get(CONF_DISPLAY) or {}).get("time_format") if entry else None) or "12h"
        for member in self.runtime.household.members:
            if not member.get("phones") or not (member.get("notify") or {}).get("reminders"):
                continue
            view = self.runtime.member_view(member["id"])
            left = left_today(view) if view else []
            if not left:
                continue
            count = f"{len(left)} chore{'s' if len(left) != 1 else ''} left"
            data = {
                "title": "Chores",
                "message": f"{clock_text(at, time_format)}: {count}",
                "data": {"tag": REMINDER_TAG, "group": "planavista"},
            }
            for phone in member["phones"]:
                service = self._reachable(phone, member["id"])
                if service is not None:
                    await self.hass.services.async_call("notify", service, data)
