"""Config flow for PlanaVista integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector
from homeassistant.helpers import entity_registry as er

from .const import (
    DOMAIN,
    NAME,
    CONF_CALENDARS,
    CONF_DISPLAY_NAME,
    CONF_COLOR,
    CONF_COLOR_LIGHT,
    CONF_ICON,
    CONF_PERSON_ENTITY,
    CONF_VISIBLE,
    CONF_TIME_FORMAT,
    CONF_WEATHER_ENTITY,
    CONF_FIRST_DAY,
    CONF_DEFAULT_VIEW,
    CONF_THEME,
    TIME_FORMAT_12H,
    TIME_FORMAT_24H,
    FIRST_DAY_MONDAY,
    FIRST_DAY_SUNDAY,
    CALENDAR_VIEWS,
    THEMES,
    COLOR_PRESETS,
    DEFAULT_COLORS,
    DEFAULT_TIME_FORMAT,
    DEFAULT_FIRST_DAY,
    DEFAULT_VIEW,
    DEFAULT_THEME,
)
from .coordinator import async_apply_config

_LOGGER = logging.getLogger(__name__)


def _discover_calendar_entities(hass: HomeAssistant) -> list[str]:
    """Discover all calendar entities in Home Assistant."""
    entity_registry = er.async_get(hass)
    calendar_entities = []

    for entity in entity_registry.entities.values():
        if entity.domain == "calendar":
            calendar_entities.append(entity.entity_id)

    # Also check current states for calendars not in registry
    for entity_id in hass.states.async_entity_ids("calendar"):
        if entity_id not in calendar_entities:
            calendar_entities.append(entity_id)

    return sorted(calendar_entities)


def _discover_weather_entities(hass: HomeAssistant) -> list[str]:
    """Discover all weather entities in Home Assistant."""
    entity_registry = er.async_get(hass)
    weather_entities = []

    for entity in entity_registry.entities.values():
        if entity.domain == "weather":
            weather_entities.append(entity.entity_id)

    # Also check current states
    for entity_id in hass.states.async_entity_ids("weather"):
        if entity_id not in weather_entities:
            weather_entities.append(entity_id)

    return sorted(weather_entities)


def _discover_person_entities(hass: HomeAssistant) -> list[str]:
    """Discover all person entities in Home Assistant."""
    entity_registry = er.async_get(hass)
    person_entities = [""]  # Empty option for "no person"

    for entity in entity_registry.entities.values():
        if entity.domain == "person":
            person_entities.append(entity.entity_id)

    # Also check current states
    for entity_id in hass.states.async_entity_ids("person"):
        if entity_id not in person_entities:
            person_entities.append(entity_id)

    return person_entities


def _get_friendly_name(hass: HomeAssistant, entity_id: str) -> str:
    """Get friendly name for an entity."""
    state = hass.states.get(entity_id)
    if state and state.attributes.get("friendly_name"):
        return state.attributes["friendly_name"]
    return entity_id.split(".")[-1].replace("_", " ").title()


def _rgb_to_hex(rgb_value: list[int] | str) -> str:
    """Convert RGB list to hex color string.

    The ColorRGBSelector returns colors as [R, G, B] lists.
    This function converts them to '#RRGGBB' hex strings.
    """
    if isinstance(rgb_value, str):
        # Already a hex string
        return rgb_value
    if isinstance(rgb_value, (list, tuple)) and len(rgb_value) >= 3:
        r, g, b = rgb_value[:3]
        return f"#{int(r):02x}{int(g):02x}{int(b):02x}"
    # Fallback to default color
    return "#4A90E2"


def _hex_to_rgb(hex_value: str) -> list[int]:
    """Convert hex color string to RGB list for ColorRGBSelector."""
    if hex_value.startswith("#"):
        hex_value = hex_value[1:]
    if len(hex_value) == 6:
        return [int(hex_value[i:i+2], 16) for i in (0, 2, 4)]
    return [74, 144, 226]  # Default blue


def _get_color_light(color_hex: str) -> str:
    """Get the light variant for a color.

    Checks curated presets first, falls back to computed 12% tint.
    """
    for preset in COLOR_PRESETS:
        if preset["color"].lower() == color_hex.lower():
            return preset["color_light"]
    return _compute_light_variant(color_hex, 0.12)


def _compute_light_variant(hex_color: str, ratio: float) -> str:
    """Compute a light tint of a color by mixing with white."""
    rgb = _hex_to_rgb(hex_color)
    light = [int(c + (255 - c) * (1 - ratio)) for c in rgb]
    return f"#{light[0]:02x}{light[1]:02x}{light[2]:02x}"


class PlanaVistaConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for PlanaVista."""

    VERSION = 1

    def __init__(self):
        """Initialize the config flow."""
        self._data = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Single confirmation step — wizard handles actual setup in-card."""
        if user_input is not None:
            return self.async_create_entry(
                title=NAME,
                data={
                    CONF_CALENDARS: [],
                    "display": {
                        CONF_TIME_FORMAT: DEFAULT_TIME_FORMAT,
                        CONF_WEATHER_ENTITY: "",
                        CONF_FIRST_DAY: DEFAULT_FIRST_DAY,
                        CONF_DEFAULT_VIEW: DEFAULT_VIEW,
                        CONF_THEME: DEFAULT_THEME,
                    },
                    "onboarding_complete": False,
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "name": NAME,
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> PlanaVistaOptionsFlow:
        """Get the options flow for this handler."""
        return PlanaVistaOptionsFlow()


class PlanaVistaOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for PlanaVista."""

    def __init__(self) -> None:
        """Initialize options flow."""
        self._calendars_to_add: list[str] = []
        self._calendar_to_edit: str | None = None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Manage the options - show menu."""
        return self.async_show_menu(
            step_id="init",
            menu_options={
                "manage_calendars": "Add or Remove Calendars",
                "edit_calendar": "Edit Calendar Settings",
                "display": "Display Settings",
            },
        )

    async def async_step_manage_calendars(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Handle adding or removing calendars."""
        errors = {}
        current_calendars = self.config_entry.data.get(CONF_CALENDARS, [])
        current_calendar_ids = [c["entity_id"] for c in current_calendars]

        if user_input is not None:
            selected_calendars = user_input.get("calendars", [])

            # Find calendars to add
            calendars_to_add = [c for c in selected_calendars if c not in current_calendar_ids]

            # Find calendars to remove
            calendars_to_remove = [c for c in current_calendar_ids if c not in selected_calendars]

            if calendars_to_add:
                # Need to configure new calendars
                self._calendars_to_add = calendars_to_add
                return await self.async_step_add_calendar()

            # Update config with removed calendars
            new_calendars = [c for c in current_calendars if c["entity_id"] not in calendars_to_remove]
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            await async_apply_config(self.hass, self.config_entry, new_data)

            return self.async_create_entry(title="", data={})

        # Discover available calendars
        available_calendars = _discover_calendar_entities(self.hass)

        calendar_options = {
            entity_id: _get_friendly_name(self.hass, entity_id)
            for entity_id in available_calendars
        }

        schema = vol.Schema(
            {
                vol.Required("calendars", default=current_calendar_ids): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=k, label=v)
                            for k, v in calendar_options.items()
                        ],
                        multiple=True,
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="manage_calendars",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "note": "Check calendars to include, uncheck to remove."
            },
        )

    async def async_step_add_calendar(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Configure a new calendar being added."""
        if user_input is not None:
            current_calendars = list(self.config_entry.data.get(CONF_CALENDARS, []))
            color_hex = _rgb_to_hex(user_input[CONF_COLOR])
            new_calendar = {
                "entity_id": user_input["_entity_id"],
                CONF_DISPLAY_NAME: user_input[CONF_DISPLAY_NAME],
                CONF_COLOR: color_hex,
                CONF_COLOR_LIGHT: _get_color_light(color_hex),
                CONF_ICON: user_input.get(CONF_ICON, "mdi:calendar"),
                CONF_PERSON_ENTITY: user_input.get(CONF_PERSON_ENTITY, ""),
                CONF_VISIBLE: True,
            }
            current_calendars.append(new_calendar)

            # Remove from list to add
            self._calendars_to_add = self._calendars_to_add[1:]

            if self._calendars_to_add:
                # More calendars to add
                new_data = dict(self.config_entry.data)
                new_data[CONF_CALENDARS] = current_calendars
                await async_apply_config(self.hass, self.config_entry, new_data)
                return await self.async_step_add_calendar()

            # All done
            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = current_calendars
            await async_apply_config(self.hass, self.config_entry, new_data)
            return self.async_create_entry(title="", data={})

        # Get the next calendar to configure
        current_calendar = self._calendars_to_add[0]
        current_index = len(self.config_entry.data.get(CONF_CALENDARS, []))

        # Get color for this calendar (cycle through defaults)
        default_color = DEFAULT_COLORS[current_index % len(DEFAULT_COLORS)]
        friendly_name = _get_friendly_name(self.hass, current_calendar)
        person_entities = _discover_person_entities(self.hass)

        schema = vol.Schema(
            {
                vol.Required("_entity_id", default=current_calendar): selector.TextSelector(
                    selector.TextSelectorConfig(type=selector.TextSelectorType.TEXT)
                ),
                vol.Required(CONF_DISPLAY_NAME, default=friendly_name): selector.TextSelector(),
                vol.Required(CONF_COLOR, default=default_color): selector.ColorRGBSelector(),
                vol.Optional(CONF_ICON, default="mdi:calendar"): selector.IconSelector(),
                vol.Optional(CONF_PERSON_ENTITY, default=""): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=entity,
                                label=_get_friendly_name(self.hass, entity) if entity else "None"
                            )
                            for entity in person_entities
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="add_calendar",
            data_schema=schema,
            description_placeholders={
                "calendar_name": friendly_name,
            },
        )

    async def async_step_edit_calendar(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Select which calendar to edit."""
        current_calendars = self.config_entry.data.get(CONF_CALENDARS, [])

        if not current_calendars:
            return self.async_abort(reason="no_calendars")

        if user_input is not None:
            self._calendar_to_edit = user_input["calendar"]
            return await self.async_step_edit_calendar_details()

        calendar_options = [
            selector.SelectOptionDict(
                value=cal["entity_id"],
                label=cal[CONF_DISPLAY_NAME]
            )
            for cal in current_calendars
        ]

        schema = vol.Schema(
            {
                vol.Required("calendar"): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=calendar_options,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="edit_calendar",
            data_schema=schema,
        )

    async def async_step_edit_calendar_details(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Edit the selected calendar's details."""
        current_calendars = self.config_entry.data.get(CONF_CALENDARS, [])

        # Find the calendar to edit
        calendar_data = None
        calendar_index = None
        for i, cal in enumerate(current_calendars):
            if cal["entity_id"] == self._calendar_to_edit:
                calendar_data = cal
                calendar_index = i
                break

        if calendar_data is None:
            return self.async_abort(reason="calendar_not_found")

        if user_input is not None:
            # Update the calendar
            color_hex = _rgb_to_hex(user_input[CONF_COLOR])
            updated_calendar = {
                "entity_id": calendar_data["entity_id"],
                CONF_DISPLAY_NAME: user_input[CONF_DISPLAY_NAME],
                CONF_COLOR: color_hex,
                CONF_COLOR_LIGHT: _get_color_light(color_hex),
                CONF_ICON: user_input.get(CONF_ICON, "mdi:calendar"),
                CONF_PERSON_ENTITY: user_input.get(CONF_PERSON_ENTITY, ""),
                CONF_VISIBLE: calendar_data.get(CONF_VISIBLE, True),
            }

            new_calendars = list(current_calendars)
            new_calendars[calendar_index] = updated_calendar

            new_data = dict(self.config_entry.data)
            new_data[CONF_CALENDARS] = new_calendars

            await async_apply_config(self.hass, self.config_entry, new_data)

            return self.async_create_entry(title="", data={})

        person_entities = _discover_person_entities(self.hass)

        # Convert hex color to RGB for the selector
        current_color = calendar_data.get(CONF_COLOR, "#4A90E2")
        rgb_color = _hex_to_rgb(current_color)

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_DISPLAY_NAME,
                    default=calendar_data.get(CONF_DISPLAY_NAME, "")
                ): selector.TextSelector(),
                vol.Required(
                    CONF_COLOR,
                    default=rgb_color
                ): selector.ColorRGBSelector(),
                vol.Optional(
                    CONF_ICON,
                    default=calendar_data.get(CONF_ICON, "mdi:calendar")
                ): selector.IconSelector(),
                vol.Optional(
                    CONF_PERSON_ENTITY,
                    default=calendar_data.get(CONF_PERSON_ENTITY, "")
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=entity,
                                label=_get_friendly_name(self.hass, entity) if entity else "None"
                            )
                            for entity in person_entities
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="edit_calendar_details",
            data_schema=schema,
            description_placeholders={
                "calendar_name": calendar_data.get(CONF_DISPLAY_NAME, "Calendar"),
            },
        )

    async def async_step_display(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Handle display options."""
        if user_input is not None:
            # Keep display keys this form doesn't edit (theme_overrides,
            # location_autocomplete, and any the card adds later).
            new_data = dict(self.config_entry.data)
            new_data["display"] = {
                **self.config_entry.data.get("display", {}),
                CONF_TIME_FORMAT: user_input[CONF_TIME_FORMAT],
                CONF_WEATHER_ENTITY: user_input.get(CONF_WEATHER_ENTITY, ""),
                CONF_FIRST_DAY: user_input[CONF_FIRST_DAY],
                CONF_DEFAULT_VIEW: user_input[CONF_DEFAULT_VIEW],
                CONF_THEME: user_input[CONF_THEME],
            }

            await async_apply_config(self.hass, self.config_entry, new_data)
            return self.async_create_entry(title="", data={})

        current_display = self.config_entry.data.get("display", {})
        weather_entities = _discover_weather_entities(self.hass)
        weather_options = [""] + weather_entities

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_TIME_FORMAT,
                    default=current_display.get(CONF_TIME_FORMAT, DEFAULT_TIME_FORMAT)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=TIME_FORMAT_12H, label="12-hour (AM/PM)"),
                            selector.SelectOptionDict(value=TIME_FORMAT_24H, label="24-hour"),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(
                    CONF_WEATHER_ENTITY,
                    default=current_display.get(CONF_WEATHER_ENTITY, "")
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=entity,
                                label=_get_friendly_name(self.hass, entity) if entity else "None"
                            )
                            for entity in weather_options
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_FIRST_DAY,
                    default=current_display.get(CONF_FIRST_DAY, DEFAULT_FIRST_DAY)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=FIRST_DAY_MONDAY, label="Monday"),
                            selector.SelectOptionDict(value=FIRST_DAY_SUNDAY, label="Sunday"),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_DEFAULT_VIEW,
                    default=current_display.get(CONF_DEFAULT_VIEW, DEFAULT_VIEW)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=view, label=view.title())
                            for view in CALENDAR_VIEWS
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Required(
                    CONF_THEME,
                    default=current_display.get(CONF_THEME, DEFAULT_THEME)
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(value=theme, label=theme.title())
                            for theme in THEMES
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="display",
            data_schema=schema,
            description_placeholders={
                "note": "These are default settings. Individual cards can override these."
            },
        )
