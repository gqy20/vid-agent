import {COLOR} from '../../palette';
import {clamp01, mix} from './timing';

export const DrawLine: React.FC<{
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
}> = ({x1, y1, x2, y2, progress, color = COLOR.git.graphLine, width = 8, opacity = 1, dash, auditId}) => {
  const p = clamp01(progress);
  return (
    <line
      data-audit-id={auditId}
      x1={x1}
      y1={y1}
      x2={mix(x1, x2, p)}
      y2={mix(y1, y2, p)}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dash}
      opacity={opacity}
    />
  );
};
