import { LitElement, html, css, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../../utils/define';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { SetupPatch } from '../../core/settings-registry';

/** Four people's rings, three quarters closed: a hint of what's coming. */
const RING_COLORS = ['#D93A40', '#1A72E0', '#2E9E52', '#FFB224'];

const FEATURES: Array<[string, string, string]> = [
  ['👥', 'Everyone who lives here', 'Each person gets a color, even kids without a Home Assistant account.'],
  ['📅', 'Your calendars', 'Each one belongs to someone, so the day reads at a glance.'],
  ['✓', 'Chores, if you want them', 'From your household plan, or a few common ones.'],
];

/**
 * pv-setup-welcome: the first step (spec 14.7); the host shows its heading
 * and lead. Its second way on, Restore from a PlanaVista file, brings a
 * household back in one step (the restore step that follows).
 */
export class PvSetupWelcome extends LitElement {
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ attribute: false }) household: HouseholdView | null = null;

  /** For the host: the restore step applies from now on. */
  setupPatch?: SetupPatch;

  /** Restore from a PlanaVista file. */
  async secondary(): Promise<boolean> {
    await this.api.saveSetup({ start: 'restore' });
    this.setupPatch = { setup: { start: 'restore' } };
    return true;
  }

  /** Set up: an earlier choice to restore (and Back to here) is forgotten. */
  async commit(): Promise<boolean> {
    if (this.household?.setup.start === 'restore') {
      await this.api.saveSetup({ start: null });
      this.setupPatch = { setup: { start: null } };
    }
    return true;
  }

  static styles = css`
    :host {
      display: block;
    }

    .rings {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin: 8px 0 20px;
    }

    svg {
      transform: rotate(-90deg);
    }

    ul {
      list-style: none;
      margin: 0 0 18px;
      padding: 0;
      display: grid;
      gap: 14px;
    }

    li {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      font-size: 1.125rem;
    }

    .title {
      display: block;
      font-weight: 600;
    }

    .text {
      font-size: 0.9375rem;
      color: var(--pv-text-secondary, #6B7280);
    }

    .note {
      margin: 0;
      font-size: 0.875rem;
      color: var(--pv-text-secondary, #6B7280);
      text-align: center;
    }
  `;

  render() {
    const size = 72;
    const radius = 30;
    const length = 2 * Math.PI * radius;
    return html`
      <div class="rings" aria-hidden="true">
        ${RING_COLORS.map(color => html`
          <svg width=${size} height=${size} viewBox="0 0 ${size} ${size}">
            ${svg`
              <circle cx="36" cy="36" r=${radius} fill="none" stroke=${color} stroke-width="8" opacity="0.2"></circle>
              <circle cx="36" cy="36" r=${radius} fill="none" stroke=${color} stroke-width="8"
                stroke-linecap="round" stroke-dasharray=${length} stroke-dashoffset=${length * 0.25}></circle>
            `}
          </svg>
        `)}
      </div>
      <ul>
        ${FEATURES.map(([icon, title, text]) => html`
          <li><span class="icon" aria-hidden="true">${icon}</span><span><span class="title">${title}</span><span class="text">${text}</span></span></li>
        `)}
      </ul>
      <p class="note">About 5 minutes. Everything can change later in Settings.</p>
    `;
  }
}

defineElement('pv-setup-welcome', PvSetupWelcome);
