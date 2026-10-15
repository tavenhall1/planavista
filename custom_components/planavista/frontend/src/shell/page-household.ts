/**
 * One household subscription for the whole page (milestone 11): kiosk mode and
 * the screensaver both follow it, so a page holds one, not one per feature.
 */
import type { HouseholdView } from '../core/household';
import { HouseholdConnection, HouseholdSubscription } from '../core/household-client';

type Listener = (view: HouseholdView | null) => void;

const listeners = new Set<Listener>();
let last: HouseholdView | null = null;
let subscription: HouseholdSubscription | null = null;

/** Hear the household as this page's account sees it; the last view at once when there is one. */
export function onPageHousehold(listener: Listener): () => void {
  listeners.add(listener);
  if (last) listener(last);
  return () => listeners.delete(listener);
}

/** Follow Home Assistant's connection (a new one after a reconnect). */
export function followPageConnection(connection: HouseholdConnection | undefined): void {
  subscription ??= new HouseholdSubscription(view => {
    last = view;
    for (const listener of listeners) listener(view);
  });
  subscription.update(connection);
}
