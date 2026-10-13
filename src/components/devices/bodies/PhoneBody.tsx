import { ScreenView } from '../../screens/ScreenView';
import { Pimg } from './Pimg';
import type { BodyProps } from '../types';

/** A device photo with the live screen underneath. Shared by phones and the Duo. */
export function PhotoDevice({ item, geo }: BodyProps) {
  return (
    <div className="pd">
      <div className="pscr">
        <ScreenView item={item} geo={geo} />
      </div>
      <Pimg name={item.device} w={geo.w} h={geo.h} />
    </div>
  );
}

export function PhoneBody(props: BodyProps) {
  return (
    <>
      <div className="fw one">
        <PhotoDevice {...props} />
      </div>
      <div className="shadow" />
    </>
  );
}
