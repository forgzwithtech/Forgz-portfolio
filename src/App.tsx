import { useEffect, useMemo, useState } from 'react';
import { StageProvider, useStage } from './state/StageContext';
import { IntroProvider, useIntro } from './state/IntroContext';
import { preload } from './lib/preload';
import { assetsFor } from './lib/assets';
import { buildWorkItems, staticProjects } from './data';
import { loadProjects } from './api/projects';
import type { WorkItem } from './data/workItems';
import { Grain, Meshes } from './components/backgrounds/Meshes';
import { TopBar } from './components/hud/TopBar';
import { Progress } from './components/hud/Progress';
import { VisitPill } from './components/hud/VisitPill';
import { NextButton } from './components/hud/NextButton';
import { Track } from './components/Track';
import { HelloScene } from './components/scenes/HelloScene';
import { MeetScene } from './components/scenes/MeetScene';
import { HookScene } from './components/scenes/HookScene';
import { MakeScene } from './components/scenes/MakeScene';
import { WorkScene } from './components/scenes/WorkScene';
import { ProcessScene } from './components/scenes/ProcessScene';
import { CloseScene } from './components/scenes/CloseScene';
import './styles/base.css';

/** Test and debugging hooks: add ?debug to the URL. */
function DebugHooks() {
  const stage = useStage();
  useEffect(() => {
    if (!new URLSearchParams(location.search).has('debug')) return;
    const w = window as unknown as Record<string, unknown>;
    w.__forgz = {
      force: undefined,
      timeline: () => stage.timeline,
      freeze: (on: boolean) => (stage.engine.frozen = on),
      render: (y: number) => stage.engine.renderAt(y),
    };
  }, [stage]);
  return null;
}

/** Loads the project list, then every image and font, then lets the intro continue. */
function Site() {
  const { markLoaded } = useIntro();
  const [projects, setProjects] = useState<WorkItem[] | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const list = await Promise.race([loadProjects(ac.signal), new Promise<WorkItem[]>((r) => setTimeout(() => r(staticProjects), 3000))]);
      setProjects(list);
      await preload(assetsFor(buildWorkItems(list)), { timeout: 15000 });
      markLoaded();
    })();
    return () => ac.abort();
  }, [markLoaded]);
  const items = useMemo(() => (projects ? buildWorkItems(projects) : null), [projects]);

  return (
    <>
      <DebugHooks />
      <Track />
      <TopBar />
      <Progress />
      <VisitPill />
      <NextButton />
      <main className="stage">
        <Grain />
        <Meshes />
        <HelloScene />
        {items && projects && (
          <>
            <MeetScene />
            <HookScene />
            <MakeScene />
            <WorkScene items={items} />
            <ProcessScene />
            <CloseScene projects={projects} />
          </>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <StageProvider>
      <IntroProvider>
        <Site />
      </IntroProvider>
    </StageProvider>
  );
}
