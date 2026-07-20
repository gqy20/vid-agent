#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {execFile, execFileSync, spawnSync} from 'node:child_process';
import {isUtf8} from 'node:buffer';
import {cpus} from 'node:os';
import {
  closeSync,
  copyFileSync,
  existsSync,
  linkSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import ts from 'typescript';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REMOTION = join(ROOT, 'remotion');
const EPISODES = join(ROOT, 'git-course/episodes');
const FPS = 30;
const RENDER_PROFILES = {
  hd30: {name: 'hd30', scale: 1, width: 1920, height: 1080, fps: 30},
  uhd30: {name: 'uhd30', scale: 2, width: 3840, height: 2160, fps: 30},
};
const COMMAND = process.argv[2] ?? 'status';
const EPISODE_ID = process.argv[3];
const FLAGS = new Map(process.argv.slice(4).filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, value = '1'] = arg.slice(2).split('=', 2);
  return [key, value];
}));

const fail = (message) => {
  throw new Error(message);
};

const flagEnabled = (name) => {
  const value = FLAGS.get(name);
  if (value === undefined) return false;
  if (['1', 'true', 'yes'].includes(value.toLowerCase())) return true;
  if (['0', 'false', 'no'].includes(value.toLowerCase())) return false;
  return fail(`Invalid boolean --${name}=${value}; use true/false or 1/0.`);
};

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

const copyAtomically = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  const partial = `${target}.partial`;
  rmSync(partial, {force: true});
  copyFileSync(source, partial);
  renameSync(partial, target);
};

const materializeView = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  const partial = `${target}.partial`;
  rmSync(partial, {force: true});
  if (existsSync(target)) {
    const sourceStat = statSync(source);
    const targetStat = statSync(target);
    if (sourceStat.dev === targetStat.dev && sourceStat.ino === targetStat.ino) return 'hardlink';
  }
  let mode = 'hardlink';
  try {
    linkSync(source, partial);
  } catch {
    copyFileSync(source, partial);
    mode = 'copy';
  }
  renameSync(partial, target);
  return mode;
};

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

const pathBytes = (path) => {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.size;
  return walkFiles(path).reduce((sum, file) => sum + statSync(file).size, 0);
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GiB`;
};

const removeTargets = (targets, {apply = false, label = 'clean'} = {}) => {
  const existing = [...new Set(targets)].filter((path) => existsSync(path)).sort();
  const bytes = existing.reduce((sum, path) => sum + pathBytes(path), 0);
  const visible = flagEnabled('verbose') ? existing : existing.slice(0, 20);
  for (const path of visible) console.log(`${apply ? 'DELETE' : 'WOULD DELETE'} ${rel(path)} (${formatBytes(pathBytes(path))})`);
  if (visible.length < existing.length) console.log(`... ${existing.length - visible.length} more target(s); use --verbose to list all`);
  if (apply) for (const path of existing) rmSync(path, {recursive: true, force: true});
  console.log(`${apply ? 'PASS' : 'DRY'}  ${label}: ${existing.length} target(s), ${formatBytes(bytes)}`);
  return {count: existing.length, bytes};
};

const pruneEmptyDirectories = (root) => {
  if (!existsSync(root)) return;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) if (entry.isDirectory()) visit(join(dir, entry.name));
    if (dir !== root && readdirSync(dir).length === 0) rmSync(dir, {recursive: true, force: true});
  };
  visit(root);
};

const hashFiles = (files) => {
  const hash = createHash('sha256');
  for (const path of files) {
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

const loadContext = () => {
  EPISODE_ID || fail('Usage: pnpm git-course <command> <episode-id>');
  /^ep\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(EPISODE_ID) || fail(`Invalid episode id: ${EPISODE_ID}`);
  const episodePath = join(EPISODES, `${EPISODE_ID}.json`);
  existsSync(episodePath) || fail(`Unknown episode: ${EPISODE_ID}`);
  const episode = json(episodePath);
  episode.episodeId === EPISODE_ID || fail(`${rel(episodePath)}: episodeId must be ${EPISODE_ID}`);
  const base = join(REMOTION, 'renders/git-course', EPISODE_ID);
  const tmp = join(base, 'tmp');
  const build = join(tmp, 'build');
  const cache = join(tmp, 'cache');
  const current = join(base, 'current');
  const statePath = join(build, 'state.json');
  const state = existsSync(statePath) ? json(statePath) : {schemaVersion: 1, scenes: {}, tts: {}};
  state.scenes ??= {};
  state.tts ??= {};
  return {episode, episodePath, base, tmp, build, cache, current, statePath, state};
};

const activityPath = (ctx) => join(ctx.build, 'activity.json');
const processIsAlive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const acquireActivity = (ctx, command) => {
  const path = activityPath(ctx);
  mkdirSync(dirname(path), {recursive: true});
  const payload = {schemaVersion: 1, episodeId: ctx.episode.episodeId, command, pid: process.pid, startedAt: new Date().toISOString()};
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const fd = openSync(path, 'wx');
      try {
        writeFileSync(fd, `${JSON.stringify(payload, null, 2)}\n`);
      } finally {
        closeSync(fd);
      }
      return;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      let activity = null;
      try {
        activity = json(path);
      } catch {
        const ageMs = Date.now() - statSync(path).mtimeMs;
        if (ageMs < 30000) fail(`Episode lock is initializing: ${rel(path)}`);
      }
      if (activity && processIsAlive(activity.pid)) fail(`Episode is busy: ${activity.command} (pid ${activity.pid})`);
      rmSync(path, {force: true});
      console.log(`CLEAN stale activity marker: ${rel(path)}`);
    }
  }
  fail(`Could not acquire episode lock: ${rel(path)}`);
};
const withActivity = async (ctx, command, action) => {
  const path = activityPath(ctx);
  acquireActivity(ctx, command);
  try {
    return await action();
  } finally {
    if (existsSync(path) && json(path).pid === process.pid) rmSync(path, {force: true});
  }
};

const getComposition = (episode) => {
  const names = {
    'ep01-what-git-stores': 'GitCourseEp01WhatGitStores',
    'ep02-working-tree-index-repo': 'GitCourseEp02WorkingTreeIndexRepo',
    'ep03-commit-snapshot': 'GitCourseEp03CommitSnapshot',
    'ep04-branch-is-pointer': 'GitCourseEp04BranchIsPointer',
    'ep05-head': 'GitCourseEp05Head',
    'ep06-merge': 'GitCourseEp06Merge',
    'ep07-rebase': 'GitCourseEp07Rebase',
    'ep08-reset-revert-restore': 'GitCourseEp08ResetRevertRestore',
  };
  return names[episode.episodeId] ?? fail(`No composition mapping for ${episode.episodeId}`);
};

const episodeSourceName = (episodeId) => ({
  'ep01-what-git-stores': 'Ep01WhatGitStores.tsx',
  'ep02-working-tree-index-repo': 'Ep02WorkingTreeIndexRepo.tsx',
  'ep03-commit-snapshot': 'Ep03CommitSnapshot.tsx',
  'ep04-branch-is-pointer': 'Ep04BranchIsPointer.tsx',
  'ep05-head': 'Ep05Head.tsx',
  'ep06-merge': 'Ep06Merge.tsx',
  'ep07-rebase': 'Ep07Rebase.tsx',
  'ep08-reset-revert-restore': 'Ep08ResetRevertRestore.tsx',
}[episodeId] ?? fail(`No episode source mapping for ${episodeId}`));

const episodeSourceParts = (ctx) => {
  if (ctx.episodeSourceParts) return ctx.episodeSourceParts;
  const path = join(REMOTION, 'src/videos/git-course/episodes', episodeSourceName(ctx.episode.episodeId));
  const source = readFileSync(path, 'utf8');
  const blocks = new Map();
  let shared = source;
  for (const scene of ctx.episode.scenes) {
    const startMarker = `// @git-course-scene ${scene.id}:start`;
    const endMarker = `// @git-course-scene ${scene.id}:end`;
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start === -1 && end === -1) continue;
    start !== -1 && end > start || fail(`${scene.id}: incomplete scene fingerprint markers in ${path}`);
    const blockEnd = end + endMarker.length;
    blocks.set(scene.id, source.slice(start, blockEnd));
    shared = shared.replace(source.slice(start, blockEnd), `// scene:${scene.id}`);
  }
  if (blocks.size > 0 && blocks.size !== ctx.episode.scenes.length) fail(`${path}: every scene must have fingerprint markers.`);
  if (blocks.size === 0) {
    const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const statements = new Map();
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) statements.set(declaration.name.text, statement);
      }
    }
    const ranges = [];
    for (const scene of ctx.episode.scenes) {
      const pascal = scene.id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
      const candidates = [`${pascal}Scene`, `Ep01${pascal}Scene`];
      const statement = candidates.map((name) => statements.get(name)).find(Boolean);
      statement || fail(`${scene.id}: no scene component found in ${path}; expected ${candidates.join(' or ')}`);
      const start = statement.getStart(sourceFile);
      const end = statement.getEnd();
      blocks.set(scene.id, source.slice(start, end));
      ranges.push({sceneId: scene.id, start, end});
    }
    for (const range of ranges.sort((a, b) => b.start - a.start)) {
      shared = `${shared.slice(0, range.start)}// scene:${range.sceneId}${shared.slice(range.end)}`;
    }
  }
  ctx.episodeSourceParts = {path, source, shared, blocks};
  return ctx.episodeSourceParts;
};

const visualBaseHash = (ctx) => {
  const courseRoot = join(REMOTION, 'src/videos/git-course');
  const episodeNumber = ctx.episode.episodeId.slice(0, 4);
  const sharedSources = walkFiles(courseRoot, (path) => {
    if (!/\.(?:ts|tsx)$/.test(path)) return false;
    if (path.includes('/episodes/')) return false;
    if (path.includes('/kit/manim/')) return false;
    // This file contains every episode and would invalidate unrelated caches.
    if (path.endsWith('/data/episodeTimelines.generated.ts')) return false;
    return true;
  });
  const episodeSource = episodeSourceParts(ctx);
  const terminalAssets = walkFiles(join(REMOTION, 'public/git-course-lab/terminal'), (path) => path.includes(`/${episodeNumber}-`));
  const terminalSources = [
    ...walkFiles(join(ROOT, 'scripts/terminal-recordings/git-course-lab/demos'), (path) => path.includes(`/${episodeNumber}-`) || path.endsWith('/_lib.sh')),
    ...walkFiles(join(ROOT, 'scripts/terminal-recordings/git-course-lab/fixtures'), (path) => path.includes(`/${episodeNumber}-`)),
    join(ROOT, 'scripts/terminal-recordings/record-asciinema.sh'),
    join(ROOT, 'scripts/terminal-recordings/build-metadata.mjs'),
  ].filter((path) => existsSync(path));
  const fileHash = hashFiles([...sharedSources, join(REMOTION, 'src/fonts.css'), ...terminalAssets, ...terminalSources, ...(episodeSource.blocks.size === 0 ? [episodeSource.path] : [])]);
  return sha(JSON.stringify({schema: 3, fileHash, sharedEpisodeSource: episodeSource.blocks.size > 0 ? episodeSource.shared : null}));
};

