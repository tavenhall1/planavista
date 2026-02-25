# PlanaVista v1.0 Rewrite — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite PlanaVista frontend from vanilla JS to LitElement + TypeScript with "Calm Premium" visual design, event CRUD, 4 calendar views, and targeted backend improvements.

**Architecture:** Modular Lovelace cards built with Lit 3.x, TypeScript, Rollup. Single bundled output (`planavista-cards.js`). Shared state via ReactiveController. Backend Python coordinator with wider date range and event UID passthrough.

**Tech Stack:** Lit 3.x, TypeScript 5.x, Rollup 4.x, custom-card-helpers, Meteocons SVG weather icons, Home Assistant calendar services API.

**Design Doc:** `docs/plans/2026-02-24-v1-rewrite-design.md`

---

## Task 1: Build System Setup

**Files:**
- Create: `custom_components/planavista/frontend/package.json`
- Create: `custom_components/planavista/frontend/rollup.config.mjs`
- Create: `custom_components/planavista/frontend/tsconfig.json`
- Create: `custom_components/planavista/frontend/.gitignore`

**Step 1: Create package.json**

```json
{
  "name": "planavista-cards",
  "version": "1.0.0",
  "description": "PlanaVista cards for Home Assistant",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "rollup -c --watch",
    "build": "rollup -c",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "lit": "^3.2.0",
    "custom-card-helpers": "^1.9.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^28.0.0",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^12.1.0",
    "rollup": "^4.28.0",
    "tslib": "^2.8.0",
    "typescript": "^5.7.0"
  }
}
```

**Step 2: Create rollup.config.mjs**

```javascript
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const isDev = process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/planavista-cards.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: isDev,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript(),
    !isDev && terser({
      compress: { passes: 2 },
      output: { comments: false },
    }),
  ].filter(Boolean),
};
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "es2021",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["es2021", "dom", "dom.iterable"],
    "declaration": false,
    "strict": true,
    "noImplicitAny": false,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create .gitignore for frontend**

```
node_modules/
# dist/ is NOT ignored — committed for HACS users
```

**Step 5: Install dependencies and verify build**

```bash
cd custom_components/planavista/frontend
npm install
```

**Step 6: Commit**

```bash
git add custom_components/planavista/frontend/package.json
git add custom_components/planavista/frontend/rollup.config.mjs
git add custom_components/planavista/frontend/tsconfig.json
git add custom_components/planavista/frontend/.gitignore
git commit -m "feat: add LitElement + TypeScript build system"
```

---

## Task 2: TypeScript Types & Interfaces

**Files:**
- Create: `custom_components/planavista/frontend/src/types.ts`

**Step 1: Define all TypeScript interfaces**

```typescript
import { HomeAssistant } from 'custom-card-helpers';

// ============================================================================
// Configuration Types
// ============================================================================

export interface PlanaVistaCardConfig {
  type: string;
  entity?: string;
  theme?: string;
  view?: 'day' | 'week' | 'month' | 'agenda';
}

export interface PlanaVistaGridConfig extends PlanaVistaCardConfig {
  view?: 'day' | 'week' | 'month' | 'agenda';
}

export interface PlanaVistaClockConfig extends PlanaVistaCardConfig {
  size?: 'small' | 'medium' | 'large';
  show_date?: boolean;
  show_seconds?: boolean;
  time_format?: '12h' | '24h';
  align?: 'left' | 'center' | 'right';
  background?: string;
  text_color?: string;
}

export interface PlanaVistaWeatherConfig extends PlanaVistaCardConfig {
  weather_entity?: string;
  show_details?: boolean;
  show_forecast?: boolean;
  layout?: 'horizontal' | 'vertical';
  background?: string;
  text_color?: string;
}

export interface PlanaVistaTogglesConfig extends PlanaVistaCardConfig {
  layout?: 'horizontal' | 'vertical';
  show_names?: boolean;
  show_add_button?: boolean;
}

