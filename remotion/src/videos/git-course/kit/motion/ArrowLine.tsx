import {COLOR} from '../../palette';
import {clamp01, mix} from './timing';

export const ArrowLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress?: number;
  color?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  markerSize?: number;
  auditId?: string;
}> = ({
  x1,
  y1,
  x2,
  y2,
  progress = 1,
  color = COLOR.git.graphLine,
  width = 5,
  opacity = 1,
  dash,
  markerSize = 12,
  auditId,
}) => {
  const p = clamp01(progress);
  const endX = mix(x1, x2, p);
  const endY = mix(y1, y2, p);
  const markerId = `${auditId ?? 'arrow-line'}-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}`;

  return (
    <g data-audit-id={auditId} opacity={opacity}>
      <defs>
        <marker
          id={markerId}
          markerWidth={markerSize}
          markerHeight={markerSize}
          refX={markerSize * 0.78}
          refY={markerSize / 2}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d={`M${markerSize * 0.18} ${markerSize * 0.18} L${markerSize * 0.84} ${markerSize / 2} L${markerSize * 0.18} ${markerSize * 0.82} Z`} fill={color} />
        </marker>
      </defs>
      <path
        d={`M${x1} ${y1} L${endX} ${endY}`}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
        markerEnd={p > 0.94 ? `url(#${markerId})` : undefined}
      />
    </g>
  );
};
