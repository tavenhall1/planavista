import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import type { Layout } from '../../core/layout';
import type { Mode, ThemeShape } from '../../styles/theme-pairs';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../../styles/shared';
import { getPersonAvatar, getPersonName } from '../../utils/ha-utils';
import { swipeDirection } from '../../utils/gestures';
import { memoizeOne } from '../../utils/render-cache';
import { ForecastEntry } from '../../utils/weather-subscription';
import { CalendarStoreController } from './calendar-store';
import { CalendarDerived, deriveCalendarData } from './calendar-derive';

import './components/view-day';
import './components/view-week';
import './components/view-month';
import './components/view-agenda';
import './components/event-popup';
import './components/event-create-dialog';

const DEFAULT_ENTITY = 'sensor.planavista_config';

/**
 * pv-calendar-module: the calendar's toolbar, its four views, and the event
 * popup and dialog. The shell renders it inside the card and hands it the
 * card config, the PlanaVista data, and the resolved display settings.
 *
 * @fires pv-view-change - { view } when it wants another view (a day tapped in Month)
 * @fires pv-overlay-change - { open } when its event popup or dialog opens or closes
 */
export class PvCalendarModule extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) cardConfig?: PlanaVistaCardConfig;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  @property({ attribute: false }) display!: DisplayConfig;
  /** Light or dark, as the card's appearance worked it out (spec 12.4). */
  @property({ attribute: false }) mode: Mode = 'light';
  /** The look's shape settings: event style and avatar border. */
  @property({ attribute: false }) shape: ThemeShape = {};
  /** The card's daily forecast, for Week and Agenda. */
  @property({ attribute: false }) forecast: ForecastEntry[] = [];
  /** The view the shell shows (the bar's choice). */
  @property({ attribute: false }) view: ViewType | undefined;
  /** The card's layout (spec 12.1), passed on to the views. */
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
  @state() private _tick = Math.floor(Date.now() / 60000);
  @state() private _filterOpen = false;
  @state() private _refreshing = false;

  private _pv = new CalendarStoreController(this);
  /** What pv-overlay-change last said, so the card hears each change once. */
  private _overlayOpen = false;
  private _tickTimer: ReturnType<typeof setTimeout> | null = null;
  /** Where the current one-finger touch began; null when there's no swipe in progress. */
  private _touchStart: { x: number; y: number } | null = null;
  private _filterCloseHandler = (e: MouseEvent) => this._onFilterClickOutside(e);

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

/* ================================================================
         TOOLBAR: avatars left, controls right
         ================================================================ */

      .pvc-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--pv-border);
        gap: 8px;
        flex-shrink: 0;
      }

/* -- Filter dropdown -- */

      .pvc-filter-wrap {
        position: relative;
      }

      .pvc-filter-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--pv-radius, 12px);
        border: 1px solid var(--pv-border);
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 40px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-filter-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-filter-btn.has-hidden {
        border-color: var(--pv-accent);
        color: var(--pv-accent);
      }

      .pvc-filter-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 5px;
        border-radius: 10px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .pvc-filter-panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        min-width: 240px;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        z-index: 100;
        padding: 6px 0;
        animation: pvc-dropdown-in 150ms ease;
      }

      @keyframes pvc-dropdown-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .pvc-filter-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        cursor: pointer;
        transition: background 120ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-filter-item:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .pvc-filter-check {
        width: 22px;
        height: 22px;
        border-radius: var(--pv-radius-sm, 6px);
        border: 2px solid var(--pv-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 150ms ease;
      }

      .pvc-filter-item.active .pvc-filter-check {
        background: var(--item-color);
        border-color: var(--item-color);
      }

      .pvc-filter-check-icon {
        color: white;
        font-size: 14px;
        line-height: 1;
      }

      .pvc-filter-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8125rem;
        color: white;
        background-size: cover;
        background-position: center;
      }

      .pvc-filter-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--pv-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pvc-filter-item:not(.active) .pvc-filter-name {
        opacity: 0.5;
      }

