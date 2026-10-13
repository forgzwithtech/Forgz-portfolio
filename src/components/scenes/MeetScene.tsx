import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useFrame, useStage } from '../../state/StageContext';
import { placeScene, reveal } from '../../lib/sceneFx';
import { setStyle } from '../../lib/dom';
import { asset } from '../../lib/dom';
import { clamp, lerp, easeOut } from '../../lib/math';
import { site } from '../../config/site';
import '../../styles/meet.css';

const LS_KEY = 'forgz-photo';
const readSaved = () => {
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
};

/** Scene 2: portrait with pointer tilt, floating chips and the big name. */
export function MeetScene() {
  const stage = useStage();
  const scene = useRef<HTMLElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const pwrap = useRef<HTMLDivElement>(null);
  const m1 = useRef<HTMLParagraphElement>(null);
  const m2 = useRef<HTMLHeadingElement>(null);
  const m3 = useRef<HTMLParagraphElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLSpanElement | null)[]>([]);
  const [photo, setPhoto] = useState<string | null>(site.photo ? asset(site.photo) : readSaved());
  const scrollBase = useRef(0);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0 });

  const applyTilt = () => {
    const t = tilt.current;
    const H = stage.timeline?.H ?? 800;
    const base = Math.sin((scrollBase.current / H) * 1.4) * 5;
    setStyle(portrait.current, 'transform', `rotateY(${(base + t.x * 14).toFixed(2)}deg) rotateX(${(-t.y * 10).toFixed(2)}deg)`);
  };

  // Pointer tilt: eases toward the pointer, loop sleeps once it arrives.
  useEffect(() => {
    const t = tilt.current;
    const step = () => {
      t.raf = 0;
      t.x += (t.tx - t.x) * 0.1;
      t.y += (t.ty - t.y) * 0.1;
      applyTilt();
      if (Math.abs(t.tx - t.x) > 0.001 || Math.abs(t.ty - t.y) > 0.001) t.raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      t.tx = e.clientX / Math.max(1, innerWidth) - 0.5;
      t.ty = e.clientY / Math.max(1, innerHeight) - 0.5;
      if (!t.raf) t.raf = requestAnimationFrame(step);
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(t.raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((y, tl) => {
    const { H, F } = tl;
    const om = placeScene(scene.current, tl, 'meet', y, { enterScale: 1.45 });
    if (om <= 0) return;
    const m = y - tl.scenes.meet[0] - F * 0.4;
    reveal(pwrap.current, m / (H * 0.5), 50, easeOut);
    reveal(m1.current, (m - H * 0.35) / (H * 0.35), 30, easeOut);
    reveal(m2.current, (m - H * 0.55) / (H * 0.4), 36, easeOut);
    reveal(m3.current, (m - H * 0.9) / (H * 0.4), 30, easeOut);
    const mp = y - tl.scenes.meet[0];
    const pr = clamp(mp / (H * 2.6));
    setStyle(big.current, 'transform', `translate(calc(-50% + ${lerp(9, -9, pr).toFixed(2)}vw),-50%) scale(${(1 + pr * 0.12).toFixed(3)})`);
    scrollBase.current = mp;
    applyTilt();
    site.meet.chips.forEach((c, i) => setStyle(chips.current[i], 'transform', `translateY(${(-(mp - H * 0.6) * c.speed).toFixed(1)}px)`));
  });

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result);
      setPhoto(url);
      try {
        localStorage.setItem(LS_KEY, url);
      } catch {
        /* storage unavailable */
      }
    };
    r.readAsDataURL(f);
  };

  return (
    <section className="scene" id="s-meet" ref={scene}>
      <div className="bigname" id="bigname" aria-hidden="true" ref={big}>
        {site.handle.toUpperCase()}
      </div>
      <div className="meet">
        <div className="pwrap" id="pwrap" ref={pwrap}>
          <div className="portrait" id="portrait" ref={portrait}>
            {photo ? (
              <img src={photo} alt={`Portrait of ${site.handle}`} />
            ) : (
              <>
                <svg viewBox="0 0 200 220" aria-hidden="true">
                  <circle cx="100" cy="82" r="40" fill="#cfcfd6" />
                  <path d="M14 220c0-50 38-80 86-80s86 30 86 80z" fill="#cfcfd6" />
                </svg>
                <label className="upload">
                  Add your photo
                  <input type="file" accept="image/*" aria-label="Add your photo" onChange={onFile} />
                </label>
              </>
            )}
          </div>
          {site.meet.chips.map((c, i) => (
            <span key={c.text} className="fchip" ref={(el) => (chips.current[i] = el)} style={c.pos as CSSProperties}>
              {c.text}
            </span>
          ))}
        </div>
        <div className="mcopy">
          <p className="eyebrow" ref={m1}>
            {site.meet.eyebrow}
          </p>
          <h2 ref={m2}>{site.meet.title}</h2>
          <p ref={m3}>{site.meet.body}</p>
        </div>
      </div>
    </section>
  );
}
