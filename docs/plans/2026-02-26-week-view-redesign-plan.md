# Week View Redesign: Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the time-grid week view with Skylight-inspired day cards, add a reusable multi-participant event chip component, update agenda and month views to use the same system, and add per-day weather forecasts.

**Architecture:** New `pv-event-chip` LitElement component handles all event rendering (diagonal stripes, avatar badges, organizer fallback, stripe/solid toggle). Week view becomes a 4-column responsive day-card grid. Agenda view becomes continuous day cards with lazy "load more" loading. Month view gets SharedEvent deduplication and bigger wrapping pills via the same chip in compact mode.

**Tech Stack:** LitElement + Lit 3.x decorators, CSS Grid, `repeating-linear-gradient`, HA weather forecast attributes, Rollup bundle.

**Key Reference Files:**
- Design doc: `docs/plans/2026-02-26-week-view-redesign.md`
- Types: `custom_components/planavista/frontend/src/types.ts`
- Event utils: `custom_components/planavista/frontend/src/utils/event-utils.ts`
- Theme engine: `custom_components/planavista/frontend/src/styles/themes.ts`
- Shared styles: `custom_components/planavista/frontend/src/styles/shared.ts`
- Main card: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts`
- Wizard: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

**Build command:** `cd custom_components/planavista/frontend && npx rollup -c`
**Shell commands:** Use `mcp__plugin_serena_serena__execute_shell_command` (Bash tool fails with EINVAL on Windows)

---

### Task 1: Add utility functions to event-utils.ts

**Files:**
- Modify: `custom_components/planavista/frontend/src/utils/event-utils.ts`

**Step 1: Add `buildStripeGradient()` function**

Append after the existing exports at the end of the file:

```typescript
/**
 * Build a CSS repeating-linear-gradient for multi-participant diagonal stripes.
 * Uses each participant's color_light for soft pastel bands.
 */
export function buildStripeGradient(
  sharedCalendars: SharedEvent['shared_calendars']
): string {
  if (sharedCalendars.length <= 1) return '';
  const bandWidth = 20; // px per participant stripe
  const stops: string[] = [];
  sharedCalendars.forEach((cal, i) => {
    const color = cal.color_light || cal.color;
    const start = i * bandWidth;
    const end = (i + 1) * bandWidth;
    stops.push(`${color} ${start}px`, `${color} ${end}px`);
  });
  return `repeating-linear-gradient(135deg, ${stops.join(', ')})`;
}

/**
 * Resolve the "organizer" calendar for an event.
 * 1. Try event.organizer field, match to a calendar config
 * 2. Fallback: first calendar in user's ordered list that appears in shared_calendars
 */
export function getOrganizerCalendar(
  event: SharedEvent,
  calendars: CalendarConfig[]
): SharedEvent['shared_calendars'][0] | undefined {
  // Try organizer field
  if ((event as any).organizer) {
    const orgMatch = event.shared_calendars.find(sc =>
      sc.display_name?.toLowerCase() === (event as any).organizer?.toLowerCase() ||
      sc.entity_id === (event as any).organizer
    );
    if (orgMatch) return orgMatch;
  }
  // Fallback: first calendar in user's ordered config list
  for (const cal of calendars) {
    const match = event.shared_calendars.find(sc => sc.entity_id === cal.entity_id);
    if (match) return match;
  }
  return event.shared_calendars[0];
}
```

**Step 2: Add SharedEvent to the exports used by other files**

The `SharedEvent` interface and `deduplicateSharedEvents` are already exported. No changes needed: just note that views will import them.

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds (0 errors). New functions are tree-shaken since nothing imports them yet.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/utils/event-utils.ts
git commit -m "feat: add buildStripeGradient and getOrganizerCalendar utilities"
```

---

### Task 2: Add `event_style` to ThemeOverrides + wire theme engine

**Files:**
- Modify: `custom_components/planavista/frontend/src/types.ts`
- Modify: `custom_components/planavista/frontend/src/styles/themes.ts`

**Step 1: Add event_style to ThemeOverrides in types.ts**

