import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

/**
 * The visual geometry established by EP04/EP05's GitGraph.
 * Later episodes reuse these values so a commit, ref, HEAD marker, and their
 * connector gaps keep the same visual weight across the course.
 */
export const COURSE_GRAPH_GEOMETRY = {
  commitGap: 150,
  nodeRadius: 28,
  nodeShadowRadius: 31,
  nodeShadowOffsetY: 9,
  nodeStroke: 5.6,
  nodeStrongStroke: 6.8,
  edgeStroke: 8,
  refWidth: 116,
  refHeight: 48,
  refRadius: 8,
  refStroke: 4.4,
  refNodeGap: 19,
  headWidth: 98,
  headHeight: 44,
  headRadius: 22,
  headStroke: 2.6,
} as const;

export const CourseCommitNode: React.FC<{
  id: string;
  x: number;
  y: number;
  stroke?: string;
  strong?: boolean;
  opacity?: number;
  ring?: {color: string; dashed?: boolean};
  auditId?: string;
}> = ({id, x, y, stroke = COLOR.git.commit, strong = false, opacity = 1, ring, auditId}) => (
  <g opacity={opacity} data-audit-id={auditId}>
    <circle
      cx={x}
      cy={y + COURSE_GRAPH_GEOMETRY.nodeShadowOffsetY}
      r={COURSE_GRAPH_GEOMETRY.nodeShadowRadius}
      fill={COLOR.effects.shadowSoft}
      opacity="0.5"
    />
    {ring ? (
      <circle
        cx={x}
        cy={y}
        r={COURSE_GRAPH_GEOMETRY.nodeRadius + 10}
        fill="none"
        stroke={ring.color}
        strokeWidth="3.2"
        strokeDasharray={ring.dashed ? '7 6' : undefined}
        opacity="0.72"
      />
    ) : null}
    <circle
      cx={x}
      cy={y}
      r={COURSE_GRAPH_GEOMETRY.nodeRadius}
      fill={COLOR.canvas.base}
      stroke={stroke}
      strokeWidth={strong ? COURSE_GRAPH_GEOMETRY.nodeStrongStroke : COURSE_GRAPH_GEOMETRY.nodeStroke}
    />
    <text
      x={x}
      y={y + 8}
      textAnchor="middle"
      fontFamily={FONT.mono}
      fontSize={TYPE.graphNode.fontSize}
      fontWeight={TYPE.graphNode.fontWeight}
      fill={COLOR.text.primary}
    >
      {id}
    </text>
  </g>
);

export const CourseGraphEdge: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  opacity?: number;
}> = ({x1, y1, x2, y2, color = COLOR.git.graphLine, width = COURSE_GRAPH_GEOMETRY.edgeStroke, opacity = 0.92}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
);

export const CourseBranchLabel: React.FC<{
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetRadius?: number;
  color: string;
  opacity?: number;
  auditId?: string;
}> = ({name, x, y, targetX, targetY, targetRadius = COURSE_GRAPH_GEOMETRY.nodeRadius, color, opacity = 1, auditId}) => {
  const isAboveTarget = y < targetY;
  const direction = isAboveTarget ? 1 : -1;
  const connectorStartY = y + direction * COURSE_GRAPH_GEOMETRY.refHeight / 2;
  const connectorEndY = targetY - direction * targetRadius;
  const connectorMidY = connectorStartY + direction * COURSE_GRAPH_GEOMETRY.refNodeGap / 2;

  return (
    <g opacity={opacity} data-audit-id={auditId}>
      <path
        d={`M${x} ${connectorStartY} C${x} ${connectorMidY} ${targetX} ${connectorMidY} ${targetX} ${connectorEndY}`}
        fill="none"
        stroke={color}
        strokeWidth={COURSE_GRAPH_GEOMETRY.refStroke}
        strokeLinecap="round"
      />
      <rect
        x={x - COURSE_GRAPH_GEOMETRY.refWidth / 2}
        y={y - COURSE_GRAPH_GEOMETRY.refHeight / 2}
        width={COURSE_GRAPH_GEOMETRY.refWidth}
        height={COURSE_GRAPH_GEOMETRY.refHeight}
        rx={COURSE_GRAPH_GEOMETRY.refRadius}
        fill={color}
        opacity="0.96"
      />
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fontFamily={FONT.mono}
        fontSize={TYPE.graphPointer.fontSize}
        fontWeight={TYPE.graphPointer.fontWeight}
        fill={COLOR.text.inverse}
      >
        {name}
      </text>
    </g>
  );
};

export const CourseHeadMarker: React.FC<{x: number; y: number; opacity?: number; auditId?: string}> = ({x, y, opacity = 1, auditId}) => (
  <g opacity={opacity} data-audit-id={auditId}>
    <rect
      x={x - COURSE_GRAPH_GEOMETRY.headWidth / 2}
      y={y - COURSE_GRAPH_GEOMETRY.headHeight / 2}
      width={COURSE_GRAPH_GEOMETRY.headWidth}
      height={COURSE_GRAPH_GEOMETRY.headHeight}
      rx={COURSE_GRAPH_GEOMETRY.headRadius}
      fill={COLOR.canvas.raised}
      stroke={COLOR.git.head}
      strokeWidth={COURSE_GRAPH_GEOMETRY.headStroke}
    />
    <circle cx={x - 28} cy={y} r="5" fill={COLOR.git.head} />
    <text x={x + 10} y={y + 7} textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight={WEIGHT.bold} fill={COLOR.git.head}>
      HEAD
    </text>
  </g>
);
