import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { buttonStyles } from '../styles/shared';
import { Member } from '../core/household';
import type { ModuleAction } from '../core/module-registry';
import { SESSION_IDLE_MS, sessionWords } from '../core/session';
import '../core/pv-member-avatar';
import '../core/pv-session-ring';

/**
 * pv-parent-strip: shows whose parent mode is on, with its countdown and
 * Lock (spec 9.4). It takes on the parent's color and picture. A child's
 * unlocked window shows the same strip in the child's color (milestone 8,
 * D5), without the module's buttons.
 *
 * @fires pv-lock - Lock was tapped
 * @fires pv-strip-action - { id } of a module's button (+ Add chore)
 */
export class PvParentStrip extends LitElement {
  @property({ attribute: false }) member?: Member;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Number }) endsAt = 0;
  /** A full ring (ms): the household's Lock after no touches. */
  @property({ type: Number }) span = SESSION_IDLE_MS;
  /** Parent mode, or a child's unlocked window. */
  @property({ type: Boolean }) parent = true;
  /** The module's buttons, such as + Add chore. */
  @property({ attribute: false }) actions: ModuleAction[] = [];
  /** Kiosk mode's button (milestone 9): Exit kiosk mode, Back to kiosk mode, or none. */
  @property({ attribute: false }) kiosk: 'exit' | 'back' | null = null;

  static styles = [
    buttonStyles,
    css`
      :host {
        display: block;
        flex-shrink: 0;
      }

      .strip {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 48px;
        padding: 0 6px 0 14px;
        border-bottom: 3px solid var(--strip-color);
        background: color-mix(in srgb, var(--strip-color) 16%, var(--pv-card-bg, #FFFFFF));
        color: var(--pv-text, #1A1B1E);
      }

      .who {
        flex: 1;
        min-width: 0;
        font-weight: 600;
        font-size: 0.9375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .mode {
        font-weight: 400;
        color: var(--pv-text-secondary, #6B7280);
      }

      .lock,
      .action {
        min-width: 48px;
        min-height: 48px;
      }

      .action {
        font-weight: 650;
      }
    `,
  ];

  render() {
    const member = this.member;
    if (!member) return nothing;
    return html`
      <div class="strip" style="--strip-color: ${member.color}">
        <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${member.name} <span class="mode">· ${sessionWords(this.parent).mode}</span></span>
        <pv-session-ring .endsAt=${this.endsAt} .span=${this.span} .parent=${this.parent} color=${member.color}></pv-session-ring>
        ${(this.parent ? this.actions : []).map(action => html`
          <button class="pv-btn pv-btn-primary action" type="button" @click=${() => this._action(action.id)}>
            ${action.glyph ? `${action.glyph} ` : ''}${action.label}
          </button>
        `)}
        ${this.kiosk ? html`
          <button class="pv-btn pv-btn-secondary kiosk" type="button" @click=${this._kiosk}>${this.kiosk === 'back' ? 'Back to kiosk mode' : 'Exit kiosk mode'}</button>
        ` : nothing}
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `;
  }

  private _action(id: string): void {
    this.dispatchEvent(new CustomEvent('pv-strip-action', { detail: { id }, bubbles: true, composed: true }));
  }

  private _kiosk(): void {
    this.dispatchEvent(new CustomEvent('pv-kiosk', { detail: { action: this.kiosk }, bubbles: true, composed: true }));
  }

  private _lock(): void {
    this.dispatchEvent(new CustomEvent('pv-lock', { bubbles: true, composed: true }));
  }
}

defineElement('pv-parent-strip', PvParentStrip);
