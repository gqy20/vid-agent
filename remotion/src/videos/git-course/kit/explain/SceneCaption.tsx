import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

const cleanCaptionText = (text: string) => text.replace(/[。；;]+$/g, '').replace(/(?<=[\p{Script=Han}A-Za-z0-9])\.$/u, '');

export const SceneCaption: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  bottom?: number;
  width?: number;
  fontSize?: number;
  translateY?: number;
  auditId?: string;
}> = ({children, opacity = 1, bottom = 112, width = 1040, fontSize, translateY = 0, auditId}) => {
  const caption = typeof children === 'string' ? cleanCaptionText(children) : children;

  return (
    <div
      data-audit-id={auditId}
      style={{
        position: 'absolute',
        left: '50%',
        bottom,
        width,
        transform: `translate(-50%, ${translateY}px)`,
        textAlign: 'center',
        ...TYPE.subtitle,
        fontSize: fontSize ?? TYPE.subtitle.fontSize,
        color: COLOR.text.primary,
        opacity,
      }}
    >
      {caption}
    </div>
  );
};
