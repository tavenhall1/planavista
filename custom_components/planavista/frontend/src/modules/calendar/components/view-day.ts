import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { peopleStripStyles } from '../../../styles/controls';
import { statusStyles } from '../../../styles/status';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig } from '../../../types';
import { baseStyles, eventStyles, nowIndicatorStyles, animationStyles } from '../../../styles/shared';
import { formatTime, parseEventDate } from '../../../utils/date-utils';
import { timeOnDay } from '../event-words';
import {
  isAllDayEvent,
  isEventPast,
  groupEventsByPerson,
  getEventsForDateRange,
  getEventPosition,
  detectOverlaps,
  filterVisibleEvents,
} from '../utils/event-utils';
import { getPersonAvatar, getPersonName } from '../../../utils/ha-utils';
import { onColor } from '../../../core/dimming';
import { stripStart } from '../../../core/people-strip';
import { groupSameEvents, sameEventKey } from '../calendar-derive';
import type { Layout } from '../../../core/layout';
import { HOUR_PX, MIN_CHIP_PX, dayHourHeight, rescaleScroll } from '../layout-rules';

/** Enough of a person to draw their face on an event. */
interface FaceOf {
  calendar_name: string;
  calendar_color: string;
  person_entity: string;
}

/** Today's chore progress for one person (spec 13.9: rings in the Day view). */
export type ProgressOf = (memberId: string) => { done: number; pending: number; due: number } | null;

/** The ring's fraction and its words for a screen reader. */
export function dayRing(name: string, progress: { done: number; pending: number; due: number } | null): { fraction: number; closed: boolean; label: string } | null {
  if (!progress || progress.due <= 0) return null;
  const finished = Math.min(progress.due, progress.done + progress.pending);
  const closed = finished >= progress.due;
  return {
    fraction: finished / progress.due,
    closed,
    label: closed ? `${name}, ring closed for today. Open ${name}'s day` : `${name}, ${finished} of ${progress.due} done today. Open ${name}'s day`,
  };
}

const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;

/**
 * pv-view-day: the calendar's Day view, a column per person.
 *
 * @fires pv-open - { module: 'chores', view: 'my_day', member } a person's ring was tapped
 */
