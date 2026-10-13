import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../../styles/shared';
import type { HouseholdView, Member } from '../../../core/household';
import type { ModuleService } from '../../../core/module-registry';
import type { PersonDraft } from '../../../core/person-draft';
import { PERSON_CHANGE } from '../../../core/settings-registry';
import { copyText } from '../../../core/clipboard';
import type { ChoresService } from '../chores-service';
import { clockText } from './chores-list-derive';
import { memberEntities } from './entities';
import { phoneChoices } from './person-derive';
import { choresSettingsStyles } from './settings-styles';
import type { PlanaVistaData } from '../../../types';

const MAX_PHONES = 5;

/**
 * pv-person-phones: a person's phones (spec 14.2, 10.5): which phones get
 * the evening reminder, and for a parent, Approval requests with
 * buttons; then Use in automations, the person's entity ids.
 */
export class PvPersonPhones extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) member: Member | null = null;
  @property({ attribute: false }) draft!: PersonDraft;
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _copied = false;

  static styles = [
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
        margin: 0 0 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      .legend + .group {
        margin-bottom: 0;
      }

      .space {
        margin-top: 22px;
      }

      .phones {
        padding: 12px 14px;
      }

      .suggested {
        font-size: 0.75rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      code {
        font-size: 0.8125rem;
        overflow-wrap: anywhere;
      }

      .copy {
        min-height: 48px;
        margin-left: auto;
      }

      a {
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
      }
    `,
  ];

  private _change(patch: Partial<PersonDraft>): void {
    this.dispatchEvent(new CustomEvent(PERSON_CHANGE, { detail: patch, bubbles: true, composed: true }));
  }

  private _togglePhone(service: string): void {
    const phones = this.draft.phones.includes(service)
      ? this.draft.phones.filter(p => p !== service)
      : [...this.draft.phones, service].slice(0, MAX_PHONES);
    this._change({ phones });
  }

  render() {
    const d = this.draft;
    if (!d) return nothing;
    const choices = phoneChoices(this.hass as never, { person: d.person, phones: d.phones });
    const board = (this.services?.chores as ChoresService | undefined)?.board();
    const evening = board?.settings.evening_check ?? null;
    const timeFormat = this.data?.display?.time_format ?? '12h';
    return html`
      <span class="legend">Phones</span>
      <div class="group">
        ${choices.length ? html`
          <div class="phones chips" role="group" aria-label="Phones">
            ${choices.map(choice => html`
              <button class="chip chip--plain" type="button" aria-pressed=${d.phones.includes(choice.service) ? 'true' : 'false'}
                @click=${() => this._togglePhone(choice.service)}>
                ${choice.label}${choice.suggested ? html` <span class="suggested">· theirs</span>` : nothing}
              </button>
            `)}
          </div>
        ` : html`
          <div class="row"><span class="row-sub">No phones with the Home Assistant app yet. Install the Companion app on a phone, and it shows up here.</span></div>
        `}
        ${d.phones.length ? html`
          ${this._toggle(d.notify.reminders, 'Evening reminders',
            evening ? `At ${clockText(evening, timeFormat)}, only if chores are left` : 'Turn on the evening check in Reminders',
            () => this._change({ notify: { ...d.notify, reminders: !d.notify.reminders } }))}
          ${d.parent ? this._toggle(d.notify.requests, 'Approval requests', 'With Looks good and Send back buttons',
            () => this._change({ notify: { ...d.notify, requests: !d.notify.requests } })) : nothing}
        ` : nothing}
      </div>
      ${this.member ? this._renderAutomations(this.member) : nothing}
    `;
  }

  private _toggle(on: boolean, label: string, sub: string, set: () => void) {
    return html`
      <div class="row toggle-row">
        <span class="row-text"><span>${label}</span><span class="row-sub">${sub}</span></span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-label=${label} @click=${set}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } }}></div>
      </div>
    `;
  }

  private _renderAutomations(member: Member) {
    const devices = (this.hass as unknown as { devices?: Record<string, { name?: string; model?: string }> })?.devices ?? {};
    const device = Object.entries(devices).find(([, d]) => d.name === member.name && d.model === 'Household member')?.[0];
    return html`
      <span class="legend space">Use in automations</span>
      <div class="group">
        <div class="row">
          <span class="row-text">ID<code>${member.id}</code></span>
          <button class="pv-btn pv-btn-secondary copy" type="button" @click=${() => this._copy(member.id)}>${this._copied ? 'Copied' : 'Copy'}</button>
        </div>
        ${memberEntities(this.hass?.states as never, member).map(entity => html`
          <div class="row">
            <span class="row-text">${entity.label}<code>${entity.entity_id}</code></span>
          </div>
        `)}
      </div>
      <p class="hint">
        These names stay the same even if ${member.name} is renamed.
        ${device ? html`<a href="/config/devices/device/${device}" target="_top">Open ${member.name} in Home Assistant ↗</a>` : nothing}
      </p>
    `;
  }

  private async _copy(text: string): Promise<void> {
    this._copied = await copyText(text);
    window.setTimeout(() => { this._copied = false; }, 2000);
  }
}

defineElement('pv-person-phones', PvPersonPhones);
