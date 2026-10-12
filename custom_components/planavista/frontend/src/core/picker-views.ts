import { html, TemplateResult } from 'lit';
import { dateKey, monthDays, timeLabel } from './pickers';

/** The one month grid and the one time list (milestone 8, spec 3.11). Styles: styles/pickers.ts. */

export const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export interface MonthGridOptions {
  year: number;
  /** 0 to 11. */
  month: number;
  /** "YYYY-MM-DD", or "". */
  selected: string;
  min?: string;
  max?: string;
  onPick(day: string): void;
  onPrev(): void;
  onNext(): void;
}

export function monthGrid(o: MonthGridOptions): TemplateResult {
  const today = dateKey(new Date());
  return html`
    <div class="picker-header">
      <span class="picker-month-label">${new Date(o.year, o.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
      <div class="picker-nav">
        <button class="picker-nav-btn" type="button" aria-label="Previous month" @click=${o.onPrev}>
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <button class="picker-nav-btn" type="button" aria-label="Next month" @click=${o.onNext}>
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    </div>
    <div class="picker-weekdays">${WEEKDAY_LABELS.map(d => html`<span class="picker-weekday">${d}</span>`)}</div>
    <div class="picker-days">
      ${monthDays(o.year, o.month).map(day => {
        const key = dateKey(day);
        const out = (!!o.min && key < o.min) || (!!o.max && key > o.max);
        return html`
          <button type="button"
            class="picker-day ${day.getMonth() !== o.month ? 'other-month' : ''} ${key === today ? 'today' : ''} ${key === o.selected ? 'selected' : ''}"
            aria-pressed=${key === o.selected ? 'true' : 'false'}
            aria-label=${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            ?disabled=${out} @click=${() => o.onPick(key)}><span>${day.getDate()}</span></button>
        `;
      })}
    </div>
  `;
}

export interface TimeListOptions {
  slots: readonly string[];
  /** "HH:MM", or "". */
  selected: string;
  format: '12h' | '24h';
  onPick(time: string): void;
}

export function timeList(o: TimeListOptions): TemplateResult {
  return html`${o.slots.map(slot => html`
    <button type="button" class="time-slot ${slot === o.selected ? 'selected' : ''}" aria-pressed=${slot === o.selected ? 'true' : 'false'}
      @click=${() => o.onPick(slot)}>${timeLabel(slot, o.format)}</button>
  `)}`;
}
