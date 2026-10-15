import { css, unsafeCSS } from 'lit';
import { SCENE_MARGIN } from './sky';

const margin = unsafeCSS(SCENE_MARGIN);
const margins = unsafeCSS(SCENE_MARGIN * 2);

/**
 * The living sky's layers (the elements SkyScene makes), for the shadow root
 * that holds it. The scene fills its root, which must be a positioned box.
 * Only transforms and opacity move; no filters or blur anywhere.
 */
export const skyStyles = css`
  .pvs-scene {
    position: absolute;
    inset: 0;
    overflow: hidden;
    contain: strict;
    pointer-events: none;
  }
  .pvs-sky,
  .pvs-glow,
  .pvs-flash,
  .pvs-layer,
  .pvs-host {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  /* Drawn past each side, so the slow drift never shows an edge. */
  canvas.pvs-layer {
    top: 0;
    left: -${margin}px;
    width: calc(100% + ${margins}px);
    height: 100%;
  }
  .pvs-ridge {
    will-change: transform;
  }
  .pvs-stars {
    transition: opacity 3s linear;
  }
  .pvs-stars.pvs-b {
    animation: pvs-twinkle 9s ease-in-out infinite alternate;
  }
  .pvs-still .pvs-stars.pvs-b {
    animation: none;
  }
  @keyframes pvs-twinkle {
    from {
      opacity: var(--pvs-stars, 0);
    }
    to {
      opacity: calc(var(--pvs-stars, 0) * 0.15);
    }
  }
  .pvs-sun,
  .pvs-bolt,
  .pvs-cloud {
    position: absolute;
    left: 0;
    top: 0;
    will-change: transform;
    pointer-events: none;
  }
  .pvs-bolt,
  .pvs-flash {
    opacity: 0;
  }
`;
