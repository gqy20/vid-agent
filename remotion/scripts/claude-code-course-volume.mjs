#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {spawn} from 'node:child_process';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  chapterVisualFingerprint,
  claudeCodeChapterSourceFingerprint,
} from './lib/claude-code-render-fingerprint.mjs';
import {
  VOLUME_REVIEW_POLICY,
  boundaryReviewPlan,
  continuousReviewPlan,
  volumeReviewFingerprint,
} from './lib/claude-code-volume-review.mjs';

const REMOTION = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(REMOTION, '..');
const COURSE = join(ROOT, 'claude-code-course');
const EPISODES = join(COURSE, 'episodes');
const PROGRAM_PATH = join(COURSE, 'program.json');
const COMMAND = process.argv[2] ?? 'plan';
const VOLUME_ID = process.argv[3] ?? null;

const fail = (message) => {
  throw new Error(message);
};
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const rel = (path) => relative(ROOT, path).replaceAll('\\', '/');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const shaFile = (path) => sha(readFileSync(path));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  const partial = `${path}.partial-${process.pid}`;
  writeFileSync(partial, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(partial, path);
};
const run = (command, args, logPath) => new Promise((resolvePromise, rejectPromise) => {
  mkdirSync(dirname(logPath), {recursive: true});
  const child = spawn(command, args, {cwd: REMOTION, stdio: ['ignore', 'pipe', 'pipe']});
  const chunks = [];
  child.stdout.on('data', (chunk) => chunks.push(chunk));
  child.stderr.on('data', (chunk) => chunks.push(chunk));
  child.on('error', rejectPromise);
  child.on('close', (code) => {
    const output = Buffer.concat(chunks).toString('utf8');
    writeFileSync(logPath, output);
    if (code === 0) resolvePromise(output);
    else rejectPromise(new Error(`${command} exited ${code}; see ${rel(logPath)}`));
  });
});
const materialize = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  const partial = `${target}.partial-${process.pid}`;
  rmSync(partial, {force: true});
  let method = 'hardlink';
  try {
    linkSync(source, partial);
  } catch {
    copyFileSync(source, partial);
    method = 'copy';
  }
  renameSync(partial, target);
  return method;
};
const ffconcatPath = (path) => `file '${path.replaceAll("'", "'\\''")}'`;
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const validateProgramShape = (program) => {
  program.schemaVersion === 1 || fail('program.schemaVersion must be 1');
  program.courseId === 'claude-code-course' || fail('program.courseId must be claude-code-course');
  program.renderPolicy?.unit === 'chapter' || fail('renderPolicy.unit must be chapter');
  program.renderPolicy?.masterAssembly === 'sha-bound-chapter-segments'
    || fail('renderPolicy.masterAssembly must use SHA-bound chapter segments');
  program.renderPolicy?.chapterBoundary === 'hard-cut-with-visual-baton'
    || fail('renderPolicy.chapterBoundary must preserve independently renderable hard cuts');
  program.renderPolicy?.packaging === 'volume-only'
    || fail('renderPolicy.packaging must be volume-only');
  program.renderPolicy?.volumeAudio === 'chapter-voice-continuous-bgm'
    || fail('renderPolicy.volumeAudio must rebuild one continuous BGM bed per volume');
  Array.isArray(program.volumes) && program.volumes.length > 0 || fail('program.volumes is required');
  const volumeIds = new Set();
  const chapterIds = new Set();
  for (const volume of program.volumes) {
    /^vol\d{2}-[a-z0-9-]+$/.test(volume.volumeId) || fail(`Invalid volume id: ${volume.volumeId}`);
    !volumeIds.has(volume.volumeId) || fail(`Duplicate volume id: ${volume.volumeId}`);
    volumeIds.add(volume.volumeId);
    typeof volume.compositionId === 'string' && /^[A-Za-z][A-Za-z0-9]+$/.test(volume.compositionId)
      || fail(`${volume.volumeId}: invalid compositionId`);
    Array.isArray(volume.chapters) && volume.chapters.length > 0 || fail(`${volume.volumeId}: chapters are required`);
    for (const chapterId of volume.chapters) {
      /^ep\d{2}-[a-z0-9-]+$/.test(chapterId) || fail(`${volume.volumeId}: invalid chapter id ${chapterId}`);
      !chapterIds.has(chapterId) || fail(`Chapter belongs to multiple volumes: ${chapterId}`);
      chapterIds.add(chapterId);
    }
  }
  return program;
};

const loadProgram = () => {
  existsSync(PROGRAM_PATH) || fail(`Program manifest not found: ${rel(PROGRAM_PATH)}`);
  return validateProgramShape(json(PROGRAM_PATH));
};

