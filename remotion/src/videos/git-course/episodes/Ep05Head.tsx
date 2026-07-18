import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {EP05} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {
  CenterGraph,
  CommandPill,
  CourseLayout,
  EpisodeTitleCard,
  GitGraph,
  RefInspectorCard,
  SceneCaption,
  SceneSequence,
  RecordedTerminalPanel,
  type GitGraphState,
} from '../kit';
import {COLOR, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';
import {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';

type Ep05SceneId = (typeof EP05_SCENES)[number]['id'];

const getEp05SceneStart = (id: Ep05SceneId) => {
  let cursor = 0;
  for (const scene of EP05_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP05 scene: ${id}`);
};

const getEp05SceneDuration = (id: Ep05SceneId) => {
  const scene = EP05_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP05 scene: ${id}`);
  return scene.duration;
};

type Ep05GitState = {
  main: 'C2';
  feature: 'C2' | 'C3';
  headBranch: 'main' | 'feature';
  commits: readonly string[];
};

const STATES = {
  base: {main: 'C2', feature: 'C2', headBranch: 'main', commits: ['C0', 'C1', 'C2']} satisfies Ep05GitState,
  switched: {main: 'C2', feature: 'C2', headBranch: 'feature', commits: ['C0', 'C1', 'C2']} satisfies Ep05GitState,
  committed: {main: 'C2', feature: 'C3', headBranch: 'feature', commits: ['C0', 'C1', 'C2', 'C3']} satisfies Ep05GitState,
};

const graphState = (state: Ep05GitState): GitGraphState => ({
  commits: state.commits.map((commit) => ({id: commit})),
  branches: [
    {name: 'main', target: state.main, lane: 'bottom', active: state.headBranch === 'main'},
    {name: 'feature', target: state.feature, lane: 'top', active: state.headBranch === 'feature'},
  ],
  head: {target: state.headBranch === 'main' ? state.main : state.feature, branch: state.headBranch},
});

const SYMBOLIC_REF_GRAPH: GitGraphState = {
  commits: ['C0', 'C1', 'C2'].map((id) => ({id})),
  branches: [{name: 'main', target: 'C2', lane: 'bottom', active: true}],
  head: {target: 'C2', branch: 'main'},
};

const DETACHED_GRAPH: GitGraphState = {
  commits: ['C0', 'C1', 'C2', 'C3'].map((id) => ({id})),
  branches: [
    {name: 'main', target: 'C2', lane: 'bottom'},
    {name: 'feature', target: 'C3', lane: 'top'},
  ],
  head: {target: 'C1'},
};

const useSceneFrame = () => useCurrentFrame();

const toneColor = (tone: 'main' | 'feature' | 'head') =>
  tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : COLOR.git.head;

const TimedSideLabel: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  tone?: 'main' | 'feature' | 'head';
  frame: number;
  start: number;
}> = ({children, x, y, tone = 'head', frame, start}) => {
  const opacity = interpolate(frame, [seconds(start), seconds(start + 0.55)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        maxWidth: 520,
        color: COLOR.text.primary,
        ...TYPE.subtitle,
        fontWeight: WEIGHT.bold,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          borderRadius: 999,
          background: toneColor(tone),
          marginRight: 14,
        }}
      />
      {children}
    </div>
  );
};

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.7), seconds(2.15)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.15), seconds(2.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(8.4), seconds(9.05)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="5."
        keyword="HEAD"
        suffix="是什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -46])}
        keywordOpacity={1}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep05-hook-title"
      />
      <div style={{opacity: graphIn, transform: `translateY(${(1 - graphIn) * 22}px)`}}>
        <CenterGraph state={SYMBOLIC_REF_GRAPH} top={250} width={1160} headMarkerOffsetX={118} branchOffset={84} />
      </div>
      <SceneCaption opacity={captionIn} width={930} fontSize={35} bottom={126} auditId="ep05-hook-caption">
        HEAD 回答的是：我现在站在哪里？
      </SceneCaption>
    </AbsoluteFill>
  );
};

