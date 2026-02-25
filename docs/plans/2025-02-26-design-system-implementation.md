# PlanaVista Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the PlanaVista Design System (DESIGN_SYSTEM.md) across the entire frontend — new color palette, event block restyling, gridline removal, lane containment, shared events, responsive breakpoints, onboarding wizard, settings panel, and design review gate.

**Architecture:** Phased rollout across 8 phases. Each phase is independently deployable and testable. Backend changes (config flow, color constants) land first, then frontend visual changes, then new components (wizard, settings), then responsive, then the review gate.

**Tech Stack:** Python 3.11+ (HA backend), TypeScript + LitElement/Lit 3.x (frontend), Rollup (bundler), CSS custom properties (theming)

---

## Phase 1: Color Palette — Backend + Constants

Update the backend color system to support the new 10-preset palette with primary/light pairs.

### Task 1.1: Update Color Constants

**Files:**
- Modify: `custom_components/planavista/const.py` (lines 40-52)

**Step 1: Replace DEFAULT_COLORS with COLOR_PRESETS**

Replace the flat color list with a structured palette:

```python
# Replace lines 40-52 in const.py
COLOR_PRESETS: Final = [
    {"name": "Ocean",    "color": "#4A90D9", "color_light": "#DCE8F5"},
    {"name": "Fire",     "color": "#FC6A05", "color_light": "#FEE6D1"},
    {"name": "Sage",     "color": "#6BA368", "color_light": "#E2F0E1"},
    {"name": "Lavender", "color": "#9B8EC4", "color_light": "#EDEBF5"},
    {"name": "Amber",    "color": "#D9A52B", "color_light": "#F7EDCF"},
    {"name": "Honey",    "color": "#CDCB2E", "color_light": "#F3F3DA"},
    {"name": "Rose",     "color": "#D4728C", "color_light": "#F5E4EA"},
    {"name": "Teal",     "color": "#4A9E9E", "color_light": "#DDF0F0"},
    {"name": "Slate",    "color": "#6B7A8D", "color_light": "#E8EAED"},
    {"name": "Graphite", "color": "#505050", "color_light": "#E8E8E8"},
]

# Keep backward-compatible flat list for config flow color picker
DEFAULT_COLORS: Final = [p["color"] for p in COLOR_PRESETS]
DEFAULT_COLORS_LIGHT: Final = [p["color_light"] for p in COLOR_PRESETS]

# Add new config key
CONF_COLOR_LIGHT: Final = "color_light"
```

**Step 2: Verify const.py imports still work**

Run: `cd custom_components/planavista/frontend && npx rollup -c` (build should still succeed since const.py is backend-only)

**Step 3: Commit**

```bash
git add custom_components/planavista/const.py
git commit -m "feat: add 10 curated color presets with primary/light pairs"
```

---

### Task 1.2: Update Config Flow — Store color_light

**Files:**
- Modify: `custom_components/planavista/config_flow.py` (lines 265-331 for calendar step, lines 429-503 for add_calendar)

**Step 1: Update calendar config to include color_light**

In `async_step_calendars()` (around line 272), after getting the color, look up the light variant:

```python
# In async_step_calendars(), after line 275
color_hex = _rgb_to_hex(user_input[CONF_COLOR])
color_light = _get_color_light(color_hex)

# Update the calendar config dict (line 272-279)
self._calendar_configs.append({
    "entity_id": calendar_entity,
    CONF_DISPLAY_NAME: user_input[CONF_DISPLAY_NAME],
    CONF_COLOR: color_hex,
    CONF_COLOR_LIGHT: color_light,
    CONF_ICON: user_input.get(CONF_ICON, "mdi:calendar"),
    CONF_PERSON_ENTITY: user_input.get(CONF_PERSON_ENTITY, ""),
    CONF_VISIBLE: True,
})
```

Add the import for CONF_COLOR_LIGHT at the top, and add helper function:

