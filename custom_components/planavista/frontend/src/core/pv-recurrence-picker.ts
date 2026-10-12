import { LitElement, html, css, nothing } from 'lit';
import { segmentedStyles } from '../styles/controls';
import { property } from 'lit/decorators.js';
import { defineElement } from '../utils/define';
import { Freq, RecurrenceValue, WEEKDAYS, Weekday, ordinal, recurrenceSummary, weekdayOf } from './recurrence';

const DAY_LETTERS: Record<Weekday, [string, string]> = {
  MO: ['M', 'Monday'], TU: ['T', 'Tuesday'], WE: ['W', 'Wednesday'], TH: ['T', 'Thursday'], FR: ['F', 'Friday'],
  SA: ['S', 'Saturday'], SU: ['S', 'Sunday'],
};
const UNITS: Record<Freq, [string, string]> = { DAILY: ['day', 'days'], WEEKLY: ['week', 'weeks'], MONTHLY: ['month', 'months'] };

/**
 * pv-recurrence-picker: how something repeats, in the subset the engine
 * follows (spec 14.4): every day, week, or month; every N; the days of the
 * week or the day of the month; when it starts; and when it ends (never,
 * after a number of times, or on a date), with a line that says it back
 * ("Every Saturday until November 30: 7 times."). Shared, so the calendar
 * can reuse it for its own repeating events.
 *
 * @fires pv-recurrence-change - detail: the new RecurrenceValue
 */
export class PvRecurrencePicker extends LitElement {
  @property({ attribute: false }) value!: RecurrenceValue;

  static styles = [
    segmentedStyles,
    css`
    :host {
      display: block;
    }

    .group {
      border-radius: 14px;
      background: var(--pv-card-bg, #FFFFFF);
      box-shadow: inset 0 0 0 1px var(--pv-border-subtle, #E5E7EB);
      overflow: hidden;
    }

    .row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      min-height: 56px;
      padding: 8px 14px;
      box-sizing: border-box;
    }

    .row + .row {
      border-top: 1px solid var(--pv-border-subtle, #E5E7EB);
    }

    .label {
      flex: 1;
      min-width: 80px;
    }

    .row > .pv-seg {
      flex: 1 1 100%;
    }



    .stepper {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .stepper output {
      min-width: 72px;
      text-align: right;
      font-weight: 700;
    }

    .stepper button,
    .day {
      width: 44px;
      height: 44px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    .stepper button {
      border-radius: 10px;
      font-size: 1.25rem;
    }

    .stepper button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .days {
      display: flex;
      flex: 1 1 100%;
      gap: 6px;
      flex-wrap: wrap;
    }

    .day {
      border-radius: 50%;
      font-weight: 600;
    }

    .day[aria-pressed='true'] {
      background: var(--pv-accent, #6366F1);
      border-color: var(--pv-accent, #6366F1);
      color: var(--pv-on-accent, #FFFFFF);
    }

    input,
    select {
      min-height: 44px;
      padding: 0 10px;
      border-radius: 10px;
      border: 1px solid var(--pv-border-subtle, #E5E7EB);
      background: var(--pv-card-bg, #FFFFFF);
      color: inherit;
      font: inherit;
    }

    .summary {
      margin: 8px 4px 0;
      font-size: 0.8125rem;
      color: var(--pv-text-secondary, #6B7280);
    }
  `,
  ];

