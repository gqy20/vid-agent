import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {seconds} from '../timeline';
import {
  CenterGraph,
  CodeBlock,
  CourseLayout,
  EpisodeTitleCard,
  GitGraph,
  MotionTitle,
  PositionedMotion,
  QuestionCaption,
  SceneCaption,
  SceneSequence,
  SvgArrowLine,
  TerminalPanel,
  type GitGraphState,
} from '../kit';
import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';

export const EP01_SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
  {id: 'bad-model', title: '错误模型', duration: seconds(22)},
  {id: 'version-control', title: '版本控制', duration: seconds(30)},
  {id: 'snapshot-model', title: '快照流', duration: seconds(32)},
  {id: 'local-history', title: '本地历史', duration: seconds(30)},
  {id: 'integrity', title: '完整性', duration: seconds(30)},
  {id: 'takeaway', title: '结论', duration: seconds(24)},
] as const;

export const EP01_DURATION_IN_FRAMES = EP01_SCENES.reduce((sum, scene) => sum + scene.duration, 0);

type Ep01SceneId = (typeof EP01_SCENES)[number]['id'];

const getEp01SceneStart = (id: Ep01SceneId) => {
  let cursor = 0;
  for (const scene of EP01_SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown EP01 scene: ${id}`);
};

const sceneTitleOpacity = (frame: number) => {
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.72), seconds(2.12)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return titleIn * titleOut;
};

const FileVersionCard: React.FC<{
  label: string;
  note: string;
  x: number;
  y: number;
  rotate: number;
  opacity: number;
  scale: number;
  tone?: 'main' | 'feature' | 'head';
}> = ({label, note, x, y, rotate, opacity, scale, tone = 'main'}) => {
  const accent = tone === 'feature' ? COLOR.git.feature : tone === 'head' ? COLOR.git.head : COLOR.git.main;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 344,
        height: 196,
        borderRadius: 12,
        background: COLOR.canvas.raised,
        border: `1px solid ${COLOR.stroke.default}`,
        boxShadow: `0 20px 42px ${COLOR.effects.shadowSoft}`,
        opacity,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: 'center',
        padding: '24px 26px',
        boxSizing: 'border-box',
      }}
      data-audit-id={`ep01-hook-card-${label}`}
    >
      <div
        style={{
          width: 40,
          height: 46,
          borderRadius: 8,
          border: `2px solid ${accent}`,
          position: 'relative',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -2,
            top: -2,
            width: 15,
            height: 15,
            borderLeft: `2px solid ${accent}`,
            borderBottom: `2px solid ${accent}`,
            background: COLOR.canvas.raised,
          }}
        />
      </div>
      <div style={{...TYPE.ui, color: COLOR.text.primary, fontSize: 31, fontWeight: 800, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, fontSize: 21, marginTop: 8}}>{note}</div>
    </div>
  );
};

export const Ep01HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, seconds(0.45)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.72), seconds(2.12)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleOpacity = titleIn * titleOut;
  const titleY = interpolate(frame, [0, seconds(0.55)], [18, -46], {extrapolateRight: 'clamp'});
  const gitAccent = interpolate(frame, [seconds(0.28), seconds(0.78)], [0.42, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const underline = interpolate(frame, [seconds(0.5), seconds(1.18)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(2.05), seconds(2.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const promptIn = interpolate(frame, [seconds(2.65), seconds(3.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardsIn = interpolate(frame, [seconds(3.4), seconds(4.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stackTighten = interpolate(frame, [seconds(7.1), seconds(9.25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(9.8), seconds(10.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionMarkIn = interpolate(frame, [seconds(9.45), seconds(10.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const cardBase = [
    {label: 'project', note: '今天', x: 470, y: 394, rotate: -6, tone: 'main' as const},
    {label: 'project-final', note: '昨天', x: 790, y: 440, rotate: 4, tone: 'feature' as const},
    {label: 'project-final-2', note: '上周', x: 1110, y: 394, rotate: -3, tone: 'head' as const},
  ];

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="1."
        keyword="Git"
        suffix="到底记录什么？"
        opacity={titleOpacity}
        translateY={titleY}
        keywordOpacity={gitAccent}
        keywordTranslateY={interpolate(gitAccent, [0.42, 1], [8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        underlineScale={underline}
        underlineOpacity={underline * titleOut * 0.78}
        auditId="ep01-hook-title"
      />

      <div
        data-audit-id="ep01-hook-prompt"
        style={{
          position: 'absolute',
          left: '50%',
          top: 230,
          transform: `translateX(-50%) translateY(${interpolate(promptIn, [0, 1], [18, 0])}px)`,
          opacity: promptIn,
          ...TYPE.title,
          fontSize: 48,
          color: COLOR.text.primary,
          fontWeight: 820,
          textAlign: 'center',
        }}
      >
        大多数人第一次理解成：
      </div>

      <PositionedMotion
        x={0}
        y={0}
        width={1920}
        opacity={graphIn}
        translateY={interpolate(graphIn, [0, 1], [28, 0])}
        auditId="ep01-hook-card-area"
      >
        {cardBase.map((card, idx) => {
          const drift = Math.sin((frame + idx * 19) / 26) * 3 * (1 - stackTighten);
          const appear = interpolate(cardsIn, [0, 0.33 + idx * 0.22, 0.66 + idx * 0.22], [0, 0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const stackOpacity = idx === 2 ? 1 : 0.16 + idx * 0.08;
          return (
            <FileVersionCard
              key={card.label}
              label={card.label}
              note={card.note}
              tone={card.tone}
              x={interpolate(stackTighten, [0, 1], [card.x, 770 + idx * 58])}
              y={interpolate(stackTighten, [0, 1], [card.y, 414 + idx * 34]) + drift}
              rotate={interpolate(stackTighten, [0, 1], [card.rotate, -4 + idx * 4])}
              opacity={appear * interpolate(stackTighten, [0, 1], [0.96, stackOpacity])}
              scale={interpolate(stackTighten, [0, 1], [1, 0.95 - idx * 0.02])}
            />
          );
        })}
      </PositionedMotion>

      <div
        data-audit-id="ep01-hook-question-mark"
        style={{
          position: 'absolute',
          right: 318,
          top: 462,
          ...TYPE.display,
          fontSize: 142,
          fontWeight: 860,
          color: COLOR.git.head,
          opacity: questionMarkIn * 0.62,
          transform: `scale(${interpolate(questionMarkIn, [0, 1], [0.72, 1])})`,
          textShadow: `0 20px 44px ${COLOR.effects.headHighlight}`,
        }}
      >
        ?
      </div>

      <QuestionCaption opacity={questionIn} translateY={interpolate(questionIn, [0, 1], [16, 0])} auditId="ep01-hook-question">
        Git 到底是在保存文件，还是在保存一段可以回看的历史？
      </QuestionCaption>
    </AbsoluteFill>
  );
};

const ep01GraphState = (count: 3): GitGraphState => ({
  commits: Array.from({length: count}, (_, idx) => ({id: `C${idx}`})),
  branches: [{name: 'main', target: `C${count - 1}`, lane: 'bottom', active: true}],
  head: {target: `C${count - 1}`, branch: 'main'},
});

const TinyFailMark: React.FC<{
  x: number;
  y: number;
  progress: number;
  label?: string;
  auditId?: string;
}> = ({x, y, progress, label, auditId}) => {
  const p = Math.max(0, Math.min(1, progress));
  const draw = interpolate(p, [0, 1], [0, 16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <g data-audit-id={auditId} opacity={p}>
      <circle cx={x} cy={y} r="20" fill={COLOR.canvas.raised} stroke={COLOR.git.conflict} strokeWidth="3" opacity="0.92" />
      <line x1={x - 8} y1={y - 8} x2={x - 8 + draw} y2={y - 8 + draw} stroke={COLOR.git.conflict} strokeWidth="4" strokeLinecap="round" />
      <line x1={x + 8} y1={y - 8} x2={x + 8 - draw} y2={y - 8 + draw} stroke={COLOR.git.conflict} strokeWidth="4" strokeLinecap="round" />
      {label ? (
        <text x={x + 34} y={y + 9} fontFamily={FONT.sans} fontSize="25" fontWeight="760" fill={COLOR.git.conflict}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

export const Ep01BadModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const stack = interpolate(frame, [seconds(6), seconds(12)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line = interpolate(frame, [seconds(12.2), seconds(16.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const failMark = interpolate(frame, [seconds(15), seconds(17.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(17.4), seconds(19.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cards = [
    {label: 'project', note: 'v1?', x: 448, y: 388, sx: 748, sy: 418, rotate: -4, tone: 'main' as const},
    {label: 'project-final', note: 'v2?', x: 788, y: 388, sx: 800, sy: 450, rotate: 3, tone: 'feature' as const},
    {label: 'project-final-final', note: 'v3?', x: 1128, y: 388, sx: 852, sy: 482, rotate: -2, tone: 'head' as const},
  ];

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} auditId="ep01-bad-model-title">
        复制文件夹，不等于版本控制
      </MotionTitle>
      {cards.map((card, idx) => {
        const appear = interpolate(frame, [seconds(1.8 + idx * 1.2), seconds(2.6 + idx * 1.2)], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <FileVersionCard
            key={card.label}
            label={card.label}
            note={card.note}
            tone={card.tone}
            x={interpolate(stack, [0, 1], [card.x, card.sx])}
            y={interpolate(stack, [0, 1], [card.y, card.sy])}
            rotate={interpolate(stack, [0, 1], [0, card.rotate])}
            opacity={appear * interpolate(stack, [0, 1], [1, idx === 2 ? 1 : 0.46])}
            scale={interpolate(stack, [0, 1], [1, 0.96 - idx * 0.03])}
          />
        );
      })}
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={632} y1={690} x2={1286} y2={690} progress={line} color={COLOR.stroke.strong} width={5} opacity={0.55} dash="18 20" />
        <g opacity={interpolate(line, [0.25, 0.68], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          <circle cx="958" cy="690" r="13" fill={COLOR.canvas.base} stroke={COLOR.stroke.strong} strokeWidth="4" />
          <path d="M956 650 L960 704" stroke={COLOR.git.conflict} strokeWidth="5" strokeLinecap="round" opacity="0.74" />
        </g>
        <TinyFailMark x={1324} y={690} progress={failMark} label="历史关系不清楚" auditId="ep01-bad-model-fail-mark" />
      </svg>
      <SceneCaption opacity={caption} bottom={126} width={980} auditId="ep01-bad-model-caption">
        保存结果，不等于保存历史。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01VersionControlScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const line = interpolate(frame, [seconds(2), seconds(5.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const focus = Math.min(2, Math.max(0, Math.floor((frame - seconds(8)) / seconds(8))));
  const caption = interpolate(frame, [seconds(7.2), seconds(8.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const concepts = ['回到过去', '比较变化', '追踪原因'];
  const summaries = ['可以回到任意版本。', '可以精确比较变化。', '可以追踪作者、时间和原因。'];
  const nodes = [
    {id: 'v1', x: 452, y: 500},
    {id: 'v2', x: 960, y: 500},
    {id: 'v3', x: 1468, y: 500},
  ];

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} y={92} size={58} auditId="ep01-version-title">
        版本控制保存的是可回看的历史
      </MotionTitle>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <line
          x1="452"
          y1="500"
          x2={452 + (1468 - 452) * line}
          y2="500"
          stroke={COLOR.git.graphLine}
          strokeWidth="13"
          strokeLinecap="round"
        />
        {nodes.map((node, idx) => {
          const appear = interpolate(frame, [seconds(2.2 + idx * 1.3), seconds(2.8 + idx * 1.3)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const active = frame >= seconds(8 + idx * 8) && frame < seconds(16 + idx * 8);
          const nodeR = active ? 82 : 58;
          const labelOpacity = active ? 1 : 0.3;
          return (
            <g key={node.id} opacity={appear} data-audit-id={`ep01-version-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeR}
                fill={COLOR.canvas.base}
                stroke={active ? COLOR.git.head : COLOR.git.commit}
                strokeWidth={active ? 9 : 6}
              />
              <text x={node.x} y={node.y + 10} textAnchor="middle" fontFamily={FONT.mono} fontSize="34" fontWeight="780" fill={COLOR.text.primary}>
                {node.id}
              </text>
              <text
                x={node.x}
                y={node.y + 126}
                textAnchor="middle"
                fontFamily={FONT.sans}
                fontSize={active ? '36' : '29'}
                fontWeight="760"
                fill={active ? COLOR.text.primary : COLOR.text.secondary}
                opacity={labelOpacity}
              >
                {concepts[idx]}
              </text>
            </g>
          );
        })}
        <g opacity={interpolate(frame, [seconds(15.2), seconds(16.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          <path d="M904 356 L1016 356" stroke={COLOR.git.feature} strokeWidth="9" strokeLinecap="round" />
          <path d="M904 408 L1092 408" stroke={COLOR.git.main} strokeWidth="9" strokeLinecap="round" />
        </g>
        <g opacity={interpolate(frame, [seconds(23.2), seconds(24.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          <text x="1282" y="362" fontFamily={FONT.sans} fontSize="29" fontWeight="760" fill={COLOR.text.secondary}>
            author · time · why
          </text>
        </g>
      </svg>
      <SceneCaption opacity={caption} bottom={126} width={980} auditId="ep01-version-caption">
        {summaries[focus]}
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01SnapshotModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const deltaOut = interpolate(frame, [seconds(4.8), seconds(6.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const deltaScale = interpolate(frame, [seconds(4.8), seconds(6.4)], [1, 0.74], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const snapshotIn = interpolate(frame, [seconds(5.8), seconds(7.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const streamScale = interpolate(frame, [seconds(6.2), seconds(9)], [0.88, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const reuse = interpolate(frame, [seconds(22.5), seconds(26.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const conclusion = interpolate(frame, [seconds(25.2), seconds(26.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nodes = [
    {id: 'C0', x: 508},
    {id: 'C1', x: 960},
    {id: 'C2', x: 1412},
  ];
  const files = ['app.ts', 'style.css', 'README', 'config'];

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} auditId="ep01-snapshot-title">
        Git 更像是在保存一串快照
      </MotionTitle>
      <div
        style={{
          position: 'absolute',
          left: interpolate(deltaOut, [0, 1], [286, 612], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          top: 316,
          width: 696,
          opacity: deltaOut,
          transform: `scale(${deltaScale})`,
          transformOrigin: 'center',
        }}
        data-audit-id="ep01-delta-list"
      >
        <CodeBlock title="如果只看成差异列表" lines={['+ add app.ts', '~ edit style.css', '+ add README']} highlight={[1]} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <g opacity={snapshotIn} transform={`translate(${960 - 960 * streamScale} ${500 - 500 * streamScale}) scale(${streamScale})`}>
          <text x="960" y="286" textAnchor="middle" fontFamily={FONT.sans} fontSize="38" fontWeight="820" fill={COLOR.text.secondary} opacity={interpolate(frame, [seconds(6.5), seconds(8.2), seconds(14), seconds(15.2)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
            commit 指向的是完整项目状态
          </text>
          <line
            x1="508"
            y1="430"
            x2={508 + (1412 - 508) * interpolate(frame, [seconds(9.5), seconds(18.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
            y2="430"
            stroke={COLOR.git.graphLine}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {nodes.map((node, idx) => {
            const appear = interpolate(frame, [seconds(7.4 + idx * 4.2), seconds(8.4 + idx * 4.2)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const pop = interpolate(frame, [seconds(7.4 + idx * 4.2), seconds(8.2 + idx * 4.2)], [0.72, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const expand = interpolate(frame, [seconds(8.8 + idx * 4.2), seconds(10.2 + idx * 4.2)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const active = frame >= seconds(7.4 + idx * 4.2) && frame < seconds(11.6 + idx * 4.2);
            return (
              <g key={node.id} opacity={appear} transform={`translate(${node.x} 430) scale(${pop}) translate(${-node.x} -430)`} data-audit-id={`ep01-snapshot-${node.id}`}>
                <circle cx={node.x} cy="430" r="74" fill={COLOR.canvas.base} stroke={active ? COLOR.git.head : COLOR.git.commit} strokeWidth={active ? 10 : 7} />
                <text x={node.x} y="441" textAnchor="middle" fontFamily={FONT.mono} fontSize="38" fontWeight="780" fill={COLOR.text.primary}>
                  {node.id}
                </text>
                <g opacity={expand} transform={`translate(${node.x - 148} 550)`}>
                  {files.map((file, fileIdx) => (
                    <g key={file} transform={`translate(${(fileIdx % 2) * 158} ${Math.floor(fileIdx / 2) * 76})`}>
                      <rect width="136" height="58" rx="8" fill={fileIdx === 1 && idx > 0 ? COLOR.effects.headHighlight : COLOR.canvas.raised} stroke={COLOR.stroke.soft} />
                      <text x="68" y="37" textAnchor="middle" fontFamily={FONT.sans} fontSize="20" fontWeight="720" fill={COLOR.text.secondary}>
                        {file}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            );
          })}
          <g opacity={reuse}>
            <path d="M674 674 C790 606 836 606 948 674" fill="none" stroke={COLOR.stroke.strong} strokeWidth="5" strokeDasharray="13 15" />
            <path d="M1126 674 C1242 606 1288 606 1400 674" fill="none" stroke={COLOR.stroke.strong} strokeWidth="5" strokeDasharray="13 15" />
            <text x="960" y="810" textAnchor="middle" fontFamily={FONT.sans} fontSize="40" fontWeight="820" fill={COLOR.git.main}>
              快照流
            </text>
          </g>
        </g>
      </svg>
      <SceneCaption opacity={conclusion} bottom={126} width={980} auditId="ep01-snapshot-caption">
        每次 commit 都指向一个项目状态。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01LocalHistoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shrink = interpolate(frame, [seconds(14), seconds(17)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(17), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outputLines = ['main $ git log --oneline', 'C2  snapshot checkout flow', 'C1  add landing copy', 'C0  initial commit'];
  const visible = Math.min(outputLines.length, Math.floor(interpolate(frame, [seconds(1), seconds(10)], [0, outputLines.length], {extrapolateRight: 'clamp'})));

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: interpolate(shrink, [0, 1], [190, 152]),
          top: interpolate(shrink, [0, 1], [172, 260]),
          width: interpolate(shrink, [0, 1], [1540, 612]),
          height: interpolate(shrink, [0, 1], [748, 404]),
          opacity: interpolate(shrink, [0, 1], [1, 0.84]),
        }}
        data-audit-id="ep01-local-terminal"
      >
        <TerminalPanel title="local-history">
          <div style={{padding: '30px 34px', ...TYPE.code, color: COLOR.terminal.output}}>
            {outputLines.slice(0, visible).map((line, idx) => (
              <div key={line} style={{marginBottom: 18, color: idx === 0 ? COLOR.text.inverse : COLOR.terminal.output}}>
                {line}
              </div>
            ))}
            <span style={{display: 'inline-block', width: 11, height: 28, background: COLOR.git.head, opacity: Math.floor(frame / 12) % 2 ? 0.18 : 1}} />
          </div>
        </TerminalPanel>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 968,
          top: 372,
          width: 780,
          opacity: graphIn,
          transform: `translateY(${interpolate(graphIn, [0, 1], [28, 0])}px) scale(${interpolate(graphIn, [0, 1], [0.92, 1])})`,
          transformOrigin: 'center',
        }}
        data-audit-id="ep01-local-graph"
      >
        <GitGraph state={ep01GraphState(3)} width={780} height={288} auditId="ep01-local-git-graph" />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine
          x1={792}
          y1={520}
          x2={1014}
          y2={520}
          progress={interpolate(frame, [seconds(20), seconds(23)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          color={COLOR.git.main}
          width={6}
          opacity={0.75}
          dash="none"
          auditId="ep01-local-link"
        />
      </svg>
      <SceneCaption opacity={interpolate(frame, [seconds(23), seconds(25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={126} width={980} auditId="ep01-local-caption">
        历史在本地，可以直接查询。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01IntegrityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const edit = interpolate(frame, [seconds(8), seconds(11)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hashSwap = interpolate(frame, [seconds(11), seconds(13)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitIn = interpolate(frame, [seconds(22), seconds(25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const oldHash = 'a81f3c2';
  const newHash = 'd42b8aa';

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} auditId="ep01-integrity-title">
        内容变化，名字也会变化
      </MotionTitle>
      <div style={{position: 'absolute', left: 292, top: 326, width: 620}} data-audit-id="ep01-integrity-code">
        <CodeBlock title="README.md" lines={['Git stores snapshots.', edit > 0.5 ? 'A commit points to content!' : 'A commit points to content.']} highlight={edit > 0.5 ? [1] : []} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine x1={940} y1={488} x2={1122} y2={488} progress={interpolate(frame, [seconds(4), seconds(6.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} color={COLOR.git.graphLine} width={7} opacity={0.72} dash="none" />
        <g transform="translate(1138 394)">
          <rect width="386" height="188" rx="16" fill={COLOR.canvas.raised} stroke={COLOR.stroke.soft} />
          <text x="34" y="62" fontFamily={FONT.sans} fontSize="28" fontWeight="760" fill={COLOR.text.secondary}>
            content hash
          </text>
          <text x="34" y="124" fontFamily={FONT.mono} fontSize="52" fontWeight="820" fill={COLOR.git.head} opacity={1 - hashSwap}>
            {oldHash}
          </text>
          <text x="34" y="124" fontFamily={FONT.mono} fontSize="52" fontWeight="820" fill={COLOR.git.conflict} opacity={hashSwap}>
            {newHash}
          </text>
        </g>
        <g opacity={commitIn} transform={`translate(0 ${interpolate(commitIn, [0, 1], [24, 0])})`}>
          <circle cx="960" cy="752" r="58" fill={COLOR.canvas.base} stroke={COLOR.git.commit} strokeWidth="7" />
          <text x="960" y="764" textAnchor="middle" fontFamily={FONT.mono} fontSize="33" fontWeight="780" fill={COLOR.text.primary}>
            C2
          </text>
          <rect x="1008" y="700" width="138" height="42" rx="21" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="3" />
          <text x="1077" y="728" textAnchor="middle" fontFamily={FONT.mono} fontSize="22" fontWeight="820" fill={COLOR.git.head}>
            {newHash}
          </text>
        </g>
      </svg>
      <SceneCaption opacity={interpolate(frame, [seconds(20), seconds(22)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={126} width={980} auditId="ep01-integrity-caption">
        Git 用内容生成标识，所以历史可以被校验。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const graphIn = interpolate(frame, [0, seconds(1.4)], [0, 1], {extrapolateRight: 'clamp'});
  const lines = ['不是文件名', '是项目快照', '能校验历史'];
  const conclusion = interpolate(frame, [seconds(14), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <div style={{opacity: graphIn, transform: `translateY(${interpolate(graphIn, [0, 1], [32, 0])}px)`}}>
        <CenterGraph state={ep01GraphState(3)} top={236} width={1240} />
      </div>
      <div style={{position: 'absolute', left: '50%', top: 638, transform: 'translateX(-50%)', display: 'flex', gap: 28}} data-audit-id="ep01-takeaway-lines">
        {lines.map((line, idx) => {
          const inP = interpolate(frame, [seconds(5 + idx * 3.2), seconds(6.1 + idx * 3.2)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={line}
              style={{
                minWidth: 236,
                padding: '22px 34px',
                borderRadius: 8,
                background: idx === 1 ? COLOR.effects.mainWash : COLOR.canvas.raised,
                border: `1px solid ${idx === 1 ? COLOR.git.main : COLOR.stroke.soft}`,
                textAlign: 'center',
                ...TYPE.title,
                fontSize: 35,
                color: idx === 1 ? COLOR.git.main : COLOR.text.primary,
                opacity: inP,
                transform: `translateY(${interpolate(inP, [0, 1], [18, 0])}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 800,
          transform: `translate(-50%, ${interpolate(conclusion, [0, 1], [24, 0])}px)`,
          opacity: conclusion,
          ...TYPE.title,
          fontSize: 50,
          color: COLOR.text.primary,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
        data-audit-id="ep01-takeaway-conclusion"
      >
        Git 保存的是一条可回看的项目历史。
      </div>
      <SceneCaption opacity={interpolate(frame, [seconds(19), seconds(20.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={126} width={980} auditId="ep01-takeaway-caption">
        这就是理解 add、commit 和 branch 的起点。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01WhatGitStoresHook: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Git 到底记录什么"
      scenes={EP01_SCENES}
      currentFrame={frame}
      showHeader={false}
      showEpisodeTitle={false}
    >
      <Ep01HookScene />
    </CourseLayout>
  );
};

const Ep01ScenePreview: React.FC<{
  sceneId: Ep01SceneId;
  children: React.ReactNode;
}> = ({sceneId, children}) => {
  const frame = useCurrentFrame();
  const sceneStart = getEp01SceneStart(sceneId);

  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Git 到底记录什么"
      scenes={EP01_SCENES}
      currentFrame={sceneStart + frame}
      showHeader={sceneId !== 'hook'}
      showEpisodeTitle={sceneId !== 'hook'}
    >
      {children}
    </CourseLayout>
  );
};

export const Ep01BadModelPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="bad-model">
    <Ep01BadModelScene />
  </Ep01ScenePreview>
);

export const Ep01VersionControlPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="version-control">
    <Ep01VersionControlScene />
  </Ep01ScenePreview>
);

export const Ep01SnapshotModelPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="snapshot-model">
    <Ep01SnapshotModelScene />
  </Ep01ScenePreview>
);

export const Ep01LocalHistoryPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="local-history">
    <Ep01LocalHistoryScene />
  </Ep01ScenePreview>
);

export const Ep01IntegrityPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="integrity">
    <Ep01IntegrityScene />
  </Ep01ScenePreview>
);

export const Ep01TakeawayPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="takeaway">
    <Ep01TakeawayScene />
  </Ep01ScenePreview>
);

export const Ep01WhatGitStores: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Git 到底记录什么"
      scenes={EP01_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= getEp01SceneStart('bad-model')}
      showEpisodeTitle={(current) => current >= getEp01SceneStart('bad-model')}
    >
      <SceneSequence from={getEp01SceneStart('hook')} durationInFrames={EP01_SCENES[0].duration}>
        <Ep01HookScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('bad-model')} durationInFrames={EP01_SCENES[1].duration}>
        <Ep01BadModelScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('version-control')} durationInFrames={EP01_SCENES[2].duration}>
        <Ep01VersionControlScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('snapshot-model')} durationInFrames={EP01_SCENES[3].duration}>
        <Ep01SnapshotModelScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('local-history')} durationInFrames={EP01_SCENES[4].duration}>
        <Ep01LocalHistoryScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('integrity')} durationInFrames={EP01_SCENES[5].duration}>
        <Ep01IntegrityScene />
      </SceneSequence>
      <SceneSequence from={getEp01SceneStart('takeaway')} durationInFrames={EP01_SCENES[6].duration}>
        <Ep01TakeawayScene />
      </SceneSequence>
    </CourseLayout>
  );
};
