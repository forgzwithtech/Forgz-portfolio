import { useEffect, useState } from 'react';
import { useStage } from '../state/StageContext';

/**
 * The invisible tall element that gives the page its native scroll length.
 * It also carries the snap markers that let touch scrolling settle on each chapter.
 */
export function Track() {
  const stage = useStage();
  const [state, setState] = useState<{ h: number; snaps: number[] }>({ h: 0, snaps: [] });
  useEffect(() => stage.onTimeline((tl) => setState({ h: Math.round(tl.total + tl.H), snaps: tl.snaps.map(Math.round) })), [stage]);
  return (
    <div className="track" id="track" aria-hidden="true" style={{ height: state.h }}>
      {state.snaps.map((y) => (
        <i className="snap" key={y} style={{ top: y }} />
      ))}
    </div>
  );
}
