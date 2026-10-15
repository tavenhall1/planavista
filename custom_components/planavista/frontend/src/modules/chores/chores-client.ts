import { LiveStatus, LiveSubscription } from '../../core/live-subscription';
import { WsApi } from '../../core/ws-api';
import type { Member } from '../../core/household';
import type { ImportChoices, ImportPreview } from './settings/import-derive';
import type { StarEntry } from './settings/person-derive';
import type {
  Activity, ChoreHistory, ChoresFeed, ChoresSettings, CompleteResult, DayView, Reward, WeekView,
} from './chores-types';

/** Follows planavista/chores/subscribe: the board for today, sent again after every change. */
export class ChoresSubscription extends LiveSubscription<ChoresFeed> {
  constructor(onFeed: (feed: ChoresFeed | null) => void, onStatus?: (status: LiveStatus) => void) {
    super({ type: 'planavista/chores/subscribe' }, onFeed, onStatus);
  }
}

/** Why a file can't be imported, item by item (planavista/import/*). */
export interface ImportProblem {
  code: 'unknown_file' | 'newer_file' | 'invalid_file' | string;
  message: string;
  problems: string[];
}

/** What an import did. */
export interface ImportSummary {
  people_added: string[];
  activities_added: number;
  activities_updated: number;
  rewards_added: number;
  rewards_updated: number;
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
  complete(occurrence: string, doneBy?: string, at?: string): Promise<CompleteResult> {
    return this.call('planavista/chores/complete', { occurrence, ...(doneBy ? { done_by: doneBy } : {}), ...(at ? { at } : {}) });
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

  excuseMissed(occurrence: string, note?: string | null): Promise<{ result: string; streak_holds?: boolean }> {
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

  /**
   * Open a member's goal surprise: a shared screen or their own login (milestone 10).
   * No PIN opens it, so a session open on the screen stays out of it (round 3, r3a A1).
   */
  openSurprise(member: string): Promise<{ result: string }> {
    return this.call('planavista/chores/surprise/open', { member }, false);
  }

  awardStars(member: string, stars: number, reason: string): Promise<{ balance: number }> {
    return this.call('planavista/stars/award', { member, stars, reason });
  }

  /** A person's latest stars, newest first (their page: Stars). */
  starHistory(member: string): Promise<{ balance: number; history: StarEntry[] }> {
    return this.call('planavista/stars/history', { member }, false);
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

  /** Read a plan or a PlanaVista file and say where everything would go (nothing is saved). */
  importPreview(text: string): Promise<{ preview?: ImportPreview; problem?: ImportProblem }> {
    return this.call('planavista/import/preview', { text });
  }

  /** Import what the preview showed, with the parent's choices. */
  importApply(text: string, choices: ImportChoices): Promise<{ summary?: ImportSummary; problem?: ImportProblem }> {
    return this.call('planavista/import/apply', { text, choices });
  }

  /** The household as a PlanaVista file. */
  exportHousehold(): Promise<{ file: Record<string, unknown>; name: string }> {
    return this.call('planavista/export', {});
  }

  /** Turn chores on or off for the household (turning them off keeps everything). */
  enable(enabled: boolean): Promise<{ state: string }> {
    return this.call('planavista/chores/enable', { enabled });
  }
}
