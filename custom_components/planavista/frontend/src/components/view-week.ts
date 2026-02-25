import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles, nowIndicatorStyles } from '../styles/shared';
import { formatTime, getStartOfWeek, isToday, formatDate } from '../utils/date-utils';
import {
  isAllDayEvent,
  getEventsForDateRange,
  getEventPosition,
  detectOverlaps,
  filterVisibleEvents,
} from '../utils/event-utils';

const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;

@customElement('pv-view-week')
export class PVViewWeek extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) firstDay: 'monday' | 'sunday' = 'sunday';

  static styles = [
    baseStyles,
    eventStyles,
    nowIndicatorStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .week-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* Day headers */
      .day-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 54px;
        flex-shrink: 0;
      }

      .day-header {
        flex: 1;
        text-align: center;
        padding: 0.5rem 0.25rem;
        min-width: 0;
      }

      .day-header-weekday {
        font-size: 0.6875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--pv-text-muted);
      }

      .day-header-date {
        font-size: 1.25rem;
        font-weight: 300;
        margin-top: 0.125rem;
        color: var(--pv-text);
      }

      .day-header.today .day-header-date {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
      }

      .day-header.today .day-header-weekday {
        color: var(--pv-accent);
        font-weight: 600;
      }

      /* All-day banner */
      .all-day-banner {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        min-height: 28px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 54px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
      }

      .all-day-column {
        flex: 1;
        padding: 0.25rem 2px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .all-day-event {
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        font-size: 0.6875rem;
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        transition: opacity 150ms;
      }

      .all-day-event:hover { opacity: 0.85; }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .time-grid-wrapper::-webkit-scrollbar {
        display: none;
      }

      .time-grid {
        display: flex;
        position: relative;
        height: ${(DAY_END_HOUR - DAY_START_HOUR) * 80}px;
        flex-shrink: 0;
      }

      .time-gutter {
        width: 54px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.375rem;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .days-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .day-column {
        flex: 1;
        position: relative;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .day-column.today {
        background: var(--pv-today-bg);
      }

      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--pv-border-subtle);
        pointer-events: none;
      }

      /* Events */
      .positioned-event {
        position: absolute;
        left: 2px;
        right: 2px;
        padding: 0.125rem 0.25rem;
        border-radius: 4px;
        border-left: 3px solid var(--event-color);
        background: color-mix(in srgb, var(--event-color) 12%, var(--pv-card-bg, white));
        cursor: pointer;
        overflow: hidden;
        transition: all var(--pv-transition);
        z-index: 1;
        font-size: 0.6875rem;
        min-height: 18px;
      }

      .positioned-event:hover {
        z-index: 5;
        box-shadow: var(--pv-shadow);
      }

      .positioned-event .event-title {
        font-weight: 500;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.5625rem;
        color: var(--pv-text-secondary);
      }
    `,
  ];

  firstUpdated() {
    this._scrollToNow();
  }

  private _scrollToNow() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.querySelector('.time-grid-wrapper') as HTMLElement;
      if (!container) return;
      const now = new Date();
      const minutesSinceStart = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
      const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
      if (minutesSinceStart > 0 && minutesSinceStart < totalMinutes) {
        const scrollTo = (minutesSinceStart / totalMinutes) * container.scrollHeight - container.clientHeight / 3;
        container.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
      }
    });
  }

  private _getWeekDays(): Date[] {
    const start = getStartOfWeek(this.currentDate, this.firstDay);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const days = this._getWeekDays();
    const weekStart = new Date(days[0]);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(days[6]);
    weekEnd.setHours(23, 59, 59, 999);
    const weekEvents = getEventsForDateRange(visible, weekStart, weekEnd);

    const now = new Date();
    const todayStr = now.toDateString();

    return html`
      <div class="week-container">
        <div class="day-headers">
          <div class="header-gutter"></div>
          ${days.map(day => {
            const today = day.toDateString() === todayStr;
            return html`
              <div class="day-header ${today ? 'today' : ''}">
                <div class="day-header-weekday">${day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div class="day-header-date">${day.getDate()}</div>
              </div>
            `;
          })}
        </div>

        ${this._renderAllDayBanner(days, weekEvents)}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="days-area">
              ${this._renderHourLines()}
              ${days.map(day => this._renderDayColumn(day, weekEvents, todayStr))}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderAllDayBanner(days: Date[], events: CalendarEvent[]) {
    const allDayEvents = events.filter(e => isAllDayEvent(e));
    if (allDayEvents.length === 0) return nothing;

    return html`
      <div class="all-day-banner">
        <div class="all-day-gutter">All Day</div>
        ${days.map(day => {
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);
          const dayAllDay = allDayEvents.filter(e => {
            const s = new Date(e.start);
            const en = new Date(e.end);
            return s < dayEnd && en > dayStart;
          });
          return html`
            <div class="all-day-column">
              ${dayAllDay.map(e => html`
                <div
                  class="all-day-event"
                  style="background: ${e.calendar_color}"
                  @click=${() => this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderTimeLabels() {
    const labels: ReturnType<typeof html>[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      const top = ((h - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
      let label: string;
      if (this.timeFormat === '24h') {
        label = `${String(h).padStart(2, '0')}:00`;
      } else {
        const hour12 = h % 12 || 12;
        const period = h >= 12 ? 'PM' : 'AM';
        label = `${hour12} ${period}`;
      }
      labels.push(html`<div class="time-label" style="top: ${top}%">${label}</div>`);
    }
    return labels;
  }

  private _renderHourLines() {
    const lines: ReturnType<typeof html>[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      const top = ((h - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
      lines.push(html`<div class="hour-line" style="top: ${top}%"></div>`);
    }
    return lines;
  }

  private _renderDayColumn(day: Date, allEvents: CalendarEvent[], todayStr: string) {
    const isCurrentDay = day.toDateString() === todayStr;
    const dayStart = new Date(day);
    dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(DAY_END_HOUR, 0, 0, 0);

    const timedEvents = allEvents.filter(e => {
      if (isAllDayEvent(e)) return false;
      const s = new Date(e.start);
      const en = new Date(e.end);
      return s < dayEnd && en > dayStart && s.toDateString() === day.toDateString();
    });

    const positioned = detectOverlaps(timedEvents);

    // Now indicator
    const now = new Date();
    const nowMinutes = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
    const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const nowPercent = isCurrentDay ? (nowMinutes / totalMinutes) * 100 : -1;

    return html`
      <div class="day-column ${isCurrentDay ? 'today' : ''}">
        ${nowPercent >= 0 && nowPercent <= 100 ? html`
          <div class="pv-now-line" style="top: ${nowPercent}%"></div>
        ` : nothing}
        ${positioned.map(event => {
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR);
          const w = event.totalColumns > 1
            ? `calc(${100 / event.totalColumns}% - 3px)`
            : 'calc(100% - 4px)';
          const l = event.totalColumns > 1
            ? `calc(${(event.column / event.totalColumns) * 100}% + 2px)`
            : '2px';
          return html`
            <div
              class="positioned-event"
              style="top:${pos.top}%;height:${pos.height}%;width:${w};left:${l};--event-color:${event.calendar_color}"
              @click=${() => this._onEventClick(event)}
            >
              <div class="event-title">${event.summary}</div>
              <div class="event-time">${formatTime(event.start, this.timeFormat)}</div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _onEventClick(event: CalendarEvent) {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event },
      bubbles: true,
      composed: true,
    }));
  }
}
