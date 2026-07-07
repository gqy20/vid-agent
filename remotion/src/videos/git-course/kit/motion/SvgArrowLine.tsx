import {COLOR} from '../../palette';
import {clamp01, mix} from './timing';

export const SvgArrowLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  auditId?: string;
}> = ({x1, y1, x2, y2, progress, color = COLOR.git.conflict, width = 8, opacity = 0.68, dash = '20 18', auditId}) => {
  const p = clamp01(progress);
  const endX = mix(x1, x2, p);
  const endY = mix(y1, y2, p);
  return (
    <g data-audit-id={auditId} opacity={opacity}>
      <line x1={x1} y1={y1} x2={endX} y2={endY} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
      <path
        d={`M${endX - 18} ${endY - 20} L${endX + 12} ${endY} L${endX - 18} ${endY + 20}`}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={p}
      />
    </g>
  );
};
