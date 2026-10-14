import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, formStyles } from '../../styles/shared';
import { errorMessage } from '../../core/ws-api';
import { PAGE_ERROR } from '../../core/page-host';
import { version } from '../../../package.json';

interface DashboardState {
  shown: boolean;
  url_path: string | null;
  available: boolean;
}

/**
 * pv-settings-about: About PlanaVista (spec 14.5), and for an admin, whether
 * PlanaVista's own dashboard shows in Home Assistant's sidebar (2026-10-14).
 */
export class PvSettingsAbout extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _dashboard: DashboardState | null = null;
  @state() private _busy = false;

  static styles = [
    baseStyles,
    formStyles,
    css`
      :host {
        display: block;
        max-width: 640px;
      }

      .name {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 700;
      }

      .version {
        margin: 4px 0 20px;
        color: var(--pv-text-secondary, #6B7280);
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      a {
        display: flex;
        align-items: center;
        min-height: 48px;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        text-decoration: none;
        font-weight: 600;
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
        margin-top: 12px;
      }

      .label {
        font-weight: 600;
      }

      .hint {
        margin: 2px 0 0;
        color: var(--pv-text-secondary, #6B7280);
        font-size: 0.875rem;
      }
    `,
  ];

  /** Asked once, as soon as the page has Home Assistant. */
  private _asked = false;

  protected willUpdate(): void {
    if (!this._asked && this.hass) {
      this._asked = true;
      void this._load();
    }
  }

  private async _load(): Promise<void> {
    if (!this.hass?.user?.is_admin) return;
    try {
      this._dashboard = await this.hass.connection.sendMessagePromise<DashboardState>({ type: 'planavista/dashboard/get' });
    } catch {
      this._dashboard = null; // a backend from before: no switch
    }
  }

  private async _set(shown: boolean): Promise<void> {
    if (!this.hass || this._busy) return;
    this._busy = true;
    try {
      this._dashboard = await this.hass.connection.sendMessagePromise<DashboardState>({ type: 'planavista/dashboard/set', shown });
    } catch (err) {
      this.dispatchEvent(new CustomEvent(PAGE_ERROR, {
        detail: { message: errorMessage(err) ?? "Couldn't change the sidebar. Check the connection and try again." },
        bubbles: true, composed: true,
      }));
    } finally {
      this._busy = false;
    }
  }

  private _sidebar() {
    const dashboard = this._dashboard;
    if (!this.hass?.user?.is_admin || !dashboard?.available) return nothing;
    const on = dashboard.shown;
    const toggle = () => void this._set(!on);
    return html`
      <div class="toggle-row">
        <span class="label" id="about-sidebar">Show PlanaVista in the sidebar</span>
        <div class="pv-toggle ${on ? 'active' : ''}" role="switch" tabindex="0" aria-checked=${on ? 'true' : 'false'}
          aria-labelledby="about-sidebar" aria-disabled=${this._busy ? 'true' : 'false'} @click=${toggle}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}></div>
      </div>
      <p class="hint">A dashboard of its own${dashboard.url_path ? ` at /${dashboard.url_path}` : ''}, with this card. Your changes to it are kept while it's hidden.</p>
    `;
  }

  render() {
    return html`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${version}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
      ${this._sidebar()}
    `;
  }
}

defineElement('pv-settings-about', PvSettingsAbout);
