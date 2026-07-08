import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP04} from '../data/episodes';
import {EP04_TERMINAL, type GitCourseState} from '../data/terminalScripts';
import {seconds} from '../timeline';
import {
  BranchPointerHookGraph,
  BranchRefMentalModelGraph,
  CenterGraph,
  CommandPill,
  CourseLayout,
  EpisodeTitleCard,
  GitGraph,
  SceneCaption,
  MiniRefLine,
  MotionTitle,
  PositionedMotion,
  RefWrite,
  RefWriteBar,
  SceneSequence,
  SideLabel,
  StrikeThrough,
  SvgArrowLine,
  TerminalFocusScene,
  WorkingTreeCard,
  type GitGraphState,
} from '../kit';
import {COLOR} from '../palette';
import {TYPE} from '../typography';

export const EP04_SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
  {id: 'mental-model', title: '模型', duration: seconds(18)},
  {id: 'terminal', title: '命令', duration: seconds(18)},
  {id: 'branch-write', title: '写入 ref', duration: seconds(22)},
  {id: 'branch-result', title: '分支出现', duration: seconds(28)},
  {id: 'switch', title: 'HEAD 切换', duration: seconds(24)},
  {id: 'commit', title: 'feature 前进', duration: seconds(32)},
  {id: 'compare', title: '对比', duration: seconds(14)},
  {id: 'takeaway', title: '结论', duration: seconds(12)},
] as const;

export const EP04_DURATION_IN_FRAMES = EP04_SCENES.reduce((sum, scene) => sum + scene.duration, 0);

type Ep04SceneId = (typeof EP04_SCENES)[number]['id'];

const getEp04SceneStart = (id: Ep04SceneId) => {
  let cursor = 0;
  for (const scene of EP04_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP04 scene: ${id}`);
};

const getEp04SceneDuration = (id: Ep04SceneId) => {
  const scene = EP04_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP04 scene: ${id}`);
  return scene.duration;
};

const graphState = (state: GitCourseState): GitGraphState => ({
  commits: state.commits.map((commit) => ({id: commit})),
  branches: [
    {name: 'main', target: state.main, lane: 'bottom', active: state.headBranch === 'main'},
    ...(state.feature ? [{name: 'feature', target: state.feature, lane: 'top' as const, active: state.headBranch === 'feature'}] : []),
  ],
  head: {target: state.headBranch === 'main' ? state.main : state.feature ?? state.main, branch: state.headBranch},
});

const STATES = {
  base: {main: 'C2', headBranch: 'main', commits: ['C0', 'C1', 'C2']} satisfies GitCourseState,
  withFeature: {main: 'C2', feature: 'C2', headBranch: 'main', commits: ['C0', 'C1', 'C2']} satisfies GitCourseState,
  switched: {main: 'C2', feature: 'C2', headBranch: 'feature', commits: ['C0', 'C1', 'C2']} satisfies GitCourseState,
  committed: {main: 'C2', feature: 'C3', headBranch: 'feature', commits: ['C0', 'C1', 'C2', 'C3']} satisfies GitCourseState,
};

