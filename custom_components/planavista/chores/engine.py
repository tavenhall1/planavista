"""The chores engine: plan + time + log -> what's due, credit, stars, streaks, rollover (spec 8).

One engine decides everything; the card, the to-do lists, sensors, events,
and actions are projections of it (spec principle 2). It works on the three
documents of the chores Stores (plan, log, rewards) and the household's
members, changing them in place, and every write returns an Outcome: its
result, the events to fire, and which documents changed. Time is passed in,
so tests can run months in milliseconds. Nothing here imports Home Assistant.
"""
from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass, field, replace
from datetime import UTC, date, datetime, time, timedelta, tzinfo
import os
import time as wall_time
from typing import Any

from .model import (
    MAX_ACTIVITIES,
    MAX_REWARDS,
    ChoreError,
    build_activity,
    build_reward,
    build_settings,
    make_id,
    on_board,
)
from .occurrences import (
    Generator,
    Occurrence,
    counted_on,
    parse_key,
    section_on,
    visible_on,
    with_overrides,
)
from .periods import BANDS, Clock, WeekRule, parse_clock
from .recurrence import instances, last_instance, parse_rule

AUTO = "auto"
RETENTION = timedelta(days=90)
REPEAT_WINDOW = timedelta(seconds=60)
CREDITED = ("done", "pending")
OPEN = ("open", "sent_back")
SECTIONS = ("overdue", "today", "week")
WEEKDAY_NAMES = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
MONTH_NAMES = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
MAX_UNTIL_DAYS = 60
EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed")
_CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def new_ulid() -> str:
    """A ULID: 48 bits of milliseconds and 80 random bits, in Crockford base 32."""
    value = (int(wall_time.time() * 1000) << 80) | int.from_bytes(os.urandom(10), "big")
    return "".join(_CROCKFORD[(value >> shift) & 31] for shift in range(125, -1, -5))


@dataclass
class ChoreEvent:
    """Something an `event.<member>_chores` entity reports (spec 10.2)."""

    type: str
    member: str
    data: dict[str, Any]


@dataclass
class Outcome:
    """What a write did: its result, response data, events to fire, documents to save."""

    result: str | None = None
    data: dict[str, Any] = field(default_factory=dict)
    events: list[ChoreEvent] = field(default_factory=list)
    changed: set[str] = field(default_factory=set)

    def merge(self, other: Outcome) -> Outcome:
        """Add another outcome's events and changes to this one."""
        self.events.extend(other.events)
        self.changed |= other.changed
        return self


@dataclass
class Item:
    """An occurrence as it stands on one chore day."""

    occ: Occurrence
    section: str
    moved_from: date | None
    status: str
    completion: dict[str, Any] | None
    counted: bool
    overdue_since: date | None = None
    request: dict[str, Any] | None = None

    @property
    def satisfied(self) -> bool:
        """Done, waiting for OK, excused, or away: nothing more is owed today."""
        return self.status not in OPEN


@dataclass
class _Index:
    latest: dict[str, dict[str, Any]]
    overrides: dict[str, dict[str, Any]]
    requests: dict[str, dict[str, Any]]
    carried: dict[str, dict[str, Any]]


def _day(value: str) -> date:
    return date.fromisoformat(value)


def _at(value: str) -> datetime:
    return datetime.fromisoformat(value)


def short_day(day: date, today: date) -> str:
    """"Mon" within a week of today, otherwise "Oct 3" (for to-do descriptions)."""
    if abs((day - today).days) <= 6:
        return WEEKDAY_NAMES[day.weekday()]
    return f"{MONTH_NAMES[day.month - 1]} {day.day}"


def needs_ok(doer: Mapping[str, Any], activity: Mapping[str, Any] | None) -> bool:
    """Whether a check-off by `doer` waits for a parent's OK (spec 8.5 step 3, 10.3)."""
    if doer.get("parent"):
        return False
    if activity and activity.get("needs_ok_always"):
        return True
    setting = doer.get("needs_ok_for", "none")
    return setting == "all" or (setting == "marked" and bool(activity and activity.get("needs_ok")))


def away_on(member: Mapping[str, Any], day: date) -> Mapping[str, Any] | None:
    """The member's Away range holding `day`, if any (spec 8.11)."""
    for span in member.get("away") or []:
        try:
            if _day(span["from"]) <= day <= _day(span["to"]):
                return span
        except (KeyError, TypeError, ValueError):
            continue
    return None


def with_away(away: Iterable[Mapping[str, Any]], start: date, end: date, note: str | None) -> list[dict[str, Any]]:
    """Away ranges after marking `start` to `end` away (ranges that overlap are joined)."""
    spans = [dict(span) for span in away]
    merged = {"from": start.isoformat(), "to": end.isoformat(), "note": note}
    kept = []
    for span in spans:
        if _day(span["to"]) + timedelta(days=1) < start or _day(span["from"]) > end + timedelta(days=1):
            kept.append(span)
        else:
            merged["from"] = min(merged["from"], span["from"])
            merged["to"] = max(merged["to"], span["to"])
            merged["note"] = note if note is not None else span.get("note")
    return sorted([*kept, merged], key=lambda span: span["from"])


def without_away(away: Iterable[Mapping[str, Any]], start: date, end: date | None) -> list[dict[str, Any]]:
    """Away ranges after `start` (to `end`, or for good) is no longer away."""
    result = []
    for span in away:
        first, last = _day(span["from"]), _day(span["to"])
        if last < start or (end is not None and first > end):
            result.append(dict(span))
            continue
        if first < start:
            result.append({**span, "to": (start - timedelta(days=1)).isoformat()})
        if end is not None and last > end:
            result.append({**span, "from": (end + timedelta(days=1)).isoformat()})
    return sorted(result, key=lambda span: span["from"])


