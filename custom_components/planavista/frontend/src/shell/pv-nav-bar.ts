import { LitElement, html, css, nothing, PropertyValues, unsafeCSS } from 'lit';
import { segmentedStyles } from '../styles/controls';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { type BarShape, type Layout, barShape } from '../core/layout';
import { menuStep } from '../core/menu-keys';
import { SMOOTH, motionOf, springEasing } from '../core/motion';
import { MENU_LAYER } from '../core/sheet-layer';
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
 * bottom edge in portrait and on phones, where hands already are. When the
 * views' segments don't fit beside the rest, they fold into a pop-up button
 * (the current view and a menu), so a phone keeps one row.
 *
 * @fires pv-module-select - { id } of the module tapped
 * @fires pv-view-select - { id } of the view tapped
 * @fires pv-open-settings - the gear
 * @fires pv-module-action - { id } of one of the module's buttons (⏳ 2 to approve, + Add chore)
 */
export class PvNavBar extends LitElement {
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  /** A short card (under 500 px tall): the buttons take their short labels, as on a phone (round 2). */
  @property({ type: Boolean, reflect: true }) short = false;
  /** Segments, the pop-up button, or (when even that won't fit) the views on a row of their own. */
  @state() private _shape: BarShape = 'row';
  @state() private _menuOpen = false;
  /** Where the menu sits, from the pop-up button's left edge. */
  @state() private _menuLeft = 0;
  private _observer?: ResizeObserver;
  private _outside = (event: PointerEvent) => {
    if (!event.composedPath().includes(this)) this._closeMenu(false);
  };
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
      position: relative;
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

    /* A phone's bar is one row: tighter gaps and switcher segments leave room for a module's buttons. */
    /* Phones: one row at 440 px with the waiting count, the views' button as wide as "Rewards" (round 1). */
    :host([layout='phone']) nav {
      gap: 6px;
    }

    :host([layout='phone']) .modules > button {
      padding: 0 10px;
    }

