import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, CalendarConfig, DisplayConfig, WeatherCondition, PlanaVistaCardConfig, ThemeOverrides } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { applyTheme, resolveTheme, clearThemeCache, applyThemeWithOverrides } from '../styles/themes';
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
  @state() private _settingsOpen = false;
  @state() private _refreshing = false;
  @state() private _previewOverrides: ThemeOverrides | null = null;

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

      /* Refresh + Gear buttons */
      .pvc-refresh-btn,
      .pvc-settings-btn {
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

      .pvc-refresh-btn:hover,
      .pvc-settings-btn:hover {
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

      /* Settings overlay */
      .pvc-settings-overlay {
        position: absolute;
        inset: 0;
        z-index: 50;
        background: var(--pv-card-bg, #FFFFFF);
        animation: pv-fadeIn 200ms ease forwards;
      }

      @keyframes pv-fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      /* ═══════════════════════════════════════════════
         RESPONSIVE BREAKPOINTS
         ═══════════════════════════════════════════════ */

      /* --- Mobile calendar avatar strip (inline in toolbar) --- */
      .pvc-cal-strip {
        display: none; /* hidden on desktop — filter dropdown used instead */
      }

      /* xs: phones (≤479px) — date-only header, avatar strip, compact controls */
      @media (max-width: 479px) {
        /* Header: date only, slim bar */
        .pvc-header {
          padding: 8px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.9375rem; }

        /* Toolbar */
        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
          padding: 8px 10px;
          gap: 6px;
        }

        /* Hide desktop filter dropdown, show inline avatar strip */
        .pvc-filter-wrap { display: none; }
        .pvc-cal-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .pvc-cal-strip::-webkit-scrollbar { display: none; }

        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
          gap: 4px;
        }

        .pvc-new-btn {
          padding: 6px 12px;
          font-size: 0.8125rem;
          min-height: 34px;
        }

        .pvc-today-btn {
          padding: 4px 10px;
          font-size: 0.8125rem;
          min-height: 32px;
        }

        .pvc-nav-btn {
          width: 34px;
          height: 34px;
        }

        .pvc-view-tab {
          padding: 4px 8px;
          font-size: 0.6875rem;
          min-height: 30px;
        }

        .pvc-settings-btn {
          width: 34px;
          height: 34px;
        }
      }

      /* sm: large phones (480–767px) — compact header, avatar strip */
      @media (min-width: 480px) and (max-width: 767px) {
        .pvc-header {
          padding: 10px 16px;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 1.0625rem; }

        /* Show avatar strip, hide dropdown */
        .pvc-filter-wrap { display: none; }
        .pvc-cal-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pvc-cal-strip::-webkit-scrollbar { display: none; }

        .pvc-toolbar {
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }

        .pvc-controls {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
        }
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

      /* md: tablets (768–1023px) — single row, slightly compressed */
      @media (min-width: 768px) and (max-width: 1023px) {
        .pvc-weather-icon { --icon-size: 36px; }
        .pvc-weather-temp { font-size: 1.5rem; }
        .pvc-time-display { font-size: 1.75rem; }
      }

      /* short height (landscape phone, etc.) — date-only compact header */
      @media (max-height: 500px) {
        .pvc-header {
          padding: 6px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.875rem; }
      }

      /* lg: large desktops / small wall displays (1024–1439px) — scale up ~20% */
      @media (min-width: 1024px) {
        .pvc-header { padding: 22px 28px; }
        .pvc-weather-temp { font-size: 2rem; }
        .pvc-weather-condition { font-size: 0.9375rem; }
        .pvc-header-date { font-size: 1.5rem; }
        .pvc-time-display { font-size: 2.5rem; }
        .pvc-time-ampm { font-size: 1rem; }

        .pvc-toolbar { padding: 14px 20px; gap: 10px; }
        .pvc-filter-btn { padding: 10px 20px; font-size: 1rem; min-height: 48px; }
        .pvc-new-btn { padding: 11px 22px; font-size: 1.0625rem; min-height: 48px; }
        .pvc-today-btn { padding: 8px 18px; font-size: 1rem; min-height: 44px; }
        .pvc-nav-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
        .pvc-view-tab { padding: 8px 16px; font-size: 0.9375rem; min-height: 44px; }
        .pvc-settings-btn { width: 48px; height: 48px; --mdc-icon-size: 24px; }
      }

      /* xl: wall-mounted touch displays (1440px+, 27"+) — scale up ~40% */
      @media (min-width: 1440px) {
        .pvc-header { padding: 26px 36px; }
        .pvc-weather-icon { --icon-size: 56px; }
        .pvc-weather-temp { font-size: 2.375rem; }
        .pvc-weather-condition { font-size: 1.0625rem; }
        .pvc-header-date { font-size: 1.75rem; }
        .pvc-time-display { font-size: 3rem; }
        .pvc-time-ampm { font-size: 1.125rem; }

        .pvc-toolbar { padding: 16px 24px; gap: 12px; }
        .pvc-filter-btn { padding: 12px 24px; font-size: 1.125rem; min-height: 56px; }
        .pvc-filter-badge { min-width: 24px; height: 24px; font-size: 0.8125rem; }
        .pvc-filter-avatar { width: 40px; height: 40px; font-size: 1rem; }
        .pvc-filter-name { font-size: 1.0625rem; }
        .pvc-new-btn { padding: 14px 28px; font-size: 1.1875rem; min-height: 56px; }
        .pvc-today-btn { padding: 10px 22px; font-size: 1.125rem; min-height: 52px; }
        .pvc-nav-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
        .pvc-view-tab { padding: 10px 20px; font-size: 1.0625rem; min-height: 52px; }
        .pvc-settings-btn { width: 56px; height: 56px; --mdc-icon-size: 28px; }
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
      ...config,
    };
    // Card-level `view` or `default_view` override
    const cardView = config?.view || config?.default_view;
    if (cardView) {
      this._pv.state.setView(cardView);
    }
  }

  firstUpdated() {
    const cardView = this._config?.view || this._config?.default_view;
    if (!cardView) {
      const data = this.hass ? getPlanaVistaData(this.hass, this._config?.entity) : null;
      if (data?.display?.default_view) {
        this._pv.state.setView(data.display.default_view);
      }
    }
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    // While settings panel is open, the wizard owns theme via theme-preview events.
    // Only apply saved theme from sensor when settings are closed.
    if (this._settingsOpen) return;
    if (changedProps.has('hass') || changedProps.has('_config') || changedProps.has('_settingsOpen')) {
      const data = getPlanaVistaData(this.hass, this._config?.entity);
      const theme = resolveTheme(this._config?.theme, data?.display?.theme);
      const overrides = data?.display?.theme_overrides || null;
      applyThemeWithOverrides(this, theme, overrides);
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

  /**
   * Merge card-level YAML overrides over global sensor config.
   * Card YAML wins → sensor display config → defaults.
   */
  private _resolveDisplay(): DisplayConfig {
    const data = this._getData();
    const global = data?.display;
    const card = this._config as PlanaVistaCardConfig | undefined;
    return {
      time_format: card?.time_format || global?.time_format || '12h',
      weather_entity: card?.weather_entity || global?.weather_entity || '',
      first_day: card?.first_day || global?.first_day || 'sunday',
      default_view: card?.default_view || card?.view || global?.default_view || 'week',
      theme: card?.theme || global?.theme || 'light',
      theme_overrides: global?.theme_overrides,
    };
  }

  /**
   * If card YAML specifies a `calendars` list (array of entity_ids),
   * filter to only those calendars. Otherwise return all visible calendars.
   */
  private _getVisibleCalendars(): CalendarConfig[] {
    const data = this._getData();
    const all = (data?.calendars || []).filter((c: CalendarConfig) => c.visible !== false);
    const cardFilter = (this._config as PlanaVistaCardConfig)?.calendars;
    if (cardFilter && Array.isArray(cardFilter) && cardFilter.length > 0) {
      return all.filter((c: CalendarConfig) => cardFilter.includes(c.entity_id));
    }
    return all;
  }

  private _onOnboardingComplete() {
    this._wizardOpen = false;
    this._onboardingDone = true;
    // Force theme application from newly saved config
    clearThemeCache(this);
  }

  private async _refreshCalendars() {
    if (this._refreshing) return;
    this._refreshing = true;
    try {
      // Force HA to re-fetch each configured calendar entity
      const pvData = getPlanaVistaData(this.hass);
      if (pvData?.calendars) {
        for (const cal of pvData.calendars) {
          if (cal.entity_id) {
            await this.hass.callService('homeassistant', 'update_entity', { entity_id: cal.entity_id });
          }
        }
      }
      // Then refresh the PlanaVista coordinator
      await this.hass.callService('homeassistant', 'update_entity', { entity_id: 'sensor.planavista_config' });
    } catch {
      // Refresh is best-effort
    }
    // Keep spinner for at least 800ms so the animation completes
    setTimeout(() => { this._refreshing = false; }, 800);
  }

  private _openSettings() {
    this._settingsOpen = true;
  }

  private _onSettingsSave() {
    this._settingsOpen = false;
    this._previewOverrides = null;
    // _settingsOpen is now false so updated() will apply the newly saved theme on next hass cycle.
    clearThemeCache(this);
  }

  private _onSettingsClose() {
    this._settingsOpen = false;
    this._previewOverrides = null;
    // Revert to saved theme immediately (undo any preview changes)
    clearThemeCache(this);
    const data = getPlanaVistaData(this.hass, this._config?.entity);
    const theme = resolveTheme(this._config?.theme, data?.display?.theme);
    const overrides = data?.display?.theme_overrides || null;
    applyThemeWithOverrides(this, theme, overrides);
  }

  private _onThemePreview(e: CustomEvent<{ theme: string; overrides: ThemeOverrides | null }>) {
    const { theme, overrides } = e.detail;
    const resolved = resolveTheme(theme);
    clearThemeCache(this);
    applyThemeWithOverrides(this, resolved, overrides);
    // Store preview overrides so prop-based settings (avatar_border, event_style)
    // can be read by _renderView during live preview
    this._previewOverrides = overrides;
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
    const calendars = this._getVisibleCalendars();
    const events = data.events || [];
    const display = this._resolveDisplay();
    const hideHeader = !!(this._config as PlanaVistaCardConfig)?.hide_header;
    const visibleEvents = filterVisibleEvents(events, pvState.hiddenCalendars);

    return html`
      <ha-card>
        ${hideHeader ? nothing : this._renderHeader(display)}
        ${this._renderToolbar(calendars, currentView)}
        <div class="pvc-body"
          @touchstart=${this._onTouchStart}
          @touchend=${this._onTouchEnd}
          @event-click=${this._onEventClick}
          @day-click=${this._onDayClick}
          @create-event=${this._onCreateEvent}
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
            .timeFormat=${display?.time_format || '12h'}
          ></pv-event-create-dialog>
        ` : nothing}

        ${this._settingsOpen ? html`
          <div class="pvc-settings-overlay">
            <pv-onboarding-wizard
              .hass=${this.hass}
              mode="settings"
              .config=${data}
              @settings-save=${this._onSettingsSave}
              @settings-close=${this._onSettingsClose}
              @theme-preview=${this._onThemePreview}
            ></pv-onboarding-wizard>
          </div>
        ` : nothing}
      </ha-card>
    `;
  }

  // ====================================================================
  // HEADER — weather (left), date (center), time (right)
  // ====================================================================

  private _renderHeader(display?: DisplayConfig) {
    const hideWeather = !!(this._config as PlanaVistaCardConfig)?.hide_weather;
    const weather = hideWeather ? null : this._getWeatherEntity();
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

        <!-- Mobile inline calendar chips (shown on xs/sm via CSS) -->
        <div class="pvc-cal-strip">
          ${calendars.map(cal => {
            const isActive = !this._pv.state.hiddenCalendars.has(cal.entity_id);
            const avatar = cal.person_entity ? getPersonAvatar(this.hass, cal.person_entity) : null;
            const name = cal.display_name || (cal.person_entity ? getPersonName(this.hass, cal.person_entity) : cal.entity_id);
            const initial = (name || '?')[0].toUpperCase();
            return html`
              <button
                class="pvc-cal-chip ${isActive ? 'active' : ''}"
                style="--chip-color: ${cal.color}"
                @click=${() => this._pv.state.toggleCalendar(cal.entity_id)}
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

          <button class="pvc-refresh-btn ${this._refreshing ? 'spinning' : ''}"
            @click=${this._refreshCalendars}
            title="Refresh calendars" aria-label="Refresh calendars"
            ?disabled=${this._refreshing}>
            <ha-icon icon="mdi:autorenew"></ha-icon>
          </button>
          <button class="pvc-settings-btn" @click=${this._openSettings}
            title="Settings" aria-label="Open settings">
            <ha-icon icon="mdi:cog"></ha-icon>
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

  // ====================================================================
  // CALENDAR VIEW
  // ====================================================================

  private _renderView(view: string, events: CalendarEvent[], calendars: CalendarConfig[], display: DisplayConfig | undefined) {
    const timeFormat = display?.time_format || '12h';
    const firstDay = display?.first_day || 'sunday';
    const currentDate = this._pv.state.currentDate;
    const hiddenCalendars = this._pv.state.hiddenCalendars;

    // Merge preview overrides (live editing) over saved overrides
    const overrides = this._previewOverrides || display?.theme_overrides;
    const avatarBorder = overrides?.avatar_border || 'primary';
    const showStripes = (overrides?.event_style || 'stripes') === 'stripes';

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
          .avatarBorderMode=${avatarBorder}
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
          .weatherEntity=${display?.weather_entity || ''}
          .showStripes=${showStripes}
        ></pv-view-week>`;
      case 'month':
        return html`<pv-view-month
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .firstDay=${firstDay}
          .timeFormat=${timeFormat}
          .showStripes=${showStripes}
        ></pv-view-month>`;
      case 'agenda':
        return html`<pv-view-agenda
          .hass=${this.hass}
          .events=${events}
          .calendars=${calendars}
          .currentDate=${currentDate}
          .hiddenCalendars=${hiddenCalendars}
          .timeFormat=${timeFormat}
          .weatherEntity=${display?.weather_entity || ''}
          .showStripes=${showStripes}
        ></pv-view-agenda>`;
      default:
        return nothing;
    }
  }

  // ====================================================================
  // EVENT HANDLERS
  // ====================================================================

  private _onEventClick(e: CustomEvent) {
    const clicked: CalendarEvent = e.detail.event;

    // For shared events (same UID on multiple calendars), enrich with
    // all participants and open from the organizer's perspective.
    if (clicked.uid) {
      const pvData = getPlanaVistaData(this.hass);
      const allEvents = pvData?.events || [];
      const siblings = allEvents.filter(
        (ev: any) => ev.uid === clicked.uid && ev.uid !== '',
      );

      if (siblings.length > 1) {
        // Determine organizer: first calendar in config order that has this event
        const configOrder = (pvData?.calendars || []).map((c: any) => c.entity_id);
        const participantIds = siblings.map((s: any) => s.calendar_entity_id);
        participantIds.sort((a: string, b: string) => {
          const ai = configOrder.indexOf(a);
          const bi = configOrder.indexOf(b);
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });

        const organizerId = participantIds[0];
        const organizerEvent = siblings.find((s: any) => s.calendar_entity_id === organizerId) || clicked;

        // Build enriched event from organizer's copy
        const enriched: CalendarEvent = {
          ...organizerEvent,
          shared_calendars: siblings.map((s: any) => ({
            entity_id: s.calendar_entity_id,
            calendar_name: s.calendar_name,
            calendar_color: s.calendar_color,
          })),
        } as any;

        this._pv.state.selectEvent(enriched);
        return;
      }
    }

    this._pv.state.selectEvent(clicked);
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
    this._pv.state.openCreateDialog(prefill);
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
    };
  }

  getCardSize(): number {
    return 10;
  }
}
