import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
import { WsApi } from '../../core/ws-api';
import type { Member } from '../../core/household';
import type {
  Activity, ChoreHistory, ChoresFeed, ChoresSettings, CompleteResult, DayView, Reward, WeekView,
} from './chores-types';

/** Follows planavista/chores/subscribe: the board for today, sent again after every change. */
export class ChoresSubscription extends LiveSubscription<ChoresFeed> {
  constructor(onFeed: (feed: ChoresFeed | null) => void, onStatus?: (status: LiveStatus) => void) {
    super({ type: 'planavista/chores/subscribe' }, onFeed, onStatus);
  }
}

/** Per-occurrence changes (planavista/chores/override). */
export interface OverrideChanges {
  planned_day?: string | null;
  due?: string | null;
  assignee?: string | null;
  excused?: boolean;
  note?: string | null;
}

/** The chores commands (spec 10.7), with this card's PIN session added when it has one. */
export class ChoresApi extends WsApi {
  complete(occurrence: string, doneBy?: string): Promise<CompleteResult> {
    return this.call('planavista/chores/complete', doneBy ? { occurrence, done_by: doneBy } : { occurrence });
  }

  undo(occurrence: string): Promise<{ result: string }> {
    return this.call('planavista/chores/undo', { occurrence });
  }

  request(kind: 'more_time' | 'skip', occurrence: string, until?: string): Promise<{ request: string }> {
    return this.call('planavista/chores/request', until ? { kind, occurrence, until } : { kind, occurrence });
  }

  review(request: string, decision: 'allow' | 'decline', note?: string | null): Promise<{ result: string }> {
    return this.call('planavista/chores/review', note ? { request, decision, note } : { request, decision });
  }

  override(occurrence: string, changes: OverrideChanges): Promise<{ occurrence: string }> {
    return this.call('planavista/chores/override', { occurrence, ...changes });
  }

  excuseMissed(occurrence: string, note?: string | null): Promise<{ result: string }> {
    return this.call('planavista/chores/excuse_missed', note ? { occurrence, note } : { occurrence });
  }

  saveActivity(activity: Partial<Activity>, existing?: { id: string; rev?: number }): Promise<{ activity: Activity }> {
    const fields: Record<string, unknown> = { activity };
    if (existing) {
      fields.activity_id = existing.id;
      if (existing.rev !== undefined) fields.rev = existing.rev;
    }
    return this.call('planavista/chores/activity/save', fields);
  }

  deleteActivity(activityId: string): Promise<void> {
    return this.call('planavista/chores/activity/delete', { activity_id: activityId });
  }

  /** Rules and Reminders: they apply as a parent taps (spec 14.1). */
  saveSettings(settings: Partial<ChoresSettings>): Promise<{ settings: ChoresSettings }> {
    return this.call('planavista/chores/settings/save', { settings });
  }

  saveReward(reward: Partial<Reward>, rewardId?: string): Promise<{ reward: Reward }> {
    return this.call('planavista/rewards/save', rewardId ? { reward, reward_id: rewardId } : { reward });
  }

  deleteReward(rewardId: string): Promise<void> {
    return this.call('planavista/rewards/delete', { reward_id: rewardId });
  }

  redeem(member: string, reward: string): Promise<{ result: string; request: string }> {
    return this.call('planavista/rewards/redeem', { member, reward });
  }

  awardStars(member: string, stars: number, reason: string): Promise<{ balance: number }> {
    return this.call('planavista/stars/award', { member, stars, reason });
  }

  week(date?: string): Promise<WeekView> {
    return this.call('planavista/chores/week', date ? { date } : {}, false);
  }

  day(date: string): Promise<DayView> {
    return this.call('planavista/chores/day', { date }, false);
  }

  history(chore: string, member: string): Promise<ChoreHistory> {
    return this.call('planavista/chores/history', { chore, member }, false);
  }

  /** A person's own choices: their My day style and the reward they're saving up for. */
  savePrefs(memberId: string, prefs: { my_day?: string; goal?: string | null }): Promise<{ member: Member }> {
    return this.call('planavista/household/member/prefs', { member_id: memberId, ...prefs });
  }

  startOver(): Promise<{ state: string }> {
    return this.call('planavista/chores/start_over', {});
  }
}
