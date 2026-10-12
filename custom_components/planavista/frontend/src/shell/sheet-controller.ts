import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { Layout } from '../core/layout';
import { trapTab } from '../core/focus';
import { SheetMotion } from './sheet-motion';

type SheetHost = ReactiveControllerHost & HTMLElement & { layout: Layout };

export interface SheetOptions {
  /** The control to focus once the sheet is open (else its first action). */
  initialFocus?: () => HTMLElement | null;
  /** Takes Escape first (a picker to close, a step to go back); true when it did. */
  escape?: () => boolean;
  /** Asked before Escape, a tap outside, or a drag closes the sheet; false keeps it open. */
  mayDismiss?: () => boolean;
}

/**
 * A sheet's life (spec 11.8, 12.3): it rises from the bottom (or pops in as
 * a card in landscape) on a spring, follows a finger down, keeps Tab inside,
 * closes on Escape, and leaves before it fires pv-sheet-close. The host
 * renders .backdrop, a .panel with role dialog, and a .grab-zone, binds
 * onKeydown to the panel and dismiss() to the backdrop.
 */
export class SheetController implements ReactiveController {
  private readonly _motion: SheetMotion;
  private _opened = false;
  private _closing = false;
  private _detach: (() => void) | null = null;

  constructor(private readonly _host: SheetHost, private readonly _options: SheetOptions = {}) {
    this._motion = new SheetMotion(_host);
    _host.addController(this);
  }

  /** True once the sheet has started to leave. */
  get closing(): boolean {
    return this._closing;
  }

  hostUpdated(): void {
    if (this._opened) return;
    const parts = this._parts();
    if (!parts) return;
    this._opened = true;
    this._motion.open(parts.panel, parts.backdrop);
    this._detach = this._motion.attachDrag(parts.zone, parts.panel, () => this.dismiss());
    (this._options.initialFocus?.() ?? parts.panel.querySelector<HTMLElement>('.actions button'))?.focus();
  }

  hostDisconnected(): void {
    this._detach?.();
    this._detach = null;
  }

  /** Escape, a tap outside, or a drag: it closes unless the sheet asks first. */
  dismiss(): void {
    if (this._closing) return;
    if (this._options.mayDismiss && !this._options.mayDismiss()) {
      const parts = this._parts();
      if (parts) this._motion.springBack(parts.panel);
      return;
    }
    void this.close();
  }

  /** Leave, then say so (a sheet replaced meanwhile says nothing). */
  async close(): Promise<void> {
    if (this._closing) return;
    const parts = this._parts();
    if (!parts) return;
    this._closing = true;
    await this._motion.close(parts.panel, parts.backdrop);
    if (!this._host.isConnected) return;
    this._host.dispatchEvent(new CustomEvent('pv-sheet-close', { bubbles: true, composed: true }));
  }

  onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this._options.escape?.()) return;
      this.dismiss();
      return;
    }
    if (this._host.shadowRoot) trapTab(this._host.shadowRoot, event);
  };

  private _parts(): { panel: HTMLElement; backdrop: HTMLElement; zone: HTMLElement } | null {
    const root = this._host.shadowRoot;
    const panel = root?.querySelector<HTMLElement>('.panel');
    const backdrop = root?.querySelector<HTMLElement>('.backdrop');
    const zone = root?.querySelector<HTMLElement>('.grab-zone');
    return panel && backdrop && zone ? { panel, backdrop, zone } : null;
  }
}
