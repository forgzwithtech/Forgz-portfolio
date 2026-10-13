/**
 * Change-detecting style writer. The scroll engine touches many elements every
 * frame; skipping writes whose value did not change keeps style recalculation
 * (and therefore scrolling) smooth.
 */
const cache = new WeakMap<HTMLElement, Record<string, string>>();

export function setStyle(el: HTMLElement | null | undefined, prop: string, value: string): void {
  if (!el) return;
  let c = cache.get(el);
  if (!c) {
    c = {};
    cache.set(el, c);
  }
  if (c[prop] === value) return;
  c[prop] = value;
  if (prop.startsWith('--')) el.style.setProperty(prop, value);
  else (el.style as unknown as Record<string, string>)[prop] = value;
}

/** Forget cached values (call after React re-creates an element's inline style). */
export function resetStyleCache(el: HTMLElement): void {
  cache.delete(el);
}

export const q = <T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector(sel) as T | null;
export const qa = <T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll(sel)) as T[];

/** Resolve a file in /public/assets, honouring Vite's base path. */
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`.replace(/\/{2,}/g, '/');
