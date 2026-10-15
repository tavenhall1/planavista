import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { PressGuard } from './press-guard';
import { toastLayer } from './sheet-layer';
import { defineElement } from '../utils/define';
import { SMOOTH, motionOf, springEasing } from './motion';

export interface ToastAction {
  id: string;
  label: string;
}

export interface Toast {
  /** A new id shows a new toast (and restarts its timer). */
  id: string;
  text: string;
  actions?: ToastAction[];
  /** 'bad' for something that failed (a revert). */
  tone?: 'plain' | 'bad';
  /** How long it stays (ms). */
  ms?: number;
}

/**
 * pv-toast: one short message at the bottom of a screen, just above the bar
 * in portrait (spec 12.3), with up to two actions such as Undo. A new toast
 * replaces the one showing. Screen readers hear it politely.
 *
 * @fires pv-toast-action - { toast, action } when an action is tapped
 * @fires pv-toast-gone - { toast } when it times out or is dismissed
 */
export class PvToast extends LitElement {
  @property({ attribute: false }) toast: Toast | null = null;
  /** A toast that appears under a finger ignores that finger's click (round 1). */
  private readonly _pressGuard = new PressGuard(this);
  private _timer: ReturnType<typeof setTimeout> | undefined;

  static styles = css`
    :host {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 12px;
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: min(560px, calc(100% - 24px));
      min-height: 48px;
      box-sizing: border-box;
      padding: 6px 8px 6px 16px;
      border-radius: 14px;
      background: var(--pv-toast-bg, #1F2023);
      color: var(--pv-toast-text, #F4F4F2);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      font-size: 0.9375rem;
      line-height: 1.3;
    }

    .toast.bad .text::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 8px;
      border-radius: 50%;
      background: #F3A5A5;
      vertical-align: 1px;
    }

    .text {
      flex: 1 1 auto;
      min-width: 0;
      padding: 6px 4px 6px 0;
    }

    button {
      flex-shrink: 0;
      min-height: 48px;
      min-width: 48px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--pv-toast-action, #A9A9FF);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    button:hover,
    button:focus-visible {
      background: rgba(255, 255, 255, 0.1);
      outline: none;
    }
  `;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  protected updated(changed: PropertyValues): void {
    const before = changed.get('toast') as Toast | null | undefined;
    if (!changed.has('toast') || before?.id === this.toast?.id) return;
    clearTimeout(this._timer);
    const toast = this.toast;
    if (!toast) return;
    this._pressGuard.arm();
    // Above whatever was open when it appeared, under whatever opens after (round 2).
    this.style.zIndex = String(toastLayer());
    const box = this.renderRoot.querySelector<HTMLElement>('.toast');
    if (box) {
      if (motionOf(this) === 'reduced') box.animate({ opacity: [0, 1] }, { duration: 150 });
      else {
        const spring = springEasing(SMOOTH);
        box.animate({ transform: ['translateY(16px)', 'translateY(0)'], opacity: [0, 1] }, { duration: spring.duration, easing: spring.easing });
      }
    }
    this._timer = setTimeout(() => this._gone(toast), toast.ms ?? 5000);
  }

  render() {
    const toast = this.toast;
    if (!toast) return nothing;
    return html`
      <div class="toast ${toast.tone === 'bad' ? 'bad' : ''}" role="status" aria-live="polite">
        <span class="text">${toast.text}</span>
        ${(toast.actions ?? []).map(action => html`
          <button type="button" @click=${() => this._act(toast, action)}>${action.label}</button>
        `)}
      </div>
    `;
  }

  private _act(toast: Toast, action: ToastAction): void {
    clearTimeout(this._timer);
    this.dispatchEvent(new CustomEvent('pv-toast-action', { detail: { toast, action: action.id }, bubbles: true, composed: true }));
  }

  private _gone(toast: Toast): void {
    this.dispatchEvent(new CustomEvent('pv-toast-gone', { detail: { toast }, bubbles: true, composed: true }));
  }
}

defineElement('pv-toast', PvToast);