export interface PlanaVistaAgendaConfig extends PlanaVistaCardConfig {
  max_events?: number;
  days_ahead?: number;
  max_height?: string;
  show_calendar_name?: boolean;
  show_end_time?: boolean;
  time_format?: '12h' | '24h';
}

// ============================================================================
// Data Types
// ============================================================================

export interface CalendarConfig {
  entity_id: string;
  display_name: string;
  color: string;
  icon: string;
  person_entity: string;
  visible: boolean;
  state?: string;
  attributes?: Record<string, any>;
}

export interface CalendarEvent {
  summary: string;
  start: string;       // ISO datetime
  end: string;         // ISO datetime
  description?: string;
  location?: string;
  uid?: string;        // For delete/edit operations
  recurrence_id?: string;
  calendar_entity_id: string;
  calendar_name: string;
  calendar_color: string;
}

export interface DisplayConfig {
  time_format: '12h' | '24h';
  weather_entity: string;
  first_day: 'monday' | 'sunday';
  default_view: 'day' | 'week' | 'month' | 'agenda';
  theme: string;
}

export interface PlanaVistaData {
  calendars: CalendarConfig[];
  events: CalendarEvent[];
  display: DisplayConfig;
  version?: number;
}

// ============================================================================
// State Types
// ============================================================================

export type ViewType = 'day' | 'week' | 'month' | 'agenda';
export type DialogType = 'create' | 'edit' | null;

export interface PlanaVistaState {
  hiddenCalendars: Set<string>;
  currentView: ViewType;
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  dialogOpen: DialogType;
}

// ============================================================================
// Event Creation
// ============================================================================

export interface CreateEventData {
  entity_id: string;
  summary: string;
  start_date_time?: string;
  end_date_time?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  location?: string;
}

export interface DeleteEventData {
  entity_id: string;
  uid: string;
  recurrence_id?: string;
}

// ============================================================================
// Weather Types
// ============================================================================

export type WeatherCondition =
  | 'clear-night'
  | 'cloudy'
  | 'fog'
  | 'hail'
  | 'lightning'
  | 'lightning-rainy'
  | 'partlycloudy'
  | 'pouring'
  | 'rainy'
  | 'snowy'
  | 'snowy-rainy'
  | 'sunny'
  | 'windy'
  | 'windy-variant'
  | 'exceptional';

export interface ForecastDay {
  datetime: string;
  condition: WeatherCondition;
  temperature: number;
  templow?: number;
}

// ============================================================================
// Window augmentation for HA
// ============================================================================

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
    }>;
    _planavistaState?: any;
  }
}
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: Utility Modules

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/date-utils.ts`
- Create: `custom_components/planavista/frontend/src/utils/event-utils.ts`
- Create: `custom_components/planavista/frontend/src/utils/ha-utils.ts`

**Step 1: Create date-utils.ts**

Date formatting, week calculations, relative date labels. All pure functions.

Key functions:
- `formatTime(isoString, format)` — format time with 12h/24h support
- `formatDate(date, format)` — long/medium/short/weekday date formatting
- `isToday(date)`, `isTomorrow(date)`, `isPast(date)`
- `getStartOfWeek(date, firstDay)` — respects monday/sunday start
- `getMonthGrid(date, firstDay)` — returns 6-week grid for month view
- `getDateRange(view, currentDate, firstDay)` — returns start/end for any view
- `getRelativeLabel(date)` — "Today", "Tomorrow", "Monday", etc.

**Step 2: Create event-utils.ts**

Event grouping, filtering, sorting, overlap detection.

Key functions:
- `groupEventsByDate(events)` — group events by date key
- `groupEventsByPerson(events, calendars)` — group by person entity for day view
- `getEventsForDateRange(events, start, end)` — filter events in range
- `isAllDayEvent(event)` — check if event is all-day
- `isMultiDayEvent(event)` — check if event spans multiple days
- `getEventPosition(event, dayStart, dayEnd)` — calculate top% and height% for time-proportional positioning
- `detectOverlaps(events)` — find overlapping events for column splitting

**Step 3: Create ha-utils.ts**

Home Assistant service call wrappers.

Key functions:
- `createEvent(hass, data)` — call calendar.create_event
- `deleteEvent(hass, data)` — call calendar.delete_event
- `refreshPlanaVista(hass)` — call homeassistant.update_entity on sensor.planavista_config
- `getPlanaVistaData(hass, entityId)` — extract PlanaVistaData from sensor attributes
- `getPersonAvatar(hass, personEntityId)` — get person entity picture URL

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/
git commit -m "feat: add date, event, and HA utility modules"
```

