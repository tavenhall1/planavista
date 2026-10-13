import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MENU_LAYER, SheetLayer, TOAST_LAYER, nextSheetLayer } from '../src/core/sheet-layer';

// Seen on the kitchen tablet (1.6.1): a chore's options, then Looks good, opened
// the parent's keypad behind the options. Every sheet sat on z-index 100 in the
// card, so the browser painted them by the flex order of what holds them: the
// module (order 3) after the card's own keypad (order 0).
describe('sheets stack in the order they open', () => {
  const host = () => {
    const el = { style: { zIndex: '' }, controllers: [] as SheetLayer[], addController(c: SheetLayer) { this.controllers.push(c); } };
    return el;
  };

  it('gives each sheet a layer above the last one', () => {
    const first = nextSheetLayer();
    expect(first).toBeGreaterThan(100);
    expect(nextSheetLayer()).toBeGreaterThan(first);
  });

  it('puts a sheet on top when it opens, so a PIN asked for from a sheet covers it', () => {
    const options = host();
    const pin = host();
    new SheetLayer(options).hostConnected();
    new SheetLayer(pin).hostConnected();
    expect(Number(pin.style.zIndex)).toBeGreaterThan(Number(options.style.zIndex));
  });

  it('a sheet opened again comes back on top', () => {
    const options = host();
    const pin = host();
    const layer = new SheetLayer(options);
    layer.hostConnected();
    new SheetLayer(pin).hostConnected();
    layer.hostConnected();
    expect(Number(options.style.zIndex)).toBeGreaterThan(Number(pin.style.zIndex));
  });
});

describe('every sheet takes its layer', () => {
  const src = fileURLToPath(new URL('../src', import.meta.url));
  const files = (dir: string): string[] => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
  });
  const sheets = files(src).filter(path => {
    const source = readFileSync(path, 'utf-8');
    return /\bsheetStyles\b/.test(source) && !path.endsWith(join('styles', 'sheet.ts'));
  });

  it('finds the ten sheets', () => {
    expect(sheets).toHaveLength(10);
  });

  it.each(sheets.map(path => [path.slice(src.length + 1), path]))('%s', (_name, path) => {
    expect(readFileSync(path, 'utf-8')).toMatch(/private readonly _layer = new SheetLayer\(this\);/);
  });
});

// Round 1 of the adversarial review: the 1.6.2 layers put the docked Waiting
// for OK panel (a sheet) over Settings, which kept z-index 50; the card's
// toast (z-index 40) hid under every sheet, Undo out of reach; and that toast
// covered the phone bar's views menu (z-index 5).
describe('one order for everything that opens over the card', () => {
  const read = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

  it("Settings and the card's setup take the next layer when they open, so they cover what a module had open", () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/this\._overlayLayer = nextSheetLayer\(\);/);
    expect(card.match(/<div class="pvc-settings-overlay" style=\$\{`z-index:\$\{this\._overlayLayer\}`\}>/g)).toHaveLength(2);
  });

  it('toasts sit above every sheet, and an open menu above a toast', () => {
    expect(TOAST_LAYER).toBeGreaterThan(nextSheetLayer() + 1_000_000);
    expect(MENU_LAYER).toBeGreaterThan(TOAST_LAYER);
    expect(read('core/pv-toast.ts')).toMatch(/z-index: \$\{unsafeCSS\(TOAST_LAYER\)\};/);
    const bar = read('shell/pv-nav-bar.ts');
    const menu = bar.slice(bar.indexOf('    .menu {'));
    const blockEnd = menu.indexOf('\n    }');
    expect(menu.slice(0, blockEnd)).toMatch(/z-index: \$\{unsafeCSS\(MENU_LAYER\)\};/);
  });
});
