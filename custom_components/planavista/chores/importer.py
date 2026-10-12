"""Import a household plan; export and restore a PlanaVista household (spec 7.9, 14.6, 15.5).

Nothing here imports Home Assistant. `read_file` says what a file is and reads
it. `preview` works out where everything in it would go in the household as
it stands. `plan_import` turns that and the parent's choices into the records
to save, each one checked before anything is saved. `export_household` writes
the planavista.household/v1 file (docs/schemas/planavista.household.v1.json).

A Household Hours plan (household-hours/v1) brings people's bedtimes and sleep
and the plan's activities. A PlanaVista file (planavista.household/v1) brings
back a whole household: people, chores, rewards, and rules. Importing again
updates instead of duplicating, and nothing is ever deleted.
"""
from __future__ import annotations

from collections.abc import Collection, Iterable, Mapping
import json
import re
from typing import Any

from ..household.members import (
    AGE_GROUPS,
    EDITABLE_FIELDS,
    MemberError,
    build_member,
    make_id as make_member_id,
    ordered,
    import_members,
    nearest_palette_color,
    palette_color,
)
from .model import ACTIVITY_FIELDS, CATEGORIES, ChoreError, build_activity, build_reward, build_settings, make_id
from .periods import BANDS, WEEKDAY_CODES

FORMAT_PLAN = "household-hours/v1"
FORMAT_HOUSEHOLD = "planavista.household/v1"
FORMAT_LABELS = {FORMAT_PLAN: "Household Hours plan, version 1", FORMAT_HOUSEHOLD: "PlanaVista file, version 1"}

UNKNOWN_FILE = "This doesn't look like a Household Hours or PlanaVista file."
NEWER_PLAN = "This plan was made with a newer Household Hours (version {version}). Export it as version 1, or update PlanaVista."
NEWER_HOUSEHOLD = "This file was made with a newer PlanaVista (file version {version}). Update PlanaVista to read it."
INVALID_FILE = "This file has problems, so nothing was imported."

# The planner counts days from Sunday.
PLAN_DAYS = ("sun", "mon", "tue", "wed", "thu", "fri", "sat")
# Chores by default (spec 7.9); personal, school, work, and family stay plan only, and sleep never shows.
BOARD_CATEGORIES = frozenset({"kitchen", "cleaning", "home"})
PLANNER_FIELDS = ("type", "locked", "agreed")
DEFAULT_BEDTIME = {"weeknight": "22:30", "weekend": "23:30"}
MAX_ITEMS = 300
_CLOCK = re.compile(r"(?:[01]\d|2[0-3]):[0-5]\d")
_FORMAT = re.compile(r"(household-hours|planavista\.household)/v(\d+)")
_SLUG = re.compile(r"[a-z0-9]+(?:_[a-z0-9]+)*")

# Exported member fields; links to Home Assistant travel under `links` (spec 7.9).
MEMBER_EXPORT = (
    "id", "name", "color", "color_dark", "picture", "age_group", "parent", "order", "my_day", "needs_ok_for",
    "stars", "goal", "bedtime", "sleep_hours", "away", "notify",
)
# Activity fields that are bookkeeping of this household, not part of the plan.
ACTIVITY_LOCAL = ("rev", "assigned_since")
REWARD_EXPORT = ("id", "name", "icon", "cost", "needs_ok", "who")
# What a re-import of a plan changes on a chore it already made: the plan's own fields.
PLAN_UPDATES = ("name", "category", "assignees", "minimum", "split", "shares", "days", "time_of_day", "set_time")


class ImportProblem(ValueError):
    """A file that can't be imported. `problems` lists what is wrong, item by item."""

    def __init__(self, code: str, message: str, problems: list[dict[str, Any]] | None = None) -> None:
        """Remember what is wrong."""
        super().__init__(message)
        self.code = code
        self.message = message
        self.problems = problems or []


def _number(value: object) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        try:
            return float(str(value))
        except ValueError:
            return 0.0
    return float(value)


