import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles } from '../styles/shared';
import { getMonthGrid, isToday, getDateKey } from '../utils/date-utils';
import {
  groupEventsByDate,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';

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
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) showStripes: boolean = true;
  @property({ type: Number }) tick = 0;

  static styles = [
    baseStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .month-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .month-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--pv-text);
        padding: 0.5rem 0.75rem;
        text-align: center;
        flex-shrink: 0;
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

      /* xs: phones — compact day cells */
      @media (max-width: 479px) {
        .month-name { font-size: 0.9375rem; padding: 0.375rem 0.5rem; }
        .weekday-name { font-size: 0.5625rem; padding: 0.25rem 0; letter-spacing: 0.02em; }
        .day-number { font-size: 0.6875rem; padding: 0.0625rem 0.125rem; }
        .day-cell { padding: 0.125rem; }
        .day-cell.today .day-number { width: 20px; height: 20px; font-size: 0.625rem; }
        .more-events { font-size: 0.5rem; }
      }

      /* sm: large phones */
      @media (min-width: 480px) and (max-width: 767px) {
        .weekday-name { font-size: 0.625rem; }
        .day-number { font-size: 0.75rem; }
      }

      /* short height — tighter cells */
      @media (max-height: 500px) {
        .day-cell { padding: 0.125rem; }
        .day-number { font-size: 0.6875rem; }
      }

      /* lg: large screens (1024–1439px) */
      @media (min-width: 1024px) {
        .month-name { font-size: 1.25rem; }
        .weekday-name { font-size: 0.8125rem; padding: 0.625rem 0; }
        .day-number { font-size: 0.9375rem; padding: 0.25rem 0.375rem; }
        .day-cell.today .day-number { width: 30px; height: 30px; font-size: 0.875rem; }
        .more-events { font-size: 0.75rem; }
      }

      /* xl: wall displays (1440px+) */
      @media (min-width: 1440px) {
        .month-name { font-size: 1.375rem; }
        .weekday-name { font-size: 0.9375rem; padding: 0.75rem 0; }
        .day-number { font-size: 1.0625rem; padding: 0.375rem 0.5rem; }
        .day-cell.today .day-number { width: 36px; height: 36px; font-size: 1rem; }
        .day-cell { padding: 0.375rem; }
        .day-events { gap: 2px; }
        .more-events { font-size: 0.875rem; }
      }
    `,
  ];

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const deduped = deduplicateSharedEvents(visible, this.calendars);
    const grid = getMonthGrid(this.currentDate, this.firstDay);
    const eventsByDate = groupEventsByDate(deduped);
    const currentMonth = this.currentDate.getMonth();
    const weekdays = this.firstDay === 'monday' ? WEEKDAYS_SHORT_MON : WEEKDAYS_SHORT;
    const monthLabel = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return html`
      <div class="month-container">
        <div class="month-name">${monthLabel}</div>
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
    const dayEvents = (eventsByDate.get(key) || []) as SharedEvent[];
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
            <pv-event-chip
              .hass=${this.hass}
              .event=${e}
              .calendars=${this.calendars}
              .timeFormat=${this.timeFormat}
              .compact=${true}
              .showStripes=${this.showStripes}
              .tick=${this.tick}
              @event-click=${(ev: CustomEvent) => { ev.stopPropagation(); this._onEventClick(ev.detail.event); }}
            ></pv-event-chip>
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
