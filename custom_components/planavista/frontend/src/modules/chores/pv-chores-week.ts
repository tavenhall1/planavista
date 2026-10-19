import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { ANSWERED_MS } from './inbox-derive';
import { swipeDirection } from '../../utils/gestures';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles, stepperStyles } from './chores-styles';
import type { WeekView } from './chores-types';
import { Highlight, WeekCell, WeekRow, weekDays, weekTitle } from './week-derive';
import { ScrollReporter } from '../../core/content-scroll';

/**
 * pv-chores-week: how the week is going, for everyone (spec 13.5). One mini
 * ring per person per day (closed when everything due that day was done),
 * today outlined and days to come dashed; weekly chores in their own column
 * (a section in portrait); a fairness bar and up to three highlights below.
 * Tap a cell to see that day; swipe or use the arrows for other weeks.
 *
 * @fires pv-week-nav - { offset } -1, 1, or 0 for this week
 * @fires pv-week-day - { member, date } a cell was tapped
 * @fires pv-week-excuse - { occurrence, name, member } Excuse it on a highlight
 */
export class PvChoresWeek extends LitElement {
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();

  @property({ attribute: false }) view: WeekView | null = null;
  @property({ attribute: false }) rows: WeekRow[] = [];
  @property({ attribute: false }) highlights: Highlight[] = [];
  @property({ attribute: false }) shares: Array<{ member: Member; text: string; percent: number }> = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Whether Excuse it shows (parents, or a screen that can ask for a parent's PIN). */
  @property({ type: Boolean }) canExcuse = false;
  /** Being excused now: its link goes, and comes back if nothing was (round 6). */
  @property({ attribute: false }) excusing: ReadonlySet<string> = new Set();
  /** After Excuse it, the links take no second tap while the highlights reload (round 6). */
  private _quietUntil = 0;
  @property({ type: Boolean }) current = true;
  @property({ type: Boolean }) failed = false;
  private _touch: { x: number; y: number } | null = null;

  static styles = [
    buttonStyles,
    choresStyles,
    stepperStyles,
    css`
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 12px;
        box-sizing: border-box;
      }

      .wrap {
        max-width: 1200px;
        margin: 0 auto;
      }

      .top {
        margin-bottom: 10px;
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 12px;
      }

      .grid {
        display: grid;
        gap: 8px;
        align-items: stretch;
      }

      .grid.landscape {
        grid-template-columns: 120px repeat(7, minmax(0, 1fr)) minmax(160px, 220px);
      }

      .grid.portrait {
        grid-template-columns: 96px repeat(7, minmax(0, 1fr));
      }

      .grid.phone {
        grid-template-columns: 52px repeat(7, minmax(0, 1fr));
        gap: 4px;
      }

      .dayhead {
        text-align: center;
        font-size: 0.8125rem;
        font-weight: 700;
        color: var(--pv-text-muted, #8E949C);
        line-height: 1.2;
      }

      .dayhead.today {
        color: var(--pv-accent-ink, #5B5BD6);
      }

      .dayhead .sub {
        display: block;
        font-size: 0.6875rem;
      }

      .who {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        min-width: 0;
      }

      .grid.phone .who span.name {
        display: none;
      }

      .who .streak {
        display: block;
        font-weight: 600;
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-height: 72px;
        padding: 6px 2px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .cell.today {
        border: 1.5px solid var(--pv-accent, #5B5BD6);
        background: var(--pv-today-bg, rgba(91, 91, 214, 0.06));
      }

      .cell.future {
        border-style: dashed;
        color: var(--pv-text-muted, #8E949C);
      }

      .cell.away {
        background: var(--pv-chip, #F1F1EE);
      }

      .cell .bad {
        padding: 1px 6px;
        border-radius: 6px;
        background: var(--pv-bad-bg, #FBE4E4);
        color: var(--pv-bad-ink, #A12828);
        font-weight: 700;
      }

      .weekly {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #F1F1EE);
        font-size: 0.8125rem;
      }

      .weekly .line {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .bar {
        height: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
      }

      .weekly-section {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      :host([layout='phone']) .weekly-section {
        grid-template-columns: minmax(0, 1fr);
      }

      .weekly-section .weekly {
        border-left: 3px solid var(--c);
      }

      .lower {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        margin-top: 12px;
      }

      :host(:not([layout='landscape'])) .lower {
        grid-template-columns: minmax(0, 1fr);
      }

      .fair .stack {
        display: flex;
        height: 12px;
        gap: 2px;
        margin: 8px 0 6px;
      }

      .fair .stack span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend i {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        margin-right: 4px;
        vertical-align: -1px;
      }

      .highlights p {
        margin: 0 0 6px;
        line-height: 1.5;
      }

      .highlights .link {
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
        padding: 0 4px;
      }

      h3 {
        margin: 0;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1rem;
        font-weight: 800;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._scroll.attach(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._scroll.attach(undefined);
  }

  render() {
    const view = this.view;
    const shape = this.layout === 'landscape' ? 'landscape' : this.layout === 'phone' ? 'phone' : 'portrait';
    return html`
      <div class="wrap" @touchstart=${this._touchStart} @touchend=${this._touchEnd}>
        <div class="top">
          <h2>${view ? weekTitle(view) : 'This week'}</h2>
          <div class="steps">
            <button class="nav" type="button" aria-label="Last week" title="Last week" @click=${() => this._nav(-1)}>
              <ha-icon icon="mdi:chevron-left"></ha-icon>
            </button>
            <button class="pv-btn pv-btn-secondary this-week" type="button" ?disabled=${this.current} @click=${() => this._nav(0)}>This week</button>
            <button class="nav" type="button" aria-label="Next week" title="Next week" @click=${() => this._nav(1)}>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        </div>
        ${this.failed ? html`
          <div class="state"><div class="art" aria-hidden="true">📡</div><h2>Couldn't load this week</h2>
            <p>Home Assistant didn't answer. Try again in a moment.</p>
            <div class="buttons"><button class="pv-btn pv-btn-secondary" type="button" @click=${() => this._nav(0)}>Try again</button></div></div>
        ` : !view ? this._skeleton(shape) : this._grid(view, shape)}
      </div>
    `;
  }

  private _skeleton(shape: string) {
    return html`
      <div class="card" aria-busy="true" aria-label="Loading the week">
        <div class="grid ${shape}">
          ${Array.from({ length: 4 * (shape === 'landscape' ? 9 : 8) }, () => html`<div class="bone" style="height:72px"></div>`)}
        </div>
      </div>
    `;
  }

  private _grid(view: WeekView, shape: string) {
    const days = weekDays(view);
    return html`
      <div class="card">
        <div class="grid ${shape}" role="grid" aria-label=${weekTitle(view)}>
          <div></div>
          ${days.map(d => html`<div class="dayhead ${d.today ? 'today' : ''}">${d.label}${d.today ? html`<span class="sub">Today</span>` : nothing}</div>`)}
          ${shape === 'landscape' ? html`<div class="dayhead">Weekly chores</div>` : nothing}
          ${this.rows.map(row => this._row(row, shape))}
        </div>
      </div>
      ${shape !== 'landscape' ? this._weeklySection() : nothing}
      <div class="lower">
        ${this.shares.length ? html`
          <div class="card fair">
            <h3>Shared chores this week, by time done</h3>
            <div class="stack" role="img" aria-label=${this.shares.map(s => s.text).join(', ')}>
              ${this.shares.map(s => html`<span style="width:${s.percent}%;background:${this.colorOf(s.member)}"></span>`)}
            </div>
            <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.text}</span>`)}</div>
          </div>
        ` : nothing}
        ${this.highlights.length ? html`
          <div class="card highlights">
            ${this.highlights.map(h => html`
              <p><strong>${h.member.name}</strong>${h.text.slice(h.member.name.length)}
                ${h.excuse && this.canExcuse && !this.excusing.has(h.excuse.occurrence) ? html`<button class="link" type="button"
                  @click=${() => this._excuse(h.excuse!.occurrence, h.excuse!.name, h.member.id)}>Excuse it</button>` : nothing}
              </p>
            `)}
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _row(row: WeekRow, shape: string) {
    const member = row.member;
    const color = this.colorOf(member);
    return html`
      <div class="who">
        <pv-member-avatar .member=${{ ...member, color }} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="name">${member.name}</span>
      </div>
      ${row.cells.map(cell => this._cell(member, cell, color))}
      ${shape === 'landscape' ? this._weekly(row, color) : nothing}
    `;
  }

  private _cell(member: Member, cell: WeekCell, color: string) {
    const label = `${member.name}, ${cell.date}: ${cell.label || 'nothing known'}`;
    return html`
      <button class="cell ${cell.kind} ${cell.away ? 'away' : ''}" type="button" aria-label=${label}
        @click=${() => this._fire('pv-week-day', { member: member.id, date: cell.date })}>
        ${cell.away ? html`<span aria-hidden="true">🧳</span>` : cell.empty ? nothing : html`
          <pv-ring size="34" .progress=${cell.progress} ?closed=${cell.closed} ?dashed=${cell.dashed} color=${color}></pv-ring>
        `}
        <span class=${cell.tone === 'bad' ? 'bad' : ''}>${cell.label}</span>
      </button>
    `;
  }

  private _weekly(row: WeekRow, color: string) {
    const weekly = row.weekly;
    if (!weekly) return html`<div class="weekly"><span class="meta">No weekly chores</span></div>`;
    return html`
      <div class="weekly">
        <div class="line"><strong class="num">${weekly.text}</strong>
          ${weekly.badge ? html`<span class="badge ${weekly.badgeTone}">${weekly.badge}</span>` : nothing}
        </div>
        <div class="bar"><span style="width:${Math.round(weekly.progress * 100)}%;background:${color}"></span></div>
      </div>
    `;
  }

  private _weeklySection() {
    const rows = this.rows;
    if (!rows.some(r => r.weekly)) return nothing;
    return html`
      <div class="section-head" style="margin:14px 2px 0"><span>Weekly chores</span></div>
      <div class="weekly-section">
        ${rows.map(row => html`
          <div class="weekly" style="--c:${this.colorOf(row.member)}">
            <div class="line"><strong>${row.member.name}</strong>
              ${row.weekly ? html`<span class="num">${row.weekly.text}</span>${row.weekly.badge ? html`<span class="badge ${row.weekly.badgeTone}">${row.weekly.badge}</span>` : nothing}` : html`<span class="meta">No weekly chores</span>`}
            </div>
            ${row.weekly ? html`<div class="bar"><span style="width:${Math.round(row.weekly.progress * 100)}%;background:${this.colorOf(row.member)}"></span></div>` : nothing}
          </div>
        `)}
      </div>
    `;
  }

  private _nav(offset: number): void {
    this._fire('pv-week-nav', { offset });
  }

  private _touchStart = (event: TouchEvent): void => {
    this._touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  };

  private _touchEnd = (event: TouchEvent): void => {
    const start = this._touch;
    this._touch = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (direction) this._nav(direction === 'next' ? 1 : -1);
  };

  private _excuse(occurrence: string, name: string, member: string): void {
    if (performance.now() < this._quietUntil) return;
    this._quietUntil = performance.now() + ANSWERED_MS;
    this._fire('pv-week-excuse', { occurrence, name, member });
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-week', PvChoresWeek);
