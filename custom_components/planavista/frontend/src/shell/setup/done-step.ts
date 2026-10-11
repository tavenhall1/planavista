import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles } from '../../styles/shared';
import type { HouseholdView } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { ModuleService } from '../../core/module-registry';
import { saveErrorMessage } from '../../core/page-host';
import { DonePart, doneParts } from '../../core/settings-registry';
import { LocaleLike, setupDisplayDefaults } from '../../core/setup-defaults';
import type { PlanaVistaData } from '../../types';

/**
 * pv-setup-done: You're all set (spec 14.7). Finishing saves the calendar
 * options a new household starts with and marks setup finished. Modules add
 * their own parts (Chores: a preview of the board and two tips), and the
 * first one's button label and module are what Finish says and opens.
 */
export class PvSetupDone extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'setup';
  @property({ attribute: false }) services: Record<string, ModuleService> = {};
  @property({ type: Number }) revision = 0;

  @state() private _message = '';

  private _parts(): DonePart[] {
    return doneParts.pages({ household: this.household, data: this.data, services: this.services });
  }

  /** The host's main button: what the first part says ("Open the board"), else the step's own label. */
  get primaryLabel(): string | undefined {
    return this._parts()[0]?.primary;
  }

  /** The module the card opens when setup finishes. */
  get openModule(): string | undefined {
    return this._parts()[0]?.module;
  }

  /** Finish: save the starting calendar options and mark setup finished. */
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
    const parts = this._parts();
    return html`
      ${parts.length ? parts.map(part => {
        const tag = unsafeStatic(part.tag);
        return staticHtml`<${tag} .hass=${this.hass} .household=${this.household} .services=${this.services}
          .revision=${this.revision} .layout=${this.layout}></${tag}>`;
      }) : html`
        <ul>
          <li>Tap the gear to change anything later.</li>
          <li>On a shared screen, Settings asks for a parent's PIN.</li>
        </ul>
      `}
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
    `;
  }
}

defineElement('pv-setup-done', PvSetupDone);
