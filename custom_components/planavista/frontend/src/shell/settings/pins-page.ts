import { html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { segmentedStyles } from '../../styles/controls';
import { HouseholdView, inOrder } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { PlanaVistaData } from '../../types';
import type { Session } from '../../core/session';
import { helpBox, helpLabel, helpStyles } from '../../core/help';
import { SettingRowsPage } from './setting-rows';
import '../../core/pv-member-avatar';
import './pin-actions';

/**
 * pv-settings-pins: PINs and parent mode (spec 14.5). Everyone's PIN, Shuffle
 * the keypad, and how long a PIN's session lasts (milestone 8, D3: like a
 * phone's Auto-Lock, with no Never). Shared screens, kiosk mode, and the
 * screensaver have their own page since 0.12.0 (screens-page.ts).
 */
const IDLE_CHOICES = [
  { value: 30, label: '30 sec', spoken: '30 seconds' },
  { value: 60, label: '1 min', spoken: '1 minute' },
  { value: 120, label: '2 min', spoken: '2 minutes' },
  { value: 300, label: '5 min', spoken: '5 minutes' },
] as const;
const CAP_CHOICES = [
  { value: 5, label: '5 min', spoken: '5 minutes' },
  { value: 10, label: '10 min', spoken: '10 minutes' },
  { value: 15, label: '15 min', spoken: '15 minutes' },
  { value: 30, label: '30 min', spoken: '30 minutes' },
] as const;

export class PvSettingsPins extends SettingRowsPage {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';
  @property({ attribute: false }) session: Session | null = null;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
    segmentedStyles,
    helpStyles,
    css`
      :host {
        display: block;
        max-width: 640px;
      }

      section {
        margin: 0 0 28px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #5F6670);
      }

      h2 .pv-name-line .label {
        font-weight: inherit;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
      }

      .label {
        font-weight: 600;
      }

      .message {
        margin: 8px 0 0;
        color: var(--pv-danger, #DC2626);
      }

      .person {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .person .name {
        width: 120px;
        flex-shrink: 0;
        font-weight: 600;
      }

      .person pv-pin-actions {
        flex: 1;
        min-width: 0;
      }

      .choice-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
        min-height: 48px;
        margin-top: 16px;
      }

      .choice-row:first-of-type {
        margin-top: 0;
      }
    `,
  ];

  render() {
    const household = this.household;
    if (!household) return nothing;
    const sharedScreens = household.security.shared_screens > 0;
    return html`
      <section>
        <h2>${helpLabel(this._help, 'pins', 'PINs', 'pins-label')}</h2>
        ${helpBox(this._help, 'pins')}
        ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
        ${inOrder(household.members).map(member => html`
          <div class="person">
            <pv-member-avatar .member=${member} .hass=${this.hass} size="32"></pv-member-avatar>
            <span class="name">${member.name}</span>
            <pv-pin-actions
              .hass=${this.hass}
              .api=${this.api}
              .layout=${this.layout}
              .member=${member}
              .shuffle=${household.security.shuffle_keypad}
              .sharedScreens=${sharedScreens}
            ></pv-pin-actions>
          </div>
        `)}
      </section>

      <section>
        ${this._switch('Shuffle the keypad', 'shuffle-label', household.security.shuffle_keypad, this._toggleShuffle, 'shuffle_keypad')}
      </section>

      <section>
        ${this._choices('Lock after no touches', 'idle-label', IDLE_CHOICES, household.security.session_idle_seconds ?? 120,
          value => this.api.saveSecurity({ session_idle_seconds: value }), 'lock_after')}
        ${this._choices('Parent mode ends after', 'cap-label', CAP_CHOICES, household.security.parent_mode_minutes ?? 10,
          value => this.api.saveSecurity({ parent_mode_minutes: value }), 'parent_mode_ends')}
      </section>
    `;
  }

  private _toggleShuffle = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.saveSecurity({ shuffle_keypad: !this.household!.security.shuffle_keypad }));
  };
}

defineElement('pv-settings-pins', PvSettingsPins);
