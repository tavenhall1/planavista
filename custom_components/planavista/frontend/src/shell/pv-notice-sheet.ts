import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { buttonStyles } from '../styles/shared';
import { sheetStyles } from '../styles/sheet';
import { trapTab } from '../core/focus';
import type { Layout } from '../core/layout';

export interface NoticeAction {
  id: string;
  label: string;
  kind: 'primary' | 'secondary' | 'destructive';
}

/**
 * pv-notice-sheet: a short message with buttons, for confirmations ("Remove
 * Casey?") and explanations ("Settings needs a parent's PIN").
 *
 * @fires pv-sheet-action - { id } of the button; 'cancel' for Escape or a tap outside
 */
export class PvNoticeSheet extends LitElement {
  @property({ type: String }) heading = '';
  @property({ type: String }) body = '';
  @property({ attribute: false }) actions: NoticeAction[] = [];
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';

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
  }

  render() {
    return html`
      <div class="backdrop" @click=${() => this._choose('cancel')}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="notice-heading" @keydown=${this._onKey}>
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
    this.dispatchEvent(new CustomEvent('pv-sheet-action', { detail: { id }, bubbles: true, composed: true }));
  }
}

defineElement('pv-notice-sheet', PvNoticeSheet);
