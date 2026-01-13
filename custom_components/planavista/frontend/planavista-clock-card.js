/**
 * PlanaVista Clock Card
 * Large time and date display for wall calendars
 *
 * Version: 0.2.0
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

    // Format time
    const locale = timeFormat === '12h' ? 'en-US' : 'en-GB';
    const timeOptions = timeFormat === '12h'
      ? { hour: 'numeric', minute: '2-digit', hour12: true, ...(showSeconds && { second: '2-digit' }) }
      : { hour: '2-digit', minute: '2-digit', hour12: false, ...(showSeconds && { second: '2-digit' }) };
    const timeString = now.toLocaleTimeString(locale, timeOptions);

    // Format date
    const dateString = PlanaVistaBase.formatDate(now, 'long');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: var(--pv-header-gradient);
          color: var(--pv-header-text);
          padding: ${size === 'small' ? '1rem' : '2rem'};
          text-align: ${this._config.align || 'left'};
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

// Simple editor for the clock card
class PlanaVistaClockCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p><strong>PlanaVista Clock Card</strong></p>
        <p style="color: var(--secondary-text-color); font-size: 12px;">
          Options: entity, size (small/medium/large), show_date, show_seconds, time_format (12h/24h), theme, align (left/center/right)
        </p>
      </div>
    `;
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
  description: 'Large time and date display',
  preview: true,
});

console.info(
  `%c PLANAVISTA-CLOCK %c v0.2.0 `,
  'color: white; background: #667eea; font-weight: bold;',
  'color: #667eea; background: white; font-weight: bold;'
);
