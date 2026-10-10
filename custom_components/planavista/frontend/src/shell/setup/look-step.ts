import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import type { HouseholdView } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import type { PlanaVistaData } from '../../types';
import '../settings/theme-picker';

/** pv-setup-look: Pick a look (spec 14.7). The theme saves as you tap. */
export class PvSetupLook extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'settings' | 'setup' = 'setup';

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
        mode="setup"
      ></pv-theme-picker>
    `;
  }
}

defineElement('pv-setup-look', PvSetupLook);
