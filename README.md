<p align="center">
  <img src="assets/PlanaVista-readme-hero-v1.png" alt="PlanaVista" width="100%">
</p>

<h1 align="center">PlanaVista</h1>

<p align="center">
  <strong>A panoramic view of your family's life</strong><br>
  A beautiful, privacy-first wall calendar for Home Assistant that rivals Skylight and Hearth — with no monthly fees.
</p>

<p align="center">
  <a href="https://github.com/tavenhall1/planavista/releases"><img src="https://img.shields.io/github/v/release/tavenhall1/planavista?style=flat-square" alt="Release"></a>
  <a href="https://github.com/tavenhall1/planavista/blob/main/LICENSE"><img src="https://img.shields.io/github/license/tavenhall1/planavista?style=flat-square" alt="License"></a>
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-blue?style=flat-square" alt="HACS"></a>
</p>

---

## Features

- **4 Calendar Views** — Day (per-person columns), Week, Month, Agenda
- **Built-in Onboarding Wizard** — Auto-discovers your calendars, weather, and people entities
- **Theme Customizer** — 4 base themes + accent color, background, header gradient, corners, and shadows
- **Event Management** — Create, edit, and delete events with location autocomplete
- **Animated Weather** — Custom SVG icons with condition-based gradients
- **Per-Person Day View** — Skylight-inspired columns with person avatars
- **Fully Responsive** — Optimized for phones, tablets, wall displays, and large screens
- **Drag-to-Reorder** — Arrange calendar order in settings
- **100% Local** — Your data never leaves your network

---

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Integrations** (not Frontend)
3. Click the **three-dot menu** (top right) and select **Custom repositories**
4. Add this repository URL:
   ```
   https://github.com/tavenhall1/planavista
   ```
5. Set category to **Integration** and click **Add**
6. Search for **PlanaVista** and click **Download**
7. **Restart Home Assistant**

### Manual

1. Download the `custom_components/planavista` folder from this repository
2. Copy it into your Home Assistant `config/custom_components/` directory
3. Restart Home Assistant

---

## Quick Start

### 1. Set Up Your Calendars

Make sure you have at least one calendar integration configured:

- **Google Calendar** — Settings > Integrations > Google Calendar
- **Local Calendar** — Settings > Integrations > Local Calendar
- Any integration that creates `calendar.*` entities

### 2. Add the PlanaVista Integration

1. Go to **Settings > Devices & Services**
2. Click **Add Integration**
3. Search for **PlanaVista**
4. Follow the single-step setup (calendars are auto-discovered)

### 3. Add the Card to a Dashboard

1. Open your dashboard and click **Edit**
2. Click **Add Card**
3. Search for **PlanaVista**
4. Save — the onboarding wizard will appear on first load

The wizard walks you through preferences, calendar personalization (name, color, avatar), and theme selection.

### 4. Card YAML Options

The card works with zero configuration, but you can override settings per-card:

```yaml
type: custom:planavista-calendar-card
entity: sensor.planavista_config

# Optional overrides
default_view: week          # day | week | month | agenda
calendars:                  # show only specific calendars
  - calendar.alice
  - calendar.bob
hide_weather: false         # hide the weather widget
hide_header: false          # hide the entire header bar
weather_entity: weather.home
time_format: 12h            # 12h | 24h
first_day: sunday           # sunday | monday
```

---

## Calendar Views

### Day
Per-person columns showing each family member's schedule side-by-side. Inspired by Skylight's hero view with person avatars, all-day event banners, and a now indicator.

### Week
7-day grid with time gutter, positioned event blocks, overlap detection, and now indicator.

### Month
Traditional 6-week grid with event pills, "+N more" overflow, and click-to-navigate to day view.

### Agenda
Scrolling list grouped by date with sticky headers and relative labels ("Today", "Tomorrow").

---

## Themes

PlanaVista ships with four built-in themes: **Light**, **Dark**, **Minimal**, and **Vibrant**.

On top of any base theme, you can customize:

| Setting | Options |
|---------|---------|
| **Accent Color** | Any color from the 10-swatch palette or custom picker |
| **Background** | Base default or custom hex color |
| **Header Style** | Purple, Teal, Sunset, Solid Accent, Solid Dark, or custom color |
| **Corners** | Sharp (4px), Rounded (12px), Pill (20px) |
| **Shadows** | None, Subtle, Bold |

Open the gear icon on the card header to access the settings panel and theme customizer. Changes preview live on the calendar behind the panel.

---

## Adding Events

1. Click the **+ New** button in the card header
2. Enter a title, select a calendar, pick a start/end time
3. Optionally add a location (autocomplete via OpenStreetMap) or description
4. Click **Add**

Events sync two-way with your calendar provider (Google Calendar, etc.).

---

## Recommended Hardware

| Setup | Cost | Notes |
|-------|------|-------|
| Amazon Fire HD 10 + wall mount | ~$150 | Budget option, use Fully Kiosk Browser |
| Raspberry Pi 4 + 7" touchscreen | ~$100 | DIY option, 3D-printed case |
| 15" touchscreen monitor + mini PC | ~$400 | Premium option with webcam and speaker |

---

## PlanaVista vs Commercial Solutions

| | PlanaVista | Skylight | Hearth |
|---|-----------|----------|--------|
| **Cost** | Free | $150-300 | $200-350 |
| **Monthly Fee** | $0 | $0-5 | $0-10 |
| **Privacy** | 100% local | Cloud | Cloud |
| **Customization** | Full | Limited | Limited |
| **Calendar Sources** | Google, Local, any HA integration | Limited | Limited |
| **Smart Home** | Full HA integration | None | None |
| **Updates** | Forever, open source | Vendor dependent | Vendor dependent |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License — Copyright (c) 2025-2026 Stephen Hall. See [LICENSE](LICENSE).

---

<p align="center">
  <img src="assets/Planavista-icon-512.jpg" alt="PlanaVista" width="64"><br>
  <strong>PlanaVista</strong> — Your panoramic view of family life<br>
  <sub>Made for the Home Assistant community</sub>
</p>
