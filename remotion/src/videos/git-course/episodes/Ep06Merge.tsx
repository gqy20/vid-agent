import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP06} from '../data/episodes';
import {seconds} from '../timeline';
import {
  CodeBlock,
  CodeDiff,
  CommandPill,
  CourseLayout,
  EpisodeTitleCard,
  GitStatePanel,
  ManimClip,
  SceneCaption,
  SceneSequence,
  type DiffLine,
} from '../kit';
import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';

export const EP06_SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
  {id: 'fast-forward', title: '快进', duration: seconds(30)},
  {id: 'diverged', title: '分叉', duration: seconds(26)},
  {id: 'three-way', title: '三方合并', duration: seconds(40)},
  {id: 'merge-commit', title: '合并提交', duration: seconds(30)},
  {id: 'conflict', title: '冲突', duration: seconds(28)},
  {id: 'takeaway', title: '结论', duration: seconds(14)},
] as const;

export const EP06_DURATION_IN_FRAMES = EP06_SCENES.reduce((sum, scene) => sum + scene.duration, 0);

type Ep06SceneId = (typeof EP06_SCENES)[number]['id'];

const getEp06SceneStart = (id: Ep06SceneId) => {
  let cursor = 0;
  for (const scene of EP06_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP06 scene: ${id}`);
};

const getEp06SceneDuration = (id: Ep06SceneId) => {
  const scene = EP06_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP06 scene: ${id}`);
  return scene.duration;
};

const useSceneFrame = () => useCurrentFrame();

const commitX = (idx: number) => 140 + idx * 154;

const CommitNode: React.FC<{id: string; x: number; y: number; tone?: 'base' | 'main' | 'feature' | 'merge'; opacity?: number}> = ({
  id,
  x,
  y,
  tone,
  opacity = 1,
}) => {
  const stroke =
    tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : tone === 'merge' ? COLOR.git.conflict : tone === 'base' ? COLOR.git.head : COLOR.git.commit;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y + 9} r="31" fill={COLOR.effects.shadowSoft} opacity="0.52" />
      <circle cx={x} cy={y} r="28" fill={COLOR.canvas.base} stroke={stroke} strokeWidth={tone ? 6.8 : 5.4} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphNode.fontSize} fontWeight={TYPE.graphNode.fontWeight} fill={COLOR.text.primary}>
        {id}
      </text>
    </g>
  );
};

const BranchLabel: React.FC<{name: string; x: number; y: number; color: string; opacity?: number}> = ({name, x, y, color, opacity = 1}) => (
  <g opacity={opacity}>
    <path d={`M${x} ${y < 150 ? y + 24 : y - 24} C${x} ${y < 150 ? y + 50 : y - 50} ${x} ${y < 150 ? 168 : 182} ${x} ${y < 150 ? 168 : 182}`} fill="none" stroke={color} strokeWidth="4.3" strokeLinecap="round" />
    <rect x={x - 58} y={y - 24} width="116" height="48" rx="8" fill={color} />
    <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphPointer.fontSize} fontWeight={TYPE.graphPointer.fontWeight} fill={COLOR.text.inverse}>
      {name}
    </text>
  </g>
);

const HeadLabel: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={x - 49} y={y - 22} width="98" height="44" rx="22" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="2.6" />
    <circle cx={x - 28} cy={y} r="5" fill={COLOR.git.head} />
    <text x={x + 10} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight={800} fill={COLOR.git.head}>
      HEAD
    </text>
  </g>
);

