import { describe, expect, it } from 'vitest';
import { setupDisplayDefaults } from '../src/core/setup-defaults';
import { DisplayConfig } from '../src/types';

const DISPLAY = { time_format: '12h', weather_entity: '', first_day: 'monday', default_view: 'week', theme: 'planavista', extra: 1 } as unknown as DisplayConfig;

describe('setupDisplayDefaults', () => {
  it('takes Home Assistant’s explicit time format and first day', () => {
    expect(setupDisplayDefaults(DISPLAY, { time_format: '24', first_weekday: 'sunday' }, [])).toMatchObject({ time_format: '24h', first_day: 'sunday' });
  });

  it('keeps the saved values when Home Assistant follows the language', () => {
    expect(setupDisplayDefaults(DISPLAY, { time_format: 'language', first_weekday: 'language' }, [])).toEqual(DISPLAY);
    expect(setupDisplayDefaults(DISPLAY, { first_weekday: 'saturday' }, [])).toEqual(DISPLAY);
    expect(setupDisplayDefaults(DISPLAY, undefined, [])).toEqual(DISPLAY);
  });

  it('picks the first weather entity only when none is chosen', () => {
    expect(setupDisplayDefaults(DISPLAY, undefined, ['weather.office', 'weather.home']).weather_entity).toBe('weather.home');
    const chosen = { ...DISPLAY, weather_entity: 'weather.office' };
    expect(setupDisplayDefaults(chosen, undefined, ['weather.home']).weather_entity).toBe('weather.office');
  });
});
