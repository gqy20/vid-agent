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

const visualBaseHash = (ctx) => hashFiles([
  ...walkFiles(join(REMOTION, 'src/videos/git-course'), (path) => /\.(?:ts|tsx)$/.test(path)),
  join(REMOTION, 'src/fonts.css'),
  ...walkFiles(join(REMOTION, 'public/git-course'), (path) => !path.endsWith('.srt')),
]);

const sceneFingerprint = (ctx, scene, baseHash) => {
  const {narration: _narration, ...visualScene} = scene;
  return sha(JSON.stringify({schema: 1, baseHash, durationSeconds: ctx.episode.durationSeconds, scene: visualScene, fps: FPS, width: 1920, height: 1080}));
};

const ttsConfig = () => ({
  model: process.env.TTS_MODEL ?? 'speech-2.8-hd',
  voice: process.env.TTS_VOICE ?? 'Chinese (Mandarin)_Gentleman',
  language: process.env.TTS_LANGUAGE ?? 'zh',
  speed: process.env.TTS_SPEED ?? '1.25',
  normalization: 'acompressor-v1+loudnorm-I-20-TP-3-LRA7',
});

const ttsFingerprint = (scene) => sha(JSON.stringify({schema: 1, segmentId: scene.narration.segmentId, text: scene.narration.text, config: ttsConfig()}));

const bgmPath = (ctx) => {
  const configured = process.env.BGM_FILE ? resolve(REMOTION, process.env.BGM_FILE) : null;
  const candidates = [configured, join(ctx.current, 'audio/bgm.mp3'), join(ctx.current, 'audio/bgm_180.mp3')].filter(Boolean);
  return candidates.find((path) => existsSync(path)) ?? null;
};

const audioFingerprint = (ctx, buildPlan) => {
  const bgm = bgmPath(ctx);
  return sha(JSON.stringify({
    schema: 1,
    tts: buildPlan.tts.map((task) => ({segmentId: task.scene.narration.segmentId, fingerprint: task.fingerprint, voiceStart: task.scene.narration.voiceStart})),
    bgm: bgm ? {path: rel(bgm), sha256: shaFile(bgm)} : null,
    volume: process.env.BGM_VOLUME ?? '0.05',
  }));
};

const plan = (ctx) => {
  const baseHash = visualBaseHash(ctx);
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
    return {scene, index, fingerprint, hit, cached};
  });
  const tts = ctx.episode.scenes.map((scene) => {
    const fingerprint = ttsFingerprint(scene);
    const cached = ctx.state.tts?.[scene.narration.segmentId];
    const norm = join(ctx.current, 'audio/segments', `${scene.narration.segmentId}_norm.mp3`);
    return {scene, fingerprint, hit: cached?.fingerprint === fingerprint && existsSync(norm)};
  });
  return {baseHash, scenes, tts};
};

const printPlan = (ctx, buildPlan) => {
  console.log(`Git Course · ${ctx.episode.episodeId}`);
  for (const task of buildPlan.scenes) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} render ${task.scene.id}`);
  for (const task of buildPlan.tts) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} tts    ${task.scene.narration.segmentId}`);
};