  render() {
    const v = this.value;
    if (!v) return nothing;
    const [one, many] = UNITS[v.freq];
    return html`
      <div class="group">
        <div class="row">
          <div class="pv-seg stretch" role="group" aria-label="Repeats">
            ${(['DAILY', 'WEEKLY', 'MONTHLY'] as Freq[]).map(freq => html`
              <button type="button" aria-pressed=${v.freq === freq ? 'true' : 'false'} @click=${() => this._freq(freq)}>
                ${freq === 'DAILY' ? 'Every day' : freq === 'WEEKLY' ? 'Every week' : 'Every month'}
              </button>
            `)}
          </div>
        </div>
        <div class="row">
          <span class="label">Every</span>
          <span class="stepper">
            <output>${v.interval} ${v.interval === 1 ? one : many}</output>
            <button type="button" aria-label="Less often" ?disabled=${v.interval <= 1}
              @click=${() => this._set({ interval: v.interval - 1 })}>−</button>
            <button type="button" aria-label="More often" ?disabled=${v.interval >= 99}
              @click=${() => this._set({ interval: v.interval + 1 })}>+</button>
          </span>
        </div>
        ${v.freq === 'WEEKLY' ? html`
          <div class="row">
            <span class="label">On</span>
            <div class="days" role="group" aria-label="Days of the week">
              ${WEEKDAYS.map(day => html`
                <button class="day" type="button" aria-label=${DAY_LETTERS[day][1]}
                  aria-pressed=${v.byday.includes(day) ? 'true' : 'false'} @click=${() => this._toggleDay(day)}>
                  ${DAY_LETTERS[day][0]}
                </button>
              `)}
            </div>
          </div>
        ` : nothing}
        ${v.freq === 'MONTHLY' ? html`
          <div class="row">
            <label class="label" for="monthday">On the</label>
            <select id="monthday" .value=${String(v.bymonthday ?? Number(v.start.slice(8, 10)))}
              @change=${(e: Event) => this._set({ bymonthday: Number((e.target as HTMLSelectElement).value) })}>
              ${Array.from({ length: 31 }, (_, i) => i + 1).map(day => html`
                <option value=${String(day)} ?selected=${(v.bymonthday ?? Number(v.start.slice(8, 10))) === day}>${ordinal(day)}</option>
              `)}
            </select>
          </div>
        ` : nothing}
        <div class="row">
          <label class="label" for="start">Starts</label>
          <input id="start" type="date" .value=${v.start}
            @change=${(e: Event) => this._start((e.target as HTMLInputElement).value)} />
        </div>
        <div class="row">
          <span class="label">Ends</span>
          <div class="pv-seg stretch" role="group" aria-label="Ends">
            ${(['never', 'count', 'until'] as const).map(ends => html`
              <button type="button" aria-pressed=${v.ends === ends ? 'true' : 'false'} @click=${() => this._set({ ends })}>
                ${ends === 'never' ? 'Never' : ends === 'count' ? 'After a number of times' : 'On a date'}
              </button>
            `)}
          </div>
        </div>
        ${v.ends === 'count' ? html`
          <div class="row">
            <span class="label">Times</span>
            <span class="stepper">
              <output>${v.count}</output>
              <button type="button" aria-label="Fewer times" ?disabled=${v.count <= 1}
                @click=${() => this._set({ count: v.count - 1 })}>−</button>
              <button type="button" aria-label="More times" ?disabled=${v.count >= 999}
                @click=${() => this._set({ count: v.count + 1 })}>+</button>
            </span>
          </div>
        ` : nothing}
        ${v.ends === 'until' ? html`
          <div class="row">
            <label class="label" for="until">End date</label>
            <input id="until" type="date" .value=${v.until} min=${v.start}
              @change=${(e: Event) => this._set({ until: (e.target as HTMLInputElement).value || v.until })} />
          </div>
        ` : nothing}
      </div>
      <p class="summary" aria-live="polite">${recurrenceSummary(v)}</p>
    `;
  }

  private _set(patch: Partial<RecurrenceValue>): void {
    this.value = { ...this.value, ...patch };
    this.dispatchEvent(new CustomEvent('pv-recurrence-change', { detail: this.value, bubbles: true, composed: true }));
  }

  private _freq(freq: Freq): void {
    const v = this.value;
    if (freq === v.freq) return;
    this._set({
      freq,
      byday: freq === 'WEEKLY' ? (v.byday.length ? v.byday : [weekdayOf(v.start)]) : [],
      bymonthday: freq === 'MONTHLY' ? v.bymonthday ?? Number(v.start.slice(8, 10)) : null,
    });
  }

  private _toggleDay(day: Weekday): void {
    const days = this.value.byday.includes(day) ? this.value.byday.filter(d => d !== day) : [...this.value.byday, day];
    this._set({ byday: WEEKDAYS.filter(d => days.includes(d)) });
  }

  private _start(start: string): void {
    if (!start) return;
    this._set({ start, until: this.value.until < start ? start : this.value.until });
  }
}

defineElement('pv-recurrence-picker', PvRecurrencePicker);
