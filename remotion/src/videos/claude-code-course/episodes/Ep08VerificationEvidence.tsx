import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EP08_VERIFICATION_EVIDENCE_DURATION_IN_FRAMES, EP08_VERIFICATION_EVIDENCE_EPISODE, EP08_VERIFICATION_EVIDENCE_SCENES, getEp08Scene} from '../data/ep08VerificationEvidence';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, SceneSequence, SyncedNarrationTrack} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP08_VERIFICATION_EVIDENCE_DURATION_IN_FRAMES};
const episode = EP08_VERIFICATION_EVIDENCE_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) => motionProgress(frame, at, duration, EASE.enter);
const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => <div style={{...TYPE.heading, textAlign: align}}>{title}</div>;
const Proof: React.FC<{icon: EvidenceIconName; label: string; detail?: string; tone: string; progress: number}> = ({icon, label, detail, tone, progress}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress, translate: `0 ${(1 - progress) * 18}px`}}>
    <EvidenceIcon name={icon} size={46} tone={tone} />
    <div style={{...TYPE.label, color: tone, fontWeight: WEIGHT.bold, marginTop: 19}}>{label}</div>
    {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 10}}>{detail}</div> : null}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const question = enter(frame, 74, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 20)}}>{getEp08Scene('hook').title}</div>
      <div style={{position: 'absolute', left: 350, right: 350, top: 520, display: 'grid', gridTemplateColumns: '1fr 160px 1fr', alignItems: 'center'}}>
        <Proof icon="test" label="TESTS" detail="green" tone={COLOR.text.success} progress={enter(frame, 42)} />
        <div style={{height: 2, background: COLOR.stroke.default, scale: `${question} 1`, transformOrigin: 'left center'}} />
        <Proof icon="observe" label="USER BEHAVIOR" detail="仍未观察" tone={COLOR.text.warning} progress={question} />
      </div>
    </AbsoluteFill>
  );
};

const EvidenceLayersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const layers = [
    ['test', 'TEST', '局部逻辑', COLOR.text.warning],
    ['file', 'TYPE', '静态契约', COLOR.text.info],
    ['shell', 'BUILD', '集成', COLOR.text.brand],
    ['observe', 'RUNTIME', '用户行为', COLOR.text.success],
    ['graph', 'DIFF', '实际范围', COLOR.brand.orange],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp08Scene('evidence-layers').title} align="center" />
      <div style={{position: 'absolute', left: 120, right: 120, top: 420, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 40}}>
        {layers.map(([icon, label, detail, tone], index) => <Proof key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 24 + index * 16)} />)}
      </div>
    </AbsoluteFill>
  );
};

const TestBuildScene: React.FC = () => {
  const frame = useCurrentFrame();
  const commands = [
    ['test', 'pnpm test due-date', 'PASS', COLOR.text.warning],
    ['test', 'pnpm test', 'PASS', COLOR.text.success],
    ['file', 'pnpm typecheck', 'EXIT 0', COLOR.text.info],
    ['shell', 'pnpm build', 'EXIT 0', COLOR.text.brand],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp08Scene('test-and-build').title} align="center" />
      <div style={{position: 'absolute', left: 270, right: 270, top: 340, display: 'grid', gap: 42}}>
        {commands.map(([icon, command, result, tone], index) => (
          <div key={command} style={{display: 'grid', gridTemplateColumns: '52px 1fr 160px', gap: 24, alignItems: 'center', opacity: enter(frame, 24 + index * 24)}}>
            <EvidenceIcon name={icon} size={34} tone={tone} />
            <span style={{...TYPE.code, fontWeight: WEIGHT.bold}}>{command}</span>
            <span style={{...TYPE.codeSmall, color: tone, justifySelf: 'end'}}>{result}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const RuntimeGapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const gap = enter(frame, 96, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp08Scene('runtime-gap').title} align="center" />
      <div style={{position: 'absolute', left: 230, right: 230, top: 360, display: 'grid', gridTemplateColumns: '1fr 180px 1fr', alignItems: 'center'}}>
        <Proof icon="route" label="API RESPONSE" detail="2026-07-26" tone={COLOR.text.info} progress={enter(frame, 28)} />
        <div style={{height: 2, background: gap ? COLOR.text.danger : COLOR.stroke.default, scale: `${enter(frame, 58)} 1`, transformOrigin: 'left center'}} />
        <Proof icon="observe" label="TASK LIST" detail="2026-07-25" tone={gap ? COLOR.text.danger : COLOR.text.success} progress={enter(frame, 72)} />
      </div>
      <div style={{position: 'absolute', left: 610, right: 610, bottom: 175, textAlign: 'center', opacity: gap}}>
        <div style={{...TYPE.codeSmall, color: COLOR.text.danger}}>LOCAL TIMEZONE · -1 DAY</div>
      </div>
    </AbsoluteFill>
  );
};

const FixRecheckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['test', '补复现测试', COLOR.text.danger],
    ['edit', '修正格式化', COLOR.text.brand],
    ['check', '重跑全量证据', COLOR.text.success],
    ['graph', '核对最终 diff', COLOR.text.info],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp08Scene('fix-and-recheck').title} align="center" />
      <div style={{position: 'absolute', left: 170, right: 170, top: 420, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 75}}>
        {steps.map(([icon, label, tone], index) => <Proof key={label} icon={icon} label={label} tone={tone} progress={enter(frame, 24 + index * 24)} />)}
      </div>
      <div style={{position: 'absolute', left: 720, right: 720, bottom: 165, display: 'grid', justifyItems: 'center', opacity: enter(frame, 132)}}>
        <EvidenceIcon name="check" size={44} tone={COLOR.text.success} />
        <div style={{...TYPE.codeSmall, color: COLOR.text.success, marginTop: 12}}>EVIDENCE SET · CLOSED</div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const repeated = [
    ['shell', 'pnpm'],
    ['test', '验证顺序'],
    ['file', '日期约定'],
    ['permission', '保护目录'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp08Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 180, right: 180, top: 440, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 70}}>
        {repeated.map(([icon, label], index) => <Proof key={label} icon={icon} label={label} tone={index === 3 ? COLOR.text.warning : COLOR.text.brand} progress={enter(frame, 24 + index * 18)} />)}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = {hook: HookScene, 'evidence-layers': EvidenceLayersScene, 'test-and-build': TestBuildScene, 'runtime-gap': RuntimeGapScene, 'fix-and-recheck': FixRecheckScene, takeaway: TakeawayScene};
export const Ep08VerificationEvidence: React.FC = () => {
  const frame = useCurrentFrame();
  return <CourseLayout seriesTitle="Claude Code 实操" episodeTitle={episode.title} scenes={EP08_VERIFICATION_EVIDENCE_SCENES} currentFrame={frame} showHeader={(current) => current >= seconds(12)}>{episode.scenes.map((scene) => {const timing = getEp08Scene(scene.id); const Scene = SCENES[scene.id]; if (!Scene) throw new Error(`Missing EP08 scene component: ${scene.id}`); return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;})}{episode.status === 'draft' ? <SyncedNarrationTrack manifest="claude-code-course/audio/ep08-verification-evidence/captions.json" auditPrefix="ep08-synced-caption" /> : null}</CourseLayout>;
};
