import type { Member } from './household';

/**
 * How a module asks for a PIN (spec 9.3: tap your face, then your PIN). The
 * card owns the PIN sheet and the session; a module says who may unlock and
 * what for, and hears whether a session for one of them started.
 */
export interface PinGate {
  ask(members: Member[], heading: string): Promise<boolean>;
}
