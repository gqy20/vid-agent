import {AbsoluteFill} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export const GitHubCourseLayout: React.FC<{
  seriesTitle?: string;
  episodeTitle: string;
  currentFrame?: number;
  durationInFrames?: number;
  showHeader?: boolean;
  children: React.ReactNode;
}> = ({
  seriesTitle = '看得见的 GitHub',
  episodeTitle,
  currentFrame = 0,
  durationInFrames,
  showHeader = true,
  children,
}) => {
  const progress = durationInFrames ? Math.min(1, Math.max(0, currentFrame / durationInFrames)) : 0;

  return (
    <AbsoluteFill style={{background: COLOR.canvas.base, color: COLOR.text.primary, fontFamily: FONT.sans}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(120deg, ${COLOR.effects.actionWash}, transparent 42%, ${COLOR.effects.mergedWash})`,
        }}
      />
      {showHeader ? (
        <header
          style={{
            position: 'absolute',
            left: 72,
            top: 24,
            right: 72,
            height: 42,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${COLOR.stroke.soft}`,
            zIndex: 20,
          }}
        >
          <div style={{...TYPE.uiSmall, color: COLOR.text.secondary, fontWeight: WEIGHT.bold}}>{seriesTitle}</div>
          <div style={{...TYPE.ui, color: COLOR.text.primary}}>{episodeTitle}</div>
        </header>
      ) : null}
      {children}
      {durationInFrames ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: COLOR.stroke.soft}}>
          <div style={{height: '100%', width: `${progress * 100}%`, background: COLOR.github.action}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
