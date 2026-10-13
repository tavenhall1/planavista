import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import type { ChoresService } from '../chores-service';
import { PreviewPick, previewColumns } from './setup-derive';
import '../../../core/pv-member-avatar';

/**
 * pv-setup-board-preview: the board as setup shows it (spec 14.7): each
 * person's column with today's chores and This week, filling in as the
 * parent picks. Read only.
 */
export class PvSetupBoardPreview extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ attribute: false }) picks: PreviewPick[] = [];

  static styles = css`
    :host {
      display: block;
    }

    .columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .column {
      padding: 10px 12px;
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
    }

    .who {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .name {
      font-weight: 700;
    }

    .summary {
      font-size: 0.75rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 4px;
    }

    li {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
    }

    li::before {
      content: '';
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
    }

    .week {
      margin: 8px 0 4px;
      font-size: 0.8125rem;
      font-weight: 750;
      color: var(--pv-text-secondary, #6B7280);
    }
  `;

  render() {
    const board = (this.services?.chores as ChoresService | undefined)?.board() ?? null;
    const columns = previewColumns(this.household?.members ?? [], board, this.picks);
    if (!columns.length) return nothing;
    return html`
      <div class="columns">
        ${columns.map(column => html`
          <section class="column" aria-label=${column.member.name}>
            <div class="who">
              <pv-member-avatar .member=${column.member} .hass=${this.hass} size="28"></pv-member-avatar>
              <span><span class="name">${column.member.name}</span><br /><span class="summary">${column.summary}</span></span>
            </div>
            ${column.today.length ? html`<ul>${column.today.map(name => html`<li>${name}</li>`)}</ul>` : nothing}
            ${column.week.length ? html`
              <div class="week">This week</div>
              <ul>${column.week.map(name => html`<li>${name}</li>`)}</ul>
            ` : nothing}
          </section>
        `)}
      </div>
    `;
  }
}

defineElement('pv-setup-board-preview', PvSetupBoardPreview);
