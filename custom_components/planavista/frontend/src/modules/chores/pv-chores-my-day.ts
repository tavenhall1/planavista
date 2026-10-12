import { LitElement, html, css, nothing } from 'lit';
import { peopleStripStyles, segmentedStyles } from '../../styles/controls';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { keyed } from 'lit/directives/keyed.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Board } from './chores-types';
import type { ColumnModel, RowModel } from './board-derive';
import type { DayEvent } from './calendar-ties';
import {
  FairShare,
  GoalModel,
  TimelineEntry,
  goalWords,
  nextLine,
  picturesFor,
  stickersLabel,
  timelineFor,
} from './my-day-derive';
import { pictureOf } from './pv-chore-tile';
import './pv-chore-item';
import './pv-chore-tile';
import { ScrollReporter } from '../../core/content-scroll';

export type MyDayStyle = 'timeline' | 'list' | 'pictures';
const STYLES: Array<{ id: MyDayStyle; label: string }> = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'list', label: 'List' },
  { id: 'pictures', label: 'Pictures' },
];

/**
 * pv-chores-my-day: one person's day in the style they choose (spec 13.4),
 * saved on them: Timeline (events at their times, chores in their bands,
 * what fits now), List (a checklist and the fairness strip), or Pictures
 * (one huge Now tile, then Now to Next as picture steps). Landscape keeps a
 * side panel with the goal and This week; portrait stacks them.
 *
 * @fires pv-my-day-member - { member } a face in the picker was tapped
 * @fires pv-my-day-style - { member, style } a style was picked
 */
export class PvChoresMyDay extends LitElement {
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();

