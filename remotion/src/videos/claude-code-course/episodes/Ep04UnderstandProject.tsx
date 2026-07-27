import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {
  EP04_UNDERSTAND_PROJECT_DURATION_IN_FRAMES,
  EP04_UNDERSTAND_PROJECT_EPISODE,
  EP04_UNDERSTAND_PROJECT_SCENES,
  getEp04Scene,
} from '../data/ep04UnderstandProject';
import {COLOR, FONT, FRAME, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {
  CourseLayout,
  EvidenceIcon,
  type EvidenceIconName,
  type EvidenceSpotlightRect,
  SceneSequence,
  SceneQuestion,
  SyncedNarrationTrack,
  RecordedTerminal,
  TerminalFocus,
} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP04_UNDERSTAND_PROJECT_DURATION_IN_FRAMES};

const episode = EP04_UNDERSTAND_PROJECT_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const stillRoot = 'claude-code-course/terminal/ep04-understand-project-stills';

const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{
  title: string;
  detail?: string;
  align?: 'left' | 'center';
}> = ({title, detail, align = 'left'}) => (
  <div style={{textAlign: align}}>
    <div style={{...TYPE.heading}}>{title}</div>
    {detail ? (
      <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 12}}>{detail}</div>
    ) : null}
  </div>
);

const TerminalStill: React.FC<{
  file: string;
  title: string;
  focus?: string;
  zoom?: number;
  spotlight?: EvidenceSpotlightRect;
  spotlightProgress?: number;
}> = ({file, title, focus = '50% 50%', zoom = LAYOUT.terminalEvidence.focus.zoom, spotlight, spotlightProgress}) => (
  <RecordedTerminal src={`${stillRoot}/${file}`} title={title} focus={focus} zoom={zoom} spotlight={spotlight} spotlightProgress={spotlightProgress} />
);

const FlowArrow: React.FC<{x1: number; x2: number; y: number; progress: number; tone?: string}> = ({
  x1,
  x2,
  y,
  progress,
  tone = COLOR.stroke.strong,
}) => (
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
    <defs>
      <marker id={`ep04-arrow-${x1}-${x2}-${y}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
        <path d="M 0 0 L 9 4.5 L 0 9 z" fill={tone} />
      </marker>
    </defs>
    <path
      d={`M ${x1} ${y} L ${x2} ${y}`}
      fill="none"
      stroke={tone}
      strokeWidth="3"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - progress}
      markerEnd={`url(#ep04-arrow-${x1}-${x2}-${y})`}
    />
  </svg>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const context = 1;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 150}}>
      <div style={{textAlign: 'center', opacity: enter(frame, 0, MOTION.structural), translate: `0 ${(1 - enter(frame, 0, MOTION.structural)) * 22}px`}}>
        <div style={{...TYPE.display}}>{getEp04Scene('hook').title}</div>
      </div>
      <div style={{position: 'absolute', left: 300, right: 300, top: 565, height: 250}}>
        {['README', 'src/http', 'src/tasks', 'test', 'package.json'].map((name, index) => {
          const visible = enter(frame, 10 + index * 7);
          return (
            <div key={name} style={{position: 'absolute', left: index * 260, top: 34 + (index % 2) * 60, ...TYPE.codeSmall, color: COLOR.text.tertiary, opacity: visible}}>
              {name}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 470, top: 155, width: 430, opacity: context, textAlign: 'center'}}>
          <div style={{...TYPE.label, color: COLOR.text.brand}}>当前上下文</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ThreeLayersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const access = enter(frame, 18, MOTION.structural);
  const context = enter(frame, 52, MOTION.expressive);
  const understanding = enter(frame, 94, MOTION.expressive);
  const relation = enter(frame, 122, MOTION.expressive);
  const accessItems: {label: string; icon: EvidenceIconName; x: number; y: number}[] = [
    {label: 'README', icon: 'read', x: 320, y: 430},
    {label: 'src/http', icon: 'route', x: 570, y: 720},
    {label: 'src/tasks', icon: 'file', x: 1190, y: 720},
    {label: 'test', icon: 'test', x: 1480, y: 430},
    {label: 'package.json', icon: 'file', x: 830, y: 330},
  ];
  const contextItems = [
    ['提示', 720, 470],
    ['文件片段', 925, 690],
    ['工具结果', 1120, 470],
  ] as const;
  const relationItems = [
    ['入口', 825, 530],
    ['规则', 1095, 530],
    ['状态', 1095, 650],
    ['测试', 825, 650],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneQuestion title="访问、上下文和理解一样吗？" handoffAt={44} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <ellipse cx="960" cy="590" rx="720" ry="330" fill="none" stroke={COLOR.brand.blue} strokeWidth="2" strokeDasharray="8 12" opacity={access * (1 - context * 0.58)} />
        <ellipse cx="960" cy="590" rx="410" ry="225" fill="none" stroke={COLOR.brand.orange} strokeWidth="2.5" strokeDasharray="1" pathLength="1" strokeDashoffset={1 - context} opacity={context * (1 - understanding * 0.46)} />
        <path d="M 825 530 L 1095 530 L 1095 650 L 825 650 Z" fill="none" stroke={COLOR.brand.green} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - relation} opacity={understanding} />
        <path d="M 825 530 L 1095 650 M 1095 530 L 825 650" fill="none" stroke={COLOR.stroke.default} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - relation} opacity={understanding} />
      </svg>
      <div style={{position: 'absolute', left: 260, top: 300, ...TYPE.codeSmall, color: COLOR.brand.blue, opacity: access * (1 - context * 0.42)}}>ACCESS · 可访问空间</div>
      {accessItems.map((item, index) => (
        <div key={item.label} style={{position: 'absolute', left: item.x, top: item.y, width: 180, display: 'flex', alignItems: 'center', gap: 12, opacity: access * (0.9 - context * 0.58), translate: `0 ${(1 - access) * 14}px`}}>
          <EvidenceIcon name={item.icon} size={28} tone={COLOR.brand.blue} />
          <span style={{...TYPE.codeSmall}}>{item.label}</span>
        </div>
      ))}
      <div style={{position: 'absolute', left: 590, top: 390, ...TYPE.codeSmall, color: COLOR.brand.orange, opacity: context * (1 - understanding * 0.42)}}>CONTEXT · 当前会话</div>
      {contextItems.map(([label, x, y], index) => (
        <div key={label} style={{position: 'absolute', left: x, top: y, ...TYPE.label, color: COLOR.text.primary, opacity: context * (1 - understanding * 0.7), translate: `0 ${(1 - context) * (18 + index * 4)}px`}}>{label}</div>
      ))}
      <div style={{position: 'absolute', left: 760, top: 425, display: 'flex', alignItems: 'center', gap: 14, color: COLOR.brand.green, opacity: understanding}}>
        <EvidenceIcon name="graph" size={34} tone={COLOR.brand.green} />
        <span style={{...TYPE.codeSmall}}>UNDERSTANDING · 关系</span>
      </div>
      {relationItems.map(([label, x, y], index) => (
        <div key={label} style={{position: 'absolute', left: x, top: y, width: 110, height: 54, translate: '-50% -50%', display: 'grid', placeItems: 'center', background: COLOR.canvas.base, ...TYPE.label, color: index === 0 ? COLOR.text.brand : COLOR.text.primary, opacity: understanding, scale: 0.96 + understanding * 0.04}}>{label}</div>
      ))}
    </AbsoluteFill>
  );
};

const InvestigationQuestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const targets = ['入口', '业务规则', '状态写入', '行为测试'];
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 135}}>
      <div style={{textAlign: 'center', opacity: enter(frame, 12)}}>
        <EvidenceIcon name="route" size={46} tone={COLOR.text.brand} />
        <div style={{...TYPE.display, fontFamily: FONT.sans, fontSize: 70, maxWidth: 1280, margin: '22px auto 0'}}>
          新增任务，从 HTTP 请求到保存，经过哪些文件？
        </div>
      </div>
      <div style={{position: 'absolute', left: 260, right: 260, top: 560, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 46}}>
        {targets.map((target, index) => {
          const progress = enter(frame, 42 + index * 10);
          return (
            <div key={target} style={{paddingTop: 18, color: index === 0 ? COLOR.text.brand : COLOR.text.secondary, opacity: progress, translate: `0 ${(1 - progress) * 16}px`}}>
              <div style={{...TYPE.codeSmall, color: COLOR.text.tertiary}}>0{index + 1}</div>
              <div style={{...TYPE.subheading, marginTop: 8}}>{target}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const BroadScanScene: React.FC = () => {
  const frame = useCurrentFrame();
  const spotlightMove = motionProgress(frame, 330, MOTION.structural, EASE.standard);
  const spotlight: EvidenceSpotlightRect = {
    left: 2.5,
    top: interpolate(spotlightMove, [0, 1], [15, 49]),
    width: interpolate(spotlightMove, [0, 1], [95, 78]),
    height: interpolate(spotlightMove, [0, 1], [28, 20]),
  };
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <TerminalFocus title="Claude 先看了什么？">
        <TerminalStill
          file="broad-scan.png"
          title="claude-code-lab · project exploration"
          focus="50% 42%"
          zoom={1.06}
          spotlight={spotlight}
          spotlightProgress={enter(frame, 78, MOTION.structural)}
        />
      </TerminalFocus>
    </AbsoluteFill>
  );
};

const TraceFlowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    ['HTTP', 'create-task-route.js', 'request.body', COLOR.brand.orange],
    ['RULE', 'create-task.js', 'title check', COLOR.brand.blue],
    ['STATE', 'task-store.js', 'save + id', COLOR.brand.green],
    ['TEST', 'create-task-route.test.js', 'assert behavior', COLOR.text.warning],
  ] as const;
  const nodeWidth = 320;
  const gap = 60;
  const startX = 140;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="几个文件怎样连起来？" align="center" />
      <div style={{position: 'absolute', left: startX, top: 390, display: 'flex', gap, alignItems: 'stretch'}}>
        {nodes.map(([label, file, detail, tone], index) => {
          const progress = enter(frame, 22 + index * 22, MOTION.structural);
          return (
            <div key={label} style={{width: nodeWidth, minHeight: 230, paddingTop: 20, opacity: progress, translate: `0 ${(1 - progress) * 18}px`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <EvidenceIcon name={index === 0 ? 'route' : index === 1 ? 'file' : index === 2 ? 'edit' : 'test'} size={30} tone={tone} />
                <div style={{...TYPE.codeSmall, color: tone, fontWeight: WEIGHT.bold}}>{label}</div>
              </div>
              <div style={{...TYPE.body, fontFamily: FONT.mono, fontWeight: WEIGHT.bold, marginTop: 18, wordBreak: 'break-word'}}>{file}</div>
              <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 20}}>{detail}</div>
            </div>
          );
        })}
      </div>
      {[0, 1, 2].map((index) => (
        <FlowArrow key={index} x1={startX + nodeWidth + index * (nodeWidth + gap) + 8} x2={startX + nodeWidth + index * (nodeWidth + gap) + gap - 12} y={505} progress={enter(frame, 38 + index * 22)} />
      ))}
    </AbsoluteFill>
  );
};

