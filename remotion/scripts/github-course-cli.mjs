#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {execFile, execFileSync} from 'node:child_process';
import {cpus} from 'node:os';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import ts from 'typescript';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REMOTION = join(ROOT, 'remotion');
const EPISODES = join(ROOT, 'github-course/episodes');
const BROWSER_LAB = join(ROOT, 'scripts/browser-recordings/github-course-lab');
const PUBLIC_BROWSER = join(REMOTION, 'public/github-course/browser');
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const AUDIT_POLICY_VERSION = 'github-course-visual-v1';
const FULL_AUDIT_POLICY_VERSION = 'github-course-full-hd-v1';
const COMMAND = process.argv[2] ?? 'status';
const COMMAND_ARGS = process.argv.slice(3);
const EPISODE_ID = COMMAND_ARGS.find((arg) => !arg.startsWith('--'));
const FLAGS = new Map(COMMAND_ARGS.filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, value = '1'] = arg.slice(2).split('=', 2);
  return [key, value];
}));

const fail = (message) => { throw new Error(message); };
const sha = (value) => createHash('sha256').update(value).digest('hex');
const shaFile = (path) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
};
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  const partial = `${path}.partial`;
  writeFileSync(partial, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(partial, path);
};
const rel = (path) => relative(ROOT, path).replaceAll('\\', '/');

const walkFiles = (root, accept = () => true) => {
  if (!existsSync(root)) return [];
  const result = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (accept(path)) result.push(path);
    }
  };
  walk(root);
  return result.sort();
};

const hashFiles = (files) => {
  const hash = createHash('sha256');
  for (const path of files.filter((item) => existsSync(item)).sort()) {
    hash.update(rel(path));
    hash.update('\0');
    hash.update(readFileSync(path));
    hash.update('\0');
  }
  return hash.digest('hex');
};

const run = async (file, args, {cwd = REMOTION, env = {}, log} = {}) => {
  try {
    const result = await exec(file, args, {cwd, env: {...process.env, ...env}, maxBuffer: 32 * 1024 * 1024});
    if (log) {
      mkdirSync(dirname(log), {recursive: true});
      writeFileSync(log, `${result.stdout ?? ''}${result.stderr ?? ''}`);
    }
    return result;
  } catch (error) {
    if (log) {
      mkdirSync(dirname(log), {recursive: true});
      writeFileSync(log, `${error.stdout ?? ''}${error.stderr ?? ''}`);
    }
    throw error;
  }
};

const episodeFiles = () => readdirSync(EPISODES)
  .filter((name) => /^gh\d{2}-[a-z0-9-]+\.json$/.test(name))
  .sort()
  .map((name) => join(EPISODES, name));

const validateEpisode = (episode, path, {checkAssets = false} = {}) => {
  const expectedId = path.split('/').at(-1).replace(/\.json$/, '');
  episode.episodeId === expectedId || fail(`${rel(path)}: episodeId must be ${expectedId}`);
  ['outline', 'draft', 'production', 'review', 'released'].includes(episode.status) || fail(`${episode.episodeId}: invalid status`);
  episode.fps === FPS || fail(`${episode.episodeId}: fps must be ${FPS}`);
  episode.resolution?.width === WIDTH && episode.resolution?.height === HEIGHT || fail(`${episode.episodeId}: resolution must be ${WIDTH}x${HEIGHT}`);
  episode.deliveryResolution?.width === 3840 && episode.deliveryResolution?.height === 2160 || fail(`${episode.episodeId}: deliveryResolution must be 3840x2160`);
  Number.isFinite(episode.durationSeconds) && episode.durationSeconds > 0 || fail(`${episode.episodeId}: durationSeconds must be positive`);
  episode.audio?.model === 'speech-2.8-hd' || fail(`${episode.episodeId}: audio.model must be speech-2.8-hd`);
  episode.audio?.voice === 'Chinese (Mandarin)_Gentleman' || fail(`${episode.episodeId}: audio.voice must be Chinese (Mandarin)_Gentleman`);
  episode.audio?.language === 'zh' || fail(`${episode.episodeId}: audio.language must be zh`);
  episode.audio?.speed === 1.25 || fail(`${episode.episodeId}: audio.speed must be 1.25`);
  typeof episode.audio?.bgm?.source === 'string' && episode.audio.bgm.source.length > 0 || fail(`${episode.episodeId}: audio.bgm.source is required`);
  episode.audio?.bgm?.volume === 0.05 || fail(`${episode.episodeId}: audio.bgm.volume must be 0.05`);
  Array.isArray(episode.sourceOfTruth?.references) && episode.sourceOfTruth.references.length > 0 || fail(`${episode.episodeId}: official references are required`);
  Array.isArray(episode.scenes) && episode.scenes.length > 0 || fail(`${episode.episodeId}: scenes must not be empty`);

  const sceneIds = new Set();
  const segmentIds = new Set();
  let cursor = 0;
  for (const scene of episode.scenes) {
    typeof scene.id === 'string' && scene.id.length > 0 || fail(`${episode.episodeId}: scene id is required`);
    typeof scene.caption === 'string' && scene.caption.trim().length > 0 || fail(`${episode.episodeId}:${scene.id}: caption is required`);
    !sceneIds.has(scene.id) || fail(`${episode.episodeId}: duplicate scene id ${scene.id}`);
    sceneIds.add(scene.id);
    scene.start === cursor || fail(`${episode.episodeId}:${scene.id}: starts at ${scene.start}, expected ${cursor}`);
    Number.isFinite(scene.duration) && scene.duration > 0 || fail(`${episode.episodeId}:${scene.id}: duration must be positive`);
    cursor += scene.duration;
    const narration = scene.narration;
    narration && typeof narration.text === 'string' && narration.text.trim() || fail(`${episode.episodeId}:${scene.id}: narration text is required`);
    typeof narration.segmentId === 'string' && narration.segmentId.length > 0 || fail(`${episode.episodeId}:${scene.id}: narration segmentId is required`);
    !segmentIds.has(narration.segmentId) || fail(`${episode.episodeId}: duplicate narration segment ${narration.segmentId}`);
    segmentIds.add(narration.segmentId);
    Number.isFinite(narration.voiceStart) && narration.voiceStart >= scene.start && narration.voiceStart < cursor || fail(`${episode.episodeId}:${scene.id}: narration voiceStart is outside the scene`);
  }
  cursor === episode.durationSeconds || fail(`${episode.episodeId}: scenes end at ${cursor}, expected ${episode.durationSeconds}`);

  const recordings = episode.browserRecordings ?? [];
  const recordingIds = new Set();
  for (const recording of recordings) {
    !recordingIds.has(recording.id) || fail(`${episode.episodeId}: duplicate browser recording ${recording.id}`);
    recordingIds.add(recording.id);
    recording.containsSensitiveState === false || fail(`${episode.episodeId}:${recording.id}: containsSensitiveState must be false`);
    for (const field of ['src', 'poster', 'metadata']) {
      typeof recording[field] === 'string' && recording[field].startsWith('github-course/browser/') || fail(`${episode.episodeId}:${recording.id}: invalid ${field}`);
    }
    if (checkAssets) validateBrowserAsset(recording);
  }
  for (const scene of episode.scenes) {
    if (scene.browserRecordingId) recordingIds.has(scene.browserRecordingId) || fail(`${episode.episodeId}:${scene.id}: unknown browser recording ${scene.browserRecordingId}`);
  }
  return episode;
};

