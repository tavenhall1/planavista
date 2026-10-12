import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  activityLine, byCategory, emptyChoices, fileLine, importedText, importNote, ImportPreview, importSummary, lookLines, matchOf, missingAges, onBoardOf, peopleHint, personLine, sections, tiles,
} from '../src/modules/chores/settings/import-derive';
import { MEMBERS } from './chores-fixtures';

const PREVIEW = (JSON.parse(readFileSync(new URL('../../../../tests/fixtures/import_preview_sample.json', import.meta.url), 'utf-8')) as {
  preview: ImportPreview;
}).preview;
const people = (name: string) => PREVIEW.people.find(p => p.name === name)!;
const activity = (name: string) => PREVIEW.activities.find(a => a.name === name)!;

describe('the review page', () => {
  it('says what the file is', () => {
    expect(fileLine(PREVIEW)).toBe('Household Hours plan, version 1 · exported October 3');
  });

  it('says who each person in the plan is', () => {
    const choices = emptyChoices();
    expect(personLine(people('Alex'), choices, MEMBERS)).toBe('Matches Alex · sleeps 7 h 30 min');
    expect(personLine(people('Dana'), choices, MEMBERS)).toBe('New person · bedtime 7:30 PM · sleeps 10 h 30 min');
    const rematched = { ...choices, people: { p_dana: { match: 'dana' } } };
    expect(matchOf(people('Dana'), rematched)).toBe('dana');
    expect(personLine(people('Dana'), rematched, MEMBERS)).toBe('Matches Dana · sleeps 10 h 30 min');
  });

  it('needs an age group for each new person before Import', () => {
    expect(missingAges(PREVIEW, emptyChoices()).map(p => p.name)).toEqual(['Dana']);
    expect(missingAges(PREVIEW, { ...emptyChoices(), people: { p_dana: { age_group: 'young_child' } } })).toEqual([]);
  });

  it('sorts activities onto the board, plan only, and set times, with the parent\'s switches', () => {
    const plain = sections(PREVIEW, emptyChoices());
    expect([plain.board.length, plain.planOnly.length, plain.setTimes.length]).toEqual([15, 6, 2]);
    expect(onBoardOf(activity('Homework'), emptyChoices())).toBe(false);
    const switched = { ...emptyChoices(), on_board: { a17: true, a08: false } };
    expect(onBoardOf(activity('Homework'), switched)).toBe(true);
    expect(sections(PREVIEW, switched).board.map(a => a.name)).toContain('Homework');
    expect(onBoardOf(activity('Soccer practice'), { ...emptyChoices(), on_board: { a23: true } })).toBe(false);
    expect(tiles(PREVIEW, emptyChoices())).toEqual([
      { value: 4, label: 'people' }, { value: 15, label: 'on the board' }, { value: 6, label: 'plan only' }, { value: 2, label: 'set times' },
    ]);
  });

  it('says each activity in a line', () => {
    expect(activityLine(activity('Clean the bathroom'), PREVIEW.people, emptyChoices())).toBe('Blair, Casey · 2 h a week · updates yours');
    expect(activityLine(activity('Vacuum'), PREVIEW.people, emptyChoices())).toBe('Blair · 1 h a week');
    expect(activityLine(activity('Wash the car'), PREVIEW.people, emptyChoices())).toBe('No one yet · 1 h a week');
    expect(activityLine(activity('Wash the car'), PREVIEW.people, { ...emptyChoices(), assignees: { a15: ['p_casey'] } }))
      .toBe('Casey · 1 h a week');
    expect(activityLine(activity('Piano lesson'), PREVIEW.people, emptyChoices())).toBe('Dana · at 4:00 PM');
  });

  it('groups activities by category', () => {
    const groups = byCategory(sections(PREVIEW, emptyChoices()).board);
    expect(groups.map(g => [g.label, g.items.length])).toEqual([['Kitchen', 4], ['Cleaning', 5], ['Home and yard', 6]]);
  });

  it('says what needs a look', () => {
    expect(lookLines(PREVIEW)).toEqual([
      { kind: 'unassigned', ref: 'a15', title: 'No one is assigned to Wash the car.', detail: 'It waits in Chores, off the board, until someone is.' },
      {
        kind: 'shares', ref: 'a16', title: 'The shares of Water the plants add up to 45 min, not 30 min.',
        detail: "It comes in with 45 min a week, what everyone's share adds up to.",
      },
      { kind: 'updates', title: '9 are already in your chores.', detail: "Kitchen cleanup, Set the table, Laundry, and 6 more get the plan's times." },
    ]);
  });

  it('sums up the import on its bar (spec 14.6)', () => {
    expect(importSummary(PREVIEW, emptyChoices())).toBe('Adds Dana and 14 activities, and updates 9.');
    expect(importSummary(PREVIEW, { ...emptyChoices(), people: { p_dana: { match: 'dana' } } })).toBe('Adds 14 activities, and updates 9.');
  });

  it('says what an import did, after it', () => {
    expect(importedText({ people_added: ['Dana'], activities_added: 14, activities_updated: 9, rewards_added: 0 }))
      .toBe('Imported: Dana and 14 activities added, 9 updated.');
    expect(importedText({ people_added: [], activities_added: 0, activities_updated: 0, rewards_added: 0 }))
      .toBe('Imported. Nothing needed changing.');
  });
});

describe('the people hint', () => {
  it('says where bedtimes and sleep came from: the plan, or the PlanaVista file', () => {
    expect(peopleHint('household-hours/v1')).toBe('Matched by name; pick someone else to change it. Bedtimes and sleep come from the plan.');
    expect(peopleHint('planavista.household/v1')).toBe('Matched by name; pick someone else to change it. Bedtimes and sleep come from the file.');
  });
});

describe('what the Import bar says stays (spec 14.6, 15.3)', () => {
  const restore = { ...PREVIEW, file: { ...PREVIEW.file, format: 'planavista.household/v1' } };

  it('says a plan leaves stars, rewards, and history as they are', () => {
    expect(importNote(PREVIEW)).toBe('Nothing is deleted. Stars, rewards, and history stay as they are.');
  });

  it("says a restore updates the household's chores, rewards, and rules, and keeps stars and history", () => {
    expect(importNote(restore)).toBe("Nothing is deleted. The file's chores, rewards, and rules update the ones here, and stars and history stay.");
  });

  it('says a restore while chores need a look fills in only what could not be read', () => {
    expect(importNote({ ...restore, fills_in: true })).toBe(
      "Nothing is deleted. The file fills in what couldn't be read, and stars and history that could still be read stay.",
    );
  });
});
