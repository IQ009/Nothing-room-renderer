const fs = require('fs');
const path = require('path');
const src = path.join('out', 'nothing-room.mp4');
if (!fs.existsSync(src)) { console.error('Missing ' + src + ' - the render step did not produce a video.'); process.exit(1); }
fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync(src, path.join('dist', 'nothing-room.mp4'));
const mb = (fs.statSync(src).size / 1048576).toFixed(1);
fs.writeFileSync(path.join('dist', 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Nothing Room - final video</title>
<style>:root{color-scheme:dark}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1118;color:#e9ecf5;font:16px/1.5 system-ui,sans-serif}main{width:min(92vw,420px);padding:24px 0;text-align:center}video{width:100%;border-radius:14px;background:#000;aspect-ratio:9/16}a.btn{display:inline-block;margin-top:18px;padding:12px 22px;border-radius:999px;background:#6ea8ff;color:#0b1020;font-weight:600;text-decoration:none}p{color:#9aa3b8;margin:8px 0 0}</style></head>
<body><main><h1>The Nothing Room</h1><video src="nothing-room.mp4" controls playsinline preload="metadata"></video><a class="btn" href="nothing-room.mp4" download="nothing-room.mp4">Download MP4 (${mb} MB)</a><p>1080x1920, 30 fps, H.264 + AAC</p></main></body></html>`);
console.log('Site written to dist/ (' + mb + ' MB video)');
