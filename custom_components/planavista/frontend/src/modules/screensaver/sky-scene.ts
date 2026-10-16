import { WeatherScene, nextLightning } from '../../core/screensaver';
import { dimRgb } from '../../core/dimming';
import { APPROVED_LANDSCAPE, boltSource, type Landscape,
  CROWNS, ENTRANCE, ENTRANCE_PACE, LEAFY, LIFE, Light, Rgb, SCENE_MARGIN, Season, clamp, cloudPlan, dimLight, fractal, gustAt,
  hex, horizonAt, lightAt, minuteOfDay, mixRgb, moonPhase, moonPixels, nightLight, rgba, rng, seasonGround, shade, snowFor,
  springEase, sunPosition, swayAt, SUN_FRAMES, firefliesOut,
} from './sky';

// The living sky's drawing (spec 3.3), ported from the approved mockup (v4,
// then v15 in 0.12.0): six cut-paper sheets in four canvases, paper clouds, the
// sun or moon, stars, rain and snow, and a gentle storm; since 0.12.0 the
// entrance, calm-day life (rays, breathing, puffs, sway, birds, shooting
// stars), wind in gusts, a rainbow after rain, the seasons on the land,
// fireflies, and the moon as one sphere. Everything moves by transforms and
// opacity only; the canvases are redrawn once a minute, when the light changes.

/** What the scene shows: the time, the day's sunrise and sunset (minutes of the day), the weather, and whether it is the household's night. */
export interface SceneInputs {
  now: Date;
  rise: number;
  set: number;
  weather: WeatherScene;
  night: boolean;
  /** The season on the land (0.12.0); summer when not given. */
  season?: Season;
  /** How strongly a rainbow shows, 0 to 1 (after rain, by day). */
  rainbow?: number;
  /** A dimmed shared screen's level, 0 to 1 (0.12.0). */
  dim?: number;
}

/** The CSS variable on the scene's root that holds the paper texture (the mockup's own name), for whatever is drawn over the sky (the Today card). */
export const PAPER_TEXTURE_VAR = '--tex';

const M = SCENE_MARGIN;
const MAX_DPR = 1.5;
/** One frame in 30 a second; a frame due within 2 ms of it counts, so a 60 Hz screen draws every other one. */
const FRAME_MS = 1000 / 30;
/** At night, drifting slows to a quarter (spec 3.3). */
const NIGHT_DRIFT = 0.25;
const RESIZE_MS = 200;
/** How strongly the bolt shows at its brightest: a faint one. */
const BOLT_PEAK = 0.7;
/** Springs for the entrance, as the mockup drew them (0.12.0). */
const SETTLE = springEase(170, 17, 1100);
const BOUNCY = springEase(260, 13, 1000);
const SWING = 'cubic-bezier(.25,.8,.3,1)';

type Point = [number, number];

/** One sheet of cut paper. `a` and `b`: how high its peaks reach and where its valleys sit, as fractions of the band below the horizon. */
export interface Sheet {
  a: number;
  b: number;
  kind: 'alpine' | 'rolling';
  peaks?: number;
  rough?: number;
  snow?: number;
  /** How much of the horizon's color it takes on: farther sheets more. */
  haze: number;
  /** The canvas it is drawn on, back to front. */
  group: number;
  /** Where the tallest peak stands, as a fraction of the width (the light sits there). */
  hero?: number;
  clusters?: number;
  scale?: number;
  /** Trees on its lower slopes too, not only along its edge. */
  floor?: boolean;
}

// A distant range, a grand massif with snowfields, its shoulders, an alpine range
// with a tree line, forested foothills, and the nearest hill, back to front.
const SHEETS: Sheet[] = [
  { a: -0.04, b: 0.08, kind: 'alpine', peaks: 7, rough: 0.5, haze: 0.62, group: 0 },
  { a: -0.34, b: 0.2, kind: 'alpine', peaks: 3, rough: 0.55, snow: 0.5, haze: 0.4, group: 0, hero: 0.57 },
  { a: 0.02, b: 0.34, kind: 'alpine', peaks: 4, rough: 0.5, snow: 0.3, haze: 0.26, group: 0 },
  { a: 0.3, b: 0.56, kind: 'alpine', peaks: 3, rough: 0.3, haze: 0.13, group: 1, clusters: 4, scale: 0.65 },
  { a: 0.56, b: 0.74, kind: 'rolling', haze: 0.04, group: 2, clusters: 8, scale: 0.95 },
  { a: 0.82, b: 0.94, kind: 'rolling', haze: 0, group: 3, clusters: 10, scale: 1.35, floor: true },
];
const GROUPS = 4;
/** The ridges' noise samples, the same at every width (review m13 I3). */
const NOISE_SIZE = 257;

/** A dominant peak's top, the lowest point toward its left neighbor (l), and toward its right (v). */
interface Apex {
  x: number;
  y: number;
  lx: number;
  ly: number;
  vx: number;
  vy: number;
}

interface Pine {
  x: number;
  y: number;
  h: number;
  /** A broadleaf tree that turns with the season (0.12.0), and which of the season's colors it takes. */
  leafy?: boolean;
  tone?: number;
}

/** One sheet's cut edge, peaks, trees, and snowline, in canvas pixels (x from the left margin's outer edge). */
export interface SheetGeometry {
  sheet: Sheet;
  edge: Point[];
  apexes: Apex[];
  pines: Pine[];
  top: number;
  bottom: number;
  /** Where its folds end, below its valleys. */
  foot: number;
  snowline: Point[] | null;
}

/** The scene's height along a cut edge at `x`. */
function yAt(edge: Point[], x: number): number {
  const i = clamp(Math.floor((x + 24) / 6), 0, edge.length - 2);
  const t = clamp((x - edge[i][0]) / ((edge[i + 1][0] - edge[i][0]) || 1), 0, 1);
  return edge[i][1] + (edge[i + 1][1] - edge[i][1]) * t;
}

/**
 * The six sheets for a scene of this visible size (pure, no DOM). Each sheet
 * draws from its own seed in the landscape, in the mockup's order, so the
 * approved landscape keeps the approved shapes.
 */
