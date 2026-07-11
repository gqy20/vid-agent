import {COLOR, FONT, WEIGHT} from '../../palette';
import {clamp01, easeOutBack, mix} from '../motion';
import {ArrowLine} from '../motion/ArrowLine';

const BRANCH_COLOR: Record<string, string> = {
  main: COLOR.git.main,
  feature: COLOR.git.feature,
};

export const BranchTag: React.FC<{
  name: string;
  x: number;
  y: number;
  progress?: number;
  fromX?: number;
  fromY?: number;
  targetX?: number;
  targetY?: number;
  connectorStartY?: number;
  color?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  auditId?: string;
}> = ({
  name,
  x,
  y,
  progress = 1,
  fromX,
  fromY,
  targetX = x,
  targetY,
  connectorStartY,
  color = BRANCH_COLOR[name] ?? COLOR.git.workingTree,
  width = name.length > 5 ? 216 : 184,
  height = 68,
  fontSize = name.length > 5 ? 27 : 28,
  auditId,
}) => {
  const p = clamp01(progress);
  const eased = easeOutBack(p);
  const currentX = fromX === undefined ? x : mix(fromX, x, eased);
  const currentY = fromY === undefined ? y : mix(fromY, y, eased);
  const connectorOpacity = p;

  const resolvedAuditId = auditId ?? `branch-tag-${name}`;
  const isBelowTarget = targetY !== undefined && currentY > targetY;
  const tagEdgeY = isBelowTarget ? currentY : currentY + height;
  const targetEdgeY = connectorStartY ?? (isBelowTarget ? targetY + 62 : (targetY ?? currentY) - 62);

  return (
    <g opacity={p}>
      {targetY !== undefined ? (
        <ArrowLine
          x1={targetX}
          y1={tagEdgeY}
          x2={targetX}
          y2={targetEdgeY}
          color={color}
          width={5}
          opacity={connectorOpacity}
          markerSize={8}
          auditId={`${resolvedAuditId}-connector`}
        />
      ) : null}
      <g data-audit-id={resolvedAuditId} transform={`translate(${currentX} ${currentY}) scale(${mix(0.82, 1, eased)}) translate(${-currentX} ${-currentY})`}>
        <rect x={currentX - width / 2} y={currentY} width={width} height={height} rx="10" fill={color} />
        <text x={currentX} y={currentY + 44} textAnchor="middle" fontFamily={FONT.mono} fontSize={fontSize} fontWeight={WEIGHT.bold} fill={COLOR.text.inverse}>
          {name}
        </text>
      </g>
    </g>
  );
};
