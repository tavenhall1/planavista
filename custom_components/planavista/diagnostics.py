"""Download diagnostics: counts, settings, Store versions, recent errors, and recent refusals (spec 15.6).

Member names are replaced ("Member 1"), and PIN data and Home Assistant user
ids are left out entirely.
"""
from __future__ import annotations

from collections import Counter
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from .chores.runtime import DATA_CHORES
from .const import CONF_CALENDARS, CONF_DISPLAY
from .coordinator import PlanaVistaConfigEntry
from .household.members import ordered
from .household.store import DATA_HOUSEHOLD
from .refusals import recent_refusals

TO_REDACT = {"weather_entity"}


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: PlanaVistaConfigEntry) -> dict[str, Any]:
    """What a bug report needs, and nothing about who lives here."""
    household = hass.data.get(DATA_HOUSEHOLD)
    chores = hass.data.get(DATA_CHORES)
    result: dict[str, Any] = {
        "entry": {
            "version": entry.version,
            "minor_version": entry.minor_version,
            "calendars": len(entry.data.get(CONF_CALENDARS, [])),
            "display": async_redact_data(dict(entry.data.get(CONF_DISPLAY, {})), TO_REDACT),
        }
    }
    names: dict[str, str] = {}
    if household is not None:
        members = ordered(household.members)
        names = {m["id"]: f"Member {n}" for n, m in enumerate(members, 1)}
        result["household"] = {
            "available": household.available,
            "members": [
                {
                    "member": names[m["id"]],
                    "age_group": m.get("age_group"),
                    "parent": bool(m.get("parent")),
                    "needs_ok_for": m.get("needs_ok_for"),
                    "stars": bool(m.get("stars")),
                    "has_person": bool(m.get("person")),
                    "has_pin": m["id"] in household.pins,
                    "away_ranges": len(m.get("away") or []),
                }
                for m in members
            ],
            "shared_screens": len(household.shared_users),
            "kiosk": {
                "enabled": household.data["security"]["kiosk"]["enabled"],
                "top_bar": household.data["security"]["kiosk"]["top_bar"],
            },
            "modules": household.data["modules"],
            "setup": household.data["setup"],
        }
    if chores is not None:
        engine = chores.engine
        result["chores"] = {
            "state": chores.state,
            "save_failed": chores.save_failed,
            "settings": dict(engine.settings),
            "chores_by_schedule": dict(Counter(a.get("schedule") for a in engine.plan["activities"])),
            "chores_unassigned": len(engine.needs_a_look()),
            "completions": len(engine.log["completions"]),
            "overrides": len(engine.log["overrides"]),
            "open_requests": len(engine.open_requests()),
            "carried": len(engine.log["carried"]),
            "summaries": len(engine.log["summaries"]),
            "rewards": len(engine.rewards["rewards"]),
            "ledger": len(engine.rewards["ledger"]),
            "last_day": engine.log.get("last_day"),
            "last_boundary": engine.log.get("last_boundary"),
            "stores": {
                name: {"version": store.version, "minor_version": store.minor_version}
                for name, store in chores.stores.files.items()
            },
            "recent_errors": list(chores.errors),
        }
    # What was refused lately (milestone 8): time, command, and reason only.
    result["recent_refusals"] = recent_refusals(hass)
    return result
