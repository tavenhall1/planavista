import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { getPlanaVistaData } from '../utils/ha-utils';
import type { HouseholdView } from '../core/household';
import { infoCorner, weatherScene } from '../core/screensaver';
import { appearanceSettings } from '../core/appearance';
import { resolveMotion } from '../core/motion';
import { ChoresSubscription } from '../modules/chores/chores-client';
import type { Board } from '../modules/chores/chores-types';
import { eventsOn } from '../modules/chores/calendar-ties';
import { screensaverInfo } from '../modules/screensaver/info';
import { SkyScene } from '../modules/screensaver/sky-scene';
import { skyStyles } from '../modules/screensaver/sky-styles';
import { onPageHousehold } from './page-household';
import { screensaver } from './screensaver-controller';

const hassNow = (): HomeAssistant | undefined =>
  (document.querySelector('home-assistant') as (HTMLElement & { hass?: HomeAssistant }) | null)?.hass;

/** sun.sun's next rising or setting as a minute of the day, or the fallback (spec 3.3: 7:00 AM and 7:00 PM). */
function minuteOf(text: unknown, fallback: number): number {
  const at = typeof text === 'string' ? new Date(text) : null;
  return at && !Number.isNaN(at.getTime()) ? at.getHours() * 60 + at.getMinutes() : fallback;
}

/**
 * pv-screensaver: the living sky over the whole page (milestone 11, spec 3.3),
 * with the time, the day, and today written over it. The page-wide controller
 * puts it on document.body and takes it away; a touch anywhere wakes the page.
 */
export class PvScreensaver extends LitElement {
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

  static styles = [skyStyles, css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: block;
      overflow: hidden;
      background: #a8cdee;
      color: #0d1b2a;
      font-family: 'Nunito', ui-rounded, 'SF Pro Rounded', system-ui, sans-serif;
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
      background: #a8cdee;
      color: inherit;
      outline: none;
    }
    dialog.saver::backdrop { background: transparent; }
    .scene {
      position: absolute;
      inset: 0;
      overflow: hidden;
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
      text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.55),
        0 2px 0 rgba(13, 27, 42, 0.16),
        0 6px 10px rgba(13, 27, 42, 0.16),
        0 18px 34px rgba(13, 27, 42, 0.14);
      transition: color 4s ease, opacity 4s ease;
    }
    .ampm { font-size: 0.24em; font-weight: 700; letter-spacing: 0.04em; }
    .line {
      margin-top: 1.6vh;
      font-size: clamp(17px, 1.75vw, 34px);
      font-weight: 700;
      color: var(--cream);
      text-shadow: 0 1px 0 rgba(13, 27, 42, 0.18), 0 4px 14px rgba(13, 27, 42, 0.22);
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
    .rings { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5em; margin-top: 0.7em; }
    .ring { display: grid; justify-items: center; gap: 0.3em; }
    .ring svg { width: 3.1em; height: 3.1em; }
    .ring .track { stroke: rgba(13, 27, 42, 0.09); }
    .ring .arc { transition: stroke-dashoffset 1.2s ease; }
    .ring text { font: 800 15px 'Nunito', ui-rounded, system-ui, sans-serif; fill: var(--ink); }
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
    this._scene = new SkyScene(root, { reducedMotion: reduced });
    // The paper's fibers, for the card too.
    const tex = root.style.getPropertyValue('--tex');
    if (tex) this.style.setProperty('--tex', tex);
    this._resize = new ResizeObserver(() => this._scene?.resize());
    this._resize.observe(this);
    this._feed(true);
    this._scene.start();
  }

  private _visibility = (): void => {
    if (document.visibilityState === 'hidden') this._scene?.stop();
    else this._scene?.start();
  };

  private _tick(): void {
    this._now = new Date();
    this._feed(false);
  }

  /** The scene's inputs: re-lit when the minute, the weather, or night changes. */
  private _feed(force: boolean): void {
    const hass = hassNow();
    const now = this._now;
    const minute = now.getHours() * 60 + now.getMinutes();
    const weather = this._weatherState(hass);
    const key = weather ? `${weather.state}|${String(weather.attributes.cloud_coverage ?? '')}` : '';
    const night = screensaver.night(now);
    if (!force && minute === this._lastMinute && key === this._lastWeather && night === this._lastNight) return;
    this._lastMinute = minute;
    this._lastWeather = key;
    this._lastNight = night;
    const sun = hass?.states['sun.sun']?.attributes ?? {};
    this._scene?.update({
      now,
      rise: minuteOf(sun.next_rising, 7 * 60),
      set: minuteOf(sun.next_setting, 19 * 60),
      weather: weatherScene(weather?.state, weather?.attributes.cloud_coverage),
      night,
    });
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
    const info = screensaverInfo({
      now, format, weather: this._weatherState(hass), events: eventsOn(data, dayStart, dayEnd), members, board: this._board,
    });
    const colors = new Map(members.map(m => [m.id, m.color]));
    const night = screensaver.night(now);
    const corner = infoCorner(now.getTime());
    const shortDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return html`
      <dialog class="saver" @cancel=${(e: Event) => e.preventDefault()}>
      <div class="scene" aria-hidden="true"></div>
      ${keyed(corner, html`<div class="info ${night ? 'night' : ''} ${corner.endsWith('right') ? 'mirrored' : ''} ${corner.startsWith('bottom') ? 'lower' : ''}"
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
                      <small>${r.done} of ${r.due}</small>
                    </div>
                  `)}
                </div>
              </div>
            ` : nothing}
          </div>
        ` : nothing}
      </div>`)}
      </dialog>
    `;
  }
}

defineElement('pv-screensaver', PvScreensaver);
