"""Fail when a tracked text file contains an em dash.

PlanaVista's copy rule: no em dashes in product copy, docs, or code.
Use a comma, a colon, parentheses, or two sentences instead.

    python scripts/check_copy.py          check every tracked file
    python scripts/check_copy.py FILE...  check only these files

Exits 0 when clean and 1 when anything was found.
"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# Spelled with chr() and concatenation so this file passes its own check.
EM_DASH_FORMS: tuple[str, ...] = (
    chr(0x2014),  # the character itself
    "&" + "mdash;",  # HTML named entity
    "&#" + "8212;",  # HTML decimal entity
    "&#x" + "2014;",  # HTML hex entity
    "\\" + "u2014",  # JavaScript, JSON, and Python escape
)
_PATTERN = re.compile(
    "|".join(re.escape(form) for form in EM_DASH_FORMS), re.IGNORECASE
)

# Generated and binary files are not checked.
_SKIPPED_PREFIXES = ("custom_components/planavista/frontend/dist/",)
_SKIPPED_SUFFIXES = (
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".otf", ".zip", ".gz",
)


def is_checked_path(path: str) -> bool:
    """Return True for the tracked text files the rule covers."""
    normalized = path.replace("\\", "/")
    if normalized.startswith(_SKIPPED_PREFIXES):
        return False
    return not normalized.lower().endswith(_SKIPPED_SUFFIXES)


def find_em_dashes(text: str) -> list[tuple[int, str]]:
    """Return (line number, line) for every line with an em dash in any spelling."""
    return [
        (number, line)
        for number, line in enumerate(text.splitlines(), start=1)
        if _PATTERN.search(line)
    ]


def _tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "-z"], cwd=REPO, check=True, capture_output=True
    )
    return [name for name in result.stdout.decode("utf-8").split("\0") if name]


def main(argv: list[str] | None = None) -> int:
    """Print every offending line and return the exit status."""
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:] if argv is None else argv
    paths = args or [path for path in _tracked_files() if is_checked_path(path)]
    found = 0
    for path in paths:
        try:
            text = (REPO / path).read_text(encoding="utf-8")
        except (UnicodeDecodeError, FileNotFoundError):
            continue
        for number, line in find_em_dashes(text):
            print(f"{path}:{number}: {line.strip()}")
            found += 1
    if found:
        print(
            f"\n{found} em dash(es) found. "
            "Use a comma, a colon, parentheses, or two sentences."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
