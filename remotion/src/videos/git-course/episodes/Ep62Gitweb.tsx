import {EP62} from '../data/episodes';
import {EP62_DURATION_IN_FRAMES, EP62_SCENES} from '../data/episodeTimelines.generated';
import {createServerInfrastructureEpisode} from './ServerInfrastructureEpisode';

export {EP62_DURATION_IN_FRAMES, EP62_SCENES};

// @git-course-scene hook:start
const hook = {eyebrow: 'GITWEB', question: '网页里的 Commit 是另一份数据吗？'};
// @git-course-scene hook:end
// @git-course-scene browser-model:start
const model = {modelTitle: '同一对象库，两种阅读入口', modelSteps: [
  {label: 'Refs', tone: 'main'}, {label: 'Commit', tone: 'head'},
  {label: 'Tree', tone: 'feature'}, {label: 'Diff', tone: 'conflict'},
]} as const;
// @git-course-scene browser-model:end
// @git-course-scene refs-evidence:start
const refsEvidence = {scene: 'refs-evidence', recording: 'ep62-refs-evidence', title: '终端先锁定对象基线', at: 14.2, cards: [
  {label: 'show-ref', detail: 'branch + tag OID', tone: 'main'}, {label: 'cat-file', detail: 'parent + tree', tone: 'head'},
  {label: 'ls-tree', detail: 'snapshot paths', tone: 'feature'},
]} as const;
// @git-course-scene refs-evidence:end
// @git-course-scene page-evidence:start
const pageEvidence = {scene: 'page-evidence', browser: {
  src: 'git-course-lab/browser/ep62-page-evidence.mp4',
  url: '127.0.0.1:19662/cgi-bin/gitweb.cgi',
  title: 'GitWeb · project.git',
}, title: '页面沿着同一组对象展开', at: 13.4, cards: [
  {label: 'summary', detail: 'visible refs', tone: 'main'}, {label: 'commit', detail: 'OID + parent + tree', tone: 'head'},
  {label: 'tree / diff', detail: 'read-only views', tone: 'feature'},
]} as const;
// @git-course-scene page-evidence:end
// @git-course-scene transport-boundary:start
const transportBoundary = {scene: 'transport-boundary', recording: 'ep62-transport-boundary', title: '浏览页面不承担对象传输', at: 13.4, cards: [
  {label: 'GitWeb', detail: 'HTML reading', tone: 'neutral'}, {label: 'upload-pack', detail: 'clone + fetch', tone: 'feature'},
  {label: 'receive-pack', detail: 'push', tone: 'main'},
]} as const;
// @git-course-scene transport-boundary:end
// @git-course-scene takeaway:start
const takeaway = {takeawayTitle: 'GitWeb 负责阅读，不负责传输', takeawaySteps: [
  {label: 'Browse', tone: 'neutral'}, {label: 'Inspect', tone: 'head'},
  {label: 'Compare', tone: 'feature'}, {label: 'Read only', tone: 'main'},
]} as const;
// @git-course-scene takeaway:end

export const Ep62Gitweb = createServerInfrastructureEpisode(
  EP62, EP62_SCENES, {...hook, ...model, evidence: [refsEvidence, pageEvidence, transportBoundary], ...takeaway},
).Episode;
