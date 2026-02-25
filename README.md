# PlanaVista

> **A panoramic view of your family's life**

PlanaVista is a beautiful, easy-to-configure Home Assistant integration that brings commercial-quality wall calendar functionality to your smart home. Built with LitElement and TypeScript, it delivers smooth performance, responsive design, and a polished UI that rivals Skylight and Hearth — with no monthly fees, complete privacy, and endless customization.

## ✨ Features

### Core Functionality
- [x] 🎨 **Beautiful Default Theme** - Calm premium aesthetic with 4 built-in themes (Light, Dark, Minimal, Vibrant)
- [x] ⚙️ **Zero-Configuration Setup** - Auto-discovers calendars, weather, and people entities
- [x] 📱 **Fully Responsive** - Touch-optimized for tablets, wall displays, and phones
- [x] 📅 **4 Calendar Views** - Day (per-person columns), Week (7-day grid), Month, Agenda
- [x] 🎯 **Event Creation & Management** - Create, edit, and delete events with a polished dialog
- [x] ☀️ **Animated Weather** - Custom SVG weather icons with condition-based gradients
- [x] 🕐 **Flexible Time Display** - 12-hour or 24-hour format
- [x] 👥 **Per-Person Day View** - Skylight-inspired columns with person avatars
- [x] 🔄 **Cross-Card State** - Shared state manager syncs all cards in real-time

### Technical Excellence
- [x] 🔄 **HACS Compatible** - Pre-built bundle, no Node.js required for users
- [x] 🎛️ **UI Configuration** - Full config flow with auto-discovery, no YAML needed
- [x] 🔌 **Modular Architecture** - 5 independent cards you can arrange freely
- [x] 🚀 **LitElement + TypeScript** - Reactive rendering, type-safe, 126KB bundle
- [x] 🔐 **Privacy First** - 100% local, your data never leaves your network

---

## 📦 Installation

### Method 1: HACS (Recommended)

1. **Open HACS** in Home Assistant
2. **Click** "Integrations"
3. **Click** the three dots menu (top right)
4. **Select** "Custom repositories"
5. **Add** this repository URL: `https://github.com/tavenhall1/planavista`
6. **Category**: Integration
7. **Click** "Download"
8. **Restart** Home Assistant

### Method 2: Manual Installation

1. Download the `custom_components/planavista` folder from this repository
2. Copy it to your Home Assistant `custom_components` directory
3. Restart Home Assistant

---

## ⚡ Quick Start

### 1. Add Your Calendars First

Before setting up PlanaVista, make sure you have calendar integrations:

- **Google Calendar**: Settings → Integrations → Add Integration → "Google Calendar"
- **Local Calendar**: Settings → Integrations → Add Integration → "Local Calendar"
- **Other Calendars**: Any calendar integration that creates `calendar.*` entities

### 2. Install PlanaVista

Follow the installation steps above.

### 3. Configure PlanaVista

1. Go to **Settings → Devices & Services**
2. Click **"+ Add Integration"**
3. Search for **"PlanaVista"**
4. Follow the setup wizard:

#### Step 1: Select Calendars
- ✅ Check the calendars you want to display
- You can select as many as you like

#### Step 2: Display Preferences
- **Time Format**: Choose 12-hour (AM/PM) or 24-hour
- **Weather Entity**: Select your weather integration (optional)
- **First Day of Week**: Monday or Sunday
- **Default View**: Day, Week, Month, or Agenda
- **Theme**: PlanaVista, Minimal, Modern, or Dark

#### Step 3: Personalize Each Calendar
For each selected calendar:
- **Display Name**: How it appears (default: calendar name)
- **Color**: Pick a color (smart defaults provided)
- **Icon**: Choose an icon (optional)
- **Link to Person**: Connect to a person entity to show avatar (optional)

### 4. Add Cards to Your Dashboard

PlanaVista provides **modular component cards** that you can arrange however you like:

| Card | Purpose |
|------|---------|
| `planavista-clock-card` | Large time and date display |
| `planavista-weather-card` | Weather conditions and forecast |
| `planavista-toggles-card` | Calendar visibility toggles |
| `planavista-grid-card` | Calendar grid (week/month/day views) |
| `planavista-agenda-card` | Upcoming events list |
#### Recommended Layout (Wall Displays)
1. Go to your dashboard → **Edit** → **Add Card**
2. Add each component card individually
3. Arrange them in the layout that works best for your display

See [examples/dashboards/](examples/dashboards/) for ready-to-use layouts.

**That's it!** Your beautiful calendar is ready.

---

## 🎨 Themes

PlanaVista includes four built-in themes:

