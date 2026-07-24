import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLOR} from '../../palette';
import {RADIUS, SPACE} from '../../spacing';
import {TYPE} from '../../typography';
import {GitHubMark, GitHubPlatformGlyph, type GitHubPlatformGlyphName} from '../brand/BrandPrimitives';

type PlatformStateItem = {
  title: string;
  glyph: GitHubPlatformGlyphName;
  side: 'left' | 'right';
  top: number;
};

const ITEMS: readonly PlatformStateItem[] = [
  {title: 'Issue', glyph: 'issues', side: 'left', top: 44},
  {title: 'Pull Request', glyph: 'pull-request', side: 'right', top: 44},
  {title: 'Review', glyph: 'review', side: 'left', top: 318},
  {title: 'Checks', glyph: 'actions', side: 'right', top: 318},
];

const CONNECTIONS = [
  {x1: 480, y1: 198, x2: 376, y2: 132},
  {x1: 840, y1: 198, x2: 944, y2: 132},
  {x1: 480, y1: 294, x2: 376, y2: 402},
  {x1: 840, y1: 294, x2: 944, y2: 402},
] as const;

const ORBIT_ICON_SIZE = 76;
const ORBIT_GLYPH_SIZE = 36;

export const PlatformStateLegend: React.FC<{revealFromFrame?: number}> = ({revealFromFrame = 0}) => {
  const frame = useCurrentFrame();
  const hubIn = interpolate(frame, [revealFromFrame, revealFromFrame + 22], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const relationIn = interpolate(frame, [revealFromFrame + 18, revealFromFrame + 52], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div data-audit-id="github-platform-orbit" style={{position: 'relative', width: 1320, height: 520, margin: '0 auto'}}>
      <svg aria-hidden viewBox="0 0 1320 520" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
        {CONNECTIONS.map((line, index) => (
          <line
            key={`${line.x1}-${line.y1}`}
            {...line}
            pathLength={1}
            stroke={index === 1 ? COLOR.github.action : COLOR.stroke.default}
            strokeWidth={2}
            strokeDasharray={1}
            strokeDashoffset={1 - relationIn}
          />
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 480,
          top: 156,
          width: 360,
          minHeight: 180,
          boxSizing: 'border-box',
          padding: `${SPACE.xl}px ${SPACE.xxl}px`,
          border: `1px solid ${COLOR.stroke.default}`,
          borderRadius: RADIUS.panel,
          background: COLOR.canvas.raised,
          boxShadow: `0 16px 42px ${COLOR.effects.shadowSoft}`,
          opacity: hubIn,
          scale: 0.92 + hubIn * 0.08,
          display: 'flex',
          alignItems: 'center',
          gap: SPACE.lg,
        }}
      >
        <GitHubMark size={56} />
        <div>
          <div style={TYPE.section}>Repository</div>
          <div style={{...TYPE.code, color: COLOR.text.secondary, marginTop: SPACE.sm}}>commits · refs</div>
        </div>
      </div>

      {ITEMS.map((item, index) => {
        const itemIn = interpolate(
          frame,
          [revealFromFrame + 48 + index * 24, revealFromFrame + 68 + index * 24],
          [0, 1],
          {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          },
        );
        const isLeft = item.side === 'left';
        return (
          <div
            key={item.title}
            style={{
              position: 'absolute',
              top: item.top,
              left: isLeft ? 0 : undefined,
              right: isLeft ? undefined : 0,
              width: 360,
              display: 'flex',
              alignItems: 'center',
              flexDirection: isLeft ? 'row' : 'row-reverse',
              gap: SPACE.md,
              textAlign: isLeft ? 'left' : 'right',
              opacity: itemIn,
              translate: `${(1 - itemIn) * (isLeft ? 22 : -22)}px 0`,
            }}
          >
            <div
              style={{
                width: ORBIT_ICON_SIZE,
                height: ORBIT_ICON_SIZE,
                boxSizing: 'border-box',
                borderRadius: RADIUS.pill,
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
                border: `2px solid ${item.title === 'Pull Request' ? COLOR.github.action : COLOR.stroke.default}`,
                background: item.title === 'Pull Request' ? COLOR.effects.actionWash : COLOR.canvas.raised,
                color: item.title === 'Pull Request' ? COLOR.github.action : COLOR.text.primary,
              }}
            >
              <GitHubPlatformGlyph name={item.glyph} size={ORBIT_GLYPH_SIZE} />
            </div>
            <div style={TYPE.section}>{item.title}</div>
          </div>
        );
      })}
    </div>
  );
};
