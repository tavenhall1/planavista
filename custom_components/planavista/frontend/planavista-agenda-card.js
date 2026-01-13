/**
 * PlanaVista Agenda Card
 * Upcoming events list grouped by date
 *
 * Version: 0.2.0
 */

class PlanaVistaAgendaCard extends HTMLElement {
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
    return 4;
  }

  get entity() {
    const entityId = this._config.entity || 'sensor.planavista_config';
    return this._hass?.states?.[entityId];
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

    const now = new Date();
    const maxEvents = this._config.max_events || 20;
    const daysAhead = this._config.days_ahead || 14;
    const showCalendarName = this._config.show_calendar_name !== false;
    const showEndTime = this._config.show_end_time !== false;
    const timeFormat = this._config.time_format || this.display.time_format || '12h';

    // Calculate cutoff date
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);

    // Filter and sort upcoming events
    const upcomingEvents = this.visibleEvents
      .filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= now && eventStart <= cutoff;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, maxEvents);

    if (upcomingEvents.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; ${PlanaVistaBase.getThemeStyles(this.theme)} }
          ha-card { background: var(--pv-card-background); color: var(--pv-text); padding: 1.5rem; }
          .no-events {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            color: var(--pv-text-secondary);
          }
          .no-events ha-icon { --mdc-icon-size: 48px; margin-bottom: 1rem; }
        </style>
        <ha-card>
          <div class="no-events">
            <ha-icon icon="mdi:calendar-check"></ha-icon>
            <p>No upcoming events</p>
          </div>
        </ha-card>
      `;
      return;
    }

    // Group events by date
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
        const endTime = showEndTime ? PlanaVistaBase.formatTime(event.end, timeFormat) : '';
        const timeDisplay = endTime && endTime !== 'All day'
          ? `${startTime} - ${endTime}`
          : startTime;

        return `
          <div class="agenda-event"
               style="border-left: 4px solid ${event.calendar_color};"
               data-calendar="${event.calendar_entity_id}">
            <div class="event-time">${timeDisplay}</div>
            <div class="event-title">${event.summary || 'No title'}</div>
            ${showCalendarName ? `<div class="event-calendar">${event.calendar_name}</div>` : ''}
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

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          ${PlanaVistaBase.getThemeStyles(this.theme)}
        }

        ha-card {
          background: var(--pv-card-background);
          color: var(--pv-text);
          padding: 1rem;
          max-height: ${this._config.max_height || '400px'};
          overflow-y: auto;
        }

        .agenda-day {
          margin-bottom: 1.5rem;
        }

        .agenda-day:last-child {
          margin-bottom: 0;
        }

        .agenda-date {
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.5rem 0;
          border-bottom: 2px solid var(--pv-border);
          margin-bottom: 0.75rem;
          color: var(--pv-text-secondary);
        }

        .agenda-date.today {
          color: var(--pv-accent);
          border-color: var(--pv-accent);
        }

        .agenda-event {
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          background: var(--pv-event-bg);
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .agenda-event:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .agenda-event:last-child {
          margin-bottom: 0;
        }

        .event-time {
          font-size: 0.85rem;
          color: var(--pv-text-secondary);
        }

        .event-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0.25rem 0;
        }

        .event-calendar {
          font-size: 0.8rem;
          color: var(--pv-text-secondary);
          opacity: 0.8;
        }

        .error {
          padding: 2rem;
          color: #d32f2f;
          text-align: center;
        }
      </style>
      <ha-card>
        ${agendaHtml}
      </ha-card>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const events = this.shadowRoot.querySelectorAll('.agenda-event');
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
    return document.createElement('planavista-agenda-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      max_events: 20,
      days_ahead: 14,
    };
  }
}

class PlanaVistaAgendaCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this.render(); }
  set hass(hass) { this._hass = hass; }
  render() {
    this.innerHTML = `
      <div style="padding: 16px;">
        <p><strong>PlanaVista Agenda Card</strong></p>
        <p style="color: var(--secondary-text-color); font-size: 12px;">
          Options: entity, max_events, days_ahead, max_height, show_calendar_name, show_end_time, time_format, theme
        </p>
      </div>
    `;
  }
}

customElements.define('planavista-agenda-card', PlanaVistaAgendaCard);
customElements.define('planavista-agenda-card-editor', PlanaVistaAgendaCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'planavista-agenda-card',
  name: 'PlanaVista Agenda',
  description: 'Upcoming events list grouped by date',
  preview: true,
});

console.info(
  `%c PLANAVISTA-AGENDA %c v0.2.0 `,
  'color: white; background: #fb8072; font-weight: bold;',
  'color: #fb8072; background: white; font-weight: bold;'
);
