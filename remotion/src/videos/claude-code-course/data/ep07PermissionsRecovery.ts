import episode from '../../../../../claude-code-course/episodes/ep07-permissions-recovery.json';
import {seconds} from '../timeline';

export const EP07_PERMISSIONS_RECOVERY_EPISODE = episode;
export const EP07_PERMISSIONS_RECOVERY_SCENES = episode.scenes.map((scene) => ({id: scene.id, title: scene.title, duration: seconds(scene.duration), start: seconds(scene.start)})) as readonly {id: string; title: string; duration: number; start: number}[];
export const EP07_PERMISSIONS_RECOVERY_DURATION_IN_FRAMES = seconds(episode.durationSeconds);
export const getEp07Scene = (id: string) => {
  const scene = EP07_PERMISSIONS_RECOVERY_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP07 scene: ${id}`);
  return scene;
};
