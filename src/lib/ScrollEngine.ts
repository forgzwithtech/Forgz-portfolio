import { clamp } from './math';

export type FrameCallback = (y: number, dt: number) => void;

/**
 * Drives every scroll-linked animation from one place.
 *
 *  - The browser scrolls natively (so wheel, touch, keyboard and scrollbar all work).
 *  - We read `scrollY` and ease towards it with a *time-based* exponential
 *    smoothing, so the feel is identical at 60, 120 or 144 Hz.
 *  - The rAF loop only runs while something is moving. At rest it costs nothing.
 *  - Subscribers write straight to the DOM (no React re-render per frame).
 */
export class ScrollEngine {
  /** Smoothed scroll position that animations read. */
  y = 0;
  /** Higher = snappier. 9 feels like a gentle glide. */
  stiffness = 9;
  reduceMotion = false;
  /** Test hook: stop following the page scroll. */
  frozen = false;
  /** Called once if scrolling keeps dropping frames (weak device). */
  onSlow: (() => void) | null = null;
  private slow = 0;

  private subs = new Set<FrameCallback>();
  private raf = 0;
  private last = 0;
  private dirty = true;
  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.y = window.scrollY;
    window.addEventListener('scroll', this.kick, { passive: true });
    this.kick();
  }

  stop(): void {
    this.running = false;
    window.removeEventListener('scroll', this.kick);
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  subscribe(cb: FrameCallback): () => void {
    this.subs.add(cb);
    return () => {
      this.subs.delete(cb);
    };
  }

  /** Ask for a re-render at the current position (after layout or data changes). */
  invalidate(): void {
    this.dirty = true;
    this.kick();
  }

  /** Jump the smoothed position and render once (used by tests and "back to start"). */
  renderAt(y: number): void {
    this.y = y;
    this.emit(0);
  }

  private kick = (): void => {
    if (this.raf || !this.running) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  };

  private tick = (now: number): void => {
    this.raf = 0;
    if (this.frozen) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    const raw = (now - this.last) / 1000;
    const dt = clamp(raw, 0.001, 0.05);
    if (raw > 0.034 && raw < 0.5) {
      if (++this.slow >= 18 && this.onSlow) {
        this.onSlow();
        this.onSlow = null;
      }
    } else if (this.slow > 0 && raw < 0.022) this.slow--;
    this.last = now;
    const target = window.scrollY;
    const prev = this.y;
    if (this.reduceMotion) this.y = target;
    else {
      this.y += (target - this.y) * (1 - Math.exp(-this.stiffness * dt));
      if (Math.abs(target - this.y) < 0.05) this.y = target;
    }
    if (this.y !== prev || this.dirty) {
      this.dirty = false;
      this.emit(dt);
    }
    if (this.y !== target) this.raf = requestAnimationFrame(this.tick);
  };

  private emit(dt: number): void {
    this.subs.forEach((cb) => cb(this.y, dt));
  }
}
