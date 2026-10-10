import {
  adjustForContrast,
  contrastText,
  darkTint,
  fromOklch,
  matchedInk,
  matchedSurface,
  parseHex,
  shiftLightness,
  toOklch,
} from '../core/color';


/** The three themes; each has a light and a dark version (spec 12.4). */
export type ThemePair = 'planavista' | 'minimal' | 'vibrant';
export type Mode = 'light' | 'dark';

/** A version's own colors; a missing one is the theme's (light) or Matched (dark). */
export interface ThemeColors {
  accent?: string;
  background?: string;
  /** 'plain', a header preset key, or #RRGGBB. */
  header?: string;
  now_color?: string;
}

/** Shape settings, shared by both versions. */
export interface ThemeShape {
  corner_style?: string;
  shadow_depth?: string;
  event_style?: 'stripes' | 'solid';
  /** 'primary' (their color), 'white', or #RRGGBB; 1.1.0's 'light' reads as 'white'. */
  avatar_border?: string;
}

/** Everything that decides how the card looks, apart from the mode. */
export interface Look {
  pair: ThemePair;
  light: ThemeColors;
  dark: ThemeColors;
  shape: ThemeShape;
}

export type Tokens = Record<string, string>;

export const FONT_BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";
/** Rounded headings and numbers: SF Pro Rounded on Apple devices, the bundled face elsewhere (spec 11.2). */
export const FONT_HEADING = "ui-rounded, 'SF Pro Rounded', 'PlanaVista Rounded', " + FONT_BODY;

export const CORNER_PRESETS: Record<string, { radius: string; radiusLg: string; radiusSm: string }> = {
  sharp: { radius: '4px', radiusLg: '6px', radiusSm: '2px' },
  rounded: { radius: '12px', radiusLg: '16px', radiusSm: '8px' },
  pill: { radius: '20px', radiusLg: '24px', radiusSm: '14px' },
};

export const SHADOW_PRESETS: Record<string, { shadow: string; shadowLg: string; shadowXl: string }> = {
  none: { shadow: 'none', shadowLg: 'none', shadowXl: 'none' },
  subtle: {
    shadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    shadowLg: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
    shadowXl: '0 20px 40px rgba(0, 0, 0, 0.12)',
  },
  bold: {
    shadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
    shadowLg: '0 12px 32px rgba(0, 0, 0, 0.18), 0 6px 14px rgba(0, 0, 0, 0.1)',
    shadowXl: '0 24px 48px rgba(0, 0, 0, 0.24)',
  },
};

/** Header presets from 1.1.0, light and dark. solid_accent follows the accent. */
export const HEADER_PRESETS: Record<string, { light: string; dark: string }> = {
  gradient_purple: {
    light: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    dark: 'linear-gradient(135deg, #3730A3 0%, #581C87 100%)',
  },
  gradient_teal: {
    light: 'linear-gradient(135deg, #0D9488 0%, #2563EB 100%)',
    dark: 'linear-gradient(135deg, #115E59 0%, #1E3A8A 100%)',
  },
  gradient_sunset: {
    light: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    dark: 'linear-gradient(135deg, #92400E 0%, #991B1B 100%)',
  },
  solid_accent: { light: '', dark: '' },
  solid_dark: { light: '#1A1B1E', dark: '#0B0C0D' },
};

