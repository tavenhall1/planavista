import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../../../types';
import { baseStyles, animationStyles } from '../../../styles/shared';
import type { Layout } from '../../../core/layout';
import { getStartOfWeek, isToday, getDateKey , weekRangeLabel } from '../../../utils/date-utils';
import {
  compareEventsForDisplay,
  getEventsForDateRange,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
import { newEventLabel } from '../view-words';
import { weatherIcon } from '../../../utils/weather-icons';
import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
import { ref } from 'lit/directives/ref.js';
import { ScrollReporter } from '../../../core/content-scroll';

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class PVViewWeek extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) firstDay: 'monday' | 'sunday' = 'sunday';
  /** The card's daily forecast (one subscription per card, in the shell). */
  @property({ attribute: false }) forecast: ForecastEntry[] = [];
  @property({ type: Boolean }) showStripes: boolean = true;
  @property({ type: Number }) tick = 0;
  /** The card's layout: four days across in landscape, two in portrait, one on a phone (spec 12.3). */
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();


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

      /* Headings and numbers in the rounded face (spec 11.2). */
      .week-label {
        font-family: var(--pv-font-heading, inherit);
        font-size: 1.125rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
        padding: 0.75rem 1rem 0.5rem;
        flex-shrink: 0;
      }

      /* Days across follow the card's own shape, not the window's (spec 12.1). */
      :host([layout='landscape']) .day-grid { grid-template-columns: repeat(4, 1fr); }
      :host([layout='portrait']) .day-grid { grid-template-columns: repeat(2, 1fr); }
      :host([layout='phone']) .day-grid { grid-template-columns: 1fr; }

      .day-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        padding: 0 0.75rem 0.75rem;
        flex: 1;
      }

      /* ── Day Card ── */
      .day-card {
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border-subtle);
        border-radius: var(--pv-radius, 12px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 120px;
      }

      .day-card--today {
        border-color: var(--pv-accent);
        box-shadow: 0 0 0 1px var(--pv-accent);
      }

      .day-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        padding: 0 0 0 0.75rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .day-name {
        font-family: var(--pv-font-heading, inherit);
        font-size: 0.9375rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
      }

      .day-card--today .day-name {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-card-tools {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      /* New event on that day: a 48 px target (spec 11.8). */
      .add-btn {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent));
        cursor: pointer;
        --mdc-icon-size: 22px;
      }

      .add-btn:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .add-btn:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -4px;
      }

      /* A dimmed shared screen (0.12.0): the forecast's colors by the level. */
      .day-weather svg {
        filter: var(--pv-media-filter, none);
      }

      .day-weather {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }

      .day-weather svg {
        width: 22px;
        height: 22px;
      }

      .day-weather-temp {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary);
        white-space: nowrap;
      }

      .day-card-events {
        flex: 1;
        padding: 0.375rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        overflow: hidden;
      }

      .day-card-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
        color: var(--pv-text-muted);
        font-size: 0.875rem;
      }

      /* ═══════════ RESPONSIVE ═══════════ */

      /* SM/XS: small screens, tighter cards */
      @container pv-calendar (max-width: 767px) {
        .day-grid {
          gap: 0.375rem;
          padding: 0 0.5rem 0.5rem;
        }
        .week-label { font-size: 0.875rem; padding: 0.5rem 0.75rem 0.375rem; }
        .day-card { min-height: 80px; }
        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
        .day-name { font-size: 0.8125rem; }
      }

      /* LG: large screens */
      @container pv-calendar (min-width: 1024px) {
        .week-label { font-size: 1.0625rem; }
        .day-name { font-size: 1rem; }
        .day-card { min-height: 140px; }
      }

      /* XL: wall displays, ~50% larger */
      @container pv-calendar (min-width: 1440px) {
        .week-label { font-size: 1.5rem; }
        .day-name { font-size: 1.375rem; }
        .day-weather svg { width: 36px; height: 36px; }
        .day-weather-temp { font-size: 0.9375rem; }
        .day-card { min-height: 180px; }
        .day-card-header { padding: 1rem 1.25rem 0.625rem; }
        .day-card-events { padding: 0.75rem; gap: 0.5rem; }
      }
    `,
  ];

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    // The arrows and Today move the week: it opens at its top, as Agenda does.
    const before = changed.get('currentDate') as Date | undefined;
    if (before && getDateKey(getStartOfWeek(before, this.firstDay)) !== getDateKey(getStartOfWeek(this.currentDate, this.firstDay))) {
      this.renderRoot.querySelector('.week-container')?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  private _getWeekDays(): Date[] {
    const start = getStartOfWeek(this.currentDate, this.firstDay);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  private _getWeekLabel(days: Date[]): string {
    const first = days[0];
    const last = days[6];
    return weekRangeLabel(first, last);
  }

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const days = this._getWeekDays();
    const weekStart = new Date(days[0]);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(days[6]);
    weekEnd.setHours(23, 59, 59, 999);
    const weekEvents = getEventsForDateRange(visible, weekStart, weekEnd);
    const deduped = deduplicateSharedEvents(weekEvents, this.calendars);
    const forecasts = buildForecastMap(this.forecast);

    return html`
      <div class="week-container" ${ref(this._scroll.attach)}>
        <div class="week-label">${this._getWeekLabel(days)}</div>
        <div class="day-grid">
          ${days.map(day => this._renderDayCard(day, deduped, forecasts))}
        </div>
      </div>
    `;
  }

  private _renderDayCard(day: Date, allEvents: SharedEvent[], forecasts: Map<string, DayForecast>) {
    const today = isToday(day);
    const dateKey = getDateKey(day);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Get events for this day, sort all-day first then by start time
    const dayEvents = getEventsForDateRange(allEvents, dayStart, dayEnd).sort(compareEventsForDisplay);

    const forecast = forecasts.get(dateKey);
    const dayName = `${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}`;

    return html`
      <div class="day-card ${today ? 'day-card--today' : ''}">
        <div class="day-card-header">
          <div class="day-name">${dayName}</div>
          <div class="day-card-tools">
            ${forecast ? html`
              <div class="day-weather">
                ${weatherIcon(forecast.condition as any)}
                <span class="day-weather-temp">${Math.round(forecast.tempHigh)}°/${Math.round(forecast.tempLow)}°</span>
              </div>
            ` : nothing}
            <button class="add-btn" type="button" aria-label=${newEventLabel(day, new Date())} title="New event"
              @click=${() => this._addEvent(day)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
        ${dayEvents.length > 0 ? html`
          <div class="day-card-events">
            ${dayEvents.map(event => html`
              <pv-event-chip
                .hass=${this.hass}
                .event=${event}
                .day=${day}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                .tick=${this.tick}
                @event-click=${(e: CustomEvent) => { e.stopPropagation(); this._onEventClick(e.detail.event); }}
              ></pv-event-chip>
            `)}
          </div>
        ` : html`
          <div class="day-card-empty">Nothing planned</div>
        `}
      </div>
    `;
  }

  private _addEvent(day: Date) {
    this.dispatchEvent(new CustomEvent('create-event', {
      detail: { date: day },
      bubbles: true,
      composed: true,
    }));
  }

  private _onEventClick(event: CalendarEvent) {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event },
      bubbles: true,
      composed: true,
    }));
  }
}

defineElement('pv-view-week', PVViewWeek);
