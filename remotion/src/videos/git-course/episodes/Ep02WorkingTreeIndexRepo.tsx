import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  CodeBlock,
  CodeDiff,
  CourseLayout,
  createEpisodeRuntime,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitStatePanel,
  QuestionCaption,
  RecordedTerminalPanel,
  SceneCaption,
  CommandStrip,
  SvgArrowLine,
} from '../kit';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {seconds, WIDTH} from '../timeline';
import {TYPE} from '../typography';
export {EP02_DURATION_IN_FRAMES, EP02_SCENES} from '../data/episodeTimelines.generated';
import {EP02_DURATION_IN_FRAMES, EP02_SCENES} from '../data/episodeTimelines.generated';

const EP02_RUNTIME = createEpisodeRuntime(EP02_SCENES);

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const TERMINAL_HEADER_HEIGHT = 42;
const recordedTerminalHeight = (width: number, recording: {width: number; height: number}) =>
  TERMINAL_HEADER_HEIGHT + (width * recording.height) / recording.width;

const fileTone = {
  clean: COLOR.text.tertiary,
  modified: COLOR.git.workingTree,
  staged: COLOR.git.index,
  committed: COLOR.git.main,
  pending: COLOR.git.feature,
} as const;

type FileTone = keyof typeof fileTone;

const FileCard: React.FC<{
  name?: string;
  label: string;
  tone: FileTone;
  opacity?: number;
  scale?: number;
  auditId?: string;
}> = ({name = 'app.js', label, tone, opacity = 1, scale = 1, auditId}) => {
  const accent = fileTone[tone];
  const labelHasCjk = /[\u3400-\u9fff]/.test(label);
  return (
    <div
      data-audit-id={auditId}
      style={{
        width: 252,
        height: 104,
        borderRadius: 8,
        border: `1px solid ${accent}`,
        background: 'rgba(255,255,255,0.72)',
        boxShadow: `0 18px 48px ${COLOR.effects.shadowSoft}`,
        padding: '18px 20px',
        boxSizing: 'border-box',
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 11}}>
        <span style={{width: 9, height: 9, borderRadius: 99, background: accent}} />
        <span style={{...TYPE.code, fontFamily: FONT.mono, fontSize: 28, color: COLOR.text.primary}}>{name}</span>
      </div>
      <div style={{...TYPE.label, fontFamily: labelHasCjk ? FONT.sans : FONT.mono, color: accent, marginTop: 9}}>{label}</div>
    </div>
  );
};

const Board: React.FC<{
	  workingFiles: readonly string[];
	  indexFiles: readonly string[];
	  repositoryFiles: readonly string[];
	  active?: 'working-tree' | 'index' | 'repository' | 'none';
	  opacity?: number;
	  left?: number;
	  top?: number;
	  width?: number;
	}> = ({workingFiles, indexFiles, repositoryFiles, active = 'none', opacity = 1, left = 154, top = 250, width = 1612}) => (
	  <div style={{position: 'absolute', left, top, width, opacity}} data-audit-id="ep02-state-board">
	    <GitStatePanel
	      prominent
	      areas={[
	        {id: 'working-tree', title: 'Working Tree', files: workingFiles, active: active === 'working-tree'},
        {id: 'index', title: 'Index', files: indexFiles, active: active === 'index'},
        {id: 'repository', title: 'Repository', files: repositoryFiles, active: active === 'repository'},
      ]}
    />
  </div>
);

const FlowHint: React.FC<{
  x: number;
  y: number;
  label: string;
  tone: FileTone;
  opacity?: number;
}> = ({x, y, label, tone, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      opacity,
      ...TYPE.label,
      fontFamily: FONT.mono,
      color: fileTone[tone],
      zIndex: 4,
    }}
  >
    <span style={{width: 34, height: 2, borderRadius: 99, background: fileTone[tone], opacity: 0.72}} />
    {label}
  </div>
);