const PLANAVISTA_LIGHT: Tokens = {
  'color-scheme': 'light',
  '--pv-bg': '#F8F8F6',
  '--pv-card-bg': '#FFFFFF',
  '--pv-card-bg-elevated': '#FFFFFF',
  '--pv-text': '#1A1B1E',
  '--pv-text-secondary': '#5F6670',
  '--pv-text-muted': '#8E949C',
  '--pv-border': '#E7E7E3',
  '--pv-border-subtle': '#F1F1EE',
  '--pv-track': '#ECECE8',
  '--pv-chip': '#F1F1EE',
  '--pv-seg': '#ECECE8',
  '--pv-seg-on': '#FFFFFF',
  '--pv-accent': '#5B5BD6',
  '--pv-accent-text': '#FFFFFF',
  '--pv-accent-ink': '#5B5BD6',
  '--pv-accent-tint': '#EEEEFC',
  '--pv-accent-tint-ink': '#3B3BB0',
  '--pv-warn-bg': '#FDF1DC',
  '--pv-warn-ink': '#8A5A00',
  '--pv-bad-bg': '#FBE4E4',
  '--pv-bad-ink': '#A12828',
  '--pv-star': '#8A6A00',
  '--pv-danger': '#C62828',
  '--pv-today-bg': 'rgba(91, 91, 214, 0.06)',
  '--pv-now-color': '#E5484D',
  '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
  '--pv-shadow': SHADOW_PRESETS.subtle.shadow,
  '--pv-shadow-lg': SHADOW_PRESETS.subtle.shadowLg,
  '--pv-shadow-xl': SHADOW_PRESETS.subtle.shadowXl,
  '--pv-radius': '12px',
  '--pv-radius-lg': '16px',
  '--pv-radius-sm': '8px',
  '--pv-transition': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  '--pv-font-family': FONT_BODY,
  '--pv-font-heading': FONT_HEADING,
  '--pv-header-gradient': '#FFFFFF',
  '--pv-header-text': '#1A1B1E',
  '--pv-header-muted': '#5F6670',
  '--pv-backdrop': 'rgba(0, 0, 0, 0.3)',
};

const PLANAVISTA_DARK: Tokens = {
  ...PLANAVISTA_LIGHT,
  'color-scheme': 'dark',
  '--pv-bg': '#111214',
  '--pv-card-bg': '#1B1C1F',
  '--pv-card-bg-elevated': '#25272B',
  '--pv-text': '#E9E9E6',
  '--pv-text-secondary': '#A3A7AE',
  '--pv-text-muted': '#6F747C',
  '--pv-border': '#2B2D31',
  '--pv-border-subtle': '#232528',
  '--pv-track': '#2C2E32',
  '--pv-chip': '#25272B',
  '--pv-seg': '#25272B',
  '--pv-seg-on': '#3A3C42',
  '--pv-accent': '#6262DE',
  '--pv-accent-text': '#FFFFFF',
  '--pv-accent-ink': '#8E8EF2',
  '--pv-accent-tint': '#25254A',
  '--pv-accent-tint-ink': '#C5C5FF',
  '--pv-warn-bg': '#382A0F',
  '--pv-warn-ink': '#F0C066',
  '--pv-bad-bg': '#3B1C1F',
  '--pv-bad-ink': '#F3A5A5',
  '--pv-star': '#EFC75E',
  '--pv-danger': '#B93838',
  '--pv-today-bg': 'rgba(142, 142, 242, 0.08)',
  '--pv-now-color': '#FE6062',
  '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
  '--pv-shadow': 'none',
  '--pv-shadow-lg': 'none',
  '--pv-shadow-xl': 'none',
  '--pv-header-gradient': '#1B1C1F',
  '--pv-header-text': '#E9E9E6',
  '--pv-header-muted': '#A3A7AE',
  '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
};

