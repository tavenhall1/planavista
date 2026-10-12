import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { chipStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { statusStyles } from '../../styles/status';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SMOOTH, motionOf, springEasing } from '../../core/motion';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import type { InboxGroups, InboxRow } from './inbox-derive';
import { SEND_BACK_REASONS } from './pv-chore-options';

export interface ReviewDetail {
  row: InboxRow;
  allow: boolean;
  note?: string | null;
}

/**
 * pv-chores-inbox: Waiting for OK (spec 13.7), grouped into Chores to check
 * (with Approve all), Requests, and Rewards. A panel beside the board in
 * landscape, so a parent can see the board while approving; a sheet in
 * portrait and on phones. Every answer is its own, attributed review.
 *
 * @fires pv-review - ReviewDetail
 * @fires pv-approve-all - every chore to check, approved one by one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresInbox extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) groups!: InboxGroups;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  /** Requests being answered right now. */
  @property({ attribute: false }) busy: ReadonlySet<string> = new Set();

  @state() private _sendingBack: string | null = null;
  @state() private _note = '';
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    chipStyles,
    buttonStyles,
    sheetStyles,
    statusStyles,
    css`
      :host([layout='landscape']) {
        position: absolute;
        inset: 0 0 0 auto;
        width: min(400px, 100%);
        z-index: 30;
        display: block;
      }

      :host([layout='landscape']) .backdrop {
        display: none;
      }

      :host([layout='landscape']) .panel {
        position: absolute;
        inset: 0;
        width: auto;
        max-height: none;
        border-radius: 0;
        border-left: 1px solid var(--pv-border, #E7E7E3);
        box-shadow: -12px 0 32px rgba(0, 0, 0, 0.12);
        padding: 0 0 20px;
        overflow-y: auto;
      }

      .top {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px 12px;
        background: var(--pv-card-bg, #FFFFFF);
        border-bottom: 1px solid var(--pv-border, #E7E7E3);
      }

      h2 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.25rem;
        font-weight: 800;
      }

      .actions {
        display: flex;
        margin-top: 16px;
      }

      .actions .pv-btn {
        flex: 1;
      }

      h2[tabindex='-1']:focus {
        outline: none;
      }

      .done {
        min-height: 48px;
        font-weight: 750;
      }

      .group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 16px 16px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .link {
        min-height: 48px;
        padding: 0 4px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .words {
        flex: 1 1 auto;
        min-width: 0;
      }

      .what {
        line-height: 1.35;
      }

      .detail {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .answers {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .answers button {
        min-height: 48px;
        padding: 0 14px;
      }

      :host([layout='phone']) .row {
        flex-wrap: wrap;
      }

      :host([layout='phone']) .answers {
        width: 100%;
        justify-content: flex-end;
      }

      .reasons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 12px 60px;
      }

      .reasons .lead {
        width: 100%;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }


      input {
        min-height: 48px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    if (this.layout === 'landscape') {
      if (motionOf(this) === 'reduced') panel.animate({ opacity: [0, 1] }, { duration: 150 });
      else {
        const spring = springEasing(SMOOTH);
        panel.animate({ transform: ['translateX(100%)', 'translateX(0)'] }, { duration: spring.duration, easing: spring.easing });
      }
    } else {
      this._motion.open(panel, backdrop);
      this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    }
    this.renderRoot.querySelector<HTMLElement>('#inbox-title')?.focus();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('groups') && this._sendingBack && !this._all().some(r => r.id === this._sendingBack)) this._sendingBack = null;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detach?.();
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    if (this.layout === 'landscape') {
      const out = motionOf(this) === 'reduced'
        ? panel.animate({ opacity: [1, 0] }, { duration: 120, fill: 'forwards' })
        : panel.animate({ transform: ['translateX(0)', 'translateX(100%)'] }, { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      await out.finished.catch(() => undefined);
    } else {
      await this._motion.close(panel, backdrop);
    }
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _all(): InboxRow[] {
    const g = this.groups;
    return g ? [...g.chores, ...g.requests, ...g.rewards] : [];
  }

  render() {
    const g = this.groups;
    if (!g) return nothing;
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal=${this.layout === 'landscape' ? 'false' : 'true'} aria-labelledby="inbox-title"
        @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <div class="top">
          <h2 id="inbox-title" tabindex="-1">Waiting for OK${g.count ? ` · ${g.count}` : ''}</h2>
        </div>
        ${g.count === 0 ? html`
          <div class="state">
            <div class="art" aria-hidden="true">✅</div>
            <h2>Nothing is waiting</h2>
            <p>Check-offs that need a parent's OK, requests, and rewards land here.</p>
          </div>
        ` : nothing}
        ${g.chores.length ? html`
          <div class="group"><span>Chores to check</span>
            <button class="link" type="button" ?disabled=${this.busy.size > 0}
              @click=${() => this.dispatchEvent(new CustomEvent('pv-approve-all', { bubbles: true, composed: true }))}>Approve all (${g.chores.length})</button>
          </div>
          ${g.chores.map(row => this._row(row))}
        ` : nothing}
        ${g.requests.length ? html`<div class="group"><span>Requests</span></div>${g.requests.map(row => this._row(row))}` : nothing}
        ${g.rewards.length ? html`<div class="group"><span>Rewards</span></div>${g.rewards.map(row => this._row(row))}` : nothing}
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
        </div>
      </div>
    `;
  }

  private _row(row: InboxRow) {
    const busy = this.busy.has(row.id);
    const member = row.member;
    return html`
      <div class="row" aria-busy=${busy ? 'true' : 'false'}>
        ${member ? html`<pv-member-avatar .member=${{ ...member, color: this.colorOf(member) }} .hass=${this.hass} size="32"></pv-member-avatar>` : nothing}
        <div class="words">
          <div class="what">${row.lead} <strong>${row.what}</strong>${row.tail}</div>
          <div class="detail">${row.detail}</div>
        </div>
        <div class="answers">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${busy}
            @click=${() => this._decline(row)}>${row.decline}</button>
          <button class="pv-btn pv-btn-secondary accent" type="button" ?disabled=${busy || row.blocked}
            @click=${() => this._review(row, true)}>${busy ? 'Saving…' : row.allow}</button>
        </div>
      </div>
      ${this._sendingBack === row.id ? html`
        <div class="reasons">
          <span class="lead">Sending back: what should change?</span>
          ${SEND_BACK_REASONS.map(reason => html`<button class="chip" type="button" @click=${() => this._review(row, false, reason)}>${reason}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${(e: Event) => { this._note = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._review(row, false, this._note.trim() || null); }} />
          <button class="chip" type="button" @click=${() => this._review(row, false, this._note.trim() || null)}>Send back</button>
        </div>
      ` : nothing}
    `;
  }

  private _decline(row: InboxRow): void {
    if (row.kind === 'completion') {
      this._sendingBack = this._sendingBack === row.id ? null : row.id;
      this._note = '';
      return;
    }
    this._review(row, false);
  }

  private _review(row: InboxRow, allow: boolean, note?: string | null): void {
    this._sendingBack = null;
    this.dispatchEvent(new CustomEvent<ReviewDetail>('pv-review', { detail: { row, allow, note }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    if (this.layout !== 'landscape') trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-inbox', PvChoresInbox);
