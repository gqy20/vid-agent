import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP12} from '../data/episodes';
import {EP12_DURATION_IN_FRAMES, EP12_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {
  CourseBranchLabel,
  CourseCommitNode,
  CourseGraphEdge,
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

export {EP12_DURATION_IN_FRAMES, EP12_SCENES};

const RUNTIME = createEpisodeRuntime(EP12_SCENES);
const MINI_NODE_RADIUS = courseCommitOuterRadius({scale: 1.05, strong: true});
const EP12_TAKEAWAY_BODY = {x: 220, y: 300, width: 1480, height: 560};
const appear = (frame: number, at: number, duration = 0.7) => interpolate(frame, [seconds(at), seconds(at + duration)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const terminalCue = <T extends keyof typeof TERMINAL_RECORDINGS>(id: T, from: number, duration: number) => ({
  id,
  from: seconds(from),
  durationInFrames: seconds(duration),
  src: `git-course-lab/terminal/${id}.mp4`,
  holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`,
  holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame,
});

const RefPill: React.FC<{name: string; value: string; color: string; opacity?: number}> = ({name, value, color, opacity = 1}) => (
  <div style={{opacity, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 18, border: `2px solid ${color}`, borderRadius: 14, background: COLOR.canvas.raised, padding: '18px 22px'}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.ui, fontWeight: WEIGHT.bold, color}}>{name}</div>
    <div style={{fontFamily: FONT.mono, ...TYPE.ui, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>{value}</div>
  </div>
);

const RepositoryBoundary: React.FC<{title: string; eyebrow: string; color: string; children: React.ReactNode; opacity?: number}> = ({title, eyebrow, color, children, opacity = 1}) => (
  <section style={{opacity, height: 540, border: `3px solid ${color}`, borderRadius: 30, background: COLOR.canvas.raised, padding: '30px 34px', boxSizing: 'border-box', boxShadow: `0 18px 38px ${COLOR.effects.shadowPanel}`}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.label, color: COLOR.text.tertiary, marginBottom: 8}}>{eyebrow}</div>
    <div style={{...TYPE.title, color, fontWeight: WEIGHT.bold}}>{title}</div>
    <div style={{marginTop: 32}}>{children}</div>
  </section>
);

const MiniHistory: React.FC<{serverAtC2?: boolean; remoteAtC2?: boolean; localAtC2?: boolean; opacity?: number}> = ({serverAtC2 = false, remoteAtC2 = false, localAtC2 = false, opacity = 1}) => {
  const c0 = {x: 110, y: 176};
  const c1 = {x: 300, y: 176};
  const c2 = {x: 490, y: 176};
  return (
    <svg width="620" height="350" viewBox="0 0 620 350" style={{display: 'block', opacity, overflow: 'visible'}}>
      <g data-graph-layer="edges">
        <CourseGraphEdge from={courseCommitAnchor(c1.x, c1.y, {scale: 1.05})} to={courseCommitAnchor(c0.x, c0.y, {scale: 1.05})} />
        {(serverAtC2 || remoteAtC2 || localAtC2) ? <CourseGraphEdge from={courseCommitAnchor(c2.x, c2.y, {scale: 1.05})} to={courseCommitAnchor(c1.x, c1.y, {scale: 1.05})} /> : null}
      </g>
      <g data-graph-layer="refs">
        {serverAtC2 ? <CourseBranchLabel name="main" x={c2.x} y={70} targetX={c2.x} targetY={c2.y} targetRadius={MINI_NODE_RADIUS} color={COLOR.git.feature} /> : null}
        {remoteAtC2 ? <CourseBranchLabel name="origin/main" x={c2.x} y={70} targetX={c2.x} targetY={c2.y} targetRadius={MINI_NODE_RADIUS} color={COLOR.git.head} /> : null}
        {localAtC2 ? <CourseBranchLabel name="main" x={c2.x} y={286} targetX={c2.x} targetY={c2.y} targetRadius={MINI_NODE_RADIUS} color={COLOR.git.main} /> : null}
      </g>
      <g data-graph-layer="nodes">
        <CourseCommitNode id="C0" {...c0} scale={1.05} />
        <CourseCommitNode id="C1" {...c1} scale={1.05} tone={!serverAtC2 && !remoteAtC2 && !localAtC2 ? 'base' : 'default'} />
        {(serverAtC2 || remoteAtC2 || localAtC2) ? <CourseCommitNode id="C2" {...c2} scale={1.05} tone="feature" /> : null}
      </g>
    </svg>
  );
};

const ThreePlaceDiagram: React.FC<{serverAtC2?: boolean; remoteAtC2?: boolean; frame?: number}> = ({serverAtC2 = false, remoteAtC2 = false, frame = 9999}) => (
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1.12fr', gap: 54}}>
    <RepositoryBoundary title="服务器仓库" eyebrow="remote repository" color={COLOR.git.feature} opacity={appear(frame, 2.3)}>
      <MiniHistory serverAtC2={serverAtC2} />
      <div style={{marginTop: -62}}><RefPill name="refs/heads/main" value={serverAtC2 ? 'C2' : 'C1'} color={COLOR.git.feature} /></div>
    </RepositoryBoundary>
    <RepositoryBoundary title="本地仓库" eyebrow="local repository" color={COLOR.git.main} opacity={appear(frame, 5.8)}>
      <div style={{display: 'grid', gap: 18}}>
        <RefPill name="refs/heads/main" value="C1" color={COLOR.git.main} opacity={appear(frame, 8.4)} />
        <RefPill name="refs/remotes/origin/main" value={remoteAtC2 ? 'C2' : 'C1'} color={COLOR.git.head} opacity={appear(frame, 12)} />
      </div>
      <div style={{marginTop: 28, ...TYPE.body, color: COLOR.text.secondary}}>两个本地 refs，更新时间与写入者不同</div>
    </RepositoryBoundary>
  </div>
);

// @git-course-scene hook:start
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOut = interpolate(frame, [seconds(1.8), seconds(2.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <EpisodeTitleCard index="12." keyword="origin/main" suffix="在哪" opacity={titleOut} underlineScale={appear(frame, 0.4, 0.5)} auditId="ep12-hook-title" />
      <div style={{position: 'absolute', left: 170, right: 170, top: 206, opacity: appear(frame, 2.7)}}><ThreePlaceDiagram serverAtC2 frame={frame} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 772, textAlign: 'center', ...TYPE.title, fontWeight: WEIGHT.bold, opacity: appear(frame, 9.4)}}>服务器已到 C2，本地记录为什么还在 C1？</div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep12-hook-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene hook:end

// @git-course-scene three-places:start
const ThreePlacesScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '112px 156px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 48}}>相似的名字，三个不同位置</div>
      <ThreePlaceDiagram frame={frame} />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('three-places')} width={1320} bottom={64} auditId="ep12-three-places-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene three-places:end

// @git-course-scene stale-bookmark:start
const StaleBookmarkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const c2In = appear(frame, 2.6, 1.1);
  return (
    <AbsoluteFill style={{padding: '112px 156px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>网络另一端变化，不会隔空改写本地 ref</div>
      <div style={{position: 'absolute', left: 156, right: 156, top: 238}}>
        <ThreePlaceDiagram serverAtC2={c2In > 0.4} frame={frame} />
      </div>
      <div data-audit-id="ep12-stale-note" style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', ...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.head, opacity: appear(frame, 12.8)}}>origin/main = 最后一次通信时已知的位置</div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('stale-bookmark')} width={1320} bottom={64} auditId="ep12-stale-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene stale-bookmark:end

// @git-course-scene real-refs:start
const RealRefsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [terminalCue('ep12-local-refs', 0, 12), terminalCue('ep12-server-ref', 12, 12)] as const;
  return (
    <AbsoluteFill>
      <RecordedTerminalCueSequence cues={cues} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep12-real-refs-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('real-refs')} width={1320} bottom={64} auditId="ep12-real-refs-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene real-refs:end

// @git-course-scene fetch-updates:start
const FetchUpdatesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [terminalCue('ep12-fetch', 0, 8)] as const;
  const modelIn = appear(frame, 8.1, 0.8);
  return (
    <AbsoluteFill>
      <RecordedTerminalCueSequence cues={cues} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep12-fetch-terminal" />
      <div style={{position: 'absolute', left: 156, right: 156, top: 112, opacity: modelIn}}>
        <div style={{...TYPE.hero, fontWeight: WEIGHT.bold, marginBottom: 46}}>Fetch 更新本地对远端的认识</div>
        <ThreePlaceDiagram serverAtC2 remoteAtC2 frame={9999} />
      </div>
      <div data-audit-id="ep12-fetch-result" style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', gap: 62, opacity: appear(frame, 15)}}>
        <span style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.head}}>origin/main → C2</span>
        <span style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.main}}>main 仍在 C1</span>
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('fetch-updates')} width={1320} bottom={64} auditId="ep12-fetch-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene fetch-updates:end

// @git-course-scene tracking-branch:start
const TrackingBranchScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '112px 180px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>跟踪关系，不会把两个 refs 合成一个</div>
      <div data-audit-id="ep12-upstream-model" style={{position: 'absolute', left: 270, right: 270, top: 286, display: 'grid', gridTemplateColumns: '1fr 300px 1fr', alignItems: 'center', gap: 34}}>
        <div style={{opacity: appear(frame, 3)}}><RefPill name="refs/heads/main" value="C1" color={COLOR.git.main} /></div>
        <div style={{textAlign: 'center', opacity: appear(frame, 8)}}>
          <div style={{borderTop: `4px dashed ${COLOR.stroke.strong}`, height: 2}} />
          <div style={{fontFamily: FONT.mono, ...TYPE.ui, color: COLOR.text.secondary, marginTop: 22}}>upstream 配置</div>
        </div>
        <div style={{opacity: appear(frame, 5.5)}}><RefPill name="refs/remotes/origin/main" value="C2" color={COLOR.git.head} /></div>
      </div>
      <div style={{position: 'absolute', left: 270, right: 270, top: 564, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52}}>
        <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.main, textAlign: 'center', opacity: appear(frame, 12)}}>local tracking branch</div>
        <div style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.head, textAlign: 'center', opacity: appear(frame, 12)}}>remote-tracking ref</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 738, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, opacity: appear(frame, 19)}}>
        <span style={{fontFamily: FONT.mono, ...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.head}}>origin/main</span>
        <span style={{fontFamily: FONT.mono, ...TYPE.title, color: COLOR.text.tertiary}}>→</span>
        <span style={{fontFamily: FONT.mono, ...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.feature}}>team/main</span>
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('tracking-branch')} width={1320} bottom={64} auditId="ep12-tracking-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene tracking-branch:end

const SummaryRow: React.FC<{name: string; place: string; mover: string; color: string; opacity: number}> = ({name, place, mover, color, opacity}) => (
  <div style={{display: 'grid', gridTemplateColumns: '420px 320px 1fr', alignItems: 'center', gap: 34, opacity, transform: `translateY(${(1 - opacity) * 12}px)`}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.title, fontWeight: WEIGHT.bold, color}}>{name}</div>
    <div style={{...TYPE.subtitle, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>{place}</div>
    <div style={{...TYPE.body, color: COLOR.text.secondary}}>{mover}</div>
  </div>
);

// @git-course-scene takeaway:start
const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '138px 220px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>先问：它住在哪里，谁会移动它？</div>
      <CenterInRect rect={EP12_TAKEAWAY_BODY} auditId="ep12-takeaway-body">
        <div data-audit-id="ep12-summary" style={{display: 'grid', gap: 42, width: '100%'}}>
          <SummaryRow name="server main" place="服务器" mover="服务器收到 ref 更新时改变" color={COLOR.git.feature} opacity={appear(frame, 2.5)} />
          <SummaryRow name="origin/main" place="本地" mover="fetch 等通信后更新" color={COLOR.git.head} opacity={appear(frame, 7.2)} />
          <SummaryRow name="local main" place="本地" mover="commit / merge / rebase 更新" color={COLOR.git.main} opacity={appear(frame, 12.3)} />
        </div>
      </CenterInRect>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep12-takeaway-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene takeaway:end

const COMPONENTS = {
  hook: HookScene,
  'three-places': ThreePlacesScene,
  'stale-bookmark': StaleBookmarkScene,
  'real-refs': RealRefsScene,
  'fetch-updates': FetchUpdatesScene,
  'tracking-branch': TrackingBranchScene,
  takeaway: TakeawayScene,
};

export const Ep12RemoteTrackingBranches: React.FC = () => {
  const frame = useCurrentFrame();
  return <CourseLayout seriesTitle={EP12.seriesTitle} episodeTitle={EP12.title} scenes={EP12_SCENES} currentFrame={frame} showHeader={(current) => current >= RUNTIME.start('three-places')} showEpisodeTitle={(current) => current >= RUNTIME.start('three-places')}>
    <EpisodeTimeline runtime={RUNTIME} components={COMPONENTS} />
  </CourseLayout>;
};