/** Each theme's two versions, exactly as approved (spec 12.4). */
export const THEMES: Record<ThemePair, Record<Mode, Tokens>> = {
  planavista: { light: PLANAVISTA_LIGHT, dark: PLANAVISTA_DARK },
  minimal: {
    light: {
      ...PLANAVISTA_LIGHT,
      '--pv-bg': '#FFFFFF',
      '--pv-border': '#ECEEF1',
      '--pv-border-subtle': '#F5F6F8',
      '--pv-track': '#F1F2F4',
      '--pv-chip': '#F3F4F6',
      '--pv-seg': '#F1F2F4',
      '--pv-accent': '#111827',
      '--pv-accent-ink': '#111827',
      '--pv-accent-tint': '#F3F4F6',
      '--pv-accent-tint-ink': '#111827',
      '--pv-today-bg': 'rgba(17, 24, 39, 0.03)',
      '--pv-shadow': '0 0 0 1px rgba(0, 0, 0, 0.05)',
      '--pv-shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.05)',
      '--pv-shadow-xl': '0 8px 24px rgba(0, 0, 0, 0.08)',
      '--pv-radius': '8px',
      '--pv-radius-lg': '12px',
      '--pv-radius-sm': '6px',
      '--pv-transition': '150ms ease',
    },
    dark: {
      ...PLANAVISTA_DARK,
      '--pv-bg': '#000000',
      '--pv-card-bg': '#0E0E10',
      '--pv-card-bg-elevated': '#18181B',
      '--pv-text': '#EDEDED',
      '--pv-text-secondary': '#A1A1AA',
      '--pv-text-muted': '#71717A',
      '--pv-border': '#1F2023',
      '--pv-border-subtle': '#161618',
      '--pv-track': '#1F2023',
      '--pv-chip': '#18181B',
      '--pv-seg': '#18181B',
      '--pv-seg-on': '#2A2A2E',
      '--pv-accent': '#EDEDED',
      '--pv-accent-text': '#111214',
      '--pv-accent-ink': '#EDEDED',
      '--pv-accent-tint': '#1F1F23',
      '--pv-accent-tint-ink': '#EDEDED',
      '--pv-today-bg': 'rgba(237, 237, 237, 0.05)',
      '--pv-radius': '8px',
      '--pv-radius-lg': '12px',
      '--pv-radius-sm': '6px',
      '--pv-transition': '150ms ease',
      '--pv-header-gradient': '#0E0E10',
      '--pv-header-text': '#EDEDED',
      '--pv-header-muted': '#A1A1AA',
    },
  },
  vibrant: {
    light: {
      ...PLANAVISTA_LIGHT,
      '--pv-bg': '#FAF8FF',
      '--pv-border': '#ECE6FB',
      '--pv-border-subtle': '#F4F0FD',
      '--pv-accent': '#7C3AED',
      '--pv-accent-ink': '#7C3AED',
      '--pv-accent-tint': '#F1EAFE',
      '--pv-accent-tint-ink': '#5B21B6',
      '--pv-today-bg': 'rgba(124, 58, 237, 0.06)',
      '--pv-now-color': '#F43F5E',
      '--pv-shadow': '0 1px 3px rgba(124, 58, 237, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)',
      '--pv-shadow-lg': '0 10px 25px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0, 0, 0, 0.04)',
      '--pv-shadow-xl': '0 20px 40px rgba(124, 58, 237, 0.2)',
      '--pv-radius': '14px',
      '--pv-radius-lg': '20px',
      '--pv-radius-sm': '10px',
      '--pv-transition': '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--pv-header-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      '--pv-header-text': '#FFFFFF',
      '--pv-header-muted': 'rgba(255, 255, 255, 0.85)',
      '--pv-backdrop': 'rgba(124, 58, 237, 0.2)',
    },
    dark: {
      ...PLANAVISTA_DARK,
      '--pv-bg': '#150E22',
      '--pv-card-bg': '#20172F',
      '--pv-card-bg-elevated': '#2A1F3D',
      '--pv-border': '#2E2442',
      '--pv-border-subtle': '#251B36',
      '--pv-track': '#2E2442',
      '--pv-chip': '#2A1F3D',
      '--pv-seg': '#2A1F3D',
      '--pv-seg-on': '#3A2D52',
      '--pv-accent': '#7C4DEB',
      '--pv-accent-ink': '#B79BFA',
      '--pv-accent-tint': '#2E2050',
      '--pv-accent-tint-ink': '#D9C9FF',
      '--pv-today-bg': 'rgba(183, 155, 250, 0.08)',
      '--pv-radius': '14px',
      '--pv-radius-lg': '20px',
      '--pv-radius-sm': '10px',
      '--pv-transition': '250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--pv-header-gradient': 'linear-gradient(135deg, #4C1D95 0%, #831843 100%)',
      '--pv-header-text': '#FFFFFF',
      '--pv-header-muted': 'rgba(255, 255, 255, 0.85)',
    },
  },
};

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex) ?? [0, 0, 0];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The pale accent fill in light mode. */
function lightTint(hex: string): string {
  const { c, h } = toOklch(hex);
  return fromOklch({ l: 0.955, c: Math.min(c, 0.02), h });
}

