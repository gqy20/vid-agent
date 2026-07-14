import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP07} from '../data/episodes';
import {seconds} from '../timeline';
import {CodeBlock, CommandPill, CourseLayout, EpisodeTitleCard, ManimClip, SceneCaption, SceneSequence} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP07_DURATION_IN_FRAMES, EP07_SCENES} from '../data/episodeTimelines.generated';
import {EP07_DURATION_IN_FRAMES, EP07_SCENES} from '../data/episodeTimelines.generated';

type Ep07SceneId = (typeof EP07_SCENES)[number]['id'];

const getEp07SceneStart = (id: Ep07SceneId) => {
  let cursor = 0;
  for (const scene of EP07_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP07 scene: ${id}`);
};

const getEp07SceneDuration = (id: Ep07SceneId) => {
  const scene = EP07_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP07 scene: ${id}`);
  return scene.duration;
};

const useSceneFrame = () => useCurrentFrame();

const commitX = (idx: number) => 118 + idx * 132;

const CommitNode: React.FC<{id: string; x: number; y: number; tone?: 'base' | 'main' | 'feature'; opacity?: number}> = ({
  id,
  x,
  y,
  tone,
  opacity = 1,
}) => {
  const stroke = tone === 'main' ? COLOR.git.main : tone === 'feature' ? COLOR.git.feature : tone === 'base' ? COLOR.git.head : COLOR.git.commit;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y + 8} r="29" fill={COLOR.effects.shadowSoft} opacity="0.5" />
      <circle cx={x} cy={y} r="27" fill={COLOR.canvas.base} stroke={stroke} strokeWidth={tone ? 6.5 : 5.2} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphNode.fontSize} fontWeight={TYPE.graphNode.fontWeight} fill={COLOR.text.primary}>
        {id}
      </text>
    </g>
  );
};

const BranchLabel: React.FC<{name: string; x: number; y: number; color: string; opacity?: number}> = ({name, x, y, color, opacity = 1}) => (
  <g opacity={opacity}>
    <line x1={x} y1={y < 160 ? y + 23 : y - 23} x2={x} y2={y < 160 ? y + 62 : y - 62} stroke={color} strokeWidth="4" strokeLinecap="round" />
    <rect x={x - 59} y={y - 23} width="118" height="46" rx="8" fill={color} />
    <text x={x} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.graphPointer.fontSize} fontWeight={TYPE.graphPointer.fontWeight} fill={COLOR.text.inverse}>
      {name}
    </text>
  </g>
);

