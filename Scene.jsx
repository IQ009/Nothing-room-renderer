import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Stick} from './Stick';
import {CUTS, clamp, lerp, ease, seg, kf, walker} from './timeline';

const PI = Math.PI;
// ---------- fixed world layout (metres). Camera is on the +z side, the set is open at the front like a dollhouse ----------
const GLASS_X = 5.2, DOOR_Z = 0.6, HINGE_Z = 1.1;
const EMP_SEAT = [-2, -1.4], ROOM_SEAT = [6.9, -0.9], ROOM_DESK = [5.95, -1.2];
const W1 = [[-2, -1.4], [-3.2, -1.2], [-3.2, 0.6], [4.2, 0.6]];
const W2 = [[4.2, 0.6], [5.6, 0.6], [6.9, 0.2], [6.9, -0.9]];
const W3 = [[6.9, -0.9], [6.9, 0.6], [5.0, 0.6], [2.8, 0.6]];
const M1 = [[3.2, 0.7], [-3.0, 0.4]];
const M2 = [[-3.0, 0.4], [-1.5, 0.9], [4.4, 0.9]];
const M3 = [[4.4, 0.9], [4.3, 1.6]];
const M4 = [[4.3, 1.6], [2.5, 1.7], [-6, 1.6]];
const SHIRTS = ['#e8a23c', '#4fb39d', '#c66bd0', '#e56b5e', '#7aa6e8', '#d1c04f', '#6c8f5b', '#d98aa1'];
const HAIRS = ['#2a1f1a', '#5a3a22', '#1b1a24', '#8a8a92', '#3a2230', '#1b1a24', '#6b4a2a', '#2a1f1a'];
const COLLEAGUES = [[-5, -1.4], [0.2, -1.4], [2.4, -1.4], [4.0, -1.4], [-4, -3.0], [-1, -3.0], [1.4, -3.0], [3.6, -3.0]];
const LAUGH = [[17.0, 20.6], [23.6, 24.7], [27.4, 28.6], [31.0, 32.2]];

const laugh = (t, k) => {
  let v = 0;
  for (const [a, b] of LAUGH) if (t > a + (k % 3) * 0.12 && t < b) v = Math.max(v, Math.min(1, (t - a) * 4, (b - t) * 4));
  return v;
};

