import { useRef } from 'react';
import { useFrame } from '../../state/StageContext';
import { setStyle } from '../../lib/dom';
import { clamp } from '../../lib/math';

export function Progress() {
  const ref = useRef<HTMLDivElement>(null);
  useFrame((y, tl) => setStyle(ref.current, 'transform', `scaleX(${clamp(y / Math.max(1, tl.total)).toFixed(4)})`));
  return <div className="progress" ref={ref} />;
}
