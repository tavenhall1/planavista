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

/** What to send: every field for someone new, only what changed for someone saved. */
export function draftChanges(draft: PersonDraft, member: Member | null): MemberChanges {
  const changes: Record<string, unknown> = {};
  for (const key of FIELDS) {
    if (!member || !same(draft[key], member[key])) changes[key] = draft[key];
  }
  if (typeof changes.name === 'string') changes.name = changes.name.trim();
  return changes as MemberChanges;
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
