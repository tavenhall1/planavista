import { describe, expect, it } from 'vitest';
import { PageRegistry } from '../src/core/page-registry';
import type { PersonSection, SettingsContext } from '../src/core/settings-registry';
import { choresPersonSections, registerChoresSettings } from '../src/modules/chores/definition';
import {
  awayNow, awayText, goalChoices, phoneChoices, sleepText, starLine,
} from '../src/modules/chores/settings/person-derive';

const household = (enabled: boolean) => ({ available: true, modules: { chores: { enabled } } } as never);

describe('the person page\'s chores parts', () => {
  it('come only while chores are on, at their slots', () => {
    const sections = new PageRegistry<SettingsContext, PersonSection>();
    registerChoresSettings(undefined, sections);
    const on = sections.pages({ household: household(true), data: {} as never });
    expect(on.map(s => [s.id, s.slot])).toEqual([['chores', 'role'], ['sleep', 'pin'], ['phones', 'links']]);
    expect(sections.pages({ household: household(false), data: {} as never })).toEqual([]);
    expect(choresPersonSections.map(s => s.tag)).toEqual(['pv-person-chores', 'pv-person-sleep', 'pv-person-phones']);
  });
});

describe('phoneChoices', () => {
  const hass = {
    services: { notify: { mobile_app_caseys_phone: {}, mobile_app_alex_phone: {}, persistent_notification: {} } },
    states: { 'person.casey': { attributes: { device_trackers: ['device_tracker.caseys_phone'] } } },
  };

  it('suggests the person\'s own phone first and leaves out other notify services', () => {
    expect(phoneChoices(hass, { person: 'person.casey' })).toEqual([
      { service: 'notify.mobile_app_caseys_phone', label: 'Caseys phone', suggested: true },
      { service: 'notify.mobile_app_alex_phone', label: 'Alex phone', suggested: false },
    ]);
  });

  it('keeps a saved phone Home Assistant no longer has', () => {
    expect(phoneChoices({ services: {} }, { person: null, phones: ['notify.mobile_app_old_tablet'] })).toEqual([
      { service: 'notify.mobile_app_old_tablet', label: 'Old tablet', suggested: false },
    ]);
  });
});

describe('the stars history', () => {
  const names = { blair: 'Blair' };

  it('says what each change was for', () => {
    const at = '2026-10-13T16:10:00-05:00';
    expect(starLine({ at, delta: 1, reason: 'chore', name: 'Cat care', by: null }, names)).toEqual({ amount: '+1', what: 'Cat care' });
    expect(starLine({ at, delta: -1, reason: 'undo', name: 'Take out the trash', by: 'casey' }, names)).toEqual({
      amount: '−1', what: 'Unchecked: Take out the trash',
    });
    expect(starLine({ at, delta: -40, reason: 'redeemed', name: 'Movie night pick', by: 'blair' }, names).what).toBe('Movie night pick');
    expect(starLine({ at, delta: 5, reason: 'Helped a neighbor', name: null, by: 'blair' }, names)).toEqual({
      amount: '+5', what: 'Helped a neighbor (Blair)',
    });
  });
});

describe('away, goals, and sleep', () => {
  it('says a time away', () => {
    expect(awayText({ from: '2026-10-14', to: '2026-10-15', note: "At Grandma's" })).toBe("Oct 14 to Oct 15 · At Grandma's");
    expect(awayText({ from: '2026-10-14', to: '2026-10-14' })).toBe('Oct 14');
    expect(awayNow([{ from: '2026-10-12', to: '2026-10-14' }], '2026-10-13')).toEqual({ from: '2026-10-12', to: '2026-10-14' });
    expect(awayNow([{ from: '2026-10-14', to: '2026-10-15' }], '2026-10-13')).toBeNull();
  });

  it('offers the rewards someone can get', () => {
    const rewards = [
      { id: 'movie', name: 'Movie', icon: null, cost: 40, needs_ok: true, who: ['casey', 'dana'] },
      { id: 'screen', name: 'Screen time', icon: null, cost: 15, needs_ok: true, who: [] },
      { id: 'allowance', name: 'Allowance', icon: null, cost: 50, needs_ok: true, who: ['casey'] },
    ];
    expect(goalChoices(rewards, 'dana').map(r => r.id)).toEqual(['movie', 'screen']);
  });

  it('says hours of sleep', () => {
    expect([sleepText(9), sleepText(7.5), sleepText(10.25)]).toEqual(['9 h', '7 h 30 min', '10 h 15 min']);
  });
});
