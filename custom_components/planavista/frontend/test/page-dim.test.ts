import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HA_DIM_CSS, setPageDim } from '../src/shell/page-dim';

// Review m12 I: without kiosk mode, Home Assistant's own top bar and sidebar stayed white beside a dimmed card.
describe("Home Assistant's own bars on a dimmed shared screen", () => {
  afterEach(() => vi.unstubAllGlobals());

  function fakeDocument() {
    const props = new Map<string, string>();
    vi.stubGlobal('document', {
      documentElement: {
        style: {
          setProperty: (n: string, v: string) => void props.set(n, v),
          removeProperty: (n: string) => void props.delete(n),
        },
      },
      querySelector: () => null,
    });
    return props;
  }

  it("dims them by the darkest card's level, and lets go when the cards do", () => {
    const props = fakeDocument();
    const a = {};
    const b = {};
    setPageDim(a, 0.3);
    expect(props.get('--pv-ha-dim')).toMatch(/^brightness\(0\.\d{3}\)$/);
    setPageDim(b, 1);
    expect(props.get('--pv-ha-dim')).toBe(`brightness(${(0.3 ** (1 / 2.2)).toFixed(3)})`);
    setPageDim(a, null);
    expect(props.has('--pv-ha-dim')).toBe(false);
    setPageDim(b, null);
  });

  it("filters only Home Assistant's header and sidebar, by the page's variable", () => {
    expect(HA_DIM_CSS.header).toBe('.header { filter: var(--pv-ha-dim, none); }');
    expect(HA_DIM_CSS.sidebar).toBe('ha-sidebar { filter: var(--pv-ha-dim, none); }');
  });

  it('the appearance controller reports its level and lets go on leaving', () => {
    const source = readFileSync(new URL('../src/shell/appearance-controller.ts', import.meta.url), 'utf8');
    expect(source).toMatch(/setPageDim\(this\._host, this\.dim\)/);
    expect(source).toMatch(/setPageDim\(this\._host, null\)/);
  });
});
