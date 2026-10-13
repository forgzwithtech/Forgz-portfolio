import { setStyle, q } from '../../../lib/dom';
import { homography, matrix3d, rectPts, type Pt } from '../../../lib/homography';
import type { Geometry } from '../../../data/geometry';
import type { DeviceRig } from '../types';

const TEX_W = 1000;
const TEX_H = 654;

/**
 * The lid is a quad whose far corners are interpolated along an arc (slerp-like) from
 * "closed" to "open". Past the vertical it flips from the lid front to the lid back.
 */
export class GoogleBookRig implements DeviceRig {
  readonly localScale = 1;
  private lid: HTMLElement;
  private back: HTMLElement;
  private tex: HTMLElement;
  private k = 1;
  private o: Pt[] = [];
  private HL: Pt = [0, 0];
  private HR: Pt = [0, 0];
  private cl: Pt[] = [];

  constructor(cell: HTMLElement, private geo: Geometry) {
    this.lid = q(cell, '.glid')!;
    this.back = q(cell, '.gback')!;
    this.tex = q(cell, '.gbtex')!;
  }

  layout(dw: number): void {
    const k = dw / this.geo.w;
    const K = this.geo.gbk!;
    const sc = (a: number[]): Pt => [a[0] * k, a[1] * k];
    this.k = k;
    this.o = K.open.map(sc);
    this.HL = sc(K.hinge[0]);
    this.HR = sc(K.hinge[1]);
    this.cl = K.closed.map(sc);
  }

  setOpen(open: number): void {
    if (open >= 0.999) {
      setStyle(this.lid, 'transform', 'none');
      setStyle(this.lid, 'visibility', 'visible');
      setStyle(this.back, 'visibility', 'hidden');
      return;
    }
    const t = 1 - open;
    const Om = 1.75;
    const so = Math.sin(Om);
    const a = Math.sin((1 - t) * Om) / so;
    const b = Math.sin(t * Om) / so;
    const { HL, HR, o, cl } = this;
    const TL: Pt = [HL[0] + a * (o[0][0] - HL[0]) + b * (cl[0][0] - HL[0]), HL[1] + a * (o[0][1] - HL[1]) + b * (cl[0][1] - HL[1])];
    const TR: Pt = [HR[0] + a * (o[1][0] - HR[0]) + b * (cl[1][0] - HR[0]), HR[1] + a * (o[1][1] - HR[1]) + b * (cl[1][1] - HR[1])];
    const dy = (TL[1] + TR[1]) / 2 - (HL[1] + HR[1]) / 2;
    if (Math.abs(dy) < this.k * 8) {
      setStyle(this.lid, 'visibility', 'hidden');
      setStyle(this.back, 'visibility', 'hidden');
      return;
    }
    if (dy < 0) {
      setStyle(this.lid, 'visibility', 'visible');
      setStyle(this.back, 'visibility', 'hidden');
      setStyle(this.lid, 'transform', matrix3d(homography([o[0], o[1], HR, HL], [TL, TR, HR, HL])));
    } else {
      setStyle(this.lid, 'visibility', 'hidden');
      setStyle(this.back, 'visibility', 'visible');
      setStyle(this.tex, 'transform', matrix3d(homography(rectPts(TEX_W, TEX_H), [TR, TL, HL, HR])));
    }
  }
}
