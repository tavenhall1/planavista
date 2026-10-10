import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { baseStyles, buttonStyles } from '../../styles/shared';
import type { HouseholdView, Member } from '../../core/household';
import type { HouseholdApi } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { PAGE_ERROR, POP_PAGE, PUSH_PAGE, PushPageDetail } from '../../core/page-host';
import type { Session } from '../../core/session';
import { SettingsContext, SettingsPage, groupPages, settingsRegistry } from '../../core/settings-registry';
import type { PlanaVistaData } from '../../types';
import '../pv-parent-strip';
import './people-page';
import './person-page';
import './pins-page';
import './about-page';
import './appearance-page';

interface LeavablePage extends HTMLElement {
  confirmLeave?: () => Promise<boolean>;
}

const TOAST_MS = 4000;

/**
 * pv-settings: one Settings for every module (spec 14.1). A split view like
 * iPad Settings in landscape; a stack with back controls in portrait and on
 * phones. The parent-mode strip stays on top while parent mode is on.
 *
 * @fires pv-settings-close - Done
 */
export class PvSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlanaVistaData;
  @property({ attribute: false }) household: HouseholdView | null = null;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ attribute: false }) session: Session | null = null;
  @property({ type: Number }) sessionEndsAt = 0;
  @property({ attribute: false }) parent: Member | null = null;
  @property({ attribute: false }) drafts: Map<string, unknown> = new Map();

  /** The page picked in the sidebar (the stack starts at the list). */
  @state() private _selected: string | null = null;
  /** Pages shown on top of it, such as a person opened from People. */
  @state() private _stack: PushPageDetail[] = [];
  @state() private _toast = '';
  private _toastTimer: number | undefined;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(PUSH_PAGE, this._onPush as EventListener);
    this.addEventListener(POP_PAGE, this._onPop);
    this.addEventListener(PAGE_ERROR, this._onError as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(PUSH_PAGE, this._onPush as EventListener);
    this.removeEventListener(POP_PAGE, this._onPop);
    this.removeEventListener(PAGE_ERROR, this._onError as EventListener);
    window.clearTimeout(this._toastTimer);
  }

  static styles = [
    baseStyles,
    buttonStyles,
    css`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--pv-card-bg, #FFFFFF);
        color: var(--pv-text, #1A1B1E);
        font-family: var(--pv-font-family, -apple-system, system-ui, sans-serif);
      }

      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 60px;
        padding: 6px 12px 6px 16px;
        border-bottom: 1px solid var(--pv-border-subtle, #E5E7EB);
        flex-shrink: 0;
      }

      .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
      }

      .done {
        min-height: 48px;
        min-width: 88px;
      }

      .back {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent, #6366F1);
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
      }

      .body {
        flex: 1;
        min-height: 0;
        display: flex;
      }

      .list {
        box-sizing: border-box;
        width: 100%;
        overflow-y: auto;
        padding: 12px;
      }

      :host([layout='landscape']) .list {
        width: clamp(260px, 30%, 320px);
        flex-shrink: 0;
        border-right: 1px solid var(--pv-border-subtle, #E5E7EB);
      }

      .group {
        margin-bottom: 14px;
      }

      .group-label {
        margin: 8px 12px 4px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--pv-text-secondary, #6B7280);
      }

      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 56px;
        padding: 8px 12px;
        border: none;
        border-radius: 12px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .row:hover {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 5%, transparent);
      }

      .row--active,
      .row--active:hover {
        background: color-mix(in srgb, var(--pv-accent, #6366F1) 12%, transparent);
      }

      .row-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .row-label {
        font-weight: 600;
      }

      .row-value {
        font-size: 0.875rem;
        color: var(--pv-text-secondary, #6B7280);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .chevron {
        color: var(--pv-text-secondary, #6B7280);
        font-size: 1.25rem;
      }

      .page {
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        overflow-y: auto;
        padding: 12px 20px 40px;
      }

      .page-heading {
        margin: 6px 0 16px;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .banner {
        margin: 0 0 16px;
        padding: 12px 14px;
        border-radius: 12px;
        background: color-mix(in srgb, #F59E0B 14%, transparent);
      }

      .toast {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 20px;
        margin: 0 auto;
        max-width: 480px;
        padding: 12px 16px;
        border-radius: 12px;
        background: var(--pv-text, #1A1B1E);
        color: var(--pv-card-bg, #FFFFFF);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        text-align: center;
      }
    `,
  ];

  private _context(): SettingsContext {
    return { household: this.household, data: this.data };
  }

  private get _split(): boolean {
    return this.layout === 'landscape';
  }

  /** The page in view: the one picked, or in landscape the first. */
  private _current(pages: SettingsPage[]): SettingsPage | undefined {
    return pages.find(p => p.id === this._selected) ?? (this._split ? pages[0] : undefined);
  }

  render() {
    const pages = settingsRegistry.pages(this._context());
    const current = this._current(pages);
    const top = this._stack[this._stack.length - 1];
    const stackedPage = !this._split && current;
    return html`
      ${this.session?.parent && this.parent ? html`
        <pv-parent-strip .member=${this.parent} .hass=${this.hass} .endsAt=${this.sessionEndsAt}></pv-parent-strip>
      ` : nothing}
      <div class="bar">
        ${stackedPage
          ? html`<button class="back" type="button" @click=${this._back}>‹ ${top ? top.back : 'Settings'}</button>`
          : html`<h1 class="title">Settings</h1>`}
        <button class="pv-btn pv-btn-primary done" type="button" @click=${this._done}>Done</button>
      </div>
      <div class="body">
        ${this._split || !current ? this._renderList(pages, current) : nothing}
        ${current ? this._renderPage(current, top) : nothing}
      </div>
      ${this._toast ? html`<div class="toast" role="status">${this._toast}</div>` : nothing}
    `;
  }

  private _renderList(pages: SettingsPage[], current: SettingsPage | undefined) {
    const context = this._context();
    return html`
      <nav class="list" aria-label="Settings">
        ${groupPages(pages).map(({ group, pages: rows }) => html`
          <section class="group">
            ${group.label ? html`<h2 class="group-label">${group.label}</h2>` : nothing}
            ${rows.map(page => {
              const active = this._split && current?.id === page.id;
              return html`
                <button class="row ${active ? 'row--active' : ''}" type="button"
                  aria-current=${active ? 'page' : 'false'}
                  @click=${() => this._select(page.id)}>
                  <span class="row-text">
                    <span class="row-label">${page.label}</span>
                    ${page.summary ? html`<span class="row-value">${page.summary(context)}</span>` : nothing}
                  </span>
                  <span class="chevron" aria-hidden="true">›</span>
                </button>
              `;
            })}
          </section>
        `)}
      </nav>
    `;
  }

  private _renderPage(page: SettingsPage, top: PushPageDetail | undefined) {
    const tag = unsafeStatic(top ? top.tag : page.tag);
    const title = top ? top.title : page.label;
    const key = [page.id, ...this._stack.map(s => `${s.tag}:${JSON.stringify(s.props ?? {})}`)].join('/');
    return html`
      <section class="page" aria-label=${title}>
        ${this._split && top ? html`<button class="back" type="button" @click=${this._back}>‹ ${top.back}</button>` : nothing}
        <h1 class="page-heading">${title}</h1>
        ${this.household && !this.household.available
          ? html`<p class="banner">People and PINs can't be changed until PlanaVista is updated.</p>`
          : nothing}
        ${keyed(key, staticHtml`
          <${tag}
            class="page-el"
            .hass=${this.hass}
            .data=${this.data}
            .household=${this.household}
            .api=${this.api}
            .layout=${this.layout}
            mode="settings"
            .pageProps=${top?.props ?? {}}
            .drafts=${this.drafts}
          ></${tag}>
        `)}
      </section>
    `;
  }

  /** Ask the page in view whether it may be left (an editor with changes asks first). */
  private async _mayLeave(): Promise<boolean> {
    const page = this.renderRoot.querySelector<LeavablePage>('.page-el');
    return page?.confirmLeave ? page.confirmLeave() : true;
  }

  private async _select(id: string): Promise<void> {
    if (id === this._selected && this._stack.length === 0) return;
    if (!(await this._mayLeave())) return;
    this._stack = [];
    this._selected = id;
  }

  private _back = async (): Promise<void> => {
    if (!(await this._mayLeave())) return;
    if (this._stack.length > 0) this._stack = this._stack.slice(0, -1);
    else this._selected = null;
  };

  private _done = async (): Promise<void> => {
    if (!(await this._mayLeave())) return;
    this.dispatchEvent(new CustomEvent('pv-settings-close', { bubbles: true, composed: true }));
  };

  private _onPush = (event: CustomEvent<PushPageDetail>): void => {
    event.stopPropagation();
    this._stack = [...this._stack, event.detail];
  };

  private _onPop = (event: Event): void => {
    event.stopPropagation();
    this._stack = this._stack.slice(0, -1);
  };

  private _onError = (event: CustomEvent<{ message: string }>): void => {
    event.stopPropagation();
    this._toast = event.detail.message;
    window.clearTimeout(this._toastTimer);
    this._toastTimer = window.setTimeout(() => {
      this._toast = '';
    }, TOAST_MS);
  };
}

defineElement('pv-settings', PvSettings);
