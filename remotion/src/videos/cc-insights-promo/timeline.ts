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
    label: '痛点钩子',
    durationInFrames: 240,
    transitionAfter: {kind: 'slide-from-bottom', durationInFrames: 20},
  },
  {
    id: 'brand',
    label: '品牌亮相',
    durationInFrames: 156,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'rec',
    label: 'rec 诊断',
    durationInFrames: 396,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'tok',
    label: 'tok Token 拆解',
    durationInFrames: 276,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'cmd',
    label: 'cmd 命令失败率',
    durationInFrames: 276,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'web',
    label: 'web Dashboard',
    durationInFrames: 306,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'features',
    label: '卖点',
    durationInFrames: 336,
    transitionAfter: {kind: 'fade', durationInFrames: 16},
  },
  {
    id: 'cta',
    label: 'CTA',
    durationInFrames: 216,
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