```python
def _get_color_light(color_hex: str) -> str:
    """Get the light variant for a color.

    Checks curated presets first, falls back to computed 12% tint.
    """
    for preset in COLOR_PRESETS:
        if preset["color"].lower() == color_hex.lower():
            return preset["color_light"]
    # Custom color: compute light variant (12% mix with white)
    return _compute_light_variant(color_hex, 0.12)

def _compute_light_variant(hex_color: str, ratio: float) -> str:
    """Compute a light tint of a color by mixing with white."""
    rgb = _hex_to_rgb(hex_color)
    light = [int(c + (255 - c) * (1 - ratio)) for c in rgb]
    return f"#{light[0]:02x}{light[1]:02x}{light[2]:02x}"
```

**Step 2: Apply same change to async_step_add_calendar() and async_step_edit_calendar_details()**

Same pattern — after getting color, compute color_light and include in the saved config.

**Step 3: Commit**

```bash
git add custom_components/planavista/config_flow.py
git commit -m "feat: store color_light in calendar config (preset lookup + computed fallback)"
```

---

### Task 1.3: Update Coordinator — Pass color_light to Frontend

**Files:**
- Modify: `custom_components/planavista/__init__.py` (lines 128-197, _async_update_data)

**Step 1: Include color_light in calendar data sent to sensor**

In the coordinator's `_async_update_data()`, ensure `color_light` is included in each calendar's data. Find where calendar configs are built (around line 155-170) and add:

```python
"color_light": cal_config.get("color_light", ""),
```

**Step 2: Commit**

```bash
git add custom_components/planavista/__init__.py
git commit -m "feat: pass color_light through coordinator to sensor attributes"
```

---

### Task 1.4: Update Frontend Types

**Files:**
- Modify: `custom_components/planavista/frontend/src/types.ts` (lines 56-65, CalendarConfig; lines 67-78, CalendarEvent)

**Step 1: Add color_light to CalendarConfig and CalendarEvent**

```typescript
// CalendarConfig — add after color field (line 59)
color_light: string;

// CalendarEvent — add after calendar_color (line 77)
calendar_color_light: string;
```

**Step 2: Build to verify types compile**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds (may have warnings about unused fields, which is fine)

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/types.ts
git commit -m "feat: add color_light to CalendarConfig and CalendarEvent types"
```

---

## Phase 2: Event Block Restyling

Update event blocks across all views to use the new primary/light color system and remove gridlines.

### Task 2.1: Update Shared Event Styles

**Files:**
- Modify: `custom_components/planavista/frontend/src/styles/shared.ts` (lines 157-209, eventStyles)

**Step 1: Update .pv-event to use --event-color-light**

```css
/* Replace existing .pv-event styles (lines 158-167) */
.pv-event {
  padding: 6px 10px;
  border-radius: 4px;
  border-left: 3px solid var(--event-color, var(--pv-accent));
  background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
  cursor: pointer;
  transition: all var(--pv-transition, 200ms ease);
}

.pv-event:hover {
  background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 16%, white);
  transform: translateY(-1px);
}

.pv-event:active {
  transform: scale(0.98);
}

.pv-event-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--pv-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pv-event-time {
  font-size: 0.8125rem;
  color: var(--pv-text-secondary);
}
```

Key changes:
- Background uses `--event-color-light` with `color-mix` fallback
- Text uses `--pv-text` (dark) instead of white
- Border radius: 4px (was rounding inherited from pv-radius-sm)
- No box-shadow, no outer border

**Step 2: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/styles/shared.ts
git commit -m "feat: restyle event blocks — light background, dark text, 3px accent border"
```

---

### Task 2.2: Update Day View — Event Blocks + Gridlines

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts`

**Step 1: Update positioned-event styling (around line 224)**

Replace the current `.positioned-event` CSS with:

```css
.positioned-event {
  position: absolute;
  left: 3px;
  right: 3px;
  padding: 6px 10px;
  border-radius: 4px;
  border-left: 3px solid var(--event-color);
  background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: all 200ms ease;
}

.positioned-event:hover {
  background: color-mix(in srgb, var(--event-color) 16%, white);
  transform: translateY(-1px);
  z-index: 2;
}

.event-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--pv-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-time {
  font-size: 0.8125rem;
  color: var(--pv-text-secondary);
}
```

**Step 2: Remove gridlines, add alternating hour tint**

Replace `.hour-line` CSS (around line 214):

```css
.hour-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: transparent; /* No visible gridline */
}

