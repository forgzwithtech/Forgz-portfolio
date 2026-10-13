import { createContext, useContext, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

export interface IntroApi {
  /** Replay the handwritten intro from the start. */
  replay: () => void;
}

interface IntroValue {
  /** Which gradient mesh is showing behind the hello. */
  mesh: 'a' | 'b';
  /** Intro finished: reveal the scroll cue, top bar and next button. */
  ready: boolean;
  setMesh: (m: 'a' | 'b') => void;
  setReady: (r: boolean) => void;
  api: MutableRefObject<IntroApi | null>;
  /** Resolves when every image and font is in. The intro holds on "Hello" until then. */
  whenLoaded: Promise<void>;
  markLoaded: () => void;
}

const Ctx = createContext<IntroValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [mesh, setMesh] = useState<'a' | 'b'>('a');
  const [ready, setReady] = useState(false);
  const api = useRef<IntroApi | null>(null);
  const loaded = useMemo(() => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
  }, []);
  const value = useMemo(
    () => ({ mesh, ready, setMesh, setReady, api, whenLoaded: loaded.promise, markLoaded: loaded.resolve }),
    [mesh, ready, loaded],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIntro(): IntroValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useIntro must be used inside <IntroProvider>');
  return v;
}
