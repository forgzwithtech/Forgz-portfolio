import { useMemo, useRef } from 'react';
import { useFrame } from '../../state/StageContext';
import { placeScene } from '../../lib/sceneFx';
import { setStyle } from '../../lib/dom';
import { clamp, lerp } from '../../lib/math';
import { site } from '../../config/site';
import '../../styles/hook.css';

const C0 = [212, 212, 218];
const C1 = [29, 29, 31];
const mix = (t: number) => `rgb(${C0.map((c, i) => Math.round(lerp(c, C1[i], t))).join(',')})`;

/** Scene 3: the pitch. Words darken as you scroll while a 3-second ring fills. */
export function HookScene() {
  const scene = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const ring = useRef<SVGCircleElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const list = useMemo(() => site.hook.lead.split(' '), []);

  useFrame((y, tl) => {
    const o = placeScene(scene.current, tl, 'hook', y);
    if (o <= 0) return;
    const hf = clamp((y - tl.scenes.hook[0] - tl.F * 0.5) / (tl.H * 1.5));
    const hq = hf * list.length;
    words.current.forEach((w, i) => setStyle(w, 'color', mix(clamp(hq - i))));
    setStyle(ring.current as unknown as HTMLElement, 'strokeDashoffset', (327 * (1 - hf)).toFixed(1));
    if (time.current) time.current.textContent = `${(hf * 3).toFixed(1)}s`;
  });

  return (
    <section className="scene" id="s-hook" ref={scene}>
      <div className="hookwrap">
        <div className="ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset=".5" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#ff7a45" />
              </linearGradient>
            </defs>
            <circle className="rb" cx="60" cy="60" r="52" />
            <circle className="rf" id="rf" ref={ring} cx="60" cy="60" r="52" transform="rotate(-90 60 60)" />
          </svg>
          <div className="rt" id="rt">
            <span ref={time}>0.0s</span>
            <small>{site.hook.ringLabel}</small>
          </div>
        </div>
        <p className="lead" id="lead">
          {list.map((w, i) => (
            <span key={i}>
              <span className="w" ref={(el) => (words.current[i] = el)}>
                {w}
              </span>{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
