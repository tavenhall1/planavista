import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AppearanceSettings,
  appearanceSettings,
  appearanceSummary,
  clockText,
  mayAutoSwitch,
  resolveMode,
  sunSummary,
  transitionKind,
  withCardTheme,
} from '../src/core/appearance';

// Shared with the backend's tests/test_appearance.py.
const FIXTURE = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/appearance_cases.json', import.meta.url), 'utf-8')) as {
  cases: Array<{ name: string; display: Record<string, unknown>; settings: AppearanceSettings }>;
};

const DEFAULTS = appearanceSettings({});
const auto = (changes: Partial<AppearanceSettings>): AppearanceSettings => ({ ...DEFAULTS, appearance: 'automatic', ...changes });
// Tuesday, October 13, 2026, America/Chicago (UTC-5 until November 1).
const at = (h: number, m = 0, day = 13, month = 9) => new Date(2026, month, day, h, m);
const DAY = { state: 'above_horizon', next_setting: '2026-10-13T23:31:00+00:00', next_rising: '2026-10-14T12:12:00+00:00' };
const NIGHT = { state: 'below_horizon', next_rising: '2026-10-14T12:12:00+00:00', next_setting: '2026-10-14T23:30:00+00:00' };

describe('appearanceSettings', () => {
  it.each(FIXTURE.cases.map(c => [c.name, c] as const))('%s', (_name, c) => {
    expect(appearanceSettings(c.display)).toEqual(c.settings);
  });

  it('starts a display with nothing saved on PlanaVista Light', () => {
    expect(appearanceSettings(undefined)).toEqual(appearanceSettings({ theme: 'planavista' }));
    expect(DEFAULTS.appearance).toBe('light');
  });
});

describe('withCardTheme', () => {
  it('keeps 1.1.0 card themes: light and dark fix the mode, names pick the theme', () => {
    const household = auto({ theme_pair: 'minimal' });
    expect(withCardTheme(household, 'dark')).toMatchObject({ theme_pair: 'planavista', appearance: 'dark' });
    expect(withCardTheme(household, 'light')).toMatchObject({ theme_pair: 'planavista', appearance: 'light' });
    expect(withCardTheme(household, 'modern')).toMatchObject({ theme_pair: 'vibrant', appearance: 'automatic' });
    expect(withCardTheme(household, 'planavista')).toMatchObject({ theme_pair: 'planavista', appearance: 'automatic' });
    expect(withCardTheme(household, undefined)).toBe(household);
    expect(withCardTheme(household, 'sepia')).toBe(household);
  });
});

describe('resolveMode', () => {
  it('shows Light and Dark as they are', () => {
    expect(resolveMode({ ...DEFAULTS, appearance: 'dark' }, { now: at(12) })).toEqual({ mode: 'dark', next: null, sunMissing: false });
  });

  it('follows the sun: light until sunset, dark until sunrise', () => {
    expect(resolveMode(auto({}), { now: at(16, 10), sun: DAY })).toEqual({
      mode: 'light', next: new Date('2026-10-13T23:31:00Z'), sunMissing: false,
    });
    expect(resolveMode(auto({}), { now: at(19), sun: NIGHT })).toEqual({
      mode: 'dark', next: new Date('2026-10-14T12:12:00Z'), sunMissing: false,
    });
  });

  it('uses the schedule times when Home Assistant has no sun (spec 15.4)', () => {
    expect(resolveMode(auto({}), { now: at(22), sun: null })).toMatchObject({ mode: 'dark', sunMissing: true });
    expect(resolveMode(auto({}), { now: at(22), sun: { state: 'unavailable' } })).toMatchObject({ mode: 'dark', sunMissing: true });
  });

  it('follows the schedule, either way round midnight', () => {
    const schedule = auto({ appearance_switch: 'schedule', light_from: '07:00', dark_from: '21:00' });
    expect(resolveMode(schedule, { now: at(6, 59) })).toEqual({ mode: 'dark', next: at(7), sunMissing: false });
    expect(resolveMode(schedule, { now: at(7) })).toEqual({ mode: 'light', next: at(21), sunMissing: false });
    expect(resolveMode(schedule, { now: at(21, 30) })).toEqual({ mode: 'dark', next: at(7, 0, 14), sunMissing: false });
    const night = auto({ appearance_switch: 'schedule', light_from: '19:00', dark_from: '06:00' });
    expect(resolveMode(night, { now: at(5) }).mode).toBe('light');
    expect(resolveMode(night, { now: at(12) }).mode).toBe('dark');
    expect(resolveMode(auto({ appearance_switch: 'schedule', light_from: '08:00', dark_from: '08:00' }), { now: at(3) }))
      .toEqual({ mode: 'light', next: null, sunMissing: false });
  });

  it('finds the next schedule time across the end of daylight saving time', () => {
    const schedule = auto({ appearance_switch: 'schedule' });
    const next = resolveMode(schedule, { now: at(22, 0, 31) }).next!;
    expect([next.getMonth(), next.getDate(), next.getHours(), next.getMinutes()]).toEqual([10, 1, 7, 0]);
  });

  it('matches this screen Home Assistant theme', () => {
    const match = auto({ appearance_switch: 'home_assistant' });
    expect(resolveMode(match, { now: at(12), haDark: true }).mode).toBe('dark');
    expect(resolveMode(match, { now: at(12), haDark: false }).mode).toBe('light');
  });
});

describe('words', () => {
  it('writes times without the browser narrow spaces', () => {
    expect(clockText(at(18, 31), '12h')).toBe('6:31 PM');
    expect(clockText(at(0, 5), '12h')).toBe('12:05 AM');
    expect(clockText(at(0, 5), '24h')).toBe('00:05');
  });

  it('says when the next sunset and sunrise come', () => {
    expect(sunSummary(DAY, at(16, 10), '12h')).toBe('Dark at 6:31 PM tonight, light again at 7:12 AM.');
    expect(sunSummary(NIGHT, at(19), '12h')).toBe('Light at 7:12 AM, dark again at 6:30 PM.');
    expect(sunSummary(null, at(19), '12h')).toBeNull();
  });

  it('sums up the Appearance row', () => {
    expect(appearanceSummary(auto({ theme_pair: 'minimal' }))).toBe('Automatic · Minimal');
  });
});

describe('mayAutoSwitch', () => {
  it('waits for ten quiet seconds and no open sheet', () => {
    expect(mayAutoSwitch(19_999, 10_000, false)).toBe(false);
    expect(mayAutoSwitch(20_000, 10_000, false)).toBe(true);
    expect(mayAutoSwitch(60_000, 10_000, true)).toBe(false);
  });
});

describe('transitionKind', () => {
  const base = { from: 'light' as const, to: 'dark' as const, byHand: false, hidden: false, reducedMotion: false, supported: true };
  it('lets night fall, day rise, and a tap spread from the finger', () => {
    expect(transitionKind(base)).toBe('dusk');
    expect(transitionKind({ ...base, from: 'dark', to: 'light' })).toBe('dawn');
    expect(transitionKind({ ...base, byHand: true })).toBe('reveal');
  });

  it('fades with reduced motion, and just switches when nobody could watch it', () => {
    expect(transitionKind({ ...base, reducedMotion: true, byHand: true })).toBe('fade');
    expect(transitionKind({ ...base, from: null })).toBe('none');
    expect(transitionKind({ ...base, hidden: true })).toBe('none');
    expect(transitionKind({ ...base, supported: false })).toBe('none');
    expect(transitionKind({ ...base, to: 'light' })).toBe('none');
  });
});