In `types.ts`, add to the `ThemeOverrides` interface after `now_color`:

```typescript
  event_style?: 'stripes' | 'solid';  // multi-participant event rendering mode
```

**Step 2: No theme engine change needed**

Unlike colors/shadows, `event_style` doesn't map to a CSS variable: it's a rendering mode flag read by components directly from `ThemeOverrides`. The card will pass it to views as a property. No changes to `applyThemeWithOverrides()`.

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/types.ts
git commit -m "feat: add event_style to ThemeOverrides type"
```

---

### Task 3: Create `pv-event-chip` component

**Files:**
- Create: `custom_components/planavista/frontend/src/components/pv-event-chip.ts`
- Modify: `custom_components/planavista/frontend/src/main.ts` (add import)

**Step 1: Create the component file**

Create `custom_components/planavista/frontend/src/components/pv-event-chip.ts`:

```typescript
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig } from '../types';
import { SharedEvent, buildStripeGradient, getOrganizerCalendar } from '../utils/event-utils';
import { contrastText } from '../styles/themes';
import { formatTime } from '../utils/date-utils';
import { getPersonAvatar, getPersonName } from '../utils/ha-utils';
import { baseStyles } from '../styles/shared';

@customElement('pv-event-chip')
export class PVEventChip extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) event!: SharedEvent;
  @property({ attribute: false }) calendars: CalendarConfig[] = [];
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) compact = false;
  @property({ type: Boolean }) showStripes = true;

  static styles = [
    baseStyles,
    css`
      :host { display: block; }

      .chip {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.5rem 0.625rem;
        border-radius: 6px;
        border-left: 3px solid var(--chip-border-color);
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease;
        min-height: 0;
        overflow: hidden;
      }

      .chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .chip:active {
        transform: scale(0.98);
      }

      .chip-body {
        flex: 1;
        min-width: 0;
      }

      .chip-title {
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1.3;
        color: var(--chip-text);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip-title--wrap {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
      }

      .chip-title--nowrap {
        white-space: nowrap;
      }

      .chip-time {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--chip-text);
        opacity: 0.8;
        margin-top: 2px;
      }

      .chip-avatars {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 0;
        margin-left: auto;
        padding-top: 2px;
      }

      .chip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .chip-avatar:first-child {
        margin-left: 0;
      }

      .chip-initial {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .chip-initial:first-child {
        margin-left: 0;
      }

      .chip-overflow {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8);
        margin-left: -6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: var(--pv-text-secondary);
        background: var(--pv-card-bg, #f0f0f0);
        flex-shrink: 0;
      }

      /* Compact mode (month view) */
      .chip--compact {
        padding: 0.25rem 0.5rem;
        border-left-width: 2px;
        border-radius: 4px;
      }

      .chip--compact .chip-title {
        font-size: 0.6875rem;
        font-weight: 500;
      }

      /* Responsive: small screens */
      @media (max-width: 479px) {
        .chip { padding: 0.375rem 0.5rem; }
        .chip-title { font-size: 0.8125rem; }
        .chip-time { font-size: 0.6875rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 20px; height: 20px; font-size: 0.5rem; }
      }

      /* Large screens */
      @media (min-width: 1024px) {
        .chip { padding: 0.625rem 0.75rem; }
        .chip-title { font-size: 0.9375rem; }
        .chip-time { font-size: 0.8125rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 28px; height: 28px; }
      }

      /* XL screens */
      @media (min-width: 1440px) {
        .chip { padding: 0.75rem 0.875rem; }
        .chip-title { font-size: 1.0625rem; }
        .chip-time { font-size: 0.875rem; }
        .chip-avatar, .chip-initial, .chip-overflow { width: 32px; height: 32px; font-size: 0.625rem; }
      }
    `,
  ];

  render() {
    const event = this.event;
    if (!event) return nothing;

    const cals = event.shared_calendars || [];
    const isMulti = cals.length > 1;
    const organizer = getOrganizerCalendar(event, this.calendars);
    const borderColor = organizer?.color || event.calendar_color || 'var(--pv-accent)';

    // Background
    let bgStyle: string;
    if (this.showStripes && isMulti) {
      bgStyle = `background: ${buildStripeGradient(cals)}`;
    } else if (this.showStripes) {
      // Single participant: solid pastel
      const bgColor = cals[0]?.color_light || event.calendar_color_light || event.calendar_color;
      bgStyle = `background: ${bgColor}`;
    } else {
      // Solid mode: theme background
      bgStyle = `background: var(--pv-card-bg, #FFFFFF)`;
    }

    // Text contrast
    const textBg = this.showStripes
      ? (cals[0]?.color_light || event.calendar_color_light || event.calendar_color)
      : '#FFFFFF';
    const textColor = this.showStripes ? contrastText(textBg) : 'var(--pv-text)';

    const chipClass = this.compact ? 'chip chip--compact' : 'chip';
    const titleClass = this.compact ? 'chip-title chip-title--wrap' : 'chip-title chip-title--nowrap';

    // Time display
    const startTime = formatTime(event.start, this.timeFormat);
    const isAllDay = !event.start.includes('T') ||
      (new Date(event.end).getTime() - new Date(event.start).getTime() >= 86400000 &&
       event.start.includes('T00:00') && event.end.includes('T00:00'));

    return html`
      <div
        class="${chipClass}"
        style="${bgStyle}; --chip-border-color: ${borderColor}; --chip-text: ${textColor}"
        @click=${this._onClick}
      >
        <div class="chip-body">
          <div class="${titleClass}">${event.summary}</div>
          ${!this.compact ? html`
            <div class="chip-time">
              ${isAllDay ? 'All day' : startTime}${!isAllDay && event.end ? ` - ${formatTime(event.end, this.timeFormat)}` : ''}
            </div>
          ` : nothing}
        </div>
        ${!this.compact && cals.length > 0 ? this._renderAvatars(cals) : nothing}
      </div>
    `;
  }

  private _renderAvatars(cals: SharedEvent['shared_calendars']) {
    const maxVisible = 4;
    const visible = cals.slice(0, maxVisible);
    const overflow = cals.length - maxVisible;

    return html`
      <div class="chip-avatars">
        ${visible.map(cal => {
          const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
          const name = cal.person_entity
            ? getPersonName(this.hass, cal.person_entity)
            : cal.display_name || '?';
          if (avatar) {
            return html`<img class="chip-avatar" src="${avatar}" alt="${name}" />`;
          }
          return html`<div class="chip-initial" style="background: ${cal.color}">${name[0]?.toUpperCase() || '?'}</div>`;
        })}
        ${overflow > 0 ? html`<div class="chip-overflow">+${overflow}</div>` : nothing}
      </div>
    `;
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event: this.event },
      bubbles: true,
      composed: true,
    }));
  }
}
```

**Step 2: Import in main.ts**

In `custom_components/planavista/frontend/src/main.ts`, add after the existing imports:

```typescript
import './components/pv-event-chip';
```

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds. Component registered but not yet used by any view.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/pv-event-chip.ts custom_components/planavista/frontend/src/main.ts
git commit -m "feat: create pv-event-chip component with stripe/solid modes and avatar badges"
```

