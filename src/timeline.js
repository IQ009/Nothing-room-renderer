export const FPS = 30;
export const DUR = 47;
// shot boundaries in seconds; they follow the pauses in the narration (narration starts at 0.3 s)
export const CUTS = [0, 4.7, 8.4, 14.1, 17.2, 20.4, 23.1, 33.8, 37.2, 40.7, 47];
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const kf = (t, pts) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])));
  }
  return pts[pts.length - 1][1];
};
// walk along a polyline of [x,z] points between t0 and t1 with ease in/out; heading is smoothed through corners
export function walker(pts, t0, t1, t) {
  const lens = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(d); L += d; }
  const at = (s) => {
    s = clamp(s, 0, L);
    let i = 0;
    while (i < lens.length - 1 && s > lens[i]) { s -= lens[i]; i++; }
    const f = lens[i] ? s / lens[i] : 0;
    return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
  };
  const u = ease((t - t0) / (t1 - t0));
  const s = u * L;
  const p = at(s), a = at(s - 0.4), b = at(s + 0.4);
  const rot = Math.atan2(b[0] - a[0], b[1] - a[1]);
  const moving = t > t0 && t < t1;
  return { x: p[0], z: p[1], rot, phase: s * Math.PI * 2 / 1.4, amp: moving ? clamp(u * (1 - u) * 14, 0, 1) : 0, moving };
}
