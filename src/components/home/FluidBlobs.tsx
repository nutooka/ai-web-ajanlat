"use client";

import Box from "@mui/material/Box";
import { Blob, type BlobTone } from "@/components/Blob";
import type { PackageId } from "@/features/pricing/types";

/** The three packages behind the home preview card: the one on show grows and comes forward. */
const HERO: { tone: PackageId; size: number; duration: number; position: { top?: string; right?: string; bottom?: string; left?: string } }[] = [
  { tone: "standard", size: 260, duration: 14, position: { top: "-8%", right: "-6%" } },
  { tone: "basic", size: 190, duration: 17, position: { bottom: "-10%", left: "-8%" } },
  { tone: "premium", size: 150, duration: 12, position: { top: "34%", right: "-12%" } },
];

export function FluidBlobs({ variant = "hero", active, tone = "neutral", scale = 1 }: { variant?: "hero" | "corner"; active?: PackageId; tone?: BlobTone; scale?: number }) {
  return (
    <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {variant === "hero"
        ? HERO.map((blob, index) => {
            const on = !active || active === blob.tone;
            return (
              <Blob
                key={blob.tone}
                tone={blob.tone}
                size={blob.size}
                position={blob.position}
                duration={blob.duration}
                delay={0.2 + index * 0.12}
                scale={active ? (on ? 1.15 : 0.85) : 1}
                opacity={on ? 1 : 0.78}
                zIndex={on ? 1 : 0}
              />
            );
          })
        : (
          // A single shape in the corner of a dark panel; its colour and size carry the meaning.
          <Blob tone={tone} size={150} position={{ top: "-60px", right: "-60px" }} scale={scale} duration={16} delay={0.2} />
        )}
    </Box>
  );
}
