/** The chores feed and views as the card receives them (spec 10.7). */

export type ItemStatus = 'open' | 'sent_back' | 'done' | 'pending' | 'excused' | 'away';
export type Section = 'overdue' | 'today' | 'week';
export type Band = 'morning' | 'afternoon' | 'evening';
export type Window = 'day' | 'week' | 'month' | 'once';

export interface Review {
  by: string;
  at: string;
  note: string | null;
}

export interface CompletionView {
  id: string;
  done_by: string;
  by: string;
  at: string;
  source: string;
  state: string;
  review: Review | null;
  stars: number;
}

/** One occurrence on a chore day (ChoresEngine.item_view). */
export interface ItemView {
  key: string;
  chore: string;
  name: string;
  icon: string | null;
  member: string;
  owner: string;
  period: string;
  n: number;
  section: Section;
  band: Band | null;
  planned: string | null;
  due: string | null;
  due_day: string | null;
  window: Window;
  dated: boolean;
  status: ItemStatus;
  counted: boolean;
  credit_minutes: number;
  stars: number;
  from: string | null;
  overdue_since: string | null;
  needs_ok: boolean;
  completion: CompletionView | null;
  note: string | null;
  request: { id: string; kind: string; until: string | null } | null;
}

export interface Stats {
  due: number;
  done: number;
  pending: number;
  minutes_due: number;
  minutes_done: number;
  minutes_pending: number;
}

export interface AwaySpan {
  from: string;
  to: string;
  note?: string | null;
}

export interface BoardMember {
  items: ItemView[];
  today: Stats;
  week: Stats & { percent: number | null };
  contribution: { minutes: number; shared_minutes: number };
  streak: number;
  week_streak: number;
  stars: number;
  week_stars: number;
  chore_minutes: number;
  away: AwaySpan | null;
}

export type RequestKind = 'completion' | 'more_time' | 'skip' | 'redemption';

/** Anything a parent reviews (spec 8.7). */
export interface ChoreRequest {
  id: string;
  kind: RequestKind;
  member: string;
  name: string;
  at: string;
  done_by?: string;
  chore?: string;
  occurrence?: string;
  stars?: number;
  until?: string | null;
  reward?: string;
  cost?: number;
  balance?: number;
}

export interface Activity {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  schedule: 'plan' | 'once' | 'repeats';
  assignees: string[];
  on_board: boolean;
  needs_ok: boolean;
  needs_ok_always?: boolean;
  stars: number | null;
  label?: string | null;
  minimum?: { hours: number; per: 'day' | 'week' };
  split?: 'shared' | 'each';
  shares?: Record<string, number> | null;
  days?: string[];
  time_of_day?: Band[];
  times?: number;
  set_time?: string | null;
  once?: { on: string | null; by: string | null; by_time: string | null; sessions: number; estimate_minutes: number };
  repeats?: { rrule: string; start: string; window: 'day' | 'period'; estimate_minutes: number };
  finished_at?: string | null;
  created?: { by: string; source: string; at: string };
  rev?: number;
  [key: string]: unknown;
}

export interface Reward {
  id: string;
  name: string;
  icon: string | null;
  cost: number;
  needs_ok: boolean;
  who: string[];
}

export interface ChoresSettings {
  missed: 'make_up' | 'strict' | 'carry_over';
  day_starts: string;
  auto_approve: 'day_end' | 'never';
  minutes_per_star: number;
  evening_check: string | null;
  sound: boolean;
}

export interface GivenReward {
  id: string;
  member: string;
  reward: string;
  name: string;
  cost: number;
  at: string;
  by: string | null;
}

export interface Board {
  date: string;
  today: string;
  now: string;
  band: Band;
  day: { start: string; end: string };
  week: { start: string; end: string; days_left: number };
  members: Record<string, BoardMember>;
  household: { due: number; done: number; pending: number };
  requests: ChoreRequest[];
  settings: ChoresSettings;
  chores: Activity[];
  rewards: Reward[];
  recent_redemptions: GivenReward[];
  needs_a_look: Array<{ kind: string; chore: string; name: string }>;
}

export type ChoresState = 'ok' | 'off' | 'needs_a_look' | 'newer';

export interface ChoresFeed {
  state: ChoresState;
  save_failed: boolean;
  board: Board | null;
}

export interface WeekDay {
  date: string;
  kind: 'past' | 'today' | 'future';
  away: boolean;
  due: number | null;
  done: number | null;
  pending: number | null;
  closed: boolean | null;
  missed: number;
  /** What was missed, on a past day. */
  missed_items?: PastItem[];
}

export interface WeeklyEntry {
  chore: string;
  name: string;
  total: number;
  done: number;
  pending: number;
  from: string | null;
}

export interface WeekView {
  week: { start: string; end: string };
  today: string;
  members: Record<string, {
    days: WeekDay[];
    weekly: WeeklyEntry[];
    contribution: { minutes: number; shared_minutes: number };
    away: AwaySpan[];
  }>;
}

/** A past day's item in the day sheet. */
export interface PastItem {
  key: string;
  chore: string;
  name: string;
  icon: string | null;
  /** `open`: counted that day and not done by its end, without being missed then (a make-up chore). */
  status: 'done' | 'pending' | 'missed' | 'carried' | 'excused' | 'open';
  done_by?: string;
  at?: string;
}

export interface DayView {
  date: string;
  kind: 'past' | 'today' | 'future';
  members: Record<string, {
    items: Array<ItemView | PastItem>;
    summary: { due: number; done: number; pending: number; closed: boolean } | null;
    away: boolean;
  }>;
}

export interface ChoreHistory {
  chore: string;
  member: string;
  streak: { days?: number; weeks?: number };
  recent: Array<{ at: string; done_by: string; state: string; occurrence: string }>;
  weeks: { done: number; of: number };
  usual: { band: Band | null; day: string | null };
}

export interface CompleteResult {
  result: 'done' | 'pending' | 'already_done' | 'nothing_open';
  occurrence?: string;
  stars?: number;
}
