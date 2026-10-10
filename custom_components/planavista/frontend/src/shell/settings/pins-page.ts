import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles, formStyles } from '../../styles/shared';
import { HouseholdView, inOrder } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { saveErrorMessage } from '../../core/page-host';
import type { PlanaVistaData } from '../../types';
import '../../core/pv-member-avatar';
import './pin-actions';

/**
 * pv-settings-pins: PINs and parent mode (spec 14.5). Whether this screen is
 * a shared family screen, everyone's PIN, and Shuffle the keypad.
 */
export class PvSettingsPins extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  @state() private _message = '';
  @state() private _busy = false;

  static styles = [
    baseStyles,
    buttonStyles,
    formStyles,
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
        font-size: 1rem;
        font-weight: 700;
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

      .hint {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.5;
      }

      .note {
        margin: 12px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 14%, transparent);
        line-height: 1.5;
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

      .rule {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        line-height: 1.6;
      }
    `,
  ];

  render() {
    const household = this.household;
    if (!household) return nothing;
    const account = household.account;
    const sharedScreens = household.security.shared_screens > 0;
    return html`
      <section>
        <h2>This screen</h2>
        ${this._switch('Shared family screen', 'shared-label', account.shared, this._toggleShared)}
        <p class="hint">Yes, the whole family uses it. Settings asks for a parent's PIN.</p>
        ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
        ${account.is_admin ? html`
          <p class="note">
            This screen is signed in with an admin account. A non-admin account is safer for a
            shared screen, because anyone here can reach Home Assistant's own settings.
            <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">How to set one up</a>
          </p>
        ` : nothing}
      </section>

      <section>
        <h2>PINs</h2>
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
        ${this._switch('Shuffle the keypad', 'shuffle-label', household.security.shuffle_keypad, this._toggleShuffle)}
        <p class="hint">The numbers move each time, so smudges and glances don't give a PIN away.</p>
      </section>

      <p class="rule">
        After 5 wrong tries, a PIN pauses for 30 seconds, and each pause after that is twice as
        long, up to 15 minutes. A parent can clear a pause here. Forgot every parent's PIN? Sign in
        to Home Assistant with a parent's or an admin's own account and set new ones here.
      </p>
    `;
  }

  private _switch(label: string, id: string, on: boolean, toggle: () => void) {
    return html`
      <div class="toggle-row">
        <span class="label" id=${id}>${label}</span>
        <div
          class="pv-toggle ${on ? 'active' : ''}"
          role="switch"
          tabindex="0"
          aria-checked=${on ? 'true' : 'false'}
          aria-labelledby=${id}
          aria-disabled=${this._busy ? 'true' : 'false'}
          @click=${toggle}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        ></div>
      </div>
    `;
  }

  private _toggleShared = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.setSharedScreen(!this.household!.account.shared));
  };

  private _toggleShuffle = (): void => {
    if (!this.household) return;
    void this._run(() => this.api.saveSecurity({ shuffle_keypad: !this.household!.security.shuffle_keypad }));
  };

  private async _run(action: () => Promise<void>): Promise<void> {
    if (this._busy) return;
    this._busy = true;
    this._message = '';
    try {
      await action();
    } catch (err) {
      this._message = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
    } finally {
      this._busy = false;
    }
  }
}

defineElement('pv-settings-pins', PvSettingsPins);
