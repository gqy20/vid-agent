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
  statSync,
  writeFileSync,
} from 'node:fs';
import {spawn} from 'node:child_process';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  applyWasExplicitlyEnabled,
  draftPreviewLayout,
  episodePreviewMatchesAudio,
  orderedSceneFilename,
  pathIsInside,
  stableAudioPreviewEntries,
  stablePreviewRootEntries,
  stableReviewEntries,
  visualAuditMatchesEpisode,
} from './lib/claude-code-preview.mjs';

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
  const partial = `${path}.partial-${process.pid}`;
  writeFileSync(partial, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  renameSync(partial, path);
};
const run = (command, args, {cwd = REMOTION, log, env = {}} = {}) => new Promise((resolvePromise, rejectPromise) => {
  mkdirSync(dirname(log), {recursive: true});
  const child = spawn(command, args, {cwd, env: {...process.env, ...env}, stdio: ['ignore', 'pipe', 'pipe']});
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
  const ttsBootstrap = COMMAND === 'tts';
  (episode.status === 'draft' || (ttsBootstrap && episode.status === 'outline'))
    || fail(`${EPISODE_ID}: ${ttsBootstrap ? 'TTS bootstrap requires outline or draft content' : 'audio preview is only enabled for draft episodes'}`);
  episode.fps === 30 || fail(`${EPISODE_ID}: fps must be 30`);
  episode.audio?.model === 'speech-2.8-hd' || fail(`${EPISODE_ID}: audio.model must be speech-2.8-hd`);
  episode.audio?.voice === 'Chinese (Mandarin)_Gentleman' || fail(`${EPISODE_ID}: unexpected audio.voice`);
  episode.audio?.language === 'zh' || fail(`${EPISODE_ID}: audio.language must be zh`);
  episode.audio?.speed === 1.25 || fail(`${EPISODE_ID}: audio.speed must be 1.25`);
  typeof episode.audio?.bgm?.source === 'string' && episode.audio.bgm.source.length > 0
    || fail(`${EPISODE_ID}: audio.bgm.source is required`);
  episode.audio.bgm.volume === 0.05 || fail(`${EPISODE_ID}: audio.bgm.volume must be 0.05`);
  existsSync(resolve(ROOT, episode.audio.bgm.source))
    || fail(`${EPISODE_ID}: BGM not found: ${episode.audio.bgm.source}`);
  const segmentIds = new Set();
  let cursor = 0;
  const timelineTolerance = 1e-6;
  for (const scene of episode.scenes) {
    Math.abs(scene.start - cursor) <= timelineTolerance || fail(`${scene.id}: expected start ${cursor}, got ${scene.start}`);
    Number.isFinite(scene.duration) && scene.duration > 0 || fail(`${scene.id}: invalid duration`);
    const narration = scene.narration;
    narration && typeof narration.text === 'string' && narration.text.trim() || fail(`${scene.id}: narration text is required`);
    /^[0-9]{2}_[a-z0-9_]+$/.test(narration.segmentId) || fail(`${scene.id}: invalid narration segment id`);
    !segmentIds.has(narration.segmentId) || fail(`${scene.id}: duplicate narration segment id`);
    segmentIds.add(narration.segmentId);
    narration.voiceStart >= scene.start && narration.voiceStart < scene.start + scene.duration || fail(`${scene.id}: voiceStart outside scene`);
    if (!ttsBootstrap) {
      Number.isFinite(narration.durationSeconds) && narration.durationSeconds > 0 || fail(`${scene.id}: invalid narration duration`);
    }
    const leadingSilence = narration.voiceStart - scene.start;
    leadingSilence <= 2 + timelineTolerance || fail(`${scene.id}: leading narration whitespace ${leadingSilence.toFixed(3)}s exceeds 2s`);
    if (!ttsBootstrap) {
      const trailingSilence = scene.start + scene.duration - narration.voiceStart - narration.durationSeconds;
      trailingSilence >= -timelineTolerance || fail(`${scene.id}: narration exceeds scene by ${Math.abs(trailingSilence).toFixed(3)}s`);
      trailingSilence <= 2 + timelineTolerance || fail(`${scene.id}: trailing narration whitespace ${trailingSilence.toFixed(3)}s exceeds 2s`);
    }
    cursor += scene.duration;
  }
  Math.abs(cursor - episode.durationSeconds) <= timelineTolerance || fail(`${EPISODE_ID}: scene duration sum ${cursor} != ${episode.durationSeconds}`);
  const continuity = episode.continuity;
  continuity && typeof continuity === 'object' || fail(`${EPISODE_ID}: continuity is required`);
  Number.isInteger(continuity.chapterIndex) && continuity.chapterIndex > 0
    || fail(`${EPISODE_ID}: continuity.chapterIndex must be a positive integer`);
  typeof continuity.chapterLabel === 'string' && continuity.chapterLabel.trim()
    || fail(`${EPISODE_ID}: continuity.chapterLabel is required`);
  typeof continuity.entryState === 'string' && continuity.entryState.trim()
    || fail(`${EPISODE_ID}: continuity.entryState is required`);
  typeof continuity.exitState === 'string' && continuity.exitState.trim()
    || fail(`${EPISODE_ID}: continuity.exitState is required`);
  typeof continuity.incomingQuestion === 'string' && continuity.incomingQuestion.trim()
    || fail(`${EPISODE_ID}: continuity.incomingQuestion is required`);
  typeof continuity.outgoingQuestion === 'string' && continuity.outgoingQuestion.trim()
    || fail(`${EPISODE_ID}: continuity.outgoingQuestion is required`);
  typeof continuity.visualBaton === 'string' && continuity.visualBaton.trim()
    || fail(`${EPISODE_ID}: continuity.visualBaton is required`);
  Array.isArray(continuity.scenes) && continuity.scenes.length === episode.scenes.length
    || fail(`${EPISODE_ID}: continuity.scenes must cover all ${episode.scenes.length} scenes`);
  const handoffTypes = new Set([
    'question-handoff',
    'evidence-continuation',
    'causal-handoff',
    'zoom-in',
    'synthesis',
    'chapter-bridge',
    'closure',
  ]);
  continuity.scenes.forEach((item, index) => {
    const scene = episode.scenes[index];
    item.sceneId === scene.id || fail(`${EPISODE_ID}: continuity scene ${index + 1} must be ${scene.id}`);
    for (const field of ['entryState', 'change', 'exitState']) {
      typeof item[field] === 'string' && item[field].trim()
        || fail(`${scene.id}: continuity.${field} is required`);
    }
    index === 0
      ? item.entryState === continuity.entryState || fail(`${scene.id}: entryState must match episode continuity.entryState`)
      : item.entryState === continuity.scenes[index - 1].exitState || fail(`${scene.id}: entryState must match previous exitState`);
    const expectedTarget = episode.scenes[index + 1]?.id ?? continuity.nextEpisodeId;
    item.handoff && handoffTypes.has(item.handoff.type) || fail(`${scene.id}: invalid continuity handoff type`);
    item.handoff.target === expectedTarget
      || fail(`${scene.id}: continuity handoff target must be ${expectedTarget ?? 'null'}`);
    typeof item.handoff.visualAnchor === 'string' && item.handoff.visualAnchor.trim()
      || fail(`${scene.id}: continuity handoff visualAnchor is required`);
  });
  continuity.scenes.at(-1).exitState === continuity.exitState
    || fail(`${EPISODE_ID}: final scene exitState must match continuity.exitState`);
  const verifyNeighbor = (neighborId, direction) => {
    if (neighborId === null) return;
    typeof neighborId === 'string' && /^ep[0-9]{2}-[a-z0-9-]+$/.test(neighborId)
      || fail(`${EPISODE_ID}: continuity.${direction}EpisodeId is invalid`);
    const neighborPath = join(EPISODES, `${neighborId}.json`);
    existsSync(neighborPath) || fail(`${EPISODE_ID}: continuity neighbor not found: ${neighborId}`);
    const neighbor = json(neighborPath);
    if (direction === 'previous') {
      neighbor.continuity?.nextEpisodeId === EPISODE_ID || fail(`${EPISODE_ID}: previous episode does not link forward`);
      neighbor.continuity?.exitState === continuity.entryState || fail(`${EPISODE_ID}: entryState does not match previous exitState`);
      neighbor.continuity?.chapterIndex + 1 === continuity.chapterIndex || fail(`${EPISODE_ID}: chapterIndex does not follow previous episode`);
    } else {
      neighbor.continuity?.previousEpisodeId === EPISODE_ID || fail(`${EPISODE_ID}: next episode does not link backward`);
      continuity.exitState === neighbor.continuity?.entryState || fail(`${EPISODE_ID}: exitState does not match next entryState`);
      continuity.chapterIndex + 1 === neighbor.continuity?.chapterIndex || fail(`${EPISODE_ID}: next chapterIndex is not sequential`);
    }
  };
  verifyNeighbor(continuity.previousEpisodeId, 'previous');
  verifyNeighbor(continuity.nextEpisodeId, 'next');
  return {episode, path};
};

const context = () => {
  const loaded = loadEpisode();
  const root = join(REMOTION, 'renders/claude-code-course', EPISODE_ID);
  const tmp = join(root, 'tmp');
  const statePath = join(tmp, 'state.json');
  const preview = draftPreviewLayout(root);
  return {
    ...loaded,
    root,
    tmp,
    cache: join(tmp, 'cache'),
    preview,
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

const captionWeight = (value) => Array.from(normalizedNarrationText(value)).length;

const CAPTION_LAYOUT = {
  maxLines: 2,
  hardLineUnits: 40,
};

const subtitleDisplayText = (value) => value
  .replace(/[。；;]+$/u, '')
  .replace(/(?<=[\p{Script=Han}A-Za-z0-9\]])\.$/u, '');

const captionUnit = (character) => {
  if (/\s/u.test(character)) return 0.32;
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(character)) return 1;
  if (/[A-Z]/u.test(character)) return 0.7;
  if (/[a-z0-9]/u.test(character)) return 0.56;
  if (/[._/\-:[\]]/u.test(character)) return 0.42;
  if (/[，。；：！？、]/u.test(character)) return 1;
  return 0.62;
};

const captionDisplayUnits = (value) => Array.from(value).reduce((sum, character) => sum + captionUnit(character), 0);

const captionTokens = (value) => value.match(/[A-Za-z0-9_./:-]+(?:\[[^\]]+\])?|\s+|./gu) ?? [];

