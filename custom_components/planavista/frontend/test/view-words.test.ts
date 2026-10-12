import { describe, expect, it } from 'vitest';
import { agendaNote, navLabels, newEventLabel } from '../src/modules/calendar/view-words';

const TODAY = new Date(2026, 9, 11);

describe('navLabels', () => {
  it('names the arrows for the step they take', () => {
    expect(navLabels('day')).toEqual({ prev: 'Previous day', next: 'Next day' });
    expect(navLabels('week')).toEqual({ prev: 'Previous week', next: 'Next week' });
    expect(navLabels('agenda')).toEqual({ prev: 'Previous week', next: 'Next week' });
    expect(navLabels('month')).toEqual({ prev: 'Previous month', next: 'Next month' });
  });
});

describe('newEventLabel', () => {
  it("names a day's add button for its day", () => {
    expect(newEventLabel(new Date(2026, 9, 12), TODAY)).toBe('New event on Monday, October 12');
  });
});

describe('agendaNote', () => {
  it('says Today and Tomorrow', () => {
    expect(agendaNote(new Date(2026, 9, 11), TODAY, true)).toBe('Today');
    expect(agendaNote(new Date(2026, 9, 12), TODAY, false)).toBe('Tomorrow');
  });

  it("names the month where the list starts and where a new one begins, and says nothing the day's name already says", () => {
    expect(agendaNote(new Date(2026, 9, 20), TODAY, true)).toBe('October');
    expect(agendaNote(new Date(2026, 9, 13), TODAY, false)).toBe('');
    expect(agendaNote(new Date(2026, 10, 1), TODAY, false)).toBe('November');
    expect(agendaNote(new Date(2027, 0, 1), TODAY, false)).toBe('January 2027');
  });
});
