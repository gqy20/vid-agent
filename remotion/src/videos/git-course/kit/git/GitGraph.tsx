import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../../palette';
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
  auditId?: string;
}> = ({state, note, width = 670, height = 270, branchMotion, headMotion, auditId = 'git-graph'}) => {
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
    ? getHeadMarkerPosition(branchLayout, headMotion.from, headMotion.to, headMotion.progress)
      : getHeadMarkerPosition(branchLayout, headBranch, headBranch, 1)
    : undefined;

  return (
    <svg data-audit-id={auditId} width={width} height={height} viewBox="0 0 730 270" style={{display: 'block'}}>
      <line x1="110" y1="125" x2={Math.min(maxX, 410)} y2="125" stroke={COLOR.git.graphLine} strokeWidth="8" strokeLinecap="round" />
      {maxX > 410 ? (
        <line
          x1="410"
          y1="125"
          x2={410 + (maxX - 410) * progress}
          y2="125"
          stroke={COLOR.git.graphLine}
          strokeWidth="8"
          strokeLinecap="round"
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
            cy={point.y}
            r="28"
            fill={COLOR.canvas.base}
            stroke={idx === positions.length - 1 && positions.length > 3 ? COLOR.git.head : COLOR.git.commit}
            strokeWidth="6"
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
      {currentHead ? <HeadMarker auditId={`${auditId}-head`} x={currentHead.x} y={currentHead.y} /> : null}
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
    <line
      x1={x}
      y1={isTop ? y + 34 : y - 34}
      x2={x}
      y2={isTop ? 94 : 156}
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
};

const getHeadMarkerPosition = (
  branches: Array<{branch: BranchLabelData; x: number; y: number}>,
  fromName: string,
  toName: string,
  progress: number,
) => {
  const from = branches.find(({branch}) => branch.name === fromName);
  const to = branches.find(({branch}) => branch.name === toName);
  if (!from || !to) return undefined;
  return {
    x: interpolate(progress, [0, 1], [from.x + 88, to.x + 88]),
    y: interpolate(progress, [0, 1], [from.y, to.y]),
  };
};

const HeadMarker: React.FC<{auditId: string; x: number; y: number}> = ({auditId, x, y}) => (
  <g data-audit-id={auditId}>
    <rect x={x - 46} y={y - 21} width="92" height="42" rx="21" fill={COLOR.canvas.raised} stroke={COLOR.git.head} strokeWidth="3" />
    <circle cx={x - 28} cy={y} r="5" fill={COLOR.git.head} />
    <text
      x={x + 10}
      y={y + 7}
      textAnchor="middle"
      fontFamily={FONT.mono}
      fontSize={TYPE.label.fontSize}
      fontWeight={800}
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
      <rect x={x - 58} y={y - 24} width="116" height="48" rx="10" fill={color} />
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
