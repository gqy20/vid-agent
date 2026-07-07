import {COLOR, FONT} from '../../palette';
import {clamp01, mix} from './timing';

export const StrikeThrough: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  label?: string;
  labelX?: number;
  labelY?: number;
  color?: string;
  width?: number;
  auditId?: string;
}> = ({x1, y1, x2, y2, progress, label, labelX, labelY, color = COLOR.git.conflict, width = 10, auditId}) => {
  const p = clamp01(progress);
  return (
    <g data-audit-id={auditId}>
      <line
        x1={x1}
        y1={y1}
        x2={mix(x1, x2, p)}
        y2={mix(y1, y2, p)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        opacity={p * 0.86}
      />
      {label ? (
        <text x={labelX ?? x2 + 32} y={labelY ?? y1} fontFamily={FONT.sans} fontSize="29" fontWeight="760" fill={color} opacity={p}>
          {label}
        </text>
      ) : null}
    </g>
  );
};
