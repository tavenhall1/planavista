import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { PlanaVistaGridConfig, CalendarEvent, CalendarConfig, DisplayConfig } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { applyTheme, resolveTheme } from '../styles/themes';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { formatDate } from '../utils/date-utils';
import { getPlanaVistaData, getPersonAvatar } from '../utils/ha-utils';
import { filterVisibleEvents } from '../utils/event-utils';

// Import view components (triggers registration)
import '../components/view-day';
import '../components/view-week';
import '../components/view-month';
import '../components/view-agenda';
import '../components/event-popup';
import '../components/event-create-dialog';

@customElement('planavista-grid-card')
export class PlanaVistaGridCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaGridConfig;

  private _pv = new PlanaVistaController(this);
  private _touchStartX = 0;

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    css`
      :host { display: block; }

      ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
      }

      /* Navigation header */
      .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--pv-border);
        flex-shrink: 0;
        gap: 0.5rem;
      }

      .nav-left {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .nav-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--pv-text);
        min-width: 0;
        white-space: nowrap;
      }

      .nav-btn {
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
        transition: all var(--pv-transition);
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      .nav-btn:hover {
        background: var(--pv-event-hover);
        color: var(--pv-text);
      }

      .today-btn {
        padding: 0.25rem 0.75rem;
        border: 1px solid var(--pv-border);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        min-height: 36px;
      }

      .today-btn:hover {
        background: var(--pv-accent);
        color: var(--pv-accent-text);
        border-color: var(--pv-accent);
      }

      .view-tabs {
        display: flex;
        gap: 2px;
        background: var(--pv-border-subtle);
        border-radius: 8px;
        padding: 2px;
      }

      .view-tab {
        padding: 0.25rem 0.625rem;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--pv-text-secondary);
        font-size: 0.6875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-family: inherit;
        text-transform: capitalize;
        min-height: 32px;
      }

      .view-tab.active {
        background: var(--pv-card-bg);
        color: var(--pv-text);
        box-shadow: var(--pv-shadow);
      }

      .view-tab:hover:not(.active) {
        color: var(--pv-text);
      }

      /* View container */
      .view-container {
        flex: 1;
        overflow: hidden;
        position: relative;
        min-height: 400px;
      }

      .view-container > * {
        height: 100%;
      }
    `,
  ];

  setConfig(config: PlanaVistaGridConfig) {
    this._config = {
      entity: 'sensor.planavista_config',
      ...config,
    };
    // Set initial view from config if specified
    if (config.view) {
      this._pv.state.setView(config.view);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Set default view from display config if not set by card config
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

  render() {
    if (!this._config || !this.hass) return nothing;

    const data = this._getData();
    if (!data) {
      return html`
        <ha-card>
          <div style="padding: 2rem; text-align: center; color: var(--pv-text-muted);">
            <p>PlanaVista entity not found</p>
          </div>
        </ha-card>
      `;
    }

    const pvState = this._pv.state;
    const currentView = pvState.currentView;
    const currentDate = pvState.currentDate;
    const calendars = data.calendars || [];
    const events = data.events || [];
    const display = data.display;
    const visibleEvents = filterVisibleEvents(events, pvState.hiddenCalendars);

    // Navigation title
    let navTitle = '';
    switch (currentView) {
      case 'day':
        navTitle = formatDate(currentDate, 'long');
        break;
      case 'week':
        navTitle = formatDate(currentDate, 'medium');
        break;
      case 'month':
        navTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        break;
      case 'agenda':
        navTitle = 'Upcoming';
        break;
    }

    return html`
      <ha-card>
        <div class="nav-header">
          <div class="nav-left">
            <button class="nav-btn" @click=${() => pvState.navigateDate('prev')}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="today-btn" @click=${() => pvState.navigateDate('today')}>Today</button>
            <button class="nav-btn" @click=${() => pvState.navigateDate('next')}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>

          <span class="nav-title">${navTitle}</span>

          <div class="view-tabs">
            ${(['day', 'week', 'month'] as const).map(view => html`
              <button
                class="view-tab ${currentView === view ? 'active' : ''}"
                @click=${() => pvState.setView(view)}
              >${view}</button>
            `)}
          </div>
        </div>

        <div class="view-container"
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

  getCardSize(): number {
    return 8;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      view: 'day',
    };
  }
}
