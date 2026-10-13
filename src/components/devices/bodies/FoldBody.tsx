import type { CSSProperties } from 'react';
import { asset } from '../../../lib/dom';
import { ScreenView } from '../../screens/ScreenView';
import { PhotoDevice } from './PhoneBody';
import type { BodyProps } from '../types';

/**
 * A book-style foldable. The left half stays put; the right half swings about the
 * spine: its `.front` is the open screen, its `.plate` is the real photographed back.
 */
export function FoldBody({ item, geo }: BodyProps) {
  const open = !!item.openScreen;
  const screen = open ? (
    <div className="od" style={{ '--pc': geo.plate, '--oar': geo.w / geo.h } as CSSProperties}>
      <ScreenView item={item} geo={geo} />
    </div>
  ) : (
    <PhotoDevice item={item} geo={geo} />
  );
  const plate = open ? (
    <div className="plate ph" style={{ backgroundImage: `url(${asset(`dev_${item.device}.webp`)})` }} />
  ) : (
    <div
      className="plate ph"
      style={{ backgroundImage: `url(${asset('dev_duo_back.webp')})`, backgroundSize: '100% 100%', borderRadius: '0 3% 3% 0/0 4% 4% 0' }}
    />
  );
  return (
    <>
      <div className="fw">
        <div className="half hl">{screen}</div>
        <div className="half hr">
          <div className="front">{screen}</div>
          {plate}
        </div>
      </div>
      <div className="shadow" />
    </>
  );
}
