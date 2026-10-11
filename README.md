<p align="center">
  <img src="assets/readme-hero.png" alt="PlanaVista" width="100%">
</p>

<h1 align="center">PlanaVista</h1>

<p align="center">
  <strong>A panoramic view of your family's life</strong><br>
  A beautiful, privacy-first wall calendar for Home Assistant that rivals Skylight and Hearth, with no monthly fees.
</p>

<p align="center">
  <a href="https://github.com/tavenhall1/planavista/releases"><img src="https://img.shields.io/github/v/release/tavenhall1/planavista?style=flat-square" alt="Release"></a>
  <a href="https://github.com/tavenhall1/planavista/blob/main/LICENSE"><img src="https://img.shields.io/github/license/tavenhall1/planavista?style=flat-square" alt="License"></a>
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-blue?style=flat-square" alt="HACS"></a>
</p>

---

## Features

- **4 Calendar Views**: Day (per-person columns), Week, Month, and Agenda
- **Deep Google Calendar Integration**: Attendee invitations, in-place PATCH edits, real organizer detection via API
- **Shared Event Awareness**: Multi-participant detection, organizer badges, stripe gradients, participant avatars
- **Full Event Management**: Create, edit, and delete events with optional address suggestions and multi-calendar support
- **Past Event Dimming**: Finished events automatically fade so you can focus on what's next
- **20-Color Palette**: Earth, ocean, warm, and vivid tones for calendar personalization
- **Built-in Onboarding Wizard**: Auto-discovers your calendars, weather, and people entities
- **Day and Night**: Light, Dark, or Automatic (at sunset and sunrise, on a schedule, or with Home Assistant), with three themes that each have a light and a dark version
- **Animated Weather**: 15 custom SVG icons with condition-based gradients and forecasts
- **Per-Person Day View**: Skylight-inspired columns with large person avatars
- **Fits Any Screen**: The card lays itself out for its own size, with the controls along the bottom in portrait and on phones
- **Easy Install via HACS**: No YAML or code required, just point-and-click setup
- **Local by Default**: Your calendar data stays on your network; the only optional lookup is address suggestions, which is off until you turn it on

---

## Quick Start

### 1. Set Up Your Calendars

Make sure you have at least one calendar integration configured:

