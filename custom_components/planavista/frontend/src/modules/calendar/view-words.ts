import type { ViewType } from '../../types';
import { calendarDaysBetween } from '../../utils/date-utils';
import { longDate } from './event-words';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** What the toolbar's arrows are called (spec 11.8: a control without words still has a name). Agenda steps a week. */
export function navLabels(view: ViewType): { prev: string; next: string } {
  switch (view) {
    case 'day':
      return { prev: 'Previous day', next: 'Next day' };
    case 'month':
      return { prev: 'Previous month', next: 'Next month' };
    default:
      return { prev: 'Previous week', next: 'Next week' };
  }
}

/** A day's add button, named for its day: "New event on Monday, October 12". */
export function newEventLabel(day: Date, now: Date): string {
  return `New event on ${longDate(day, now)}`;
}

/**
 * The quiet word beside an Agenda day's name ("Tue 13"): Today, Tomorrow,
 * or the month where the list starts or a new one begins; otherwise
 * nothing, since the day's name already says it.
 */
export function agendaNote(day: Date, today: Date, first: boolean): string {
  const ahead = calendarDaysBetween(today, day);
  if (ahead === 0) return 'Today';
  if (ahead === 1) return 'Tomorrow';
  if (!first && day.getDate() !== 1) return '';
  const month = MONTHS[day.getMonth()];
  return day.getFullYear() === today.getFullYear() ? month : `${month} ${day.getFullYear()}`;
}
