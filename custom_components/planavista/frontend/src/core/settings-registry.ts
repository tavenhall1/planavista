import type { HomeAssistant } from 'custom-card-helpers';
import { HouseholdView } from './household';
import type { ModuleService } from './module-registry';
import type { PushPageDetail } from './page-host';
import { PageRegistry, WizardPage } from './page-registry';
import { PlanaVistaData } from '../types';

/** What Settings knows when it decides which pages apply and what their rows say. */
export interface SettingsContext {
  household: HouseholdView | null;
  data: PlanaVistaData;
  /** The card's module services (the chores pages read the chores feed). */
  services?: Record<string, ModuleService>;
  /** Home Assistant, for what Settings reads from its states (sun.sun, for Needs a look). */
  hass?: HomeAssistant;
}

/** Where Settings opens: a page, and the pages pushed on it (the board's Edit opens a chore's editor). */
export interface SettingsTarget {
  page: string;
  stack?: PushPageDetail[];
}

/** Something that needs a person (spec 15.4), listed under Needs a look at the top of Settings. */
export interface LookItem {
  id: string;
  text: string;
  /** The page that fixes it, when it isn't the page that reports it. */
  page?: string;
  /** Pages opened on top of that page, such as the editor of a chore no one is assigned to. */
  stack?: PushPageDetail[];
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
  /** What this page can fix that needs a person now (spec 15.4). */
  needsALook?: (ctx: SettingsContext) => LookItem[];
}

/** Everything under Needs a look, from the pages that apply, each with the page that fixes it. */
export function needsALook(pages: SettingsPage[], ctx: SettingsContext): Array<LookItem & { page: string }> {
  return pages.flatMap(page => (page.needsALook?.(ctx) ?? []).map(item => ({ ...item, page: item.page ?? page.id })));
}

/** Where Settings starts for a target: its page and the pages on it, or the list when that page doesn't apply. */
export function settingsAt(
  pages: SettingsPage[],
  target: SettingsTarget | null,
): { selected: string | null; stack: PushPageDetail[] } {
  if (!target || !pages.some(page => page.id === target.page)) return { selected: null, stack: [] };
  return { selected: target.page, stack: target.stack ?? [] };
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
  services?: Record<string, ModuleService>;
}

export interface SetupStep extends WizardPage<SetupContext> {
  /** The element that renders the step. */
  tag: string;
  /** The step's question, shown large (spec 14.7: one question per step). */
  heading: string;
  /** A short line under the heading. */
  lead?: string;
  /** The main button's label; Next (or Finish on the last step) when left out. The step element may change it. */
  primary?: string;
  /** A second way on under the main button, such as "Not now, just the calendar"; the element's secondary() runs it. */
  secondary?: string;
  /** Skip at the top right: on to the next step without the step's commit. */
  skip?: boolean;
  /** A wider column (a step with a board preview beside its choices). */
  wide?: boolean;
  /** The main button's label when this step ends a short setup (Settings' Chores row): "Open the board". */
  finish?: string;
  /** The module the card opens when setup ends on this step. */
  module?: string;
}

/** A Settings page asks the card to run some of setup's steps (the Chores row runs the chores steps, spec 14.7). */
export const RUN_SETUP = 'pv-run-setup';

export interface RunSetupDetail {
  steps: string[];
  /** Backing out of the short setup: undo what it turned on (the Chores row turns chores off again). */
  cancel?: () => Promise<unknown> | void;
}

/** A step asks its host to draw again (its button's label or readiness changed). */
export const STEP_CHANGE = 'pv-step-change';

/** How a step changes what the steps after it see, before the household's next update arrives. */
export interface SetupPatch {
  setup?: Record<string, unknown>;
  modules?: Record<string, Record<string, unknown>>;
}

/** Something a module adds to setup's last step (spec 14.7: a preview of the board, two tips). */
export interface DonePart extends WizardPage<SetupContext> {
  tag: string;
  /** The main button's label while this part shows, such as "Open the board". */
  primary?: string;
  /** The module the card opens when setup finishes. */
  module?: string;
}

/** Where setup starts: the saved step while it still applies, else the first. */
export function resumeIndex(steps: SetupStep[], saved: string | null): number {
  const index = saved ? steps.findIndex(step => step.id === saved) : -1;
  return index >= 0 ? index : 0;
}

/**
 * A part of a person's page that a module adds (spec 14.2: the chores rows,
 * sleep, phones, and Use in automations). The page shows it at its slot:
 * after the age group and Parent, after the PIN, or after the Home Assistant
 * links. The element gets the page's draft and sends changes back with
 * pv-person-change.
 */
export interface PersonSection extends WizardPage<SettingsContext> {
  slot: 'role' | 'pin' | 'links';
  tag: string;
}

/** A section asks the person page to change its draft. */
export const PERSON_CHANGE = 'pv-person-change';

/** Settings pages that the shell and modules contribute. */
export const settingsRegistry = new PageRegistry<SettingsContext, SettingsPage>();

/** Parts of the person page that modules contribute. */
export const personSections = new PageRegistry<SettingsContext, PersonSection>();

/** Parts of setup's last step that modules contribute. */
export const doneParts = new PageRegistry<SetupContext, DonePart>();

/** First-run setup steps that the shell and modules contribute. */
export const setupRegistry = new PageRegistry<SetupContext, SetupStep>();
