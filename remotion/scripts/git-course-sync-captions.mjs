#!/usr/bin/env node

import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const episodeId = process.argv[2];
if (!episodeId) throw new Error('Usage: node scripts/git-course-sync-captions.mjs <episode-id>');
const fitScenes = process.argv.includes('--fit-scenes');
const DEFAULT_NARRATION_LEAD = 0.75;

const episodePath = join(ROOT, 'git-course/episodes', `${episodeId}.json`);
const episode = JSON.parse(readFileSync(episodePath, 'utf8'));
if (episode.episodeId !== episodeId) throw new Error(`${episodePath}: episodeId mismatch`);

const parseTimestamp = (value) => {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/);
  if (!match) throw new Error(`Invalid SRT timestamp: ${value}`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
};

const parseSrt = (path) => readFileSync(path, 'utf8').trim().split(/\r?\n\s*\r?\n/).filter(Boolean).map((block) => {
  const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (/^\d+$/.test(lines[0] ?? '')) lines.shift();
  const timing = lines.shift()?.match(/^(.+?)\s+-->\s+(.+)$/);
  if (!timing) throw new Error(`Invalid SRT cue in ${path}`);
  return {from: parseTimestamp(timing[1]), to: parseTimestamp(timing[2]), text: lines.join(' ')};
});

const fitPlan = fitScenes ? episode.scenes.map((scene) => {
  const audioPath = join(ROOT, 'remotion/renders/git-course', episodeId, 'tmp/preview/audio/segments', `${scene.narration.segmentId}_norm.mp3`);
  const audioDuration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', audioPath], {encoding: 'utf8'}).trim());
  const sourceLead = DEFAULT_NARRATION_LEAD;
  const tightDuration = Math.ceil((sourceLead + audioDuration + 1.5) * 2) / 2;
  return {audioDuration, sourceLead, tightDuration};
}) : [];

const tightTotal = fitPlan.reduce((sum, item) => sum + item.tightDuration, 0);
let extraHalves = Math.max(0, Math.round((150 - tightTotal) * 2));
const leadPadding = fitPlan.map((_, index) => {
  const scenesLeft = fitPlan.length - index;
  const halves = Math.floor(extraHalves / scenesLeft);
  extraHalves -= halves;
  return halves / 2;
});

let sceneCursor = 0;
for (const [index, scene] of episode.scenes.entries()) {
  const srtPath = join(ROOT, 'remotion/renders/git-course', episodeId, 'tmp/preview/audio/segments', `${scene.narration.segmentId}.srt`);
  const localVoiceStart = fitScenes ? fitPlan[index].sourceLead + leadPadding[index] : scene.narration.voiceStart - scene.start;
  const captions = parseSrt(srtPath).map((cue) => ({
    from: Number((localVoiceStart + cue.from).toFixed(3)),
    to: Number((localVoiceStart + cue.to).toFixed(3)),
    text: cue.text,
  }));
  if (captions.length === 0) throw new Error(`${scene.id}: no caption cues`);
  scene.captions = captions;
  if (fitScenes) {
    scene.start = sceneCursor;
    scene.duration = fitPlan[index].tightDuration + leadPadding[index];
    scene.narration.voiceStart = Number((scene.start + localVoiceStart).toFixed(2));
    sceneCursor += scene.duration;
  }
  if (captions.some((cue) => cue.from < 0 || cue.to > scene.duration || cue.to <= cue.from)) {
    throw new Error(`${scene.id}: caption cue escapes ${scene.duration}s scene window`);
  }
}

if (fitScenes) episode.durationSeconds = sceneCursor;

writeFileSync(episodePath, `${JSON.stringify(episode, null, 2)}\n`);
console.log(`Synced ${episode.scenes.reduce((sum, scene) => sum + scene.captions.length, 0)} caption cues into ${episodeId}.json${fitScenes ? `; fitted duration ${episode.durationSeconds}s` : ''}`);
