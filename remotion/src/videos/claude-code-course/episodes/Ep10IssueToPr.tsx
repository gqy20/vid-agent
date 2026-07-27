import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  EP10_ISSUE_TO_PR_DURATION_IN_FRAMES,
  EP10_ISSUE_TO_PR_EPISODE,
  EP10_ISSUE_TO_PR_SCENES,
  getEp10Scene,
} from '../data/ep10IssueToPr';
import {COLOR, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {
  CourseLayout,
  EvidenceIcon,
  type EvidenceIconName,
  SceneSequence,
  SyncedNarrationTrack,
} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP10_ISSUE_TO_PR_DURATION_IN_FRAMES};

const episode = EP10_ISSUE_TO_PR_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; align?: 'left' | 'center'}> = ({
  title,
  align = 'left',
}) => <div style={{...TYPE.heading, textAlign: align}}>{title}</div>;

const EvidenceNode: React.FC<{
  icon: EvidenceIconName;
  label: string;
  detail?: string;
  tone: string;
  progress: number;
}> = ({icon, label, detail, tone, progress}) => (
  <div
    style={{
      display: 'grid',
      justifyItems: 'center',
      textAlign: 'center',
      opacity: progress,
      translate: `0 ${(1 - progress) * 16}px`,
    }}
  >
    <EvidenceIcon name={icon} size={44} tone={tone} />
    <div style={{...TYPE.labelSmall, color: tone, marginTop: 16}}>{label}</div>
    {detail ? (
      <div style={{...TYPE.codeSmall, color: COLOR.text.tertiary, marginTop: 8}}>{detail}</div>
    ) : null}
  </div>
);

const Connector: React.FC<{progress: number; tone?: string}> = ({
  progress,
  tone = COLOR.stroke.default,
}) => (
  <div style={{height: 2, background: tone, scale: `${progress} 1`, transformOrigin: 'left center'}} />
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const issue = 1;
  const session = enter(frame, 48);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <div style={{...TYPE.display, textAlign: 'center', opacity: enter(frame, 0, MOTION.structural)}}>
        {getEp10Scene('hook').title}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 480,
          right: 480,
          top: 515,
          display: 'grid',
          gridTemplateColumns: '1fr 160px 1fr',
          alignItems: 'center',
        }}
      >
        <EvidenceNode icon="file" label="ISSUE #142" detail="真实问题" tone={COLOR.text.brand} progress={issue} />
        <Connector progress={enter(frame, 36)} />
        <EvidenceNode icon="shell" label="CLEAN SESSION" detail="clean branch" tone={COLOR.text.info} progress={session} />
      </div>
    </AbsoluteFill>
  );
};

const IssueBaselineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const evidence = [
    ['file', 'ISSUE', 'editing title clears dueDate', COLOR.text.brand],
    ['test', 'REPRO', '1 failed', COLOR.text.danger],
    ['observe', 'BEHAVIOR', 'dueDate → null', COLOR.text.warning],
    ['graph', 'GIT', 'working tree clean', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('issue-and-baseline').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 150,
          right: 150,
          top: 430,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 68,
        }}
      >
        {evidence.map(([icon, label, detail, tone], index) => (
          <EvidenceNode
            key={label}
            icon={icon}
            label={label}
            detail={detail}
            tone={tone}
            progress={enter(frame, 22 + index * 22)}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const PlanExecuteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    ['read', 'PLAN', '影响面', COLOR.text.info],
    ['route', 'UPDATE API', 'patch semantics', COLOR.text.brand],
    ['file', 'DOMAIN', 'merge fields', COLOR.text.warning],
    ['edit', 'UI + TEST', 'preserve dueDate', COLOR.text.success],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('plan-and-execute').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 135,
          right: 135,
          top: 425,
          display: 'grid',
          gridTemplateColumns: '1fr 90px 1fr 90px 1fr 90px 1fr',
          alignItems: 'center',
        }}
      >
        {steps.flatMap(([icon, label, detail, tone], index) => {
          const node = (
            <EvidenceNode
              key={label}
              icon={icon}
              label={label}
              detail={detail}
              tone={tone}
              progress={enter(frame, 18 + index * 28)}
            />
          );
          if (index === steps.length - 1) return [node];
          return [
            node,
            <Connector key={`${label}-connector`} progress={enter(frame, 35 + index * 28)} />,
          ];
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 700,
          right: 700,
          bottom: 168,
          textAlign: 'center',
          opacity: enter(frame, 142),
          ...TYPE.codeSmall,
          color: COLOR.text.tertiary,
        }}
      >
        generated/ remains blocked
      </div>
    </AbsoluteFill>
  );
};

const VerificationPackageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const results = [
    ['test', 'pnpm test', 'PASS', COLOR.text.success],
    ['file', 'pnpm typecheck', 'EXIT 0', COLOR.text.info],
    ['shell', 'pnpm build', 'EXIT 0', COLOR.text.brand],
    ['observe', 'runtime check', 'LOCAL DATE OK', COLOR.text.warning],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('verification-package').title} align="center" />
      <div style={{position: 'absolute', left: 270, right: 270, top: 320, display: 'grid', gap: 38}}>
        {results.map(([icon, command, result, tone], index) => (
          <div
            key={command}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr 220px',
              gap: 26,
              alignItems: 'center',
              opacity: enter(frame, 18 + index * 22),
            }}
          >
            <EvidenceIcon name={icon} size={34} tone={tone} />
            <span style={{...TYPE.code, fontWeight: WEIGHT.bold}}>{command}</span>
            <span style={{...TYPE.codeSmall, color: tone, justifySelf: 'end'}}>{result}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 720,
          right: 720,
          bottom: 155,
          textAlign: 'center',
          opacity: enter(frame, 126),
          ...TYPE.codeSmall,
          color: COLOR.text.success,
        }}
      >
        REPRODUCIBLE EVIDENCE
      </div>
    </AbsoluteFill>
  );
};