def _text(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _clock(value: object) -> str | None:
    text = _text(value)
    return text if _CLOCK.fullmatch(text) else None


def _hours(value: float) -> float:
    """Hours to the minute, so shares like 1/3 h add up."""
    return round(value * 60) / 60


# Reading a file ---------------------------------------------------------------------------------


def read_file(text: object) -> dict[str, Any]:
    """What the file is and what it holds, or ImportProblem saying why it can't be read."""
    if not isinstance(text, str) or not text.strip():
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    try:
        data = json.loads(text)
    except ValueError:
        raise ImportProblem("unknown_file", UNKNOWN_FILE) from None
    if not isinstance(data, Mapping):
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    kind = data.get("schema", data.get("format"))
    match = _FORMAT.fullmatch(kind) if isinstance(kind, str) else None
    if match is None or int(match[2]) < 1:
        raise ImportProblem("unknown_file", UNKNOWN_FILE)
    version = int(match[2])
    if version > 1:
        template = NEWER_PLAN if match[1] == "household-hours" else NEWER_HOUSEHOLD
        raise ImportProblem("newer_file", template.format(version=version))
    parsed = _read_plan(data) if match[1] == "household-hours" else _read_household(data)
    exported = _text(data.get("exported"))
    parsed["exported"] = exported[:10] if re.match(r"\d{4}-\d{2}-\d{2}", exported) else None
    parsed["source"] = _text(data.get("source")) or None
    return parsed


def _list(data: Mapping[str, Any], key: str, problems: list[dict[str, Any]], what: str) -> list[Any]:
    value = data.get(key, [])
    if not isinstance(value, list) or len(value) > MAX_ITEMS:
        problems.append({"item": what, "code": "invalid_list"})
        return []
    return value


def _invalid(problems: list[dict[str, Any]]) -> None:
    if problems:
        raise ImportProblem("invalid_file", INVALID_FILE, problems)


def _read_plan(data: Mapping[str, Any]) -> dict[str, Any]:
    """A Household Hours plan: people with bedtimes and sleep, and the plan's activities."""
    problems: list[dict[str, Any]] = []
    people: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "people", problems, "People"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Person {n}", "code": "name_required"})
            continue
        ref = _text(raw.get("id")) or f"person_{n}"
        color = raw.get("color")
        people.append({
            # The planner's own color; it comes in as the nearest free palette color (spec 7.9).
            "ref": ref, "name": name, "color": color.strip() if isinstance(color, str) else None,
            "bedtime": {
                "weeknight": _clock(raw.get("bedWk")) or DEFAULT_BEDTIME["weeknight"],
                "weekend": _clock(raw.get("bedWe")) or DEFAULT_BEDTIME["weekend"],
            },
            "sleep_hours": None, "age_group": None, "parent": None, "record": None,
        })
    by_ref = {p["ref"]: p for p in people}
    activities: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "activities", problems, "Activities"), 1):
        if not isinstance(raw, Mapping):
            problems.append({"item": f"Activity {n}", "code": "name_required"})
            continue
        name = _text(raw.get("name"))
        if not name:
            problems.append({"item": f"Activity {n}", "code": "name_required"})
            continue
        hours = _number(raw.get("minHours"))
        per = "day" if raw.get("per") == "day" else "week"
        alloc = raw.get("alloc") if isinstance(raw.get("alloc"), Mapping) else {}
        refs = [ref for ref in alloc if ref in by_ref]
        each = raw.get("timePer") == "person"
        # More than a day (or a week) holds is a mistake per person; a split total may be more.
        owed = [hours] if each or not refs else [_number(alloc[ref]) for ref in refs]
        if hours <= 0 or any(o > (24 if per == "day" else 168) for o in owed):
            problems.append({"item": name, "code": "invalid_hours"})
            continue
        if raw.get("isSleep"):
            for ref in refs:
                owed = hours if each else _number(alloc[ref])
                nightly = owed if per == "day" else owed / 7
                person = by_ref[ref]
                person["sleep_hours"] = round(((person["sleep_hours"] or 0) + nightly) * 4) / 4
            continue
        activities.append(_plan_activity(raw, name, hours, per, alloc, refs, each))
    _invalid(problems)
    return {"format": FORMAT_PLAN, "people": people, "activities": activities, "rewards": [], "settings": None}


