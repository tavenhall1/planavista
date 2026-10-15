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
  /* Calm-day life (0.12.0): the sun's slow rays, paper birds, a shooting star now and then. */
  .pvs-rays,
  .pvs-bird {
    position: absolute;
    left: 0;
    top: 0;
    will-change: transform;
    pointer-events: none;
  }
  .pvs-meteor {
    position: absolute;
    left: 0;
    top: 0;
    width: 16vmax;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, rgba(255, 246, 228, 0), rgba(255, 246, 228, 0.95));
    transform-origin: 100% 50%;
    opacity: 0;
    pointer-events: none;
  }
  .pvs-rainbow {
    opacity: 0;
  }
  /* Summer evenings: small fireflies low among the trees, at the pines' scale. Their glow and wander are the
     browser's own animations, so a Raspberry Pi spends nothing on them frame to frame. */
  .pvs-fireflies {
    will-change: transform;
  }
  .pvs-fireflies[hidden] {
    display: none;
  }
  .pvs-firefly {
    position: absolute;
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 250, 205, 1) 0, rgba(232, 238, 130, 0.62) 32%, rgba(232, 238, 130, 0) 70%);
    opacity: 0;
    animation: pvs-glow var(--dur) ease-in-out var(--delay) infinite, pvs-wander var(--wander) ease-in-out var(--delay) infinite alternate;
  }
  @keyframes pvs-glow {
    0%, 46%, 100% { opacity: 0; }
    56% { opacity: 1; }
    68% { opacity: 0.15; }
    74% { opacity: 0.7; }
    84% { opacity: 0; }
  }
  @keyframes pvs-wander {
    from { translate: 0 0; }
    to { translate: var(--dx) var(--dy); }
  }
  .pvs-still .pvs-fireflies,
  .pvs-still .pvs-rays {
    display: none;
  }
`;
