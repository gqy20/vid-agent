import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {
  CodeBlock,
  CodeDiff,
  CourseLayout,
  EpisodeTitleCard,
  GitStatePanel,
  QuestionCaption,
  SceneSequence,
  SvgArrowLine,
  TerminalPanel,
} from '../kit';
import {COLOR, FONT} from '../palette';
import {seconds, WIDTH} from '../timeline';
import {TYPE} from '../typography';

export const EP02_SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
  {id: 'three-areas', title: '三层结构', duration: seconds(26)},
  {id: 'modify', title: '修改', duration: seconds(30)},
  {id: 'add', title: '暂存', duration: seconds(36)},
  {id: 'edit-after-add', title: '再次修改', duration: seconds(30)},
  {id: 'commit', title: '提交', duration: seconds(30)},
  {id: 'takeaway', title: '结论', duration: seconds(16)},
] as const;

export const EP02_DURATION_IN_FRAMES = EP02_SCENES.reduce((sum, scene) => sum + scene.duration, 0);

type Ep02SceneId = (typeof EP02_SCENES)[number]['id'];

const getEp02SceneStart = (id: Ep02SceneId) => {
  let cursor = 0;
  for (const scene of EP02_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP02 scene: ${id}`);
};

const getEp02SceneDuration = (id: Ep02SceneId) => {
  const scene = EP02_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP02 scene: ${id}`);
  return scene.duration;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const fileTone = {
  clean: COLOR.text.tertiary,
  modified: COLOR.git.workingTree,
  staged: COLOR.git.head,
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
      <div style={{...TYPE.label, fontFamily: FONT.mono, color: accent, marginTop: 9}}>{label}</div>
    </div>
  );
};

const SceneCaption: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  bottom?: number;
  width?: number;
  auditId?: string;
}> = ({children, opacity = 1, bottom = 112, width = 1040, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: '50%',
      bottom,
      width,
      transform: 'translateX(-50%)',
      textAlign: 'center',
      ...TYPE.subtitle,
      color: COLOR.text.primary,
      opacity,
    }}
  >
    {children}
  </div>
);

const Board: React.FC<{
  workingFiles: readonly string[];
  indexFiles: readonly string[];
  repositoryFiles: readonly string[];
  active?: 'working-tree' | 'index' | 'repository';
  opacity?: number;
  left?: number;
  top?: number;
  width?: number;
}> = ({workingFiles, indexFiles, repositoryFiles, active = 'working-tree', opacity = 1, left = 154, top = 250, width = 1612}) => (
  <div style={{position: 'absolute', left, top, width, opacity}} data-audit-id="ep02-state-board">
    <GitStatePanel
      areas={[
        {id: 'working-tree', title: 'Working Tree', files: workingFiles, active: active === 'working-tree'},
        {id: 'index', title: 'Index', files: indexFiles, active: active === 'index'},
        {id: 'repository', title: 'Repository', files: repositoryFiles, active: active === 'repository'},
      ]}
    />
  </div>
);

const MiniTerminal: React.FC<{
  command: string;
  output?: readonly string[];
  branch?: 'main' | 'feature';
  title?: string;
}> = ({command, output = [], branch = 'main', title = 'git-course-demo'}) => {
  const frame = useCurrentFrame();
  const chars = Math.floor(interpolate(frame, [0, seconds(1.1)], [0, command.length], {extrapolateRight: 'clamp'}));
  const showOutput = frame > seconds(1.45);
  return (
    <TerminalPanel title={title}>
      <div style={{padding: '30px 34px', ...TYPE.code, color: COLOR.text.inverse}}>
        <div style={{whiteSpace: 'pre'}}>
          <span style={{color: branch === 'main' ? COLOR.git.main : COLOR.git.feature, fontWeight: 780}}>{branch}</span>
          <span style={{color: COLOR.terminal.promptMuted}}> $ </span>
          <span>{command.slice(0, chars)}</span>
          <span
            style={{
              display: 'inline-block',
              width: 11,
              height: TYPE.code.fontSize,
              marginLeft: 5,
              transform: 'translateY(5px)',
              background: COLOR.git.head,
              opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0.15,
            }}
          />
        </div>
        {showOutput
          ? output.map((line) => (
              <div key={line} style={{...TYPE.codeOutput, color: COLOR.terminal.output, paddingLeft: 26, marginTop: 12}}>
                {line}
              </div>
            ))
          : null}
      </div>
    </TerminalPanel>
  );
};

