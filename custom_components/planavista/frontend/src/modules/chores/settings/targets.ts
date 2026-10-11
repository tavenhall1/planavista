import type { PushPageDetail } from '../../../core/page-host';
import type { SettingsTarget } from '../../../core/settings-registry';

/** A chore's editor, pushed on the Chores list (spec 14.4). */
export function choreEditor(chore: { id: string; name: string }): PushPageDetail {
  return { tag: 'pv-chore-editor', title: chore.name, back: 'Chores', props: { choreId: chore.id } };
}

/** Settings at a chore's editor: the board's Edit (spec 13.3), and a chore no one is assigned to. */
export function editChore(chore: { id: string; name: string }): SettingsTarget {
  return { page: 'chores', stack: [choreEditor(chore)] };
}

/** Settings at Import and export: the empty board's Import a plan, and restoring chores data that needs a look. */
export const IMPORT_EXPORT: SettingsTarget = { page: 'import-export' };
