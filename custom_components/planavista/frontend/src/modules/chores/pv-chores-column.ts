import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { motionOf } from '../../core/motion';
import '../../core/pv-ring';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { ColumnEntry, ColumnModel, RowModel } from './board-derive';
import { bump, flyStars, glide, measure } from './effects';
import './pv-chore-item';
import './pv-chore-tile';
import './pv-surprise-present';
import type { SurpriseModel } from './surprise-derive';
import { ref } from 'lit/directives/ref.js';
import { ScrollReporter } from '../../core/content-scroll';
import { stickersLabel } from './my-day-derive';

/** The most stickers a strip draws before it says "+5". */
const STICKERS = 20;

/**
 * pv-chores-column: one person's today on the board (spec 13.1). The header
 * is their picture inside their ring, their name, today's count, stars and
 * streak, and what's next on their calendar; tapping it opens their My day.
 * Rows glide into Done today when they're checked off (FLIP). Young
 * children get picture tiles and a sticker strip for the week.
 *
 * @fires pv-member-open - { member } the header was tapped
 */
export class PvChoresColumn extends LitElement {
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();

  @property({ attribute: false }) model!: ColumnModel;
  @property({ attribute: false }) hass?: HomeAssistant;
  /** The person's color for the mode (their ring, checks, and tints). */
  @property({ type: String }) color = '#5B5BD6';
  @property({ type: Boolean, reflect: true }) narrow = false;
  /** This screen may not change their items. */
  @property({ type: Boolean }) locked = false;
  /** Change it to celebrate the ring closing once. */
  @property({ type: Number }) celebrate = 0;
  /** Change it to pulse once (the evening check). */
  @property({ type: Number }) pulse = 0;
  /** Their goal surprise, waiting until it is opened (milestone 10). */
  @property({ attribute: false }) surprise: SurpriseModel | null = null;
  /** This screen may open it. */
  @property({ type: Boolean }) mayOpen = false;
  @property({ type: String, reflect: true }) member = '';

  private _before: Map<string, DOMRect> | null = null;