/** Text on the accent's tint. */
function tintInk(hex: string, mode: Mode): string {
  const { c, h } = toOklch(hex);
  return mode === 'light' ? fromOklch({ l: 0.43, c, h }) : fromOklch({ l: 0.84, c: Math.min(c, 0.09), h });
}

/** Surfaces, lines, and text for a custom background, light or dark by its own lightness. */
function surfaceTokens(bg: string): Tokens {
  if (toOklch(bg).l >= 0.6) {
    const card = toOklch(bg).l >= 0.9 ? '#FFFFFF' : shiftLightness(bg, 0.04);
    return {
      'color-scheme': 'light',
      '--pv-bg': bg,
      '--pv-card-bg': card,
      '--pv-card-bg-elevated': card,
      '--pv-text': '#1A1B1E',
      '--pv-text-secondary': '#5F6670',
      '--pv-text-muted': '#8E949C',
      '--pv-border': shiftLightness(bg, -0.07),
      '--pv-border-subtle': shiftLightness(bg, -0.035),
      '--pv-track': shiftLightness(bg, -0.06),
      '--pv-chip': shiftLightness(bg, -0.04),
      '--pv-seg': shiftLightness(bg, -0.06),
      '--pv-seg-on': card,
      '--pv-event-hover': 'rgba(0, 0, 0, 0.03)',
      '--pv-backdrop': 'rgba(0, 0, 0, 0.3)',
    };
  }
  return {
    'color-scheme': 'dark',
    '--pv-bg': bg,
    '--pv-card-bg': shiftLightness(bg, 0.045),
    '--pv-card-bg-elevated': shiftLightness(bg, 0.075),
    '--pv-text': '#E9E9E6',
    '--pv-text-secondary': '#A3A7AE',
    '--pv-text-muted': '#6F747C',
    '--pv-border': shiftLightness(bg, 0.115),
    '--pv-border-subtle': shiftLightness(bg, 0.07),
    '--pv-track': shiftLightness(bg, 0.12),
    '--pv-chip': shiftLightness(bg, 0.075),
    '--pv-seg': shiftLightness(bg, 0.075),
    '--pv-seg-on': shiftLightness(bg, 0.16),
    '--pv-event-hover': 'rgba(255, 255, 255, 0.04)',
    '--pv-backdrop': 'rgba(0, 0, 0, 0.6)',
  };
}

/** Accent tokens for one version from that version's accent color. */
function accentTokens(hex: string, card: string, mode: Mode): Tokens {
  return {
    '--pv-accent': hex,
    '--pv-accent-text': contrastText(hex),
    '--pv-accent-ink': adjustForContrast(hex, card, 3) ?? hex,
    '--pv-accent-tint': mode === 'light' ? lightTint(hex) : darkTint(hex),
    '--pv-accent-tint-ink': tintInk(hex, mode),
    '--pv-today-bg': rgba(hex, mode === 'light' ? 0.06 : 0.1),
  };
}

/** A solid header color's dark version: its hue, deep enough for white text. */
function matchedHeader(hex: string): string {
  const { l, c, h } = toOklch(hex);
  return fromOklch({ l: Math.min(l, 0.4), c: c * 0.8, h });
}

