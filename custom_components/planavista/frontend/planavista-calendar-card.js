/**
 * PlanaVista Card
 * A beautiful, responsive calendar card for Home Assistant
 *
 * Version: 0.1.0
 */

console.info(
  `%c PLANAVISTA-CALENDAR-CARD %c v0.1.0 `,
  'color: white; background: #4A90E2; font-weight: bold;',
  'color: #4A90E2; background: white; font-weight: bold;'
);

class PlanaVistaCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = {};
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity (planavista_config sensor)');
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    return 9;
  }

  render() {
    if (!this._hass || !this._config.entity) {
      return;
    }

    const entityId = this._config.entity;
    const entity = this._hass.states[entityId];

    if (!entity) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="error">Entity ${entityId} not found</div>
        </ha-card>
      `;
      return;
    }

    const config = entity.attributes;
    const calendars = config.calendars || [];
    const display = config.display || {};
    const theme = display.theme || 'planavista';

    this.shadowRoot.innerHTML = `
      ${this.getStyles(theme)}
      <ha-card class="planavista-card theme-${theme}">
        ${this.renderHeader(display)}
        ${this.renderControls(calendars)}
        ${this.renderCalendar(calendars, display)}
      </ha-card>
    `;

    this.attachEventListeners();
  }

  renderHeader(display) {
    const now = new Date();
    const weatherEntity = display.weather_entity;
    const timeFormat = display.time_format === '12h' ? 'en-US' : 'en-GB';

    const options12h = { hour: 'numeric', minute: '2-digit', hour12: true };
    const options24h = { hour: '2-digit', minute: '2-digit', hour12: false };
    const timeOptions = display.time_format === '12h' ? options12h : options24h;

    const timeString = now.toLocaleTimeString(timeFormat, timeOptions);
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let weatherHtml = '';
    if (weatherEntity && this._hass.states[weatherEntity]) {
      const weather = this._hass.states[weatherEntity];
      const temp = Math.round(weather.attributes.temperature);
      const condition = weather.state;
      weatherHtml = `
        <div class="weather">
          <div class="weather-icon">${this.getWeatherIcon(condition)}</div>
          <div class="weather-temp">${temp}°</div>
          <div class="weather-condition">${condition}</div>
        </div>
      `;
    }

    return `
      <div class="header">
        <div class="date-time">
          <div class="time">${timeString}</div>
          <div class="date">${dateString}</div>
        </div>
        ${weatherHtml}
      </div>
    `;
  }

  renderControls(calendars) {
    if (!calendars || calendars.length === 0) {
      return '<div class="no-calendars">No calendars configured</div>';
    }

    const buttons = calendars.map((cal, idx) => {
      const isVisible = cal.visible !== false;
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" class="person-avatar" />`;
        }
      }

      if (!avatar) {
        avatar = `<ha-icon icon="${cal.icon || 'mdi:calendar'}"></ha-icon>`;
      }

      return `
        <button
          class="calendar-toggle ${isVisible ? 'active' : 'inactive'}"
          data-calendar="${idx}"
          style="--calendar-color: ${cal.color}"
        >
          ${avatar}
          <span class="calendar-name">${cal.display_name}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="controls">
        <div class="calendar-buttons">${buttons}</div>
        <button class="add-event-btn">
          <ha-icon icon="mdi:calendar-plus"></ha-icon>
          <span>Add Event</span>
        </button>
      </div>
    `;
  }

  renderCalendar(calendars, display) {
    // This is a placeholder for the calendar view
    // In a full implementation, this would render events from the calendars
    const view = display.default_view || 'week';

    return `
      <div class="calendar-view view-${view}">
        <div class="calendar-placeholder">
          <ha-icon icon="mdi:calendar-blank"></ha-icon>
          <p>Calendar view will be rendered here</p>
          <p class="small">Showing ${calendars.length} calendar(s) in ${view} view</p>
        </div>
      </div>
    `;
  }

  getWeatherIcon(condition) {
    const iconMap = {
      'clear-night': '🌙',
      'cloudy': '☁️',
      'fog': '🌫️',
      'hail': '🌨️',
      'lightning': '⛈️',
      'lightning-rainy': '⛈️',
      'partlycloudy': '⛅',
      'pouring': '🌧️',
      'rainy': '🌧️',
      'snowy': '🌨️',
      'snowy-rainy': '🌨️',
      'sunny': '☀️',
      'windy': '💨',
      'windy-variant': '💨',
    };
    return iconMap[condition] || '☀️';
  }

  attachEventListeners() {
    // Calendar toggle buttons
    const toggleButtons = this.shadowRoot.querySelectorAll('.calendar-toggle');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const calendarIdx = parseInt(btn.dataset.calendar);
        this.toggleCalendar(calendarIdx);
      });
    });

    // Add event button
    const addEventBtn = this.shadowRoot.querySelector('.add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openAddEventDialog();
      });
    }
  }

  toggleCalendar(idx) {
    // This would call a service to toggle calendar visibility
    console.log('Toggle calendar:', idx);
    // In full implementation:
    // this._hass.callService('planavista', 'set_calendar_visibility', {...});
  }

  openAddEventDialog() {
    // This would open a dialog to add a new event
    console.log('Open add event dialog');
    // In full implementation: open a dialog or fire an event
  }

  getStyles(theme) {
    return `
      <style>
        :host {
          display: block;
        }

        ha-card {
          padding: 0;
          overflow: hidden;
        }

        .planavista-card {
          font-family: 'Ovo', serif, system-ui;
        }

        /* Header Styles */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .theme-minimal .header {
          background: #f5f5f5;
          color: #333;
        }

        .theme-modern .header {
          background: linear-gradient(135deg, #4A90E2 0%, #50C9C3 100%);
        }

        .theme-dark .header {
          background: #1a1a1a;
          color: #fff;
        }

        .date-time {
          flex: 1;
        }

        .time {
          font-size: 3.5rem;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .date {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .weather {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .weather-icon {
          font-size: 3rem;
        }

        .weather-temp {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .weather-condition {
          font-size: 0.9rem;
          opacity: 0.9;
          text-transform: capitalize;
        }

        /* Controls Styles */
        .controls {
          padding: 1.5rem 2rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          background: white;
          border-bottom: 1px solid #e0e0e0;
        }

        .theme-dark .controls {
          background: #2a2a2a;
          border-color: #444;
        }

        .calendar-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .calendar-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 24px;
          background: #f5f5f5;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .calendar-toggle.active {
          background: var(--calendar-color, #4A90E2);
          color: white;
        }

        .calendar-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .person-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .add-event-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.5rem;
          background: #4A90E2;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .add-event-btn:hover {
          background: #357ABD;
          transform: translateY(-2px);
        }

        /* Calendar View Styles */
        .calendar-view {
          padding: 2rem;
          min-height: 400px;
          background: white;
        }

        .theme-dark .calendar-view {
          background: #1a1a1a;
          color: white;
        }

        .calendar-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: #999;
        }

        .calendar-placeholder ha-icon {
          --mdc-icon-size: 64px;
          margin-bottom: 1rem;
        }

        .calendar-placeholder p {
          margin: 0.5rem 0;
        }

        .calendar-placeholder .small {
          font-size: 0.85rem;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
          }

          .time {
            font-size: 2.5rem;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .calendar-buttons {
            justify-content: center;
          }
        }
      </style>
    `;
  }

  static getConfigElement() {
    return document.createElement('planavista-calendar-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
    };
  }
}

