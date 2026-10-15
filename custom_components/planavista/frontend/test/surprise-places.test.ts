import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Element behavior is checked on a Home Assistant copy (the hold, the reveal, Safari's click);
// these pin where the surprise shows and the rules those checks depend on.
const read = (path: string) =>
  readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf-8').replace(/\r\n/g, '\n');

describe('the goal surprise waits where the child looks (milestone 10)', () => {
  it('first in a picture column, at the top of a list column', () => {
    const column = read('modules/chores/pv-chores-column.ts');
    expect(column).toMatch(/<div class="tiles">\n\s+\$\{this\._present\(model, 'tile'\)\}/);
    expect(column).toMatch(/\$\{this\._present\(model, 'row'\)\}\$\{repeat\(model\.entries/);
    expect(column).toMatch(/if \(!surprise \|\| surprise\.opened\) return nothing;/);
  });

  it('the board tells each column whether a surprise waits and whether this screen may open it', () => {
    const board = read('modules/chores/pv-chores-board.ts');
    expect(board).toMatch(/\.surprise=\$\{surpriseOf\(id, model\.entry, this\.board\.rewards\)\} \?mayOpen=\$\{mayOpenSurprise\(this\.household, id\)\}/);
  });

  it('at the top of My day, large', () => {
    const myDay = read('modules/chores/pv-chores-my-day.ts');
    expect(myDay).toMatch(/this\.surprise && !this\.surprise\.opened \? html`\n\s+<pv-surprise-present class="surprise"[^`]* large[ >]/);
  });

  it('by the goal in Rewards, and Watch it again once it is opened', () => {
    const rewards = read('modules/chores/pv-chores-rewards.ts');
    expect(rewards).toMatch(/b\.surprise && !b\.surprise\.opened \? html`\n\s+<pv-surprise-present[^`]*shape="row"/);
    expect(rewards).toMatch(/b\.surprise\?\.opened \? html`[\s\S]*?pv-surprise-replay[\s\S]*?Watch it again/);
  });

  it('the module opens it from all three places', () => {
    const module = read('modules/chores/pv-chores-module.ts');
    expect(module.match(/@pv-surprise-open=\$\{\(e: CustomEvent<SurpriseOpenDetail>\) => this\._openSurprise\(e\.detail\)\}/g)).toHaveLength(3);
  });
});

describe('the reveal covers the whole screen', () => {
  it("is shown by the card outside ha-card, whose container query would hold a fixed layer inside it", () => {
    const card = read('shell/planavista-card.ts');
    expect(card).toMatch(/<\/ha-card>\n\s+\$\{this\._renderFullscreen\(\)\}/);
    expect(card).toMatch(/<ha-card [^>]*@pv-fullscreen=\$\{this\._onFullscreen\}>/);
  });

  it("skips to the end only on a press that began on it: the hold's lifting finger lands there in Safari", () => {
    const reveal = read('modules/chores/pv-surprise-reveal.ts');
    expect(reveal).toMatch(/const pressed = this\._pressed;\n\s+this\._pressed = false;\n\s+if \(!pressed/);
    expect(reveal).toMatch(/private _down = \(event: PointerEvent\): void => \{\n\s+this\._pressed = /);
  });
});
