import {execFile} from 'node:child_process';
import {promises as fs} from 'node:fs';
import {join, relative, resolve, sep} from 'node:path';
import {promisify} from 'node:util';

const exec = promisify(execFile);
const EPISODE_PATTERN = /^ep\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const isEpisodeId = (value) => EPISODE_PATTERN.test(value);

const SCENE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACTIONS = new Set(['preview', 'build', 'approve', 'promote', 'release-build', 'release-audit', 'release-approve', 'publish']);

export const actionArgs = ({action, episodeId, sceneId, note}) => {
  if (!ACTIONS.has(action)) throw new Error(`Unsupported action: ${action}`);
  if (!isEpisodeId(episodeId)) throw new Error('Invalid episode id.');
  if (action === 'preview') {
    if (!SCENE_PATTERN.test(sceneId ?? '')) throw new Error('Preview requires a valid scene id.');
    return [action, episodeId, `--scenes=${sceneId}`];
  }
  if (action === 'approve' || action === 'release-approve') {
    const reviewNote = String(note ?? '').trim();
    if (reviewNote.length < 2 || reviewNote.length > 500) throw new Error('Approval note must contain 2–500 characters.');
    return [action, episodeId, `--note=${reviewNote}`];
  }
  return [action, episodeId];
};

export const nextAction = ({activity, dirty, artifacts, verdicts, manifests}) => {
  if (activity) return null;
  if (dirty > 0 || !artifacts.candidate || ['missing', 'fail'].includes(verdicts.main.verdict)) {
    return {action: 'build', label: 'Candidate 需要更新', cta: '开始构建', description: `${dirty || '缺失'} 个任务等待重新计算`, requiresNote: false, risk: 'normal'};
  }
  if (verdicts.main.verdict === 'needs_review') {
    return {action: 'approve', label: 'Main 等待确认', cta: '确认通过', description: '填写本轮结论后批准 Candidate', requiresNote: true, risk: 'review'};
  }
  if (verdicts.main.verdict === 'pass' && manifests.candidateSha !== manifests.currentSha) {
    return {action: 'promote', label: 'Candidate 已批准', cta: '更新 Current', description: '将批准版本设为 Current', requiresNote: false, risk: 'high'};
  }
  if (!artifacts.releaseCandidate) {
    return {action: 'release-build', label: '尚无发布候选', cta: '生成 Release', description: '基于 Current 生成 UHD 版本', requiresNote: false, risk: 'normal'};
  }
  if (['missing', 'fail'].includes(verdicts.release.verdict) || manifests.releaseCandidateSha !== verdicts.release.artifactSha256) {
    return {action: 'release-audit', label: 'Release 等待机器检查', cta: '开始检查', description: '生成发布候选的完整检查证据', requiresNote: false, risk: 'normal'};
  }
  if (verdicts.release.verdict === 'needs_review') {
    return {action: 'release-approve', label: 'Release 等待确认', cta: '确认通过', description: '填写本轮结论后批准发布候选', requiresNote: true, risk: 'review'};
  }
  if (verdicts.release.verdict === 'pass' && manifests.releaseCandidateSha !== manifests.publishedReleaseSha) {
    return {action: 'publish', label: 'Release 已批准', cta: '发布', description: '将批准版本设为正式发布版', requiresNote: false, risk: 'high'};
  }
  return null;
};

export const parseStatus = (stdout) => {
  const result = {renders: {}, tts: {}, verdicts: {main: 'missing', release: 'missing'}};
  for (const line of stdout.split(/\r?\n/)) {
    const task = line.match(/^(HIT|BUILD)\s+(render|tts)\s+(.+?)\s*$/);
    if (task) {
      const [, state, kind, id] = task;
      result[kind === 'render' ? 'renders' : 'tts'][id] = state.toLowerCase();
      continue;
    }
    const verdict = line.match(/^(main|release)\s+verdict:\s+(\S+)/);
    if (verdict) result.verdicts[verdict[1]] = verdict[2];
  }
  return result;
};

export const repoFile = (repoRoot, relativePath, allowedRoot = 'remotion/renders/git-course') => {
  const allowed = resolve(repoRoot, allowedRoot);
  const target = resolve(repoRoot, relativePath);
  if (target !== allowed && !target.startsWith(`${allowed}${sep}`)) throw new Error('Path is outside the Git Course artifact root.');
  return target;
};

