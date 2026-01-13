/**
 * PlanaVista Base Module
 * Shared utilities, theming, and state management for all PlanaVista cards
 *
 * Version: 0.2.1
 */

// ============================================================================
// SHARED STATE MANAGER
// ============================================================================

/**
 * Shared state manager for cross-card communication
 * Uses CustomEvents to sync state between cards
 */
class PlanaVistaStateManager {
  constructor() {
    this._hiddenCalendars = new Set();
    this._listeners = [];
  }

  static getInstance() {
    if (!window._planavistaState) {
      window._planavistaState = new PlanaVistaStateManager();
    }
    return window._planavistaState;
  }

  isCalendarHidden(entityId) {
    return this._hiddenCalendars.has(entityId);
  }

  toggleCalendar(entityId) {
    if (this._hiddenCalendars.has(entityId)) {
      this._hiddenCalendars.delete(entityId);
    } else {
      this._hiddenCalendars.add(entityId);
    }
    this._notifyListeners();
  }

  setCalendarVisible(entityId, visible) {
    if (visible) {
      this._hiddenCalendars.delete(entityId);
    } else {
      this._hiddenCalendars.add(entityId);
    }
    this._notifyListeners();
  }

  subscribe(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  _notifyListeners() {
    this._listeners.forEach(callback => callback());
    // Also dispatch a global event for cards that prefer event-based updates
    window.dispatchEvent(new CustomEvent('planavista-state-changed', {
      detail: { hiddenCalendars: Array.from(this._hiddenCalendars) }
    }));
  }
}

// ============================================================================
// ADD EVENT DIALOG
// ============================================================================

/**
 * Custom dialog for adding events to PlanaVista calendars
 */
class PlanaVistaAddEventDialog {
  constructor(hass, calendars) {
    this._hass = hass;
    this._calendars = calendars;
    this._dialog = null;
  }

  show() {
    // Remove any existing dialog
    this.close();

    // Create dialog element
    this._dialog = document.createElement('div');
    this._dialog.className = 'planavista-add-event-dialog';
    this._dialog.innerHTML = this._getDialogHtml();

    // Add styles
    const style = document.createElement('style');
    style.textContent = this._getDialogStyles();
    this._dialog.appendChild(style);

    // Add to body
    document.body.appendChild(this._dialog);

    // Setup event listeners
    this._setupEventListeners();

    // Focus title input
    setTimeout(() => {
      const titleInput = this._dialog.querySelector('#event-title');
      if (titleInput) titleInput.focus();
    }, 100);
  }

  close() {
    if (this._dialog) {
      this._dialog.remove();
      this._dialog = null;
    }
  }

  _getDialogHtml() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(Math.ceil(now.getMinutes() / 15) * 15 % 60).padStart(2, '0')}`;

    // End time is 1 hour later
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(Math.ceil(endTime.getMinutes() / 15) * 15 % 60).padStart(2, '0')}`;

    const calendarOptions = this._calendars.map(cal => `
      <option value="${cal.entity_id}" style="color: ${cal.color}">
        ${cal.display_name}
      </option>
    `).join('');

