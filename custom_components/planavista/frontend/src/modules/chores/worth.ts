import { starsFor } from '../../core/stars';
import type { Activity } from './chores-types';

/**
 * What one check-off of a chore is worth in minutes for one assignee (spec
 * 8.2): a Plan chore's time (their share when it is split) divided by its
 * check-offs, a Once chore's estimate by its sessions, a Repeats chore's
 * estimate each time. The engine's occurrences follow the same rule; both
 * are checked against tests/fixtures/chores_worth.json.
 */
export function checkoffMinutes(activity: Partial<Activity>, memberId?: string): number {
  if (activity.schedule === 'once') {
    const once = activity.once;
    return (once?.estimate_minutes ?? 15) / Math.max(1, once?.sessions ?? 1);
  }
  if (activity.schedule === 'repeats') return activity.repeats?.estimate_minutes ?? 15;
  const minimum = activity.minimum ?? { hours: 0, per: 'week' };
  const shares = activity.split === 'shared' ? activity.shares : null;
  const owner = memberId ?? activity.assignees?.[0];
  const hours = shares && owner && owner in shares ? shares[owner] : minimum.hours;
  const times = Math.max(1, activity.times ?? 1);
  const days = activity.days?.length ?? 0;
  const each = minimum.per === 'week' && days > 0 ? days * times : times;
  return (hours * 60) / each;
}

/** Stars one check-off earns (spec 8.3): the chore's own number, or the time at the household's rate. */
export function checkoffStars(activity: Partial<Activity>, minutesPerStar: number, memberId?: string): number {
  return starsFor(checkoffMinutes(activity, memberId), minutesPerStar, activity.stars);
}
