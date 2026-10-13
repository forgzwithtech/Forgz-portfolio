import type { MakeObjectKey } from '../../data/content';

const APP_COLORS = ['#ff7a45', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#22c55e', '#6366f1', '#f97316', '#14b8a6'];

/** The floating glass illustration beside each "what we make" word. */
export function MakeObject({ kind }: { kind: MakeObjectKey }) {
  switch (kind) {
    case 'web':
      return (
        <div className="obj web">
          <div className="wbar">
            <i />
            <i />
            <i />
          </div>
          <div className="blk b1" />
          <div className="blk b2" />
          <div className="blk b3" />
        </div>
      );
    case 'app':
      return (
        <div className="obj app">
          <div className="in">
            {APP_COLORS.map((c) => (
              <i key={c} style={{ background: `linear-gradient(150deg,${c},rgba(255,255,255,.35))` }} />
            ))}
          </div>
        </div>
      );
    case 'gfx':
      return (
        <div className="obj gfx">
          <svg viewBox="0 0 240 200" aria-hidden="true">
            <defs>
              <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="82" cy="86" r="52" fill="url(#gg)" opacity=".9" />
            <rect x="104" y="58" width="92" height="92" rx="18" fill="#fff" opacity=".85" transform="rotate(12 150 104)" />
            <path d="M20 168 C70 40 150 190 222 40" fill="none" stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round" />
            <g fill="#fff" stroke="#1d1d1f" strokeWidth="2.5">
              <rect x="14" y="162" width="12" height="12" rx="2" />
              <rect x="216" y="34" width="12" height="12" rx="2" />
            </g>
          </svg>
        </div>
      );
    case 'vid':
      return (
        <div className="obj vid">
          <div className="pl" />
          <div className="tl" />
        </div>
      );
  }
}
