import { useRef, type CSSProperties } from 'react';
import { MAKE, MAKE_WASH } from '../../data/content';
import { useFrame } from '../../state/StageContext';
import { placeScene } from '../../lib/sceneFx';
import { setStyle } from '../../lib/dom';
import { clamp, lerp, ease, easeOut } from '../../lib/math';
import { site } from '../../config/site';
import { perf } from '../../lib/perf';
import { MakeObject } from './MakeObject';
import '../../styles/make.css';

/** Scene 4: each thing Emberz makes gets a full-screen word that pushes through the screen. */
export function MakeScene() {
  const scene = useRef<HTMLElement>(null);
  const wash = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);

  useFrame((y, tl) => {
    const ok = placeScene(scene.current, tl, 'make', y);
    if (ok <= 0) return;
    const mm = y - tl.scenes.make[0] - tl.F * 0.3;
    const L = tl.H * 0.9;
    let act = 0;
    let best = 0;
    els.current.forEach((el, i) => {
      const p = (mm - i * L * 0.72) / L;
      let o: number, s: number, b: number;
      if (p <= 0) [o, s, b] = [0, 0.7, 12];
      else if (p < 0.3) {
        const t = easeOut(p / 0.3);
        [o, s, b] = [t, lerp(0.7, 1, t), (1 - t) * 12];
      } else if (p < 0.7) [o, s, b] = [1, lerp(1, 1.04, (p - 0.3) / 0.4), 0];
      else if (p < 1) {
        const t = ease((p - 0.7) / 0.3);
        [o, s, b] = [1 - t, lerp(1.04, 1.7, t), t * 14];
      } else [o, s, b] = [0, 1.7, 14];
      setStyle(el, 'opacity', o.toFixed(3));
      setStyle(el, 'transform', `translateY(-50%) scale(${s.toFixed(4)})`);
      setStyle(el, 'filter', b > 0.3 && !perf.lite ? `blur(${b.toFixed(1)}px)` : 'none');
      if (o > best) {
        best = o;
        act = i;
      }
    });
    setStyle(wash.current, 'background', `radial-gradient(ellipse 60% 50% at 50% 55%,${MAKE_WASH[act % MAKE_WASH.length]},rgba(255,255,255,0) 70%)`);
    setStyle(wash.current, 'opacity', clamp(ok).toFixed(2));
  });

  return (
    <section className="scene" id="s-make" ref={scene}>
      <div className="mk-wash" ref={wash} />
      <p className="eyebrow mk-top">{site.make.eyebrow}</p>
      {MAKE.map((m, i) => (
        <div className="mk" key={m.title} ref={(el) => (els.current[i] = el)}>
          <MakeObject kind={m.object} />
          <b className={m.title.length > 9 ? 'sm' : undefined} style={{ '--g1': m.from, '--g2': m.to } as CSSProperties}>
            {m.title}
          </b>
          <span>{m.body}</span>
        </div>
      ))}
    </section>
  );
}
