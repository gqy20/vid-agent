import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export type GitRefWriteCommit = {
  id: string;
  label?: string;
};

export const GitRefWritePanel: React.FC<{
  title: string;
  description: string;
  refName: string;
  target: string;
  branchName: string;
  commits: readonly GitRefWriteCommit[];
  note?: string;
  accent?: string;
}> = ({
  title,
  description,
  refName,
  target,
  branchName,
  commits,
  note = '结果：多了一个 ref，commit 图没有复制一份',
  accent = COLOR.git.feature,
}) => {
  const frame = useCurrentFrame();
  const write = interpolate(frame, [20, 58], [0, 1], {extrapolateRight: 'clamp'});
  const pointer = interpolate(frame, [54, 92], [0, 1], {extrapolateRight: 'clamp'});
  const points = commits.map((commit, idx) => ({
    x: 150 + idx * 170,
    y: 255,
    id: commit.id,
    label: commit.label ?? commit.id,
  }));
  const targetPoint = points.find((point) => point.id === target) ?? points[points.length - 1];
  const lineStart = points[0]?.x ?? 150;
  const lineEnd = points[points.length - 1]?.x ?? lineStart;

  return (
    <div
      style={{
        width: 800,
        height: 470,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${COLOR.stroke.soft}`,
        boxShadow: `0 10px 26px ${COLOR.effects.shadowSoft}`,
        background: 'rgba(255,255,255,0.72)',
        display: 'grid',
        gridTemplateRows: '92px 1fr',
        padding: '34px 48px',
      }}
    >
      <div>
        <div style={{...TYPE.title, fontSize: 36}}>{title}</div>
        <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 8}}>{description}</div>
      </div>
      <svg width="744" height="320" viewBox="0 0 744 320" style={{display: 'block'}}>
        <line
          x1={lineStart}
          y1="255"
          x2={lineEnd}
          y2="255"
          stroke={COLOR.git.graphLine}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {points.map((point) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r="32" fill={COLOR.canvas.base} stroke={COLOR.git.commit} strokeWidth="6" />
            <text
              x={point.x}
              y={point.y + 9}
              textAnchor="middle"
              fontFamily={FONT.mono}
              fontSize={TYPE.graphNode.fontSize}
              fontWeight={TYPE.graphNode.fontWeight}
              fill={COLOR.text.primary}
            >
              {point.label}
            </text>
          </g>
        ))}
        <g opacity={write}>
          <rect x="72" y="38" width={360 * write} height="52" rx="10" fill={COLOR.canvas.raised} />
          <text x="94" y="72" fontFamily={FONT.mono} fontSize={TYPE.codeSmall.fontSize} fill={accent}>
            {refName}
          </text>
          <text x="332" y="72" fontFamily={FONT.mono} fontSize={TYPE.codeSmall.fontSize} fill={COLOR.text.secondary}>
            -&gt; {target}
          </text>
        </g>
        {targetPoint ? (
          <g opacity={pointer}>
            <line
              x1={targetPoint.x}
              y1="132"
              x2={targetPoint.x}
              y2="220"
              stroke={accent}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect x={targetPoint.x - 70} y="82" width="140" height="54" rx="10" fill={accent} />
            <text
              x={targetPoint.x}
              y="116"
              textAnchor="middle"
              fontFamily={FONT.mono}
              fontSize={TYPE.graphPointer.fontSize}
              fontWeight={TYPE.graphPointer.fontWeight}
              fill={COLOR.text.inverse}
            >
              {branchName}
            </text>
          </g>
        ) : null}
        <text x="96" y="310" fontFamily={FONT.sans} fontSize={TYPE.ui.fontSize} fill={COLOR.text.secondary}>
          {note}
        </text>
      </svg>
    </div>
  );
};
