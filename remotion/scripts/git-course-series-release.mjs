import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {basename, dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REMOTION = join(ROOT, 'remotion');
const COURSE_SOURCE = join(ROOT, 'git-course/course.json');
const COVER_SCRIPT = join(REMOTION, 'scripts/git-course-build-series-cover.mjs');
const COVER_KIT = join(REMOTION, 'scripts/git-course-cover-kit.mjs');
const SERIES_ROOT = join(REMOTION, 'renders/git-course/series');
const TMP = join(SERIES_ROOT, 'tmp');
const BUILD = join(TMP, 'build');
const COVER_CANDIDATE = join(TMP, 'cover-candidate');
const RELEASE_CANDIDATE = join(BUILD, 'release-candidate');
const AUDIT_DIR = join(BUILD, 'audit/release');
const CURRENT_RELEASE = join(SERIES_ROOT, 'current/release');
const AUDIT_POLICY_VERSION = 'git-course-series-static-v1';

const fail = (message) => {
  throw new Error(message);
};

const sha = (value) => createHash('sha256').update(value).digest('hex');
const shaFile = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const rel = (path) => relative(ROOT, path).replaceAll('\\', '/');

const writeJson = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  const partial = `${path}.partial`;
  writeFileSync(partial, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(partial, path);
};

const walkFiles = (root) => {
  if (!existsSync(root)) return [];
  const result = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else result.push(path);
    }
  };
  walk(root);
  return result.sort();
};

const atomicDirectorySwap = (next, current) => {
  const previous = `${current}.previous`;
  rmSync(previous, {recursive: true, force: true});
  if (existsSync(current)) renameSync(current, previous);
  try {
    renameSync(next, current);
  } catch (error) {
    if (!existsSync(current) && existsSync(previous)) renameSync(previous, current);
    throw error;
  }
  rmSync(previous, {recursive: true, force: true});
};

const parseFlags = (args) => {
  const flags = new Map();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) fail(`Unexpected argument: ${arg}`);
    const equals = arg.indexOf('=');
    if (equals >= 0) {
      flags.set(arg.slice(2, equals), arg.slice(equals + 1));
      continue;
    }
    const name = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith('--')) {
      flags.set(name, next);
      index += 1;
    } else {
      flags.set(name, '1');
    }
  }
  return flags;
};

const loadCourse = () => {
  existsSync(COURSE_SOURCE) || fail(`Course source missing: ${rel(COURSE_SOURCE)}`);
  const course = json(COURSE_SOURCE);
  course.schemaVersion === 1 || fail('course.json: schemaVersion must be 1.');
  course.courseId === 'git-course' || fail('course.json: courseId must be git-course.');
  typeof course.title === 'string' && course.title.trim() || fail('course.json: title is required.');
  typeof course.tagline === 'string' && course.tagline.trim() || fail('course.json: tagline is required.');
  typeof course.outlineSource === 'string' && course.outlineSource.trim() || fail('course.json: outlineSource is required.');
  const outlinePath = resolve(ROOT, course.outlineSource);
  outlinePath.startsWith(`${join(ROOT, 'git-course')}/`) || fail('course.json: outlineSource must stay inside git-course/.');
  existsSync(outlinePath) || fail(`Course outline missing: ${rel(outlinePath)}`);
  const release = course.release ?? fail('course.json: release is required.');
  const markdownFields = ['courseIntroMarkdown', 'bilibiliMarkdown', 'douyinMarkdown', 'coverBriefMarkdown', 'checklistMarkdown'];
  for (const field of markdownFields) typeof release[field] === 'string' && release[field].trim() || fail(`course.json: release.${field} is required.`);
  Array.isArray(release.covers) && release.covers.length === 2 || fail('course.json: release.covers must contain square and wide specs.');
  const coverIds = new Set();
  for (const cover of release.covers) {
    ['id', 'png', 'svg', 'generatedPng', 'generatedSvg'].forEach((field) => typeof cover[field] === 'string' && cover[field].trim() || fail(`course.json: cover.${field} is required.`));
    Number.isInteger(cover.width) && cover.width > 0 || fail(`course.json: ${cover.id}.width must be a positive integer.`);
    Number.isInteger(cover.height) && cover.height > 0 || fail(`course.json: ${cover.id}.height must be a positive integer.`);
    !coverIds.has(cover.id) || fail(`course.json: duplicate cover id ${cover.id}.`);
    coverIds.add(cover.id);
    for (const field of ['png', 'svg', 'generatedPng', 'generatedSvg']) basename(cover[field]) === cover[field] || fail(`course.json: ${cover.id}.${field} must be a filename.`);
  }
  coverIds.has('square') && coverIds.has('wide') || fail('course.json: square and wide cover specs are required.');
  return {course, outlinePath};
};