const renderScene = async (ctx, task, dirtyCount) => {
  const scene = task.scene;
  const index = task.index + 1;
  const start = scene.start * FPS;
  const end = (scene.start + scene.duration) * FPS - 1;
  const taskDir = join(ctx.build, 'tasks', `render-${scene.id}`);
  const ranges = join(taskDir, 'range.tsv');
  rmSync(taskDir, {recursive: true, force: true});
  mkdirSync(taskDir, {recursive: true});
  writeFileSync(ranges, `${index}\t${start}\t${end}\n`);
  const maxConcurrency = Number(FLAGS.get('render-concurrency') ?? Math.max(1, Math.floor(cpus().length / Math.max(1, dirtyCount))));
  await run(join(REMOTION, 'scripts/render-ranges.sh'), [getComposition(ctx.episode), ctx.episode.episodeId, String(ctx.episode.durationSeconds * FPS), String(scene.duration * FPS)], {
    env: {
      RANGES_FILE: ranges,
      RUN_DIR: taskDir,
      CLEAN_RUN_DIR: '0',
      SKIP_CONCAT: '1',
      AUDIT_SEGMENTS: '1',
      SEGMENT_AUDIT_JOBS: 'all',
      JOBS: '1',
      CONCURRENCY: String(maxConcurrency),
      MUTED: '1',
    },
    log: join(ctx.build, 'logs', `render-${scene.id}.log`),
  });
  const rendered = readdirSync(join(taskDir, 'segments')).filter((name) => name.endsWith('.mp4'));
  rendered.length === 1 || fail(`${scene.id}: expected one rendered segment, found ${rendered.length}`);
  const cacheDir = join(ctx.cache, 'scenes');
  mkdirSync(cacheDir, {recursive: true});
  const cachePath = join(cacheDir, `${String(index).padStart(2, '0')}_${scene.id.replaceAll('-', '_')}_${task.fingerprint.slice(0, 12)}.mp4`);
  copyFileSync(join(taskDir, 'segments', rendered[0]), `${cachePath}.partial`);
  renameSync(`${cachePath}.partial`, cachePath);
  ctx.state.scenes[scene.id] = {fingerprint: task.fingerprint, path: rel(cachePath), sha256: shaFile(cachePath), updatedAt: new Date().toISOString()};
  console.log(`PASS  render ${scene.id}`);
  return cachePath;
};

const buildAudio = async (ctx, buildPlan) => {
  const dirty = buildPlan.tts.filter((task) => !task.hit);
  const ids = dirty.map((task) => task.scene.narration.segmentId);
  const mainCandidate = join(ctx.build, 'candidate', `${ctx.episode.episodeId}.mp4`);
  const env = {
    TTS_SEGMENTS: ids.join(','),
    TTS_JOBS: 'all',
    NORMALIZE_JOBS: 'all',
    SKIP_TTS: ids.length === 0 ? '1' : '0',
    SKIP_NORM: ids.length === 0 ? '1' : '0',
    SKIP_REMUX: '1',
  };
  await run(join(REMOTION, 'scripts/git-course-build-voiceover.sh'), [ctx.episode.episodeId], {env, log: join(ctx.build, 'logs/audio.log')});
  for (const task of buildPlan.tts) {
    const segment = task.scene.narration.segmentId;
    const norm = join(ctx.current, 'audio/segments', `${segment}_norm.mp3`);
    existsSync(norm) || fail(`Missing normalized segment: ${norm}`);
    ctx.state.tts[segment] = {fingerprint: task.fingerprint, path: rel(norm), sha256: shaFile(norm), updatedAt: new Date().toISOString()};
  }
  ctx.state.audioFingerprint = audioFingerprint(ctx, buildPlan);
  return {mix: join(ctx.current, 'audio/mix.m4a'), mainCandidate};
};