### Light (Default)
Warm off-white (#FAFAF8), calm and premium feel with soft shadows

### Dark
Rich dark backgrounds, perfect for OLED displays and dark rooms

### Minimal
Stripped-down, distraction-free viewing with reduced visual noise

### Vibrant
Bold accent colors and higher contrast for a lively look

**Change Theme**: Settings → Devices & Services → PlanaVista → Configure

---

## 📅 Calendar Views

### Day View (Default)
Per-person columns showing each family member's schedule side-by-side. Inspired by Skylight's hero view with person avatars, all-day event banners, and a pulsing now indicator.

### Week View
Google Calendar-style 7-day grid with time gutter, positioned events, overlap detection, and now indicator.

### Month View
Traditional 6-week grid with event pills (max 3 per day), "+N more" overflow, and click-to-navigate.

### Agenda View
Scrolling list grouped by date with sticky headers, relative date labels ("Today", "Tomorrow"), and configurable lookahead.

**Change View**: Use the view switcher in the toggles card, or configure the default view in integration settings.

---

## 🎯 Adding Events

### Quick Add (Simple Mode)
1. Click **"Add Event"** button
2. Enter title, select calendar, choose time
3. Click **"Add"**

### Advanced Mode
1. Click **"Add Event"** button
2. Check **"Show advanced options"**
3. Add description, location, recurrence, reminders
4. Click **"Add"**

### From Your Phone
Events sync two-way with Google Calendar, so add events from anywhere!

---

## ⚙️ Configuration

### Changing Settings

1. **Settings → Devices & Services**
2. Find **"PlanaVista"**
3. Click **"Configure"**
4. Update display preferences

### Adding/Removing Calendars

Currently: Reconfigure the integration
*Future*: Dynamic calendar management in options flow

### Customizing Colors

Each calendar gets a color picker during setup. Colors follow a beautiful default palette but can be customized to your preference.

### Weather Integration

PlanaVista supports any Home Assistant weather integration:
- **Weather.gov** (US)
- **OpenWeatherMap**
- **AccuWeather**
- **Met.no**
- **Any other weather platform**

Just select it during setup!

---

## 🛠️ Advanced Usage

### Card Configuration

Each card accepts configuration options:

```yaml
# Grid card with default day view
type: custom:planavista-grid-card
entity: sensor.planavista_config
view: day

# Agenda card with custom settings
type: custom:planavista-agenda-card
entity: sensor.planavista_config
max_events: 15
days_ahead: 14
max_height: 500px

# Clock card
type: custom:planavista-clock-card
entity: sensor.planavista_config
size: large
show_date: true
```

### Using Services

PlanaVista provides custom services:

#### Add Event
```yaml
service: planavista.add_event
data:
  calendar: "Alice"
  title: "Team Meeting"
  start_date_time: "2024-01-15 14:00:00"
  end_date_time: "2024-01-15 15:00:00"
  description: "Discuss Q1 goals"
```

#### Toggle Calendar Visibility
```yaml
service: planavista.set_calendar_visibility
data:
  calendar: "Alice"
  visible: false
```

#### Refresh Calendars
```yaml
service: planavista.refresh_calendars
```

---

## 🔮 Roadmap

### v1.0.0 - Full Calendar Rewrite ✅
- [x] Complete LitElement + TypeScript rewrite (single 126KB bundle)
- [x] 5 modular cards: clock, weather, toggles, grid, agenda
- [x] 4 calendar views: day (per-person), week, month, agenda
- [x] Event CRUD: create, edit, delete with polished dialog
- [x] 4 themes: light, dark, minimal, vibrant
- [x] Animated SVG weather icons
- [x] Cross-card state management via ReactiveController
- [x] Per-person column day view with avatars
- [x] Touch swipe navigation
- [x] HACS-compatible pre-built bundle

### v1.1.0 - Polish & Enhancements (Planned)
- [ ] Drag-to-create events
- [ ] Multi-day event rendering improvements
- [ ] Recurrence editing support
- [ ] Visual card editors for all cards
- [ ] Accessibility improvements (keyboard navigation, ARIA)

### v1.2.0 - Photo Frame Module
- [ ] Slideshow during idle time
- [ ] Google Photos integration
- [ ] Custom photo folders

### v1.3.0 - Chores & Tasks
- [ ] Household task tracking
- [ ] Grocy integration
- [ ] Completion tracking

---

## 📱 Recommended Hardware

### Budget Option (~$150)
- Amazon Fire HD 10 Tablet
- Wall mount or stand
- Fully Kiosk Browser app

### Premium Option (~$400)
- HP Engage 15" Touchscreen Monitor
- Mini PC (Intel NUC or similar)
- Built-in webcam, speaker, microphone

### DIY Option (~$100)
- Raspberry Pi 4
- Official 7" touchscreen
- 3D printed case

---

## 🆚 PlanaVista vs Commercial Solutions

| Feature | PlanaVista | Skylight | Hearth |
|---------|-----------|----------|--------|
| **One-time Cost** | Free | $150-300 | $200-350 |
| **Monthly Fee** | $0 | $0-$5 | $0-$10 |
| **Privacy** | 100% Local | Cloud | Cloud |
| **Customization** | Unlimited | Limited | Limited |
| **Calendar Sync** | Google, Local, Any | Limited | Limited |
| **Smart Home Integration** | Full | None | None |
| **Updates** | Forever | Depends | Depends |
| **Extensibility** | Modular | No | No |

---

## 🤝 Contributing

PlanaVista is open source and welcomes contributions!

### Areas We Need Help
- 🎨 Theme design
- 🌍 Translations
- 🐛 Bug reports
- 💡 Feature ideas
- 📝 Documentation

### Development Setup
See [CLAUDE.md](CLAUDE.md) for architecture details and development guidelines.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Credits

Built with:
- [Home Assistant](https://www.home-assistant.io/) - The foundation
- [Lit](https://lit.dev/) - Web component framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Rollup](https://rollupjs.org/) - Module bundler
- Weather icons inspired by [Meteocons](https://bas.dev/work/meteocons) by Bas Milius (MIT)

Inspired by commercial products like Skylight and Hearth, but open source, private, and extensible.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/tavenhall1/planavista/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tavenhall1/planavista/discussions)
- **Community**: [Home Assistant Community Forum](https://community.home-assistant.io/)

---

**Made with ❤️ by the Home Assistant community**

*PlanaVista - Your panoramic view of family life*
