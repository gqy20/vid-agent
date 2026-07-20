import assert from 'node:assert/strict';
import test from 'node:test';
import {actionArgs, episodeAttention, isEpisodeId, nextAction, parseStatus, repoFile} from '../src/lib.mjs';

test('episode ids are constrained to course slugs', () => {
  assert.equal(isEpisodeId('ep05-head'), true);
  assert.equal(isEpisodeId('../ep05-head'), false);
  assert.equal(isEpisodeId('ep5-head'), false);
});

test('status output becomes scene and narration states', () => {
  const status = parseStatus(`Git Course · ep05-head\nHIT   render hook\nBUILD render terminal\nHIT   tts    01_hook\nmain    verdict: needs_review\nrelease verdict: pass\n`);
  assert.deepEqual(status.renders, {hook: 'hit', terminal: 'build'});
  assert.deepEqual(status.tts, {'01_hook': 'hit'});
  assert.deepEqual(status.verdicts, {main: 'needs_review', release: 'pass'});
});

test('artifact file resolution cannot leave the media root', () => {
  const root = '/workspace/project';
  assert.equal(repoFile(root, 'remotion/renders/git-course/ep05/current/main.mp4'), '/workspace/project/remotion/renders/git-course/ep05/current/main.mp4');
  assert.throws(() => repoFile(root, '../../etc/passwd'), /outside/);
});

test('dashboard actions become fixed pnpm orchestrator arguments', () => {
  assert.deepEqual(actionArgs({action: 'preview', episodeId: 'ep05-head', sceneId: 'terminal'}), ['preview', 'ep05-head', '--scenes=terminal']);
  assert.deepEqual(actionArgs({action: 'approve', episodeId: 'ep05-head', note: '画面与字幕检查通过'}), ['approve', 'ep05-head', '--note=画面与字幕检查通过']);
  assert.throws(() => actionArgs({action: 'clean', episodeId: 'ep05-head'}), /Unsupported action/);
});

test('next action follows the candidate approval and promotion gates', () => {
  const base = {
    activity: null,
    dirty: 0,
    artifacts: {candidate: {}, current: {}, releaseCandidate: {}, release: {}},
    verdicts: {main: {verdict: 'needs_review'}, release: {verdict: 'pass', artifactSha256: 'release-next'}},
    manifests: {candidateSha: 'main-next', currentSha: 'main-current', releaseCandidateSha: 'release-next', publishedReleaseSha: 'release-current'},
  };
  assert.equal(nextAction(base).action, 'approve');
  assert.equal(nextAction({...base, verdicts: {...base.verdicts, main: {verdict: 'pass'}}}).action, 'promote');
  assert.equal(nextAction({...base, verdicts: {...base.verdicts, main: {verdict: 'pass'}}, manifests: {...base.manifests, currentSha: 'main-next'}}).action, 'publish');
});

test('published episodes describe dirty work as a new revision', () => {
  const action = nextAction({
    activity: null,
    dirty: 3,
    artifacts: {candidate: {}, current: {}, releaseCandidate: {}, release: {}},
    verdicts: {main: {verdict: 'pass'}, release: {verdict: 'pass', artifactSha256: 'release-current'}},
    manifests: {candidateSha: 'main-current', currentSha: 'main-current', releaseCandidateSha: 'release-current', publishedReleaseSha: 'release-current'},
  });
  assert.equal(action.action, 'build');
  assert.equal(action.label, '当前源码有新改动');
  assert.match(action.description, /已发布版本/);
});

test('attention separates published revisions from unpublished dirty candidates', () => {
  const verdicts = {main: {verdict: 'needs_review'}, release: {verdict: 'pass'}};
  assert.equal(episodeAttention({activity: null, dirty: 4, published: true, verdicts, nextAction: {}}), 'published');
  assert.equal(episodeAttention({activity: null, dirty: 4, published: false, verdicts, nextAction: {}}), 'dirty');
  assert.equal(episodeAttention({activity: null, dirty: 0, published: false, verdicts, nextAction: {}}), 'review');
});
