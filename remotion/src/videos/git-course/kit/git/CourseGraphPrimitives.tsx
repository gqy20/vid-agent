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

export type CourseGraphSize = 'compact' | 'standard' | 'hero';

/**
 * Rendered proportions for the three teaching roles used by the course.
 * Keep node size, edge weight, underlap, and layout density in one preset so
 * episodes cannot enlarge a node while accidentally leaving its edge too thin.
 */
export const COURSE_GRAPH_PRESETS = {
  compact: {
    nodeScale: 1,
    edgeStroke: 8,
    connectorUnderlap: 12,
    commitGap: 150,
    refFontSize: 22,
    refMinWidth: 116,
    refHeight: 48,
    refHorizontalPadding: 16,
    refRadius: 8,
    refStroke: 4.4,
    refVisualGap: 20,
    refCurveLead: 10,
    refTextBaseline: 8,
  },
  standard: {
    nodeScale: 1.25,
    edgeStroke: 9.2,
    connectorUnderlap: 14,
    commitGap: 220,
    refFontSize: 25,
    refMinWidth: 124,
    refHeight: 54,
    refHorizontalPadding: 19,
    refRadius: 9,
    refStroke: 5,
    refVisualGap: 26,
    refCurveLead: 11,
    refTextBaseline: 9,
  },
  hero: {
    nodeScale: 1.5,
    edgeStroke: 12.5,
    connectorUnderlap: 18,
    commitGap: 340,
    refFontSize: 28,
    refMinWidth: 132,
    refHeight: 60,
    refHorizontalPadding: 22,
    refRadius: 10,
    refStroke: 5.5,
    refVisualGap: 32,
    refCurveLead: 12,
    refTextBaseline: 10,
  },
} as const;

const graphPreset = (size: CourseGraphSize) => COURSE_GRAPH_PRESETS[size];

export type CourseBranchPlacement = 'above' | 'below';

export const courseBranchLabelY = ({
  targetY,
  targetRadius,
  size = 'compact',
  placement,
  visualGap,
}: {
  readonly targetY: number;
  readonly targetRadius: number;
  readonly size?: CourseGraphSize;
  readonly placement: CourseBranchPlacement;
  readonly visualGap?: number;
}) => {
  const preset = graphPreset(size);
  const direction = placement === 'above' ? -1 : 1;
  return targetY + direction * (targetRadius + (visualGap ?? preset.refVisualGap) + preset.refHeight / 2);
};

export type CourseCommitTone = 'default' | 'base' | 'main' | 'feature' | 'conflict';

const COMMIT_STROKE_BY_TONE: Record<CourseCommitTone, string> = {
  default: COLOR.git.commit,
  base: COLOR.git.commit,
  main: COLOR.git.main,
  feature: COLOR.git.feature,
  conflict: COLOR.git.conflict,
};

export const courseCommitOuterRadius = (options: {readonly size?: CourseGraphSize; readonly scale?: number; readonly strong?: boolean} = {}) => {
  const stroke = options.strong ? COURSE_GRAPH_GEOMETRY.nodeStrongStroke : COURSE_GRAPH_GEOMETRY.nodeStroke;
  const scale = options.scale ?? graphPreset(options.size ?? 'compact').nodeScale;
  return (COURSE_GRAPH_GEOMETRY.nodeRadius + stroke / 2) * scale;
};

export const courseCommitAnchor = (
  x: number,
  y: number,
  options: {readonly size?: CourseGraphSize; readonly scale?: number; readonly strong?: boolean} = {},
): CircleAnchor => ({x, y, radius: courseCommitOuterRadius(options)});

