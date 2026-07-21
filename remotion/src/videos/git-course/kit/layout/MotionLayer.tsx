export const MotionLayer: React.FC<{
  readonly children: React.ReactNode;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly origin?: string;
  readonly style?: React.CSSProperties;
}> = ({children, x = 0, y = 0, scale = 1, opacity = 1, origin = 'center', style}) => (
  <div
    style={{
      ...style,
      opacity,
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
      transformOrigin: origin,
    }}
  >
    {children}
  </div>
);
