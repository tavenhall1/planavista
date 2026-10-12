import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { CalendarConfig, CalendarEvent, DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ViewType } from '../../types';
import type { Layout } from '../../core/layout';
import type { Mode, ThemeShape } from '../../styles/theme-pairs';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../../styles/shared';
import { statusStyles } from '../../styles/status';
import { getPersonAvatar, getPersonName } from '../../utils/ha-utils';
import { swipeDirection } from '../../utils/gestures';
import { memoizeOne } from '../../utils/render-cache';
import { ForecastEntry } from '../../utils/weather-subscription';
import { CalendarStoreController } from './calendar-store';
import { CalendarDerived, deriveCalendarData, eventForPopup } from './calendar-derive';
import { withModeColors } from './mode-colors';
import { contrastText } from '../../core/color';
import type { ModuleService } from '../../core/module-registry';
import { GONE, Presence, nextPresence } from '../../core/sheet-presence';
import { deepActiveElement } from '../../core/focus';
import type { HouseholdView } from '../../core/household';
import type { Session } from '../../core/session';
import { parentAccess } from '../../core/access';
import { OPEN_SETTINGS } from '../../core/page-host';
import { CalendarScreen, bannersOf, screenOf } from './calendar-states';
import { calendarSkeleton, skeletonStyles } from './components/calendar-skeleton';
import { navLabels } from './view-words';

import './components/view-day';
import './components/view-week';
import './components/view-month';
import './components/view-agenda';
import './components/event-popup';
import './components/event-create-dialog';

const DEFAULT_ENTITY = 'sensor.planavista_config';

