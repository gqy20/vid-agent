import {EP58} from '../data/episodes';
import {EP58_DURATION_IN_FRAMES, EP58_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP58_DURATION_IN_FRAMES, EP58_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'RECEIVE-PACK', question: '服务器也要检出一份代码吗？'};
// @git-course-scene hook:end
// @git-course-scene bare-model:start
const model = {modelTitle: 'Bare Repository 直接保存 Git 数据', modelSteps: [
  {label: 'Objects', tone: 'feature'}, {label: 'Quarantine', tone: 'head'},
  {label: 'Policy', tone: 'conflict'}, {label: 'Refs', tone: 'main'},
]} as const;
// @git-course-scene bare-model:end
// @git-course-scene init-bare:start
const initBare = {scene: 'init-bare', recording: 'ep58-init-bare', title: 'Bare 根目录就是 Git Directory', at: 14.2, cards: [
  {label: 'bare', detail: 'true', tone: 'main'}, {label: 'objects + refs', detail: 'repository data', tone: 'feature'},
  {label: 'Working Tree', detail: 'absent', tone: 'neutral'},
]} as const;
// @git-course-scene init-bare:end
// @git-course-scene first-push:start
const firstPush = {scene: 'first-push', recording: 'ep58-first-push', title: '校验完成后才移动 Main', at: 13.4, repositories: [
  {label: 'Client', ref: 'new objects + request', tone: 'feature'},
  {label: 'Bare server', ref: 'receive-pack → main', tone: 'main'},
]} as const;
// @git-course-scene first-push:end
// @git-course-scene reject-stale:start
const rejectStale = {scene: 'reject-stale', recording: 'ep58-reject-stale', title: '过期 Push 不会覆盖 Main', at: 13.2, cards: [
  {label: 'stale client', detail: 'old tip', tone: 'neutral'}, {label: 'receive-pack', detail: 'rejects update', tone: 'conflict'},
  {label: 'main', detail: 'unchanged', tone: 'main'},
]} as const;
// @git-course-scene reject-stale:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: 'Bare 是接收端结构，不是完整平台', takeawaySteps: [
  {label: 'Receive', tone: 'feature'}, {label: 'Validate', tone: 'head'},
  {label: 'Update', tone: 'main'}, {label: 'No checkout', tone: 'neutral'},
]} as const;
// @git-course-scene takeaway:end

export const Ep58BareRepositoriesAndReceivePack = createServerInfrastructureEpisode(
  EP58, EP58_SCENES, {...hook, ...model, evidence: [initBare, firstPush, rejectStale], ...takeaway},
).Episode;
