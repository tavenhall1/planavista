/** Household members and accounts as the card receives them (planavista/household/subscribe). */

export type AgeGroup = 'young_child' | 'older_child' | 'teen' | 'adult';
export type Role = 'parent' | AgeGroup;
export type Picture = { initial: true } | { emoji: string } | { person: true };

export interface Member {
  id: string;
  name: string;
  color: string;
  color_dark: string | null;
  picture: Picture;
  age_group: AgeGroup;
  parent: boolean;
  person: string | null;
  order: number;
  rev: number;
  my_day: string;
  needs_ok_for: string;
  stars: boolean;
  has_pin: boolean;
  pin_length: number | null;
  locked_until: string | null;
  [key: string]: unknown;
}

export type AccountKind = 'shared' | 'admin' | 'parent' | 'member' | 'other';

export interface AccountView {
  user_id: string;
  name: string;
  is_admin: boolean;
  shared: boolean;
  kind: AccountKind;
  member_id: string | null;
  parent_level: boolean;
}

export interface HouseholdView {
  available: boolean;
  members: Member[];
  account: AccountView;
  security: { shuffle_keypad: boolean; shared_screens: number };
  modules: Record<string, unknown>;
  setup: { completed: boolean; step: string | null };
}

/** The fields the person page and setup change. */
export interface MemberChanges {
  name?: string;
  color?: string;
  picture?: Picture;
  age_group?: AgeGroup;
  parent?: boolean;
  person?: string | null;
}

/** The part of a calendar row the people pages read. */
export interface CalendarLink {
  entity_id: string;
  display_name: string;
  member_id?: string | null;
}

export type PictureView =
  | { kind: 'photo'; url: string }
  | { kind: 'emoji'; text: string }
  | { kind: 'initial'; text: string };

export type SettingsAccess = 'open' | 'pin' | 'no_pin' | 'none';

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  young_child: 'Young child',
  older_child: 'Older child',
  teen: 'Teen',
  adult: 'Adult',
};

/** The age groups on the person page, with the ages they suggest. */
export const AGE_GROUP_CHOICES: Array<{ id: AgeGroup; label: string; hint: string }> = [
  { id: 'young_child', label: 'Young child', hint: 'About 4 to 8' },
  { id: 'older_child', label: 'Older child', hint: 'About 9 to 12' },
  { id: 'teen', label: 'Teen', hint: '' },
  { id: 'adult', label: 'Adult', hint: '' },
];

/** The role chips of setup's "Who lives here?" (spec 14.7). */
export const ROLES: Array<{ id: Role; label: string }> = [
  { id: 'parent', label: 'Parent' },
  { id: 'adult', label: 'Adult' },
  { id: 'teen', label: 'Teen' },
  { id: 'older_child', label: 'Older child' },
  { id: 'young_child', label: 'Young child' },
];

export function roleOf(member: Pick<Member, 'age_group' | 'parent'>): Role {
  return member.parent ? 'parent' : member.age_group;
}

export function roleFields(role: Role): { age_group: AgeGroup; parent: boolean } {
  return role === 'parent' ? { age_group: 'adult', parent: true } : { age_group: role, parent: false };
}

/** People in board order. */
export function inOrder(members: Member[]): Member[] {
  return [...members].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** The first character of a name (a whole emoji counts as one), for the initial picture. */
export function initialOf(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toLocaleUpperCase() : '?';
}

/** Parents who can start parent mode with a PIN, in board order. */
export function parentsWithPins(members: Member[]): Member[] {
  return inOrder(members).filter(m => m.parent && m.has_pin);
}

/**
 * What the gear does for this account (spec 14.1): open Settings, ask for a
 * parent's PIN, explain that no parent has one yet, or nothing (children
 * can't open Settings). Without a usable household (an older backend, or a
 * household file from a newer release) only admins may open it, as in 1.1.0.
 */
export function settingsAccess(view: HouseholdView | null, isAdmin: boolean): SettingsAccess {
  if (!view || !view.available) return isAdmin ? 'open' : 'none';
  if (view.account.parent_level) return 'open';
  if (view.account.kind === 'shared' || view.account.kind === 'other') {
    return parentsWithPins(view.members).length > 0 ? 'pin' : 'no_pin';
  }
  return 'none';
}

export function calendarsOf(memberId: string, calendars: CalendarLink[]): CalendarLink[] {
  return calendars.filter(cal => cal.member_id === memberId);
}

/** A People row's summary, such as "Parent · PIN on · Alex's calendar" (spec 14.2). */
export function memberSummary(member: Member, calendars: CalendarLink[]): string {
  const parts = [member.parent ? 'Parent' : AGE_GROUP_LABELS[member.age_group]];
  if (member.has_pin) parts.push('PIN on');
  const own = calendarsOf(member.id, calendars);
  if (own.length === 0) parts.push('no calendar');
  else if (own.length === 1) parts.push(`${member.name}'s calendar`);
  else parts.push(`${own.length} calendars`);
  return parts.join(' · ');
}

/** Colors other people use, keyed in upper case. */
export function takenColors(members: Member[], exceptId?: string): Map<string, Member> {
  const taken = new Map<string, Member>();
  for (const m of members) {
    if (m.id !== exceptId) taken.set(m.color.toUpperCase(), m);
  }
  return taken;
}

/** The first palette color nobody uses, or null when every one is taken. */
export function nextFreeColor(members: Member[], palette: string[]): string | null {
  const taken = takenColors(members);
  return palette.find(color => !taken.has(color.toUpperCase())) ?? null;
}

/** What someone's picture shows. A photo needs their person's picture; otherwise the initial shows. */
export function pictureOf(
  member: Pick<Member, 'name' | 'picture' | 'person'>,
  personPicture: (entityId: string) => string | null,
): PictureView {
  const picture = member.picture as Record<string, unknown> | null;
  if (picture && typeof picture.emoji === 'string' && picture.emoji) {
    return { kind: 'emoji', text: picture.emoji };
  }
  if (picture && picture.person === true && member.person) {
    const url = personPicture(member.person);
    if (url) return { kind: 'photo', url };
  }
  return { kind: 'initial', text: initialOf(member.name) };
}
