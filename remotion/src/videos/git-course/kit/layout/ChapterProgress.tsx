import {COLOR, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';
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
    <div data-audit-id="chapter-progress" style={{width: 300, justifySelf: 'center', display: 'grid'}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'baseline'}}>
        <span style={{...TYPE.uiSmall, color: COLOR.text.tertiary, fontWeight: WEIGHT.bold}}>
          {String(activeIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
        </span>
        <span style={{...TYPE.uiSmall, color: COLOR.text.secondary, fontWeight: WEIGHT.bold}}>
          {activeScene?.title}
        </span>
      </div>
    </div>
  );
};
