import { PageRegistry, WizardContext, WizardPage, settingsPages, setupSteps } from '../core/page-registry';
import { version } from '../../package.json';
import {
  SettingsContext,
  SettingsPage,
  SetupContext,
  SetupStep,
  settingsRegistry,
  setupRegistry,
} from '../core/settings-registry';

/** Pages the shell itself contributes to setup and Settings. */
export const shellPages: WizardPage<WizardContext>[] = [
  { id: 'theme', label: 'Theme', order: 900 },
];

/** Add the shell's pages to setup and Settings. */
export function registerShellPages(
  steps: PageRegistry<WizardContext> = setupSteps,
  settings: PageRegistry<WizardContext> = settingsPages,
): void {
  for (const page of shellPages) {
    steps.register(page);
    settings.register(page);
  }
}

/** The theme names Settings shows (keys as display.theme saves them). */
const THEME_NAMES: Record<string, string> = {
  planavista: 'Clean Light',
  light: 'Clean Light',
  dark: 'Deep Dark',
  minimal: 'Minimal',
  modern: 'Vibrant',
  vibrant: 'Vibrant',
};

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
    summary: ({ data }) => THEME_NAMES[data.display?.theme ?? 'light'] ?? 'Clean Light',
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
      const screen = household?.account.shared ? 'Shared screen' : 'Not a shared screen';
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
  { id: 'welcome', label: 'Welcome', order: 0, tag: 'pv-setup-welcome' },
  { id: 'people', label: 'Who lives here?', order: 100, tag: 'pv-setup-people' },
  { id: 'look', label: 'Look', order: 900, tag: 'pv-setup-look' },
  { id: 'done', label: 'Done', order: 1000, tag: 'pv-setup-done' },
];

/** Add the shell's Settings pages and setup steps. */
export function registerShellSettings(
  settings: PageRegistry<SettingsContext, SettingsPage> = settingsRegistry,
  setup: PageRegistry<SetupContext, SetupStep> = setupRegistry,
): void {
  for (const page of shellSettingsPages) settings.register(page);
  for (const step of shellSetupSteps) setup.register(step);
}
