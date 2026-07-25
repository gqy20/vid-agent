import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  EP06_PLAN_BEFORE_EDIT_DURATION_IN_FRAMES,
  EP06_PLAN_BEFORE_EDIT_EPISODE,
  EP06_PLAN_BEFORE_EDIT_SCENES,
  getEp06Scene,
} from '../data/ep06PlanBeforeEdit';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, RecordedTerminalFrames, SceneSequence, SyncedNarrationTrack, TerminalFocus} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP06_PLAN_BEFORE_EDIT_DURATION_IN_FRAMES};
const episode = EP06_PLAN_BEFORE_EDIT_EPISODE;
const terminalClips = {
  investigation: {directory: 'claude-code-course/terminal/ep06-plan-before-edit-readonly-investigation-frames', frameCount: 459},
  review: {directory: 'claude-code-course/terminal/ep06-plan-before-edit-plan-review-frames', frameCount: 180},
  revised: {directory: 'claude-code-course/terminal/ep06-plan-before-edit-revised-plan-frames', frameCount: 281},
} as const;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) => motionProgress(frame, at, duration, EASE.enter);
const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => <div style={{...TYPE.heading, textAlign: align}}>{title}</div>;

const Signal: React.FC<{icon: EvidenceIconName; label: string; detail?: string; tone: string; progress: number; muted?: boolean}> = ({icon, label, detail, tone, progress, muted}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress * (muted ? 0.35 : 1), translate: `0 ${(1 - progress) * 18}px`}}>
    <EvidenceIcon name={icon} size={48} tone={muted ? COLOR.text.tertiary : tone} />
    <div style={{...TYPE.label, color: muted ? COLOR.text.tertiary : tone, fontWeight: WEIGHT.bold, marginTop: 20}}>{label}</div>
    {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 10}}>{detail}</div> : null}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const branch = enter(frame, 72, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 20)}}>{getEp06Scene('hook').title}</div>
      <div style={{position: 'absolute', left: 320, right: 320, top: 520, display: 'grid', gridTemplateColumns: '1fr 150px 1fr', alignItems: 'center'}}>
        <Signal icon="file" label="可验证任务" detail="UI · API · data · tests" tone={COLOR.text.brand} progress={enter(frame, 40)} />
        <div style={{height: 2, background: COLOR.stroke.default, scale: `${branch} 1`, transformOrigin: 'left center'}} />
        <Signal icon="route" label="先审查路径？" detail="Plan Mode" tone={COLOR.text.info} progress={branch} />
      </div>
    </AbsoluteFill>
  );
};

const PlanBoundaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cases = [
    {icon: 'edit' as const, label: '局部修复', detail: '落点明确 · 反馈直接', tone: COLOR.text.success, decision: '直接调查与修改'},
    {icon: 'graph' as const, label: '跨层功能', detail: '数据形状 · 兼容 · UI · tests', tone: COLOR.text.brand, decision: '先展开取舍'},
  ];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp06Scene('plan-boundary').title} align="center" />
      <div style={{position: 'absolute', left: 270, right: 270, top: 340, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 190}}>
        {cases.map((item, index) => (
          <div key={item.label} style={{opacity: enter(frame, 24 + index * 26)}}>
            <Signal {...item} progress={1} />
            <div style={{...TYPE.subheading, textAlign: 'center', marginTop: 60}}>{item.decision}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ReadonlyExplorationScene: React.FC = () => {
  return (
    <AbsoluteFill style={scenePad}>
      <TerminalFocus title={getEp06Scene('readonly-exploration').title} terminalInAt={30}>
        <RecordedTerminalFrames
          frameDirectory={terminalClips.investigation.directory}
          frameCount={terminalClips.investigation.frameCount}
          title="claude-code-lab · Plan Mode · 只读调查"
          zoom={1.02}
        />
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const PlanFlow: React.FC<{progress: number; highlightGaps?: boolean}> = ({progress, highlightGaps}) => {
  const steps = [
    ['01', '领域数据', 'dueDate?'],
    ['02', '接口兼容', highlightGaps ? '缺：非法日期' : '旧任务兼容'],
    ['03', '列表展示', highlightGaps ? '缺：无日期状态' : '无日期保持安静'],
    ['04', '分层验证', 'test · build · runtime'],
  ] as const;
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48}}>
      {steps.map(([index, title, detail], itemIndex) => (
        <div key={index} style={{opacity: enter(progress, itemIndex * 16, MOTION.structural), translate: `0 ${(1 - enter(progress, itemIndex * 16, MOTION.structural)) * 16}px`}}>
          <div style={{...TYPE.codeSmall, color: highlightGaps && itemIndex > 0 && itemIndex < 3 ? COLOR.text.danger : COLOR.text.brand}}>{index}</div>
          <div style={{...TYPE.subheading, marginTop: 13}}>{title}</div>
          <div style={{...TYPE.labelSmall, color: highlightGaps && itemIndex > 0 && itemIndex < 3 ? COLOR.text.danger : COLOR.text.secondary, marginTop: 17}}>{detail}</div>
        </div>
      ))}
    </div>
  );
};

const ReviewPlanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalOut = 1 - enter(frame, 108, 18);
  const planIn = enter(frame, 112, 20);
  const gaps = frame >= seconds(8.2);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp06Scene('review-the-plan').title} align="center" />
      <div style={{position: 'absolute', left: 150, right: 150, top: 220, bottom: 125, opacity: terminalOut}}>
        <RecordedTerminalFrames
          frameDirectory={terminalClips.review.directory}
          frameCount={terminalClips.review.frameCount}
          title="claude-code-lab · 第一版计划"
          zoom={1.02}
        />
      </div>
      <div style={{position: 'absolute', left: 160, right: 160, top: 420, opacity: planIn}}>
        <PlanFlow progress={Math.max(0, frame - 112)} highlightGaps={gaps} />
      </div>
      <div style={{position: 'absolute', left: 650, right: 650, bottom: 165, ...TYPE.labelSmall, color: gaps ? COLOR.text.danger : COLOR.text.tertiary, textAlign: 'center', opacity: planIn}}>{gaps ? '文件清单不能替代行为边界' : '第一版计划'}</div>
    </AbsoluteFill>
  );
};

const ReviseApproveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalOut = 1 - enter(frame, 258, 18);
  const approved = enter(frame, 266, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp06Scene('revise-and-approve').title} align="center" />
      <div style={{position: 'absolute', left: 150, right: 150, top: 220, bottom: 125, opacity: terminalOut}}>
        <RecordedTerminalFrames
          frameDirectory={terminalClips.revised.directory}
          frameCount={terminalClips.revised.frameCount}
          title="claude-code-lab · 修订计划与零写入证据"
          zoom={1.02}
        />
      </div>
      <div style={{position: 'absolute', left: 170, right: 170, top: 390, opacity: approved}}>
        <PlanFlow progress={Math.max(0, frame - 266)} />
      </div>
      <div style={{position: 'absolute', left: 690, right: 690, bottom: 150, display: 'grid', justifyItems: 'center', opacity: approved}}>
        <EvidenceIcon name="check" size={48} tone={COLOR.text.success} />
        <div style={{...TYPE.codeSmall, color: COLOR.text.success, marginTop: 12}}>DIRECTION · SCOPE · EXIT</div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['route', '计划', '修改顺序', COLOR.text.brand],
    ['permission', '权限', '调用决策', COLOR.text.warning],
    ['check', '恢复', '状态回退', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp06Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 270, right: 270, top: 440, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 120}}>
        {steps.map(([icon, label, detail, tone], index) => <Signal key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 25 + index * 20)} />)}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = {
  hook: HookScene,
  'plan-boundary': PlanBoundaryScene,
  'readonly-exploration': ReadonlyExplorationScene,
  'review-the-plan': ReviewPlanScene,
  'revise-and-approve': ReviseApproveScene,
  takeaway: TakeawayScene,
};

export const Ep06PlanBeforeEdit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout seriesTitle="Claude Code 实操" episodeTitle={episode.title} scenes={EP06_PLAN_BEFORE_EDIT_SCENES} currentFrame={frame} showHeader={(current) => current >= seconds(12)}>
      {episode.scenes.map((scene) => {
        const timing = getEp06Scene(scene.id);
        const Scene = SCENES[scene.id];
        if (!Scene) throw new Error(`Missing EP06 scene component: ${scene.id}`);
        return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;
      })}
      {episode.status === 'draft' ? <SyncedNarrationTrack manifest="claude-code-course/audio/ep06-plan-before-edit/captions.json" auditPrefix="ep06-synced-caption" /> : null}
    </CourseLayout>
  );
};
