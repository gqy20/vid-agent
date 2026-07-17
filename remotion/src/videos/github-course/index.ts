import type {VideoRegistration} from '../types';
import {ComponentGallery, GITHUB_COURSE_GALLERY_DURATION} from './ComponentGallery';
import {GH01_DURATION_IN_FRAMES, Gh01GitVsGithub} from './episodes/Gh01GitVsGithub';
import {FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'github-course',
  compositions: [
    {
      id: 'GitHubCourseGh01GitVsGithub',
      component: Gh01GitVsGithub,
      durationInFrames: GH01_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
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
