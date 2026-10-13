import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { personChipStyles, tagStyles } from '../../../styles/controls';
import { property, state, query } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig, CalendarEvent, CreateEventData } from '../../../types';
import { CalendarStore, StoreSubscriber } from '../calendar-store';
import { createEvent, createEventWithAttendees, deleteEvent, updateEvent, refreshPlanaVista, getEventOrganizer } from '../../../utils/ha-utils';
import {
  buildDeleteData,
  buildEventBase,
  buildRestoreData,
  defaultFormDates,
  defaultWho,
  EditRestoreError,
  EventFormDates,
  formDatesFromEvent,
  formEndDate,
  planEdit,
  runEditWithRestore,
  validateFormDates,
  withEndTime,
  withAllDayEnd,
  withAllDayStart,
  withStartTime,
} from '../utils/event-form';
import { baseStyles, buttonStyles, formStyles, animationStyles } from '../../../styles/shared';
import { sheetStyles } from '../../../styles/sheet';
import type { Layout } from '../../../core/layout';
import { SheetController } from '../../../shell/sheet-controller';
import type { NoticeAction } from '../../../shell/pv-notice-sheet';
import '../../../shell/pv-notice-sheet';
import { LocationSearch } from '../utils/location-search';
import { monthGrid, timeList } from '../../../core/picker-views';
import { dateLabel, timeSlots } from '../../../core/pickers';
import { pickerStyles } from '../../../styles/pickers';
import { contrastText } from '../../../core/color';
import { calendarCan, formSignature, saveFailedText } from '../event-words';
import type { EventGate } from '../event-gate';


const DISCARD_ACTIONS: NoticeAction[] = [
  { id: 'discard', label: 'Discard changes', kind: 'destructive' },
  { id: 'keep', label: 'Keep editing', kind: 'secondary' },
];

/**
 * pv-event-create-dialog: New event and Edit event as a sheet (spec 11.5,
 * 11.8, 12.3): from the bottom in portrait and on phones, a card in
 * landscape. Escape closes an open picker first, then the sheet. Escape, a
 * tap outside, or a drag ask before throwing away what was typed; Cancel
 * is the deliberate way out and doesn't.
 *
 * @fires pv-sheet-close - once it has left (Cancel, a dismiss or discard, or `leaving`)
 */
