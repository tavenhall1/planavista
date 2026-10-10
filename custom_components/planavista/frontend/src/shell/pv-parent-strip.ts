import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { buttonStyles } from '../styles/shared';
import { Member } from '../core/household';
import '../core/pv-member-avatar';
import '../core/pv-session-ring';

/**
 * pv-parent-strip: shows whose parent mode is on, with its countdown and
 * Lock (spec 9.4). It takes on the parent's color and picture.
 *
 * @fires pv-lock - Lock was tapped
 */
export class PvParentStrip extends LitElement {
  @property({ attribute: false }) member?: Member;
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Number }) endsAt = 0;

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

      .lock {
        min-width: 48px;
        min-height: 48px;
      }
    `,
  ];

  render() {
    const member = this.member;
    if (!member) return nothing;
    return html`
      <div class="strip" style="--strip-color: ${member.color}">
        <pv-member-avatar .member=${member} .hass=${this.hass} size="28"></pv-member-avatar>
        <span class="who">${member.name} <span class="mode">· parent mode</span></span>
        <pv-session-ring .endsAt=${this.endsAt} color=${member.color}></pv-session-ring>
        <button class="pv-btn pv-btn-ghost lock" type="button" @click=${this._lock}>Lock</button>
      </div>
    `;
  }

  private _lock(): void {
    this.dispatchEvent(new CustomEvent('pv-lock', { bubbles: true, composed: true }));
  }
}

defineElement('pv-parent-strip', PvParentStrip);
