import episode from '../../../../../claude-code-course/episodes/ep04-understand-project.json';
import {seconds} from '../timeline';

export const EP04_UNDERSTAND_PROJECT_EPISODE = episode;

export const EP04_UNDERSTAND_PROJECT_SCENES = episode.scenes.map((scene) => ({
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

export const EP04_UNDERSTAND_PROJECT_DURATION_IN_FRAMES = seconds(episode.durationSeconds);

export const getEp04Scene = (id: string) => {
  const scene = EP04_UNDERSTAND_PROJECT_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP04 scene: ${id}`);
  return scene;
};
