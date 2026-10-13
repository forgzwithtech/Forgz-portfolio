import { useEffect, useRef } from 'react';
import { useStage } from '../../state/StageContext';

/** Floating "Visit site" pill shown while the camera is zoomed into a project. */
export function VisitPill() {
  const stage = useStage();
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(
    () =>
      stage.onUi((ui) => {
        const a = ref.current;
        if (!a) return;
        a.style.opacity = String(ui.visitOpacity);
        a.style.pointerEvents = ui.visitOpacity > 0.5 ? 'auto' : 'none';
        if (ui.visitHref && a.getAttribute('href') !== ui.visitHref) a.setAttribute('href', ui.visitHref);
      }),
    [stage],
  );
  return (
    <a className="visit" id="visit" ref={ref} href="#" target="_blank" rel="noopener noreferrer">
      Visit site ↗
    </a>
  );
}