.hour-band-odd {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.015);
  pointer-events: none;
}
```

Update `_renderHourLines()` to emit alternating bands:

```typescript
private _renderHourLines() {
  const lines = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
    const top = ((h - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
    const bandHeight = (1 / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
    // Alternating subtle tint on odd hours
    if (h % 2 === 1 && h < DAY_END_HOUR) {
      lines.push(html`<div class="hour-band-odd" style="top: ${top}%; height: ${bandHeight}%"></div>`);
    }
  }
  return lines;
}
```

**Step 3: Replace column borders with gaps**

Replace `.person-column` border-left (around line 199-207):

```css
.person-column {
  flex: 1;
  position: relative;
  min-width: 0;
  margin-left: 4px; /* 4px transparent gap instead of border */
}

.person-column:first-child {
  margin-left: 0;
}
```

**Step 4: Pass --event-color-light in _renderColumn()**

In `_renderColumn()` (line 554-587), add `--event-color-light` to the style:

```typescript
style="
  top: ${pos.top}%;
  height: ${pos.height}%;
  width: ${width};
  left: ${left};
  --event-color: ${event.calendar_color};
  --event-color-light: ${event.calendar_color_light || ''};
"
```

**Step 5: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`

**Step 6: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-day.ts
git commit -m "feat: restyle day view — light event blocks, remove gridlines, gap-based lanes"
```

---

### Task 2.3: Update Week View — Event Blocks + Gridlines

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts`

**Step 1: Apply same event block and gridline changes as day view**

Same patterns as Task 2.2:
- Update `.positioned-event` to use `--event-color-light` background, dark text
- Remove hour gridlines, add alternating hour bands
- Remove column borders, use margin gaps
- Pass `--event-color-light` in event style attributes

**Step 2: Build and verify**

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-week.ts
git commit -m "feat: restyle week view — light event blocks, remove gridlines"
```

---

### Task 2.4: Update Month View + Agenda View

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-month.ts`
- Modify: `custom_components/planavista/frontend/src/components/view-agenda.ts`

**Step 1: Month view — update event pills to use light variant**

Update event pills to use `--event-color-light` as background with `--event-color` as text accent or left border.

**Step 2: Agenda view — update event chips to use light variant**

Same pattern — light background, primary accent border.

**Step 3: Build and verify**

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-month.ts custom_components/planavista/frontend/src/components/view-agenda.ts
git commit -m "feat: restyle month and agenda views — light event backgrounds"
```

---

## Phase 3: Day View Lane Containment Fix

Ensure events are strictly contained within their person column.

### Task 3.1: Fix Lane Containment

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts` (lines 554-587, _renderColumn)
- Modify: `custom_components/planavista/frontend/src/utils/event-utils.ts` (lines 162-236, detectOverlaps)

**Step 1: Verify overlap detection constrains to column**

The current `detectOverlaps()` assigns `column` and `totalColumns` values. Verify in `_renderColumn()` that width calculations never exceed 100%:

```typescript
// In _renderColumn, ensure events stay within lane bounds
const width = event.totalColumns > 1
  ? `calc(${100 / event.totalColumns}% - 6px)` // 6px = 3px left accent + 3px right gap
  : 'calc(100% - 6px)';
const left = event.totalColumns > 1
  ? `calc(${(event.column / event.totalColumns) * 100}% + 3px)`
  : '3px';
```

**Step 2: Add overflow: hidden to .person-column**

```css
.person-column {
  flex: 1;
  position: relative;
  min-width: 0;
  margin-left: 4px;
  overflow: hidden; /* Strictly clip events to lane */
}
```

**Step 3: Build and verify**

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-day.ts custom_components/planavista/frontend/src/utils/event-utils.ts
git commit -m "fix: strictly contain events within person lanes (overflow: hidden + adjusted sizing)"
```

---

## Phase 4: Week View Shared Events

Deduplicate shared events across calendars and show participant avatars.

### Task 4.1: Add Event Deduplication Utility

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/event-utils.ts`

**Step 1: Add deduplicateSharedEvents function**

```typescript
export interface SharedEvent extends CalendarEvent {
  shared_calendars: Array<{
    entity_id: string;
    color: string;
    color_light: string;
    person_entity: string;
    display_name: string;
  }>;
}

export function deduplicateSharedEvents(
  events: CalendarEvent[],
  calendars: CalendarConfig[]
): SharedEvent[] {
  const calMap = new Map(calendars.map(c => [c.entity_id, c]));
  const eventMap = new Map<string, SharedEvent>();

  for (const event of events) {
    // Key: summary + start + end (normalized)
    const key = `${event.summary}|${event.start}|${event.end}`;

    if (eventMap.has(key)) {
      // Add this calendar as a participant
      const existing = eventMap.get(key)!;
      const cal = calMap.get(event.calendar_entity_id);
      if (cal) {
        existing.shared_calendars.push({
          entity_id: cal.entity_id,
          color: cal.color,
          color_light: cal.color_light,
          person_entity: cal.person_entity,
          display_name: cal.display_name,
        });
      }
    } else {
      // First occurrence
      const cal = calMap.get(event.calendar_entity_id);
      eventMap.set(key, {
        ...event,
        shared_calendars: cal ? [{
          entity_id: cal.entity_id,
          color: cal.color,
          color_light: cal.color_light,
          person_entity: cal.person_entity,
          display_name: cal.display_name,
        }] : [],
      });
    }
  }

  return Array.from(eventMap.values());
}
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-utils.ts
git commit -m "feat: add deduplicateSharedEvents utility for week view"
```

---

### Task 4.2: Update Week View to Render Shared Events

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts`

**Step 1: Import and use deduplication in render**

In the render method, before grouping events by day, run deduplication:

```typescript
import { deduplicateSharedEvents, SharedEvent } from '../utils/event-utils';

// In render(), after filtering visible events:
const deduped = deduplicateSharedEvents(visibleEvents, this.calendars);
```

**Step 2: Add participant avatars to shared event blocks**

In `_renderDayColumn()`, for events with `shared_calendars.length > 1`, render stacked avatars:

```typescript
${(event as SharedEvent).shared_calendars?.length > 1 ? html`
  <div class="shared-avatars">
    ${(event as SharedEvent).shared_calendars.slice(0, 3).map((cal, i) => {
      const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
      return avatar
        ? html`<img class="shared-avatar" src="${avatar}" style="z-index: ${3 - i}; margin-left: ${i > 0 ? '-8px' : '0'}" />`
        : html`<div class="shared-avatar-initial" style="z-index: ${3 - i}; margin-left: ${i > 0 ? '-8px' : '0'}; background: ${cal.color}">${cal.display_name[0]}</div>`;
    })}
    ${(event as SharedEvent).shared_calendars.length > 3 ? html`
      <span class="shared-more">+${(event as SharedEvent).shared_calendars.length - 2}</span>
    ` : nothing}
  </div>
` : nothing}
```

**Step 3: Add CSS for shared avatars**

```css
.shared-avatars {
  position: absolute;
  bottom: 4px;
  right: 6px;
  display: flex;
  align-items: center;
}

.shared-avatar, .shared-avatar-initial {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--pv-card-bg, #fff);
  object-fit: cover;
}

.shared-avatar-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
}

.shared-more {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--pv-text-muted);
  margin-left: 2px;
}
```

**Step 4: Build and verify**

**Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-week.ts
git commit -m "feat: deduplicate shared events in week view with participant avatars"
```

