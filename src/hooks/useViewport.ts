import { useEffect } from 'react';

/** Calls `cb` (debounced to one per frame) whenever the viewport size changes. */
export function useViewportChange(cb: () => void): void {
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(cb);
    };
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, [cb]);
}
