import type {VideoRegistration} from '../types';
import {PrototypeGitObject, PROTOTYPE_DURATION} from './PrototypeGitObject';

export const registration: VideoRegistration = {
  slug: 'git-course-lab',
  compositions: [
    {
      id: 'GitCourseLabPrototypeGitObject',
      component: PrototypeGitObject,
      durationInFrames: PROTOTYPE_DURATION,
      fps: 30,
      width: 1920,
      height: 1080,
    },
  ],
};

