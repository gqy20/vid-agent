import {useCurrentFrame} from 'remotion';
import type {RuntimeScene} from '../kit/runtime/EpisodeRuntime';
import {CourseLayout, EpisodeTimeline, SceneTitle, TerminalThenModelScene, createEpisodeRuntime} from '../kit';
import {RecordedBrowserThenModelScene} from '../kit/browser/RecordedBrowserThenModelScene';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {CompareCards, FlowSteps, ModelScene, QuestionSceneVisual, RepositoryTopology, type FlowTone} from './WorkflowEpisodeVisuals';

type EpisodeInfo = {
  readonly seriesTitle: string;
  readonly title: string;
};

type Card = {readonly label: string; readonly detail: string; readonly tone?: FlowTone};
type EvidenceBase = {
  readonly scene: string;
  readonly title: string;
  readonly at: number;
  readonly cards?: readonly Card[];
  readonly repositories?: readonly {readonly label: string; readonly ref: string; readonly tone?: FlowTone}[];
};
type TerminalEvidence = EvidenceBase & {readonly recording: keyof typeof TERMINAL_RECORDINGS};
type BrowserEvidence = EvidenceBase & {
  readonly browser: {readonly src: string; readonly url: string; readonly title: string};
};
type Evidence = TerminalEvidence | BrowserEvidence;

export type ServerInfrastructureDefinition = {
  readonly eyebrow: string;
  readonly question: string;
  readonly modelTitle: string;
  readonly modelSteps: readonly {readonly label: string; readonly detail?: string; readonly tone?: FlowTone}[];
  readonly evidence: readonly [Evidence, Evidence, Evidence];
  readonly takeawayTitle: string;
  readonly takeawaySteps: readonly {readonly label: string; readonly detail?: string; readonly tone?: FlowTone}[];
};

export const createServerInfrastructureEpisode = (
  episode: EpisodeInfo,
  scenes: readonly RuntimeScene[],
  definition: ServerInfrastructureDefinition,
) => {
  const runtime = createEpisodeRuntime(scenes);
  const cue = (id: keyof typeof TERMINAL_RECORDINGS, duration: number) => ({
    id,
    from: 0,
    durationInFrames: seconds(duration + 0.7),
    src: `git-course-lab/terminal/${id}.mp4`,
    holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`,
    holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame,
  });

  const Hook = () => <QuestionSceneVisual eyebrow={definition.eyebrow} question={definition.question} captions={runtime.captions('hook')} />;
  const Model = () => <ModelScene title={definition.modelTitle} captions={runtime.captions(scenes[1].id)}><FlowSteps steps={definition.modelSteps} /></ModelScene>;
  const evidenceModel = (spec: Evidence) => <>
        <SceneTitle style={{position:'absolute',top:112,left:180,right:180}}>{spec.title}</SceneTitle>
        {spec.repositories ? <RepositoryTopology repositories={spec.repositories} /> : <CompareCards cards={spec.cards ?? []} />}
      </>;
  const EvidenceScene = ({spec}: {readonly spec: Evidence}) => 'browser' in spec ? (
    <RecordedBrowserThenModelScene
      src={spec.browser.src}
      url={spec.browser.url}
      title={spec.browser.title}
      modelAtSeconds={spec.at}
      model={evidenceModel(spec)}
      captions={runtime.captions(spec.scene)}
    />
  ) : (
    <TerminalThenModelScene
      cues={[cue(spec.recording, spec.at)]}
      modelAtSeconds={spec.at}
      terminalEvidenceHoldSeconds={1}
      model={evidenceModel(spec)}
      captions={runtime.captions(spec.scene)}
      auditIdPrefix={`${spec.recording}-${spec.scene}`}
    />
  );
  const Takeaway = () => <ModelScene title={definition.takeawayTitle} captions={runtime.captions('takeaway')}><FlowSteps steps={definition.takeawaySteps} /></ModelScene>;

  const components: Record<string, React.ComponentType> = {
    hook: Hook,
    [scenes[1].id]: Model,
    [definition.evidence[0].scene]: () => <EvidenceScene spec={definition.evidence[0]} />,
    [definition.evidence[1].scene]: () => <EvidenceScene spec={definition.evidence[1]} />,
    [definition.evidence[2].scene]: () => <EvidenceScene spec={definition.evidence[2]} />,
    takeaway: Takeaway,
  };

  const Episode = () => {
    const frame = useCurrentFrame();
    return <CourseLayout
      seriesTitle={episode.seriesTitle}
      episodeTitle={episode.title}
      scenes={scenes}
      currentFrame={frame}
      showHeader={(value) => value >= runtime.start(scenes[1].id)}
      showEpisodeTitle={(value) => value >= runtime.start(scenes[1].id)}
    ><EpisodeTimeline runtime={runtime} components={components} /></CourseLayout>;
  };

  return {Episode, runtime};
};
