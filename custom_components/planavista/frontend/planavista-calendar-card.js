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
    this._hass = null;
    this._hiddenCalendars = new Set(); // Track hidden calendars locally
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
    if (!this._hass || !this._hass.states || !this._config.entity) {
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
    const events = config.events || [];
    const display = config.display || {};
    const theme = display.theme || 'planavista';

    this.shadowRoot.innerHTML = `
      ${this.getStyles(theme)}
      <ha-card class="planavista-card theme-${theme}">
        ${this.renderHeader(display)}
        ${this.renderControls(calendars)}
        ${this.renderCalendar(calendars, events, display)}
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
      const isHidden = this._hiddenCalendars.has(cal.entity_id);
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
          class="calendar-toggle ${isHidden ? 'inactive' : 'active'}"
          data-entity-id="${cal.entity_id}"
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

  renderCalendar(calendars, events, display) {
    const view = display.default_view || 'week';

    // Filter events by visible calendars
    const visibleEvents = events.filter(event =>
      !this._hiddenCalendars.has(event.calendar_entity_id)
    );

    if (view === 'agenda') {
      return this.renderAgendaView(visibleEvents, display);
    }

    return this.renderWeekView(visibleEvents, display);
  }

  renderWeekView(events, display) {
    const now = new Date();
    const firstDay = display.first_day || 'monday';

    // Get start of week
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const diff = firstDay === 'monday'
      ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
      : -dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Generate 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    // Group events by day
    const eventsByDay = {};
    days.forEach(day => {
      const dateKey = day.toISOString().split('T')[0];
      eventsByDay[dateKey] = [];
    });

    events.forEach(event => {
      const eventStart = new Date(event.start);
      const dateKey = eventStart.toISOString().split('T')[0];
      if (eventsByDay[dateKey]) {
        eventsByDay[dateKey].push(event);
      }
    });

    const dayHeaders = days.map(day => {
      const isToday = day.toDateString() === now.toDateString();
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = day.getDate();
      return `
        <div class="day-header ${isToday ? 'today' : ''}">
          <span class="day-name">${dayName}</span>
          <span class="day-num">${dayNum}</span>
        </div>
      `;
    }).join('');

    const dayColumns = days.map(day => {
      const dateKey = day.toISOString().split('T')[0];
      const dayEvents = eventsByDay[dateKey] || [];
      const isToday = day.toDateString() === now.toDateString();

      const eventsHtml = dayEvents.map(event => {
        const startTime = this.formatEventTime(event.start, display);
        return `
          <div class="event" style="background-color: ${event.calendar_color}20; border-left: 3px solid ${event.calendar_color};">
            <div class="event-time">${startTime}</div>
            <div class="event-title">${event.summary || 'No title'}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="day-column ${isToday ? 'today' : ''}">
          ${eventsHtml || '<div class="no-events"></div>'}
        </div>
      `;
    }).join('');

    return `
      <div class="calendar-view view-week">
        <div class="week-header">${dayHeaders}</div>
        <div class="week-body">${dayColumns}</div>
      </div>
    `;
  }

  renderAgendaView(events, display) {
    const now = new Date();

    // Filter to upcoming events only
    const upcomingEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= now;
    }).slice(0, 20); // Limit to 20 events

    if (upcomingEvents.length === 0) {
      return `
        <div class="calendar-view view-agenda">
          <div class="no-events-message">
            <ha-icon icon="mdi:calendar-check"></ha-icon>
            <p>No upcoming events</p>
          </div>
        </div>
      `;
    }

    // Group by date
    const eventsByDate = {};
    upcomingEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const dateKey = eventStart.toDateString();
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });

    const agendaHtml = Object.entries(eventsByDate).map(([dateStr, dayEvents]) => {
      const date = new Date(dateStr);
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

      let dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (isToday) dateLabel = 'Today';
      if (isTomorrow) dateLabel = 'Tomorrow';

      const eventsHtml = dayEvents.map(event => {
        const startTime = this.formatEventTime(event.start, display);
        const endTime = this.formatEventTime(event.end, display);
        return `
          <div class="agenda-event" style="border-left: 4px solid ${event.calendar_color};">
            <div class="agenda-event-time">${startTime} - ${endTime}</div>
            <div class="agenda-event-title">${event.summary || 'No title'}</div>
            <div class="agenda-event-calendar">${event.calendar_name}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="agenda-day">
          <div class="agenda-date ${isToday ? 'today' : ''}">${dateLabel}</div>
          ${eventsHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="calendar-view view-agenda">
        ${agendaHtml}
      </div>
    `;
  }

  formatEventTime(isoString, display) {
    if (!isoString) return '';
    const date = new Date(isoString);

    // Check if it's an all-day event (time is 00:00)
    if (date.getHours() === 0 && date.getMinutes() === 0) {
      return 'All day';
    }

    const timeFormat = display.time_format === '12h' ? 'en-US' : 'en-GB';
    const options = display.time_format === '12h'
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: '2-digit', minute: '2-digit', hour12: false };

    return date.toLocaleTimeString(timeFormat, options);
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
        const entityId = btn.dataset.entityId;
        this.toggleCalendar(entityId);
      });
    });

    // Add event button
    const addEventBtn = this.shadowRoot.querySelector('.add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this.openAddEventDialog();
      });
    }

    // Event click handlers
    const eventElements = this.shadowRoot.querySelectorAll('.event, .agenda-event');
    eventElements.forEach(el => {
      el.addEventListener('click', () => {
        // Could show event details in the future
      });
    });
  }

  toggleCalendar(entityId) {
    if (this._hiddenCalendars.has(entityId)) {
      this._hiddenCalendars.delete(entityId);
    } else {
      this._hiddenCalendars.add(entityId);
    }
    this.render();
  }

  openAddEventDialog() {
    // Get the first calendar entity to open its more-info dialog
    const entity = this._hass.states[this._config.entity];
    if (entity && entity.attributes.calendars && entity.attributes.calendars.length > 0) {
      const firstCalendar = entity.attributes.calendars[0];
      const calendarEntityId = firstCalendar.entity_id;

      // Fire an event to open the more-info dialog for the calendar
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: calendarEntityId }
      });
      this.dispatchEvent(event);
    }
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

        .calendar-toggle.inactive {
          opacity: 0.5;
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
          padding: 1rem;
          min-height: 400px;
          background: white;
        }

        .theme-dark .calendar-view {
          background: #1a1a1a;
          color: white;
        }

        /* Week View */
        .view-week {
          display: flex;
          flex-direction: column;
        }

        .week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .day-header {
          text-align: center;
          padding: 0.5rem;
        }

        .day-header.today {
          background: #4A90E2;
          color: white;
          border-radius: 8px;
        }

        .day-name {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          opacity: 0.7;
        }

        .day-num {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .week-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          flex: 1;
        }

        .day-column {
          min-height: 300px;
          background: #f9f9f9;
          border-radius: 8px;
          padding: 0.5rem;
          overflow-y: auto;
        }

        .theme-dark .day-column {
          background: #2a2a2a;
        }

        .day-column.today {
          background: #e3f2fd;
        }

        .theme-dark .day-column.today {
          background: #1e3a5f;
        }

        .event {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .event:hover {
          transform: translateX(2px);
        }

        .event-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .event-title {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Agenda View */
        .view-agenda {
          padding: 1rem;
        }

        .agenda-day {
          margin-bottom: 1.5rem;
        }

        .agenda-date {
          font-size: 1rem;
          font-weight: bold;
          padding: 0.5rem 0;
          border-bottom: 2px solid #e0e0e0;
          margin-bottom: 0.75rem;
        }

        .agenda-date.today {
          color: #4A90E2;
          border-color: #4A90E2;
        }

        .agenda-event {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: #f5f5f5;
          border-radius: 8px;
          cursor: pointer;
        }

        .theme-dark .agenda-event {
          background: #2a2a2a;
        }

        .agenda-event:hover {
          transform: translateX(4px);
        }

        .agenda-event-time {
          font-size: 0.85rem;
          color: #666;
        }

        .theme-dark .agenda-event-time {
          color: #aaa;
        }

        .agenda-event-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0.25rem 0;
        }

        .agenda-event-calendar {
          font-size: 0.8rem;
          color: #999;
        }

        .no-events-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #999;
        }

        .no-events-message ha-icon {
          --mdc-icon-size: 48px;
          margin-bottom: 1rem;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }

        .no-calendars {
          padding: 1rem;
          text-align: center;
          color: #999;
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

          .week-header, .week-body {
            grid-template-columns: repeat(3, 1fr);
          }

          .day-column {
            min-height: 200px;
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
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this.render();
    }
    // Update entity picker if it exists
    const entityPicker = this.querySelector('ha-entity-picker');
    if (entityPicker) {
      entityPicker.hass = hass;
    }
  }

  setConfig(config) {
    this._config = config || {};
    this.render();
  }

  render() {
    if (!this._hass) {
      return;
    }

    this._rendered = true;
    const entity = this._config.entity || 'sensor.planavista_config';

    this.innerHTML = `
      <style>
        .card-config {
          padding: 16px;
        }
        .card-config ha-entity-picker {
          display: block;
          margin-bottom: 16px;
        }
        .hint {
          color: var(--secondary-text-color);
          font-size: 12px;
          margin-top: 8px;
        }
      </style>
      <div class="card-config">
        <ha-entity-picker
          label="Entity (Required)"
          allow-custom-entity
        ></ha-entity-picker>
        <div class="hint">Select your PlanaVista config sensor (usually sensor.planavista_config)</div>
      </div>
    `;

    // Set up the entity picker after DOM is ready
    this._setupEntityPicker(entity);
  }

  _setupEntityPicker(entity) {
    const entityPicker = this.querySelector('ha-entity-picker');
    if (!entityPicker) {
      return;
    }

    // Set properties directly on the element
    entityPicker.hass = this._hass;
    entityPicker.value = entity;
    entityPicker.includeDomains = ['sensor'];

    // Listen for changes
    entityPicker.addEventListener('value-changed', (ev) => {
      const newValue = ev.detail?.value;
      if (newValue && newValue !== this._config.entity) {
        this._config = { ...this._config, entity: newValue };
        this._fireConfigChanged();
      }
    });
  }

  _fireConfigChanged() {
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
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
