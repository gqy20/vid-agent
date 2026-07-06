import {CHAPTERS, type ChapterKind} from './story';

export type SceneId = ChapterKind;

export type SceneSpec = {
  id: SceneId;
  label: string;
  start: number;
  durationInFrames: number;
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const SCENE_DURATION = FPS * 15;
export const DURATION_IN_FRAMES = FPS * 180;

export const SCENES: SceneSpec[] = CHAPTERS.map((chapter, index) => ({
  id: chapter.id,
  label: chapter.title,
  start: SCENE_DURATION * index,
  durationInFrames: SCENE_DURATION,
}));

export const getSceneStart = (id: SceneId) => {
  const scene = SCENES.find((item) => item.id === id);
  if (!scene) {
    throw new Error(`Unknown Deadline Cut scene: ${id}`);
  }
  return scene.start;
};