// ---------- actors ----------
function employee(t) {
  const sit = kf(t, [[0, 1], [6, 1], [6.8, 0], [15.8, 0], [16.6, 1], [40.7, 1], [41.3, 0]]);
  let x, z, rot, phase = 0, amp = 0;
  const w1 = walker(W1, 6.8, 12.2, t), w2 = walker(W2, 13.4, 15.4, t), w3 = walker(W3, 41.2, 44.2, t);
  if (t < 6.8) { x = EMP_SEAT[0]; z = EMP_SEAT[1]; rot = lerp(0, walker(W1, 6.8, 12.2, 6.8).rot, ease(seg(t, 6.3, 6.8))); }
  else if (t < 13.4) { x = w1.x; z = w1.z; rot = w1.rot; phase = w1.phase; amp = w1.amp; }
  else if (t < 15.4) { x = w2.x; z = w2.z; rot = w2.rot; phase = w2.phase; amp = w2.amp; }
  else if (t < 41.2) { x = ROOM_SEAT[0]; z = ROOM_SEAT[1]; rot = t < 16.4 ? lerp(PI, 1.5 * PI, ease(seg(t, 15.4, 16.4))) : 1.5 * PI; if (t > 40.7) rot = lerp(1.5 * PI, 2 * PI, ease(seg(t, 40.8, 41.2))); }
  else { x = w3.x; z = w3.z; rot = w3.rot; phase = w3.phase; amp = w3.amp; }
  if (t >= 40.7 && t < 41.2) rot = lerp(1.5 * PI, 2 * PI, ease(seg(t, 40.8, 41.2)));
  const seated = sit > 0.5;
  const reach = ease(seg(t, 37.8, 38.6)) * (1 - ease(seg(t, 39.4, 40.2)));
  let arms;
  if (seated && t > 16.6) arms = { l: [-0.5, 0.12, -1.2], r: [lerp(-0.5, -1.35, reach), 0.1, lerp(-1.2, -0.25, reach)] };
  const mouth = kf(t, [[0, 0.3], [4.5, 0.15], [5.8, -0.3], [8, -0.6], [16, -0.5], [23, -0.8], [33, -1], [40, -0.4], [43, -0.2]]);
  const headX = kf(t, [[0, 0], [21, 0], [28, 0.3], [34, 0.42], [37, 0.12], [40, 0.05]]);
  const typing = t < 6.0 ? { l: [-1.1 + Math.sin(t * 9) * 0.05, 0.05, -0.6], r: [-1.1 + Math.sin(t * 8 + 1) * 0.05, -0.05, -0.6 + Math.sin(t * 11) * 0.1] } : null;
  return { x, z, rot, phase, amp, sit, arms: typing || arms, mouth, headX, headY: kf(t, [[15, 0], [18, 0.5], [20, 0.5], [22, 0]]) };
}
function manager(t) {
  if (t < 2.9) return null;
  const a = walker(M1, 3.0, 5.4, t), b = walker(M2, 6.9, 11.9, t), c = walker(M3, 12.9, 13.5, t), d = walker(M4, 14.8, 19.6, t);
  let s = a;
  let rot = a.rot;
  if (t >= 5.4 && t < 6.9) { s = { x: -3.0, z: 0.4, phase: 0, amp: 0 }; rot = lerp(a.rot, PI, ease(seg(t, 5.4, 5.9))); }
  else if (t >= 6.9 && t < 12.9) { s = b; rot = t < 7.4 ? lerp(PI, b.rot, ease(seg(t, 6.9, 7.4))) : b.rot; }
  else if (t >= 12.9 && t < 14.8) { s = c; rot = t < 13.5 ? lerp(PI / 2, PI * 0.7, ease(seg(t, 12.9, 13.5))) : PI * 0.7; }
  else if (t >= 14.8) { s = d; rot = t < 15.3 ? lerp(PI * 0.7, d.rot, ease(seg(t, 14.8, 15.3))) : d.rot; }
  if (t > 19.7) return null;
  const point = ease(seg(t, 12.2, 12.6)) * (1 - ease(seg(t, 13.2, 13.5)));
  const talk = (t > 5.5 && t < 6.9) ? { l: [-0.3, 0.12, -0.9], r: [-0.8 + Math.sin(t * 5) * 0.2, -0.1, -0.7] } : null;
  const arms = point > 0.01 ? { l: [-0.1, 0.1, -0.15], r: [lerp(-0.1, -1.4, point), -0.2, lerp(-0.15, -0.2, point)] } : talk;
  return { x: s.x, z: s.z, rot, phase: s.phase, amp: s.amp, arms, mouth: -0.2 };
}

// ---------- light and sky over time ----------
function tod(t) {
  const day = new THREE.Color('#bfe3ff'), dusk = new THREE.Color('#f3a26a'), night = new THREE.Color('#10142e');
  let amb = 0.95, sun = 1.1, sky = day.clone(), warm = new THREE.Color('#fff3e0');
  if (t >= 23.1 && t < 33.8) {
    const v = 0.5 + 0.5 * Math.cos(((t - 23.1) / 10.7) * 4 * 2 * PI);
    amb = 0.4 + 0.55 * v; sun = 0.25 + 0.85 * v;
    sky = v > 0.5 ? day.clone().lerp(dusk, 1 - (v - 0.5) * 2) : dusk.clone().lerp(night, 1 - v * 2);
  } else if (t >= 33.8) {
    amb = 0.42; sun = 0.3; sky = night.clone(); warm = new THREE.Color('#bcd0ff');
  }
  const out = 1 - ease(seg(t, 44.3, 44.7)) * 0.94;
  return {amb: amb * out, sun: sun * out, sky, warm, out};
}