const validateBrowserAsset = (recording) => {
  const paths = browserPaths(recording);
  for (const path of [paths.video, paths.poster, paths.metadata]) existsSync(path) || fail(`${recording.id}: browser asset missing: ${rel(path)}`);
  const metadata = json(paths.metadata);
  metadata.recordingId === recording.scenarioId || metadata.recordingId === recording.id || fail(`${recording.id}: metadata recordingId mismatch`);
  metadata.containsSensitiveState === false || fail(`${recording.id}: generated metadata is sensitive`);
  const regionIds = new Set();
  for (const region of metadata.focusRegions ?? []) {
    !regionIds.has(region.id) || fail(`${recording.id}: duplicate focus region ${region.id}`);
    regionIds.add(region.id);
    for (const key of ['x', 'y', 'width', 'height']) Number.isFinite(region[key]) || fail(`${recording.id}:${region.id}: invalid ${key}`);
    region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0 && region.x + region.width <= 1.000001 && region.y + region.height <= 1.000001 || fail(`${recording.id}:${region.id}: focus region is outside viewport`);
  }
  return metadata;
};

const validateAll = ({checkAssets = false} = {}) => {
  const episodes = episodeFiles().map((path) => validateEpisode(json(path), path, {checkAssets}));
  console.log(`Validated ${episodes.length} GitHub Course episode JSON file(s)${checkAssets ? ' and browser assets' : ''}.`);
  return episodes;
};

const loadContext = () => {
  EPISODE_ID || fail('Usage: pnpm github-course <command> <episode-id>');
  const episodePath = join(EPISODES, `${EPISODE_ID}.json`);
  existsSync(episodePath) || fail(`Unknown episode: ${EPISODE_ID}`);
  const episode = validateEpisode(json(episodePath), episodePath);
  const base = join(REMOTION, 'renders/github-course', EPISODE_ID);
  const tmp = join(base, 'tmp');
  const build = join(tmp, 'build');
  const cache = join(tmp, 'cache');
  const statePath = join(build, 'state.json');
  const state = existsSync(statePath) ? json(statePath) : {schemaVersion: 1, scenes: {}, browser: {}, tts: {}};
  state.scenes ??= {};
  state.browser ??= {};
  state.tts ??= {};
  return {episode, episodePath, base, tmp, build, cache, statePath, state};
};

const compositionFor = (episodeId) => ({
  'gh01-git-vs-github': 'GitHubCourseGh01GitVsGithub',
}[episodeId] ?? fail(`No composition mapping for ${episodeId}`));

const episodeSourceFor = (episodeId) => ({
  'gh01-git-vs-github': join(REMOTION, 'src/videos/github-course/episodes/Gh01GitVsGithub.tsx'),
}[episodeId] ?? fail(`No episode source mapping for ${episodeId}`));

const browserPaths = (recording) => ({
  video: join(REMOTION, 'public', recording.src),
  poster: join(REMOTION, 'public', recording.poster),
  metadata: join(REMOTION, 'public', recording.metadata),
});

const browserSourceFingerprint = (recording) => {
  const scenarioName = recording.scenarioId.replaceAll('-', '_');
  const files = [
    join(BROWSER_LAB, 'record.py'),
    join(BROWSER_LAB, 'scenarios/base.py'),
    join(BROWSER_LAB, 'scenarios/__init__.py'),
    join(BROWSER_LAB, `scenarios/${scenarioName}.py`),
  ];
  return sha(JSON.stringify({schema: 1, scenarioId: recording.scenarioId, sourceHash: hashFiles(files), viewport: recording.viewport}));
};

const sourceParts = (ctx) => {
  if (ctx.sourceParts) return ctx.sourceParts;
  const path = episodeSourceFor(ctx.episode.episodeId);
  const source = readFileSync(path, 'utf8');
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const statements = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) statements.set(declaration.name.text, statement);
    }
  }
  const blocks = new Map();
  const ranges = [];
  for (const scene of ctx.episode.scenes) {
    const pascal = scene.id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const name = `${pascal}Scene`;
    const statement = statements.get(name);
    statement || fail(`${rel(path)}: expected scene component ${name}`);
    const start = statement.getStart(sourceFile);
    const end = statement.getEnd();
    blocks.set(scene.id, source.slice(start, end));
    ranges.push({sceneId: scene.id, start, end});
  }
  let shared = source;
  for (const range of ranges.sort((a, b) => b.start - a.start)) shared = `${shared.slice(0, range.start)}// scene:${range.sceneId}${shared.slice(range.end)}`;
  ctx.sourceParts = {path, blocks, shared};
  return ctx.sourceParts;
};

const visualBaseHash = (ctx) => {
  const courseRoot = join(REMOTION, 'src/videos/github-course');
  const shared = [
    join(courseRoot, 'data/episodes.ts'),
    join(courseRoot, 'palette.ts'),
    join(courseRoot, 'timeline.ts'),
    join(courseRoot, 'typography.ts'),
    join(courseRoot, 'kit/index.ts'),
    join(courseRoot, 'kit/layout/GitHubCourseLayout.tsx'),
    join(courseRoot, 'kit/browser/types.ts'),
    join(courseRoot, 'kit/browser/BrowserPanel.tsx'),
    join(courseRoot, 'kit/browser/BrowserFocusScene.tsx'),
    join(courseRoot, 'kit/browser/BrowserEvidenceScene.tsx'),
    join(courseRoot, 'kit/bridge/GitHubStateBridge.tsx'),
  ];
  const parts = sourceParts(ctx);
  return sha(JSON.stringify({
    schema: 1,
    fileHash: hashFiles([...shared, join(REMOTION, 'src/fonts.css'), join(REMOTION, 'package.json'), join(REMOTION, 'pnpm-lock.yaml'), join(REMOTION, 'remotion.config.ts')]),
    sharedEpisodeSource: parts.shared,
  }));
};

