import {useCurrentFrame} from 'remotion';
import {COLOR, SCENE, TYPE} from '../designTokens';
import {EASE, MOTION, motionProgress} from '../motion';

export const SceneQuestion: React.FC<{
  title: string;
  detail?: string;
  align?: 'left' | 'center';
  enterAt?: number;
  handoffAt?: number;
  top?: number;
}> = ({title, detail, align = 'center', enterAt = 0, handoffAt, top = SCENE.question.top}) => {
  const frame = useCurrentFrame();
  const enter = motionProgress(frame, enterAt, MOTION.structural, EASE.enter);
  const handoff = handoffAt === undefined
    ? 0
    : motionProgress(frame, handoffAt, MOTION.evidenceHandoff, EASE.editorial);
  const opacity = enter * (1 - handoff * (1 - SCENE.question.handoffOpacity));
  const scale = 0.985 + enter * 0.015 - handoff * (1 - SCENE.question.handoffScale);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top,
        width: SCENE.question.maxWidth,
        translate: `-50% ${(1 - enter) * 16 - handoff * 8}px`,
        scale,
        transformOrigin: align === 'center' ? 'center top' : 'left top',
        textAlign: align,
        opacity,
      }}
    >
      <div style={{...TYPE.heading, color: COLOR.text.primary}}>{title}</div>
      {detail ? <div style={{...TYPE.body, color: COLOR.text.secondary, marginTop: 12}}>{detail}</div> : null}
    </div>
  );
};
