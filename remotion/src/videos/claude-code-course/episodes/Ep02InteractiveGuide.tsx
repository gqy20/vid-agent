import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES,
  EP02_INTERACTIVE_GUIDE_EPISODE,
  EP02_INTERACTIVE_GUIDE_SCENES,
  getEp02Scene,
} from '../data/ep02InteractiveGuide';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {
  CourseLayout,
  EvidenceIcon,
  type EvidenceIconName,
  RecordedTerminal,
  SceneSequence,
  SyncedNarrationTrack,
  TerminalFocus,
} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES};

const episode = EP02_INTERACTIVE_GUIDE_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const oldStillRoot = 'claude-code-course/terminal/ep02-interactive-guide-stills';
const fixStillRoot = 'claude-code-course/terminal/ep03-agentic-loop-stills';

const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => (
  <div style={{...TYPE.heading, textAlign: align}}>{title}</div>
);

const TerminalStill: React.FC<{
  file: string;
  title: string;
  source?: 'interaction' | 'fix';
  focus?: string;
  zoom?: number;
}> = ({file, title, source = 'fix', focus = '50% 50%', zoom}) => (
  <RecordedTerminal
    src={`${source === 'fix' ? fixStillRoot : oldStillRoot}/${file}`}
    title={title}
    focus={focus}
    zoom={zoom}
  />
);

const EvidenceStep: React.FC<{
  icon: EvidenceIconName;
  label: string;
  value: string;
  tone: string;
  progress: number;
}> = ({icon, label, value, tone, progress}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress, translate: `0 ${(1 - progress) * 18}px`}}>
    <EvidenceIcon name={icon} size={52} tone={tone} />
    <div style={{...TYPE.codeSmall, color: tone, marginTop: 24}}>{label}</div>
    <div style={{...TYPE.subheading, marginTop: 12}}>{value}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 150}}>
      <div style={{textAlign: 'center', opacity: enter(frame, 30), translate: `0 ${(1 - enter(frame, 30)) * 22}px`}}>
        <div style={{...TYPE.display}}>{getEp02Scene('hook').title}</div>
      </div>
      <div style={{position: 'absolute', left: 310, right: 310, top: 570, display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center'}}>
        <EvidenceStep icon="stop" label="OBSERVED" value="空 Token 被接受" tone={COLOR.text.danger} progress={enter(frame, 62)} />
        <div style={{height: 2, background: COLOR.stroke.default, scale: `${enter(frame, 82, MOTION.structural)} 1`, transformOrigin: 'left center'}} />
        <EvidenceStep icon="check" label="QUESTION" value="能否修复并证明？" tone={COLOR.text.brand} progress={enter(frame, 92)} />
      </div>
    </AbsoluteFill>
  );
};

const InteractionModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['shell', 'REPRODUCE', '复现失败', COLOR.text.danger],
    ['edit', 'CHANGE', '改变工作区', COLOR.text.brand],
    ['check', 'VERIFY', '读取证据', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 130}}>
      <SceneHeading title={getEp02Scene('interaction-model').title} align="center" />
      <div style={{position: 'absolute', left: 230, right: 230, top: 435, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 110}}>
        {steps.map(([icon, label, value, tone], index) => (
          <EvidenceStep key={label} icon={icon} label={label} value={value} tone={tone} progress={enter(frame, 28 + index * 18)} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 610, right: 610, bottom: 190, ...TYPE.labelSmall, color: COLOR.text.tertiary, textAlign: 'center', opacity: enter(frame, 104)}}>界面入口只在闭环需要时出现</div>
    </AbsoluteFill>
  );
};

const SlashScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp02Scene('slash-entry').title} />
      <div style={{position: 'absolute', ...LAYOUT.terminalEvidence.split.frame}}>
        <TerminalStill source="interaction" file="slash-menu.png" title="claude-code-lab · /" zoom={LAYOUT.terminalEvidence.split.zoom} focus="0% 45%" />
      </div>
      <div style={{position: 'absolute', right: 145, top: 360, width: 330, display: 'grid', gap: 42}}>
        <EvidenceStep icon="menu" label="BUILT-IN" value="官方命令" tone={COLOR.text.brand} progress={enter(frame, 54)} />
        <EvidenceStep icon="file" label="EXTENSIONS" value="Skills 等入口" tone={COLOR.text.success} progress={enter(frame, 78)} />
      </div>
    </AbsoluteFill>
  );
};