---

## Task 4: Theme System & Shared Styles

**Files:**
- Create: `custom_components/planavista/frontend/src/styles/themes.ts`
- Create: `custom_components/planavista/frontend/src/styles/shared.ts`

**Step 1: Create themes.ts**

Four themes with CSS custom properties. "Calm Premium" design language.

Themes: `light` (default), `dark`, `minimal`, `vibrant`

Each theme defines:
- `--pv-bg`, `--pv-card-bg`, `--pv-card-bg-elevated`
- `--pv-text`, `--pv-text-secondary`, `--pv-text-muted`
- `--pv-border`, `--pv-border-subtle`
- `--pv-accent`, `--pv-accent-text`
- `--pv-today-bg`, `--pv-now-color`
- `--pv-event-bg`, `--pv-shadow`, `--pv-shadow-lg`
- `--pv-radius`, `--pv-radius-lg`
- `--pv-transition`
- `--pv-font-family`

Light defaults:
- bg: `#FAFAF8`, card-bg: `#FFFFFF`, text: `#1A1B1E`
- accent: `#6366F1`, radius: `12px`, font: `Inter, -apple-system, system-ui, sans-serif`

Dark defaults:
- bg: `#1A1B1E`, card-bg: `#25262B`, text: `#E4E5E7`
- accent: `#818CF8` (lighter indigo for contrast)

Calendar color palette constant:
```typescript
export const CALENDAR_COLORS = [
  '#6366F1', '#F59E0B', '#10B981', '#3B82F6',
  '#EC4899', '#8B5CF6', '#14B8A6', '#F97316',
  '#EF4444', '#06B6D4',
];
```

**Step 2: Create shared.ts**

Shared CSS used by all cards. Includes:
- Typography scale (display, heading, body, caption)
- Button styles (primary, secondary, icon-button, pill-button)
- Card base styles (ha-card with theme vars)
- Event chip styles (colored left border + tinted bg)
- Dialog/popup base styles
- Animation keyframes (fadeIn, slideUp, scaleIn, pulse)
- Touch target sizing (min 48px)
- Scrollbar styling
- "Now" indicator styles

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/styles/
git commit -m "feat: add Calm Premium theme system and shared styles"
```

---

## Task 5: State Manager

**Files:**
- Create: `custom_components/planavista/frontend/src/state/state-manager.ts`

**Step 1: Implement PlanaVistaStateManager as a ReactiveController**

The state manager is a singleton that any card can connect to. It holds client-side UI state and provides actions.

```typescript
import { ReactiveController, ReactiveControllerHost } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { ViewType, CalendarEvent, DialogType, PlanaVistaData } from '../types';
import { createEvent, deleteEvent, refreshPlanaVista } from '../utils/ha-utils';

class PlanaVistaStateManager {
  // Singleton
  private static _instance: PlanaVistaStateManager;
  static getInstance(): PlanaVistaStateManager { ... }

  // State
  hiddenCalendars: Set<string>;
  currentView: ViewType;
  currentDate: Date;
  selectedEvent: CalendarEvent | null;
  dialogOpen: DialogType;

  // Subscribers
  private _hosts: Set<ReactiveControllerHost>;

  // Methods
  subscribe(host: ReactiveControllerHost): void;
  unsubscribe(host: ReactiveControllerHost): void;
  private _notify(): void;  // calls requestUpdate() on all hosts

  // Actions
  toggleCalendar(entityId: string): void;
  setView(view: ViewType): void;
  navigateDate(direction: 'prev' | 'next' | 'today'): void;
  selectEvent(event: CalendarEvent | null): void;
  openCreateDialog(prefill?: Partial<CalendarEvent>): void;
  closeDialog(): void;

