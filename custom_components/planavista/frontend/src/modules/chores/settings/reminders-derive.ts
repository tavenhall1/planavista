import type { Member } from '../../../core/household';
import type { ChoresSettings } from '../chores-types';
import { clockText } from './chores-list-derive';

/** What a person's phones get (spec 7.2): parents' requests are on by default, reminders off. */
export function notifyOf(member: Member): { requests: boolean; reminders: boolean } {
  const notify = (member.notify ?? {}) as { requests?: boolean; reminders?: boolean };
  return { requests: notify.requests ?? true, reminders: notify.reminders ?? false };
}

export function phonesOf(member: Member): string[] {
  return Array.isArray(member.phones) ? (member.phones as string[]) : [];
}

/** A phone's name from its notify service: notify.mobile_app_caseys_phone is "Caseys phone". */
export function phoneName(service: string): string {
  const words = service.replace(/^notify\./, '').replace(/^mobile_app_/, '').replace(/_/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : service;
}

/** The Reminders row's value in Settings ("7:00 PM", or "Off"). */
export function remindersSummary(settings: Pick<ChoresSettings, 'evening_check'>, timeFormat = '12h'): string {
  return settings.evening_check ? clockText(settings.evening_check, timeFormat) : 'Off';
}

export interface ReminderRow {
  member: Member;
  phones: string[];
  on: boolean;
}

/**
 * People's phone reminders (spec 14.5): everyone with a phone, and who could
 * have one but doesn't yet (people linked to a Home Assistant person; a
 * young child without an account isn't asked about).
 */
export function reminderRows(members: Member[]): { rows: ReminderRow[]; noPhone: Member[] } {
  const rows = members.filter(m => phonesOf(m).length).map(m => ({ member: m, phones: phonesOf(m), on: notifyOf(m).reminders }));
  return { rows, noPhone: members.filter(m => !phonesOf(m).length && !!m.person) };
}

/** "Alex, Blair, and Casey" (spec 11.7: plain lists). */
export function namesText(members: Member[]): string {
  const names = members.map(m => m.name);
  if (names.length <= 2) return names.join(' and ');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

/** Which parents' phones get Approval requests (spec 14.5, 10.5). */
export function requestRows(members: Member[]): { rows: ReminderRow[]; noPhone: Member[] } {
  const parents = members.filter(m => m.parent);
  return {
    rows: parents.filter(m => phonesOf(m).length).map(m => ({ member: m, phones: phonesOf(m), on: notifyOf(m).requests })),
    noPhone: parents.filter(m => !phonesOf(m).length),
  };
}
