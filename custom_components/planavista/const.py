"""Constants for the PlanaVista integration."""
from typing import Final

DOMAIN: Final = "planavista"
NAME: Final = "PlanaVista"
VERSION: Final = "0.10.0"

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
CONF_DISPLAY: Final = "display"
CONF_ONBOARDING_COMPLETE: Final = "onboarding_complete"
CONF_THEME_OVERRIDES: Final = "theme_overrides"
CONF_LOCATION_AUTOCOMPLETE: Final = "location_autocomplete"

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

# People's and the theme's colors: 24 standard colors in color-wheel order, then
# neutrals (owner, 2026-10-14). tests/fixtures/palette.json holds the same table
# for the card. light = the color 65% of the way to white (core/color.ts lightTint).
COLOR_PRESETS: Final = [
    {"name": "Red",      "color": "#D93A40", "color_light": "#F2BABC"},
    {"name": "Coral",    "color": "#FF7B6E", "color_light": "#FFD1CC"},
    {"name": "Orange",   "color": "#F26A10", "color_light": "#FACBAB"},
    {"name": "Amber",    "color": "#FFB224", "color_light": "#FFE4B2"},
    {"name": "Yellow",   "color": "#F5D90A", "color_light": "#FCF2A9"},
    {"name": "Lime",     "color": "#99D52A", "color_light": "#DBF0B4"},
    {"name": "Green",    "color": "#2E9E52", "color_light": "#B6DDC2"},
    {"name": "Mint",     "color": "#3CCB9A", "color_light": "#BBEDDC"},
    {"name": "Teal",     "color": "#0D9EA8", "color_light": "#AADDE1"},
    {"name": "Cyan",     "color": "#00A6D6", "color_light": "#A6E0F1"},
    {"name": "Sky",      "color": "#5BBDF0", "color_light": "#C6E8FA"},
    {"name": "Blue",     "color": "#1A72E0", "color_light": "#AFCEF4"},
    {"name": "Indigo",   "color": "#3E5BD6", "color_light": "#BBC6F1"},
    {"name": "Violet",   "color": "#6B4FD8", "color_light": "#CBC1F1"},
    {"name": "Purple",   "color": "#9B48C2", "color_light": "#DCBFEA"},
    {"name": "Magenta",  "color": "#B837B5", "color_light": "#E6B9E5"},
    {"name": "Pink",     "color": "#EC5BAE", "color_light": "#F8C6E3"},
    {"name": "Rose",     "color": "#C9286E", "color_light": "#ECB4CC"},
    {"name": "Brown",    "color": "#9A6B47", "color_light": "#DCCBBF"},
    {"name": "Sand",     "color": "#C8A57A", "color_light": "#ECE0D0"},
    {"name": "Slate",    "color": "#5E7189", "color_light": "#C7CDD6"},
    {"name": "Gray",     "color": "#8B8D98", "color_light": "#D6D7DB"},
    {"name": "Charcoal", "color": "#3A3D44", "color_light": "#BABBBE"},
    {"name": "Black",    "color": "#17181A", "color_light": "#AEAEAF"},
]

# The first 20 colors: still accepted, so nobody's color changes; not offered.
LEGACY_COLOR_PRESETS: Final = [
    {"name": "Ink Black",        "color": "#001219", "color_light": "#A6ACAF"},
    {"name": "Dark Teal",        "color": "#005F73", "color_light": "#A6C7CE"},
    {"name": "Dark Cyan",        "color": "#0A9396", "color_light": "#A9D9DA"},
    {"name": "Pearl Aqua",       "color": "#94D2BD", "color_light": "#DAEFE8"},
    {"name": "Wheat",            "color": "#E9D8A6", "color_light": "#F7F1E0"},
    {"name": "Golden Orange",    "color": "#EE9B00", "color_light": "#F9DCA6"},
    {"name": "Burnt Caramel",    "color": "#CA6702", "color_light": "#ECCAA6"},
    {"name": "Rusty Spice",      "color": "#BB3E03", "color_light": "#E7BBA7"},
    {"name": "Oxidized Iron",    "color": "#AE2012", "color_light": "#E3B1AC"},
    {"name": "Brown Red",        "color": "#9B2226", "color_light": "#DCB2B3"},
    {"name": "Strawberry Red",   "color": "#F94144", "color_light": "#FDBDBE"},
    {"name": "Pumpkin Spice",    "color": "#F3722C", "color_light": "#FBCEB5"},
    {"name": "Carrot Orange",    "color": "#F8961E", "color_light": "#FDDAB0"},
    {"name": "Atomic Tangerine", "color": "#F9844A", "color_light": "#FDD4C0"},
    {"name": "Tuscan Sun",       "color": "#F9C74F", "color_light": "#FDEBC1"},
    {"name": "Willow Green",     "color": "#90BE6D", "color_light": "#D8E8CC"},
    {"name": "Seaweed",          "color": "#43AA8B", "color_light": "#BDE1D6"},
    {"name": "Ocean Cyan",       "color": "#4D908E", "color_light": "#C1D8D7"},
    {"name": "Blue Slate",       "color": "#577590", "color_light": "#C4CFD8"},
    {"name": "Cerulean",         "color": "#277DA1", "color_light": "#B3D2DE"},
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

# Upper bound for each Google Calendar API request (and token refresh)
GOOGLE_API_TIMEOUT_SECONDS: Final = 15

# Entity prefixes
SENSOR_PREFIX: Final = "planavista"

# Card bundle: frontend/dist is served at FRONTEND_URL_PATH
FRONTEND_URL_PATH: Final = "/planavista_panel/dist"
FRONTEND_BUNDLE: Final = "planavista-cards.js"

# Sent after settings are saved through async_apply_config (chores follow the first day).
SIGNAL_CONFIG_APPLIED: Final = f"{DOMAIN}_config_applied"

# Services
SERVICE_SAVE_CONFIG: Final = "save_config"
SERVICE_DELETE_EVENT: Final = "delete_event"
SERVICE_CREATE_EVENT_WITH_ATTENDEES: Final = "create_event_with_attendees"

# Default configuration
DEFAULT_TIME_FORMAT: Final = TIME_FORMAT_12H
DEFAULT_FIRST_DAY: Final = FIRST_DAY_MONDAY
DEFAULT_VIEW: Final = VIEW_WEEK
DEFAULT_THEME: Final = THEME_PLANAVISTA