def _plan_activity(
    raw: Mapping[str, Any], name: str, hours: float, per: str, alloc: Mapping[str, Any], refs: list[str], each: bool
) -> dict[str, Any]:
    """One planner activity as a Plan chore, its people still named by the plan's ids."""
    planned: float | None = None
    shares: dict[str, float] | None = None
    if each:
        assignees, split, minimum = refs, "each", hours
    else:
        owed = {ref: _hours(_number(alloc[ref])) for ref in refs if _number(alloc[ref]) > 0}
        assignees = list(owed)
        total = _hours(sum(owed.values()))
        if len(owed) >= 2:
            split, shares, minimum = "shared", owed, total
        elif owed:
            split, minimum = "each", total
        else:
            split, minimum = "each", hours
        if owed and abs(total - hours) > 0.01:
            planned = hours  # the shares are what people owe; the difference is pointed out
    picked = {PLAN_DAYS[d] for d in raw.get("days") or [] if isinstance(d, int) and not isinstance(d, bool) and 0 <= d <= 6}
    bands = [band for band in BANDS if band in (raw.get("tod") or [])]
    set_time = _clock(raw.get("fixedStart"))
    category = raw.get("category") if raw.get("category") in CATEGORIES and raw.get("category") != "sleep" else "other"
    record: dict[str, Any] = {
        "name": name, "icon": None, "category": category, "schedule": "plan", "assignees": assignees,
        "minimum": {"hours": minimum, "per": per}, "split": split, "shares": shares,
        "days": [day for day in WEEKDAY_CODES if day in picked], "time_of_day": bands,
        # A daily chore at two times of day is checked off at each (morning and evening cat care).
        "times": len(bands) if per == "day" and len(bands) > 1 else 1,
        "set_time": set_time, "on_board": category in BOARD_CATEGORIES and set_time is None,
        "needs_ok": False, "stars": None,
        "type": "want" if raw.get("type") == "want" else "need",
        "locked": bool(raw.get("locked")), "agreed": bool(raw.get("agreed")),
        "import_ref": {"format": FORMAT_PLAN, "id": _text(raw.get("id")) or name},
    }
    return {"ref": record["import_ref"]["id"], "record": record, "planned_hours": planned}


def _read_household(data: Mapping[str, Any]) -> dict[str, Any]:
    """A PlanaVista file: the whole household, with its ids (spec 7.9)."""
    problems: list[dict[str, Any]] = []
    people: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "members", problems, "People"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Person {n}", "code": "name_required"})
            continue
        age_group = raw.get("age_group") if raw.get("age_group") in AGE_GROUPS else "adult"
        people.append({
            "ref": _text(raw.get("id")) or f"person_{n}", "name": name, "color": palette_color(raw.get("color")),
            "bedtime": raw.get("bedtime"), "sleep_hours": raw.get("sleep_hours"),
            "age_group": age_group, "parent": bool(raw.get("parent")), "record": dict(raw),
        })
    chores = data.get("chores") if isinstance(data.get("chores"), Mapping) else {}
    activities: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(chores, "activities", problems, "Chores"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Chore {n}", "code": "name_required"})
            continue
        record = {k: v for k, v in raw.items() if k not in ACTIVITY_LOCAL}
        activities.append({"ref": _text(raw.get("id")) or name, "record": record, "planned_hours": None})
    rewards: list[dict[str, Any]] = []
    for n, raw in enumerate(_list(data, "rewards", problems, "Rewards"), 1):
        name = _text(raw.get("name")) if isinstance(raw, Mapping) else ""
        if not name:
            problems.append({"item": f"Reward {n}", "code": "name_required"})
            continue
        rewards.append({"ref": _text(raw.get("id")) or name, "record": dict(raw)})
    settings = chores.get("settings") if isinstance(chores.get("settings"), Mapping) else None
    _invalid(problems)
    return {
        "format": FORMAT_HOUSEHOLD, "people": people, "activities": activities, "rewards": rewards,
        "settings": dict(settings) if settings else None,
    }


# Where everything would go ----------------------------------------------------------------------


def _match_people(
    parsed: Mapping[str, Any], members: list[dict[str, Any]], chosen: Mapping[str, Any] | None = None
) -> dict[str, str | None]:
    """File person -> member id: the parent's pick, else (in a PlanaVista file) the same id, else the same name."""
    by_id = {m["id"]: m for m in members}
    taken: set[str] = set()
    matches: dict[str, str | None] = {}
    picks = chosen or {}
    for person in parsed["people"]:
        ref = person["ref"]
        if ref in picks and "match" in picks[ref]:
            matches[ref] = picks[ref]["match"] if picks[ref]["match"] in by_id else None
            continue
        found = None
        if parsed["format"] == FORMAT_HOUSEHOLD and ref in by_id and ref not in taken:
            found = ref
        if found is None:
            found = next(
                (m["id"] for m in members if m["name"].casefold() == person["name"].casefold() and m["id"] not in taken),
                None,
            )
        matches[ref] = found
        if found:
            taken.add(found)
    return matches


def _match_activity(
    parsed: Mapping[str, Any], entry: Mapping[str, Any], activities: list[dict[str, Any]], taken: set[str]
) -> str | None:
    """The chore this one updates: by the plan's own id from the last import (or the chore id), then by name."""
    record = entry["record"]
    if parsed["format"] == FORMAT_PLAN:
        ref = record["import_ref"]
        found = next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("import_ref") == ref),
            None,
        ) or next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("schedule") == "plan"
             and a["name"].casefold() == record["name"].casefold()),
            None,
        )
    else:
        found = next((a["id"] for a in activities if a["id"] not in taken and a["id"] == entry["ref"]), None) or next(
            (a["id"] for a in activities if a["id"] not in taken and a.get("schedule") == record.get("schedule")
             and a["name"].casefold() == record["name"].casefold()),
            None,
        )
    if found:
        taken.add(found)
    return found


