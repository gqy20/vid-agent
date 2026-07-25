import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  EP07_PERMISSIONS_RECOVERY_DURATION_IN_FRAMES,
  EP07_PERMISSIONS_RECOVERY_EPISODE,
  EP07_PERMISSIONS_RECOVERY_SCENES,
  getEp07Scene,
} from '../data/ep07PermissionsRecovery';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, SceneSequence, SyncedNarrationTrack} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP07_PERMISSIONS_RECOVERY_DURATION_IN_FRAMES};
const episode = EP07_PERMISSIONS_RECOVERY_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) => motionProgress(frame, at, duration, EASE.enter);
const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => <div style={{...TYPE.heading, textAlign: align}}>{title}</div>;
const Point: React.FC<{icon: EvidenceIconName; label: string; detail?: string; tone: string; progress: number; opacity?: number}> = ({icon, label, detail, tone, progress, opacity = 1}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress * opacity, translate: `0 ${(1 - progress) * 18}px`}}>
    <EvidenceIcon name={icon} size={48} tone={tone} />
    <div style={{...TYPE.label, color: tone, fontWeight: WEIGHT.bold, marginTop: 20}}>{label}</div>
    {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 10}}>{detail}</div> : null}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const request = enter(frame, 68, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 20)}}>{getEp07Scene('hook').title}</div>
      <div style={{position: 'absolute', left: 330, right: 330, top: 520, display: 'grid', gridTemplateColumns: '1fr 160px 1fr', alignItems: 'center'}}>
        <Point icon="route" label="APPROVED PLAN" detail="方向与范围" tone={COLOR.text.brand} progress={enter(frame, 40)} />
        <div style={{height: 2, background: COLOR.stroke.default, scale: `${request} 1`, transformOrigin: 'left center'}} />
        <Point icon="permission" label="EDIT REQUEST" detail="一次真实写入" tone={COLOR.text.warning} progress={request} />
      </div>
    </AbsoluteFill>
  );
};

const ThreeBoundariesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const layers = [
    ['permission', '权限', '调用前 · 是否获准', COLOR.text.warning],
    ['sandbox', '沙箱', '运行中 · 能触达什么', COLOR.text.info],
    ['route', '恢复', '改变后 · 怎样回退', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp07Scene('three-boundaries').title} align="center" />
      <div style={{position: 'absolute', left: 230, right: 230, top: 405, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 120}}>
        {layers.map(([icon, label, detail, tone], index) => <Point key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 28 + index * 24)} />)}
      </div>
      <div style={{position: 'absolute', left: 530, right: 530, bottom: 185, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', ...TYPE.codeSmall, color: COLOR.text.tertiary, textAlign: 'center', opacity: enter(frame, 118)}}>
        <span>DECISION</span><span>RESOURCE</span><span>STATE</span>
      </div>
    </AbsoluteFill>
  );
};

const ControlledExecutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const actions = [
    ['read', 'Read', '直接读取', 'ALLOWED', COLOR.text.info],
    ['edit', 'Edit', '目标文件', 'ASK', COLOR.text.warning],
    ['shell', 'Bash', 'pnpm test', 'ASK', COLOR.text.warning],
    ['check', 'Result', '写入与输出', 'RECORDED', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp07Scene('controlled-execution').title} align="center" />
      <div style={{position: 'absolute', left: 190, right: 190, top: 360, display: 'grid', gap: 44}}>
        {actions.map(([icon, tool, detail, decision, tone], index) => (
          <div key={tool} style={{display: 'grid', gridTemplateColumns: '52px 180px 1fr 180px', gap: 24, alignItems: 'center', opacity: enter(frame, 24 + index * 24), translate: `${(1 - enter(frame, 24 + index * 24)) * -18}px 0`}}>
            <EvidenceIcon name={icon} size={34} tone={tone} />
            <span style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{tool}</span>
            <span style={{...TYPE.subheading}}>{detail}</span>
            <span style={{...TYPE.codeSmall, color: tone, justifySelf: 'end'}}>{decision}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ScopeDriftScene: React.FC = () => {
  const frame = useCurrentFrame();
  const files = [
    ['src/tasks/create-task.js', true],
    ['src/http/create-task-route.js', true],
    ['src/ui/task-list.js', true],
    ['generated/schema.json', false],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp07Scene('scope-drift').title} align="center" />
      <div style={{position: 'absolute', left: 330, right: 330, top: 340, display: 'grid', gap: 34}}>
        {files.map(([file, planned], index) => (
          <div key={file} style={{display: 'grid', gridTemplateColumns: '54px 1fr auto', alignItems: 'center', gap: 24, opacity: enter(frame, 24 + index * 22)}}>
            <EvidenceIcon name={planned ? 'edit' : 'stop'} size={34} tone={planned ? COLOR.text.brand : COLOR.text.danger} />
            <span style={{...TYPE.code, fontWeight: WEIGHT.bold}}>{file}</span>
            <span style={{...TYPE.codeSmall, color: planned ? COLOR.text.success : COLOR.text.danger}}>{planned ? 'IN PLAN' : 'OUT OF SCOPE'}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 700, right: 700, bottom: 165, textAlign: 'center', ...TYPE.labelSmall, color: COLOR.text.tertiary, opacity: enter(frame, 126)}}>动作可以合法，累计状态仍可能偏离</div>
    </AbsoluteFill>
  );
};

const RewindGitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const clean = enter(frame, 120, MOTION.structural);
  const systems = [
    ['route', 'CHECKPOINT', '会话与 Claude 编辑', COLOR.text.brand],
    ['graph', 'GIT', '整个工作区与提交历史', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp07Scene('rewind-and-git').title} align="center" />
      <div style={{position: 'absolute', left: 260, right: 260, top: 350, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 190}}>
        {systems.map(([icon, label, detail, tone], index) => <Point key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 26 + index * 22)} />)}
      </div>
      <div style={{position: 'absolute', left: 590, right: 590, bottom: 170, display: 'grid', justifyItems: 'center', opacity: clean}}>
        <EvidenceIcon name="check" size={46} tone={COLOR.text.success} />
        <div style={{...TYPE.codeSmall, color: COLOR.text.success, marginTop: 12}}>generated/schema.json · restored</div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const states = [
    ['permission', '调用已审查', COLOR.text.warning],
    ['sandbox', '资源受约束', COLOR.text.info],
    ['graph', 'diff 已收敛', COLOR.text.success],
    ['test', '验证待闭合', COLOR.text.brand],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp07Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 160, right: 160, top: 440, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 66}}>
        {states.map(([icon, label, tone], index) => <Point key={label} icon={icon} label={label} tone={tone} progress={enter(frame, 24 + index * 18)} />)}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = {hook: HookScene, 'three-boundaries': ThreeBoundariesScene, 'controlled-execution': ControlledExecutionScene, 'scope-drift': ScopeDriftScene, 'rewind-and-git': RewindGitScene, takeaway: TakeawayScene};
export const Ep07PermissionsRecovery: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout seriesTitle="Claude Code 实操" episodeTitle={episode.title} scenes={EP07_PERMISSIONS_RECOVERY_SCENES} currentFrame={frame} showHeader={(current) => current >= seconds(12)}>
      {episode.scenes.map((scene) => {const timing = getEp07Scene(scene.id); const Scene = SCENES[scene.id]; if (!Scene) throw new Error(`Missing EP07 scene component: ${scene.id}`); return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;})}
      {episode.status === 'draft' ? <SyncedNarrationTrack manifest="claude-code-course/audio/ep07-permissions-recovery/captions.json" auditPrefix="ep07-synced-caption" /> : null}
    </CourseLayout>
  );
};
