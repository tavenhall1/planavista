import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import { tagStyles } from '../../../styles/controls';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarConfig, CalendarEvent } from '../../../types';
import type { Layout } from '../../../core/layout';
import { CalendarStore, StoreSubscriber } from '../calendar-store';
import { deleteEvent, refreshPlanaVista, getEventOrganizer } from '../../../utils/ha-utils';
import { buttonStyles } from '../../../styles/shared';
import { sheetStyles } from '../../../styles/sheet';
import { statusStyles } from '../../../styles/status';
import { contrastText } from '../../../core/color';
import { SheetController } from '../../../shell/sheet-controller';
import type { NoticeAction } from '../../../shell/pv-notice-sheet';
import '../../../shell/pv-notice-sheet';
import { calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen } from '../event-words';
import { EventGate, calendarsOf } from '../event-gate';
import { backdropTap } from '../../../core/backdrop';
import { SheetLayer } from '../../../core/sheet-layer';
import { PressGuard } from '../../../core/press-guard';

interface Participant {
  entity_id: string;
  calendar_name: string;
  calendar_color: string;
  /** This person's own copy: off Google each copy has its own uid. */
  uid?: string;
  recurrence_id?: string;
}

function participantsOf(event: CalendarEvent): Participant[] {
  return ((event as { shared_calendars?: Participant[] }).shared_calendars ?? []);
}

/**
 * pv-event-popup: an event's details as a sheet (spec 11.5, 11.8, 12.3): it
 * rises from the bottom in portrait and on phones and pops in as a card in
 * landscape, keeps Tab inside, closes on Escape, a tap outside, a drag, or
 * Done, and asks by name before a delete.
 *
 * @fires pv-sheet-close - once it has left (Done, Escape, outside, a drag, or `leaving`)
 */
