import episode from '../../../../../claude-code-course/episodes/ep08-verification-evidence.json';
import {seconds} from '../timeline';

export const EP08_VERIFICATION_EVIDENCE_EPISODE = episode;
export const EP08_VERIFICATION_EVIDENCE_SCENES = episode.scenes.map((scene) => ({id: scene.id, title: scene.title, duration: seconds(scene.duration), start: seconds(scene.start)})) as readonly {id: string; title: string; duration: number; start: number}[];
export const EP08_VERIFICATION_EVIDENCE_DURATION_IN_FRAMES = seconds(episode.durationSeconds);
export const getEp08Scene = (id: string) => {const scene = EP08_VERIFICATION_EVIDENCE_SCENES.find((item) => item.id === id); if (!scene) throw new Error(`Unknown EP08 scene: ${id}`); return scene;};
