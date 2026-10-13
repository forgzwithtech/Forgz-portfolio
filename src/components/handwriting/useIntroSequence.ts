import { useEffect, type RefObject } from 'react';
import { useIntro } from '../../state/IntroContext';
import type { WordHandle } from './HandwrittenWord';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * The opening: wait, write the first word, swap the mesh, write the second, then
 * reveal the HUD. Scrolling skips it; `api.replay` plays it again.
 */
export function useIntroSequence(first: RefObject<WordHandle>, second: RefObject<WordHandle>): void {
  const { setMesh, setReady, api, whenLoaded } = useIntro();
  useEffect(() => {
    const a = first.current!;
    const b = second.current!;
    let run = 0;
    let running = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    const finish = () => {
      running = false;
      root.classList.remove('loading');
      setReady(true);
    };
    const skip = () => {
      run++;
      a.hide();
      b.showFull();
      setMesh('b');
      finish();
    };
    /** Show "Forgz here" at once (reduced motion or scroll), but only once everything has loaded. */
    const skipWhenLoaded = async () => {
      const id = ++run;
      running = true;
      root.classList.add('loading');
      a.showFull();
      a.wait(true);
      b.prep();
      await whenLoaded;
      if (id === run) skip();
    };
    const play = async () => {
      const id = ++run;
      running = true;
      root.classList.add('loading');
      a.prep();
      b.prep();
      setReady(false);
      setMesh('a');
      await sleep(500);
      if (id !== run) return;
      a.draw(1100);
      await sleep(1750);
      if (id !== run) return;
      // The loader: "Hello" stays on screen, breathing, until every image and font is in.
      a.wait(true);
      await whenLoaded;
      if (id !== run) return;
      a.wait(false);
      a.hide();
      setMesh('b');
      await sleep(320);
      if (id !== run) return;
      b.draw(1700);
      await sleep(2150);
      if (id !== run) return;
      finish();
    };
    api.current = { replay: play };
    // Always open at the top, with scrolling locked until the intro is done.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    let loadedNow = false;
    void whenLoaded.then(() => (loadedNow = true));
    // Scrolling after the assets are in skips the handwriting; before that the page is locked anyway.
    const onScroll = () => running && loadedNow && window.scrollY > 24 && skip();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (reduce) void skipWhenLoaded();
    else void play();
    return () => {
      run++;
      root.classList.remove('loading');
      window.removeEventListener('scroll', onScroll);
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
