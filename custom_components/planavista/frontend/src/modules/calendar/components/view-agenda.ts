import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig, WeatherCondition } from '../../../types';
import { baseStyles, animationStyles, buttonStyles } from '../../../styles/shared';
import { statusStyles } from '../../../styles/status';
import type { Layout } from '../../../core/layout';
import { getDateKey, isToday } from '../../../utils/date-utils';
import {
  compareEventsForDisplay,
  groupEventsByDate,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
import { weatherIcon } from '../../../utils/weather-icons';
import { DayForecast, ForecastEntry, buildForecastMap } from '../../../utils/weather-subscription';
import { dayOfStatus, eventStatus } from '../event-words';
import { agendaEmpty, agendaNote, newEventLabel } from '../view-words';
import { ref } from 'lit/directives/ref.js';
import { ScrollReporter } from '../../../core/content-scroll';

const DAYS_PER_PAGE = 14;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class PVViewAgenda extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  /** The card's daily forecast (one subscription per card, in the shell). */
  @property({ attribute: false }) forecast: ForecastEntry[] = [];
  @property({ type: Boolean }) showStripes: boolean = true;
  @property({ type: Number }) tick = 0;
  /** The card's layout (spec 12.1). */
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();

  @state() private _daysLoaded = DAYS_PER_PAGE;

  static styles = [
    baseStyles,
    animationStyles,
    buttonStyles,
    statusStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        scroll-behavior: smooth;
        scrollbar-width: none;
      }

      .agenda-container::-webkit-scrollbar {
        display: none;
      }

      .day-card {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
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
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
        padding: 0 0 0 0.75rem;
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

      /* Headings and numbers in the rounded face (spec 11.2). */
      .day-name {
        font-family: var(--pv-font-heading, inherit);
        font-size: 1.0625rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: var(--pv-text);
      }

      .day-name--today {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .day-relative {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
        font-weight: 600;
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

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.375rem 0.5rem 0.5rem;
      }

      .empty-day {
        color: var(--pv-text-muted);
        font-size: 0.875rem;
        padding: 0.75rem;
        text-align: center;
      }

      .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        gap: 0.5rem;
        min-height: 48px;
        padding: 1rem;
        font-family: inherit;
        margin: 0 0.75rem 0.75rem;
        background: var(--pv-card-bg, #fff);
        border-radius: var(--pv-radius-md, 12px);
        border: 1px dashed var(--pv-border);
        color: var(--pv-accent-ink, var(--pv-accent));
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
      @container pv-calendar (max-width: 479px) {
        .day-card { margin: 0 0.5rem 0.5rem; }
        .day-name { font-size: 0.9375rem; }
      }

      /* MD+: constrain width */
      @container pv-calendar (min-width: 768px) {
        .agenda-container { max-width: 800px; margin: 0 auto; width: 100%; }
      }

      /* LG: large screens */
      @container pv-calendar (min-width: 1024px) {
        .day-name { font-size: 1.125rem; }
        .day-events { padding: 0.5rem 0.625rem 0.625rem; gap: 0.5rem; }
      }

      /* XL: wall displays, ~50% larger */
      @container pv-calendar (min-width: 1440px) {
        .agenda-container { max-width: 960px; }
        .day-name { font-size: 1.5rem; }
        .day-relative { font-size: 1rem; }
        .day-weather svg { width: 32px; height: 32px; }
        .day-weather-temps { font-size: 0.9375rem; }
        .day-events { padding: 0.75rem 1rem 1rem; gap: 0.625rem; }
        .load-more { font-size: 1.125rem; padding: 1.25rem; }
      }
    `,
  ];

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    // Previous, Next, and Today move where the list starts: it opens at that day, not partway down.
    // Instant, since the view's slide is the motion (and the list scrolls smoothly otherwise).
    const before = changed.get('currentDate') as Date | undefined;
    if (before && getDateKey(before) !== getDateKey(this.currentDate)) {
      this.renderRoot.querySelector('.agenda-container')?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  render() {
    // The list starts on the day shown, so Previous, Next, and Today move it.
    const start = new Date(this.currentDate);
    start.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < this._daysLoaded; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    // Filter and deduplicate
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const sharedEvents = deduplicateSharedEvents(visible, this.calendars);
    const grouped = groupEventsByDate(sharedEvents);

    // Weather forecast
    const forecast = buildForecastMap(this.forecast);

    // Nothing in the whole range: one designed state, not a stack of empty days (spec 11.6).
    if (days.every(day => !(grouped.get(getDateKey(day))?.length))) {
      const now = new Date(this.tick ? this.tick * 60000 : Date.now());
      const empty = agendaEmpty(days[0], this._daysLoaded, new Date(now.getFullYear(), now.getMonth(), now.getDate()));
      return html`
        <div class="agenda-container" ${ref(this._scroll.attach)}>
          <div class="state">
            <div class="art" aria-hidden="true">🗓️</div>
            <h2>${empty.heading}</h2>
            <p>${empty.body}</p>
            <div class="buttons">
              <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._addEvent(days[0])}>New event</button>
              <button class="pv-btn pv-btn-secondary" type="button" @click=${this._loadMore}>Look further ahead</button>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="agenda-container" ${ref(this._scroll.attach)}>
        ${days.map((day, i) => this._renderDayCard(day, grouped, forecast, i === 0))}
        <button class="load-more" type="button" @click=${this._loadMore}>Show more days</button>
      </div>
    `;
  }

  private _renderDayCard(
    day: Date,
    grouped: Map<string, CalendarEvent[]>,
    forecast: Map<string, DayForecast>,
    first: boolean,
  ) {
    const key = getDateKey(day);
    const events = (grouped.get(key) || []) as SharedEvent[];
    const today = isToday(day);
    const dayForecast = forecast.get(key);
    const now = new Date(this.tick ? this.tick * 60000 : Date.now());
    const note = agendaNote(day, new Date(now.getFullYear(), now.getMonth(), now.getDate()), first);

    // Sort: all-day first, then by start time
    const sorted = [...events].sort(compareEventsForDisplay);

    return html`
      <div class="day-card ${today ? 'day-card--today' : ''}">
        <div class="day-card-header">
          <div class="day-card-header-left">
            <span class="day-name ${today ? 'day-name--today' : ''}">
              ${WEEKDAY_SHORT[day.getDay()]} ${day.getDate()}
            </span>
            ${note ? html`<span class="day-relative">${note}</span>` : nothing}
          </div>
          <div class="day-card-tools">
            ${dayForecast ? html`
              <div class="day-weather">
                ${weatherIcon(dayForecast.condition as WeatherCondition, 20)}
                <span class="day-weather-temps">${Math.round(dayForecast.tempHigh)}°/${Math.round(dayForecast.tempLow)}°</span>
              </div>
            ` : nothing}
            <button class="add-btn" type="button" aria-label=${newEventLabel(day, now)} title="New event"
              @click=${() => this._addEvent(day)}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
        <div class="day-events">
          ${sorted.length > 0
            ? sorted.map(event => html`
                <pv-event-chip
                  .hass=${this.hass}
                  .event=${event}
                  .day=${day}
                  .calendars=${this.calendars}
                  .timeFormat=${this.timeFormat}
                  .showStripes=${this.showStripes}
                  .tick=${this.tick}
                  .badge=${today ? eventStatus(event, now) : dayOfStatus(event, day)}
                  @event-click=${(e: CustomEvent) => { e.stopPropagation(); this._onEventClick(e.detail.event); }}
                ></pv-event-chip>
              `)
            : html`<div class="empty-day">Nothing planned</div>`
          }
        </div>
      </div>
    `;
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

defineElement('pv-view-agenda', PVViewAgenda);
