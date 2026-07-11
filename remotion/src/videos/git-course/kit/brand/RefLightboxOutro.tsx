import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, WEIGHT} from '../../palette';
import {between, eases, pulse, stagger, tween} from './motion';

const C = {
  bg: '#f8f8f2',
  bgCool: '#eef5f0',
  ink: '#17211f',
  muted: '#4f5f59',
  faint: '#84938d',
  grid: '#d8e1dc',
  line: '#bfcbc4',
  main: '#1f6869',
  copper: '#a45f49',
  head: '#b98723',
  panel: 'rgba(255,255,255,0.84)',
  panelStrong: 'rgba(255,255,255,0.94)',
  shadow: 'rgba(23,33,31,0.1)',
  glow: 'rgba(185,135,35,0.34)',
} as const;

const beats = {
  appear: 0,
  gather: 18,
  lock: 72,
  brand: 104,
  line: 124,
} as const;

const lockup = {
  centerX: 960,
  titleY: 410,
  gitY: 438,
  zhX: 552,
  gitX: 1068,
  railY: 604,
  railLeft: 650,
  railRight: 1270,
  railMid: 960,
} as const;

const conceptNodes = [
  {id: 'commit', label: 'commit', x: 352, y: 754, tx: 564, ty: 514, r: 28, color: C.ink},
  {id: 'tree', label: 'tree', x: 780, y: 232, tx: 812, ty: 514, r: 22, color: C.main},
  {id: 'blob', label: 'blob', x: 1454, y: 214, tx: 1060, ty: 514, r: 22, color: C.copper},
  {id: 'ref', label: 'ref', x: 1582, y: 744, tx: 1308, ty: 514, r: 20, color: C.main},
  {id: 'HEAD', label: 'HEAD', x: 982, y: 888, tx: 960, ty: 514, r: 26, color: C.head},
  {id: 'index', label: 'index', x: 528, y: 292, tx: 748, ty: 678, r: 18, color: C.copper},
  {id: 'worktree', label: 'worktree', x: 1388, y: 856, tx: 1172, ty: 678, r: 18, color: C.muted},
] as const;

type ConceptNode = (typeof conceptNodes)[number];
type ConceptNodeId = ConceptNode['id'];

const links: ReadonlyArray<readonly [ConceptNodeId, ConceptNodeId]> = [
  ['commit', 'tree'],
  ['tree', 'blob'],
  ['ref', 'commit'],
  ['HEAD', 'ref'],
  ['worktree', 'index'],
  ['index', 'tree'],
] as const;

const nodeMap = Object.fromEntries(conceptNodes.map((node) => [node.id, node])) as Record<
  ConceptNodeId,
  ConceptNode
>;

const hashRows = [
  {text: '8f3a2c', x: 180, y: 180, color: C.main},
  {text: 'b17e90', x: 1496, y: 168, color: C.faint},
  {text: 'a91d0e', x: 274, y: 906, color: C.copper},
  {text: '72ab3f', x: 1524, y: 908, color: C.head},
] as const;

const posFor = (frame: number, node: ConceptNode) => {
  const gather = tween(frame, beats.gather, beats.lock, eases.power4InOut);
  const brandSettle = tween(frame, beats.brand, beats.line + 16, eases.power4Out);
  return {
    x: interpolate(gather, [0, 1], [node.x, node.tx + (node.tx - 960) * 0.12 * brandSettle]),
    y: interpolate(gather, [0, 1], [node.y, node.ty + 54 * brandSettle]),
  };
};

