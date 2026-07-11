import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import type {BranchLabelData, GitGraphState} from './types';

const BRANCH_COLORS: Record<string, string> = {
  main: COLOR.git.main,
  feature: COLOR.git.feature,
};

const getBranchColor = (branch: BranchLabelData) => BRANCH_COLORS[branch.name] ?? COLOR.git.workingTree;

export const GitGraph: React.FC<{
  state: GitGraphState;
  note?: React.ReactNode;
  width?: number;
  height?: number;
  showFrame?: boolean;
  branchMotion?: {
    name: string;
    from: string;
    to: string;
    progress: number;
  };
  headMotion?: {
    from: string;
    to: string;
    progress: number;
  };
  headMarkerOffsetX?: number;
  showHeadMarker?: boolean;
  auditId?: string;
}> = ({
  state,
  note,
  width = 670,
  height = 270,
  showFrame = false,
  branchMotion,
  headMotion,
  headMarkerOffsetX = 124,
  showHeadMarker = true,
  auditId = 'git-graph',
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 42], [0, 1], {extrapolateRight: 'clamp'});
  const positions = state.commits.map((commit, idx) => ({
    id: commit.id,
    label: commit.label ?? commit.id,
    x: 110 + idx * 150,
    y: 125,
  }));
  const visiblePositions = positions.map((position, idx) => ({...position, opacity: idx === positions.length - 1 ? progress : 1}));
  const maxX = visiblePositions.length > 0 ? visiblePositions[visiblePositions.length - 1].x : 110;
  const branchLayout = state.branches.map((branch) => {
    const target = positions.find((commit) => commit.id === branch.target);
    if (!target) return null;

    const from = branchMotion?.name === branch.name ? positions.find((commit) => commit.id === branchMotion.from) : undefined;
    const to = branchMotion?.name === branch.name ? positions.find((commit) => commit.id === branchMotion.to) : undefined;
    const x = from && to ? interpolate(branchMotion?.progress ?? 1, [0, 1], [from.x, to.x]) : target.x;

    return {
      branch,
      x,
      y: branch.lane === 'top' ? 54 : 194,
    };
  }).filter(Boolean) as Array<{branch: BranchLabelData; x: number; y: number}>;

  const headBranch = state.head?.branch ?? state.branches.find((branch) => branch.active)?.name ?? state.branches[0]?.name;
  const currentHead = headBranch
    ? headMotion
    ? getHeadMarkerPosition(branchLayout, headMotion.from, headMotion.to, headMotion.progress, headMarkerOffsetX)
      : getHeadMarkerPosition(branchLayout, headBranch, headBranch, 1, headMarkerOffsetX)
    : undefined;

  return (
    <svg data-audit-id={auditId} width={width} height={height} viewBox="0 0 730 270" style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <filter id={`${auditId}-graph-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor={COLOR.effects.shadowSoft} />
        </filter>
        <filter id={`${auditId}-graph-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={COLOR.effects.headHighlight} />
        </filter>
      </defs>
      {showFrame ? (
        <g opacity="0.72">
          <rect x="34" y="18" width="662" height="234" rx="18" fill={COLOR.canvas.overlay} stroke={COLOR.stroke.soft} />
          <path d="M72 218 H654" stroke={COLOR.stroke.soft} strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
          <path d="M72 70 H654" stroke={COLOR.stroke.soft} strokeWidth="1.5" strokeLinecap="round" opacity="0.42" />
        </g>
      ) : null}
      <line
        x1="110"
        y1="125"
        x2={Math.min(maxX, 410)}
        y2="125"
        stroke={COLOR.git.graphLine}
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.92"
      />
      {maxX > 410 ? (
        <line
          x1="410"
          y1="125"
          x2={410 + (maxX - 410) * progress}
          y2="125"
          stroke={COLOR.git.graphLine}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.92"
        />
      ) : null}
      {branchLayout.map(({branch, x, y}) => (
        <BranchConnector key={`${branch.name}-connector`} color={getBranchColor(branch)} x={x} y={y} />
      ))}
      {visiblePositions.map((point, idx) => (
        <g
          key={point.id}
          data-audit-id={`${auditId}-commit-${point.id}`}
          opacity={idx === positions.length - 1 && positions.length > 3 ? point.opacity : 1}
        >
          <circle
            cx={point.x}
            cy={point.y + 9}
            r="31"
            fill={COLOR.effects.shadowSoft}
            opacity="0.5"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="28"
            fill={COLOR.canvas.base}
            stroke={idx === positions.length - 1 && positions.length > 3 ? COLOR.git.head : COLOR.git.commit}
            strokeWidth={idx === positions.length - 1 && positions.length > 3 ? 6.8 : 5.6}
            filter={idx === positions.length - 1 && positions.length > 3 ? `url(#${auditId}-graph-glow)` : undefined}
          />
          <text
            x={point.x}
            y={point.y + 8}
            textAnchor="middle"
            fontFamily={FONT.mono}
            fontSize={TYPE.graphNode.fontSize}
            fontWeight={TYPE.graphNode.fontWeight}
            fill={COLOR.text.primary}
          >
            {point.label}
          </text>
        </g>
      ))}
      {branchLayout.map(({branch, x, y}) => {
        return (
          <BranchLabel
            key={branch.name}
            auditId={`${auditId}-branch-${branch.name}`}
            label={branch.name}
            color={getBranchColor(branch)}
            x={x}
            y={y}
          />
        );
      })}
      {showHeadMarker && currentHead ? <HeadMarker auditId={`${auditId}-head`} x={currentHead.x} y={currentHead.y} /> : null}
      {note ? (
        <text x="62" y="244" fontFamily={FONT.sans} fontSize={TYPE.ui.fontSize} fill={COLOR.text.secondary}>
          {note}
        </text>
      ) : null}
    </svg>
  );
};

