import type { HomeAssistant } from 'custom-card-helpers';
import type { HouseholdView } from './household';
import type { HouseholdApi } from './household-client';
import type { Layout } from './layout';
import type { PlanaVistaData } from '../types';

/** What every Settings page and setup step receives from its host. */
export interface PageProps {
  hass: HomeAssistant;
  data: PlanaVistaData;
  household: HouseholdView | null;
  api: HouseholdApi;
  layout: Layout;
  mode: 'settings' | 'setup';
}

/** A page asks its host to show another page on top (People opens a person). */
export const PUSH_PAGE = 'pv-push-page';
export interface PushPageDetail {
  tag: string;
  title: string;
  /** The back control's label: the page it returns to ("People"). */
  back: string;
  props?: Record<string, unknown>;
}

/**
 * A pushed page's heading: a person's page follows its member's name as it is
 * now (round 2: after Load the new version the heading kept the old name).
 */
export function pushedTitle(page: PushPageDetail, members: ReadonlyArray<{ id: string; name: string }>): string {
  const id = page.tag === 'pv-settings-person' ? page.props?.memberId : null;
  return (typeof id === 'string' && members.find(m => m.id === id)?.name) || page.title;
}

/** A page asks to go back (a person page after Save, Cancel, or Remove). */
export const POP_PAGE = 'pv-pop-page';

/** A page reports a failed save; the host shows the message. */
export const PAGE_ERROR = 'pv-page-error';

/**
 * An editor page (a person, a chore, a reward) gives the host its Cancel and
 * Save, so Settings holds them in its header, in view however long the page
 * is (milestone 8). Sent when what it says changes; null when it leaves.
 */
export const PAGE_EDITOR = 'pv-page-editor';

export interface PageEditor {
  /** "Save", or "Add" for something new. */
  label: string;
  /** Something changed and nothing is saving. */
  ready: boolean;
  save(): void;
  cancel(): void;
}

/** Tell the Settings host about this editor, or (null) that it left. */
export function announceEditor(page: HTMLElement, editor: PageEditor | null): void {
  page.dispatchEvent(new CustomEvent<PageEditor | null>(PAGE_EDITOR, { detail: editor, bubbles: true, composed: true }));
}

/** A page asks for a module's view (Open Dana's day): Settings closes and the card goes there. */
/**
 * How an editor's Cancel (or Settings leaving it) goes: at once without
 * changes, after asking with them, and once what it edits was deleted on
 * another screen, at once with the draft dropped, since nothing is left to
 * keep it for (round 3: Cancel asked a question the deleted state never drew).
 */
export function editorExit(dirty: boolean, gone: boolean): 'leave' | 'ask' | 'drop' {
  if (gone) return 'drop';
  return dirty ? 'ask' : 'leave';
}

export const OPEN_TARGET = 'pv-page-open';

/**
 * A module asks the card to open Settings, perhaps at a page (detail: a
 * SettingsTarget, such as the board's Edit); the gear sends it with no detail.
 * The card asks for a parent's PIN first when it must.
 */
export const OPEN_SETTINGS = 'pv-open-settings';

/** Words for a failed save (spec 11.7: what happened and what to do). */
export function saveErrorMessage(code: string): string {
  switch (code) {
    case 'parent_mode_required':
      return "Parent mode ended. Enter a parent's PIN to keep changing settings.";
    case 'not_allowed':
      return 'Only a parent can change this.';
    case 'unavailable':
      return 'Update PlanaVista to change people and PINs.';
    default:
      return "Couldn't save. Check the connection and try again.";
  }
}
