import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP07} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {
  CodeBlock,
  CommandPill,
  COURSE_GRAPH_GEOMETRY,
  createEpisodeRuntime,
  CourseBranchLabel,
  CourseCommitNode,
  CourseLayout,
  EpisodeTitleCard,
  EpisodeTimeline,
  NarrationSubtitle,
  RecordedTerminalPanel,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP07_DURATION_IN_FRAMES, EP07_SCENES} from '../data/episodeTimelines.generated';
import {EP07_DURATION_IN_FRAMES, EP07_SCENES} from '../data/episodeTimelines.generated';

const EP07_RUNTIME = createEpisodeRuntime(EP07_SCENES);

const useSceneFrame = () => useCurrentFrame();
const commitX = (idx: number) => 110 + idx * COURSE_GRAPH_GEOMETRY.commitGap;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const insetLine = (x1: number, y1: number, x2: number, y2: number, inset: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  return {x1: x1 + ux * inset, y1: y1 + uy * inset, x2: x2 - ux * inset, y2: y2 - uy * inset};
};

const CommitNode: React.FC<{
  id: string;
  x: number;
  y: number;
  tone?: 'base' | 'main' | 'feature';
  opacity?: number;
  scale?: number;
}> = ({id, x, y, tone, opacity = 1, scale = 1}) => {
  const stroke = tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : COLOR.git.commit;
  return (
    <g transform={scale === 1 ? undefined : `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <CourseCommitNode
        id={id}
        x={x}
        y={y}
        stroke={stroke}
        strong={Boolean(tone)}
        opacity={opacity}
        ring={tone === 'base' ? {color: COLOR.text.secondary, dashed: true} : undefined}
      />
    </g>
  );
};

const BranchLabel: React.FC<{
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetRadius: number;
  color: string;
  opacity?: number;
}> = (props) => <CourseBranchLabel {...props} />;

type RebaseGraphMode = 'diverged' | 'merged' | 'rebased' | 'fast-forward';

const RebaseGraph: React.FC<{
  mode: RebaseGraphMode;
  width?: number;
  progress?: number;
  small?: boolean;
  showBase?: boolean;
  showOld?: boolean;
  oldOpacity?: number;
  nodeScale?: number;
  replayProgress?: number;
  featureRefProgress?: number;
  showSharedRef?: boolean;
}> = ({
  mode,
  width = 1120,
  progress = 1,
  small = false,
  showBase = false,
  showOld = true,
  oldOpacity = 0.24,
  nodeScale = 1,
  replayProgress = 2,
  featureRefProgress = 1,
  showSharedRef = false,
}) => {
  const trunkY = 176;
  const upperY = 98;
  const lowerY = 254;
  const c0 = commitX(0);
  const c1 = commitX(1);
  const c2 = commitX(2);
  const c3 = commitX(3);
  const c4 = commitX(3);
  const c5 = commitX(4);
  const c4p = commitX(4);
  const c5p = commitX(5);
  const m1 = commitX(5);
  const isRebased = mode === 'rebased' || mode === 'fast-forward';
  const primeOneOpacity = isRebased ? clamp(replayProgress) : 0;
  const primeTwoOpacity = isRebased ? clamp(replayProgress - 1) : 0;
  const ffMainX = interpolate(progress, [0, 1], [c3, c5p], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainTargetX = mode === 'merged' ? m1 : mode === 'fast-forward' ? ffMainX : c3;
  const mainTargetY = mode === 'merged' ? trunkY : upperY;
  const featureTargetX = isRebased ? interpolate(featureRefProgress, [0, 1], [c5, c5p]) : c5;
  const featureTargetY = isRebased ? interpolate(featureRefProgress, [0, 1], [lowerY, upperY]) : lowerY;
  const viewBox = small ? {x: 60, y: -8, width: 840, height: 380} : {x: 40, y: -8, width: 920, height: 380};
  const height = Math.round((width * viewBox.height) / viewBox.width);
  const edgeStroke = COURSE_GRAPH_GEOMETRY.edgeStroke;
  const nodeOuterRadius = (COURSE_GRAPH_GEOMETRY.nodeRadius + COURSE_GRAPH_GEOMETRY.nodeStrongStroke / 2) * nodeScale;
  const edgeInset = nodeOuterRadius + edgeStroke / 2;
  const defaultNodeOuterRadius = COURSE_GRAPH_GEOMETRY.nodeRadius + COURSE_GRAPH_GEOMETRY.nodeStrongStroke / 2;
  const refOffset = 72 + Math.max(0, nodeOuterRadius - defaultNodeOuterRadius);
  const mainLabelY = mode === 'fast-forward' ? mainTargetY + refOffset : mainTargetY - refOffset;
  const featureLabelY = featureTargetY <= trunkY ? featureTargetY - refOffset : featureTargetY + refOffset;
  const edge = (x1: number, y1: number, x2: number, y2: number) => insetLine(x1, y1, x2, y2, edgeInset);

  const trunkLeft = edge(c0, trunkY, c1, trunkY);
  const trunkRight = edge(c1, trunkY, c2, trunkY);
  const upperBranch = edge(c2, trunkY, c3, upperY);
  const lowerBranch = edge(c2, trunkY, c4, lowerY);
  const lowerSecond = edge(c4, lowerY, c5, lowerY);
  const primeFirst = edge(c3, upperY, c4p, upperY);
  const primeSecond = edge(c4p, upperY, c5p, upperY);
  const mergeUpper = edge(c3, upperY, m1, trunkY);
  const mergeLower = edge(c5, lowerY, m1, trunkY);

  return (
    <svg width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} style={{display: 'block', overflow: 'visible'}}>
      <line {...trunkLeft} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
      <line {...trunkRight} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
      <line {...upperBranch} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />

      {mode === 'merged' || mode === 'diverged' ? (
        <>
          <line {...lowerBranch} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
          <line {...lowerSecond} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
        </>
      ) : showOld ? (
        <>
          <line {...lowerBranch} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={oldOpacity} />
          <line {...lowerSecond} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={oldOpacity} />
        </>
      ) : null}

      {mode === 'merged' ? (
        <>
          <line {...mergeUpper} stroke={COLOR.git.main} strokeWidth={edgeStroke} strokeLinecap="round" />
          <line {...mergeLower} stroke={COLOR.git.feature} strokeWidth={edgeStroke} strokeLinecap="round" />
        </>
      ) : isRebased ? (
        <>
          <line {...primeFirst} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={primeOneOpacity} />
          <line {...primeSecond} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={primeTwoOpacity} />
        </>
      ) : null}

      <BranchLabel
        name="main"
        x={mainTargetX}
        y={mainLabelY}
        targetX={mainTargetX}
        targetY={mainTargetY}
        targetRadius={nodeOuterRadius}
        color={COLOR.git.main}
      />
      <BranchLabel
        name="feature"
        x={featureTargetX}
        y={featureLabelY}
        targetX={featureTargetX}
        targetY={featureTargetY}
        targetRadius={nodeOuterRadius}
        color={COLOR.git.feature}
      />
      {showSharedRef && isRebased ? (
        <BranchLabel
          name="old ref"
          x={c5}
          y={lowerY + refOffset}
          targetX={c5}
          targetY={lowerY}
          targetRadius={nodeOuterRadius}
          color={COLOR.text.secondary}
        />
      ) : null}

      <CommitNode id="C0" x={c0} y={trunkY} scale={nodeScale} />
      <CommitNode id="C1" x={c1} y={trunkY} scale={nodeScale} />
      <CommitNode id="C2" x={c2} y={trunkY} tone={showBase ? 'base' : undefined} scale={nodeScale} />
      <CommitNode id="C3" x={c3} y={upperY} tone="main" scale={nodeScale} />
      {mode === 'merged' || mode === 'diverged' ? (
        <>
          <CommitNode id="C4" x={c4} y={lowerY} tone="feature" scale={nodeScale} />
          <CommitNode id="C5" x={c5} y={lowerY} tone="feature" scale={nodeScale} />
        </>
      ) : (
        <>
          {showOld ? (
            <>
              <CommitNode id="C4" x={c4} y={lowerY} tone="feature" opacity={oldOpacity} scale={nodeScale} />
              <CommitNode id="C5" x={c5} y={lowerY} tone="feature" opacity={oldOpacity} scale={nodeScale} />
            </>
          ) : null}
          <CommitNode id="C4′" x={c4p} y={upperY} tone="feature" opacity={primeOneOpacity} scale={nodeScale} />
          <CommitNode id="C5′" x={c5p} y={upperY} tone="feature" opacity={primeTwoOpacity} scale={nodeScale} />
        </>
      )}
      {mode === 'merged' ? <CommitNode id="M1" x={m1} y={trunkY} scale={nodeScale} /> : null}

      {showBase ? (
        <text x={c2} y={trunkY + 80} textAnchor="middle" fontFamily={FONT.sans} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
          base
        </text>
      ) : null}
    </svg>
  );
};

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.65), seconds(2.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.2), seconds(3.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ruleIn = interpolate(frame, [seconds(6.3), seconds(7.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="7."
        keyword="Rebase"
        suffix="做了什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -42])}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep07-hook-title"
      />
      <div style={{position: 'absolute', left: '50%', top: 220, width: 1320, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <RebaseGraph mode="diverged" width={1320} showBase />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 752, transform: `translateX(-50%) translateY(${(1 - ruleIn) * 12}px)`, opacity: ruleIn, ...TYPE.hero, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
        rebase = replay
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep07-hook-caption" />
    </AbsoluteFill>
  );
};

const CompareMergeScene: React.FC = () => {
  const frame = useSceneFrame();
  const leftIn = interpolate(frame, [0, seconds(0.9)], [0, 1], {extrapolateRight: 'clamp'});
  const rightIn = interpolate(frame, [seconds(8), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '126px 112px 118px', boxSizing: 'border-box'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 58, height: '100%', alignItems: 'center'}}>
        <div style={{opacity: leftIn}}>
          <div style={{...TYPE.title, color: COLOR.git.main, marginBottom: 18}}>merge：保留分叉</div>
          <RebaseGraph mode="merged" width={760} small nodeScale={1.42} />
        </div>
        <div style={{opacity: rightIn}}>
          <div style={{...TYPE.title, color: COLOR.git.feature, marginBottom: 18}}>rebase：创建新身份</div>
          <RebaseGraph mode="rebased" width={800} small showOld nodeScale={1.42} />
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('compare-merge')} width={1320} bottom={64} auditId="ep07-compare-caption" />
    </AbsoluteFill>
  );
};

const TerminalRebaseScene: React.FC = () => {
  const frame = useSceneFrame();
  const recording = TERMINAL_RECORDINGS['ep07-rebase-flow'];

  return (
    <AbsoluteFill style={{padding: '112px 142px 110px', boxSizing: 'border-box'}}>
      <div
        data-audit-id="ep07-rebase-terminal-recording"
        style={{position: 'absolute', left: 250, top: 156, width: 1420, height: 768}}
      >
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep07-rebase-flow.mp4"
          holdFrameSrc="git-course-lab/terminal/ep07-rebase-flow-hold.png"
          holdFromFrame={recording.holdFromFrame}
          playbackRate={1}
          mediaFit="cover"
        />
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('terminal-rebase')} width={1320} bottom={64} auditId="ep07-terminal-rebase-caption" />
    </AbsoluteFill>
  );
};

const ReplayModelScene: React.FC = () => {
  const frame = useSceneFrame();
  const baseVisible = frame >= seconds(2.7);
  const extractIn = interpolate(frame, [seconds(7.4), seconds(8.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const patchOut = interpolate(frame, [seconds(30.2), seconds(31)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ontoMain = frame >= seconds(14.9);
  const replayProgress = interpolate(frame, [seconds(19.5), seconds(22.5), seconds(23), seconds(25.8)], [0, 1, 1, 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const oldOpacity = interpolate(frame, [seconds(14.9), seconds(16)], [1, 0.24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const controlsIn = interpolate(frame, [seconds(30.5), seconds(31.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const controlsOut = interpolate(frame, [seconds(41.5), seconds(42.1)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const featureRefProgress = interpolate(frame, [seconds(42.1), seconds(43.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill data-audit-id="ep07-replay-remotion" style={{padding: '78px 132px 126px', boxSizing: 'border-box'}}>
      <CommandPill command="git rebase main" branch="feature" top={62} fontSize={30} />
      <div style={{position: 'absolute', left: '50%', top: 158, width: 1240, transform: 'translateX(-50%)'}}>
        <RebaseGraph
          mode={ontoMain ? 'rebased' : 'diverged'}
          width={1240}
          showBase={baseVisible}
          showOld
          oldOpacity={oldOpacity}
          replayProgress={replayProgress}
          featureRefProgress={featureRefProgress}
        />
      </div>

      <div style={{position: 'absolute', left: 232, top: 680, width: 470, opacity: extractIn * patchOut, transform: `translateY(${(1 - extractIn) * 18}px)`}}>
        <CodeBlock title="patch 1 · 来自 C4" lines={['change  + search filter', 'replay  C4 → C4′']} highlight={replayProgress > 0 ? [1] : [0]} highlightBorderColor={COLOR.git.feature} />
      </div>
      <div style={{position: 'absolute', right: 232, top: 680, width: 470, opacity: extractIn * patchOut, transform: `translateY(${(1 - extractIn) * 18}px)`}}>
        <CodeBlock title="patch 2 · 来自 C5" lines={['change  + empty state', 'replay  C5 → C5′']} highlight={replayProgress > 1 ? [1] : [0]} highlightBorderColor={COLOR.git.feature} />
      </div>

      <div style={{position: 'absolute', left: '50%', top: 670, width: 820, transform: `translateX(-50%) translateY(${(1 - controlsIn) * 16}px)`, opacity: controlsIn * controlsOut}}>
        <CodeBlock
          title="冲突时暂停在当前 patch"
          lines={['git add <file>  →  git rebase --continue', 'git rebase --skip', 'git rebase --abort']}
          highlight={[0]}
          highlightBorderColor={COLOR.git.conflict}
        />
      </div>

      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('replay-model')} width={1320} bottom={64} auditId="ep07-replay-caption" />
    </AbsoluteFill>
  );
};

const NewIdentityScene: React.FC = () => {
  const frame = useSceneFrame();
  const oldIn = interpolate(frame, [0, seconds(1)], [0, 1], {extrapolateRight: 'clamp'});
  const replayIn = interpolate(frame, [seconds(4.7), seconds(5.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const newIn = interpolate(frame, [seconds(4.9), seconds(5.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardsOut = interpolate(frame, [seconds(20.3), seconds(21.3)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(21.15), seconds(22.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill data-audit-id="ep07-identity-remotion" style={{padding: '84px 132px 118px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 150, top: 88, ...TYPE.title, color: COLOR.text.primary}}>同一份修改，新的 commit 身份</div>

      <div style={{position: 'absolute', left: 166, top: 286, width: 590, opacity: oldIn * cardsOut, transform: `translateX(${(1 - oldIn) * -18}px)`}}>
        <CodeBlock title="原提交 · C4" lines={['change  + search filter', 'tree    T4', 'parent  C2', 'id      7ab12']} highlight={[1, 2, 3]} highlightBorderColor={COLOR.git.feature} />
      </div>
      <div style={{position: 'absolute', right: 166, top: 286, width: 590, opacity: newIn * cardsOut, transform: `translateX(${(1 - newIn) * 18}px)`}}>
        <CodeBlock title="重放后 · C4′" lines={['change  + search filter', 'tree    T4′', 'parent  C3', 'id      b31ef']} highlight={[1, 2, 3]} highlightBorderColor={COLOR.git.main} />
      </div>

      <div style={{position: 'absolute', left: '50%', top: 384, transform: `translateX(-50%) scale(${0.94 + replayIn * 0.06})`, opacity: replayIn * cardsOut, textAlign: 'center'}}>
        <div style={{...TYPE.hero, color: COLOR.git.feature}}>→</div>
        <div style={{...TYPE.ui, color: COLOR.text.secondary, marginTop: 6}}>replay</div>
      </div>

      <div style={{position: 'absolute', left: '50%', top: 260, width: 1040, transform: `translateX(-50%) translateY(${(1 - graphIn) * 16}px)`, opacity: graphIn}}>
        <RebaseGraph mode="rebased" width={1040} small showOld nodeScale={1.32} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('new-identity')} width={1320} bottom={64} auditId="ep07-identity-caption" />
    </AbsoluteFill>
  );
};

const FastForwardAfterScene: React.FC = () => {
  const frame = useSceneFrame();
  const motion = interpolate(frame, [seconds(10.6), seconds(15.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge feature" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 238, width: 1280, transform: 'translateX(-50%)'}}>
        <RebaseGraph mode="fast-forward" width={1280} progress={motion} showOld={false} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('fast-forward-after')} width={1320} bottom={64} auditId="ep07-ff-caption" />
    </AbsoluteFill>
  );
};

const PublicRiskScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.9)], [0, 1], {extrapolateRight: 'clamp'});
  const cardsIn = interpolate(frame, [seconds(9.8), seconds(10.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '126px 140px 112px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 92, top: 220, width: 960, opacity: graphIn}}>
        <RebaseGraph mode="rebased" width={960} showOld showSharedRef nodeScale={1.28} />
      </div>
      <div style={{position: 'absolute', right: 142, top: 244, width: 540, opacity: cardsIn}}>
        <CodeBlock title="同一份工作，两组身份" lines={['old ref  → C5', 'feature  → C5′', 'parent relation: none']} highlight={[0, 1]} highlightBorderColor={COLOR.git.head} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('public-risk')} width={1320} bottom={64} auditId="ep07-risk-caption" />
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const a = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const b = interpolate(frame, [seconds(2.2), seconds(3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = interpolate(frame, [seconds(12), seconds(12.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rows = [
    {text: '找到 base，筛出独有修改', opacity: a, color: COLOR.text.secondary},
    {text: '按顺序 replay，创建新身份', opacity: b, color: COLOR.git.feature},
    {text: '共享历史优先保持身份稳定', opacity: c, color: COLOR.git.main},
  ];

  return (
    <AbsoluteFill style={{padding: '136px 164px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 34}}>rebase 的三条规则</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 54, alignItems: 'center'}}>
        <div style={{transform: 'translateY(64px)'}}>
          <RebaseGraph mode="rebased" width={820} small showOld={false} nodeScale={1.42} />
        </div>
        <div style={{display: 'grid', gap: 26, transform: 'translateX(56px)'}}>
          {rows.map((row) => (
            <div key={row.text} style={{opacity: row.opacity, display: 'flex', alignItems: 'center', gap: 18, ...TYPE.title, color: COLOR.text.primary}}>
              <span style={{width: 16, height: 16, borderRadius: 999, background: row.color, display: 'inline-block', flex: '0 0 auto'}} />
              {row.text}
            </div>
          ))}
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={EP07_RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep07-takeaway-caption" />
    </AbsoluteFill>
  );
};

const EP07_SCENE_COMPONENTS = {
  hook: HookScene,
  'compare-merge': CompareMergeScene,
  'terminal-rebase': TerminalRebaseScene,
  'replay-model': ReplayModelScene,
  'new-identity': NewIdentityScene,
  'fast-forward-after': FastForwardAfterScene,
  'public-risk': PublicRiskScene,
  takeaway: TakeawayScene,
};

export const Ep07Rebase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP07.seriesTitle}
      episodeTitle={EP07.title}
      scenes={EP07_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP07_RUNTIME.start('compare-merge')}
      showEpisodeTitle={(current) => current >= EP07_RUNTIME.start('compare-merge')}
    >
      <EpisodeTimeline runtime={EP07_RUNTIME} components={EP07_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
