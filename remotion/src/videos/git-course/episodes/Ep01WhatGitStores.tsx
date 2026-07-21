import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {seconds} from '../timeline';
import {
  CenterGraph,
  CodeBlock,
  CourseLayout,
  createEpisodeRuntime,
  EpisodeTitleCard,
  EpisodeTimeline,
  GitGraph,
  MotionTitle,
  PositionedMotion,
  QuestionCaption,
  RecordedTerminalStage,
  SceneCaption,
  SvgArrowLine,
  type GitGraphState,
} from '../kit';
import {TERMINAL_RECORDINGS} from '../data/terminalRecordings.generated';
import {COLOR, FONT, WEIGHT} from '../palette';
import {TYPE} from '../typography';
export {EP01_DURATION_IN_FRAMES, EP01_SCENES} from '../data/episodeTimelines.generated';
import {EP01_DURATION_IN_FRAMES, EP01_SCENES} from '../data/episodeTimelines.generated';

type Ep01SceneId = (typeof EP01_SCENES)[number]['id'];
const EP01_RUNTIME = createEpisodeRuntime(EP01_SCENES);

const sceneTitleOpacity = (frame: number) => {
  const titleIn = interpolate(frame, [0, seconds(0.55)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.72), seconds(2.12)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return titleIn * titleOut;
};

const TERMINAL_HEADER_HEIGHT = 42;
const recordedTerminalHeight = (width: number, recording: {width: number; height: number}) =>
  TERMINAL_HEADER_HEIGHT + (width * recording.height) / recording.width;

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
        width: 396,
        height: 224,
        borderRadius: 12,
        background: COLOR.canvas.raised,
        border: `1px solid ${COLOR.stroke.default}`,
        boxShadow: `0 24px 54px ${COLOR.effects.shadowSoft}`,
        opacity,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: 'center',
        padding: '28px 30px',
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
          marginBottom: 20,
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
      <div style={{...TYPE.ui, color: COLOR.text.primary, fontSize: 37, fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, fontSize: 25, marginTop: 10}}>{note}</div>
    </div>
  );
};

