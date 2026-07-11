import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP05} from '../data/episodes';
import {EP05_TERMINAL} from '../data/terminalScripts';
import {seconds} from '../timeline';
import {
  CenterGraph,
  CodeBlock,
  CommandPill,
  CourseLayout,
  EpisodeTitleCard,
  GitGraph,
  MiniRefLine,
  SceneCaption,
  SceneSequence,
  TerminalFocusScene,
  type GitGraphState,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';
import {EP05_DURATION_IN_FRAMES, EP05_SCENES} from '../data/episodeTimelines.generated';

type Ep05SceneId = (typeof EP05_SCENES)[number]['id'];

const getEp05SceneStart = (id: Ep05SceneId) => {
  let cursor = 0;
  for (const scene of EP05_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP05 scene: ${id}`);
};

const getEp05SceneDuration = (id: Ep05SceneId) => {
  const scene = EP05_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP05 scene: ${id}`);
  return scene.duration;
};

type Ep05GitState = {
  main: 'C2';
  feature: 'C2' | 'C3';
  headBranch: 'main' | 'feature';
  commits: readonly string[];
};

const STATES = {
  base: {main: 'C2', feature: 'C2', headBranch: 'main', commits: ['C0', 'C1', 'C2']} satisfies Ep05GitState,
  switched: {main: 'C2', feature: 'C2', headBranch: 'feature', commits: ['C0', 'C1', 'C2']} satisfies Ep05GitState,
  committed: {main: 'C2', feature: 'C3', headBranch: 'feature', commits: ['C0', 'C1', 'C2', 'C3']} satisfies Ep05GitState,
};

const graphState = (state: Ep05GitState): GitGraphState => ({
  commits: state.commits.map((commit) => ({id: commit})),
  branches: [
    {name: 'main', target: state.main, lane: 'bottom', active: state.headBranch === 'main'},
    {name: 'feature', target: state.feature, lane: 'top', active: state.headBranch === 'feature'},
  ],
  head: {target: state.headBranch === 'main' ? state.main : state.feature, branch: state.headBranch},
});

const useSceneFrame = () => useCurrentFrame();

const FadeIn: React.FC<{children: React.ReactNode; start?: number; duration?: number; y?: number}> = ({
  children,
  start = 0,
  duration = 0.55,
  y = 18,
}) => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(start), seconds(start + duration)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{opacity: progress, transform: `translateY(${(1 - progress) * y}px)`}}>{children}</div>;
};

const HeadChainLabel: React.FC<{left?: number; top?: number; text?: string; opacity?: number}> = ({
  left = 668,
  top = 770,
  text = 'HEAD -> main -> C2',
  opacity = 1,
}) => (
  <div style={{position: 'absolute', left, top, width: 584, opacity}}>
    <CodeBlock title=".git/HEAD + refs" lines={[text]} highlight={[0]} />
  </div>
);

const toneColor = (tone: 'main' | 'feature' | 'head') =>
  tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : COLOR.git.head;

