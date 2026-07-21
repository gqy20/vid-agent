import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP06} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {
  CodeBlock,
  CodeDiff,
  CommandPill,
  COURSE_GRAPH_GEOMETRY,
  createEpisodeRuntime,
  CourseLayout,
  CourseBranchLabel,
  CourseCommitNode,
  CourseHeadMarker,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitStatePanel,
  NarrationSubtitle,
  RecordedTerminalPanel,
  SnapshotCard,
  type DiffLine,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP06_DURATION_IN_FRAMES, EP06_SCENES} from '../data/episodeTimelines.generated';
import {EP06_DURATION_IN_FRAMES, EP06_SCENES} from '../data/episodeTimelines.generated';

const EP06_RUNTIME = createEpisodeRuntime(EP06_SCENES);

const useSceneFrame = () => useCurrentFrame();

const commitX = (idx: number) => 110 + idx * COURSE_GRAPH_GEOMETRY.commitGap;

const insetLine = (x1: number, y1: number, x2: number, y2: number, inset: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const ux = dx / length;
  const uy = dy / length;
  return {x1: x1 + ux * inset, y1: y1 + uy * inset, x2: x2 - ux * inset, y2: y2 - uy * inset};
};

const CommitNode: React.FC<{id: string; x: number; y: number; tone?: 'base' | 'main' | 'feature'; opacity?: number; scale?: number}> = ({
  id,
  x,
  y,
  tone,
  opacity = 1,
  scale = 1,
}) => {
  const isBase = tone === 'base';
  const stroke =
    tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : COLOR.git.commit;
  return (
    <g transform={scale === 1 ? undefined : `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <CourseCommitNode id={id} x={x} y={y} stroke={stroke} strong={Boolean(tone)} opacity={opacity} ring={isBase ? {color: COLOR.text.secondary, dashed: true} : undefined} />
    </g>
  );
};

const BranchLabel: React.FC<{
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetRadius?: number;
  color: string;
  opacity?: number;
  compact?: boolean;
}> = ({name, x, y, targetX, targetY, targetRadius, color, opacity = 1}) => <CourseBranchLabel name={name} x={x} y={y} targetX={targetX} targetY={targetY} targetRadius={targetRadius} color={color} opacity={opacity} />;

const HeadLabel: React.FC<{x: number; y: number; opacity?: number}> = (props) => <CourseHeadMarker {...props} />;

const MergeGraph: React.FC<{
  mode: 'ff-before' | 'ff-after' | 'diverged' | 'merged';
  width?: number;
  progress?: number;
  showBaseLabels?: boolean;
  showParentArrows?: boolean;
  showHead?: boolean;
  small?: boolean;
  nodeScale?: number;
  mergedRefProgress?: number;
}> = ({mode, width = 1120, progress = 1, showBaseLabels = false, showParentArrows = false, showHead = true, small = false, nodeScale = 1, mergedRefProgress = 1}) => {
  const y = 176;
  const c0 = commitX(0);
  const c1 = commitX(1);
  const c2 = commitX(2);
  const c3 = commitX(3);
  const c4 = commitX(3);
  const m1 = commitX(4);
  const ffMainX = interpolate(progress, [0, 1], [c2, c3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const showC4 = mode === 'diverged' || mode === 'merged';
  const showM1 = mode === 'merged';
  const mergedMainX = interpolate(mergedRefProgress, [0, 1], [c3, m1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mergedMainY = interpolate(mergedRefProgress, [0, 1], [98, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainTargetX = mode === 'ff-before' ? c2 : mode === 'ff-after' ? ffMainX : showM1 ? mergedMainX : c3;
  const mainTargetY = mode === 'diverged' ? 98 : mode === 'merged' ? mergedMainY : y;
  const featureTargetX = showC4 ? c4 : c3;
  const featureTargetY = showC4 ? 254 : y;
  const headX = mainTargetX + 124;
  const headY = mode === 'diverged' || mode === 'merged' ? mainTargetY - 72 : 247;
  const viewBox = small
    ? {x: 60, y: 0, width: 840, height: 380}
    : mode === 'ff-before' || mode === 'ff-after'
      ? {x: 40, y: 15, width: 820, height: 320}
      : mode === 'diverged'
        ? {x: 40, y: 0, width: showHead ? 880 : 700, height: 350}
        : {x: 40, y: 0, width: 880, height: 350};
  const height = Math.round((width * viewBox.height) / viewBox.width);
  const edgeStroke = COURSE_GRAPH_GEOMETRY.edgeStroke;
  const nodeOuterRadius = (COURSE_GRAPH_GEOMETRY.nodeRadius + COURSE_GRAPH_GEOMETRY.nodeStrongStroke / 2) * nodeScale;
  const edgeInset = nodeOuterRadius + edgeStroke / 2;
  const defaultNodeOuterRadius = COURSE_GRAPH_GEOMETRY.nodeRadius + COURSE_GRAPH_GEOMETRY.nodeStrongStroke / 2;
  const refOffset = 72 + Math.max(0, nodeOuterRadius - defaultNodeOuterRadius);
  const trunkEdge = insetLine(c0, y, c2, y, edgeInset);
  const forwardEdge = insetLine(c2, y, c3, y, edgeInset);
  const upperBranchEdge = insetLine(c2, y, c3, 98, edgeInset);
  const lowerBranchEdge = insetLine(c2, y, c4, 254, edgeInset);
  const upperParentEdge = insetLine(c3, 98, m1, y, edgeInset);
  const lowerParentEdge = insetLine(c4, 254, m1, y, edgeInset);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{display: 'block', overflow: 'visible'}}
    >
      <line {...trunkEdge} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
      {mode === 'ff-before' || mode === 'ff-after' ? (
        <line {...forwardEdge} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={mode === 'ff-before' ? 0.9 : progress} />
      ) : (
        <>
          <line {...upperBranchEdge} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
          <line {...lowerBranchEdge} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
        </>
      )}
      {showM1 ? (
        <>
          <line {...upperParentEdge} stroke={showParentArrows ? COLOR.git.main : COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
          <line {...lowerParentEdge} stroke={showParentArrows ? COLOR.git.feature : COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
        </>
      ) : null}
      {mode === 'ff-before' || mode === 'ff-after' ? (
        <>
          <BranchLabel name="hotfix" x={c3} y={y - refOffset} targetX={c3} targetY={y} targetRadius={nodeOuterRadius} color={COLOR.git.feature} compact={small} />
          <BranchLabel name="main" x={mainTargetX} y={y + refOffset} targetX={mainTargetX} targetY={y} targetRadius={nodeOuterRadius} color={COLOR.git.main} compact={small} />
        </>
      ) : (
        <>
          <BranchLabel name="main" x={mainTargetX} y={mainTargetY - refOffset} targetX={mainTargetX} targetY={mainTargetY} targetRadius={nodeOuterRadius} color={COLOR.git.main} compact={small} />
          <BranchLabel name="feature" x={featureTargetX} y={featureTargetY + refOffset} targetX={featureTargetX} targetY={featureTargetY} targetRadius={nodeOuterRadius} color={COLOR.git.feature} compact={small} />
        </>
      )}
      <CommitNode id="C0" x={c0} y={y} scale={nodeScale} />
      <CommitNode id="C1" x={c1} y={y} scale={nodeScale} />
      <CommitNode id="C2" x={c2} y={y} tone={showBaseLabels ? 'base' : undefined} scale={nodeScale} />
      {mode === 'ff-before' || mode === 'ff-after' ? <CommitNode id="C3" x={c3} y={y} tone="feature" scale={nodeScale} /> : <CommitNode id="C3" x={c3} y={98} tone="main" scale={nodeScale} />}
      {showC4 ? <CommitNode id="C4" x={c4} y={254} tone="feature" scale={nodeScale} /> : null}
      {showM1 ? <CommitNode id="M1" x={m1} y={y} scale={nodeScale} /> : null}
      {showHead ? <HeadLabel x={headX} y={headY} opacity={small ? 0 : 1} /> : null}
      {showBaseLabels ? (
        <>
          <text x={c2} y={y + 76} textAnchor="middle" fontFamily={FONT.sans} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            base
          </text>
          <text x={c3 + 84} y="109" fontFamily={FONT.sans} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.git.main}>
            ours
          </text>
          <text x={c4 + 84} y="263" fontFamily={FONT.sans} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.git.feature}>
            theirs
          </text>
        </>
      ) : null}
    </svg>
  );
};

const SideNote: React.FC<{children: React.ReactNode; x: number; y: number; color?: string; opacity: number}> = ({
  children,
  x,
  y,
  color = COLOR.git.head,
  opacity,
}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 650, opacity, ...TYPE.subtitle, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>
    <span style={{display: 'inline-block', width: 14, height: 14, borderRadius: 999, background: color, marginRight: 14}} />
    {children}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.7), seconds(2.15)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ffIn = interpolate(frame, [seconds(2.25), seconds(3.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const divergedIn = interpolate(frame, [seconds(5.8), seconds(6.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="6."
        keyword="Merge"
        suffix="做了什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -46])}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep06-hook-title"
      />
      <div style={{position: 'absolute', left: 116, top: 252, opacity: ffIn, transform: `translateY(${(1 - ffIn) * 20}px)`}}>
        <div style={{...TYPE.title, marginBottom: 20}}>没有分歧</div>
        <MergeGraph mode="ff-after" width={820} small />
      </div>
      <div style={{position: 'absolute', right: 76, top: 252, opacity: divergedIn, transform: `translateY(${(1 - divergedIn) * 20}px)`}}>
        <div style={{...TYPE.title, marginBottom: 20}}>已经分叉</div>
        <MergeGraph mode="diverged" width={900} small />
      </div>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep06-hook-caption" />
    </AbsoluteFill>
  );
};

const FastForwardScene: React.FC = () => {
  const frame = useSceneFrame();
  const motion = interpolate(frame, [seconds(14.4), seconds(19.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const noteIn = interpolate(frame, [seconds(24.4), seconds(25.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge hotfix" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 260, width: 1400, transform: 'translateX(-50%)'}}>
        <MergeGraph mode={motion > 0 ? 'ff-after' : 'ff-before'} width={1400} progress={motion} />
      </div>
      <SideNote x={1020} y={738} color={COLOR.git.main} opacity={noteIn}>
        作用：接入 hotfix，不额外制造汇合节点
      </SideNote>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('fast-forward')} width={1320} bottom={64} auditId="ep06-ff-caption" />
    </AbsoluteFill>
  );
};

const DivergedScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const commandIn = interpolate(frame, [seconds(8.2), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const labelsIn = interpolate(frame, [seconds(15), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div style={{opacity: commandIn}}>
        <CommandPill command="git merge feature" branch="main" />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 238, width: 1320, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <MergeGraph mode="diverged" width={1320} showBaseLabels={labelsIn > 0} showHead={false} />
      </div>
      <SideNote x={238} y={748} color={COLOR.git.commit} opacity={labelsIn}>
        作用：merge base 分开共同内容与双方变化
      </SideNote>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('diverged')} width={1320} bottom={64} auditId="ep06-diverged-caption" />
    </AbsoluteFill>
  );
};

const ThreeWayScene: React.FC = () => {
  const frame = useSceneFrame();
  const baseIn = interpolate(frame, [0, seconds(1)], [0, 1], {extrapolateRight: 'clamp'});
  const branchesIn = interpolate(frame, [seconds(4.4), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const resultIn = interpolate(frame, [seconds(20.2), seconds(25.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill data-audit-id="ep06-three-way-remotion" style={{padding: '72px 132px 118px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 132, top: 76, ...TYPE.title, color: COLOR.text.primary}}>三方合并：比较三份快照</div>
      <div style={{position: 'absolute', left: 132, top: 142, ...TYPE.ui, color: COLOR.text.secondary}}>
        base 提供共同起点；ours 与 theirs 只贡献各自后来的变化
      </div>

      <div style={{position: 'absolute', left: '50%', top: 170, width: 840, transform: 'translateX(-50%)'}}>
        <MergeGraph mode="diverged" width={840} showBaseLabels showHead={false} />
      </div>

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <path d="M780 776 H628" fill="none" stroke={COLOR.git.main} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" opacity={branchesIn * (1 - resultIn)} />
        <path d="M1140 776 H1292" fill="none" stroke={COLOR.git.feature} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" opacity={branchesIn * (1 - resultIn)} />
        <path d="M640 768 l-12 8 12 8" fill="none" stroke={COLOR.git.main} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" strokeLinejoin="round" opacity={branchesIn * (1 - resultIn)} />
        <path d="M1280 768 l12 8 -12 8" fill="none" stroke={COLOR.git.feature} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" strokeLinejoin="round" opacity={branchesIn * (1 - resultIn)} />
        <path d="M612 776 H764" fill="none" stroke={COLOR.git.main} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" opacity={resultIn} />
        <path d="M1308 776 H1156" fill="none" stroke={COLOR.git.feature} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" opacity={resultIn} />
        <path d="M752 768 l12 8 -12 8" fill="none" stroke={COLOR.git.main} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" strokeLinejoin="round" opacity={resultIn} />
        <path d="M1168 768 l-12 8 12 8" fill="none" stroke={COLOR.git.feature} strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke} strokeLinecap="round" strokeLinejoin="round" opacity={resultIn} />
      </svg>

      <SnapshotCard
        title="base · C2"
        subtitle="共同祖先"
        lines={['title: Git notes', 'body:  intro']}
        tone="base"
        x={780}
        y={670}
        opacity={baseIn * (1 - resultIn)}
        scale={1 - branchesIn * 0.12}
        auditId="ep06-three-way-base"
      />
      <SnapshotCard
        title="ours · C3"
        subtitle="当前 main 的变化"
        lines={['title: Git course', 'body:  intro']}
        tone="main"
        x={252}
        y={670}
        opacity={branchesIn}
        auditId="ep06-three-way-ours"
      />
      <SnapshotCard
        title="result"
        subtitle="可自动组合的结果"
        lines={['title: Git course', 'body:  merge guide']}
        tone="result"
        x={780}
        y={670}
        opacity={resultIn}
        scale={0.94 + resultIn * 0.06}
        auditId="ep06-three-way-result"
      />
      <SnapshotCard
        title="theirs · C4"
        subtitle="feature 的变化"
        lines={['title: Git notes', 'body:  merge guide']}
        tone="feature"
        x={1308}
        y={670}
        opacity={branchesIn}
        auditId="ep06-three-way-theirs"
      />

      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('three-way')} width={1320} bottom={64} auditId="ep06-three-way-caption" />
    </AbsoluteFill>
  );
};

const MergeCommitScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const commitReady = frame >= seconds(4.8);
  const arrowsIn = interpolate(frame, [seconds(5.6), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refIn = interpolate(frame, [seconds(10.8), seconds(11.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refMove = interpolate(frame, [seconds(18.7), seconds(20.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge feature" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 250, width: 1260, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <MergeGraph mode={commitReady ? 'merged' : 'diverged'} width={1260} showParentArrows={commitReady && arrowsIn > 0} showHead={commitReady} mergedRefProgress={refMove} />
      </div>
      <div style={{position: 'absolute', left: 180, top: 680, width: 620, opacity: commitReady ? 0 : graphIn}}>
        <CodeBlock title="三方合并结果" lines={['tree result', 'merge commit not written yet']} highlight={[0]} highlightBorderColor={COLOR.git.index} />
      </div>
      <div style={{position: 'absolute', left: 180, top: 680, width: 620, opacity: refIn}}>
        <CodeBlock title="commit M1" lines={['parent C3', 'parent C4', 'tree result']} highlight={[0, 1]} highlightBorderColor={COLOR.stroke.strong} />
      </div>
      <SideNote x={1240} y={700} color={COLOR.git.commit} opacity={arrowsIn}>
        作用：保留两条开发线的来源
      </SideNote>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('merge-commit')} width={1320} bottom={64} auditId="ep06-merge-commit-caption" />
    </AbsoluteFill>
  );
};

const conflictLines: readonly DiffLine[] = [
  {type: 'context', text: 'function title() {'},
  {type: 'remove', text: '  return "main title";'},
  {type: 'add', text: '  return "feature title";'},
  {type: 'context', text: '}'},
];

const markerLines = ['<<<<<<< HEAD', 'return "main title";', '=======', 'return "feature title";', '>>>>>>> feature'];

const ConflictScene: React.FC = () => {
  const frame = useSceneFrame();
  const recording = TERMINAL_RECORDINGS['ep06-merge-conflict'];
  const terminalVisible = frame < seconds(5.35);
  const codeVisible = frame >= seconds(5.35);
  const codeOut = interpolate(frame, [seconds(10.65), seconds(11.1)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const panelIn = interpolate(frame, [seconds(11.1), seconds(11.65)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const phase = frame < seconds(16.7) ? 'unresolved' : frame < seconds(20.7) ? 'resolved' : frame < seconds(24.7) ? 'committed' : 'aborted';
  const phaseLabel = phase === 'unresolved'
    ? 'UNMERGED · merge paused'
    : phase === 'resolved'
      ? '完成路径 · git add app.js'
      : phase === 'committed'
        ? '完成路径 · git commit'
        : '退出路径（commit 前）· git merge --abort';
  const stateAreas = phase === 'unresolved'
    ? [
        {id: 'working-tree' as const, title: 'Working Tree', files: ['app.js · conflict markers'], active: true},
        {id: 'index' as const, title: 'Index', files: ['unmerged paths'], active: true},
        {id: 'repository' as const, title: 'Repository', files: ['M1 not created']},
      ]
    : phase === 'resolved'
      ? [
          {id: 'working-tree' as const, title: 'Working Tree', files: ['app.js · resolved']},
          {id: 'index' as const, title: 'Index', files: ['app.js · resolved + staged'], active: true},
          {id: 'repository' as const, title: 'Repository', files: ['M1 not created']},
        ]
      : phase === 'committed'
        ? [
            {id: 'working-tree' as const, title: 'Working Tree', files: ['clean']},
            {id: 'index' as const, title: 'Index', files: ['clean']},
            {id: 'repository' as const, title: 'Repository', files: ['M1 · merge commit'], active: true},
          ]
        : [
            {id: 'working-tree' as const, title: 'Working Tree', files: ['restored pre-merge']},
            {id: 'index' as const, title: 'Index', files: ['clean']},
            {id: 'repository' as const, title: 'Repository', files: ['HEAD at C3 · no M1'], active: true},
          ];

  return (
    <AbsoluteFill style={{padding: '126px 156px 122px', boxSizing: 'border-box'}}>
      {terminalVisible ? (
        <div data-audit-id="ep06-conflict-terminal-recording" style={{position: 'absolute', left: 290, top: 176, width: 1340, height: 660}}>
          <RecordedTerminalPanel
            src="git-course-lab/terminal/ep06-merge-conflict.mp4"
            holdFrameSrc="git-course-lab/terminal/ep06-merge-conflict-hold.png"
            holdFromFrame={recording.holdFromFrame}
            playbackRate={1.25}
            mediaFit="cover"
          />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 168, top: 210, width: 650, opacity: (codeVisible ? 1 : 0) * codeOut}}>
        <CodeDiff title="同一位置，两边都改了" lines={conflictLines} />
      </div>
      <div style={{position: 'absolute', right: 168, top: 210, width: 650, opacity: (codeVisible ? 1 : 0) * codeOut}}>
        <CodeBlock
          title="app.js · unresolved"
          lines={markerLines}
          highlight={[0, 2, 4]}
          highlightBorderColor={COLOR.git.conflict}
          highlightBackground="rgba(182,78,69,0.11)"
        />
      </div>
      <div style={{position: 'absolute', left: 332, right: 332, top: 372, opacity: panelIn, ...TYPE.ui, fontWeight: WEIGHT.bold, color: phase === 'unresolved' ? COLOR.git.conflict : COLOR.text.primary}}>
        {phaseLabel}
      </div>
      <div style={{position: 'absolute', left: 332, right: 332, top: 426, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 16}px)`}}>
        <GitStatePanel compact areas={stateAreas} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('conflict')} width={1320} bottom={64} auditId="ep06-conflict-caption" />
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const left = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const right = interpolate(frame, [seconds(5), seconds(5.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '132px 164px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 40}}>merge 有两种基础形态</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52}}>
        <div style={{opacity: left}}>
          <div style={{...TYPE.title, color: COLOR.git.main, marginBottom: 16}}>能快进</div>
          <MergeGraph mode="ff-after" width={710} small nodeScale={1.42} />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 32}}>移动 branch 指针</div>
        </div>
        <div style={{opacity: right}}>
          <div style={{...TYPE.title, color: COLOR.text.primary, marginBottom: 16}}>已经分叉</div>
          <MergeGraph mode="merged" width={760} small showParentArrows nodeScale={1.42} />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 32}}>三方合并，生成 M1</div>
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={EP06_RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep06-takeaway-caption" />
    </AbsoluteFill>
  );
};

const EP06_SCENE_COMPONENTS = {
  hook: HookScene,
  'fast-forward': FastForwardScene,
  diverged: DivergedScene,
  'three-way': ThreeWayScene,
  'merge-commit': MergeCommitScene,
  conflict: ConflictScene,
  takeaway: TakeawayScene,
};

export const Ep06Merge: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP06.seriesTitle}
      episodeTitle={EP06.title}
      scenes={EP06_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP06_RUNTIME.start('fast-forward')}
      showEpisodeTitle={(current) => current >= EP06_RUNTIME.start('fast-forward')}
    >
      <EpisodeTimeline runtime={EP06_RUNTIME} components={EP06_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
