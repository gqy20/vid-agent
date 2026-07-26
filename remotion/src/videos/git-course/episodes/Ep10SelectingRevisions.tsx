import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP10} from '../data/episodes';
import {EP10_DURATION_IN_FRAMES, EP10_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {
  CourseBranchLabel,
  CourseCommitNode,
  CourseGraphEdge,
  CourseHeadMarker,
  CourseLayout,
  CenterInRect,
  EpisodeTitleCard,
  EpisodeTimeline,
  NarrationSubtitle,
  RecordedTerminalCueSequence,
  createEpisodeRuntime,
  courseCommitAnchor,
  courseCommitOuterRadius,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {seconds} from '../timeline';
import {TYPE} from '../typography';

export {EP10_DURATION_IN_FRAMES, EP10_SCENES};

const RUNTIME = createEpisodeRuntime(EP10_SCENES);
const fadeIn = (frame: number, at: number, duration = 0.7) => interpolate(frame, [seconds(at), seconds(at + duration)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const terminalCue = <T extends keyof typeof TERMINAL_RECORDINGS>(id: T, from: number, duration: number) => ({
  id,
  from: seconds(from),
  durationInFrames: seconds(duration),
  src: `git-course-lab/terminal/${id}.mp4`,
  holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`,
  holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame,
});

const TerminalCues = {
  history: [terminalCue('ep10-log', 0, 10), terminalCue('ep10-resolve', 10, 14)],
  range: [terminalCue('ep10-range', 17, 14)],
} as const;

type GraphPoint = {x: number; y: number};
const P: Record<'c0' | 'c1' | 'c2' | 'f1' | 'f2', GraphPoint> = {
  c0: {x: 150, y: 210},
  c1: {x: 370, y: 210},
  c2: {x: 590, y: 210},
  f1: {x: 590, y: 390},
  f2: {x: 810, y: 390},
};
const HISTORY_NODE_RADIUS = courseCommitOuterRadius({scale: 1.18, strong: true});
const EP10_TAKEAWAY_BODY = {x: 260, y: 300, width: 1400, height: 560};
const EP10_SHORT_OBJECT_ID = '613b39e';
const EP10_FULL_OBJECT_ID = '613b39ed915596faf383bbc37f2a05a667cf1112';

const HistoryGraph: React.FC<{highlight?: readonly string[]; showRefs?: boolean; opacity?: number}> = ({highlight = [], showRefs = true, opacity = 1}) => {
  const tone = (id: string) => highlight.includes(id) ? 'feature' as const : id === 'C2' ? 'main' as const : 'default' as const;
  return (
    <svg width="960" height="510" viewBox="0 0 960 510" style={{display: 'block', opacity, overflow: 'visible'}}>
      <g data-graph-layer="edges">
        <CourseGraphEdge from={courseCommitAnchor(P.c1.x, P.c1.y, {scale: 1.18})} to={courseCommitAnchor(P.c0.x, P.c0.y, {scale: 1.18})} opacity={0.8} />
        <CourseGraphEdge from={courseCommitAnchor(P.c2.x, P.c2.y, {scale: 1.18})} to={courseCommitAnchor(P.c1.x, P.c1.y, {scale: 1.18})} opacity={0.8} />
        <CourseGraphEdge from={courseCommitAnchor(P.f1.x, P.f1.y, {scale: 1.18})} to={courseCommitAnchor(P.c1.x, P.c1.y, {scale: 1.18})} opacity={0.8} />
        <CourseGraphEdge from={courseCommitAnchor(P.f2.x, P.f2.y, {scale: 1.18})} to={courseCommitAnchor(P.f1.x, P.f1.y, {scale: 1.18})} opacity={0.8} />
      </g>
      {showRefs ? <g data-graph-layer="refs">
        <CourseBranchLabel name="main" x={P.c2.x} y={105} targetX={P.c2.x} targetY={P.c2.y} targetRadius={HISTORY_NODE_RADIUS} color={COLOR.git.main} />
        <CourseBranchLabel name="feature" x={P.f2.x} y={495} targetX={P.f2.x} targetY={P.f2.y} targetRadius={HISTORY_NODE_RADIUS} color={COLOR.git.feature} />
      </g> : null}
      <g data-graph-layer="nodes">
        <CourseCommitNode id="C0" {...P.c0} scale={1.18} tone={tone('C0')} />
        <CourseCommitNode id="C1" {...P.c1} scale={1.18} tone={tone('C1')} />
        <CourseCommitNode id="C2" {...P.c2} scale={1.18} tone={tone('C2')} />
        <CourseCommitNode id="F1" {...P.f1} scale={1.18} tone={tone('F1')} />
        <CourseCommitNode id="F2" {...P.f2} scale={1.18} tone={tone('F2')} />
      </g>
      {showRefs ? (
        <CourseHeadMarker x={P.c2.x + 132} y={105} />
      ) : null}
    </svg>
  );
};

const Token: React.FC<{children: React.ReactNode; color?: string; opacity?: number}> = ({children, color = COLOR.git.head, opacity = 1}) => (
  <div style={{opacity, padding: '15px 24px', border: `2px solid ${color}`, borderRadius: 14, background: COLOR.canvas.raised, color, fontFamily: FONT.mono, ...TYPE.subtitle, fontWeight: WEIGHT.bold}}>{children}</div>
);

const ResolverRow: React.FC<{token: string; result: string; opacity: number; color?: string}> = ({token, result, opacity, color}) => (
  <div style={{display: 'grid', gridTemplateColumns: '410px 120px 1fr', alignItems: 'center', gap: 22, opacity, transform: `translateY(${(1 - opacity) * 12}px)`}}>
    <Token color={color}>{token}</Token>
    <div style={{fontFamily: FONT.mono, fontSize: 42, color: COLOR.text.tertiary, textAlign: 'center'}}>→</div>
    <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>{result}</div>
  </div>
);

// @git-course-scene hook:start
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOut = interpolate(frame, [seconds(2), seconds(2.6)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = fadeIn(frame, 2.8);
  const names = [
    {text: 'main', x: 450, at: 5.2},
    {text: 'HEAD~2', x: 820, at: 7.2},
    {text: 'c9ff964', x: 1190, at: 9.2},
  ];
  return (
    <AbsoluteFill>
      <EpisodeTitleCard index="10." keyword="选中" suffix="谁" opacity={titleOut} underlineScale={fadeIn(frame, 0.4, 0.5)} auditId="ep10-hook-title" />
      <div style={{position: 'absolute', left: 330, top: 250, opacity: graphIn}}><HistoryGraph showRefs={false} /></div>
      <div data-audit-id="ep10-hook-revisions" style={{position: 'absolute', left: 0, right: 0, top: 720}}>
        {names.map((item) => <div key={item.text} style={{position: 'absolute', left: item.x, transform: 'translateX(-50%)', opacity: fadeIn(frame, item.at)}}><Token>{item.text}</Token></div>)}
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep10-hook-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene hook:end

// @git-course-scene revision-map:start
const RevisionMapScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '116px 230px 120px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 58}}>Revision 是怎样落到图上的</div>
      <div data-audit-id="ep10-resolver-map" style={{display: 'grid', gap: 28}}>
        <ResolverRow token="main / tag / HEAD" result="从 ref 找到起点" opacity={fadeIn(frame, 2.5)} color={COLOR.git.main} />
        <ResolverRow token="c9ff964" result="用唯一前缀找到对象" opacity={fadeIn(frame, 7.3)} />
        <ResolverRow token="HEAD~2" result="沿 parent 路线向过去走" opacity={fadeIn(frame, 12.2)} color={COLOR.git.feature} />
        <ResolverRow token="main..feature" result="选择一组可达提交" opacity={fadeIn(frame, 17.5)} color={COLOR.git.workingTree} />
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('revision-map')} width={1320} bottom={64} auditId="ep10-revision-map-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene revision-map:end

// @git-course-scene real-log:start
const RealLogScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RecordedTerminalCueSequence cues={TerminalCues.history} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep10-history-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('real-log')} width={1320} bottom={64} auditId="ep10-real-log-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene real-log:end

// @git-course-scene names-and-hash:start
const NamesAndHashScene: React.FC = () => {
  const frame = useCurrentFrame();
  const expand = fadeIn(frame, 12.2, 1.1);
  return (
    <AbsoluteFill style={{padding: '116px 170px 116px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>不同入口，同一个对象位置</div>
      <div style={{position: 'absolute', left: 130, top: 294, width: 1040}}><HistoryGraph highlight={['C2']} /></div>
      <div data-audit-id="ep10-name-stack" style={{position: 'absolute', right: 160, top: 280, width: 500, display: 'grid', gap: 22}}>
        <ResolverRow token="main" result="C2" opacity={fadeIn(frame, 2.8)} color={COLOR.git.main} />
        <ResolverRow token="HEAD" result="C2" opacity={fadeIn(frame, 6.0)} />
        <ResolverRow token={EP10_SHORT_OBJECT_ID} result="C2" opacity={fadeIn(frame, 9.2)} color={COLOR.git.feature} />
      </div>
      <div style={{position: 'absolute', right: 140, top: 680, width: 650, opacity: expand}}>
        <div style={{...TYPE.ui, color: COLOR.text.secondary, marginBottom: 20}}>短 hash 是足够唯一的前缀</div>
        <div style={{fontFamily: FONT.mono, fontSize: 26, lineHeight: 1.4, whiteSpace: 'nowrap', color: COLOR.text.secondary}}>
          <span style={{fontWeight: WEIGHT.bold, color: COLOR.git.feature}}>{EP10_SHORT_OBJECT_ID}</span>
          <span style={{fontWeight: WEIGHT.regular}}>{EP10_FULL_OBJECT_ID.slice(EP10_SHORT_OBJECT_ID.length)}</span>
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('names-and-hash')} width={1320} bottom={64} auditId="ep10-names-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene names-and-hash:end

// @git-course-scene ancestors:start
const AncestorsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const mode = frame < seconds(8.8) ? 'parent' : frame < seconds(14) ? 'tilde' : frame < seconds(21) ? 'merge' : 'route';
  const active = mode === 'parent' ? ['C2', 'C1'] : mode === 'tilde' ? ['C2', 'C1', 'C0'] : mode === 'merge' ? ['F2', 'F1', 'C1'] : ['C2', 'C1', 'C0'];
  const command = mode === 'parent' ? 'HEAD^  →  C1' : mode === 'tilde' ? 'HEAD~2  →  C0' : mode === 'merge' ? 'M1^2  →  第二位 parent' : '符号 = 图上的路线';
  return (
    <AbsoluteFill style={{padding: '112px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>沿 parent 走，而不是背标点</div>
      <div style={{position: 'absolute', left: 210, top: 228}}><HistoryGraph highlight={active} /></div>
      <div data-audit-id="ep10-ancestor-command" style={{position: 'absolute', right: 170, top: 344, width: 590}}>
        <Token color={mode === 'merge' ? COLOR.git.feature : COLOR.git.head}>{command}</Token>
        <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 26}}>{mode === 'merge' ? 'merge commit 才需要区分第几位 parent' : '波浪线始终沿第一位 parent 连续行走'}</div>
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('ancestors')} width={1320} bottom={64} auditId="ep10-ancestors-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene ancestors:end

// @git-course-scene ranges:start
const RangesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminal = frame >= seconds(17);
  return (
    <AbsoluteFill>
      {!terminal ? <>
        <div style={{position: 'absolute', left: 150, right: 150, top: 112, ...TYPE.hero, fontWeight: WEIGHT.bold}}>双点选择的是集合差</div>
        <div style={{position: 'absolute', left: 150, top: 236}}><HistoryGraph highlight={frame < seconds(8.5) ? ['C0', 'C1', 'F1', 'F2'] : ['F1', 'F2']} /></div>
        <div data-audit-id="ep10-range-formula" style={{position: 'absolute', right: 154, top: 314, width: 610}}>
          <Token color={COLOR.git.feature}>main..feature</Token>
          <div style={{...TYPE.title, fontWeight: WEIGHT.bold, marginTop: 34}}>feature 可达</div>
          <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.text.tertiary, marginTop: 14}}>− main 可达</div>
          <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.feature, marginTop: 28, opacity: fadeIn(frame, 9)}}>= F1, F2</div>
        </div>
      </> : null}
      <RecordedTerminalCueSequence cues={TerminalCues.range} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep10-range-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('ranges')} width={1320} bottom={64} auditId="ep10-ranges-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene ranges:end

const SummaryLine: React.FC<{label: string; value: string; color: string; opacity: number}> = ({label, value, color, opacity}) => (
  <div style={{display: 'grid', gridTemplateColumns: '270px 1fr', gap: 30, alignItems: 'center', opacity, transform: `translateY(${(1 - opacity) * 14}px)`}}>
    <div style={{...TYPE.title, color, fontWeight: WEIGHT.bold}}>{label}</div>
    <div style={{...TYPE.title, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{value}</div>
  </div>
);

// @git-course-scene takeaway:start
const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '146px 260px 120px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>让表达式在提交图上落地</div>
      <CenterInRect rect={EP10_TAKEAWAY_BODY} auditId="ep10-takeaway-body">
        <div style={{display: 'grid', gap: 44, width: '100%'}} data-audit-id="ep10-summary">
          <SummaryLine label="起点" value="ref、HEAD 或唯一 hash" color={COLOR.git.main} opacity={fadeIn(frame, 2.5)} />
          <SummaryLine label="路线" value="沿哪一位 parent 走" color={COLOR.git.head} opacity={fadeIn(frame, 6.5)} />
          <SummaryLine label="集合" value="要一个节点，还是一组提交" color={COLOR.git.feature} opacity={fadeIn(frame, 10.5)} />
        </div>
      </CenterInRect>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep10-takeaway-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene takeaway:end

const COMPONENTS = {
  hook: HookScene,
  'revision-map': RevisionMapScene,
  'real-log': RealLogScene,
  'names-and-hash': NamesAndHashScene,
  ancestors: AncestorsScene,
  ranges: RangesScene,
  takeaway: TakeawayScene,
};

export const Ep10SelectingRevisions: React.FC = () => {
  const frame = useCurrentFrame();
  return <CourseLayout seriesTitle={EP10.seriesTitle} episodeTitle={EP10.title} scenes={EP10_SCENES} currentFrame={frame} showHeader={(current) => current >= RUNTIME.start('revision-map')} showEpisodeTitle={(current) => current >= RUNTIME.start('revision-map')}>
    <EpisodeTimeline runtime={RUNTIME} components={COMPONENTS} />
  </CourseLayout>;
};
