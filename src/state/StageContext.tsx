import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { StageStore } from './StageStore';
import type { Timeline } from '../lib/timeline';
import { enableLite, perf } from '../lib/perf';

const StageContext = createContext<StageStore | null>(null);

export function StageProvider({ children }: { children: ReactNode }) {
  const ref = useRef<StageStore>();
  if (!ref.current) ref.current = new StageStore();
  const store = ref.current;
  useEffect(() => {
    // Fingers already move content natively, so follow them closely; mouse wheels get the longer glide.
    store.engine.stiffness = perf.touch ? 18 : 9;
    store.engine.onSlow = enableLite;
    store.engine.start();
    return () => store.engine.stop();
  }, [store]);
  return <StageContext.Provider value={store}>{children}</StageContext.Provider>;
}

export function useStage(): StageStore {
  const s = useContext(StageContext);
  if (!s) throw new Error('useStage must be used inside <StageProvider>');
  return s;
}

/**
 * Run `cb` on every engine frame (scroll position `y`, current storyboard `tl`).
 * The callback should write to the DOM through refs; it does not cause renders.
 */
export function useFrame(cb: (y: number, tl: Timeline, dt: number) => void): void {
  const stage = useStage();
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(
    () =>
      stage.engine.subscribe((y, dt) => {
        const tl = stage.timeline;
        if (tl) ref.current(y, tl, dt);
      }),
    [stage],
  );
}
