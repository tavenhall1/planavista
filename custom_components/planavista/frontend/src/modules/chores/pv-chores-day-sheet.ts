import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { StatusBadge, itemBadge, pastBadge } from '../../core/status-map';
import { SheetMotion } from '../../shell/sheet-motion';
import { choresStyles } from './chores-styles';
import type { DayView, ItemView, PastItem } from './chores-types';
import { pictureOf } from './pv-chore-tile';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Monday, October 12". */
export function longDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function isPast(item: ItemView | PastItem): item is PastItem {
  return !('section' in item);
}

/**
 * pv-chores-day-sheet: one person's day from the Week view (spec 13.5):
 * what was due, done, missed, or excused on a past day, and what is due on
 * today or a day to come. Parents can excuse a missed one.
 *
 * @fires pv-day-excuse - { occurrence, name } Excuse it on a missed one
 * @fires pv-sheet-close - Done, Escape, a tap outside, or a drag down
 */
export class PvChoresDaySheet extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) member!: Member;
  @property({ type: String }) date = '';
  @property({ type: String }) today = '';
  /** The day, once it arrives; null while loading. */
  @property({ attribute: false }) day: DayView | null = null;
  @property({ type: Boolean }) failed = false;
  @property({ type: Boolean }) canExcuse = false;
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

      li .pic {
        width: 28px;
        text-align: center;
      }

      .link {
        min-height: 40px;
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
    this.renderRoot.querySelector<HTMLElement>('.actions button')?.focus();
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
    if (isPast(item)) {
      const badge = pastBadge(item.status);
      if (item.status === 'done' && item.done_by && item.done_by !== this.member.id) return { ...badge, words: `Done by ${this.names(item.done_by)}` };
      return badge;
    }
    return itemBadge(item, { today: this.today, daysLeft: 7, remaining: 0 }) ?? (item.status === 'done' ? pastBadge('done') : null);
  }

  render() {
    const entry = this.day?.members[this.member?.id ?? ''];
    const summary = entry?.summary;
    const sub = !this.day
      ? ''
      : entry?.away
        ? 'Away: nothing was due, and the streak keeps.'
        : summary
          ? summary.closed ? `Ring closed: ${summary.done + summary.pending} of ${summary.due} done.` : `${summary.done + summary.pending} of ${summary.due} done.`
          : this.day.kind === 'future' ? 'Still to come.' : '';
    return html`
      <div class="backdrop" @click=${() => void this.close()}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="day-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="day-title">${this.member?.name} · ${longDay(this.date)}</h2>
        ${sub ? html`<p class="sub">${sub}</p>` : nothing}
        ${this.failed ? html`<p class="sub">Couldn't load this day. Try again in a moment.</p>` : !this.day ? html`
          <div aria-busy="true"><div class="bone" style="height:44px;margin-bottom:8px"></div><div class="bone" style="height:44px"></div></div>
        ` : entry && entry.items.length ? html`
          <ul>
            ${entry.items.map(item => {
              const badge = this._badge(item);
              return html`
                <li>
                  <span class="pic" aria-hidden="true">${pictureOf(item.icon)}</span>
                  <span class="name">${item.name}</span>
                  ${badge ? html`<span class="badge ${badge.tone}">${badge.glyph ? `${badge.glyph} ` : ''}${badge.words}</span>` : nothing}
                  ${isPast(item) && item.status === 'missed' && this.canExcuse ? html`
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

  private _excuse(item: PastItem): void {
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
