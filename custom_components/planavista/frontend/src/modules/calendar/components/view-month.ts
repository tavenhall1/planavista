import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../../../types';
import { baseStyles } from '../../../styles/shared';
import type { Layout } from '../../../core/layout';
import { MONTH_SIZES, MonthCellSizes, monthCellEvents } from '../layout-rules';
import { getMonthGrid, isToday, getDateKey } from '../../../utils/date-utils';
import {
  groupEventsByDate,
  filterVisibleEvents,
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  /** The card's layout; portrait's taller cells show more events (spec 12.3). */
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  /**
   * What the grid draws: a cell's height, and the sizes in an ordinary cell
   * and in today's (its number is a bigger circle). 0 until measured.
   */
  @state() private _fit: { cell: number; normal: MonthCellSizes; today: MonthCellSizes } = {
    cell: 0, normal: MONTH_SIZES, today: MONTH_SIZES,
  };
  private _gridObserver?: ResizeObserver;

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
        /* Its own row: today's circle no longer sits on a text line that adds space below it. */
        display: flex;
        align-items: center;
        width: fit-content;
      }

      .day-cell.today .day-number {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-radius: var(--pv-radius-sm, 50%);
        width: 24px;
        height: 24px;
        display: flex;
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
        line-height: 1.2;
        font-size: 0.625rem;
        color: var(--pv-text-secondary);
        padding: 0 0.375rem;
        cursor: pointer;
        font-weight: 500;
      }

      .more-events:hover {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones, compact day cells */
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

      /* short height: tighter cells */
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

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) this._observeGrid();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._gridObserver?.disconnect();
  }

  firstUpdated(): void {
    this._observeGrid();
  }

  updated(): void {
    // Events come and go, and the first chip or "+N more" gives the real sizes.
    this._measure();
  }

  private _observeGrid(): void {
    const grid = this.shadowRoot?.querySelector('.month-grid');
    if (!grid || typeof ResizeObserver === 'undefined') return;
    this._gridObserver ??= new ResizeObserver(() => this._measure());
    this._gridObserver.disconnect();
    this._gridObserver.observe(grid);
  }

  /** Measure what the grid draws, so every event in a cell is whole or counted in "+N more". */
  private _measure(): void {
    const grid = this.shadowRoot?.querySelector<HTMLElement>('.month-grid');
    if (!grid || grid.clientHeight === 0) return;
    const list = grid.querySelector<HTMLElement>('.day-events');
    const gap = list ? parseFloat(getComputedStyle(list).rowGap) || 0 : 0;
    const chip = grid.querySelector<HTMLElement>('pv-event-chip');
    const more = grid.querySelector<HTMLElement>('.more-events');
    const row = chip ? Math.ceil(chip.getBoundingClientRect().height + gap) : MONTH_SIZES.row;
    const moreLine = more ? Math.ceil(more.getBoundingClientRect().height + gap) : MONTH_SIZES.more;
    // From the cell's top to its first event, plus its bottom border. Its padding
    // stays usable: a cell clips what overflows at the padding's edge, not the content's.
    const around = (cell: HTMLElement | null): number => {
      const events = cell?.querySelector<HTMLElement>('.day-events');
      if (!cell || !events) return MONTH_SIZES.number;
      const border = parseFloat(getComputedStyle(cell).borderBottomWidth) || 0;
      return Math.ceil(events.getBoundingClientRect().top - cell.getBoundingClientRect().top + border);
    };
    const normal = { number: around(grid.querySelector('.day-cell:not(.today)')), row, more: moreLine };
    const todayCell = grid.querySelector<HTMLElement>('.day-cell.today');
    const fit = {
      cell: Math.floor(grid.clientHeight / 6),
      normal,
      today: todayCell ? { ...normal, number: around(todayCell) } : normal,
    };
    if (JSON.stringify(fit) !== JSON.stringify(this._fit)) this._fit = fit;
  }

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
    const { shown, more } = monthCellEvents(dayEvents.length, this._fit.cell, today ? this._fit.today : this._fit.normal);
    const visibleEvents = dayEvents.slice(0, shown);

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
              @click=${(ev: Event) => ev.stopPropagation()}
            ></pv-event-chip>
          `)}
          ${more > 0 ? html`
            <div class="more-events" @click=${(ev: Event) => { ev.stopPropagation(); this._onDayClick(day); }}>
              +${more} more
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

defineElement('pv-view-month', PVViewMonth);
