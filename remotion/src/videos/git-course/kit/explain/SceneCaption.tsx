import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const SceneCaption: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  bottom?: number;
  width?: number;
  auditId?: string;
}> = ({children, opacity = 1, bottom = 112, width = 1040, auditId}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      left: '50%',
      bottom,
      width,
      transform: 'translateX(-50%)',
      textAlign: 'center',
      ...TYPE.subtitle,
      color: COLOR.text.primary,
      opacity,
    }}
  >
    {children}
  </div>
);
