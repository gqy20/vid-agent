import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP04} from '../data/episodes';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {type GitCourseState} from '../data/terminalScripts';
import {seconds} from '../timeline';
import {
  BranchPointerHookGraph,
  BranchRefMentalModelGraph,
  CenterGraph,
  CommandPill,
  CourseLayout,
  createEpisodeRuntime,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitGraph,
  SceneCaption,
  MiniRefLine,
  MotionTitle,
  PositionedMotion,
  RefWrite,
  RefWriteBar,
  RecordedTerminalStage,
  SideLabel,
  StrikeThrough,
  SvgArrowLine,
  WorkingTreeCard,
  type GitGraphState,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP04_DURATION_IN_FRAMES, EP04_SCENES} from '../data/episodeTimelines.generated';
import {EP04_DURATION_IN_FRAMES, EP04_SCENES} from '../data/episodeTimelines.generated';

const EP04_RUNTIME = createEpisodeRuntime(EP04_SCENES);

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

const START_POINT_STATE: GitGraphState = {
  commits: [{id: 'C0'}, {id: 'C1'}, {id: 'C2'}],
  branches: [
    {name: 'main', target: 'C2', lane: 'bottom', active: true},
    {name: 'hotfix', target: 'C1', lane: 'top'},
  ],
  head: {target: 'C2', branch: 'main'},
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
        branch 是一个 ref，它可以和 main 指向同一个 commit。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => {
  const recording = TERMINAL_RECORDINGS['ep04-branch-flow'];
  return (
    <AbsoluteFill>
      <RecordedTerminalStage
        auditId="ep04-branch-terminal-recording"
        rect={{x: 290, y: 176, width: 1340, height: 660}}
        src="git-course-lab/terminal/ep04-branch-flow.mp4"
        holdFrameSrc="git-course-lab/terminal/ep04-branch-flow-hold.png"
        holdFromFrame={recording.holdFromFrame}
        playbackRate={0.75}
        mediaFit="cover"
      />
      <SceneCaption opacity={1} width={900} fontSize={32} bottom={104} auditId="ep04-terminal-caption">
        创建、切换、提交：只看三个名字如何变化
      </SceneCaption>
    </AbsoluteFill>
  );
};

const BranchWriteScene: React.FC = () => {
  const frame = useSceneFrame();
  const refProgress = interpolate(frame, [seconds(4.73), seconds(7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const noteIn = interpolate(frame, [seconds(8.2), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git branch feature" branch="main" />
      <CenterGraph state={graphState(STATES.base)} top={374} width={980} />
      <RefWriteBar refName="refs/heads/feature" target="C2" progress={refProgress} x={676} y={744} auditId="branch-write-ref-bar" />
      <div style={{opacity: noteIn}}><SideLabel x={1272} y={760} tone="feature">Git 写入一条 ref</SideLabel></div>
    </AbsoluteFill>
  );
};

const RefStorageScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.7)], [0, 1], {extrapolateRight: 'clamp'});
  const folderIn = interpolate(frame, [seconds(1.4), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileIn = interpolate(frame, [seconds(4), seconds(6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hashIn = interpolate(frame, [seconds(7.2), seconds(9.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(10.2), seconds(12.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const summaryIn = interpolate(frame, [seconds(15), seconds(16.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleIn} translateY={interpolate(titleIn, [0, 1], [16, 0])} auditId="ref-storage-title">
        这个指针，实际存在哪里？
      </MotionTitle>
      <div style={{position: 'absolute', left: 180, top: 320, width: 760, opacity: folderIn}}>
        <div style={{...TYPE.ui, fontFamily: FONT.mono, color: COLOR.text.tertiary, marginBottom: 18}}>.git / refs / heads /</div>
        <div
          data-audit-id="ep04-feature-ref-file"
          style={{padding: '30px 36px', borderRadius: 14, background: COLOR.canvas.raised, border: `2px solid ${COLOR.git.feature}`, boxShadow: `0 18px 48px ${COLOR.effects.shadowPanel}`, opacity: fileIn, transform: `translateY(${interpolate(fileIn, [0, 1], [18, 0])}px)`}}
        >
          <div style={{...TYPE.title, fontFamily: FONT.mono, color: COLOR.git.feature}}>feature</div>
          <div style={{height: 1, background: COLOR.stroke.soft, margin: '22px 0'}} />
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24, opacity: hashIn}}>
            <div style={{...TYPE.code, fontFamily: FONT.mono, color: COLOR.text.primary}}>7b4d2e1</div>
            <div style={{...TYPE.ui, color: COLOR.text.tertiary}}>C2 的 commit ID</div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 350, width: 760, opacity: graphIn, transform: `translateX(${interpolate(graphIn, [0, 1], [24, 0])}px)`}}>
        <GitGraph state={graphState(STATES.withFeature)} width={760} height={310} showHeadMarker={false} auditId="ref-storage-graph" />
      </div>
      <SceneCaption opacity={summaryIn} width={980} fontSize={35} bottom={112} auditId="ref-storage-summary">
        ref 保存提交对象 ID，不保存另一份项目
      </SceneCaption>
    </AbsoluteFill>
  );
};

const BranchResultScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(1.27), seconds(3.87)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const featureNote = interpolate(frame, [seconds(4.2), seconds(5.2), seconds(7.8), seconds(8.6)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainNote = interpolate(frame, [seconds(9), seconds(10), seconds(12.8), seconds(13.6)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const summaryIn = interpolate(frame, [seconds(14.2), seconds(15.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git branch feature" branch="main" top={128} />
      <CenterGraph state={graphState(STATES.withFeature)} top={270} width={1380} branchOffset={77} branchReveal={{name: 'feature', progress}} />
      <div style={{opacity: progress}}><MiniRefLine line="feature -> C2" top={752} left={700} /></div>
      <div style={{opacity: featureNote}}><SideLabel x={1280} y={330} tone="feature">新增的是 feature</SideLabel></div>
      <div style={{opacity: mainNote}}><SideLabel x={230} y={620} tone="main">main 没有移动</SideLabel></div>
      <SceneCaption opacity={summaryIn} width={820} fontSize={34} bottom={106} auditId="branch-result-summary">
        两个名字，同一个 commit
      </SceneCaption>
    </AbsoluteFill>
  );
};

const StartPointScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [seconds(1.4), seconds(3.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hotfixIn = interpolate(frame, [seconds(4.2), seconds(7.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const explanationIn = interpolate(frame, [seconds(9.4), seconds(10.8), seconds(13), seconds(14)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const summaryIn = interpolate(frame, [seconds(14.6), seconds(15.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git branch hotfix C1" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 326, width: 1320, transform: 'translateX(-50%)', opacity: graphIn}}>
        <GitGraph state={START_POINT_STATE} width={1320} height={470} branchReveal={{name: 'hotfix', progress: hotfixIn}} auditId="start-point-graph" />
      </div>
      <div style={{opacity: hotfixIn}}><MiniRefLine line="hotfix -> C1" top={748} left={700} /></div>
      <div style={{opacity: explanationIn}}><SideLabel x={1285} y={408} tone="feature">start-point = C1</SideLabel></div>
      <SceneCaption opacity={summaryIn} width={1040} fontSize={34} bottom={108} auditId="start-point-summary">
        省略 start-point 时，才默认使用当前 HEAD
      </SceneCaption>
    </AbsoluteFill>
  );
};

const SwitchScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(5.7), seconds(8.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refIn = interpolate(frame, [seconds(9.15), seconds(9.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headNote = interpolate(frame, [seconds(6), seconds(6.7), seconds(8.5), seconds(9.2)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitNote = interpolate(frame, [seconds(14), seconds(14.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command="git switch feature" branch="main" />
      <CenterGraph state={graphState(STATES.switched)} top={350} width={1130} headMotion={{from: 'main', to: 'feature', progress}} headMarkerOffsetX={118} />
      <div style={{opacity: refIn}}><MiniRefLine title=".git/HEAD" line="HEAD -> feature" top={736} left={700} /></div>
      <div style={{opacity: headNote}}><SideLabel x={1360} y={420} tone="head">HEAD 从 main 滑到 feature</SideLabel></div>
      <div style={{opacity: commitNote}}><SideLabel x={220} y={690} tone="main">commit 没变，当前分支变了</SideLabel></div>
    </AbsoluteFill>
  );
};

const CommitScene: React.FC = () => {
  const frame = useSceneFrame();
  const commitIn = interpolate(frame, [seconds(3.47), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [seconds(6.27), seconds(9.53)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const featureNote = interpolate(frame, [seconds(7.2), seconds(8), seconds(10.7), seconds(11.3)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainNote = interpolate(frame, [seconds(14.4), seconds(15.4), seconds(18), seconds(19)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const summaryIn = interpolate(frame, [seconds(17.8), seconds(18.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <CommandPill command={'git commit -m "try new header"'} branch="feature" />
      <CenterGraph
        state={graphState(STATES.committed)}
        top={314}
        width={1380}
        commitRevealProgress={commitIn}
        branchMotion={{name: 'feature', from: 'C2', to: 'C3', progress: pointer}}
        headMarkerOffsetX={118}
      />
      <div style={{opacity: pointer}}><MiniRefLine line="feature -> C3" top={742} left={700} /></div>
      <div style={{opacity: featureNote}}><SideLabel x={1360} y={278} tone="feature">feature 前进到 C3</SideLabel></div>
      <div style={{opacity: mainNote}}><SideLabel x={230} y={665} tone="main">main 留在 C2</SideLabel></div>
      <SceneCaption opacity={summaryIn} width={780} fontSize={34} bottom={104} auditId="commit-summary">
        新提交只推动当前分支
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CompareScene: React.FC = () => {
  const frame = useSceneFrame();
  const title = interpolate(frame, [0, seconds(0.7)], [0, 1], {extrapolateRight: 'clamp'});
  const left = interpolate(frame, [seconds(1), seconds(2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const right = interpolate(frame, [seconds(3.4), seconds(4.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
  <AbsoluteFill style={{padding: '154px 170px 120px', boxSizing: 'border-box'}}>
    <div style={{...TYPE.hero, fontSize: 62, opacity: title, transform: `translateY(${interpolate(title, [0, 1], [18, 0])}px)`}}>创建不移动，提交才移动</div>
    <div style={{position: 'absolute', left: 118, top: 388, width: 800, opacity: left, transform: `translateY(${interpolate(left, [0, 1], [22, 0])}px)`}}>
      <GitGraph state={graphState(STATES.withFeature)} width={800} height={310} />
      <div style={{...TYPE.subtitle, color: COLOR.text.secondary, marginTop: 34, width: '100%', textAlign: 'center'}}>创建后 · 两个名字都在 C2</div>
    </div>
    <div style={{position: 'absolute', right: 92, top: 388, width: 820, opacity: right, transform: `translateY(${interpolate(right, [0, 1], [22, 0])}px)`}}>
      <GitGraph state={graphState(STATES.committed)} width={820} height={320} />
      <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 34, width: '100%', textAlign: 'center', fontWeight: WEIGHT.bold}}>提交后 · feature 前进到 C3</div>
    </div>
  </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const state = frame < seconds(8.4) ? STATES.withFeature : frame < seconds(11.7) ? STATES.switched : STATES.committed;
  const step = frame < seconds(8.4) ? '创建：新增名字' : frame < seconds(11.7) ? '切换：HEAD 改指向' : '提交：当前名字前进';
  const titleIn = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(0.9), seconds(2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div
        data-audit-id="takeaway-title"
        style={{position: 'absolute', top: 150, left: 120, right: 120, ...TYPE.hero, fontSize: 76, fontWeight: WEIGHT.bold, textAlign: 'center', opacity: titleIn, transform: `translateY(${interpolate(titleIn, [0, 1], [16, 0])}px)`}}
      >
        Branch 是一个会移动的名字
      </div>
      <div
        data-audit-id="takeaway-main-graph"
        style={{position: 'absolute', left: '50%', top: 304, width: 1420, transform: `translateX(-50%) scale(${interpolate(graphIn, [0, 1], [0.96, 1])})`, transformOrigin: 'center top', opacity: graphIn}}
      >
        <GitGraph state={graphState(state)} width={1420} height={520} auditId="takeaway-graph" />
      </div>
      <div style={{position: 'absolute', left: '50%', bottom: 126, transform: 'translateX(-50%)', ...TYPE.subtitle, fontSize: 34, color: COLOR.text.primary, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
        <span style={{display: 'inline-block', width: 18, height: 18, marginRight: 16, borderRadius: 999, background: COLOR.git.head}} />
        {step}
      </div>
    </AbsoluteFill>
  );
};

const EP04_SCENE_COMPONENTS = {
  hook: HookScene,
  'mental-model': MentalModelScene,
  terminal: TerminalScene,
  'branch-write': BranchWriteScene,
  'ref-storage': RefStorageScene,
  'branch-result': BranchResultScene,
  'start-point': StartPointScene,
  switch: SwitchScene,
  commit: CommitScene,
  compare: CompareScene,
  takeaway: TakeawayScene,
};

export const Ep04BranchIsPointer: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP04.seriesTitle}
      episodeTitle={EP04.title}
      scenes={EP04_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP04_RUNTIME.start('terminal')}
      showEpisodeTitle={(current) => current >= EP04_RUNTIME.start('terminal')}
    >
      <EpisodeTimeline runtime={EP04_RUNTIME} components={EP04_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
