export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const seconds = (value: number) => Math.round(value * FPS);

export const SCENES = [
  {id: 'hook', title: '问题', duration: seconds(12)},
  {id: 'mental-model', title: '模型', duration: seconds(18)},
  {id: 'terminal', title: '命令', duration: seconds(18)},
  {id: 'branch-write', title: '写入 ref', duration: seconds(22)},
  {id: 'branch-result', title: '分支出现', duration: seconds(28)},
  {id: 'switch', title: 'HEAD 切换', duration: seconds(24)},
  {id: 'commit', title: 'feature 前进', duration: seconds(32)},
  {id: 'compare', title: '对比', duration: seconds(14)},
  {id: 'takeaway', title: '结论', duration: seconds(12)},
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
  throw new Error(`Unknown git-course scene: ${id}`);
};

export const getSceneDuration = (id: SceneId) => {
  const scene = SCENES.find((item) => item.id === id);
  if (!scene) throw new Error(`Unknown git-course scene: ${id}`);
  return scene.duration;
};

export const sceneTime = (id: SceneId, offsetSeconds = 0) =>
  getSceneStart(id) + seconds(offsetSeconds);