---

### Task 4: Add Event Style toggle to theme customizer wizard

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/onboarding-wizard.ts`

**Step 1: Add the Event Style UI**

In the wizard's customize section, add after the "Now Indicator" group (before the Reset button). Find the `<!-- Reset -->` comment and insert before it:

```html
          <!-- Event Style -->
          <div class="customize-group">
            <label class="pv-label">Event Style</label>
            <div class="pill-group">
              ${(['stripes', 'solid'] as const).map(style => html`
                <button
                  class="pill-btn ${(ov.event_style || 'stripes') === style ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('event_style', style)}
                >${style === 'stripes' ? 'Stripes' : 'Solid'}</button>
              `)}
            </div>
          </div>
```

**Step 2: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds. Toggle visible in settings > customize section.

**Step 3: Commit**

```bash
git add custom_components/planavista/frontend/src/components/onboarding-wizard.ts
git commit -m "feat: add Event Style (stripes/solid) toggle to theme customizer"
```

---

### Task 5: Rewrite week view as day-card grid

**Files:**
- Rewrite: `custom_components/planavista/frontend/src/components/view-week.ts`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts` (pass new props)

**This is the largest task.** The entire view-week.ts is replaced.

**Step 1: Update the card to pass new props to week view**

In `planavista-calendar-card.ts`, find the `_renderView` method's `case 'week':` block and update it:

