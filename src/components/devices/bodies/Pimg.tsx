import { asset } from '../../../lib/dom';

/** A device photo (transparent where the screen is). */
export const Pimg = ({ name, w, h }: { name: string; w: number; h: number }) => (
  <img className="pimg" src={asset(`dev_${name}.webp`)} width={w} height={h} alt="" decoding="async" />
);
