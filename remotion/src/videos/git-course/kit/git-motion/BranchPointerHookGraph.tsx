import {interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../../palette';
import {seconds} from '../../timeline';

export const BranchPointerHookGraph: React.FC = () => {
  const frame = useCurrentFrame();
  const c0Scale = interpolate(frame, [seconds(2.15), seconds(2.65)], [0.72, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c1Scale = interpolate(frame, [seconds(3.25), seconds(3.75)], [0.72, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c2Scale = interpolate(frame, [seconds(4.35), seconds(4.85)], [0.72, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c0Opacity = interpolate(frame, [seconds(2.05), seconds(2.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c1Opacity = interpolate(frame, [seconds(3.15), seconds(3.5)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c2Opacity = interpolate(frame, [seconds(4.25), seconds(4.6)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line01End = interpolate(frame, [seconds(2.75), seconds(3.15)], [150, 410], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line12End = interpolate(frame, [seconds(3.85), seconds(4.25)], [410, 670], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainOpacity = interpolate(frame, [seconds(5.75), seconds(6.1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainY = interpolate(frame, [seconds(5.75), seconds(6.55)], [-168, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const landingRingOpacity = interpolate(frame, [seconds(6.35), seconds(6.95), seconds(7.6)], [0, 1, 0.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const landingRingRadius = interpolate(frame, [seconds(6.35), seconds(6.95)], [62, 84], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headOpacity = interpolate(frame, [seconds(8), seconds(8.35)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headLabelY = interpolate(frame, [seconds(8), seconds(8.75)], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const commits = [
    {id: 'C0', x: 150, opacity: c0Opacity, scale: c0Scale},
    {id: 'C1', x: 410, opacity: c1Opacity, scale: c1Scale},
    {id: 'C2', x: 670, opacity: c2Opacity, scale: c2Scale},
  ];

  return (
    <svg data-audit-id="hook-main-graph" width="1120" height="520" viewBox="0 0 1120 520" style={{display: 'block', width: '100%', height: 'auto'}}>
      <g data-audit-id="hook-commit-chain">
        <line x1="150" y1="226" x2={line01End} y2="226" stroke={COLOR.git.graphLine} strokeWidth="11" strokeLinecap="round" />
        <line x1="410" y1="226" x2={line12End} y2="226" stroke={COLOR.git.graphLine} strokeWidth="11" strokeLinecap="round" />
        <circle cx="670" cy="226" r={landingRingRadius} fill="none" stroke={COLOR.git.head} strokeWidth="7" opacity={landingRingOpacity} />
        {commits.map((commit) => (
          <g key={commit.id} data-audit-id={`hook-commit-${commit.id}`} opacity={commit.opacity} transform={`translate(${commit.x} 226) scale(${commit.scale}) translate(${-commit.x} -226)`}>
            <circle cx={commit.x} cy="226" r="57" fill={COLOR.canvas.base} stroke={COLOR.git.commit} strokeWidth="8" />
            <text x={commit.x} y="239" textAnchor="middle" fontFamily={FONT.mono} fontSize="34" fontWeight="780" fill={COLOR.text.primary}>
              {commit.id}
            </text>
          </g>
        ))}
      </g>
      <g opacity={mainOpacity} transform={`translate(0 ${mainY})`} data-audit-id="hook-main-label">
        <path d="M728 226 H756" stroke={COLOR.git.main} strokeWidth="4" strokeLinecap="round" opacity="0.86" />
        <path d="M756 226 L782 210 V242 Z" fill={COLOR.git.main} />
        <rect x="782" y="190" width="176" height="72" rx="10" fill={COLOR.git.main} />
        <text x="870" y="237" textAnchor="middle" fontFamily={FONT.mono} fontSize="29" fontWeight="820" fill={COLOR.text.inverse}>
          main
        </text>
      </g>
      <g opacity={headOpacity} data-audit-id="hook-head-label">
        <path d="M870 334 V280" stroke={COLOR.git.head} strokeWidth="4" strokeLinecap="round" />
        <path d="M870 266 l-10 16 h20 z" fill={COLOR.git.head} />
        <g transform={`translate(0 ${headLabelY})`}>
          <text x="870" y="364" textAnchor="middle" fontFamily={FONT.mono} fontSize="25" fontWeight="820" fill={COLOR.git.head}>
            HEAD
          </text>
        </g>
      </g>
    </svg>
  );
};
