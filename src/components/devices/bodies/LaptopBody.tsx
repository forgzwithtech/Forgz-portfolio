import { asset } from '../../../lib/dom';
import { ScreenView } from '../../screens/ScreenView';
import { Pimg } from './Pimg';
import type { BodyProps } from '../types';

/**
 * Where the lid, hinge and base sit inside the laptop photo (as % of the photo).
 * Produced by the photo pipeline; change them only if you swap the laptop photos.
 */
const HINGE = '92.2965%';
const PIVOT = { left: '50%', width: '101.0705%', marginLeft: '-50.5352%', top: '-0.9880%', height: '93.2845%' };
const BACK = { left: '0.5296%', top: '0.4724%', width: '98.9409%', height: '99.5276%' };

/** 3D laptop: a lid on a hinge (pivot), a coded keyboard deck, and the base photo. */
export function LaptopBody({ item, geo }: BodyProps) {
  const split = geo.split ?? geo.h;
  return (
    <>
      <div className="lap3" style={{ aspectRatio: geo.w / geo.h, transformOrigin: `50% ${HINGE}` }}>
        <div className="deck" style={{ top: HINGE }} />
        <div className="pivot" style={PIVOT}>
          <div className="lid pd">
            <div className="pscr">
              <ScreenView item={item} geo={geo} />
            </div>
            <Pimg name="mac_lid" w={geo.w} h={split} />
          </div>
          <div
            className="lback"
            style={{ ...BACK, backgroundImage: `url(${asset('dev_mac_back.webp')})`, borderRadius: '2% 2% .6% .6% / 3% 3% .8% .8%' }}
          />
        </div>
        <div className="base pd" style={{ top: HINGE }}>
          <Pimg name="mac_base" w={geo.w} h={geo.h - split} />
        </div>
      </div>
      <div className="shadow" />
    </>
  );
}