const fontSource = (family) => {
  const path = execFileSync('fc-match', ['-f', '%{file}', family], {encoding: 'utf8'}).trim();
  path && existsSync(path) || fail(`Font not found: ${family}`);
  return {family, file: basename(path), sha256: shaFile(path)};
};

const inputState = () => {
  const {course, outlinePath} = loadCourse();
  const repoInputs = [COURSE_SOURCE, outlinePath, COVER_SCRIPT, COVER_KIT].map((path) => ({path: rel(path), sha256: shaFile(path)}));
  const fonts = ['Inter Display', 'Noto Serif CJK SC', 'Noto Sans CJK SC', 'JetBrains Mono'].map(fontSource);
  const tools = {
    node: process.version,
    rsvgConvert: execFileSync('rsvg-convert', ['--version'], {encoding: 'utf8'}).trim(),
  };
  const inputFingerprint = sha(JSON.stringify({schema: 1, courseId: course.courseId, repoInputs, fonts, tools}));
  return {course, outlinePath, repoInputs, fonts, tools, inputFingerprint};
};

const packageFiles = (dir, manifestName) => walkFiles(dir)
  .filter((path) => basename(path) !== manifestName)
  .map((path) => ({
    path: relative(dir, path).replaceAll('\\', '/'),
    sha256: shaFile(path),
    bytes: statSync(path).size,
  }));

const packageSha = (files) => sha(JSON.stringify(files.map(({path, sha256, bytes}) => ({path, sha256, bytes}))));

const verifyManifestFiles = (dir, manifest, manifestName) => {
  Array.isArray(manifest.files) || fail(`${manifestName}: files must be an array.`);
  const actual = packageFiles(dir, manifestName);
  JSON.stringify(actual.map((item) => item.path)) === JSON.stringify(manifest.files.map((item) => item.path)) || fail(`${manifestName}: package file list changed.`);
  for (const item of manifest.files) {
    const path = resolve(dir, item.path);
    path.startsWith(`${dir}/`) || fail(`${manifestName}: invalid package path ${item.path}.`);
    existsSync(path) || fail(`${manifestName}: missing ${item.path}.`);
    shaFile(path) === item.sha256 || fail(`${manifestName}: SHA changed for ${item.path}.`);
    statSync(path).size === item.bytes || fail(`${manifestName}: size changed for ${item.path}.`);
  }
  packageSha(actual) === manifest.packageSha256 || fail(`${manifestName}: package SHA changed.`);
  return actual;
};

const candidateManifestPath = () => join(RELEASE_CANDIDATE, 'candidate-manifest.json');

const loadFreshCandidate = () => {
  const path = candidateManifestPath();
  existsSync(path) || fail('Series release candidate is missing. Run series-release-build first.');
  const manifest = json(path);
  const inputs = inputState();
  manifest.courseId === inputs.course.courseId || fail('Series candidate belongs to another course.');
  manifest.inputFingerprint === inputs.inputFingerprint || fail('Series release inputs changed after build. Run series-release-build again.');
  verifyManifestFiles(RELEASE_CANDIDATE, manifest, 'candidate-manifest.json');
  return {manifest, inputs};
};

const documentSources = (course) => [
  ['course-intro.md', course.release.courseIntroMarkdown],
  ['bilibili.md', course.release.bilibiliMarkdown],
  ['douyin.md', course.release.douyinMarkdown],
  ['cover-brief.md', course.release.coverBriefMarkdown],
  ['checklist.md', course.release.checklistMarkdown],
];

