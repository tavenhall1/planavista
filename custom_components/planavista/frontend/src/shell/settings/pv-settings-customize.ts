import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles, formStyles } from '../../styles/shared';
import { settingsPageStyles } from '../../styles/settings';
import { PAIR_LABELS, lookOf } from '../../core/appearance';
import { ColorKey, contrastIssues } from '../../core/contrast-guard';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { Look, Mode, ThemeShape, themeTokens } from '../../styles/theme-pairs';
import type { PlanaVistaData } from '../../types';
import { AppearancePageController } from './appearance-page-controller';
import '../../core/color-swatch-picker';
import '../pv-notice-sheet';

/** The colors a household can set, with the token that shows each one. */
const ROWS: Array<{ key: ColorKey; label: string; token: string }> = [
  { key: 'accent', label: 'Accent', token: '--pv-accent' },
  { key: 'background', label: 'Background', token: '--pv-bg' },
  { key: 'header', label: 'Header', token: '--pv-header-gradient' },
  { key: 'now_color', label: 'Now line', token: '--pv-now-color' },
];

/** 1.1.0's header styles, plus a plain one in the card's own color. */
const HEADER_CHOICES: Array<{ key: string; label: string }> = [
  { key: 'plain', label: 'Plain' },
  { key: 'gradient_purple', label: 'Purple' },
  { key: 'gradient_teal', label: 'Teal' },
  { key: 'gradient_sunset', label: 'Sunset' },
  { key: 'solid_accent', label: 'Accent' },
  { key: 'solid_dark', label: 'Dark' },
];

const VERSION_LABELS: Record<Mode, string> = { light: 'Light', dark: 'Dark' };

type ShapeKey = 'corner_style' | 'shadow_depth' | 'event_style';
const SHAPE_CHOICES: Array<{ key: ShapeKey; label: string; options: Array<[string, string]> }> = [
  { key: 'corner_style', label: 'Corners', options: [['sharp', 'Sharp'], ['rounded', 'Rounded'], ['pill', 'Pill']] },
  { key: 'shadow_depth', label: 'Shadows', options: [['none', 'None'], ['subtle', 'Subtle'], ['bold', 'Bold']] },
  { key: 'event_style', label: 'Events', options: [['stripes', 'Stripes'], ['solid', 'Solid']] },
];

const CUSTOM_BORDER = '#4D8FD9';

/**
 * pv-settings-customize: a theme's light and dark colors, the shape both
 * versions share, a one-tap fix for any color that would be hard to read,
 * and Reset (spec 12.4). Pushed from Appearance; it applies as you tap.
 */
