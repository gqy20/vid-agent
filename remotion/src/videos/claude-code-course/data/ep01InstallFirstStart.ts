import episode from '../../../../../claude-code-course/episodes/ep01-install-first-start.json';
import {seconds} from '../timeline';

export const EP01_INSTALL_FIRST_START_EPISODE = episode;

export const EP01_INSTALL_FIRST_START_SCENES = episode.scenes.map((scene) => ({
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

export const EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES = seconds(episode.durationSeconds);

export const getEp01Scene = (id: string) => {
  const scene = EP01_INSTALL_FIRST_START_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP01 scene: ${id}`);
  return scene;
};
