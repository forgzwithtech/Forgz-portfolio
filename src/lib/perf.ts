/**
 * Device capability flags, read once at start-up.
 *
 *  - `lite`  : skip the expensive effects (blur, backdrop blur, floating animations,
 *              motion blur). Chosen up-front for weak devices, or switched on at runtime
 *              if scrolling drops frames (see ScrollEngine.onSlow).
 *  - `small` : phone-sized screen, so smaller screenshot files are used.
 *  - `touch` : finger input, so scroll snapping and snappier easing are used.
 */
export const perf = { lite: false, small: false, touch: false };

export function initPerf(): void {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  perf.touch = matchMedia('(pointer: coarse)').matches;
  perf.small = Math.min(innerWidth, screen.width || innerWidth) <= 820;
  const weak =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
    !!nav.connection?.saveData ||
    matchMedia('(prefers-reduced-data: reduce)').matches;
  const q = new URLSearchParams(location.search).get('perf');
  perf.lite = q === 'lite' ? true : q === 'full' ? false : weak;
  apply();
}

/** Switch effects off at runtime (called when frames are being dropped). */
export function enableLite(): void {
  if (perf.lite) return;
  perf.lite = true;
  apply();
}

function apply(): void {
  const r = document.documentElement;
  r.dataset.perf = perf.lite ? 'lite' : 'full';
  r.classList.toggle('touch', perf.touch);
}

/** Pick the right screenshot file for this device. */
export const shotSrc = (s: { src: string; sm?: string }): string => (perf.small && s.sm ? s.sm : s.src);
