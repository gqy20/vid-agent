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
const RENDER_PROFILES = {
  hd30: {name: 'hd30', scale: 1, width: 1920, height: 1080, fps: 30},
  uhd30: {name: 'uhd30', scale: 2, width: 3840, height: 2160, fps: 30},
};
const AUDIT_POLICY_VERSION = 'github-course-visual-v3';
const FULL_AUDIT_POLICY_VERSION = 'github-course-full-hd-v4';
const UHD_AUDIT_POLICY_VERSION = 'github-course-visual-uhd-v2';
const UHD_FULL_AUDIT_POLICY_VERSION = 'github-course-full-uhd-v2';
const COMMAND = process.argv[2] ?? 'status';
const COMMAND_ARGS = process.argv.slice(3);
const EPISODE_ID = COMMAND_ARGS.find((arg) => !arg.startsWith('--'));
const FLAGS = new Map(COMMAND_ARGS.filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, value = '1'] = arg.slice(2).split('=', 2);
  return [key, value];
}));
const UHD_COMMANDS = new Set(['browser-4k', 'build-4k', 'audit-4k', 'audit-full-4k', 'approve', 'promote']);
const requestedProfileName = FLAGS.get('profile') ?? (UHD_COMMANDS.has(COMMAND) ? 'uhd30' : 'hd30');
const ACTIVE_PROFILE = RENDER_PROFILES[requestedProfileName] ?? (() => { throw new Error(`Unknown render profile: ${requestedProfileName}`); })();

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

const copyAtomically = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  const partial = `${target}.partial`;
  rmSync(partial, {force: true});
  copyFileSync(source, partial);
  renameSync(partial, target);
};

const replaceDirectoryAtomically = (target, materialize) => {
  const next = `${target}.next`;
  const previous = `${target}.previous`;
  rmSync(next, {recursive: true, force: true});
  mkdirSync(next, {recursive: true});
  materialize(next);
  rmSync(previous, {recursive: true, force: true});
  if (existsSync(target)) renameSync(target, previous);
  try {
    renameSync(next, target);
  } catch (error) {
    if (!existsSync(target) && existsSync(previous)) renameSync(previous, target);
    throw error;
  }
  rmSync(previous, {recursive: true, force: true});
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
    if (checkAssets) {
      validateBrowserAsset(recordingForProfile(recording, RENDER_PROFILES.hd30), RENDER_PROFILES.hd30);
      if (recording.delivery) validateBrowserAsset(recordingForProfile(recording, RENDER_PROFILES.uhd30), RENDER_PROFILES.uhd30);
    }
  }
  for (const scene of episode.scenes) {
    if (scene.browserRecordingId) recordingIds.has(scene.browserRecordingId) || fail(`${episode.episodeId}:${scene.id}: unknown browser recording ${scene.browserRecordingId}`);
  }
  return episode;
};