```typescript
      case 'week':
        return html`<pv-view-week
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .firstDay=${firstDay}
          .weatherEntity=${display?.weather_entity || ''}
          .showStripes=${(display?.theme_overrides?.event_style || 'stripes') === 'stripes'}
        ></pv-view-week>`;
```

**Step 2: Rewrite view-week.ts**

Replace the entire contents of `custom_components/planavista/frontend/src/components/view-week.ts` with:

```typescript
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, animationStyles } from '../styles/shared';
import { formatTime, getStartOfWeek, isToday, formatDate, getDateKey } from '../utils/date-utils';
import {
  isAllDayEvent,
  getEventsForDateRange,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
  groupEventsByDate,
} from '../utils/event-utils';
import { weatherIcon, WeatherCondition } from '../utils/weather-icons';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayForecast {
  condition: string;
  tempHigh: number;
  tempLow: number;
}

@customElement('pv-view-week')
export class PVViewWeek extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) firstDay: 'monday' | 'sunday' = 'sunday';
  @property({ attribute: false }) weatherEntity: string = '';
  @property({ type: Boolean }) showStripes: boolean = true;

  static styles = [
    baseStyles,
    animationStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: auto;
      }

      .week-label {
        font-size: 1rem;
        font-weight: 600;
        color: var(--pv-text);
        padding: 0.75rem 1rem 0.5rem;
      }

      .day-cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        padding: 0 0.75rem 0.75rem;
        flex: 1;
      }

      /* Day card */
      .day-card {
        display: flex;
        flex-direction: column;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius, 12px);
        border: 1px solid var(--pv-border-subtle);
        overflow: hidden;
        min-height: 120px;
      }

      .day-card--today {
        border-color: var(--pv-accent);
        box-shadow: 0 0 0 1px var(--pv-accent);
      }

      .day-card-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 0.625rem 0.75rem 0.375rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .day-card-header-left {
        display: flex;
        align-items: baseline;
        gap: 0.375rem;
      }

      .day-name {
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--pv-text);
      }

      .day-name--today {
        color: var(--pv-accent);
      }

      .day-weather {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--pv-text-secondary);
      }

      .day-weather-temps {
        font-weight: 500;
      }

      .day-subheader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25rem 0.75rem 0.375rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
      }

      .add-event-link {
        color: var(--pv-accent);
        cursor: pointer;
        font-weight: 500;
        font-size: 0.6875rem;
        background: none;
        border: none;
        padding: 0;
      }

      .add-event-link:hover {
        text-decoration: underline;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem 0.5rem;
        flex: 1;
      }

      .empty-day {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pv-text-muted);
        font-size: 0.75rem;
        padding: 1rem;
        flex: 1;
      }

      /* Responsive: 2 columns on tablets */
      @media (min-width: 768px) and (max-width: 1023px) {
        .day-cards-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* Responsive: 1 column on phones */
      @media (max-width: 767px) {
        .day-cards-grid { grid-template-columns: 1fr; gap: 0.5rem; padding: 0 0.5rem 0.5rem; }
        .week-label { padding: 0.5rem 0.75rem 0.375rem; font-size: 0.9375rem; }
        .day-name { font-size: 0.9375rem; }
      }

      /* Large screens */
      @media (min-width: 1024px) {
        .day-cards-grid { gap: 0.875rem; }
        .day-name { font-size: 1.125rem; }
      }

      /* XL screens */
      @media (min-width: 1440px) {
        .day-cards-grid { gap: 1rem; padding: 0 1rem 1rem; }
        .week-label { font-size: 1.125rem; }
        .day-name { font-size: 1.25rem; }
      }
    `,
  ];

  render() {
    const weekStart = getStartOfWeek(this.currentDate, this.firstDay);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    // Filter and deduplicate events
    const weekEnd = new Date(days[6]);
    weekEnd.setDate(weekEnd.getDate() + 1);
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const weekEvents = getEventsForDateRange(visible, weekStart, weekEnd);
    const sharedEvents = deduplicateSharedEvents(weekEvents, this.calendars);
    const grouped = groupEventsByDate(sharedEvents);

    // Weather forecast
    const forecast = this._getForecastMap();

    // Week label
    const weekLabel = this._buildWeekLabel(days[0], days[6]);

    return html`
      <div class="week-container">
        <div class="week-label">${weekLabel}</div>
        <div class="day-cards-grid">
          ${days.map(day => this._renderDayCard(day, grouped, forecast))}
        </div>
      </div>
    `;
  }

  private _renderDayCard(
    day: Date,
    grouped: Map<string, CalendarEvent[]>,
    forecast: Map<string, DayForecast>,
  ) {
    const key = getDateKey(day);
    const events = (grouped.get(key) || []) as SharedEvent[];
    const today = isToday(day);
    const dayForecast = forecast.get(key);

    // Sort: all-day first, then by start time
    const sorted = [...events].sort((a, b) => {
      const aAllDay = isAllDayEvent(a);
      const bAllDay = isAllDayEvent(b);
      if (aAllDay && !bAllDay) return -1;
      if (!aAllDay && bAllDay) return 1;
      return a.start.localeCompare(b.start);
    });

    return html`
      <div class="day-card ${today ? 'day-card--today' : ''}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${today ? 'day-name--today' : ''}">
              ${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}
            </span>
          </div>
          ${dayForecast ? html`
            <div class="day-weather">
              ${weatherIcon(dayForecast.condition as WeatherCondition, 20)}
              <span class="day-weather-temps">${Math.round(dayForecast.tempHigh)}°/${Math.round(dayForecast.tempLow)}°</span>
            </div>
          ` : nothing}
        </div>
        <div class="day-subheader">
          <span>${sorted.length} event${sorted.length !== 1 ? 's' : ''}</span>
          <button class="add-event-link" @click=${() => this._addEvent(day)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${sorted.length > 0
            ? sorted.map(event => html`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${event}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                ></pv-event-chip>
              `)
            : html`<div class="empty-day">No events</div>`
          }
        </div>
      </div>
    `;
  }

  private _getForecastMap(): Map<string, DayForecast> {
    const map = new Map<string, DayForecast>();
    if (!this.weatherEntity || !this.hass) return map;

    const entity = this.hass.states[this.weatherEntity];
    if (!entity) return map;

    const forecasts = entity.attributes?.forecast as Array<{
      datetime: string;
      condition: string;
      temperature: number;
      templow: number;
    }> | undefined;

    if (!forecasts) return map;

    for (const f of forecasts) {
      const date = new Date(f.datetime);
      const key = getDateKey(date);
      map.set(key, {
        condition: f.condition,
        tempHigh: f.temperature,
        tempLow: f.templow,
      });
    }
    return map;
  }

  private _buildWeekLabel(start: Date, end: Date): string {
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear !== endYear) {
      return `${startMonth} ${start.getDate()}, ${startYear} – ${endMonth} ${end.getDate()}, ${endYear}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} – ${end.getDate()}`;
  }

  private _addEvent(day: Date) {
    this.dispatchEvent(new CustomEvent('create-event', {
      detail: { date: day },
      bubbles: true,
      composed: true,
    }));
  }

  private _onEventClick(e: CustomEvent) {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }
}
```

**Step 3: Wire the create-event handler in the card**

In `planavista-calendar-card.ts`, find the `.pvc-body` div's event listeners (around the `@event-click` line) and add:

```typescript
          @create-event=${this._onCreateEvent}
