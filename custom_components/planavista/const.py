"""Constants for the PlanaVista integration."""
from typing import Final

DOMAIN: Final = "planavista"
NAME: Final = "PlanaVista"
VERSION: Final = "0.2.0"

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

# Default colors (beautiful palette for calendars)
DEFAULT_COLORS: Final = [
    "#FB8072",  # Coral
    "#FDBF6F",  # Peach
    "#A6CEE3",  # Sky Blue
    "#CAB2D6",  # Lavender
    "#4A90E2",  # Blue
    "#33A02C",  # Green
    "#FF7F00",  # Orange
    "#E31A1C",  # Red
    "#6A3D9A",  # Purple
    "#B15928",  # Brown
]

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
