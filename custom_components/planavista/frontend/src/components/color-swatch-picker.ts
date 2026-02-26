import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { baseStyles } from '../styles/shared';

/**
 * Computes the light variant of a hex color by blending toward white at 88%.
 * Formula: channel = channel + (255 - channel) * 0.88
 */
function computeLightVariant(hex: string): string {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex;

  const rLight = Math.round(r + (255 - r) * 0.65);
  const gLight = Math.round(g + (255 - g) * 0.65);
  const bLight = Math.round(b + (255 - b) * 0.65);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rLight)}${toHex(gLight)}${toHex(bLight)}`;
}

interface Preset {
  name: string;
  color: string;
  light: string;
}

/**
 * pv-color-swatch-picker
 *
 * A reusable color picker showing a 5×2 grid of preset swatches plus a
 * "Custom..." button that opens a native color input. Dispatches a
 * 'color-change' CustomEvent with { color, colorLight } on selection.
 *
 * @fires color-change - { color: string, colorLight: string }
 */
@customElement('pv-color-swatch-picker')
export class PvColorSwatchPicker extends LitElement {
  static readonly PRESETS: Preset[] = [
    // Palette 1: Earth & Ocean tones
    { name: 'Ink Black',        color: '#001219', light: '#A6ACAF' },
    { name: 'Dark Teal',        color: '#005F73', light: '#A6C7CE' },
    { name: 'Dark Cyan',        color: '#0A9396', light: '#A9D9DA' },
    { name: 'Pearl Aqua',       color: '#94D2BD', light: '#DAEFE8' },
    { name: 'Wheat',            color: '#E9D8A6', light: '#F7F1E0' },
    { name: 'Golden Orange',    color: '#EE9B00', light: '#F9DCA6' },
    { name: 'Burnt Caramel',    color: '#CA6702', light: '#ECCAA6' },
    { name: 'Rusty Spice',      color: '#BB3E03', light: '#E7BBA7' },
    { name: 'Oxidized Iron',    color: '#AE2012', light: '#E3B1AC' },
    { name: 'Brown Red',        color: '#9B2226', light: '#DCB2B3' },
    // Palette 2: Warm & Vivid tones
    { name: 'Strawberry Red',   color: '#F94144', light: '#FDBDBE' },
    { name: 'Pumpkin Spice',    color: '#F3722C', light: '#FBCEB5' },
    { name: 'Carrot Orange',    color: '#F8961E', light: '#FDDAB0' },
    { name: 'Atomic Tangerine', color: '#F9844A', light: '#FDD4C0' },
    { name: 'Tuscan Sun',       color: '#F9C74F', light: '#FDEBC1' },
    { name: 'Willow Green',     color: '#90BE6D', light: '#D8E8CC' },
    { name: 'Seaweed',          color: '#43AA8B', light: '#BDE1D6' },
    { name: 'Ocean Cyan',       color: '#4D908E', light: '#C1D8D7' },
    { name: 'Blue Slate',       color: '#577590', light: '#C4CFD8' },
    { name: 'Cerulean',         color: '#277DA1', light: '#B3D2DE' },
  ];

  /** The currently selected primary color hex (e.g. "#4A90D9"). */
  @property({ type: String }) value = '';

  /** The currently selected light variant hex. */
  @property({ type: String }) valueLight = '';

  /** Whether a custom color is active (not one of the presets). */
  @state() private _isCustom = false;

  @query('#custom-color-input')
  private _colorInput!: HTMLInputElement;

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('value') && this.value) {
      const isPreset = PvColorSwatchPicker.PRESETS.some(
        (p) => p.color.toLowerCase() === this.value.toLowerCase()
      );
      this._isCustom = !isPreset;
    }
  }

  private _selectPreset(preset: Preset) {
    this._isCustom = false;
    this._emit(preset.color, preset.light);
  }

  private _openCustomPicker() {
    this._colorInput?.click();
  }

  private _onCustomColorChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const color = input.value;
    const colorLight = computeLightVariant(color);
    this._isCustom = true;
    this._emit(color, colorLight);
  }

  private _emit(color: string, colorLight: string) {
    this.value = color;
    this.valueLight = colorLight;
    this.dispatchEvent(
      new CustomEvent('color-change', {
        detail: { color, colorLight },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _isSelected(color: string): boolean {
    return this.value.toLowerCase() === color.toLowerCase();
  }

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(5, 44px);
        gap: 4px;
      }

      /* Each cell is a 44×44 touch target */
      .swatch-btn {
        width: 44px;
        height: 44px;
        padding: 6px;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--pv-transition, 200ms ease);
        box-sizing: border-box;
      }

      .swatch-btn:hover {
        transform: scale(1.1);
      }

      .swatch-btn:focus-visible {
        outline: 2px solid var(--pv-accent, #6366F1);
        outline-offset: 2px;
        border-radius: 50%;
      }

      .swatch-btn:focus:not(:focus-visible) {
        outline: none;
      }

      /* The actual 32×32 colored circle */
      .swatch-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        position: relative;
        flex-shrink: 0;
        transition: box-shadow var(--pv-transition, 200ms ease);
      }

      /* Selected ring: 3px ring in swatch color */
      .swatch-btn[aria-pressed='true'] .swatch-circle {
        box-shadow:
          0 0 0 2px var(--pv-card-bg, #FFFFFF),
          0 0 0 5px var(--swatch-color);
      }

      /* White checkmark center dot when selected */
      .swatch-btn[aria-pressed='true'] .swatch-circle::after {
        content: '';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px 16px;
        border-radius: 50%;
      }

      /* Custom swatch button — same sizing */
      .swatch-btn.custom-btn {
        border-radius: 8px;
      }

      .swatch-btn.custom-btn:focus-visible {
        border-radius: 8px;
      }

      .custom-circle {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1.5px dashed var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--pv-text-muted, #9CA3AF);
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        transition: border-color var(--pv-transition, 200ms ease),
                    color var(--pv-transition, 200ms ease);
        flex-shrink: 0;
        overflow: hidden;
      }

      .swatch-btn.custom-btn:hover .custom-circle {
        border-color: var(--pv-accent, #6366F1);
        color: var(--pv-accent, #6366F1);
      }

      /* When custom color is active, show the color instead of the placeholder */
      .custom-circle.has-color {
        border-style: solid;
        border-color: transparent;
      }

      /* Selected custom swatch ring */
      .swatch-btn.custom-btn[aria-pressed='true'] .custom-circle {
        box-shadow:
          0 0 0 2px var(--pv-card-bg, #FFFFFF),
          0 0 0 5px var(--swatch-color, var(--pv-accent, #6366F1));
      }

      /* Checkmark overlay for selected custom swatch */
      .swatch-btn.custom-btn[aria-pressed='true'] .custom-circle::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px 16px;
        border-radius: 6px;
      }

      .custom-circle.has-color {
        position: relative;
      }

      /* The hidden native color input */
      #custom-color-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
        border: none;
        padding: 0;
      }
    `,
  ];

  render() {
    const presets = PvColorSwatchPicker.PRESETS;
    const customColor = this._isCustom ? this.value : '';
    const customSelected = this._isCustom && !!this.value;

    return html`
      <div class="swatch-grid" role="group" aria-label="Color presets">
        ${presets.map((preset) => {
          const selected = this._isSelected(preset.color);
          return html`
            <button
              class="swatch-btn"
              type="button"
              title="${preset.name}"
              aria-label="${preset.name}${selected ? ' (selected)' : ''}"
              aria-pressed="${selected}"
              style="--swatch-color: ${preset.color}"
              @click=${() => this._selectPreset(preset)}
            >
              <div
                class="swatch-circle"
                style="background-color: ${preset.color}"
              ></div>
            </button>
          `;
        })}

        <!-- Custom color button -->
        <button
          class="swatch-btn custom-btn"
          type="button"
          title="Custom color…"
          aria-label="Custom color${customSelected ? ' (selected)' : ''}"
          aria-pressed="${customSelected}"
          style="--swatch-color: ${customColor || 'var(--pv-accent, #6366F1)'}"
          @click=${this._openCustomPicker}
        >
          <div
            class="custom-circle ${customColor ? 'has-color' : ''}"
            style="${customColor ? `background-color: ${customColor}` : ''}"
          >
            ${!customColor
              ? html`<span aria-hidden="true">+</span>`
              : ''}
          </div>
        </button>

        <!-- Hidden native color input -->
        <input
          id="custom-color-input"
          type="color"
          .value=${customColor || '#4A90D9'}
          tabindex="-1"
          aria-hidden="true"
          @change=${this._onCustomColorChange}
          @input=${this._onCustomColorChange}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pv-color-swatch-picker': PvColorSwatchPicker;
  }
}
