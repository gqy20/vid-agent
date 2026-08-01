import {COLOR, FONT, WEIGHT} from '../../palette';
import type {CourseScene} from './CourseLayout';

const getActiveIndex = (scenes: readonly CourseScene[], currentFrame: number) => {
  let cursor = 0;
  for (let idx = 0; idx < scenes.length; idx++) {
    const scene = scenes[idx];
    if (currentFrame >= cursor && currentFrame < cursor + scene.duration) return idx;
    cursor += scene.duration;
  }
  return Math.max(0, scenes.length - 1);
};

export const ChapterProgress: React.FC<{
  scenes: readonly CourseScene[];
  currentFrame: number;
}> = ({scenes, currentFrame}) => {
  const activeIndex = getActiveIndex(scenes, currentFrame);
  const activeScene = scenes[activeIndex];

  return (
    <div
      data-audit-id="chapter-progress"
      style={{width: 620, minWidth: 0, justifySelf: 'center', display: 'grid', fontFamily: FONT.ui, fontSynthesis: 'none'}}
    >
      <div style={{display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'baseline', minWidth: 0, whiteSpace: 'nowrap'}}>
        <span
          style={{
            color: COLOR.text.tertiary,
            fontSize: 16,
            fontWeight: WEIGHT.semibold,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            flexShrink: 0,
          }}
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
        </span>
        <span
          style={{
            color: COLOR.text.secondary,
            fontSize: 17,
            fontWeight: WEIGHT.medium,
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeScene?.title}
        </span>
      </div>
    </div>
  );
};
