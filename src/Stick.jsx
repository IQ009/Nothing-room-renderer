import React from 'react';
import * as THREE from 'three';
import {lerp} from './timeline';

const INK = '#1a1626';
// capsule with a dark back-face shell = cartoon outline
function Cap({r, len, color, pos = [0, 0, 0], o = 0.035}) {
  return (
    <group position={pos}>
      <mesh><capsuleGeometry args={[r, len, 4, 10]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh scale={[1 + o / r, 1 + o / (r + len / 2), 1 + o / r]}><capsuleGeometry args={[r, len, 4, 10]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
    </group>
  );
}
function Ball({r, color, pos = [0, 0, 0], o = 0.012}) {
  return (
    <group position={pos}>
      <mesh><sphereGeometry args={[r, 20, 14]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
      <mesh scale={1 + o / r}><sphereGeometry args={[r, 20, 14]} /><meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
    </group>
  );
}

/**
 * Stylized stickman: round head, capsule torso and limbs, feet planted by the walk phase.
 * Local +z is "forward". Joint rotations: negative x swings a limb forward.
 * arms: {l:[shoulderX, shoulderZ, elbowX], r:[...]} overrides the walk swing.
 */
export function Stick({x = 0, y = 0, z = 0, rot = 0, shirt = '#4a7bd0', skin = '#f6e7c9', hair = '#1b1a24', pants = '#2c2a49',
  tie, glasses, bald, phase = 0, amp = 0, sit = 0, arms, headX = 0, headY = 0, mouth = 0.3}) {
  const hipY = lerp(0.95, 0.5, sit);
  const leg = (s) => {
    const sw = Math.sin(phase + (s > 0 ? 0 : Math.PI));
    const thigh = lerp(-sw * 0.65 * amp, -1.5, sit);
    const shin = lerp(Math.max(0, sw) * 0.7 * amp, 1.5, sit);
    return (
      <group key={s} position={[s * 0.1, 0, 0]} rotation={[thigh, 0, 0]}>
        <Cap r={0.075} len={0.3} color={pants} pos={[0, -0.22, 0]} />
        <group position={[0, -0.45, 0]} rotation={[shin, 0, 0]}>
          <Cap r={0.065} len={0.3} color={pants} pos={[0, -0.22, 0]} />
          <mesh position={[0, -0.47, 0.06]}><boxGeometry args={[0.13, 0.07, 0.26]} /><meshStandardMaterial color="#17141f" /></mesh>
        </group>
      </group>
    );
  };
  const arm = (s) => {
    const sw = Math.sin(phase + (s > 0 ? Math.PI : 0));
    const o = arms && (s > 0 ? arms.r : arms.l);
    const sx = o ? o[0] : -sw * 0.6 * amp;
    const sz = o ? o[1] : s * 0.1;
    const el = o ? o[2] : -0.15 - Math.max(0, -sw) * 0.5 * amp;
    return (
      <group key={s} position={[s * 0.25, 0.55, 0]} rotation={[sx, 0, sz]}>
        <Cap r={0.055} len={0.24} color={shirt} pos={[0, -0.17, 0]} />
        <group position={[0, -0.34, 0]} rotation={[el, 0, 0]}>
          <Cap r={0.05} len={0.24} color={shirt} pos={[0, -0.17, 0]} />
          <Ball r={0.05} color={skin} pos={[0, -0.36, 0]} />
        </group>
      </group>
    );
  };
  const m = THREE.MathUtils.clamp(mouth, -1, 1);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <group position={[0, hipY, 0]}>
        {leg(-1)}{leg(1)}
        <Cap r={0.17} len={0.36} color={shirt} pos={[0, 0.34, 0]} />
        {tie && <mesh position={[0, 0.4, 0.178]}><boxGeometry args={[0.06, 0.34, 0.02]} /><meshStandardMaterial color={tie} /></mesh>}
        {arm(-1)}{arm(1)}
        <group position={[0, 0.9, 0]} rotation={[headX, headY, 0]}>
          <Ball r={0.21} color={skin} />
          {!bald && <mesh position={[0, 0.02, -0.01]} rotation={[-0.25, 0, 0]}><sphereGeometry args={[0.226, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshStandardMaterial color={hair} roughness={1} /></mesh>}
          <mesh position={[-0.075, 0.03, 0.195]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={INK} /></mesh>
          <mesh position={[0.075, 0.03, 0.195]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color={INK} /></mesh>
          {glasses && [-1, 1].map((s) => <mesh key={s} position={[s * 0.075, 0.03, 0.2]}><torusGeometry args={[0.05, 0.008, 6, 16]} /><meshBasicMaterial color={INK} /></mesh>)}
          <mesh position={[0, -0.075, 0.2]} rotation={[0, 0, m >= 0 ? Math.PI : 0]} scale={[1, Math.max(0.12, Math.abs(m)), 1]}>
            <torusGeometry args={[0.055, 0.011, 6, 14, Math.PI]} /><meshBasicMaterial color={INK} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
