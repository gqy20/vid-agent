import {COLOR, SCENE} from '../designTokens';

export type EvidenceSpotlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const EvidenceSpotlight: React.FC<{
  rect: EvidenceSpotlightRect;
  progress?: number;
  tone?: string;
}> = ({rect, progress = 1, tone = COLOR.brand.orange}) => (
  <div
    style={{
      position: 'absolute',
      left: `${rect.left}%`,
      top: `${rect.top}%`,
      width: `${rect.width}%`,
      height: `${rect.height}%`,
      boxSizing: 'border-box',
      border: `${SCENE.evidence.spotlightStroke}px solid ${tone}`,
      borderRadius: SCENE.evidence.spotlightRadius,
      boxShadow: `0 0 0 2000px rgba(20,20,19,${SCENE.evidence.dimOpacity * progress})`,
      opacity: progress,
      pointerEvents: 'none',
    }}
  />
);
