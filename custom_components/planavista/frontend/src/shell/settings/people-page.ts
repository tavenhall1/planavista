import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles } from '../../styles/shared';
import { HouseholdView, Member, inOrder, memberSummary } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { PAGE_ERROR, PUSH_PAGE, PushPageDetail, saveErrorMessage } from '../../core/page-host';
import { moveItem, rowIndexAt } from '../../core/reorder';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-member-avatar';

/**
 * pv-settings-people: everyone in board order (spec 14.2). Drag ≡, or use
 * the arrow keys on it, to change the order; tap a person to open their page.
 */
export class PvSettingsPeople extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  /** The order on screen while a drag or a save is under way. */
  @state() private _order: string[] | null = null;
  @state() private _dragging: string | null = null;

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        display: block;
        max-width: 640px;
      }

      .head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
      }

      .lead {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.5;
      }

      .add {
        min-height: 48px;
        white-space: nowrap;
      }

      ul {
        list-style: none;
        margin: 0 0 16px;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 4px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
      }

      li.dragging {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
        position: relative;
        z-index: 1;
      }

      .handle {
        width: 48px;
        height: 56px;
        border: none;
        background: transparent;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
        cursor: grab;
        touch-action: none;
      }

      .open {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        padding: 8px 8px 8px 0;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name {
        font-weight: 600;
      }

      .summary {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
      }

      .empty {
        margin: 24px 0;
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  private _members(): Member[] {
    const members = inOrder(this.household?.members ?? []);
    if (!this._order) return members;
    const byId = new Map(members.map(m => [m.id, m]));
    return this._order.map(id => byId.get(id)).filter((m): m is Member => !!m);
  }

  render() {
    const members = this._members();
    const editable = !!this.household?.available;
    return html`
      <div class="head">
        <p class="lead">This is the order people appear in. Drag ≡ to change it.</p>
        ${editable ? html`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>` : nothing}
      </div>
      ${members.length === 0 ? html`<p class="empty">No one here yet.</p>` : nothing}
      <ul>
        ${members.map((member, index) => html`
          <li class=${this._dragging === member.id ? 'dragging' : ''}>
            ${editable ? html`
              <button class="handle" type="button" aria-label="Move ${member.name}"
                @pointerdown=${(e: PointerEvent) => this._dragStart(e, member.id)}
                @pointermove=${this._dragMove}
                @pointerup=${this._dragEnd}
                @pointercancel=${this._dragEnd}
                @keydown=${(e: KeyboardEvent) => this._keyMove(e, index)}>≡</button>
            ` : nothing}
            <button class="open" type="button" @click=${() => this._open(member)}>
              <pv-member-avatar .member=${member} .hass=${this.hass} size="40"></pv-member-avatar>
              <span class="text">
                <span class="name">${member.name}</span>
                <span class="summary">${memberSummary(member, this.data?.calendars ?? [])}</span>
              </span>
              <span class="chevron" aria-hidden="true">›</span>
            </button>
          </li>
        `)}
      </ul>
      ${editable && members.length > 0
        ? html`<button class="pv-btn pv-btn-secondary add" type="button" @click=${this._add}>+ Add someone</button>`
        : nothing}
    `;
  }

  private _push(detail: PushPageDetail): void {
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, { detail, bubbles: true, composed: true }));
  }

  private _open(member: Member): void {
    this._push({ tag: 'pv-settings-person', title: member.name, back: 'People', props: { memberId: member.id } });
  }

  private _add(): void {
    this._push({ tag: 'pv-settings-person', title: 'New person', back: 'People', props: { memberId: null } });
  }

  private _dragStart(event: PointerEvent, id: string): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this._order = this._members().map(m => m.id);
    this._dragging = id;
  }

  private _dragMove = (event: PointerEvent): void => {
    if (!this._dragging || !this._order) return;
    const rows = [...this.renderRoot.querySelectorAll<HTMLElement>('li')].map(row => {
      const box = row.getBoundingClientRect();
      return { top: box.top, height: box.height };
    });
    const to = rowIndexAt(event.clientY, rows);
    const from = this._order.indexOf(this._dragging);
    if (to >= 0 && to !== from) this._order = moveItem(this._order, from, to);
  };

  private _dragEnd = (): void => {
    if (!this._dragging || !this._order) return;
    const order = this._order;
    this._dragging = null;
    void this._saveOrder(order);
  };

  private _keyMove(event: KeyboardEvent, index: number): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const ids = this._members().map(m => m.id);
    const to = event.key === 'ArrowUp' ? index - 1 : index + 1;
    if (to < 0 || to >= ids.length) return;
    this._order = moveItem(ids, index, to);
    void this._saveOrder(this._order).then(() => {
      this.renderRoot.querySelectorAll<HTMLElement>('.handle')[to]?.focus();
    });
  }

  private async _saveOrder(order: string[]): Promise<void> {
    const saved = inOrder(this.household?.members ?? []).map(m => m.id);
    if (order.join() !== saved.join()) {
      try {
        await this.api.reorder(order);
      } catch (err) {
        this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
          detail: { message: saveErrorMessage(errorCode(err)) },
          bubbles: true,
          composed: true,
        }));
      }
    }
    // The household view now holds the saved order (or the old one after a failure).
    this._order = null;
  }
}

defineElement('pv-settings-people', PvSettingsPeople);
