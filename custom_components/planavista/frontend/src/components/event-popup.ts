import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarEvent, DeleteEventData } from '../types';
import { PlanaVistaController } from '../state/state-manager';
import { baseStyles, buttonStyles, dialogStyles, animationStyles } from '../styles/shared';
import { formatTime, formatDate } from '../utils/date-utils';
import { isAllDayEvent } from '../utils/event-utils';

@customElement('pv-event-popup')
export class PVEventPopup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Object }) event: CalendarEvent | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';

  @state() private _confirmDelete = false;
  @state() private _deleting = false;
  @state() private _deleteError = '';

  private _pv = new PlanaVistaController(this);

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
    `,
  ];

  render() {
    if (!this.event) return nothing;

    const event = this.event;
    const allDay = isAllDayEvent(event);
    const startDate = new Date(event.start);

    return html`
      <div class="pv-overlay" @click=${this._close}>
        <div class="pv-popup" @click=${(e: Event) => e.stopPropagation()} style="position: relative;">
          <button class="pv-btn-icon close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>

          <div class="popup-header">
            <h3 class="popup-title">${event.summary}</h3>
            <div class="popup-calendar">
              <span class="calendar-indicator" style="background: ${event.calendar_color}"></span>
              ${event.calendar_name}
            </div>
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
              <div class="delete-confirm-text">
                Delete "${event.summary}"?
              </div>
              ${this._deleteError ? html`
                <div style="color: #EF4444; font-size: 0.8125rem; margin-top: 0.5rem;">${this._deleteError}</div>
              ` : nothing}
              <div class="delete-confirm-actions">
                <button class="pv-btn pv-btn-secondary" @click=${() => { this._confirmDelete = false; this._deleteError = ''; }}>
                  Cancel
                </button>
                <button class="pv-btn btn-delete" ?disabled=${this._deleting} @click=${this._delete}>
                  ${this._deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  private _close() {
    this._confirmDelete = false;
    this._deleting = false;
    this._deleteError = '';
    this._pv.state.selectEvent(null);
  }

  private _edit() {
    if (this.event) {
      this._pv.state.openEditDialog(this.event);
    }
  }

  private async _delete() {
    if (!this.event?.uid) {
      // Keep _confirmDelete true so the error message stays visible in the confirm view
      this._deleteError = 'Cannot delete — this event has no unique ID. Delete it from your calendar app directly.';
      return;
    }

    this._deleting = true;
    this._deleteError = '';
    try {
      const data: DeleteEventData = {
        entity_id: this.event.calendar_entity_id,
        uid: this.event.uid,
        recurrence_id: this.event.recurrence_id,
      };
      await this._pv.state.doDeleteEvent(this.hass, data);
    } catch (err) {
      console.error('PlanaVista: Delete failed', err);
      this._deleteError = 'Failed to delete event. Please try again.';
      this._deleting = false;
    }
  }
}