const ReviewFixScene: React.FC = () => {
  const frame = useCurrentFrame();
  const correction = enter(frame, 94, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('review-and-fix').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 280,
          right: 280,
          top: 390,
          display: 'grid',
          gridTemplateColumns: '1fr 190px 1fr',
          alignItems: 'center',
        }}
      >
        <EvidenceNode icon="observe" label="API REVIEWER" detail="compatibility gap" tone={COLOR.text.warning} progress={enter(frame, 24)} />
        <Connector progress={enter(frame, 52)} tone={correction ? COLOR.text.brand : COLOR.stroke.default} />
        <EvidenceNode icon="edit" label="FIX + RECHECK" detail="evidence refreshed" tone={COLOR.text.success} progress={correction} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 650,
          right: 650,
          bottom: 165,
          textAlign: 'center',
          opacity: correction,
          ...TYPE.codeSmall,
          color: COLOR.text.tertiary,
        }}
      >
        review changes the implementation
      </div>
    </AbsoluteFill>
  );
};

const CommitScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('commit').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 350,
          right: 350,
          top: 370,
          display: 'grid',
          gridTemplateColumns: '1fr 145px 1fr',
          alignItems: 'center',
        }}
      >
        <EvidenceNode icon="graph" label="REVIEWED DIFF" detail="4 files · +38 −12" tone={COLOR.text.info} progress={enter(frame, 24)} />
        <Connector progress={enter(frame, 58)} />
        <EvidenceNode icon="check" label="COMMIT" detail="a81f2c7" tone={COLOR.text.success} progress={enter(frame, 84)} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 440,
          right: 440,
          bottom: 170,
          textAlign: 'center',
          opacity: enter(frame, 126),
          ...TYPE.code,
          color: COLOR.text.primary,
        }}
      >
        fix(tasks): preserve local due date
      </div>
    </AbsoluteFill>
  );
};

const PullRequestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    ['file', 'ISSUE', '#142', COLOR.text.brand],
    ['graph', 'DIFF', '4 files', COLOR.text.info],
    ['test', 'CHECKS', '5 passed', COLOR.text.success],
    ['observe', 'REVIEW', 'approved', COLOR.text.warning],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp10Scene('pull-request').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 140,
          right: 140,
          top: 420,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 70,
        }}
      >
        {items.map(([icon, label, detail, tone], index) => (
          <EvidenceNode
            key={label}
            icon={icon}
            label={label}
            detail={detail}
            tone={tone}
            progress={enter(frame, 20 + index * 20)}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 720,
          right: 720,
          bottom: 160,
          textAlign: 'center',
          opacity: enter(frame, 120),
          ...TYPE.codeSmall,
          color: COLOR.text.success,
        }}
      >
        CI · PASS
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const chain = [
    ['file', 'ISSUE', COLOR.text.brand],
    ['read', 'PLAN', COLOR.text.info],
    ['edit', 'CHANGE', COLOR.text.warning],
    ['test', 'EVIDENCE', COLOR.text.success],
    ['graph', 'PR', COLOR.text.brand],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 140}}>
      <SceneHeading title={getEp10Scene('takeaway').title} align="center" />
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          top: 470,
          display: 'grid',
          gridTemplateColumns: '1fr 72px 1fr 72px 1fr 72px 1fr 72px 1fr',
          alignItems: 'center',
        }}
      >
        {chain.flatMap(([icon, label, tone], index) => {
          const node = (
            <EvidenceNode key={label} icon={icon} label={label} tone={tone} progress={enter(frame, 16 + index * 18)} />
          );
          if (index === chain.length - 1) return [node];
          return [node, <Connector key={`${label}-connector`} progress={enter(frame, 30 + index * 18)} />];
        })}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC> = {
  hook: HookScene,
  'issue-and-baseline': IssueBaselineScene,
  'plan-and-execute': PlanExecuteScene,
  'verification-package': VerificationPackageScene,
  'review-and-fix': ReviewFixScene,
  commit: CommitScene,
  'pull-request': PullRequestScene,
  takeaway: TakeawayScene,
};

export const Ep10IssueToPr: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP10_ISSUE_TO_PR_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(12)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp10Scene(scene.id);
        const Scene = SCENES[scene.id];
        if (!Scene) throw new Error(`Missing EP10 scene component: ${scene.id}`);
        return (
          <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}>
            <Scene />
          </SceneSequence>
        );
      })}
      {episode.status === 'draft' ? (
        <SyncedNarrationTrack
          manifest="claude-code-course/audio/ep10-issue-to-pr/captions.json"
          auditPrefix="ep10-synced-caption"
        />
      ) : null}
    </CourseLayout>
  );
};