const captionLines = (value) => {
  const display = subtitleDisplayText(value).trim();
  const tokens = captionTokens(display);
  const total = captionDisplayUnits(display);
  total <= CAPTION_LAYOUT.hardLineUnits || tokens.length > 1 || fail(`Subtitle token exceeds one line: ${display}`);
  if (total <= CAPTION_LAYOUT.hardLineUnits) return [display];
  total <= CAPTION_LAYOUT.hardLineUnits * CAPTION_LAYOUT.maxLines
    || fail(`Subtitle exceeds two-line width budget: ${display}`);
  const candidates = [];
  for (let index = 1; index < tokens.length; index += 1) {
    const left = tokens.slice(0, index).join('').trimEnd();
    const right = tokens.slice(index).join('').trimStart();
    if (!left || !right) continue;
    const leftUnits = captionDisplayUnits(left);
    const rightUnits = captionDisplayUnits(right);
    if (leftUnits > CAPTION_LAYOUT.hardLineUnits || rightUnits > CAPTION_LAYOUT.hardLineUnits) continue;
    const previous = tokens[index - 1];
    const next = tokens[index];
    const semanticPriority = /[，、：；！？,.!?;:]\s*$/u.test(previous)
      ? 3
      : /\s/u.test(previous) || /^\s/u.test(next)
        ? 2
        : 1;
    candidates.push({left, right, semanticPriority, imbalance: Math.abs(leftUnits - rightUnits)});
  }
  candidates.length > 0 || fail(`Subtitle cannot be balanced into two protected lines: ${display}`);
  candidates.sort((a, b) => b.semanticPriority - a.semanticPriority || a.imbalance - b.imbalance);
  const lines = [candidates[0].left, candidates[0].right];
  const protectedTokens = display.match(/[A-Za-z0-9_./:-]+(?:\[[^\]]+\])?/g) ?? [];
  for (const token of protectedTokens.filter((item) => item.length >= 4)) {
    lines.some((line) => line.includes(token)) || fail(`Subtitle line break split protected token: ${token}`);
  }
  return lines;
};

const validateCaptionLines = (cue) => {
  Array.isArray(cue.lines) || fail(`Subtitle cue is missing derived lines: ${cue.text}`);
  cue.lines.length >= 1 && cue.lines.length <= CAPTION_LAYOUT.maxLines
    || fail(`Subtitle cue has ${cue.lines.length} lines: ${cue.text}`);
  cue.lines.join('').replace(/\s+/g, '') === subtitleDisplayText(cue.text).replace(/\s+/g, '')
    || fail(`Subtitle lines do not preserve display text: ${cue.text}`);
  for (const line of cue.lines) {
    captionDisplayUnits(line) <= CAPTION_LAYOUT.hardLineUnits
      || fail(`Subtitle line exceeds width budget: ${line}`);
  }
};

const semanticCaptionTexts = (value) => {
  const clean = value
    .replace(/\((?:breath|sighs?|sigh|clear-throat|clears throat|laughs?|chuckles?)\)/gi, '')
    .replace(/<#[^>]+#>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // A cue may span internal commas, but it must never stop halfway through a
  // sentence. This keeps narration thoughts intact and also avoids splitting
  // technical tokens such as glm-5.2[1m] or settings.json.
  const clauses = clean.match(/[^。；！？!?]+[。；！？!?]?/gu)?.map((item) => item.trim()).filter(Boolean) ?? [clean];
  const merged = [];
  for (let index = 0; index < clauses.length; index += 1) {
    let clause = clauses[index];
    if (captionWeight(clause) < 10 && index + 1 < clauses.length && captionWeight(clause + clauses[index + 1]) <= 52) {
      clause += clauses[index + 1];
      index += 1;
    } else if (merged.length > 0 && captionWeight(clause) < 10 && captionWeight(merged.at(-1) + clause) <= 52) {
      merged[merged.length - 1] += clause;
      continue;
    }
    merged.push(clause);
  }
  normalizedNarrationText(merged.join('')) === normalizedNarrationText(value)
    || fail('Semantic caption text does not preserve the narration');
  const protectedTokens = clean.match(/[A-Za-z0-9_./:-]+(?:\[[^\]]+\])?/g) ?? [];
  for (const token of protectedTokens.filter((item) => item.length >= 4)) {
    merged.some((caption) => caption.includes(token)) || fail(`Semantic caption split protected token: ${token}`);
  }
  return merged;
};

