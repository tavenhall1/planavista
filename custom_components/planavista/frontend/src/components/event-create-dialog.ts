import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig, CalendarEvent, CreateEventData, DeleteEventData } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { createEvent, createEventWithAttendees, deleteEvent, refreshPlanaVista } from '../utils/ha-utils';
import { baseStyles, buttonStyles, formStyles, dialogStyles, animationStyles } from '../styles/shared';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

@customElement('pv-event-create-dialog')
export class PVEventCreateDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Boolean }) open = false;
  @property({ type: String }) mode: 'create' | 'edit' = 'create';
  @property({ type: Object }) prefill: Partial<CalendarEvent> | null = null;

  @state() private _title = '';
  @state() private _selectedCalendars: Set<string> = new Set();
  @state() private _originalCalendars: Set<string> = new Set();
  @state() private _date = '';
  @state() private _startTime = '';
  @state() private _endTime = '';
  @state() private _allDay = false;
  @state() private _description = '';
  @state() private _location = '';
  @state() private _showMore = false;
  @state() private _saving = false;
  @state() private _error = '';

  // Date picker state
  @state() private _datePickerOpen = false;
  @state() private _pickerMonth = 0;
  @state() private _pickerYear = 0;

  // Location autocomplete state
  @state() private _locationSuggestions: Array<{ display_name: string }> = [];
  @state() private _locationLoading = false;
  @state() private _locationFocused = false;

  private _locationDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _pv = new PlanaVistaController(this);

  @query('#title-input') private _titleInput?: HTMLInputElement;
  @query('.location-input') private _locationInput?: HTMLInputElement;
  @query('.date-display') private _dateDisplay?: HTMLElement;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    dialogStyles,
    animationStyles,
    css`
      :host { display: block; }

      .form-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        display: flex;
        gap: 0.75rem;
        align-items: flex-end;
      }

      .form-row > * {
        flex: 1;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .all-day-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0;
      }

      .all-day-label {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text);
      }

      .calendar-select {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .cal-option {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border: 2px solid transparent;
        border-radius: 9999px;
        cursor: pointer;
        transition: all var(--pv-transition);
        font-size: 0.8125rem;
        font-weight: 500;
        background: transparent;
        font-family: inherit;
        min-height: 40px;
      }

      .cal-option.selected {
        color: white;
        box-shadow: 0 2px 6px color-mix(in srgb, var(--cal-bg) 30%, transparent);
      }

      .cal-option:not(.selected) {
        border-color: var(--pv-border);
        color: var(--pv-text-secondary);
      }

      .cal-option:hover:not(.selected) {
        border-color: var(--pv-text-muted);
      }

      .cal-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .show-more-btn {
        background: none;
        border: none;
        color: var(--pv-text-secondary);
        font-size: 0.8125rem;
        cursor: pointer;
        padding: 0.5rem 0;
        font-family: inherit;
        text-align: left;
      }

      .show-more-btn:hover {
        color: var(--pv-accent);
      }

      .error-msg {
        color: #EF4444;
        font-size: 0.8125rem;
        padding: 0.5rem;
        background: color-mix(in srgb, #EF4444 8%, transparent);
        border-radius: var(--pv-radius-sm);
      }

      /* ============================================
         CUSTOM DATE PICKER
         ============================================ */
      .date-picker-wrap {
        position: relative;
      }

      .date-display {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-sm, 8px);
        background: var(--pv-card-bg);
        color: var(--pv-text);
        font-size: 0.9375rem;
        font-family: inherit;
        cursor: pointer;
        min-height: 48px;
        box-sizing: border-box;
        transition: border-color 200ms ease;
      }

      .date-display:hover {
        border-color: var(--pv-text-muted);
      }

      .date-display ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-muted);
      }

      .date-picker-dropdown {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-md, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        padding: 12px;
        width: 280px;
        animation: pv-fadeIn 150ms ease;
      }

      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .picker-month-label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pv-text);
      }

      .picker-nav {
        display: flex;
        gap: 2px;
      }

      .picker-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text-secondary);
        cursor: pointer;
        font-family: inherit;
        transition: background 150ms;
      }

      .picker-nav-btn:hover {
        background: var(--pv-event-hover, rgba(0,0,0,0.05));
      }

      .picker-nav-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .picker-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 4px;
      }

      .picker-weekday {
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--pv-text-muted);
        padding: 4px 0;
        text-transform: uppercase;
      }

      .picker-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      .picker-day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--pv-text);
        font-size: 0.8125rem;
        font-family: inherit;
        cursor: pointer;
        transition: all 150ms;
        margin: 0 auto;
      }

      .picker-day:hover {
        background: var(--pv-event-hover, rgba(0,0,0,0.05));
      }

      .picker-day.other-month {
        color: var(--pv-text-muted);
        opacity: 0.4;
      }

      .picker-day.today {
        border: 2px solid var(--pv-accent);
        font-weight: 600;
      }

      .picker-day.selected {
        background: var(--pv-accent);
        color: var(--pv-accent-text, #fff);
        font-weight: 600;
      }

      .picker-day.selected:hover {
        filter: brightness(1.1);
      }

      /* ============================================
         LOCATION AUTOCOMPLETE (fixed position)
         ============================================ */
      .location-wrap {
        position: relative;
      }

      .location-suggestions-fixed {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: 0 0 var(--pv-radius-sm, 8px) var(--pv-radius-sm, 8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        max-height: 220px;
        overflow-y: auto;
      }

      .location-suggestion {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 0.8125rem;
        color: var(--pv-text);
        line-height: 1.35;
        transition: background 120ms ease;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
      }

      .location-suggestion:last-child {
        border-bottom: none;
      }

      .location-suggestion:hover {
        background: var(--pv-event-hover, rgba(0, 0, 0, 0.04));
      }

      .location-suggestion ha-icon {
        --mdc-icon-size: 16px;
        color: var(--pv-text-muted);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .location-loading {
        padding: 12px;
        text-align: center;
        font-size: 0.8125rem;
        color: var(--pv-text-muted);
      }

      .location-powered {
        padding: 4px 12px 6px;
        text-align: right;
        font-size: 0.625rem;
        color: var(--pv-text-muted);
        opacity: 0.6;
      }

      /* ═══════════ RESPONSIVE BREAKPOINTS ═══════════ */

      /* xs: phones — bottom-sheet dialog */
      @media (max-width: 479px) {
        .pv-overlay {
          align-items: flex-end;
        }

        .pv-dialog {
          max-width: 100%;
          width: 100%;
          max-height: 90vh;
          border-radius: 16px 16px 0 0;
          animation: pv-slideUp 250ms ease;
        }

        .pv-dialog-header { padding: 1rem; }
        .pv-dialog-body { padding: 1rem; }
        .pv-dialog-footer { padding: 0.75rem 1rem; }

        .form-row { flex-direction: column; gap: 0.5rem; }

        .cal-option { padding: 0.25rem 0.5rem; font-size: 0.75rem; min-height: 36px; }
      }

      /* sm: large phones — slightly wider dialog */
      @media (min-width: 480px) and (max-width: 767px) {
        .pv-dialog { max-width: calc(100% - 1rem); }
        .pv-dialog-header { padding: 1rem 1.25rem; }
        .pv-dialog-body { padding: 1.25rem; }
      }

      @keyframes pv-slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `,
  ];

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('open') && this.open) {
      this._initForm();
      this._datePickerOpen = false;
      requestAnimationFrame(() => {
        this._titleInput?.focus();
      });
    }
  }

  private _initForm() {
    this._error = '';
    this._saving = false;
    this._showMore = false;
    this._locationSuggestions = [];
    this._locationFocused = false;

    if (this.prefill) {
      this._title = this.prefill.summary || '';
      this._description = this.prefill.description || '';
      this._location = this.prefill.location || '';

      // Populate selected calendars from shared_calendars (edit mode) or single calendar
      const shared = (this.prefill as any).shared_calendars as Array<{ entity_id: string }> | undefined;
      if (shared && shared.length > 0) {
        this._selectedCalendars = new Set(shared.map(sc => sc.entity_id));
      } else if (this.prefill.calendar_entity_id) {
        this._selectedCalendars = new Set([this.prefill.calendar_entity_id]);
      } else {
        this._selectedCalendars = new Set([this.calendars[0]?.entity_id].filter(Boolean));
      }
      this._originalCalendars = new Set(this._selectedCalendars);

      if (this.prefill.start) {
        const start = new Date(this.prefill.start);
        this._date = this._toDateStr(start);
        this._pickerYear = start.getFullYear();
        this._pickerMonth = start.getMonth();
        if (!this.prefill.start.includes('T') || (start.getHours() === 0 && start.getMinutes() === 0)) {
          this._allDay = true;
          this._startTime = '';
          this._endTime = '';
        } else {
          this._allDay = false;
          this._startTime = this._toTimeStr(start);
          if (this.prefill.end) {
            this._endTime = this._toTimeStr(new Date(this.prefill.end));
          }
        }
      } else {
        this._setDefaults();
      }

      if (this._description || this._location) {
        this._showMore = true;
      }
    } else {
      this._setDefaults();
    }
  }

  private _setDefaults() {
    this._title = '';
    this._selectedCalendars = new Set([this.calendars[0]?.entity_id].filter(Boolean));
    this._originalCalendars = new Set();
    const now = new Date();
    this._date = this._toDateStr(now);
    this._pickerYear = now.getFullYear();
    this._pickerMonth = now.getMonth();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes, 0, 0);
    this._startTime = this._toTimeStr(now);
    const end = new Date(now);
    end.setHours(end.getHours() + 1);
    this._endTime = this._toTimeStr(end);
    this._allDay = false;
    this._description = '';
    this._location = '';
  }

  private _toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private _toTimeStr(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  private _formatDateDisplay(): string {
    if (!this._date) return 'Select a date';
    const [y, m, d] = this._date.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  render() {
    if (!this.open) return nothing;

    const visibleCalendars = this.calendars.filter(c => c.visible !== false);
    const isEdit = this.mode === 'edit';
    const heading = isEdit ? 'Edit Event' : 'New Event';

    return html`
      <div class="pv-overlay" @click=${this._onOverlayClick}>
        <div class="pv-dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="pv-dialog-header">
            <span class="pv-heading-2">${heading}</span>
            <button class="pv-btn-icon" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="pv-dialog-body">
            <div class="form-grid">
              ${this._error ? html`<div class="error-msg">${this._error}</div>` : nothing}

              <div class="form-field">
                <input
                  id="title-input"
                  class="pv-input"
                  type="text"
                  placeholder="Event title"
                  .value=${this._title}
                  @input=${(e: Event) => this._title = (e.target as HTMLInputElement).value}
                />
              </div>

              <div class="form-field">
                <label class="pv-label">${isEdit ? 'Participants' : 'Calendars'}</label>
                <div class="calendar-select">
                  ${visibleCalendars.map(cal => {
                    const selected = this._selectedCalendars.has(cal.entity_id);
                    return html`
                      <button
                        class="cal-option ${selected ? 'selected' : ''}"
                        style="${selected
                          ? `background: ${cal.color}; --cal-bg: ${cal.color}`
                          : `--cal-bg: ${cal.color}`}"
                        @click=${() => this._toggleCalendar(cal.entity_id)}
                      >
                        <span class="cal-dot" style="background: ${cal.color}"></span>
                        ${cal.display_name}
                      </button>
                    `;
                  })}
                </div>
              </div>

              <div class="form-field">
                <label class="pv-label">Date</label>
                ${this._renderDatePicker()}
              </div>

              <div class="all-day-row">
                <span class="all-day-label">All Day</span>
                <div
                  class="pv-toggle ${this._allDay ? 'active' : ''}"
                  role="switch"
                  tabindex="0"
                  aria-checked="${this._allDay}"
                  @click=${() => this._allDay = !this._allDay}
                  @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._allDay = !this._allDay; }}}
                ></div>
              </div>

              ${!this._allDay ? html`
                <div class="form-row">
                  <div class="form-field">
                    <label class="pv-label">Start Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._startTime}
                      @input=${(e: Event) => this._startTime = (e.target as HTMLInputElement).value}
                    />
                  </div>
                  <div class="form-field">
                    <label class="pv-label">End Time</label>
                    <input
                      class="pv-input"
                      type="time"
                      .value=${this._endTime}
                      @input=${(e: Event) => this._endTime = (e.target as HTMLInputElement).value}
                    />
                  </div>
                </div>
              ` : nothing}

              ${!this._showMore ? html`
                <button class="show-more-btn" @click=${() => this._showMore = true}>
                  + Add description, location
                </button>
              ` : html`
                <div class="form-field">
                  <label class="pv-label">Description</label>
                  <textarea
                    class="pv-input"
                    rows="3"
                    placeholder="Add a description..."
                    .value=${this._description}
                    @input=${(e: Event) => this._description = (e.target as HTMLTextAreaElement).value}
                    style="resize: vertical; min-height: 80px;"
                  ></textarea>
                </div>
                <div class="form-field">
                  <label class="pv-label">Location</label>
                  ${this._renderLocationField()}
                </div>
              `}
            </div>
          </div>

          <div class="pv-dialog-footer">
            <button class="pv-btn pv-btn-secondary" @click=${this._close}>
              Cancel
            </button>
            <button
              class="pv-btn pv-btn-primary"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </div>
      </div>

      ${this._renderLocationDropdown()}
      ${this._renderDatePickerDropdown()}
    `;
  }

  // ==================================================================
  // CUSTOM DATE PICKER
  // ==================================================================

  private _renderDatePicker() {
    return html`
      <div class="date-picker-wrap">
        <div class="date-display" @click=${this._toggleDatePicker}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </div>
      </div>
    `;
  }

  private _renderDatePickerDropdown() {
    if (!this._datePickerOpen) return nothing;

    const el = this._dateDisplay;
    if (!el) return nothing;
    const rect = el.getBoundingClientRect();

    // Position below the trigger, but if it would go off-screen, position above
    const dropdownHeight = 330; // approximate
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    const top = placeAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4;

    return html`
      <div
        class="date-picker-dropdown"
        style="top: ${top}px; left: ${rect.left}px;"
      >
        <div class="picker-header">
          <span class="picker-month-label">
            ${new Date(this._pickerYear, this._pickerMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div class="picker-nav">
            <button class="picker-nav-btn" @click=${this._pickerPrevMonth}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="picker-nav-btn" @click=${this._pickerNextMonth}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        </div>
        <div class="picker-weekdays">
          ${WEEKDAY_LABELS.map(d => html`<span class="picker-weekday">${d}</span>`)}
        </div>
        <div class="picker-days">
          ${this._getPickerDays().map(day => {
            const isOther = day.getMonth() !== this._pickerMonth;
            const isToday = this._toDateStr(day) === this._toDateStr(new Date());
            const isSelected = this._toDateStr(day) === this._date;
            return html`
              <button
                class="picker-day ${isOther ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                @click=${() => this._selectPickerDay(day)}
              >${day.getDate()}</button>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _toggleDatePicker() {
    this._datePickerOpen = !this._datePickerOpen;
    if (this._datePickerOpen && this._date) {
      const [y, m] = this._date.split('-').map(Number);
      this._pickerYear = y;
      this._pickerMonth = m - 1;
    }
  }

  private _pickerPrevMonth() {
    this._pickerMonth--;
    if (this._pickerMonth < 0) {
      this._pickerMonth = 11;
      this._pickerYear--;
    }
  }

  private _pickerNextMonth() {
    this._pickerMonth++;
    if (this._pickerMonth > 11) {
      this._pickerMonth = 0;
      this._pickerYear++;
    }
  }

  private _getPickerDays(): Date[] {
    const firstOfMonth = new Date(this._pickerYear, this._pickerMonth, 1);
    const startDay = firstOfMonth.getDay(); // 0=Sun
    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - startDay);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }

  private _selectPickerDay(day: Date) {
    this._date = this._toDateStr(day);
    this._datePickerOpen = false;
  }

  // ==================================================================
  // LOCATION AUTOCOMPLETE (fixed position, HA location bias)
  // ==================================================================

  private _renderLocationField() {
    return html`
      <div class="location-wrap">
        <input
          class="pv-input location-input"
          type="text"
          placeholder="Search for a place or address..."
          .value=${this._location}
          @input=${this._onLocationInput}
          @focus=${() => this._locationFocused = true}
          @blur=${() => { setTimeout(() => { this._locationFocused = false; }, 250); }}
        />
      </div>
    `;
  }

  private _renderLocationDropdown() {
    if (!this._locationFocused || (!this._locationSuggestions.length && !this._locationLoading)) {
      return nothing;
    }

    // Calculate position from the location input
    const input = this._locationInput;
    if (!input) return nothing;
    const rect = input.getBoundingClientRect();

    return html`
      <div
        class="location-suggestions-fixed"
        style="top: ${rect.bottom}px; left: ${rect.left}px; width: ${rect.width}px;"
      >
        ${this._locationLoading ? html`
          <div class="location-loading">Searching...</div>
        ` : nothing}
        ${this._locationSuggestions.map(s => html`
          <div class="location-suggestion" @mousedown=${() => this._selectLocation(s.display_name)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${s.display_name}</span>
          </div>
        `)}
        ${this._locationSuggestions.length > 0 ? html`
          <div class="location-powered">Powered by OpenStreetMap</div>
        ` : nothing}
      </div>
    `;
  }

  private _onLocationInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this._location = value;

    if (this._locationDebounceTimer) {
      clearTimeout(this._locationDebounceTimer);
    }

    if (value.trim().length < 3) {
      this._locationSuggestions = [];
      this._locationLoading = false;
      return;
    }

    this._locationLoading = true;
    this._locationDebounceTimer = setTimeout(() => {
      this._searchLocation(value.trim());
    }, 350);
  }

  private async _searchLocation(query: string) {
    try {
      // Use HA's home coordinates for location bias and sorting
      const homeLat = (this.hass as any)?.config?.latitude;
      const homeLon = (this.hass as any)?.config?.longitude;

      // Fetch more results so we can sort by distance and return the closest
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=20`;

      if (homeLat != null && homeLon != null) {
        const delta = 2.0; // ~220km bias area
        url += `&viewbox=${homeLon - delta},${homeLat + delta},${homeLon + delta},${homeLat - delta}`;
        url += `&bounded=0`;
      }

      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!resp.ok) throw new Error('Search failed');
      const results = await resp.json();

      // Sort by distance from HA home, then take top 5
      if (homeLat != null && homeLon != null) {
        results.sort((a: any, b: any) => {
          const distA = this._haversine(homeLat, homeLon, parseFloat(a.lat), parseFloat(a.lon));
          const distB = this._haversine(homeLat, homeLon, parseFloat(b.lat), parseFloat(b.lon));
          return distA - distB;
        });
      }

      this._locationSuggestions = results.slice(0, 5).map((r: any) => ({
        display_name: r.display_name,
      }));
    } catch {
      this._locationSuggestions = [];
    } finally {
      this._locationLoading = false;
    }
  }

  /** Haversine distance in km between two lat/lon points */
  private _haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private _selectLocation(name: string) {
    this._location = name;
    this._locationSuggestions = [];
    this._locationFocused = false;
  }

  // ==================================================================
  // DIALOG ACTIONS
  // ==================================================================

  private _toggleCalendar(entityId: string) {
    const next = new Set(this._selectedCalendars);
    if (next.has(entityId)) {
      // Don't allow deselecting the last one
      if (next.size > 1) next.delete(entityId);
    } else {
      next.add(entityId);
    }
    this._selectedCalendars = next;
  }

  private _onOverlayClick() {
    this._close();
  }

  private _close() {
    this._datePickerOpen = false;
    this._locationSuggestions = [];
    this._pv.state.closeDialog();
  }

  private async _save() {
    if (!this._title.trim()) {
      this._error = 'Please enter an event title';
      return;
    }
    if (this._selectedCalendars.size === 0) {
      this._error = 'Please select at least one calendar';
      return;
    }

    if (!this._allDay && this._endTime <= this._startTime) {
      this._error = 'End time must be after start time';
      return;
    }

    this._error = '';
    this._saving = true;

    try {
      // Build the base event data (without entity_id — we'll set per-calendar)
      const baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string } = {
        summary: this._title.trim(),
      };

      if (this._allDay) {
        baseData.start_date = this._date;
        const end = new Date(this._date);
        end.setDate(end.getDate() + 1);
        baseData.end_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      } else {
        baseData.start_date_time = `${this._date}T${this._startTime}:00`;
        baseData.end_date_time = `${this._date}T${this._endTime}:00`;
      }

      if (this._description.trim()) baseData.description = this._description.trim();
      if (this._location.trim()) baseData.location = this._location.trim();

      const selected = this._selectedCalendars;
      const original = this._originalCalendars;

      if (this.mode === 'edit') {
        // Compute participant diff
        const added = [...selected].filter(id => !original.has(id));
        const removed = [...original].filter(id => !selected.has(id));
        const kept = [...selected].filter(id => original.has(id));

        // Edit the primary calendar (the one we have the uid for)
        const primaryEntityId = this.prefill?.calendar_entity_id;
        if (primaryEntityId && kept.includes(primaryEntityId) && this.prefill?.uid) {
          const deleteData: DeleteEventData = {
            entity_id: primaryEntityId,
            uid: this.prefill.uid,
            recurrence_id: this.prefill.recurrence_id,
          };
          const createData: CreateEventData = { ...baseData, entity_id: primaryEntityId } as CreateEventData;
          await this._pv.state.doEditEvent(this.hass, deleteData, createData);
        } else if (primaryEntityId && removed.includes(primaryEntityId) && this.prefill?.uid) {
          // Primary calendar was removed — just delete from it
          await deleteEvent(this.hass, {
            entity_id: primaryEntityId,
            uid: this.prefill.uid,
            recurrence_id: this.prefill.recurrence_id,
          });
        }

        // Edit other kept calendars (they also have the event — delete old + create new)
        const uid = this.prefill?.uid;
        const recurrenceId = this.prefill?.recurrence_id;
        for (const entityId of kept) {
          if (entityId === primaryEntityId) continue; // already handled above
          if (uid) {
            try {
              await deleteEvent(this.hass, { entity_id: entityId, uid, recurrence_id: recurrenceId });
            } catch { /* may not exist with same uid on this calendar */ }
          }
          await createEvent(this.hass, { ...baseData, entity_id: entityId } as CreateEventData);
        }

        // Create on newly added calendars
        for (const entityId of added) {
          await createEvent(this.hass, { ...baseData, entity_id: entityId } as CreateEventData);
        }

        // Delete from removed calendars
        for (const entityId of removed) {
          if (entityId === primaryEntityId) continue; // already handled above
          if (uid) {
            try {
              await deleteEvent(this.hass, { entity_id: entityId, uid, recurrence_id: recurrenceId });
            } catch { /* may not exist with same uid on this calendar */ }
          }
        }

        await refreshPlanaVista(this.hass);
        this._pv.state.selectedEvent = null;
        this._pv.state.closeDialog();
      } else {
        // Create mode
        const entityIds = [...selected];

        if (entityIds.length > 1) {
          // Multiple calendars — use attendees service (Google API when available)
          const primaryId = entityIds[0];
          const attendeeIds = entityIds.slice(1);
          await createEventWithAttendees(this.hass, {
            ...baseData,
            entity_id: primaryId,
            attendee_entity_ids: attendeeIds,
          } as CreateEventData & { attendee_entity_ids: string[] });
          await refreshPlanaVista(this.hass);
          this._pv.state.closeDialog();
        } else {
          // Single calendar — use normal create
          const data: CreateEventData = { ...baseData, entity_id: entityIds[0] } as CreateEventData;
          await this._pv.state.doCreateEvent(this.hass, data);
        }
      }
    } catch (err: any) {
      this._error = `Failed to save event: ${err?.message || 'Unknown error'}`;
      this._saving = false;
    }
  }
}
