"use client";

import type React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Using LazyMotion with domAnimation helps reduce bundle size
  // by only loading the animation features needed.
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
