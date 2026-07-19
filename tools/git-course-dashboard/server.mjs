import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {promises as fs} from 'node:fs';
import {createServer} from 'node:http';
import {networkInterfaces} from 'node:os';
import {extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {actionArgs, loadDashboard, repoFile} from './src/lib.mjs';

const packageRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(packageRoot, '../..');
const dev = process.argv.includes('--dev');
const port = Number(process.env.GIT_COURSE_DASHBOARD_PORT ?? (dev ? 4179 : 4178));
const host = process.env.GIT_COURSE_DASHBOARD_HOST ?? '0.0.0.0';
const webRoot = join(packageRoot, 'dist');
const runs = new Map();
const MAX_OUTPUT = 512 * 1024;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.srt': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.tsv': 'text/tab-separated-values; charset=utf-8',
  '.log': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const json = (response, status, value) => {
  response.writeHead(status, {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'});
  response.end(`${JSON.stringify(value)}\n`);
};

const readJsonBody = async (request) => {
  if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) throw Object.assign(new Error('Expected application/json.'), {statusCode: 415});
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16 * 1024) throw Object.assign(new Error('Request body is too large.'), {statusCode: 413});
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON body.'), {statusCode: 400});
  }
};

const assertSameOrigin = (request) => {
  const origin = request.headers.origin;
  if (!origin) return;
  if (new URL(origin).host !== request.headers.host) throw Object.assign(new Error('Cross-origin actions are not allowed.'), {statusCode: 403});
};

const cleanOutput = (value) => value.replace(/\u001b\[[0-9;]*m/g, '').replace(/\r/g, '');
const appendOutput = (run, chunk) => {
  run.output = `${run.output}${cleanOutput(String(chunk))}`.slice(-MAX_OUTPUT);
};
const publicRun = (run) => ({
  id: run.id,
  episodeId: run.episodeId,
  action: run.action,
  sceneId: run.sceneId,
  state: run.state,
  command: run.command,
  output: run.output,
  startedAt: run.startedAt,
  finishedAt: run.finishedAt,
  exitCode: run.exitCode,
});
const quoteArg = (value) => /^[a-zA-Z0-9_./:=,-]+$/.test(value) ? value : JSON.stringify(value);

const startAction = async (request) => {
  const input = await readJsonBody(request);
  let args;
  try {
    args = actionArgs(input);
  } catch (error) {
    throw Object.assign(error, {statusCode: 400});
  }
  const episodePath = join(repoRoot, 'git-course/episodes', `${input.episodeId}.json`);
  const episode = JSON.parse(await fs.readFile(episodePath, 'utf8'));
  if (input.action === 'preview' && !episode.scenes.some((scene) => scene.id === input.sceneId)) {
    throw Object.assign(new Error(`Unknown scene: ${input.sceneId}`), {statusCode: 400});
  }
  const existing = [...runs.values()].find((run) => run.episodeId === input.episodeId && run.state === 'running');
  if (existing) throw Object.assign(new Error(`${input.episodeId} is already running ${existing.action}.`), {statusCode: 409});

  const commandArgs = ['--dir', 'remotion', 'git-course', ...args];
  const run = {
    id: randomUUID(),
    episodeId: input.episodeId,
    action: input.action,
    sceneId: input.sceneId ?? null,
    state: 'running',
    command: ['pnpm', ...commandArgs].map(quoteArg).join(' '),
    output: '',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exitCode: null,
  };
  runs.set(run.id, run);
  const child = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', commandArgs, {
    cwd: repoRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => appendOutput(run, chunk));
  child.stderr.on('data', (chunk) => appendOutput(run, chunk));
  child.on('error', (error) => appendOutput(run, `\nFAIL  ${error.message}\n`));
  child.on('close', (code) => {
    run.exitCode = code ?? 1;
    run.state = code === 0 ? 'succeeded' : 'failed';
    run.finishedAt = new Date().toISOString();
    const completed = [...runs.values()].filter((item) => item.state !== 'running').sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    while (completed.length > 50) runs.delete(completed.shift().id);
  });
  return publicRun(run);
};

const sendFile = async (request, response, path, {cache = false} = {}) => {
  const stat = await fs.stat(path);
  if (!stat.isFile()) throw Object.assign(new Error('Not found'), {code: 'ENOENT'});
  const type = contentTypes[extname(path).toLowerCase()] ?? 'application/octet-stream';
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= stat.size) {
      response.writeHead(416, {'content-range': `bytes */${stat.size}`});
      response.end();
      return;
    }
    response.writeHead(206, {
      'content-type': type,
      'content-length': end - start + 1,
      'content-range': `bytes ${start}-${end}/${stat.size}`,
      'accept-ranges': 'bytes',
      'cache-control': cache ? 'public, max-age=3600' : 'no-store',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(path, {start, end}).pipe(response);
    return;
  }
  response.writeHead(200, {
    'content-type': type,
    'content-length': stat.size,
    'accept-ranges': 'bytes',
    'cache-control': cache ? 'public, max-age=3600' : 'no-store',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(path).pipe(response);
};

const safeWebFile = (pathname) => {
  const relativePath = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  const target = resolve(webRoot, relativePath);
  if (target !== webRoot && !target.startsWith(`${webRoot}${sep}`)) throw new Error('Invalid web path.');
  return target;
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (request.method === 'POST' && url.pathname === '/api/actions') {
      assertSameOrigin(request);
      json(response, 202, await startAction(request));
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      json(response, 405, {error: 'Method not allowed.'});
      return;
    }
    if (url.pathname === '/api/health') {
      json(response, 200, {ok: true, mode: dev ? 'development' : 'production'});
      return;
    }
    if (url.pathname === '/api/dashboard') {
      json(response, 200, await loadDashboard(repoRoot));
      return;
    }
    if (url.pathname === '/api/runs') {
      const episodeId = url.searchParams.get('episodeId');
      const items = [...runs.values()]
        .filter((run) => !episodeId || run.episodeId === episodeId)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .map(publicRun);
      json(response, 200, {runs: items});
      return;
    }
    if (url.pathname.startsWith('/files/')) {
      const repoPath = decodeURIComponent(url.pathname.slice('/files/'.length));
      const path = repoFile(repoRoot, repoPath);
      await sendFile(request, response, path);
      return;
    }
    if (dev) {
      json(response, 404, {error: 'Development web assets are served by Vite on port 4178.'});
      return;
    }
    let path = safeWebFile(url.pathname);
    try {
      await sendFile(request, response, path, {cache: extname(path) !== '.html'});
    } catch (error) {
      if (error?.code !== 'ENOENT' || extname(path)) throw error;
      path = join(webRoot, 'index.html');
      await sendFile(request, response, path);
    }
  } catch (error) {
    const status = error?.statusCode ?? (error?.code === 'ENOENT' ? 404 : 500);
    json(response, status, {error: status === 404 ? 'Not found.' : error.message});
  }
});

server.listen(port, host, () => {
  console.log(`Git Course dashboard: http://${host}:${port}${dev ? ' (API)' : ''}`);
  if (host === '0.0.0.0') {
    const addresses = Object.values(networkInterfaces()).flat().filter((entry) => entry && entry.family === 'IPv4' && !entry.internal);
    for (const address of addresses) console.log(`LAN: http://${address.address}:${port}${dev ? ' (API)' : ''}`);
  }
  console.log(`Repository: ${relative(process.cwd(), repoRoot) || '.'}`);
});