  // Event CRUD (async, calls HA services)
  async createEvent(hass: HomeAssistant, data: CreateEventData): Promise<void>;
  async deleteEvent(hass: HomeAssistant, data: DeleteEventData): Promise<void>;
  async editEvent(hass: HomeAssistant, oldEvent: DeleteEventData, newEvent: CreateEventData): Promise<void>;

  // Auto-advance timer
  startAutoAdvance(): void;
  stopAutoAdvance(): void;
}
```

Also create a `PlanaVistaController` that wraps the singleton for Lit component integration:

```typescript
export class PlanaVistaController implements ReactiveController {
  constructor(host: ReactiveControllerHost) { ... }
  hostConnected(): void { /* subscribe */ }
  hostDisconnected(): void { /* unsubscribe */ }
  get state(): PlanaVistaStateManager { return PlanaVistaStateManager.getInstance(); }
}
```

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/state/
git commit -m "feat: add reactive state manager with auto-advance"
```

---

## Task 6: Weather SVG Icons

**Files:**
- Create: `custom_components/planavista/frontend/src/utils/weather-icons.ts`

**Step 1: Create inline SVG weather icons**

Download Meteocons SVGs from https://github.com/basmilius/weather-icons and embed them as Lit `svg` template literals. Map HA weather conditions to icon functions.

Each icon is a function returning `SVGTemplateResult`:
```typescript
import { svg, SVGTemplateResult } from 'lit';

export function weatherIcon(condition: WeatherCondition, size = 48): SVGTemplateResult { ... }
```

Map:
- `sunny` → clear-day SVG
- `clear-night` → clear-night SVG
- `cloudy` → cloudy SVG
- `partlycloudy` → partly-cloudy-day SVG
- `rainy` → rain SVG
- `pouring` → heavy-rain SVG
- `snowy` → snow SVG
- `fog` → fog SVG
- `lightning` → thunderstorm SVG
- `windy` → wind SVG
- etc.

Include CSS animations for rain drops, snow, sun rays.

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/weather-icons.ts
git commit -m "feat: add animated SVG weather icons (Meteocons)"
```

---

## Task 7: Clock Card

**Files:**
- Create: `custom_components/planavista/frontend/src/cards/planavista-clock-card.ts`

**Step 1: Implement clock card with LitElement**

- Reactive 1-second timer using `setInterval` in `connectedCallback`
- Only updates the text content, not the entire DOM
- Configurable: size, show_date, show_seconds, time_format, align, background, text_color
- Uses theme CSS variables from shared styles
- Visual card editor (`getConfigElement`)
- Registers with `window.customCards`

Design: Large, elegant time display. Inter font, weight 300. Supports gradient backgrounds.

**Step 2: Build and verify**

```bash
cd custom_components/planavista/frontend && npm run build
```

Verify `dist/planavista-cards.js` is generated.

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-clock-card.ts
git commit -m "feat: add LitElement clock card with reactive timer"
```

---

## Task 8: Weather Card

**Files:**
- Create: `custom_components/planavista/frontend/src/cards/planavista-weather-card.ts`

**Step 1: Implement weather card**

- Reads weather entity from config or from PlanaVista display settings
- Shows animated SVG icon (from weather-icons.ts), temperature, condition
- Optional: humidity, wind speed, 5-day forecast
- Supports horizontal/vertical layout
- Gradient background shifts by weather condition
- Uses Meteocons SVGs instead of emoji

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-weather-card.ts
git commit -m "feat: add weather card with animated SVG icons"
```

---

## Task 9: Toggles Card

**Files:**
- Create: `custom_components/planavista/frontend/src/cards/planavista-toggles-card.ts`

**Step 1: Implement toggles card**

- Shows person avatars (from HA person entities) as toggle buttons
- Active: calendar color background, white text
- Inactive: muted, reduced opacity
- Pill-shaped buttons with smooth transition on toggle
- "New Event" button (accent color, prominent)
- Clicking "New Event" opens create dialog via state manager
- Connects to PlanaVistaController for shared state

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-toggles-card.ts
git commit -m "feat: add toggles card with avatar buttons"
```