/* -- Controls (right side) -- */

      .pvc-controls {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .pvc-new-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 9px 18px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border: none;
        cursor: pointer;
        font-size: 0.9375rem;
        font-weight: 600;
        font-family: inherit;
        transition: all 200ms ease;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        min-height: 40px;
      }

      .pvc-new-btn:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .pvc-new-btn:active {
        transform: translateY(0);
      }

/* Nav buttons */

      .pvc-nav {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .pvc-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        --mdc-icon-size: 24px;
      }

      .pvc-nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-today-btn {
        padding: 6px 16px;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 38px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-today-btn:hover {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-color: var(--pv-accent);
      }

/* ================================================================
         CALENDAR VIEW BODY
         ================================================================ */

      .pvc-body {
        flex: 1;
        overflow: hidden;
        position: relative;
        min-height: 0;
      }

      .pvc-body > * {
        height: 100%;
      }

/* Refresh + Gear buttons */

      .pvc-refresh-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        --mdc-icon-size: 22px;
      }

      .pvc-refresh-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-refresh-btn.spinning ha-icon {
        animation: pvc-spin 0.8s ease;
      }

      @keyframes pvc-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

/* ═══════════════════════════════════════════════
         RESPONSIVE BREAKPOINTS
         ═══════════════════════════════════════════════ */

/* --- Mobile calendar avatar strip (inline in toolbar) --- */

      .pvc-cal-strip {
        display: none; /* hidden on desktop: filter dropdown used instead */
      }

/* Phone: the person chips replace the Calendars dropdown (spec 12.1: the card's own size). */

      :host([layout='phone']) .pvc-toolbar {
        flex-wrap: wrap;
        justify-content: center;
        padding: 8px 10px;
        gap: 6px;
      }

      :host([layout='phone']) .pvc-filter-wrap {
        display: none;
      }

      :host([layout='phone']) .pvc-cal-strip {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding-bottom: 2px;
      }

      :host([layout='phone']) .pvc-cal-strip::-webkit-scrollbar {
        display: none;
      }

      :host([layout='phone']) .pvc-controls {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
        gap: 4px;
      }

/* Calendar strip chips */

      .pvc-cal-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px 4px 4px;
        border-radius: 9999px;
        border: 1.5px solid var(--chip-color, var(--pv-border));
        background: transparent;
        cursor: pointer;
        transition: all 150ms ease;
        flex-shrink: 0;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-cal-chip.active {
        background: color-mix(in srgb, var(--chip-color) 12%, transparent);
      }

      .pvc-cal-chip:not(.active) {
        opacity: 0.4;
        border-color: var(--pv-border);
      }

      .pvc-cal-chip-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.625rem;
        color: white;
        background-size: cover;
        background-position: center;
      }

      .pvc-cal-chip-name {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--pv-text);
        white-space: nowrap;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pvc-cal-chip:not(.active) .pvc-cal-chip-name {
        color: var(--pv-text-muted);
      }

