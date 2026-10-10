import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Box, Layout, classifyLayout } from '../core/layout';

type Host = ReactiveControllerHost & HTMLElement;

/** Fields that bring up an on-screen keyboard (or a picker) when focused. */
const TEXT_FIELDS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Measures the card itself and sets its `layout` attribute: phone, portrait,
 * or landscape (spec 12.1). The card's own box decides, not the device.
 */
export class LayoutController implements ReactiveController {
  layout: Layout = 'landscape';
  private _box: Box | null = null;
  private _measured = false;
  private _textFocused = false;
  private _observer?: ResizeObserver;

  constructor(private readonly _host: Host) {
    _host.addController(this);
  }

  hostConnected(): void {
    this._host.addEventListener('focusin', this._onFocusIn);
    this._host.addEventListener('focusout', this._onFocusOut);
    this._observer = new ResizeObserver(entries => {
      const rect = entries[entries.length - 1]?.contentRect;
      if (rect) this._measure({ width: rect.width, height: rect.height });
    });
    this._observer.observe(this._host);
    const rect = this._host.getBoundingClientRect();
    this._measure({ width: rect.width, height: rect.height });
  }

  hostDisconnected(): void {
    this._observer?.disconnect();
    this._observer = undefined;
    this._host.removeEventListener('focusin', this._onFocusIn);
    this._host.removeEventListener('focusout', this._onFocusOut);
  }

  private _measure(box: Box): void {
    if (box.width === 0 && box.height === 0) return; // not laid out yet
    const next = classifyLayout(box, this._measured ? this.layout : null, this._box, this._textFocused);
    this._box = box;
    this._measured = true;
    if (next !== this.layout || this._host.getAttribute('layout') !== next) {
      this.layout = next;
      this._host.setAttribute('layout', next);
      this._host.requestUpdate();
    }
  }

  private _onFocusIn = (event: FocusEvent): void => {
    const target = event.composedPath()[0] as HTMLElement | undefined;
    this._textFocused = !!target && TEXT_FIELDS.has(target.tagName);
  };

  private _onFocusOut = (): void => {
    this._textFocused = false;
  };
}
