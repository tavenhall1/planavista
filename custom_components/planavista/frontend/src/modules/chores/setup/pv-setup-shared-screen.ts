import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../../utils/define';
import { baseStyles, buttonStyles } from '../../../styles/shared';
import { HouseholdView, inOrder } from '../../../core/household';
import type { HouseholdApi } from '../../../core/household-client';
import type { Layout } from '../../../core/layout';
import type { PinGate } from '../../../core/pin-gate';
import type { Session } from '../../../core/session';
import { errorMessage } from '../../../core/ws-api';
import { pinBeforeSharing } from './setup-derive';
import '../../../core/pv-member-avatar';
import '../../../shell/settings/pin-actions';

/**
 * pv-setup-shared-screen: Is this a shared family screen? (spec 14.7, 9.7).
 * On yes, parents set their PINs here, and an admin account is flagged
 * (not blocked): a non-admin account is safer on a shared screen. Marking
 * this account shared asks for a parent's PIN first, so the rest of setup
 * saves in parent mode.
 */
export class PvSetupSharedScreen extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  /** The card's PIN sheet, and the parent mode it starts. */
  @property({ attribute: false }) pinGate?: PinGate;
  @property({ attribute: false }) session: Session | null = null;

  @state() private _shared: boolean | null = null;
  @state() private _message = '';

  protected willUpdate(): void {
    if (this._shared === null && this.household) {
      // A parent's own login is their own screen; any other account starts as the family's.
      this._shared = this.household.account.kind !== 'parent';
    }
  }

  /** Continue: mark this account as a shared screen, or not. */
  async commit(): Promise<boolean> {
    const view = this.household;
    if (!view) return false;
    this._message = '';
    const shared = this._shared !== false;
    if (shared && !view.members.some(m => m.parent && m.has_pin)) {
      this._message = "Set a PIN for a parent first, so someone can open Settings here.";
      return false;
    }
    if (pinBeforeSharing(view, shared, this.session)) {
      const parents = view.members.filter(m => m.parent && m.has_pin);
      if (!this.pinGate || !(await this.pinGate.ask(parents, "Who's finishing setup?"))) return false;
    }
    try {
      if (shared !== view.account.shared) await this.api.setSharedScreen(shared);
      return true;
    } catch (err) {
      this._message = errorMessage(err) ?? "Couldn't save. Check the connection and try again.";
      return false;
    }
  }

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        display: block;
      }

      .choices {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
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

      .label {
        margin: 0 4px 8px;
        font-size: 0.8125rem;
        font-weight: 750;
        color: var(--pv-text-secondary, #6B7280);
      }

      .parents {
        border-radius: 14px;
        background: var(--pv-card-bg, #FFFFFF);
        box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      }

      .parent {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 60px;
        padding: 8px 14px;
      }

      .parent + .parent {
        border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .parent .name {
        flex: 1;
        font-weight: 600;
      }

      .hint {
        margin: 10px 4px 0;
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
      }

      .warning {
        margin: 16px 0 0;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 16%, transparent);
        line-height: 1.5;
      }

      .message {
        margin: 14px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  render() {
    const view = this.household;
    if (!view) return nothing;
    const shared = this._shared !== false;
    const parents = inOrder(view.members).filter(m => m.parent);
    return html`
      <div class="choices" role="radiogroup" aria-label="Is this a shared family screen?">
        <button class="choice" type="button" role="radio" aria-checked=${shared ? 'true' : 'false'} @click=${() => { this._shared = true; }}>
          <span class="icon" aria-hidden="true">🏠</span>
          <span class="text"><span class="title">Yes, the whole family uses it</span><span class="sub">Like a tablet on the kitchen wall.</span></span>
        </button>
        <button class="choice" type="button" role="radio" aria-checked=${!shared ? 'true' : 'false'} @click=${() => { this._shared = false; }}>
          <span class="icon" aria-hidden="true">📱</span>
          <span class="text"><span class="title">No, it's just mine</span><span class="sub">Your own phone or computer. No PINs needed here.</span></span>
        </button>
      </div>
      ${shared ? html`
        <p class="label">Parents, set your PINs</p>
        ${parents.length ? html`
          <div class="parents">
            ${parents.map(member => html`
              <div class="parent">
                <pv-member-avatar .member=${member} .hass=${this.hass} size="36"></pv-member-avatar>
                <span class="name">${member.name}</span>
                <pv-pin-actions .hass=${this.hass} .api=${this.api} .layout=${this.layout} .member=${member}
                  .shuffle=${!!view.security.shuffle_keypad} .sharedScreens=${true}></pv-pin-actions>
              </div>
            `)}
          </div>
        ` : html`<p class="hint">No one is a parent yet. Go back to Who lives here? and mark the parents.</p>`}
        <p class="hint">Kids can have a PIN too, so nobody checks off someone else's chores. That's in Settings.</p>
        ${this.hass?.user?.is_admin ? html`
          <p class="warning" role="note">
            This screen is signed in with an admin account. A non-admin account is safer for a shared screen, because an
            admin can open Home Assistant's own settings, and a PIN can't guard those. Make a new user in Home Assistant
            (Settings, People, Users) without administrator rights, and sign this screen in with it.
          </p>
        ` : nothing}
      ` : nothing}
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-shared-screen', PvSetupSharedScreen);
