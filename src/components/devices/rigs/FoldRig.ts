import { setStyle, q } from '../../../lib/dom';
import { clamp, ease } from '../../../lib/math';
import type { DeviceRig } from '../types';
import type { Segment } from '../../../lib/timeline';

/** Book foldable: the right half rotates about the spine, left to right, 180deg to flat. */
export class FoldRig implements DeviceRig {
  readonly localScale = 1;
  private fw: HTMLElement;
  private hl: HTMLElement;
  private hr: HTMLElement;
  private front: HTMLElement;

  constructor(cell: HTMLElement) {
    this.fw = q(cell, '.fw')!;
    this.hl = q(cell, '.hl')!;
    this.hr = q(cell, '.hr')!;
    this.front = q(cell, '.front')!;
  }

  layout(): void {}

  setOpen(open: number): void {
    if (open >= 0.999) {
      setStyle(this.fw, 'transform', 'none');
      setStyle(this.fw, 'opacity', '1');
      setStyle(this.hr, 'display', 'none');
      setStyle(this.hl, 'clipPath', 'none');
      return;
    }
    const ang = (1 - open) * 180;
    setStyle(this.hr, 'display', '');
    setStyle(this.hl, 'clipPath', '');
    setStyle(this.fw, 'opacity', clamp(open * 5 + 0.15).toFixed(3));
    setStyle(this.fw, 'transform', `translateX(${(25 * (1 - open)).toFixed(2)}%)`);
    setStyle(this.hr, 'transform', `rotateY(${(-ang).toFixed(2)}deg)`);
    setStyle(this.front, 'filter', ang < 90 ? `brightness(${(1 - (ang / 90) * 0.35).toFixed(3)})` : 'none');
  }

  openAmount(d: number, wy: number, seg: Segment, H: number): number {
    return Math.min(ease(clamp((0.55 - d) / 0.5)), ease(clamp((wy - seg.arr + H * 0.25) / (H * 0.75))));
  }
}