const sceneFingerprint = (ctx, scene, baseHash) => {
  const {narration: _narration, ...visualScene} = scene;
  const sourceBlock = episodeSourceParts(ctx).blocks.get(scene.id) ?? null;
  return sha(JSON.stringify({schema: 2, baseHash, sourceBlock, durationSeconds: ctx.episode.durationSeconds, scene: visualScene, fps: FPS, width: 1920, height: 1080}));
};

const ttsConfig = () => ({
  model: process.env.TTS_MODEL ?? 'speech-2.8-hd',
  voice: process.env.TTS_VOICE ?? 'Chinese (Mandarin)_Gentleman',
  language: process.env.TTS_LANGUAGE ?? 'zh',
  speed: process.env.TTS_SPEED ?? '1.25',
  normalization: 'acompressor-v1+loudnorm-I-20-TP-3-LRA7',
});

const speechFingerprint = (scene) => sha(JSON.stringify({
  schema: 2,
  text: scene.narration.text,
  config: (() => {
    const {normalization: _normalization, ...speechConfig} = ttsConfig();
    return speechConfig;
  })(),
  engine: process.env.TTS_ENGINE_VERSION ?? 'mmx-cli-v1',
}));
const normalizedFingerprint = (scene) => sha(JSON.stringify({
  schema: 3,
  speechFingerprint: speechFingerprint(scene),
  normalization: ttsConfig().normalization,
  subtitleAlignment: 'narration-pauses-v1',
}));
const ttsCachePaths = (ctx, scene) => {
  const speech = speechFingerprint(scene);
  const normalized = normalizedFingerprint(scene);
  const speechDir = join(ctx.cache, 'tts/speech', speech);
  const normalizedDir = join(ctx.cache, 'tts/normalized', normalized);
  return {
    speech,
    normalized,
    speechDir,
    normalizedDir,
    raw: join(speechDir, 'raw.mp3'),
    srt: join(speechDir, 'subtitles.srt'),
    text: join(speechDir, 'source.txt'),
    speechMetadata: join(speechDir, 'metadata.json'),
    norm: join(normalizedDir, 'normalized.mp3'),
    metadata: join(normalizedDir, 'metadata.json'),
  };
};

const bgmPath = (ctx) => {
  const configured = process.env.BGM_FILE ? resolve(REMOTION, process.env.BGM_FILE) : null;
  const candidates = [configured, join(ctx.current, 'audio/bgm.mp3'), join(ctx.current, 'audio/bgm_180.mp3')].filter(Boolean);
  return candidates.find((path) => existsSync(path)) ?? null;
};

const audioFingerprint = (ctx, buildPlan) => {
  const bgm = bgmPath(ctx);
  return sha(JSON.stringify({
    schema: 2,
    durationSeconds: ctx.episode.durationSeconds,
    tts: buildPlan.tts.map((task) => ({
      segmentId: task.scene.narration.segmentId,
      fingerprint: task.fingerprint,
      voiceStart: task.scene.narration.voiceStart,
      sceneEnd: task.scene.start + task.scene.duration,
    })),
    bgm: bgm ? {path: rel(bgm), sha256: shaFile(bgm)} : null,
    volume: process.env.BGM_VOLUME ?? '0.05',
    mastering: {
      integratedLufs: process.env.MASTER_LUFS ?? '-16',
      truePeakDbtp: process.env.MASTER_TRUE_PEAK ?? '-2.2',
      finalTruePeakCeilingDbtp: process.env.FINAL_TRUE_PEAK_CEILING ?? '-1.5',
      loudnessRange: process.env.MASTER_LRA ?? '7',
      mixNormalization: 'amix-normalize-off+two-pass-loudnorm-v1',
      scriptSha256: shaFile(join(REMOTION, 'scripts/git-course-build-voiceover.sh')),
    },
  }));
};

const plan = (ctx) => {
  const baseHash = visualBaseHash(ctx);
  const forcedScenes = new Set((FLAGS.get('force-scenes') ?? '').split(',').filter(Boolean));
  const scenes = ctx.episode.scenes.map((scene, index) => {
    const fingerprint = sceneFingerprint(ctx, scene, baseHash);
    let cached = ctx.state.scenes?.[scene.id];
    let hit = cached?.fingerprint === fingerprint && existsSync(join(ROOT, cached.path ?? ''));
    if (!hit) {
      const cacheDir = join(ctx.cache, 'scenes');
      const recovered = existsSync(cacheDir) ? readdirSync(cacheDir).find((name) => name.endsWith(`_${fingerprint.slice(0, 12)}.mp4`)) : null;
      if (recovered) {
        const path = join(cacheDir, recovered);
        cached = {fingerprint, path: rel(path), sha256: shaFile(path), recoveredAt: new Date().toISOString()};
        ctx.state.scenes[scene.id] = cached;
        hit = true;
      }
    }
    if (forcedScenes.has(scene.id)) hit = false;
    return {scene, index, fingerprint, hit, cached};
  });
  const tts = ctx.episode.scenes.map((scene) => {
    const fingerprint = normalizedFingerprint(scene);
    const cached = ctx.state.tts?.[scene.narration.segmentId];
    const norm = join(ctx.current, 'audio/segments', `${scene.narration.segmentId}_norm.mp3`);
    const cas = ttsCachePaths(ctx, scene);
    const currentHit = cached?.fingerprint === fingerprint && existsSync(norm) && cached.sha256 === shaFile(norm);
    const speechMetadata = existsSync(cas.speechMetadata) ? json(cas.speechMetadata) : null;
    const normalizedMetadata = existsSync(cas.metadata) ? json(cas.metadata) : null;
    const casHit =
      existsSync(cas.norm) && existsSync(cas.raw) && existsSync(cas.srt) &&
      speechMetadata?.speechFingerprint === cas.speech &&
      speechMetadata.rawSha256 === shaFile(cas.raw) &&
      speechMetadata.srtSha256 === shaFile(cas.srt) &&
      normalizedMetadata?.normalizedFingerprint === cas.normalized &&
      normalizedMetadata.sha256 === shaFile(cas.norm);
    return {scene, fingerprint, speechFingerprint: cas.speech, hit: currentHit || casHit, cas};
  });
  return {baseHash, scenes, tts};
};

const printPlan = (ctx, buildPlan) => {
  console.log(`Git Course · ${ctx.episode.episodeId}`);
  for (const task of buildPlan.scenes) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} render ${task.scene.id}`);
  for (const task of buildPlan.tts) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} tts    ${task.scene.narration.segmentId}`);
};

const printFingerprints = (ctx, buildPlan) => {
  console.log(JSON.stringify({
    episodeId: ctx.episode.episodeId,
    visualBaseHash: buildPlan.baseHash,
    scenes: Object.fromEntries(buildPlan.scenes.map((task) => [task.scene.id, task.fingerprint])),
    tts: Object.fromEntries(buildPlan.tts.map((task) => [task.scene.narration.segmentId, task.fingerprint])),
  }, null, 2));
};

const renderScenes = async (ctx, tasks, options = {}) => {
  if (tasks.length === 0) return [];
  const renderProfile = options.renderProfile ?? RENDER_PROFILES.hd30;
  const stateKey = options.stateKey ?? 'scenes';
  const cacheSubdir = options.cacheSubdir ?? 'scenes';
  const taskPrefix = options.taskPrefix ?? 'render';
  const planName = options.planName ?? 'render-plan.json';
  const compositionId = options.compositionId ?? getComposition(ctx.episode);
  ctx.state[stateKey] ??= {};
  const logicalCpus = cpus().length;
  const profilePath = join(REMOTION, `renders/git-course/tmp/render-profile-${renderProfile.name}.json`);
  const defaultConcurrency = renderProfile.scale > 1 ? 4 : 16;
  const profile = existsSync(profilePath) ? json(profilePath) : {maxStableConcurrencyPerBrowser: defaultConcurrency};
  const requestedConcurrency = Number(FLAGS.get('render-concurrency') ?? Math.max(1, Math.floor(logicalCpus / tasks.length)));
  const concurrency = FLAGS.has('render-concurrency') ? requestedConcurrency : Math.min(requestedConcurrency, profile.maxStableConcurrencyPerBrowser ?? defaultConcurrency);
  const bundleFingerprint = hashFiles([
    ...walkFiles(join(REMOTION, 'src'), (path) => /\.(?:ts|tsx|css)$/.test(path)),
    join(REMOTION, 'package.json'),
    join(REMOTION, 'pnpm-lock.yaml'),
    join(REMOTION, 'remotion.config.ts'),
    ...walkFiles(join(REMOTION, 'public/git-course')),
  ]);
  const bundleDir = join(REMOTION, 'renders/git-course/tmp/bundles', bundleFingerprint);
  const planPath = join(ctx.build, planName);
  const cacheDir = options.cacheDir ?? join(ctx.cache, cacheSubdir);
  mkdirSync(cacheDir, {recursive: true});
  const planned = tasks.map((task) => {
    const scene = task.scene;
    const index = task.index + 1;
    const start = scene.start * FPS;
    const end = (scene.start + scene.duration) * FPS - 1;
    const taskDir = join(ctx.build, 'tasks', `${taskPrefix}-${scene.id}`);
    const output = join(taskDir, 'segments', `${String(index).padStart(3, '0')}_${String(start).padStart(6, '0')}-${String(end).padStart(6, '0')}.mp4`);
    const cachePath = join(cacheDir, `${String(index).padStart(2, '0')}_${scene.id.replaceAll('-', '_')}_${task.fingerprint.slice(0, 12)}.mp4`);
    const completionPath = join(taskDir, 'render-completion.json');
    rmSync(taskDir, {recursive: true, force: true});
    mkdirSync(dirname(output), {recursive: true});
    return {task, scene, index, start, end, taskDir, output, cachePath, completionPath, concurrency};
  });
  writeJson(planPath, {
    schemaVersion: 1,
    entryPoint: join(REMOTION, 'src/index.ts'),
    compositionId,
    logicalCpus,
    requestedConcurrency,
    profilePath,
    bundleDir,
    bundleFingerprint,
    timeoutInMilliseconds: 120000,
    telemetryPath: join(ctx.build, `telemetry/${taskPrefix}-scenes.json`),
    tasks: planned.map(({scene, start, end, output, cachePath, completionPath, concurrency: taskConcurrency}) => ({sceneId: scene.id, start, end, output, cacheOutput: cachePath, completionPath, scale: renderProfile.scale, concurrency: taskConcurrency, fallbackConcurrency: profile.maxStableConcurrencyPerBrowser ?? defaultConcurrency})),
  });
  let renderError = null;
  try {
    await run('node', [join(REMOTION, 'scripts/git-course-render-scenes.mjs'), planPath], {
      log: join(ctx.build, 'logs/render-scenes.log'),
    });
  } catch (error) {
    renderError = error;
  }
  const completed = planned.filter(({cachePath, completionPath}) => existsSync(cachePath) && existsSync(completionPath));
  const auditSegments = options.auditSegments ?? renderProfile.scale === 1;
  if (auditSegments) {
    await Promise.all(completed.map(async ({taskDir}) => {
      await run(join(REMOTION, 'scripts/audit-range-segments.sh'), [taskDir, join(taskDir, 'segment-audits'), 'all']);
    }));
  }
  const results = completed.map(({task, scene, taskDir, cachePath, completionPath, end, start}) => {
    const frames = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', cachePath], {encoding: 'utf8'}).trim());
    frames === end - start + 1 || fail(`${scene.id}: expected ${end - start + 1} frames, found ${frames}`);
    const completion = json(completionPath);
    ctx.state[stateKey][scene.id] = {fingerprint: task.fingerprint, profile: renderProfile.name, path: rel(cachePath), sha256: shaFile(cachePath), render: completion, updatedAt: new Date().toISOString()};
    rmSync(join(taskDir, 'segments'), {recursive: true, force: true});
    console.log(`PASS  render ${scene.id}`);
    return cachePath;
  });
  if (renderError) throw renderError;
  return results;
};

