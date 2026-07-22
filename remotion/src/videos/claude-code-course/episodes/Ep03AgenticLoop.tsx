import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  EP03_AGENTIC_LOOP_DURATION_IN_FRAMES,
  EP03_AGENTIC_LOOP_EPISODE,
  EP03_AGENTIC_LOOP_SCENES,
  getEp03Scene,
} from '../data/ep03AgenticLoop';
import {COLOR, FONT, FRAME, LAYOUT, TYPE, WEIGHT} from '../designTokens';
import {CourseLayout, SceneSequence, SyncedNarrationTrack, TERMINAL_HEADER_HEIGHT, TerminalPanel} from '../kit';
import {EASE, MOTION, motionProgress} from '../motion';
import {seconds} from '../timeline';

export {EP03_AGENTIC_LOOP_DURATION_IN_FRAMES};

const episode = EP03_AGENTIC_LOOP_EPISODE;
const scenePad = {padding: LAYOUT.scenePadding, boxSizing: 'border-box' as const};
const stillRoot = 'claude-code-course/terminal/ep03-agentic-loop-stills';
const terminalEvidence = LAYOUT.terminalEvidence;

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
  objectPosition?: string;
}> = ({file, title, objectPosition = 'center center'}) => (
  <TerminalPanel title={title}>
    <Img
      src={staticFile(`${stillRoot}/${file}`)}
      style={{
        width: '100%',
        height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
        objectFit: 'contain',
        objectPosition,
        display: 'block',
      }}
    />
  </TerminalPanel>
);

const EvidenceRail: React.FC<{marker: string; title: string; detail: string; tone: string; progress: number}> = ({
  marker,
  title,
  detail,
  tone,
  progress,
}) => (
  <div
    style={{
      padding: '15px 0 17px 26px',
      borderLeft: `${FRAME.focusRail}px solid ${tone}`,
      opacity: progress,
      translate: `${(1 - progress) * 18}px 0`,
    }}
  >
    <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: tone}}>{marker}</div>
    <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 4}}>{title}</div>
    <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 4}}>{detail}</div>
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = enter(frame, 54, MOTION.structural);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 148}}>
      <div style={{textAlign: 'center', opacity: enter(frame, 30), translate: `0 ${(1 - enter(frame, 30)) * 22}px`}}>
        <div style={{...TYPE.display}}>一句指令，怎样变成工程结果？</div>
        <div style={{...TYPE.subheading, color: COLOR.text.secondary, marginTop: 18}}>先不要看最终回答，打开中间这段过程</div>
      </div>
      <div style={{position: 'absolute', left: 270, right: 270, top: 560, display: 'grid', gridTemplateColumns: '1fr 220px 1fr', alignItems: 'center'}}>
        <div style={{paddingTop: 20, borderTop: `4px solid ${COLOR.brand.orange}`}}>
          <div style={{...TYPE.label, color: COLOR.text.brand}}>输入</div>
          <div style={{...TYPE.subheading, marginTop: 10}}>修复空白 Token</div>
        </div>
        <div style={{position: 'relative', height: 1, background: COLOR.stroke.default, scale: `${reveal} 1`}}>
          <div style={{position: 'absolute', left: '50%', top: -26, translate: '-50% 0', padding: '0 14px', background: COLOR.canvas.base, ...TYPE.labelSmall, fontSize: 19, whiteSpace: 'nowrap', color: COLOR.text.tertiary}}>中间发生了什么</div>
        </div>
        <div style={{paddingTop: 20, borderTop: `4px solid ${COLOR.brand.green}`, opacity: reveal, translate: `${(1 - reveal) * 22}px 0`}}>
          <div style={{...TYPE.label, color: COLOR.text.success}}>结果</div>
          <div style={{...TYPE.subheading, marginTop: 10}}>修改 + 验证证据</div>
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
      <SceneHeading title="三个阶段，不是一条直线" detail="工具结果不断回到会话，推动下一步判断" align="center" />
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
      <div style={{position: 'absolute', left: 760, top: 560, width: 400, textAlign: 'center', opacity: enter(frame, 92)}}>
        <div style={{...TYPE.label, color: COLOR.text.tertiary}}>TOOL RESULT</div>
        <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 8}}>每个结果都成为新上下文</div>
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
      <SceneHeading title="先给循环一个终止条件" detail="目标、范围和验证结果足以启动这次任务" align="center" />
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

const GatherContextScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="Gather context：先确认失败，再定位实现" detail="文件内容和退出状态来自真实工具结果" />
      <div style={{position: 'absolute', left: terminalEvidence.left, top: terminalEvidence.top, width: terminalEvidence.width, height: terminalEvidence.height, opacity: enter(frame, 16)}}>
        <TerminalStill file="baseline-fail.png" title="claude-code-lab · baseline" objectPosition="center 38%" />
      </div>
      <div style={{position: 'absolute', left: terminalEvidence.railLeft, top: 300, width: terminalEvidence.railWidth, display: 'grid', gap: 24}}>
        <EvidenceRail marker="READ × 2" title="读取测试与实现" detail="观察当前磁盘事实" tone={COLOR.text.info} progress={enter(frame, 44)} />
        <EvidenceRail marker="BASH" title="复现 2 个失败" detail="Exit code 1" tone={COLOR.text.danger} progress={enter(frame, 68)} />
        <EvidenceRail marker="FEEDBACK" title="错误返回会话" detail="下一步有了依据" tone={COLOR.text.brand} progress={enter(frame, 94)} />
      </div>
    </AbsoluteFill>
  );
};

const TakeActionScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="Take action：计划必须落到工作区" detail="Edit 成功返回以后，diff 才是新的事实" />
      <div style={{position: 'absolute', left: terminalEvidence.left, top: terminalEvidence.top, width: terminalEvidence.width, height: terminalEvidence.height, opacity: enter(frame, 16)}}>
        <TerminalStill file="edit.png" title="claude-code-lab · Edit" objectPosition="center 48%" />
      </div>
      <div style={{position: 'absolute', left: terminalEvidence.railLeft, top: 370, width: terminalEvidence.railWidth, paddingLeft: 24, borderLeft: `${FRAME.focusRail}px solid ${COLOR.brand.orange}`, opacity: enter(frame, 64)}}>
        <div style={{...TYPE.labelSmall, fontFamily: FONT.mono, color: COLOR.text.brand}}>ONE LINE</div>
        <div style={{...TYPE.subheading, marginTop: 10}}>trim 后<br />长度大于 0</div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 20}}>范围保持收敛</div>
      </div>
    </AbsoluteFill>
  );
};

const VerifyResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const showDiffCheck = frame >= seconds(16);
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading
        title={showDiffCheck ? '第二个信号：补丁干净' : 'Verify results：行为已经改变'}
        detail={showDiffCheck ? 'git diff --check · exit 0' : 'pnpm test · 3 passed · 0 failed'}
      />
      <div style={{position: 'absolute', left: terminalEvidence.left, top: terminalEvidence.top, width: terminalEvidence.width, height: terminalEvidence.height}}>
        {showDiffCheck ? (
          <TerminalStill file="diff-check.png" title="claude-code-lab · diff check" objectPosition="center 54%" />
        ) : (
          <TerminalStill file="tests-pass.png" title="claude-code-lab · tests pass" objectPosition="center 38%" />
        )}
      </div>
      <div style={{position: 'absolute', left: terminalEvidence.railLeft, top: 330, width: terminalEvidence.railWidth, paddingLeft: 24, borderLeft: `${FRAME.focusRail}px solid ${COLOR.brand.green}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <span style={{width: 12, height: 12, borderRadius: 20, background: COLOR.brand.green}} />
        <span style={{...TYPE.labelSmall, color: COLOR.text.success}}>{showDiffCheck ? 'PATCH CLEAN' : 'BEHAVIOR PASS'}</span>
        </div>
        <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 16}}>{showDiffCheck ? '补丁检查' : '行为验证'}</div>
        <div style={{...TYPE.labelSmall, color: COLOR.text.secondary, marginTop: 6}}>exit code 0</div>
      </div>
    </AbsoluteFill>
  );
};

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
      <SceneHeading
        title={showLedger ? 'JSONL 是事件账本，不是聊天导出' : 'Ctrl+O 只是交互视图'}
        detail={showLedger ? '一行一个事件 · 追加写入 · parentUuid 保留因果关系' : '真正的持久化记录位于当前项目对应的 session JSONL'}
      />
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
        <>
          <div style={{position: 'absolute', left: terminalEvidence.left, top: terminalEvidence.top, width: terminalEvidence.width, height: terminalEvidence.height}}>
            <TerminalStill file="transcript.png" title="claude-code-lab · transcript viewer" objectPosition="center 45%" />
          </div>
          <div style={{position: 'absolute', left: terminalEvidence.railLeft, top: 360, width: terminalEvidence.railWidth, paddingLeft: 24, borderLeft: `${FRAME.focusRail}px solid ${COLOR.brand.blue}`}}>
            <div style={{...TYPE.labelSmall, color: COLOR.text.info}}>CURRENT VIEW</div>
            <div style={{...TYPE.body, fontWeight: WEIGHT.bold, marginTop: 12}}>滚动与折叠<br />限制可见范围</div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

const ToolCorrelationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const architecture = episode.content.sessionEvidence.observedArchitecture;
  const rows = [
    ['assistant · message 03', 'tool_use #05', 'Bash · baseline test', COLOR.brand.orange],
    ['user', 'tool_result #05', 'is_error · true', COLOR.text.danger],
    ['assistant · message 04', 'tool_use #06', 'Edit · next action', COLOR.brand.blue],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 122}}>
      <SceneHeading title="一次工具调用，至少跨两条记录" detail="tool_use_id 把动作与结果配对，错误结果继续进入上下文" />
      <div style={{position: 'absolute', left: 245, right: 245, top: 300, borderTop: `1px solid ${COLOR.stroke.default}`}}>
        {rows.map(([owner, event, detail, tone], index) => {
          const itemIn = enter(frame, 22 + index * 18);
          return (
            <div key={event} style={{display: 'grid', gridTemplateColumns: '340px 310px 1fr', alignItems: 'center', minHeight: 132, borderBottom: `1px solid ${COLOR.stroke.soft}`, opacity: itemIn}}>
              <span style={{...TYPE.label, color: COLOR.text.secondary}}>{owner}</span>
              <span style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{event}</span>
              <span style={{...TYPE.subheading}}>{detail}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 245, right: 245, bottom: 190, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70}}>
        {[
          [`${architecture.toolCalls} / ${architecture.toolResults}`, '调用与结果'],
          [`${architecture.pairedTools} / ${architecture.toolCalls}`, '关联完整'],
          [`${architecture.assistantEntries} → ${architecture.assistantMessages}`, '事件 → message'],
        ].map(([value, label], index) => (
          <div key={label} style={{paddingTop: 16, borderTop: `3px solid ${index === 1 ? COLOR.brand.green : COLOR.stroke.strong}`, opacity: enter(frame, 92 + index * 8)}}>
            <div style={{...TYPE.subheading}}>{value}</div>
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
      <SceneHeading title="会话因果与文件恢复是两套数据" detail="一次 Edit 同时留下会话事件与修改前的恢复点" align="center" />
      <div style={{position: 'absolute', left: 260, right: 260, top: 310, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 150}}>
        {lanes.map((lane, laneIndex) => (
          <div key={lane.label} style={{paddingTop: 18, borderTop: `4px solid ${lane.tone}`, opacity: enter(frame, 18 + laneIndex * 16)}}>
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
      <SceneHeading title="可观测性来自结构，不等于公开原文" detail="原始 transcript 留在本地；审计、统计与动画消费白名单派生数据" align="center" />
      <div style={{position: 'absolute', left: 180, right: 180, top: 330, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 80}}>
        {columns.map((column, columnIndex) => (
          <div key={column.label} style={{paddingTop: 20, borderTop: `4px solid ${column.tone}`, opacity: enter(frame, 22 + columnIndex * 18), translate: `0 ${(1 - enter(frame, 22 + columnIndex * 18)) * 18}px`}}>
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
    ['MODEL', '形成判断', COLOR.brand.blue],
    ['TOOLS', '观察与改变环境', COLOR.brand.orange],
    ['SESSION STATE', '记录因果与恢复点', COLOR.brand.green],
  ] as const;
  return (
    <AbsoluteFill style={{...scenePad, paddingTop: 145}}>
      <SceneHeading title="把 Claude Code 看成三层系统" detail="判断、执行和持久化共同构成一次工程任务" align="center" />
      <div style={{position: 'absolute', left: 220, right: 220, top: 430, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 70}}>
        {phases.map(([label, detail, tone], index) => {
          const itemIn = enter(frame, 24 + index * 14);
          return (
            <div key={label} style={{paddingTop: 22, borderTop: `4px solid ${tone}`, opacity: itemIn, translate: `0 ${(1 - itemIn) * 16}px`}}>
              <div style={{...TYPE.code, color: tone, fontWeight: WEIGHT.bold}}>{label}</div>
              <div style={{...TYPE.body, marginTop: 14}}>{detail}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 205, textAlign: 'center', opacity: enter(frame, 92)}}>
        <span style={{...TYPE.label, color: COLOR.text.tertiary}}>NEXT</span>
        <span style={{...TYPE.body, marginLeft: 18, fontWeight: WEIGHT.bold}}>先让 Claude 真正理解项目</span>
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
      <SyncedNarrationTrack
        manifest="claude-code-course/audio/ep03-agentic-loop/captions.json"
        auditPrefix="ep03-synced-caption"
      />
    </CourseLayout>
  );
};
