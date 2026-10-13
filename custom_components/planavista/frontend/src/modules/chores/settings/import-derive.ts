import type { AgeGroup, Member } from '../../../core/household';
import { longDate } from '../../../core/recurrence';
import { CATEGORIES } from './chore-draft';
import { clockText, durationText } from './chores-list-derive';
import { sleepText } from './person-derive';

/** What planavista/import/preview says (chores/importer.py preview). */
export interface PreviewPerson {
  ref: string;
  name: string;
  match: string | null;
  match_name: string | null;
  color: string | null;
  bedtime: { weeknight: string; weekend: string } | null;
  sleep_hours: number | null;
  age_group: AgeGroup | null;
  parent: boolean | null;
}

export interface PreviewActivity {
  ref: string;
  name: string;
  icon: string | null;
  category: string;
  kind: 'board' | 'plan_only' | 'set_time';
  on_board: boolean;
  match: string | null;
  schedule: string;
  assignees: string[];
  minimum: { hours: number; per: 'day' | 'week' } | null;
  split: string | null;
  days: string[] | null;
  set_time: string | null;
}

export type NeedsALook =
  | { kind: 'unassigned'; ref: string; name: string }
  | { kind: 'shares'; ref: string; name: string; hours: number; planned: number; per: 'day' | 'week' }
  | { kind: 'updates'; refs: string[]; names: string[] };

export interface ImportPreview {
  file: { format: string; label: string; exported: string | null; source: string | null };
  people: PreviewPerson[];
  activities: PreviewActivity[];
  rewards: Array<{ ref: string; name: string; icon: string | null; match: string | null }>;
  settings: boolean;
  needs_a_look: NeedsALook[];
  /** A restore while chores need a look: it fills in the files that couldn't be read and keeps the rest (spec 15.3). */
  fills_in?: boolean;
}

/** The parent's picks on the review page; sent with Import. */
export interface ImportChoices {
  people: Record<string, { match?: string | null; age_group?: AgeGroup }>;
  on_board: Record<string, boolean>;
  assignees: Record<string, string[]>;
}

export const RESTORE_FORMAT = 'planavista.household/v1';

/** The most text an import reads (chores/websocket.py MAX_FILE_LENGTH). */
export const MAX_FILE_LENGTH = 2_000_000;

/** What to say about a file too big to read, before it is sent; null when it fits (round 2). */
export function fileTooBig(text: string): string | null {
  return text.length > MAX_FILE_LENGTH ? 'This file is too big to read. PlanaVista files are 2 MB at most.' : null;
}

/** What the Import bar says stays (spec 14.6): nothing is deleted, and what a plan, a restore, or a fill-in changes. */
export function importNote(preview: Pick<ImportPreview, 'file' | 'fills_in'>): string {
  if (preview.fills_in) {
    return "Nothing is deleted. The file fills in what couldn't be read, and stars and history that could still be read stay.";
  }
  if (preview.file.format === RESTORE_FORMAT) {
    return "Nothing is deleted. The file's chores, rewards, and rules update the ones here, and stars and history stay.";
  }
  return 'Nothing is deleted. Stars, rewards, and history stay as they are.';
}

/** The line under People: how matching works, and where bedtimes and sleep came from. */
export function peopleHint(format: string): string {
  const from = format === RESTORE_FORMAT ? 'the file' : 'the plan';
  return `Matched by name; pick someone else to change it. Bedtimes and sleep come from ${from}.`;
}

