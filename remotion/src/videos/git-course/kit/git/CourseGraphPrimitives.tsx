import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import {connectCircleAnchors, type CircleAnchor} from './graphGeometry';

/**
 * The visual geometry established by EP04/EP05's GitGraph.
 * Later episodes reuse these values so a commit, ref, HEAD marker, and their
 * connector underlaps keep edges continuous while nodes stay visually on top.
 */
export const COURSE_GRAPH_GEOMETRY = {
  commitGap: 150,
  nodeRadius: 28,
  nodeShadowRadius: 31,
  nodeShadowOffsetY: 9,
  nodeStroke: 5.6,
  nodeStrongStroke: 6.8,
  edgeStroke: 8,
  connectorUnderlap: 12,
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

export type CourseCommitTone = 'default' | 'base' | 'main' | 'feature' | 'conflict';

const COMMIT_STROKE_BY_TONE: Record<CourseCommitTone, string> = {
  default: COLOR.git.commit,
  base: COLOR.git.commit,
  main: COLOR.git.main,
  feature: COLOR.git.feature,
  conflict: COLOR.git.conflict,
};

export const courseCommitOuterRadius = (options: {readonly scale?: number; readonly strong?: boolean} = {}) => {
  const stroke = options.strong ? COURSE_GRAPH_GEOMETRY.nodeStrongStroke : COURSE_GRAPH_GEOMETRY.nodeStroke;
  return (COURSE_GRAPH_GEOMETRY.nodeRadius + stroke / 2) * (options.scale ?? 1);
};

export const courseCommitAnchor = (
  x: number,
  y: number,
  options: {readonly scale?: number; readonly strong?: boolean} = {},
): CircleAnchor => ({x, y, radius: courseCommitOuterRadius(options)});

export const CourseCommitNode: React.FC<{
  id: string;
  x: number;
  y: number;
  stroke?: string;
  tone?: CourseCommitTone;
  strong?: boolean;
  opacity?: number;
  scale?: number;
  ring?: {color: string; dashed?: boolean};
  auditId?: string;
}> = ({id, x, y, stroke, tone = 'default', strong = tone !== 'default', opacity = 1, scale = 1, ring, auditId}) => {
  const resolvedRing = ring ?? (tone === 'base' ? {color: COLOR.text.secondary, dashed: true} : undefined);
  const resolvedStroke = stroke ?? COMMIT_STROKE_BY_TONE[tone];
  const transform = scale === 1 ? undefined : `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`;

  return (
    <g opacity={opacity} data-audit-id={auditId} transform={transform}>
      <circle
        cx={x}
        cy={y + COURSE_GRAPH_GEOMETRY.nodeShadowOffsetY}
        r={COURSE_GRAPH_GEOMETRY.nodeShadowRadius}
        fill={COLOR.effects.shadowSoft}
        opacity="0.5"
      />
      {resolvedRing ? (
        <circle
          cx={x}
          cy={y}
          r={COURSE_GRAPH_GEOMETRY.nodeRadius + 10}
          fill="none"
          stroke={resolvedRing.color}
          strokeWidth="3.2"
          strokeDasharray={resolvedRing.dashed ? '7 6' : undefined}
          opacity="0.72"
        />
      ) : null}
      <circle
        cx={x}
        cy={y}
        r={COURSE_GRAPH_GEOMETRY.nodeRadius}
        fill={COLOR.canvas.base}
        stroke={resolvedStroke}
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
};

export const CourseGraphEdge: React.FC<{
  from: CircleAnchor;
  to: CircleAnchor;
  color?: string;
  width?: number;
  opacity?: number;
  sourceGap?: number;
  targetGap?: number;
  auditId?: string;
}> = ({
  from,
  to,
  color = COLOR.git.graphLine,
  width = COURSE_GRAPH_GEOMETRY.edgeStroke,
  opacity = 1,
  sourceGap = -COURSE_GRAPH_GEOMETRY.connectorUnderlap,
  targetGap = -COURSE_GRAPH_GEOMETRY.connectorUnderlap,
  auditId,
}) => {
  const line = connectCircleAnchors(from, to, {sourceGap, targetGap});
  return <line {...line} data-audit-id={auditId} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />;
};

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
  const connectorEndY = targetY - direction * Math.max(0, targetRadius - COURSE_GRAPH_GEOMETRY.connectorUnderlap);
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
