import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { animationStyles, baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { settingsPageStyles } from '../../styles/settings';
import type { HouseholdView } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { PAGE_ERROR, saveErrorMessage } from '../../core/page-host';
import '../../core/color-swatch-picker';
import { resolveTheme } from '../../styles/themes';
import type { PlanaVistaData, ThemeOverrides } from '../../types';

/** Quiet time after the last change before the theme is saved. */
const SAVE_DELAY_MS = 400;

/**
 * pv-theme-picker: the four themes and Customize (Settings, Appearance; and
 * the Look step of setup). Changes preview at once through theme-preview and
 * save after a short quiet moment.
 */
export class PvThemePicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  @state() private _theme: 'light' | 'dark' | 'minimal' | 'vibrant' = 'light';
  @state() private _themeOverrides: ThemeOverrides = {};
  @state() private _customizeOpen = false;
  private _loaded = false;
  private _saveTimer: number | undefined;

  protected willUpdate(): void {
    if (!this._loaded && this.data?.display) {
      const display = this.data.display;
      // The saved key may be the backend's spelling ('planavista', 'modern').
      this._theme = resolveTheme(undefined, display.theme);
      this._themeOverrides = display.theme_overrides ? { ...display.theme_overrides } : {};
      this._customizeOpen = Object.keys(this._themeOverrides).length > 0;
      this._loaded = true;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._saveNow();
  }

  private _queueSave(): void {
    window.clearTimeout(this._saveTimer);
    this._saveTimer = window.setTimeout(() => this._saveNow(), SAVE_DELAY_MS);
  }

  /** Send a waiting save now (also when the page closes before the quiet moment). */
  private _saveNow(): void {
    if (this._saveTimer === undefined) return;
    window.clearTimeout(this._saveTimer);
    this._saveTimer = undefined;
    const overrides = Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : undefined;
    this.api
      .saveConfig({ display: { ...this.data.display, theme: this._theme, theme_overrides: overrides } })
      .catch(err => this._error(err));
  }

  /** Tell the host a save failed (it shows the words in a toast). */
  private _error(err: unknown): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: saveErrorMessage(errorCode(err)) },
      bubbles: true,
      composed: true,
    }));
  }

  private _dispatchThemePreview() {
    this.dispatchEvent(new CustomEvent('theme-preview', {
      detail: {
        theme: this._theme,
        overrides: Object.keys(this._themeOverrides).length > 0 ? this._themeOverrides : null,
      },
      bubbles: true,
      composed: true,
    }));
    this._queueSave();
  }

  private _setOverride(key: keyof ThemeOverrides, value: string | undefined) {
    if (value === undefined || value === '') {
      const { [key]: _, ...rest } = this._themeOverrides;
      this._themeOverrides = rest as ThemeOverrides;
    } else {
      this._themeOverrides = { ...this._themeOverrides, [key]: value };
    }
    this._dispatchThemePreview();
  }

  private _resetOverrides() {
    this._themeOverrides = {};
    this._dispatchThemePreview();
  }

  private _renderCustomize() {
    const ov = this._themeOverrides;
    const hasOverrides = Object.keys(ov).length > 0;

    return html`
      <!-- Customize toggle -->
      <button
        class="customize-toggle"
        type="button"
        @click=${() => { this._customizeOpen = !this._customizeOpen; }}
      >
        <span class="customize-toggle-label">Customize</span>
        <svg class="customize-toggle-chevron ${this._customizeOpen ? 'open' : ''}" viewBox="0 0 24 24" width="18" height="18">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" fill="currentColor"/>
        </svg>
      </button>

      ${this._customizeOpen ? html`
        <div class="customize-section">

          <!-- Accent Color -->
          <div class="customize-group">
            <label class="pv-label">Accent Color</label>
            <pv-color-swatch-picker
              .value=${ov.accent || ''}
              @color-change=${(e: CustomEvent<{ color: string }>) => this._setOverride('accent', e.detail.color)}
            ></pv-color-swatch-picker>
          </div>

          <!-- Background -->
          <div class="customize-group">
            <label class="pv-label">Background</label>
            <div class="bg-options">
              <button class="pill-btn ${!ov.background ? 'pill-btn--active' : ''}" type="button"
                @click=${() => this._setOverride('background', undefined)}>Base Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${ov.background || '#FFFFFF'}
                  @input=${(e: Event) => this._setOverride('background', (e.target as HTMLInputElement).value)}
                />
                ${ov.background ? html`
                  <span class="bg-color-hex">${ov.background}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Header Style -->
          <div class="customize-group">
            <label class="pv-label">Header Style</label>
            <div class="header-style-grid">
              ${([
                { key: 'gradient_purple', label: 'Purple', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                { key: 'gradient_teal', label: 'Teal', gradient: 'linear-gradient(135deg, #0D9488, #2563EB)' },
                { key: 'gradient_sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
                { key: 'solid_accent', label: 'Accent', gradient: ov.accent || '#6366F1' },
                { key: 'solid_dark', label: 'Dark', gradient: '#1A1B1E' },
              ] as Array<{ key: string; label: string; gradient: string }>).map(h => html`
                <button
                  class="header-style-btn ${ov.header_style === h.key ? 'header-style-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('header_style', h.key)}
                >
                  <div class="header-style-preview" style="background: ${h.gradient};"></div>
                  <span class="header-style-label">${h.label}</span>
                </button>
              `)}
              <button
                class="header-style-btn ${ov.header_style === 'custom' ? 'header-style-btn--active' : ''}"
                type="button"
                @click=${() => this._setOverride('header_style', 'custom')}
              >
                <div class="header-style-preview" style="background: ${ov.header_custom || '#333'};"></div>
                <span class="header-style-label">Custom</span>
              </button>
            </div>
            ${ov.header_style === 'custom' ? html`
              <div class="header-custom-row">
                <input type="color" class="bg-color-input"
                  .value=${ov.header_custom || '#333333'}
                  @input=${(e: Event) => {
                    this._themeOverrides = { ...this._themeOverrides, header_custom: (e.target as HTMLInputElement).value };
                    this._dispatchThemePreview();
                  }}
                />
                <span class="bg-color-hex">${ov.header_custom || '#333333'}</span>
              </div>
            ` : ''}
          </div>

          <!-- Corners -->
          <div class="customize-group">
            <label class="pv-label">Corners</label>
            <div class="pill-group">
              ${(['sharp', 'rounded', 'pill'] as const).map(style => html`
                <button
                  class="pill-btn ${(ov.corner_style || 'rounded') === style ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('corner_style', style)}
                >${style.charAt(0).toUpperCase() + style.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Shadows -->
          <div class="customize-group">
            <label class="pv-label">Shadows</label>
            <div class="pill-group">
              ${(['none', 'subtle', 'bold'] as const).map(depth => html`
                <button
                  class="pill-btn ${(ov.shadow_depth || 'subtle') === depth ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('shadow_depth', depth)}
                >${depth.charAt(0).toUpperCase() + depth.slice(1)}</button>
              `)}
            </div>
          </div>

          <!-- Avatar Border -->
          <div class="customize-group">
            <label class="pv-label">Avatar Border</label>
            <div class="pill-group">
              ${(['primary', 'light'] as const).map(mode => html`
                <button
                  class="pill-btn ${(ov.avatar_border || 'primary') === mode ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('avatar_border', mode)}
                >${mode === 'primary' ? 'Primary' : 'Light'}</button>
              `)}
            </div>
            <div class="bg-custom-row" style="margin-top: 0.375rem;">
              <label class="bg-custom-label">Custom:</label>
              <input type="color" class="bg-color-input"
                .value=${(ov.avatar_border && ov.avatar_border !== 'primary' && ov.avatar_border !== 'light') ? ov.avatar_border : '#6366F1'}
                @input=${(e: Event) => this._setOverride('avatar_border', (e.target as HTMLInputElement).value)}
              />
              ${ov.avatar_border && ov.avatar_border !== 'primary' && ov.avatar_border !== 'light' ? html`
                <span class="bg-color-hex">${ov.avatar_border}</span>
              ` : ''}
            </div>
          </div>

          <!-- Now Line Color -->
          <div class="customize-group">
            <label class="pv-label">Now Indicator</label>
            <div class="bg-options">
              <button class="pill-btn ${!ov.now_color ? 'pill-btn--active' : ''}" type="button"
                @click=${() => this._setOverride('now_color', undefined)}>Theme Default</button>
              <div class="bg-custom-row">
                <label class="bg-custom-label">Custom:</label>
                <input type="color" class="bg-color-input"
                  .value=${ov.now_color || '#EF4444'}
                  @input=${(e: Event) => this._setOverride('now_color', (e.target as HTMLInputElement).value)}
                />
                ${ov.now_color ? html`
                  <span class="bg-color-hex">${ov.now_color}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Event Style -->
          <div class="customize-group">
            <label class="pv-label">Event Style</label>
            <div class="pill-group">
              ${(['stripes', 'solid'] as const).map(style => html`
                <button
                  class="pill-btn ${(ov.event_style || 'stripes') === style ? 'pill-btn--active' : ''}"
                  type="button"
                  @click=${() => this._setOverride('event_style', style)}
                >${style === 'stripes' ? 'Stripes' : 'Solid'}</button>
              `)}
            </div>
          </div>

          <!-- Reset -->
          ${hasOverrides ? html`
            <button class="reset-btn" type="button" @click=${this._resetOverrides}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
              </svg>
              Reset to Base Theme
            </button>
          ` : ''}

        </div>
      ` : ''}
    `;
  }

  private _renderTheme() {
    const themes: Array<{
      key: 'light' | 'dark' | 'minimal' | 'vibrant';
      name: string;
      description: string;
      previewBg: string;
      previewAccent: string;
      previewText: string;
    }> = [
      {
        key: 'light',
        name: 'Clean Light',
        description: 'White background, subtle shadows',
        previewBg: '#FFFFFF',
        previewAccent: '#6366F1',
        previewText: '#1A1B1E',
      },
      {
        key: 'dark',
        name: 'Deep Dark',
        description: 'Dark gray background, glowing accents',
        previewBg: '#1E1E2E',
        previewAccent: '#818CF8',
        previewText: '#E5E7EB',
      },
      {
        key: 'minimal',
        name: 'Minimal',
        description: 'Barely-there UI, content first',
        previewBg: '#FAFAF9',
        previewAccent: '#374151',
        previewText: '#374151',
      },
      {
        key: 'vibrant',
        name: 'Vibrant',
        description: 'Rich colors, bold personality',
        previewBg: '#4F46E5',
        previewAccent: '#F59E0B',
        previewText: '#FFFFFF',
      },
    ];

    return html`
      <div class="page-content">
        <div class="theme-grid">
          ${themes.map(t => html`
            <button
              class="theme-card ${this._theme === t.key ? 'theme-card--active' : ''}"
              type="button"
              aria-pressed="${this._theme === t.key}"
              @click=${() => { this._theme = t.key; this._dispatchThemePreview(); }}
            >
              <!-- Mini preview -->
              <div
                class="theme-preview"
                style="background: ${t.previewBg}; border-color: ${t.previewAccent}20;"
              >
                <!-- Header bar -->
                <div class="theme-preview-header" style="background: ${t.previewAccent}15; border-bottom: 1px solid ${t.previewAccent}30;">
                  <div class="theme-preview-dot" style="background: ${t.previewAccent};"></div>
                  <div class="theme-preview-bar" style="background: ${t.previewText}20; width: 40%;"></div>
                  <div class="theme-preview-bar" style="background: ${t.previewText}20; width: 20%;"></div>
                </div>
                <!-- Event pills -->
                <div class="theme-preview-body">
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}; background: ${t.previewAccent}18; color: ${t.previewText};"></div>
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}88; background: ${t.previewAccent}10; color: ${t.previewText}; width: 70%;"></div>
                  <div class="theme-preview-event" style="border-left-color: ${t.previewAccent}55; background: ${t.previewAccent}0C; color: ${t.previewText}; width: 85%;"></div>
                </div>
              </div>

              <!-- Label -->
              <div class="theme-info">
                <span class="theme-name">${t.name}</span>
                <span class="theme-desc">${t.description}</span>
              </div>

              <!-- Selected checkmark -->
              ${this._theme === t.key ? html`
                <div class="theme-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                  </svg>
                </div>
              ` : ''}
            </button>
          `)}
        </div>

        ${this._renderCustomize()}
      </div>
    `;
  }


  render() {
    return this._loaded ? this._renderTheme() : nothing;
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    animationStyles,
    settingsPageStyles,
    css`
/* ── Theme grid (page 2) ────────────────────────────────── */
.theme-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
@media (max-width: 400px) {
.theme-grid {
          grid-template-columns: 1fr;
        }
}
.theme-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        padding: 0;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        text-align: left;
        overflow: hidden;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }
.theme-card:hover {
        border-color: var(--pv-accent, #6366F1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.theme-card--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }
/* Mini preview area */
.theme-preview {
        height: 80px;
        border-radius: 0;
        border-bottom: 1px solid transparent;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
.theme-preview-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        flex-shrink: 0;
      }
.theme-preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
.theme-preview-bar {
        height: 6px;
        border-radius: 3px;
        flex-shrink: 0;
      }
.theme-preview-body {
        flex: 1;
        padding: 6px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
.theme-preview-event {
        height: 12px;
        border-radius: 3px;
        border-left: 3px solid transparent;
        width: 100%;
      }
/* Label area */
.theme-info {
        padding: 0.625rem 0.75rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
.theme-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text, #1A1B1E);
        line-height: 1.3;
      }
.theme-desc {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.4;
      }
/* Checkmark badge */
.theme-check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-accent-text, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
      }
/* ── Customize accordion (page 2) ─────────────────────── */
.customize-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 1.5rem;
        padding: 0.75rem 0;
        border: none;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }
.customize-toggle-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #6B7280);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
.customize-toggle-chevron {
        fill: var(--pv-text-secondary, #6B7280);
        transition: transform var(--pv-transition, 200ms ease);
      }
.customize-toggle-chevron.open {
        transform: rotate(180deg);
      }
.customize-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding-top: 0.5rem;
        animation: pv-fadeIn 200ms ease forwards;
      }
.customize-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
/* Background options */
.bg-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
.bg-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
.bg-custom-label {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
        font-weight: 500;
      }
.bg-color-input {
        width: 36px;
        height: 36px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 8px;
        padding: 2px;
        cursor: pointer;
        background: transparent;
      }
.bg-color-hex {
        font-size: 0.75rem;
        font-family: monospace;
        color: var(--pv-text-muted, #9CA3AF);
      }
/* Header style grid */
.header-style-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
@media (max-width: 400px) {
.header-style-grid {
          grid-template-columns: repeat(2, 1fr);
        }
}
.header-style-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        transition: all var(--pv-transition, 200ms ease);
        -webkit-tap-highlight-color: transparent;
      }
.header-style-btn:hover {
        border-color: var(--pv-accent, #6366F1);
      }
.header-style-btn--active {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
      }
.header-style-preview {
        width: 100%;
        height: 24px;
        border-radius: 4px;
      }
.header-style-label {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--pv-text-secondary, #6B7280);
      }
.header-custom-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
/* Reset button */
.reset-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: 9999px;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: all var(--pv-transition, 200ms ease);
        align-self: flex-start;
        -webkit-tap-highlight-color: transparent;
      }
.reset-btn svg {
        fill: currentColor;
      }
.reset-btn:hover {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent, #6366F1);
      }
@media (max-width: 479px) {
.theme-grid { grid-template-columns: 1fr; }
}
    `,
  ];
}

defineElement('pv-theme-picker', PvThemePicker);
