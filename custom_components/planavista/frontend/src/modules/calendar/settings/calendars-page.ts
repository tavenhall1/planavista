import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { animationStyles, baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { settingsPageStyles } from '../../../styles/settings';
import type { HouseholdView } from '../../../core/household';
import { HouseholdApi, errorCode } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import { PAGE_ERROR, saveErrorMessage } from '../../../core/page-host';
import { inOrder } from '../../../core/household';
import { PvColorSwatchPicker } from '../../../core/color-swatch-picker';
import type { PlanaVistaData } from '../../../types';
import { CalendarRow, belongsTo, buildCalendarRows, toSavedCalendars } from '../calendar-rows';

/**
 * pv-calendar-calendars-page: which calendars show, how each looks, and who
 * each belongs to (Settings, Calendars; and the Calendars step of setup).
 * Each change saves as you tap; a name saves when the field is left.
 */
export class PvCalendarCalendarsPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  @state() private _rows: CalendarRow[] = [];
  @state() private _dragIdx: number | null = null;
  @state() private _dragOverIdx: number | null = null;
  private _built = false;

  protected willUpdate(): void {
    if (!this._built && this.hass && this.data) {
      const ids = Object.keys(this.hass.states).filter(id => id.startsWith('calendar.'));
      this._rows = buildCalendarRows(
        this.data.calendars as unknown as Array<Record<string, any>>,
        ids,
        id => this.hass.states[id]?.attributes?.friendly_name as string | undefined,
        PvColorSwatchPicker.PRESETS,
      );
      this._built = true;
    }
  }

  private _save(): void {
    this.api.saveConfig({ calendars: toSavedCalendars(this._rows) }).catch(err => this._error(err));
  }

  /** Tell the host a save failed (it shows the words in a toast). */
  private _error(err: unknown): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: saveErrorMessage(errorCode(err)) },
      bubbles: true,
      composed: true,
    }));
  }

  private get _personEntities(): string[] {
    if (!this.hass) return [];
    return Object.keys(this.hass.states).filter(k => k.startsWith('person.')).sort();
  }

  private _personLabel(entityId: string): string {
    return this._entityLabel(entityId);
  }

  private _entityLabel(entityId: string): string {
    return this.hass?.states[entityId]?.attributes?.friendly_name || entityId;
  }

  private _updateCalendar(idx: number, patch: Partial<CalendarRow>, save = true) {
    const updated = [...this._rows];
    updated[idx] = { ...updated[idx], ...patch };
    this._rows = updated;
    if (save) this._save();
  }

  private _onCalendarColorChange(idx: number, e: CustomEvent<{ color: string; colorLight: string }>) {
    e.stopPropagation();
    this._updateCalendar(idx, {
      color: e.detail.color,
      color_light: e.detail.colorLight,
    });
  }

  private _renderCalendars() {
    if (this._rows.length === 0) {
      return html`
        <div class="page-content">
          <p class="page-subtitle">No calendar entities found in Home Assistant.</p>
          <p class="empty-hint">Add calendar integrations (Google Calendar, CalDAV, etc.) and re-run setup.</p>
        </div>
      `;
    }

    return html`
      <div class="page-content">
        <div class="calendar-list">
          ${this._rows.map((cal, idx) => this._renderCalendarRow(cal, idx))}
        </div>
      </div>
    `;
  }

  private _onDragStart(idx: number, e: DragEvent) {
    this._dragIdx = idx;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    }
  }

  private _onDragOver(idx: number, e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    this._dragOverIdx = idx;
  }

  private _onDragLeave() {
    this._dragOverIdx = null;
  }

  private _onDrop(idx: number, e: DragEvent) {
    e.preventDefault();
    if (this._dragIdx !== null && this._dragIdx !== idx) {
      const updated = [...this._rows];
      const [moved] = updated.splice(this._dragIdx, 1);
      updated.splice(idx, 0, moved);
      this._rows = updated;
      this._save();
    }
    this._dragIdx = null;
    this._dragOverIdx = null;
  }

  private _onDragEnd() {
    this._dragIdx = null;
    this._dragOverIdx = null;
  }

  private _renderCalendarRow(cal: CalendarRow, idx: number) {
    const isDragging = this._dragIdx === idx;
    const isDragOver = this._dragOverIdx === idx && this._dragIdx !== idx;
    return html`
      <div class="cal-row ${isDragging ? 'cal-row--dragging' : ''} ${isDragOver ? 'cal-row--dragover' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._onDragStart(idx, e)}
        @dragover=${(e: DragEvent) => this._onDragOver(idx, e)}
        @dragleave=${this._onDragLeave}
        @drop=${(e: DragEvent) => this._onDrop(idx, e)}
        @dragend=${this._onDragEnd}
      >
        <!-- Always-visible header: checkbox + calendar name -->
        <div class="cal-header">
          <div class="cal-drag-handle" aria-label="Drag to reorder">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <label class="cal-checkbox-wrap" title="${cal.include ? 'Exclude this calendar' : 'Include this calendar'}">
            <input
              type="checkbox"
              class="cal-checkbox"
              .checked=${cal.include}
              @change=${(e: Event) => this._updateCalendar(idx, { include: (e.target as HTMLInputElement).checked })}
            />
            <span class="cal-checkbox-visual" aria-hidden="true">
              ${cal.include ? html`
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                </svg>
              ` : ''}
            </span>
          </label>
          <div class="cal-header-info">
            <span class="cal-friendly-name">${cal.display_name || cal.entity_id}</span>
            <span class="cal-entity-id">${cal.entity_id}</span>
          </div>
        </div>

        <!-- Expandable details: only shown when included -->
        ${cal.include ? html`
          <div class="cal-details">
            <!-- Display name input -->
            <div class="cal-field">
              <label class="pv-label" for="cal-name-${idx}">Display Name</label>
              <input
                id="cal-name-${idx}"
                type="text"
                class="pv-input cal-name-input"
                .value=${cal.display_name}
                placeholder="Calendar name"
                @input=${(e: Event) => this._updateCalendar(idx, { display_name: (e.target as HTMLInputElement).value }, false)}
                @change=${() => this._save()}
              />
            </div>

            <!-- Color picker -->
            <div class="cal-field">
              <label class="pv-label">Color</label>
              <pv-color-swatch-picker
                .value=${cal.color}
                .valueLight=${cal.color_light}
                @color-change=${(e: CustomEvent) => this._onCalendarColorChange(idx, e)}
              ></pv-color-swatch-picker>
            </div>

            <!-- Person entity link -->
            <div class="cal-field">
              <label class="pv-label" for="cal-person-${idx}">Link to Person</label>
              <select
                id="cal-person-${idx}"
                class="pv-input pv-select cal-person-select"
                .value=${cal.person_entity}
                @change=${(e: Event) => this._updateCalendar(idx, { person_entity: (e.target as HTMLSelectElement).value })}
              >
                <option value="">(None)</option>
                ${this._personEntities.map(p => html`
                  <option value="${p}" ?selected=${cal.person_entity === p}>${this._personLabel(p)}</option>
                `)}
              </select>
            </div>

            ${this._renderBelongsTo(cal, idx)}
          </div>
        ` : ''}
      </div>
    `;
  }


  /** Belongs to: fixed by a linked person who is in the household, else a choice (spec 14.5). */
  private _renderBelongsTo(cal: CalendarRow, idx: number) {
    if (!this.household?.available) return nothing;
    const members = inOrder(this.household.members);
    const owner = belongsTo(cal, members);
    return html`
      <div class="cal-field">
        <label class="pv-label" for="cal-owner-${idx}">Belongs to</label>
        <select
          id="cal-owner-${idx}"
          class="pv-input pv-select cal-person-select"
          .value=${owner.memberId ?? ''}
          ?disabled=${owner.viaPerson}
          @change=${(e: Event) => this._updateCalendar(idx, { member_id: (e.target as HTMLSelectElement).value || null })}
        >
          <option value="">Nobody</option>
          ${members.map(m => html`
            <option value="${m.id}" ?selected=${owner.memberId === m.id}>${m.name}</option>
          `)}
        </select>
        ${owner.viaPerson ? html`
          <p class="cal-owner-hint">Through ${this._personLabel(cal.person_entity)}'s Home Assistant person.</p>
        ` : nothing}
      </div>
    `;
  }

  render() {
    return this._built ? this._renderCalendars() : nothing;
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    animationStyles,
    settingsPageStyles,
    css`
.empty-hint {
        font-size: 0.875rem;
        color: var(--pv-text-muted, #9CA3AF);
        margin: 0.5rem 0 0;
      }
/* ── Calendar list (page 1) ─────────────────────────────── */
.calendar-list {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }
.cal-row {
        display: flex;
        flex-direction: column;
        padding: 0.875rem 1rem;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        border-radius: var(--pv-radius, 12px);
        background: var(--pv-card-bg, #FFFFFF);
        transition: border-color var(--pv-transition, 200ms ease), box-shadow var(--pv-transition, 200ms ease), opacity var(--pv-transition, 200ms ease);
      }
.cal-row:has(.cal-checkbox:checked) {
        border-color: var(--pv-accent, #6366F1);
      }
/* Always-visible header row */
.cal-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
.cal-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        cursor: grab;
        color: var(--pv-text-muted, #9CA3AF);
        border-radius: 4px;
        transition: color var(--pv-transition, 200ms ease);
      }
.cal-drag-handle:hover {
        color: var(--pv-text-secondary, #6B7280);
      }
.cal-drag-handle:active {
        cursor: grabbing;
      }
.cal-row--dragging {
        opacity: 0.4;
      }
.cal-row--dragover {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 20%, transparent);
      }
.cal-header-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
      }
.cal-friendly-name {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pv-text, #1A1B1E);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
.cal-entity-id {
        font-size: 0.6875rem;
        color: var(--pv-text-muted, #9CA3AF);
        font-family: monospace;
        letter-spacing: 0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
/* Custom checkbox */
.cal-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
      }
.cal-checkbox {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }
.cal-checkbox-visual {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all var(--pv-transition, 200ms ease);
        color: var(--pv-accent-text, #FFFFFF);
      }
.cal-checkbox:checked + .cal-checkbox-visual {
        background: var(--pv-accent, #6366F1);
        border-color: var(--pv-accent, #6366F1);
      }
.cal-checkbox-wrap:hover .cal-checkbox-visual {
        border-color: var(--pv-accent, #6366F1);
      }
/* Expanded details (only shown when included) */
.cal-details {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
        margin-top: 0.875rem;
        padding-top: 0.875rem;
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
        animation: pv-fadeIn 200ms ease forwards;
      }
.cal-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
.cal-name-input {
        font-size: 0.9375rem;
      }
.cal-person-select {
        font-size: 0.875rem;
      }
.cal-owner-hint {
        margin: 0.375rem 0 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];
}

defineElement('pv-calendar-calendars-page', PvCalendarCalendarsPage);