const EvidenceGraphScene: React.FC = () => {
  const frame = useCurrentFrame();
  const showGraph = frame >= seconds(10);
  const graphFrame = Math.max(0, frame - seconds(10));
  const rows = episode.content.evidenceGraph;
  const tones = [COLOR.brand.orange, COLOR.brand.blue, COLOR.brand.green, COLOR.text.warning] as const;
  if (!showGraph) {
    return (
      <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
        <TerminalFocus title="真实回答里有哪些证据？">
          <TerminalStill file="evidence-answer.png" title="claude-code-lab · evidence answer" focus="50% 45%" zoom={1.06} />
        </TerminalFocus>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="怎样整理成可复查的结果？" />
      <div style={{position: 'absolute', left: 190, right: 190, top: 285, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {rows.map((row, index) => {
          const progress = enter(graphFrame, 8 + index * 18);
          return (
            <div key={row.role} style={{display: 'grid', gridTemplateColumns: '180px 460px 1fr', alignItems: 'center', minHeight: 130, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: progress, translate: `${(1 - progress) * 18}px 0`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <span style={{width: 12, height: 12, borderRadius: 12, background: tones[index]}} />
                <span style={{...TYPE.label, color: tones[index]}}>{row.role}</span>
              </div>
              <span style={{...TYPE.codeSmall, color: COLOR.text.primary, fontWeight: WEIGHT.bold}}>{row.file}</span>
              <span style={{...TYPE.body, color: COLOR.text.secondary}}>{row.claim}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 190, right: 190, bottom: 132, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 60, opacity: enter(graphFrame, 88)}}>
        {[
          ['CONFIRMED', 'check', COLOR.text.success],
          ['INFERRED', 'graph', COLOR.text.info],
          ['OPEN', 'observe', COLOR.text.warning],
        ].map(([label, icon, tone]) => (
          <div key={label} style={{display: 'flex', alignItems: 'center', gap: 14, paddingTop: 13}}>
            <EvidenceIcon name={icon as 'check' | 'graph' | 'observe'} size={28} tone={tone} />
            <span style={{...TYPE.codeSmall, color: tone}}>{label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const VerifyUnderstandingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const showWorkspace = frame >= seconds(23);
  if (showWorkspace) {
    return (
      <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
        <TerminalFocus title="工作区发生变化了吗？">
          <TerminalStill file="workspace-check.png" title="claude-code-lab · read-only verification" focus="50% 52%" zoom={1.06} />
        </TerminalFocus>
      </AbsoluteFill>
    );
  }
  const flow = enter(frame, 78, MOTION.expressive);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="传入三个空格会怎样？" align="center" />
      <div style={{position: 'absolute', left: 250, right: 250, top: 340, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 150}}>
        <div style={{paddingTop: 20, opacity: enter(frame, 18)}}>
          <div style={{...TYPE.codeSmall, color: COLOR.text.info}}>CURRENT RULE</div>
          <div style={{...TYPE.code, fontSize: 31, marginTop: 24}}>title.length &gt; 0</div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 18}}>没有调用 trim</div>
        </div>
        <div style={{paddingTop: 20, opacity: enter(frame, 48)}}>
          <div style={{...TYPE.codeSmall, color: COLOR.text.brand}}>INPUT</div>
          <div style={{...TYPE.code, fontSize: 31, marginTop: 24}}>title = &quot;&nbsp;&nbsp;&nbsp;&quot;</div>
          <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 18}}>长度为 3，通过校验</div>
        </div>
      </div>
      <FlowArrow x1={810} x2={1080} y={650} progress={flow} tone={COLOR.text.danger} />
      <div style={{position: 'absolute', left: 610, right: 610, top: 710, paddingTop: 18, textAlign: 'center', opacity: enter(frame, 94)}}>
        <div style={{...TYPE.subheading}}>201 Created → store.save</div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 10}}>测试记录了当前空白标题缺口</div>
      </div>
    </AbsoluteFill>
  );
};

const StopRuleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const questions = [
    ['入口', '谁接收输入？'],
    ['规则', '谁决定行为？'],
    ['状态', '谁写入结果？'],
    ['证据', '什么证明当前行为？'],
    ['未知', '还需要确认什么？'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="还需要继续读吗？" align="center" />
      <div style={{position: 'absolute', left: 230, right: 230, top: 330, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {questions.map(([label, question], index) => {
          const progress = enter(frame, 18 + index * 14);
          return (
            <div key={label} style={{display: 'grid', gridTemplateColumns: '150px 1fr 90px', alignItems: 'center', minHeight: 92, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: progress}}>
              <span style={{...TYPE.label, color: index === questions.length - 1 ? COLOR.text.warning : COLOR.text.brand}}>{label}</span>
              <span style={{...TYPE.subheading, fontSize: 32}}>{question}</span>
              <span style={{...TYPE.codeSmall, justifySelf: 'end', color: index === questions.length - 1 ? COLOR.text.warning : COLOR.text.success}}>{index === questions.length - 1 ? 'OPEN' : 'READY'}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const evidence = [
    ['route', 'HTTP 入口', COLOR.brand.orange],
    ['file', '业务规则', COLOR.brand.blue],
    ['edit', '状态写入', COLOR.brand.green],
    ['test', '行为证据', COLOR.text.warning],
  ] as const;
  const taskIn = enter(frame, 220, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp04Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 155, right: 655, top: 430, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 42, opacity: 1 - taskIn * 0.55}}>
        {evidence.map(([icon, label, tone], index) => {
          const progress = enter(frame, 20 + index * 16);
          return (
            <div key={label} style={{display: 'grid', justifyItems: 'center', gap: 20, paddingTop: 34, opacity: progress, translate: `0 ${(1 - progress) * 16}px`}}>
              <EvidenceIcon name={icon} size={46} tone={tone} />
              <div style={{...TYPE.label, color: tone, fontWeight: WEIGHT.bold}}>{label}</div>
            </div>
          );
        })}
      </div>
      <FlowArrow x1={1260} x2={1390} y={650} progress={taskIn} tone={COLOR.text.brand} />
      <div style={{position: 'absolute', right: 170, top: 365, width: 320, opacity: taskIn, translate: `${(1 - taskIn) * 22}px 0`}}>
        <EvidenceIcon name="file" size={48} tone={COLOR.text.brand} />
        <div style={{...TYPE.codeSmall, color: COLOR.text.brand, marginTop: 22}}>NEXT CHAPTER</div>
        <div style={{...TYPE.subheading, marginTop: 10}}>任务说明</div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 18}}>证据怎样变成边界与验收？</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'three-layers': ThreeLayersScene,
  'investigation-question': InvestigationQuestionScene,
  'broad-scan': BroadScanScene,
  'trace-flow': TraceFlowScene,
  'evidence-graph': EvidenceGraphScene,
  'verify-understanding': VerifyUnderstandingScene,
  'stop-rule': StopRuleScene,
  takeaway: TakeawayScene,
};

export const Ep04UnderstandProject: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP04_UNDERSTAND_PROJECT_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(13)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp04Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP04 scene component: ${scene.id}`);
        return (
          <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}>
            <Scene />
          </SceneSequence>
        );
      })}
      {episode.status === 'draft' ? (
        <SyncedNarrationTrack
          manifest="claude-code-course/audio/ep04-understand-project/captions.json"
          auditPrefix="ep04-synced-caption"
        />
      ) : null}
    </CourseLayout>
  );
};
