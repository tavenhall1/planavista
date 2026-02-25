import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles } from '../styles/shared';
import { getMonthGrid, isToday, getDateKey } from '../utils/date-utils';
import { groupEventsByDate, filterVisibleEvents } from '../utils/event-utils';

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
        color: var(--pv-text);
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
              style="--event-color: ${e.calendar_color}; --event-color-light: ${e.calendar_color_light || ''}"
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
