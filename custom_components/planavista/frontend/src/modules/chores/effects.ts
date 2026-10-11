import { BOUNCY, SMOOTH, motionOf, springEasing } from '../../core/motion';

/**
 * The board's small moments (spec 11.5): every animation answers "what just
 * happened?". Only transform and opacity animate, so older wall tablets stay
 * smooth; with reduced motion, flights and glides become quick fades.
 */

/** A light tick on a check-off, a richer one when a ring closes (Android tablets; iOS browsers don't allow it). */
export function haptic(kind: 'tick' | 'ring'): void {
  try {
    navigator.vibrate?.(kind === 'tick' ? 12 : [18, 40, 28]);
  } catch {
    // Vibration is a nicety.
  }
}

let audio: AudioContext | null = null;

/** A soft two-note chime (the optional Sound setting); made, not loaded, so nothing leaves the house. */
export function chime(ring = false): void {
  try {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    audio ??= new Context();
    const now = audio.currentTime;
    const notes = ring ? [659.25, 783.99, 1046.5] : [783.99, 1046.5];
    notes.forEach((frequency, i) => {
      const osc = audio!.createOscillator();
      const gain = audio!.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(audio!.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  } catch {
    // Sound is a nicety.
  }
}

/** "+1 ★" flies from where the check happened to the star counter. */
export function flyStars(host: HTMLElement, layer: HTMLElement, from: DOMRect, to: DOMRect | null, stars: number): void {
  if (stars <= 0) return;
  const box = layer.getBoundingClientRect();
  const badge = document.createElement('span');
  badge.textContent = `+${stars} ★`;
  badge.setAttribute('aria-hidden', 'true');
  Object.assign(badge.style, {
    position: 'absolute',
    left: `${from.left - box.left + from.width / 2}px`,
    top: `${from.top - box.top}px`,
    transform: 'translate(-50%, 0)',
    font: '800 15px var(--pv-font-heading, ui-rounded, system-ui, sans-serif)',
    color: 'var(--pv-star, #8A6A00)',
    pointerEvents: 'none',
    zIndex: '30',
    whiteSpace: 'nowrap',
  });
  layer.appendChild(badge);
  const remove = () => badge.remove();
  if (motionOf(host) === 'reduced' || !to) {
    badge.animate({ opacity: [0, 1, 0] }, { duration: 700, easing: 'ease-out' }).finished.then(remove, remove);
    return;
  }
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top - from.top;
  const glide = springEasing(SMOOTH);
  badge.animate(
    [
      { transform: 'translate(-50%, 0) scale(0.8)', opacity: 0 },
      { transform: 'translate(-50%, -14px) scale(1.1)', opacity: 1, offset: 0.25 },
      { transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(0.7)`, opacity: 0.2 },
    ],
    { duration: Math.max(650, glide.duration), easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' },
  ).finished.then(remove, remove);
}

/** A number that changed gives a small bounce, so the eye finds it (the star counter, the ring's count). */
export function bump(element: Element | null | undefined, host: HTMLElement): void {
  if (!element || motionOf(host) === 'reduced') return;
  const pop = springEasing(BOUNCY);
  element.animate({ transform: ['scale(1)', 'scale(1.18)', 'scale(1)'] }, { duration: pop.duration, easing: pop.easing });
}

/** Where each keyed element is, before a change (for a FLIP glide). */
export function measure(elements: Iterable<HTMLElement>): Map<string, DOMRect> {
  const rects = new Map<string, DOMRect>();
  for (const el of elements) {
    const key = el.dataset.key;
    if (key) rects.set(key, el.getBoundingClientRect());
  }
  return rects;
}

/** Glide keyed elements from where they were to where they are now (rows moving into Done today). */
export function glide(elements: Iterable<HTMLElement>, before: Map<string, DOMRect>, host: HTMLElement): void {
  const reduced = motionOf(host) === 'reduced';
  const spring = springEasing(SMOOTH);
  for (const el of elements) {
    const key = el.dataset.key;
    const was = key ? before.get(key) : undefined;
    if (!was) continue;
    const now = el.getBoundingClientRect();
    const dx = was.left - now.left;
    const dy = was.top - now.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    if (reduced) {
      el.animate({ opacity: [0.4, 1] }, { duration: 160, easing: 'ease-out' });
      continue;
    }
    el.animate({ transform: [`translate(${dx}px, ${dy}px)`, 'translate(0, 0)'] }, { duration: spring.duration, easing: spring.easing });
  }
}
