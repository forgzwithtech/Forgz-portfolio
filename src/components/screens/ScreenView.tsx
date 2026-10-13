import { memo } from 'react';
import { asset } from '../../lib/dom';
import { shotSrc } from '../../lib/perf';
import type { Geometry } from '../../data/geometry';
import type { PageShot, WorkItem } from '../../data/workItems';
import { IkStoreDemo } from './IkStoreDemo';

const Img = ({ shot, className, style }: { shot: PageShot; className: string; style?: React.CSSProperties }) => (
  <img className={className} src={asset(shotSrc(shot))} width={shot.w} height={shot.h} alt="" decoding="async" style={style} />
);

/** The little cut-out on top of a screen (island, punch-hole, notch). */
function Cutout({ item }: { item: WorkItem }) {
  if (item.device === 'ios') return <i className="isl" />;
  if (item.openScreen) return <i className="hole r" />;
  if (item.device === 'and') return <i className="hole" />;
  if (item.device === 'mac') return <i className="notch" />;
  return null;
}

/**
 * What appears *on* a device's screen. A project with a `page` screenshot scrolls that
 * image (with optional sticky nav, floating pill and modal); anything else shows the
 * live responsive demo. Device bodies place this inside their screen opening.
 */
function ScreenViewBase({ item, geo }: { item: WorkItem; geo: Geometry }) {
  const { page, nav, pill, modal } = item;
  if (page) {
    return (
      <div className="screen">
        <div className="page">
          <Img shot={page} className="shot" />
        </div>
        {nav && <Img shot={nav} className="navimg" />}
        {pill && <Img shot={pill} className="pillimg" style={{ width: `${pill.cw}cqw`, top: `${pill.top}cqw` }} />}
        {modal && (
          <>
            <div className="dim" />
            <Img shot={modal} className="modal" style={{ width: `${modal.cw}cqw`, borderRadius: `${modal.r}cqw` }} />
          </>
        )}
        <Cutout item={item} />
        <div className="glare" />
      </div>
    );
  }
  const lw = item.lw ?? geo.lw;
  return (
    <div className="screen">
      <div className="page">
        <div className="vp" style={{ width: lw }}>
          <IkStoreDemo />
        </div>
      </div>
      {item.openScreen && <div className="crease" />}
      <Cutout item={item} />
      <div className="glare" />
    </div>
  );
}

export const ScreenView = memo(ScreenViewBase);
