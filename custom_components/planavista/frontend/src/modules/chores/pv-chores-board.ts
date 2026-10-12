import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { peopleStripStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { keyed } from 'lit/directives/keyed.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { stripStart } from '../../core/people-strip';
import { defineElement } from '../../utils/define';
import type { Layout } from '../../core/layout';
import { HouseholdView, inOrder, memberColor } from '../../core/household';
import type { Session } from '../../core/session';
import { memberAccess } from '../../core/access';
import { motionOf } from '../../core/motion';
import { swipeDirection } from '../../utils/gestures';
import { memoizeOne } from '../../utils/render-cache';
import type { PlanaVistaCardConfig, PlanaVistaData } from '../../types';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Board } from './chores-types';
import { ColumnModel, boardColumns, boardRows, eveningCheck, everyRingClosed, ringsToCelebrate } from './board-derive';
import { eventsOn } from './calendar-ties';
import { chime, haptic } from './effects';
import './pv-chores-column';
import type { PvChoresColumn } from './pv-chores-column';

const GAP = 12;
const NARROW_PX = 300;

/**
 * pv-chores-board: everyone's today at once (spec 13.1, 12.3). People sit in
 * columns while each can be 240 px wide, then wrap into an even grid (four
 * people in portrait make a 2 by 2) with a short last row stretched; the
 * order is Settings order and never changes, and each panel scrolls on its
 * own. A phone shows one person at a time, with a swipe between people.
 * Rings closing are celebrated once; when every ring closes, everyone's are.
 *
 * @fires pv-member-open - { member } a column's header was tapped
 */
