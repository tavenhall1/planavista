"""The binary sensor platform: whether each member's chores are done today (spec 10.2)."""
from __future__ import annotations

from .chores.binary_sensor import async_setup_entry

__all__ = ["async_setup_entry"]