const selectVolumes = (program) => {
  if (!VOLUME_ID) return program.volumes;
  const volume = program.volumes.find((item) => item.volumeId === VOLUME_ID);
  volume || fail(`Unknown volume: ${VOLUME_ID}`);
  return [volume];
};

const loadChapter = (chapterId) => {
  const path = join(EPISODES, `${chapterId}.json`);
  if (!existsSync(path)) return {chapterId, path, episode: null, problem: 'episode JSON is missing'};
  const episode = json(path);
  if (episode.episodeId !== chapterId) return {chapterId, path, episode, problem: `episodeId is ${episode.episodeId}`};
  return {chapterId, path, episode, problem: null};
};

const chapterPreview = (chapterId) => {
  const path = join(REMOTION, 'renders/claude-code-course', chapterId, 'tmp/preview/manifest.json');
  if (!existsSync(path)) return {path, manifest: null, ready: false, reason: 'preview manifest is missing'};
  const manifest = json(path);
  const episode = manifest.episode;
  if (!episode?.path || !episode.sha256) return {path, manifest, ready: false, reason: 'chapter episode preview is missing'};
  const videoPath = resolve(ROOT, episode.path);
  if (!existsSync(videoPath)) return {path, manifest, ready: false, reason: 'chapter preview video is missing'};
  if (shaFile(videoPath) !== episode.sha256) return {path, manifest, ready: false, reason: 'chapter preview SHA mismatch'};
  const auditPath = manifest.review?.audioAuditPath ? resolve(ROOT, manifest.review.audioAuditPath) : null;
  if (!auditPath || !existsSync(auditPath)) return {path, manifest, ready: false, reason: 'audio audit is missing'};
  const audit = json(auditPath);
  if (audit.verdict !== 'pass') return {path, manifest, ready: false, reason: 'audio audit is not pass'};
  const mixCachePath = manifest.audio?.mixCachePath ? resolve(ROOT, manifest.audio.mixCachePath) : null;
  const voiceoverPath = mixCachePath ? join(dirname(mixCachePath), 'voiceover-aligned.m4a') : null;
  const mixMetadataPath = mixCachePath ? join(dirname(mixCachePath), 'metadata.json') : null;
  if (!voiceoverPath || !mixMetadataPath || !existsSync(voiceoverPath) || !existsSync(mixMetadataPath)) {
    return {path, manifest, ready: false, reason: 'chapter aligned voiceover is missing'};
  }
  const mixMetadata = json(mixMetadataPath);
  if (mixMetadata.voiceoverSha256 !== shaFile(voiceoverPath)) {
    return {path, manifest, ready: false, reason: 'chapter aligned voiceover SHA mismatch'};
  }
  return {
    path,
    manifest,
    ready: true,
    reason: null,
    videoPath,
    voiceoverPath,
    videoSha256: episode.sha256,
    voiceoverSha256: mixMetadata.voiceoverSha256,
    durationSeconds: Number(episode.durationSeconds),
    width: Number(episode.width),
    height: Number(episode.height),
    fps: Number(episode.fps),
    bgmSha256: audit.mix?.bgmSha256,
  };
};

const chapterVisualPreview = (chapterId) => {
  const path = join(REMOTION, 'renders/claude-code-course', chapterId, 'tmp/preview/visual/manifest.json');
  if (!existsSync(path)) return {ready: false, reason: 'visual preview is missing'};
  const manifest = json(path);
  if (!manifest.path || !manifest.sha256) return {ready: false, reason: 'visual preview manifest is incomplete'};
  const videoPath = resolve(ROOT, manifest.path);
  if (!existsSync(videoPath)) return {ready: false, reason: 'visual preview video is missing'};
  if (shaFile(videoPath) !== manifest.sha256) return {ready: false, reason: 'visual preview SHA mismatch'};
  const episodePath = join(EPISODES, `${chapterId}.json`);
  const episode = json(episodePath);
  const sourceFingerprint = claudeCodeChapterSourceFingerprint({remotionRoot: REMOTION, repositoryRoot: ROOT, episode});
  const expectedFingerprint = chapterVisualFingerprint({episodePath, episode, sourceFingerprint, scale: manifest.scale});
  if (manifest.fingerprint !== expectedFingerprint) return {ready: false, reason: 'visual preview inputs changed'};
  return {ready: true, scale: manifest.scale, width: manifest.width, height: manifest.height};
};

