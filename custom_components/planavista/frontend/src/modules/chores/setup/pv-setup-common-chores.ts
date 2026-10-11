import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { errorMessage } from '../../../core/ws-api';
import type { ChoresService } from '../chores-service';
import { durationText } from '../settings/chores-list-derive';
import { STEP_CHANGE } from '../../../core/settings-registry';
import { Pick, addLabel, pickActivity, pickLine, starterOf, suggestPicks } from './starter-chores';
import { PreviewPick } from './setup-derive';
import './pv-setup-board-preview';
import '../../../core/pv-member-avatar';

const MINUTES = [5, 10, 15, 30, 60, 90, 120];

/**
 * pv-setup-common-chores: Pick some to start with (spec 14.7). Twelve
 * starter tiles, each with a person, how often, and about how long,
 * suggested by age group; tapping a picked tile changes those. In landscape
 * the board fills in beside the tiles as they're picked. Each pick becomes a
 * normal chore.
 */
export class PvSetupCommonChores extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  @state() private _picks: Pick[] = [];
  @state() private _editing: string | null = null;
  @state() private _message = '';
  private _built = false;

  protected willUpdate(): void {
    if (!this._built && this.household) {
      this._picks = suggestPicks(this.household.members);
      this._built = true;
    }
  }

  get primaryLabel(): string {
    return addLabel(this._picks);
  }

  get ready(): boolean {
    return this._picks.some(p => p.on && p.member);
  }

  private _changed(): void {
    this.dispatchEvent(new CustomEvent(STEP_CHANGE, { bubbles: true, composed: true }));
  }

  /** Add the picked chores. */
  async commit(): Promise<boolean> {
    const chores = this.services?.chores as ChoresService | undefined;
    if (!chores) return false;
    this._message = '';
    const picked = this._picks.filter(p => p.on && p.member);
    try {
      for (const pick of picked) await chores.api.saveActivity(pickActivity(pick));
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't add the chores. Check the connection and try again.";
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    css`
      :host {
        display: block;
      }

      .layout {
        display: grid;
        gap: 18px;
      }

      :host([layout='landscape']) .layout {
        grid-template-columns: minmax(0, 1fr) minmax(280px, 380px);
        align-items: start;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .tile {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 4px;
        padding: 14px 8px 10px;
        border-radius: 14px;
        border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        text-align: center;
        cursor: pointer;
      }

      .tile[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 6%, var(--pv-card-bg, #FFFFFF));
      }

      .tile .check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.6875rem;
        background: var(--pv-accent, #6366F1);
        color: var(--pv-on-accent, #FFFFFF);
      }

      .emoji {
        font-size: 1.75rem;
      }

      .name {
        font-weight: 700;
        font-size: 0.875rem;
      }

      .line {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .editor {
        grid-column: 1 / -1;
        display: grid;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 4%, transparent);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .chip {
        min-height: 40px;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid var(--pv-border-subtle, #E5E7EB);
        background: var(--pv-card-bg, #FFFFFF);
        color: inherit;
        font: inherit;
        cursor: pointer;
      }

      .chip[aria-pressed='true'] {
        border-color: var(--pv-accent, #6366F1);
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, var(--pv-card-bg, #FFFFFF));
        font-weight: 600;
      }

      .hint {
        margin: 10px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .preview-head {
        margin: 0 0 8px;
        font-weight: 700;
      }

      .message {
        margin: 12px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  private _toggle(pick: Pick): void {
    if (!pick.member) {
      this._editing = pick.id;
      return;
    }
    if (pick.on && this._editing !== pick.id) {
      // Tapping a picked chore changes it (spec 14.7); its editor has Remove.
      this._editing = pick.id;
      return;
    }
    this._set(pick.id, { on: !pick.on });
    this._editing = null;
  }

  private _set(id: string, patch: Partial<Pick>): void {
    this._picks = this._picks.map(p => (p.id === id ? { ...p, ...patch } : p));
    this._changed();
  }

  render() {
    const members = inOrder(this.household?.members ?? []);
    const picks: PreviewPick[] = this._picks
      .filter(p => p.on && p.member)
      .map(p => ({ member: p.member!, name: starterOf(p.id).name, week: p.rhythm === 'weekly' && !p.days.length }));
    return html`
      <div class="layout">
        <div>
          <div class="tiles">
            ${this._picks.map(pick => {
              const starter = starterOf(pick.id);
              const who = members.find(m => m.id === pick.member);
              return html`
                <button class="tile" type="button" aria-pressed=${pick.on ? 'true' : 'false'} @click=${() => this._toggle(pick)}>
                  ${pick.on ? html`<span class="check" aria-hidden="true">✓</span>` : nothing}
                  <span class="emoji" aria-hidden="true">${starter.icon}</span>
                  <span class="name">${starter.name}</span>
                  <span class="line">${pickLine(pick)}</span>
                  ${who ? html`<pv-member-avatar .member=${who} .hass=${this.hass} size="22"></pv-member-avatar>` : html`<span class="line">Pick someone</span>`}
                </button>
                ${this._editing === pick.id ? this._renderEditor(pick) : nothing}
              `;
            })}
          </div>
          <p class="hint">Suggested by age, so young children get quick, simple ones.</p>
          ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
        </div>
        ${this.layout === 'landscape' ? html`
          <aside aria-label="Your board">
            <p class="preview-head">Your board fills in as you pick</p>
            <pv-setup-board-preview .hass=${this.hass} .household=${this.household} .services=${this.services}
              .revision=${this.revision} .picks=${picks}></pv-setup-board-preview>
          </aside>
        ` : nothing}
      </div>
    `;
  }

  private _renderEditor(pick: Pick) {
    const members = inOrder(this.household?.members ?? []);
    const starter = starterOf(pick.id);
    return html`
      <div class="editor" role="group" aria-label="Change ${starter.name}">
        <span>Who</span>
        <div class="chips">
          ${members.map(m => html`
            <button class="chip" type="button" aria-pressed=${pick.member === m.id ? 'true' : 'false'}
              @click=${() => this._set(pick.id, { member: m.id, on: true })}>${m.name}</button>
          `)}
        </div>
        <span>How often</span>
        <div class="chips">
          <button class="chip" type="button" aria-pressed=${pick.rhythm === 'daily' ? 'true' : 'false'}
            @click=${() => this._set(pick.id, { rhythm: 'daily', days: [] })}>Every day</button>
          <button class="chip" type="button" aria-pressed=${pick.rhythm === 'weekly' ? 'true' : 'false'}
            @click=${() => this._set(pick.id, { rhythm: 'weekly', days: starter.rhythm === 'weekly' ? starter.days : [] })}>Every week</button>
        </div>
        <span>About how long${pick.rhythm === 'weekly' && pick.days.length ? ', each time' : ''}</span>
        <div class="chips">
          ${MINUTES.map(minutes => html`
            <button class="chip" type="button" aria-pressed=${pick.minutes === minutes ? 'true' : 'false'}
              @click=${() => this._set(pick.id, { minutes })}>${durationText(minutes)}</button>
          `)}
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          ${pick.on ? html`<button class="pv-btn pv-btn-secondary" type="button" @click=${() => { this._set(pick.id, { on: false }); this._editing = null; }}>Remove</button>` : nothing}
          <button class="pv-btn pv-btn-primary" type="button" @click=${() => { this._editing = null; }}>Done</button>
        </div>
      </div>
    `;
  }
}

defineElement('pv-setup-common-chores', PvSetupCommonChores);
