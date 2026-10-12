import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { POP_PAGE } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { Reward } from '../chores-types';
import { pictureFor } from '../picture-words';
import {
  RewardDraft, RewardRecord, beginRewardDraft, nextCost, rewardChanges, rewardDirty, rewardProblem, whoText,
} from './reward-draft';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';
import '../../../shell/pv-notice-sheet';

type Notice = 'discard' | 'delete';
const PICTURES = ['🎬', '🎮', '📺', '🍦', '🍕', '🌙', '💵', '🍽️', '🎨', '📚', '⚽', '🎁', '🛝', '🧁', '🎟️', '🏊'];

/**
 * pv-reward-editor: one reward (spec 14.5): picture, name, cost in stars,
 * needs an OK, and who can get it. Cancel and Save, like the other editors.
 */
export class PvRewardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _record!: RewardRecord;
  @state() private _problem = '';
  @state() private _saving = false;
  @state() private _notice: Notice | null = null;
  private _loaded = false;
  private _leave?: (ok: boolean) => void;

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _rewardId(): string | null {
    return (this.pageProps.rewardId as string | null | undefined) ?? null;
  }

  private get _reward(): Reward | null {
    return this._chores?.board()?.rewards.find(r => r.id === this._rewardId) ?? null;
  }

  private get _key(): string {
    return `reward:${this._rewardId ?? 'new'}`;
  }

  protected willUpdate(): void {
    if (!this._loaded && this._chores?.board() && (this._rewardId === null || this._reward)) {
      this._record = (this.drafts.get(this._key) as RewardRecord | undefined) ?? beginRewardDraft(this._reward);
      this._loaded = true;
    }
  }

  confirmLeave(): Promise<boolean> {
    if (!this._loaded || !rewardDirty(this._record)) return Promise.resolve(true);
    this._notice = 'discard';
    return new Promise(resolve => {
      this._leave = resolve;
    });
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-left: auto;
      }

      .actions button {
        min-height: 48px;
        min-width: 88px;
      }

      .big {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
        font-size: 2.5rem;
      }

      .pictures {
        display: grid;
        grid-template-columns: repeat(auto-fill, 48px);
        gap: 6px;
        padding: 12px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 1.5rem;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        box-shadow: inset 0 0 0 2px var(--pv-accent, #6366F1);
      }

      .name-row input {
        flex: 1;
        min-height: 48px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 1.0625rem;
      }

      .name-row input:focus {
        outline: none;
      }

      .people {
        padding: 12px 14px;
      }

      .gone {
        color: var(--pv-text-secondary, #6B7280);
      }
    `,
  ];

  render() {
    if (this._rewardId !== null && this._chores?.board() && !this._reward) {
      return html`<p class="gone">This reward was removed on another screen.</p>`;
    }
    if (!this._loaded) return html`<div class="skeleton"></div>`;
    const d = this._record.draft;
    const isNew = this._rewardId === null;
    const earners = inOrder(this.household?.members ?? []).filter(m => m.stars);
    return html`
      <div class="top">
        <span class="big" aria-hidden="true">${d.icon || pictureFor(d.name || 'reward', '🎁')}</span>
        <div class="actions">
          <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
          <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this._saving || (!isNew && !rewardDirty(this._record))}
            @click=${this._save}>${isNew ? 'Add' : 'Save'}</button>
        </div>
      </div>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <div class="group">
        <label class="row name-row">
          <span class="row-sub" style="width: 56px">Name</span>
          <input type="text" maxlength="60" autocomplete="off" aria-label="Name" .value=${d.name}
            @input=${(e: Event) => this._change({ name: (e.target as HTMLInputElement).value })} />
        </label>
      </div>
      <h2 class="section-label">Picture</h2>
      <div class="group">
        <div class="pictures" role="group" aria-label="Picture">
          ${PICTURES.map(picture => html`
            <button type="button" aria-pressed=${d.icon === picture ? 'true' : 'false'} @click=${() => this._change({ icon: picture })}>${picture}</button>
          `)}
        </div>
      </div>
      <h2 class="section-label">Cost</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${d.cost}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${d.cost <= 1} @click=${() => this._change({ cost: nextCost(d.cost, false) })}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${d.cost >= 10_000} @click=${() => this._change({ cost: nextCost(d.cost, true) })}>+</button>
          </span>
        </div>
        <div class="row toggle-row">
          <span class="row-text">
            <span>Needs a parent's OK</span>
            <span class="row-sub">${d.needs_ok ? 'Redeeming waits for a parent, and the stars are taken then.' : 'Redeeming takes the stars at once.'}</span>
          </span>
          <div class="pv-toggle ${d.needs_ok ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${d.needs_ok ? 'true' : 'false'}
            aria-label="Needs a parent's OK" @click=${() => this._change({ needs_ok: !d.needs_ok })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._change({ needs_ok: !d.needs_ok }); } }}></div>
        </div>
      </div>
      <h2 class="section-label">Who can get it</h2>
      <div class="group">
        <div class="people chips" role="group" aria-label="Who can get it">
          <button class="chip chip--plain" type="button" aria-pressed=${d.who.length === 0 ? 'true' : 'false'}
            @click=${() => this._change({ who: [] })}>Everyone</button>
          ${earners.map(member => html`
            <button class="chip" type="button" aria-pressed=${d.who.includes(member.id) ? 'true' : 'false'}
              @click=${() => this._change({ who: d.who.includes(member.id) ? d.who.filter(id => id !== member.id) : [...d.who, member.id] })}>
              <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>${member.name}
            </button>
          `)}
        </div>
      </div>
      <p class="hint">${whoText(d.who, earners)}. People earn stars when Stars is on for them on their page.</p>
      ${this._reward ? html`<button class="destructive" type="button" @click=${() => { this._notice = 'delete'; }}>Delete ${this._reward.name}…</button>` : nothing}
      ${this._renderNotice()}
    `;
  }

  private _renderNotice() {
    if (this._notice === 'discard') {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Discard changes?"
          .actions=${[{ id: 'discard', label: 'Discard changes', kind: 'destructive' }, { id: 'keep', label: 'Keep editing', kind: 'secondary' }]}
          @pv-sheet-action=${this._onDiscard}></pv-notice-sheet>
      `;
    }
    if (this._notice === 'delete' && this._reward) {
      return html`
        <pv-notice-sheet .layout=${this.layout} heading="Delete ${this._reward.name}?"
          body="Rewards already given stay in everyone's history."
          .actions=${[{ id: 'delete', label: `Delete ${this._reward.name}`, kind: 'destructive' }, { id: 'cancel', label: 'Cancel', kind: 'secondary' }]}
          @pv-sheet-action=${this._onDelete}></pv-notice-sheet>
      `;
    }
    return nothing;
  }

  private _change(patch: Partial<RewardDraft>): void {
    this._record = { ...this._record, draft: { ...this._record.draft, ...patch } };
    this._problem = '';
    this.drafts.set(this._key, this._record);
  }

  private _pop(): void {
    this.dispatchEvent(new CustomEvent(POP_PAGE, { bubbles: true, composed: true }));
  }

  private _cancel(): void {
    if (rewardDirty(this._record)) this._notice = 'discard';
    else this._pop();
  }

  private async _save(): Promise<void> {
    const problem = rewardProblem(this._record.draft);
    if (problem) {
      this._problem = problem;
      return;
    }
    const chores = this._chores;
    if (!chores) return;
    this._saving = true;
    try {
      await chores.api.saveReward(rewardChanges(this._record.draft), this._rewardId ?? undefined);
      this.drafts.delete(this._key);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  }

  private _onDiscard(event: CustomEvent<{ id: string }>): void {
    event.stopPropagation();
    this._notice = null;
    const discard = event.detail.id === 'discard';
    if (discard) {
      this.drafts.delete(this._key);
      this._record = { ...this._record, draft: this._record.start };
    }
    if (this._leave) {
      const leave = this._leave;
      this._leave = undefined;
      leave(discard);
    } else if (discard) {
      this._pop();
    }
  }

  private async _onDelete(event: CustomEvent<{ id: string }>): Promise<void> {
    event.stopPropagation();
    this._notice = null;
    const reward = this._reward;
    if (event.detail.id !== 'delete' || !reward || !this._chores) return;
    try {
      await this._chores.api.deleteReward(reward.id);
      this.drafts.delete(this._key);
      this._record = { ...this._record, start: this._record.draft };
      this._pop();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't delete. Check the connection and try again.";
    }
  }
}

defineElement('pv-reward-editor', PvRewardEditor);
