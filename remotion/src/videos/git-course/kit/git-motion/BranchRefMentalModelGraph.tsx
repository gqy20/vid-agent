import {interpolate, useCurrentFrame} from 'remotion';
import {seconds} from '../../timeline';
import {BranchTag} from './BranchTag';
import {CommitChain} from './CommitChain';

export const BranchRefMentalModelGraph: React.FC<{
  opacity: number;
  mainAttach: number;
  featureDrop: number;
  c2Pulse: number;
  liftY?: number;
}> = ({opacity, mainAttach, featureDrop, c2Pulse, liftY = 0}) => {
  const c2X = 1104;
  const frame = useCurrentFrame();
  const line01 = interpolate(frame, [seconds(5.65), seconds(6.3)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const line12 = interpolate(frame, [seconds(6.55), seconds(7.2)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c0 = interpolate(frame, [seconds(5.35), seconds(5.8)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c1 = interpolate(frame, [seconds(6.12), seconds(6.58)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c2 = interpolate(frame, [seconds(6.9), seconds(7.36)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mainX = c2X;
  const mainY = interpolate(mainAttach, [0, 1], [760, 656]);
  const mainOpacity = interpolate(mainAttach, [0, 0.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <svg
      data-audit-id="mental-motion-graph"
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, opacity, overflow: 'visible'}}
    >
      <g transform={`translate(0 ${liftY})`}>
        <g data-audit-id="mental-commit-chain">
          <CommitChain
            commits={[
              {id: 'C0', x: 616, y: 524, progress: c0},
              {id: 'C1', x: 860, y: 524, progress: c1},
              {id: 'C2', x: c2X, y: 524, progress: c2, strong: true, pulse: c2Pulse},
            ]}
            lineProgress={[line01, line12]}
            auditId="mental-commit-chain"
          />
        </g>
        <BranchTag
          name="main"
          x={mainX}
          y={mainY}
          progress={mainOpacity}
          targetX={c2X}
          targetY={524}
          connectorStartY={592}
          auditId="mental-main-ref"
        />
        <BranchTag
          name="feature"
          x={c2X}
          y={324}
          progress={featureDrop}
          fromX={c2X}
          fromY={182}
          targetX={c2X}
          targetY={524}
          connectorStartY={456}
          width={216}
          fontSize={27}
          auditId="mental-feature-ref"
        />
      </g>
    </svg>
  );
};
