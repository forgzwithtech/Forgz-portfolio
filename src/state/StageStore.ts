import { ScrollEngine } from '../lib/ScrollEngine';
import type { Timeline } from '../lib/timeline';

/** Values scenes share with the fixed HUD (written per frame, read per frame; never React state). */
export interface SharedUi {
  /** Camera is zoomed into a device: hide the top bar. */
  zoomed: boolean;
  /** Link for the floating "Visit site" pill. */
  visitHref: string | null;
  visitOpacity: number;
}

/**
 * The one mutable object the whole stage shares: the scroll engine, the current
 * storyboard and the HUD values. Scenes read it inside engine callbacks, so
 * scrolling never triggers React renders.
 */
export class StageStore {
  readonly engine = new ScrollEngine();
  timeline: Timeline | null = null;
  ui: SharedUi = { zoomed: false, visitHref: null, visitOpacity: 0 };

  private listeners = new Set<(tl: Timeline) => void>();
  private uiListeners = new Set<(ui: SharedUi) => void>();

  /** Merge a patch into the shared HUD values; listeners fire only when something changed. */
  setUi(patch: Partial<SharedUi>): void {
    let changed = false;
    for (const k of Object.keys(patch) as (keyof SharedUi)[]) {
      if (this.ui[k] !== patch[k]) {
        (this.ui as unknown as Record<string, unknown>)[k] = patch[k];
        changed = true;
      }
    }
    if (changed) this.uiListeners.forEach((l) => l(this.ui));
  }

  onUi(cb: (ui: SharedUi) => void): () => void {
    this.uiListeners.add(cb);
    cb(this.ui);
    return () => {
      this.uiListeners.delete(cb);
    };
  }

  setTimeline(tl: Timeline): void {
    this.timeline = tl;
    this.listeners.forEach((l) => l(tl));
    this.engine.invalidate();
  }

  onTimeline(cb: (tl: Timeline) => void): () => void {
    this.listeners.add(cb);
    if (this.timeline) cb(this.timeline);
    return () => {
      this.listeners.delete(cb);
    };
  }
}
