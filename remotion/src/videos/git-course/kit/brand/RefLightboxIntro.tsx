import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, WEIGHT} from '../../palette';
import {between, eases, introBeats, progress, pulse, stagger, tween} from './motion';

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
  panel: 'rgba(255,255,255,0.8)',
  panelStrong: 'rgba(255,255,255,0.95)',
  shadow: 'rgba(23,33,31,0.11)',
  glow: 'rgba(185,135,35,0.36)',
} as const;

const r = (frame: number, start: number, end: number) => tween(frame, start, end, eases.power4Out);
const rinout = (frame: number, start: number, end: number) => tween(frame, start, end, eases.power4InOut);
const p = progress;

const fieldStreams = [
  {hash: '8f3a2c', y: 154, width: 240, color: C.main},
  {hash: 'b17e90', y: 282, width: 184, color: C.faint},
  {hash: 'a91d0e', y: 418, width: 268, color: C.copper},
  {hash: 'f04c91', y: 566, width: 214, color: C.faint},
  {hash: '72ab3f', y: 718, width: 292, color: C.main},
] as const;

const fieldDust = [
  {text: 'HEAD', x: 548, y: 142, size: 20, color: C.head},
  {text: 'tree', x: 1388, y: 136, size: 22, color: C.main},
  {text: 'commit', x: 944, y: 350, size: 18, color: C.faint},
  {text: 'object', x: 966, y: 604, size: 30, color: C.faint},
  {text: 'hash', x: 1392, y: 842, size: 30, color: C.head},
] as const;

const nodes = [
  {id: 'commit', label: 'commit', x: 260, y: 780, tx: 500, ty: 430, r: 30, color: C.ink},
  {id: 'tree', label: 'tree', x: 1070, y: 130, tx: 760, ty: 430, r: 22, color: C.main},
  {id: 'blob', label: 'blob', x: 1660, y: 246, tx: 1020, ty: 430, r: 22, color: C.copper},
  {id: 'ref', label: 'ref', x: 1510, y: 810, tx: 1280, ty: 430, r: 20, color: C.main},
  {id: 'head', label: 'HEAD', x: 890, y: 930, tx: 1540, ty: 430, r: 18, color: C.head},
  {id: 'index', label: 'index', x: 420, y: 190, tx: 760, ty: 660, r: 20, color: C.copper},
  {id: 'work', label: 'worktree', x: 1700, y: 650, tx: 500, ty: 660, r: 20, color: C.muted},
] as const;

const edges = [
  ['commit', 'tree'],
  ['tree', 'blob'],
  ['blob', 'ref'],
  ['ref', 'head'],
  ['work', 'index'],
  ['index', 'tree'],
] as const;

const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node])) as Record<
  (typeof nodes)[number]['id'],
  (typeof nodes)[number]
>;