export const RefLightboxOutro: React.FC<{
  seriesTitle?: string;
}> = ({seriesTitle = '看得见的 Git'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gather = tween(frame, beats.gather, beats.lock, eases.power4InOut);
  const lockPulse = pulse(frame, beats.lock, beats.lock + 28);
  const brandIn = tween(frame, beats.brand, beats.brand + 32, eases.expoOut);
  const lineIn = tween(frame, beats.line, beats.line + 24, eases.power4Out);
  const networkExit = tween(frame, beats.brand + 10, beats.line + 18, eases.power4Out);
  const fadeNetwork = 1 - networkExit;
  const titleSpring = spring({
    frame: Math.max(0, frame - beats.brand),
    fps,
    config: {damping: 20, stiffness: 105, mass: 0.9},
  });
  const bgFloat = Math.sin(frame / 54) * 1.1;

  return (
    <AbsoluteFill style={{background: C.bg, color: C.ink, fontFamily: FONT.sans, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at ${44 + bgFloat}% 38%, rgba(31,104,105,0.12), transparent 31%),
            radial-gradient(circle at 72% 70%, rgba(185,135,35,0.1), transparent 30%),
            radial-gradient(circle at 22% 76%, rgba(164,95,73,0.08), transparent 28%),
            linear-gradient(125deg, ${C.bgCool} 0%, ${C.bg} 48%, #fffdf8 100%)
          `,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: '66px 66px',
          opacity: 0.09 * (1 - brandIn * 0.38),
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, black 58%, transparent 92%)',
        }}
      />

      {hashRows.map((row, idx) => {
        const rowIn = tween(frame, stagger(beats.appear + 4, idx, 5), stagger(beats.appear + 4, idx, 5) + 24, eases.power4Out);
        const rowOut = tween(frame, beats.gather + 10, beats.lock, eases.power4Out);
        return (
          <div
            key={row.text}
            style={{
              position: 'absolute',
              left: interpolate(rowOut, [0, 1], [row.x, 960]),
              top: interpolate(rowOut, [0, 1], [row.y, 540]),
              fontFamily: FONT.mono,
              fontSize: 17,
              fontWeight: WEIGHT.bold,
              letterSpacing: 1.3,
              color: row.color,
              opacity: rowIn * (1 - rowOut) * 0.34,
              transform: `translateX(${Math.sin((frame + idx * 11) / 30) * 8}px)`,
            }}
          >
            {row.text}
          </div>
        );
      })}

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="gitOutroShadow" x="-45%" y="-45%" width="190%" height="190%">
            <feDropShadow dx="0" dy="18" stdDeviation="24" floodColor={C.shadow} />
          </filter>
          <filter id="gitOutroGlow" x="-90%" y="-90%" width="280%" height="280%">
            <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor={C.glow} />
          </filter>
          <clipPath id="outroTitleReveal">
            <rect x="500" y="254" width={interpolate(brandIn, [0, 1], [0, 980])} height="290" />
          </clipPath>
          <clipPath id="outroGitClip">
            <text x={lockup.gitX} y={lockup.gitY} fontFamily={FONT.brand} fontSize="176" fontWeight={WEIGHT.black}>
              Git
            </text>
          </clipPath>
        </defs>

        <g opacity={fadeNetwork} transform={`translate(0 ${networkExit * 22})`}>
          {links.map(([from, to], idx) => {
            const a = posFor(frame, nodeMap[from]);
            const b = posFor(frame, nodeMap[to]);
            const linkStart = stagger(beats.appear + 16, idx, 4);
            const linkIn = tween(frame, linkStart, linkStart + 30, eases.power4Out);
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={from === 'HEAD' || to === 'HEAD' ? C.head : C.line}
                strokeWidth={from === 'HEAD' || to === 'HEAD' ? 4 : 6}
                strokeLinecap="round"
                strokeDasharray="760"
                strokeDashoffset={760 * (1 - linkIn)}
                opacity={(0.18 + linkIn * 0.62) * (1 - brandIn * 0.28)}
              />
            );
          })}

          {conceptNodes.map((node, idx) => {
            const appear = tween(frame, stagger(beats.appear, idx, 4), stagger(beats.appear, idx, 4) + 28, eases.backOut);
            const p = posFor(frame, node);
            const isHead = node.id === 'HEAD';
            const settlePulse = isHead ? lockPulse : pulse(frame, beats.lock + idx * 2, beats.lock + 18 + idx * 2) * 0.18;
            const labelOpacity = appear * (1 - gather * 0.34) * (1 - brandIn * 0.72);
            return (
              <g
                key={node.id}
                data-audit-id={`outro-node-${node.id}`}
                transform={`translate(${p.x} ${p.y}) scale(${interpolate(appear, [0, 1], [0.56, 1]) * (1 - brandIn * 0.1)})`}
                opacity={appear}
              >
                {isHead ? (
                  <circle
                    r={node.r + 22 + settlePulse * 12}
                    fill="none"
                    stroke={C.head}
                    strokeWidth="2.4"
                    opacity={0.14 + settlePulse * 0.16}
                  />
                ) : null}
                <circle
                  r={node.r + settlePulse * 4}
                  fill={C.panel}
                  stroke={node.color}
                  strokeWidth={isHead ? 6 : 4}
                  filter={isHead ? 'url(#gitOutroGlow)' : 'url(#gitOutroShadow)'}
                />
                <circle r={Math.max(5, node.r * 0.27)} fill={node.color} />
                <text
                  y={node.r + 38}
                  textAnchor="middle"
                  fontFamily={FONT.mono}
                  fontSize="18"
                  fontWeight={WEIGHT.bold}
                  fill={node.color}
                  opacity={labelOpacity}
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          <path
            d="M642 746 C774 694 1124 694 1276 746"
            fill="none"
            stroke={C.grid}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="760"
            strokeDashoffset={between(frame, 760, 0, beats.lock + 6, beats.brand + 24, eases.power4Out)}
            opacity={0.36 * tween(frame, beats.lock + 4, beats.brand + 24, eases.power4Out)}
          />
        </g>

        <g
          clipPath="url(#outroTitleReveal)"
          opacity={brandIn}
          transform={`translate(0 ${interpolate(titleSpring, [0, 1], [28, 0])}) scale(${interpolate(titleSpring, [0, 1], [0.97, 1])})`}
        >
          <text x={lockup.zhX} y={lockup.titleY} fontFamily={FONT.brand} fontSize="104" fontWeight={WEIGHT.black} fill={C.ink}>
            {seriesTitle.replace(' Git', '')}
          </text>
          <text
            x={lockup.gitX}
            y={lockup.gitY}
            fontFamily={FONT.brand}
            fontSize="176"
            fontWeight={WEIGHT.black}
            fill={C.ink}
            stroke={C.head}
            strokeWidth={interpolate(lineIn, [0, 1], [0, 1.15])}
            paintOrder="stroke fill"
            filter="url(#gitOutroShadow)"
          >
            Git
          </text>
          <g clipPath="url(#outroGitClip)" opacity={lineIn}>
            <path
              d="M1044 382 C1106 338 1190 340 1256 382 C1306 414 1338 412 1384 384"
              fill="none"
              stroke={C.head}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="392"
              strokeDashoffset={interpolate(lineIn, [0, 1], [392, 0])}
              opacity="0.7"
              filter="url(#gitOutroGlow)"
            />
            <path
              d="M1074 421 C1144 386 1222 390 1318 430"
              fill="none"
              stroke={C.main}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray="292"
              strokeDashoffset={interpolate(lineIn, [0, 1], [292, 0])}
              opacity="0.52"
            />
          </g>
        </g>

        <g opacity={lineIn}>
          <line
            x1={lockup.railLeft}
            y1={lockup.railY}
            x2={interpolate(lineIn, [0, 1], [lockup.railLeft, lockup.railRight])}
            y2={lockup.railY}
            stroke={C.line}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.76"
          />
          {[
            {x: lockup.railLeft, color: C.ink},
            {x: lockup.railMid, color: C.head},
            {x: lockup.railRight, color: C.main},
          ].map((mark, idx) => {
            const markIn = tween(frame, beats.line + 6 + idx * 4, beats.line + 24 + idx * 4, eases.backOut);
            return (
              <g key={mark.x} transform={`translate(${mark.x} ${lockup.railY}) scale(${markIn})`}>
                <circle
                  r={idx === 1 ? 26 : 20}
                  fill={C.bg}
                  stroke={mark.color}
                  strokeWidth={idx === 1 ? 7 : 5}
                  filter={idx === 1 ? 'url(#gitOutroGlow)' : undefined}
                />
                <circle r={idx === 1 ? 8 : 5} fill={mark.color} />
              </g>
            );
          })}
          <text
            x={lockup.centerX}
            y="690"
            textAnchor="middle"
            fontFamily={FONT.mono}
            fontSize="24"
            fontWeight={WEIGHT.bold}
            fill={C.muted}
            opacity={tween(frame, beats.line + 12, beats.line + 34, eases.power4Out)}
          >
            object · ref · history
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
