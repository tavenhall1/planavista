import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig, DisplayConfig, WeatherCondition } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { applyTheme, resolveTheme } from '../styles/themes';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { formatDate } from '../utils/date-utils';
import { getPlanaVistaData, getPersonAvatar, getPersonName } from '../utils/ha-utils';
import { filterVisibleEvents } from '../utils/event-utils';
import { weatherIcon } from '../utils/weather-icons';

// Import card editor (visual editor instead of YAML panel)
import './planavista-calendar-card-editor';

// Import view components (triggers registration)
import '../components/view-day';
import '../components/view-week';
import '../components/view-month';
import '../components/view-agenda';
import '../components/event-popup';
import '../components/event-create-dialog';
import '../components/onboarding-wizard';

@customElement('planavista-calendar-card')
export class PlanaVistaCalendarCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config: any;
  @state() private _currentTime = new Date();
  @state() private _filterOpen = false;
  @state() private _wizardOpen = false;
  @state() private _onboardingDone = false;

  private _pv = new PlanaVistaController(this);
  private _clockTimer: ReturnType<typeof setInterval> | null = null;
  private _touchStartX = 0;
  private _filterCloseHandler = (e: MouseEvent) => this._onFilterClickOutside(e);

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      :host {
        display: block;
        height: calc(100vh - var(--header-height, 56px));
        overflow: hidden;
        font-family: var(--pv-font-family);
        color: var(--pv-text);
      }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
        background: var(--pv-card-bg);
        border-radius: var(--pv-radius-lg);
        box-shadow: var(--pv-shadow);
      }

      /* ================================================================
         HEADER — weather left, date center, time right
         ================================================================ */
      .pvc-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 24px;
        background: var(--pv-header-gradient);
        color: var(--pv-header-text);
        flex-shrink: 0;
      }

      /* -- Weather (left) -- */
      .pvc-weather {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: var(--pv-radius-sm);
        transition: background 200ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-weather:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .pvc-weather:active {
        background: rgba(255, 255, 255, 0.25);
      }

      .pvc-weather-info {
        display: flex;
        flex-direction: column;
      }

      .pvc-weather-temp {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.5px;
      }

      .pvc-weather-condition {
        font-size: 0.8125rem;
        opacity: 0.85;
        text-transform: capitalize;
        line-height: 1.3;
      }

      /* -- Date (center) -- */
      .pvc-header-date {
        font-size: 1.25rem;
        font-weight: 600;
        opacity: 0.95;
        text-align: center;
        white-space: nowrap;
      }

      /* -- Time (right) -- */
      .pvc-header-time {
        text-align: right;
      }

      .pvc-time-display {
        font-size: 2rem;
        font-weight: 700;
        letter-spacing: -0.5px;
        line-height: 1.15;
      }

      .pvc-time-ampm {
        font-size: 0.875rem;
        font-weight: 500;
        opacity: 0.8;
        margin-left: 3px;
      }

      /* ================================================================
         TOOLBAR — avatars left, controls right
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
        border-radius: 9999px;
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
        border-radius: var(--pv-radius-md, 12px);
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
        border-radius: 6px;
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
        border-radius: 9999px;
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
        border-radius: 9999px;
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

      /* View switcher */
      .pvc-view-tabs {
        display: flex;
        background: var(--pv-border-subtle);
        border-radius: 8px;
        padding: 2px;
      }

      .pvc-view-tab {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        text-transform: capitalize;
        min-height: 36px;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-view-tab.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .pvc-view-tab:hover:not(.active) {
        color: var(--pv-text);
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

      /* Empty state */
      .pvc-empty {
        padding: 2rem;
        text-align: center;
        color: var(--pv-text-muted);
      }

      /* Setup-pending placeholder shown in card editor preview */
      .pvc-setup-pending {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 2rem;
        text-align: center;
        gap: 0.5rem;
        cursor: pointer;
        outline: none;
      }

      .pvc-setup-pending:focus-visible {
        outline: 2px solid var(--pv-accent, #6366F1);
        outline-offset: 4px;
      }

      .pvc-setup-icon {
        color: var(--pv-accent, #6366F1);
        opacity: 0.8;
        margin-bottom: 0.5rem;
      }

      .pvc-setup-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        margin: 0;
      }

      .pvc-setup-hint {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
        margin: 0;
        max-width: 260px;
        line-height: 1.5;
      }

      /* Placeholder when no weather configured */
      .pvc-no-weather {
        padding: 6px 10px;
        opacity: 0.6;
        font-size: 0.875rem;
      }

      /* Responsive: stack controls on narrow screens */
      @media (max-width: 600px) {
        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
        }

        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._clockTimer = setInterval(() => {
      this._currentTime = new Date();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._clockTimer) {
      clearInterval(this._clockTimer);
      this._clockTimer = null;
    }
    document.removeEventListener('click', this._filterCloseHandler);
  }

  setConfig(config: any) {
    this._config = {
      entity: 'sensor.planavista_config',
      view: 'day',
      ...config,
    };
    if (config?.view) {
      this._pv.state.setView(config.view);
    }
  }

  firstUpdated() {
    if (!this._config?.view) {
      const data = this.hass ? getPlanaVistaData(this.hass, this._config?.entity) : null;
      if (data?.display?.default_view) {
        this._pv.state.setView(data.display.default_view);
      }
    }
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('hass') || changedProps.has('_config')) {
      const data = getPlanaVistaData(this.hass, this._config?.entity);
      const theme = resolveTheme(this._config?.theme, data?.display?.theme);
      applyTheme(this, theme);
    }
  }

  private _getData() {
    return getPlanaVistaData(this.hass, this._config?.entity);
  }

  private _getWeatherEntity() {
    const data = this._getData();
    const weatherId = this._config?.weather_entity || data?.display?.weather_entity;
    return weatherId ? this.hass?.states?.[weatherId] : null;
  }

  private _getWeatherEntityId(): string | null {
    const data = this._getData();
    return this._config?.weather_entity || data?.display?.weather_entity || null;
  }

  private _onOnboardingComplete() {
    this._wizardOpen = false;
    this._onboardingDone = true;
    // Coordinator refreshes server-side; hass pushes updated sensor state → re-render
  }

  private _showWeatherDetails() {
    const entityId = this._getWeatherEntityId();
    if (entityId) {
      const event = new CustomEvent('hass-more-info', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  // ====================================================================
  // RENDER
  // ====================================================================

  render() {
    if (!this._config || !this.hass) return nothing;

    const data = this._getData();
    if (!data) {
      return html`
        <ha-card>
          <div class="pvc-empty">
            <p>PlanaVista entity not found</p>
            <p style="font-size: 0.8rem;">Check that the PlanaVista integration is configured.</p>
          </div>
        </ha-card>
      `;
    }

    // Onboarding — show setup card until user explicitly launches the wizard
    if (data.onboarding_complete === false && !this._onboardingDone) {
      if (this._wizardOpen) {
        return html`
          <ha-card>
            <pv-onboarding-wizard
              .hass=${this.hass}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-onboarding-wizard>
          </ha-card>
        `;
      }
      return html`
        <ha-card>
          <div class="pvc-setup-pending"
            role="button"
            tabindex="0"
            aria-label="Begin PlanaVista setup"
            @click=${() => { this._wizardOpen = true; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._wizardOpen = true; } }}
          >
            <div class="pvc-setup-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
            </div>
            <p class="pvc-setup-title">PlanaVista</p>
            <p class="pvc-setup-hint">Tap to begin setup</p>
          </div>
        </ha-card>
      `;
    }

    const pvState = this._pv.state;
    const currentView = pvState.currentView;
    const currentDate = pvState.currentDate;
    const calendars = (data.calendars || []).filter((c: CalendarConfig) => c.visible !== false);
    const events = data.events || [];
    const display = data.display;
    const visibleEvents = filterVisibleEvents(events, pvState.hiddenCalendars);

    return html`
      <ha-card>
        ${this._renderHeader(display)}
        ${this._renderToolbar(calendars, currentView)}
        <div class="pvc-body"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
        >
          ${this._renderView(currentView, visibleEvents, calendars, display)}
        </div>

        ${pvState.selectedEvent ? html`
          <pv-event-popup
            .hass=${this.hass}
            .event=${pvState.selectedEvent}
            .timeFormat=${display?.time_format || '12h'}
          ></pv-event-popup>
        ` : nothing}

        ${pvState.dialogOpen ? html`
          <pv-event-create-dialog
            .hass=${this.hass}
            .calendars=${calendars}
            .open=${true}
            .mode=${pvState.dialogOpen}
            .prefill=${pvState.createPrefill}
          ></pv-event-create-dialog>
        ` : nothing}
      </ha-card>
    `;
  }

  // ====================================================================
  // HEADER — weather (left), date (center), time (right)
  // ====================================================================

  private _renderHeader(display?: DisplayConfig) {
    const weather = this._getWeatherEntity();
    const timeFormat = display?.time_format || '12h';
    const now = this._currentTime;

    // Format time
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    let timeHtml;
    if (timeFormat === '24h') {
      timeHtml = html`<span class="pvc-time-display">${hours}:${minutes}</span>`;
    } else {
      const h = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      timeHtml = html`<span class="pvc-time-display">${h}:${minutes}</span><span class="pvc-time-ampm">${ampm}</span>`;
    }

    // Format date
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return html`
      <div class="pvc-header">
        ${weather ? html`
          <div class="pvc-weather" @click=${this._showWeatherDetails}
               title="Click for weather details">
            <div class="pvc-weather-icon">
              ${weatherIcon((weather.state || 'cloudy') as WeatherCondition, 48)}
            </div>
            <div class="pvc-weather-info">
              <span class="pvc-weather-temp">
                ${Math.round(weather.attributes.temperature ?? 0)}°${this._getTempUnit(weather)}
              </span>
              <span class="pvc-weather-condition">
                ${(weather.state || '').replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        ` : html`<div class="pvc-no-weather"></div>`}

        <div class="pvc-header-date">${dateStr}</div>

        <div class="pvc-header-time">${timeHtml}</div>
      </div>
    `;
  }

  private _getTempUnit(weather: any): string {
    const unit = weather.attributes.temperature_unit || '';
    if (unit.includes('C')) return 'C';
    return 'F';
  }

  // ====================================================================
  // TOOLBAR — person toggles, + New, nav, view tabs
  // ====================================================================

  private _renderToolbar(calendars: CalendarConfig[], currentView: string) {
    const hiddenCount = calendars.filter(c => this._pv.state.hiddenCalendars.has(c.entity_id)).length;

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
                const isActive = !this._pv.state.hiddenCalendars.has(cal.entity_id);
                const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
                const name = cal.display_name || (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : cal.entity_id);
                const initial = (name || '?')[0].toUpperCase();

                return html`
                  <div
                    class="pvc-filter-item ${isActive ? 'active' : ''}"
                    style="--item-color: ${cal.color}"
                    @click=${() => this._pv.state.toggleCalendar(cal.entity_id)}
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

        <div class="pvc-controls">
          <button class="pvc-new-btn" @click=${() => this._pv.state.openCreateDialog()}>
            + New
          </button>

          <div class="pvc-nav">
            <button class="pvc-nav-btn" @click=${() => this._pv.state.navigateDate('prev')}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pvc-today-btn" @click=${() => this._pv.state.navigateDate('today')}>
              Today
            </button>
            <button class="pvc-nav-btn" @click=${() => this._pv.state.navigateDate('next')}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <div class="pvc-view-tabs">
            ${(['day', 'week', 'month', 'agenda'] as const).map(view => html`
              <button
                class="pvc-view-tab ${currentView === view ? 'active' : ''}"
                @click=${() => this._pv.state.setView(view)}
              >${view}</button>
            `)}
          </div>
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

  // ====================================================================
  // CALENDAR VIEW
  // ====================================================================

  private _renderView(view: string, events: CalendarEvent[], calendars: CalendarConfig[], display: DisplayConfig | undefined) {
    const timeFormat = display?.time_format || '12h';
    const firstDay = display?.first_day || 'sunday';
    const currentDate = this._pv.state.currentDate;
    const hiddenCalendars = this._pv.state.hiddenCalendars;

    switch (view) {
      case 'day':
        return html`<pv-view-day
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .hideColumnHeaders=${false}
        ></pv-view-day>`;
      case 'week':
        return html`<pv-view-week
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .firstDay=${firstDay}
        ></pv-view-week>`;
      case 'month':
        return html`<pv-view-month
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .firstDay=${firstDay}
        ></pv-view-month>`;
      case 'agenda':
        return html`<pv-view-agenda
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
        ></pv-view-agenda>`;
      default:
        return nothing;
    }
  }

  // ====================================================================
  // EVENT HANDLERS
  // ====================================================================

  private _onEventClick(e: CustomEvent) {
    this._pv.state.selectEvent(e.detail.event);
  }

  private _onDayClick(e: CustomEvent) {
    this._pv.state.setDate(e.detail.date);
    this._pv.state.setView('day');
  }

  private _onTouchStart(e: TouchEvent) {
    this._touchStartX = e.touches[0].clientX;
  }

  private _onTouchEnd(e: TouchEvent) {
    const diff = e.changedTouches[0].clientX - this._touchStartX;
    if (Math.abs(diff) > 50) {
      this._pv.state.navigateDate(diff > 0 ? 'prev' : 'next');
    }
  }

  // ====================================================================
  // HA CARD HELPERS
  // ====================================================================

  static getConfigElement() {
    return document.createElement('planavista-calendar-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      view: 'day',
    };
  }

  getCardSize(): number {
    return 10;
  }
}
