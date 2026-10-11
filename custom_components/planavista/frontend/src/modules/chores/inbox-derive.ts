import type { Member } from '../../core/household';
import { daysBetween } from '../../core/status-map';
import type { ChoreRequest } from './chores-types';
import { clockTime } from './calendar-ties';
import { dayWords } from './options-derive';

/** One request in the Waiting for OK inbox (spec 13.7). */
export interface InboxRow {
  id: string;
  kind: ChoreRequest['kind'];
  member: Member | null;
  /** "Dana finished", "Casey asks for more time on", "Casey wants". */
  lead: string;
  /** The chore or reward, in bold. */
  what: string;
  /** What follows ("this week" after a skip). */
  tail: string;
  /** "Today at 3:58 PM · ★ 1", "Move the due date to next Sunday", "★ 10 of 23". */
  detail: string;
  allow: string;
  decline: string;
  /** Approving isn't possible now (not enough stars). */
  blocked: boolean;
}

export interface InboxGroups {
  chores: InboxRow[];
  requests: InboxRow[];
  rewards: InboxRow[];
  count: number;
}

/** "Today at 3:58 PM", "Yesterday at 7:10 PM", "Monday at 9:00 AM". */
export function whenText(at: string, today: string, format: '12h' | '24h'): string {
  const date = new Date(at);
  const pad = (v: number) => String(v).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = clockTime(date, format, format === '12h');
  const ago = daysBetween(day, today);
  if (ago === 0) return `Today at ${time}`;
  if (ago === 1) return `Yesterday at ${time}`;
  const words = dayWords(day, today);
  return `${words[0].toUpperCase()}${words.slice(1)} at ${time}`;
}

/** The inbox in its three groups: Chores to check, Requests, and Rewards (spec 13.7). */
export function inboxGroups(requests: ChoreRequest[], members: Member[], today: string, format: '12h' | '24h'): InboxGroups {
  const byId = new Map(members.map(m => [m.id, m]));
  const groups: InboxGroups = { chores: [], requests: [], rewards: [], count: requests.length };
  for (const r of requests) {
    const member = byId.get(r.member) ?? null;
    const name = member?.name ?? r.member;
    if (r.kind === 'completion') {
      const doer = r.done_by && r.done_by !== r.member ? byId.get(r.done_by)?.name ?? r.done_by : null;
      const stars = r.stars ? ` · ★ ${r.stars}` : '';
      groups.chores.push({
        id: r.id, kind: r.kind, member, lead: doer ? `${doer} finished` : `${name} finished`, what: r.name,
        tail: doer ? ` for ${name}` : '', detail: `${whenText(r.at, today, format)}${stars}`,
        allow: 'Looks good', decline: 'Send back', blocked: false,
      });
    } else if (r.kind === 'more_time' || r.kind === 'skip') {
      const more = r.kind === 'more_time';
      groups.requests.push({
        id: r.id, kind: r.kind, member,
        lead: more ? `${name} asks for more time on` : `${name} asks to skip`,
        what: r.name, tail: more ? '' : ' this week',
        detail: more && r.until ? `Move the due date to ${dayWords(r.until, today)}` : 'It would be excused, so nothing is missed.',
        allow: 'Allow', decline: 'Not this time', blocked: false,
      });
    } else {
      const cost = r.cost ?? 0;
      const balance = r.balance ?? 0;
      groups.rewards.push({
        id: r.id, kind: r.kind, member, lead: `${name} wants`, what: r.name, tail: '',
        detail: balance >= cost ? `★ ${cost} of ${balance}` : `★ ${cost}, and ${name} has ${balance}: not enough stars yet`,
        allow: 'Approve', decline: 'Decline', blocked: balance < cost,
      });
    }
  }
  return groups;
}

/** What the toast says once a parent answered. */
export function answeredText(row: InboxRow, allowed: boolean, note?: string | null): string {
  if (row.kind === 'completion') return allowed ? `${row.what}: looks good.` : `${row.what} went back${note ? `: ${note}` : ''}.`;
  if (row.kind === 'redemption') return allowed ? `${row.what} is ${row.member?.name ?? 'theirs'}'s.` : `${row.what}: declined.`;
  return allowed ? `Allowed: ${row.what}.` : `Not this time: ${row.what}.`;
}
