import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../../../utils/define';
import type { HouseholdView } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { ModuleService } from '../../../core/module-registry';
import type { SetupPatch } from '../../../core/settings-registry';
import { errorMessage } from '../../../core/ws-api';
import type { ChoresService } from '../chores-service';

type Start = 'plan' | 'common' | 'empty';

const CHOICES: Array<{ id: Start; icon: string; title: string; text: string }> = [
  { id: 'plan', icon: '📋', title: 'Start from our household plan', text: "Import a Household Hours plan. You see everything before it's saved." },
  { id: 'common', icon: '✨', title: 'Start with some common chores', text: 'Pick from a short list. Each comes with a time and who it suits.' },
  { id: 'empty', icon: '✏️', title: 'Start empty', text: "Add chores yourself when you're ready." },
];

/**
 * pv-setup-chores-choice: Do you want chores too? (spec 14.7). A plan, some
 * common chores, or empty turns chores on; Not now, just the calendar goes
 * straight to Look and leaves chores off.
 */
export class PvSetupChoresChoice extends LitElement {
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};

  @state() private _choice: Start = 'common';
  @state() private _message = '';
  private _read = false;
  setupPatch?: SetupPatch;

  protected willUpdate(): void {
    if (!this._read && this.household) {
      const saved = this.household.setup.start;
      if (saved === 'plan' || saved === 'common' || saved === 'empty') this._choice = saved;
      this._read = true;
    }
  }

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  private get _on(): boolean {
    return (this.household?.modules as { chores?: { enabled?: boolean } } | undefined)?.chores?.enabled === true;
  }

  /** Continue: chores on, and how they start. */
  async commit(): Promise<boolean> {
    this._message = '';
    try {
      if (!this._on) await this._chores?.api.enable(true);
      await this.api.saveSetup({ start: this._choice });
      this.setupPatch = { setup: { start: this._choice }, modules: { chores: { enabled: true } } };
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't turn chores on. Check the connection and try again.";
      return false;
    }
  }

  /** Not now, just the calendar: chores stay off (or go off again, keeping anything already made). */
  async secondary(): Promise<boolean> {
    this._message = '';
    try {
      if (this._on) await this._chores?.api.enable(false);
      await this.api.saveSetup({ start: 'calendar' });
      this.setupPatch = { setup: { start: 'calendar' }, modules: { chores: { enabled: false } } };
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
      return false;
    }
  }

  static styles = css`
    :host {
      display: block;
    }

    .choices {
      display: grid;
      gap: 10px;
    }

    .choice {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1.5px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .choice[aria-checked='true'] {
      border-color: var(--pv-accent, #6366F1);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--pv-accent, #6366F1) 25%, transparent);
    }

    .icon {
      font-size: 1.5rem;
    }

    .text {
      flex: 1;
    }

    .title {
      display: block;
      font-weight: 700;
    }

    .sub {
      font-size: 0.875rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    .radio {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--pv-border-strong, #9CA3AF);
      display: grid;
      place-items: center;
      color: var(--pv-on-accent, #FFFFFF);
      font-size: 0.75rem;
    }

    .choice[aria-checked='true'] .radio {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
    }

    .message {
      margin: 14px 0 0;
      color: var(--pv-danger, #DC2626);
    }
  `;

  render() {
    return html`
      <div class="choices" role="radiogroup" aria-label="How chores start">
        ${CHOICES.map(choice => html`
          <button class="choice" type="button" role="radio" aria-checked=${this._choice === choice.id ? 'true' : 'false'}
            @click=${() => { this._choice = choice.id; }}>
            <span class="icon" aria-hidden="true">${choice.icon}</span>
            <span class="text"><span class="title">${choice.title}</span><span class="sub">${choice.text}</span></span>
            <span class="radio" aria-hidden="true">${this._choice === choice.id ? '✓' : ''}</span>
          </button>
        `)}
      </div>
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-chores-choice', PvSetupChoresChoice);
