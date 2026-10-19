import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { keepOrder } from './week-derive';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { StatusBadge, badgeBelow } from '../../core/status-map';
import { SheetMotion } from '../../shell/sheet-motion';
import { choresStyles } from './chores-styles';
import type { DayView, ItemView, PastItem } from './chores-types';
import { chorePicture } from './picture-words';
import { backdropTap } from '../../core/backdrop';
import { SheetLayer } from '../../core/sheet-layer';
import { PressGuard } from '../../core/press-guard';
import { awayLine, dayItemBadge, isPast, longDay } from './board-day-derive';

/**
 * pv-chores-day-sheet: one person's day from the Week view (spec 13.5):
 * what was due, done, missed, or excused on a past day, and what is due on
 * today or a day to come. Parents can excuse a missed one.
 *
 * @fires pv-day-excuse - { occurrence, name } Excuse it on a missed one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresDaySheet extends LitElement {
  /** Closes the sheet only after a press that began on the backdrop (core/backdrop). */
  private readonly _backdrop = backdropTap(() => void this.close());
  private readonly _layer = new SheetLayer(this);
  private readonly _pressGuard = new PressGuard(this);
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) member!: Member;
  @property({ type: String }) date = '';
  @property({ type: String }) today = '';
  /** The day, once it arrives; null while loading. */
  @property({ attribute: false }) day: DayView | null = null;
  @property({ type: Boolean }) failed = false;
  @property({ type: Boolean }) canExcuse = false;
  /** Being excused now (the PIN, the save): its link takes no second tap, and comes back if nothing was (round 6). */
  @property({ attribute: false }) excusing: ReadonlySet<string> = new Set();
  @property({ attribute: false }) names: (id: string) => string = id => id;

  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    choresStyles,
    css`
      .heading {
        text-align: left;
      }

      .sub {
        margin: 0 0 12px;
        color: var(--pv-text-secondary, #5F6670);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      li .name {
        flex: 1 1 auto;
        min-width: 0;
      }

      /* A long badge (a parent's note) goes under the name and wraps, as on the board (round 11). */
      li .name.below {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 3px;
        padding: 6px 0;
      }

      li .name.below .badge {
        white-space: normal;
        text-align: left;
      }

      li .link {
        flex: none;
      }

      li .pic {
        filter: var(--pv-media-filter, none); /* a dimmed shared screen (0.12.0) */
        flex: none;
        width: 28px;
        text-align: center;
      }

      .link {
        min-height: 48px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, #5B5BD6);
        font: inherit;
        font-weight: 750;
        cursor: pointer;
      }
    `,
  ];

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    this.renderRoot.querySelector<HTMLElement>('#day-title')?.focus();
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
    await this._motion.close(panel, backdrop);
    this.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  private _badge(item: ItemView | PastItem): StatusBadge | null {
    return dayItemBadge(item, this.member.id, this.today, this.names);
  }

  render() {
    const entry = this.day?.members[this.member?.id ?? ''];
    // Rows keep the places they were shown in while the day reloads after Excuse it (round 6).
    const place = `${this.member?.id}|${this.date}`;
    const items = entry ? keepOrder(entry.items, this._order.place === place ? this._order.keys : []) : [];
    if (entry) this._order = { place, keys: items.map(item => item.key) };
    const summary = entry?.summary;
    const sub = !this.day
      ? ''
      : entry?.away
        ? awayLine(this.day.kind)
        : summary
          ? summary.closed ? `Ring closed: ${summary.done + summary.pending} of ${summary.due} done.` : `${summary.done + summary.pending} of ${summary.due} done.`
          : this.day.kind === 'future' ? 'Still to come.' : '';
    return html`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title" tabindex="-1">${this.member?.name} · ${longDay(this.date)}</h2>
        ${sub ? html`<p class="sub">${sub}</p>` : nothing}
        ${this.failed ? html`<p class="sub">Couldn't load this day. Try again in a moment.</p>` : !this.day ? html`
          <div aria-busy="true"><div class="bone" style="height:44px;margin-bottom:8px"></div><div class="bone" style="height:44px"></div></div>
        ` : entry && items.length ? html`
          <ul>
            ${items.map(item => {
              const badge = this._badge(item);
              // One long badge puts every badge under its name, so the list keeps one column (round 12).
              const below = items.some(item => badgeBelow(this._badge(item), false));
              const shown = badge ? html`<span class="badge ${badge.tone}">${badge.glyph ? html`<span class="emo">${badge.glyph}</span> ` : ''}${badge.words}</span>` : nothing;
              return html`
                <li>
                  <span class="pic" aria-hidden="true">${chorePicture(item.icon, item.name)}</span>
                  <span class="name ${below ? 'below' : ''}">${item.name}${below ? shown : nothing}</span>
                  ${below ? nothing : shown}
                  ${isPast(item) && item.status === 'missed' && this.canExcuse && !this.excusing.has(item.key) ? html`
                    <button class="link" type="button" @click=${() => this._excuse(item)}>Excuse it</button>
                  ` : nothing}
                </li>
              `;
            })}
          </ul>
        ` : html`<p class="sub">Nothing was on the board.</p>`}
        <div class="actions"><button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button></div>
      </div>
    `;
  }

  private _order: { place: string; keys: string[] } = { place: '', keys: [] };

  private _excuse(item: PastItem): void {
    if (this.excusing.has(item.key)) return;
    this.dispatchEvent(new CustomEvent('pv-day-excuse', { detail: { occurrence: item.key, name: item.name }, bubbles: true, composed: true }));
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.close();
      return;
    }
    trapTab(this.shadowRoot!, event);
  };
}

defineElement('pv-chores-day-sheet', PvChoresDaySheet);