const MergeGraph: React.FC<{
  mode: 'ff-before' | 'ff-after' | 'diverged' | 'merged';
  width?: number;
  progress?: number;
  showBaseLabels?: boolean;
  showParentArrows?: boolean;
  showHead?: boolean;
  small?: boolean;
}> = ({mode, width = 1120, progress = 1, showBaseLabels = false, showParentArrows = false, showHead = true, small = false}) => {
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
  const mainTargetX = mode === 'ff-before' ? c2 : mode === 'ff-after' ? ffMainX : showM1 ? m1 : c3;
  const mainTargetY = mode === 'diverged' || mode === 'merged' ? 98 : y;
  const featureTargetX = showC4 ? c4 : c3;
  const featureTargetY = showC4 ? 254 : y;
  const headX = mainTargetX + 112;
  const headY = mode === 'diverged' || mode === 'merged' ? 72 : 254;

  return (
    <svg width={width} height={small ? 280 : 380} viewBox="0 0 900 380" style={{display: 'block', overflow: 'visible'}}>
      <line x1={c0} y1={y} x2={c2} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
      {mode === 'ff-before' || mode === 'ff-after' ? (
        <line x1={c2} y1={y} x2={c3} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" opacity={mode === 'ff-before' ? 0.9 : progress} />
      ) : (
        <>
          <line x1={c2} y1={y} x2={c3} y2="98" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c2} y1={y} x2={c4} y2="254" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
        </>
      )}
      {showM1 ? (
        <>
          <line x1={c3} y1="98" x2={m1} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c4} y1="254" x2={m1} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
        </>
      ) : null}
      {showParentArrows ? (
        <>
          <path d={`M${m1 - 36} ${y - 18} C${m1 - 92} ${132} ${c3 + 38} ${105} ${c3 + 30} ${101}`} fill="none" stroke={COLOR.git.main} strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
          <path d={`M${m1 - 36} ${y + 18} C${m1 - 92} ${222} ${c4 + 38} ${247} ${c4 + 30} ${252}`} fill="none" stroke={COLOR.git.feature} strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
        </>
      ) : null}
      <CommitNode id="C0" x={c0} y={y} />
      <CommitNode id="C1" x={c1} y={y} />
      <CommitNode id="C2" x={c2} y={y} tone={showBaseLabels ? 'base' : undefined} />
      {mode === 'ff-before' || mode === 'ff-after' ? <CommitNode id="C3" x={c3} y={y} tone="feature" /> : <CommitNode id="C3" x={c3} y={98} tone="main" />}
      {showC4 ? <CommitNode id="C4" x={c4} y={254} tone="feature" /> : null}
      {showM1 ? <CommitNode id="M1" x={m1} y={y} tone="merge" /> : null}
      {mode === 'ff-before' || mode === 'ff-after' ? (
        <>
          <BranchLabel name="hotfix" x={c3} y={92} color={COLOR.git.feature} />
          <BranchLabel name="main" x={mainTargetX} y={254} color={COLOR.git.main} />
        </>
      ) : (
        <>
          <BranchLabel name="main" x={mainTargetX} y={mainTargetY - 72} color={COLOR.git.main} />
          <BranchLabel name="feature" x={featureTargetX} y={featureTargetY + 72} color={COLOR.git.feature} />
        </>
      )}
      {showHead ? <HeadLabel x={headX} y={headY} opacity={small ? 0 : 1} /> : null}
      {showBaseLabels ? (
        <>
          <text x={c2} y={y + 72} textAnchor="middle" fontFamily={FONT.sans} fontSize="24" fontWeight="760" fill={COLOR.git.head}>
            base
          </text>
          <text x={c3 + 78} y="108" fontFamily={FONT.sans} fontSize="24" fontWeight="760" fill={COLOR.git.main}>
            ours
          </text>
          <text x={c4 + 78} y="262" fontFamily={FONT.sans} fontSize="24" fontWeight="760" fill={COLOR.git.feature}>
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
  <div style={{position: 'absolute', left: x, top: y, opacity, ...TYPE.subtitle, fontWeight: 720, color: COLOR.text.primary, maxWidth: 520}}>
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
  const captionIn = interpolate(frame, [seconds(8.6), seconds(9.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
      <SceneCaption opacity={captionIn} width={960} bottom={126} auditId="ep06-hook-caption">
        merge 先看历史形状，再决定怎么合并
      </SceneCaption>
    </AbsoluteFill>
  );
};

const FastForwardScene: React.FC = () => {
  const frame = useSceneFrame();
  const motion = interpolate(frame, [seconds(12), seconds(21)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const noteIn = interpolate(frame, [seconds(7), seconds(7.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(23), seconds(24)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge hotfix" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 304, width: 1120, transform: 'translateX(-50%)'}}>
        <MergeGraph mode={motion > 0 ? 'ff-after' : 'ff-before'} width={1120} progress={motion} />
      </div>
      <SideNote x={1315} y={360} color={COLOR.git.main} opacity={noteIn}>
        main 可以沿历史走到 hotfix
      </SideNote>
      <SceneCaption opacity={captionIn} bottom={118} auditId="ep06-ff-caption">
        fast-forward：不新建 commit，只移动 main 指针
      </SceneCaption>
    </AbsoluteFill>
  );
};

const DivergedScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const commandIn = interpolate(frame, [seconds(8.2), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const labelsIn = interpolate(frame, [seconds(17.8), seconds(18.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(21.5), seconds(22.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div style={{opacity: commandIn}}>
        <CommandPill command="git merge feature" branch="main" />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 286, width: 1120, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <MergeGraph mode="diverged" width={1120} showBaseLabels={labelsIn > 0} showHead={false} />
      </div>
      <SideNote x={226} y={702} color={COLOR.git.head} opacity={labelsIn}>
        base / ours / theirs 准备进入三方合并
      </SideNote>
      <SceneCaption opacity={captionIn} bottom={118} auditId="ep06-diverged-caption">
        两边都变了，Git 不能只移动一个指针
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ThreeWayScene: React.FC = () => {
  const frame = useSceneFrame();
  const caption1 = interpolate(frame, [seconds(5), seconds(6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption2 = interpolate(frame, [seconds(22), seconds(23)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption3 = interpolate(frame, [seconds(33), seconds(34)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionText = frame < seconds(22) ? 'base 是共同祖先，ours 是当前分支，theirs 是要合进来的分支' : frame < seconds(33) ? 'Git 只自动合成它能判断的修改' : '合成结果会被写成新的 merge commit';
  const opacity = frame < seconds(22) ? caption1 : frame < seconds(33) ? caption2 : caption3;

  return (
    <AbsoluteFill style={{padding: '86px 132px 118px', boxSizing: 'border-box'}}>
      <ManimClip src="git-course/manim/ep06/three-way-merge.mp4" fit="contain" auditId="ep06-three-way-manim" />
      <SceneCaption opacity={opacity} width={1120} bottom={64} auditId="ep06-three-way-caption">
        {captionText}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const MergeCommitScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const arrowsIn = interpolate(frame, [seconds(7), seconds(13)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refIn = interpolate(frame, [seconds(15), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(23), seconds(24)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge feature" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 282, width: 1160, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <MergeGraph mode="merged" width={1160} showParentArrows={arrowsIn > 0} />
      </div>
      <div style={{position: 'absolute', left: 667, top: 732, width: 586, opacity: refIn}}>
        <CodeBlock title="commit M1" lines={['parent C3', 'parent C4', 'tree result']} highlight={[0, 1]} highlightBorderColor={COLOR.git.conflict} />
      </div>
      <SideNote x={1294} y={382} color={COLOR.git.conflict} opacity={arrowsIn}>
        M1 有两个 parent
      </SideNote>
      <SceneCaption opacity={captionIn} bottom={116} auditId="ep06-merge-commit-caption">
        历史从 M1 重新汇合，main 指向这个新提交
      </SceneCaption>
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
  const diffIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const markerIn = interpolate(frame, [seconds(8), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const diffFocus = interpolate(frame, [seconds(18.4), seconds(19.2)], [1, 0.62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const panelIn = interpolate(frame, [seconds(19.2), seconds(20.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(23), seconds(24)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '126px 156px 122px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 168, top: 210, width: 650, opacity: diffIn * diffFocus, transform: `translateY(${(1 - diffIn) * 18}px)`}}>
        <CodeDiff title="同一位置，两边都改了" lines={conflictLines} />
      </div>
      <div style={{position: 'absolute', right: 168, top: 210, width: 650, opacity: markerIn * diffFocus, transform: `translateY(${(1 - markerIn) * 18}px)`}}>
        <CodeBlock title="app.js" lines={markerLines} highlight={[0, 2, 4]} highlightBorderColor={COLOR.git.conflict} highlightBackground="rgba(182,78,69,0.11)" />
      </div>
      <div style={{position: 'absolute', left: 332, right: 332, bottom: 206, opacity: panelIn, transform: `translateY(${(1 - panelIn) * 14}px)`}}>
        <GitStatePanel
          areas={[
            {id: 'working-tree', title: 'Working Tree', files: ['app.js contains conflict markers'], active: true},
            {id: 'index', title: 'Index', files: ['unmerged paths'], active: true},
            {id: 'repository', title: 'Repository', files: ['merge commit not written']},
          ]}
        />
      </div>
      <SceneCaption opacity={captionIn} bottom={104} auditId="ep06-conflict-caption">
        冲突表示 Git 无法自动决定，同一处需要你手动选择
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const left = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const right = interpolate(frame, [seconds(5), seconds(5.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '132px 164px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: 850, marginBottom: 40}}>merge 有两种基础形态</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52}}>
        <div style={{opacity: left}}>
          <div style={{...TYPE.title, color: COLOR.git.main, marginBottom: 16}}>能快进</div>
          <MergeGraph mode="ff-after" width={710} small />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 12}}>移动 branch 指针</div>
        </div>
        <div style={{opacity: right}}>
          <div style={{...TYPE.title, color: COLOR.git.conflict, marginBottom: 16}}>已经分叉</div>
          <MergeGraph mode="merged" width={760} small showParentArrows />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 12}}>三方合并，生成 M1</div>
        </div>
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(10.5), seconds(11.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={74}>
        关键不是文件夹拼接，而是历史形状和快照合成
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep06Merge: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP06.seriesTitle}
      episodeTitle={EP06.title}
      scenes={EP06_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp06SceneStart('fast-forward')}
      showEpisodeTitle={(current) => current >= getEp06SceneStart('fast-forward')}
    >
      <SceneSequence from={getEp06SceneStart('hook')} durationInFrames={getEp06SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('fast-forward')} durationInFrames={getEp06SceneDuration('fast-forward')}>
        <FastForwardScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('diverged')} durationInFrames={getEp06SceneDuration('diverged')}>
        <DivergedScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('three-way')} durationInFrames={getEp06SceneDuration('three-way')}>
        <ThreeWayScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('merge-commit')} durationInFrames={getEp06SceneDuration('merge-commit')}>
        <MergeCommitScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('conflict')} durationInFrames={getEp06SceneDuration('conflict')}>
        <ConflictScene />
      </SceneSequence>
      <SceneSequence from={getEp06SceneStart('takeaway')} durationInFrames={getEp06SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
