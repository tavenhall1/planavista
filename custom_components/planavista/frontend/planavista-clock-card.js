/**
 * PlanaVista Clock Card
 * Large time and date display for wall calendars
 *
 * Version: 0.2.1
 */

class PlanaVistaClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._intervalId = null;
  }

  connectedCallback() {
    // Update time every second
    this._intervalId = setInterval(() => this.render(), 1000);
  }

  disconnectedCallback() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return this._config.size === 'small' ? 2 : 3;
  }

  get entity() {
    const entityId = this._config.entity || 'sensor.planavista_config';
    return this._hass?.states?.[entityId];
  }

  get display() {
    return this.entity?.attributes?.display || {};
  }

  get theme() {
    return this._config.theme || this.display.theme || 'planavista';
  }

  getBackgroundStyle() {
    // Custom background takes precedence
    if (this._config.background) {
      return this._config.background;
    }
    if (this._config.background_color) {
      return this._config.background_color;
    }
    // Fall back to theme
    return 'var(--pv-header-gradient)';
  }

  getTextColor() {
    if (this._config.text_color) {
      return this._config.text_color;
    }
    return 'var(--pv-header-text)';
  }

  render() {
    if (!this._hass) return;

    const { PlanaVistaBase } = window;
    if (!PlanaVistaBase) {
      this.shadowRoot.innerHTML = '<ha-card><div class="error">PlanaVista base module not loaded</div></ha-card>';
      return;
    }

    const now = new Date();
    const timeFormat = this._config.time_format || this.display.time_format || '12h';
    const showDate = this._config.show_date !== false;
    const showSeconds = this._config.show_seconds === true;
    const size = this._config.size || 'large';
    const align = this._config.align || 'left';

    // Format time
    const locale = timeFormat === '12h' ? 'en-US' : 'en-GB';
    const timeOptions = timeFormat === '12h'
      ? { hour: 'numeric', minute: '2-digit', hour12: true, ...(showSeconds && { second: '2-digit' }) }
      : { hour: '2-digit', minute: '2-digit', hour12: false, ...(showSeconds && { second: '2-digit' }) };
    const timeString = now.toLocaleTimeString(locale, timeOptions);

    // Format date
    const dateString = PlanaVistaBase.formatDate(now, 'long');

    const background = this.getBackgroundStyle();
    const textColor = this.getTextColor();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: ${background};
          color: ${textColor};
          padding: ${size === 'small' ? '1rem' : '2rem'};
          text-align: ${align};
        }

        .time {
          font-size: ${size === 'small' ? '2rem' : size === 'medium' ? '3rem' : '4rem'};
          font-weight: 300;
          line-height: 1.1;
          font-family: 'Ovo', serif, system-ui;
        }

        .date {
          font-size: ${size === 'small' ? '0.9rem' : size === 'medium' ? '1rem' : '1.3rem'};
          opacity: 0.9;
          margin-top: 0.5rem;
          font-family: 'Ovo', serif, system-ui;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }
      </style>
      <ha-card>
        <div class="time">${timeString}</div>
        ${showDate ? `<div class="date">${dateString}</div>` : ''}
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement('planavista-clock-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      size: 'large',
      show_date: true,
      show_seconds: false,
    };
  }
}

