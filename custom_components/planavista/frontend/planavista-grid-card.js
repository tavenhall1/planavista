/**
 * PlanaVista Grid Card
 * Calendar grid display (week/month/day views)
 * This is the focused calendar grid component - no header, no toggles
 *
 * Version: 0.2.1
 */

class PlanaVistaGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._stateManager = null;
    this._resizeObserver = null;
    this._isMobileView = false;
    this._cardWidth = 0;
  }

  connectedCallback() {
    if (window.PlanaVistaBase) {
      this._stateManager = window.PlanaVistaBase.StateManager.getInstance();
      this._unsubscribe = this._stateManager.subscribe(() => this.render());
    }

    // Set up ResizeObserver for responsive behavior
    this._resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const wasMobile = this._isMobileView;
        this._cardWidth = width;
        this._isMobileView = width < 500; // Threshold for mobile view

        if (wasMobile !== this._isMobileView) {
          this.render();
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
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
    const mobileMode = this._config.mobile_mode || 'stack';

    // Determine if we should use mobile view
    const useMobileView = this._isMobileView && view === 'week';

    let content;
    if (useMobileView) {
      content = this.renderMobileView(mobileMode, firstDay, timeFormat);
    } else {
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

        /* Week view responsive - desktop */
        .week-grid .grid-header,
        .week-grid .grid-body {
          grid-template-columns: repeat(7, 1fr);
        }

        /* Mobile Stack View */
        .mobile-stack .grid-header,
        .mobile-stack .grid-body {
          grid-template-columns: 1fr;
        }

        .mobile-stack .day-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--pv-event-bg);
          border-radius: 8px 8px 0 0;
          margin-bottom: 0;
        }

        .mobile-stack .day-header.today {
          background: var(--pv-accent);
        }

        .mobile-stack .day-header .day-name {
          font-size: 0.9rem;
        }

        .mobile-stack .day-header .day-num {
          font-size: 1rem;
        }

        .mobile-stack .day-column {
          min-height: auto;
          border-radius: 0 0 8px 8px;
          margin-bottom: 1rem;
        }

        .mobile-stack .day-section {
          margin-bottom: 0.5rem;
        }

        /* Mobile Fewer Days View */
        .mobile-fewer .grid-header,
        .mobile-fewer .grid-body {
          grid-template-columns: repeat(3, 1fr);
        }

        .mobile-fewer .day-column {
          min-height: 180px;
        }

        /* Mobile Scroll View */
        .mobile-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-scroll .grid-header,
        .mobile-scroll .grid-body {
          display: flex;
          min-width: 700px;
        }

        .mobile-scroll .day-header,
        .mobile-scroll .day-column {
          flex: 1;
          min-width: 100px;
        }

        /* Mobile Agenda View */
        .mobile-agenda .agenda-day {
          margin-bottom: 1.5rem;
        }

        .mobile-agenda .agenda-date {
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.5rem 0;
          border-bottom: 2px solid var(--pv-border);
          margin-bottom: 0.75rem;
          color: var(--pv-text-secondary);
        }

        .mobile-agenda .agenda-date.today {
          color: var(--pv-accent);
          border-color: var(--pv-accent);
        }

        .mobile-agenda .agenda-event {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: var(--pv-event-bg);
          border-radius: 8px;
          cursor: pointer;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }
      </style>
      <ha-card>
        ${content}
      </ha-card>
    `;

    this.attachEventListeners();
  }

  renderMobileView(mobileMode, firstDay, timeFormat) {
    switch (mobileMode) {
      case 'agenda':
        return this.renderMobileAgendaView(firstDay, timeFormat);
      case 'fewer_days':
        return this.renderMobileFewerDaysView(firstDay, timeFormat);
      case 'scroll':
        return this.renderMobileScrollView(firstDay, timeFormat);
      case 'stack':
      default:
        return this.renderMobileStackView(firstDay, timeFormat);
    }
  }

  renderMobileStackView(firstDay, timeFormat) {
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

    const sections = days.map(day => {
      const dateKey = day.toISOString().split('T')[0];
      const dayEvents = eventsByDay[dateKey] || [];
      const isToday = PlanaVistaBase.isToday(day);

      const eventsHtml = dayEvents.length > 0 ? dayEvents.map(event => {
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
      }).join('') : '<div style="color: var(--pv-text-secondary); font-size: 0.85rem; padding: 0.5rem;">No events</div>';

      return `
        <div class="day-section">
          <div class="day-header ${isToday ? 'today' : ''}">
            <span class="day-name">${day.toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span class="day-num">${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div class="day-column ${isToday ? 'today' : ''}">
            ${eventsHtml}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="calendar-grid mobile-stack">
        ${sections}
      </div>
    `;
  }

  renderMobileAgendaView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const now = new Date();

    // Get events for the next 7 days
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    const upcomingEvents = this.visibleEvents
      .filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= now && eventStart <= endDate;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    if (upcomingEvents.length === 0) {
      return `
        <div class="calendar-grid mobile-agenda">
          <div class="no-events">
            <ha-icon icon="mdi:calendar-check"></ha-icon>
            <p>No upcoming events this week</p>
          </div>
        </div>
      `;
    }

    // Group by date
    const eventsByDate = PlanaVistaBase.groupEventsByDate(upcomingEvents);

    const agendaHtml = Object.entries(eventsByDate).map(([dateStr, dayEvents]) => {
      const date = new Date(dateStr);
      const isToday = PlanaVistaBase.isToday(date);
      const isTomorrow = PlanaVistaBase.isTomorrow(date);

      let dateLabel = PlanaVistaBase.formatDate(date, 'medium');
      if (isToday) dateLabel = 'Today';
      if (isTomorrow) dateLabel = 'Tomorrow';

      const eventsHtml = dayEvents.map(event => {
        const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
        return `
          <div class="agenda-event"
               style="border-left: 4px solid ${event.calendar_color};"
               data-calendar="${event.calendar_entity_id}">
            <div class="event-time">${startTime}</div>
            <div class="event-title">${event.summary || 'No title'}</div>
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
      <div class="calendar-grid mobile-agenda">
        ${agendaHtml}
      </div>
    `;
  }

  renderMobileFewerDaysView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const now = new Date();

    // Show today + next 2 days (3 days total)
    const days = [];
    for (let i = 0; i < 3; i++) {
      const day = new Date(now);
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
      <div class="calendar-grid mobile-fewer">
        <div class="grid-header">${headers}</div>
        <div class="grid-body">${columns}</div>
      </div>
    `;
  }

  renderMobileScrollView(firstDay, timeFormat) {
    // Use the standard week view but with horizontal scroll
    const weekContent = this.renderWeekView(firstDay, timeFormat);
    return weekContent.replace('week-grid', 'week-grid mobile-scroll');
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
    const events = this.shadowRoot.querySelectorAll('.event, .month-event, .agenda-event');
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
      mobile_mode: 'stack',
    };
  }
}

