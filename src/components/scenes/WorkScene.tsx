import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useIntro } from '../../state/IntroContext';
import { perf } from '../../lib/perf';
import { geometry } from '../../data/geometry';
import { WASHES } from '../../data/content';
import { isShowcase, type WorkItem } from '../../data/workItems';
import { DeviceCell } from '../devices/DeviceCell';
import { CellController } from '../devices/CellController';
import { deviceKinds, kindOf } from '../devices/registry';
import { useFrame, useStage } from '../../state/StageContext';
import { useViewportChange } from '../../hooks/useViewport';
import { placeScene } from '../../lib/sceneFx';
import { buildTimeline, cameraAt } from '../../lib/timeline';
import { setStyle } from '../../lib/dom';
import { clamp, ease } from '../../lib/math';
import '../../styles/work.css';
import '../../styles/devices.css';

/** Where on the stage the devices sit vertically (fraction of the viewport). */
const CAMERA_Y = 0.56;
/** Cells further than this (in cell widths) from the camera are hidden and skipped. */
const CULL = 1.7;

/**
 * Scene 5: every project and device on one wide stage with a camera that
 * pans between cells, zooms into the screen and scrolls the page inside it.
 */
export function WorkScene({ items }: { items: WorkItem[] }) {
  const stage = useStage();
  const scene = useRef<HTMLElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cellEls = useRef<(HTMLDivElement | null)[]>([]);
  const washEls = useRef<(HTMLDivElement | null)[]>([]);
  const ctrls = useRef<CellController[]>([]);
  const vp = useRef({ W: 0, H: 0 });
  const raf = useRef(0);
  const { whenLoaded } = useIntro();

  const measure = useCallback(() => {
    const cs = ctrls.current;
    if (!cs.length || !world.current) return;
    const W = document.documentElement.clientWidth;
    let H = window.innerHeight;
    // Phones: the address bar sliding away changes innerHeight by ~60px. Keep the layout stable.
    if (perf.touch && vp.current.W === W && Math.abs(H - vp.current.H) < 160) H = vp.current.H;
    vp.current = { W, H };
    cs.forEach((c, i) => c.place(i, W, H));
    world.current.style.width = `${cs.length * W}px`;
    world.current.style.height = `${H}px`;
    cs.forEach((c) => c.layout(deviceKinds[kindOf(c.item)].width(W, H, geometry[c.item.device])));
    cs.forEach((c) => c.fit());
    const zoom = cs.map((c) => {
      const { bw, bh } = c.measure;
      const cover = Math.max(W / bw, H / bh);
      const contain = Math.min(W / bw, H / bh);
      const fillScreen = W / H >= 1.15 && kindOf(c.item) === 'laptop' && bw / bh >= 1.5;
      return (fillScreen ? cover : contain) * 1.012;
    });
    stage.setTimeline(
      buildTimeline({
        W,
        H,
        items: cs.map((c) => ({ showcase: isShowcase(c.item), hasModal: !!c.item.modal })),
        zoom,
        maxShift: cs.map((c) => c.maxShift),
        screenH: cs.map((c) => c.screenH),
        makeCount: 4,
      }),
    );
  }, [stage]);

  /** Coalesce bursts (image loads, resizes) into one measurement per frame. */
  const scheduleMeasure = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(measure);
  }, [measure]);

  // Build controllers once the DOM exists, then measure.
  useLayoutEffect(() => {
    ctrls.current = items.map((item, i) => {
      const el = cellEls.current[i]!;
      const geo = geometry[item.device];
      return new CellController(el, item, geo, deviceKinds[kindOf(item)].createRig(el, geo, item));
    });
    measure();
    document.fonts?.ready.then(scheduleMeasure);
    void whenLoaded.then(scheduleMeasure);
    return () => cancelAnimationFrame(raf.current);
  }, [items, measure, scheduleMeasure, whenLoaded]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onViewport = useCallback(() => {
    const W = document.documentElement.clientWidth;
    if (perf.touch && W === vp.current.W && Math.abs(window.innerHeight - vp.current.H) < 160) return;
    scheduleMeasure();
  }, [scheduleMeasure]);
  useViewportChange(onViewport);

  useFrame((y, tl, dt) => {
    const cs = ctrls.current;
    const ow = placeScene(scene.current, tl, 'work', y);
    let zoomed = false;
    let visitHref: string | null = null;
    if (ow > 0 && cs.length) {
      const wy = Math.max(0, y - tl.scenes.work[0] - tl.F * 0.4);
      const c = cameraAt(tl.keyframes, wy, ease);
      zoomed = c.scale > 1.06;
      const zt = tl.zoomMax > 1.0001 ? clamp(Math.log(c.scale) / Math.log(tl.zoomMax)) : 0;
      const gi = cs[clamp(Math.round(c.cell), 0, cs.length - 1)].measure;
      const camX = (c.cell + 0.5) * tl.W + zt * gi.offX;
      const camY = CAMERA_Y * tl.H + zt * gi.offY;
      const ty = tl.H * (CAMERA_Y - (CAMERA_Y - 0.5) * zt);
      setStyle(world.current, 'transform', `translate3d(${tl.W / 2}px,${ty.toFixed(1)}px,0) scale(${c.scale.toFixed(4)}) translate3d(${(-camX).toFixed(1)}px,${(-camY).toFixed(1)}px,0)`);

      const forced = (window as unknown as { __forgz?: { force?: Record<number, number> } }).__forgz?.force;
      const washOp = new Array(WASHES.length).fill(0);
      const near = Math.round(c.cell);
      if (zoomed && cs[near] && !isShowcase(cs[near].item) && cs[near].item.url) visitHref = cs[near].item.url!;
      cs.forEach((cc, i) => {
        const d = Math.abs(c.cell - i);
        washOp[cc.item.wash] = Math.max(washOp[cc.item.wash], clamp(1.25 - d * 1.25));
        const far = d > CULL;
        cc.setVisible(!far);
        if (far) return;
        const seg = tl.segments[i];
        let open = cc.rig.openAmount ? cc.rig.openAmount(d, wy, seg, tl.H) : ease(clamp((0.6 - d) / 0.55));
        if (i === 0 && !cc.rig.openAmount) open = Math.min(open, ease(clamp((wy - tl.H * 0.12) / (tl.H * 0.85))));
        if (forced && forced[i] !== undefined) open = forced[i];
        cc.update({ d, open, scale: c.scale, zt, zoomMax: tl.zoomMax, wy, H: tl.H, dt, seg });
      });
      washEls.current.forEach((w, i) => setStyle(w, 'opacity', washOp[i].toFixed(3)));
    }
    stage.setUi({ zoomed, ...(visitHref ? { visitHref } : {}), visitOpacity: visitHref ? ow : 0 });
  });

  return (
    <section className="scene" id="s-work" ref={scene}>
      {WASHES.map((bg, i) => (
        <div className="wash" key={i} style={{ background: bg }} ref={(el) => (washEls.current[i] = el)} />
      ))}
      <div className="spot" />
      <div className="world" id="world" ref={world} onLoadCapture={scheduleMeasure}>
        {items.map((item, i) => (
          <DeviceCell key={item.id} item={item} ref={(el) => (cellEls.current[i] = el)} />
        ))}
      </div>
    </section>
  );
}
