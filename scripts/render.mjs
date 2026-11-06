// Renders the real animation to out/nothing-room.mp4. Fails loudly (non-zero exit) on any problem; nothing is skipped or faked.
import {existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const COMP = 'NothingRoom';
const OUT = path.join('out', 'nothing-room.mp4');
const bin = path.join(root, 'node_modules', '.bin', 'remotion');

const tree = (d, depth = 0, out = []) => {
  for (const n of readdirSync(d).sort()) {
    if (['node_modules', '.git', 'out', 'dist', '.render-public'].includes(n)) continue;
    const p = path.join(d, n), dir = statSync(p).isDirectory();
    out.push('  '.repeat(depth) + n + (dir ? '/' : ''));
    if (dir && depth < 2) tree(p, depth + 1, out);
  }
  return out;
};
const fail = (msg) => {
  console.error(`\n[render] ERROR: ${msg}\n[render] Repository layout seen by this build (working dir ${root}):\n${tree(root).join('\n')}\n`);
  process.exit(1);
};
const run = (args, capture = false) => spawnSync(bin, args, {cwd: root, stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit', encoding: 'utf8', env: process.env});

console.log(`[render] node ${process.version}, cwd ${root}`);
if (!existsSync(bin)) fail('node_modules/.bin/remotion is missing: dependencies were not installed (run npm install first).');

// 1. entry point (src/index.jsx; a flat upload with index.jsx at the repo root is also accepted)
const entry = ['src/index.jsx', 'index.jsx'].find((p) => existsSync(path.join(root, p)));
if (!entry) fail('Entry point not found. Expected src/index.jsx (it must call registerRoot). Upload the folder structure exactly as in the project, including the src/ folder.');
console.log(`[render] entry point: ${entry}`);

// 2. narration + sound track (ElevenLabs narration mixed with effects and music)
const audio = ['public/soundtrack.mp3', 'soundtrack.mp3'].find((p) => existsSync(path.join(root, p)));
if (!audio) fail('soundtrack.mp3 not found. Expected public/soundtrack.mp3 (the mixed ElevenLabs narration + sound effects + music).');
const size = statSync(path.join(root, audio)).size;
if (size < 100000) fail(`${audio} is only ${size} bytes: it looks like a placeholder or a broken upload.`);
rmSync('.render-public', {recursive: true, force: true});
mkdirSync('.render-public', {recursive: true});
copyFileSync(path.join(root, audio), path.join('.render-public', 'soundtrack.mp3'));
console.log(`[render] soundtrack: ${audio} (${(size / 1048576).toFixed(2)} MB)`);

// 3. output directory
mkdirSync('out', {recursive: true});

// 4. browser must be available (Remotion downloads headless Chromium into node_modules)
let r = run(['browser', 'ensure']);
if (r.status !== 0) fail('Could not set up headless Chromium. If the log above lists missing shared libraries (libnss3, libatk, ...), the Render Node build image lacks them: use a Docker-based service instead of a static-site build.');

// 5. the composition must really be registered under the expected id
r = run(['compositions', entry, '--public-dir=.render-public', '--gl=swangle', '--log=error'], true);
if (r.status !== 0) fail('Could not load the Remotion bundle: see the compile error above.');
const listed = (r.stdout || '').replace(/\u001b\[[0-9;]*m/g, '');
if (!new RegExp(`\\b${COMP}\\b`).test(listed)) fail(`Composition "${COMP}" is not registered. Registered compositions:\n${listed}`);
console.log(`[render] composition "${COMP}" found`);

// 6. the actual render
r = run(['render', entry, COMP, OUT, '--public-dir=.render-public', '--codec=h264', '--crf=20', '--gl=swangle', '--image-format=jpeg', '--jpeg-quality=88', '--concurrency=2', '--timeout=180000', '--log=info']);
if (r.status !== 0) fail(`remotion render exited with code ${r.status}.`);
if (!existsSync(OUT) || statSync(OUT).size < 1000000) fail(`${OUT} was not produced or is too small to be the finished video.`);
console.log(`[render] DONE: ${OUT} (${(statSync(OUT).size / 1048576).toFixed(1)} MB)`);
