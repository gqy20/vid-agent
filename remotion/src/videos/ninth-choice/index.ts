import type {VideoRegistration} from '../types';
import {NinthChoice} from './NinthChoice';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'ninth-choice',
  compositions: [
    {
      id: 'NinthChoice',
      component: NinthChoice,
      durationInFrames: DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
