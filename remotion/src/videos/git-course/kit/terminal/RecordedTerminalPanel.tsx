import {Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {TERMINAL_HEADER_HEIGHT, TerminalPanel} from './TerminalPanel';

export const RecordedTerminalPanel: React.FC<{
  src: string;
  holdFrameSrc?: string;
  holdFromFrame?: number;
  title?: string;
  mediaFit?: 'fill' | 'cover';
  playbackRate?: number;
  startFromFrame?: number;
}> = ({src, holdFrameSrc, holdFromFrame = Number.POSITIVE_INFINITY, title = 'git-course-lab', mediaFit = 'fill', playbackRate = 1, startFromFrame = 0}) => {
  const frame = useCurrentFrame();
  const compositionHoldFrame = Math.max(0, holdFromFrame - startFromFrame) / playbackRate;
  const mediaStyle = {
    width: '100%',
    height: `calc(100% - ${TERMINAL_HEADER_HEIGHT}px)`,
    objectFit: mediaFit,
    objectPosition: 'top',
    display: 'block',
  } as const;

  return (
    <TerminalPanel title={title}>
      {holdFrameSrc && frame >= compositionHoldFrame ? (
        <Img src={staticFile(holdFrameSrc)} style={mediaStyle} />
      ) : (
        <OffthreadVideo src={staticFile(src)} muted playbackRate={playbackRate} startFrom={startFromFrame} style={mediaStyle} />
      )}
    </TerminalPanel>
  );
};
