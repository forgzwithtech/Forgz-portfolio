import { forwardRef, memo } from 'react';
import { geometry } from '../../data/geometry';
import type { WorkItem } from '../../data/workItems';
import { deviceKinds, kindOf } from './registry';

/** One slot on the work stage: caption + device. All motion is applied by CellController. */
const DeviceCellBase = forwardRef<HTMLDivElement, { item: WorkItem }>(function DeviceCell({ item }, ref) {
  const geo = geometry[item.device];
  const { Body } = deviceKinds[kindOf(item)];
  return (
    <div className="cell" ref={ref}>
      <div className="laptop">
        <div className="cap">
          <p className="eyebrow">{item.category}</p>
          <h3>{item.title}</h3>
          <p className="blurb">{item.blurb}</p>
          {item.url && (
            <a className="vlink" href={item.url} target="_blank" rel="noopener noreferrer">
              Visit site ↗
            </a>
          )}
        </div>
        <Body item={item} geo={geo} />
      </div>
    </div>
  );
});

export const DeviceCell = memo(DeviceCellBase);
