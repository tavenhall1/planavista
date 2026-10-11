import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ForecastConnection, ForecastEntry, ForecastSubscription } from '../utils/weather-subscription';

interface ForecastHass {
  connection?: unknown;
  states?: Record<string, { attributes?: Record<string, unknown> } | undefined>;
}

type Host = ReactiveControllerHost & HTMLElement & { hass?: ForecastHass };

/**
 * One daily forecast per card (spec 12.2: the portrait header's high and
 * low; and the Week and Agenda views), following reconnects.
 */
export class ForecastController implements ReactiveController {
  forecast: ForecastEntry[] = [];

  private readonly _subscription = new ForecastSubscription(forecast => {
    this.forecast = forecast;
    this._host.requestUpdate();
  });

  constructor(
    private readonly _host: Host,
    /** The weather entity the card shows ('' for none). */
    private readonly _entity: () => string,
  ) {
    _host.addController(this);
  }

  hostConnected(): void {
    this._follow();
  }

  hostUpdate(): void {
    this._follow();
  }

  hostDisconnected(): void {
    this._subscription.stop();
    this.forecast = [];
  }

  private _follow(): void {
    const entity = this._entity();
    const hass = this._host.hass;
    this._subscription.update(
      hass?.connection as ForecastConnection | undefined,
      entity,
      hass?.states?.[entity]?.attributes?.forecast as ForecastEntry[] | undefined,
    );
  }
}
