import { LitElement, html, css, nothing } from 'lit';
import { segmentedStyles } from '../../../styles/controls';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { StarEntry, starLine } from './person-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-person-stars: someone's stars (spec 14.2, 8.15): the balance, give or
 * take stars with a reason, and the history of what each change was for.
 */
export class PvPersonStars extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) pageProps: Record<string, unknown> = {};
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _history: StarEntry[] | null = null;
  @state() private _balance = 0;
  @state() private _give = true;
  @state() private _amount = 5;
  @state() private _reason = '';
  @state() private _problem = '';
  @state() private _saving = false;

  private get _memberId(): string {
    return String(this.pageProps.memberId ?? '');
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this._load();
  }

  private async _load(): Promise<void> {
    try {
      const result = await this._chores?.api.starHistory(this._memberId);
      if (result) {
        this._history = result.history;
        this._balance = result.balance;
      }
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't load the history. Check the connection and try again.";
      this._history = [];
    }
  }

  static styles = [
    segmentedStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .balance {
        margin: 0 0 18px;
        font-family: var(--pv-font-heading, ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', system-ui, sans-serif);
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--pv-star-ink, #8A6A00);
      }

      .reason {
        width: 100%;
      }

      .amount {
        font-weight: 700;
        min-width: 48px;
      }

      .plus {
        color: var(--pv-success-ink, #2F7D4F);
      }

      .when {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.8125rem;
        white-space: nowrap;
      }
    `,
  ];

  render() {
    const members = this.household?.members ?? [];
    const names = Object.fromEntries(members.map(m => [m.id, m.name]));
    const balance = this._chores?.board()?.members[this._memberId]?.stars ?? this._balance;
    return html`
      <p class="balance" aria-label="${balance} stars">★ ${balance}</p>
      ${this._problem ? html`<p class="problem" role="alert">${this._problem}</p>` : nothing}
      <h2 class="section-label">Give or take</h2>
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Give or take">
            <button type="button" aria-pressed=${this._give ? 'true' : 'false'} @click=${() => { this._give = true; }}>Give</button>
            <button type="button" aria-pressed=${!this._give ? 'true' : 'false'} @click=${() => { this._give = false; }}>Take</button>
          </div>
        </div>
        <div class="row">
          <span class="row-text">Stars</span>
          <span class="stepper">
            <output>★ ${this._amount}</output>
            <button type="button" aria-label="Fewer stars" ?disabled=${this._amount <= 1} @click=${() => { this._amount -= 1; }}>−</button>
            <button type="button" aria-label="More stars" ?disabled=${this._amount >= 100} @click=${() => { this._amount += 1; }}>+</button>
          </span>
        </div>
        <div class="row">
          <input class="pv-input reason" type="text" maxlength="60" placeholder="Why? Like: Helped a neighbor" aria-label="Reason"
            .value=${this._reason} @input=${(e: Event) => { this._reason = (e.target as HTMLInputElement).value; this._problem = ''; }} />
        </div>
        <div class="row">
          <button class="pv-btn pv-btn-primary" type="button" style="margin-left: auto" ?disabled=${this._saving} @click=${this._award}>
            ${this._give ? `Give ★ ${this._amount}` : `Take ★ ${this._amount}`}
          </button>
        </div>
      </div>
      <h2 class="section-label">History</h2>
      ${this._history === null ? html`<div class="skeleton"></div><div class="skeleton"></div>` : this._history.length ? html`
        <ul class="group">
          ${this._history.map(entry => {
            const line = starLine(entry, names);
            return html`
              <li class="row">
                <span class="amount ${entry.delta > 0 ? 'plus' : ''}">${line.amount}</span>
                <span class="row-text">${line.what}</span>
                <span class="when">${new Date(entry.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </li>
            `;
          })}
        </ul>
      ` : html`<p class="empty">No stars yet.</p>`}
    `;
  }

  private _award = async (): Promise<void> => {
    const reason = this._reason.trim();
    if (!reason) {
      this._problem = 'Add a reason.';
      return;
    }
    const chores = this._chores;
    if (!chores) return;
    this._saving = true;
    try {
      const result = await chores.api.awardStars(this._memberId, this._give ? this._amount : -this._amount, reason);
      this._balance = result.balance;
      this._reason = '';
      await this._load();
    } catch (err) {
      this._problem = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
    } finally {
      this._saving = false;
    }
  };
}

defineElement('pv-person-stars', PvPersonStars);