// Visual Card Editor
class PlanaVistaGridCardEditor extends HTMLElement {
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
  }

  render() {
    if (!this._hass) return;

    const view = this._config.view || 'week';
    const mobileMode = this._config.mobile_mode || 'stack';
    const firstDay = this._config.first_day || '';
    const timeFormat = this._config.time_format || '';
    const theme = this._config.theme || '';

    this.innerHTML = `
      <div class="card-config">
        <div class="config-row">
          <ha-selector
            .hass=${this._hass}
            .selector=${{ select: {
              options: [
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' }
              ],
              mode: 'dropdown'
            }}}
            .value=${view}
            .label=${'View'}
            @value-changed=${this._valueChanged}
            data-config="view"
          ></ha-selector>
        </div>

        <div class="config-row">
          <ha-selector
            .hass=${this._hass}
            .selector=${{ select: {
              options: [
                { value: 'stack', label: 'Stack Days (default)' },
                { value: 'agenda', label: 'Agenda List' },
                { value: 'fewer_days', label: 'Fewer Days (3)' },
                { value: 'scroll', label: 'Horizontal Scroll' }
              ],
              mode: 'dropdown'
            }}}
            .value=${mobileMode}
            .label=${'Mobile Mode'}
            @value-changed=${this._valueChanged}
            data-config="mobile_mode"
          ></ha-selector>
        </div>

        <div class="config-row">
          <ha-selector
            .hass=${this._hass}
            .selector=${{ select: {
              options: [
                { value: '', label: 'Use integration default' },
                { value: 'monday', label: 'Monday' },
                { value: 'sunday', label: 'Sunday' }
              ],
              mode: 'dropdown'
            }}}
            .value=${firstDay}
            .label=${'First Day of Week'}
            @value-changed=${this._valueChanged}
            data-config="first_day"
          ></ha-selector>
        </div>

        <div class="config-row">
          <ha-selector
            .hass=${this._hass}
            .selector=${{ select: {
              options: [
                { value: '', label: 'Use integration default' },
                { value: '12h', label: '12-hour (AM/PM)' },
                { value: '24h', label: '24-hour' }
              ],
              mode: 'dropdown'
            }}}
            .value=${timeFormat}
            .label=${'Time Format'}
            @value-changed=${this._valueChanged}
            data-config="time_format"
          ></ha-selector>
        </div>

        <div class="config-row">
          <ha-selector
            .hass=${this._hass}
            .selector=${{ select: {
              options: [
                { value: '', label: 'Use integration default' },
                { value: 'planavista', label: 'PlanaVista' },
                { value: 'minimal', label: 'Minimal' },
                { value: 'modern', label: 'Modern' },
                { value: 'dark', label: 'Dark' }
              ],
              mode: 'dropdown'
            }}}
            .value=${theme}
            .label=${'Theme'}
            @value-changed=${this._valueChanged}
            data-config="theme"
          ></ha-selector>
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
      </style>
    `;

    // Bind event handlers
    this.querySelectorAll('ha-selector').forEach(selector => {
      selector.addEventListener('value-changed', (e) => this._valueChanged(e));
    });
  }

  _valueChanged(ev) {
    if (!this._config) return;

    const target = ev.target;
    const configKey = target.dataset?.config || target.getAttribute('data-config');
    const value = ev.detail?.value;

    if (configKey && value !== undefined) {
      const newConfig = { ...this._config };
      if (value === '') {
        delete newConfig[configKey];
      } else {
        newConfig[configKey] = value;
      }

      const event = new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }
}

customElements.define('planavista-grid-card', PlanaVistaGridCard);
customElements.define('planavista-grid-card-editor', PlanaVistaGridCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-grid-card',
  name: 'PlanaVista Grid',
  description: 'Calendar grid with week/month/day views and mobile responsiveness',
  preview: true,
});

console.info(
  `%c PLANAVISTA-GRID %c v0.2.1 `,
  'color: white; background: #4A90E2; font-weight: bold;',
  'color: #4A90E2; background: white; font-weight: bold;'
);
