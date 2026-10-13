import type { DeviceId } from './geometry';

export interface PageShot {
  src: string;
  /** Smaller file used on phones (optional). */
  sm?: string;
  w: number;
  h: number;
}

/**
 * One thing on the "work" stage. A *project* has a `page` screenshot that scrolls
 * inside a laptop. A *showcase* device (no `page`) shows the live demo layout.
 * The shape is deliberately plain JSON so a backend can serve it.
 */
export interface WorkItem {
  id: string;
  device: DeviceId;
  /** Which of the five background washes to use (0-4). */
  wash: number;
  category: string;
  title: string;
  blurb: string;
  url?: string;
  /** Opens like a book (foldables). */
  fold?: boolean;
  /** Foldable with a coded open screen and a real photographed back. */
  openScreen?: boolean;
  /** Override the demo layout width (px). */
  lw?: number;
  page?: PageShot;
  nav?: PageShot;
  pill?: PageShot & { cw: number; top: number };
  modal?: PageShot & { cw: number; r: number };
}

export const isShowcase = (i: WorkItem) => !i.page;
