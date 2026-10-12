import { describe, expect, it } from 'vitest';
import { agendaEmpty, agendaNote, navLabels, newEventLabel } from '../src/modules/calendar/view-words';

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

describe('agendaEmpty', () => {
  it('says the next days when the list starts today', () => {
    expect(agendaEmpty(new Date(2026, 9, 11), 14, TODAY)).toEqual({
      heading: 'Nothing coming up',
      body: 'Nothing is on the calendar for the next 14 days.',
    });
    // After Look further ahead.
    expect(agendaEmpty(new Date(2026, 9, 11), 28, TODAY).body).toBe('Nothing is on the calendar for the next 28 days.');
  });

  it('names the dates once the arrows have moved the list, so this week is never called empty', () => {
    expect(agendaEmpty(new Date(2026, 9, 18), 14, TODAY)).toEqual({
      heading: 'Nothing coming up',
      body: 'Nothing is on the calendar from Sunday, October 18 to Saturday, October 31.',
    });
    expect(agendaEmpty(new Date(2026, 11, 27), 14, TODAY).body)
      .toBe('Nothing is on the calendar from Sunday, December 27 to Saturday, January 9, 2027.');
  });

  it("doesn't say coming up for days that are over, or partly over", () => {
    expect(agendaEmpty(new Date(2026, 8, 20), 14, TODAY)).toEqual({
      heading: 'Nothing on the calendar',
      body: 'Nothing was on the calendar from Sunday, September 20 to Saturday, October 3.',
    });
    expect(agendaEmpty(new Date(2026, 9, 4), 14, TODAY)).toEqual({
      heading: 'Nothing on the calendar',
      body: 'Nothing is on the calendar from Sunday, October 4 to Saturday, October 17.',
    });
  });
});
