"""Tests for scripts/check_copy.py, the rule that tracked files have no em dashes."""
from __future__ import annotations

import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "scripts" / "check_copy.py"
_spec = importlib.util.spec_from_file_location("check_copy", SCRIPT)
assert _spec is not None and _spec.loader is not None
check_copy = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(check_copy)

# Built at runtime, so this file never contains the forms it tests.
DASH = chr(0x2014)
NAMED = "&" + "mdash;"
DECIMAL = "&#" + "8212;"
HEX = "&#x" + "2014;"
ESCAPE = "\\" + "u2014"


def test_finds_every_spelling_with_line_numbers() -> None:
    text = "\n".join(
        [
            "plain line",
            f"Save failed {DASH} try again",
            f"Nothing else is sent {NAMED} not your location",
            f"decimal {DECIMAL} here",
            f"hex {HEX.upper()} here",
            f"escape {ESCAPE} here",
        ]
    )
    assert [number for number, _ in check_copy.find_em_dashes(text)] == [2, 3, 4, 5, 6]


def test_ignores_en_dashes_hyphens_and_the_words_em_dash() -> None:
    text = "4" + chr(0x2013) + "6 digits, a well-known word, and the words em dash"
    assert check_copy.find_em_dashes(text) == []


def test_checks_text_files_but_not_the_bundle_or_binaries() -> None:
    assert check_copy.is_checked_path("README.md")
    assert check_copy.is_checked_path("custom_components/planavista/frontend/src/main.ts")
    assert check_copy.is_checked_path("custom_components/planavista/strings.json")
    assert check_copy.is_checked_path("assets/diagram.svg")
    assert not check_copy.is_checked_path(
        "custom_components/planavista/frontend/dist/planavista-cards.js"
    )
    assert not check_copy.is_checked_path("assets/logo.png")
    assert not check_copy.is_checked_path("custom_components/planavista/brand/icon.png")


def test_the_script_and_this_test_pass_their_own_check() -> None:
    for path in (SCRIPT, Path(__file__)):
        assert check_copy.find_em_dashes(path.read_text(encoding="utf-8")) == [], path
