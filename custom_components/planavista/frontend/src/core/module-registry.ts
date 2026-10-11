import type { PlanaVistaCardConfig, PlanaVistaData } from '../types';

/** What the shell knows when it asks a module a question. */
export interface ModuleContext {
  config: PlanaVistaCardConfig | undefined;
  data: PlanaVistaData | null;
}

/** A view a module offers in the bar (the calendar's Day, Week, Month, Agenda). */
export interface ModuleView {
  id: string;
  label: string;
}

/** A feature area the card hosts (Calendar today; Chores and Lists later). */
export interface ModuleDefinition {
  /** Stable id, used by the card options `modules` and `module`. */
  id: string;
  /** Name in the module switcher. */
  label: string;
  /** mdi icon for the module switcher. */
  icon: string;
  /** Custom element that renders the module. */
  tag: string;
  /** Position among modules; lower comes first. */
  order: number;
  /** The views the bar offers, in order (spec 12.2). */
  views: ModuleView[];
  /** The view to open on, when the card's options or saved settings name one. */
  initialView?(ctx: ModuleContext): string | undefined;
  /** Entities whose state changes should re-render this module. */
  watchedEntities(ctx: ModuleContext): string[];
}

/** The view a module opens on: the one it asks for when it offers it, else its first. */
export function initialModuleView(mod: Pick<ModuleDefinition, 'views' | 'initialView'>, ctx: ModuleContext): string {
  const wanted = mod.initialView?.(ctx);
  return mod.views.some(view => view.id === wanted) ? (wanted as string) : mod.views[0]?.id ?? '';
}

function byOrderThenId(a: { order: number; id: string }, b: { order: number; id: string }): number {
  return a.order - b.order || a.id.localeCompare(b.id);
}

/** The modules this bundle contains. Registering an id again replaces it. */
export class ModuleRegistry {
  private readonly _modules = new Map<string, ModuleDefinition>();

  register(def: ModuleDefinition): void {
    this._modules.set(def.id, def);
  }

  get(id: string): ModuleDefinition | undefined {
    return this._modules.get(id);
  }

  list(): ModuleDefinition[] {
    return [...this._modules.values()].sort(byOrderThenId);
  }
}

export interface ResolvedModules {
  /** The modules this card shows, in display order. */
  shown: ModuleDefinition[];
  /** The module the card opens on. */
  initial: ModuleDefinition | undefined;
}

/**
 * Apply the card options to the registered modules. `modules` (a list of
 * ids) picks and orders them; unknown ids and repeats are ignored, and if
 * nothing valid is listed every module is shown. `module` names the one the
 * card opens on, if it is shown.
 */
export function resolveModules(
  registered: ModuleDefinition[],
  options: { modules?: unknown; module?: unknown },
): ResolvedModules {
  let shown = registered;
  if (Array.isArray(options.modules)) {
    const picked: ModuleDefinition[] = [];
    for (const id of options.modules) {
      const found = typeof id === 'string' ? registered.find(m => m.id === id) : undefined;
      if (found && !picked.includes(found)) picked.push(found);
    }
    if (picked.length > 0) shown = picked;
  }
  const named = typeof options.module === 'string' ? shown.find(m => m.id === options.module) : undefined;
  return { shown, initial: named ?? shown[0] };
}

/** The bundle's registry. Each module registers itself when it is imported. */
export const moduleRegistry = new ModuleRegistry();
