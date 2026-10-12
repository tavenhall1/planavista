import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AGE_GROUP_DEFAULTS, beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft, withAgeGroup,
} from '../src/core/person-draft';
import { Member } from '../src/core/household';

const PALETTE = ['#F94144', '#277DA1', '#43AA8B'];
const ALEX = {
  id: 'alex', name: 'Alex', color: '#F94144', color_dark: null, picture: { initial: true }, age_group: 'adult',
  parent: true, person: 'person.alex', order: 0, rev: 2, my_day: 'timeline', needs_ok_for: 'none', stars: false,
  has_pin: true, pin_length: 4, locked_until: null,
} as Member;

const CHORES = {
  needs_ok_for: 'none', my_day: 'timeline', stars: false, goal: null, away: [], bedtime: null, sleep_hours: null,
  phones: [], notify: { requests: true, reminders: false },
};
const AGES = JSON.parse(readFileSync(new URL('../../../../tests/fixtures/age_group_defaults.json', import.meta.url), 'utf-8')) as {
  defaults: Record<string, unknown>;
};

describe('person drafts', () => {
  it('starts someone new with the first free color', () => {
    expect(draftOf(null, [ALEX], PALETTE)).toEqual({
      name: '', color: '#277DA1', picture: { initial: true }, age_group: 'adult', parent: false, person: null, ...CHORES,
    });
  });

  it('starts from a saved person', () => {
    expect(draftOf(ALEX, [ALEX], PALETTE)).toEqual({
      name: 'Alex', color: '#F94144', picture: { initial: true }, age_group: 'adult', parent: true, person: 'person.alex',
      ...CHORES,
    });
    const casey = { ...ALEX, id: 'casey', bedtime: { weeknight: '22:00', weekend: '23:00' }, sleep_hours: 9,
      phones: ['notify.mobile_app_caseys_phone'], notify: { reminders: true }, away: [{ from: '2026-10-14', to: '2026-10-15' }],
      goal: 'movie_night_pick' } as Member;
    expect(draftOf(casey, [casey], PALETTE)).toMatchObject({
      bedtime: { weeknight: '22:00', weekend: '23:00' }, sleep_hours: 9, phones: ['notify.mobile_app_caseys_phone'],
      notify: { requests: true, reminders: true }, away: [{ from: '2026-10-14', to: '2026-10-15' }], goal: 'movie_night_pick',
    });
  });

  it("starts a new age group from its defaults, from the household rules' table", () => {
    expect(AGE_GROUP_DEFAULTS).toEqual(AGES.defaults);
    const teen = withAgeGroup(draftOf(null, [], PALETTE), 'teen');
    expect([teen.age_group, teen.my_day, teen.needs_ok_for, teen.stars]).toEqual(['teen', 'timeline', 'marked', true]);
    const young = withAgeGroup(teen, 'young_child');
    expect([young.my_day, young.needs_ok_for, young.stars]).toEqual(['pictures', 'all', true]);
  });

  it('sends everything for someone new and only changes for someone saved', () => {
    const fresh = beginDraft(null, [], PALETTE);
    expect(fresh.rev).toBeNull();
    const named = { ...fresh, draft: { ...fresh.draft, name: '  Dana ', age_group: 'young_child' as const } };
    expect(draftChanges(named)).toEqual({
      name: 'Dana', color: '#F94144', picture: { initial: true }, age_group: 'young_child', parent: false, person: null,
      ...CHORES,
    });
    const saved = beginDraft(ALEX, [ALEX], PALETTE);
    const edited = { ...saved, draft: { ...saved.draft, picture: { emoji: '\u{1F996}' } } };
    expect(draftChanges(edited)).toEqual({ picture: { emoji: '\u{1F996}' } });
  });

  it('keeps the revision the edit began from, so a newer version is noticed', () => {
    const record = beginDraft(ALEX, [ALEX], PALETTE);
    expect(record.rev).toBe(2);
    expect(record.start).toEqual(draftOf(ALEX, [ALEX], PALETTE));
    expect(record.draft).toEqual(record.start);
  });

  it('keeps editing on top of the version another screen saved', () => {
    const record = beginDraft(ALEX, [ALEX], PALETTE);
    const edited = { ...record, draft: { ...record.draft, picture: { emoji: '\u{1F996}' } } };
    // Another screen changed Alex's color; this screen changed only the picture.
    const newer = { ...ALEX, color: '#43AA8B', rev: 3 } as Member;
    const rebased = rebaseDraft(edited, newer, [newer], PALETTE);
    expect(rebased.rev).toBe(3);
    expect(rebased.start).toEqual(draftOf(newer, [newer], PALETTE));
    expect(rebased.draft).toEqual({ ...draftOf(newer, [newer], PALETTE), picture: { emoji: '\u{1F996}' } });
    expect(draftChanges(rebased)).toEqual({ picture: { emoji: '\u{1F996}' } });
  });

  it('knows when there is something to save', () => {
    const start = draftOf(ALEX, [ALEX], PALETTE);
    expect(isDirty(start, start)).toBe(false);
    expect(isDirty({ ...start, parent: false }, start)).toBe(true);
  });

  it('says what to fix before saving', () => {
    const casey = { ...ALEX, id: 'casey', name: 'Casey', color: '#43AA8B', person: null } as Member;
    const draft = draftOf(null, [ALEX, casey], PALETTE);
    expect(draftProblem(draft, [ALEX, casey], null)).toBe('Add a name.');
    expect(draftProblem({ ...draft, name: 'alex' }, [ALEX, casey], null)).toBe('Someone already has that name.');
    expect(draftProblem({ ...draft, name: 'Dana', color: '#43aa8b' }, [ALEX, casey], null)).toBe('Casey already has that color.');
    expect(draftProblem({ ...draft, name: 'Dana' }, [ALEX, casey], null)).toBeNull();
    expect(draftProblem(draftOf(ALEX, [ALEX], PALETTE), [ALEX, casey], 'alex')).toBeNull();
  });
});