---

## Phase 5: Onboarding Wizard

Replace the HA config flow with a minimal install step and a beautiful in-card wizard.

### Task 5.1: Simplify HA Config Flow

**Files:**
- Modify: `custom_components/planavista/config_flow.py`

**Step 1: Replace multi-step config flow with single confirmation step**

Replace `async_step_user()` with:

```python
async def async_step_user(
    self, user_input: dict[str, Any] | None = None
) -> config_entries.FlowResult:
    """Single confirmation step with setup instructions."""
    if user_input is not None:
        # Create entry with empty defaults — wizard handles the rest
        return self.async_create_entry(
            title=NAME,
            data={
                CONF_CALENDARS: [],
                "display": {
                    CONF_TIME_FORMAT: DEFAULT_TIME_FORMAT,
                    CONF_WEATHER_ENTITY: "",
                    CONF_FIRST_DAY: DEFAULT_FIRST_DAY,
                    CONF_DEFAULT_VIEW: DEFAULT_VIEW,
                    CONF_THEME: DEFAULT_THEME,
                },
                "onboarding_complete": False,
            },
        )

    return self.async_show_form(
        step_id="user",
        data_schema=vol.Schema({}),
        description_placeholders={
            "name": NAME,
        },
    )
```

**Step 2: Update strings.json and translations/en.json**

