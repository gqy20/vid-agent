import {AbsoluteFill} from 'remotion';
import {FRAME} from '../../spacing';

// A browser remains in one screen-space coordinate system while the lesson
// changes from interaction to evidence. The browser keeps the recording's
// native 1600px teaching width and crops low-value page content below the
// viewport. The dedicated lane below it belongs to narration subtitles.
export const BrowserStage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: FRAME.browserTop,
        width: FRAME.browserWidth,
        height: FRAME.browserHeight,
        maxWidth: `calc(100% - ${FRAME.gutter * 2}px)`,
        transform: 'translateX(-50%)',
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);
