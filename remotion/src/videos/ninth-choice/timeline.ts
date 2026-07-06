export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENES = [
  {id: 'table', title: '志愿表前', duration: 22 * FPS},
  {id: 'setup', title: '打开模拟器', duration: 20 * FPS},
  {id: 'arrival', title: '第一轮', duration: 20 * FPS},
  {id: 'club', title: '第二轮', duration: 20 * FPS},
  {id: 'pattern', title: '模拟器暂停', duration: 20 * FPS},
  {id: 'restart', title: '重开一次', duration: 20 * FPS},
  {id: 'montage', title: '新的选择轨迹', duration: 36 * FPS},
  {id: 'ending', title: '人设卡生成', duration: 17 * FPS},
  {id: 'final', title: '第九个志愿', duration: 14 * FPS},
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

export const DURATION_IN_FRAMES = SCENES.reduce(
  (sum, scene) => sum + scene.duration,
  0,
);

export const getSceneStart = (id: SceneId) => {
  let cursor = 0;
  for (const scene of SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown ninth-choice scene: ${id}`);
};
