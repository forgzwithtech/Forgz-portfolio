import raw from './deviceGeometry.json';

export type DeviceId = 'mac' | 'ios' | 'and' | 'duo' | 'fold1' | 'fold2' | 'gb';

type P = [number, number];

export interface Geometry {
  /** Photo size in its own pixels. */
  w: number;
  h: number;
  /** Screen corners in photo pixels: TL, TR, BR, BL. */
  quad: P[];
  /** Aspect ratio (w/h) of the real screen. */
  ar: number;
  /** Logical CSS width the demo layout is rendered at. */
  lw: number;
  /** Laptop: row where the lid ends and the base begins, and the lid's bounding box. */
  split?: number;
  lid?: [number, number, number, number];
  /** Foldables: colour sampled for the back plate. */
  plate?: string;
  /** Googlebook: hinge, open and closed lid corners and deck clip polygon. */
  gbk?: { open: P[]; closed: P[]; hinge: P[]; clip: P[] };
}

export const geometry = raw as unknown as Record<DeviceId, Geometry>;
