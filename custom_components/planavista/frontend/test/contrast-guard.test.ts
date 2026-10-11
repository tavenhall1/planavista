import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/core/color';
import { contrastIssues } from '../src/core/contrast-guard';
import { Look, themeTokens } from '../src/styles/theme-pairs';

const look = (changes: Partial<Look>): Look => ({ pair: 'planavista', light: {}, dark: {}, shape: {}, ...changes });

describe('contrastIssues', () => {
  it('finds nothing in the themes as they come', () => {
    expect(contrastIssues(look({}))).toEqual([]);
    expect(contrastIssues(look({ pair: 'minimal' }))).toEqual([]);
    expect(contrastIssues(look({ pair: 'vibrant' }))).toEqual([]);
  });

  it('flags a dark now line on the dark background, with a fix that reads', () => {
    const issues = contrastIssues(look({ dark: { now_color: '#30343F' } }));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ mode: 'dark', key: 'now_color', message: 'The dark now line is hard to see on this background.' });
    expect(contrastRatio(issues[0].fix, themeTokens(look({}), 'dark')['--pv-card-bg'])).toBeGreaterThanOrEqual(3);
  });

  it('flags a pale accent only where it is pale', () => {
    const issues = contrastIssues(look({ light: { accent: '#F9C74F' } }));
    expect(issues.map(i => [i.mode, i.key])).toEqual([['light', 'accent']]);
    expect(contrastRatio(issues[0].fix, '#FFFFFF')).toBeGreaterThanOrEqual(3);
  });

  it('flags a header and a background whose text is hard to read, and the fixes work', () => {
    const issues = contrastIssues(look({ light: { header: '#7F7F7F', background: '#7F7F7F' } }));
    expect(issues.map(i => i.key).sort()).toEqual(['background', 'header']);
    const fixed = Object.fromEntries(issues.map(i => [i.key, i.fix]));
    expect(contrastIssues(look({ light: fixed }))).toEqual([]);
  });

  it('leaves gradient headers alone', () => {
    expect(contrastIssues(look({ light: { header: 'gradient_teal' } }))).toEqual([]);
  });
});