const recordingAssetFingerprint = (recording) => {
  const paths = browserPaths(recording);
  if (![paths.video, paths.poster, paths.metadata].every(existsSync)) return null;
  return sha(JSON.stringify({video: shaFile(paths.video), poster: shaFile(paths.poster), metadata: shaFile(paths.metadata)}));
};

const narrationSource = (ctx) => {
  const dir = join(ctx.tmp, 'narration-source');
  mkdirSync(dir, {recursive: true});
  const rows = ['# segment_id\tvoice_start_seconds\tscene_end_seconds'];
  for (const scene of ctx.episode.scenes) {
    const {segmentId, voiceStart, text} = scene.narration;
    writeFileSync(join(dir, `${segmentId}.txt`), `${text.trimEnd()}\n`);
    rows.push(`${segmentId}\t${voiceStart}\t${scene.start + scene.duration}`);
  }
  const manifest = join(dir, 'manifest.tsv');
  writeFileSync(manifest, `${rows.join('\n')}\n`);
  return manifest;
};

const normalizedSpeechText = (value) => value
  .replace(/<#[0-9.]+#>/g, '')
  .replace(/[\s，。；;：:、,.!?！？“”"'‘’（）()\-]/g, '')
  .toLowerCase();

const srtText = (path) => readFileSync(path, 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim() && !/^\d+$/.test(line.trim()) && !/-->/.test(line))
  .join('');

const ttsFingerprint = (ctx, scene) => sha(JSON.stringify({
  schema: 1,
  text: scene.narration.text,
  model: ctx.episode.audio.model,
  voice: ctx.episode.audio.voice,
  language: ctx.episode.audio.language,
  speed: ctx.episode.audio.speed,
  engine: 'mmx-cli-v1',
  normalization: 'acompressor-v1+loudnorm-I-20-TP-3-LRA7',
}));

const ttsCachePaths = (ctx, scene) => {
  const fingerprint = ttsFingerprint(ctx, scene);
  const dir = join(ctx.cache, 'tts', fingerprint);
  return {
    fingerprint,
    dir,
    raw: join(dir, 'raw.mp3'),
    srt: join(dir, 'subtitles.srt'),
    text: join(dir, 'source.txt'),
    norm: join(dir, 'normalized.mp3'),
    metadata: join(dir, 'metadata.json'),
  };
};

const validateTtsArtifacts = (ctx, scene, paths) => {
  for (const path of [paths.raw, paths.srt, paths.text, paths.norm]) existsSync(path) || fail(`${scene.narration.segmentId}: missing TTS artifact ${rel(path)}`);
  const source = readFileSync(paths.text, 'utf8').trim();
  source === scene.narration.text.trim() || fail(`${scene.narration.segmentId}: staged narration text does not match episode JSON`);
  const subtitles = readFileSync(paths.srt, 'utf8');
  !/<#|#>/.test(subtitles) || fail(`${scene.narration.segmentId}: pause marker leaked into SRT`);
  normalizedSpeechText(srtText(paths.srt)) === normalizedSpeechText(scene.narration.text) || fail(`${scene.narration.segmentId}: SRT text does not match episode narration`);
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', paths.norm], {encoding: 'utf8'}).trim());
  Number.isFinite(duration) && duration > 0.5 || fail(`${scene.narration.segmentId}: invalid normalized narration duration`);
  const voiceEnd = scene.narration.voiceStart + duration;
  const sceneEnd = scene.start + scene.duration;
  voiceEnd <= sceneEnd || fail(`${scene.narration.segmentId}: voice ends at ${voiceEnd.toFixed(3)}s after scene end ${sceneEnd}s`);
  return {duration, voiceEnd, sceneEnd};
};

const audioFingerprint = (ctx, ttsTasks) => {
  const bgm = resolve(ROOT, ctx.episode.audio.bgm.source);
  existsSync(bgm) || fail(`${ctx.episode.episodeId}: BGM not found: ${rel(bgm)}`);
  return sha(JSON.stringify({
    schema: 1,
    tts: ttsTasks.map((task) => ({segmentId: task.scene.narration.segmentId, fingerprint: task.fingerprint, voiceStart: task.scene.narration.voiceStart})),
    bgm: {sha256: shaFile(bgm), volume: ctx.episode.audio.bgm.volume},
    durationSeconds: ctx.episode.durationSeconds,
    mastering: 'segment--20LUFS+mix--16LUFS-TP-3-v1',
  }));
};

const plan = (ctx) => {
  const browser = (ctx.episode.browserRecordings ?? []).map((recording) => {
    const fingerprint = browserSourceFingerprint(recording);
    const metadataPath = browserPaths(recording).metadata;
    const metadata = existsSync(metadataPath) ? json(metadataPath) : null;
    const assetsPresent = Object.values(browserPaths(recording)).every(existsSync);
    const hit = assetsPresent && metadata?.sourceFingerprint === fingerprint && ctx.state.browser[recording.id]?.fingerprint === fingerprint;
    return {recording, fingerprint, hit, assetsPresent};
  });
  const baseHash = visualBaseHash(ctx);
  const recordings = new Map((ctx.episode.browserRecordings ?? []).map((recording) => [recording.id, recording]));
  const scenes = ctx.episode.scenes.map((scene, index) => {
    const {narration: _narration, ...visualScene} = scene;
    const recording = scene.browserRecordingId ? recordings.get(scene.browserRecordingId) : null;
    const assetFingerprint = recording ? recordingAssetFingerprint(recording) : null;
    const fingerprint = sha(JSON.stringify({schema: 1, baseHash, sourceBlock: sourceParts(ctx).blocks.get(scene.id), scene: visualScene, assetFingerprint, fps: FPS, width: WIDTH, height: HEIGHT}));
    let cached = ctx.state.scenes[scene.id];
    let hit = cached?.fingerprint === fingerprint && existsSync(join(ROOT, cached.path ?? ''));
    if (!hit && existsSync(join(ctx.cache, 'scenes'))) {
      const recovered = readdirSync(join(ctx.cache, 'scenes')).find((name) => name.endsWith(`_${fingerprint.slice(0, 12)}.mp4`));
      if (recovered) {
        const path = join(ctx.cache, 'scenes', recovered);
        cached = {fingerprint, path: rel(path), sha256: shaFile(path), recoveredAt: new Date().toISOString()};
        ctx.state.scenes[scene.id] = cached;
        hit = true;
      }
    }
    return {scene, index, fingerprint, hit, cached};
  });
  const tts = ctx.episode.scenes.map((scene) => {
    const paths = ttsCachePaths(ctx, scene);
    const metadata = existsSync(paths.metadata) ? json(paths.metadata) : null;
    const hit = [paths.raw, paths.srt, paths.text, paths.norm].every(existsSync)
      && metadata?.fingerprint === paths.fingerprint
      && metadata.normalizedSha256 === shaFile(paths.norm);
    return {scene, fingerprint: paths.fingerprint, paths, hit};
  });
  return {baseHash, browser, scenes, tts};
};

const printPlan = (ctx, buildPlan) => {
  console.log(`GitHub Course · ${ctx.episode.episodeId}`);
  for (const task of buildPlan.browser) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} browser ${task.recording.id}`);
  for (const task of buildPlan.scenes) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} render  ${task.scene.id}`);
  for (const task of buildPlan.tts) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} tts     ${task.scene.narration.segmentId}`);
  console.log('BLOCK promote 1080p candidates are not promotable; 4K gate is not open');
};

const recordBrowserAssets = async (ctx) => {
  const buildPlan = plan(ctx);
  const requested = (FLAGS.get('recordings') ?? '').split(',').filter(Boolean);
  const tasks = buildPlan.browser.filter((task) => FLAGS.has('force') || !task.hit || requested.includes(task.recording.id));
  if (tasks.length === 0) {
    console.log('HIT   browser assets');
    return;
  }
  const settled = await Promise.allSettled(tasks.map(async (task) => {
    await run('uv', ['run', 'python', join(BROWSER_LAB, 'record.py'), task.recording.scenarioId], {cwd: ROOT, log: join(ctx.build, 'logs/browser', `${task.recording.id}.log`)});
    const paths = browserPaths(task.recording);
    const metadata = validateBrowserAsset(task.recording);
    metadata.sourceFingerprint = task.fingerprint;
    writeJson(paths.metadata, metadata);
    const assetFingerprint = recordingAssetFingerprint(task.recording);
    ctx.state.browser[task.recording.id] = {fingerprint: task.fingerprint, assetFingerprint, capturedAt: metadata.capturedAt, metadata: rel(paths.metadata), updatedAt: new Date().toISOString()};
    console.log(`PASS  browser ${task.recording.id}`);
  }));
  writeJson(ctx.statePath, ctx.state);
  const failures = settled.filter((result) => result.status === 'rejected');
  failures.length === 0 || fail(`${failures.length} browser recording(s) failed:\n${failures.map((item) => item.reason?.message ?? String(item.reason)).join('\n')}`);
};

const renderScenes = async (ctx, tasks) => {
  if (tasks.length === 0) return;
  const logicalCpus = cpus().length;
  const profilePath = join(REMOTION, 'renders/github-course/tmp/render-profile-hd30.json');
  const stable = existsSync(profilePath) ? json(profilePath).maxStableConcurrencyPerBrowser : logicalCpus;
  const requested = Number(FLAGS.get('render-concurrency') ?? Math.max(1, Math.floor(logicalCpus / tasks.length)));
  const concurrency = FLAGS.has('render-concurrency') ? requested : Math.min(requested, stable ?? logicalCpus);
  const bundleFingerprint = hashFiles([
    ...walkFiles(join(REMOTION, 'src'), (path) => /\.(?:ts|tsx|css)$/.test(path)),
    join(REMOTION, 'package.json'),
    join(REMOTION, 'pnpm-lock.yaml'),
    join(REMOTION, 'remotion.config.ts'),
  ]);
  const bundleDir = join(REMOTION, 'renders/github-course/tmp/bundles', bundleFingerprint);
  const cacheDir = join(ctx.cache, 'scenes');
  mkdirSync(cacheDir, {recursive: true});
  const planned = tasks.map((task) => {
    const start = task.scene.start * FPS;
    const end = (task.scene.start + task.scene.duration) * FPS - 1;
    const taskDir = join(ctx.build, 'tasks', `render-${task.scene.id}`);
    rmSync(taskDir, {recursive: true, force: true});
    const output = join(taskDir, 'segments', `${String(task.index + 1).padStart(3, '0')}_${String(start).padStart(6, '0')}-${String(end).padStart(6, '0')}.mp4`);
    return {
      task,
      start,
      end,
      output,
      cachePath: join(cacheDir, `${String(task.index + 1).padStart(2, '0')}_${task.scene.id.replaceAll('-', '_')}_${task.fingerprint.slice(0, 12)}.mp4`),
      completionPath: join(taskDir, 'render-completion.json'),
    };
  });
  const planPath = join(ctx.build, 'render-plan.json');
  writeJson(planPath, {
    schemaVersion: 1,
    entryPoint: join(REMOTION, 'src/index.ts'),
    compositionId: compositionFor(ctx.episode.episodeId),
    logicalCpus,
    bundleDir,
    bundleFingerprint,
    profilePath,
    timeoutInMilliseconds: Number(FLAGS.get('timeout-ms') ?? 120000),
    telemetryPath: join(ctx.build, 'telemetry/render-scenes.json'),
    tasks: planned.map((item) => ({sceneId: item.task.scene.id, start: item.start, end: item.end, output: item.output, cacheOutput: item.cachePath, completionPath: item.completionPath, scale: 1, concurrency, fallbackConcurrency: stable ?? logicalCpus})),
  });
  let renderError = null;
  try {
    await run('node', [join(REMOTION, 'scripts/git-course-render-scenes.mjs'), planPath], {log: join(ctx.build, 'logs/render-scenes.log')});
  } catch (error) {
    renderError = error;
  }
  for (const item of planned) {
    if (!existsSync(item.cachePath) || !existsSync(item.completionPath)) continue;
    const frames = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', item.cachePath], {encoding: 'utf8'}).trim());
    frames === item.end - item.start + 1 || fail(`${item.task.scene.id}: expected ${item.end - item.start + 1} frames, found ${frames}`);
    ctx.state.scenes[item.task.scene.id] = {fingerprint: item.task.fingerprint, path: rel(item.cachePath), sha256: shaFile(item.cachePath), render: json(item.completionPath), updatedAt: new Date().toISOString()};
    console.log(`PASS  render ${item.task.scene.id}`);
  }
  writeJson(ctx.statePath, ctx.state);
  if (renderError) throw renderError;
};

const buildAudio = async (ctx, buildPlan) => {
  const audioDir = join(ctx.build, 'candidate/audio');
  const segmentsDir = join(audioDir, 'segments');
  mkdirSync(segmentsDir, {recursive: true});
  const stagedPaths = (scene) => {
    const segment = scene.narration.segmentId;
    return {
      raw: join(segmentsDir, `${segment}.mp3`),
      srt: join(segmentsDir, `${segment}.srt`),
      text: join(segmentsDir, `${segment}.txt`),
      norm: join(segmentsDir, `${segment}_norm.mp3`),
    };
  };
  for (const task of buildPlan.tts) {
    const staged = stagedPaths(task.scene);
    for (const key of ['raw', 'srt', 'text', 'norm']) {
      if (existsSync(task.paths[key]) && (!existsSync(staged[key]) || shaFile(task.paths[key]) !== shaFile(staged[key]))) copyFileSync(task.paths[key], staged[key]);
    }
  }
  const dirty = buildPlan.tts.filter((task) => !task.hit);
  const mix = join(audioDir, 'mix.m4a');
  const voiceover = join(audioDir, 'voiceover-aligned.m4a');
  const fingerprint = audioFingerprint(ctx, buildPlan.tts);
  if (dirty.length === 0 && ctx.state.audio?.fingerprint === fingerprint && existsSync(mix) && ctx.state.audio.mixSha256 === shaFile(mix)) {
    console.log('HIT   audio mix');
    return {mix, voiceover, fingerprint};
  }

  const synthesizeIds = dirty.filter((task) => {
    const staged = stagedPaths(task.scene);
    return (!existsSync(task.paths.raw) || !existsSync(task.paths.srt)) && (!existsSync(staged.raw) || !existsSync(staged.srt));
  }).map((task) => task.scene.narration.segmentId);
  const normalizeIds = dirty.map((task) => task.scene.narration.segmentId);
  const manifest = narrationSource(ctx);
  const bgm = resolve(ROOT, ctx.episode.audio.bgm.source);
  await run(join(REMOTION, 'scripts/git-course-build-voiceover.sh'), [ctx.episode.episodeId], {
    env: {
      NARRATION_MANIFEST: manifest,
      AUDIO_DIR: audioDir,
      TMP_DIR: join(ctx.tmp, 'audio-build'),
      BGM_FILE: bgm,
      BGM_VOLUME: String(ctx.episode.audio.bgm.volume),
      EPISODE_DURATION: String(ctx.episode.durationSeconds),
      TTS_MODEL: ctx.episode.audio.model,
      TTS_VOICE: ctx.episode.audio.voice,
      TTS_LANGUAGE: ctx.episode.audio.language,
      TTS_SPEED: String(ctx.episode.audio.speed),
      TTS_SEGMENTS: synthesizeIds.join(','),
      NORMALIZE_SEGMENTS: normalizeIds.join(','),
      TTS_JOBS: 'all',
      NORMALIZE_JOBS: 'all',
      SKIP_TTS: synthesizeIds.length === 0 ? '1' : '0',
      SKIP_NORM: normalizeIds.length === 0 ? '1' : '0',
      SKIP_REMUX: '1',
      CANONICALIZE_SRT_FROM_SOURCE: '1',
      MASTER_TRUE_PEAK: '-3.0',
      FINAL_TRUE_PEAK_CEILING: '-1.5',
    },
    log: join(ctx.build, 'logs/audio.log'),
  });

  for (const task of buildPlan.tts) {
    const staged = stagedPaths(task.scene);
    const timing = validateTtsArtifacts(ctx, task.scene, staged);
    mkdirSync(task.paths.dir, {recursive: true});
    copyFileSync(staged.raw, task.paths.raw);
    copyFileSync(staged.srt, task.paths.srt);
    copyFileSync(staged.text, task.paths.text);
    copyFileSync(staged.norm, task.paths.norm);
    writeJson(task.paths.metadata, {
      schemaVersion: 1,
      fingerprint: task.fingerprint,
      rawSha256: shaFile(staged.raw),
      srtSha256: shaFile(staged.srt),
      normalizedSha256: shaFile(staged.norm),
      durationSeconds: timing.duration,
      voiceStart: task.scene.narration.voiceStart,
      voiceEnd: timing.voiceEnd,
      sceneEnd: timing.sceneEnd,
      generatedBy: 'mmx-cli',
      updatedAt: new Date().toISOString(),
    });
    ctx.state.tts[task.scene.narration.segmentId] = {fingerprint: task.fingerprint, path: rel(task.paths.norm), sha256: shaFile(task.paths.norm), durationSeconds: timing.duration};
    console.log(`PASS  tts ${task.scene.narration.segmentId}: ${timing.duration.toFixed(3)}s`);
  }
  for (const path of [mix, voiceover]) existsSync(path) || fail(`Audio build did not create ${rel(path)}`);
  ctx.state.audio = {fingerprint, mix: rel(mix), mixSha256: shaFile(mix), voiceover: rel(voiceover), voiceoverSha256: shaFile(voiceover), updatedAt: new Date().toISOString()};
  console.log(`PASS  audio mix ${rel(mix)}`);
  return {mix, voiceover, fingerprint};
};

const assembleVisual = async (ctx, buildPlan) => {
  const candidateDir = join(ctx.build, 'candidate');
  mkdirSync(candidateDir, {recursive: true});
  const ordered = buildPlan.scenes.map((task) => {
    const state = ctx.state.scenes[task.scene.id] ?? fail(`No scene cache state: ${task.scene.id}`);
    const path = join(ROOT, state.path);
    existsSync(path) || fail(`Missing scene cache: ${rel(path)}`);
    return {sceneId: task.scene.id, path, sha256: shaFile(path)};
  });
  const inputFingerprint = sha(JSON.stringify({schema: 1, scenes: ordered.map((item) => item.sha256)}));
  const candidate = join(candidateDir, `${ctx.episode.episodeId}_visual.mp4`);
  const artifactPath = join(ctx.build, 'visual-artifact-manifest.json');
  if (existsSync(candidate) && existsSync(artifactPath)) {
    const previous = json(artifactPath);
    if (previous.inputFingerprint === inputFingerprint && previous.sha256 === shaFile(candidate)) {
      console.log(`HIT   assemble ${rel(candidate)}`);
      return {candidate, artifact: previous};
    }
  }
  const concat = join(candidateDir, 'scenes.ffconcat');
  writeFileSync(concat, ordered.map((item) => `file '${item.path.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  await run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', concat, '-map', '0:v:0', '-c:v', 'copy', '-an', '-movflags', '+faststart', '-f', 'mp4', `${candidate}.partial`], {log: join(ctx.build, 'logs/assemble-visual.log')});
  renameSync(`${candidate}.partial`, candidate);
  const artifact = {schemaVersion: 1, kind: 'visual-only', episodeId: ctx.episode.episodeId, inputFingerprint, path: rel(candidate), sha256: shaFile(candidate), createdAt: new Date().toISOString(), scenes: ordered.map((item) => ({sceneId: item.sceneId, path: rel(item.path), sha256: item.sha256}))};
  writeJson(artifactPath, artifact);
  const reviewDir = join(candidateDir, 'scenes');
  rmSync(reviewDir, {recursive: true, force: true});
  mkdirSync(reviewDir, {recursive: true});
  ordered.forEach((item, index) => copyFileSync(item.path, join(reviewDir, `${String(index + 1).padStart(2, '0')}_${item.sceneId.replaceAll('-', '_')}.mp4`)));
  console.log(`PASS  assemble ${rel(candidate)}`);
  return {candidate, artifact};
};