const validateVolume = (volume) => {
  const chapters = volume.chapters.map(loadChapter);
  for (const chapter of chapters) chapter.problem && fail(`${volume.volumeId}/${chapter.chapterId}: ${chapter.problem}`);
  chapters[0].episode.continuity?.entryState === volume.entryState
    || fail(`${volume.volumeId}: first chapter entryState does not match volume`);
  chapters.at(-1).episode.continuity?.exitState === volume.exitState
    || fail(`${volume.volumeId}: final chapter exitState does not match volume`);
  for (let index = 0; index < chapters.length; index += 1) {
    const current = chapters[index].episode;
    const expectedIndex = Number(current.episodeId.slice(2, 4));
    current.continuity?.chapterIndex === expectedIndex
      || fail(`${current.episodeId}: continuity.chapterIndex must be ${expectedIndex}`);
    const previous = chapters[index - 1]?.episode ?? null;
    const next = chapters[index + 1]?.episode ?? null;
    if (previous) {
      current.continuity?.previousEpisodeId === previous.episodeId
        || fail(`${current.episodeId}: previousEpisodeId must be ${previous.episodeId}`);
      previous.continuity?.exitState === current.continuity?.entryState
        || fail(`${current.episodeId}: entryState does not match previous exitState`);
    }
    if (next) {
      current.continuity?.nextEpisodeId === next.episodeId
        || fail(`${current.episodeId}: nextEpisodeId must be ${next.episodeId}`);
      current.continuity?.exitState === next.continuity?.entryState
        || fail(`${current.episodeId}: exitState does not match next entryState`);
    }
  }
  return chapters;
};

const validateProgramContinuity = (program) => {
  const chapterIds = program.volumes.flatMap((volume) => volume.chapters);
  chapterIds.length === 10 || fail(`program must contain exactly 10 chapters, found ${chapterIds.length}`);
  const chapters = chapterIds.map(loadChapter);
  for (const chapter of chapters) chapter.problem && fail(`${chapter.chapterId}: ${chapter.problem}`);
  const compositionIds = new Set();
  for (let index = 0; index < chapters.length; index += 1) {
    const current = chapters[index].episode;
    const previous = chapters[index - 1]?.episode ?? null;
    const next = chapters[index + 1]?.episode ?? null;
    current.continuity?.chapterIndex === index + 1
      || fail(`${current.episodeId}: continuity.chapterIndex must be ${index + 1}`);
    typeof current.compositionId === 'string' && /^[A-Za-z][A-Za-z0-9]+$/.test(current.compositionId)
      || fail(`${current.episodeId}: invalid compositionId`);
    !compositionIds.has(current.compositionId) || fail(`Duplicate chapter compositionId: ${current.compositionId}`);
    compositionIds.add(current.compositionId);
    current.continuity?.previousEpisodeId === (previous?.episodeId ?? null)
      || fail(`${current.episodeId}: previousEpisodeId must be ${previous?.episodeId ?? 'null'}`);
    current.continuity?.nextEpisodeId === (next?.episodeId ?? null)
      || fail(`${current.episodeId}: nextEpisodeId must be ${next?.episodeId ?? 'null'}`);
    if (previous) {
      previous.continuity?.exitState === current.continuity?.entryState
        || fail(`${current.episodeId}: entryState does not match ${previous.episodeId} exitState`);
    }
  }
  for (let index = 1; index < program.volumes.length; index += 1) {
    const previous = program.volumes[index - 1];
    const current = program.volumes[index];
    previous.exitState === current.entryState
      || fail(`${current.volumeId}: entryState does not match ${previous.volumeId} exitState`);
  }
  return chapters;
};

const printPlan = (volume) => {
  const chapters = volume.chapters.map(loadChapter);
  const knownDuration = chapters.reduce((sum, chapter) => sum + Number(chapter.episode?.durationSeconds ?? 0), 0);
  console.log(`${volume.volumeId} · ${volume.title}`);
  console.log(`PROMISE ${volume.promise}`);
  console.log(`STATE   ${volume.entryState} -> ${volume.exitState}`);
  for (const chapter of chapters) {
    if (chapter.problem) {
      console.log(`MISSING ${chapter.chapterId}: ${chapter.problem}`);
      continue;
    }
    const preview = chapterPreview(chapter.chapterId);
    const visual = chapterVisualPreview(chapter.chapterId);
    const status = preview.ready ? 'READY' : chapter.episode.status.toUpperCase().padEnd(7);
    const visualStatus = visual.ready ? ` · visual ${visual.width}×${visual.height}` : '';
    console.log(`${status} ${chapter.chapterId} · ${chapter.episode.title} · ${chapter.episode.durationSeconds}s${visualStatus}${preview.reason ? ` · ${preview.reason}` : ''}`);
  }
  console.log(`DURATION ${knownDuration}s known across ${chapters.filter((chapter) => chapter.episode).length}/${chapters.length} chapters`);
  const missing = chapters.filter((chapter) => chapter.problem).length;
  const ready = chapters.filter((chapter) => !chapter.problem && chapterPreview(chapter.chapterId).ready).length;
  if (missing > 0 || ready !== chapters.length) {
    console.log(`BLOCK volume draft: ${missing} source chapter(s) missing, ${chapters.length - ready} chapter preview(s) not ready`);
  } else {
    console.log('READY volume draft inputs: all chapter previews and audio audits are SHA-bound');
  }
  console.log('BLOCK candidate/current/release: volume audit and approval adapter is not implemented');
};

