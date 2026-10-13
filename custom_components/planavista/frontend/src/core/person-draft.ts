import { AgeGroup, AwayRange, Bedtime, Member, MemberChanges, NotifyChoice, Picture, takenColors } from './household';

/** What the person page edits, chores rows included (spec 14.2). */
export interface PersonDraft {
  name: string;
  color: string;
  picture: Picture;
  age_group: AgeGroup;
  parent: boolean;
  person: string | null;
  needs_ok_for: string;
  my_day: string;
  stars: boolean;
  goal: string | null;
  away: AwayRange[];
  bedtime: Bedtime | null;
  sleep_hours: number | null;
  phones: string[];
  notify: NotifyChoice;
}

const FIELDS: Array<keyof PersonDraft> = [
  'name', 'color', 'picture', 'age_group', 'parent', 'person', 'needs_ok_for', 'my_day', 'stars', 'goal', 'away',
  'bedtime', 'sleep_hours', 'phones', 'notify',
];

/**
 * What each age group starts someone with (spec 7.2), the household rules'
 * own table (household/members.py), checked against the same fixture:
 * tests/fixtures/age_group_defaults.json.
 */
export const AGE_GROUP_DEFAULTS: Record<AgeGroup, { my_day: string; needs_ok_for: string; stars: boolean }> = {
  young_child: { my_day: 'pictures', needs_ok_for: 'all', stars: true },
  older_child: { my_day: 'list', needs_ok_for: 'marked', stars: true },
  teen: { my_day: 'timeline', needs_ok_for: 'marked', stars: true },
  adult: { my_day: 'timeline', needs_ok_for: 'none', stars: false },
};

export const NOTIFY_DEFAULTS: NotifyChoice = { requests: true, reminders: false };

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** A new age group brings its starting points ("These start from the teen defaults"). */
export function withAgeGroup(draft: PersonDraft, age: AgeGroup): PersonDraft {
  return { ...draft, age_group: age, ...AGE_GROUP_DEFAULTS[age] };
}

const STYLE_WORDS: Record<string, string> = { timeline: 'Timeline', list: 'List', pictures: 'Pictures' };
const OK_WORDS: Record<string, string> = {
  all: 'an OK for every chore', marked: 'an OK for chores marked Needs an OK', none: 'no OKs',
};

type AgeSettings = { my_day: string; needs_ok_for: string; stars: boolean };

/** What a new age group changed, in a line under the choices ("Now Timeline, and earns stars."; milestone 8). */
export function ageGroupNote(before: AgeSettings, after: AgeSettings): string | null {
  const parts: string[] = [];
  if (before.my_day !== after.my_day) parts.push(STYLE_WORDS[after.my_day] ?? after.my_day);
  if (before.needs_ok_for !== after.needs_ok_for) parts.push(OK_WORDS[after.needs_ok_for] ?? after.needs_ok_for);
  if (before.stars !== after.stars) parts.push(after.stars ? 'earns stars' : 'no stars');
  if (!parts.length) return null;
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  return `Now ${list}.`;
}

/** The editor's starting point: the person as saved, or someone new with the first free color. */
export function draftOf(member: Member | null, members: Member[], palette: string[]): PersonDraft {
  if (member) {
    const notify = (member.notify ?? {}) as Partial<NotifyChoice>;
    return {
      name: member.name,
      color: member.color,
      picture: member.picture,
      age_group: member.age_group,
      parent: member.parent,
      person: member.person,
      needs_ok_for: member.needs_ok_for,
      my_day: member.my_day,
      stars: member.stars,
      goal: (member.goal as string | null | undefined) ?? null,
      away: Array.isArray(member.away) ? (member.away as AwayRange[]) : [],
      bedtime: (member.bedtime as Bedtime | null | undefined) ?? null,
      sleep_hours: (member.sleep_hours as number | null | undefined) ?? null,
      phones: Array.isArray(member.phones) ? (member.phones as string[]) : [],
      notify: { ...NOTIFY_DEFAULTS, ...notify },
    };
  }
  const taken = takenColors(members);
  const color = palette.find(c => !taken.has(c.toUpperCase())) ?? palette[0];
  return {
    name: '', color, picture: { initial: true }, age_group: 'adult', parent: false, person: null,
    ...AGE_GROUP_DEFAULTS.adult, goal: null, away: [], bedtime: null, sleep_hours: null, phones: [],
    notify: { ...NOTIFY_DEFAULTS },
  };
}

/**
 * An edit in progress: the draft, where it began, and the revision it began
 * from (null for someone new). Kept on the card, so it survives the end of
 * parent mode, and saved with its own revision, so a version another screen
 * saved meanwhile is noticed instead of overwritten (spec 14.1).
 */
export interface DraftRecord {
  draft: PersonDraft;
  start: PersonDraft;
  rev: number | null;
}

export function beginDraft(member: Member | null, members: Member[], palette: string[]): DraftRecord {
  const start = draftOf(member, members, palette);
  return { draft: start, start, rev: member ? member.rev : null };
}

/** What to send: every field for someone new; for someone saved, only what this screen changed. */
export function draftChanges(record: DraftRecord): MemberChanges {
  const changes: Record<string, unknown> = {};
  for (const key of FIELDS) {
    if (record.rev === null || !same(record.draft[key], record.start[key])) changes[key] = record.draft[key];
  }
  if (typeof changes.name === 'string') changes.name = changes.name.trim();
  return changes as MemberChanges;
}

/**
 * Keep editing after "This changed on another screen": this screen's own
 * changes on top of the version saved there, to be saved with its revision.
 */
export function rebaseDraft(record: DraftRecord, member: Member, members: Member[], palette: string[]): DraftRecord {
  const start = draftOf(member, members, palette);
  const draft: Record<string, unknown> = { ...start };
  for (const key of FIELDS) {
    if (!same(record.draft[key], record.start[key])) draft[key] = record.draft[key];
  }
  return { draft: draft as unknown as PersonDraft, start, rev: member.rev };
}

export function isDirty(draft: PersonDraft, start: PersonDraft): boolean {
  return !same(draft, start);
}

/** A problem to fix before saving, or null. The backend checks again. */
export function draftProblem(draft: PersonDraft, members: Member[], selfId: string | null): string | null {
  const name = draft.name.trim();
  if (!name) return 'Add a name.';
  const others = members.filter(m => m.id !== selfId);
  if (others.some(m => m.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
    return 'Someone already has that name.';
  }
  const owner = others.find(m => m.color.toUpperCase() === draft.color.toUpperCase());
  if (owner) return `${owner.name} already has that color.`;
  if (draft.away.some(span => !span.from || !span.to || span.to < span.from)) return 'Pick the first and last days away.';
  return null;
}
