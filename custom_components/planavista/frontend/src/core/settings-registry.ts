import { HouseholdView } from './household';
import { PageRegistry, WizardPage } from './page-registry';
import { PlanaVistaData } from '../types';

/** What Settings knows when it decides which pages apply and what their rows say. */
export interface SettingsContext {
  household: HouseholdView | null;
  data: PlanaVistaData;
}

export interface SettingsGroup {
  id: string;
  /** A heading over the group's rows; null for a group that is a single row. */
  label: string | null;
  order: number;
}

/** The sidebar's groups in order (spec 14.1). Chores and data rows arrive with chores. */
export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'people', label: null, order: 100 },
  { id: 'chores', label: 'Chores', order: 200 },
  { id: 'calendar', label: 'Calendar', order: 300 },
  { id: 'appearance', label: null, order: 400 },
  { id: 'security', label: null, order: 500 },
  { id: 'data', label: null, order: 600 },
  { id: 'about', label: null, order: 900 },
];

export interface SettingsPage extends WizardPage<SettingsContext> {
  group: string;
  /** The element that renders the page. */
  tag: string;
  /** The row's current value, such as "4 people". */
  summary?: (ctx: SettingsContext) => string;
}

/** Pages under their groups, in order; a page of an unknown group gets a group of its own at the end. */
export function groupPages(
  pages: SettingsPage[],
  groups: SettingsGroup[] = SETTINGS_GROUPS,
): Array<{ group: SettingsGroup; pages: SettingsPage[] }> {
  const known = new Set(groups.map(g => g.id));
  const extra = [...new Set(pages.map(p => p.group).filter(id => !known.has(id)))]
    .map(id => ({ id, label: null, order: 1000 }));
  return [...groups, ...extra]
    .sort((a, b) => a.order - b.order)
    .map(group => ({ group, pages: pages.filter(p => p.group === group.id) }))
    .filter(entry => entry.pages.length > 0);
}

/** What setup knows when it decides which steps apply. */
export interface SetupContext {
  household: HouseholdView | null;
  data: PlanaVistaData;
}

export interface SetupStep extends WizardPage<SetupContext> {
  /** The element that renders the step. */
  tag: string;
  /** The step's question, shown large (spec 14.7: one question per step). */
  heading: string;
  /** A short line under the heading. */
  lead?: string;
  /** The main button's label; Next (or Finish on the last step) when left out. */
  primary?: string;
}

/** Where setup starts: the saved step while it still applies, else the first. */
export function resumeIndex(steps: SetupStep[], saved: string | null): number {
  const index = saved ? steps.findIndex(step => step.id === saved) : -1;
  return index >= 0 ? index : 0;
}

/** Settings pages that the shell and modules contribute. */
export const settingsRegistry = new PageRegistry<SettingsContext, SettingsPage>();

/** First-run setup steps that the shell and modules contribute. */
export const setupRegistry = new PageRegistry<SetupContext, SetupStep>();
