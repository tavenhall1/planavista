import type { TransitionKind } from '../core/appearance';

/** The bundled heading face's family name (spec 11.2). */
export const HEADING_FONT = 'PlanaVista Rounded';
export const HEADING_FONT_FILE = 'fonts/nunito-latin-wght.woff2';

/**
 * A file served next to the bundle, with the bundle's own query so a new
 * release fetches it again (Home Assistant serves frontend/dist without
 * cache headers, and the query changes with every bundle).
 */
export function assetUrl(bundleUrl: string, path: string): string {
  const base = new URL(bundleUrl);
  const url = new URL(path, base);
  url.search = base.search;
  return url.href;
}

/**
 * The heading face. It has to be declared on the page: browsers ignore
 * @font-face inside shadow roots. Nothing downloads it until text uses it,
 * and Apple devices use SF Pro Rounded first.
 */
export function fontFaceCss(url: string): string {
  return `@font-face{font-family:'${HEADING_FONT}';src:url('${url}') format('woff2');font-weight:200 1000;font-style:normal;font-display:swap}`;
}

const FONT_STYLE_ID = 'planavista-page-styles';
const TRANSITION_STYLE_ID = 'planavista-transition-styles';

/** Declare the heading face on the page, once for every card. */
export function ensurePageStyles(doc: Document = document, bundleUrl: string = import.meta.url): void {
  if (doc.getElementById(FONT_STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = fontFaceCss(assetUrl(bundleUrl, HEADING_FONT_FILE));
  doc.head.appendChild(style);
}

/** Put the rules for the change about to run on the page; '' takes them away. */
export function setTransitionStyles(css: string, doc: Document = document): void {
  let style = doc.getElementById(TRANSITION_STYLE_ID) as HTMLStyleElement | null;
  if (!css) {
    style?.remove();
    return;
  }
  if (!style) {
    style = doc.createElement('style');
    style.id = TRANSITION_STYLE_ID;
    doc.head.appendChild(style);
  }
  style.textContent = css;
}

/** The sweep's edge: a mask 210 percent tall, its edge between 47.6 and 52.4 percent (spec 12.4). */
const SWEEP_MASK = (direction: 'bottom' | 'top') =>
  `linear-gradient(to ${direction},transparent 0%,transparent 47.6%,#000 52.4%,#000 100%)`;

/**
 * Page-level rules for one day and night change of these cards. Shadow DOM
 * can't style the transition's pseudo-elements, so they live on the page,
 * scoped by the html[data-pv-vt] attribute that exists only while the
 * change runs. The animations themselves are started from script.
 */
export function transitionCss(names: string[], kind: TransitionKind): string {
  if (names.length === 0 || kind === 'none') return '';
  const each = (pseudo: string) => names.map(name => `html[data-pv-vt]::view-transition-${pseudo}(${name})`).join(',');
  const rules = [
    'html[data-pv-vt]::view-transition-old(root),html[data-pv-vt]::view-transition-new(root){animation:none}',
    `${each('group')}{animation:none}`,
    `${each('old')},${each('new')}{animation:none;mix-blend-mode:normal}`,
  ];
  if (kind === 'dusk' || kind === 'dawn') {
    const mask = SWEEP_MASK(kind === 'dusk' ? 'bottom' : 'top');
    const position = kind === 'dusk' ? '0% 100%' : '0% 0%';
    rules.push(
      `${each('old')}{z-index:2;-webkit-mask-image:${mask};mask-image:${mask};-webkit-mask-size:100% 210%;mask-size:100% 210%;` +
        `-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:${position};mask-position:${position}}`,
    );
  }
  if (kind === 'reveal') rules.push(`${each('new')}{z-index:2}`);
  return rules.join('\n');
}
