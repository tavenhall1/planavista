import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../types';
import { baseStyles, eventStyles, nowIndicatorStyles, animationStyles } from '../styles/shared';
import { formatTime } from '../utils/date-utils';
import {
  isAllDayEvent,
  isEventPast,
  groupEventsByPerson,
  getEventsForDateRange,
  getEventPosition,
  detectOverlaps,
  filterVisibleEvents,
} from '../utils/event-utils';
import { getPersonAvatar, getPersonName } from '../utils/ha-utils';
import { contrastText } from '../styles/themes';

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
  @property({ attribute: false }) avatarBorderMode: string = 'primary';
  @property({ attribute: false }) sharedEventMap: Map<string, Array<{ entity_id: string; calendar_name: string; calendar_color: string; person_entity: string }>> = new Map();
  @property({ type: Number }) tick = 0;

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

      .all-day-chip.past { opacity: 0.45; }

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
        border: 3px solid var(--pv-avatar-border, var(--pv-border-subtle));
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
        /* Hide scrollbar but keep scroll functionality */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
      }

      .time-grid-wrapper::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
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
        margin-left: 4px;
        min-width: 0;
        overflow: hidden;
      }

      .person-column:first-child {
        margin-left: 0;
      }

      /* Hour lines — transparent, replaced by alternating bands */
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

      /* Positioned events — light background, accent border */
      .positioned-event {
        position: absolute;
        left: 3px;
        right: 3px;
        padding: 6px 10px;
        border-radius: var(--pv-radius-sm, 4px);
        border-left: 3px solid var(--event-color);
        background: var(--event-color-light, color-mix(in srgb, var(--event-color) 12%, white));
        cursor: pointer;
        overflow: hidden;
        transition: all 200ms ease;
        z-index: 1;
        min-height: 26px;
      }

      .positioned-event.past { opacity: 0.45; }

      .positioned-event:hover {
        z-index: 5;
        background: color-mix(in srgb, var(--event-color) 16%, white);
        transform: translateY(-1px);
      }

      .positioned-event .event-title {
        font-size: 0.9375rem;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--event-text, var(--pv-text));
      }

      .positioned-event .event-time {
        font-size: 0.8125rem;
        color: var(--event-text, var(--pv-text-secondary));
        margin-top: 2px;
        font-weight: 500;
      }

      .event-participants {
        display: flex;
        margin-top: 2px;
      }

      .event-participant-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid var(--participant-color, var(--event-color));
        margin-left: -4px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .event-participant-avatar:first-child {
        margin-left: 0;
      }

      .event-participant-initial {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1.5px solid var(--participant-color, var(--event-color));
        margin-left: -4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .event-participant-initial:first-child {
        margin-left: 0;
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

      /* Date banner (shown when viewing a day other than today) */
      .date-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        color: var(--pv-accent, #6366F1);
        font-size: 0.9375rem;
        font-weight: 600;
        background: var(--pv-border-subtle, rgba(0, 0, 0, 0.03));
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
        animation: pv-banner-slide-in 350ms cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .date-banner ha-icon {
        --mdc-icon-size: 18px;
      }

      @keyframes pv-banner-slide-in {
        from {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          opacity: 0;
        }
        to {
          max-height: 60px;
          padding-top: 12px;
          padding-bottom: 12px;
          opacity: 1;
        }
      }

      /* Next day footer */
      .next-day-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        cursor: pointer;
        color: var(--pv-accent, #6366F1);
        font-size: 0.9375rem;
        font-weight: 600;
        background: var(--pv-border-subtle, rgba(0, 0, 0, 0.03));
        border-top: 1px solid var(--pv-border);
        transition: background 200ms ease;
        flex-shrink: 0;
        -webkit-tap-highlight-color: transparent;
      }

      .next-day-footer:hover {
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 8%, transparent);
      }

      .next-day-footer ha-icon {
        --mdc-icon-size: 20px;
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

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — hide column headers, compact events */
      @media (max-width: 479px) {
        .column-headers { display: none; }
        .time-gutter { width: 40px; }
        .all-day-gutter { width: 40px; font-size: 0.5625rem; }
        .time-label { font-size: 0.5625rem; }
        .positioned-event { padding: 3px 6px; }
        .event-title { font-size: 0.75rem; }
        .event-time { display: none; }
        .next-day-footer { padding: 10px; font-size: 0.8125rem; }
      }

      /* sm: large phones — hide column headers, narrower gutter */
      @media (min-width: 480px) and (max-width: 767px) {
        .column-headers { display: none; }
        .time-gutter { width: 48px; }
        .all-day-gutter { width: 48px; }
        .positioned-event { padding: 4px 8px; }
        .event-title { font-size: 0.875rem; }
      }

      /* md: tablets — smaller avatars */
      @media (min-width: 768px) and (max-width: 1023px) {
        .person-avatar, .person-initial { width: 48px; height: 48px; font-size: 1.125rem; }
        .person-name { font-size: 0.8125rem; }
      }

      /* short height — compact avatars */
      @media (max-height: 500px) {
        .person-avatar, .person-initial { width: 32px; height: 32px; font-size: 0.875rem; }
        .person-header { padding: 0.375rem 0.25rem; gap: 3px; }
        .person-name { font-size: 0.75rem; }
      }

      /* tall height — larger avatars */
      @media (min-height: 901px) {
        .person-avatar, .person-initial { width: 64px; height: 64px; }
      }

      /* lg: large screens (1024–1439px) — scale up ~20% */
      @media (min-width: 1024px) {
        .time-gutter { width: 72px; }
        .time-label { font-size: 0.8125rem; }
        .all-day-gutter { width: 72px; font-size: 0.8125rem; }
        .header-gutter { width: 72px; }
        .all-day-chip { font-size: 0.9375rem; min-height: 30px; }
        .positioned-event { min-height: 30px; }
        .event-title { font-size: 1.0625rem; }
        .event-time { font-size: 0.9375rem; }
        .person-name { font-size: 1rem; }
        .next-day-footer { font-size: 1.0625rem; }
      }

      /* xl: wall displays (1440px+) — scale up ~40% */
      @media (min-width: 1440px) {
        .time-gutter { width: 84px; }
        .time-label { font-size: 0.9375rem; }
        .all-day-gutter { width: 84px; font-size: 0.9375rem; }
        .header-gutter { width: 84px; }
        .all-day-chip { font-size: 1.0625rem; min-height: 34px; padding: 6px 14px; }
        .positioned-event { min-height: 34px; padding: 8px 12px; }
        .event-title { font-size: 1.1875rem; }
        .event-time { font-size: 1.0625rem; }
        .person-avatar, .person-initial { width: 72px; height: 72px; font-size: 1.5rem; }
        .person-name { font-size: 1.125rem; }
        .next-day-footer { font-size: 1.1875rem; padding: 18px; }
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
                  class="all-day-chip${isEventPast(e) ? ' past' : ''}"
                  style="background: ${e.calendar_color}; color: ${contrastText(e.calendar_color)}"
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
              const colorLight = cal?.color_light || color;
              const borderColor = this.avatarBorderMode === 'light' ? colorLight
                : this.avatarBorderMode === 'primary' ? color
                : this.avatarBorderMode;
              return html`
                <div class="person-header">
                  ${avatar
                    ? html`<img class="person-avatar" src="${avatar}" alt="${name}"
                        style="${borderColor ? `--pv-avatar-border: ${borderColor}` : ''}" />`
                    : html`<div class="person-initial" style="background: ${color}">${name[0]?.toUpperCase() || '?'}</div>`}
                  <span class="person-name">${name}</span>
                </div>
              `;
            })}
          </div>
        ` : nothing}

        ${!isCurrentDay ? html`
          <div class="date-banner">
            <ha-icon icon="mdi:calendar-today"></ha-icon>
            ${this.currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
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
          ${this._renderNextDayFooter()}
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
        label = `${String(h % 24).padStart(2, '0')}:00`;
      } else {
        const hNorm = h % 24; // 24 → 0 (midnight)
        const hour12 = hNorm % 12 || 12;
        const period = hNorm >= 12 ? 'PM' : 'AM';
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
    const totalHours = DAY_END_HOUR - DAY_START_HOUR;
    const bandHeight = (1 / totalHours) * 100;
    for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
      const top = ((h - DAY_START_HOUR) / totalHours) * 100;
      if (h % 2 === 1) {
        lines.push(html`
          <div class="hour-band-odd" style="top: ${top}%; height: ${bandHeight}%"></div>
        `);
      }
    }
    return lines;
  }

  private _renderNextDayFooter() {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const label = nextDay.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return html`
      <div class="next-day-footer" @click=${this._goToNextDay}>
        ${label}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </div>
    `;
  }

  private _goToToday() {
    this.dispatchEvent(new CustomEvent('day-click', {
      detail: { date: new Date() },
      bubbles: true,
      composed: true,
    }));
  }

  private _goToNextDay() {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.dispatchEvent(new CustomEvent('day-click', {
      detail: { date: nextDay },
      bubbles: true,
      composed: true,
    }));
  }

  private _renderColumn(personKey: string, events: CalendarEvent[]) {
    const positioned = detectOverlaps(events);

    return html`
      <div class="person-column">
        ${positioned.map(event => {
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR);
          const width = event.totalColumns > 1
            ? `calc(${100 / event.totalColumns}% - 6px)` // 6px = 3px left accent border + 3px right gap
            : 'calc(100% - 6px)';
          const left = event.totalColumns > 1
            ? `calc(${(event.column / event.totalColumns) * 100}% + 3px)`
            : '3px';

          // Check if this is a shared event with multiple participants
          const sharedInfo = event.uid ? this.sharedEventMap.get(event.uid) : undefined;
          const isShared = sharedInfo && sharedInfo.length > 1;

          return html`
            <div
              class="positioned-event${isEventPast(event) ? ' past' : ''}"
              style="
                top: ${pos.top}%;
                height: ${pos.height}%;
                width: ${width};
                left: ${left};
                --event-color: ${event.calendar_color};
                --event-color-light: ${event.calendar_color_light || ''};
                --event-text: ${contrastText(event.calendar_color_light || event.calendar_color)};
              "
              @click=${() => this._onEventClick(event)}
            >
              <div class="event-title">${event.summary}</div>
              <div class="event-time">${formatTime(event.start, this.timeFormat)}</div>
              ${isShared ? html`
                <div class="event-participants">
                  ${sharedInfo!.map(p => {
                    const avatar = p.person_entity ? getPersonAvatar(this.hass, p.person_entity) : null;
                    const name = p.person_entity
                      ? getPersonName(this.hass, p.person_entity)
                      : p.calendar_name;
                    return avatar
                      ? html`<img class="event-participant-avatar"
                          src="${avatar}" alt="${name}"
                          style="--participant-color: ${p.calendar_color}" />`
                      : html`<div class="event-participant-initial"
                          style="background: ${p.calendar_color}; --participant-color: ${p.calendar_color}"
                        >${name[0]?.toUpperCase() || '?'}</div>`;
                  })}
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
