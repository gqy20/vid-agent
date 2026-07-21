import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
import {GitStatePanel, type GitArea} from './GitStatePanel';

export type GitStateTransition = {
  readonly from: GitArea['id'];
  readonly to: GitArea['id'];
  readonly label?: string;
  readonly progress?: number;
  readonly color?: string;
};

const FLOW_WIDTH = 1000;
const FLOW_HEIGHT = 70;

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

  return (
    <div data-audit-id={auditId} data-git-state-flow style={{position: 'relative', width: '100%'}}>
      {transitions.length > 0 ? (
        <svg width="100%" height={FLOW_HEIGHT} viewBox={`0 0 ${FLOW_WIDTH} ${FLOW_HEIGHT}`} style={{display: 'block', overflow: 'visible'}}>
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
                <line x1={startX} y1="28" x2={endX} y2="28" stroke={color} strokeWidth="5" strokeLinecap="round" />
                <path d={`M${endX - direction * 12} 19 L${endX} 28 L${endX - direction * 12} 37`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                {transition.label ? <text x={(startX + targetX) / 2} y="62" textAnchor="middle" fontFamily={FONT.mono} fontSize={TYPE.label.fontSize} fontWeight={WEIGHT.bold} fill={COLOR.text.secondary}>{transition.label}</text> : null}
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
