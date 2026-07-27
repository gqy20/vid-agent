import test from 'node:test';
import assert from 'node:assert/strict';
import {
  boundaryReviewPlan,
  continuousReviewPlan,
  volumeReviewFingerprint,
} from './claude-code-volume-review.mjs';

test('continuous review uses five-frame sheets and crops the final page', () => {
  assert.deepEqual(continuousReviewPlan(151.1), {
    sampleFrames: 302,
    sheetCount: 61,
    lastSheetFrames: 2,
    lastSheetWidth: 1280,
  });
  assert.deepEqual(continuousReviewPlan(300), {
    sampleFrames: 600,
    sheetCount: 120,
    lastSheetFrames: 5,
    lastSheetWidth: 3200,
  });
});

test('boundary review samples both sides of every chapter cut', () => {
  assert.deepEqual(boundaryReviewPlan([
    {episodeId: 'ep01-one', offsetSeconds: 0},
    {episodeId: 'ep02-two', offsetSeconds: 300},
    {episodeId: 'ep03-three', offsetSeconds: 451.1},
  ]), [
    {
      index: 1,
      previousEpisodeId: 'ep01-one',
      nextEpisodeId: 'ep02-two',
      cutSeconds: 300,
      beforeStartSeconds: 299.5,
      afterStartSeconds: 300,
      filename: '01_ep01_ep02.jpg',
    },
    {
      index: 2,
      previousEpisodeId: 'ep02-two',
      nextEpisodeId: 'ep03-three',
      cutSeconds: 451.1,
      beforeStartSeconds: 450.6,
      afterStartSeconds: 451.1,
      filename: '02_ep02_ep03.jpg',
    },
  ]);
});

test('volume review fingerprint changes with an input chapter SHA', () => {
  const base = {
    volumeId: 'vol01-test',
    volumeSha256: 'volume-a',
    chapters: [{episodeId: 'ep01-one', videoSha256: 'chapter-a', durationSeconds: 10}],
  };
  assert.notEqual(
    volumeReviewFingerprint(base),
    volumeReviewFingerprint({...base, chapters: [{...base.chapters[0], videoSha256: 'chapter-b'}]}),
  );
});
