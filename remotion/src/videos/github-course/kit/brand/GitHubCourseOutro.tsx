import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {
  BrandCanvas,
  GitHubBrandLockup,
  GitHubMark,
  GitHubPlatformGlyph,
  type GitHubPlatformGlyphName,
} from './BrandPrimitives';
import {enter, exit, settle} from './motion';

const OUTRO_FRAMES = 180;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

type CollaborationNode = {
  name: GitHubPlatformGlyphName;
  label: string;
  start: readonly [number, number];
  graph: readonly [number, number];
  color: string;
};

const NODES: readonly CollaborationNode[] = [
  {name: 'issues', label: 'ISSUE', start: [170, 218], graph: [492, 320], color: COLOR.github.action},
  {name: 'person', label: 'CONTRIBUTOR', start: [812, 188], graph: [744, 508], color: COLOR.text.secondary},
  {name: 'review', label: 'REVIEW', start: [1725, 236], graph: [1262, 320], color: COLOR.github.approved},
  {name: 'fork', label: 'FORK', start: [224, 858], graph: [520, 744], color: COLOR.text.secondary},
  {name: 'actions', label: 'ACTIONS', start: [1702, 830], graph: [1408, 676], color: COLOR.github.approved},
  {name: 'star', label: 'STAR', start: [1058, 948], graph: [1114, 784], color: COLOR.text.secondary},
];

const CENTER = {x: 960, y: 540};

const NetworkNode: React.FC<{
  node: CollaborationNode;
  index: number;
  frame: number;
  gather: number;
  collapse: number;
  opacity: number;
}> = ({node, index, frame, gather, collapse, opacity}) => {
  const nodeIn = enter(frame, index * 4, 16 + index * 4);
  const graphX = interpolate(gather, [0, 1], [node.start[0], node.graph[0]]);
  const graphY = interpolate(gather, [0, 1], [node.start[1], node.graph[1]]);
  const x = interpolate(collapse, [0, 1], [graphX, CENTER.x]);
  const y = interpolate(collapse, [0, 1], [graphY, CENTER.y]);
  const labelIn = enter(frame, 38 + index * 2, 52 + index * 2);

  return (
    <div
      data-audit-id={`github-outro-node-${node.label.toLowerCase()}`}
      style={{
        position: 'absolute',
        left: x - 43,
        top: y - 43,
        width: 86,
        height: 86,
        borderRadius: 20,
        display: 'grid',
        placeItems: 'center',
        color: node.color,
        background: 'rgba(255,255,255,0.93)',
        border: `1px solid ${node.color}42`,
        boxShadow: `0 18px 44px ${COLOR.effects.shadowPanel}`,
        opacity: nodeIn * opacity,
        scale: interpolate(nodeIn, [0, 1], [0.72, 1]) * interpolate(collapse, [0, 1], [1, 0.52]),
      }}
    >
      <GitHubPlatformGlyph name={node.name} size={35} />
      <div
        style={{
          position: 'absolute',
          top: 101,
          left: '50%',
          translate: '-50% 0',
          fontFamily: FONT.mono,
          fontSize: 15,
          fontWeight: WEIGHT.bold,
          letterSpacing: 1.2,
          whiteSpace: 'nowrap',
          color: node.color,
          opacity: labelIn * (1 - collapse),
        }}
      >
        {node.label}
      </div>
    </div>
  );
};

