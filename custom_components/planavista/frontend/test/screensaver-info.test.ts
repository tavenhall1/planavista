import { describe, expect, it } from 'vitest';
import { conditionWords, screensaverInfo } from '../src/modules/screensaver/info';
import type { DayEvent } from '../src/modules/chores/calendar-ties';
import { MEMBERS, board, column, item } from './chores-fixtures';

const at = (h: number, m = 0) => new Date(2026, 9, 15, h, m);
const event = (title: string, start: Date, end: Date, member: string | null = null): DayEvent =>
  ({ title, start, end, calendar: 'calendar.test_alex', member });

describe('the screensaver: what it writes over the sky (spec 3.3)', () => {
  it('shows the time, the date, and the weather', () => {
    const info = screensaverInfo({
      now: at(15, 7), format: '12h', events: [], members: [], board: null,
      weather: { state: 'partlycloudy', attributes: { temperature: 59.6 } },
    });
    expect(info).toMatchObject({ time: '3:07', ampm: 'PM', date: 'Thursday, October 15', weather: '60° Partly cloudy' });
    expect(screensaverInfo({ now: at(9, 5), format: '24h', events: [], members: [], board: null }).time).toBe('09:05');
    expect(screensaverInfo({ now: at(9, 5), format: '24h', events: [], members: [], board: null }).ampm).toBeNull();
  });

  it('leaves out weather it cannot read', () => {
    const info = screensaverInfo({ now: at(9), format: '12h', events: [], members: [], board: null, weather: { state: 'unavailable', attributes: {} } });
    expect(info.weather).toBeNull();
    expect(conditionWords('lightning-rainy')).toBe('Thunderstorms');
    expect(conditionWords('dust-storm')).toBe('Dust storm');
  });

  it("lists what's on now, then what's next, three at most", () => {
    const events = [
      event('Breakfast', at(7), at(8)),
      event('Swim lesson', at(15), at(16), 'casey'),
      event('Piano', at(16, 30), at(17)),
      event('Dinner', at(18), at(19)),
      event('Story time', at(20), at(20, 30)),
    ];
    const info = screensaverInfo({ now: at(15, 20), format: '12h', events, members: [], board: null });
    expect(info.events.map(e => [e.when, e.title, e.now])).toEqual([
      ['Until 4:00 PM', 'Swim lesson', true], ['4:30 PM', 'Piano', false], ['6:00 PM', 'Dinner', false],
    ]);
    expect(info.nothingElse).toBe(false);
    expect(screensaverInfo({ now: at(21), format: '12h', events, members: [], board: null }).nothingElse).toBe(true);
    expect(screensaverInfo({ now: at(21), format: '12h', events: [], members: [], board: null }).nothingElse).toBe(false);
  });

  it("says when what's on now ends, naming the day when it isn't today", () => {
    const tomorrow = new Date(2026, 9, 16, 17);
    const saturday = new Date(2026, 9, 17, 17);
    const later = new Date(2026, 9, 30, 9);
    const when = (end: Date) => screensaverInfo({ now: at(15), format: '12h', events: [event('Trip', at(9), end)], members: [], board: null }).events[0].when;
    expect(when(at(16, 30))).toBe('Until 4:30 PM');
    expect(when(new Date(2026, 9, 16))).toBe('Until midnight');
    expect(when(tomorrow)).toBe('Until tomorrow 5:00 PM');
    expect(when(saturday)).toBe('Until Sat 5:00 PM');
    expect(when(later)).toBe('Until Oct 30');
  });

  it('lists an event on two calendars once, as the calendar draws it', () => {
    const blairs = { ...event('Test 2', at(9, 45), at(10), 'blair'), calendar: 'calendar.test_blair' };
    const events = [event('Test 2', at(9, 45), at(10), 'alex'), blairs, event('Test 3', at(11, 45), at(12)), event('Test 4', at(13), at(14))];
    const info = screensaverInfo({ now: at(9), format: '12h', events, members: [], board: null });
    expect(info.events.map(e => e.title)).toEqual(['Test 2', 'Test 3', 'Test 4']);
  });

  it('draws a ring for each person with chores today, counting waiting as done', () => {
    const [, , casey, dana] = MEMBERS;
    const caseyItems = [item('a|casey|day:2026-10-13|0', { status: 'done' }), item('b|casey|day:2026-10-13|0', { status: 'pending' }), item('c|casey|day:2026-10-13|0')];
    const feed = board({ casey: column(caseyItems), dana: column([]) });
    const info = screensaverInfo({ now: at(15), format: '12h', events: [], members: [casey, dana], board: feed });
    expect(info.rings).toEqual([{ id: 'casey', initial: 'C', name: 'Casey', done: 2, due: 3 }]);
  });
});
