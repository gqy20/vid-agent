import {EP61} from '../data/episodes';
import {EP61_DURATION_IN_FRAMES, EP61_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP61_DURATION_IN_FRAMES, EP61_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'GIT DAEMON', question: '轻量读取，也适合私有写协作吗？'};
// @git-course-scene hook:end
// @git-course-scene daemon-model:start
const model = {modelTitle: '可见、可读与可写是三个开关', modelSteps: [
  {label: 'Listen', detail: 'loopback', tone: 'neutral'}, {label: 'Export', detail: 'repository visible', tone: 'head'},
  {label: 'Upload', detail: 'anonymous read', tone: 'feature'}, {label: 'Receive', detail: 'disabled', tone: 'conflict'},
]} as const;
// @git-course-scene daemon-model:end
// @git-course-scene export-gate:start
const exportGate = {scene: 'export-gate', recording: 'ep61-export-gate', title: 'Export 标记决定仓库是否可见', at: 14.3, cards: [
  {label: 'hidden', detail: 'request rejected', tone: 'neutral'}, {label: 'export-ok', detail: 'repository visible', tone: 'head'},
  {label: 'refs', detail: 'advertised', tone: 'feature'},
]} as const;
// @git-course-scene export-gate:end
// @git-course-scene anonymous-read:start
const anonymousRead = {scene: 'anonymous-read', recording: 'ep61-anonymous-read', title: '匿名 Clone 仍取得真实对象', at: 13.2, repositories: [
  {label: 'git daemon', ref: 'upload-pack', tone: 'feature'}, {label: 'Client', ref: 'same main OID', tone: 'main'},
]} as const;
// @git-course-scene anonymous-read:end
// @git-course-scene write-rejected:start
const writeRejected = {scene: 'write-rejected', recording: 'ep61-write-rejected', title: 'Receive-pack 保持关闭', at: 13.2, cards: [
  {label: 'clone', detail: 'allowed', tone: 'feature'}, {label: 'push', detail: 'rejected', tone: 'conflict'},
  {label: 'server main', detail: 'unchanged', tone: 'main'},
]} as const;
// @git-course-scene write-rejected:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: 'Daemon 适合边界明确的公开读取', takeawaySteps: [
  {label: 'Export', tone: 'head'}, {label: 'Clone', tone: 'feature'},
  {label: 'Fetch', tone: 'main'}, {label: 'No write', tone: 'conflict'},
]} as const;
// @git-course-scene takeaway:end

export const Ep61GitDaemon = createServerInfrastructureEpisode(
  EP61, EP61_SCENES, {...hook, ...model, evidence: [exportGate, anonymousRead, writeRejected], ...takeaway},
).Episode;
