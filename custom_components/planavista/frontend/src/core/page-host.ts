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

/** A page asks to go back (a person page after Save, Cancel, or Remove). */
export const POP_PAGE = 'pv-pop-page';

/** A page reports a failed save; the host shows the message. */
export const PAGE_ERROR = 'pv-page-error';

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
