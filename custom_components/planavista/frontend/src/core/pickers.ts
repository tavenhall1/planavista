/**
 * The rules behind the one date and time picker (milestone 8, spec 3.11),
 * shared by the event editor's dropdowns and the inline date and time
 * fields everywhere else. Dates are local "YYYY-MM-DD"; times "HH:MM".
 */

/** A local date as "YYYY-MM-DD". */
export function dateKey(day: Date): string {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

/** The 42 days a month grid shows: six weeks from the Sunday on or before the 1st. `month` is 0 to 11. */
export function monthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** The month `delta` months away. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const at = new Date(year, month + delta, 1);
  return { year: at.getFullYear(), month: at.getMonth() };
}

/** Every quarter hour of the day ("00:00" to "23:45"). */
export function timeSlots(stepMinutes = 15): string[] {
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
}

/** A time as the household reads it: "1:30 PM", or "13:30" with 24-hour time. */
export function timeLabel(time: string, format: '12h' | '24h'): string {
  if (!/^\d{2}:\d{2}$/.test(time)) return '';
  const [h, m] = time.split(':').map(Number);
  if (format === '24h') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** A date as the household reads it: "Tue, October 20, 2026" (the editor's and every field's label). */
/**
 * How far to scroll a sheet so a picker `height` px tall opens below a field
 * whose bottom is at `fieldBottom`, as far as the sheet can scroll (`scrollable`).
 * Opening above covered the sheet's title (round 1).
 */
export function scrollForPicker(fieldBottom: number, viewport: number, height: number, scrollable: number): number {
  const missing = height + 12 - (viewport - fieldBottom);
  return Math.max(0, Math.min(scrollable, missing));
}

export function dateLabel(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}
