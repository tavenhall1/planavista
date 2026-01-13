# PlanaVista Dashboard Examples

This folder contains example dashboard configurations for different display types and use cases.

## Available Layouts

### `wall-portrait.yaml`
**Best for:** Portrait-oriented tablets, vertical monitors

```
┌────────────────────────┐
│  Clock    │  Weather   │
├───────────────────────-┤
│   Calendar Toggles     │
├────────────────────────┤
│                        │
│   Week Calendar Grid   │
│                        │
├────────────────────────┤
│   Upcoming Events      │
│   (Agenda)             │
└────────────────────────┘
```

### `wall-landscape.yaml`
**Best for:** Horizontal tablets, TVs, wide monitors

```
┌──────────────┬─────────────────────────────┐
│   Clock      │                             │
├──────────────┤                             │
│   Weather    │     Week Calendar Grid      │
├──────────────┤                             │
│   Toggles    │                             │
├──────────────┤                             │
│   Agenda     │                             │
└──────────────┴─────────────────────────────┘
```

### `tablet-compact.yaml`
**Best for:** Small tablets (7-10"), sidebar widgets

```
┌────────────────┐
│     Clock      │
├────────────────┤
│ [◉] [◉] [◉]   │
├────────────────┤
│ Today          │
│ • 9am Meeting  │
│ • 2pm Call     │
│ Tomorrow       │
│ • 10am Review  │
└────────────────┘
```

## How to Use

### Option 1: Create a New Dashboard

1. Go to **Settings > Dashboards**
2. Click **Add Dashboard**
3. Choose a name (e.g., "Wall Calendar")
4. Select **"Start with an empty dashboard"**
5. Click the three-dot menu > **Edit Dashboard**
6. Click the three-dot menu > **Raw configuration editor**
7. Paste the YAML content from your chosen layout
8. Click **Save**

### Option 2: Add to Existing Dashboard

1. Open your existing dashboard
2. Click **Edit Dashboard** (pencil icon)
3. Add new cards using the visual editor
4. For each PlanaVista card, search for its type (e.g., "PlanaVista Clock")

### Option 3: YAML Mode

If you use YAML-based dashboards, you can include these directly in your `configuration.yaml`:

```yaml
lovelace:
  mode: yaml
  dashboards:
    lovelace-planavista:
      mode: yaml
      title: Wall Calendar
      filename: dashboards/planavista.yaml
```

## Component Cards

Each example uses these modular cards:

| Card | Purpose |
|------|---------|
| `planavista-clock-card` | Large time/date display |
| `planavista-weather-card` | Weather conditions and forecast |
| `planavista-toggles-card` | Calendar visibility toggles |
| `planavista-grid-card` | Calendar grid (week/month/day) |
| `planavista-agenda-card` | Upcoming events list |

## Card Configuration Options

### planavista-clock-card
```yaml
type: custom:planavista-clock-card
entity: sensor.planavista_config  # Required
size: large          # small, medium, large
show_date: true      # Show date below time
show_seconds: false  # Show seconds
time_format: 12h     # 12h or 24h
align: left          # left, center, right
theme: planavista     # planavista, minimal, modern, dark
```

### planavista-weather-card
```yaml
type: custom:planavista-weather-card
entity: sensor.planavista_config
weather_entity: weather.home  # Override weather entity
show_details: true            # Show humidity, wind
show_forecast: false          # Show 5-day forecast
layout: horizontal            # horizontal or vertical
theme: planavista
```

### planavista-toggles-card
```yaml
type: custom:planavista-toggles-card
entity: sensor.planavista_config
show_names: true       # Show calendar names
show_add_button: true  # Show "Add Event" button
layout: horizontal     # horizontal or vertical
theme: planavista
```

### planavista-grid-card
```yaml
type: custom:planavista-grid-card
entity: sensor.planavista_config
view: week             # day, week, month
first_day: monday      # monday or sunday
time_format: 12h       # 12h or 24h
theme: planavista
```

### planavista-agenda-card
```yaml
type: custom:planavista-agenda-card
entity: sensor.planavista_config
max_events: 20          # Maximum events to show
days_ahead: 14          # How many days to look ahead
max_height: 400px       # Scrollable height
show_calendar_name: true  # Show which calendar
show_end_time: true     # Show event end times
time_format: 12h
theme: planavista
```

## Theming

All cards support these built-in themes:

- `planavista` - Colorful gradient header (default)
- `minimal` - Clean, light gray header
- `modern` - Blue-teal gradient
- `dark` - Dark mode

Set the theme in your card config:
```yaml
theme: dark
```

Or use your Home Assistant theme by configuring it in the PlanaVista integration settings.

## Kiosk Mode

For dedicated wall displays, consider using [Kiosk Mode](https://github.com/NemesisRE/kiosk-mode) or URL parameters:

```
http://your-ha:8123/lovelace-planavista/calendar?kiosk
```

This hides the sidebar and header for a cleaner display.

## Tips

1. **Screen Size**: Use the compact layout for tablets under 10"
2. **Brightness**: Consider using the dark theme for always-on displays
3. **Refresh**: Events update every 60 seconds automatically
4. **Calendar Colors**: Configure colors in the PlanaVista integration settings
5. **Fully Kiosk**: If using Fully Kiosk Browser, enable motion detection to wake the screen