  static styles = [
    choresStyles,
    css`
      :host {
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
        width: 100%;
        padding: 14px 14px 8px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .head:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: -2px;
        border-radius: 12px;
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

      /* It clips the dot that leads each wrapped line, so neither end of a line shows one (round 3). */
      .line {
        display: block;
        overflow: hidden;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
        font-variant-numeric: tabular-nums;
      }

      .parts {
        display: flex;
        flex-wrap: wrap;
        margin-left: -1em;
      }

      /* The line breaks between its parts, never inside one ("🔥 2 days", round 1). */
      .parts > span {
        white-space: nowrap;
      }

      .parts > span::before {
        content: '·';
        display: inline-block;
        width: 1em;
        text-align: center;
      }

      .stars {
        display: inline-block;
      }

      .next {
        padding: 0 14px 8px;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
        line-height: 1.35;
      }

      .next strong {
        color: var(--pv-text, #1A1B1E);
        font-weight: 650;
      }

      .body {
        position: relative;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0 8px 12px;
      }

      .head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 12px 6px 4px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .head-row.now {
        color: var(--pv-text, #1A1B1E);
      }

      .head-row.now::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--member);
        flex-shrink: 0;
      }

      .head-row.now .text {
        flex: 1;
      }

      .credit {
        margin: 10px 6px 0;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-muted, #8E949C);
      }

      .closed {
        margin: 6px 4px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-text, #1A1B1E);
      }

      .closed strong {
        display: block;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.0625rem;
        margin-bottom: 2px;
      }

      .closed span {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.9375rem;
      }

      .away {
        margin: 6px 4px;
        padding: 12px 14px;
        border-radius: 12px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
      }

      .quiet {
        margin: 10px 6px;
        color: var(--pv-text-muted, #8E949C);
        font-size: 0.9375rem;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 10px;
        padding: 4px 4px 0;
      }

      .stickers {
        margin: 14px 6px 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .stickers .row {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        margin-top: 4px;
        font-size: 20px;
        line-height: 1.1;
      }

      .layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
      }
    `,
  ];

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has('color')) this.style.setProperty('--member', this.color);
    if (changed.has('model') && changed.get('model')) {
      this._before = measure(this.renderRoot.querySelectorAll<HTMLElement>('[data-key]'));
    }
  }

  protected updated(changed: PropertyValues): void {
    if (this._before) {
      glide(this.renderRoot.querySelectorAll<HTMLElement>('[data-key]'), this._before, this);
      this._before = null;
    }
    if (changed.has('pulse') && this.pulse && changed.get('pulse') !== undefined) this._pulse();
  }

  private _pulse(): void {
    if (motionOf(this) === 'reduced') return;
    this.animate(
      { boxShadow: ['0 0 0 0 transparent', `0 0 0 6px color-mix(in srgb, ${this.color} 35%, transparent)`, '0 0 0 0 transparent'] },
      { duration: 1400, easing: 'ease-in-out' },
    );
  }

  /** "+1 ★" flies from a check-off to this person's star count (spec 11.5). */
  flyStars(from: DOMRect, stars: number): void {
    const layer = this.renderRoot.querySelector<HTMLElement>('.layer');
    const target = this.renderRoot.querySelector<HTMLElement>('.stars');
    if (!layer) return;
    flyStars(this, layer, from, target?.getBoundingClientRect() ?? null, stars);
    window.setTimeout(() => bump(this.renderRoot.querySelector('.stars'), this), 600);
  }

  private _open(): void {
    this.dispatchEvent(new CustomEvent('pv-member-open', { detail: { member: this.model.member.id }, bubbles: true, composed: true }));
  }

  render() {
    const model = this.model;
    if (!model) return nothing;
    const member = model.member;
    return html`
      <button class="head" type="button" aria-label=${`${model.ring.label}. Open ${member.name}'s day`} @click=${this._open}>
        <pv-ring size="58" .progress=${model.ring.progress} ?closed=${model.ring.closed} color=${this.color}
          .celebrate=${this.celebrate}>
          <pv-member-avatar .member=${{ ...member, color: this.color }} .hass=${this.hass} size="44"></pv-member-avatar>
        </pv-ring>
        <span class="who">
          <span class="name">${member.name}</span>
          <span class="line"><span class="parts">${model.parts.map(part => html`<span class=${part.kind}>${part.text}</span>`)}</span></span>
        </span>
      </button>
      ${model.next ? html`<div class="next">${this._next(model.next)}</div>` : nothing}
      <div class="body" ${ref(this._scroll.attach)}>
        ${model.away ? html`<div class="away">🧳 Away${model.away.note ? ` · ${model.away.note}` : ''}. Nothing is due, and the streak keeps.</div>` : nothing}
        ${model.ring.closed && !model.entries.some(e => e.kind === 'row' && (e.zone === 'now' || e.zone === 'later' || e.zone === 'overdue'))
          ? html`<div class="closed"><strong>Ring closed for today</strong><span>Everything due today is done. Nice work.</span></div>`
          : nothing}
        ${model.pictures ? this._tiles(model) : this._list(model)}
        ${model.empty && !model.away ? html`<div class="quiet">Nothing on the board today.</div>` : nothing}
        <div class="layer"></div>
      </div>
    `;
  }

  /** "Next on calendar: Soccer at 5:30 · free until then", with the event in bold. */
  private _next(text: string) {
    const match = /^Next on calendar: (.*?)( · free until then)?$/.exec(text);
    if (!match) return text;
    return html`Next on calendar: <strong>${match[1]}</strong>${match[2] ?? ''}`;
  }

  private _list(model: ColumnModel) {
    return html`${this._present(model, 'row')}${repeat(model.entries, entry => entry.key, entry => this._entry(entry))}`;
  }

  /** The goal surprise, while it waits to be opened. */
  private _present(model: ColumnModel, shape: 'tile' | 'row') {
    const surprise = this.surprise;
    if (!surprise || surprise.opened) return nothing;
    return html`
      <pv-surprise-present class="surprise" .model=${surprise} name=${model.member.name} color=${this.color}
        ?may=${this.mayOpen} shape=${shape} ?young=${model.member.age_group === 'young_child'} .order=${model.member.order}></pv-surprise-present>
    `;
  }

  private _entry(entry: ColumnEntry) {
    if (entry.kind === 'head') {
      return html`
        <div class="head-row ${entry.tone}" data-key=${entry.key}>
          <span class="text">${entry.text}</span>${entry.right ? html`<span>${entry.right}</span>` : nothing}
        </div>
      `;
    }
    if (entry.kind === 'credit') return html`<div class="credit" data-key=${entry.key}>${entry.text}</div>`;
    return html`
      <pv-chore-item data-key=${entry.key} .row=${entry.row} color=${this.color} ?narrow=${this.narrow}
        ?highlight=${entry.zone === 'now'} ?dim=${entry.zone === 'later'} ?locked=${this.locked}></pv-chore-item>
    `;
  }

  private _tiles(model: ColumnModel) {
    const tiles: Array<{ row: RowModel; now: boolean; stars: number }> = [];
    let first = true;
    for (const entry of model.entries) {
      if (entry.kind !== 'row' || entry.zone === 'done') continue;
      tiles.push({ row: entry.row, now: first && entry.row.state !== 'pending', stars: model.member.stars ? entry.row.item.stars : 0 });
      if (entry.row.state !== 'pending') first = false;
    }
    // Done tiles last, in the same keyed list: a tile that's just done keeps its element, so it pops and glides there.
    for (const entry of model.entries) {
      if (entry.kind === 'row' && entry.zone === 'done') tiles.push({ row: entry.row, now: false, stars: 0 });
    }
    const stickers = model.entry.week_stars;
    return html`
      <div class="tiles">
        ${this._present(model, 'tile')}
        ${repeat(tiles, t => t.row.key, t => html`
          <pv-chore-tile data-key=${t.row.key} .row=${t.row} color=${this.color} ?now=${t.now} ?locked=${this.locked}
            .stars=${t.stars}></pv-chore-tile>
        `)}
      </div>
      ${model.member.stars && !model.empty ? html`
        <div class="stickers">
          ${stickersLabel(stickers)}
          <div class="row" role="img" aria-label=${`${stickers} ${stickers === 1 ? 'star' : 'stars'} this week`}>
            ${Array.from({ length: Math.min(STICKERS, stickers) }, () => html`<span aria-hidden="true">⭐</span>`)}
            ${stickers > STICKERS ? html`<span class="meta">+${stickers - STICKERS}</span>` : nothing}
            ${stickers === 0 ? html`<span class="meta">Stars show up here.</span>` : nothing}
          </div>
        </div>
      ` : nothing}
    `;
  }
}

defineElement('pv-chores-column', PvChoresColumn);
