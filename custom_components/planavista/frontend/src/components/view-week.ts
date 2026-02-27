import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, animationStyles } from '../styles/shared';
import { getStartOfWeek, isToday, getDateKey } from '../utils/date-utils';
import {
  isAllDayEvent,
  getEventsForDateRange,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
import { weatherIcon } from '../utils/weather-icons';

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
  @property({ type: Number }) tick = 0;

  @state() private _forecast: Array<{
    datetime: string;
    condition: string;
    temperature: number;
    templow?: number;
  }> = [];

  private _weatherUnsub?: () => void;
  private _subscribedEntity = '';

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
        flex-shrink: 0;
      }

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
        border-radius: var(--pv-radius-md, 12px);
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
        padding: 0.625rem 0.75rem 0.375rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .day-card-header-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .day-name {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .day-card--today .day-name {
        color: var(--pv-accent);
      }

      .day-meta {
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .add-event-link {
        font-size: 0.6875rem;
        color: var(--pv-accent);
        cursor: pointer;
        font-weight: 500;
        background: none;
        border: none;
        padding: 0;
        font-family: inherit;
      }

      .add-event-link:hover {
        text-decoration: underline;
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
        font-size: 0.75rem;
        font-style: italic;
      }

      /* ═══════════ RESPONSIVE ═══════════ */

      /* MD: tablets — 2 columns */
      @media (max-width: 1023px) {
        .day-grid { grid-template-columns: repeat(2, 1fr); }
      }

      /* SM/XS: phones — 1 column (agenda-like) */
      @media (max-width: 767px) {
        .day-grid {
          grid-template-columns: 1fr;
          gap: 0.375rem;
          padding: 0 0.5rem 0.5rem;
        }
        .week-label { font-size: 0.875rem; padding: 0.5rem 0.75rem 0.375rem; }
        .day-card { min-height: 80px; }
        .day-card-header { padding: 0.5rem 0.625rem 0.25rem; }
        .day-name { font-size: 0.8125rem; }
      }

      /* LG: large screens */
      @media (min-width: 1024px) {
        .week-label { font-size: 1.0625rem; }
        .day-name { font-size: 1rem; }
        .day-card { min-height: 140px; }
      }

      /* XL: wall displays — ~50% larger */
      @media (min-width: 1440px) {
        .week-label { font-size: 1.5rem; }
        .day-name { font-size: 1.375rem; }
        .day-meta { font-size: 0.9375rem; }
        .add-event-link { font-size: 0.9375rem; }
        .day-weather svg { width: 36px; height: 36px; }
        .day-weather-temp { font-size: 0.9375rem; }
        .day-card { min-height: 180px; }
        .day-card-header { padding: 1rem 1.25rem 0.625rem; }
        .day-card-events { padding: 0.75rem; gap: 0.5rem; }
      }
    `,
  ];

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
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };

    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString('en-US', { month: 'long' })} ${first.getDate()} – ${last.getDate()}`;
    }
    return `${first.toLocaleDateString('en-US', opts)} – ${last.toLocaleDateString('en-US', opts)}`;
  }

  updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has('weatherEntity') || changed.has('hass')) {
      this._subscribeWeather();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubWeather();
  }

  private _unsubWeather() {
    if (this._weatherUnsub) {
      this._weatherUnsub();
      this._weatherUnsub = undefined;
    }
    this._subscribedEntity = '';
  }

  private async _subscribeWeather() {
    if (!this.weatherEntity || !this.hass?.connection) {
      this._unsubWeather();
      this._forecast = [];
      return;
    }
    // Only re-subscribe if entity changed
    if (this._subscribedEntity === this.weatherEntity && this._weatherUnsub) return;
    this._unsubWeather();
    this._subscribedEntity = this.weatherEntity;

    try {
      // Try modern HA subscription API (2024.3+)
      this._weatherUnsub = await (this.hass.connection as any).subscribeMessage(
        (msg: any) => {
          this._forecast = msg.forecast || [];
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: this.weatherEntity,
        }
      );
    } catch {
      // Fallback: try legacy attribute
      const entity = this.hass.states[this.weatherEntity];
      if (entity?.attributes?.forecast) {
        this._forecast = entity.attributes.forecast;
      }
    }
  }

  private _getForecastMap(): Map<string, DayForecast> {
    const map = new Map<string, DayForecast>();
    for (const fc of this._forecast) {
      if (!fc.datetime) continue;
      const d = new Date(fc.datetime);
      const key = getDateKey(d);
      map.set(key, {
        condition: fc.condition || '',
        tempHigh: fc.temperature ?? 0,
        tempLow: (fc as any).templow ?? fc.temperature ?? 0,
      });
    }
    return map;
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
    const forecasts = this._getForecastMap();

    return html`
      <div class="week-container">
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
    const dayEvents = allEvents.filter(e => {
      const s = new Date(e.start);
      const en = new Date(e.end);
      return s < dayEnd && en > dayStart;
    }).sort((a, b) => {
      const aAll = isAllDayEvent(a);
      const bAll = isAllDayEvent(b);
      if (aAll && !bAll) return -1;
      if (!aAll && bAll) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    const forecast = forecasts.get(dateKey);
    const dayName = `${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}`;
    const eventCount = dayEvents.length;

    return html`
      <div class="day-card ${today ? 'day-card--today' : ''}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <div class="day-name">${dayName}</div>
            <div class="day-meta">
              <span>${eventCount} event${eventCount !== 1 ? 's' : ''}</span>
              <button class="add-event-link" @click=${() => this._addEvent(day)}>+ Add</button>
            </div>
          </div>
          ${forecast ? html`
            <div class="day-weather">
              ${weatherIcon(forecast.condition as any)}
              <span class="day-weather-temp">${Math.round(forecast.tempHigh)}°/${Math.round(forecast.tempLow)}°</span>
            </div>
          ` : nothing}
        </div>
        ${dayEvents.length > 0 ? html`
          <div class="day-card-events">
            ${dayEvents.map(event => html`
              <pv-event-chip
                .hass=${this.hass}
                .event=${event}
                .calendars=${this.calendars}
                .timeFormat=${this.timeFormat}
                .showStripes=${this.showStripes}
                .tick=${this.tick}
                @event-click=${(e: CustomEvent) => this._onEventClick(e.detail.event)}
              ></pv-event-chip>
            `)}
          </div>
        ` : html`
          <div class="day-card-empty">No events</div>
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