const semanticCaptionCues = (narration, timedCues) => {
  timedCues.length > 0 || fail('Cannot build semantic captions without timed SRT cues');
  const narrationGroups = narration.split(/<#[^>]+#>/).map((item) => item.trim()).filter(Boolean);
  const anchoredGroups = narrationGroups.length === timedCues.length
    ? narrationGroups.map((text, index) => ({text, from: timedCues[index].from, to: timedCues[index].to}))
    : [{text: narration, from: timedCues[0].from, to: timedCues.at(-1).to}];
  const result = [];
  for (const group of anchoredGroups) {
    const captions = semanticCaptionTexts(group.text);
    const totalWeight = captions.reduce((sum, text) => sum + captionWeight(text), 0);
    let offset = 0;
    for (const text of captions) {
      const weight = captionWeight(text);
      const from = group.from + (group.to - group.from) * (offset / totalWeight);
      const to = group.from + (group.to - group.from) * ((offset + weight) / totalWeight);
      to > from || fail(`Semantic caption has an invalid duration: ${text}`);
      result.push({from: Number(from.toFixed(3)), to: Number(to.toFixed(3)), text});
      offset += weight;
    }
  }
  normalizedNarrationText(result.map((cue) => cue.text).join('')) === normalizedNarrationText(narration)
    || fail('Semantic caption cues do not preserve the full narration');
  return result;
};

const formatSrtTime = (secondsValue) => {
  const totalMs = Math.max(0, Math.round(secondsValue * 1000));
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secondsPart = Math.floor((totalMs % 60_000) / 1000);
  const milliseconds = totalMs % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
};

const semanticSrt = (scene, timedCues) => `${semanticCaptionCues(scene.narration.text, timedCues).map((cue, index) => [
  String(index + 1),
  `${formatSrtTime(cue.from)} --> ${formatSrtTime(cue.to)}`,
  cue.text.replace(/[。；;]+$/u, ''),
].join('\n')).join('\n\n')}\n`;

const mmxVersion = async (ctx) => (await run('mmx', ['--version'], {log: join(ctx.tmp, 'build/logs/mmx-version.log')})).trim();

const taskFor = (ctx, scene, engineVersion) => {
  const postGainDb = Number.isFinite(scene.narration.postGainDb) ? scene.narration.postGainDb : null;
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
    ...(postGainDb === null ? {} : {postGainDb}),
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
    postGainDb,
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
  const normalizationFilter = [
    'acompressor=threshold=-22dB:ratio=2.0:attack=8:release=120:makeup=1.0,loudnorm=I=-20:TP=-3:LRA=7,alimiter=limit=0.90',
    ...(task.postGainDb === null ? [] : [`volume=${task.postGainDb}dB`]),
  ].join(',');
  await run('ffmpeg', [
    '-y', '-hide_banner', '-nostats',
    '-i', raw,
    '-af', normalizationFilter,
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
    postGainDb: task.postGainDb,
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

const materializeAtomic = (source, target) => {
  mkdirSync(dirname(target), {recursive: true});
  if (existsSync(target) && shaFile(source) === shaFile(target)) return 'existing';
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

const bgmFor = (ctx) => {
  const source = resolve(ROOT, ctx.episode.audio.bgm.source);
  return {
    source,
    volume: ctx.episode.audio.bgm.volume,
    sha256: shaFile(source),
    publicAsset: `claude-code-course/audio/${EPISODE_ID}/bgm.mp3`,
  };
};

const mixTaskFor = (ctx, tasks) => {
  const bgm = bgmFor(ctx);
  const fingerprint = sha(JSON.stringify({
    schema: 2,
    episodeId: EPISODE_ID,
    durationSeconds: ctx.episode.durationSeconds,
    bgm: {sha256: bgm.sha256, volume: bgm.volume},
    narration: tasks.map((task) => ({
      segmentId: task.scene.narration.segmentId,
      voiceStart: task.scene.narration.voiceStart,
      sha256: shaFile(task.norm),
    })),
    mix: 'git-course-build-voiceover-v2+master-I-16-TP-3-LRA7+ceiling-1.5+tolerance-1.0',
    scriptSha256: shaFile(join(REMOTION, 'scripts/git-course-build-voiceover.sh')),
  }));
  const dir = join(ctx.cache, 'audio-mix', fingerprint);
  return {
    bgm,
    fingerprint,
    dir,
    mix: join(dir, 'mix.m4a'),
    voiceover: join(dir, 'voiceover-aligned.m4a'),
    metadata: join(dir, 'metadata.json'),
  };
};

const mixCacheHit = (task) => {
  if (![task.mix, task.voiceover, task.metadata].every(existsSync)) return false;
  const metadata = json(task.metadata);
  return metadata.fingerprint === task.fingerprint
    && metadata.mixSha256 === shaFile(task.mix)
    && metadata.voiceoverSha256 === shaFile(task.voiceover);
};

const ensureMix = async (ctx, tasks) => {
  const task = mixTaskFor(ctx, tasks);
  if (mixCacheHit(task)) return task;
  const partial = `${task.dir}.partial-${process.pid}`;
  rmSync(partial, {recursive: true, force: true});
  const segments = join(partial, 'segments');
  mkdirSync(segments, {recursive: true});
  for (const narrationTask of tasks) {
    const segment = narrationTask.scene.narration.segmentId;
    for (const [source, name] of [
      [narrationTask.raw, `${segment}.mp3`],
      [narrationTask.srt, `${segment}.srt`],
      [narrationTask.text, `${segment}.txt`],
      [narrationTask.norm, `${segment}_norm.mp3`],
    ]) materialize(source, join(segments, name));
  }
  await run(join(REMOTION, 'scripts/git-course-build-voiceover.sh'), [EPISODE_ID], {
    env: {
      AUDIO_DIR: partial,
      NARRATION_MANIFEST: join(ctx.source, 'manifest.tsv'),
      TMP_DIR: join(ctx.tasks, `audio-mix-${task.fingerprint.slice(0, 12)}`),
      BGM_FILE: task.bgm.source,
      BGM_VOLUME: String(task.bgm.volume),
      EPISODE_DURATION: String(ctx.episode.durationSeconds),
      SKIP_TTS: '1',
      SKIP_NORM: '1',
      SKIP_REMUX: '1',
      MASTER_LUFS: '-16',
      MASTER_TRUE_PEAK: '-3.0',
      FINAL_TRUE_PEAK_CEILING: '-1.5',
      FINAL_INTEGRATED_TOLERANCE: '1.0',
    },
    log: join(ctx.tmp, 'build/logs/audio-mix', `${task.fingerprint}.log`),
  });
  const mix = join(partial, 'mix.m4a');
  const voiceover = join(partial, 'voiceover-aligned.m4a');
  existsSync(mix) || fail('Audio mix did not produce mix.m4a');
  existsSync(voiceover) || fail('Audio mix did not produce voiceover-aligned.m4a');
  const durationText = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', mix,
  ], {log: join(ctx.tmp, 'build/logs/audio-mix', `${task.fingerprint}-ffprobe.log`)});
  const durationSeconds = Number(durationText.trim());
  Math.abs(durationSeconds - ctx.episode.durationSeconds) <= 0.15
    || fail(`Audio mix duration ${durationSeconds}s != episode ${ctx.episode.durationSeconds}s`);
  writeJson(join(partial, 'metadata.json'), {
    schemaVersion: 1,
    fingerprint: task.fingerprint,
    durationSeconds,
    bgmSha256: task.bgm.sha256,
    bgmVolume: task.bgm.volume,
    mixSha256: shaFile(mix),
    voiceoverSha256: shaFile(voiceover),
    generatedAt: new Date().toISOString(),
  });
  mkdirSync(dirname(task.dir), {recursive: true});
  if (existsSync(task.dir)) rmSync(task.dir, {recursive: true, force: true});
  renameSync(partial, task.dir);
  mixCacheHit(task) || fail('Audio mix cache validation failed after build');
  return task;
};

const buildCaptionManifest = (ctx, tasks, mixTask) => {
  const cues = [];
  const segments = [];
  for (const task of tasks) {
    const timing = validateArtifacts(task);
    const segment = task.scene.narration.segmentId;
    const captionCues = semanticCaptionCues(task.scene.narration.text, timing.cues);
    const captionSrt = semanticSrt(task.scene, timing.cues);
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
      captionSrtSha256: sha(captionSrt),
    });
    for (const cue of captionCues) {
      cues.push({
        segmentId: segment,
        from: Number((task.scene.narration.voiceStart + cue.from).toFixed(3)),
        to: Number((task.scene.narration.voiceStart + cue.to).toFixed(3)),
        text: cue.text,
        lines: captionLines(cue.text),
      });
    }
  }
  return {
    schemaVersion: 3,
    episodeId: EPISODE_ID,
    durationSeconds: ctx.episode.durationSeconds,
    generatedAt: new Date().toISOString(),
    source: rel(ctx.path),
    audio: {
      ...ctx.episode.audio,
      bgm: {
        source: ctx.episode.audio.bgm.source,
        publicAsset: mixTask.bgm.publicAsset,
        volume: mixTask.bgm.volume,
        sha256: mixTask.bgm.sha256,
      },
    },
    mix: {
      audio: `claude-code-course/audio/${EPISODE_ID}/mix.m4a`,
      sha256: shaFile(mixTask.mix),
      durationSeconds: json(mixTask.metadata).durationSeconds,
      fingerprint: mixTask.fingerprint,
    },
    subtitlePolicy: 'Complete narration sentences mapped onto MMX timing anchors; every cue stores one or two balanced display lines, each line stays within a conservative 40-em mixed-script budget, protected technical tokens remain intact, and global times include scene voiceStart.',
    segments,
    cues,
  };
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const previewManifestBase = (ctx) => ({
  schemaVersion: 1,
  episodeId: EPISODE_ID,
  stage: 'draft',
  ownership: 'Rebuildable stable preview views backed by tmp/cache; not Candidate, Current, or Release.',
  episode: null,
  scenes: {},
  audio: null,
  review: {
    reportPath: rel(ctx.preview.report),
    audioAuditPath: null,
  },
});

const currentPreviewManifest = (ctx) => {
  if (!existsSync(ctx.preview.manifest)) return previewManifestBase(ctx);
  const manifest = json(ctx.preview.manifest);
  return manifest.schemaVersion === 1 && manifest.episodeId === EPISODE_ID
    ? {...previewManifestBase(ctx), ...manifest}
    : previewManifestBase(ctx);
};

const writePreviewReport = (ctx, manifest) => {
  const episode = manifest.episode;
  const scenes = Object.entries(manifest.scenes ?? {});
  const episodeSection = episode
    ? `<video controls preload="metadata" src="../episode.mp4"></video>
       <dl><dt>规格</dt><dd>${episode.width}×${episode.height} · ${episode.fps}fps · ${episode.durationSeconds.toFixed(3)}s</dd>
       <dt>SHA</dt><dd><code>${escapeHtml(episode.sha256)}</code></dd></dl>`
    : '<p class="empty">整片预览尚未生成。</p>';
  const sceneSection = scenes.length > 0
    ? `<ul>${scenes.map(([sceneId, scene]) => `<li><a href="../scenes/${escapeHtml(scene.filename)}">${escapeHtml(scene.filename)}</a><span>${escapeHtml(sceneId)} · ${escapeHtml(scene.sha256.slice(0, 12))}</span></li>`).join('')}</ul>`
    : '<p class="empty">本轮没有已物化的分镜预览。</p>';
  const audit = manifest.review?.audioAuditPath
    ? `<a href="audio-audit.json">audio-audit.json</a>`
    : '<span class="empty">尚未审查</span>';
  const visualVerdictPath = join(ctx.preview.videoAudit, 'verdict.json');
  const visualReportPath = join(ctx.preview.videoAudit, 'report.html');
  const visualVerdict = existsSync(visualVerdictPath) ? json(visualVerdictPath) : null;
  const visualAudit = existsSync(visualReportPath) && visualAuditMatchesEpisode(episode, visualVerdict)
    ? `<a href="video-audit/report.html">视觉审查报告</a><span> · ${escapeHtml(visualVerdict.verdict ?? '待核对')}</span>`
    : existsSync(visualReportPath)
      ? '<span class="empty">已有视觉审查与当前整片 SHA 不匹配，请重新生成。</span>'
      : '<span class="empty">尚未抽帧审查</span>';
  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(EPISODE_ID)} · Draft Preview</title>
<style>body{margin:0;background:#f4f0e8;color:#27231f;font:16px/1.55 system-ui,-apple-system,"Noto Sans CJK SC",sans-serif}.page{max-width:1120px;margin:auto;padding:48px 32px 80px}header{display:flex;justify-content:space-between;gap:24px;align-items:end;border-bottom:1px solid #d8d0c3;padding-bottom:20px}h1{font-size:30px;margin:0}h2{font-size:18px;margin:34px 0 14px}.stage{color:#a44b31;font-weight:700;letter-spacing:.08em;text-transform:uppercase}video{width:100%;background:#1d1b19;border-radius:12px;box-shadow:0 18px 50px #3b30251f}dl{display:grid;grid-template-columns:72px 1fr;gap:6px 12px}dt{color:#756d63}dd{margin:0}code{font:13px ui-monospace,SFMono-Regular,monospace;word-break:break-all}ul{list-style:none;padding:0;margin:0;border-top:1px solid #d8d0c3}li{display:flex;justify-content:space-between;gap:24px;padding:12px 0;border-bottom:1px solid #d8d0c3}a{color:#8e3f2d;text-decoration:none;font-weight:650}li span,.empty{color:#756d63}.meta{font-size:13px;color:#756d63}</style></head>
<body><main class="page"><header><div><div class="stage">Draft Preview</div><h1>${escapeHtml(ctx.episode.title)}</h1></div><div class="meta">${escapeHtml(manifest.updatedAt ?? '')}</div></header>
<h2>整片</h2>${episodeSection}<h2>本轮分镜</h2>${sceneSection}<h2>音频审查</h2><p>${audit}</p><h2>视觉审查</h2><p>${visualAudit}</p>
<p class="meta">此页面只用于 Draft 核对，不是 Candidate 审查 verdict。</p></main></body></html>`;
  mkdirSync(dirname(ctx.preview.report), {recursive: true});
  const partial = `${ctx.preview.report}.partial-${process.pid}`;
  writeFileSync(partial, html, 'utf8');
  renameSync(partial, ctx.preview.report);
};

const updatePreviewManifest = (ctx, patch) => {
  const previous = currentPreviewManifest(ctx);
  const next = {
    ...previous,
    ...patch,
    scenes: patch.scenes ?? previous.scenes ?? {},
    review: {...previous.review, ...patch.review, reportPath: rel(ctx.preview.report)},
    updatedAt: new Date().toISOString(),
  };
  writeJson(ctx.preview.manifest, next);
  writePreviewReport(ctx, next);
  ctx.state.preview = {
    episode: next.episode,
    scenes: next.scenes,
    audio: next.audio,
  };
  writeJson(ctx.statePath, ctx.state);
  return next;
};

const materializeAudioPreview = async (ctx, tasks) => {
  const publicSegments = ctx.publicAudio;
  const mixTask = await ensureMix(ctx, tasks);
  const manifest = buildCaptionManifest(ctx, tasks, mixTask);
  const materializations = [];
  for (const task of tasks) {
    const segment = task.scene.narration.segmentId;
    for (const [source, name] of [
      [task.raw, `${segment}.mp3`],
      [task.text, `${segment}.txt`],
      [task.norm, `${segment}_norm.mp3`],
    ]) {
      materializations.push({target: rel(join(publicSegments, name)), method: materialize(source, join(publicSegments, name))});
    }
    const captionSrt = semanticSrt(task.scene, parseSrt(task.srt));
    const publicSrt = join(publicSegments, `${segment}.srt`);
    writeFileSync(publicSrt, captionSrt, 'utf8');
    materializations.push({target: rel(publicSrt), method: 'derived-semantic-srt'});
  }
  for (const [source, name] of [[mixTask.mix, 'mix.m4a']]) {
    materializations.push({target: rel(join(ctx.preview.audio, name)), method: materialize(source, join(ctx.preview.audio, name))});
  }
  for (const [source, name] of [
    [mixTask.mix, 'mix.m4a'],
    [mixTask.voiceover, 'voiceover-aligned.m4a'],
    [mixTask.bgm.source, 'bgm.mp3'],
  ]) {
    materializations.push({target: rel(join(ctx.publicAudio, name)), method: materialize(source, join(ctx.publicAudio, name))});
  }
  writeJson(join(ctx.preview.audio, 'captions.json'), manifest);
  writeJson(join(ctx.publicAudio, 'captions.json'), manifest);
  writeJson(join(ctx.preview.audio, 'manifest.json'), {
    ...manifest,
    ownership: 'Rebuildable compact audio preview view backed by tmp/cache; not Candidate or Current.',
    materializations,
  });
  writeJson(join(ctx.publicAudio, 'manifest.json'), {
    ...manifest,
    ownership: 'Rebuildable Remotion public view backed by tmp/cache/tts; not Candidate or Current.',
  });
  const audio = {
      captionManifestPath: rel(join(ctx.preview.audio, 'captions.json')),
      mixPath: rel(join(ctx.preview.audio, 'mix.m4a')),
      mixCachePath: rel(mixTask.mix),
      mixSha256: shaFile(mixTask.mix),
      mixFingerprint: mixTask.fingerprint,
      cueCount: manifest.cues.length,
      segmentCount: manifest.segments.length,
  };
  const previous = currentPreviewManifest(ctx);
  const episode = episodePreviewMatchesAudio(previous.episode, audio) ? previous.episode : null;
  if (previous.episode && !episode) rmSync(ctx.preview.episode, {force: true});
  updatePreviewManifest(ctx, {
    episode,
    audio,
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
  const continuity = ctx.episode.continuity;
  console.log(`CHAPTER ${continuity.chapterIndex} · ${continuity.chapterLabel}`);
  console.log(`STATE   ${continuity.entryState} -> ${continuity.exitState}`);
  for (const item of continuity.scenes) {
    console.log(`FLOW    ${item.sceneId}: ${item.entryState} -> ${item.exitState} -> ${item.handoff.target ?? 'END'}`);
  }
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
  const manifest = await materializeAudioPreview(ctx, plan.tasks);
  console.log(`PASS  captions: ${manifest.cues.length} cues across ${manifest.segments.length} segments`);
  console.log(`READY ${rel(join(ctx.preview.audio, 'manifest.json'))}`);
  console.log(`REVIEW ${rel(ctx.preview.report)}`);
  console.log('BLOCK candidate/current/release: audio preview is not a promotable artifact');
};

const ttsBootstrap = async (ctx) => {
  const plan = await resolvePlan(ctx);
  const selectedScenes = String(FLAGS.get('scenes') ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const selected = plan.tasks.filter((task) => selectedScenes.length === 0 || selectedScenes.includes(task.scene.id));
  selected.length > 0 || fail('No matching TTS scenes selected');
  const settled = await Promise.allSettled(selected.map(async (task) => {
    if (cacheHit(task) && !FLAGS.has('force')) {
      console.log(`HIT   ${task.scene.narration.segmentId}`);
      return;
    }
    const timing = await generateTask(ctx, task, plan.engineVersion);
    console.log(`PASS  ${task.scene.narration.segmentId}: ${timing.duration.toFixed(3)}s`);
  }));
  const failures = settled.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    for (const failure of failures) console.error(failure.reason?.message ?? String(failure.reason));
    fail(`${failures.length} TTS bootstrap task(s) failed; successful cache entries were retained`);
  }
  const missing = plan.tasks.filter((task) => !cacheHit(task));
  if (missing.length > 0) {
    console.log(`PARTIAL TTS bootstrap: ${plan.tasks.length - missing.length}/${plan.tasks.length} segments cached`);
    return;
  }
  let cursor = 0;
  const scenes = plan.tasks.map((task, index) => {
    const metadata = json(task.metadata);
    const narrationDurationSeconds = Number(metadata.durationSeconds);
    const leadingSilenceSeconds = index === 0 ? 1.5 : 0.5;
    const trailingSilenceSeconds = index === plan.tasks.length - 1 ? 1.5 : 0.8;
    const duration = Math.ceil((leadingSilenceSeconds + narrationDurationSeconds + trailingSilenceSeconds) * 10) / 10;
    const result = {
      sceneId: task.scene.id,
      segmentId: task.scene.narration.segmentId,
      start: Number(cursor.toFixed(3)),
      duration,
      voiceStart: Number((cursor + leadingSilenceSeconds).toFixed(3)),
      narrationDurationSeconds,
      leadingSilenceSeconds,
      trailingSilenceSeconds: Number((duration - leadingSilenceSeconds - narrationDurationSeconds).toFixed(3)),
      ttsFingerprint: task.fingerprint,
      normalizedSha256: shaFile(task.norm),
    };
    cursor += duration;
    return result;
  });
  const proposalPath = join(ctx.source, 'timing-proposal.json');
  writeJson(proposalPath, {
    schemaVersion: 1,
    episodeId: EPISODE_ID,
    source: rel(ctx.path),
    durationSeconds: Number(cursor.toFixed(3)),
    policy: 'TTS-derived scene windows with <=2s leading/trailing whitespace; review and apply to episode JSON before audio-preview.',
    scenes,
    generatedAt: new Date().toISOString(),
  });
  console.log(`READY ${rel(proposalPath)}`);
  console.log('BLOCK audio mix: apply the reviewed timing proposal to episode JSON and set status=draft first');
};

const status = async (ctx) => {
  const plan = await resolvePlan(ctx);
  const hits = plan.tasks.filter(cacheHit).length;
  console.log(`Claude Code Course · ${EPISODE_ID}`);
  console.log(`content: ${ctx.episode.status}`);
  console.log(`tts cache: ${hits}/${plan.tasks.length}`);
  console.log(`draft preview: ${existsSync(ctx.preview.episode) && existsSync(ctx.preview.manifest) ? rel(ctx.preview.episode) : 'missing'}`);
  console.log(`public audio view: ${existsSync(join(ctx.publicAudio, 'captions.json')) && existsSync(join(ctx.publicAudio, 'mix.m4a')) ? 'ready' : 'missing'}`);
  const auditPath = ctx.preview.audioAudit;
  console.log(`audio audit: ${existsSync(auditPath) ? json(auditPath).verdict : 'missing'}`);
  console.log(`review: ${existsSync(ctx.preview.report) ? rel(ctx.preview.report) : 'missing'}`);
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
  const mixTask = mixTaskFor(ctx, plan.tasks);
  mixCacheHit(mixTask) || fail('Audio mix cache is missing or stale');
  const expectedManifest = buildCaptionManifest(ctx, plan.tasks, mixTask);
  JSON.stringify(publicManifest.segments) === JSON.stringify(expectedManifest.segments) || fail('Public narration segment manifest does not match cache');
  JSON.stringify(publicManifest.cues) === JSON.stringify(expectedManifest.cues) || fail('Public subtitle cues do not match cache SRT timing');
  JSON.stringify(publicManifest.audio) === JSON.stringify(expectedManifest.audio) || fail('Public audio configuration does not match the episode and BGM source');
  JSON.stringify(publicManifest.mix) === JSON.stringify(expectedManifest.mix) || fail('Public mix manifest does not match cache');
  publicManifest.schemaVersion === 3 || fail('Public caption manifest must use schemaVersion 3');
  const publicMix = join(ctx.publicAudio, 'mix.m4a');
  const publicBgm = join(ctx.publicAudio, 'bgm.mp3');
  existsSync(publicMix) && shaFile(publicMix) === shaFile(mixTask.mix) || fail('Public audio mix differs from cache');
  existsSync(publicBgm) && shaFile(publicBgm) === mixTask.bgm.sha256 || fail('Public BGM differs from configured source');
  for (const cue of publicManifest.cues) validateCaptionLines(cue);
  const loudness = await Promise.all(plan.tasks.map(async (task) => {
    const timing = validateArtifacts(task);
    const expectedDuration = Number(task.scene.narration.durationSeconds);
    Math.abs(timing.duration - expectedDuration) <= 0.02 || fail(`${task.scene.narration.segmentId}: episode duration ${expectedDuration}s differs from audio ${timing.duration}s`);
    const leadingSilenceSeconds = task.scene.narration.voiceStart - task.scene.start;
    const trailingSilenceSeconds = timing.sceneEnd - timing.voiceEnd;
    leadingSilenceSeconds <= 2 || fail(`${task.scene.narration.segmentId}: actual leading whitespace ${leadingSilenceSeconds.toFixed(3)}s exceeds 2s`);
    trailingSilenceSeconds <= 2 || fail(`${task.scene.narration.segmentId}: actual trailing whitespace ${trailingSilenceSeconds.toFixed(3)}s exceeds 2s`);
    const publicAudio = join(ctx.publicAudio, `${task.scene.narration.segmentId}_norm.mp3`);
    const publicSrt = join(ctx.publicAudio, `${task.scene.narration.segmentId}.srt`);
    const expectedSrt = semanticSrt(task.scene, timing.cues);
    const semanticCues = semanticCaptionCues(task.scene.narration.text, timing.cues);
    existsSync(publicAudio) && shaFile(publicAudio) === shaFile(task.norm) || fail(`${task.scene.narration.segmentId}: public audio view differs from cache`);
    existsSync(publicSrt) && shaFile(publicSrt) === sha(expectedSrt) || fail(`${task.scene.narration.segmentId}: public semantic SRT differs from narration and timing anchors`);
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
      leadingSilenceSeconds,
      trailingSilenceSeconds,
      cueCount: semanticCues.length,
      integratedLufs,
      truePeakDbtp,
      audioSha256: shaFile(task.norm),
      srtSha256: shaFile(publicSrt),
    };
  }));
  for (let index = 1; index < publicManifest.cues.length; index += 1) {
    const previous = publicManifest.cues[index - 1];
    const current = publicManifest.cues[index];
    current.from >= previous.to || fail(`Subtitle cues overlap: ${previous.segmentId} -> ${current.segmentId}`);
  }
  const mixOutput = await run('ffmpeg', [
    '-hide_banner', '-nostats', '-i', publicMix,
    '-af', 'loudnorm=I=-16:TP=-3:LRA=7:print_format=json',
    '-f', 'null', '-',
  ], {log: join(ctx.tmp, 'build/logs/audio-audit', 'mix.log')});
  const mixMatch = mixOutput.match(/\{\s*"input_i"[\s\S]*?\}/);
  mixMatch || fail('Cannot parse mix loudness analysis');
  const mixStats = JSON.parse(mixMatch[0]);
  const mixIntegratedLufs = Number(mixStats.input_i);
  const mixTruePeakDbtp = Number(mixStats.input_tp);
  Math.abs(mixIntegratedLufs - (-16)) <= 1.0 || fail(`Mix loudness ${mixIntegratedLufs} LUFS outside -16 +/- 1.0`);
  mixTruePeakDbtp <= -1.4 || fail(`Mix true peak ${mixTruePeakDbtp} dBTP exceeds -1.4`);
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
      semanticBoundaries: true,
      protectedTechnicalTokensIntact: true,
      captionLines: `1-${CAPTION_LAYOUT.maxLines}`,
      captionLineWidthBudget: CAPTION_LAYOUT.hardLineUnits,
      sceneWindows: true,
      narrationWhitespace: 'leading/trailing <= 2s for every scene',
      publicViewMatchesCache: true,
      loudness: '-20 LUFS +/- 1.0',
      truePeakCeiling: '-2.4 dBTP',
      mix: 'content-addressed narration + approved course BGM',
      mixLoudness: '-16 LUFS +/- 1.0',
      mixTruePeakCeiling: '-1.4 dBTP',
    },
    mix: {
      fingerprint: mixTask.fingerprint,
      sha256: shaFile(publicMix),
      bgmSha256: mixTask.bgm.sha256,
      bgmVolume: mixTask.bgm.volume,
      integratedLufs: mixIntegratedLufs,
      truePeakDbtp: mixTruePeakDbtp,
    },
    segments: loudness,
    ownership: 'Audio preview audit only; not a Candidate approval verdict.',
  };
  writeJson(ctx.preview.audioAudit, audit);
  updatePreviewManifest(ctx, {review: {audioAuditPath: rel(ctx.preview.audioAudit)}});
  console.log(`PASS  audio audit: ${loudness.length} segments, ${publicManifest.cues.length} cues`);
  console.log(`READY ${rel(ctx.preview.audioAudit)}`);
  console.log(`REVIEW ${rel(ctx.preview.report)}`);
  console.log('BLOCK candidate/current/release: preview audit is not a promotable verdict');
};

const resolveEpisodeInputPath = (ctx, value, label) => {
  const path = resolve(ROOT, value);
  pathIsInside(ctx.root, path) || fail(`${label} must be inside ${rel(ctx.root)}`);
  return path;
};

const probeMedia = async (ctx, path, logName) => JSON.parse(await run('ffprobe', [
  '-v', 'error', '-show_entries',
  'stream=index,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels:format=duration,size',
  '-of', 'json', path,
], {log: join(ctx.tmp, 'build/logs/preview', logName)}));

const frameRate = (stream) => {
  const [numerator, denominator] = String(stream.r_frame_rate ?? '0/1').split('/').map(Number);
  return denominator ? numerator / denominator : 0;
};

const previewEpisodeTask = (ctx, input, mixTask) => {
  const sourceSha256 = shaFile(input);
  const audioSha256 = shaFile(mixTask.mix);
  const fingerprint = sha(JSON.stringify({
    schema: 2,
    episodeId: EPISODE_ID,
    durationSeconds: ctx.episode.durationSeconds,
    sourceSha256,
    audioSha256,
    mux: 'copy-video+audited-aac+faststart',
  }));
  const dir = join(ctx.cache, 'episodes', fingerprint);
  return {
    fingerprint,
    sourceSha256,
    audioSha256,
    dir,
    episode: join(dir, 'episode.mp4'),
    metadata: join(dir, 'metadata.json'),
  };
};

const previewEpisodeCacheHit = (task) => {
  if (![task.episode, task.metadata].every(existsSync)) return false;
  const metadata = json(task.metadata);
  return metadata.fingerprint === task.fingerprint
    && metadata.outputSha256 === shaFile(task.episode);
};

const validateAuditedMix = (ctx, mixTask) => {
  existsSync(ctx.preview.audioAudit) || fail('Audio audit is missing; run audio-audit first');
  const audit = json(ctx.preview.audioAudit);
  audit.verdict === 'pass' && audit.mix?.sha256 === shaFile(mixTask.mix)
    || fail('Audio audit does not match the active mix');
};

const ensureEpisodePreviewCache = async (ctx, input, mixTask) => {
  const task = previewEpisodeTask(ctx, input, mixTask);
  if (previewEpisodeCacheHit(task)) return task;
  const inputProbe = await probeMedia(ctx, input, 'episode-input-ffprobe.log');
  const inputVideo = inputProbe.streams?.find((stream) => Number.isFinite(stream.width));
  inputVideo || fail('Input preview has no video stream');
  Math.abs(Number(inputProbe.format?.duration) - ctx.episode.durationSeconds) <= 0.15
    || fail(`Input preview duration ${inputProbe.format?.duration}s != episode ${ctx.episode.durationSeconds}s`);
  const partialDir = `${task.dir}.partial-${process.pid}`;
  rmSync(partialDir, {recursive: true, force: true});
  mkdirSync(partialDir, {recursive: true});
  const partialVideo = join(partialDir, 'episode.mp4');
  await run('ffmpeg', [
    '-y', '-hide_banner', '-nostats',
    '-i', input,
    '-i', mixTask.mix,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-shortest',
    '-movflags', '+faststart',
    partialVideo,
  ], {log: join(ctx.tmp, 'build/logs/preview', `${task.fingerprint}-mux.log`)});
  const outputProbe = await probeMedia(ctx, partialVideo, 'episode-output-ffprobe.log');
  const outputVideo = outputProbe.streams?.find((stream) => Number.isFinite(stream.width));
  const outputAudio = outputProbe.streams?.find((stream) => Number.isFinite(Number(stream.sample_rate)));
  outputVideo?.width === inputVideo.width && outputVideo?.height === inputVideo.height
    || fail('Muxed preview dimensions differ from source video');
  outputVideo?.nb_frames === inputVideo.nb_frames || fail('Muxed preview frame count differs from source video');
  outputAudio?.codec_name === 'aac' && Number(outputAudio.sample_rate) === 48000 && outputAudio.channels === 2
    || fail('Muxed preview does not contain the audited AAC 48kHz stereo mix');
  Math.abs(Number(outputProbe.format?.duration) - Number(inputProbe.format?.duration)) <= 0.15
    || fail('Muxed preview duration differs from source video');
  writeJson(join(partialDir, 'metadata.json'), {
    schemaVersion: 1,
    episodeId: EPISODE_ID,
    fingerprint: task.fingerprint,
    sourceVideo: {path: rel(input), sha256: task.sourceSha256},
    audioMix: {path: rel(mixTask.mix), sha256: task.audioSha256, fingerprint: mixTask.fingerprint},
    outputSha256: shaFile(partialVideo),
    durationSeconds: Number(outputProbe.format.duration),
    width: outputVideo.width,
    height: outputVideo.height,
    fps: frameRate(outputVideo),
    frames: Number(outputVideo.nb_frames),
    createdAt: new Date().toISOString(),
  });
  mkdirSync(dirname(task.dir), {recursive: true});
  if (existsSync(task.dir)) rmSync(task.dir, {recursive: true, force: true});
  renameSync(partialDir, task.dir);
  previewEpisodeCacheHit(task) || fail('Episode preview cache validation failed after mux');
  return task;
};

const muxPreview = async (ctx) => {
  FLAGS.has('output') && fail('Preview output is fixed at tmp/preview/episode.mp4; --output is not supported');
  const videoFlag = FLAGS.get('video');
  typeof videoFlag === 'string' && videoFlag !== 'true'
    || fail('preview requires --video=<episode-local source mp4> the first time');
  const input = resolveEpisodeInputPath(ctx, videoFlag, 'Input video');
  existsSync(input) || fail(`Input video not found: ${rel(input)}`);
  input !== ctx.preview.episode || fail('Use preview without --video to inspect the existing stable episode view');
  const plan = await resolvePlan(ctx);
  for (const task of plan.tasks) cacheHit(task) || fail(`${task.scene.narration.segmentId}: TTS cache is missing or stale`);
  const mixTask = mixTaskFor(ctx, plan.tasks);
  mixCacheHit(mixTask) || fail('Audio mix cache is missing or stale; run audio-preview first');
  validateAuditedMix(ctx, mixTask);
  const cacheTask = await ensureEpisodePreviewCache(ctx, input, mixTask);
  const metadata = json(cacheTask.metadata);
  const materialization = materializeAtomic(cacheTask.episode, ctx.preview.episode);
  updatePreviewManifest(ctx, {
    episode: {
      path: rel(ctx.preview.episode),
      cachePath: rel(cacheTask.episode),
      fingerprint: cacheTask.fingerprint,
      sha256: metadata.outputSha256,
      durationSeconds: metadata.durationSeconds,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      frames: metadata.frames,
      audioMixSha256: cacheTask.audioSha256,
      audioMixFingerprint: mixTask.fingerprint,
      materialization,
    },
  });
  console.log(`READY ${rel(ctx.preview.episode)}`);
  console.log(`REVIEW ${rel(ctx.preview.report)}`);
  console.log(`MANIFEST ${rel(ctx.preview.manifest)}`);
  console.log('BLOCK candidate/current/release: draft preview is not a promotable artifact');
};

const materializeScenePreview = async (ctx) => {
  FLAGS.has('output') && fail('Scene preview paths are fixed; --output is not supported');
  const sceneId = FLAGS.get('scene');
  typeof sceneId === 'string' && sceneId !== 'true' || fail('Scene preview requires --scene=<scene-id>');
  const sceneIndex = ctx.episode.scenes.findIndex((scene) => scene.id === sceneId);
  sceneIndex >= 0 || fail(`Unknown scene: ${sceneId}`);
  const videoFlag = FLAGS.get('video');
  typeof videoFlag === 'string' && videoFlag !== 'true' || fail('Scene preview requires --video=<episode-local source mp4>');
  const input = resolveEpisodeInputPath(ctx, videoFlag, 'Scene input video');
  existsSync(input) || fail(`Scene input video not found: ${rel(input)}`);
  const scene = ctx.episode.scenes[sceneIndex];
  const probe = await probeMedia(ctx, input, `${scene.narration.segmentId}-ffprobe.log`);
  const video = probe.streams?.find((stream) => Number.isFinite(stream.width));
  video || fail('Scene preview has no video stream');
  Math.abs(Number(probe.format?.duration) - scene.duration) <= 0.2
    || fail(`${sceneId}: preview duration ${probe.format?.duration}s != scene ${scene.duration}s`);
  const filename = orderedSceneFilename(sceneIndex, sceneId);
  const sourceSha256 = shaFile(input);
  const fingerprint = sha(JSON.stringify({
    schema: 1,
    episodeId: EPISODE_ID,
    sceneId,
    sourceSha256,
    width: video.width,
    height: video.height,
    fps: frameRate(video),
  }));
  const cacheDir = join(ctx.cache, 'scenes', fingerprint);
  const cachePath = join(cacheDir, filename);
  if (!existsSync(cachePath) || shaFile(cachePath) !== sourceSha256) {
    const partialDir = `${cacheDir}.partial-${process.pid}`;
    rmSync(partialDir, {recursive: true, force: true});
    mkdirSync(partialDir, {recursive: true});
    materialize(input, join(partialDir, filename));
    writeJson(join(partialDir, 'metadata.json'), {
      schemaVersion: 1,
      episodeId: EPISODE_ID,
      sceneId,
      fingerprint,
      sourceSha256,
      durationSeconds: Number(probe.format.duration),
      width: video.width,
      height: video.height,
      fps: frameRate(video),
      frames: Number(video.nb_frames),
      createdAt: new Date().toISOString(),
    });
    if (existsSync(cacheDir)) rmSync(cacheDir, {recursive: true, force: true});
    renameSync(partialDir, cacheDir);
  }
  const target = join(ctx.preview.scenes, filename);
  const materialization = materializeAtomic(cachePath, target);
  const previous = currentPreviewManifest(ctx);
  updatePreviewManifest(ctx, {
    scenes: {
      ...(previous.scenes ?? {}),
      [sceneId]: {
        filename,
        path: rel(target),
        cachePath: rel(cachePath),
        fingerprint,
        sha256: sourceSha256,
        durationSeconds: Number(probe.format.duration),
        width: video.width,
        height: video.height,
        fps: frameRate(video),
        materialization,
      },
    },
  });
  console.log(`READY ${rel(target)}`);
  console.log(`REVIEW ${rel(ctx.preview.report)}`);
};

const restorePreviewViews = (ctx) => {
  const recorded = ctx.state.preview ?? currentPreviewManifest(ctx);
  const episode = episodePreviewMatchesAudio(recorded.episode, recorded.audio) ? recorded.episode : null;
  const scenes = recorded.scenes ?? {};
  const audio = recorded.audio;
  const restoredScenes = {};
  if (recorded.episode && !episode) rmSync(ctx.preview.episode, {force: true});
  if (episode?.cachePath) {
    const cachePath = resolve(ROOT, episode.cachePath);
    existsSync(cachePath) || fail(`Recorded episode preview cache is missing: ${episode.cachePath}`);
    const materialization = materializeAtomic(cachePath, ctx.preview.episode);
    Object.assign(episode, {path: rel(ctx.preview.episode), materialization});
  }
  for (const [sceneId, scene] of Object.entries(scenes)) {
    const cachePath = resolve(ROOT, scene.cachePath);
    existsSync(cachePath) || fail(`Recorded scene preview cache is missing: ${scene.cachePath}`);
    const target = join(ctx.preview.scenes, scene.filename);
    restoredScenes[sceneId] = {
      ...scene,
      path: rel(target),
      materialization: materializeAtomic(cachePath, target),
    };
  }
  if (audio?.mixCachePath) {
    const mixCachePath = resolve(ROOT, audio.mixCachePath);
    existsSync(mixCachePath) || fail(`Recorded audio mix cache is missing: ${audio.mixCachePath}`);
    materializeAtomic(mixCachePath, join(ctx.preview.audio, 'mix.m4a'));
  }
  updatePreviewManifest(ctx, {
    episode: episode ?? null,
    scenes: restoredScenes,
    audio: audio ?? null,
    review: {audioAuditPath: existsSync(ctx.preview.audioAudit) ? rel(ctx.preview.audioAudit) : null},
  });
};

const preview = async (ctx) => {
  FLAGS.has('output') && fail('Preview paths are fixed; --output is not supported');
  if (FLAGS.has('scene')) return materializeScenePreview(ctx);
  if (FLAGS.has('video')) return muxPreview(ctx);
  restorePreviewViews(ctx);
  existsSync(ctx.preview.episode)
    || fail('Stable preview is missing; run preview with --video=<episode-local source mp4>');
  console.log(`READY ${rel(ctx.preview.episode)}`);
  console.log(`REVIEW ${rel(ctx.preview.report)}`);
  console.log(`MANIFEST ${rel(ctx.preview.manifest)}`);
};

const previewCleanupTargets = (ctx) => {
  const targets = [];
  const collect = (directory, keep) => {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
      if (!keep.has(entry.name)) targets.push(join(directory, entry.name));
    }
  };
  collect(ctx.preview.previewRoot, stablePreviewRootEntries);
  collect(ctx.preview.audio, stableAudioPreviewEntries);
  collect(ctx.preview.review, stableReviewEntries);
  return targets;
};

const clean = (ctx) => {
  const apply = applyWasExplicitlyEnabled(FLAGS.get('apply'));
  const targets = previewCleanupTargets(ctx);
  console.log(`${apply ? 'APPLY' : 'DRY-RUN'} preview cleanup: ${targets.length} legacy entries`);
  for (const target of targets) {
    console.log(`${apply ? 'REMOVE' : 'WOULD REMOVE'} ${rel(target)}`);
    if (apply) rmSync(target, {recursive: true, force: true});
  }
  if (!apply && targets.length > 0) console.log('Re-run with --apply=true after reviewing the exact paths.');
};

const blocked = new Set(['build', 'approve', 'promote', 'release-build', 'release-audit', 'release-approve', 'publish']);

try {
  const ctx = context();
  if (COMMAND === 'validate') {
    narrationSource(ctx);
    console.log(`Validated ${EPISODE_ID}: ${ctx.episode.scenes.length} scenes, ${ctx.episode.durationSeconds}s`);
  } else if (COMMAND === 'plan') {
    printPlan(ctx, await resolvePlan(ctx));
  } else if (COMMAND === 'tts') {
    await ttsBootstrap(ctx);
  } else if (COMMAND === 'audio-preview') {
    await audioPreview(ctx);
  } else if (COMMAND === 'audio-audit') {
    await audioAudit(ctx);
  } else if (COMMAND === 'preview') {
    await preview(ctx);
  } else if (COMMAND === 'mux-preview') {
    console.warn('DEPRECATED mux-preview: use preview --video=<episode-local source mp4>');
    await muxPreview(ctx);
  } else if (COMMAND === 'clean') {
    clean(ctx);
  } else if (COMMAND === 'status') {
    await status(ctx);
  } else if (blocked.has(COMMAND)) {
    fail(`BLOCKED ${COMMAND}: Claude Code Course unified Candidate/Current/Release adapter is not implemented`);
  } else {
    fail('Usage: claude-code-course validate|plan|tts|audio-preview|audio-audit|preview|clean|status <episode-id> [--scenes=scene-id] [--scene=scene-id] [--force] [--video=episode-local.mp4] [--apply=true]');
  }
} catch (error) {
  console.error(`claude-code-course: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