Add the installation instructions text to the user step description:

```json
{
  "config": {
    "step": {
      "user": {
        "title": "Welcome to PlanaVista",
        "description": "PlanaVista has been installed successfully.\n\nTo complete setup:\n\n1. Navigate to the dashboard where you want your calendar\n2. Click the pencil icon (Edit Dashboard) in the top right\n3. Click \"+ Add Card\" at the bottom\n4. Search for \"PlanaVista\" and select it\n5. Save the dashboard\n\nThe first time the card loads, a setup wizard will walk you through choosing your calendars, colors, theme, and preferences.\n\nClick Submit to finish installation."
      }
    }
  }
}
```

**Step 3: Keep the OptionsFlow intact** — it still works for programmatic config changes

**Step 4: Commit**

```bash
git add custom_components/planavista/config_flow.py custom_components/planavista/strings.json custom_components/planavista/translations/en.json
git commit -m "feat: simplify config flow to single instruction step (wizard handles setup)"
```

---

### Task 5.2: Create Color Swatch Picker Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/color-swatch-picker.ts`

**Step 1: Build the color swatch grid component**

A reusable LitElement component that shows the 10 preset swatches + a "Custom..." button that reveals an RGB picker.

```typescript
@customElement('pv-color-swatch-picker')
export class PVColorSwatchPicker extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) valueLight = '';
  @state() private _customMode = false;

  // COLOR_PRESETS embedded in frontend
  static readonly PRESETS = [
    { name: 'Ocean',    color: '#4A90D9', light: '#DCE8F5' },
    { name: 'Fire',     color: '#FC6A05', light: '#FEE6D1' },
    { name: 'Sage',     color: '#6BA368', light: '#E2F0E1' },
    { name: 'Lavender', color: '#9B8EC4', light: '#EDEBF5' },
    { name: 'Amber',    color: '#D9A52B', light: '#F7EDCF' },
    { name: 'Honey',    color: '#CDCB2E', light: '#F3F3DA' },
    { name: 'Rose',     color: '#D4728C', light: '#F5E4EA' },
    { name: 'Teal',     color: '#4A9E9E', light: '#DDF0F0' },
    { name: 'Slate',    color: '#6B7A8D', light: '#E8EAED' },
    { name: 'Graphite', color: '#505050', light: '#E8E8E8' },
  ];

  // Renders grid of swatches, "Custom..." button, and optional color input
  // Dispatches 'color-change' event with { color, colorLight } detail
}
```

Full implementation includes:
- 5x2 swatch grid (circular swatches, 44px touch targets)
- Selected state: ring around swatch + checkmark
- "Custom..." button opens an `<input type="color">` with auto-computed light variant
- Swatch name shown on hover/focus

