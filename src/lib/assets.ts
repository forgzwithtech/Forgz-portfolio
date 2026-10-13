import { asset } from './dom';
import { shotSrc } from './perf';
import { site } from '../config/site';
import { kindOf } from '../components/devices/registry';
import type { WorkItem } from '../data/workItems';

/** Every file the site needs, so the loader can wait for all of it before opening. */
export function assetsFor(items: WorkItem[]): string[] {
  const names = new Set<string>(['ik_orange.jpg', 'ik_15pm.jpg', 'ik_13.jpg']);
  if (site.photo) names.add(site.photo);
  const urls: string[] = [];
  const push = (s?: { src: string; sm?: string }) => s && urls.push(asset(shotSrc(s)));
  for (const it of items) {
    push(it.page);
    push(it.nav);
    push(it.pill);
    push(it.modal);
    const kind = kindOf(it);
    if (kind === 'laptop') ['mac_lid', 'mac_base', 'mac_back'].forEach((n) => names.add(`dev_${n}.webp`));
    else if (kind === 'googlebook') ['gb_base', 'gb_lid', 'gb_back'].forEach((n) => names.add(`dev_${n}.webp`));
    else {
      names.add(`dev_${it.device}.webp`);
      if (it.device === 'duo') names.add('dev_duo_back.webp');
    }
  }
  return [...urls, ...[...names].map(asset)];
}
