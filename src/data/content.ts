export type MakeObjectKey = 'web' | 'app' | 'gfx' | 'vid';

export interface MakeItem {
  title: string;
  body: string;
  /** Gradient used on the big word. */
  from: string;
  to: string;
  object: MakeObjectKey;
}

/** "What we make": one full-screen word per entry. Add a row to add a word. */
export const MAKE: MakeItem[] = [
  { title: 'Websites.', body: 'Fast, responsive, built on React and .NET.', from: '#3b82f6', to: '#8b5cf6', object: 'web' },
  { title: 'Apps.', body: 'Mobile and desktop, from one codebase.', from: '#ff7a45', to: '#ec4899', object: 'app' },
  { title: 'Graphic design.', body: 'Identity, flyers and everything printed.', from: '#8b5cf6', to: '#ec4899', object: 'gfx' },
  { title: 'Video.', body: 'Cuts, titles and motion.', from: '#10b981', to: '#3b82f6', object: 'vid' },
];

/** Soft colour behind each "make" word. */
export const MAKE_WASH = ['rgba(122,92,255,.16)', 'rgba(255,138,61,.18)', 'rgba(236,72,153,.14)', 'rgba(34,170,120,.15)'];

/** Background colours of the five wash layers behind the work scene (indexed by item.wash). */
export const WASHES = [
  'radial-gradient(ellipse at 50% 55%,#efe9ff,#ddd3fb)',
  'radial-gradient(ellipse at 50% 55%,#fff1e4,#ffdcc2)',
  'radial-gradient(ellipse at 50% 55%,#fbf6e6,#efe3bf)',
  'radial-gradient(ellipse at 50% 55%,#eaf4ff,#cfe2ff)',
  'radial-gradient(ellipse at 50% 55%,#e9fbf3,#c9efdf)',
];
