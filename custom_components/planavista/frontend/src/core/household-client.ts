import { HouseholdView, Member, MemberChanges } from './household';
import { LiveConnection, LiveSubscription } from './live-subscription';
import { WsApi, WsCaller, errorCode } from './ws-api';
import { retryDelayMs } from '../utils/subscriptions';

export { errorCode, retryDelayMs };
export type { WsCaller };

/** The part of hass.connection the household subscription uses. */
export type HouseholdConnection = LiveConnection<HouseholdView>;

/**
 * Follows planavista/household/subscribe (see LiveSubscription). When the
 * backend has no household (an older PlanaVista, or not set up yet), the
 * view is null.
 */
export class HouseholdSubscription extends LiveSubscription<HouseholdView> {
  constructor(onView: (view: HouseholdView | null) => void) {
    super({ type: 'planavista/household/subscribe' }, onView);
  }
}

export interface UnlockResult {
  ok: boolean;
  session?: string;
  member_id?: string;
  parent?: boolean;
  expires_in?: number;
  reason?: 'no_pin' | 'wrong_pin' | 'paused';
  tries_left?: number;
  retry_after?: number | null;
}

/** The household and PIN commands, with this card's session token added when it has one (see WsApi). */
export class HouseholdApi extends WsApi {

  /** Add someone, or change them; with a revision, a newer one saved meanwhile is refused (changed). */
  saveMember(changes: MemberChanges, existing?: { id: string; rev?: number }): Promise<{ member: Member }> {
    const fields: Record<string, unknown> = { member: changes };
    if (existing) {
      fields.member_id = existing.id;
      if (existing.rev !== undefined) fields.rev = existing.rev;
    }
    return this.call('planavista/household/member/save', fields);
  }

  deleteMember(memberId: string): Promise<void> {
    return this.call('planavista/household/member/delete', { member_id: memberId });
  }

  reorder(order: string[]): Promise<void> {
    return this.call('planavista/household/member/reorder', { order });
  }

  setSharedScreen(shared: boolean): Promise<void> {
    return this.call('planavista/household/shared_screen', { shared });
  }

  saveSecurity(settings: { shuffle_keypad: boolean }): Promise<void> {
    return this.call('planavista/household/settings/save', settings);
  }

  saveSetup(progress: { step?: string | null; completed?: boolean; start?: string | null }): Promise<void> {
    return this.call('planavista/household/setup/save', progress);
  }

  saveConfig(changes: Record<string, unknown>): Promise<void> {
    return this.call('planavista/config/save', changes);
  }

  unlock(memberId: string, pin: string): Promise<UnlockResult> {
    return this.call('planavista/pin/unlock', { member_id: memberId, pin }, false);
  }

  setPin(memberId: string, pin: string): Promise<void> {
    return this.call('planavista/pin/set', { member_id: memberId, pin });
  }

  clearPin(memberId: string): Promise<void> {
    return this.call('planavista/pin/clear', { member_id: memberId });
  }

  clearPause(memberId: string): Promise<void> {
    return this.call('planavista/pin/clear_lockout', { member_id: memberId });
  }

  lock(token: string): Promise<void> {
    return this.call('planavista/pin/lock', { session: token }, false);
  }

  touch(token: string): Promise<{ expires_in: number }> {
    return this.call('planavista/pin/touch', { session: token }, false);
  }
}
