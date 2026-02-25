"""Constants for the PlanaVista integration."""
from typing import Final

DOMAIN: Final = "planavista"
NAME: Final = "PlanaVista"
VERSION: Final = "1.0.0"

# Event fetching range
EVENT_RANGE_PAST_DAYS: Final = 30
EVENT_RANGE_FUTURE_DAYS: Final = 60

# Configuration keys
CONF_CALENDARS: Final = "calendars"
CONF_DISPLAY_NAME: Final = "display_name"
CONF_COLOR: Final = "color"
CONF_ICON: Final = "icon"
CONF_PERSON_ENTITY: Final = "person_entity"
CONF_VISIBLE: Final = "visible"
CONF_TIME_FORMAT: Final = "time_format"
CONF_WEATHER_ENTITY: Final = "weather_entity"
CONF_FIRST_DAY: Final = "first_day"
CONF_DEFAULT_VIEW: Final = "default_view"
CONF_THEME: Final = "theme"
CONF_COLOR_LIGHT: Final = "color_light"

# Display settings
TIME_FORMAT_12H: Final = "12h"
TIME_FORMAT_24H: Final = "24h"

FIRST_DAY_MONDAY: Final = "monday"
FIRST_DAY_SUNDAY: Final = "sunday"

# Calendar views
VIEW_DAY: Final = "day"
VIEW_WEEK: Final = "week"
VIEW_MONTH: Final = "month"
VIEW_AGENDA: Final = "agenda"

CALENDAR_VIEWS: Final = [VIEW_DAY, VIEW_WEEK, VIEW_MONTH, VIEW_AGENDA]

# Curated color presets (primary + light variant pairs)
COLOR_PRESETS: Final = [
    {"name": "Ocean",    "color": "#4A90D9", "color_light": "#DCE8F5"},
    {"name": "Fire",     "color": "#FC6A05", "color_light": "#FEE6D1"},
    {"name": "Sage",     "color": "#6BA368", "color_light": "#E2F0E1"},
    {"name": "Lavender", "color": "#9B8EC4", "color_light": "#EDEBF5"},
    {"name": "Amber",    "color": "#D9A52B", "color_light": "#F7EDCF"},
    {"name": "Honey",    "color": "#CDCB2E", "color_light": "#F3F3DA"},
    {"name": "Rose",     "color": "#D4728C", "color_light": "#F5E4EA"},
    {"name": "Teal",     "color": "#4A9E9E", "color_light": "#DDF0F0"},
    {"name": "Slate",    "color": "#6B7A8D", "color_light": "#E8EAED"},
    {"name": "Graphite", "color": "#505050", "color_light": "#E8E8E8"},
]

# Backward-compatible flat lists
DEFAULT_COLORS: Final = [p["color"] for p in COLOR_PRESETS]
DEFAULT_COLORS_LIGHT: Final = [p["color_light"] for p in COLOR_PRESETS]

# Themes
THEME_PLANAVISTA: Final = "planavista"
THEME_MINIMAL: Final = "minimal"
THEME_MODERN: Final = "modern"
THEME_DARK: Final = "dark"

THEMES: Final = [THEME_PLANAVISTA, THEME_MINIMAL, THEME_MODERN, THEME_DARK]

# Update intervals
UPDATE_INTERVAL_SECONDS: Final = 60

# Entity prefixes
SENSOR_PREFIX: Final = "planavista"

# Services
SERVICE_ADD_EVENT: Final = "add_event"
SERVICE_SET_CALENDAR_VISIBILITY: Final = "set_calendar_visibility"
SERVICE_REFRESH_CALENDARS: Final = "refresh_calendars"

# Default configuration
DEFAULT_TIME_FORMAT: Final = TIME_FORMAT_12H
DEFAULT_FIRST_DAY: Final = FIRST_DAY_MONDAY
DEFAULT_VIEW: Final = VIEW_WEEK
DEFAULT_THEME: Final = THEME_PLANAVISTA
