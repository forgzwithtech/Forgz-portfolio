import { asset } from '../../../lib/dom';
import { ScreenView } from '../../screens/ScreenView';
import { Pimg } from './Pimg';
import type { BodyProps } from '../types';

const poly = (pts: number[][], w: number, h: number) => `polygon(${pts.map(([x, y]) => `${((x / w) * 100).toFixed(4)}% ${((y / h) * 100).toFixed(4)}%`).join(',')})`;

/** Googlebook: base photo, the real lid back (visible while closed) and the lid front with the live screen. */
export function GoogleBookBody({ item, geo }: BodyProps) {
  const k = geo.gbk!;
  const { w, h } = geo;
  return (
    <>
      <div className="gbw" style={{ aspectRatio: w / h }}>
        <div className="gbase">
          <Pimg name="gb_base" w={w} h={h} />
        </div>
        <div className="gback" style={{ clipPath: poly(k.clip, w, h) }}>
          <div className="gbtex" style={{ backgroundImage: `url(${asset('dev_gb_back.webp')})` }} />
        </div>
        <div className="glid" style={{ clipPath: poly([k.open[0], k.open[1], k.hinge[1], k.hinge[0]], w, h) }}>
          <div className="pscr">
            <ScreenView item={item} geo={geo} />
          </div>
          <Pimg name="gb_lid" w={w} h={h} />
        </div>
      </div>
      <div className="shadow" />
    </>
  );
}
