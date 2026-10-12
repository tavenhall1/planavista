import type { Member } from '../../../core/household';
import type { LookItem } from '../../../core/settings-registry';
import type { Board, ChoresFeed } from '../chores-types';
import { phoneName } from './reminders-derive';
import { choreEditor } from './targets';

/**
 * What the Chores page puts under Needs a look (spec 15.4, 7.9): chores no one
 * is assigned to, which wait off the board, and chores data that couldn't be
 * read, which Import and export can restore.
 */
export function choresLooks(feed: ChoresFeed | null, board: Board | null): LookItem[] {
  if (feed?.state === 'needs_a_look') {
    return [{
      id: 'chores-data',
      text: "Some chores data couldn't be read, so the board waits for a parent. Restore a PlanaVista file, or start over.",
      page: 'import-export',
    }];
  }
  return (board?.needs_a_look ?? [])
    .filter(entry => entry.kind === 'unassigned')
    .map(entry => ({
      id: `unassigned:${entry.chore}`,
      text: `No one is assigned to ${entry.name}. It waits off the board until someone is.`,
      stack: [choreEditor({ id: entry.chore, name: entry.name })],
    }));
}

/** Phones Home Assistant doesn't have anymore (spec 15.4); each opens its person, where it can be removed. */
export function phoneLooks(feed: ChoresFeed | null, members: Member[]): LookItem[] {
  return (feed?.notify_problems ?? []).flatMap(problem => {
    const member = members.find(m => m.id === problem.member);
    // A phone just removed from the person goes at once, before the feed catches up.
    if (!member || !(Array.isArray(member.phones) && (member.phones as string[]).includes(problem.phone))) return [];
    return [{
      id: `phone:${problem.phone}`,
      text: `${member.name}'s phone, ${phoneName(problem.phone)}, isn't in Home Assistant anymore, so nothing is sent to it.`,
      page: 'people',
      stack: [{ tag: 'pv-settings-person', title: member.name, back: 'People', props: { memberId: member.id } }],
    }];
  });
}