const buildAudio = async (ctx, buildPlan) => {
  const audioDir = join(ctx.build, 'candidate/audio');
  const segmentsDir = join(audioDir, 'segments');
  const legacySegmentsDir = join(ctx.current, 'audio/segments');
  mkdirSync(segmentsDir, {recursive: true});
  for (const task of buildPlan.tts) {
    const segment = task.scene.narration.segmentId;
    const targets = {
      raw: join(segmentsDir, `${segment}.mp3`),
      srt: join(segmentsDir, `${segment}.srt`),
      text: join(segmentsDir, `${segment}.txt`),
      norm: join(segmentsDir, `${segment}_norm.mp3`),
    };
    const legacy = {
      raw: join(legacySegmentsDir, `${segment}.mp3`),
      srt: join(legacySegmentsDir, `${segment}.srt`),
      text: join(legacySegmentsDir, `${segment}.txt`),
      norm: join(legacySegmentsDir, `${segment}_norm.mp3`),
    };
    const legacyComplete = Object.values(legacy).every((path) => existsSync(path))
      && readFileSync(legacy.text, 'utf8').trim() === task.scene.narration.text.trim();
    const previous = ctx.state.tts[segment];
    const trustedLegacy = legacyComplete
      && previous?.fingerprint === task.fingerprint
      && previous.sha256 === shaFile(legacy.norm);
    if (trustedLegacy && ![task.cas.raw, task.cas.srt, task.cas.text, task.cas.norm].every((path) => existsSync(path))) {
      for (const key of ['raw', 'srt', 'text', 'norm']) copyAtomically(legacy[key], targets[key]);
      validateTtsTextArtifacts(task, targets.srt, targets.text, targets.norm);
      mkdirSync(task.cas.speechDir, {recursive: true});
      mkdirSync(task.cas.normalizedDir, {recursive: true});
      for (const key of ['raw', 'srt', 'text', 'norm']) copyAtomically(targets[key], task.cas[key]);
      writeJson(task.cas.speechMetadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, rawSha256: shaFile(task.cas.raw), srtSha256: shaFile(task.cas.srt), migrated: true});
      writeJson(task.cas.metadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, normalizedFingerprint: task.cas.normalized, sha256: shaFile(task.cas.norm), migrated: true});
    }
    if (existsSync(task.cas.raw)) materializeView(task.cas.raw, targets.raw);
    if (existsSync(task.cas.srt)) copyAtomically(task.cas.srt, targets.srt);
    if (existsSync(task.cas.text)) copyAtomically(task.cas.text, targets.text);
    if (existsSync(task.cas.norm)) materializeView(task.cas.norm, targets.norm);
    if ([task.cas.raw, task.cas.srt, task.cas.text, task.cas.norm].every((path) => existsSync(path))) {
      ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(task.cas.norm), sha256: shaFile(task.cas.norm), updatedAt: new Date().toISOString()};
    }
  }
  const dirty = buildPlan.tts.filter((task) => {
    const segment = task.scene.narration.segmentId;
    const norm = join(segmentsDir, `${segment}_norm.mp3`);
    return !existsSync(norm) || ctx.state.tts[segment]?.fingerprint !== task.fingerprint || ctx.state.tts[segment]?.sha256 !== shaFile(norm);
  });
  const normalizeIds = dirty.map((task) => task.scene.narration.segmentId);
  const synthesizeIds = dirty.filter((task) => !existsSync(task.cas.raw) || !existsSync(task.cas.srt)).map((task) => task.scene.narration.segmentId);
  const mainCandidate = join(ctx.build, 'candidate', `${ctx.episode.episodeId}.mp4`);
  const mix = join(audioDir, 'mix.m4a');
  const fingerprint = audioFingerprint(ctx, buildPlan);
  if (
    dirty.length === 0 &&
    ctx.state.audioFingerprint === fingerprint &&
    existsSync(mix) &&
    ctx.state.audioMixSha256 === shaFile(mix)
  ) {
    console.log('HIT   audio mix');
    return {mix, mainCandidate};
  }
  for (const task of dirty) {
    const segment = task.scene.narration.segmentId;
    rmSync(join(segmentsDir, `${segment}_norm.mp3`), {force: true});
    if (synthesizeIds.includes(segment)) {
      for (const suffix of ['.mp3', '.srt', '.txt']) rmSync(join(segmentsDir, `${segment}${suffix}`), {force: true});
    }
  }
  const bgm = bgmPath(ctx);
  bgm || fail('Audio build requires the approved course BGM.');
  const env = {
    AUDIO_DIR: audioDir,
    TMP_DIR: join(ctx.build, 'tasks/audio'),
    BGM_FILE: bgm,
    TTS_SEGMENTS: synthesizeIds.join(','),
    NORMALIZE_SEGMENTS: normalizeIds.join(','),
    TTS_JOBS: 'all',
    NORMALIZE_JOBS: 'all',
    SKIP_TTS: synthesizeIds.length === 0 ? '1' : '0',
    SKIP_NORM: normalizeIds.length === 0 ? '1' : '0',
    SKIP_REMUX: '1',
  };
  await run(join(REMOTION, 'scripts/git-course-build-voiceover.sh'), [ctx.episode.episodeId], {env, log: join(ctx.build, 'logs/audio.log')});
  for (const task of buildPlan.tts) {
    const segment = task.scene.narration.segmentId;
    const norm = join(segmentsDir, `${segment}_norm.mp3`);
    existsSync(norm) || fail(`Missing normalized segment: ${norm}`);
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', norm], {encoding: 'utf8'}).trim());
    validateNarrationDuration(task, duration);
    const raw = join(segmentsDir, `${segment}.mp3`);
    const srt = join(segmentsDir, `${segment}.srt`);
    const textPath = join(segmentsDir, `${segment}.txt`);
    for (const path of [raw, srt, textPath]) existsSync(path) || fail(`Missing TTS cache input: ${path}`);
    validateTtsTextArtifacts(task, srt, textPath, norm);
    mkdirSync(task.cas.speechDir, {recursive: true});
    mkdirSync(task.cas.normalizedDir, {recursive: true});
    copyAtomically(raw, task.cas.raw);
    copyAtomically(srt, task.cas.srt);
    copyAtomically(textPath, task.cas.text);
    writeJson(task.cas.speechMetadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, rawSha256: shaFile(raw), srtSha256: shaFile(srt)});
    copyAtomically(norm, task.cas.norm);
    writeJson(task.cas.metadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, normalizedFingerprint: task.cas.normalized, sha256: shaFile(norm)});
    ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(task.cas.norm), sha256: shaFile(task.cas.norm), updatedAt: new Date().toISOString()};
  }
  ctx.state.audioFingerprint = fingerprint;
  ctx.state.audioMixSha256 = shaFile(mix);
  ctx.state.audioMixPath = rel(mix);
  return {mix, mainCandidate};
};

const recoverValidTtsState = (ctx, buildPlan) => {
  for (const task of buildPlan.tts) {
    const scene = task.scene;
    const segment = scene.narration.segmentId;
    const norm = task.cas.norm;
    if (!existsSync(norm)) continue;
    const cached = ctx.state.tts[segment];
    // Never label an old take with a new text/config fingerprint after a failed build.
    if (cached?.fingerprint !== task.fingerprint || cached.sha256 !== shaFile(norm)) continue;
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', norm], {encoding: 'utf8'}).trim());
    if (scene.narration.voiceStart + duration > scene.start + scene.duration) continue;
    ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(norm), sha256: shaFile(norm), durationSeconds: duration, updatedAt: new Date().toISOString()};
  }
};