```

Then add the handler method in the event handlers section:

```typescript
  private _onCreateEvent(e: CustomEvent) {
    const date = e.detail?.date;
    if (date) {
      this._pv.state.openCreateDialog({ start: date.toISOString(), end: date.toISOString() });
    }
  }
```

**Step 4: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds. Week view now shows as day cards.

**Step 5: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-week.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: rewrite week view as Skylight-style day-card grid with weather forecasts"
```

---

### Task 6: Rewrite agenda view as continuous day cards

**Files:**
- Rewrite: `custom_components/planavista/frontend/src/components/view-agenda.ts`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts` (pass new props)

**Step 1: Update card to pass new props to agenda view**

In `planavista-calendar-card.ts`, find the `case 'agenda':` block in `_renderView` and update it:

```typescript
      case 'agenda':
        return html`<pv-view-agenda
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .weatherEntity=${display?.weather_entity || ''}
          .showStripes=${(display?.theme_overrides?.event_style || 'stripes') === 'stripes'}
        ></pv-view-agenda>`;
```

**Step 2: Rewrite view-agenda.ts**

Replace the entire contents of `custom_components/planavista/frontend/src/components/view-agenda.ts` with:

```typescript
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, animationStyles } from '../styles/shared';
import {
  formatTime,
  formatDate,
  getRelativeLabel,
  getDateKey,
  isToday,
} from '../utils/date-utils';
import {
  isAllDayEvent,
  groupEventsByDate,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
import { weatherIcon, WeatherCondition } from '../utils/weather-icons';

const DAYS_PER_PAGE = 14;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayForecast {
  condition: string;
  tempHigh: number;
  tempLow: number;
}

@customElement('pv-view-agenda')
export class PVViewAgenda extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) weatherEntity: string = '';
  @property({ type: Boolean }) showStripes: boolean = true;

  @state() private _daysLoaded = DAYS_PER_PAGE;

  static styles = [
    baseStyles,
    animationStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        scroll-behavior: smooth;
      }

      .day-card {
        display: flex;
        flex-direction: column;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius, 12px);
        border: 1px solid var(--pv-border-subtle);
        overflow: hidden;
      }

      .day-card--today {
        border-color: var(--pv-accent);
        box-shadow: 0 0 0 1px var(--pv-accent);
      }

      .day-card-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 0.625rem 0.75rem 0.375rem;
        border-bottom: 1px solid var(--pv-border-subtle);
        position: sticky;
        top: 0;
        background: var(--pv-card-bg, #fff);
        z-index: 2;
      }

      .day-card-header-left {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
      }

      .day-name {
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--pv-text);
      }

      .day-name--today {
        color: var(--pv-accent);
      }

      .day-relative {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 400;
      }

      .day-weather {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--pv-text-secondary);
      }

      .day-weather-temps {
        font-weight: 500;
      }

      .day-subheader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.25rem 0.75rem 0.375rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
      }

      .add-event-link {
        color: var(--pv-accent);
        cursor: pointer;
        font-weight: 500;
        font-size: 0.6875rem;
        background: none;
        border: none;
        padding: 0;
      }

      .add-event-link:hover {
        text-decoration: underline;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem 0.5rem;
      }

      .empty-day {
        color: var(--pv-text-muted);
        font-size: 0.75rem;
        padding: 0.75rem;
        text-align: center;
      }

      .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius, 12px);
        border: 1px dashed var(--pv-border);
        color: var(--pv-accent);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
        transition: background 150ms ease;
      }

      .load-more:hover {
        background: var(--pv-today-bg, rgba(99, 102, 241, 0.06));
      }

      /* Responsive: phones */
      @media (max-width: 479px) {
        .day-card { margin: 0 0.5rem 0.5rem; }
        .day-name { font-size: 0.9375rem; }
      }

      /* Large screens */
      @media (min-width: 1024px) {
        .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
        .day-name { font-size: 1.125rem; }
      }

      /* XL screens */
      @media (min-width: 1440px) {
        .agenda-container { max-width: 900px; }
        .day-name { font-size: 1.25rem; }
      }
    `,
  ];

  render() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build day list: today + N days forward
    const days: Date[] = [];
    for (let i = 0; i < this._daysLoaded; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    // Filter and deduplicate
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const sharedEvents = deduplicateSharedEvents(visible, this.calendars);
    const grouped = groupEventsByDate(sharedEvents);

    // Weather forecast
    const forecast = this._getForecastMap();

    return html`
      <div class="agenda-container">
        ${days.map(day => this._renderDayCard(day, grouped, forecast))}
        <div class="load-more" @click=${this._loadMore}>
          Load more days
        </div>
      </div>
    `;
  }

  private _renderDayCard(
    day: Date,
    grouped: Map<string, CalendarEvent[]>,
    forecast: Map<string, DayForecast>,
  ) {
    const key = getDateKey(day);
    const events = (grouped.get(key) || []) as SharedEvent[];
    const today = isToday(day);
    const dayForecast = forecast.get(key);
    const relativeLabel = getRelativeLabel(day);
    const fullDate = formatDate(day, 'long');

    // Sort: all-day first, then by start time
    const sorted = [...events].sort((a, b) => {
      const aAllDay = isAllDayEvent(a);
      const bAllDay = isAllDayEvent(b);
      if (aAllDay && !bAllDay) return -1;
      if (!aAllDay && bAllDay) return 1;
      return a.start.localeCompare(b.start);
    });

    return html`
      <div class="day-card ${today ? 'day-card--today' : ''}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${today ? 'day-name--today' : ''}">
              ${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}
            </span>
            ${relativeLabel ? html`<span class="day-relative">${relativeLabel}</span>` : html`<span class="day-relative">${fullDate}</span>`}
          </div>
          ${dayForecast ? html`
            <div class="day-weather">
              ${weatherIcon(dayForecast.condition as WeatherCondition, 20)}
              <span class="day-weather-temps">${Math.round(dayForecast.tempHigh)}°/${Math.round(dayForecast.tempLow)}°</span>
            </div>
          ` : nothing}
        </div>
        <div class="day-subheader">
          <span>${sorted.length} event${sorted.length !== 1 ? 's' : ''}</span>
          <button class="add-event-link" @click=${() => this._addEvent(day)}>+ Add event</button>
        </div>
        <div class="day-events">
          ${sorted.length > 0
            ? sorted.map(event => html`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${event}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                ></pv-event-chip>
              `)
            : html`<div class="empty-day">No events</div>`
          }
        </div>
      </div>
    `;
  }

  private _getForecastMap(): Map<string, DayForecast> {
    const map = new Map<string, DayForecast>();
    if (!this.weatherEntity || !this.hass) return map;

    const entity = this.hass.states[this.weatherEntity];
    if (!entity) return map;

    const forecasts = entity.attributes?.forecast as Array<{
      datetime: string;
      condition: string;
      temperature: number;
      templow: number;
    }> | undefined;

    if (!forecasts) return map;

    for (const f of forecasts) {
      const date = new Date(f.datetime);
      const key = getDateKey(date);
      map.set(key, {
        condition: f.condition,
        tempHigh: f.temperature,
        tempLow: f.templow,
      });
    }
    return map;
  }

  private _loadMore() {
    this._daysLoaded += DAYS_PER_PAGE;
  }

  private _addEvent(day: Date) {
    this.dispatchEvent(new CustomEvent('create-event', {
      detail: { date: day },
      bubbles: true,
      composed: true,
    }));
  }
}
```

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds. Agenda view shows continuous day cards.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-agenda.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: rewrite agenda view as continuous day cards with lazy loading and weather"
```

---

### Task 7: Update month view: deduplication, bigger pills, month name

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-month.ts`
- Modify: `custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts` (pass showStripes)

