import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { pickerStyles } from '../styles/pickers';
import { timeLabel, timeSlots } from './pickers';
import { timeList } from './picker-views';

/**
 * pv-time-field: a time that opens the shared time list in place, the one
 * way times are picked outside the event editor (milestone 8, spec 3.11).
 * `slots` limits the choices (a setting's allowed times); `clearable` adds
 * "No time". It sets its own `value` and fires a plain `change`, like a time
 * input or a select. Escape closes the list without closing the sheet.
 *
 * @fires change - the value ("HH:MM", or "" when cleared) changed
 */
export class PvTimeField extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) format: '12h' | '24h' = '12h';
  @property({ attribute: false }) slots: readonly string[] | null = null;
  @property({ type: Boolean }) clearable = false;
  @property({ type: String }) placeholder = 'Pick a time';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private _open = false;

  static styles = [
    pickerStyles,
    css`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        max-height: 280px;
        min-width: 160px;
        overflow-y: auto;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        scrollbar-width: thin;
      }
    `,
  ];

  render() {
    return html`
      <button class="picker-field" type="button" aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${this.getAttribute('aria-label') ?? nothing} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:clock-outline"></ha-icon>
        <span class=${this.value ? '' : 'placeholder'}>${this.value ? timeLabel(this.value, this.format) : this.placeholder}</span>
      </button>
      ${this._open ? html`
        <div class="panel" @keydown=${this._key}>
          ${this.clearable ? html`<button type="button" class="time-slot ${this.value ? '' : 'selected'}" @click=${() => this._pick('')}>No time</button>` : nothing}
          ${timeList({ slots: this.slots ?? timeSlots(), selected: this.value, format: this.format, onPick: time => this._pick(time) })}
        </div>
      ` : nothing}
    `;
  }

  private _toggle = (): void => {
    this._open = !this._open;
    if (!this._open) return;
    void this.updateComplete.then(() => {
      const panel = this.renderRoot.querySelector<HTMLElement>('.panel');
      const selected = panel?.querySelector<HTMLElement>('.time-slot.selected');
      if (panel && selected) panel.scrollTop = selected.offsetTop - panel.clientHeight / 2 + selected.clientHeight / 2;
      (selected ?? panel?.querySelector<HTMLElement>('.time-slot'))?.focus({ preventScroll: true });
    });
  };

  private _pick(time: string): void {
    this.value = time;
    this._open = false;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  }

  private _key = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this._open = false;
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>('.picker-field')?.focus());
  };
}

defineElement('pv-time-field', PvTimeField);
