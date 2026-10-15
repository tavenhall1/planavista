import type { HouseholdView, SettingsAccess } from './household';
import type { SetupPatch } from './settings-registry';

/**
 * How first-run setup moves (spec 14.7). A step can change which steps
 * follow it (choosing common chores brings their step in), and the
 * household's own update arrives a moment later, so the host lays what
 * steps just changed over the household until it does.
 */

/** Two patches as one, the later one winning. */
/**
 * First-run setup opens by itself, with no "Tap to begin setup", for an admin
 * on a screen that may set up without a PIN, once a page (the owner,
 * 2026-10-14: PlanaVista's own dashboard opens straight into setup). Never over
 * Settings or a sheet someone has open (0.11.0 review).
 */
export function opensSetupByItself(at: {
  firstRun: boolean; access: SettingsAccess; admin: boolean; opened: boolean; busy: boolean;
}): boolean {
  return at.firstRun && at.access === 'open' && at.admin && !at.opened && !at.busy;
}

export function mergePatch(earlier: SetupPatch, later: SetupPatch | undefined): SetupPatch {
  if (!later) return earlier;
  const modules: Record<string, Record<string, unknown>> = { ...(earlier.modules ?? {}) };
  for (const [id, changes] of Object.entries(later.modules ?? {})) modules[id] = { ...(modules[id] ?? {}), ...changes };
  return { setup: { ...(earlier.setup ?? {}), ...(later.setup ?? {}) }, modules };
}

/** The household as the steps should see it, with a patch laid over it. */
export function withPatch(view: HouseholdView | null, patch: SetupPatch): HouseholdView | null {
  if (!view || (!patch.setup && !patch.modules)) return view;
  const modules: Record<string, unknown> = { ...view.modules };
  for (const [id, changes] of Object.entries(patch.modules ?? {})) {
    modules[id] = { ...((modules[id] as Record<string, unknown> | undefined) ?? {}), ...changes };
  }
  return { ...view, setup: { ...view.setup, ...(patch.setup ?? {}) }, modules };
}

/** Where to go after the step `current`: the next one's index, or null past the last (setup is finished). */
export function stepAfter(steps: Array<{ id: string }>, current: string | undefined): number | null {
  const at = Math.max(0, steps.findIndex(step => step.id === current));
  return at >= steps.length - 1 ? null : at + 1;
}

/** A short setup: only the steps named, in setup's order; every step without a list. */
export function onlySteps<S extends { id: string }>(steps: S[], only: readonly string[] | null | undefined): S[] {
  return only ? steps.filter(step => only.includes(step.id)) : steps;
}

/** What a step's element says about the main button, and which step it belongs to. */
export interface StepButtonSource {
  step?: string;
  primaryLabel?: string;
  ready?: boolean;
}

/**
 * Setup's main button for the step on screen: its own element's label and
 * readiness once that element is drawn (an element still on screen from the
 * step before doesn't count), else the step's own label; a short setup ends
 * on the last step's finish label.
 */
export function stepButton(
  step: { id: string; primary?: string; finish?: string },
  element: StepButtonSource | null,
  { last, short }: { last: boolean; short: boolean },
): { label: string; ready: boolean } {
  const own = element && element.step === step.id ? element : null;
  const label = own?.primaryLabel ?? (short && last ? step.finish : undefined) ?? step.primary ?? (last ? 'Finish' : 'Next');
  return { label, ready: own?.ready !== false };
}