/* lg: large desktops / small wall displays (1024–1439px), scale up ~20% */

      @media (min-width: 1024px){
        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 44px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

/* xl: wall-mounted touch displays (1440px+, 27"+), scale up ~40% */

      @media (min-width: 1440px){
        .pvc-toolbar { padding: 16px 24px; gap: 12px; }
        .pvc-filter-btn { padding: 12px 24px; font-size: 1.125rem; min-height: 56px; }
        .pvc-filter-badge { min-width: 24px; height: 24px; font-size: 0.8125rem; }
        .pvc-filter-avatar { width: 40px; height: 40px; font-size: 1rem; }
        .pvc-filter-name { font-size: 1.0625rem; }
        .pvc-new-btn { padding: 14px 28px; font-size: 1.1875rem; min-height: 56px; }
        .pvc-today-btn { padding: 10px 22px; font-size: 1.125rem; min-height: 52px; }
        .pvc-nav-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._tick = Math.floor(Date.now() / 60000);
    this._scheduleTick();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._tickTimer) {
      clearTimeout(this._tickTimer);
      this._tickTimer = null;
    }
    document.removeEventListener('click', this._filterCloseHandler);
    // A popup that goes away with the module no longer holds the appearance back.
    if (this._overlayOpen) {
      this._overlayOpen = false;
      this._fireOverlay(false);
    }
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    const store = this._pv.store;
    const open = !!(store.selectedEvent || store.dialogOpen);
    if (open !== this._overlayOpen) {
      this._overlayOpen = open;
      this._fireOverlay(open);
    }
  }

  private _fireOverlay(open: boolean): void {
    this.dispatchEvent(new CustomEvent('pv-overlay-change', { detail: { open }, bubbles: true, composed: true }));
  }

  /** Bump `_tick` just after each minute boundary (the header clock has its own timer). */
  private _scheduleTick() {
    if (this._tickTimer) clearTimeout(this._tickTimer);
    this._tickTimer = setTimeout(() => {
      this._tick = Math.floor(Date.now() / 60000);
      this._scheduleTick();
    }, 60000 - (Date.now() % 60000) + 50);
  }

  protected willUpdate(changed: PropertyValues): void {
    // The shell owns which view shows (the bar); the store follows it.
    if (changed.has('view') && this.view) this._pv.store.setView(this.view);
  }

  /** Cached until the data, the card config, or the calendar filter changes. */
  private _derive = memoizeOne((
    data: PlanaVistaData | null,
    config: PlanaVistaCardConfig | undefined,
    hidden: Set<string>,
  ): CalendarDerived => deriveCalendarData(data, config, hidden));

  private _derived(): CalendarDerived {
    return this._derive(this.data, this.cardConfig, this._pv.store.hiddenCalendars);
  }

  render() {
    if (!this.hass || !this.display) return nothing;
    const { calendars, visibleEvents } = this._derived();
    const store = this._pv.store;
    const display = this.display;

    return html`
      ${this._renderToolbar(calendars)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${this._renderView(store.currentView, visibleEvents, calendars, display)}
      </div>

      ${store.selectedEvent ? html`
        <pv-event-popup
          .store=${store}
          .hass=${this.hass}
          .event=${store.selectedEvent}
          .timeFormat=${display?.time_format || '12h'}
        ></pv-event-popup>
      ` : nothing}

      ${store.dialogOpen ? html`
        <pv-event-create-dialog
          .store=${store}
          .hass=${this.hass}
          .calendars=${calendars}
          .open=${true}
          .mode=${store.dialogOpen}
          .prefill=${store.createPrefill}
          .timeFormat=${display?.time_format || '12h'}
          .locationAutocomplete=${display.location_autocomplete === true}
        ></pv-event-create-dialog>
      ` : nothing}
    `;
  }

  private _renderToolbar(calendars: CalendarConfig[]) {
    const hiddenCount = calendars.filter(c => this._pv.store.hiddenCalendars.has(c.entity_id)).length;

    return html`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${hiddenCount > 0 ? 'has-hidden' : ''}"
            @click=${this._toggleFilterDropdown}
          >
            <ha-icon icon="mdi:filter-variant" style="--mdc-icon-size: 20px"></ha-icon>
            Calendars
            ${hiddenCount > 0 ? html`<span class="pvc-filter-badge">${calendars.length - hiddenCount}/${calendars.length}</span>` : nothing}
          </button>

          ${this._filterOpen ? html`
            <div class="pvc-filter-panel">
              ${calendars.map(cal => {
                const isActive = !this._pv.store.hiddenCalendars.has(cal.entity_id);
                const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
                const name = cal.display_name || (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : cal.entity_id);
                const initial = (name || '?')[0].toUpperCase();

                return html`
                  <div
                    class="pvc-filter-item ${isActive ? 'active' : ''}"
                    style="--item-color: ${cal.color}"
                    @click=${() => this._pv.store.toggleCalendar(cal.entity_id)}
                  >
                    <div class="pvc-filter-check">
                      ${isActive ? html`<span class="pvc-filter-check-icon">✓</span>` : nothing}
                    </div>
                    <div
                      class="pvc-filter-avatar"
                      style="${avatar
                        ? `background-image: url(${avatar}); background-color: ${cal.color}`
                        : `background: ${cal.color}`}"
                    >${!avatar ? initial : ''}</div>
                    <span class="pvc-filter-name">${name}</span>
                  </div>
                `;
              })}
            </div>
          ` : nothing}
        </div>

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${calendars.map(cal => {
            const isActive = !this._pv.store.hiddenCalendars.has(cal.entity_id);
            const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
            const name = cal.display_name || (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : cal.entity_id);
            const initial = (name || '?')[0].toUpperCase();
            return html`
              <button
                class="pvc-cal-chip ${isActive ? 'active' : ''}"
                style="--chip-color: ${cal.color}"
                @click=${() => this._pv.store.toggleCalendar(cal.entity_id)}
              >
                <div
                  class="pvc-cal-chip-avatar"
                  style="${avatar
                    ? `background-image: url(${avatar}); background-color: ${cal.color}`
                    : `background: ${cal.color}`}"
                >${!avatar ? initial : ''}</div>
                <span class="pvc-cal-chip-name">${name}</span>
              </button>
            `;
          })}
        </div>

        <div class="pvc-controls">
          <button class="pvc-new-btn" @click=${() => this._pv.store.openCreateDialog()}>
            + New
          </button>

          <div class="pvc-nav">
            <button class="pvc-nav-btn" @click=${() => this._pv.store.navigateDate('prev')}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" @click=${() => this._pv.store.navigateDate('today')}>
              Today
            </button>
            <button class="pvc-nav-btn" @click=${() => this._pv.store.navigateDate('next')}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <button class="pvc-refresh-btn ${this._refreshing ? 'spinning' : ''}"
            @click=${this._refreshCalendars}
            title="Refresh calendars" aria-label="Refresh calendars"
            ?disabled=${this._refreshing}>
            <ha-icon icon="mdi:autorenew"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _toggleFilterDropdown(e: Event) {
    e.stopPropagation();
    this._filterOpen = !this._filterOpen;
    if (this._filterOpen) {
      requestAnimationFrame(() => {
        document.addEventListener('click', this._filterCloseHandler);
      });
    } else {
      document.removeEventListener('click', this._filterCloseHandler);
    }
  }

  private _onFilterClickOutside(e: MouseEvent) {
    const path = e.composedPath();
    const panel = this.shadowRoot?.querySelector('.pvc-filter-panel');
    const btn = this.shadowRoot?.querySelector('.pvc-filter-btn');
    if (panel && !path.includes(panel) && btn && !path.includes(btn)) {
      this._filterOpen = false;
      document.removeEventListener('click', this._filterCloseHandler);
    }
  }

  private _renderView(view: string, events: CalendarEvent[], calendars: CalendarConfig[], display: DisplayConfig | undefined) {
    const timeFormat = display?.time_format || '12h';
    const firstDay = display?.first_day || 'sunday';
    const currentDate = this._pv.store.currentDate;
    const hiddenCalendars = this._pv.store.hiddenCalendars;

    const avatarBorder = this.shape.avatar_border || 'primary';
    const showStripes = (this.shape.event_style || 'stripes') === 'stripes';

    switch (view) {
      case 'day': {
        const { sharedEventMap } = this._derived();
        const tick = this._tick;
        return html`<pv-view-day
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .hideColumnHeaders=${false}
          .avatarBorderMode=${avatarBorder}
          .sharedEventMap=${sharedEventMap}
          .tick=${tick}
        ></pv-view-day>`;
      }
      case 'week': {
        const tick = this._tick;
        return html`<pv-view-week
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .firstDay=${firstDay}
          .forecast=${this.forecast}
          .showStripes=${showStripes}
          .tick=${tick}
        ></pv-view-week>`;
      }
      case 'month': {
        const tick = this._tick;
        return html`<pv-view-month
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .firstDay=${firstDay}
          .timeFormat=${timeFormat}
          .showStripes=${showStripes}
          .tick=${tick}
        ></pv-view-month>`;
      }
      case 'agenda': {
        const tick = this._tick;
        return html`<pv-view-agenda
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .forecast=${this.forecast}
          .showStripes=${showStripes}
          .tick=${tick}
        ></pv-view-agenda>`;
      }
      default:
        return nothing;
    }
  }

  private _onEventClick(e: CustomEvent) {
    const clicked: CalendarEvent = e.detail.event;

    // For shared events (same UID on multiple calendars), enrich with
    // all participants. The clicked copy stays the "main" event: we don't
    // guess organizer since HA doesn't expose that field from Google Calendar.
    if (clicked.uid) {
      const allEvents = this.data?.events || [];
      const siblings = allEvents.filter(
        (ev: any) => ev.uid === clicked.uid && ev.uid !== '',
      );

      // Deduplicate by calendar: recurring events share the same UID across
      // all instances, so without this we'd get N chips per participant.
      const seen = new Set<string>();
      const uniqueParticipants = siblings.filter((s: any) => {
        if (seen.has(s.calendar_entity_id)) return false;
        seen.add(s.calendar_entity_id);
        return true;
      });

      if (uniqueParticipants.length > 1) {
        const enriched: CalendarEvent = {
          ...clicked,
          shared_calendars: uniqueParticipants.map((s: any) => ({
            entity_id: s.calendar_entity_id,
            calendar_name: s.calendar_name,
            calendar_color: s.calendar_color,
          })),
        } as any;

        this._pv.store.selectEvent(enriched);
        return;
      }
    }

    this._pv.store.selectEvent(clicked);
  }

  private _onCreateEvent(e: CustomEvent) {
    const date = e.detail?.date as Date | undefined;
    const prefill: Partial<any> = {};
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      prefill.start = `${y}-${m}-${d}T09:00:00`;
      prefill.end = `${y}-${m}-${d}T10:00:00`;
    }
    this._pv.store.openCreateDialog(prefill);
  }

  private _onDayClick(e: CustomEvent) {
    this._pv.store.setDate(e.detail.date);
    this.dispatchEvent(new CustomEvent('pv-view-change', { detail: { view: 'day' }, bubbles: true, composed: true }));
  }

  private _onTouchStart(e: TouchEvent) {
    // Only a single finger can swipe; a second finger (pinch, two-finger scroll) cancels.
    this._touchStart = e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : null;
  }

  private _onTouchEnd(e: TouchEvent) {
    const start = this._touchStart;
    this._touchStart = null;
    if (!start || e.touches.length > 0 || e.changedTouches.length !== 1) return;
    const end = e.changedTouches[0];
    const direction = swipeDirection(end.clientX - start.x, end.clientY - start.y);
    if (direction) this._pv.store.navigateDate(direction);
  }

  private _onTouchCancel() {
    this._touchStart = null;
  }

  private async _refreshCalendars() {
    if (this._refreshing) return;
    this._refreshing = true;
    try {
      // Force HA to re-fetch each configured calendar entity, then the PlanaVista coordinator.
      for (const cal of this.data?.calendars || []) {
        if (cal.entity_id) {
          await this.hass.callService('homeassistant', 'update_entity', { entity_id: cal.entity_id });
        }
      }
      await this.hass.callService('homeassistant', 'update_entity', { entity_id: this.cardConfig?.entity || DEFAULT_ENTITY });
    } catch {
      // Refresh is best-effort
    }
    // Keep spinner for at least 800ms so the animation completes
    setTimeout(() => { this._refreshing = false; }, 800);
  }
}

defineElement('pv-calendar-module', PvCalendarModule);
