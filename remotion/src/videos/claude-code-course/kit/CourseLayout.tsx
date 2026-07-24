import {AbsoluteFill} from 'remotion';
import {COLOR, FONT, TYPE} from '../designTokens';

export type CourseScene = {
  id: string;
  title: string;
  duration: number;
};

const getActiveIndex = (scenes: readonly CourseScene[], currentFrame: number) => {
  let cursor = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    if (currentFrame >= cursor && currentFrame < cursor + scene.duration) return index;
    cursor += scene.duration;
  }
  return Math.max(0, scenes.length - 1);
};

const VideoProgress: React.FC<{scenes: readonly CourseScene[]; currentFrame: number}> = ({scenes, currentFrame}) => {
  const total = Math.max(1, scenes.reduce((sum, scene) => sum + scene.duration, 0));
  const progress = Math.min(1, Math.max(0, currentFrame / total));
  let cursor = 0;
  const starts = scenes.map((scene) => {
    const start = cursor;
    cursor += scene.duration;
    return {scene, start};
  });

  return (
    <div
      data-audit-id="claude-course-video-progress"
      style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, zIndex: 60, background: COLOR.stroke.soft}}
    >
      <div style={{height: '100%', width: `${progress * 100}%`, background: COLOR.brand.orange}} />
      {starts.slice(1).map(({scene, start}) => (
        <div
          key={scene.id}
          style={{
            position: 'absolute',
            left: `${(start / total) * 100}%`,
            bottom: 0,
            width: 2,
            height: 12,
            background: COLOR.canvas.raised,
            borderLeft: `1px solid ${COLOR.stroke.default}`,
          }}
        />
      ))}
    </div>
  );
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
  const activeIndex = scenes ? getActiveIndex(scenes, currentFrame) : 0;
  return (
    <AbsoluteFill style={{background: COLOR.canvas.paper, color: COLOR.text.primary, fontFamily: FONT.sans}}>
      <header
        style={{
          position: 'absolute',
          left: 72,
          top: 24,
          right: 72,
          height: 38,
          zIndex: 20,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          borderBottom: `1px solid ${COLOR.stroke.soft}`,
          opacity: shouldShowHeader ? 1 : 0,
        }}
      >
        <div style={{...TYPE.chrome, color: COLOR.text.secondary}}>{seriesTitle}</div>
        {scenes ? (
          <div data-audit-id="claude-course-chapter-progress" style={{display: 'flex', alignItems: 'baseline', gap: 9}}>
            <span style={{...TYPE.chromeIndex, color: COLOR.text.tertiary, fontVariantNumeric: 'tabular-nums'}}>
              {String(activeIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
            </span>
          </div>
        ) : null}
        <div
          style={{
            ...TYPE.chromeStrong,
            justifySelf: 'end',
            color: COLOR.text.primary,
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
