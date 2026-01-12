# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**PlanaVista** is a professional Home Assistant custom integration that provides beautiful, easy-to-configure wall calendar functionality rivaling commercial products like Skylight and Hearth.

**Project Type**: Home Assistant Custom Integration
**Language**: Python 3.11+, JavaScript (frontend)
**Key Technologies**: Home Assistant, DataUpdateCoordinator, ConfigFlow, Custom Lovelace Cards

## Repository Structure

```
planavista-calendar/
├── custom_components/planavista/    # The integration
│   ├── __init__.py                 # Integration setup, coordinator
│   ├── manifest.json               # Integration metadata
│   ├── const.py                    # Constants, defaults
│   ├── config_flow.py              # Setup wizard (ConfigFlow)
│   ├── sensor.py                   # Sensor entities
│   ├── services.yaml               # Custom services definition
│   ├── strings.json                # UI text for config flow
│   ├── translations/
│   │   └── en.json                 # English translations
│   └── frontend/
│       └── planavista-calendar-card.js  # Custom Lovelace card
├── assets/                         # Documentation images
├── README.md                       # User documentation
├── LICENSE                         # MIT License
├── hacs.json                       # HACS integration metadata
└── CLAUDE.md                       # This file
```

## Architecture Overview

### Core Components

#### 1. Integration Setup (`__init__.py`)

**Purpose**: Entry point for the integration

**Key Classes**:
- `PlanaVistaCoordinator(DataUpdateCoordinator)` - Manages data fetching from calendar entities

**Responsibilities**:
- Register platforms (sensors)
- Set up coordinator with 60-second update interval
- Handle config entry lifecycle (setup, unload, reload)
- Fetch calendar data from configured entities

**Important**: All coordinator code runs async. Use `async_` prefix for methods.

#### 2. Configuration Flow (`config_flow.py`)

**Purpose**: Multi-step UI wizard for setup

**Flow Steps**:
1. **user** - Select calendars to display (auto-discovered)
2. **display** - Time format, weather entity, view preferences, theme
3. **calendars** - Personalize each calendar (name, color, icon, person link)

**Options Flow**: Allows reconfiguration after initial setup (currently display settings only)

**Key Functions**:
- `_discover_calendar_entities()` - Auto-find `calendar.*` entities
- `_discover_weather_entities()` - Auto-find `weather.*` entities
- `_discover_person_entities()` - Auto-find `person.*` entities
- `_get_friendly_name()` - Get display name from entity

**Important**: Use `selector` for form inputs (provides better UI than raw vol.Schema)

#### 3. Sensors (`sensor.py`)

**Purpose**: Expose integration data as sensor entities

**Entities Created**:
- `sensor.planavista_config` - Exposes full configuration (calendars, display settings)
- `sensor.planavista_upcoming_events` - Count and list of upcoming events

**Data Flow**: Coordinator → Sensor → Attributes → Lovelace Card

#### 4. Frontend Card (`frontend/planavista-calendar-card.js`)

**Purpose**: Custom Lovelace card for calendar display

**Current State**: Placeholder implementation (shows header, controls, calendar placeholder)

**Needs Implementation**:
- Full calendar event rendering
- Integration with calendar entities
- Event creation dialog
- Drag-to-create events
- Event editing/deletion
- Responsive day count based on view

**Styling**: Uses web components with shadow DOM, inline styles for theming

## Configuration Storage

Configuration is stored in Home Assistant's `.storage/core.config_entries`:

```json
{
  "calendars": [
    {
      "entity_id": "calendar.alice_gmail_com",
      "display_name": "Alice",
      "color": "#fb8072",
      "icon": "mdi:account",
      "person_entity": "person.alice",
      "visible": true
    }
  ],
  "display": {
    "time_format": "12h",
    "weather_entity": "weather.home",
    "first_day": "monday",
    "default_view": "week",
    "theme": "planavista"
  }
}
```