**Step 1: Update card to pass showStripes to month view**

In `planavista-calendar-card.ts`, update the `case 'month':` block:

```typescript
      case 'month':
        return html`<pv-view-month
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .firstDay=${firstDay}
          .timeFormat=${timeFormat}
          .showStripes=${(display?.theme_overrides?.event_style || 'stripes') === 'stripes'}
        ></pv-view-month>`;
```

**Step 2: Update view-month.ts**

Add new imports at top of file:

```typescript
import { deduplicateSharedEvents, SharedEvent } from '../utils/event-utils';
import { formatTime } from '../utils/date-utils';
```

Add new properties to the class:

```typescript
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) showStripes: boolean = true;
```

In the render method, add deduplication after filtering visible events. Replace the event pill rendering to use `pv-event-chip` in compact mode.

Update the `_renderDayCell` method to:
1. Deduplicate events for the cell using `deduplicateSharedEvents()`
2. Render each event as `<pv-event-chip .event=${e} .compact=${true} .showStripes=${this.showStripes} ...>`
3. Increase `MAX_VISIBLE_EVENTS` from 3 to match bigger pills (set to 3 or let CSS handle overflow)

Update the `.month-event-pill` CSS to be taller:
- Remove the old `.month-event-pill` styles
- Add styles for the chip in compact mode within the month grid cell

