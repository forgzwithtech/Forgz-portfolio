import { setStyle, q } from '../../../lib/dom';
import type { DeviceRig } from '../types';

/** A rigid device: it simply rises and fades in as the camera arrives. */
export class PhoneRig implements DeviceRig {
  readonly localScale = 1;
  private fw: HTMLElement;
  constructor(cell: HTMLElement) {
    this.fw = q(cell, '.fw')!;
  }
  layout(): void {}
  setOpen(open: number): void {
    if (open >= 0.999) {
      setStyle(this.fw, 'transform', 'none');
      setStyle(this.fw, 'opacity', '1');
      return;
    }
    setStyle(this.fw, 'opacity', open.toFixed(3));
    setStyle(this.fw, 'transform', `translateY(${((1 - open) * 40).toFixed(1)}px) scale(${(0.92 + 0.08 * open).toFixed(4)})`);
  }
}
