import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CharacterSprite, getDirectionLabel} from '../../components/CharacterSprite';
import {C, MONO, SANS, SERIF} from '../../theme';
import {CHARACTER_NAME, DIRECTIONS, POSES} from './assets';
import {DURATION_IN_FRAMES} from './timeline';

const pathPoints = [
  {x: 1080, y: 650, direction: 's'},
  {x: 910, y: 780, direction: 'sw'},
  {x: 700, y: 710, direction: 'w'},
  {x: 580, y: 500, direction: 'nw'},
  {x: 760, y: 330, direction: 'n'},
  {x: 1040, y: 330, direction: 'ne'},
  {x: 1230, y: 510, direction: 'e'},
  {x: 1190, y: 710, direction: 'se'},
] as const;

const getActiveIndex = (frame: number) => {
  const span = DURATION_IN_FRAMES / DIRECTIONS.length;
  return Math.min(DIRECTIONS.length - 1, Math.floor(frame / span));
};

const Track: React.FC<{activeIndex: number}> = ({activeIndex}) => (
  <svg
    width="760"
    height="560"
    viewBox="0 0 760 560"
    style={{position: 'absolute', left: 570, top: 260, overflow: 'visible'}}
  >
    <path
      d="M510 390 L340 520 L130 450 L10 240 L190 70 L470 70 L660 250 L620 450 Z"
      fill="none"
      stroke="rgba(143,189,182,0.34)"
      strokeWidth="3"
      strokeDasharray="10 12"
    />
    {pathPoints.map((point, index) => (
      <g key={point.direction} transform={`translate(${point.x - 570} ${point.y - 260})`}>
        <circle
          r={index === activeIndex ? 18 : 10}
          fill={index === activeIndex ? C.terracotta : C.cyan}
          opacity={index === activeIndex ? 1 : 0.58}
        />
        <text
          x="0"
          y="-28"
          textAnchor="middle"
          style={{
            fontFamily: MONO,
            fontSize: 19,
            fill: index === activeIndex ? C.white : C.dim,
          }}
        >
          {getDirectionLabel(point.direction)}
        </text>
      </g>
    ))}
  </svg>
);

const DirectionStrip: React.FC<{activeIndex: number}> = ({activeIndex}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      right: 120,
      bottom: 80,
      display: 'grid',
      gridTemplateColumns: `repeat(${DIRECTIONS.length}, 1fr)`,
      gap: 14,
    }}
  >
    {DIRECTIONS.map((direction, index) => (
      <div
        key={direction}
        style={{
          height: 72,
          borderRadius: 8,
          border:
            index === activeIndex
              ? `2px solid ${C.terracotta}`
              : '1px solid rgba(250,249,245,0.12)',
          background: index === activeIndex ? 'rgba(224,133,96,0.16)' : 'rgba(250,249,245,0.055)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 26,
          color: index === activeIndex ? C.white : C.dim,
        }}
      >
        {getDirectionLabel(direction)}
      </div>
    ))}
  </div>
);

export const CharacterDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = getActiveIndex(frame);
  const direction = DIRECTIONS[activeIndex];
  const pose = POSES[direction];
  const bob = Math.sin(frame / 5) * 9;

  return (
    <AbsoluteFill style={{background: C.bg0}}>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(250,249,245,0.04) 1px, transparent 1px),' +
            'linear-gradient(0deg, rgba(250,249,245,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.42,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 104,
          top: 92,
          width: 560,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 23, color: C.terracotta}}>
          CHARACTER ASSET PROBE
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 80,
            lineHeight: 1.05,
            color: C.white,
            fontWeight: 700,
          }}
        >
          {CHARACTER_NAME}
        </div>
        <div style={{fontFamily: SANS, fontSize: 28, lineHeight: 1.45, color: C.dim}}>
          八方向素材接入 Remotion。当前方向：{getDirectionLabel(direction)}
        </div>
      </div>

      <Track activeIndex={activeIndex} />

      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 364 + bob,
          width: 380,
          height: 380,
          borderRadius: 8,
          background: 'rgba(250,249,245,0.08)',
          border: '1px solid rgba(250,249,245,0.14)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.34)',
          overflow: 'hidden',
        }}
      >
        <CharacterSprite pose={pose} size={380} />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 110,
          top: 114,
          width: 420,
          padding: '26px 28px',
          borderRadius: 8,
          border: '1px solid rgba(250,249,245,0.12)',
          background: 'rgba(21,21,21,0.72)',
          fontFamily: MONO,
          color: C.dim,
          fontSize: 22,
          lineHeight: 1.7,
        }}
      >
        <div style={{color: C.cyan}}>asset://characters/demo-guide</div>
        <div>direction: {direction}</div>
        <div>frame: {frame}</div>
        <div>source: mmx image generate</div>
      </div>

      <DirectionStrip activeIndex={activeIndex} />
    </AbsoluteFill>
  );
};
