"""One check-off's worth, checked against the table the card reads too (tests/fixtures/chores_worth.json)."""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
from typing import Any

import pytest

from .chores_sample import SCENE, sample_engine

TABLE = json.loads((Path(__file__).parent / "fixtures" / "chores_worth.json").read_text("utf-8"))


def _first_credit(activity: dict[str, Any], member: str) -> float:
    engine = sample_engine(activities=[activity])
    stored = engine.activity(activity["id"])
    generator = engine.generator()
    if stored["schedule"] == "once":
        found = generator.period_occurrences(stored, member, "once", None)
    elif stored["schedule"] == "repeats":
        found = generator.period_occurrences(stored, member, "rep", date.fromisoformat(stored["repeats"]["start"]))
    elif stored["minimum"]["per"] == "day":
        found = generator.period_occurrences(stored, member, "day", SCENE.date())
    else:
        found = generator.period_occurrences(stored, member, "week", engine.clock.week_start(SCENE.date()))
    assert found, (activity["id"], member)
    assert len({o.credit_minutes for o in found}) == 1  # every check-off of a period is worth the same
    return found[0].credit_minutes


@pytest.mark.parametrize("case", TABLE["cases"], ids=lambda case: case["name"])
def test_each_check_off_is_worth_what_the_table_says(case: dict[str, Any]) -> None:
    for member, minutes in case["minutes"].items():
        assert _first_credit(case["activity"], member) == pytest.approx(minutes, abs=0.01)
