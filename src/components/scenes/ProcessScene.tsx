import { useRef } from 'react';
import { useFrame } from '../../state/StageContext';
import { placeScene, reveal } from '../../lib/sceneFx';
import { setStyle } from '../../lib/dom';
import { clamp, easeOut } from '../../lib/math';
import { site } from '../../config/site';
import '../../styles/process.css';

/** Scene 6: how work happens, with a progress line that connects the steps. */
export function ProcessScene() {
  const scene = useRef<HTMLElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const fill = useRef<HTMLElement>(null);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  const nodes = useRef<(HTMLElement | null)[]>([]);

  useFrame((y, tl) => {
    const o = placeScene(scene.current, tl, 'process', y);
    if (o <= 0) return;
    const { H, F } = tl;
    const pm = y - tl.scenes.process[0] - F * 0.4;
    reveal(head.current, pm / (H * 0.4), 30, easeOut);
    steps.current.forEach((el, i) => reveal(el, (pm - H * (0.35 + i * 0.3)) / (H * 0.4), 40, easeOut));
    const pf = clamp((pm - H * 0.4) / (H * 1.2));
    setStyle(fill.current, 'transform', `scaleX(${pf.toFixed(3)})`);
    nodes.current.forEach((n, i) => n?.classList.toggle('on', pf >= i * 0.5 - 0.01 && pf > 0));
  });

  return (
    <section className="scene" id="s-process" ref={scene}>
      <h2 id="pr-h" ref={head}>
        {site.process.title}
      </h2>
      <div className="steps">
        <div className="pline">
          <i id="pfill" ref={fill} />
        </div>
        {site.process.steps.map((s, i) => (
          <div className="step" key={s.n} ref={(el) => (steps.current[i] = el)}>
            <u className="node" ref={(el) => (nodes.current[i] = el)} />
            <b>{s.n}</b>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
