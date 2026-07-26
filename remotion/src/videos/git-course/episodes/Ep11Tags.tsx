import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EP11} from '../data/episodes';
import {EP11_DURATION_IN_FRAMES, EP11_SCENES} from '../data/episodeTimelines.generated';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {
  CourseBranchLabel,
  CourseCommitNode,
  CourseGraphEdge,
  CourseHeadMarker,
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

export {EP11_DURATION_IN_FRAMES, EP11_SCENES};

const RUNTIME = createEpisodeRuntime(EP11_SCENES);
const appear = (frame: number, at: number, duration = 0.7) => interpolate(frame, [seconds(at), seconds(at + duration)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const terminalCue = <T extends keyof typeof TERMINAL_RECORDINGS>(id: T, from: number, duration: number) => ({
  id,
  from: seconds(from),
  durationInFrames: seconds(duration),
  src: `git-course-lab/terminal/${id}.mp4`,
  holdFrameSrc: `git-course-lab/terminal/${id}-hold.png`,
  holdFromFrame: TERMINAL_RECORDINGS[id].holdFromFrame,
});

const C0 = {x: 220, y: 310};
const C1 = {x: 500, y: 310};
const C2 = {x: 780, y: 310};
const TAG_COLOR = COLOR.git.head;
const REF_NODE_RADIUS = courseCommitOuterRadius({scale: 1.28, strong: true});
const EP11_TAKEAWAY_BODY = {x: 240, y: 300, width: 1440, height: 560};

const RefHistory: React.FC<{progress?: number; showC2?: boolean; width?: number; opacity?: number}> = ({progress = 1, showC2 = true, width = 1040, opacity = 1}) => {
  const mainX = showC2 ? interpolate(progress, [0, 1], [C1.x, C2.x]) : C1.x;
  const c2Opacity = showC2 ? progress : 0;
  return (
    <svg width={width} height="590" viewBox="0 0 1040 590" style={{display: 'block', opacity, overflow: 'visible'}}>
      <g data-graph-layer="edges">
        <CourseGraphEdge from={courseCommitAnchor(C1.x, C1.y, {scale: 1.28})} to={courseCommitAnchor(C0.x, C0.y, {scale: 1.28})} />
        {showC2 ? <CourseGraphEdge from={courseCommitAnchor(C2.x, C2.y, {scale: 1.28})} to={courseCommitAnchor(C1.x, C1.y, {scale: 1.28})} opacity={c2Opacity} /> : null}
      </g>
      <g data-graph-layer="refs">
        <CourseBranchLabel name="v1.0" x={C1.x} y={466} targetX={C1.x} targetY={C1.y} targetRadius={REF_NODE_RADIUS} color={TAG_COLOR} />
        <CourseBranchLabel name="main" x={mainX} y={145} targetX={mainX} targetY={C1.y + (mainX - C1.x) * 0} targetRadius={REF_NODE_RADIUS} color={COLOR.git.main} />
      </g>
      <g data-graph-layer="nodes">
        <CourseCommitNode id="C0" {...C0} scale={1.28} />
        <CourseCommitNode id="C1" {...C1} scale={1.28} tone="base" />
        {showC2 ? <CourseCommitNode id="C2" {...C2} scale={1.28} tone="main" opacity={c2Opacity} /> : null}
      </g>
      <CourseHeadMarker x={mainX + 132} y={145} />
    </svg>
  );
};

const NamespaceCard: React.FC<{path: string; role: string; color: string; opacity?: number}> = ({path, role, color, opacity = 1}) => (
  <div style={{opacity, border: `2px solid ${color}`, borderRadius: 20, background: COLOR.canvas.raised, padding: '26px 30px', boxShadow: `0 16px 32px ${COLOR.effects.shadowSoft}`}}>
    <div style={{fontFamily: FONT.mono, ...TYPE.subtitle, fontWeight: WEIGHT.bold, color}}>{path}</div>
    <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 12}}>{role}</div>
  </div>
);

// @git-course-scene hook:start
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOut = interpolate(frame, [seconds(1.8), seconds(2.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const move = interpolate(frame, [seconds(6.2), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <EpisodeTitleCard index="11." keyword="Tag" suffix="还是 Branch" opacity={titleOut} underlineScale={appear(frame, 0.4, 0.5)} auditId="ep11-hook-title" />
      <div style={{position: 'absolute', left: 390, top: 190, opacity: appear(frame, 2.6)}}><RefHistory progress={move} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 748, textAlign: 'center', ...TYPE.title, fontWeight: WEIGHT.bold, opacity: appear(frame, 9.6)}}>两个名字，为什么不会一起移动？</div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('hook')} width={1320} bottom={64} auditId="ep11-hook-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene hook:end

// @git-course-scene two-names:start
const TwoNamesScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '116px 164px 112px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>先看共同点：它们都是 refs</div>
      <div style={{position: 'absolute', left: 140, top: 244, width: 650}}>
        <NamespaceCard path="refs/heads/main" role="本地 branch 的名字" color={COLOR.git.main} opacity={appear(frame, 2.5)} />
        <div style={{height: 28}} />
        <NamespaceCard path="refs/tags/v1.0" role="本地 tag 的名字" color={TAG_COLOR} opacity={appear(frame, 6.5)} />
      </div>
      <div style={{position: 'absolute', right: 138, top: 224}}><RefHistory showC2={false} width={920} opacity={appear(frame, 8.8)} /></div>
      <div data-audit-id="ep11-common-result" style={{position: 'absolute', right: 220, top: 708, ...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.text.primary, opacity: appear(frame, 14.2)}}>都能交给 show / diff / log</div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('two-names')} width={1320} bottom={64} auditId="ep11-two-names-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene two-names:end

// @git-course-scene real-tag:start
const RealTagScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [terminalCue('ep11-create-tag', 0, 22)] as const;
  return (
    <AbsoluteFill>
      <RecordedTerminalCueSequence cues={cues} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep11-create-tag-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('real-tag')} width={1320} bottom={64} auditId="ep11-real-tag-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene real-tag:end

// @git-course-scene branch-moves:start
const BranchMovesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [seconds(2.5), seconds(6.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const showTerminal = frame >= seconds(14);
  const cues = [terminalCue('ep11-after-commit', 14, 12)] as const;
  return (
    <AbsoluteFill>
      {!showTerminal ? <>
        <div style={{position: 'absolute', left: 150, right: 150, top: 112, ...TYPE.hero, fontWeight: WEIGHT.bold}}>Commit 更新谁？</div>
        <div style={{position: 'absolute', left: 390, top: 194}}><RefHistory progress={move} /></div>
        <div data-audit-id="ep11-movement-summary" style={{position: 'absolute', left: 0, right: 0, top: 746, display: 'flex', justifyContent: 'center', gap: 68, opacity: appear(frame, 7.4)}}>
          <span style={{...TYPE.title, fontWeight: WEIGHT.bold, color: COLOR.git.main}}>main → C2</span>
          <span style={{...TYPE.title, fontWeight: WEIGHT.bold, color: TAG_COLOR}}>v1.0 → C1</span>
        </div>
      </> : null}
      <RecordedTerminalCueSequence cues={cues} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep11-after-commit-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('branch-moves')} width={1320} bottom={64} auditId="ep11-branch-moves-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene branch-moves:end

const ObjectCard: React.FC<{title: string; lines: readonly string[]; color: string; width?: number; opacity?: number}> = ({title, lines, color, width = 390, opacity = 1}) => (
  <div style={{opacity, width, minHeight: 260, border: `3px solid ${color}`, borderRadius: 24, background: COLOR.canvas.raised, padding: '28px 32px', boxSizing: 'border-box', boxShadow: `0 18px 38px ${COLOR.effects.shadowPanel}`}}>
    <div style={{...TYPE.title, color, fontWeight: WEIGHT.bold}}>{title}</div>
    <div style={{display: 'grid', gap: 12, marginTop: 24}}>{lines.map((line) => <div key={line} style={{fontFamily: FONT.mono, ...TYPE.code, color: COLOR.text.primary}}>{line}</div>)}</div>
  </div>
);

// @git-course-scene tag-types:start
const TagTypesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const showTerminal = frame >= seconds(18);
  const cues = [terminalCue('ep11-tag-object', 18, 10)] as const;
  return (
    <AbsoluteFill>
      {!showTerminal ? <>
        <div style={{position: 'absolute', left: 150, right: 150, top: 112, ...TYPE.hero, fontWeight: WEIGHT.bold}}>同样固定位置，结构并不相同</div>
        <div data-audit-id="ep11-tag-object-model" style={{position: 'absolute', left: 170, right: 170, top: 300, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 120}}>
          <div style={{display: 'grid', gridTemplateColumns: '390px 90px 220px', alignItems: 'center', opacity: appear(frame, 2.8)}}>
            <ObjectCard title="轻量 tag" lines={['refs/tags/v1.0']} color={TAG_COLOR} />
            <div style={{fontSize: 54, color: COLOR.text.tertiary}}>→</div>
            <ObjectCard title="commit" lines={['C1']} color={COLOR.git.commit} width={220} />
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '390px 90px 220px', alignItems: 'center', opacity: appear(frame, 8.2)}}>
            <ObjectCard title="附注 tag" lines={['target C1', 'tagger', 'message']} color={TAG_COLOR} />
            <div style={{fontSize: 54, color: COLOR.text.tertiary}}>→</div>
            <ObjectCard title="commit" lines={['C1']} color={COLOR.git.commit} width={220} />
          </div>
        </div>
      </> : null}
      <RecordedTerminalCueSequence cues={cues} rect={{x: 250, y: 132, width: 1420, height: 720}} mediaFit="cover" auditIdPrefix="ep11-tag-object-terminal" />
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('tag-types')} width={1320} bottom={64} auditId="ep11-tag-types-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene tag-types:end

const RepoBox: React.FC<{title: string; children: React.ReactNode; color: string; opacity?: number}> = ({title, children, color, opacity = 1}) => (
  <div style={{opacity, border: `3px solid ${color}`, borderRadius: 28, background: COLOR.canvas.raised, padding: '34px 38px', height: 380, boxSizing: 'border-box'}}>
    <div style={{...TYPE.title, color, fontWeight: WEIGHT.bold}}>{title}</div>
    <div style={{marginTop: 52}}>{children}</div>
  </div>
);

// @git-course-scene sharing:start
const SharingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shared = appear(frame, 10.5, 1.2);
  return (
    <AbsoluteFill style={{padding: '116px 180px 116px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>创建 tag ≠ 已经发布 tag</div>
      <div data-audit-id="ep11-local-remote-tags" style={{position: 'absolute', left: 180, right: 180, top: 284, display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center', gap: 34}}>
        <RepoBox title="本地仓库" color={COLOR.git.main}>
          <NamespaceCard path="refs/tags/v1.0" role="已经存在" color={TAG_COLOR} />
        </RepoBox>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: FONT.mono, fontSize: 54, color: COLOR.text.tertiary}}>→</div>
          <div style={{fontFamily: FONT.mono, ...TYPE.ui, color: COLOR.text.secondary, marginTop: 16}}>显式 push tag</div>
        </div>
        <RepoBox title="服务器仓库" color={COLOR.git.feature}>
          <div style={{opacity: shared}}><NamespaceCard path="refs/tags/v1.0" role="共享后出现" color={TAG_COLOR} /></div>
        </RepoBox>
      </div>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('sharing')} width={1320} bottom={64} auditId="ep11-sharing-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene sharing:end

const CompareLine: React.FC<{left: string; right: string; opacity: number}> = ({left, right, opacity}) => (
  <div style={{display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center', gap: 24, opacity, transform: `translateY(${(1 - opacity) * 12}px)`}}>
    <div style={{...TYPE.title, color: COLOR.git.main, fontWeight: WEIGHT.bold, textAlign: 'right'}}>{left}</div>
    <div style={{fontFamily: FONT.mono, ...TYPE.title, color: COLOR.text.tertiary, textAlign: 'center'}}>·</div>
    <div style={{...TYPE.title, color: TAG_COLOR, fontWeight: WEIGHT.bold}}>{right}</div>
  </div>
);

// @git-course-scene takeaway:start
const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{padding: '142px 240px 116px', boxSizing: 'border-box'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 24}}>
        <div style={{...TYPE.hero, color: COLOR.git.main, fontWeight: WEIGHT.bold, textAlign: 'right'}}>Branch</div>
        <div />
        <div style={{...TYPE.hero, color: TAG_COLOR, fontWeight: WEIGHT.bold}}>Tag</div>
      </div>
      <CenterInRect rect={EP11_TAKEAWAY_BODY} auditId="ep11-takeaway-body">
        <div data-audit-id="ep11-summary" style={{display: 'grid', gap: 42, width: '100%'}}>
          <CompareLine left="当前工作线" right="固定历史坐标" opacity={appear(frame, 2.6)} />
          <CompareLine left="commit 自动更新" right="commit 不自动更新" opacity={appear(frame, 6.8)} />
          <CompareLine left="本地持续发展" right="有意选择何时共享" opacity={appear(frame, 11.2)} />
        </div>
      </CenterInRect>
      <NarrationSubtitle frame={frame} cues={RUNTIME.captions('takeaway')} width={1320} bottom={64} auditId="ep11-takeaway-caption" />
    </AbsoluteFill>
  );
};
// @git-course-scene takeaway:end

const COMPONENTS = {
  hook: HookScene,
  'two-names': TwoNamesScene,
  'real-tag': RealTagScene,
  'branch-moves': BranchMovesScene,
  'tag-types': TagTypesScene,
  sharing: SharingScene,
  takeaway: TakeawayScene,
};

export const Ep11Tags: React.FC = () => {
  const frame = useCurrentFrame();
  return <CourseLayout seriesTitle={EP11.seriesTitle} episodeTitle={EP11.title} scenes={EP11_SCENES} currentFrame={frame} showHeader={(current) => current >= RUNTIME.start('two-names')} showEpisodeTitle={(current) => current >= RUNTIME.start('two-names')}>
    <EpisodeTimeline runtime={RUNTIME} components={COMPONENTS} />
  </CourseLayout>;
};
