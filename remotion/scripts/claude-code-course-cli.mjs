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
  statSync,
  writeFileSync,
} from 'node:fs';
import {spawn} from 'node:child_process';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const REMOTION = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(REMOTION, '..');
const COURSE = join(ROOT, 'claude-code-course');
const EPISODES = join(COURSE, 'episodes');
const PUBLIC_AUDIO = join(REMOTION, 'public/claude-code-course/audio');
const COMMAND = process.argv[2] ?? 'status';
const EPISODE_ID = process.argv[3] ?? 'ep01-install-first-start';
const FLAGS = new Map(process.argv.slice(4).filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, ...rest] = arg.slice(2).split('=');
  return [key, rest.length > 0 ? rest.join('=') : 'true'];
}));

const fail = (message) => {
  throw new Error(message);
};
const sha = (value) => createHash('sha256').update(value).digest('hex');
const shaFile = (path) => sha(readFileSync(path));
const rel = (path) => relative(ROOT, path);
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const run = (command, args, {cwd = REMOTION, log} = {}) => new Promise((resolvePromise, rejectPromise) => {
  mkdirSync(dirname(log), {recursive: true});
  const child = spawn(command, args, {cwd, env: process.env, stdio: ['ignore', 'pipe', 'pipe']});
  const chunks = [];
  child.stdout.on('data', (chunk) => chunks.push(chunk));
  child.stderr.on('data', (chunk) => chunks.push(chunk));
  child.on('error', rejectPromise);
  child.on('close', (code) => {
    const output = Buffer.concat(chunks).toString('utf8');
    writeFileSync(log, output, 'utf8');
    if (code === 0) resolvePromise(output);
    else rejectPromise(new Error(`${command} exited ${code}; see ${rel(log)}`));
  });
});

const loadEpisode = () => {
  const path = join(EPISODES, `${EPISODE_ID}.json`);
  existsSync(path) || fail(`Episode not found: ${rel(path)}`);
  const episode = json(path);
  episode.episodeId === EPISODE_ID || fail(`Episode id mismatch: ${episode.episodeId}`);
  episode.status === 'draft' || fail(`${EPISODE_ID}: audio preview is only enabled for draft episodes`);
  episode.fps === 30 || fail(`${EPISODE_ID}: fps must be 30`);
  episode.audio?.model === 'speech-2.8-hd' || fail(`${EPISODE_ID}: audio.model must be speech-2.8-hd`);
  episode.audio?.voice === 'Chinese (Mandarin)_Gentleman' || fail(`${EPISODE_ID}: unexpected audio.voice`);
  episode.audio?.language === 'zh' || fail(`${EPISODE_ID}: audio.language must be zh`);
  episode.audio?.speed === 1.25 || fail(`${EPISODE_ID}: audio.speed must be 1.25`);
  const segmentIds = new Set();
  let cursor = 0;
  for (const scene of episode.scenes) {
    scene.start === cursor || fail(`${scene.id}: expected start ${cursor}, got ${scene.start}`);
    Number.isFinite(scene.duration) && scene.duration > 0 || fail(`${scene.id}: invalid duration`);
    const narration = scene.narration;
    narration && typeof narration.text === 'string' && narration.text.trim() || fail(`${scene.id}: narration text is required`);
    /^[0-9]{2}_[a-z0-9_]+$/.test(narration.segmentId) || fail(`${scene.id}: invalid narration segment id`);
    !segmentIds.has(narration.segmentId) || fail(`${scene.id}: duplicate narration segment id`);
    segmentIds.add(narration.segmentId);
    narration.voiceStart >= scene.start && narration.voiceStart < scene.start + scene.duration || fail(`${scene.id}: voiceStart outside scene`);
    cursor += scene.duration;
  }
  cursor === episode.durationSeconds || fail(`${EPISODE_ID}: scene duration sum ${cursor} != ${episode.durationSeconds}`);
  return {episode, path};
};

