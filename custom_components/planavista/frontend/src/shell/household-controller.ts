import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { HomeAssistant } from 'custom-card-helpers';
import { HouseholdView } from '../core/household';
import { HouseholdConnection, HouseholdSubscription } from '../core/household-client';

type Host = ReactiveControllerHost & { hass?: HomeAssistant };

/** Follows the household for one card: its people, this account, and setup progress. */
export class HouseholdController implements ReactiveController {
  /** The latest household, or null (not known yet, or an older backend without one). */
  view: HouseholdView | null = null;
  /** The first answer, a view or null, has arrived. */
  ready = false;

  private readonly _subscription = new HouseholdSubscription(view => {
    this.view = view;
    this.ready = true;
    this._host.requestUpdate();
  });

  constructor(private readonly _host: Host) {
    _host.addController(this);
  }

  hostConnected(): void {
    this._follow();
  }

  hostUpdate(): void {
    // A no-op unless Home Assistant handed the card a different connection.
    this._follow();
  }

  hostDisconnected(): void {
    this._subscription.stop();
    this.view = null;
    this.ready = false;
  }

  private _follow(): void {
    this._subscription.update(this._host.hass?.connection as unknown as HouseholdConnection | undefined);
  }
}