const recoverValidTtsState = (ctx, buildPlan) => {
  for (const task of buildPlan.tts) {
    const scene = task.scene;
    const segment = scene.narration.segmentId;
    const norm = join(ctx.current, 'audio/segments', `${segment}_norm.mp3`);
    if (!existsSync(norm)) continue;
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
  writeFileSync(manifest, ordered.map((item) => `file '${item.path.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  const silent = join(candidateDir, `${ctx.episode.episodeId}-silent.mp4`);
  const candidate = join(candidateDir, `${ctx.episode.episodeId}.mp4`);
  await run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', manifest, '-c', 'copy', silent], {log: join(ctx.build, 'logs/assemble-video.log')});
  await run('ffmpeg', ['-nostdin', '-y', '-i', silent, '-i', audio.mix, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-f', 'mp4', `${candidate}.partial`], {log: join(ctx.build, 'logs/assemble-main.log')});
  renameSync(`${candidate}.partial`, candidate);
  const artifact = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    createdAt: new Date().toISOString(),
    path: rel(candidate),
    sha256: shaFile(candidate),
    inputFingerprint: sha(JSON.stringify({scenes: ordered.map((item) => item.sha256), mix: shaFile(audio.mix)})),
    scenes: ordered.map((item) => ({sceneId: item.sceneId, path: rel(item.path), sha256: item.sha256})),
    audio: {path: rel(audio.mix), sha256: shaFile(audio.mix)},
  };
  writeJson(join(ctx.build, 'artifact-manifest.json'), artifact);
  console.log(`PASS  assemble ${rel(candidate)}`);
  return {candidate, artifact};
};

const probe = (path) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8'}));

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
  let releaseBoundaryFrames = [];
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
    releaseBoundaryFrames = [
      ['intro-end', Math.max(0, introDuration - 0.1)],
      ['main-start', introDuration + 0.1],
      ['main-end', introDuration + mainDuration - 0.1],
      ['outro-start', introDuration + mainDuration + 0.1],
      ['outro-middle', introDuration + mainDuration + outroDuration / 2],
      ['release-end', Math.max(0, duration - 0.2)],
    ];
  }
  const srtFiles = walkFiles(join(ctx.current, 'audio/segments'), (path) => path.endsWith('.srt'));
  const markerLeak = srtFiles.some((path) => /<#|#>/.test(readFileSync(path, 'utf8')));
  if (scope === 'main') checks.push({id: 'subtitle.pause-marker', status: markerLeak ? 'fail' : 'pass', details: markerLeak ? 'pause marker found' : 'clean'});
  const auditDir = join(ctx.build, scope === 'main' ? 'audit' : 'release-audit');
  rmSync(auditDir, {recursive: true, force: true});
  await run(join(REMOTION, 'scripts/audit-video-stills.sh'), [candidate, auditDir], {log: join(ctx.build, 'logs', `audit-${scope}.log`)});
  if (releaseBoundaryFrames.length > 0) {
    const boundaryDir = join(auditDir, 'boundaries');
    mkdirSync(boundaryDir, {recursive: true});
    await Promise.all(releaseBoundaryFrames.map(([name, second]) => run('ffmpeg', ['-nostdin', '-y', '-ss', String(second), '-i', candidate, '-frames:v', '1', join(boundaryDir, `${name}.jpg`)])));
  }
  checks.push({id: 'visual.human-review', status: 'needs_review', details: rel(join(auditDir, 'contact-16.jpg'))});
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope,
    artifact: rel(candidate),
    artifactSha256: shaFile(candidate),
    inputFingerprint: scope === 'main' && existsSync(join(ctx.build, 'artifact-manifest.json')) ? json(join(ctx.build, 'artifact-manifest.json')).inputFingerprint : shaFile(candidate),
    createdAt: new Date().toISOString(),
    verdict: machineFailed ? 'fail' : 'needs_review',
    checks,
    evidence: {
      contactSheet: rel(join(auditDir, 'contact-16.jpg')),
      frames: rel(join(auditDir, 'frames')),
      ...(releaseBoundaryFrames.length > 0 ? {boundaries: rel(join(auditDir, 'boundaries'))} : {}),
    },
  };
  writeJson(join(auditDir, 'verdict.json'), verdict);
  console.log(`${machineFailed ? 'FAIL' : 'WAIT'}  audit ${scope}: ${verdict.verdict}`);
  return verdict;
};

const verdictPath = (ctx, scope) => join(ctx.build, scope === 'main' ? 'audit/verdict.json' : 'release-audit/verdict.json');
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
  mkdirSync(dirname(out), {recursive: true});
  await run(join(REMOTION, 'scripts/git-course-publish-episode.sh'), [ctx.episode.episodeId, currentMain], {env: {OUT_FILE: out, GIT_COURSE_ORCHESTRATED: '1'}, log: join(ctx.build, 'logs/release-build.log')});
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
  execFileSync('node', ['scripts/git-course.mjs', 'generate'], {cwd: REMOTION, stdio: 'inherit'});
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  const dirtyScenes = buildPlan.scenes.filter((task) => !task.hit);
  const renderPromise = Promise.all(dirtyScenes.map((task) => renderScene(ctx, task, dirtyScenes.length)));
  const audioPromise = buildAudio(ctx, buildPlan);
  const [renderResult, audioResult] = await Promise.allSettled([renderPromise, audioPromise]);
  if (audioResult.status === 'rejected') recoverValidTtsState(ctx, buildPlan);
  writeJson(ctx.statePath, ctx.state);
  const failures = [renderResult, audioResult].filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    const messages = failures.map((result) => result.reason?.message ?? String(result.reason));
    fail(`Independent tasks finished with ${failures.length} failure(s):\n${messages.join('\n')}`);
  }
  const assembled = await assembleMain(ctx, buildPlan, audioResult.value);
  await auditArtifact(ctx, assembled.candidate, 'main');
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
