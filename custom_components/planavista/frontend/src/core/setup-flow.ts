import type { HouseholdView } from './household';
import type { SetupPatch } from './settings-registry';

/**
 * How first-run setup moves (spec 14.7). A step can change which steps
 * follow it (choosing common chores brings their step in), and the
 * household's own update arrives a moment later, so the host lays what
 * steps just changed over the household until it does.
 */

/** Two patches as one, the later one winning. */
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
