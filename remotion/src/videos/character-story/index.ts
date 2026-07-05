import {CharacterStory30} from './CharacterStory30';
import type {VideoRegistration} from '../types';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'character-story',
  compositions: [
    {
      id: 'CharacterStory30',
      component: CharacterStory30,
      durationInFrames: DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
