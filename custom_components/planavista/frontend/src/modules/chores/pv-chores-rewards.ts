import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import '../../core/pv-member-avatar';
import { choresStyles } from './chores-styles';
import type { Balance, RewardCard } from './rewards-derive';
import { pictureOf } from './pv-chore-tile';
import { ScrollReporter } from '../../core/content-scroll';

/**
 * pv-chores-rewards: what stars are for (spec 13.6). Balances and goals on
 * top; the catalog below, each card saying who can afford it, with Redeem
 * (it waits for a parent unless the reward needs no OK). Parents get an Add
 * a reward tile; a line at the bottom says who got what lately.
 *
 * @fires pv-reward-redeem - { reward } Redeem was tapped
 * @fires pv-reward-open - { reward } a card was tapped (its sheet), or { reward: null } for Add a reward
 */
export class PvChoresRewards extends LitElement {
  /** Tells the card how far down this is, so the portrait header can shrink (spec 12.2). */
  private _scroll = new ScrollReporter();

  @property({ attribute: false }) balances: Balance[] = [];
  @property({ attribute: false }) cards: RewardCard[] = [];
  @property({ attribute: false }) recent: string | null = null;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** Parents (or a screen that can ask for a parent's PIN) see Add a reward. */
  @property({ type: Boolean }) canEdit = false;

  static styles = [
    buttonStyles,
    choresStyles,
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

      .balances {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }

      .balance {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        border-top: 3px solid var(--c);
      }

      .balance .stars {
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 1.75rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .balance .goal {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 0.8125rem;
        color: var(--pv-text-secondary, #5F6670);
      }

      .bar {
        height: 8px;
        margin-top: 6px;
        border-radius: 999px;
        background: var(--pv-track, #ECECE8);
        overflow: hidden;
      }

      .bar span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: var(--c);
      }

      .catalog {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      :host([layout='portrait']) .catalog {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      :host([layout='phone']) .catalog {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        border-radius: var(--pv-radius-lg, 16px);
        background: var(--pv-card-bg, #FFFFFF);
        border: 1px solid var(--pv-border, #E7E7E3);
        min-width: 0;
      }

      .open {
        display: flex;
        flex-direction: column;
        gap: 4px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        padding: 0;
        cursor: pointer;
      }

      .open:focus-visible {
        outline: 2px solid var(--pv-accent-ink, #5B5BD6);
        outline-offset: 2px;
        border-radius: 10px;
      }

      .icon {
        font-size: 30px;
        line-height: 1.1;
      }

      .name {
        font-weight: 750;
        line-height: 1.25;
      }

      .cost {
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .tag {
        padding: 2px 6px;
        border-radius: 6px;
        background: var(--pv-chip, #F1F1EE);
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .tag.ok {
        color: var(--pv-text, #1A1B1E);
      }

      .goal-tag {
        position: absolute;
        top: 10px;
        right: 10px;
      }

      .card .action {
        margin-top: auto;
        min-height: 44px;
        width: 100%;
      }

      .add {
        align-items: center;
        justify-content: center;
        min-height: 160px;
        border-style: dashed;
        color: var(--pv-accent-ink, #5B5BD6);
        font-weight: 750;
        cursor: pointer;
        font: inherit;
        background: transparent;
      }

      .recent {
        margin: 14px 4px 0;
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.875rem;
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
    return html`
      <div class="wrap">
        ${this.balances.length ? html`
          <div class="balances">
            ${this.balances.map(b => html`
              <div class="balance" style="--c:${this.colorOf(b.member)}">
                <pv-member-avatar .member=${{ ...b.member, color: this.colorOf(b.member) }} .hass=${this.hass} size="40"></pv-member-avatar>
                <span class="stars num" aria-label=${`${b.member.name}: ${b.stars} stars`}>★ ${b.stars}</span>
                <div class="goal">
                  ${b.goal ? html`
                    Goal: ${pictureOf(b.goal.reward.icon)} ${b.goal.reward.name} · ${b.goal.need > 0 ? `${b.goal.need} more` : 'enough stars!'}
                    <div class="bar"><span style="width:${Math.round(b.goal.progress * 100)}%"></span></div>
                  ` : html`No goal yet`}
                </div>
              </div>
            `)}
          </div>
        ` : nothing}
        ${this.cards.length === 0 && !this.canEdit ? html`
          <div class="state"><div class="art" aria-hidden="true">🎁</div><h2>No rewards yet</h2><p>A parent can add rewards to save stars up for.</p></div>
        ` : html`
          <div class="catalog">
            ${this.cards.map(card => this._card(card))}
            ${this.canEdit ? html`
              <button class="card add" type="button" @click=${() => this._fire('pv-reward-open', { reward: null })}>+ Add a reward<span class="meta">parents</span></button>
            ` : nothing}
          </div>
        `}
        ${this.recent ? html`<p class="recent">${this.recent}</p>` : nothing}
      </div>
    `;
  }

  private _card(card: RewardCard) {
    const reward = card.reward;
    const asked = card.asked.length;
    return html`
      <div class="card">
        ${card.goals.length ? html`<span class="tag goal-tag">${card.goals.map(m => `${m.name}'s goal`).join(', ')}</span>` : nothing}
        <button class="open" type="button" @click=${() => this._fire('pv-reward-open', { reward: reward.id })}>
          <span class="icon" aria-hidden="true">${pictureOf(reward.icon)}</span>
          <span class="name">${reward.name}</span>
          <span class="cost num">★ ${reward.cost}</span>
        </button>
        <div class="tags">
          ${card.people.map(p => html`<span class="tag ${p.afford ? 'ok' : ''}">${p.member.name}${p.afford ? ' ✓' : `: ${p.more} more`}</span>`)}
          ${asked ? html`<span class="badge act">⏳ ${card.asked.map(m => m.name).join(', ')} · Waiting for OK</span>` : nothing}
        </div>
        ${card.canRedeem
          ? html`<button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._fire('pv-reward-redeem', { reward: reward.id })}>Redeem</button>`
          : html`<button class="pv-btn pv-btn-secondary action" type="button" disabled>${asked ? 'Requested' : 'Not enough stars yet'}</button>`}
      </div>
    `;
  }

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-chores-rewards', PvChoresRewards);