const assembleFull = async (ctx, visual, audio) => {
  const candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`);
  const artifactPath = join(ctx.build, 'full-artifact-manifest.json');
  const inputFingerprint = sha(JSON.stringify({schema: 1, visual: shaFile(visual.candidate), audio: shaFile(audio.mix)}));
  if (existsSync(candidate) && existsSync(artifactPath)) {
    const previous = json(artifactPath);
    if (previous.inputFingerprint === inputFingerprint && previous.sha256 === shaFile(candidate)) {
      console.log(`HIT   assemble full ${rel(candidate)}`);
      return {candidate, artifact: previous};
    }
  }
  await run('ffmpeg', [
    '-nostdin', '-y',
    '-i', visual.candidate,
    '-i', audio.mix,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-shortest',
    '-movflags', '+faststart',
    '-f', 'mp4',
    `${candidate}.partial`,
  ], {log: join(ctx.build, 'logs/assemble-full.log')});
  renameSync(`${candidate}.partial`, candidate);
  const artifact = {
    schemaVersion: 1,
    kind: 'full-hd-candidate',
    episodeId: ctx.episode.episodeId,
    inputFingerprint,
    path: rel(candidate),
    sha256: shaFile(candidate),
    visual: {path: rel(visual.candidate), sha256: shaFile(visual.candidate)},
    audio: {path: rel(audio.mix), sha256: shaFile(audio.mix)},
    createdAt: new Date().toISOString(),
  };
  writeJson(artifactPath, artifact);
  console.log(`PASS  assemble full ${rel(candidate)}`);
  return {candidate, artifact};
};

const probe = (path) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8'}));

const samplingPlan = (ctx) => {
  const dir = join(ctx.build, 'sampling-plans/visual');
  mkdirSync(dir, {recursive: true});
  const boundaries = [];
  const keyframes = [];
  ctx.episode.scenes.forEach((scene, index) => {
    const safe = scene.id.replaceAll('-', '_');
    keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_start`, scene.start + 0.1]);
    keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_mid`, scene.start + scene.duration / 2]);
    keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_end`, scene.start + scene.duration - 0.1]);
    if (index > 0) boundaries.push([`${String(index).padStart(2, '0')}_${ctx.episode.scenes[index - 1].id.replaceAll('-', '_')}_to_${safe}`, scene.start]);
  });
  const boundariesPath = join(dir, 'boundaries.tsv');
  const keyframesPath = join(dir, 'keyframes.tsv');
  writeFileSync(boundariesPath, boundaries.map((row) => row.join('\t')).join('\n') + '\n');
  writeFileSync(keyframesPath, keyframes.map((row) => row.join('\t')).join('\n') + '\n');
  return {boundariesPath, keyframesPath, boundaryCount: boundaries.length, keyframeCount: keyframes.length};
};