Add the month name to the render output above the weekday headers:

```html
<div class="month-name">${this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
```

Add CSS for `.month-name`:

```css
.month-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--pv-text);
  padding: 0.5rem 0.75rem;
  text-align: center;
}
```

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds. Month view shows deduped events with pv-event-chip in compact mode and month name header.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-month.ts custom_components/planavista/frontend/src/cards/planavista-calendar-card.ts
git commit -m "feat: update month view, deduplicate shared events, bigger pills, add month name"
```

---

### Task 8: Bump day view event text sizes

**Files:**
- Modify: `custom_components/planavista/frontend/src/components/view-day.ts`

**Step 1: Increase base event text sizes**

Find the `.positioned-event .event-title` rule and change `font-size: 0.8125rem` → `font-size: 0.9375rem`.

Find `.positioned-event .event-time` rule and change `font-size: 0.6875rem` → `font-size: 0.8125rem`.

**Step 2: Update responsive breakpoints**

Find each responsive media query block and bump the event text sizes proportionally:

- **xs (≤479px)**: `.event-title` 0.6875rem → 0.75rem
- **sm (480-767px)**: `.event-title` 0.75rem → 0.8125rem
- **lg (1024-1439px)**: `.event-title` 1rem → 1.0625rem, `.event-time` 0.8125rem → 0.875rem
- **xl (1440px+)**: `.event-title` 1.125rem → 1.1875rem, `.event-time` 0.9375rem → 1rem

**Step 3: Build and verify**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add custom_components/planavista/frontend/src/components/view-day.ts
git commit -m "feat: bump day view event text sizes for readability"
```

