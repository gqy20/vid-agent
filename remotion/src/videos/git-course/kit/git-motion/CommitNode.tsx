import {COLOR, FONT, WEIGHT} from '../../palette';
import {clamp01, mix} from '../motion';

export const CommitNode: React.FC<{
  id: string;
  x: number;
  y: number;
  progress?: number;
  radius?: number;
  strong?: boolean;
  auditId?: string;
}> = ({id, x, y, progress = 1, radius = 64, strong = false, auditId}) => {
  const p = clamp01(progress);
  return (
    <g
      data-audit-id={auditId ?? `commit-${id}`}
      opacity={p}
      transform={`translate(${x} ${y}) scale(${mix(0.72, 1, p)}) translate(${-x} ${-y})`}
    >
      <circle cx={x} cy={y} r={radius} fill={COLOR.canvas.base} stroke={strong ? COLOR.git.commit : COLOR.stroke.strong} strokeWidth={strong ? 8 : 6} />
      <text x={x} y={y + 13} textAnchor="middle" fontFamily={FONT.mono} fontSize="35" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
        {id}
      </text>
    </g>
  );
};