def _kind(record: Mapping[str, Any], on_board: bool) -> str:
    if record.get("schedule", "plan") == "plan" and record.get("set_time"):
        return "set_time"
    return "board" if on_board else "plan_only"


def _people_colors(
    parsed: Mapping[str, Any], members: list[dict[str, Any]], matches: Mapping[str, str | None]
) -> dict[str, str | None]:
    """Each file person's color after the import: a matched member keeps theirs (a restore brings the file's),
    and a new person gets the free palette color nearest the file's."""
    by_id = {m["id"]: m for m in members}
    restoring = parsed["format"] == FORMAT_HOUSEHOLD
    colors: dict[str, str | None] = {}
    for person in parsed["people"]:
        member = by_id.get(matches[person["ref"]] or "")
        if member is not None:
            colors[person["ref"]] = palette_color(person["color"]) if restoring and palette_color(person["color"]) else member.get("color")
    used = [c for ref, c in colors.items() if c] + [
        str(m.get("color")) for m in members if m.get("color") and m["id"] not in set(matches.values())
    ]
    for person in parsed["people"]:
        if person["ref"] not in colors:
            colors[person["ref"]] = nearest_palette_color(person["color"], used)
            if colors[person["ref"]]:
                used.append(colors[person["ref"]])
    return colors


