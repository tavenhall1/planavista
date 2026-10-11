"""The worked examples of spec section 8.16, in the engine (the Home Assistant versions are in test_chores_acceptance.py)."""
from __future__ import annotations

from datetime import date, timedelta

from .chores_sample import at, sample_engine

TRASH = "take_out_the_trash|casey|week:2026-10-12|0"


def test_1_frigate() -> None:
    """Tuesday 7:40 PM, a zone sensor sees Casey take the trash out, and an automation completes it."""
    engine = sample_engine(at(10, 13, 9))
    out = engine.complete(at(10, 13, 19, 40), member="casey", chore="take_out_the_trash", by="automation", source="automation")
    # Today's occurrence; Casey's setting is "marked" and the trash isn't marked, so it is done.
    assert (out.result, out.data["occurrence"], out.data["stars"]) == ("done", TRASH, 1)
    assert engine.log["completions"][-1]["source"] == "automation"
    assert engine.balance("casey") == 1


def test_2_approval() -> None:
    """Dana holds Feed the fish, so it waits for OK; Alex taps Looks good on their phone."""
    engine = sample_engine(at(10, 13, 9))
    fish = "feed_the_fish|dana|day:2026-10-13|0"
    assert engine.complete(at(10, 13, 15, 58), key=fish, by="dana", source="tablet").result == "pending"
    [request] = engine.open_requests()
    out = engine.review(at(10, 13, 16, 5), request_id=request["id"], allow=True, by="alex", source="notification")
    completion = engine.log["completions"][-1]
    assert (out.result, completion["state"], completion["stars"]) == ("approved", "done", 1)
    assert (completion["review"]["by"], completion["review"]["source"]) == ("alex", "notification")
    assert engine.balance("dana") == 1


def test_3_make_it_up() -> None:
    """Blair misses Monday's laundry; on Tuesday it shows "From Mon"; done, it counts as on time for the week."""
    engine = sample_engine(at(10, 12, 9))
    engine.catch_up(at(10, 13, 9))
    monday = "laundry|blair|week:2026-10-12|0"
    item = engine.find_item(monday, at(10, 13, 9))
    assert (item.section, item.moved_from) == ("week", date(2026, 10, 12))
    assert engine.description(item, date(2026, 10, 13)) == "From Mon"
    assert engine.complete(at(10, 13, 18), key=monday, by="blair", source="tablet").result == "done"
    engine.complete(at(10, 15, 18), key="laundry|blair|week:2026-10-12|1", by="blair", source="tablet")
    engine.complete(at(10, 15, 19), key="clean_the_bathroom|blair|week:2026-10-12|0", by="blair", source="tablet")
    engine.catch_up(at(10, 19, 9))
    week = next(s for s in engine.log["summaries"] if s["member"] == "blair" and s["period"] == "week:2026-10-12")
    assert monday not in week["missed"]
    assert week["closed"] is True


def test_4_repeat_delivery() -> None:
    """The same automation fires twice within a minute: already_done, no second credit, no error."""
    engine = sample_engine(at(10, 13, 9))
    first = engine.complete(at(10, 13, 19, 40), member="casey", chore="take_out_the_trash", by="automation", source="automation")
    second = engine.complete(at(10, 13, 19, 40) + timedelta(seconds=30), member="casey", chore="take_out_the_trash",
                             by="automation", source="automation")
    assert (first.result, second.result) == ("done", "already_done")
    assert second.events == [] and second.changed == set()
    assert engine.balance("casey") == 1


def test_5_outage() -> None:
    """Off from Monday 11 PM to Wednesday 9 AM: the Tuesday and Wednesday 3:00 AM rollovers run in order."""
    engine = sample_engine(at(10, 12, 9))
    engine.complete(at(10, 12, 21), key="feed_the_fish|dana|day:2026-10-12|0", by="dana", source="tablet")
    out = engine.catch_up(at(10, 14, 9))
    kinds = [event.type for event in out.events]
    # Monday's day: auto-approve, then missed; then Tuesday's day: missed.
    assert kinds[0] == "approved" and set(kinds[1:]) == {"missed"}
    days = [event.data["occurrence"].split("|")[2] for event in out.events[1:]]
    assert days == sorted(days) and days[0] == "day:2026-10-12" and days[-1] in ("day:2026-10-13", "week:2026-10-12")
    assert [s["period"] for s in engine.log["summaries"] if s["member"] == "dana"] == ["day:2026-10-12", "day:2026-10-13"]
    assert engine.log["last_boundary"] == "2026-10-14T03:00:00-05:00"