const BranchConnector: React.FC<{color: string; x: number; y: number}> = ({color, x, y}) => {
  const isTop = y < 120;
  return (
    <path
      d={`M${x} ${isTop ? y + 28 : y - 28} C${x} ${isTop ? y + 56 : y - 56} ${x} ${isTop ? 92 : 158} ${x} ${isTop ? 94 : 156}`}
      fill="none"
      stroke={color}
      strokeWidth="4.4"
      strokeLinecap="round"
      opacity="0.88"
    />
  );
};

const getHeadMarkerPosition = (
  branches: Array<{branch: BranchLabelData; x: number; y: number}>,
  fromName: string,
  toName: string,
  progress: number,
  offsetX: number,
) => {
  const from = branches.find(({branch}) => branch.name === fromName);
  const to = branches.find(({branch}) => branch.name === toName);
  if (!from || !to) return undefined;
  return {
    x: interpolate(progress, [0, 1], [from.x + offsetX, to.x + offsetX]),
    y: interpolate(progress, [0, 1], [from.y, to.y]),
  };
};

const HeadMarker: React.FC<{auditId: string; x: number; y: number}> = ({auditId, x, y}) => (
  <g data-audit-id={auditId}>
    <rect x={x - 49} y={y - 22} width="98" height="44" rx="22" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="2.6" />
    <circle cx={x - 28} cy={y} r="5" fill={COLOR.git.head} />
    <text
      x={x + 10}
      y={y + 7}
      textAnchor="middle"
      fontFamily={FONT.mono}
      fontSize={TYPE.label.fontSize}
      fontWeight={WEIGHT.bold}
      fill={COLOR.git.head}
    >
      HEAD
    </text>
  </g>
);

const BranchLabel: React.FC<{auditId: string; label: string; color: string; x: number; y: number}> = ({
  auditId,
  label,
  color,
  x,
  y,
}) => {
  return (
    <g data-audit-id={auditId}>
      <rect x={x - 58} y={y - 24} width="116" height="48" rx="8" fill={color} opacity="0.96" />
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fontFamily={FONT.mono}
        fontSize={TYPE.graphPointer.fontSize}
        fontWeight={TYPE.graphPointer.fontWeight}
        fill={COLOR.text.inverse}
      >
        {label}
      </text>
    </g>
  );
};