const optionalJson = async (path) => {
  try {
    return JSON.parse(await fs.readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};

const optionalStat = async (path) => {
  try {
    return await fs.stat(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};

const directoryBytes = async (root, seen) => {
  const visit = async (path) => {
    const stat = await optionalStat(path);
    if (!stat) return 0;
    const inode = `${stat.dev}:${stat.ino}`;
    if (seen.has(inode)) return 0;
    seen.add(inode);
    if (!stat.isDirectory()) return stat.size;
    const entries = await fs.readdir(path, {withFileTypes: true});
    const sizes = await Promise.all(entries.map((entry) => visit(join(path, entry.name))));
    return sizes.reduce((sum, size) => sum + size, 0);
  };
  return visit(root);
};

const storageBytes = async (base, current) => {
  const seen = new Set();
  const cache = await directoryBytes(join(base, 'tmp/cache'), seen);
  const build = await directoryBytes(join(base, 'tmp/build'), seen);
  const preview = await directoryBytes(join(base, 'tmp/preview'), seen);
  const promoted = await directoryBytes(current, seen);
  return [cache, build, preview, promoted];
};

const toRepoPath = (repoRoot, path) => relative(repoRoot, path).split(sep).join('/');
const fileUrl = (path) => path ? `/files/${path.split('/').map(encodeURIComponent).join('/')}` : null;
const artifact = async (repoRoot, path) => {
  const stat = await optionalStat(path);
  if (!stat?.isFile()) return null;
  const repoPath = toRepoPath(repoRoot, path);
  return {path: repoPath, url: fileUrl(repoPath), bytes: stat.size, updatedAt: stat.mtime.toISOString()};
};

const readStatus = async (repoRoot, episodeId) => {
  try {
    const {stdout} = await exec(process.execPath, ['remotion/scripts/git-course-cli.mjs', 'status', episodeId], {
      cwd: repoRoot,
      timeout: 20000,
      maxBuffer: 4 * 1024 * 1024,
    });
    return {...parseStatus(stdout), error: null};
  } catch (error) {
    return {renders: {}, tts: {}, verdicts: {main: 'missing', release: 'missing'}, error: error.stderr?.trim() || error.message};
  }
};

const verdictSummary = (verdict) => verdict ? {
  verdict: verdict.verdict ?? 'missing',
  artifactSha256: verdict.artifactSha256 ?? null,
  createdAt: verdict.createdAt ?? null,
  approval: verdict.approval ?? null,
  checks: Array.isArray(verdict.checks) ? verdict.checks : [],
  evidence: verdict.evidence ?? {},
} : {verdict: 'missing', artifactSha256: null, createdAt: null, approval: null, checks: [], evidence: {}};

export const loadEpisode = async (repoRoot, episodePath) => {
  const episode = JSON.parse(await fs.readFile(episodePath, 'utf8'));
  if (!isEpisodeId(episode.episodeId)) throw new Error(`Invalid episode id in ${episodePath}`);
  const id = episode.episodeId;
  const base = join(repoRoot, 'remotion/renders/git-course', id);
  const build = join(base, 'tmp/build');
  const current = join(base, 'current');
  const [
    status,
    state,
    artifactManifest,
    previewManifest,
    mainVerdictRaw,
    releaseVerdictRaw,
    currentVerdictRaw,
    publishedReleaseVerdictRaw,
    activity,
    candidate,
    currentMain,
    releaseCandidate,
    releaseMain,
    mainReport,
    releaseReport,
    storage,
  ] = await Promise.all([
    readStatus(repoRoot, id),
    optionalJson(join(build, 'state.json')),
    optionalJson(join(build, 'artifact-manifest.json')),
    optionalJson(join(base, 'tmp/preview/manifest.json')),
    optionalJson(join(build, 'audit/main/verdict.json')),
    optionalJson(join(build, 'audit/release/verdict.json')),
    optionalJson(join(current, 'audit/verdict.json')),
    optionalJson(join(current, 'release/verdict.json')),
    optionalJson(join(build, 'activity.json')),
    artifact(repoRoot, join(build, `candidate/${id}.mp4`)),
    artifact(repoRoot, join(current, `${id}.mp4`)),
    artifact(repoRoot, join(build, `release-candidate/${id}.mp4`)),
    artifact(repoRoot, join(current, `release/${id}.mp4`)),
    artifact(repoRoot, join(build, 'audit/main/report.html')),
    artifact(repoRoot, join(build, 'audit/release/report.html')),
    storageBytes(base, current),
  ]);
  const mainVerdict = verdictSummary(mainVerdictRaw);
  const releaseVerdict = verdictSummary(releaseVerdictRaw);
  const candidateSha = artifactManifest?.sha256 ?? null;
  const currentSha = currentVerdictRaw?.artifactSha256 ?? null;
  const releaseManifest = await optionalJson(join(build, 'release-artifact-manifest.json'));
  const releaseCandidateSha = releaseManifest?.sha256 ?? null;
  const publishedReleaseSha = publishedReleaseVerdictRaw?.artifactSha256 ?? null;
  const scenes = episode.scenes.map((scene, index) => {
    const segmentId = scene.narration?.segmentId ?? null;
    const preview = previewManifest?.scenes?.[scene.id];
    const previewPath = preview?.previewPath ?? null;
    return {
      index: index + 1,
      id: scene.id,
      title: scene.title ?? scene.id,
      start: scene.start,
      duration: scene.duration,
      goal: scene.goal ?? '',
      segmentId,
      renderState: status.renders[scene.id] ?? 'unknown',
      ttsState: segmentId ? status.tts[segmentId] ?? 'unknown' : 'unknown',
      cachePath: state?.scenes?.[scene.id]?.path ?? null,
      preview: previewPath ? {path: previewPath, url: fileUrl(previewPath)} : null,
    };
  });
  const dirty = scenes.filter((scene) => scene.renderState === 'build' || scene.ttsState === 'build').length;
  const result = {
    id,
    title: episode.title ?? id,
    durationSeconds: episode.durationSeconds,
    fps: episode.fps,
    resolution: episode.resolution,
    sceneCount: scenes.length,
    dirty,
    statusError: status.error,
    activity,
    stages: {
      source: 'ready',
      tasks: status.error ? 'unknown' : dirty > 0 ? 'dirty' : 'ready',
      candidate: candidate ? 'ready' : 'missing',
      audit: mainVerdict.verdict,
      current: currentMain ? 'ready' : 'missing',
      release: releaseVerdict.verdict,
    },
    scenes,
    artifacts: {candidate, current: currentMain, releaseCandidate, release: releaseMain, mainReport, releaseReport},
    manifests: {
      artifactSha256: candidateSha,
      candidateSha,
      currentSha,
      releaseCandidateSha,
      publishedReleaseSha,
      audioFileCount: artifactManifest?.audioFiles?.length ?? 0,
      previewUpdatedAt: previewManifest?.updatedAt ?? null,
    },
    verdicts: {main: mainVerdict, release: releaseVerdict},
    storage: {cache: storage[0], build: storage[1], preview: storage[2], current: storage[3]},
  };
  result.nextAction = nextAction(result);
  result.attention = activity ? 'running'
    : mainVerdict.verdict === 'fail' || releaseVerdict.verdict === 'fail' ? 'failed'
    : dirty > 0 ? 'dirty'
    : mainVerdict.verdict === 'needs_review' || releaseVerdict.verdict === 'needs_review' ? 'review'
    : result.nextAction ? 'ready'
    : 'complete';
  return result;
};

export const loadDashboard = async (repoRoot) => {
  const episodeRoot = join(repoRoot, 'git-course/episodes');
  const names = (await fs.readdir(episodeRoot)).filter((name) => /^ep.*\.json$/.test(name)).sort();
  const settled = await Promise.allSettled(names.map((name) => loadEpisode(repoRoot, join(episodeRoot, name))));
  const episodes = [];
  const errors = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') episodes.push(result.value);
    else errors.push({file: names[index], message: result.reason?.message ?? String(result.reason)});
  });
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    episodes,
    errors,
    summary: {
      episodes: episodes.length,
      dirty: episodes.reduce((sum, episode) => sum + episode.dirty, 0),
      needsReview: episodes.filter((episode) => episode.attention === 'review').length,
      failed: episodes.filter((episode) => episode.attention === 'failed').length,
      busy: episodes.filter((episode) => episode.activity).length,
    },
  };
};
