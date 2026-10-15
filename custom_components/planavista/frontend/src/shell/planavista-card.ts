import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import { ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { defineElement, defineElementAlias } from '../utils/define';
import { nextSheetLayer } from '../core/sheet-layer';
import { deepActiveElement } from '../core/focus';
import { CardDrafts } from '../core/page-drafts';
import { opensSetupByItself } from '../core/setup-flow';
import { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../types';
import { baseStyles, buttonStyles, typographyStyles, animationStyles } from '../styles/shared';
import { statusStyles } from '../styles/status';
import { getPlanaVistaData } from '../utils/ha-utils';
import { todayHighLow } from '../utils/weather-subscription';
import { homeChanged, memoizeOne, statesChanged } from '../utils/render-cache';
import { resolveDisplay } from '../core/display';
import {
  GlanceChip,
  ModuleAction,
  ModuleContext,
  ModuleDefinition,
  ModuleElement,
  ModuleService,
  OpenTarget,
  ResolvedModules,
  ServiceHost,
  initialModuleView,
  moduleRegistry,
  resolveModules,
} from '../core/module-registry';
import { HouseholdView, Member, SettingsAccess, memberColor, parentsWithPins, settingsAccess, setupNeedsPin } from '../core/household';
import { PinGate, pinReason } from '../core/pin-gate';
import type { Session } from '../core/session';
import { HouseholdApi, UnlockResult } from '../core/household-client';
import { AppearanceEdits } from '../core/appearance-edits';
import { appearanceDependencies, sunOf } from '../core/appearance-deps';
import { AppearanceController } from './appearance-controller';
import { DIM_DEFAULT, DIM_PREVIEW_EVENT, DimPreview } from '../core/dimming';
import { registerShellSettings } from './definition';
import type { RunSetupDetail, SettingsTarget } from '../core/settings-registry';
import { HouseholdController } from './household-controller';
import { ForecastController } from './forecast-controller';
import { LayoutController } from './layout-controller';
import { ensurePageStyles } from './page-styles';
import { SessionController } from './session-controller';

// The card editor, Settings and setup, the header, and the bar.
import './planavista-card-editor';
import './pv-glance-header';
import './pv-nav-bar';
import './pv-parent-strip';
import './pv-pin-sheet';
import './pv-notice-sheet';
import './settings/pv-settings';
import './setup/pv-setup';
import { ContentScrollDetail, HeaderHeights, compactHeader } from '../core/content-scroll';
import { PLACE_STORAGE, Place, placeKey, readPlace, usablePlace, writePlace } from '../core/place';
import { SCREEN_AS_SHOWN, composedAncestor, fitView } from '../core/panel-fit';
import { kioskStripAction, showsKioskReturn } from '../core/kiosk';
import { errorMessage } from '../core/ws-api';
import type { Toast } from '../core/pv-toast';
import { PAGE_HANDOFFS, TAKE_MS, handoffToast } from '../core/handoff';
import '../core/pv-toast';
import { kiosk } from './kiosk-controller';

/** A sheet the card shows over everything: a PIN, or why there is no way in. */
type CardSheet =
  | { kind: 'pin'; purpose: 'settings' | 'setup' | 'continue' | 'keep_setup'; heading: string }
  | { kind: 'pin'; purpose: 'module'; heading: string; reason?: string; members: Member[]; resolve: (unlocked: boolean) => void }
  | { kind: 'no_pin' };

const DEFAULT_ENTITY = 'sensor.planavista_config';

/** First-run setup has opened by itself on this page, so closing it leaves "Tap to begin setup" (2026-10-14). */
let setupOpenedOnPage = false;

/**
 * The PlanaVista card: a shell that shows the header, runs setup and
 * Settings, applies the theme, and hosts the modules registered in
 * core/module-registry (today, the calendar).
 */
export class PlanaVistaCard extends LitElement implements ServiceHost {
  @property({ attribute: false }) public hass!: HomeAssistant;
  /** Home Assistant sets this when the card is a panel view's one card; shown on the host as `panel`. */
  @property({ type: Boolean, reflect: true, attribute: 'panel' }) isPanel = false;
  /** 'grid' in a sections view, where the card fills its cell (shown on the host as `grid`; round 2). */
  @property({ attribute: false }) layout?: string;
  /** A module's full-screen layer, shown outside ha-card. */
  @state() private _fullscreen: HTMLElement | null = null;
  /** Puts Home Assistant's view back as it was (core/panel-fit). */
  private _unfitView?: () => void;
  /** Stops hearing kiosk mode's changes (milestone 9). */
  private _unhearKiosk?: () => void;
  /** A short message the card itself shows: a refused Exit kiosk mode. */
  @state() private _toast: Toast | null = null;
  @state() private _config?: PlanaVistaCardConfig;
  @state() private _wizardOpen = false;
  @state() private _onboardingDone = false;
  @state() private _settingsOpen = false;
  /** Where Settings opens this time (the board's Edit, Import a plan); the list when null. */
  @state() private _settingsTarget: SettingsTarget | null = null;
  /** Setup's steps that Settings asked to run (the Chores row's short setup, spec 14.7); null when none run. */
  @state() private _flow: string[] | null = null;
  /** The layer Settings or setup took when it opened: above whatever a module had open (round 1). */
  @state() private _overlayLayer = 0;
  /** How to undo the short setup when a parent backs out of it. */
  private _flowCancel: RunSetupDetail['cancel'];
  @state() private _sheet: CardSheet | null = null;
  private _sheetOpener: HTMLElement | null = null;
  /** Drafts of person edits; they outlive Settings until the page reloads (spec 9.4). */
  /** Editors' drafts outlive the card (Home Assistant rebuilds it after a restart); its appearance edits stay its own. */
  private _drafts = new CardDrafts();
  /** How Settings was opened: by this account's own rights, or through parent mode. */
  private _settingsVia: 'access' | 'session' | null = null;
  /** The view each module shows; the bar and the module both change it (data down, events up). */
  @state() private _views: Record<string, string> = {};
  /** The module the switcher picked; null for the card's first. */
  @state() private _moduleId: string | null = null;
  /** Where this card was, if it was on screen within the hour (spec 3.7); applied once data and the household are in. */
  private _remembered: Place | null = null;
  private _placeKey = '';
  private _placeApplied = false;
  private _placeTimer: number | undefined;
  /** Portrait with the content scrolled down: the header shows one line (spec 12.2). */
  @state() private _compactHeader = false;
  /** The header's two heights, for how much its step to one line gives the content. */
  private _headerHeights = new HeaderHeights();
  /** Where a glance chip or a ring sent the card last (a module and view, perhaps one person). */
  @state() private _openTarget: OpenTarget | null = null;
  /** Bumped whenever a module's service has news, so the modules and the header redraw. */
  @state() private _serviceRevision = 0;

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
      // The sensor's own settings, not the stand-in a missing sensor gets: while Home Assistant restarts they're unknown.
      display: (this.hass?.states?.[this._entityId()]?.attributes as { display?: Record<string, unknown> } | undefined)?.display,
      cardTheme: this._config?.theme,
      sun: sunOf(this.hass?.states as never),
      haDark: !!(this.hass as unknown as { themes?: { darkMode?: boolean } } | undefined)?.themes?.darkMode,
      // The goal's reveal too: an automatic switch would play its view transition over it (round 3).
      overlayOpen: !!this._sheet || this._settingsOpen || this._wizardOpen || !!this._flow || this._moduleOverlay || !!this._fullscreen,
      dimming: this._dimming(),
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
    token => this._session.used(token),
  );

  /** Each module's card-wide state (the chores feed), made once per card. */
  private readonly _services: Record<string, ModuleService> = {};

  /** How a module asks for a PIN: the card's PIN sheet, then the card's session. */
  private readonly _pinGate: PinGate = {
    ask: (members, heading, reason) => new Promise<boolean>(resolve => {
      if (this._sheet) {
        this._toast = { id: `pin-busy-${Date.now()}`, text: "Finish the PIN that's open first." };
        resolve(false);
        return;
      }
      if (members.length === 0) {
        resolve(false);
        return;
      }
      // The control inside the module that asked, not the module's host (round 1).
      this._sheetOpener = deepActiveElement(this.renderRoot as ShadowRoot);
      this._sheet = { kind: 'pin', purpose: 'module', heading, reason, members, resolve };
    }),
  };

  constructor() {
    super();
    this._drafts.set('appearance', this._appearanceEdits);
    for (const mod of moduleRegistry.list()) {
      if (mod.service) this._services[mod.id] = mod.service(this);
    }
    // Settings shows a brightness level on this card for a moment (0.12.0).
    this.addEventListener(DIM_PREVIEW_EVENT, (e: Event) => {
      const { level, ms } = (e as CustomEvent<DimPreview>).detail;
      this._appearance.preview(level, ms);
    });
  }

  /** On a shared screen, what its dimming follows (0.12.0); elsewhere nothing dims. */
  private _dimming() {
    const view = this._household.view;
    // Until the household answers, the last level stands (review m12 F).
    if (!view) return 'waiting' as const;
    if (!view.account.shared) return null;
    const saver = view.security.screensaver;
    return { settings: saver?.dim ?? DIM_DEFAULT, members: view.members, night: saver?.night ?? null };
  }

  /** ServiceHost: the household, once it has answered. */
  get householdView(): HouseholdView | null {
    return this._household.view;
  }

  /** ServiceHost: the PIN session on this screen. */
  get pinSession(): Session | null {
    return this._session.session;
  }

  /** ServiceHost: the config sensor's data. */
  get planavistaData(): PlanaVistaData | null {
    return this._data();
  }

  /** ServiceHost: the backend refused a command made with this session. */
  sessionEnded(token: string): void {
    this._session.ended(token);
  }

  /** ServiceHost: the backend accepted a command made with this session (a touch there). */
  sessionUsed(token: string): void {
    this._session.used(token);
  }

  /** ServiceHost: a module's service has news. */
  serviceChanged(): void {
    this._serviceRevision++;
  }

  static styles = [
    baseStyles,
    buttonStyles,
    typographyStyles,
    animationStyles,
    statusStyles,
    css`
      /* Only the space Home Assistant leaves, so the page itself never scrolls:
         on an iPhone its header grows by the status bar and its view pads the
         home indicator, and Safari's 100vh is the screen with its toolbars
         hidden (dvh is the screen as shown). The card runs under the home
         indicator, as iOS's own bars do: the bottom bar pads itself by the
         inset, and in landscape the card pads its own bottom. */
      :host {
        display: block;
        height: calc(100vh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px) + var(--pv-under-status-bar, 0px));
        height: calc(100dvh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px) + var(--pv-under-status-bar, 0px));
        /* Kiosk mode with the top bar hidden: the card runs up under the status bar (milestone 9). */
        margin-top: calc(-1 * var(--pv-under-status-bar, 0px));
        margin-bottom: calc(-1 * var(--safe-area-inset-bottom, 0px));
        overflow: hidden;
        font-family: var(--pv-font-family);
        color: var(--pv-text);
      }

      /* In landscape the bar is at the top: content stays clear of the home indicator, the card's color behind it (review). */
      :host([layout='landscape']) ha-card {
        padding-bottom: var(--safe-area-inset-bottom, 0px);
        box-sizing: border-box;
      }

      ha-card {
        position: relative;
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

      /* A panel view's one card meets the edges of the screen, as Home Assistant's
         own cards do there: the screen's corners are the only rounded ones. */
      /* A sections view gives the card a cell of its own size: fill it, and nothing more (round 2).
         The cell scrolls with the page, away from the screen's edges: no room for the status bar or
         the home indicator (round 3). The sheets stay on the screen, so they keep theirs. */
      :host([grid]) {
        height: 100%;
        margin: 0;
        --pv-under-status-bar: 0px;
      }

      :host([grid]) pv-nav-bar {
        --safe-area-inset-bottom: 0px;
      }

      :host([grid][layout='landscape']) ha-card {
        padding-bottom: 0;
      }

      :host([panel]) ha-card {
        border-radius: 0;
        box-shadow: none;
        padding-left: var(--pv-inset-left);
        padding-right: var(--pv-inset-right);
        box-sizing: border-box;
      }

      /* Its color runs to the side edges, its content inside the safe area (round 1): Home Assistant
         pads its view by the side insets, the left only when narrow, and kiosk mode hides the sidebar. */
      :host([panel]) {
        margin-left: calc(-1 * var(--view-container-inset-left, 0px));
        margin-right: calc(-1 * var(--view-container-inset-right, 0px));
        --pv-inset-left: max(var(--view-container-inset-left, 0px), var(--pv-kiosk-inset-left, 0px));
        --pv-inset-right: var(--view-container-inset-right, 0px);
      }

      :host([panel]) pv-glance-header {
        margin-left: calc(-1 * var(--pv-inset-left));
        margin-right: calc(-1 * var(--pv-inset-right));
        padding-left: var(--pv-inset-left);
        padding-right: var(--pv-inset-right);
      }

      /* One header, module, and bar in every layout; only their order changes,
         so turning a tablet never rebuilds the module (spec 12.1). */
      pv-glance-header {
        order: 1;
        flex-shrink: 0;
      }

      /* With kiosk mode's top bar hidden, whatever comes first makes room for the status bar, once (round 1). */
      pv-parent-strip.under {
        --pv-strip-top: var(--pv-under-status-bar, 0px);
      }

      pv-glance-header.under {
        padding-top: var(--pv-under-status-bar, 0px);
      }

      ha-card.under {
        padding-top: var(--pv-under-status-bar, 0px);
        box-sizing: border-box;
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

      /* The card's own toast sits just after the module area: above the bar in
         portrait and on phones, at the bottom in landscape, as the chores
         toasts do (review: it covered the bar). */
      .fullscreen {
        display: contents;
      }

      .toast-anchor {
        order: 3;
        position: relative;
        height: 0;
        flex: none;
      }

      :host([layout='landscape']) pv-nav-bar {
        order: 2;
      }

/* Setup-pending placeholder shown in card editor preview */

      .pvc-setup-pending {
        flex: 1 1 auto;
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
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
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
        padding-top: var(--pv-under-status-bar, 0px);
        /* Over ha-card's padding too, so it keeps a sideways phone's side insets itself (round 3). */
        padding-left: var(--pv-inset-left, 0px);
        padding-right: var(--pv-inset-right, 0px);
        box-sizing: border-box;
        background: var(--pv-card-bg, #FFFFFF);
        animation: pv-fadeIn 200ms ease forwards;
      }

      /* Settings' own strip in parent mode makes the room, in its tint (round 2: a white band sat above it). */
      .pvc-settings-overlay.strip {
        padding-top: 0;
        --pv-strip-top: var(--pv-under-status-bar, 0px);
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
      // Losing Home Assistant, or its start finishing, changes what the modules show.
      if (homeChanged(prev, this.hass)) return true;
      return statesChanged(prev, this.hass, this._watchedEntityIds());
    }
    return true;
  }

  /** True while Home Assistant is still starting (the config sensor may not exist yet). */
  private _starting(): boolean {
    const state = (this.hass?.config as { state?: string } | undefined)?.state;
    return state !== undefined && state !== 'RUNNING';
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

  private _modulesFor = memoizeOne((config: PlanaVistaCardConfig | undefined, modules: unknown, _available: boolean): ResolvedModules =>
    resolveModules(moduleRegistry.list(), config ?? {}, { config, data: null, household: this._household.view }));

  private _modules(): ResolvedModules {
    const view = this._household.view;
    return this._modulesFor(this._config, view?.modules, !!view?.available);
  }

  /** What modules and their services know about the card right now. */
  private _ctx(): ModuleContext {
    return { config: this._config, data: this._data(), household: this._household.view };
  }

  /** Every module's glance chips, for the header (spec 12.2: on every module). */
  private _glanceChips(): GlanceChip[] {
    const ctx = this._ctx();
    return Object.values(this._services).flatMap(service => service.glance?.(ctx) ?? []);
  }

  /** Go where a chip or a ring points: a module, one of its views, perhaps one person. */
  private _open(target: OpenTarget): void {
    const mod = this._modules().shown.find(m => m.id === target.module);
    if (!mod) return;
    this._moduleId = mod.id;
    if (target.view && mod.views.some(v => v.id === target.view)) {
      this._views = { ...this._views, [mod.id]: target.view };
    }
    this._openTarget = { ...target };
  }

  /** A bar or strip button of the module on screen. */
  private _moduleAction(id: string): void {
    (this.renderRoot.querySelector('.pv-module') as ModuleElement | null)?.moduleAction?.(id);
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
    // The card's own view and module options apply whenever its config changes,
    // unless this card was on screen within the hour: then it comes back where it was.
    this._views = {};
    this._moduleId = null;
    this._placeKey = placeKey(window.location.pathname, config as unknown as Record<string, unknown>);
    this._remembered = readPlace(this._storedPlaces(), this._placeKey, Date.now());
    this._placeApplied = false;
  }

  private _storedPlaces(): string | null {
    try {
      return window.localStorage.getItem(PLACE_STORAGE);
    } catch {
      return null;
    }
  }

  /** Remember where this card is now (on every change, each minute on screen, and when it leaves). */
  private _savePlace(): void {
    const mod = this._activeModule();
    if (!this._placeApplied || !mod || !this._placeKey) return;
    try {
      window.localStorage.setItem(PLACE_STORAGE, writePlace(this._storedPlaces(), this._placeKey, { module: mod.id, views: this._views }, Date.now()));
    } catch {
      // Private windows and blocked storage: the card opens on its start, as before.
    }
  }

  /** The module on screen: the one the switcher picked, else the card's first. */
  private _activeModule(): ModuleDefinition | undefined {
    const modules = this._modules();
    return modules.shown.find(m => m.id === this._moduleId) ?? modules.initial;
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has('layout')) this.toggleAttribute('grid', this.layout === 'grid');
    // Home Assistant makes the card again when the connection comes back (round 3).
    if (changed.has('hass') && this.hass) {
      if (this.hass.connected === false) PAGE_HANDOFFS.dropped(Date.now());
      else PAGE_HANDOFFS.reconnected(Date.now());
    }
    // An admin on first run goes straight into setup (PlanaVista's own dashboard, 2026-10-14).
    const firstRun = this._data()?.onboarding_complete === false && !this._onboardingDone;
    if (opensSetupByItself({
      firstRun, access: this._access(),
      admin: !!this.hass?.user?.is_admin, opened: setupOpenedOnPage, busy: this._settingsOpen || !!this._sheet,
    }) && !this._wizardOpen) {
      setupOpenedOnPage = true;
      this._wizardOpen = true;
    }
    const opened = changed as Map<string, unknown>;
    if ((opened.has('_settingsOpen') && this._settingsOpen) || (opened.has('_flow') && this._flow)) {
      this._overlayLayer = nextSheetLayer();
    }
    // The view a card opens on is chosen once, when the data first arrives (as in 1.1.0).
    // Coming back where it was (spec 3.7): once, when the data and the household are in, so a
    // module that needs the household (Chores) can be found.
    if (!this._placeApplied && this._data() && this._household.view) {
      this._placeApplied = true;
      const place = usablePlace(this._remembered, this._modules().shown);
      if (place) {
        this._moduleId = place.module;
        this._views = { ...this._views, ...place.views };
      }
    }
    const mod = this._activeModule();
    const data = this._data();
    if (mod && data && !(mod.id in this._views)) {
      this._views = { ...this._views, [mod.id]: initialModuleView(mod, { config: this._config, data }) };
    }
    // Another view or module starts at its top, so the header starts tall again. Turning the
    // tablet keeps the content's place (spec 12.1), so it keeps the header's shape too.
    if (changed.has('_views') || changed.has('_moduleId')) this._compactHeader = false;
    // Lock after no touches and Parent mode ends after apply to an open session as soon as they're saved.
    this._session.follow(this._household.view?.security);
  }

  private _setView(id: string): void {
    const mod = this._activeModule();
    if (!mod || this._views[mod.id] === id) return;
    this._views = { ...this._views, [mod.id]: id };
  }

  /**
   * A module's content scrolled: the header shrinks past the top and grows back at it. Only
   * portrait shows it, but every layout keeps it, so a turn to portrait finds it in step.
   */
  private _onContentScroll = (e: CustomEvent<ContentScrollDetail>): void => {
    this._compactHeader = compactHeader(this._compactHeader, e.detail, this._headerHeights.change);
  };

  connectedCallback(): void {
    super.connectedCallback();
    // The heading face is declared on the page; shadow roots ignore @font-face (spec 11.2).
    ensurePageStyles();
    // "Within an hour" counts from when the card was last on screen, not from its last change.
    this._placeTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') this._savePlace();
    }, 60_000);
    void this.updateComplete.then(() => this._fitView());
    this._unhearKiosk = kiosk.onChange(() => this.requestUpdate());
    kiosk.cardShown(location.pathname);
    // After the swap: Home Assistant may put this card in before it takes the old one out.
    window.setTimeout(() => this._takeHandoff(), 0);
  }

  /** Module notes from the old card, kept until each module shows (round 4: chores waits for the household). */
  private _resumes: Record<string, unknown> | null = null;
  private _resumesUntil = 0;
  /** The latest a note may wait for the household (round 5: after a restart it can take a while). */
  private _resumesBy = 0;
  /** The card said what closed, so a module says nothing over it (round 5). */
  private _resumeQuiet = false;

  /** What the old card for this place had open when Home Assistant made this one (round 3). */
  private _takeHandoff(): void {
    const note = this._placeKey ? PAGE_HANDOFFS.take(this._placeKey, Date.now()) : null;
    if (!note) return;
    const toast = handoffToast(note);
    if (toast) this._toast = toast;
    this._resumeQuiet = !!toast;
    if (Object.keys(note.modules).length === 0) return;
    this._resumes = { ...note.modules };
    this._resumesUntil = 0; // from when the household answers
    this._resumesBy = Date.now() + 120_000;
    this.requestUpdate();
  }

  /** Gives the module now showing the old card's note for it, once. */
  private _resumeModule(): void {
    const resumes = this._resumes;
    if (!resumes) return;
    if (Date.now() > this._resumesBy) {
      this._resumes = null;
      return;
    }
    // Modules show once the household answers, which after a restart can take a while.
    if (!this._household.view) return;
    if (this._resumesUntil === 0) this._resumesUntil = Date.now() + TAKE_MS;
    if (Date.now() > this._resumesUntil) {
      this._resumes = null;
      return;
    }
    const module = this.renderRoot.querySelector('.pv-module') as ModuleElement | null;
    if (!module || !(module.localName in resumes)) return;
    const mine = resumes[module.localName];
    delete resumes[module.localName];
    if (Object.keys(resumes).length === 0) this._resumes = null;
    module.resume?.(mine, { quiet: this._resumeQuiet });
  }

  /** What this card has open, left for the card Home Assistant makes again after a reconnect. */
  private _leaveHandoff(): void {
    if (!this._placeKey) return;
    const module = this.renderRoot.querySelector('.pv-module') as ModuleElement | null;
    const mine = module?.handoff?.();
    PAGE_HANDOFFS.leave(this._placeKey, {
      pin: this._sheet?.kind === 'pin',
      toast: this._toast,
      modules: module && mine !== undefined ? { [module.localName]: mine } : {},
    }, Date.now());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._leaveHandoff();
    window.clearInterval(this._placeTimer);
    this._savePlace();
    this._unfitView?.();
    this._unfitView = undefined;
    this._unhearKiosk?.();
    this._unhearKiosk = undefined;
    kiosk.cardGone();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    this._resumeModule();
    if (changedProps.has('isPanel')) this._fitView();
    if (changedProps.has('_moduleId') || changedProps.has('_views')) this._savePlace();
    this._guardSettings();
    this._guardSetup();
  }

  /**
   * As a panel view's one card, Home Assistant's page (its root and its view)
   * is only as tall as the screen as shown, so the page never scrolls (core/panel-fit).
   */
  private _fitView(): void {
    this._unfitView?.();
    this._unfitView = undefined;
    if (!this.isPanel || !this.isConnected) return;
    const container = composedAncestor<HTMLElement>(this, 'HUI-VIEW-CONTAINER');
    if (!container) return;
    const supported = typeof CSS !== 'undefined' && CSS.supports('height', SCREEN_AS_SHOWN);
    const restores = [fitView(container, 'minHeight', supported), fitView(document.documentElement, 'height', supported)];
    this._unfitView = () => restores.forEach(restore => restore());
  }

  private _onOnboardingComplete(event?: CustomEvent<{ module?: string }>) {
    this._wizardOpen = false;
    this._onboardingDone = true;
    // Setup's last step can open a module (Open the board).
    const module = event?.detail?.module;
    if (module) this._moduleId = module;
  }

  /** What the gear may do for this account; until the household answers, admins only, as in 1.1.0. */
  private _access(): SettingsAccess {
    const isAdmin = !!this.hass?.user?.is_admin;
    if (!this._household.ready) return isAdmin ? 'open' : 'none';
    return settingsAccess(this._household.view, isAdmin);
  }

  /** The gear, or a module asking for Settings at a page (its event's detail), perhaps after a parent's PIN. */
  private _openSettings(event?: Event) {
    this._sheetOpener = (event?.composedPath?.()[0] as HTMLElement | undefined) ?? null;
    const detail = (event as CustomEvent<SettingsTarget | undefined> | undefined)?.detail;
    this._settingsTarget = detail && typeof detail.page === 'string' ? detail : null;
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
    if (sheet?.kind === 'pin' && sheet.purpose === 'module') {
      sheet.resolve(!!this._session.session);
      return;
    }
    if (sheet?.kind === 'pin' && (sheet.purpose === 'settings' || sheet.purpose === 'continue')) {
      this._settingsVia = 'session';
      this._settingsOpen = true;
    }
    if (sheet?.kind === 'pin' && sheet.purpose === 'setup') this._wizardOpen = true;
  }

  private _onSheetCancel() {
    const sheet = this._sheet;
    this._closeSheet();
    if (sheet?.kind === 'pin' && sheet.purpose === 'settings') this._settingsTarget = null;
    if (sheet?.kind === 'pin' && sheet.purpose === 'module') sheet.resolve(false);
    // Without parent mode, Settings can't stay open on this screen.
    if (sheet?.kind === 'pin' && sheet.purpose === 'continue') this._onSettingsClose();
    // Setup can't save without parent mode here; it picks up at the same step next time.
    if (sheet?.kind === 'pin' && sheet.purpose === 'keep_setup') {
      this._wizardOpen = false;
      this._flow = null;
    }
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
    // Say why it closed, and that an editor's changes wait on the card (round 2: it vanished without a word).
    const kept = [...this._drafts.keys()].some(key => key !== 'appearance');
    this._toast = {
      id: `settings-lapsed-${Date.now()}`,
      text: kept ? 'Parent mode ended, so Settings closed. Your changes are kept for when you come back.' : 'Parent mode ended, so Settings closed.',
    };
    this._onSettingsClose();
  }

  /**
   * Setup on a screen that needs a parent's PIN runs in parent mode. When
   * parent mode ends halfway (two quiet minutes), ask for a PIN to keep going
   * rather than let every save fail.
   */
  private _guardSetup() {
    if (!(this._wizardOpen || this._flow) || this._sheet || !this._household.ready) return;
    if (!setupNeedsPin(this._household.view, !!this._session.session?.parent)) return;
    this._sheet = { kind: 'pin', purpose: 'keep_setup', heading: "Enter a parent's PIN to keep setting up" };
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
        .members=${sheet.purpose === 'module' ? sheet.members : view ? parentsWithPins(view.members) : []}
        .heading=${sheet.heading}
        .reason=${(sheet.purpose === 'module' ? sheet.reason : undefined) ?? pinReason(sheet.heading) ?? ''}
        .shuffle=${!!view?.security.shuffle_keypad}
        @pv-unlocked=${this._onUnlocked}
        @pv-sheet-close=${this._onSheetCancel}
      ></pv-pin-sheet>
    `;
  }

  /** What comes first in the card, and so makes room for the status bar in kiosk mode (round 1). */
  private _underStatusBar(): 'strip' | 'header' | 'card' {
    const session = this._session.session;
    if (session && this._household.view?.members.some(m => m.id === session.memberId)) return 'strip';
    return this._config?.hide_header ? 'card' : 'header';
  }

  /** Whose session is open (parent mode, or a child's unlocked window), with its countdown and Lock, even when the header is hidden. */
  private _renderParentStrip() {
    const session = this._session.session;
    if (!session) return nothing;
    const member = this._household.view?.members.find(m => m.id === session.memberId);
    if (!member) return nothing;
    const active = this._activeModule();
    const actions: ModuleAction[] = active && session.parent ? this._services[active.id]?.stripActions?.(this._ctx()) ?? [] : [];
    return html`
      <pv-parent-strip
        class="under"
        .member=${{ ...member, color: memberColor(member, 'light', this._appearance.dim) }}
        .hass=${this.hass}
        .endsAt=${this._session.endsAt ?? 0}
        .span=${this._session.spanMs}
        .parent=${session.parent}
        .actions=${actions}
        .kiosk=${this._kioskAction()}
        @pv-lock=${this._lockAndKiosk}
        @pv-kiosk=${this._onKiosk}
        @pv-strip-action=${(e: CustomEvent<{ id: string }>) => this._moduleAction(e.detail.id)}
      ></pv-parent-strip>
    `;
  }

  /** The strip's kiosk button, in the card's strip and Settings' alike. */
  private _kioskAction(): 'exit' | 'back' | null {
    const session = this._session.session;
    return session ? kioskStripAction(kiosk.look, kiosk.steppedOut, session) : null;
  }

  /** Lock ends parent mode and brings kiosk mode back (milestone 9, D4). */
  private _lockAndKiosk = (): void => {
    this._session.lock();
    kiosk.restore();
  };

  /** The strip's kiosk button: step out (the backend checks again) or back in. */
  private _onKiosk = async (): Promise<void> => {
    if (kiosk.steppedOut) {
      kiosk.restore();
      return;
    }
    const session = this._session.session;
    if (!session) return;
    try {
      await this._api.exitKiosk();
      kiosk.lift(Date.now(), session.idleMs, session.capAt, session.startedAt);
    } catch (err) {
      this._toast = { id: `kiosk-${Date.now()}`, text: errorMessage(err) ?? "Couldn't exit kiosk mode. Try again.", tone: 'bad' };
    }
  };

  private _onSettingsClose() {
    this._settingsOpen = false;
    this._settingsVia = null;
    this._settingsTarget = null;
  }

  /** Settings' Chores row: close Settings and run the chores steps of setup (spec 14.7). */
  private _onRunSetup(event: CustomEvent<RunSetupDetail>) {
    event.stopPropagation();
    this._flow = [...event.detail.steps];
    this._flowCancel = event.detail.cancel;
    this._settingsOpen = false;
    this._settingsTarget = null;
  }

  /** The short setup finished: open the module its last step names (Open the board). */
  private _onFlowComplete(event: CustomEvent<{ module?: string }>) {
    event.stopPropagation();
    this._flow = null;
    this._flowCancel = undefined;
    if (event.detail?.module) this._moduleId = event.detail.module;
  }

  /** Back from the short setup's first step: Settings again, where it started. */
  private async _onFlowCancel() {
    const cancel = this._flowCancel;
    this._flow = null;
    this._flowCancel = undefined;
    try {
      await cancel?.();
    } catch {
      // Chores stay as the steps left them; Settings shows which.
    }
    this._openSettings(new CustomEvent('pv-open-settings', { detail: { page: 'chores-off' } }));
  }

  private _onSettingsLock() {
    this._session.lock();
    kiosk.restore();
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
          ${this._starting() ? html`
            <div class="state" role="status">
              <div class="art" aria-hidden="true">⏳</div>
              <h2>Home Assistant is starting</h2>
              <p>The calendar shows up here as soon as it's ready.</p>
            </div>
          ` : html`
            <div class="state" role="alert">
              <div class="art" aria-hidden="true">🧩</div>
              <h2>PlanaVista isn't set up yet</h2>
              <p>Add PlanaVista in Settings, Devices and services, then reload this page.</p>
            </div>
          `}
        </ha-card>
      `;
    }

    // First-run setup: a card that starts setup, until setup is finished.
    // It has no header, so the card makes room for the status bar unless the strip does (round 2).
    if (data.onboarding_complete === false && !this._onboardingDone) {
      return html`
        <ha-card class=${this._underStatusBar() === 'strip' ? '' : 'under'}>
          ${this._renderParentStrip()}
          ${this._wizardOpen ? html`
            <pv-setup
              .hass=${this.hass}
              .data=${data}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .pinGate=${this._pinGate}
              .session=${this._session.session}
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
      <ha-card class=${this._underStatusBar() === 'card' ? 'under' : ''} @pv-fullscreen=${this._onFullscreen}>
        ${this._renderParentStrip()}
        ${showsKioskReturn(kiosk.steppedOut, this._session.session) ? html`
          <div class="banner info kiosk-out" role="status">
            <span class="text">Home Assistant's menus are showing for now.</span>
            <button class="pv-btn pv-btn-secondary" type="button" @click=${() => kiosk.restore()}>Back to kiosk mode</button>
          </div>
        ` : nothing}
        ${this._config.hide_header ? nothing : this._renderHeader(display)}
        ${active ? this._renderModule(active, data, display) : nothing}
        ${active ? this._renderBar(active) : nothing}
        ${this._settingsOpen ? html`
          <div class="pvc-settings-overlay ${this._underStatusBar() === 'strip' ? 'strip' : ''}" style=${`z-index:${this._overlayLayer}`}>
            <pv-settings
              .hass=${this.hass}
              .data=${data}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .session=${this._session.session}
              .sessionEndsAt=${this._session.endsAt ?? 0}
              .sessionSpan=${this._session.spanMs}
              .kioskAction=${this._kioskAction()}
              .parent=${this._household.view?.members.find(m => m.id === this._session.session?.memberId) ?? null}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .target=${this._settingsTarget}
              @pv-settings-close=${this._onSettingsClose}
              @pv-run-setup=${this._onRunSetup}
              @pv-settings-open-target=${(e: CustomEvent<OpenTarget>) => { this._onSettingsClose(); this._open(e.detail); }}
              @pv-kiosk=${this._onKiosk}
              @pv-lock=${this._onSettingsLock}
            ></pv-settings>
          </div>
        ` : nothing}
        ${this._flow ? html`
          <div class="pvc-settings-overlay" style=${`z-index:${this._overlayLayer}`}>
            <pv-setup
              .hass=${this.hass}
              .data=${data}
              .household=${this._household.view}
              .api=${this._api}
              .layout=${this._layout.layout}
              .drafts=${this._drafts}
              .services=${this._services}
              .revision=${this._serviceRevision}
              .pinGate=${this._pinGate}
              .session=${this._session.session}
              .only=${this._flow}
              cancelLabel="Settings"
              @onboarding-complete=${this._onFlowComplete}
              @pv-setup-cancel=${this._onFlowCancel}
            ></pv-setup>
          </div>
        ` : nothing}
        ${this._renderSheet()}
        <div class="toast-anchor"><pv-toast .toast=${this._toast} @pv-toast-gone=${() => { this._toast = null; }}></pv-toast></div>
      </ha-card>
      ${this._renderFullscreen()}
    `;
  }

  /**
   * A module's full-screen layer (the goal surprise's reveal, milestone 10). It
   * sits outside ha-card, whose container query would hold a fixed layer
   * inside the card, so it covers the whole screen, Home Assistant's bars too.
   */
  private _renderFullscreen() {
    const layer = this._fullscreen;
    if (!layer) return nothing;
    return html`<div class="fullscreen" @pv-fullscreen-done=${(e: Event) => {
      if (e.composedPath()[0] === layer) this._fullscreen = null;
    }}>${layer}</div>`;
  }

  private _onFullscreen = (event: CustomEvent<{ element: HTMLElement }>): void => {
    event.stopPropagation();
    this._fullscreen = event.detail.element;
  };

  /** Render a module through its registered element. */
  private _renderModule(mod: ModuleDefinition, data: PlanaVistaData, display: DisplayConfig) {
    const tag = unsafeStatic(mod.tag);
    return staticHtml`
      <${tag}
        class="pv-module"
        ?inert=${this._settingsOpen}
        layout=${this._layout.layout}
        .hass=${this.hass}
        .cardConfig=${this._config}
        .data=${data}
        .display=${display}
        .view=${this._views[mod.id]}
        .mode=${this._appearance.mode}
        .dim=${this._appearance.dim}
        .shape=${this._appearance.look.shape}
        .forecast=${this._forecast.forecast}
        .household=${this._household.view}
        .session=${this._session.session}
        .sessionEndsAt=${this._session.endsAt ?? 0}
        .services=${this._services}
        .revision=${this._serviceRevision}
        .pinGate=${this._pinGate}
        .openTarget=${this._openTarget}
        @pv-view-change=${(e: CustomEvent<{ view: string }>) => this._setView(e.detail.view)}
        @pv-overlay-change=${(e: CustomEvent<{ open: boolean }>) => { this._moduleOverlay = e.detail.open; }}
        @pv-content-scroll=${this._onContentScroll}
        @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
        @pv-open-settings=${this._openSettings}
      ></${tag}>
    `;
  }

  private _renderHeader(display: DisplayConfig) {
    const weather = this._config?.hide_weather ? null : this._getWeatherEntity();
    return html`
      <pv-glance-header
        class=${this._underStatusBar() === 'header' ? 'under' : ''}
        ${ref(this._headerHeights.attach)}
        layout=${this._layout.layout}
        ?short=${this._layout.short}
        ?inert=${this._settingsOpen}
        ?compact=${this._layout.layout === 'portrait' && this._compactHeader}
        .timeFormat=${display.time_format || '12h'}
        .weather=${weather ?? null}
        .weatherEntity=${display.weather_entity}
        .today=${todayHighLow(this._forecast.forecast, new Date())}
        .chips=${this._glanceChips()}
        @pv-open=${(e: CustomEvent<OpenTarget>) => this._open(e.detail)}
      ></pv-glance-header>
    `;
  }

  /** The switcher, the module's views, and the gear (spec 12.2). */
  private _renderBar(active: ModuleDefinition) {
    return html`
      <pv-nav-bar
        layout=${this._layout.layout}
        ?short=${this._layout.short}
        ?inert=${this._settingsOpen}
        .modules=${this._modules().shown.map(m => ({ id: m.id, label: m.label, icon: m.icon }))}
        .activeModule=${active.id}
        .views=${active.views}
        .activeView=${this._views[active.id] ?? ''}
        .canOpenSettings=${this._access() !== 'none'}
        .actions=${this._services[active.id]?.barActions?.(this._ctx()) ?? []}
        @pv-module-action=${(e: CustomEvent<{ id: string }>) => this._moduleAction(e.detail.id)}
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

  /** A sections view's starting size: the full width and about 630 px, never under about 370 px. */
  getGridOptions() {
    return { columns: 'full', rows: 10, min_rows: 6, min_columns: 6 };
  }
}

registerShellSettings();
defineElement('planavista-calendar-card', PlanaVistaCard);
defineElementAlias('planavista-card', 'planavista-calendar-card', PlanaVistaCard);
