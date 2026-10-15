"""The chores engine: plan + time + log -> what's due, credit, stars, streaks, rollover (spec 8).

One engine decides everything; the card, the to-do lists, sensors, events,
and actions are projections of it (spec principle 2). It works on the three
documents of the chores Stores (plan, log, rewards) and the household's
members, changing them in place, and every write returns an Outcome: its
result, the events to fire, and which documents changed. Time is passed in,
so tests can run months in milliseconds. Nothing here imports Home Assistant.
"""
from __future__ import annotations

from collections import Counter, defaultdict
import re
from collections.abc import Callable, Iterable, Mapping
from dataclasses import dataclass, field, replace
from datetime import UTC, date, datetime, time, timedelta, tzinfo
import os
import time as wall_time
from typing import Any

from .model import (
    ACTIVITY_FIELDS,
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
from .periods import BANDS, WEEKDAY_CODES, Clock, WeekRule, parse_clock
from .recurrence import instances, last_instance, parse_rule
from .status import describe

AUTO = "auto"
RETENTION = timedelta(days=90)
REPEAT_WINDOW = timedelta(seconds=60)
CREDITED = ("done", "pending")
# Check-offs that count for nothing: unchecked, or withdrawn when their chore was deleted (round 7).
VOID = ("undone", "withdrawn")
OPEN = ("open", "sent_back")
SECTIONS = ("overdue", "today", "week")
HISTORY_WEEKS = 6
RECENT_REDEMPTIONS = 5
MAX_UNTIL_DAYS = 60
EVENT_TYPES = ("completed", "approved", "sent_back", "undone", "missed", "redeemed", "goal_reached")
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
    # False when it counts on this day only because it was checked off then (round 10).
    own: bool = True

    @property
    def satisfied(self) -> bool:
        """Done, waiting for approval, excused, or away: nothing more is owed today."""
        return self.status not in OPEN


@dataclass
class _Index:
    latest: dict[str, dict[str, Any]]
    overrides: dict[str, dict[str, Any]]
    requests: dict[str, dict[str, Any]]
    carried: dict[str, dict[str, Any]]
    by_day: dict[date, list[dict[str, Any]]]  # credited check-offs by the chore day they were made


def _day(value: str) -> date:
    return date.fromisoformat(value)


def _at(value: str) -> datetime:
    return datetime.fromisoformat(value)


def needs_ok(doer: Mapping[str, Any], activity: Mapping[str, Any] | None) -> bool:
    """Whether a check-off by `doer` waits for a parent's approval (spec 8.5 step 3, 10.3)."""
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
        self._days: dict[str, date] = {}
        self._days_key: tuple[Any, Any] | None = None

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
            self.clock, int(self.settings.get("minutes_per_star", 15)), self.policy_on, self._active_from(),
            self._day_of,
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
        for entry in policy.get("earlier") or []:
            # Older changes, oldest first (round 15: a second change re-read the days before the first).
            if isinstance(entry, Mapping) and entry.get("until") and entry.get("missed") and day < _day(entry["until"]):
                return entry["missed"]
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

    def _day_of(self, stamp: object) -> date:
        """The chore day a stored time falls in, worked out once per time (records keep their times)."""
        key = (self._tz, self.settings.get("day_starts"))
        if key != self._days_key:
            self._days, self._days_key = {}, key
        if not isinstance(stamp, str) or not stamp:
            return date.min
        day = self._days.get(stamp)
        if day is None:
            try:
                day = self.clock.chore_date(_at(stamp))
            except (TypeError, ValueError):
                day = date.min
            self._days[stamp] = day
        return day

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
        by_day: dict[date, list[dict[str, Any]]] = defaultdict(list)
        for completion in self.log["completions"]:
            if completion.get("state") not in VOID:
                latest[completion["occurrence"]] = completion
                if completion.get("state") in CREDITED:
                    by_day[self._day_of(completion["at"])].append(completion)
        overrides: dict[str, dict[str, Any]] = defaultdict(dict)
        for record in self.log["overrides"]:
            for name in ("planned_day", "due", "assignee", "excused", "note"):
                if name in record:
                    overrides[record["occurrence"]][name] = record[name]
        requests = {
            r["occurrence"]: r for r in self.log["requests"] if r.get("state") == "open"
        }
        carried = {c["key"]: c for c in self.log["carried"]}
        return _Index(latest, dict(overrides), requests, carried, dict(by_day))

    def _occurrences_on(self, day: date, index: _Index) -> list[Occurrence]:
        gen = self.generator()
        clock = gen.clock
        members = set(self.member_ids())
        found: dict[str, Occurrence] = {}
        for activity in self.plan["activities"]:
            after_finish = False
            if not on_board(activity):
                # A finished chore's occurrences still were, on days that began before it finished (round 11:
                # its check-off's day counted it only as a check-off, and a missed one left its week).
                finished = activity.get("finished_at")
                if not finished or not on_board({**activity, "finished_at": None}):
                    continue
                after_finish = _at(finished) <= clock.day_start(day)
                activity = {**activity, "finished_at": None}
            for kind, start in gen.periods_on(activity, day):
                for owner in activity["assignees"]:
                    if owner not in members:
                        continue
                    for occ in gen.period_occurrences(activity, owner, kind, start):
                        occ = with_overrides(occ, index.overrides.get(occ.key, {}), members, clock)
                        if not visible_on(occ, day, clock):
                            continue
                        if after_finish:
                            # After it finished, only a done one's own due day still has it, so a chore done
                            # early counts there, as it would unfinished (round 12: it counted nowhere).
                            done = index.latest.get(occ.key)
                            if not (done and done.get("state") in CREDITED and occ.due is not None
                                    and clock.due_day(occ.due) == day):
                                continue
                        found[occ.key] = occ
        # Occurrences kept on the board past their period by a later due date.
        for key, changes in index.overrides.items():
            if key in found or "due" not in changes or key in index.carried:
                continue
            parsed = parse_key(key)
            activity = self.activity(parsed[0]) if parsed else None
            after_finish = False
            if activity is not None and activity.get("finished_at"):
                # Finished, it still has this later due (round 13: its last time given more time vanished).
                after_finish = _at(activity["finished_at"]) <= clock.day_start(day)
                activity = {**activity, "finished_at": None}
            occ = gen.from_key(activity, key) if activity else None
            if occ is None or occ.owner not in members:
                continue
            occ = with_overrides(occ, changes, members, clock)
            if not visible_on(occ, day, clock):
                continue
            if after_finish:
                done = index.latest.get(key)
                if not (done and done.get("state") in CREDITED and occ.due is not None and clock.due_day(occ.due) == day):
                    continue
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
            # Handed to someone else: theirs to do fresh, not the first person's check-off or note (round 8).
            if completion is not None and completion.get("member") != occ.member:
                completion = None
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
            handed = index.overrides.get(key, {}).get("assignee")
            if completion is not None and completion.get("member") != (handed if handed in members else record["member"]):
                completion = None
            done_earlier = (
                completion is not None
                and completion.get("state") in CREDITED
                and self._day_of(completion["at"]) < day
            )
            if done_earlier:
                continue
            occ = self._carried_occurrence(record)
            person = self.member(record["member"])
            if person is not None and away_on(person, _day(record["since"])) is not None:
                continue  # its own day became an away day after it carried: nothing was owed (round 15)
            overrides = index.overrides.get(key, {})
            if overrides.get("excused"):
                occ = replace(occ, excused=True)
            # Handed to someone else while overdue (round 9: it stayed with the first person).
            if overrides.get("assignee") in members:
                occ = replace(occ, member=overrides["assignee"])
            if completion is not None and completion.get("member") != occ.member:
                completion = None
            status = self._status(occ, completion, day)
            holder = self.member(occ.member)
            if status in OPEN and holder is not None and away_on(holder, day) is not None:
                status = "away"  # away today, an overdue copy waits without counting (round 15)
            items[occ.member].append(
                Item(
                    occ,
                    "overdue",
                    None,
                    status,
                    completion,
                    True,
                    overdue_since=_day(record["since"]),
                    request=index.requests.get(key),
                )
            )
            present.add(key)
        # Check-offs from today whose occurrence the plan no longer makes (an edit since); a deleted
        # chore's leave the board with it (round 8), their stars kept.
        for completion in index.by_day.get(day, ()):
            key = completion["occurrence"]
            if key in present or completion["member"] not in members or self.activity(completion["chore"]) is None:
                continue
            parsed = parse_key(key)
            if parsed is None:
                continue
            # An overdue copy checked off after its record went keeps its own due, so it never joins a
            # later week (round 12: Sunday's copy done Monday joined that week overnight; round 13: weekly,
            # repeating, and one-time chores too, from their occurrence).
            past = self._past_occurrence(key, index)
            if past is not None and past.due is not None and clock.due_day(past.due) < day:
                own_due, own_day = past.due, past.planned
            else:
                period_day = _day(parsed[2][4:]) if parsed[2].startswith("day:") else None
                own_day = period_day if period_day is not None and period_day < day else day
                own_due = clock.day_end(own_day)
            occ = Occurrence(
                key=key, chore=completion["chore"], owner=parsed[1], member=completion["member"],
                period=parsed[2], n=parsed[3], appears=day, planned=own_day, due=own_due,
                band=None, credit_minutes=float(completion["credit_minutes"]),
                stars=int(completion["stars"]), window="day",
            )
            items[occ.member].append(Item(occ, "today", None, completion["state"], completion, True, own=False))
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
        """Due and done counts and minutes; Waiting for approval counted separately (spec 8.14)."""
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

    def _week_items(
        self, week: date, index: _Index, known: Mapping[date, Mapping[str, list[Item]]] | None = None
    ) -> dict[str, dict[str, Item]]:
        """Each member's occurrences due within a chore week, by key (latest state).

        `known` holds days already worked out from the same index.
        """
        clock = self.clock
        end = clock.week_end(week)
        result: dict[str, dict[str, Item]] = defaultdict(dict)
        day = week
        while day < end:
            on_day = known.get(day) if known else None
            for member, found in (on_day if on_day is not None else self._items_on(day, index)).items():
                for item in found:
                    due = item.occ.due
                    if due is None:
                        continue
                    # An overdue copy counts in the week it came due, as anything does (round 14: given more
                    # time into the next week and carried, it counted in no week); earlier weeks' stay theirs.
                    if week <= clock.due_day(due) < end:
                        result[member][item.occ.key] = item
            day += timedelta(days=1)
        return result

    def contribution(self, member_id: str, first: date, end: date, index: _Index | None = None) -> dict[str, float]:
        """Minutes credited to `member_id` as the doer from `first` to before `end` (spec 8.14)."""
        total = shared = 0.0
        if index is not None:
            days = (first + timedelta(days=n) for n in range((end - first).days))
            found: Iterable[dict[str, Any]] = (c for day in days for c in index.by_day.get(day, ()))
        else:
            found = (
                c for c in self.log["completions"]
                if c.get("state") in CREDITED and first <= self._day_of(c["at"]) < end
            )
        for completion in found:
            if completion.get("done_by") != member_id:
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

    def star_history(self, member_id: str, limit: int = 30) -> list[dict[str, Any]]:
        """A member's latest stars, newest first: chores (by name), undos, rewards, and a parent's give or take."""
        if self.member(member_id) is None:
            raise ChoreError("unknown_member")
        completions = {c["id"]: c for c in self.log["completions"]}
        redemptions = {r["id"]: r for r in self.rewards["redemptions"]}
        found: list[dict[str, Any]] = []
        for entry in reversed(self.rewards["ledger"]):
            if entry["member"] != member_id:
                continue
            reason, name = entry["reason"], None
            if reason in ("chore", "undo"):
                completion = completions.get(entry.get("ref"))
                activity = self.activity(completion["chore"]) if completion else None
                deleted = self.log.get("deleted")
                gone = deleted.get(completion["chore"]) if completion and not activity and isinstance(deleted, Mapping) else None
                # A deleted chore keeps its name here too (round 11: "A chore").
                name = activity["name"] if activity else gone.get("name") if isinstance(gone, Mapping) else None
            elif reason == "redeemed":
                redemption = redemptions.get(entry.get("ref"))
                reward = self.reward(redemption["reward"]) if redemption else None
                name = reward["name"] if reward else None
            found.append({
                "at": entry["at"], "delta": entry["delta"], "reason": reason, "name": name, "by": entry.get("by"),
            })
            if len(found) >= limit:
                break
        return found

    def chore_minutes(self, member_id: str) -> float:
        """Every minute ever credited to a member as the doer (sensor.<member>_chore_time)."""
        return round(float((self.log.get("totals") or {}).get(member_id, 0)), 2)

    def open_requests(self, now: datetime | None = None) -> list[dict[str, Any]]:
        """Everything waiting for a parent, all four kinds in one list (spec 8.7).

        With `now`, a check-off whose time has run out says whether sending it back counts
        it as missed (round 9: it said "went back" and the child never saw it).
        """
        members = set(self.member_ids())
        found: list[dict[str, Any]] = []
        for c in self.log["completions"]:
            if c.get("state") == "pending" and c["member"] in members:
                activity = self.activity(c["chore"])
                missed = False
                occ = self._past_occurrence(c["occurrence"])
                over = now is not None and self.period_over(c["occurrence"], now)
                # Sent back, an occurrence owed nothing stays that way (rounds 12 and 13): never missed. Judged as
                # the board will show it: by its due day once that's over, else today (round 15).
                away = (self._away_when_due(occ, self._day_of(c["at"])) if over
                        else occ is not None and now is not None and self._is_away(occ, self.today(now)))
                owed = not (away or self._excused(c["occurrence"]))
                if owed and over:
                    due_day = self.clock.due_day(occ.due) if occ is not None and occ.due is not None else None
                    missed = due_day is not None and self.policy_on(due_day) != "carry_over"
                found.append({
                    "id": c["id"], "kind": "completion", "member": c["member"], "done_by": c["done_by"],
                    "chore": c["chore"], "name": activity["name"] if activity else c["chore"],
                    "occurrence": c["occurrence"], "at": c["at"], "stars": c["stars"],
                    "missed_if_sent_back": missed,
                    "stays_excused": not owed,
                    "away": away,
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

    def period_over(self, key: str, now: datetime) -> bool:
        """Whether an occurrence's time has run out: the chore day it was due has ended (rounds 4 and 5).

        The plan rebuilds it with its overrides (a strict pinned day, a dated Once
        chore, more time), as the board does; a key the plan no longer makes is
        judged by its period's dates. A Once chore with no date never runs out.
        """
        parsed = parse_key(key)
        if parsed is None:
            return True
        today = self.today(now)
        activity = self.activity(parsed[0])
        occ = self.generator().from_key(activity, key) if activity is not None else None
        finished = activity.get("finished_at") if activity is not None else None
        if occ is None and finished:
            # Finished (done, or missed at the rollover): the plan no longer makes it; its own due still says (round 6).
            occ = self.generator().from_key({**activity, "finished_at": None}, key)
            if occ is not None and occ.due is None:
                return self._day_of(finished) < today
        if occ is not None:
            occ = with_overrides(occ, self._index().overrides.get(key, {}), set(self.member_ids()), self.clock)
            return occ.due is not None and self.clock.due_day(occ.due) < today
        kind, _, value = parsed[2].partition(":")
        try:
            day = date.fromisoformat(value)
        except ValueError:
            return kind != "once"
        if kind == "day":
            return day < today
        if kind == "week":
            return self.clock.week_end(day) <= today
        return kind == "rep" and day < today

    def planned_later(self, key: str, now: datetime) -> date | None:
        """The later day an occurrence is planned for, when it doesn't show today (round 1)."""
        planned = self._index().overrides.get(key, {}).get("planned_day")
        if not isinstance(planned, str):
            return None
        day = _day(planned)
        return day if day > self.today(now) else None

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

    def _still_open(self, item: Item, now: datetime) -> bool:
        """Whether a check-off still counts: while the item shows on the board (round 5).

        A Once chore due by a time stays on the board, "Due today", until its day
        ends, so it can still be checked off (and unchecked and checked off again)
        after that time; before, the board kept it open while a hold said Done.
        """
        due = item.occ.due
        return item.section == "overdue" or due is None or self.clock.due_day(due) >= self.today(now)

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
        return describe(self.item_view(item, today), today)

    def todo_items(
        self, member_id: str, now: datetime, items: Mapping[str, list[Item]] | None = None
    ) -> list[Item]:
        """A member's to-do list: open items, then today's check-offs (spec 10.3).

        Today's items first, then this week's floating ones, then make-up and
        overdue ones. Today's completed items stay checked until rollover.
        `items` is today's `items(now)` when the caller already has them.
        """
        today = self.today(now)
        found = (items if items is not None else self.items(now)).get(member_id, [])
        open_items = [i for i in found if i.status in OPEN and self._still_open(i, now)]

        def tier(item: Item) -> int:
            if item.section == "today":
                return 0
            if item.section == "week" and not item.moved_from:
                return 1
            return 2

        done = [
            i for i in found
            if i.status in CREDITED and i.completion and self._day_of(i.completion["at"]) == today
        ]
        return sorted(open_items, key=tier) + done

    def board(
        self, now: datetime, day: date | None = None, *, items: Mapping[str, list[Item]] | None = None
    ) -> dict[str, Any]:
        """The board for a chore day: everyone's items, progress, streaks, stars, requests (spec 10.7).

        `items` is today's `items(now)` when the caller already has them.
        """
        clock = self.clock
        today = self.today(now)
        day = day or today
        index = self._index()
        band = clock.band(now)
        by_member = items if items is not None and day == today else self._items_on(day, index)
        week = clock.week_start(day)
        week_end = clock.week_end(day)
        week_items = self._week_items(week, index, {day: by_member})
        members: dict[str, Any] = {}
        household = {"due": 0, "done": 0, "pending": 0}
        week_stars = self._stars_since(clock.week_start(today))
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
                "contribution": self.contribution(member_id, week, week_end, index),
                "streak": self.streak(member_id, now, found if day == today else None),
                "week_streak": self.week_streak(member_id, now),
                "stars": self.balance(member_id),
                "week_stars": week_stars.get(member_id, 0),
                "chore_minutes": self.chore_minutes(member_id),
                "away": dict(away) if away else None,
                "surprise": self._surprise_view(member_id),
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
            "requests": self.open_requests(now),
            "settings": dict(self.settings),
            "chores": [dict(a) for a in self.plan["activities"]],
            "rewards": [dict(r) for r in self.rewards["rewards"]],
            "recent_redemptions": self.recent_redemptions(),
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
        week_items = self._week_items(week, index, live)
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
                            | {
                                "missed": len(summary.get("missed", [])),
                                "missed_items": [self._past_item(k, "missed") for k in summary.get("missed", [])],
                                "excused": len(summary.get("excused") or []),
                            }
                            if summary
                            else {
                                "due": None, "done": None, "pending": None, "closed": None,
                                "missed": 0, "missed_items": [], "excused": 0,
                            }
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
                    "excused": sum(1 for i in live[d].get(member_id, []) if i.status == "excused"),
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
                "contribution": self.contribution(member_id, week, end, index),
                "away": [dict(span) for span in member.get("away") or []
                         if _day(span["to"]) >= week and _day(span["from"]) < end],
            }
        return {"week": {"start": week.isoformat(), "end": end.isoformat()}, "today": today.isoformat(), "members": members}

    def _stars_since(self, first: date) -> dict[str, int]:
        """Stars each member earned by doing chores from chore day `first` on (the week's sticker strip).

        The ledger only grows, in time order, so this reads it from the end.
        """
        earned: dict[str, int] = defaultdict(int)
        for entry in reversed(self.rewards["ledger"]):
            if self._day_of(entry.get("at")) < first:
                break
            if entry.get("reason") in ("chore", "undo"):
                earned[entry["member"]] += int(entry["delta"])
        return {member: max(0, stars) for member, stars in earned.items()}

    def recent_redemptions(self) -> list[dict[str, Any]]:
        """The last rewards given, newest first, with who approved them (spec 13.6)."""
        given = [r for r in self.rewards["redemptions"] if r.get("state") == "given"]
        given.sort(key=lambda r: _at((r.get("review") or {}).get("at") or r["at"]), reverse=True)
        result = []
        for r in given[:RECENT_REDEMPTIONS]:
            reward = self.reward(r["reward"])
            review = r.get("review") or {}
            result.append({
                "id": r["id"], "member": r["member"], "reward": r["reward"],
                "name": reward["name"] if reward else r["reward"], "cost": r["cost"],
                "at": review.get("at") or r["at"], "by": review.get("by"),
            })
        return result

    def history(self, now: datetime, chore_id: str, member_id: str) -> dict[str, Any]:
        """The options sheet's History (spec 13.3): the streak, recent check-offs, and when it usually gets done."""
        activity = self.activity(chore_id)
        if activity is None:
            raise ChoreError("unknown_chore")
        if self.member(member_id) is None:
            raise ChoreError("unknown_member")
        clock = self.clock
        done = sorted(
            (c for c in self.log["completions"]
             if c.get("chore") == chore_id and c.get("member") == member_id and c.get("state") in CREDITED),
            key=lambda c: _at(c["at"]),
        )
        this_week = clock.week_start(self.today(now))
        done_weeks = {clock.week_start(self._day_of(c["at"])) for c in done}
        begins = self.generator().begins(activity, member_id)
        weeks = [clock.week_start(this_week - timedelta(days=7 * n)) for n in range(1, HISTORY_WEEKS + 1)]
        weeks = [w for w in weeks if clock.week_end(w) > begins]
        daily = activity.get("schedule") == "plan" and (activity.get("minimum") or {}).get("per") == "day"
        if daily:
            streak = {"days": self.chore_streak(member_id, chore_id, now)}
        else:
            summaries = self._summaries(member_id, "week")
            count = 0
            week = clock.week_start(this_week - timedelta(days=1))
            while clock.week_end(week) > begins:
                summary = summaries.get(week) or {}
                late = (summary.get("missed") or []) + (summary.get("carried") or [])
                if week not in done_weeks or any(key.startswith(f"{chore_id}|") for key in late):
                    break
                count += 1
                week = clock.week_start(week - timedelta(days=1))
            streak = {"weeks": count}
        bands = Counter(clock.band(_at(c["at"])) for c in done)
        days = Counter(WEEKDAY_CODES[self._day_of(c["at"]).weekday()] for c in done)
        return {
            "chore": chore_id,
            "member": member_id,
            "streak": streak,
            "recent": [
                {"at": c["at"], "done_by": c["done_by"], "state": c["state"], "occurrence": c["occurrence"]}
                for c in reversed(done[-5:])
            ],
            "weeks": {"done": sum(1 for w in weeks if w in done_weeks), "of": len(weeks)},
            "usual": {
                "band": bands.most_common(1)[0][0] if bands else None,
                "day": days.most_common(1)[0][0] if len(done) >= 3 and not daily else None,
            },
        }

    def day_view(self, now: datetime, day: date) -> dict[str, Any]:
        """One chore day for the Week view's day sheet (spec 13.5).

        A past day comes from the log and that day's summaries (history stays
        true); today and later days are worked out as they stand.
        """
        today = self.today(now)
        members: dict[str, Any] = {}
        if day >= today:
            found = self.items(now, day)
            for member_id in self.member_ids():
                items = [i for i in found.get(member_id, []) if i.counted]
                members[member_id] = {
                    "items": [self.item_view(i, day) for i in items],
                    "summary": None,
                    "away": away_on(self.member(member_id) or {}, day) is not None,
                }
            return {"date": day.isoformat(), "kind": "today" if day == today else "future", "members": members}
        missed_later = {k for s in self.log["summaries"] for k in s.get("missed") or []}
        for member_id in self.member_ids():
            summary = self._summaries(member_id, "day").get(day)
            items: list[dict[str, Any]] = []
            for c in self.log["completions"]:
                if c.get("member") == member_id and c.get("state") in CREDITED and self._day_of(c["at"]) == day:
                    items.append(self._past_item(c["occurrence"], c["state"], done_by=c["done_by"], at=c["at"]))
            if summary:
                for key in summary.get("missed") or []:
                    items.append(self._past_item(key, "missed"))
                for key in summary.get("carried") or []:
                    items.append(self._past_item(key, "carried"))
                for key in summary.get("excused") or []:
                    items.append(self._past_item(key, "excused"))
                # A chore that slipped its day: missed once its week ended, or not done that day.
                for key in summary.get("open") or []:
                    items.append(self._past_item(key, "missed" if key in missed_later else "open"))
            members[member_id] = {
                "items": items,
                "summary": (
                    {k: summary.get(k) for k in ("due", "done", "pending", "closed")} if summary else None
                ),
                "away": bool(summary and summary.get("away")),
            }
        return {"date": day.isoformat(), "kind": "past", "members": members}

    def _past_item(self, key: str, status: str, **extra: Any) -> dict[str, Any]:
        parsed = parse_key(key)
        chore = parsed[0] if parsed else key
        activity = self.activity(chore)
        deleted = self.log.get("deleted")
        gone = deleted.get(chore) if not activity and isinstance(deleted, Mapping) else None
        if not activity and isinstance(gone, Mapping) and isinstance(gone.get("name"), str):
            activity = gone  # a deleted chore keeps its name and picture (round 10)
        # Deleted before its name was kept: the name from its id, in words (round 9: "wipe_the_counters").
        name = activity["name"] if activity else re.sub(r"_\d+$", "", chore).replace("_", " ").capitalize()
        if status in ("missed", "open") and "note" not in extra:
            # Sent back after its day: the parent's note reaches the day's sheet (round 9).
            sent = next((c for c in reversed(self.log["completions"])
                         if c["occurrence"] == key and c.get("state") == "sent_back"), None)
            if sent is not None and (sent.get("review") or {}).get("note"):
                extra["note"] = sent["review"]["note"]
        return {
            "key": key, "chore": chore, "name": name,
            "icon": activity.get("icon") if activity else None, "status": status, **extra,
        }

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
        filtered by the caller) skips the parent's approval.
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
                and completion.get("state") not in VOID
                and timedelta(0) <= now - _at(completion["at"]) < REPEAT_WINDOW
            ):
                return completion
        return None

    def _todays_completion(self, now: datetime, key: str | None, chore: str | None, member: str | None) -> dict[str, Any] | None:
        today = self.today(now)
        for completion in reversed(self.log["completions"]):
            if completion.get("state") not in CREDITED or self._day_of(completion["at"]) != today:
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
        """The member's latest check-off of a chore that is waiting for approval."""
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
                # Its check-off may have finished a Once chore (or a Repeats chore's last time): it's open again,
                # as an Undo does (round 7: it left every list for good).
                activity = self.activity(completion["chore"])
                if activity is not None and activity.get("finished_at"):
                    activity["finished_at"] = None
                    out.changed.add("plan")
                self._sent_back_late(completion, now, out)
            out.data = {"occurrence": completion["occurrence"]}
            return out
        if completion is not None and completion.get("state") in VOID:
            raise ChoreError("request_withdrawn")  # unchecked meanwhile, or its chore deleted (round 7)
        request = next((r for r in self.log["requests"] if r["id"] == request_id), None)
        if request is not None and request.get("state") == "lapsed":
            raise ChoreError("request_closed")
        if request is not None and request.get("state") == "withdrawn":
            raise ChoreError("request_handed_on")  # its chore was handed to someone else (rounds 9 and 10)
        if request is not None and request.get("state") == "open":
            request["state"] = "allowed" if allow else "declined"
            request["review"] = {"by": by, "at": self._stamp(now), "note": note, "source": source}
            if allow:
                change = (
                    {"due": request["until"]} if request["kind"] == "more_time" else {"excused": True}
                )
                occurrences = [request["occurrence"]]
                if request["kind"] == "skip":
                    occurrences += self._week_copies(request["occurrence"], request["member"])
                for occurrence in occurrences:
                    self.log["overrides"].append(
                        {"occurrence": occurrence, **change, "by": by, "at": self._stamp(now), "request": request["id"]}
                    )
                    if change.get("excused"):
                        self._excuse_counted(occurrence)  # round 10
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
        if kind == "more_time" and item.section == "overdue":
            raise ChoreError("overdue_stays")
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
        # Overdue, it stays on the board until it's done: no new day or date (round 9: they changed nothing).
        if item.section == "overdue" and (planned_day is not self._MISSING or due is not self._MISSING):
            raise ChoreError("overdue_stays")
        if assignee is not self._MISSING and item.status in CREDITED:
            raise ChoreError("not_open")  # done or waiting: handing it on would lose it (round 9)
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
        if "assignee" in record:
            # The first person's requests were theirs; the new person asks for themselves (round 9).
            for request in self.log["requests"]:
                if request["occurrence"] == key and request.get("state") == "open":
                    request["state"] = "withdrawn"
                    request["review"] = {"by": by, "at": self._stamp(now), "note": None, "source": None}
        self.log["overrides"].append(record)
        out = Outcome("changed", {"occurrence": key}, changed={"log"})
        if record.get("excused"):
            self._excuse_counted(key)  # the days that counted it not done close again (round 10)
            self._finish_if_done(self.activity(item.occ.chore), now, out)
        return out

    def excuse(self, now: datetime, *, chore: str, member: str, by: str, day: date | None = None, key: str | None = None, note: str | None = None) -> Outcome:
        """Excuse one occurrence, or a member's open items of a chore on a day (a sick day)."""
        if key is not None:
            keys = [key]
        else:
            today = self.today(now)
            day = day or today
            found = [
                i for i in self.items(now, day).get(member, [])
                if i.occ.chore == chore and i.status in OPEN
                # Another day's overdue copies are that day's to excuse (round 11: a date excused them all).
                and (i.section != "overdue" or day == today or i.overdue_since == day)
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
            self._excuse_counted(occurrence)  # a past day's ring counts it no more (round 10)
        self._finish_if_done(self.activity(chore), now, out)
        return out

    def excuse_missed(self, now: datetime, *, key: str, by: str, note: str | None = None) -> Outcome:
        """Excuse a check-off already counted as missed (a sick day noticed later, spec 13.5).

        Every summary that lists it as missed, or as still open on a day that counted it (a
        make-up chore that slipped its day), stops counting it, so that day's ring, the week,
        and the streak hold. A day that never counted it (a weekly chore missed at the week's
        end) only lists it as excused.
        """
        counted_open = any(((s.get("keys") or {}).get(key) or [None])[0] in OPEN for s in self.log["summaries"])
        if not counted_open and not any(key in (s.get("missed") or []) for s in self.log["summaries"]):
            raise ChoreError("not_missed")
        touched = self._excuse_counted(key)
        self.log["overrides"].append(
            {"occurrence": key, "excused": True, "note": note, "late": True, "by": by, "at": self._stamp(now)}
        )
        # The streak holds only when every day it was counted on now closes (round 9), or has
        # nothing left to count, which the streak skips (round 11).
        holds = bool(touched) and all(s.get("closed") or not s.get("due") for s in touched)
        return Outcome("excused", {"occurrence": key, "streak_holds": holds}, changed={"log"})

    def _sent_back_late(self, completion: Mapping[str, Any], now: datetime, out: Outcome) -> None:
        """A check-off sent back after its day ended (round 8, r8a A2).

        Its day (and its week, once that ended) counted it as waiting for approval; it
        wasn't done. It now counts as the household's missed rule said on its due day:
        carried over, to do now, or missed. The summaries that counted it are revised, so
        the ring, the week, the doer's minutes, and the streak say so.
        """
        key = completion["occurrence"]
        today = self.today(now)
        done_day = self._day_of(completion["at"])
        if done_day >= today:
            return  # its day is still going: the board shows it again
        occ = self._past_occurrence(key)
        # Away counts once its due day is over; before it, the board puts it back and so it goes back (round 15).
        if self._excused(key) or (self.period_over(key, now) and self._away_when_due(occ, done_day)):
            # Never owed (a skip allowed, a sick day, its person away): sent back it stays that way, and the
            # days that counted it waiting count it no more (round 12: excused turned into a miss; round 13: away).
            excused = self._excused(key)
            for summary in self.log["summaries"]:
                mark = (summary.get("keys") or {}).get(key)
                if mark is not None and mark[0] in CREDITED:
                    self._restate(summary, key, "excused" if excused else "gone")
                    if excused:
                        summary["excused"] = list(dict.fromkeys(summary["excused"]))
            return
        over = self.period_over(key, now)
        due_day = self.clock.due_day(occ.due) if occ is not None and occ.due is not None else None
        carry = due_day is not None and self.policy_on(due_day) == "carry_over"
        late = "carried" if carry else "missed"
        minutes = float(completion.get("credit_minutes", 0))
        member = completion["member"]
        counted = False
        if over and carry and occ is not None and not any(c.get("key") == key for c in self.log["carried"]):
            self.log["carried"].append(self._carry(occ, due_day))
        # Summaries that recorded what they counted (round 10): exactly those that counted it waiting.
        keyed_days: set[date] = set()
        week_of = self.clock.week_start(due_day) if due_day is not None else None
        for summary in self.log["summaries"]:
            keys = summary.get("keys")
            if summary.get("member") != member or keys is None:
                continue
            period = str(summary.get("period", ""))
            if period.startswith("day:"):
                keyed_days.add(_day(period[4:]))
            on_due_day = due_day is not None and period == f"day:{due_day.isoformat()}"
            its_week = week_of is not None and period == f"week:{week_of.isoformat()}"
            final = over and (on_due_day or its_week)
            mark = keys.get(key)
            if mark is not None and mark[0] in CREDITED:
                if mark[2]:
                    self._restate(summary, key, "open", late if final else "open")
                else:
                    # Counted only because it was checked off that day: as if it never was.
                    self._restate(summary, key, "gone")
                    if final:
                        self._add_counted(summary, key, minutes, late)
                counted = counted or final
            elif mark is None and final:
                # Its due day or week didn't count it, because the check-off had finished it by then.
                if its_week or (occ is not None and counted_on(occ, due_day, self.clock)):
                    self._add_counted(summary, key, minutes, late)
                elif key not in (summary.get(late) or []):
                    summary[late] = [*(summary.get(late) or []), key]  # listed, as its rollover lists it
                counted = True
        if occ is None or due_day is None:
            if over and counted and not carry and occ is not None:
                out.events.append(ChoreEvent("missed", occ.member, self._missed_data(occ)))
            return

        def revise(summary: dict[str, Any], listed: str) -> None:
            summary["pending"] = max(0, int(summary.get("pending", 0)) - 1)
            summary["minutes_pending"] = round(max(0.0, float(summary.get("minutes_pending", 0)) - minutes), 2)
            summary[listed] = [*(summary.get(listed) or []), key]
            tally = (summary.get("chores") or {}).get(occ.chore)
            if tally:
                tally["done"] = max(0, tally["done"] - 1)
            summary["closed"] = False

        # Older summaries, without what they counted (round 9's rules):
        # every ended day from the check-off on whose ring counted it (a set day, a Repeats
        # window, an overdue copy checked off later): it wasn't done that day. Its due day, once its
        # time ran out, counts it as the missed rule says; any other day lists it as not done then.
        index = self._index()
        days = self._summaries(member, "day")
        day = done_day
        while day < today:
            summary = days.get(day) if day not in keyed_days else None
            listed_already = summary is not None and any(
                key in (summary.get(name) or []) for name in ("missed", "carried", "open")
            )
            if summary is not None and not listed_already:
                found = next((i for i in self._items_on(day, index).get(member, []) if i.occ.key == key), None)
                if found is not None and found.counted:
                    final = over and day == due_day
                    revise(summary, late if final else "open")
                    counted = counted or final
            day += timedelta(days=1)
        # Its week, once that ended.
        week = self._summaries(member, "week").get(self.clock.week_start(due_day))
        if over and week is not None and "keys" not in week and key not in (week.get(late) or []):
            revise(week, late)
            counted = True
        # The doer's minutes for the week it was checked off in, once that week ended.
        done_week = f"week:{self.clock.week_start(self._day_of(completion['at'])).isoformat()}"
        for summary in self.log["summaries"]:
            contribution = summary.get("contribution")
            if summary.get("member") != completion.get("done_by") or summary.get("period") != done_week or not contribution:
                continue
            contribution["minutes"] = round(max(0.0, float(contribution.get("minutes", 0)) - minutes), 2)
            activity = self.activity(occ.chore)
            if activity is not None and len(activity.get("assignees", [])) >= 2:
                contribution["shared_minutes"] = round(max(0.0, float(contribution.get("shared_minutes", 0)) - minutes), 2)
        if over and counted and not carry:
            out.events.append(ChoreEvent("missed", occ.member, self._missed_data(occ)))

    # What a summary counted (round 10) ----------------------------------------------
    # Each day and week summary keeps the occurrences it counted as `keys`: {key: [status,
    # minutes, own]}, own False when it counted only because it was checked off that day.
    # A correction after the fact (a late send-back, a late excuse) changes exactly the
    # summaries that counted it, instead of working out again from today's state which days
    # did (rounds 8 to 10 each found a path that guess missed). Summaries written before
    # this have no `keys` and keep the earlier rules.

    @staticmethod
    def _counted_keys(items: Iterable[Item]) -> dict[str, list[Any]]:
        return {i.occ.key: [i.status, round(float(i.occ.credit_minutes), 2), i.own] for i in items}

    @staticmethod
    def _restate(summary: dict[str, Any], key: str, to: str, listed: str | None = None) -> None:
        """Move one counted occurrence to `to` (open, excused, or gone) and work out again whether it closed."""
        status, minutes, own = summary["keys"][key]
        minutes = float(minutes or 0)
        parsed = parse_key(key)
        tally = (summary.get("chores") or {}).get(parsed[0] if parsed else None)
        if status in CREDITED:
            summary[status] = max(0, int(summary.get(status, 0)) - 1)
            name = f"minutes_{'done' if status == 'done' else 'pending'}"
            summary[name] = round(max(0.0, float(summary.get(name, 0)) - minutes), 2)
            if tally:
                tally["done"] = max(0, tally["done"] - 1)
        for name in ("missed", "carried", "open"):
            if key in (summary.get(name) or []):
                summary[name] = [k for k in summary[name] if k != key]
        if to in ("excused", "gone") and status not in ("away", "excused"):
            summary["due"] = max(0, int(summary.get("due", 0)) - 1)
            summary["minutes_due"] = round(max(0.0, float(summary.get("minutes_due", 0)) - minutes), 2)
            if tally:
                tally["due"] = max(0, tally["due"] - 1)
        if to == "gone":
            del summary["keys"][key]
        else:
            summary["keys"][key] = [to, minutes, own]
        if to == "excused":
            summary["excused"] = [*(summary.get("excused") or []), key]
        elif listed:
            summary[listed] = [*(summary.get(listed) or []), key]
        credited = int(summary.get("done", 0)) + int(summary.get("pending", 0))
        summary["closed"] = int(summary.get("due", 0)) > 0 and credited >= int(summary["due"])

    @staticmethod
    def _add_counted(summary: dict[str, Any], key: str, minutes: float, listed: str) -> None:
        """Count an occurrence its summary didn't (its check-off had finished the chore by then), as not done."""
        summary["due"] = int(summary.get("due", 0)) + 1
        summary["minutes_due"] = round(float(summary.get("minutes_due", 0)) + minutes, 2)
        summary.setdefault("keys", {})[key] = ["open", round(minutes, 2), True]
        summary[listed] = [*(summary.get(listed) or []), key]
        parsed = parse_key(key)
        if parsed and isinstance(summary.get("chores"), dict):
            tally = summary["chores"].setdefault(parsed[0], {"due": 0, "done": 0})
            tally["due"] += 1
        summary["closed"] = False

    def _week_copies(self, key: str, member: str) -> list[str]:
        """A week's other open copies of a chore for its person: a skip this week covers them all (round 15:
        allowed, it excused Tuesday's and left Friday's owed)."""
        parsed = parse_key(key)
        if parsed is None or not parsed[2].startswith("week:"):
            return []
        prefix = key.rsplit("|", 1)[0] + "|"
        week = self._week_items(_day(parsed[2][5:]), self._index())
        return [k for k, item in week.get(member, {}).items() if k != key and k.startswith(prefix) and item.status in OPEN]

    def _owes_nothing(self, key: str, occ: Occurrence | None, day: date) -> bool:
        """Excused (a skip allowed, Excuse it), or its person away when it came due: nothing was owed (round 13)."""
        return self._excused(key) or self._away_when_due(occ, day)

    def _away_when_due(self, occ: Occurrence | None, day: date) -> bool:
        """Away by the day it came due, as the rollover judged it (round 14: by the check-off's week, a chore
        due the next week came out wrong both ways); `day` only for one with no due."""
        if occ is None:
            return False
        return self._is_away(occ, self.clock.due_day(occ.due) if occ.due is not None else day)

    def _excused(self, key: str) -> bool:
        """Whether an occurrence stands excused (a skip allowed, Excuse it), by the latest word on it."""
        for record in reversed(self.log["overrides"]):
            if record.get("occurrence") == key and "excused" in record:
                return bool(record["excused"])
        return False

    def _excuse_counted(self, key: str) -> list[dict[str, Any]]:
        """A late excuse: every summary that counted the occurrence as not done stops counting it.

        Summaries that only listed it (a weekly chore missed at its week's end, not part of that
        day's ring) list it as excused instead. Returns the day summaries that counted it.
        """
        days: list[dict[str, Any]] = []
        for summary in self.log["summaries"]:
            keys = summary.get("keys")
            if keys is None:
                continue
            mark = keys.get(key)
            if mark is not None and mark[0] in OPEN:
                self._restate(summary, key, "excused")
                if str(summary.get("period", "")).startswith("day:"):
                    days.append(summary)
            elif mark is None and any(key in (summary.get(name) or []) for name in ("missed", "carried")):
                for name in ("missed", "carried"):
                    summary[name] = [k for k in (summary.get(name) or []) if k != key]
                summary["excused"] = [*(summary.get("excused") or []), key]
        return days + self._excuse_unkeyed(key)

    def _excuse_unkeyed(self, key: str) -> list[dict[str, Any]]:
        """The same for summaries without keys (written before 0.10.0, or over 40 days old): round 9's rule.

        History from before the chore began (its created time, an assignee added later, chores
        turned off and on) can't be worked out again; a day's own occurrence counted on that day.
        """
        occ = self._past_occurrence(key)
        parsed = parse_key(key)
        chore = parsed[0] if parsed else None
        own_period = parsed[2] if parsed else None
        touched: list[dict[str, Any]] = []
        for summary in self.log["summaries"]:
            missed = summary.get("missed") or []
            still_open = summary.get("open") or []
            if "keys" in summary or (key not in missed and key not in still_open):
                continue
            period = str(summary.get("period", ""))
            counted = (
                not period.startswith("day:")
                or key in still_open
                or (occ is not None and counted_on(occ, _day(period[4:]), self.clock))
                or (occ is None and own_period == period)
            )
            summary["missed"] = [k for k in missed if k != key]
            if "open" in summary:
                summary["open"] = [k for k in still_open if k != key]
            summary["excused"] = [*(summary.get("excused") or []), key]
            if counted:
                self._uncount(summary, chore, occ.credit_minutes if occ else None)
                if period.startswith("day:"):
                    touched.append(summary)
        return touched

    @staticmethod
    def _uncount(summary: dict[str, Any], chore: str | None, minutes: float | None) -> None:
        """Take one excused occurrence out of a summary's counts, and work out again whether it closed."""
        summary["due"] = max(0, int(summary.get("due", 0)) - 1)
        if minutes is not None:
            summary["minutes_due"] = round(max(0.0, float(summary.get("minutes_due", 0)) - minutes), 2)
        tally = (summary.get("chores") or {}).get(chore)
        if tally:
            tally["due"] = max(0, tally["due"] - 1)
        if str(summary.get("period", "")).startswith("week:"):
            summary["closed"] = summary["due"] > 0 and not summary.get("missed") and not summary.get("carried")
        else:
            credited = int(summary.get("done", 0)) + int(summary.get("pending", 0))
            summary["closed"] = summary["due"] > 0 and credited >= summary["due"]

    def _past_occurrence(self, key: str, index: _Index | None = None) -> Occurrence | None:
        """An occurrence worked out again from its key, with its overrides (None once its chore is gone)."""
        parsed = parse_key(key)
        activity = self.activity(parsed[0]) if parsed else None
        gen = self.generator()
        occ = gen.from_key(activity, key) if activity else None
        if occ is None and activity is not None and activity.get("finished_at"):
            occ = gen.from_key({**activity, "finished_at": None}, key)  # finished, its occurrences still were (round 10)
        if occ is None:
            return None
        return with_overrides(occ, (index or self._index()).overrides.get(key, {}), set(self.member_ids()), gen.clock)

    def _reopen_if_owed(self, activity: dict[str, Any]) -> None:
        """An edit that leaves something owed puts a finished chore back: more sessions or a later end
        (round 8), or a schedule that never finishes (round 13: edited into a Plan chore, it never showed again;
        an import's change did the same)."""
        if not activity.get("finished_at"):
            return
        if activity.get("schedule") not in ("once", "repeats"):
            activity["finished_at"] = None
            return
        probe = {**activity, "finished_at": None}
        last = self.log.get("last_day")
        if self._has_open(probe, rolled_over=_day(last) if last else None):
            activity["finished_at"] = None

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
            self._reopen_if_owed(activity)
        else:
            if len(activities) >= MAX_ACTIVITIES:
                raise ChoreError("too_many")
            activity = build_activity(None, changes, members)
            self._check_dates(activity, None, today)
            # Never a deleted chore's id: its check-offs, notes, excuses, and requests would be its own (round 8).
            activity["id"] = make_id(activity["name"], {a["id"] for a in activities} | self.ids_in_log())
            activity["rev"] = 1
            activity["created"] = {"by": by, "source": source, "at": self._stamp(now)}
            activities.append(activity)
        return Outcome("saved", {"activity": dict(activity)}, changed={"plan"})

    def ids_in_log(self) -> set[str]:
        """Every chore id the log still names: check-offs, requests, overrides, carried, and day summaries."""
        used = {c["chore"] for c in self.log["completions"]}
        used |= {r["chore"] for r in self.log["requests"]}
        used |= {c["chore"] for c in self.log["carried"]}
        for record in self.log["overrides"]:
            parsed = parse_key(record.get("occurrence"))
            if parsed:
                used.add(parsed[0])
        for summary in self.log.get("summaries", []):
            used |= set((summary.get("chores") or {}).keys())
            named = [*(summary.get("keys") or {})]
            for name in ("missed", "carried", "open", "excused"):
                named += summary.get(name) or []
            used |= {parsed[0] for k in named if (parsed := parse_key(k))}
        return used

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

    def apply_import(self, now: datetime, changes: Mapping[str, Any], *, by: str, source: str) -> Outcome:
        """Save an import's chores, rewards, and rules together (spec 7.9).

        `changes` comes from importer.plan_import. Everything is checked again
        first, so a rule broken since the preview saves nothing. Imported chores
        keep the planner's fields and where they came from; nothing is deleted.
        """
        members = set(self.member_ids())
        activities = list(self.plan["activities"])
        at = {a["id"]: i for i, a in enumerate(activities)}
        updated: list[tuple[int, dict[str, Any]]] = []
        for chore_id, update in changes["activities_update"].items():
            if chore_id not in at:
                raise ChoreError("unknown_chore")
            existing = activities[at[chore_id]]
            activity = build_activity(existing, update["changes"], members)
            activity.update(update.get("extra") or {})
            activity["rev"] = int(existing.get("rev", 1)) + 1
            self._note_joined(activity, existing, now)
            self._reopen_if_owed(activity)
            updated.append((at[chore_id], activity))
        taken = set(at)
        added: list[dict[str, Any]] = []
        for record in changes["activities_add"]:
            activity = build_activity(None, record, members)
            activity.update({k: v for k, v in record.items() if k not in ACTIVITY_FIELDS and k not in ("rev", "assigned_since")})
            if activity.get("id") in taken or not activity.get("id"):
                activity["id"] = make_id(activity["name"], taken)
            taken.add(activity["id"])
            activity["rev"] = 1
            activity.setdefault("created", {"by": by, "source": source, "at": self._stamp(now)})
            if activity.get("schedule") == "plan" and activity.get("finished_at"):
                activity["finished_at"] = None  # a Plan chore never finishes (round 14)
            added.append(activity)
        if len(activities) + len(added) > MAX_ACTIVITIES:
            raise ChoreError("too_many")
        rewards = list(self.rewards["rewards"])
        reward_at = {r["id"]: i for i, r in enumerate(rewards)}
        new_rewards = []
        for reward_id, update in changes.get("rewards_update", {}).items():
            if reward_id not in reward_at:
                raise ChoreError("unknown_reward")
            rewards[reward_at[reward_id]] = build_reward(rewards[reward_at[reward_id]], update, members)
        reward_taken = set(reward_at)
        for record in changes.get("rewards_add", []):
            reward = build_reward(None, record, members)
            reward["id"] = record["id"] if record.get("id") and record["id"] not in reward_taken else make_id(
                reward["name"], reward_taken
            )
            reward_taken.add(reward["id"])
            new_rewards.append(reward)
        if len(rewards) + len(new_rewards) > MAX_REWARDS:
            raise ChoreError("too_many")
        settings = build_settings(self.settings, changes["settings"]) if changes.get("settings") else None
        for index, activity in updated:
            activities[index] = activity
        self.plan["activities"] = activities + added
        out = Outcome("imported", {"added": len(added), "updated": len(updated)}, changed={"plan"})
        if changes.get("rewards_update") or new_rewards:
            self.rewards["rewards"] = rewards + new_rewards
            out.changed.add("rewards")
        if settings is not None:
            out.merge(self.save_settings(now, settings))
        return out

    def delete_activity(self, chore_id: str, now: datetime | None = None) -> Outcome:
        """Delete a chore: it leaves the board at once; past weeks and earned stars stay.

        Its check-offs still waiting for a parent are withdrawn (round 7): they earned
        nothing yet, and they stayed in To approve under the chore's id, where approving
        them (or the 3 AM approval) gave their stars.
        """
        activity = self.activity(chore_id)
        if activity is None:
            raise ChoreError("unknown_chore")
        # Its past days keep its own name and picture (round 10: "Tv time" from its id).
        deleted = self.log.get("deleted")
        if not isinstance(deleted, dict):
            deleted = self.log["deleted"] = {}
        deleted[chore_id] = {"name": activity["name"], "icon": activity.get("icon")}
        for completion in self.log["completions"]:
            if completion["chore"] == chore_id and completion.get("state") == "pending":
                completion["state"] = "withdrawn"
                completion["withdrawn"] = {"at": self._stamp(now) if now else None, "reason": "deleted"}
                self._credit(completion["done_by"], -float(completion["credit_minutes"]))
                # The days that counted it as waiting count it no more (round 11: they still did, unlisted).
                for summary in self.log["summaries"]:
                    mark = (summary.get("keys") or {}).get(completion["occurrence"])
                    if mark is not None and mark[0] == "pending":
                        self._restate(summary, completion["occurrence"], "gone")
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
            old = self.log.get("policy") or {}
            earlier = [e for e in (old.get("earlier") or []) if isinstance(e, Mapping)]
            if old.get("since") and old.get("before") and _day(old["since"]) <= today:
                earlier.append({"until": old["since"], "missed": old["before"]})  # it covered its days, and keeps them
            self.log["policy"] = {
                "before": self.policy_on(today), "since": (today + timedelta(days=1)).isoformat(),
                **({"earlier": earlier} if earlier else {}),
            }
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
                    latest = index.latest.get(occ.key, {})
                    if occ.excused or (latest.get("state") in CREDITED and latest.get("member") == occ.member):
                        continue
                    if rolled_over is not None and occ.due is not None and gen.clock.due_day(occ.due) <= rolled_over:
                        continue
                    return True
        return False

    @staticmethod
    def _open_carried(record: Mapping[str, Any], index: _Index) -> bool:
        overrides = index.overrides.get(record["key"], {})
        if overrides.get("excused"):
            return False
        latest = index.latest.get(record["key"], {})
        member = overrides.get("assignee") or record["member"]
        return latest.get("state") not in CREDITED or latest.get("member") != member

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
        # Its surprises go for good, so a reward added again under the same id starts fresh (round 4);
        # the member's other goals stay as they were (round 5).
        surprises = self.rewards.setdefault("surprises", {})
        for member_id, surprise in list(surprises.items()):
            goals = self._surprise_goals(surprise)
            if goals.pop(reward_id, None) is None:
                continue
            shown = None if surprise.get("away") or surprise["reward"] == reward_id else surprise["reward"]
            record = self._surprise_record(goals, shown)
            if record is None:
                del surprises[member_id]
                continue
            if surprise.get("spent"):
                record["spent"] = True
            surprises[member_id] = record
        return Outcome("deleted", {"reward": reward_id}, changed={"rewards"})

    def _give(self, redemption: dict[str, Any], at: datetime, by: str, source: str | None, out: Outcome) -> None:
        redemption["state"] = "given"
        redemption["review"] = {"by": by, "at": self._stamp(at), "note": None, "source": source}
        self._ledger(redemption["member"], -int(redemption["cost"]), "redeemed", at, ref=redemption["id"], by=by)
        # Stars spent: the next settle forgets every goal the balance no longer covers (round 5).
        surprise = self.rewards.setdefault("surprises", {}).get(redemption["member"])
        if surprise is not None:
            surprise["spent"] = True
            # A goal's own reward given: getting it opens its present (round 5).
            entry = surprise if surprise["reward"] == redemption["reward"] else surprise.get("earlier", {}).get(redemption["reward"])
            if entry is not None and not entry.get("opened"):
                entry["opened"] = self._stamp(at)
                entry["opened_by"] = by
        reward = self.reward(redemption["reward"])
        out.events.append(ChoreEvent("redeemed", redemption["member"], {
            "reward": redemption["reward"], "reward_name": reward["name"] if reward else redemption["reward"],
            "member": redemption["member"], "stars": int(redemption["cost"]), "source": source,
        }))

    def redeem(self, now: datetime, *, member: str, reward: str, by: str, source: str) -> Outcome:
        """Spend stars on a reward (spec 8.15): it waits for approval unless the reward needs none."""
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
        if any(r["member"] == member and r["reward"] == reward and r["state"] == "requested" for r in self.rewards["redemptions"]):
            raise ChoreError("already_asked")  # one ask at a time (milestone 10 review B3)
        redemption = {
            "id": self._new_id(), "member": member, "reward": reward, "cost": int(found["cost"]),
            "state": "requested", "by": by, "source": source, "at": self._stamp(now), "review": None,
        }
        self.rewards["redemptions"].append(redemption)
        out = Outcome("requested", {"request": redemption["id"]}, changed={"rewards"})
        doer = self.member(by)
        if not found.get("needs_ok", True):
            self._give(redemption, now, AUTO, source, out)
            out.result = "given"
        elif doer is not None and doer.get("parent"):
            # A parent's own ask is their answer too (round 2: they approved it in the inbox afterwards).
            self._give(redemption, now, by, source, out)
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

    # Goal surprises (milestone 10) -------------------------------------------------------

    def _goal_reward(self, member: Mapping[str, Any]) -> dict[str, Any] | None:
        """The reward a member is saving for, when it exists and is one they can get.

        Someone who earns no stars (stars off, as for parents) has no goal to reach.
        """
        if not member.get("stars"):
            return None
        goal = member.get("goal")
        reward = self.reward(goal) if isinstance(goal, str) else None
        if reward is None or (reward.get("who") and member["id"] not in reward["who"]):
            return None
        return reward

    def _surprise_goals(self, have: Mapping[str, Any] | None) -> dict[str, dict[str, Any]]:
        """Every goal a member's surprise record remembers: the one on top and the `earlier` ones."""
        if not have:
            return {}
        goals = {rid: dict(seen) for rid, seen in have.get("earlier", {}).items()}
        goals[have["reward"]] = {k: have[k] for k in ("cost", "wrapped", "opened", "opened_by") if k in have}
        for rid, seen in goals.items():
            reward = self.reward(rid)
            if reward is not None:
                seen.setdefault("cost", int(reward["cost"]))
        return goals

    @staticmethod
    def _surprise_record(goals: Mapping[str, Mapping[str, Any]], shown: str | None) -> dict[str, Any] | None:
        """How the Store keeps the goals: the one shown (else the latest) on top, set aside unless shown."""
        if not goals:
            return None
        top = shown if shown in goals else max(goals, key=lambda rid: str(goals[rid].get("wrapped")))
        record: dict[str, Any] = {"reward": top, **goals[top]}
        if top != shown:
            record["away"] = True
        earlier = {rid: dict(seen) for rid, seen in goals.items() if rid != top}
        if earlier:
            record["earlier"] = earlier
        return record

    def settle_surprises(self, now: datetime) -> Outcome:
        """Wrap a surprise for each member whose stars reach their goal (round 5's one rule).

        A member remembers each goal they reached, opened or not, so a goal that
        slips out of reach (an uncheck, a price raised, the goal changed) comes
        back as it was, with no new `goal_reached`. A deleted reward is forgotten,
        and after stars are spent (`spent`, see `_give`) so is every goal the
        balance no longer covers: reaching one of those again wraps a new surprise.
        The board shows the current goal's surprise while it is in reach.
        """
        surprises: dict[str, dict[str, Any]] = self.rewards.setdefault("surprises", {})
        out = Outcome()
        for member in self.members:
            member_id = member["id"]
            have = surprises.get(member_id)
            balance = self.balance(member_id)
            spent = bool(have and have.get("spent"))
            goals = {
                rid: seen for rid, seen in self._surprise_goals(have).items()
                if (known := self.reward(rid)) is not None and (not spent or balance >= int(known["cost"]))
            }
            reward = self._goal_reward(member)
            reached = reward is not None and balance >= int(reward["cost"])
            if reward is not None and reached and reward["id"] not in goals:
                goals[reward["id"]] = {"cost": int(reward["cost"]), "wrapped": self._stamp(now), "opened": None}
                out.events.append(ChoreEvent("goal_reached", member_id, {
                    "member": member_id, "reward": reward["id"], "reward_name": reward["name"], "stars": int(reward["cost"]),
                }))
            record = self._surprise_record(goals, reward["id"] if reward is not None and reached else None)
            if record != have:
                if record is None:
                    surprises.pop(member_id, None)
                else:
                    surprises[member_id] = record
                out.changed.add("rewards")
        for member_id in set(surprises) - {m["id"] for m in self.members}:
            del surprises[member_id]
            out.changed.add("rewards")
        return out

    def open_surprise(self, now: datetime, *, member: str, by: str) -> Outcome:
        """Open a member's waiting surprise; opening it again answers the same and changes nothing."""
        surprise = self.rewards.setdefault("surprises", {}).get(member)
        if surprise is None or surprise.get("away"):
            raise ChoreError("no_surprise")
        if surprise.get("opened"):
            return Outcome("opened")
        surprise["opened"] = self._stamp(now)
        surprise["opened_by"] = by
        return Outcome("opened", changed={"rewards"})

    def _surprise_view(self, member_id: str) -> dict[str, Any] | None:
        """What the board shows of a member's surprise."""
        surprise = self.rewards.get("surprises", {}).get(member_id)
        if surprise is None or surprise.get("away"):
            return None
        return {"reward": surprise["reward"], "opened": bool(surprise.get("opened"))}

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
                    and self._day_of(completion["at"]) == day
                ):
                    self._approve(completion, end, AUTO, None, AUTO, out)
        index = self._index()
        by_member = self._items_on(day, index)
        policy = self.policy_on(day)
        week_ends = clock.week_end(day) == day + timedelta(days=1)
        week = clock.week_start(day)
        week_items = self._week_items(week, index, {day: by_member}) if week_ends else {}
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
                    self._week_summary(member_id, week, day + timedelta(days=1), week_items.get(member_id, {}), index)
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
            # Counted that day and still to do when it ended, without being missed or carried that day
            # (a make-up chore that slipped its day): what else kept the ring open.
            "open": [
                i.occ.key for i in counted
                if i.status in OPEN and i.occ.key not in missed and i.occ.key not in carried
            ],
            "away": away_on(member, day) is not None,
            "closed": bool(due) and all(i.status in CREDITED for i in due),
            "chores": chores,
            "keys": self._counted_keys(counted),
        }

    def _week_summary(
        self, member_id: str, week: date, end: date, items: Mapping[str, Item], index: _Index
    ) -> dict[str, Any]:
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
            "contribution": self.contribution(member_id, week, end, index),
            "keys": self._counted_keys(found),
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
        self._days.clear()  # times of pruned records needn't be remembered
        log = self.log
        log["completions"] = [c for c in log["completions"] if _at(c["at"]) >= cutoff]
        log["overrides"] = [o for o in log["overrides"] if _at(o["at"]) >= cutoff]
        log["requests"] = [r for r in log["requests"] if r.get("state") == "open" or _at(r["at"]) >= cutoff]
        # What a summary counted is kept 40 days, for corrections after the fact (round 10).
        keep_from = (end - timedelta(days=40)).date()
        for summary in log["summaries"]:
            period = str(summary.get("period", ""))
            if "keys" in summary and _day(period.split(":", 1)[1]) < keep_from:
                summary.pop("keys")
        # A deleted chore's name goes once nothing in the log names it.
        deleted = log.get("deleted")
        if isinstance(deleted, dict) and deleted:
            named = self.ids_in_log()
            log["deleted"] = {k: v for k, v in deleted.items() if k in named}
        self.rewards["redemptions"] = [
            r for r in self.rewards["redemptions"] if r.get("state") == "requested" or _at(r["at"]) >= cutoff
        ]