def preview(
    parsed: Mapping[str, Any], members: list[dict[str, Any]], activities: list[dict[str, Any]],
    rewards: list[dict[str, Any]],
) -> dict[str, Any]:
    """Where everything in the file would go (spec 14.6). Nothing is saved."""
    matches = _match_people(parsed, members)
    names = {m["id"]: m["name"] for m in members}
    colors = _people_colors(parsed, members, matches)
    people = [
        {
            "ref": p["ref"], "name": p["name"], "match": matches[p["ref"]],
            "match_name": names.get(matches[p["ref"]] or ""), "color": colors[p["ref"]], "bedtime": p["bedtime"],
            "sleep_hours": p["sleep_hours"], "age_group": p["age_group"], "parent": p["parent"],
        }
        for p in parsed["people"]
    ]
    existing = {a["id"]: a for a in activities}
    taken: set[str] = set()
    items: list[dict[str, Any]] = []
    look: list[dict[str, Any]] = []
    for entry in parsed["activities"]:
        record = entry["record"]
        match = _match_activity(parsed, entry, activities, taken)
        on_board = bool(existing[match].get("on_board", True)) if match and parsed["format"] == FORMAT_PLAN else bool(
            record.get("on_board", True)
        )
        kind = _kind(record, on_board)
        items.append({
            "ref": entry["ref"], "name": record["name"], "icon": record.get("icon") or (existing[match].get("icon") if match else None),
            "category": record.get("category", "other"), "kind": kind, "on_board": on_board, "match": match,
            **{key: record.get(key) for key in (
                "schedule", "assignees", "minimum", "split", "shares", "days", "time_of_day", "set_time", "once", "repeats",
            )},
        })
        if kind == "board" and not record.get("assignees"):
            look.append({"kind": "unassigned", "ref": entry["ref"], "name": record["name"]})
        if entry.get("planned_hours") is not None:
            look.append({
                "kind": "shares", "ref": entry["ref"], "name": record["name"],
                "hours": record["minimum"]["hours"], "planned": entry["planned_hours"], "per": record["minimum"]["per"],
            })
    updates = [i for i in items if i["match"]]
    if updates:
        look.append({"kind": "updates", "refs": [i["ref"] for i in updates], "names": [i["name"] for i in updates]})
    reward_taken: set[str] = set()
    reward_items = []
    for entry in parsed["rewards"]:
        record = entry["record"]
        match = next((r["id"] for r in rewards if r["id"] == entry["ref"] and r["id"] not in reward_taken), None) or next(
            (r["id"] for r in rewards if r["name"].casefold() == record["name"].casefold() and r["id"] not in reward_taken),
            None,
        )
        if match:
            reward_taken.add(match)
        reward_items.append({"ref": entry["ref"], "name": record["name"], "icon": record.get("icon"), "match": match})
    return {
        "file": {
            "format": parsed["format"], "label": FORMAT_LABELS[parsed["format"]],
            "exported": parsed.get("exported"), "source": parsed.get("source"),
        },
        "people": people,
        "activities": items,
        "rewards": reward_items,
        "settings": parsed["settings"] is not None,
        "needs_a_look": look,
    }


# What to save -----------------------------------------------------------------------------------


def _free_id(wanted: str, taken: set[str], name: str, make: Any) -> str:
    """Keep a file's own id when it is free (automations name it), else make one from the name."""
    if _SLUG.fullmatch(wanted) and wanted not in taken:
        return wanted
    return make(name, taken)


