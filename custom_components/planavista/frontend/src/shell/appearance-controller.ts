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
import { setPageDim } from './page-dim';
import { DIM_STEP_MS, DimSettings, dimColor, dimLevel, dimTokens, mediaBrightness, surfaceLevel } from '../core/dimming';
import type { Member } from '../core/household';
import { Motion, resolveMotion, ringTokens } from '../core/motion';
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
  /**
   * On a shared screen: the household's levels and its night (0.12.0); otherwise nothing dims.
   * 'waiting' until the household answers: the last level drawn stands meanwhile.
   */
  dimming?: { settings: DimSettings; members: Member[]; night: { from: string; to: string } | null } | null | 'waiting';
}

/**
 * The level this page (or, after a reload, this browser) last drew, so a card
 * Home Assistant re-creates at night doesn't flash full before the household
 * answers (review m12 F). Older than LAST_DIM_MS it's forgotten.
 */
const LAST_DIM_KEY = 'planavista.dim';
const LAST_DIM_MS = 10 * 60_000;
let lastDim: { level: number; at: number } | null = null;

function rememberDim(level: number, at: number): void {
  if (lastDim?.level === level && at - lastDim.at < 30_000) return;
  lastDim = { level, at };
  try {
    localStorage.setItem(LAST_DIM_KEY, JSON.stringify(lastDim));
  } catch {
    // No storage (a private window): this page still remembers.
  }
}

function rememberedDim(now: number): number {
  let last = lastDim;
  if (!last) {
    try {
      const saved = JSON.parse(localStorage.getItem(LAST_DIM_KEY) ?? 'null') as { level?: unknown; at?: unknown } | null;
      if (saved && typeof saved.level === 'number' && typeof saved.at === 'number') last = { level: saved.level, at: saved.at };
    } catch {
      last = null;
    }
  }
  return last && now - last.at < LAST_DIM_MS && last.level > 0 && last.level <= 1 ? last.level : 1;
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
  /**
   * How bright this card's surfaces and people's colors are drawn now, 0 to 1
   * (0.12.0); 1 elsewhere. A light look goes no lower than LIGHT_FLOOR.
   */
  dim = 1;
  /** The household's level now, before the look's floor. */
  private _level = 1;
  /** A level Settings is showing for a moment. */
  private _preview: { level: number; until: number } | null = null;

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
    setPageDim(this._host, null);
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
    const dimNext = this._dimNow(source.dimming ?? null);
    this._show(resolved.mode, source.overlayOpen);
    // Until the first real settings arrive, what's drawn is a placeholder: they draw without a change to play.
    if (!this._display) this._shown = null;
    const next = [resolved.next, dimNext].filter((d): d is Date => d !== null).sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
    this._schedule(next);
  }

  /** Show `level` on this card for `ms` (tapping a level in Settings). */
  preview(level: number, ms: number): void {
    this._preview = { level, until: Date.now() + ms };
    this._host.requestUpdate();
  }

  /**
   * Work out the level now; answers when to look again. During a fade the
   * level moves in 15-second steps, so Home Assistant's updates in between
   * repaint nothing.
   */
  private _dimNow(dimming: AppearanceSource['dimming']): Date | null {
    const now = Date.now();
    if (this._preview && this._preview.until <= now) this._preview = null;
    if (this._preview) {
      this._level = this._preview.level;
      return new Date(this._preview.until - 1000 + 1);
    }
    if (dimming === 'waiting') {
      this._level = rememberedDim(now);
      return null;
    }
    if (!dimming) {
      this._level = 1;
      rememberDim(1, now);
      return null;
    }
    const step = new Date(Math.floor(now / DIM_STEP_MS) * DIM_STEP_MS);
    const { level, fading } = dimLevel(step, dimming.members, dimming.night, dimming.settings);
    this._level = level;
    rememberDim(level, now);
    // nextLookAt adds a second to a change's time; the next step's start is what's wanted.
    return fading ? new Date(step.getTime() + DIM_STEP_MS - 1000) : null;
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
    // A dimmed shared screen draws every color of its look at the level (0.12.0); pictures follow by a filter.
    this.dim = surfaceLevel(this._level, mode);
    const dimmed = this.dim < 1;
    // Home Assistant's own bars follow (review m12 I).
    setPageDim(this._host, this.dim);
    applyTokens(this._host, {
      ...dimTokens(themeTokens(this.look, mode), this._level, mode),
      '--pv-motion': this.motion,
      ...ringTokens(this.motion),
      '--pv-dim': String(Math.round(this.dim * 1000) / 1000),
      '--pv-media-filter': dimmed ? `brightness(${mediaBrightness(this.dim).toFixed(3)})` : 'none',
      '--pv-ink-filter': dimmed ? `brightness(${mediaBrightness(Math.sqrt(this.dim)).toFixed(3)})` : 'none',
      // Letters on people's colors and white marks (review m12 B): the text rule's level, and white at it.
      '--pv-ink-level': dimmed ? Math.sqrt(this.dim).toFixed(3) : '1',
      '--pv-white': dimmed ? dimColor('#FFFFFF', this.dim, true) : '#FFFFFF',
    });
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
