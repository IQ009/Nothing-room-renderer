// Renders a few real frames (same composition, same code) so the look can be checked in minutes instead of after the full render.
import {mkdirSync, writeFileSync, existsSync, statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const bin = path.join(process.cwd(), 'node_modules', '.bin', 'remotion');
const times = [0.8, 6, 10.5, 15.5, 18.5, 21.5, 28, 35.5, 38.5, 43];
mkdirSync('preview', {recursive: true});
const ok = [];
for (const t of times) {
  const f = Math.round(t * 30), out = path.join('preview', `t${String(t).replace('.', '_')}.jpg`);
  const r = spawnSync(bin, ['still', 'src/index.jsx', 'NothingRoom', out, `--frame=${f}`, '--gl=swangle', '--image-format=jpeg', '--jpeg-quality=85', '--scale=0.5', '--timeout=180000', '--log=info'], {stdio: 'inherit'});
  if (r.status === 0 && existsSync(out) && statSync(out).size > 5000) ok.push([t, out]);
  else console.error(`[preview] frame at ${t}s FAILED`);
}
writeFileSync(path.join('preview', 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview frames</title><body style="margin:0;background:#111;color:#ddd;font:14px system-ui"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;padding:8px">${ok.map(([t, o]) => `<figure style="margin:0"><img src="${path.basename(o)}" style="width:100%"><figcaption>${t}s</figcaption></figure>`).join('')}</div>`);
if (ok.length < times.length) process.exit(1);
console.log(`[preview] ${ok.length} frames rendered`);
