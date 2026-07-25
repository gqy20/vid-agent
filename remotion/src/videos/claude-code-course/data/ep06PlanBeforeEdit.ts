import episode from '../../../../../claude-code-course/episodes/ep06-plan-before-edit.json';
import {seconds} from '../timeline';

export const EP06_PLAN_BEFORE_EDIT_EPISODE = episode;
export const EP06_PLAN_BEFORE_EDIT_SCENES = episode.scenes.map((scene) => ({
  id: scene.id,
  title: scene.title,
  duration: seconds(scene.duration),
  start: seconds(scene.start),
})) as readonly {id: string; title: string; duration: number; start: number}[];
export const EP06_PLAN_BEFORE_EDIT_DURATION_IN_FRAMES = seconds(episode.durationSeconds);
export const getEp06Scene = (id: string) => {
  const scene = EP06_PLAN_BEFORE_EDIT_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP06 scene: ${id}`);
  return scene;
};
