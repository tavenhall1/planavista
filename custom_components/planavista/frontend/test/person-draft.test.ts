import { describe, expect, it } from 'vitest';
import { beginDraft, draftChanges, draftOf, draftProblem, isDirty, rebaseDraft } from '../src/core/person-draft';
import { Member } from '../src/core/household';

const PALETTE = ['#F94144', '#277DA1', '#43AA8B'];
const ALEX = {
  id: 'alex', name: 'Alex', color: '#F94144', color_dark: null, picture: { initial: true }, age_group: 'adult',
  parent: true, person: 'person.alex', order: 0, rev: 2, my_day: 'timeline', needs_ok_for: 'none', stars: false,
  has_pin: true, pin_length: 4, locked_until: null,
} as Member;

describe('person drafts', () => {
  it('starts someone new with the first free color', () => {
    expect(draftOf(null, [ALEX], PALETTE)).toEqual({
      name: '', color: '#277DA1', picture: { initial: true }, age_group: 'adult', parent: false, person: null,
    });
  });

  it('starts from a saved person', () => {
    expect(draftOf(ALEX, [ALEX], PALETTE)).toEqual({
      name: 'Alex', color: '#F94144', picture: { initial: true }, age_group: 'adult', parent: true, person: 'person.alex',
    });
  });

  it('sends everything for someone new and only changes for someone saved', () => {
    const fresh = beginDraft(null, [], PALETTE);
    expect(fresh.rev).toBeNull();
    const named = { ...fresh, draft: { ...fresh.draft, name: '  Dana ', age_group: 'young_child' as const } };
    expect(draftChanges(named)).toEqual({
      name: 'Dana', color: '#F94144', picture: { initial: true }, age_group: 'young_child', parent: false, person: null,
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
