import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { atLevel, onColor } from '../src/core/dimming';
import { NEAR_BLACK, WHITE } from '../src/core/color';
import { withEmoji } from '../src/core/emoji';

const src = (path: string) => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');

// Review m12 B: on a dimmed shared screen, nothing is left at full brightness beside the dimmed theme.
describe('colors the card does not dim itself', () => {
  it('atLevel scales a color in linear light by a level held in CSS, full when unset', () => {
    expect(atLevel('#FB8072')).toBe('color-mix(in srgb-linear, #FB8072 calc(var(--pv-dim, 1) * 100%), #000000)');
    expect(atLevel('#FB8072', '--pv-people-dim')).toContain('var(--pv-people-dim, 1)');
  });

  it('onColor keeps near-black letters and dims white ones, never below 4.5:1 on the color', () => {
    expect(onColor('#F8D66D')).toBe(NEAR_BLACK);
    const navy = onColor('#1E3A8A');
    expect(navy).toMatch(/^color-mix\(in srgb-linear, #FFFFFF calc\(max\(var\(--pv-ink-level, 1\), 0\.\d{3}\) \* 100%\), #000000\)$/);
    // On a dark color the floor is low; on a mid one, white has to stay brighter.
    const floor = (ink: string) => Number(ink.match(/, (0\.\d{3})\)/)![1]);
    expect(floor(onColor('#202020'))).toBeLessThan(floor(onColor('#5B5BD6')));
    expect(onColor('not a color')).toBe(WHITE);
  });

  it('withEmoji wraps only the pictures in a line, so words keep the text rule', () => {
    const line = withEmoji('⏳ Waiting for approval') as { values: unknown[] };
    const parts = line.values[0] as unknown[];
    expect(parts).toHaveLength(3);
    expect((parts[1] as { values: unknown[] }).values).toEqual(['⏳']);
    expect(parts[2]).toBe(' Waiting for approval');
    // A text star and plain words stay text; a joined emoji stays one picture.
    expect(withEmoji('★ 3 stars')).toBe('★ 3 stars');
    const cook = String.fromCodePoint(0x1f9d1, 0x200d, 0x1f373);
    const joined = (withEmoji(`Ask ${cook} now`) as { values: unknown[] }).values[0] as unknown[];
    expect((joined[1] as { values: unknown[] }).values).toEqual([cook]);
  });

  it('letters on people colors go through onColor, not contrastText', () => {
    for (const file of [
      'core/pv-ring.ts',
      'modules/calendar/calendar-module.ts',
      'modules/calendar/components/event-popup.ts',
      'modules/calendar/components/pv-event-chip.ts',
      'modules/calendar/components/view-day.ts',
      'modules/chores/pv-chore-item.ts',
      'modules/chores/pv-chore-tile.ts',
    ]) {
      expect(src(file), file).not.toMatch(/contrastText\(/);
      expect(src(file), file).toMatch(/onColor\(/);
    }
  });

  it('the controller paints the letters level and a dimmed white', () => {
    const controller = src('shell/appearance-controller.ts');
    expect(controller).toMatch(/'--pv-ink-level':/);
    expect(controller).toMatch(/'--pv-white':/);
  });

  it("Settings, the keypad, and setup draw people's raw colors at the level", () => {
    expect(src('core/pv-member-avatar.ts')).toMatch(/atLevel\(member\.color, '--pv-people-dim'\)/);
    for (const file of ['shell/settings/pv-settings.ts', 'shell/pv-pin-sheet.ts', 'shell/setup/pv-setup.ts']) {
      expect(src(file), file).toMatch(/--pv-people-dim: var\(--pv-dim, 1\)/);
    }
  });

  it('pictures and emoji take the media filter', () => {
    expect(src('styles/shared.ts')).toMatch(/\.emo,\s*\.picture,\s*\.pictures button \{\s*filter: var\(--pv-media-filter, none\);/);
    expect(src('modules/chores/chores-styles.ts')).toMatch(/\.emo \{\s*filter: var\(--pv-media-filter, none\);/);
    expect(src('shell/pv-nav-bar.ts')).toMatch(/\.emo \{\s*filter: var\(--pv-media-filter, none\);/);
    for (const file of ['modules/calendar/components/view-week.ts', 'modules/calendar/components/view-agenda.ts']) {
      expect(src(file), file).toMatch(/\.day-weather svg \{\s*filter: var\(--pv-media-filter, none\);/);
    }
    expect(src('modules/chores/pv-chores-column.ts')).toMatch(/<span class="emo" aria-hidden="true">⭐<\/span>/);
    expect(src('modules/chores/pv-chore-tile.ts')).toMatch(/withEmoji\(line\.text\)/);
    expect(src('modules/chores/pv-surprise-reveal.ts')).toMatch(/\.reward \{[^}]*filter: var\(--pv-media-filter, none\)/);
  });

  it('literal whites and golds follow the level', () => {
    expect(src('modules/chores/pv-surprise-reveal.ts')).not.toMatch(/#FFFFFF;/);
    expect(src('modules/chores/surprise-derive.ts')).toMatch(/const GOLD = 'var\(--pv-present-gold, #F5B800\)'/);
    expect(src('styles/shared.ts')).toMatch(/background: var\(--pv-white, #FFFFFF\);/);
  });
});
