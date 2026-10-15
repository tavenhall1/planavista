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
    how: "Shared screens dim to the night level, the screensaver's sky goes dark with just the time, date, and weather, and a Screen picked below turns off. Night runs from the latest bedtime to the earliest wake-up in everyone's Sleep times, or at times you set here.",
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
    how: "It comes on after the wait below with no touches. Any touch wakes it at once, and that touch doesn't press anything underneath. At night the sky goes dark and only the time, date, and weather show.",
  },
  screensaver_after: {
    what: 'How long the screen waits before the screensaver comes on.',
    how: 'The wait starts at the last touch. With a Motion sensor picked below, it also waits until nobody has moved in front of the screen for this long.',
  },
  screensaver_screen: {
    what: 'The switch, plug, or light in Home Assistant that powers this screen, if it has one.',
    how: "Pick this screen's own backlight or plug, not a room's light. A light or number is turned down while the screensaver shows; at night the screen is turned off or all the way down, and it comes back in the morning and at a touch. With None, the screen stays on and shows the sky, dark at night.",
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

  // ---- A person ---------------------------------------------------------------
  person_name: {
    what: 'What PlanaVista calls this person everywhere: on the board, in the calendar, and in reminders.',
    how: 'Use the name the family uses. Two people can share a name, but their colors tell them apart.',
  },
  person_color: {
    what: "This person's color: their column on the board, their ring, and the events on their calendars.",
    how: "Each person gets their own color, so the family can tell at a glance whose something is. A color someone else has is marked. In dark mode PlanaVista draws a brighter match of it.",
  },
  person_picture: {
    what: 'What shows in their circle: their initial, an emoji, or their photo.',
    how: "Photo uses the picture of their Home Assistant person, so it needs one linked below with a photo. Young children who can't read names yet find their emoji fastest.",
  },
  person_age_group: {
    what: 'Roughly how old they are, so PlanaVista starts them with fitting settings.',
    how: "With chores on, it sets where they start: young children see pictures and need approval for check-offs, older ones get a list. Each of those can still be changed on their own below.",
  },
  person_parent: {
    what: 'Parents run the household: they open Settings, approve chores, and give rewards.',
    how: "On their own phone or login a parent goes straight in. On a shared screen they enter their PIN first, which starts parent mode for a few minutes.",
  },
  person_pin: {
    what: "This person's PIN for shared screens.",
    how: "A parent's PIN starts parent mode. A child's PIN lets them check off their own chores where a PIN is asked for, so nobody checks off someone else's. Shuffle the keypad and the lock times are in PINs and parent mode.",
  },
  person_ha_person: {
    what: 'Links this person to their Home Assistant person.',
    how: "It brings their photo, lets their phones get approval requests and reminders, and treats their own Home Assistant login as theirs, so a parent's login is parent level without a PIN.",
  },
  person_calendars: {
    what: "The calendars that belong to this person, drawn in their color.",
    how: 'Choose who each calendar belongs to in Calendars. A calendar linked to their Home Assistant person is theirs on its own.',
  },
  person_chores: {
    what: 'How chores work for this person.',
    how: 'These start from their age group and can each be changed: which check-offs need approval, whether they earn stars, and what they are saving for.',
  },
  person_needs_approval: {
    what: "Which of this person's check-offs wait for a parent's approval.",
    how: "Every chore, only some, or never. Young children start with every chore, so a parent sees what was done. A parent's own check-offs count right away.",
  },
  person_my_day: {
    what: "How this person's My day looks: their day from waking to bedtime.",
    how: 'Timeline lays chores and events out by the hour, List keeps them in a simple list, and Pictures shows big picture tiles for children still learning to read.',
  },
  person_goal: {
    what: 'The reward this person is saving their stars for.',
    how: 'Their progress toward it shows on the board, and reaching it waits for them as a wrapped surprise to open.',
  },
  person_away: {
    what: "Pauses chores while this person is away, such as on a trip or at a grandparent's.",
    how: 'Nothing is due or missed during the time away, and their streaks hold. Add the days, and remove them if plans change.',
  },
  person_earns_stars: {
    what: 'Whether this person earns stars for chores.',
    how: 'With it on, each chore done earns stars, which they spend on rewards and can save toward one they pin.',
  },
  person_sleep: {
    what: 'When this person goes to bed and how long they sleep, on school nights and weekends.',
    how: "My day starts after their sleep and ends at bedtime, and shared screens use everyone's Sleep times for night: from the latest bedtime to the earliest wake-up.",
  },
  person_phones: {
    what: "This person's phones with the Home Assistant app, and what each one gets.",
    how: "Parents' phones can get approval requests with Looks good and Send back buttons. Reminders go out at the evening check when chores are still left. Phones come from the app's notify services in Home Assistant.",
  },
  person_stars_give: {
    what: 'Gives or takes stars by hand, with a reason.',
    how: "Use it for a job well done that isn't a chore, or to set things right. It shows in their history like every other change.",
  },
  person_stars_history: {
    what: 'Every star this person earned, spent, or was given, newest first.',
    how: 'Chores done, rewards, and changes by hand are all here, so nothing about a balance is a mystery.',
  },

  // ---- Appearance -------------------------------------------------------------
  appearance_mode: {
    what: 'Whether PlanaVista is light, dark, or changes between them through the day.',
    how: 'Automatic moves to dark at night and back to light in the morning, at a quiet moment when nobody is using the screen.',
  },
  appearance_switch: {
    what: 'When Automatic changes between light and dark.',
    how: "At sunset and sunrise uses your home's location, through Home Assistant's Sun integration. On a schedule uses the times you set. Match Home Assistant follows this device's own Home Assistant theme.",
  },
  appearance_theme: {
    what: "PlanaVista's overall look: its colors, fonts, and feel.",
    how: 'Every theme has a light and a dark version, and Automatic moves between them. Customize changes a theme’s colors and shape.',
  },
  appearance_motion: {
    what: 'How much PlanaVista moves.',
    how: "Full plays the springs, celebrations, and the living sky. Reduced swaps movement for quick fades and keeps the sky still. Follow the device uses this screen's own Reduce motion setting.",
  },
  custom_colors: {
    what: "The theme's colors you can change: the accent, the background, the header, and the now line.",
    how: "Dark colors follow your light ones until you change them. Matched means PlanaVista picks a dark color that goes with your light one; choose Matched again to go back. A color that's hard to read gets a warning and a fix.",
  },
  custom_corners: {
    what: 'How round the corners of cards, buttons, and sheets are.',
    how: "Theme keeps the theme's own. Sharp, Rounded, and Pill apply to both the light and the dark version.",
  },
  custom_shadows: {
    what: 'How much cards and sheets seem to lift off the page.',
    how: "Theme keeps the theme's own. Dark versions draw little or no shadow, since shadows don't show on dark.",
  },
  custom_events: {
    what: 'How an event shared by two or more people looks.',
    how: "Stripes shows each person's color in turn, so you can see who it's for. Solid draws it in one color.",
  },
  custom_avatar_border: {
    what: "The ring around each person's circle.",
    how: "Their color rings it in their own color, White in white, and Custom in a color you pick.",
  },

  // ---- Calendar -----------------------------------------------------------------
  calendars_list: {
    what: "The calendars from Home Assistant that PlanaVista shows.",
    how: "Tick a calendar to show it; untick it to leave it out. Drag a calendar by its handle to change their order, which is the order of the Day view's columns.",
  },
  calendar_name: {
    what: "The name this calendar goes by in PlanaVista.",
    how: "It doesn't rename the calendar in Home Assistant. Short names fit the Day view's columns best.",
  },
  calendar_color: {
    what: "The color this calendar's events are drawn in.",
    how: "A calendar that belongs to someone draws their color, set on their page in People. Others get a color of their own here.",
  },
  calendar_person: {
    what: "The Home Assistant person this calendar is about.",
    how: "Picking someone who is in the household makes the calendar belong to them, so it draws in their color.",
  },
  calendar_belongs_to: {
    what: "Whose calendar this is in the household.",
    how: "It draws in their color and shows in their column of the Day view. Nobody is right for shared calendars, like holidays or school.",
  },
  calendar_time_format: {
    what: 'How times are written.',
    how: '12-hour writes 3:00 PM; 24-hour writes 15:00. Chores, the screensaver, and Settings follow it too.',
  },
  calendar_first_day: {
    what: 'The day each week starts on.',
    how: "The Week and Month views start on it, and so do chore weeks: a weekly chore's week runs from this day.",
  },
  calendar_weather: {
    what: 'The weather that shows in the header and on the screensaver.',
    how: "Pick one of your Home Assistant weather services. The header shows the weather now; tap it for the days ahead.",
  },
  calendar_default_view: {
    what: 'The view the calendar opens on.',
    how: 'Day shows each person in their own column, Week and Month show more at once, and Agenda lists what is coming.',
  },
  calendar_address_suggestions: {
    what: 'Suggests addresses as you type an event’s location.',
    how: "Off keeps everything on your home's network. On sends only the text you type to Photon, a free map service, for suggestions; nothing else is sent.",
  },

  // ---- Chores ---------------------------------------------------------------------
  chores_list: {
    what: 'Every chore in the household, by person.',
    how: "Open one to change it, or add a new one. A chore with no one assigned waits off the board until someone is.",
  },
  chores_how_seen: {
    what: 'How a young child sees their chores: as picture tiles they can tell apart without reading.',
    how: "Each chore's picture is what they look for. Open their day to see My day the way they do.",
  },
  chore_name: {
    what: 'What the chore is called on the board, in My day, and in reminders.',
    how: 'Short and plain works best, like Feed the cat. Its picture comes from the name until you pick one.',
  },
  chore_category: {
    what: 'What kind of chore this is, like kitchen or cleaning.',
    how: "It sorts chores when a household plan is brought in from a file. It doesn't change when the chore is due or who does it.",
  },
  chore_schedule: {
    what: 'What kind of chore this is.',
    how: "Plan is part of the household plan, a set amount of time each day or week, like reading. Once is one time, on a day or by a date. Repeats follows a schedule, like every Saturday.",
  },
  chore_who: {
    what: 'Who does this chore.',
    how: 'With two or more people, each one gets their own check-off. With no one, it waits off the board until someone is picked.',
  },
  chore_how_much: {
    what: 'How much time this plan chore takes each day or each week.',
    how: "Plan chores count time rather than single jobs, so the household's plan adds up. The stars it earns follow from the time unless you set them.",
  },
  chore_when: {
    what: 'Which days and what time of day it happens.',
    how: "Set days pin it to those days; without them it can be done any day that week. The time of day puts it in Morning, Afternoon, or Evening on the board.",
  },
  chore_how_long: {
    what: 'About how long this chore takes.',
    how: 'It decides the stars the chore earns, unless you set them, and it helps balance the household plan.',
  },
  chore_once_when: {
    what: 'When this one-time chore is due.',
    how: "On a day puts it on that day's board. By a date lets it be done any day until then, and it shows as overdue after.",
  },
  chore_repeats: {
    what: 'How often it comes back.',
    how: 'Every day, on set days of the week, every few weeks, or once a month. Each time it comes back it is a new check-off.',
  },
  chore_each_time: {
    what: 'How long each time stays open.',
    how: "On the day means it is due on its day, and the household's rule for missed chores applies after. Any time that week, or that month, keeps it under This week until it's done.",
  },
  chore_on_board: {
    what: 'How this chore shows and counts on the board.',
    how: "Show on the board makes a plan chore something to check off. Needs a parent's approval holds each check-off until a parent says yes. Stars come from the time unless you set them. The category groups chores in the week's numbers.",
  },
  chore_automations: {
    what: "This chore's ID for Home Assistant automations, and an example.",
    how: "Use the ID with PlanaVista's actions, for example to check the chore off when the dishwasher finishes. The ID stays the same even if the chore is renamed.",
  },
  rules_missed: {
    what: 'What happens to a chore that is not done on its day.',
    how: "Make it up within the week lets it be done later that week. Strict days counts it missed. Carry it over keeps it until it's done. A change starts with the next chore day, and a parent can excuse a sick day under any rule.",
  },
  rules_days: {
    what: 'When a chore day starts.',
    how: "Check-offs late at night count for the day before, until the chore day starts. Weeks follow First day of the week in Calendar options.",
  },
  rules_approval: {
    what: 'What happens to check-offs still waiting for approval at the end of the day.',
    how: "With Approve at the end of the day on, anything still waiting is approved when the chore day ends. On time means when it was done, not when it was approved.",
  },
  rules_stars: {
    what: 'How many minutes of chores earn a star.',
    how: 'A chore can set its own stars instead. A change applies to stars earned from then on.',
  },
  rules_sound: {
    what: 'A short sound when a chore is checked off.',
    how: 'It plays on the screen where the chore was checked off.',
  },
  reminders_evening: {
    what: 'A look at what is left, on the screen, at a time each evening.',
    how: "At that time the board shows who still has chores. Phone reminders go out then too, only for people with chores left.",
  },
  reminders_phones: {
    what: 'Which people get a reminder on their phone at the evening check.',
    how: "Only people with chores still left get one. Phones are set on each person's page in People.",
  },
  reminders_requests: {
    what: "Which parents' phones get approval requests.",
    how: 'Each request comes with Looks good and Send back buttons. Without a phone, requests wait under To approve on the screen.',
  },
  rewards_list: {
    what: 'What stars can be spent on.',
    how: "Kids see these in Rewards on the board and can pin one as what they're saving up for. Reaching it waits for them as a wrapped surprise.",
  },
  reward_name: {
    what: 'What the reward is called in Rewards and on the surprise.',
    how: 'Name the treat itself, like Ice cream trip, so kids know what they are saving up for.',
  },
  reward_picture: {
    what: "The reward's picture, so it's easy to spot, even before reading.",
    how: 'Pick one that shows the reward. It shows on the reward and on the surprise when it opens.',
  },
  reward_cost: {
    what: 'How many stars the reward costs, and whether a parent approves getting it.',
    how: "With Needs a parent's approval on, redeeming waits for a parent, and the stars are taken then. Without it, redeeming takes the stars at once.",
  },
  reward_who: {
    what: 'Who can get this reward.',
    how: 'Everyone who earns stars, or only some. People earn stars when Stars is on for them on their page.',
  },
  data_import: {
    what: 'Brings in a Household Hours plan: its people, bedtimes, and activities.',
    how: 'You see where everything goes before anything is saved. Importing chores turns chores on.',
  },
  data_export: {
    what: 'Saves people, chores, rewards, and rules as a PlanaVista file.',
    how: "Keep it as a copy or move a household to another Home Assistant. PINs, stars, and history aren't in it; Home Assistant backups keep those.",
  },
  data_restore: {
    what: 'Brings a household back from a PlanaVista file, such as after rebuilding Home Assistant.',
    how: 'It shows what it would bring back before anything changes. Use it after a move or if something was lost.',
  },

  // ---- About ------------------------------------------------------------------------
  about_sidebar: {
    what: "Whether PlanaVista's own dashboard shows in Home Assistant's sidebar.",
    how: "Hidden, it stays at its address for screens that use it, with your changes. Only Home Assistant admins can change this.",
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
    aria-controls=${`help-${key}`} @click=${() => state.toggle(key)}
    @keydown=${(e: KeyboardEvent) => {
      // Escape closes this explainer first; a second Escape reaches the page (review m12b M4).
      if (e.key !== 'Escape' || !state.isOpen(key)) return;
      e.preventDefault();
      e.stopPropagation();
      state.toggle(key);
    }}></button>`;
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

/**
 * A field's label with its ? beside it, never inside it (review m12 G): a
 * button inside a <label> becomes the label's control, so the field lost its
 * name and tapping the name opened the explainer.
 */
export function helpFor(state: HelpState, id: HelpId, name: string, forId: string, instance?: string) {
  return html`<span class="pv-name-line"><label class="label" for=${forId}>${name}</label>${helpButton(state, id, name, instance)}</span>`;
}

/** A setting's name with its ?, for rows that draw their own controls. */
export function helpLabel(state: HelpState, id: HelpId, name: string, labelId?: string, instance?: string, spoken?: string) {
  return html`<span class="pv-name-line"><span class="label" id=${labelId ?? nothing}>${name}</span>${helpButton(state, id, spoken ?? name, instance)}</span>`;
}

export const helpStyles = css`
  .pv-name-line {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  /* In a heading or a legend, the name keeps the heading's own look. */
  :is(h2, h3, legend, .legend, .section-label, .pv-label, .shape-label, .row-text) .pv-name-line .label {
    font: inherit;
    color: inherit;
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
