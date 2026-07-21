import {COLOR, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export type CaptionLayerVariant = 'narration' | 'scene' | 'question';

const cleanCaptionText = (text: string) =>
  text.replace(/[。；;]+$/g, '').replace(/(?<=[\p{Script=Han}A-Za-z0-9])\.$/u, '');

const DEFAULTS: Record<CaptionLayerVariant, {readonly bottom: number; readonly width: number}> = {
  narration: {bottom: 104, width: 1120},
  scene: {bottom: 112, width: 1040},
  question: {bottom: 132, width: 920},
};

export const CaptionLayer: React.FC<{
  readonly children: React.ReactNode;
  readonly variant: CaptionLayerVariant;
  readonly opacity?: number;
  readonly bottom?: number;
  readonly width?: number;
  readonly fontSize?: number;
  readonly translateY?: number;
  readonly auditId?: string;
}> = ({children, variant, opacity = 1, bottom, width, fontSize, translateY = 0, auditId}) => {
  const caption = typeof children === 'string' ? cleanCaptionText(children) : children;
  const isNarration = variant === 'narration';
  const resolvedWidth = width ?? DEFAULTS[variant].width;

  return (
    <div
      data-audit-id={auditId}
      data-caption-variant={variant}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: bottom ?? DEFAULTS[variant].bottom,
        width: isNarration ? 'fit-content' : resolvedWidth,
        maxWidth: isNarration ? resolvedWidth : undefined,
        boxSizing: 'border-box',
        padding: isNarration ? '0 12px' : undefined,
        transform: `translate(-50%, ${translateY}px)`,
        textAlign: 'center',
        ...TYPE.subtitle,
        fontSize: fontSize ?? (isNarration ? 32 : TYPE.subtitle.fontSize),
        lineHeight: isNarration ? 1.42 : TYPE.subtitle.lineHeight,
        fontWeight: isNarration ? WEIGHT.bold : TYPE.subtitle.fontWeight,
        color: COLOR.text.primary,
        textShadow: isNarration ? '0 1px 0 rgba(247, 247, 244, 0.9)' : undefined,
        opacity,
      }}
    >
      {caption}
    </div>
  );
};