const useSceneFrame = () => useCurrentFrame();

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.72), seconds(2.12)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleOpacity = titleIn * titleOut;
  const titleY = interpolate(frame, [0, seconds(0.55)], [18, -46], {extrapolateRight: 'clamp'});
  const branchAccent = interpolate(frame, [seconds(0.28), seconds(0.78)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const branchY = interpolate(frame, [seconds(0.28), seconds(0.78)], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const branchUnderlineScale = interpolate(frame, [seconds(0.5), seconds(0.96)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const branchUnderlineOpacity = interpolate(frame, [seconds(0.5), seconds(1.45)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphOpacity = interpolate(frame, [seconds(2.05), seconds(2.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphY = interpolate(frame, [seconds(2.05), seconds(2.45)], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionOpacity = interpolate(frame, [seconds(9.55), seconds(10.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionY = interpolate(frame, [seconds(9.55), seconds(10.25)], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="4."
        keyword="Branch"
        suffix="只是一个指针"
        opacity={titleOpacity}
        translateY={titleY}
        keywordOpacity={0.45 + branchAccent * 0.55}
        keywordTranslateY={branchY}
        underlineScale={branchUnderlineScale}
        underlineOpacity={branchUnderlineOpacity * 0.82}
        auditId="hook-episode-title"
      />
      <PositionedMotion
        x={400}
        y={96}
        width={1080}
        opacity={graphOpacity}
        translateY={graphY}
        auditId="hook-graph-frame"
      >
        <BranchPointerHookGraph />
      </PositionedMotion>
      <SceneCaption opacity={questionOpacity} width={980} fontSize={35} bottom={126} translateY={questionY} auditId="hook-caption">
        如果只是一个名字，切换分支到底改变了什么？
      </SceneCaption>
    </AbsoluteFill>
  );
};

const MentalModelScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleShift = interpolate(frame, [seconds(3.9), seconds(5.1)], [0, -34], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const firstTitleOut = interpolate(frame, [seconds(3.9), seconds(4.65)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const secondTitleIn = interpolate(frame, [seconds(4.55), seconds(5.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainTreeIn = interpolate(frame, [seconds(0.35), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clone = interpolate(frame, [seconds(1.15), seconds(2.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cloneFade = interpolate(frame, [seconds(3.45), seconds(4.55)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const wrongExit = interpolate(frame, [seconds(4.25), seconds(5.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const strike = interpolate(frame, [seconds(2.75), seconds(3.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(5.2), seconds(6.05)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainAttach = interpolate(frame, [seconds(7.55), seconds(8.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refWrite = interpolate(frame, [seconds(8.95), seconds(10.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const featureDrop = interpolate(frame, [seconds(10.2), seconds(11.55)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refPanelOut = interpolate(frame, [seconds(12.7), seconds(13.35)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const summaryIn = interpolate(frame, [seconds(13.35), seconds(14.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c2Pulse = interpolate(frame, [seconds(14.15), seconds(14.85), seconds(15.8)], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mainTreeX = interpolate(clone, [0, 1], [310, 250]);
  const cloneX = interpolate(clone, [0, 1], [840, 890]);
  const treeScale = interpolate(wrongExit, [0, 1], [1, 0.55]);
  const treeY = interpolate(wrongExit, [0, 1], [318, 388]);
  const treeOpacity = mainTreeIn * interpolate(wrongExit, [0, 0.82, 1], [1, 0.08, 0]);
  const ghostOpacity = clone * cloneFade * interpolate(wrongExit, [0, 1], [0.48, 0]);
  const graphLift = interpolate(refWrite, [0.25, 0.75], [0, -38], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * refPanelOut;
  const refWriteOpacity = interpolate(refWrite, [0.26, 0.52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }) * refPanelOut;
  const refText = 'refs/heads/feature -> C2';

  return (
    <AbsoluteFill style={{padding: '96px 150px 116px', boxSizing: 'border-box'}}>
      <MotionTitle opacity={titleIn * firstTitleOut} translateY={titleShift} auditId="mental-title-wrong">
        不是复制一份目录
      </MotionTitle>
      <div
        style={{
          position: 'absolute',
          left: mainTreeX,
          top: treeY,
          width: 520,
          height: 320,
          opacity: treeOpacity,
          transform: `scale(${treeScale})`,
          transformOrigin: 'left center',
        }}
      >
        <WorkingTreeCard label="main 工作区" opacity={0.96} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: cloneX,
          top: 318,
          width: 520,
          height: 320,
          opacity: ghostOpacity,
          transform: `scale(${interpolate(clone, [0, 1], [0.94, 1])})`,
          transformOrigin: 'left center',
        }}
      >
        <WorkingTreeCard label="feature 工作区？" opacity={1} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g opacity={clone * cloneFade * (1 - wrongExit)}>
          <SvgArrowLine
            x1={640}
            y1={478}
            x2={860}
            y2={478}
            progress={clone}
            color={COLOR.git.conflict}
            width={8}
            opacity={0.68}
          />
          <StrikeThrough
            x1={760}
            y1={292}
            x2={1198}
            y2={680}
            progress={strike}
            label="不是这样"
            labelX={1240}
            labelY={294}
          />
        </g>
      </svg>
      <MotionTitle opacity={secondTitleIn} translateY={interpolate(secondTitleIn, [0, 1], [18, 0])} auditId="mental-title-correct">
        真正发生的是：多写一个名字
      </MotionTitle>
      <BranchRefMentalModelGraph
        opacity={graphIn}
        mainAttach={mainAttach}
        featureDrop={featureDrop}
        c2Pulse={c2Pulse}
        liftY={graphLift}
      />
      <RefWrite
        text={refText}
        progress={refWrite}
        opacity={refWriteOpacity}
        x={574}
        y={826}
        accentUntil={'refs/heads/feature'.length}
        auditId="mental-ref-write"
      />
      <SceneCaption
        opacity={summaryIn}
        width={1060}
        fontSize={35}
        bottom={126}
        translateY={interpolate(summaryIn, [0, 1], [18, 0])}
        auditId="mental-summary"
      >
        branch 是一个 ref。它可以和 main 指向同一个 commit。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => <TerminalFocusScene steps={EP04_TERMINAL} frameOffset={getEp04SceneStart('terminal')} />;

const BranchWriteScene: React.FC = () => {
  const frame = useSceneFrame();
  const refProgress = interpolate(frame, [seconds(4.73), seconds(7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git branch feature" branch="main" />
      <CenterGraph state={graphState(STATES.base)} top={374} width={980} />
      <RefWriteBar refName="refs/heads/feature" target="C2" progress={refProgress} x={676} y={744} auditId="branch-write-ref-bar" />
      <SideLabel x={1235} y={748} tone="feature">
        Git 写入一条 ref。
      </SideLabel>
    </AbsoluteFill>
  );
};

const BranchResultScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(1.27), seconds(3.87)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const state = progress < 0.5 ? STATES.base : STATES.withFeature;
  return (
    <AbsoluteFill>
      <CommandPill command="git branch feature" branch="main" top={128} />
      <CenterGraph state={graphState(state)} top={338} width={1140} />
      <MiniRefLine line="feature -> C2" top={730} left={700} />
      <SideLabel x={1280} y={370} tone="feature">
        feature 落到 C2。
      </SideLabel>
      <SideLabel x={230} y={710} tone="main">
        main 仍然也在 C2。
      </SideLabel>
      <div style={{position: 'absolute', left: 655, top: 875, ...TYPE.body, color: COLOR.text.secondary}}>
        创建分支不是复制历史，而是让两个名字暂时指向同一个提交。
      </div>
    </AbsoluteFill>
  );
};

const SwitchScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(3.67), seconds(7.93)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git switch feature" branch="main" />
      <CenterGraph state={graphState(STATES.switched)} top={350} width={1130} headMotion={{from: 'main', to: 'feature', progress}} headMarkerOffsetX={118} />
      <MiniRefLine title=".git/HEAD" line="HEAD -> feature" top={736} left={700} />
      <SideLabel x={1360} y={420} tone="head">
        HEAD 从 main 滑到 feature。
      </SideLabel>
      <SideLabel x={220} y={690} tone="main">
        commit 没变，变的是“当前所在分支”。
      </SideLabel>
    </AbsoluteFill>
  );
};

const CommitScene: React.FC = () => {
  const frame = useSceneFrame();
  const commitIn = interpolate(frame, [seconds(3.47), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [seconds(6.27), seconds(9.53)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const state = commitIn < 0.55 ? STATES.switched : STATES.committed;
  return (
    <AbsoluteFill>
      <CommandPill command={'git commit -m "try new header"'} branch="feature" />
      <CenterGraph
        state={graphState(state)}
        top={344}
        width={1160}
        branchMotion={state.feature === 'C3' ? {name: 'feature', from: 'C2', to: 'C3', progress: pointer} : undefined}
        headMarkerOffsetX={118}
      />
      <MiniRefLine line="feature -> C3" top={742} left={700} />
      <SideLabel x={1360} y={278} tone="feature">
        新 commit 生成后，feature 前进。
      </SideLabel>
      <SideLabel x={230} y={665} tone="main">
        main 停在 C2，这就是分叉。
      </SideLabel>
      <div style={{position: 'absolute', left: 652, top: 888, ...TYPE.body, color: COLOR.text.secondary}}>
        分支不是一份代码副本，而是一个会移动的名字。
      </div>
    </AbsoluteFill>
  );
};

const CompareScene: React.FC = () => (
  <AbsoluteFill style={{padding: '160px 170px 120px', boxSizing: 'border-box'}}>
    <div style={{...TYPE.hero, fontSize: 62}}>同一个历史，不同的名字</div>
    <div style={{position: 'absolute', left: 210, top: 412, width: 620}}>
      <GitGraph state={graphState(STATES.withFeature)} width={620} height={250} />
      <div style={{...TYPE.subtitle, color: COLOR.text.secondary, marginTop: 34}}>刚创建：main 和 feature 都指向 C2</div>
    </div>
    <div style={{position: 'absolute', right: 210, top: 412, width: 680}}>
      <GitGraph state={graphState(STATES.committed)} width={680} height={265} />
      <div style={{...TYPE.subtitle, color: COLOR.text.secondary, marginTop: 34}}>提交后：只有 feature 前进到 C3</div>
    </div>
  </AbsoluteFill>
);

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const state = frame < seconds(3.93) ? STATES.withFeature : frame < seconds(7.87) ? STATES.switched : STATES.committed;
  return (
    <AbsoluteFill style={{padding: '168px 170px 130px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: 850}}>
        Branch 是名字，
        <br />
        名字会移动。
      </div>
      <div style={{position: 'absolute', right: 230, top: 350, width: 760}}>
        <GitGraph state={graphState(state)} width={760} height={306} />
      </div>
      <div style={{position: 'absolute', left: 176, bottom: 166, display: 'grid', gap: 16}}>
        {['创建 feature：新增名字', '切换 feature：HEAD 改指向', '提交一次：feature 前进'].map((line, idx) => (
          <div key={line} style={{...TYPE.subtitle, color: idx === 2 ? COLOR.text.primary : COLOR.text.secondary, fontWeight: idx === 2 ? 760 : 560}}>
            <span
              style={{
                display: 'inline-block',
                width: 28,
                height: 28,
                marginRight: 16,
                borderRadius: 999,
                background: idx === 2 ? COLOR.git.head : COLOR.stroke.default,
                verticalAlign: -3,
              }}
            />
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Ep04BranchIsPointer: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP04.seriesTitle}
      episodeTitle={EP04.title}
      scenes={EP04_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp04SceneStart('terminal')}
      showEpisodeTitle={(current) => current >= getEp04SceneStart('terminal')}
    >
      <SceneSequence from={getEp04SceneStart('hook')} durationInFrames={getEp04SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('mental-model')} durationInFrames={getEp04SceneDuration('mental-model')}>
        <MentalModelScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('terminal')} durationInFrames={getEp04SceneDuration('terminal')}>
        <TerminalScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('branch-write')} durationInFrames={getEp04SceneDuration('branch-write')}>
        <BranchWriteScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('branch-result')} durationInFrames={getEp04SceneDuration('branch-result')}>
        <BranchResultScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('switch')} durationInFrames={getEp04SceneDuration('switch')}>
        <SwitchScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('commit')} durationInFrames={getEp04SceneDuration('commit')}>
        <CommitScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('compare')} durationInFrames={getEp04SceneDuration('compare')}>
        <CompareScene />
      </SceneSequence>

      <SceneSequence from={getEp04SceneStart('takeaway')} durationInFrames={getEp04SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
