import { Member, inOrder } from '../../../core/household';
import type { Board } from '../chores-types';

/** A chore that isn't saved yet, shown in the preview as the parent picks it. */
export interface PreviewPick {
  member: string;
  name: string;
  /** Floats in This week instead of today. */
  week: boolean;
}

export interface PreviewColumn {
  member: Member;
  today: string[];
  week: string[];
  /** "0 of 3 today", "1 this week", or "Nothing yet". */
  summary: string;
}

/**
 * The board as setup shows it (spec 14.7): each person's chores today and
 * this week, from the board and the picks not saved yet.
 */
export function previewColumns(members: Member[], board: Board | null, picks: PreviewPick[] = []): PreviewColumn[] {
  return inOrder(members).map(member => {
    const items = board?.members[member.id]?.items ?? [];
    const today = items.filter(i => i.section !== 'week').map(i => i.name);
    const week = items.filter(i => i.section === 'week').map(i => i.name);
    for (const pick of picks.filter(p => p.member === member.id)) {
      const list = pick.week ? week : today;
      if (!list.includes(pick.name)) list.push(pick.name);
    }
    const done = board?.members[member.id]?.today.done ?? 0;
    const summary = today.length ? `${done} of ${today.length} today` : week.length ? `${week.length} this week` : 'Nothing yet';
    return { member, today, week, summary };
  });
}

/** The landscape header over the preview: "0 of 6 chores done today". */
export function previewTotal(columns: PreviewColumn[], board: Board | null): string {
  const due = columns.reduce((sum, c) => sum + c.today.length, 0);
  const done = board?.household.done ?? 0;
  return `${Math.min(done, due)} of ${due} ${due === 1 ? 'chore' : 'chores'} done today`;
}
