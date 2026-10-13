import { clamp } from './math';

export type SceneKey = 'hello' | 'meet' | 'hook' | 'make' | 'work' | 'process' | 'close';
export type Range = [number, number];

/** Camera keyframe: [scroll position, cell index, zoom scale]. */
export type Keyframe = [number, number, number];

export interface Segment {
  /** Scroll position where the camera arrives at this item. */
  arr: number;
  /** Where the zoom-in finishes and in-screen scrolling starts. */
  s0: number;
  /** Length of the in-screen scroll. */
  sd: number;
  /** Optional modal pop-in (start, duration). */
  m0?: number;
  md?: number;
}

export interface Timeline {
  W: number;
  H: number;
  /** Fade window used when scenes cross-dissolve. */
  F: number;
  scenes: Record<SceneKey, Range>;
  keyframes: Keyframe[];
  segments: Segment[];
  /** Zoom target for each work item. */
  zoom: number[];
  zoomMax: number;
  /** Chapter stops for the "next" button. */
  chapters: number[];
  /** Resting positions where touch scrolling settles (chapters plus each "make" word). */
  snaps: number[];
  total: number;
}

export interface TimelineInput {
  W: number;
  H: number;
  /** One entry per work item, in order. */
  items: { showcase: boolean; hasModal: boolean }[];
  zoom: number[];
  /** How far each item's page can scroll inside its screen (px). */
  maxShift: number[];
  screenH: number[];
  /** How many "what we make" words there are. */
  makeCount: number;
}

/** Pure function: viewport + measured devices in, one scroll storyboard out. */
export function buildTimeline(inp: TimelineInput): Timeline {
  const { W, H, items, zoom, maxShift, screenH, makeCount } = inp;
  const F = H * 0.55;
  const N = items.length;
  const sc = {} as Record<SceneKey, Range>;
  sc.hello = [-1e9, H * 1.25];
  sc.meet = [sc.hello[1] - F, 0];
  sc.meet[1] = sc.meet[0] + H * 2.6 + F;
  sc.hook = [sc.meet[1] - F, 0];
  sc.hook[1] = sc.hook[0] + H * 2.3 + F;
  sc.make = [sc.hook[1] - F, 0];
  sc.make[1] = sc.make[0] + H * (0.9 * 0.72 * (makeCount - 1) + 0.9) + H * 0.5 + F;
  const ws = sc.make[1] - F;

  const keyframes: Keyframe[] = [[0, 0, 1]];
  const segments: Segment[] = [];
  let cur = 0;
  cur += H * 1.1;
  keyframes.push([cur, 0, 1]);
  for (let i = 0; i < N; i++) {
    const dev = items[i].showcase;
    const sg = {} as Segment;
    if (i > 0) {
      cur += H * (dev ? 0.75 : 0.9);
      keyframes.push([cur, i, 1]);
    }
    sg.arr = cur;
    cur += H * (dev ? 0.35 : 0.5);
    keyframes.push([cur, i, 1]);
    cur += H * (dev ? 0.8 : 0.9);
    keyframes.push([cur, i, zoom[i]]);
    sg.s0 = cur;
    const ratio = maxShift[i] / Math.max(1, screenH[i]);
    sg.sd = dev ? clamp(ratio * H * 0.5, H * 0.6, H * 1.6) : clamp(ratio * H * 0.5, H * 0.7, H * 2.6);
    cur += sg.sd;
    keyframes.push([cur, i, zoom[i]]);
    if (items[i].hasModal) {
      sg.m0 = cur;
      sg.md = H;
      cur += sg.md;
      keyframes.push([cur, i, zoom[i]]);
    }
    cur += H * (dev ? 0.6 : 0.8);
    keyframes.push([cur, i, 1]);
    segments.push(sg);
  }
  cur += H * 0.5;
  keyframes.push([cur, Math.max(0, N - 1), 1]);
  sc.work = [ws, ws + cur + F];
  sc.process = [sc.work[1] - F, 0];
  sc.process[1] = sc.process[0] + H * 2.3 + F;
  sc.close = [sc.process[1] - F, 1e9];
  const total = sc.close[0] + H * 0.9;

  const base = ws + F * 0.4;
  // Resting positions: every reveal finished, nothing mid-transition.
  const meetRest = sc.meet[0] + H * 1.6;
  const hookRest = sc.hook[0] + F * 0.5 + H * 1.6;
  const L = H * 0.9;
  const makeRests = Array.from({ length: makeCount }, (_, i) => sc.make[0] + F * 0.3 + i * L * 0.72 + L * 0.5);
  const deviceRests = segments.map((s) => base + s.arr + H * 0.3);
  const processRest = sc.process[0] + F * 0.4 + H * 1.6;
  const closeRest = sc.close[0] + F;
  const chapters = [0, meetRest, hookRest, makeRests[0], ...deviceRests, processRest, closeRest];
  const snaps = [0, meetRest, hookRest, ...makeRests, ...deviceRests, processRest, closeRest];

  return { W, H, F, scenes: sc, keyframes, segments, zoom, zoomMax: Math.max(1, ...zoom), chapters, snaps, total };
}

/** Where is the work camera at `p` (scroll offset inside the work scene)? */
export function cameraAt(keyframes: Keyframe[], p: number, ease: (t: number) => number): { cell: number; scale: number } {
  let i = 0;
  for (i = 0; i < keyframes.length - 1; i++) if (p <= keyframes[i + 1][0]) break;
  if (i >= keyframes.length - 1) i = keyframes.length - 2;
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const t = b[0] === a[0] ? 1 : ease(clamp((p - a[0]) / (b[0] - a[0])));
  return { cell: a[1] + (b[1] - a[1]) * t, scale: Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * t) };
}

/** 0 outside the scene, 1 well inside it, with F-long fades at each edge. */
export function visibility(tl: Timeline, key: SceneKey, y: number): number {
  const r = tl.scenes[key];
  return clamp((y - r[0]) / tl.F) * clamp((r[1] - y) / tl.F);
}
