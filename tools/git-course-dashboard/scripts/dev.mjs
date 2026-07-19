import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const children = [
  spawn(process.execPath, ['server.mjs', '--dev'], {cwd: packageRoot, stdio: 'inherit'}),
  spawn(pnpmExecutable, ['exec', 'vite'], {cwd: packageRoot, stdio: 'inherit'}),
];

let stopping = false;
const stop = (signal = 'SIGTERM') => {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill(signal);
};

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(signal));
for (const child of children) {
  child.on('exit', (code) => {
    if (!stopping && code !== 0) process.exitCode = code ?? 1;
    stop();
  });
}