export class PVEventPopup extends LitElement {
  /** Closes the sheet only after a press that began on the backdrop (core/backdrop). */
  private readonly _backdrop = backdropTap(() => this._sheet.dismiss());
  private readonly _layer = new SheetLayer(this);
  private readonly _pressGuard = new PressGuard(this);
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) event: CalendarEvent | null = null;
  /** Who may change it here (D1); without one, anyone may. */
  @property({ attribute: false }) gate?: EventGate;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** The calendars shown, for what each one lets PlanaVista change. */
  @property({ attribute: false }) calendars: CalendarConfig[] = [];
  /** Set once nothing wants the sheet (a delete done, an edit saved): it plays its exit. */
  @property({ type: Boolean }) leaving = false;
  /** Now, to the minute, for the Now and In N min badges. */
  @property({ attribute: false }) now: Date = new Date();

  /** The calendar state of the card that opened this. */
  @property({ attribute: false }) store!: CalendarStore;

  @state() private _asking = false;
  @state() private _deleting = false;
  @state() private _error = '';
  @state() private _organizerEntityId: string | null = null;

  /** Re-renders when that store changes (the controller registers itself with this element). */
  private _storeSubscription = new StoreSubscriber(this, () => this.store);
  private _sheet = new SheetController(this, { mayDismiss: () => !this._deleting });
  private _lastOrganizerUid = '';

  static styles = [
    tagStyles,
    buttonStyles,
    sheetStyles,
    statusStyles,
    css`
      .heading {
        text-align: left;
        font-weight: 800;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .heading:focus {
        outline: none;
      }



      .people {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }

      .person {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 700;
      }

      .status {
        margin-top: 10px;
      }

      .rows {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 16px 0 4px;
      }

      .row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        line-height: 1.4;
      }

      .row ha-icon {
        --mdc-icon-size: 20px;
        color: var(--pv-text-secondary, #5F6670);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .row .sub {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .row .notes {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .note {
        margin: 12px 0 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .error {
        margin: 12px 0 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-size: 0.875rem;
        line-height: 1.4;
      }



    `,
  ];

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('leaving') && this.leaving) void this._sheet.close();
    if (changed.has('event') && this.event) {
      const shared = participantsOf(this.event);
      const uid = this.event.uid || '';
      if (shared.length > 1 && uid && uid !== this._lastOrganizerUid) {
        this._lastOrganizerUid = uid;
        this._organizerEntityId = null;
        void this._fetchOrganizer(this.event.calendar_entity_id, uid);
      } else if (shared.length <= 1) {
        this._organizerEntityId = null;
        this._lastOrganizerUid = '';
      }
    }
  }

  private async _fetchOrganizer(entityId: string, uid: string) {
    this._organizerEntityId = await getEventOrganizer(this.hass, entityId, uid);
  }

  render() {
    const event = this.event;
    if (!event) return nothing;
    const shared = participantsOf(event);
    // Everyone it is for, as chips, the same way in every view (even for one person).
    const people = shared.length
      ? shared
      : [{ entity_id: event.calendar_entity_id, calendar_name: event.calendar_name, calendar_color: event.calendar_color }];
    const when = eventWhen(event, this.timeFormat, this.now);
    const status = eventStatus(event, this.now);
    const calendar = this.calendars.find(c => c.entity_id === event.calendar_entity_id);
    const can = calendarCan(calendar?.attributes);
    const changeable = !!event.uid;
    const ids = calendarsOf(event);
    const allowed = this.gate?.allowed(ids) ?? true;
    const question = deleteQuestion(event, shared.length > 1 ? shared.map(p => p.calendar_name) : []);

    return html`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="event-title" @keydown=${this._sheet.onKeydown}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="event-title" tabindex="-1">${event.summary?.trim() || 'Untitled event'}</h2>
        <div class="people">
          ${people.map(p => html`
            <span class="person" style="background: ${p.calendar_color}; color: ${contrastText(p.calendar_color)}">${p.calendar_name}</span>
            ${people.length > 1 && p.entity_id === this._organizerEntityId ? html`<span class="pv-tag muted">Organizer</span>` : nothing}
          `)}
        </div>
        ${status ? html`<div class="status"><span class="badge ${status.tone}">${status.words}</span></div>` : nothing}

        <div class="rows">
          <div class="row">
            <ha-icon icon="mdi:clock-outline"></ha-icon>
            <div><div>${when.date}</div><div class="sub">${when.time}</div></div>
          </div>
          ${event.location ? html`
            <div class="row"><ha-icon icon="mdi:map-marker-outline"></ha-icon><div>${event.location}</div></div>
          ` : nothing}
          ${event.description ? html`
            <div class="row"><ha-icon icon="mdi:text"></ha-icon><div class="notes">${event.description}</div></div>
          ` : nothing}
        </div>

        ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
        ${!changeable || (!can.edit && !can.delete) ? html`
          <p class="note">This event can only be changed in its calendar's own app.</p>
        ` : !allowed ? html`
          <p class="note">${this.gate?.note(ids)}</p>
        ` : nothing}

        <div class="actions">
          ${allowed && changeable && can.edit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${this._edit}>Edit</button>` : nothing}
          ${allowed && changeable && can.delete ? html`
            <button class="pv-btn pv-btn-secondary danger apart" type="button" ?disabled=${this._deleting}
              @click=${this._askDelete}>${this._deleting ? 'Deleting…' : 'Delete event'}</button>
          ` : nothing}
          <button class="pv-btn pv-btn-secondary ${allowed && changeable && can.delete ? 'apart' : ''}" type="button" ?disabled=${this._deleting} @click=${() => void this._sheet.close()}>Done</button>
        </div>
      </div>
      ${this._asking ? html`
        <pv-notice-sheet
          .layout=${this.layout}
          .heading=${question.heading}
          .body=${question.body}
          .actions=${this._deleteActions(question.shared, eventName(event))}
          @pv-sheet-action=${this._onDeleteChoice}
        ></pv-notice-sheet>
      ` : nothing}
    `;
  }

  private _deleteActions(shared: boolean, name: string): NoticeAction[] {
    return shared
      ? [
          { id: 'everyone', label: 'Delete for everyone', kind: 'destructive' },
          { id: 'remove', label: 'Remove someone', kind: 'secondary' },
          { id: 'cancel', label: 'Cancel', kind: 'secondary' },
        ]
      : [
          { id: 'delete', label: `Delete ${eventName({ summary: name })}`, kind: 'destructive' },
          { id: 'cancel', label: 'Cancel', kind: 'secondary' },
        ];
  }

  private _onDeleteChoice = (e: CustomEvent<{ id: string }>): void => {
    this._asking = false;
    const id = e.detail.id;
    if (id === 'delete' || id === 'everyone') {
      void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('#event-title')?.focus());
      void this._delete(id === 'everyone');
    }
    else if (id === 'remove' && this.event) {
      // Delete gets focus first, so it gets it back when the editor closes.
      this.renderRoot.querySelector<HTMLElement>('.danger')?.focus();
      this.store.openEditDialog(this.event, { removeGuests: true });
    }
    else void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.danger')?.focus());
  };

  /** A PIN first when this screen needs one (D1), then the editor. */
  private async _edit(): Promise<void> {
    const event = this.event;
    if (!event || !(await this._mayChange(event))) return;
    // The sheet may have been handed a fresh copy meanwhile (the minute's refresh); it is the same event.
    if (this.isConnected && this.event) this.store.openEditDialog(this.event);
  }

  /** A PIN first when this screen needs one (D1), then the question. */
  private _askDelete = async (): Promise<void> => {
    const event = this.event;
    if (!event || !(await this._mayChange(event))) return;
    if (this.isConnected && this.event) this._asking = true;
  };

  private _mayChange(event: CalendarEvent): Promise<boolean> {
    return this.gate ? this.gate.ask(calendarsOf(event), event.summary ?? '') : Promise.resolve(true);
  }

  private async _delete(everyone: boolean) {
    const event = this.event;
    if (!event?.uid) return;
    this._deleting = true;
    this._error = '';
    const shared = participantsOf(event);
    try {
      if (everyone && shared.length > 1) {
        // Each person's copy goes separately, by its own uid; any that stay are named.
        const failed: string[] = [];
        for (const participant of shared) {
          const copy = participant.uid
            ? { uid: participant.uid, recurrence_id: participant.recurrence_id }
            : { uid: event.uid, recurrence_id: event.recurrence_id };
          try {
            await deleteEvent(this.hass, { entity_id: participant.entity_id, ...copy });
          } catch (err) {
            console.warn(`[PlanaVista] Couldn't delete from ${participant.entity_id}:`, err);
            failed.push(participant.calendar_name);
          }
        }
        await refreshPlanaVista(this.hass).catch(() => undefined);
        if (failed.length) {
          this._error = deleteFailedText(event, failed, true);
          this._deleting = false;
          return;
        }
        this.store.selectEvent(null);
        return;
      }
      await this.store.doDeleteEvent(this.hass, {
        entity_id: event.calendar_entity_id,
        uid: event.uid,
        recurrence_id: event.recurrence_id,
      });
    } catch (err) {
      console.error('PlanaVista: Delete failed', err);
      this._error = deleteFailedText(event, [], false);
      this._deleting = false;
    }
  }
}

defineElement('pv-event-popup', PVEventPopup);
