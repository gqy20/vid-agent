#!/usr/bin/env node

import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {performance} from 'node:perf_hooks';

const planPath = process.argv[2];
if (!planPath) throw new Error('Usage: git-course-render-scenes.mjs <plan.json>');

const plan = JSON.parse(readFileSync(resolve(planPath), 'utf8'));
if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) throw new Error('Render plan has no tasks.');

const startedAt = performance.now();
const serveUrl = await bundle({
  entryPoint: resolve(plan.entryPoint ?? 'src/index.ts'),
  onProgress: () => undefined,
  symlinkPublicDir: true,
});
const bundledAt = performance.now();
const composition = await selectComposition({
  serveUrl,
  id: plan.compositionId,
  inputProps: {},
  browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
  timeoutInMilliseconds: plan.timeoutInMilliseconds ?? 120000,
  logLevel: 'warn',
});

const results = await Promise.all(plan.tasks.map(async (task) => {
    const taskStartedAt = performance.now();
    const output = resolve(task.output);
    const partial = `${output}.partial.mp4`;
    mkdirSync(dirname(output), {recursive: true});
    await renderMedia({
      composition,
      serveUrl,
      browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
      codec: 'h264',
      pixelFormat: 'yuv420p',
      imageFormat: 'jpeg',
      jpegQuality: 80,
      outputLocation: partial,
      frameRange: [task.start, task.end],
      concurrency: task.concurrency,
      timeoutInMilliseconds: plan.timeoutInMilliseconds ?? 120000,
      muted: true,
      overwrite: true,
      logLevel: 'warn',
    });
    renameSync(partial, output);
    return {
      sceneId: task.sceneId,
      start: task.start,
      end: task.end,
      concurrency: task.concurrency,
      elapsedSeconds: Number(((performance.now() - taskStartedAt) / 1000).toFixed(3)),
      output,
    };
}));

const telemetry = {
    schemaVersion: 1,
    compositionId: plan.compositionId,
    bundleSeconds: Number(((bundledAt - startedAt) / 1000).toFixed(3)),
    totalSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(3)),
    logicalCpus: plan.logicalCpus,
    tasks: results,
};
if (plan.telemetryPath) {
  const output = resolve(plan.telemetryPath);
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, `${JSON.stringify(telemetry, null, 2)}\n`);
}
console.log(JSON.stringify(telemetry));