const auditVisual = async (ctx, candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}_visual.mp4`)) => {
  existsSync(candidate) || fail(`Visual candidate not found: ${rel(candidate)}`);
  const info = probe(candidate);
  const video = info.streams.find((stream) => stream.codec_type === 'video');
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(info.format.duration);
  const planData = samplingPlan(ctx);
  const artifactSha256 = shaFile(candidate);
  const inputFingerprint = existsSync(join(ctx.build, 'visual-artifact-manifest.json')) ? json(join(ctx.build, 'visual-artifact-manifest.json')).inputFingerprint : artifactSha256;
  const auditScriptSha256 = shaFile(join(REMOTION, 'scripts/audit-video-stills.sh'));
  const auditFingerprint = sha(JSON.stringify({policy: AUDIT_POLICY_VERSION, auditScriptSha256, artifactSha256, boundaries: readFileSync(planData.boundariesPath, 'utf8'), keyframes: readFileSync(planData.keyframesPath, 'utf8')}));
  const auditDir = join(ctx.build, 'audit/visual');
  const verdictPath = join(auditDir, 'verdict.json');
  if (existsSync(verdictPath) && existsSync(join(auditDir, 'report.html'))) {
    const previous = json(verdictPath);
    if (previous.auditFingerprint === auditFingerprint && previous.artifactSha256 === artifactSha256) {
      console.log(`HIT   audit visual: ${previous.verdict}`);
      return previous;
    }
  }
  rmSync(auditDir, {recursive: true, force: true});
  await run(join(REMOTION, 'scripts/audit-video-stills.sh'), [candidate, auditDir], {
    env: {BOUNDARIES_FILE: planData.boundariesPath, KEYFRAMES_FILE: planData.keyframesPath, AUDIT_TITLE: 'GitHub Course Visual Audit'},
    log: join(ctx.build, 'logs/audit-visual.log'),
  });
  const sampling = json(join(auditDir, 'manifest.json')).sampling;
  const checks = [
    {id: 'video.stream', status: video ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} ${video.r_frame_rate}` : 'missing'},
    {id: 'video.resolution', status: video?.width === WIDTH && video?.height === HEIGHT ? 'pass' : 'fail', details: `${video?.width ?? 0}x${video?.height ?? 0}`},
    {id: 'video.fps', status: video?.r_frame_rate === `${FPS}/1` ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    {id: 'duration.visual', status: Math.abs(duration - ctx.episode.durationSeconds) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${ctx.episode.durationSeconds}s`},
    {id: 'audio.pending', status: audio ? 'fail' : 'needs_review', details: audio ? 'visual candidate unexpectedly contains audio' : 'audio adapter not connected'},
    {id: 'sampling.continuous2fps', status: sampling.review.actualFrames === sampling.review.expectedFrames ? 'pass' : 'fail', details: `${sampling.review.actualFrames}/${sampling.review.expectedFrames}`},
    {id: 'sampling.boundaries10fps', status: sampling.boundaries.count === planData.boundaryCount ? 'pass' : 'fail', details: `${sampling.boundaries.count}/${planData.boundaryCount}`},
    {id: 'sampling.keyframes', status: sampling.keyframes.count === planData.keyframeCount ? 'pass' : 'fail', details: `${sampling.keyframes.count}/${planData.keyframeCount}`},
  ];
  for (const recording of ctx.episode.browserRecordings ?? []) {
    try {
      const metadata = validateBrowserAsset(recording);
      checks.push({id: `browser.${recording.id}.sensitive`, status: metadata.containsSensitiveState === false ? 'pass' : 'fail', details: `capturedAt=${metadata.capturedAt}`});
      checks.push({id: `browser.${recording.id}.focus-regions`, status: (metadata.focusRegions ?? []).length > 0 ? 'pass' : 'needs_review', details: `${(metadata.focusRegions ?? []).length} region(s)`});
    } catch (error) {
      checks.push({id: `browser.${recording.id}.assets`, status: 'fail', details: error.message});
    }
  }
  checks.push({id: 'visual.human-review', status: 'needs_review', details: rel(join(auditDir, 'report.html'))});
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope: 'visual',
    artifact: rel(candidate),
    artifactSha256,
    inputFingerprint,
    auditFingerprint,
    auditPolicyVersion: AUDIT_POLICY_VERSION,
    createdAt: new Date().toISOString(),
    verdict: machineFailed ? 'fail' : 'needs_review',
    promotable: false,
    checks,
    evidence: {report: rel(join(auditDir, 'report.html')), overview: rel(join(auditDir, 'overview/contact-16.jpg')), reviewSheets: rel(join(auditDir, 'review/sheets')), boundaries: rel(join(auditDir, 'boundaries')), keyframes: rel(join(auditDir, 'keyframes'))},
  };
  writeJson(verdictPath, verdict);
  console.log(`${machineFailed ? 'FAIL' : 'WAIT'}  audit visual: ${verdict.verdict}`);
  return verdict;
};

const auditFull = async (ctx, candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`)) => {
  existsSync(candidate) || fail(`Full candidate not found: ${rel(candidate)}`);
  const info = probe(candidate);
  const video = info.streams.find((stream) => stream.codec_type === 'video');
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(info.format.duration);
  const artifactSha256 = shaFile(candidate);
  const visualVerdictPath = join(ctx.build, 'audit/visual/verdict.json');
  existsSync(visualVerdictPath) || fail('Visual audit must run before full audit.');
  const visualVerdict = json(visualVerdictPath);
  const auditFingerprint = sha(JSON.stringify({
    policy: FULL_AUDIT_POLICY_VERSION,
    artifactSha256,
    visualAuditFingerprint: visualVerdict.auditFingerprint,
    tts: ctx.episode.scenes.map((scene) => ttsFingerprint(ctx, scene)),
  }));
  const auditDir = join(ctx.build, 'audit/full');
  const verdictPath = join(auditDir, 'verdict.json');
  if (existsSync(verdictPath)) {
    const previous = json(verdictPath);
    if (previous.auditFingerprint === auditFingerprint && previous.artifactSha256 === artifactSha256) {
      console.log(`HIT   audit full: ${previous.verdict}`);
      return previous;
    }
  }
  mkdirSync(auditDir, {recursive: true});
  const loudnessLog = join(auditDir, 'loudness.log');
  await run('ffmpeg', ['-hide_banner', '-nostats', '-i', candidate, '-map', '0:a:0', '-af', 'loudnorm=I=-16:TP=-2.2:LRA=7:print_format=json', '-f', 'null', '-'], {log: loudnessLog});
  const loudnessMatch = readFileSync(loudnessLog, 'utf8').match(/\{\s*"input_i"[\s\S]*?\}/);
  const loudness = loudnessMatch ? JSON.parse(loudnessMatch[0]) : null;
  const integrated = Number(loudness?.input_i);
  const truePeak = Number(loudness?.input_tp);
  let srtClean = true;
  let narrationAligned = true;
  for (const scene of ctx.episode.scenes) {
    const segment = scene.narration.segmentId;
    const staged = {
      raw: join(ctx.build, `candidate/audio/segments/${segment}.mp3`),
      srt: join(ctx.build, `candidate/audio/segments/${segment}.srt`),
      text: join(ctx.build, `candidate/audio/segments/${segment}.txt`),
      norm: join(ctx.build, `candidate/audio/segments/${segment}_norm.mp3`),
    };
    try {
      validateTtsArtifacts(ctx, scene, staged);
    } catch {
      narrationAligned = false;
    }
    if (!existsSync(staged.srt) || /<#|#>/.test(readFileSync(staged.srt, 'utf8'))) srtClean = false;
  }
  const visualMachineFailed = visualVerdict.checks.some((check) => check.status === 'fail');
  const checks = [
    {id: 'video.stream', status: video ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} ${video.r_frame_rate}` : 'missing'},
    {id: 'audio.stream', status: audio ? 'pass' : 'fail', details: audio ? `${audio.codec_name} ${audio.sample_rate}Hz ${audio.channels}ch` : 'missing'},
    {id: 'video.resolution', status: video?.width === WIDTH && video?.height === HEIGHT ? 'pass' : 'fail', details: `${video?.width ?? 0}x${video?.height ?? 0}`},
    {id: 'video.fps', status: video?.r_frame_rate === `${FPS}/1` ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    {id: 'duration.full', status: Math.abs(duration - ctx.episode.durationSeconds) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${ctx.episode.durationSeconds}s`},
    {id: 'audio.sample-rate', status: Number(audio?.sample_rate) === 48000 ? 'pass' : 'fail', details: audio?.sample_rate ?? 'missing'},
    {id: 'audio.loudness', status: Number.isFinite(integrated) && Math.abs(integrated - (-16)) <= 0.6 && Number.isFinite(truePeak) && truePeak <= -1.5 ? 'pass' : 'fail', details: `${integrated} LUFS, ${truePeak} dBTP`},
    {id: 'subtitle.pause-marker', status: srtClean ? 'pass' : 'fail', details: srtClean ? 'clean' : 'pause marker found'},
    {id: 'narration.scene-windows', status: narrationAligned ? 'pass' : 'fail', details: narrationAligned ? `${ctx.episode.scenes.length}/${ctx.episode.scenes.length}` : 'one or more narration segments do not match their scene'},
    {id: 'visual.encoded-audit', status: visualMachineFailed ? 'fail' : 'pass', details: rel(visualVerdictPath)},
    {id: 'full.human-review', status: 'needs_review', details: 'Listen for pronunciation, pacing, caption meaning, and browser click clarity.'},
  ];
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope: 'full-hd',
    artifact: rel(candidate),
    artifactSha256,
    inputFingerprint: existsSync(join(ctx.build, 'full-artifact-manifest.json')) ? json(join(ctx.build, 'full-artifact-manifest.json')).inputFingerprint : artifactSha256,
    auditFingerprint,
    auditPolicyVersion: FULL_AUDIT_POLICY_VERSION,
    createdAt: new Date().toISOString(),
    verdict: machineFailed ? 'fail' : 'needs_review',
    promotable: false,
    checks,
    evidence: {
      visualReport: visualVerdict.evidence.report,
      visualOverview: visualVerdict.evidence.overview,
      loudness: rel(loudnessLog),
      audioSegments: rel(join(ctx.build, 'candidate/audio/segments')),
    },
  };
  writeJson(verdictPath, verdict);
  console.log(`${machineFailed ? 'FAIL' : 'WAIT'}  audit full: ${verdict.verdict}`);
  return verdict;
};

