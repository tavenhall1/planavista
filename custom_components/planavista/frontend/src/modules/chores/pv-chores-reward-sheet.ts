import { LitElement, html, css, nothing } from 'lit';
import { personChipStyles } from '../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles, formStyles } from '../../styles/shared';
import { sheetStyles } from '../../styles/sheet';
import { trapTab } from '../../core/focus';
import type { Layout } from '../../core/layout';
import type { Member } from '../../core/household';
import { SheetMotion } from '../../shell/sheet-motion';
import '../../core/pv-member-avatar';
import type { Reward } from './chores-types';
import { REWARD_PICTURES, RewardCard, RewardDraft, rewardDraft, rewardProblem } from './rewards-derive';
import { pictureOf } from './pv-chore-tile';
import { backdropTap } from '../../core/backdrop';
import { SheetLayer } from '../../core/sheet-layer';

/**
 * pv-chores-reward-sheet: one reward (spec 13.6, 14.5). Anyone sees who can
 * get it and can save up for it (their goal); a parent edits its picture,
 * name, cost, whether it needs an OK, and who can get it, or deletes it.
 * With no reward, it opens as Add a reward.
 *
 * @fires pv-reward-goal - { member, reward | null } "Save up for this" switched
 * @fires pv-reward-save - { draft } Save (or Add)
 * @fires pv-reward-delete - Delete was tapped
 * @fires pv-sheet-close - Cancel, Done, Escape, a tap outside, or a drag down
 */
