import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { peopleStripStyles } from '../../styles/controls';
import { buttonStyles } from '../../styles/shared';
import { defineElement } from '../../utils/define';
import type { Layout } from '../../core/layout';
import { Member, inOrder, memberColor } from '../../core/household';
import { swipeDirection } from '../../utils/gestures';
import { stripStart } from '../../core/people-strip';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { DayView } from './chores-types';
import { boardRows } from './board-derive';
import { DayColumn, dayColumns } from './board-day-derive';

const GAP = 12;
/** The Board's own sizes, so another day lays out like today (pv-chores-board). */
const MIN_COLUMN = 240;

/**
 * pv-chores-day-board: the Board on another day (0.14.0). Everyone's column
 * for that day, laid out like today's board: on a past day what was done,
 * missed, carried over, or excused, with Excuse it for a parent; on a day to
 * come what's planned, look only. A phone shows one person at a time.
 *
 * @fires pv-day-excuse - { occurrence, name, member } Excuse it on a miss
 * @fires pv-day-retry - Try again after the day couldn't load
 */
export class PvChoresDayBoard extends LitElement {
  /** The day, once it arrives; null while it loads. */
  @property({ attribute: false }) view: DayView | null = null;
  @property({ type: Boolean }) failed = false;
  @property({ attribute: false }) members: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) mode: 'light' | 'dark' = 'light';
  @property({ attribute: false }) dim = 1;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) today = '';
  @property({ attribute: false }) canExcuse = false;
  /** Being excused now: its link takes no second tap (the day sheet's rule, round 6). */
  @property({ attribute: false }) excusing: ReadonlySet<string> = new Set();
  /** This account's own person, whom a phone opens on. */
  @property({ attribute: false }) self: string | null = null;

  @state() private _width = 0;
  @state() private _height = 0;
  /** Whom a phone shows, once someone picks; until then this account's own person, else the first. */
  @state() private _picked: string | null = null;
  private _observer?: ResizeObserver;
  private _order: Record<string, string[]> = {};
  private _orderDate = '';
  private _touch: { x: number; y: number } | null = null;

  static styles = [
    buttonStyles,
    peopleStripStyles,
    choresStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
      }

      .rows {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: ${GAP}px;
        padding: ${GAP}px;
      }

      .row {
        flex: 1 1 0;
        min-height: 0;
        display: flex;
        gap: ${GAP}px;
      }

      .col,
      .filler {
        flex: 1 1 0;
      }

      .row.scroll {
        overflow-x: auto;
        overscroll-behavior-x: contain;
      }

      .row.scroll .col {
        flex: 0 0 ${MIN_COLUMN - 20}px;
      }

      .phone {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        padding: ${GAP}px;
      }

      .phone .col {
        flex: 1 1 auto;
      }

      /* A board column's card (pv-chores-column), quieter: nothing here is held or checked off. */
      .col {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        box-sizing: border-box;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--member);
        overflow: hidden;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 14px 8px;
      }

      .who {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.3125rem;
        font-weight: 800;
        line-height: 1.15;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .body {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 12px 12px;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      /* The day sheet's rows (pv-chores-day-sheet). */
      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      li .chore {
        flex: 1 1 auto;
        min-width: 0;
      }

      li .chore.below {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        padding: 6px 0;
      }

      li .chore.below .badge {
        white-space: normal;
        text-align: left;
      }

      li .pic {
        filter: var(--pv-media-filter, none);
        flex: none;
        width: 28px;
        text-align: center;
      }

      .link {
        flex: none;
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }

      .quiet {
        margin: 10px 2px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.9375rem;
      }

      .state {
        margin: auto;
        padding: 24px;
        text-align: center;
        color: var(--pv-text-secondary, #5F6670);
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver(entries => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      const height = Math.round(entries[0]?.contentRect.height ?? 0);
      if (Math.abs(width - this._width) >= 1) this._width = width;
      if (Math.abs(height - this._height) >= 1) this._height = height;
    });
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  render() {
    if (this.failed) {
      return html`
        <div class="state" role="status">
          <p>Couldn't load this day. Try again in a moment.</p>
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._retry}>Try again</button>
        </div>
      `;
    }
    const view = this.view;
    const columns = view
      ? dayColumns(view, this.members, {
        today: this.today, canExcuse: this.canExcuse, excusing: this.excusing,
        order: view.date === this._orderDate ? this._order : {},
      })
      : null;
    if (view && columns) {
      // Rows keep the places they were shown in while the day reloads after Excuse it (round 6).
      this._orderDate = view.date;
      this._order = Object.fromEntries(columns.map(c => [c.member.id, c.rows.map(r => r.key)]));
    }
    const people = inOrder([...this.members]);
    if (this.layout === 'phone') return this._phone(columns, people);
    const width = Math.max(0, this._width - GAP * 2);
    const count = columns ? columns.length : people.length;
    const rows = boardRows(count, width || 1200, GAP, MIN_COLUMN, this._height || Infinity);
    const perRow = Math.max(...rows, 1);
    const scroll = width > 0 && (width - GAP * (perRow - 1)) / perRow < MIN_COLUMN - 20;
    let index = 0;
    return html`
      <div class="rows" aria-busy=${columns ? 'false' : 'true'}>
        ${rows.map(n => {
          const slice = columns ? columns.slice(index, index + n) : people.slice(index, index + n);
          index += n;
          return html`<div class="row ${scroll ? 'scroll' : ''}">${columns
            ? repeat(slice as DayColumn[], c => c.member.id, c => this._column(c))
            : (slice as Member[]).map(m => this._bones(m))}${
            Array.from({ length: perRow - n }, () => html`<div class="filler" aria-hidden="true"></div>`)}</div>`;
        })}
      </div>
    `;
  }

  private _color(member: Member): string {
    return memberColor(member, this.mode, this.dim);
  }

  private _column(column: DayColumn) {
    const { member, ring } = column;
    const color = this._color(member);
    return html`
      <section class="col" style="--member:${color}" aria-label=${ring.label}>
        <div class="head">
          <pv-ring size="58" .progress=${ring.progress} ?closed=${ring.closed} color=${color} aria-hidden="true">
            <pv-member-avatar .member=${{ ...member, color }} .hass=${this.hass} size="44"></pv-member-avatar>
          </pv-ring>
          <span class="who">
            <span class="name">${member.name}</span>
            ${column.line ? html`<span class="line">${column.line}</span>` : nothing}
          </span>
        </div>
        <div class="body">
          ${column.empty ? html`<div class="quiet">${column.empty}</div>` : html`
            <ul>
              ${repeat(column.rows, row => row.key, row => {
                const badge = row.badge
                  ? html`<span class="badge ${row.badge.tone}">${row.badge.glyph ? html`<span class="emo">${row.badge.glyph}</span> ` : ''}${row.badge.words}</span>`
                  : nothing;
                return html`
                  <li>
                    <span class="pic" aria-hidden="true">${row.picture}</span>
                    <span class="chore ${column.below ? 'below' : ''}">${row.name}${column.below ? badge : nothing}</span>
                    ${column.below ? nothing : badge}
                    ${row.excuse ? html`
                      <button class="link" type="button" @click=${() => this._excuse(row.key, row.name, member.id)}>Excuse it</button>
                    ` : nothing}
                  </li>
                `;
              })}
            </ul>
          `}
        </div>
      </section>
    `;
  }

  private _bones(member: Member) {
    return html`
      <section class="col" style="--member:${this._color(member)}" aria-hidden="true">
        <div class="head"><span class="who"><span class="name">${member.name}</span></span></div>
        <div class="body">
          <div class="bone" style="height:44px;margin-bottom:8px"></div>
          <div class="bone" style="height:44px"></div>
        </div>
      </section>
    `;
  }

  private _phone(columns: DayColumn[] | null, people: Member[]) {
    if (people.length === 0) return nothing;
    const ids = people.map(m => m.id);
    const index = Math.max(0, ids.indexOf(stripStart(ids, this._picked, this.self) ?? ''));
    const shown = people[index];
    const column = columns?.find(c => c.member.id === shown.id);
    return html`
      <div class="pv-people" role="tablist" aria-label="Whose day">
        ${people.map((member, i) => {
          const ring = columns?.find(c => c.member.id === member.id)?.ring;
          return html`
            <button type="button" class="pv-person" role="tab" aria-selected=${i === index ? 'true' : 'false'}
              style="--member:${this._color(member)}" @click=${() => { this._picked = member.id; }}>
              <pv-ring size="40" .progress=${ring?.progress ?? 0} ?closed=${ring?.closed ?? false} color=${this._color(member)}>
                <pv-member-avatar .member=${{ ...member, color: this._color(member) }} .hass=${this.hass} size="28"></pv-member-avatar>
              </pv-ring>
              <span class="pv-person-name">${member.name}</span>
            </button>
          `;
        })}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${(e: TouchEvent) => this._touchEnd(e, ids, index)}>
        ${column ? this._column(column) : this._bones(shown)}
      </div>
    `;
  }

  private _touchStart = (event: TouchEvent): void => {
    this._touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  /** A swipe moves to the next or previous person, as on today's board. */
  private _touchEnd(event: TouchEvent, ids: string[], index: number): void {
    const start = this._touch;
    this._touch = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction === 'next' && index < ids.length - 1) this._picked = ids[index + 1];
    if (direction === 'prev' && index > 0) this._picked = ids[index - 1];
  }

  private _excuse(occurrence: string, name: string, member: string): void {
    if (this.excusing.has(occurrence)) return;
    this.dispatchEvent(new CustomEvent('pv-day-excuse', { detail: { occurrence, name, member }, bubbles: true, composed: true }));
  }

  private _retry = (): void => {
    this.dispatchEvent(new CustomEvent('pv-day-retry', { bubbles: true, composed: true }));
  };
}

defineElement('pv-chores-day-board', PvChoresDayBoard);