const logos = [
  {
    label: 'Git',
    color: '#F05032',
    path: 'M13.09 23.549a1.54 1.54 0 0 1-2.18 0L.451 13.089a1.54 1.54 0 0 1 0-2.179l7.191-7.19 2.733 2.733a1.85 1.85 0 0 0 .964 2.326v6.66a1.849 1.849 0 1 0 1.54 0V8.957l2.508 2.508a1.85 1.85 0 1 0 1.09-1.09l-2.634-2.634a1.85 1.85 0 0 0-2.378-2.377L8.73 2.63 10.91.451a1.54 1.54 0 0 1 2.179 0l10.459 10.46a1.54 1.54 0 0 1 0 2.179z',
  },
  {
    label: 'GitHub',
    color: '#181717',
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    label: 'GitLab',
    color: '#FC6D26',
    path: 'm23.6004 9.5927-.0337-.0862L20.3.9814a.851.851 0 0 0-.3362-.405.8748.8748 0 0 0-.9997.0539.8748.8748 0 0 0-.29.4399l-2.2055 6.748H7.5375l-2.2057-6.748a.8573.8573 0 0 0-.29-.4412.8748.8748 0 0 0-.9997-.0537.8585.8585 0 0 0-.3362.4049L.4332 9.5015l-.0325.0862a6.0657 6.0657 0 0 0 2.0119 7.0105l.0113.0087.03.0213 4.976 3.7264 2.462 1.8633 1.4995 1.1321a1.0085 1.0085 0 0 0 1.2197 0l1.4995-1.1321 2.4619-1.8633 5.006-3.7489.0125-.01a6.0682 6.0682 0 0 0 2.0094-7.003z',
  },
  {
    label: 'Gitea',
    color: '#609926',
    path: 'M4.209 4.603c-.247 0-.525.02-.84.088-.333.07-1.28.283-2.054 1.027C-.403 7.25.035 9.685.089 10.052c.065.446.263 1.687 1.21 2.768 1.749 2.141 5.513 2.092 5.513 2.092s.462 1.103 1.168 2.119c.955 1.263 1.936 2.248 2.89 2.367 2.406 0 7.212-.004 7.212-.004s.458.004 1.08-.394c.535-.324 1.013-.893 1.013-.893s.492-.527 1.18-1.73c.21-.37.385-.729.538-1.068 0 0 2.107-4.471 2.107-8.823-.042-1.318-.367-1.55-.443-1.627-.156-.156-.366-.153-.366-.153s-4.475.252-6.792.306c-.508.011-1.012.023-1.512.027v4.474l-.634-.301c0-1.39-.004-4.17-.004-4.17-1.107.016-3.405-.084-3.405-.084s-5.399-.27-5.987-.324c-.187-.011-.401-.032-.648-.032zm.354 1.832h.111s.271 2.269.6 3.597C5.549 11.147 6.22 13 6.22 13s-.996-.119-1.641-.348c-.99-.324-1.409-.714-1.409-.714s-.73-.511-1.096-1.52C1.444 8.73 2.021 7.7 2.021 7.7s.32-.859 1.47-1.145c.395-.106.863-.12 1.072-.12zm8.33 2.554c.26.003.509.127.509.127l.868.422-.529 1.075a.686.686 0 0 0-.614.359.685.685 0 0 0 .072.756l-.939 1.924a.69.69 0 0 0-.66.527.687.687 0 0 0 .347.763.686.686 0 0 0 .867-.206.688.688 0 0 0-.069-.882l.916-1.874a.667.667 0 0 0 .237-.02.657.657 0 0 0 .271-.137 8.826 8.826 0 0 1 1.016.512.761.761 0 0 1 .286.282c.073.21-.073.569-.073.569-.087.29-.702 1.55-.702 1.55a.692.692 0 0 0-.676.477.681.681 0 1 0 1.157-.252c.073-.141.141-.282.214-.431.19-.397.515-1.16.515-1.16.035-.066.218-.394.103-.814-.095-.435-.48-.638-.48-.638-.467-.301-1.116-.58-1.116-.58s0-.156-.042-.27a.688.688 0 0 0-.148-.241l.516-1.062 2.89 1.401s.48.218.583.619c.073.282-.019.534-.069.657-.24.587-2.1 4.317-2.1 4.317s-.232.554-.748.588a1.065 1.065 0 0 1-.393-.045l-.202-.08-4.31-2.1s-.417-.218-.49-.596c-.083-.31.104-.691.104-.691l2.073-4.272s.183-.37.466-.497a.855.855 0 0 1 .35-.077z',
  },
] as const;