---

## Task 10: Day View Component (Per-Person Columns)

**Files:**
- Create: `custom_components/planavista/frontend/src/components/view-day.ts`

**Step 1: Implement per-person column day view**

This is the hero view — the default home screen.

Structure:
- All-day events row at top
- Person column headers with avatars
- Time gutter (6 AM - 11 PM, configurable)
- Events positioned proportionally by time/duration
- "Now" indicator: red line at current time
- Auto-scroll to bring "now" into view on load
- Tap empty slot → pre-fills create dialog with person + time
- Tap event → opens event detail popup

Key implementation details:
- Each hour row is 60px height (configurable)
- Event top = (startMinutes / totalMinutes) * totalHeight
- Event height = (durationMinutes / totalMinutes) * totalHeight
- Overlapping events within a column split horizontally
- Smooth scroll behavior for auto-scroll-to-now
- Touch-friendly: 48px minimum event height even for short events

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-day.ts
git commit -m "feat: add per-person column day view"
```

---

## Task 11: Week View Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/view-week.ts`

**Step 1: Implement Google Calendar-style week view**

Structure:
- 7-day columns (respects first_day setting)
- Day headers with weekday + date number
- Today column highlighted
- Time gutter on left
- All-day events in banner row at top
- Events positioned by time, proportional height
- "Now" indicator line
- Multi-day events span across day columns in the banner
- Tap empty slot → create event for that day + time

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-week.ts
git commit -m "feat: add week view with time grid"
```

---

## Task 12: Month View Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/view-month.ts`

**Step 1: Implement month grid view**

Structure:
- 7-column grid, 5-6 rows
- Day numbers in each cell, today highlighted
- Events shown as colored pills (calendar color bg, white text)
- Max 3 events visible per day, "+N more" for overflow
- Tap "+N more" → switches to day view for that date
- Tap day number → switches to day view
- Previous/next month days shown muted
- Week numbers optional

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-month.ts
git commit -m "feat: add month grid view"
```

---

## Task 13: Agenda View Component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/view-agenda.ts`

**Step 1: Implement scrolling agenda**

Structure:
- Events grouped by date
- Date headers: "Today", "Tomorrow", then "Wednesday, Feb 26", etc.
- Each event: colored left bar + time + title + calendar name
- All-day events shown first in each day group
- Configurable: max events, days ahead
- Tap event → detail popup

This is also used by the standalone agenda card.

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-agenda.ts
git commit -m "feat: add scrolling agenda view"
```

---

## Task 14: Event Create Dialog

**Files:**
- Create: `custom_components/planavista/frontend/src/components/event-create-dialog.ts`

**Step 1: Implement event creation dialog**

Opens as a modal overlay. Slide-up animation on touch, fade-in on desktop.

Fields:
- Title (required, auto-focused)
- Calendar picker (dropdown, shows color dots)
- Date picker
- All-day toggle
- Start time / End time (hidden when all-day)
- Description (optional, collapsible)
- Location (optional, collapsible)

Pre-fill logic:
- If opened from empty time slot: pre-fill date + time + person's calendar
- If opened from "+" button: pre-fill today, next rounded 15-min time
- If editing: pre-fill all fields from existing event

On save: calls `calendar.create_event` via ha-utils, then `refreshPlanaVista`, then closes dialog.

Custom-styled form elements (not browser defaults). 48px touch targets.

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/event-create-dialog.ts
git commit -m "feat: add event creation dialog"
```

---

## Task 15: Event Detail Popup

**Files:**
- Create: `custom_components/planavista/frontend/src/components/event-popup.ts`

**Step 1: Implement event detail popup**

Opens when tapping an event. Shows as a floating card with backdrop blur.

Content:
- Event title (large)
- Calendar name + color indicator
- Date and time range
- Location (if present, with map pin icon)
- Description (if present)
- Action buttons: Edit, Delete

