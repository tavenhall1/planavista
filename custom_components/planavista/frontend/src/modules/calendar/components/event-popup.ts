import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, DeleteEventData } from '../../../types';
import { CalendarStore, StoreSubscriber } from '../calendar-store';
import { deleteEvent, refreshPlanaVista, getEventOrganizer } from '../../../utils/ha-utils';
import { baseStyles, buttonStyles, dialogStyles, animationStyles } from '../../../styles/shared';
import { formatTime, formatDate, parseEventDate } from '../../../utils/date-utils';
import { isAllDayEvent } from '../utils/event-utils';

export class PVEventPopup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Object }) event: CalendarEvent | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';

  @state() private _confirmDelete = false;
  @state() private _deleteMode: 'all' | 'remove-me' | null = null;
  @state() private _deleting = false;
  @state() private _deleteError = '';
  @state() private _organizerEntityId: string | null = null;

  /** The calendar state of the card that opened this. */
  @property({ attribute: false }) store!: CalendarStore;
  /** Re-renders when that store changes (the controller registers itself with this element). */
  private _storeSubscription = new StoreSubscriber(this, () => this.store);
  private _lastOrganizerUid = '';

  updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (changedProps.has('event') && this.event) {
      const shared = (this.event as any).shared_calendars;
      const uid = this.event.uid || '';
      if (shared && shared.length > 1 && uid && uid !== this._lastOrganizerUid) {
        this._lastOrganizerUid = uid;
        this._organizerEntityId = null;
        this._fetchOrganizer(this.event.calendar_entity_id, uid);
      } else if (!shared || shared.length <= 1) {
        this._organizerEntityId = null;
        this._lastOrganizerUid = '';
      }
    }
  }

  private async _fetchOrganizer(entityId: string, uid: string) {
    this._organizerEntityId = await getEventOrganizer(this.hass, entityId, uid);
  }

  static styles = [
    baseStyles,
    buttonStyles,
    dialogStyles,
    animationStyles,
    css`
      :host { display: block; }

      .popup-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--pv-border-subtle);
      }

      .popup-title {
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--pv-text);
        margin: 0;
      }

      .popup-calendar {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        margin-top: 0.375rem;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary);
      }

      .calendar-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .popup-body {
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        font-size: 0.9375rem;
        color: var(--pv-text);
      }

      .detail-row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .detail-text {
        flex: 1;
        min-width: 0;
        line-height: 1.4;
      }

      .detail-label {
        font-size: 0.75rem;
        color: var(--pv-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 0.125rem;
      }

      .popup-actions {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--pv-border-subtle);
      }

      .popup-actions .pv-btn {
        flex: 1;
      }

      .delete-confirm {
        padding: 0.75rem 1.5rem;
        background: color-mix(in srgb, #EF4444 6%, transparent);
        border-top: 1px solid color-mix(in srgb, #EF4444 15%, transparent);
      }

      .delete-confirm-text {
        font-size: 0.875rem;
        color: #B91C1C;
        margin-bottom: 0.75rem;
        font-weight: 500;
      }

      .delete-confirm-actions {
        display: flex;
        gap: 0.75rem;
      }

      .btn-delete {
        background: #EF4444;
        color: white;
      }

      .btn-delete:hover {
        background: #DC2626;
      }

      .close-btn {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
      }

      .participants-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
        margin-top: 0.25rem;
      }

      .participant-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        color: white;
      }

      .participant-chip .organizer-tag {
        font-size: 0.5625rem;
        opacity: 0.85;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .participant-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
      }

      .delete-option {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.75rem;
        border: 1px solid color-mix(in srgb, #EF4444 20%, var(--pv-border));
        border-radius: var(--pv-radius-sm, 8px);
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.8125rem;
        color: var(--pv-text);
        width: 100%;
        text-align: left;
        transition: background 150ms;
      }

      .delete-option:hover {
        background: color-mix(in srgb, #EF4444 6%, transparent);
      }

      .delete-option ha-icon {
        --mdc-icon-size: 20px;
        color: #EF4444;
        flex-shrink: 0;
      }

      .delete-option-text {
        flex: 1;
      }

      .delete-option-label {
        font-weight: 600;
        color: #B91C1C;
      }

      .delete-option-desc {
        font-size: 0.75rem;
        color: var(--pv-text-secondary);
        margin-top: 0.125rem;
      }
    `,
  ];

  render() {
    if (!this.event) return nothing;

    const event = this.event;
    const allDay = isAllDayEvent(event);
    const startDate = parseEventDate(event.start);
    const shared = (event as any).shared_calendars as Array<{ entity_id: string; calendar_name: string; calendar_color: string }> | undefined;
    const isShared = shared && shared.length > 1;

    return html`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${(e: Event) => e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${event.summary}</h3>
            ${isShared ? html`
              <div class="participants-row">
                ${shared!.map(p => html`
                  <span class="participant-chip" style="background: ${p.calendar_color}">
                    ${p.calendar_name}
                    ${p.entity_id === this._organizerEntityId
                      ? html`<span class="organizer-tag">organizer</span>`
                      : nothing}
                  </span>
                `)}
              </div>
            ` : html`
              <div class="popup-calendar">
                <span class="calendar-indicator" style="background: ${event.calendar_color}"></span>
                ${event.calendar_name}
              </div>
            `}
          </div>

          <div class="popup-body">
            <div class="detail-row">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
              <div class="detail-text">
                <div>${formatDate(startDate, 'long')}</div>
                ${!allDay ? html`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">
                    ${formatTime(event.start, this.timeFormat)} – ${formatTime(event.end, this.timeFormat)}
                  </div>
                ` : html`
                  <div style="color: var(--pv-text-secondary); font-size: 0.875rem">All Day</div>
                `}
              </div>
            </div>

            ${event.location ? html`
              <div class="detail-row">
                <ha-icon icon="mdi:map-marker-outline"></ha-icon>
                <div class="detail-text">${event.location}</div>
              </div>
            ` : nothing}

            ${event.description ? html`
              <div class="detail-row">
                <ha-icon icon="mdi:text"></ha-icon>
                <div class="detail-text" style="white-space: pre-wrap;">${event.description}</div>
              </div>
            ` : nothing}
          </div>

          ${!this._confirmDelete ? html`
            <div class="popup-actions">
              <button class="pv-btn pv-btn-secondary" @click=${this._edit}>
                <ha-icon icon="mdi:pencil-outline"></ha-icon>
                Edit
              </button>
              <button class="pv-btn pv-btn-secondary" style="color: #EF4444; border-color: #FCA5A5;"
                @click=${() => this._confirmDelete = true}>
                <ha-icon icon="mdi:delete-outline"></ha-icon>
                Delete
              </button>
            </div>
          ` : html`
            <div class="delete-confirm">
              ${this._deleteError ? html`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-bottom: 0.75rem;">${this._deleteError}</div>
              ` : nothing}

              ${isShared && !this._deleteMode ? html`
                <div class="delete-confirm-text">
                  This event is shared across ${shared!.length} calendars.
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                  <button class="delete-option" @click=${() => { this._deleteMode = 'all'; }}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                    <div class="delete-option-text">
                      <div class="delete-option-label">Delete for everyone</div>
                      <div class="delete-option-desc">Removes the event from all ${shared!.length} calendars</div>
                    </div>
                  </button>
                  <button class="delete-option" @click=${this._openRemoveGuests}>
                    <ha-icon icon="mdi:account-minus-outline"></ha-icon>
                    <div class="delete-option-text">
                      <div class="delete-option-label">Remove guests</div>
                      <div class="delete-option-desc">Edit the event to add or remove participants</div>
                    </div>
                  </button>
                  <button class="pv-btn pv-btn-secondary" style="margin-top: 0.25rem;"
                    @click=${() => { this._confirmDelete = false; this._deleteError = ''; this._deleteMode = null; }}>
                    Cancel
                  </button>
                </div>
              ` : html`
                <div class="delete-confirm-text">
                  ${this._deleteMode === 'all' && isShared
                    ? `Delete "${event.summary}" from all ${shared!.length} calendars?`
                    : this._deleteMode === 'remove-me' && isShared
                      ? `Remove "${event.summary}" from ${event.calendar_name}'s calendar only?`
                      : `Delete "${event.summary}"?`}
                </div>
                <div class="delete-confirm-actions">
                  <button class="pv-btn pv-btn-secondary" @click=${() => {
                    this._confirmDelete = false; this._deleteError = ''; this._deleteMode = null;
                  }}>
                    Cancel
                  </button>
                  <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                    ${this._deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              `}
            </div>
          `}
        </div>
      </div>
    `;
  }

  private _close() {
    this._confirmDelete = false;
    this._deleteMode = null;
    this._deleting = false;
    this._deleteError = '';
    this.store.selectEvent(null);
  }

  private _edit() {
    if (this.event) {
      this.store.openEditDialog(this.event);
    }
  }

  private _openRemoveGuests() {
    if (this.event) {
      this._confirmDelete = false;
      this._deleteMode = null;
      this.store.openEditDialog(this.event, { removeGuests: true });
    }
  }

  private async _delete() {
    if (!this.event?.uid) {
      this._deleteError = 'Cannot delete this event: it has no unique ID. Delete it from your calendar app directly.';
      return;
    }

    const shared = (this.event as any).shared_calendars as Array<{ entity_id: string }> | undefined;
    const isShared = shared && shared.length > 1;

    this._deleting = true;
    this._deleteError = '';

    try {
      if (isShared && this._deleteMode === 'all') {
        // Delete from ALL participant calendars
        for (const participant of shared!) {
          try {
            await deleteEvent(this.hass, {
              entity_id: participant.entity_id,
              uid: this.event.uid!,
              recurrence_id: this.event.recurrence_id,
            });
          } catch (e) {
            console.warn(`[PlanaVista] Failed to delete from ${participant.entity_id}:`, e);
          }
        }
        await refreshPlanaVista(this.hass);
        this.store.selectEvent(null);
      } else if (isShared && this._deleteMode === 'remove-me') {
        // Delete only from the organizer's calendar (first in shared list)
        const organizerId = this.event.calendar_entity_id;
        await deleteEvent(this.hass, {
          entity_id: organizerId,
          uid: this.event.uid!,
          recurrence_id: this.event.recurrence_id,
        });
        await refreshPlanaVista(this.hass);
        this.store.selectEvent(null);
      } else {
        // Single-calendar event: normal delete
        const data: DeleteEventData = {
          entity_id: this.event.calendar_entity_id,
          uid: this.event.uid,
          recurrence_id: this.event.recurrence_id,
        };
        await this.store.doDeleteEvent(this.hass, data);
      }
    } catch (err) {
      console.error('PlanaVista: Delete failed', err);
      this._deleteError = 'Failed to delete event. Please try again.';
      this._deleting = false;
    }
  }
}

defineElement('pv-event-popup', PVEventPopup);
