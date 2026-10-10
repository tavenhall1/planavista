import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles } from '../../styles/shared';
import type { HouseholdView } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { saveErrorMessage } from '../../core/page-host';
import { LocaleLike, setupDisplayDefaults } from '../../core/setup-defaults';
import type { PlanaVistaData } from '../../types';

/**
 * pv-setup-done: You're all set (spec 14.7). Opening the calendar saves the
 * calendar options a new household starts with and marks setup finished.
 */
export class PvSetupDone extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'setup';

  @state() private _message = '';

  /** Open the calendar: save the starting calendar options and finish setup. */
  async commit(): Promise<boolean> {
    this._message = '';
    try {
      const weather = Object.keys(this.hass.states).filter(id => id.startsWith('weather.'));
      const locale = (this.hass as unknown as { locale?: LocaleLike }).locale;
      await this.api.saveConfig({
        display: setupDisplayDefaults(this.data.display, locale, weather),
        onboarding_complete: true,
      });
      await this.api.saveSetup({ completed: true, step: null });
      return true;
    } catch (err) {
      this._message = saveErrorMessage(errorCode(err));
      return false;
    }
  }

  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      ul {
        margin: 8px 0 0;
        padding-left: 22px;
        line-height: 1.6;
        font-size: 1.0625rem;
      }

      li + li {
        margin-top: 8px;
      }

      .message {
        margin: 16px 0 0;
        color: var(--pv-danger, #DC2626);
      }
    `,
  ];

  render() {
    return html`
      <ul>
        <li>Tap the gear to change anything later.</li>
        <li>On a shared screen, Settings asks for a parent's PIN.</li>
      </ul>
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-done', PvSetupDone);
