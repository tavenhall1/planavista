import type { Layout } from '../core/layout';
import { BOUNCY, SMOOTH, motionOf, springEasing } from '../core/motion';
import { guardPageTaps } from '../core/press-guard';
import { sheetDragOffset, sheetDragOutcome } from '../core/sheet-drag';

export { motionOf };

const QUICK_MS = 150;

/**
 * A sheet's entrance, exit, and drag to dismiss (spec 12.3) with the
 * approved springs: in portrait and on phones it rises from the bottom and
 * follows a finger down; in landscape it pops in as a centered card.
 */
export class SheetMotion {
  constructor(private readonly _host: HTMLElement & { layout: Layout }) {}

  private get _rises(): boolean {
    return this._host.layout !== 'landscape';
  }

  open(panel: HTMLElement, backdrop: HTMLElement): void {
    this._host.style.pointerEvents = '';
    backdrop.animate({ opacity: [0, 1] }, { duration: 200, easing: 'ease-out' });
    if (motionOf(this._host) === 'reduced') {
      panel.animate({ opacity: [0, 1] }, { duration: QUICK_MS, easing: 'ease-out' });
      return;
    }
    const spring = springEasing(SMOOTH);
    panel.animate(
      this._rises ? { transform: ['translateY(105%)', 'translateY(0)'] } : { transform: ['scale(0.96)', 'scale(1)'], opacity: [0, 1] },
      { duration: spring.duration, easing: spring.easing },
    );
  }

  /** Animate out; resolves once the sheet has left, so it closes only then. */
  async close(panel: HTMLElement, backdrop: HTMLElement): Promise<void> {
    // On its way out it takes no taps: the next one goes to what is under it (round 2), but not
    // the rest of the burst that closed it (round 5: a double tap on Done pressed the bar beneath).
    this._host.style.pointerEvents = 'none';
    guardPageTaps();
    const reduced = motionOf(this._host) === 'reduced';
    const now = getComputedStyle(panel).transform;
    const from = now && now !== 'none' ? now : 'translateY(0)';
    const out = reduced
      ? panel.animate({ opacity: [1, 0] }, { duration: QUICK_MS, easing: 'ease-in', fill: 'forwards' })
      : panel.animate(
          this._rises ? { transform: [from, 'translateY(105%)'] } : { transform: ['scale(1)', 'scale(0.96)'], opacity: [1, 0] },
          { duration: this._rises ? 240 : 160, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
        );
    backdrop.animate({ opacity: [1, 0] }, { duration: reduced ? QUICK_MS : 200, easing: 'ease-in', fill: 'forwards' });
    await out.finished.catch(() => undefined);
  }

  /** Back to rest after a drag that didn't close it (too short, or the sheet asks first). */
  springBack(panel: HTMLElement): void {
    const from = panel.style.transform || 'translateY(0)';
    panel.style.transform = '';
    const settle = motionOf(this._host) === 'reduced' ? { duration: 120, easing: 'ease-out' } : springEasing(BOUNCY);
    panel.animate({ transform: [from, 'translateY(0)'] }, { duration: settle.duration, easing: settle.easing });
  }

  /** Let a finger drag the panel down by `zone`; `onClose` when it should close. Returns a function that stops listening. */
  attachDrag(zone: HTMLElement, panel: HTMLElement, onClose: () => void): () => void {
    let start: { y: number; t: number } | null = null;
    let dy = 0;
    const down = (e: PointerEvent) => {
      if (!this._rises) return;
      start = { y: e.clientY, t: performance.now() };
      dy = 0;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture is a nicety; the drag still works without it.
      }
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      dy = sheetDragOffset(e.clientY - start.y);
      panel.style.transform = `translateY(${dy}px)`;
    };
    const up = () => {
      if (!start) return;
      const outcome = sheetDragOutcome(dy, performance.now() - start.t);
      start = null;
      if (outcome === 'close') {
        onClose();
        return;
      }
      this.springBack(panel);
    };
    zone.addEventListener('pointerdown', down);
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerup', up);
    zone.addEventListener('pointercancel', up);
    return () => {
      zone.removeEventListener('pointerdown', down);
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerup', up);
      zone.removeEventListener('pointercancel', up);
    };
  }
}
