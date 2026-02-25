import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles, nowIndicatorStyles, animationStyles } from '../styles/shared';
import { formatTime } from '../utils/date-utils';
import {
  isAllDayEvent,
  groupEventsByPerson,
  getEventsForDateRange,
  getEventPosition,
  detectOverlaps,
  filterVisibleEvents,
} from '../utils/event-utils';
import { getPersonAvatar, getPersonName } from '../utils/ha-utils';

const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;
const HOUR_HEIGHT = 80; // px per hour

@customElement('pv-view-day')
export class PVViewDay extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) hideColumnHeaders = false;

  static styles = [
    baseStyles,
    eventStyles,
    nowIndicatorStyles,
    animationStyles,
    css`
      :host { display: block; height: 100%; overflow: hidden; }

      .day-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      /* All-day section */
      .all-day-section {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        padding: 0.5rem 0;
        min-height: 40px;
        flex-shrink: 0;
      }

      .all-day-gutter {
        width: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        text-transform: uppercase;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      .all-day-events {
        flex: 1;
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
        padding: 0 0.5rem;
      }

      .all-day-chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: white;
        cursor: pointer;
        transition: all 200ms ease;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }

      .all-day-chip:hover {
        transform: scale(1.03);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        filter: brightness(1.05);
      }

      /* Column headers */
      .column-headers {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
      }

      .header-gutter {
        width: 60px;
        flex-shrink: 0;
      }

      .person-header {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.75rem 0.5rem;
        min-width: 0;
      }

      .person-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        border: 3px solid var(--pv-border-subtle);
      }

      .person-initial {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.375rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .person-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        text-align: center;
      }

      /* Time grid */
      .time-grid-wrapper {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
      }

      .time-grid {
        display: flex;
        position: relative;
        height: ${(DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT}px;
        flex-shrink: 0;
      }

      .time-gutter {
        width: 60px;
        flex-shrink: 0;
        position: relative;
      }

      .time-label {
        position: absolute;
        right: 0.5rem;
        font-size: 0.6875rem;
        color: var(--pv-text-muted);
        transform: translateY(-50%);
        font-variant-numeric: tabular-nums;
      }

      .columns-area {
        flex: 1;
        display: flex;
        position: relative;
      }

      .person-column {
        flex: 1;
        position: relative;
        border-left: 1px solid var(--pv-border-subtle);
        min-width: 0;
      }

      .person-column:first-child {
        border-left: 1px solid var(--pv-border);
      }

      /* Alternate column tint for visual separation */
      .person-column:nth-child(even) {
        background: rgba(0, 0, 0, 0.008);
      }

      /* Hour lines */
      .hour-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--pv-border-subtle);
        pointer-events: none;
      }

      /* Positioned events — premium solid color blocks */
      .positioned-event {
        position: absolute;
        left: 3px;
        right: 3px;
        padding: 6px 10px;
        border-radius: 10px;
        background: var(--event-color);
        color: white;
        cursor: pointer;
        overflow: hidden;
        transition: all 200ms ease;
        z-index: 1;
        min-height: 26px;
        box-shadow: 0 1px 4px color-mix(in srgb, var(--event-color) 40%, transparent);
      }

      .positioned-event:hover {
        z-index: 5;
        box-shadow: 0 4px 14px color-mix(in srgb, var(--event-color) 50%, transparent);
        transform: scale(1.02);
        filter: brightness(1.05);
      }

      .positioned-event .event-title {
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
      }

      .positioned-event .event-time {
        font-size: 0.6875rem;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 2px;
        font-weight: 500;
      }

      /* Click target for empty slots */
      .slot-click-area {
        position: absolute;
        left: 0;
        right: 0;
        cursor: pointer;
      }

      .slot-click-area:hover {
        background: var(--pv-today-bg);
      }

      /* Empty state */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--pv-text-muted);
        text-align: center;
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
        margin-bottom: 1rem;
      }
    `,
  ];

  private _scrollContainer?: HTMLElement;

  firstUpdated() {
    this._scrollToNow();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('currentDate')) {
      this._scrollToNow();
    }
  }

  private _scrollToNow() {
    requestAnimationFrame(() => {
      const container = this.shadowRoot?.querySelector('.time-grid-wrapper') as HTMLElement;
      if (!container) return;
      this._scrollContainer = container;
      const now = new Date();
      const minutesSinceStart = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
      const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
      if (minutesSinceStart > 0 && minutesSinceStart < totalMinutes) {
        const scrollTo = (minutesSinceStart / totalMinutes) * container.scrollHeight - container.clientHeight / 3;
        container.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
      }
    });
  }

  render() {
    const visible = filterVisibleEvents(this.events, this.hiddenCalendars);
    const dateStart = new Date(this.currentDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(this.currentDate);
    dateEnd.setHours(23, 59, 59, 999);
    const dayEvents = getEventsForDateRange(visible, dateStart, dateEnd);

    // Separate all-day and timed events
    const allDayEvents = dayEvents.filter(e => isAllDayEvent(e));
    const timedEvents = dayEvents.filter(e => !isAllDayEvent(e));

    // Group by person
    const visibleCalendars = this.calendars.filter(c => c.visible !== false && !this.hiddenCalendars.has(c.entity_id));
    const personGroups = groupEventsByPerson(timedEvents, visibleCalendars);
    const personKeys = Array.from(personGroups.keys());

    // Compute now indicator position
    const now = new Date();
    const isCurrentDay = now.toDateString() === this.currentDate.toDateString();
    const nowMinutes = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
    const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const nowPercent = isCurrentDay ? (nowMinutes / totalMinutes) * 100 : -1;

    if (visibleCalendars.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>No calendars visible</p>
        </div>
      `;
    }

    return html`
      <div class="day-container">
        ${allDayEvents.length > 0 ? html`
          <div class="all-day-section">
            <div class="all-day-gutter">All Day</div>
            <div class="all-day-events">
              ${allDayEvents.map(e => html`
                <div
                  class="all-day-chip"
                  style="background: ${e.calendar_color}"
                  @click=${() => this._onEventClick(e)}
                >${e.summary}</div>
              `)}
            </div>
          </div>
        ` : nothing}

        ${!this.hideColumnHeaders ? html`
          <div class="column-headers">
            <div class="header-gutter"></div>
            ${personKeys.map(key => {
              const cal = visibleCalendars.find(c => (c.person_entity || c.entity_id) === key);
              const avatar = cal?.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
              const name = cal?.person_entity
                ? getPersonName(this.hass, cal.person_entity)
                : cal?.display_name || key;
              const color = cal?.color || '#6366F1';
              return html`
                <div class="person-header">
                  ${avatar
                    ? html`<img class="person-avatar" src="${avatar}" alt="${name}" />`
                    : html`<div class="person-initial" style="background: ${color}">${name[0]?.toUpperCase() || '?'}</div>`}
                  <span class="person-name">${name}</span>
                </div>
              `;
            })}
          </div>
        ` : nothing}

        <div class="time-grid-wrapper">
          <div class="time-grid">
            <div class="time-gutter">
              ${this._renderTimeLabels()}
            </div>
            <div class="columns-area">
              ${this._renderHourLines()}
              ${nowPercent >= 0 && nowPercent <= 100 ? html`
                <div class="pv-now-line" style="top: ${nowPercent}%"></div>
              ` : nothing}
              ${personKeys.map(key => this._renderColumn(key, personGroups.get(key) || []))}
            </div>
          </div>
        </div>
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
      labels.push(html`
        <div class="time-label" style="top: ${top}%">${label}</div>
      `);
    }
    return labels;
  }

  private _renderHourLines() {
    const lines: ReturnType<typeof html>[] = [];
    for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
      const top = ((h - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100;
      lines.push(html`
        <div class="hour-line" style="top: ${top}%"></div>
      `);
    }
    return lines;
  }

  private _renderColumn(personKey: string, events: CalendarEvent[]) {
    const positioned = detectOverlaps(events);

    return html`
      <div class="person-column">
        ${positioned.map(event => {
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR);
          const width = event.totalColumns > 1
            ? `calc(${100 / event.totalColumns}% - 4px)`
            : 'calc(100% - 4px)';
          const left = event.totalColumns > 1
            ? `calc(${(event.column / event.totalColumns) * 100}% + 2px)`
            : '2px';

          return html`
            <div
              class="positioned-event"
              style="
                top: ${pos.top}%;
                height: ${pos.height}%;
                width: ${width};
                left: ${left};
                --event-color: ${event.calendar_color};
              "
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
