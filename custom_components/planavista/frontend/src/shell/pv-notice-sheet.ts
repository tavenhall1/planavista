import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { buttonStyles } from '../styles/shared';
import { sheetStyles } from '../styles/sheet';
import { trapTab } from '../core/focus';
import type { Layout } from '../core/layout';
import { SheetMotion } from './sheet-motion';

export interface NoticeAction {
  id: string;
  label: string;
  kind: 'primary' | 'secondary' | 'destructive';
}

/**
 * pv-notice-sheet: a short message with buttons, for confirmations ("Remove
 * Casey?") and explanations ("Settings needs a parent's PIN").
 *
 * @fires pv-sheet-action - { id } of the button; 'cancel' for Escape, a tap outside, or a drag down. It fires once the sheet has left.
 */
export class PvNoticeSheet extends LitElement {
  @property({ type: String }) heading = '';
  @property({ type: String }) body = '';
  @property({ attribute: false }) actions: NoticeAction[] = [];
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

  private _sheetMotion = new SheetMotion(this);
  private _detachDrag: (() => void) | null = null;
  private _closing = false;

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      .destructive {
        background: var(--pv-danger, #DC2626);
        border-color: transparent;
        color: #FFFFFF;
      }
    `,
  ];

  firstUpdated(): void {
    this.renderRoot.querySelector<HTMLElement>('.actions button')?.focus();
    const { panel, backdrop, zone } = this._parts();
    this._sheetMotion.open(panel, backdrop);
    this._detachDrag = this._sheetMotion.attachDrag(zone, panel, () => this._choose('cancel'));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._detachDrag?.();
    this._detachDrag = null;
  }

  private _parts(): { panel: HTMLElement; backdrop: HTMLElement; zone: HTMLElement } {
    const root = this.renderRoot;
    return {
      panel: root.querySelector<HTMLElement>('.panel')!,
      backdrop: root.querySelector<HTMLElement>('.backdrop')!,
      zone: root.querySelector<HTMLElement>('.grab-zone')!,
    };
  }

  render() {
    return html`
      <div class="backdrop" @click=${() => this._choose('cancel')}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        <h2 class="heading" id="notice-heading">${this.heading}</h2>
        ${this.body ? html`<p class="body">${this.body}</p>` : nothing}
        <div class="actions">
          ${this.actions.map(action => html`
            <button
              type="button"
              class="pv-btn ${action.kind === 'secondary' ? 'pv-btn-secondary' : 'pv-btn-primary'} ${action.kind === 'destructive' ? 'destructive' : ''}"
              @click=${() => this._choose(action.id)}
            >${action.label}</button>
          `)}
        </div>
      </div>
    `;
  }

  private _onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._choose('cancel');
      return;
    }
    trapTab(this.shadowRoot!, event);
  }

  private _choose(id: string): void {
    void this._leave(() => {
      this.dispatchEvent(new CustomEvent('pv-sheet-action', { detail: { id }, bubbles: true, composed: true }));
    });
  }

  /** The one way out: the sheet leaves first, then says why (spec 12.3). */
  private async _leave(fire: () => void): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const { panel, backdrop } = this._parts();
    await this._sheetMotion.close(panel, backdrop);
    fire();
    // A sheet its page keeps open must not stay invisible over the card, catching every tap.
    requestAnimationFrame(() => {
      if (!this.isConnected) return;
      for (const element of [panel, backdrop]) element.getAnimations().forEach(animation => animation.cancel());
      panel.style.transform = '';
      this._closing = false;
    });
  }
}

defineElement('pv-notice-sheet', PvNoticeSheet);
