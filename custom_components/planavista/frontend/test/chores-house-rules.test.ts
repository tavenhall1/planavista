import { describe, expect, it } from 'vitest';
import {
  POLICIES, dayStartChoices, eveningChoices, nextMinutesPerStar, rulesSummary,
} from '../src/modules/chores/settings/rules-derive';
import {
  namesText, notifyOf, phoneName, reminderRows, remindersSummary, requestRows,
} from '../src/modules/chores/settings/reminders-derive';
import {
  beginRewardDraft, nextCost, rewardChanges, rewardDirty, rewardLine, rewardProblem, whoText,
} from '../src/modules/chores/settings/reward-draft';
import { MEMBERS, person } from './chores-fixtures';

describe('Rules', () => {
  it('offers the three missed-chore rules with their words (spec 14.5)', () => {
    expect(POLICIES.map(p => p.label)).toEqual(['Make it up within the week', 'Strict days', 'Carry it over until done']);
    expect(rulesSummary({ missed: 'carry_over' })).toBe('Carry it over');
    expect(rulesSummary({ missed: 'make_up' })).toBe('Make it up');
  });

  it('lets the day start from midnight to 6:00 AM', () => {
    const choices = dayStartChoices();
    expect(choices[0]).toEqual({ value: '00:00', label: '12:00 AM' });
    expect(choices[6]).toEqual({ value: '03:00', label: '3:00 AM' });
    expect(choices[choices.length - 1]).toEqual({ value: '06:00', label: '6:00 AM' });
    expect(dayStartChoices('24h')[6].label).toBe('03:00');
  });

  it('steps the minutes per star by 5, then by 15', () => {
    expect([nextMinutesPerStar(15, true), nextMinutesPerStar(15, false), nextMinutesPerStar(60, true), nextMinutesPerStar(75, false)])
      .toEqual([20, 10, 75, 60]);
    expect([nextMinutesPerStar(5, false), nextMinutesPerStar(240, true), nextMinutesPerStar(7, true)]).toEqual([5, 240, 10]);
  });
});

describe('Reminders', () => {
  const casey = person('casey', { person: 'person.casey', phones: ['notify.mobile_app_caseys_phone'], notify: { reminders: true } });
  const alex = person('alex', { parent: true, person: 'person.alex', phones: ['notify.mobile_app_alex_phone'] });
  const blair = person('blair', { parent: true, person: 'person.blair' });
  const dana = person('dana', { age_group: 'young_child' });

  it('says the evening check time, or Off', () => {
    expect(remindersSummary({ evening_check: '19:00' })).toBe('7:00 PM');
    expect(remindersSummary({ evening_check: null })).toBe('Off');
    expect(eveningChoices('19:00').map(c => c.label)).toContain('7:00 PM');
    expect(eveningChoices('23:15').at(-1)).toEqual({ value: '23:15', label: '11:15 PM' });
  });

  it('lists phone reminders and parents\' requests, and who has no phone yet', () => {
    expect(reminderRows([alex, blair, casey]).rows.map(r => [r.member.id, r.on])).toEqual([['alex', false], ['casey', true]]);
    expect(reminderRows([alex, blair, casey, dana]).noPhone.map(m => m.id)).toEqual(['blair']);
    expect(namesText([alex, blair, casey])).toBe('Alex, Blair, and Casey');
    expect(namesText([alex, blair])).toBe('Alex and Blair');
    expect(requestRows([alex, blair, casey]).rows.map(r => [r.member.id, r.on])).toEqual([['alex', true]]);
    expect(requestRows([alex, blair, casey]).noPhone.map(m => m.id)).toEqual(['blair']);
  });

  it('reads what phones get, with the defaults', () => {
    expect(notifyOf(blair)).toEqual({ requests: true, reminders: false });
    expect(notifyOf(casey)).toEqual({ requests: true, reminders: true });
    expect(phoneName('notify.mobile_app_caseys_phone')).toBe('Caseys phone');
  });
});

describe('Rewards', () => {
  const movie = { id: 'movie_night_pick', name: 'Movie night pick', icon: '🎬', cost: 40, needs_ok: true, who: ['casey', 'dana'] };

  it('says a reward in a line', () => {
    expect(rewardLine(movie, MEMBERS)).toBe('★ 40 · needs approval · Casey, Dana');
    expect(rewardLine({ ...movie, needs_ok: false, who: [] }, MEMBERS)).toBe('★ 40 · Everyone who earns stars');
    expect(whoText(['dana'], MEMBERS)).toBe('Dana');
  });

  it('starts a new reward at 20 stars that needs approval', () => {
    const record = beginRewardDraft(null);
    expect(record.draft).toEqual({ name: '', icon: null, cost: 20, needs_ok: true, who: [] });
    expect(rewardProblem(record.draft)).toBe('Add a name.');
    expect(rewardDirty({ ...record, draft: { ...record.draft, cost: 25 } })).toBe(true);
  });

  it('checks the cost and sends what changed', () => {
    const record = beginRewardDraft(movie);
    expect(rewardProblem({ ...record.draft, cost: 0 })).toBe('A reward costs from 1 to 10,000 stars.');
    expect(rewardChanges({ ...record.draft, name: ' Movie night ' })).toEqual({
      name: 'Movie night', icon: '🎬', cost: 40, needs_ok: true, who: ['casey', 'dana'],
    });
    expect([nextCost(19, true), nextCost(20, true), nextCost(25, false), nextCost(1, false)]).toEqual([20, 25, 20, 1]);
  });
});
