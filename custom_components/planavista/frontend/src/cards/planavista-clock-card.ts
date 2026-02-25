import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { PlanaVistaClockConfig, DisplayConfig } from '../types';
import { applyTheme, resolveTheme, getThemeCSSText } from '../styles/themes';
import { baseStyles } from '../styles/shared';
import { formatDate } from '../utils/date-utils';
import { getPlanaVistaData } from '../utils/ha-utils';

@customElement('planavista-clock-card')
export class PlanaVistaClockCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaClockConfig;
  @state() private _time = '';
  @state() private _date = '';

  private _timer?: ReturnType<typeof setInterval>;

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      ha-card {
        padding: 1.5rem;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .clock-container {
        display: flex;
        flex-direction: column;
      }

      .clock-container.align-left { text-align: left; }
      .clock-container.align-center { text-align: center; }
      .clock-container.align-right { text-align: right; }

      .time {
        font-weight: 300;
        line-height: 1.1;
        letter-spacing: -0.03em;
        font-variant-numeric: tabular-nums;
      }

      .time.size-small { font-size: 2rem; }
      .time.size-medium { font-size: 3.5rem; }
      .time.size-large { font-size: 5rem; }

      .time .period {
        font-size: 0.35em;
        font-weight: 400;
        letter-spacing: 0.02em;
        opacity: 0.7;
        margin-left: 0.15em;
        vertical-align: super;
      }

      .date {
        font-size: 1rem;
        font-weight: 400;
        margin-top: 0.5rem;
        opacity: 0.85;
      }

      .time.size-large + .date { font-size: 1.25rem; margin-top: 0.75rem; }
      .time.size-small + .date { font-size: 0.875rem; margin-top: 0.25rem; }
    `,
  ];

  setConfig(config: PlanaVistaClockConfig) {
    this._config = {
      entity: 'sensor.planavista_config',
      size: 'large',
      show_date: true,
      show_seconds: false,
      time_format: undefined,
      align: 'center',
      ...config,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateTime();
    this._timer = setInterval(() => this._updateTime(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = undefined;
    }
  }

  private _updateTime() {
    const now = new Date();
    const format = this._config?.time_format || this._getDisplayConfig()?.time_format || '12h';
    const showSeconds = this._config?.show_seconds || false;

    if (format === '24h') {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      this._time = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
    } else {
      let h = now.getHours();
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const timeStr = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
      this._time = `${timeStr}|${period}`;
    }

    if (this._config?.show_date !== false) {
      this._date = formatDate(now, 'long');
    }
  }

  private _getDisplayConfig(): DisplayConfig | undefined {
    if (!this.hass) return undefined;
    const data = getPlanaVistaData(this.hass, this._config?.entity);
    return data?.display;
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('hass') || changedProps.has('_config')) {
      const display = this._getDisplayConfig();
      const theme = resolveTheme(this._config?.theme, display?.theme);
      applyTheme(this, theme);
    }
  }

  render() {
    if (!this._config) return nothing;

    const size = this._config.size || 'large';
    const align = this._config.align || 'center';
    const bgStyle = this._config.background
      ? `background: ${this._config.background};`
      : '';
    const colorStyle = this._config.text_color
      ? `color: ${this._config.text_color};`
      : '';
    const cardStyle = `${bgStyle}${colorStyle}`;

    // Parse time and period
    const parts = this._time.split('|');
    const timeStr = parts[0];
    const period = parts[1] || '';

    return html`
      <ha-card style="${cardStyle}">
        <div class="clock-container align-${align}">
          <div class="time size-${size}">
            ${timeStr}${period ? html`<span class="period">${period}</span>` : nothing}
          </div>
          ${this._config.show_date !== false
            ? html`<div class="date">${this._date}</div>`
            : nothing}
        </div>
      </ha-card>
    `;
  }

  getCardSize(): number {
    const size = this._config?.size || 'large';
    return size === 'small' ? 2 : size === 'medium' ? 3 : 4;
  }

  static getConfigElement() {
    return document.createElement('planavista-clock-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      size: 'large',
      show_date: true,
    };
  }
}

// Minimal visual editor
@customElement('planavista-clock-card-editor')
export class PlanaVistaClockCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaClockConfig;

  static styles = css`
    .editor {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    label {
      font-size: 14px;
      font-weight: 500;
    }
    select, input {
      padding: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
  `;

  setConfig(config: PlanaVistaClockConfig) {
    this._config = config;
  }

  render() {
    if (!this._config) return nothing;
    return html`
      <div class="editor">
        <div class="row">
          <label>Size</label>
          <select @change=${(e: Event) => this._changed('size', (e.target as HTMLSelectElement).value)}>
            <option value="small" ?selected=${this._config.size === 'small'}>Small</option>
            <option value="medium" ?selected=${this._config.size === 'medium'}>Medium</option>
            <option value="large" ?selected=${this._config.size === 'large'}>Large</option>
          </select>
        </div>
        <div class="row">
          <label>Time Format</label>
          <select @change=${(e: Event) => this._changed('time_format', (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${!this._config.time_format}>Auto</option>
            <option value="12h" ?selected=${this._config.time_format === '12h'}>12h</option>
            <option value="24h" ?selected=${this._config.time_format === '24h'}>24h</option>
          </select>
        </div>
        <div class="row">
          <label>Alignment</label>
          <select @change=${(e: Event) => this._changed('align', (e.target as HTMLSelectElement).value)}>
            <option value="left" ?selected=${this._config.align === 'left'}>Left</option>
            <option value="center" ?selected=${this._config.align === 'center'}>Center</option>
            <option value="right" ?selected=${this._config.align === 'right'}>Right</option>
          </select>
        </div>
        <div class="row">
          <label>Show Date</label>
          <input type="checkbox" ?checked=${this._config.show_date !== false}
            @change=${(e: Event) => this._changed('show_date', (e.target as HTMLInputElement).checked)} />
        </div>
        <div class="row">
          <label>Show Seconds</label>
          <input type="checkbox" ?checked=${this._config.show_seconds === true}
            @change=${(e: Event) => this._changed('show_seconds', (e.target as HTMLInputElement).checked)} />
        </div>
        <div class="row">
          <label>Background</label>
          <input type="text" .value=${this._config.background || ''}
            placeholder="e.g. linear-gradient(...)"
            @input=${(e: Event) => this._changed('background', (e.target as HTMLInputElement).value)} />
        </div>
        <div class="row">
          <label>Text Color</label>
          <input type="text" .value=${this._config.text_color || ''}
            placeholder="e.g. #ffffff"
            @input=${(e: Event) => this._changed('text_color', (e.target as HTMLInputElement).value)} />
        </div>
      </div>
    `;
  }

  private _changed(key: string, value: any) {
    const newConfig = { ...this._config, [key]: value };
    if (value === '' || value === undefined) delete (newConfig as any)[key];
    this._config = newConfig;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    }));
  }
}
