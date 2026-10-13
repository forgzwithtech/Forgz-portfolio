import type { Geometry } from '../../data/geometry';
import type { WorkItem } from '../../data/workItems';
import type { Segment } from '../../lib/timeline';
import type { FC } from 'react';

export type DeviceKind = 'laptop' | 'googlebook' | 'fold' | 'phone';

export interface BodyProps {
  item: WorkItem;
  geo: Geometry;
}

/**
 * A rig animates one device imperatively (no React renders per frame):
 * it knows how the device opens and how its screen is projected.
 */
export interface DeviceRig {
  /** Scale of the screen's coordinate space relative to true photo pixels (laptop lid is rendered smaller). */
  readonly localScale: number;
  /** Called whenever the device's rendered width changes. */
  layout(dw: number): void;
  /** 0 = closed/hidden, 1 = fully open. Called every frame. */
  setOpen(open: number): void;
  /** Override how "open" follows the camera. Default: opens as the camera nears. */
  openAmount?(d: number, wy: number, seg: Segment, H: number): number;
}

export interface DeviceDefinition {
  Body: FC<BodyProps>;
  createRig(cell: HTMLElement, geo: Geometry, item: WorkItem): DeviceRig;
  /** Rendered width of the device for a viewport. */
  width(W: number, H: number, geo: Geometry): number;
}
