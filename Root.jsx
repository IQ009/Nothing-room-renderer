import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {DUR, FPS} from './timeline';
export const Root = () => (
  <Composition id="NothingRoom" component={Film} durationInFrames={Math.round(DUR * FPS)} fps={FPS} width={1080} height={1920} />
);
