import { HouseholdView, Member, inOrder, parentsWithPins } from './household';
import type { Session } from './session';

/**
 * The card's copy of the rule the backend enforces (spec 9.5), so a screen
 * can ask for the right PIN before it tries, instead of failing after. The
 * backend still decides; a refusal comes back as pin_required or
 * parent_mode_required.
 */

/** A member-level change (check off, uncheck, plan a day, ask, redeem): allowed now, after a PIN, or never here. */
export type Access = 'yes' | 'pin' | 'no';

/** A parent-level change: allowed now, after a parent's PIN, not possible until a parent has a PIN, or never here. */
export type ParentAccess = 'yes' | 'pin' | 'no_pin' | 'no';

function sharedRules(view: HouseholdView): boolean {
  return view.account.kind === 'shared' || view.account.kind === 'other';
}

/** Whether this screen may change `memberId`'s items. */
export function memberAccess(view: HouseholdView | null, session: Session | null, memberId: string): Access {
  if (!view || !view.available) return 'no';
  const account = view.account;
  if (account.parent_level) return 'yes';
  if (account.kind === 'member') return account.member_id === memberId ? 'yes' : 'no';
  if (!sharedRules(view)) return 'no';
  if (session && (session.parent || session.memberId === memberId)) return 'yes';
  const member = view.members.find(m => m.id === memberId);
  if (!member) return 'no';
  return member.has_pin ? 'pin' : 'yes';
}

/** Whether this screen may make parent-level changes. */
export function parentAccess(view: HouseholdView | null, session: Session | null): ParentAccess {
  if (!view || !view.available) return 'no';
  if (view.account.parent_level) return 'yes';
  if (!sharedRules(view)) return 'no';
  if (session?.parent) return 'yes';
  return parentsWithPins(view.members).length > 0 ? 'pin' : 'no_pin';
}

/**
 * Whether this screen may say `doer` did someone else's chore (round 1 of the
 * adversarial review): crediting a parent, whose check-offs need no approval, takes
 * parent level; anyone else is a change to their own items.
 */
export function creditAccess(view: HouseholdView | null, session: Session | null, doer: Member): Access {
  if (!doer.parent) return memberAccess(view, session, doer.id);
  const access = parentAccess(view, session);
  return access === 'no_pin' ? 'no' : access;
}

/**
 * The people this screen could say did a chore instead of `exceptId`, in the
 * order given: everyone `creditAccess` doesn't rule out (round 2: on a child's
 * own login the list held everyone, and every pick did nothing).
 */
export function creditable(view: HouseholdView | null, session: Session | null, members: Member[], exceptId: string): Member[] {
  if (!view) return [];
  return members.filter(m => m.id !== exceptId && creditAccess(view, session, m) !== 'no');
}

/** Who may unlock a member-level change to `memberId`'s items: them (when they have a PIN), then parents with PINs. */
export function pinChoicesFor(view: HouseholdView | null, memberId: string): Member[] {
  if (!view) return [];
  const member = view.members.find(m => m.id === memberId);
  const parents = parentsWithPins(view.members).filter(m => m.id !== memberId);
  return member?.has_pin ? [member, ...parents] : parents;
}

/**
 * Whether this screen may change a calendar event (milestone 8, D1: events
 * follow 9.5). `owners` holds the member of each calendar the event is on, or
 * null for a calendar that belongs to nobody. An event only on one person's
 * calendar is a member-level change; anything else is parent-level. This is
 * the card's rule (Home Assistant's own calendar stays as it allows), so a
 * household that has asked for no protection (no parent has a PIN), or whose
 * household hasn't answered, keeps changing events as before.
 */
export function eventAccess(view: HouseholdView | null, session: Session | null, owners: readonly (string | null)[]): Access {
  if (!view || !view.available) return 'yes';
  const [only] = owners;
  if (owners.length === 1 && only) return memberAccess(view, session, only);
  const access = parentAccess(view, session);
  return access === 'no_pin' ? 'yes' : access;
}

/** Who may unlock a change to an event: the owner and the parents for one person's event, the parents otherwise. */
export function eventPinChoices(view: HouseholdView | null, owners: readonly (string | null)[]): Member[] {
  if (!view) return [];
  const [only] = owners;
  if (owners.length === 1 && only) return pinChoicesFor(view, only);
  return parentsWithPins(view.members);
}

/** Who did a parent-level change on this screen: the parent in parent mode, or the account's own member. */
export function actingParent(view: HouseholdView | null, session: Session | null): Member | null {
  if (!view) return null;
  const id = session?.parent ? session.memberId : view.account.parent_level ? view.account.member_id : null;
  return inOrder(view.members).find(m => m.id === id) ?? null;
}

/** Whether this account can ever review requests (it decides whether the bar shows Waiting for approval). */
export function mayEverReview(view: HouseholdView | null): boolean {
  return parentAccess(view, null) !== 'no';
}
