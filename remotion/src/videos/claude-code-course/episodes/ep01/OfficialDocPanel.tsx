import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLOR} from '../../designTokens';

export const OfficialDocPanel: React.FC<{
  screenshot: string;
  auditId?: string;
}> = ({screenshot, auditId = 'official-doc'}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        border: `1px solid ${COLOR.stroke.default}`,
        borderRadius: 12,
        background: COLOR.canvas.raised,
        boxShadow: `0 20px 54px ${COLOR.effects.shadowPanel}`,
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
        }}
      />
    </div>
  );
};