// ---------- set pieces ----------
const Box = ({p, s, c, rough = 0.9}) => <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={rough} /></mesh>;
function Desk({x, z, ry = 0, w = 1.4, d = 0.7}) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <Box p={[0, 0.74, 0]} s={[w, 0.06, d]} c="#e8c9a0" />
      <Box p={[-w / 2 + 0.05, 0.37, 0]} s={[0.05, 0.74, d - 0.1]} c="#caa77a" />
      <Box p={[w / 2 - 0.05, 0.37, 0]} s={[0.05, 0.74, d - 0.1]} c="#caa77a" />
    </group>
  );
}
function Laptop({x, z, ry = 0}) {
  return (
    <group position={[x, 0.77, z]} rotation={[0, ry, 0]}>
      <Box p={[0, 0.01, -0.05]} s={[0.36, 0.02, 0.25]} c="#9aa3b5" />
      <group position={[0, 0.02, 0.07]} rotation={[-0.25, 0, 0]}><Box p={[0, 0.12, 0]} s={[0.36, 0.24, 0.015]} c="#2b3040" /></group>
    </group>
  );
}
function Chair({x, z, ry = 0}) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <Box p={[0, 0.44, 0]} s={[0.46, 0.05, 0.46]} c="#3b3f52" />
      <Box p={[0, 0.74, -0.22]} s={[0.46, 0.5, 0.05]} c="#3b3f52" />
      <Box p={[0, 0.22, 0]} s={[0.06, 0.44, 0.06]} c="#20222f" />
    </group>
  );
}
function Door({angle}) {
  return (
    <group position={[GLASS_X, 0, HINGE_Z]} rotation={[0, angle, 0]}>
      <mesh position={[0, 1.05, -0.5]}><boxGeometry args={[0.05, 2.1, 1.0]} /><meshStandardMaterial color="#9fc6d9" transparent opacity={0.5} depthWrite={false} /></mesh>
      <Box p={[0, 1.05, -0.97]} s={[0.07, 2.1, 0.06]} c="#34405a" />
      <Box p={[0, 0.04, -0.5]} s={[0.07, 0.08, 1.0]} c="#34405a" />
      <Box p={[0, 2.08, -0.5]} s={[0.07, 0.06, 1.0]} c="#34405a" />
    </group>
  );
}
function Clock({t, x, y, z}) {
  const mAng = -(t * 0.2 + ease(seg(t, 23.1, 33.8)) * 2 * PI * 48);
  const hAng = mAng / 12;
  return (
    <group position={[x, y, z]}>
      <mesh><circleGeometry args={[0.4, 32]} /><meshBasicMaterial color="#f5ecd8" /></mesh>
      <mesh position={[0, 0, 0.005]}><torusGeometry args={[0.4, 0.035, 8, 40]} /><meshBasicMaterial color="#d94a3f" /></mesh>
      {Array.from({length: 12}).map((_, i) => <mesh key={i} position={[Math.sin(i / 12 * 2 * PI) * 0.33, Math.cos(i / 12 * 2 * PI) * 0.33, 0.006]}><boxGeometry args={[0.02, 0.05, 0.005]} /><meshBasicMaterial color="#1a1626" /></mesh>)}
      <group rotation={[0, 0, hAng]} position={[0, 0, 0.01]}><mesh position={[0, 0.1, 0]}><boxGeometry args={[0.03, 0.22, 0.008]} /><meshBasicMaterial color="#1a1626" /></mesh></group>
      <group rotation={[0, 0, mAng]} position={[0, 0, 0.015]}><mesh position={[0, 0.15, 0]}><boxGeometry args={[0.02, 0.32, 0.008]} /><meshBasicMaterial color="#1a1626" /></mesh></group>
    </group>
  );
}
function Letter({t}) {
  if (t < 37.2) return null;
  const z = lerp(0.2, -1.2, ease(seg(t, 37.4, 38.6)));
  return (
    <group position={[ROOM_DESK[0], 0.782, z]}>
      <mesh rotation={[-PI / 2, 0, 0]}><planeGeometry args={[0.3, 0.42]} /><meshStandardMaterial color="#fbf8ef" /></mesh>
      {[-0.12, -0.07, -0.02, 0.03, 0.08].map((o, i) => <mesh key={i} position={[0, 0.002, o]} rotation={[-PI / 2, 0, 0]}><planeGeometry args={[0.2 - (i === 4 ? 0.08 : 0), 0.012]} /><meshBasicMaterial color="#7d7f8c" /></mesh>)}
      <mesh position={[0.08, 0.003, 0.15]} rotation={[-PI / 2, 0, 0]}><circleGeometry args={[0.03, 20]} /><meshBasicMaterial color="#d94a3f" /></mesh>
    </group>
  );
}

