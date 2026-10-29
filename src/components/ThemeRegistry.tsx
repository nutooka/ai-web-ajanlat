"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { LazyMotion, MotionConfig } from "motion/react";
import { theme } from "@/theme/theme";

const loadMotionFeatures = () => import("./motionFeatures").then((module) => module.default);

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MotionConfig reducedMotion="user">
        {/* Animation features load after first paint; `strict` makes a stray full `motion.*` component throw. */}
        <LazyMotion features={loadMotionFeatures} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </ThemeProvider>
  );
}