// Visual Card Editor
class PlanaVistaClockCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this._hass) return;

    const size = this._config.size || 'large';
    const showDate = this._config.show_date !== false;
    const showSeconds = this._config.show_seconds || false;
    const timeFormat = this._config.time_format || '';
    const theme = this._config.theme || '';
    const align = this._config.align || 'left';
    const background = this._config.background || '';
    const textColor = this._config.text_color || '';

    this.innerHTML = `
      <div class="card-config">
        <div class="config-row">
          <ha-textfield
            label="Background (color or gradient)"
            .value="${background}"
            placeholder="e.g., #4A90E2 or linear-gradient(135deg, #667eea, #764ba2)"
            @input="${this._inputChanged}"
            data-config="background"
          ></ha-textfield>
        </div>

        <div class="config-row">
          <ha-textfield
            label="Text Color"
            .value="${textColor}"
            placeholder="e.g., #ffffff or white"
            @input="${this._inputChanged}"
            data-config="text_color"
          ></ha-textfield>
        </div>

        <div class="config-row">
          <label class="config-label">Size</label>
          <div class="button-group">
            <button class="${size === 'small' ? 'active' : ''}" data-config="size" data-value="small">Small</button>
            <button class="${size === 'medium' ? 'active' : ''}" data-config="size" data-value="medium">Medium</button>
            <button class="${size === 'large' ? 'active' : ''}" data-config="size" data-value="large">Large</button>
          </div>
        </div>

        <div class="config-row">
          <label class="config-label">Alignment</label>
          <div class="button-group">
            <button class="${align === 'left' ? 'active' : ''}" data-config="align" data-value="left">Left</button>
            <button class="${align === 'center' ? 'active' : ''}" data-config="align" data-value="center">Center</button>
            <button class="${align === 'right' ? 'active' : ''}" data-config="align" data-value="right">Right</button>
          </div>
        </div>

        <div class="config-row">
          <label class="config-label">Time Format</label>
          <div class="button-group">
            <button class="${timeFormat === '' ? 'active' : ''}" data-config="time_format" data-value="">Default</button>
            <button class="${timeFormat === '12h' ? 'active' : ''}" data-config="time_format" data-value="12h">12h</button>
            <button class="${timeFormat === '24h' ? 'active' : ''}" data-config="time_format" data-value="24h">24h</button>
          </div>
        </div>

        <div class="config-row">
          <label class="config-label">Theme</label>
          <div class="button-group">
            <button class="${theme === '' ? 'active' : ''}" data-config="theme" data-value="">Default</button>
            <button class="${theme === 'planavista' ? 'active' : ''}" data-config="theme" data-value="planavista">PlanaVista</button>
            <button class="${theme === 'minimal' ? 'active' : ''}" data-config="theme" data-value="minimal">Minimal</button>
            <button class="${theme === 'modern' ? 'active' : ''}" data-config="theme" data-value="modern">Modern</button>
            <button class="${theme === 'dark' ? 'active' : ''}" data-config="theme" data-value="dark">Dark</button>
          </div>
        </div>

        <div class="config-row checkbox-row">
          <ha-formfield label="Show date">
            <ha-checkbox
              .checked="${showDate}"
              @change="${this._checkboxChanged}"
              data-config="show_date"
            ></ha-checkbox>
          </ha-formfield>
        </div>

        <div class="config-row checkbox-row">
          <ha-formfield label="Show seconds">
            <ha-checkbox
              .checked="${showSeconds}"
              @change="${this._checkboxChanged}"
              data-config="show_seconds"
            ></ha-checkbox>
          </ha-formfield>
        </div>
      </div>
      <style>
        .card-config {
          padding: 16px;
        }
        .config-row {
          margin-bottom: 16px;
        }
        .config-row:last-child {
          margin-bottom: 0;
        }
        .config-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 8px;
        }
        .button-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .button-group button {
          padding: 8px 16px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 14px;
        }
        .button-group button.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        .button-group button:hover:not(.active) {
          background: var(--secondary-background-color);
        }
        .checkbox-row {
          display: flex;
          align-items: center;
        }
        ha-textfield {
          width: 100%;
        }
      </style>
    `;

    // Attach event listeners
    this.querySelectorAll('.button-group button').forEach(btn => {
      btn.addEventListener('click', (e) => this._buttonClicked(e));
    });

    this.querySelectorAll('ha-textfield').forEach(field => {
      field.addEventListener('input', (e) => this._inputChanged(e));
    });

    this.querySelectorAll('ha-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this._checkboxChanged(e));
    });
  }

  _buttonClicked(ev) {
    const target = ev.target;
    const configKey = target.dataset.config;
    const value = target.dataset.value;

    if (configKey) {
      const newConfig = { ...this._config };
      if (value === '') {
        delete newConfig[configKey];
      } else {
        newConfig[configKey] = value;
      }
      this._config = newConfig;
      this._fireConfigChanged();
      this.render();
    }
  }

  _inputChanged(ev) {
    const target = ev.target;
    const configKey = target.dataset.config;
    const value = target.value;

    if (configKey) {
      const newConfig = { ...this._config };
      if (value === '') {
        delete newConfig[configKey];
      } else {
        newConfig[configKey] = value;
      }
      this._config = newConfig;
      this._fireConfigChanged();
    }
  }

  _checkboxChanged(ev) {
    const target = ev.target;
    const configKey = target.dataset.config;
    const checked = target.checked;

    if (configKey) {
      const newConfig = { ...this._config };
      newConfig[configKey] = checked;
      this._config = newConfig;
      this._fireConfigChanged();
    }
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('planavista-clock-card', PlanaVistaClockCard);
customElements.define('planavista-clock-card-editor', PlanaVistaClockCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-clock-card',
  name: 'PlanaVista Clock',
  description: 'Large time and date display with customizable background',
  preview: true,
});

console.info(
  `%c PLANAVISTA-CLOCK %c v0.2.1 `,
  'color: white; background: #667eea; font-weight: bold;',
  'color: #667eea; background: white; font-weight: bold;'
);