const context = () => {
  const loaded = loadEpisode();
  const root = join(REMOTION, 'renders/claude-code-course', EPISODE_ID);
  const tmp = join(root, 'tmp');
  const statePath = join(tmp, 'state.json');
  return {
    ...loaded,
    root,
    tmp,
    cache: join(tmp, 'cache'),
    preview: join(tmp, 'preview/audio'),
    source: join(tmp, 'narration-source'),
    tasks: join(tmp, 'build/tasks'),
    logs: join(tmp, 'build/logs/tts'),
    publicAudio: join(PUBLIC_AUDIO, EPISODE_ID),
    statePath,
    state: existsSync(statePath) ? json(statePath) : {schemaVersion: 1, episodeId: EPISODE_ID, tts: {}},
  };
};

const narrationSource = (ctx) => {
  mkdirSync(ctx.source, {recursive: true});
  const rows = ['# segment_id\tvoice_start_seconds\tscene_end_seconds'];
  for (const scene of ctx.episode.scenes) {
    const {segmentId, voiceStart, text} = scene.narration;
    writeFileSync(join(ctx.source, `${segmentId}.txt`), `${text.trimEnd()}\n`, 'utf8');
    rows.push(`${segmentId}\t${voiceStart}\t${scene.start + scene.duration}`);
  }
  const manifest = join(ctx.source, 'manifest.tsv');
  writeFileSync(manifest, `${rows.join('\n')}\n`, 'utf8');
  return manifest;
};