function World({t, L}) {
  const doorAngle = -1.75 * Math.max(ease(seg(t, 12.9, 13.5)) * (1 - ease(seg(t, 14.5, 14.9))), ease(seg(t, 42.2, 42.7)) * (1 - ease(seg(t, 43.0, 43.3))));
  const skyCol = '#' + L.sky.getHexString();
  const winCol = '#' + L.sky.clone().multiplyScalar(L.out).getHexString();
  return (
    <>
      {/* floors */}
      <mesh rotation={[-PI / 2, 0, 0]} position={[0, 0, 2]}><planeGeometry args={[40, 20]} /><meshStandardMaterial color="#3d57b8" roughness={1} /></mesh>
      <mesh rotation={[-PI / 2, 0, 0]} position={[7.3, 0.004, 0]}><planeGeometry args={[4.2, 7.4]} /><meshStandardMaterial color="#cfd2dc" roughness={1} /></mesh>
      {/* back wall with windows */}
      <mesh position={[0, 3.2, -3.9]}><planeGeometry args={[40, 6.4]} /><meshStandardMaterial color="#cfe3d4" roughness={1} /></mesh>
      {[-7.5, -4, -0.5, 3].map((wx) => <mesh key={wx} position={[wx, 2.2, -3.88]}><planeGeometry args={[2.4, 1.8]} /><meshBasicMaterial color={winCol} /></mesh>)}
      <mesh position={[7.3, 3.2, -3.86]}><planeGeometry args={[4.2, 6.4]} /><meshStandardMaterial color="#f4f4f6" roughness={1} /></mesh>
      <mesh position={[9.4, 3.2, 0]} rotation={[0, -PI / 2, 0]}><planeGeometry args={[8, 6.4]} /><meshStandardMaterial color="#f4f4f6" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-8, 3.2, 0]} rotation={[0, PI / 2, 0]}><planeGeometry args={[10, 6.4]} /><meshStandardMaterial color="#cfe3d4" roughness={1} /></mesh>
      {/* glass partition with a door gap */}
      {[[-3.6, 0.1], [1.1, 3.6]].map(([a, b]) => (
        <mesh key={a} position={[GLASS_X, 1.3, (a + b) / 2]} rotation={[0, PI / 2, 0]}><planeGeometry args={[b - a, 2.6]} /><meshStandardMaterial color="#bfe3ff" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      ))}
      <Box p={[GLASS_X, 2.6, -1.75]} s={[0.08, 0.08, 3.7]} c="#34405a" /><Box p={[GLASS_X, 2.6, 2.35]} s={[0.08, 0.08, 2.5]} c="#34405a" />
      <Box p={[GLASS_X, 1.3, 0.1]} s={[0.08, 2.6, 0.06]} c="#34405a" />
      <Door angle={doorAngle} />
      {/* open office */}
      {COLLEAGUES.map(([x, z], i) => <React.Fragment key={i}><Desk x={x} z={z + 0.8} /><Laptop x={x} z={z + 0.8} /><Chair x={x} z={z} /></React.Fragment>)}
      <Desk x={EMP_SEAT[0]} z={EMP_SEAT[1] + 0.8} /><Laptop x={EMP_SEAT[0]} z={EMP_SEAT[1] + 0.8} /><Chair x={EMP_SEAT[0]} z={EMP_SEAT[1]} />
      {/* the nothing room: one desk, one chair, one clock */}
      <Desk x={ROOM_DESK[0]} z={ROOM_DESK[1]} ry={PI / 2} w={1.4} d={0.7} />
      <Chair x={ROOM_SEAT[0] + 0.02} z={ROOM_SEAT[1]} ry={1.5 * PI} />
      <Clock t={t} x={7.3} y={2.1} z={-3.84} />
      <Letter t={t} />
    </>
  );
}

