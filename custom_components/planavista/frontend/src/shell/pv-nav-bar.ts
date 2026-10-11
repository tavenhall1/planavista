import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import type { Layout } from '../core/layout';
import type { ModuleView } from '../core/module-registry';

/** A module as the switcher shows it. */
export interface BarModule {
  id: string;
  label: string;
  icon: string;
}

/**
 * pv-nav-bar: the module switcher, the active module's views, and the gear
 * (spec 12.2). The card puts it under the header in landscape and along the
 * bottom edge in portrait and on phones, where hands already are.
 *
 * @fires pv-module-select - { id } of the module tapped
 * @fires pv-view-select - { id } of the view tapped
 * @fires pv-open-settings - the gear
 */
export class PvNavBar extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) modules: BarModule[] = [];
  @property({ attribute: false }) activeModule = '';
  @property({ attribute: false }) views: ModuleView[] = [];
  @property({ attribute: false }) activeView = '';
  @property({ type: Boolean }) canOpenSettings = false;

  static styles = css`
    :host {
      display: block;
      background: var(--pv-card-bg, #FFFFFF);
      font-family: var(--pv-font-family, system-ui, sans-serif);
      border-bottom: 1px solid var(--pv-border, #E7E7E3);
    }

    :host(:not([layout='landscape'])) {
      border-bottom: none;
      border-top: 1px solid var(--pv-border, #E7E7E3);
    }

    nav {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
    }

    :host(:not([layout='landscape'])) nav {
      padding: 0 12px env(safe-area-inset-bottom, 0px);
    }

    button {
      font: inherit;
      color: inherit;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:focus-visible {
      outline: 2px solid var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
      outline-offset: -2px;
      border-radius: 10px;
    }

    /* Every control is at least 48 px to the touch; the pill inside is drawn smaller. */
    .seg,
    .views {
      display: flex;
      align-items: center;
      min-height: 56px;
    }

    .seg-inner {
      display: flex;
      background: var(--pv-seg, #ECECE8);
      border-radius: 10px;
      padding: 3px;
    }

    .seg-btn {
      min-height: 48px;
    }

    .seg-btn span {
      display: inline-flex;
      align-items: center;
      height: 34px;
      padding: 0 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 650;
      color: var(--pv-text-secondary, #5F6670);
    }

    .seg-btn.on span {
      background: var(--pv-seg-on, #FFFFFF);
      color: var(--pv-text, #1A1B1E);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    }

    .views {
      gap: 2px;
      margin-left: auto;
    }

    :host(:not([layout='landscape'])) .views {
      margin-left: 0;
      flex: 1 1 auto;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    :host(:not([layout='landscape'])) .views::-webkit-scrollbar {
      display: none;
    }

    .view {
      min-height: 48px;
      flex-shrink: 0;
    }

    .view span {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 14px;
      border-radius: 9px;
      font-size: 0.9375rem;
      font-weight: 650;
      color: var(--pv-text-secondary, #5F6670);
    }

    .view.on span {
      background: var(--pv-accent, #5B5BD6);
      color: var(--pv-accent-text, #FFFFFF);
    }

    .view:not(.on):hover span {
      color: var(--pv-text, #1A1B1E);
    }

    .gear {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    }

    :host([layout='landscape']) .gear {
      margin-left: 0;
    }

    .gear span {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--pv-border, #E7E7E3);
      border-radius: 10px;
      color: var(--pv-text-secondary, #5F6670);
      --mdc-icon-size: 22px;
    }
  `;

  render() {
    return html`
      <nav aria-label="PlanaVista">
        ${this.modules.length > 1 ? html`
          <div class="seg" role="group" aria-label="Modules">
            <div class="seg-inner">
              ${this.modules.map(mod => html`
                <button type="button" class="seg-btn ${mod.id === this.activeModule ? 'on' : ''}"
                  aria-pressed=${mod.id === this.activeModule ? 'true' : 'false'}
                  @click=${() => this._fire('pv-module-select', { id: mod.id })}>
                  <span>${mod.label}</span>
                </button>
              `)}
            </div>
          </div>
        ` : nothing}
        <div class="views" role="group" aria-label="Views">
          ${this.views.map(view => html`
            <button type="button" class="view ${view.id === this.activeView ? 'on' : ''}"
              aria-pressed=${view.id === this.activeView ? 'true' : 'false'}
              @click=${() => this._fire('pv-view-select', { id: view.id })}>
              <span>${view.label}</span>
            </button>
          `)}
        </div>
        ${this.canOpenSettings ? html`
          <button type="button" class="gear" aria-label="Settings" title="Settings"
            @click=${this._openSettings}>
            <span><ha-icon icon="mdi:cog"></ha-icon></span>
          </button>
        ` : nothing}
      </nav>
    `;
  }

  /** Fired from the gear itself, so the card can give it focus back when a sheet closes. */
  private _openSettings(event: Event): void {
    (event.currentTarget as HTMLElement).dispatchEvent(new CustomEvent('pv-open-settings', { bubbles: true, composed: true }));
  }

  private _fire(name: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-nav-bar', PvNavBar);
