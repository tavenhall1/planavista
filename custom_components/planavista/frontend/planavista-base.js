/**
 * PlanaVista Base Module
 * Shared utilities, theming, and state management for all PlanaVista cards
 *
 * Version: 0.2.0
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
  `%c PLANAVISTA-BASE %c v0.2.0 `,
  'color: white; background: #667eea; font-weight: bold;',
  'color: #667eea; background: white; font-weight: bold;'
);
