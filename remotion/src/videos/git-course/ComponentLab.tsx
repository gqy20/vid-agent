import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {
  CaptionLayer,
  CenterInRect,
  COURSE_RECTS,
  CourseLayout,
  GitGraph,
  GitStateFlow,
  LayoutDebug,
  RecordedTerminalStage,
  SceneStage,
  type GitGraphState,
} from './kit';
import {COLOR, FONT, WEIGHT} from './palette';
import {seconds} from './timeline';
import {TYPE} from './typography';

export const COMPONENT_LAB_SCENE_DURATION = seconds(5);

const LAB_SECTIONS = [
  {id: 'layout', title: 'Layout geometry'},
  {id: 'graph', title: 'Git graph'},
  {id: 'state', title: 'State flow'},
  {id: 'terminal', title: 'Recorded terminal'},
  {id: 'captions', title: 'Caption layer'},
  {id: 'stress', title: 'Stress case'},
] as const;

export const COMPONENT_LAB_DURATION = COMPONENT_LAB_SCENE_DURATION * LAB_SECTIONS.length;

const LabShell: React.FC<{readonly section: string; readonly children: React.ReactNode}> = ({section, children}) => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="看得见的 Git · Component Lab"
      episodeTitle={section}
      currentFrame={frame}
    >
      {children}
      <div
        data-audit-ignore="lab-label"
        style={{
          position: 'absolute',
          left: 76,
          bottom: 34,
          ...TYPE.label,
          color: COLOR.text.tertiary,
          fontFamily: FONT.mono,
          fontWeight: WEIGHT.bold,
        }}
      >
        DEVELOPMENT COMPOSITION · NOT A RELEASE ASSET
      </div>
    </CourseLayout>
  );
};

const DemoTitle: React.FC<{readonly eyebrow: string; readonly title: string}> = ({eyebrow, title}) => (
  <div data-audit-id={`lab-title-${eyebrow}`} style={{position: 'absolute', left: 0, top: 0}}>
    <div style={{...TYPE.label, color: COLOR.text.tertiary, fontFamily: FONT.mono, fontWeight: WEIGHT.bold}}>{eyebrow}</div>
    <div style={{...TYPE.hero, marginTop: 10, fontWeight: WEIGHT.bold}}>{title}</div>
  </div>
);

const graphState: GitGraphState = {
  commits: [{id: 'C0'}, {id: 'C1'}, {id: 'C2'}, {id: 'C3'}],
  branches: [
    {name: 'main', target: 'C2', lane: 'bottom'},
    {name: 'feature', target: 'C3', lane: 'top', active: true},
  ],
  head: {target: 'C3', branch: 'feature'},
};

export const ComponentLabLayout: React.FC = () => (
  <LabShell section="01 / Layout geometry">
    <LayoutDebug rects={['header', 'centerModel', 'terminal', 'subtitle']} />
    <SceneStage preset="center-model" auditId="lab-layout-stage">
      <DemoTitle eyebrow="DETERMINISTIC RECTS" title="先确定舞台，再放主视觉" />
      <div
        data-audit-id="lab-layout-model"
        style={{
          position: 'absolute',
          left: 188,
          top: 214,
          right: 188,
          height: 338,
          border: `2px solid ${COLOR.git.main}`,
          background: COLOR.canvas.raised,
          display: 'grid',
          placeItems: 'center',
          ...TYPE.title,
          color: COLOR.git.main,
          fontWeight: WEIGHT.bold,
        }}
      >
        1656 × 760 center-model stage
      </div>
    </SceneStage>
  </LabShell>
);

export const ComponentLabGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [18, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <LabShell section="02 / Git graph">
      <SceneStage preset="center-model" auditId="lab-graph-stage">
        <DemoTitle eyebrow="SEMANTIC GEOMETRY" title="节点、连线、refs 使用同一套尺寸" />
        <CenterInRect rect={{x: 188, y: 178, width: 1280, height: 520}} auditId="lab-graph-center">
          <GitGraph
            state={graphState}
            width={1120}
            height={414}
            showFrame
            branchMotion={{name: 'feature', from: 'C2', to: 'C3', progress}}
            note="feature ref moves; commits stay immutable"
            auditId="lab-git-graph"
          />
        </CenterInRect>
      </SceneStage>
    </LabShell>
  );
};

