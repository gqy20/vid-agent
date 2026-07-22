import assert from 'node:assert/strict';
import test from 'node:test';
import {join} from 'node:path';
import {
  applyWasExplicitlyEnabled,
  draftPreviewLayout,
  episodePreviewMatchesAudio,
  orderedSceneFilename,
  pathIsInside,
  stablePreviewRootEntries,
  stableReviewEntries,
  visualAuditMatchesEpisode,
} from './claude-code-preview.mjs';

test('draft preview exposes one stable episode and review entry point', () => {
  const root = '/workspace/renders/claude-code-course/ep01';
  const layout = draftPreviewLayout(root);
  assert.equal(layout.episode, join(root, 'tmp/preview/episode.mp4'));
  assert.equal(layout.manifest, join(root, 'tmp/preview/manifest.json'));
  assert.equal(layout.report, join(root, 'tmp/preview/review/report.html'));
  assert.equal(layout.videoAudit, join(root, 'tmp/preview/review/video-audit'));
  assert.equal(stablePreviewRootEntries.has('episode-v2.mp4'), false);
  assert.equal(stableReviewEntries.has('video-audit'), true);
});

test('scene previews use ordered underscore filenames', () => {
  assert.equal(orderedSceneFilename(0, 'hook'), '01_hook.mp4');
  assert.equal(orderedSceneFilename(2, 'domestic-options'), '03_domestic_options.mp4');
});

test('preview input containment rejects the root itself and sibling paths', () => {
  const root = '/workspace/renders/claude-code-course/ep01';
  assert.equal(pathIsInside(root, join(root, 'tmp/preview/source.mp4')), true);
  assert.equal(pathIsInside(root, root), false);
  assert.equal(pathIsInside(root, '/workspace/renders/claude-code-course/ep02/source.mp4'), false);
});

test('cleanup only applies for an explicit true value', () => {
  assert.equal(applyWasExplicitlyEnabled('true'), true);
  assert.equal(applyWasExplicitlyEnabled('false'), false);
  assert.equal(applyWasExplicitlyEnabled(undefined), false);
});

test('visual audit only belongs to the exact episode artifact', () => {
  assert.equal(visualAuditMatchesEpisode({sha256: 'current'}, {artifactSha256: 'current'}), true);
  assert.equal(visualAuditMatchesEpisode({sha256: 'current'}, {artifactSha256: 'old'}), false);
  assert.equal(visualAuditMatchesEpisode(null, {artifactSha256: 'old'}), false);
});

test('episode preview only belongs to the exact active audio mix', () => {
  const audio = {mixSha256: 'mix-sha', mixFingerprint: 'mix-fingerprint'};
  assert.equal(episodePreviewMatchesAudio({
    audioMixSha256: 'mix-sha',
    audioMixFingerprint: 'mix-fingerprint',
  }, audio), true);
  assert.equal(episodePreviewMatchesAudio({
    audioMixSha256: 'old-sha',
    audioMixFingerprint: 'mix-fingerprint',
  }, audio), false);
  assert.equal(episodePreviewMatchesAudio({sha256: 'legacy-preview'}, audio), false);
});