const HashField: React.FC<{frame: number; out: number}> = ({frame, out}) => {
  const fieldOpacity = 1 - out;
  const railIn = tween(frame, introBeats.scan, introBeats.scan + 28, eases.power4Out);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 110,
          width: 2,
          height: 720,
          background: `linear-gradient(180deg, transparent, ${C.grid}, ${C.main}, ${C.grid}, transparent)`,
          opacity: fieldOpacity * railIn * 0.56,
          transform: `scaleY(${between(frame, 0.4, 1, introBeats.scan, introBeats.scan + 30, eases.power4Out)})`,
          transformOrigin: 'top',
        }}
      />

      {fieldStreams.map((stream, idx) => {
        const enterStart = stagger(introBeats.scan + 4, idx, 5);
        const enter = tween(frame, enterStart, enterStart + 24, eases.power4Out);
        const pulseIn = pulse(frame, enterStart + 12, enterStart + 42);
        const drift = Math.sin((frame + idx * 19) / 42) * 8;
        const lineWidth = interpolate(enter, [0, 1], [0, stream.width]);
        const x = 112 + drift;

        return (
          <div key={stream.hash}>
            <div
              style={{
                position: 'absolute',
                left: 78,
                top: stream.y - 3,
                width: 8 + pulseIn * 5,
                height: 8 + pulseIn * 5,
                borderRadius: 999,
                background: stream.color,
                opacity: fieldOpacity * enter * 0.64,
                boxShadow: `0 0 ${12 + pulseIn * 16}px ${stream.color}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 96,
                top: stream.y,
                width: lineWidth,
                height: 1,
                background: `linear-gradient(90deg, ${stream.color}, transparent)`,
                opacity: fieldOpacity * enter * 0.48,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x,
                top: stream.y - 26,
                fontFamily: FONT.mono,
                fontSize: 16,
                fontWeight: WEIGHT.bold,
                letterSpacing: 1.6,
                color: stream.color,
                opacity: fieldOpacity * enter * 0.24,
                transform: `translateX(${between(frame, -22, 0, enterStart, enterStart + 24, eases.power4Out)}px)`,
              }}
            >
              {stream.hash}
            </div>
          </div>
        );
      })}

      {fieldDust.map((item, idx) => {
        const enterStart = stagger(introBeats.scan + 10, idx, 7);
        const enter = tween(frame, enterStart, enterStart + 28, eases.power4Out);
        return (
          <div
            key={item.text}
            style={{
              position: 'absolute',
              left: item.x + Math.sin((frame + idx * 23) / 48) * 12,
              top: item.y + Math.cos((frame + idx * 17) / 56) * 10,
              fontFamily: FONT.mono,
              fontSize: item.size,
              fontWeight: WEIGHT.bold,
              color: item.color,
              opacity: fieldOpacity * enter * 0.13,
              transform: `translateY(${between(frame, 14, 0, enterStart, enterStart + 28, eases.power4Out)}px)`,
            }}
          >
            {item.text}
          </div>
        );
      })}
    </>
  );
};

const EcosystemOrbit: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => {
  const git = logos[0];
  const platforms = logos.slice(1);
  const core = {x: 1540, y: 238};
  const platformPoints = [
    {x: 1400, y: 166},
    {x: 1660, y: 154},
    {x: 1754, y: 292},
  ];
  const coreIn = tween(frame, introBeats.ecosystem, introBeats.ecosystem + 28, eases.backOut);
  const linkIn = tween(frame, introBeats.ecosystem + 10, introBeats.ecosystem + 44, eases.power4Out);
  const orbitIn = tween(frame, introBeats.ecosystem + 8, introBeats.ecosystem + 40, eases.circOut);
  const sharedPulse = tween(frame, introBeats.ecosystem + 24, introBeats.ecosystem + 60, eases.power4Out);

  return (
    <g opacity={opacity}>
      <circle
        cx={core.x}
        cy={core.y}
        r="172"
        fill="none"
        stroke={C.grid}
        strokeWidth="2"
        strokeDasharray="8 15"
        strokeDashoffset={interpolate(orbitIn, [0, 1], [420, 0])}
        opacity={0.62 * orbitIn}
      />
      <path
        d="M1400 166 C1490 96 1608 98 1660 154 C1724 210 1754 292 1754 292"
        fill="none"
        stroke={C.head}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="390"
        strokeDashoffset={interpolate(sharedPulse, [0, 1], [390, 0])}
        opacity={0.5 * sharedPulse * (1 - r(frame, introBeats.title - 8, introBeats.title + 6))}
      />
      <line
        x1={core.x}
        y1={core.y + 46}
        x2={1540}
        y2={interpolate(linkIn, [0, 1], [core.y + 46, 370])}
        stroke={C.head}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={0.38 * linkIn}
      />
      <circle
        cx={1540}
        cy={370}
        r={interpolate(coreIn, [0, 1], [0, 38])}
        fill="none"
        stroke={C.head}
        strokeWidth="2.4"
        opacity={0.14 * (1 - r(frame, introBeats.ecosystem + 42, introBeats.title))}
      />
      {platforms.map((logo, idx) => {
        const pt = platformPoints[idx];
        const logoStart = stagger(introBeats.ecosystem + 16, idx, 6);
        const syncStart = stagger(introBeats.ecosystem + 24, idx, 4);
        const returnStart = stagger(introBeats.ecosystem + 44, idx, 3);
        const logoIn = tween(frame, logoStart, logoStart + 28, eases.backOut);
        const syncOut = tween(frame, syncStart, syncStart + 16, eases.power4Out);
        const syncBack = tween(frame, returnStart, returnStart + 16, eases.power4Out);
        const drift = Math.sin((frame + idx * 13) / 18) * 5;
        const distance = Math.hypot(pt.x - core.x, pt.y - core.y);
        const outbound = {
          x: interpolate(syncOut, [0, 1], [core.x, pt.x]),
          y: interpolate(syncOut, [0, 1], [core.y, pt.y + drift]),
        };
        const inbound = {
          x: interpolate(syncBack, [0, 1], [pt.x, core.x]),
          y: interpolate(syncBack, [0, 1], [pt.y + drift, core.y]),
        };
        return (
          <g key={logo.label} opacity={logoIn}>
            <line
              x1={core.x}
              y1={core.y}
              x2={interpolate(logoIn, [0, 1], [core.x, pt.x])}
              y2={interpolate(logoIn, [0, 1], [core.y, pt.y + drift])}
              stroke={C.grid}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${distance * 0.62} ${distance}`}
              strokeDashoffset={interpolate(syncOut, [0, 1], [distance, 0])}
              opacity="0.7"
            />
            <line
              x1={pt.x}
              y1={pt.y + drift}
              x2={interpolate(syncBack, [0, 1], [pt.x, core.x])}
              y2={interpolate(syncBack, [0, 1], [pt.y + drift, core.y])}
              stroke={logo.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 8"
              opacity={0.36 * syncBack}
            />
            <circle
              cx={outbound.x}
              cy={outbound.y}
              r={interpolate(syncOut, [0, 0.5, 1], [0, 5.5, 2.5])}
              fill={logo.color}
              opacity={pulse(frame, syncStart, syncStart + 16) * 0.92}
            />
            <circle
              cx={inbound.x}
              cy={inbound.y}
              r={interpolate(syncBack, [0, 0.5, 1], [0, 4, 1.5])}
              fill={C.head}
              opacity={pulse(frame, returnStart, returnStart + 16) * 0.74}
            />
            <g
              transform={`translate(${pt.x} ${pt.y + drift}) scale(${
                interpolate(logoIn, [0, 1], [0.52, 1]) *
                (1 + pulse(frame, introBeats.ecosystem + 38 + idx * 3, introBeats.ecosystem + 58 + idx * 3) * 0.08)
              })`}
            >
              <rect
                x="-34"
                y="-34"
                width="68"
                height="68"
                rx="14"
                fill="rgba(255,255,255,0.78)"
                stroke={interpolate(syncOut, [0, 1], [0, 1]) > 0.92 ? logo.color : C.grid}
                strokeWidth={interpolate(syncOut, [0, 1], [1, 2])}
                filter="url(#zajnoIntroShadow)"
              />
              <g transform="translate(-19 -19) scale(1.58)">
                <path d={logo.path} fill={logo.color} opacity="0.9" />
              </g>
            </g>
          </g>
        );
      })}
      <g transform={`translate(${core.x} ${core.y}) scale(${interpolate(coreIn, [0, 1], [0.62, 1])})`}>
        <rect
          x="-48"
          y="-48"
          width="96"
          height="96"
          rx="18"
          fill="rgba(255,255,255,0.9)"
          stroke={C.head}
          strokeWidth="2"
          filter="url(#zajnoIntroGlow)"
        />
        <g transform="translate(-25 -25) scale(2.08)">
          <path d={git.path} fill={git.color} />
        </g>
        <text
          x="0"
          y="72"
          textAnchor="middle"
          fontFamily={FONT.mono}
          fontSize="17"
          fontWeight={WEIGHT.bold}
          fill={C.head}
          opacity={coreIn}
        >
          GIT CORE
        </text>
      </g>
    </g>
  );
};

