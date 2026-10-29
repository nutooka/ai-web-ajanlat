"use client";

import Box from "@mui/material/Box";
import { WAVE_PATH } from "@/components/WaveDivider";
import { palette } from "@/theme/tokens";

/** Wavy bottom edge of the planner header; the brand-gradient stroke along the crest is the progress bar. */
export function WaveProgress({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Box
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      sx={{ background: palette.ink, lineHeight: 0 }}
    >
      <Box component="svg" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden sx={{ display: "block", width: "100%", height: { xs: 22, md: 30 } }}>
        <path d={`${WAVE_PATH} L400,70 L0,70 Z`} fill={palette.paper} />
        <path d={WAVE_PATH} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={4} vectorEffect="non-scaling-stroke" />
        <defs>
          <linearGradient id="wave-progress-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FFB547" />
            <stop offset="100%" stopColor="#FF5E7E" />
          </linearGradient>
          <clipPath id="wave-progress-clip">
            <Box
              component="rect"
              x={0}
              y={0}
              height={70}
              width={clamped * 4}
              sx={{ transition: "width .5s cubic-bezier(.22,1,.36,1)", "@media (prefers-reduced-motion: reduce)": { transition: "none" } }}
            />
          </clipPath>
        </defs>
        <path
          d={WAVE_PATH}
          fill="none"
          stroke="url(#wave-progress-gradient)"
          strokeWidth={4}
          vectorEffect="non-scaling-stroke"
          clipPath="url(#wave-progress-clip)"
        />
      </Box>
    </Box>
  );
}
