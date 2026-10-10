import { AgeGroup, Member, MemberChanges, Picture, takenColors } from './household';

/** What the person page edits. */
export interface PersonDraft {
  name: string;
  color: string;
  picture: Picture;
  age_group: AgeGroup;
  parent: boolean;
  person: string | null;
}

const FIELDS: Array<keyof PersonDraft> = ['name', 'color', 'picture', 'age_group', 'parent', 'person'];

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The editor's starting point: the person as saved, or someone new with the first free color. */
export function draftOf(member: Member | null, members: Member[], palette: string[]): PersonDraft {
  if (member) {
    return {
      name: member.name,
      color: member.color,
      picture: member.picture,
      age_group: member.age_group,
      parent: member.parent,
      person: member.person,
    };
  }
  const taken = takenColors(members);
  const color = palette.find(c => !taken.has(c.toUpperCase())) ?? palette[0];
  return { name: '', color, picture: { initial: true }, age_group: 'adult', parent: false, person: null };
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
  return owner ? `${owner.name} already has that color.` : null;
}
