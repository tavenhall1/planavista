import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { segmentedStyles } from '../styles/controls';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { type Layout, barFits } from '../core/layout';
import type { ModuleAction, ModuleView } from '../core/module-registry';

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
 * @fires pv-module-action - { id } of one of the module's buttons (⏳ 2 waiting for OK, + Add chore)
 */
export class PvNavBar extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** The controls don't fit on one row (a phone with two modules), so the views get their own. */
  @state() private _wrapped = false;
  private _observer?: ResizeObserver;
  @property({ attribute: false }) modules: BarModule[] = [];
  @property({ attribute: false }) activeModule = '';
  @property({ attribute: false }) views: ModuleView[] = [];
  @property({ attribute: false }) activeView = '';
  @property({ type: Boolean }) canOpenSettings = false;
  /** The module's own buttons, between its views and the gear. */
  @property({ attribute: false }) actions: ModuleAction[] = [];

  static styles = [
    segmentedStyles,
    css`
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
      min-height: 56px;
      gap: 12px;
      padding: 0 20px;
    }

    :host(:not([layout='landscape'])) nav {
      padding: 0 12px var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
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





    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Every bar button is a 48 px target, the short "+" too (review); the pill is drawn inside. */
    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      min-height: 48px;
      flex-shrink: 0;
    }

    .action > span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 9px;
      border: 1px solid var(--pv-border, #E7E7E3);
      font-size: 0.875rem;
      font-weight: 650;
      color: var(--pv-text, #1A1B1E);
      white-space: nowrap;
    }

    .action.act > span {
      border-color: transparent;
      background: var(--pv-accent-tint, #EEEEFC);
      color: var(--pv-accent-tint-ink, #3B3BB0);
    }

    .glyph {
      font-size: 1rem;
      line-height: 1;
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

    /* Two rows when one won't hold everything: the switcher, buttons, and gear, then the views. */
    :host([wrapped]) nav {
      flex-wrap: wrap;
      row-gap: 0;
    }

    :host([wrapped]) .views {
      order: 1;
      flex: 1 0 100%;
      justify-content: space-around;
      overflow-x: visible;
      margin-left: 0;
    }
  `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._observer = new ResizeObserver(() => this._measure());
    this._observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has('_wrapped')) this._measure();
    this.toggleAttribute('wrapped', this._wrapped);
  }

  /** Whether everything fits on one row at its natural width; the views' buttons never shrink, so this is stable. */
  private _measure(): void {
    const nav = this.renderRoot.querySelector('nav');
    if (!nav || !nav.clientWidth) return;
    const style = getComputedStyle(nav);
    const available = nav.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    const gap = parseFloat(style.columnGap) || 12;
    const views = [...this.renderRoot.querySelectorAll<HTMLElement>('.views .view')];
    const viewsWidth = views.reduce((sum, view) => sum + view.offsetWidth, 0) + 2 * Math.max(0, views.length - 1);
    const others = [...nav.children]
      .filter(child => !child.classList.contains('views'))
      .map(child => (child as HTMLElement).offsetWidth);
    const wrapped = !barFits([...others, viewsWidth], gap, available);
    if (wrapped !== this._wrapped) this._wrapped = wrapped;
  }

  render() {
    return html`
      <nav aria-label="PlanaVista">
        ${this.modules.length > 1 ? html`
          <div class="pv-seg modules" role="group" aria-label="Modules">
            ${this.modules.map(mod => html`
              <button type="button" aria-pressed=${mod.id === this.activeModule ? 'true' : 'false'}
                @click=${() => this._fire('pv-module-select', { id: mod.id })}>${mod.label}</button>
            `)}
          </div>
        ` : nothing}
        <div class="views pv-seg" role="group" aria-label="Views">
          ${this.views.map(view => html`
            <button type="button" class="view" aria-pressed=${view.id === this.activeView ? 'true' : 'false'}
              @click=${() => this._fire('pv-view-select', { id: view.id })}>${view.label}</button>
          `)}
        </div>
        ${this.actions.length ? html`
          <div class="actions">
            ${this.actions.map(action => {
              const text = this.layout === 'phone' && action.short !== undefined ? action.short : action.label;
              return html`
                <button type="button" class="action ${action.tone === 'act' ? 'act' : ''}" aria-label=${action.label}
                  @click=${() => this._fire('pv-module-action', { id: action.id })}>
                  <span>${action.glyph ? html`<span class="glyph" aria-hidden="true">${action.glyph}</span>` : nothing}${text}</span>
                </button>
              `;
            })}
          </div>
        ` : nothing}
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
