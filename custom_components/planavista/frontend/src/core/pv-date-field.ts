import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { pickerStyles } from '../styles/pickers';
import { dateLabel, shiftMonth } from './pickers';
import { monthGrid } from './picker-views';

/**
 * pv-date-field: a date that opens the shared month grid in place, the one
 * way dates are picked outside the event editor (milestone 8, spec 3.11).
 * It sets its own `value` and fires a plain `change`, so a handler that reads
 * the target's value (as for a date input) works unchanged. Escape closes the
 * grid without closing the sheet around it.
 *
 * @fires change - the value ("YYYY-MM-DD") changed
 */
export class PvDateField extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) min = '';
  @property({ type: String }) max = '';
  @property({ type: String }) placeholder = 'Pick a date';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private _open = false;
  @state() private _year = 0;
  @state() private _month = 0;

  static styles = [
    pickerStyles,
    css`
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .panel {
        margin-top: 6px;
        padding: 8px;
        border: 1px solid var(--pv-border, #E7E7E3);
        border-radius: 12px;
        background: var(--pv-card-bg, #FFFFFF);
        width: max-content;
        max-width: 100%;
        box-sizing: border-box;
      }
    `,
  ];

  render() {
    return html`
      <button class="picker-field" type="button" aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${this.getAttribute('aria-label') ?? nothing} ?disabled=${this.disabled} @click=${this._toggle}>
        <ha-icon icon="mdi:calendar"></ha-icon>
        <span class=${this.value ? '' : 'placeholder'}>${this.value ? dateLabel(this.value) : this.placeholder}</span>
      </button>
      ${this._open ? html`
        <div class="panel" @keydown=${this._key}>
          ${monthGrid({
            year: this._year, month: this._month, selected: this.value, min: this.min || undefined, max: this.max || undefined,
            onPick: day => this._pick(day),
            onPrev: () => this._step(-1),
            onNext: () => this._step(1),
          })}
        </div>
      ` : nothing}
    `;
  }

  private _toggle = (): void => {
    this._open = !this._open;
    if (!this._open) return;
    const at = this.value || this.min || '';
    const now = new Date();
    const [y, m] = at ? at.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
    this._year = y;
    this._month = m - 1;
    void this.updateComplete.then(() => {
      const root = this.renderRoot;
      (root.querySelector<HTMLElement>('.picker-day.selected') ?? root.querySelector<HTMLElement>('.picker-day.today')
        ?? root.querySelector<HTMLElement>('.picker-day:not([disabled])'))?.focus();
    });
  };

  private _step(delta: number): void {
    const next = shiftMonth(this._year, this._month, delta);
    this._year = next.year;
    this._month = next.month;
  }

  private _pick(day: string): void {
    this.value = day;
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

defineElement('pv-date-field', PvDateField);
