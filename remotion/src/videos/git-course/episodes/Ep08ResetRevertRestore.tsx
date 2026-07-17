import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP08} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds} from '../timeline';
import {CodeDiff, CommandPill, CourseLayout, EpisodeTitleCard, GitStatePanel, QuestionCaption, RecordedTerminalPanel, SceneCaption, SceneSequence, type GitArea} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';
import {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';

type Ep08SceneId = (typeof EP08_SCENES)[number]['id'];
type ResetMode = 'start' | 'soft' | 'mixed' | 'hard';
type RestoreMode = 'index-to-worktree' | 'head-to-worktree' | 'head-to-index';

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

const useSceneFrame = () => useCurrentFrame();

const commitX = (idx: number) => 132 + idx * 154;

const CommitNode: React.FC<{id: string; x: number; y: number; tone?: 'main' | 'bad' | 'revert'; opacity?: number}> = ({id, x, y, tone, opacity = 1}) => {
  const stroke = tone === 'bad' ? COLOR.git.conflict : tone === 'revert' ? COLOR.git.feature : tone === 'main' ? COLOR.git.main : COLOR.git.commit;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y + 8} r="30" fill={COLOR.effects.shadowSoft} opacity="0.52" />
      <circle cx={x} cy={y} r="27" fill={COLOR.canvas.base} stroke={stroke} strokeWidth={tone ? 6.5 : 5.2} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphNode.fontSize} fontWeight={TYPE.graphNode.fontWeight} fill={COLOR.text.primary}>
        {id}
      </text>
    </g>
  );
};

const BranchLabel: React.FC<{name: string; x: number; y: number; color: string; opacity?: number}> = ({name, x, y, color, opacity = 1}) => (
  <g opacity={opacity}>
    <line x1={x} y1={y < 150 ? y + 23 : y - 23} x2={x} y2={y < 150 ? y + 56 : y - 56} stroke={color} strokeWidth="4" strokeLinecap="round" />
    <rect x={x - 58} y={y - 23} width="116" height="46" rx="8" fill={color} />
    <text x={x} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphPointer.fontSize} fontWeight={TYPE.graphPointer.fontWeight} fill={COLOR.text.inverse}>
      {name}
    </text>
  </g>
);

const HeadBadge: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x - 48} y={y - 21} width="96" height="42" rx="21" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="2.6" />
    <text x={x} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
      HEAD
    </text>
  </g>
);

