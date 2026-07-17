import type {VideoRegistration} from '../types';
import {ComponentGallery, GITHUB_COURSE_GALLERY_DURATION} from './ComponentGallery';
import {FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'github-course',
  compositions: [
    {
      id: 'GitHubCourseComponentGallery',
      component: ComponentGallery,
      durationInFrames: GITHUB_COURSE_GALLERY_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
