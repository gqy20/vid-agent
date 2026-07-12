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
  statSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {performance} from 'node:perf_hooks';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REMOTION = join(ROOT, 'remotion');
const EPISODES = join(ROOT, 'git-course/episodes');
const FPS = 30;
const COMMAND = process.argv[2] ?? 'status';
const EPISODE_ID = process.argv[3];
const FLAGS = new Map(process.argv.slice(4).filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, value = '1'] = arg.slice(2).split('=', 2);
  return [key, value];
}));

const fail = (message) => {
  throw new Error(message);
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
  const episodePath = join(EPISODES, `${EPISODE_ID}.json`);
  existsSync(episodePath) || fail(`Unknown episode: ${EPISODE_ID}`);
  const episode = json(episodePath);
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
  return {path, source, shared, blocks};
};

const visualBaseHash = (ctx) => {
  const courseRoot = join(REMOTION, 'src/videos/git-course');
  const episodeNumber = ctx.episode.episodeId.slice(0, 4);
  const sharedSources = walkFiles(courseRoot, (path) => {
    if (!/\.(?:ts|tsx)$/.test(path)) return false;
    if (path.includes('/episodes/')) return false;
    // This file contains every episode and would invalidate unrelated caches.
    if (path.endsWith('/data/episodeTimelines.generated.ts')) return false;
    return true;
  });
  const episodeSource = episodeSourceParts(ctx);
  const episodeAssets = walkFiles(join(REMOTION, 'public/git-course'), (path) => path.includes(`/manim/${episodeNumber}/`));
  const fileHash = hashFiles([...sharedSources, join(REMOTION, 'src/fonts.css'), ...episodeAssets, ...(episodeSource.blocks.size === 0 ? [episodeSource.path] : [])]);
  return sha(JSON.stringify({schema: 2, fileHash, sharedEpisodeSource: episodeSource.blocks.size > 0 ? episodeSource.shared : null}));
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
  schema: 2,
  speechFingerprint: speechFingerprint(scene),
  normalization: ttsConfig().normalization,
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

const renderScenes = async (ctx, tasks) => {
  if (tasks.length === 0) return [];
  const logicalCpus = cpus().length;
  const concurrency = Number(FLAGS.get('render-concurrency') ?? Math.max(1, Math.floor(logicalCpus / tasks.length)));
  const planPath = join(ctx.build, 'render-plan.json');
  const planned = tasks.map((task) => {
    const scene = task.scene;
    const index = task.index + 1;
    const start = scene.start * FPS;
    const end = (scene.start + scene.duration) * FPS - 1;
    const taskDir = join(ctx.build, 'tasks', `render-${scene.id}`);
    const output = join(taskDir, 'segments', `${String(index).padStart(3, '0')}_${String(start).padStart(6, '0')}-${String(end).padStart(6, '0')}.mp4`);
    rmSync(taskDir, {recursive: true, force: true});
    mkdirSync(dirname(output), {recursive: true});
    return {task, scene, index, start, end, taskDir, output, concurrency};
  });
  writeJson(planPath, {
    schemaVersion: 1,
    entryPoint: join(REMOTION, 'src/index.ts'),
    compositionId: getComposition(ctx.episode),
    logicalCpus,
    timeoutInMilliseconds: 120000,
    telemetryPath: join(ctx.build, 'telemetry/render-scenes.json'),
    tasks: planned.map(({scene, start, end, output, concurrency: taskConcurrency}) => ({sceneId: scene.id, start, end, output, concurrency: taskConcurrency})),
  });
  await run('node', [join(REMOTION, 'scripts/git-course-render-scenes.mjs'), planPath], {
    log: join(ctx.build, 'logs/render-scenes.log'),
  });
  await Promise.all(planned.map(async ({taskDir}) => {
    await run(join(REMOTION, 'scripts/audit-range-segments.sh'), [taskDir, join(taskDir, 'segment-audits'), 'all']);
  }));
  const cacheDir = join(ctx.cache, 'scenes');
  mkdirSync(cacheDir, {recursive: true});
  return planned.map(({task, scene, index, output, end, start}) => {
    const frames = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames', '-of', 'default=nw=1:nk=1', output], {encoding: 'utf8'}).trim());
    frames === end - start + 1 || fail(`${scene.id}: expected ${end - start + 1} frames, found ${frames}`);
    const cachePath = join(cacheDir, `${String(index).padStart(2, '0')}_${scene.id.replaceAll('-', '_')}_${task.fingerprint.slice(0, 12)}.mp4`);
    copyFileSync(output, `${cachePath}.partial`);
    renameSync(`${cachePath}.partial`, cachePath);
    ctx.state.scenes[scene.id] = {fingerprint: task.fingerprint, path: rel(cachePath), sha256: shaFile(cachePath), updatedAt: new Date().toISOString()};
    console.log(`PASS  render ${scene.id}`);
    return cachePath;
  });
};

const buildAudio = async (ctx, buildPlan) => {
  const segmentsDir = join(ctx.current, 'audio/segments');
  mkdirSync(segmentsDir, {recursive: true});
  for (const task of buildPlan.tts) {
    const segment = task.scene.narration.segmentId;
    const targets = {
      raw: join(segmentsDir, `${segment}.mp3`),
      srt: join(segmentsDir, `${segment}.srt`),
      text: join(segmentsDir, `${segment}.txt`),
      norm: join(segmentsDir, `${segment}_norm.mp3`),
    };
    const sourceMatches = existsSync(targets.text) && readFileSync(targets.text, 'utf8').trim() === task.scene.narration.text.trim();
    if (sourceMatches && existsSync(targets.raw) && existsSync(targets.srt) && (!existsSync(task.cas.raw) || !existsSync(task.cas.srt))) {
      mkdirSync(task.cas.speechDir, {recursive: true});
      copyFileSync(targets.raw, task.cas.raw);
      copyFileSync(targets.srt, task.cas.srt);
      copyFileSync(targets.text, task.cas.text);
      writeJson(task.cas.speechMetadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, rawSha256: shaFile(targets.raw), srtSha256: shaFile(targets.srt)});
    }
    const previous = ctx.state.tts[segment];
    if (sourceMatches && existsSync(targets.norm) && previous?.sha256 === shaFile(targets.norm) && !existsSync(task.cas.norm)) {
      mkdirSync(task.cas.normalizedDir, {recursive: true});
      copyFileSync(targets.norm, task.cas.norm);
      writeJson(task.cas.metadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, normalizedFingerprint: task.cas.normalized, sha256: shaFile(targets.norm), migrated: true});
    }
    if (existsSync(task.cas.raw) && !existsSync(targets.raw)) copyFileSync(task.cas.raw, targets.raw);
    if (existsSync(task.cas.srt) && !existsSync(targets.srt)) copyFileSync(task.cas.srt, targets.srt);
    if (existsSync(task.cas.text) && !existsSync(targets.text)) copyFileSync(task.cas.text, targets.text);
    if (existsSync(task.cas.norm) && (!existsSync(targets.norm) || shaFile(targets.norm) !== shaFile(task.cas.norm))) copyFileSync(task.cas.norm, targets.norm);
    if (existsSync(targets.norm) && existsSync(task.cas.norm) && shaFile(targets.norm) === shaFile(task.cas.norm)) {
      ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(targets.norm), sha256: shaFile(targets.norm), updatedAt: new Date().toISOString()};
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
  const mix = join(ctx.current, 'audio/mix.m4a');
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
  const env = {
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
    const norm = join(ctx.current, 'audio/segments', `${segment}_norm.mp3`);
    existsSync(norm) || fail(`Missing normalized segment: ${norm}`);
    ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(norm), sha256: shaFile(norm), updatedAt: new Date().toISOString()};
    const raw = join(segmentsDir, `${segment}.mp3`);
    const srt = join(segmentsDir, `${segment}.srt`);
    const textPath = join(segmentsDir, `${segment}.txt`);
    for (const path of [raw, srt]) existsSync(path) || fail(`Missing TTS cache input: ${path}`);
    mkdirSync(task.cas.speechDir, {recursive: true});
    mkdirSync(task.cas.normalizedDir, {recursive: true});
    copyFileSync(raw, task.cas.raw);
    copyFileSync(srt, task.cas.srt);
    if (existsSync(textPath)) copyFileSync(textPath, task.cas.text);
    writeJson(task.cas.speechMetadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, rawSha256: shaFile(raw), srtSha256: shaFile(srt)});
    copyFileSync(norm, task.cas.norm);
    writeJson(task.cas.metadata, {schemaVersion: 1, speechFingerprint: task.cas.speech, normalizedFingerprint: task.cas.normalized, sha256: shaFile(norm)});
  }
  ctx.state.audioFingerprint = fingerprint;
  ctx.state.audioMixSha256 = shaFile(mix);
  return {mix, mainCandidate};
};

