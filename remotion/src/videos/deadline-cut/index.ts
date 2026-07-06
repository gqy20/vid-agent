import {DeadlineCut} from './DeadlineCut';
import {ACTOR_DURATION_IN_FRAMES, ACTOR_FPS, DeadlineCutActors} from './DeadlineCutActors';
import {DeadlineCutStoryboard, STORYBOARD_DURATION_IN_FRAMES, STORYBOARD_FPS} from './DeadlineCutStoryboard';
import type {VideoRegistration} from '../types';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'deadline-cut',
  compositions: [
    {
      id: 'DeadlineCut',
      component: DeadlineCut,
      durationInFrames: DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'DeadlineCutActors',
      component: DeadlineCutActors,
      durationInFrames: ACTOR_DURATION_IN_FRAMES,
      fps: ACTOR_FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'DeadlineCutStoryboard',
      component: DeadlineCutStoryboard,
      durationInFrames: STORYBOARD_DURATION_IN_FRAMES,
      fps: STORYBOARD_FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
