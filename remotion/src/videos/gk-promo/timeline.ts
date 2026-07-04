export type TransitionKind = 'fade' | 'slide-from-bottom';

export type SceneId = 'hook' | 'brand' | 'map' | 'future' | 'simulator' | 'cta';

export type SceneSpec = {
  id: SceneId;
  label: string;
  durationInFrames: number;
  transitionAfter?: {
    kind: TransitionKind;
    durationInFrames: number;
  };
};

export const FPS = 30;
export const WIDTH = 1080; // 9:16 竖版
export const HEIGHT = 1920;

/* 6 场景（删 features，命中 taste.md "功能点罗列" 禁用）。
 * Σ场景 816 − Σ转场 70 = 746 帧 ≈ 24.87s。配音字数按 ≤ 秒数×3.5 严守预算。 */
export const SCENES = [
  {
    id: 'hook',
    label: '痛点钩子',
    durationInFrames: 120,
    transitionAfter: {kind: 'slide-from-bottom', durationInFrames: 14},
  },
  {
    id: 'brand',
    label: '品牌亮相',
    durationInFrames: 96,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'map',
    label: '高校地图',
    durationInFrames: 150,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'future',
    label: '未来预演',
    durationInFrames: 180,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'simulator',
    label: '模拟器',
    durationInFrames: 150,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'cta',
    label: 'CTA',
    durationInFrames: 120,
  },
] as const satisfies readonly SceneSpec[];

export const TOTAL_TRANSITION_FRAMES = SCENES.reduce(
  (sum, scene) =>
    sum +
    ('transitionAfter' in scene ? scene.transitionAfter.durationInFrames : 0),
  0,
);

export const TOTAL_SCENE_FRAMES = SCENES.reduce(
  (sum, scene) => sum + scene.durationInFrames,
  0,
);

export const TOTAL_DURATION_IN_FRAMES = TOTAL_SCENE_FRAMES - TOTAL_TRANSITION_FRAMES;

export const DEFAULT_SEGMENT_ID: SceneId = SCENES[0].id;

export const getScene = (id: SceneId): SceneSpec => {
  const scene = SCENES.find((item) => item.id === id);
  if (!scene) {
    throw new Error(`Unknown GK scene: ${id}`);
  }
  return scene;
};

export const isSceneId = (value: string): value is SceneId =>
  SCENES.some((scene) => scene.id === value);
