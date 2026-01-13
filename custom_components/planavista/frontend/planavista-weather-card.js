/**
 * PlanaVista Weather Card
 * Weather display with current conditions and optional forecast
 *
 * Version: 0.2.1
 */

class PlanaVistaWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

  getCardSize() {
    return this._config.show_forecast ? 3 : 2;
  }

  get configEntity() {
    const entityId = this._config.entity || 'sensor.planavista_config';
    return this._hass?.states?.[entityId];
  }

  get display() {
    return this.configEntity?.attributes?.display || {};
  }

  get theme() {
    return this._config.theme || this.display.theme || 'planavista';
  }

  get weatherEntity() {
    const weatherEntityId = this._config.weather_entity || this.display.weather_entity;
    return weatherEntityId ? this._hass?.states?.[weatherEntityId] : null;
  }

  getBackgroundStyle() {
    if (this._config.background) {
      return this._config.background;
    }
    if (this._config.background_color) {
      return this._config.background_color;
    }
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

    const weather = this.weatherEntity;
    if (!weather) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; ${PlanaVistaBase.getThemeStyles(this.theme)} }
          ha-card { background: var(--pv-card-background); color: var(--pv-text); padding: 1.5rem; }
          .no-weather { text-align: center; color: var(--pv-text-secondary); }
        </style>
        <ha-card>
          <div class="no-weather">
            <ha-icon icon="mdi:weather-cloudy-alert"></ha-icon>
            <p>No weather entity configured</p>
          </div>
        </ha-card>
      `;
      return;
    }

    const temp = Math.round(weather.attributes.temperature);
    const condition = weather.state;
    const humidity = weather.attributes.humidity;
    const windSpeed = weather.attributes.wind_speed;
    const tempUnit = weather.attributes.temperature_unit || '°F';
    const icon = PlanaVistaBase.getWeatherIcon(condition);

    const showDetails = this._config.show_details !== false;
    const showForecast = this._config.show_forecast === true;
    const forecast = weather.attributes.forecast || [];
    const layout = this._config.layout || 'horizontal';

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
          padding: 1.5rem;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 1rem;
          ${layout === 'vertical' ? 'flex-direction: column; text-align: center;' : ''}
        }

        .weather-icon {
          font-size: 3rem;
        }

        .weather-info {
          flex: 1;
        }

        .weather-temp {
          font-size: 2.5rem;
          font-weight: 300;
          line-height: 1;
        }

        .weather-condition {
          font-size: 1rem;
          opacity: 0.9;
          text-transform: capitalize;
          margin-top: 0.25rem;
        }

        .weather-details {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .weather-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .forecast {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
          overflow-x: auto;
        }

        .forecast-day {
          text-align: center;
          min-width: 60px;
        }

        .forecast-day-name {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .forecast-icon {
          font-size: 1.5rem;
          margin: 0.25rem 0;
        }

        .forecast-temps {
          font-size: 0.85rem;
        }

        .forecast-high {
          font-weight: bold;
        }

        .forecast-low {
          opacity: 0.7;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }
      </style>
      <ha-card>
        <div class="weather-main">
          <div class="weather-icon">${icon}</div>
          <div class="weather-info">
            <div class="weather-temp">${temp}${tempUnit}</div>
            <div class="weather-condition">${condition.replace(/-/g, ' ')}</div>
          </div>
        </div>
        ${showDetails ? `
          <div class="weather-details">
            ${humidity !== undefined ? `
              <div class="weather-detail">
                <ha-icon icon="mdi:water-percent"></ha-icon>
                <span>${humidity}%</span>
              </div>
            ` : ''}
            ${windSpeed !== undefined ? `
              <div class="weather-detail">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                <span>${windSpeed} ${weather.attributes.wind_speed_unit || 'mph'}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        ${showForecast && forecast.length > 0 ? `
          <div class="forecast">
            ${forecast.slice(0, 5).map(day => {
              const date = new Date(day.datetime);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const forecastIcon = PlanaVistaBase.getWeatherIcon(day.condition);
              return `
                <div class="forecast-day">
                  <div class="forecast-day-name">${dayName}</div>
                  <div class="forecast-icon">${forecastIcon}</div>
                  <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(day.temperature)}°</span>
                    ${day.templow !== undefined ? `<span class="forecast-low"> / ${Math.round(day.templow)}°</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </ha-card>
    `;
  }

  static getConfigElement() {
    return document.createElement('planavista-weather-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      show_details: true,
      show_forecast: false,
    };
  }
}

// Visual Card Editor
class PlanaVistaWeatherCardEditor extends HTMLElement {
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

  _getWeatherEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => id.startsWith('weather.'))
      .sort();
  }

  render() {
    if (!this._hass) return;

    const weatherEntity = this._config.weather_entity || '';
    const showDetails = this._config.show_details !== false;
    const showForecast = this._config.show_forecast || false;
    const layout = this._config.layout || 'horizontal';
    const theme = this._config.theme || '';
    const background = this._config.background || '';
    const textColor = this._config.text_color || '';

    const weatherEntities = this._getWeatherEntities();

    this.innerHTML = `
      <div class="card-config">
        <div class="config-row">
          <label class="config-label">Weather Entity</label>
          <select data-config="weather_entity" class="config-select">
            <option value="">Use integration default</option>
            ${weatherEntities.map(entity => `
              <option value="${entity}" ${weatherEntity === entity ? 'selected' : ''}>
                ${entity}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="config-row">
          <ha-textfield
            label="Background (color or gradient)"
            .value="${background}"
            placeholder="e.g., #4A90E2 or linear-gradient(135deg, #667eea, #764ba2)"
            data-config="background"
          ></ha-textfield>
        </div>

        <div class="config-row">
          <ha-textfield
            label="Text Color"
            .value="${textColor}"
            placeholder="e.g., #ffffff or white"
            data-config="text_color"
          ></ha-textfield>
        </div>

        <div class="config-row">
          <label class="config-label">Layout</label>
          <div class="button-group">
            <button class="${layout === 'horizontal' ? 'active' : ''}" data-config="layout" data-value="horizontal">Horizontal</button>
            <button class="${layout === 'vertical' ? 'active' : ''}" data-config="layout" data-value="vertical">Vertical</button>
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
          <ha-formfield label="Show humidity & wind">
            <ha-checkbox
              .checked="${showDetails}"
              data-config="show_details"
            ></ha-checkbox>
          </ha-formfield>
        </div>

        <div class="config-row checkbox-row">
          <ha-formfield label="Show 5-day forecast">
            <ha-checkbox
              .checked="${showForecast}"
              data-config="show_forecast"
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
        .config-select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
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

    this.querySelectorAll('.config-select').forEach(select => {
      select.addEventListener('change', (e) => this._selectChanged(e));
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

  _selectChanged(ev) {
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

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('planavista-weather-card', PlanaVistaWeatherCard);
customElements.define('planavista-weather-card-editor', PlanaVistaWeatherCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-weather-card',
  name: 'PlanaVista Weather',
  description: 'Weather display with customizable background',
  preview: true,
});

console.info(
  `%c PLANAVISTA-WEATHER %c v0.2.1 `,
  'color: white; background: #50C9C3; font-weight: bold;',
  'color: #50C9C3; background: white; font-weight: bold;'
);
