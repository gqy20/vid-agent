import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP08} from '../data/episodes';
import {seconds} from '../timeline';
import {CodeDiff, CommandPill, CourseLayout, EpisodeTitleCard, GitStatePanel, QuestionCaption, SceneCaption, SceneSequence, type DiffLine, type GitArea} from '../kit';
import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';
export {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';
import {EP08_DURATION_IN_FRAMES, EP08_SCENES} from '../data/episodeTimelines.generated';

type Ep08SceneId = (typeof EP08_SCENES)[number]['id'];
type ResetMode = 'start' | 'soft' | 'mixed' | 'hard';

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
    <text x={x} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight="820" fill={COLOR.git.head}>
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
        <text x={c3} y={y + 76} textAnchor="middle" fontFamily={FONT.sans} fontSize="24" fontWeight="780" fill={COLOR.git.conflict}>
          wrong change
        </text>
      ) : null}
      {mode === 'revert' ? (
        <text x={r1} y={y + 76} textAnchor="middle" fontFamily={FONT.sans} fontSize="24" fontWeight="780" fill={COLOR.git.feature} opacity={revertIn}>
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
      <div style={{...TYPE.hero, fontWeight: 850, marginBottom: 54}}>撤销前，先看三棵树</div>
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

  return (
    <AbsoluteFill style={{padding: '104px 132px 112px', boxSizing: 'border-box'}}>
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
      <div style={{position: 'absolute', left: 132, top: 414, opacity: warning, transform: `translateY(${(1 - warning) * 10}px)`, padding: '14px 18px', borderRadius: 8, border: `1px solid ${COLOR.git.conflict}`, background: 'rgba(182,78,69,0.08)', ...TYPE.ui, color: COLOR.git.conflict, fontWeight: 820}}>
        hard 会覆盖 Working Tree
      </div>
      <SceneCaption opacity={1} width={1080} bottom={58} auditId="ep08-reset-caption">
        {caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const RevertScene: React.FC = () => {
  const frame = useSceneFrame();
  const commandIn = interpolate(frame, [seconds(7.5), seconds(8.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const create = interpolate(frame, [seconds(18), seconds(26)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = frame < seconds(18) ? 'revert 不删除 C3，也不回退 main' : '它新增 R1，用反向修改抵消 C3';
  const captionIn = interpolate(frame, [seconds(2), seconds(2.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: '50%', top: 268, width: 1110, transform: 'translateX(-50%)'}}>
        <HistoryGraph mode="revert" width={1110} progress={create} />
      </div>
      <div style={{opacity: commandIn}}>
        <CommandPill command="git revert C3" branch="main" />
      </div>
      <div style={{position: 'absolute', left: 138, top: 662, width: 540, opacity: create}}>
        <CodeDiff
          title="R1 applies inverse patch"
          lines={[
            {type: 'remove', text: 'enable experimental payment'},
            {type: 'add', text: 'disable experimental payment'},
          ]}
        />
      </div>
      <SceneCaption opacity={captionIn} width={1020} bottom={86} auditId="ep08-revert-caption">
        {caption}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const RestoreScene: React.FC = () => {
  const frame = useSceneFrame();
  const copy = interpolate(frame, [seconds(8), seconds(18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(20), seconds(21)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = frame < seconds(20) ? 'restore 把文件从 HEAD 恢复到 Working Tree' : 'branch 和 HEAD 保持不动';
  const dirtyDiff: DiffLine[] = [
    {type: 'context', text: 'function pay() {'},
    {type: 'remove', text: '  return stableCheckout();'},
    {type: 'add', text: '  return brokenCheckout();'},
    {type: 'context', text: '}'},
  ];
  const cleanDiff: DiffLine[] = [
    {type: 'context', text: 'function pay() {'},
    {type: 'add', text: '  return stableCheckout();'},
    {type: 'context', text: '}'},
  ];

  return (
    <AbsoluteFill style={{padding: '112px 142px 110px', boxSizing: 'border-box'}}>
      <CommandPill command="git restore app.js" branch="main" />
      <div style={{position: 'absolute', left: 160, top: 250, width: 560}}>
        <CodeDiff title="Working Tree / app.js" lines={frame < seconds(16) ? dirtyDiff : cleanDiff} />
      </div>
      <div style={{position: 'absolute', right: 188, top: 248, width: 500}}>
        <div style={{...TYPE.title, color: COLOR.git.main, marginBottom: 22}}>source: HEAD</div>
        <div style={{borderRadius: 8, border: `1px solid ${COLOR.stroke.soft}`, background: COLOR.canvas.raised, padding: '28px 34px', boxShadow: `0 16px 42px ${COLOR.effects.shadowSoft}`}}>
          <div style={{fontFamily: FONT.mono, ...TYPE.code, color: COLOR.text.primary}}>app.js  v3</div>
          <div style={{...TYPE.ui, color: COLOR.text.secondary, marginTop: 12}}>last committed content</div>
        </div>
      </div>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <path d={`M1240 470 C1050 470 ${930 - copy * 210} 470 ${776} 470`} fill="none" stroke={COLOR.git.main} strokeWidth="7" strokeLinecap="round" strokeDasharray="18 16" opacity={copy} />
      </svg>
      <div style={{position: 'absolute', right: 168, bottom: 176, width: 560, opacity: graphIn}}>
        <HistoryGraph mode="stable" width={560} small showHead />
      </div>
      <SceneCaption opacity={1} width={1040} bottom={62} auditId="ep08-restore-caption">
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
      <div style={{...TYPE.hero, fontWeight: 850, marginBottom: 52}}>先问目标，再选命令</div>
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
              <div style={{...TYPE.subtitle, color: COLOR.text.primary, fontWeight: 760}}>{row.target}</div>
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
      <div style={{...TYPE.hero, fontWeight: 850, marginBottom: 64}}>第一季收束</div>
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
