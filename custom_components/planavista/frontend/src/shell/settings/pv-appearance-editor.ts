import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles, formStyles } from '../../styles/shared';
import { settingsPageStyles } from '../../styles/settings';
import {
  AppearanceMode,
  AppearanceSwitch,
  MODES,
  MODE_LABELS,
  MOTIONS,
  MOTION_LABELS,
  MotionSetting,
  PAIRS,
  PAIR_LABELS,
  SWITCHES,
  SWITCH_LABELS,
  lookOf,
  sunSummary,
} from '../../core/appearance';
import { sunOf } from '../../core/appearance-deps';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { PUSH_PAGE, PushPageDetail } from '../../core/page-host';
import { Look, Mode, ThemePair, Tokens, personColors, themeTokens } from '../../styles/theme-pairs';
import type { PlanaVistaData } from '../../types';
import { AppearancePageController } from './appearance-page-controller';
import './pv-settings-customize';

/** Three people's colors for the little pictures of the card. */
const SAMPLE_PEOPLE = ['#4D8FD9', '#F3722C', '#43AA8B'];

const SWITCH_HELP: Record<AppearanceSwitch, string> = {
  sun: '',
  schedule: '',
  home_assistant: 'Each screen follows its own Home Assistant theme setting. Handy for phones.',
};

/** A small picture of the card in one version: a header, the bar, and three people's columns. */
function picture(tokens: Tokens, mode: Mode) {
  const style = [
    `--p-page: ${tokens['--pv-bg']}`,
    `--p-card: ${tokens['--pv-card-bg']}`,
    `--p-header: ${tokens['--pv-header-gradient']}`,
    `--p-accent: ${tokens['--pv-accent']}`,
    `--p-line: ${tokens['--pv-border']}`,
  ].join('; ');
  return html`
    <span class="pic" style=${style}>
      <span class="pic-header"></span>
      <span class="pic-bar"><span class="pic-tab"></span></span>
      <span class="pic-cols">
        ${SAMPLE_PEOPLE.map(color => html`<span class="pic-col" style="--p-person: ${personColors(color, undefined, mode).color}"></span>`)}
      </span>
    </span>
  `;
}

/**
 * pv-appearance-editor: Light, Dark, or Automatic, when Automatic switches,
 * the theme, Customize, and Motion (spec 12.4 and 14.5). It applies as you
 * tap (spec 14.1). Setup's Look step uses it without Customize and Motion
 * (spec 14.7).
 */