## Development Workflow

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/planavista-calendar
   cd planavista-calendar
   ```

2. **Create a development Home Assistant instance** (recommended)
   ```bash
   # Use a container for isolated testing
   docker run -d -p 8123:8123 \
     -v $(pwd)/custom_components:/config/custom_components \
     homeassistant/home-assistant:latest
   ```

3. **Or symlink to existing HA installation**
   ```bash
   ln -s $(pwd)/custom_components/planavista \
     /path/to/homeassistant/custom_components/planavista
   ```

### Making Changes

#### Backend (Python) Changes

1. Edit files in `custom_components/planavista/`
2. **Restart Home Assistant** (required for Python changes)
3. Check logs: Settings → System → Logs (filter by "planavista")
4. Test in UI

**Common Files to Edit**:
- `const.py` - Add constants, default colors, view types
- `config_flow.py` - Modify setup wizard steps
- `sensor.py` - Add new sensor entities
- `__init__.py` - Modify data coordinator logic

#### Frontend (JavaScript) Changes

1. Edit `custom_components/planavista/frontend/planavista-calendar-card.js`
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Reload dashboard** (F5)
4. Check browser console for errors

**No HA restart needed** for frontend changes!

#### Translation Changes

1. Edit `strings.json` and `translations/en.json`
2. Restart Home Assistant
3. Test config flow to see changes

### Testing Configuration Flow

1. **Remove integration**: Settings → Integrations → PlanaVista → Delete
2. **Re-add**: Settings → Integrations → Add Integration → PlanaVista
3. **Walk through wizard** with various inputs
4. **Verify config saved**: Developer Tools → States → `sensor.planavista_config`

### Debugging

#### Backend Issues
```bash
# Check Home Assistant logs
Settings → System → Logs
Filter: "planavista"

# Or via CLI
docker logs homeassistant | grep planavista
```

#### Frontend Issues
```javascript
// Open browser console (F12)
// Look for errors in:
Console → Filter by "planavista"

// Check entity state
Developer Tools → States → sensor.planavista_config
```

#### Configuration Issues
```bash
# Check config entry
Developer Tools → States → sensor.planavista_config
# Look at attributes.calendars and attributes.display
```

## Key Design Patterns

### 1. DataUpdateCoordinator Pattern

**Why**: Centralized data fetching, prevents redundant API calls

**Implementation**:
```python
class PlanaVistaCoordinator(DataUpdateCoordinator):
    async def _async_update_data(self):
        # Fetch from all configured calendar entities
        # Return unified data structure
        return {"calendars": [...], "events": [...]}
```

**Used by**: All sensor entities subscribe to coordinator updates

### 2. Config Flow Multi-Step

**Why**: Complex configuration broken into digestible steps

**Pattern**:
```python
async def async_step_user(self, user_input):
    # Validate input
    # Save to self._data
    # Return next step or create_entry
    return await self.async_step_next()
```

### 3. Entity Attributes for Complex Data

**Why**: Sensors can only have simple state, but attributes hold rich data

**Pattern**:
```python
@property
def state(self):
    return "configured"  # Simple state

@property
def extra_state_attributes(self):
    return {
        "calendars": [...],  # Rich nested data
        "display": {...}
    }
```

## Extension System (Future)

PlanaVista is designed for modular extensions:

```python
# Future: custom_components/planavista/modules/chores.py
class ChoresModule(PlanaVistaModule):
    """Chores tracking module."""

    def get_entities(self):
        """Return entities this module creates."""
        return [ChoresSensor(...), ChoreSwitch(...)]

    def get_card_section(self):
        """Return card UI component data."""
        return {"type": "chores", "data": {...}}

    def get_services(self):
        """Return custom services."""
        return {
            "add_chore": self._async_add_chore,
            "complete_chore": self._async_complete_chore,
        }
