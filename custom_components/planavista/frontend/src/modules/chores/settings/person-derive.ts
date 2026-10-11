import type { AwayRange, Member } from '../../../core/household';
import { shortDate } from '../../../core/recurrence';
import type { Reward } from '../chores-types';
import { phoneName } from './reminders-derive';

export interface PhoneChoice {
  service: string;
  label: string;
  /** One of the person's own device trackers. */
  suggested: boolean;
}

interface HassLike {
  services?: Record<string, Record<string, unknown> | undefined>;
  states?: Record<string, { attributes?: Record<string, unknown> } | undefined>;
}

/**
 * The phones Home Assistant can send buttons to (the Companion app's legacy
 * notify.mobile_app_* services, spec 10.5), the person's own first:
 * suggested from their person's device trackers.
 */
export function phoneChoices(hass: HassLike | undefined, member: Pick<Member, 'person'> & { phones?: unknown }): PhoneChoice[] {
  const services = Object.keys(hass?.services?.notify ?? {}).filter(name => name.startsWith('mobile_app_'));
  const trackers = member.person ? hass?.states?.[member.person]?.attributes?.device_trackers : undefined;
  const own = new Set((Array.isArray(trackers) ? trackers : []).map(id => String(id).replace(/^device_tracker\./, '')));
  const saved = Array.isArray(member.phones) ? (member.phones as string[]) : [];
  const names = new Set([...services.map(name => `notify.${name}`), ...saved]);
  return [...names]
    .map(service => {
      const id = service.replace(/^notify\.mobile_app_/, '');
      return { service, label: phoneName(service), suggested: own.has(id) };
    })
    .sort((a, b) => Number(b.suggested) - Number(a.suggested) || a.label.localeCompare(b.label));
}

export interface StarEntry {
  at: string;
  delta: number;
  reason: string;
  name: string | null;
  by: string | null;
}

/** A line of someone's stars history: "+1 · Cat care", "−1 · Uncheck: Take out the trash", "+5 · Helped a neighbor". */
export function starLine(entry: StarEntry, names: Record<string, string>): { amount: string; what: string } {
  const amount = entry.delta > 0 ? `+${entry.delta}` : `−${Math.abs(entry.delta)}`;
  let what: string;
  if (entry.reason === 'chore') what = entry.name ?? 'A chore';
  else if (entry.reason === 'undo') what = `Unchecked: ${entry.name ?? 'a chore'}`;
  else if (entry.reason === 'redeemed') what = entry.name ?? 'A reward';
  else what = entry.by && names[entry.by] ? `${entry.reason} (${names[entry.by]})` : entry.reason;
  return { amount, what };
}

/** "Oct 14 to Oct 15 · At Grandma's", or one day. */
export function awayText(span: AwayRange): string {
  const days = span.from === span.to ? shortDate(span.from) : `${shortDate(span.from)} to ${shortDate(span.to)}`;
  return span.note ? `${days} · ${span.note}` : days;
}

/** Whether someone is away today. */
export function awayNow(away: AwayRange[], today: string): AwayRange | null {
  return away.find(span => span.from <= today && today <= span.to) ?? null;
}

/** The rewards a person can save up for: theirs, or everyone's when a reward names no one. */
export function goalChoices(rewards: Reward[], memberId: string): Reward[] {
  return rewards.filter(r => !r.who.length || r.who.includes(memberId));
}

/** Hours of sleep in words: 9 h, 7 h 30 min. */
export function sleepText(hours: number): string {
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return minutes ? `${whole} h ${minutes} min` : `${whole} h`;
}