Edit: opens create dialog in edit mode (pre-filled).
Delete: confirmation prompt, then calls `calendar.delete_event`.

Dismiss: tap outside, swipe down, or tap X button.

Animation: scale from event position (1.02x) + fade in backdrop.

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/components/event-popup.ts
git commit -m "feat: add event detail popup with edit/delete"
```

---

## Task 16: Grid Card (Main Calendar Card)

**Files:**
- Create: `custom_components/planavista/frontend/src/cards/planavista-grid-card.ts`

**Step 1: Implement grid card**

This is the main card that composes all 4 views. It contains:
- Navigation header: prev/today/next buttons + date label + view switcher (day|week|month)
- View container: renders the active view component
- Connects to PlanaVistaController for shared state
- View transitions: crossfade animation between views
- Swipe gesture support for date navigation (left/right)
- Date navigation: slide animation

Config: entity, view (default), theme

The grid card delegates rendering to view-day, view-week, view-month, or view-agenda components.

It also renders the event-popup and event-create-dialog when triggered via state manager.

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-grid-card.ts
git commit -m "feat: add grid card composing all 4 views"
```

---

## Task 17: Agenda Card (Standalone)

**Files:**
- Create: `custom_components/planavista/frontend/src/cards/planavista-agenda-card.ts`

**Step 1: Implement standalone agenda card**

Wraps the view-agenda component in a ha-card with theme support. Connects to PlanaVistaController so calendar toggles affect it.

Config: entity, max_events, days_ahead, max_height, show_calendar_name, show_end_time, time_format, theme

**Step 2: Commit**

```bash
git add custom_components/planavista/frontend/src/cards/planavista-agenda-card.ts
git commit -m "feat: add standalone agenda card"
```

---

## Task 18: Main Entry Point & Card Registration

**Files:**
- Create: `custom_components/planavista/frontend/src/main.ts`

**Step 1: Create main.ts that imports all cards and registers them**

```typescript
// Import all cards (triggers @customElement registration)
import './cards/planavista-grid-card';
import './cards/planavista-agenda-card';
import './cards/planavista-clock-card';
import './cards/planavista-weather-card';
import './cards/planavista-toggles-card';

// Register all cards with HA card picker
window.customCards = window.customCards || [];
window.customCards.push(
  { type: 'planavista-grid-card', name: 'PlanaVista', description: 'Calendar grid with day, week, and month views', preview: true },
  { type: 'planavista-agenda-card', name: 'PlanaVista Agenda', description: 'Upcoming events list', preview: true },
  { type: 'planavista-clock-card', name: 'PlanaVista Clock', description: 'Time and date display', preview: true },
  { type: 'planavista-weather-card', name: 'PlanaVista Weather', description: 'Weather conditions and forecast', preview: true },
  { type: 'planavista-toggles-card', name: 'PlanaVista Toggles', description: 'Calendar visibility toggles', preview: true },
);

console.info(
  '%c PLANAVISTA %c v1.0.0 ',
  'color: white; background: #6366F1; font-weight: bold; border-radius: 4px 0 0 4px; padding: 2px 6px;',
  'color: #6366F1; background: #EEF2FF; font-weight: bold; border-radius: 0 4px 4px 0; padding: 2px 6px;',
);
```

**Step 2: Build the full bundle**

```bash
cd custom_components/planavista/frontend && npm run build
```

