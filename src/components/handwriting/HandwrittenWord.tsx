import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import words from '../../data/handwriting.json';

export interface WordHandle {
  /** Reset to "nothing drawn yet". */
  prep(): void;
  /** Pen-draw the word over `ms` milliseconds. */
  draw(ms: number): void;
  showFull(): void;
  hide(): void;
  /** Gentle breathing while we wait for assets. */
  wait(on: boolean): void;
}

type WordData = { w: number; h: number; d: string[] };
const data = words as unknown as Record<string, WordData>;

/** A word written stroke by stroke (SVG paths from a single-line font + stroke-dashoffset). */
export const HandwrittenWord = forwardRef<WordHandle, { word: string }>(function HandwrittenWord({ word }, ref) {
  const d = data[word];
  const svg = useRef<SVGSVGElement>(null);
  const lens = useRef<number[]>([]);
  const paths = () => Array.from(svg.current!.querySelectorAll('path'));

  useLayoutEffect(() => {
    lens.current = paths().map((p) => p.getTotalLength());
  }, [word]);

  useImperativeHandle(ref, () => ({
    prep() {
      svg.current!.classList.remove('off');
      paths().forEach((p, i) => {
        p.style.transition = 'none';
        p.style.strokeDasharray = `${lens.current[i]} ${lens.current[i]}`;
        p.style.strokeDashoffset = String(lens.current[i]);
        p.style.opacity = '0';
      });
    },
    draw(ms) {
      const ps = paths();
      const sum = lens.current.reduce((a, b) => a + b, 0);
      let t = 0;
      ps.forEach((p, i) => {
        const dur = (ms * lens.current[i]) / sum;
        p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(.45,.05,.55,.95) ${t}ms, opacity 0s linear ${t}ms`;
        t += dur;
      });
      void svg.current!.getBoundingClientRect();
      ps.forEach((p) => {
        p.style.strokeDashoffset = '0';
        p.style.opacity = '1';
      });
    },
    showFull() {
      svg.current!.classList.remove('off');
      paths().forEach((p) => {
        p.style.transition = 'none';
        p.style.strokeDashoffset = '0';
        p.style.opacity = '1';
      });
    },
    hide() {
      svg.current!.classList.add('off');
      svg.current!.classList.remove('wait');
    },
    wait(on) {
      svg.current!.classList.toggle('wait', on);
    },
  }));

  return (
    <svg ref={svg} className="hw" viewBox={`0 0 ${d.w} ${d.h}`} aria-hidden="true" style={{ aspectRatio: `${d.w} / ${d.h}` }}>
      {d.d.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  );
});
