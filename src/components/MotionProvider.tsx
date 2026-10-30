"use client";

import { LazyMotion, MotionConfig } from "motion/react";

const loadMotionFeatures = () => import("./motionFeatures").then((module) => module.default);

/**
 * Only the planner and the offer pages animate with motion. Keeping this out of the root layout
 * means the home page and the content pages ship no animation library at all.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Animation features load after first paint; `strict` makes a stray full `motion.*` component throw. */}
      <LazyMotion features={loadMotionFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
