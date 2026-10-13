/** Household members and accounts as the card receives them (planavista/household/subscribe). */

import { matchedInk } from './color';

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
  security: {
    shuffle_keypad: boolean;
    shared_screens: number;
    /** Lock after no touches (30, 60, 120, or 300); missing from older backends. */
    session_idle_seconds?: number;
    /** Parent mode ends after (5, 10, 15, or 30). */
    parent_mode_minutes?: number;
    /** Kiosk mode on shared screens (milestone 9); missing from older backends. */
    kiosk?: { enabled: boolean; top_bar: 'hidden' | 'tabs' };
  };
  modules: Record<string, unknown>;
  /** Where setup stands; `start` is how the household started (restore, plan, common, empty, calendar). */
  setup: { completed: boolean; step: string | null; start?: string | null };
}

/** What a person's phones get (spec 7.2): Waiting for OK requests (parents) and evening reminders. */
export interface NotifyChoice {
  requests: boolean;
  reminders: boolean;
}

/** A time away (spec 8.11): first and last chore days, inclusive. */
export interface AwayRange {
  from: string;
  to: string;
  note?: string | null;
}

/** Bedtimes on weeknights, and on Friday and Saturday nights (HH:MM). */
export interface Bedtime {
  weeknight: string;
  weekend: string;
}

/** The fields the person page, setup, Reminders, and imports change. */
export interface MemberChanges {
  name?: string;
  color?: string;
  picture?: Picture;
  age_group?: AgeGroup;
  parent?: boolean;
  person?: string | null;
  needs_ok_for?: string;
  my_day?: string;
  stars?: boolean;
  goal?: string | null;
  away?: AwayRange[];
  bedtime?: Bedtime | null;
  sleep_hours?: number | null;
  phones?: string[];
  notify?: NotifyChoice;
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

/** What each age group means once chores are on (the approved person page). */
export const AGE_GROUP_CHORES_HINTS: Record<AgeGroup, string> = {
  young_child: 'Pictures and big buttons. Every chore needs an OK.',
  older_child: 'A list with pictures. Chores marked Needs an OK wait for one.',
  teen: 'The full list and a timeline. Chores marked Needs an OK wait for one.',
  adult: 'The full list and a timeline. No OKs needed.',
};

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

/**
 * Whether setup, open on this screen, has to ask for a parent's PIN to keep
 * saving (spec 9.4, 14.7): on a shared screen setup runs in parent mode, and
 * parent mode ends after two quiet minutes. Without a parent's PIN to ask
 * for, there's nothing to ask.
 */
export function setupNeedsPin(view: HouseholdView | null, parentSession: boolean): boolean {
  return !parentSession && settingsAccess(view, false) === 'pin';
}

export function calendarsOf(memberId: string, calendars: CalendarLink[]): CalendarLink[] {
  return calendars.filter(cal => cal.member_id === memberId);
}

/** A People row's summary, such as "Parent · PIN on · Alex's calendar" (spec 14.2). */
export function memberSummary(member: Member, calendars: CalendarLink[]): string {
  // A parent who isn't an adult is named both ways: "Parent · Teen" (milestone 8).
  const parts = member.parent
    ? ['Parent', ...(member.age_group === 'adult' ? [] : [AGE_GROUP_LABELS[member.age_group]])]
    : [AGE_GROUP_LABELS[member.age_group]];
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

/**
 * Someone's color for the mode (spec 12.4): as chosen in light; in dark,
 * the dark color they picked, or one Matched from it (brighter, same hue).
 */
export function memberColor(member: Pick<Member, 'color' | 'color_dark'>, mode: 'light' | 'dark'): string {
  if (mode === 'light') return member.color;
  return member.color_dark || matchedInk(member.color);
}
