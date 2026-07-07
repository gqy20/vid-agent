import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const QuestionCaption: React.FC<{
  children: React.ReactNode;
  bottom?: number;
  width?: number;
  opacity?: number;
  translateY?: number;
  auditId?: string;
}> = ({children, bottom = 132, width = 920, opacity = 1, translateY = 0, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: '50%',
      bottom,
      width,
      ...TYPE.subtitle,
      color: COLOR.text.primary,
      opacity,
      textAlign: 'center',
      transform: `translate(-50%, ${translateY}px)`,
    }}
  >
    {children}
  </div>
);
