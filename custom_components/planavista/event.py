"""The event platform: each member's chores events, for automation triggers (spec 10.2)."""
from __future__ import annotations

from .chores.event import async_setup_entry

__all__ = ["async_setup_entry"]
