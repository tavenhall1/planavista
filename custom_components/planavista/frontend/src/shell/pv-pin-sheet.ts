import { LitElement, html, css, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { defineElement } from '../utils/define';
import { buttonStyles } from '../styles/shared';
import { sheetStyles } from '../styles/sheet';
import { trapTab } from '../core/focus';
import { Member } from '../core/household';
import { HouseholdApi, errorCode } from '../core/household-client';
import {
  MAX_PIN,
  PinEntry,
  canFinishChoosing,
  isComplete,
  keypadDigits,
  pressDelete,
  pressDigit,
  startEntry,
} from '../core/keypad';
import type { Layout } from '../core/layout';
import { saveErrorMessage } from '../core/page-host';
import '../core/pv-member-avatar';
import { SheetMotion, motionOf } from './sheet-motion';

type Step = 'pick' | 'enter' | 'choose' | 'confirm';

/** "1:05" for a wait of 65 seconds. */
function formatWait(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * pv-pin-sheet: tap your face, then your PIN (spec 9.3). In unlock mode it
 * checks a PIN and reports the session; in choose mode it sets a new PIN,
 * entered twice. The digits typed never reach the DOM; the boxes only show
 * how many there are.
 *
 * Each of its events fires once the sheet has left.
 *
 * @fires pv-unlocked - { result } when a PIN was accepted
 * @fires pv-pin-set - { memberId } when a new PIN was saved
 * @fires pv-sheet-close - Cancel, Escape, a tap outside, or a drag down
 */
export class PvPinSheet extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) api!: HouseholdApi;
  @property({ type: String, reflect: true }) layout: Layout = 'landscape';
  @property({ type: String }) mode: 'unlock' | 'choose' = 'unlock';
  /** Unlock mode: who may act, in board order. */
  @property({ attribute: false }) members: Member[] = [];
  /** Unlock mode: the picker's question, such as "Who's opening Settings?". */
  @property({ type: String }) heading = '';
  /** Choose mode: whose PIN this is. */
  @property({ attribute: false }) target?: Member;
  @property({ type: Boolean }) shuffle = false;

  @state() private _step: Step = 'pick';
  @state() private _who?: Member;
  @state() private _entry: PinEntry = startEntry(null);
  @state() private _first = '';
  @state() private _message = '';
  @state() private _pausedUntil = 0;
  @state() private _now = Date.now();
  @state() private _busy = false;
  @state() private _shake = false;
  private _digits: string[] = keypadDigits(false);
  private _ticker: number | undefined;
  private _started = false;
  private _sheetMotion = new SheetMotion(this);
  private _detachDrag: (() => void) | null = null;
  private _closing = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._onKey);
    // Reduced motion: a wrong PIN fades instead of shaking (spec 11.5).
    this.toggleAttribute('reduced', motionOf(this) === 'reduced');
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKey);
    window.clearInterval(this._ticker);
    this._detachDrag?.();
    this._detachDrag = null;
  }

  protected willUpdate(_changed: PropertyValues): void {
    if (this._started) return;
    this._started = true;
    // The numbers move each time the sheet opens when Shuffle the keypad is on.
    this._digits = keypadDigits(this.shuffle);
    if (this.mode === 'choose') {
      this._step = 'choose';
      this._entry = startEntry(null);
    } else if (this.members.length === 1) {
      this._enterFor(this.members[0]);
    }
  }

  protected firstUpdated(): void {
    this.renderRoot.querySelector<HTMLElement>('.person, .key')?.focus();
    const { panel, backdrop, zone } = this._parts();
    this._sheetMotion.open(panel, backdrop);
    this._detachDrag = this._sheetMotion.attachDrag(zone, panel, this._cancel);
  }

  private _parts(): { panel: HTMLElement; backdrop: HTMLElement; zone: HTMLElement } {
    const root = this.renderRoot;
    return {
      panel: root.querySelector<HTMLElement>('.panel')!,
      backdrop: root.querySelector<HTMLElement>('.backdrop')!,
      zone: root.querySelector<HTMLElement>('.grab-zone')!,
    };
  }

  /** The one way out: the sheet leaves first, then says why (spec 12.3). */
  private async _leave(type: string, detail: Record<string, unknown>): Promise<void> {
    if (this._closing) return;
    this._closing = true;
    const { panel, backdrop } = this._parts();
    await this._sheetMotion.close(panel, backdrop);
    this._fire(type, detail);
    // A sheet its page keeps open must not stay invisible over the card, catching every tap.
    requestAnimationFrame(() => {
      if (!this.isConnected) return;
      for (const element of [panel, backdrop]) element.getAnimations().forEach(animation => animation.cancel());
      panel.style.transform = '';
      this._closing = false;
    });
  }

  static styles = [
    buttonStyles,
    sheetStyles,
    css`
      .people {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin: 16px 0 8px;
      }

      .person {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-width: 96px;
        min-height: 48px;
        padding: 10px;
        border: none;
        border-radius: 16px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }

      .person:hover,
      .person:focus-visible {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 6%, transparent);
      }

      .back {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 8px;
        border: none;
        background: transparent;
        color: var(--pv-accent-ink, var(--pv-accent, #6366F1));
        font: inherit;
        cursor: pointer;
      }

      .hint {
        margin: 0;
        text-align: center;
        color: var(--pv-text-secondary, #6B7280);
      }

      .boxes {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 18px 0 6px;
      }

      .box {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid var(--pv-text-secondary, #6B7280);
      }

      .box.filled {
        background: var(--pv-text, #1A1B1E);
        border-color: var(--pv-text, #1A1B1E);
      }

      .message {
        min-height: 1.5em;
        margin: 8px 0;
        text-align: center;
        color: var(--pv-danger, #DC2626);
        font-size: 0.9375rem;
      }

      .keypad {
        display: grid;
        grid-template-columns: repeat(3, 72px);
        justify-content: center;
        gap: 14px 22px;
        margin: 8px 0 4px;
      }

      .key {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: none;
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 8%, transparent);
        color: var(--pv-text, #1A1B1E);
        font: inherit;
        font-size: 1.75rem;
        font-weight: 500;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        user-select: none;
      }

      .key:active {
        background: color-mix(in srgb, var(--pv-text, #1A1B1E) 18%, transparent);
      }

      .key:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .key.text {
        background: transparent;
        font-size: 1rem;
      }

      .next {
        display: block;
        width: 100%;
        min-height: 48px;
        margin-top: 12px;
      }

      :host([reduced]) .boxes.shake {
        animation: pv-fade 300ms ease-in-out;
      }

      :host(:not([reduced])) .boxes.shake {
        animation: pv-shake 300ms ease-in-out;
      }

      @keyframes pv-shake {
        20%, 60% { transform: translateX(-8px); }
        40%, 80% { transform: translateX(8px); }
      }

      @keyframes pv-fade {
        50% { opacity: 0.3; }
      }
    `,
  ];

  render() {
    return html`
      <div class="backdrop" @click=${this._cancel}></div>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="pin-heading">
        <div class="grab-zone" aria-hidden="true"><div class="grab"></div></div>
        ${this._step === 'pick' ? this._renderPicker() : this._renderPad()}
      </div>
    `;
  }

  private _renderPicker() {
    return html`
      <h2 class="heading" id="pin-heading">${this.heading}</h2>
      <div class="people">
        ${this.members.map(member => html`
          <button class="person" type="button" @click=${() => this._enterFor(member)}>
            <pv-member-avatar .member=${member} .hass=${this.hass} size="64"></pv-member-avatar>
            <span>${member.name}</span>
          </button>
        `)}
      </div>
      <div class="actions">
        <button class="pv-btn pv-btn-secondary" type="button" @click=${this._cancel}>Cancel</button>
      </div>
    `;
  }

  private _renderPad() {
    const paused = this._paused();
    const heading =
      this._step === 'enter'
        ? `${this._who?.name ?? ''}, enter your PIN`
        : this._step === 'choose'
          ? `Choose a PIN for ${this.target?.name ?? ''}`
          : 'Enter it again';
    const message = paused
      ? `Too many tries. Try again in ${formatWait(this._pausedUntil - this._now)}.`
      : this._message;
    return html`
      ${this._step === 'enter' && this.members.length > 1
        ? html`<button class="back" type="button" @click=${this._backToPicker}>‹ Someone else</button>`
        : nothing}
      <h2 class="heading" id="pin-heading">${heading}</h2>
      ${this._step === 'choose' ? html`<p class="hint">4 to 6 digits.</p>` : nothing}
      <div class="boxes ${this._shake ? 'shake' : ''}" aria-hidden="true">
        ${Array.from({ length: this._entry.length }, (_, i) => html`
          <span class="box ${i < this._entry.digits.length ? 'filled' : ''}"></span>
        `)}
      </div>
      <p class="sr" aria-live="polite">${this._entry.digits.length} of ${this._entry.length} digits entered</p>
      <p class="message" role="alert">${message}</p>
      <div class="keypad">
        ${this._digits.slice(0, 9).map(digit => this._renderKey(digit, paused))}
        <button class="key text" type="button" @click=${this._cancel}>Cancel</button>
        ${this._renderKey(this._digits[9], paused)}
        <button class="key text" type="button" aria-label="Delete last digit" ?disabled=${paused} @click=${this._delete}>⌫</button>
      </div>
      ${this._step === 'choose'
        ? html`
          <button class="pv-btn pv-btn-primary next" type="button"
            ?disabled=${!canFinishChoosing(this._entry) || this._busy}
            @click=${this._next}>Next</button>
        `
        : nothing}
    `;
  }

  private _renderKey(digit: string, paused: boolean) {
    return html`
      <button class="key" type="button" ?disabled=${paused || this._busy} @click=${() => this._press(digit)}>${digit}</button>
    `;
  }

  private _enterFor(member: Member): void {
    this._who = member;
    this._step = 'enter';
    this._message = '';
    this._entry = startEntry(member.pin_length);
    const until = member.locked_until ? Date.parse(member.locked_until) : 0;
    if (until > Date.now()) this._pause(until);
  }

  private _backToPicker(): void {
    this._step = 'pick';
    this._who = undefined;
    this._message = '';
  }

  private _paused(): boolean {
    return this._pausedUntil > this._now;
  }

  private _pause(until: number): void {
    this._pausedUntil = until;
    this._now = Date.now();
    window.clearInterval(this._ticker);
    this._ticker = window.setInterval(() => {
      this._now = Date.now();
      if (!this._paused()) window.clearInterval(this._ticker);
    }, 1000);
  }

  private _press(digit: string): void {
    if (this._busy || this._paused()) return;
    this._message = '';
    this._entry = pressDigit(this._entry, digit);
    if (this._step === 'enter' && isComplete(this._entry)) {
      void this._check();
    } else if (this._step === 'choose' && this._entry.digits.length === MAX_PIN) {
      this._next();
    } else if (this._step === 'confirm' && isComplete(this._entry)) {
      this._next();
    }
  }

  private _delete(): void {
    this._entry = pressDelete(this._entry);
  }

  /** Choose: on to Enter it again. Enter it again: save when both match. */
  private _next(): void {
    if (this._step === 'choose') {
      if (!canFinishChoosing(this._entry)) return;
      this._first = this._entry.digits;
      this._entry = startEntry(this._first.length);
      this._step = 'confirm';
      return;
    }
    if (this._step !== 'confirm' || !isComplete(this._entry)) return;
    if (this._entry.digits !== this._first) {
      this._restartChoosing("Those didn't match. Try again.");
      return;
    }
    void this._save(this._first);
  }

  private _restartChoosing(message: string): void {
    this._message = message;
    this._first = '';
    this._entry = startEntry(null);
    this._step = 'choose';
    this._shakeBoxes();
  }

  private async _check(): Promise<void> {
    const who = this._who;
    if (!who) return;
    this._busy = true;
    try {
      const result = await this.api.unlock(who.id, this._entry.digits);
      if (result.ok) {
        void this._leave('pv-unlocked', { result });
        return;
      }
      this._entry = startEntry(who.pin_length);
      if (result.reason === 'paused') {
        this._pause(Date.now() + (result.retry_after ?? 30) * 1000);
      } else if (result.reason === 'wrong_pin') {
        const left = result.tries_left ?? 0;
        this._message = `That's not ${who.name}'s PIN. ${left === 1 ? '1 more try' : `${left} more tries`} before a short pause.`;
      } else {
        this._message = `${who.name} has no PIN yet.`;
      }
      this._shakeBoxes();
    } catch {
      this._entry = startEntry(who.pin_length);
      this._message = "Couldn't check the PIN. Check the connection and try again.";
    } finally {
      this._busy = false;
    }
  }

  private async _save(pin: string): Promise<void> {
    const target = this.target;
    if (!target) return;
    this._busy = true;
    try {
      await this.api.setPin(target.id, pin);
      void this._leave('pv-pin-set', { memberId: target.id });
    } catch (err) {
      this._restartChoosing(saveErrorMessage(errorCode(err)));
    } finally {
      this._busy = false;
    }
  }

  private _shakeBoxes(): void {
    this._shake = true;
    window.setTimeout(() => {
      this._shake = false;
    }, 320);
  }

  private _cancel = (): void => {
    void this._leave('pv-sheet-close', {});
  };

  private _onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this._cancel();
    } else if (/^[0-9]$/.test(event.key) && this._step !== 'pick') {
      event.preventDefault();
      this._press(event.key);
    } else if (event.key === 'Backspace' && this._step !== 'pick') {
      event.preventDefault();
      this._delete();
    } else if (event.key === 'Enter' && this._step === 'choose') {
      event.preventDefault();
      this._next();
    } else {
      trapTab(this.shadowRoot!, event);
    }
  };

  private _fire(type: string, detail: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
}

defineElement('pv-pin-sheet', PvPinSheet);