const volumeDraftFingerprint = (volume, inputs, bgmPath) => sha(JSON.stringify({
  schema: 1,
  volumeId: volume.volumeId,
  policy: 'copy-chapter-video+concat-aligned-voice+continuous-bgm-v1',
  chapters: inputs.map((input) => ({
    episodeId: input.chapterId,
    videoSha256: input.preview.videoSha256,
    voiceoverSha256: input.preview.voiceoverSha256,
    durationSeconds: input.preview.durationSeconds,
  })),
  bgmSha256: shaFile(bgmPath),
  bgmVolume: 0.05,
}));

const buildVolumeDraft = async (volume) => {
  const chapters = validateVolume(volume);
  const inputs = chapters.map((chapter) => ({
    chapterId: chapter.chapterId,
    episode: chapter.episode,
    preview: chapterPreview(chapter.chapterId),
  }));
  const blocked = inputs.filter((input) => !input.preview.ready);
  blocked.length === 0 || fail(`${volume.volumeId}: ${blocked.map((input) => `${input.chapterId} (${input.preview.reason})`).join(', ')}`);
  const format = inputs[0].preview;
  for (const input of inputs) {
    input.preview.width === format.width && input.preview.height === format.height
      || fail(`${volume.volumeId}: chapter preview dimensions do not match`);
    Math.abs(input.preview.fps - format.fps) <= 0.001
      || fail(`${volume.volumeId}: chapter preview frame rates do not match`);
    input.preview.bgmSha256 === format.bgmSha256
      || fail(`${volume.volumeId}: chapter BGM sources do not match`);
  }
  const bgmPath = resolve(ROOT, inputs[0].episode.audio.bgm.source);
  existsSync(bgmPath) || fail(`${volume.volumeId}: BGM is missing`);
  shaFile(bgmPath) === format.bgmSha256 || fail(`${volume.volumeId}: BGM SHA does not match chapter audit`);
  const fingerprint = volumeDraftFingerprint(volume, inputs, bgmPath);
  const volumeRoot = join(REMOTION, 'renders/claude-code-course/volumes', volume.volumeId);
  const cacheDir = join(volumeRoot, 'tmp/cache/volume-draft', fingerprint);
  const cacheVideo = join(cacheDir, 'volume.mp4');
  const cacheManifest = join(cacheDir, 'manifest.json');
  const previewDir = join(volumeRoot, 'tmp/preview');
  const previewVideo = join(previewDir, 'volume.mp4');
  const previewManifest = join(previewDir, 'manifest.json');
  if (!existsSync(cacheVideo) || !existsSync(cacheManifest) || json(cacheManifest).sha256 !== shaFile(cacheVideo)) {
    const partial = `${cacheDir}.partial-${process.pid}`;
    const logs = join(partial, 'logs');
    rmSync(partial, {recursive: true, force: true});
    mkdirSync(logs, {recursive: true});
    writeFileSync(join(partial, 'video.ffconcat'), `${inputs.map((input) => ffconcatPath(input.preview.videoPath)).join('\n')}\n`);
    writeFileSync(join(partial, 'voice.ffconcat'), `${inputs.map((input) => ffconcatPath(input.preview.voiceoverPath)).join('\n')}\n`);
    const videoOnly = join(partial, 'video-only.mp4');
    const voiceover = join(partial, 'voiceover.m4a');
    const mix = join(partial, 'mix.m4a');
    const assembled = join(partial, 'volume.mp4');
    const totalDuration = inputs.reduce((sum, input) => sum + input.preview.durationSeconds, 0);
    await run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-f', 'concat', '-safe', '0',
      '-i', join(partial, 'video.ffconcat'), '-map', '0:v:0', '-c:v', 'copy', '-an',
      '-movflags', '+faststart', videoOnly,
    ], join(logs, 'concat-video.log'));
    await run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-f', 'concat', '-safe', '0',
      '-i', join(partial, 'voice.ffconcat'), '-map', '0:a:0', '-c:a', 'copy', voiceover,
    ], join(logs, 'concat-voice.log'));
    await run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-stream_loop', '-1', '-i', bgmPath, '-i', voiceover,
      '-filter_complex',
      `[0:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS,volume=0.05[bgm];` +
      `[1:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS[voice];` +
      '[voice][bgm]amix=inputs=2:duration=longest:normalize=0,' +
      'loudnorm=I=-16:TP=-3:LRA=7,alimiter=limit=0.84[a]',
      '-map', '[a]', '-t', String(totalDuration), '-ar', '48000', '-ac', '2',
      '-c:a', 'aac', '-b:a', '192k', mix,
    ], join(logs, 'mix.log'));
    await run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-i', videoOnly, '-i', mix,
      '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-shortest', '-movflags', '+faststart', assembled,
    ], join(logs, 'mux.log'));
    const probe = JSON.parse(await run('ffprobe', [
      '-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration',
      '-of', 'json', assembled,
    ], join(logs, 'ffprobe.log')));
    const outputDuration = Number(probe.format?.duration);
    Math.abs(outputDuration - totalDuration) <= 0.5
      || fail(`${volume.volumeId}: assembled duration ${outputDuration}s != ${totalDuration}s`);
    const chapterOffsets = [];
    let offset = 0;
    for (const input of inputs) {
      chapterOffsets.push({
        episodeId: input.chapterId,
        offsetSeconds: Number(offset.toFixed(3)),
        durationSeconds: input.preview.durationSeconds,
        videoSha256: input.preview.videoSha256,
        voiceoverSha256: input.preview.voiceoverSha256,
      });
      offset += input.preview.durationSeconds;
    }
    writeJson(join(partial, 'manifest.json'), {
      schemaVersion: 1,
      stage: 'volume-draft-preview',
      ownership: 'Rebuildable SHA-bound Volume draft in tmp; not Candidate, Current, Release, or Published.',
      volumeId: volume.volumeId,
      compositionId: volume.compositionId,
      fingerprint,
      width: format.width,
      height: format.height,
      fps: format.fps,
      durationSeconds: outputDuration,
      chapters: chapterOffsets,
      audio: {
        voiceoverPolicy: 'chapter-aligned voiceovers concatenated in manifest order',
        bgmPolicy: 'one continuous bed for the entire Volume',
        bgmSha256: format.bgmSha256,
        bgmVolume: 0.05,
        mixSha256: shaFile(mix),
      },
      sha256: shaFile(assembled),
      generatedAt: new Date().toISOString(),
    });
    mkdirSync(dirname(cacheDir), {recursive: true});
    rmSync(cacheDir, {recursive: true, force: true});
    renameSync(partial, cacheDir);
  }
  const manifest = json(cacheManifest);
  const method = materialize(cacheVideo, previewVideo);
  writeJson(previewManifest, {
    ...manifest,
    path: rel(previewVideo),
    cachePath: rel(cacheVideo),
    materialization: method,
  });
  console.log(`READY ${rel(previewVideo)}`);
  console.log(`MANIFEST ${rel(previewManifest)}`);
  console.log('BLOCK candidate/current/release: volume audit and approval adapter is not implemented');
};