export const Ep01HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, seconds(0.38)], [0, 1], {extrapolateRight: 'clamp'});
  const titleOut = interpolate(frame, [seconds(1.62), seconds(1.98)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleOpacity = titleIn * titleOut;
  const titleY = interpolate(frame, [0, seconds(0.5)], [18, -18], {extrapolateRight: 'clamp'});
  const keywordIn = interpolate(frame, [seconds(0.25), seconds(0.72)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const underline = interpolate(frame, [seconds(0.48), seconds(1.08)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(1.82), seconds(2.12)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardSpread = interpolate(frame, [seconds(2.35), seconds(3.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stackTighten = interpolate(frame, [seconds(6.05), seconds(8.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const historyHint = interpolate(frame, [seconds(7.85), seconds(8.9)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionIn = interpolate(frame, [seconds(9.55), seconds(10.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const questionMarkIn = interpolate(frame, [seconds(8.9), seconds(9.7)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const cardBase = [
    {label: '状态 A', note: '项目此刻', x: 300, y: 378, rotate: -5, tone: 'main' as const},
    {label: '状态 B', note: '下一次改动', x: 762, y: 414, rotate: 3, tone: 'feature' as const},
    {label: '状态 C', note: '再次改动', x: 1224, y: 378, rotate: -2, tone: 'head' as const},
  ];

  return (
    <AbsoluteFill style={{padding: '118px 154px 112px', boxSizing: 'border-box'}}>
      <EpisodeTitleCard
        index="1."
        keyword="Git"
        suffix="到底记录什么？"
        opacity={titleOpacity}
        translateY={titleY}
        keywordOpacity={interpolate(keywordIn, [0, 1], [0.48, 1])}
        keywordTranslateY={interpolate(keywordIn, [0, 1], [10, 0])}
        underlineScale={underline}
        underlineOpacity={underline * titleOut * 0.72}
        auditId="ep01-hook-title"
      />

      <PositionedMotion
        x={0}
        y={0}
        width={1920}
        opacity={graphIn}
        translateY={interpolate(graphIn, [0, 1], [28, 0])}
        auditId="ep01-hook-card-area"
      >
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: historyHint * 0.72}}
          data-audit-id="ep01-hook-history-hint"
        >
        </svg>
        {cardBase.map((card, idx) => {
          const appear = interpolate(frame, [seconds(2.15 + idx * 0.78), seconds(2.68 + idx * 0.78)], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const entryY = interpolate(appear, [0, 1], [30, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const stackOpacity = idx === 2 ? 1 : 0.18 + idx * 0.12;
          const stackX = [690, 776, 878][idx];
          const stackY = [340, 382, 424][idx];
          const stackRotate = [-5, -1, 3][idx];
          const stackScale = [0.96, 0.98, 1.02][idx];
          return (
            <FileVersionCard
              key={card.label}
              label={card.label}
              note={card.note}
              tone={card.tone}
              x={interpolate(stackTighten, [0, 1], [interpolate(cardSpread, [0, 1], [762, card.x]), stackX])}
              y={interpolate(stackTighten, [0, 1], [interpolate(cardSpread, [0, 1], [384, card.y]), stackY]) + entryY}
              rotate={interpolate(stackTighten, [0, 1], [card.rotate, stackRotate])}
              opacity={appear * interpolate(stackTighten, [0, 1], [0.98, stackOpacity])}
              scale={interpolate(stackTighten, [0, 1], [1.12, stackScale])}
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
          fontWeight: WEIGHT.bold,
          color: COLOR.git.head,
          opacity: questionMarkIn * 0.42,
          transform: `scale(${interpolate(questionMarkIn, [0, 1], [0.72, 1])})`,
          textShadow: `0 20px 44px ${COLOR.effects.headHighlight}`,
        }}
      >
        ?
      </div>

      <QuestionCaption opacity={questionIn} translateY={interpolate(questionIn, [0, 1], [16, 0])} width={980} fontSize={38} auditId="ep01-hook-question">
        保存文件，还是保存历史？
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
        <text x={x + 34} y={y + 9} fontFamily={FONT.sans} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

export const Ep01BadModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const stack = interpolate(frame, [seconds(6), seconds(11.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const doubt = interpolate(frame, [seconds(12.4), seconds(14.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(frame, [seconds(17.4), seconds(19.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cards = [
    {label: 'project', note: '原始目录', x: 202, y: 382, sx: 304, sy: 354, rotate: -4, stackRotate: -7, tone: 'main' as const},
    {label: 'project-final', note: '第一次复制', x: 598, y: 404, sx: 390, sy: 402, rotate: 2, stackRotate: -2, tone: 'feature' as const},
    {label: 'project-final-2', note: '又改了一版', x: 994, y: 382, sx: 486, sy: 448, rotate: -2, stackRotate: 4, tone: 'head' as const},
    {label: 'project-final-final', note: '第三次复制', x: 1286, y: 424, sx: 592, sy: 500, rotate: 4, stackRotate: 8, tone: 'head' as const},
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
        const stackScale = [0.88, 0.92, 0.96, 1.02][idx];
        const stackOpacity = [0.18, 0.28, 0.48, 1][idx];
        return (
          <FileVersionCard
            key={card.label}
            label={card.label}
            note={card.note}
            tone={card.tone}
            x={interpolate(stack, [0, 1], [card.x, card.sx])}
            y={interpolate(stack, [0, 1], [card.y, card.sy])}
            rotate={interpolate(stack, [0, 1], [card.rotate, card.stackRotate])}
            opacity={appear * interpolate(stack, [0, 1], [1, stackOpacity])}
            scale={interpolate(stack, [0, 1], [0.92, stackScale])}
          />
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 1118,
          top: 438,
          opacity: doubt,
          transform: `translateX(${interpolate(doubt, [0, 1], [28, 0])}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          maxWidth: 560,
        }}
        data-audit-id="ep01-bad-model-question"
      >
        <div
          style={{
            width: 54,
            height: 54,
            flex: '0 0 auto',
            borderRadius: 999,
            border: `3px solid ${COLOR.git.conflict}`,
            color: COLOR.git.conflict,
            display: 'grid',
            placeItems: 'center',
            ...TYPE.title,
            fontSize: 34,
            lineHeight: 1,
          }}
        >
          ?
        </div>
        <div style={{...TYPE.title, fontSize: 48, lineHeight: 1.15, color: COLOR.git.conflict, fontWeight: WEIGHT.bold}}>
          哪个才是最终版？
        </div>
      </div>
      <SceneCaption opacity={caption} bottom={126} width={1080} fontSize={35} auditId="ep01-bad-model-caption">
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
  const compareEvidence = interpolate(frame, [seconds(15.2), seconds(16.2), seconds(22.4), seconds(23.2)], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const traceEvidence = interpolate(frame, [seconds(23.2), seconds(24.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
              <text x={node.x} y={node.y + 10} textAnchor="middle" fontFamily={FONT.mono} fontSize="34" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
                {node.id}
              </text>
              <text
                x={node.x}
                y={node.y + 126}
                textAnchor="middle"
                fontFamily={FONT.sans}
                fontSize={active ? '36' : '29'}
                fontWeight={WEIGHT.bold}
                fill={active ? COLOR.text.primary : COLOR.text.secondary}
                opacity={labelOpacity}
              >
                {concepts[idx]}
              </text>
            </g>
          );
        })}
        <g opacity={compareEvidence} data-audit-id="ep01-version-compare-evidence">
          <text x="1214" y="326" textAnchor="middle" fontFamily={FONT.mono} fontSize="26" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            v2 ↔ v3
          </text>
          <text x="1086" y="374" fontFamily={FONT.mono} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
            -
          </text>
          <path d="M1122 366 L1306 366" stroke={COLOR.git.conflict} strokeWidth="8" strokeLinecap="round" opacity="0.78" />
          <text x="1086" y="424" fontFamily={FONT.mono} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.git.main}>
            +
          </text>
          <path d="M1122 416 L1366 416" stroke={COLOR.git.main} strokeWidth="8" strokeLinecap="round" opacity="0.86" />
        </g>
        <g opacity={traceEvidence} data-audit-id="ep01-version-trace-evidence">
          <text x="1638" y="438" fontFamily={FONT.sans} fontSize="29" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            作者
          </text>
          <text x="1638" y="492" fontFamily={FONT.sans} fontSize="29" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            时间
          </text>
          <text x="1638" y="546" fontFamily={FONT.sans} fontSize="29" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            原因
          </text>
        </g>
      </svg>
      <SceneCaption opacity={caption} bottom={126} width={1080} fontSize={35} auditId="ep01-version-caption">
        {summaries[focus]}
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01SnapshotModelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const deltaOut = interpolate(frame, [seconds(4.2), seconds(5.6)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const deltaScale = interpolate(frame, [seconds(4.2), seconds(5.6)], [1, 0.74], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const snapshotIn = interpolate(frame, [seconds(4.9), seconds(6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const streamScale = interpolate(frame, [seconds(5.2), seconds(7.6)], [0.88, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const reuse = interpolate(frame, [seconds(20.5), seconds(24.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
          <text x="960" y="286" textAnchor="middle" fontFamily={FONT.sans} fontSize="38" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary} opacity={interpolate(frame, [seconds(5.4), seconds(6.4), seconds(14), seconds(15.2)], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
            commit 指向的是完整项目状态
          </text>
          <line
            x1="508"
            y1="430"
              x2={508 + (1412 - 508) * interpolate(frame, [seconds(6), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
            y2="430"
            stroke={COLOR.git.graphLine}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {nodes.map((node, idx) => {
            const appear = interpolate(frame, [seconds(4.8 + idx * 4), seconds(5.7 + idx * 4)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const pop = interpolate(frame, [seconds(4.8 + idx * 4), seconds(5.5 + idx * 4)], [0.72, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const expand = interpolate(frame, [seconds(5.8 + idx * 4), seconds(7 + idx * 4)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const active = frame >= seconds(4.8 + idx * 4) && frame < seconds(9 + idx * 4);
            return (
              <g key={node.id} opacity={appear} transform={`translate(${node.x} 430) scale(${pop}) translate(${-node.x} -430)`} data-audit-id={`ep01-snapshot-${node.id}`}>
                <circle cx={node.x} cy="430" r="74" fill={COLOR.canvas.base} stroke={active ? COLOR.git.head : COLOR.git.commit} strokeWidth={active ? 10 : 7} />
                <text x={node.x} y="441" textAnchor="middle" fontFamily={FONT.mono} fontSize="38" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
                  {node.id}
                </text>
                <g opacity={expand} transform={`translate(${node.x - 148} 550)`}>
                  {files.map((file, fileIdx) => (
                    <g key={file} transform={`translate(${(fileIdx % 2) * 158} ${Math.floor(fileIdx / 2) * 76})`}>
                      <rect width="136" height="58" rx="8" fill={fileIdx === 1 && idx > 0 ? COLOR.effects.headHighlight : COLOR.canvas.raised} stroke={COLOR.stroke.soft} />
                      <text x="68" y="38" textAnchor="middle" fontFamily={FONT.sans} fontSize="23" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
                        {file}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            );
          })}
          <g opacity={reuse}>
            <path d="M674 722 C790 770 836 770 948 722" fill="none" stroke={COLOR.stroke.strong} strokeWidth="5" strokeDasharray="13 15" opacity="0.72" />
            <path d="M1126 722 C1242 770 1288 770 1400 722" fill="none" stroke={COLOR.stroke.strong} strokeWidth="5" strokeDasharray="13 15" opacity="0.72" />
            <text x="960" y="806" textAnchor="middle" fontFamily={FONT.sans} fontSize="32" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
              不变内容复用
            </text>
            <text x="960" y="854" textAnchor="middle" fontFamily={FONT.sans} fontSize="40" fontWeight={WEIGHT.bold} fill={COLOR.git.main}>
              快照流
            </text>
          </g>
        </g>
      </svg>
      <SceneCaption opacity={conclusion} bottom={126} width={1080} fontSize={35} auditId="ep01-snapshot-caption">
        每次 commit 都指向一个项目状态。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01PracticeCheckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const logIn = interpolate(frame, [seconds(1.5), seconds(2.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logOut = interpolate(frame, [seconds(8.8), seconds(9.4)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const statIn = interpolate(frame, [seconds(9.5), seconds(10.15)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const statOut = interpolate(frame, [seconds(17.2), seconds(17.8)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nameIn = interpolate(frame, [seconds(17.8), seconds(18.45)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nameOut = interpolate(frame, [seconds(24), seconds(24.6)], [1, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(4.2), seconds(6.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const finalCaption = interpolate(frame, [seconds(24.2), seconds(25.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const logWidth = 1020;
  const logHeight = recordedTerminalHeight(logWidth, TERMINAL_RECORDINGS['ep01-log']);
  const inspectWidth = 1320;
  const inspectHeight = recordedTerminalHeight(inspectWidth, TERMINAL_RECORDINGS['ep01-show-stat']);

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} y={90} size={58} auditId="ep01-practice-title">
        用 log 和 show 看见这条历史
      </MotionTitle>
      <Sequence from={seconds(1.5)} layout="none">
        <RecordedTerminalStage
          auditId="ep01-practice-log-terminal"
          rect={{x: 100, y: 224, width: logWidth, height: logHeight}}
          opacity={logIn * logOut}
          src="git-course-lab/terminal/ep01-log.mp4"
          holdFrameSrc="git-course-lab/terminal/ep01-log-hold.png"
          holdFromFrame={TERMINAL_RECORDINGS['ep01-log'].holdFromFrame}
          title="commit-history"
        />
      </Sequence>
      <div
        style={{
          position: 'absolute',
          left: 1220,
          top: 324,
          width: 580,
          height: 260,
          opacity: graphIn * logOut,
          transform: `translateX(${interpolate(graphIn, [0, 1], [28, 0])}px)`,
        }}
        data-audit-id="ep01-practice-history-card"
      >
        <div
          style={{
            borderRadius: 16,
            border: `2px solid ${COLOR.stroke.default}`,
            background: COLOR.canvas.raised,
            boxShadow: `0 18px 38px ${COLOR.effects.shadowSoft}`,
            padding: '28px 30px',
          }}
        >
          <div style={{...TYPE.ui, fontSize: 29, fontWeight: WEIGHT.bold, color: COLOR.text.secondary, marginBottom: 14}}>log 列出 commit 历史链</div>
          <GitGraph state={ep01GraphState(3)} width={520} height={168} auditId="ep01-practice-graph" />
        </div>
      </div>
      <Sequence from={seconds(9.5)} layout="none">
        <RecordedTerminalStage
          auditId="ep01-practice-stat-terminal"
          rect={{x: 300, y: 146, width: inspectWidth, height: inspectHeight}}
          opacity={statIn * statOut}
          src="git-course-lab/terminal/ep01-show-stat.mp4"
          holdFrameSrc="git-course-lab/terminal/ep01-show-stat-hold.png"
          holdFromFrame={TERMINAL_RECORDINGS['ep01-show-stat'].holdFromFrame}
          title="open-head"
        />
      </Sequence>
      <Sequence from={seconds(17.8)} layout="none">
        <RecordedTerminalStage
          auditId="ep01-practice-name-terminal"
          rect={{x: 300, y: 146, width: inspectWidth, height: inspectHeight}}
          opacity={nameIn * nameOut}
          src="git-course-lab/terminal/ep01-show-name-only.mp4"
          holdFrameSrc="git-course-lab/terminal/ep01-show-name-only-hold.png"
          holdFromFrame={TERMINAL_RECORDINGS['ep01-show-name-only'].holdFromFrame}
          title="paths-in-head"
        />
      </Sequence>
      <SceneCaption opacity={finalCaption} bottom={112} width={1240} fontSize={34} auditId="ep01-practice-caption">
        现在先不用理解所有字段，只看一件事：commit 可以被列出、打开和检查。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01LocalHistoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shrink = interpolate(frame, [seconds(14), seconds(17)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const graphIn = interpolate(frame, [seconds(17), seconds(19)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const queryProgress = interpolate(frame, [seconds(20), seconds(23)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const terminalFinal = {left: 152, top: 260, width: 612, height: recordedTerminalHeight(612, TERMINAL_RECORDINGS['ep01-log'])};
  const terminalInitial = {left: 190, top: 128, width: 1540, height: recordedTerminalHeight(1540, TERMINAL_RECORDINGS['ep01-log'])};
  const repoCard = {left: 944, top: 260, width: 790, height: 430};
  const linkY = terminalFinal.top + terminalFinal.height / 2;

  return (
    <AbsoluteFill>
      <RecordedTerminalStage
        auditId="ep01-local-terminal"
        rect={{
          x: interpolate(shrink, [0, 1], [terminalInitial.left, terminalFinal.left]),
          y: interpolate(shrink, [0, 1], [terminalInitial.top, terminalFinal.top]),
          width: interpolate(shrink, [0, 1], [terminalInitial.width, terminalFinal.width]),
          height: interpolate(shrink, [0, 1], [terminalInitial.height, terminalFinal.height]),
        }}
        opacity={interpolate(shrink, [0, 1], [1, 0.84])}
        src="git-course-lab/terminal/ep01-log.mp4"
        holdFrameSrc="git-course-lab/terminal/ep01-log-hold.png"
        holdFromFrame={TERMINAL_RECORDINGS['ep01-log'].holdFromFrame}
        title="local-history"
      />
      <div
        style={{
          position: 'absolute',
          left: repoCard.left,
          top: repoCard.top,
          width: repoCard.width,
          height: repoCard.height,
          opacity: graphIn,
          transform: `translateY(${interpolate(graphIn, [0, 1], [28, 0])}px) scale(${interpolate(graphIn, [0, 1], [0.92, 1])})`,
          transformOrigin: 'center',
          borderRadius: 18,
          background: COLOR.canvas.raised,
          border: `2px solid ${COLOR.stroke.default}`,
          boxShadow: `0 18px 38px ${COLOR.effects.shadowSoft}`,
          padding: '34px 40px',
          boxSizing: 'border-box',
        }}
        data-audit-id="ep01-local-repository"
      >
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28}}>
          <div>
            <div style={{fontFamily: FONT.sans, fontSize: 40, fontWeight: WEIGHT.bold, color: COLOR.text.primary}}>本地仓库</div>
            <div style={{marginTop: 10, fontFamily: FONT.sans, fontSize: 27, fontWeight: WEIGHT.bold, color: COLOR.text.secondary}}>保存完整历史</div>
          </div>
          <div
            style={{
              borderRadius: 999,
              border: `2px solid ${COLOR.git.head}`,
              color: COLOR.git.head,
              fontFamily: FONT.sans,
              fontSize: 24,
              fontWeight: WEIGHT.bold,
              padding: '10px 18px',
            }}
          >
            不需要网络
          </div>
        </div>
        <div style={{marginLeft: 4}} data-audit-id="ep01-local-graph">
          <GitGraph state={ep01GraphState(3)} width={700} height={250} auditId="ep01-local-git-graph" />
        </div>
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine
          x1={terminalFinal.left + terminalFinal.width + 28}
          y1={linkY}
          x2={repoCard.left - 14}
          y2={linkY}
          progress={queryProgress}
          color={COLOR.git.main}
          width={6}
          opacity={0.75}
          dash="none"
          auditId="ep01-local-link"
        />
        <text
          x={(terminalFinal.left + terminalFinal.width + repoCard.left) / 2}
          y={linkY - 34}
          textAnchor="middle"
          fontFamily={FONT.sans}
          fontSize="25"
          fontWeight={WEIGHT.bold}
          fill={COLOR.git.main}
          opacity={queryProgress}
        >
          读取本地历史
        </text>
      </svg>
      <SceneCaption opacity={interpolate(frame, [seconds(23), seconds(25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={126} width={1080} fontSize={35} auditId="ep01-local-caption">
        查询直接读本地仓库。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01IntegrityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = sceneTitleOpacity(frame);
  const edit = interpolate(frame, [seconds(8), seconds(11)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hashSwap = interpolate(frame, [seconds(11), seconds(13)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const compareIn = interpolate(frame, [seconds(14), seconds(16)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const commitIn = interpolate(frame, [seconds(22), seconds(25)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const oldHash = 'a81f3c2';
  const newHash = 'd42b8aa';
  const activeHash = hashSwap > 0.54 ? newHash : oldHash;
  const activeHashColor = hashSwap > 0.54 ? COLOR.git.conflict : COLOR.git.head;
  const compareOpacity = compareIn * (1 - commitIn);
  const fileCard = {left: 292, top: 326, width: 620, height: 172};
  const hashCard = {left: 1138, top: 326, width: 386, height: 188};
  const linkY = fileCard.top + fileCard.height / 2;

  return (
    <AbsoluteFill>
      <MotionTitle opacity={titleOpacity} auditId="ep01-integrity-title">
        内容变化，hash 跟着变化
      </MotionTitle>
      <div style={{position: 'absolute', left: fileCard.left, top: fileCard.top, width: fileCard.width}} data-audit-id="ep01-integrity-code">
        <CodeBlock title="README.md" lines={['Git stores snapshots.', edit > 0.5 ? 'A commit points to content!' : 'A commit points to content.']} highlight={edit > 0.5 ? [1] : []} />
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <SvgArrowLine
          x1={fileCard.left + fileCard.width + 28}
          y1={linkY}
          x2={hashCard.left - 20}
          y2={linkY}
          progress={interpolate(frame, [seconds(4), seconds(6.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          color={COLOR.git.graphLine}
          width={7}
          opacity={0.72}
          dash="none"
        />
        <text x={(fileCard.left + fileCard.width + hashCard.left) / 2} y={linkY - 34} textAnchor="middle" fontFamily={FONT.sans} fontSize="25" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary} opacity={interpolate(frame, [seconds(5), seconds(6.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          计算内容
        </text>
        <g transform={`translate(${hashCard.left} ${hashCard.top})`}>
          <rect width={hashCard.width} height={hashCard.height} rx="16" fill={COLOR.canvas.raised} stroke={COLOR.stroke.soft} />
          <text x="34" y="62" fontFamily={FONT.sans} fontSize="30" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            内容 hash
          </text>
          <text x="34" y="124" fontFamily={FONT.mono} fontSize="52" fontWeight={WEIGHT.bold} fill={activeHashColor}>
            {activeHash}
          </text>
        </g>
        <g opacity={compareOpacity} transform={`translate(0 ${interpolate(compareIn, [0, 1], [22, 0])})`} data-audit-id="ep01-integrity-hash-compare">
          <text x="960" y="648" textAnchor="middle" fontFamily={FONT.sans} fontSize="30" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
            {'内容变化 -> hash 变化'}
          </text>
          <g transform="translate(734 682)">
            <rect width="186" height="58" rx="29" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="3" />
            <text x="93" y="39" textAnchor="middle" fontFamily={FONT.mono} fontSize="27" fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
              {oldHash}
            </text>
          </g>
          <path d="M944 711 H976" stroke={COLOR.stroke.strong} strokeWidth="4" strokeLinecap="round" />
          <path d="M976 711 L960 698 M976 711 L960 724" stroke={COLOR.stroke.strong} strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(1000 682)">
            <rect width="186" height="58" rx="29" fill={COLOR.canvas.raised} stroke={COLOR.git.conflict} strokeWidth="3" />
            <text x="93" y="39" textAnchor="middle" fontFamily={FONT.mono} fontSize="27" fontWeight={WEIGHT.bold} fill={COLOR.git.conflict}>
              {newHash}
            </text>
          </g>
        </g>
        <g opacity={commitIn} transform={`translate(0 ${interpolate(commitIn, [0, 1], [24, 0])})`}>
          <circle cx="960" cy="752" r="58" fill={COLOR.canvas.base} stroke={COLOR.git.commit} strokeWidth="7" />
          <text x="960" y="764" textAnchor="middle" fontFamily={FONT.mono} fontSize="33" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
            C2
          </text>
          <rect x="1008" y="700" width="138" height="42" rx="21" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="3" />
          <text x="1077" y="728" textAnchor="middle" fontFamily={FONT.mono} fontSize="22" fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
            {newHash}
          </text>
        </g>
      </svg>
      <SceneCaption opacity={interpolate(frame, [seconds(20), seconds(22)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} bottom={126} width={1080} fontSize={35} auditId="ep01-integrity-caption">
        Git 用内容生成标识，所以历史可以被校验。
      </SceneCaption>
    </AbsoluteFill>
  );
};

export const Ep01TakeawayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const graphIn = interpolate(frame, [0, seconds(1.4)], [0, 1], {extrapolateRight: 'clamp'});
  const lines = ['记录历史', '形成快照', '本地可查'];
  const questionIn = interpolate(frame, [seconds(18), seconds(20)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
                fontSize: 39,
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
          transform: `translate(-50%, ${interpolate(questionIn, [0, 1], [24, 0])}px)`,
          opacity: questionIn,
          ...TYPE.title,
          fontSize: 48,
          color: COLOR.text.primary,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
        data-audit-id="ep01-takeaway-question"
      >
        文件进入 commit 前，经过哪三层？
      </div>
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
  const sceneStart = EP01_RUNTIME.start(sceneId);

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

export const Ep01PracticeCheckPreview: React.FC = () => (
  <Ep01ScenePreview sceneId="practice-check">
    <Ep01PracticeCheckScene />
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

const EP01_SCENE_COMPONENTS = {
  hook: Ep01HookScene,
  'bad-model': Ep01BadModelScene,
  'version-control': Ep01VersionControlScene,
  'snapshot-model': Ep01SnapshotModelScene,
  'practice-check': Ep01PracticeCheckScene,
  'local-history': Ep01LocalHistoryScene,
  integrity: Ep01IntegrityScene,
  takeaway: Ep01TakeawayScene,
};

export const Ep01WhatGitStores: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CourseLayout
      seriesTitle="看得见的 Git"
      episodeTitle="Git 到底记录什么"
      scenes={EP01_SCENES}
      currentFrame={frame}
      showHeader={(current) => current >= EP01_RUNTIME.start('bad-model')}
      showEpisodeTitle={(current) => current >= EP01_RUNTIME.start('bad-model')}
    >
      <EpisodeTimeline runtime={EP01_RUNTIME} components={EP01_SCENE_COMPONENTS} />
    </CourseLayout>
  );
};
