import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import '../../../core/pv-time-field';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import { HouseholdView, Member, inOrder } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import type { ModuleService } from '../../../core/module-registry';
import { PAGE_ERROR } from '../../../core/page-host';
import { errorMessage } from '../../../core/ws-api';
import type { PlanaVistaData } from '../../../types';
import type { ChoresService } from '../chores-service';
import { clockText } from './chores-list-derive';
import { ReminderRow, namesText, notifyOf, phoneName, reminderRows, requestRows } from './reminders-derive';
import { eveningChoices } from './rules-derive';
import { choresSettingsStyles } from './settings-styles';
import '../../../core/pv-member-avatar';
import { HelpState, helpBox, helpLabel, helpStyles } from '../../../core/help';

/**
 * pv-reminders-page: reminders (spec 14.5, 9.9, 10.5): the evening check on
 * the screen, phone reminders per person, and which parents' phones get
 * Approval requests. They apply as the parent taps.
 */
export class PvRemindersPage extends LitElement {
  /** Which settings' explainers are open (0.12.0, core/help.ts). */
  private readonly _help = new HelpState(this);
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _evening: string | null | undefined = undefined;

  static styles = [
    helpStyles,
    baseStyles,
    buttonStyles,
    formStyles,
    choresSettingsStyles,
    css`
      :host {
        max-width: 640px;
      }

      .row .pv-select {
        max-width: 160px;
        margin-left: auto;
      }

      button.row .row-sub {
        white-space: normal;
      }
    `,
  ];

  private get _chores(): ChoresService | undefined {
    return this.services?.chores as ChoresService | undefined;
  }

  render() {
    const board = this._chores?.board();
    if (!board) return html`<div class="skeleton"></div><div class="skeleton"></div>`;
    const members = inOrder(this.household?.members ?? []);
    const timeFormat = this.data?.display?.time_format ?? '12h';
    const evening = this._evening !== undefined ? this._evening : board.settings.evening_check;
    const at = evening ? clockText(evening, timeFormat) : null;
    const reminders = reminderRows(members);
    const requests = requestRows(members);
    return html`
      <h2 class="section-label">${helpLabel(this._help, 'reminders_evening', 'Evening check')}</h2>${helpBox(this._help, 'reminders_evening')}
      <div class="group">
        <div class="row toggle-row">
          <span class="row-text">Evening check on the screen</span>
          ${this._switch(!!evening, 'Evening check on the screen', () => this._saveEvening(evening ? null : '19:00'))}
        </div>
        ${evening ? html`
          <label class="row">
            <span class="row-text">At</span>
            <pv-time-field .value=${evening} .format=${timeFormat === '24h' ? '24h' : '12h'}
              .slots=${eveningChoices(evening, timeFormat).map(c => c.value)}
              @change=${(e: Event) => this._saveEvening((e.target as HTMLSelectElement).value)}></pv-time-field>
          </label>
        ` : nothing}
      </div>
      <p class="hint">${at
        ? `At ${at}, the board says who still has chores, like "Casey has 2 chores left", and their column pulses once.`
        : 'Turn it on to have the board say who still has chores in the evening.'}</p>

      <h2 class="section-label">${helpLabel(this._help, 'reminders_phones', 'Phone reminders')}</h2>${helpBox(this._help, 'reminders_phones')}
      ${reminders.rows.length ? html`
        <div class="group">${reminders.rows.map(row => this._phoneRow(row, at
          ? `At ${at}, only if chores are left`
          : 'Turn on the evening check to send reminders', 'reminders', !!at))}</div>
      ` : nothing}
      ${reminders.noPhone.length ? html`
        <p class="hint">No phone yet for ${namesText(reminders.noPhone)}. Add one on their page in People.</p>
      ` : nothing}
      ${!reminders.rows.length && !reminders.noPhone.length ? html`
        <p class="hint">Phones are set on each person's page, for people linked to a Home Assistant person.</p>
      ` : nothing}

      <h2 class="section-label">${helpLabel(this._help, 'reminders_requests', 'Approval requests')}</h2>${helpBox(this._help, 'reminders_requests')}
      ${requests.rows.length ? html`
        <div class="group">${requests.rows.map(row => this._phoneRow(row, 'Requests come with Looks good and Send back buttons', 'requests', true))}</div>
      ` : nothing}
      ${requests.noPhone.length ? html`
        <p class="hint">No phone yet for ${namesText(requests.noPhone)}. Add one on their page in People.</p>
      ` : nothing}
      <p class="hint">Without a phone, requests wait under To approve on the screen${board.settings.auto_approve === 'day_end' ? ', and anything still waiting is approved at the end of the day' : ''}.</p>
    `;
  }

  private _switch(on: boolean, label: string, set: () => void, disabled = false) {
    return html`
      <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex=${disabled ? '-1' : '0'}
        aria-checked=${on ? 'true' : 'false'} aria-disabled=${disabled ? 'true' : 'false'} aria-label=${label}
        style=${disabled ? 'opacity: 0.45; pointer-events: none' : ''}
        @click=${set}
        @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
    `;
  }

  private _phoneRow(row: ReminderRow, sub: string, kind: 'reminders' | 'requests', enabled: boolean) {
    const label = `${row.member.name}: ${kind === 'reminders' ? 'reminders' : 'requests'} on ${row.phones.map(p => phoneName(p)).join(', ')}`;
    return html`
      <div class="row toggle-row">
        <pv-member-avatar .member=${row.member} .hass=${this.hass} size="36"></pv-member-avatar>
        <span class="row-text">
          <span class="row-title">${row.member.name} · ${row.phones.map(p => phoneName(p)).join(', ')}</span>
          <span class="row-sub">${sub}</span>
        </span>
        ${this._switch(row.on && enabled, label, () => this._saveNotify(row.member, kind, !row.on), !enabled)}
      </div>
    `;
  }

  private _error(err: unknown): void {
    this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: errorMessage(err) ?? "Couldn't save. Check the connection and try again." },
      bubbles: true, composed: true,
    }));
  }

  private async _saveEvening(at: string | null): Promise<void> {
    const chores = this._chores;
    if (!chores) return;
    this._evening = at;
    try {
      await chores.api.saveSettings({ evening_check: at });
    } catch (err) {
      this._error(err);
    } finally {
      this._evening = undefined;
    }
  }

  private async _saveNotify(member: Member, kind: 'reminders' | 'requests', on: boolean): Promise<void> {
    try {
      await this.api.saveMember({ notify: { ...notifyOf(member), [kind]: on } }, { id: member.id });
    } catch (err) {
      this._error(err);
    }
  }
}

defineElement('pv-reminders-page', PvRemindersPage);
