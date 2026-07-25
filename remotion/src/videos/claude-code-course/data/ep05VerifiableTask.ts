import episode from '../../../../../claude-code-course/episodes/ep05-verifiable-task.json';
import {seconds} from '../timeline';

export const EP05_VERIFIABLE_TASK_EPISODE = episode;

export const EP05_VERIFIABLE_TASK_SCENES = episode.scenes.map((scene) => ({
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

export const EP05_VERIFIABLE_TASK_DURATION_IN_FRAMES = seconds(episode.durationSeconds);

export const getEp05Scene = (id: string) => {
  const scene = EP05_VERIFIABLE_TASK_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP05 scene: ${id}`);
  return scene;
};
