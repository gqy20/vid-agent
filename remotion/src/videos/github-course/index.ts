import type {VideoRegistration} from '../types';
import {ComponentGallery, GITHUB_COURSE_GALLERY_DURATION} from './ComponentGallery';
import {GH01_DURATION_IN_FRAMES, Gh01GitVsGithub} from './episodes/Gh01GitVsGithub';
import {
  GITHUB_COURSE_INTRO_DURATION,
  GITHUB_COURSE_OUTRO_DURATION,
  GitHubCourseIntro,
  GitHubCourseOutro,
} from './kit';
import {FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'github-course',
  compositions: [
    {
      id: 'GitHubCourseVisibleCollaborationIntro',
      component: GitHubCourseIntro,
      durationInFrames: GITHUB_COURSE_INTRO_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitHubCourseVisibleCollaborationOutro',
      component: GitHubCourseOutro,
      durationInFrames: GITHUB_COURSE_OUTRO_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
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
