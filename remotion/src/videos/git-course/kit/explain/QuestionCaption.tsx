import {CaptionLayer} from './CaptionLayer';

export const QuestionCaption: React.FC<{
  children: React.ReactNode;
  bottom?: number;
  width?: number;
  fontSize?: number;
  opacity?: number;
  translateY?: number;
  auditId?: string;
}> = ({children, bottom = 132, width = 920, fontSize, opacity = 1, translateY = 0, auditId}) => (
  <CaptionLayer variant="question" bottom={bottom} width={width} fontSize={fontSize} opacity={opacity} translateY={translateY} auditId={auditId}>
    {children}
  </CaptionLayer>
);