const SymbolicRefScene: React.FC = () => {
  const frame = useSceneFrame();
  const cardIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const headStateOut = interpolate(frame, [seconds(3.8), seconds(4.35)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refStateIn = interpolate(frame, [seconds(4.45), seconds(5.05)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const traceLift = interpolate(frame, [seconds(6.2), seconds(7.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(7), seconds(8.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(18.2), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardTop = interpolate(traceLift, [0, 1], [376, 116]);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 500, top: cardTop, width: 920, height: 132, opacity: cardIn, transform: `translateY(${(1 - cardIn) * 18}px)`}}>
        <RefInspectorCard
          pathLabel="HEAD FILE"
          path=".git/HEAD"
          pathAccent="HEAD"
          valueLabel="CONTENTS"
          valuePrefix="ref: refs/heads/"
          value="main"
          tone={COLOR.git.main}
          pathColumnWidth={230}
          style={{position: 'absolute', inset: 0, opacity: headStateOut, transform: `translateY(${(headStateOut - 1) * 12}px)`}}
          auditId="ep05-symbolic-head-file"
        />
        <RefInspectorCard
          pathLabel="BRANCH REF"
          path=".git/refs/heads/main"
          pathAccent="main"
          valueLabel="OBJECT ID"
          value="C2"
          tone={COLOR.git.main}
          pathColumnWidth={620}
          valueFontSize={48}
          style={{position: 'absolute', inset: 0, opacity: refStateIn, transform: `translateY(${(1 - refStateIn) * 12}px)`}}
          auditId="ep05-symbolic-branch-ref"
        />
      </div>
      <div style={{opacity: graphIn, transform: `translateY(${(1 - graphIn) * 24}px)`}}>
        <CenterGraph state={SYMBOLIC_REF_GRAPH} top={390} width={1080} headMarkerOffsetX={118} branchOffset={84} />
      </div>
      <SceneCaption opacity={captionIn} width={1020} bottom={120} auditId="ep05-symbolic-caption">
        通常是 HEAD 指向 branch，branch 再指向 commit
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => {
  const recording = TERMINAL_RECORDINGS['ep05-head-flow'];
  return (
    <AbsoluteFill>
      <div data-audit-id="ep05-head-terminal-recording" style={{position: 'absolute', left: 290, top: 176, width: 1340, height: 660}}>
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep05-head-flow.mp4"
          holdFrameSrc="git-course-lab/terminal/ep05-head-flow-hold.png"
          holdFromFrame={recording.holdFromFrame}
          playbackRate={0.55}
          mediaFit="cover"
        />
      </div>
      <SceneCaption opacity={1} width={980} fontSize={32} bottom={104} auditId="ep05-terminal-caption">
        分支名、符号引用、commit ID：同一个位置的三个层级
      </SceneCaption>
    </AbsoluteFill>
  );
};

const SwitchScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(7), seconds(18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileProgress = interpolate(frame, [seconds(20), seconds(29)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git switch feature" branch="main" />
      <CenterGraph
        state={graphState(STATES.switched)}
        top={338}
        width={1110}
        headMotion={{from: 'main', to: 'feature', progress}}
        headMarkerOffsetX={118}
      />
      <TimedSideLabel x={1320} y={382} tone="head" frame={frame} start={7}>
        HEAD 从 main 到 feature
      </TimedSideLabel>
      <div style={{position: 'absolute', left: 560, top: 730, width: 800, opacity: fileProgress}}>
        <RefInspectorCard
          pathLabel="HEAD FILE"
          path=".git/HEAD"
          pathAccent="HEAD"
          valueLabel="CONTENTS"
          valuePrefix="ref: refs/heads/"
          value="feature"
          tone={COLOR.git.feature}
          pathColumnWidth={230}
          auditId="ep05-switch-head-file"
        />
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(34), seconds(35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={118}>
        commit 没变，当前所在分支变了
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CommitCurrentScene: React.FC = () => {
  const frame = useSceneFrame();
  const commitIn = interpolate(frame, [seconds(8), seconds(18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [seconds(19), seconds(31)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const state = commitIn < 0.55 ? STATES.switched : STATES.committed;

  return (
    <AbsoluteFill>
      <CommandPill command={'git commit -m "work"'} branch="feature" />
      <CenterGraph
        state={graphState(state)}
        top={338}
        width={1160}
        branchMotion={state.feature === 'C3' ? {name: 'feature', from: 'C2', to: 'C3', progress: pointer} : undefined}
        headMarkerOffsetX={118}
      />
      <div style={{position: 'absolute', left: 560, top: 730, width: 800}}>
        <RefInspectorCard
          pathLabel="BRANCH REF"
          path=".git/refs/heads/feature"
          pathAccent="feature"
          valueLabel="OBJECT ID"
          value="C3"
          tone={COLOR.git.feature}
          pathColumnWidth={590}
          valueFontSize={46}
          auditId="ep05-commit-feature-ref"
        />
      </div>
      <TimedSideLabel x={1335} y={288} tone="feature" frame={frame} start={19}>
        HEAD 在 feature 上，feature 前进
      </TimedSideLabel>
      <SceneCaption opacity={interpolate(frame, [seconds(35), seconds(36)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={116}>
        HEAD 没有变成 commit；它仍然指向当前分支
      </SceneCaption>
    </AbsoluteFill>
  );
};

const DetachedScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(8), seconds(20)], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fileIn = interpolate(frame, [seconds(21), seconds(31)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const warningIn = interpolate(frame, [seconds(37), seconds(38.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git switch --detach C1" branch="feature" />
      <CenterGraph
        state={DETACHED_GRAPH}
        top={322}
        width={1030}
        detachedHeadMotion={{fromBranch: 'feature', progress}}
        headMarkerOffsetX={118}
      />
      <div style={{position: 'absolute', left: 630, top: 720, width: 660, opacity: fileIn}}>
        <RefInspectorCard
          pathLabel="HEAD FILE"
          path=".git/HEAD"
          pathAccent="HEAD"
          valueLabel="DIRECT OBJECT"
          value="9a4c1e7"
          tone={COLOR.git.head}
          pathColumnWidth={230}
          valueFontSize={38}
          auditId="ep05-detached-head-file"
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 112,
          width: 980,
          transform: `translate(-50%, ${(1 - warningIn) * 18}px)`,
          opacity: warningIn,
          textAlign: 'center',
          ...TYPE.subtitle,
          color: COLOR.text.primary,
        }}
      >
        detached HEAD：适合查看历史，不适合作为长期工作位置
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const state = frame < seconds(8.4) ? STATES.base : frame < seconds(16) ? STATES.switched : STATES.committed;
  const step = frame < seconds(8.4) ? 'HEAD → branch → commit' : frame < seconds(16) ? 'switch：改 HEAD' : 'commit：推进当前 branch';
  const titleIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(0.9), seconds(2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div
        data-audit-id="ep05-takeaway-title"
        style={{position: 'absolute', top: 150, left: 120, right: 120, ...TYPE.hero, fontSize: 76, fontWeight: WEIGHT.bold, textAlign: 'center', whiteSpace: 'nowrap', opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`}}
      >
        HEAD 是当前位置，不是另一个分支
      </div>
      <div
        data-audit-id="ep05-takeaway-main-graph"
        style={{position: 'absolute', left: '50%', top: 304, width: 1420, transform: `translateX(-50%) scale(${interpolate(graphIn, [0, 1], [0.96, 1])})`, transformOrigin: 'center top', opacity: graphIn}}
      >
        <GitGraph state={graphState(state)} width={1420} height={520} auditId="ep05-takeaway-graph" />
      </div>
      <div style={{position: 'absolute', left: '50%', bottom: 126, transform: 'translateX(-50%)', ...TYPE.subtitle, fontSize: 34, color: COLOR.text.primary, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
        <span style={{display: 'inline-block', width: 18, height: 18, marginRight: 16, borderRadius: 999, background: COLOR.git.head}} />
        {step}
      </div>
    </AbsoluteFill>
  );
};

export const Ep05Head: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP05.seriesTitle}
      episodeTitle={EP05.title}
      scenes={EP05_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp05SceneStart('terminal')}
      showEpisodeTitle={(current) => current >= getEp05SceneStart('terminal')}
    >
      <SceneSequence from={getEp05SceneStart('hook')} durationInFrames={getEp05SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('symbolic-ref')} durationInFrames={getEp05SceneDuration('symbolic-ref')}>
        <SymbolicRefScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('terminal')} durationInFrames={getEp05SceneDuration('terminal')}>
        <TerminalScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('switch')} durationInFrames={getEp05SceneDuration('switch')}>
        <SwitchScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('commit-current')} durationInFrames={getEp05SceneDuration('commit-current')}>
        <CommitCurrentScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('detached')} durationInFrames={getEp05SceneDuration('detached')}>
        <DetachedScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('takeaway')} durationInFrames={getEp05SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