const CollaborationNetwork: React.FC<{frame: number}> = ({frame}) => {
  const gather = settle(frame, 18, 62);
  const collapse = settle(frame, 98, 126);
  const networkOut = exit(frame, 112, 132);
  const opacity = 1 - networkOut;

  return (
    <div data-audit-id="github-outro-collaboration-network" style={{position: 'absolute', inset: 0}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {NODES.map((node, index) => {
          const graphX = interpolate(gather, [0, 1], [node.start[0], node.graph[0]]);
          const graphY = interpolate(gather, [0, 1], [node.start[1], node.graph[1]]);
          const x = interpolate(collapse, [0, 1], [graphX, CENTER.x]);
          const y = interpolate(collapse, [0, 1], [graphY, CENTER.y]);
          const edgeIn = enter(frame, 28 + index * 3, 48 + index * 3);
          const pulse = interpolate(frame, [48 + index * 4, 78 + index * 4], [0, 1], clamp);
          return (
            <g key={node.label} opacity={opacity}>
              <line
                x1={x}
                y1={y}
                x2={CENTER.x}
                y2={CENTER.y}
                pathLength={1}
                stroke={node.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="1"
                strokeDashoffset={1 - edgeIn}
                opacity={0.16 + edgeIn * 0.32}
              />
              <circle
                cx={interpolate(pulse, [0, 1], [x, CENTER.x])}
                cy={interpolate(pulse, [0, 1], [y, CENTER.y])}
                r={interpolate(pulse, [0, 0.5, 1], [0, 6, 2])}
                fill={node.color}
                opacity={Math.sin(pulse * Math.PI) * 0.9 * (1 - collapse)}
              />
            </g>
          );
        })}
        <circle cx={CENTER.x} cy={CENTER.y} r={126 - collapse * 42} fill="none" stroke={COLOR.stroke.default} strokeWidth="1.5" strokeDasharray="7 12" opacity={enter(frame, 28, 48) * opacity * 0.42} />
        <circle cx={CENTER.x} cy={CENTER.y} r={82 - collapse * 20} fill="none" stroke={COLOR.github.action} strokeWidth="2" opacity={enter(frame, 32, 50) * opacity * 0.22} />
      </svg>

      {NODES.map((node, index) => (
        <NetworkNode key={node.label} node={node} index={index} frame={frame} gather={gather} collapse={collapse} opacity={opacity} />
      ))}
    </div>
  );
};

const CollaborationCore: React.FC<{frame: number}> = ({frame}) => {
  const coreIn = enter(frame, 20, 40);
  const prOut = exit(frame, 84, 102);
  const mergeIn = enter(frame, 88, 106);
  const mergeOut = exit(frame, 116, 132);
  const markIn = enter(frame, 112, 128);
  const coreOut = exit(frame, 128, 138);
  const mergeScale = interpolate(mergeIn, [0, 1], [0.72, 1]);

  return (
    <div data-audit-id="github-outro-collaboration-core" style={{position: 'absolute', inset: 0, opacity: 1 - coreOut}}>
      <div
        style={{
          position: 'absolute',
          left: CENTER.x,
          top: CENTER.y,
          width: 114,
          height: 114,
          borderRadius: 26,
          translate: '-50% -50%',
          display: 'grid',
          placeItems: 'center',
          color: COLOR.github.action,
          background: COLOR.canvas.raised,
          border: `2px solid ${COLOR.github.action}`,
          boxShadow: `0 0 48px ${COLOR.effects.actionWash}`,
          opacity: coreIn * (1 - prOut),
          scale: interpolate(coreIn, [0, 1], [0.76, 1]),
        }}
      >
        <GitHubPlatformGlyph name="pull-request" size={49} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x,
          top: CENTER.y,
          width: 122,
          height: 122,
          borderRadius: 999,
          translate: '-50% -50%',
          display: 'grid',
          placeItems: 'center',
          color: COLOR.github.merged,
          background: COLOR.canvas.raised,
          border: `3px solid ${COLOR.github.merged}`,
          boxShadow: `0 0 56px ${COLOR.github.merged}3d`,
          opacity: mergeIn * (1 - mergeOut),
          scale: mergeScale,
        }}
      >
        <GitHubPlatformGlyph name="merge" size={52} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: CENTER.x,
          top: CENTER.y,
          translate: '-50% -50%',
          opacity: markIn,
          scale: interpolate(markIn, [0, 1], [0.72, 1]),
        }}
      >
        <GitHubMark size={100} />
      </div>
    </div>
  );
};

export const GitHubCourseOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const labelIn = enter(frame, 4, 20);
  const labelOut = exit(frame, 90, 108);
  const lockupIn = enter(frame, 132, 164);

  return (
    <AbsoluteFill>
      <BrandCanvas>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 78,
            textAlign: 'center',
            fontFamily: FONT.mono,
            fontSize: 18,
            color: COLOR.github.action,
            fontWeight: WEIGHT.bold,
            letterSpacing: 2.2,
            opacity: labelIn * (1 - labelOut),
          }}
        >
          COLLABORATION SYSTEM
        </div>
        <CollaborationNetwork frame={frame} />
        <CollaborationCore frame={frame} />
        <GitHubBrandLockup progress={lockupIn} auditId="github-outro-lockup" />
      </BrandCanvas>
    </AbsoluteFill>
  );
};

export const GITHUB_COURSE_OUTRO_DURATION = OUTRO_FRAMES;
