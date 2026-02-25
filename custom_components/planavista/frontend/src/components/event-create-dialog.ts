import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig, CalendarEvent, CreateEventData, DeleteEventData } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { baseStyles, buttonStyles, formStyles, dialogStyles, animationStyles } from '../styles/shared';

@customElement('pv-event-create-dialog')
export class PVEventCreateDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  @property({ type: Boolean }) open = false;
  @property({ type: String }) mode: 'create' | 'edit' = 'create';
  @property({ type: Object }) prefill: Partial<CalendarEvent> | null = null;

  @state() private _title = '';
  @state() private _calendarEntityId = '';
  @state() private _date = '';
  @state() private _startTime = '';
  @state() private _endTime = '';
  @state() private _allDay = false;
  @state() private _description = '';
  @state() private _location = '';
  @state() private _showMore = false;
  @state() private _saving = false;
  @state() private _error = '';
  @state() private _locationSuggestions: Array<{ display_name: string; lat: string; lon: string }> = [];
  @state() private _locationLoading = false;
  @state() private _locationFocused = false;

  private _locationDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private _pv = new PlanaVistaController(this);

  @query('#title-input') private _titleInput?: HTMLInputElement;

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

      /* Date input — ensure native picker is visible */
      input[type="date"] {
        appearance: auto;
        -webkit-appearance: auto;
        cursor: pointer;
      }

      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.6;
        font-size: 1.125rem;
        padding: 4px;
      }

      input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }

      /* Location autocomplete */
      .location-wrap {
        position: relative;
      }

      .location-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-top: none;
        border-radius: 0 0 var(--pv-radius-sm, 8px) var(--pv-radius-sm, 8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        max-height: 200px;
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
    `,
  ];

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('open') && this.open) {
      this._initForm();
      requestAnimationFrame(() => {
        this._titleInput?.focus();
      });
    }
  }

  private _initForm() {
    this._error = '';
    this._saving = false;
    this._showMore = false;

    if (this.prefill) {
      this._title = this.prefill.summary || '';
      this._calendarEntityId = this.prefill.calendar_entity_id || this.calendars[0]?.entity_id || '';
      this._description = this.prefill.description || '';
      this._location = this.prefill.location || '';

      if (this.prefill.start) {
        const start = new Date(this.prefill.start);
        this._date = this._toDateStr(start);
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
    this._calendarEntityId = this.calendars[0]?.entity_id || '';
    const now = new Date();
    this._date = this._toDateStr(now);
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
                <label class="pv-label">Calendar</label>
                <div class="calendar-select">
                  ${visibleCalendars.map(cal => html`
                    <button
                      class="cal-option ${this._calendarEntityId === cal.entity_id ? 'selected' : ''}"
                      style="${this._calendarEntityId === cal.entity_id
                        ? `background: ${cal.color}; --cal-bg: ${cal.color}`
                        : `--cal-bg: ${cal.color}`}"
                      @click=${() => this._calendarEntityId = cal.entity_id}
                    >
                      <span class="cal-dot" style="background: ${cal.color}"></span>
                      ${cal.display_name}
                    </button>
                  `)}
                </div>
              </div>

              <div class="form-field">
                <label class="pv-label">Date</label>
                <input
                  class="pv-input"
                  type="date"
                  .value=${this._date}
                  @input=${(e: Event) => this._date = (e.target as HTMLInputElement).value}
                />
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
                  <div class="location-wrap">
                    <input
                      class="pv-input"
                      type="text"
                      placeholder="Search for a place or address..."
                      .value=${this._location}
                      @input=${this._onLocationInput}
                      @focus=${() => this._locationFocused = true}
                      @blur=${() => { setTimeout(() => { this._locationFocused = false; }, 200); }}
                    />
                    ${this._locationFocused && (this._locationSuggestions.length > 0 || this._locationLoading) ? html`
                      <div class="location-suggestions">
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
                    ` : nothing}
                  </div>
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
    `;
  }

  private _onOverlayClick() {
    this._close();
  }

  private _close() {
    this._pv.state.closeDialog();
  }

  private async _save() {
    if (!this._title.trim()) {
      this._error = 'Please enter an event title';
      return;
    }
    if (!this._calendarEntityId) {
      this._error = 'Please select a calendar';
      return;
    }

    // Validate end time > start time for timed events
    if (!this._allDay && this._endTime <= this._startTime) {
      this._error = 'End time must be after start time';
      return;
    }

    // If editing, ensure we have a UID to delete the original
    if (this.mode === 'edit' && !this.prefill?.uid) {
      this._error = 'Cannot edit this event (no unique ID). Try deleting and recreating it.';
      return;
    }

    this._error = '';
    this._saving = true;

    try {
      const data: CreateEventData = {
        entity_id: this._calendarEntityId,
        summary: this._title.trim(),
      };

      if (this._allDay) {
        data.start_date = this._date;
        // End date is exclusive for all-day events
        const end = new Date(this._date);
        end.setDate(end.getDate() + 1);
        data.end_date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      } else {
        data.start_date_time = `${this._date}T${this._startTime}:00`;
        data.end_date_time = `${this._date}T${this._endTime}:00`;
      }

      if (this._description.trim()) data.description = this._description.trim();
      if (this._location.trim()) data.location = this._location.trim();

      if (this.mode === 'edit' && this.prefill?.uid) {
        // Edit = delete old + create new
        const deleteData: DeleteEventData = {
          entity_id: this.prefill.calendar_entity_id!,
          uid: this.prefill.uid,
          recurrence_id: this.prefill.recurrence_id,
        };
        await this._pv.state.doEditEvent(this.hass, deleteData, data);
      } else {
        await this._pv.state.doCreateEvent(this.hass, data);
      }
    } catch (err: any) {
      this._error = `Failed to save event: ${err?.message || 'Unknown error'}`;
      this._saving = false;
    }
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
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
      const resp = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      if (!resp.ok) throw new Error('Search failed');
      const results = await resp.json();
      this._locationSuggestions = results.map((r: any) => ({
        display_name: r.display_name,
        lat: r.lat,
        lon: r.lon,
      }));
    } catch {
      this._locationSuggestions = [];
    } finally {
      this._locationLoading = false;
    }
  }

  private _selectLocation(name: string) {
    this._location = name;
    this._locationSuggestions = [];
    this._locationFocused = false;
  }
}
