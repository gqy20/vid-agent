import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP09} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {
  CodeDiff,
  type DiffFocus,
  CommandPill,
  courseCommitAnchor,
  courseCommitOuterRadius,
  createEpisodeRuntime,
  CourseBranchLabel,
  CourseCommitNode,
  CourseGraphEdge,
  CourseHeadMarker,
  CourseLayout,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitStateFlow,
  NarrationSubtitle,
  RecordedTerminalCueSequence,
  type GitArea,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP09_DURATION_IN_FRAMES, EP09_SCENES} from '../data/episodeTimelines.generated';
import {EP09_DURATION_IN_FRAMES, EP09_SCENES} from '../data/episodeTimelines.generated';

const EP09_RUNTIME = createEpisodeRuntime(EP09_SCENES);
const useSceneFrame = () => useCurrentFrame();

const terminalCue = <T extends keyof typeof TERMINAL_RECORDINGS>(id: T, from: number, duration: number, startFromFrame = 0) => ({
  id,
  from: seconds(from),
  durationInFrames: seconds(duration),
  src: `git-course-lab/terminal/${id}.mp4`,
  holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`,
  holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame,
  startFromFrame,
});

const WORKING_TERMINAL_CUES = [
  terminalCue('ep09-status-mm', 5.7, 7.3),
  terminalCue('ep09-unstaged-diff', 13, 2.6, 8),
  terminalCue('ep09-staged-diff', 15.6, 5.4, 20),
] as const;

const COMMIT_TERMINAL_CUES = [
  terminalCue('ep09-commit-log', 0, 8.5),
  terminalCue('ep09-commit-patch', 8.5, 13),
] as const;

const COMMIT_PAIR_NODE_RADIUS = courseCommitOuterRadius({scale: 1.3, strong: true});

const WORKING_AREAS: readonly GitArea[] = [
  {id: 'repository', title: 'Repository', marker: 'HEAD', files: ['app.js  v1 committed']},
  {id: 'index', title: 'Index', files: ['theme = dark', 'v2 staged']},
  {id: 'working-tree', title: 'Working Tree', files: ['retries = 3', 'v3 working']},
];

const WORKING_SETUP_AREAS: readonly GitArea[] = [
  {id: 'repository', title: 'Repository', marker: 'HEAD', files: ['theme = light', 'retries = 2']},
  {id: 'index', title: 'Index', files: ['theme = dark', 'retries = 2']},
  {id: 'working-tree', title: 'Working Tree', files: ['theme = dark', 'retries = 3']},
];

const unstagedLines = [
  {type: 'context' as const, text: 'export const theme = "dark";'},
  {type: 'remove' as const, text: 'export const retries = 2;'},
  {type: 'add' as const, text: 'export const retries = 3;'},
];

const stagedLines = [
  {type: 'remove' as const, text: 'export const theme = "light";'},
  {type: 'add' as const, text: 'export const theme = "dark";'},
  {type: 'context' as const, text: 'export const retries = 2;'},
];

const commitLines = [
  {type: 'remove' as const, text: 'export const mode = "basic";'},
  {type: 'remove' as const, text: 'export const cache = false;'},
  {type: 'add' as const, text: 'export const mode = "advanced";'},
  {type: 'add' as const, text: 'export const cache = true;'},
];

const ComparisonQuestion: React.FC<{left: string; right: string; opacity?: number}> = ({left, right, opacity = 1}) => (
  <div
    data-audit-id="ep09-comparison-question"
    style={{
      opacity,
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      gap: 28,
      width: 1080,
      margin: '0 auto',
      ...TYPE.title,
      fontWeight: WEIGHT.bold,
    }}
  >
    <div style={{textAlign: 'right', color: COLOR.text.primary}}>{left}</div>
    <div style={{fontFamily: FONT.mono, color: COLOR.git.head}}>→</div>
    <div style={{color: COLOR.text.primary}}>{right}</div>
  </div>
);

const StateMap: React.FC<{
  active?: GitArea['id'][];
  transition?: 'unstaged' | 'staged';
  progress?: number;
  auditId: string;
}> = ({active = [], transition, progress = 1, auditId}) => {
  const areas = WORKING_AREAS.map((area) => ({...area, active: active.includes(area.id)}));
  const transitions = transition === 'unstaged'
    ? [{from: 'index' as const, to: 'working-tree' as const, label: 'git diff', progress, color: COLOR.git.workingTree}]
    : transition === 'staged'
      ? [{from: 'repository' as const, to: 'index' as const, label: 'git diff --staged', progress, color: COLOR.git.index}]
      : [];

  return <GitStateFlow areas={areas} transitions={transitions} prominent gap={18} auditId={auditId} />;
};

const CommitPair: React.FC<{opacity?: number; compareProgress?: number}> = ({opacity = 1, compareProgress = 1}) => {
  const c1 = {x: 330, y: 156};
  const c2 = {x: 690, y: 156};
  const endX = interpolate(compareProgress, [0, 1], [c1.x + 58, c2.x - 58]);
  return (
    <svg width="1020" height="330" viewBox="0 0 1020 330" style={{display: 'block', overflow: 'visible', opacity}}>
      <CourseGraphEdge from={courseCommitAnchor(c1.x, c1.y, {scale: 1.3, strong: true})} to={courseCommitAnchor(c2.x, c2.y, {scale: 1.3, strong: true})} opacity={0.42} />
      <CourseBranchLabel name="main" x={c2.x} y={62} targetX={c2.x} targetY={c2.y} targetRadius={COMMIT_PAIR_NODE_RADIUS} color={COLOR.git.main} />
      <CourseHeadMarker x={c2.x + 138} y={62} />
      <CourseCommitNode id="C1" x={c1.x} y={c1.y} scale={1.3} strong />
      <CourseCommitNode id="C2" x={c2.x} y={c2.y} scale={1.3} tone="main" />
      <line x1={c1.x + 58} y1="266" x2={endX} y2="266" stroke={COLOR.git.head} strokeWidth="6" strokeLinecap="round" />
      <path d={`M${endX - 16} 254 L${endX} 266 L${endX - 16} 278`} fill="none" stroke={COLOR.git.head} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="510" y="318" textAnchor="middle" fontFamily={FONT.mono} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>git diff C1 C2</text>
    </svg>
  );
};

// @git-course-scene hook:start
const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.8), seconds(2.3)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mapIn = interpolate(frame, [seconds(2.5), seconds(3.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(7.4), seconds(8.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 150px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="9."
        keyword="diff"
        suffix="比较谁"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -42])}
        underlineScale={interpolate(frame, [seconds(0.4), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep09-hook-title"
      />
      <div style={{position: 'absolute', left: 184, right: 184, top: 228, opacity: mapIn, transform: `translateY(${(1 - mapIn) * 18}px)`}}>
        <GitStateFlow areas={WORKING_AREAS} compact gap={22} auditId="ep09-hook-state-map" />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 732, opacity: questionIn, transform: `translateY(${(1 - questionIn) * 12}px)`}}>
        <ComparisonQuestion left="左边是谁" right="右边是谁" />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep09-hook-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene hook:end

// @git-course-scene state-map:start
const StateMapScene: React.FC = () => {
  const frame = useSceneFrame();
  const historyIn = interpolate(frame, [seconds(12.5), seconds(13.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(18.5), seconds(19.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>先把可比较的状态放在一起</div>
      <div style={{position: 'absolute', left: 150, right: 150, top: 238}}>
        <StateMap active={frame < seconds(7.6) ? ['working-tree'] : frame < seconds(12.5) ? ['index'] : ['repository']} auditId="ep09-state-map" />
      </div>
      <div data-audit-id="ep09-history-snapshots" style={{position: 'absolute', left: 246, top: 690, opacity: historyIn, transform: `translateY(${(1 - historyIn) * 12}px)`, display: 'flex', alignItems: 'center', gap: 22}}>
        <span style={{...TYPE.ui, color: COLOR.text.secondary, fontWeight: WEIGHT.bold}}>其他历史快照</span>
        {['C0', 'C1', 'C2'].map((id) => (
          <span key={id} style={{fontFamily: FONT.mono, ...TYPE.subtitle, color: COLOR.text.primary, border: `2px solid ${COLOR.stroke.default}`, background: COLOR.canvas.raised, borderRadius: 999, padding: '10px 20px', fontWeight: WEIGHT.bold}}>{id}</span>
        ))}
      </div>
      <div style={{position: 'absolute', right: 180, top: 724, opacity: questionIn}}>
        <span style={{...TYPE.title, color: COLOR.git.head, fontWeight: WEIGHT.bold}}>任选两个端点</span>
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('state-map')} width={1320} bottom={64} auditId="ep09-state-map-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene state-map:end

// @git-course-scene terminal-working:start
const TerminalWorkingScene: React.FC = () => {
  const frame = useSceneFrame();
  const showingSetup = frame < seconds(7.6);
  const active: GitArea['id'][] = frame < seconds(3.45)
    ? ['repository']
    : frame < seconds(5.8)
      ? ['index']
      : ['working-tree'];
  const setupAreas = WORKING_SETUP_AREAS.map((area) => ({...area, active: active.includes(area.id)}));
  return (
    <AbsoluteFill>
      {showingSetup ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 116, textAlign: 'center', ...TYPE.hero, fontWeight: WEIGHT.bold}}>
            同一个文件，两层变化
          </div>
          <div style={{position: 'absolute', left: 150, right: 150, top: 270}}>
            <GitStateFlow areas={setupAreas} prominent gap={18} auditId="ep09-working-setup" />
          </div>
        </>
      ) : (
        <RecordedTerminalCueSequence
          auditIdPrefix="ep09-working-terminal"
          cues={WORKING_TERMINAL_CUES}
          rect={{x: 250, y: 132, width: 1420, height: 768}}
          mediaFit="cover"
        />
      )}
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('terminal-working')} width={1320} bottom={64} auditId="ep09-terminal-working-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene terminal-working:end

// @git-course-scene unstaged-diff:start
const UnstagedDiffScene: React.FC = () => {
  const frame = useSceneFrame();
  const flow = interpolate(frame, [seconds(2.7), seconds(6.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const patchIn = interpolate(frame, [seconds(10.8), seconds(11.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '112px 132px 110px', boxSizing: 'border-box'}}>
      <CommandPill command="git diff -- app.js" top={104} />
      <div style={{position: 'absolute', left: 132, right: 132, top: 224}}>
        <StateMap active={['index', 'working-tree']} transition="unstaged" progress={flow} auditId="ep09-unstaged-flow" />
      </div>
      <div data-audit-id="ep09-unstaged-patch" style={{position: 'absolute', left: '50%', top: 696, width: 760, transform: `translateX(-50%) translateY(${(1 - patchIn) * 12}px)`, opacity: patchIn}}>
        <CodeDiff title="Index → Working Tree" lines={unstagedLines} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('unstaged-diff')} width={1320} bottom={64} auditId="ep09-unstaged-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene unstaged-diff:end

// @git-course-scene staged-diff:start
const StagedDiffScene: React.FC = () => {
  const frame = useSceneFrame();
  const flow = interpolate(frame, [seconds(2.8), seconds(6.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const patchIn = interpolate(frame, [seconds(10.5), seconds(11.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '112px 132px 110px', boxSizing: 'border-box'}}>
      <CommandPill command="git diff --staged -- app.js" top={104} />
      <div style={{position: 'absolute', left: 132, right: 132, top: 224}}>
        <StateMap active={['repository', 'index']} transition="staged" progress={flow} auditId="ep09-staged-flow" />
      </div>
      <div data-audit-id="ep09-staged-patch" style={{position: 'absolute', left: '50%', top: 696, width: 760, transform: `translateX(-50%) translateY(${(1 - patchIn) * 12}px)`, opacity: patchIn}}>
        <CodeDiff title="HEAD → Index" lines={stagedLines} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('staged-diff')} width={1320} bottom={64} auditId="ep09-staged-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene staged-diff:end

// @git-course-scene commit-diff:start
const CommitDiffScene: React.FC = () => {
  const frame = useSceneFrame();
  const modelIn = frame >= seconds(21.5) ? 1 : 0;
  const compare = interpolate(frame, [seconds(21.6), seconds(24.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const patchIn = interpolate(frame, [seconds(24.5), seconds(25.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelLeft = interpolate(frame, [seconds(24.5), seconds(25.3)], [450, 108], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelTop = interpolate(frame, [seconds(24.5), seconds(25.3)], [150, 215], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '102px 132px 110px', boxSizing: 'border-box'}}>
      <RecordedTerminalCueSequence
        auditIdPrefix="ep09-commit-terminal"
        cues={COMMIT_TERMINAL_CUES}
        rect={{x: 250, y: 132, width: 1420, height: 768}}
        mediaFit="cover"
      />
      <div style={{position: 'absolute', left: modelLeft, top: modelTop, opacity: modelIn}}>
        <CommitPair opacity={modelIn} compareProgress={compare} />
      </div>
      <div data-audit-id="ep09-commit-patch" style={{position: 'absolute', right: 156, top: 300, width: 720, opacity: patchIn, transform: `translateY(${(1 - patchIn) * 12}px)`}}>
        <CodeDiff title="C1 → C2" lines={commitLines} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('commit-diff')} width={1320} bottom={64} auditId="ep09-commit-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene commit-diff:end

const PatchNote: React.FC<{label: string; description: string; color: string; opacity: number}> = ({label, description, color, opacity}) => (
  <div style={{opacity, borderLeft: `5px solid ${color}`, padding: '8px 0 8px 22px'}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.subtitle, color, fontWeight: WEIGHT.bold}}>{label}</div>
    <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 7}}>{description}</div>
  </div>
);

// @git-course-scene read-patch:start
const ReadPatchScene: React.FC = () => {
  const frame = useSceneFrame();
  const focus: DiffFocus | undefined = frame < seconds(3.84)
    ? undefined
    : frame < seconds(6.72)
      ? 'file-header'
      : frame < seconds(9.73)
        ? 'hunk-header'
        : frame < seconds(13.79)
          ? 'remove'
          : frame < seconds(17.42)
            ? 'add'
            : undefined;
  const note = (target: DiffFocus) => focus === undefined ? 0.42 : focus === target ? 1 : 0.2;
  return (
    <AbsoluteFill style={{padding: '116px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>patch 描述的是变化方向</div>
      <div data-audit-id="ep09-read-patch-code" style={{position: 'absolute', left: 170, top: 262, width: 910}}>
        <CodeDiff
          fileHeader="diff --git a/app.js b/app.js"
          hunkHeader="@@ -1,2 +1,2 @@"
          lines={commitLines}
          focus={focus}
          prominent
        />
      </div>
      <div data-audit-id="ep09-read-patch-notes" style={{position: 'absolute', right: 174, top: 250, width: 560, display: 'grid', gap: 18}}>
        <PatchNote label="a/ → b/" description="左端路径 → 右端路径" color={COLOR.git.head} opacity={note('file-header')} />
        <PatchNote label="@@" description="变化所在的代码区间" color={COLOR.text.secondary} opacity={note('hunk-header')} />
        <PatchNote label="−" description="左端存在，右端不再保留" color={COLOR.git.conflict} opacity={note('remove')} />
        <PatchNote label="+" description="右端新增或替换后的内容" color={COLOR.git.workingTree} opacity={note('add')} />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('read-patch')} width={1320} bottom={64} auditId="ep09-read-patch-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene read-patch:end

const SummaryRow: React.FC<{command: string; relation: string; color: string; opacity: number}> = ({command, relation, color, opacity}) => (
  <div style={{opacity, display: 'grid', gridTemplateColumns: '500px 1fr', alignItems: 'center', minHeight: 128, borderBottom: `1px solid ${COLOR.stroke.soft}`}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.title, color, fontWeight: WEIGHT.bold}}>{command}</div>
    <div style={{...TYPE.title, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{relation}</div>
  </div>
);

// @git-course-scene takeaway:start
const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const appear = (start: number) => interpolate(frame, [seconds(start), seconds(start + 0.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = appear(13.5);
  return (
    <AbsoluteFill style={{padding: '124px 176px 116px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 40}}>先找两端，再读变化</div>
      <div data-audit-id="ep09-takeaway-rows">
        <SummaryRow command="git diff" relation="Index → Working Tree" color={COLOR.git.workingTree} opacity={appear(2.7)} />
        <SummaryRow command="git diff --staged" relation="HEAD → Index" color={COLOR.git.index} opacity={appear(6.4)} />
        <SummaryRow command="git diff A B" relation="快照 A → 快照 B" color={COLOR.git.head} opacity={appear(9.8)} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 756, opacity: questionIn, transform: `translateY(${(1 - questionIn) * 10}px)`}}>
        <ComparisonQuestion left="左边是谁" right="右边是谁" />
      </div>
      <NarrationSubtitle frame={frame} cues={EP09_RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep09-takeaway-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene takeaway:end

const EP09_SCENE_COMPONENTS = {
  hook: HookScene,
  'state-map': StateMapScene,
  'terminal-working': TerminalWorkingScene,
  'unstaged-diff': UnstagedDiffScene,
  'staged-diff': StagedDiffScene,
  'commit-diff': CommitDiffScene,
  'read-patch': ReadPatchScene,
  takeaway: TakeawayScene,
};

export const Ep09DiffComparesStates: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle={EP09.seriesTitle}
      episodeTitle={EP09.title}
      scenes={EP09_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP09_RUNTIME.start('state-map')}
      showEpisodeTitle={(current) => current >= EP09_RUNTIME.start('state-map')}
    >
      <EpisodeTimeline runtime={EP09_RUNTIME} components={EP09_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
