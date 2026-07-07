export const PositionedMotion: React.FC<{
  children: React.ReactNode;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  opacity?: number;
  translateX?: number | string;
  translateY?: number | string;
  centerX?: boolean;
  centerY?: boolean;
  auditId?: string;
}> = ({
  children,
  x,
  y,
  width,
  height,
  opacity = 1,
  translateX = 0,
  translateY = 0,
  centerX = false,
  centerY = false,
  auditId,
}) => {
  const translate = `${centerX ? '-50%' : typeof translateX === 'number' ? `${translateX}px` : translateX} ${centerY ? '-50%' : typeof translateY === 'number' ? `${translateY}px` : translateY}`;

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity,
        transform: `translate(${translate})`,
      }}
    >
      {children}
    </div>
  );
};