---

### Task 9: Final build, integration test, and push

**Files:**
- All modified files from Tasks 1-8
- Bundle: `custom_components/planavista/frontend/dist/planavista-cards.js`

**Step 1: Full rebuild**

Run: `cd custom_components/planavista/frontend && npx rollup -c`
Expected: Build succeeds with no errors.

**Step 2: Verify bundle**

Check bundle exists and has reasonable size:
Run: `ls -la custom_components/planavista/frontend/dist/planavista-cards.js`
Expected: File exists, size ~150-180KB (slightly larger than previous 126KB due to new component).

**Step 3: Commit bundle**

```bash
git add custom_components/planavista/frontend/dist/planavista-cards.js
git commit -m "chore: rebuild production bundle with week view redesign"
```

**Step 4: Push**

```bash
git push origin main
```

---

## Task Dependency Order

```
Task 1 (utilities) ─┐
Task 2 (types)      ├─→ Task 3 (pv-event-chip) ─→ Task 4 (wizard toggle)
                    │                             │
                    └─────────────────────────────┼─→ Task 5 (week view rewrite)
                                                  ├─→ Task 6 (agenda view rewrite)
                                                  ├─→ Task 7 (month view update)
                                                  └─→ Task 8 (day view text bump)
                                                        │
                                                        └─→ Task 9 (build + push)
```

Tasks 1-3 are sequential. Tasks 5-8 can be done in any order after Task 3. Task 4 can be done anytime after Task 2. Task 9 is always last.