**Step 2: Build and verify**

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/color-swatch-picker.ts
git commit -m "feat: create reusable color swatch picker component"
```

---

### Task 5.3: Create Onboarding Wizard Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

**Step 1: Build the 3-page onboarding wizard**

A full-screen overlay LitElement component with:
- Progress indicator (3 dots at top)
- Slide transitions between pages
- Back/Next/Finish buttons

**Page 1 — Preferences:**
- Time format toggle (12h / 24h) — two large pill buttons
- Weather entity dropdown (auto-discovers weather.* entities from hass.states)
- First day of week toggle (Sunday / Monday) — two large pill buttons
- Default view selector (Day / Week / Month / Agenda) — four cards with icons

**Page 2 — Calendars:**
- Auto-discovers all calendar.* entities from hass.states
- Each calendar shown as a card with:
  - Checkbox (include/exclude)
  - Display name (editable text input)
  - Color swatch picker (pv-color-swatch-picker component)
  - Person link dropdown (discovers person.* entities)

**Page 3 — Theme:**
- 4 theme cards with visual previews (mini calendar mockup in each theme)
- Click to select, live preview updates behind wizard overlay
- Selected theme has accent ring

**Page 0 — Reuse Config (conditional):**
- Only shown if existing PlanaVista config entries are detected
- "Start fresh" button → proceed to Page 1
- "Use existing config" dropdown → skip wizard, card renders

**Step 2: Wire up config saving**

On Finish, the wizard saves config back to HA via service call:
```typescript
await this.hass.callService('planavista', 'save_config', {
  calendars: [...],
  display: {...},
  onboarding_complete: true,
});
```

This requires a new backend service (see Task 5.4).

**Step 3: Build and verify**

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -m "feat: create onboarding wizard (3-page setup with color swatches + theme picker)"
```

---

### Task 5.4: Add Backend save_config Service

**Files:**
- Modify: `custom_components/planavista/__init__.py`
- Modify: `custom_components/planavista/services.yaml`

**Step 1: Register a save_config service**

In `__init__.py`, register a service that accepts config data from the frontend wizard and updates the config entry:

```python
async def async_save_config(call):
    """Save config from frontend wizard."""
    data = call.data
    config_entry = hass.config_entries.async_entries(DOMAIN)[0]
    new_data = dict(config_entry.data)

    if "calendars" in data:
        new_data[CONF_CALENDARS] = data["calendars"]
    if "display" in data:
        new_data["display"] = data["display"]
    if "onboarding_complete" in data:
        new_data["onboarding_complete"] = data["onboarding_complete"]

    hass.config_entries.async_update_entry(config_entry, data=new_data)
    await hass.config_entries.async_reload(config_entry.entry_id)

hass.services.async_register(DOMAIN, "save_config", async_save_config)
```

**Step 2: Add service definition to services.yaml**

**Step 3: Commit**

```bash
git add custom_components/planavista/__init__.py custom_components/planavista/services.yaml
git commit -m "feat: add save_config service for frontend wizard"
```

---

### Task 5.5: Integrate Wizard into Calendar Card

**Files:**
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`
- Modify: `custom_components/planavista/frontend/src/main.ts`

**Step 1: Import onboarding wizard and color picker**

Add imports for the new components in main.ts.

**Step 2: Add onboarding detection to calendar card**

In the card's render method, check if onboarding is complete:

```typescript
render() {
  const data = this._getData();
  if (!data?.onboarding_complete) {
    return html`
      <pv-onboarding-wizard
        .hass=${this.hass}
        @onboarding-complete=${this._onOnboardingComplete}
      ></pv-onboarding-wizard>
    `;
  }
  // ... existing render
}
```

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts custom_components/planavista/frontend/src/main.ts
git commit -m "feat: show onboarding wizard on first card load"
```

---

## Phase 6: Settings Panel

Add gear icon to card header that opens settings using the same wizard components.

### Task 6.1: Create Settings Panel Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/settings-panel.ts`

**Step 1: Build settings panel**

Reuses the same page components from the onboarding wizard but:
- Opens as a dialog overlay (not full-screen)
- Pre-populated with current config values
- Has a "Save" button instead of "Finish"
- Each page accessible via tabs (Preferences / Calendars / Theme) instead of linear flow

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/settings-panel.ts
git commit -m "feat: create settings panel (gear icon → config dialog)"
```

---

### Task 6.2: Add Gear Icon to Card Header

**Files:**
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`

**Step 1: Add gear icon button to header**

In the header section (around line 583), add a gear icon button:

```typescript
<button class="pv-btn-icon pvc-settings-btn" @click=${this._openSettings}>
  <ha-icon icon="mdi:cog"></ha-icon>
</button>
```

**Step 2: Add settings panel to render**

