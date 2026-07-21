import {CaptionLayer} from './CaptionLayer';

export const SceneCaption: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  bottom?: number;
  width?: number;
  fontSize?: number;
  translateY?: number;
  auditId?: string;
}> = ({children, opacity = 1, bottom = 112, width = 1040, fontSize, translateY = 0, auditId}) => {
  return (
    <CaptionLayer variant="scene" opacity={opacity} bottom={bottom} width={width} fontSize={fontSize} translateY={translateY} auditId={auditId}>
      {children}
    </CaptionLayer>
  );
};
