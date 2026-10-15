import { ReactiveController, ReactiveControllerHost, html, nothing, css } from 'lit';

/**
 * Help in Settings (0.12.0, spec D9): every setting has a ? that opens a short
 * explainer in place under it, What it's for and How it works. The words live
 * here, one entry per setting, so test/help.test.ts can check that each one a
 * page names exists and each one here is used. Plain words; a parent's OK is
 * approval.
 */
export interface HelpEntry {
  what: string;
  how: string;
}

export const HELP = {
  // ---- Shared screens -------------------------------------------------------
  shared_screen: {
    what: "Tells PlanaVista this login is a screen the whole family uses, like the kitchen tablet, rather than one person's phone.",
    how: "Anyone can check off their own chores here, and anything that needs a parent asks for a parent's PIN first, Settings too. Kiosk mode, the screensaver, and dimming only work on shared screens. Turning this on needs a parent with a PIN.",
  },
  night: {
    what: 'The hours the household is asleep.',
    how: "Shared screens dim to the night level, the screensaver goes dark with only the time, and a Screen picked below turns off. Night runs from the latest bedtime to the earliest wake-up in everyone's Sleep times, or at times you set here.",
  },
  kiosk: {
    what: 'Keeps a wall screen on PlanaVista, so nobody wanders into the rest of Home Assistant by accident.',
    how: "PlanaVista hides Home Assistant's menus on shared screens. A parent who is a Home Assistant admin can exit it in parent mode, and it comes back when parent mode ends. It tidies the screen, but it isn't a lock: for that, use Guided Access on an iPad or a kiosk browser on Android.",
  },
  kiosk_top_bar: {
    what: "How much of Home Assistant's top bar stays in kiosk mode.",
    how: "Hidden gives PlanaVista the whole screen. Tabs only keeps the dashboard's tabs, for homes that use other views on the same screen.",
  },
  screensaver: {
    what: 'Shows a calm living sky with the time, the weather, and today when nobody is using the screen.',
    how: "It comes on after the wait below with no touches. Any touch wakes it at once, and that touch doesn't press anything underneath. At night the sky goes dark and only the time shows.",
  },
  screensaver_after: {
    what: 'How long the screen waits before the screensaver comes on.',
    how: 'The wait starts at the last touch. With a Motion sensor picked below, it also waits until nobody has moved in front of the screen for this long.',
  },
  screensaver_screen: {
    what: 'The switch, plug, or light in Home Assistant that powers this screen, if it has one.',
    how: "Pick this screen's own backlight or plug, not a room's light. A light or number is turned down while the screensaver shows; at night the screen is turned off or all the way down, and it comes back in the morning and at a touch. With None, the screen stays on and just goes dark.",
  },
  screensaver_motion: {
    what: "A motion sensor in front of this screen, such as the screen's own camera.",
    how: 'Someone in front of the screen keeps it awake, and walking up wakes it before anyone touches it. Devices signed in with this account share these.',
  },
  screensaver_try: {
    what: 'Shows the screensaver right now as it would look at another time of day, in other weather, or in another season.',
    how: 'Pick any mix, then Show it now. Nothing is saved, and a touch ends it.',
  },
  dim_day: {
    what: 'How bright shared screens are during the day.',
    how: "Most wall screens can't dim themselves, so PlanaVista draws its own colors darker instead. 100% is as bright as the screen goes. Tap a level to see it here for a few seconds.",
  },
  dim_night: {
    what: "How dim shared screens get at night, so a lit screen doesn't light up the room.",
    how: 'Half an hour before night begins, the screen fades slowly down to this level and turns a little warmer, like a lamp. Text dims less than the rest, so it stays easy to read. A touch at night keeps the night level, and in the morning it comes back up over 10 minutes. 100% means no dimming. Tap a level to see it here for a few seconds.',
  },

  // ---- PINs and parent mode -------------------------------------------------
  pins: {
    what: 'A PIN lets someone show who they are on a shared screen: a child checks off only their own chores, and a parent can approve and change things.',
    how: "PINs are 4 to 6 digits, and easy ones like 1234 are turned down. A parent's PIN starts parent mode for a few minutes. After 5 wrong tries a PIN pauses for 30 seconds, and each pause after that is twice as long, up to 15 minutes; a parent can clear a pause here. Forgot every parent's PIN? Sign in to Home Assistant with a parent's or an admin's own account and set new ones here.",
  },
  shuffle_keypad: {
    what: 'Moves the numbers on the keypad each time it opens.',
    how: "The same PIN is tapped in different places each time, so smudges on the glass and a glance over someone's shoulder don't give it away.",
  },
  lock_after: {
    what: 'How long a PIN stays good while nobody touches the screen.',
    how: "After a PIN, the screen locks again once nobody has touched it for this long, like a phone's Auto-Lock. It can't be turned off.",
  },
  parent_mode_ends: {
    what: "The longest parent mode, or a child's unlocked time, can last.",
    how: 'However busy the screen is, it ends this long after the PIN was entered, so a shared screen is never left unlocked for the evening. Enter the PIN again to keep going.',
  },
} as const satisfies Record<string, HelpEntry>;

