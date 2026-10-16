import { LitElement, html, css, nothing, unsafeCSS } from 'lit';
import { state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { getPlanaVistaData } from '../utils/ha-utils';
import { noteRain, rainAt } from '../core/rain-record';
import type { HouseholdView } from '../core/household';
import { CORNER_MS, infoCorner, shadeOf, trialTime, weatherScene, type SkyStage } from '../core/screensaver';
import { DIM_DEFAULT, dimLevel, mediaBrightness } from '../core/dimming';
import { appearanceSettings } from '../core/appearance';
import { resolveMotion } from '../core/motion';
import { ChoresSubscription } from '../modules/chores/chores-client';
import type { Board } from '../modules/chores/chores-types';
import { eventsOn } from '../modules/chores/calendar-ties';
import { screensaverInfo } from '../modules/screensaver/info';
import { SkyScene } from '../modules/screensaver/sky-scene';
import {
  ENTRANCE, ENTRANCE_PACE, RAIN_CONDITIONS, WAKE_FADE_MS, dropFrom, rainbowStrength, rainbowWeather, seasonAt, springEase, pickLandscape,
} from '../modules/screensaver/sky';
import { skyStyles } from '../modules/screensaver/sky-styles';
import { onPageHousehold } from './page-household';
import { HEADING_FONT, ensurePageStyles } from './page-styles';
import { screensaver } from './screensaver-controller';

const hassNow = (): HomeAssistant | undefined =>
  (document.querySelector('home-assistant') as (HTMLElement & { hass?: HomeAssistant }) | null)?.hass;

const BOUNCY = springEase(260, 13, 1000);

/** sun.sun's next rising or setting as a minute of the day, or the fallback (spec 3.3: 7:00 AM and 7:00 PM). */
function minuteOf(text: unknown, fallback: number): number {
  const at = typeof text === 'string' ? new Date(text) : null;
  return at && !Number.isNaN(at.getTime()) ? at.getHours() * 60 + at.getMinutes() : fallback;
}

/**
 * pv-screensaver: the living sky over the whole page (milestone 11, spec 3.3),
 * with the time, the day, and today written over it. The page-wide controller
 * puts it on document.body and takes it away; a touch anywhere wakes the page.
 * Since 0.13.0 one shade over everything draws the controller's stage: resting,
 * lit, or dark (and in the dark the scene stops drawing).
 */
export class PvScreensaver extends LitElement {
  /** The stage it opens at; the controller moves it on with setStage. */
  stage: SkyStage = 'lit';
  private _darkTimer: number | undefined;
  @state() private _now = new Date();
  @state() private _board: Board | null = null;
  @state() private _view: HouseholdView | null = null;

  private _scene: SkyScene | null = null;
  private _timer: number | undefined;
  private _chores: ChoresSubscription | null = null;
  private _offView: (() => void) | null = null;
  private _resize: ResizeObserver | null = null;
  private _lastMinute = -1;
  private _lastWeather = '';
  private _lastNight: boolean | null = null;
  /** The corner's ten minutes the entrance played in: that corner's info comes in with the entrance, not its fade. */
  private _entrySlot = Math.floor(Date.now() / CORNER_MS);
  private _entrance: Animation[] = [];

  static styles = [skyStyles, css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: block;
      overflow: hidden;
      background: transparent;
      color: #0d1b2a;
      font-family: '${unsafeCSS(HEADING_FONT)}', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      cursor: none;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      --ink: #0d1b2a;
      --paper: #fbf9f4;
      --coral: #fb8072;
      --cream: #fff8ec;
    }
    /* A modal dialog, so it sits in the top layer above Home Assistant's own dialogs (0.11.0 review). */
    dialog.saver {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      background: transparent;
      color: inherit;
      outline: none;
    }
    dialog.saver::backdrop { background: transparent; }
    .scene {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    /* The stage (0.13.0): one black sheet over the sky and the words, moved by opacity only. */
    .shade {
      position: absolute;
      inset: 0;
      z-index: 3;
      background: #000;
      pointer-events: none;
      opacity: var(--pvs-shade, 0);
      transition: opacity var(--pvs-shade-ms, 0ms) var(--pvs-shade-ease, linear);
    }

    /* The clock: letters cut from cream paper, lifted off the sky. */
    .info {
      position: absolute;
      inset: 0;
      z-index: 2;
      padding: max(5.5vh, env(safe-area-inset-top, 0px)) 6vw 0;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      align-content: start;
      gap: 4vw;
      pointer-events: none;
      animation: pvs-arrive 4s ease both;
    }
    @keyframes pvs-arrive { from { opacity: 0; } }
    /* The first corner's info comes in with the entrance (0.12.0), not its own fade. */
    .info.entering { animation: none; }
    .card { transform-origin: 50% 0; }
    /* A dimmed shared screen (0.12.0): the words by the text rule, the card at the level. */
    .clock, .line { filter: var(--pvs-ink-filter, none); }
    .card { filter: var(--pvs-card-filter, none); }
    /* It moves to the next corner every 10 minutes, so nothing stays in one place on the screen for hours. */
    .info.mirrored { grid-template-columns: auto 1fr; }
    .info.mirrored .time { order: 2; justify-self: end; text-align: right; }
    .info.mirrored .clock { justify-content: flex-end; }
    .info.lower { align-content: end; align-items: end; padding-bottom: max(6vh, env(safe-area-inset-bottom, 0px)); }
    .clock {
      display: flex;
      align-items: baseline;
      gap: 0.6vw;
      font-weight: 600;
      font-size: clamp(88px, 13.5vw, 260px);
      line-height: 0.92;
      letter-spacing: -0.02em;
      color: var(--cream);
      font-variant-numeric: tabular-nums;
      /* A cut edge, so cream letters still read as a white paper cloud drifts behind them (the kitchen screen). */
      text-shadow:
        0 0 1px rgba(13, 27, 42, 0.34),
        0 1px 0 rgba(255, 255, 255, 0.55),
        0 2px 0 rgba(13, 27, 42, 0.24),
        0 6px 10px rgba(13, 27, 42, 0.2),
        0 18px 34px rgba(13, 27, 42, 0.16);
      transition: color 4s ease, opacity 4s ease;
    }
    .ampm { font-size: 0.24em; font-weight: 700; letter-spacing: 0.04em; }
    .line {
      margin-top: 1.6vh;
      font-size: clamp(17px, 1.75vw, 34px);
      font-weight: 700;
      color: var(--cream);
      text-shadow: 0 0 1px rgba(13, 27, 42, 0.4), 0 1px 0 rgba(13, 27, 42, 0.22), 0 4px 14px rgba(13, 27, 42, 0.28);
      transition: opacity 4s ease;
    }
    .line .dot { opacity: 0.7; padding: 0 0.45em; }

    /* The day's card: the icon's calendar, a sheet of paper with a coral header and two pegs. */
    .card {
      position: relative;
      width: clamp(300px, 27vw, 520px);
      margin-top: 1.5vh;
      border-radius: clamp(14px, 1.3vw, 24px);
      background: var(--tex, none), var(--paper);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.8) inset,
        0 2px 3px rgba(13, 27, 42, 0.10),
        0 12px 28px rgba(13, 27, 42, 0.16),
        0 30px 60px rgba(13, 27, 42, 0.12);
      transition: opacity 4s ease, transform 4s ease;
      font-size: clamp(14px, 1.08vw, 21px);
    }
    .card-head {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.15em 1.3em 1em;
      border-radius: inherit;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      background: var(--tex, none), var(--coral);
      color: #fff;
      font-weight: 800;
      font-size: 1.12em;
      letter-spacing: 0.01em;
      box-shadow: 0 2px 0 rgba(13, 27, 42, 0.08);
    }
    .card-head small { font-weight: 700; opacity: 0.9; font-size: 0.8em; }
    .hole {
      position: absolute;
      top: 0.42em;
      width: 1.15em;
      height: 0.55em;
      border-radius: 50%;
      background: rgba(13, 27, 42, 0.32);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
    }
    .hole.l { left: calc(22% - 0.18em); }
    .hole.r { right: calc(22% - 0.18em); }
    .peg {
      position: absolute;
      top: -0.8em;
      width: 0.8em;
      height: 1.6em;
      border-radius: 0.4em;
      background: var(--tex, none), #f3efe6;
      box-shadow: 0 2px 3px rgba(13, 27, 42, 0.22), 0 0 0 1px rgba(13, 27, 42, 0.05) inset;
    }
    .peg.l { left: 22%; }
    .peg.r { right: 22%; }
    .events { list-style: none; margin: 0; padding: 0.9em 1.1em 0.4em; display: grid; gap: 0.7em; }
    .ev { display: grid; grid-template-columns: 0.42em 1fr auto; gap: 0.85em; align-items: center; min-width: 0; }
    .ev .bar { align-self: stretch; border-radius: 1em; background: var(--tex, none), var(--c); box-shadow: 0 1px 2px rgba(13, 27, 42, 0.18); }
    .ev b { display: block; font-weight: 800; font-size: 1.05em; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ev span { display: block; color: rgba(13, 27, 42, 0.62); font-weight: 600; font-size: 0.86em; margin-top: 0.1em; }
    .ev div { min-width: 0; }
    .ev em {
      font-style: normal;
      font-weight: 800;
      font-size: 0.74em;
      letter-spacing: 0.01em;
      color: #b4483b;
      background: rgba(251, 128, 114, 0.16);
      padding: 0.35em 0.6em;
      border-radius: 1em;
    }
    .ev.next em { color: rgba(13, 27, 42, 0.55); background: rgba(13, 27, 42, 0.06); }
    .quiet { margin: 0; padding: 0.9em 1.1em 0.4em; color: rgba(13, 27, 42, 0.62); font-weight: 700; }
    .chores { margin: 0.7em 1.1em 0; padding: 0.9em 0 1.1em; border-top: 1px dashed rgba(13, 27, 42, 0.14); }
    .chores-title { font-weight: 800; font-size: 0.76em; letter-spacing: 0.01em; color: rgba(13, 27, 42, 0.55); }
    .rings { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5em; margin-top: 0.7em; }
    .ring { display: grid; justify-items: center; gap: 0.3em; min-width: 0; }
    .ring svg { width: 3.1em; height: 3.1em; }
    .ring .track { stroke: rgba(13, 27, 42, 0.09); }
    .ring .arc { transition: stroke-dashoffset 1.2s ease; }
    .ring text { font: 800 15px '${unsafeCSS(HEADING_FONT)}', ui-rounded, system-ui, sans-serif; fill: var(--ink); }
    .ring .who { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; font-size: 0.82em; color: rgba(13, 27, 42, 0.78); }
    .ring small { font-weight: 700; font-size: 0.8em; color: rgba(13, 27, 42, 0.6); font-variant-numeric: tabular-nums; }

    /* Night: the card goes, the clock dims to a warm low glow. */
    .night .card { opacity: 0; transform: translateY(1.5vh); }
    .night .clock { color: #f1dcc0; opacity: 0.62; text-shadow: 0 4px 22px rgba(0, 0, 0, 0.35); }
    .night .line { opacity: 0.55; color: #f1dcc0; text-shadow: none; }

    @media (orientation: portrait) {
      .info, .info.mirrored { grid-template-columns: 1fr; gap: 3vh; padding-top: max(6vh, env(safe-area-inset-top, 0px)); }
      .info.mirrored .time { order: 0; }
      .info.mirrored { justify-items: end; }
      .clock { font-size: clamp(84px, 21vw, 300px); }
      .line { font-size: clamp(16px, 3.4vw, 40px); }
      .card { width: min(100%, 62vw, 640px); font-size: clamp(14px, 2.2vw, 26px); margin-top: 0; }
    }
    @media (orientation: portrait) and (max-width: 520px) {
      .card { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .info, .clock, .line, .card, .ring .arc { transition: none; animation: none; }
    }
    :host([reduced]) .info, :host([reduced]) .clock, :host([reduced]) .line, :host([reduced]) .card, :host([reduced]) .ring .arc {
      transition: none;
      animation: none;
    }
  `];

  connectedCallback(): void {
    super.connectedCallback();
    // The rounded face is declared on the page, and a page without the card (Home Assistant's own) has none yet.
    ensurePageStyles();
    this._offView = onPageHousehold(view => { this._view = view; });
    const hass = hassNow();
    this._chores = new ChoresSubscription(feed => { this._board = feed?.board ?? null; });
    this._chores.update(hass?.connection as never);
    this._timer = window.setInterval(() => this._tick(), 1000);
    document.addEventListener('visibilitychange', this._visibility);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._timer);
    window.clearTimeout(this._darkTimer);
    document.removeEventListener('visibilitychange', this._visibility);
    this._offView?.();
    this._chores?.stop();
    this._resize?.disconnect();
    this._scene?.destroy();
    this._scene = null;
  }

  /** Closes its dialog, which gives focus back to what had it, before the controller takes it away. */
  dismiss(): void {
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.close();
  }

  firstUpdated(): void {
    this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.showModal();
    const root = this.renderRoot.querySelector<HTMLElement>('.scene')!;
    // PlanaVista's Motion setting, as the card has it (it reaches the card through --pv-motion; this sits outside).
    const hass = hassNow();
    const data = hass ? getPlanaVistaData(hass) : null;
    const reduced = resolveMotion(appearanceSettings(data?.display).motion, matchMedia('(prefers-reduced-motion: reduce)').matches) === 'reduced';
    this.toggleAttribute('reduced', reduced);
    // New land each showing (0.13.0): the snowy ranges from the owner's picks, the rest at random.
    this._scene = new SkyScene(root, { reducedMotion: reduced, landscape: pickLandscape() });
    // The paper's fibers, for the card too.
    const tex = root.style.getPropertyValue('--tex');
    if (tex) this.style.setProperty('--tex', tex);
    this._resize = new ResizeObserver(() => this._scene?.resize());
    this._resize.observe(this);
    this._feed(true);
    this._shade(this.stage, { ms: 0, easing: 'linear' });
    // Opening in the dark (a reload while it was dark): drawn once, no entrance, nothing moving.
    if (this.stage === 'dark') return;
    this._scene.start();
    void this._enter(reduced);
  }

  /** The controller's stage (0.13.0): the shade eases there, and the scene stops once it is dark. */
  setStage(stage: SkyStage, ease: { ms: number; easing: string }): void {
    const was = this.stage;
    this.stage = stage;
    if (!this.hasUpdated) return; // it opens at the stage it was given
    if (was === 'dark' && stage !== 'dark') {
      this._tick();
      if (document.visibilityState !== 'hidden') this._scene?.start();
    }
    this._shade(stage, ease);
  }

  private _shade(stage: SkyStage, ease: { ms: number; easing: string }): void {
    window.clearTimeout(this._darkTimer);
    // Where the shade is now, worked out before the change: a page that drew no frame since the last
    // change (hidden behind another window, or its panel just woken) would otherwise jump, not ease (review K1).
    const shade = this.renderRoot.querySelector<HTMLElement>('.shade');
    if (shade) void getComputedStyle(shade).opacity;
    this.style.setProperty('--pvs-shade-ms', `${ease.ms}ms`);
    this.style.setProperty('--pvs-shade-ease', ease.easing);
    this.style.setProperty('--pvs-shade', String(shadeOf(stage)));
    if (stage === 'dark') this._darkTimer = window.setTimeout(() => this._scene?.stop(), ease.ms);
  }

  /**
   * The entrance (0.12.0): the scene's parts, then the clock dropping in with a
   * bounce, the day's words after it, and the card swinging on its pegs.
   * Reduced motion: the info fades in with the scene.
   */
  private async _enter(reduced: boolean): Promise<void> {
    this._scene?.enter();
    await this.updateComplete;
    const info = this.renderRoot.querySelector<HTMLElement>('.info');
    const go = (el: Element | null | undefined, frames: Keyframe[], o: { delay: number; duration: number }, easing: string) => {
      if (el) this._entrance.push(el.animate(frames, { fill: 'backwards', easing, duration: o.duration * ENTRANCE_PACE, delay: o.delay * ENTRANCE_PACE }));
    };
    if (reduced) {
      go(info, [{ opacity: 0 }, { opacity: 1 }], { delay: 0, duration: 500 / ENTRANCE_PACE }, 'ease-out');
      return;
    }
    // Each drops from just above the screen, whichever corner it ends in (review m12 E).
    const above = (el: Element | null | undefined) => dropFrom(el?.getBoundingClientRect().bottom ?? window.innerHeight);
    const clock = info?.querySelector('.clock');
    const card = info?.querySelector('.card');
    go(clock, [{ translate: above(clock) }, { translate: '0 0' }], ENTRANCE.clock, BOUNCY);
    go(info?.querySelector('.line'), [{ opacity: 0, translate: '0 -0.7em' }, { opacity: 1, translate: '0 0' }], ENTRANCE.line, 'ease-out');
    go(card, [
      { translate: above(card), rotate: '-8deg' },
      { translate: '0 0', rotate: '5deg', offset: 0.5 },
      { rotate: '-2.5deg', offset: 0.7 },
      { rotate: '1deg', offset: 0.86 },
      { translate: '0 0', rotate: '0deg' },
    ], ENTRANCE.card, 'cubic-bezier(.3,.7,.3,1)');
  }

  /** A touch: the entrance jumps to its end and the whole screensaver fades back to the card (0.12.0). */
  leave(): Promise<void> {
    this._scene?.finishEntrance();
    for (const a of this._entrance) a.finish();
    this._entrance = [];
    this.style.pointerEvents = 'none';
    const fade = this.animate([{ opacity: 1 }, { opacity: 0 }], { duration: WAKE_FADE_MS, easing: 'ease-in', fill: 'forwards' });
    return fade.finished.then(() => undefined, () => undefined);
  }

  private _visibility = (): void => {
    if (document.visibilityState === 'hidden') this._scene?.stop();
    else if (this.stage !== 'dark') this._scene?.start();
  };

  private _tick(): void {
    // In the dark nothing is seen: the clock waits until the sky comes back.
    if (this.stage === 'dark') return;
    this._now = new Date();
    this._feed(false);
  }

  /** Try it's weather as a Home Assistant condition: after rain is a few clouds, and clear is clear-night after dark. */
  private _triedCondition(now: Date): string | null {
    const tried = screensaver.trial?.weather;
    if (!tried) return null;
    if (tried === 'after_rain') return 'partlycloudy';
    return tried === 'sunny' && this._nightNow(now) ? 'clear-night' : tried;
  }

  /** Night here, or as Try it asks (0.12.0). */
  private _nightNow(now: Date): boolean {
    const time = screensaver.trial?.time;
    return time ? time === 'night' : screensaver.night(now);
  }

  /** The level a dimmed shared screen draws at now (0.12.0); 1 elsewhere. */
  private _dimNow(now: Date): number {
    const view = this._view;
    const saver = view?.security.screensaver;
    if (!view?.account.shared || !saver) return 1;
    return dimLevel(now, view.members, saver.night, saver.dim ?? DIM_DEFAULT).level;
  }

  /** The scene's inputs: re-lit when the minute, the weather, or night changes; Try it's choices in place of the facts. */
  private _feed(force: boolean): void {
    const hass = hassNow();
    const now = this._now;
    const minute = now.getHours() * 60 + now.getMinutes();
    const weather = this._weatherState(hass);
    const trial = screensaver.trial;
    const key = `${weather ? `${weather.state}|${String(weather.attributes.cloud_coverage ?? '')}` : ''}|${JSON.stringify(trial ?? {})}`;
    const night = this._nightNow(now);
    if (!force && minute === this._lastMinute && key === this._lastWeather && night === this._lastNight) return;
    this._lastMinute = minute;
    this._lastWeather = key;
    this._lastNight = night;
    const sun = hass?.states['sun.sun']?.attributes ?? {};
    const rise = minuteOf(sun.next_rising, 7 * 60);
    const set = minuteOf(sun.next_setting, 19 * 60);
    // Rain now: noted, for the rainbow once it stops.
    if (weather && RAIN_CONDITIONS.has(weather.state)) noteRain(now.getTime());
    const afterRain = trial?.weather === 'after_rain';
    const condition = this._triedCondition(now) ?? weather?.state;
    const scene = weatherScene(condition, trial?.weather ? undefined : weather?.attributes.cloud_coverage);
    const rainbow = afterRain ? 1 : rainbowWeather(scene) ? rainbowStrength(now.getTime() - rainAt()) : 0;
    const latitude = (hass as unknown as { config?: { latitude?: number } } | undefined)?.config?.latitude;
    const level = this._dimNow(now);
    this._dimInfo(level);
    this._scene?.update({
      now: trial?.time ? trialTime(now, trial.time, rise, set) : now,
      rise,
      set,
      weather: scene,
      night,
      season: trial?.season ?? seasonAt(now, latitude),
      rainbow,
      dim: level,
    });
  }

  /** The words and the card at a dimmed screen's level: the words by the text rule. */
  private _dimInfo(level: number): void {
    if (level >= 1) {
      this.style.removeProperty('--pvs-ink-filter');
      this.style.removeProperty('--pvs-card-filter');
      return;
    }
    this.style.setProperty('--pvs-ink-filter', `brightness(${mediaBrightness(Math.sqrt(level)).toFixed(3)})`);
    this.style.setProperty('--pvs-card-filter', `brightness(${mediaBrightness(level).toFixed(3)})`);
  }

  private _weatherState(hass: HomeAssistant | undefined): { state: string; attributes: Record<string, unknown> } | undefined {
    const entity = hass ? getPlanaVistaData(hass)?.display?.weather_entity : undefined;
    const found = entity ? hass?.states[entity] : undefined;
    return found ? { state: found.state, attributes: found.attributes as Record<string, unknown> } : undefined;
  }

  render() {
    const hass = hassNow();
    const now = this._now;
    const data = hass ? getPlanaVistaData(hass) : null;
    const format = data?.display?.time_format === '24h' ? '24h' : '12h';
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const members = this._view?.members ?? [];
    // Try it's weather in the words too, with the real temperature (0.12.0).
    const real = this._weatherState(hass);
    const tried = this._triedCondition(now);
    const weather = tried && real ? { ...real, state: tried } : real;
    const info = screensaverInfo({
      now, format, weather, events: eventsOn(data, dayStart, dayEnd), members, board: this._board,
    });
    const colors = new Map(members.map(m => [m.id, m.color]));
    const night = this._nightNow(now);
    const corner = infoCorner(now.getTime());
    const entering = Math.floor(now.getTime() / CORNER_MS) === this._entrySlot;
    const shortDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return html`
      <dialog class="saver" @cancel=${(e: Event) => e.preventDefault()}>
      <div class="scene" aria-hidden="true"></div>
      ${keyed(corner, html`<div class="info ${night ? 'night' : ''} ${corner.endsWith('right') ? 'mirrored' : ''} ${corner.startsWith('bottom') ? 'lower' : ''} ${entering ? 'entering' : ''}"
        role="img" aria-label=${`${info.time}${info.ampm ? ` ${info.ampm}` : ''}, ${info.date}. Touch to wake.`}>
        <div class="time">
          <div class="clock"><span class="hm">${info.time}</span>${info.ampm ? html`<span class="ampm">${info.ampm}</span>` : nothing}</div>
          <div class="line"><span>${info.date}</span>${info.weather ? html`<span class="dot">·</span><span>${info.weather}</span>` : nothing}</div>
        </div>
        ${info.events.length || info.rings.length || info.nothingElse ? html`
          <div class="card">
            <div class="card-head"><span class="hole l"></span><span class="hole r"></span><span>Today</span><small>${shortDate}</small></div>
            <span class="peg l"></span><span class="peg r"></span>
            ${info.events.length ? html`
              <ul class="events">
                ${info.events.map((e, i) => html`
                  <li class="ev ${e.now ? '' : 'next'}" style="--c:${(e.member && colors.get(e.member)) || '#fb8072'}">
                    <span class="bar"></span>
                    <div><b>${e.title}</b><span>${e.when}</span></div>
                    ${e.now ? html`<em>Now</em>` : i === 0 || info.events[i - 1]?.now ? html`<em>Next</em>` : html`<span></span>`}
                  </li>
                `)}
              </ul>
            ` : info.nothingElse ? html`<p class="quiet">Nothing else today</p>` : nothing}
            ${info.rings.length ? html`
              <div class="chores">
                <div class="chores-title">Chores today</div>
                <div class="rings">
                  ${info.rings.map(r => html`
                    <div class="ring" aria-label=${`${r.name}: ${r.done} of ${r.due}`}>
                      <svg viewBox="0 0 44 44" aria-hidden="true">
                        <circle class="track" cx="22" cy="22" r="18" fill="#fff" stroke-width="4.5"></circle>
                        <circle class="arc" cx="22" cy="22" r="18" fill="none" stroke=${colors.get(r.id) ?? '#fb8072'} stroke-width="4.5"
                          stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset=${113.1 * (1 - r.done / r.due)} transform="rotate(-90 22 22)"></circle>
                        <text x="22" y="27.5" text-anchor="middle">${r.initial}</text>
                      </svg>
                      <small class="who">${r.name}</small>
                      <small>${r.done} of ${r.due}</small>
                    </div>
                  `)}
                </div>
              </div>
            ` : nothing}
          </div>
        ` : nothing}
      </div>`)}
      <div class="shade" aria-hidden="true"></div>
      </dialog>
    `;
  }
}

defineElement('pv-screensaver', PvScreensaver);
