import { PageRegistry } from '../core/page-registry';
import { version } from '../../package.json';
import {
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  settingsRegistry,
  setupRegistry,
} from '../core/settings-registry';
import { appearanceSettings, appearanceSummary, resolveMode } from '../core/appearance';
import { sunOf } from '../core/appearance-deps';

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** The shell's Settings pages. */
export const shellSettingsPages: SettingsPage[] = [
  {
    id: 'people',
    label: 'People',
    group: 'people',
    order: 100,
    tag: 'pv-settings-people',
    applies: ({ household }) => household !== null,
    summary: ({ household }) => {
      const n = household?.members.length ?? 0;
      return n === 0 ? 'No one yet' : count(n, 'person', 'people');
    },
  },
  {
    id: 'appearance',
    label: 'Appearance',
    group: 'appearance',
    order: 400,
    tag: 'pv-settings-appearance',
    summary: ({ data }) => appearanceSummary(appearanceSettings(data.display)),
    // Spec 15.4: automatic at sunset and sunrise without the Sun integration uses the schedule until it's fixed.
    needsALook: ({ data, hass }) => {
      const settings = appearanceSettings(data?.display);
      const { sunMissing } = resolveMode(settings, { now: new Date(), sun: sunOf(hass?.states as never) });
      return sunMissing ? [{
        id: 'appearance-sun',
        text: "Automatic appearance follows the sun, but Home Assistant's Sun integration isn't set up. The schedule's times are used until it is.",
      }] : [];
    },
  },
  {
    id: 'pins',
    label: 'PINs and parent mode',
    group: 'security',
    order: 500,
    tag: 'pv-settings-pins',
    applies: ({ household }) => household !== null,
    summary: ({ household }) => {
      const pins = household?.members.filter(m => m.has_pin).length ?? 0;
      // Names the switch on the page (milestone 8): this screen, shared or not.
      const screen = household?.account.shared ? 'This screen: shared family screen' : 'This screen: not shared';
      return pins > 0 ? `${screen} · ${count(pins, 'PIN', 'PINs')}` : screen;
    },
  },
  {
    id: 'about',
    label: 'About PlanaVista',
    group: 'about',
    order: 900,
    tag: 'pv-settings-about',
    summary: () => `Version ${version}`,
  },
];

/** The shell's setup steps; modules add theirs between them (spec 14.7). */
export const shellSetupSteps: SetupStep[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    order: 0,
    tag: 'pv-setup-welcome',
    heading: 'Welcome to PlanaVista',
    lead: "Your family's calendar and chores, together on one screen.",
    primary: 'Set up',
    secondary: 'Restore from a PlanaVista file',
  },
  {
    id: 'people',
    label: 'Who lives here?',
    order: 100,
    tag: 'pv-setup-people',
    heading: 'Who lives here?',
    lead: 'Choose everyone in your home and what they are. People without Home Assistant can be added too.',
  },
  {
    id: 'look',
    label: 'Look',
    order: 900,
    tag: 'pv-setup-look',
    heading: 'Pick a look',
    lead: 'You can change it any time in Settings.',
  },
  {
    id: 'done',
    label: 'Done',
    order: 1000,
    tag: 'pv-setup-done',
    heading: "You're all set",
    primary: 'Open the calendar',
  },
];

/** Add the shell's Settings pages and setup steps. */
export function registerShellSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
): void {
  for (const page of shellSettingsPages) settings.register(page);
  for (const step of shellSetupSteps) setup.register(step);
}
