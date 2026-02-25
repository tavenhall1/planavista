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
  deduplicateSharedEvents,
  SharedEvent,
} from '../utils/event-utils';
import { getPersonAvatar } from '../utils/ha-utils';

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
        margin-left: 2px;
        min-width: 0;
        overflow: hidden;
      }

      .day-column:first-child {
        margin-left: 0;
      }

      .day-column.today {
        background: var(--pv-today-bg);
      }

      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: transparent;
        pointer-events: none;
      }

      .hour-band-odd {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.015);
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
        background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
        cursor: pointer;
        overflow: hidden;
        transition: all var(--pv-transition);
        z-index: 1;
        font-size: 0.6875rem;
        min-height: 18px;
      }

      .positioned-event:hover {
        z-index: 5;
        background: color-mix(in srgb, var(--event-color) 16%, white);
        transform: translateY(-1px);
      }

      .positioned-event .event-title {
        font-weight: 500;
        line-height: 1.2;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.5625rem;
        color: var(--pv-text-secondary);
      }

      .shared-avatars {
        position: absolute;
        bottom: 3px;
        right: 4px;
        display: flex;
        align-items: center;
      }

      .shared-avatar {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--pv-card-bg, #fff);
        object-fit: cover;
        margin-left: -4px;
      }

      .shared-avatar:first-child {
        margin-left: 0;
      }

      .shared-avatar-initial {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid var(--pv-card-bg, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: white;
        margin-left: -4px;
      }

      .shared-avatar-initial:first-child {
        margin-left: 0;
      }

      .shared-more {
        font-size: 0.5rem;
        font-weight: 600;
        color: var(--pv-text-muted);
        margin-left: 2px;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — narrow gutter, hide event time, compact headers */
      @media (max-width: 479px) {
        .time-gutter { width: 32px; }
        .header-gutter { width: 32px; }
        .all-day-gutter { width: 32px; font-size: 0.5rem; }
        .time-label { font-size: 0.5rem; right: 0.25rem; }
        .day-header-weekday { font-size: 0.5625rem; }
        .day-header-date { font-size: 0.9375rem; }
        .day-header { padding: 0.25rem 0.125rem; }
        .positioned-event { left: 1px; right: 1px; padding: 0.0625rem 0.125rem; }
        .event-title { font-size: 0.5625rem; }
        .event-time { display: none; }
        .all-day-event { font-size: 0.5625rem; padding: 0.0625rem 0.25rem; }
        .shared-avatars { display: none; }
      }

      /* sm: large phones — slightly wider gutter */
      @media (min-width: 480px) and (max-width: 767px) {
        .time-gutter { width: 40px; }
        .header-gutter { width: 40px; }
        .all-day-gutter { width: 40px; }
        .time-label { font-size: 0.5625rem; }
        .day-header-weekday { font-size: 0.5625rem; }
        .day-header-date { font-size: 1rem; }
        .event-title { font-size: 0.625rem; }
        .event-time { font-size: 0.5rem; }
      }

      /* md: tablets — moderate compression */
      @media (min-width: 768px) and (max-width: 1023px) {
        .time-gutter { width: 46px; }
        .header-gutter { width: 46px; }
        .all-day-gutter { width: 46px; }
      }

      /* short height — compress day headers */
      @media (max-height: 500px) {
        .day-header { padding: 0.25rem 0.125rem; }
        .day-header-weekday { font-size: 0.5625rem; }
        .day-header-date { font-size: 1rem; }
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
    const dedupedWeekEvents = deduplicateSharedEvents(weekEvents, this.calendars);

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

        ${this._renderAllDayBanner(days, dedupedWeekEvents)}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="days-area">
              ${this._renderHourLines()}
              ${days.map(day => this._renderDayColumn(day, dedupedWeekEvents, todayStr))}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderAllDayBanner(days: Date[], events: SharedEvent[]) {
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
        label = `${String(h % 24).padStart(2, '0')}:00`;
      } else {
        const hNorm = h % 24;
        const hour12 = hNorm % 12 || 12;
        const period = hNorm >= 12 ? 'PM' : 'AM';
        label = `${hour12} ${period}`;
      }
      labels.push(html`<div class="time-label" style="top: ${top}%">${label}</div>`);
    }
    return labels;
  }

  private _renderHourLines() {
    const lines: ReturnType<typeof html>[] = [];
    const totalHours = DAY_END_HOUR - DAY_START_HOUR;
    const bandHeight = (1 / totalHours) * 100;
    for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
      const top = ((h - DAY_START_HOUR) / totalHours) * 100;
      if (h % 2 === 1) {
        lines.push(html`<div class="hour-band-odd" style="top: ${top}%; height: ${bandHeight}%"></div>`);
      }
    }
    return lines;
  }

  private _renderDayColumn(day: Date, allEvents: SharedEvent[], todayStr: string) {
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
              style="top:${pos.top}%;height:${pos.height}%;width:${w};left:${l};--event-color:${event.calendar_color};--event-color-light:${event.calendar_color_light || ''}"
              @click=${() => this._onEventClick(event)}
            >
              <div class="event-title">${event.summary}</div>
              <div class="event-time">${formatTime(event.start, this.timeFormat)}</div>
              ${((event as unknown) as SharedEvent).shared_calendars?.length > 1 ? html`
                <div class="shared-avatars">
                  ${((event as unknown) as SharedEvent).shared_calendars.slice(0, 3).map((cal) => {
                    const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
                    return avatar
                      ? html`<img class="shared-avatar" src="${avatar}" alt="${cal.display_name}" />`
                      : html`<div class="shared-avatar-initial" style="background: ${cal.color}">${cal.display_name[0] || '?'}</div>`;
                  })}
                  ${((event as unknown) as SharedEvent).shared_calendars.length > 3 ? html`
                    <span class="shared-more">+${((event as unknown) as SharedEvent).shared_calendars.length - 3}</span>
                  ` : nothing}
                </div>
              ` : nothing}
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
