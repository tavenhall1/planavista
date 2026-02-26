import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles, animationStyles } from '../styles/shared';
import {
  formatTime,
  formatDate,
  getRelativeLabel,
  getDateKey,
  isToday,
  isPast,
} from '../utils/date-utils';
import {
  isAllDayEvent,
  groupEventsByDate,
  getEventsForDateRange,
  filterVisibleEvents,
} from '../utils/event-utils';
import { contrastText } from '../styles/themes';

@customElement('pv-view-agenda')
export class PVViewAgenda extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Number }) maxEvents: number = 20;
  @property({ type: Number }) daysAhead: number = 14;
  @property({ type: Boolean }) showCalendarName: boolean = true;
  @property({ type: Boolean }) showEndTime: boolean = false;
  @property({ attribute: false }) maxHeight?: string;

  static styles = [
    baseStyles,
    eventStyles,
    animationStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .agenda-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
      }

      .date-group {
        animation: pv-fadeIn 200ms ease;
      }

      .date-header {
        position: sticky;
        top: 0;
        z-index: 2;
        padding: 0.625rem 1rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text);
        background: var(--pv-card-bg, #fff);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .date-header.today {
        color: var(--pv-accent);
      }

      .date-header-relative {
        font-weight: 600;
      }

      .date-header-full {
        font-weight: 400;
        color: var(--pv-text-secondary);
        margin-left: 0.5rem;
      }

      .agenda-event {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background var(--pv-transition, 200ms ease);
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .agenda-event:hover {
        background: var(--event-color-light, var(--pv-event-hover));
      }

      .agenda-event:active {
        background: color-mix(in srgb, var(--pv-event-hover) 150%, transparent);
      }

      .event-color-bar {
        width: 4px;
        min-height: 36px;
        border-radius: 2px;
        flex-shrink: 0;
        align-self: stretch;
      }

      .event-content {
        flex: 1;
        min-width: 0;
      }

      .event-title {
        font-size: 0.9375rem;
        font-weight: 500;
        line-height: 1.3;
        color: var(--event-text, var(--pv-text));
      }

      .event-meta {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.25rem;
        font-size: 0.8125rem;
        color: var(--event-text, var(--pv-text-secondary));
      }

      .event-time-text {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .event-calendar-name {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .calendar-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .event-location {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        margin-top: 0.25rem;
      }

      .event-location ha-icon {
        --mdc-icon-size: 14px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }

      .all-day-label {
        font-weight: 500;
        color: var(--pv-accent);
        font-size: 0.75rem;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — tighter padding */
      @media (max-width: 479px) {
        .agenda-event { padding: 0.5rem 0.75rem; gap: 0.5rem; }
        .event-title { font-size: 0.8125rem; }
        .event-meta { font-size: 0.75rem; gap: 0.5rem; }
        .event-location { font-size: 0.6875rem; }
        .date-header { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
      }

      /* md+: constrain width for readability */
      @media (min-width: 768px) {
        .agenda-container { max-width: 720px; margin: 0 auto; }
      }

      /* lg: large screens (1024–1439px) — scale up ~20% */
      @media (min-width: 1024px) {
        .agenda-container { max-width: 800px; }
        .date-header { padding: 0.75rem 1.25rem; font-size: 0.9375rem; }
        .agenda-event { padding: 0.875rem 1.25rem; gap: 0.875rem; }
        .event-title { font-size: 1.0625rem; }
        .event-meta { font-size: 0.9375rem; }
        .event-location { font-size: 0.8125rem; }
        .event-color-bar { width: 5px; }
        .calendar-dot { width: 10px; height: 10px; }
      }

      /* xl: wall displays (1440px+) — scale up ~40% */
      @media (min-width: 1440px) {
        .agenda-container { max-width: 900px; }
        .date-header { padding: 0.875rem 1.5rem; font-size: 1.0625rem; }
        .agenda-event { padding: 1rem 1.5rem; gap: 1rem; }
        .event-title { font-size: 1.1875rem; }
        .event-meta { font-size: 1.0625rem; }
        .event-location { font-size: 0.9375rem; }
        .event-location ha-icon { --mdc-icon-size: 18px; }
        .event-color-bar { width: 6px; min-height: 44px; }
        .calendar-dot { width: 12px; height: 12px; }
        .all-day-label { font-size: 0.875rem; }
        .empty-state ha-icon { --mdc-icon-size: 64px; }
      }
    `,
  ];

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const start = new Date(this.currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.currentDate);
    end.setDate(end.getDate() + this.daysAhead);
    end.setHours(23, 59, 59, 999);

    const rangeEvents = getEventsForDateRange(visible, start, end);
    const grouped = groupEventsByDate(rangeEvents);

    // Sort date keys and limit total events
    const sortedKeys = Array.from(grouped.keys()).sort();
    let totalShown = 0;
    const containerStyle = this.maxHeight ? `max-height: ${this.maxHeight}` : '';

    if (rangeEvents.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-check"></ha-icon>
          <p>No upcoming events</p>
        </div>
      `;
    }

    return html`
      <div class="agenda-container" style="${containerStyle}">
        ${sortedKeys.map(key => {
          if (totalShown >= this.maxEvents) return nothing;
          const events = grouped.get(key) || [];
          const date = new Date(key + 'T00:00:00');
          const relLabel = getRelativeLabel(date);
          const fullDate = formatDate(date, 'medium');
          const today = isToday(date);
          const past = isPast(date) && !today;

          return html`
            <div class="date-group" style="${past ? 'opacity: 0.6' : ''}">
              <div class="date-header ${today ? 'today' : ''}">
                <span class="date-header-relative">${relLabel}</span>
                ${relLabel !== fullDate ? html`<span class="date-header-full">${fullDate}</span>` : nothing}
              </div>
              ${events.map(event => {
                if (totalShown >= this.maxEvents) return nothing;
                totalShown++;
                return this._renderEvent(event);
              })}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderEvent(event: CalendarEvent) {
    const allDay = isAllDayEvent(event);
    const timeStr = allDay
      ? null
      : formatTime(event.start, this.timeFormat);
    const endTimeStr = allDay || !this.showEndTime
      ? null
      : formatTime(event.end, this.timeFormat);

    return html`
      <div class="agenda-event" style="--event-color: ${event.calendar_color}; --event-color-light: ${event.calendar_color_light || ''}; --event-text: ${contrastText(event.calendar_color_light || event.calendar_color)}" @click=${() => this._onEventClick(event)}>
        <div class="event-color-bar" style="background: ${event.calendar_color}"></div>
        <div class="event-content">
          <div class="event-title">${event.summary}</div>
          <div class="event-meta">
            ${allDay
              ? html`<span class="all-day-label">All Day</span>`
              : html`
                <span class="event-time-text">
                  ${timeStr}${endTimeStr ? html` – ${endTimeStr}` : nothing}
                </span>
              `}
            ${this.showCalendarName ? html`
              <span class="event-calendar-name">
                <span class="calendar-dot" style="background: ${event.calendar_color}"></span>
                ${event.calendar_name}
              </span>
            ` : nothing}
          </div>
          ${event.location ? html`
            <div class="event-location">
              <ha-icon icon="mdi:map-marker-outline"></ha-icon>
              ${event.location}
            </div>
          ` : nothing}
        </div>
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
