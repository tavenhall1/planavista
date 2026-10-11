import { LitElement, html, css } from 'lit';
import { defineElement } from '../../utils/define';
import { baseStyles } from '../../styles/shared';
import { version } from '../../../package.json';

/** pv-settings-about: About PlanaVista (spec 14.5). Diagnostics arrive with chores. */
export class PvSettingsAbout extends LitElement {
  static styles = [
    baseStyles,
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
    `,
  ];

  render() {
    return html`
      <p class="name">PlanaVista</p>
      <p class="version">Version ${version}</p>
      <ul>
        <li><a href="https://github.com/tavenhall1/planavista" target="_blank" rel="noopener noreferrer">Project on GitHub</a></li>
        <li><a href="https://github.com/tavenhall1/planavista/issues" target="_blank" rel="noopener noreferrer">Report a problem</a></li>
      </ul>
    `;
  }
}

defineElement('pv-settings-about', PvSettingsAbout);