export function ridgeGeometry(
  W: number, H: number, season: Season = 'summer', landscape: Landscape = APPROVED_LANDSCAPE,
): { horizon: number; band: number; sheets: SheetGeometry[] } {
  const portrait = H > W;
  const horizon = horizonAt(W, H);
  const band = H - horizon;
  const width = W + 2 * M;
  const sheets = SHEETS.map((s, d): SheetGeometry => {
    const r = rng(landscape.shapes[d] ?? APPROVED_LANDSCAPE.shapes[d]);
    const top = horizon + band * s.a;
    const bottom = horizon + band * s.b;
    const span = bottom - top;
    const step = 6;
    const n = Math.ceil(width / step) + 3;
    // One noise size for every screen: the noise draws first from the seed, so a size that grew with the
    // width moved every peak drawn after it, and the kitchen's 1920 never showed the ranges chosen in the
    // Mountain Picker (review m13 I3). 257 is the size the picker drew at.
    const size = NOISE_SIZE;
    const noise = fractal(r, size, s.kind === 'alpine' ? 0.56 : 0.5);
    const at = (i: number) => noise[Math.floor((i / n) * (size - 1))];
    const pts: Point[] = [];
    let apexes: Apex[] = [];
    if (s.kind === 'alpine') {
      // The envelope: a few dominant peaks of different heights and widths; a hero peak where the light sits.
      const count = s.peaks ?? 3;
      const peaks: Array<{ x: number; h: number; w: number }> = [];
      for (let i = 0; i < count; i++) {
        peaks.push({ x: width * ((i + 0.25 + r() * 0.5) / count), h: 0.5 + r() * 0.45, w: (width / count) * (0.75 + r() * 0.6) });
      }
      if (s.hero) {
        const target = width * s.hero;
        const hero = peaks.reduce((p, q) => (Math.abs(q.x - target) < Math.abs(p.x - target) ? q : p));
        hero.x = target;
        hero.h = 1;
        hero.w = width * 0.24;
      }
      const rough = s.rough ?? 0.5;
      for (let i = 0; i < n; i++) {
        const x = -24 + i * step;
        let env = 0;
        for (const p of peaks) env = Math.max(env, p.h * Math.pow(Math.max(0, 1 - Math.abs(x - p.x) / p.w), 1.15));
        const rug = rough * at(i) * (0.2 + 0.8 * env) * 0.22;
        pts.push([x, bottom - span * clamp(env + 0.06 + rug, 0, 1.15)]);
      }
      // Apexes: the highest point near each dominant peak; valleys: the lowest point between neighbors.
      const idx = peaks.map(p => {
        const lo = clamp(Math.floor((p.x - p.w * 0.15 + 24) / step), 0, n - 1);
        const hi = clamp(Math.ceil((p.x + p.w * 0.15 + 24) / step), 0, n - 1);
        let best = lo;
        for (let i = lo; i <= hi; i++) if (pts[i][1] < pts[best][1]) best = i;
        return best;
      }).sort((x, y) => x - y);
      const lowest = (from: number, to: number) => {
        let best = from;
        for (let i = from; i <= to; i++) if (pts[i][1] > pts[best][1]) best = i;
        return best;
      };
      apexes = idx.map((ai, k) => {
        const li = lowest(k ? idx[k - 1] : 0, ai);
        const ri = lowest(ai, k < idx.length - 1 ? idx[k + 1] : n - 1);
        return { x: pts[ai][0], y: pts[ai][1], lx: pts[li][0], ly: pts[li][1], vx: pts[ri][0], vy: pts[ri][1] };
      });
    } else {
      // Rolling hills: two slow waves and a little unevenness.
      const mid = (top + bottom) / 2;
      const amp = span / 2;
      const f1 = (Math.PI * 2 * (2.2 + r())) / width;
      const f2 = f1 * (2.3 + r());
      const p1 = r() * 6.28;
      const p2 = r() * 6.28;
      for (let i = 0; i < n; i++) {
        const x = -24 + i * step;
        pts.push([x, mid + amp * (0.66 * Math.sin(x * f1 + p1) + 0.26 * Math.sin(x * f2 + p2) + 0.08 * at(i))]);
      }
    }
    // Cut edges: tiny irregular steps, the way scissors wander.
    const edge = pts.map(([x, y]): Point => [x + (r() - 0.5) * 0.8, y + (r() - 0.5) * 1.2]);
    // Pines in clusters, rooted on the edge so they stand against the sheet behind.
    const pines: Pine[] = [];
    const sizeBase = H * (portrait ? 0.022 : 0.028) * (s.scale || 1);
    for (let c = 0; c < (s.clusters || 0); c++) {
      const cx = r() * width;
      const k = 3 + Math.floor(r() * 6);
      for (let i = 0; i < k; i++) {
        const px = cx + (r() - 0.5) * sizeBase * 5;
        const h = sizeBase * (0.55 + r() * 0.75) * (i === 0 ? 1.25 : 1);
        pines.push({ x: px, y: yAt(edge, px) + h * (0.12 + r() * 0.28), h });
      }
    }
    if (s.floor) {
      for (let c = 0; c < 8; c++) {
        const cx = r() * width;
        // The bound draws again each time round, as the mockup's did, so the trees stand where it put them.
        for (let i = 0; i < 4 + Math.floor(r() * 5); i++) {
          const px = cx + (r() - 0.5) * sizeBase * 6;
          const h = sizeBase * (0.7 + r() * 0.8);
          pines.push({ x: px, y: yAt(edge, px) + band * (0.04 + r() * 0.05), h });
        }
      }
    }
    pines.sort((p, q) => p.y - q.y);
    // Which are broadleaf, from their own seed, so the land itself never moves (0.12.0).
    const rk = rng(landscape.trees[d] ?? APPROVED_LANDSCAPE.trees[d]);
    for (const t of pines) {
      t.leafy = rk() < (LEAFY[d] || 0);
      t.tone = Math.floor(rk() * 1000);
    }
    // The snowline wanders, its edge torn in small teeth; winter brings it down.
    const snow = snowFor(s.snow, d, season);
    const snowline = snow
      ? edge.map(([x], i): Point => [x, bottom - span * (1.1 - snow) + span * 0.07 * Math.sin(i * 0.21 + d) + (i % 2 ? (r() - 0.5) * span * 0.05 : 0)])
      : null;
    return { sheet: s, edge, apexes, pines, top, bottom, foot: bottom + band * 0.14, snowline };
  });
  return { horizon, band, sheets };
}

/** A sheet's paper: mixed from the nearest to the farthest, then hazed toward the horizon's color. */
function sheetColor(L: Light, d: number): Rgb {
  const s = SHEETS[d];
  const t = Math.pow(1 - d / (SHEETS.length - 1), 0.85);
  const paper = mixRgb(L.near, L.far, t);
  const haze = clamp(s.haze + L.fog * 0.3 * (1 - d / (SHEETS.length - 1)), 0, 0.92);
  return mixRgb(paper, L.sky[2], haze);
}

// ---- The paper: fine fibers and specks, painted over anything already drawn ----

let paper: { canvas: HTMLCanvasElement; url: string } | null = null;

function paperTexture(): { canvas: HTMLCanvasElement; url: string } {
  if (paper) return paper;
  const tex = document.createElement('canvas');
  tex.width = tex.height = 256;
  const g = tex.getContext('2d');
  if (g) {
    const img = g.createImageData(256, 256);
    const r = rng(7);
    for (let i = 0; i < img.data.length; i += 4) {
      const light = r() < 0.5;
      const v = light ? 255 : 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.round((light ? 0.06 : 0.045) * 255 * r());
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 180; i++) {
      const x = r() * 256;
      const y = r() * 256;
      const len = 5 + r() * 18;
      const ang = r() * Math.PI * 2;
      g.strokeStyle = r() < 0.6 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.035)';
      g.lineWidth = 0.5 + r() * 0.8;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(ang + 0.6) * len * 0.5, y + Math.sin(ang + 0.6) * len * 0.5, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      g.stroke();
    }
  }
  paper = { canvas: tex, url: tex.toDataURL() };
  return paper;
}

function paperOver(g: CanvasRenderingContext2D, w: number, h: number): void {
  const pattern = g.createPattern(paperTexture().canvas, 'repeat');
  if (!pattern) return;
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = pattern;
  g.fillRect(0, 0, w, h);
  g.restore();
}

// ---- Clouds -------------------------------------------------------------------

type CloudKind = 'high' | 'low' | 'fog' | 'tower';
/** The mockup's tables still draw for its retired deck and mist kinds, so every seed lays out the same sky. */
type Drawn = CloudKind | 'deck' | 'mist';

interface Cloud {
  el: HTMLCanvasElement;
  host: HTMLElement;
  kind: CloudKind;
  w: number;
  h: number;
  seed: number;
  sheets: number;
  x: number;
  y: number;
  ry: number;
  /** px a second, before the wind. */
  speed: number;
  pad: number;
  offY: number;
}

function cloudPath(g: CanvasRenderingContext2D, c: Cloud, x0: number, y0: number, s: number): void {
  const r = rng(c.seed);
  const w = c.w * s;
  const h = c.h * s;
  const base = y0 + h;
  if (c.kind === 'fog') {
    // A tall soft patch, highest in its middle.
    g.beginPath();
    g.moveTo(x0, base);
    const lumps = 4 + Math.floor(r() * 2);
    for (let i = 0; i < lumps; i++) {
      const t = (i + 0.5) / lumps;
      const cx = x0 + w * (0.1 + 0.8 * t) + (r() - 0.5) * w * 0.05;
      const rad = h * (0.36 + r() * 0.22) * (0.75 + 0.35 * Math.sin(Math.PI * t));
      g.arc(cx, base - h * 0.42, rad, Math.PI, Math.PI * 2);
    }
    g.lineTo(x0 + w, base);
    g.closePath();
    return;
  }
  if (c.kind === 'tower') {
    // A storm's tall cloud: a broad base and a heaped top.
    g.beginPath();
    g.moveTo(x0, base);
    const lumps = 5;
    for (let i = 0; i < lumps; i++) {
      const cx = x0 + w * (0.12 + (0.76 * i) / (lumps - 1));
      const lift = Math.sin(Math.PI * (i / (lumps - 1)));
      const rad = w * (0.12 + r() * 0.05);
      g.arc(cx, base - h * (0.25 + 0.55 * lift), rad, Math.PI * 0.95, Math.PI * 2.05);
    }
    g.lineTo(x0 + w, base);
    g.closePath();
    return;
  }
  const lumps = 3 + Math.floor(r() * 3);
  const end = Math.min(h * 0.3, w * 0.08);
  g.beginPath();
  g.moveTo(x0 + end, base);
  g.arc(x0 + end, base - end, end, Math.PI / 2, Math.PI * 1.5);
  for (let i = 0; i < lumps; i++) {
    const cx = x0 + w * (0.18 + (0.64 * (i + 0.5)) / lumps) + (r() - 0.5) * w * 0.05;
    const rad = h * (0.36 + r() * 0.3) * (i === 0 || i === lumps - 1 ? 0.8 : 1);
    g.arc(cx, base - h * 0.45, rad, Math.PI * 1.05, Math.PI * 1.95);
  }
  g.arc(x0 + w - end, base - end, end, Math.PI * 1.5, Math.PI / 2);
  g.closePath();
}

/** The moon as one lit sphere (0.12.0), drawn once a minute into its own small canvas. */
function moonCanvas(R: number, dpr: number, phase: number, light: Rgb, dark: Rgb): HTMLCanvasElement | null {
  const size = Math.ceil(R * 2 * dpr);
  const el = document.createElement('canvas');
  el.width = el.height = size;
  const g = el.getContext('2d');
  if (!g) return null;
  const img = g.createImageData(size, size);
  img.data.set(moonPixels(size, phase, light, dark));
  g.putImageData(img, 0, 0);
  return el;
}

interface Bird {
  el: HTMLCanvasElement;
  dx: number;
  dy: number;
  s: number;
  ph: number;
}

