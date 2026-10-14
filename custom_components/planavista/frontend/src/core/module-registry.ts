import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import type { PlanaVistaCardConfig, PlanaVistaData } from '../types';
import type { HouseholdView } from './household';
import type { Session } from './session';

/** What the shell knows when it asks a module a question. */
export interface ModuleContext {
  config: PlanaVistaCardConfig | undefined;
  data: PlanaVistaData | null;
  /** The household once it has answered; null before that, or without one. */
  household?: HouseholdView | null;
}

/** A view a module offers in the bar (the calendar's Day, Week, Month, Agenda). */
export interface ModuleView {
  id: string;
  label: string;
}

/** Where a tap leads: a module, one of its views, and perhaps one person (a ring in the calendar opens their My day). */
export interface OpenTarget {
  module: string;
  view?: string;
  member?: string;
}

/** A glance chip in the header (spec 12.2), such as "9 of 17 chores done today". */
export interface GlanceChip {
  id: string;
  text: string;
  /** 0 to 1: a small ring before the text. */
  progress?: number;
  /** Shown in the one-row landscape header as well as in portrait. */
  primary?: boolean;
  /** Where a tap leads. */
  open?: OpenTarget;
}

/** A button a module adds to the bar or the parent-mode strip, such as "⏳ 2 to approve". */
export interface ModuleAction {
  id: string;
  label: string;
  /** What a phone's narrow bar shows instead ("2"); just the glyph when empty. */
  short?: string;
  /** A leading glyph or emoji. */
  glyph?: string;
  /** 'act' draws it in indigo: something to act on (spec 11.3). */
  tone?: 'act' | 'plain';
}

/** One person's chore progress today, for rings on other screens (spec 13.9). */
export interface MemberProgress {
  done: number;
  pending: number;
  due: number;
}

/** What a module's service can read from the card. */
export interface ServiceHost extends ReactiveControllerHost, HTMLElement {
  hass?: HomeAssistant;
  /** The household, once it has answered. */
  readonly householdView: HouseholdView | null;
  /** The PIN session on this screen. */
  readonly pinSession: Session | null;
  /** The config sensor's data (calendars and their events). */
  readonly planavistaData: PlanaVistaData | null;
  /** A command was refused although it carried this session: the backend already ended it. */
  sessionEnded(token: string): void;
  /** The backend accepted a command made with this session (it counts as a touch there). */
  sessionUsed?(token: string): void;
  /** The service has news: the card redraws the header, the bar, and the modules. */
  serviceChanged(): void;
}

/**
 * Card-wide state a module keeps while the card is on the page, even when
 * another module is on screen: the chores feed behind the header's glance
 * chip and the calendar's rings.
 */
export interface ModuleService extends ReactiveController {
  /** The header's glance chips. */
  glance?(ctx: ModuleContext): GlanceChip[];
  /** Buttons in the bar while this module is on screen. */
  barActions?(ctx: ModuleContext): ModuleAction[];
  /** Buttons in the parent-mode strip (spec 9.4: + Add chore). */
  stripActions?(ctx: ModuleContext): ModuleAction[];
  /** One person's progress today, or null when there's nothing to show. */
  memberProgress?(memberId: string): MemberProgress | null;
}

/** The element a module renders through; the shell hands it bar and strip taps. */
export interface ModuleElement extends HTMLElement {
  moduleAction?(id: string): void;
  /** What it has open, for the card Home Assistant makes again after a reconnect (core/handoff.ts). */
  handoff?(): unknown;
  /** The old card's `handoff()`, given to the new card's module once it shows. */
  resume?(note: unknown): void;
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
  /** Whether the household uses this module (spec 6.3); without it a module is always on. */
  enabled?(ctx: ModuleContext): boolean;
  /** The module's card-wide state, made once per card. */
  service?(host: ServiceHost): ModuleService;
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
 * Apply the household and the card options to the registered modules. A
 * module the household doesn't use is left out. `modules` (a list of ids)
 * picks and orders the rest; unknown ids and repeats are ignored, and if
 * nothing valid is listed every one is shown. `module` names the one the
 * card opens on, if it is shown.
 */
export function resolveModules(
  registered: ModuleDefinition[],
  options: { modules?: unknown; module?: unknown },
  ctx: ModuleContext = { config: undefined, data: null },
): ResolvedModules {
  const usable = registered.filter(m => !m.enabled || m.enabled(ctx));
  let shown = usable;
  if (Array.isArray(options.modules)) {
    const picked: ModuleDefinition[] = [];
    for (const id of options.modules) {
      const found = typeof id === 'string' ? usable.find(m => m.id === id) : undefined;
      if (found && !picked.includes(found)) picked.push(found);
    }
    if (picked.length > 0) shown = picked;
  }
  const named = typeof options.module === 'string' ? shown.find(m => m.id === options.module) : undefined;
  return { shown, initial: named ?? shown[0] };
}

/** The bundle's registry. Each module registers itself when it is imported. */
export const moduleRegistry = new ModuleRegistry();