const buildSeriesRelease = () => {
  const inputs = inputState();
  const existingManifest = candidateManifestPath();
  if (existsSync(existingManifest)) {
    try {
      const existing = json(existingManifest);
      if (existing.inputFingerprint === inputs.inputFingerprint) {
        verifyManifestFiles(RELEASE_CANDIDATE, existing, 'candidate-manifest.json');
        console.log(`HIT   series-release-build ${rel(RELEASE_CANDIDATE)}`);
        return existing;
      }
    } catch {
      // Rebuild an incomplete or locally modified candidate below.
    }
  }

  execFileSync('node', [COVER_SCRIPT], {cwd: ROOT, stdio: 'inherit'});
  const next = `${RELEASE_CANDIDATE}.next`;
  rmSync(next, {recursive: true, force: true});
  mkdirSync(next, {recursive: true});

  for (const cover of inputs.course.release.covers) {
    const sourcePng = join(COVER_CANDIDATE, cover.generatedPng);
    const sourceSvg = join(COVER_CANDIDATE, cover.generatedSvg);
    existsSync(sourcePng) || fail(`Generated cover missing: ${rel(sourcePng)}`);
    existsSync(sourceSvg) || fail(`Generated cover missing: ${rel(sourceSvg)}`);
    copyFileSync(sourcePng, join(next, cover.png));
    copyFileSync(sourceSvg, join(next, cover.svg));
  }
  for (const [name, markdown] of documentSources(inputs.course)) writeFileSync(join(next, name), `${markdown.trimEnd()}\n`);
  copyFileSync(inputs.outlinePath, join(next, 'outline.md'));
  writeFileSync(join(next, 'course.json'), `${JSON.stringify(inputs.course, null, 2)}\n`);

  const files = packageFiles(next, 'candidate-manifest.json');
  const manifest = {
    schemaVersion: 1,
    courseId: inputs.course.courseId,
    inputFingerprint: inputs.inputFingerprint,
    packageSha256: packageSha(files),
    createdAt: new Date().toISOString(),
    sourceInputs: {repo: inputs.repoInputs, fonts: inputs.fonts, tools: inputs.tools},
    files,
  };
  writeJson(join(next, 'candidate-manifest.json'), manifest);
  atomicDirectorySwap(next, RELEASE_CANDIDATE);
  console.log(`PASS  series-release-build ${rel(RELEASE_CANDIDATE)} (${files.length} files)`);
  return manifest;
};

const imageDimensions = (path) => execFileSync('identify', ['-format', '%w %h', path], {encoding: 'utf8'}).trim().split(/\s+/).map(Number);

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const writeAuditReport = ({checks, manifest, inputs}) => {
  mkdirSync(AUDIT_DIR, {recursive: true});
  const overview = join(AUDIT_DIR, 'cover-overview.jpg');
  execFileSync('montage', [
    join(RELEASE_CANDIDATE, 'cover-1080x1080.png'),
    join(RELEASE_CANDIDATE, 'cover-960x540.png'),
    '-thumbnail', '720x405',
    '-tile', '2x1',
    '-geometry', '720x405+24+24',
    overview,
  ]);
  const rows = checks.map((check) => `<tr><td>${escapeHtml(check.id)}</td><td class="${escapeHtml(check.status)}">${escapeHtml(check.status)}</td><td>${escapeHtml(check.details)}</td></tr>`).join('');
  const square = relative(AUDIT_DIR, join(RELEASE_CANDIDATE, 'cover-1080x1080.png')).replaceAll('\\', '/');
  const wide = relative(AUDIT_DIR, join(RELEASE_CANDIDATE, 'cover-960x540.png')).replaceAll('\\', '/');
  const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(inputs.course.title)} · 课程总物料审查</title>
<style>body{margin:0;background:#f4ecd2;color:#17211f;font:18px/1.55 system-ui,sans-serif}.page{max-width:1320px;margin:auto;padding:48px}h1{font-size:42px;margin:0 0 8px}.meta{opacity:.65;margin-bottom:36px}.covers{display:grid;grid-template-columns:1fr 1.5fr;gap:28px;align-items:center}.covers img{display:block;width:100%;height:auto;border:3px solid #17211f;background:#fffdf2}table{width:100%;border-collapse:collapse;margin-top:40px;background:#fffdf2}th,td{padding:13px 16px;border:1px solid #c9c1a9;text-align:left}.pass{color:#1f6869}.needs_review{color:#a56e00}.fail{color:#b64e45}</style></head>
<body><main class="page"><h1>${escapeHtml(inputs.course.title)} · 课程总物料审查</h1><div class="meta">candidate ${escapeHtml(manifest.packageSha256.slice(0, 12))} · ${escapeHtml(AUDIT_POLICY_VERSION)}</div><section class="covers"><img src="${escapeHtml(square)}" alt="正方形封面"><img src="${escapeHtml(wide)}" alt="横版封面"></section><table><thead><tr><th>检查项</th><th>状态</th><th>说明</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
  writeFileSync(join(AUDIT_DIR, 'report.html'), html);
  return overview;
};

