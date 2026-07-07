import {COLOR} from '../../palette';
import {clamp01, mix} from './timing';

export const FocusPulse: React.FC<{
  x: number;
  y: number;
  progress: number;
  radius?: number;
  expandBy?: number;
  color?: string;
  width?: number;
  opacity?: number;
  auditId?: string;
}> = ({x, y, progress, radius = 64, expandBy = 24, color = COLOR.git.head, width = 7, opacity = 0.42, auditId}) => {
  const p = clamp01(progress);
  return (
    <circle
      data-audit-id={auditId}
      cx={x}
      cy={y}
      r={mix(radius, radius + expandBy, p)}
      fill="none"
      stroke={color}
      strokeWidth={width}
      opacity={p * opacity}
    />
  );
};