interface Flock {
  birds: Bird[];
  dir: number;
  x: number;
  y0: number;
  speed: number;
}

interface Drop {
  x: number;
  y: number;
  z: number;
  ph: number;
}

const sameWeather = (a: WeatherScene, b: WeatherScene): boolean =>
  a.cover === b.cover && a.rain === b.rain && a.snow === b.snow && a.fog === b.fog && a.storm === b.storm && a.wind === b.wind;

function canvas(className: string): HTMLCanvasElement {
  const el = document.createElement('canvas');
  el.className = className;
  return el;
}

function div(className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

/**
 * The living sky, drawn inside `root` (a positioned box it fills): the sky,
 * stars, glow, sun or moon, clouds, six paper sheets in four canvases with fog
 * between them, rain and snow, and the storm's flash and bolt, in that order.
 */
export class SkyScene {
  private readonly _root: HTMLElement;
  private readonly _reduced: boolean;
  private readonly _wrap: HTMLDivElement;
  private readonly _sky: HTMLDivElement;
  private readonly _starsA: HTMLCanvasElement;
  private readonly _starsB: HTMLCanvasElement;
  private readonly _glow: HTMLDivElement;
  private readonly _sun: HTMLCanvasElement;
  private readonly _farHost: HTMLDivElement;
  private readonly _ridges: HTMLCanvasElement[] = [];
  private readonly _bolt: HTMLCanvasElement;
  private readonly _mistHosts: HTMLDivElement[] = [];
  private readonly _weather: HTMLCanvasElement;
  private readonly _flash: HTMLDivElement;
  private readonly _observer: ResizeObserver | null = null;
  // 0.12.0: the sun's rays, shooting stars, the rainbow, paper birds, and fireflies.
  private readonly _rays: HTMLCanvasElement;
  private readonly _meteors: HTMLDivElement;
  private readonly _rainbowHost: HTMLDivElement;
  private readonly _rainbow: HTMLCanvasElement;
  private readonly _birds: HTMLDivElement;
  private readonly _fireflies: HTMLDivElement;
  /** Calm-day life: with Motion Full only. */
  private readonly _life: boolean;
  private _season: Season = 'summer';
  /** The land's seeds for this scene's life (0.13.0), and the clouds' with it (review m13b M5). */
  private _landscape: Landscape;
  private _cloudSalt = 0;
  private _rainbowShown = -1;
  private _raysR = 0;
  private _flocks: Flock[] = [];
  private _nextFlock = 0;
  private _nextMeteor = 0;
  private _entrance: Animation[] = [];

  private _dpr = 1;
  private _w = 0;
  private _h = 0;
  private _horizon = 0;
  private _band = 0;
  private _geo: SheetGeometry[] = [];
  private _built = false;

  private _inputs: SceneInputs | null = null;
  /** The inputs' time less the real clock's, so the scene shows `now` and moves on with the clock. */
  private _offset = 0;
  private _light: Light | null = null;
  private _litMinute = -1;
  private _phase = 0;
  private _sunX = 0;
  private _sunR = 40;
  /** Canvases still to redraw for the last light, one a frame, so a minute's change never stalls a frame. */
  private _pending: Array<() => void> = [];
  private _drawn = false;

  private _clouds: Cloud[] = [];
  private _cloudKey = '';
  private _rain: Drop[] = [];
  private _snow: Drop[] = [];
  private _particleKey = '';
  private _weatherDrawn = false;

  private _running = false;
  private _raf = 0;
  private _lastFrame = 0;
  /** Seconds of drift so far: real seconds by day, a quarter of them at night. */
  private _drift = 0;
  private _nextBolt = 0;
  private _lastBolt = 0;
  private _resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private _destroyed = false;

  constructor(root: HTMLElement, options: { reducedMotion: boolean; landscape?: Landscape }) {
    this._root = root;
    this._landscape = options.landscape ?? APPROVED_LANDSCAPE;
    this._salt();
    this._reduced = options.reducedMotion;
    this._life = !options.reducedMotion;
    this._wrap = div(this._reduced ? 'pvs-scene pvs-still' : 'pvs-scene');
    this._wrap.setAttribute('aria-hidden', 'true');
    this._sky = div('pvs-sky');
    this._starsA = canvas('pvs-layer pvs-stars pvs-a');
    this._starsB = canvas('pvs-layer pvs-stars pvs-b');
    this._glow = div('pvs-glow');
    this._sun = canvas('pvs-sun');
    this._farHost = div('pvs-host');
    this._bolt = canvas('pvs-bolt');
    this._weather = canvas('pvs-layer pvs-weather');
    this._flash = div('pvs-flash');
    this._rays = canvas('pvs-rays');
    this._meteors = div('pvs-host');
    this._rainbowHost = div('pvs-host');
    this._rainbow = canvas('pvs-layer pvs-rainbow');
    this._rainbowHost.append(this._rainbow);
    this._birds = div('pvs-host');
    this._fireflies = div('pvs-host pvs-fireflies');
    this._fireflies.hidden = true;
    for (let gi = 0; gi < GROUPS; gi++) this._ridges.push(canvas('pvs-layer pvs-ridge'));
    for (let i = 0; i < 3; i++) this._mistHosts.push(div('pvs-host'));
    const [r0, r1, r2, r3] = this._ridges;
    const [m0, m1, m2] = this._mistHosts;
    // Back to front: the rainbow's feet stand behind the far range, the fireflies in front of the near hill.
    this._wrap.append(
      this._sky, this._starsA, this._starsB, this._meteors, this._glow, this._rays, this._sun, this._rainbowHost, this._farHost,
      this._birds, r0, this._bolt, m0, r1, m1, r2, m2, r3, this._fireflies, this._weather, this._flash,
    );
    root.prepend(this._wrap);
    root.style.setProperty(PAPER_TEXTURE_VAR, `url(${paperTexture().url})`);
    if (typeof ResizeObserver !== 'undefined') {
      this._observer = new ResizeObserver(() => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this.resize(), RESIZE_MS);
      });
      this._observer.observe(this._wrap);
    }
    this._rebuild();
  }

  /** Shows these inputs: re-lit when the minute, the weather, night, or the day's sunrise or sunset changes. */
  update(inputs: SceneInputs): void {
    if (this._destroyed) return;
    const prev = this._inputs;
    this._inputs = inputs;
    this._offset = inputs.now.getTime() - Date.now();
    // A new season changes the land itself: the trees and the snow (0.12.0).
    const season = inputs.season ?? 'summer';
    if (!this._built || season !== this._season) {
      this._season = season;
      this._rebuild();
      return;
    }
    const weatherChanged = !prev || !sameWeather(prev.weather, inputs.weather);
    if (weatherChanged) {
      this._syncClouds();
      this._syncParticles();
    }
    const changed = !prev || weatherChanged || prev.night !== inputs.night || prev.rise !== inputs.rise || prev.set !== inputs.set
      || (prev.dim ?? 1) !== (inputs.dim ?? 1) || (prev.rainbow ?? 0) !== (inputs.rainbow ?? 0);
    if (changed || Math.floor(minuteOfDay(inputs.now)) !== this._litMinute) {
      // The minute's own change spreads its redraws over frames; anything else shows at once.
      this._relight(inputs.now, !changed && this._running && this._drawn);
    }
  }

  /** Starts the one frame loop (30 frames a second at most). */
  start(): void {
    if (this._destroyed || this._running) return;
    this._running = true;
    this._lastFrame = 0;
    this._raf = requestAnimationFrame(this._frame);
  }

  /** Stops the frame loop; the scene stays as it was last drawn. */
  stop(): void {
    this._running = false;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
  }

  /** Draws other land (0.13.0): the scene's own pick stays for its life, so this is for looking at seeds. */
  setLandscape(landscape: Landscape): void {
    if (this._destroyed) return;
    this._landscape = landscape;
    this._salt();
    this._rebuild();
  }

  /** New land brings new clouds; the approved land keeps the mockup's. */
  private _salt(): void {
    this._cloudSalt = this._landscape === APPROVED_LANDSCAPE ? 0 : this._landscape.trees[0] % 1000;
  }

  /** Rebuilds for the root's size, when it has changed. */
  resize(): void {
    if (this._destroyed) return;
    const w = this._wrap.clientWidth;
    const h = this._wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (this._built && w === this._w && h === this._h && dpr === this._dpr) return;
    this._rebuild();
  }

  /** Stops, removes everything it made, and lets go of its listeners. */
  destroy(): void {
    if (this._destroyed) return;
    this.stop();
    this._destroyed = true;
    clearTimeout(this._resizeTimer);
    this._observer?.disconnect();
    for (const a of this._entrance) a.cancel();
    this._entrance = [];
    this._flocks = [];
    // Free each canvas's pixels at once: a Raspberry Pi has little memory to wait with.
    for (const el of Array.from(this._wrap.querySelectorAll('canvas'))) el.width = el.height = 0;
    this._wrap.remove();
    this._root.style.removeProperty(PAPER_TEXTURE_VAR);
    this._clouds = [];
    this._rain = [];
    this._snow = [];
    this._geo = [];
    this._pending = [];
    this._inputs = null;
    this._light = null;
  }

  /**
   * The entrance (0.12.0, the owner's v5 to v14): the sky fades over the card,
   * the sheets rise far to near with their mist, the sun or moon swings up, the
   * clouds slide in, and a rainbow that is already out comes last. The
   * screensaver plays its clock, words, and card with it, from ENTRANCE.
   * Reduced motion: one fade of the whole scene.
   */
  enter(): void {
    for (const a of this._entrance) a.cancel();
    this._entrance = [];
    const go = (el: Element, frames: Keyframe[], o: { delay?: number; duration: number; easing: string }) => {
      this._entrance.push(el.animate(frames, {
        fill: 'backwards', easing: o.easing, duration: o.duration * ENTRANCE_PACE, delay: (o.delay ?? 0) * ENTRANCE_PACE,
      }));
    };
    if (this._reduced) {
      go(this._wrap, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
      return;
    }
    const E = ENTRANCE;
    go(this._sky, [{ opacity: 0 }, { opacity: 1 }], { ...E.sky, easing: 'ease-out' });
    go(this._glow, [{ opacity: 0 }, {}], { ...E.glow, easing: 'ease-out' });
    for (const el of [this._starsA, this._starsB]) go(el, [{ opacity: 0 }, {}], { ...E.stars, easing: 'ease-out' });
    this._ridges.forEach((el, gi) => go(el, [{ translate: '0 110%' }, { translate: '0 0' }],
      { delay: E.sheets.delay + gi * E.sheets.step, duration: E.sheets.duration, easing: SETTLE }));
    this._mistHosts.forEach((el, gi) => go(el, [{ translate: '0 110%' }, { translate: '0 0' }],
      { delay: E.mist.delay + gi * E.mist.step, duration: E.mist.duration, easing: SETTLE }));
    for (const el of [this._sun, this._rays]) go(el, SUN_FRAMES, { ...E.sun, easing: SWING });
    this._clouds.filter(c => c.host === this._farHost).forEach((c, i) => {
      const from = c.x + c.w / 2 < this._w / 2 ? -1 : 1;
      go(c.el, [{ translate: `${from * this._w * 0.55}px 0`, opacity: 0 }, { translate: '0 0', opacity: 1 }],
        { delay: E.clouds.delay + i * E.clouds.step, duration: E.clouds.duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    go(this._rainbowHost, [{ opacity: 0, translate: '0 6vh' }, { opacity: 1, translate: '0 0' }], { ...E.rainbow, easing: SWING });
  }

  /** A touch: the entrance jumps to its end, so the wake's fade starts from the whole scene. */
  finishEntrance(): void {
    for (const a of this._entrance) a.finish();
    this._entrance = [];
  }

  // ---- Building ----------------------------------------------------------------

  private _rebuild(): void {
    const W = this._wrap.clientWidth;
    const H = this._wrap.clientHeight;
    if (!W || !H) return;
    this._w = W;
    this._h = H;
    this._dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const geometry = ridgeGeometry(W, H, this._season, this._landscape);
    this._horizon = geometry.horizon;
    this._band = geometry.band;
    this._geo = geometry.sheets;
    const width = Math.round((W + 2 * M) * this._dpr);
    const height = Math.round(H * this._dpr);
    for (const el of [...this._ridges, this._starsA, this._starsB, this._weather, this._rainbow]) {
      el.width = width;
      el.height = height;
    }
    this._built = true;
    this._weatherDrawn = false;
    this._rainbowShown = -1;
    this._placeFireflies();
    this._drawStars();
    this._cloudKey = '';
    this._particleKey = '';
    if (!this._inputs) return;
    this._syncClouds();
    this._syncParticles();
    this._relight(new Date(Date.now() + this._offset), false);
  }

  private _syncClouds(): void {
    const inputs = this._inputs;
    if (!inputs || !this._built) return;
    const plan = cloudPlan(inputs.weather, this._life);
    const key = [plan.seed, plan.high, plan.low, plan.more, plan.towers, plan.fog.join(','), inputs.weather.cover > 0.6, this._w, this._h].join('|');
    if (key === this._cloudKey) return;
    this._cloudKey = key;
    this._makeClouds();
  }

  private _makeClouds(): void {
    const inputs = this._inputs;
    if (!inputs) return;
    for (const host of [this._farHost, ...this._mistHosts]) host.replaceChildren();
    const W = this._w;
    const H = this._h;
    const horizon = this._horizon;
    const band = this._band;
    const scene = inputs.weather;
    const cover = clamp(scene.cover, 0, 1);
    const plan = cloudPlan(scene, this._life);
    const r = rng(plan.seed + this._cloudSalt);
    const portrait = H > W;
    const clouds: Cloud[] = [];
    const pick = (kind: CloudKind, table: Record<Drawn, number>) => table[kind];
    const add = (host: HTMLElement, kind: CloudKind) => {
      const el = canvas('pvs-cloud');
      host.append(el);
      const scale = (portrait ? 1.45 : 1) * (0.85 + cover * 0.5);
      // Every entry of each table draws, in the mockup's order, whichever kind is picked.
      const width = W * scale * pick(kind, { high: 0.06 + r() * 0.04, low: 0.1 + r() * 0.07, deck: 0.45 + r() * 0.4, mist: 0.4 + r() * 0.3, fog: 0.2 + r() * 0.12, tower: 0.16 + r() * 0.08 });
      const y = pick(kind, {
        high: H * (0.08 + r() * 0.14), low: horizon - band * 0.36 - H * r() * 0.1,
        deck: H * (0.04 + r() * 0.2), tower: horizon - band * 0.3, mist: 0, fog: 0,
      });
      const ratio = pick(kind, { high: 0.24 + cover * 0.1, low: 0.26 + cover * 0.1, deck: 0.05 + r() * 0.03, mist: 0.05 + r() * 0.03, fog: 0.34 + r() * 0.1, tower: 0.62 + r() * 0.12 });
      const h = width * ratio;
      const seed = Math.round(r() * 1e6);
      const x = r() * (W + width) - width;
      const ry = r();
      const speed = pick(kind, { high: 2.5, low: 3.5, deck: 1.5, mist: 5, fog: 3, tower: 2 }) * (0.7 + r() * 0.6) * (scene.storm ? 2.2 : 1)
        // Calm-day life: the small clouds drift quicker, so a still day still moves (0.12.0).
        * (this._life && (kind === 'high' || kind === 'low') ? LIFE.puffSpeed : 1);
      const pad = 28;
      clouds.push({
        el, host, kind, w: width, h, seed, x, y, ry, speed, pad, offY: pad + h * 1.4,
        sheets: kind === 'fog' ? 2 : cover > 0.6 ? 3 : 2,
      });
    };
    for (let i = 0; i < plan.high; i++) add(this._farHost, 'high');
    for (let i = 0; i < plan.low; i++) add(this._farHost, 'low');
    // Heavy cover brings more of the same paper clouds, never long thin strips.
    for (let i = 0; i < plan.more; i++) add(this._farHost, 'high');
    for (let i = 0; i < plan.towers; i++) add(this._farHost, 'tower');
    // Fog rises out of the valleys between the groups in tall soft patches of see-through paper.
    this._mistHosts.forEach((host, gi) => {
      for (let i = 0; i < plan.fog[gi]; i++) add(host, 'fog');
    });
    for (const c of clouds) {
      if (c.kind !== 'fog') continue;
      const gi = this._mistHosts.indexOf(c.host as HTMLDivElement);
      // Its foot sits behind the next sheet, so it rises out of the valley with no edge to see.
      c.y = horizon + band * ([0.53, 0.71, 0.9][gi] + c.ry * 0.02);
      const mine = clouds.filter(o => o.host === c.host);
      c.x = W * ((mine.indexOf(c) + 0.25 + c.ry * 0.5) / mine.length) - c.w / 2;
    }
    for (const c of clouds) this._placeCloud(c);
    this._clouds = clouds;
  }

  private _syncParticles(): void {
    const inputs = this._inputs;
    if (!inputs || !this._built) return;
    const { rain, snow } = inputs.weather;
    const key = this._reduced ? 'still' : `${rain}|${snow}|${this._w}x${this._h}`;
    if (key === this._particleKey) return;
    this._particleKey = key;
    // Under Reduced motion nothing falls.
    if (this._reduced) {
      this._rain = [];
      this._snow = [];
      return;
    }
    const r = rng(9);
    const make = (n: number): Drop[] =>
      Array.from({ length: Math.max(0, Math.round(n)) }, () => ({ x: r() * (this._w + 2 * M), y: r() * this._h, z: 0.4 + r() * 0.6, ph: r() * 6.28 }));
    this._rain = make(rain);
    this._snow = make(snow);
  }

  // ---- Light ---------------------------------------------------------------------

  private _relight(clock: Date, spread: boolean): void {
    const inputs = this._inputs;
    if (!inputs || !this._built) return;
    const minute = minuteOfDay(clock);
    let light = lightAt(minute, inputs.weather, inputs.rise, inputs.set);
    if (inputs.night) light = nightLight(light);
    // A dimmed shared screen draws the whole sky at its level (0.12.0).
    const level = clamp(inputs.dim ?? 1, 0, 1);
    light = dimLight(light, level);
    this._light = light;
    this._litMinute = Math.floor(minute);
    this._phase = moonPhase(clock);
    const [a, b, c] = light.sky;
    this._sky.style.background = `linear-gradient(to bottom, ${rgba(a)} 0%, ${rgba(b)} 42%, ${rgba(c)} 68%)`;
    const sp = sunPosition(minute, inputs.rise, inputs.set, this._w, this._h, this._horizon);
    const reach = Math.max(this._w, this._h);
    const glowY = Math.min(sp.y, this._horizon + this._band * 0.1);
    this._glow.style.background =
      `radial-gradient(circle at ${sp.x}px ${glowY}px, ${rgba(light.glow[0], light.glow[1])} 0, ` +
      `${rgba(light.glow[0], light.glow[1] * 0.35)} ${Math.round(reach * 0.22)}px, transparent ${Math.round(reach * 0.48)}px)`;
    // Stars are small marks: they keep the text rule when the screen is dimmed.
    const stars = light.stars * Math.sqrt(level);
    this._starsA.style.opacity = String(stars);
    this._starsB.style.setProperty('--pvs-stars', String(stars));
    this._starsB.style.opacity = String(stars);
    // The sun fades behind cloud; the moon stays solid and dims by its own colors (drawn in _drawSun, v13).
    this._sun.style.opacity = String(light.sun.day ? clamp(1 - clamp(inputs.weather.cover, 0, 1) * 0.92, 0.04, 1) : 1);
    this._sunX = sp.x + M;
    // After rain, by day: a paper rainbow, as strong as the time since the rain allows.
    const rainbow = light.sun.day ? clamp(inputs.rainbow ?? 0, 0, 1) : 0;
    // Its first light is at once (the entrance brings it in); after that it eases between relights.
    this._rainbow.style.transition = this._rainbow.style.opacity === '' ? 'none' : '';
    this._rainbow.style.opacity = String(rainbow);
    const jobs: Array<() => void> = [
      () => this._drawSun(),
      () => this._drawRays(),
      ...this._ridges.map((_, gi) => () => this._drawGroup(gi)),
      () => this._clouds.forEach(cloud => this._drawCloud(cloud)),
      () => this._drawRainbow(rainbow > 0, sp.x),
    ];
    if (spread) {
      this._pending = jobs;
      return;
    }
    this._pending = [];
    for (const job of jobs) job();
    this._placeSun(minute);
    this._drawn = true;
  }

  // ---- Drawing -------------------------------------------------------------------

  private _drawStars(): void {
    for (const [el, seed] of [[this._starsA, 3], [this._starsB, 4]] as Array<[HTMLCanvasElement, number]>) {
      const g = el.getContext('2d');
      if (!g) continue;
      const r = rng(seed);
      g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
      g.clearRect(0, 0, this._w + 2 * M, this._h);
      for (let i = 0; i < 70; i++) {
        const x = r() * (this._w + 2 * M);
        const y = r() * this._horizon * 0.9;
        const s = 0.8 + r() * 2.2;
        g.fillStyle = `rgba(255,246,228,${0.45 + r() * 0.5})`;
        g.beginPath();
        if (s > 2.4) {
          for (let k = 0; k < 8; k++) {
            const a = (k * Math.PI) / 4;
            const rr = k % 2 ? s * 0.45 : s * 1.9;
            g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
          }
          g.closePath();
        } else {
          g.arc(x, y, s * 0.55, 0, Math.PI * 2);
        }
        g.fill();
      }
    }
  }

  /** The sun, a paper disc that sets behind the peaks; by night the moon, lit for its phase. */
  private _drawSun(): void {
    const L = this._light;
    const g = this._sun.getContext('2d');
    if (!L || !g) return;
    const R = Math.max(1, Math.round(Math.min(this._w, this._h) * 0.05));
    const size = R * 4;
    this._sun.width = Math.round(size * this._dpr);
    this._sun.height = Math.round(size * this._dpr);
    this._sun.style.width = `${size}px`;
    this._sun.style.height = `${size}px`;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, size, size);
    const c = size / 2;
    if (L.sun.day) {
      g.save();
      g.shadowColor = rgba(L.sunColor, 0.65);
      g.shadowBlur = R * 0.9;
      g.beginPath();
      g.arc(c, c, R, 0, Math.PI * 2);
      g.fillStyle = rgba(L.sunColor);
      g.fill();
      g.restore();
    } else {
      // The moon is one sphere (the owner, v10 to v13): its dark side a shade lighter than the sky, its lit part
      // shaded from the sun's side with a soft terminator, a round glow that grows with the lit part, and a solid
      // disc of night sky behind it, its edge soft, so no star shows through. Clouds dim it by its colors.
      const lit = (1 - Math.cos(2 * Math.PI * this._phase)) / 2;
      const night = mixRgb(L.sky[0], L.sky[1], 0.3);
      const veil = clamp(this._inputs?.weather.cover ?? 0, 0, 1) * 0.85;
      const back = g.createRadialGradient(c, c, R * 0.98, c, c, R * 1.22);
      back.addColorStop(0, rgba(night));
      back.addColorStop(1, rgba(night, 0));
      g.beginPath();
      g.arc(c, c, R * 1.22, 0, Math.PI * 2);
      g.fillStyle = back;
      g.fill();
      const moonLight = mixRgb(L.sunColor, night, veil);
      const moonDark = mixRgb(mixRgb(L.sky[0], L.sunColor, 0.16), night, veil);
      g.save();
      g.shadowColor = `rgba(255,240,215,${(0.08 + 0.24 * lit).toFixed(3)})`;
      g.shadowBlur = R * 0.9;
      g.beginPath();
      g.arc(c, c, R, 0, Math.PI * 2);
      g.fillStyle = rgba(moonDark);
      g.fill();
      g.restore();
      const sphere = moonCanvas(R, this._dpr, this._phase, moonLight, moonDark);
      if (sphere) g.drawImage(sphere, c - R, c - R, R * 2, R * 2);
      // A faint rim, so the dark side's edge reads as the same moon.
      g.beginPath();
      g.arc(c, c, R - 0.6, 0, Math.PI * 2);
      g.strokeStyle = rgba(L.sunColor, 0.14);
      g.lineWidth = 1.1;
      g.stroke();
    }
    paperOver(g, size, size);
    this._sunR = R;
  }

  /** The sun's rays: soft paper wedges behind the disc, turning once in four minutes (calm-day life). */
  private _drawRays(): void {
    const L = this._light;
    const g = this._rays.getContext('2d');
    if (!L || !g) return;
    const R = this._sunR;
    const size = Math.round(R * 9);
    if (!this._life || !L.sun.day) {
      if (this._raysR) {
        this._rays.width = this._rays.height = 0;
        this._raysR = 0;
      }
      return;
    }
    this._rays.width = Math.round(size * this._dpr);
    this._rays.height = Math.round(size * this._dpr);
    this._rays.style.width = `${size}px`;
    this._rays.style.height = `${size}px`;
    this._raysR = R;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, size, size);
    const c = size / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const wedge = Math.PI / 30;
      const grad = g.createRadialGradient(c, c, R * 1.2, c, c, c);
      grad.addColorStop(0, rgba(L.sunColor, 0.22));
      grad.addColorStop(1, rgba(L.sunColor, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(c + Math.cos(a - wedge) * R * 1.2, c + Math.sin(a - wedge) * R * 1.2);
      g.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c);
      g.lineTo(c + Math.cos(a + wedge) * R * 1.2, c + Math.sin(a + wedge) * R * 1.2);
      g.closePath();
      g.fill();
    }
    paperOver(g, size, size);
  }

  /** After rain: a paper rainbow, its feet behind the ranges, across from the sun. */
  private _drawRainbow(show: boolean, sunX: number): void {
    const g = this._rainbow.getContext('2d');
    if (!g) return;
    const w = this._w + 2 * M;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, w, this._h);
    if (!show) return;
    const cx = (sunX < this._w / 2 ? this._w * 0.66 : this._w * 0.34) + M;
    const cy = this._horizon + this._band * 0.3;
    const R = Math.min(this._w, this._h) * 0.62;
    const bands = ['#e98a7e', '#f0b071', '#f4d98b', '#a2c996', '#8db2d8', '#a99bd0'];
    const bw = R * 0.032;
    const level = clamp(this._inputs?.dim ?? 1, 0, 1);
    bands.forEach((band, i) => {
      g.beginPath();
      g.arc(cx, cy, R - i * bw, Math.PI, 0);
      g.lineWidth = bw + 0.6;
      g.strokeStyle = rgba(dimRgb(hex(band), level), 0.46);
      g.stroke();
    });
    paperOver(g, w, this._h);
  }

  private _placeSun(minute: number, t = this._drift): void {
    const inputs = this._inputs;
    const L = this._light;
    if (!inputs || !L) return;
    const sp = sunPosition(minute, inputs.rise, inputs.set, this._w, this._h, this._horizon);
    const R = this._sunR;
    const alive = this._life;
    // Breathing: the disc and its glow swell a little and settle, every seven seconds.
    const breath = alive ? Math.sin((t / LIFE.breathS) * 6.283) : 0;
    this._sun.style.transform = `translate3d(${sp.x - R * 2}px, ${sp.y - R * 2}px, 0) scale(${(1 + breath * 0.015).toFixed(4)})`;
    this._glow.style.opacity = String(alive ? 0.93 + breath * 0.07 : 1);
    if (this._raysR) {
      const size = Math.round(this._raysR * 9);
      const cover = clamp(inputs.weather.cover, 0, 1);
      this._rays.style.transform = `translate3d(${sp.x - size / 2}px, ${sp.y - size / 2}px, 0) rotate(${((t / LIFE.raysTurnS) * 360) % 360}deg)`;
      this._rays.style.opacity = String(clamp(1 - cover * 1.6, 0, 1) * clamp(L.e / 10, 0, 1));
    }
  }

  // ---- Summer evenings: fireflies low among the near trees ---------------------------

  private _placeFireflies(): void {
    this._fireflies.replaceChildren();
    if (!this._life) return;
    const r = rng(1201);
    const trees = this._geo.filter((_, d) => d >= 4).flatMap(G => G.pines);
    if (!trees.length) return;
    for (let i = 0; i < 14; i++) {
      const t = trees[Math.floor(r() * trees.length)];
      const el = document.createElement('span');
      el.className = 'pvs-firefly';
      el.style.left = `${t.x - M + (r() - 0.5) * t.h * 1.6}px`;
      el.style.top = `${t.y - t.h * (0.15 + r() * 0.45)}px`;
      el.style.setProperty('--dur', `${(3 + r() * 3.5).toFixed(2)}s`);
      el.style.setProperty('--delay', `${(-r() * 6).toFixed(2)}s`);
      el.style.setProperty('--wander', `${(6 + r() * 6).toFixed(2)}s`);
      el.style.setProperty('--dx', `${((r() - 0.5) * t.h * 1.2).toFixed(1)}px`);
      el.style.setProperty('--dy', `${(-r() * t.h * 0.5).toFixed(1)}px`);
      this._fireflies.append(el);
    }
  }

  // ---- Paper birds by day, and a shooting star now and then at night -----------------

  private _birdCanvas(): HTMLCanvasElement {
    const el = canvas('pvs-bird');
    const w = 46;
    const h = 20;
    el.width = Math.round(w * this._dpr);
    el.height = Math.round(h * this._dpr);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    const g = el.getContext('2d');
    if (g) {
      g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
      g.beginPath();
      g.moveTo(2, 13);
      g.quadraticCurveTo(12, 2, 23, 12);
      g.quadraticCurveTo(34, 2, 44, 13);
      g.quadraticCurveTo(34, 7, 23, 16);
      g.quadraticCurveTo(12, 7, 2, 13);
      g.fillStyle = rgba(dimRgb([34, 47, 68], clamp(this._inputs?.dim ?? 1, 0, 1)), 0.82);
      g.fill();
      paperOver(g, w, h);
    }
    return el;
  }

  private _sendFlock(): void {
    const scene = this._inputs?.weather;
    if (!scene || !this._light?.sun.day || scene.rain > 0 || scene.snow > 0 || scene.storm) return;
    const windy = scene.wind > 1;
    const dir = windy ? 1 : Math.random() < 0.5 ? 1 : -1;
    const n = 4 + Math.floor(Math.random() * 4);
    const birds: Bird[] = [];
    for (let i = 0; i < n; i++) {
      const el = this._birdCanvas();
      this._birds.append(el);
      // A loose V: the leader in front, the others behind on either side.
      const rank = Math.ceil(i / 2);
      const side = i % 2 ? -1 : 1;
      birds.push({ el, dx: -rank * 46 * dir, dy: rank * 16 * side + (Math.random() - 0.5) * 10, s: 0.6 + Math.random() * 0.45, ph: Math.random() * 6.28 });
    }
    this._flocks.push({ birds, dir, x: dir > 0 ? -120 : this._w + 120, y0: this._h * (0.16 + Math.random() * 0.2), speed: this._w / (26 + Math.random() * 10) });
  }

  private _moveBirds(t: number, dt: number): void {
    const windy = (this._inputs?.weather.wind ?? 1) > 1;
    for (const f of this._flocks) {
      f.x += f.speed * f.dir * dt * (windy ? 1.7 : 1);
      for (const b of f.birds) {
        // Beat for a while, then glide; with the wind behind them, they mostly glide.
        const beating = Math.sin(t / 3.1 + b.ph) > (windy ? 0.75 : -0.35);
        const flap = beating ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 9.5 + b.ph)) : 0.85;
        const x = f.x + b.dx;
        const y = f.y0 + b.dy + Math.sin(t * 0.9 + b.ph) * 7;
        b.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${b.s * f.dir}, ${b.s * flap})`;
      }
    }
    this._flocks = this._flocks.filter(f => {
      const gone = f.dir > 0 ? f.x > this._w + 400 : f.x < -400;
      if (gone) f.birds.forEach(b => b.el.remove());
      return !gone;
    });
  }

  private _shootingStar(): void {
    const el = div('pvs-meteor');
    this._meteors.append(el);
    const x = this._w * (0.2 + Math.random() * 0.6);
    const y = this._horizon * (0.08 + Math.random() * 0.35);
    const ang = 18 + Math.random() * 22;
    const run = Math.min(this._w, this._h) * 0.3;
    const dx = Math.cos((ang * Math.PI) / 180) * run;
    const dy = Math.sin((ang * Math.PI) / 180) * run;
    const peak = Math.sqrt(clamp(this._inputs?.dim ?? 1, 0, 1));
    el.animate([
      { transform: `translate(${x}px, ${y}px) rotate(${ang}deg) scaleX(0.2)`, opacity: 0 },
      { transform: `translate(${x + dx * 0.4}px, ${y + dy * 0.4}px) rotate(${ang}deg) scaleX(1)`, opacity: peak, offset: 0.35 },
      { transform: `translate(${x + dx}px, ${y + dy}px) rotate(${ang}deg) scaleX(0.6)`, opacity: 0 },
    ], { duration: 1100, easing: 'cubic-bezier(.3,.6,.4,1)' }).finished.then(() => el.remove(), () => el.remove());
  }

  /** Visitors, with calm-day life: a flock every few minutes by day, a shooting star now and then at night. */
  private _visitors(now: number, t: number, dt: number): void {
    const L = this._light;
    if (this._life && L) {
      const between = (range: readonly [number, number]) => range[0] + Math.random() * (range[1] - range[0]);
      if (!this._nextFlock) this._nextFlock = now + 20_000 + Math.random() * 40_000;
      if (now >= this._nextFlock) {
        this._sendFlock();
        this._nextFlock = now + between(LIFE.flockEveryMs);
      }
      if (L.stars > 0.5) {
        if (!this._nextMeteor) this._nextMeteor = now + between(LIFE.meteorEveryMs) / 2;
        if (now >= this._nextMeteor) {
          this._shootingStar();
          this._nextMeteor = now + between(LIFE.meteorEveryMs);
        }
      } else this._nextMeteor = 0;
    }
    this._moveBirds(t, dt);
    // Fireflies on dry summer evenings, swaying with the near hill.
    const scene = this._inputs?.weather;
    const inputs = this._inputs;
    const show = this._life && !!L && this._season === 'summer' && !!scene && scene.rain === 0 && scene.snow === 0 && !!inputs
      && firefliesOut(L.e, inputs.now.getHours() * 60 + inputs.now.getMinutes(), inputs.rise, inputs.set);
    if (this._fireflies.hidden === show) this._fireflies.hidden = !show;
    if (show) {
      this._fireflies.style.transform = this._ridges[GROUPS - 1].style.transform;
      this._fireflies.style.opacity = String(Math.sqrt(clamp(this._inputs?.dim ?? 1, 0, 1)));
    }
  }

  private _drawGroup(gi: number): void {
    const L = this._light;
    const g = this._ridges[gi].getContext('2d');
    if (!L || !g) return;
    const W = this._w;
    const H = this._h;
    const w = W + 2 * M;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, w, H);
    const night = L.stars > 0.5;
    const lightLeft = this._sunX < W / 2 + M;
    this._geo.forEach((G, d) => {
      if (G.sheet.group !== gi) return;
      const base = seasonGround(sheetColor(L, d), d, L, this._season);
      const haze = clamp(G.sheet.haze + L.fog * 0.3 * (1 - d / (SHEETS.length - 1)), 0, 0.9);
      const silhouette = () => {
        g.beginPath();
        g.moveTo(G.edge[0][0], H + 10);
        for (const [x, y] of G.edge) g.lineTo(x, y);
        g.lineTo(G.edge[G.edge.length - 1][0], H + 10);
        g.closePath();
      };
      // The sheet, lifted: a soft shadow falls on the sheet behind (softer through haze).
      g.save();
      g.shadowColor = night ? `rgba(0,0,0,${0.42 * (1 - haze)})` : `rgba(18,38,58,${0.28 * (1 - haze * 0.8)})`;
      g.shadowBlur = 12 + d * 2.5;
      g.shadowOffsetY = -2 - d * 0.4;
      silhouette();
      g.fillStyle = rgba(base);
      g.fill();
      g.restore();
      g.save();
      silhouette();
      g.clip();
      // Snowfields above a wandering snowline.
      if (G.snowline) {
        g.beginPath();
        g.moveTo(G.snowline[0][0], -10);
        for (const [x, y] of G.snowline) g.lineTo(x, y);
        g.lineTo(G.snowline[G.snowline.length - 1][0], -10);
        g.closePath();
        g.fillStyle = rgba(mixRgb(L.snow, L.sky[2], haze * 0.6));
        g.fill();
      }
      // Creases: each peak folds into a plane toward the light and a plane away from it, over rock and snow alike.
      const fold = night ? 0.22 : 0.16 * (1 - haze * 0.6);
      for (const a of G.apexes) {
        const sx = lightLeft ? a.vx : a.lx;
        const sy = lightLeft ? a.vy : a.ly;
        const ox = lightLeft ? a.lx : a.vx;
        const creaseX = a.x + (sx - a.x) * 0.14;
        // The shaded plane runs from the crease to the valley and back under the slope, like a ridge
        // falling away, so no fold ends in a straight drop.
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(sx, sy);
        g.lineTo(a.x + (sx - a.x) * 0.75, G.foot);
        g.lineTo(creaseX, G.foot);
        g.closePath();
        g.fillStyle = `rgba(12,28,52,${fold})`;
        g.fill();
        g.beginPath();
        g.moveTo(a.x + (sx - a.x) * 0.48, a.y + (sy - a.y) * 0.48);
        g.lineTo(sx, sy);
        g.lineTo(a.x + (sx - a.x) * 0.8, G.foot);
        g.lineTo(a.x + (sx - a.x) * 0.62, G.foot);
        g.closePath();
        g.fillStyle = `rgba(12,28,52,${fold * 0.55})`;
        g.fill();
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(a.x + (ox - a.x) * 0.4, a.y + (G.foot - a.y) * 0.6);
        g.lineTo(a.x + (ox - a.x) * 0.12, G.foot);
        g.lineTo(creaseX, G.foot);
        g.closePath();
        g.fillStyle = `rgba(255,255,255,${night ? 0.03 : 0.08 * (1 - haze)})`;
        g.fill();
      }
      g.restore();
      // The cut edge catches the light.
      g.beginPath();
      G.edge.forEach(([x, y], i) => (i ? g.lineTo(x, y + 0.6) : g.moveTo(x, y + 0.6)));
      g.strokeStyle = night ? 'rgba(255,255,255,0.05)' : `rgba(255,255,255,${0.22 * (1 - haze * 0.7)})`;
      g.lineWidth = 1.1;
      g.stroke();
      // Pines: a narrow stack of cut tiers, the half away from the light darker. On the nearer sheets some trees
      // are broadleaf and turn with the season; winter lays snow on the pines (0.12.0).
      const pine = mixRgb(L.pine, L.sky[2], haze * 0.8);
      const season = this._season;
      const lit = clamp((L.e + 6) / 20, 0, 1);
      const snowy = rgba(mixRgb(L.snow, L.sky[2], haze * 0.6));
      for (const p of G.pines) {
        if (p.leafy) {
          this._drawBroadleaf(g, p, season, lit, haze, night, lightLeft);
          continue;
        }
        const tierPath = () => {
          g.beginPath();
          for (let k = 0; k < 3; k++) {
            const ty = p.y - p.h * (0.16 + k * 0.26);
            const half = p.h * (0.27 - k * 0.06);
            g.moveTo(p.x, ty - p.h * 0.36);
            g.lineTo(p.x + half, ty);
            g.lineTo(p.x - half, ty);
            g.closePath();
          }
        };
        g.save();
        g.shadowColor = night ? 'rgba(0,0,0,0.35)' : 'rgba(18,38,58,0.3)';
        g.shadowBlur = 3;
        g.shadowOffsetY = 1.5;
        tierPath();
        g.fillStyle = rgba(pine);
        g.fill();
        g.restore();
        g.save();
        tierPath();
        g.clip();
        g.fillStyle = rgba(shade(pine, -0.25));
        g.fillRect(lightLeft ? p.x : p.x - p.h, p.y - p.h * 1.1, p.h, p.h * 1.2);
        g.restore();
        if (season === 'winter') {
          // Snow on each tier, the top third of it.
          g.beginPath();
          for (let k = 0; k < 3; k++) {
            const ty = p.y - p.h * (0.16 + k * 0.26);
            const half = p.h * (0.27 - k * 0.06);
            const top = ty - p.h * 0.36;
            g.moveTo(p.x, top);
            g.lineTo(p.x + half * 0.42, top + p.h * 0.15);
            g.lineTo(p.x - half * 0.42, top + p.h * 0.15);
            g.closePath();
          }
          g.fillStyle = snowy;
          g.fill();
        }
      }
    });
    paperOver(g, w, H);
  }

  /** A broadleaf tree: a trunk and a round, lumpy crown cut from one sheet, in the season's colors; bare in winter. */
  private _drawBroadleaf(g: CanvasRenderingContext2D, p: Pine, season: Season, lit: number, haze: number, night: boolean, lightLeft: boolean): void {
    const L = this._light!;
    const r0 = p.h * 0.3;
    const cx = p.x;
    const cy = p.y - p.h * 0.55;
    const bark = rgba(mixRgb(mixRgb(L.pine, hex('#5b4636'), lit * 0.8), L.sky[2], haze * 0.8));
    g.fillStyle = bark;
    g.fillRect(cx - p.h * 0.035, p.y - p.h * 0.42, p.h * 0.07, p.h * 0.44);
    if (season === 'winter') {
      g.strokeStyle = bark;
      g.lineWidth = Math.max(1, p.h * 0.035);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx, p.y - p.h * 0.38);
      g.lineTo(cx - p.h * 0.2, p.y - p.h * 0.78);
      g.moveTo(cx, p.y - p.h * 0.48);
      g.lineTo(cx + p.h * 0.22, p.y - p.h * 0.84);
      g.moveTo(cx, p.y - p.h * 0.42);
      g.lineTo(cx + p.h * 0.02, p.y - p.h * 0.95);
      g.moveTo(cx - p.h * 0.12, p.y - p.h * 0.62);
      g.lineTo(cx - p.h * 0.24, p.y - p.h * 0.66);
      g.stroke();
      return;
    }
    const palette = CROWNS[season];
    const tone = hex(palette[(p.tone ?? 0) % palette.length]);
    // The season's color shows by day, not in the dark; at a dimmed screen's level, like the rest.
    const crown = mixRgb(mixRgb(L.pine, dimRgb(tone, clamp(this._inputs?.dim ?? 1, 0, 1)), lit), L.sky[2], haze * 0.8);
    const lumps = () => {
      g.beginPath();
      g.moveTo(cx + r0, cy);
      g.arc(cx, cy, r0, 0, Math.PI * 2);
      g.moveTo(cx - r0 * 0.55 + r0 * 0.7, cy + r0 * 0.3);
      g.arc(cx - r0 * 0.55, cy + r0 * 0.3, r0 * 0.7, 0, Math.PI * 2);
      g.moveTo(cx + r0 * 0.55 + r0 * 0.72, cy + r0 * 0.28);
      g.arc(cx + r0 * 0.55, cy + r0 * 0.28, r0 * 0.72, 0, Math.PI * 2);
    };
    g.save();
    g.shadowColor = night ? 'rgba(0,0,0,0.35)' : 'rgba(18,38,58,0.3)';
    g.shadowBlur = 3;
    g.shadowOffsetY = 1.5;
    lumps();
    g.fillStyle = rgba(crown);
    g.fill();
    g.restore();
    g.save();
    lumps();
    g.clip();
    g.fillStyle = rgba(shade(crown, -0.22));
    g.fillRect(lightLeft ? cx : cx - r0 * 2, cy - r0 * 1.4, r0 * 2, r0 * 3);
    g.restore();
  }

  private _drawCloud(c: Cloud): void {
    const L = this._light;
    const g = c.el.getContext('2d');
    if (!L || !g) return;
    const pad = c.pad;
    const w = c.w + pad * 2;
    const h = c.h * 1.4 + pad * 2;
    c.el.width = Math.round(w * this._dpr);
    c.el.height = Math.round(h * this._dpr);
    c.el.style.width = `${w}px`;
    c.el.style.height = `${h}px`;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const night = L.stars > 0.5;
    const color = c.kind === 'fog' ? mixRgb(L.cloud, L.sky[2], 0.5) : L.cloud;
    // Fog is vellum: denser at its foot, thinning toward its top.
    const fogFill = (k: number) => {
      const grad = g.createLinearGradient(0, pad, 0, h - pad);
      const tone = shade(color, -0.06 * k);
      grad.addColorStop(0, rgba(tone, k ? 0.14 : 0.2));
      grad.addColorStop(0.55, rgba(tone, k ? 0.3 : 0.4));
      grad.addColorStop(1, rgba(tone, k ? 0.45 : 0.6));
      return grad;
    };
    // Back sheets first, each a shade deeper and a little lower, then the front sheet.
    for (let k = c.sheets - 1; k >= 0; k--) {
      g.save();
      g.shadowColor = night ? 'rgba(0,0,0,0.3)' : `rgba(30,50,80,${k ? 0.16 : 0.1})`;
      g.shadowBlur = k ? 10 : 5;
      g.shadowOffsetY = k ? 4 : 2;
      cloudPath(g, c, pad + k * 5, pad + c.h * 0.4 + k * 4, 1 - k * 0.03);
      g.fillStyle = c.kind === 'fog' ? fogFill(k) : rgba(shade(color, -0.09 * k));
      g.fill();
      g.restore();
    }
    paperOver(g, w, h);
  }

  private _placeCloud(c: Cloud): void {
    c.el.style.transform = `translate3d(${c.x - c.pad}px, ${c.y - c.offY}px, 0)`;
  }

  // ---- Rain and snow: paper slivers and paper-punch flakes ------------------------

  private _drawWeather(dt: number): void {
    const g = this._weather.getContext('2d');
    if (!g) return;
    const W = this._w + 2 * M;
    const H = this._h;
    if (!this._rain.length && !this._snow.length) {
      if (this._weatherDrawn) {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, this._weather.width, this._weather.height);
        this._weatherDrawn = false;
      }
      return;
    }
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    this._weatherDrawn = true;
    const scene = this._inputs?.weather;
    const dim = ((this._light && this._light.stars > 0.5) || this._inputs?.night ? 0.55 : 1) * Math.sqrt(clamp(this._inputs?.dim ?? 1, 0, 1));
    if (this._rain.length) {
      const wind = (scene?.storm ? 110 : 50) * (scene && scene.wind > 1 ? scene.wind : 1);
      const fall = scene?.storm ? 420 : 330;
      g.lineCap = 'round';
      for (const d of this._rain) {
        d.y += fall * d.z * dt;
        d.x += wind * d.z * dt;
        if (d.y > H) {
          d.y = -30;
          d.x = Math.random() * W;
        }
        const len = 14 + 16 * d.z;
        g.strokeStyle = `rgba(236,243,250,${(0.16 + 0.22 * d.z) * dim})`;
        g.lineWidth = 1 + d.z;
        g.beginPath();
        g.moveTo(d.x, d.y);
        g.lineTo(d.x - len * (wind / fall), d.y - len);
        g.stroke();
      }
    }
    for (const d of this._snow) {
      d.y += 26 * d.z * dt;
      d.ph += dt * 0.7;
      d.x += Math.sin(d.ph) * 10 * dt;
      if (d.y > H + 8) {
        d.y = -8;
        d.x = Math.random() * W;
      }
      const rad = 1.6 + 2.6 * d.z;
      g.fillStyle = `rgba(40,60,90,${0.12 * dim})`;
      g.beginPath();
      g.arc(d.x + 0.6, d.y + 1.2, rad, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgba(255,255,255,${(0.7 + 0.25 * d.z) * dim})`;
      g.beginPath();
      g.arc(d.x, d.y, rad, 0, Math.PI * 2);
      g.fill();
    }
  }

  // ---- Lightning: a cut-paper bolt behind the near ranges, now and then -----------

  private _lightning(now: number): void {
    if (this._reduced || !this._inputs?.weather.storm) {
      this._nextBolt = 0;
      return;
    }
    if (!this._nextBolt) {
      // The first a few seconds into the storm, but never sooner than the gap after the last one.
      const first = now + 3000 + Math.random() * 4000;
      this._nextBolt = this._lastBolt ? Math.max(first, nextLightning(this._lastBolt, 0)) : first;
    }
    if (now < this._nextBolt) return;
    if (!this._strike()) {
      this._nextBolt = now + 1500;
      return;
    }
    this._lastBolt = now;
    this._nextBolt = nextLightning(now, Math.random());
  }

  /** A bolt from a cloud's base down behind the near ranges; false when there's no cloud to come from. */
  private _strike(): boolean {
    const g = this._bolt.getContext('2d');
    const source = boltSource(this._clouds.filter(c => c.host === this._farHost), this._w, this._horizon);
    if (!g || !source) return false;
    const r = Math.random;
    const bw = 140;
    const bh = Math.max(80, Math.round(this._horizon + this._band * 0.22 - source.top));
    this._bolt.width = Math.round(bw * this._dpr);
    this._bolt.height = Math.round(bh * this._dpr);
    this._bolt.style.width = `${bw}px`;
    this._bolt.style.height = `${bh}px`;
    g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
    g.clearRect(0, 0, bw, bh);
    // A zigzag that narrows as it falls, and a small fork.
    const pts: Point[] = [[bw / 2, 0]];
    for (let i = 1; i <= 7; i++) pts.push([clamp(bw / 2 + (r() - 0.5) * 70, 12, bw - 12), (bh * i) / 7]);
    const ribbon = (list: Point[], w0: number) => {
      g.beginPath();
      list.forEach(([x, y], i) => {
        const w = w0 * (1 - i / list.length) + 1.2;
        if (i) g.lineTo(x + w, y);
        else g.moveTo(x + w, y);
      });
      [...list].reverse().forEach(([x, y], j) => {
        const i = list.length - 1 - j;
        const w = w0 * (1 - i / list.length) + 1.2;
        g.lineTo(x - w, y);
      });
      g.closePath();
    };
    g.save();
    g.shadowColor = 'rgba(255,236,170,0.95)';
    g.shadowBlur = 18;
    g.fillStyle = '#fff9e3';
    ribbon(pts, 4.5);
    g.fill();
    const fork = pts.slice(3, 6).map(([x, y], i): Point => [x + (i + 1) * 14 * (r() < 0.5 ? -1 : 1), y + i * 6]);
    ribbon([pts[3], ...fork], 2);
    g.fill();
    g.restore();
    paperOver(g, bw, bh);
    const x = source.x;
    const y = source.top;
    const reach = Math.max(this._w, this._h);
    this._bolt.style.transform = `translate3d(${x - bw / 2}px, ${y}px, 0)`;
    this._flash.style.background =
      `radial-gradient(circle at ${x}px ${y + bh * 0.3}px, rgba(255,250,235,0.32) 0, ` +
      `rgba(255,250,235,0.12) ${Math.round(reach * 0.3)}px, transparent ${Math.round(reach * 0.7)}px)`;
    // One soft flash that rises fast and fades: never a strobe.
    const level = clamp(this._inputs?.dim ?? 1, 0, 1);
    this._bolt.animate([{ opacity: 0 }, { opacity: BOLT_PEAK * Math.sqrt(level), offset: 0.08 }, { opacity: 0 }], { duration: 760, easing: 'ease-out' });
    this._flash.animate([{ opacity: 0 }, { opacity: level, offset: 0.08 }, { opacity: 0 }], { duration: 980, easing: 'ease-out' });
    return true;
  }

  // ---- The loop --------------------------------------------------------------------

  private _frame = (now: number): void => {
    if (!this._running) return;
    this._raf = requestAnimationFrame(this._frame);
    const since = now - this._lastFrame;
    if (this._lastFrame && since < FRAME_MS - 2) return;
    const dt = this._lastFrame ? Math.min(0.1, since / 1000) : 0;
    this._lastFrame = now;
    this._tick(now, dt);
  };

  private _tick(now: number, dt: number): void {
    const inputs = this._inputs;
    if (!inputs || !this._built) return;
    const clock = new Date(Date.now() + this._offset);
    const minute = minuteOfDay(clock);
    if (Math.floor(minute) !== this._litMinute) this._relight(clock, this._drawn);
    else this._pending.shift()?.();
    // Every frame, from the clock: the sun and moon glide, they never step.
    this._placeSun(minute);
    if (!this._reduced) {
      const step = dt * (inputs.night ? NIGHT_DRIFT : 1);
      this._drift += step;
      const t = this._drift;
      // Depth: each group sways on its own slow cycle, the nearest the most, so the scene breathes and nothing
      // sits on the same pixels for long; calm-day life sways it further and a little quicker (0.12.0).
      this._ridges.forEach((el, gi) => {
        const sway = swayAt(t, gi, GROUPS, this._life);
        el.style.transform = `translate3d(${sway.x}px, ${sway.y}px, 0)`;
      });
      const wind = Number.isFinite(inputs.weather.wind) && inputs.weather.wind > 0 ? inputs.weather.wind : 1;
      // Wind blows in gusts, never a steady conveyor belt.
      const gust = wind > 1 ? gustAt(t, wind) : 1;
      for (const c of this._clouds) {
        c.x += c.speed * step * gust;
        if (c.x > this._w + 30) c.x = -c.w - 60 - Math.random() * this._w * 0.3;
        this._placeCloud(c);
      }
      this._visitors(now, t, dt);
    }
    this._drawWeather(dt);
    this._lightning(now);
  }
}
