import {EP57} from '../data/episodes';
import {EP57_DURATION_IN_FRAMES, EP57_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP57_DURATION_IN_FRAMES, EP57_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'TRANSPORT', question: '换一种地址，Git 历史会变吗？'};
// @git-course-scene hook:end
// @git-course-scene transport-model:start
const model = {
  modelTitle: '连接方式改变信任边界',
  modelSteps: [
    {label: 'Local', detail: 'file permission', tone: 'neutral'},
    {label: 'SSH', detail: 'identity + encryption', tone: 'head'},
    {label: 'HTTP', detail: 'web access layer', tone: 'feature'},
    {label: 'git://', detail: 'anonymous read', tone: 'main'},
  ] as const,
};
// @git-course-scene transport-model:end
// @git-course-scene local-access:start
const localAccess = {scene: 'local-access', recording: 'ep57-local-file', title: 'Local 与 file:// 取得同一历史', at: 14.8, cards: [
  {label: 'local path', detail: 'may use local optimization', tone: 'neutral'},
  {label: 'file://', detail: 'runs upload-pack', tone: 'feature'},
  {label: 'main', detail: 'same full OID', tone: 'main'},
]} as const;
// @git-course-scene local-access:end
// @git-course-scene remote-access:start
const remoteAccess = {scene: 'remote-access', recording: 'ep57-remote-boundaries', title: '远程协议先决定连接方式', at: 13.6, cards: [
  {label: 'SSH', detail: 'authenticated channel', tone: 'head'},
  {label: 'HTTP', detail: 'web infrastructure', tone: 'feature'},
  {label: 'git://', detail: 'anonymous by default', tone: 'main'},
]} as const;
// @git-course-scene remote-access:end
// @git-course-scene oid-check:start
const oidCheck = {scene: 'oid-check', recording: 'ep57-oid-check', title: '不同路径，Refs 指向同一对象', at: 13.8, repositories: [
  {label: 'Local', ref: 'refs/heads/main', tone: 'neutral'},
  {label: 'Remote endpoints', ref: 'same 40-char OID', tone: 'main'},
]} as const;
// @git-course-scene oid-check:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: 'Transport 改变连接，不改变对象模型', takeawaySteps: [
  {label: 'Locate', tone: 'neutral'}, {label: 'Authenticate', tone: 'head'},
  {label: 'Encrypt', tone: 'feature'}, {label: 'Authorize', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep57GitProtocolsAndAccess = createServerInfrastructureEpisode(
  EP57, EP57_SCENES, {...hook, ...model, evidence: [localAccess, remoteAccess, oidCheck], ...takeaway},
).Episode;
