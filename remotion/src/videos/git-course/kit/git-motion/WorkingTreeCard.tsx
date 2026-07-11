import {COLOR, FONT, WEIGHT} from '../../palette';

export const WorkingTreeCard: React.FC<{
  label: string;
  x?: number;
  y?: number;
  opacity?: number;
  auditId?: string;
}> = ({label, x = 0, y = 0, opacity = 1, auditId}) => (
  <svg
    width="520"
    height="320"
    viewBox="0 0 520 320"
    style={{position: 'absolute', left: x, top: y, opacity}}
    data-audit-id={auditId ?? `working-tree-${label}`}
  >
    <rect x="0" y="0" width="520" height="320" rx="12" fill={COLOR.canvas.raised} stroke={COLOR.stroke.default} strokeWidth="2" />
    <text x="38" y="58" fontFamily={FONT.sans} fontSize="28" fontWeight={WEIGHT.bold} fill={COLOR.text.primary}>
      {label}
    </text>
    {['src', 'components', 'index.ts', 'README.md'].map((item, idx) => {
      const top = 100 + idx * 46;
      const isFolder = idx < 2;
      return (
        <g key={item}>
          <rect x="38" y={top - 20} width="26" height="22" rx="5" fill={isFolder ? COLOR.git.workingTree : COLOR.stroke.default} opacity={isFolder ? 0.9 : 0.72} />
          <text x="82" y={top} fontFamily={FONT.mono} fontSize="24" fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>
            {item}
          </text>
        </g>
      );
    })}
  </svg>
);