export const ComponentLabState: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [20, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <LabShell section="03 / State flow">
      <SceneStage preset="state-transition" auditId="lab-state-stage">
        <DemoTitle eyebrow="CAUSE → EFFECT" title="命令之后，状态板接管主视觉" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 210}}>
          <GitStateFlow
            auditId="lab-state-flow"
            prominent
            areas={[
              {id: 'working-tree', title: 'Working Tree', files: ['app.js · working v2'], active: progress < 0.5},
              {id: 'index', title: 'Index', files: ['app.js · staged v1'], active: progress >= 0.5},
              {id: 'repository', title: 'Repository', files: ['C0', 'C1']},
            ]}
            transitions={[{from: 'working-tree', to: 'index', label: 'git add app.js', progress}]}
          />
        </div>
      </SceneStage>
    </LabShell>
  );
};

export const ComponentLabTerminal: React.FC = () => (
  <LabShell section="04 / Recorded terminal">
    <RecordedTerminalStage
      auditId="lab-recorded-terminal"
      rect={{...COURSE_RECTS.terminal, y: 142, height: 700}}
      src="git-course-lab/terminal/ep08-restore-flow.mp4"
      holdFrameSrc="git-course-lab/terminal/ep08-restore-flow-hold.png"
      holdFromFrame={213}
      playbackRate={1}
      mediaFit="cover"
      title="git-course-lab · real recording"
    />
    <CaptionLayer variant="scene" bottom={112} auditId="lab-terminal-caption">
      终端只使用 git-course-lab 的真实录制素材
    </CaptionLayer>
  </LabShell>
);

export const ComponentLabCaptions: React.FC = () => (
  <LabShell section="05 / Caption layer">
    <SceneStage preset="takeaway" auditId="lab-caption-stage">
      <DemoTitle eyebrow="ONE RENDERING BASE" title="三种语义，共享同一安全区规则" />
      <div
        data-audit-id="lab-caption-explanation"
        style={{position: 'absolute', left: 280, right: 280, top: 260, ...TYPE.title, textAlign: 'center', color: COLOR.text.secondary}}
      >
        narration 负责逐 cue 同步
        <br />
        scene 负责短结论 · question 负责问题收束
      </div>
    </SceneStage>
    <CaptionLayer variant="question" bottom={300} auditId="lab-caption-question">为什么要区分语义？</CaptionLayer>
    <CaptionLayer variant="scene" bottom={170} auditId="lab-caption-scene">短结论不重复旁白</CaptionLayer>
    <CaptionLayer variant="narration" bottom={40} auditId="lab-caption-narration">实际旁白逐句进入，位置保持稳定</CaptionLayer>
  </LabShell>
);

export const ComponentLabStress: React.FC = () => (
  <LabShell section="06 / Stress case">
    <SceneStage preset="state-transition" auditId="lab-stress-stage">
      <DemoTitle eyebrow="LONG CONTENT" title="先暴露约束，再进入 episode" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 208}}>
        <GitStateFlow
          auditId="lab-stress-flow"
          prominent
          gap={18}
          areas={[
            {id: 'working-tree', title: 'Working Tree', files: ['src/components/RepositoryHistory.tsx'], active: true},
            {id: 'index', title: 'Index', files: ['RepositoryHistory.tsx · staged']},
            {id: 'repository', title: 'HEAD / Repository', files: ['feature/review-workbench', '9f4b1d2']},
          ]}
        />
      </div>
    </SceneStage>
    <CaptionLayer variant="narration" bottom={92} width={1360} auditId="lab-stress-caption">
      长路径、双语标签和两行字幕必须先在实验室通过边界检查
    </CaptionLayer>
  </LabShell>
);

const LAB_COMPONENTS = [
  ComponentLabLayout,
  ComponentLabGraph,
  ComponentLabState,
  ComponentLabTerminal,
  ComponentLabCaptions,
  ComponentLabStress,
] as const;

export const ComponentLab: React.FC = () => (
  <AbsoluteFill>
    {LAB_COMPONENTS.map((Component, index) => (
      <Sequence key={LAB_SECTIONS[index].id} from={index * COMPONENT_LAB_SCENE_DURATION} durationInFrames={COMPONENT_LAB_SCENE_DURATION}>
        <Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);