const auditSeriesRelease = () => {
  const {manifest, inputs} = loadFreshCandidate();
  const auditFingerprint = sha(JSON.stringify({
    schema: 1,
    policy: AUDIT_POLICY_VERSION,
    inputFingerprint: manifest.inputFingerprint,
    packageSha256: manifest.packageSha256,
  }));
  const verdictPath = join(AUDIT_DIR, 'verdict.json');
  if (existsSync(verdictPath) && existsSync(join(AUDIT_DIR, 'report.html'))) {
    const cached = json(verdictPath);
    if (cached.auditFingerprint === auditFingerprint && cached.packageSha256 === manifest.packageSha256) {
      console.log(`HIT   series-release-audit: ${cached.verdict}`);
      return cached;
    }
  }

  rmSync(AUDIT_DIR, {recursive: true, force: true});
  const checks = [
    {id: 'source.course-json', status: 'pass', details: `${rel(COURSE_SOURCE)} · ${manifest.inputFingerprint.slice(0, 12)}`},
    {id: 'candidate.manifest', status: 'pass', details: `${manifest.files.length} files · ${manifest.packageSha256.slice(0, 12)}`},
  ];
  for (const cover of inputs.course.release.covers) {
    const png = join(RELEASE_CANDIDATE, cover.png);
    const svg = join(RELEASE_CANDIDATE, cover.svg);
    const [width, height] = imageDimensions(png);
    checks.push({
      id: `cover.${cover.id}.dimensions`,
      status: width === cover.width && height === cover.height ? 'pass' : 'fail',
      details: `${width}x${height} expected ${cover.width}x${cover.height}`,
    });
    const svgText = readFileSync(svg, 'utf8');
    const expectedViewBox = new RegExp(`viewBox=["']0 0 ${cover.width} ${cover.height}["']`);
    checks.push({
      id: `cover.${cover.id}.svg`,
      status: /<svg\b/.test(svgText) && expectedViewBox.test(svgText) ? 'pass' : 'fail',
      details: `${cover.width}x${cover.height} SVG source`,
    });
  }
  for (const [name] of documentSources(inputs.course)) {
    const content = readFileSync(join(RELEASE_CANDIDATE, name), 'utf8').trim();
    checks.push({id: `document.${name}`, status: content ? 'pass' : 'fail', details: `${content.length} characters`});
  }
  checks.push({id: 'document.outline.md', status: statSync(join(RELEASE_CANDIDATE, 'outline.md')).size > 0 ? 'pass' : 'fail', details: rel(inputs.outlinePath)});
  checks.push({id: 'visual.human-review', status: 'needs_review', details: rel(join(AUDIT_DIR, 'report.html'))});
  const machineFailed = checks.some((check) => check.status === 'fail');
  const overview = writeAuditReport({checks, manifest, inputs});
  const verdict = {
    schemaVersion: 1,
    courseId: inputs.course.courseId,
    scope: 'series-release',
    candidate: rel(RELEASE_CANDIDATE),
    inputFingerprint: manifest.inputFingerprint,
    packageSha256: manifest.packageSha256,
    auditFingerprint,
    policyVersion: AUDIT_POLICY_VERSION,
    createdAt: new Date().toISOString(),
    verdict: machineFailed ? 'fail' : 'needs_review',
    checks,
    evidence: {report: rel(join(AUDIT_DIR, 'report.html')), overview: rel(overview)},
  };
  writeJson(verdictPath, verdict);
  console.log(`${machineFailed ? 'FAIL' : 'WAIT'}  series-release-audit: ${verdict.verdict}`);
  return verdict;
};

const approveSeriesRelease = (flags) => {
  const {manifest} = loadFreshCandidate();
  const path = join(AUDIT_DIR, 'verdict.json');
  existsSync(path) || fail('No series release audit verdict. Run series-release-audit first.');
  const verdict = json(path);
  verdict.verdict !== 'fail' || fail('Cannot approve a failed series release audit.');
  verdict.packageSha256 === manifest.packageSha256 || fail('Series candidate changed after audit.');
  verdict.inputFingerprint === manifest.inputFingerprint || fail('Series inputs changed after audit.');
  verdict.verdict = 'pass';
  verdict.approval = {
    reviewer: process.env.USER ?? 'unknown',
    approvedAt: new Date().toISOString(),
    note: flags.get('note') ?? '',
  };
  const human = verdict.checks.find((check) => check.id === 'visual.human-review');
  if (human) human.status = 'pass';
  writeJson(path, verdict);
  console.log('PASS  series-release-approve');
  return verdict;
};

