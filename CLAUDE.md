# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**PlanaVista** is a professional Home Assistant custom integration that provides beautiful, easy-to-configure wall calendar functionality rivaling commercial products like Skylight and Hearth.

**Project Type**: Home Assistant Custom Integration
**Language**: Python 3.11+ (backend), TypeScript + LitElement (frontend)
**Key Technologies**: Home Assistant, DataUpdateCoordinator, ConfigFlow, Lit 3.x, Rollup, Custom Lovelace Cards

## Repository Structure

```
planavista/
├── custom_components/planavista/       # The integration (Python backend)
│   ├── __init__.py                    # Integration setup, coordinator, frontend registration
│   ├── manifest.json                  # Integration metadata (v1.0.0)
│   ├── const.py                       # Constants, defaults
│   ├── config_flow.py                 # Setup wizard (ConfigFlow)
│   ├── sensor.py                      # Sensor entities
│   ├── services.yaml                  # Custom services definition
│   ├── strings.json                   # UI text for config flow
│   ├── translations/
│   │   └── en.json                    # English translations
│   └── frontend/                      # TypeScript/LitElement frontend
│       ├── package.json               # Node dependencies (lit, rollup, typescript)
│       ├── rollup.config.mjs          # Bundle config → dist/planavista-cards.js
│       ├── tsconfig.json              # TypeScript config (ES2021, decorators)
│       ├── dist/
│       │   └── planavista-cards.js     # Production bundle (126KB, committed for HACS)
│       └── src/
│           ├── main.ts                # Entry point, registers all cards
│           ├── types.ts               # All TypeScript interfaces
│           ├── cards/                  # 5 Lovelace card components
│           │   ├── planavista-grid-card.ts      # Main calendar (composes views)
│           │   ├── planavista-clock-card.ts      # Clock display
│           │   ├── planavista-weather-card.ts    # Weather with SVG icons
│           │   ├── planavista-toggles-card.ts    # Calendar toggles + view switcher
│           │   └── planavista-agenda-card.ts     # Standalone agenda list
│           ├── components/            # View components and dialogs
│           │   ├── view-day.ts        # Per-person column day view
│           │   ├── view-week.ts       # 7-day grid view
│           │   ├── view-month.ts      # Month grid view
│           │   ├── view-agenda.ts     # Scrolling agenda list
│           │   ├── event-create-dialog.ts  # Create/edit event dialog
│           │   └── event-popup.ts     # Event detail popup
│           ├── state/
│           │   └── state-manager.ts   # Singleton state + ReactiveController
│           ├── styles/
│           │   ├── themes.ts          # 4 themes (light, dark, minimal, vibrant)
│           │   └── shared.ts          # Base CSS, typography, buttons, animations
│           └── utils/
│               ├── date-utils.ts      # Date math, formatting, navigation
│               ├── event-utils.ts     # Event grouping, positioning, filtering
│               ├── ha-utils.ts        # HA service wrappers (CRUD)
│               └── weather-icons.ts   # 15 animated SVG weather icons
├── examples/dashboards/               # Ready-to-use dashboard YAMLs
├── docs/plans/                        # Design docs and implementation plans
├── README.md                          # User documentation
├── LICENSE                            # MIT License
├── hacs.json                          # HACS integration metadata
└── CLAUDE.md                          # This file
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

#### 4. Frontend (`frontend/src/`)

**Purpose**: LitElement/TypeScript cards and views for the Lovelace dashboard

**Architecture**: Single Rollup bundle (`dist/planavista-cards.js`, 126KB) registered via `__init__.py`

**5 Lovelace Cards** (registered in `main.ts`):
- `planavista-grid-card` - Main calendar card, composes all 4 views + dialogs
- `planavista-clock-card` - Real-time clock with configurable size and format
- `planavista-weather-card` - Animated SVG weather icons with condition gradients
- `planavista-toggles-card` - Calendar visibility toggles, view switcher, "New Event" button
- `planavista-agenda-card` - Standalone scrolling agenda list

**4 View Components** (`components/`):
- `view-day.ts` - Per-person column layout (hero view), all-day banners, now indicator
- `view-week.ts` - 7-day grid with time gutter, overlap detection
- `view-month.ts` - 42-cell grid, event pills, "+N more" overflow
- `view-agenda.ts` - Grouped by date with sticky headers, relative labels

**State Management** (`state/state-manager.ts`):
- `PlanaVistaStateManager` - Private singleton managing shared state (hidden calendars, current view, selected date, dialog state)
- `PlanaVistaController` - Public ReactiveController that cards use to subscribe to state changes
- Auto-advance timer (midnight date rollover)
- Async event CRUD (create → `calendar.create_event`, delete → `calendar.delete_event`, edit → delete + recreate)

**Styling** (`styles/`):
- `themes.ts` - 4 themes (light, dark, minimal, vibrant) as CSS custom properties
- `shared.ts` - Base styles, typography, buttons, event chips, animations, scrollbars

**Build**: `cd frontend && npm run build` (requires Node.js, only for development)

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

#### Frontend (TypeScript/LitElement) Changes

1. Edit source files in `custom_components/planavista/frontend/src/`
2. Build: `cd custom_components/planavista/frontend && npm run build`
3. **Clear browser cache** (Ctrl+Shift+R)
4. **Reload dashboard** (F5)
5. Check browser console for errors

**Dev watch mode**: `npm run dev` (rebuilds on file changes, includes sourcemaps)
**No HA restart needed** for frontend changes — just rebuild and hard-refresh.

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

### TypeScript/Frontend
- **TypeScript** with strict mode, `experimentalDecorators: true`, `useDefineForClassFields: false`
- **LitElement** base class for all cards and components
- **Lit decorators**: `@customElement`, `@property`, `@state`
- **ReactiveController** for shared state (not global events)
- **Shadow DOM** for style isolation
- **camelCase** for variables, **PascalCase** for classes
- **`pv-`** prefix for internal component tag names (e.g., `pv-view-day`)

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

### v1.0.0 - Full Calendar Rewrite ✅
- [x] LitElement + TypeScript rewrite (single 126KB bundle)
- [x] 5 modular cards, 4 calendar views, event CRUD
- [x] Per-person day view, animated weather icons, 4 themes
- [x] Cross-card state management, touch swipe navigation

### v1.1.0 - Polish & Enhancements (Planned)
- [ ] Drag-to-create events
- [ ] Multi-day event rendering improvements
- [ ] Visual card editors for all cards
- [ ] Accessibility (keyboard nav, ARIA)

### v1.2.0 - Photo Frame Module
- [ ] Slideshow during idle
- [ ] Google Photos integration
- [ ] Local folder support

### v1.3.0 - Chores & Tasks
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