  @property({ attribute: false }) column!: ColumnModel;
  @property({ attribute: false }) columns: ColumnModel[] = [];
  @property({ attribute: false }) board!: Board;
  @property({ attribute: false }) events: DayEvent[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ attribute: false }) goal: GoalModel | null = null;
  @property({ attribute: false }) shares: FairShare[] = [];
  @property({ attribute: false }) bedtime: Date | null = null;
  @property({ attribute: false }) timeFormat: '12h' | '24h' = '12h';
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: Boolean }) locked = false;
  /** Minutes since the epoch: re-derive each minute. */
  @property({ attribute: false }) minute = 0;

  static styles = [
    peopleStripStyles,
    segmentedStyles,
    choresStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }




      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
        gap: 12px;
        padding: 8px 12px 16px;
        max-width: 1100px;
        width: 100%;
        box-sizing: border-box;
        margin: 0 auto;
      }

      :host(:not([layout='landscape'])) .layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .card {
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: var(--pv-radius-lg, 16px);
        padding: 14px;
        min-width: 0;
      }

      .main {
        border-top: 3px solid var(--member);
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .who {
        flex: 1 1 auto;
        min-width: 0;
      }

      .name {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.5rem;
        font-weight: 800;
      }

      .line {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }




      .goal {
        margin-top: 12px;
      }

      .goal .text {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 10px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--member);
        transition: width 600ms ease;
      }

      /* Timeline */
      .tl {
        margin-top: 10px;
      }

      .tl-row {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        min-height: 48px;
      }

      .tl-time {
        justify-self: end;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
      }

      .tl-band {
        margin: 14px 0 4px 64px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .event {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border-left: 4px solid var(--member);
        background: color-mix(in srgb, var(--member) 14%, var(--pv-card-bg, #FFFFFF));
      }

      .event.past {
        opacity: 0.55;
      }

      .event .title {
        font-weight: 650;
      }

      .event .range {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .now-time {
        color: var(--pv-now-color, #E5484D);
        font-weight: 800;
      }

      .now-line {
        height: 2px;
        background: var(--pv-now-color, #E5484D);
        border-radius: 2px;
      }

      .free {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1.5px dashed color-mix(in srgb, var(--member) 60%, transparent);
        background: color-mix(in srgb, var(--member) 7%, var(--pv-card-bg, #FFFFFF));
        font-size: 0.9375rem;
      }

      .free .fits {
        margin-top: 2px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
      }

      .bed {
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.875rem;
      }

      /* List */
      .next {
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        font-size: 0.875rem;
      }

      .fair {
        margin-top: 12px;
      }

      .fair .bar {
        display: flex;
        height: 12px;
        gap: 2px;
        background: transparent;
      }

      .fair .bar span {
        border-radius: 3px;
      }

      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        margin-top: 6px;
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

      /* Pictures */
      .now-tile,
      .pictures-next {
        max-width: 520px;
        margin: 12px auto 0;
      }

      .label {
        margin: 14px 2px 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .steps {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
        align-items: stretch;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 120px;
        border-radius: 18px;
        background: var(--pv-chip, #F1F1EE);
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-weight: 800;
        text-align: center;
        padding: 10px;
      }

      .step .picture {
        font-size: 44px;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }

      :host([layout='landscape']) .tiles {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .stickers {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        font-size: 22px;
      }

      .side h3 {
        margin: 0 0 8px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        font-weight: 800;
      }

      .side .section + .section {
        margin-top: 16px;
      }

      .stars-big {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2rem;
        font-weight: 800;
        color: var(--pv-star, #8A6A00);
      }
    `,
  ];

  willUpdate(): void {
    if (this.column) this.style.setProperty('--member', this.colorOf(this.column.member));
  }

  private _style(): MyDayStyle {
    const style = this.column.member.my_day;
    return style === 'list' || style === 'pictures' ? style : 'timeline';
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._scroll.attach(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._scroll.attach(undefined);
  }

  render() {
    const column = this.column;
    if (!column) return nothing;
    const member = column.member;
    const style = this._style();
    return html`
      ${this.columns.length > 1 ? html`
        <div class="pv-people" role="tablist" aria-label="Whose day">
          ${this.columns.map(col => html`
            <button class="pv-person" type="button" role="tab" aria-selected=${col.member.id === member.id ? 'true' : 'false'}
              style="--member:${this.colorOf(col.member)}" @click=${() => this._fire('pv-my-day-member', { member: col.member.id })}>
              <pv-ring size="40" .progress=${col.ring.progress} ?closed=${col.ring.closed} color=${this.colorOf(col.member)}>
                <pv-member-avatar .member=${{ ...col.member, color: this.colorOf(col.member) }} .hass=${this.hass} size="28"></pv-member-avatar>
              </pv-ring>
              ${col.member.name}
            </button>
          `)}
        </div>
      ` : nothing}
      <div class="layout">
        <div class="card main">
          <div class="head">
            <pv-ring size="64" .progress=${column.ring.progress} ?closed=${column.ring.closed} color=${this.colorOf(member)} label=${column.ring.label}>
              <pv-member-avatar .member=${{ ...member, color: this.colorOf(member) }} .hass=${this.hass} size="48"></pv-member-avatar>
            </pv-ring>
            <div class="who">
              <div class="name">${member.name}</div>
              <div class="line">${column.line}</div>
            </div>
            <div class="pv-seg" role="group" aria-label="My day style">
              ${STYLES.map(s => html`
                <button type="button" aria-pressed=${s.id === style ? 'true' : 'false'}
                  @click=${() => this._fire('pv-my-day-style', { member: member.id, style: s.id })}>${s.label}</button>
              `)}
            </div>
          </div>
          ${this.goal && this.layout !== 'landscape' ? this._goal(this.goal) : nothing}
          ${style === 'timeline' ? this._timeline() : style === 'list' ? this._list() : this._pictures()}
        </div>
        ${this._side()}
      </div>
    `;
  }

  private _goal(goal: GoalModel) {
    return html`
      <div class="goal">
        <div class="text">
          <span>Goal: ${pictureOf(goal.reward.icon)} ${goal.reward.name}</span>
          <span class="num">${goalWords(goal)}</span>
        </div>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax=${goal.reward.cost} aria-valuenow=${goal.have}
          aria-label=${`${goal.reward.name}: ${goal.have} of ${goal.reward.cost} stars`}><span style="width:${Math.round(goal.progress * 100)}%"></span></div>
      </div>
    `;
  }

  private _row(row: RowModel, zone = 'now') {
    return html`<pv-chore-item .row=${row} color=${this.colorOf(this.column.member)} ?highlight=${zone === 'now'} ?locked=${this.locked}></pv-chore-item>`;
  }

  private _timeline() {
    const entries = timelineFor(this.column, {
      now: new Date(), events: this.events, timeFormat: this.timeFormat, bedtime: this.bedtime,
      dayStarts: this.board?.settings?.day_starts,
    });
    if (entries.length === 0) return html`<p class="meta" style="margin-top:12px">Nothing on today's timeline.</p>`;
    return html`<div class="tl">${repeat(entries, e => e.key, e => this._entry(e))}</div>${this._weekRows()}`;
  }

  private _entry(entry: TimelineEntry) {
    switch (entry.kind) {
      case 'band':
        return html`<div class="tl-band">${entry.label}</div>`;
      case 'event':
        return html`
          <div class="tl-row"><span class="tl-time">${entry.time}</span>
            <div class="event ${entry.past ? 'past' : ''}"><span aria-hidden="true">${entry.picture}</span>
              <div><div class="title">${entry.title}</div><div class="range">${entry.range}</div></div>
            </div>
          </div>
        `;
      case 'chore':
        return html`<div class="tl-row"><span class="tl-time">${entry.time ?? ''}</span>${this._row(entry.row, entry.row.state === 'done' ? 'done' : 'later')}</div>`;
      case 'now':
        return html`<div class="tl-row"><span class="tl-time now-time">${entry.time}</span><div class="now-line" aria-label="Now"></div></div>`;
      case 'free':
        return html`
          <div class="tl-row"><span class="tl-time"></span>
            <div class="free">
              ${entry.until ? html`Free until <strong>${entry.until}</strong>${entry.span ? html` · <strong>${entry.span}</strong>` : nothing}` : html`Free for the rest of the day`}
              ${entry.fits.length ? html`<div class="fits">Fits now: ${entry.fits.join(' · ')}</div>` : nothing}
            </div>
          </div>
        `;
      case 'bedtime':
        return html`<div class="tl-row"><span class="tl-time"></span><span class="bed">🌙 Bedtime ${entry.time}</span></div>`;
    }
  }

  private _weekRows() {
    if (this.layout === 'landscape') return nothing;
    const week = this.column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    if (week.length === 0) return nothing;
    return html`
      <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
      ${repeat(week, row => row.key, row => this._row(row, 'week'))}
    `;
  }

  private _list() {
    const column = this.column;
    const open = column.entries.flatMap(e => (e.kind === 'row' && e.zone !== 'week' && e.zone !== 'done' ? [e.row] : []));
    const week = column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    const next = nextLine(this.events, column.member.id, new Date(), this.timeFormat);
    return html`
      ${next ? html`<div class="next">📅 ${next}</div>` : nothing}
      <div class="section-head"><span>Today</span></div>
      ${open.length || column.doneToday.length ? nothing : html`<p class="meta">Nothing due today.</p>`}
      ${repeat(open, r => r.key, r => this._row(r))}
      ${repeat(column.doneToday, r => r.key, r => this._row(r, 'done'))}
      ${week.length && this.layout !== 'landscape' ? html`
        <div class="section-head"><span>This week</span><span class="right">${this.board.week.days_left} days left</span></div>
        ${repeat(week, r => r.key, r => this._row(r, 'week'))}
      ` : nothing}
      ${this._fair()}
    `;
  }

  private _fair() {
    if (this.shares.length === 0 || this.column.member.age_group === 'young_child') return nothing;
    return html`
      <div class="fair">
        <div class="section-head" style="margin-left:0"><span>Shared chores this week, by time done</span></div>
        <div class="bar" role="img" aria-label=${this.shares.map(s => s.text).join(', ')}>
          ${this.shares.map(s => html`<span style="width:${s.percent}%;background:${this.colorOf(s.member)}"></span>`)}
        </div>
        <div class="legend">${this.shares.map(s => html`<span><i style="background:${this.colorOf(s.member)}"></i>${s.text}</span>`)}</div>
      </div>
    `;
  }

  private _pictures() {
    const model = picturesFor(this.column, this.events, new Date(), this.timeFormat);
    const stars = this.column.member.stars ? this.column.entry.week_stars : 0;
    const color = this.colorOf(this.column.member);
    return html`
      ${model.now ? html`
        <div class="now-tile">
          <div class="label" style="text-align:center;margin-top:0;color:${color}">NOW</div>
          ${keyed(model.now.key, html`<pv-chore-tile large now .row=${model.now} color=${color} ?locked=${this.locked}
            .stars=${this.column.member.stars ? model.now.item.stars : 0}></pv-chore-tile>`)}
        </div>
      ` : html`<div class="label" style="text-align:center">All done for now 🎉</div>`}
      ${model.next.length ? html`
        <div class="pictures-next">
        <div class="label">Next</div>
        <div class="steps">
          ${repeat(model.next, step => (step.kind === 'event' ? `event:${step.text}` : step.row.key), step => step.kind === 'event'
            ? html`<div class="step"><span class="picture" aria-hidden="true">${step.picture}</span>${step.text}</div>`
            : html`<pv-chore-tile .row=${step.row} color=${color} ?locked=${this.locked}></pv-chore-tile>`)}
        </div>
        </div>
      ` : nothing}
      ${model.waiting.length || model.later.length || model.done.length ? html`
        <div class="label">Later, waiting, and done</div>
        <div class="tiles">
          ${repeat([...model.later, ...model.waiting, ...model.done], r => r.key, r => html`
            <pv-chore-tile .row=${r} color=${color} ?locked=${this.locked}></pv-chore-tile>
          `)}
        </div>
      ` : nothing}
      ${this.column.member.stars ? html`
        <div class="label">${stickersLabel(stars)}${this.goal ? html` · Goal: ${pictureOf(this.goal.reward.icon)} ${this.goal.reward.name} · ${goalWords(this.goal)}` : nothing}</div>
        <div class="stickers" role="img" aria-label=${`${stars} stars this week`}>
          ${Array.from({ length: Math.min(30, stars) }, () => html`<span aria-hidden="true">⭐</span>`)}
          ${stars === 0 ? html`<span class="meta">Stars show up here.</span>` : nothing}
        </div>
      ` : nothing}
    `;
  }

  private _side() {
    const column = this.column;
    const week = column.entries.flatMap(e => (e.kind === 'row' && e.zone === 'week' ? [e.row] : []));
    if (this.layout !== 'landscape') {
      return nothing;
    }
    return html`
      <aside class="card side">
        ${column.member.stars ? html`
          <div class="section">
            <h3>Stars</h3>
            <div class="stars-big num">★ ${column.entry.stars}</div>
            ${this.goal ? this._goal(this.goal) : nothing}
          </div>
        ` : nothing}
        <div class="section">
          <h3>This week</h3>
          ${week.length ? repeat(week, r => r.key, r => this._row(r, 'week')) : html`<p class="meta">Nothing more this week.</p>`}
        </div>
      </aside>
    `;
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-my-day', PvChoresMyDay);
