import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '../src/types';
import {
  calendarCan, deleteFailedText, deleteQuestion, eventName, eventStatus, eventWhen, longDate, namesList,
} from '../src/modules/calendar/event-words';

const NOW = new Date(2026, 9, 12, 8, 50); // Mon Oct 12, 8:50 AM

function event(start: string, end: string, summary = 'Team standup'): CalendarEvent {
  return { summary, start, end, calendar_entity_id: 'calendar.test_blair', calendar_name: 'Blair', calendar_color: '#F3722C' } as CalendarEvent;
}

describe('longDate', () => {
  it('names the weekday and month, and the year only when it is not this one', () => {
    expect(longDate(new Date(2026, 9, 12), NOW)).toBe('Monday, October 12');
    expect(longDate(new Date(2027, 0, 4), NOW)).toBe('Monday, January 4, 2027');
  });
});

describe('eventWhen', () => {
  it('gives a timed event its day and its times', () => {
    expect(eventWhen(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00'), '12h', NOW))
      .toEqual({ date: 'Monday, October 12', time: '9:00 AM – 9:30 AM' });
  });

  it('keeps an event that ends at midnight on its own day', () => {
    expect(eventWhen(event('2026-10-12T23:00:00-05:00', '2026-10-13T00:00:00-05:00'), '12h', NOW).time).toBe('11:00 PM – 12:00 AM');
  });

  it('names the day a timed event ends on when it runs overnight', () => {
    expect(eventWhen(event('2026-10-12T21:00:00-05:00', '2026-10-13T07:00:00-05:00'), '12h', NOW).time)
      .toBe('9:00 PM – Tue, Oct 13, 7:00 AM');
  });

  it('says All day, and through which day for a longer one', () => {
    expect(eventWhen(event('2026-10-12', '2026-10-13'), '12h', NOW)).toEqual({ date: 'Monday, October 12', time: 'All day' });
    expect(eventWhen(event('2026-10-12', '2026-10-15'), '12h', NOW).time).toBe('All day, through Wednesday, October 14');
  });

  it('uses the 24-hour clock when the household does', () => {
    expect(eventWhen(event('2026-10-12T14:00:00-05:00', '2026-10-12T15:30:00-05:00'), '24h', NOW).time).toBe('14:00 – 15:30');
  });
});

describe('eventStatus', () => {
  const standup = event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00');

  it('says In N min in amber for the last 15 minutes before it starts', () => {
    expect(eventStatus(standup, NOW)).toEqual({ words: 'In 10 min', tone: 'time' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 8, 59, 30))).toEqual({ words: 'In 1 min', tone: 'time' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 8, 44))).toBeNull();
  });

  it('says Now while it runs, and nothing once it has ended', () => {
    expect(eventStatus(standup, new Date(2026, 9, 12, 9, 0))).toEqual({ words: 'Now', tone: 'neutral' });
    expect(eventStatus(standup, new Date(2026, 9, 12, 9, 30))).toBeNull();
  });

  it('counts the days through a multi-day all-day event', () => {
    const trip = event('2026-10-11', '2026-10-14', 'Weekend trip');
    expect(eventStatus(trip, NOW)).toEqual({ words: 'Day 2 of 3', tone: 'neutral' });
    expect(eventStatus(trip, new Date(2026, 9, 14, 9))).toBeNull();
    expect(eventStatus(event('2026-10-12', '2026-10-13'), NOW)).toBeNull();
  });
});

describe('names in sentences', () => {
  it('joins names the way people write them', () => {
    expect(namesList(['Alex'])).toBe('Alex');
    expect(namesList(['Alex', 'Blair'])).toBe('Alex and Blair');
    expect(namesList(['Alex', 'Blair', 'Casey'])).toBe('Alex, Blair, and Casey');
  });

  it('calls an event with no title "this event"', () => {
    expect(eventName({ summary: '  ' })).toBe('this event');
  });
});

describe('deleteQuestion', () => {
  it('asks by name, without quotes (spec 11.7)', () => {
    expect(deleteQuestion(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00', 'Dentist'), [])).toEqual({
      heading: 'Delete Dentist?', body: '', shared: false,
    });
  });

  it("says whose calendars a shared event is on", () => {
    expect(deleteQuestion(event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00'), ['Blair', 'Casey'])).toEqual({
      heading: 'Delete Team standup?', body: "It's on Blair's and Casey's calendars.", shared: true,
    });
  });
});

describe('deleteFailedText', () => {
  const standup = event('2026-10-12T09:00:00-05:00', '2026-10-12T09:30:00-05:00');

  it('says what happened and what to do next', () => {
    expect(deleteFailedText(standup, [], false)).toBe("Couldn't delete Team standup. Check that Home Assistant is reachable, then try again.");
  });

  it('names the calendars a delete for everyone missed', () => {
    expect(deleteFailedText(standup, ['Casey'], true)).toBe("Couldn't delete Team standup from Casey's calendar. Try again in a moment.");
    expect(deleteFailedText(standup, ['Blair', 'Casey'], true)).toBe("Couldn't delete Team standup from Blair's and Casey's calendars. Try again in a moment.");
  });
});

describe('calendarCan', () => {
  it("reads what a calendar lets PlanaVista change from its supported features", () => {
    expect(calendarCan(7)).toEqual({ delete: true, edit: true });
    expect(calendarCan(3)).toEqual({ delete: true, edit: true });
    expect(calendarCan(0)).toEqual({ delete: false, edit: false });
    expect(calendarCan(undefined)).toEqual({ delete: true, edit: true });
  });
});
