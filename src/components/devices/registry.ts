import type { WorkItem } from '../../data/workItems';
import type { DeviceDefinition, DeviceKind } from './types';
import { LaptopBody } from './bodies/LaptopBody';
import { GoogleBookBody } from './bodies/GoogleBookBody';
import { FoldBody } from './bodies/FoldBody';
import { PhoneBody } from './bodies/PhoneBody';
import { LaptopRig } from './rigs/LaptopRig';
import { GoogleBookRig } from './rigs/GoogleBookRig';
import { FoldRig } from './rigs/FoldRig';
import { PhoneRig } from './rigs/PhoneRig';

/** Width a non-laptop device is drawn at: tall enough to read, never wider than the screen allows. */
const deviceWidth = (W: number, H: number, w: number, h: number) => {
  const wide = w / h > 1.25;
  const maxW = W < 700 ? W * 0.88 : W * (wide ? 0.58 : 0.46);
  return Math.min((H * 0.56 * w) / h, maxW);
};

/**
 * Add a new device type here: a Body (JSX), a Rig (how it opens) and a width rule.
 * Then point a WorkItem at it via `kindOf` below.
 */
export const deviceKinds: Record<DeviceKind, DeviceDefinition> = {
  laptop: {
    Body: LaptopBody,
    createRig: (cell, geo) => new LaptopRig(cell, geo),
    width: (W, H) => (W < 700 ? W * 0.92 : Math.min(W * 0.62, H * 0.84)),
  },
  googlebook: {
    Body: GoogleBookBody,
    createRig: (cell, geo) => new GoogleBookRig(cell, geo),
    width: (W, H, g) => deviceWidth(W, H, g.w, g.h),
  },
  fold: {
    Body: FoldBody,
    createRig: (cell) => new FoldRig(cell),
    width: (W, H, g) => deviceWidth(W, H, g.w, g.h),
  },
  phone: {
    Body: PhoneBody,
    createRig: (cell) => new PhoneRig(cell),
    width: (W, H, g) => deviceWidth(W, H, g.w, g.h),
  },
};

export const kindOf = (item: WorkItem): DeviceKind =>
  item.device === 'mac' ? 'laptop' : item.device === 'gb' ? 'googlebook' : item.fold ? 'fold' : 'phone';