// ---------- camera ----------
function camAt(t, E) {
  let i = 0;
  while (i < CUTS.length - 2 && t >= CUTS[i + 1]) i++;
  const u = (t - CUTS[i]) / (CUTS[i + 1] - CUTS[i]), e = ease(u);
  let p, l;
  switch (i) {
    case 0: p = [lerp(-1, 0.5, e), lerp(4.2, 2.8, e), lerp(15, 11, e)]; l = [0, 1.1, -1]; break;
    case 1: p = [lerp(-3.4, -2.6, u), 1.6, 3.4]; l = [-2.4, 1.2, -0.8]; break;
    case 2: { const cx = clamp(E.x - 0.8, -3, 3.4); p = [cx, 1.5, 3.6]; l = [cx + 2.2, 1.3, 0.5]; break; }
    case 3: p = [lerp(8.6, 8.0, u), 1.55, lerp(2.6, 1.8, u)]; l = [6.2, 1.1, -0.6]; break;
    case 4: p = [7.7, 1.6, 0.9]; l = [lerp(2.5, -0.5, u), 1.3, -1.6]; break;
    case 5: p = [lerp(6.4, 6.6, u), 1.5, 0.5]; l = [6.9, 1.3, -0.9]; break;
    case 6: { const a = lerp(-0.8, 0.25, u); p = [6.9 + 3.2 * Math.sin(a), 2.0, -0.9 + 3.2 * Math.cos(a)]; l = [6.9, 1.2, -0.9]; break; }
    case 7: p = [lerp(6.1, 6.4, u), lerp(1.45, 1.4, u), lerp(0.1, -0.1, u)]; l = [6.9, 1.35, -0.9]; break;
    case 8: p = [lerp(6.4, 6.1, u), lerp(3.2, 2.6, u), lerp(0.6, -0.3, u)]; l = [5.95, 0.78, -1.15]; break;
    default: p = [lerp(7.4, 1.5, e), lerp(1.8, 3.6, e), lerp(3.2, 12.5, e)]; l = [lerp(6.6, 1.8, e), 1.3, lerp(-0.8, -1.2, e)];
  }
  p = [p[0] + Math.sin(t * 1.3) * 0.015, p[1] + Math.sin(t * 1.9 + 1) * 0.012, p[2]];
  return {p, l};
}
function Rig({t, E}) {
  const {camera} = useThree();
  const c = camAt(t, E);
  camera.position.set(...c.p);
  camera.lookAt(...c.l);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
}

export function Scene({t}) {
  const L = tod(t);
  const E = employee(t), M = manager(t);
  return (
    <>
      <color attach="background" args={['#' + L.sky.clone().multiplyScalar(L.out).getHexString()]} />
      <ambientLight intensity={L.amb} color="#ffffff" />
      <directionalLight position={[4, 9, 8]} intensity={L.sun} color={'#' + L.warm.getHexString()} />
      <hemisphereLight args={['#ffffff', '#445', 0.25 * L.out]} />
      <Rig t={t} E={E} />
      <World t={t} L={L} />
      <Stick {...E} shirt="#4a7bd0" skin="#f6e7c9" hair="#1b1a24" pants="#2c2a49" glasses />
      {M && <Stick {...M} shirt="#2a2d49" pants="#23253a" skin="#f2dcbc" hair="#b9b6c0" tie="#d94a3f" />}
      {COLLEAGUES.map(([x, z], i) => {
        const lg = laugh(t, i), typ = Math.sin(t * (8 + i) + i);
        return (
          <Stick key={i} x={x} z={z} rot={0} sit={1} shirt={SHIRTS[i]} hair={HAIRS[i]} skin={i % 3 === 1 ? '#e9c6a0' : '#f6e7c9'}
            arms={{l: [-1.1 + typ * 0.05, 0.05, -0.6], r: [-1.1 - typ * 0.05, -0.05, -0.6 + typ * 0.1]}}
            headX={lg * Math.sin(t * 13 + i) * 0.12} mouth={lg > 0.1 ? 1 : 0.4} />
        );
      })}
    </>
  );
}
