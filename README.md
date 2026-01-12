# PlanaVista

> **A panoramic view of your family's life**

PLEASE NOTE: This integration is currently in TESTING - it probably won't work!

PlanaVista is a beautiful, easy-to-configure Home Assistant integration that brings commercial-quality wall calendar functionality to your smart home. No monthly fees, complete privacy, and endless customization.

## ✨ Features

### Core Functionality
- 🎨 **Beautiful Default Theme** - Stunning out of box, rivals commercial products
- ⚙️ **Zero-Configuration Setup** - Auto-discovers calendars, smart defaults
- 📱 **Fully Responsive** - Perfect on tablets, wall displays, or phones
- 🌈 **Multiple Themes** - PlanaVista, Minimal, Modern, Dark
- 📅 **Multiple Views** - Day, Week, Month, Agenda
- 🎯 **Simple Event Creation** - Quick add or advanced mode
- ☀️ **Integrated Weather** - Shows current and forecast weather
- 🕐 **Flexible Time Display** - 12-hour or 24-hour format

### Technical Excellence
- 🔄 **HACS Integration** - Install and update with one click
- 🎛️ **UI Configuration** - No YAML editing required
- 🔌 **Extensible Architecture** - Ready for future modules (chores, photos, tasks)
- 🚀 **Performance Optimized** - Smooth on any hardware
- 🔐 **Privacy First** - Your data stays local

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

### 4. Add the Card to Your Dashboard

1. Go to your desired dashboard
2. Click **"Edit Dashboard"**
3. Click **"+ Add Card"**
4. Search for **"PlanaVista Card"**
5. The card auto-configures itself!

**That's it!** Your beautiful calendar is ready.

---

## 🎨 Themes

PlanaVista includes four built-in themes:

### PlanaVista (Default)
Beautiful gradient header, clean design, optimized for readability

### Minimal
Simple, clean, minimal design for distraction-free viewing

### Modern
Vibrant gradients, contemporary aesthetic

### Dark
Perfect for OLED displays and dark rooms

**Change Theme**: Settings → Devices & Services → PlanaVista → Configure

---

## 📅 Calendar Views

### Day View
Focus on today's events with hourly breakdown

### Week View (Default)
See the week at a glance, perfect for planning

### Month View
Traditional monthly calendar layout

### Agenda View
Chronological list of upcoming events

**Change View**: Add view selector to dashboard or configure default view in settings

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

### Custom Card Configuration

While PlanaVista auto-configures, you can override settings:

```yaml
type: custom:planavista-calendar-card
entity: sensor.planavista_config
days_visible: 7  # Override day count
show_weather: true
theme: modern  # Override theme
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

### v0.2.0 - Enhanced Calendar
- Full event rendering in card
- Drag-to-create events
- Multi-day event support
- Event editing/deletion

### v0.3.0 - Photo Frame Module
- Slideshow during idle time
- Google Photos integration
- Custom photo folders

### v0.4.0 - Chores & Tasks
- Household task tracking
- Grocy integration
- Completion tracking

### v0.5.0 - Meal Planning
- Weekly meal calendar
- Recipe integration
- Shopping list generation

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

Built with love using:
- Home Assistant
- Modern web technologies
- Community feedback

Inspired by commercial products like Skylight and Hearth, but designed to be better.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/tavenhall1/planavista/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tavenhall1/planavista/discussions)
- **Community**: [Home Assistant Community Forum](https://community.home-assistant.io/)

---

**Made with ❤️ by the Home Assistant community**

*PlanaVista - Your panoramic view of family life*