export class PVViewDay extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) events: CalendarEvent[] = [];
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Object }) currentDate: Date = new Date();
  @property({ type: Object }) hiddenCalendars: Set<string> = new Set();
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: Boolean }) hideColumnHeaders = false;
  /** Whose lane a narrow card shows (milestone 8): picked on the strip, else the account's own person. */
  @state() private _dayPick: string | null = null;
  @property({ attribute: false }) avatarBorderMode: string = 'primary';
  @property({ attribute: false }) sharedEventMap: Map<string, Array<{ entity_id: string; calendar_name: string; calendar_color: string; person_entity: string }>> = new Map();
  @property({ type: Number }) tick = 0;
  /**
   * The card's layout: portrait fits about 14 hours on screen (spec 12.2). The hours fit the
   * space, so this view doesn't shrink the header: each step would re-fit them mid-scroll.
   */
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Today's chore progress per person, when Chores is on: each column header gets a ring. */
  @property({ attribute: false }) progress: ProgressOf | null = null;
  /** Bumped when chores change, so the rings redraw. */
  @property({ attribute: false }) revision = 0;

  /** The hour height in px; the grid, the events, and the now-line all scale with it. */
  @state() private _hourPx = HOUR_PX;
  private _hoursObserver?: ResizeObserver;
  /** The scrolling grid being measured; it's missing while no calendar is visible. */
  private _measured: HTMLElement | null = null;

  static styles = [
    peopleStripStyles,
    statusStyles,
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
        min-height: 48px;
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
        font-weight: 500;
      }

      .all-day-events {
        flex: 1;
        display: flex;
        gap: 0 0.375rem;
        flex-wrap: wrap;
        padding: 0 0.5rem;
      }

      /* Names and the date in the rounded face (spec 11.2). */
      .person-name,
      .date-banner {
        font-family: var(--pv-font-heading, inherit);
        font-weight: 700;
      }

      .next-day-footer {
        width: 100%;
        min-height: 48px;
        border: none;
        font-family: var(--pv-font-heading, inherit);
        font-weight: 700;
      }

      .all-day-chip:focus-visible .all-day-pill,
      .positioned-event:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 1px;
      }

      /* A 48 px target with the pill drawn inside, like the header's chips. */
      .all-day-chip {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        max-width: 200px;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      .all-day-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        box-sizing: border-box;
        min-width: 0;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-white, #FFFFFF);
        transition: all 200ms ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      }

      .all-day-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .all-day-pill .event-participants {
        margin-top: 0;
        flex-shrink: 0;
      }

      /* On the pill, a ring in the pill's ink keeps the face of the person whose color it is visible. */
      .all-day-pill .event-participant-initial,
      .all-day-pill .event-participant-avatar {
        width: 20px;
        height: 20px;
        border-color: currentColor;
        font-size: 0.5625rem;
      }

      .all-day-chip.past .all-day-pill { opacity: 0.45; }

      .all-day-chip:hover .all-day-pill {
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

      .ring-wrap {
        position: relative;
        display: inline-flex;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .ring-wrap:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 8px;
      }

      .ring-wrap svg {
        position: absolute;
        inset: -7px;
        width: calc(100% + 14px);
        height: calc(100% + 14px);
        transform: rotate(-90deg);
        pointer-events: none;
        overflow: visible;
      }

      .ring-wrap .track {
        stroke: var(--pv-track, #ECECE8);
      }

      .ring-wrap .done {
        transition: stroke-dashoffset 600ms ease;
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
        color: var(--pv-white, #FFFFFF);
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
        height: calc(${DAY_END_HOUR - DAY_START_HOUR} * var(--pv-hour-px, ${HOUR_PX}px));
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

      /* Hour lines: transparent, replaced by alternating bands */
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

      /* Positioned events: light background, accent border */
      .positioned-event {
        position: absolute;
        left: 3px;
        right: 3px;
        /* Its width is the lane's less the gaps, padding and accent included, so it never runs into the next lane. */
        box-sizing: border-box;
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

      /* As on Week's chips: everyone's faces at the top right, so a short event keeps them in view. */
      .positioned-event .event-participants {
        position: absolute;
        top: 6px;
        right: 6px;
        margin: 0;
      }

      .positioned-event.brief {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding-top: 4px;
        padding-bottom: 4px;
      }

      .positioned-event.brief .event-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .positioned-event.brief .event-title {
        flex-shrink: 3;
      }

      .positioned-event.brief .event-time {
        margin-top: 0;
        flex-shrink: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .positioned-event.shared .event-title,
      .positioned-event.shared .event-time {
        padding-right: 40px;
      }

      /* A brief chip's title and time share one row: the faces' room is kept once, on the chip (round 1). */
      .positioned-event.brief.shared {
        padding-right: 48px;
      }

      .positioned-event.brief.shared .event-title,
      .positioned-event.brief.shared .event-time {
        padding-right: 0;
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
        color: var(--pv-white, #FFFFFF);
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
      /* A quiet line on a day with nothing on it (spec 11.6); the lanes stay. */
      .day-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        min-height: 48px;
        padding: 0 16px;
        color: var(--pv-text-secondary);
        font-size: 0.9375rem;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0, 0, 0, 0.04));
        flex-shrink: 0;
      }

      .day-empty-add {
        min-height: 48px;
        padding: 0 12px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent));
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .date-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
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
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
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


      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* Wide enough for every lane's header: the strip stays out of the way. */
      .day-people { display: none; }
      .day-people .person-avatar,
      .day-people .person-initial { width: 28px; height: 28px; margin: 6px; font-size: 0.75rem; }

      /* xs: phones, hide column headers, compact events; one person at a time with the strip (milestone 8) */
      @container pv-calendar (max-width: 479px) {
        .column-headers { display: none; }
        .day-people { display: flex; }
        .person-column:not(.chosen) { display: none; }
        .all-day-chip.other,
        .all-day-section.none-chosen { display: none; }
        .time-gutter { width: 40px; }
        .all-day-gutter { width: 40px; font-size: 0.5625rem; }
        .time-label { font-size: 0.5625rem; }
        .positioned-event { padding: 3px 6px; }
        .positioned-event .event-title { font-size: 0.75rem; }
        .positioned-event .event-time { display: none; }
        .next-day-footer { padding: 10px; font-size: 0.8125rem; }
      }

      /* sm: large phones, hide column headers, narrower gutter; one person at a time with the strip */
      @container pv-calendar (min-width: 480px) and (max-width: 767px) {
        .column-headers { display: none; }
        .day-people { display: flex; }
        .person-column:not(.chosen) { display: none; }
        .all-day-chip.other,
        .all-day-section.none-chosen { display: none; }
        .time-gutter { width: 48px; }
        .all-day-gutter { width: 48px; }
        .positioned-event { padding: 4px 8px; }
        .positioned-event .event-title { font-size: 0.875rem; }
      }

      /* md: tablets, smaller avatars */
      @container pv-calendar (min-width: 768px) and (max-width: 1023px) {
        .person-avatar, .person-initial { width: 48px; height: 48px; font-size: 1.125rem; }
        .person-name { font-size: 0.8125rem; }
      }

      /* short height: compact avatars, and the hours keep the room (round 2: 39 px of hours on a 384 px card) */
      @media (max-height: 500px) {
        .person-avatar, .person-initial { width: 32px; height: 32px; font-size: 0.875rem; }
        .person-header { padding: 0.375rem 0.25rem; gap: 3px; }
        .person-name { font-size: 0.75rem; }
        .day-people .person-avatar,
        .day-people .person-initial { width: 24px; height: 24px; margin: 2px; font-size: 0.6875rem; }
        .day-container { position: relative; }
        .day-empty { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; pointer-events: none; background: color-mix(in srgb, var(--pv-card-bg, #FFFFFF) 90%, transparent); }
        .day-empty-add { pointer-events: auto; }
      }

      /* tall height: larger avatars */
      @media (min-height: 901px) {
        .person-avatar, .person-initial { width: 64px; height: 64px; }
      }

      /* lg: large screens (1024–1439px), scale up ~20% */
      @container pv-calendar (min-width: 1024px) {
        .time-gutter { width: 72px; }
        .time-label { font-size: 0.8125rem; }
        .all-day-gutter { width: 72px; font-size: 0.8125rem; }
        .header-gutter { width: 72px; }
        .all-day-pill { font-size: 0.9375rem; }
        .positioned-event { min-height: 30px; }
        .positioned-event .event-title { font-size: 1.0625rem; }
        .positioned-event .event-time { font-size: 0.9375rem; }
        .person-name { font-size: 1rem; }
        .next-day-footer { font-size: 1.0625rem; }
      }

      /* xl: wall displays (1440px+), scale up ~40% */
      @container pv-calendar (min-width: 1440px) {
        .time-gutter { width: 84px; }
        .time-label { font-size: 0.9375rem; }
        .all-day-gutter { width: 84px; font-size: 0.9375rem; }
        .header-gutter { width: 84px; }
        .all-day-pill { font-size: 1.0625rem; }
        .positioned-event { min-height: 34px; padding: 8px 12px; }
        .positioned-event .event-title { font-size: 1.1875rem; }
        .positioned-event .event-time { font-size: 1.0625rem; }
        .person-avatar, .person-initial { width: 72px; height: 72px; font-size: 1.5rem; }
        .person-name { font-size: 1.125rem; }
        .next-day-footer { font-size: 1.1875rem; padding: 18px; }
      }
    `,
  ];

  private _scrollContainer?: HTMLElement;

  connectedCallback(): void {
    super.connectedCallback();
    // Moved within the page: measure again (an element that never rendered waits for updated()).
    if (this.hasUpdated) this._watchHours();
  }

  /** A ring opens that person's My day (spec 13.9). */
  private _openDay(member: string): void {
    this.dispatchEvent(new CustomEvent('pv-open', { detail: { module: 'chores', view: 'my_day', member }, bubbles: true, composed: true }));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._hoursObserver?.disconnect();
    this._measured = null;
  }

  firstUpdated() {
    // Fit the hours before scrolling to now; fitting afterwards would stop that scroll.
    this._watchHours();
    this._fitHours();
    this._scrollToNow();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('currentDate')) {
      this._scrollToNow();
    }
    this._watchHours();
    if (changedProps.has('layout')) this._fitHours();
  }

  /** Measure the scrolling grid whenever it's a new element. */
  private _watchHours(): void {
    const wrapper = this.shadowRoot?.querySelector<HTMLElement>('.time-grid-wrapper') ?? null;
    if (wrapper === this._measured) return;
    this._hoursObserver?.disconnect();
    this._measured = wrapper;
    if (!wrapper || typeof ResizeObserver === 'undefined') return;
    this._hoursObserver ??= new ResizeObserver(() => this._fitHours());
    this._hoursObserver.observe(wrapper);
  }

  /** Size the hours for the layout, keeping the same time at the top (turning the tablet keeps your place). */
  private _fitHours(): void {
    const wrapper = this._measured;
    if (!wrapper) return;
    const next = dayHourHeight(this.layout, wrapper.clientHeight);
    if (next === this._hourPx) return;
    const top = rescaleScroll(wrapper.scrollTop, this._hourPx, next);
    this._hourPx = next;
    void this.updateComplete.then(() => {
      wrapper.scrollTop = top;
    });
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

  /** Who an event is for, as one copy's calendar names them. */
  private _participant(event: CalendarEvent, calendars: CalendarConfig[]): FaceOf {
    const cal = calendars.find(c => c.entity_id === event.calendar_entity_id);
    return {
      calendar_name: event.calendar_name || cal?.display_name || '',
      calendar_color: event.calendar_color || cal?.color || '',
      person_entity: cal?.person_entity || '',
    };
  }

  /** The faces of everyone an event is for: their photo, or their initial on their color. */
  private _faces(people: readonly FaceOf[]) {
    return html`
      <div class="event-participants">
        ${people.map(p => {
          const avatar = p.person_entity ? getPersonAvatar(this.hass, p.person_entity) : null;
          const name = p.person_entity ? getPersonName(this.hass, p.person_entity) : p.calendar_name;
          return avatar
            ? html`<img class="event-participant-avatar" src="${avatar}" alt="${name}"
                style="--participant-color: ${p.calendar_color}" />`
            : html`<div class="event-participant-initial"
                style="background: ${p.calendar_color}; --participant-color: ${p.calendar_color}; color: ${onColor(p.calendar_color)}"
              >${name[0]?.toUpperCase() || '?'}</div>`;
        })}
      </div>
    `;
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
    const chosenKey = stripStart(personKeys, this._dayPick, this._ownPerson(personKeys));
    const keyOf = (e: CalendarEvent): string | null => {
      const cal = visibleCalendars.find(c => c.entity_id === e.calendar_entity_id);
      return cal ? (cal.person_entity || cal.entity_id) : null;
    };

    // Compute now indicator position
    const now = new Date();
    const isCurrentDay = now.toDateString() === this.currentDate.toDateString();
    const nowMinutes = (now.getHours() - DAY_START_HOUR) * 60 + now.getMinutes();
    const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
    const nowPercent = isCurrentDay ? (nowMinutes / totalMinutes) * 100 : -1;

    if (visibleCalendars.length === 0) {
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">📅</div>
          <h2>Every calendar is hidden</h2>
          <p>Show them again to see what's coming up.</p>
        </div>
      `;
    }

    return html`
      <div class="day-container" style="--pv-hour-px: ${this._hourPx}px">
        ${personKeys.length > 1 ? html`
          <div class="pv-people day-people" role="tablist" aria-label="Whose day">
            ${personKeys.map(key => {
              const face = this._face(key, visibleCalendars);
              return html`
                <button type="button" class="pv-person" role="tab" aria-selected=${key === chosenKey ? 'true' : 'false'}
                  style="--member:${face.color}" @click=${() => { this._dayPick = key; }}>${face.picture}<span class="pv-person-name">${face.name}</span></button>
              `;
            })}
          </div>
        ` : nothing}
        ${allDayEvents.length > 0 ? html`
          <div class="all-day-section ${allDayEvents.some(e => keyOf(e) === chosenKey) ? '' : 'none-chosen'}">
            <div class="all-day-gutter">All day</div>
            <div class="all-day-events">
              ${groupSameEvents(allDayEvents).map(copies => {
                // One pill per event, with everyone's faces when it is on several calendars (spec 3.3).
                const e = copies.find(c => keyOf(c) === chosenKey) ?? copies[0];
                const mine = copies.some(c => keyOf(c) === chosenKey);
                return html`
                  <div
                    class="all-day-chip${isEventPast(e) ? ' past' : ''}${mine ? '' : ' other'}"
                    role="button"
                    tabindex="0"
                    @click=${() => this._onEventClick(e)}
                    @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, e)}
                  ><span class="all-day-pill" style="background: ${e.calendar_color}; color: ${onColor(e.calendar_color)}">
                    <span class="all-day-name">${e.summary}</span>
                    ${copies.length > 1 ? this._faces(copies.map(c => this._participant(c, visibleCalendars))) : nothing}
                  </span></div>
                `;
              })}
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
              const picture = avatar
                ? html`<img class="person-avatar" src="${avatar}" alt="${name}"
                    style="${borderColor ? `--pv-avatar-border: ${borderColor}` : ''}" />`
                : html`<div class="person-initial" style="background: ${color}; color: ${onColor(color)}">${name[0]?.toUpperCase() || '?'}</div>`;
              const ring = isCurrentDay && cal?.member_id && this.progress ? dayRing(name, this.progress(cal.member_id)) : null;
              return html`
                <div class="person-header">
                  ${ring ? html`
                    <button class="ring-wrap" type="button" aria-label=${ring.label}
                      @click=${() => this._openDay(cal!.member_id!)}>
                      ${picture}
                      <svg viewBox="0 0 100 100" aria-hidden="true">
                        <circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="6"></circle>
                        <circle class="done" cx="50" cy="50" r="46" fill="none" stroke=${color} stroke-width="6" stroke-linecap="round"
                          stroke-dasharray=${2 * Math.PI * 46} stroke-dashoffset=${2 * Math.PI * 46 * (1 - ring.fraction)}></circle>
                      </svg>
                    </button>
                  ` : picture}
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

        ${dayEvents.length === 0 ? html`
          <div class="day-empty" role="status">
            <span>${isCurrentDay
              ? 'Nothing on the calendar today.'
              : `Nothing on the calendar on ${this.currentDate.toLocaleDateString('en-US', { weekday: 'long' })}.`}</span>
            <button class="day-empty-add" type="button" @click=${this._addEvent}>New event</button>
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
              ${personKeys.map(key => this._renderColumn(key, personGroups.get(key) || [], key === chosenKey))}
            </div>
          </div>
          ${this._renderNextDayFooter()}
        </div>
      </div>
    `;
  }

  /** The account's own person, when one of the lanes is theirs. */
  private _ownPerson(keys: string[]): string | null {
    const user = this.hass?.user?.id;
    if (!user) return null;
    const person = Object.values(this.hass.states).find(s =>
      s.entity_id.startsWith('person.') && (s.attributes as { user_id?: string }).user_id === user);
    return person && keys.includes(person.entity_id) ? person.entity_id : null;
  }

  /** A lane's person as the strip draws them: their photo or initial, and name. */
  private _face(key: string, calendars: CalendarConfig[]) {
    const cal = calendars.find(c => (c.person_entity || c.entity_id) === key);
    const avatar = cal?.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
    const name = cal?.person_entity ? getPersonName(this.hass, cal.person_entity) : cal?.display_name || key;
    const color = cal?.color || '#6366F1';
    const picture = avatar
      ? html`<img class="person-avatar" src="${avatar}" alt="" />`
      : html`<div class="person-initial" style="background: ${color}; color: ${onColor(color)}">${name[0]?.toUpperCase() || '?'}</div>`;
    return { name, color, picture };
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
      <button class="next-day-footer" type="button" aria-label="Go to ${label}" @click=${this._goToNextDay}>
        ${label}
        <ha-icon icon="mdi:arrow-down"></ha-icon>
      </button>
    `;
  }

  /** New event on the day shown (the module opens the editor). */
  private _addEvent = (): void => {
    this.dispatchEvent(new CustomEvent('create-event', { detail: { date: this.currentDate }, bubbles: true, composed: true }));
  };

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

  private _renderColumn(personKey: string, events: CalendarEvent[], chosen: boolean) {
    // Lanes by the height each chip is drawn: a brief chip is taller than its slot (round 2).
    const positioned = detectOverlaps(events, (MIN_CHIP_PX / this._hourPx) * 3_600_000);

    return html`
      <div class="person-column ${chosen ? 'chosen' : ''}">
        ${positioned.map(event => {
          // Clip to the viewed day so overnight events draw their full portion
          const pos = getEventPosition(event, DAY_START_HOUR, DAY_END_HOUR, this.currentDate);
          const width = event.totalColumns > 1
            ? `calc(${100 / event.totalColumns}% - 6px)` // 6px = 3px left accent border + 3px right gap
            : 'calc(100% - 6px)';
          const left = event.totalColumns > 1
            ? `calc(${(event.column / event.totalColumns) * 100}% + 3px)`
            : '3px';

          // Check if this is a shared event with multiple participants
          const sharedInfo = this.sharedEventMap.get(sameEventKey(event));
          const isShared = sharedInfo && sharedInfo.length > 1;
          // Under 45 minutes, the title and time share one line so the chip fits its slot.
          const brief = parseEventDate(event.end).getTime() - parseEventDate(event.start).getTime() < 45 * 60_000;

          return html`
            <div
              class="positioned-event${isEventPast(event) ? ' past' : ''}${isShared ? ' shared' : ''}${brief ? ' brief' : ''}"
              style="
                top: ${pos.top}%;
                height: ${pos.height}%;
                width: ${width};
                left: ${left};
                --event-color: ${event.calendar_color};
                --event-color-light: ${event.calendar_color_light || ''};
                --event-text: ${onColor(event.calendar_color_light || event.calendar_color)};
              "
              role="button"
              tabindex="0"
              @click=${() => this._onEventClick(event)}
              @keydown=${(ev: KeyboardEvent) => this._onEventKey(ev, event)}
            >
              <div class="event-title">${event.summary}</div>
              <div class="event-time">${parseEventDate(event.start) < new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate())
                ? timeOnDay(event.start, event.end, this.currentDate, this.timeFormat) : formatTime(event.start, this.timeFormat)}</div>
              ${isShared ? this._faces(sharedInfo!) : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  /** Enter or Space opens an event, as a tap does (spec 11.8). */
  private _onEventKey(ev: KeyboardEvent, event: CalendarEvent) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    ev.preventDefault();
    this._onEventClick(event);
  }

  private _onEventClick(event: CalendarEvent) {
    this.dispatchEvent(new CustomEvent('event-click', {
      detail: { event },
      bubbles: true,
      composed: true,
    }));
  }
}

defineElement('pv-view-day', PVViewDay);
