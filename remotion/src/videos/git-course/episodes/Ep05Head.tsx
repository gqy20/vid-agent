import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {EP05} from '../data/episodes';
import {seconds} from '../timeline';
import {
  CenterGraph,
  CommandPill,
  CourseLayout,
  createEpisodeRuntime,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitGraph,
  GitStateFlow,
  NarrationSubtitle,
  RefInspectorCard,
  RecordedTerminalStage,
  type GitGraphState,
} from '../kit';
import {COLOR, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';
import {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';

const EP05_RUNTIME = createEpisodeRuntime(EP05_SCENES);

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
  const titleOut = interpolate(frame, [seconds(4.1), seconds(4.75)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(4.45), seconds(5.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('hook')} auditId="ep05-hook-caption" />
    </AbsoluteFill>
  );
};

const SymbolicRefScene: React.FC = () => {
  const frame = useSceneFrame();
  const cardIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const headStateOut = interpolate(frame, [seconds(19), seconds(19.35)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refStateIn = interpolate(frame, [seconds(19.45), seconds(19.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const traceLift = interpolate(frame, [seconds(21.5), seconds(23.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(23), seconds(25.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('symbolic-ref')} auditId="ep05-symbolic-caption" />
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => {
  const frame = useSceneFrame();
  return (
    <AbsoluteFill>
      <RecordedTerminalStage
        auditId="ep05-head-terminal-recording"
        rect={{x: 290, y: 176, width: 1340, height: 660}}
        src="git-course-lab/terminal/ep05-head-flow.mp4"
        holdFrameSrc="git-course-lab/terminal/ep05-head-flow-hold.png"
        holdFromFrame={170}
        playbackRate={0.55}
        mediaFit="cover"
      />
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('terminal')} width={1180} auditId="ep05-terminal-caption" />
    </AbsoluteFill>
  );
};

const SwitchScene: React.FC = () => {
  const frame = useSceneFrame();
  const state = frame < seconds(13.15) ? STATES.base : STATES.switched;
  const mainRefOut = interpolate(frame, [seconds(12.7), seconds(13.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const featureRefIn = interpolate(frame, [seconds(13.15), seconds(13.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileOut = interpolate(frame, [seconds(21.2), seconds(22)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const workspaceIn = interpolate(frame, [seconds(21.6), seconds(22.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const workspaceOut = interpolate(frame, [seconds(24.8), seconds(25.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git switch feature" branch="main" />
      <CenterGraph
        state={graphState(state)}
        top={338}
        width={1110}
        headMarkerOffsetX={118}
      />
      <div style={{position: 'absolute', left: 560, top: 730, width: 800, opacity: mainRefOut * fileOut}}>
        <RefInspectorCard
          pathLabel="HEAD FILE"
          path=".git/HEAD"
          pathAccent="HEAD"
          valueLabel="CONTENTS"
          valuePrefix="ref: refs/heads/"
          value="main"
          tone={COLOR.git.main}
          pathColumnWidth={230}
          auditId="ep05-switch-head-file-before"
        />
      </div>
      <div style={{position: 'absolute', left: 560, top: 730, width: 800, opacity: featureRefIn * fileOut}}>
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
      <div style={{position: 'absolute', left: 610, top: 718, width: 700, opacity: workspaceIn * workspaceOut}}>
        <GitStateFlow
          compact
          areas={[
            {id: 'working-tree', title: 'Working Tree', files: ['匹配 feature @ C2'], active: true},
            {id: 'index', title: 'Index', files: ['匹配 feature @ C2'], active: true},
          ]}
        />
      </div>
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('switch')} auditId="ep05-switch-caption" />
    </AbsoluteFill>
  );
};

const CommitCurrentScene: React.FC = () => {
  const frame = useSceneFrame();
  const commitIn = interpolate(frame, [seconds(7.2), seconds(10.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [seconds(12.6), seconds(17)], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const initialRefOut = interpolate(frame, [seconds(15.5), seconds(17.1)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const resultRefIn = interpolate(frame, [seconds(15.8), seconds(17.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command={'git commit -m "work"'} branch="feature" />
      <CenterGraph
        state={graphState(STATES.committed)}
        top={338}
        width={1160}
        commitRevealProgress={commitIn}
        branchMotion={{name: 'feature', from: 'C2', to: 'C3', progress: pointer}}
        headMarkerOffsetX={118}
      />
      <div style={{position: 'absolute', left: 560, top: 730, width: 800, opacity: initialRefOut}}>
        <RefInspectorCard
          pathLabel="BRANCH REF"
          path=".git/refs/heads/feature"
          pathAccent="feature"
          valueLabel="OBJECT ID"
          value="C2"
          tone={COLOR.git.feature}
          pathColumnWidth={590}
          valueFontSize={46}
          auditId="ep05-commit-feature-ref-before"
        />
      </div>
      <div style={{position: 'absolute', left: 560, top: 730, width: 800, opacity: resultRefIn}}>
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
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('commit-current')} auditId="ep05-commit-caption" />
    </AbsoluteFill>
  );
};

const DetachedScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(6), seconds(12.5)], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fileIn = interpolate(frame, [seconds(12.2), seconds(14.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileOut = interpolate(frame, [seconds(15.8), seconds(16.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const purposeIn = interpolate(frame, [seconds(16.4), seconds(17.1)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const returnIn = interpolate(frame, [seconds(20.4), seconds(21.2)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const branchIn = interpolate(frame, [seconds(22.4), seconds(23.2)], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
      <div style={{position: 'absolute', left: 630, top: 720, width: 660, opacity: fileIn * fileOut}}>
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
        data-audit-id="ep05-detached-use-panel"
        style={{
          position: 'absolute',
          left: 380,
          top: 682,
          width: 1160,
          height: 204,
          boxSizing: 'border-box',
          padding: '24px 30px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.72)',
          border: `1px solid ${COLOR.stroke.soft}`,
          boxShadow: `0 10px 30px ${COLOR.effects.shadowSoft}`,
          opacity: purposeIn,
          transform: `translateY(${interpolate(purposeIn, [0, 1], [12, 0])}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{...TYPE.ui, color: COLOR.text.tertiary, letterSpacing: '0.08em'}}>适合临时</div>
          {['查看旧版本', '运行测试', '验证想法'].map((label) => (
            <div
              key={label}
              style={{
                padding: '9px 18px',
                borderRadius: 999,
                border: `1px solid ${COLOR.stroke.default}`,
                color: COLOR.text.primary,
                ...TYPE.ui,
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.18fr',
            gap: 28,
            marginTop: 22,
            paddingTop: 20,
            borderTop: `1px solid ${COLOR.stroke.soft}`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity: returnIn, transform: `translateY(${interpolate(returnIn, [0, 1], [8, 0])}px)`}}>
            <span style={{...TYPE.ui, color: COLOR.text.secondary}}>只查看</span>
            <span style={{...TYPE.body, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>完成后切回原 branch</span>
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 16, opacity: branchIn, transform: `translateY(${interpolate(branchIn, [0, 1], [8, 0])}px)`}}>
            <span style={{...TYPE.ui, color: COLOR.text.secondary}}>继续修改</span>
            <span style={{...TYPE.code, color: COLOR.git.feature, fontWeight: WEIGHT.bold}}>git switch -c fix-from-C1</span>
          </div>
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('detached')} auditId="ep05-detached-caption" />
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const detachedProgress = interpolate(frame, [seconds(8.35), seconds(11.55)], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phase = frame < seconds(8.35) ? 'normal' : 'detached';
  const state = phase === 'normal' ? graphState(STATES.committed) : DETACHED_GRAPH;
  const titleIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(0.9), seconds(2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div
        data-audit-id="ep05-takeaway-title"
        style={{position: 'absolute', top: 150, left: 120, right: 120, ...TYPE.hero, fontSize: 76, fontWeight: WEIGHT.bold, textAlign: 'center', whiteSpace: 'nowrap', opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`}}
      >
        HEAD 是当前入口，不是另一个分支
      </div>
      <div
        data-audit-id="ep05-takeaway-main-graph"
        style={{position: 'absolute', left: '50%', top: 304, width: 1420, transform: `translateX(-50%) scale(${interpolate(graphIn, [0, 1], [0.96, 1])})`, transformOrigin: 'center top', opacity: graphIn}}
      >
        <GitGraph
          state={state}
          width={1420}
          height={520}
          detachedHeadMotion={phase === 'detached' ? {fromBranch: 'feature', progress: detachedProgress} : undefined}
          auditId="ep05-takeaway-graph"
        />
      </div>
      <NarrationSubtitle frame={frame} cues={EP05_RUNTIME.captions('takeaway')} auditId="ep05-takeaway-caption" />
    </AbsoluteFill>
  );
};

const EP05_SCENE_COMPONENTS = {
  hook: HookScene,
  'symbolic-ref': SymbolicRefScene,
  terminal: TerminalScene,
  switch: SwitchScene,
  'commit-current': CommitCurrentScene,
  detached: DetachedScene,
  takeaway: TakeawayScene,
};

export const Ep05Head: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP05.seriesTitle}
      episodeTitle={EP05.title}
      scenes={EP05_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP05_RUNTIME.start('terminal')}
      showEpisodeTitle={(current) => current >= EP05_RUNTIME.start('terminal')}
    >
      <EpisodeTimeline runtime={EP05_RUNTIME} components={EP05_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
