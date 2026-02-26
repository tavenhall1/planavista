import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig, WeatherCondition } from '../types';
import { baseStyles, animationStyles } from '../styles/shared';
import {
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
import { weatherIcon } from '../utils/weather-icons';

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
        border-radius: var(--pv-radius-md, 12px);
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

      .day-weather svg {
        width: 20px;
        height: 20px;
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
        font-family: inherit;
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
        font-style: italic;
      }

      .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius-md, 12px);
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

      /* ═══════════ RESPONSIVE ═══════════ */

      /* SM/XS: phones */
      @media (max-width: 479px) {
        .day-card { margin: 0 0.5rem 0.5rem; }
        .day-name { font-size: 0.9375rem; }
        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
        .day-subheader { padding: 0.125rem 0.625rem 0.25rem; }
      }

      /* MD+: constrain width */
      @media (min-width: 768px) {
        .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
      }

      /* LG: large screens */
      @media (min-width: 1024px) {
        .day-name { font-size: 1.125rem; }
        .day-card-header { padding: 0.75rem 1rem 0.5rem; }
        .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
      }

      /* XL: wall displays */
      @media (min-width: 1440px) {
        .agenda-container { max-width: 900px; }
        .day-name { font-size: 1.25rem; }
        .day-weather svg { width: 24px; height: 24px; }
        .day-weather-temps { font-size: 0.75rem; }
        .day-subheader { font-size: 0.75rem; }
        .day-events { padding: 0.625rem 0.75rem 0.75rem; gap: 0.5rem; }
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
            ${relativeLabel
              ? html`<span class="day-relative">${relativeLabel}</span>`
              : html`<span class="day-relative">${fullDate}</span>`}
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
                  @event-click=${(e: CustomEvent) => this._onEventClick(e.detail.event)}
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

  private _onEventClick(event: CalendarEvent) {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event },
      bubbles: true,
      composed: true,
    }));
  }
}
