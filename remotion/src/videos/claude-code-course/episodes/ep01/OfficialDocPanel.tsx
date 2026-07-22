import {Img, staticFile, useCurrentFrame} from 'remotion';
import {SURFACE} from '../../designTokens';
import {motionProgress} from '../../motion';

export const OfficialDocPanel: React.FC<{
  screenshot: string;
  auditId?: string;
  focusRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  focusProgress?: number;
}> = ({screenshot, auditId = 'official-doc', focusRegion, focusProgress = 0}) => {
  const frame = useCurrentFrame();
  const enter = motionProgress(frame, 0);
  const progress = focusRegion ? focusProgress : 0;
  const focusCenter = focusRegion
    ? {
        x: focusRegion.x + focusRegion.width / 2,
        y: focusRegion.y + focusRegion.height / 2,
      }
    : {x: 0.5, y: 0.5};
  const targetScale = focusRegion
    ? Math.min(2.2, Math.max(1.55, 0.72 / focusRegion.width))
    : 1;
  const scale = 1 + (targetScale - 1) * progress;
  const translateX = (0.5 - focusCenter.x) * 1440 * scale * progress;
  const translateY = (0.5 - focusCenter.y) * 810 * scale * progress;

  return (
    <div
      data-audit-id={auditId}
      style={{
        ...SURFACE.evidence,
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        opacity: enter,
        translate: `0 ${(1 - enter) * 12}px`,
      }}
    >
      <Img
        src={staticFile(screenshot)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center center',
          display: 'block',
          transformOrigin: 'center center',
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        }}
      />
    </div>
  );
};
