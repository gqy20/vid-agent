import type {VideoRegistration} from '../types';
import {Ep01Install, EP01_DURATION_IN_FRAMES} from './episodes/Ep01Install';
import {FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'claude-code-course',
  compositions: [
    {
      id: 'ClaudeCodeCourseEp01Install',
      component: Ep01Install,
      durationInFrames: EP01_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