    return `
      <div class="dialog-overlay"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>Add Event</h2>
          <button class="close-btn" aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label for="event-title">Event Title</label>
            <input type="text" id="event-title" placeholder="What's happening?" required>
          </div>

          <div class="form-group">
            <label for="event-calendar">Calendar</label>
            <select id="event-calendar">
              ${calendarOptions}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="event-date">Date</label>
              <input type="date" id="event-date" value="${dateStr}">
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" id="event-all-day">
                All day
              </label>
            </div>
          </div>

          <div class="form-row time-row" id="time-inputs">
            <div class="form-group">
              <label for="event-start-time">Start Time</label>
              <input type="time" id="event-start-time" value="${timeStr}">
            </div>
            <div class="form-group">
              <label for="event-end-time">End Time</label>
              <input type="time" id="event-end-time" value="${endTimeStr}">
            </div>
          </div>

          <div class="form-group">
            <label for="event-description">Description (optional)</label>
            <textarea id="event-description" rows="3" placeholder="Add details..."></textarea>
          </div>

          <div class="form-group">
            <label for="event-location">Location (optional)</label>
            <input type="text" id="event-location" placeholder="Add location...">
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-primary save-btn">Add Event</button>
        </div>
      </div>
    `;
  }

  _getDialogStyles() {
    return `
      .planavista-add-event-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
      }

      .dialog-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .dialog-content {
        position: relative;
        background: var(--card-background-color, white);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
        color: var(--primary-text-color, #333);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--secondary-text-color, #666);
        border-radius: 50%;
      }

      .close-btn:hover {
        background: var(--secondary-background-color, #f5f5f5);
      }

      .dialog-body {
        padding: 20px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group:last-child {
        margin-bottom: 0;
      }

      .form-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--secondary-text-color, #666);
        margin-bottom: 6px;
      }

      .form-group input[type="text"],
      .form-group input[type="date"],
      .form-group input[type="time"],
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        font-size: 1rem;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
        box-sizing: border-box;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color, #4A90E2);
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .form-row .form-group {
        flex: 1;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
      }

      .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        margin-bottom: 0;
        padding-top: 20px;
      }

      .checkbox-group input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .time-row {
        transition: opacity 0.2s, max-height 0.2s;
      }

      .time-row.hidden {
        opacity: 0.5;
        pointer-events: none;
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .btn-secondary {
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color, #333);
      }

      .btn-secondary:hover {
        background: var(--divider-color, #e0e0e0);
      }

      .btn-primary {
        background: var(--primary-color, #4A90E2);
        color: white;
      }

      .btn-primary:hover {
        filter: brightness(0.9);
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  _setupEventListeners() {
    // Close button
    this._dialog.querySelector('.close-btn').addEventListener('click', () => this.close());
    this._dialog.querySelector('.cancel-btn').addEventListener('click', () => this.close());

    // Overlay click to close
    this._dialog.querySelector('.dialog-overlay').addEventListener('click', () => this.close());

    // All day checkbox
    const allDayCheckbox = this._dialog.querySelector('#event-all-day');
    const timeInputs = this._dialog.querySelector('#time-inputs');
    allDayCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        timeInputs.classList.add('hidden');
      } else {
        timeInputs.classList.remove('hidden');
      }
    });

    // Save button
    this._dialog.querySelector('.save-btn').addEventListener('click', () => this._saveEvent());

    // Enter key to save
    this._dialog.querySelector('#event-title').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._saveEvent();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', this._escapeHandler);
  }

  _escapeHandler = (e) => {
    if (e.key === 'Escape') {
      this.close();
      document.removeEventListener('keydown', this._escapeHandler);
    }
  };

  async _saveEvent() {
    const title = this._dialog.querySelector('#event-title').value.trim();
    const calendarEntityId = this._dialog.querySelector('#event-calendar').value;
    const date = this._dialog.querySelector('#event-date').value;
    const isAllDay = this._dialog.querySelector('#event-all-day').checked;
    const startTime = this._dialog.querySelector('#event-start-time').value;
    const endTime = this._dialog.querySelector('#event-end-time').value;
    const description = this._dialog.querySelector('#event-description').value.trim();
    const location = this._dialog.querySelector('#event-location').value.trim();

    if (!title) {
      this._dialog.querySelector('#event-title').focus();
      return;
    }

    if (!calendarEntityId) {
      return;
    }

    const saveBtn = this._dialog.querySelector('.save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Adding...';

    try {
      const serviceData = {
        entity_id: calendarEntityId,
        summary: title,
      };

      if (isAllDay) {
        serviceData.start_date = date;
        serviceData.end_date = date;
      } else {
        serviceData.start_date_time = `${date}T${startTime}:00`;
        serviceData.end_date_time = `${date}T${endTime}:00`;
      }

      if (description) {
        serviceData.description = description;
      }

      if (location) {
        serviceData.location = location;
      }

      await this._hass.callService('calendar', 'create_event', serviceData);

      // Success - close dialog
      this.close();

      // Dispatch event to notify cards to refresh
      window.dispatchEvent(new CustomEvent('planavista-event-created'));

    } catch (error) {
      console.error('Failed to create event:', error);
      saveBtn.disabled = false;
      saveBtn.textContent = 'Add Event';
      // Show error (could be improved with a toast notification)
      alert('Failed to add event. Please try again.');
    }
  }
}

// ============================================================================
// THEME SYSTEM
// ============================================================================

const PLANAVISTA_THEMES = {
  planavista: {
    name: 'PlanaVista',
    headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerText: '#ffffff',
    background: '#ffffff',
    cardBackground: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#4A90E2',
    todayBg: '#e3f2fd',
    eventBg: '#f5f5f5',
  },
  minimal: {
    name: 'Minimal',
    headerGradient: '#f5f5f5',
    headerText: '#333333',
    background: '#ffffff',
    cardBackground: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#333333',
    todayBg: '#f0f0f0',
    eventBg: '#fafafa',
  },
  modern: {
    name: 'Modern',
    headerGradient: 'linear-gradient(135deg, #4A90E2 0%, #50C9C3 100%)',
    headerText: '#ffffff',
    background: '#ffffff',
    cardBackground: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#4A90E2',
    todayBg: '#e8f4f8',
    eventBg: '#f5f5f5',
  },
  dark: {
    name: 'Dark',
    headerGradient: '#1a1a1a',
    headerText: '#ffffff',
    background: '#121212',
    cardBackground: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#444444',
    accent: '#4A90E2',
    todayBg: '#1e3a5f',
    eventBg: '#2a2a2a',
  },
};

function getThemeStyles(themeName) {
  const theme = PLANAVISTA_THEMES[themeName] || PLANAVISTA_THEMES.planavista;
  return `
    --pv-header-gradient: ${theme.headerGradient};
    --pv-header-text: ${theme.headerText};
    --pv-background: ${theme.background};
    --pv-card-background: ${theme.cardBackground};
    --pv-text: ${theme.text};
    --pv-text-secondary: ${theme.textSecondary};
    --pv-border: ${theme.border};
    --pv-accent: ${theme.accent};
    --pv-today-bg: ${theme.todayBg};
    --pv-event-bg: ${theme.eventBg};
  `;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const WEATHER_ICONS = {
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
  'exceptional': '⚠️',
};

function getWeatherIcon(condition) {
  return WEATHER_ICONS[condition] || '☀️';
}

function formatTime(isoString, timeFormat = '12h') {
  if (!isoString) return '';
  const date = new Date(isoString);

  // Check if it's an all-day event (time is 00:00)
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return 'All day';
  }

  const locale = timeFormat === '12h' ? 'en-US' : 'en-GB';
  const options = timeFormat === '12h'
    ? { hour: 'numeric', minute: '2-digit', hour12: true }
    : { hour: '2-digit', minute: '2-digit', hour12: false };

  return date.toLocaleTimeString(locale, options);
}

function formatDate(date, format = 'long') {
  const formats = {
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    medium: { weekday: 'short', month: 'short', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
    weekday: { weekday: 'long' },
    dayNum: { day: 'numeric' },
  };
  return date.toLocaleDateString('en-US', formats[format] || formats.long);
}

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function getStartOfWeek(date, firstDay = 'monday') {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = firstDay === 'monday'
    ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
    : -dayOfWeek;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupEventsByDate(events) {
  const groups = {};
  events.forEach(event => {
    const eventStart = new Date(event.start);
    const dateKey = eventStart.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  });
  return groups;
}

// ============================================================================
// BASE CARD CLASS
// ============================================================================

/**
 * Base class for all PlanaVista cards
 * Provides common functionality and state management
 */
class PlanaVistaCardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._stateManager = PlanaVistaStateManager.getInstance();
    this._unsubscribe = null;
  }

  connectedCallback() {
    // Subscribe to state changes
    this._unsubscribe = this._stateManager.subscribe(() => this.render());
    // Also listen for global state events
    window.addEventListener('planavista-state-changed', this._handleStateChange);
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    window.removeEventListener('planavista-state-changed', this._handleStateChange);
  }

  _handleStateChange = () => {
    this.render();
  };

  setConfig(config) {
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
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
    return this.display.theme || 'planavista';
  }

  get visibleEvents() {
    return this.events.filter(event =>
      !this._stateManager.isCalendarHidden(event.calendar_entity_id)
    );
  }

  getBaseStyles() {
    return `
      :host {
        display: block;
        ${getThemeStyles(this.theme)}
      }

      ha-card {
        background: var(--pv-card-background);
        color: var(--pv-text);
        overflow: hidden;
      }

      .error {
        padding: 2rem;
        color: #d32f2f;
        text-align: center;
      }
    `;
  }

  render() {
    // Override in subclass
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export to window for use by other card files
window.PlanaVistaBase = {
  StateManager: PlanaVistaStateManager,
  CardBase: PlanaVistaCardBase,
  AddEventDialog: PlanaVistaAddEventDialog,
  themes: PLANAVISTA_THEMES,
  getThemeStyles,
  getWeatherIcon,
  formatTime,
  formatDate,
  isToday,
  isTomorrow,
  getStartOfWeek,
  groupEventsByDate,
};

console.info(
  `%c PLANAVISTA-BASE %c v0.2.1 `,
  'color: white; background: #667eea; font-weight: bold;',
  'color: #667eea; background: white; font-weight: bold;'
);
