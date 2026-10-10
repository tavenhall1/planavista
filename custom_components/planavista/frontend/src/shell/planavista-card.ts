import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement, defineElementAlias } from '../utils/define';
import { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData, ThemeOverrides, WeatherCondition } from '../types';
import { resolveTheme, clearThemeCache, applyThemeWithOverrides } from '../styles/themes';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { getPlanaVistaData } from '../utils/ha-utils';
import { weatherIcon } from '../utils/weather-icons';
import { memoizeOne, statesChanged } from '../utils/render-cache';
import { resolveDisplay } from '../core/display';
import { ModuleDefinition, ResolvedModules, moduleRegistry, resolveModules } from '../core/module-registry';
import { registerShellPages, registerShellSettings } from './definition';

// The card editor, the setup and Settings wizard, and the header clock.
import './planavista-card-editor';
import './onboarding-wizard';
import './pv-clock';
import './settings/theme-picker';

const DEFAULT_ENTITY = 'sensor.planavista_config';

/**
 * The PlanaVista card: a shell that shows the header, runs setup and
 * Settings, applies the theme, and hosts the modules registered in
 * core/module-registry (today, the calendar).
 */
export class PlanaVistaCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config?: PlanaVistaCardConfig;
  @state() private _wizardOpen = false;
  @state() private _onboardingDone = false;
  @state() private _settingsOpen = false;
  @state() private _previewOverrides: ThemeOverrides | null = null;

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

      pv-clock {
        display: contents;
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
         HEADER: weather left, date center, time right
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

      @media (max-width: 479px){
/* Header: date only, slim bar */
        .pvc-header {
          padding: 8px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.9375rem; }
      }

      @media (min-width: 480px) and (max-width: 767px){
        .pvc-header {
          padding: 10px 16px;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 1.0625rem; }
      }

/* md: tablets (768–1023px), single row, slightly compressed */

      @media (min-width: 768px) and (max-width: 1023px){
        .pvc-weather-icon { --icon-size: 36px; }
        .pvc-weather-temp { font-size: 1.5rem; }
        .pvc-time-display { font-size: 1.75rem; }
      }

/* short height (landscape phone, etc.): date-only compact header */

      @media (max-height: 500px){
        .pvc-header {
          padding: 6px 14px;
          justify-content: center;
        }
        .pvc-weather { display: none; }
        .pvc-header-time { display: none; }
        .pvc-header-date { font-size: 0.875rem; }
      }

      @media (min-width: 1024px){
        .pvc-header { padding: 22px 28px; }
        .pvc-weather-temp { font-size: 2rem; }
        .pvc-weather-condition { font-size: 0.9375rem; }
        .pvc-header-date { font-size: 1.5rem; }
        .pvc-time-display { font-size: 2.5rem; }
        .pvc-time-ampm { font-size: 1rem; }
      }

      @media (min-width: 1440px){
        .pvc-header { padding: 26px 36px; }
        .pvc-weather-icon { --icon-size: 56px; }
        .pvc-weather-temp { font-size: 2.375rem; }
        .pvc-weather-condition { font-size: 1.0625rem; }
        .pvc-header-date { font-size: 1.75rem; }
        .pvc-time-display { font-size: 3rem; }
        .pvc-time-ampm { font-size: 1.125rem; }
      }
    `,
  ];

  /**
   * Home Assistant sets a new `hass` on every state change in the house.
   * Re-render for it only when an entity this card or its modules show has changed.
   */
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.size === 1 && changedProps.has('hass')) {
      const prev = changedProps.get('hass') as HomeAssistant | undefined;
      return statesChanged(prev, this.hass, this._watchedEntityIds());
    }
    return true;
  }

  private _entityId(): string {
    return this._config?.entity || DEFAULT_ENTITY;
  }

  /** The config sensor's data, cached until the sensor's state object changes. */
  private _dataFor = memoizeOne((_sensorState: unknown, entityId: string): PlanaVistaData | null =>
    this.hass ? getPlanaVistaData(this.hass, entityId) : null);

  private _data(): PlanaVistaData | null {
    const entityId = this._entityId();
    return this._dataFor(this.hass?.states?.[entityId], entityId);
  }

  private _displayFor = memoizeOne((config: PlanaVistaCardConfig | undefined, data: PlanaVistaData | null): DisplayConfig =>
    resolveDisplay(config, data));

  private _display(): DisplayConfig {
    return this._displayFor(this._config, this._data());
  }

  private _modulesFor = memoizeOne((config: PlanaVistaCardConfig | undefined): ResolvedModules =>
    resolveModules(moduleRegistry.list(), config ?? {}));

  private _modules(): ResolvedModules {
    return this._modulesFor(this._config);
  }

  /** The config sensor, the weather entity, and whatever the shown modules watch. */
  private _watchedEntityIds(): string[] {
    const data = this._data();
    const ids = [this._entityId()];
    const weather = this._display().weather_entity;
    if (weather) ids.push(weather);
    for (const mod of this._modules().shown) {
      ids.push(...mod.watchedEntities({ config: this._config, data }));
    }
    return ids;
  }

  setConfig(config: PlanaVistaCardConfig) {
    this._config = { entity: DEFAULT_ENTITY, ...config };
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    // While settings panel is open, the wizard owns theme via theme-preview events.
    // Only apply saved theme from sensor when settings are closed.
    if (this._settingsOpen) return;
    if (changedProps.has('hass') || changedProps.has('_config') || changedProps.has('_settingsOpen')) {
      this._applySavedTheme();
    }
  }

  private _applySavedTheme() {
    const data = this._data();
    const theme = resolveTheme(this._config?.theme, data?.display?.theme);
    applyThemeWithOverrides(this, theme, data?.display?.theme_overrides || null);
  }

  private _onOnboardingComplete() {
    this._wizardOpen = false;
    this._onboardingDone = true;
    // Force theme application from newly saved config
    clearThemeCache(this);
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
    this._applySavedTheme();
  }

  private _onThemePreview(e: CustomEvent<{ theme: string; overrides: ThemeOverrides | null }>) {
    const { theme, overrides } = e.detail;
    const resolved = resolveTheme(theme);
    clearThemeCache(this);
    applyThemeWithOverrides(this, resolved, overrides);
    // Modules read the previewed avatar border and event style from here.
    this._previewOverrides = overrides;
  }

  private _getWeatherEntity() {
    const weatherId = this._display().weather_entity;
    return weatherId ? this.hass?.states?.[weatherId] : null;
  }

  private _showWeatherDetails() {
    const entityId = this._display().weather_entity;
    if (entityId) {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }));
    }
  }

  render() {
    if (!this._config || !this.hass) return nothing;

    const data = this._data();
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

    // Onboarding: show setup card until user explicitly launches the wizard
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

    const display = this._display();
    const active = this._modules().initial;

    return html`
      <ha-card>
        ${this._config.hide_header ? nothing : this._renderHeader(display)}
        ${active ? this._renderModule(active, data, display) : nothing}
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

  /** Render a module through its registered element. */
  private _renderModule(mod: ModuleDefinition, data: PlanaVistaData, display: DisplayConfig) {
    const tag = unsafeStatic(mod.tag);
    return staticHtml`
      <${tag}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${data}
        .display=${display}
        .previewOverrides=${this._previewOverrides}
        .canOpenSettings=${!!(this.hass as any).user?.is_admin}
        @pv-open-settings=${this._openSettings}
      ></${tag}>
    `;
  }

  private _renderHeader(display: DisplayConfig) {
    const hideWeather = !!(this._config as PlanaVistaCardConfig)?.hide_weather;
    const weather = hideWeather ? null : this._getWeatherEntity();

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

        <pv-clock .timeFormat=${display.time_format || '12h'}></pv-clock>
      </div>
    `;
  }

  private _getTempUnit(weather: any): string {
    const unit = weather.attributes.temperature_unit || '';
    if (unit.includes('C')) return 'C';
    return 'F';
  }

  static getConfigElement() {
    return document.createElement('planavista-calendar-card-editor');
  }

  static getStubConfig() {
    return { entity: DEFAULT_ENTITY };
  }

  getCardSize(): number {
    return 10;
  }
}

registerShellPages();
registerShellSettings();
defineElement('planavista-calendar-card', PlanaVistaCard);
defineElementAlias('planavista-card', 'planavista-calendar-card', PlanaVistaCard);