def plan_import(
    parsed: Mapping[str, Any],
    choices: Mapping[str, Any],
    members: list[dict[str, Any]],
    activities: list[dict[str, Any]],
    rewards: list[dict[str, Any]],
    settings: Mapping[str, Any],
    *,
    persons: Collection[str] = (),
    calendars: Collection[str] = (),
) -> dict[str, Any]:
    """The records an import saves, all checked first: ImportProblem lists what stops it.

    `choices` holds the parent's picks from the preview: `people` (ref ->
    {match, age_group}), `on_board` (ref -> bool), and `assignees` (ref ->
    the plan's people refs). `persons` and `calendars` are the Home Assistant
    people and the calendars PlanaVista shows, for a PlanaVista file's links.
    """
    problems: list[dict[str, Any]] = []
    picks = choices.get("people") or {}
    matches = _match_people(parsed, members, picks)
    restoring = parsed["format"] == FORMAT_HOUSEHOLD
    seen: dict[str, str] = {}
    for person in parsed["people"]:
        member_id = matches[person["ref"]]
        if member_id and member_id in seen:
            problems.append({"item": person["name"], "code": "matched_twice", "other": seen[member_id]})
        elif member_id:
            seen[member_id] = person["name"]

    # People: new ones get their ids first, so chores can name them.
    by_id = {m["id"]: dict(m) for m in members}
    taken = set(by_id)
    ids: dict[str, str] = {}
    members_add: list[dict[str, Any]] = []
    members_update: dict[str, dict[str, Any]] = {}
    calendar_links: dict[str, str] = {}
    after: list[dict[str, Any]] = [dict(m) for m in members]
    colors = _people_colors(parsed, members, matches)
    for person in parsed["people"]:
        ref = person["ref"]
        member_id = matches[ref]
        if restoring:
            changes = {k: v for k, v in (person["record"] or {}).items() if k in EDITABLE_FIELDS}
            links = (person["record"] or {}).get("links") or {}
            if isinstance(links, Mapping):
                changes["person"] = links.get("person") if links.get("person") in persons else None
                changes["phones"] = links.get("phones") or []
        else:
            changes = {"bedtime": person["bedtime"]}
            if person["sleep_hours"] is not None:
                changes["sleep_hours"] = person["sleep_hours"]
        if member_id:
            if not restoring or changes.get("person") is None:
                changes.pop("person", None)  # a link the file can't make keeps the one there is
            ids[ref] = member_id
            try:
                # Each change on its own here; names, colors, and people are checked across everyone below.
                build_member(by_id[member_id], changes, [])
            except MemberError as err:
                problems.append({"item": person["name"], "code": err.code, "of": "member"})
            members_update[member_id] = changes
            after = [dict(m, **changes) if m["id"] == member_id else m for m in after]
        else:
            age_group = (picks.get(ref) or {}).get("age_group") or person["age_group"]
            if age_group not in AGE_GROUPS:
                problems.append({"item": person["name"], "code": "age_group_required"})
                age_group = "adult"
            new_id = _free_id(ref, taken, person["name"], make_member_id) if restoring else make_member_id(person["name"], taken)
            taken.add(new_id)
            ids[ref] = new_id
            changes = {**changes, "name": person["name"], "age_group": age_group}
            if not restoring:
                changes["parent"] = False
            changes["color"] = colors[ref]
            try:
                record = build_member(None, changes, [])
            except MemberError as err:
                problems.append({"item": person["name"], "code": err.code, "of": "member"})
                continue
            record["id"] = new_id
            members_add.append(record)
            after.append(record)
        links = (person["record"] or {}).get("links") if restoring else None
        if isinstance(links, Mapping):
            for entity_id in links.get("calendars") or []:
                if entity_id in calendars:
                    calendar_links[entity_id] = ids[ref]
    if not any(p.get("of") == "member" for p in problems):
        try:
            import_members(members, members_add, members_update)
        except MemberError as err:
            problems.append({"item": err.member or "People", "code": err.code, "of": "member"})
    member_ids = {m["id"] for m in after}

    # Chores, with the plan's people named by member id now.
    existing = {a["id"]: a for a in activities}
    activity_taken: set[str] = set()
    activity_ids = set(existing)
    activities_add: list[dict[str, Any]] = []
    activities_update: dict[str, dict[str, Any]] = {}
    on_board_picks = choices.get("on_board") or {}
    assignee_picks = choices.get("assignees") or {}
    for entry in parsed["activities"]:
        record = dict(entry["record"])
        ref = entry["ref"]
        assignees = assignee_picks.get(ref) if ref in assignee_picks else record.get("assignees") or []
        record["assignees"] = list(dict.fromkeys(ids[a] for a in assignees if a in ids))
        if isinstance(record.get("shares"), Mapping):
            shares = {ids[a]: h for a, h in record["shares"].items() if a in ids}
            if ref in assignee_picks or set(shares) != set(record["assignees"]):
                record["split"], record["shares"] = "each", None  # a new pick does the whole time each
            else:
                record["shares"] = shares
        match = _match_activity(parsed, entry, activities, activity_taken)
        if ref in on_board_picks:
            record["on_board"] = bool(on_board_picks[ref])
        elif match and not restoring:
            record["on_board"] = bool(existing[match].get("on_board", True))
        # What the chore rules don't edit, and the import keeps: the planner's fields and where it came from.
        extra = {k: v for k, v in record.items() if k not in ACTIVITY_FIELDS and k not in ("id", *ACTIVITY_LOCAL)}
        try:
            if match:
                if restoring:
                    changes = {k: v for k, v in record.items() if k in ACTIVITY_FIELDS}
                    extra = {}
                else:
                    changes = {k: v for k, v in record.items() if k in PLAN_UPDATES or k == "on_board"}
                    changes["schedule"] = "plan"
                    extra = {k: v for k, v in extra.items() if k in PLANNER_FIELDS or k == "import_ref"}
                build_activity(existing[match], changes, member_ids)
                activities_update[match] = {"changes": changes, "extra": extra}
            else:
                built = build_activity(None, record, member_ids)
                built.update(extra)
                built["id"] = _free_id(ref, activity_ids, built["name"], make_id) if restoring else make_id(
                    built["name"], activity_ids
                )
                activity_ids.add(built["id"])
                activities_add.append(built)
        except ChoreError as err:
            problems.append({"item": record.get("name") or ref, "code": err.code, "detail": err.detail})

    # Rewards and rules (a PlanaVista file only).
    rewards_add: list[dict[str, Any]] = []
    rewards_update: dict[str, dict[str, Any]] = {}
    reward_ids = {r["id"] for r in rewards}
    reward_taken: set[str] = set()
    for entry in parsed["rewards"]:
        record = dict(entry["record"])
        record["who"] = [ids[w] for w in record.get("who") or [] if w in ids]
        match = next((r["id"] for r in rewards if r["id"] == entry["ref"] and r["id"] not in reward_taken), None) or next(
            (r["id"] for r in rewards if r["name"].casefold() == record["name"].casefold() and r["id"] not in reward_taken),
            None,
        )
        try:
            if match:
                reward_taken.add(match)
                build_reward(next(r for r in rewards if r["id"] == match), record, member_ids)
                rewards_update[match] = record
            else:
                built = build_reward(None, record, member_ids)
                built["id"] = _free_id(entry["ref"], reward_ids, built["name"], make_id)
                reward_ids.add(built["id"])
                rewards_add.append(built)
        except ChoreError as err:
            problems.append({"item": record.get("name") or entry["ref"], "code": err.code, "detail": err.detail})
    new_settings = None
    if parsed["settings"] is not None:
        try:
            new_settings = build_settings(settings, parsed["settings"])
        except ChoreError as err:
            problems.append({"item": "Rules", "code": err.code, "detail": err.detail})
    _invalid(problems)
    return {
        "members_add": members_add,
        "members_update": members_update,
        "calendars": calendar_links,
        "activities_add": activities_add,
        "activities_update": activities_update,
        "rewards_add": rewards_add,
        "rewards_update": rewards_update,
        "settings": new_settings,
        "summary": {
            "people_added": [m["name"] for m in members_add],
            "activities_added": len(activities_add),
            "activities_updated": len(activities_update),
            "rewards_added": len(rewards_add),
            "rewards_updated": len(rewards_update),
        },
    }


