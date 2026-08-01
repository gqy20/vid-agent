import {HEIGHT, WIDTH} from '../../timeline';
import type {Rect} from './geometry';

export const COURSE_RECTS = {
  frame: {x: 0, y: 0, width: WIDTH, height: HEIGHT},
  header: {x: 72, y: 24, width: 1776, height: 56},
  question: {x: 132, y: 112, width: 1656, height: 752},
  centerModel: {x: 132, y: 104, width: 1656, height: 760},
  modelBody: {x: 180, y: 238, width: 1560, height: 620},
  terminal: {x: 250, y: 132, width: 1420, height: 720},
  stateTransition: {x: 132, y: 112, width: 1656, height: 748},
  takeaway: {x: 164, y: 136, width: 1592, height: 724},
  subtitle: {x: 300, y: 900, width: 1320, height: 116},
} as const satisfies Record<string, Rect>;

export type SceneStagePreset = 'question' | 'center-model' | 'terminal' | 'state-transition' | 'takeaway';

export const SCENE_STAGE_RECTS: Record<SceneStagePreset, Rect> = {
  question: COURSE_RECTS.question,
  'center-model': COURSE_RECTS.centerModel,
  terminal: COURSE_RECTS.terminal,
  'state-transition': COURSE_RECTS.stateTransition,
  takeaway: COURSE_RECTS.takeaway,
};
