# Week View Redesign + Multi-Participant Event Rendering

**Goal:** Replace the time-grid week view with Skylight-inspired day cards, add diagonal multi-participant color stripes as a reusable event chip component, update agenda and month views to use the same system, and add per-day weather forecasts.

**Architecture:** New `pv-event-chip` web component handles all event rendering (stripes, avatars, organizer fallback, compact mode). Week view becomes a 4-column day-card grid. Agenda view becomes a continuous scroll of day cards with lazy loading. Month view gets deduplication + bigger wrapping pills. Weather forecasts fetched from HA weather entity attributes.

**Tech Stack:** LitElement, CSS Grid, `repeating-linear-gradient` for stripes, HA weather forecast API.

---

## 1. `pv-event-chip` Component

Reusable web component for rendering a single event. Used in week, agenda, and month views (NOT day view — day view keeps per-person columns).

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `event` | `SharedEvent` | Deduplicated event with `shared_calendars` array |
| `hass` | `HomeAssistant` | For avatar lookups |
| `timeFormat` | `'12h' \| '24h'` | Time display format |
| `compact` | `boolean` | Month mode: smaller, no time, no badges |
| `showStripes` | `boolean` | From theme customizer toggle |
| `calendars` | `CalendarConfig[]` | Ordered calendar list (for organizer fallback) |

### Rendering

**Stripes ON + multiple participants:**
- Background: `repeating-linear-gradient(135deg, ...)` with each participant's `color_light` in ~20px diagonal bands
- Left border: 3px solid in organizer color

**Stripes ON + single participant:**
- Background: solid `color_light`
- Left border: 3px solid in calendar's primary color

**Stripes OFF (solid mode):**
- Background: white / theme card background
- Left border: 3px solid in organizer color
- Avatar badges still shown

**Organizer resolution:**
1. Check `event.organizer` field (if HA provides it), match to a calendar config
2. Fallback: first calendar in user's ordered list that appears in `shared_calendars`

**Text:**
- Title: bold, uses `--event-text` contrast variable
- Time: lighter weight, below title (hidden in compact mode)

**Avatar badges (non-compact only):**
- Right-aligned row of 24px circles
- Person avatar photo via `getPersonAvatar()`, fallback to colored initial circle
- Max 4 visible + "+N" overflow badge

**Compact mode (month view):**
- No time display
- No avatar badges
- Title wraps up to 2 lines
- Stripes still apply to background
- Narrower diagonal bands

## 2. Week View — Day Card Layout

Replaces the current time-grid week view entirely.

### Layout

CSS Grid, 4 columns on desktop:
- Row 1: Days 1-4 (e.g., Sun-Wed)
- Row 2: Days 5-7 (e.g., Thu-Sat)

No "Next week" card — users navigate with existing arrow buttons.

### Week Label

Shown above the grid: "February 23 - March 1". Shows both month names if the week spans a month boundary.

### Day Card Structure

```
┌─────────────────────────────────┐
│ Sun 8              ☀️ 78°/62°   │  header: day+date, weather
│ 3 events          + Add event   │  subheader: count, add link
├─────────────────────────────────┤
│ [pv-event-chip: Visit Grandma]  │  events sorted by time
│ [pv-event-chip: Lunch Prep]     │  all-day events first
│ [pv-event-chip: Sleepover]      │
└─────────────────────────────────┘
```

**Header:**
- Bold day name + date number
- Weather icon + high/low from forecast (if available)
- Event count
- "+ Add event" link → opens create dialog with date prefilled

**Today highlight:** Accent background or border on today's card.

**Events:** `deduplicateSharedEvents()` → sorted by time → `pv-event-chip` for each.

### Responsive Breakpoints

| Breakpoint | Columns | Notes |
|------------|---------|-------|
| XL/LG (1024px+) | 4 | Full Skylight-style grid |
| MD (768-1023px) | 2 | Scrollable |
| SM/XS (<768px) | 1 | Vertical scroll (like agenda) |

## 3. Agenda View — Continuous Day Cards

Replaces the current grouped-event list.

### Layout