# Export -----------------------------------------------------------------------------------------


def export_household(
    members: Iterable[Mapping[str, Any]],
    calendars: Iterable[Mapping[str, Any]],
    plan: Mapping[str, Any],
    rewards: Mapping[str, Any],
    *,
    version: str,
    exported: str,
) -> dict[str, Any]:
    """The household as a planavista.household/v1 file (spec 7.9).

    People (with their Home Assistant links), chores (with the planner's hidden
    fields), rewards, and rules. Never PINs, stars, history, requests, or
    shared-screen accounts: Home Assistant backups keep those.
    """
    rows = list(calendars)
    out_members = []
    for member in ordered(members):
        record = {key: member[key] for key in MEMBER_EXPORT if key in member}
        record["links"] = {
            "person": member.get("person"),
            "calendars": [row["entity_id"] for row in rows if row.get("member_id") == member["id"]],
            "phones": list(member.get("phones") or []),
        }
        out_members.append(record)
    return {
        "format": FORMAT_HOUSEHOLD,
        "exported": exported,
        "source": f"PlanaVista {version}",
        "members": out_members,
        "chores": {
            "settings": dict(plan.get("settings") or {}),
            "activities": [{k: v for k, v in a.items() if k not in ACTIVITY_LOCAL} for a in plan.get("activities", [])],
        },
        "rewards": [{k: r[k] for k in REWARD_EXPORT if k in r} for r in rewards.get("rewards", [])],
    }
