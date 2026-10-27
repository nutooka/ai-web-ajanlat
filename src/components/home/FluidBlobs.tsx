"use client";

import Box from "@mui/material/Box";
import { motion, useReducedMotion } from "motion/react";

const SHAPES = [
  "42% 58% 70% 30% / 45% 45% 55% 55%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "35% 65% 55% 45% / 50% 60% 40% 50%",
];

type Blob = { size: number; gradient: string; duration: number; top?: string; right?: string; bottom?: string; left?: string };

const VARIANTS: Record<"hero" | "corner", Blob[]> = {
  // Behind the hero preview card's outer edge only – never under its text.
  hero: [
    { size: 260, top: "-8%", right: "-6%", gradient: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)", duration: 14 },
    { size: 190, bottom: "-10%", left: "-8%", gradient: "linear-gradient(135deg, #2BD2C9 0%, #3A7BFF 100%)", duration: 17 },
    { size: 110, top: "38%", right: "-12%", gradient: "linear-gradient(135deg, #D4FF3A 0%, #2BD98A 100%)", duration: 12 },
  ],
  // A single shape peeking into the corner of a dark panel.
  corner: [{ size: 150, top: "-60px", right: "-60px", gradient: "linear-gradient(135deg, #FFB547 0%, #FF5E7E 100%)", duration: 16 }],
};

/** Slowly morphing organic shapes behind the hero preview. Purely decorative. */
export function FluidBlobs({ variant = "hero" }: { variant?: "hero" | "corner" }) {
  const reduce = useReducedMotion();

  return (
    <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {VARIANTS[variant].map((blob, index) => {
        const { size, gradient, duration, ...position } = blob;
        return (
          <motion.div
            key={index}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={
              reduce
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, borderRadius: [...SHAPES, SHAPES[0]], rotate: [0, 12, -6, 0], y: [0, -14, 8, 0] }
            }
            transition={
              reduce
                ? { duration: 0.4 }
                : {
                    scale: { duration: 0.9, delay: 0.2 + index * 0.12, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.6, delay: 0.2 + index * 0.12 },
                    default: { duration, repeat: Infinity, ease: "easeInOut" },
                  }
            }
            style={{ position: "absolute", width: size, height: size, background: gradient, borderRadius: SHAPES[0], ...position }}
          />
        );
      })}
    </Box>
  );
}
