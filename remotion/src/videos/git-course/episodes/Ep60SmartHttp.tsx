import {EP60} from '../data/episodes';
import {EP60_DURATION_IN_FRAMES, EP60_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP60_DURATION_IN_FRAMES, EP60_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'SMART HTTP', question: '能打开网页，就一定能 Clone 吗？'};
// @git-course-scene hook:end
// @git-course-scene http-model:start
const model = {modelTitle: 'Web 边界把请求交给 Git Backend', modelSteps: [
  {label: 'HTTP', detail: 'TLS + routing', tone: 'neutral'}, {label: 'Auth', detail: 'REMOTE_USER', tone: 'head'},
  {label: 'Backend', detail: 'Git RPC', tone: 'feature'}, {label: 'Refs', detail: 'authorized update', tone: 'main'},
]} as const;
// @git-course-scene http-model:end
// @git-course-scene read-service:start
const readService = {scene: 'read-service', recording: 'ep60-read-service', title: 'Info/refs 之后进入 Upload-pack', at: 14.4, cards: [
  {label: 'info/refs', detail: 'service advertisement', tone: 'neutral'}, {label: 'upload-pack', detail: 'read objects', tone: 'feature'},
  {label: 'main', detail: 'full OID', tone: 'main'},
]} as const;
// @git-course-scene read-service:end
// @git-course-scene auth-boundary:start
const authBoundary = {scene: 'auth-boundary', recording: 'ep60-auth-boundary', title: '认证挑战与授权拒绝是两步', at: 13.4, cards: [
  {label: '401', detail: 'identity required', tone: 'neutral'}, {label: 'authenticated', detail: 'identity known', tone: 'head'},
  {label: 'denied', detail: 'policy rejects write', tone: 'conflict'},
]} as const;
// @git-course-scene auth-boundary:end
// @git-course-scene write-service:start
const writeService = {scene: 'write-service', recording: 'ep60-write-service', title: '授权后才开放 Receive-pack', at: 13.4, repositories: [
  {label: 'Web server', ref: 'auth + route', tone: 'head'},
  {label: 'git http-backend', ref: 'receive-pack → main', tone: 'main'},
]} as const;
// @git-course-scene write-service:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: 'Smart HTTP = Web 边界 + Git RPC', takeawaySteps: [
  {label: 'Route', tone: 'neutral'}, {label: 'Authenticate', tone: 'head'},
  {label: 'Authorize', tone: 'feature'}, {label: 'Exchange', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep60SmartHttp = createServerInfrastructureEpisode(
  EP60, EP60_SCENES, {...hook, ...model, evidence: [readService, authBoundary, writeService], ...takeaway},
).Episode;
