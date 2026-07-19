#!/usr/bin/env node

import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {performance} from 'node:perf_hooks';

const planPath = process.argv[2];
if (!planPath) throw new Error('Usage: git-course-render-scenes.mjs <plan.json>');

const plan = JSON.parse(readFileSync(resolve(planPath), 'utf8'));
if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) throw new Error('Render plan has no tasks.');

const processIsAlive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

const startedAt = performance.now();
const bundleDir = resolve(plan.bundleDir);
const bundleReady = `${bundleDir}/bundle-ready.json`;
const bundleIsReady = () => {
  if (!existsSync(`${bundleDir}/index.html`) || !existsSync(bundleReady)) return false;
  try {
    return JSON.parse(readFileSync(bundleReady, 'utf8')).bundleFingerprint === plan.bundleFingerprint;
  } catch {
    return false;
  }
};
const bundleCacheHit = bundleIsReady();
let serveUrl = bundleDir;
if (!bundleCacheHit) {
  const lockDir = `${bundleDir}.lock`;
  mkdirSync(dirname(bundleDir), {recursive: true});
  let ownsLock = false;
  const deadline = Date.now() + (plan.timeoutInMilliseconds ?? 120000);
  while (!bundleIsReady() && Date.now() < deadline) {
    try {
      mkdirSync(lockDir);
      writeFileSync(`${lockDir}/owner.json`, `${JSON.stringify({pid: process.pid, bundleFingerprint: plan.bundleFingerprint, startedAt: new Date().toISOString()})}\n`);
      ownsLock = true;
      break;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      let owner = null;
      try {
        owner = JSON.parse(readFileSync(`${lockDir}/owner.json`, 'utf8'));
      } catch {
        // The owner may still be initializing the lock.
      }
      const abandoned = owner ? !processIsAlive(owner.pid) : Date.now() - statSync(lockDir).mtimeMs > 30000;
      if (abandoned) {
        rmSync(lockDir, {recursive: true, force: true});
        continue;
      }
      await sleep(250);
    }
  }
  if (!bundleIsReady() && !ownsLock) throw new Error(`Timed out waiting for bundle lock: ${lockDir}`);
  if (ownsLock) {
    try {
      if (!bundleIsReady()) {
        rmSync(bundleDir, {recursive: true, force: true});
        serveUrl = await bundle({
          entryPoint: resolve(plan.entryPoint ?? 'src/index.ts'),
          outDir: bundleDir,
          onProgress: () => undefined,
          symlinkPublicDir: true,
        });
        const partialReady = `${bundleReady}.partial-${process.pid}`;
        writeFileSync(partialReady, `${JSON.stringify({schemaVersion: 1, bundleFingerprint: plan.bundleFingerprint})}\n`);
        renameSync(partialReady, bundleReady);
      }
    } finally {
      rmSync(lockDir, {recursive: true, force: true});
    }
  }
}
const bundledAt = performance.now();
const isUhd = plan.tasks.some((task) => (task.scale ?? 1) > 1);
const chromiumOptions = isUhd ? {gl: 'angle', enableMultiProcessOnLinux: true} : undefined;
const composition = await selectComposition({
  serveUrl,
  id: plan.compositionId,
  inputProps: {},
  browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
  timeoutInMilliseconds: plan.timeoutInMilliseconds ?? 120000,
  logLevel: 'warn',
  chromiumOptions,
});

const retryable = (error) => /Target closed|Session closed|got no response|browser crashed|Protocol error/i.test(error?.message ?? String(error));

const renderTask = async (task) => {
    const taskStartedAt = performance.now();
    const output = resolve(task.output);
    const partial = `${output}.partial.mp4`;
    mkdirSync(dirname(output), {recursive: true});
    const attempts = [...new Set([task.concurrency, Math.max(1, Math.floor(task.concurrency / 2)), task.fallbackConcurrency ?? 16])];
    let usedConcurrency = task.concurrency;
    let lastError;
    for (const attempt of attempts) {
      try {
        rmSync(partial, {force: true});
        await renderMedia({
          composition,
          serveUrl,
          browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE ?? undefined,
          chromiumOptions,
          codec: 'h264',
          pixelFormat: 'yuv420p',
          imageFormat: 'jpeg',
          jpegQuality: 80,
          outputLocation: partial,
          frameRange: [task.start, task.end],
          scale: task.scale ?? 1,
          concurrency: attempt,
          timeoutInMilliseconds: plan.timeoutInMilliseconds ?? 120000,
          muted: true,
          overwrite: true,
          logLevel: 'warn',
        });
        usedConcurrency = attempt;
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (!retryable(error)) break;
      }
    }
    if (lastError) throw lastError;
    renameSync(partial, output);
    const cacheOutput = resolve(task.cacheOutput);
    mkdirSync(dirname(cacheOutput), {recursive: true});
    copyFileSync(output, `${cacheOutput}.partial`);
    renameSync(`${cacheOutput}.partial`, cacheOutput);
    const result = {
      sceneId: task.sceneId,
      start: task.start,
      end: task.end,
      requestedConcurrency: task.concurrency,
      usedConcurrency,
      elapsedSeconds: Number(((performance.now() - taskStartedAt) / 1000).toFixed(3)),
      output,
      cacheOutput,
    };
    const completionPath = resolve(task.completionPath);
    mkdirSync(dirname(completionPath), {recursive: true});
    writeFileSync(completionPath, `${JSON.stringify(result, null, 2)}\n`);
    return result;
};

const settled = await Promise.allSettled(plan.tasks.map(renderTask));
const results = settled.filter((result) => result.status === 'fulfilled').map((result) => result.value);
const failures = settled.map((result, index) => ({result, index})).filter(({result}) => result.status === 'rejected').map(({result, index}) => ({sceneId: plan.tasks[index].sceneId, message: result.reason?.message ?? String(result.reason)}));

if (results.length > 0 && plan.profilePath) {
  const profilePath = resolve(plan.profilePath);
  const existing = existsSync(profilePath) ? JSON.parse(readFileSync(profilePath, 'utf8')) : {};
  const downgraded = results.filter((result) => result.usedConcurrency < result.requestedConcurrency);
  const stable = downgraded.length > 0
    ? Math.min(...downgraded.map((result) => result.usedConcurrency))
    : Math.max(existing.maxStableConcurrencyPerBrowser ?? 1, ...results.map((result) => result.usedConcurrency));
  mkdirSync(dirname(profilePath), {recursive: true});
  const partialProfile = `${profilePath}.partial-${process.pid}`;
  writeFileSync(partialProfile, `${JSON.stringify({...existing, schemaVersion: 1, maxStableConcurrencyPerBrowser: stable, updatedAt: new Date().toISOString()}, null, 2)}\n`);
  renameSync(partialProfile, profilePath);
}

const telemetry = {
    schemaVersion: 1,
    compositionId: plan.compositionId,
    bundleSeconds: Number(((bundledAt - startedAt) / 1000).toFixed(3)),
    bundleCacheHit,
    totalSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(3)),
    logicalCpus: plan.logicalCpus,
    tasks: results,
    failures,
};
if (plan.telemetryPath) {
  const output = resolve(plan.telemetryPath);
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, `${JSON.stringify(telemetry, null, 2)}\n`);
}
console.log(JSON.stringify(telemetry));
if (failures.length > 0) throw new Error(`${failures.length} scene render(s) failed:\n${failures.map((failure) => failure.message).join('\n')}`);
