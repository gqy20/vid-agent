import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const MotionTitle: React.FC<{
  children: React.ReactNode;
  x?: number;
  y?: number;
  opacity?: number;
  translateY?: number;
  size?: number;
  auditId?: string;
}> = ({children, x = 150, y = 88, opacity = 1, translateY = 0, size = 64, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      ...TYPE.hero,
      fontSize: size,
      color: COLOR.text.primary,
      opacity,
      transform: `translateY(${translateY}px)`,
    }}
  >
    {children}
  </div>
);
