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
import {
  Ep04UnderstandProject,
  EP04_UNDERSTAND_PROJECT_DURATION_IN_FRAMES,
} from './episodes/Ep04UnderstandProject';
import {
  Ep05VerifiableTask,
  EP05_VERIFIABLE_TASK_DURATION_IN_FRAMES,
} from './episodes/Ep05VerifiableTask';
import {
  Ep06PlanBeforeEdit,
  EP06_PLAN_BEFORE_EDIT_DURATION_IN_FRAMES,
} from './episodes/Ep06PlanBeforeEdit';
import {
  Ep07PermissionsRecovery,
  EP07_PERMISSIONS_RECOVERY_DURATION_IN_FRAMES,
} from './episodes/Ep07PermissionsRecovery';
import {
  Ep08VerificationEvidence,
  EP08_VERIFICATION_EVIDENCE_DURATION_IN_FRAMES,
} from './episodes/Ep08VerificationEvidence';
import {
  Ep09ProjectInstructionsMemory,
  EP09_PROJECT_INSTRUCTIONS_MEMORY_DURATION_IN_FRAMES,
} from './episodes/Ep09ProjectInstructionsMemory';
import {
  Ep10IssueToPr,
  EP10_ISSUE_TO_PR_DURATION_IN_FRAMES,
} from './episodes/Ep10IssueToPr';
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
    {
      id: 'ClaudeCodeCourseEp04UnderstandProject',
      component: Ep04UnderstandProject,
      durationInFrames: EP04_UNDERSTAND_PROJECT_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp05VerifiableTask',
      component: Ep05VerifiableTask,
      durationInFrames: EP05_VERIFIABLE_TASK_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp06PlanBeforeEdit',
      component: Ep06PlanBeforeEdit,
      durationInFrames: EP06_PLAN_BEFORE_EDIT_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp07PermissionsRecovery',
      component: Ep07PermissionsRecovery,
      durationInFrames: EP07_PERMISSIONS_RECOVERY_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp08VerificationEvidence',
      component: Ep08VerificationEvidence,
      durationInFrames: EP08_VERIFICATION_EVIDENCE_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp09ProjectInstructionsMemory',
      component: Ep09ProjectInstructionsMemory,
      durationInFrames: EP09_PROJECT_INSTRUCTIONS_MEMORY_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'ClaudeCodeCourseEp10IssueToPr',
      component: Ep10IssueToPr,
      durationInFrames: EP10_ISSUE_TO_PR_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
