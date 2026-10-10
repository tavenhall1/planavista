import { describe, expect, it } from 'vitest';
import { resolveDisplay, themeDisplayChange } from '../src/core/display';
import type { DisplayConfig, PlanaVistaCardConfig, PlanaVistaData } from '../src/types';

const saved = (display: Partial<DisplayConfig>): PlanaVistaData => ({
  calendars: [],
  events: [],
  display: { time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light', ...display },
});
const card = (extra: Partial<PlanaVistaCardConfig> = {}): PlanaVistaCardConfig => ({ type: 'custom:planavista-card', ...extra });

describe('resolveDisplay', () => {
  it('uses defaults when neither the card nor the saved settings set anything', () => {
    expect(resolveDisplay(undefined, null)).toEqual({
      time_format: '12h', weather_entity: '', first_day: 'sunday', default_view: 'week', theme: 'light',
      theme_overrides: undefined, location_autocomplete: false,
    });
  });

  it('uses the saved settings', () => {
    const data = saved({
      time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark',
      location_autocomplete: true, theme_overrides: { accent: '#5B5BD6' },
    });
    expect(resolveDisplay(card(), data)).toEqual({
      time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark',
      theme_overrides: { accent: '#5B5BD6' }, location_autocomplete: true,
    });
  });

  it('lets the card YAML win over the saved settings', () => {
    const data = saved({ time_format: '24h', weather_entity: 'weather.home', first_day: 'monday', default_view: 'month', theme: 'dark' });
    const config = card({ time_format: '12h', weather_entity: 'weather.cabin', first_day: 'sunday', default_view: 'agenda', theme: 'minimal' });
    expect(resolveDisplay(config, data)).toMatchObject({
      time_format: '12h', weather_entity: 'weather.cabin', first_day: 'sunday', default_view: 'agenda', theme: 'minimal',
    });
  });

  it('treats the card\'s view as its default view when default_view is not set', () => {
    expect(resolveDisplay(card({ view: 'day' }), saved({ default_view: 'month' })).default_view).toBe('day');
  });
});

describe('themeDisplayChange', () => {
  it('saves the theme with its customizations', () => {
    expect(themeDisplayChange('dark', { accent: '#277DA1' })).toEqual({ theme: 'dark', theme_overrides: { accent: '#277DA1' } });
  });

  it('sends null when nothing is customized, which removes the saved customizations', () => {
    expect(themeDisplayChange('light', {})).toEqual({ theme: 'light', theme_overrides: null });
  });
});