function headerTokens(header: string, tokens: Tokens, mode: Mode): Tokens {
  if (header === 'plain') {
    return {
      '--pv-header-gradient': tokens['--pv-card-bg'],
      '--pv-header-text': tokens['--pv-text'],
      '--pv-header-muted': tokens['--pv-text-secondary'],
    };
  }
  const preset = HEADER_PRESETS[header];
  const fill = header === 'solid_accent' ? tokens['--pv-accent'] : preset ? preset[mode] : header;
  // 1.1.0's gradients and dark header were drawn for white text; solid colors are measured.
  const text = preset && header !== 'solid_accent' ? '#FFFFFF' : contrastText(fill);
  return {
    '--pv-header-gradient': fill,
    '--pv-header-text': text,
    '--pv-header-muted': text === '#FFFFFF' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 27, 30, 0.7)',
  };
}

/**
 * The CSS custom properties for a look in one mode: the theme's version,
 * then this version's own colors. In dark mode a color set only for light
 * is Matched: derived from the light one in OKLCH (spec 12.4).
 */
export function themeTokens(look: Look, mode: Mode): Tokens {
  const tokens: Tokens = { ...(THEMES[look.pair] ?? THEMES.planavista)[mode] };
  const own = mode === 'light' ? look.light : look.dark;
  const light = look.light;

  const background = own.background ?? (mode === 'dark' && light.background ? matchedSurface(light.background) : undefined);
  if (background && parseHex(background)) Object.assign(tokens, surfaceTokens(background));

  const accent = own.accent ?? (mode === 'dark' && light.accent ? matchedInk(light.accent) : undefined);
  if (accent && parseHex(accent)) Object.assign(tokens, accentTokens(accent, tokens['--pv-card-bg'], mode));

  const header = own.header ?? (mode === 'dark' && light.header
    ? (light.header.startsWith('#') ? matchedHeader(light.header) : light.header)
    : undefined);
  if (header) Object.assign(tokens, headerTokens(header, tokens, mode));
  else if (background && tokens['--pv-header-gradient'] === THEMES[look.pair]?.[mode]['--pv-card-bg']) {
    // A plain header follows a custom background's card color.
    Object.assign(tokens, headerTokens('plain', tokens, mode));
  }

  const now = own.now_color ?? (mode === 'dark' && light.now_color ? matchedInk(light.now_color) : undefined);
  if (now && parseHex(now)) tokens['--pv-now-color'] = now;

  const corners = CORNER_PRESETS[look.shape.corner_style ?? ''];
  if (corners) {
    tokens['--pv-radius'] = corners.radius;
    tokens['--pv-radius-lg'] = corners.radiusLg;
    tokens['--pv-radius-sm'] = corners.radiusSm;
  }
  const shadows = SHADOW_PRESETS[look.shape.shadow_depth ?? ''];
  if (shadows) {
    tokens['--pv-shadow'] = shadows.shadow;
    tokens['--pv-shadow-lg'] = shadows.shadowLg;
    tokens['--pv-shadow-xl'] = shadows.shadowXl;
  }
  const border = look.shape.avatar_border;
  if (border === 'white' || border === 'light') tokens['--pv-avatar-border'] = '#FFFFFF';
  else if (border && parseHex(border)) tokens['--pv-avatar-border'] = border;
  return tokens;
}

/** A person's color and the fill behind their events, for one mode. */
export function personColors(color: string, colorLight: string | undefined, mode: Mode): { color: string; colorLight: string } {
  if (mode === 'light' || !parseHex(color)) return { color, colorLight: colorLight || color };
  return { color: matchedInk(color), colorLight: darkTint(color) };
}

const _applied = new WeakMap<HTMLElement, { key: string; names: string[] }>();

/**
 * Set the tokens on an element, removing any it set before that are gone
 * now (an avatar border turned off). Applying the same tokens again does nothing.
 */
export function applyTokens(element: HTMLElement, tokens: Tokens): void {
  const key = JSON.stringify(tokens);
  const last = _applied.get(element);
  if (last?.key === key) return;
  for (const name of last?.names ?? []) {
    if (!(name in tokens)) element.style.removeProperty(name);
  }
  for (const [name, value] of Object.entries(tokens)) element.style.setProperty(name, value);
  _applied.set(element, { key, names: Object.keys(tokens) });
}
