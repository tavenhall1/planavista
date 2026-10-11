import { adjustForContrast, contrastRatio, parseHex } from './color';
import { Look, Mode, ThemeColors, Tokens, themeTokens } from '../styles/theme-pairs';

export type ColorKey = keyof ThemeColors;

/** A color the household set that would be hard to read, and its one-tap fix (spec 12.4). */
export interface ContrastIssue {
  mode: Mode;
  key: ColorKey;
  message: string;
  /** The color to save for this version (a Matched dark color becomes one set by hand). */
  fix: string;
}

interface Rule {
  /** WCAG's 3:1 for lines and controls, 4.5:1 for text. */
  min: number;
  message(mode: Mode): string;
  /** The contrast to judge; null when there's nothing to judge (a gradient header). */
  ratio(t: Tokens): number | null;
  /** The color that moves, adjusted to reach `target`. */
  fix(t: Tokens, target: number): string | null;
}

const RULES: Record<ColorKey, Rule> = {
  background: {
    min: 4.5,
    message: mode => `Text is hard to read on the ${mode} background.`,
    ratio: t => contrastRatio(t['--pv-text'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-bg'], t['--pv-text'], target),
  },
  accent: {
    min: 3,
    message: mode => `The ${mode} accent is hard to see on this background.`,
    ratio: t => contrastRatio(t['--pv-accent'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-accent'], t['--pv-card-bg'], target),
  },
  header: {
    min: 4.5,
    message: mode => `Text on the ${mode} header is hard to read.`,
    // Gradients and 1.1.0's presets were drawn for their text.
    ratio: t => (parseHex(t['--pv-header-gradient']) ? contrastRatio(t['--pv-header-text'], t['--pv-header-gradient']) : null),
    fix: (t, target) => adjustForContrast(t['--pv-header-gradient'], t['--pv-header-text'], target),
  },
  now_color: {
    min: 3,
    message: mode => `The ${mode} now line is hard to see on this background.`,
    ratio: t => contrastRatio(t['--pv-now-color'], t['--pv-card-bg']),
    fix: (t, target) => adjustForContrast(t['--pv-now-color'], t['--pv-card-bg'], target),
  },
};

const KEYS = Object.keys(RULES) as ColorKey[];

function fails(rule: Rule, t: Tokens): boolean {
  const ratio = rule.ratio(t);
  return ratio !== null && ratio < rule.min;
}

function withColor(look: Look, mode: Mode, key: ColorKey, value: string): Look {
  return { ...look, [mode]: { ...look[mode], [key]: value } };
}

/** The colors this version shows that the household chose: set by hand, or Matched from a light one they set. */
function chosen(look: Look, mode: Mode): ColorKey[] {
  const own = mode === 'light' ? look.light : look.dark;
  return KEYS.filter(key => own[key] !== undefined || (mode === 'dark' && look.light[key] !== undefined));
}

/** Every color the household chose that would be hard to read, light version first, each with a fix that works. */
export function contrastIssues(look: Look): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const mode of ['light', 'dark'] as Mode[]) {
    const tokens = themeTokens(look, mode);
    for (const key of chosen(look, mode)) {
      const rule = RULES[key];
      if (!fails(rule, tokens)) continue;
      // Ask for a little more each time until the whole look passes (cards sit slightly off the background).
      for (const extra of [0, 0.5, 1, 1.5, 2, 3]) {
        const fix = rule.fix(tokens, rule.min + extra);
        if (fix && !fails(rule, themeTokens(withColor(look, mode, key, fix), mode))) {
          issues.push({ mode, key, message: rule.message(mode), fix });
          break;
        }
      }
    }
  }
  return issues;
}
