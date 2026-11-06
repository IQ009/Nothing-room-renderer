# nothing-room-renderer

Renders a 9:16 (1080x1920, 30 fps) animated short **at build time** and publishes it as a free Render static site with a download page.

- **3D:** Three.js (`@react-three/fiber`) stickman office scene in `src/Scene.jsx` and `src/Stick.jsx`
- **Video:** Remotion composes the frames, headless Chromium (software WebGL, `--gl=swangle`) draws them, FFmpeg (bundled with Remotion) encodes the MP4
- **Audio:** `public/soundtrack.mp3` = ElevenLabs narration (`assets/narration.mp3`) + sound effects + music bed, mixed by `tools/mix.py` (dev tool, already run)
- **Deploy:** `render.yaml` is a Blueprint for a free static site. Build command: `npm install && npm run build`. Output: `dist/index.html` + `dist/nothing-room.mp4`

## Deploy
1. Push this folder to a **private** GitHub repo named `nothing-room-renderer`.
2. In Render, give the Render GitHub app access to that repo, then create a Blueprint from it (or let Claude do it).
3. Trigger a deploy. The build renders 1,410 frames, so expect a long build; read the build log for progress.
4. Open the static site URL. The MP4 is at `/nothing-room.mp4`.

## Local
`npm install && npm run studio` to preview, `npm run still` for one frame, `npm run build` for the full render.