const assembleMain = async (ctx, buildPlan, audio) => {
  const candidateDir = join(ctx.build, 'candidate');
  mkdirSync(candidateDir, {recursive: true});
  const manifest = join(candidateDir, 'scenes.ffconcat');
  const ordered = buildPlan.scenes.map((task) => {
    const state = ctx.state.scenes[task.scene.id] ?? fail(`No scene cache state: ${task.scene.id}`);
    const path = join(ROOT, state.path);
    existsSync(path) || fail(`Missing scene cache: ${path}`);
    return {sceneId: task.scene.id, path, sha256: shaFile(path)};
  });
  const candidate = join(candidateDir, `${ctx.episode.episodeId}.mp4`);
  const audioFiles = walkFiles(join(candidateDir, 'audio'), (path) => !path.endsWith('.partial')).map((path) => ({path: rel(path), sha256: shaFile(path)}));
  const inputFingerprint = sha(JSON.stringify({scenes: ordered.map((item) => item.sha256), mix: shaFile(audio.mix)}));
  const artifactPath = join(ctx.build, 'artifact-manifest.json');
  if (existsSync(candidate) && existsSync(artifactPath)) {
    const cached = json(artifactPath);
    if (cached.inputFingerprint === inputFingerprint && cached.sha256 === shaFile(candidate)) {
      const candidateAudio = {path: rel(audio.mix), sha256: shaFile(audio.mix)};
      if (
        cached.audio?.path !== candidateAudio.path ||
        cached.audio?.sha256 !== candidateAudio.sha256 ||
        JSON.stringify(cached.audioFiles ?? []) !== JSON.stringify(audioFiles)
      ) {
        cached.schemaVersion = 2;
        cached.audio = candidateAudio;
        cached.audioFiles = audioFiles;
        writeJson(artifactPath, cached);
      }
      console.log(`HIT   assemble ${rel(candidate)}`);
      return {candidate, artifact: cached};
    }
  }
  writeFileSync(manifest, ordered.map((item) => `file '${item.path.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  await run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', manifest, '-i', audio.mix, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-f', 'mp4', `${candidate}.partial`], {log: join(ctx.build, 'logs/assemble-main.log')});
  renameSync(`${candidate}.partial`, candidate);
  const artifact = {
    schemaVersion: 2,
    episodeId: ctx.episode.episodeId,
    createdAt: new Date().toISOString(),
    path: rel(candidate),
    sha256: shaFile(candidate),
    inputFingerprint,
    scenes: ordered.map((item) => ({sceneId: item.sceneId, path: rel(item.path), sha256: item.sha256})),
    audio: {path: rel(audio.mix), sha256: shaFile(audio.mix)},
    audioFiles,
  };
  writeJson(artifactPath, artifact);
  console.log(`PASS  assemble ${rel(candidate)}`);
  return {candidate, artifact};
};

const materializeReviewScenes = async (ctx, candidate) => {
  const candidateDir = join(ctx.build, 'candidate');
  const scenesDir = join(candidateDir, 'scenes');
  const nextScenesDir = join(candidateDir, 'scenes.next');
  const previousScenesDir = join(candidateDir, 'scenes.previous');
  const manifestPath = join(candidateDir, 'scenes-manifest.json');
  const candidateSha256 = shaFile(candidate);

  if (existsSync(manifestPath)) {
    const cached = json(manifestPath);
    const complete = cached.candidateSha256 === candidateSha256
      && cached.scenes?.length === ctx.episode.scenes.length
      && cached.scenes.every((scene) => {
        const path = join(ROOT, scene.path);
        return existsSync(path) && shaFile(path) === scene.sha256;
      });
    if (complete) {
      console.log(`HIT   review scenes ${rel(scenesDir)}`);
      return cached;
    }
  }

  rmSync(nextScenesDir, {recursive: true, force: true});
  mkdirSync(nextScenesDir, {recursive: true});
  const artifact = json(join(ctx.build, 'artifact-manifest.json'));
  const sourceScenes = new Map(artifact.scenes.map((scene) => [scene.sceneId, join(ROOT, scene.path)]));
  const scenes = await Promise.all(ctx.episode.scenes.map(async (scene, index) => {
    const safe = scene.id.replaceAll('-', '_');
    const name = `${String(index + 1).padStart(2, '0')}_${safe}.mp4`;
    const output = join(nextScenesDir, name);
    const sourceVideo = sourceScenes.get(scene.id) ?? fail(`Missing source scene in artifact manifest: ${scene.id}`);
    existsSync(sourceVideo) || fail(`Missing source scene: ${sourceVideo}`);
    await run('ffmpeg', [
      '-nostdin', '-y',
      '-i', sourceVideo,
      '-ss', String(scene.start),
      '-i', candidate,
      '-t', String(scene.duration),
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-movflags', '+faststart',
      output,
    ], {log: join(ctx.build, 'logs/review-scenes', `${String(index + 1).padStart(2, '0')}_${safe}.log`)});
    const durationSeconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', output], {encoding: 'utf8'}).trim());
    Math.abs(durationSeconds - scene.duration) <= 0.08 || fail(`${name}: review scene duration ${durationSeconds}s, expected ${scene.duration}s`);
    return {
      sceneId: scene.id,
      start: scene.start,
      duration: scene.duration,
      path: rel(join(scenesDir, name)),
      sha256: shaFile(output),
    };
  }));

  rmSync(previousScenesDir, {recursive: true, force: true});
  if (existsSync(scenesDir)) renameSync(scenesDir, previousScenesDir);
  try {
    renameSync(nextScenesDir, scenesDir);
  } catch (error) {
    if (!existsSync(scenesDir) && existsSync(previousScenesDir)) renameSync(previousScenesDir, scenesDir);
    throw error;
  }
  rmSync(previousScenesDir, {recursive: true, force: true});
  const manifest = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    candidate: rel(candidate),
    candidateSha256,
    createdAt: new Date().toISOString(),
    scenes,
  };
  writeJson(manifestPath, manifest);
  console.log(`PASS  review scenes ${rel(scenesDir)}`);
  return manifest;
};

const probe = (path) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8'}));

const samplingPlan = (ctx, scope, duration) => {
  const dir = join(ctx.build, 'sampling-plans', scope);
  mkdirSync(dir, {recursive: true});
  const boundaries = [];
  const keyframes = [];
  if (scope === 'main') {
    for (let index = 0; index < ctx.episode.scenes.length; index += 1) {
      const scene = ctx.episode.scenes[index];
      const safe = scene.id.replaceAll('-', '_');
      keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_start`, scene.start + 0.1]);
      keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_mid`, scene.start + scene.duration / 2]);
      keyframes.push([`${String(index + 1).padStart(2, '0')}_${safe}_end`, scene.start + scene.duration - 0.1]);
      if (index > 0) {
        const previous = ctx.episode.scenes[index - 1].id.replaceAll('-', '_');
        boundaries.push([`${String(index).padStart(2, '0')}_${previous}_to_${safe}`, scene.start]);
      }
      for (const item of scene.audit?.keyframes ?? []) keyframes.push([`${safe}_${item.label}`, scene.start + item.at]);
      for (const item of scene.audit?.bursts ?? []) boundaries.push([`${safe}_${item.label}`, scene.start + (item.from + item.to) / 2]);
    }
  } else {
    const intro = join(REMOTION, 'renders/git-course/visible-system-intro/current/visible-system-intro.mp4');
    const main = join(ctx.current, `${ctx.episode.episodeId}.mp4`);
    const outro = join(REMOTION, 'renders/git-course/outro/current/ref-lightbox-outro.mp4');
    for (const path of [intro, main, outro]) existsSync(path) || fail(`Release audit input missing: ${path}`);
    const introDuration = Number(probe(intro).format.duration);
    const mainDuration = Number(probe(main).format.duration);
    const outroDuration = Number(probe(outro).format.duration);
    boundaries.push(['intro_to_main', introDuration], ['main_to_outro', introDuration + mainDuration]);
    keyframes.push(
      ['intro_end', Math.max(0, introDuration - 0.1)],
      ['main_start', introDuration + 0.1],
      ['main_end', introDuration + mainDuration - 0.1],
      ['outro_start', introDuration + mainDuration + 0.1],
      ['outro_middle', introDuration + mainDuration + outroDuration / 2],
      ['release_end', Math.max(0, duration - 0.2)],
    );
  }
  const boundariesPath = join(dir, 'boundaries.tsv');
  const keyframesPath = join(dir, 'keyframes.tsv');
  writeFileSync(boundariesPath, boundaries.map((row) => row.join('\t')).join('\n') + (boundaries.length ? '\n' : ''));
  writeFileSync(keyframesPath, keyframes.map((row) => row.join('\t')).join('\n') + (keyframes.length ? '\n' : ''));
  return {boundariesPath, keyframesPath, expectedBoundaries: boundaries.length, expectedKeyframes: keyframes.length};
};

const auditArtifact = async (ctx, candidate, scope = 'main') => {
  existsSync(candidate) || fail(`Artifact not found: ${candidate}`);
  const info = probe(candidate);
  const video = info.streams.find((stream) => stream.codec_type === 'video');
  const audio = info.streams.find((stream) => stream.codec_type === 'audio');
  const expected = scope === 'main' ? ctx.episode.durationSeconds : null;
  const expectedProfile = scope === 'release' ? RENDER_PROFILES.uhd30 : RENDER_PROFILES.hd30;
  const duration = Number(info.format.duration);
  const checks = [
    {id: 'video.stream', status: video ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} ${video.r_frame_rate}` : 'missing'},
    {id: 'audio.stream', status: audio ? 'pass' : 'fail', details: audio ? `${audio.codec_name} ${audio.sample_rate}Hz` : 'missing'},
    {id: 'video.resolution', status: video?.width === expectedProfile.width && video?.height === expectedProfile.height ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} expected ${expectedProfile.width}x${expectedProfile.height}` : 'missing'},
    {id: 'video.fps', status: video?.r_frame_rate === `${expectedProfile.fps}/1` ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    ...(expected === null ? [] : [{id: 'duration.main', status: Math.abs(duration - expected) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${expected}s`}]),
  ];
  const plan = samplingPlan(ctx, scope, duration);
  const artifactSha256 = shaFile(candidate);
  const supportingArtifacts = scope === 'main' && existsSync(join(ctx.build, 'artifact-manifest.json'))
    ? json(join(ctx.build, 'artifact-manifest.json')).audioFiles ?? []
    : [];
  const supportingArtifactsSha256 = sha(JSON.stringify(supportingArtifacts));
  const auditFingerprint = sha(JSON.stringify({
    schema: 2,
    artifactSha256,
    supportingArtifactsSha256,
    boundaries: readFileSync(plan.boundariesPath, 'utf8'),
    keyframes: readFileSync(plan.keyframesPath, 'utf8'),
    workerSha256: shaFile(join(REMOTION, 'scripts/audit-video-stills.sh')),
  }));
  if (scope === 'release') {
    const intro = join(REMOTION, 'renders/git-course/visible-system-intro/current/visible-system-intro.mp4');
    const main = join(ctx.current, `${ctx.episode.episodeId}.mp4`);
    const outro = join(REMOTION, 'renders/git-course/outro/current/ref-lightbox-outro.mp4');
    for (const path of [intro, main, outro]) existsSync(path) || fail(`Release audit input missing: ${path}`);
    const introDuration = Number(probe(intro).format.duration);
    const mainDuration = Number(probe(main).format.duration);
    const outroDuration = Number(probe(outro).format.duration);
    const expectedRelease = introDuration + mainDuration + outroDuration;
    checks.push({id: 'duration.release', status: Math.abs(duration - expectedRelease) <= 0.12 ? 'pass' : 'fail', details: `${duration}s expected ${expectedRelease}s`});
  }
  const srtRoot = scope === 'main' ? join(ctx.build, 'candidate/audio/segments') : join(ctx.current, 'audio/segments');
  const srtFiles = walkFiles(srtRoot, (path) => path.endsWith('.srt'));
  const markerLeak = srtFiles.some((path) => /<#|#>/.test(readFileSync(path, 'utf8')));
  if (scope === 'main') checks.push({id: 'subtitle.pause-marker', status: markerLeak ? 'fail' : 'pass', details: markerLeak ? 'pause marker found' : 'clean'});
  const auditDir = join(ctx.build, 'audit', scope);
  const reviewScenesEvidence = scope === 'main' && existsSync(join(ctx.build, 'candidate/scenes'))
    ? rel(join(ctx.build, 'candidate/scenes'))
    : null;
  const cachedVerdictPath = join(auditDir, 'verdict.json');
  if (existsSync(cachedVerdictPath) && existsSync(join(auditDir, 'report.html'))) {
    const cached = json(cachedVerdictPath);
    if (cached.auditFingerprint === auditFingerprint && cached.artifactSha256 === artifactSha256) {
      if (reviewScenesEvidence && cached.evidence?.scenes !== reviewScenesEvidence) {
        cached.evidence ??= {};
        cached.evidence.scenes = reviewScenesEvidence;
        writeJson(cachedVerdictPath, cached);
      }
      console.log(`HIT   audit ${scope}: ${cached.verdict}`);
      return cached;
    }
  }
  rmSync(auditDir, {recursive: true, force: true});
  await run(join(REMOTION, 'scripts/audit-video-stills.sh'), [candidate, auditDir], {
    env: {BOUNDARIES_FILE: plan.boundariesPath, KEYFRAMES_FILE: plan.keyframesPath},
    log: join(ctx.build, 'logs', `audit-${scope}.log`),
  });
  const sampling = json(join(auditDir, 'manifest.json')).sampling;
  checks.push(
    {id: 'sampling.continuous2fps', status: sampling.review.actualFrames === sampling.review.expectedFrames ? 'pass' : 'fail', details: `${sampling.review.actualFrames}/${sampling.review.expectedFrames}`},
    {id: 'sampling.sheets5x1', status: sampling.review.actualSheets === sampling.review.expectedSheets ? 'pass' : 'fail', details: `${sampling.review.actualSheets}/${sampling.review.expectedSheets}`},
    {id: 'sampling.boundaries10fps', status: sampling.boundaries.count === plan.expectedBoundaries ? 'pass' : 'fail', details: `${sampling.boundaries.count}/${plan.expectedBoundaries}`},
    {id: 'sampling.keyframes', status: sampling.keyframes.count === plan.expectedKeyframes ? 'pass' : 'fail', details: `${sampling.keyframes.count}/${plan.expectedKeyframes}`},
  );
  checks.push({id: 'visual.human-review', status: 'needs_review', details: rel(join(auditDir, 'report.html'))});
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope,
    artifact: rel(candidate),
    artifactSha256,
    supportingArtifactsSha256,
    auditFingerprint,
    inputFingerprint: scope === 'main' && existsSync(join(ctx.build, 'artifact-manifest.json')) ? json(join(ctx.build, 'artifact-manifest.json')).inputFingerprint : shaFile(candidate),
    createdAt: new Date().toISOString(),
    verdict: machineFailed ? 'fail' : 'needs_review',
    checks,
    coverage: {overview: true, continuous2fps: true, boundaries10fps: true, keyframes: true},
    evidence: {
      report: rel(join(auditDir, 'report.html')),
      overview: rel(join(auditDir, 'overview/contact-16.jpg')),
      reviewSheets: rel(join(auditDir, 'review/sheets')),
      boundaries: rel(join(auditDir, 'boundaries')),
      keyframes: rel(join(auditDir, 'keyframes')),
      ...(reviewScenesEvidence ? {scenes: reviewScenesEvidence} : {}),
    },
  };
  writeJson(join(auditDir, 'verdict.json'), verdict);
  console.log(`${machineFailed ? 'FAIL' : 'WAIT'}  audit ${scope}: ${verdict.verdict}`);
  return verdict;
};