const approveVisual = (ctx) => {
  const path = join(ctx.build, 'audit/visual/verdict.json');
  existsSync(path) || fail('Run github-course audit before approve-visual.');
  const verdict = json(path);
  const candidate = join(ROOT, verdict.artifact);
  existsSync(candidate) && shaFile(candidate) === verdict.artifactSha256 || fail('Visual candidate SHA no longer matches audit.');
  FLAGS.get('note') || fail('approve-visual requires --note=...');
  verdict.verdict = 'pass';
  verdict.promotable = false;
  verdict.approvedAt = new Date().toISOString();
  verdict.approvalNote = FLAGS.get('note');
  writeJson(path, verdict);
  console.log('PASS  approve-visual (full promotion remains blocked until audio is connected)');
};

const build = async (ctx) => {
  const initial = plan(ctx);
  const dirtyBrowser = initial.browser.filter((task) => !task.hit);
  if (dirtyBrowser.length > 0) {
    if (FLAGS.has('with-browser')) await recordBrowserAssets(ctx);
    else fail(`Browser assets are dirty: ${dirtyBrowser.map((task) => task.recording.id).join(', ')}. Run pnpm github-course browser ${ctx.episode.episodeId} or pass --with-browser.`);
  }
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  const [renderResult, audioResult] = await Promise.allSettled([
    renderScenes(ctx, buildPlan.scenes.filter((task) => !task.hit)),
    buildAudio(ctx, buildPlan),
  ]);
  writeJson(ctx.statePath, ctx.state);
  const failures = [renderResult, audioResult].filter((result) => result.status === 'rejected');
  if (failures.length > 0) fail(`Independent tasks finished with ${failures.length} failure(s):\n${failures.map((result) => result.reason?.message ?? String(result.reason)).join('\n')}`);
  const refreshed = plan(ctx);
  const assembled = await assembleVisual(ctx, refreshed);
  await auditVisual(ctx, assembled.candidate);
  const full = await assembleFull(ctx, assembled, audioResult.value);
  await auditFull(ctx, full.candidate);
};

