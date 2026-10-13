import { useEffect, useRef } from 'react';
import { useIntro } from '../../state/IntroContext';
import { useStage } from '../../state/StageContext';
import { site } from '../../config/site';
import '../../styles/hud.css';

export function TopBar() {
  const stage = useStage();
  const { ready } = useIntro();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => stage.onUi((ui) => ref.current && (ref.current.style.opacity = ui.zoomed ? '0' : '')), [stage]);
  return (
    <div className={`hud${ready ? ' in' : ''}`} id="hud" ref={ref}>
      <span>{site.handle}</span>
      <span>{site.company}</span>
    </div>
  );
}
