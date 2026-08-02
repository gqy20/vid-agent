import {EP64} from '../data/episodes';
import {EP64_DURATION_IN_FRAMES, EP64_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP64_DURATION_IN_FRAMES, EP64_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'RECOVERY', question: '备份显示成功，就真的能恢复吗？'};
// @git-course-scene hook:end
// @git-course-scene asset-model:start
const model = {modelTitle: '七类资产，归入四组运行责任', modelSteps: [
  {label: 'Git data', detail: 'objects · refs · reflogs', tone: 'main'},
  {label: 'Access', detail: 'config · hooks · identity', tone: 'head'},
  {label: 'Runtime', detail: 'SSH / HTTP · logs', tone: 'feature'},
  {label: 'Recovery', detail: 'backup · restore', tone: 'neutral'},
]} as const;
// @git-course-scene asset-model:end
// @git-course-scene health-check:start
const healthCheck = {scene: 'health-check', recording: 'ep64-health-check', title: '备份前先建立健康基线', at: 14.2, cards: [
  {label: 'fsck', detail: 'object connectivity', tone: 'feature'}, {label: 'refs manifest', detail: 'branch + tag OID', tone: 'main'},
  {label: 'maintenance', detail: 'optimization only', tone: 'neutral'},
]} as const;
// @git-course-scene health-check:end
// @git-course-scene backup-set:start
const backupSet = {scene: 'backup-set', recording: 'ep64-backup-set', title: '备份集覆盖仓库与外部配置', at: 13.4, cards: [
  {label: 'bare repo', detail: 'objects + refs', tone: 'main'}, {label: 'service config', detail: 'identity + endpoint', tone: 'head'},
  {label: 'bundle', detail: 'portable subset', tone: 'feature'},
]} as const;
// @git-course-scene backup-set:end
// @git-course-scene restore-drill:start
const restoreDrill = {scene: 'restore-drill', recording: 'ep64-restore-drill', title: '隔离恢复后重新验证', at: 13.4, repositories: [
  {label: 'Backup set', ref: 'consistent snapshot', tone: 'feature'},
  {label: 'Restored lab', ref: 'fsck + clone + OID', tone: 'main'},
]} as const;
// @git-course-scene restore-drill:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: '备份的完成条件是恢复成功', takeawaySteps: [
  {label: 'Baseline', tone: 'neutral'}, {label: 'Backup', tone: 'feature'},
  {label: 'Restore', tone: 'head'}, {label: 'Verify', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep64OperatingSelfHostedGit = createServerInfrastructureEpisode(
  EP64, EP64_SCENES, {...hook, ...model, evidence: [healthCheck, backupSet, restoreDrill], ...takeaway},
).Episode;
