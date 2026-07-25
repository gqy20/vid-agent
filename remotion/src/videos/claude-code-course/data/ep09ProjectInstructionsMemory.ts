import episode from '../../../../../claude-code-course/episodes/ep09-project-instructions-memory.json';
import {seconds} from '../timeline';

export const EP09_PROJECT_INSTRUCTIONS_MEMORY_EPISODE = episode;
export const EP09_PROJECT_INSTRUCTIONS_MEMORY_SCENES = episode.scenes.map((scene) => ({id: scene.id, title: scene.title, duration: seconds(scene.duration), start: seconds(scene.start)})) as readonly {id: string; title: string; duration: number; start: number}[];
export const EP09_PROJECT_INSTRUCTIONS_MEMORY_DURATION_IN_FRAMES = seconds(episode.durationSeconds);
export const getEp09Scene = (id: string) => {const scene = EP09_PROJECT_INSTRUCTIONS_MEMORY_SCENES.find((item) => item.id === id); if (!scene) throw new Error(`Unknown EP09 scene: ${id}`); return scene;};
