import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  AppearanceSettings,
  QUIET_MS,
  SunState,
  WAKE_MS,
  appearanceSettings,
  lookOf,
  mayAutoSwitch,
  nextLookAt,
  resolveMode,
  transitionKind,
  withCardTheme,
} from '../core/appearance';
import { AppearanceEdits } from '../core/appearance-edits';
import { Motion, resolveMotion } from '../core/motion';
import { Look, Mode, applyTokens, themeTokens } from '../styles/theme-pairs';
import { runAppearanceChange, viewTransitionsSupported } from './view-transition';

/** What the controller reads from its card on every update. */
export interface AppearanceSource {
  /** The saved display settings; undefined while Home Assistant doesn't have them (it's restarting). */
  display: Record<string, unknown> | undefined;
  /** The card's own `theme` option. */
  cardTheme: string | undefined;
  sun: SunState | null;
  /** This screen's Home Assistant dark mode. */
  haDark: boolean;
  /** A sheet, Settings, setup, or a module's dialog is open. */
  overlayOpen: boolean;
}

type Host = ReactiveControllerHost & HTMLElement;

/** What counts as someone using the screen, anywhere on the page: a change sweeps the whole page. */
const INTERACTIONS = ['pointerdown', 'keydown', 'wheel'] as const;
const LISTEN: AddEventListenerOptions = { capture: true, passive: true };

/**
 * Day and night for one card (spec 12.4). It works out Light or Dark from
 * the household's settings and the sun, the schedule, or this screen's Home
 * Assistant theme; draws the theme's tokens on the card; and plays the
 * change: never mid-touch or under an open sheet, never for a screen that
 * was asleep, and from the finger when tapped here. It also sets Full or
 * Reduced motion as --pv-motion (spec 11.5).
 */
export class AppearanceController implements ReactiveController {
  /** The mode on screen. */
  mode: Mode = 'light';
  motion: Motion = 'full';
  settings: AppearanceSettings = appearanceSettings(undefined);
  look: Look = lookOf(this.settings);
  /** Automatic follows the sun, but Home Assistant has no sun.sun (spec 15.4). */
  sunMissing = false;

  private _shown: Mode | null = null;
  private _lastInteraction = 0;
  private _quietUntil = Number.POSITIVE_INFINITY;
  private _timer: ReturnType<typeof setTimeout> | undefined;
  private _changing = false;
  /** Until then, changes just switch: the screen has just woken (spec 12.4). */
  private _wakeUntil = 0;
  /** The last display settings Home Assistant had; they stand while it restarts. */
  private _display: Record<string, unknown> | undefined;
  private _reduced: MediaQueryList | undefined;

  constructor(
    private readonly _host: Host,
    private readonly _edits: AppearanceEdits,
    private readonly _source: () => AppearanceSource,
    /** Resolves once the card and its module have drawn the new mode. */
    private readonly _settled: () => Promise<unknown>,
  ) {
    _host.addController(this);
  }

  hostConnected(): void {
    for (const type of INTERACTIONS) document.addEventListener(type, this._onInteraction, LISTEN);
    document.addEventListener('visibilitychange', this._onVisibility);
    this._reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
    this._reduced?.addEventListener('change', this._onReducedChange);
  }

  hostDisconnected(): void {
    for (const type of INTERACTIONS) document.removeEventListener(type, this._onInteraction, LISTEN);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this._reduced?.removeEventListener('change', this._onReducedChange);
    clearTimeout(this._timer);
    // A card that comes back draws at once, without a change to play.
    this._shown = null;
  }

  hostUpdate(): void {
    const source = this._source();
    // Settings Home Assistant doesn't have right now aren't the household's choice: the last ones stand.
    if (source.display) this._display = source.display;
    const saved = appearanceSettings(this._display);
    this._edits.reconcile(saved);
    const settings = withCardTheme(this._edits.current(saved), source.cardTheme);
    const resolved = resolveMode(settings, { now: new Date(), sun: source.sun, haDark: source.haDark });
    this.settings = settings;
    this.look = lookOf(settings);
    this.sunMissing = resolved.sunMissing;
    this.motion = resolveMotion(settings.motion, !!this._reduced?.matches);
    this._show(resolved.mode, source.overlayOpen);
    // Until the first real settings arrive, what's drawn is a placeholder: they draw without a change to play.
    if (!this._display) this._shown = null;
    this._schedule(resolved.next);
  }

  private _show(target: Mode, overlayOpen: boolean): void {
    this._quietUntil = Number.POSITIVE_INFINITY;
    if (this._changing) return; // the change in progress draws, then looks again
    if (this._shown === null || target === this._shown) {
      this._paint(target);
      return;
    }
    const point = this._edits.takeTap();
    const hidden = document.visibilityState === 'hidden';
    // Just woken: Home Assistant is catching up on what changed while the screen slept.
    const wake = !point && Date.now() < this._wakeUntil;
    if (!point && !hidden && !wake && !mayAutoSwitch(Date.now(), this._lastInteraction, overlayOpen)) {
      // An automatic change waits for a quiet moment, or, under an open sheet, until it closes
      // (closing it draws the card again, which looks again).
      this._quietUntil = overlayOpen ? Number.POSITIVE_INFINITY : this._lastInteraction + QUIET_MS;
      this._paint(this._shown);
      return;
    }
    const kind = wake
      ? 'none'
      : transitionKind({
          from: this._shown,
          to: target,
          byHand: point !== null,
          hidden,
          reducedMotion: this.motion === 'reduced',
          supported: viewTransitionsSupported(),
        });
    this._changing = true;
    void runAppearanceChange(
      kind,
      this._host,
      async () => {
        this._paint(target);
        this._host.requestUpdate();
        await this._settled();
      },
      point ?? undefined,
    ).finally(() => {
      this._changing = false;
      this._host.requestUpdate();
    });
  }

  /** Draw the look in `mode` on the card. */
  private _paint(mode: Mode): void {
    this.mode = mode;
    this._shown = mode;
    applyTokens(this._host, { ...themeTokens(this.look, mode), '--pv-motion': this.motion });
    this._host.setAttribute('appearance', mode);
    this._host.setAttribute('motion', this.motion);
  }

  /** Look again at the next change, the end of a quiet moment, or in a minute; never at once. */
  private _schedule(next: Date | null): void {
    clearTimeout(this._timer);
    const now = Date.now();
    this._timer = setTimeout(() => this._host.requestUpdate(), nextLookAt(now, next, this._quietUntil) - now);
  }

  private _onInteraction = (): void => {
    this._lastInteraction = Date.now();
  };

  /** A screen waking from sleep switches at once, with no change to play (spec 12.4). */
  private _onVisibility = (): void => {
    if (document.visibilityState !== 'visible') return;
    this._wakeUntil = Date.now() + WAKE_MS;
    this._host.requestUpdate();
  };

  private _onReducedChange = (): void => {
    this._host.requestUpdate();
  };
}
