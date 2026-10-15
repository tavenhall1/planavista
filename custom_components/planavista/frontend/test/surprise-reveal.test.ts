import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { revealKey, revealWords } from '../src/modules/chores/surprise-derive';
import type { Reward } from '../src/modules/chores/chores-types';

const ICE_CREAM: Reward = { id: 'ice_cream_trip', name: 'Ice cream trip', icon: '🍦', cost: 3, needs_ok: true, who: [] };
const source = (path: string) => readFileSync(fileURLToPath(new URL(`../src/${path}`, import.meta.url)), 'utf-8');

describe("the reveal's buttons take only presses meant for them (round 3)", () => {
  it('takes the press guard and starts it over when the buttons arrive', () => {
    // r3a A2 / r3b I1: a long hold's lifting finger, or a skip tap's second tap, pressed Ask for it.
    const reveal = source('modules/chores/pv-surprise-reveal.ts');
    expect(reveal).toMatch(/private readonly _pressGuard = new PressGuard\(this\);/);
    expect(reveal).toMatch(/private _arrive\(\): void \{[^}]*this\._pressGuard\.arm\(\);/);
  });

  it('a key that skipped to the end presses nothing (r3b I2)', () => {
    // Escape is Later at any time; Space or Enter skips while it plays.
    expect(revealKey(' ', 'down', false, null)).toBe('skip');
    expect(revealKey('Enter', 'down', false, null)).toBe('skip');
    expect(revealKey('Escape', 'down', true, null)).toBe('later');
    expect(revealKey('Escape', 'down', false, null)).toBe('later');
    expect(revealKey('a', 'down', false, null)).toBeNull();
    // The skipping key's keyup lands on Ask for it, which took focus: Space would press it.
    expect(revealKey(' ', 'up', true, ' ')).toBe('swallow');
    // Held down, its repeats land on Ask for it too: Enter would press it.
    expect(revealKey('Enter', 'down', true, 'Enter', true)).toBe('swallow');
    expect(revealKey(' ', 'down', true, null, true)).toBe('swallow');
    // A fresh press once the buttons are there is a real press.
    expect(revealKey(' ', 'down', true, null)).toBeNull();
    expect(revealKey(' ', 'up', true, null)).toBeNull();
  });

  it('a waiting ask looks like it can\'t be pressed (r3c C3)', () => {
    expect(source('modules/chores/pv-surprise-reveal.ts')).toMatch(/\.ask:disabled \{[^}]*cursor: default;/);
  });

  it('counts as an overlay, so the look never changes under it (r3a A9)', () => {
    expect(source('shell/planavista-card.ts')).toMatch(/overlayOpen: [^\n]*!!this\._fullscreen/);
  });
});

describe("the reward's button follows the screen while the reveal is open (round 4, r4a A6)", () => {
  it('works out again whether a parent acts when the session changes', () => {
    // Parent mode lapsed under an open reveal: it still said Get it, and pressing it only asked.
    const module = source('modules/chores/pv-chores-module.ts').replace(/\r\n/g, '\n');
    const updated = module.slice(module.indexOf('  protected updated(changed: PropertyValues): void {'));
    expect(updated.slice(0, updated.indexOf('\n  }\n'))).toMatch(/changed\.has\('session'\) \|\| changed\.has\('household'\)\) this\._refreshReveal\(\);/);
    expect(module).toMatch(/private _refreshReveal\(\): void \{[\s\S]*actingParent\(this\.household, this\.session\)\?\.parent === true/);
  });
});

describe("the reward's button says what it does on this screen (r3b I4)", () => {
  it('a parent acting gets it at once, so it says Get it', () => {
    expect(revealWords('Dana', ICE_CREAM, false, true).button).toBe('🎉 Get it');
    expect(revealWords('Dana', ICE_CREAM, false, false).button).toBe('🙋 Ask for it');
    expect(revealWords('Dana', ICE_CREAM, true, true).button).toBe('⏳ Waiting for approval');
  });
});
