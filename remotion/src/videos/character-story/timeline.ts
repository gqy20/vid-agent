export type SceneId = 'open' | 'team' | 'workflow' | 'direction' | 'delivery';

export type SceneSpec = {
  id: SceneId;
  label: string;
  start: number;
  durationInFrames: number;
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const SCENE_DURATION = FPS * 6;
export const DURATION_IN_FRAMES = FPS * 30;

export const SCENES: SceneSpec[] = [
  {id: 'open', label: '目标', start: 0, durationInFrames: SCENE_DURATION},
  {id: 'team', label: '三人组', start: SCENE_DURATION, durationInFrames: SCENE_DURATION},
  {
    id: 'workflow',
    label: '生成链路',
    start: SCENE_DURATION * 2,
    durationInFrames: SCENE_DURATION,
  },
  {
    id: 'direction',
    label: '八方向',
    start: SCENE_DURATION * 3,
    durationInFrames: SCENE_DURATION,
  },
  {
    id: 'delivery',
    label: '交付',
    start: SCENE_DURATION * 4,
    durationInFrames: SCENE_DURATION,
  },
];

export const getScene = (id: SceneId): SceneSpec => {
  const scene = SCENES.find((item) => item.id === id);
  if (!scene) {
    throw new Error(`Unknown character story scene: ${id}`);
  }
  return scene;
};