Single column of day cards, vertically stacked, continuous scroll. Same card structure as week view but always full-width.

### Loading

- Initial: 14 days from today
- "Load more days" banner at bottom (same pattern as day view's next-day footer)
- Each click loads 14 more days
- Past days: today + recent days above, scrollable upward

### Day Card Differences from Week View

- Always 1 column, full width → more room for text
- Relative labels: "Today", "Tomorrow", then day names, then full dates
- Sticky date headers: day card header pins as you scroll
- Empty days shown (header only, no chips) so users see free days
- Weather shown where forecast data available (first 7-10 days)

## 4. Month View Updates

### Deduplication

Run `deduplicateSharedEvents()` on month events. Shared events become a single pill instead of duplicates, freeing space.

### Bigger Pills

- Replace tiny single-line pills with `pv-event-chip` in compact mode
- Text wraps up to 2 lines
- Taller pills (~2x current height)
- Diagonal stripes on multi-participant events

### Overflow

"+N more" stays but threshold adjusts since pills are bigger (2-3 visible per cell, more on large screens).

### Month Name

Add "February 2026" prominently in toolbar/header area above the grid.

### Existing Behavior Preserved

Clicking a day still navigates to day view.

## 5. Theme Customizer — Event Style Toggle

### New Override

```typescript
// In ThemeOverrides
event_style?: 'stripes' | 'solid';
```

### UI in Wizard Customize Section

Pill-button toggle: **"Stripes"** (default) | **"Solid"**

- Stripes: diagonal multi-participant color bands
- Solid: white/bg background, left border in organizer color

### Data Flow

`ThemeOverrides.event_style` → card reads it → passes `showStripes` boolean to views → views pass to `pv-event-chip`.

## 6. Day View Text Size Bump

No customizer option. Just increase defaults:

- `.event-title`: 0.8125rem → 0.9375rem
- `.event-time`: 0.6875rem → 0.8125rem
- Responsive breakpoints scale each tier accordingly (xs/sm/md/lg/xl rules already exist)

## 7. Weather Forecast Data

### Access Method (Frontend-Only)

1. Try `hass.states[weather_entity].attributes.forecast` (array of daily objects)
2. If not available, call `weather.get_forecasts` service (newer HA versions)
3. Each forecast object: `{ datetime, condition, temperature, templow }`

### Usage

- Week view: match day card date to forecast datetime → show weather icon + high/low
- Agenda view: same matching logic
- Days beyond forecast horizon (~7-10 days): weather section omitted from card header

### No Backend Changes

Weather stays frontend-only. No coordinator changes needed.

## 8. Utility Functions

### `getOrganizerColor(event: SharedEvent, calendars: CalendarConfig[]): string`

Resolves the organizer's color for solid-mode left border:
1. Check `event.organizer`, match to calendar config
2. Fallback: first calendar in user's ordered list that appears in `shared_calendars`
3. Single participant: use that calendar's color

### `buildStripeGradient(sharedCalendars: SharedCalendar[]): string`

Returns CSS `repeating-linear-gradient(135deg, ...)` string from participant colors. Bands ~20px wide per participant using `color_light` values.

## Summary of File Changes

| File | Action |
|------|--------|
| `components/pv-event-chip.ts` | **NEW** — reusable event chip component |
| `components/view-week.ts` | **REWRITE** — day-card grid replacing time grid |
| `components/view-agenda.ts` | **REWRITE** — continuous day cards with lazy loading |
| `components/view-month.ts` | **UPDATE** — dedup, bigger pills, pv-event-chip compact |
| `components/view-day.ts` | **UPDATE** — bump text sizes |
| `cards/planavista-calendar-card.ts` | **UPDATE** — pass weather forecast + event_style to views |
| `types.ts` | **UPDATE** — add event_style to ThemeOverrides |
| `styles/themes.ts` | **UPDATE** — event_style override resolution |
| `components/onboarding-wizard.ts` | **UPDATE** — add Event Style toggle |
| `utils/event-utils.ts` | **UPDATE** — add getOrganizerColor, buildStripeGradient |
| `main.ts` | **UPDATE** — import pv-event-chip |