```typescript
${this._settingsOpen ? html`
  <pv-settings-panel
    .hass=${this.hass}
    .config=${this._getData()}
    @settings-close=${() => this._settingsOpen = false}
    @settings-save=${this._onSettingsSave}
  ></pv-settings-panel>
` : nothing}
```

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: add gear icon to header → opens settings panel"
```

---

## Phase 7: Responsive Breakpoints

Implement the 5 width + 3 height breakpoint system across all components.

### Task 7.1: Add Responsive CSS Utility

**Files:**
- Create: `custom_components/planavista/frontend/src/styles/responsive.ts`

**Step 1: Define breakpoint mixins as CSS template literals**

```typescript
import { css } from 'lit';

// Width breakpoints
export const BREAKPOINT_XS = 479;
export const BREAKPOINT_SM = 767;
export const BREAKPOINT_MD = 1023;
export const BREAKPOINT_LG = 1439;

// Height breakpoints
export const BREAKPOINT_SHORT = 500;
export const BREAKPOINT_MEDIUM_H = 900;

export const responsiveStyles = css`
  /* Width-based responsive utilities */
  @media (max-width: 479px) {
    :host { --pv-breakpoint: xs; }
  }
  @media (min-width: 480px) and (max-width: 767px) {
    :host { --pv-breakpoint: sm; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    :host { --pv-breakpoint: md; }
  }
  @media (min-width: 1024px) and (max-width: 1439px) {
    :host { --pv-breakpoint: lg; }
  }
  @media (min-width: 1440px) {
    :host { --pv-breakpoint: xl; }
  }

  /* Height-based responsive utilities */
  @media (max-height: 500px) {
    :host { --pv-height-breakpoint: short; }
  }
  @media (min-height: 501px) and (max-height: 900px) {
    :host { --pv-height-breakpoint: medium; }
  }
  @media (min-height: 901px) {
    :host { --pv-height-breakpoint: tall; }
  }
`;
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/styles/responsive.ts
git commit -m "feat: add responsive breakpoint CSS utilities"
```

---

### Task 7.2: Apply Responsive Rules to Calendar Card Header

**Files:**
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`

**Step 1: Import and include responsive styles**

**Step 2: Add media queries for header layout**

```css
/* xs/sm: Stack header vertically, icon-only tabs */
@media (max-width: 767px) {
  .pvc-header { flex-direction: column; padding: 12px 16px; gap: 8px; }
  .pvc-view-tabs .tab-label { display: none; } /* Icon only */
  .pvc-weather-info .pvc-weather-condition { display: none; }
}

/* xs + short: Minimal header */
@media (max-width: 479px) and (max-height: 500px) {
  .pvc-header { flex-direction: row; padding: 8px 12px; }
  .pvc-weather { display: none; }
}

/* md: Compressed single row */
@media (min-width: 768px) and (max-width: 1023px) {
  .pvc-weather-icon { --icon-size: 32px; }
}
```

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: responsive header — stacked on mobile, compressed on tablet"
```

---

### Task 7.3: Apply Responsive Rules to Day View

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts`

**Step 1: Add responsive behavior**

```css
/* xs: Single column, no person lanes */
@media (max-width: 479px) {
  .columns-area { flex-direction: column; }
  .person-column { margin-left: 0; }
  .column-headers { display: none; }
  .positioned-event .event-time { display: none; } /* Title only */
}

/* sm: Single column with swipe hint */
@media (min-width: 480px) and (max-width: 767px) {
  .column-headers { display: none; }
}

/* short height: Compact avatars, every-2-hour labels */
@media (max-height: 500px) {
  .person-avatar, .person-initial { width: 32px; height: 32px; }
}

/* tall height: Larger avatars */
@media (min-height: 901px) {
  .person-avatar, .person-initial { width: 64px; height: 64px; }
}
```

**Step 2: Add lane minimum width check**

In `updated()` or `firstUpdated()`, check available width and switch to single-column mode if lanes would be < 120px:

```typescript
private _checkLaneWidth() {
  const container = this.shadowRoot?.querySelector('.columns-area') as HTMLElement;
  if (!container) return;
  const availableWidth = container.clientWidth - 60; // minus gutter
  const numLanes = this._visibleCalendars.length;
  this._singleColumnMode = numLanes > 0 && (availableWidth / numLanes) < 120;
}
```

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/components/view-day.ts
git commit -m "feat: responsive day view — single column on mobile, lane width check"
```

---

### Task 7.4: Apply Responsive Rules to Week View

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-week.ts`

