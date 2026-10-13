import { lerp } from './math';
import { setStyle } from './dom';
import { visibility, type SceneKey, type Timeline } from './timeline';

/**
 * Cross-dissolve a whole scene: fade, a gentle scale (zooming in as it arrives,
 * through you as it leaves), optional blur. Returns the scene's visibility 0..1.
 */
export function placeScene(
  el: HTMLElement | null,
  tl: Timeline,
  key: SceneKey,
  y: number,
  opts: { blur?: boolean; enterScale?: number } = {},
): number {
  const o = visibility(tl, key, y);
  if (!el) return o;
  const r = tl.scenes[key];
  const out = y > (r[0] + r[1]) / 2;
  setStyle(el, 'opacity', o.toFixed(3));
  setStyle(el, 'pointerEvents', o > 0.5 ? 'auto' : 'none');
  setStyle(el, 'visibility', o <= 0 ? 'hidden' : 'visible');
  const s = out ? 1 + (1 - o) * 0.16 : lerp(opts.enterScale ?? 0.94, 1, o);
  setStyle(el, 'transform', o >= 1 ? 'none' : `scale(${s.toFixed(4)})`);
  if (opts.blur) setStyle(el, 'filter', o >= 1 ? 'none' : `blur(${((1 - o) * 8).toFixed(1)}px)`);
  return o;
}

/** Reveal an element: opacity 0..1 and a short rise, driven by progress `t`. */
export function reveal(el: HTMLElement | null, t: number, rise: number, easeFn: (t: number) => number): void {
  if (!el) return;
  const c = Math.min(1, Math.max(0, t));
  setStyle(el, 'opacity', c.toFixed(3));
  setStyle(el, 'transform', `translateY(${((1 - easeFn(c)) * rise).toFixed(1)}px)`);
}
