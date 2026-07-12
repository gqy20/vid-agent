import {Video, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export const ManimClip: React.FC<{
  src: string;
  title?: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
  opacity?: number;
  scale?: number;
  fit?: 'cover' | 'contain';
  framed?: boolean;
  auditId?: string;
}> = ({src, title, caption, width = '100%', height = '100%', opacity = 1, scale = 1, fit = 'cover', framed = true, auditId = 'manim-clip'}) => {
  const frame = useCurrentFrame();
  const mediaIn = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'relative',
        width,
        height,
        opacity: opacity * mediaIn,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        overflow: 'hidden',
        borderRadius: framed ? 8 : 0,
        border: framed ? `1px solid ${COLOR.stroke.soft}` : 'none',
        background: framed ? COLOR.canvas.raised : 'transparent',
        boxShadow: framed ? `0 24px 70px ${COLOR.effects.shadowPanel}` : 'none',
        fontFamily: FONT.sans,
      }}
    >
      <Video src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, display: 'block'}} />
      {title ? (
        <div
          style={{
            position: 'absolute',
            left: 22,
            top: 18,
            ...TYPE.uiSmall,
            fontWeight: WEIGHT.bold,
            color: COLOR.text.secondary,
            padding: '6px 10px',
            borderRadius: 6,
            background: COLOR.canvas.overlay,
            border: `1px solid ${COLOR.stroke.soft}`,
          }}
        >
          {title}
        </div>
      ) : null}
      {caption ? (
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 20,
            ...TYPE.ui,
            color: COLOR.text.primary,
            textAlign: 'center',
            padding: '10px 14px',
            borderRadius: 8,
            background: COLOR.canvas.overlay,
            border: `1px solid ${COLOR.stroke.soft}`,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
