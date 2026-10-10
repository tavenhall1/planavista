"""select.planavista_appearance: Light, Dark, or Automatic for every screen (spec 10.2, 12.4)."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .appearance import APPEARANCE, MODES, appearance_settings
from .const import CONF_DISPLAY
from .coordinator import PlanaVistaConfigEntry, PlanaVistaCoordinator
from .services import async_store_config


async def async_setup_entry(
    hass: HomeAssistant,
    entry: PlanaVistaConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the appearance select."""
    async_add_entities([PlanaVistaAppearanceSelect(entry.runtime_data, entry)])


class PlanaVistaAppearanceSelect(CoordinatorEntity[PlanaVistaCoordinator], SelectEntity):
    """The household's appearance; an automation can pick Dark for movie night."""

    _attr_translation_key = "appearance"
    _attr_icon = "mdi:theme-light-dark"
    _attr_options = list(MODES)

    def __init__(self, coordinator: PlanaVistaCoordinator, entry: PlanaVistaConfigEntry) -> None:
        """Name it like the other PlanaVista entities, so its ID is select.planavista_appearance."""
        super().__init__(coordinator)
        self.entity_id = "select.planavista_appearance"
        self._attr_name = "PlanaVista appearance"
        self._attr_unique_id = f"{entry.entry_id}_appearance"

    @property
    def available(self) -> bool:
        """The appearance doesn't depend on calendars, so a failed refresh doesn't hide it."""
        return True

    @property
    def current_option(self) -> str:
        """Light, dark, or automatic, as the card reads it."""
        return appearance_settings(self.coordinator.display_config)[APPEARANCE]

    async def async_select_option(self, option: str) -> None:
        """Save the choice the way the card's Appearance page does."""
        await async_store_config(self.hass, {CONF_DISPLAY: {APPEARANCE: option}}, merge_display=True)
