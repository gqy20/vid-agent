export type TransitionKind = 'fade' | 'slide-from-bottom';

export type SceneId =
  | 'hook'
  | 'brand'
  | 'rec'
  | 'tok'
  | 'cmd'
  | 'web'
  | 'features'
  | 'cta';

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
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const SCENES = [
  {
    id: 'hook',
    label: '异常现场',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'brand',
    label: '真实 finding',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'rec',
    label: '判断到动作',
    durationInFrames: 240,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'tok',
    label: '证据下钻',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'cmd',
    label: '命令归因',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'web',
    label: '成本定位',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'features',
    label: '修复位置',
    durationInFrames: 210,
    transitionAfter: {kind: 'fade', durationInFrames: 14},
  },
  {
    id: 'cta',
    label: 'CTA',
    durationInFrames: 180,
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
    throw new Error(`Unknown CCInsights scene: ${id}`);
  }
  return scene;
};

export const isSceneId = (value: string): value is SceneId =>
  SCENES.some((scene) => scene.id === value);
