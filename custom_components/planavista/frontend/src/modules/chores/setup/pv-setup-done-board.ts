import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import './pv-setup-board-preview';

/**
 * pv-setup-done-board: what chores add to You're all set (spec 14.7): a
 * preview of the board and two tips. Shown while chores are on.
 */
export class PvSetupDoneBoard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  static styles = css`
    :host {
      display: block;
    }

    .lead {
      margin: -12px 0 16px;
      color: var(--pv-text-secondary, #6B7280);
    }

    .tips {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .tip {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      font-size: 1.25rem;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .text {
      color: var(--pv-text-secondary, #6B7280);
    }
  `;

  render() {
    const account = this.household?.account;
    const pin = account?.shared || account?.kind === 'other';
    return html`
      <p class="lead">Here's your board. It fills in as the day goes.</p>
      <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
        .revision=${this.revision}></pv-setup-board-preview>
      <div class="tips">
        <div class="tip">
          <span class="icon" aria-hidden="true">👆</span>
          <span><span class="title">Hold the circle to finish a chore</span><span class="text">Let go early and nothing happens.</span></span>
        </div>
        <div class="tip">
          <span class="icon" aria-hidden="true">⚙️</span>
          <span>
            <span class="title">${pin ? "Settings needs a parent's PIN" : 'Change anything in Settings'}</span>
            <span class="text">It's the gear in the bar.</span>
          </span>
        </div>
      </div>
    `;
  }
}

defineElement('pv-setup-done-board', PvSetupDoneBoard);
