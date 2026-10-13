import { useRef } from 'react';
import { HandwrittenWord, type WordHandle } from '../handwriting/HandwrittenWord';
import { useIntroSequence } from '../handwriting/useIntroSequence';
import { useIntro } from '../../state/IntroContext';
import { useFrame } from '../../state/StageContext';
import { setStyle } from '../../lib/dom';
import { clamp } from '../../lib/math';
import { site } from '../../config/site';
import { perf } from '../../lib/perf';
import '../../styles/hello.css';

/** Scene 1: "Hello", then "Forgz here", handwritten over gradient meshes. */
export function HelloScene() {
  const scene = useRef<HTMLElement>(null);
  const a = useRef<WordHandle>(null);
  const b = useRef<WordHandle>(null);
  const { ready } = useIntro();
  useIntroSequence(a, b);

  useFrame((y, tl) => {
    const H = tl.H;
    const hp = clamp((y - H * 0.12) / (H * 1.1));
    const ho = 1 - clamp((hp - 0.5) / 0.5);
    const el = scene.current;
    setStyle(el, 'opacity', ho.toFixed(3));
    setStyle(el, 'visibility', ho <= 0 ? 'hidden' : 'visible');
    setStyle(el, 'transform', hp > 0 ? `scale(${(1 + Math.pow(hp, 2.4) * 14).toFixed(3)})` : 'none');
    setStyle(el, 'filter', hp > 0.2 && !perf.lite ? `blur(${(clamp((hp - 0.2) / 0.8) * 10).toFixed(1)}px)` : 'none');
    setStyle(el, 'pointerEvents', 'none');
  });

  return (
    <section className="scene" id="s-hello" ref={scene}>
      <h1 className="hello" id="hello" aria-label={site.hello.join(', ')}>
        <HandwrittenWord ref={a} word={site.hello[0]} />
        <HandwrittenWord ref={b} word={site.hello[1]} />
      </h1>
      <div className={`cue${ready ? ' in' : ''}`}>
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
