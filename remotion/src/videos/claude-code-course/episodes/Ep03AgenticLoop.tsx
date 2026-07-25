import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {Fragment} from 'react';
import {
  EP03_AGENTIC_LOOP_DURATION_IN_FRAMES,
  EP03_AGENTIC_LOOP_EPISODE,
  EP03_AGENTIC_LOOP_SCENES,
  getEp03Scene,
} from '../data/ep03AgenticLoop';
import {COLOR, FONT, FRAME, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, EvidenceIcon, type EvidenceIconName, RecordedTerminal, SceneQuestion, SceneSequence, SyncedNarrationTrack, TerminalFocus} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP03_AGENTIC_LOOP_DURATION_IN_FRAMES};

const episode = EP03_AGENTIC_LOOP_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const stillRoot = 'claude-code-course/terminal/ep03-agentic-loop-stills';

const enter = (frame: number, at = 0, duration: number = MOTION.productive) =>
  motionProgress(frame, at, duration, EASE.enter);

const SceneHeading: React.FC<{title: string; detail?: string; align?: 'left' | 'center'}> = ({
  title,
  detail,
  align = 'left',
}) => (
  <div style={{textAlign: align}}>
    <div style={{...TYPE.heading}}>{title}</div>
    {detail ? <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 12}}>{detail}</div> : null}
  </div>
);

const TerminalStill: React.FC<{
  file: string;
  title: string;
  focus?: string;
  zoom?: number;
}> = ({file, title, focus = '50% 50%', zoom = LAYOUT.terminalEvidence.focus.zoom}) => (
  <RecordedTerminal src={`${stillRoot}/${file}`} title={title} focus={focus} zoom={zoom} />
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rewind = enter(frame, 54, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 148}}>
      <div style={{textAlign: 'center', opacity: enter(frame, 30), translate: `0 ${(1 - enter(frame, 30)) * 22}px`}}>
        <div style={{...TYPE.display}}>{getEp03Scene('hook').title}</div>
      </div>
      <div style={{position: 'absolute', left: 260, right: 260, top: 520, display: 'grid', gridTemplateColumns: '1fr 220px 1fr', alignItems: 'center'}}>
        <div style={{paddingTop: 20, opacity: 1 - rewind * 0.55}}>
          <div style={{...TYPE.label, color: COLOR.text.success}}>已完成</div>
          <div style={{...TYPE.subheading, marginTop: 10}}>3 tests pass</div>
          <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 14}}>diff check · exit 0</div>
        </div>
        <div style={{display: 'grid', placeItems: 'center', opacity: rewind}}>
          <EvidenceIcon name="route" size={48} tone={COLOR.text.brand} />
          <div style={{...TYPE.codeSmall, color: COLOR.text.brand, marginTop: 12}}>REWIND</div>
        </div>
        <div style={{paddingTop: 20, opacity: rewind, translate: `${(1 - rewind) * 22}px 0`}}>
          <div style={{...TYPE.label, color: COLOR.text.brand}}>运行回放</div>
          <div style={{...TYPE.subheading, marginTop: 10}}>7 tool calls</div>
          <div style={{...TYPE.codeSmall, color: COLOR.text.secondary, marginTop: 14}}>tool_use ↔ tool_result</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LoopModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phases = episode.content.loop;
  const tones = [COLOR.brand.blue, COLOR.brand.orange, COLOR.brand.green] as const;
  const positions = [
    {left: 960, top: 315},
    {left: 1395, top: 650},
    {left: 525, top: 650},
  ];
  const line = enter(frame, 48, MOTION.expressive);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="工具结果怎样推动下一步？" align="center" />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <marker id="ep03-loop-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.stroke.strong} />
          </marker>
        </defs>
        <path d="M 960 390 C 1220 390 1390 550 1330 705" fill="none" stroke={COLOR.stroke.default} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} markerEnd="url(#ep03-loop-arrow)" />
        <path d="M 1240 760 C 1050 930 765 930 575 760" fill="none" stroke={COLOR.stroke.default} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} markerEnd="url(#ep03-loop-arrow)" />
        <path d="M 590 690 C 520 520 690 390 900 390" fill="none" stroke={COLOR.stroke.default} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} markerEnd="url(#ep03-loop-arrow)" />
      </svg>
      {phases.map((phase, index) => {
        const itemIn = enter(frame, 20 + index * 14, MOTION.structural);
        return (
          <div key={phase.id} style={{position: 'absolute', ...positions[index], width: 400, translate: '-50% -50%', textAlign: 'center', opacity: itemIn}}>
            <div style={{width: 18, height: 18, borderRadius: 20, background: tones[index], margin: '0 auto 18px'}} />
            <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: tones[index]}}>{phase.label}</div>
            <div style={{...TYPE.subheading, marginTop: 8}}>{phase.short}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 760, top: 560, width: 400, display: 'grid', placeItems: 'center', opacity: enter(frame, 92)}}>
        <EvidenceIcon name="route" size={52} tone={COLOR.text.tertiary} />
      </div>
    </AbsoluteFill>
  );
};

const TaskContractScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    ['目标', '拒绝空字符串和全空白 Token'],
    ['范围', '只修改必要文件'],
    ['结束', '3 tests pass · diff check clean'],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp03Scene('task-contract').title} align="center" />
      <div style={{position: 'absolute', left: 330, right: 330, top: 330, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {rows.map(([label, value], index) => {
          const itemIn = enter(frame, 26 + index * 18);
          return (
            <div key={label} style={{display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', minHeight: 135, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: itemIn, translate: `${(1 - itemIn) * -20}px 0`}}>
              <div style={{...TYPE.label, color: index === 2 ? COLOR.text.success : COLOR.text.brand}}>{label}</div>
              <div style={{...TYPE.subheading}}>{value}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ReplayFeedbackScene: React.FC<{
  sceneId: 'gather-context' | 'take-action' | 'verify-results';
  phase: string;
  request: string;
  result: string;
  next: string;
  tone: string;
  icon: EvidenceIconName;
}> = ({sceneId, phase, request, result, next, tone, icon}) => {
  const frame = useCurrentFrame();
  const requestIn = enter(frame, 24, MOTION.structural);
  const resultIn = enter(frame, 62, MOTION.structural);
  const nextIn = enter(frame, 102, MOTION.structural);
  const line = enter(frame, 48, MOTION.expressive);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title={getEp03Scene(sceneId).title} align="center" />
      <div style={{position: 'absolute', left: 220, right: 220, top: 385, display: 'grid', gridTemplateColumns: '1fr 120px 1fr 120px 1fr', alignItems: 'center'}}>
        {[
          {label: phase, value: request, progress: requestIn, icon},
          {label: 'TOOL RESULT', value: result, progress: resultIn, icon: result.includes('fail') ? 'stop' as const : 'check' as const},
          {label: 'NEXT DECISION', value: next, progress: nextIn, icon: 'route' as const},
        ].map((item, index) => (
          <Fragment key={item.label}>
            <div style={{minHeight: 250, display: 'grid', alignContent: 'start', justifyItems: 'center', textAlign: 'center', opacity: item.progress, translate: `0 ${(1 - item.progress) * 18}px`}}>
              <EvidenceIcon name={item.icon} size={48} tone={index === 1 && result.includes('fail') ? COLOR.text.danger : tone} />
              <div style={{...TYPE.codeSmall, color: index === 1 && result.includes('fail') ? COLOR.text.danger : tone, marginTop: 24}}>{item.label}</div>
              <div style={{...TYPE.subheading, marginTop: 14}}>{item.value}</div>
            </div>
            {index < 2 ? <div style={{height: 2, background: COLOR.stroke.default, scale: `${line} 1`, transformOrigin: 'left center'}} /> : null}
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const GatherContextScene: React.FC = () => (
  <ReplayFeedbackScene sceneId="gather-context" phase="READ + BASH" request="测试与实现" result="2 tests fail" next="定位判断条件" tone={COLOR.brand.blue} icon="read" />
);

const TakeActionScene: React.FC = () => (
  <ReplayFeedbackScene sceneId="take-action" phase="EDIT" request="替换判断条件" result="workspace changed" next="运行验证" tone={COLOR.brand.orange} icon="edit" />
);

const VerifyResultsScene: React.FC = () => (
  <ReplayFeedbackScene sceneId="verify-results" phase="BASH" request="test + diff check" result="3 pass · exit 0" next="汇总并停止" tone={COLOR.brand.green} icon="shell" />
);

const SessionLedgerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const architecture = episode.content.sessionEvidence.observedArchitecture;
  const showLedger = frame >= seconds(8);
  const events = [
    ['04', 'user', 'prompt', COLOR.text.primary],
    ['10', 'assistant', 'tool_use · Bash', COLOR.brand.orange],
    ['11', 'user', 'tool_result · ok', COLOR.brand.green],
    ['23', 'user', 'tool_result · error', COLOR.text.danger],
    ['28', 'file-history', 'delta', COLOR.text.warning],
    ['39', 'system', 'turn_duration', COLOR.text.tertiary],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      {showLedger ? <SceneHeading title="会话在本地怎样保存？" /> : null}
      {showLedger ? (
        <div style={{position: 'absolute', left: 220, right: 220, top: 275, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 90}}>
          <div style={{paddingTop: 12}}>
            <div style={{...TYPE.codeSmall, color: COLOR.text.brand}}>OBSERVED RUN</div>
            <div style={{...TYPE.display, fontFamily: FONT.sans, fontSize: 74, marginTop: 14}}>{architecture.sessionEvents}</div>
            <div style={{...TYPE.body, fontWeight: WEIGHT.bold}}>session events</div>
            <div style={{marginTop: 44, paddingTop: 18, borderTop: `1px solid ${COLOR.stroke.default}`}}>
              <div style={{...TYPE.subheading}}>{architecture.linkedNodes} 个链式节点</div>
              <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 8}}>{architecture.resolvedParents} 个 parentUuid 可解析</div>
            </div>
          </div>
          <div style={{position: 'relative', borderTop: `1px solid ${COLOR.stroke.default}`}}>
            <div style={{position: 'absolute', left: 72, top: 0, bottom: 0, width: 2, background: COLOR.stroke.soft}} />
            {events.map(([sequence, type, detail, tone], index) => {
              const itemIn = enter(frame, seconds(8) + 12 + index * 7);
              return (
                <div key={sequence} style={{position: 'relative', display: 'grid', gridTemplateColumns: '105px 210px 1fr', minHeight: 91, alignItems: 'center', borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: itemIn, translate: `${(1 - itemIn) * 18}px 0`}}>
                  <span style={{position: 'relative', zIndex: 1, width: 44, height: 44, borderRadius: 44, display: 'grid', placeItems: 'center', background: COLOR.canvas.base, border: `2px solid ${tone}`, ...TYPE.codeSmall, color: tone}}>{sequence}</span>
                  <span style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{type}</span>
                  <span style={{...TYPE.body, color: COLOR.text.secondary}}>{detail}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <TerminalFocus title="Ctrl+O 展示了哪些信息？">
          <TerminalStill file="transcript.png" title="claude-code-lab · transcript viewer" focus="50% 46%" zoom={1.08} />
        </TerminalFocus>
      )}
    </AbsoluteFill>
  );
};

const LogEventNode: React.FC<{
  x: number;
  y: number;
  width: number;
  icon: EvidenceIconName;
  owner: string;
  event: string;
  detail: string;
  tone: string;
  progress: number;
}> = ({x, y, width, icon, owner, event, detail, tone, progress}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      opacity: progress,
      translate: `0 ${(1 - progress) * 18}px`,
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <EvidenceIcon name={icon} size={36} tone={tone} />
      <span style={{...TYPE.labelSmall, color: COLOR.text.tertiary}}>{owner}</span>
    </div>
    <div style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold, marginTop: 18}}>{event}</div>
    <div style={{...TYPE.subheading, marginTop: 8}}>{detail}</div>
  </div>
);

const ToolCorrelationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const architecture = episode.content.sessionEvidence.observedArchitecture;
  const useIn = enter(frame, 22, MOTION.structural);
  const pairLine = enter(frame, 58, MOTION.expressive);
  const resultIn = enter(frame, 76, MOTION.structural);
  const nextLine = enter(frame, 112, MOTION.expressive);
  const nextIn = enter(frame, 132, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneQuestion title="一次工具调用怎样配对？" align="left" handoffAt={52} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <marker id="ep03-log-pair-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.brand.orange} />
          </marker>
          <marker id="ep03-log-next-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.text.danger} />
          </marker>
        </defs>
        <path d="M 760 425 C 850 425 940 425 1030 425" fill="none" stroke={COLOR.brand.orange} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - pairLine} markerEnd="url(#ep03-log-pair-arrow)" opacity={pairLine} />
        <path d="M 1280 530 C 1280 590 1170 625 1050 675" fill="none" stroke={COLOR.text.danger} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - nextLine} markerEnd="url(#ep03-log-next-arrow)" opacity={nextLine} />
      </svg>
      <div style={{position: 'absolute', left: 800, top: 378, width: 205, padding: '6px 0', background: COLOR.canvas.base, ...TYPE.codeSmall, fontSize: 18, textAlign: 'center', color: COLOR.text.brand, opacity: pairLine}}>tool_use_id #05</div>
      <LogEventNode x={250} y={330} width={510} icon="shell" owner="assistant · message 03" event="tool_use #05" detail="Bash · baseline test" tone={COLOR.brand.orange} progress={useIn} />
      <LogEventNode x={1030} y={330} width={560} icon="stop" owner="user" event="tool_result #05" detail="is_error · true" tone={COLOR.text.danger} progress={resultIn} />
      <LogEventNode x={930} y={675} width={620} icon="edit" owner="assistant · message 04" event="tool_use #06" detail="Edit · next action" tone={COLOR.brand.blue} progress={nextIn} />
      <div style={{position: 'absolute', left: 250, bottom: 180, display: 'grid', gridTemplateColumns: 'repeat(3, 180px)', gap: 34}}>
        {[
          [`${architecture.toolCalls} / ${architecture.toolResults}`, '调用与结果'],
          [`${architecture.pairedTools} / ${architecture.toolCalls}`, '关联完整'],
          [`${architecture.assistantEntries} → ${architecture.assistantMessages}`, '事件 → message'],
        ].map(([value, label], index) => (
          <div key={label} style={{opacity: enter(frame, 168 + index * 8)}}>
            <div style={{...TYPE.code, fontWeight: WEIGHT.bold}}>{value}</div>
            <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 6}}>{label}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CheckpointArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const architecture = episode.content.sessionEvidence.observedArchitecture;
  const lanes = [
    {
      label: 'SESSION JSONL',
      title: '消息与工具因果',
      tone: COLOR.brand.blue,
      rows: ['user prompt', 'tool_use · Edit', 'tool_result · success'],
    },
    {
      label: 'FILE HISTORY',
      title: '可恢复的文件状态',
      tone: COLOR.brand.orange,
      rows: [`snapshot × ${architecture.fileHistorySnapshots}`, `delta × ${architecture.fileHistoryDeltas}`, 'pre-edit backup'],
    },
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="文件修改怎样恢复？" align="center" />
      <div style={{position: 'absolute', left: 260, right: 260, top: 310, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 150}}>
        {lanes.map((lane, laneIndex) => (
          <div key={lane.label} style={{paddingTop: 18, opacity: enter(frame, 18 + laneIndex * 16)}}>
            <div style={{...TYPE.codeSmall, color: lane.tone}}>{lane.label}</div>
            <div style={{...TYPE.subheading, marginTop: 8}}>{lane.title}</div>
            <div style={{marginTop: 34, borderTop: `1px solid ${COLOR.stroke.default}`}}>
              {lane.rows.map((row, index) => (
                <div key={row} style={{display: 'grid', gridTemplateColumns: '54px 1fr', alignItems: 'center', minHeight: 82, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: enter(frame, 42 + laneIndex * 12 + index * 8)}}>
                  <span style={{width: 12, height: 12, borderRadius: 12, background: index === 1 ? lane.tone : COLOR.stroke.strong}} />
                  <span style={{...TYPE.body, fontWeight: index === 1 ? WEIGHT.bold : WEIGHT.regular}}>{row}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 260, right: 260, bottom: 175, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 150, opacity: enter(frame, 104)}}>
        <div style={{...TYPE.labelSmall, color: COLOR.text.success}}>可回退：Edit · Write · NotebookEdit</div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.danger}}>不覆盖：Bash 改文件 · 远程副作用</div>
      </div>
    </AbsoluteFill>
  );
};

const ObservabilityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const columns = [
    {
      label: 'RAW TRANSCRIPT',
      title: '本地证据',
      tone: COLOR.text.danger,
      lines: ['message content', 'tool input / result', 'paths · identifiers'],
    },
    {
      label: 'HOOK INPUT',
      title: '自动化入口',
      tone: COLOR.brand.blue,
      lines: ['session_id', 'transcript_path', 'permission_mode'],
    },
    {
      label: 'DERIVED VIEW',
      title: '公开结构',
      tone: COLOR.brand.green,
      lines: ['event / parent ordinal', 'tool pair · isError', 'checkpoint counts'],
    },
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="日志能否接入自动化？" align="center" />
      <div style={{position: 'absolute', left: 180, right: 180, top: 330, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 80}}>
        {columns.map((column, columnIndex) => (
          <div key={column.label} style={{paddingTop: 20, opacity: enter(frame, 22 + columnIndex * 18), translate: `0 ${(1 - enter(frame, 22 + columnIndex * 18)) * 18}px`}}>
            <div style={{...TYPE.codeSmall, color: column.tone}}>{column.label}</div>
            <div style={{...TYPE.subheading, marginTop: 9}}>{column.title}</div>
            <div style={{marginTop: 30, borderTop: `1px solid ${COLOR.stroke.default}`}}>
              {column.lines.map((line) => <div key={line} style={{...TYPE.labelSmall, color: COLOR.text.secondary, minHeight: 62, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${COLOR.stroke.soft}`}}>{line}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 180, right: 180, bottom: 170, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: enter(frame, 100)}}>
        <span style={{...TYPE.labelSmall, color: COLOR.text.danger}}>明文 · 权限受限 · Git 忽略</span>
        <span style={{height: 1, flex: 1, margin: '0 34px', background: COLOR.stroke.default}} />
        <span style={{...TYPE.labelSmall, color: COLOR.text.success}}>保留关系 · 移除正文</span>
      </div>
    </AbsoluteFill>
  );
};

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phases = [
    ['model', 'MODEL', COLOR.brand.blue],
    ['shell', 'TOOLS', COLOR.brand.orange],
    ['graph', 'SESSION', COLOR.brand.green],
  ] as const;
  const layersOut = interpolate(frame, [570, 610], [1, 0.2], {
    easing: EASE.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const gatherIn = enter(frame, 600, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title={getEp03Scene('takeaway').title} align="center" />
      <div style={{position: 'absolute', left: 220, right: 220, top: 410, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70, opacity: layersOut}}>
        {phases.map(([icon, label, tone], index) => {
          const itemIn = enter(frame, 24 + index * 14);
          return (
            <div key={label} style={{display: 'grid', justifyItems: 'center', gap: 24, paddingTop: 34, opacity: itemIn, translate: `0 ${(1 - itemIn) * 16}px`}}>
              <EvidenceIcon name={icon} size={58} tone={tone} />
              <div style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 610, right: 610, top: 690, display: 'grid', justifyItems: 'center', gap: 14, opacity: gatherIn, translate: `0 ${(1 - gatherIn) * 20}px`}}>
        <EvidenceIcon name="read" size={48} tone={COLOR.brand.blue} />
        <div style={{...TYPE.code, color: COLOR.brand.blue, fontWeight: WEIGHT.bold}}>GATHER CONTEXT</div>
        <div style={{...TYPE.label, color: COLOR.text.secondary}}>先读什么？</div>
      </div>
    </AbsoluteFill>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  hook: HookScene,
  'loop-model': LoopModelScene,
  'task-contract': TaskContractScene,
  'gather-context': GatherContextScene,
  'take-action': TakeActionScene,
  'verify-results': VerifyResultsScene,
  'session-ledger': SessionLedgerScene,
  'tool-correlation': ToolCorrelationScene,
  'checkpoint-architecture': CheckpointArchitectureScene,
  observability: ObservabilityScene,
  takeaway: TakeawayScene,
};

export const Ep03AgenticLoop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="Claude Code 实操"
      episodeTitle={episode.title}
      scenes={EP03_AGENTIC_LOOP_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= seconds(10)}
    >
      {episode.scenes.map((scene) => {
        const timing = getEp03Scene(scene.id);
        const Scene = SCENE_COMPONENTS[scene.id];
        if (!Scene) throw new Error(`Missing EP03 scene component: ${scene.id}`);
        return <SceneSequence key={scene.id} from={timing.start} durationInFrames={timing.duration}><Scene /></SceneSequence>;
      })}
      {episode.status === 'draft' ? (
        <SyncedNarrationTrack
          manifest="claude-code-course/audio/ep03-agentic-loop/captions.json"
          auditPrefix="ep03-synced-caption"
        />
      ) : null}
    </CourseLayout>
  );
};