Verify `dist/planavista-cards.js` exists and contains all cards.

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/main.ts
git add custom_components/planavista/frontend/dist/
git commit -m "feat: add main entry point and build bundle"
```

---

## Task 19: Backend Improvements

**Files:**
- Modify: `custom_components/planavista/__init__.py`
- Modify: `custom_components/planavista/sensor.py`
- Modify: `custom_components/planavista/const.py`
- Modify: `custom_components/planavista/manifest.json`

**Step 1: Update const.py**

- Change `VERSION` to `"1.0.0"`
- Add `EVENT_RANGE_PAST_DAYS = 30`
- Add `EVENT_RANGE_FUTURE_DAYS = 60`

**Step 2: Update __init__.py**

- Change `FRONTEND_SCRIPTS` to single entry: `["/planavista_panel/planavista-cards.js"]`
- Update `_async_update_data` to use 30/60 day range
- Ensure event UIDs are passed through from calendar.get_events response
- Ensure event `description`, `location`, `recurrence_id` are passed through

**Step 3: Update sensor.py**

- Ensure `extra_state_attributes` includes all event metadata (uid, description, location)

**Step 4: Update manifest.json**

- Set version to `1.0.0`

**Step 5: Commit**

```bash
git add custom_components/planavista/__init__.py
git add custom_components/planavista/sensor.py
git add custom_components/planavista/const.py
git add custom_components/planavista/manifest.json
git commit -m "feat: backend improvements for v1.0 - wider date range, event UIDs, single bundle"
```

---

## Task 20: Remove Old Frontend Files

**Files:**
- Delete: `custom_components/planavista/frontend/planavista-base.js`
- Delete: `custom_components/planavista/frontend/planavista-calendar-card.js`
- Delete: `custom_components/planavista/frontend/planavista-clock-card.js`
- Delete: `custom_components/planavista/frontend/planavista-weather-card.js`
- Delete: `custom_components/planavista/frontend/planavista-grid-card.js`
- Delete: `custom_components/planavista/frontend/planavista-agenda-card.js`
- Delete: `custom_components/planavista/frontend/planavista-toggles-card.js`

**Step 1: Remove all old vanilla JS files**

```bash
git rm custom_components/planavista/frontend/planavista-*.js
```

**Step 2: Commit**

```bash
git commit -m "chore: remove old vanilla JS frontend files"
```

---

## Task 21: OOB Dashboard Layouts

**Files:**
- Modify: `examples/dashboards/wall-landscape.yaml`
- Modify: `examples/dashboards/wall-portrait.yaml`
- Modify: `examples/dashboards/tablet-compact.yaml`

**Step 1: Update all example dashboards**

Update card types and configs to match the new v1.0 cards. Remove any references to the legacy `planavista-calendar-card`.

Primary 27" landscape layout:
- Top: clock (33%) | weather (33%) | toggles (33%)
- Bottom: grid-card view=day (70%) | agenda-card (30%)

**Step 2: Commit**

```bash
git add examples/dashboards/
git commit -m "docs: update OOB dashboard layouts for v1.0"
```

---

## Task 22: Documentation Updates

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

**Step 1: Update README.md**

- Remove "WARNING: early stages" banner
- Update features checklist (mark implemented items)
- Update card names and configs
- Add Meteocons attribution
- Update roadmap

**Step 2: Update CLAUDE.md**

- Update architecture section for new build system
- Update frontend section for LitElement
- Update file structure

**Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update documentation for v1.0 rewrite"
```

---

## Execution Order & Dependencies

```
Task 1  (Build system)
  └→ Task 2  (Types)
       └→ Task 3  (Utils) + Task 4 (Themes) + Task 5 (State) + Task 6 (Icons)
            └→ Task 7  (Clock card)
            └→ Task 8  (Weather card)
            └→ Task 9  (Toggles card)
            └→ Task 10 (Day view)
            └→ Task 11 (Week view)
            └→ Task 12 (Month view)
            └→ Task 13 (Agenda view)
                 └→ Task 14 (Create dialog)
                 └→ Task 15 (Event popup)
                      └→ Task 16 (Grid card — composes views + dialogs)
                      └→ Task 17 (Agenda card)
                           └→ Task 18 (Main entry + build)
                                └→ Task 19 (Backend)
                                └→ Task 20 (Remove old files)
                                     └→ Task 21 (Dashboard layouts)
                                     └→ Task 22 (Documentation)
```

Tasks 3-6 can run in parallel.
Tasks 7-13 can run in parallel after 3-6.
Tasks 14-15 can run in parallel.
Tasks 16-17 depend on views + dialogs.
Tasks 19-20 can run in parallel with 16-18.
Tasks 21-22 run last.