/** What the editor sheet shows: New event, or Edit event with what it starts from. */
interface EditorWant {
  mode: 'create' | 'edit';
  prefill: Partial<CalendarEvent> | null;
}

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
  /** Other modules' card-wide state: the Day view's rings read Chores' progress (spec 13.9). */
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  /** Bumped by the card when a module's service has news. */
  @property({ attribute: false }) revision = 0;
  /** The household and parent mode, for what the empty states offer (a parent adds calendars). */
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) session: Session | null = null;

  /** Minutes since the epoch; bumped each minute so views move the now-line and fade past events. */
  @state() private _tick = Math.floor(Date.now() / 60000);
  @state() private _filterOpen = false;
  @state() private _refreshing = false;

  private _pv = new CalendarStoreController(this);
  /** Today's chore progress for the Day view's rings, from the Chores service. */
  private _progressOf = (memberId: string) => this.services?.chores?.memberProgress?.(memberId) ?? null;
  /** What pv-overlay-change last said, so the card hears each change once. */
  private _overlayOpen = false;
  /** The event sheet: mounted while the store wants it and while it leaves. */
  private _details: Presence<CalendarEvent> = GONE;
  /** Bumped for each new details sheet, so one reopened mid-exit starts fresh. */
  private _detailsMount = 0;
  /** What had focus when the details sheet opened; it gets focus back when the sheet has left (spec 11.8). */
  private _detailsOpener: HTMLElement | null = null;
  /** The editor sheet (New event, Edit event), mounted the same way. */
  private _editor: Presence<EditorWant> = GONE;
  private _editorMount = 0;
  private _editorOpener: HTMLElement | null = null;
  /** The store's editor choice as one object, so the presence sees the same value while it stands. */
  private _editorWant: EditorWant | null = null;
  private _tickTimer: ReturnType<typeof setTimeout> | null = null;
  /** Where the current one-finger touch began; null when there's no swipe in progress. */
  private _touchStart: { x: number; y: number } | null = null;
  private _filterCloseHandler = (e: MouseEvent) => this._onFilterClickOutside(e);

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    statusStyles,
    skeletonStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      /* The card measures itself (DESIGN_SYSTEM 2.1): the toolbar and the views size
         against this frame's width. The sheets sit outside it, so it never holds them in. */
      .pvc-frame {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        container: pv-calendar / inline-size;
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
        min-height: 48px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-filter-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-filter-btn.has-hidden {
        border-color: var(--pv-accent);
        color: var(--pv-accent-ink, var(--pv-accent));
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
        color: var(--item-ink, white);
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
        color: var(--item-ink, white);
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
        min-height: 48px;
        --mdc-icon-size: 20px;
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
        width: 48px;
        height: 48px;
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
        min-height: 48px;
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
        width: 48px;
        height: 48px;
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
        min-height: 48px;
        padding: 4px 12px 4px 8px;
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
        color: var(--chip-ink, white);
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

      @container pv-calendar (min-width: 1024px){
        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 44px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

/* xl: wall-mounted touch displays (1440px+, 27"+), scale up ~40% */

      @container pv-calendar (min-width: 1440px){
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
    const open = !!(this._details.value || this._editor.value);
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
    const details = nextPresence(this._details, this._pv.store.selectedEvent);
    if (details.value && (!this._details.value || this._details.leaving)) {
      this._detailsMount += 1;
      this._detailsOpener = deepActiveElement();
    }
    this._details = details;
    const editor = nextPresence(this._editor, this._wantedEditor());
    if (editor.value && (!this._editor.value || this._editor.leaving)) {
      this._editorMount += 1;
      this._editorOpener = deepActiveElement();
    }
    this._editor = editor;
  }

  /** The store's editor choice, the same object while it stands. */
  private _wantedEditor(): EditorWant | null {
    const store = this._pv.store;
    if (!store.dialogOpen) return (this._editorWant = null);
    const want = this._editorWant;
    if (want && want.mode === store.dialogOpen && want.prefill === store.createPrefill) return want;
    return (this._editorWant = { mode: store.dialogOpen, prefill: store.createPrefill });
  }

  /** The editor left: the store lets go, and focus goes back to what opened it (Edit, or New event). */
  private _onEditorClosed = (): void => {
    this._editor = GONE;
    if (this._pv.store.dialogOpen) this._pv.store.closeDialog();
    this.requestUpdate();
    const opener = this._editorOpener;
    this._editorOpener = null;
    // A details sheet leaving too (a saved edit) takes focus back to the event itself.
    if (this._details.value && this._details.leaving) return;
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  };

  /** Now, to the minute the views last moved to. */
  private _now = memoizeOne((tick: number) => new Date(tick * 60000));

  /** The details sheet left: the store lets go too, and focus goes back to the event that opened it. */
  private _onDetailsClosed = (): void => {
    this._details = GONE;
    if (this._pv.store.selectedEvent) this._pv.store.selectEvent(null);
    this.requestUpdate();
    const opener = this._detailsOpener;
    this._detailsOpener = null;
    requestAnimationFrame(() => {
      if (opener?.isConnected) opener.focus();
    });
  };

  /** Cached until the data, the card config, the calendar filter, or the mode changes. */
  private _derive = memoizeOne((
    data: PlanaVistaData | null,
    config: PlanaVistaCardConfig | undefined,
    hidden: Set<string>,
    mode: Mode,
  ): CalendarDerived => deriveCalendarData(withModeColors(data, mode), config, hidden));

  private _derived(): CalendarDerived {
    return this._derive(this.data, this.cardConfig, this._pv.store.hiddenCalendars, this.mode);
  }

  render() {
    if (!this.hass || !this.display) return nothing;
    const { calendars, visibleEvents } = this._derived();
    const store = this._pv.store;
    const display = this.display;
    const hidden = store.hiddenCalendars;
    const screen = screenOf({
      sensorState: this.hass.states[this.cardConfig?.entity || DEFAULT_ENTITY]?.state,
      running: this._running(),
      calendars,
      hidden,
    });
    const banners = screen === 'ready' ? bannersOf({ connected: this.hass.connected !== false, calendars, hidden }) : [];

    return html`
      <div class="pvc-frame">
      ${screen === 'no-calendars' || screen === 'unavailable' ? nothing : this._renderToolbar(calendars)}
      ${banners.map(banner => html`
        <div class="banner" role="status">
          <span class="text">${banner.text}</span>
          ${banner.kind === 'unreachable' ? html`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
          ` : nothing}
        </div>
      `)}
      <div class="pvc-body"
        @touchstart=${this._onTouchStart}
        @touchend=${this._onTouchEnd}
        @touchcancel=${this._onTouchCancel}
        @event-click=${this._onEventClick}
        @day-click=${this._onDayClick}
        @create-event=${this._onCreateEvent}
      >
        ${screen === 'ready' ? this._renderView(store.currentView, visibleEvents, calendars, display) : this._renderScreen(screen, calendars)}
      </div>
      </div><!-- .pvc-frame -->

      ${this._details.value ? keyed(this._detailsMount, html`
        <pv-event-popup
          layout=${this.layout}
          .store=${store}
          .hass=${this.hass}
          .event=${this._details.value}
          .leaving=${this._details.leaving}
          .calendars=${calendars}
          .now=${this._now(this._tick)}
          .timeFormat=${display?.time_format || '12h'}
          @pv-sheet-close=${this._onDetailsClosed}
        ></pv-event-popup>
      `) : nothing}

      ${this._editor.value ? keyed(this._editorMount, html`
        <pv-event-create-dialog
          layout=${this.layout}
          .store=${store}
          .hass=${this.hass}
          .calendars=${calendars}
          .open=${true}
          .mode=${this._editor.value.mode}
          .prefill=${this._editor.value.prefill}
          .leaving=${this._editor.leaving}
          .timeFormat=${display?.time_format || '12h'}
          .locationAutocomplete=${display.location_autocomplete === true}
          @pv-sheet-close=${this._onEditorClosed}
        ></pv-event-create-dialog>
      `) : nothing}
    `;
  }

  /** Whether Home Assistant has finished starting (an older frontend without the state counts as running). */
  private _running(): boolean {
    const state = (this.hass.config as { state?: string } | undefined)?.state;
    return state === undefined || state === 'RUNNING';
  }

  /** The designed states (spec 11.6): what's loading, what's missing, and what to do next. */
  private _renderScreen(screen: CalendarScreen, calendars: CalendarConfig[]) {
    if (screen === 'loading') return calendarSkeleton(this._pv.store.currentView, this.layout, calendars.length);
    if (screen === 'unavailable') {
      return html`
        <div class="state" role="alert">
          <div class="art" aria-hidden="true">📡</div>
          <h2>Can't load the calendar</h2>
          <p>PlanaVista couldn't read the calendars just now, and tries again every minute. If this stays, check Settings, System, Logs for PlanaVista.</p>
          <div class="buttons">
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._refreshing} @click=${this._refreshCalendars}>Try again</button>
          </div>
        </div>
      `;
    }
    if (screen === 'no-calendars') {
      const parent = parentAccess(this.household, this.session) !== 'no';
      return html`
        <div class="state">
          <div class="art" aria-hidden="true">📅</div>
          <h2>No calendars yet</h2>
          <p>${parent ? "Add your family's calendars, and say whose each one is." : 'A parent can add calendars in Settings.'}</p>
          ${parent ? html`
            <div class="buttons">
              <button class="pv-btn pv-btn-primary" type="button" @click=${this._openCalendarsPage}>Add calendars</button>
            </div>
          ` : nothing}
        </div>
      `;
    }
    return html`
      <div class="state">
        <div class="art" aria-hidden="true">📅</div>
        <h2>Every calendar is hidden</h2>
        <p>Show them again to see what's coming up.</p>
        <div class="buttons">
          <button class="pv-btn pv-btn-primary" type="button" @click=${() => this._pv.store.showAllCalendars()}>Show all</button>
        </div>
      </div>
    `;
  }

  /** Settings, Calendars (the card asks for a parent's PIN first where it needs one). */
  private _openCalendarsPage = (): void => {
    this.dispatchEvent(new CustomEvent(OPEN_SETTINGS, { detail: { page: 'calendars' }, bubbles: true, composed: true }));
  };

  private _renderToolbar(calendars: CalendarConfig[]) {
    const hiddenCount = calendars.filter(c => this._pv.store.hiddenCalendars.has(c.entity_id)).length;
    const arrows = navLabels(this._pv.store.currentView);

    return html`
      <div class="pvc-toolbar">
        <div class="pvc-filter-wrap">
          <button
            class="pvc-filter-btn ${hiddenCount > 0 ? 'has-hidden' : ''}"
            type="button"
            aria-expanded=${this._filterOpen ? 'true' : 'false'}
            aria-label=${hiddenCount > 0 ? `Calendars, ${calendars.length - hiddenCount} of ${calendars.length} shown` : 'Calendars'}
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
                    style="--item-color: ${cal.color}; --item-ink: ${contrastText(cal.color)}"
                    role="checkbox"
                    tabindex="0"
                    aria-checked=${isActive ? 'true' : 'false'}
                    @click=${() => this._pv.store.toggleCalendar(cal.entity_id)}
                    @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._pv.store.toggleCalendar(cal.entity_id); } }}
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
                type="button"
                aria-pressed=${isActive ? 'true' : 'false'}
                style="--chip-color: ${cal.color}; --chip-ink: ${contrastText(cal.color)}"
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
          <button class="pvc-new-btn" type="button" @click=${() => this._pv.store.openCreateDialog()}>
            <ha-icon icon="mdi:plus"></ha-icon>
            New event
          </button>

          <div class="pvc-nav">
            <button class="pvc-nav-btn" type="button" aria-label=${arrows.prev} title=${arrows.prev}
              @click=${() => this._pv.store.navigateDate('prev')}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" type="button" @click=${() => this._pv.store.navigateDate('today')}>
              Today
            </button>
            <button class="pvc-nav-btn" type="button" aria-label=${arrows.next} title=${arrows.next}
              @click=${() => this._pv.store.navigateDate('next')}>
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
          layout=${this.layout}
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
          .progress=${this.services?.chores?.memberProgress ? this._progressOf : null}
          .revision=${this.revision}
        ></pv-view-day>`;
      }
      case 'week': {
        const tick = this._tick;
        return html`<pv-view-week
          layout=${this.layout}
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
          layout=${this.layout}
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
          layout=${this.layout}
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
    // The mode's colors, so the popup's people match the views.
    const allEvents = withModeColors(this.data, this.mode)?.events || [];
    this._pv.store.selectEvent(eventForPopup(clicked, allEvents));
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

  private _refreshCalendars = async (): Promise<void> => {
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
  };
}

defineElement('pv-calendar-module', PvCalendarModule);
