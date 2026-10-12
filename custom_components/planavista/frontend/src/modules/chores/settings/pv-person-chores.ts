import { LitElement, html, css, nothing } from 'lit';
import { segmentedStyles } from '../../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { AGE_GROUP_LABELS, AwayRange, HouseholdView, Member } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PUSH_PAGE } from '../../../core/page-host';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import type { ChoresService } from '../chores-service';
import { awayText, goalChoices } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

const NEEDS_OK: Array<[string, string]> = [['all', 'Every chore'], ['marked', 'Marked chores'], ['none', 'No chores']];
const MY_DAY: Array<[string, string]> = [['timeline', 'Timeline'], ['list', 'List'], ['pictures', 'Pictures']];

/**
 * pv-person-chores: a person's chores rows (spec 14.2): Needs an OK for, My
 * day, Stars (with the history and give or take), Saving up for, and Away.
 * Changes go into the person page's draft and are saved with it.
 */
export class PvPersonChores extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) member: Member | null = null;
  @property({ attribute: false }) draft!: PersonDraft;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String }) layout: Layout = 'landscape';

  @state() private _adding: AwayRange | null = null;

  static styles = [
    segmentedStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        margin: 0 0 22px;
      }

      .legend {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .stack {
        display: grid;
        gap: 8px;
        width: 100%;
      }

      .row .pv-select {
        max-width: 240px;
        margin-left: auto;
      }

      .away-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        width: 100%;
      }

      .remove {
        min-height: 40px;
        margin-left: auto;
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    const stars = this.member && board ? board.members[this.member.id]?.stars ?? 0 : null;
    const goals = goalChoices(board?.rewards ?? [], this.member?.id ?? '');
    return html`
      <span class="legend">Chores</span>
      <div class="group">
        ${d.parent ? html`
          <div class="row">
            <span class="row-text">Needs an OK for<span class="row-sub">Never: a parent's check-offs count right away.</span></span>
          </div>
        ` : html`
          <div class="row">
            <div class="stack">
              <span>Needs an OK for</span>
              <div class="pv-seg stretch" role="group" aria-label="Needs an OK for">
                ${NEEDS_OK.map(([id, label]) => html`
                  <button type="button" aria-pressed=${d.needs_ok_for === id ? 'true' : 'false'}
                    @click=${() => this._change({ needs_ok_for: id })}>${label}</button>
                `)}
              </div>
            </div>
          </div>
        `}
        <div class="row">
          <div class="stack">
            <span>My day</span>
            <div class="pv-seg stretch" role="group" aria-label="My day">
              ${MY_DAY.map(([id, label]) => html`
                <button type="button" aria-pressed=${d.my_day === id ? 'true' : 'false'}
                  @click=${() => this._change({ my_day: id })}>${label}</button>
              `)}
            </div>
          </div>
        </div>
        <div class="row toggle-row">
          <span class="row-text">Earns stars</span>
          <div class="pv-toggle ${d.stars ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${d.stars ? 'true' : 'false'}
            aria-label="Earns stars" @click=${() => this._change({ stars: !d.stars })}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._change({ stars: !d.stars }); } }}></div>
        </div>
        ${this.member && stars !== null ? html`
          <button class="row" type="button" @click=${this._openStars}>
            <span class="row-text">Stars<span class="row-sub">History, and give or take stars with a reason</span></span>
            <span class="stars">★ ${stars}</span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        ` : nothing}
        ${d.stars ? html`
          <label class="row">
            <span class="row-text">Saving up for</span>
            <select class="pv-input pv-select" .value=${d.goal ?? ''}
              @change=${(e: Event) => this._change({ goal: (e.target as HTMLSelectElement).value || null })}>
              <option value="" ?selected=${!d.goal}>Nothing yet</option>
              ${goals.map(r => html`<option value=${r.id} ?selected=${d.goal === r.id}>${r.icon ? `${r.icon} ` : ''}${r.name}</option>`)}
            </select>
          </label>
        ` : nothing}
        ${this._renderAway(d)}
      </div>
      <p class="hint">These start from the ${AGE_GROUP_LABELS[d.age_group].toLocaleLowerCase()} defaults.</p>
    `;
  }

  private _renderAway(d: PersonDraft) {
    return html`
      <div class="row">
        <span class="row-text">Away<span class="row-sub">Pause chores for a few days. Nothing is due or missed, and streaks hold.</span></span>
        ${!this._adding ? html`
          <button class="pv-btn pv-btn-secondary remove" type="button"
            @click=${() => { this._adding = { from: '', to: '', note: '' }; }}>Add a time away</button>
        ` : nothing}
      </div>
      ${d.away.map((span, index) => html`
        <div class="row">
          <span class="row-text">${awayText(span)}</span>
          <button class="pv-btn pv-btn-secondary remove" type="button" aria-label="Remove ${awayText(span)}"
            @click=${() => this._change({ away: d.away.filter((_, i) => i !== index) })}>Remove</button>
        </div>
      `)}
      ${this._adding ? html`
        <div class="row">
          <div class="stack">
            <div class="away-form">
              <label>From <input class="pv-input" type="date" .value=${this._adding.from}
                @change=${(e: Event) => { this._adding = { ...this._adding!, from: (e.target as HTMLInputElement).value }; }} /></label>
              <label>To <input class="pv-input" type="date" .value=${this._adding.to} min=${this._adding.from}
                @change=${(e: Event) => { this._adding = { ...this._adding!, to: (e.target as HTMLInputElement).value }; }} /></label>
              <label>Note <input class="pv-input" type="text" maxlength="60" placeholder="At Grandma's" .value=${this._adding.note ?? ''}
                @input=${(e: Event) => { this._adding = { ...this._adding!, note: (e.target as HTMLInputElement).value }; }} /></label>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end">
              <button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._adding = null; }}>Cancel</button>
              <button class="pv-btn pv-btn-primary" type="button"
                ?disabled=${!this._adding.from || !this._adding.to || this._adding.to < this._adding.from}
                @click=${this._addAway}>Add</button>
            </div>
          </div>
        </div>
      ` : nothing}
    `;
  }

  private _addAway = (): void => {
    const span = this._adding;
    if (!span) return;
    const note = span.note?.trim() || null;
    const away = [...this.draft.away, { from: span.from, to: span.to, note }].sort((a, b) => a.from.localeCompare(b.from));
    this._change({ away });
    this._adding = null;
  };

  private _openStars = (): void => {
    if (!this.member) return;
    this.dispatchEvent(new CustomEvent(PUSH_PAGE, {
      detail: { tag: 'pv-person-stars', title: `${this.member.name}'s stars`, back: this.member.name, props: { memberId: this.member.id } },
      bubbles: true, composed: true,
    }));
  };
}

defineElement('pv-person-chores', PvPersonChores);
