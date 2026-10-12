import { describe, expect, it } from 'vitest';
import { HEADING_FONT, assetUrl, fontFaceCss, transitionCss } from '../src/shell/page-styles';

describe('page styles', () => {
  it('serve the font next to the bundle with the bundle query', () => {
    expect(assetUrl('http://ha.local:8123/planavista_panel/dist/planavista-cards.js?v=1.2.0-ab12cd34', 'fonts/nunito-latin-wght.woff2'))
      .toBe('http://ha.local:8123/planavista_panel/dist/fonts/nunito-latin-wght.woff2?v=1.2.0-ab12cd34');
  });

  it('declare the heading face with its weights', () => {
    const css = fontFaceCss('http://x/fonts/f.woff2');
    expect(css).toContain(`font-family:'${HEADING_FONT}'`);
    expect(css).toContain('font-weight:200 1000');
    expect(css).toContain('font-display:swap');
  });

  it('sweep with a mask 210 percent tall whose edge stays on screen', () => {
    const css = transitionCss(['planavista-1', 'planavista-2'], 'dusk');
    expect(css).toContain('html[data-pv-vt]::view-transition-old(planavista-1)');
    expect(css).toContain('html[data-pv-vt]::view-transition-old(planavista-2)');
    expect(css).toContain('transparent 47.6%,#000 52.4%');
    expect(css).toContain('mask-size:100% 210%');
    expect(css).toContain('to bottom');
    expect(transitionCss(['planavista-1'], 'dawn')).toContain('to top');
    expect(transitionCss(['planavista-1'], 'reveal')).toContain('::view-transition-new(planavista-1){z-index:2}');
    expect(transitionCss(['planavista-1'], 'none')).toBe('');
    expect(transitionCss([], 'dusk')).toBe('');
  });

  it('lets a tap during the change reach the card underneath (milestone 8)', () => {
    for (const kind of ['dusk', 'dawn', 'reveal', 'fade'] as const) {
      expect(transitionCss(['pv-card-1'], kind)).toContain('html[data-pv-vt]::view-transition{pointer-events:none}');
    }
  });
});
