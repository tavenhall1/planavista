/**
 * PlanaVista Grid Card
 * Calendar grid display (week/month/day views)
 * This is the focused calendar grid component - no header, no toggles
 *
 * Version: 0.2.0
 */

class PlanaVistaGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._stateManager = null;
  }

  connectedCallback() {
    if (window.PlanaVistaBase) {
      this._stateManager = window.PlanaVistaBase.StateManager.getInstance();
      this._unsubscribe = this._stateManager.subscribe(() => this.render());
    }
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
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
    const view = this._config.view || 'week';
    return view === 'month' ? 8 : 6;
  }

  get entity() {
    const entityId = this._config.entity || 'sensor.planavista_config';
    return this._hass?.states?.[entityId];
  }

  get calendars() {
    return this.entity?.attributes?.calendars || [];
  }

  get events() {
    return this.entity?.attributes?.events || [];
  }

  get display() {
    return this.entity?.attributes?.display || {};
  }

  get theme() {
    return this._config.theme || this.display.theme || 'planavista';
  }

  get visibleEvents() {
    if (!this._stateManager) {
      this._stateManager = window.PlanaVistaBase?.StateManager.getInstance();
    }
    return this.events.filter(event =>
      !this._stateManager?.isCalendarHidden(event.calendar_entity_id)
    );
  }

  render() {
    if (!this._hass) return;

    const { PlanaVistaBase } = window;
    if (!PlanaVistaBase) {
      this.shadowRoot.innerHTML = '<ha-card><div class="error">PlanaVista base module not loaded</div></ha-card>';
      return;
    }

    if (!this._stateManager) {
      this._stateManager = PlanaVistaBase.StateManager.getInstance();
    }

    const view = this._config.view || this.display.default_view || 'week';
    const firstDay = this._config.first_day || this.display.first_day || 'monday';
    const timeFormat = this._config.time_format || this.display.time_format || '12h';

    let content;
    switch (view) {
      case 'day':
        content = this.renderDayView(timeFormat);
        break;
      case 'month':
        content = this.renderMonthView(firstDay, timeFormat);
        break;
      case 'week':
      default:
        content = this.renderWeekView(firstDay, timeFormat);
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: var(--pv-card-background);
          color: var(--pv-text);
          overflow: hidden;
        }

        .calendar-grid {
          padding: 1rem;
          min-height: 350px;
        }

        /* Week/Month Header */
        .grid-header {
          display: grid;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .day-header {
          text-align: center;
          padding: 0.5rem;
        }

        .day-header.today {
          background: var(--pv-accent);
          color: white;
          border-radius: 8px;
        }

        .day-name {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.7;
          letter-spacing: 0.5px;
        }

        .day-num {
          display: block;
          font-size: 1.2rem;
          font-weight: 600;
        }

        /* Grid Body */
        .grid-body {
          display: grid;
          gap: 0.5rem;
        }

        .day-column {
          min-height: 250px;
          background: var(--pv-event-bg);
          border-radius: 8px;
          padding: 0.5rem;
          overflow-y: auto;
        }

        .day-column.today {
          background: var(--pv-today-bg);
        }

        /* Events */
        .event {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s;
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

        /* Month View Specific */
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .month-day {
          min-height: 80px;
          background: var(--pv-event-bg);
          padding: 0.25rem;
          font-size: 0.8rem;
        }

        .month-day.today {
          background: var(--pv-today-bg);
        }

        .month-day.other-month {
          opacity: 0.4;
        }

        .month-day-num {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .month-event {
          font-size: 0.7rem;
          padding: 2px 4px;
          margin-bottom: 2px;
          border-radius: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .month-more {
          font-size: 0.7rem;
          color: var(--pv-text-secondary);
          padding: 2px 4px;
        }

        /* Day View Specific */
        .day-view {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .day-view-header {
          font-size: 1.5rem;
          font-weight: 600;
          padding: 0.5rem 0;
          border-bottom: 2px solid var(--pv-border);
        }

        .day-view-header.today {
          color: var(--pv-accent);
          border-color: var(--pv-accent);
        }

        .hour-row {
          display: flex;
          min-height: 60px;
          border-bottom: 1px solid var(--pv-border);
        }

        .hour-label {
          width: 60px;
          font-size: 0.8rem;
          color: var(--pv-text-secondary);
          padding: 0.25rem;
        }

        .hour-events {
          flex: 1;
          padding: 0.25rem;
        }

        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--pv-text-secondary);
        }

        .no-events ha-icon {
          --mdc-icon-size: 48px;
          margin-bottom: 0.5rem;
        }

        /* Week view responsive */
        .week-grid .grid-header,
        .week-grid .grid-body {
          grid-template-columns: repeat(7, 1fr);
        }

        @media (max-width: 768px) {
          .week-grid .grid-header,
          .week-grid .grid-body {
            grid-template-columns: repeat(3, 1fr);
          }

          .day-column {
            min-height: 150px;
          }
        }
      </style>
      <ha-card>
        ${content}
      </ha-card>
    `;

    this.attachEventListeners();
  }

  renderWeekView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const now = new Date();
    const startOfWeek = PlanaVistaBase.getStartOfWeek(now, firstDay);

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

    this.visibleEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const dateKey = eventStart.toISOString().split('T')[0];
      if (eventsByDay[dateKey]) {
        eventsByDay[dateKey].push(event);
      }
    });

    const headers = days.map(day => {
      const isToday = PlanaVistaBase.isToday(day);
      return `
        <div class="day-header ${isToday ? 'today' : ''}">
          <span class="day-name">${day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span class="day-num">${day.getDate()}</span>
        </div>
      `;
    }).join('');

    const columns = days.map(day => {
      const dateKey = day.toISOString().split('T')[0];
      const dayEvents = eventsByDay[dateKey] || [];
      const isToday = PlanaVistaBase.isToday(day);

      const eventsHtml = dayEvents.map(event => {
        const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
        return `
          <div class="event"
               style="background-color: ${event.calendar_color}20; border-left: 3px solid ${event.calendar_color};"
               data-event-id="${event.uid || ''}"
               data-calendar="${event.calendar_entity_id}">
            <div class="event-time">${startTime}</div>
            <div class="event-title">${event.summary || 'No title'}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="day-column ${isToday ? 'today' : ''}">
          ${eventsHtml || ''}
        </div>
      `;
    }).join('');

    return `
      <div class="calendar-grid week-grid">
        <div class="grid-header">${headers}</div>
        <div class="grid-body">${columns}</div>
      </div>
    `;
  }

  renderMonthView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // First day of month
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Start from the week containing the first of the month
    const startDate = PlanaVistaBase.getStartOfWeek(firstOfMonth, firstDay);

    // Generate 6 weeks (42 days)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    // Group events by day
    const eventsByDay = {};
    this.visibleEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const dateKey = eventStart.toISOString().split('T')[0];
      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }
      eventsByDay[dateKey].push(event);
    });

    // Day name headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (firstDay === 'monday') {
      dayNames.push(dayNames.shift());
    }
    const headerHtml = dayNames.map(name =>
      `<div class="day-header"><span class="day-name">${name}</span></div>`
    ).join('');

    // Day cells
    const cellsHtml = days.map(day => {
      const dateKey = day.toISOString().split('T')[0];
      const dayEvents = eventsByDay[dateKey] || [];
      const isToday = PlanaVistaBase.isToday(day);
      const isOtherMonth = day.getMonth() !== month;

      const eventsHtml = dayEvents.slice(0, 3).map(event =>
        `<div class="month-event" style="background-color: ${event.calendar_color}40; color: ${event.calendar_color};">
          ${event.summary || 'No title'}
        </div>`
      ).join('');

      const moreCount = dayEvents.length - 3;
      const moreHtml = moreCount > 0 ? `<div class="month-more">+${moreCount} more</div>` : '';

      return `
        <div class="month-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}">
          <div class="month-day-num">${day.getDate()}</div>
          ${eventsHtml}
          ${moreHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="calendar-grid">
        <div class="month-grid">
          ${headerHtml}
          ${cellsHtml}
        </div>
      </div>
    `;
  }

  renderDayView(timeFormat) {
    const { PlanaVistaBase } = window;
    const now = new Date();
    const isToday = PlanaVistaBase.isToday(now);
    const dateStr = PlanaVistaBase.formatDate(now, 'long');

    // Filter to today's events
    const todayKey = now.toISOString().split('T')[0];
    const todayEvents = this.visibleEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.toISOString().split('T')[0] === todayKey;
    });

    // Group by hour
    const eventsByHour = {};
    todayEvents.forEach(event => {
      const eventStart = new Date(event.start);
      const hour = eventStart.getHours();
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push(event);
    });

    // Render hours 6am to 10pm
    let hoursHtml = '';
    for (let hour = 6; hour <= 22; hour++) {
      const hourEvents = eventsByHour[hour] || [];
      const hourLabel = timeFormat === '12h'
        ? `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`
        : `${hour.toString().padStart(2, '0')}:00`;

      const eventsHtml = hourEvents.map(event => `
        <div class="event"
             style="background-color: ${event.calendar_color}20; border-left: 3px solid ${event.calendar_color};"
             data-event-id="${event.uid || ''}"
             data-calendar="${event.calendar_entity_id}">
          <div class="event-title">${event.summary || 'No title'}</div>
        </div>
      `).join('');

      hoursHtml += `
        <div class="hour-row">
          <div class="hour-label">${hourLabel}</div>
          <div class="hour-events">${eventsHtml}</div>
        </div>
      `;
    }

    return `
      <div class="calendar-grid day-view">
        <div class="day-view-header ${isToday ? 'today' : ''}">${dateStr}</div>
        ${hoursHtml}
      </div>
    `;
  }

  attachEventListeners() {
    const events = this.shadowRoot.querySelectorAll('.event, .month-event');
    events.forEach(el => {
      el.addEventListener('click', () => {
        const calendarId = el.dataset.calendar;
        if (calendarId) {
          const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: calendarId }
          });
          this.dispatchEvent(event);
        }
      });
    });
  }

  static getConfigElement() {
    return document.createElement('planavista-grid-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      view: 'week',
    };
  }
}

class PlanaVistaGridCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  set hass(hass) { this._hass = hass; }
  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p><strong>PlanaVista Grid</strong></p>
        <p style="color: var(--secondary-text-color); font-size: 12px;">
          Options: entity, view (day/week/month), first_day (monday/sunday), time_format (12h/24h), theme
        </p>
      </div>
    `;
  }
}

customElements.define('planavista-grid-card', PlanaVistaGridCard);
customElements.define('planavista-grid-card-editor', PlanaVistaGridCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-grid-card',
  name: 'PlanaVista Grid',
  description: 'Calendar grid with week/month/day views',
  preview: true,
});

console.info(
  `%c PLANAVISTA-GRID %c v0.2.0 `,
  'color: white; background: #4A90E2; font-weight: bold;',
  'color: #4A90E2; background: white; font-weight: bold;'
);
