import {EP59} from '../data/episodes';
import {EP59_DURATION_IN_FRAMES, EP59_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP59_DURATION_IN_FRAMES, EP59_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'SSH ACCESS', question: '认证成功，就一定能 Push 吗？'};
// @git-course-scene hook:end
// @git-course-scene identity-model:start
const model = {modelTitle: 'SSH 访问需要连续通过三层判断', modelSteps: [
  {label: 'Host', detail: 'server identity', tone: 'neutral'}, {label: 'User', detail: 'key possession', tone: 'head'},
  {label: 'Command', detail: 'git-shell', tone: 'feature'}, {label: 'Repository', detail: 'read / write', tone: 'main'},
]} as const;
// @git-course-scene identity-model:end
// @git-course-scene key-evidence:start
const keyEvidence = {scene: 'key-evidence', recording: 'ep59-key-evidence', title: '只暴露测试 Key 的 Fingerprint', at: 14.4, cards: [
  {label: 'host key', detail: 'which server', tone: 'neutral'}, {label: 'user key', detail: 'which identity', tone: 'head'},
  {label: 'private key', detail: 'never displayed', tone: 'conflict'},
]} as const;
// @git-course-scene key-evidence:end
// @git-course-scene restricted-command:start
const restrictedCommand = {scene: 'restricted-command', recording: 'ep59-restricted-command', title: 'Git 服务可用，交互 Shell 仍关闭', at: 13.4, cards: [
  {label: 'git-upload-pack', detail: 'allowed Git service', tone: 'feature'},
  {label: 'interactive shell', detail: 'rejected', tone: 'conflict'},
]} as const;
// @git-course-scene restricted-command:end
// @git-course-scene authorization:start
const authorization = {scene: 'authorization', recording: 'ep59-authorization', title: '认证与仓库写权限分别判断', at: 13.4, cards: [
  {label: 'fetch', detail: 'read allowed', tone: 'feature'}, {label: 'push', detail: 'write denied', tone: 'conflict'},
  {label: 'main', detail: 'unchanged', tone: 'main'},
]} as const;
// @git-course-scene authorization:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: '认证回答是谁，授权回答能做什么', takeawaySteps: [
  {label: 'Host key', tone: 'neutral'}, {label: 'User key', tone: 'head'},
  {label: 'Git command', tone: 'feature'}, {label: 'Repo policy', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep59SshKeysAndServerAccess = createServerInfrastructureEpisode(
  EP59, EP59_SCENES, {...hook, ...model, evidence: [keyEvidence, restrictedCommand, authorization], ...takeaway},
).Episode;