export type HelpId = keyof typeof HELP;

/** Which explainers are open on one page; tapping a ? opens or closes its own. */
export class HelpState implements ReactiveController {
  private readonly _open = new Set<string>();

  constructor(private readonly _host: ReactiveControllerHost) {
    _host.addController(this);
  }

  hostConnected(): void {}

  isOpen(key: string): boolean {
    return this._open.has(key);
  }

  toggle(key: string): void {
    if (this._open.has(key)) this._open.delete(key);
    else this._open.add(key);
    this._host.requestUpdate();
  }
}

/** A repeated setting (each shared screen's Screen) opens its own explainer. */
const keyOf = (id: HelpId, instance?: string) => (instance ? `${id}-${instance}` : id);

/** The ? after a setting's name: a 24 px circle in a 44 px target. */
export function helpButton(state: HelpState, id: HelpId, name: string, instance?: string) {
  const key = keyOf(id, instance);
  const open = state.isOpen(key);
  return html`<button class="pv-q" type="button" aria-label=${`About ${name}`} aria-expanded=${open ? 'true' : 'false'}
    aria-controls=${`help-${key}`} @click=${() => state.toggle(key)}></button>`;
}

/** The explainer under the setting's row, there only while its ? is open. */
export function helpBox(state: HelpState, id: HelpId, instance?: string) {
  const key = keyOf(id, instance);
  const entry: HelpEntry = HELP[id];
  return html`<div class="pv-help" id=${`help-${key}`} ?hidden=${!state.isOpen(key)}>
    <p><span class="k">What it's for</span>${entry.what}</p>
    <p><span class="k">How it works</span>${entry.how}</p>
  </div>`;
}

/** A setting's name with its ?, for rows that draw their own controls. */
export function helpLabel(state: HelpState, id: HelpId, name: string, labelId?: string, instance?: string) {
  return html`<span class="pv-name-line"><span class="label" id=${labelId ?? nothing}>${name}</span>${helpButton(state, id, name, instance)}</span>`;
}

export const helpStyles = css`
  .pv-name-line {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .pv-q {
    flex: none;
    width: 44px;
    height: 44px;
    margin: -6px 0;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--pv-text-secondary, #5F6670);
    display: inline-grid;
    place-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .pv-q::before {
    content: '?';
    width: 22px;
    height: 22px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    display: grid;
    place-items: center;
    font: 800 0.75rem/1 var(--pv-font-family, inherit);
  }

  .pv-q[aria-expanded='true'] {
    color: var(--pv-accent-ink, #5B5BD6);
  }

  .pv-q[aria-expanded='true']::before {
    background: var(--pv-accent, #5B5BD6);
    border-color: var(--pv-accent, #5B5BD6);
    color: var(--pv-accent-text, #FFFFFF);
  }

  .pv-q:focus-visible {
    outline: 2px solid var(--pv-accent, #5B5BD6);
    outline-offset: -4px;
  }

  .pv-help {
    margin: 6px 0 4px;
    padding: 12px 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--pv-accent, #5B5BD6) 8%, var(--pv-card-bg, #FFFFFF));
    display: grid;
    gap: 8px;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--pv-text, #1A1B1E);
  }

  .pv-help[hidden] {
    display: none;
  }

  .pv-help p {
    margin: 0;
  }

  /* Sentence case, like every head (DESIGN_SYSTEM 11.9). */
  .pv-help .k {
    display: block;
    margin-bottom: 1px;
    font-size: 0.8125rem;
    font-weight: 750;
    color: var(--pv-accent-ink, #5B5BD6);
  }

  @media (prefers-reduced-motion: no-preference) {
    .pv-help:not([hidden]) {
      animation: pv-help-open 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
  }

  @keyframes pv-help-open {
    from {
      opacity: 0;
      translate: 0 -4px;
    }
  }
`;
