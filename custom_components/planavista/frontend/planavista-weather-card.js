/**
 * PlanaVista Weather Card
 * Weather display with current conditions and optional forecast
 *
 * Version: 0.2.0
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

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: var(--pv-header-gradient);
          color: var(--pv-header-text);
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

class PlanaVistaWeatherCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  set hass(hass) { this._hass = hass; }
  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p><strong>PlanaVista Weather Card</strong></p>
        <p style="color: var(--secondary-text-color); font-size: 12px;">
          Options: entity, weather_entity, show_details, show_forecast, layout (horizontal/vertical), theme
        </p>
      </div>
    `;
  }
}

customElements.define('planavista-weather-card', PlanaVistaWeatherCard);
customElements.define('planavista-weather-card-editor', PlanaVistaWeatherCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-weather-card',
  name: 'PlanaVista Weather',
  description: 'Weather display with current conditions',
  preview: true,
});

console.info(
  `%c PLANAVISTA-WEATHER %c v0.2.0 `,
  'color: white; background: #50C9C3; font-weight: bold;',
  'color: #50C9C3; background: white; font-weight: bold;'
);
