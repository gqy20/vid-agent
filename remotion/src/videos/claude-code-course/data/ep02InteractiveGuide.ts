import episode from '../../../../../claude-code-course/episodes/ep02-interactive-guide.json';
import {seconds} from '../timeline';

export const EP02_INTERACTIVE_GUIDE_EPISODE = episode;

export const EP02_INTERACTIVE_GUIDE_SCENES = episode.scenes.map((scene) => ({
  id: scene.id,
  title: scene.title,
  duration: seconds(scene.duration),
  start: seconds(scene.start),
})) as readonly {
  id: string;
  title: string;
  duration: number;
  start: number;
}[];

export const EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES = seconds(episode.durationSeconds);

export const getEp02Scene = (id: string) => {
  const scene = EP02_INTERACTIVE_GUIDE_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP02 scene: ${id}`);
  return scene;
};
