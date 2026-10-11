"""Appearance: Light, Dark, or Automatic, theme pairs, and their colors (spec 12.4).

The settings are display keys in the config entry. The keys 1.1.0 knew,
theme and theme_overrides, stay with values 1.1.0 can read, so a rollback
still renders the look in use (spec 7.8): readers derive the new keys from
them while a new key is missing, and every save that changes the new keys
writes them back. The card's core/appearance.ts derives the same way; both
are checked against tests/fixtures/appearance_cases.json. Nothing here
imports Home Assistant.
"""

from __future__ import annotations

from collections.abc import Mapping
import re
from typing import Any

APPEARANCE = "appearance"
APPEARANCE_SWITCH = "appearance_switch"
LIGHT_FROM = "light_from"
DARK_FROM = "dark_from"
THEME_PAIR = "theme_pair"
COLORS_LIGHT = "colors_light"
COLORS_DARK = "colors_dark"
SHAPE = "shape"
MOTION = "motion"

APPEARANCE_KEYS = (
    APPEARANCE,
    APPEARANCE_SWITCH,
    LIGHT_FROM,
    DARK_FROM,
    THEME_PAIR,
    COLORS_LIGHT,
    COLORS_DARK,
    SHAPE,
    MOTION,
)

MODES = ("light", "dark", "automatic")
SWITCHES = ("sun", "schedule", "home_assistant")
PAIRS = ("planavista", "minimal", "vibrant")
MOTIONS = ("device", "full", "reduced")
HEADER_PRESETS = (
    "gradient_purple",
    "gradient_teal",
    "gradient_sunset",
    "solid_accent",
    "solid_dark",
)
SHAPE_KEYS = ("corner_style", "shadow_depth", "event_style", "avatar_border")

CLOCK_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"
_CLOCK = re.compile(CLOCK_PATTERN)

# 1.1.0's theme keys and the theme and mode each one becomes.
_LEGACY_THEMES: dict[str, tuple[str, str]] = {
    "planavista": ("planavista", "light"),
    "light": ("planavista", "light"),
    "dark": ("planavista", "dark"),
    "minimal": ("minimal", "light"),
    "modern": ("vibrant", "light"),
    "vibrant": ("vibrant", "light"),
}


def _pick(value: Any, allowed: tuple[str, ...], fallback: str) -> str:
    return value if value in allowed else fallback


def _clock(value: Any, fallback: str) -> str:
    return value if isinstance(value, str) and _CLOCK.match(value) else fallback


def _record(value: Any) -> dict[str, Any] | None:
    return dict(value) if isinstance(value, Mapping) else None


def _legacy_colors(overrides: Mapping[str, Any]) -> dict[str, Any]:
    colors = {key: overrides[key] for key in ("accent", "background", "now_color") if overrides.get(key)}
    style = overrides.get("header_style")
    if style == "custom":
        if overrides.get("header_custom"):
            colors["header"] = overrides["header_custom"]
    elif style:
        colors["header"] = style
    return colors


def _legacy_shape(overrides: Mapping[str, Any]) -> dict[str, Any]:
    shape = {key: overrides[key] for key in SHAPE_KEYS if overrides.get(key)}
    if shape.get("avatar_border") == "light":
        shape["avatar_border"] = "white"
    return shape


def appearance_settings(display: Mapping[str, Any]) -> dict[str, Any]:
    """Every appearance setting: the new keys, or what 1.1.0's keys mean."""
    legacy = display.get("theme") or "planavista"
    pair, mode = _LEGACY_THEMES.get(legacy, _LEGACY_THEMES["planavista"])
    overrides = _record(display.get("theme_overrides")) or {}
    colors = _legacy_colors(overrides)
    light = _record(display.get(COLORS_LIGHT))
    dark = _record(display.get(COLORS_DARK))
    shape = _record(display.get(SHAPE))
    return {
        APPEARANCE: _pick(display.get(APPEARANCE), MODES, mode),
        APPEARANCE_SWITCH: _pick(display.get(APPEARANCE_SWITCH), SWITCHES, "sun"),
        LIGHT_FROM: _clock(display.get(LIGHT_FROM), "07:00"),
        DARK_FROM: _clock(display.get(DARK_FROM), "21:00"),
        THEME_PAIR: _pick(display.get(THEME_PAIR), PAIRS, pair),
        COLORS_LIGHT: light if light is not None else ({} if legacy == "dark" else colors),
        COLORS_DARK: dark if dark is not None else (colors if legacy == "dark" else {}),
        SHAPE: shape if shape is not None else _legacy_shape(overrides),
        MOTION: _pick(display.get(MOTION), MOTIONS, "device"),
    }


def theme_choice(theme: str) -> dict[str, str]:
    """The theme and mode a 1.1.0 theme name picks (the options flow's theme list)."""
    pair, mode = _LEGACY_THEMES.get(theme, _LEGACY_THEMES["planavista"])
    return {THEME_PAIR: pair, APPEARANCE: mode}


def legacy_theme(settings: Mapping[str, Any]) -> tuple[str, dict[str, Any]]:
    """The theme and theme_overrides 1.1.0 needs to show this look."""
    pair = settings[THEME_PAIR]
    if pair == "planavista":
        theme = "dark" if settings[APPEARANCE] == "dark" else "planavista"
    elif pair == "minimal":
        theme = "minimal"
    else:
        theme = "modern"
    colors = settings[COLORS_DARK] if theme == "dark" else settings[COLORS_LIGHT]
    overrides: dict[str, Any] = {
        key: colors[key] for key in ("accent", "background", "now_color") if colors.get(key)
    }
    header = colors.get("header")
    if header in HEADER_PRESETS:
        overrides["header_style"] = header
    elif isinstance(header, str) and header.startswith("#"):
        overrides["header_style"] = "custom"
        overrides["header_custom"] = header
    for key in SHAPE_KEYS:
        if settings[SHAPE].get(key):
            overrides[key] = settings[SHAPE][key]
    if overrides.get("avatar_border") == "white":
        overrides["avatar_border"] = "light"
    return theme, overrides


def with_legacy_theme(display: Mapping[str, Any]) -> dict[str, Any]:
    """The display with every appearance key written, and theme and theme_overrides rewritten from them.

    Writing every key first keeps colors that were only implied by 1.1.0's
    keys: a display saved before the migration, then switched to Dark,
    keeps its light colors.
    """
    settings = appearance_settings(display)
    result = {**display, **settings}
    theme, overrides = legacy_theme(settings)
    result["theme"] = theme
    if overrides:
        result["theme_overrides"] = overrides
    else:
        result.pop("theme_overrides", None)
    return result


def migrate_display(display: Mapping[str, Any]) -> dict[str, Any]:
    """Config entry minor version 2: write the new keys beside 1.1.0's. Safe to run twice."""
    settings = appearance_settings(display)
    return {**display, **{key: settings[key] for key in APPEARANCE_KEYS if key not in display}}
