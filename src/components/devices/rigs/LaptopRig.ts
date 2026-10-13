import { setStyle, q } from '../../../lib/dom';
import type { Geometry } from '../../../data/geometry';
import type { DeviceRig } from '../types';

/**
 * Real hinge: the lid is a preserve-3d plane rotating about the hinge line while the
 * whole laptop tilts so the camera looks from above. At full open it flattens to 2D.
 */
export class LaptopRig implements DeviceRig {
  readonly localScale: number;
  private root: HTMLElement;
  private pivot: HTMLElement;
  private deck: HTMLElement;
  private wrap: HTMLElement;
  private D = 0;

  constructor(cell: HTMLElement, private geo: Geometry) {
    this.root = q(cell, '.lap3')!;
    this.pivot = q(cell, '.pivot')!;
    this.deck = q(cell, '.deck')!;
    this.wrap = q(cell, '.laptop')!;
    this.localScale = (geo.lid![2] - geo.lid![0]) / geo.w;
  }

  layout(dw: number): void {
    const g = this.geo;
    const k = dw / g.w;
    const s = this.localScale;
    const D = ((g.split! - g.lid![1]) * k) / s;
    const p = D / (1 / s - 1);
    this.D = D;
    this.wrap.style.perspective = `${p.toFixed(1)}px`;
    this.wrap.style.perspectiveOrigin = `50% ${(g.split! * k).toFixed(1)}px`;
    this.deck.style.height = `${D.toFixed(1)}px`;
    this.deck.style.transform = `translateZ(${(-D).toFixed(1)}px) rotateX(90deg)`;
    this.root.style.transformOrigin = `50% ${(g.split! * k).toFixed(1)}px`;
  }

  setOpen(open: number): void {
    if (open >= 0.999) {
      if (!this.root.classList.contains('o')) this.root.classList.add('o');
      setStyle(this.root, 'transform', 'none');
      setStyle(this.pivot, 'transform', `scale(${this.localScale.toFixed(5)})`);
      return;
    }
    if (this.root.classList.contains('o')) this.root.classList.remove('o');
    const o = Math.max(open, 0.012);
    setStyle(this.root, 'transform', `rotateX(${(-36 * (1 - o)).toFixed(2)}deg)`);
    setStyle(this.pivot, 'transform', `translateZ(${(-this.D).toFixed(1)}px) rotateX(${(-90 * (1 - o)).toFixed(2)}deg)`);
  }
}
