/**
 * PlanaVista Grid Card
 * Calendar grid display with column-per-person day view
 * Inspired by Skylight/Hearth family calendar design
 *
 * Version: 0.4.0
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
    this._scrolled = false;
    this._currentDate = new Date(); // Track the currently displayed date
    this._selectedEvent = null; // Track selected event for popup
  }

  // Navigation methods
  _navigatePrevious() {
    const view = this._config.view || this.display.default_view || 'day';
    const newDate = new Date(this._currentDate);

    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }

    this._currentDate = newDate;
    this._scrolled = false;
    this.render();
  }

  _navigateNext() {
    const view = this._config.view || this.display.default_view || 'day';
    const newDate = new Date(this._currentDate);

    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }

    this._currentDate = newDate;
    this._scrolled = false;
    this.render();
  }

  _navigateToday() {
    this._currentDate = new Date();
    this._scrolled = false;
    this.render();
  }

  _isShowingToday() {
    const today = new Date();
    const view = this._config.view || this.display.default_view || 'day';

    if (view === 'day') {
      return this._currentDate.toDateString() === today.toDateString();
    } else if (view === 'week') {
      const { PlanaVistaBase } = window;
      const firstDay = this._config.first_day || this.display.first_day || 'monday';
      const currentWeekStart = PlanaVistaBase.getStartOfWeek(this._currentDate, firstDay);
      const todayWeekStart = PlanaVistaBase.getStartOfWeek(today, firstDay);
      return currentWeekStart.toDateString() === todayWeekStart.toDateString();
    } else if (view === 'month') {
      return this._currentDate.getMonth() === today.getMonth() &&
             this._currentDate.getFullYear() === today.getFullYear();
    }
    return false;
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
        this._isMobileView = width < 600;

        if (wasMobile !== this._isMobileView) {
          this.render();
        }
      }
    });
    this._resizeObserver.observe(this);

    // Update current time indicator every minute
    this._timeInterval = setInterval(() => {
      this._updateCurrentTimeIndicator();
    }, 60000);
  }

  disconnectedCallback() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    if (this._timeInterval) {
      clearInterval(this._timeInterval);
    }
  }

  setConfig(config) {
    this._config = config;
    this._scrolled = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getCardSize() {
    const view = this._config.view || 'day';
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

  get visibleCalendars() {
    if (!this._stateManager) {
      this._stateManager = window.PlanaVistaBase?.StateManager.getInstance();
    }
    return this.calendars.filter(cal =>
      !this._stateManager?.isCalendarHidden(cal.entity_id)
    );
  }

  get visibleEvents() {
    if (!this._stateManager) {
      this._stateManager = window.PlanaVistaBase?.StateManager.getInstance();
    }
    return this.events.filter(event =>
      !this._stateManager?.isCalendarHidden(event.calendar_entity_id)
    );
  }

  _updateCurrentTimeIndicator() {
    const indicator = this.shadowRoot?.querySelector('.current-time-indicator');
    if (indicator) {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const startHour = this._getVisibleStartHour();
      const hourHeight = 60;
      const topOffset = ((hour - startHour) * hourHeight) + ((minutes / 60) * hourHeight);
      indicator.style.top = `${topOffset}px`;
    }
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

    const view = this._config.view || this.display.default_view || 'day';
    const firstDay = this._config.first_day || this.display.first_day || 'monday';
    const timeFormat = this._config.time_format || this.display.time_format || '12h';

    let content;
    if (this._isMobileView && view === 'day') {
      content = this.renderMobileDayView(timeFormat);
    } else {
      switch (view) {
        case 'day':
          content = this.renderColumnDayView(timeFormat);
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
        ${this.getStyles(PlanaVistaBase)}
      </style>
      <ha-card>
        ${content}
      </ha-card>
    `;

    this.attachEventListeners();

    // Auto-scroll to current time on initial render
    if (!this._scrolled && view === 'day') {
      setTimeout(() => this.scrollToCurrentTime(), 100);
      this._scrolled = true;
    }
  }

  getStyles(PlanaVistaBase) {
    return `
      :host {
        display: block;
        ${PlanaVistaBase.getThemeStyles(this.theme)}
      }

      ha-card {
        background: var(--pv-card-background);
        color: var(--pv-text);
        overflow: hidden;
      }

      /* ============================================
         COLUMN DAY VIEW STYLES
         ============================================ */

      .day-view-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      /* Person Header Row */
      .person-header {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        background: var(--pv-card-background);
        position: sticky;
        top: 0;
        z-index: 8;
      }

      .time-column-spacer {
        width: 60px;
        min-width: 60px;
        border-right: 1px solid var(--pv-border);
      }

      .person-columns-header {
        display: flex;
        flex: 1;
      }

      .person-column-header {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem 0.5rem;
        cursor: pointer;
        transition: opacity 0.3s ease, background 0.2s ease;
      }

      .person-column-header:hover {
        background: var(--pv-event-bg);
      }

      .person-column-header.inactive {
        opacity: 0.4;
      }

      .person-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--calendar-color, var(--pv-accent));
        margin-bottom: 0.5rem;
        transition: transform 0.2s ease;
      }

      .person-column-header:hover .person-avatar {
        transform: scale(1.05);
      }

      .person-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--calendar-color, var(--pv-accent));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
        color: white;
      }

      .person-icon ha-icon {
        --mdc-icon-size: 28px;
      }

      .person-name {
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
        color: var(--pv-text);
      }

      /* All-Day Events Section */
      .all-day-section {
        display: flex;
        border-bottom: 1px solid var(--pv-border);
        background: var(--pv-event-bg);
        min-height: 40px;
      }

      .all-day-label {
        width: 60px;
        min-width: 60px;
        font-size: 0.7rem;
        color: var(--pv-text-secondary);
        padding: 0.5rem 0.25rem;
        text-align: center;
        border-right: 1px solid var(--pv-border);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .all-day-columns {
        display: flex;
        flex: 1;
      }

      .all-day-column {
        flex: 1;
        padding: 0.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .all-day-event {
        padding: 0.35rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      /* Time Grid */
      .time-grid-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
      }

      .time-grid {
        display: flex;
        position: relative;
      }

      .time-column {
        width: 60px;
        min-width: 60px;
        border-right: 1px solid var(--pv-border);
      }

      .hour-label {
        height: 60px;
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        padding: 0.25rem;
        text-align: right;
        padding-right: 0.5rem;
        box-sizing: border-box;
        border-bottom: 1px solid #e8e8e8;
      }

      .event-columns {
        display: flex;
        flex: 1;
        position: relative;
      }

      .event-column {
        flex: 1;
        position: relative;
      }

      .hour-grid-line {
        height: 60px;
        border-bottom: 1px solid #e8e8e8;
        box-sizing: border-box;
      }

      /* Positioned Events */
      .positioned-event {
        position: absolute;
        left: 4px;
        right: 4px;
        border-radius: 6px;
        padding: 0.35rem 0.5rem;
        font-size: 0.8rem;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        z-index: 1;
      }

      .positioned-event:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2;
      }

      .positioned-event .event-title {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .positioned-event .event-time {
        font-size: 0.7rem;
        opacity: 0.85;
        margin-top: 2px;
      }

      /* Event with person avatars (for multi-person events) */
      .positioned-event .event-attendees {
        display: flex;
        gap: 2px;
        margin-top: 4px;
      }

      .positioned-event .mini-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid white;
      }

      /* Current Time Indicator */
      .current-time-indicator {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: #333;
        z-index: 5;
        pointer-events: none;
      }

      .current-time-indicator::before {
        content: '';
        position: absolute;
        left: -5px;
        top: -4px;
        width: 10px;
        height: 10px;
        background: #333;
        border-radius: 50%;
      }

      /* View Navigation */
      .view-navigation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--pv-border);
        background: var(--pv-card-background);
        position: relative;
        z-index: 5;
      }

      .nav-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-arrow {
        background: transparent;
        border: none;
        padding: 0.4rem;
        border-radius: 50%;
        cursor: pointer;
        color: var(--pv-text);
        transition: background 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-arrow:hover {
        background: var(--pv-event-bg);
      }

      .nav-arrow ha-icon {
        --mdc-icon-size: 20px;
      }

      .nav-date {
        font-size: 1.1rem;
        font-weight: 600;
      }

      .nav-today-btn {
        background: transparent;
        border: 1px solid var(--pv-border);
        padding: 0.3rem 0.6rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        transition: all 0.2s ease;
        margin-left: 0.5rem;
      }

      .nav-today-btn:hover {
        background: var(--pv-event-bg);
        color: var(--pv-text);
      }

      .nav-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .nav-btn {
        background: var(--pv-event-bg);
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        color: var(--pv-text);
        transition: background 0.2s ease;
      }

      .nav-btn:hover {
        background: var(--pv-border);
      }

      .nav-btn.active {
        background: var(--pv-accent);
        color: white;
      }

      /* ============================================
         WEEK VIEW STYLES
         ============================================ */

      .week-view-container {
        display: flex;
        flex-direction: column;
      }

      .calendar-grid {
        padding: 1rem;
        min-height: 480px;
      }

      .grid-header {
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

      .grid-body {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        height: 100%;
      }

      .day-column {
        min-height: 420px;
        max-height: 480px;
        background: var(--pv-event-bg);
        border-radius: 8px;
        padding: 0.5rem;
        overflow-y: auto;
      }

      .day-column.today {
        background: var(--pv-today-bg);
      }

      /* Week/Month Events */
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

      /* ============================================
         MONTH VIEW STYLES
         ============================================ */

      .month-view-container {
        display: flex;
        flex-direction: column;
      }

      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .month-day {
        min-height: 90px;
        background: var(--pv-event-bg);
        padding: 0.35rem;
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
        cursor: pointer;
      }

      .month-more {
        font-size: 0.7rem;
        color: var(--pv-text-secondary);
        padding: 2px 4px;
      }

      /* Calendar Toggle Buttons (Week/Month views) */
      .calendar-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: none;
        border-radius: 50%;
        background: var(--pv-event-bg);
        cursor: pointer;
        transition: all 0.3s ease;
        width: 36px;
        height: 36px;
        position: relative;
        z-index: 1;
      }

      .calendar-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 2;
      }

      .calendar-toggle.inactive {
        opacity: 0.4;
      }

      .calendar-toggle img {
        border-radius: 50%;
      }

      /* ============================================
         MOBILE DAY VIEW
         ============================================ */

      .mobile-day-view {
        display: flex;
        flex-direction: column;
      }

      .mobile-person-tabs {
        display: flex;
        overflow-x: auto;
        border-bottom: 1px solid var(--pv-border);
        padding: 0.5rem;
        gap: 0.75rem;
        -webkit-overflow-scrolling: touch;
      }

      .mobile-person-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s ease, opacity 0.3s ease;
        min-width: 60px;
      }

      .mobile-person-tab.active {
        background: var(--pv-event-bg);
      }

      .mobile-person-tab.inactive {
        opacity: 0.4;
      }

      .mobile-person-tab .person-avatar {
        width: 40px;
        height: 40px;
        margin-bottom: 0.25rem;
      }

      .mobile-person-tab .person-name {
        font-size: 0.75rem;
      }

      .mobile-timeline {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
      }

      .mobile-event-card {
        display: flex;
        margin-bottom: 1rem;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .mobile-event-card:hover {
        transform: translateX(4px);
      }

      .mobile-event-time-block {
        width: 60px;
        min-width: 60px;
        padding: 0.75rem 0.5rem;
        text-align: center;
        color: white;
        font-weight: 600;
      }

      .mobile-event-content {
        flex: 1;
        padding: 0.75rem;
        background: var(--pv-event-bg);
      }

      .mobile-event-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .mobile-event-subtitle {
        font-size: 0.85rem;
        color: var(--pv-text-secondary);
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

      .error {
        padding: 2rem;
        color: #d32f2f;
        text-align: center;
      }

      /* ============================================
         NEW EVENT BUTTON
         ============================================ */

      .add-event-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        background: var(--pv-accent, #4A90E2);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .add-event-btn:hover {
        background: var(--pv-accent-hover, #357ABD);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
      }

      .add-event-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* ============================================
         EVENT DETAILS POPUP
         ============================================ */

      .event-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .event-popup {
        background: var(--pv-card-background, white);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        width: calc(100% - 2rem);
        max-height: 80vh;
        overflow: hidden;
        animation: slideUp 0.25s ease;
        z-index: 1001;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .event-popup-header {
        padding: 1.25rem;
        color: white;
        position: relative;
      }

      .event-popup-close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: background 0.2s ease;
      }

      .event-popup-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .event-popup-close ha-icon {
        --mdc-icon-size: 20px;
      }

      .event-popup-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        padding-right: 2rem;
      }

      .event-popup-calendar {
        font-size: 0.9rem;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .event-popup-calendar img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }

      .event-popup-body {
        padding: 1.25rem;
      }

      .event-popup-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .event-popup-row:last-child {
        margin-bottom: 0;
      }

      .event-popup-row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary);
        margin-top: 2px;
        flex-shrink: 0;
      }

      .event-popup-row-content {
        flex: 1;
      }

      .event-popup-label {
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
      }

      .event-popup-value {
        font-size: 0.95rem;
        color: var(--pv-text);
      }

      .event-popup-actions {
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--pv-border);
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }

      .event-popup-btn {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
      }

      .event-popup-btn.secondary {
        background: transparent;
        border: 1px solid var(--pv-border);
        color: var(--pv-text);
      }

      .event-popup-btn.secondary:hover {
        background: var(--pv-event-bg);
      }

      .event-popup-btn.primary {
        background: var(--pv-accent, #4A90E2);
        border: none;
        color: white;
      }

      .event-popup-btn.primary:hover {
        background: var(--pv-accent-hover, #357ABD);
      }
    `;
  }

  renderColumnDayView(timeFormat) {
    const { PlanaVistaBase } = window;
    const displayDate = this._currentDate;
    const now = new Date(); // Real current time for time indicator
    const displayDateKey = displayDate.toISOString().split('T')[0];
    const dateStr = PlanaVistaBase.formatDate(displayDate, 'long');
    const isToday = PlanaVistaBase.isToday(displayDate);
    const calendars = this.calendars;

    // Separate all-day events from timed events
    const allDayEvents = {};
    const timedEvents = {};

    calendars.forEach(cal => {
      allDayEvents[cal.entity_id] = [];
      timedEvents[cal.entity_id] = [];
    });

    this.visibleEvents.forEach(event => {
      const eventStart = new Date(event.start);
      if (eventStart.toISOString().split('T')[0] !== displayDateKey) return;

      const isAllDay = event.all_day ||
        (eventStart.getHours() === 0 && eventStart.getMinutes() === 0 &&
         new Date(event.end).getHours() === 0);

      if (isAllDay) {
        if (allDayEvents[event.calendar_entity_id]) {
          allDayEvents[event.calendar_entity_id].push(event);
        }
      } else {
        if (timedEvents[event.calendar_entity_id]) {
          timedEvents[event.calendar_entity_id].push(event);
        }
      }
    });

    // Check if there are any all-day events
    const hasAllDayEvents = Object.values(allDayEvents).some(events => events.length > 0);

    // Person header columns
    const personHeaders = calendars.map(cal => {
      const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" class="person-avatar" style="--calendar-color: ${cal.color}" alt="${cal.display_name}" />`;
        }
      }

      if (!avatar) {
        avatar = `
          <div class="person-icon" style="background: ${cal.color}">
            <ha-icon icon="${cal.icon || 'mdi:account'}"></ha-icon>
          </div>
        `;
      }

      return `
        <div class="person-column-header ${isHidden ? 'inactive' : ''}"
             data-entity-id="${cal.entity_id}"
             style="--calendar-color: ${cal.color}">
          ${avatar}
          <span class="person-name">${cal.display_name}</span>
        </div>
      `;
    }).join('');

    // All-day events section
    const allDaySectionHtml = hasAllDayEvents ? `
      <div class="all-day-section">
        <div class="all-day-label">All-day</div>
        <div class="all-day-columns">
          ${calendars.map(cal => {
            const events = allDayEvents[cal.entity_id] || [];
            const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
            if (isHidden) {
              return `<div class="all-day-column"></div>`;
            }
            return `
              <div class="all-day-column">
                ${events.map(event => `
                  <div class="all-day-event"
                       style="background: ${cal.color}; color: white;"
                       data-event-id="${event.uid || ''}"
                       data-calendar="${event.calendar_entity_id}">
                    ${event.summary || 'No title'}
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    // Get the 8-hour sliding window
    const viewStartHour = this._getVisibleStartHour();
    const viewEndHour = this._getVisibleEndHour();

    // Generate hour labels for the 8-hour window
    let hourLabels = '';
    for (let hour = viewStartHour; hour <= viewEndHour; hour++) {
      const displayHour = hour > 23 ? hour - 24 : hour; // Handle hours past midnight
      const hourLabel = timeFormat === '12h'
        ? `${displayHour % 12 || 12}${displayHour < 12 ? ' AM' : ' PM'}`
        : `${displayHour.toString().padStart(2, '0')}:00`;
      hourLabels += `<div class="hour-label">${hourLabel}</div>`;
    }

    // Generate event columns with positioned events
    const eventColumnsHtml = calendars.map(cal => {
      const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
      const calEvents = timedEvents[cal.entity_id] || [];

      // Generate hour grid lines for 8-hour window
      let gridLines = '';
      for (let hour = viewStartHour; hour <= viewEndHour; hour++) {
        gridLines += `<div class="hour-grid-line"></div>`;
      }

      // Position events within the visible window
      const eventsHtml = isHidden ? '' : calEvents.map(event => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        const startHour = startDate.getHours() + (startDate.getMinutes() / 60);
        const endHour = endDate.getHours() + (endDate.getMinutes() / 60);

        // Skip events completely outside the visible window
        if (endHour < viewStartHour || startHour > viewEndHour) {
          return '';
        }

        // Clip events to visible window
        const visibleStart = Math.max(startHour, viewStartHour);
        const visibleEnd = Math.min(endHour, viewEndHour);

        const startOffset = visibleStart - viewStartHour;
        const duration = visibleEnd - visibleStart;

        const top = startOffset * 60;
        const height = Math.max(duration * 60, 30); // Minimum 30px height

        const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
        const endTime = PlanaVistaBase.formatTime(event.end, timeFormat);

        return `
          <div class="positioned-event"
               style="top: ${top}px; height: ${height}px; background: ${cal.color}; color: white;"
               data-event-id="${event.uid || ''}"
               data-calendar="${event.calendar_entity_id}">
            <div class="event-title">${event.summary || 'No title'}</div>
            <div class="event-time">${startTime} - ${endTime}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="event-column" data-entity-id="${cal.entity_id}">
          ${gridLines}
          ${eventsHtml}
        </div>
      `;
    }).join('');

    // Current time indicator position (only show on today's view within visible window)
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const hourHeight = 60;
    const timeIndicatorTop = ((currentHour - viewStartHour) * hourHeight) + ((currentMinutes / 60) * hourHeight);
    const showTimeIndicator = isToday && currentHour >= viewStartHour && currentHour <= viewEndHour;

    return `
      <div class="day-view-container">
        <div class="view-navigation">
          <div class="nav-left">
            <button class="nav-arrow" data-nav="prev">
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <span class="nav-date">${dateStr}</span>
            <button class="nav-arrow" data-nav="next">
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            ${!isToday ? '<button class="nav-today-btn" data-nav="today">Today</button>' : ''}
          </div>
          <div class="nav-buttons">
            <button class="add-event-btn">
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>New Event</span>
            </button>
            <button class="nav-btn active" data-view="day">Day</button>
            <button class="nav-btn" data-view="week">Week</button>
            <button class="nav-btn" data-view="month">Month</button>
          </div>
        </div>

        <div class="person-header">
          <div class="time-column-spacer"></div>
          <div class="person-columns-header">
            ${personHeaders}
          </div>
        </div>

        ${allDaySectionHtml}

        <div class="time-grid-container">
          <div class="time-grid">
            <div class="time-column">
              ${hourLabels}
            </div>
            <div class="event-columns">
              ${eventColumnsHtml}
              ${showTimeIndicator ? `<div class="current-time-indicator" style="top: ${timeIndicatorTop}px"></div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMobileDayView(timeFormat) {
    const { PlanaVistaBase } = window;
    const displayDate = this._currentDate;
    const displayDateKey = displayDate.toISOString().split('T')[0];
    const dateStr = PlanaVistaBase.formatDate(displayDate, 'medium');
    const isToday = PlanaVistaBase.isToday(displayDate);
    const calendars = this.calendars;

    // Get day's events grouped by calendar
    const eventsByCalendar = {};
    calendars.forEach(cal => {
      eventsByCalendar[cal.entity_id] = [];
    });

    this.visibleEvents.forEach(event => {
      const eventStart = new Date(event.start);
      if (eventStart.toISOString().split('T')[0] !== displayDateKey) return;
      if (eventsByCalendar[event.calendar_entity_id]) {
        eventsByCalendar[event.calendar_entity_id].push(event);
      }
    });

    // Sort events by time
    Object.values(eventsByCalendar).forEach(events => {
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
    });

    // Person tabs
    const personTabs = calendars.map(cal => {
      const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" class="person-avatar" style="--calendar-color: ${cal.color}" alt="${cal.display_name}" />`;
        }
      }

      if (!avatar) {
        avatar = `
          <div class="person-icon" style="background: ${cal.color}; width: 40px; height: 40px;">
            <ha-icon icon="${cal.icon || 'mdi:account'}" style="--mdc-icon-size: 20px;"></ha-icon>
          </div>
        `;
      }

      return `
        <div class="mobile-person-tab ${isHidden ? 'inactive' : ''}"
             data-entity-id="${cal.entity_id}">
          ${avatar}
          <span class="person-name">${cal.display_name}</span>
        </div>
      `;
    }).join('');

    // Combined timeline of all visible events
    const allEvents = this.visibleEvents
      .filter(event => {
        const eventStart = new Date(event.start);
        return eventStart.toISOString().split('T')[0] === displayDateKey;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    let timelineHtml = '';
    if (allEvents.length === 0) {
      timelineHtml = `
        <div class="no-events">
          <ha-icon icon="mdi:calendar-check"></ha-icon>
          <p>No events${isToday ? ' today' : ''}</p>
        </div>
      `;
    } else {
      timelineHtml = allEvents.map(event => {
        const cal = calendars.find(c => c.entity_id === event.calendar_entity_id) || {};
        const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
        const endTime = PlanaVistaBase.formatTime(event.end, timeFormat);
        const isAllDay = event.all_day || startTime === 'All day';

        return `
          <div class="mobile-event-card"
               data-event-id="${event.uid || ''}"
               data-calendar="${event.calendar_entity_id}">
            <div class="mobile-event-time-block" style="background: ${cal.color || '#4A90E2'}">
              ${isAllDay ? 'ALL<br>DAY' : startTime.replace(' ', '<br>')}
            </div>
            <div class="mobile-event-content">
              <div class="mobile-event-title">${event.summary || 'No title'}</div>
              <div class="mobile-event-subtitle">
                ${cal.display_name || 'Calendar'}${!isAllDay ? ` • ${startTime} - ${endTime}` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    return `
      <div class="mobile-day-view">
        <div class="view-navigation">
          <div class="nav-left">
            <button class="nav-arrow" data-nav="prev">
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <span class="nav-date">${dateStr}</span>
            <button class="nav-arrow" data-nav="next">
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            ${!isToday ? '<button class="nav-today-btn" data-nav="today">Today</button>' : ''}
          </div>
          <div class="nav-buttons">
            <button class="add-event-btn">
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
            <button class="nav-btn active" data-view="day">Day</button>
            <button class="nav-btn" data-view="week">Week</button>
          </div>
        </div>

        <div class="mobile-person-tabs">
          ${personTabs}
        </div>

        <div class="mobile-timeline">
          ${timelineHtml}
        </div>
      </div>
    `;
  }

  renderWeekView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const startOfWeek = PlanaVistaBase.getStartOfWeek(this._currentDate, firstDay);
    const isCurrentWeek = this._isShowingToday();
    const calendars = this.calendars;

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

    // Person toggles at top
    const personToggles = calendars.map(cal => {
      const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${cal.color};" alt="${cal.display_name}" />`;
        }
      }

      if (!avatar) {
        avatar = `<ha-icon icon="${cal.icon || 'mdi:calendar'}" style="color: ${cal.color}; --mdc-icon-size: 20px;"></ha-icon>`;
      }

      return `
        <button class="calendar-toggle ${isHidden ? 'inactive' : ''}"
                data-entity-id="${cal.entity_id}"
                style="--cal-color: ${cal.color};">
          ${avatar}
        </button>
      `;
    }).join('');

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
        const cal = calendars.find(c => c.entity_id === event.calendar_entity_id) || {};
        const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
        return `
          <div class="event"
               style="background-color: ${event.calendar_color || cal.color}20; border-left: 3px solid ${event.calendar_color || cal.color};"
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
      <div class="week-view-container">
        <div class="view-navigation">
          <div class="nav-left">
            <button class="nav-arrow" data-nav="prev">
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <span class="nav-date">${PlanaVistaBase.formatDate(startOfWeek, 'short')} - ${PlanaVistaBase.formatDate(days[6], 'short')}</span>
            <button class="nav-arrow" data-nav="next">
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            ${!isCurrentWeek ? '<button class="nav-today-btn" data-nav="today">This Week</button>' : ''}
          </div>
          <div class="nav-buttons">
            <button class="add-event-btn">
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>New Event</span>
            </button>
            <button class="nav-btn" data-view="day">Day</button>
            <button class="nav-btn active" data-view="week">Week</button>
            <button class="nav-btn" data-view="month">Month</button>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--pv-border); z-index: 1; position: relative;">
          ${personToggles}
        </div>
        <div class="calendar-grid">
          <div class="grid-header">${headers}</div>
          <div class="grid-body">${columns}</div>
        </div>
      </div>
    `;
  }

  renderMonthView(firstDay, timeFormat) {
    const { PlanaVistaBase } = window;
    const displayDate = this._currentDate;
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const isCurrentMonth = this._isShowingToday();
    const calendars = this.calendars;

    // First day of month
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const monthName = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

    // Person toggles at top
    const personToggles = calendars.map(cal => {
      const isHidden = this._stateManager?.isCalendarHidden(cal.entity_id);
      const personEntity = cal.person_entity;
      let avatar = '';

      if (personEntity && this._hass.states[personEntity]) {
        const person = this._hass.states[personEntity];
        const picture = person.attributes.entity_picture;
        if (picture) {
          avatar = `<img src="${picture}" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${cal.color};" alt="${cal.display_name}" />`;
        }
      }

      if (!avatar) {
        avatar = `<ha-icon icon="${cal.icon || 'mdi:calendar'}" style="color: ${cal.color}; --mdc-icon-size: 20px;"></ha-icon>`;
      }

      return `
        <button class="calendar-toggle ${isHidden ? 'inactive' : ''}"
                data-entity-id="${cal.entity_id}"
                style="--cal-color: ${cal.color};">
          ${avatar}
        </button>
      `;
    }).join('');

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

      const eventsHtml = dayEvents.slice(0, 3).map(event => {
        const cal = calendars.find(c => c.entity_id === event.calendar_entity_id) || {};
        return `
          <div class="month-event"
               style="background-color: ${event.calendar_color || cal.color}40; color: ${event.calendar_color || cal.color};"
               data-event-id="${event.uid || ''}"
               data-calendar="${event.calendar_entity_id}">
            ${event.summary || 'No title'}
          </div>
        `;
      }).join('');

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
      <div class="month-view-container">
        <div class="view-navigation">
          <div class="nav-left">
            <button class="nav-arrow" data-nav="prev">
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <span class="nav-date">${monthName}</span>
            <button class="nav-arrow" data-nav="next">
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
            ${!isCurrentMonth ? '<button class="nav-today-btn" data-nav="today">This Month</button>' : ''}
          </div>
          <div class="nav-buttons">
            <button class="add-event-btn">
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>New Event</span>
            </button>
            <button class="nav-btn" data-view="day">Day</button>
            <button class="nav-btn" data-view="week">Week</button>
            <button class="nav-btn active" data-view="month">Month</button>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--pv-border); z-index: 1; position: relative;">
          ${personToggles}
        </div>
        <div class="calendar-grid">
          <div class="month-grid">
            ${headerHtml}
            ${cellsHtml}
          </div>
        </div>
      </div>
    `;
  }

  scrollToCurrentTime() {
    const container = this.shadowRoot?.querySelector('.time-grid-container');
    if (container) {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = this._getVisibleStartHour();
      const hourHeight = 60;

      // Scroll to current hour minus 1 hour to show some context
      const scrollTo = Math.max(0, ((currentHour - startHour) - 1) * hourHeight);
      container.scrollTop = scrollTo;
    }
  }

  // Calculate the 8-hour sliding window based on current time
  _getVisibleStartHour() {
    const now = new Date();
    const currentHour = now.getHours();

    // Define viewing windows
    // Morning: 6 AM - 2 PM (hours 6-14)
    // Afternoon: 10 AM - 6 PM (hours 10-18)
    // Evening: 2 PM - 10 PM (hours 14-22)
    // Night: 6 PM - 2 AM next day or static night view

    if (currentHour < 10) {
      // Early morning: show 6 AM - 2 PM
      return 6;
    } else if (currentHour < 14) {
      // Late morning: show 10 AM - 6 PM
      return 10;
    } else if (currentHour < 18) {
      // Afternoon: show 2 PM - 10 PM
      return 14;
    } else {
      // Evening: show 4 PM - 12 AM
      return 16;
    }
  }

  _getVisibleEndHour() {
    return this._getVisibleStartHour() + 8;
  }

  // Show event details popup
  _showEventDetails(event) {
    this._selectedEvent = event;
    this._renderEventPopup();
  }

  // Close event popup
  _closeEventPopup() {
    this._selectedEvent = null;
    const overlay = this.shadowRoot.querySelector('.event-popup-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // Render the event popup
  _renderEventPopup() {
    if (!this._selectedEvent) return;

    const { PlanaVistaBase } = window;
    const event = this._selectedEvent;
    const timeFormat = this._config.time_format || this.display.time_format || '12h';

    // Find the calendar info
    const calendar = this.calendars.find(c => c.entity_id === event.calendar_entity_id) || {};
    const calendarColor = event.calendar_color || calendar.color || '#4A90E2';

    // Get person avatar if available
    let personAvatar = '';
    if (calendar.person_entity && this._hass.states[calendar.person_entity]) {
      const person = this._hass.states[calendar.person_entity];
      const picture = person.attributes.entity_picture;
      if (picture) {
        personAvatar = `<img src="${picture}" alt="${calendar.display_name}" />`;
      }
    }

    // Format date and time
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const startTime = PlanaVistaBase.formatTime(event.start, timeFormat);
    const endTime = PlanaVistaBase.formatTime(event.end, timeFormat);
    const dateStr = PlanaVistaBase.formatDate(startDate, 'long');

    const isAllDay = event.all_day ||
      (startDate.getHours() === 0 && startDate.getMinutes() === 0 &&
       endDate.getHours() === 0 && endDate.getMinutes() === 0);

    const timeStr = isAllDay ? 'All Day' : `${startTime} - ${endTime}`;

    // Calculate duration
    let durationStr = '';
    if (!isAllDay) {
      const durationMs = endDate - startDate;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      if (durationHours > 0 && durationMins > 0) {
        durationStr = `${durationHours}h ${durationMins}m`;
      } else if (durationHours > 0) {
        durationStr = `${durationHours} hour${durationHours > 1 ? 's' : ''}`;
      } else {
        durationStr = `${durationMins} minutes`;
      }
    }

    // Description if available
    const descriptionHtml = event.description ? `
      <div class="event-popup-row">
        <ha-icon icon="mdi:text"></ha-icon>
        <div class="event-popup-row-content">
          <div class="event-popup-label">Description</div>
          <div class="event-popup-value">${event.description}</div>
        </div>
      </div>
    ` : '';

    // Location if available
    const locationHtml = event.location ? `
      <div class="event-popup-row">
        <ha-icon icon="mdi:map-marker"></ha-icon>
        <div class="event-popup-row-content">
          <div class="event-popup-label">Location</div>
          <div class="event-popup-value">${event.location}</div>
        </div>
      </div>
    ` : '';

    // Create popup HTML
    const popupHtml = `
      <div class="event-popup-overlay" data-action="close">
        <div class="event-popup" data-action="stop">
          <div class="event-popup-header" style="background: ${calendarColor}">
            <button class="event-popup-close" data-action="close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
            <div class="event-popup-title">${event.summary || 'No title'}</div>
            <div class="event-popup-calendar">
              ${personAvatar}
              <span>${calendar.display_name || 'Calendar'}</span>
            </div>
          </div>
          <div class="event-popup-body">
            <div class="event-popup-row">
              <ha-icon icon="mdi:calendar"></ha-icon>
              <div class="event-popup-row-content">
                <div class="event-popup-label">Date</div>
                <div class="event-popup-value">${dateStr}</div>
              </div>
            </div>
            <div class="event-popup-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="event-popup-row-content">
                <div class="event-popup-label">Time</div>
                <div class="event-popup-value">${timeStr}${durationStr ? ` (${durationStr})` : ''}</div>
              </div>
            </div>
            ${locationHtml}
            ${descriptionHtml}
          </div>
          <div class="event-popup-actions">
            <button class="event-popup-btn secondary" data-action="close">Close</button>
            <button class="event-popup-btn primary" data-action="open-calendar">
              <ha-icon icon="mdi:calendar"></ha-icon>
              Open Calendar
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing popup if any
    const existingPopup = this.shadowRoot.querySelector('.event-popup-overlay');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Add popup to shadow root
    const popupContainer = document.createElement('div');
    popupContainer.innerHTML = popupHtml;
    this.shadowRoot.appendChild(popupContainer.firstElementChild);

    // Attach popup event listeners
    this._attachPopupListeners();
  }

  _attachPopupListeners() {
    const overlay = this.shadowRoot.querySelector('.event-popup-overlay');
    if (!overlay) return;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'close') {
        this._closeEventPopup();
      } else if (action === 'open-calendar') {
        // Open the calendar entity in Home Assistant
        const calendarId = this._selectedEvent?.calendar_entity_id;
        if (calendarId) {
          const event = new CustomEvent('hass-more-info', {
            bubbles: true,
            composed: true,
            detail: { entityId: calendarId }
          });
          this.dispatchEvent(event);
          this._closeEventPopup();
        }
      } else if (action === 'stop') {
        e.stopPropagation();
      }
    });

    // Prevent popup from closing when clicking inside
    const popup = overlay.querySelector('.event-popup');
    if (popup) {
      popup.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  // Open add event dialog
  _openAddEventDialog() {
    // Get the first visible calendar entity
    const visibleCals = this.visibleCalendars;
    if (visibleCals.length > 0) {
      const firstCalendar = visibleCals[0];
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

  attachEventListeners() {
    // Calendar toggle buttons in person headers
    const personHeaders = this.shadowRoot.querySelectorAll('.person-column-header, .mobile-person-tab');
    personHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const entityId = header.dataset.entityId;
        if (this._stateManager && entityId) {
          this._stateManager.toggleCalendar(entityId);
        }
      });
    });

    // Calendar toggle buttons in week/month view
    const toggleButtons = this.shadowRoot.querySelectorAll('.calendar-toggle');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const entityId = btn.dataset.entityId;
        if (this._stateManager && entityId) {
          this._stateManager.toggleCalendar(entityId);
        }
      });
    });

    // View navigation buttons
    const navButtons = this.shadowRoot.querySelectorAll('.nav-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view) {
          this._config = { ...this._config, view };
          this._scrolled = false;
          this.render();

          // Fire config-changed event for the editor
          const event = new CustomEvent('config-changed', {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(event);
        }
      });
    });

    // Date navigation arrows
    const navArrows = this.shadowRoot.querySelectorAll('.nav-arrow[data-nav], .nav-today-btn[data-nav]');
    navArrows.forEach(btn => {
      btn.addEventListener('click', () => {
        const nav = btn.dataset.nav;
        if (nav === 'prev') {
          this._navigatePrevious();
        } else if (nav === 'next') {
          this._navigateNext();
        } else if (nav === 'today') {
          this._navigateToday();
        }
      });
    });

    // Event click handlers - show event details popup
    const eventElements = this.shadowRoot.querySelectorAll('.event, .month-event, .positioned-event, .all-day-event, .mobile-event-card');
    eventElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = el.dataset.eventId;
        const calendarId = el.dataset.calendar;

        // Find the event in our data
        const eventData = this.events.find(ev =>
          (ev.uid === eventId || ev.summary === el.querySelector('.event-title, .mobile-event-title')?.textContent) &&
          ev.calendar_entity_id === calendarId
        );

        if (eventData) {
          this._showEventDetails(eventData);
        }
      });
    });

    // Add event button
    const addEventBtn = this.shadowRoot.querySelector('.add-event-btn');
    if (addEventBtn) {
      addEventBtn.addEventListener('click', () => {
        this._openAddEventDialog();
      });
    }
  }

  static getConfigElement() {
    return document.createElement('planavista-grid-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.planavista_config',
      view: 'day',
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

    const view = this._config.view || 'day';
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
                { value: 'day', label: 'Day (Column View)' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' }
              ],
              mode: 'dropdown'
            }}}
            .value=${view}
            .label=${'Default View'}
            @value-changed=${this._valueChanged}
            data-config="view"
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
  description: 'Calendar grid with column-per-person day view, week, and month views',
  preview: true,
});

console.info(
  `%c PLANAVISTA-GRID %c v0.4.0 `,
  'color: white; background: #4A90E2; font-weight: bold;',
  'color: #4A90E2; background: white; font-weight: bold;'
);
