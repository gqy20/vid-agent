import type {VideoRegistration} from '../types';
import {
  COMPONENT_LAB_DURATION,
  COMPONENT_LAB_SCENE_DURATION,
  ComponentLab,
  ComponentLabCaptions,
  ComponentLabGraph,
  ComponentLabLayout,
  ComponentLabState,
  ComponentLabStress,
  ComponentLabTerminal,
} from './ComponentLab';
import {
  EP01_DURATION_IN_FRAMES,
  EP01_SCENES,
  Ep01BadModelPreview,
  Ep01IntegrityPreview,
  Ep01LocalHistoryPreview,
  Ep01PracticeCheckPreview,
  Ep01SnapshotModelPreview,
  Ep01TakeawayPreview,
  Ep01VersionControlPreview,
  Ep01WhatGitStores,
  Ep01WhatGitStoresHook,
} from './episodes/Ep01WhatGitStores';
import {EP02_DURATION_IN_FRAMES, Ep02WorkingTreeIndexRepo} from './episodes/Ep02WorkingTreeIndexRepo';
import {EP03_DURATION_IN_FRAMES, Ep03CommitSnapshot} from './episodes/Ep03CommitSnapshot';
import {EP04_DURATION_IN_FRAMES, Ep04BranchIsPointer} from './episodes/Ep04BranchIsPointer';
import {EP05_DURATION_IN_FRAMES, Ep05Head} from './episodes/Ep05Head';
import {EP06_DURATION_IN_FRAMES, Ep06Merge} from './episodes/Ep06Merge';
import {EP07_DURATION_IN_FRAMES, Ep07Rebase} from './episodes/Ep07Rebase';
import {EP08_DURATION_IN_FRAMES, Ep08ResetRevertRestore} from './episodes/Ep08ResetRevertRestore';
import {EP09_DURATION_IN_FRAMES, Ep09DiffComparesStates} from './episodes/Ep09DiffComparesStates';
import {EP10_DURATION_IN_FRAMES, Ep10SelectingRevisions} from './episodes/Ep10SelectingRevisions';
import {EP11_DURATION_IN_FRAMES, Ep11Tags} from './episodes/Ep11Tags';
import {EP12_DURATION_IN_FRAMES, Ep12RemoteTrackingBranches} from './episodes/Ep12RemoteTrackingBranches';
import {EP13_DURATION_IN_FRAMES, Ep13FetchPullPush} from './episodes/Ep13FetchPullPush';
import {EP14_DURATION_IN_FRAMES, Ep14AheadBehindNonFastForward} from './episodes/Ep14AheadBehindNonFastForward';
import {EP15_DURATION_IN_FRAMES, Ep15UnmergedIndex} from './episodes/Ep15UnmergedIndex';
import {EP16_DURATION_IN_FRAMES, Ep16ReflogRecovery} from './episodes/Ep16ReflogRecovery';
import {EP17_DURATION_IN_FRAMES, Ep17InteractiveStaging} from './episodes/Ep17InteractiveStaging';
import {EP18_DURATION_IN_FRAMES, Ep18StashingWork} from './episodes/Ep18StashingWork';
import {EP19_DURATION_IN_FRAMES, Ep19CherryPick} from './episodes/Ep19CherryPick';
import {EP20_DURATION_IN_FRAMES, Ep20RewritingHistory} from './episodes/Ep20RewritingHistory';
import {EP21_DURATION_IN_FRAMES, Ep21SearchingHistory} from './episodes/Ep21SearchingHistory';
import {EP22_DURATION_IN_FRAMES, Ep22Blame} from './episodes/Ep22Blame';
import {EP23_DURATION_IN_FRAMES, Ep23Bisect} from './episodes/Ep23Bisect';
import {EP24_DURATION_IN_FRAMES, Ep24Rerere} from './episodes/Ep24Rerere';
import {EP25_DURATION_IN_FRAMES, Ep25LongLivedAndTopicBranches} from './episodes/Ep25LongLivedAndTopicBranches';
import {EP26_DURATION_IN_FRAMES, Ep26CentralizedWorkflow} from './episodes/Ep26CentralizedWorkflow';
import {EP27_DURATION_IN_FRAMES, Ep27IntegrationManagerWorkflow} from './episodes/Ep27IntegrationManagerWorkflow';
import {EP28_DURATION_IN_FRAMES, Ep28PreparingCleanContributions} from './episodes/Ep28PreparingCleanContributions';
import {EP29_DURATION_IN_FRAMES, Ep29PatchSeries} from './episodes/Ep29PatchSeries';
import {EP30_DURATION_IN_FRAMES, Ep30MaintainingTopicBranches} from './episodes/Ep30MaintainingTopicBranches';
import {EP31_DURATION_IN_FRAMES, Ep31ReleaseAndMaintenanceBranches} from './episodes/Ep31ReleaseAndMaintenanceBranches';
import {EP32_DURATION_IN_FRAMES, Ep32ChoosingIntegrationStrategy} from './episodes/Ep32ChoosingIntegrationStrategy';
import {EP33_DURATION_IN_FRAMES, Ep33ConfigurationScopes} from './episodes/Ep33ConfigurationScopes';
import {EP34_DURATION_IN_FRAMES, Ep34IgnoreRulesAndExcludes} from './episodes/Ep34IgnoreRulesAndExcludes';
import {EP35_DURATION_IN_FRAMES, Ep35AttributesTextAndBinary} from './episodes/Ep35AttributesTextAndBinary';
import {EP36_DURATION_IN_FRAMES, Ep36CustomDiffMergeAndFilters} from './episodes/Ep36CustomDiffMergeAndFilters';
import {EP37_DURATION_IN_FRAMES, Ep37ClientHooks} from './episodes/Ep37ClientHooks';
import {EP38_DURATION_IN_FRAMES, Ep38ServerHooksAndPolicy} from './episodes/Ep38ServerHooksAndPolicy';
import {EP39_DURATION_IN_FRAMES, Ep39SigningCommitsAndTags} from './episodes/Ep39SigningCommitsAndTags';
import {EP40_DURATION_IN_FRAMES, Ep40CredentialsAndTrustBoundaries} from './episodes/Ep40CredentialsAndTrustBoundaries';
import {EP41_DURATION_IN_FRAMES, Ep41SubmodulePointerModel} from './episodes/Ep41SubmodulePointerModel';
import {EP42_DURATION_IN_FRAMES, Ep42CloningAndUpdatingSubmodules} from './episodes/Ep42CloningAndUpdatingSubmodules';
import {EP43_DURATION_IN_FRAMES, Ep43CollaboratingWithSubmodules} from './episodes/Ep43CollaboratingWithSubmodules';
import {EP44_DURATION_IN_FRAMES, Ep44MultipleWorktrees} from './episodes/Ep44MultipleWorktrees';
import {EP45_DURATION_IN_FRAMES, Ep45GitBundle} from './episodes/Ep45GitBundle';
import {EP46_DURATION_IN_FRAMES, Ep46SparsePartialAndShallowClones} from './episodes/Ep46SparsePartialAndShallowClones';
import {EP47_DURATION_IN_FRAMES, Ep47CleanAndDestructiveBoundaries} from './episodes/Ep47CleanAndDestructiveBoundaries';
import {EP48_DURATION_IN_FRAMES, Ep48MaintenanceAndDataRecovery} from './episodes/Ep48MaintenanceAndDataRecovery';
import {RefLightboxIntro, RefLightboxOutro} from './kit';
import {FPS, HEIGHT, seconds, WIDTH} from './timeline';

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
      id: 'GitCourseVisibleSystemOutro',
      component: RefLightboxOutro,
      durationInFrames: seconds(6),
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01WhatGitStoresHook',
      component: Ep01WhatGitStoresHook,
      durationInFrames: EP01_SCENES[0].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01BadModel',
      component: Ep01BadModelPreview,
      durationInFrames: EP01_SCENES[1].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01VersionControl',
      component: Ep01VersionControlPreview,
      durationInFrames: EP01_SCENES[2].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01SnapshotModel',
      component: Ep01SnapshotModelPreview,
      durationInFrames: EP01_SCENES[3].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01PracticeCheck',
      component: Ep01PracticeCheckPreview,
      durationInFrames: EP01_SCENES[4].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01LocalHistory',
      component: Ep01LocalHistoryPreview,
      durationInFrames: EP01_SCENES[5].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01Integrity',
      component: Ep01IntegrityPreview,
      durationInFrames: EP01_SCENES[6].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01Takeaway',
      component: Ep01TakeawayPreview,
      durationInFrames: EP01_SCENES[7].duration,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp01WhatGitStores',
      component: Ep01WhatGitStores,
      durationInFrames: EP01_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp02WorkingTreeIndexRepo',
      component: Ep02WorkingTreeIndexRepo,
      durationInFrames: EP02_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp03CommitSnapshot',
      component: Ep03CommitSnapshot,
      durationInFrames: EP03_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp04BranchIsPointer',
      component: Ep04BranchIsPointer,
      durationInFrames: EP04_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp05Head',
      component: Ep05Head,
      durationInFrames: EP05_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp06Merge',
      component: Ep06Merge,
      durationInFrames: EP06_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp07Rebase',
      component: Ep07Rebase,
      durationInFrames: EP07_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp08ResetRevertRestore',
      component: Ep08ResetRevertRestore,
      durationInFrames: EP08_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp09DiffComparesStates',
      component: Ep09DiffComparesStates,
      durationInFrames: EP09_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp10SelectingRevisions',
      component: Ep10SelectingRevisions,
      durationInFrames: EP10_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp11Tags',
      component: Ep11Tags,
      durationInFrames: EP11_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp12RemoteTrackingBranches',
      component: Ep12RemoteTrackingBranches,
      durationInFrames: EP12_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp13FetchPullPush',
      component: Ep13FetchPullPush,
      durationInFrames: EP13_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp14AheadBehindNonFastForward',
      component: Ep14AheadBehindNonFastForward,
      durationInFrames: EP14_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp15UnmergedIndex',
      component: Ep15UnmergedIndex,
      durationInFrames: EP15_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseEp16ReflogRecovery',
      component: Ep16ReflogRecovery,
      durationInFrames: EP16_DURATION_IN_FRAMES,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {id:'GitCourseEp17InteractiveStaging',component:Ep17InteractiveStaging,durationInFrames:EP17_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp18StashingWork',component:Ep18StashingWork,durationInFrames:EP18_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp19CherryPick',component:Ep19CherryPick,durationInFrames:EP19_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp20RewritingHistory',component:Ep20RewritingHistory,durationInFrames:EP20_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp21SearchingHistory',component:Ep21SearchingHistory,durationInFrames:EP21_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp22Blame',component:Ep22Blame,durationInFrames:EP22_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp23Bisect',component:Ep23Bisect,durationInFrames:EP23_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp24Rerere',component:Ep24Rerere,durationInFrames:EP24_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp25LongLivedAndTopicBranches',component:Ep25LongLivedAndTopicBranches,durationInFrames:EP25_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp26CentralizedWorkflow',component:Ep26CentralizedWorkflow,durationInFrames:EP26_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp27IntegrationManagerWorkflow',component:Ep27IntegrationManagerWorkflow,durationInFrames:EP27_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp28PreparingCleanContributions',component:Ep28PreparingCleanContributions,durationInFrames:EP28_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp29PatchSeries',component:Ep29PatchSeries,durationInFrames:EP29_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp30MaintainingTopicBranches',component:Ep30MaintainingTopicBranches,durationInFrames:EP30_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp31ReleaseAndMaintenanceBranches',component:Ep31ReleaseAndMaintenanceBranches,durationInFrames:EP31_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp32ChoosingIntegrationStrategy',component:Ep32ChoosingIntegrationStrategy,durationInFrames:EP32_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp33ConfigurationScopes',component:Ep33ConfigurationScopes,durationInFrames:EP33_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp34IgnoreRulesAndExcludes',component:Ep34IgnoreRulesAndExcludes,durationInFrames:EP34_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp35AttributesTextAndBinary',component:Ep35AttributesTextAndBinary,durationInFrames:EP35_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp36CustomDiffMergeAndFilters',component:Ep36CustomDiffMergeAndFilters,durationInFrames:EP36_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp37ClientHooks',component:Ep37ClientHooks,durationInFrames:EP37_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp38ServerHooksAndPolicy',component:Ep38ServerHooksAndPolicy,durationInFrames:EP38_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp39SigningCommitsAndTags',component:Ep39SigningCommitsAndTags,durationInFrames:EP39_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp40CredentialsAndTrustBoundaries',component:Ep40CredentialsAndTrustBoundaries,durationInFrames:EP40_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp41SubmodulePointerModel',component:Ep41SubmodulePointerModel,durationInFrames:EP41_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp42CloningAndUpdatingSubmodules',component:Ep42CloningAndUpdatingSubmodules,durationInFrames:EP42_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp43CollaboratingWithSubmodules',component:Ep43CollaboratingWithSubmodules,durationInFrames:EP43_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp44MultipleWorktrees',component:Ep44MultipleWorktrees,durationInFrames:EP44_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp45GitBundle',component:Ep45GitBundle,durationInFrames:EP45_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp46SparsePartialAndShallowClones',component:Ep46SparsePartialAndShallowClones,durationInFrames:EP46_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp47CleanAndDestructiveBoundaries',component:Ep47CleanAndDestructiveBoundaries,durationInFrames:EP47_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {id:'GitCourseEp48MaintenanceAndDataRecovery',component:Ep48MaintenanceAndDataRecovery,durationInFrames:EP48_DURATION_IN_FRAMES,fps:FPS,width:WIDTH,height:HEIGHT},
    {
      id: 'GitCourseComponentLab',
      component: ComponentLab,
      durationInFrames: COMPONENT_LAB_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabLayout',
      component: ComponentLabLayout,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabGraph',
      component: ComponentLabGraph,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabState',
      component: ComponentLabState,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabTerminal',
      component: ComponentLabTerminal,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabCaptions',
      component: ComponentLabCaptions,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    {
      id: 'GitCourseComponentLabStress',
      component: ComponentLabStress,
      durationInFrames: COMPONENT_LAB_SCENE_DURATION,
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
  ],
};
