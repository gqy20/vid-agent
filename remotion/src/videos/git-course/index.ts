import type {VideoRegistration} from '../types';
import {ComponentGallery} from './ComponentGallery';
import {Ep04BranchIsPointer} from './episodes/Ep04BranchIsPointer';
import {RefLightboxIntro} from './kit';
import {DURATION_IN_FRAMES, FPS, HEIGHT, seconds, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'git-course',
  compositions: [
    {
      id: 'GitCourseVisibleSystemIntro',
      component: RefLightboxIntro,
      durationInFrames: seconds(7),
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp04BranchIsPointer',
      component: Ep04BranchIsPointer,
      durationInFrames: DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentGallery',
      component: ComponentGallery,
      durationInFrames: seconds(6),
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
