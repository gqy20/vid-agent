import type {CSSProperties} from 'react';
import {SUBTITLE} from '../subtitleTokens';

const BaseSubtitle: React.FC<{
  children: React.ReactNode;
  style?: CSSProperties;
  variant?: 'narration' | 'action';
}> = ({
  children,
  style,
  variant = 'narration',
}) => {
  const token = variant === 'action' ? SUBTITLE.action : SUBTITLE.narration;
  return (
    <div
      style={{
        position: 'absolute',
        left: token.left,
        right: token.right,
        bottom: token.bottom,
        minHeight: token.minHeight,
        borderRadius: SUBTITLE.radius,
        background: token.background,
        border: `1px solid ${token.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: token.padding,
        fontFamily: SUBTITLE.fontFamily,
        ...token.text,
        fontWeight: token.fontWeight,
        color: token.color,
        boxShadow: `0 10px 24px ${token.shadow}`,
        textAlign: 'center',
        overflow: 'hidden',
        WebkitLineClamp: token.maxLines,
        WebkitBoxOrient: 'vertical',
        textWrap: 'balance',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const NarrationSubtitle: React.FC<{
  children: React.ReactNode;
  style?: CSSProperties;
}> = ({children, style}) => (
  <BaseSubtitle variant="narration" style={style}>
    {children}
  </BaseSubtitle>
);

export const ActionCaption: React.FC<{
  children: React.ReactNode;
  style?: CSSProperties;
}> = ({children, style}) => (
  <BaseSubtitle variant="action" style={style}>
    {children}
  </BaseSubtitle>
);