const RebaseGraph: React.FC<{
  mode: 'diverged' | 'merged' | 'rebased' | 'fast-forward';
  width?: number;
  progress?: number;
  small?: boolean;
  showBase?: boolean;
  showOld?: boolean;
}> = ({mode, width = 940, progress = 1, small = false, showBase = false, showOld = true}) => {
  const y = 184;
  const c0 = commitX(0);
  const c1 = commitX(1);
  const c2 = commitX(2);
  const c3 = commitX(3);
  const c4 = commitX(3);
  const c5 = commitX(4);
  const c4p = commitX(4);
  const c5p = commitX(5);
  const m1 = commitX(5);
  const ffMainX = interpolate(progress, [0, 1], [c3, c5p], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const isRebased = mode === 'rebased' || mode === 'fast-forward';
  const mainX = mode === 'fast-forward' ? ffMainX : c3;
  const featureX = isRebased ? c5p : c5;
  const featureY = isRebased ? 104 : 264;

  return (
    <svg width={width} height={small ? 270 : 390} viewBox="0 0 900 390" style={{display: 'block', overflow: 'visible'}}>
      <line x1={c0} y1={y} x2={c2} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
      {mode === 'merged' ? (
        <>
          <line x1={c2} y1={y} x2={c3} y2="104" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c2} y1={y} x2={c4} y2="264" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c4} y1="264" x2={c5} y2="264" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c3} y1="104" x2={m1} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c5} y1="264" x2={m1} y2={y} stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
        </>
      ) : isRebased ? (
        <>
          <line x1={c2} y1={y} x2={c3} y2="104" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c3} y1="104" x2={c4p} y2="104" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c4p} y1="104" x2={c5p} y2="104" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          {showOld ? (
            <>
              <line x1={c2} y1={y} x2={c4} y2="264" stroke={COLOR.git.graphLine} strokeWidth="6" strokeLinecap="round" opacity="0.22" />
              <line x1={c4} y1="264" x2={c5} y2="264" stroke={COLOR.git.graphLine} strokeWidth="6" strokeLinecap="round" opacity="0.22" />
            </>
          ) : null}
        </>
      ) : (
        <>
          <line x1={c2} y1={y} x2={c3} y2="104" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c2} y1={y} x2={c4} y2="264" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
          <line x1={c4} y1="264" x2={c5} y2="264" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
        </>
      )}
      <CommitNode id="C0" x={c0} y={y} />
      <CommitNode id="C1" x={c1} y={y} />
      <CommitNode id="C2" x={c2} y={y} tone={showBase ? 'base' : undefined} />
      <CommitNode id="C3" x={c3} y={104} tone="main" />
      {mode === 'merged' ? (
        <>
          <CommitNode id="C4" x={c4} y={264} tone="feature" />
          <CommitNode id="C5" x={c5} y={264} tone="feature" />
          <CommitNode id="M1" x={m1} y={y} tone="base" />
        </>
      ) : isRebased ? (
        <>
          {showOld ? (
            <>
              <CommitNode id="C4" x={c4} y={264} tone="feature" opacity={0.28} />
              <CommitNode id="C5" x={c5} y={264} tone="feature" opacity={0.28} />
            </>
          ) : null}
          <CommitNode id="C4'" x={c4p} y={104} tone="feature" />
          <CommitNode id="C5'" x={c5p} y={104} tone="feature" />
        </>
      ) : (
        <>
          <CommitNode id="C4" x={c4} y={264} tone="feature" />
          <CommitNode id="C5" x={c5} y={264} tone="feature" />
        </>
      )}
      <BranchLabel name="main" x={mainX} y={mode === 'fast-forward' ? 166 : 42} color={COLOR.git.main} />
      <BranchLabel name="feature" x={featureX} y={featureY - 62} color={COLOR.git.feature} />
      {showBase ? (
        <text x={c2 - 22} y={y + 80} fontFamily={FONT.sans} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
          base
        </text>
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
  <div style={{position: 'absolute', left: x, top: y, opacity, ...TYPE.subtitle, fontWeight: WEIGHT.bold, color: COLOR.text.primary, maxWidth: 520}}>
    <span style={{display: 'inline-block', width: 14, height: 14, borderRadius: 999, background: color, marginRight: 14}} />
    {children}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useSceneFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.65), seconds(2.05)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.2), seconds(3.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ruleIn = interpolate(frame, [seconds(6.3), seconds(7.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(9.2), seconds(10)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '118px 150px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="7."
        keyword="Rebase"
        suffix="做了什么"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -42])}
        underlineScale={interpolate(frame, [seconds(0.45), seconds(0.95)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut}
        auditId="ep07-hook-title"
      />
      <div style={{position: 'absolute', left: '50%', top: 258, width: 1080, transform: `translate(-50%, ${(1 - graphIn) * 18}px)`, opacity: graphIn}}>
        <RebaseGraph mode="diverged" width={1080} showBase />
      </div>
      <div style={{position: 'absolute', left: 650, top: 700, opacity: ruleIn, transform: `translateY(${(1 - ruleIn) * 12}px)`, ...TYPE.hero, fontWeight: WEIGHT.bold}}>
        rebase = replay
      </div>
      <SceneCaption opacity={captionIn} width={900} bottom={104} auditId="ep07-hook-caption">
        不是把节点整体平移，而是重新播放独有修改
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CompareMergeScene: React.FC = () => {
  const frame = useSceneFrame();
  const leftIn = interpolate(frame, [0, seconds(0.9)], [0, 1], {extrapolateRight: 'clamp'});
  const rightIn = interpolate(frame, [seconds(8), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(20), seconds(21)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '134px 130px 116px', boxSizing: 'border-box'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, height: '100%', alignItems: 'center'}}>
        <div style={{opacity: leftIn}}>
          <div style={{...TYPE.title, color: COLOR.git.head, marginBottom: 28}}>merge：保留分叉</div>
          <RebaseGraph mode="merged" width={760} small />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 12}}>用 M1 记录汇合点</div>
        </div>
        <div style={{opacity: rightIn}}>
          <div style={{...TYPE.title, color: COLOR.git.feature, marginBottom: 28}}>rebase：重放成直线</div>
          <RebaseGraph mode="rebased" width={800} small showOld={false} />
          <div style={{...TYPE.subtitle, color: COLOR.text.primary, marginTop: 12}}>C4 / C5 变成 C4' / C5'</div>
        </div>
      </div>
      <SceneCaption opacity={captionIn} bottom={80} auditId="ep07-compare-caption">
        结果快照可能等价，但历史形状不同
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ReplayModelScene: React.FC = () => {
  const frame = useSceneFrame();
  const caption1 = interpolate(frame, [seconds(5), seconds(6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption2 = interpolate(frame, [seconds(17), seconds(18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption3 = interpolate(frame, [seconds(30), seconds(31)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionText = frame < seconds(17) ? '先找共同祖先 C2' : frame < seconds(30) ? '提取 feature 独有 patch' : '在 main 后按原顺序重放';
  const opacity = frame < seconds(17) ? caption1 : frame < seconds(30) ? caption2 : caption3;

  return (
    <AbsoluteFill style={{padding: '78px 132px 126px', boxSizing: 'border-box'}}>
      <ManimClip src="git-course/manim/ep07/rebase-replay.mp4" fit="contain" playbackRate={0.76} auditId="ep07-replay-manim" />
      <SceneCaption opacity={opacity} width={920} bottom={54} auditId="ep07-replay-caption">
        {captionText}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const NewIdentityScene: React.FC = () => {
  const frame = useSceneFrame();
  const caption1 = interpolate(frame, [seconds(5), seconds(6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption2 = interpolate(frame, [seconds(16), seconds(17)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption3 = interpolate(frame, [seconds(25), seconds(26)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionText = frame < seconds(16) ? "C4' 不是原来的 C4" : frame < seconds(25) ? 'parent 变了，hash 也会变' : '内容可以等价，但 commit 身份不同';
  const opacity = frame < seconds(16) ? caption1 : frame < seconds(25) ? caption2 : caption3;

  return (
    <AbsoluteFill style={{padding: '84px 132px 118px', boxSizing: 'border-box'}}>
      <ManimClip src="git-course/manim/ep07/rebase-identity.mp4" fit="contain" playbackRate={0.75} auditId="ep07-identity-manim" />
      <SceneCaption opacity={opacity} width={980} bottom={62} auditId="ep07-identity-caption">
        {captionText}
      </SceneCaption>
    </AbsoluteFill>
  );
};

const FastForwardAfterScene: React.FC = () => {
  const frame = useSceneFrame();
  const motion = interpolate(frame, [seconds(13), seconds(21)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const noteIn = interpolate(frame, [seconds(6), seconds(7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const noteOut = interpolate(frame, [seconds(12), seconds(13)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(22), seconds(23)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <CommandPill command="git merge feature" branch="main" />
      <div style={{position: 'absolute', left: '50%', top: 282, width: 1120, transform: 'translateX(-50%)'}}>
        <RebaseGraph mode="fast-forward" width={1120} progress={motion} showOld={false} />
      </div>
      <SideNote x={1268} y={424} color={COLOR.git.main} opacity={noteIn * noteOut}>
        feature 已经在 main 后面
      </SideNote>
      <SceneCaption opacity={captionIn} bottom={110} auditId="ep07-ff-caption">
        rebase 之后，main 通常只需要 fast-forward
      </SceneCaption>
    </AbsoluteFill>
  );
};

const PublicRiskScene: React.FC = () => {
  const frame = useSceneFrame();
  const graphIn = interpolate(frame, [0, seconds(0.9)], [0, 1], {extrapolateRight: 'clamp'});
  const cardsIn = interpolate(frame, [seconds(8), seconds(9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ruleIn = interpolate(frame, [seconds(18), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const captionIn = interpolate(frame, [seconds(23), seconds(24)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{padding: '132px 150px 112px', boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', left: 126, top: 248, width: 880, opacity: graphIn}}>
        <RebaseGraph mode="rebased" width={880} showOld />
      </div>
      <div style={{position: 'absolute', right: 150, top: 244, width: 520, opacity: cardsIn}}>
        <CodeBlock title="same work, two identities" lines={['remote: C4', "local:  C4'", 'hash:   different']} highlight={[0, 1]} highlightBorderColor={COLOR.git.head} />
      </div>
      <div style={{position: 'absolute', right: 160, top: 572, opacity: ruleIn, ...TYPE.title, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>
        共享出去的提交，不要随便 rebase
      </div>
      <SceneCaption opacity={captionIn} bottom={92} auditId="ep07-risk-caption">
        rebase 会重写历史；别人已经基于旧提交工作时，风险会扩散
      </SceneCaption>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useSceneFrame();
  const a = interpolate(frame, [0, seconds(0.8)], [0, 1], {extrapolateRight: 'clamp'});
  const b = interpolate(frame, [seconds(4), seconds(4.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = interpolate(frame, [seconds(8), seconds(8.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rows = [
    {text: 'replay 独有修改', opacity: a, color: COLOR.git.feature},
    {text: '生成新的 commit 身份', opacity: b, color: COLOR.git.head},
    {text: '不要重写共享历史', opacity: c, color: COLOR.git.main},
  ];

  return (
    <AbsoluteFill style={{padding: '142px 176px 118px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 42}}>rebase 的三条规则</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center'}}>
        <RebaseGraph mode="rebased" width={820} small showOld={false} />
        <div style={{display: 'grid', gap: 26}}>
          {rows.map((row) => (
            <div key={row.text} style={{opacity: row.opacity, display: 'flex', alignItems: 'center', gap: 18, ...TYPE.title, color: COLOR.text.primary}}>
              <span style={{width: 16, height: 16, borderRadius: 999, background: row.color, display: 'inline-block'}} />
              {row.text}
            </div>
          ))}
        </div>
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(11), seconds(11.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={78} auditId="ep07-takeaway-caption">
        历史更直，但代价是新的提交身份
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep07Rebase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle={EP07.seriesTitle}
      episodeTitle={EP07.title}
      scenes={EP07_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp07SceneStart('compare-merge')}
      showEpisodeTitle={(current) => current >= getEp07SceneStart('compare-merge')}
    >
      <SceneSequence from={getEp07SceneStart('hook')} durationInFrames={getEp07SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('compare-merge')} durationInFrames={getEp07SceneDuration('compare-merge')}>
        <CompareMergeScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('replay-model')} durationInFrames={getEp07SceneDuration('replay-model')}>
        <ReplayModelScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('new-identity')} durationInFrames={getEp07SceneDuration('new-identity')}>
        <NewIdentityScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('fast-forward-after')} durationInFrames={getEp07SceneDuration('fast-forward-after')}>
        <FastForwardAfterScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('public-risk')} durationInFrames={getEp07SceneDuration('public-risk')}>
        <PublicRiskScene />
      </SceneSequence>
      <SceneSequence from={getEp07SceneStart('takeaway')} durationInFrames={getEp07SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