const validateBrowserAsset = (recording, profile) => {
  const paths = browserPaths(recording);
  for (const path of [paths.video, paths.poster, paths.metadata]) existsSync(path) || fail(`${recording.id}: browser asset missing: ${rel(path)}`);
  const metadata = json(paths.metadata);
  metadata.recordingId === recording.scenarioId || metadata.recordingId === recording.id || fail(`${recording.id}: metadata recordingId mismatch`);
  metadata.containsSensitiveState === false || fail(`${recording.id}: generated metadata is sensitive`);
  const metadataProfile = metadata.profile ?? (profile.name === 'hd30' ? 'hd30' : null);
  metadataProfile === profile.name || fail(`${recording.id}: metadata profile must be ${profile.name}`);
  metadata.viewport?.width === recording.viewport.width && metadata.viewport?.height === recording.viewport.height || fail(`${recording.id}: metadata viewport mismatch`);
  const metadataCaptureResolution = metadata.captureResolution ?? (profile.name === 'hd30' ? metadata.viewport : null);
  metadataCaptureResolution?.width === recording.captureResolution.width && metadataCaptureResolution?.height === recording.captureResolution.height || fail(`${recording.id}: metadata capture resolution mismatch`);
  const metadataDeviceScaleFactor = metadata.deviceScaleFactor ?? (profile.name === 'hd30' ? 1 : null);
  metadataDeviceScaleFactor === recording.deviceScaleFactor || fail(`${recording.id}: metadata deviceScaleFactor mismatch`);
  const metadataCaptureMode = metadata.captureMode ?? (profile.name === 'hd30' ? 'fixed-viewport' : null);
  metadataCaptureMode === recording.captureMode || fail(`${recording.id}: metadata captureMode mismatch`);
  const video = probe(paths.video).streams.find((stream) => stream.codec_type === 'video');
  video?.width === recording.captureResolution.width && video?.height === recording.captureResolution.height || fail(`${recording.id}: browser video must be ${recording.captureResolution.width}x${recording.captureResolution.height}`);
  const poster = probe(paths.poster).streams.find((stream) => stream.codec_type === 'video');
  poster?.width === recording.captureResolution.width && poster?.height === recording.captureResolution.height || fail(`${recording.id}: browser poster must be ${recording.captureResolution.width}x${recording.captureResolution.height}`);
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

const loadContext = (profile = ACTIVE_PROFILE) => {
  EPISODE_ID || fail('Usage: pnpm github-course <command> <episode-id>');
  const episodePath = join(EPISODES, `${EPISODE_ID}.json`);
  existsSync(episodePath) || fail(`Unknown episode: ${EPISODE_ID}`);
  const episode = validateEpisode(json(episodePath), episodePath);
  const base = join(REMOTION, 'renders/github-course', EPISODE_ID);
  const tmp = join(base, 'tmp');
  const build = profile.name === 'hd30' ? join(tmp, 'build') : join(tmp, 'build', profile.name);
  const cache = join(tmp, 'cache');
  const statePath = join(build, 'state.json');
  const state = existsSync(statePath) ? json(statePath) : {schemaVersion: 1, scenes: {}, browser: {}, tts: {}};
  state.scenes ??= {};
  state.browser ??= {};
  state.tts ??= {};
  const current = join(base, 'current');
  return {episode, episodePath, base, tmp, build, cache, current, statePath, state, profile};
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

const recordingForProfile = (recording, profile) => {
  if (profile.name === 'hd30') {
    return {
      ...recording,
      profile: profile.name,
      captureResolution: recording.viewport,
      deviceScaleFactor: 1,
      captureMode: 'fixed-viewport',
    };
  }
  recording.delivery || fail(`${recording.id}: delivery browser declaration is required for ${profile.name}`);
  return {
    ...recording,
    ...recording.delivery,
    profile: profile.name,
  };
};

const browserSourceFingerprint = (recording) => {
  const scenarioName = recording.scenarioId.replaceAll('-', '_');
  const files = [
    join(BROWSER_LAB, 'record.py'),
    join(BROWSER_LAB, 'scenarios/base.py'),
    join(BROWSER_LAB, 'scenarios/__init__.py'),
    join(BROWSER_LAB, `scenarios/${scenarioName}.py`),
  ];
  return sha(JSON.stringify({
    schema: 2,
    scenarioId: recording.scenarioId,
    sourceHash: hashFiles(files),
    profile: recording.profile,
    viewport: recording.viewport,
    captureResolution: recording.captureResolution,
    deviceScaleFactor: recording.deviceScaleFactor,
    captureMode: recording.captureMode,
  }));
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
    join(courseRoot, 'spacing.ts'),
    join(courseRoot, 'timeline.ts'),
    join(courseRoot, 'typography.ts'),
    join(courseRoot, 'kit/index.ts'),
    join(courseRoot, 'kit/brand/BrandPrimitives.tsx'),
    join(courseRoot, 'kit/caption/GitHubNarrationSubtitle.tsx'),
    join(courseRoot, 'kit/layout/GitHubCourseLayout.tsx'),
    join(courseRoot, 'kit/browser/types.ts'),
    join(courseRoot, 'kit/browser/BrowserStage.tsx'),
    join(courseRoot, 'kit/browser/BrowserPanel.tsx'),
    join(courseRoot, 'kit/browser/BrowserFocusScene.tsx'),
    join(courseRoot, 'kit/browser/BrowserEvidenceScene.tsx'),
    join(courseRoot, 'kit/bridge/GitHubStateBridge.tsx'),
    join(courseRoot, 'kit/platform/PlatformStateLegend.tsx'),
  ];
  const parts = sourceParts(ctx);
  return sha(JSON.stringify({
    schema: 2,
    // The lockfile captures runtime/toolchain dependency changes. Hashing the
    // whole package.json also invalidated every GitHub scene when an unrelated
    // npm script changed, even though the rendered output could not change.
    fileHash: hashFiles([...shared, join(REMOTION, 'src/fonts.css'), join(REMOTION, 'pnpm-lock.yaml'), join(REMOTION, 'remotion.config.ts')]),
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

const srtTimestampSeconds = (value) => {
  const match = value.trim().match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  match || fail(`Invalid SRT timestamp: ${value}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
};

const parseSrtCues = (path, offsetSeconds = 0) => readFileSync(path, 'utf8')
  .trim()
  .split(/\r?\n\s*\r?\n/)
  .filter(Boolean)
  .map((block) => {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (/^\d+$/.test(lines[0] ?? '')) lines.shift();
    const timing = lines.shift()?.match(/^(.+?)\s+-->\s+(.+)$/);
    timing || fail(`Invalid SRT cue in ${rel(path)}`);
    const from = offsetSeconds + srtTimestampSeconds(timing[1]);
    const to = offsetSeconds + srtTimestampSeconds(timing[2]);
    to > from || fail(`Non-positive SRT cue in ${rel(path)}`);
    return {from: Number(from.toFixed(3)), to: Number(to.toFixed(3)), text: lines.join(' ')};
  });

// Keep these limits aligned with GitHub Course spacing.ts and visual-language.md.
// Width units approximate rendered glyph widths: a CJK glyph is one unit,
// while Latin text and punctuation consume a proportional fraction.
const SUBTITLE_MAX_LINES = 2;
const SUBTITLE_MAX_UNITS_PER_LINE = 38;
const SUBTITLE_MAX_UNITS_PER_CUE = SUBTITLE_MAX_LINES * SUBTITLE_MAX_UNITS_PER_LINE;
const subtitleWidthUnits = (text) => [...text].reduce((total, character) => {
  if (/\s/u.test(character)) return total + 0.3;
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(character)) return total + 1;
  if (/[A-Z0-9]/.test(character)) return total + 0.65;
  if (/[a-z]/.test(character)) return total + 0.52;
  return total + 0.45;
}, 0);

const overfullSubtitleCues = (cues) => cues
  .map((cue) => ({...cue, widthUnits: subtitleWidthUnits(cue.text)}))
  .filter((cue) => cue.widthUnits > SUBTITLE_MAX_UNITS_PER_CUE);

const subtitleCuesFor = (ctx, ttsTasks) => ttsTasks.flatMap((task) => {
  task.hit || fail(`${task.scene.narration.segmentId}: subtitles are not ready for scene rendering`);
  const offset = task.scene.narration.voiceStart;
  const sceneEnd = task.scene.start + task.scene.duration;
  const cues = parseSrtCues(task.paths.srt, offset);
  cues.length > 0 || fail(`${task.scene.narration.segmentId}: SRT has no cues`);
  cues.every((cue) => cue.from >= offset && cue.to <= sceneEnd) || fail(`${task.scene.narration.segmentId}: subtitle cue escapes its scene window`);
  const overfull = overfullSubtitleCues(cues);
  overfull.length === 0 || fail(`${task.scene.narration.segmentId}: subtitle cue exceeds ${SUBTITLE_MAX_LINES} lines / ${SUBTITLE_MAX_UNITS_PER_CUE} CJK-equivalent units: ${overfull[0].text}`);
  return cues;
});

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
  const profileRecordings = (ctx.episode.browserRecordings ?? []).map((recording) => recordingForProfile(recording, ctx.profile));
  const browser = profileRecordings.map((recording) => {
    const fingerprint = browserSourceFingerprint(recording);
    const metadataPath = browserPaths(recording).metadata;
    const metadata = existsSync(metadataPath) ? json(metadataPath) : null;
    const assetsPresent = Object.values(browserPaths(recording)).every(existsSync);
    const hit = assetsPresent && metadata?.sourceFingerprint === fingerprint && ctx.state.browser[recording.id]?.fingerprint === fingerprint;
    return {recording, fingerprint, hit, assetsPresent};
  });
  const tts = ctx.episode.scenes.map((scene) => {
    const paths = ttsCachePaths(ctx, scene);
    const metadata = existsSync(paths.metadata) ? json(paths.metadata) : null;
    const hit = [paths.raw, paths.srt, paths.text, paths.norm].every(existsSync)
      && metadata?.fingerprint === paths.fingerprint
      && metadata.normalizedSha256 === shaFile(paths.norm);
    return {scene, fingerprint: paths.fingerprint, paths, hit};
  });
  const ttsBySegment = new Map(tts.map((task) => [task.scene.narration.segmentId, task]));
  const baseHash = visualBaseHash(ctx);
  const recordings = new Map(profileRecordings.map((recording) => [recording.id, recording]));
  const sceneCacheDir = ctx.profile.name === 'hd30' ? join(ctx.cache, 'scenes') : join(ctx.cache, 'scenes', ctx.profile.name);
  const scenes = ctx.episode.scenes.map((scene, index) => {
    const {narration: _narration, ...visualScene} = scene;
    const subtitleTask = ttsBySegment.get(scene.narration.segmentId) ?? fail(`${scene.id}: missing TTS task`);
    const subtitleFingerprint = subtitleTask.hit
      ? sha(JSON.stringify({srtSha256: shaFile(subtitleTask.paths.srt), voiceStart: scene.narration.voiceStart}))
      : null;
    const recording = scene.browserRecordingId ? recordings.get(scene.browserRecordingId) : null;
    const assetFingerprint = recording ? recordingAssetFingerprint(recording) : null;
    const nativeBrowserOverlay = ctx.profile.name === 'uhd30' && scene.id === 'browser-repository'
      ? 'native-uhd-browser-overlay-v1:x320:y298:w3200:h1494:rate1.15:hold12'
      : null;
    const fingerprintInput = {schema: 3, baseHash, sourceBlock: sourceParts(ctx).blocks.get(scene.id), scene: visualScene, subtitleFingerprint, assetFingerprint, profile: ctx.profile};
    if (nativeBrowserOverlay) fingerprintInput.nativeBrowserOverlay = nativeBrowserOverlay;
    const fingerprint = sha(JSON.stringify(fingerprintInput));
    let cached = ctx.state.scenes[scene.id];
    let hit = subtitleFingerprint !== null && cached?.fingerprint === fingerprint && existsSync(join(ROOT, cached.path ?? ''));
    if (!hit && subtitleFingerprint !== null && existsSync(sceneCacheDir)) {
      const recovered = readdirSync(sceneCacheDir).find((name) => name.endsWith(`_${fingerprint.slice(0, 12)}.mp4`));
      if (recovered) {
        const path = join(sceneCacheDir, recovered);
        cached = {fingerprint, path: rel(path), sha256: shaFile(path), recoveredAt: new Date().toISOString()};
        ctx.state.scenes[scene.id] = cached;
        hit = true;
      }
    }
    return {scene, index, fingerprint, hit, cached};
  });
  return {baseHash, browser, scenes, tts};
};

const printPlan = (ctx, buildPlan) => {
  console.log(`GitHub Course · ${ctx.episode.episodeId} · ${ctx.profile.name} ${ctx.profile.width}x${ctx.profile.height}`);
  for (const task of buildPlan.browser) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} browser ${task.recording.id}`);
  for (const task of buildPlan.scenes) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} render  ${task.scene.id}`);
  for (const task of buildPlan.tts) console.log(`${task.hit ? 'HIT  ' : 'BUILD'} tts     ${task.scene.narration.segmentId}`);
  console.log(ctx.profile.name === 'uhd30'
    ? 'GATE  promote requires the exact 4K full candidate to pass audit and approval'
    : 'BLOCK promote 1080p candidates are not promotable');
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
    const args = ['run', 'python', join(BROWSER_LAB, 'record.py'), task.recording.scenarioId, '--profile', ctx.profile.name];
    if (FLAGS.has('normalize-existing')) args.push('--normalize-existing');
    await run('uv', args, {cwd: ROOT, log: join(ctx.build, 'logs/browser', `${task.recording.id}.log`)});
    const paths = browserPaths(task.recording);
    const metadata = validateBrowserAsset(task.recording, ctx.profile);
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

const compositeNativeUhdBrowserVideo = async (ctx, item) => {
  if (ctx.profile.name !== 'uhd30' || item.task.scene.id !== 'browser-repository') return;
  const declaration = (ctx.episode.browserRecordings ?? []).find((recording) => recording.id === item.task.scene.browserRecordingId);
  declaration || fail(`${item.task.scene.id}: browser recording declaration is missing`);
  const recording = recordingForProfile(declaration, ctx.profile);
  const source = browserPaths(recording).video;
  existsSync(source) || fail(`${item.task.scene.id}: native UHD browser source is missing`);
  const partial = `${item.cachePath}.overlay.partial.mp4`;
  rmSync(partial, {force: true});
  try {
    await run('ffmpeg', [
      '-nostdin', '-y',
      '-i', item.cachePath,
      '-i', source,
      '-filter_complex',
      '[1:v]scale=3200:1800,crop=3200:1494:0:0,setpts=PTS/1.15[browser];[0:v][browser]overlay=320:298:enable=\'lt(t,12)\':eof_action=pass:shortest=0[out]',
      '-map', '[out]',
      '-an',
      '-r', String(FPS),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-f', 'mp4',
      partial,
    ], {log: join(ctx.build, 'logs/native-uhd-browser-overlay.log')});
    renameSync(partial, item.cachePath);
    const completion = json(item.completionPath);
    writeJson(item.completionPath, {
      ...completion,
      nativeBrowserOverlay: {
        source: rel(source),
        sourceSha256: shaFile(source),
        x: 320,
        y: 298,
        width: 3200,
        visibleHeight: 1494,
        playbackRate: 1.15,
        holdFromSeconds: 12,
      },
    });
  } catch (error) {
    rmSync(partial, {force: true});
    rmSync(item.cachePath, {force: true});
    throw error;
  }
};

const renderScenes = async (ctx, tasks) => {
  if (tasks.length === 0) return;
  const subtitlePlan = plan(ctx);
  const subtitleCues = subtitleCuesFor(ctx, subtitlePlan.tts);
  const logicalCpus = cpus().length;
  const profilePath = join(REMOTION, `renders/github-course/tmp/render-profile-${ctx.profile.name}.json`);
  const sharedProfilePath = join(REMOTION, `renders/git-course/tmp/render-profile-${ctx.profile.name}.json`);
  const savedProfile = existsSync(profilePath) ? json(profilePath) : existsSync(sharedProfilePath) ? json(sharedProfilePath) : {};
  const defaultConcurrency = ctx.profile.scale > 1 ? Math.max(1, Math.floor(logicalCpus / 18)) : logicalCpus;
  const stable = savedProfile.maxStableConcurrencyPerBrowser ?? defaultConcurrency;
  const requested = Number(FLAGS.get('render-concurrency') ?? Math.max(1, Math.floor(logicalCpus / tasks.length)));
  const concurrency = FLAGS.has('render-concurrency') ? requested : Math.min(requested, stable ?? logicalCpus);
  const savedBrowserPools = savedProfile.maxStableBrowserPools ?? null;
  const maxParallelTasks = Math.max(1, Math.min(
    tasks.length,
    Number(FLAGS.get('render-browser-pools') ?? savedBrowserPools ?? Math.max(1, Math.floor(logicalCpus / concurrency))),
  ));
  const bundleFingerprint = hashFiles([
    ...walkFiles(join(REMOTION, 'src'), (path) => /\.(?:ts|tsx|css)$/.test(path)),
    join(REMOTION, 'package.json'),
    join(REMOTION, 'pnpm-lock.yaml'),
    join(REMOTION, 'remotion.config.ts'),
  ]);
  const bundleDir = join(REMOTION, 'renders/github-course/tmp/bundles', bundleFingerprint);
  const cacheDir = ctx.profile.name === 'hd30' ? join(ctx.cache, 'scenes') : join(ctx.cache, 'scenes', ctx.profile.name);
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
    inputProps: {subtitleCues, renderProfile: ctx.profile.name},
    logicalCpus,
    maxParallelTasks,
    bundleDir,
    bundleFingerprint,
    profilePath,
    timeoutInMilliseconds: Number(FLAGS.get('timeout-ms') ?? 120000),
    telemetryPath: join(ctx.build, 'telemetry/render-scenes.json'),
    tasks: planned.map((item) => ({sceneId: item.task.scene.id, start: item.start, end: item.end, output: item.output, cacheOutput: item.cachePath, completionPath: item.completionPath, scale: ctx.profile.scale, concurrency, fallbackConcurrency: stable ?? defaultConcurrency})),
  });
  let renderError = null;
  try {
    await run('node', [join(REMOTION, 'scripts/git-course-render-scenes.mjs'), planPath], {log: join(ctx.build, 'logs/render-scenes.log')});
  } catch (error) {
    renderError = error;
  }
  for (const item of planned) {
    if (!existsSync(item.cachePath) || !existsSync(item.completionPath)) continue;
    await compositeNativeUhdBrowserVideo(ctx, item);
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
    const sourceMatches = (path) => existsSync(path)
      && readFileSync(path, 'utf8').trim() === task.scene.narration.text.trim();
    const cachedSpeechMatches = existsSync(task.paths.raw)
      && existsSync(task.paths.srt)
      && sourceMatches(task.paths.text);
    const stagedSpeechMatches = existsSync(staged.raw)
      && existsSync(staged.srt)
      && sourceMatches(staged.text);
    // A stable staging filename may contain the previous narration take. It is
    // reusable only when its staged source text still matches this exact scene.
    return !cachedSpeechMatches && !stagedSpeechMatches;
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
  const inputFingerprint = sha(JSON.stringify({schema: 2, profile: ctx.profile, scenes: ordered.map((item) => item.sha256)}));
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
  const artifact = {schemaVersion: 2, kind: 'visual-only', profile: ctx.profile, episodeId: ctx.episode.episodeId, inputFingerprint, path: rel(candidate), sha256: shaFile(candidate), createdAt: new Date().toISOString(), scenes: ordered.map((item) => ({sceneId: item.sceneId, path: rel(item.path), sha256: item.sha256}))};
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
  const inputFingerprint = sha(JSON.stringify({schema: 2, profile: ctx.profile, visual: shaFile(visual.candidate), audio: shaFile(audio.mix)}));
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
    schemaVersion: 2,
    kind: ctx.profile.name === 'uhd30' ? 'full-uhd-candidate' : 'full-hd-candidate',
    profile: ctx.profile,
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
  const auditPolicyVersion = ctx.profile.name === 'uhd30' ? UHD_AUDIT_POLICY_VERSION : AUDIT_POLICY_VERSION;
  const auditFingerprint = sha(JSON.stringify({policy: auditPolicyVersion, profile: ctx.profile, auditScriptSha256, artifactSha256, boundaries: readFileSync(planData.boundariesPath, 'utf8'), keyframes: readFileSync(planData.keyframesPath, 'utf8')}));
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
    {id: 'video.resolution', status: video?.width === ctx.profile.width && video?.height === ctx.profile.height ? 'pass' : 'fail', details: `${video?.width ?? 0}x${video?.height ?? 0}`},
    {id: 'video.fps', status: video?.r_frame_rate === `${FPS}/1` ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    {id: 'duration.visual', status: Math.abs(duration - ctx.episode.durationSeconds) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${ctx.episode.durationSeconds}s`},
    {id: 'audio.intentional-silent', status: audio ? 'fail' : 'pass', details: audio ? 'visual candidate unexpectedly contains audio' : 'visual-only candidate is intentionally silent'},
    {id: 'sampling.continuous2fps', status: sampling.review.actualFrames === sampling.review.expectedFrames ? 'pass' : 'fail', details: `${sampling.review.actualFrames}/${sampling.review.expectedFrames}`},
    {id: 'sampling.boundaries10fps', status: sampling.boundaries.count === planData.boundaryCount ? 'pass' : 'fail', details: `${sampling.boundaries.count}/${planData.boundaryCount}`},
    {id: 'sampling.keyframes', status: sampling.keyframes.count === planData.keyframeCount ? 'pass' : 'fail', details: `${sampling.keyframes.count}/${planData.keyframeCount}`},
  ];
  for (const declaration of ctx.episode.browserRecordings ?? []) {
    const recording = recordingForProfile(declaration, ctx.profile);
    try {
      const metadata = validateBrowserAsset(recording, ctx.profile);
      checks.push({id: `browser.${recording.id}.sensitive`, status: metadata.containsSensitiveState === false ? 'pass' : 'fail', details: `capturedAt=${metadata.capturedAt}`});
      checks.push({id: `browser.${recording.id}.focus-regions`, status: (metadata.focusRegions ?? []).length > 0 ? 'pass' : 'needs_review', details: `${(metadata.focusRegions ?? []).length} region(s)`});
      checks.push({id: `browser.${recording.id}.native-resolution`, status: 'pass', details: `${recording.captureResolution.width}x${recording.captureResolution.height}`});
    } catch (error) {
      checks.push({id: `browser.${recording.id}.assets`, status: 'fail', details: error.message});
    }
  }
  checks.push({id: 'visual.human-review', status: 'needs_review', details: rel(join(auditDir, 'report.html'))});
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope: ctx.profile.name === 'uhd30' ? 'visual-uhd' : 'visual',
    profile: ctx.profile,
    artifact: rel(candidate),
    artifactSha256,
    inputFingerprint,
    auditFingerprint,
    auditPolicyVersion,
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
  const auditPolicyVersion = ctx.profile.name === 'uhd30' ? UHD_FULL_AUDIT_POLICY_VERSION : FULL_AUDIT_POLICY_VERSION;
  const auditFingerprint = sha(JSON.stringify({
    policy: auditPolicyVersion,
    profile: ctx.profile,
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
  let subtitleTimelineAligned = true;
  let subtitleLayoutSafe = true;
  let subtitleCueCount = 0;
  let subtitleMaxWidthUnits = 0;
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
      const cues = parseSrtCues(staged.srt, scene.narration.voiceStart);
      const sceneEnd = scene.start + scene.duration;
      subtitleCueCount += cues.length;
      for (const cue of cues) subtitleMaxWidthUnits = Math.max(subtitleMaxWidthUnits, subtitleWidthUnits(cue.text));
      if (overfullSubtitleCues(cues).length > 0) subtitleLayoutSafe = false;
      if (cues.length === 0 || cues.some((cue) => cue.from < scene.narration.voiceStart || cue.to > sceneEnd)) {
        subtitleTimelineAligned = false;
      }
    } catch {
      narrationAligned = false;
      subtitleTimelineAligned = false;
    }
    if (!existsSync(staged.srt) || /<#|#>/.test(readFileSync(staged.srt, 'utf8'))) srtClean = false;
  }
  const visualMachineFailed = visualVerdict.checks.some((check) => check.status === 'fail');
  const checks = [
    {id: 'video.stream', status: video ? 'pass' : 'fail', details: video ? `${video.width}x${video.height} ${video.r_frame_rate}` : 'missing'},
    {id: 'audio.stream', status: audio ? 'pass' : 'fail', details: audio ? `${audio.codec_name} ${audio.sample_rate}Hz ${audio.channels}ch` : 'missing'},
    {id: 'video.resolution', status: video?.width === ctx.profile.width && video?.height === ctx.profile.height ? 'pass' : 'fail', details: `${video?.width ?? 0}x${video?.height ?? 0}`},
    {id: 'video.fps', status: video?.r_frame_rate === `${FPS}/1` ? 'pass' : 'fail', details: video?.r_frame_rate ?? 'missing'},
    {id: 'duration.full', status: Math.abs(duration - ctx.episode.durationSeconds) <= 0.08 ? 'pass' : 'fail', details: `${duration}s expected ${ctx.episode.durationSeconds}s`},
    {id: 'audio.sample-rate', status: Number(audio?.sample_rate) === 48000 ? 'pass' : 'fail', details: audio?.sample_rate ?? 'missing'},
    {id: 'audio.loudness', status: Number.isFinite(integrated) && Math.abs(integrated - (-16)) <= 0.6 && Number.isFinite(truePeak) && truePeak <= -1.5 ? 'pass' : 'fail', details: `${integrated} LUFS, ${truePeak} dBTP`},
    {id: 'subtitle.pause-marker', status: srtClean ? 'pass' : 'fail', details: srtClean ? 'clean' : 'pause marker found'},
    {id: 'subtitle.narration-sync', status: subtitleTimelineAligned ? 'pass' : 'fail', details: subtitleTimelineAligned ? `${subtitleCueCount} cue(s) aligned to narration voiceStart and scene windows` : 'one or more subtitle cues escape their narration window'},
    {id: 'subtitle.layout-capacity', status: subtitleLayoutSafe ? 'pass' : 'fail', details: `${subtitleMaxWidthUnits.toFixed(1)}/${SUBTITLE_MAX_UNITS_PER_CUE} CJK-equivalent units; max ${SUBTITLE_MAX_LINES} lines`},
    {id: 'narration.scene-windows', status: narrationAligned ? 'pass' : 'fail', details: narrationAligned ? `${ctx.episode.scenes.length}/${ctx.episode.scenes.length}` : 'one or more narration segments do not match their scene'},
    {id: 'visual.encoded-audit', status: visualMachineFailed ? 'fail' : 'pass', details: rel(visualVerdictPath)},
    {id: 'full.human-review', status: 'needs_review', details: 'Listen for pronunciation and pacing; verify each rendered subtitle enters and leaves with its spoken SRT cue.'},
  ];
  const machineFailed = checks.some((check) => check.status === 'fail');
  const verdict = {
    schemaVersion: 1,
    episodeId: ctx.episode.episodeId,
    scope: ctx.profile.name === 'uhd30' ? 'full-uhd' : 'full-hd',
    profile: ctx.profile,
    artifact: rel(candidate),
    artifactSha256,
    inputFingerprint: existsSync(join(ctx.build, 'full-artifact-manifest.json')) ? json(join(ctx.build, 'full-artifact-manifest.json')).inputFingerprint : artifactSha256,
    auditFingerprint,
    auditPolicyVersion,
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

const assertIterationReadyFor4k = () => {
  const iteration = loadContext(RENDER_PROFILES.hd30);
  const verdictPath = join(iteration.build, 'audit/full/verdict.json');
  existsSync(verdictPath) || fail('Build and audit the 1080p iteration candidate before starting 4K delivery.');
  const verdict = json(verdictPath);
  verdict.checks.every((check) => check.status !== 'fail') || fail('The 1080p full audit contains failed machine checks.');
  const candidate = join(iteration.build, `candidate/${iteration.episode.episodeId}.mp4`);
  existsSync(candidate) && verdict.artifactSha256 === shaFile(candidate) || fail('The 1080p audit is stale; rebuild before starting 4K delivery.');
};

const assertBuildFresh = (ctx) => {
  const buildPlan = plan(ctx);
  const staleBrowser = buildPlan.browser.filter((task) => !task.hit).map((task) => task.recording.id);
  const staleScenes = buildPlan.scenes.filter((task) => !task.hit).map((task) => task.scene.id);
  const staleTts = buildPlan.tts.filter((task) => !task.hit).map((task) => task.scene.narration.segmentId);
  staleBrowser.length === 0 || fail(`4K browser inputs changed after build: ${staleBrowser.join(', ')}`);
  staleScenes.length === 0 || fail(`4K visual inputs changed after build: ${staleScenes.join(', ')}`);
  staleTts.length === 0 || fail(`Narration inputs changed after build: ${staleTts.join(', ')}`);
  ctx.state.audio?.fingerprint === audioFingerprint(ctx, buildPlan.tts) || fail('Audio inputs changed after build.');
};

const approve4k = (ctx) => {
  ctx.profile.name === 'uhd30' || fail('Main approval only accepts the 4K delivery profile.');
  const note = FLAGS.get('note');
  note || fail('approve requires --note=...');
  assertBuildFresh(ctx);
  const pairs = [
    {scope: 'visual', candidate: join(ctx.build, `candidate/${ctx.episode.episodeId}_visual.mp4`)},
    {scope: 'full', candidate: join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`)},
  ];
  const approval = {reviewer: process.env.USER ?? 'unknown', approvedAt: new Date().toISOString(), note};
  for (const pair of pairs) {
    const path = join(ctx.build, `audit/${pair.scope}/verdict.json`);
    existsSync(path) || fail(`Run the 4K ${pair.scope} audit before approval.`);
    const verdict = json(path);
    verdict.profile?.name === 'uhd30' || fail(`${pair.scope} verdict is not a 4K verdict.`);
    verdict.checks.every((check) => check.status !== 'fail') || fail(`Cannot approve failed ${pair.scope} audit.`);
    existsSync(pair.candidate) && verdict.artifactSha256 === shaFile(pair.candidate) || fail(`${pair.scope} 4K candidate changed after audit.`);
    verdict.verdict = 'pass';
    verdict.promotable = pair.scope === 'full';
    verdict.approval = approval;
    for (const check of verdict.checks) if (check.id.endsWith('human-review')) check.status = 'pass';
    writeJson(path, verdict);
  }
  console.log('PASS  approve 4K main candidate');
};

const promote4k = (ctx) => {
  ctx.profile.name === 'uhd30' || fail('Promotion only accepts the 4K delivery profile.');
  const fullVerdictPath = join(ctx.build, 'audit/full/verdict.json');
  const visualVerdictPath = join(ctx.build, 'audit/visual/verdict.json');
  for (const path of [fullVerdictPath, visualVerdictPath]) existsSync(path) || fail(`Missing 4K verdict: ${rel(path)}`);
  const fullVerdict = json(fullVerdictPath);
  const visualVerdict = json(visualVerdictPath);
  fullVerdict.verdict === 'pass' && fullVerdict.promotable === true || fail(`4K full verdict is ${fullVerdict.verdict}; approval required.`);
  visualVerdict.verdict === 'pass' || fail(`4K visual verdict is ${visualVerdict.verdict}; approval required.`);
  assertBuildFresh(ctx);

  const candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`);
  const visualCandidate = join(ctx.build, `candidate/${ctx.episode.episodeId}_visual.mp4`);
  const fullManifestPath = join(ctx.build, 'full-artifact-manifest.json');
  const visualManifestPath = join(ctx.build, 'visual-artifact-manifest.json');
  for (const path of [candidate, visualCandidate, fullManifestPath, visualManifestPath]) existsSync(path) || fail(`Missing approved 4K artifact: ${rel(path)}`);
  const fullManifest = json(fullManifestPath);
  const visualManifest = json(visualManifestPath);
  fullManifest.profile?.name === 'uhd30' && visualManifest.profile?.name === 'uhd30' || fail('Artifact manifests are not 4K.');
  fullManifest.path === rel(candidate) && fullManifest.sha256 === shaFile(candidate) && fullVerdict.artifactSha256 === fullManifest.sha256 || fail('Full manifest, verdict and 4K candidate SHA do not match.');
  visualManifest.path === rel(visualCandidate) && visualManifest.sha256 === shaFile(visualCandidate) && visualVerdict.artifactSha256 === visualManifest.sha256 || fail('Visual manifest, verdict and 4K candidate SHA do not match.');
  fullManifest.visual?.sha256 === visualManifest.sha256 || fail('Full manifest does not bind the approved 4K visual candidate.');
  const audioMix = join(ctx.build, 'candidate/audio/mix.m4a');
  existsSync(audioMix) && fullManifest.audio?.sha256 === shaFile(audioMix) || fail('Approved audio mix changed after build.');
  visualManifest.scenes.length === ctx.episode.scenes.length || fail('4K scene count does not match the episode.');
  for (const [index, item] of visualManifest.scenes.entries()) {
    item.sceneId === ctx.episode.scenes[index].id || fail(`4K scene order mismatch at ${item.sceneId}.`);
    const path = resolve(ROOT, item.path);
    path.startsWith(`${join(ctx.cache, 'scenes', 'uhd30')}/`) || fail(`Unexpected 4K scene path: ${item.path}`);
    existsSync(path) && item.sha256 === shaFile(path) || fail(`Approved 4K scene changed: ${item.path}`);
  }

  copyAtomically(candidate, join(ctx.current, `${ctx.episode.episodeId}.mp4`));
  replaceDirectoryAtomically(join(ctx.current, 'scenes'), (target) => {
    visualManifest.scenes.forEach((item, index) => copyAtomically(resolve(ROOT, item.path), join(target, `${String(index + 1).padStart(2, '0')}_${item.sceneId.replaceAll('-', '_')}.mp4`)));
  });
  const candidateAudio = join(ctx.build, 'candidate/audio');
  replaceDirectoryAtomically(join(ctx.current, 'audio'), (target) => {
    for (const source of walkFiles(candidateAudio, (path) => !path.endsWith('.partial'))) copyAtomically(source, join(target, relative(candidateAudio, source)));
  });
  copyAtomically(fullVerdictPath, join(ctx.current, 'audit/verdict.json'));
  copyAtomically(fullManifestPath, join(ctx.current, 'artifact-manifest.json'));
  console.log(`PASS  promote ${rel(join(ctx.current, `${ctx.episode.episodeId}.mp4`))}`);
};

const build = async (ctx) => {
  if (ctx.profile.name === 'uhd30') assertIterationReadyFor4k();
  const initial = plan(ctx);
  const dirtyBrowser = initial.browser.filter((task) => !task.hit);
  if (dirtyBrowser.length > 0) {
    if (FLAGS.has('with-browser')) await recordBrowserAssets(ctx);
    else fail(`Browser assets are dirty: ${dirtyBrowser.map((task) => task.recording.id).join(', ')}. Run pnpm github-course browser ${ctx.episode.episodeId} or pass --with-browser.`);
  }
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  // Rendered subtitles are driven by the exact MMX SRT cues, so TTS is a real
  // input dependency of every scene instead of an independent side task.
  const audioResult = await buildAudio(ctx, buildPlan);
  const renderPlan = plan(ctx);
  await renderScenes(ctx, renderPlan.scenes.filter((task) => !task.hit));
  writeJson(ctx.statePath, ctx.state);
  const refreshed = plan(ctx);
  const assembled = await assembleVisual(ctx, refreshed);
  await auditVisual(ctx, assembled.candidate);
  const full = await assembleFull(ctx, assembled, audioResult);
  await auditFull(ctx, full.candidate);
};

const printProfileStatus = (ctx) => {
  const buildPlan = plan(ctx);
  printPlan(ctx, buildPlan);
  const candidate = join(ctx.build, `candidate/${ctx.episode.episodeId}_visual.mp4`);
  const verdict = join(ctx.build, 'audit/visual/verdict.json');
  const fullCandidate = join(ctx.build, `candidate/${ctx.episode.episodeId}.mp4`);
  const fullVerdict = join(ctx.build, 'audit/full/verdict.json');
  console.log(`${ctx.profile.name} visual candidate: ${existsSync(candidate) ? rel(candidate) : 'missing'}`);
  console.log(`${ctx.profile.name} visual verdict:   ${existsSync(verdict) ? json(verdict).verdict : 'missing'}`);
  console.log(`${ctx.profile.name} full candidate:   ${existsSync(fullCandidate) ? rel(fullCandidate) : 'missing'}`);
  console.log(`${ctx.profile.name} full verdict:     ${existsSync(fullVerdict) ? json(fullVerdict).verdict : 'missing'}`);
};

const status = () => {
  const hd = loadContext(RENDER_PROFILES.hd30);
  const uhd = loadContext(RENDER_PROFILES.uhd30);
  printProfileStatus(hd);
  printProfileStatus(uhd);
  const current = join(uhd.current, `${uhd.episode.episodeId}.mp4`);
  console.log(`current 4K: ${existsSync(current) ? rel(current) : 'missing (requires 4K approve + promote)'}`);
  console.log('release/publish: blocked until the GitHub Course release adapter is implemented');
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
  } else if (COMMAND === 'status') status();
  else if (COMMAND === 'browser' || COMMAND === 'browser-4k') await recordBrowserAssets(ctx);
  else if (COMMAND === 'build' || COMMAND === 'build-4k') await build(ctx);
  else if (COMMAND === 'audit') await auditVisual(ctx);
  else if (COMMAND === 'audit-full' || COMMAND === 'audit-full-4k') await auditFull(ctx);
  else if (COMMAND === 'audit-4k') {
    await auditVisual(ctx);
    await auditFull(ctx);
  }
  else if (COMMAND === 'approve-visual') approveVisual(ctx);
  else if (COMMAND === 'approve') approve4k(ctx);
  else if (COMMAND === 'promote') promote4k(ctx);
  else if (['release-build', 'release-audit', 'release-approve', 'publish'].includes(COMMAND)) fail(`${COMMAND} is blocked until the GitHub Course release adapter is implemented.`);
  else fail(`Unknown command: ${COMMAND}`);
};

main().catch((error) => {
  console.error(`FAIL  ${error.message}`);
  process.exitCode = 1;
});
