"""event.<member>_chores: completed, approved, sent back, undone, missed, and redeemed (spec 10.2)."""
from __future__ import annotations

from homeassistant.components.event import EventEntity
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from ..coordinator import PlanaVistaConfigEntry
from .engine import EVENT_TYPES, ChoreEvent
from .entity import ChoresEntity
from .runtime import DATA_CHORES, ChoresRuntime


class ChoresEventEntity(ChoresEntity, EventEntity):
    """A member's chores events, for automation triggers."""

    _attr_event_types = list(EVENT_TYPES)
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(self, runtime: ChoresRuntime, entry_id: str, member_id: str) -> None:
        """The member's event entity."""
        super().__init__(runtime, entry_id, member_id, "chores")

    async def async_added_to_hass(self) -> None:
        """Listen for this member's events too."""
        await super().async_added_to_hass()
        self.async_on_remove(self.runtime.async_listen_events(self._handle_event))

    @callback
    def _handle_event(self, event: ChoreEvent) -> None:
        if event.member == self.member_id:
            self._trigger_event(event.type, event.data)
            self.async_write_ha_state()


async def async_setup_entry(
    hass: HomeAssistant, entry: PlanaVistaConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback
) -> None:
    """Add an event entity for each member, now and when people join."""
    runtime = hass.data[DATA_CHORES]
    runtime.async_add_platform(
        Platform.EVENT,
        async_add_entities,
        lambda member_id: [ChoresEventEntity(runtime, entry.entry_id, member_id)],
    )
