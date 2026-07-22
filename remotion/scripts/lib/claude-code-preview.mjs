import {join, relative, resolve} from 'node:path';

export const draftPreviewLayout = (episodeRoot) => {
  const previewRoot = join(episodeRoot, 'tmp', 'preview');
  return {
    previewRoot,
    episode: join(previewRoot, 'episode.mp4'),
    manifest: join(previewRoot, 'manifest.json'),
    scenes: join(previewRoot, 'scenes'),
    audio: join(previewRoot, 'audio'),
    review: join(previewRoot, 'review'),
    report: join(previewRoot, 'review', 'report.html'),
    audioAudit: join(previewRoot, 'review', 'audio-audit.json'),
    videoAudit: join(previewRoot, 'review', 'video-audit'),
  };
};

export const orderedSceneFilename = (index, sceneId) => {
  const order = String(index + 1).padStart(2, '0');
  return `${order}_${sceneId.replaceAll('-', '_')}.mp4`;
};

export const pathIsInside = (root, target) => {
  const relation = relative(resolve(root), resolve(target));
  return relation !== '' && relation !== '..' && !relation.startsWith('../');
};

export const applyWasExplicitlyEnabled = (value) => value === 'true';

export const visualAuditMatchesEpisode = (episode, verdict) => Boolean(
  episode?.sha256
  && verdict?.artifactSha256
  && episode.sha256 === verdict.artifactSha256,
);

export const episodePreviewMatchesAudio = (episode, audio) => Boolean(
  episode?.audioMixSha256
  && episode?.audioMixFingerprint
  && audio?.mixSha256
  && audio?.mixFingerprint
  && episode.audioMixSha256 === audio.mixSha256
  && episode.audioMixFingerprint === audio.mixFingerprint,
);

export const stablePreviewRootEntries = new Set([
  'audio',
  'episode.mp4',
  'manifest.json',
  'review',
  'scenes',
]);

export const stableAudioPreviewEntries = new Set([
  'captions.json',
  'manifest.json',
  'mix.m4a',
]);

export const stableReviewEntries = new Set([
  'audio-audit.json',
  'overview.jpg',
  'report.html',
  'video-audit',
]);