const CommandStrip: React.FC<{
  command: string;
  output?: string;
  branch?: 'main' | 'feature';
  opacity?: number;
}> = ({command, output, branch = 'main', opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: 156,
      top: 116,
      width: 690,
      minHeight: 112,
      borderRadius: 8,
      border: `1px solid ${COLOR.terminal.border}`,
      background: COLOR.terminal.bg,
      boxShadow: `0 16px 42px ${COLOR.effects.shadowTerminal}`,
      opacity,
      padding: '18px 22px',
      boxSizing: 'border-box',
      fontFamily: FONT.mono,
      zIndex: 8,
    }}
  >
    <div style={{...TYPE.codeSmall, color: COLOR.text.inverse, whiteSpace: 'pre'}}>
      <span style={{color: branch === 'main' ? COLOR.git.main : COLOR.git.feature, fontWeight: 780}}>{branch}</span>
      <span style={{color: COLOR.terminal.promptMuted}}> $ </span>
      <span>{command}</span>
    </div>
    {output ? (
      <div style={{...TYPE.codeOutput, fontSize: 19, color: COLOR.terminal.comment, marginTop: 8, paddingLeft: 22}}>
        {output}
      </div>
    ) : null}
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

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.8), seconds(2.35)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fileIn = interpolate(frame, [seconds(2), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zones = interpolate(frame, [seconds(3.2), seconds(5.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(8.6), seconds(9.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="2."
        keyword="文件"
        suffix="不是直接进入 commit"
        opacity={titleIn * titleOut}
        translateY={interpolate(titleIn, [0, 1], [18, -44], {extrapolateRight: 'clamp'})}
        keywordOpacity={0.55 + titleIn * 0.45}
        keywordTranslateY={interpolate(titleIn, [0, 1], [8, 0], {extrapolateRight: 'clamp'})}
        underlineScale={interpolate(frame, [seconds(0.55), seconds(1.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineOpacity={titleOut * 0.82}
        auditId="ep02-hook-title"
      />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {[
          {x: 374, label: 'Working Tree'},
          {x: 834, label: 'Index'},
          {x: 1294, label: 'Repository'},
        ].map((zone) => (
          <g key={zone.label} opacity={zones * 0.72}>
            <rect x={zone.x} y="362" width="252" height="214" rx="8" fill={COLOR.canvas.overlay} stroke={COLOR.stroke.soft} />
            <text x={zone.x + 126} y="620" textAnchor="middle" fontFamily={FONT.mono} fontSize="23" fontWeight="760" fill={COLOR.text.tertiary}>
              {zone.label}
            </text>
          </g>
        ))}
        <SvgArrowLine x1={626} y1={470} x2={834} y2={470} progress={zones} color={COLOR.git.graphLine} width={5} opacity={0.6} dash="12 16" />
        <SvgArrowLine x1={1086} y1={470} x2={1294} y2={470} progress={zones} color={COLOR.git.graphLine} width={5} opacity={0.6} dash="12 16" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: interpolate(fileIn, [0, 1], [210, 504]),
          top: interpolate(fileIn, [0, 1], [370, 416]),
          opacity: fileIn,
        }}
      >
        <FileCard label="editing" tone="modified" auditId="ep02-hook-file" />
      </div>
      <QuestionCaption opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} auditId="ep02-hook-question">
        git add 到底做了什么？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

const ThreeAreasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const board = interpolate(frame, [0, seconds(0.65)], [0.35, 1], {extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(6.2), seconds(7.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const file = interpolate(frame, [seconds(14), seconds(16.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Board workingFiles={file > 0.35 ? ['app.js'] : []} indexFiles={[]} repositoryFiles={['C0']} opacity={board} />
      <div style={{position: 'absolute', left: 184, top: 592, width: 1550, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42, opacity: caption}}>
        {['正在编辑', '下一次提交', '已提交历史'].map((text, idx) => (
          <div key={text} style={{...TYPE.subtitle, color: idx === 0 ? COLOR.git.workingTree : idx === 1 ? COLOR.git.head : COLOR.git.main, textAlign: 'center'}}>
            {text}
          </div>
        ))}
      </div>
      <SceneCaption opacity={interpolate(file, [0.2, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-three-areas-caption">
        文件先出现在 Working Tree，Index 和 Repository 还没有这次变化。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const ModifyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const code = interpolate(frame, [0, seconds(0.7)], [0.35, 1], {extrapolateRight: 'clamp'});
  const modified = interpolate(frame, [seconds(7.4), seconds(10.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 170, top: 262, width: 610, opacity: code}} data-audit-id="ep02-modify-code">
        <CodeBlock title="app.js" lines={['function App() {', '  return <Header />;', '}', '', 'render(App);']} highlight={[1]} />
      </div>
      <Board
        workingFiles={['app.js:modified']}
        indexFiles={[]}
        repositoryFiles={['C0']}
        active="working-tree"
        opacity={interpolate(code, [0, 1], [0, 1])}
        left={860}
        top={258}
        width={890}
      />
      <div style={{position: 'absolute', left: interpolate(modified, [0, 1], [590, 475]), top: 654, opacity: modified}}>
        <FileCard label="modified" tone="modified" auditId="ep02-modify-file" />
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(13), seconds(15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-modify-caption">
        modified 说明文件变了，但还不是 staged。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const AddScene: React.FC = () => {
  const frame = useCurrentFrame();
  const terminalFull = interpolate(frame, [seconds(6.4), seconds(8.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalFullOpacity = interpolate(frame, [0, seconds(6.8), seconds(8.5)], [1, 1, 0], {extrapolateRight: 'clamp'});
  const commandStrip = interpolate(frame, [seconds(7.4), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(8.4), seconds(11.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const move = interpolate(frame, [seconds(11.2), seconds(15.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const callout = interpolate(frame, [seconds(22), seconds(24.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalLeft = interpolate(terminalFull, [0, 1], [156, 260]);
  const terminalTop = interpolate(terminalFull, [0, 1], [116, 210]);
  const terminalWidth = interpolate(terminalFull, [0, 1], [690, 1400]);
  const terminalHeight = interpolate(terminalFull, [0, 1], [112, 620]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: terminalLeft, top: terminalTop, width: terminalWidth, height: terminalHeight, zIndex: 9, opacity: terminalFullOpacity}}>
        <MiniTerminal command="git add app.js" output={['# app.js is staged for the next commit']} />
      </div>
      <CommandStrip command="git add app.js" output="# staged current content" opacity={commandStrip} />
      <div style={{opacity: boardIn}}>
        <Board workingFiles={['app.js:v1']} indexFiles={move > 0.72 ? ['app.js:v1'] : []} repositoryFiles={['C0']} active="index" top={300} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <path
          d="M470 610 C640 742 820 742 1016 568"
          fill="none"
          stroke={COLOR.git.head}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 15"
          opacity={boardIn * 0.38}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: interpolate(move, [0, 1], [426, 964]),
          top: interpolate(move, [0, 1], [650, 502]),
          opacity: boardIn,
          zIndex: 5,
        }}
      >
        <FileCard label={move > 0.72 ? 'staged v1' : 'copy current'} tone="staged" auditId="ep02-add-moving-file" />
      </div>
      <FlowHint x={852} y={686} label="current content -> Index" tone="staged" opacity={interpolate(move, [0.28, 0.72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      <div style={{position: 'absolute', right: 180, bottom: 154, width: 520, opacity: callout}}>
        <div
          style={{
            borderRadius: 8,
            border: `1px solid ${COLOR.stroke.soft}`,
            background: COLOR.canvas.overlay,
            padding: '24px 28px',
            boxShadow: `0 18px 50px ${COLOR.effects.shadowSoft}`,
          }}
        >
          <div style={{...TYPE.title, fontSize: 34}}>add = 选择这份内容</div>
          <div style={{...TYPE.ui, color: COLOR.text.secondary, marginTop: 10}}>不是“把文件加入项目”。</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EditAfterAddScene: React.FC = () => {
  const frame = useCurrentFrame();
  const diffIn = interpolate(frame, [0, seconds(0.55)], [0.42, 1], {extrapolateRight: 'clamp'});
  const split = interpolate(frame, [seconds(6.5), seconds(9.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const status = interpolate(frame, [seconds(17.5), seconds(20.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const compareTitle = interpolate(frame, [seconds(8.4), seconds(10.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
        <div style={{position: 'absolute', left: 0, right: 0, top: 92, height: 1, background: COLOR.stroke.soft}} />
        <div style={{position: 'absolute', left: '50%', top: 52, bottom: 44, width: 1, background: COLOR.stroke.soft}} />
        <div style={{position: 'absolute', left: 44, top: 34, ...TYPE.ui, color: COLOR.git.workingTree, fontWeight: 780}}>Working Tree</div>
        <div style={{position: 'absolute', right: 44, top: 34, ...TYPE.ui, color: COLOR.git.head, fontWeight: 780}}>Index</div>
        <div style={{position: 'absolute', left: 44, top: 76, ...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>latest edit</div>
        <div style={{position: 'absolute', right: 44, top: 76, ...TYPE.codeSmall, fontFamily: FONT.mono, color: COLOR.text.tertiary}}>add-time copy</div>
        <div style={{position: 'absolute', left: 92, top: 168}}>
          <FileCard label="working v2" tone="modified" auditId="ep02-edit-v2" />
        </div>
        <div style={{position: 'absolute', right: 92, top: 168}}>
          <FileCard label="staged v1" tone="staged" auditId="ep02-edit-v1" />
        </div>
      </div>
      <div style={{position: 'absolute', left: 862, top: 644, width: 360, height: 136, opacity: status}}>
        <TerminalPanel title="git status -s">
          <div style={{padding: '22px 28px', ...TYPE.code, color: COLOR.terminal.output}}>
            <span style={{color: COLOR.git.head}}>MM</span> app.js
          </div>
        </TerminalPanel>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 196,
          top: 662,
          width: 420,
          opacity: compareTitle,
          ...TYPE.ui,
          color: COLOR.text.secondary,
        }}
      >
        第一个 M：Index 里有 v1；第二个 M：Working Tree 又变成 v2。
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(12.2), seconds(14)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} auditId="ep02-edit-caption">
        Index 是 add 那一刻；继续修改后，需要重新 add。
      </SceneCaption>
    </AbsoluteFill>
  );
};

const CommitScene: React.FC = () => {
  const frame = useCurrentFrame();
  const commandOut = interpolate(frame, [seconds(6.2), seconds(8.2)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalFullOpacity = interpolate(frame, [0, seconds(6.5), seconds(8.6)], [1, 1, 0], {extrapolateRight: 'clamp'});
  const commandStrip = interpolate(frame, [seconds(7.5), seconds(9.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const boardIn = interpolate(frame, [seconds(7.5), seconds(10.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitForm = interpolate(frame, [seconds(11.5), seconds(17.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const repo = interpolate(frame, [seconds(16), seconds(21)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: interpolate(commandOut, [0, 1], [156, 260]),
          top: interpolate(commandOut, [0, 1], [116, 210]),
          width: interpolate(commandOut, [0, 1], [690, 1400]),
          height: interpolate(commandOut, [0, 1], [112, 620]),
          zIndex: 9,
          opacity: terminalFullOpacity,
        }}
      >
        <MiniTerminal command={'git commit -m "update app"'} output={['[main C1] update app', '1 file changed']} />
      </div>
      <CommandStrip command={'git commit -m "update app"'} output="commit reads Index" opacity={commandStrip} />
      <div style={{opacity: boardIn}}>
        <Board workingFiles={['app.js:v2']} indexFiles={commitForm < 0.72 ? ['app.js:v1'] : []} repositoryFiles={repo > 0.62 ? ['C0', 'C1:v1'] : ['C0']} active={repo > 0.62 ? 'repository' : 'index'} top={300} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={958} y1={522} x2={1426} y2={522} progress={commitForm} color={COLOR.git.head} width={6} opacity={0.72} dash="none" />
        <text x="1030" y="486" fontFamily={FONT.mono} fontSize="21" fontWeight="760" fill={COLOR.git.head} opacity={commitForm * 0.9}>
          snapshot from Index
        </text>
        <g opacity={repo}>
          <circle cx="1490" cy="522" r="44" fill={COLOR.canvas.base} stroke={COLOR.git.main} strokeWidth="6" />
          <text x="1490" y="533" textAnchor="middle" fontFamily={FONT.mono} fontSize="29" fontWeight="780" fill={COLOR.text.primary}>
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

const TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flow = interpolate(frame, [0, seconds(0.85)], [0.35, 1], {extrapolateRight: 'clamp'});
  const question = interpolate(frame, [seconds(8.2), seconds(10.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nodes = [
    {x: 316, title: 'Working Tree', note: '修改', tone: COLOR.git.workingTree},
    {x: 816, title: 'Index', note: '暂存', tone: COLOR.git.head},
    {x: 1316, title: 'Repository', note: '提交', tone: COLOR.git.main},
  ];
  return (
    <AbsoluteFill style={{padding: '168px 170px 130px', boxSizing: 'border-box'}}>
      <div style={{...TYPE.hero, fontWeight: 850}}>这一集只记住一条线</div>
      <svg width={WIDTH} height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={568} y1={522} x2={812} y2={522} progress={clamp(flow * 1.4)} color={COLOR.git.graphLine} width={7} opacity={0.72} dash="none" />
        <SvgArrowLine x1={1068} y1={522} x2={1312} y2={522} progress={clamp(flow * 1.4 - 0.35)} color={COLOR.git.graphLine} width={7} opacity={0.72} dash="none" />
      </svg>
      <div style={{position: 'absolute', left: 0, top: 432, width: '100%', display: 'flex', justifyContent: 'center', gap: 196, opacity: flow}}>
        {nodes.map((node) => (
          <div
            key={node.title}
            style={{
              width: 300,
              borderRadius: 8,
              background: COLOR.canvas.overlay,
              border: `1px solid ${COLOR.stroke.soft}`,
              boxShadow: `0 18px 50px ${COLOR.effects.shadowSoft}`,
              padding: '30px 28px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{...TYPE.ui, fontFamily: FONT.mono, color: node.tone, fontWeight: 780}}>{node.title}</div>
            <div style={{...TYPE.title, fontSize: 36, color: COLOR.text.primary, marginTop: 14}}>{node.note}</div>
          </div>
        ))}
      </div>
      <QuestionCaption bottom={132} width={1000} opacity={question} translateY={interpolate(question, [0, 1], [18, 0])} auditId="ep02-takeaway-question">
        下一步：commit 里面到底有什么？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

export const Ep02WorkingTreeIndexRepo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="工作区、暂存区、仓库"
      scenes={EP02_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp02SceneStart('three-areas')}
      showEpisodeTitle={(current) => current >= getEp02SceneStart('three-areas')}
    >
      <SceneSequence from={getEp02SceneStart('hook')} durationInFrames={getEp02SceneDuration('hook')}>
        <HookScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('three-areas')} durationInFrames={getEp02SceneDuration('three-areas')}>
        <ThreeAreasScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('modify')} durationInFrames={getEp02SceneDuration('modify')}>
        <ModifyScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('add')} durationInFrames={getEp02SceneDuration('add')}>
        <AddScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('edit-after-add')} durationInFrames={getEp02SceneDuration('edit-after-add')}>
        <EditAfterAddScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('commit')} durationInFrames={getEp02SceneDuration('commit')}>
        <CommitScene />
      </SceneSequence>
      <SceneSequence from={getEp02SceneStart('takeaway')} durationInFrames={getEp02SceneDuration('takeaway')}>
        <TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
