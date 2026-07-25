import episode from '../../../../../claude-code-course/episodes/ep10-issue-to-pr.json';
import {seconds} from '../timeline';

export const EP10_ISSUE_TO_PR_EPISODE = episode;
export const EP10_ISSUE_TO_PR_SCENES = episode.scenes.map((scene) => ({
  id: scene.id,
  title: scene.title,
  duration: seconds(scene.duration),
  start: seconds(scene.start),
})) as readonly {id: string; title: string; duration: number; start: number}[];
export const EP10_ISSUE_TO_PR_DURATION_IN_FRAMES = seconds(episode.durationSeconds);
export const getEp10Scene = (id: string) => {
  const scene = EP10_ISSUE_TO_PR_SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown EP10 scene: ${id}`);
  return scene;
};