const volumeDraftPreview = (volume) => {
  const volumeRoot = join(REMOTION, 'renders/claude-code-course/volumes', volume.volumeId);
  const manifestPath = join(volumeRoot, 'tmp/preview/manifest.json');
  existsSync(manifestPath) || fail(`${volume.volumeId}: volume Draft manifest is missing; run draft first`);
  const manifest = json(manifestPath);
  manifest.stage === 'volume-draft-preview' || fail(`${volume.volumeId}: preview is not a volume Draft`);
  manifest.volumeId === volume.volumeId || fail(`${volume.volumeId}: preview manifest identity mismatch`);
  const videoPath = resolve(ROOT, manifest.path ?? '');
  existsSync(videoPath) || fail(`${volume.volumeId}: volume Draft video is missing`);
  shaFile(videoPath) === manifest.sha256 || fail(`${volume.volumeId}: volume Draft SHA mismatch`);
  return {volumeRoot, manifestPath, manifest, videoPath};
};

const continuousSheetName = (index) => `sheet_${String(index).padStart(4, '0')}.jpg`;

const buildChapterContinuousReview = async ({chapterId, episode, preview}) => {
  const reviewRoot = join(REMOTION, 'renders/claude-code-course', chapterId, 'tmp/preview/review');
  const outputDir = join(reviewRoot, 'continuous-2fps');
  const manifestPath = join(reviewRoot, 'visual-manifest.json');
  const plan = continuousReviewPlan(preview.durationSeconds);
  const continuousPolicy = {
    fps: VOLUME_REVIEW_POLICY.continuousFps,
    framesPerSheet: VOLUME_REVIEW_POLICY.continuousFramesPerSheet,
    frameWidth: VOLUME_REVIEW_POLICY.continuousFrameWidth,
    lastPagePadding: false,
  };
  const fingerprint = sha(JSON.stringify({
    schema: 1,
    policy: continuousPolicy,
    episodeId: chapterId,
    videoSha256: preview.videoSha256,
    durationSeconds: preview.durationSeconds,
  }));
  if (existsSync(manifestPath)) {
    const current = json(manifestPath);
    const reusable = current.fingerprint === fingerprint
      && current.sheetCount === plan.sheetCount
      && Array.from({length: plan.sheetCount}, (_, index) => join(outputDir, continuousSheetName(index + 1)))
        .every(existsSync);
    if (reusable) return {...current, outputDir, manifestPath, cacheHit: true};
  }

  const partial = `${outputDir}.partial-${process.pid}`;
  rmSync(partial, {recursive: true, force: true});
  mkdirSync(partial, {recursive: true});
  try {
    await run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-i', preview.videoPath,
      '-vf', `fps=${VOLUME_REVIEW_POLICY.continuousFps},scale=${VOLUME_REVIEW_POLICY.continuousFrameWidth}:-2,` +
        `tile=${VOLUME_REVIEW_POLICY.continuousFramesPerSheet}x1:nb_frames=${VOLUME_REVIEW_POLICY.continuousFramesPerSheet}`,
      '-fps_mode', 'vfr', '-q:v', '3', join(partial, 'sheet_%04d.jpg'),
    ], join(partial, 'ffmpeg.log'));
    const sheets = readdirSync(partial).filter((name) => /^sheet_\d{4}\.jpg$/.test(name)).sort();
    sheets.length === plan.sheetCount
      || fail(`${chapterId}: expected ${plan.sheetCount} continuous review sheets, found ${sheets.length}`);
    if (plan.lastSheetFrames < VOLUME_REVIEW_POLICY.continuousFramesPerSheet) {
      const last = join(partial, sheets.at(-1));
      const cropped = join(partial, 'last-sheet-cropped.jpg');
      await run('ffmpeg', [
        '-y', '-hide_banner', '-nostats', '-i', last,
        '-vf', `crop=${plan.lastSheetWidth}:ih:0:0`, '-frames:v', '1', '-q:v', '3', cropped,
      ], join(partial, 'crop-last-sheet.log'));
      renameSync(cropped, last);
    }
    rmSync(outputDir, {recursive: true, force: true});
    renameSync(partial, outputDir);
  } catch (error) {
    rmSync(partial, {recursive: true, force: true});
    throw error;
  }
  const manifest = {
    schemaVersion: 1,
    stage: 'chapter-draft-visual-review',
    ownership: 'Rebuildable 2fps Draft review view; not Candidate audit evidence or a verdict.',
    episodeId: chapterId,
    title: episode.title,
    fingerprint,
    source: {
      path: rel(preview.videoPath),
      sha256: preview.videoSha256,
      durationSeconds: preview.durationSeconds,
    },
    policy: continuousPolicy,
    sampleFrames: plan.sampleFrames,
    sheetCount: plan.sheetCount,
    lastSheetFrames: plan.lastSheetFrames,
    directory: rel(outputDir),
    generatedAt: new Date().toISOString(),
  };
  writeJson(manifestPath, manifest);
  return {...manifest, outputDir, manifestPath, cacheHit: false};
};