const TimedSideLabel: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  tone?: 'main' | 'feature' | 'head';
  frame: number;
  start: number;
}> = ({children, x, y, tone = 'head', frame, start}) => {
  const opacity = interpolate(frame, [seconds(start), seconds(start + 0.55)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        maxWidth: 520,
        color: COLOR.text.primary,
        ...TYPE.subtitle,
        fontWeight: WEIGHT.bold,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          borderRadius: 999,
          background: toneColor(tone),
          marginRight: 14,
        }}
      />
      {children}
    </div>
  );
};

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.7), seconds(2.15)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.15), seconds(2.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const evidenceOut = interpolate(frame, [seconds(7.6), seconds(8.25)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(8.4), seconds(9.05)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="5."
        keyword="HEAD"
        suffix="是什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -46])}
        keywordOpacity={1}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep05-hook-title"
      />
      <div style={{opacity: graphIn, transform: `translateY(${(1 - graphIn) * 22}px)`}}>
        <CenterGraph state={graphState(STATES.base)} top={322} width={1080} headMarkerOffsetX={118} />
        <HeadChainLabel top={742} opacity={evidenceOut} />
      </div>
      <SceneCaption opacity={captionIn} width={930} fontSize={35} bottom={126} auditId="ep05-hook-caption">
        HEAD 回答的是：我现在站在哪里？
      </SceneCaption>
    </AbsoluteFill>
  );
};

const SymbolicRefScene: React.FC = () => {
  const frame = useSceneFrame();
  const fileIn = interpolate(frame, [0, seconds(0.7)], [0, 1], {extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(8.7), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chainPulse = interpolate(frame, [seconds(12), seconds(13.3), seconds(15.2)], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionIn = interpolate(frame, [seconds(18.2), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '112px 152px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 190, top: 244, width: 650, opacity: fileIn}}>
        <CodeBlock title=".git/HEAD" lines={['ref: refs/heads/main']} highlight={[0]} />
      </div>
      <div style={{position: 'absolute', left: 1030, top: 246, width: 560, opacity: interpolate(fileIn, [0.45, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <CodeBlock title=".git/refs/heads/main" lines={['C2']} highlight={[0]} highlightBorderColor={COLOR.git.main} highlightBackground={COLOR.effects.mainWash} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <path
          d="M840 356 C910 356 950 356 1028 356"
          fill="none"
          stroke={COLOR.git.head}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={(0.35 + chainPulse * 0.45) * fileIn}
        />
      </svg>
      <div style={{opacity: graphIn, transform: `translateY(${(1 - graphIn) * 24}px)`}}>
        <CenterGraph state={graphState(STATES.base)} top={500} width={960} headMarkerOffsetX={118} />
      </div>
      <SceneCaption opacity={captionIn} width={1020} bottom={120} auditId="ep05-symbolic-caption">
        通常是 HEAD 指向 branch，branch 再指向 commit
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TerminalScene: React.FC = () => <TerminalFocusScene steps={EP05_TERMINAL} frameOffset={getEp05SceneStart('terminal')} />;

const SwitchScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(4), seconds(14)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileProgress = interpolate(frame, [seconds(14.2), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git switch feature" branch="main" />
      <CenterGraph
        state={graphState(STATES.switched)}
        top={338}
        width={1110}
        headMotion={{from: 'main', to: 'feature', progress}}
        headMarkerOffsetX={118}
      />
      <TimedSideLabel x={1320} y={382} tone="head" frame={frame} start={4}>
        HEAD 从 main 到 feature。
      </TimedSideLabel>
      <div style={{position: 'absolute', left: 700, top: 744, width: 560, opacity: fileProgress}}>
        <CodeBlock title=".git/HEAD" lines={['ref: refs/heads/feature']} highlight={[0]} />
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(23.5), seconds(24.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={118}>
        commit 没变，当前所在分支变了
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CommitCurrentScene: React.FC = () => {
  const frame = useSceneFrame();
  const commitIn = interpolate(frame, [seconds(6), seconds(13)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [seconds(13.2), seconds(23.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const state = commitIn < 0.55 ? STATES.switched : STATES.committed;

  return (
    <AbsoluteFill>
      <CommandPill command={'git commit -m "work"'} branch="feature" />
      <CenterGraph
        state={graphState(state)}
        top={338}
        width={1160}
        branchMotion={state.feature === 'C3' ? {name: 'feature', from: 'C2', to: 'C3', progress: pointer} : undefined}
        headMarkerOffsetX={118}
      />
      <MiniRefLine title=".git/refs/heads/feature" line="feature -> C3" top={742} left={704} />
      <TimedSideLabel x={1335} y={288} tone="feature" frame={frame} start={13.2}>
        HEAD 在 feature 上，feature 前进。
      </TimedSideLabel>
      <TimedSideLabel x={236} y={674} tone="main" frame={frame} start={16}>
        main 停在 C2。
      </TimedSideLabel>
      <SceneCaption opacity={interpolate(frame, [seconds(24.3), seconds(25.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={116}>
        HEAD 没有变成 commit；它仍然指向当前分支
      </SceneCaption>
    </AbsoluteFill>
  );
};

const DetachedGraph: React.FC<{progress: number}> = ({progress}) => {
  const headX = interpolate(progress, [0, 1], [110 + 2 * 150 + 118, 110 + 1 * 150]);
  const headY = interpolate(progress, [0, 1], [194, 52]);
  const commits = ['C0', 'C1', 'C2', 'C3'];

  return (
    <svg width="1030" height="380" viewBox="0 0 730 270" style={{display: 'block', overflow: 'visible'}}>
      <line x1="110" y1="125" x2="560" y2="125" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
      {commits.map((commit, idx) => (
        <g key={commit}>
          <circle cx={110 + idx * 150} cy={134} r="31" fill={COLOR.effects.shadowSoft} opacity="0.5" />
          <circle
            cx={110 + idx * 150}
            cy="125"
            r="28"
            fill={COLOR.canvas.base}
            stroke={commit === 'C1' ? COLOR.git.head : COLOR.git.commit}
            strokeWidth={commit === 'C1' ? 6.8 : 5.6}
          />
          <text x={110 + idx * 150} y="133" textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphNode.fontSize} fontWeight={TYPE.graphNode.fontWeight} fill={COLOR.text.primary}>
            {commit}
          </text>
        </g>
      ))}
      <path d="M410 166 C410 188 410 194 410 194" fill="none" stroke={COLOR.git.main} strokeWidth="4.4" strokeLinecap="round" opacity="0.88" />
      <rect x="352" y="170" width="116" height="48" rx="8" fill={COLOR.git.main} opacity="0.96" />
      <text x="410" y="202" textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphPointer.fontSize} fontWeight={TYPE.graphPointer.fontWeight} fill={COLOR.text.inverse}>
        main
      </text>
      <path d={`M${headX} ${headY + 22} C${headX} ${headY + 48} 260 78 260 94`} fill="none" stroke={COLOR.git.head} strokeWidth="4.4" strokeLinecap="round" opacity="0.72" />
      <rect x={headX - 49} y={headY - 22} width="98" height="44" rx="22" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="2.6" />
      <circle cx={headX - 28} cy={headY} r="5" fill={COLOR.git.head} />
      <text x={headX + 10} y={headY + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
        HEAD
      </text>
    </svg>
  );
};

const DetachedScene: React.FC = () => {
  const frame = useSceneFrame();
  const progress = interpolate(frame, [seconds(6), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileIn = interpolate(frame, [seconds(16.5), seconds(22.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const warningIn = interpolate(frame, [seconds(27.5), seconds(29)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git switch --detach C1" branch="feature" />
      <div style={{position: 'absolute', left: '50%', top: 322, width: 1030, transform: 'translateX(-50%)'}}>
        <DetachedGraph progress={progress} />
      </div>
      <div style={{position: 'absolute', left: 710, top: 728, width: 500, opacity: fileIn}}>
        <CodeBlock title=".git/HEAD" lines={['9a4c1e7']} highlight={[0]} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 112,
          width: 980,
          transform: `translate(-50%, ${(1 - warningIn) * 18}px)`,
          opacity: warningIn,
          textAlign: 'center',
          ...TYPE.subtitle,
          color: COLOR.text.primary,
        }}
      >
        detached HEAD：适合查看历史，不适合作为长期工作位置
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const state = frame < seconds(8) ? STATES.base : frame < seconds(16) ? STATES.switched : STATES.committed;
  const lines = ['HEAD -> branch -> commit', 'switch：改 HEAD', 'commit：推进当前 branch'];

  return (
    <AbsoluteFill style={{padding: '158px 170px 128px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>
        HEAD 是当前位置，
        <br />
        不是另一个分支。
      </div>
      <div style={{position: 'absolute', right: 230, top: 348, width: 760}}>
        <GitGraph state={graphState(state)} width={760} height={306} />
      </div>
      <div style={{position: 'absolute', left: 176, bottom: 158, display: 'grid', gap: 16}}>
        {lines.map((line, idx) => (
          <FadeIn key={line} start={idx * 2.2} duration={0.55} y={12}>
            <div style={{...TYPE.subtitle, color: idx === 0 ? COLOR.text.primary : COLOR.text.secondary, fontWeight: idx === 0 ? 760 : 560}}>
              <span
                style={{
                  display: 'inline-block',
                  width: 28,
                  height: 28,
                  marginRight: 16,
                  borderRadius: 999,
                  background: idx === 0 ? COLOR.git.head : COLOR.stroke.default,
                  verticalAlign: -3,
                }}
              />
              {line}
            </div>
          </FadeIn>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Ep05Head: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP05.seriesTitle}
      episodeTitle={EP05.title}
      scenes={EP05_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp05SceneStart('terminal')}
      showEpisodeTitle={(current) => current >= getEp05SceneStart('terminal')}
    >
      <SceneSequence from={getEp05SceneStart('hook')} durationInFrames={getEp05SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('symbolic-ref')} durationInFrames={getEp05SceneDuration('symbolic-ref')}>
        <SymbolicRefScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('terminal')} durationInFrames={getEp05SceneDuration('terminal')}>
        <TerminalScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('switch')} durationInFrames={getEp05SceneDuration('switch')}>
        <SwitchScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('commit-current')} durationInFrames={getEp05SceneDuration('commit-current')}>
        <CommitCurrentScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('detached')} durationInFrames={getEp05SceneDuration('detached')}>
        <DetachedScene />
      </SceneSequence>
      <SceneSequence from={getEp05SceneStart('takeaway')} durationInFrames={getEp05SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
