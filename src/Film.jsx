import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Scene} from './Scene';
import {DUR, clamp} from './timeline';

export const Film = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const black = Math.max(1 - clamp(t / 0.5), clamp((t - (DUR - 0.9)) / 0.9));
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 50, position: [0, 2, 10], near: 0.1, far: 80}}>
        <Scene t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: black, pointerEvents: 'none'}} />
      <Audio src={staticFile('soundtrack.mp3')} />
    </AbsoluteFill>
  );
};
