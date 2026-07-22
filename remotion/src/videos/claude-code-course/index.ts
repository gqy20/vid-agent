import type {VideoRegistration} from '../types';
import {
  Ep01InstallFirstStart,
  EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES,
} from './episodes/Ep01InstallFirstStart';
import {
  Ep02InteractiveGuide,
  EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES,
} from './episodes/Ep02InteractiveGuide';
import {
  Ep03AgenticLoop,
  EP03_AGENTIC_LOOP_DURATION_IN_FRAMES,
} from './episodes/Ep03AgenticLoop';
import {LegacyEp01Install, LEGACY_EP01_DURATION_IN_FRAMES} from './episodes/LegacyEp01Install';
import {FPS, HEIGHT, WIDTH} from './timeline';

export const registration: VideoRegistration = {
  slug: 'claude-code-course',
  compositions: [
    {
      id: 'ClaudeCodeCourseEp01InstallFirstStart',
      component: Ep01InstallFirstStart,
      durationInFrames: EP01_INSTALL_FIRST_START_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseLegacyEp01Install',
      component: LegacyEp01Install,
      durationInFrames: LEGACY_EP01_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp02InteractiveGuide',
      component: Ep02InteractiveGuide,
      durationInFrames: EP02_INTERACTIVE_GUIDE_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp03AgenticLoop',
      component: Ep03AgenticLoop,
      durationInFrames: EP03_AGENTIC_LOOP_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