export class PvAppearanceEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();

  private _page = new AppearancePageController(this);

  static styles = [
    buttonStyles,
    formStyles,
    settingsPageStyles,
    css`
      :host {
        display: block;
      }

      section + section {
        margin-top: 28px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--pv-text, #1A1B1E);
      }

      .help {
        margin: 8px 0 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: var(--pv-text-secondary, #5F6670);
      }

      button {
        font: inherit;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
      }

      button:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
        outline-offset: 2px;
      }

      /* The little pictures of the card. */
      .pic {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 112px;
        height: 76px;
        border-radius: 10px;
        overflow: hidden;
        background: var(--p-page);
        border: 1px solid var(--p-line);
      }

      .pic-header {
        height: 14px;
        flex-shrink: 0;
        background: var(--p-header);
        border-bottom: 1px solid var(--p-line);
      }

      .pic-bar {
        display: flex;
        align-items: center;
        height: 10px;
        flex-shrink: 0;
        padding: 0 6px;
        background: var(--p-card);
      }

      .pic-tab {
        width: 18px;
        height: 5px;
        border-radius: 3px;
        background: var(--p-accent);
      }

      .pic-cols {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
        padding: 5px 6px 6px;
      }

      .pic-col {
        border-radius: 3px;
        background: var(--p-card);
        border-top: 3px solid var(--p-person);
      }

      .pic-pair {
        position: relative;
        display: block;
        width: fit-content;
        border-radius: 10px;
      }

      .pic-pair .pic-over {
        position: absolute;
        inset: 0;
      }

      /* Automatic: day and night split corner to corner. */
      .pic-pair.split .pic-over {
        clip-path: polygon(100% 0, 100% 100%, 0 100%);
      }

      /* A theme: its light half at the left, its dark half at the right. */
      .pic-pair.halves .pic-over {
        clip-path: inset(0 0 0 50%);
      }

      /* Light, Dark, Automatic */
      .modes {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }

      .mode-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 6px;
        border: none;
        border-radius: 14px;
        background: transparent;
        cursor: pointer;
      }

      .frame {
        position: relative;
        display: block;
        border-radius: 12px;
        padding: 3px;
        box-shadow: 0 0 0 1.5px transparent;
        transition: box-shadow 150ms ease;
      }

      [aria-checked='true'] > .frame {
        box-shadow: 0 0 0 2.5px var(--pv-accent, #5B5BD6);
      }

      .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        display: none;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--pv-accent, #5B5BD6);
        color: var(--pv-accent-text, #FFFFFF);
        font-size: 0.75rem;
        font-weight: 800;
        box-shadow: 0 0 0 2px var(--pv-card-bg, #FFFFFF);
      }

      [aria-checked='true'] .badge {
        display: inline-flex;
      }

      .option-label {
        font-size: 0.9375rem;
        font-weight: 650;
        color: var(--pv-text, #1A1B1E);
      }

      /* When to switch */
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 12px 14px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        text-align: left;
        cursor: pointer;
      }

      .row[aria-checked='true'] {
        border-color: var(--pv-accent, #5B5BD6);
      }

      .dot {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 1px;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid var(--pv-text-secondary, #5F6670);
      }

      .row[aria-checked='true'] .dot {
        border: 6px solid var(--pv-accent, #5B5BD6);
      }

      .row-text {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .row-title {
        font-weight: 650;
        color: var(--pv-text, #1A1B1E);
      }

      .row-help {
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--pv-text-secondary, #5F6670);
      }

      .times {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        margin: 4px 0 0 46px;
      }

      .times label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #5F6670);
      }

      .times input {
        min-height: 48px;
        min-width: 140px;
        box-sizing: border-box;
      }

      /* Themes */
      .themes {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      :host(:not([layout='landscape'])) .themes {
        grid-template-columns: 1fr;
      }

      .theme {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 12px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        cursor: pointer;
      }

      :host(:not([layout='landscape'])) .theme {
        flex-direction: row;
        justify-content: flex-start;
        gap: 16px;
      }

      .theme[aria-checked='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        box-shadow: 0 0 0 1.5px var(--pv-accent, #5B5BD6);
      }

      .theme .pic-pair,
      .theme .pic {
        width: 100%;
        max-width: 168px;
      }

      :host(:not([layout='landscape'])) .theme .pic-pair,
      :host(:not([layout='landscape'])) .theme .pic {
        width: 152px;
      }

      .theme .badge {
        top: 8px;
        right: 8px;
      }

      /* Customize */
      .link-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 56px;
        padding: 12px 14px;
        border: 1.5px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        text-align: left;
        cursor: pointer;
      }

      .link-row .row-text {
        flex: 1;
      }

      .chevron {
        font-size: 1.375rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      /* Motion */
      .seg {
        display: inline-flex;
        flex-wrap: wrap;
        padding: 3px;
        border-radius: 12px;
        background: var(--pv-seg, #ECECE8);
      }

      .seg-btn {
        min-height: 48px;
        padding: 0 16px;
        border: none;
        border-radius: 9px;
        background: transparent;
        font-weight: 650;
        color: var(--pv-text-secondary, #5F6670);
        cursor: pointer;
      }

      .seg-btn[aria-checked='true'] {
        background: var(--pv-seg-on, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      }
    `,
  ];

  render() {
    if (!this.data) return nothing;
    const current = this._page.current();
    const look = lookOf(current);
    return html`
      <section>
        ${this._renderModes(look, current.appearance)}
      </section>
      ${current.appearance === 'automatic' ? html`
        <section>
          ${this._heading('When to switch', 'switch-heading')}
          ${this._renderSwitch(current.appearance_switch, current.light_from, current.dark_from)}
        </section>
      ` : nothing}
      <section>
        ${this._heading('Theme', 'theme-heading')}
        ${this._renderThemes(look)}
        <p class="help">Every theme has a light and a dark version. Automatic moves between them.</p>
      </section>
      ${this.mode === 'settings' ? html`
        <section>
          <button class="link-row" type="button" @click=${() => this._customize(current.theme_pair)}>
            <span class="row-text">
              <span class="row-title">Customize ${PAIR_LABELS[current.theme_pair]}</span>
              <span class="row-help">Light and dark colors, corners, shadows</span>
            </span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        </section>
        <section>
          ${this._heading('Motion', 'motion-heading')}
          ${this._renderMotion(current.motion)}
          <p class="help">Reduced swaps movement for quick fades. Follow the device uses this screen's own setting.</p>
        </section>
      ` : nothing}
    `;
  }

  private _heading(text: string, id: string) {
    return html`<h2 class="section-heading" id=${id}>${text}</h2>`;
  }

  private _renderModes(look: Look, chosen: AppearanceMode) {
    const light = themeTokens(look, 'light');
    const dark = themeTokens(look, 'dark');
    return html`
      <div class="modes" role="radiogroup" aria-label="Appearance"
        @keydown=${(e: KeyboardEvent) => this._arrows(e, MODES, chosen, value => this._page.set({ appearance: value }, e))}>
        ${MODES.map(mode => html`
          <button class="mode-option" type="button" role="radio" data-value=${mode}
            aria-checked=${mode === chosen ? 'true' : 'false'}
            tabindex=${mode === chosen ? '0' : '-1'}
            @click=${(e: Event) => this._page.set({ appearance: mode }, e)}>
            <span class="frame">
              ${mode === 'automatic'
                ? html`<span class="pic-pair split">${picture(light, 'light')}<span class="pic-over">${picture(dark, 'dark')}</span></span>`
                : picture(mode === 'dark' ? dark : light, mode === 'dark' ? 'dark' : 'light')}
              <span class="badge" aria-hidden="true">✓</span>
            </span>
            <span class="option-label">${MODE_LABELS[mode]}</span>
          </button>
        `)}
      </div>
    `;
  }

  private _renderSwitch(chosen: AppearanceSwitch, lightFrom: string, darkFrom: string) {
    const sun = sunOf(this.hass?.states as never);
    const format = this.data.display?.time_format === '24h' ? '24h' : '12h';
    const sunLine = sun
      ? sunSummary(sun, new Date(), format) ?? "Uses your home's location in Home Assistant."
      : "Home Assistant's Sun integration isn't set up, so the schedule's times are used until it is.";
    const help: Record<AppearanceSwitch, string> = { ...SWITCH_HELP, sun: sunLine };
    return html`
      <div class="rows" role="radiogroup" aria-labelledby="switch-heading"
        @keydown=${(e: KeyboardEvent) => this._arrows(e, SWITCHES, chosen, value => this._page.set({ appearance_switch: value }, e))}>
        ${SWITCHES.map(rule => html`
          <button class="row" type="button" role="radio" data-value=${rule}
            aria-checked=${rule === chosen ? 'true' : 'false'}
            tabindex=${rule === chosen ? '0' : '-1'}
            @click=${(e: Event) => this._page.set({ appearance_switch: rule }, e)}>
            <span class="dot" aria-hidden="true"></span>
            <span class="row-text">
              <span class="row-title">${SWITCH_LABELS[rule]}</span>
              ${help[rule] ? html`<span class="row-help">${help[rule]}</span>` : nothing}
            </span>
          </button>
          ${rule === 'schedule' && chosen === 'schedule' ? html`
            <div class="times">
              <label>Light from
                <input class="pv-input" type="time" .value=${lightFrom}
                  @change=${(e: Event) => this._time('light_from', e)}>
              </label>
              <label>Dark from
                <input class="pv-input" type="time" .value=${darkFrom}
                  @change=${(e: Event) => this._time('dark_from', e)}>
              </label>
            </div>
          ` : nothing}
        `)}
      </div>
    `;
  }

  private _renderThemes(look: Look) {
    return html`
      <div class="themes" role="radiogroup" aria-labelledby="theme-heading"
        @keydown=${(e: KeyboardEvent) => this._arrows(e, PAIRS, look.pair, value => this._page.set({ theme_pair: value }, e))}>
        ${PAIRS.map(pair => {
          const candidate: Look = { ...look, pair };
          return html`
            <button class="theme" type="button" role="radio" data-value=${pair}
              aria-checked=${pair === look.pair ? 'true' : 'false'}
              tabindex=${pair === look.pair ? '0' : '-1'}
              @click=${(e: Event) => this._page.set({ theme_pair: pair }, e)}>
              <span class="pic-pair halves">
                ${picture(themeTokens(candidate, 'light'), 'light')}
                <span class="pic-over">${picture(themeTokens(candidate, 'dark'), 'dark')}</span>
              </span>
              <span class="option-label">${PAIR_LABELS[pair]}</span>
              <span class="badge" aria-hidden="true">✓</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _renderMotion(chosen: MotionSetting) {
    return html`
      <div class="seg" role="radiogroup" aria-labelledby="motion-heading"
        @keydown=${(e: KeyboardEvent) => this._arrows(e, MOTIONS, chosen, value => this._page.set({ motion: value }, e))}>
        ${MOTIONS.map(motion => html`
          <button class="seg-btn" type="button" role="radio" data-value=${motion}
            aria-checked=${motion === chosen ? 'true' : 'false'}
            tabindex=${motion === chosen ? '0' : '-1'}
            @click=${(e: Event) => this._page.set({ motion }, e)}>${MOTION_LABELS[motion]}</button>
        `)}
      </div>
    `;
  }

  /** Arrow keys move a radio group's choice, and the focus with it. */
  private _arrows<T extends string>(event: KeyboardEvent, values: readonly T[], chosen: T, choose: (value: T) => void): void {
    // Only the radios themselves: arrows in the schedule's time fields move the time.
    if ((event.target as HTMLElement).getAttribute?.('role') !== 'radio') return;
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.max(0, values.indexOf(chosen));
    const next = values[(index + step + values.length) % values.length];
    choose(next);
    const group = event.currentTarget as HTMLElement;
    void this.updateComplete.then(() => group.querySelector<HTMLElement>(`[data-value='${next}']`)?.focus());
  }

  private _time(key: 'light_from' | 'dark_from', event: Event): void {
    const value = (event.target as HTMLInputElement).value.slice(0, 5);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return;
    this._page.set(key === 'light_from' ? { light_from: value } : { dark_from: value }, event);
  }

  private _customize(pair: ThemePair): void {
    const detail: PushPageDetail = { tag: 'pv-settings-customize', title: `Customize ${PAIR_LABELS[pair]}`, back: 'Appearance' };
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-appearance-editor', PvAppearanceEditor);