export class PVEventCreateDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Array }) calendars: CalendarConfig[] = [];
  /** Who may change events here (D1): Save asks for a PIN first when this screen needs one. */
  @property({ attribute: false }) gate?: EventGate;
  @property({ type: Boolean }) open = false;
  @property({ type: String }) mode: 'create' | 'edit' = 'create';
  @property({ type: Object }) prefill: Partial<CalendarEvent> | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  /** Display setting `location_autocomplete`: when false the Location field never touches the network. */
  @property({ attribute: false }) locationAutocomplete = false;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Set once nothing wants the sheet (an event saved): it plays its exit, then fires pv-sheet-close. */
  @property({ type: Boolean }) leaving = false;

  @state() private _title = '';
  @state() private _selectedCalendars: Set<string> = new Set();
  /** Save is waiting on a PIN (D1). */
  private _gating = false;
  @state() private _originalCalendars: Set<string> = new Set();
  @state() private _organizerEntityId = '';
  @state() private _date = '';
  @state() private _startTime = '';
  @state() private _endTime = '';
  @state() private _allDay = false;
  /** All-day length in days; kept from the edited event so it isn't collapsed to one day. */
  @state() private _spanDays = 1;
  /** Timed events: days from the start date to the end date (1 for an overnight event). */
  @state() private _endDayOffset = 0;
  @state() private _description = '';
  @state() private _location = '';
  @state() private _showMore = false;
  @state() private _saving = false;
  @state() private _error = '';
  @state() private _removeGuestsHint = false;
  @state() private _askDiscard = false;
  /** The fields as the sheet opened with them, to tell whether a dismiss would throw anything away. */
  private _baseline = '';

  // Date picker state
  @state() private _datePickerOpen = false;
  /** Which date the month grid is picking: the start, or an all-day event's last day (spec 3.4). */
  @state() private _dateTarget: 'start' | 'end' = 'start';
  @state() private _pickerMonth = 0;
  @state() private _pickerYear = 0;

  // Time picker state
  @state() private _activeTimePicker: 'start' | 'end' | null = null;

  // Location autocomplete state (only used when locationAutocomplete is on)
  @state() private _locationSuggestions: string[] = [];
  @state() private _locationLoading = false;
  @state() private _locationFocused = false;

  private _locationSearch = new LocationSearch({
    onResults: suggestions => { this._locationSuggestions = suggestions; },
    onLoading: loading => { this._locationLoading = loading; },
  });
  /** The calendar state of the card that opened this. */
  @property({ attribute: false }) store!: CalendarStore;
  /** Re-renders when that store changes (the controller registers itself with this element). */
  private _storeSubscription = new StoreSubscriber(this, () => this.store);
  private _sheet = new SheetController(this, {
    initialFocus: () => this._titleInput ?? null,
    escape: () => this._closePickers(),
    mayDismiss: () => this._mayDismiss(),
  });

  @query('#title-input') private _titleInput?: HTMLInputElement;
  @query('.location-input') private _locationInput?: HTMLInputElement;
  @query('.date-display') private _dateDisplay?: HTMLElement;
  @query('.end-date-display') private _endDateDisplay?: HTMLElement;
  @query('.start-time-display') private _startTimeEl?: HTMLElement;
  @query('.end-time-display') private _endTimeEl?: HTMLElement;

  static styles = [
    pickerStyles,
    personChipStyles,
    tagStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    sheetStyles,
    animationStyles,
    css`
      .panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 0;
      }

      :host([layout='landscape']) .panel {
        width: min(560px, calc(100vw - 32px));
        max-height: 88vh;
        padding-bottom: 0;
      }

      .heading {
        text-align: left;
        font-weight: 800;
        margin: 0 0 14px;
      }

      /* The form scrolls between the heading and the footer. */
      .fields {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 2px 2px 16px;
      }

      .footer {
        display: flex;
        gap: 10px;
        padding: 12px 0 calc(16px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .footer .pv-btn {
        flex: 1 1 0;
        min-height: 48px;
      }

      :host([layout='landscape']) .footer {
        padding-bottom: 20px;
      }

      :host([layout='phone']) .form-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .hint {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.5rem;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
        font-size: 0.875rem;
      }

      .hint ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }

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
        min-height: 48px;
        cursor: pointer;
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
        padding-top: 12px;
      }





      .who-wrap {
        position: relative;
        display: inline-flex;
      }

      .pv-person-chip.locked {
        cursor: default;
        opacity: 0.9;
      }

      .cal-option .lock-icon {
        --mdc-icon-size: 12px;
        margin-left: 2px;
        opacity: 0.7;
      }


      .show-more-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        min-height: 48px;
        background: none;
        border: none;
        color: var(--pv-accent-ink, var(--pv-accent));
        font-size: 0.9375rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        text-align: left;
      }

      .show-more-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .show-more-btn:hover {
        color: var(--pv-accent-ink, var(--pv-accent));
      }

      .ends-hint {
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
        padding-top: 0.25rem;
      }

      .error-msg {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-size: 0.875rem;
        line-height: 1.4;
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
        text-align: left;
        cursor: pointer;
        min-height: 48px;
        box-sizing: border-box;
        transition: border-color 200ms ease;
      }

      .date-display:focus-visible,
      .time-display:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 2px;
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
        padding: 8px;
        width: max-content;
        animation: pv-fadeIn 150ms ease;
      }

      /* ============================================
         CUSTOM TIME PICKER
         ============================================ */
      .time-display {
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

      .time-display:hover {
        border-color: var(--pv-text-muted);
      }

      .time-display ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-muted);
      }

      .time-picker-dropdown {
        position: fixed;
        z-index: 9999;
        background: var(--pv-card-bg, #fff);
        border: 1px solid var(--pv-border);
        border-radius: var(--pv-radius-md, 12px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        max-height: 280px;
        overflow-y: auto;
        animation: pv-fadeIn 150ms ease;
        scrollbar-width: thin;
      }

      .time-picker-dropdown::-webkit-scrollbar {
        width: 4px;
      }

      .time-picker-dropdown::-webkit-scrollbar-thumb {
        background: var(--pv-border);
        border-radius: 4px;
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
        width: 100%;
        min-height: 48px;
        padding: 12px;
        border: none;
        border-bottom: 1px solid var(--pv-border-subtle, rgba(0,0,0,0.04));
        background: transparent;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.875rem;
        color: var(--pv-text);
        line-height: 1.35;
        transition: background 120ms ease;
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

  disconnectedCallback() {
    super.disconnectedCallback();
    this._locationSearch.cancel();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has('leaving') && this.leaving) void this._sheet.close();
    if (changedProps.has('locationAutocomplete') && !this.locationAutocomplete) {
      this._resetLocationSearch();
    }
    if (changedProps.has('open') && this.open) {
      this._initForm();
      this._datePickerOpen = false;
      this._baseline = this._signature();
    }
  }

  private _initForm() {
    this._error = '';
    this._saving = false;
    this._showMore = false;
    this._resetLocationSearch();
    this._locationFocused = false;
    this._removeGuestsHint = !!(this.prefill as any)?._removeGuestsHint;

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
        this._selectedCalendars = new Set(defaultWho(this._offered().map(c => c.entity_id)));
      }
      this._originalCalendars = new Set(this._selectedCalendars);

      // For single-calendar events, lock that calendar as organizer.
      // For shared events, query Google Calendar API for the real organizer.
      const isSharedEvent = shared && shared.length > 1;
      if (isSharedEvent && this.prefill.uid) {
        this._organizerEntityId = '';
        this._fetchOrganizer(this.prefill.calendar_entity_id || '', this.prefill.uid);
      } else {
        this._organizerEntityId = this.prefill.calendar_entity_id || '';
      }

      if (this.prefill.start) {
        this._applyDates(formDatesFromEvent(this.prefill.start, this.prefill.end));
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

  private async _fetchOrganizer(entityId: string, uid: string) {
    const organizerId = await getEventOrganizer(this.hass, entityId, uid);
    if (organizerId) {
      this._organizerEntityId = organizerId;
    }
  }

  /** The calendars Who offers: a read-only calendar can't take a new event; the event's own calendars stay in an edit. */
  private _offered(): CalendarConfig[] {
    return this.calendars.filter(c =>
      c.visible !== false && (calendarCan(c.attributes).create || this._originalCalendars.has(c.entity_id)));
  }

  private _setDefaults() {
    this._title = '';
    this._selectedCalendars = new Set(defaultWho(this._offered().map(c => c.entity_id)));
    this._originalCalendars = new Set();
    this._organizerEntityId = '';
    this._applyDates(defaultFormDates(new Date()));
    this._description = '';
    this._location = '';
  }

  /** The form's date/time state as plain values for utils/event-form. */
  private get _formDates(): EventFormDates {
    return {
      date: this._date,
      allDay: this._allDay,
      startTime: this._startTime,
      endTime: this._endTime,
      spanDays: this._spanDays,
      endDayOffset: this._endDayOffset,
    };
  }

  private _applyDates(f: EventFormDates) {
    this._date = f.date;
    this._allDay = f.allDay;
    this._startTime = f.startTime;
    this._endTime = f.endTime;
    this._spanDays = f.spanDays;
    this._endDayOffset = f.endDayOffset;
    const [y, m] = f.date.split('-').map(Number);
    this._pickerYear = y;
    this._pickerMonth = m - 1;
  }

  private _toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** "Ends Sat, Oct 10" for a timed event that runs past midnight (an all-day event shows its Ends date). */
  private _renderEndsHint() {
    const f = this._formDates;
    if (f.allDay || f.endDayOffset <= 0) return nothing;
    const [y, m, d] = formEndDate(f).split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return html`<div class="ends-hint">Ends ${label}</div>`;
  }

  private _formatDateDisplay(): string {
    return this._date ? dateLabel(this._date) : 'Pick a date';
  }

  render() {
    if (!this.open) return nothing;

    const visibleCalendars = this._offered();
    const isEdit = this.mode === 'edit';
    const heading = isEdit ? 'Edit event' : 'New event';

    return html`
      <div class="backdrop" @click=${() => this._sheet.dismiss()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="editor-title" @keydown=${this._sheet.onKeydown}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="editor-title">${heading}</h2>

        <div class="fields">
          <div class="form-grid">
            ${this._error ? html`<div class="error-msg" role="alert">${this._error}</div>` : nothing}

            <div class="form-field">
              <input
                id="title-input"
                class="pv-input"
                type="text"
                placeholder="Title"
                aria-label="Title"
                .value=${this._title}
                @input=${(e: Event) => this._title = (e.target as HTMLInputElement).value}
              />
            </div>

            <div class="form-field">
              <span class="pv-label" id="who-label">Who</span>
              ${this._removeGuestsHint ? html`
                <div class="hint">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  Tap someone to take them off this event.
                </div>
              ` : nothing}
              <div class="calendar-select pv-person-chips" role="group" aria-labelledby="who-label">
                ${visibleCalendars.map(cal => {
                  const selected = this._selectedCalendars.has(cal.entity_id);
                  const isOrganizer = cal.entity_id === this._organizerEntityId;
                  const isLockedOrganizer = isEdit && isOrganizer;
                  return html`
                    <div class="who-wrap">
                      <button
                        type="button"
                        class="pv-person-chip ${isLockedOrganizer ? 'locked' : ''}"
                        aria-pressed=${selected ? 'true' : 'false'}
                        style="--member: ${cal.color}"
                        @click=${() => this._toggleCalendar(cal.entity_id)}
                      >
                        <span class="dot" aria-hidden="true"></span>
                        ${cal.display_name}
                        ${isOrganizer && selected ? html`<span class="pv-tag muted">Organizer</span>` : nothing}
                        ${isLockedOrganizer
                          ? html`<ha-icon class="lock-icon" icon="mdi:lock-outline"></ha-icon>`
                          : nothing}
                      </button>
                    </div>
                  `;
                })}
              </div>
            </div>

            ${this._allDay ? html`
              <div class="form-row">
                <div class="form-field">
                  <label class="pv-label" for="date-button">Starts</label>
                  ${this._renderDatePicker()}
                </div>
                <div class="form-field">
                  <label class="pv-label" for="end-date-button">Ends</label>
                  ${this._renderEndDatePicker()}
                </div>
              </div>
            ` : html`
              <div class="form-field">
                <label class="pv-label" for="date-button">Date</label>
                ${this._renderDatePicker()}
                ${this._renderEndsHint()}
              </div>
            `}

            <div class="all-day-row" @click=${this._toggleAllDay}>
              <span class="all-day-label" id="all-day-label">All day</span>
              <div
                class="pv-toggle ${this._allDay ? 'active' : ''}"
                role="switch"
                tabindex="0"
                aria-checked="${this._allDay}"
                aria-labelledby="all-day-label"
                @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._toggleAllDay(); }}}
              ></div>
            </div>

            ${!this._allDay ? html`
              <div class="form-row">
                <div class="form-field">
                  <label class="pv-label" for="starts-button">Starts</label>
                  <button type="button" id="starts-button" class="time-display start-time-display"
                    aria-expanded=${this._activeTimePicker === 'start' ? 'true' : 'false'}
                    @click=${() => this._openTimePicker('start')}>
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTimeForDisplay(this._startTime)}
                  </button>
                </div>
                <div class="form-field">
                  <label class="pv-label" for="ends-button">Ends</label>
                  <button type="button" id="ends-button" class="time-display end-time-display"
                    aria-expanded=${this._activeTimePicker === 'end' ? 'true' : 'false'}
                    @click=${() => this._openTimePicker('end')}>
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._formatTimeForDisplay(this._endTime)}
                  </button>
                </div>
              </div>
            ` : nothing}

            ${!this._showMore ? html`
              <button class="show-more-btn" type="button" @click=${() => this._showMore = true}>
                <ha-icon icon="mdi:plus"></ha-icon>
                Add a description or location
              </button>
            ` : html`
              <div class="form-field">
                <label class="pv-label" for="description-input">Description</label>
                <textarea
                  id="description-input"
                  class="pv-input"
                  rows="3"
                  placeholder="Add a description"
                  .value=${this._description}
                  @input=${(e: Event) => this._description = (e.target as HTMLTextAreaElement).value}
                  style="resize: vertical; min-height: 80px;"
                ></textarea>
              </div>
              <div class="form-field">
                <label class="pv-label" for="location-input">Location</label>
                ${this._renderLocationField()}
              </div>
            `}
          </div>
        </div>

        <div class="footer">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._saving} @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving ? 'Saving…' : (isEdit ? 'Save' : 'Add')}
          </button>
        </div>
      </div>

      ${this._renderLocationDropdown()}
      ${this._renderDatePickerDropdown()}
      ${this._renderTimePickerDropdown()}
      ${this._askDiscard ? html`
        <pv-notice-sheet
          .layout=${this.layout}
          .heading=${isEdit ? 'Discard your changes?' : 'Discard this event?'}
          .actions=${DISCARD_ACTIONS}
          @pv-sheet-action=${this._onDiscardChoice}
        ></pv-notice-sheet>
      ` : nothing}
    `;
  }

  /** The editor's fields, to tell whether anything changed since it opened. */
  private _signature(): string {
    return formSignature({
      title: this._title,
      calendars: this._selectedCalendars,
      date: this._date,
      allDay: this._allDay,
      startTime: this._startTime,
      endTime: this._endTime,
      spanDays: this._spanDays,
      endDayOffset: this._endDayOffset,
      description: this._description,
      location: this._location,
    });
  }

  /** Escape closes an open picker before the sheet; true when there was one. Focus goes back to its field unless a question takes it. */
  private _closePickers(refocus = true): boolean {
    const open = this._datePickerOpen || this._activeTimePicker !== null || this._locationSuggestions.length > 0;
    if (!open) return false;
    const field = this._datePickerOpen ? (this._dateTarget === 'end' ? this._endDateDisplay : this._dateDisplay)
      : this._activeTimePicker === 'start' ? this._startTimeEl
        : this._activeTimePicker === 'end' ? this._endTimeEl
          : this._locationInput;
    this._datePickerOpen = false;
    this._activeTimePicker = null;
    this._resetLocationSearch();
    if (refocus) this._focusAfterUpdate(() => field ?? null);
    return true;
  }

  /** An error shows at the top of the form, scrolled into view (on a phone the form may be scrolled down to Location). */
  private _showError(text: string): void {
    this._error = text;
    void this.updateComplete.then(() => this.renderRoot.querySelector('.error-msg')?.scrollIntoView({ block: 'nearest' }));
  }

  /** Focus an element once the next render is in (a picker that closes takes its focused button with it). */
  private _focusAfterUpdate(target: () => HTMLElement | null): void {
    void this.updateComplete.then(() => target()?.focus());
  }

  /** A dismiss throws nothing away without asking (spec 11.7). */
  private _mayDismiss(): boolean {
    if (this._saving) return false;
    if (this._signature() === this._baseline) return true;
    // The discard question takes focus, so the picker's field doesn't.
    this._closePickers(false);
    this._askDiscard = true;
    return false;
  }

  private _onDiscardChoice = (e: CustomEvent<{ id: string }>): void => {
    this._askDiscard = false;
    if (e.detail.id === 'discard') void this._sheet.close();
    else void this.updateComplete.then(() => this._titleInput?.focus());
  };

  private _toggleAllDay = (): void => {
    this._allDay = !this._allDay;
  };

  // ==================================================================
  // CUSTOM DATE PICKER
  // ==================================================================

  private _renderDatePicker() {
    return html`
      <div class="date-picker-wrap">
        <button type="button" id="date-button" class="date-display"
          aria-expanded=${this._datePickerOpen && this._dateTarget === 'start' ? 'true' : 'false'} @click=${() => this._toggleDatePicker('start')}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._formatDateDisplay()}
        </button>
      </div>
    `;
  }

  /** An all-day event's last day (Home Assistant stores the day after). */
  private _renderEndDatePicker() {
    return html`
      <div class="date-picker-wrap">
        <button type="button" id="end-date-button" class="date-display end-date-display"
          aria-expanded=${this._datePickerOpen && this._dateTarget === 'end' ? 'true' : 'false'} @click=${() => this._toggleDatePicker('end')}>
          <ha-icon icon="mdi:calendar"></ha-icon>
          ${this._date ? dateLabel(formEndDate(this._formDates)) : 'Pick a date'}
        </button>
      </div>
    `;
  }

  private _renderDatePickerDropdown() {
    if (!this._datePickerOpen) return nothing;

    const end = this._dateTarget === 'end';
    const el = end ? this._endDateDisplay : this._dateDisplay;
    if (!el) return nothing;
    const rect = el.getBoundingClientRect();

    // Below the field, or above it when it won't fit; never off the screen.
    const dropdownHeight = 384; // the header, the weekdays, and six 48 px weeks
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    const wanted = placeAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    const top = Math.max(8, Math.min(wanted, window.innerHeight - dropdownHeight - 8));

    return html`
      <div
        class="date-picker-dropdown"
        style="top: ${top}px; left: ${rect.left}px;"
        @keydown=${this._sheet.onKeydown}
      >
        ${monthGrid({
          year: this._pickerYear, month: this._pickerMonth,
          selected: end ? formEndDate(this._formDates) : this._date,
          min: end ? this._date : undefined,
          onPick: day => this._selectPickerDay(day),
          onPrev: () => this._pickerPrevMonth(),
          onNext: () => this._pickerNextMonth(),
        })}
      </div>
    `;
  }

  private _toggleDatePicker(target: 'start' | 'end' = 'start') {
    this._activeTimePicker = null;
    this._datePickerOpen = !(this._datePickerOpen && this._dateTarget === target);
    this._dateTarget = target;
    const shown = target === 'end' ? formEndDate(this._formDates) : this._date;
    if (this._datePickerOpen && shown) {
      const [y, m] = shown.split('-').map(Number);
      this._pickerYear = y;
      this._pickerMonth = m - 1;
    }
    if (this._datePickerOpen) {
      this._focusAfterUpdate(() =>
        this.renderRoot.querySelector<HTMLElement>('.picker-day.selected')
        ?? this.renderRoot.querySelector<HTMLElement>('.picker-day.today')
        ?? this.renderRoot.querySelector<HTMLElement>('.picker-day'));
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

  private _selectPickerDay(day: string) {
    const end = this._dateTarget === 'end';
    // A new start keeps the event's length; a new last day changes it (spec 3.4).
    if (end) this._spanDays = withAllDayEnd(this._formDates, day).spanDays;
    else this._date = withAllDayStart(this._formDates, day).date;
    this._datePickerOpen = false;
    this._focusAfterUpdate(() => (end ? this._endDateDisplay : this._dateDisplay) ?? null);
  }

  // ==================================================================
  // CUSTOM TIME PICKER
  // ==================================================================

  private _formatTimeForDisplay(time24: string): string {
    if (!time24) return 'Pick a time';
    const [h, m] = time24.split(':').map(Number);
    if (this.timeFormat === '24h') {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }


  private _openTimePicker(which: 'start' | 'end') {
    this._datePickerOpen = false;
    this._activeTimePicker = this._activeTimePicker === which ? null : which;
    if (this._activeTimePicker) {
      this.updateComplete.then(() => {
        const dropdown = this.renderRoot.querySelector('.time-picker-dropdown');
        const selected = dropdown?.querySelector('.time-slot.selected') as HTMLElement | null;
        if (selected && dropdown) {
          dropdown.scrollTop = selected.offsetTop - dropdown.clientHeight / 2 + selected.clientHeight / 2;
        }
        (selected ?? dropdown?.querySelector<HTMLElement>('.time-slot'))?.focus({ preventScroll: true });
      });
    }
  }

  private _selectTime(time: string) {
    if (this._activeTimePicker === 'start') {
      // Moves a same-day end to an hour after the new start when needed
      const next = withStartTime(this._formDates, time);
      this._startTime = next.startTime;
      this._endTime = next.endTime;
      this._endDayOffset = next.endDayOffset;
    } else {
      // Ends on the start day when the picked time is after the start
      const next = withEndTime(this._formDates, time);
      this._endTime = next.endTime;
      this._endDayOffset = next.endDayOffset;
    }
    const field = this._activeTimePicker === 'start' ? this._startTimeEl : this._endTimeEl;
    this._activeTimePicker = null;
    this._focusAfterUpdate(() => field ?? null);
  }

  private _renderTimePickerDropdown() {
    if (!this._activeTimePicker) return nothing;

    const el = this._activeTimePicker === 'start' ? this._startTimeEl : this._endTimeEl;
    if (!el) return nothing;
    const rect = el.getBoundingClientRect();
    const currentTime = this._activeTimePicker === 'start' ? this._startTime : this._endTime;
    const slots = timeSlots();

    const dropdownHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    const top = placeAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4;

    return html`
      <div
        class="time-picker-dropdown"
        style="top: ${top}px; left: ${rect.left}px; width: ${rect.width}px;"
        @keydown=${this._sheet.onKeydown}
      >
        ${timeList({ slots, selected: currentTime, format: this.timeFormat === '24h' ? '24h' : '12h', onPick: slot => this._selectTime(slot) })}
      </div>
    `;
  }

  // ==================================================================
  // LOCATION (plain text; opt-in Photon suggestions, see utils/location-search)
  // ==================================================================

  /** cancel() never reports onLoading(false), so every cancel goes through here. */
  private _resetLocationSearch() {
    this._locationSearch.cancel();
    this._locationSuggestions = [];
    this._locationLoading = false;
  }

  private _renderLocationField() {
    return html`
      <div class="location-wrap">
        <input
          id="location-input"
          class="pv-input location-input"
          type="text"
          placeholder=${this.locationAutocomplete ? 'Search for a place or address' : 'Add a location'}
          .value=${this._location}
          @input=${this._onLocationInput}
          @focus=${() => this._locationFocused = true}
          @blur=${() => { setTimeout(() => { this._locationFocused = false; }, 250); }}
        />
      </div>
    `;
  }

  private _renderLocationDropdown() {
    if (!this.locationAutocomplete || !this._locationFocused ||
        (!this._locationSuggestions.length && !this._locationLoading)) {
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
        @keydown=${this._sheet.onKeydown}
      >
        ${this._locationLoading ? html`
          <div class="location-loading">Searching…</div>
        ` : nothing}
        ${this._locationSuggestions.map(s => html`
          <button type="button" class="location-suggestion"
            @mousedown=${(e: Event) => e.preventDefault()}
            @click=${() => this._selectLocation(s)}>
            <ha-icon icon="mdi:map-marker"></ha-icon>
            <span>${s}</span>
          </button>
        `)}
        ${this._locationSuggestions.length > 0 ? html`
          <div class="location-powered">Suggestions by Photon &middot; &copy; OpenStreetMap contributors</div>
        ` : nothing}
      </div>
    `;
  }

  private _onLocationInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this._location = value;
    // Sends nothing unless the location_autocomplete setting is on.
    this._locationSearch.input(value, this.locationAutocomplete);
  }

  private _selectLocation(name: string) {
    this._resetLocationSearch();
    this._location = name;
    this._locationFocused = false;
  }

  // ==================================================================
  // DIALOG ACTIONS
  // ==================================================================

  private _toggleCalendar(entityId: string) {
    const isEdit = this.mode === 'edit';

    // In edit mode, the organizer cannot be deselected
    if (isEdit && entityId === this._organizerEntityId) return;

    const next = new Set(this._selectedCalendars);

    if (next.has(entityId)) {
      // Deselecting
      next.delete(entityId);

      // If the organizer was deselected, promote the next selected calendar
      if (entityId === this._organizerEntityId) {
        this._organizerEntityId = next.size > 0 ? [...next][0] : '';
      }
    } else {
      // Selecting
      next.add(entityId);

      // First selection becomes the organizer
      if (!this._organizerEntityId) {
        this._organizerEntityId = entityId;
      }
    }

    this._selectedCalendars = next;
    this._removeGuestsHint = false;
  }

  /** Cancel: the deliberate way out, so it doesn't ask first. */
  private _cancel = (): void => {
    // A save that is running finishes first: it closes the sheet itself, and must not close one opened since.
    if (this._saving) return;
    this._datePickerOpen = false;
    this._activeTimePicker = null;
    this._resetLocationSearch();
    void this._sheet.close();
  };

  private async _editFallback(
    baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string },
    selected: Set<string>,
    original: Set<string>,
  ) {
    const uid = this.prefill?.uid;
    const recurrenceId = this.prefill?.recurrence_id;
    const primaryEntityId = this.prefill?.calendar_entity_id;
    // Each person's own copy (off Google every copy has its own uid).
    const copies = (this.prefill as { shared_calendars?: Array<{ entity_id: string; uid?: string; recurrence_id?: string }> } | null)?.shared_calendars ?? [];
    const copyOn = (entityId: string): { uid?: string; recurrence_id?: string } => {
      const copy = copies.find(c => c.entity_id === entityId);
      return copy?.uid ? { uid: copy.uid, recurrence_id: copy.recurrence_id } : { uid, recurrence_id: recurrenceId };
    };

    const added = [...selected].filter(id => !original.has(id));
    const removed = [...original].filter(id => !selected.has(id));
    const kept = [...selected].filter(id => original.has(id));

    if (primaryEntityId && kept.includes(primaryEntityId) && uid) {
      const plan = planEdit(this.prefill as CalendarEvent, primaryEntityId, baseData);
      await this.store.doEditEvent(this.hass, plan.deleteData, plan.createData, plan.restoreData);
    } else if (primaryEntityId && removed.includes(primaryEntityId) && uid) {
      await deleteEvent(this.hass, { entity_id: primaryEntityId, uid, recurrence_id: recurrenceId });
    }

    for (const entityId of kept) {
      if (entityId === primaryEntityId) continue;
      const copy = copyOn(entityId);
      if (copy.uid) {
        try {
          await deleteEvent(this.hass, { entity_id: entityId, uid: copy.uid, recurrence_id: copy.recurrence_id });
        } catch { /* may not exist */ }
      }
      await createEvent(this.hass, { ...baseData, entity_id: entityId } as CreateEventData);
    }

    for (const entityId of added) {
      await createEvent(this.hass, { ...baseData, entity_id: entityId } as CreateEventData);
    }

    for (const entityId of removed) {
      if (entityId === primaryEntityId) continue;
      const copy = copyOn(entityId);
      if (copy.uid) {
        try {
          await deleteEvent(this.hass, { entity_id: entityId, uid: copy.uid, recurrence_id: copy.recurrence_id });
        } catch { /* may not exist */ }
      }
    }

    await refreshPlanaVista(this.hass);
    this.store.selectedEvent = null;
    this.store.closeDialog();
  }

  private async _save() {
    if (!this._title.trim()) {
      this._showError('Give the event a title.');
      return;
    }
    if (this._selectedCalendars.size === 0) {
      this._showError("Pick who it's for.");
      return;
    }

    const dateError = validateFormDates(this._formDates);
    if (dateError) {
      this._showError(dateError);
      return;
    }

    // An edit changes the calendars it leaves as well as the ones it joins (D1).
    if (this._gating) return;
    const touched = this.mode === 'edit' ? new Set([...this._originalCalendars, ...this._selectedCalendars]) : this._selectedCalendars;
    // Never silent: when no PIN on this screen could allow it, say who can (review).
    if (this.gate && !this.gate.allowed([...touched])) {
      this._showError(this.gate.note([...touched]));
      return;
    }
    this._gating = true;
    const allowed = this.gate ? await this.gate.ask([...touched], this._title) : true;
    this._gating = false;
    if (!allowed) return;

    this._error = '';
    this._saving = true;

    try {
      // Base event data (without entity_id, set per calendar). All-day ends
      // are exclusive; an edited event keeps its original length.
      const baseData: Omit<CreateEventData, 'entity_id'> & { entity_id?: string } = buildEventBase(this._formDates, {
        summary: this._title,
        description: this._description,
        location: this._location,
      });

      const selected = this._selectedCalendars;
      const original = this._originalCalendars;

      if (this.mode === 'edit') {
        const uid = this.prefill?.uid;
        const isSharedEvent = original.size > 1;
        const organizerEntity = this._organizerEntityId || this.prefill?.calendar_entity_id || '';

        if (isSharedEvent && uid && organizerEntity) {
          // Shared Google Calendar event: use PATCH to update in-place
          // This preserves the event ID and attendee linking
          const allParticipantEntityIds = [...selected];
          try {
            await updateEvent(this.hass, {
              entity_id: organizerEntity,
              uid,
              summary: baseData.summary,
              description: baseData.description || '',
              location: baseData.location || '',
              start_date_time: baseData.start_date_time,
              end_date_time: baseData.end_date_time,
              start_date: baseData.start_date,
              end_date: baseData.end_date,
              attendee_entity_ids: allParticipantEntityIds,
            });
          } catch (err) {
            console.warn('[PlanaVista] update_event WS failed, falling back to delete+recreate:', err);
            // Fallback: delete + recreate on each calendar (breaks linking but at least works)
            await this._editFallback(baseData, selected, original);
          }

          // Delayed refresh: give Google ~3s to propagate
          const calEntities = [...selected, ...original];
          const hass = this.hass;
          this.store.selectedEvent = null;
          this.store.closeDialog();
          setTimeout(async () => {
            try {
              const unique = [...new Set(calEntities)];
              for (const eid of unique) {
                await hass.callService('homeassistant', 'update_entity', { entity_id: eid });
              }
              await refreshPlanaVista(hass);
            } catch { /* best-effort */ }
          }, 3000);
        } else if (selected.size > 1 && uid) {
          // Was single-calendar, now adding guests: delete old + create with
          // attendees, putting the original back if the create fails
          const original = this.prefill as CalendarEvent;
          const primaryEntityId = original.calendar_entity_id;
          const primaryId = organizerEntity || [...selected][0];
          const attendeeIds = [...selected].filter(id => id !== primaryId);
          try {
            await runEditWithRestore({
              remove: () => deleteEvent(this.hass, buildDeleteData(original, primaryEntityId)),
              create: () => createEventWithAttendees(this.hass, {
                ...baseData,
                entity_id: primaryId,
                attendee_entity_ids: attendeeIds,
              } as CreateEventData & { attendee_entity_ids: string[] }),
              restore: () => createEvent(this.hass, buildRestoreData(original, primaryEntityId)),
            });
          } catch (editErr) {
            // The delete may have gone through even though the edit failed, so show the calendar as it is now
            await refreshPlanaVista(this.hass).catch(() => {});
            throw editErr;
          }

          // Delayed refresh for Google propagation
          const calEntities = [...selected];
          const hass = this.hass;
          this.store.selectedEvent = null;
          this.store.closeDialog();
          setTimeout(async () => {
            try {
              for (const eid of calEntities) {
                await hass.callService('homeassistant', 'update_entity', { entity_id: eid });
              }
              await refreshPlanaVista(hass);
            } catch { /* best-effort */ }
          }, 3000);
        } else {
          // Single-calendar event staying single: delete + recreate; the
          // state manager restores the original if the recreate fails
          const primaryEntityId = this.prefill?.calendar_entity_id || '';
          const plan = planEdit(this.prefill as CalendarEvent, primaryEntityId, baseData);
          await this.store.doEditEvent(this.hass, plan.deleteData, plan.createData, plan.restoreData);
        }
      } else {
        // Create mode
        const entityIds = [...selected];

        if (entityIds.length > 1) {
          // Multiple calendars: use attendees service (Google API when available)
          const primaryId = this._organizerEntityId || entityIds[0];
          const attendeeIds = entityIds.filter(id => id !== primaryId);
          await createEventWithAttendees(this.hass, {
            ...baseData,
            entity_id: primaryId,
            attendee_entity_ids: attendeeIds,
          } as CreateEventData & { attendee_entity_ids: string[] });

          // Close dialog immediately for snappy UX
          this.store.closeDialog();

          // Delayed refresh: give Google ~3s to propagate, then force
          // HA to re-fetch calendar entities before refreshing PlanaVista
          const calEntities = [...selected];
          const hass = this.hass;
          setTimeout(async () => {
            try {
              for (const eid of calEntities) {
                await hass.callService('homeassistant', 'update_entity', { entity_id: eid });
              }
              await refreshPlanaVista(hass);
            } catch {
              // Refresh is best-effort
            }
          }, 3000);
        } else {
          // Single calendar: use normal create
          const data: CreateEventData = { ...baseData, entity_id: entityIds[0] } as CreateEventData;
          await this.store.doCreateEvent(this.hass, data);
        }
      }
    } catch (err: any) {
      // Home Assistant's own words go to the log; people get plain ones (spec 11.7).
      console.error('PlanaVista: Saving the event failed', err);
      this._showError(err instanceof EditRestoreError ? err.message : saveFailedText(this._title, this.mode === 'edit'));
      this._saving = false;
    }
  }
}

defineElement('pv-event-create-dialog', PVEventCreateDialog);
