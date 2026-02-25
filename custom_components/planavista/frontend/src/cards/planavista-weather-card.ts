import { LitElement, html, css, nothing, PropertyValues, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { PlanaVistaWeatherConfig, DisplayConfig, ForecastDay, WeatherCondition } from '../types';
import { applyTheme, resolveTheme } from '../styles/themes';
import { baseStyles, typographyStyles } from '../styles/shared';
import { getPlanaVistaData } from '../utils/ha-utils';
import { weatherIcon, weatherIconStyles } from '../utils/weather-icons';

// Weather condition to gradient mapping
const CONDITION_GRADIENTS: Record<string, string> = {
  'sunny': 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
  'clear-night': 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
  'cloudy': 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
  'partlycloudy': 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
  'rainy': 'linear-gradient(135deg, #475569 0%, #334155 100%)',
  'pouring': 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
  'snowy': 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 100%)',
  'fog': 'linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)',
  'lightning': 'linear-gradient(135deg, #475569 0%, #1E293B 100%)',
  'windy': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
  'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

@customElement('planavista-weather-card')
export class PlanaVistaWeatherCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: PlanaVistaWeatherConfig;

  static styles = [
    baseStyles,
    typographyStyles,
    css`
      ${unsafeCSS(weatherIconStyles)}

      :host { display: block; }

      ha-card {
        padding: 1.5rem;
        color: white;
        transition: all var(--pv-transition, 200ms ease);
      }

      .weather-main {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .weather-main.vertical {
        flex-direction: column;
        text-align: center;
      }

      .weather-icon {
        flex-shrink: 0;
        line-height: 1;
      }

      .weather-info {
        flex: 1;
        min-width: 0;
      }

      .weather-temp {
        font-size: 2.75rem;
        font-weight: 300;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .weather-temp .unit {
        font-size: 0.4em;
        font-weight: 400;
        opacity: 0.7;
        vertical-align: super;
      }

      .weather-condition {
        font-size: 1rem;
        font-weight: 400;
        opacity: 0.85;
        text-transform: capitalize;
        margin-top: 0.25rem;
      }

      .weather-details {
        display: flex;
        gap: 1.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.875rem;
        opacity: 0.85;
      }

      .weather-detail {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .weather-detail ha-icon {
        --mdc-icon-size: 18px;
        opacity: 0.8;
      }

      .forecast {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .forecast::-webkit-scrollbar { display: none; }

      .forecast-day {
        text-align: center;
        min-width: 56px;
        flex-shrink: 0;
      }

      .forecast-day-name {
        font-size: 0.75rem;
        opacity: 0.7;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .forecast-icon {
        margin: 0.375rem 0;
        display: flex;
        justify-content: center;
      }

      .forecast-temps {
        font-size: 0.8125rem;
      }

      .forecast-high {
        font-weight: 600;
      }

      .forecast-low {
        opacity: 0.6;
        font-weight: 400;
      }

      .no-weather {
        text-align: center;
        padding: 1rem;
        color: var(--pv-text-secondary);
      }

      .no-weather ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.3;
      }

      .no-weather p {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }
    `,
  ];

  setConfig(config: PlanaVistaWeatherConfig) {
    this._config = {
      entity: 'sensor.planavista_config',
      show_details: true,
      show_forecast: false,
      layout: 'horizontal',
      ...config,
    };
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('hass') || changedProps.has('_config')) {
      const display = this._getDisplayConfig();
      const theme = resolveTheme(this._config?.theme, display?.theme);
      applyTheme(this, theme);
    }
  }

  private _getDisplayConfig(): DisplayConfig | undefined {
    if (!this.hass) return undefined;
    return getPlanaVistaData(this.hass, this._config?.entity)?.display;
  }

  private _getWeatherEntity() {
    const weatherEntityId =
      this._config?.weather_entity ||
      this._getDisplayConfig()?.weather_entity;
    return weatherEntityId ? this.hass?.states?.[weatherEntityId] : null;
  }

  render() {
    if (!this._config || !this.hass) return nothing;

    const weather = this._getWeatherEntity();
    if (!weather) {
      return html`
        <ha-card>
          <div class="no-weather">
            <ha-icon icon="mdi:weather-cloudy-alert"></ha-icon>
            <p>No weather entity configured</p>
          </div>
        </ha-card>
      `;
    }

    const condition = (weather.state || 'cloudy') as WeatherCondition;
    const temp = Math.round(weather.attributes.temperature ?? 0);
    const humidity = weather.attributes.humidity;
    const windSpeed = weather.attributes.wind_speed;
    const tempUnit = weather.attributes.temperature_unit || '\u00B0F';
    const windUnit = weather.attributes.wind_speed_unit || 'mph';
    const showDetails = this._config.show_details !== false;
    const showForecast = this._config.show_forecast === true;
    const forecast: ForecastDay[] = weather.attributes.forecast || [];
    const layout = this._config.layout || 'horizontal';

    // Background: user override or condition-based gradient
    const bg = this._config.background ||
      CONDITION_GRADIENTS[condition] ||
      CONDITION_GRADIENTS.default;
    const textColor = this._config.text_color || 'white';
    const cardStyle = `background: ${bg}; color: ${textColor};`;

    return html`
      <ha-card style="${cardStyle}">
        <div class="weather-main ${layout === 'vertical' ? 'vertical' : ''}">
          <div class="weather-icon">
            ${weatherIcon(condition, 56)}
          </div>
          <div class="weather-info">
            <div class="weather-temp">
              ${temp}<span class="unit">${tempUnit}</span>
            </div>
            <div class="weather-condition">
              ${condition.replace(/-/g, ' ')}
            </div>
          </div>
        </div>

        ${showDetails ? html`
          <div class="weather-details">
            ${humidity != null ? html`
              <div class="weather-detail">
                <ha-icon icon="mdi:water-percent"></ha-icon>
                <span>${humidity}%</span>
              </div>
            ` : nothing}
            ${windSpeed != null ? html`
              <div class="weather-detail">
                <ha-icon icon="mdi:weather-windy"></ha-icon>
                <span>${windSpeed} ${windUnit}</span>
              </div>
            ` : nothing}
          </div>
        ` : nothing}

        ${showForecast && forecast.length > 0 ? html`
          <div class="forecast">
            ${forecast.slice(0, 5).map(day => {
              const date = new Date(day.datetime);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              return html`
                <div class="forecast-day">
                  <div class="forecast-day-name">${dayName}</div>
                  <div class="forecast-icon">
                    ${weatherIcon(day.condition, 28)}
                  </div>
                  <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(day.temperature)}\u00B0</span>
                    ${day.templow != null
                      ? html`<span class="forecast-low"> / ${Math.round(day.templow)}\u00B0</span>`
                      : nothing}
                  </div>
                </div>
              `;
            })}
          </div>
        ` : nothing}
      </ha-card>
    `;
  }

  getCardSize(): number {
    return this._config?.show_forecast ? 4 : 2;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      show_details: true,
      show_forecast: false,
    };
  }
}
