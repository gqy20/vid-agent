import {COLOR, FONT, WEIGHT} from '../../palette';
import {GitStatePanel, type GitArea} from './GitStatePanel';

export type GitStateTransition = {
  readonly from: GitArea['id'];
  readonly to: GitArea['id'];
  readonly label?: string;
  readonly progress?: number;
  readonly color?: string;
};

const FLOW_WIDTH = 1000;

const flowGeometry = ({prominent, compact}: {readonly prominent?: boolean; readonly compact?: boolean}) => {
  if (prominent) {
    return {height: 100, commandFontSize: 32, commandBaselineY: 34, arrowY: 75};
  }
  if (compact) {
    return {height: 78, commandFontSize: 22, commandBaselineY: 24, arrowY: 57};
  }
  return {height: 90, commandFontSize: 26, commandBaselineY: 29, arrowY: 67};
};

export const GitStateFlow: React.FC<{
  readonly areas: readonly GitArea[];
  readonly transitions?: readonly GitStateTransition[];
  readonly areaOpacity?: Partial<Record<GitArea['id'], number>>;
  readonly prominent?: boolean;
  readonly compact?: boolean;
  readonly gap?: number;
  readonly auditId?: string;
}> = ({areas, transitions = [], areaOpacity, prominent, compact, gap, auditId}) => {
  const indexById = new Map(areas.map((area, index) => [area.id, index]));
  const centerX = (index: number) => ((index + 0.5) / areas.length) * FLOW_WIDTH;
  const geometry = flowGeometry({prominent, compact});

  return (
    <div data-audit-id={auditId} data-git-state-flow style={{position: 'relative', width: '100%'}}>
      {transitions.length > 0 ? (
        <svg width="100%" height={geometry.height} viewBox={`0 0 ${FLOW_WIDTH} ${geometry.height}`} style={{display: 'block', overflow: 'visible'}}>
          {transitions.map((transition, index) => {
            const fromIndex = indexById.get(transition.from);
            const toIndex = indexById.get(transition.to);
            if (fromIndex === undefined || toIndex === undefined) throw new Error(`Unknown Git state transition: ${transition.from} → ${transition.to}`);
            const direction = Math.sign(toIndex - fromIndex) || 1;
            const startX = centerX(fromIndex) + direction * 64;
            const targetX = centerX(toIndex) - direction * 64;
            const progress = Math.max(0, Math.min(1, transition.progress ?? 1));
            const endX = startX + (targetX - startX) * progress;
            const color = transition.color ?? COLOR.git.head;
            return (
              <g key={`${transition.from}-${transition.to}-${index}`} opacity={progress}>
                {transition.label ? (
                  <text
                    x={(startX + targetX) / 2}
                    y={geometry.commandBaselineY}
                    textAnchor="middle"
                    fontFamily={FONT.mono}
                    fontSize={geometry.commandFontSize}
                    fontWeight={WEIGHT.bold}
                    fill={COLOR.text.primary}
                  >
                    {transition.label}
                  </text>
                ) : null}
                <line x1={startX} y1={geometry.arrowY} x2={endX} y2={geometry.arrowY} stroke={color} strokeWidth="5" strokeLinecap="round" />
                <path
                  d={`M${endX - direction * 12} ${geometry.arrowY - 9} L${endX} ${geometry.arrowY} L${endX - direction * 12} ${geometry.arrowY + 9}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
        </svg>
      ) : null}
      <GitStatePanel
        areas={areas}
        areaOpacity={areaOpacity}
        prominent={prominent}
        compact={compact}
        gap={gap}
        auditId={auditId ? `${auditId}-area` : undefined}
      />
    </div>
  );
};