```

**Modules Register Themselves**: `__init__.py` discovers and loads modules automatically

## Code Style & Conventions

### Python
- **PEP 8** compliant
- **Type hints** for all function signatures
- **Async** for all I/O operations
- **Logging** using `_LOGGER.debug/info/warning/error`
- **Constants** in `const.py`, uppercase with type hints

### JavaScript
- **ES6+** syntax
- **Web Components** for cards
- **Shadow DOM** for style isolation
- **camelCase** for variables
- **PascalCase** for classes

### Naming Conventions
- **Entities**: `sensor.planavista_*`
- **Services**: `planavista.*`
- **Classes**: `PlanaVista*` prefix
- **Files**: lowercase with underscores

## Testing Guidelines

### Manual Testing Checklist

**Configuration Flow**:
- [ ] Can discover calendars
- [ ] Can select multiple calendars
- [ ] Can configure display settings
- [ ] Can personalize each calendar
- [ ] Configuration persists after restart
- [ ] Options flow updates settings

**Sensor Entities**:
- [ ] `sensor.planavista_config` created
- [ ] Attributes contain correct data
- [ ] `sensor.planavista_upcoming_events` shows count

**Frontend Card**:
- [ ] Card loads without errors
- [ ] Shows current time/date
- [ ] Shows weather (if configured)
- [ ] Calendar toggles respond to clicks
- [ ] Themes apply correctly
- [ ] Responsive on mobile/tablet/desktop

### Future: Automated Testing

```python
# tests/test_config_flow.py
async def test_user_step_discovers_calendars(hass):
    """Test calendar discovery in user step."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] == "form"
    assert result["step_id"] == "user"
```

## Common Issues & Solutions

### Issue: Integration doesn't appear in Add Integration
**Cause**: manifest.json invalid or missing
**Fix**: Validate JSON syntax, restart HA

### Issue: Config flow crashes
**Cause**: Missing selector import or invalid schema
**Fix**: Check logs for traceback, verify voluptuous schema

### Issue: Card shows "Entity not found"
**Cause**: Sensor not created or wrong entity ID
**Fix**: Check Developer Tools → States for `sensor.planavista_config`

### Issue: Changes not appearing
**Cause**: Cache or incomplete restart
**Fix**:
- Backend: Full HA restart
- Frontend: Hard refresh (Ctrl+Shift+R)

### Issue: Colors not applying
**Cause**: CSS variable format incorrect
**Fix**: Ensure colors are hex format (#RRGGBB)

## Release Process

### Version Numbering
- **v0.x.x** - Beta releases
- **v1.0.0** - First stable release
- **Semantic versioning**: MAJOR.MINOR.PATCH

### Creating a Release

1. **Update version** in `manifest.json` and `const.py`
2. **Update CHANGELOG.md** with changes
3. **Test thoroughly** on multiple HA versions
4. **Create git tag**: `git tag v0.1.0`
5. **Push tag**: `git push origin v0.1.0`
6. **Create GitHub release** with notes
7. **Update HACS** (if registered)

## Contributing Guidelines

### For New Contributors

1. **Fork** the repository
2. **Create branch**: `feature/your-feature-name`
3. **Make changes** following code style
4. **Test locally** following testing checklist
5. **Commit** with clear messages
6. **Open PR** with description of changes

### PR Requirements
- [ ] Code follows style guidelines
- [ ] Changes tested in local HA instance
- [ ] No breaking changes (or documented)
- [ ] Screenshots for UI changes
- [ ] Updated documentation if needed

## Roadmap

### v0.1.0 - Initial Release ✅
- [x] Basic integration structure
- [x] Config flow with auto-discovery
- [x] Sensor entities
- [x] Basic frontend card
- [x] Documentation

### v0.2.0 - Full Calendar Rendering
- [ ] Render actual events from calendars
- [ ] Week/day/month/agenda views
- [ ] Event styling with calendar colors
- [ ] Responsive day count

### v0.3.0 - Event Management
- [ ] Add event dialog (simple & advanced)
- [ ] Edit existing events
- [ ] Delete events
- [ ] Drag-to-create events

### v0.4.0 - Photo Frame Module
- [ ] Slideshow during idle
- [ ] Google Photos integration
- [ ] Local folder support

### v0.5.0 - Chores & Tasks
- [ ] Chore tracking
- [ ] Task lists
- [ ] Grocy integration

## Resources

- [Home Assistant Developer Docs](https://developers.home-assistant.io/)
- [Integration Manifest](https://developers.home-assistant.io/docs/creating_integration_manifest)
- [Config Flow](https://developers.home-assistant.io/docs/config_entries_config_flow_handler)
- [DataUpdateCoordinator](https://developers.home-assistant.io/docs/integration_fetching_data)
- [Creating Entities](https://developers.home-assistant.io/docs/core/entity)

## Support

- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/planavista-calendar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR-USERNAME/planavista-calendar/discussions)
- **Community Forum**: [Home Assistant Community](https://community.home-assistant.io/)

---

**Built with ❤️ for the Home Assistant community**