const RefPathSignal: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => {
  const signalIn = tween(frame, introBeats.focus + 4, introBeats.focus + 24, eases.power4Out);
  const pathIn = tween(frame, introBeats.focus + 12, introBeats.focus + 34, eases.circOut);
  const commitPing = pulse(frame, introBeats.focus + 24, introBeats.focus + 44);
  const labelY = between(frame, 636, 616, introBeats.focus + 4, introBeats.focus + 24, eases.power4Out);

  return (
    <g opacity={opacity * signalIn}>
      <path
        d="M1272 616 C1372 570 1468 540 1540 430"
        fill="none"
        stroke={C.head}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="310"
        strokeDashoffset={between(frame, 310, 0, introBeats.focus + 12, introBeats.focus + 34, eases.circOut)}
        opacity={0.58}
      />
      <circle
        cx={1540}
        cy={430}
        r={18 + commitPing * 18}
        fill="none"
        stroke={C.head}
        strokeWidth="3"
        opacity={0.28 * commitPing}
      />
      <g transform={`translate(1024 ${labelY})`}>
        <rect
          x="0"
          y="0"
          width="258"
          height="58"
          rx="13"
          fill="rgba(255,255,255,0.84)"
          stroke={C.grid}
          filter="url(#zajnoIntroShadow)"
        />
        <text x="20" y="36" fontFamily={FONT.mono} fontSize="18" fontWeight={WEIGHT.bold} fill={C.head}>
          HEAD
        </text>
        <text x="82" y="36" fontFamily={FONT.mono} fontSize="18" fontWeight={WEIGHT.bold} fill={C.muted}>
          -&gt; refs/heads/main
        </text>
      </g>
      <line
        x1="1278"
        y1={labelY + 29}
        x2={between(frame, 1278, 1376, introBeats.focus + 18, introBeats.focus + 34, eases.power4Out)}
        y2={between(frame, labelY + 29, 574, introBeats.focus + 18, introBeats.focus + 34, eases.power4Out)}
        stroke={C.head}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.48 * pathIn}
      />
    </g>
  );
};

