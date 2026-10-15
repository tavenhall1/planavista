import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { chipStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { statusStyles } from '../../styles/status';
import { trapTab } from '../../core/focus';
import { type Layout, SHORT_MAX_HEIGHT } from '../../core/layout';
import type { Member } from '../../core/household';
import { SMOOTH, motionOf, springEasing } from '../../core/motion';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import {
  ANSWERED_MS, answeredWords, heldArrivals, isHeld, revealBy, sendBackReasons, withAnswered,
  type Answered, type InboxGroups, type InboxRow, type ShownRow,
} from './inbox-derive';
import { backdropTap } from '../../core/backdrop';
import { SheetLayer } from '../../core/sheet-layer';
import { PressGuard, guardPageTaps } from '../../core/press-guard';

/** Approve all's question, for the board to ask: its rows, and how the inbox follows the answer. */
export interface ApproveAllAsk {
  rows: InboxRow[];
  /** The rows being approved now: held in place, "Saving...". */
  start: (rows: readonly InboxRow[]) => void;
  /** How one row went, as each is answered (round 7: all of them said Saving until the last). */
  settle: (id: string, ok: boolean) => void;
}

export interface ReviewDetail {
  row: InboxRow;
  allow: boolean;
  note?: string | null;
  /** Told whether it was answered (a PIN cancelled or a refusal is not) (round 6). */
  settled?: (ok: boolean) => void;
}

/**
 * pv-chores-inbox: To approve (spec 13.7), grouped into Chores to check
 * (with Approve all), Requests, and Rewards. A panel beside the board in
 * landscape, so a parent can see the board while approving; a sheet in
 * portrait and on phones. Every answer is its own, attributed review.
 *
 * @fires pv-review - ReviewDetail
 * @fires pv-approve-all - every chore to check, approved one by one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresInbox extends LitElement {
  /** Closes the sheet only after a press that began on the backdrop (core/backdrop). */
  private readonly _backdrop = backdropTap(() => void this.close());
  private readonly _layer = new SheetLayer(this);
  private readonly _pressGuard = new PressGuard(this);
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /**
   * The sheet has under 500 px of room: a card's (a sideways phone) or a window's (a sections view,
   * where the sheet fills the window, round 12). Worked out from its own box, never set from outside.
   */
  @property({ type: Boolean, reflect: true }) short = false;
  private _room: ResizeObserver | null = null;
  @property({ attribute: false }) groups!: InboxGroups;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  /** Requests being answered right now. */
  @property({ attribute: false }) busy: ReadonlySet<string> = new Set();

  @state() private _sendingBack: string | null = null;
  /** Answered here: kept in place for a moment (round 5). */
  @state() private _answered = new Map<string, Answered>();
  /** The panel's height in portrait, held while open so rows don't move under the finger (round 6). */
  private _heldHeight = 0;
  /** The rows' height, kept while open so a row leaving never pulls the scroll back (round 7). */
  private _rowsHeight = 0;
  /** The rows shown so far; later ones wait behind "N more came in" (round 7). */
  private _known: Set<string> | null = null;
  /** Rows shown now (answered ones held in place included), for the held heights. */
  private _shownCount = 0;
  /** What each group drew last, so answered rows keep their places. */
  private _shown: Record<'chores' | 'requests' | 'rewards', ShownRow[]> = { chores: [], requests: [], rewards: [] };
  private _settle?: number;
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
        padding: 0;
        overflow-y: auto;
      }

      /*
       * The grab handle and the title, pinned together at the very top (round 9: rows scrolled through
       * a band above the title, inside the panel's top padding, and the handle scrolled away).
       */
      .head {
        position: sticky;
        top: 0;
        z-index: 2;
        background: var(--pv-card-bg, #FFFFFF);
      }

      :host(:not([layout='landscape'])) .panel {
        padding-top: 0;
      }

      .head .grab-zone {
        margin-top: 0;
      }

      .top {
        position: relative;
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

      /*
       * Done, and the word about rows that came in, side by side and pinned to the sheet's
       * bottom (round 8: in a column the word pushed Done off the screen, and rows growing
       * after it opened pushed both past the held height). The panel's bottom padding
       * moves here, so the pinned row sits at the very bottom.
       */
      .panel {
        padding-bottom: 0;
      }

      .actions {
        position: sticky;
        bottom: 0;
        z-index: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 0 calc(20px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
        background: var(--pv-card-bg, #FFFFFF);
      }

      :host([layout='landscape']) .actions {
        padding: 12px 16px 20px;
      }

      /* Done in the head on a short screen, where the list's end is out of reach (round 10). */
      .head-done {
        display: none;
      }

      /*
       * A short card (a phone held sideways, a short card in a sections view): pinned, Done and the
       * word covered most rows (round 9), so Done moves to the head (round 10). The card's own height
       * decides, not the window's (round 11).
       */
      :host([short]) .actions {
        position: static;
      }
      :host([short]) .head-done {
        display: inline-flex;
      }
      :host([short]) .actions .done {
        display: none;
      }

      /* Rows that came in after it opened: shown on the parent's word (round 7). */
      .actions .more {
        flex: none;
        width: auto;
      }

      /* Approve all keeps its place when it has nothing to approve, so rows don't move as it comes and goes. */
      .link.unused {
        visibility: hidden;
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

      /* Answered here: its place kept for a moment, its buttons gone (round 5). */
      .done-word {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        color: var(--pv-text-secondary, #5F6670);
        font-weight: 700;
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
      this._detach = this._dragFrom(panel);
    }
    let room = this.getBoundingClientRect().height;
    const fit = (): void => {
      const height = this.getBoundingClientRect().height;
      this.short = height < SHORT_MAX_HEIGHT;
      // Turned or resized without a new layout (a sections view is phone both ways), the heights held
      // for the old room no longer fit (round 13: one row showed). Not while a phone's keyboard is up.
      const typing = !!this.shadowRoot?.activeElement?.matches('input, textarea');
      if (Math.abs(height - room) > 1 && !typing) {
        room = height;
        this._resetHeld();
        this.requestUpdate();
      }
    };
    panel.addEventListener('focusin', this._focusIn);
    this._room = new ResizeObserver(fit);
    this._room.observe(this);
    fit();
    this.renderRoot.querySelector<HTMLElement>('#inbox-title')?.focus();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('groups') && this._sendingBack && !this._all().some(r => r.id === this._sendingBack)) this._setSendingBack(null);
    // A bottom sheet grows or shrinks at its top: a row arriving moved every row up, one leaving moved
    // them down (round 6). In portrait it keeps the height it opened with (at least 60% of the screen),
    // and scrolls; rows below one that leaves move up, as in any list.
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
    const rows = this.renderRoot.querySelector<HTMLElement>('.rows');
    if (!panel || !rows) return;
    // Turned: the heights held for the other shape no longer fit (round 8: a gap above Done, docked).
    if (changed.has('layout') && changed.get('layout') !== undefined) {
      this._resetHeld();
      // Turned into a bottom sheet, its handle drags (round 12: attached only when it opened as one).
      this._detach?.();
      this._detach = this.layout === 'landscape' ? null : this._dragFrom(panel);
    }
    // Scrolling something into view keeps it above the pinned Done row (round 9).
    const actions = this.renderRoot.querySelector<HTMLElement>('.actions');
    if (actions) panel.style.scrollPaddingBottom = `${actions.offsetHeight + 8}px`;
    // The rows keep the most height they have had, so one leaving at the end never pulls the scroll back
    // (round 7); open Send back reasons don't count, or a gap stays once they close (round 9).
    if (!this._sendingBack && rows.offsetHeight > this._rowsHeight) {
      this._rowsHeight = rows.offsetHeight;
      rows.style.minHeight = `${this._rowsHeight}px`;
    }
    if (this.layout === 'landscape' || this._shownCount === 0) {
      // Docked, or nothing left to tap: no height to hold (round 7: an empty sheet with Done mid-way).
      if (this._heldHeight) panel.style.height = '';
      if (this._shownCount === 0 && this._rowsHeight) {
        rows.style.minHeight = '';
        this._rowsHeight = 0;
      }
      this._heldHeight = 0;
    } else if (!this._heldHeight && panel.offsetHeight > 0) {
      this._heldHeight = panel.offsetHeight;
      panel.style.height = `${this._heldHeight}px`;
    }
  }

  /** Lets go of the heights held for the room it had (rounds 8 and 13). */
  private _resetHeld(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
    const rows = this.renderRoot.querySelector<HTMLElement>('.rows');
    if (rows) rows.style.minHeight = '';
    this._rowsHeight = 0;
    if (panel) panel.style.height = '';
    this._heldHeight = 0;
  }

  /** Keyboard focus moved behind the sticky head: bring it out below (round 13; no scroll padding, round 12). */
  private _focusIn = (event: FocusEvent): void => {
    const target = event.composedPath()[0] as HTMLElement | undefined;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
    const head = this.renderRoot.querySelector<HTMLElement>('.head');
    if (!target || !panel || !head || head.contains(target)) return;
    requestAnimationFrame(() => {
      const shown = target.getBoundingClientRect();
      const by = revealBy({ top: shown.top, bottom: shown.bottom }, { top: head.getBoundingClientRect().bottom + 8, bottom: Infinity });
      if (by) panel.scrollBy({ top: by });
    });
  };

  private _dragFrom(panel: HTMLElement): () => void {
    return this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._room?.disconnect();
    this._detach?.();
    window.clearTimeout(this._settle);
  }

  private _rows(group: 'chores' | 'requests' | 'rewards', shown: InboxGroups): ShownRow[] {
    this._shown[group] = withAnswered(shown[group], this._shown[group], this._answered, performance.now());
    return this._shown[group];
  }

  /** "N more came in · Show": the parent's own move, so rows may move now. */
  private _showArrived(): void {
    for (const row of this._all()) this._known?.add(row.id);
    this.requestUpdate();
  }

  /** Tapped: its place held, "Saving…", until the module says how it went. */
  private _markPending(rows: readonly InboxRow[], allow: boolean): void {
    const at = performance.now();
    const next = new Map(this._answered);
    for (const row of rows) next.set(row.id, { allow, at, state: 'pending' });
    this._answered = next;
  }

  /** Answered (held a moment more, "Approved"), or not (its buttons back at once). */
  private _settleRows(ids: readonly string[], answered: ReadonlySet<string>): void {
    const at = performance.now();
    const next = new Map(this._answered);
    for (const id of ids) {
      const was = next.get(id);
      if (was && answered.has(id)) next.set(id, { ...was, at, state: 'done' });
      else next.delete(id);
    }
    this._answered = next;
    window.clearTimeout(this._settle);
    this._settle = window.setTimeout(() => this.requestUpdate(), ANSWERED_MS + 50);
  }

  async close(): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    if (this.layout === 'landscape') {
      // Docked: it guards the page too, as every sheet does (round 6: a double tap on Done opened a chore).
      this.style.pointerEvents = 'none';
      guardPageTaps();
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
    this._known ??= new Set(this._all().map(row => row.id));
    const now = performance.now();
    const drawn = new Set([...this._shown.chores, ...this._shown.requests, ...this._shown.rewards]
      .filter(row => isHeld(this._answered.get(row.id), now)).map(row => row.id));
    const held = heldArrivals(g, this._known, drawn);
    for (const group of [held.groups.chores, held.groups.requests, held.groups.rewards]) for (const row of group) this._known.add(row.id);
    const chores = this._rows('chores', held.groups);
    const requests = this._rows('requests', held.groups);
    const rewards = this._rows('rewards', held.groups);
    this._shownCount = chores.length + requests.length + rewards.length;
    const open = chores.filter(row => !row.answered);
    return html`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal=${this.layout === 'landscape' ? 'false' : 'true'} aria-labelledby="inbox-title"
        @keydown=${this._key}>
        <div class="head">
          <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
          <div class="top">
            <h2 id="inbox-title" tabindex="-1">To approve${g.count ? ` · ${g.count}` : ''}</h2>
            <button class="pv-btn pv-btn-secondary head-done" type="button" @click=${() => void this.close()}>Done</button>
          </div>
        </div>
        ${this._shownCount === 0 ? html`
          <div class="state">
            <div class="art" aria-hidden="true">✅</div>
            <h2>Nothing is waiting</h2>
            <p>Check-offs that need a parent's approval, requests, and rewards land here.</p>
          </div>
        ` : nothing}
        <div class="rows">
          ${chores.length ? html`
            <div class="group"><span>Chores to check</span>
              <button class="link ${open.length > 1 ? '' : 'unused'}" type="button" ?disabled=${this.busy.size > 0 || open.length < 2}
                aria-hidden=${open.length > 1 ? 'false' : 'true'} tabindex=${open.length > 1 ? 0 : -1}
                @click=${() => this._askApproveAll(open)}>Approve all (${open.length})</button>
            </div>
            ${chores.map(row => this._row(row))}
          ` : nothing}
          ${requests.length ? html`<div class="group"><span>Requests</span></div>${requests.map(row => this._row(row))}` : nothing}
          ${rewards.length ? html`<div class="group"><span>Rewards</span></div>${rewards.map(row => this._row(row))}` : nothing}
        </div>
        <div class="actions">
          ${held.arrived ? html`<button class="link more" type="button" @click=${() => this._showArrived()}>${held.arrived} more came in · Show</button>` : nothing}
          <button class="pv-btn pv-btn-secondary done" type="button" @click=${() => void this.close()}>Done</button>
        </div>
      </div>
    `;
  }

  /**
   * Approve all asks first, a bulk answer with no Undo (round 5), for the rows it
   * named (round 6). The board shows the question, so it sits in the board's layers
   * with toasts under it: drawn here, a toast covered its button (round 6).
   */
  private _askApproveAll(rows: readonly InboxRow[]): void {
    const detail: ApproveAllAsk = {
      rows: [...rows],
      start: chosen => this._markPending(chosen, true),
      settle: (id, ok) => this._settleRows([id], new Set(ok ? [id] : [])),
    };
    this.dispatchEvent(new CustomEvent('pv-approve-all-ask', { detail, bubbles: true, composed: true }));
  }

  private _row(row: ShownRow) {
    const busy = this.busy.has(row.id);
    const member = row.member;
    if (row.answered) {
      return html`
        <div class="row answered">
          ${member ? html`<pv-member-avatar .member=${{ ...member, color: this.colorOf(member) }} .hass=${this.hass} size="32"></pv-member-avatar>` : nothing}
          <div class="words">
            <div class="what">${row.lead} <strong>${row.what}</strong>${row.tail}</div>
            <div class="detail">${row.detail}</div>
          </div>
          <div class="answers"><span class="done-word" role="status">${row.answered === 'pending' ? '' : '✓ '}${answeredWords(row, row.answered)}</span></div>
        </div>
      `;
    }
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
          <span class="lead">${row.excused ? 'It stays excused. Add a note for them?' : row.late ? 'It counts as missed that day. Add a note for them?' : 'Sending back: what should change?'}</span>
          ${sendBackReasons(!!(row.late || row.excused)).map(reason => html`<button class="chip" type="button" @click=${() => this._review(row, false, reason)}>${reason}</button>`)}
          <input type="text" maxlength="60" placeholder="Write a note…" aria-label="Write a note" .value=${this._note}
            @input=${(e: Event) => { this._note = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._review(row, false, this._note.trim() || null); }} />
          <button class="chip" type="button" @click=${() => this._review(row, false, this._note.trim() || null)}>${row.excused ? 'Not done' : row.late ? 'Count as missed' : 'Send back'}</button>
        </div>
      ` : nothing}
    `;
  }

  private _decline(row: InboxRow): void {
    if (row.kind === 'completion') {
      this._setSendingBack(this._sendingBack === row.id ? null : row.id);
      this._note = '';
      // Opened on the last row, the reasons fell under the pinned Done (round 9): bring them up.
      if (this._sendingBack) void this.updateComplete.then(() => this._revealReasons());
      return;
    }
    this._review(row, false);
  }

  /**
   * Opening or closing Send back's reasons moves the rows under the finger (200 px of reasons): the
   * burst's next tap presses nothing (round 11 for opening; round 12: answering from the last row's
   * reasons closed them, the scroll clamped, and the second tap opened the row above).
   */
  private _setSendingBack(id: string | null): void {
    if (id === this._sendingBack) return;
    this._sendingBack = id;
    guardPageTaps();
  }

  /** The reasons in view, below the sticky head and above a pinned Done, their top first (round 12: no scroll padding). */
  private _revealReasons(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
    const reasons = this.renderRoot.querySelector<HTMLElement>('.reasons');
    if (!panel || !reasons) return;
    const head = this.renderRoot.querySelector<HTMLElement>('.head');
    const actions = this.renderRoot.querySelector<HTMLElement>('.actions');
    const pinned = !!actions && getComputedStyle(actions).position === 'sticky';
    const box = panel.getBoundingClientRect();
    const shown = reasons.getBoundingClientRect();
    const by = revealBy(
      { top: shown.top, bottom: shown.bottom },
      { top: box.top + (head?.offsetHeight ?? 0) + 8, bottom: box.bottom - (pinned ? actions!.offsetHeight : 0) - 8 },
    );
    if (by) panel.scrollBy({ top: by, behavior: motionOf(this) === 'reduced' ? 'auto' : 'smooth' });
  }

  private _review(row: InboxRow, allow: boolean, note?: string | null): void {
    this._setSendingBack(null);
    this._markPending([row], allow);
    const settled = (ok: boolean) => this._settleRows([row.id], new Set(ok ? [row.id] : []));
    this.dispatchEvent(new CustomEvent<ReviewDetail>('pv-review', { detail: { row, allow, note, settled }, bubbles: true, composed: true }));
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
