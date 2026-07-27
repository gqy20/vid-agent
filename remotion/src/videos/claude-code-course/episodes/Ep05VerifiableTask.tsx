import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  EP05_VERIFIABLE_TASK_DURATION_IN_FRAMES,
  EP05_VERIFIABLE_TASK_EPISODE,
  EP05_VERIFIABLE_TASK_SCENES,
  getEp05Scene,
} from '../data/ep05VerifiableTask';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {
  CourseLayout,
  EvidenceIcon,
  type EvidenceIconName,
  SceneSequence,
  SyncedNarrationTrack,
} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP05_VERIFIABLE_TASK_DURATION_IN_FRAMES};

const episode = EP05_VERIFIABLE_TASK_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => (
  <div style={{...TYPE.heading, textAlign: align}}>{title}</div>
);

const Node: React.FC<{
  icon: EvidenceIconName;
  label: string;
  detail?: string;
  tone: string;
  progress: number;
  muted?: boolean;
}> = ({icon, label, detail, tone, progress, muted = false}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress * (muted ? 0.38 : 1), translate: `0 ${(1 - progress) * 18}px`}}>
    <EvidenceIcon name={icon} size={48} tone={muted ? COLOR.text.tertiary : tone} />
    <div style={{...TYPE.label, color: muted ? COLOR.text.tertiary : tone, fontWeight: WEIGHT.bold, marginTop: 20}}>{label}</div>
    {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 9}}>{detail}</div> : null}
  </div>
);

const Connector: React.FC<{progress: number; tone?: string}> = ({progress, tone = COLOR.stroke.strong}) => (
  <div style={{height: 2, background: tone, scale: `${progress} 1`, transformOrigin: 'left center', opacity: progress}} />
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const taskIn = enter(frame, 102, MOTION.structural);
  const evidence = [
    ['route', '入口'],
    ['file', '规则'],
    ['edit', '状态'],
    ['test', '测试'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 0, MOTION.structural)}}>{getEp05Scene('hook').title}</div>
      <div style={{position: 'absolute', left: 190, right: 680, top: 520, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 52, opacity: 1 - taskIn * 0.48}}>
        {evidence.map(([icon, label], index) => <Node key={label} icon={icon} label={label} tone={[COLOR.brand.orange, COLOR.brand.blue, COLOR.brand.green, COLOR.text.warning][index]} progress={index === 0 ? 1 : enter(frame, 4 + index * 12)} />)}
      </div>
      <div style={{position: 'absolute', left: 1300, top: 585, width: 150}}><Connector progress={taskIn} tone={COLOR.text.brand} /></div>
      <div style={{position: 'absolute', right: 190, top: 465, width: 330, opacity: taskIn, translate: `${(1 - taskIn) * 20}px 0`}}>
        <Node icon="file" label="增加截止日期" detail="一条产品需求" tone={COLOR.text.brand} progress={taskIn} />
      </div>
    </AbsoluteFill>
  );
};

const ExploreOrDeliverScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lanes = [
    {icon: 'observe' as const, label: '探索', detail: '先发现影响范围', tone: COLOR.text.info, items: ['允许开放', '保留未知', '结果是理解']},
    {icon: 'check' as const, label: '交付', detail: '让任务自主闭环', tone: COLOR.text.brand, items: ['成功可观察', '边界可判断', '结果可验证']},
  ];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp05Scene('explore-or-deliver').title} align="center" />
      <div style={{position: 'absolute', left: 250, right: 250, top: 330, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 180}}>
        {lanes.map((lane, laneIndex) => (
          <div key={lane.label} style={{opacity: enter(frame, 24 + laneIndex * 22)}}>
            <Node icon={lane.icon} label={lane.label} detail={lane.detail} tone={lane.tone} progress={1} />
            <div style={{display: 'grid', gap: 22, marginTop: 44}}>
              {lane.items.map((item, index) => (
                <div key={item} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: enter(frame, 64 + laneIndex * 12 + index * 13)}}>
                  <span style={{width: 10, height: 10, borderRadius: 10, background: lane.tone}} />
                  <span style={{...TYPE.body, fontWeight: WEIGHT.bold}}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ObservableSymptomScene: React.FC = () => {
  const frame = useCurrentFrame();
  const currentIn = enter(frame, 24, MOTION.structural);
  const expectedIn = enter(frame, 86, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp05Scene('observable-symptom').title} align="center" />
      <div style={{position: 'absolute', left: 250, right: 250, top: 390, display: 'grid', gridTemplateColumns: '1fr 180px 1fr', alignItems: 'center'}}>
        <div style={{opacity: currentIn}}>
          <Node icon="file" label="当前任务" detail="title · completed" tone={COLOR.text.tertiary} progress={currentIn} />
          <div style={{...TYPE.labelSmall, color: COLOR.text.danger, textAlign: 'center', marginTop: 28}}>没有截止日期</div>
        </div>
        <Connector progress={expectedIn} tone={COLOR.text.brand} />
        <div style={{opacity: expectedIn}}>
          <Node icon="check" label="期待行为" detail="optional dueDate" tone={COLOR.text.brand} progress={expectedIn} />
          <div style={{...TYPE.labelSmall, color: COLOR.text.success, textAlign: 'center', marginTop: 28}}>接口与列表保持一致</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EvidenceBoundaryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const evidence = [
    ['route', 'HTTP', 'create-task-route.js', COLOR.brand.orange],
    ['file', 'DOMAIN', 'create-task.js', COLOR.brand.blue],
    ['edit', 'STORE', 'task-store.js', COLOR.brand.green],
    ['test', 'TEST', 'route.test.js', COLOR.text.warning],
  ] as const;
  const exclusions = [
    ['permission', '认证'],
    ['graph', '新日期库'],
    ['edit', '标题校验'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp05Scene('evidence-and-boundary').title} align="center" />
      <div style={{position: 'absolute', left: 150, right: 150, top: 330, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 44}}>
        {evidence.map(([icon, label, detail, tone], index) => <Node key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 22 + index * 14)} />)}
      </div>
      <div style={{position: 'absolute', left: 360, right: 360, bottom: 175, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70}}>
        {exclusions.map(([icon, label], index) => <Node key={label} icon={icon} label={`范围外 · ${label}`} tone={COLOR.text.tertiary} progress={enter(frame, 104 + index * 12)} muted />)}
      </div>
    </AbsoluteFill>
  );
};

const VerificationContractScene: React.FC = () => {
  const frame = useCurrentFrame();
  const proofs = [
    ['test', 'TESTS', '有日期 · 无日期 · 非法日期', COLOR.text.warning],
    ['shell', 'BUILD', 'typecheck · build', COLOR.text.info],
    ['observe', 'RUNTIME', '响应与列表一致', COLOR.text.success],
  ] as const;
  const complete = enter(frame, 150, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp05Scene('verification-contract').title} align="center" />
      <div style={{position: 'absolute', left: 180, right: 500, top: 420, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70}}>
        {proofs.map(([icon, label, detail, tone], index) => <Node key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 28 + index * 24)} />)}
      </div>
      <div style={{position: 'absolute', left: 1400, top: 565, width: 120}}><Connector progress={complete} tone={COLOR.text.success} /></div>
      <div style={{position: 'absolute', right: 150, top: 475, width: 260}}>
        <Node icon="check" label="DONE?" detail="由证据回答" tone={COLOR.text.success} progress={complete} />
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['现状', '没有 dueDate'],
    ['目标', '可选日期可写入并展示'],
    ['证据', 'route · domain · store · tests'],
    ['边界', '不改认证 · 不加日期库'],
    ['验收', 'tests · build · runtime'],
  ] as const;
  const planIn = enter(frame, 150, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 130}}>
      <SceneHeading title={getEp05Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 300, top: 305, width: 900, display: 'grid', gap: 25}}>
        {rows.map(([label, value], index) => (
          <div key={label} style={{display: 'grid', gridTemplateColumns: '130px 1fr', gap: 28, alignItems: 'center', opacity: enter(frame, 18 + index * 14)}}>
            <span style={{...TYPE.label, color: index === rows.length - 1 ? COLOR.text.success : COLOR.text.brand}}>{label}</span>
            <span style={{...TYPE.body, fontFamily: index === 2 ? FONT.mono : FONT.sans, fontWeight: WEIGHT.bold}}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 1260, top: 570, width: 120}}><Connector progress={planIn} tone={COLOR.text.brand} /></div>
      <div style={{position: 'absolute', right: 200, top: 465, width: 300}}>
        <Node icon="route" label="PLAN" detail="先审查修改路径" tone={COLOR.text.brand} progress={planIn} />
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'explore-or-deliver': ExploreOrDeliverScene,
  'observable-symptom': ObservableSymptomScene,
  'evidence-and-boundary': EvidenceBoundaryScene,
  'verification-contract': VerificationContractScene,
  takeaway: TakeawayScene,
};

export const Ep05VerifiableTask: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP05_VERIFIABLE_TASK_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(12)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp05Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP05 scene component: ${scene.id}`);
        return (
          <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}>
            <Scene />
          </SceneSequence>
        );
      })}
      {episode.status === 'draft' ? (
        <SyncedNarrationTrack
          manifest="claude-code-course/audio/ep05-verifiable-task/captions.json"
          auditPrefix="ep05-synced-caption"
        />
      ) : null}
    </CourseLayout>
  );
};
