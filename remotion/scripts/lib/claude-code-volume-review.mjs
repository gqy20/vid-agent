import {createHash} from 'node:crypto';

export const VOLUME_REVIEW_POLICY = Object.freeze({
  version: 1,
  overviewFrames: 16,
  overviewColumns: 4,
  continuousFps: 2,
  continuousFramesPerSheet: 5,
  continuousFrameWidth: 640,
  boundaryFps: 10,
  boundaryWindowSeconds: 0.5,
  boundaryFramesPerSide: 5,
  boundaryFrameWidth: 640,
});

export const continuousReviewPlan = (durationSeconds, policy = VOLUME_REVIEW_POLICY) => {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`Invalid review duration: ${durationSeconds}`);
  }
  const sampleFrames = Math.max(1, Math.round(durationSeconds * policy.continuousFps));
  const sheetCount = Math.ceil(sampleFrames / policy.continuousFramesPerSheet);
  const lastSheetFrames = sampleFrames % policy.continuousFramesPerSheet
    || policy.continuousFramesPerSheet;
  return {
    sampleFrames,
    sheetCount,
    lastSheetFrames,
    lastSheetWidth: lastSheetFrames * policy.continuousFrameWidth,
  };
};

export const boundaryReviewPlan = (chapters, policy = VOLUME_REVIEW_POLICY) => chapters
  .slice(1)
  .map((chapter, index) => {
    const cutSeconds = Number(chapter.offsetSeconds);
    if (!Number.isFinite(cutSeconds) || cutSeconds < policy.boundaryWindowSeconds) {
      throw new Error(`Invalid chapter boundary: ${chapter.episodeId}`);
    }
    const previous = chapters[index];
    return {
      index: index + 1,
      previousEpisodeId: previous.episodeId,
      nextEpisodeId: chapter.episodeId,
      cutSeconds,
      beforeStartSeconds: Number((cutSeconds - policy.boundaryWindowSeconds).toFixed(3)),
      afterStartSeconds: cutSeconds,
      filename: `${String(index + 1).padStart(2, '0')}_${previous.episodeId.slice(0, 4)}_${chapter.episodeId.slice(0, 4)}.jpg`,
    };
  });

export const volumeReviewFingerprint = ({volumeId, volumeSha256, chapters, policy = VOLUME_REVIEW_POLICY}) =>
  createHash('sha256').update(JSON.stringify({
    schema: 1,
    volumeId,
    volumeSha256,
    policy,
    chapters: chapters.map((chapter) => ({
      episodeId: chapter.episodeId,
      videoSha256: chapter.videoSha256,
      durationSeconds: chapter.durationSeconds,
    })),
  })).digest('hex');