export class PvChoresRewardSheet extends LitElement {
  /** Closes the sheet only after a press that began on the backdrop (core/backdrop). */
  private readonly _backdrop = backdropTap(() => void this.close());
  private readonly _layer = new SheetLayer(this);
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) card: RewardCard | null = null;
  @property({ attribute: false }) people: Member[] = [];
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) colorOf: (member: Member) => string = m => m.color;
  @property({ type: Boolean }) canEdit = false;
  @property({ type: Boolean }) busy = false;

  @state() private _editing = false;
  @state() private _draft: RewardDraft = rewardDraft();
  @state() private _problem: string | null = null;
  private _motion = new SheetMotion(this);
  private _detach: (() => void) | null = null;
  private _closing = false;
  private _started = false;

  static styles = [
    personChipStyles,
    formStyles,
    buttonStyles,
    sheetStyles,
    css`
      .icon {
        font-size: 44px;
        text-align: center;
      }

      .heading {
        margin-top: 4px;
      }

      .cost {
        text-align: center;
        color: var(--pv-star, #8A6A00);
        font-weight: 800;
        margin-bottom: 10px;
      }

      .person {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 52px;
        border-bottom: 1px solid var(--pv-border-subtle, #F1F1EE);
      }

      .person .words {
        flex: 1 1 auto;
      }

      .person .meta {
        color: var(--pv-text-secondary, #5F6670);
        font-size: 0.8125rem;
      }

      .toggle {
        min-height: 48px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-weight: 650;
        cursor: pointer;
      }

      .toggle[aria-pressed='true'] {
        border-color: var(--pv-accent, #5B5BD6);
        background: var(--pv-accent-tint, #EEEEFC);
        color: var(--pv-accent-tint-ink, #3B3BB0);
      }

      label.title,
      .title {
        display: block;
        margin: 12px 0 6px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      input[type='text'],
      input[type='number'] {
        box-sizing: border-box;
        width: 100%;
        min-height: 48px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
      }

      .pictures {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .pictures button {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 1px solid var(--pv-border, #E7E7E3);
        background: var(--pv-card-bg, #FFFFFF);
        font-size: 22px;
        cursor: pointer;
      }

      .pictures button[aria-pressed='true'] {
        border: 2px solid var(--pv-accent, #5B5BD6);
      }




      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
      }





      .problem {
        margin-top: 8px;
        color: var(--pv-bad-ink, #A12828);
        font-weight: 650;
      }

    `,
  ];

  protected willUpdate(): void {
    if (this._started) return;
    this._started = true;
    this._editing = !this.card;
    this._draft = rewardDraft(this.card?.reward);
  }

  firstUpdated(): void {
    const panel = this.renderRoot.querySelector<HTMLElement>('.panel')!;
    const backdrop = this.renderRoot.querySelector<HTMLElement>('.backdrop')!;
    this._motion.open(panel, backdrop);
    this._detach = this._motion.attachDrag(this.renderRoot.querySelector<HTMLElement>('.grab-zone')!, panel, () => void this.close());
    (this.renderRoot.querySelector<HTMLElement>('input') ?? this.renderRoot.querySelector<HTMLElement>('#reward-title'))?.focus();
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

  render() {
    return html`
      <div class="backdrop" @pointerdown=${this._backdrop.down} @click=${this._backdrop.click}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="reward-title" @keydown=${this._key}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._editing ? this._form() : this._view()}
      </div>
    `;
  }

  private _view() {
    const card = this.card;
    if (!card) return nothing;
    const reward = card.reward;
    return html`
      <div class="icon" aria-hidden="true">${pictureOf(reward.icon)}</div>
      <h2 class="heading" id="reward-title" tabindex="-1">${reward.name}</h2>
      <div class="cost">★ ${reward.cost}${reward.needs_ok ? ' · needs a parent\'s OK' : ''}</div>
      ${card.people.map(p => html`
        <div class="person">
          <pv-member-avatar .member=${{ ...p.member, color: this.colorOf(p.member) }} .hass=${this.hass} size="36"></pv-member-avatar>
          <div class="words">
            <div>${p.member.name}</div>
            <div class="meta">${p.asked ? 'Waiting for OK' : p.afford ? 'Has enough stars' : `${p.more} more to go`}</div>
          </div>
          <button class="toggle" type="button" aria-pressed=${p.member.goal === reward.id ? 'true' : 'false'}
            @click=${() => this._fire('pv-reward-goal', { member: p.member.id, reward: p.member.goal === reward.id ? null : reward.id })}>
            ${p.member.goal === reward.id ? 'Saving up for this' : 'Save up for this'}
          </button>
        </div>
      `)}
      ${card.people.length === 0 ? html`<p class="body">Nobody who earns stars can get this one yet.</p>` : nothing}
      <div class="actions">
        ${this.canEdit ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._editing = true; }}>Edit</button>` : nothing}
        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => void this.close()}>Done</button>
      </div>
    `;
  }

  private _set(changes: Partial<RewardDraft>): void {
    this._draft = { ...this._draft, ...changes };
    if (this._problem) this._problem = rewardProblem(this._draft);
  }

  private _form() {
    const d = this._draft;
    const editing = !!this.card;
    return html`
      <h2 class="heading" id="reward-title">${editing ? 'Edit reward' : 'New reward'}</h2>
      <span class="title">Picture</span>
      <div class="pictures">
        ${REWARD_PICTURES.map(p => html`<button type="button" aria-pressed=${d.icon === p ? 'true' : 'false'} aria-label=${p} @click=${() => this._set({ icon: p })}>${p}</button>`)}
      </div>
      <label class="title" for="reward-name">Name</label>
      <input id="reward-name" type="text" maxlength="60" placeholder="Movie night pick" .value=${d.name}
        @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })} />
      <label class="title" for="reward-cost">Cost in stars</label>
      <input id="reward-cost" type="number" min="1" max="10000" inputmode="numeric" .value=${String(d.cost)}
        @input=${(e: Event) => this._set({ cost: Math.round(Number((e.target as HTMLInputElement).value)) })} />
      <div class="row">
        <span>Needs a parent's OK</span>
        <button class="pv-toggle" type="button" role="switch" aria-checked=${d.needsOk ? 'true' : 'false'} aria-label="Needs a parent's OK"
          @click=${() => this._set({ needsOk: !d.needsOk })}></button>
      </div>
      <span class="title">Who can get it (nobody picked means everyone who earns stars)</span>
      <div class="pv-person-chips" role="group" aria-label="Who can get it">
        ${this.people.filter(p => p.stars).map(person => html`
          <button class="pv-person-chip" type="button" aria-pressed=${d.who.includes(person.id) ? 'true' : 'false'} style="--member:${this.colorOf(person)}"
            @click=${() => this._set({ who: d.who.includes(person.id) ? d.who.filter(id => id !== person.id) : [...d.who, person.id] })}>
            <pv-member-avatar .member=${{ ...person, color: this.colorOf(person) }} .hass=${this.hass} size="28"></pv-member-avatar>
            ${person.name}
          </button>
        `)}
      </div>
      ${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
      <div class="sheet-footer">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${() => (editing ? (this._editing = false) : void this.close())}>Cancel</button>
        <button class="pv-btn pv-btn-primary" type="button" ?disabled=${this.busy} @click=${this._save}>${this.busy ? 'Saving…' : editing ? 'Save' : 'Add'}</button>
      </div>
      ${editing ? html`
        <div class="sheet-delete">
          <button class="pv-btn pv-btn-secondary danger" type="button" @click=${() => this._fire('pv-reward-delete', {})}>Delete reward</button>
        </div>
      ` : nothing}
    `;
  }

  private _save = (): void => {
    this._problem = rewardProblem(this._draft);
    if (this._problem) return;
    this._fire('pv-reward-save', { draft: this._draft });
  };

  private _fire(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
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

defineElement('pv-chores-reward-sheet', PvChoresRewardSheet);

export type { Reward };
