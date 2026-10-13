import { describe, expect, it } from 'vitest';
import { darkTint, lightTint, matchedInk, toOklch } from '../src/core/color';
import { withModeColors } from '../src/modules/calendar/mode-colors';
import type { PlanaVistaData } from '../src/types';

const data = {
  calendars: [{ entity_id: 'calendar.test_alex', display_name: 'Alex', color: '#F94144', color_light: '#FDBDBE', icon: '', person_entity: '', visible: true }],
  events: [{ summary: 'Dentist', start: '', end: '', calendar_entity_id: 'calendar.test_alex', calendar_name: 'Alex', calendar_color: '#F94144', calendar_color_light: '#FDBDBE' }],
  display: {},
} as unknown as PlanaVistaData;

describe('withModeColors', () => {
  it('hands back the same data in light mode', () => {
    expect(withModeColors(data, 'light')).toBe(data);
    expect(withModeColors(null, 'dark')).toBeNull();
  });

  it('brightens people and darkens their tints in dark mode', () => {
    const dark = withModeColors(data, 'dark')!;
    expect(dark.calendars[0].color).toBe(matchedInk('#F94144'));
    expect(toOklch(dark.calendars[0].color_light).l).toBeCloseTo(0.255, 2);
    expect(dark.events[0].calendar_color).toBe(dark.calendars[0].color);
    expect(dark.events[0].calendar_color_light).toBe(dark.calendars[0].color_light);
    expect(data.calendars[0].color).toBe('#F94144');
  });
});

describe('one color per person (milestone 8, spec 3.1)', () => {
  const linked = {
    calendars: [
      { entity_id: 'calendar.test_alex', display_name: 'Alex', color: '#F94144', color_light: '#FDBDBE', member_id: 'alex', visible: true },
      { entity_id: 'calendar.family', display_name: 'Family', color: '#90BE6D', color_light: '#D8E8CC', member_id: null, visible: true },
    ],
    events: [
      { summary: 'Dentist', start: '', end: '', calendar_entity_id: 'calendar.test_alex', calendar_name: 'Alex', calendar_color: '#F94144', calendar_color_light: '#FDBDBE' },
      { summary: 'Dinner', start: '', end: '', calendar_entity_id: 'calendar.family', calendar_name: 'Family', calendar_color: '#90BE6D', calendar_color_light: '#D8E8CC' },
    ],
    display: {},
  } as unknown as PlanaVistaData;
  const people = [{ id: 'alex', color: '#277DA1', color_dark: null }];

  it("a calendar that belongs to someone draws their color and a tint made from it", () => {
    const light = withModeColors(linked, 'light', people)!;
    expect(light.calendars[0].color).toBe('#277DA1');
    expect(light.calendars[0].color_light).toBe(lightTint('#277DA1'));
    expect(light.events[0].calendar_color).toBe('#277DA1');
    expect(light.events[0].calendar_color_light).toBe(lightTint('#277DA1'));
  });

  it('a calendar that belongs to nobody keeps its own color', () => {
    const light = withModeColors(linked, 'light', people)!;
    expect(light.calendars[1].color).toBe('#90BE6D');
    expect(light.events[1].calendar_color_light).toBe('#D8E8CC');
  });

  it("dark mode brightens a person's color as the board does, their own dark color first", () => {
    expect(withModeColors(linked, 'dark', people)!.calendars[0].color).toBe(matchedInk('#277DA1'));
    const chosen = withModeColors(linked, 'dark', [{ id: 'alex', color: '#277DA1', color_dark: '#7FC8F8' }])!;
    expect(chosen.calendars[0].color).toBe('#7FC8F8');
    expect(chosen.events[0].calendar_color_light).toBe(darkTint('#277DA1'));
  });

  it("a person's tint is the swatches' own: 65% of the way to white", () => {
    expect(lightTint('#001219')).toBe('#a6acaf');
    expect(lightTint('#F94144')).toBe('#fdbdbe');
  });
});
