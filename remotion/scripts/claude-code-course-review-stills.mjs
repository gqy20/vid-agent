#!/usr/bin/env node

import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const REMOTION = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(REMOTION, '..');
const EPISODES = join(ROOT, 'claude-code-course/episodes');
const specs = process.argv.slice(2);

if (specs.length === 0) {
  throw new Error('Usage: claude-code-course-review-stills.mjs <episode-id>:<second>[,<second>...] ...');
}

const tasks = specs.map((spec) => {
  const [episodeId, secondsText] = spec.split(':');
  const episodePath = join(EPISODES, `${episodeId}.json`);
  existsSync(episodePath) || (() => { throw new Error(`Episode not found: ${episodeId}`); })();
  const episode = JSON.parse(readFileSync(episodePath, 'utf8'));
  const seconds = secondsText.split(',').map(Number);
  seconds.every((value) => Number.isFinite(value) && value >= 0 && value < episode.durationSeconds)
    || (() => { throw new Error(`${episodeId}: invalid review second`); })();
  return {episode, seconds};
});

const taskRoot = join(REMOTION, 'renders/claude-code-course/tmp/tasks', `review-stills-${process.pid}`);
const bundleDir = join(taskRoot, 'bundle');
mkdirSync(bundleDir, {recursive: true});

try {
  const serveUrl = await bundle({
    entryPoint: join(REMOTION, 'src/index.ts'),
    outDir: bundleDir,
    onProgress: () => undefined,
    symlinkPublicDir: true,
  });
  for (const {episode, seconds} of tasks) {
    const composition = await selectComposition({
      serveUrl,
      id: episode.compositionId,
      inputProps: {},
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
      timeoutInMilliseconds: 120000,
      logLevel: 'warn',
    });
    const outputRoot = join(REMOTION, 'renders/claude-code-course', episode.episodeId, 'tmp/preview/review/keyframes');
    // keyframes/ is a stable, rebuildable view of one review request. Keeping
    // old frames here makes contact sheets silently mix different timelines.
    rmSync(outputRoot, {recursive: true, force: true});
    mkdirSync(outputRoot, {recursive: true});
    const frames = [];
    for (const second of seconds) {
      const frame = Math.round(second * episode.fps);
      const output = join(outputRoot, `${String(frame).padStart(6, '0')}.png`);
      await renderStill({
        composition,
        serveUrl,
        output,
        frame,
        imageFormat: 'png',
        browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
        timeoutInMilliseconds: 120000,
        logLevel: 'warn',
      });
      frames.push({second, frame, filename: `${String(frame).padStart(6, '0')}.png`});
      console.log(`${episode.episodeId}\t${second}s\t${output}`);
    }
    writeFileSync(join(outputRoot, 'manifest.json'), `${JSON.stringify({
      schemaVersion: 1,
      episodeId: episode.episodeId,
      compositionId: episode.compositionId,
      durationSeconds: episode.durationSeconds,
      frames,
      ownership: 'Rebuildable latest keyframe review view; not audit evidence.',
    }, null, 2)}\n`);
  }
} finally {
  rmSync(taskRoot, {recursive: true, force: true});
}
