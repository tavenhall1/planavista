import { describe, expect, it } from 'vitest';
import { matchedInk, toOklch } from '../src/core/color';
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