const normalizedNarrationText = (value) => value
  .replace(/\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)/gi, '')
  .replace(/<#[^>]+#>/g, '')
  .replace(/[\s，。；;、：:！？?!,.·“”"'‘’（）()\-]/g, '')
  .toLowerCase();

const normalizedSrtText = (value) => value
  .split(/\r?\n/)
  .filter((line) => line.trim() && !/^\d+$/.test(line.trim()) && !line.includes('-->'))
  .join('')
  .replace(/[\s，。；;、：:！？?!,.·“”"'‘’（）()\-]/g, '')
  .toLowerCase();

const canonicalNarrationCues = (value) => value
  .split(/<#[^>]+#>|\n+/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line
    .replace(/^\s*\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)\s*/i, '')
    .replace(/[。；;]+\s*$/u, '')
    .replace(/([\p{Script=Han}A-Za-z0-9])\.\s*$/u, '$1'));

const distributeCanonicalText = (sourceCues, targetCount) => {
  targetCount > 0 || fail('SRT has no timed text cues');
  const units = sourceCues.flatMap((cue, index) => {
    const withBoundary = index < sourceCues.length - 1 && !/[，、：？！!?.,]$/u.test(cue) ? `${cue}，` : cue;
    return withBoundary.match(/[^，、：？！!?.,]+[，、：？！!?.,]?/gu) ?? [withBoundary];
  }).filter(Boolean);
  while (units.length < targetCount) {
    const index = units.reduce((best, unit, current) => unit.length > units[best].length ? current : best, 0);
    const unit = units[index];
    unit.length > 1 || fail(`Cannot distribute narration text across ${targetCount} SRT cues`);
    const midpoint = Math.ceil(unit.length / 2);
    units.splice(index, 1, unit.slice(0, midpoint), unit.slice(midpoint));
  }
  const totalLength = units.reduce((sum, unit) => sum + unit.length, 0);
  const groups = [];
  let unitIndex = 0;
  let consumed = 0;
  for (let groupIndex = 0; groupIndex < targetCount; groupIndex += 1) {
    const remainingGroups = targetCount - groupIndex;
    const targetEnd = totalLength * (groupIndex + 1) / targetCount;
    const group = [];
    while (unitIndex < units.length) {
      const remainingUnits = units.length - unitIndex;
      if (group.length > 0 && remainingUnits === remainingGroups - 1) break;
      const next = units[unitIndex];
      if (group.length > 0 && consumed + next.length > targetEnd) break;
      group.push(next);
      consumed += next.length;
      unitIndex += 1;
    }
    if (group.length === 0) {
      group.push(units[unitIndex]);
      consumed += units[unitIndex].length;
      unitIndex += 1;
    }
    groups.push(group.join(''));
  }
  unitIndex === units.length || fail('Failed to distribute all narration text into SRT cues');
  return groups;
};

const canonicalizeSrt = (scene, srtPath) => {
  const sourceCues = canonicalNarrationCues(scene.narration.text);
  const raw = readFileSync(srtPath, 'utf8').replace(/\r\n/g, '\n').trim();
  const blocks = raw.split(/\n{2,}/).map((block) => block.split('\n'));
  const timedBlocks = blocks.filter((lines) => lines.some((line) => line.includes('-->')));
  const canonical = distributeCanonicalText(sourceCues, timedBlocks.length);
  let cueIndex = 0;
  const rewritten = blocks.map((lines) => {
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex === -1) return lines.join('\n');
    const text = canonical[cueIndex].replace(/[。；;]+\s*$/u, '');
    cueIndex += 1;
    return [...lines.slice(0, timingIndex + 1), text].join('\n');
  });
  writeFileSync(srtPath, `${rewritten.join('\n\n')}\n`, 'utf8');
};

const parseSrtTime = (value) => {
  const match = value.trim().match(/^(\d+):(\d+):(\d+),(\d+)$/);
  match || fail(`Invalid SRT timestamp: ${value}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
};

const parseSrt = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim().split(/\n{2,}/).map((block) => {
  const lines = block.split('\n');
  const timingIndex = lines.findIndex((line) => line.includes('-->'));
  timingIndex >= 0 || fail(`Invalid SRT block in ${rel(path)}`);
  const [from, to] = lines[timingIndex].split('-->').map((value) => value.trim());
  return {from: parseSrtTime(from), to: parseSrtTime(to), text: lines.slice(timingIndex + 1).join('\n').trim()};
}).filter((cue) => cue.text);

const mmxVersion = async (ctx) => (await run('mmx', ['--version'], {log: join(ctx.tmp, 'build/logs/mmx-version.log')})).trim();

const taskFor = (ctx, scene, engineVersion) => {
  const fingerprint = sha(JSON.stringify({
    schema: 2,
    text: scene.narration.text,
    model: ctx.episode.audio.model,
    voice: ctx.episode.audio.voice,
    language: ctx.episode.audio.language,
    speed: ctx.episode.audio.speed,
    engine: engineVersion,
    subtitles: 'mmx-srt+canonical-source-v2',
    normalization: 'acompressor-threshold-22-ratio2+loudnorm-I-20-TP-3-LRA7+alimiter-0.90',
  }));
  const dir = join(ctx.cache, 'tts', fingerprint);
  return {
    scene,
    fingerprint,
    dir,
    raw: join(dir, 'raw.mp3'),
    srt: join(dir, 'subtitles.srt'),
    text: join(dir, 'source.txt'),
    norm: join(dir, 'normalized.mp3'),
    metadata: join(dir, 'metadata.json'),
  };
};

const cacheHit = (task) => {
  if (![task.raw, task.srt, task.text, task.norm, task.metadata].every(existsSync)) return false;
  const metadata = json(task.metadata);
  const duration = Number(metadata.durationSeconds);
  const voiceEnd = task.scene.narration.voiceStart + duration;
  const sceneEnd = task.scene.start + task.scene.duration;
  return metadata.fingerprint === task.fingerprint
    && metadata.normalizedSha256 === shaFile(task.norm)
    && Number.isFinite(duration)
    && voiceEnd <= sceneEnd;
};

const validateArtifacts = (task) => {
  const source = readFileSync(task.text, 'utf8').trim();
  source === task.scene.narration.text.trim() || fail(`${task.scene.narration.segmentId}: source text mismatch`);
  const srt = readFileSync(task.srt, 'utf8');
  !/<#|#>/.test(srt) || fail(`${task.scene.narration.segmentId}: pause marker leaked into SRT`);
  normalizedSrtText(srt) === normalizedNarrationText(task.scene.narration.text) || fail(`${task.scene.narration.segmentId}: SRT text does not match narration`);
  const metadata = json(task.metadata);
  const duration = Number(metadata.durationSeconds);
  Number.isFinite(duration) && duration > 0.5 || fail(`${task.scene.narration.segmentId}: invalid duration`);
  const voiceEnd = task.scene.narration.voiceStart + duration;
  const sceneEnd = task.scene.start + task.scene.duration;
  voiceEnd <= sceneEnd || fail(`${task.scene.narration.segmentId}: voice ends at ${voiceEnd.toFixed(3)}s after scene end ${sceneEnd}s`);
  const cues = parseSrt(task.srt);
  cues.length > 0 || fail(`${task.scene.narration.segmentId}: SRT has no cues`);
  cues.at(-1).to <= duration + 0.25 || fail(`${task.scene.narration.segmentId}: SRT exceeds audio duration`);
  return {duration, voiceEnd, sceneEnd, cues};
};

const generateTask = async (ctx, task, engineVersion) => {
  const segment = task.scene.narration.segmentId;
  const work = join(ctx.tasks, `tts-${segment}-${task.fingerprint.slice(0, 12)}`);
  rmSync(work, {recursive: true, force: true});
  mkdirSync(work, {recursive: true});
  const source = join(ctx.source, `${segment}.txt`);
  const raw = join(work, `${segment}.mp3`);
  const srt = join(work, `${segment}.srt`);
  const norm = join(work, `${segment}_norm.mp3`);
  await run('mmx', [
    'speech', 'synthesize',
    '--model', ctx.episode.audio.model,
    '--voice', ctx.episode.audio.voice,
    '--language', ctx.episode.audio.language,
    '--speed', String(ctx.episode.audio.speed),
    '--text-file', source,
    '--subtitles',
    '--out', raw,
    '--non-interactive',
    '--output', 'json',
    '--quiet',
  ], {log: join(ctx.logs, `${segment}-synthesize.log`)});
  existsSync(raw) || fail(`${segment}: mmx did not create audio`);
  existsSync(srt) || fail(`${segment}: mmx did not create SRT`);
  canonicalizeSrt(task.scene, srt);
  await run('ffmpeg', [
    '-y', '-hide_banner', '-nostats',
    '-i', raw,
    '-af', 'acompressor=threshold=-22dB:ratio=2.0:attack=8:release=120:makeup=1.0,loudnorm=I=-20:TP=-3:LRA=7,alimiter=limit=0.90',
    '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', norm,
  ], {log: join(ctx.logs, `${segment}-normalize.log`)});
  const durationText = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', norm], {log: join(ctx.logs, `${segment}-ffprobe.log`)});
  const duration = Number(durationText.trim());
  Number.isFinite(duration) || fail(`${segment}: cannot determine normalized duration`);
  const partial = `${task.dir}.partial-${process.pid}`;
  rmSync(partial, {recursive: true, force: true});
  mkdirSync(partial, {recursive: true});
  copyFileSync(raw, join(partial, 'raw.mp3'));
  copyFileSync(srt, join(partial, 'subtitles.srt'));
  copyFileSync(source, join(partial, 'source.txt'));
  copyFileSync(norm, join(partial, 'normalized.mp3'));
  writeJson(join(partial, 'metadata.json'), {
    schemaVersion: 1,
    fingerprint: task.fingerprint,
    segmentId: segment,
    sceneId: task.scene.id,
    model: ctx.episode.audio.model,
    voice: ctx.episode.audio.voice,
    language: ctx.episode.audio.language,
    speed: ctx.episode.audio.speed,
    engineVersion,
    rawSha256: shaFile(raw),
    srtSha256: shaFile(srt),
    normalizedSha256: shaFile(norm),
    durationSeconds: duration,
    voiceStart: task.scene.narration.voiceStart,
    voiceEnd: task.scene.narration.voiceStart + duration,
    sceneEnd: task.scene.start + task.scene.duration,
    generatedAt: new Date().toISOString(),
  });
  mkdirSync(dirname(task.dir), {recursive: true});
  if (existsSync(task.dir)) rmSync(task.dir, {recursive: true, force: true});
  renameSync(partial, task.dir);
  const timing = validateArtifacts(task);
  ctx.state.tts[segment] = {
    fingerprint: task.fingerprint,
    path: rel(task.norm),
    sha256: shaFile(task.norm),
    durationSeconds: timing.duration,
    updatedAt: new Date().toISOString(),
  };
  writeJson(ctx.statePath, ctx.state);
  rmSync(work, {recursive: true, force: true});
  return timing;
};

const materialize = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  if (existsSync(target)) {
    if (shaFile(source) === shaFile(target)) return 'existing';
    rmSync(target, {force: true});
  }
  try {
    linkSync(source, target);
    return 'hardlink';
  } catch {
    copyFileSync(source, target);
    return 'copy';
  }
};

const buildCaptionManifest = (ctx, tasks) => {
  const cues = [];
  const segments = [];
  for (const task of tasks) {
    const timing = validateArtifacts(task);
    const segment = task.scene.narration.segmentId;
    segments.push({
      segmentId: segment,
      sceneId: task.scene.id,
      voiceStart: task.scene.narration.voiceStart,
      voiceEnd: timing.voiceEnd,
      durationSeconds: timing.duration,
      audio: `claude-code-course/audio/${EPISODE_ID}/${segment}_norm.mp3`,
      srt: `claude-code-course/audio/${EPISODE_ID}/${segment}.srt`,
      fingerprint: task.fingerprint,
      sha256: shaFile(task.norm),
    });
    for (const cue of timing.cues) {
      cues.push({
        segmentId: segment,
        from: Number((task.scene.narration.voiceStart + cue.from).toFixed(3)),
        to: Number((task.scene.narration.voiceStart + cue.to).toFixed(3)),
        text: cue.text,
      });
    }
  }
  return {
    schemaVersion: 1,
    episodeId: EPISODE_ID,
    generatedAt: new Date().toISOString(),
    source: rel(ctx.path),
    audio: ctx.episode.audio,
    subtitlePolicy: 'Exact canonical narration text on MMX-generated SRT timing; global times include scene voiceStart.',
    segments,
    cues,
  };
};

const materializePreview = (ctx, tasks) => {
  const previewSegments = join(ctx.preview, 'segments');
  const publicSegments = ctx.publicAudio;
  const manifest = buildCaptionManifest(ctx, tasks);
  const materializations = [];
  for (const task of tasks) {
    const segment = task.scene.narration.segmentId;
    for (const [source, name] of [
      [task.raw, `${segment}.mp3`],
      [task.srt, `${segment}.srt`],
      [task.text, `${segment}.txt`],
      [task.norm, `${segment}_norm.mp3`],
    ]) {
      materializations.push({target: rel(join(previewSegments, name)), method: materialize(source, join(previewSegments, name))});
      materializations.push({target: rel(join(publicSegments, name)), method: materialize(source, join(publicSegments, name))});
    }
  }
  writeJson(join(ctx.preview, 'captions.json'), manifest);
  writeJson(join(ctx.publicAudio, 'captions.json'), manifest);
  writeJson(join(ctx.preview, 'manifest.json'), {
    ...manifest,
    ownership: 'Rebuildable preview view backed by tmp/cache/tts; not Candidate or Current.',
    materializations,
  });
  writeJson(join(ctx.publicAudio, 'manifest.json'), {
    ...manifest,
    ownership: 'Rebuildable Remotion public view backed by tmp/cache/tts; not Candidate or Current.',
  });
  return manifest;
};

const resolvePlan = async (ctx) => {
  narrationSource(ctx);
  const engineVersion = await mmxVersion(ctx);
  const tasks = ctx.episode.scenes.map((scene) => taskFor(ctx, scene, engineVersion));
  return {engineVersion, tasks};
};

const printPlan = (ctx, plan) => {
  console.log(`Claude Code Course · ${EPISODE_ID}`);
  for (const task of plan.tasks) console.log(`${cacheHit(task) ? 'HIT  ' : 'BUILD'} tts ${task.scene.narration.segmentId}`);
  console.log('BLOCK candidate/current/release: Claude Code Course unified adapter is not implemented');
};

const audioPreview = async (ctx) => {
  const plan = await resolvePlan(ctx);
  const selectedScenes = (FLAGS.get('scenes') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const selected = plan.tasks.filter((task) => {
    if (selectedScenes.length > 0 && !selectedScenes.includes(task.scene.id)) return false;
    return FLAGS.has('force') || !cacheHit(task);
  });
  for (const sceneId of selectedScenes) plan.tasks.some((task) => task.scene.id === sceneId) || fail(`Unknown scene: ${sceneId}`);
  const initialHits = plan.tasks.filter(cacheHit).length;
  console.log(`TTS tasks: ${selected.length} build, ${initialHits} cache hit, ${plan.tasks.length - selected.length - initialHits} not selected`);
  const settled = await Promise.allSettled(selected.map(async (task) => {
    const timing = await generateTask(ctx, task, plan.engineVersion);
    console.log(`PASS  ${task.scene.narration.segmentId}: ${timing.duration.toFixed(3)}s`);
  }));
  const failures = settled.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    console.error(`${failures.length} TTS task(s) failed; successful cache entries were retained.`);
    for (const failure of failures) console.error(failure.reason?.message ?? String(failure.reason));
    process.exitCode = 1;
    return;
  }
  const missing = plan.tasks.filter((task) => !cacheHit(task));
  if (missing.length > 0) {
    selectedScenes.length > 0 || fail(`${missing[0].scene.narration.segmentId}: cache missing after audio preview`);
    console.log(`PARTIAL audio preview: ${plan.tasks.length - missing.length}/${plan.tasks.length} segments cached; run without --scenes to complete the episode`);
    return;
  }
  const manifest = materializePreview(ctx, plan.tasks);
  console.log(`PASS  captions: ${manifest.cues.length} cues across ${manifest.segments.length} segments`);
  console.log(`READY ${rel(join(ctx.publicAudio, 'captions.json'))}`);
  console.log('BLOCK candidate/current/release: audio preview is not a promotable artifact');
};

const status = async (ctx) => {
  const plan = await resolvePlan(ctx);
  const hits = plan.tasks.filter(cacheHit).length;
  console.log(`Claude Code Course · ${EPISODE_ID}`);
  console.log(`content: ${ctx.episode.status}`);
  console.log(`tts cache: ${hits}/${plan.tasks.length}`);
  console.log(`public preview: ${existsSync(join(ctx.publicAudio, 'captions.json')) ? 'ready' : 'missing'}`);
  const auditPath = join(ctx.preview, 'audit.json');
  console.log(`audio audit: ${existsSync(auditPath) ? json(auditPath).verdict : 'missing'}`);
  console.log('candidate: blocked (adapter not implemented)');
  console.log('current: blocked (adapter not implemented)');
  console.log('release: blocked (adapter not implemented)');
};

const audioAudit = async (ctx) => {
  const plan = await resolvePlan(ctx);
  for (const task of plan.tasks) cacheHit(task) || fail(`${task.scene.narration.segmentId}: TTS cache is missing or outside its scene window`);
  const publicManifestPath = join(ctx.publicAudio, 'captions.json');
  existsSync(publicManifestPath) || fail(`Public caption manifest is missing: ${rel(publicManifestPath)}`);
  const publicManifest = json(publicManifestPath);
  const expectedManifest = buildCaptionManifest(ctx, plan.tasks);
  JSON.stringify(publicManifest.segments) === JSON.stringify(expectedManifest.segments) || fail('Public narration segment manifest does not match cache');
  JSON.stringify(publicManifest.cues) === JSON.stringify(expectedManifest.cues) || fail('Public subtitle cues do not match cache SRT timing');
  const loudness = await Promise.all(plan.tasks.map(async (task) => {
    const timing = validateArtifacts(task);
    const expectedDuration = Number(task.scene.narration.durationSeconds);
    Math.abs(timing.duration - expectedDuration) <= 0.02 || fail(`${task.scene.narration.segmentId}: episode duration ${expectedDuration}s differs from audio ${timing.duration}s`);
    const publicAudio = join(ctx.publicAudio, `${task.scene.narration.segmentId}_norm.mp3`);
    const publicSrt = join(ctx.publicAudio, `${task.scene.narration.segmentId}.srt`);
    existsSync(publicAudio) && shaFile(publicAudio) === shaFile(task.norm) || fail(`${task.scene.narration.segmentId}: public audio view differs from cache`);
    existsSync(publicSrt) && shaFile(publicSrt) === shaFile(task.srt) || fail(`${task.scene.narration.segmentId}: public SRT view differs from cache`);
    const output = await run('ffmpeg', [
      '-hide_banner', '-nostats', '-i', task.norm,
      '-af', 'loudnorm=I=-20:TP=-3:LRA=7:print_format=json',
      '-f', 'null', '-',
    ], {log: join(ctx.tmp, 'build/logs/audio-audit', `${task.scene.narration.segmentId}.log`)});
    const match = output.match(/\{\s*"input_i"[\s\S]*?\}/);
    match || fail(`${task.scene.narration.segmentId}: cannot parse loudness analysis`);
    const stats = JSON.parse(match[0]);
    const integratedLufs = Number(stats.input_i);
    const truePeakDbtp = Number(stats.input_tp);
    Math.abs(integratedLufs - (-20)) <= 1.0 || fail(`${task.scene.narration.segmentId}: loudness ${integratedLufs} LUFS outside -20 +/- 1.0`);
    truePeakDbtp <= -2.4 || fail(`${task.scene.narration.segmentId}: true peak ${truePeakDbtp} dBTP exceeds -2.4`);
    return {
      segmentId: task.scene.narration.segmentId,
      durationSeconds: timing.duration,
      voiceStart: task.scene.narration.voiceStart,
      voiceEnd: timing.voiceEnd,
      cueCount: timing.cues.length,
      integratedLufs,
      truePeakDbtp,
      audioSha256: shaFile(task.norm),
      srtSha256: shaFile(task.srt),
    };
  }));
  for (let index = 1; index < publicManifest.cues.length; index += 1) {
    const previous = publicManifest.cues[index - 1];
    const current = publicManifest.cues[index];
    current.from >= previous.to || fail(`Subtitle cues overlap: ${previous.segmentId} -> ${current.segmentId}`);
  }
  const audit = {
    schemaVersion: 1,
    episodeId: EPISODE_ID,
    verdict: 'pass',
    auditedAt: new Date().toISOString(),
    checks: {
      segments: `${loudness.length}/${plan.tasks.length}`,
      cues: publicManifest.cues.length,
      exactText: true,
      srtTiming: true,
      sceneWindows: true,
      publicViewMatchesCache: true,
      loudness: '-20 LUFS +/- 1.0',
      truePeakCeiling: '-2.4 dBTP',
    },
    segments: loudness,
    ownership: 'Audio preview audit only; not a Candidate approval verdict.',
  };
  writeJson(join(ctx.preview, 'audit.json'), audit);
  console.log(`PASS  audio audit: ${loudness.length} segments, ${publicManifest.cues.length} cues`);
  console.log(`READY ${rel(join(ctx.preview, 'audit.json'))}`);
  console.log('BLOCK candidate/current/release: preview audit is not a promotable verdict');
};

const blocked = new Set(['preview', 'build', 'approve', 'promote', 'release-build', 'release-audit', 'release-approve', 'publish']);

try {
  const ctx = context();
  if (COMMAND === 'validate') {
    narrationSource(ctx);
    console.log(`Validated ${EPISODE_ID}: ${ctx.episode.scenes.length} scenes, ${ctx.episode.durationSeconds}s`);
  } else if (COMMAND === 'plan') {
    printPlan(ctx, await resolvePlan(ctx));
  } else if (COMMAND === 'audio-preview') {
    await audioPreview(ctx);
  } else if (COMMAND === 'audio-audit') {
    await audioAudit(ctx);
  } else if (COMMAND === 'status') {
    await status(ctx);
  } else if (blocked.has(COMMAND)) {
    fail(`BLOCKED ${COMMAND}: Claude Code Course unified Candidate/Current/Release adapter is not implemented`);
  } else {
    fail('Usage: claude-code-course validate|plan|audio-preview|audio-audit|status <episode-id> [--scenes=scene-id] [--force]');
  }
} catch (error) {
  console.error(`claude-code-course: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