customElements.define('planavista-calendar-card', PlanaVistaCalendarCard);

/**
 * PlanaVista Card Editor
 * Visual configuration editor for the card
 */
class PlanaVistaCalendarCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  get _entity() {
    return this._config.entity || '';
  }

  render() {
    if (!this._hass) {
      return;
    }

    // Find planavista_config sensors
    const entities = Object.keys(this._hass.states)
      .filter(e => e.startsWith('sensor.') && e.includes('planavista'))
      .sort();

    this.innerHTML = `
      <div class="card-config">
        <ha-entity-picker
          .hass=${this._hass}
          .value="${this._entity}"
          .configValue=${"entity"}
          label="Entity (Required)"
          allow-custom-entity
          .includeDomains=${["sensor"]}
        ></ha-entity-picker>
      </div>
    `;

    // Set up the entity picker after rendering
    const entityPicker = this.querySelector('ha-entity-picker');
    if (entityPicker) {
      entityPicker.hass = this._hass;
      entityPicker.value = this._entity;
      entityPicker.addEventListener('value-changed', (ev) => {
        this._valueChanged(ev, 'entity');
      });
    }
  }

  _valueChanged(ev, configKey) {
    if (!this._config || !this._hass) {
      return;
    }
    const target = ev.target;
    const value = ev.detail?.value ?? target.value;

    if (this._config[configKey] === value) {
      return;
    }

    const newConfig = {
      ...this._config,
      [configKey]: value,
    };

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define('planavista-calendar-card-editor', PlanaVistaCalendarCardEditor);

// Register the card with the UI
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-calendar-card',
  name: 'PlanaVista Card',
  description: 'A beautiful panoramic calendar view for your family',
  preview: true,
});
