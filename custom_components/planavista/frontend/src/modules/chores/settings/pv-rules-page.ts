import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView } from '../../../core/household';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import type { ChoresSettings } from '../chores-types';
import { POLICIES, dayStartChoices, nextMinutesPerStar } from './rules-derive';
import { choresSettingsStyles } from './settings-styles';

/**
 * pv-rules-page: the house rules (spec 14.5): what happens to a missed
 * chore, when the chore day starts, approving at the end of the day, stars
 * per minutes, and sound. They apply as the parent taps.
 */
export class PvRulesPage extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  /** A change on its way, shown until the board has it. */
  @state() private _pending: Partial<ChoresSettings> = {};

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .radio {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
      }

      .radio input {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        accent-color: var(--pv-accent, #6366F1);
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const settings = { ...board.settings, ...this._pending };
    const timeFormat = this.data?.display?.time_format ?? '12h';
    const firstDay = this.data?.display?.first_day === 'sunday' ? 'Sunday' : 'Monday';
    return html`
      <h2 class="section-label">If a chore is missed</h2>
      <div class="group" role="radiogroup" aria-label="If a chore is missed">
        ${POLICIES.map(policy => html`
          <label class="row radio">
            <input type="radio" name="missed" .checked=${settings.missed === policy.id}
              @change=${() => this._save({ missed: policy.id })} />
            <span class="row-text">
              <span class="row-title">${policy.label}</span>
              <span class="row-sub">${policy.description}</span>
            </span>
          </label>
        `)}
      </div>
      <p class="hint">A change starts with the next chore day. A parent can excuse a sick day under any rule.</p>

      <h2 class="section-label">Days and weeks</h2>
      <div class="group">
        <label class="row">
          <span class="row-text">A chore day starts at</span>
          <select class="pv-input pv-select" .value=${settings.day_starts}
            @change=${(e: Event) => this._save({ day_starts: (e.target as HTMLSelectElement).value })}>
            ${dayStartChoices(timeFormat).map(c => html`<option value=${c.value} ?selected=${settings.day_starts === c.value}>${c.label}</option>`)}
          </select>
        </label>
        <div class="row">
          <span class="row-text">Weeks start on</span>
          <span class="row-value">${firstDay}</span>
        </div>
      </div>
      <p class="hint">Late-night check-offs count for the day before. Weeks follow the calendar's setting in Calendar options.</p>

      <h2 class="section-label">Waiting for OK</h2>
      <div class="group">
        ${this._toggle(settings.auto_approve === 'day_end', 'Approve at the end of the day',
          () => this._save({ auto_approve: settings.auto_approve === 'day_end' ? 'never' : 'day_end' }))}
      </div>
      <p class="hint">Anything still waiting when the chore day ends is approved. On time means when it was done, not when it was approved.</p>

      <h2 class="section-label">Stars</h2>
      <div class="group">
        <div class="row">
          <span class="row-text">1 star for every</span>
          <span class="stepper">
            <output>${settings.minutes_per_star} min</output>
            <button type="button" aria-label="Fewer minutes per star" ?disabled=${settings.minutes_per_star <= 5}
              @click=${() => this._save({ minutes_per_star: nextMinutesPerStar(settings.minutes_per_star, false) })}>−</button>
            <button type="button" aria-label="More minutes per star" ?disabled=${settings.minutes_per_star >= 240}
              @click=${() => this._save({ minutes_per_star: nextMinutesPerStar(settings.minutes_per_star, true) })}>+</button>
          </span>
        </div>
      </div>
      <p class="hint">A chore can set its own stars instead. A change applies to stars earned from then on.</p>

      <h2 class="section-label">Sound</h2>
      <div class="group">
        ${this._toggle(settings.sound, 'Play a sound when a chore is done', () => this._save({ sound: !settings.sound }))}
      </div>
    `;
  }

  private _toggle(on: boolean, label: string, set: () => void) {
    return html`
      <div class="row toggle-row">
        <span class="row-text">${label}</span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  /** Rules apply as the parent taps (spec 14.1). */
  private async _save(changes: Partial<ChoresSettings>): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._pending = { ...this._pending, ...changes };
    try {
      await chores.api.saveSettings(changes);
    } catch (err) {
      this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
        detail: { message: errorMessage(err) ?? "Couldn't save. Check the connection and try again." },
        bubbles: true, composed: true,
      }));
    } finally {
      const pending = { ...this._pending };
      for (const key of Object.keys(changes) as Array<keyof ChoresSettings>) delete pending[key];
      this._pending = pending;
    }
  }
}

defineElement('pv-rules-page', PvRulesPage);