- **[Google Calendar](https://www.home-assistant.io/integrations/google/)**: Settings > Integrations > Google Calendar
- **Local Calendar**: Settings > Integrations > Local Calendar
- Any integration that creates `calendar.*` entities

### 2. Install PlanaVista

#### HACS (Recommended)

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

#### Manual

1. Download the `custom_components/planavista` folder from this repository
2. Copy it into your Home Assistant `config/custom_components/` directory
3. Restart Home Assistant

### 3. Add the PlanaVista Integration

1. Go to **Settings > Devices & Services**
2. Click **Add Integration**
3. Search for **PlanaVista**
4. Follow the single-step setup (calendars are auto-discovered)

### 4. Add the Card to a Dashboard

1. Open your dashboard and click **Edit**
2. Click **Add Card**
3. Search for **PlanaVista**
4. Save: setup appears on first load

Setup walks you through who lives here, your calendars, and the look. No YAML required.

### 5. Card YAML Options (Optional)

The card works with zero configuration, but you can override settings per-card:

```yaml
type: custom:planavista-card
entity: sensor.planavista_config

# Optional overrides
default_view: week          # day | week | month | agenda
calendars:                  # show only specific calendars
  - calendar.alice
  - calendar.bob
modules: [calendar]         # the modules this card shows, in order
module: calendar            # the module it opens on
theme: minimal              # planavista | minimal | vibrant, or light | dark
hide_weather: false         # hide the weather
hide_header: false          # hide the clock and weather header
weather_entity: weather.home
time_format: 12h            # 12h | 24h
first_day: sunday           # sunday | monday
```

- `planavista-card` is the card's other name, for new dashboards. Cards made as `planavista-calendar-card` keep working.
- `modules` and `module` choose what a card shows and where it starts. Today the calendar is the only module; chores comes next.
- `theme` with a theme's name picks the theme and still follows the household's Light, Dark, or Automatic. `light` or `dark` fixes the card to PlanaVista's light or dark version.
- `hide_header` hides the clock and weather header. The bar with the views and Settings stays.

---

## People, PINs, and Settings

PlanaVista keeps a list of the people in your household. Anyone whose calendar is linked to a Home Assistant person joins the list on their own, and you can add people who don't use Home Assistant, such as young children. Each person has a color, a picture (an initial, an emoji, or their Home Assistant photo), an age group, and can be marked as a parent. In Settings, Calendars shows who each calendar belongs to.

**Settings.** Tap the gear on the calendar. Settings opens straight away for Home Assistant admins and for parents signed in with their own account. Children signed in with their own account don't see the gear.

**Shared family screens.** A wall tablet that the whole family uses should sign in with its own Home Assistant account, one that isn't an admin. On that account, Settings asks for a parent's PIN first. Once a parent has a PIN, mark the tablet's account as a shared family screen in Settings, under PINs and parent mode. A non-admin account is safer on a shared screen because an admin account also opens Home Assistant's own settings, which no PlanaVista PIN can guard. An account that isn't linked to anyone and isn't an admin is treated as a shared screen too.

**PINs and parent mode.** Anyone can have a PIN of 4 to 6 digits. A parent's PIN starts parent mode on that screen: the top of the card shows whose it is, with a countdown and a Lock button. Parent mode ends after two quiet minutes, when the screen sleeps, when the page reloads, or when someone taps Lock. After 5 wrong tries a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes. A parent can clear a pause. PlanaVista keeps PINs only as salted hashes, and never puts them in actions, events, or its logs.

**Forgot every parent's PIN?** Sign in to Home Assistant with a parent's or an admin's own account and set new ones in Settings, under PINs and parent mode.

---

## Appearance

In Settings, Appearance shows Light, Dark, and Automatic as small pictures of the card. Changes show as you tap.

**Automatic** switches between them:

- **At sunset and sunrise**, from Home Assistant's Sun integration, so every screen in the house changes at the same moment.
- **On a schedule**, with a time for light and a time for dark.
- **Matching Home Assistant**: each screen follows its own Home Assistant theme setting. Handy for phones.

Night falls from the top of the screen and day rises from the bottom. A change never happens while someone is touching the screen or has a sheet open, and a screen that was asleep wakes up already changed.

**Themes.** PlanaVista, Minimal, and Vibrant each have a light and a dark version. Dark is designed rather than inverted: people's colors brighten a little, and their events sit on dark tints.

**Customize** sets a light and a dark color for the accent, the background, the header, and the now line. A dark color starts as **Matched**, a dark color PlanaVista picks to go with your light one, until you set it yourself; choosing Matched again goes back. A color that would be hard to read is flagged, with **Fix it** to brighten or darken it just enough. Corners, shadows, the event style, and the avatar border are shared by both versions. **Reset** returns a theme to its original colors and keeps the shape settings.

**Motion** follows the device, or is set to Full or Reduced. Reduced swaps movement for quick fades, which helps on kiosk tablets that hide the system setting.

Coming from 1.1.0: Clean Light and Deep Dark become PlanaVista's light and dark versions, Minimal and Vibrant keep their look in light, and customizations move to the version they were made for.

---

## Automations

`select.planavista_appearance` (Light, Dark, Automatic) lets an automation or a voice assistant change the appearance. For example, Dark when a movie starts:

```yaml
triggers:
  - trigger: state
    entity_id: media_player.living_room_tv
    to: playing
actions:
  - action: select.select_option
    target:
      entity_id: select.planavista_appearance
    data:
      option: dark
```

---

## Layouts

The card lays itself out for its own size, not the device's, so the same card works full screen on a wall tablet, in a dashboard column, or on a phone. In landscape the views and Settings sit in a bar under the clock; in portrait and on phones the bar runs along the bottom, where hands already are, under a big lock-screen clock. Turning a tablet keeps your place.

---

## Calendar Views

### Day View

Per-person columns showing each family member's schedule side-by-side, inspired by Skylight's hero view.

- Large person avatars as column headers
- All-day event banner pills spanning the top
- Timed event blocks with overlap detection
- Now indicator line with auto-scroll to current time
- In portrait, about 14 hours fit on screen at once
- Shared event participant avatars on event blocks
- Next-day footer navigation at the bottom of the time grid
- Past events automatically dimmed

### Week View

A card-based grid showing the full week at a glance.

- Day cards side by side: 4 across in landscape, 2 in portrait, 1 on a phone
- Event chips with multi-participant stripe gradients for shared events
- Weather forecast per day with hi/lo temps and animated icons
- Today's card highlighted with accent border
- Quick "+ Add" button on each day card
- Event count badges
- Past events automatically dimmed

### Month View

Traditional calendar grid for long-range planning.

- 6-week grid with compact event pills
- Each day shows as many events as fit, then "+N more"
- Today indicator circle
- Click any day to jump to its day view
- Compact event chips with stripe support for shared events
- Past events automatically dimmed

### Agenda View

A scrolling list for quickly scanning upcoming events.

- Sticky date headers with relative labels ("Today", "Tomorrow", "In 2 days")
- Weather forecast per day
- Lazy "Load more days" pagination (14 days at a time)
- "+ Add event" button per day
- Past events automatically dimmed

---

## Google Calendar Integration

PlanaVista goes beyond Home Assistant's built-in calendar services to provide deep Google Calendar API integration for families sharing events.

- **Attendee Invitations**: When creating events on multiple calendars, PlanaVista invites attendees via the Google Calendar API so events stay properly linked
- **In-Place Event Editing**: Shared events are updated via PATCH requests, preserving event links and attendee lists (no delete-and-recreate)
- **Real Organizer Detection**: Each event's true organizer is fetched from the Google Calendar API, enabling accurate "who created this?" display
- **Shared Event Deduplication**: When the same event appears on multiple family members' calendars, PlanaVista detects and displays it once with participant indicators
- **Smart Delete**: The organizer sees "Delete Event" (removes for everyone); attendees see "Remove Me" (removes only their copy)
- **Graceful Fallback**: Non-Google calendars (Local Calendar, CalDAV, etc.) work normally using standard Home Assistant services

---

## Managing Events

### Creating Events

1. Click the **+ New** button in the card header (or the "+ Add" button on any day in week/agenda view)
2. Enter a title, select one or more calendars, and pick start/end times
3. Optionally add a location or description. Locations are plain text unless you turn on **Address suggestions** (see below)
4. Click **Add**. For multi-calendar events on Google Calendar, attendees are automatically invited via the API

**Address suggestions** are **off by default**. An admin can turn them on under the card's **Settings > Preferences**. When on, the location text you type (and nothing else) is sent to [Photon](https://photon.komoot.io) (OpenStreetMap data) to suggest addresses. When off, locations are plain text and nothing is sent.

### Editing Events

- Tap any event to open its detail popup, then click **Edit**
- For shared Google Calendar events, edits are applied in-place via PATCH, with no need to delete and recreate
- All fields are editable: title, time, location, description, and calendar
- Guests can be added or removed when editing shared events

### Deleting Events

- From the event detail popup, click **Delete**
- If you're the organizer, the event is deleted for all attendees
- If you're an attendee, you're removed from the event without affecting others

Events sync two-way with your calendar provider (Google Calendar, Local Calendar, etc.).

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

GPL v3. Copyright (c) 2025-2026 Stephen Hall. See [LICENSE](LICENSE).

---

<p align="center">
  <img src="assets/icon-512.png" alt="PlanaVista" width="64"><br>
  <strong>PlanaVista</strong>, your panoramic view of family life<br>
  <sub>Made for the Home Assistant community</sub>
</p>
