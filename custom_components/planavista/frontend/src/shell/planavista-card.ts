import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement, defineElementAlias } from '../utils/define';
import { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../types';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { getPlanaVistaData } from '../utils/ha-utils';
import { todayHighLow } from '../utils/weather-subscription';
import { memoizeOne, statesChanged } from '../utils/render-cache';
import { resolveDisplay } from '../core/display';
import { ModuleDefinition, ResolvedModules, initialModuleView, moduleRegistry, resolveModules } from '../core/module-registry';
import { SettingsAccess, parentsWithPins, settingsAccess } from '../core/household';
import { HouseholdApi, UnlockResult } from '../core/household-client';
import { AppearanceEdits } from '../core/appearance-edits';
import { appearanceDependencies, sunOf } from '../core/appearance-deps';
import { AppearanceController } from './appearance-controller';
import { registerShellSettings } from './definition';
import { HouseholdController } from './household-controller';
import { ForecastController } from './forecast-controller';
import { LayoutController } from './layout-controller';
import { ensurePageStyles } from './page-styles';
import { SessionController } from './session-controller';

// The card editor, Settings and setup, the header, and the bar.
import './planavista-card-editor';
import './pv-glance-header';
import './pv-nav-bar';
import './settings/theme-picker';
import './pv-parent-strip';
import './pv-pin-sheet';
import './pv-notice-sheet';
import './settings/pv-settings';
import './setup/pv-setup';

/** A sheet the card shows over everything: a parent's PIN, or why there is no way in. */
type CardSheet =
  | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue'; heading: string }
  | { kind: 'no_pin' };

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
  @state() private _sheet: CardSheet | null = null;
  private _sheetOpener: HTMLElement | null = null;
  /** Drafts of person edits; they outlive Settings until the page reloads (spec 9.4). */
  private _drafts = new Map<string, unknown>();
  /** How Settings was opened: by this account's own rights, or through parent mode. */
  private _settingsVia: 'access' | 'session' | null = null;
  /** The view each module shows; the bar and the module both change it (data down, events up). */
  @state() private _views: Record<string, string> = {};
  /** The module the switcher picked; null for the card's first. */
  @state() private _moduleId: string | null = null;

  private _household = new HouseholdController(this);
  private _session = new SessionController(this, () => this._api);
  private _layout = new LayoutController(this);
  /** One forecast for the card; the header may hide its weather, but Week and Agenda still show it, as in 1.1.0. */
  private _forecast = new ForecastController(this, () => this._display().weather_entity);
  /** Appearance changes on their way to Home Assistant; Settings and setup share them. */
  private _appearanceEdits = new AppearanceEdits(() => this.requestUpdate());
  /** A module's own sheet or dialog is open (its event popup or dialog). */
  @state() private _moduleOverlay = false;
  private _appearance = new AppearanceController(
    this,
    this._appearanceEdits,
    () => ({
      display: this._data()?.display as Record<string, unknown> | undefined,
      cardTheme: this._config?.theme,
      sun: sunOf(this.hass?.states as never),
      haDark: !!(this.hass as unknown as { themes?: { darkMode?: boolean } } | undefined)?.themes?.darkMode,
      overlayOpen: !!this._sheet || this._settingsOpen || this._wizardOpen || this._moduleOverlay,
    }),
    async () => {
      await this.updateComplete;
      await (this.renderRoot.querySelector('.pv-module') as { updateComplete?: Promise<unknown> } | null)?.updateComplete;
    },
  );
  private _api = new HouseholdApi(
    { callWS: <T>(msg: Record<string, unknown>) => (this.hass as any).callWS(msg) as Promise<T> },
    () => this._session.token,
    token => this._session.ended(token),
  );

  constructor() {
    super();
    this._drafts.set('appearance', this._appearanceEdits);
  }

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
        /* Header type scales with the card, not the window (spec 12.1). */
        container-type: inline-size;
      }

      /* One header, module, and bar in every layout; only their order changes,
         so turning a tablet never rebuilds the module (spec 12.1). */
      pv-glance-header {
        order: 1;
        flex-shrink: 0;
      }

      .pv-module {
        order: 3;
        flex: 1 1 auto;
        min-height: 0;
      }

      pv-nav-bar {
        order: 4;
        flex-shrink: 0;
      }

      :host([layout='landscape']) pv-nav-bar {
        order: 2;
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

    `,
  ];

  /**
   * Home Assistant sets a new `hass` on every state change in the house.
   * Re-render for it only when an entity this card or its modules show has changed.
   */
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.size === 1 && changedProps.has('hass')) {
      const prev = changedProps.get('hass') as HomeAssistant | undefined;
      const darkMode = (hass: HomeAssistant | undefined) =>
        !!(hass as unknown as { themes?: { darkMode?: boolean } } | undefined)?.themes?.darkMode;
      if (appearanceDependencies(this._appearance.settings).haDarkMode && darkMode(prev) !== darkMode(this.hass)) return true;
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
    const ids = [this._entityId(), ...appearanceDependencies(this._appearance.settings).entities];
    const weather = this._display().weather_entity;
    if (weather) ids.push(weather);
    for (const mod of this._modules().shown) {
      ids.push(...mod.watchedEntities({ config: this._config, data }));
    }
    return ids;
  }

  setConfig(config: PlanaVistaCardConfig) {
    this._config = { entity: DEFAULT_ENTITY, ...config };
    // The card's own view and module options apply whenever its config changes.
    this._views = {};
    this._moduleId = null;
  }

  /** The module on screen: the one the switcher picked, else the card's first. */
  private _activeModule(): ModuleDefinition | undefined {
    const modules = this._modules();
    return modules.shown.find(m => m.id === this._moduleId) ?? modules.initial;
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    // The view a card opens on is chosen once, when the data first arrives (as in 1.1.0).
    const mod = this._activeModule();
    const data = this._data();
    if (mod && data && !(mod.id in this._views)) {
      this._views = { ...this._views, [mod.id]: initialModuleView(mod, { config: this._config, data }) };
    }
  }

  private _setView(id: string): void {
    const mod = this._activeModule();
    if (!mod || this._views[mod.id] === id) return;
    this._views = { ...this._views, [mod.id]: id };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // The heading face is declared on the page; shadow roots ignore @font-face (spec 11.2).
    ensurePageStyles();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    this._guardSettings();
  }

  private _onOnboardingComplete() {
    this._wizardOpen = false;
    this._onboardingDone = true;
  }

  /** What the gear may do for this account; until the household answers, admins only, as in 1.1.0. */
  private _access(): SettingsAccess {
    const isAdmin = !!this.hass?.user?.is_admin;
    if (!this._household.ready) return isAdmin ? 'open' : 'none';
    return settingsAccess(this._household.view, isAdmin);
  }

  private _openSettings(event?: Event) {
    this._sheetOpener = (event?.composedPath?.()[0] as HTMLElement | undefined) ?? null;
    const access = this._access();
    if (access === 'open' || this._session.session?.parent) {
      this._settingsVia = access === 'open' ? 'access' : 'session';
      this._settingsOpen = true;
    } else if (access === 'pin') {
      this._sheet = { kind: 'pin', purpose: 'settings', heading: "Who's opening Settings?" };
    } else if (access === 'no_pin') {
      this._sheet = { kind: 'no_pin' };
    }
  }

  /** Start setup: straight away for an admin or a parent, or after a parent's PIN. */
  private _beginSetup(event?: Event) {
    this._sheetOpener = (event?.composedPath?.()[0] as HTMLElement | undefined) ?? null;
    if (this._access() === 'open' || this._session.session?.parent) {
      this._wizardOpen = true;
    } else if (this._access() === 'pin') {
      this._sheet = { kind: 'pin', purpose: 'setup', heading: "Who's setting up PlanaVista?" };
    }
  }

  private _renderSetupCard() {
    const access = this._access();
    const icon = html`
      <div class="pvc-setup-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
        </svg>
      </div>
    `;
    if (access !== 'open' && access !== 'pin') {
      return html`
        <div class="pvc-setup-pending">
          ${icon}
          <p class="pvc-setup-title">PlanaVista isn't set up yet</p>
          <p class="pvc-setup-hint">An admin can set it up from their own Home Assistant login.</p>
        </div>
      `;
    }
    return html`
      <div class="pvc-setup-pending"
        role="button"
        tabindex="0"
        aria-label="Begin PlanaVista setup"
        @click=${this._beginSetup}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._beginSetup(e); } }}
      >
        ${icon}
        <p class="pvc-setup-title">PlanaVista</p>
        <p class="pvc-setup-hint">Tap to begin setup</p>
      </div>
    `;
  }

  private _onUnlocked(event: CustomEvent<{ result: UnlockResult }>) {
    const sheet = this._sheet;
    this._session.unlocked(event.detail.result);
    this._closeSheet();
    if (sheet?.kind === 'pin' && (sheet.purpose === 'settings' || sheet.purpose === 'continue')) {
      this._settingsVia = 'session';
      this._settingsOpen = true;
    }
    if (sheet?.kind === 'pin' && sheet.purpose === 'setup') this._wizardOpen = true;
  }

  private _onSheetCancel() {
    const sheet = this._sheet;
    this._closeSheet();
    // Without parent mode, Settings can't stay open on this screen.
    if (sheet?.kind === 'pin' && sheet.purpose === 'continue') this._onSettingsClose();
  }

  /** Settings stays open only while this account may use it, or parent mode is on. */
  private _guardSettings() {
    if (!this._settingsOpen || this._session.session?.parent || this._sheet) return;
    const access = this._access();
    if (access === 'open') return;
    if (this._settingsVia === 'access' && access === 'pin') {
      // This account was just marked as a shared screen.
      this._sheet = { kind: 'pin', purpose: 'continue', heading: "Enter a parent's PIN to keep changing settings" };
      return;
    }
    this._onSettingsClose();
  }

  private _closeSheet() {
    this._sheet = null;
    const opener = this._sheetOpener;
    this._sheetOpener = null;
    opener?.focus?.();
  }

  private _renderSheet() {
    const sheet = this._sheet;
    if (!sheet) return nothing;
    const layout = this._layout.layout;
    if (sheet.kind === 'no_pin') {
      return html`
        <pv-notice-sheet
          .layout=${layout}
          heading="Settings needs a parent's PIN"
          body="On a shared screen, a parent opens Settings with their PIN, and no parent has one yet. Sign in to Home Assistant with a parent's or an admin's own account, then set one in Settings, PINs and parent mode."
          .actions=${[{ id: 'ok', label: 'OK', kind: 'primary' }]}
          @pv-sheet-action=${this._closeSheet}
        ></pv-notice-sheet>
      `;
    }
    const view = this._household.view;
    return html`
      <pv-pin-sheet
        .hass=${this.hass}
        .api=${this._api}
        .layout=${layout}
        mode="unlock"
        .members=${view ? parentsWithPins(view.members) : []}
        .heading=${sheet.heading}
        .shuffle=${!!view?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `;
  }

  /** Whose parent mode is on, with its countdown and Lock, even when the header is hidden. */
  private _renderParentStrip() {
    const session = this._session.session;
    if (!session?.parent) return nothing;
    const parent = this._household.view?.members.find(m => m.id === session.memberId);
    if (!parent) return nothing;
    return html`
      <pv-parent-strip
        .member=${parent}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt ?? 0}
        @pv-lock=${() => this._session.lock()}
      ></pv-parent-strip>
    `;
  }

  private _onSettingsClose() {
    this._settingsOpen = false;
    this._settingsVia = null;
  }

  private _onSettingsLock() {
    this._session.lock();
    if (this._access() !== 'open') this._onSettingsClose();
  }

  private _getWeatherEntity() {
    const weatherId = this._display().weather_entity;
    return weatherId ? this.hass?.states?.[weatherId] : null;
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

    // First-run setup: a card that starts setup, until setup is finished.
    if (data.onboarding_complete === false && !this._onboardingDone) {
      return html`
        <ha-card>
          ${this._wizardOpen ? html`
            <pv-setup
              .hass=${this.hass}
              .data=${data}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              @onboarding-complete=${this._onOnboardingComplete}
            ></pv-setup>
          ` : this._renderSetupCard()}
          ${this._renderSheet()}
        </ha-card>
      `;
    }

    const display = this._display();
    const active = this._activeModule();

    return html`
      <ha-card>
        ${this._renderParentStrip()}
        ${this._config.hide_header ? nothing : this._renderHeader(display)}
        ${active ? this._renderModule(active, data, display) : nothing}
        ${active ? this._renderBar(active) : nothing}
        ${this._settingsOpen ? html`
          <div class="pvc-settings-overlay">
            <pv-settings
              .hass=${this.hass}
              .data=${data}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .session=${this._session.session}
              .sessionEndsAt=${this._session.endsAt ?? 0}
              .parent=${this._household.view?.members.find(m => m.id === this._session.session?.memberId) ?? null}
              .drafts=${this._drafts}
              @pv-settings-close=${this._onSettingsClose}
              @pv-lock=${this._onSettingsLock}
            ></pv-settings>
          </div>
        ` : nothing}
        ${this._renderSheet()}
      </ha-card>
    `;
  }

  /** Render a module through its registered element. */
  private _renderModule(mod: ModuleDefinition, data: PlanaVistaData, display: DisplayConfig) {
    const tag = unsafeStatic(mod.tag);
    return staticHtml`
      <${tag}
        class="pv-module"
        layout=${this._layout.layout}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${data}
        .display=${display}
        .view=${this._views[mod.id]}
        .mode=${this._appearance.mode}
        .shape=${this._appearance.look.shape}
        .forecast=${this._forecast.forecast}
        @pv-view-change=${(e: CustomEvent<{ view: string }>) => this._setView(e.detail.view)}
        @pv-overlay-change=${(e: CustomEvent<{ open: boolean }>) => { this._moduleOverlay = e.detail.open; }}
      ></${tag}>
    `;
  }

  private _renderHeader(display: DisplayConfig) {
    const weather = this._config?.hide_weather ? null : this._getWeatherEntity();
    return html`
      <pv-glance-header
        layout=${this._layout.layout}
        .timeFormat=${display.time_format || '12h'}
        .weather=${weather ?? null}
        .weatherEntity=${display.weather_entity}
        .today=${todayHighLow(this._forecast.forecast, new Date())}
      ></pv-glance-header>
    `;
  }

  /** The switcher, the module's views, and the gear (spec 12.2). */
  private _renderBar(active: ModuleDefinition) {
    return html`
      <pv-nav-bar
        layout=${this._layout.layout}
        .modules=${this._modules().shown.map(m => ({ id: m.id, label: m.label, icon: m.icon }))}
        .activeModule=${active.id}
        .views=${active.views}
        .activeView=${this._views[active.id] ?? ''}
        .canOpenSettings=${this._access() !== 'none'}
        @pv-module-select=${(e: CustomEvent<{ id: string }>) => { this._moduleId = e.detail.id; }}
        @pv-view-select=${(e: CustomEvent<{ id: string }>) => this._setView(e.detail.id)}
        @pv-open-settings=${this._openSettings}
      ></pv-nav-bar>
    `;
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

registerShellSettings();
defineElement('planavista-calendar-card', PlanaVistaCard);
defineElementAlias('planavista-card', 'planavista-calendar-card', PlanaVistaCard);
