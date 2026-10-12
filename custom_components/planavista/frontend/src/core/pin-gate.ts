import type { Member } from './household';

/**
 * How a module asks for a PIN (spec 9.3: tap your face, then your PIN). The
 * card owns the PIN sheet and the session; a module says who may unlock and
 * what for, and hears whether a session for one of them started.
 */
export interface PinGate {
  /** `reason` is the line under "Blair, enter your PIN" that says why ("To change Team standup"). */
  ask(members: Member[], heading: string, reason?: string): Promise<boolean>;
}
