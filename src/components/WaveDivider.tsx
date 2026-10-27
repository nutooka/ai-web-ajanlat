"use client";

import Box from "@mui/material/Box";
import { useId } from "react";

/** The one wave curve used everywhere (same as the pricing card header edge). */
export const WAVE_PATH = "M0,38 C70,74 140,6 220,30 C290,52 340,58 400,24";

interface WaveDividerProps {
  /** Colour above the wave (the section that ends). */
  from: string;
  /** Colour below the wave (the section that starts). */
  to: string;
  /** Mirror horizontally for rhythm between consecutive dividers. */
  flip?: boolean;
  /** Draw the thin brand-gradient line along the crest. */
  line?: boolean;
  height?: number;
}

/** Liquid section boundary: one curve, optional gradient crest line. Decorative only. */
export function WaveDivider({ from, to, flip = false, line = true, height = 64 }: WaveDividerProps) {
  const id = useId().replace(/:/g, "");
  return (
    <Box aria-hidden sx={{ background: from, lineHeight: 0, transform: flip ? "scaleX(-1)" : undefined }}>
      <Box component="svg" viewBox="0 0 400 70" preserveAspectRatio="none" sx={{ display: "block", width: "100%", height }}>
        <defs>
          <linearGradient id={`wave-${id}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#2BD2C9" />
            <stop offset="50%" stopColor="#FF8A62" />
            <stop offset="100%" stopColor="#D4FF3A" />
          </linearGradient>
        </defs>
        <path d={`${WAVE_PATH} L400,70 L0,70 Z`} fill={to} />
        {line && <path d={WAVE_PATH} fill="none" stroke={`url(#wave-${id})`} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />}
      </Box>
    </Box>
  );
}
