import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SCREEN_AS_SHOWN, composedAncestor, fitView } from '../src/core/panel-fit';

const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

// A composed tree as Home Assistant builds it: hui-root's shadow root holds the
// view container, the view, the panel view's shadow root, and the card.
interface Node {
  tagName?: string;
  parentNode: Node | null;
  host?: Node;
}
const el = (tagName: string, parentNode: Node | null): Node => ({ tagName, parentNode });
const shadow = (host: Node): Node => ({ parentNode: null, host });

describe('composedAncestor (across shadow roots, up to Home Assistant)', () => {
  const doc: Node = { parentNode: null };
  const root = el('HUI-ROOT', doc);
  const container = el('HUI-VIEW-CONTAINER', shadow(root));
  const panel = el('HUI-PANEL-VIEW', container);
  const hostCard = el('HUI-CARD', shadow(panel));
  const card = el('PLANAVISTA-CARD', hostCard);

  it('finds the view container above the card', () => {
    expect(composedAncestor(card, 'HUI-VIEW-CONTAINER')).toBe(container);
  });

  it('answers null outside a dashboard (a card editor preview, a test page)', () => {
    expect(composedAncestor(el('PLANAVISTA-CARD', el('DIV', doc)), 'HUI-VIEW-CONTAINER')).toBeNull();
  });
});

// Home Assistant's view is at least 100vh tall: in Safari, the screen with its
// toolbars hidden. With them shown the page scrolled by their height (about
// 108 px on an iPhone 17 Pro Max) under a card that fit.
describe('fitView (the view is as tall as the screen as shown)', () => {
  it('sets the minimum height to the screen as shown, and puts back what was there', () => {
    const container = { style: { minHeight: '' } };
    const restore = fitView(container, true);
    expect(container.style.minHeight).toBe(SCREEN_AS_SHOWN);
    expect(SCREEN_AS_SHOWN).toBe('100dvh');
    restore();
    expect(container.style.minHeight).toBe('');
  });

  it("leaves a browser without dvh as it is, and never undoes someone else's change", () => {
    const old = { style: { minHeight: '' } };
    fitView(old, false)();
    expect(old.style.minHeight).toBe('');
    const container = { style: { minHeight: '' } };
    const restore = fitView(container, true);
    container.style.minHeight = '50vh';
    restore();
    expect(container.style.minHeight).toBe('50vh');
  });
});

describe("the card fits Home Assistant's view only as a panel's one card", () => {
  const card = read('shell/planavista-card.ts');

  it('listens for isPanel, which Home Assistant sets, and fits the view while it is connected', () => {
    expect(card).toMatch(/@property\(\{ attribute: false \}\) isPanel = false;/);
    expect(card).toMatch(/if \(!this\.isPanel \|\| !this\.isConnected\) return;/);
    expect(card).toMatch(/composedAncestor<HTMLElement>\(this, 'HUI-VIEW-CONTAINER'\)/);
  });

  it('puts the view back when it leaves', () => {
    const disconnected = card.slice(card.indexOf('disconnectedCallback(): void {'));
    expect(disconnected.slice(0, disconnected.indexOf('\n  }'))).toMatch(/this\._unfitView\?\.\(\);/);
  });
});