export const RefLightboxIntro: React.FC<{
  seriesTitle?: string;
}> = ({
  seriesTitle = '看得见的 Git',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const snap = tween(frame, introBeats.boot, introBeats.boot + 10, eases.expoOut);
  const scan = tween(frame, introBeats.scan, introBeats.scan + 26, eases.circOut);
  const fieldOut = tween(frame, introBeats.graph - 2, introBeats.graph + 24, eases.expoOut);
  const gather = tween(frame, introBeats.field, introBeats.graph + 22, eases.power4InOut);
  const mapIn = tween(frame, introBeats.graph, introBeats.graph + 48, eases.power4Out);
  const zoom = tween(frame, introBeats.focus, introBeats.focus + 34, eases.power4InOut);
  const morph = tween(frame, introBeats.morph, introBeats.morph + 38, eases.power4InOut);
  const brandIn = tween(frame, introBeats.brand, introBeats.brand + 34, eases.power4Out);
  const titleIn = tween(frame, introBeats.title, introBeats.title + 32, eases.expoOut);
  const lock = spring({
    frame: Math.max(0, frame - 134),
    fps,
    config: {damping: 18, stiffness: 105, mass: 0.9},
  });

  const point = (node: (typeof nodes)[number]) => {
    const x = interpolate(gather, [0, 1], [node.x, node.tx]);
    const y = interpolate(gather, [0, 1], [node.y, node.ty]);
    const zx = interpolate(zoom, [0, 1], [x, node.id === 'head' ? 1110 : 1020 + (node.tx - 960) * 0.22]);
    const zy = interpolate(zoom, [0, 1], [y, node.id === 'head' ? 386 : 440 + (node.ty - 520) * 0.22]);
    const target =
      node.id === 'commit' || node.id === 'work'
        ? {x: 516, y: 604}
        : node.id === 'tree' || node.id === 'index' || node.id === 'head'
          ? {x: 908, y: 604}
          : {x: 1256, y: 604};
    return {
      x: interpolate(morph, [0, 1], [zx, target.x]),
      y: interpolate(morph, [0, 1], [zy, target.y]),
    };
  };

  const diagramExit = tween(frame, introBeats.title + 8, introBeats.title + 34, eases.power4Out);
  const diagramOpacity = (1 - diagramExit) * (0.22 + mapIn * 0.78);
  const titleX = interpolate(titleIn, [0, 1], [-42, 0]);
  const markScale = interpolate(lock, [0, 1], [0.66, 1]);
  const snapLineX = interpolate(snap, [0, 1], [-160, 2080]);
  const openField = tween(frame, introBeats.scan, introBeats.scan + 12, eases.expoOut);
  const bootDepth = interpolate(frame, [8, 26, 64], [0.16, 0.1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoOpacity =
    tween(frame, introBeats.ecosystem, introBeats.ecosystem + 34, eases.power4Out) *
    (1 - tween(frame, introBeats.brand + 2, introBeats.title + 6, eases.power4Out));
  const refSignalOpacity =
    tween(frame, introBeats.focus + 4, introBeats.focus + 24, eases.power4Out) *
    (1 - tween(frame, introBeats.brand - 6, introBeats.title, eases.power4Out));
  const titleQuiet = tween(frame, introBeats.title - 8, introBeats.title + 22, eases.power4Out);
  const titleDetail = tween(frame, introBeats.title + 14, introBeats.title + 38, eases.power4Out);
  const bgFloat = Math.sin(frame / 58) * 1.2;

  return (
    <AbsoluteFill style={{background: C.bg, color: C.ink, fontFamily: FONT.sans, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: C.ink,
          opacity: interpolate(frame, [0, 4, 12], [1, 0.86, 0]),
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: snapLineX,
          top: 0,
          width: 3,
          height: '100%',
          background: C.head,
          boxShadow: `0 0 28px ${C.glow}`,
          opacity: interpolate(frame, [0, 3, 14], [0, 1, 0]),
          zIndex: 21,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at ${58 + bgFloat}% 39%, rgba(31,104,105,0.15), transparent 32%),
            radial-gradient(circle at 86% 72%, rgba(185,135,35,0.12), transparent 30%),
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.78), transparent 34%),
            linear-gradient(125deg, ${C.bgCool} 0%, ${C.bg} 46%, #fffdf8 100%)
          `,
          clipPath: `inset(${interpolate(openField, [0, 1], [48, 0])}% 0 ${interpolate(openField, [0, 1], [48, 0])}% 0)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(255,255,255,0.52), transparent 32%, rgba(255,250,241,0.36) 100%),
            radial-gradient(ellipse at 46% 46%, rgba(255,255,255,0.68), transparent 44%)
          `,
          opacity: 0.28 + titleQuiet * 0.3,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg, rgba(23,33,31,0.13), transparent 26%, transparent 72%, rgba(23,33,31,0.08)),
            radial-gradient(circle at 54% 46%, transparent 0%, transparent 50%, rgba(23,33,31,0.1) 100%)
          `,
          opacity: bootDepth,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: '66px 66px',
          opacity:
            0.14 * (1 - brandIn * 0.74) * (1 - titleQuiet * 0.7) +
            pulse(frame, introBeats.scan + 1, introBeats.scan + 12) * 0.13,
          transform: `translate(${interpolate(scan, [0, 1], [-30, 0])}px, 0)`,
          maskImage: 'radial-gradient(circle at 48% 44%, black 0%, black 58%, transparent 92%)',
        }}
      />
      <HashField frame={frame} out={fieldOut} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 134,
          height: '100%',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.38), ${C.head}, rgba(255,255,255,0.34), transparent)`,
          opacity: interpolate(scan, [0, 0.12, 0.72, 1], [0, 1, 0.5, 0]),
          transform: `translateX(${interpolate(scan, [0, 1], [-360, 2100])}px) skewX(-13deg)`,
          boxShadow: `0 0 42px ${C.glow}`,
        }}
      />

      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="zajnoIntroShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="20" stdDeviation="26" floodColor={C.shadow} />
          </filter>
          <filter id="zajnoIntroGlow" x="-90%" y="-90%" width="280%" height="280%">
            <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor={C.glow} />
          </filter>
          <linearGradient
            id="gitTitleGradient"
            x1={interpolate(titleDetail, [0, 1], [520, 640])}
            y1="300"
            x2={interpolate(titleDetail, [0, 1], [710, 860])}
            y2="352"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={C.ink} />
            <stop offset="42%" stopColor={C.main} />
            <stop offset="72%" stopColor={C.head} />
            <stop offset="100%" stopColor={C.ink} />
          </linearGradient>
          <clipPath id="titleReveal">
            <rect x={356} y={210} width={interpolate(titleIn, [0, 1], [0, 1220])} height="560" />
          </clipPath>
          <clipPath id="titleGitClip">
            <text x="1002" y="426" fontFamily={FONT.brand} fontSize="178" fontWeight={WEIGHT.black}>
              Git
            </text>
          </clipPath>
        </defs>

        <g opacity={titleDetail * 0.32}>
          <path d="M350 696 H1578" stroke={C.grid} strokeWidth="2" strokeLinecap="round" opacity="0.38" />
          <path d="M444 748 H1486" stroke={C.grid} strokeWidth="1.5" strokeLinecap="round" opacity="0.22" />
          <path d="M358 310 V394 M1566 310 V394 M358 628 V716 M1566 628 V716" stroke={C.grid} strokeWidth="2" strokeLinecap="round" opacity="0.34" />
          <path d="M358 310 H506 M1418 310 H1566 M358 716 H506 M1418 716 H1566" stroke={C.grid} strokeWidth="2" strokeLinecap="round" opacity="0.36" />
        </g>

        <g opacity={diagramOpacity}>
          {edges.map(([from, to], idx) => {
            const a = point(nodeMap[from]);
            const b = point(nodeMap[to]);
            const lineStart = stagger(introBeats.field + 20, idx, 4);
            const lineIn = tween(frame, lineStart, lineStart + 38, eases.power4Out);
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={C.line}
                strokeWidth={interpolate(morph, [0, 1], [interpolate(zoom, [0, 1], [5, 3]), 7])}
                strokeLinecap="round"
                strokeDasharray="720"
                strokeDashoffset={720 * (1 - lineIn)}
                opacity={(0.25 + lineIn * 0.64) * (1 - morph * 0.22)}
              />
            );
          })}

          <g opacity={mapIn * (1 - zoom)}>
            <line x1="76" y1="346" x2="76" y2="738" stroke={C.grid} strokeWidth="3" strokeLinecap="round" />
          </g>
          {[
            {x: 118, y: 314, label: 'file layer', icon: 'file', color: C.ink},
            {x: 118, y: 470, label: 'object layer', icon: 'object', color: C.main},
            {x: 118, y: 626, label: 'pointer layer', icon: 'pointer', color: C.head},
          ].map((panel, idx) => {
            const railStart = stagger(introBeats.rail, idx, 7);
            const railIn = tween(frame, railStart, railStart + 32, eases.power4Out);
            const cx = panel.x + 48;
            const cy = panel.y + 44;
            return (
            <g
              key={panel.label}
              opacity={mapIn * railIn * (1 - zoom)}
              transform={`translate(${interpolate(railIn, [0, 1], [-24, 0])} 0)`}
            >
              <rect
                x={panel.x}
                y={panel.y}
                width="96"
                height="88"
                rx="14"
                fill={C.panelStrong}
                stroke={C.grid}
                filter="url(#zajnoIntroShadow)"
              />
              <circle cx="76" cy={panel.y + 48} r="9" fill={panel.color} />
              <line
                x1="76"
                y1={panel.y + 48}
                x2={interpolate(railIn, [0, 1], [76, panel.x])}
                y2={panel.y + 48}
                stroke={panel.color}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              {panel.icon === 'file' ? (
                <g fill="none" stroke={panel.color} strokeLinecap="round" strokeLinejoin="round" opacity="0.82">
                  <path d={`M${cx - 15} ${cy - 21} H${cx + 9} L${cx + 18} ${cy - 12} V${cy + 22} H${cx - 15} Z`} strokeWidth="3" />
                  <path d={`M${cx + 9} ${cy - 21} V${cy - 12} H${cx + 18}`} strokeWidth="2.4" />
                  <path d={`M${cx - 6} ${cy - 1} H${cx + 7} M${cx - 6} ${cy + 10} H${cx + 11}`} strokeWidth="2.2" opacity="0.52" />
                </g>
              ) : null}
              {panel.icon === 'object' ? (
                <g fill="none" stroke={panel.color} strokeLinecap="round" opacity="0.82">
                  <circle cx={cx} cy={cy} r="22" strokeWidth="3" />
                  <circle cx={cx} cy={cy} r="10" strokeWidth="2.6" opacity="0.58" />
                  <path d={`M${cx - 28} ${cy + 20} C${cx - 8} ${cy + 34} ${cx + 16} ${cy + 34} ${cx + 34} ${cy + 15}`} strokeWidth="2.1" opacity="0.34" />
                </g>
              ) : null}
              {panel.icon === 'pointer' ? (
                <g fill="none" stroke={panel.color} strokeLinecap="round" strokeLinejoin="round" opacity="0.82">
                  <path d={`M${cx - 26} ${cy + 14} C${cx - 4} ${cy - 14} ${cx + 12} ${cy - 16} ${cx + 27} ${cy - 2}`} strokeWidth="3" />
                  <path d={`M${cx + 17} ${cy - 4} L${cx + 28} ${cy - 1} L${cx + 23} ${cy + 9}`} strokeWidth="3" />
                  <circle cx={cx - 27} cy={cy + 14} r="5" fill={panel.color} stroke="none" />
                </g>
              ) : null}
            </g>
            );
          })}

          {nodes.map((node, idx) => {
            const nodeStart = stagger(introBeats.scan + 8, idx, 4);
            const lockStart = stagger(introBeats.field + 22, idx, 3);
            const labelStart = stagger(introBeats.graph - 2, idx, 2);
            const nodeIn = tween(frame, nodeStart, nodeStart + 30, eases.backOut);
            const pos = point(node);
            const lockPulse = pulse(frame, lockStart, lockStart + 12);
            const nodeScale =
              interpolate(nodeIn, [0, 1], [0.54, 1]) *
              interpolate(zoom, [0, 1], [1, node.id === 'head' ? 2.45 : 0.72]) *
              interpolate(morph, [0, 1], [1, node.id === 'head' ? 0.68 : 0.9]) *
              (1 + lockPulse * 0.055);
            const labelOpacity = tween(frame, labelStart, labelStart + 28, eases.power4Out) * (1 - zoom);
            return (
              <g key={node.id} transform={`translate(${pos.x} ${pos.y}) scale(${nodeScale})`} opacity={nodeIn}>
                <circle
                  r={node.r + lockPulse * 8 + (node.id === 'head' ? 8 * Math.sin(frame / 5) * Math.sin(frame / 5) : 0)}
                  fill={C.panel}
                  stroke={node.color}
                  strokeWidth={node.id === 'head' ? 5 : 4}
                  filter={node.id === 'head' ? 'url(#zajnoIntroGlow)' : 'url(#zajnoIntroShadow)'}
                />
                <circle r={Math.max(5, node.r * 0.26)} fill={node.color} />
                <text
                  y={node.r + 36}
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
          <RefPathSignal frame={frame} opacity={refSignalOpacity * (1 - morph * 0.55)} />
          <EcosystemOrbit frame={frame} opacity={logoOpacity * (1 - zoom * 0.34)} />
        </g>

        <g clipPath="url(#titleReveal)" opacity={titleIn} transform={`translate(${titleX} 0)`}>
          <text x="470" y="400" fontFamily={FONT.brand} fontSize="108" fontWeight={WEIGHT.black} fill={C.ink}>
            看得见的
          </text>
          <text
            x="1002"
            y="426"
            fontFamily={FONT.brand}
            fontSize="178"
            fontWeight={WEIGHT.black}
            fill={C.ink}
            stroke={C.head}
            strokeWidth={interpolate(titleDetail, [0, 1], [0, 1.2])}
            paintOrder="stroke fill"
            filter="url(#zajnoIntroShadow)"
          >
            Git
          </text>
          <g clipPath="url(#titleGitClip)" opacity={titleDetail}>
            <path
              d="M980 370 C1044 328 1126 330 1196 374 C1248 406 1280 404 1322 376"
              fill="none"
              stroke={C.head}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="390"
              strokeDashoffset={interpolate(titleDetail, [0, 1], [390, 0])}
              opacity="0.72"
              filter="url(#zajnoIntroGlow)"
            />
            <path
              d="M1010 410 C1084 374 1164 378 1258 420"
              fill="none"
              stroke={C.main}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeDasharray="290"
              strokeDashoffset={interpolate(titleDetail, [0, 1], [290, 0])}
              opacity="0.54"
            />
          </g>
          <g opacity={titleDetail}>
            <circle cx="1168" cy="288" r="25" fill={C.bg} opacity={titleDetail} />
            <circle
              cx="1168"
              cy="288"
              r={interpolate(titleDetail, [0, 1], [0, 22])}
              fill={C.bg}
              stroke={C.head}
              strokeWidth="4"
              filter="url(#zajnoIntroGlow)"
            />
            <circle cx="1168" cy="288" r={interpolate(titleDetail, [0, 1], [0, 8.4])} fill={C.head} />
          </g>
          <g opacity={titleDetail}>
            <text x="420" y="614" fontFamily={FONT.mono} fontSize="24" fontWeight={WEIGHT.bold} fill={C.head}>
              hash
            </text>
            <g>
              <line
                x1="516"
                y1="604"
                x2={interpolate(titleDetail, [0, 1], [516, 1256])}
                y2="604"
                stroke={C.line}
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.82"
              />
              <path
                d="M516 604 C672 512 1092 512 1256 604"
                fill="none"
                stroke={C.grid}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="860"
                strokeDashoffset={interpolate(titleDetail, [0, 1], [860, 0])}
                opacity="0.62"
              />
              {[
                {x: 516, y: 604, color: C.ink, r: 21},
                {x: 908, y: 604, color: C.head, r: 28},
                {x: 1256, y: 604, color: C.main, r: 21},
              ].map((node, idx) => {
                const nodeIn = tween(frame, introBeats.title + 16 + idx * 3, introBeats.title + 32 + idx * 3, eases.backOut);
                const nodePulse = pulse(frame, introBeats.title + 24 + idx * 4, introBeats.title + 48 + idx * 4);
                return (
                  <g key={`${node.x}-${node.y}`} transform={`translate(${node.x} ${node.y}) scale(${nodeIn})`}>
                    {idx === 1 ? (
                      <circle
                        r={node.r + 10 + nodePulse * 6}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="1.8"
                        opacity={0.2 * titleDetail}
                      />
                    ) : null}
                    <circle
                      r={node.r + nodePulse * 2.5}
                      fill={C.bg}
                      stroke={node.color}
                      strokeWidth={idx === 1 ? 7 : 5.4}
                      filter={idx === 1 ? 'url(#zajnoIntroGlow)' : undefined}
                    />
                    <circle r={idx === 1 ? 8 : 5.2} fill={node.color} />
                  </g>
                );
              })}
            </g>
            <text x="1304" y="614" fontFamily={FONT.mono} fontSize="24" fontWeight={WEIGHT.bold} fill={C.main}>
              graph
            </text>
          </g>
        </g>
      </svg>

    </AbsoluteFill>
  );
};