const verdictPath = (ctx, scope) => join(ctx.build, 'audit', scope, 'verdict.json');
const candidatePath = (ctx, scope) => join(ctx.build, scope === 'main' ? `candidate/${ctx.episode.episodeId}.mp4` : `release-candidate/${ctx.episode.episodeId}.mp4`);

const assertBuildFresh = (ctx) => {
  const buildPlan = plan(ctx);
  const staleScenes = buildPlan.scenes.filter((task) => !task.hit).map((task) => task.scene.id);
  const staleTts = buildPlan.tts.filter((task) => !task.hit).map((task) => task.scene.narration.segmentId);
  staleScenes.length === 0 || fail(`Visual inputs changed after build: ${staleScenes.join(', ')}`);
  staleTts.length === 0 || fail(`Narration inputs changed after build: ${staleTts.join(', ')}`);
  ctx.state.audioFingerprint === audioFingerprint(ctx, buildPlan) || fail('Audio inputs changed after build.');
};

const approve = (ctx, scope) => {
  const path = verdictPath(ctx, scope);
  existsSync(path) || fail(`No ${scope} audit verdict. Run audit first.`);
  const verdict = json(path);
  verdict.verdict !== 'fail' || fail(`Cannot approve failed ${scope} audit.`);
  const artifact = candidatePath(ctx, scope);
  existsSync(artifact) || fail(`Candidate missing: ${artifact}`);
  shaFile(artifact) === verdict.artifactSha256 || fail(`${scope} candidate changed after audit.`);
  if (scope === 'main') assertBuildFresh(ctx);
  verdict.verdict = 'pass';
  verdict.approval = {reviewer: process.env.USER ?? 'unknown', approvedAt: new Date().toISOString(), note: FLAGS.get('note') ?? ''};
  const human = verdict.checks.find((check) => check.id === 'visual.human-review');
  if (human) human.status = 'pass';
  writeJson(path, verdict);
  console.log(`PASS  approve ${scope}`);
};

const requirePass = (ctx, scope) => {
  const path = verdictPath(ctx, scope);
  existsSync(path) || fail(`Missing ${scope} verdict.`);
  const verdict = json(path);
  verdict.verdict === 'pass' || fail(`${scope} verdict is ${verdict.verdict}; approval required.`);
  const artifact = candidatePath(ctx, scope);
  shaFile(artifact) === verdict.artifactSha256 || fail(`${scope} candidate SHA does not match verdict.`);
  if (scope === 'main') assertBuildFresh(ctx);
  return {verdict, artifact};
};

const promote = (ctx) => {
  const {verdict, artifact} = requirePass(ctx, 'main');
  const artifactManifestPath = join(ctx.build, 'artifact-manifest.json');
  existsSync(artifactManifestPath) || fail('Main artifact manifest is missing.');
  const manifest = json(artifactManifestPath);
  manifest.episodeId === ctx.episode.episodeId || fail('Main artifact manifest belongs to another episode.');
  manifest.path === rel(artifact) && manifest.sha256 === shaFile(artifact) || fail('Main artifact manifest does not match the approved candidate.');
  manifest.inputFingerprint === verdict.inputFingerprint || fail('Main artifact manifest fingerprint does not match the approved verdict.');
  Array.isArray(manifest.scenes) || fail('Main artifact manifest has no scene list.');
  sha(JSON.stringify({scenes: manifest.scenes.map((item) => item.sha256), mix: manifest.audio?.sha256})) === manifest.inputFingerprint || fail('Main artifact manifest inputs do not reproduce its fingerprint.');
  manifest.scenes.length === ctx.episode.scenes.length || fail('Main artifact scene count does not match the episode.');
  for (const [index, item] of manifest.scenes.entries()) {
    item.sceneId === ctx.episode.scenes[index].id || fail(`Approved scene order mismatch at ${item.sceneId}.`);
    const path = resolve(ROOT, item.path);
    path.startsWith(`${ctx.cache}/`) || fail(`Unexpected scene artifact path: ${item.path}`);
    existsSync(path) || fail(`Approved scene is missing: ${item.path}`);
    shaFile(path) === item.sha256 || fail(`Approved scene changed after build: ${item.path}`);
  }
  const candidateAudioDir = join(ctx.build, 'candidate/audio');
  const candidateMix = join(candidateAudioDir, 'mix.m4a');
  existsSync(candidateMix) || fail('Approved candidate audio is missing.');
  manifest.audio?.path === rel(candidateMix) && manifest.audio?.sha256 === shaFile(candidateMix) || fail('Approved candidate mix changed after build.');
  Array.isArray(manifest.audioFiles) && manifest.audioFiles.length > 0 || fail('Main artifact manifest does not bind candidate audio files. Rebuild and audit the candidate.');
  sha(JSON.stringify(manifest.audioFiles)) === verdict.supportingArtifactsSha256 || fail('Candidate audio manifest does not match the approved verdict.');
  const actualAudioFiles = walkFiles(candidateAudioDir, (path) => !path.endsWith('.partial')).map(rel);
  JSON.stringify(actualAudioFiles) === JSON.stringify(manifest.audioFiles.map((item) => item.path)) || fail('Candidate audio directory does not match the approved manifest.');
  for (const item of manifest.audioFiles) {
    const path = resolve(ROOT, item.path);
    path.startsWith(`${candidateAudioDir}/`) || fail(`Unexpected audio artifact path: ${item.path}`);
    existsSync(path) || fail(`Approved audio artifact is missing: ${item.path}`);
    shaFile(path) === item.sha256 || fail(`Approved audio artifact changed after build: ${item.path}`);
  }

  copyAtomically(artifact, join(ctx.current, `${ctx.episode.episodeId}.mp4`));
  const sceneDir = join(ctx.current, 'scenes');
  const nextSceneDir = join(ctx.current, 'scenes.next');
  const previousSceneDir = join(ctx.current, 'scenes.previous');
  rmSync(nextSceneDir, {recursive: true, force: true});
  mkdirSync(nextSceneDir, {recursive: true});
  for (const [index, item] of manifest.scenes.entries()) {
    const target = join(nextSceneDir, `${String(index + 1).padStart(2, '0')}_${item.sceneId.replaceAll('-', '_')}.mp4`);
    copyFileSync(join(ROOT, item.path), `${target}.partial`);
    renameSync(`${target}.partial`, target);
  }
  rmSync(previousSceneDir, {recursive: true, force: true});
  if (existsSync(sceneDir)) renameSync(sceneDir, previousSceneDir);
  try {
    renameSync(nextSceneDir, sceneDir);
  } catch (error) {
    if (!existsSync(sceneDir) && existsSync(previousSceneDir)) renameSync(previousSceneDir, sceneDir);
    throw error;
  }
  rmSync(previousSceneDir, {recursive: true, force: true});

  const audioDir = join(ctx.current, 'audio');
  const nextAudioDir = join(ctx.current, 'audio.next');
  const previousAudioDir = join(ctx.current, 'audio.previous');
  rmSync(nextAudioDir, {recursive: true, force: true});
  mkdirSync(nextAudioDir, {recursive: true});
  for (const source of walkFiles(candidateAudioDir, (path) => !path.endsWith('.partial'))) {
    const target = join(nextAudioDir, relative(candidateAudioDir, source));
    copyAtomically(source, target);
  }
  for (const name of ['bgm.mp3', 'bgm_180.mp3']) {
    const source = join(audioDir, name);
    if (existsSync(source)) copyAtomically(source, join(nextAudioDir, name));
  }
  rmSync(previousAudioDir, {recursive: true, force: true});
  if (existsSync(audioDir)) renameSync(audioDir, previousAudioDir);
  try {
    renameSync(nextAudioDir, audioDir);
  } catch (error) {
    if (!existsSync(audioDir) && existsSync(previousAudioDir)) renameSync(previousAudioDir, audioDir);
    throw error;
  }
  rmSync(previousAudioDir, {recursive: true, force: true});
  writeJson(join(ctx.current, 'audit/verdict.json'), verdict);
  console.log(`PASS  promote ${rel(join(ctx.current, `${ctx.episode.episodeId}.mp4`))}`);
};

const recoverProfileCache = (cacheDir, fingerprint) => {
  if (!existsSync(cacheDir)) return null;
  const name = readdirSync(cacheDir).find((entry) => entry.endsWith(`_${fingerprint.slice(0, 12)}.mp4`));
  return name ? join(cacheDir, name) : null;
};

const uhdScenePlan = (ctx) => {
  const basePlan = plan(ctx);
  const profile = RENDER_PROFILES.uhd30;
  const cacheDir = join(ctx.cache, 'scenes', profile.name);
  ctx.state.releaseScenes ??= {};
  const scenes = basePlan.scenes.map((task) => {
    const fingerprint = sha(JSON.stringify({schema: 1, sourceFingerprint: task.fingerprint, profile}));
    let cached = ctx.state.releaseScenes[task.scene.id];
    let hit = cached?.fingerprint === fingerprint && existsSync(join(ROOT, cached.path ?? ''));
    if (!hit) {
      const recovered = recoverProfileCache(cacheDir, fingerprint);
      if (recovered) {
        cached = {fingerprint, profile: profile.name, path: rel(recovered), sha256: shaFile(recovered), recoveredAt: new Date().toISOString()};
        ctx.state.releaseScenes[task.scene.id] = cached;
        hit = true;
      }
    }
    return {...task, fingerprint, cached, hit};
  });
  return {...basePlan, profile, cacheDir, scenes};
};