const status = (ctx) => {
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  const candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}_visual.mp4`);
  const verdict = join(ctx.build, 'audit/visual/verdict.json');
  const fullCandidate = join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`);
  const fullVerdict = join(ctx.build, 'audit/full/verdict.json');
  console.log(`visual  candidate: ${existsSync(candidate) ? rel(candidate) : 'missing'}`);
  console.log(`visual  verdict:   ${existsSync(verdict) ? json(verdict).verdict : 'missing'}`);
  console.log(`full    candidate: ${existsSync(fullCandidate) ? rel(fullCandidate) : 'missing'}`);
  console.log(`full    verdict:   ${existsSync(fullVerdict) ? json(fullVerdict).verdict : 'missing'}`);
  console.log('current/release:   blocked (1080p candidates are not promotable; 4K gate is not open)');
};

const main = async () => {
  if (COMMAND === 'validate') {
    validateAll({checkAssets: FLAGS.has('assets')});
    return;
  }
  const ctx = loadContext();
  if (COMMAND === 'plan') printPlan(ctx, plan(ctx));
  else if (COMMAND === 'fingerprints') {
    const buildPlan = plan(ctx);
    console.log(JSON.stringify({episodeId: ctx.episode.episodeId, visualBaseHash: buildPlan.baseHash, browser: Object.fromEntries(buildPlan.browser.map((task) => [task.recording.id, task.fingerprint])), scenes: Object.fromEntries(buildPlan.scenes.map((task) => [task.scene.id, task.fingerprint]))}, null, 2));
  } else if (COMMAND === 'status') status(ctx);
  else if (COMMAND === 'browser') await recordBrowserAssets(ctx);
  else if (COMMAND === 'build') await build(ctx);
  else if (COMMAND === 'audit') await auditVisual(ctx);
  else if (COMMAND === 'audit-full') await auditFull(ctx);
  else if (COMMAND === 'approve-visual') approveVisual(ctx);
  else if (['approve', 'promote', 'release-build', 'release-audit', 'release-approve', 'publish'].includes(COMMAND)) fail(`${COMMAND} is blocked until the GitHub Course 4K adapter and release gate are implemented.`);
  else fail(`Unknown command: ${COMMAND}`);
};

main().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exitCode = 1;
});
