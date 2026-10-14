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

/** The verbs the card's questions use, as the line under the keypad says them. */
const VERBS: Record<string, string> = {
  adding: 'add', approving: 'approve', asking: 'ask', changing: 'change', checking: 'check', declining: 'decline', deleting: 'delete', doing: 'do',
  excusing: 'excuse', finishing: 'finish', getting: 'get', giving: 'give', handing: 'hand', opening: 'open', planning: 'plan',
  sending: 'send', setting: 'set', starting: 'start', unchecking: 'uncheck',
};

const FIXED: Record<string, string> = {
  'Whose day is this?': 'To change their My day',
  'Whose goal is this?': 'To set their goal',
};

/**
 * Why the PIN sheet is asking, from its question (milestone 8): "Who's
 * checking off Cat care?" is "To check off Cat care", shown under "Blair,
 * enter your PIN" once the face is picked (or when there is only one face).
 */
export function pinReason(heading: string): string | null {
  if (FIXED[heading]) return FIXED[heading];
  const who = /^Who's (\w+)(.*)\?$/.exec(heading);
  if (who && VERBS[who[1]]) return `To ${VERBS[who[1]]}${who[2]}`;
  const to = /\bto (.+?)\.?$/.exec(heading);
  return to ? `To ${to[1]}` : null;
}
