import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles } from '../styles/shared';
import { getMonthGrid, isToday, getDateKey } from '../utils/date-utils';
import { groupEventsByDate, filterVisibleEvents } from '../utils/event-utils';
import { contrastText } from '../styles/themes';

const MAX_VISIBLE_EVENTS = 3;
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@customElement('pv-view-month')
export class PVViewMonth extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) firstDay: 'monday' | 'sunday' = 'sunday';

  static styles = [
    baseStyles,
    eventStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .weekday-name {
        text-align: center;
        padding: 0.5rem 0;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-template-rows: repeat(6, 1fr);
        flex: 1;
        min-height: 0;
      }

      .day-cell {
        border-right: 1px solid var(--pv-border-subtle);
        border-bottom: 1px solid var(--pv-border-subtle);
        padding: 0.25rem;
        min-height: 0;
        overflow: hidden;
        cursor: pointer;
        transition: background 150ms ease;
      }

      .day-cell:hover {
        background: var(--pv-event-hover);
      }

      .day-cell:nth-child(7n) {
        border-right: none;
      }

      .day-cell.other-month {
        opacity: 0.35;
      }

      .day-cell.today {
        background: var(--pv-today-bg);
      }

      .day-number {
        font-size: 0.8125rem;
        font-weight: 400;
        color: var(--pv-text);
        margin-bottom: 0.125rem;
        padding: 0.125rem 0.25rem;
        display: inline-block;
      }

      .day-cell.today .day-number {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }

      .month-event-pill {
        padding: 0.0625rem 0.375rem;
        border-radius: 3px;
        border-left: 2px solid var(--event-color, var(--pv-accent));
        background: var(--event-color-light, color-mix(in srgb, var(--event-color, var(--pv-accent)) 12%, white));
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--event-text, var(--pv-text));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        line-height: 1.4;
        transition: all 150ms;
      }

      .month-event-pill:hover {
        background: color-mix(in srgb, var(--event-color, var(--pv-accent)) 16%, white);
      }

      .more-events {
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 500;
      }

      .more-events:hover {
        color: var(--pv-accent);
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — compact day cells, truncate event pills */
      @media (max-width: 479px) {
        .weekday-name { font-size: 0.5625rem; padding: 0.25rem 0; letter-spacing: 0.02em; }
        .day-number { font-size: 0.6875rem; padding: 0.0625rem 0.125rem; }
        .day-cell { padding: 0.125rem; }
        .day-cell.today .day-number { width: 20px; height: 20px; font-size: 0.625rem; }
        .month-event-pill { font-size: 0.5rem; padding: 0 0.25rem; border-left-width: 2px; }
        .more-events { font-size: 0.5rem; }
      }

      /* sm: large phones — slightly larger */
      @media (min-width: 480px) and (max-width: 767px) {
        .weekday-name { font-size: 0.625rem; }
        .day-number { font-size: 0.75rem; }
        .month-event-pill { font-size: 0.5625rem; }
      }

      /* short height — tighter cells */
      @media (max-height: 500px) {
        .day-cell { padding: 0.125rem; }
        .day-number { font-size: 0.6875rem; }
        .month-event-pill { font-size: 0.5625rem; }
      }

      /* lg: large screens (1024–1439px) — scale up ~20% */
      @media (min-width: 1024px) {
        .weekday-name { font-size: 0.8125rem; padding: 0.625rem 0; }
        .day-number { font-size: 0.9375rem; padding: 0.25rem 0.375rem; }
        .day-cell.today .day-number { width: 30px; height: 30px; font-size: 0.875rem; }
        .month-event-pill { font-size: 0.8125rem; padding: 2px 8px; }
        .more-events { font-size: 0.75rem; }
      }

      /* xl: wall displays (1440px+) — scale up ~40% */
      @media (min-width: 1440px) {
        .weekday-name { font-size: 0.9375rem; padding: 0.75rem 0; }
        .day-number { font-size: 1.0625rem; padding: 0.375rem 0.5rem; }
        .day-cell.today .day-number { width: 36px; height: 36px; font-size: 1rem; }
        .day-cell { padding: 0.375rem; }
        .month-event-pill { font-size: 0.9375rem; padding: 3px 10px; min-height: 24px; }
        .more-events { font-size: 0.875rem; }
      }
    `,
  ];

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const grid = getMonthGrid(this.currentDate, this.firstDay);
    const eventsByDate = groupEventsByDate(visible);
    const currentMonth = this.currentDate.getMonth();
    const weekdays = this.firstDay === 'monday' ? WEEKDAYS_SHORT_MON : WEEKDAYS_SHORT;

    return html`
      <div class="month-container">
        <div class="weekday-header">
          ${weekdays.map(d => html`<div class="weekday-name">${d}</div>`)}
        </div>
        <div class="month-grid">
          ${grid.map(day => this._renderDayCell(day, currentMonth, eventsByDate))}
        </div>
      </div>
    `;
  }

  private _renderDayCell(
    day: Date,
    currentMonth: number,
    eventsByDate: Map<string, CalendarEvent[]>
  ) {
    const key = getDateKey(day);
    const dayEvents = eventsByDate.get(key) || [];
    const otherMonth = day.getMonth() !== currentMonth;
    const today = isToday(day);
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const remaining = dayEvents.length - MAX_VISIBLE_EVENTS;

    return html`
      <div
        class="day-cell ${otherMonth ? 'other-month' : ''} ${today ? 'today' : ''}"
        @click=${() => this._onDayClick(day)}
      >
        <div class="day-number">${day.getDate()}</div>
        <div class="day-events">
          ${visibleEvents.map(e => html`
            <div
              class="month-event-pill"
              style="--event-color: ${e.calendar_color}; --event-color-light: ${e.calendar_color_light || ''}; --event-text: ${contrastText(e.calendar_color_light || e.calendar_color)}"
              @click=${(ev: Event) => { ev.stopPropagation(); this._onEventClick(e); }}
            >${e.summary}</div>
          `)}
          ${remaining > 0 ? html`
            <div class="more-events" @click=${(ev: Event) => { ev.stopPropagation(); this._onDayClick(day); }}>
              +${remaining} more
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  private _onDayClick(day: Date) {
    this.dispatchEvent(new CustomEvent('day-click', {
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
