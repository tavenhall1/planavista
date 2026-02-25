import { css } from 'lit';

// Width breakpoints (px)
export const BP_XS = 479;
export const BP_SM = 767;
export const BP_MD = 1023;
export const BP_LG = 1439;
// xl = 1440+

// Height breakpoints (px)
export const BP_SHORT = 500;
export const BP_MEDIUM_H = 900;
// tall = 901+

/**
 * Shared responsive CSS utilities.
 * Import into any component that needs breakpoint-aware styles.
 */
export const responsiveStyles = css`
  /* ── Width breakpoints ─────────────────────────── */

  /* xs: phones (≤479px) */
  @media (max-width: 479px) {
    :host { --pv-bp: xs; }
  }

  /* sm: large phones / small tablets (480–767px) */
  @media (min-width: 480px) and (max-width: 767px) {
    :host { --pv-bp: sm; }
  }

  /* md: tablets (768–1023px) */
  @media (min-width: 768px) and (max-width: 1023px) {
    :host { --pv-bp: md; }
  }

  /* lg: small desktops / wall panels (1024–1439px) */
  @media (min-width: 1024px) and (max-width: 1439px) {
    :host { --pv-bp: lg; }
  }

  /* xl: large desktops / wide panels (1440+) */
  @media (min-width: 1440px) {
    :host { --pv-bp: xl; }
  }

  /* ── Height breakpoints ────────────────────────── */

  @media (max-height: 500px) {
    :host { --pv-bp-h: short; }
  }

  @media (min-height: 501px) and (max-height: 900px) {
    :host { --pv-bp-h: medium; }
  }

  @media (min-height: 901px) {
    :host { --pv-bp-h: tall; }
  }
`;
