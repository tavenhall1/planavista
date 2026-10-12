import type { Member } from '../../core/household';
import { minutesText } from '../../core/status-map';

/** One person's share of the shared chores this week. */
export interface FairShare {
  member: Member;
  minutes: number;
  /** Exact, for the bar's widths. */
  percent: number;
  /** "Blair 1 h · 100%": the same words in Week and My day (milestone 8). */
  text: string;
}

/** Shared chores by time done (spec 13.4, 13.5): everyone who did some, with their share. */
export function fairnessShares(entries: ReadonlyArray<{ member: Member; minutes: number }>): FairShare[] {
  const total = entries.reduce((sum, s) => sum + s.minutes, 0);
  if (total <= 0) return [];
  return entries
    .filter(s => s.minutes > 0)
    .map(s => {
      const percent = (100 * s.minutes) / total;
      return { ...s, percent, text: `${s.member.name} ${minutesText(s.minutes)} · ${Math.round(percent)}%` };
    });
}
