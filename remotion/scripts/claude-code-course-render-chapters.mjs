#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {availableParallelism} from 'node:os';
import {execFileSync} from 'node:child_process';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {
  chapterVisualFingerprint,
  claudeCodeBundleSourceFingerprint,
  claudeCodeChapterSourceFingerprint,
  sha256,
  sha256File,
} from './lib/claude-code-render-fingerprint.mjs';

const REMOTION = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(REMOTION, '..');
const COURSE = join(ROOT, 'claude-code-course');
const EPISODES = join(COURSE, 'episodes');
const SHARED_TMP = join(REMOTION, 'renders/claude-code-course/tmp');
const args = process.argv.slice(2);
const flags = new Map(args.filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, ...rest] = arg.slice(2).split('=');
  return [key, rest.length > 0 ? rest.join('=') : 'true'];
}));
const episodeIds = args.filter((arg) => !arg.startsWith('--'));

const fail = (message) => { throw new Error(message); };
const sha = sha256;
const shaFile = sha256File;
const rel = (path) => relative(ROOT, path).replaceAll('\\', '/');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  const partial = `${path}.partial-${process.pid}`;
  writeFileSync(partial, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(partial, path);
};

if (episodeIds.length === 0) {
  fail('Usage: claude-code-course:render-chapters <episode-id>... [--scale=1|2] [--jobs=N] [--force]');
}

const scale = Number(flags.get('scale') ?? 1);
[1, 2].includes(scale) || fail('--scale must be 1 or 2');
const cpuCount = availableParallelism();
const requestedJobs = Number(flags.get('jobs') ?? Math.min(episodeIds.length, Math.max(1, Math.floor(cpuCount / 4))));
Number.isInteger(requestedJobs) && requestedJobs > 0 || fail('--jobs must be a positive integer');
const jobs = Math.min(requestedJobs, episodeIds.length);
const concurrencyPerChapter = Math.max(1, Math.floor(cpuCount / jobs));

const bundleSourceFingerprint = claudeCodeBundleSourceFingerprint({remotionRoot: REMOTION, repositoryRoot: ROOT});
const bundleFingerprint = sha(JSON.stringify({schema: 1, sourceFingerprint: bundleSourceFingerprint, entry: 'remotion/src/index.ts'}));
const bundleDir = join(SHARED_TMP, 'cache/bundles', bundleFingerprint);
const readyPath = join(bundleDir, 'bundle-ready.json');
let serveUrl = bundleDir;
if (!existsSync(join(bundleDir, 'index.html')) || !existsSync(readyPath) || json(readyPath).bundleFingerprint !== bundleFingerprint) {
  const partial = `${bundleDir}.partial-${process.pid}`;
  rmSync(partial, {recursive: true, force: true});
  mkdirSync(partial, {recursive: true});
  serveUrl = await bundle({
    entryPoint: join(REMOTION, 'src/index.ts'),
    outDir: partial,
    onProgress: () => undefined,
    symlinkPublicDir: true,
  });
  writeJson(join(partial, 'bundle-ready.json'), {schemaVersion: 1, bundleFingerprint, sourceFingerprint: bundleSourceFingerprint});
  mkdirSync(dirname(bundleDir), {recursive: true});
  rmSync(bundleDir, {recursive: true, force: true});
  renameSync(partial, bundleDir);
  serveUrl = bundleDir;
}

const chapters = episodeIds.map((episodeId) => {
  const episodePath = join(EPISODES, `${episodeId}.json`);
  existsSync(episodePath) || fail(`Episode not found: ${episodeId}`);
  const episode = json(episodePath);
  episode.episodeId === episodeId || fail(`${episodeId}: episodeId mismatch`);
  typeof episode.compositionId === 'string' || fail(`${episodeId}: compositionId is required`);
  const sourceFingerprint = claudeCodeChapterSourceFingerprint({remotionRoot: REMOTION, repositoryRoot: ROOT, episode});
  const fingerprint = chapterVisualFingerprint({episodePath, episode, sourceFingerprint, scale});
  const root = join(REMOTION, 'renders/claude-code-course', episodeId);
  const cacheDir = join(root, 'tmp/cache/chapter-visual', fingerprint);
  return {
    episode,
    episodePath,
    sourceFingerprint,
    fingerprint,
    cacheDir,
    cacheVideo: join(cacheDir, 'chapter.mp4'),
    cacheMetadata: join(cacheDir, 'metadata.json'),
    previewDir: join(root, 'tmp/preview/visual'),
  };
});

const cacheHit = (chapter) => {
  if (!existsSync(chapter.cacheVideo) || !existsSync(chapter.cacheMetadata)) return false;
  const metadata = json(chapter.cacheMetadata);
  return metadata.fingerprint === chapter.fingerprint && metadata.sha256 === shaFile(chapter.cacheVideo);
};

const probeChapterVideo = (path) => {
  const output = execFileSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,r_frame_rate,nb_frames:format=duration',
    '-of', 'json',
    path,
  ], {encoding: 'utf8'});
  const probe = JSON.parse(output);
  const stream = probe.streams?.[0];
  stream || fail(`Rendered chapter has no video stream: ${path}`);
  const [numerator, denominator] = String(stream.r_frame_rate).split('/').map(Number);
  return {
    durationSeconds: Number(probe.format?.duration),
    width: Number(stream.width),
    height: Number(stream.height),
    fps: numerator / denominator,
    frames: Number(stream.nb_frames),
  };
};

