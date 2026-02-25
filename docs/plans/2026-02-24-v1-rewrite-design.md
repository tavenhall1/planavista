# PlanaVista v1.0 — Full Rewrite Design Document

**Date**: 2026-02-24
**Status**: Approved
**Author**: Claude (AI) + Taven (Human)

---

## 1. Overview

PlanaVista is a Home Assistant custom integration providing a beautiful, touch-first wall calendar display that rivals commercial products like Skylight ($250-600) and Hearth ($699). This design document covers the v1.0 rewrite — a complete frontend rebuild using LitElement with a "Calm Premium" visual identity, plus targeted backend improvements.

### Target Device

Primary: 27" Planar touchscreen + Raspberry Pi 4 (mimicking Hearth Display Max)
Secondary: Tablets (10-15"), desktop browsers, phones

### Design Philosophy

"When people see and use it, they say 'wow, this is Home Assistant!?'"

---

## 2. Architecture

### Frontend: LitElement + TypeScript + Rollup

Full rewrite. All existing vanilla JS frontend code is replaced.

```
custom_components/planavista/
├── frontend/
│   ├── src/
│   │   ├── cards/
│   │   │   ├── planavista-grid-card.ts
│   │   │   ├── planavista-agenda-card.ts
│   │   │   ├── planavista-clock-card.ts
│   │   │   ├── planavista-weather-card.ts
│   │   │   └── planavista-toggles-card.ts
│   │   ├── components/
│   │   │   ├── event-popup.ts
│   │   │   ├── event-create-dialog.ts
│   │   │   ├── view-day.ts
│   │   │   ├── view-week.ts
│   │   │   ├── view-month.ts
│   │   │   └── view-agenda.ts
│   │   ├── state/
│   │   │   └── state-manager.ts
│   │   ├── styles/
│   │   │   ├── themes.ts
│   │   │   └── shared.ts
│   │   ├── utils/
│   │   │   ├── date-utils.ts
│   │   │   ├── event-utils.ts
│   │   │   └── ha-utils.ts
│   │   └── types.ts
│   ├── dist/
│   │   └── planavista-cards.js        # Single bundle (committed for HACS)
│   ├── rollup.config.mjs
│   ├── tsconfig.json
│   └── package.json
```

Single bundle output. All 5 cards registered from one JS file.

### Backend: Targeted Improvements

Python backend is ~80% complete. Changes:
- Wider event fetch range (30 days back, 60 forward)
- Event UID passthrough for delete operations
- Single JS bundle registration (replace 7 script URLs with 1)
- New `planavista.refresh` service for on-demand coordinator updates

### Modular Cards

5 separate Lovelace cards, composable in any dashboard layout:

| Card | Purpose |
|------|---------|
| `planavista-grid-card` | Main calendar view (day/week/month) |
| `planavista-agenda-card` | Scrolling upcoming events list |
| `planavista-clock-card` | Time + date display |
| `planavista-weather-card` | Weather conditions + forecast |
| `planavista-toggles-card` | Calendar toggles + New Event button |

---

## 3. State Management

### PlanaVistaStateManager (ReactiveController)

Shared across all cards. Uses Lit's ReactiveController pattern.

**Client-side state:**
- `hiddenCalendars: Set<string>` — toggled calendars
- `currentView: 'day' | 'week' | 'month' | 'agenda'`
- `currentDate: Date` — the date being viewed
- `selectedEvent: CalendarEvent | null`
- `dialogOpen: 'create' | 'edit' | null`

**Derived from hass (read-only):**
- `visibleEvents` — filtered by hiddenCalendars
- `eventsByDate` — grouped and sorted
- `eventsByPerson` — for day view columns

**Actions (trigger HA service calls):**
- `createEvent(data)` → `calendar.create_event`
- `deleteEvent(data)` → `calendar.delete_event`
- `editEvent(data)` → delete + recreate (HA has no edit service)

After any mutation, call `planavista.refresh` for immediate coordinator update.

### Auto-Advance & Refresh

- 60-second interval checks for date change → auto-advance
- Coordinator polls every 60 seconds (existing)
- On-demand refresh after event create/delete
- Clock uses 1-second Lit reactive timer (only text node updates)

---

## 4. Views

### Day View (Default — Per-Person Columns)

Skylight/Hearth-inspired. Each configured person gets a column.

- Person avatars from HA person entities at column headers
- Time gutter on the left (6 AM - 11 PM, configurable)
- Events positioned proportionally to duration
- All-day events in a separate row above the time grid
- Overlapping events within a column split width
- "Now" indicator: red/accent line at current time, auto-scrolls into view
- Tap empty time slot → create event for that person + time

### Week View

Google Calendar-style 7-day grid.

- Day columns with date headers
- Time gutter on left
- Events span their actual duration visually
- Multi-day events in a top banner row
- Today column highlighted
- "Now" indicator line

### Month View

Traditional month grid.

- 6-week grid (covers full month + overflow)
- Events shown as colored pills/bars
- Max 3-4 visible per day, "+N more" overflow
- Today highlighted
- Tap a day to zoom into day view

### Agenda View

Scrolling chronological list.

- Events grouped by date
- "Today", "Tomorrow", then weekday names
- Each event: color bar + time + title + calendar name
- Configurable: max events, days ahead
- Tap event → detail popup

---

## 5. Visual Design — "Calm Premium"

### Typography
- Primary display: `Inter` / `-apple-system`, weight 300
- Event titles: weight 500, generous line-height
- Secondary text: weight 400, slightly muted
- No serif fonts

### Color System
- Light background: `#FAFAF8` (warm off-white)
- Dark background: `#1A1B1E` (rich charcoal)
- Cards: elevated with soft shadow, never flat
- Calendar palette (modern, vibrant):
  - `#6366F1` indigo, `#F59E0B` amber, `#10B981` emerald
  - `#3B82F6` blue, `#EC4899` pink, `#8B5CF6` violet

### Event Rendering
- 2px left border in calendar color
- Tinted background (calendar color at 8% opacity)
- Soft rounded corners (8px)
- Hover: slight lift + shadow increase
- Tap: gentle scale (1.02x) → popup

### Weather
- Custom SVG weather icons (meteocons or similar, MIT-licensed)
- Subtle gradient background shifts by condition
- Animated icons for rain, snow, etc.

### Animations
- View transitions: 200ms crossfade
- Date navigation: slide left/right
- Event tap: scale + popup with backdrop blur
- Calendar toggle: smooth opacity transition
- "Now" line: subtle pulse

### Touch Targets
- Minimum 48x48px for all interactive elements
- Pill-shaped buttons with generous padding

### Themes
- **Light** (default): warm off-white, soft shadows
- **Dark**: rich charcoal, glow effects, elevated surfaces
- **Minimal**: reduced chrome, maximum whitespace
- **Vibrant**: bold gradients, saturated colors

---

## 6. Event Creation & Management

### Create Event Dialog
- Triggered by: "+" button, tap empty time slot, or tap-and-hold on day
- Fields: title (required), calendar, date, time range, all-day toggle, description, location
- Pre-fills: date/time from tap context, first visible calendar
- Calls `calendar.create_event` via hass
- Smooth slide-up animation on touch

### Event Detail Popup
- Triggered by: tapping any event
- Shows: title, time, calendar, description, location
- Actions: Edit (opens create dialog pre-filled), Delete (confirm first)
- Backdrop blur behind popup
- Swipe down or tap outside to dismiss

### Event Edit
- Opens create dialog with all fields pre-filled
- On save: deletes old event, creates new one
- Shows loading state during operation

### Event Delete
- Confirmation dialog: "Delete [event title]?"
- Calls `calendar.delete_event` with event UID
- Immediate visual removal + coordinator refresh

---

## 7. Backend Changes

### `__init__.py`
- Expand event range: 30 days back, 60 days forward
- Single bundle: register `dist/planavista-cards.js` only
- Register `planavista.refresh` service
- Pass event UIDs through coordinator data

### `sensor.py`
- Include event UIDs in sensor attributes
- Ensure all event metadata passes through (description, location, recurrence)

### `const.py`
- Update VERSION to "1.0.0"
- Add new constants for expanded date ranges

### `config_flow.py`
- No changes needed

---

## 8. OOB Dashboard Layout

Ship updated example YAML configs for common display sizes.

**27" Landscape (primary target):**
- Top row: Clock (33%) | Weather (33%) | Toggles (33%)
- Bottom row: Grid card (70%) | Agenda card (30%)

**10" Tablet Portrait:**
- Clock + Weather (stacked)
- Toggles (horizontal)
- Grid card (full width, day view)
- Agenda card (below grid)

---

## 9. Out of Scope (Phase 2+)

- Tasks/chores integration
- Photo slideshow idle mode
- Drag-to-create / drag-to-resize events
- Natural language event input
- Meal planning
- Caregiver sharing
- Gamification / chore rewards

---

## 10. Success Criteria

- [ ] All 5 cards render correctly with real HA calendar data
- [ ] 4 views work: day (per-person), week, month, agenda
- [ ] Events can be created from the display
- [ ] Events can be viewed, edited, and deleted
- [ ] Calendar toggles show/hide events across all cards
- [ ] Auto-advance at midnight without manual refresh
- [ ] "Now" indicator visible and accurate
- [ ] Touch-optimized: 48px targets, smooth animations
- [ ] Dark mode fully functional
- [ ] Performance: smooth on Raspberry Pi 4
- [ ] HACS installable (dist/ committed, manifest correct)
- [ ] Visual quality rivals commercial products