class ChoresEngine:
    """The engine for one household. Methods take `now`; writes return an Outcome."""

    def __init__(
        self,
        plan: dict[str, Any],
        log: dict[str, Any],
        rewards: dict[str, Any],
        members: Iterable[Mapping[str, Any]],
        *,
        tz: tzinfo,
        new_id: Callable[[], str] = new_ulid,
    ) -> None:
        """Wrap loaded documents (they are changed in place)."""
        self.plan = plan
        self.log = log
        self.rewards = rewards
        self.members: list[dict[str, Any]] = [dict(m) for m in members]
        self._tz = tz
        self._new_id = new_id

    # Configuration ------------------------------------------------------------

    @property
    def settings(self) -> dict[str, Any]:
        """Rules and Reminders."""
        return self.plan["settings"]

    @property
    def clock(self) -> Clock:
        """Chore days in Home Assistant's time zone, with the household's day start and weeks."""
        return Clock(
            self._tz,
            parse_clock(self.settings.get("day_starts")) or time(3, 0),
            WeekRule.from_dict(self.log.get("weeks")),
        )

    def generator(self) -> Generator:
        """What turns the plan into occurrences."""
        return Generator(
            self.clock, int(self.settings.get("minutes_per_star", 15)), self.policy_on, self._active_from()
        )

    def _active_from(self) -> date:
        """The first chore day since chores were last turned on (nothing earlier is owed)."""
        try:
            return _day(self.log["active_from"]) if self.log.get("active_from") else date.min
        except (TypeError, ValueError):
            return date.min

    def policy_on(self, day: date) -> str:
        """The missed policy for chore day `day`: a change takes effect at the next day boundary."""
        policy = self.log.get("policy") or {}
        since, before = policy.get("since"), policy.get("before")
        if since and before and day < _day(since):
            return before
        return self.settings["missed"]

    def set_members(self, members: Iterable[Mapping[str, Any]]) -> None:
        """The household's members changed (names, away, settings)."""
        self.members = [dict(m) for m in members]

    def set_time_zone(self, tz: tzinfo) -> None:
        """Home Assistant's time zone changed: boundaries follow it from the next one on."""
        self._tz = tz

    def set_first_day(self, first_day: str, now: datetime) -> bool:
        """The calendar's first day changed; weeks follow from the next week boundary (spec 8.1)."""
        if self.log.get("weeks") is None:
            self.log["weeks"] = WeekRule(first_day).as_dict()
            return True
        rule = WeekRule.from_dict(self.log["weeks"])
        changed = rule.changed_to(first_day, self.today(now))
        if changed == rule:
            return False
        self.log["weeks"] = changed.as_dict()
        return True

    def _stamp(self, moment: datetime) -> str:
        """How records store a time: local, with its offset."""
        return moment.astimezone(self._tz).isoformat()

    def today(self, now: datetime) -> date:
        """The chore day `now` falls in."""
        return self.clock.chore_date(now)

    def member(self, member_id: str | None) -> dict[str, Any] | None:
        """The member with this id."""
        return next((m for m in self.members if m["id"] == member_id), None)

    def member_ids(self) -> list[str]:
        """Members in board order."""
        return [m["id"] for m in sorted(self.members, key=lambda m: (m.get("order", 0), m["id"]))]

    def activity(self, chore_id: str | None) -> dict[str, Any] | None:
        """The chore with this id."""
        return next((a for a in self.plan["activities"] if a["id"] == chore_id), None)

    def reward(self, reward_id: str | None) -> dict[str, Any] | None:
        """The reward with this id."""
        return next((r for r in self.rewards["rewards"] if r["id"] == reward_id), None)

    # Reading --------------------------------------------------------------------

    def _index(self) -> _Index:
        latest: dict[str, dict[str, Any]] = {}
        for completion in self.log["completions"]:
            if completion.get("state") != "undone":
                latest[completion["occurrence"]] = completion
        overrides: dict[str, dict[str, Any]] = defaultdict(dict)
        for record in self.log["overrides"]:
            for name in ("planned_day", "due", "assignee", "excused", "note"):
                if name in record:
                    overrides[record["occurrence"]][name] = record[name]
        requests = {
            r["occurrence"]: r for r in self.log["requests"] if r.get("state") == "open"
        }
        carried = {c["key"]: c for c in self.log["carried"]}
        return _Index(latest, dict(overrides), requests, carried)

    def _occurrences_on(self, day: date, index: _Index) -> list[Occurrence]:
        gen = self.generator()
        clock = gen.clock
        members = set(self.member_ids())
        found: dict[str, Occurrence] = {}
        for activity in self.plan["activities"]:
            if not on_board(activity):
                continue
            for kind, start in gen.periods_on(activity, day):
                for owner in activity["assignees"]:
                    if owner not in members:
                        continue
                    for occ in gen.period_occurrences(activity, owner, kind, start):
                        occ = with_overrides(occ, index.overrides.get(occ.key, {}), members, clock)
                        if visible_on(occ, day, clock):
                            found[occ.key] = occ
        # Occurrences kept on the board past their period by a later due date.
        for key, changes in index.overrides.items():
            if key in found or "due" not in changes or key in index.carried:
                continue
            parsed = parse_key(key)
            activity = self.activity(parsed[0]) if parsed else None
            occ = gen.from_key(activity, key) if activity else None
            if occ is None or occ.owner not in members:
                continue
            occ = with_overrides(occ, changes, members, clock)
            if visible_on(occ, day, clock):
                found[key] = occ
        return list(found.values())

    def _is_away(self, occ: Occurrence, day: date) -> bool:
        member = self.member(occ.member)
        if member is None or not member.get("away"):
            return False
        if occ.planned is not None:
            return away_on(member, occ.planned) is not None
        if occ.due is None:
            return False
        clock = self.clock
        first = max(occ.appears, clock.week_start(day))
        last = min(clock.due_day(occ.due), clock.week_end(day) - timedelta(days=1))
        days = [first + timedelta(days=n) for n in range((last - first).days + 1)]
        return bool(days) and all(away_on(member, d) is not None for d in days)

    def _status(self, occ: Occurrence, completion: dict[str, Any] | None, day: date) -> str:
        state = completion.get("state") if completion else None
        if state in CREDITED:
            return state
        if occ.excused:
            return "excused"
        if self._is_away(occ, day):
            return "away"
        return "sent_back" if state == "sent_back" else "open"

    def _carried_occurrence(self, record: Mapping[str, Any]) -> Occurrence:
        return Occurrence(
            key=record["key"],
            chore=record["chore"],
            owner=record["owner"],
            member=record["member"],
            period=record["period"],
            n=int(record["n"]),
            appears=_day(record["since"]),
            planned=None,
            due=_at(record["due"]) if record.get("due") else None,
            band=record.get("band"),
            credit_minutes=float(record["credit_minutes"]),
            stars=int(record["stars"]),
            window=record.get("window", "day"),
        )

    def _items_on(self, day: date, index: _Index) -> dict[str, list[Item]]:
        clock = self.clock
        members = set(self.member_ids())
        items: dict[str, list[Item]] = defaultdict(list)
        present: set[str] = set()
        for occ in self._occurrences_on(day, index):
            section, moved = section_on(occ, day)
            completion = index.latest.get(occ.key)
            items[occ.member].append(
                Item(
                    occ,
                    section,
                    moved,
                    self._status(occ, completion, day),
                    completion,
                    counted_on(occ, day, clock),
                    request=index.requests.get(occ.key),
                )
            )
            present.add(occ.key)
        for key, record in index.carried.items():
            if key in present or record["member"] not in members or self.activity(record["chore"]) is None:
                continue
            completion = index.latest.get(key)
            done_earlier = (
                completion is not None
                and completion.get("state") in CREDITED
                and clock.chore_date(_at(completion["at"])) < day
            )
            if done_earlier:
                continue
            occ = self._carried_occurrence(record)
            overrides = index.overrides.get(key, {})
            if overrides.get("excused"):
                occ = replace(occ, excused=True)
            items[occ.member].append(
                Item(
                    occ,
                    "overdue",
                    None,
                    self._status(occ, completion, day),
                    completion,
                    True,
                    overdue_since=_day(record["since"]),
                    request=index.requests.get(key),
                )
            )
            present.add(key)
        # Check-offs from today whose occurrence the plan no longer makes (an edit since).
        for completion in self.log["completions"]:
            key = completion["occurrence"]
            if (
                key in present
                or completion.get("state") not in CREDITED
                or completion["member"] not in members
                or clock.chore_date(_at(completion["at"])) != day
            ):
                continue
            parsed = parse_key(key)
            if parsed is None:
                continue
            occ = Occurrence(
                key=key, chore=completion["chore"], owner=parsed[1], member=completion["member"],
                period=parsed[2], n=parsed[3], appears=day, planned=day, due=clock.day_end(day),
                band=None, credit_minutes=float(completion["credit_minutes"]),
                stars=int(completion["stars"]), window="day",
            )
            items[occ.member].append(Item(occ, "today", None, completion["state"], completion, True))
            present.add(key)
        return items

    def _order(self) -> dict[str, int]:
        return {a["id"]: index for index, a in enumerate(self.plan["activities"])}

    def _sorted(self, items: list[Item], band_now: str) -> list[Item]:
        order = self._order()
        current = BANDS.index(band_now)

        def rank(item: Item) -> tuple[Any, ...]:
            band = BANDS.index(item.occ.band) if item.occ.band in BANDS else current
            return (
                SECTIONS.index(item.section),
                item.overdue_since or date.min,
                band if item.section == "today" else 0,
                item.moved_from or date.min,
                order.get(item.occ.chore, len(order)),
                item.occ.owner,
                item.occ.n,
            )

        return sorted(items, key=rank)

    def items(self, now: datetime, day: date | None = None) -> dict[str, list[Item]]:
        """Every member's occurrences on a chore day (default today), in board order."""
        day = day or self.today(now)
        band = self.clock.band(now)
        return {
            member: self._sorted(found, band)
            for member, found in self._items_on(day, self._index()).items()
        }

    @staticmethod
    def stats(items: Iterable[Item]) -> dict[str, Any]:
        """Due and done counts and minutes; Waiting for OK counted separately (spec 8.14)."""
        result = {"due": 0, "done": 0, "pending": 0, "minutes_due": 0.0, "minutes_done": 0.0, "minutes_pending": 0.0}
        for item in items:
            if item.status in ("away", "excused"):
                continue
            minutes = item.occ.credit_minutes
            result["due"] += 1
            result["minutes_due"] += minutes
            if item.status == "done":
                result["done"] += 1
                result["minutes_done"] += minutes
            elif item.status == "pending":
                result["pending"] += 1
                result["minutes_pending"] += minutes
        for key in ("minutes_due", "minutes_done", "minutes_pending"):
            result[key] = round(result[key], 2)
        return result

    def _week_items(self, week: date, index: _Index) -> dict[str, dict[str, Item]]:
        """Each member's occurrences due within a chore week, by key (latest state)."""
        clock = self.clock
        end = clock.week_end(week)
        result: dict[str, dict[str, Item]] = defaultdict(dict)
        day = week
        while day < end:
            for member, found in self._items_on(day, index).items():
                for item in found:
                    due = item.occ.due
                    if item.section == "overdue" or due is None:
                        continue
                    if week <= clock.due_day(due) < end:
                        result[member][item.occ.key] = item
            day += timedelta(days=1)
        return result

    def contribution(self, member_id: str, first: date, end: date) -> dict[str, float]:
        """Minutes credited to `member_id` as the doer from `first` to before `end` (spec 8.14)."""
        clock = self.clock
        total = shared = 0.0
        for completion in self.log["completions"]:
            if completion.get("done_by") != member_id or completion.get("state") not in CREDITED:
                continue
            if not first <= clock.chore_date(_at(completion["at"])) < end:
                continue
            minutes = float(completion.get("credit_minutes", 0))
            total += minutes
            activity = self.activity(completion.get("chore"))
            if activity is not None and len(activity.get("assignees", [])) >= 2:
                shared += minutes
        return {"minutes": round(total, 2), "shared_minutes": round(shared, 2)}

    def _summaries(self, member_id: str, kind: str) -> dict[date, dict[str, Any]]:
        prefix = f"{kind}:"
        return {
            _day(s["period"][len(prefix):]): s
            for s in self.log["summaries"]
            if s.get("member") == member_id and str(s.get("period", "")).startswith(prefix)
        }

    def streak(self, member_id: str, now: datetime, today_items: Iterable[Item] | None = None) -> int:
        """Chore days in a row with every item due done; away and empty days are skipped (spec 8.13)."""
        today = self.today(now)
        days = self._summaries(member_id, "day")
        count = 0
        day = today - timedelta(days=1)
        while (summary := days.get(day)) is not None:
            if not (summary.get("away") or summary.get("due", 0) == 0):
                if not summary.get("closed"):
                    break
                count += 1
            day -= timedelta(days=1)
        if today_items is None:
            today_items = self.items(now).get(member_id, [])
        due = [i for i in today_items if i.counted and i.status not in ("away", "excused")]
        if due and all(i.satisfied for i in due):
            count += 1
        return count

    def week_streak(self, member_id: str, now: datetime) -> int:
        """Chore weeks in a row with everything due done (the current week counts once it ends)."""
        weeks = self._summaries(member_id, "week")
        count = 0
        week = self.clock.week_start(self.today(now))
        while True:
            week = self.clock.week_start(week - timedelta(days=1))
            summary = weeks.get(week)
            if summary is None:
                return count
            if summary.get("away") or summary.get("due", 0) == 0:
                continue
            if not summary.get("closed"):
                return count
            count += 1

    def chore_streak(self, member_id: str, chore_id: str, now: datetime) -> int:
        """Days in a row a member did all of one daily chore ("Cat care, 12 days")."""
        today = self.today(now)
        days = self._summaries(member_id, "day")
        count = 0
        day = today - timedelta(days=1)
        while (summary := days.get(day)) is not None:
            tally = (summary.get("chores") or {}).get(chore_id)
            if tally and not summary.get("away"):
                if tally["done"] < tally["due"]:
                    break
                count += 1
            day -= timedelta(days=1)
        items = [
            i for i in self.items(now).get(member_id, [])
            if i.counted and i.occ.chore == chore_id and i.status not in ("away", "excused")
        ]
        if items and all(i.satisfied for i in items):
            count += 1
        return count

    def balance(self, member_id: str) -> int:
        """A member's stars (spec 7.5: the ledger is append-only)."""
        return sum(int(e["delta"]) for e in self.rewards["ledger"] if e.get("member") == member_id)

    def chore_minutes(self, member_id: str) -> float:
        """Every minute ever credited to a member as the doer (sensor.<member>_chore_time)."""
        return round(float((self.log.get("totals") or {}).get(member_id, 0)), 2)

    def open_requests(self) -> list[dict[str, Any]]:
        """Everything waiting for a parent, all four kinds in one list (spec 8.7)."""
        members = set(self.member_ids())
        found: list[dict[str, Any]] = []
        for c in self.log["completions"]:
            if c.get("state") == "pending" and c["member"] in members:
                activity = self.activity(c["chore"])
                found.append({
                    "id": c["id"], "kind": "completion", "member": c["member"], "done_by": c["done_by"],
                    "chore": c["chore"], "name": activity["name"] if activity else c["chore"],
                    "occurrence": c["occurrence"], "at": c["at"], "stars": c["stars"],
                })
        for r in self.log["requests"]:
            activity = self.activity(r["chore"])
            if r.get("state") == "open" and r["member"] in members and activity is not None:
                found.append({
                    "id": r["id"], "kind": r["kind"], "member": r["member"], "chore": r["chore"],
                    "name": activity["name"], "occurrence": r["occurrence"], "until": r.get("until"),
                    "at": r["at"],
                })
        for r in self.rewards["redemptions"]:
            reward = self.reward(r["reward"])
            if r.get("state") == "requested" and r["member"] in members:
                found.append({
                    "id": r["id"], "kind": "redemption", "member": r["member"], "reward": r["reward"],
                    "name": reward["name"] if reward else r["reward"], "cost": r["cost"],
                    "balance": self.balance(r["member"]), "at": r["at"],
                })
        return sorted(found, key=lambda r: r["at"])

    def find_item(self, key: str, now: datetime) -> Item | None:
        """Today's occurrence with this key, if it shows today."""
        for found in self.items(now).values():
            for item in found:
                if item.occ.key == key:
                    return item
        return None

    def open_item(self, chore_id: str, member_id: str, now: datetime) -> Item | None:
        """The member's oldest open occurrence of a chore (spec 8.5 step 1).

        Overdue first, then today's, then this week's floating, then this
        week's earlier pinned items.
        """
        candidates = [
            item for item in self.items(now).get(member_id, [])
            if item.occ.chore == chore_id and item.status in OPEN and self._still_open(item, now)
        ]

        def rank(item: Item) -> tuple[Any, ...]:
            if item.section == "overdue":
                tier = 0
            elif item.section == "today":
                tier = 1
            else:
                tier = 3 if item.moved_from else 2
            return (tier, item.overdue_since or date.min, item.moved_from or date.min, item.occ.n)

        return min(candidates, key=rank, default=None)

    @staticmethod
    def _still_open(item: Item, now: datetime) -> bool:
        due = item.occ.due
        return item.section == "overdue" or due is None or due.astimezone(UTC) > now.astimezone(UTC)

    # Views -----------------------------------------------------------------------

    def item_view(self, item: Item, day: date) -> dict[str, Any]:
        """One occurrence as the card and the actions see it."""
        occ = item.occ
        activity = self.activity(occ.chore)
        completion = item.completion
        clock = self.clock
        return {
            "key": occ.key,
            "chore": occ.chore,
            "name": activity["name"] if activity else occ.chore,
            "icon": activity.get("icon") if activity else None,
            "member": occ.member,
            "owner": occ.owner,
            "period": occ.period,
            "n": occ.n,
            "section": item.section,
            "band": occ.band,
            "planned": occ.planned.isoformat() if occ.planned else None,
            "due": occ.due.isoformat() if occ.due else None,
            "due_day": clock.due_day(occ.due).isoformat() if occ.due else None,
            "window": occ.window,
            "dated": occ.dated,
            "status": item.status,
            "counted": item.counted,
            "credit_minutes": occ.credit_minutes,
            "stars": occ.stars,
            "from": item.moved_from.isoformat() if item.moved_from else None,
            "overdue_since": item.overdue_since.isoformat() if item.overdue_since else None,
            "needs_ok": bool(activity and (activity.get("needs_ok") or activity.get("needs_ok_always"))),
            "completion": (
                {k: completion.get(k) for k in ("id", "done_by", "by", "at", "source", "state", "review", "stars")}
                if completion
                else None
            ),
            "note": (completion.get("review") or {}).get("note") if item.status == "sent_back" and completion else None,
            "request": (
                {"id": item.request["id"], "kind": item.request["kind"], "until": item.request.get("until")}
                if item.request
                else None
            ),
        }

    def description(self, item: Item, today: date) -> str | None:
        """The to-do item's description: what the status map would say (spec 10.3)."""
        if item.status == "pending":
            return "Waiting for a parent's OK"
        if item.status == "sent_back":
            note = (item.completion or {}).get("review", {}) or {}
            return f"Sent back: {note['note']}" if note.get("note") else "Sent back"
        if item.status == "done":
            return None
        if item.overdue_since:
            return f"Overdue since {short_day(item.overdue_since, today)}"
        if item.moved_from:
            return f"From {short_day(item.moved_from, today)}"
        occ = item.occ
        if occ.dated and occ.due is not None:
            return f"Due {short_day(self.clock.due_day(occ.due), today)}"
        if item.section == "week":
            return "This month" if occ.window == "month" else "This week"
        return None

    def todo_items(self, member_id: str, now: datetime) -> list[Item]:
        """A member's to-do list: open items, then today's check-offs (spec 10.3).

        Today's items first, then this week's floating ones, then make-up and
        overdue ones. Today's completed items stay checked until rollover.
        """
        today = self.today(now)
        clock = self.clock
        found = self.items(now).get(member_id, [])
        open_items = [i for i in found if i.status in OPEN and self._still_open(i, now)]

        def tier(item: Item) -> int:
            if item.section == "today":
                return 0
            if item.section == "week" and not item.moved_from:
                return 1
            return 2

        done = [
            i for i in found
            if i.status in CREDITED and i.completion and clock.chore_date(_at(i.completion["at"])) == today
        ]
        return sorted(open_items, key=tier) + done

    def board(self, now: datetime, day: date | None = None) -> dict[str, Any]:
        """The board for a chore day: everyone's items, progress, streaks, stars, requests (spec 10.7)."""
        clock = self.clock
        today = self.today(now)
        day = day or today
        index = self._index()
        band = clock.band(now)
        by_member = self._items_on(day, index)
        week = clock.week_start(day)
        week_end = clock.week_end(day)
        week_items = self._week_items(week, index)
        members: dict[str, Any] = {}
        household = {"due": 0, "done": 0, "pending": 0}
        for member_id in self.member_ids():
            found = self._sorted(by_member.get(member_id, []), band)
            counted = [i for i in found if i.counted]
            today_stats = self.stats(counted)
            week_stats = self.stats(week_items.get(member_id, {}).values())
            week_stats["percent"] = (
                round(100 * (week_stats["minutes_done"] + week_stats["minutes_pending"]) / week_stats["minutes_due"])
                if week_stats["minutes_due"]
                else None
            )
            for key in household:
                household[key] += today_stats[key]
            member = self.member(member_id) or {}
            away = away_on(member, day)
            members[member_id] = {
                "items": [self.item_view(i, day) for i in found],
                "today": today_stats,
                "week": week_stats,
                "contribution": self.contribution(member_id, week, week_end),
                "streak": self.streak(member_id, now, found if day == today else None),
                "week_streak": self.week_streak(member_id, now),
                "stars": self.balance(member_id),
                "chore_minutes": self.chore_minutes(member_id),
                "away": dict(away) if away else None,
            }
        return {
            "date": day.isoformat(),
            "today": today.isoformat(),
            "now": self._stamp(now),
            "band": band,
            "day": {"start": clock.day_start(day).isoformat(), "end": clock.day_end(day).isoformat()},
            "week": {
                "start": week.isoformat(),
                "end": week_end.isoformat(),
                "days_left": max(0, (week_end - max(day, today)).days),
            },
            "members": members,
            "household": household,
            "requests": self.open_requests(),
            "settings": dict(self.settings),
            "chores": [dict(a) for a in self.plan["activities"]],
            "rewards": [dict(r) for r in self.rewards["rewards"]],
            "needs_a_look": self.needs_a_look(),
        }

    def week_view(self, now: datetime, day: date | None = None) -> dict[str, Any]:
        """The Week view (spec 13.5): a ring per person per day, weekly chores, and fairness.

        Past days come from the summaries written at rollover; today is live;
        future days show what will be due.
        """
        clock = self.clock
        today = self.today(now)
        week = clock.week_start(day or today)
        end = clock.week_end(week)
        index = self._index()
        dates = [week + timedelta(days=n) for n in range((end - week).days)]
        live = {d: self._items_on(d, index) for d in dates if d >= today}
        week_items = self._week_items(week, index)
        members: dict[str, Any] = {}
        for member_id in self.member_ids():
            summaries = self._summaries(member_id, "day")
            member = self.member(member_id) or {}
            days = []
            for d in dates:
                away = away_on(member, d)
                if d < today:
                    summary = summaries.get(d)
                    days.append({
                        "date": d.isoformat(), "kind": "past", "away": bool(away),
                        **(
                            {key: summary.get(key) for key in ("due", "done", "pending", "closed")}
                            | {"missed": len(summary.get("missed", []))}
                            if summary
                            else {"due": None, "done": None, "pending": None, "closed": None, "missed": 0}
                        ),
                    })
                    continue
                counted = [i for i in live[d].get(member_id, []) if i.counted]
                tally = self.stats(counted)
                days.append({
                    "date": d.isoformat(),
                    "kind": "today" if d == today else "future",
                    "away": bool(away),
                    "due": tally["due"],
                    "done": tally["done"],
                    "pending": tally["pending"],
                    "closed": bool(tally["due"]) and tally["done"] + tally["pending"] == tally["due"],
                    "missed": 0,
                })
            weekly: dict[str, dict[str, Any]] = {}
            for item in week_items.get(member_id, {}).values():
                if item.occ.window not in ("week", "month") or item.status in ("away", "excused"):
                    continue
                activity = self.activity(item.occ.chore)
                entry = weekly.setdefault(item.occ.chore, {
                    "chore": item.occ.chore, "name": activity["name"] if activity else item.occ.chore,
                    "total": 0, "done": 0, "pending": 0, "from": None,
                })
                entry["total"] += 1
                if item.status == "done":
                    entry["done"] += 1
                elif item.status == "pending":
                    entry["pending"] += 1
                if item.moved_from and item.status in OPEN:
                    earliest = entry["from"]
                    entry["from"] = min(earliest, item.moved_from.isoformat()) if earliest else item.moved_from.isoformat()
            members[member_id] = {
                "days": days,
                "weekly": list(weekly.values()),
                "contribution": self.contribution(member_id, week, end),
                "away": [dict(span) for span in member.get("away") or []
                         if _day(span["to"]) >= week and _day(span["from"]) < end],
            }
        return {"week": {"start": week.isoformat(), "end": end.isoformat()}, "today": today.isoformat(), "members": members}

    def needs_a_look(self) -> list[dict[str, Any]]:
        """Chores that wait off the board because nobody is assigned (spec 7.9, 15.5)."""
        return [
            {"kind": "unassigned", "chore": a["id"], "name": a["name"]}
            for a in self.plan["activities"]
            if a.get("on_board", True) and not a.get("assignees") and not a.get("finished_at")
            and not (a.get("schedule") == "plan" and a.get("set_time"))
        ]

    def next_boundary(self, now: datetime) -> datetime:
        """When the first day not yet rolled over ends."""
        last = self.log.get("last_day")
        day = _day(last) + timedelta(days=1) if last else self.today(now)
        return self.clock.day_end(day)

    # Writing: check-offs -------------------------------------------------------

    def _credit(self, member_id: str, minutes: float) -> None:
        totals = self.log.setdefault("totals", {})
        totals[member_id] = round(float(totals.get(member_id, 0)) + minutes, 2)

    def _ledger(self, member_id: str, delta: int, reason: str, at: datetime, **extra: Any) -> None:
        self.rewards["ledger"].append(
            {"id": self._new_id(), "member": member_id, "delta": delta, "reason": reason, "at": self._stamp(at), **extra}
        )

    def _event_data(self, completion: Mapping[str, Any], state: str | None = None) -> dict[str, Any]:
        activity = self.activity(completion["chore"])
        return {
            "chore": completion["chore"],
            "chore_name": activity["name"] if activity else completion["chore"],
            "occurrence": completion["occurrence"],
            "member": completion["member"],
            "done_by": completion["done_by"],
            "source": completion["source"],
            "stars": completion["stars"],
            "state": state or completion["state"],
        }

    def _grant(self, completion: dict[str, Any], at: datetime, out: Outcome) -> None:
        if completion["stars"] > 0:
            self._ledger(completion["done_by"], completion["stars"], "chore", at, ref=completion["id"])
            out.changed.add("rewards")

    def complete(
        self,
        now: datetime,
        *,
        by: str,
        source: str,
        user: str | None = None,
        key: str | None = None,
        chore: str | None = None,
        member: str | None = None,
        done_by: str | None = None,
        approve: bool = False,
    ) -> Outcome:
        """Check something off (spec 8.5). Repeats and closed periods are no-ops, never errors.

        Name the exact occurrence with `key`, or give `chore` and `member` to
        take their oldest open one. `approve` (automations and admins only,
        filtered by the caller) skips the parent's OK.
        """
        if key is not None:
            item = self.find_item(key, now)
            if item is None:
                return Outcome("nothing_open", {"occurrence": key, "stars": 0})
        else:
            if chore is None or member is None:
                raise ChoreError("unknown_chore")
            recent = self._recent(chore, member, now)
            if recent is not None:
                return Outcome("already_done", {"occurrence": recent["occurrence"], "stars": 0})
            item = self.open_item(chore, member, now)
            if item is None:
                done = next(
                    (i for i in self.items(now).get(member, []) if i.occ.chore == chore and i.status in CREDITED),
                    None,
                )
                return Outcome(
                    "already_done" if done else "nothing_open",
                    {"occurrence": done.occ.key if done else None, "stars": 0},
                )
        if item.status in CREDITED:
            return Outcome("already_done", {"occurrence": item.occ.key, "stars": 0})
        if not self._still_open(item, now):
            return Outcome("nothing_open", {"occurrence": item.occ.key, "stars": 0})
        occ = item.occ
        doer_id = done_by or occ.member
        doer = self.member(doer_id)
        if doer is None:
            raise ChoreError("unknown_member")
        activity = self.activity(occ.chore)
        state = "pending" if not approve and needs_ok(doer, activity) else "done"
        stars = occ.stars if doer.get("stars") else 0
        completion = {
            "id": self._new_id(), "occurrence": occ.key, "chore": occ.chore, "member": occ.member,
            "done_by": doer_id, "by": by, "at": self._stamp(now), "source": source, "user": user,
            "state": state, "review": None, "credit_minutes": occ.credit_minutes, "stars": stars,
        }
        if state == "pending" and activity and activity.get("needs_ok_always"):
            completion["auto_approve"] = False  # a parent looks at it, even after the day ends
        self.log["completions"].append(completion)
        self._credit(doer_id, occ.credit_minutes)
        out = Outcome(state, {"occurrence": occ.key, "stars": stars, "completion": completion["id"]}, changed={"log"})
        if state == "done":
            self._grant(completion, now, out)
        out.events.append(ChoreEvent("completed", occ.member, self._event_data(completion)))
        self._finish_if_done(activity, now, out)
        return out

    def _recent(self, chore: str, member: str, now: datetime) -> dict[str, Any] | None:
        for completion in reversed(self.log["completions"]):
            if (
                completion["chore"] == chore
                and completion["member"] == member
                and completion.get("state") != "undone"
                and timedelta(0) <= now - _at(completion["at"]) < REPEAT_WINDOW
            ):
                return completion
        return None

    def _todays_completion(self, now: datetime, key: str | None, chore: str | None, member: str | None) -> dict[str, Any] | None:
        clock = self.clock
        today = self.today(now)
        for completion in reversed(self.log["completions"]):
            if completion.get("state") not in CREDITED or clock.chore_date(_at(completion["at"])) != today:
                continue
            if key is not None and completion["occurrence"] == key:
                if member is not None and completion["member"] != member:
                    return None  # someone else's check-off
                return completion
            if key is None and completion["chore"] == chore and completion["member"] == member:
                return completion
        return None

    def undo(
        self,
        now: datetime,
        *,
        by: str,
        source: str,
        user: str | None = None,
        key: str | None = None,
        chore: str | None = None,
        member: str | None = None,
    ) -> Outcome:
        """Uncheck today's check-off (spec 8.6): kept in history as undone, stars reversed."""
        completion = self._todays_completion(now, key, chore, member)
        if completion is None:
            return Outcome("nothing_to_undo", {"occurrence": key})
        was = completion["state"]
        completion["state"] = "undone"
        completion["undone"] = {"by": by, "at": self._stamp(now), "source": source, "user": user}
        self._credit(completion["done_by"], -float(completion["credit_minutes"]))
        out = Outcome("undone", {"occurrence": completion["occurrence"]}, changed={"log"})
        if was == "done" and completion["stars"] > 0:
            self._ledger(completion["done_by"], -completion["stars"], "undo", now, ref=completion["id"], by=by)
            out.changed.add("rewards")
        out.events.append(ChoreEvent("undone", completion["member"], self._event_data(completion, "undone")))
        activity = self.activity(completion["chore"])
        if activity is not None and activity.get("finished_at"):
            activity["finished_at"] = None
            out.changed.add("plan")
        return out

    # Writing: reviews and requests ---------------------------------------------

    def _approve(self, completion: dict[str, Any], at: datetime, by: str, note: str | None, source: str | None, out: Outcome) -> None:
        completion["state"] = "done"
        completion["review"] = {"by": by, "at": self._stamp(at), "note": note, "source": source}
        self._grant(completion, at, out)
        out.changed.add("log")
        out.events.append(ChoreEvent("approved", completion["member"], self._event_data(completion, "done")))

    def pending_for(self, chore: str, member: str) -> dict[str, Any] | None:
        """The member's latest check-off of a chore that is waiting for OK."""
        return next(
            (c for c in reversed(self.log["completions"])
             if c["chore"] == chore and c["member"] == member and c.get("state") == "pending"),
            None,
        )

    def review(
        self,
        now: datetime,
        *,
        request_id: str,
        allow: bool,
        by: str,
        note: str | None = None,
        source: str | None = None,
    ) -> Outcome:
        """Resolve any request (spec 8.7): approve or send back, allow or decline."""
        out = Outcome(changed={"log"})
        completion = next((c for c in self.log["completions"] if c["id"] == request_id), None)
        if completion is not None and completion.get("state") == "pending":
            if allow:
                self._approve(completion, now, by, note, source, out)
                out.result = "approved"
            else:
                completion["state"] = "sent_back"
                completion["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
                self._credit(completion["done_by"], -float(completion["credit_minutes"]))
                out.events.append(ChoreEvent("sent_back", completion["member"], self._event_data(completion, "sent_back")))
                out.result = "sent_back"
            out.data = {"occurrence": completion["occurrence"]}
            return out
        request = next((r for r in self.log["requests"] if r["id"] == request_id), None)
        if request is not None and request.get("state") == "lapsed":
            raise ChoreError("request_closed")
        if request is not None and request.get("state") == "open":
            request["state"] = "allowed" if allow else "declined"
            request["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
            if allow:
                change = (
                    {"due": request["until"]} if request["kind"] == "more_time" else {"excused": True}
                )
                self.log["overrides"].append(
                    {"occurrence": request["occurrence"], **change, "by": by, "at": self._stamp(now),
                     "request": request["id"]}
                )
            out.result = request["state"]
            out.data = {"occurrence": request["occurrence"]}
            return out
        redemption = next((r for r in self.rewards["redemptions"] if r["id"] == request_id), None)
        if redemption is not None and redemption.get("state") == "requested":
            out.changed = {"rewards"}
            if allow:
                if self.balance(redemption["member"]) < redemption["cost"]:
                    raise ChoreError("not_enough_stars")
                self._give(redemption, now, by, source, out)
            else:
                redemption["state"] = "declined"
                redemption["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
            out.result = "given" if allow else "declined"
            out.data = {"reward": redemption["reward"]}
            return out
        raise ChoreError("unknown_request")

    def request(
        self, now: datetime, *, kind: str, key: str, by: str, until: date | None = None
    ) -> Outcome:
        """Ask for more time or to skip this week (spec 8.7); one open request per kind."""
        if kind not in ("more_time", "skip"):
            raise ChoreError("invalid_request")
        item = self.find_item(key, now)
        if item is None or item.status not in OPEN or not self._still_open(item, now):
            raise ChoreError("not_open")
        if kind == "more_time":
            due_day = self.clock.due_day(item.occ.due) if item.occ.due else None
            if until is None or due_day is None or until <= due_day or until > self.today(now) + timedelta(days=MAX_UNTIL_DAYS):
                raise ChoreError("invalid_until")
        existing = next(
            (r for r in self.log["requests"] if r["occurrence"] == key and r["kind"] == kind and r.get("state") == "open"),
            None,
        )
        if existing is not None:
            return Outcome("open", {"request": existing["id"]})
        record = {
            "id": self._new_id(), "kind": kind, "occurrence": key, "chore": item.occ.chore,
            "member": item.occ.member, "until": until.isoformat() if until else None, "state": "open",
            "by": by, "at": self._stamp(now), "review": None,
        }
        self.log["requests"].append(record)
        return Outcome("open", {"request": record["id"]}, changed={"log"})

    _MISSING: Any = object()

    def override(
        self,
        now: datetime,
        *,
        key: str,
        by: str,
        planned_day: Any = _MISSING,
        due: Any = _MISSING,
        assignee: Any = _MISSING,
        excused: Any = _MISSING,
        note: str | None = None,
    ) -> Outcome:
        """Per-occurrence changes (spec 8.8). Who may make each is the caller's check."""
        item = self.find_item(key, now)
        if item is None:
            raise ChoreError("not_open")
        clock = self.clock
        today = self.today(now)
        record: dict[str, Any] = {"occurrence": key, "by": by, "at": self._stamp(now)}
        if planned_day is not self._MISSING:
            if planned_day is not None:
                last = clock.due_day(item.occ.due) if item.occ.due else today + timedelta(days=MAX_UNTIL_DAYS)
                if not today <= planned_day <= last:
                    raise ChoreError("invalid_planned_day")
                planned_day = planned_day.isoformat()
            record["planned_day"] = planned_day
        if due is not self._MISSING:
            if due is not None:
                if due < today:
                    raise ChoreError("invalid_due")
                due = due.isoformat()
            record["due"] = due
        if assignee is not self._MISSING:
            if assignee is not None and self.member(assignee) is None:
                raise ChoreError("unknown_member")
            record["assignee"] = assignee
        if excused is not self._MISSING:
            record["excused"] = bool(excused)
            record["note"] = note
        if len(record) == 3:
            raise ChoreError("nothing_to_change")
        self.log["overrides"].append(record)
        out = Outcome("changed", {"occurrence": key}, changed={"log"})
        if record.get("excused"):
            self._finish_if_done(self.activity(item.occ.chore), now, out)
        return out

    def excuse(self, now: datetime, *, chore: str, member: str, by: str, day: date | None = None, key: str | None = None, note: str | None = None) -> Outcome:
        """Excuse one occurrence, or a member's open items of a chore on a day (a sick day)."""
        if key is not None:
            keys = [key]
        else:
            day = day or self.today(now)
            found = [
                i for i in self.items(now, day).get(member, [])
                if i.occ.chore == chore and i.status in OPEN
            ]
            today_items = [i for i in found if i.section in ("today", "overdue")]
            keys = [i.occ.key for i in (today_items or found[:1])]
        if not keys:
            return Outcome("nothing_open", {"occurrences": []})
        out = Outcome("excused", {"occurrences": keys}, changed={"log"})
        for occurrence in keys:
            self.log["overrides"].append(
                {"occurrence": occurrence, "excused": True, "note": note, "by": by, "at": self._stamp(now)}
            )
        self._finish_if_done(self.activity(chore), now, out)
        return out

    # Writing: the plan ---------------------------------------------------------------

    def save_activity(
        self,
        now: datetime,
        changes: Mapping[str, Any],
        *,
        by: str,
        source: str,
        activity_id: str | None = None,
        rev: int | None = None,
    ) -> Outcome:
        """Add a chore or change one (spec 8.12): open occurrences follow at once, history stays."""
        activities = self.plan["activities"]
        members = set(self.member_ids())
        today = self.today(now)
        if activity_id is not None:
            index = next((i for i, a in enumerate(activities) if a["id"] == activity_id), None)
            if index is None:
                raise ChoreError("unknown_chore")
            existing = activities[index]
            if rev is not None and rev != existing.get("rev", 1):
                raise ChoreError("changed")
            activity = build_activity(existing, changes, members)
            activity["rev"] = int(existing.get("rev", 1)) + 1
            self._check_dates(activity, existing, today)
            self._note_joined(activity, existing, now)
            activities[index] = activity
        else:
            if len(activities) >= MAX_ACTIVITIES:
                raise ChoreError("too_many")
            activity = build_activity(None, changes, members)
            self._check_dates(activity, None, today)
            activity["id"] = make_id(activity["name"], (a["id"] for a in activities))
            activity["rev"] = 1
            activity["created"] = {"by": by, "source": source, "at": self._stamp(now)}
            activities.append(activity)
        return Outcome("saved", {"activity": dict(activity)}, changed={"plan"})

    def _note_joined(self, activity: dict[str, Any], existing: Mapping[str, Any], now: datetime) -> None:
        """When each person an edit adds joined the chore: they owe nothing from before."""
        before = existing.get("assignees") or []
        since = existing.get("assigned_since")
        joined = {m: at for m, at in since.items() if m in activity["assignees"]} if isinstance(since, Mapping) else {}
        joined.update({m: self._stamp(now) for m in activity["assignees"] if m not in before})
        if joined:
            activity["assigned_since"] = joined
        else:
            activity.pop("assigned_since", None)

    @staticmethod
    def _check_dates(activity: Mapping[str, Any], existing: Mapping[str, Any] | None, today: date) -> None:
        if activity.get("schedule") != "once":
            return
        before = (existing or {}).get("once") or {}
        for name in ("on", "by"):
            value = activity["once"].get(name)
            if value and value != before.get(name) and _day(value) < today:
                raise ChoreError("invalid_once", "Pick today or a later day.")

    def delete_activity(self, chore_id: str) -> Outcome:
        """Delete a chore: it leaves the board at once; past weeks and earned stars stay."""
        if self.activity(chore_id) is None:
            raise ChoreError("unknown_chore")
        self.plan["activities"] = [a for a in self.plan["activities"] if a["id"] != chore_id]
        self.log["carried"] = [c for c in self.log["carried"] if c["chore"] != chore_id]
        return Outcome("deleted", {"chore": chore_id}, changed={"plan", "log"})

    def unassign_member(self, member_id: str) -> Outcome:
        """Someone left the household: their chores wait unassigned, their history stays (spec 8.12)."""
        out = Outcome("unassigned")
        for activity in self.plan["activities"]:
            if member_id not in activity.get("assignees", []):
                continue
            activity["assignees"] = [m for m in activity["assignees"] if m != member_id]
            shares = activity.get("shares")
            if activity.get("split") == "shared" and isinstance(shares, dict):
                removed = float(shares.pop(member_id, 0))
                if activity["assignees"]:
                    activity["minimum"] = {**activity["minimum"], "hours": round(activity["minimum"]["hours"] - removed, 4)}
                else:
                    activity["split"], activity["shares"] = "each", None
            activity["rev"] = int(activity.get("rev", 1)) + 1
            out.changed.add("plan")
        for reward in self.rewards["rewards"]:
            if member_id in reward.get("who", []):
                reward["who"] = [m for m in reward["who"] if m != member_id]
                out.changed.add("rewards")
        carried = [c for c in self.log["carried"] if c["member"] != member_id]
        if len(carried) != len(self.log["carried"]):
            self.log["carried"] = carried
            out.changed.add("log")
        return out

    def save_settings(self, now: datetime, changes: Mapping[str, Any]) -> Outcome:
        """Rules and Reminders (spec 14.5). A new missed policy starts at the next day boundary."""
        settings = build_settings(self.settings, changes)
        out = Outcome("saved", {"settings": dict(settings)}, changed={"plan"})
        if settings["missed"] != self.settings["missed"]:
            today = self.today(now)
            self.log["policy"] = {"before": self.policy_on(today), "since": (today + timedelta(days=1)).isoformat()}
            out.changed.add("log")
        self.plan["settings"] = settings
        return out

    def _finish_if_done(self, activity: Mapping[str, Any] | None, now: datetime, out: Outcome) -> None:
        """A Once chore, or a Repeats chore that has ended, is finished when nothing is left open."""
        if activity is None or activity.get("finished_at") or activity.get("schedule") not in ("once", "repeats"):
            return
        if self._has_open(activity):
            return
        activity["finished_at"] = self._stamp(now)
        out.changed.add("plan")

    def _has_open(self, activity: Mapping[str, Any], rolled_over: date | None = None) -> bool:
        """Whether anything of a Once chore, or of a Repeats chore's final week, is still owed.

        After a rollover (`rolled_over` is the day that ended), occurrences due
        by then count as resolved: missed, or carried over and checked apart.
        """
        gen = self.generator()
        index = self._index()
        members = set(self.member_ids())
        if any(c["chore"] == activity["id"] and self._open_carried(c, index) for c in self.log["carried"]):
            return True
        if activity["schedule"] == "once":
            periods: list[tuple[str, date | None]] = [("once", None)]
        else:
            rule = parse_rule(activity["repeats"]["rrule"])
            start = _day(activity["repeats"]["start"])
            final = last_instance(rule, start)
            if final is None:
                return True
            periods = [("rep", day) for day in instances(rule, start, final, first=gen.clock.week_start(final))]
        for owner in activity.get("assignees", []):
            if owner not in members:
                continue
            for kind, period_start in periods:
                for occ in gen.period_occurrences(activity, owner, kind, period_start):
                    occ = with_overrides(occ, index.overrides.get(occ.key, {}), members, gen.clock)
                    if occ.excused or index.latest.get(occ.key, {}).get("state") in CREDITED:
                        continue
                    if rolled_over is not None and occ.due is not None and gen.clock.due_day(occ.due) <= rolled_over:
                        continue
                    return True
        return False

    @staticmethod
    def _open_carried(record: Mapping[str, Any], index: _Index) -> bool:
        if index.overrides.get(record["key"], {}).get("excused"):
            return False
        return index.latest.get(record["key"], {}).get("state") not in CREDITED

    # Writing: rewards and stars ---------------------------------------------------------

    def save_reward(self, changes: Mapping[str, Any], *, reward_id: str | None = None) -> Outcome:
        """Add a reward or change one (spec 8.15)."""
        rewards = self.rewards["rewards"]
        members = set(self.member_ids())
        if reward_id is not None:
            index = next((i for i, r in enumerate(rewards) if r["id"] == reward_id), None)
            if index is None:
                raise ChoreError("unknown_reward")
            reward = build_reward(rewards[index], changes, members)
            rewards[index] = reward
        else:
            if len(rewards) >= MAX_REWARDS:
                raise ChoreError("too_many")
            reward = build_reward(None, changes, members)
            reward["id"] = make_id(reward["name"], (r["id"] for r in rewards))
            rewards.append(reward)
        return Outcome("saved", {"reward": dict(reward)}, changed={"rewards"})

    def delete_reward(self, reward_id: str) -> Outcome:
        """Remove a reward from the catalog; redemptions already made stay in history."""
        if self.reward(reward_id) is None:
            raise ChoreError("unknown_reward")
        self.rewards["rewards"] = [r for r in self.rewards["rewards"] if r["id"] != reward_id]
        for redemption in self.rewards["redemptions"]:
            if redemption["reward"] == reward_id and redemption.get("state") == "requested":
                redemption["state"] = "declined"
        return Outcome("deleted", {"reward": reward_id}, changed={"rewards"})

    def _give(self, redemption: dict[str, Any], at: datetime, by: str, source: str | None, out: Outcome) -> None:
        redemption["state"] = "given"
        redemption["review"] = {"by": by, "at": self._stamp(at), "note": None, "source": source}
        self._ledger(redemption["member"], -int(redemption["cost"]), "redeemed", at, ref=redemption["id"], by=by)
        reward = self.reward(redemption["reward"])
        out.events.append(ChoreEvent("redeemed", redemption["member"], {
            "reward": redemption["reward"], "reward_name": reward["name"] if reward else redemption["reward"],
            "member": redemption["member"], "stars": int(redemption["cost"]), "source": source,
        }))

    def redeem(self, now: datetime, *, member: str, reward: str, by: str, source: str) -> Outcome:
        """Spend stars on a reward (spec 8.15): it waits for an OK unless the reward needs none."""
        found = self.reward(reward)
        if found is None:
            raise ChoreError("unknown_reward")
        person = self.member(member)
        if person is None:
            raise ChoreError("unknown_member")
        if found.get("who") and member not in found["who"]:
            raise ChoreError("not_for_member")
        if self.balance(member) < found["cost"]:
            raise ChoreError("not_enough_stars")
        redemption = {
            "id": self._new_id(), "member": member, "reward": reward, "cost": int(found["cost"]),
            "state": "requested", "by": by, "source": source, "at": self._stamp(now), "review": None,
        }
        self.rewards["redemptions"].append(redemption)
        out = Outcome("requested", {"request": redemption["id"]}, changed={"rewards"})
        if not found.get("needs_ok", True):
            self._give(redemption, now, AUTO, source, out)
            out.result = "given"
        return out

    def award_stars(self, now: datetime, *, member: str, stars: int, reason: str, by: str) -> Outcome:
        """A parent gives or takes stars by hand, with a reason (spec 8.15)."""
        if self.member(member) is None:
            raise ChoreError("unknown_member")
        if not isinstance(stars, int) or isinstance(stars, bool) or stars == 0:
            raise ChoreError("invalid_stars")
        reason = reason.strip() if isinstance(reason, str) else ""
        if not reason:
            raise ChoreError("reason_required")
        if self.balance(member) + stars < 0:
            raise ChoreError("not_enough_stars")
        self._ledger(member, stars, reason, now, by=by)
        return Outcome("awarded", {"balance": self.balance(member)}, changed={"rewards"})

    # Rollover (spec 8.9) ----------------------------------------------------------------

    def start(self, now: datetime) -> Outcome:
        """Chores start, or start again after being off: nothing before today is replayed or owed."""
        today = self.today(now)
        yesterday = (today - timedelta(days=1)).isoformat()
        if self.log.get("last_day") is not None and self.log["last_day"] >= yesterday:
            return Outcome()
        self.log["last_day"] = yesterday
        self.log["last_boundary"] = self.clock.day_start(today).isoformat()
        self.log["active_from"] = today.isoformat()
        return Outcome(changed={"log"})

    def catch_up(self, now: datetime) -> Outcome:
        """Run every day boundary that has passed, in order, once each (spec 8.9)."""
        out = Outcome()
        if self.log.get("last_day") is None:
            return out.merge(self.start(now))
        day = _day(self.log["last_day"]) + timedelta(days=1)
        while self.clock.day_end(day).astimezone(UTC) <= now.astimezone(UTC):
            out.merge(self.rollover(day))
            day += timedelta(days=1)
        return out

    def rollover(self, day: date) -> Outcome:
        """End chore day `day`: auto-approve, apply the missed policy, write summaries, prune."""
        clock = self.clock
        end = clock.day_end(day)
        out = Outcome(changed={"log"})
        if self.settings.get("auto_approve") == "day_end":
            for completion in self.log["completions"]:
                if (
                    completion.get("state") == "pending"
                    and completion.get("auto_approve", True)
                    and clock.chore_date(_at(completion["at"])) == day
                ):
                    self._approve(completion, end, AUTO, None, AUTO, out)
        index = self._index()
        by_member = self._items_on(day, index)
        policy = self.policy_on(day)
        week_ends = clock.week_end(day) == day + timedelta(days=1)
        week = clock.week_start(day)
        week_items = self._week_items(week, index) if week_ends else {}
        closing: set[str] = set()
        for member_id in self.member_ids():
            found = by_member.get(member_id, [])
            missed: list[str] = []
            carried: list[str] = []
            for item in found:
                due = item.occ.due
                if item.section == "overdue" or due is None or clock.due_day(due) != day:
                    continue
                closing.add(item.occ.key)
                if item.status not in OPEN:
                    continue
                if policy == "carry_over":
                    self.log["carried"].append(self._carry(item.occ, day))
                    carried.append(item.occ.key)
                else:
                    missed.append(item.occ.key)
                    out.events.append(ChoreEvent("missed", member_id, self._missed_data(item.occ)))
            self.log["summaries"].append(self._day_summary(member_id, day, found, missed, carried))
            if week_ends:
                self.log["summaries"].append(
                    self._week_summary(member_id, week, day + timedelta(days=1), week_items.get(member_id, {}))
                )
        self._lapse(closing, end)
        self._tidy_carried(day, index)
        self._prune(end)
        for activity in self.plan["activities"]:
            if (
                activity.get("schedule") in ("once", "repeats")
                and not activity.get("finished_at")
                and not self._has_open(activity, rolled_over=day)
            ):
                activity["finished_at"] = end.isoformat()
                out.changed.add("plan")
        self.log["last_day"] = day.isoformat()
        self.log["last_boundary"] = end.isoformat()
        return out

    def _carry(self, occ: Occurrence, day: date) -> dict[str, Any]:
        return {
            "key": occ.key, "chore": occ.chore, "owner": occ.owner, "member": occ.member,
            "period": occ.period, "n": occ.n, "due": occ.due.isoformat() if occ.due else None,
            "band": occ.band, "credit_minutes": occ.credit_minutes, "stars": occ.stars,
            "window": occ.window, "since": day.isoformat(),
        }

    def _missed_data(self, occ: Occurrence) -> dict[str, Any]:
        activity = self.activity(occ.chore)
        return {
            "chore": occ.chore, "chore_name": activity["name"] if activity else occ.chore,
            "occurrence": occ.key, "member": occ.member, "done_by": None, "source": None, "stars": 0,
            "state": "missed",
        }

    def _day_summary(self, member_id: str, day: date, found: list[Item], missed: list[str], carried: list[str]) -> dict[str, Any]:
        counted = [i for i in found if i.counted]
        due = [i for i in counted if i.status not in ("away", "excused")]
        tally = self.stats(counted)
        chores: dict[str, dict[str, int]] = {}
        for item in due:
            entry = chores.setdefault(item.occ.chore, {"due": 0, "done": 0})
            entry["due"] += 1
            entry["done"] += int(item.status in CREDITED)
        member = self.member(member_id) or {}
        return {
            "member": member_id,
            "period": f"day:{day.isoformat()}",
            **tally,
            "missed": missed,
            "carried": carried,
            "excused": [i.occ.key for i in counted if i.status == "excused"],
            "away": away_on(member, day) is not None,
            "closed": bool(due) and all(i.status in CREDITED for i in due),
            "chores": chores,
        }

    def _week_summary(self, member_id: str, week: date, end: date, items: Mapping[str, Item]) -> dict[str, Any]:
        found = list(items.values())
        due = [i for i in found if i.status not in ("away", "excused")]
        late = [i.occ.key for i in due if i.status in OPEN]
        member = self.member(member_id) or {}
        days = [week + timedelta(days=n) for n in range((end - week).days)]
        return {
            "member": member_id,
            "period": f"week:{week.isoformat()}",
            **self.stats(found),
            "missed": [k for k in late if self.policy_on(self.clock.due_day(items[k].occ.due)) != "carry_over"],
            "carried": [k for k in late if self.policy_on(self.clock.due_day(items[k].occ.due)) == "carry_over"],
            "excused": [i.occ.key for i in found if i.status == "excused"],
            "away": bool(days) and all(away_on(member, d) is not None for d in days),
            "closed": bool(due) and not late,
            "contribution": self.contribution(member_id, week, end),
        }

    def _lapse(self, keys: set[str], at: datetime) -> None:
        """Requests nobody answered before their chore's time ran out close (spec 8.7)."""
        for request in self.log["requests"]:
            if request.get("state") == "open" and request["occurrence"] in keys:
                request["state"] = "lapsed"
                request["review"] = {"by": AUTO, "at": self._stamp(at), "note": None, "source": AUTO}

    def _tidy_carried(self, day: date, index: _Index) -> None:
        """Drop overdue records once they are done or excused, or their chore or person is gone."""
        members = set(self.member_ids())
        self.log["carried"] = [
            c for c in self.log["carried"]
            if c["member"] in members and self.activity(c["chore"]) is not None and self._open_carried(c, index)
        ]

    def _prune(self, end: datetime) -> None:
        """Completions, overrides, and resolved requests older than 90 days go (spec 7.7)."""
        cutoff = end - RETENTION
        log = self.log
        log["completions"] = [c for c in log["completions"] if _at(c["at"]) >= cutoff]
        log["overrides"] = [o for o in log["overrides"] if _at(o["at"]) >= cutoff]
        log["requests"] = [r for r in log["requests"] if r.get("state") == "open" or _at(r["at"]) >= cutoff]
        self.rewards["redemptions"] = [
            r for r in self.rewards["redemptions"] if r.get("state") == "requested" or _at(r["at"]) >= cutoff
        ]
