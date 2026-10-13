import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useFrame } from '../../state/StageContext';
import { useGoToStart } from '../../hooks/useNavigation';
import { placeScene } from '../../lib/sceneFx';
import { asset, setStyle } from '../../lib/dom';
import { shotSrc } from '../../lib/perf';
import { clamp, easeOut } from '../../lib/math';
import { site } from '../../config/site';
import type { WorkItem } from '../../data/workItems';
import '../../styles/close.css';

/** Scene 7: a fan of project pages plus a "Your project" slot, and the call to action. */
export function CloseScene({ projects }: { projects: WorkItem[] }) {
  const scene = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const goStart = useGoToStart();
  const [note, setNote] = useState('');
  const shots = projects.filter((p) => p.page).slice(0, 3);
  const count = shots.length + 1;

  useFrame((y, tl) => {
    const oc = placeScene(scene.current, tl, 'close', y);
    if (oc <= 0) return;
    cards.current.forEach((el, i) => {
      const t = clamp((oc - 0.15 - i * 0.1) / 0.5);
      setStyle(el, 'opacity', t.toFixed(3));
      setStyle(el, 'marginTop', `${((1 - easeOut(t)) * 40).toFixed(1)}px`);
    });
  });

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(''), 3000);
    return () => clearTimeout(t);
  }, [note]);

  const fan = (i: number): CSSProperties => {
    const k = (i - (count - 1) / 2) * 0.78;
    return { '--k': k, '--r': `${((k / 1.17) * 9).toFixed(1)}deg` } as CSSProperties;
  };
  const { contact } = site;

  return (
    <section className="scene" id="s-close" ref={scene}>
      <div className="fan" id="fan">
        {shots.map((p, i) => (
          <div className="fc" key={p.id} style={fan(i)} ref={(el) => (cards.current[i] = el)}>
            <img src={asset(shotSrc(p.page!))} alt="" />
          </div>
        ))}
        <div className="fc you" style={fan(shots.length)} ref={(el) => (cards.current[shots.length] = el)}>
          <span>+</span>
          <b>Your project</b>
        </div>
      </div>
      <h2>{site.close.title}</h2>
      <p>{site.close.body}</p>
      <div className="btns">
        {contact.href ? (
          <a className="pill" href={contact.href} target="_blank" rel="noopener noreferrer">
            {contact.label}
          </a>
        ) : (
          <button className="pill" type="button" onClick={() => setNote('Contact link coming soon.')}>
            {contact.label}
          </button>
        )}
        <button className="pill ghost" type="button" onClick={goStart}>
          {site.close.backLabel}
        </button>
      </div>
      <p className="note" role="status">
        {note}
      </p>
    </section>
  );
}
