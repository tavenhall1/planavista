import { describe, expect, it } from 'vitest';
import type { CalendarConfig } from '../src/types';
import { bannersOf, calendarLabel, screenOf, unreachableText } from '../src/modules/calendar/calendar-states';

function calendar(entity_id: string, display_name: string, extra: Partial<CalendarConfig> = {}): CalendarConfig {
  return {
    entity_id, display_name, color: '#F94144', color_light: '#FDBDBE', icon: 'mdi:account',
    person_entity: '', member_id: 'm-' + display_name.toLowerCase(), visible: true, state: 'off', ...extra,
  };
}

const ALEX = calendar('calendar.test_alex', 'Alex');
const BLAIR = calendar('calendar.test_blair', 'Blair');
const NONE = new Set<string>();

describe('screenOf', () => {
  it('shows a skeleton while Home Assistant is starting and the data is not there yet', () => {
    expect(screenOf({ sensorState: 'unavailable', running: false, calendars: [], hidden: NONE })).toBe('loading');
    expect(screenOf({ sensorState: undefined, running: false, calendars: [], hidden: NONE })).toBe('loading');
  });

  it("says it can't load once Home Assistant runs and the data still isn't there", () => {
    expect(screenOf({ sensorState: 'unavailable', running: true, calendars: [], hidden: NONE })).toBe('unavailable');
    expect(screenOf({ sensorState: 'unknown', running: true, calendars: [ALEX], hidden: NONE })).toBe('unavailable');
  });

  it('tells a household with no calendars yet, and one that hid them all, what to do', () => {
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [], configured: 0, hidden: NONE })).toBe('no-calendars');
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [ALEX, BLAIR], hidden: new Set([ALEX.entity_id, BLAIR.entity_id]) }))
      .toBe('all-hidden');
  });

  it("doesn't call calendars that are set up but not loaded yet missing, nor ask for new ones", () => {
    // Home Assistant starting: the sensor has no rows until the calendar entities arrive.
    expect(screenOf({ sensorState: 'configured', running: false, calendars: [], configured: 2, hidden: NONE })).toBe('loading');
    expect(screenOf({ sensorState: 'configured', running: false, calendars: [], configured: 0, hidden: NONE })).toBe('loading');
    // Running, and still none of them there: their integration is down.
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [], configured: 2, hidden: NONE })).toBe('unavailable');
  });

  it('shows the views when there is something to show', () => {
    expect(screenOf({ sensorState: 'configured', running: true, calendars: [ALEX, BLAIR], hidden: new Set([ALEX.entity_id]) })).toBe('ready');
  });
});

describe('calendarLabel', () => {
  it("names a person's calendar by its owner, and another by its own name", () => {
    expect(calendarLabel(ALEX)).toBe("Alex's calendar");
    expect(calendarLabel(calendar('calendar.family', 'Family', { member_id: null }))).toBe('the Family calendar');
  });
});

describe('unreachableText', () => {
  it('says what happened and what to do next', () => {
    expect(unreachableText(["Alex's calendar"])).toBe(
      "Alex's calendar can't be reached, so its events may be missing. Check its integration in Settings, Devices and services.",
    );
    expect(unreachableText(["Alex's calendar", 'the Family calendar'])).toBe(
      "Alex's calendar and the Family calendar can't be reached, so their events may be missing. Check their integrations in Settings, Devices and services.",
    );
  });
});

describe('bannersOf', () => {
  it('says when Home Assistant is out of reach', () => {
    expect(bannersOf({ connected: false, calendars: [ALEX], hidden: NONE })).toEqual([
      { kind: 'offline', text: "Can't reach Home Assistant. These are the last events it sent, and they update when it's back." },
    ]);
  });

  it("names the shown calendars that can't be reached or whose events didn't arrive", () => {
    const banners = bannersOf({
      connected: true,
      calendars: [calendar('calendar.test_alex', 'Alex', { state: 'unavailable' }), calendar('calendar.test_blair', 'Blair', { fetch_failed: true })],
      hidden: NONE,
    });
    expect(banners).toEqual([{ kind: 'unreachable', text: unreachableText(["Alex's calendar", "Blair's calendar"]) }]);
  });

  it("doesn't call a calendar unreachable while Home Assistant is still starting", () => {
    const starting = bannersOf({ connected: true, running: false, calendars: [calendar('calendar.test_alex', 'Alex', { state: 'unavailable' })], hidden: NONE });
    expect(starting).toEqual([]);
  });

  it('leaves out a hidden calendar, and says nothing when all is well', () => {
    expect(bannersOf({ connected: true, calendars: [calendar('calendar.test_alex', 'Alex', { state: 'unavailable' })], hidden: new Set(['calendar.test_alex']) }))
      .toEqual([]);
    expect(bannersOf({ connected: true, calendars: [ALEX, BLAIR], hidden: NONE })).toEqual([]);
  });
});