**Step 1: Add responsive behavior**

```css
/* xs: 3-day view */
@media (max-width: 479px) {
  /* Show 3 days centered on current day */
  .positioned-event .event-time { display: none; }
}

/* sm: 5-day work week */
@media (min-width: 480px) and (max-width: 767px) {
  /* Show Mon-Fri */
}
```

**Step 2: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/components/view-week.ts
git commit -m "feat: responsive week view — 3-day on phone, 5-day on small tablet"
```

---

### Task 7.5: Apply Responsive Rules to Month + Agenda Views

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-month.ts`
- Modify: `custom_components/planavista/frontend/src/components/view-agenda.ts`

**Step 1: Month — dots on xs, count on sm, pills on md+**

**Step 2: Agenda — full width on xs/sm, 720px max-width on md+**

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/components/view-month.ts custom_components/planavista/frontend/src/components/view-agenda.ts
git commit -m "feat: responsive month and agenda views"
```

---

### Task 7.6: Apply Responsive Rules to Dialogs

**Files:**
- Modify: `custom_components/planavista/frontend/src/styles/shared.ts` (dialogStyles)
- Modify: `custom_components/planavista/frontend/src/components/event-create-dialog.ts`
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

**Step 1: Bottom-sheet style on xs**

```css
@media (max-width: 479px) {
  .pv-dialog {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 100%;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
    animation: pv-slideUp 250ms ease;
  }
}
```

**Step 2: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/styles/shared.ts custom_components/planavista/frontend/src/components/event-create-dialog.ts custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -m "feat: responsive dialogs — bottom-sheet on mobile"
```

---

## Phase 8: Card-Level Overrides

Support per-card YAML overrides that fall back to global config.

### Task 8.1: Implement Override Resolution

**Files:**
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`

**Step 1: Add override resolution logic**

In `setConfig()` and the data access methods, merge card-level YAML config over global sensor config:

```typescript
private _resolveConfig(): ResolvedConfig {
  const global = this._getData();
  const cardOverrides = this._config || {};

  return {
    theme: cardOverrides.theme || global?.display?.theme || 'light',
    default_view: cardOverrides.default_view || global?.display?.default_view || 'week',
    calendars: cardOverrides.calendars || null, // null = show all
    hide_weather: cardOverrides.hide_weather || false,
    hide_header: cardOverrides.hide_header || false,
  };
}
```

**Step 2: Filter calendars if card specifies a subset**

```typescript
private _getVisibleCalendars(): CalendarConfig[] {
  const resolved = this._resolveConfig();
  const allCalendars = this._getData()?.calendars || [];

  if (resolved.calendars) {
    return allCalendars.filter(c => resolved.calendars.includes(c.entity_id));
  }
  return allCalendars;
}
```

**Step 3: Build, verify, commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: support card-level YAML overrides (theme, view, calendars, hide_weather)"
```

---

## Phase Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1.1–1.4 | Color palette backend + types |
| 2 | 2.1–2.4 | Event block restyling + gridline removal |
| 3 | 3.1 | Day view lane containment fix |
| 4 | 4.1–4.2 | Week view shared event deduplication |
| 5 | 5.1–5.5 | Onboarding wizard (config flow + frontend) |
| 6 | 6.1–6.2 | Settings panel + gear icon |
| 7 | 7.1–7.6 | Responsive breakpoints (all components) |
| 8 | 8.1 | Card-level YAML overrides |

**Total: 20 tasks across 8 phases.**

Each phase is independently deployable. Phases 1–3 can ship as a visual refresh. Phase 4 adds shared event intelligence. Phase 5–6 replaces the setup experience. Phase 7 makes everything responsive. Phase 8 enables multi-card configurations.

**Build command:** `cd custom_components/planavista/frontend && npx rollup -c`
**Deploy:** Push to GitHub → HACS redownload → hard refresh (Ctrl+Shift+R)
