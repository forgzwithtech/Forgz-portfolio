import { useRef } from 'react';
import { useIntro } from '../../state/IntroContext';
import { useFrame } from '../../state/StageContext';
import { setStyle } from '../../lib/dom';
import { clamp } from '../../lib/math';
import { visibility } from '../../lib/timeline';
import '../../styles/backgrounds.css';

const Blobs = () => (
  <>
    <i />
    <i />
    <i />
    <i />
  </>
);

/** Two gradient meshes crossfading behind the hello, fading out as the work scene arrives. */
export function Meshes() {
  const ref = useRef<HTMLDivElement>(null);
  const { mesh } = useIntro();
  useFrame((y, tl) => {
    const mo = 1 - clamp((y - tl.H * 0.6) / (tl.H * 1.6)) * 0.5;
    setStyle(ref.current, 'opacity', (mo * (1 - visibility(tl, 'work', y))).toFixed(3));
  });
  return (
    <div className="meshes" id="meshes" ref={ref}>
      <div className={`mesh a${mesh === 'a' ? ' on' : ''}`}>
        <Blobs />
      </div>
      <div className={`mesh b${mesh === 'b' ? ' on' : ''}`}>
        <Blobs />
      </div>
    </div>
  );
}

export const Grain = () => <div className="grain" aria-hidden="true" />;
