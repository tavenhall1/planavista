import { describe, expect, it } from 'vitest';
import { appearanceSettings } from '../src/core/appearance';
import { appearanceDependencies, sunOf } from '../src/core/appearance-deps';

describe('sunOf', () => {
  it('reads the state and the next sunrise and sunset', () => {
    expect(sunOf({
      'sun.sun': { state: 'above_horizon', attributes: { next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-13T23:31:00+00:00', elevation: 20 } },
    })).toEqual({ state: 'above_horizon', next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-13T23:31:00+00:00' });
  });

  it('gives null without a sun, and ignores times that are not text', () => {
    expect(sunOf(undefined)).toBeNull();
    expect(sunOf({})).toBeNull();
    expect(sunOf({ 'sun.sun': { state: 'below_horizon', attributes: { next_rising: 5 } } }))
      .toEqual({ state: 'below_horizon', next_rising: undefined, next_setting: undefined });
  });
});

describe('appearanceDependencies', () => {
  const settings = appearanceSettings({});

  it('watches the sun only when Automatic follows it, and the theme only when it matches Home Assistant', () => {
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'sun' }))
      .toEqual({ entities: ['sun.sun'], haDarkMode: false });
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'home_assistant' }))
      .toEqual({ entities: [], haDarkMode: true });
    expect(appearanceDependencies({ ...settings, appearance: 'automatic', appearance_switch: 'schedule' }))
      .toEqual({ entities: [], haDarkMode: false });
    expect(appearanceDependencies({ ...settings, appearance: 'dark' })).toEqual({ entities: [], haDarkMode: false });
  });
});