const materialize = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  const partial = `${target}.partial-${process.pid}`;
  rmSync(partial, {force: true});
  let method = 'hardlink';
  try {
    linkSync(source, partial);
  } catch {
    cpSync(source, partial);
    method = 'copy';
  }
  renameSync(partial, target);
  return method;
};

const renderChapter = async (chapter) => {
  if (!flags.has('force') && cacheHit(chapter)) return {...chapter, cache: 'hit'};
  const composition = await selectComposition({
    serveUrl,
    id: chapter.episode.compositionId,
    inputProps: {},
    browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
    timeoutInMilliseconds: 120000,
    logLevel: 'warn',
    chromiumOptions: scale === 2 ? {gl: 'angle', enableMultiProcessOnLinux: true} : undefined,
  });
  const partialDir = `${chapter.cacheDir}.partial-${process.pid}`;
  const partialVideo = join(partialDir, 'chapter.mp4');
  rmSync(partialDir, {recursive: true, force: true});
  mkdirSync(partialDir, {recursive: true});
  const attempts = [...new Set([concurrencyPerChapter, Math.max(1, Math.floor(concurrencyPerChapter / 2)), 1])];
  let usedConcurrency = concurrencyPerChapter;
  let lastError = null;
  for (const concurrency of attempts) {
    try {
      rmSync(partialVideo, {force: true});
      await renderMedia({
        composition,
        serveUrl,
        outputLocation: partialVideo,
        codec: 'h264',
        pixelFormat: 'yuv420p',
        crf: 18,
        imageFormat: 'jpeg',
        jpegQuality: 88,
        scale,
        muted: true,
        overwrite: true,
        concurrency,
        timeoutInMilliseconds: 120000,
        browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
        chromiumOptions: scale === 2 ? {gl: 'angle', enableMultiProcessOnLinux: true} : undefined,
        logLevel: 'warn',
      });
      usedConcurrency = concurrency;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    rmSync(partialDir, {recursive: true, force: true});
    throw lastError;
  }
  const probe = probeChapterVideo(partialVideo);
  Math.abs(probe.durationSeconds - chapter.episode.durationSeconds) <= 0.2
    || fail(`${chapter.episode.episodeId}: rendered duration ${probe.durationSeconds}s != episode ${chapter.episode.durationSeconds}s`);
  probe.width === chapter.episode.resolution.width * scale
    || fail(`${chapter.episode.episodeId}: rendered width ${probe.width} is incorrect`);
  probe.height === chapter.episode.resolution.height * scale
    || fail(`${chapter.episode.episodeId}: rendered height ${probe.height} is incorrect`);
  Math.abs(probe.fps - chapter.episode.fps) <= 0.001
    || fail(`${chapter.episode.episodeId}: rendered fps ${probe.fps} is incorrect`);
  const metadata = {
    schemaVersion: 1,
    episodeId: chapter.episode.episodeId,
    compositionId: chapter.episode.compositionId,
    fingerprint: chapter.fingerprint,
    sourceFingerprint: chapter.sourceFingerprint,
    scale,
    width: probe.width,
    height: probe.height,
    fps: probe.fps,
    frames: probe.frames,
    durationSeconds: probe.durationSeconds,
    muted: true,
    requestedConcurrency: concurrencyPerChapter,
    usedConcurrency,
    sha256: shaFile(partialVideo),
    generatedAt: new Date().toISOString(),
  };
  writeJson(join(partialDir, 'metadata.json'), metadata);
  mkdirSync(dirname(chapter.cacheDir), {recursive: true});
  rmSync(chapter.cacheDir, {recursive: true, force: true});
  renameSync(partialDir, chapter.cacheDir);
  return {...chapter, cache: 'built'};
};

const queue = [...chapters];
const completed = [];
const failures = [];
const worker = async () => {
  while (queue.length > 0) {
    const chapter = queue.shift();
    try {
      const result = await renderChapter(chapter);
      completed.push(result);
      console.log(`${result.cache === 'hit' ? 'HIT  ' : 'PASS '} ${result.episode.episodeId}`);
    } catch (error) {
      failures.push({episodeId: chapter.episode.episodeId, message: error instanceof Error ? error.message : String(error)});
      console.error(`FAIL  ${chapter.episode.episodeId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
await Promise.all(Array.from({length: jobs}, worker));

for (const chapter of completed) {
  const previewVideo = join(chapter.previewDir, 'chapter.mp4');
  const method = materialize(chapter.cacheVideo, previewVideo);
  const metadata = json(chapter.cacheMetadata);
  writeJson(join(chapter.previewDir, 'manifest.json'), {
    ...metadata,
    stage: 'outline-visual-preview',
    ownership: 'Rebuildable chapter visual preview backed by tmp/cache; not Candidate, Current, Release, or a packaged episode.',
    cachePath: rel(chapter.cacheVideo),
    path: rel(previewVideo),
    materialization: method,
  });
  console.log(`READY ${rel(previewVideo)}`);
}

writeJson(join(SHARED_TMP, 'build/chapter-render-last-run.json'), {
  schemaVersion: 1,
  bundleSourceFingerprint,
  bundleFingerprint,
  scale,
  jobs,
  concurrencyPerChapter,
  completed: completed.map((chapter) => ({episodeId: chapter.episode.episodeId, fingerprint: chapter.fingerprint, sha256: shaFile(chapter.cacheVideo)})),
  failures,
  finishedAt: new Date().toISOString(),
});

if (failures.length > 0) process.exitCode = 1;
