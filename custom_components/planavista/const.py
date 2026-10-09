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

# Curated color presets (primary + light variant pairs)
COLOR_PRESETS: Final = [
    # Palette 1: Earth & Ocean tones
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
    # Palette 2: Warm & Vivid tones
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

# Services
SERVICE_SAVE_CONFIG: Final = "save_config"
SERVICE_DELETE_EVENT: Final = "delete_event"
SERVICE_CREATE_EVENT_WITH_ATTENDEES: Final = "create_event_with_attendees"

# Default configuration
DEFAULT_TIME_FORMAT: Final = TIME_FORMAT_12H
DEFAULT_FIRST_DAY: Final = FIRST_DAY_MONDAY
DEFAULT_VIEW: Final = VIEW_WEEK
DEFAULT_THEME: Final = THEME_PLANAVISTA
