import {AbsoluteFill} from 'remotion';
import {COLOR, FONT, WEIGHT} from '../../palette';
import {ChapterProgress} from './ChapterProgress';
import {VideoProgress} from './VideoProgress';

export type CourseScene = {
  id: string;
  title: string;
  duration: number;
};

export const CourseLayout: React.FC<{
  seriesTitle: string;
  episodeTitle: string;
  scenes?: readonly CourseScene[];
  currentFrame?: number;
  showHeader?: boolean | ((frame: number) => boolean);
  showEpisodeTitle?: boolean | ((frame: number) => boolean);
  children: React.ReactNode;
}> = ({seriesTitle, episodeTitle, scenes, currentFrame = 0, showHeader = true, showEpisodeTitle = true, children}) => {
  const shouldShowHeader = typeof showHeader === 'function' ? showHeader(currentFrame) : showHeader;
  const shouldShowEpisodeTitle = typeof showEpisodeTitle === 'function' ? showEpisodeTitle(currentFrame) : showEpisodeTitle;

  return (
    <AbsoluteFill style={{background: COLOR.canvas.base, fontFamily: FONT.sans, color: COLOR.text.primary}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, ${COLOR.effects.mainWash} 0%, transparent 36%, ${COLOR.effects.featureWash} 100%)`,
        }}
      />
      <header
        style={{
          position: 'absolute',
          left: 72,
          top: 22,
          right: 72,
          height: 42,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          borderBottom: `1px solid ${COLOR.stroke.default}`,
          fontFamily: FONT.ui,
          fontSynthesis: 'none',
          zIndex: 20,
          opacity: shouldShowHeader ? 1 : 0,
        }}
      >
        <div
          style={{
            color: COLOR.text.secondary,
            fontSize: 17,
            fontWeight: WEIGHT.medium,
            lineHeight: 1.15,
            letterSpacing: '0.01em',
          }}
        >
          {seriesTitle}
        </div>
        {scenes ? <ChapterProgress scenes={scenes} currentFrame={currentFrame} /> : null}
        <div
          style={{
            color: COLOR.text.primary,
            fontSize: 19,
            fontWeight: WEIGHT.semibold,
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            justifySelf: 'end',
            opacity: shouldShowEpisodeTitle ? 1 : 0,
          }}
        >
          {episodeTitle}
        </div>
      </header>
      {children}
      {scenes ? <VideoProgress scenes={scenes} currentFrame={currentFrame} /> : null}
    </AbsoluteFill>
  );
};
