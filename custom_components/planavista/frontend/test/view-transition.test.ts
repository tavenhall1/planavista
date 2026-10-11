import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealCircle, runAppearanceChange } from '../src/shell/view-transition';

describe('the reveal', () => {
  it('grows from the finger until it covers the whole screen', () => {
    // A tap near the top left: the farthest corner is the bottom right.
    expect(revealCircle({ x: 100, y: 50 }, 1280, 800)).toEqual({ x: 100, y: 50, radius: Math.hypot(1180, 750) });
    // A tap near the bottom right reaches back to the top left.
    expect(revealCircle({ x: 1200, y: 700 }, 1280, 800).radius).toBe(Math.hypot(1200, 700));
    // From the middle, every corner is the same distance away.
    expect(revealCircle({ x: 640, y: 400 }, 1280, 800).radius).toBe(Math.hypot(640, 400));
  });
});

describe('a change between light and dark', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('takes its animations away once it is over, so none stay on the page', async () => {
    const animations: Array<{ cancelled: boolean; cancel(): void }> = [];
    let finish: () => void = () => {};
    const page = {
      documentElement: {
        dataset: {} as Record<string, string>,
        animate: () => {
          const animation = { cancelled: false, cancel() { this.cancelled = true; } };
          animations.push(animation);
          return animation;
        },
      },
      head: { appendChild: () => undefined },
      getElementById: () => null,
      createElement: () => ({ remove: () => undefined }),
      startViewTransition: (update: () => Promise<void>) => ({
        ready: update(),
        finished: new Promise<void>(resolve => { finish = resolve; }),
      }),
    };
    vi.stubGlobal('document', page);
    const card = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } as unknown as HTMLElement;

    await runAppearanceChange('dusk', card, async () => {});
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(animations).toHaveLength(1);
    expect(animations[0].cancelled).toBe(false);

    finish();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(animations[0].cancelled).toBe(true);
    expect(page.documentElement.dataset.pvVt).toBeUndefined();
  });
});