export const CourseCommitNode: React.FC<{
  id: string;
  x: number;
  y: number;
  stroke?: string;
  tone?: CourseCommitTone;
  strong?: boolean;
  opacity?: number;
  size?: CourseGraphSize;
  scale?: number;
  ring?: {color: string; dashed?: boolean};
  auditId?: string;
}> = ({id, x, y, stroke, tone = 'default', strong = tone !== 'default', opacity = 1, size = 'compact', scale, ring, auditId}) => {
  const resolvedRing = ring ?? (tone === 'base' ? {color: COLOR.text.secondary, dashed: true} : undefined);
  const resolvedStroke = stroke ?? COMMIT_STROKE_BY_TONE[tone];
  const resolvedScale = scale ?? graphPreset(size).nodeScale;
  const transform = resolvedScale === 1 ? undefined : `translate(${x} ${y}) scale(${resolvedScale}) translate(${-x} ${-y})`;

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
  size?: CourseGraphSize;
  sourceGap?: number;
  targetGap?: number;
  auditId?: string;
}> = ({
  from,
  to,
  color = COLOR.git.graphLine,
  width,
  opacity = 1,
  size = 'compact',
  sourceGap,
  targetGap,
  auditId,
}) => {
  const preset = graphPreset(size);
  const line = connectCircleAnchors(from, to, {
    sourceGap: sourceGap ?? -preset.connectorUnderlap,
    targetGap: targetGap ?? -preset.connectorUnderlap,
  });
  return <line {...line} data-audit-id={auditId} stroke={color} strokeWidth={width ?? preset.edgeStroke} strokeLinecap="round" opacity={opacity} />;
};

type CourseBranchLabelPosition =
  | {readonly y: number; readonly placement?: never; readonly visualGap?: never}
  | {readonly y?: never; readonly placement: CourseBranchPlacement; readonly visualGap?: number};

type CourseBranchLabelProps = {
  name: string;
  x: number;
  targetX: number;
  targetY: number;
  targetRadius?: number;
  size?: CourseGraphSize;
  color: string;
  opacity?: number;
  auditId?: string;
} & CourseBranchLabelPosition;

export const CourseBranchLabel: React.FC<CourseBranchLabelProps> = ({name, x, y, placement, visualGap, targetX, targetY, targetRadius, size = 'compact', color, opacity = 1, auditId}) => {
  const preset = graphPreset(size);
  const resolvedTargetRadius = targetRadius ?? courseCommitOuterRadius({size, strong: true});
  const resolvedY = y ?? courseBranchLabelY({targetY, targetRadius: resolvedTargetRadius, size, placement: placement!, visualGap});
  const textWidth = Array.from(name).reduce((width, character) => {
    const isWideCharacter = character.codePointAt(0)! > 0xff;
    return width + preset.refFontSize * (isWideCharacter ? 1 : 0.62);
  }, 0);
  const labelWidth = Math.max(preset.refMinWidth, Math.ceil(textWidth + preset.refHorizontalPadding * 2));
  const isAboveTarget = resolvedY < targetY;
  const direction = isAboveTarget ? 1 : -1;
  const connectorStartY = resolvedY + direction * preset.refHeight / 2;
  const connectorEndY = targetY - direction * Math.max(0, resolvedTargetRadius - preset.connectorUnderlap);
  const connectorMidY = connectorStartY + direction * preset.refCurveLead;

  return (
    <g opacity={opacity} data-audit-id={auditId}>
      <path
        d={`M${x} ${connectorStartY} C${x} ${connectorMidY} ${targetX} ${connectorMidY} ${targetX} ${connectorEndY}`}
        fill="none"
        stroke={color}
        strokeWidth={preset.refStroke}
        strokeLinecap="round"
      />
      <rect
        x={x - labelWidth / 2}
        y={resolvedY - preset.refHeight / 2}
        width={labelWidth}
        height={preset.refHeight}
        rx={preset.refRadius}
        fill={color}
        opacity="0.96"
      />
      <text
        x={x}
        y={resolvedY + preset.refTextBaseline}
        textAnchor="middle"
        fontFamily={FONT.mono}
        fontSize={preset.refFontSize}
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