const writeVolumeReviewReport = ({volume, reviewRoot, overviewPath, boundaries, chapters, fingerprint}) => {
  const webPath = (path) => relative(reviewRoot, path).replaceAll('\\', '/');
  const chapterSections = chapters.map((chapter) => {
    const sheets = Array.from({length: chapter.sheetCount}, (_, index) => {
      const path = join(chapter.outputDir, continuousSheetName(index + 1));
      return `<img loading="lazy" decoding="async" src="${escapeHtml(webPath(path))}" alt="${escapeHtml(chapter.episodeId)} review sheet ${index + 1}">`;
    }).join('\n');
    return `<details>
      <summary>${escapeHtml(chapter.episodeId)} · ${escapeHtml(chapter.title)} · ${chapter.sampleFrames} frames / ${chapter.sheetCount} sheets${chapter.cacheHit ? ' · reused' : ''}</summary>
      <div class="sheets">${sheets}</div>
    </details>`;
  }).join('\n');
  const boundarySections = boundaries.map((boundary) => `<figure>
    <figcaption>${escapeHtml(boundary.previousEpisodeId)} → ${escapeHtml(boundary.nextEpisodeId)} · ${boundary.cutSeconds}s</figcaption>
    <img loading="lazy" decoding="async" src="${escapeHtml(webPath(boundary.path))}" alt="${escapeHtml(boundary.previousEpisodeId)} to ${escapeHtml(boundary.nextEpisodeId)} boundary">
  </figure>`).join('\n');
  const reportPath = join(reviewRoot, 'report.html');
  writeFileSync(reportPath, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(volume.title)} · Draft Review</title>
<style>
:root{color-scheme:light;background:#f4f1eb;color:#1f1d1a;font-family:Inter,"Noto Sans SC",sans-serif}body{margin:0;padding:32px}main{max-width:1440px;margin:auto}h1{font-size:28px;margin:0 0 8px}.meta{color:#716a60;margin:0 0 28px}section{margin:32px 0}h2{font-size:18px;margin:0 0 12px}figure{margin:0 0 20px}figcaption,summary{font-weight:650;margin:0 0 8px}img{display:block;max-width:100%;height:auto;background:#fff;border-radius:8px;box-shadow:0 8px 30px rgba(45,38,30,.08)}.boundaries img{width:100%}details{margin:0 0 14px;background:#fff;border-radius:10px;padding:14px 16px}summary{cursor:pointer}.sheets{display:grid;gap:10px;margin-top:14px}.sheets img{width:100%;border-radius:4px;box-shadow:none}.legend{font-size:13px;color:#716a60;margin:-4px 0 16px}
</style></head><body><main>
<h1>${escapeHtml(volume.title)}</h1><p class="meta">Draft review · ${escapeHtml(fingerprint.slice(0, 12))} · 不构成 Candidate verdict</p>
<section><h2>全卷导航</h2><img src="${escapeHtml(webPath(overviewPath))}" alt="Volume overview"></section>
<section class="boundaries"><h2>章节接缝</h2><p class="legend">每张图上排为切点前 0.5 秒，下排为切点后 0.5 秒；两侧均为 10fps 连续取样。</p>${boundarySections}</section>
<section><h2>逐章连续 2fps</h2>${chapterSections}</section>
</main></body></html>\n`);
  return reportPath;
};

const buildVolumeReview = async (volume) => {
  const chapters = validateVolume(volume).map((chapter) => ({
    chapterId: chapter.chapterId,
    episode: chapter.episode,
    preview: chapterPreview(chapter.chapterId),
  }));
  const blocked = chapters.filter((chapter) => !chapter.preview.ready);
  blocked.length === 0 || fail(`${volume.volumeId}: ${blocked.map((chapter) => `${chapter.chapterId} (${chapter.preview.reason})`).join(', ')}`);
  const draft = volumeDraftPreview(volume);
  draft.manifest.chapters.length === chapters.length || fail(`${volume.volumeId}: Draft chapter count mismatch`);
  for (const [index, chapter] of chapters.entries()) {
    const assembled = draft.manifest.chapters[index];
    assembled.episodeId === chapter.chapterId || fail(`${volume.volumeId}: Draft chapter order mismatch`);
    assembled.videoSha256 === chapter.preview.videoSha256
      || fail(`${volume.volumeId}: ${chapter.chapterId} preview SHA changed; rebuild the Volume Draft`);
  }

  const chapterReviews = await Promise.all(chapters.map(buildChapterContinuousReview));
  const reviewRoot = join(draft.volumeRoot, 'tmp/preview/review');
  const overviewPath = join(reviewRoot, 'overview.png');
  const boundariesRoot = join(reviewRoot, 'boundaries');
  const reviewManifestPath = join(reviewRoot, 'manifest.json');
  const fingerprint = volumeReviewFingerprint({
    volumeId: volume.volumeId,
    volumeSha256: draft.manifest.sha256,
    chapters: draft.manifest.chapters,
  });
  const boundaryPlans = boundaryReviewPlan(draft.manifest.chapters);
  const existing = existsSync(reviewManifestPath) ? json(reviewManifestPath) : null;
  const reusable = existing?.fingerprint === fingerprint
    && existsSync(overviewPath)
    && existsSync(join(reviewRoot, 'report.html'))
    && boundaryPlans.every((boundary) => existsSync(join(boundariesRoot, boundary.filename)))
    && chapterReviews.every((chapter) => existing.chapters?.some((current) =>
      current.episodeId === chapter.episodeId && current.fingerprint === chapter.fingerprint));
  if (reusable) {
    console.log(`READY ${rel(join(reviewRoot, 'report.html'))}`);
    console.log(`REUSED ${rel(reviewManifestPath)}`);
    console.log('BLOCK candidate/current/release: Draft review is not a promotable verdict');
    return;
  }

  const taskRoot = join(draft.volumeRoot, 'tmp/tasks', `review-${process.pid}`);
  const taskBoundaries = join(taskRoot, 'boundaries');
  rmSync(taskRoot, {recursive: true, force: true});
  mkdirSync(taskBoundaries, {recursive: true});
  try {
    const overviewTask = join(taskRoot, 'overview.png');
    const overview = run('ffmpeg', [
      '-y', '-hide_banner', '-nostats', '-i', draft.videoPath,
      '-vf', `fps=${VOLUME_REVIEW_POLICY.overviewFrames}/${draft.manifest.durationSeconds},scale=480:270,` +
        `tile=${VOLUME_REVIEW_POLICY.overviewColumns}x${VOLUME_REVIEW_POLICY.overviewColumns}:nb_frames=${VOLUME_REVIEW_POLICY.overviewFrames}`,
      '-frames:v', '1', overviewTask,
    ], join(taskRoot, 'logs/overview.log'));
    const boundaryTasks = boundaryPlans.map((boundary) => run('ffmpeg', [
      '-y', '-hide_banner', '-nostats',
      '-ss', String(boundary.beforeStartSeconds), '-t', String(VOLUME_REVIEW_POLICY.boundaryWindowSeconds), '-i', draft.videoPath,
      '-ss', String(boundary.afterStartSeconds), '-t', String(VOLUME_REVIEW_POLICY.boundaryWindowSeconds), '-i', draft.videoPath,
      '-filter_complex',
      `[0:v]setpts=PTS-STARTPTS,fps=${VOLUME_REVIEW_POLICY.boundaryFps},scale=${VOLUME_REVIEW_POLICY.boundaryFrameWidth}:-2,` +
      `tile=${VOLUME_REVIEW_POLICY.boundaryFramesPerSide}x1:nb_frames=${VOLUME_REVIEW_POLICY.boundaryFramesPerSide}[before];` +
      `[1:v]setpts=PTS-STARTPTS,fps=${VOLUME_REVIEW_POLICY.boundaryFps},scale=${VOLUME_REVIEW_POLICY.boundaryFrameWidth}:-2,` +
      `tile=${VOLUME_REVIEW_POLICY.boundaryFramesPerSide}x1:nb_frames=${VOLUME_REVIEW_POLICY.boundaryFramesPerSide}[after];` +
      '[before][after]vstack=inputs=2',
      '-frames:v', '1', '-q:v', '3', join(taskBoundaries, boundary.filename),
    ], join(taskRoot, `logs/boundary-${String(boundary.index).padStart(2, '0')}.log`)));
    await Promise.all([overview, ...boundaryTasks]);
    mkdirSync(reviewRoot, {recursive: true});
    rmSync(overviewPath, {force: true});
    renameSync(overviewTask, overviewPath);
    rmSync(boundariesRoot, {recursive: true, force: true});
    renameSync(taskBoundaries, boundariesRoot);
    const boundaries = boundaryPlans.map((boundary) => ({
      ...boundary,
      path: join(boundariesRoot, boundary.filename),
    }));
    const reportPath = writeVolumeReviewReport({
      volume,
      reviewRoot,
      overviewPath,
      boundaries,
      chapters: chapterReviews,
      fingerprint,
    });
    writeJson(reviewManifestPath, {
      schemaVersion: 1,
      stage: 'volume-draft-review',
      ownership: 'Rebuildable Draft review view; not Candidate audit evidence or a verdict.',
      volumeId: volume.volumeId,
      fingerprint,
      source: {
        path: rel(draft.videoPath),
        sha256: draft.manifest.sha256,
        durationSeconds: draft.manifest.durationSeconds,
      },
      policy: VOLUME_REVIEW_POLICY,
      overviewPath: rel(overviewPath),
      boundaries: boundaries.map((boundary) => ({
        previousEpisodeId: boundary.previousEpisodeId,
        nextEpisodeId: boundary.nextEpisodeId,
        cutSeconds: boundary.cutSeconds,
        path: rel(boundary.path),
      })),
      chapters: chapterReviews.map((chapter) => ({
        episodeId: chapter.episodeId,
        fingerprint: chapter.fingerprint,
        manifestPath: rel(chapter.manifestPath),
        sheetCount: chapter.sheetCount,
      })),
      reportPath: rel(reportPath),
      generatedAt: new Date().toISOString(),
    });
    console.log(`READY ${rel(reportPath)}`);
    console.log(`MANIFEST ${rel(reviewManifestPath)}`);
    console.log('BLOCK candidate/current/release: Draft review is not a promotable verdict');
  } finally {
    rmSync(taskRoot, {recursive: true, force: true});
  }
};

try {
  const program = loadProgram();
  validateProgramContinuity(program);
  const volumes = selectVolumes(program);
  if (COMMAND === 'validate') {
    for (const volume of volumes) {
      const chapters = validateVolume(volume);
      console.log(`Validated ${volume.volumeId}: ${chapters.length} chapters`);
    }
  } else if (COMMAND === 'plan' || COMMAND === 'status') {
    for (const [index, volume] of volumes.entries()) {
      if (index > 0) console.log('');
      printPlan(volume);
    }
  } else if (COMMAND === 'draft') {
    for (const volume of volumes) await buildVolumeDraft(volume);
  } else if (COMMAND === 'review') {
    for (const volume of volumes) await buildVolumeReview(volume);
  } else {
    fail('Usage: claude-code-course:volume validate|plan|status|draft|review [volume-id]');
  }
} catch (error) {
  console.error(`claude-code-course:volume: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