const HistoryGraph: React.FC<{
  mode: 'bad' | 'reset' | 'revert' | 'stable';
  width?: number;
  progress?: number;
  showHead?: boolean;
  small?: boolean;
}> = ({mode, width = 900, progress = 1, showHead = true, small = false}) => {
  const y = 158;
  const c1 = commitX(0);
  const c2 = commitX(1);
  const c3 = commitX(2);
  const r1 = commitX(3);
  const resetX = interpolate(progress, [0, 1], [c3, c2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const revertIn = mode === 'revert' ? progress : 0;
  const mainX = mode === 'reset' ? resetX : mode === 'revert' ? interpolate(progress, [0, 1], [c3, r1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : c3;

  return (
    <svg width={width} height={small ? 250 : 330} viewBox="0 0 720 330" style={{display: 'block', overflow: 'visible'}}>
      <line x1={c1} y1={y} x2={c3} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
      {mode === 'revert' ? <line x1={c3} y1={y} x2={r1} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" opacity={revertIn} /> : null}
      <CommitNode id="C1" x={c1} y={y} />
      <CommitNode id="C2" x={c2} y={y} tone={mode === 'reset' ? 'main' : undefined} />
      <CommitNode id="C3" x={c3} y={y} tone={mode === 'bad' || mode === 'revert' ? 'bad' : undefined} opacity={mode === 'reset' ? 0.32 : 1} />
      {mode === 'revert' ? <CommitNode id="R1" x={r1} y={y} tone="revert" opacity={revertIn} /> : null}
      <BranchLabel name="main" x={mainX} y={78} color={COLOR.git.main} />
      {showHead ? <HeadBadge x={mainX + 114} y={78} /> : null}
      {mode === 'bad' || mode === 'revert' ? (
        <text x={c3} y={y + 76} textAnchor="middle" fontFamily={FONT.sans} fontSize="24" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
          wrong change
        </text>
      ) : null}
      {mode === 'revert' ? (
        <text x={r1} y={y + 76} textAnchor="middle" fontFamily={FONT.sans} fontSize="24" fontWeight={WEIGHT.bold} fill={COLOR.git.feature} opacity={revertIn}>
          inverse commit
        </text>
      ) : null}
    </svg>
  );
};

const resetAreas = (mode: ResetMode): GitArea[] => {
  const active: Record<ResetMode, GitArea['id']> = {
    start: 'repository',
    soft: 'repository',
    mixed: 'index',
    hard: 'working-tree',
  };
  const headVersion = mode === 'start' ? 'HEAD -> C3 / snapshot v3' : 'HEAD -> C2 / snapshot v2';
  const indexVersion = mode === 'mixed' || mode === 'hard' ? 'app.js  v2' : 'app.js  v3 staged';
  const workingVersion = mode === 'hard' ? 'app.js  v2' : mode === 'start' ? 'app.js  v3 dirty' : 'app.js  v3 dirty';
  return [
    {id: 'repository', title: 'HEAD / Repository', files: [headVersion, mode === 'start' ? 'main -> C3' : 'main -> C2'], active: active[mode] === 'repository'},
    {id: 'index', title: 'Index', files: [indexVersion, mode === 'mixed' ? 'unstaged change remains' : 'ready for next commit'], active: active[mode] === 'index'},
    {id: 'working-tree', title: 'Working Tree', files: [workingVersion, mode === 'hard' ? 'dirty work overwritten' : 'local edits still here'], active: active[mode] === 'working-tree'},
  ];
};

const TreesBoard: React.FC<{mode: ResetMode; opacity?: number}> = ({mode, opacity = 1}) => (
  <div style={{opacity}}>
    <GitStatePanel areas={resetAreas(mode)} />
  </div>
);

const restoreAreas = (mode: RestoreMode): GitArea[] => {
  if (mode === 'index-to-worktree') {
    return [
      {id: 'repository', title: 'HEAD / Repository', files: ['app.js  v1', 'branch unchanged']},
      {id: 'index', title: 'Index · source', files: ['app.js  v2 staged'], active: true},
      {id: 'working-tree', title: 'Working Tree · target', files: ['v3 working -> v2 staged'], active: true},
    ];
  }
  if (mode === 'head-to-worktree') {
    return [
      {id: 'repository', title: 'HEAD · source', files: ['app.js  v1 committed'], active: true},
      {id: 'index', title: 'Index', files: ['app.js  v2 staged']},
      {id: 'working-tree', title: 'Working Tree · target', files: ['v2 staged -> v1 committed'], active: true},
    ];
  }
  return [
    {id: 'repository', title: 'HEAD · source', files: ['app.js  v1 committed'], active: true},
    {id: 'index', title: 'Index · target', files: ['v2 staged -> v1 committed'], active: true},
    {id: 'working-tree', title: 'Working Tree', files: ['app.js  v1 unchanged']},
  ];
};

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.7), seconds(2.15)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.3), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(8.1), seconds(8.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
      <div style={{position: 'absolute', left: '50%', top: 282, width: 1040, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <HistoryGraph mode="bad" width={1040} />
      </div>
      <QuestionCaption opacity={questionIn} auditId="ep08-hook-question">
        你要改哪一层？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

const ThreeTreesScene: React.FC = () => {
  const frame = useSceneFrame();
  const repoIn = interpolate(frame, [seconds(0.4), seconds(1.1)], [0, 1], {extrapolateRight: 'clamp'});
  const indexIn = interpolate(frame, [seconds(8), seconds(8.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wtIn = interpolate(frame, [seconds(16), seconds(16.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(24), seconds(24.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const areas: GitArea[] = [
    {id: 'repository', title: 'HEAD / Repository', files: ['当前提交快照', 'main -> C3'], active: frame < seconds(8)},
    {id: 'index', title: 'Index', files: ['下一次提交的准备区', 'app.js staged v3'], active: frame >= seconds(8) && frame < seconds(16)},
    {id: 'working-tree', title: 'Working Tree', files: ['正在编辑的文件', 'app.js dirty v3'], active: frame >= seconds(16)},
  ];

  return (
    <AbsoluteFill style={{padding: '136px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 54}}>撤销前，先看三棵树</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, width: '100%'}}>
        <div style={{opacity: repoIn}}><GitStatePanel areas={[areas[0]]} /></div>
        <div style={{opacity: indexIn}}><GitStatePanel areas={[areas[1]]} /></div>
        <div style={{opacity: wtIn}}><GitStatePanel areas={[areas[2]]} /></div>
      </div>
      <SceneCaption opacity={captionIn} bottom={82} auditId="ep08-trees-caption">
        命令不同，本质是改不同对象
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ResetModesScene: React.FC = () => {
  const frame = useSceneFrame();
  const move = interpolate(frame, [seconds(1.4), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mixedIn = interpolate(frame, [seconds(22), seconds(23)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hardIn = interpolate(frame, [seconds(34), seconds(35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mode: ResetMode = frame < seconds(22) ? 'soft' : frame < seconds(34) ? 'mixed' : 'hard';
  const command = frame < seconds(22) ? 'git reset --soft HEAD~' : frame < seconds(34) ? 'git reset HEAD~' : 'git reset --hard HEAD~';
  const caption = frame < seconds(22) ? 'soft：只移动 HEAD 所在的 branch' : frame < seconds(34) ? 'mixed：再让 Index 对齐新的 HEAD' : 'hard：继续覆盖 Working Tree，未保存工作会丢失';
  const warning = interpolate(frame, [seconds(32.8), seconds(33.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hardPause = frame >= seconds(32.8) && frame < seconds(35);
  const initialModelIn = interpolate(frame, [seconds(4.2), seconds(5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mixedFocusOut = interpolate(frame, [seconds(21.2), seconds(22)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mixedModelIn = interpolate(frame, [seconds(26), seconds(26.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hardFocusOut = interpolate(frame, [seconds(33.2), seconds(34)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hardModelIn = interpolate(frame, [seconds(38.4), seconds(39.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelOpacity =
    frame < seconds(22)
      ? initialModelIn * mixedFocusOut
      : frame < seconds(34)
        ? mixedModelIn * hardFocusOut
        : hardModelIn;
  const terminalStyle = {position: 'absolute', left: 250, top: 156, width: 1420, height: 768} as const;

  return (
    <AbsoluteFill style={{padding: '104px 132px 112px', boxSizing: 'border-box'}}>
      <div style={{opacity: modelOpacity}}>
        <CommandPill command={command} branch="main" />
        <div style={{position: 'absolute', left: 150, top: 168, width: 670}}>
          <HistoryGraph mode="reset" width={670} progress={move} small />
        </div>
        <div style={{position: 'absolute', right: 138, top: 184, display: 'flex', gap: 18, opacity: hardPause ? 0.55 : 1}}>
          {[
            {label: '1 branch', active: true, color: COLOR.git.main},
            {label: '2 index', active: frame >= seconds(22), color: COLOR.git.head},
            {label: '3 working tree', active: frame >= seconds(34), color: COLOR.git.workingTree},
          ].map((step) => (
            <div key={step.label} style={{...TYPE.ui, padding: '13px 18px', borderRadius: 8, border: `1px solid ${step.active ? step.color : COLOR.stroke.soft}`, color: step.active ? COLOR.text.primary : COLOR.text.tertiary, background: step.active ? COLOR.canvas.raised : COLOR.canvas.soft}}>
              {step.label}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 132, right: 132, top: 500, opacity: hardPause ? 0.52 : mode === 'soft' ? 1 : mode === 'mixed' ? mixedIn : hardIn}}>
          <TreesBoard mode={mode} />
        </div>
        <div style={{position: 'absolute', left: 132, top: 414, opacity: warning, transform: `translateY(${(1 - warning) * 10}px)`, padding: '14px 18px', borderRadius: 8, border: `1px solid ${COLOR.git.conflict}`, background: 'rgba(182,78,69,0.08)', ...TYPE.ui, color: COLOR.git.conflict, fontWeight: WEIGHT.bold}}>
          hard 会覆盖 Working Tree
        </div>
      </div>
      <SceneSequence from={0} durationInFrames={seconds(5)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-soft-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-soft.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-soft-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-soft'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <SceneSequence from={seconds(22)} durationInFrames={seconds(5)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-mixed-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-mixed.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-mixed-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-mixed'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <SceneSequence from={seconds(34)} durationInFrames={seconds(5.5)}>
        <div style={terminalStyle} data-audit-id="ep08-reset-hard-terminal">
          <RecordedTerminalPanel src="git-course-lab/terminal/ep08-reset-hard.mp4" holdFrameSrc="git-course-lab/terminal/ep08-reset-hard-hold.png" holdFromFrame={TERMINAL_RECORDINGS['ep08-reset-hard'].holdFromFrame} playbackRate={1.6} mediaFit="cover" />
        </div>
      </SceneSequence>
      <SceneCaption opacity={modelOpacity} width={1080} bottom={58} auditId="ep08-reset-caption">
        {caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const RevertScene: React.FC = () => {
  const frame = useSceneFrame();
  const modelIn = interpolate(frame, [seconds(4.6), seconds(5.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const create = interpolate(frame, [seconds(18), seconds(26)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = frame < seconds(18) ? 'revert 不删除 C3，也不回退 main' : '它新增 R1，用反向修改抵消 C3';
  const captionIn = interpolate(frame, [seconds(2), seconds(2.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: '50%', top: 268, width: 1110, transform: 'translateX(-50%)', opacity: modelIn}}>
        <HistoryGraph mode="revert" width={1110} progress={create} />
      </div>
      <div style={{opacity: modelIn}}>
        <CommandPill command="git revert C3" branch="main" />
      </div>
      <div style={{position: 'absolute', left: 138, top: 662, width: 540, opacity: create * modelIn}}>
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
      <SceneCaption opacity={captionIn * modelIn} width={1020} bottom={86} auditId="ep08-revert-caption">
        {caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const RestoreScene: React.FC = () => {
  const frame = useSceneFrame();
  const recording = TERMINAL_RECORDINGS['ep08-restore-flow'];
  const terminalOut = interpolate(frame, [seconds(9), seconds(10.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const modelIn = interpolate(frame, [seconds(9.4), seconds(10.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mode: RestoreMode = frame < seconds(20) ? 'index-to-worktree' : frame < seconds(30) ? 'head-to-worktree' : 'head-to-index';
  const command = mode === 'index-to-worktree' ? 'git restore app.js' : mode === 'head-to-worktree' ? 'git restore --source=HEAD app.js' : 'git restore --staged app.js';
  const relation = mode === 'index-to-worktree' ? '默认：Index -> Working Tree' : mode === 'head-to-worktree' ? '显式来源：HEAD -> Working Tree' : '--staged：HEAD -> Index';
  const caption = mode === 'index-to-worktree' ? '不写 source 时，Working Tree 默认从 Index 恢复' : mode === 'head-to-worktree' ? '写明 source=HEAD，才从提交快照恢复文件' : '加 --staged，目标改为 Index；branch 和 HEAD 始终不动';
  const bothTargetsIn = interpolate(frame, [seconds(36), seconds(37)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 142px 110px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 250, top: 156, width: 1420, height: 768, opacity: terminalOut}} data-audit-id="ep08-restore-terminal-recording">
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep08-restore-flow.mp4"
          holdFrameSrc="git-course-lab/terminal/ep08-restore-flow-hold.png"
          holdFromFrame={recording.holdFromFrame}
          playbackRate={1.5}
          mediaFit="cover"
        />
      </div>
      <div style={{opacity: modelIn}}>
        <CommandPill command={command} branch="main" />
        <div style={{position: 'absolute', left: 150, right: 150, top: 310}}>
          <div style={{textAlign: 'center', ...TYPE.title, color: COLOR.text.primary, fontWeight: WEIGHT.bold, marginBottom: 34}}>{relation}</div>
          <GitStatePanel areas={restoreAreas(mode)} />
        </div>
        <div style={{position: 'absolute', left: '50%', top: 716, transform: 'translateX(-50%)', opacity: bothTargetsIn, ...TYPE.ui, color: COLOR.text.secondary}}>
          同时指定 --staged --worktree，才会让两个目标从同一 source 恢复
        </div>
      </div>
      <SceneCaption opacity={modelIn} width={1180} bottom={62} auditId="ep08-restore-caption">
        {caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ChooseScene: React.FC = () => {
  const frame = useSceneFrame();
  const rows = [
    {name: 'reset', target: '本地历史', changes: '移动 branch，按模式同步三棵树', color: COLOR.git.main, active: frame < seconds(8)},
    {name: 'revert', target: '共享历史', changes: '新增反向提交，旧历史保留', color: COLOR.git.feature, active: frame >= seconds(8) && frame < seconds(15)},
    {name: 'restore', target: '文件内容', changes: '恢复 Index 或 Working Tree 文件', color: COLOR.git.workingTree, active: frame >= seconds(15)},
  ];

  return (
    <AbsoluteFill style={{padding: '136px 170px 110px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 52}}>先问目标，再选命令</div>
      <div style={{display: 'grid', gap: 18}}>
        {rows.map((row, idx) => {
          const appear = interpolate(frame, [seconds(idx * 2), seconds(idx * 2 + 0.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <div
              key={row.name}
              style={{
                opacity: appear,
                display: 'grid',
                gridTemplateColumns: '220px 270px 1fr',
                alignItems: 'center',
                gap: 28,
                minHeight: 112,
                padding: '0 30px',
                borderRadius: 8,
                border: `2px solid ${row.active ? row.color : COLOR.stroke.soft}`,
                background: row.active ? COLOR.canvas.raised : 'rgba(255,255,255,0.54)',
                boxShadow: row.active ? `0 18px 48px ${COLOR.effects.shadowSoft}` : undefined,
              }}
            >
              <div style={{fontFamily: FONT.mono, ...TYPE.title, color: row.color}}>{row.name}</div>
              <div style={{...TYPE.subtitle, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{row.target}</div>
              <div style={{...TYPE.body, color: COLOR.text.secondary}}>{row.changes}</div>
            </div>
          );
        })}
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(17.8), seconds(18.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={60} auditId="ep08-choose-caption">
        同样叫撤销，改的对象完全不同
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const rows = [
    {text: 'reset：改引用和三棵树', color: COLOR.git.main, opacity: interpolate(frame, [0, seconds(0.7)], [0, 1], {extrapolateRight: 'clamp'})},
    {text: 'revert：写新提交', color: COLOR.git.feature, opacity: interpolate(frame, [seconds(3.6), seconds(4.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})},
    {text: 'restore：改文件状态', color: COLOR.git.workingTree, opacity: interpolate(frame, [seconds(7.2), seconds(7.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})},
  ];

  return (
    <AbsoluteFill style={{padding: '170px 250px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 64}}>第一季收束</div>
      <div style={{display: 'grid', gap: 30}}>
        {rows.map((row) => (
          <div key={row.text} style={{opacity: row.opacity, display: 'flex', alignItems: 'center', gap: 22, ...TYPE.title, color: COLOR.text.primary}}>
            <span style={{width: 18, height: 18, borderRadius: 999, background: row.color, display: 'inline-block'}} />
            {row.text}
          </div>
        ))}
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(10.2), seconds(11)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={82} auditId="ep08-takeaway-caption">
        Git 命令很多，核心都是在改对象和状态
      </SceneCaption>
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
      <SceneSequence from={getEp08SceneStart('hook')} durationInFrames={getEp08SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('three-trees')} durationInFrames={getEp08SceneDuration('three-trees')}>
        <ThreeTreesScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('reset-modes')} durationInFrames={getEp08SceneDuration('reset-modes')}>
        <ResetModesScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('revert')} durationInFrames={getEp08SceneDuration('revert')}>
        <RevertScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('restore')} durationInFrames={getEp08SceneDuration('restore')}>
        <RestoreScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('choose')} durationInFrames={getEp08SceneDuration('choose')}>
        <ChooseScene />
      </SceneSequence>
      <SceneSequence from={getEp08SceneStart('takeaway')} durationInFrames={getEp08SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
