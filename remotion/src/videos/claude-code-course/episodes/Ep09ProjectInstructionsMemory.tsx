import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EP09_PROJECT_INSTRUCTIONS_MEMORY_DURATION_IN_FRAMES, EP09_PROJECT_INSTRUCTIONS_MEMORY_EPISODE, EP09_PROJECT_INSTRUCTIONS_MEMORY_SCENES, getEp09Scene} from '../data/ep09ProjectInstructionsMemory';
import {COLOR, FONT, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, SceneSequence, SyncedNarrationTrack} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP09_PROJECT_INSTRUCTIONS_MEMORY_DURATION_IN_FRAMES};
const episode = EP09_PROJECT_INSTRUCTIONS_MEMORY_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) => motionProgress(frame, at, duration, EASE.enter);
const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({title, align = 'left'}) => <div style={{...TYPE.heading, textAlign: align}}>{title}</div>;
const Mechanism: React.FC<{icon: EvidenceIconName; label: string; detail?: string; tone: string; progress: number; muted?: boolean}> = ({icon, label, detail, tone, progress, muted}) => (
  <div style={{display: 'grid', justifyItems: 'center', textAlign: 'center', opacity: progress * (muted ? 0.35 : 1), translate: `0 ${(1 - progress) * 16}px`}}>
    <EvidenceIcon name={icon} size={46} tone={muted ? COLOR.text.tertiary : tone} />
    <div style={{...TYPE.label, color: muted ? COLOR.text.tertiary : tone, fontWeight: WEIGHT.bold, marginTop: 18}}>{label}</div>
    {detail ? <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 9}}>{detail}</div> : null}
  </div>
);
const CodeLine: React.FC<{label?: string; value: string; tone?: string; progress: number}> = ({label, value, tone = COLOR.text.primary, progress}) => (
  <div style={{display: 'grid', gridTemplateColumns: label ? '180px 1fr' : '1fr', gap: 22, alignItems: 'center', opacity: progress, translate: `${(1 - progress) * -16}px 0`}}>
    {label ? <span style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>{label}</span> : null}
    <span style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{value}</span>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const repeated = [
    ['shell', 'pnpm'],
    ['test', '验证顺序'],
    ['file', '日期约定'],
    ['permission', 'generated/'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 0, MOTION.structural)}}>{getEp09Scene('hook').title}</div>
      <div style={{position: 'absolute', left: 220, right: 220, top: 500, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 70}}>
        {repeated.map(([icon, label], index) => <Mechanism key={label} icon={icon} label={label} detail="再次说明" tone={COLOR.text.warning} progress={index === 0 ? 1 : enter(frame, 10 + index * 16)} />)}
      </div>
    </AbsoluteFill>
  );
};

const FiveMechanismsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const mechanisms = [
    ['file', 'CLAUDE.md', '每次会话', COLOR.text.brand],
    ['route', 'RULES', '匹配路径', COLOR.text.info],
    ['model', 'MEMORY', '模型经验', COLOR.brand.orange],
    ['permission', 'HOOKS', '生命周期门禁', COLOR.text.warning],
    ['graph', 'AGENT', '隔离执行者', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('five-mechanisms').title} align="center" />
      <div style={{position: 'absolute', left: 110, right: 110, top: 410, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 36}}>
        {mechanisms.map(([icon, label, detail, tone], index) => <Mechanism key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 24 + index * 18)} />)}
      </div>
      <div style={{position: 'absolute', left: 210, right: 210, bottom: 155, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', textAlign: 'center', ...TYPE.codeSmall, color: COLOR.text.tertiary, opacity: enter(frame, 128)}}>
        <span>CONTEXT</span><span>TOOL LIFECYCLE</span><span>DELEGATION</span>
      </div>
    </AbsoluteFill>
  );
};

const ClaudeMdScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    ['PACKAGE', 'Use pnpm'],
    ['VERIFY', 'pnpm test && pnpm build'],
    ['BOUNDARY', 'Do not edit generated/'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('claude-md').title} align="center" />
      <div style={{position: 'absolute', left: 300, right: 300, top: 330, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 100}}>
        <Mechanism icon="file" label="CLAUDE.md" detail="project root" tone={COLOR.text.brand} progress={enter(frame, 24)} />
        <div style={{display: 'grid', gap: 50, alignContent: 'center'}}>
          {lines.map(([label, value], index) => <CodeLine key={label} label={label} value={value} tone={index === 2 ? COLOR.text.warning : COLOR.text.primary} progress={enter(frame, 48 + index * 22)} />)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 650, right: 650, bottom: 160, display: 'flex', justifyContent: 'space-between', ...TYPE.labelSmall, color: COLOR.text.tertiary, opacity: enter(frame, 132)}}><span>跨任务稳定</span><span>可以验证</span><span>保持简短</span></div>
    </AbsoluteFill>
  );
};

const PathRulesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const match = enter(frame, 88, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('path-rules').title} align="center" />
      <div style={{position: 'absolute', left: 210, right: 210, top: 335, display: 'grid', gridTemplateColumns: '470px 180px 1fr', alignItems: 'center'}}>
        <div style={{display: 'grid', gap: 28, opacity: enter(frame, 24)}}>
          <CodeLine value=".claude/rules/frontend.md" tone={COLOR.text.info} progress={1} />
          <CodeLine label="paths" value="src/ui/**/*.js" progress={1} />
          <CodeLine label="rule" value="Render dates as UTC" progress={1} />
        </div>
        <div style={{height: 2, background: COLOR.text.info, scale: `${match} 1`, transformOrigin: 'left center'}} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80}}>
          <Mechanism icon="file" label="task-list.js" detail="RULE LOADED" tone={COLOR.text.success} progress={match} />
          <Mechanism icon="file" label="task-store.js" detail="NOT MATCHED" tone={COLOR.text.tertiary} progress={match} muted />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AutoMemoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const promote = enter(frame, 130, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('auto-memory').title} align="center" />
      <div style={{position: 'absolute', left: 220, right: 220, top: 340, display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center'}}>
        <div>
          <Mechanism icon="model" label="AUTO MEMORY" detail="machine-local" tone={COLOR.brand.orange} progress={enter(frame, 24)} />
          <div style={{...TYPE.codeSmall, textAlign: 'center', marginTop: 34, color: COLOR.text.secondary}}>API tests need local Redis</div>
        </div>
        <div style={{height: 2, background: COLOR.stroke.default, scale: `${promote} 1`, transformOrigin: 'left center'}} />
        <div>
          <Mechanism icon="file" label="PROJECT RULE" detail="team-reviewed" tone={COLOR.text.brand} progress={promote} />
          <div style={{...TYPE.codeSmall, textAlign: 'center', marginTop: 34, color: COLOR.text.secondary}}>人工确认后才迁入仓库</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 650, right: 650, bottom: 155, ...TYPE.labelSmall, color: COLOR.text.tertiary, textAlign: 'center', opacity: enter(frame, 174)}}>经验不自动变成团队权威事实</div>
    </AbsoluteFill>
  );
};

const HookPipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stages = [
    ['edit', 'Edit request', 'generated/schema.json', COLOR.text.brand],
    ['permission', 'PreToolUse', 'stdin event JSON', COLOR.text.warning],
    ['shell', 'guard script', 'inspect file_path', COLOR.text.info],
    ['stop', 'BLOCK', 'protected directory', COLOR.text.danger],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('deterministic-hook').title} align="center" />
      <div style={{position: 'absolute', left: 130, right: 130, top: 410, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 70}}>
        {stages.map(([icon, label, detail, tone], index) => <Mechanism key={label} icon={icon} label={label} detail={detail} tone={tone} progress={enter(frame, 22 + index * 28)} />)}
      </div>
      <div style={{position: 'absolute', left: 510, right: 510, bottom: 155, ...TYPE.codeSmall, color: COLOR.text.danger, textAlign: 'center', opacity: enter(frame, 146)}}>exit 2 · reason → Claude</div>
    </AbsoluteFill>
  );
};

const ReviewAgentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const memoryIn = enter(frame, 118, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp09Scene('review-agent').title} align="center" />
      <div style={{position: 'absolute', left: 240, right: 240, top: 330, display: 'grid', gridTemplateColumns: '1fr 170px 1fr', alignItems: 'center'}}>
        <div style={{display: 'grid', gap: 30}}>
          <Mechanism icon="graph" label="api-reviewer.md" detail="isolated context" tone={COLOR.text.success} progress={enter(frame, 24)} />
          <CodeLine label="tools" value="Read, Grep, Bash" progress={enter(frame, 52)} />
          <CodeLine label="memory" value="project" progress={enter(frame, 72)} />
        </div>
        <div style={{height: 2, background: COLOR.text.success, scale: `${memoryIn} 1`, transformOrigin: 'left center'}} />
        <div>
          <Mechanism icon="model" label="AGENT MEMORY" detail="独立持久目录" tone={COLOR.brand.orange} progress={memoryIn} />
          <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, textAlign: 'center', marginTop: 34}}>跨任务积累 API 审查模式</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stack = [
    ['file', 'CLAUDE.md', COLOR.text.brand],
    ['route', 'RULES', COLOR.text.info],
    ['model', 'MEMORY', COLOR.brand.orange],
    ['permission', 'HOOKS', COLOR.text.warning],
    ['graph', 'AGENT', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp09Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 110, right: 110, top: 430, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 34}}>
        {stack.map(([icon, label, tone], index) => <Mechanism key={label} icon={icon} label={label} tone={tone} progress={enter(frame, 22 + index * 18)} />)}
      </div>
      <div style={{position: 'absolute', left: 690, right: 690, bottom: 145, display: 'grid', justifyItems: 'center', opacity: enter(frame, 142)}}><EvidenceIcon name="route" size={42} tone={COLOR.text.brand} /><div style={{...TYPE.codeSmall, color: COLOR.text.brand, marginTop: 12}}>CLEAN SESSION → ISSUE</div></div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = {hook: HookScene, 'five-mechanisms': FiveMechanismsScene, 'claude-md': ClaudeMdScene, 'path-rules': PathRulesScene, 'auto-memory': AutoMemoryScene, 'deterministic-hook': HookPipelineScene, 'review-agent': ReviewAgentScene, takeaway: TakeawayScene};
export const Ep09ProjectInstructionsMemory: React.FC = () => {const frame = useCurrentFrame(); return <CourseLayout seriesTitle="Claude Code 实操" episodeTitle={episode.title} scenes={EP09_PROJECT_INSTRUCTIONS_MEMORY_SCENES} currentFrame={frame} showHeader={(current) => current >= seconds(12)}>{episode.scenes.map((scene) => {const timing = getEp09Scene(scene.id); const Scene = SCENES[scene.id]; if (!Scene) throw new Error(`Missing EP09 scene component: ${scene.id}`); return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;})}{episode.status === 'draft' ? <SyncedNarrationTrack manifest="claude-code-course/audio/ep09-project-instructions-memory/captions.json" auditPrefix="ep09-synced-caption" /> : null}</CourseLayout>;};
