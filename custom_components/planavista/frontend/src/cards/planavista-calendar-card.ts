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

// Import view components (triggers registration)
import '../components/view-day';
import '../components/view-week';
import '../components/view-month';
import '../components/view-agenda';
import '../components/event-popup';
import '../components/event-create-dialog';

@customElement('planavista-calendar-card')
export class PlanaVistaCalendarCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config: any;
  @state() private _currentTime = new Date();

  private _pv = new PlanaVistaController(this);
  private _clockTimer: ReturnType<typeof setInterval> | null = null;
  private _touchStartX = 0;

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      :host {
        display: block;
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
        padding: 14px 20px;
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
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.5px;
      }

      .pvc-weather-condition {
        font-size: 0.75rem;
        opacity: 0.85;
        text-transform: capitalize;
        line-height: 1.3;
      }

      /* -- Date (center) -- */
      .pvc-header-date {
        font-size: 1rem;
        font-weight: 500;
        opacity: 0.95;
        text-align: center;
        white-space: nowrap;
      }

      /* -- Time (right) -- */
      .pvc-header-time {
        text-align: right;
      }

      .pvc-time-display {
        font-size: 1.75rem;
        font-weight: 700;
        letter-spacing: -0.5px;
        line-height: 1.15;
      }

      .pvc-time-ampm {
        font-size: 0.75rem;
        font-weight: 500;
        opacity: 0.8;
        margin-left: 2px;
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

      /* -- Person avatars -- */
      .pvc-people {
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }

      .pvc-person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: opacity 200ms ease;
        -webkit-tap-highlight-color: transparent;
        min-width: 52px;
      }

      .pvc-person.hidden {
        opacity: 0.3;
      }

      .pvc-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.25rem;
        color: white;
        border: 3px solid transparent;
        transition: all 200ms ease;
        overflow: hidden;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }

      .pvc-person:not(.hidden) .pvc-avatar {
        border-color: var(--person-color);
        box-shadow: 0 2px 8px color-mix(in srgb, var(--person-color) 35%, transparent);
      }

      .pvc-person.hidden .pvc-avatar {
        border-color: var(--pv-border);
        filter: grayscale(0.6);
      }

      .pvc-person-name {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 68px;
        text-align: center;
      }

      .pvc-person:not(.hidden) .pvc-person-name {
        color: var(--pv-text);
        font-weight: 600;
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
        gap: 4px;
        padding: 7px 14px;
        border-radius: 9999px;
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border: none;
        cursor: pointer;
        font-size: 0.8125rem;
        font-weight: 600;
        font-family: inherit;
        transition: all 200ms ease;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
        min-height: 36px;
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
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .pvc-nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .pvc-today-btn {
        padding: 4px 12px;
        border: 1px solid var(--pv-border);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        min-height: 32px;
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
        padding: 4px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.6875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 200ms ease;
        font-family: inherit;
        text-transform: capitalize;
        min-height: 30px;
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
        min-height: 400px;
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
        }

        .pvc-people {
          order: 1;
          width: 100%;
          justify-content: center;
        }

        .pvc-controls {
          order: 2;
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
              ${weatherIcon((weather.state || 'cloudy') as WeatherCondition, 40)}
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
    return html`
      <div class="pvc-toolbar">
        <div class="pvc-people">
          ${calendars.map(cal => {
            const isHidden = this._pv.state.hiddenCalendars.has(cal.entity_id);
            const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
            const name = cal.display_name || (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : '');
            const initial = (name || '?')[0].toUpperCase();

            return html`
              <div
                class="pvc-person ${isHidden ? 'hidden' : ''}"
                style="--person-color: ${cal.color}"
                @click=${() => this._pv.state.toggleCalendar(cal.entity_id)}
              >
                <div
                  class="pvc-avatar"
                  style="${avatar
                    ? `background-image: url(${avatar}); background-color: ${cal.color}`
                    : `background: ${cal.color}`}"
                >
                  ${!avatar ? initial : ''}
                </div>
                <span class="pvc-person-name">${name}</span>
              </div>
            `;
          })}
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
            ${(['day', 'week', 'month'] as const).map(view => html`
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

  getCardSize(): number {
    return 10;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      view: 'day',
    };
  }
}