const uhdBrandTask = (ctx, {sceneId, compositionId, duration}) => {
  const profile = RENDER_PROFILES.uhd30;
  const sourceHash = hashFiles([
    ...walkFiles(join(REMOTION, 'src/videos/git-course/kit/brand'), (path) => /\.(?:ts|tsx)$/.test(path)),
    join(REMOTION, 'src/videos/git-course/palette.ts'),
    join(REMOTION, 'src/videos/git-course/typography.ts'),
    join(REMOTION, 'src/videos/git-course/timeline.ts'),
    join(REMOTION, 'src/fonts.css'),
  ]);
  const fingerprint = sha(JSON.stringify({schema: 1, compositionId, duration, sourceHash, profile}));
  const cacheDir = join(REMOTION, 'renders/git-course/tmp/cache/brand', profile.name);
  ctx.state.releaseAssets ??= {};
  let cached = ctx.state.releaseAssets[sceneId];
  let hit = cached?.fingerprint === fingerprint && existsSync(join(ROOT, cached.path ?? ''));
  if (!hit) {
    const recovered = recoverProfileCache(cacheDir, fingerprint);
    if (recovered) {
      cached = {fingerprint, profile: profile.name, path: rel(recovered), sha256: shaFile(recovered), recoveredAt: new Date().toISOString()};
      ctx.state.releaseAssets[sceneId] = cached;
      hit = true;
    }
  }
  return {profile, cacheDir, compositionId, task: {scene: {id: sceneId, start: 0, duration}, index: 0, fingerprint, cached, hit}};
};

