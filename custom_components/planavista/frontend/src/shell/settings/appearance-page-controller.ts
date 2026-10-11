import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { AppearanceSettings, appearanceSettings } from '../../core/appearance';
import { AppearanceChange, AppearanceEdits, TapPoint } from '../../core/appearance-edits';
import { HouseholdApi, errorCode } from '../../core/household-client';
import { PAGE_ERROR, saveErrorMessage } from '../../core/page-host';
import type { PlanaVistaData } from '../../types';

type Host = ReactiveControllerHost & HTMLElement & {
  drafts?: Map<string, unknown>;
  data?: PlanaVistaData;
  api?: HouseholdApi;
};

/** Where a change came from: the finger for a tap, the control's middle for a key press. */
export function pointOf(event?: Event): TapPoint | undefined {
  if (!event) return undefined;
  const mouse = event as MouseEvent;
  if (typeof mouse.clientX === 'number' && mouse.detail > 0) return { x: mouse.clientX, y: mouse.clientY };
  const target = event.currentTarget as HTMLElement | null;
  if (!target?.getBoundingClientRect) return undefined;
  const rect = target.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Gives a page the card's appearance changes (spec 14.1: Appearance applies
 * as you tap): what to show, and a way to change it. The card keeps one
 * AppearanceEdits in its drafts, shared by Appearance, Customize, and
 * setup's Look step; leaving a page sends what's waiting.
 */
export class AppearancePageController implements ReactiveController {
  private _watched: AppearanceEdits | null = null;
  private _unsubscribe: (() => void) | null = null;
  /** Only when a host hands no drafts: the page still saves, the card shows it once Home Assistant has it. */
  private readonly _fallback: AppearanceEdits;

  constructor(private readonly _host: Host) {
    this._fallback = new AppearanceEdits(() => _host.requestUpdate());
    _host.addController(this);
  }

  get edits(): AppearanceEdits {
    return (this._host.drafts?.get('appearance') as AppearanceEdits | undefined) ?? this._fallback;
  }

  hostConnected(): void {
    this._watch();
  }

  hostUpdate(): void {
    // The drafts can arrive after the page connects.
    this._watch();
  }

  hostDisconnected(): void {
    this._unsubscribe?.();
    this._unsubscribe = null;
    this._watched = null;
    this.edits.flush();
  }

  /** The settings to show: the saved ones with the changes still on their way. */
  current(): AppearanceSettings {
    return this.edits.current(appearanceSettings(this._host.data?.display));
  }

  /** Change settings; they save after a quiet moment, and the card shows them at once. */
  set(changes: AppearanceChange, event?: Event): void {
    this.edits.set(
      changes,
      sent => this._host.api!.saveConfig({ display: sent }),
      err => this._error(err),
      pointOf(event),
    );
  }

  private _watch(): void {
    const edits = this.edits;
    if (edits === this._watched) return;
    this._unsubscribe?.();
    this._watched = edits;
    this._unsubscribe = edits.subscribe(() => this._host.requestUpdate());
  }

  private _error(err: unknown): void {
    this._host.dispatchEvent(new CustomEvent(PAGE_ERROR, {
      detail: { message: saveErrorMessage(errorCode(err)) },
      bubbles: true,
      composed: true,
    }));
  }
}
