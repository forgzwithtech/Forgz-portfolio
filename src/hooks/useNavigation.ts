import { useCallback } from 'react';
import { useIntro } from '../state/IntroContext';
import { useStage } from '../state/StageContext';

const prefersReduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollToY = (top: number) => window.scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });

/** Scroll to the top, then replay the handwritten intro. */
export function useGoToStart(): () => void {
  const intro = useIntro();
  return useCallback(() => {
    scrollToY(0);
    const t0 = performance.now();
    const wait = window.setInterval(() => {
      if (window.scrollY < 4) {
        clearInterval(wait);
        intro.api.current?.replay();
      } else if (performance.now() - t0 > 8000) clearInterval(wait);
    }, 60);
  }, [intro]);
}

/** Jump to the next chapter stop (or back to the start from the end). */
export function useNextChapter(): () => void {
  const stage = useStage();
  const goStart = useGoToStart();
  return useCallback(() => {
    const tl = stage.timeline;
    if (!tl) return;
    const y = window.scrollY;
    if (y > tl.scenes.close[0] + tl.F * 0.7) return goStart();
    const next = tl.chapters.find((c) => c > y + tl.H * 0.15);
    if (next !== undefined) scrollToY(next);
  }, [stage, goStart]);
}
