import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { PlanaVistaData } from '../../types';
import './theme-picker';

/** pv-settings-appearance: today's themes; milestone 3 adds Light, Dark, and Automatic. */
export class PvSettingsAppearance extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'settings';

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <pv-theme-picker
        .hass=${this.hass}
        .data=${this.data}
        .household=${this.household}
        .api=${this.api}
        .layout=${this.layout}
        mode=${this.mode}
      ></pv-theme-picker>
    `;
  }
}

defineElement('pv-settings-appearance', PvSettingsAppearance);