const recoverValidTtsState = (ctx, buildPlan) => {
  for (const task of buildPlan.tts) {
    const scene = task.scene;
    const segment = scene.narration.segmentId;
    const norm = join(ctx.current, 'audio/segments', `${segment}_norm.mp3`);
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
  const inputFingerprint = sha(JSON.stringify({scenes: ordered.map((item) => item.sha256), mix: shaFile(audio.mix)}));
  const artifactPath = join(ctx.build, 'artifact-manifest.json');
  if (existsSync(candidate) && existsSync(artifactPath)) {
    const cached = json(artifactPath);
    if (cached.inputFingerprint === inputFingerprint && cached.sha256 === shaFile(candidate)) {
      console.log(`HIT   assemble ${rel(candidate)}`);
      return {candidate, artifact: cached};
    }
  }
  writeFileSync(manifest, ordered.map((item) => `file '${item.path.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  await run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', manifest, '-i', audio.mix, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-f', 'mp4', `${candidate}.partial`], {log: join(ctx.build, 'logs/assemble-main.log')});
  renameSync(`${candidate}.partial`, candidate);
  const artifact = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    createdAt: new Date().toISOString(),
    path: rel(candidate),
    sha256: shaFile(candidate),
    inputFingerprint,
    scenes: ordered.map((item) => ({sceneId: item.sceneId, path: rel(item.path), sha256: item.sha256})),
    audio: {path: rel(audio.mix), sha256: shaFile(audio.mix)},
  };
  writeJson(artifactPath, artifact);
  console.log(`PASS  assemble ${rel(candidate)}`);
  return {candidate, artifact};
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
  const duration = Number(info.format.duration);
  const checks = [
    {id: 'video.stream', status: video ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} ${video.r_frame_rate}` : 'missing'},
    {id: 'audio.stream', status: audio ? 'pass' : 'fail', details: audio ? `${audio.codec_name} ${audio.sample_rate}Hz` : 'missing'},
    {id: 'video.resolution', status: video?.width === 1920 && video?.height === 1080 ? 'pass' : 'fail', details: video ? `${video.width}x${video.height}` : 'missing'},
    {id: 'video.fps', status: video?.r_frame_rate === '30/1' ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    ...(expected === null ? [] : [{id: 'duration.main', status: Math.abs(duration - expected) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${expected}s`}]),
  ];
  const plan = samplingPlan(ctx, scope, duration);
  const artifactSha256 = shaFile(candidate);
  const auditFingerprint = sha(JSON.stringify({
    schema: 2,
    artifactSha256,
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
  const srtFiles = walkFiles(join(ctx.current, 'audio/segments'), (path) => path.endsWith('.srt'));
  const markerLeak = srtFiles.some((path) => /<#|#>/.test(readFileSync(path, 'utf8')));
  if (scope === 'main') checks.push({id: 'subtitle.pause-marker', status: markerLeak ? 'fail' : 'pass', details: markerLeak ? 'pause marker found' : 'clean'});
  const auditDir = join(ctx.build, 'audit', scope);
  const cachedVerdictPath = join(auditDir, 'verdict.json');
  if (existsSync(cachedVerdictPath) && existsSync(join(auditDir, 'report.html'))) {
    const cached = json(cachedVerdictPath);
    if (cached.auditFingerprint === auditFingerprint && cached.artifactSha256 === artifactSha256) {
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
  mkdirSync(join(ctx.current, 'scenes'), {recursive: true});
  copyFileSync(artifact, `${join(ctx.current, `${ctx.episode.episodeId}.mp4`)}.partial`);
  renameSync(`${join(ctx.current, `${ctx.episode.episodeId}.mp4`)}.partial`, join(ctx.current, `${ctx.episode.episodeId}.mp4`));
  const manifest = json(join(ctx.build, 'artifact-manifest.json'));
  for (const [index, item] of manifest.scenes.entries()) {
    const target = join(ctx.current, 'scenes', `${String(index + 1).padStart(2, '0')}_${item.sceneId.replaceAll('-', '_')}.mp4`);
    copyFileSync(join(ROOT, item.path), `${target}.partial`);
    renameSync(`${target}.partial`, target);
  }
  writeJson(join(ctx.current, 'audit/verdict.json'), verdict);
  console.log(`PASS  promote ${rel(join(ctx.current, `${ctx.episode.episodeId}.mp4`))}`);
};

const releaseBuild = async (ctx) => {
  const currentMain = join(ctx.current, `${ctx.episode.episodeId}.mp4`);
  const currentVerdict = join(ctx.current, 'audit/verdict.json');
  existsSync(currentVerdict) || fail('Current main has no promoted audit verdict.');
  const gate = json(currentVerdict);
  gate.verdict === 'pass' && gate.artifactSha256 === shaFile(currentMain) || fail('Current main audit gate is stale or not passed.');
  const out = candidatePath(ctx, 'release');
  const intro = join(REMOTION, 'renders/git-course/visible-system-intro/current/visible-system-intro.mp4');
  const introAudio = join(REMOTION, 'renders/git-course/visible-system-intro/current/audio/intro-bgm.m4a');
  const outro = join(REMOTION, 'renders/git-course/outro/current/ref-lightbox-outro.mp4');
  const outroAudio = join(REMOTION, 'renders/git-course/outro/current/audio/outro-bgm.m4a');
  const inputs = [intro, introAudio, currentMain, outro, outroAudio];
  for (const path of inputs) existsSync(path) || fail(`Release input missing: ${path}`);
  const inputFingerprint = sha(JSON.stringify({
    schema: 2,
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
  await run(join(REMOTION, 'scripts/git-course-publish-episode.sh'), [ctx.episode.episodeId, currentMain], {env: {OUT_FILE: out, GIT_COURSE_ORCHESTRATED: '1'}, log: join(ctx.build, 'logs/release-build.log')});
  writeJson(manifestPath, {schemaVersion: 1, inputFingerprint, path: rel(out), sha256: shaFile(out), createdAt: new Date().toISOString()});
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
  execFileSync('node', ['scripts/git-course.mjs', 'generate'], {cwd: REMOTION, stdio: 'inherit'});
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
      auditSeconds: Number(((finishedAt - assembledAt) / 1000).toFixed(3)),
      totalSeconds: Number(((finishedAt - buildStartedAt) / 1000).toFixed(3)),
    },
    auditVerdict: audit.verdict,
  });
};

const status = (ctx) => {
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  for (const scope of ['main', 'release']) {
    const path = verdictPath(ctx, scope);
    console.log(`${scope.padEnd(7)} verdict: ${existsSync(path) ? json(path).verdict : 'missing'}`);
  }
};

const main = async () => {
  const ctx = loadContext();
  if (COMMAND === 'plan') printPlan(ctx, plan(ctx));
  else if (COMMAND === 'status') status(ctx);
  else if (COMMAND === 'build') await build(ctx);
  else if (COMMAND === 'audit') await auditArtifact(ctx, candidatePath(ctx, 'main'), 'main');
  else if (COMMAND === 'approve') approve(ctx, 'main');
  else if (COMMAND === 'promote') promote(ctx);
  else if (COMMAND === 'release-build') await releaseBuild(ctx);
  else if (COMMAND === 'release-audit') await auditArtifact(ctx, candidatePath(ctx, 'release'), 'release');
  else if (COMMAND === 'release-approve') approve(ctx, 'release');
  else if (COMMAND === 'publish') publish(ctx);
  else fail(`Unknown command: ${COMMAND}`);
};

main().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exitCode = 1;
});
