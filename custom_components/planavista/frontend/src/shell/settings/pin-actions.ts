import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../../utils/define';
import { buttonStyles } from '../../styles/shared';
import { Member } from '../../core/household';
import { HouseholdApi, errorCode } from '../../core/household-client';
import type { Layout } from '../../core/layout';
import { saveErrorMessage } from '../../core/page-host';
import '../pv-pin-sheet';

/**
 * pv-pin-actions: one person's PIN status and what can be done about it
 * (Set PIN, Change PIN, Remove PIN, Clear pause). The person page and PINs
 * and parent mode both use it.
 */
export class PvPinActions extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String }) layout: Layout = 'landscape';
  @property({ attribute: false }) member!: Member;
  @property({ type: Boolean }) shuffle = false;
  /** Shared screens exist, so a parent without a PIN needs one. */
  @property({ type: Boolean }) sharedScreens = false;

  @state() private _choosing = false;
  @state() private _message = '';
  @state() private _busy = false;

  static styles = [
    buttonStyles,
    css`
      :host {
        display: block;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
      }

      .status {
        flex: 1;
        min-width: 140px;
        color: var(--pv-text-secondary, #6B7280);
      }

      .status.needs {
        color: #B45309;
        font-weight: 600;
      }

      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .buttons button {
        min-height: 44px;
      }

      .message {
        margin: 6px 0 0;
        color: var(--pv-danger, #DC2626);
        font-size: 0.875rem;
      }
    `,
  ];

  private _paused(): boolean {
    const until = this.member.locked_until ? Date.parse(this.member.locked_until) : 0;
    return until > Date.now();
  }

  private _status(): { text: string; needs: boolean } {
    if (this._paused()) return { text: 'Paused after too many tries', needs: false };
    if (this.member.has_pin) return { text: 'PIN set', needs: false };
    if (this.member.parent && this.sharedScreens) return { text: 'Needs a PIN on a shared screen', needs: true };
    return { text: 'No PIN', needs: false };
  }

  render() {
    const status = this._status();
    return html`
      <div class="row">
        <span class="status ${status.needs ? 'needs' : ''}">${status.text}</span>
        <span class="buttons">
          <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy}
            @click=${() => { this._message = ''; this._choosing = true; }}>
            ${this.member.has_pin ? 'Change PIN' : 'Set PIN'}
          </button>
          ${this.member.has_pin ? html`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._remove}>Remove PIN</button>
          ` : nothing}
          ${this._paused() ? html`
            <button class="pv-btn pv-btn-secondary" type="button" ?disabled=${this._busy} @click=${this._clearPause}>Clear pause</button>
          ` : nothing}
        </span>
      </div>
      ${this._message ? html`<p class="message" role="alert">${this._message}</p>` : nothing}
      ${this._choosing ? html`
        <pv-pin-sheet
          mode="choose"
          .hass=${this.hass}
          .api=${this.api}
          .layout=${this.layout}
          .target=${this.member}
          .shuffle=${this.shuffle}
          @pv-pin-set=${this._closeSheet}
          @pv-sheet-close=${this._closeSheet}
        ></pv-pin-sheet>
      ` : nothing}
    `;
  }

  private _closeSheet(event: Event): void {
    event.stopPropagation();
    this._choosing = false;
  }

  private async _remove(): Promise<void> {
    await this._run(() => this.api.clearPin(this.member.id));
  }

  private async _clearPause(): Promise<void> {
    await this._run(() => this.api.clearPause(this.member.id));
  }

  private async _run(action: () => Promise<void>): Promise<void> {
    this._busy = true;
    this._message = '';
    try {
      await action();
    } catch (err) {
      this._message = (err as { message?: string })?.message || saveErrorMessage(errorCode(err));
    } finally {
      this._busy = false;
    }
  }
}

defineElement('pv-pin-actions', PvPinActions);