// @git-course-scene hook:start
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOut = interpolate(frame, [seconds(2.15), seconds(2.85)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stage = interpolate(frame, [seconds(2.35), seconds(3.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const attempt = interpolate(frame, [seconds(3.55), seconds(5.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const block = interpolate(frame, [seconds(5.0), seconds(5.85)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(6.55), seconds(7.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const diagramHold = interpolate(frame, [seconds(8.2), seconds(10.2)], [1, 0.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blockHold = interpolate(frame, [seconds(6.05), seconds(7.0)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const intent = interpolate(attempt, [0.08, 0.82], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blocked = interpolate(block, [0.2, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="2."
        prefix="文件不是直接进入"
        keyword="commit"
        suffix=""
        opacity={titleOut}
        translateY={interpolate(frame, [0, seconds(0.8)], [0, -28], {extrapolateRight: 'clamp'})}
        keywordOpacity={1}
        keywordTranslateY={0}
        underlineScale={interpolate(frame, [seconds(0.2), seconds(0.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut * 0.82}
        auditId="ep02-hook-title"
      />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <g opacity={stage * diagramHold}>
          <rect x="282" y="340" width="390" height="286" rx="10" fill="rgba(255,255,255,0.58)" stroke={COLOR.stroke.soft} />
          <text x="318" y="398" fontFamily={FONT.sans} fontSize="24" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            编辑器
          </text>
          <rect x="1258" y="354" width="366" height="258" rx="10" fill="rgba(255,255,255,0.68)" stroke={COLOR.git.main} strokeWidth="2" />
          <text x="1441" y="456" textAnchor="middle" fontFamily={FONT.mono} fontSize="48" fontWeight={WEIGHT.bold} fill={COLOR.git.main}>
            commit
          </text>
          <text x="1441" y="508" textAnchor="middle" fontFamily={FONT.sans} fontSize="22" fontWeight={WEIGHT.bold} fill={COLOR.text.tertiary}>
            历史记录
          </text>
        </g>
        <g opacity={stage * diagramHold}>
          <SvgArrowLine
            x1={650}
            y1={483}
            x2={928}
            y2={483}
            progress={clamp(intent)}
            color={COLOR.git.graphLine}
            width={7}
            opacity={0.62}
            dash="none"
          />
          <line
            x1="1026"
            y1="483"
            x2="1236"
            y2="483"
            stroke={COLOR.git.graphLine}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="12 17"
            opacity="0.16"
          />
          <path
            d="M1218 463 L1238 483 L1218 503"
            fill="none"
            stroke={COLOR.git.graphLine}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.16"
          />
        </g>
        <g opacity={block * blockHold}>
          <rect x="956" y="389" width="52" height="188" rx="26" fill="rgba(194, 79, 68, 0.08)" stroke={COLOR.git.conflict} strokeWidth="2" opacity={blocked} />
          <line x1="982" y1="371" x2="982" y2="595" stroke={COLOR.git.conflict} strokeWidth="10" strokeLinecap="round" opacity={0.86 * blocked} />
          <line x1="952" y1="407" x2="1012" y2="407" stroke={COLOR.git.conflict} strokeWidth="6" strokeLinecap="round" opacity={0.32 * blocked} />
          <line x1="952" y1="559" x2="1012" y2="559" stroke={COLOR.git.conflict} strokeWidth="6" strokeLinecap="round" opacity={0.32 * blocked} />
          <text x="982" y="655" textAnchor="middle" fontFamily={FONT.sans} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
            不能直接进
          </text>
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 374,
          top: 431,
          opacity: stage * diagramHold,
          transform: `scale(${interpolate(stage, [0, 1], [0.92, 1.1])})`,
          transformOrigin: 'center',
        }}
      >
        <FileCard label="正在编辑" tone="modified" auditId="ep02-hook-file" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 282,
          top: 551,
          width: 390,
          textAlign: 'center',
          opacity: stage * diagramHold,
          ...TYPE.uiSmall,
          fontFamily: FONT.mono,
          fontWeight: WEIGHT.bold,
          color: COLOR.git.workingTree,
          zIndex: 2,
        }}
        data-audit-id="ep02-hook-working-tree-label"
      >
        Working Tree
      </div>
      <QuestionCaption opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} fontSize={42} auditId="ep02-hook-question">
        git add 到底做了什么？
      </QuestionCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene hook:end

// @git-course-scene three-areas:start
const ThreeAreasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const board = interpolate(frame, [0, seconds(0.65)], [0.35, 1], {extrapolateRight: 'clamp'});
  const workingNote = interpolate(frame, [seconds(8.7), seconds(10)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const indexNote = interpolate(frame, [seconds(10.8), seconds(12.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const repoNote = interpolate(frame, [seconds(15.2), seconds(16.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const file = interpolate(frame, [seconds(18.2), seconds(20.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const notes = [
    {text: '正在编辑的真实文件', color: COLOR.git.workingTree, opacity: workingNote},
    {text: '下一次提交的候选', color: COLOR.git.head, opacity: indexNote},
    {text: '已经写入的历史', color: COLOR.git.main, opacity: repoNote},
  ];
  return (
    <AbsoluteFill>
      <Board
        workingFiles={file > 0.35 ? ['app.js:modified'] : []}
        indexFiles={[]}
        repositoryFiles={['C0']}
        active={file > 0.35 ? 'working-tree' : 'none'}
        opacity={board}
      />
      <div style={{position: 'absolute', left: 184, top: 592, width: 1550, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42}}>
        {notes.map((note) => (
          <div key={note.text} style={{textAlign: 'center', opacity: note.opacity}}>
            <div style={{...TYPE.subtitle, color: note.color}}>{note.text}</div>
            <div style={{width: 68, height: 3, borderRadius: 99, background: note.color, opacity: 0.56, margin: '16px auto 0'}} />
          </div>
        ))}
      </div>
      <SceneCaption opacity={interpolate(file, [0.2, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-three-areas-caption">
        文件先出现在 Working Tree，Index 和 Repository 还没有这次变化。
      </SceneCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene three-areas:end

// @git-course-scene modify:start
const ModifyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const editor = interpolate(frame, [seconds(2.2), seconds(3.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const edit = interpolate(frame, [seconds(2.8), seconds(4.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const state = interpolate(frame, [seconds(4.9), seconds(6.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const proof = interpolate(frame, [seconds(7), seconds(8.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const proofOut = interpolate(frame, [seconds(23.5), seconds(25.5)], [1, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const editorOut = interpolate(frame, [seconds(24.5), seconds(26.5)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const changed = edit > 0.5;
  return (
    <AbsoluteFill>
      <Board
        workingFiles={state > 0.25 ? ['app.js:modified'] : ['app.js']}
        indexFiles={[]}
        repositoryFiles={['C0']}
        active="working-tree"
        opacity={1}
        top={250}
      />
      <div
        style={{
          position: 'absolute',
          left: 176,
          top: 630,
          width: 676,
          opacity: editor * editorOut,
          transform: `translateY(${interpolate(editor, [0, 1], [18, 0])}px) scale(${interpolate(editor, [0, 1], [0.96, 1])})`,
          transformOrigin: 'top left',
          zIndex: 4,
        }}
        data-audit-id="ep02-modify-code"
      >
        <CodeBlock
          title="Working Tree / app.js"
          lines={changed ? ['function App() {', '  return <Header title="Git" />;', '}'] : ['function App() {', '  return <Header />;', '}']}
          highlight={changed ? [1] : []}
          highlightBackground="rgba(96, 118, 106, 0.12)"
          highlightBorderColor={COLOR.git.workingTree}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 176,
          top: 900,
          width: 676,
          opacity: edit * editorOut,
        }}
      >
        <div style={{...TYPE.subtitle, color: COLOR.git.workingTree, fontWeight: WEIGHT.bold}}>修改只发生在 Working Tree</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 920,
          top: 650,
          width: 740,
          height: 2,
          background: COLOR.stroke.soft,
          opacity: 0.2 * proof * proofOut,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 970,
          top: 690,
          width: 650,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 42,
          opacity: proof * proofOut,
        }}
      >
        <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, textAlign: 'center', fontWeight: WEIGHT.bold, opacity: 0.76}}>Index 没变</div>
        <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, textAlign: 'center', fontWeight: WEIGHT.bold, opacity: 0.76}}>Repository 没变</div>
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(22), seconds(23.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-modify-caption">
        modified 说明文件变了，但还不是 staged。
      </SceneCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene modify:end

// @git-course-scene add:start
const AddScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalFullOpacity = interpolate(frame, [0, seconds(6.7), seconds(7.35)], [1, 1, 0], {extrapolateRight: 'clamp'});
  const commandStrip = interpolate(frame, [seconds(7.2), seconds(7.65)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commandStripOut = interpolate(frame, [seconds(17), seconds(17.7)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(7.75), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const move = interpolate(frame, [seconds(8), seconds(12.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const movingOut = interpolate(move, [0.72, 0.92], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const guideOut = interpolate(frame, [seconds(12.8), seconds(14.6)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const callout = interpolate(frame, [seconds(20), seconds(22)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const calloutOut = interpolate(frame, [seconds(32), seconds(34.5)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalWidth = 1240;
  const terminalHeight = recordedTerminalHeight(terminalWidth, TERMINAL_RECORDINGS['ep02-add']);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 340, top: 166, width: terminalWidth, height: terminalHeight, zIndex: 9, opacity: terminalFullOpacity}}>
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep02-add.mp4"
          holdFrameSrc="git-course-lab/terminal/ep02-add-hold.png"
          holdFromFrame={TERMINAL_RECORDINGS['ep02-add'].holdFromFrame}
        />
      </div>
      <CommandStrip command="git add app.js" output="暂存当前内容" opacity={commandStrip * commandStripOut} />
      <div style={{opacity: boardIn}}>
        <Board
          workingFiles={['app.js:v1']}
          indexFiles={move > 0.72 ? ['app.js:v1'] : []}
          repositoryFiles={['C0']}
          active={move > 0.45 ? 'index' : 'working-tree'}
          top={286}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 620,
          top: 396,
          width: 88,
          borderTop: `4px dashed ${COLOR.git.index}`,
          opacity: boardIn * 0.5 * guideOut,
          transform: `scaleX(${boardIn})`,
          transformOrigin: 'left center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -1,
            top: -9,
            width: 13,
            height: 13,
            borderTop: `4px solid ${COLOR.git.index}`,
            borderRight: `4px solid ${COLOR.git.index}`,
            transform: 'rotate(45deg)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: interpolate(move, [0, 1], [426, 964]),
          top: interpolate(move, [0, 1], [650, 502]),
          opacity: boardIn * movingOut,
          zIndex: 5,
        }}
      >
        <FileCard
          label={move > 0.72 ? 'staged v1' : 'current v1'}
          tone={move > 0.58 ? 'staged' : 'modified'}
          auditId="ep02-add-moving-file"
        />
      </div>
      <FlowHint
        x={852}
        y={686}
        label="current content -> Index"
        tone="staged"
        opacity={
          interpolate(move, [0.28, 0.72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
          movingOut *
          guideOut
        }
      />
      <div style={{position: 'absolute', right: 180, bottom: 154, width: 520, opacity: callout * calloutOut}}>
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${COLOR.stroke.soft}`,
            background: COLOR.canvas.overlay,
            padding: '24px 28px',
            boxShadow: `0 18px 50px ${COLOR.effects.shadowSoft}`,
          }}
        >
          <div style={{...TYPE.title, fontSize: 32, whiteSpace: 'nowrap'}}>add = 选择文件此刻的内容</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
// @git-course-scene add:end

// @git-course-scene edit-after-add:start
const EditAfterAddScene: React.FC = () => {
  const frame = useCurrentFrame();
  const diffIn = interpolate(frame, [0, seconds(0.45)], [0.72, 1], {extrapolateRight: 'clamp'});
  const split = interpolate(frame, [seconds(1.35), seconds(2.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const statusIn = interpolate(frame, [seconds(12.6), seconds(13.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const statusOut = interpolate(frame, [seconds(22.8), seconds(24)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const compareIn = interpolate(frame, [seconds(14.8), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const compareOut = interpolate(frame, [seconds(21.8), seconds(23)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const compareTitle = compareIn * compareOut;
  const statusTerminalWidth = 760;
  const statusTerminalHeight = recordedTerminalHeight(statusTerminalWidth, TERMINAL_RECORDINGS['ep02-status-mm']);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 150, top: 272, width: 520, opacity: diffIn}}>
        <CodeDiff
          title="app.js"
          lines={[
            {type: 'context', text: 'function App() {'},
            {type: 'add', text: '  trackClick();'},
            {type: 'context', text: '  return <Header />;'},
            {type: 'context', text: '}'},
          ]}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 248,
          width: 980,
          height: 360,
          borderRadius: 8,
          border: `1px solid ${COLOR.stroke.soft}`,
          background: 'rgba(255,255,255,0.5)',
          boxShadow: `0 18px 52px ${COLOR.effects.shadowSoft}`,
          opacity: split,
        }}
      >
        <div style={{position: 'absolute', left: '50%', top: 52, bottom: 44, width: 1, background: COLOR.stroke.soft}} />
        <div style={{position: 'absolute', left: 44, top: 30, ...TYPE.ui, fontSize: 30, lineHeight: 1.2, color: COLOR.git.workingTree, fontWeight: WEIGHT.bold}}>Working Tree</div>
        <div style={{position: 'absolute', right: 44, top: 30, ...TYPE.ui, fontSize: 30, lineHeight: 1.2, color: COLOR.git.head, fontWeight: WEIGHT.bold}}>Index</div>
        <div style={{position: 'absolute', left: 44, top: 76, ...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>latest edit</div>
        <div style={{position: 'absolute', right: 44, top: 76, ...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>add-time copy</div>
        <div style={{position: 'absolute', left: 92, top: 168}}>
          <FileCard label="working v2" tone="modified" auditId="ep02-edit-v2" />
        </div>
        <div style={{position: 'absolute', right: 92, top: 168}}>
          <FileCard label="staged v1" tone="staged" auditId="ep02-edit-v1" />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 420,
          top: 622,
          width: statusTerminalWidth,
          height: 196,
          overflow: 'hidden',
          borderRadius: 12,
          opacity: statusIn * statusOut,
          filter: 'brightness(1.16) contrast(1.03)',
        }}
      >
        <div style={{width: statusTerminalWidth, height: statusTerminalHeight}}>
          <RecordedTerminalPanel
            src="git-course-lab/terminal/ep02-status-mm.mp4"
            holdFrameSrc="git-course-lab/terminal/ep02-status-mm-hold.png"
            holdFromFrame={TERMINAL_RECORDINGS['ep02-status-mm'].holdFromFrame}
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 110,
          top: 662,
          width: 620,
          opacity: compareTitle,
          ...TYPE.ui,
          fontSize: 26,
          whiteSpace: 'nowrap',
          color: COLOR.text.secondary,
        }}
      >
        第一个 M：Index v1；第二个 M：Working Tree v2。
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(24.8), seconds(26)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-edit-caption">
        Index 是 add 那一刻；继续修改后，需要重新 add。
      </SceneCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene edit-after-add:end

// @git-course-scene commit:start
const CommitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalFullOpacity = interpolate(frame, [0, seconds(6.7), seconds(7.35)], [1, 1, 0], {extrapolateRight: 'clamp'});
  const commandStrip = interpolate(frame, [seconds(7.2), seconds(7.65)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commandStripOut = interpolate(frame, [seconds(16.5), seconds(19.5)], [1, 0.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(7.75), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitForm = interpolate(frame, [seconds(8.6), seconds(14.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const repo = interpolate(frame, [seconds(13), seconds(18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalWidth = 1240;
  const terminalHeight = recordedTerminalHeight(terminalWidth, TERMINAL_RECORDINGS['ep02-commit']);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: 166,
          width: terminalWidth,
          height: terminalHeight,
          zIndex: 9,
          opacity: terminalFullOpacity,
        }}
      >
        <RecordedTerminalPanel
          src="git-course-lab/terminal/ep02-commit.mp4"
          holdFrameSrc="git-course-lab/terminal/ep02-commit-hold.png"
          holdFromFrame={TERMINAL_RECORDINGS['ep02-commit'].holdFromFrame}
        />
      </div>
      <CommandStrip command={'git commit -m "update app"'} output="commit 读取 Index" opacity={commandStrip * commandStripOut} />
      <div style={{opacity: boardIn}}>
        <Board
          workingFiles={['app.js:v2']}
          indexFiles={frame < seconds(15.7) ? ['app.js:v1'] : []}
          repositoryFiles={frame >= seconds(13.2) ? ['C0', 'C1:v1'] : ['C0']}
          active={frame >= seconds(13.2) ? 'repository' : 'index'}
          top={286}
        />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={958} y1={700} x2={1426} y2={700} progress={commitForm} color={COLOR.git.head} width={6} opacity={0.72} dash="none" />
        <text x="1192" y="664" textAnchor="middle" fontFamily={FONT.mono} fontSize="26" fontWeight={WEIGHT.bold} fill={COLOR.git.head} opacity={commitForm * 0.9}>
          snapshot from Index
        </text>
        <g opacity={repo}>
          <circle cx="1490" cy="700" r="44" fill={COLOR.canvas.base} stroke={COLOR.git.main} strokeWidth="6" />
          <text x="1490" y="711" textAnchor="middle" fontFamily={FONT.mono} fontSize="29" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
            C1
          </text>
        </g>
      </svg>
      <SceneCaption opacity={interpolate(frame, [seconds(21.4), seconds(23.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-commit-caption">
        commit 读取 Index，Repository 得到新快照；Working Tree 的 v2 还没有提交。
      </SceneCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene commit:end

// @git-course-scene takeaway:start
const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = interpolate(frame, [0, seconds(0.85)], [0.35, 1], {extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(11.8), seconds(12.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nodes = [
    {x: 316, title: 'Working Tree', note: '修改', tone: COLOR.git.workingTree},
    {x: 816, title: 'Index', note: '暂存', tone: COLOR.git.head},
    {x: 1316, title: 'Repository', note: '提交', tone: COLOR.git.main},
  ];
  return (
    <AbsoluteFill style={{padding: '168px 170px 130px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: WEIGHT.bold}}>这一集只记住一条线</div>
      <svg width={WIDTH} height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={642} y1={568} x2={774} y2={568} progress={clamp(flow * 1.4)} color={COLOR.git.graphLine} width={7} opacity={0.72} dash="none" />
        <SvgArrowLine x1={1138} y1={568} x2={1270} y2={568} progress={clamp(flow * 1.4 - 0.35)} color={COLOR.git.graphLine} width={7} opacity={0.72} dash="none" />
      </svg>
      <div style={{position: 'absolute', left: 0, top: 470, width: '100%', display: 'flex', justifyContent: 'center', gap: 156, opacity: flow}}>
        {nodes.map((node) => (
          <div
            key={node.title}
            style={{
              width: 340,
              borderRadius: 8,
              background: COLOR.canvas.overlay,
              border: `1px solid ${COLOR.stroke.soft}`,
              boxShadow: `0 18px 50px ${COLOR.effects.shadowSoft}`,
              padding: '30px 28px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <div style={{...TYPE.ui, fontFamily: FONT.mono, fontSize: 38, lineHeight: 1.08, color: node.tone, fontWeight: WEIGHT.bold}}>{node.title}</div>
            <div style={{...TYPE.title, fontSize: 32, color: COLOR.text.primary, marginTop: 14}}>{node.note}</div>
          </div>
        ))}
      </div>
      <QuestionCaption bottom={132} width={1000} opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} auditId="ep02-takeaway-question">
        下一步：commit 里面到底有什么？
      </QuestionCaption>
    </AbsoluteFill>
  );
};
// @git-course-scene takeaway:end

const EP02_SCENE_COMPONENTS = {
  hook: HookScene,
  'three-areas': ThreeAreasScene,
  modify: ModifyScene,
  add: AddScene,
  'edit-after-add': EditAfterAddScene,
  commit: CommitScene,
  takeaway: TakeawayScene,
};

export const Ep02WorkingTreeIndexRepo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="工作区、暂存区、仓库"
      scenes={EP02_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP02_RUNTIME.start('three-areas')}
      showEpisodeTitle={(current) => current >= EP02_RUNTIME.start('three-areas')}
    >
      <EpisodeTimeline runtime={EP02_RUNTIME} components={EP02_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