export class PvSettingsCustomize extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();

  /** The color being edited, under its row; one at a time. */
  @state() private _open: { key: ColorKey; mode: Mode } | null = null;
  @state() private _confirmReset = false;

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
        margin-top: 26px;
      }

      .section-heading {
        margin: 0 0 10px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 700;
        color: var(--pv-text, #1A1B1E);
      }

      .help {
        margin: 10px 0 0;
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

      /* Hard to read */
      .issues:empty {
        display: none;
      }

      .issues {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .issue {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        padding: 10px 12px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-warn-bg, #FDF1DC);
        color: var(--pv-warn-ink, #8A5A00);
      }

      .issue span {
        flex: 1;
        font-weight: 600;
        line-height: 1.4;
      }

      .issue button {
        min-height: 48px;
        flex-shrink: 0;
      }

      /* Colors */
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 6px;
      }

      th {
        font-weight: 650;
        text-align: left;
        color: var(--pv-text, #1A1B1E);
      }

      thead th {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
        padding: 0 4px;
      }

      tbody th {
        width: 28%;
        padding-right: 8px;
      }

      .cell {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 56px;
        padding: 4px;
        border: 1.5px solid transparent;
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        text-align: left;
        cursor: pointer;
      }

      .cell:hover,
      .cell[aria-expanded='true'] {
        border-color: var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
      }

      .cell[aria-expanded='true'] {
        border-color: var(--pv-accent, #5B5BD6);
      }

      .swatch {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        box-sizing: border-box;
        border-radius: var(--pv-radius-sm, 8px);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .caption {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .editor {
        padding: 12px;
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
      }

      .editor .pill-group {
        margin-bottom: 12px;
      }

      /* Shape */
      .shape {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .shape-label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #5F6670);
      }

      .pill-btn {
        min-height: 48px;
      }

      .border-custom {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .border-custom input {
        width: 48px;
        height: 48px;
        padding: 0;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
      }

      .reset {
        min-height: 48px;
      }

      .reset:disabled {
        opacity: 0.45;
        cursor: default;
      }
    `,
  ];

  render() {
    if (!this.data) return nothing;
    const current = this._page.current();
    const look = lookOf(current);
    const issues = contrastIssues(look);
    const theme = PAIR_LABELS[current.theme_pair];
    const hasColors = Object.keys(current.colors_light).length + Object.keys(current.colors_dark).length > 0;
    return html`
      <section>
        <h2 class="section-heading">Colors</h2>
        <div class="issues" aria-live="polite">${issues.map(issue => html`
          <p class="issue">
            <span>⚠ ${issue.message}</span>
            <button class="pv-btn pv-btn-secondary" type="button"
              @click=${(e: Event) => this._setColor(issue.mode, issue.key, issue.fix, e)}>Fix it</button>
          </p>
        `)}</div>
        ${this._renderColors(look)}
        <p class="help">Dark colors follow your light ones until you change them. Matched means PlanaVista picks a dark color that goes with your light one; choose Matched again to go back.</p>
      </section>
      <section>
        <h2 class="section-heading">Shape, for both versions</h2>
        ${this._renderShape(current.shape)}
      </section>
      <section>
        <button class="pv-btn pv-btn-secondary reset" type="button" ?disabled=${!hasColors}
          @click=${() => { this._confirmReset = true; }}>Reset ${theme} to its original colors</button>
      </section>
      ${this._confirmReset ? html`
        <pv-notice-sheet
          .layout=${this.layout}
          heading=${`Reset ${theme} to its original colors?`}
          body="Your light and dark colors go back to the theme's own. Corners, shadows, and the other shape settings stay."
          .actions=${[
            { id: 'cancel', label: 'Cancel', kind: 'secondary' },
            { id: 'reset', label: 'Reset', kind: 'destructive' },
          ]}
          @pv-sheet-action=${this._onResetChoice}
        ></pv-notice-sheet>
      ` : nothing}
    `;
  }

  private _renderColors(look: Look) {
    const tokens: Record<Mode, Record<string, string>> = { light: themeTokens(look, 'light'), dark: themeTokens(look, 'dark') };
    return html`
      <table>
        <thead>
          <tr><td></td><th scope="col">Light</th><th scope="col">Dark</th></tr>
        </thead>
        <tbody>
          ${ROWS.map(row => html`
            <tr>
              <th scope="row">${row.label}</th>
              ${(['light', 'dark'] as Mode[]).map(mode => {
                const open = this._open?.key === row.key && this._open.mode === mode;
                const caption = this._caption(look, mode, row.key);
                return html`
                  <td>
                    <button class="cell" type="button" aria-expanded=${open ? 'true' : 'false'}
                      aria-label=${`${row.label}, ${VERSION_LABELS[mode]}: ${caption}`}
                      @click=${() => { this._open = open ? null : { key: row.key, mode }; }}>
                      <span class="swatch" style="background: ${tokens[mode][row.token]}"></span>
                      <span class="caption">${caption}</span>
                    </button>
                  </td>
                `;
              })}
            </tr>
            ${this._open?.key === row.key ? html`
              <tr>
                <td colspan="3">${this._renderEditor(look, this._open.mode, row.key)}</td>
              </tr>
            ` : nothing}
          `)}
        </tbody>
      </table>
    `;
  }

  /** "Original" for a light color left as the theme's, "Matched" for a dark one following the light one. */
  private _caption(look: Look, mode: Mode, key: ColorKey): string {
    const own = look[mode][key];
    if (own === undefined) return mode === 'dark' && look.light[key] !== undefined ? 'Matched' : 'Original';
    if (key === 'header') {
      const preset = HEADER_CHOICES.find(choice => choice.key === own);
      if (preset) return preset.label;
    }
    return own.toUpperCase();
  }

  private _renderEditor(look: Look, mode: Mode, key: ColorKey) {
    const own = look[mode][key];
    const unset = mode === 'light' ? 'Original' : 'Matched';
    const hex = own && own.startsWith('#') ? own : '';
    return html`
      <div class="editor" aria-label=${`${ROWS.find(r => r.key === key)?.label} for ${VERSION_LABELS[mode]}`} role="group">
        <div class="pill-group">
          <button class="pill-btn ${own === undefined ? 'pill-btn--active' : ''}" type="button"
            aria-pressed=${own === undefined ? 'true' : 'false'}
            @click=${(e: Event) => this._setColor(mode, key, undefined, e)}>${unset}</button>
          ${key === 'header' ? HEADER_CHOICES.map(choice => html`
            <button class="pill-btn ${own === choice.key ? 'pill-btn--active' : ''}" type="button"
              aria-pressed=${own === choice.key ? 'true' : 'false'}
              @click=${(e: Event) => this._setColor(mode, key, choice.key, e)}>${choice.label}</button>
          `) : nothing}
        </div>
        <pv-color-swatch-picker
          .value=${hex}
          @color-change=${(e: CustomEvent<{ color: string }>) => {
            e.stopPropagation();
            this._setColor(mode, key, e.detail.color, e);
          }}
        ></pv-color-swatch-picker>
      </div>
    `;
  }

  private _renderShape(shape: ThemeShape) {
    const border = shape.avatar_border ?? 'primary';
    const custom = border !== 'primary' && border !== 'white' && border !== 'light';
    return html`
      <div class="shape">
        ${SHAPE_CHOICES.map(group => {
          // Events start as Stripes; corners and shadows start as the theme's own, which may be none of these.
          const chosen = shape[group.key] ?? (group.key === 'event_style' ? 'stripes' : undefined);
          return html`
            <div role="group" aria-label=${group.label}>
              <span class="shape-label">${group.label}</span>
              <div class="pill-group">
                ${group.options.map(([value, label]) => html`
                  <button class="pill-btn ${chosen === value ? 'pill-btn--active' : ''}" type="button"
                    aria-pressed=${chosen === value ? 'true' : 'false'}
                    @click=${(e: Event) => this._setShape({ [group.key]: value } as Partial<ThemeShape>, e)}>${label}</button>
                `)}
              </div>
            </div>
          `;
        })}
        <div role="group" aria-label="Avatar border">
          <span class="shape-label">Avatar border</span>
          <div class="pill-group">
            <button class="pill-btn ${border === 'primary' ? 'pill-btn--active' : ''}" type="button"
              aria-pressed=${border === 'primary' ? 'true' : 'false'}
              @click=${(e: Event) => this._setShape({ avatar_border: 'primary' }, e)}>Their color</button>
            <button class="pill-btn ${border === 'white' || border === 'light' ? 'pill-btn--active' : ''}" type="button"
              aria-pressed=${border === 'white' || border === 'light' ? 'true' : 'false'}
              @click=${(e: Event) => this._setShape({ avatar_border: 'white' }, e)}>White</button>
            <button class="pill-btn ${custom ? 'pill-btn--active' : ''}" type="button"
              aria-pressed=${custom ? 'true' : 'false'}
              @click=${(e: Event) => this._setShape({ avatar_border: custom ? border : CUSTOM_BORDER }, e)}>Custom</button>
          </div>
          ${custom ? html`
            <label class="border-custom">
              <input type="color" .value=${border}
                @input=${(e: Event) => this._setShape({ avatar_border: (e.target as HTMLInputElement).value }, e)}>
              <span>${border.toUpperCase()}</span>
            </label>
          ` : nothing}
        </div>
      </div>
    `;
  }

  /** Set or remove one version's color; colors always save as the whole object. */
  private _setColor(mode: Mode, key: ColorKey, value: string | undefined, event?: Event): void {
    const current = this._page.current();
    const colors = { ...(mode === 'light' ? current.colors_light : current.colors_dark) };
    if (value === undefined) delete colors[key];
    else colors[key] = value;
    this._page.set(mode === 'light' ? { colors_light: colors } : { colors_dark: colors }, event);
  }

  private _setShape(changes: Partial<ThemeShape>, event?: Event): void {
    this._page.set({ shape: { ...this._page.current().shape, ...changes } }, event);
  }

  private _onResetChoice = (event: CustomEvent<{ id: string }>): void => {
    event.stopPropagation();
    this._confirmReset = false;
    if (event.detail.id === 'reset') {
      this._open = null;
      this._page.set({ colors_light: {}, colors_dark: {} });
    }
  };
}

defineElement('pv-settings-customize', PvSettingsCustomize);