    :host([layout='phone']) .picker > span {
      padding: 0 6px 0 10px;
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

    /* The pop-up button: a one-segment track showing the current view, like the switcher beside it. */
    .picker {
      display: inline-flex;
      align-items: stretch;
      flex: 0 0 auto;
      height: 48px;
      padding: 0 4px;
      box-sizing: border-box;
      border-radius: 13px;
      background: var(--pv-seg, #ECECE8);
    }

    .picker .label {
      display: grid;
    }

    .picker .label > span {
      grid-area: 1 / 1;
    }

    .picker .label > span:not(.on) {
      visibility: hidden;
    }

    .picker > span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin: 5px 0;
      padding: 0 8px 0 12px;
      border-radius: 9px;
      background: var(--pv-seg-on, #FFFFFF);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
      color: var(--pv-text, #1A1B1E);
      font-size: 0.875rem;
      font-weight: 650;
      white-space: nowrap;
      --mdc-icon-size: 18px;
    }

    .picker ha-icon {
      color: var(--pv-text-secondary, #5F6670);
    }

    button.picker:focus-visible {
      border-radius: 13px;
    }

    /* Copies kept only to measure (the segments while folded, the button while not). */
    .measure {
      position: absolute;
      top: 0;
      left: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .menu {
      position: absolute;
      z-index: ${unsafeCSS(MENU_LAYER)};
      bottom: calc(100% + 6px);
      min-width: 200px;
      padding: 6px;
      box-sizing: border-box;
      border-radius: 14px;
      border: 1px solid var(--pv-border, #E7E7E3);
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      transform-origin: bottom left;
    }

    :host([layout='landscape']) .menu {
      bottom: auto;
      top: calc(100% + 6px);
      transform-origin: top left;
    }

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-height: 48px;
      padding: 0 12px;
      box-sizing: border-box;
      border-radius: 9px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--pv-text, #1A1B1E);
      text-align: left;
      --mdc-icon-size: 20px;
    }

    .item:hover,
    .item:focus-visible {
      background: var(--pv-seg, #ECECE8);
    }

    .item:focus-visible {
      outline-offset: -2px;
    }

    .item ha-icon {
      color: var(--pv-accent-ink, var(--pv-accent, #5B5BD6));
    }

    /* Two rows only when even the pop-up button won't fit: the switcher, buttons, and gear, then the views. */
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
    document.removeEventListener('pointerdown', this._outside, true);
  }

  protected willUpdate(changed: PropertyValues): void {
    // A menu belongs to the module and the shape it opened in.
    if (this._menuOpen && (changed.has('activeModule') || (changed.has('_shape') && this._shape !== 'picker'))) {
      this._closeMenu(false);
    }
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has('_shape')) this._measure();
    this.toggleAttribute('wrapped', this._shape === 'wrapped');
    if (changed.has('_menuOpen') && this._menuOpen) this._showMenu();
  }

  /**
   * Which shape fits, from natural widths: the views' buttons and the pop-up
   * button never shrink, and whichever isn't shown is kept as a hidden copy,
   * so the answer doesn't depend on the shape drawn and can't flip back and forth.
   */
  private _measure(): void {
    const nav = this.renderRoot.querySelector('nav');
    if (!nav || !nav.clientWidth) return;
    const style = getComputedStyle(nav);
    const available = nav.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    const gap = parseFloat(style.columnGap) || 12;
    const views = [...this.renderRoot.querySelectorAll<HTMLElement>('.views .view')];
    // The buttons, the 2 px between them, and the track's 4 px each side.
    const viewsWidth = views.reduce((sum, view) => sum + view.offsetWidth, 0) + 2 * Math.max(0, views.length - 1) + (views.length ? 8 : 0);
    const picker = this.renderRoot.querySelector<HTMLElement>('.picker');
    const others = [...nav.children]
      .filter(child => !child.classList.contains('views') && !child.classList.contains('picker'))
      .map(child => (child as HTMLElement).offsetWidth);
    const shape = views.length ? barShape(others, viewsWidth, picker?.offsetWidth ?? 0, gap, available) : 'row';
    if (shape !== this._shape) this._shape = shape;
  }

  private _toggleMenu(): void {
    if (this._menuOpen) this._closeMenu(true);
    else this._openMenu();
  }

  private _openMenu(): void {
    const picker = this.renderRoot.querySelector<HTMLElement>('button.picker');
    this._menuLeft = picker?.offsetLeft ?? 0;
    this._menuOpen = true;
    document.addEventListener('pointerdown', this._outside, true);
  }

  private _closeMenu(refocus: boolean): void {
    if (!this._menuOpen) return;
    this._menuOpen = false;
    document.removeEventListener('pointerdown', this._outside, true);
    if (refocus) void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('button.picker')?.focus());
  }

  /** Keeps the menu inside the card, focuses the current view, and lets the menu rise from its button. */
  private _showMenu(): void {
    const menu = this.renderRoot.querySelector<HTMLElement>('.menu');
    if (!menu) return;
    const room = this.clientWidth - 8 - menu.offsetWidth;
    if (this._menuLeft > room) menu.style.left = `${Math.max(8, room)}px`;
    const items = [...menu.querySelectorAll<HTMLElement>('.item')];
    (items.find(item => item.getAttribute('aria-checked') === 'true') ?? items[0])?.focus();
    const rises = this.layout !== 'landscape';
    if (motionOf(this) === 'reduced') {
      menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: 'ease-out' });
    } else {
      const spring = springEasing(SMOOTH);
      menu.animate(
        [{ opacity: 0, transform: `translateY(${rises ? 8 : -8}px) scale(0.96)` }, { opacity: 1, transform: 'none' }],
        { duration: spring.duration, easing: spring.easing },
      );
    }
  }

  private _pickerKey(event: KeyboardEvent): void {
    if (!this._menuOpen && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      this._openMenu();
    }
  }

  private _menuKey(event: KeyboardEvent): void {
    const items = [...this.renderRoot.querySelectorAll<HTMLElement>('.menu .item')];
    const focused = this.renderRoot.querySelector<HTMLElement>('.menu .item:focus');
    const index = focused ? items.indexOf(focused) : 0;
    const step = menuStep(event.key, index, items.length);
    if (step === null) return;
    if (step === 'close') {
      if (event.key === 'Escape') event.preventDefault();
      this._closeMenu(event.key === 'Escape');
      return;
    }
    event.preventDefault();
    if (step === 'choose') items[index]?.click();
    else items[step]?.focus();
  }

  private _choose(id: string): void {
    this._closeMenu(true);
    if (id !== this.activeView) this._fire('pv-view-select', { id });
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
        ${this._shape === 'picker' ? html`
          <button type="button" class="picker" aria-haspopup="menu" aria-expanded=${this._menuOpen ? 'true' : 'false'}
            aria-label=${`View: ${this._currentLabel()}`} @click=${this._toggleMenu} @keydown=${this._pickerKey}>
            <span><span class="label">${this._labels()}</span><ha-icon icon="mdi:unfold-more-horizontal" aria-hidden="true"></ha-icon></span>
          </button>
          <div class="views pv-seg measure" aria-hidden="true" inert>
            ${this.views.map(view => html`<button type="button" class="view" tabindex="-1">${view.label}</button>`)}
          </div>
        ` : html`
          <div class="views pv-seg" role="group" aria-label="Views">
            ${this.views.map(view => html`
              <button type="button" class="view" aria-pressed=${view.id === this.activeView ? 'true' : 'false'}
                @click=${() => this._fire('pv-view-select', { id: view.id })}>${view.label}</button>
            `)}
          </div>
          ${this.views.length ? html`
            <span class="picker measure" aria-hidden="true">
              <span><span class="label">${this._labels()}</span><ha-icon icon="mdi:unfold-more-horizontal"></ha-icon></span>
            </span>
          ` : nothing}
        `}
        ${this.actions.length ? html`
          <div class="actions">
            ${this.actions.map(action => {
              const text = (this.layout === 'phone' || this.short) && action.short !== undefined ? action.short : action.label;
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
      ${this._menuOpen ? html`
        <div class="menu" role="menu" aria-label="Views" style=${`left: ${this._menuLeft}px`} @keydown=${this._menuKey}>
          ${this.views.map(view => html`
            <button type="button" class="item" role="menuitemradio" aria-checked=${view.id === this.activeView ? 'true' : 'false'} tabindex="-1"
              @click=${() => this._choose(view.id)}>
              <span>${view.label}</span>${view.id === this.activeView ? html`<ha-icon icon="mdi:check" aria-hidden="true"></ha-icon>` : nothing}
            </button>
          `)}
        </div>
      ` : nothing}
    `;
  }

  /**
   * Every view's name stacked in one spot, the current one shown: the button is as
   * wide as its widest view, so the bar's shape doesn't change with the view (round 1).
   */
  private _labels() {
    const current = this._currentLabel();
    return this.views.map(view => html`<span class=${view.label === current ? 'on' : ''}>${view.label}</span>`);
  }

  private _currentLabel(): string {
    return (this.views.find(view => view.id === this.activeView) ?? this.views[0])?.label ?? '';
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
