"""The people's and theme's colors (owner, 2026-10-14): 24 standard colors, the first 20 still accepted."""
from __future__ import annotations

import json
from pathlib import Path

from custom_components.planavista.const import COLOR_PRESETS, LEGACY_COLOR_PRESETS
from custom_components.planavista.household.members import MAX_MEMBERS, PALETTE, next_free_color, palette_color

TABLE = json.loads((Path(__file__).parent / "fixtures" / "palette.json").read_text(encoding="utf-8"))


def _as_table(presets: list[dict]) -> list[dict]:
    return [{"name": p["name"], "color": p["color"], "light": p["color_light"]} for p in presets]


def test_the_backend_offers_the_shared_table() -> None:
    assert _as_table(COLOR_PRESETS) == TABLE["presets"]
    assert _as_table(LEGACY_COLOR_PRESETS) == TABLE["legacy"]
    assert len(COLOR_PRESETS) == 24
    assert {"Pink", "Purple", "Blue", "Green", "Yellow", "Brown", "Gray", "Black"} <= {p["name"] for p in COLOR_PRESETS}


def test_new_people_get_the_new_colors_and_old_colors_stay_valid() -> None:
    assert PALETTE == tuple(p["color"] for p in TABLE["presets"])
    assert MAX_MEMBERS == 24
    assert next_free_color([]) == TABLE["presets"][0]["color"]
    old = TABLE["legacy"][10]["color"]  # Strawberry Red, the first person's color before
    assert palette_color(old.lower()) == old
    assert palette_color("#123456") is None