const publishSeries = () => {
  const {manifest, inputs} = loadFreshCandidate();
  const verdictPath = join(AUDIT_DIR, 'verdict.json');
  existsSync(verdictPath) || fail('Series release verdict is missing.');
  const verdict = json(verdictPath);
  verdict.verdict === 'pass' || fail(`Series release verdict is ${verdict.verdict}; approval required.`);
  verdict.packageSha256 === manifest.packageSha256 || fail('Series release candidate SHA does not match the approved verdict.');
  verdict.inputFingerprint === inputs.inputFingerprint || fail('Series release inputs changed after approval.');

  const next = `${CURRENT_RELEASE}.next`;
  rmSync(next, {recursive: true, force: true});
  mkdirSync(next, {recursive: true});
  for (const item of manifest.files) copyFileSync(join(RELEASE_CANDIDATE, item.path), join(next, item.path));
  writeJson(join(next, 'verdict.json'), verdict);
  const files = packageFiles(next, 'release-manifest.json');
  writeJson(join(next, 'release-manifest.json'), {
    schemaVersion: 1,
    courseId: inputs.course.courseId,
    publishedAt: new Date().toISOString(),
    sourceCourse: {path: rel(COURSE_SOURCE), sha256: shaFile(COURSE_SOURCE)},
    candidate: {path: rel(RELEASE_CANDIDATE), inputFingerprint: manifest.inputFingerprint, packageSha256: manifest.packageSha256},
    approval: verdict.approval,
    files,
  });
  atomicDirectorySwap(next, CURRENT_RELEASE);
  console.log(`PASS  series-publish ${rel(CURRENT_RELEASE)} (${files.length + 1} files)`);
};

const seriesStatus = () => {
  const candidate = existsSync(candidateManifestPath()) ? json(candidateManifestPath()) : null;
  const verdictPath = join(AUDIT_DIR, 'verdict.json');
  const verdict = existsSync(verdictPath) ? json(verdictPath) : null;
  const published = join(CURRENT_RELEASE, 'release-manifest.json');
  console.log(`candidate ${candidate?.packageSha256?.slice(0, 12) ?? 'missing'}`);
  console.log(`audit     ${verdict?.verdict ?? 'missing'}`);
  console.log(`published ${existsSync(published) ? json(published).candidate?.packageSha256?.slice(0, 12) ?? 'unknown' : 'missing'}`);
};

const activityPath = join(BUILD, 'activity.json');
const processAlive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const withActivity = async (command, action) => {
  mkdirSync(dirname(activityPath), {recursive: true});
  if (existsSync(activityPath)) {
    let activity = null;
    try {
      activity = json(activityPath);
    } catch {
      // Invalid stale marker is removed below.
    }
    if (activity && processAlive(activity.pid)) fail(`Series release is busy: ${activity.command} (pid ${activity.pid})`);
    rmSync(activityPath, {force: true});
  }
  const fd = openSync(activityPath, 'wx');
  try {
    writeFileSync(fd, `${JSON.stringify({schemaVersion: 1, courseId: 'git-course', command, pid: process.pid, startedAt: new Date().toISOString()}, null, 2)}\n`);
  } finally {
    closeSync(fd);
  }
  try {
    return await action();
  } finally {
    if (existsSync(activityPath)) rmSync(activityPath, {force: true});
  }
};

export const runSeriesReleaseCommand = async ({command, args = []}) => {
  const flags = parseFlags(args);
  if (command === 'series-release-build') return withActivity(command, () => buildSeriesRelease());
  if (command === 'series-release-audit') return withActivity(command, () => auditSeriesRelease());
  if (command === 'series-release-approve') return withActivity(command, () => approveSeriesRelease(flags));
  if (command === 'series-publish') return withActivity(command, () => publishSeries());
  if (command === 'series-status') return seriesStatus();
  fail(`Unknown series release command: ${command}`);
};
