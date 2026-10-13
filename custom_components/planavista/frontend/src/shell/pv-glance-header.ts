import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { formatClockParts } from '../utils/date-utils';
import { weatherIcon } from '../utils/weather-icons';
import type { Layout } from '../core/layout';
import type { GlanceChip } from '../core/module-registry';
import type { WeatherCondition } from '../types';
import '../core/pv-ring';

/** The part of a weather entity's state the header shows. */
export interface HeaderWeather {
  state: string;
  attributes?: { temperature?: number | string };
}

/**
 * pv-glance-header: the clock, the date, and the weather, laid out for the
 * card's own size (spec 12.2): one row in landscape, a lock-screen clock in
 * portrait, a compact row on a phone. Modules add glance chips ("9 of 17
 * chores done today"): the main one beside the weather in landscape, all of
 * them under the clock in portrait, the main one on a phone.
 *
 * @fires hass-more-info - { entityId } when the weather is tapped
 * @fires pv-open - the chip's target (a module and view) when a chip is tapped
 */
export class PvGlanceHeader extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** A short card (under 500 px tall): no line of chips under a landscape header (round 2). */
  @property({ type: Boolean, reflect: true }) short = false;
  /** Portrait with the content scrolled down: the header shrinks to one line (spec 12.2). */
  @property({ type: Boolean }) compact = false;
  /** The shape drawn: the layout, or the phone's one row for a compact portrait header. Styles key off it. */
  @property({ type: String, reflect: true }) shape: Layout = 'landscape';
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  /** The weather entity's state, or null for no weather (none set, or hide_weather). */
  @property({ attribute: false }) weather: HeaderWeather | null = null;
  @property({ attribute: false }) weatherEntity = '';
  /** Today's high and low from the card's forecast. */
  @property({ attribute: false }) today: { high: number; low: number | null } | null = null;
  /** The modules' glance chips. */
  @property({ attribute: false }) chips: GlanceChip[] = [];

  /** Minutes since the epoch; changing it is what re-renders the clock. */
  @state() private _minute = Math.floor(Date.now() / 60000);
  private _timer: ReturnType<typeof setInterval> | null = null;

  static styles = css`
    :host {
      display: block;
      background: var(--pv-header-gradient, var(--pv-card-bg, #FFFFFF));
      color: var(--pv-header-text, var(--pv-text, #1A1B1E));
      border-bottom: 1px solid color-mix(in srgb, var(--pv-header-text, #1A1B1E) 10%, transparent);
      font-family: var(--pv-font-family, system-ui, sans-serif);
    }

    .time,
    .date,
    .temp {
      font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .muted {
      color: var(--pv-header-muted, currentColor);
    }

    /* Landscape: weather, date, and time in one row. */
    .row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
    }

    .date {
      font-weight: 800;
      font-size: clamp(18px, 1.6cqi, 26px);
      letter-spacing: 0.2px;
    }

    .time {
      justify-self: end;
      font-weight: 600;
      font-size: clamp(24px, 2.2cqi, 40px);
      line-height: 1.1;
    }

    .ampm {
      font-size: 0.55em;
      font-weight: 700;
      margin-left: 3px;
    }

    .weather {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 0 8px;
      margin-left: -8px;
      border: none;
      border-radius: var(--pv-radius-sm, 8px);
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .weather:focus-visible {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: 2px;
    }

    .weather-text {
      display: flex;
      flex-direction: column;
    }

    .temp {
      font-weight: 700;
      font-size: clamp(18px, 1.6cqi, 26px);
      line-height: 1.1;
    }

    .condition {
      font-size: 13px;
      text-transform: capitalize;
    }

    .highlow {
      font-size: 12px;
      margin-top: 3px;
      white-space: nowrap;
    }

    /* Portrait: a lock-screen clock at the left, the weather at the right. */
    :host([shape='portrait']) .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 20px 12px;
    }

    :host([shape='portrait']) .time {
      font-weight: 700;
      font-size: clamp(40px, 6cqi, 60px);
      line-height: 1;
      letter-spacing: -0.5px;
    }

    :host([shape='portrait']) .ampm {
      font-size: 0.4em;
      letter-spacing: 0;
    }

    :host([shape='portrait']) .date {
      font-size: clamp(16px, 2.2cqi, 22px);
      margin-top: 6px;
    }

    :host([shape='portrait']) .temp {
      font-weight: 800;
      font-size: clamp(24px, 3.5cqi, 34px);
      line-height: 1;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .left {
      justify-self: start;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    :host([shape='portrait']) .chips {
      padding: 0 20px 14px;
    }

    :host([shape='phone']) .chips {
      padding: 0 14px 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      min-height: 48px;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .chip span.pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 32px;
      padding: 0 12px 0 8px;
      border-radius: 99px;
      background: color-mix(in srgb, var(--pv-header-text, #1A1B1E) 7%, transparent);
      font-size: 0.8125rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .chip span.pill.plain {
      padding-left: 12px;
    }

    .chip {
      max-width: 100%;
      min-width: 0;
    }

    .chip span.pill {
      max-width: 100%;
      box-sizing: border-box;
    }

    /* A chip too long for its line ends in an ellipsis instead of off the card (round 1). */
    .chip span.pill .text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* A landscape header too narrow for chips beside the weather puts them on their own line (round 1). */
    .below {
      display: none;
    }

    :host([shape='landscape']) .below .chips {
      padding: 0 20px 10px;
    }

    @container (max-width: 760px) {
      :host([shape='landscape']) .inline {
        display: none;
      }

      :host([shape='landscape']:not([short])) .below {
        display: block;
      }
    }

    .chip:focus-visible {
      outline: none;
    }

    .chip:focus-visible span.pill {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: 2px;
    }

    /* Phone: one compact row. */
    :host([shape='phone']) .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
    }

    :host([shape='phone']) .clock {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    :host([shape='phone']) .time {
      font-weight: 700;
      font-size: 22px;
    }

    :host([shape='phone']) .date {
      font-weight: 700;
      font-size: 14px;
    }

    :host([shape='phone']) .temp {
      font-size: 18px;
    }
  `;

  protected willUpdate(): void {
    this.shape = this.layout === 'portrait' && this.compact ? 'phone' : this.layout;
  }

  protected updated(changed: PropertyValues): void {
    // The new shape fades in, so the step to one line (and back) isn't a jump cut.
    if (changed.has('shape') && changed.get('shape') !== undefined) {
      this.renderRoot.querySelector('.row')?.animate({ opacity: [0, 1] }, { duration: 150, easing: 'ease-out' });
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._minute = Math.floor(Date.now() / 60000);
    this._timer = setInterval(() => {
      const minute = Math.floor(Date.now() / 60000);
      if (minute !== this._minute) this._minute = minute;
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  render() {
    const now = new Date();
    const { time, ampm, date } = formatClockParts(now, this.timeFormat);
    const clock = html`<span class="time">${time}${ampm ? html`<span class="ampm muted">${ampm}</span>` : nothing}</span>`;
    const primary = this.chips.filter(chip => chip.primary);
    if (this.shape === 'portrait') {
      return html`
        <div class="row">
          <div class="clock">${clock}<div class="date">${date}</div></div>
          ${this._weather(40, 'highlow')}
        </div>
        ${this._chips(this.chips)}
      `;
    }
    if (this.shape === 'phone') {
      const short = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return html`
        <div class="row">
          <div class="clock">${clock}<span class="date muted">${short}</span></div>
          ${this._weather(24, 'none')}
        </div>
        ${this._chips(primary)}
      `;
    }
    return html`
      <div class="row">
        <div class="left">${this._weather(32, 'condition')}<div class="inline">${this._chips(primary)}</div></div>
        <div class="date">${date}</div>
        ${clock}
      </div>
      <div class="below">${this._chips(primary)}</div>
    `;
  }

  private _chips(chips: GlanceChip[]) {
    if (chips.length === 0) return nothing;
    return html`
      <div class="chips">
        ${chips.map(chip => html`
          <button type="button" class="chip" @click=${() => this._openChip(chip)}>
            <span class="pill ${chip.progress === undefined ? 'plain' : ''}">
              ${chip.progress !== undefined ? html`
                <pv-ring size="18" .progress=${chip.progress} color="var(--pv-accent, #5B5BD6)" ?closed=${chip.progress >= 1}></pv-ring>
              ` : nothing}
              <span class="text">${chip.text}</span>
            </span>
          </button>
        `)}
      </div>
    `;
  }

  private _openChip(chip: GlanceChip): void {
    if (!chip.open) return;
    this.dispatchEvent(new CustomEvent('pv-open', { detail: chip.open, bubbles: true, composed: true }));
  }

  private _weather(size: number, detail: 'condition' | 'highlow' | 'none') {
    const weather = this.weather;
    if (!weather) return html`<span></span>`;
    const temperature = Math.round(Number(weather.attributes?.temperature ?? 0));
    const today = this.today;
    return html`
      <button class="weather" type="button" aria-label="Weather details" @click=${this._details}>
        ${weatherIcon((weather.state || 'cloudy') as WeatherCondition, size)}
        <span class="weather-text">
          <span class="temp">${temperature}°</span>
          ${detail === 'condition' ? html`<span class="condition muted">${(weather.state || '').replace(/-/g, ' ')}</span>` : nothing}
          ${detail === 'highlow' && today
            ? html`<span class="highlow muted">High ${today.high}°${today.low !== null ? ` · Low ${today.low}°` : ''}</span>`
            : nothing}
        </span>
      </button>
    `;
  }

  private _details(): void {
    if (!this.weatherEntity) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId: this.weatherEntity },
      bubbles: true,
      composed: true,
    }));
  }
}

defineElement('pv-glance-header', PvGlanceHeader);
