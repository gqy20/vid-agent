import {CharacterDemo} from './CharacterDemo';
import type {VideoRegistration} from '../types';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'character-demo',
  compositions: [
    {
      id: 'CharacterDemo',
      component: CharacterDemo,
      durationInFrames: DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