const FileMentionScene: React.FC = () => (
  <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
    <TerminalFocus title={getEp02Scene('file-mention').title}>
      <TerminalStill source="interaction" file="file-mention.png" title="claude-code-lab · @ file mention" zoom={1.06} focus="50% 42%" />
    </TerminalFocus>
  </AbsoluteFill>
);

const ShellModeScene: React.FC = () => (
  <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
    <TerminalFocus title={getEp02Scene('shell-mode').title}>
      <TerminalStill file="baseline-fail.png" title="claude-code-lab · baseline" focus="50% 40%" />
    </TerminalFocus>
  </AbsoluteFill>
);

const MultilinePromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['route', '目标', '空白 Token 返回 false', COLOR.text.brand],
    ['permission', '范围', '只修改必要文件', COLOR.text.warning],
    ['check', '验证', 'test + diff check', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp02Scene('multiline-prompt').title} align="center" />
      <div style={{position: 'absolute', left: 350, right: 350, top: 350, display: 'grid', gap: 58}}>
        {rows.map(([icon, label, value, tone], index) => (
          <div key={label} style={{display: 'grid', gridTemplateColumns: '58px 120px 1fr', gap: 24, alignItems: 'center', opacity: enter(frame, 28 + index * 18), translate: `${(1 - enter(frame, 28 + index * 18)) * -18}px 0`}}>
            <EvidenceIcon name={icon} size={36} tone={tone} />
            <div style={{...TYPE.label, color: tone}}>{label}</div>
            <div style={{...TYPE.subheading}}>{value}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const ObserveProcessScene: React.FC = () => (
  <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
    <TerminalFocus title={getEp02Scene('observe-process').title}>
      <TerminalStill file="edit.png" title="claude-code-lab · Edit" focus="50% 49%" />
    </TerminalFocus>
  </AbsoluteFill>
);

const EvidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const transcriptEnd = seconds(14);
  const testEnd = seconds(34);
  const current = frame < transcriptEnd
    ? {file: 'transcript.png', title: 'Ctrl+O · tool evidence', focus: '50% 46%', zoom: 1.08}
    : frame < testEnd
      ? {file: 'tests-pass.png', title: 'claude-code-lab · tests pass', focus: '50% 40%', zoom: undefined}
      : {file: 'diff-check.png', title: 'claude-code-lab · diff check', focus: '50% 55%', zoom: undefined};
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <TerminalFocus title={getEp02Scene('interrupt-and-mode').title}>
        <TerminalStill {...current} />
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const evidence = [
    ['edit', '1处修改', COLOR.text.brand],
    ['check', '3项测试通过', COLOR.text.success],
    ['shell', 'diff check · 0', COLOR.text.info],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp02Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 240, right: 240, top: 430, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 90}}>
        {evidence.map(([icon, value, tone], index) => (
          <EvidenceStep key={value} icon={icon} label="EVIDENCE" value={value} tone={tone} progress={enter(frame, 24 + index * 15)} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 700, right: 700, bottom: 170, display: 'grid', justifyItems: 'center', opacity: enter(frame, 124)}}>
        <EvidenceIcon name="route" size={40} tone={COLOR.text.brand} />
        <div style={{...TYPE.codeSmall, fontFamily: FONT.mono, fontWeight: WEIGHT.bold, color: COLOR.text.brand, marginTop: 12}}>NEXT · RUN REPLAY</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'interaction-model': InteractionModelScene,
  'slash-entry': SlashScene,
  'file-mention': FileMentionScene,
  'shell-mode': ShellModeScene,
  'multiline-prompt': MultilinePromptScene,
  'observe-process': ObserveProcessScene,
  'interrupt-and-mode': EvidenceScene,
  takeaway: TakeawayScene,
};

export const Ep02InteractiveGuide: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP02_INTERACTIVE_GUIDE_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(10)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp02Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP02 scene component: ${scene.id}`);
        return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;
      })}
      {episode.status === 'draft' ? (
        <SyncedNarrationTrack
          manifest="claude-code-course/audio/ep02-interactive-guide/captions.json"
          auditPrefix="ep02-synced-caption"
        />
      ) : null}
    </CourseLayout>
  );
};