function list(names: string[]): string {
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function emptyChoices(): ImportChoices {
  return { people: {}, on_board: {}, assignees: {} };
}

/** "Household Hours plan, version 1 · exported October 3". */
export function fileLine(preview: ImportPreview): string {
  return preview.file.exported ? `${preview.file.label} · exported ${longDate(preview.file.exported)}` : preview.file.label;
}

/** Who a person in the file is, with the parent's pick: an existing member, or someone new. */
export function matchOf(person: PreviewPerson, choices: ImportChoices): string | null {
  const pick = choices.people[person.ref];
  return pick && 'match' in pick ? pick.match ?? null : person.match;
}

export function ageOf(person: PreviewPerson, choices: ImportChoices): AgeGroup | null {
  return choices.people[person.ref]?.age_group ?? person.age_group;
}

/** A People row's line: "Matches Alex · sleeps 7 h 30 min", "New person · bedtime 7:30 PM · sleeps 10 h 30 min". */
export function personLine(person: PreviewPerson, choices: ImportChoices, members: Member[], timeFormat = '12h'): string {
  const match = matchOf(person, choices);
  const parts = [match ? `Matches ${members.find(m => m.id === match)?.name ?? person.match_name ?? match}` : 'New person'];
  if (!match && person.bedtime) parts.push(`bedtime ${clockText(person.bedtime.weeknight, timeFormat)}`);
  if (person.sleep_hours) parts.push(`sleeps ${sleepText(person.sleep_hours)}`);
  return parts.join(' · ');
}

/** Whether an activity comes in on the board, with the parent's switch. */
export function onBoardOf(activity: PreviewActivity, choices: ImportChoices): boolean {
  if (activity.kind === 'set_time') return false;
  return choices.on_board[activity.ref] ?? activity.on_board;
}

/** An activity's line: "Blair, Casey · 2 h a week · updates yours". */
export function activityLine(activity: PreviewActivity, people: PreviewPerson[], choices: ImportChoices, timeFormat = '12h'): string {
  const refs = choices.assignees[activity.ref] ?? activity.assignees;
  const names = refs.map(ref => people.find(p => p.ref === ref)?.name ?? ref);
  const parts = [names.length ? names.join(', ') : 'No one yet'];
  if (activity.set_time) parts.push(`at ${clockText(activity.set_time, timeFormat)}`);
  else if (activity.minimum) parts.push(`${durationText(activity.minimum.hours * 60)} a ${activity.minimum.per}`);
  if (activity.match) parts.push('updates yours');
  return parts.join(' · ');
}

/** A picture for each category on the review page. */
export const CATEGORY_ICONS: Record<string, string> = {
  kitchen: '🍽️', cleaning: '🧽', home: '🌿', personal: '🙂', school: '📚', work: '💼', family: '👪', other: '📋',
};

/** What an import did, for the toast after it: "Imported: Dana and 14 activities added, 9 updated." */
export function importedText(summary: {
  people_added: string[]; activities_added: number; activities_updated: number; rewards_added: number;
}): string {
  const added = [...summary.people_added];
  if (summary.activities_added) added.push(`${summary.activities_added} ${summary.activities_added === 1 ? 'activity' : 'activities'}`);
  if (summary.rewards_added) added.push(`${summary.rewards_added} ${summary.rewards_added === 1 ? 'reward' : 'rewards'}`);
  const parts: string[] = [];
  if (added.length) parts.push(`${list(added)} added`);
  if (summary.activities_updated) parts.push(`${summary.activities_updated} updated`);
  return parts.length ? `Imported: ${parts.join(', ')}.` : 'Imported. Nothing needed changing.';
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? 'Other';
}

/** Activities grouped by category, in the editor's category order. */
export function byCategory(activities: PreviewActivity[]): Array<{ category: string; label: string; items: PreviewActivity[] }> {
  return CATEGORIES.map(c => ({ category: c.id, label: c.label, items: activities.filter(a => (a.category || 'other') === c.id) }))
    .concat([{ category: '', label: 'Other', items: activities.filter(a => !CATEGORIES.some(c => c.id === a.category)) }])
    .filter(group => group.items.length > 0);
}

/** The review page's sections (spec 14.6): what goes on the board, what stays plan only, and the set times. */
export function sections(preview: ImportPreview, choices: ImportChoices) {
  const board = preview.activities.filter(a => onBoardOf(a, choices));
  const planOnly = preview.activities.filter(a => a.kind !== 'set_time' && !onBoardOf(a, choices));
  const setTimes = preview.activities.filter(a => a.kind === 'set_time');
  return { board, planOnly, setTimes };
}

/** New people who still need an age group before Import (spec 14.6). */
export function missingAges(preview: ImportPreview, choices: ImportChoices): PreviewPerson[] {
  return preview.people.filter(p => !matchOf(p, choices) && !ageOf(p, choices));
}


/** The Import bar (spec 14.6): "Adds Dana and 28 activities, and updates 3." */
export function importSummary(preview: ImportPreview, choices: ImportChoices): string {
  const newPeople = preview.people.filter(p => !matchOf(p, choices)).map(p => p.name);
  const adds = preview.activities.filter(a => !a.match).length;
  const updates = preview.activities.filter(a => a.match).length;
  const added: string[] = [...newPeople];
  if (adds) added.push(`${adds} ${adds === 1 ? 'activity' : 'activities'}`);
  const rewards = preview.rewards.filter(r => !r.match).length;
  if (rewards) added.push(`${rewards} ${rewards === 1 ? 'reward' : 'rewards'}`);
  const parts: string[] = [];
  if (added.length) parts.push(`Adds ${list(added)}`);
  if (updates) parts.push(`${parts.length ? 'and updates' : 'Updates'} ${updates}`);
  return parts.length ? `${parts.join(', ')}.` : 'Nothing new to add.';
}

/** The lines under Needs a look (spec 14.6). */
export function lookLines(preview: ImportPreview): Array<{ kind: NeedsALook['kind']; title: string; detail: string; ref?: string }> {
  return preview.needs_a_look.map(look => {
    if (look.kind === 'unassigned') {
      return { kind: look.kind, ref: look.ref, title: `No one is assigned to ${look.name}.`, detail: 'It waits in Chores, off the board, until someone is.' };
    }
    if (look.kind === 'shares') {
      return {
        kind: look.kind, ref: look.ref,
        title: `The shares of ${look.name} add up to ${durationText(look.hours * 60)}, not ${durationText(look.planned * 60)}.`,
        detail: `It comes in with ${durationText(look.hours * 60)} a ${look.per}, what everyone's share adds up to.`,
      };
    }
    const n = look.names.length;
    return {
      kind: look.kind,
      title: `${n} ${n === 1 ? 'is' : 'are'} already in your chores.`,
      detail: `${n > 3 ? `${look.names.slice(0, 3).join(', ')}, and ${n - 3} more` : list(look.names)} get the plan's times.`,
    };
  });
}

/** Planned counts for the portrait tiles. */
export function tiles(preview: ImportPreview, choices: ImportChoices): Array<{ value: number; label: string }> {
  const s = sections(preview, choices);
  return [
    { value: preview.people.length, label: preview.people.length === 1 ? 'person' : 'people' },
    { value: s.board.length, label: 'on the board' },
    { value: s.planOnly.length, label: 'plan only' },
    { value: s.setTimes.length, label: s.setTimes.length === 1 ? 'set time' : 'set times' },
  ];
}