export class PvChoresBoard extends LitElement {
  @property({ attribute: false }) board!: Board;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) session: Session | null = null;
  @property({ attribute: false }) data: PlanaVistaData | null = null;
  /** The card's options: its `calendars` list narrows the events shown (as the calendar does). */
  @property({ attribute: false }) cardConfig?: PlanaVistaCardConfig;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ attribute: false }) mode: 'light' | 'dark' = 'light';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Minutes since the epoch: the board re-derives each minute (bands and the evening check move with the clock). */
  @property({ attribute: false }) minute = 0;

  @state() private _width = 0;
  @state() private _phoneIndex = 0;
  /** Someone tapped the strip or swiped: the board stays on their pick. */
  private _phonePicked = false;
  @state() private _celebrate: Record<string, number> = {};
  @state() private _pulse: Record<string, number> = {};
  @state() private _family = false;
  private _observer?: ResizeObserver;
  private _closed = new Map<string, boolean>();
  private _evening = false;
  /** Who was celebrated on which chore day ("casey|2026-10-13"), and the day everyone was. */
  private _celebrated = new Set<string>();
  private _familyDay: string | null = null;
  private _touch: { x: number; y: number } | null = null;

  static styles = [
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

      pv-chores-column {
        flex: 1 1 0;
      }




      .phone {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        padding: ${GAP}px;
      }

      .phone pv-chores-column {
        flex: 1 1 auto;
      }

      .celebrate {
        margin: 10px 12px 0;
        padding: 10px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
        font-weight: 750;
        text-align: center;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver(entries => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (Math.abs(width - this._width) >= 1) this._width = width;
    });
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  private _columnsFor = memoizeOne(
    (board: Board, household: HouseholdView | null, data: PlanaVistaData | null, config: PlanaVistaCardConfig | undefined,
      timeFormat: '12h' | '24h', _minute: number) => {
      const members = household ? inOrder(household.members) : [];
      const now = new Date();
      return boardColumns(board, {
        today: board.today,
        now,
        events: eventsOn(data, new Date(board.day.start), new Date(board.day.end), config),
        timeFormat,
        activities: new Map(board.chores.map(a => [a.id, a])),
        members,
      });
    },
  );

  private _columns(): ColumnModel[] {
    return this._columnsFor(this.board, this.household, this.data, this.cardConfig, this.timeFormat, this.minute);
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!this._phonePicked && (changed.has('board') || changed.has('household'))) {
      // Casey's phone opens on Casey; a shared or admin login opens on the first person (milestone 8).
      const ids = this._columns().map(col => col.member.id);
      this._phoneIndex = Math.max(0, ids.indexOf(stripStart(ids, null, this.household?.account?.member_id ?? null) ?? ''));
    }
    if (!changed.has('board') && !changed.has('minute')) return;
    const columns = this._columns();
    const live = changed.get('board') !== undefined || this._closed.size > 0;
    const celebrate = { ...this._celebrate };
    const day = this.board.today;
    const closing = live ? ringsToCelebrate(columns, this._closed, this._celebrated, day) : [];
    for (const id of closing) celebrate[id] = (celebrate[id] ?? 0) + 1;
    const any = closing.length > 0;
    for (const col of columns) this._closed.set(col.member.id, col.ring.closed);
    const family = everyRingClosed(columns);
    if (family && live && any && this._familyDay !== day) {
      this._familyDay = day;
      this._family = true;
      for (const col of columns) if (col.entry.today.due > 0) celebrate[col.member.id] = (celebrate[col.member.id] ?? 0) + 1;
      window.setTimeout(() => { this._family = false; }, 6000);
    }
    if (any) {
      this._celebrate = celebrate;
      haptic('ring');
      if (this.board.settings.sound) chime(true);
    }
    const evening = eveningCheck(columns, this.board, new Date());
    if (evening && !this._evening && this._closed.size > 0) {
      const pulse = { ...this._pulse };
      for (const id of evening.members) pulse[id] = (pulse[id] ?? 0) + 1;
      this._pulse = pulse;
    }
    this._evening = !!evening;
  }

  /** "+1 ★" flies to someone's star count. */
  flyStars(memberId: string, from: DOMRect, stars: number): void {
    const column = this.renderRoot.querySelector<PvChoresColumn>(`pv-chores-column[member="${memberId}"]`);
    column?.flyStars(from, stars);
  }

  render() {
    if (!this.board) return nothing;
    const columns = this._columns();
    const evening = eveningCheck(columns, this.board, new Date());
    const banners = html`
      ${this._family ? html`<div class="celebrate" role="status">🎉 Everyone closed their ring today. What a team.</div>` : nothing}
      ${evening ? html`<div class="banner info" role="status"><span class="text">${evening.text}</span></div>` : nothing}
    `;
    if (this.layout === 'phone') return html`${banners}${this._phone(columns)}`;
    const width = Math.max(0, this._width - GAP * 2);
    const rows = boardRows(columns.length, width || 1200, GAP);
    const perRow = Math.max(...rows, 1);
    const narrow = width > 0 && (width - GAP * (perRow - 1)) / perRow < NARROW_PX;
    let index = 0;
    return html`
      ${banners}
      <div class="rows">
        ${rows.map(count => {
          const slice = columns.slice(index, index + count);
          index += count;
          return html`<div class="row">${repeat(slice, c => c.member.id, c => this._column(c, narrow))}</div>`;
        })}
      </div>
    `;
  }

  private _column(model: ColumnModel, narrow: boolean) {
    const id = model.member.id;
    return html`
      <pv-chores-column member=${id} .model=${model} .hass=${this.hass} color=${memberColor(model.member, this.mode)}
        ?narrow=${narrow} ?locked=${memberAccess(this.household, this.session, id) === 'no'}
        .celebrate=${this._celebrate[id] ?? 0} .pulse=${this._pulse[id] ?? 0}></pv-chores-column>
    `;
  }

  private _phone(columns: ColumnModel[]) {
    if (columns.length === 0) return nothing;
    const index = Math.min(this._phoneIndex, columns.length - 1);
    const current = columns[index];
    return html`
      <div class="pv-people" role="tablist" aria-label="Whose chores">
        ${columns.map((col, i) => html`
          <button type="button" class="pv-person" role="tab" aria-selected=${i === index ? 'true' : 'false'}
            style="--member:${memberColor(col.member, this.mode)}" @click=${() => this._show(i)}>
            <pv-ring size="40" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${memberColor(col.member, this.mode)}>
              <pv-member-avatar .member=${{ ...col.member, color: memberColor(col.member, this.mode) }} .hass=${this.hass} size="28"></pv-member-avatar>
            </pv-ring>
            ${col.member.name}
          </button>
        `)}
      </div>
      <div class="phone" @touchstart=${this._touchStart} @touchend=${(e: TouchEvent) => this._touchEnd(e, columns.length)}>
        ${keyed(current.member.id, this._column(current, true))}
      </div>
    `;
  }

  private _show(index: number): void {
    const before = this._phoneIndex;
    this._phonePicked = true;
    this._phoneIndex = index;
    if (before === index || motionOf(this) === 'reduced') return;
    this.updateComplete.then(() => {
      const column = this.renderRoot.querySelector('.phone pv-chores-column');
      column?.animate(
        { transform: [`translateX(${index > before ? 24 : -24}px)`, 'translateX(0)'], opacity: [0.4, 1] },
        { duration: 220, easing: 'ease-out' },
      );
    });
  }

  private _touchStart = (event: TouchEvent): void => {
    this._touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  private _touchEnd(event: TouchEvent, count: number): void {
    const start = this._touch;
    this._touch = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction === 'next' && this._phoneIndex < count - 1) this._show(this._phoneIndex + 1);
    if (direction === 'prev' && this._phoneIndex > 0) this._show(this._phoneIndex - 1);
  }
}

defineElement('pv-chores-board', PvChoresBoard);
