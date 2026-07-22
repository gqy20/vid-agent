import episode from '../../../../../claude-code-course/episodes/ep03-agentic-loop.json';
import {seconds} from '../timeline';

export const EP03_AGENTIC_LOOP_EPISODE = episode;

export const EP03_AGENTIC_LOOP_SCENES = episode.scenes.map((scene) => ({
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

export const EP03_AGENTIC_LOOP_DURATION_IN_FRAMES = seconds(episode.durationSeconds);

export const getEp03Scene = (id: string) => {
  const scene = EP03_AGENTIC_LOOP_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP03 scene: ${id}`);
  return scene;
};
