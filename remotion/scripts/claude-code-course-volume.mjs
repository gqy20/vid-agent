#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
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
  } else {
    fail('Usage: claude-code-course:volume validate|plan|status|draft [volume-id]');
  }
} catch (error) {
  console.error(`claude-code-course:volume: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
