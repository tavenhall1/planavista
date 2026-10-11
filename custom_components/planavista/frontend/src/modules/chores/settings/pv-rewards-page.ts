import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Reward } from '../chores-types';
import { pictureFor } from '../picture-words';
import { rewardLine } from './reward-draft';
import { choresSettingsStyles } from './settings-styles';

/** pv-rewards-page: the rewards catalog (spec 14.5, 8.15), a list like Chores; each opens its editor. */
export class PvRewardsPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  static styles = [
    baseStyles,
    buttonStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .count {
        flex: 1;
        margin: 0;
        color: var(--pv-text-secondary, #6B7280);
      }

      .new {
        min-height: 48px;
        white-space: nowrap;
      }
    `,
  ];

  render() {
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const members = inOrder(this.household?.members ?? []);
    const rewards = board.rewards;
    return html`
      <div class="head">
        <p class="count">${rewards.length} ${rewards.length === 1 ? 'reward' : 'rewards'}</p>
        <button class="pv-btn pv-btn-primary new" type="button" @click=${() => this._open(null)}>+ New reward</button>
      </div>
      ${rewards.length ? html`
        <ul class="group">
          ${rewards.map(reward => html`
            <li>
              <button class="row" type="button" @click=${() => this._open(reward)}>
                <span class="picture" aria-hidden="true">${reward.icon || pictureFor(reward.name, '🎁')}</span>
                <span class="row-text">
                  <span class="row-title">${reward.name}</span>
                  <span class="row-sub">${rewardLine(reward, members)}</span>
                </span>
                <span class="chevron" aria-hidden="true">›</span>
              </button>
            </li>
          `)}
        </ul>
      ` : html`<p class="empty">No rewards yet. Add a few things worth saving stars for, like a movie night pick or 30 minutes of screen time.</p>`}
      ${rewards.length ? html`<p class="hint">Kids see these in Rewards on the board and can pin one as what they're saving up for.</p>` : nothing}
    `;
  }

  private _open(reward: Reward | null): void {
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
      detail: { tag: 'pv-reward-editor', title: reward ? reward.name : 'New reward', back: 'Rewards', props: { rewardId: reward?.id ?? null } },
      bubbles: true, composed: true,
    }));
  }
}

defineElement('pv-rewards-page', PvRewardsPage);
