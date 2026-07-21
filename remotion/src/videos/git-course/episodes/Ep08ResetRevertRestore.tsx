import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP08} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {
  CodeDiff,
  CommandPill,
  COURSE_GRAPH_GEOMETRY,
  CourseBranchLabel,
  CourseCommitNode,
  CourseHeadMarker,
  CourseLayout,
  EpisodeTitleCard,
  GitStatePanel,
  NarrationSubtitle,
  RecordedTerminalPanel,
  SceneSequence,
  type GitArea,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';
import {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';

type Ep08SceneId = (typeof EP08_SCENES)[number]['id'];
type ResetMode = 'soft' | 'mixed' | 'hard';
type RestoreMode = 'index-to-worktree' | 'head-to-worktree' | 'head-to-index' | 'head-to-both';

const getEp08SceneStart = (id: Ep08SceneId) => {
  let cursor = 0;
  for (const scene of EP08_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP08 scene: ${id}`);
};

const getEp08SceneDuration = (id: Ep08SceneId) => {
  const scene = EP08_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP08 scene: ${id}`);
  return scene.duration;
};

const getEp08Captions = (id: Ep08SceneId) => {
  const scene = EP08_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP08 scene: ${id}`);
  return scene.captions;
};

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
  tone?: 'main' | 'bad' | 'revert';
  opacity?: number;
  scale?: number;
}> = ({id, x, y, tone, opacity = 1, scale = 1}) => {
  const stroke = tone === 'bad' ? COLOR.git.conflict : tone === 'revert' ? COLOR.git.feature : tone === 'main' ? COLOR.git.main : COLOR.git.commit;
  return (
    <g transform={scale === 1 ? undefined : `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}>
      <CourseCommitNode id={id} x={x} y={y} stroke={stroke} strong={Boolean(tone)} opacity={opacity} />
    </g>
  );
};

const HistoryGraph: React.FC<{
  mode: 'bad' | 'reset' | 'revert' | 'stable';
  width?: number;
  progress?: number;
  showHead?: boolean;
  nodeScale?: number;
}> = ({mode, width = 1120, progress = 1, showHead = true, nodeScale = 1}) => {
  const y = 166;
  const c1 = commitX(0);
  const c2 = commitX(1);
  const c3 = commitX(2);
  const r1 = commitX(3);
  const resetProgress = mode === 'reset' ? clamp(progress) : 0;
  const revertProgress = mode === 'revert' ? clamp(progress) : 0;
  const resetDone = mode === 'reset' && resetProgress > 0.5;
  const revertRefProgress = clamp((revertProgress - 0.7) / 0.3);
  const mainX = mode === 'reset'
    ? interpolate(resetProgress, [0, 1], [c3, c2])
    : mode === 'revert'
      ? interpolate(revertRefProgress, [0, 1], [c3, r1])
      : c3;
  const viewBox = {x: 20, y: 20, width: 760, height: 300};
  const height = Math.round((width * viewBox.height) / viewBox.width);
  const edgeStroke = COURSE_GRAPH_GEOMETRY.edgeStroke;
  const nodeOuterRadius = (COURSE_GRAPH_GEOMETRY.nodeRadius + COURSE_GRAPH_GEOMETRY.nodeStrongStroke / 2) * nodeScale;
  const edgeInset = nodeOuterRadius + edgeStroke / 2;
  const c1c2 = insetLine(c1, y, c2, y, edgeInset);
  const c2c3 = insetLine(c2, y, c3, y, edgeInset);
  const c3r1 = insetLine(c3, y, r1, y, edgeInset);
  const c3Opacity = mode === 'reset' ? interpolate(resetProgress, [0, 0.72, 1], [1, 1, 0.28]) : 1;
  const oldEdgeOpacity = mode === 'reset' ? interpolate(resetProgress, [0, 1], [1, 0.22]) : 1;
  const refY = 82;

  return (
    <svg width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} style={{display: 'block', overflow: 'visible'}}>
      <line {...c1c2} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" />
      <line {...c2c3} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={oldEdgeOpacity} />
      {mode === 'revert' ? <line {...c3r1} stroke={COLOR.git.graphLine} strokeWidth={edgeStroke} strokeLinecap="round" opacity={revertProgress} /> : null}

      <CourseBranchLabel name="main" x={mainX} y={refY} targetX={mainX} targetY={y} targetRadius={nodeOuterRadius} color={COLOR.git.main} />
      {showHead ? <CourseHeadMarker x={mainX + 132} y={refY} /> : null}

      <CommitNode id="C1" x={c1} y={y} scale={nodeScale} />
      <CommitNode id="C2" x={c2} y={y} tone={resetDone ? 'main' : undefined} scale={nodeScale} />
      <CommitNode
        id="C3"
        x={c3}
        y={y}
        tone={mode === 'bad' || mode === 'revert' ? 'bad' : mode === 'stable' || (mode === 'reset' && !resetDone) ? 'main' : undefined}
        opacity={c3Opacity}
        scale={nodeScale}
      />
      {mode === 'revert' ? <CommitNode id="R1" x={r1} y={y} tone="revert" opacity={revertProgress} scale={nodeScale} /> : null}

      {mode === 'bad' || mode === 'revert' ? (
        <text x={c3} y={242} textAnchor="middle" fontFamily={FONT.sans} fontSize="23" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
          wrong change
        </text>
      ) : null}
      {mode === 'revert' ? (
        <text x={r1} y={276} textAnchor="middle" fontFamily={FONT.sans} fontSize="23" fontWeight={WEIGHT.bold} fill={COLOR.git.feature} opacity={revertProgress}>
          inverse commit
        </text>
      ) : null}
    </svg>
  );
};