const assembleUhdMain = async (ctx, releasePlan) => {
  const dir = join(ctx.build, 'release-main-candidate');
  mkdirSync(dir, {recursive: true});
  const manifestPath = join(dir, 'scenes.ffconcat');
  const out = join(dir, `${ctx.episode.episodeId}.mp4`);
  const audio = join(ctx.current, 'audio/mix.m4a');
  existsSync(audio) || fail(`Approved main audio missing: ${audio}`);
  const ordered = releasePlan.scenes.map((task) => {
    const state = ctx.state.releaseScenes[task.scene.id] ?? fail(`No UHD scene cache state: ${task.scene.id}`);
    const path = join(ROOT, state.path);
    existsSync(path) || fail(`Missing UHD scene cache: ${path}`);
    return {sceneId: task.scene.id, path, sha256: shaFile(path)};
  });
  const inputFingerprint = sha(JSON.stringify({schema: 1, profile: releasePlan.profile, scenes: ordered.map((item) => item.sha256), audio: shaFile(audio)}));
  const artifactPath = join(dir, 'manifest.json');
  if (existsSync(out) && existsSync(artifactPath)) {
    const cached = json(artifactPath);
    if (cached.inputFingerprint === inputFingerprint && cached.sha256 === shaFile(out)) return {out, manifest: cached};
  }
  writeFileSync(manifestPath, ordered.map((item) => `file '${item.path.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  await run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', manifestPath, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-f', 'mp4', `${out}.partial`], {log: join(ctx.build, 'logs/assemble-uhd-main.log')});
  renameSync(`${out}.partial`, out);
  const manifest = {schemaVersion: 1, inputFingerprint, profile: releasePlan.profile, path: rel(out), sha256: shaFile(out), audio: {path: rel(audio), sha256: shaFile(audio)}, scenes: ordered.map((item) => ({...item, path: rel(item.path)})), createdAt: new Date().toISOString()};
  writeJson(artifactPath, manifest);
  return {out, manifest};
};

const releaseBuild = async (ctx) => {
  const currentMain = join(ctx.current, `${ctx.episode.episodeId}.mp4`);
  const currentVerdict = join(ctx.current, 'audit/verdict.json');
  existsSync(currentVerdict) || fail('Current main has no promoted audit verdict.');
  const gate = json(currentVerdict);
  gate.verdict === 'pass' && gate.artifactSha256 === shaFile(currentMain) || fail('Current main audit gate is stale or not passed.');
  assertBuildFresh(ctx);

  const releasePlan = uhdScenePlan(ctx);
  await renderScenes(ctx, releasePlan.scenes.filter((task) => !task.hit), {
    renderProfile: releasePlan.profile,
    stateKey: 'releaseScenes',
    cacheDir: releasePlan.cacheDir,
    taskPrefix: 'release-render',
    planName: 'release-render-plan.json',
  });
  const uhdMain = await assembleUhdMain(ctx, releasePlan);

  const introTask = uhdBrandTask(ctx, {sceneId: 'visible-system-intro', compositionId: 'GitCourseVisibleSystemIntro', duration: 7});
  const outroTask = uhdBrandTask(ctx, {sceneId: 'ref-lightbox-outro', compositionId: 'GitCourseVisibleSystemOutro', duration: 6});
  for (const brand of [introTask, outroTask]) {
    await renderScenes(ctx, brand.task.hit ? [] : [brand.task], {
      renderProfile: brand.profile,
      stateKey: 'releaseAssets',
      cacheDir: brand.cacheDir,
      taskPrefix: `release-brand-${brand.task.scene.id}`,
      planName: `release-brand-${brand.task.scene.id}-plan.json`,
      compositionId: brand.compositionId,
    });
  }
  writeJson(ctx.statePath, ctx.state);

  const out = candidatePath(ctx, 'release');
  const intro = join(ROOT, ctx.state.releaseAssets['visible-system-intro'].path);
  const introAudio = join(REMOTION, 'renders/git-course/visible-system-intro/current/audio/intro-bgm.m4a');
  const outro = join(ROOT, ctx.state.releaseAssets['ref-lightbox-outro'].path);
  const outroAudio = join(REMOTION, 'renders/git-course/outro/current/audio/outro-bgm.m4a');
  const inputs = [intro, introAudio, uhdMain.out, outro, outroAudio];
  for (const path of inputs) existsSync(path) || fail(`Release input missing: ${path}`);
  const inputFingerprint = sha(JSON.stringify({
    schema: 3,
    profile: releasePlan.profile,
    inputs: inputs.map((path) => ({path: rel(path), sha256: shaFile(path)})),
    introGainDb: process.env.INTRO_AUDIO_GAIN_DB ?? '0',
    outroGainDb: process.env.OUTRO_AUDIO_GAIN_DB ?? '-5',
    scriptSha256: shaFile(join(REMOTION, 'scripts/git-course-publish-episode.sh')),
  }));
  const manifestPath = join(ctx.build, 'release-artifact-manifest.json');
  if (existsSync(out) && existsSync(manifestPath)) {
    const cached = json(manifestPath);
    if (cached.inputFingerprint === inputFingerprint && cached.sha256 === shaFile(out)) {
      console.log(`HIT   release-build ${rel(out)}`);
      return;
    }
  }
  mkdirSync(dirname(out), {recursive: true});
  await run(join(REMOTION, 'scripts/git-course-publish-episode.sh'), [ctx.episode.episodeId, uhdMain.out], {
    env: {
      OUT_FILE: out,
      GIT_COURSE_ORCHESTRATED: '1',
      INTRO_VIDEO: intro,
      INTRO_AUDIO: introAudio,
      OUTRO_VIDEO: outro,
      OUTRO_AUDIO: outroAudio,
      EXPECTED_WIDTH: String(releasePlan.profile.width),
      EXPECTED_HEIGHT: String(releasePlan.profile.height),
      EXPECTED_FPS: `${releasePlan.profile.fps}/1`,
    },
    log: join(ctx.build, 'logs/release-build.log'),
  });
  writeJson(manifestPath, {
    schemaVersion: 2,
    inputFingerprint,
    profile: releasePlan.profile,
    path: rel(out),
    sha256: shaFile(out),
    inputs: {intro: rel(intro), main: rel(uhdMain.out), outro: rel(outro)},
    createdAt: new Date().toISOString(),
  });
  console.log(`PASS  release-build ${rel(out)}`);
};

const publish = (ctx) => {
  const {verdict, artifact} = requirePass(ctx, 'release');
  const target = join(ctx.current, 'release', `${ctx.episode.episodeId}.mp4`);
  mkdirSync(dirname(target), {recursive: true});
  copyFileSync(artifact, `${target}.partial`);
  renameSync(`${target}.partial`, target);
  writeJson(join(ctx.current, 'release/verdict.json'), verdict);
  console.log(`PASS  publish ${rel(target)}`);
};

const build = async (ctx) => {
  const buildStartedAt = performance.now();
  execFileSync('node', ['scripts/git-course.mjs', 'validate'], {cwd: REMOTION, stdio: 'inherit'});
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  const dirtyScenes = buildPlan.scenes.filter((task) => !task.hit);
  const renderPromise = renderScenes(ctx, dirtyScenes);
  const audioPromise = buildAudio(ctx, buildPlan);
  const [renderResult, audioResult] = await Promise.allSettled([renderPromise, audioPromise]);
  const independentFinishedAt = performance.now();
  if (audioResult.status === 'rejected') recoverValidTtsState(ctx, buildPlan);
  writeJson(ctx.statePath, ctx.state);
  const failures = [renderResult, audioResult].filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    const messages = failures.map((result) => result.reason?.message ?? String(result.reason));
    fail(`Independent tasks finished with ${failures.length} failure(s):\n${messages.join('\n')}`);
  }
  const assembled = await assembleMain(ctx, buildPlan, audioResult.value);
  const assembledAt = performance.now();
  await materializeReviewScenes(ctx, assembled.candidate);
  const reviewScenesReadyAt = performance.now();
  const audit = await auditArtifact(ctx, assembled.candidate, 'main');
  const finishedAt = performance.now();
  writeJson(join(ctx.build, 'telemetry/build.json'), {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    createdAt: new Date().toISOString(),
    dirtyScenes: dirtyScenes.map((task) => task.scene.id),
    dirtyTts: buildPlan.tts.filter((task) => !task.hit).map((task) => task.scene.narration.segmentId),
    stages: {
      generatePlanRenderAudioSeconds: Number(((independentFinishedAt - buildStartedAt) / 1000).toFixed(3)),
      assembleSeconds: Number(((assembledAt - independentFinishedAt) / 1000).toFixed(3)),
      reviewScenesSeconds: Number(((reviewScenesReadyAt - assembledAt) / 1000).toFixed(3)),
      auditSeconds: Number(((finishedAt - reviewScenesReadyAt) / 1000).toFixed(3)),
      totalSeconds: Number(((finishedAt - buildStartedAt) / 1000).toFixed(3)),
    },
    auditVerdict: audit.verdict,
  });
  if (audit.verdict !== 'fail') removeTargets(taskDirectories(ctx, 'main'), {apply: true, label: 'main task cleanup'});
};

const status = (ctx) => {
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  for (const scope of ['main', 'release']) {
    const path = verdictPath(ctx, scope);
    console.log(`${scope.padEnd(7)} verdict: ${existsSync(path) ? json(path).verdict : 'missing'}`);
  }
};

const taskDirectories = (ctx, scope) => {
  const root = join(ctx.build, 'tasks');
  if (!existsSync(root)) return [];
  const names = readdirSync(root, {withFileTypes: true}).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const selected = scope === 'main'
    ? names.filter((name) => name === 'audio' || name.startsWith('render-'))
    : names.filter((name) => name.startsWith('release-render-') || name.startsWith('release-brand-'));
  return selected.map((name) => join(root, name));
};

const cleanWorkspace = (ctx) => {
  const apply = flagEnabled('apply');
  const scope = FLAGS.get('scope') ?? 'all';
  ['main', 'release', 'all'].includes(scope) || fail(`Unknown clean scope: ${scope}`);
  const targets = [];
  const auditAllowsCleanup = (auditScope) => {
    const path = verdictPath(ctx, auditScope);
    if (!existsSync(path) || !existsSync(join(ctx.build, `audit/${auditScope}/report.html`))) return false;
    return ['needs_review', 'pass'].includes(json(path).verdict);
  };
  if ((scope === 'main' || scope === 'all') && auditAllowsCleanup('main')) targets.push(...taskDirectories(ctx, 'main'));
  if ((scope === 'release' || scope === 'all') && auditAllowsCleanup('release')) targets.push(...taskDirectories(ctx, 'release'));
  if (flagEnabled('preview')) targets.push(join(ctx.tmp, 'preview'));
  if (flagEnabled('legacy')) {
    targets.push(...['audit', 'audit-15f', 'scenes', 'chunks'].map((name) => join(ctx.tmp, name)));
    targets.push(join(REMOTION, 'renders/git-course/tmp/render-profile.json'));
  }
  return removeTargets(targets, {apply, label: `clean ${ctx.episode.episodeId}`});
};

const collectReferencedPaths = (value, result) => {
  if (typeof value === 'string') {
    if (value.startsWith('remotion/')) result.add(resolve(ROOT, value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectReferencedPaths(item, result);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectReferencedPaths(item, result);
  }
};

const cacheReferences = (ctx) => {
  const result = new Set();
  const referenceFiles = [
    ...walkFiles(ctx.build, (path) => path.endsWith('.json')),
    ...walkFiles(join(ctx.tmp, 'preview'), (path) => path.endsWith('.json')),
    ...walkFiles(join(ctx.current, 'audit'), (path) => path.endsWith('.json')),
    ...walkFiles(join(ctx.current, 'release'), (path) => path.endsWith('verdict.json')),
  ];
  for (const path of referenceFiles) {
    try {
      collectReferencedPaths(json(path), result);
    } catch {
      // A malformed diagnostic file must not make a dry-run GC destructive.
      console.log(`SKIP  unreadable reference file: ${rel(path)}`);
    }
  }
  const activePlan = plan(ctx);
  for (const task of activePlan.scenes) {
    const path = task.cached?.path ? join(ROOT, task.cached.path) : null;
    if (path) result.add(path);
  }
  for (const task of activePlan.tts) {
    for (const key of ['raw', 'srt', 'text', 'speechMetadata', 'norm', 'metadata']) result.add(task.cas[key]);
  }
  for (const group of [ctx.state.scenes, ctx.state.releaseScenes, ctx.state.releaseAssets, ctx.state.tts]) {
    for (const item of Object.values(group ?? {})) if (item?.path) result.add(join(ROOT, item.path));
  }
  return result;
};

const garbageCollect = (ctx) => {
  const apply = flagEnabled('apply');
  const graceDays = Number(FLAGS.get('grace-days') ?? '7');
  Number.isFinite(graceDays) && graceDays >= 0 || fail(`Invalid --grace-days: ${FLAGS.get('grace-days')}`);
  const cutoff = Date.now() - graceDays * 24 * 60 * 60 * 1000;
  const protectedPaths = cacheReferences(ctx);
  const targets = walkFiles(ctx.cache).filter((path) => statSync(path).mtimeMs < cutoff && !protectedPaths.has(path));

  if (flagEnabled('bundles')) {
    const active = walkFiles(join(REMOTION, 'renders/git-course'), (path) => path.endsWith('/tmp/build/activity.json'))
      .map((path) => {
        try {
          return {path, activity: json(path)};
        } catch {
          return {path, activity: null};
        }
      })
      .filter(({path, activity}) => path !== activityPath(ctx) && (activity ? processIsAlive(activity.pid) : Date.now() - statSync(path).mtimeMs < 30000));
    active.length === 0 || fail(`Bundle GC blocked by active command: ${active.map(({path, activity}) => activity ? `${activity.episodeId}:${activity.command}` : `${rel(path)}:initializing`).join(', ')}`);
    const bundlesRoot = join(REMOTION, 'renders/git-course/tmp/bundles');
    if (existsSync(bundlesRoot)) {
      const keep = Number(FLAGS.get('keep-bundles') ?? '3');
      Number.isInteger(keep) && keep >= 1 || fail(`Invalid --keep-bundles: ${FLAGS.get('keep-bundles')}`);
      const currentFingerprint = hashFiles([
        ...walkFiles(join(REMOTION, 'src'), (path) => /\.(?:ts|tsx|css)$/.test(path)),
        join(REMOTION, 'package.json'),
        join(REMOTION, 'pnpm-lock.yaml'),
        join(REMOTION, 'remotion.config.ts'),
        ...walkFiles(join(REMOTION, 'public/git-course')),
      ]);
      const bundles = readdirSync(bundlesRoot, {withFileTypes: true})
        .filter((entry) => entry.isDirectory() && /^[a-f0-9]{64}$/.test(entry.name))
        .map((entry) => join(bundlesRoot, entry.name))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
      const retained = new Set([join(bundlesRoot, currentFingerprint), ...bundles.slice(0, keep)]);
      targets.push(...bundles.filter((path) => statSync(path).mtimeMs < cutoff && !retained.has(path)));
    }
  }
  const result = removeTargets(targets, {apply, label: `gc ${ctx.episode.episodeId}`});
  if (apply) pruneEmptyDirectories(ctx.cache);
  return result;
};

const preview = async (ctx) => {
  const profileName = FLAGS.get('profile') ?? RENDER_PROFILES.hd30.name;
  const renderProfile = profileName === 'uhd30' ? RENDER_PROFILES.uhd30 : profileName === 'hd30' ? RENDER_PROFILES.hd30 : null;
  renderProfile || fail(`Unknown render profile: ${profileName}`);
  const buildPlan = profileName === 'uhd30' ? uhdScenePlan(ctx) : plan(ctx);
  const requested = (FLAGS.get('scenes') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const known = new Set(buildPlan.scenes.map((task) => task.scene.id));
  for (const sceneId of requested) known.has(sceneId) || fail(`Unknown scene for preview: ${sceneId}`);
  const selected = requested.length > 0 ? buildPlan.scenes.filter((task) => requested.includes(task.scene.id)) : buildPlan.scenes.filter((task) => !task.hit);
  const dirty = selected.filter((task) => !task.hit);
  console.log(`PREVIEW ${selected.map((task) => task.scene.id).join(', ') || 'no dirty scenes'}`);
  const stateKey = profileName === 'uhd30' ? 'releaseScenes' : 'scenes';
  await renderScenes(ctx, dirty, {
    renderProfile,
    stateKey,
    cacheDir: buildPlan.cacheDir,
    taskPrefix: profileName === 'uhd30' ? 'preview-uhd30' : 'render',
    planName: profileName === 'uhd30' ? 'preview-uhd30-plan.json' : 'render-plan.json',
  });
  writeJson(ctx.statePath, ctx.state);
  const previewDir = join(ctx.tmp, profileName === 'hd30' ? 'preview/scenes' : `preview/${profileName}/scenes`);
  if (FLAGS.has('clean-preview')) rmSync(previewDir, {recursive: true, force: true});
  mkdirSync(previewDir, {recursive: true});
  const expectedPreviewNames = new Set(buildPlan.scenes.map((task) => `${String(task.index + 1).padStart(2, '0')}_${task.scene.id.replaceAll('-', '_')}.mp4`));
  for (const entry of readdirSync(previewDir)) {
    if (entry.endsWith('.mp4') && !expectedPreviewNames.has(entry)) {
      rmSync(join(previewDir, entry), {force: true});
      console.log(`CLEAN stale preview: ${entry}`);
    }
  }
  const manifestPath = join(ctx.tmp, profileName === 'hd30' ? 'preview/manifest.json' : `preview/${profileName}/manifest.json`);
  const previous = existsSync(manifestPath) ? json(manifestPath) : {schemaVersion: 1, episodeId: ctx.episode.episodeId, scenes: {}};
  const retainedScenes = Object.fromEntries(Object.entries(previous.scenes ?? {}).filter(([sceneId, item]) => {
    const task = buildPlan.scenes.find((candidate) => candidate.scene.id === sceneId);
    if (!task) return false;
    const expectedName = `${String(task.index + 1).padStart(2, '0')}_${task.scene.id.replaceAll('-', '_')}.mp4`;
    return item?.previewPath === rel(join(previewDir, expectedName)) && existsSync(join(previewDir, expectedName));
  }));
  const manifest = {...previous, schemaVersion: 1, episodeId: ctx.episode.episodeId, profile: renderProfile, updatedAt: new Date().toISOString(), scenes: retainedScenes};
  for (const task of selected) {
    const cached = ctx.state[stateKey]?.[task.scene.id];
    if (!cached?.path) continue;
    const index = String(task.index + 1).padStart(2, '0');
    const name = `${index}_${task.scene.id.replaceAll('-', '_')}.mp4`;
    const source = join(ROOT, cached.path);
    const target = join(previewDir, name);
    const materialization = materializeView(source, target);
    manifest.scenes[task.scene.id] = {
      fingerprint: cached.fingerprint,
      sha256: cached.sha256,
      cachePath: cached.path,
      previewPath: rel(target),
      materialization,
      updatedAt: new Date().toISOString(),
    };
    console.log(`${task.hit ? 'HIT   ' : 'READY '} ${task.scene.id}: ${rel(target)}`);
  }
  writeJson(manifestPath, manifest);
};

const normalizedNarrationText = (value) => value
  .replace(/\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)/gi, '')
  .replace(/<#[^>]+#>/g, '')
  .replace(/[\s，。；;、：:！？?!,.·]/g, '')
  .toLowerCase();

const normalizedSrtText = (value) => value
  .split(/\r?\n/)
  .filter((line) => line.trim() && !/^\d+$/.test(line.trim()) && !line.includes('-->'))
  .join('')
  .replace(/[\s，。；;、：:！？?!,.·]/g, '')
  .toLowerCase();

const validateNarrationDuration = (task, duration) => {
  const textLength = normalizedNarrationText(task.scene.narration.text).length;
  const minimumDuration = textLength * 0.065;
  duration >= minimumDuration || fail(`${task.scene.narration.segmentId}: audio is suspiciously short (${duration.toFixed(3)}s for ${textLength} normalized characters; minimum ${minimumDuration.toFixed(3)}s)`);
};

const canonicalNarrationCues = (value) => value
  .split(/<#[^>]+#>|\n+/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line
    .replace(/^\s*\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)\s*/i, '')
    .replace(/[。；;]+\s*$/u, '')
    .replace(/([\p{Script=Han}A-Za-z0-9])\.\s*$/u, '$1'));

const parseSrtTimestamp = (value) => {
  const match = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/.exec(value);
  match || fail(`Invalid SRT timestamp: ${value}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
};

const formatSrtTimestamp = (secondsValue) => {
  const milliseconds = Math.max(0, Math.round(secondsValue * 1000));
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const millis = milliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
};

const canonicalizeSrtText = (task, srtPath, normPath) => {
  const sourceCues = canonicalNarrationCues(task.scene.narration.text);
  const raw = readFileSync(srtPath).toString('utf8').replace(/\r\n/g, '\n').trim();
  const timings = [...raw.matchAll(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g)];
  timings.length > 0 || fail(`${task.scene.narration.segmentId}: SRT has no timed cues`);
  existsSync(normPath) || fail(`${task.scene.narration.segmentId}: normalized audio is required for subtitle alignment`);
  const firstStart = parseSrtTimestamp(timings[0][1]);
  const lastEnd = parseSrtTimestamp(timings[timings.length - 1][2]);
  const detection = spawnSync('ffmpeg', [
    '-nostdin', '-hide_banner', '-i', normPath,
    '-af', 'silencedetect=noise=-38dB:d=0.32',
    '-f', 'null', '-',
  ], {encoding: 'utf8'});
  detection.status === 0 || fail(`${task.scene.narration.segmentId}: ffmpeg silence detection failed: ${detection.stderr?.trim() ?? 'unknown error'}`);
  const silenceStarts = [...detection.stderr.matchAll(/silence_start:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
  const silenceEnds = [...detection.stderr.matchAll(/silence_end:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
  silenceStarts.length === silenceEnds.length || fail(`${task.scene.narration.segmentId}: incomplete silence detection output`);
  const internalSilences = silenceStarts
    .map((start, index) => ({start, end: silenceEnds[index]}))
    .filter(({start, end}) => start > firstStart && end < lastEnd && end - start >= 0.32);
  internalSilences.length === sourceCues.length - 1 || fail(
    `${task.scene.narration.segmentId}: expected ${sourceCues.length - 1} narration pauses, found ${internalSilences.length}`,
  );
  const canonicalBlocks = sourceCues.map((text, index) => {
    const start = index === 0 ? firstStart : internalSilences[index - 1].end;
    const end = index === sourceCues.length - 1 ? lastEnd : internalSilences[index].start;
    end > start || fail(`${task.scene.narration.segmentId}: invalid aligned subtitle cue ${index + 1}`);
    return `${index + 1}\n${formatSrtTimestamp(start)} --> ${formatSrtTimestamp(end)}\n${text}`;
  });
  writeFileSync(srtPath, `${canonicalBlocks.join('\n\n')}\n`);
};

const validateTtsTextArtifacts = (task, srtPath, textPath, normPath) => {
  const segment = task.scene.narration.segmentId;
  canonicalizeSrtText(task, srtPath, normPath);
  const srtBytes = readFileSync(srtPath);
  isUtf8(srtBytes) || fail(`${segment}: SRT is not valid UTF-8`);
  const srtText = srtBytes.toString('utf8');
  !/<#|#>/.test(srtText) || fail(`${segment}: pause marker leaked into SRT`);
  !srtText.split(/\r?\n/).some((line) => line && !line.includes('-->') && /[。；;]\s*$/.test(line)) || fail(`${segment}: terminal subtitle punctuation was not cleaned`);
  normalizedSrtText(srtText) === normalizedNarrationText(task.scene.narration.text) || fail(`${segment}: SRT text does not match narration source`);
  readFileSync(textPath, 'utf8').trim() === task.scene.narration.text.trim() || fail(`${segment}: staged TTS text does not match episode JSON`);
};

const previewAudio = async (ctx) => {
  await run('node', [join(REMOTION, 'scripts/git-course.mjs'), 'validate']);
  const buildPlan = plan(ctx);
  const requested = (FLAGS.get('scenes') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const known = new Set(buildPlan.tts.map((task) => task.scene.id));
  for (const sceneId of requested) known.has(sceneId) || fail(`Unknown scene for audio preview: ${sceneId}`);
  const selected = requested.length > 0 ? buildPlan.tts.filter((task) => requested.includes(task.scene.id)) : buildPlan.tts.filter((task) => !task.hit);
  selected.length > 0 || fail('No dirty narration segments to preview. Use --scenes=scene-id to select one explicitly.');
  const previewAudioDir = join(ctx.tmp, 'preview/audio');
  const previewSegmentsDir = join(previewAudioDir, 'segments');
  mkdirSync(previewSegmentsDir, {recursive: true});
  const currentSegmentsDir = join(ctx.current, 'audio/segments');
  const selectedSegments = new Set(selected.map((task) => task.scene.narration.segmentId));
  for (const source of walkFiles(currentSegmentsDir)) {
    const target = join(previewSegmentsDir, source.slice(currentSegmentsDir.length + 1));
    const selectedSource = [...selectedSegments].some((segment) => target.endsWith(`/${segment}.mp3`)
      || target.endsWith(`/${segment}.srt`)
      || target.endsWith(`/${segment}.txt`)
      || target.endsWith(`/${segment}_norm.mp3`));
    if (selectedSource) {
      rmSync(target, {force: true});
      continue;
    }
    if (source.endsWith('.mp3')) materializeView(source, target);
    else copyAtomically(source, target);
  }
  const segmentIds = selected.map((task) => task.scene.narration.segmentId);
  const bgm = bgmPath(ctx);
  bgm || fail('Audio preview requires the current course BGM.');
  console.log(`PREVIEW AUDIO ${segmentIds.join(', ')}`);
  await run(join(REMOTION, 'scripts/git-course-build-voiceover.sh'), [ctx.episode.episodeId], {
    env: {
      AUDIO_DIR: previewAudioDir,
      TMP_DIR: join(ctx.tmp, 'preview/audio-build'),
      BGM_FILE: bgm,
      TTS_SEGMENTS: segmentIds.join(','),
      NORMALIZE_SEGMENTS: segmentIds.join(','),
      TTS_JOBS: 'all',
      NORMALIZE_JOBS: 'all',
      SKIP_TTS: '0',
      SKIP_NORM: '0',
      SKIP_REMUX: '1',
    },
    log: join(ctx.tmp, 'preview/audio.log'),
  });
  const manifest = {schemaVersion: 1, episodeId: ctx.episode.episodeId, updatedAt: new Date().toISOString(), config: ttsConfig(), segments: {}};
  for (const task of selected) {
    const segment = task.scene.narration.segmentId;
    const raw = join(previewSegmentsDir, `${segment}.mp3`);
    const srt = join(previewSegmentsDir, `${segment}.srt`);
    const textPath = join(previewSegmentsDir, `${segment}.txt`);
    const norm = join(previewSegmentsDir, `${segment}_norm.mp3`);
    for (const path of [raw, srt, textPath, norm]) existsSync(path) || fail(`Audio preview output missing: ${path}`);
    validateTtsTextArtifacts(task, srt, textPath, norm);
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', norm], {encoding: 'utf8'}).trim());
    validateNarrationDuration(task, duration);
    const voiceEnd = task.scene.narration.voiceStart + duration;
    const sceneEnd = task.scene.start + task.scene.duration;
    voiceEnd <= sceneEnd || fail(`${segment}: voice ends at ${voiceEnd.toFixed(3)}s after scene end ${sceneEnd}s`);
    mkdirSync(task.cas.speechDir, {recursive: true});
    mkdirSync(task.cas.normalizedDir, {recursive: true});
    copyAtomically(raw, task.cas.raw);
    copyAtomically(srt, task.cas.srt);
    copyAtomically(textPath, task.cas.text);
    copyAtomically(norm, task.cas.norm);
    writeJson(task.cas.speechMetadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, rawSha256: shaFile(raw), srtSha256: shaFile(srt)});
    writeJson(task.cas.metadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, normalizedFingerprint: task.cas.normalized, sha256: shaFile(norm)});
    materializeView(task.cas.raw, raw);
    copyAtomically(task.cas.srt, srt);
    copyAtomically(task.cas.text, textPath);
    materializeView(task.cas.norm, norm);
    manifest.segments[segment] = {sceneId: task.scene.id, text: task.scene.narration.text, durationSeconds: duration, voiceStart: task.scene.narration.voiceStart, voiceEnd, sceneEnd, srtPath: rel(srt), audioPath: rel(norm), materialization: 'hardlink-or-copy'};
    console.log(`PASS  audio ${segment}: ${duration.toFixed(3)}s, ends ${voiceEnd.toFixed(3)}s <= ${sceneEnd}s`);
  }
  writeJson(join(previewAudioDir, 'manifest.json'), manifest);
  console.log(`READY audio preview: ${rel(join(previewAudioDir, 'mix.m4a'))}`);
};

const main = async () => {
  const ctx = loadContext();
  if (COMMAND === 'plan') printPlan(ctx, plan(ctx));
  else if (COMMAND === 'fingerprints') printFingerprints(ctx, plan(ctx));
  else if (COMMAND === 'status') status(ctx);
  else if (COMMAND === 'clean') await withActivity(ctx, 'clean', () => cleanWorkspace(ctx));
  else if (COMMAND === 'gc') await withActivity(ctx, 'gc', () => garbageCollect(ctx));
  else if (COMMAND === 'preview') await withActivity(ctx, 'preview', () => preview(ctx));
  else if (COMMAND === 'preview-audio') await withActivity(ctx, 'preview-audio', () => previewAudio(ctx));
  else if (COMMAND === 'build') await withActivity(ctx, 'build', () => build(ctx));
  else if (COMMAND === 'audit') await withActivity(ctx, 'audit', async () => {
    const result = await auditArtifact(ctx, candidatePath(ctx, 'main'), 'main');
    if (result.verdict !== 'fail') removeTargets(taskDirectories(ctx, 'main'), {apply: true, label: 'main task cleanup'});
  });
  else if (COMMAND === 'approve') await withActivity(ctx, 'approve', () => approve(ctx, 'main'));
  else if (COMMAND === 'promote') await withActivity(ctx, 'promote', () => promote(ctx));
  else if (COMMAND === 'release-build') await withActivity(ctx, 'release-build', () => releaseBuild(ctx));
  else if (COMMAND === 'release-audit') await withActivity(ctx, 'release-audit', async () => {
    const result = await auditArtifact(ctx, candidatePath(ctx, 'release'), 'release');
    if (result.verdict !== 'fail') removeTargets(taskDirectories(ctx, 'release'), {apply: true, label: 'release task cleanup'});
  });
  else if (COMMAND === 'release-approve') await withActivity(ctx, 'release-approve', () => approve(ctx, 'release'));
  else if (COMMAND === 'publish') await withActivity(ctx, 'publish', () => publish(ctx));
  else fail(`Unknown command: ${COMMAND}`);
};

main().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exitCode = 1;
});
