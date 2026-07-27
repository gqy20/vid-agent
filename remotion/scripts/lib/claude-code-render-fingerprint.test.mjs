import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {claudeCodeChapterSourceFingerprint} from './claude-code-render-fingerprint.mjs';

test('chapter source fingerprint ignores package scripts but tracks runtime dependencies', () => {
  const repositoryRoot = mkdtempSync(join(tmpdir(), 'claude-code-fingerprint-'));
  const remotionRoot = join(repositoryRoot, 'remotion');
  const episodeRoot = join(remotionRoot, 'src/videos/claude-code-course/episodes');
  mkdirSync(episodeRoot, {recursive: true});
  writeFileSync(join(episodeRoot, 'Ep01Sample.tsx'), 'export const Ep01Sample = () => null;\n');
  writeFileSync(join(repositoryRoot, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
  const packagePath = join(remotionRoot, 'package.json');
  const episode = {episodeId: 'ep01-sample', compositionId: 'ClaudeCodeCourseEp01Sample'};
  const fingerprint = () => claudeCodeChapterSourceFingerprint({remotionRoot, repositoryRoot, episode});
  try {
    writeFileSync(packagePath, JSON.stringify({scripts: {test: 'one'}, dependencies: {remotion: '4.0.0'}}));
    const initial = fingerprint();
    writeFileSync(packagePath, JSON.stringify({scripts: {test: 'two'}, dependencies: {remotion: '4.0.0'}}));
    assert.equal(fingerprint(), initial);
    writeFileSync(packagePath, JSON.stringify({scripts: {test: 'two'}, dependencies: {remotion: '4.0.1'}}));
    assert.notEqual(fingerprint(), initial);
  } finally {
    rmSync(repositoryRoot, {recursive: true, force: true});
  }
});