const resetAreas = (mode: ResetMode): GitArea[] => {
  const active: Record<ResetMode, GitArea['id']> = {soft: 'repository', mixed: 'index', hard: 'working-tree'};
  return [
    {id: 'repository', title: 'HEAD / Repository', files: ['main → C2', 'C3 no longer referenced'], active: active[mode] === 'repository'},
    {id: 'index', title: 'Index', files: [mode === 'soft' ? 'app.js  v3 staged' : 'app.js  v2', mode === 'soft' ? 'C3 change remains staged' : 'aligned to C2'], active: active[mode] === 'index'},
    {id: 'working-tree', title: 'Working Tree', files: [mode === 'hard' ? 'app.js  v2' : 'app.js  v3 dirty', mode === 'hard' ? 'tracked edits overwritten' : 'local edits still here'], active: active[mode] === 'working-tree'},
  ];
};

const restoreAreas = (mode: RestoreMode): GitArea[] => {
  if (mode === 'index-to-worktree') {
    return [
      {id: 'repository', title: 'HEAD / Repository', files: ['app.js  v1', 'main unchanged']},
      {id: 'index', title: 'Index · source', files: ['app.js  v2 staged'], active: true},
      {id: 'working-tree', title: 'Working Tree · target', files: ['v3 working → v2 staged'], active: true},
    ];
  }
  if (mode === 'head-to-worktree') {
    return [
      {id: 'repository', title: 'HEAD · source', files: ['app.js  v1 committed'], active: true},
      {id: 'index', title: 'Index', files: ['app.js  v2 staged']},
      {id: 'working-tree', title: 'Working Tree · target', files: ['v3 working → v1 committed'], active: true},
    ];
  }
  if (mode === 'head-to-index') {
    return [
      {id: 'repository', title: 'HEAD · source', files: ['app.js  v1 committed'], active: true},
      {id: 'index', title: 'Index · target', files: ['v2 staged → v1 committed'], active: true},
      {id: 'working-tree', title: 'Working Tree', files: ['app.js  v3 unchanged']},
    ];
  }
  return [
    {id: 'repository', title: 'HEAD · source', files: ['app.js  v1 committed'], active: true},
    {id: 'index', title: 'Index · target', files: ['v2 staged → v1 committed'], active: true},
    {id: 'working-tree', title: 'Working Tree · target', files: ['v3 working → v1 committed'], active: true},
  ];
};

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.7), seconds(2.15)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.3), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(5.4), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="8."
        keyword="撤销"
        suffix="改什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -46])}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep08-hook-title"
      />
      <div style={{position: 'absolute', left: '50%', top: 218, width: 1160, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <HistoryGraph mode="bad" width={1160} nodeScale={1.12} />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 748, transform: `translateX(-50%) translateY(${(1 - questionIn) * 12}px)`, opacity: questionIn, ...TYPE.hero, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
        改历史，还是改文件？
      </div>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('hook')} width={1320} bottom={64} auditId="ep08-hook-caption" />
    </AbsoluteFill>
  );
};

