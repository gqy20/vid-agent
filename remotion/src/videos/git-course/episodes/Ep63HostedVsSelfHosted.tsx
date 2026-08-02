import {EP63} from '../data/episodes';
import {EP63_DURATION_IN_FRAMES, EP63_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP63_DURATION_IN_FRAMES, EP63_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'OWNERSHIP', question: '服务放在自己机器上，就更可控吗？'};
// @git-course-scene hook:end
// @git-course-scene decision-model:start
const model = {modelTitle: '比较谁承担长期责任', modelSteps: [
  {label: 'Identity', detail: 'access + policy', tone: 'head'},
  {label: 'Availability', detail: 'monitor + upgrade', tone: 'feature'},
  {label: 'Recovery', detail: 'backup + drill', tone: 'main'},
  {label: 'Data boundary', detail: 'location + audit', tone: 'neutral'},
]} as const;
// @git-course-scene decision-model:end
// @git-course-scene small-team:start
const smallTeam = {scene: 'small-team', recording: 'ep63-small-team', title: '小团队先计算持续维护工作', at: 14.1, cards: [
  {label: 'Git endpoint', detail: 'client-visible surface', tone: 'feature'}, {label: 'Operations', detail: 'upgrade + monitor', tone: 'head'},
  {label: 'Recovery', detail: 'backup + drill', tone: 'main'},
]} as const;
// @git-course-scene small-team:end
// @git-course-scene regulated-team:start
const regulatedTeam = {scene: 'regulated-team', recording: 'ep63-regulated-team', title: '受监管环境先锁定约束', at: 13.2, cards: [
  {label: 'Identity', detail: 'approved source', tone: 'head'}, {label: 'Network', detail: 'access boundary', tone: 'feature'},
  {label: 'Audit + data', detail: 'must be verified', tone: 'neutral'},
]} as const;
// @git-course-scene regulated-team:end
// @git-course-scene ownership-check:start
const ownershipCheck = {scene: 'ownership-check', recording: 'ep63-ownership-check', title: '相同命令，后台责任不同', at: 13.2, repositories: [
  {label: 'Hosted', ref: 'supplier responsibility', tone: 'feature'},
  {label: 'Self-hosted', ref: 'team responsibility', tone: 'main'},
]} as const;
// @git-course-scene ownership-check:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: '先分配责任，再选择部署方式', takeawaySteps: [
  {label: 'Requirements', tone: 'neutral'}, {label: 'Ownership', tone: 'head'},
  {label: 'Evidence', tone: 'feature'}, {label: 'Decision', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep63HostedVsSelfHosted = createServerInfrastructureEpisode(
  EP63, EP63_SCENES, {...hook, ...model, evidence: [smallTeam, regulatedTeam, ownershipCheck], ...takeaway},
).Episode;
