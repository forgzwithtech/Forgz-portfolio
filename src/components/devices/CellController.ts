import { setStyle, q, qa } from '../../lib/dom';
import { clamp, lerp, ease, easeOut } from '../../lib/math';
import { homography, matrix3d, rectPts, type Pt } from '../../lib/homography';
import type { Geometry } from '../../data/geometry';
import type { WorkItem } from '../../data/workItems';
import type { Segment } from '../../lib/timeline';
import type { DeviceRig } from './types';
import { perf } from '../../lib/perf';

export interface Measure {
  /** Projected screen size (px, before camera zoom) used to pick the zoom level. */
  bw: number;
  bh: number;
  /** Offset of the screen centre from the cell's device centre. */
  offX: number;
  offY: number;
}

export interface FrameParams {
  d: number;
  open: number;
  scale: number;
  zt: number;
  zoomMax: number;
  wy: number;
  H: number;
  dt: number;
  seg: Segment;
}

/**
 * Imperative controller for one work cell. React renders the DOM once; this class
 * measures it, warps the live screen into the photo, and applies per-frame motion.
 */
export class CellController {
  readonly measure: Measure = { bw: 0, bh: 0, offX: 0, offY: 0 };
  maxShift = 0;
  screenW = 0;
  screenH = 0;

  private laptop: HTMLElement;
  private screen: HTMLElement;
  private pages: HTMLElement[];
  private vps: HTMLElement[];
  private pscrs: HTMLElement[];
  private glares: HTMLElement[];
  private cap: HTMLElement;
  private shadow: HTMLElement | null;
  private pill: HTMLElement | null;
  private dim: HTMLElement | null;
  private modal: HTMLElement | null;
  private vlink: HTMLElement | null;
  private lastShift = 0;
  private vel = 0;

  constructor(
    readonly el: HTMLElement,
    readonly item: WorkItem,
    private geo: Geometry,
    readonly rig: DeviceRig,
  ) {
    this.laptop = q(el, '.laptop')!;
    this.screen = q(el, '.screen')!;
    this.pages = qa(el, '.page');
    this.vps = qa(el, '.vp');
    this.pscrs = qa(el, '.pscr');
    this.glares = qa(el, '.glare');
    this.cap = q(el, '.cap')!;
    this.shadow = q(el, '.shadow');
    this.pill = q(el, '.pillimg');
    this.dim = q(el, '.dim');
    this.modal = q(el, '.modal');
    this.vlink = q(el, '.vlink');
  }

  place(i: number, W: number, H: number): void {
    this.el.style.left = `${i * W}px`;
    this.el.style.width = `${W}px`;
    this.el.style.height = `${H}px`;
  }

  /** Size the device and project its screen. */
  layout(dw: number): void {
    const { geo, item, rig } = this;
    this.laptop.style.setProperty('--dw', `${dw}px`);
    const k = dw / geo.w;
    rig.layout(dw);
    if (item.openScreen) {
      Object.assign(this.measure, { bw: this.screen.offsetWidth, bh: this.screen.offsetHeight, offX: 0, offY: 0 });
      return;
    }
    const quad = geo.quad as Pt[];
    let cx = 0;
    let cy = 0;
    quad.forEach((p) => {
      cx += p[0] / 4;
      cy += p[1] / 4;
    });
    const ks = k / rig.localScale;
    const Q = quad.map((p): Pt => [(cx + (p[0] - cx) * 1.004) * ks, (cy + (p[1] - cy) * 1.004) * ks]);
    const lh = ((Math.hypot(quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]) + Math.hypot(quad[2][0] - quad[1][0], quad[2][1] - quad[1][1])) / 2) * k;
    const Wf = lh * geo.ar;
    const xs = Q.map((p) => p[0]);
    const ys = Q.map((p) => p[1]);
    Object.assign(this.measure, {
      bw: Math.max(...xs) - Math.min(...xs),
      bh: Math.max(...ys) - Math.min(...ys),
      offX: cx * k - dw / 2,
      offY: cy * k - (geo.h * k) / 2,
    });
    const m = matrix3d(homography(rectPts(Wf, lh), Q));
    this.pscrs.forEach((e) => {
      e.style.width = `${Wf}px`;
      e.style.height = `${lh}px`;
      e.style.transform = m;
    });
  }

  /** Scale the responsive demo into its screen and size the scrolling page. Call after layout(). */
  fit(): void {
    this.screenW = this.screen.offsetWidth;
    this.screenH = this.screen.offsetHeight;
    if (this.vps.length) {
      const lw = this.item.lw ?? this.geo.lw;
      const k = this.screenW / lw;
      this.vps.forEach((v, j) => {
        v.style.transform = `scale(${k})`;
        this.pages[j].style.height = `${v.offsetHeight * k}px`;
      });
    }
    this.maxShift = Math.max(0, this.pages[0].offsetHeight - this.screenH);
  }

  setVisible(v: boolean): void {
    setStyle(this.el, 'visibility', v ? 'visible' : 'hidden');
  }

  update(p: FrameParams): void {
    const { open, scale, zt, zoomMax, wy, H, dt, seg } = p;
    this.rig.setOpen(open);
    const capO = clamp((open - 0.55) / 0.45) * (1 - clamp((scale - 1) / 0.3));
    setStyle(this.cap, 'opacity', capO.toFixed(3));
    setStyle(this.vlink, 'pointerEvents', capO > 0.6 ? 'auto' : 'none');
    const go = (1 - clamp(((scale - 1) / Math.max(1e-6, zoomMax - 1)) * 1.4)).toFixed(3);
    this.glares.forEach((g) => setStyle(g, 'opacity', go));
    setStyle(this.shadow, 'opacity', (open * (1 - zt)).toFixed(3));

    const ip = clamp((wy - seg.s0) / seg.sd);
    const shift = ip * this.maxShift;
    const tr = `translate3d(0,${(-shift).toFixed(1)}px,0)`;
    this.pages.forEach((pg) => setStyle(pg, 'transform', tr));

    // Motion blur on screenshot pages only, from scroll speed (frame-rate independent), quantised.
    if (this.item.page && !perf.lite) {
      if (dt > 0) {
        const v = Math.abs(shift - this.lastShift) / (dt * 60);
        this.vel = lerp(this.vel, v, 0.35);
      }
      this.lastShift = shift;
      const bl = Math.round(clamp((this.vel - 6) * 0.12, 0, 3.2) * 4) / 4;
      setStyle(this.pages[0], 'filter', bl > 0.15 ? `blur(${bl.toFixed(2)}px)` : 'none');
    }
    setStyle(this.pill, 'opacity', clamp((shift - this.screenH * 0.14) / (this.screenH * 0.1)).toFixed(3));
    if (this.modal && this.dim) {
      const mt = seg.m0 === undefined ? 0 : wy - seg.m0;
      const md = seg.md ?? H;
      const pin = easeOut(clamp(mt / (H * 0.28)));
      const pout = clamp((mt - (md - H * 0.28)) / (H * 0.28));
      const mo = pin * (1 - ease(pout));
      setStyle(this.dim, 'opacity', mo.toFixed(3));
      setStyle(this.modal, 'opacity', mo.toFixed(3));
      setStyle(this.modal, 'transform', `translate(-50%,-50%) translateY(${((1 - mo) * 3).toFixed(2)}cqw) scale(${(0.9 + mo * 0.1).toFixed(4)})`);
    }
  }
}
