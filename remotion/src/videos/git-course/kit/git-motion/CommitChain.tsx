import {COLOR} from '../../palette';
import {DrawLine, FocusPulse} from '../motion';
import {CommitNode} from './CommitNode';

export type MotionCommit = {
  id: string;
  x: number;
  y: number;
  progress?: number;
  strong?: boolean;
  pulse?: number;
};

export const CommitChain: React.FC<{
  commits: readonly MotionCommit[];
  lineProgress?: readonly number[];
  lineColor?: string;
  lineWidth?: number;
  auditId?: string;
}> = ({commits, lineProgress = [], lineColor = COLOR.git.graphLine, lineWidth = 12, auditId = 'commit-chain'}) => (
  <g data-audit-id={auditId}>
    {commits.slice(0, -1).map((commit, idx) => {
      const next = commits[idx + 1];
      return (
        <DrawLine
          key={`${commit.id}-${next.id}`}
          x1={commit.x}
          y1={commit.y}
          x2={next.x}
          y2={next.y}
          progress={lineProgress[idx] ?? 1}
          color={lineColor}
          width={lineWidth}
          auditId={`${auditId}-line-${commit.id}-${next.id}`}
        />
      );
    })}
    {commits.map((commit) => (
      <g key={commit.id}>
        {commit.pulse ? <FocusPulse x={commit.x} y={commit.y} progress={commit.pulse} auditId={`${auditId}-pulse-${commit.id}`} /> : null}
        <CommitNode id={commit.id} x={commit.x} y={commit.y} progress={commit.progress} strong={commit.strong} auditId={`${auditId}-commit-${commit.id}`} />
      </g>
    ))}
  </g>
);
