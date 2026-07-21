import {AbsoluteFill} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {FRAME} from '../../spacing';
import {TYPE} from '../../typography';

export const GitHubCourseLayout: React.FC<{
  seriesTitle?: string;
  episodeTitle: string;
  currentFrame?: number;
  durationInFrames?: number;
  showHeader?: boolean;
  showProgress?: boolean;
  children: React.ReactNode;
}> = ({
  seriesTitle = '看得见的 GitHub',
  episodeTitle,
  currentFrame = 0,
  durationInFrames,
  showHeader = true,
  showProgress = true,
  children,
}) => {
  const progress = durationInFrames ? Math.min(1, Math.max(0, currentFrame / durationInFrames)) : 0;

  return (
    <AbsoluteFill style={{background: COLOR.canvas.base, color: COLOR.text.primary, fontFamily: FONT.sans}}>
      {showHeader ? (
        <header
          style={{
            position: 'absolute',
            left: FRAME.gutter,
            top: FRAME.headerTop,
            right: FRAME.gutter,
            height: 42,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${COLOR.stroke.soft}`,
            zIndex: 20,
          }}
        >
          <div style={{...TYPE.uiSmall, color: COLOR.text.secondary, fontWeight: WEIGHT.medium}}>{seriesTitle}</div>
          <div style={{...TYPE.ui, color: COLOR.text.primary}}>{episodeTitle}</div>
        </header>
      ) : null}
      {children}
      {durationInFrames && showProgress ? (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: COLOR.stroke.soft}}>
          <div style={{height: '100%', width: `${progress * 100}%`, background: COLOR.github.action}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
