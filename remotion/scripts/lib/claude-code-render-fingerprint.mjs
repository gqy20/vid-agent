import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, extname, join, relative, resolve} from 'node:path';

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const sha256File = (path) => sha256(readFileSync(path));

const fingerprintEntries = ({files, repositoryRoot}) => files
  .sort((a, b) => a.localeCompare(b))
  .map((path) => [relative(repositoryRoot, path).replaceAll('\\', '/'), sha256File(path)]);

export const claudeCodeBundleSourceFingerprint = ({remotionRoot, repositoryRoot}) => {
  const files = [];
  const collect = (directory) => {
    for (const entry of readdirSync(directory, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (['.ts', '.tsx', '.js', '.mjs', '.json'].includes(extname(entry.name))) files.push(path);
    }
  };
  collect(join(remotionRoot, 'src'));
  collect(join(repositoryRoot, 'claude-code-course/episodes'));
  for (const path of [join(remotionRoot, 'package.json'), join(repositoryRoot, 'pnpm-lock.yaml')]) {
    if (existsSync(path)) files.push(path);
  }
  return sha256(JSON.stringify(fingerprintEntries({files, repositoryRoot})));
};

const resolveLocalImport = (fromPath, specifier) => {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromPath), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, `${base}.json`, join(base, 'index.ts'), join(base, 'index.tsx')];
  return candidates.find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
};

export const claudeCodeChapterSourceFingerprint = ({remotionRoot, repositoryRoot, episode}) => {
  const componentName = episode.compositionId.replace(/^ClaudeCodeCourse/, '');
  const componentPath = join(remotionRoot, 'src/videos/claude-code-course/episodes', `${componentName}.tsx`);
  existsSync(componentPath) || (() => { throw new Error(`${episode.episodeId}: component source is missing for ${episode.compositionId}`); })();
  const files = new Set();
  const addPublicAsset = (path) => {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isFile()) {
      files.add(path);
      return;
    }
    if (!stat.isDirectory()) return;
    for (const entry of readdirSync(path, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))) {
      addPublicAsset(join(path, entry.name));
    }
  };
  const visit = (path) => {
    if (files.has(path)) return;
    files.add(path);
    const source = readFileSync(path, 'utf8');
    const publicAssets = source.matchAll(/['"](claude-code-course\/[^'"]+)['"]/g);
    for (const match of publicAssets) {
      addPublicAsset(join(remotionRoot, 'public', match[1]));
    }
    const imports = source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g);
    for (const match of imports) {
      const dependency = resolveLocalImport(path, match[1]);
      if (dependency) visit(dependency);
    }
  };
  visit(componentPath);
  for (const path of [join(remotionRoot, 'package.json'), join(repositoryRoot, 'pnpm-lock.yaml')]) {
    if (existsSync(path)) files.add(path);
  }
  return sha256(JSON.stringify(fingerprintEntries({files: [...files], repositoryRoot})));
};

export const chapterVisualFingerprint = ({episodePath, episode, sourceFingerprint, scale}) => sha256(JSON.stringify({
  schema: 2,
  episodeSha256: sha256File(episodePath),
  sourceFingerprint,
  compositionId: episode.compositionId,
  fps: episode.fps,
  resolution: episode.resolution,
  durationSeconds: episode.durationSeconds,
  scale,
  muted: true,
  codec: 'h264-yuv420p-crf18',
  renderer: 'chapter-render-v2-ffprobe',
  evidence: episode.productionPolicy?.recordingEvidence ?? null,
}));