const ThreeTreesScene: React.FC = () => {
  const frame = useSceneFrame();
  const repoIn = interpolate(frame, [seconds(1.8), seconds(2.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const indexIn = interpolate(frame, [seconds(6.9), seconds(7.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wtIn = interpolate(frame, [seconds(11.2), seconds(11.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flowIn = interpolate(frame, [seconds(17.1), seconds(17.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const areas: GitArea[] = [
    {id: 'repository', title: 'HEAD / Repository', files: ['当前提交快照', 'main → C3'], active: frame < seconds(7.2)},
    {id: 'index', title: 'Index', files: ['下一次提交的准备区', 'app.js  staged v3'], active: frame >= seconds(7.2) && frame < seconds(11.5)},
    {id: 'working-tree', title: 'Working Tree', files: ['正在编辑和运行', 'app.js  dirty v3'], active: frame >= seconds(11.5)},
  ];

  return (
    <AbsoluteFill style={{padding: '126px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 48}}>撤销前，先看三棵树</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, width: '100%'}}>
        <div style={{opacity: repoIn}}><GitStatePanel areas={[areas[0]]} prominent /></div>
        <div style={{opacity: indexIn}}><GitStatePanel areas={[areas[1]]} prominent /></div>
        <div style={{opacity: wtIn}}><GitStatePanel areas={[areas[2]]} prominent /></div>
      </div>
      <div style={{position: 'absolute', left: '50%', top: 696, transform: `translateX(-50%) translateY(${(1 - flowIn) * 12}px)`, opacity: flowIn, display: 'flex', alignItems: 'center', gap: 26, ...TYPE.title, fontWeight: WEIGHT.bold}}>
        <span style={{color: COLOR.text.secondary}}>source</span>
        <span style={{color: COLOR.git.head}}>→</span>
        <span style={{color: COLOR.text.primary}}>target layer</span>
      </div>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('three-trees')} width={1320} bottom={64} auditId="ep08-trees-caption" />
    </AbsoluteFill>
  );
};

const ResetModesScene: React.FC = () => {
  const frame = useSceneFrame();
  const mode: ResetMode = frame < seconds(19.2) ? 'soft' : frame < seconds(27.4) ? 'mixed' : 'hard';
  const command = mode === 'soft' ? 'git reset --soft C2' : mode === 'mixed' ? 'git reset --mixed C2' : 'git reset --hard C2';
  const move = mode === 'soft'
    ? interpolate(frame, [seconds(8.4), seconds(10.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : mode === 'mixed'
      ? interpolate(frame, [seconds(22.9), seconds(24.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : interpolate(frame, [seconds(31.7), seconds(33.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const softIn = interpolate(frame, [seconds(4.3), seconds(5.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const softOut = interpolate(frame, [seconds(18.7), seconds(19.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mixedIn = interpolate(frame, [seconds(23), seconds(23.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mixedOut = interpolate(frame, [seconds(26.9), seconds(27.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hardIn = interpolate(frame, [seconds(31.7), seconds(32.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelOpacity = mode === 'soft' ? softIn * softOut : mode === 'mixed' ? mixedIn * mixedOut : hardIn;
  const warningIn = interpolate(frame, [seconds(34.4), seconds(35.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const memoryIn = interpolate(frame, [seconds(37.3), seconds(38.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalStyle = {position: 'absolute', left: 250, top: 156, width: 1420, height: 768} as const;

  return (
    <AbsoluteFill style={{padding: '104px 132px 112px', boxSizing: 'border-box'}}>
      <div style={{opacity: modelOpacity}} data-audit-id="ep08-reset-model-continuity">
        <CommandPill command={command} branch="main" />
        <div style={{position: 'absolute', left: 110, top: 204, width: 840}}>
          <HistoryGraph mode="reset" width={840} progress={move} nodeScale={1.18} />
        </div>
        <div style={{position: 'absolute', right: 120, top: 230, display: 'flex', gap: 16}}>
          {[
            {label: '1  HEAD', active: true, color: COLOR.git.main},
            {label: '2  Index', active: mode !== 'soft', color: COLOR.git.index},
            {label: '3  Working Tree', active: mode === 'hard', color: COLOR.git.workingTree},
          ].map((step) => (
            <div key={step.label} style={{...TYPE.ui, fontFamily: FONT.mono, padding: '14px 18px', borderRadius: 8, border: `2px solid ${step.active ? step.color : COLOR.stroke.soft}`, color: step.active ? COLOR.text.primary : COLOR.text.tertiary, background: step.active ? COLOR.canvas.raised : COLOR.canvas.soft, fontWeight: WEIGHT.bold}}>
              {step.label}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 132, right: 132, top: 510}}>
          <GitStatePanel areas={resetAreas(mode)} prominent />
        </div>
        <div style={{position: 'absolute', left: 132, top: 448, opacity: mode === 'hard' ? warningIn : 0, transform: `translateY(${(1 - warningIn) * 10}px)`, padding: '12px 18px', borderRadius: 8, border: `2px solid ${COLOR.git.conflict}`, background: 'rgba(182,78,69,0.08)', ...TYPE.ui, color: COLOR.git.conflict, fontWeight: WEIGHT.bold}}>
          hard 会覆盖已跟踪文件的未提交修改
        </div>
        <div style={{position: 'absolute', right: 132, top: 448, opacity: memoryIn, ...TYPE.ui, color: COLOR.text.secondary, fontWeight: WEIGHT.bold}}>
          soft 停在 HEAD · mixed 到 Index · hard 到 Working Tree
        </div>
      </div>

      <SceneSequence from={0} durationInFrames={seconds(4.8)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-soft-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-soft.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-soft-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-soft'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <SceneSequence from={seconds(19.2)} durationInFrames={seconds(4.4)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-mixed-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-mixed.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-mixed-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-mixed'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <SceneSequence from={seconds(27.4)} durationInFrames={seconds(4.8)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-hard-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-hard.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-hard-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-hard'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('reset-modes')} width={1320} bottom={64} auditId="ep08-reset-caption" />
    </AbsoluteFill>
  );
};

const RevertScene: React.FC = () => {
  const frame = useSceneFrame();
  const modelIn = interpolate(frame, [seconds(4.7), seconds(5.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const create = interpolate(frame, [seconds(8.5), seconds(12.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const diffIn = interpolate(frame, [seconds(9), seconds(9.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: '50%', top: 194, width: 1240, transform: 'translateX(-50%)', opacity: modelIn}}>
        <HistoryGraph mode="revert" width={1240} progress={create} nodeScale={1.18} />
      </div>
      <div style={{opacity: modelIn}}><CommandPill command="git revert C3" branch="main" /></div>
      <div style={{position: 'absolute', left: '50%', top: 688, width: 680, transform: `translateX(-50%) translateY(${(1 - diffIn) * 14}px)`, opacity: diffIn * modelIn}}>
        <CodeDiff
          title="R1 applies inverse patch"
          lines={[
            {type: 'remove', text: 'enable experimental payment'},
            {type: 'add', text: 'disable experimental payment'},
          ]}
        />
      </div>
      <SceneSequence from={0} durationInFrames={seconds(5.4)}>
        <div style={{position: 'absolute', left: 250, top: 156, width: 1420, height: 768}} data-audit-id="ep08-revert-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-revert.mp4" holdFrameSrc="git-course-lab/terminal/ep08-revert-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-revert'].holdFromFrame} playbackRate={1.45} mediaFit="cover" />
        </div>
      </SceneSequence>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('revert')} width={1320} bottom={64} auditId="ep08-revert-caption" />
    </AbsoluteFill>
  );
};

const RestoreScene: React.FC = () => {
  const frame = useSceneFrame();
  const recording = TERMINAL_RECORDINGS['ep08-restore-flow'];
  const terminalOut = interpolate(frame, [seconds(6.2), seconds(7.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelIn = interpolate(frame, [seconds(6.5), seconds(7.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mode: RestoreMode = frame < seconds(10) ? 'index-to-worktree' : frame < seconds(14) ? 'head-to-worktree' : frame < seconds(23) ? 'head-to-index' : 'head-to-both';
  const command = mode === 'index-to-worktree'
    ? 'git restore app.js'
    : mode === 'head-to-worktree'
      ? 'git restore --source=HEAD app.js'
      : mode === 'head-to-index'
        ? 'git restore --staged app.js'
        : 'git restore --source=HEAD --staged --worktree app.js';
  const relation = mode === 'index-to-worktree'
    ? '默认：Index → Working Tree'
    : mode === 'head-to-worktree'
      ? '显式来源：HEAD → Working Tree'
      : mode === 'head-to-index'
        ? '--staged：HEAD → Index'
        : '同一来源：HEAD → Index + Working Tree';
  const unchangedIn = interpolate(frame, [seconds(27.7), seconds(28.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 142px 110px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 250, top: 156, width: 1420, height: 768, opacity: terminalOut}} data-audit-id="ep08-restore-terminal-recording">
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep08-restore-flow.mp4"
          holdFrameSrc="git-course-lab/terminal/ep08-restore-flow-hold.png"
          holdFromFrame={recording.holdFromFrame}
          playbackRate={1.1}
          mediaFit="cover"
        />
      </div>
      <div style={{opacity: modelIn}}>
        <CommandPill command={command} branch="main" fontSize={mode === 'head-to-both' ? 24 : 34} />
        <div style={{position: 'absolute', left: 142, right: 142, top: 286}}>
          <div style={{textAlign: 'center', ...TYPE.title, color: COLOR.text.primary, fontWeight: WEIGHT.bold, marginBottom: 30}}>{relation}</div>
          <GitStatePanel areas={restoreAreas(mode)} prominent />
        </div>
        <div style={{position: 'absolute', left: '50%', top: 720, transform: `translateX(-50%) translateY(${(1 - unchangedIn) * 10}px)`, opacity: unchangedIn, ...TYPE.ui, color: COLOR.text.secondary, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
          main / HEAD / commit graph 保持不动
        </div>
      </div>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('restore')} width={1320} bottom={64} auditId="ep08-restore-caption" />
    </AbsoluteFill>
  );
};

const ChooseScene: React.FC = () => {
  const frame = useSceneFrame();
  const active = frame < seconds(5.6) ? null : frame < seconds(10.8) ? 'restore' : frame < seconds(14.5) ? 'reset' : frame < seconds(20.1) ? 'revert' : null;
  const rows = [
    {name: 'reset', target: '本地历史', changes: '移动 branch，按模式同步三棵树', color: COLOR.git.main},
    {name: 'revert', target: '共享历史', changes: '新增反向提交，旧历史保留', color: COLOR.git.feature},
    {name: 'restore', target: '文件内容', changes: '恢复 Index 或 Working Tree 路径', color: COLOR.git.workingTree},
  ];
  const safetyIn = interpolate(frame, [seconds(20.1), seconds(20.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '122px 164px 110px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 42}}>先问目标，再选命令</div>
      <div style={{display: 'grid', gap: 16}}>
        {rows.map((row, idx) => {
          const appear = interpolate(frame, [seconds(idx * 1.4), seconds(idx * 1.4 + 0.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const selected = active === row.name;
          return (
            <div key={row.name} style={{opacity: appear, display: 'grid', gridTemplateColumns: '220px 280px 1fr', alignItems: 'center', gap: 28, minHeight: 118, padding: '0 32px', borderRadius: 8, border: `2px solid ${selected ? row.color : COLOR.stroke.soft}`, background: selected ? COLOR.canvas.raised : 'rgba(255,255,255,0.54)', boxShadow: selected ? `0 18px 48px ${COLOR.effects.shadowSoft}` : undefined}}>
              <div style={{fontFamily: FONT.mono, ...TYPE.title, color: row.color, fontWeight: WEIGHT.bold}}>{row.name}</div>
              <div style={{...TYPE.subtitle, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{row.target}</div>
              <div style={{...TYPE.body, color: COLOR.text.secondary}}>{row.changes}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: '50%', top: 708, transform: `translateX(-50%) translateY(${(1 - safetyIn) * 10}px)`, opacity: safetyIn, display: 'flex', gap: 18, alignItems: 'center'}}>
        {['git status', 'git diff', 'git diff --staged'].map((command) => (
          <span key={command} style={{...TYPE.ui, fontFamily: FONT.mono, color: COLOR.text.primary, background: COLOR.canvas.raised, border: `1px solid ${COLOR.stroke.soft}`, borderRadius: 8, padding: '12px 18px', boxShadow: `0 12px 34px ${COLOR.effects.shadowSoft}`}}>
            {command}
          </span>
        ))}
      </div>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('choose')} width={1320} bottom={64} auditId="ep08-choose-caption" />
    </AbsoluteFill>
  );
};

const SummaryCard: React.FC<{
  command: string;
  node: string;
  description: string;
  color: string;
  opacity: number;
}> = ({command, node, description, color, opacity}) => (
  <div style={{opacity, textAlign: 'center', display: 'grid', justifyItems: 'center'}}>
    <div style={{...TYPE.title, fontFamily: FONT.mono, color, fontWeight: WEIGHT.bold, marginBottom: 18}}>{command}</div>
    <svg width="154" height="132" viewBox="0 0 154 132" style={{display: 'block'}}>
      <g transform="translate(77 58) scale(1.42) translate(-77 -58)">
        <CourseCommitNode id={node} x={77} y={58} stroke={color} strong />
      </g>
    </svg>
    <div style={{...TYPE.subtitle, color: COLOR.text.primary, fontWeight: WEIGHT.bold, marginTop: 10}}>{description}</div>
  </div>
);

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const resetIn = interpolate(frame, [seconds(2.6), seconds(3.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const revertIn = interpolate(frame, [seconds(7.7), seconds(8.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const restoreIn = interpolate(frame, [seconds(11.2), seconds(11.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '136px 164px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 76}}>撤销判断：先认对象</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 64, alignItems: 'start'}}>
        <SummaryCard command="reset" node="ref" description="移动引用和三棵树" color={COLOR.git.main} opacity={resetIn} />
        <SummaryCard command="revert" node="R1" description="向前写入新提交" color={COLOR.git.feature} opacity={revertIn} />
        <SummaryCard command="restore" node="file" description="恢复选定文件层" color={COLOR.git.workingTree} opacity={restoreIn} />
      </div>
      <NarrationSubtitle frame={frame} cues={getEp08Captions('takeaway')} width={1320} bottom={64} auditId="ep08-takeaway-caption" />
    </AbsoluteFill>
  );
};

export const Ep08ResetRevertRestore: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP08.seriesTitle}
      episodeTitle={EP08.title}
      scenes={EP08_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp08SceneStart('three-trees')}
      showEpisodeTitle={(current) => current >= getEp08SceneStart('three-trees')}
    >
      <SceneSequence from={getEp08SceneStart('hook')} durationInFrames={getEp08SceneDuration('hook')}><HookScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('three-trees')} durationInFrames={getEp08SceneDuration('three-trees')}><ThreeTreesScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('reset-modes')} durationInFrames={getEp08SceneDuration('reset-modes')}><ResetModesScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('revert')} durationInFrames={getEp08SceneDuration('revert')}><RevertScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('restore')} durationInFrames={getEp08SceneDuration('restore')}><RestoreScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('choose')} durationInFrames={getEp08SceneDuration('choose')}><ChooseScene /></SceneSequence>
      <SceneSequence from={getEp08SceneStart('takeaway')} durationInFrames={getEp08SceneDuration('takeaway')}><TakeawayScene /></SceneSequence>
    </CourseLayout>
  );
};
